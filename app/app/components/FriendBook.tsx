"use client";

import { CHARACTERS } from "../data/characters";
import type { SaveState } from "../lib/save";

interface FriendBookProps {
  save: SaveState;
  onClose: () => void;
}

export default function FriendBook({ save, onClose }: FriendBookProps) {
  const caughtCount = Object.keys(save.caught).length;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[#fdf6ee]">
      <header className="flex items-center justify-between px-5 py-4 border-b border-amber-200">
        <div>
          <h2 className="text-xl font-extrabold text-amber-900">Friend Book</h2>
          <p className="text-sm text-amber-700">
            {caughtCount} of {CHARACTERS.length} friends found
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full px-5 py-2 active:scale-95"
        >
          Close
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 overflow-y-auto">
        {CHARACTERS.map((c) => {
          const rec = save.caught[c.id];
          const caught = Boolean(rec);
          return (
            <div
              key={c.id}
              className="flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm"
            >
              <img
                src={c.image}
                alt={caught ? c.name : "Not found yet"}
                className={`w-20 h-20 rounded-full object-cover border-4 ${
                  caught ? "border-amber-300" : "border-amber-100 brightness-0 opacity-20"
                }`}
              />
              <span className="mt-2 font-bold text-amber-900">
                {caught ? c.name : "???"}
              </span>
              {caught && rec.count > 1 && (
                <span className="text-xs text-amber-600">caught {rec.count}×</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
