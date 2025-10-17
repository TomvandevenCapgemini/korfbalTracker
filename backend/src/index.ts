import express from 'express';
import matchesRouter from './routes/matches';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/matches', matchesRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
