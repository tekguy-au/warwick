# Warwick — "Catch Warwick" Game · MVP Build Plan

> A Pokémon GO–style real-world discovery game for the Warwick spider brand.
> Audience: under-8s (parents hold the phone). Warm, cosy, magical — never scary.
> Lives at `spiderwarwick.vercel.app/app` on the existing Next.js + Vercel stack.

**Decisions locked (3 Jun 2026):**
| Decision | Choice | Implication |
|---|---|---|
| Discovery model | **Hybrid** — fixed hero locations + dynamic common spawns | Curated rare characters at real coords, common ones spawn near the player anywhere |
| Backend | **Device-local only** | No login, no accounts, collection saved on the phone. Zero kids' data. COPPA-clean. |
| Catch mechanic | **Tap-to-catch mini-game** | Proximity opens an encounter; child taps/flicks a web to catch. No camera. |
| Platform | **PWA** | Installable web app, instant deploys, one codebase. Screen-on play only (fine). |
| Parent Mode | **PIN-gated, device-local** | Parents set real-world incentives tied to in-game milestones; child celebrates on unlock, parent marks redeemed. |

---

## 1. The Pokémon GO model — what we're actually replicating

To avoid running in circles, here is the real Pokémon GO loop, decomposed, with the Warwick translation for each piece. We replicate the **feel**, not the scale.

| Pokémon GO mechanic | What it does | Warwick MVP equivalent | In MVP? |
|---|---|---|---|
| **Map view** | Stylised live map centred on player avatar (real GPS) | Cosy storybook map, Warwick-web avatar dot | ✅ |
| **Wild spawns** | Pokémon appear dynamically around you, despawn on a timer | Common Warwick friends spawn near the player (client-side spawn engine) | ✅ |
| **PokéStops / Gyms** | Fixed real-world POIs you must travel to | Fixed "hero" characters at your 5 curated GPS coords | ✅ |
| **Proximity → encounter** | Walk near, tap the creature to start | Walk within ~40m → tap the glowing character | ✅ |
| **Catch (ball throw)** | Skill mini-game to capture | Flick/tap a magic web to catch | ✅ |
| **Pokédex** | Collection log; caught / seen / unseen silhouettes | Warwick's Friend Book, silhouettes for un-found | ✅ |
| **XP / Levels** | Progression, unlocks | Simple "Web Points" + level badge | ✅ (light) |
| **Eggs / hatching** | Reward for walking distance | — | ❌ later |
| **Raids / Gyms PvP** | Co-op battles at POIs | — | ❌ later |
| **Trading / Friends** | Social exchange | — | ❌ (needs backend) |
| **Items / shop** | Balls, berries, lures | One web type, unlimited, no shop | ❌ later |
| **AR camera capture** | Creature in live camera | Skipped (age + permissions) | ❌ deliberately |

**Key insight that saves us:** Pokémon GO's "magic" is 70% the *map + things appearing near you + a satisfying catch*. That trio is fully buildable client-side with no backend. Everything else (raids, trading, eggs, shop) is post-MVP and mostly needs servers. We build the trio brilliantly and stop.

---

## 2. Architecture overview

```
Browser (mobile, screen-on)
│
├─ Next.js 16 App Router  (route: /app)
│   ├─ Client components (game is client-side; "use client")
│   ├─ Static character/location data (JSON, shipped in the bundle)
│   └─ PWA: manifest.json + service worker (offline shell + asset cache)
│
├─ Geolocation:  navigator.geolocation.watchPosition()
├─ Spawn engine:  deterministic, seeded by (location cell + time window)
├─ State:         React + persisted to localStorage
└─ Map:           Leaflet + free raster tiles (no API key)

NO server. NO database. NO accounts.   (Upgrade path in §15.)
```

Everything that matters runs on the device. Vercel just serves static files. This is why it can be live in days, not weeks.

---

## 3. Tech stack (all free, fits current repo)

