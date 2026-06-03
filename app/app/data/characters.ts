// Warwick's friends — the "Pokédex".
// Placeholder art: every friend is a small Warwick spider (/warwick.jpg).
// Swap `image` for distinct per-character transparent PNGs when art is ready.

export type Rarity = "common" | "uncommon" | "rare" | "hero";

export interface WarwickCharacter {
  id: string; // stable, never reused
  name: string; // placeholder names — Russ to rename
  rarity: Rarity;
  image: string; // small Warwick spider art
  blurb: string; // shown on catch (1–2 warm sentences)
}

const SPIDER = "/warwick.jpg"; // shared placeholder until distinct art lands

export const CHARACTERS: WarwickCharacter[] = [
  {
    id: "warwick",
    name: "Warwick",
    rarity: "hero",
    image: SPIDER,
    blurb: "The fluffiest little spider with the biggest heart. You found him!",
  },
  {
    id: "webby",
    name: "Webby",
    rarity: "hero",
    image: SPIDER,
    blurb: "Warwick's sparkliest little friend, spun just for you.",
  },
  {
    id: "glimmer",
    name: "Glimmer",
    rarity: "hero",
    image: SPIDER,
    blurb: "A tiny, glittering Warwick with a pinch of magic.",
  },
];

export const characterById = (id: string): WarwickCharacter | undefined =>
  CHARACTERS.find((c) => c.id === id);
