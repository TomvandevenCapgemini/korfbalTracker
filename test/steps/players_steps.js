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
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  await this.api.post(`/api/games/${realId}/team`, { teamId: team.id });
});

Then('game id {int} should have team {string} with members Jonas, Esmee, Floor', async function (gameId, teamName) {
  const res = await this.api.get(`/api/games/${gameId}`);
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

When('I view player Jonas', async function () {
  const players = (await this.api.get('/api/players')).data;
  this.latestPlayer = players.find(p=>p.name==='Jonas');
});

Then('I should see his gender is {string}', function (gender) {
  assert(this.latestPlayer, 'no player loaded');
  assert.strictEqual(this.latestPlayer.gender, gender);
});
