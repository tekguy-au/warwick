"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FIXED_SPAWNS } from "../data/fixed-spawns";
import { characterById } from "../data/characters";
import { haversineMeters, distanceLabel, type LatLng } from "../lib/geo";
import StartScreen from "./StartScreen";
import GpsFallback from "./GpsFallback";
import type { HeroMarker } from "./MapView";

// Leaflet touches `window`, so the map is client-only (no SSR).
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-amber-700">Loading map…</div>
  ),
});

type Phase = "start" | "locating" | "playing" | "denied" | "unavailable";
type Player = LatLng & { accuracy: number };

export default function Game() {
  const [phase, setPhase] = useState<Phase>("start");
  const [player, setPlayer] = useState<Player | null>(null);
  const watchId = useRef<number | null>(null);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPhase("unavailable");
      return;
    }
    setPhase("locating");
    stopWatch();
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPlayer({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setPhase("playing");
      },
      (err) => {
        setPhase(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 },
    );
  }, [stopWatch]);

  // Pause GPS when the tab is hidden (battery), resume on return.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopWatch();
      else if (phase === "playing" || phase === "locating") startWatch();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase, startWatch, stopWatch]);

  useEffect(() => () => stopWatch(), [stopWatch]);

  // Heroes with live distance + in-range flag.
  const heroes: (HeroMarker & { distanceM: number })[] = useMemo(() => {
    return FIXED_SPAWNS.map((s) => {
      const ch = characterById(s.characterId);
      const distanceM = player ? haversineMeters(player, { lat: s.lat, lng: s.lng }) : Infinity;
      // Be tolerant of GPS accuracy when deciding "in range".
      const effRadius = player ? Math.max(s.radiusM, player.accuracy) : s.radiusM;
      return {
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        radiusM: s.radiusM,
        emoji: ch?.emoji ?? "❓",
        name: ch?.name ?? s.id,
        distanceM,
        inRange: distanceM <= effRadius,
      };
    });
  }, [player]);

  const nearest = useMemo(
    () => heroes.reduce((a, b) => (b.distanceM < a.distanceM ? b : a), heroes[0]),
    [heroes],
  );
  const liveHero = heroes.find((h) => h.inRange) ?? null;

  if (phase === "start") return <StartScreen onStart={startWatch} />;
  if (phase === "denied") return <GpsFallback kind="denied" onRetry={startWatch} />;
  if (phase === "unavailable") return <GpsFallback kind="unavailable" onRetry={startWatch} />;
  if (phase === "locating" && !player) return <GpsFallback kind="locating" onRetry={startWatch} />;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView player={player} heroes={heroes} />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-3 flex justify-center">
        <div className="pointer-events-auto bg-white/85 backdrop-blur rounded-full px-5 py-2 shadow-md text-center">
          {liveHero ? (
            <span className="font-bold text-amber-700">
              {liveHero.emoji} You found {liveHero.name}! ✨
            </span>
          ) : (
            <span className="text-amber-800 font-semibold">
              Nearest friend: {nearest.emoji} {distanceLabel(nearest.distanceM)} away
            </span>
          )}
        </div>
      </div>

      {player && (
        <div className="absolute bottom-3 left-3 text-[11px] text-amber-900/60 bg-white/70 rounded px-2 py-1">
          GPS ±{Math.round(player.accuracy)} m
        </div>
      )}
    </div>
  );
}
