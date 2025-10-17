import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// POST /api/games/:gameId/events
router.post('/games/:gameId/events', async (req, res) => {
  const gameId = Number(req.params.gameId);
  const { type, goalType, scorerId, againstId, minute, half, inPlayerId, outPlayerId, metadata } = req.body;

  if (!gameId) return res.status(400).json({ error: 'Invalid gameId' });
  // minute/half may be optional when logging quickly; default to 0/first if omitted
  const finalMinute = minute === undefined ? 0 : Number(minute);
  const finalHalf = half || 'first';

  // Normalize/parse metadata if present
  let parsedMeta: Record<string, unknown> | undefined = undefined;
  if (metadata) {
    if (typeof metadata === 'string') {
      try { parsedMeta = JSON.parse(metadata); } catch (e) { /* ignore parse error */ }
    } else if (typeof metadata === 'object') {
      parsedMeta = metadata;
    }
  }

  // Allow goalType to come either as top-level or inside metadata
  const finalGoalType = goalType || (parsedMeta && parsedMeta.goalType);

  try {
    console.log('POST /games/' + gameId + '/events body:', req.body);
  if (type === 'substitution') {
      // accept either inPlayerId/outPlayerId or scorerId/againstId as aliases
      const inId = inPlayerId ? Number(inPlayerId) : (scorerId ? Number(scorerId) : undefined);
      const outId = outPlayerId ? Number(outPlayerId) : (againstId ? Number(againstId) : undefined);
      console.log('computed substitution ids inId=', inId, 'outId=', outId);
      if (!inId || !outId) return res.status(400).json({ error: 'inPlayerId and outPlayerId required' });
      // validate genders
      const inP = await prisma.player.findUnique({ where: { id: Number(inId) } });
      const outP = await prisma.player.findUnique({ where: { id: Number(outId) } });
      if (!inP || !outP) return res.status(404).json({ error: 'player not found' });
      if (inP.gender !== outP.gender) return res.status(400).json({ error: 'substitution genders must match' });

    const ev = await prisma.event.create({ data: { gameId, type: 'substitution', minute: finalMinute, half: finalHalf, scorerId: inId, againstId: outId, metadata: JSON.stringify(Object.assign({}, parsedMeta || {}, { inPlayerId: inId, outPlayerId: outId })) } });
  console.log('created substitution event:', ev);
  // return game with events so frontend can immediately display it
  const updated = await prisma.game.findUnique({ where: { id: gameId }, include: { events: true } });
  return res.json(updated);
    }

    if (type === 'goal') {
      if (!finalGoalType || (!scorerId && !againstId)) return res.status(400).json({ error: 'goalType and scorerId or againstId required' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { gameId: gameId, type: 'goal', minute: finalMinute, half: finalHalf, metadata: JSON.stringify(Object.assign({}, parsedMeta || {}, { goalType: finalGoalType })) };
  if (scorerId) data.scorerId = Number(scorerId);
  if (againstId) data.againstId = Number(againstId);
  const ev = await prisma.event.create({ data });
  console.log('created goal event:', ev);
  // update score on the game
  try {
    const g = await prisma.game.findUnique({ where: { id: gameId } });
    if (g) {
      let scoreFor = g.scoreFor || 0;
      let scoreAgainst = g.scoreAgainst || 0;
      if (scorerId) scoreFor += 1; // a goal scored by our player
      if (againstId) scoreAgainst += 1; // a goal against our player
      await prisma.game.update({ where: { id: gameId }, data: { scoreFor, scoreAgainst } });
    }
  } catch (e) { console.error('failed to update score', e); }
  const updated = await prisma.game.findUnique({ where: { id: gameId }, include: { events: true } });
  return res.json(updated);
    }

    return res.status(400).json({ error: 'Unsupported event type' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
