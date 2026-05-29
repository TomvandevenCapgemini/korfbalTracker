import express from 'express';
import matchesRouter from './routes/matches';
import playersRouter from './routes/players';
import gamesRouter from './routes/games';
import eventsRouter from './routes/events';
import exportRouter from './routes/export';
import teamsRouter from './routes/teams';

const app = express();
app.use(express.json());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/matches', matchesRouter);
app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);
app.use('/api', eventsRouter);
app.use('/api', exportRouter);
app.use('/api/teams', teamsRouter);

export default app;

