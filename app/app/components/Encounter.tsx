"use client";

import { useState } from "react";
import CatchMiniGame from "./CatchMiniGame";
import type { WarwickCharacter } from "../data/characters";

interface EncounterProps {
  character: WarwickCharacter;
  onCaught: () => void; // record + close
  onClose: () => void; // back out without catching
}

export default function Encounter({ character, onCaught, onClose }: EncounterProps) {
  const [done, setDone] = useState(false);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center px-6 text-center bg-[#fdf6ee]/95 backdrop-blur">
      {!done ? (
        <>
          <h2 className="text-2xl font-extrabold text-amber-900 mb-1">
            You found {character.name}!
          </h2>
          <p className="text-amber-800 mb-6">Tap when the web ring is small to catch!</p>

          <CatchMiniGame image={character.image} onCaught={() => setDone(true)} />

          <button
            onClick={onClose}
            className="mt-8 text-amber-700/70 underline text-sm"
          >
            Maybe later
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center animate-[ww-pop_0.4s_ease-out]">
          <div className="text-5xl mb-3">🎉</div>
          <img
            src={character.image}
            alt=""
            className="w-32 h-32 rounded-full object-cover border-4 border-amber-300 shadow-xl mb-4"
          />
          <h2 className="text-2xl font-extrabold text-amber-900 mb-1">
            {character.name} joined your Friend Book!
          </h2>
          <p className="text-amber-800 max-w-xs mb-8">{character.blurb}</p>
          <button
            onClick={onCaught}
            className="bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold rounded-full px-10 py-3 shadow-lg active:scale-95"
          >
            Yay! Keep exploring →
          </button>
        </div>
      )}
    </div>
  );
}
