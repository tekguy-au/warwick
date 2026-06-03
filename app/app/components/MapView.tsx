"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Fragment, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { LatLng } from "../lib/geo";

export interface HeroMarker {
  id: string;
  lat: number;
  lng: number;
  radiusM: number;
  image: string;
  name: string;
  inRange: boolean;
}

interface MapViewProps {
  player: (LatLng & { accuracy: number }) | null;
  heroes: HeroMarker[];
}

const playerIcon = L.divIcon({
  className: "",
  html: `<div class="ww-player-dot"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const heroIcon = (image: string, inRange: boolean) =>
  L.divIcon({
    className: "",
    html: `<div class="ww-hero-pin ${inRange ? "ww-hero-pin--live" : ""}"><img src="${image}" alt="" /></div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });

export default function MapView({ player, heroes }: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [following, setFollowing] = useState(true);

  const center: [number, number] = player
    ? [player.lat, player.lng]
    : [
        heroes.reduce((s, h) => s + h.lat, 0) / heroes.length,
        heroes.reduce((s, h) => s + h.lng, 0) / heroes.length,
      ];

  // Gently follow the player — but only while "following" is on.
  useEffect(() => {
    if (map && following && player) {
      map.setView([player.lat, player.lng], map.getZoom(), { animate: true });
    }
  }, [map, following, player]);

  // Dragging the map to browse turns following off (so it stops snapping back).
  useEffect(() => {
    if (!map) return;
    const stop = () => setFollowing(false);
    map.on("dragstart", stop);
    return () => {
      map.off("dragstart", stop);
    };
  }, [map]);

  const focusHero = (h: HeroMarker) => {
    setFollowing(false);
    map?.flyTo([h.lat, h.lng], 18, { duration: 0.6 });
  };

  const recenterOnMe = () => {
    if (player && map) {
      setFollowing(true);
      map.flyTo([player.lat, player.lng], 16, { duration: 0.6 });
    }
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={center}
        zoom={16}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />

        {heroes.map((h) => (
          <Fragment key={h.id}>
            <Marker
              position={[h.lat, h.lng]}
              icon={heroIcon(h.image, h.inRange)}
              eventHandlers={{ click: () => focusHero(h) }}
            />
          </Fragment>
        ))}

        {player && <Marker position={[player.lat, player.lng]} icon={playerIcon} />}
      </MapContainer>

      {/* Recenter-on-me button */}
      {player && (
        <button
          onClick={recenterOnMe}
          aria-label="Centre on me"
          className={`absolute right-3 top-20 z-[1000] w-12 h-12 rounded-full shadow-md flex items-center justify-center text-xl active:scale-95 ${
            following ? "bg-blue-500 text-white" : "bg-white text-blue-600"
          }`}
        >
          📍
        </button>
      )}
    </div>
  );
}
