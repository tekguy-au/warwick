"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FIXED_SPAWNS } from "../data/fixed-spawns";
import { characterById, CHARACTERS } from "../data/characters";
import { haversineMeters, distanceLabel, type LatLng } from "../lib/geo";
import { useSave } from "../lib/save";
import StartScreen from "./StartScreen";
import GpsFallback from "./GpsFallback";
import Encounter from "./Encounter";
import FriendBook from "./FriendBook";
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
type Hero = HeroMarker & { distanceM: number; characterId: string };

export default function Game() {
  const [phase, setPhase] = useState<Phase>("start");
  const [player, setPlayer] = useState<Player | null>(null);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const watchId = useRef<number | null>(null);
  const { state: save, recordCatch } = useSave();

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
  const heroes: Hero[] = useMemo(() => {
    return FIXED_SPAWNS.map((s) => {
      const ch = characterById(s.characterId);
      const distanceM = player ? haversineMeters(player, { lat: s.lat, lng: s.lng }) : Infinity;
      const effRadius = player ? Math.max(s.radiusM, player.accuracy) : s.radiusM;
      return {
        id: s.id,
        characterId: s.characterId,
        lat: s.lat,
        lng: s.lng,
        radiusM: s.radiusM,
        image: ch?.image ?? "/warwick.jpg",
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
  const caughtCount = Object.keys(save.caught).length;
  const encounterChar = encounterId ? characterById(encounterId) : undefined;

  if (phase === "start") return <StartScreen onStart={startWatch} />;
  if (phase === "denied") return <GpsFallback kind="denied" onRetry={startWatch} />;
  if (phase === "unavailable") return <GpsFallback kind="unavailable" onRetry={startWatch} />;
  if (phase === "locating" && !player) return <GpsFallback kind="locating" onRetry={startWatch} />;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView player={player} heroes={heroes} />

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-3 flex justify-center">
        <div className="pointer-events-auto bg-white/85 backdrop-blur rounded-full px-5 py-2 shadow-md text-center flex items-center gap-2">
          {liveHero ? (
            <span className="font-bold text-amber-700 flex items-center gap-2">
              <img src={liveHero.image} alt="" className="w-6 h-6 rounded-full object-cover" />
              {liveHero.name} is here!
            </span>
          ) : (
            <span className="text-amber-800 font-semibold flex items-center gap-2">
              <img src={nearest.image} alt="" className="w-6 h-6 rounded-full object-cover" />
              Nearest friend: {distanceLabel(nearest.distanceM)} away
            </span>
          )}
        </div>
      </div>

      {/* Catch button (only when in range) */}
      {liveHero && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center px-6">
          <button
            onClick={() => setEncounterId(liveHero.characterId)}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xl font-extrabold rounded-full px-12 py-4 shadow-xl active:scale-95 animate-pulse"
          >
            Catch {liveHero.name}! 🕷️
          </button>
        </div>
      )}

      {/* Friend Book button */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center">
        <button
          onClick={() => setBookOpen(true)}
          className="pointer-events-auto bg-white/90 text-amber-800 font-bold rounded-full px-6 py-2 shadow-md active:scale-95"
        >
          📖 Friend Book · {caughtCount}/{CHARACTERS.length}
        </button>
      </div>

      {player && (
        <div className="absolute bottom-3 left-3 text-[11px] text-amber-900/60 bg-white/70 rounded px-2 py-1">
          GPS ±{Math.round(player.accuracy)} m
        </div>
      )}

      {/* Overlays */}
      {encounterChar && (
        <Encounter
          character={encounterChar}
          onCaught={() => {
            recordCatch(encounterChar.id);
            setEncounterId(null);
          }}
          onClose={() => setEncounterId(null)}
        />
      )}
      {bookOpen && <FriendBook save={save} onClose={() => setBookOpen(false)} />}
    </div>
  );
}
