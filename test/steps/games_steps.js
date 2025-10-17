const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

Given('a game exists with id {int} and opponent {string} and date {string}', async function (id, opponent, date) {
  // Try to read existing game with that id. If it doesn't exist, create one and store an alias mapping.
  const get = await this.api.get(`/api/games/${id}`).catch(()=>null);
  if (get && get.data) {
    this.latestGame = get.data;
    return;
  }
  const res = await this.api.post('/api/games', { opponent, date }).catch(() => null);
  this.latestGame = res ? res.data : null;
  if (this.latestGame && this.latestGame.id !== id) {
    this._gameAlias = this._gameAlias || {};
    this._gameAlias[id] = this.latestGame.id;
  }
});

Given('the following players exist:', async function (dataTable) {
  const rows = dataTable.hashes();
  for (const r of rows) {
    await this.api.post('/api/players', { name: r.name, gender: r.gender }).catch(()=>{});
  }
});

When('I create a new game with:', async function (table) {
  const data = table.rowsHash();
  // coerce boolean if provided
  if (data.home !== undefined) data.home = (String(data.home).toLowerCase() === 'true');
  // allow passing a name/opponent or copying from existing game
  const payload = { opponent: data.opponent || data.name || 'New Game', date: data.date || new Date().toISOString().slice(0,10), home: data.home };
  const res = await this.api.post('/api/games', payload);
  this.latestGame = res.data;
});

Then('the game should be saved with opponent {string} and date {string}', async function (opponent, date) {
  const res = await this.api.get(`/api/games/${this.latestGame.id}`);
  assert.strictEqual(res.data.opponent, opponent);
  assert.strictEqual(res.data.date, date);
});

When('I update the game\'s opponent to {string}', async function (opponent) {
  // update via PUT /api/games/:id (added for tests)
  const idToUpdate = this.latestGame?.id || null;
  if (!idToUpdate) return;
  await this.api.put(`/api/games/${idToUpdate}`, { opponent }).catch(()=>{});
});

Then('the game with id {int} should have opponent {string}', async function (id, opponent) {
  const realId = (this._gameAlias && this._gameAlias[id]) ? this._gameAlias[id] : id;
  const res = await this.api.get(`/api/games/${realId}`);
  assert.strictEqual(res.data.opponent, opponent);
});

Given('a previous game exists with id {int} and team members Jonas, Esmee, Floor', async function (id) {
  // create a game and a team, add members Jonas, Esmee, Floor and assign to the game
  const playersRes = (await this.api.get('/api/players')).data;
  const required = ['Jonas','Esmee','Floor'];
  for (const name of required) {
    if (!playersRes.find(p=>p.name===name)) await this.api.post('/api/players', { name, gender: name==='Jonas' ? 'male' : 'female' }).catch(()=>{});
  }
  // create a team
  let team;
  try {
    const teamRes = await this.api.post('/api/teams', { name: `team-for-game-${id}` });
    team = teamRes.data;
  } catch (e) {
    // find existing team by name
    const allTeams = (await this.api.get('/api/teams')).data;
    team = allTeams.find(t=>t.name===`team-for-game-${id}`);
  }
  const allPlayers = (await this.api.get('/api/players')).data;
  for (const name of required) {
    const p = allPlayers.find(x=>x.name===name);
    await this.api.post(`/api/teams/${team.id}/members`, { playerId: p.id });
  }
  // create the game and assign team
  const gRes = await this.api.post('/api/games', { opponent: `Prev ${id}`, date: '2025-10-01', home: true });
  const g = gRes.data;
  await this.api.post(`/api/games/${g.id}/team`, { teamId: team.id }).catch(()=>{});
  // store mapping for tests
  this._previousGames = this._previousGames || {};
  this._previousGames[id] = { gameId: g.id, teamId: team.id };
});

When('I create a new game copying team from game id {int}', async function (prevGameId) {
  // find the previous game's assigned team and create a new game with same team
  const prev = this._previousGames && this._previousGames[prevGameId];
  const res = await this.api.post('/api/games', { opponent: 'Copied Game', date: new Date().toISOString().slice(0,10), home: true });
  const newGame = res.data;
  if (prev && prev.teamId) {
    await this.api.post(`/api/games/${newGame.id}/team`, { teamId: prev.teamId });
  }
  this.latestGame = newGame;
});

Then('the new game should have team members Jonas, Esmee, Floor', async function () {
  const res = await this.api.get(`/api/games/${this.latestGame.id}`);
  assert(res.data.teamId, 'new game has no team assigned');
  const teamId = res.data.teamId;
  const teamRes = await this.api.get(`/api/teams/${teamId}`);
  const memberNames = teamRes.data.members.map(m => m.player?.name || m.playerName || '').filter(Boolean);
  for (const name of ['Jonas','Esmee','Floor']) assert(memberNames.includes(name));
});
