import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req, res) => {
  const { name, gender } = req.body;
  try {
    const p = await prisma.player.create({ data: { name, gender } });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not create player' });
  }
});

router.get('/', async (_req, res) => {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } });
  res.json(players);
});

export default router;
