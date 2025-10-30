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

We recommend cloning this repository over SSH when working locally so you can push/pull using your SSH key without repeatedly entering credentials.

Clone using SSH:

```bash
git clone git@github.com:TomvandevenCapgemini/korfbalTracker.git
```

If you already cloned via HTTPS and want to switch the origin to SSH:

```bash
git remote set-url origin git@github.com:TomvandevenCapgemini/korfbalTracker.git
```

If you prefer HTTPS or need to use a Personal Access Token (PAT) for CI or automation, keep the remote as HTTPS. To set the HTTPS remote explicitly:

```bash
git remote set-url origin https://github.com/TomvandevenCapgemini/korfbalTracker.git
```

SSH setup quick steps (macOS):

```bash
# generate a new key if you don't have one
ssh-keygen -t ed25519 -C "you@example.com"
# ensure the key is loaded into the agent / keychain
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
# copy pubkey to clipboard and add it to GitHub > Settings > SSH and GPG keys
pbcopy < ~/.ssh/id_ed25519.pub
```

If you want docs or CI to continue recommending HTTPS instead, tell me and I will revert this guidance.
