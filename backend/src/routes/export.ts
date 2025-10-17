import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();
const router = Router();

// GET /api/export/game/:id  -> returns an excel workbook for one game
router.get('/export/game/:id', async (req, res) => {
  const id = Number(req.params.id);
  const game = await prisma.game.findUnique({ where: { id }, include: { events: { include: { scorer: true, against: true } } } });
  if (!game) return res.status(404).send('not found');

  const wb = new ExcelJS.Workbook();
  const wsMeta = wb.addWorksheet('metadata');
  wsMeta.addRow(['opponent', game.opponent]);
  wsMeta.addRow(['date', game.date]);
  wsMeta.addRow(['home', String(game.home)]);

  const wsEvents = wb.addWorksheet('events');
  wsEvents.addRow(['id', 'type', 'scorer', 'scorerGender', 'against', 'againstGender', 'minute', 'half', 'metadata']);
  for (const e of game.events) {
    wsEvents.addRow([e.id, e.type, e.scorer?.name || '', e.scorer?.gender || '', e.against?.name || '', e.against?.gender || '', e.minute, e.half, e.metadata]);
  }

  const buffer = await wb.xlsx.writeBuffer();
  res.setHeader('Content-Disposition', `attachment; filename=game-${id}.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(Buffer.from(buffer));
});

// GET /api/export/all -> returns workbook with all games and an overall statistics sheet
router.get('/export/all', async (_req, res) => {
  const games = await prisma.game.findMany({ include: { events: { include: { scorer: true, against: true } } } });
  const wb = new ExcelJS.Workbook();

  const stats = {
    goalsByType: {},
    goalsAgainstByType: {},
    goalsByGender: { male: 0, female: 0 },
  } as any;

  for (const game of games) {
    const ws = wb.addWorksheet(`game-${game.id}`);
    ws.addRow(['opponent', game.opponent]);
    ws.addRow(['date', game.date]);
    ws.addRow([]);
    ws.addRow(['id', 'type', 'scorer', 'scorerGender', 'against', 'againstGender', 'minute', 'half', 'metadata']);
    for (const e of game.events) {
      ws.addRow([e.id, e.type, e.scorer?.name || '', e.scorer?.gender || '', e.against?.name || '', e.against?.gender || '', e.minute, e.half, e.metadata]);
      if (e.type === 'goal') {
        stats.goalsByType[e.metadata] = (stats.goalsByType[e.metadata] || 0) + 1;
        if (e.against) stats.goalsAgainstByType[e.metadata] = (stats.goalsAgainstByType[e.metadata] || 0) + 1;
        if (e.scorer?.gender) stats.goalsByGender[e.scorer.gender] = (stats.goalsByGender[e.scorer.gender] || 0) + 1;
      }
    }
  }

  const wsStats = wb.addWorksheet('overall-stats');
  wsStats.addRow(['metric', 'value']);
  wsStats.addRow(['goalsByType', JSON.stringify(stats.goalsByType)]);
  wsStats.addRow(['goalsAgainstByType', JSON.stringify(stats.goalsAgainstByType)]);
  wsStats.addRow(['goalsByGender', JSON.stringify(stats.goalsByGender)]);

  const buffer = await wb.xlsx.writeBuffer();
  res.setHeader('Content-Disposition', `attachment; filename=all-games.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(Buffer.from(buffer));
});

export default router;
