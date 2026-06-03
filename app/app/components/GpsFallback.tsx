"use client";

interface GpsFallbackProps {
  kind: "denied" | "unavailable" | "locating";
  onRetry: () => void;
}

const COPY = {
  denied: {
    emoji: "🧭",
    title: "We need to know where you are",
    body: "To find Warwick's friends, please allow location access in your browser, then try again.",
    cta: "Try again",
  },
  unavailable: {
    emoji: "🌳",
    title: "Warwick's a bit lost!",
    body: "We can't find your location right now. Head outside where there's open sky and try again.",
    cta: "Try again",
  },
  locating: {
    emoji: "🔎",
    title: "Finding you…",
    body: "Getting a fix on your location. This only takes a moment.",
    cta: "",
  },
} as const;

export default function GpsFallback({ kind, onRetry }: GpsFallbackProps) {
  const c = COPY[kind];
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#fdf6ee]">
      <div className="text-6xl mb-4 animate-bounce">{c.emoji}</div>
      <h1 className="text-2xl font-extrabold text-amber-900 mb-2">{c.title}</h1>
      <p className="text-lg text-amber-800 max-w-sm leading-relaxed mb-8">{c.body}</p>
      {c.cta && (
        <button
          onClick={onRetry}
          className="bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold rounded-full px-8 py-3 shadow-lg transition active:scale-95"
        >
          {c.cta}
        </button>
      )}
    </main>
  );
}
