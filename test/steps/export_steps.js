const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const ExcelJS = require('exceljs');

// Helper to create a player if missing
async function ensurePlayer(api, name, gender) {
  await api.post('/api/players', { name, gender }).catch(()=>{});
  const players = (await api.get('/api/players')).data;
  return players.find(p=>p.name===name);
}

Given('multiple games exist with logged events', async function () {
  // create some players
  const pJonas = await ensurePlayer(this.api, 'Jonas', 'male');
  const pEsmee = await ensurePlayer(this.api, 'Esmee', 'female');
  const pKian = await ensurePlayer(this.api, 'Kian', 'male');

  // create two games
  await this.api.post('/api/games', { opponent: 'Team B', date: '2025-10-01', home: true }).catch(()=>{});
  await this.api.post('/api/games', { opponent: 'Team C', date: '2025-10-02', home: false }).catch(()=>{});

  // ensure ids
  const games = (await this.api.get('/api/games')).data;
  const g1 = games.find(g=>g.opponent==='Team B');
  const g2 = games.find(g=>g.opponent==='Team C');

  // record aliases so later steps that reference id 1/2 map to the created ids
  this._gameAlias = this._gameAlias || {};
  if (g1) this._gameAlias[1] = g1.id;
  if (g2) this._gameAlias[2] = g2.id;

  // log a few events for game 1 and game 2
  // Jonas scores schot at minute 12 first
  await this.api.post(`/api/games/${g1.id}/events`, { type: 'goal', scorerId: pJonas.id, minute: 12, half: 'first', metadata: JSON.stringify({ goalType: 'schot' }) });
  // Esmee concedes vrije worp against Kian at minute 15
  await this.api.post(`/api/games/${g1.id}/events`, { type: 'goal', againstId: pKian.id, minute: 15, half: 'first', metadata: JSON.stringify({ goalType: 'vrije worp' }) });
  // Jonas scores doorloopbal in game 2 minute 5
  await this.api.post(`/api/games/${g2.id}/events`, { type: 'goal', scorerId: pJonas.id, minute: 5, half: 'first', metadata: JSON.stringify({ goalType: 'doorloopbal' }) });

  // store created game ids for later steps
  this._exportGames = { g1: g1.id, g2: g2.id };
});

When('I export game id {int} to Excel', async function (id) {
  const realId = (this._gameAlias && this._gameAlias[id]) ? this._gameAlias[id] : id;
  const res = await this.api.get(`/api/export/game/${realId}`, { responseType: 'arraybuffer' });
  this.lastExportBuffer = Buffer.from(res.data);
});

When('I export all games to Excel', async function () {
  const res = await this.api.get('/api/export/all', { responseType: 'arraybuffer' });
  this.lastExportBuffer = Buffer.from(res.data);
});

Then('the exported file should contain:', async function (dataTable) {
  assert(this.lastExportBuffer, 'No exported buffer available');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(this.lastExportBuffer);
  const rows = dataTable.hashes();
  for (const r of rows) {
    // special-case 'player genders' expectation: events sheet must include scorerGender/againstGender columns
    if (r.sheet === 'player genders') {
      const events = wb.getWorksheet('events');
      assert(events, 'events sheet not found while checking player genders');
      const header = events.getRow(1).values.join('|').toLowerCase();
      assert(header.includes('scorergender') || header.includes('scorergender'));
      assert(header.includes('againstgender') || header.includes('againstgender'));
      continue;
    }

    const sheet = wb.getWorksheet(r.sheet);
    assert(sheet, `Sheet ${r.sheet} not found`);
    // basic checks for known sheet types
    if (r.sheet === 'metadata') {
      const values = sheet.getRows(1, sheet.rowCount).map(row=>row.values.slice(1));
      // ensure opponent, date, home appear somewhere
      const flat = values.flat().join('|');
      assert(flat.includes('opponent') && flat.includes('date') && flat.includes('home'));
    }
    if (r.sheet === 'events') {
      // header row should contain minute and half columns
      const header = sheet.getRow(1).values.join('|');
      assert(header.toLowerCase().includes('minute'));
      assert(header.toLowerCase().includes('half'));
    }
  }
});

Then('the exported workbook should contain one sheet per game and an overall sheet with aggregate statistics', async function () {
  assert(this.lastExportBuffer, 'No exported buffer available');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(this.lastExportBuffer);
  // expect at least one worksheet per created game id and an overall-stats sheet
  const sheetNames = wb.worksheets.map(ws=>ws.name);
  assert(sheetNames.some(n=>n.startsWith('game-')),
    'no game-<id> sheets present');
  assert(sheetNames.includes('overall-stats'));
});

