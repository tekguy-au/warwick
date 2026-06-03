// Hero locations — your curated real-world GPS coords.
// Resolved from the Google Maps links you shared (3 Jun 2026).
// Names / catch rules are placeholders — tell me and I'll update.

export interface FixedSpawn {
  id: string;
  characterId: string; // -> characters.ts
  lat: number;
  lng: number;
  radiusM: number; // catch radius
  hint?: string;
  oneTime: boolean; // true = catch once ever
}

export const FIXED_SPAWNS: FixedSpawn[] = [
  {
    id: "loc-1",
    characterId: "warwick",
    lat: -37.7259857,
    lng: 144.9810134,
    radiusM: 40,
    hint: "Location 1",
    oneTime: false,
  },
  {
    id: "loc-2",
    characterId: "webby",
    lat: -37.7241474,
    lng: 144.9152339,
    radiusM: 40,
    hint: "Location 2",
    oneTime: false,
  },
  {
    id: "loc-3",
    characterId: "glimmer",
    lat: -37.622078,
    lng: 145.0409715,
    radiusM: 40,
    hint: "Location 3",
    oneTime: false,
  },

  // ⚠️ TEMP TEST SPOT — REMOVE BEFORE LAUNCH.
  // Planet-sized radius so the Catch button appears anywhere, letting Russ
  // test the catch + Friend Book without travelling to a real location.
  {
    id: "test-anywhere",
    characterId: "warwick",
    lat: -37.7259857,
    lng: 144.9810134,
    radiusM: 20_000_000,
    hint: "Test spot — catch from anywhere",
    oneTime: false,
  },
];
