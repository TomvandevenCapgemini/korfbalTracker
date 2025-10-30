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
  res.send(new Uint8Array(buffer));
});

// GET /api/export/all -> returns workbook with all games and an overall statistics sheet
router.get('/export/all', async (_req, res) => {
  const games = await prisma.game.findMany({ include: { events: { include: { scorer: true, against: true } } } });
  const wb = new ExcelJS.Workbook();

  const stats: {
    goalsByType: Record<string, number>,
    goalsAgainstByType: Record<string, number>,
    goalsByGender: Record<string, number>,
    homeAdvantage: Record<string, { homeWins: number, awayWins: number, homeLosses: number, awayLosses: number }>
  } = {
    goalsByType: {},
    goalsAgainstByType: {},
    goalsByGender: { male: 0, female: 0 },
    homeAdvantage: {},
  };

  for (const game of games) {
    const ws = wb.addWorksheet(`game-${game.id}`);
    ws.addRow(['opponent', game.opponent]);
    ws.addRow(['date', game.date]);
    ws.addRow([]);
    ws.addRow(['id', 'type', 'scorer', 'scorerGender', 'against', 'againstGender', 'minute', 'half', 'metadata']);
    for (const e of game.events) {
      ws.addRow([e.id, e.type, e.scorer?.name || '', e.scorer?.gender || '', e.against?.name || '', e.against?.gender || '', e.minute, e.half, e.metadata]);
      if (e.type === 'goal') {
        // normalize metadata: prefer JSON { goalType: '...' } -> use goalType, otherwise use raw string
        let goalType = '';
        if (e.metadata != null) {
          try {
            const parsed = JSON.parse(String(e.metadata));
            if (parsed && typeof parsed === 'object' && parsed.goalType) {
              goalType = String(parsed.goalType);
            } else {
              goalType = String(e.metadata);
            }
          } catch (_err) {
            goalType = String(e.metadata);
          }
        }
        stats.goalsByType[goalType] = (stats.goalsByType[goalType] || 0) + 1;
        if (e.against) stats.goalsAgainstByType[goalType] = (stats.goalsAgainstByType[goalType] || 0) + 1;
        if (e.scorer?.gender) stats.goalsByGender[e.scorer.gender] = (stats.goalsByGender[e.scorer.gender] || 0) + 1;
      }
    }

    // Track home/away advantage for this game
    if (game.opponent) {
      if (!stats.homeAdvantage[game.opponent]) {
        stats.homeAdvantage[game.opponent] = {
          homeWins: 0,
          awayWins: 0,
          homeLosses: 0,
          awayLosses: 0
        };
      }
      const isHome = game.home;
      const weWon = game.scoreFor > game.scoreAgainst;
      if (isHome) {
        if (weWon) stats.homeAdvantage[game.opponent].homeWins++;
        else stats.homeAdvantage[game.opponent].homeLosses++;
      } else {
        if (weWon) stats.homeAdvantage[game.opponent].awayWins++;
        else stats.homeAdvantage[game.opponent].awayLosses++;
      }
    }
  }

  const wsStats = wb.addWorksheet('overall-stats');
  wsStats.addRow(['metric', 'value']);
  
  // Most scored goal type
  const mostScoredType = Object.entries(stats.goalsByType).sort((a, b) => b[1] - a[1])[0];
  wsStats.addRow(['type of goals scored the most', mostScoredType ? mostScoredType[0] : 'N/A']);
  
  // Most against goal type
  const mostAgainstType = Object.entries(stats.goalsAgainstByType).sort((a, b) => b[1] - a[1])[0];
  wsStats.addRow(['type of goals scored against the most', mostAgainstType ? mostAgainstType[0] : 'N/A']);
  
  // Goals against by gender
  const mostAgainstGender = stats.goalsByGender.male > stats.goalsByGender.female ? 'male' : 'female';
  wsStats.addRow(['most goals against males or female players', mostAgainstGender]);
  
  // Home/away advantage per team
  wsStats.addRow(['home/away advantage per team', JSON.stringify(stats.homeAdvantage)]);

  const buffer = await wb.xlsx.writeBuffer();
  res.setHeader('Content-Disposition', `attachment; filename=all-games.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(new Uint8Array(buffer));
});

export default router;