- **Next.js 16.2 / React 19** — already installed.
- **Tailwind v4** — already installed; reuse Warwick palette (browns, amber, honey, cream `#fdf6ee`, gold sparkle).
- **Leaflet** (`leaflet` + `react-leaflet`) — map. Free **CARTO "Voyager"** or **Stadia "Outdoors"** raster tiles (no key for low volume; key-free dev fine). Soft, child-friendly look.
- **No state library** — React context + a small `useGame()` hook is enough.
- **PWA** — hand-rolled `manifest.json` + a minimal service worker (or `@ducanh2912/next-pwa`). Keep it light.
- **Geolocation/maths** — native browser API + a 20-line haversine util. No dependency.
- **Animation** — CSS + a touch of `framer-motion` for the catch/sparkle delight (optional).

> Deliberately boring and dependency-light. Fewer moving parts = fewer circles.

---

## 4. Data model

### 4.1 Character (the "Pokédex entry")
```ts
type Rarity = "common" | "uncommon" | "rare" | "hero";

interface WarwickCharacter {
  id: string;            // "warwick-web"  (stable, never reused)
  name: string;          // "Warwick's Web"
  rarity: Rarity;
  image: string;         // "/app/characters/warwick-web.png" (transparent PNG)
  silhouette?: string;   // optional pre-rendered silhouette; else CSS filter
  blurb: string;         // 1–2 warm sentences shown on catch
  story: string;         // longer snippet on the detail page
  catchDifficulty: 1 | 2 | 3;   // tunes the mini-game
  spawnWeight: number;   // relative chance in the dynamic spawn pool (commons only)
}
```

### 4.2 Fixed location (the "PokéStop" — your 5 coords)
```ts
interface FixedSpawn {
  id: string;            // "lake-park-warwick"
  characterId: string;   // which hero/rare lives here
  lat: number;
  lng: number;
  radiusM: number;       // catch radius, default 40
  hint?: string;         // "Down by the old willow tree"
  oneTime: boolean;      // true = catch once ever; false = re-catchable after cooldown
  cooldownHours?: number;// for re-catchable
}
```

### 4.3 Dynamic spawn (generated, not authored)
```ts
interface LiveSpawn {
  uid: string;           // deterministic id from (cellId + slot + window)
  characterId: string;
  lat: number;
  lng: number;
  expiresAt: number;     // epoch ms; despawns
  source: "fixed" | "wild";
}
```

### 4.4 Saved game state (localStorage)
```ts
interface SaveState {
  schema: 1;                         // bump to migrate safely
  caught: Record<string, {          // characterId -> record
    count: number;
    firstCaughtAt: number;
    lastCaughtAt: number;
  }>;
  seen: string[];                    // ids encountered but not yet caught (silhouette)
  webPoints: number;
  level: number;
  fixedCaught: Record<string,number>;// fixedSpawn.id -> lastCaughtAt (for cooldowns)
  settings: { sound: boolean; reducedMotion: boolean };
}
```
Stored under key `warwick.save.v1`. One JSON blob, read on load, written on every change (debounced).

---

## 5. The geolocation engine (get this right or nothing works)

**Watch, don't poll:**
```ts
navigator.geolocation.watchPosition(onPos, onErr, {
  enableHighAccuracy: true,
  maximumAge: 2000,
  timeout: 10000,
});
```

**Distance** = haversine between player and each spawn. In range when `distanceM <= radiusM`.

**Real-world gotchas we handle up front (these are what cause "running in circles"):**
1. **GPS jitter** — phone position jumps 5–30m even when still. → Smooth with a short moving average; require the player to be inside radius for ~2s before the encounter is "armed".
2. **Accuracy varies** — `coords.accuracy` can be 50m+. → If accuracy worse than radius, widen the effective radius slightly and show a "getting a fix…" state instead of false negatives.
3. **Permission denied / unavailable** — → Friendly fallback screen ("We need to know where you are to find Warwick's friends!") with a retry. Never a dead end.
4. **iOS Safari** requires HTTPS (Vercel gives this) and a user gesture before the first prompt. → Gate the first `watchPosition` behind a "Start exploring" tap.
5. **Indoor/no-signal** — → "Warwick's a bit lost indoors — head outside!" friendly state.
6. **Battery** — `watchPosition` is power-hungry. → Pause watching when tab hidden (`visibilitychange`); resume on focus.

