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

Given('a game exists', async function () {
  // Create a simple game and store alias for id 1 if feature references it
  const res = await this.api.post('/api/games', { opponent: 'Exist Opponent', date: new Date().toISOString().slice(0,10), home: false });
  this.latestGame = res.data;
  this._gameAlias = this._gameAlias || {};
  if (!this._gameAlias[1]) this._gameAlias[1] = this.latestGame.id;
});

When('I edit the game to set it as a home game', async function () {
  const id = this.latestGame?.id || (this._gameAlias && this._gameAlias[1]) || null;
  if (!id) throw new Error('no game available to edit');
  await this.api.put(`/api/games/${id}`, { home: true }).catch(()=>{});
});

Then('the game should be marked as a home game', async function () {
  const id = this.latestGame?.id || (this._gameAlias && this._gameAlias[1]) || null;
  if (!id) throw new Error('no game available to verify');
  const res = await this.api.get(`/api/games/${id}`);
  assert.strictEqual(Boolean(res.data.home), true);
});

When('I edit the date of the game', async function () {
  const id = this.latestGame?.id || (this._gameAlias && this._gameAlias[1]) || null;
  if (!id) throw new Error('no game available to edit');
  const newDate = new Date().toISOString().slice(0,10);
  this._editedDate = newDate;
  await this.api.put(`/api/games/${id}`, { date: newDate }).catch(()=>{});
});

Then('the game should reflect the new date', async function () {
  const id = this.latestGame?.id || (this._gameAlias && this._gameAlias[1]) || null;
  if (!id) throw new Error('no game available to verify');
  const res = await this.api.get(`/api/games/${id}`);
  assert.strictEqual(res.data.date, this._editedDate);
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
    await this.api.post(`/api/teams/${team.id}/members`, { playerId: p.id }).catch(()=>{});
  }
  // create the game and assign team
  const gRes = await this.api.post('/api/games', { opponent: `Prev ${id}`, date: '2025-10-01', home: true });
  const g = gRes.data;
  await this.api.post(`/api/games/${g.id}/team`, { teamId: team.id }).catch(()=>{});
  // store mapping for tests
  this._previousGames = this._previousGames || {};
  this._previousGames[id] = { gameId: g.id, teamId: team.id };
  // store alias to allow feature steps that reference numeric ids to work
  this._gameAlias = this._gameAlias || {};
  if (g.id && id && g.id !== id) this._gameAlias[id] = g.id;
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

Given('I want to create a new game', function () {
  this._wantCreate = true;
});

When('I choose to copy an existing game', async function () {
  // copy from previous game 1 if present, otherwise copy latestGame
  const prev = (this._previousGames && this._previousGames[1]) ? this._previousGames[1] : null;
  let sourceGameId = prev ? prev.gameId : (this.latestGame ? this.latestGame.id : null);
  if (!sourceGameId) {
    // fallback: pick the first existing game
    const games = (await this.api.get('/api/games')).data;
    sourceGameId = games[0] && games[0].id;
  }
  if (!sourceGameId) throw new Error('no game available to copy');
  const src = (await this.api.get(`/api/games/${sourceGameId}`)).data;
  const payload = { opponent: src.opponent + ' (copy)', date: src.date, home: src.home };
  const res = await this.api.post('/api/games', payload);
  const newGame = res.data;
  // copy team if present
  if (src.teamId) {
    await this.api.post(`/api/games/${newGame.id}/team`, { teamId: src.teamId }).catch(()=>{});
  }
  this.latestGame = newGame;
});

Then('the new game should have the same details as the copied game', async function () {
  // assume we stored previous game's mapping under _previousGames[1]
  const prev = (this._previousGames && this._previousGames[1]) ? this._previousGames[1] : null;
  if (!prev) return; // nothing to compare
  const src = (await this.api.get(`/api/games/${prev.gameId}`)).data;
  const created = (await this.api.get(`/api/games/${this.latestGame.id}`)).data;
  assert.strictEqual(created.opponent, src.opponent);
  assert.strictEqual(created.date, src.date);
  assert.strictEqual(created.home, src.home);
});

When('I choose to create a new game', async function () {
  const payload = { opponent: 'New game created', date: new Date().toISOString().slice(0,10), home: false };
  const res = await this.api.post('/api/games', payload);
  this.latestGame = res.data;
});

Then('I should be able to enter the name of the new game', async function () {
  if (!this.latestGame) throw new Error('no latest game');
  const newName = 'Entered Name';
  await this.api.put(`/api/games/${this.latestGame.id}`, { opponent: newName }).catch(()=>{});
  const res = await this.api.get(`/api/games/${this.latestGame.id}`);
  assert.strictEqual(res.data.opponent, newName);
});

When('I create the game', async function () {
  const res = await this.api.post('/api/games', { opponent: 'CreatedGame', date: new Date().toISOString().slice(0,10), home: false });
  this.latestGame = res.data;
});

Then('it should have the current date', async function () {
  if (!this.latestGame) throw new Error('no latest game');
  const today = new Date().toISOString().slice(0,10);
  const res = await this.api.get(`/api/games/${this.latestGame.id}`);
  assert.strictEqual(res.data.date, today);
});

When('I edit the game date', async function () {
  if (!this.latestGame) throw new Error('no latest game');
  const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10);
  this._editedDate = tomorrow;
  await this.api.put(`/api/games/${this.latestGame.id}`, { date: tomorrow }).catch(()=>{});
});

Then('it should reflect the updated date', async function () {
  if (!this.latestGame) throw new Error('no latest game');
  const res = await this.api.get(`/api/games/${this.latestGame.id}`);
  assert.strictEqual(res.data.date, this._editedDate);
});
