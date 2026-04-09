import Image from "next/image";

const stories = [
  {
    title: "The Rainy Day Web",
    snippet:
      "Warwick had been planning his best web ever. But then — drip, drop, drip — the rain came. Could a rainy day actually make things better?",
  },
  {
    title: "Warwick Finds a Friend",
    snippet:
      "Nobody wanted to sit next to a spider at the picnic. But Warwick had a secret — the best snacks, and the biggest heart in the whole meadow.",
  },
  {
    title: "Up, Up and Away!",
    snippet:
      "A gust of wind caught Warwick's web and lifted him higher than he'd ever been. Up there, the world looked very small — and very wonderful.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen" style={{ background: "#fdf6ee" }}>

      {/* Hero */}
      <section className="w-full flex flex-col items-center px-6 pt-16 pb-10 text-center">
        <div className="relative w-48 h-48 mb-6 drop-shadow-xl">
          <Image
            src="/warwick.jpg"
            alt="Warwick the spider"
            fill
            className="object-contain rounded-full"
            priority
          />
        </div>
        <h1 className="text-5xl font-extrabold text-amber-900 mb-3 tracking-tight">
          Meet Warwick ✨
        </h1>
        <p className="text-xl text-amber-800 max-w-md leading-relaxed">
          A fluffy little spider with great big eyes — and even bigger adventures. Stories for little ones, full of wonder and warmth.
        </p>
      </section>

      {/* Story Snippets */}
      <section className="w-full max-w-3xl px-6 pb-12">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">
          A little taste of Warwick&apos;s world...
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {stories.map((story) => (
            <div
              key={story.title}
              className="rounded-2xl p-5 shadow-sm border border-amber-100"
              style={{ background: "#fff8ef" }}
            >
              <h3 className="text-lg font-bold text-amber-900 mb-2">{story.title}</h3>
              <p className="text-sm text-amber-800 leading-relaxed">{story.snippet}</p>
              <p className="mt-3 text-xs text-amber-500 font-semibold uppercase tracking-wide">
                Coming soon
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription */}
      <section
        className="w-full flex flex-col items-center px-6 py-14 text-center"
        style={{ background: "#f5e6d0" }}
      >
        <div className="text-4xl mb-3">🕷️</div>
        <h2 className="text-3xl font-extrabold text-amber-900 mb-3">
          Be the first to hear from Warwick
        </h2>
        <p className="text-amber-800 max-w-sm mb-7 leading-relaxed">
          New stories, 20-second snippets, and little surprises — delivered straight to you.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            placeholder="your@email.com"
            required
            className="flex-1 rounded-full px-5 py-3 text-amber-900 border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <button
            type="submit"
            className="rounded-full px-7 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors"
          >
            Join Warwick&apos;s world
          </button>
        </form>
        <p className="text-xs text-amber-600 mt-4">No spam. Just warm, fuzzy stories.</p>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-amber-400">
        © {new Date().getFullYear()} Warwick. All rights reserved.
      </footer>
    </main>
  );
}
