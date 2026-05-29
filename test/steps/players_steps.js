const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

Given('the player list contains {string}', async function (csv) {
  const names = csv.split(',').map((s) => s.trim());
  // Ensure players exist via backend API
  for (const name of names) {
    await this.api.post('/api/players', { name, gender: 'male' }).catch(() => {});
  }
});

When('I add a new player {string} with gender {string}', async function (name, gender) {
  const res = await this.api.post('/api/players', { name, gender });
  this.latestPlayer = res.data;
});

Then('{string} should be present in the player list', async function (name) {
  const res = await this.api.get('/api/players');
  const names = res.data.map((p) => p.name);
  assert(names.includes(name));
});

Given('I create a team named {string}', async function (teamName) {
  const res = await this.api.post('/api/teams', { name: teamName });
  this.latestTeam = res.data;
});

When('I add players Jonas, Esmee and Floor to {string}', async function (teamName) {
  // find team
  const teams = (await this.api.get('/api/teams')).data;
  const team = teams.find(t=>t.name===teamName) || this.latestTeam;
  const players = (await this.api.get('/api/players')).data;
  for (const name of ['Jonas','Esmee','Floor']) {
    const p = players.find(x=>x.name===name);
    if (p) await this.api.post(`/api/teams/${team.id}/members`, { playerId: p.id }).catch(()=>{});
  }
});

When('I assign {string} to game id {int}', async function (teamName, gameId) {
  const teams = (await this.api.get('/api/teams')).data;
  const team = teams.find(t=>t.name===teamName) || this.latestTeam;
  let realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  // if the referenced game doesn't exist, create one so assignment doesn't fail in tests
  const existing = await this.api.get(`/api/games/${realId}`).catch(()=>null);
  if (!existing || existing.status === 404) {
    const created = await this.api.post('/api/games', { opponent: `Game ${gameId}`, date: new Date().toISOString().slice(0,10), home: true });
    realId = created.data.id;
    this._gameAlias = this._gameAlias || {};
    this._gameAlias[gameId] = realId;
  }
  await this.api.post(`/api/games/${realId}/team`, { teamId: team.id });
});

Then('game id {int} should have team {string} with members Jonas, Esmee, Floor', async function (gameId, teamName) {
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  const res = await this.api.get(`/api/games/${realId}`);
  const teamId = res.data.teamId;
  assert(teamId, 'game has no team assigned');
  const teamRes = await this.api.get(`/api/teams/${teamId}`);
  const names = teamRes.data.members.map(m=>m.player?.name || m.playerName).filter(Boolean);
  for (const expected of ['Jonas','Esmee','Floor']) assert(names.includes(expected));
});

Given('the player list contains:', async function (dataTable) {
  const rows = dataTable.hashes();
  for (const r of rows) {
    await this.api.post('/api/players', { name: r.name, gender: r.gender }).catch(()=>{});
  }
});

Given('a list of players exists', async function () {
  // create a reasonable default list used by feature scenarios
  const defaults = ['Jonas','Esmee','Floor','Floortje','Jarno','Kian','Thomas','Tess','Gita','Demi'];
  for (const name of defaults) {
    await this.api.post('/api/players', { name, gender: /[aeiou]$/.test(name) ? 'female' : 'male' }).catch(()=>{});
  }
});

When('I delete a player from the list', async function () {
  // pick the first player returned by the API and delete them
  const players = (await this.api.get('/api/players')).data;
  if (!players.length) throw new Error('no players to delete');
  const p = players[0];
  await this.api.delete(`/api/players/${p.id}`);
  this._lastDeletedPlayer = p.name;
});

Then('the player should no longer appear in the list', async function () {
  const players = (await this.api.get('/api/players')).data;
  const names = players.map((p) => p.name);
  const name = this._lastDeletedPlayer;
  if (!name) throw new Error('no player was deleted earlier in the scenario');
  assert(!names.includes(name), `player ${name} still present`);
});

When('I delete player {string}', async function (name) {
  const players = (await this.api.get('/api/players')).data;
  const p = players.find((x) => x.name === name);
  if (!p) throw new Error(`player ${name} not found`);
  await this.api.delete(`/api/players/${p.id}`);
});

Then('player {string} should not be present in the player list', async function (name) {
  const players = (await this.api.get('/api/players')).data;
  const names = players.map((p) => p.name);
  assert(!names.includes(name), `player ${name} still present`);
});

When('I view player Jonas', async function () {
  const players = (await this.api.get('/api/players')).data;
  this.latestPlayer = players.find(p=>p.name==='Jonas');
});

Then('I should see his gender is {string}', function (gender) {
  assert(this.latestPlayer, 'no player loaded');
  assert.strictEqual(this.latestPlayer.gender, gender);
});
