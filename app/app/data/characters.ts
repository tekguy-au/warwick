// Warwick's friends — the "Pokédex". Phase 0 placeholders (emoji art).
// Swap `emoji` for real transparent-PNG `image` paths when art is ready.

export type Rarity = "common" | "uncommon" | "rare" | "hero";

export interface WarwickCharacter {
  id: string; // stable, never reused
  name: string; // placeholder names — Russ to rename
  rarity: Rarity;
  emoji: string; // Phase 0 stand-in for artwork
  blurb: string; // shown on catch (1–2 warm sentences)
}

export const CHARACTERS: WarwickCharacter[] = [
  {
    id: "warwick",
    name: "Warwick",
    rarity: "hero",
    emoji: "🕷️",
    blurb: "The fluffiest little spider with the biggest heart. You found him!",
  },
  {
    id: "webby",
    name: "Webby",
    rarity: "hero",
    emoji: "🕸️",
    blurb: "Warwick's sparkliest web, spun just for you.",
  },
  {
    id: "glimmer",
    name: "Glimmer",
    rarity: "hero",
    emoji: "✨",
    blurb: "A tiny pinch of Warwick's magic, glittering in the air.",
  },
];

export const characterById = (id: string): WarwickCharacter | undefined =>
  CHARACTERS.find((c) => c.id === id);
