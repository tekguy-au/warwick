"use client";

import { useEffect, useRef, useState } from "react";

interface CatchMiniGameProps {
  image: string;
  onCaught: () => void;
}

// A glowing web-ring pulses smaller then bigger. Tap when it's in the
// honey "catch zone". Deliberately generous — under-8s should nearly always win,
// and a miss is never a failure, just "try again".
const CATCH_MIN = 0.18; // ring scale sweet-spot lower bound
const CATCH_MAX = 0.5; // upper bound (wide = forgiving)
const PERIOD = 1500; // ms for a full shrink+grow cycle

export default function CatchMiniGame({ image, onCaught }: CatchMiniGameProps) {
  const [scale, setScale] = useState(1);
  const [wobble, setWobble] = useState(false);
  const [caught, setCaught] = useState(false);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const start = performance.now();
    const loop = (t: number) => {
      // triangle wave 1 -> 0.1 -> 1
      const phase = ((t - start) % PERIOD) / PERIOD; // 0..1
      const tri = phase < 0.5 ? 1 - phase * 2 : (phase - 0.5) * 2; // 1..0..1
      setScale(0.1 + tri * 0.9);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const handleTap = () => {
    if (caught) return;
    // Reduced motion (or just being kind): any tap inside the zone — or any tap
    // at all if motion is off — succeeds.
    const inZone = reduced.current || (scale >= CATCH_MIN && scale <= CATCH_MAX);
    if (inZone) {
      setCaught(true);
      if (raf.current) cancelAnimationFrame(raf.current);
      window.setTimeout(onCaught, 1100); // let the celebration play
    } else {
      setWobble(true);
      window.setTimeout(() => setWobble(false), 450);
    }
  };

  return (
    <button
      onClick={handleTap}
      className="relative flex items-center justify-center w-72 h-72 mx-auto select-none focus:outline-none"
      aria-label="Tap to catch"
    >
      {/* shrinking web ring */}
      {!caught && (
        <span
          className="absolute rounded-full border-4 border-amber-400/80"
          style={{
            width: 240,
            height: 240,
            transform: `scale(${scale})`,
            boxShadow: "0 0 24px rgba(245,196,81,0.6)",
          }}
        />
      )}
      {/* catch-zone hint ring */}
      <span
        className="absolute rounded-full border-2 border-dashed border-amber-300/50"
        style={{ width: 240 * CATCH_MAX, height: 240 * CATCH_MAX }}
      />
      {/* the little Warwick spider */}
      <img
        src={image}
        alt=""
        className={`relative w-28 h-28 rounded-full object-cover border-4 border-amber-200 shadow-lg transition-transform ${
          caught ? "scale-110" : wobble ? "ww-wobble" : ""
        }`}
      />
      {caught && (
        <>
          <span className="absolute -top-2 -right-2 text-5xl">🕸️</span>
          <span className="absolute text-7xl animate-ping opacity-60">✨</span>
        </>
      )}
    </button>
  );
}
