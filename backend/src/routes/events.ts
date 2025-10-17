import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// POST /api/games/:gameId/events
router.post('/games/:gameId/events', async (req, res) => {
  const gameId = Number(req.params.gameId);
  const { type, goalType, scorerId, againstId, minute, half, inPlayerId, outPlayerId, metadata } = req.body;

  if (!gameId) return res.status(400).json({ error: 'Invalid gameId' });
  if (!minute || !half) return res.status(400).json({ error: 'minute and half are required' });

  try {
    if (type === 'substitution') {
      if (!inPlayerId || !outPlayerId) return res.status(400).json({ error: 'inPlayerId and outPlayerId required' });
      // validate genders
      const inP = await prisma.player.findUnique({ where: { id: Number(inPlayerId) } });
      const outP = await prisma.player.findUnique({ where: { id: Number(outPlayerId) } });
      if (!inP || !outP) return res.status(404).json({ error: 'player not found' });
      if (inP.gender !== outP.gender) return res.status(400).json({ error: 'substitution genders must match' });

      const ev = await prisma.event.create({ data: { gameId, type: 'substitution', minute: Number(minute), half, metadata: JSON.stringify({ inPlayerId, outPlayerId }) } });
      return res.json(ev);
    }

    if (type === 'goal') {
      if (!goalType || !scorerId) return res.status(400).json({ error: 'goalType and scorerId required' });
      const data: any = { gameId, type: 'goal', minute: Number(minute), half, metadata: goalType };
      if (scorerId) data.scorerId = Number(scorerId);
      if (againstId) data.againstId = Number(againstId);
      const ev = await prisma.event.create({ data });
      return res.json(ev);
    }

    return res.status(400).json({ error: 'Unsupported event type' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
