# Brewing Buddy

A web app for homebrewers to track mead and wine batches through the fermentation process. Replace paper sheets and spreadsheets with an organized, intuitive dashboard and check-up flow.

## Features

- **Dashboard** – View all active batches as cards; add and remove batches.
- **New batch** – Label, photo, ingredients, equipment, starting specific gravity. Optional check interval (default weekly).
- **Check-ups** – Record specific gravity, ingredient changes, equipment used, and notes. Dates stored for every check.
- **Next check** – App suggests when the next check is due; user can override.
- **Reminders** – Email reminders for upcoming checks (when configured).
- **History** – Past batches and check data kept for reference.

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** for styling
- Fonts: Zilla Slab, Nunito Sans

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add keys when you need DB/email
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Repository structure

```
src/
  app/
    page.tsx              # Dashboard (batch cards, add/remove)
    layout.tsx
    globals.css
    components/           # Navbar, BatchCard, forms, etc.
    api/                  # API routes: batches, checks, reminders
    batches/              # Routes: [id], new, etc.
  lib/
    db/                   # Data access (in-memory → DB later)
    utils/                # Helpers (e.g. next-check date)
    email/                # Optional: reminder sending
  types/
    index.ts              # Batch, Check, Ingredient, Equipment
  hooks/                  # useBatches, useBatch, mutations
```

## Scripts

| Command   | Description        |
|----------|--------------------|
| `npm run dev`   | Start dev server   |
| `npm run build` | Production build   |
| `npm run start` | Run production     |
| `npm run lint`  | Run ESLint         |

## User constraints (from spec)

- **Incomplete data** – The app tolerates partial check-up inputs (e.g. gravity only, or notes only).
- **Irregular schedules** – Users can override the next check date.
- **Terminology** – UI should stay clear for users unfamiliar with brewing terms (consider tooltips or a small glossary later).

## Future ideas

- Recipe sharing and scaling to more stakeholders (e.g. competition judges).
- Optional export of batch history (PDF/CSV).
