# Note Taking Frontend

The React single-page app for the Care Guide note-taking platform: a dark,
animated-gradient UI for private notes, a public/private posts directory,
and admin management screens. Built with React 18, TypeScript, and Vite.

The matching backend API lives in the sibling
[`Note-taking-backend`](../Note-taking-backend) project — this app talks to
it over HTTP and has no server of its own.

## Features

- **Auth** — register/login pages backed by JWT; the session persists in
  `localStorage` and is restored via `GET /auth/me` on load.
- **My Notes** — a personal, private note board. Create and edit both happen
  in a shared modal (`+ New note` / the pencil icon on a card); delete with
  one click. Paginated, animated card grid.
- **Posts** — share a note publicly or privately:
  - The privacy toggle in the "Share a note" modal defaults to **public**
    and can be switched to **private**.
  - A **Posters** directory shows everyone who has posted, with name,
    email, and their public post count.
  - Copy any poster's user ID with one click, or paste a copied ID into the
    **search-by-user-ID** box to jump straight to their notes.
  - **View all notes** opens a modal with that user's visible posts —
    private posts only ever appear for their owner or an admin, enforced by
    the API.
- **Admin screens** (visible only to the `admin` role):
  - Manage Users — CRUD over accounts, roles, and interests.
  - All Notes — every user's notes, optionally filtered by user ID.
  - Interests — users grouped by shared interest.
- **UI** — dark theme with animated gradients, glassy cards, motion on
  hover/entry, and a fully responsive layout (the nav collapses into a
  hamburger drawer on tablet/mobile widths).

## Tech stack

React 18 · TypeScript · Vite · React Router 6

## Project structure

```
src/
├─ main.tsx                 Entry point: router + AuthProvider
├─ App.tsx                  Routes, route guards, responsive nav
├─ styles.css                Global dark theme, animations, responsive rules
├─ types.ts                  Shared TS types (mirrors the API's shapes)
├─ api/client.ts             Fetch wrapper: JWT header, JSON, error handling
├─ context/AuthContext.tsx   Auth state, login/register/logout
├─ components/
│  ├─ Modal.tsx               Shared modal shell (portal-rendered)
│  ├─ Button.tsx               Loading-aware button
│  ├─ Pager.tsx                 Pagination controls
│  └─ Spinner.tsx               Loading spinner
└─ pages/
   ├─ Login.tsx / Register.tsx
   ├─ Notes.tsx                 My Notes — create/edit modal, delete
   ├─ Posts.tsx                  Posters directory, share/search/view notes
   ├─ AdminUsers.tsx             Admin: manage users
   ├─ AdminNotes.tsx              Admin: all notes
   └─ Interests.tsx               Admin: users grouped by interest
```

## Prerequisites

- Node.js 18+
- The backend API running (see
  [`Note-taking-backend`](../Note-taking-backend)) — either locally on
  `http://localhost:5000` or a deployed instance

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** (optional) — copy `.env.example` to
   `.env`:

   ```bash
   cp .env.example .env
   ```

   | Variable            | Description | Default |
   |---------------------|-------------|---------|
   | `VITE_API_BASE_URL` | Base URL the app calls for the API. Leave empty in local development — Vite's dev server proxies `/api` to `http://localhost:5000` automatically (see `vite.config.ts`). Set it to your deployed backend's URL (e.g. `https://api.example.com/api`) when building for production. | `/api` |

3. **Run the dev server**:

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. Make sure the backend is running first (or
   requests to `/api` will fail) — register a new account, or log in with a
   seeded account if you ran the backend's `npm run seed`:

   | Role  | Email               | Password    |
   |-------|---------------------|-------------|
   | Admin | `admin@example.com` | `Admin123!` |
   | User  | `alice@example.com` | `Alice123!` |
   | User  | `bob@example.com`   | `Bob12345!` |

### Other scripts

```bash
npm run build     # type-check (tsc) + production build to dist/
npm run preview   # serve the production build locally, for a final check
```

## Deployment

`npm run build` produces a static `dist/` folder deployable to any static
host (Vercel, Netlify, S3 + CloudFront, etc.). Set `VITE_API_BASE_URL` to
your deployed backend's URL **before** building, since Vite inlines env
vars at build time — there is no dev-server proxy in production.
