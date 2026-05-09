# Brewing Buddy

A web app for homebrewers to track mead and wine batches through the fermentation process. Replace paper sheets and spreadsheets with an organized, intuitive dashboard and check-up flow.

## Features

- **Dashboard** – View all active batches as cards with key info.
- **New batch** – Use the plus icon in the top right to create a new batch and fill out batch info
- **Logging Events** - Log various events for specific batches.
- **Check-ups** – Record specific gravity, ingredient changes, equipment used, and notes. Dates are stored for every check.
- **Next check** – App suggests when the next check is due.

## Future Improvements & Features
### Navigation
- **Undo Actions**: Allow users to undo actions such as creating a batch.
### Forms and Inputs
- **Support Fractional Inputs**: Convert fractional inputs to decimal in forms.
- **Subtype Popups**: When a user hovers a mead subtype, display a pop-up with the description of the subtype.
- **Ingredient Filtering**: Implement ingredient filtering by type such as Yeasts, Honeys, Nutrients, etc
## Batch Details Page
- **ABV Timeline Improvements**: Unspecific, but I think there are a few problems with it. Investigate further.
- **Event Details**: Display details for the display batch events. Ex: For an ingredient addition event, display the ingredient(s) added.
### Misc. Future Features
- **Email Verification**: Require accounts to have a verified email address for security and email features.
- **Email Reminders**: Email reminders for upcoming batch checks.
- **Recipe Presets**: Store recipes in the database and allow users to "create" batches from the presets. Allow users to store their batch details as recipes.
- **History** – Past batches and check data kept for reference. TODO

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** for styling
- Fonts: Zilla Slab, Nunito Sans

## Getting started

### 1. Prerequisites

- **Node.js** 20+ and **npm** installed
- A terminal (Command Prompt, PowerShell, or similar)

### 2. Install dependencies

From the project root (`brewbuddy`):

```bash
npm install
```

### 3. Environment file

Create a local env file (optional for basic demo use, required only if you want a real database or email reminders):
add a database URL and session secret (a secret key that is private)

### 4. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 5. Using the app

- You will be taken to the **login** page.
- Click **Register** to create a test account (username + password).
- After logging in, you can:
  - Create new batches (mead/wine)
  - Add check‑ups (gravity readings, notes, etc.)
  - View existing batches on the dashboard

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

| Command         | Description      |
| --------------- | ---------------- |
| `npm run dev`   | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production   |
| `npm run lint`  | Run ESLint       |

## A Note on Comments

I tried to comment the majority of files in any "important" places
Files that I used Cursor to generate are commented as so at the top.

## A Note on AI

I am a frequent web developer with personal, academic, and professional experience. I use Cursor to maximize my efficiency. I commonly utilize Cursor's autofill feature, as well as automating the programming of repetitive tasks such as writing API endpoints or seeding the database. As noted above, I added comments at the top of files that are Cursor generated.

In future iterations I will go through my repository to optimize and comment any generated code.

## User constraints (from spec)

- **Incomplete data** – The app tolerates partial check-up inputs (e.g. gravity only, or notes only).
- **Irregular schedules** – Users can override the next check date.
- **Terminology** – UI should stay clear for users unfamiliar with brewing terms (consider tooltips or a small glossary later).