---

## 6. The spawn engine (hybrid, no backend)

Two sources merged into the live spawn list each tick.

### 6.1 Fixed spawns (hero characters — your 5 coords)
- Always present at their coords.
- In range + not on cooldown ⇒ catchable.
- `oneTime` heroes vanish from *that device* once caught (still in the Friend Book).

### 6.2 Wild spawns (common characters — the "appears near you" magic)
No server, yet consistent and controllable, via **deterministic seeded generation**:

1. Round the player's position into a **grid cell** (~150m squares via lat/lng rounding).
2. Combine `cellId + timeWindow` (e.g. current 15-min block) into a **seed**.
3. A seeded PRNG (mulberry32) decides: how many wild spawns in this cell (0–3), which characters (weighted by `spawnWeight`), and their offset coords within the cell.
4. Spawns last one time window, then refresh — so a patient player sees the area "repopulate".

**Why deterministic:** no database needed, spawns feel alive, you can *tune* density/rarity by editing weights, and two kids standing together see the same thing (feels real). Hero coords always override.

### 6.3 Game tick (the loop)
```
every 3s (and on each GPS update):
  pos = smoothed player position
  live = fixedSpawns(near) + wildSpawns(currentCell, now)
  for each spawn in live:
     d = haversine(pos, spawn)
     if d <= effRadius and armed(spawn):  mark catchable
  reconcile map markers (add/remove with gentle animation)
  expire wilds past expiresAt
```

---

## 7. Screen-by-screen UX

