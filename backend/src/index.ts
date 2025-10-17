import express from 'express';
import matchesRouter from './routes/matches';
import playersRouter from './routes/players';
import gamesRouter from './routes/games';
import eventsRouter from './routes/events';
import exportRouter from './routes/export';
import teamsRouter from './routes/teams';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/matches', matchesRouter);
app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);
app.use('/api', eventsRouter);
app.use('/api', exportRouter);
app.use('/api/teams', teamsRouter);

export default app;