Given('the following event data across games:', async function (dataTable) {
  // create players referenced in table and create games if missing
  const rows = dataTable.hashes();
  // clear existing games to make this scenario deterministic
  await this.api.delete('/api/games').catch(()=>{});
  // ensure games referenced exist
  // create one game per unique requested game id and map requested -> actual id
  const requestedIds = Array.from(new Set(rows.map(r => Number(r.game))));
  // create players referenced
  for (const r of rows) {
    await ensurePlayer(this.api, r.scorer, 'male');
    await ensurePlayer(this.api, r.against || 'Unknown', 'male').catch(()=>{});
  }
  const gamesMap = {};
  for (const reqId of requestedIds) {
    await this.api.post('/api/games', { opponent: `Game ${reqId}`, date: '2025-10-01', home: true }).catch(()=>{});
  }
  let games = (await this.api.get('/api/games')).data;
  for (const reqId of requestedIds) {
    const g = games.find(x => x.opponent === `Game ${reqId}`);
    if (g) gamesMap[reqId] = g.id;
  }
  for (const r of rows) {
    const game = games.find(g=>g.id===gamesMap[Number(r.game)]);
    // parse time cell like 'minute:12 half:first'
    const timeParts = r.time.split(' ');
    let minute = 0, half = 'first';
    for (const part of timeParts) {
      if (part.startsWith('minute:')) minute = Number(part.split(':')[1]);
      if (part.startsWith('half:')) half = part.split(':')[1];
    }
    const players = (await this.api.get('/api/players')).data;
    const scorer = players.find(p=>p.name===r.scorer);
    const against = players.find(p=>p.name===r.against);
    const payload = { type: 'goal', minute, half, metadata: JSON.stringify({ goalType: r.type }) };
  if (scorer) payload.scorerId = scorer.id;
  if (against) payload.againstId = against.id;
  const realId = (this._gameAlias && this._gameAlias[game.id]) ? this._gameAlias[game.id] : game.id;
  await this.api.post(`/api/games/${realId}/events`, payload);
  }
});

When('I view overall statistics', async function () {
  // call export/all and parse overall-stats sheet into this.lastStats
  const res = await this.api.get('/api/export/all', { responseType: 'arraybuffer' });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(res.data));
  const ws = wb.getWorksheet('overall-stats');
  const data = {};
  for (let i=2;i<=ws.rowCount;i++) {
    const row = ws.getRow(i).values.slice(1);
    data[row[0]] = row[1];
  }
  this.lastStats = data;
});

Then('I should see:', function (dataTable) {
  const expected = dataTable.rowsHash();
  // compare expected metrics with lastStats (simple substring checks)
  for (const k of Object.keys(expected)) {
    const val = expected[k];
    // metric names in feature are descriptive; map a few known ones
    if (k.includes('type of goals scored the most')) {
      const goalsByType = JSON.parse(this.lastStats.goalsByType || '{}');
      // keys may be JSON strings containing {goalType: '...'}; normalize
      const normalized = {};
      for (const [k2, v2] of Object.entries(goalsByType)) {
        let key = k2;
        try {
          const parsed = JSON.parse(k2);
          if (parsed && parsed.goalType) key = parsed.goalType;
        } catch (e) {}
        normalized[key] = (normalized[key] || 0) + Number(v2);
      }
      const top = Object.entries(normalized).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
      assert.strictEqual(top, val);
    } else if (k.includes('type of goals scored against the most')) {
      const against = JSON.parse(this.lastStats.goalsAgainstByType || '{}');
      const normalized = {};
      for (const [k2, v2] of Object.entries(against)) {
        let key = k2;
        try {
          const parsed = JSON.parse(k2);
          if (parsed && parsed.goalType) key = parsed.goalType;
        } catch (e) {}
        normalized[key] = (normalized[key] || 0) + Number(v2);
      }
      const top = Object.entries(normalized).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
      assert.strictEqual(top, val);
    } else if (k.includes('most goals against males')) {
      const byGender = JSON.parse(this.lastStats.goalsByGender || '{}');
      const top = Object.entries(byGender).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
      assert.strictEqual(top, val);
    }
  }
});

Then('the overall statistics should be present in the exported file', async function () {
  assert(this.lastExportBuffer, 'No exported buffer available');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(this.lastExportBuffer);
  const ws = wb.getWorksheet('overall-stats');
  assert(ws, 'overall-stats sheet not present in exported workbook');
});
