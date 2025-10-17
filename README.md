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