1. **Splash / Start** — Warwick waving, "Start exploring!" button (triggers GPS permission). Cosy, one tap.
2. **Map screen (home)** — soft storybook map, player = glowing web avatar. Catchable characters shimmer; out-of-range ones are faint/sleeping. Bottom bar: Friend Book · Web Points · Settings. Distance/"getting warmer" hint to the nearest character (great for little kids who can't read a map).
3. **Encounter / Catch** — tap a glowing character → full-screen reveal: character bounces in with sparkles, name, blurb → **mini-game** (§8) → success animation → "Added to your Friend Book!".
4. **Friend Book (Pokédex)** — grid of all characters; caught = full colour + count, seen = silhouette, never-seen = "?" web outline. Tap a caught one → detail.
5. **Character detail** — big art, name, story snippet, where/when first found, a **Share** button ("I found [name]!" → IG/TikTok-ready card).
6. **Settings** — sound on/off, reduced motion, "reset my book" (parent), how-to-play, parent/safety note.

All flows are tap-only, big targets, minimal text, read-aloud-friendly.

---

## 8. The catch mini-game (tap-to-catch)

Simple, satisfying, tunable by `catchDifficulty`:
- Character sits in the centre; a **shrinking glowing ring** pulses around it.
- Child **taps when the ring is smallest** (or flicks a web from the bottom).
- Tap timing → catch strength. Generous by default (it's for under-8s — *they should almost always succeed*); difficulty only changes how many taps/how forgiving.
- On success: web wraps the character, sparkle burst, happy sound, "+ Web Points".
- On a miss: character does a cute wobble, "Try again!" — **never a fail state, never a loss.** Kids don't lose Warwick.

---

## 9. Persistence & state

- `useGame()` hook owns `SaveState` + live spawns; exposes `catch(id)`, `markSeen(id)`, derived stats.
- Load from `localStorage` on mount; **debounced write** (300ms) on change.
- `schema` field + a `migrate()` switch so future versions don't wipe kids' collections.
- Everything works **offline after first load** (PWA cache) except the map *tiles* for brand-new areas — cache recently viewed tiles; show a soft "map's loading" state otherwise.

---

## 10. PWA setup

- `app/manifest.ts` (Next metadata route): name "Catch Warwick", icons (192/512, maskable), `theme_color` honey, `background_color` cream, `display: standalone`, `start_url: /app`.
- Service worker: precache the app shell + character art + a small base map region; runtime-cache map tiles (stale-while-revalidate).
- "Add to Home Screen" gentle prompt after first successful catch (best moment to ask).
- Apple touch icon + iOS meta so it installs cleanly on iPhones.

---

## 11. File / folder structure (inside the existing repo)

```
app/
  app/                       ← the game route  (/app)
    page.tsx                 ← client shell, mounts <Game/>
    manifest.ts
    components/
      Game.tsx               ← orchestrator (state + tick)
      MapView.tsx            ← Leaflet map + markers
      Encounter.tsx          ← reveal + mini-game
      CatchMiniGame.tsx
      FriendBook.tsx
      CharacterDetail.tsx
      StartScreen.tsx
      GpsFallback.tsx
      HUD.tsx                ← web points / level / nav
    lib/
      geo.ts                 ← haversine, smoothing, accuracy
      spawns.ts              ← fixed + wild (seeded) engine
      prng.ts                ← mulberry32 seeded RNG
      save.ts                ← localStorage load/save/migrate
      useGame.ts             ← the hook
    data/
      characters.ts          ← the Pokédex (typed)
      fixed-spawns.ts        ← YOUR 5 COORDS go here
  characters/ (in /public)   ← transparent PNG art
public/
  app-icons/                 ← PWA icons
```

---

## 12. Safety, age-appropriateness & parental notes (non-negotiable for under-8s)

- **No accounts, no personal data, no chat, no other users** → no COPPA exposure, nothing to moderate.
- **No real-time location leaves the device.** Stated plainly in a parent note.
- **No camera, no microphone.**
- **No fail states, no timers that punish, no scary art.** Warm and forgiving always.
- **Safety nudge:** a gentle "Stay with a grown-up · look up and watch where you're going" card on first launch and periodically. Don't encourage kids to wander.
- **Hero locations must be safe, public, parent-suitable spots** — your curation responsibility when you pick the 5 coords (parks, your venues, etc., not roadsides).
- No ads, no purchases, no external links except the parent-initiated share.

---

## 12a. Parent Mode (parent-set incentives)

A PIN-gated grown-up area where a parent ties **real-world rewards** to in-game progress. Fully device-local — nothing leaves the phone, no accounts.

### Entry & gating
- Accessed via a small "Grown-ups" cog → **4-digit PIN** (set on first entry, stored hashed in `localStorage`). Keeps little fingers out.
- A "math-gate" alternative (answer a simple sum) as a lighter option — TBD with you.

### What a parent can do
1. **Create an incentive** = reward text + a trigger condition:
   - reward: free-text, e.g. *"Ice cream after dinner 🍦"*, *"30 mins extra screen time"*, *"Pick the bedtime story"*.
   - trigger (pick one):
     - catch **N** characters total
     - catch a **specific** character / hero
     - reach **level X** / **X Web Points**
     - catch **N in one day** (an "outing" goal)
     - find the hero at a **specific location** (great for "the one at Grandma's")
2. **Edit / delete** incentives.
3. **See progress** — child's caught count, level, recently found, progress bars toward each incentive.
4. **Redeem** — when a child meets a trigger, it moves to a "Ready!" list; parent taps **"Given ✓"** to clear it (prevents double-claims).

### Child-side experience
- When a trigger is met, the child gets a special celebration: *"You earned a treat from Mum! 🌟"* with the reward shown in warm, readable language — turning the parent's real-world reward into an in-game moment.
- Children **cannot create or redeem** incentives (PIN-gated); they only earn and celebrate.

### Data model (added to `SaveState`)
```ts
interface Incentive {
  id: string;
  reward: string;                 // parent free-text
  trigger:
    | { kind: "countTotal"; n: number }
    | { kind: "specificCharacter"; characterId: string }
    | { kind: "level"; level: number }
    | { kind: "webPoints"; points: number }
    | { kind: "countInDay"; n: number }
    | { kind: "fixedLocation"; fixedSpawnId: string };
  createdAt: number;
  status: "active" | "ready" | "redeemed";
  earnedAt?: number;
  redeemedAt?: number;
}
// SaveState gains:  parent: { pinHash: string; incentives: Incentive[] }
```
Trigger checks run inside the same `useGame()` reducer after every catch — when a condition flips true, the incentive moves `active → ready` and fires the child celebration once.

### Build placement
Slots in as **Phase 2.5** (½ day) after the Friend Book exists (it reads the same progress data). Files: `components/ParentMode/` (Gate, Dashboard, IncentiveForm, IncentiveList) + `lib/incentives.ts`.

### Safety
- PIN-gated so kids can't self-reward. No personal data, no external delivery — rewards are real-world things the parent gives in person.

---

## 13. Content you author (the easy part)

For each hero character you give me:
- **GPS coord** (lat, lng — from Google Maps: right-click → copy)
- **Name** + **one-line vibe**, and whether it's **catch-once or re-catchable**
- (I can generate placeholder art so we build now; swap real Warwick art later.)

Commons (wild spawns) I'll seed with 3–5 starter friends so the map feels alive between hero spots.

---

## 14. Build phases (each phase is a shippable, demoable step — no big bang)

**Phase 0 — Skeleton (½ day)**
`/app` route, Start screen, GPS permission + watch, player dot on a Leaflet map, fallback states. *Demo: your blue dot moves on a cosy map.*

**Phase 1 — Fixed catch (1 day)**
Hardcode your 5 coords, proximity detection + smoothing, encounter reveal, tap-to-catch, save to Friend Book. *Demo: walk to a coord, catch the hero, see it in the book.*

**Phase 2 — Friend Book + HUD (½ day)**
Full collection grid, silhouettes, Web Points/level, character detail + share card. *Demo: the full collection experience.*

**Phase 2.5 — Parent Mode (½ day)**
PIN gate, parent dashboard, create/edit incentives, trigger checks, child celebration, redeem flow. *Demo: a parent sets "catch 3 friends → ice cream", child earns it, parent marks it given.*

**Phase 3 — Wild spawn engine (1 day)**
Seeded grid spawns of commons, despawn/refresh, map markers reconcile. *Demo: common friends appear near you anywhere.*

**Phase 4 — PWA + polish (½ day)**
Manifest, service worker, install prompt, sounds, sparkle animations, reduced-motion, safety cards. *Demo: installable app, full delight.*

**≈ 4 focused days to a genuinely fun MVP.** Phases 0–2 alone (≈2 days) are already a complete location game using your 5 coords — Phase 3 adds the "Pokémon everywhere" magic.

---

## 15. Upgrade path (designed-for, not built now)

Because state is one typed `SaveState` blob behind a `save.ts` interface, swapping local→cloud later is a contained change:
- **Cloud + accounts** → Supabase: parent-managed login, cross-device sync, **leaderboards**, friends. (Adds privacy/consent work — deferred deliberately.)
- **AR capture** → add as an optional encounter mode.
- **Eggs / walking rewards, raids at hero spots, seasonal/event characters, item shop.**
- **Server-driven spawns & live events** → replace the client seed with an API; the engine boundary already exists.

---

## 16. Acceptance criteria — "MVP done" means

- [ ] On a phone, walking to a real coord reliably triggers an encounter within ~40m (jitter-tolerant).
- [ ] Tap-to-catch succeeds, character lands in the Friend Book, persists after closing the app.
- [ ] Common friends spawn near the player in new areas and refresh over time.
- [ ] Friend Book shows caught (colour) vs seen (silhouette) vs unknown (?).
- [ ] Installs to home screen; loads offline (shell); friendly GPS-denied fallback.
- [ ] Parent Mode: PIN-gated, parent can create an incentive, child earns it, "Ready!" → "Given ✓" works.
- [ ] No scary content, no fail states, no data leaves the device; parent/safety note present.
- [ ] Deploys at `spiderwarwick.vercel.app/app` via the existing Vercel pipeline.

---

## 17. What I need from you to start building

1. **The 5 GPS coords** + for each: name, one-line vibe, catch-once or re-catchable.
2. Confirm **commons**: happy for me to invent 3–5 starter friend names/vibes, or you'll supply?
3. Real **Warwick art** when ready (transparent PNGs); I'll use placeholders to build immediately.

Say go and I start at **Phase 0**.
