# OchalaOS — Next.js

A personal creative mastery operating system converted from a single-file HTML app to a full Next.js 14 (App Router) project.

## Stack

- **Next.js 14** — App Router, TypeScript
- **React 18** — functional components + hooks
- **CSS Modules** (global CSS, CSS variables) — no Tailwind, matching original design tokens exactly

## Project Structure

```
ochalaos/
├── app/
│   ├── layout.tsx          # Root layout — fonts, providers, Shell
│   ├── page.tsx            # Dashboard
│   ├── daily/page.tsx      # Daily OS (schedule + task list)
│   ├── focus/page.tsx      # Focus Mode timer
│   ├── stopwatch/page.tsx  # Stopwatch with laps (persists across pages)
│   ├── arcade/page.tsx     # Arcade — 4 quick break games
│   ├── skills/page.tsx     # Skill Matrix
│   ├── clients/page.tsx    # Client Pipeline
│   ├── health/page.tsx     # Health Tracker
│   ├── milestones/page.tsx # 90-Day Milestones
│   ├── achievements/page.tsx # Achievement / badge gallery
│   ├── review/page.tsx     # Weekly Review
│   └── settings/page.tsx   # Settings + data export
├── components/
│   ├── Shell.tsx           # Sidebar + Topbar layout wrapper
│   ├── Toast.tsx           # Toast notification
│   ├── FocusOverlay.tsx    # Full-screen focus timer overlay
│   ├── Confetti.tsx        # Canvas confetti burst (celebrations)
│   ├── CommandPalette.tsx  # ⌘K / Ctrl+K quick navigation & actions
│   └── games/              # ReactionTest, MemoryMatch, TicTacToe, MathSprint
├── lib/
│   ├── store.ts             # State types, localStorage helpers, defaults
│   ├── context.tsx          # React context + AppProvider
│   ├── achievements.ts      # Achievement definitions + unlock logic
│   └── sound.ts              # Web Audio beeps (no audio assets needed)
└── styles/
    └── globals.css         # All CSS (variables, components, utilities)
```

## Feature Highlights

- **Stopwatch** — start/pause/lap/reset, keeps running across page navigation (a live chip shows in the top bar), and can log its elapsed time as a focus session.
- **Arcade** — four quick "break" games with saved best scores: Reaction Test, Memory Match, Tic-Tac-Toe (vs. a heuristic AI), and a 60-second Math Sprint.
- **Achievements** — 20+ badges that unlock automatically as you build streaks, log sessions, hit goals, and play games; unlocking one fires a toast, confetti, and a chime.
- **Command palette** — press `⌘K` / `Ctrl+K` anywhere to jump to any page or run a quick action (start a focus session, etc.).
- **Sound effects** — subtle synthesized chimes (no audio files) for completions, achievements, and games; toggle in Settings → Notifications.
- **Confetti celebrations** — fire on a perfect pillar day, a new game high score, and every achievement unlock.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Design Decisions

| Concern | Approach |
|---|---|
| State | React Context + `localStorage` (same key `ochalaos_v1` as original) |
| Routing | Next.js App Router — each page is its own route |
| Styling | Global CSS with CSS custom properties — zero framework overhead |
| Focus timer | Shared via `window.startFocus()` — callable from any page |
| Data export | JSON download via Blob URL, same as original |

## Next Steps (SaaS path)

- Replace localStorage with a database (Supabase/PlanetScale)
- Add auth (NextAuth or Clerk)
- Add API routes under `app/api/` for server-side data
- Add `next-pwa` for offline support
- Add unit tests (Vitest + Testing Library)
