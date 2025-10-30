# Korfbal Tracker

Local full-stack TypeScript scaffold (backend + frontend + Prisma + Docker)

Quickstart (macOS / zsh):

1. Install dependencies for each package:

```bash
npm --prefix backend install
npm --prefix frontend install
```

2. Start backend and frontend in dev (two terminals):

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

3. Open http://localhost:5173 for the frontend. The frontend will call the backend at /api/matches (you may need to run a proxy or run frontend with the backend on the same host).

Notes on cloning and authentication
----------------------------------

We recommend cloning this repository over HTTPS by default. HTTPS works well with CI and is the simplest option for most contributors. Detailed authentication options (SSH and Personal Access Tokens) are available in the project's documentation and CONTRIBUTING guide.

Clone using HTTPS:

```bash
git clone https://github.com/TomvandevenCapgemini/korfbalTracker.git
```

If you already cloned via SSH and want to switch the origin to HTTPS:

```bash
git remote set-url origin https://github.com/TomvandevenCapgemini/korfbalTracker.git
```

For more details on authentication (SSH setup, PAT usage for CI, and macOS keychain tips) see `CONTRIBUTING.md` and `docs/authentication.md`.
