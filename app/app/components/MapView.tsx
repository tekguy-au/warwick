"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import type { LatLng } from "../lib/geo";

export interface HeroMarker {
  id: string;
  lat: number;
  lng: number;
  radiusM: number;
  emoji: string;
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

const heroIcon = (emoji: string, inRange: boolean) =>
  L.divIcon({
    className: "",
    html: `<div class="ww-hero-pin ${inRange ? "ww-hero-pin--live" : ""}">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

/** Keep the map gently centred on the player as they move. */
function FollowPlayer({ player }: { player: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (player) map.setView([player.lat, player.lng], map.getZoom(), { animate: true });
  }, [player, map]);
  return null;
}

export default function MapView({ player, heroes }: MapViewProps) {
  // Centre on the player if we have them, else the middle of the hero spots.
  const center: [number, number] = player
    ? [player.lat, player.lng]
    : [
        heroes.reduce((s, h) => s + h.lat, 0) / heroes.length,
        heroes.reduce((s, h) => s + h.lng, 0) / heroes.length,
      ];

  return (
    <MapContainer
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
          <Circle
            center={[h.lat, h.lng]}
            radius={h.radiusM}
            pathOptions={{
              color: h.inRange ? "#c8860d" : "#d9b382",
              fillColor: h.inRange ? "#f5c451" : "#f3e3c6",
              fillOpacity: h.inRange ? 0.35 : 0.18,
              weight: 2,
            }}
          />
          <Marker position={[h.lat, h.lng]} icon={heroIcon(h.emoji, h.inRange)} />
        </Fragment>
      ))}

      {player && (
        <>
          <Circle
            center={[player.lat, player.lng]}
            radius={Math.max(player.accuracy, 8)}
            pathOptions={{ color: "#3b82f6", fillColor: "#93c5fd", fillOpacity: 0.15, weight: 1 }}
          />
          <Marker position={[player.lat, player.lng]} icon={playerIcon} />
        </>
      )}

      <FollowPlayer player={player} />
    </MapContainer>
  );
}
