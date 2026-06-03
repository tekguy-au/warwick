"use client";

import Image from "next/image";

export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#fdf6ee]">
      <div className="relative w-40 h-40 mb-6 drop-shadow-xl">
        <Image src="/warwick.jpg" alt="Warwick the spider" fill className="object-contain rounded-full" priority />
      </div>
      <h1 className="text-4xl font-extrabold text-amber-900 mb-3">Help Noah find Warwick ✨</h1>
      <p className="text-lg text-amber-800 max-w-sm leading-relaxed mb-8">
        Warwick and his friends are hiding all around the neighbourhood. Go for a
        walk with a grown-up and help Noah find them!
      </p>
      <button
        onClick={onStart}
        className="bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold rounded-full px-10 py-4 shadow-lg transition active:scale-95"
      >
        Start exploring →
      </button>
      <p className="text-sm text-amber-700/70 mt-6 max-w-xs">
        We&apos;ll ask to use your location so we can find Warwick&apos;s friends near you.
      </p>
    </main>
  );
}
