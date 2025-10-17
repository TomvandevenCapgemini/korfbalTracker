import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req, res) => {
  const { opponent, date, home, teamId } = req.body;
  try {
    const g = await prisma.game.create({ data: { opponent, date, home: !!home, teamId: teamId ? Number(teamId) : undefined } });
    res.json(g);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not create game' });
  }
});

// Assign or change team for a game
router.post('/:id/team', async (req, res) => {
  const id = Number(req.params.id);
  const { teamId } = req.body;
  try {
    const g = await prisma.game.update({ where: { id }, data: { teamId: teamId ? Number(teamId) : null } });
    res.json(g);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not assign team' });
  }
});

router.get('/', async (_req, res) => {
  const games = await prisma.game.findMany({ orderBy: { date: 'desc' } });
  res.json(games);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const g = await prisma.game.findUnique({ where: { id }, include: { events: true } });
  if (!g) return res.status(404).json({ error: 'Not found' });
  res.json(g);
});

export default router;
