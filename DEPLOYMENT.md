# Deployment Guide: Vercel + Railway

This guide walks you through deploying the Korfbal Tracker to production using **Vercel** (frontend) and **Railway** (backend + database).

## Prerequisites

- GitHub account with your repo pushed
- Vercel account (free tier works)
- Railway account (free tier includes $5/month credit)

## Step-by-Step Deployment

### 1. Prepare Your Code

All config files are already created. Just commit them:

```bash
git add .
git commit -m "deploy: add production configuration files"
git push origin main
```

### 2. Deploy Backend + Database to Railway

#### 2a. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `korfbalTracker` repository
5. Railway will detect the `railway.json` and auto-configure

#### 2b. Add PostgreSQL Database

1. In Railway dashboard, click **+ Create** → **Database** → **PostgreSQL**
2. Railway will automatically add the `DATABASE_URL` environment variable
3. Wait for the database to initialize (usually ~1 min)

#### 2c. Set Environment Variables

In your Railway project, go to **Variables** and add:

```
FRONTEND_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
PORT=5000
```

(Replace `your-vercel-domain` with your actual Vercel domain — you'll get this in step 3)

#### 2d. Deploy

1. Click **Deploy** button
2. Railway will run migrations and start the backend
3. Check the **Logs** tab to verify it started successfully
4. Note the Railway-provided URL (usually `https://something.railway.app`) — you'll need this for the frontend

### 3. Deploy Frontend to Vercel

#### 3a. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Vercel will auto-detect this is a monorepo

#### 3b. Configure Build Settings

1. Under **Framework Preset**, select "Other" (since it's a custom setup)
2. **Build Command**: `cd frontend && npm run build`
3. **Output Directory**: `frontend/dist`
4. **Install Command**: `npm ci`

#### 3c. Set Environment Variables

Under **Environment Variables**, add:

```
VITE_API_URL=https://your-railway-backend.railway.app
```

(Use the Railway URL you got from step 2d)

#### 3d. Deploy

Click **Deploy** and wait for it to finish. Your frontend is now live!

## Testing the Deployment

1. Open your Vercel URL in a browser
2. You should see the Korfbal Tracker login page
3. Try logging in with credentials: `Manager` / `admin`
4. Verify that team and game data persists

## Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify `DATABASE_URL` environment variable exists
- Ensure migrations ran: look for `migrate:prod` output in logs

### Frontend can't reach backend
- Check the `VITE_API_URL` environment variable in Vercel
- Verify the Railway backend URL is correct
- Check browser console (F12) for network errors

### Database issues
- Railway PostgreSQL needs a few minutes to initialize
- Check that migrations have run in the logs
- Use `npm run migrate:prod` to manually run migrations

## Automatic Deployments

After this initial setup:

- **Every push to `main`** on GitHub automatically triggers:
  - Backend redeploys on Railway
  - Frontend rebuilds on Vercel
- **Pull requests** create preview URLs on Vercel (optional)

## Manual Redeploy

If you need to manually trigger a deployment:

**Railway**: Click the project → **Deploy** → **Redeploy**

**Vercel**: Go to the project → **Deployments** → **Redeploy**

## Environment Variables Reference

### Backend (.env or Railway Variables)

```
DATABASE_URL              # PostgreSQL connection (set by Railway)
FRONTEND_URL              # Your Vercel domain
NODE_ENV                  # "production"
PORT                      # 5000 (Railway default)
```

### Frontend (.env.production)

```
VITE_API_URL              # Your Railway backend URL (or /api for same-domain proxy)
```

## Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Logs: View in dashboard under your project
- Vercel Logs: Dashboard → Deployments → click a build for detailed logs

---

**Questions or issues?** Check the logs in both platforms — they're very detailed and usually point to the exact problem.
