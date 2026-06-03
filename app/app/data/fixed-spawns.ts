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

  // ⚠️ TEMP WA TEST MARKERS — REMOVE BEFORE LAUNCH.
  // 5 Warwicks scattered across Western Australia, visible when zoomed out.
  { id: "wa-1", characterId: "warwick", lat: -31.9523, lng: 115.8613, radiusM: 40, hint: "Perth", oneTime: false },
  { id: "wa-2", characterId: "webby", lat: -17.9614, lng: 122.2359, radiusM: 40, hint: "Broome", oneTime: false },
  { id: "wa-3", characterId: "glimmer", lat: -30.749, lng: 121.466, radiusM: 40, hint: "Kalgoorlie", oneTime: false },
  { id: "wa-4", characterId: "warwick", lat: -35.0269, lng: 117.8837, radiusM: 40, hint: "Albany", oneTime: false },
  { id: "wa-5", characterId: "webby", lat: -28.7744, lng: 114.6149, radiusM: 40, hint: "Geraldton", oneTime: false },

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
