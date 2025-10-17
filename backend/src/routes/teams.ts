import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Create a team
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const t = await prisma.team.create({ data: { name } });
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not create team' });
  }
});

// List teams with members
router.get('/', async (_req, res) => {
  const teams = await prisma.team.findMany({ include: { members: { include: { player: true } } }, orderBy: { name: 'asc' } });
  res.json(teams);
});

// Get single team with members
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const t = await prisma.team.findUnique({ where: { id }, include: { members: { include: { player: true } } } });
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

// Add player to team
router.post('/:id/members', async (req, res) => {
  const teamId = Number(req.params.id);
  const { playerId } = req.body;
  try {
    const m = await prisma.teamMembership.create({ data: { teamId, playerId } });
    res.json(m);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not add member' });
  }
});

// Remove player from team
router.delete('/:id/members/:playerId', async (req, res) => {
  const teamId = Number(req.params.id);
  const playerId = Number(req.params.playerId);
  try {
    const membership = await prisma.teamMembership.findFirst({ where: { teamId, playerId } });
    if (!membership) return res.status(404).json({ error: 'Membership not found' });
    await prisma.teamMembership.delete({ where: { id: membership.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not remove member' });
  }
});

// Copy members from another team (by teamId) into this team
router.post('/:id/copy-members', async (req, res) => {
  const targetId = Number(req.params.id);
  const { fromTeamId } = req.body;
  try {
    const fromMembers = await prisma.teamMembership.findMany({ where: { teamId: Number(fromTeamId) } });
    const created = [];
    for (const m of fromMembers) {
      // avoid duplicates
      const exists = await prisma.teamMembership.findFirst({ where: { teamId: targetId, playerId: m.playerId } });
      if (!exists) {
        const c = await prisma.teamMembership.create({ data: { teamId: targetId, playerId: m.playerId } });
        created.push(c);
      }
    }
    res.json({ created });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not copy members' });
  }
});

export default router;
