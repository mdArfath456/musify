# Musify — Frontend

A React (Vite) frontend built for the existing **Musify** backend (Express + MongoDB + JWT-cookie auth + ImageKit storage). Below is the SDLC this build followed, so the reasoning behind the structure is traceable.

## 1. Requirements analysis (reverse-engineered from `backend/`)

**Entities:** `user` (role: `user` | `artist`), `music` (title, uri, artist ref), `album` (title, musics[], artist ref).

**Endpoints consumed:**
| Method | Path | Role required | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, sets JWT cookie |
| POST | `/api/auth/logout` | — | Clear cookie |
| POST | `/api/music/upload` | artist | Upload an audio file (multipart) |
| POST | `/api/music/album` | artist | Create an album from track IDs |
| POST | `/api/music/album/:id/add-music` | artist | Add a track to an existing album |
| GET | `/api/music` | user | List all tracks |
| GET | `/api/music/albums` | user | List all albums |
| GET | `/api/music/albums/:albumId` | user | Album detail with populated tracks |

**Two backend constraints the frontend deliberately designs around, rather than assuming they're bugs to paper over:**

1. `authUser`/`authArtist` check role with strict equality. An **artist** account cannot call the `GET /api/music*` endpoints (role must be `"user"`), so there is no "list my own uploads" endpoint. The Studio page tracks what an artist uploads **within the current session** so they can select tracks for an album, and offers a manual "add track to album by ID" form as a fallback for tracks uploaded earlier.
2. Auth failures respond with **HTTP 200** and `{ message: "Unauthorized" }` or `{ message: "You don't have any access" }` — not a 401/403 status. `src/api/axios.js` has a response interceptor that inspects the message body itself and treats those two strings as an auth failure, clearing the session and (via the same channel) surfacing the message as a normal error to the calling page.

## 2. Design

- **Palette:** deep aubergine-charcoal (`#15121b`) background, warm tape-reel gold (`#e3a345`) accent — a tactile, analog-tape feel rather than a generic dark/neon music-app look.
- **Type:** Fraunces (display/brand), Manrope (UI text), JetBrains Mono (track counters/timestamps — a tape-counter reference).
- **Signature element:** the player bar's scrubber has tick marks like a tape counter, and the "now playing" glyph is a spinning vinyl disc.

## 3. Architecture

```
src/
  api/            axios instance + auth/music request functions
  context/         AuthContext (session) + PlayerContext (global playback)
  components/      Sidebar, Navbar, PlayerBar, MusicCard, AlbumCard, Loader, EmptyState, ProtectedRoute
  pages/           Login, Register, Library, Albums, AlbumDetail, Studio, NotFound
  styles/          variables.css (design tokens), global.css, layout.css, auth.css
  config.js        API_BASE_URL (reads VITE_API_URL)
  App.jsx          route table + shell layout
  main.jsx         providers + router entry point
```

Each component/page has its CSS in its own adjacent file (no CSS-in-JS), matching the pattern used in your other projects (e.g. MAISONCO).

## 4. Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your running backend
npm run dev
```

The backend must be running on the URL in `VITE_API_URL` (default `http://localhost:3000/api`) with CORS `origin: "http://localhost:5173"` and `credentials: true` — both already set in the uploaded `backend/src/app.js`.

## 5. Known follow-ups (not implemented, flagged for a future backend pass)

- Add a `/api/auth/me` endpoint so the frontend can verify the session on refresh from the server instead of mirroring the last-known user in `localStorage`.
- Add a `GET /api/music/mine` (artist-only) endpoint so the Studio page can list an artist's own catalog across sessions, replacing the manual "add by ID" fallback.
- Return proper `401`/`403` status codes from the auth middleware instead of `200` with an error message.
