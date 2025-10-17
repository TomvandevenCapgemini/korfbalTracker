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

// Update game metadata (opponent, date, home)
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { opponent, date, home } = req.body;
  try {
    const g = await prisma.game.update({ where: { id }, data: { opponent: opponent ?? undefined, date: date ?? undefined, home: home === undefined ? undefined : !!home } });
    res.json(g);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not update game' });
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

// DELETE /api/games -> delete all games and their events (test-only helper)
router.delete('/', async (_req, res) => {
  try {
    // cast to any to avoid type issues in test helper
    const p: any = prisma;
    await p.event.deleteMany({});
    await p.game.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete games' });
  }
});

export default router;
