import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req, res) => {
  const { name, gender } = req.body;
  try {
    // Create player if not exists (idempotent)
    let p = await prisma.player.findUnique({ where: { name } });
    if (!p) {
      p = await prisma.player.create({ data: { name, gender } });
    } else if (gender && p.gender !== gender) {
      // update gender if caller provides a (possibly corrected) value
      p = await prisma.player.update({ where: { name }, data: { gender } });
    }
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

// Delete a player (test helper) - also remove memberships and events referencing the player
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    // remove team memberships
    await prisma.teamMembership.deleteMany({ where: { playerId: id } }).catch(()=>{});
    // remove events where this player was scorer or against
    await prisma.event.deleteMany({ where: { OR: [{ scorerId: id }, { againstId: id }] } }).catch(()=>{});
    // delete player
    await prisma.player.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not delete player' });
  }
});

export default router;
