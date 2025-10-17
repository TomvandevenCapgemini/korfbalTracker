import { Router } from 'express';

const router = Router();

const sample = [
  { id: 1, date: '2025-10-01', homeTeam: 'Team A', awayTeam: 'Team B', homeScore: 12, awayScore: 10 },
  { id: 2, date: '2025-10-08', homeTeam: 'Team C', awayTeam: 'Team D', homeScore: 8, awayScore: 9 }
];

router.get('/', (_req, res) => {
  res.json(sample);
});

export default router;
