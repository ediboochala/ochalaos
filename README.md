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
│   ├── skills/page.tsx     # Skill Matrix
│   ├── clients/page.tsx    # Client Pipeline
│   ├── health/page.tsx     # Health Tracker
│   ├── milestones/page.tsx # 90-Day Milestones
│   ├── review/page.tsx     # Weekly Review
│   └── settings/page.tsx   # Settings + data export
├── components/
│   ├── Shell.tsx           # Sidebar + Topbar layout wrapper
│   ├── Toast.tsx           # Toast notification
│   └── FocusOverlay.tsx    # Full-screen focus timer overlay
├── lib/
│   ├── store.ts            # State types, localStorage helpers, defaults
│   └── context.tsx         # React context + AppProvider
└── styles/
    └── globals.css         # All CSS (variables, components, utilities)
```

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
