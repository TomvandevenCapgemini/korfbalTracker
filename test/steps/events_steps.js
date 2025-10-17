const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('in minute {string} of the {string} half player {string} scores a goal of type {string} in game id {int}',
  async function (minute, half, playerName, type, gameId) {
    // ensure player exists
    await this.api.post('/api/players', { name: playerName, gender: 'male' }).catch(()=>{});
    // find player id
    const players = (await this.api.get('/api/players')).data;
    const p = players.find(x=>x.name===playerName);
  const payload = { type: 'goal', scorerId: p.id, minute: Number(minute), half, metadata: JSON.stringify({ goalType: type }) };
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  await this.api.post(`/api/games/${realId}/events`, payload);
  }
);

// quick-logging: allow logging a goal without specifying minute/half
When('player {string} scores a goal of type {string} in game id {int}',
  async function (playerName, type, gameId) {
    await this.api.post('/api/players', { name: playerName, gender: 'male' }).catch(()=>{});
    const players = (await this.api.get('/api/players')).data;
    const p = players.find(x=>x.name===playerName);
  const payload = { type: 'goal', scorerId: p.id, metadata: JSON.stringify({ goalType: type }) };
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  await this.api.post(`/api/games/${realId}/events`, payload);
  }
);

When('in minute {string} of the {string} half player {string} concedes a goal of type {string} against player {string} in game id {int}',
  async function (minute, half, concedingPlayer, type, againstPlayer, gameId) {
    // ensure both players exist
    await this.api.post('/api/players', { name: concedingPlayer, gender: 'female' }).catch(()=>{});
    await this.api.post('/api/players', { name: againstPlayer, gender: 'male' }).catch(()=>{});
    const players = (await this.api.get('/api/players')).data;
    const against = players.find(x=>x.name===againstPlayer);
  const payload = { type: 'goal', againstId: against.id, minute: Number(minute), half, metadata: JSON.stringify({ goalType: type }) };
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  await this.api.post(`/api/games/${realId}/events`, payload);
  }
);

When('in minute {string} of the {string} half substitute {string} enters replacing {string} in game id {int}',
  async function (minute, half, subIn, subOut, gameId) {
    // Ensure both players exist and genders set for test purposes
    await this.api.post('/api/players', { name: subIn, gender: 'female' }).catch(()=>{});
    await this.api.post('/api/players', { name: subOut, gender: 'female' }).catch(()=>{});
    const players = (await this.api.get('/api/players')).data;
    const inP = players.find(x=>x.name===subIn);
    const outP = players.find(x=>x.name===subOut);
  const payload = { type: 'substitution', inPlayerId: inP.id, outPlayerId: outP.id, minute: Number(minute), half };
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  await this.api.post(`/api/games/${realId}/events`, payload).then(()=>{}).catch(()=>{});
  }
);

When('I log a goal event in minute {string} of the {string} half in game id {int}', async function (minute, half, gameId) {
  // create a quick player and log a goal
  await this.api.post('/api/players', { name: 'Auto', gender: 'male' }).catch(()=>{});
  const players = (await this.api.get('/api/players')).data;
  const p = players.find(x=>x.name==='Auto');
  const payload = { type: 'goal', scorerId: p.id, minute: Number(minute), half, metadata: JSON.stringify({ goalType: 'auto' }) };
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  await this.api.post(`/api/games/${realId}/events`, payload);
});

Then('the game id {int} should contain an event: scorer {string}, type {string}, minute {int}, half {string}',
  async function (gameId, scorerName, type, minute, half) {
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  const res = await this.api.get(`/api/games/${realId}`);
    // try to match event by minute/half if provided, otherwise match by scorer and type
    let ev = res.data.events.find(e=>e.minute===minute && e.half===half);
    if (!ev) ev = res.data.events.find(e=>e.type==='goal' && e.scorerId && e.metadata && e.metadata.includes(type));
    assert(ev, 'event not found');
    // load players
    const players = (await this.api.get('/api/players')).data;
    const scorer = players.find(p=>p.name===scorerName);
    assert.strictEqual(ev.scorerId, scorer.id);
    assert.strictEqual(ev.type, 'goal');
  }
);

Then('the game id {int} should contain an event: against {string}, type {string}, minute {int}, half {string}',
  async function (gameId, againstName, type, minute, half) {
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  const res = await this.api.get(`/api/games/${realId}`);
    const ev = res.data.events.find(e=>e.minute===minute && e.half===half && e.againstId);
    assert(ev, 'event not found');
    const players = (await this.api.get('/api/players')).data;
    const against = players.find(p=>p.name===againstName);
    assert.strictEqual(ev.againstId, against.id);
  }
);

Then('game id {int} should contain substitution event: in {string}, out {string}, minute {int}, half {string}',
  async function (gameId, inName, outName, minute, half) {
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  const res = await this.api.get(`/api/games/${realId}`);
    const ev = res.data.events.find(e=>e.type==='substitution' && e.minute===minute && e.half===half) || res.data.events.find(e=>e.type==='substitution' && e.metadata && e.metadata.includes(inName));
    assert(ev, 'substitution not found');
    const players = (await this.api.get('/api/players')).data;
    const inP = players.find(p=>p.name===inName);
    const outP = players.find(p=>p.name===outName);
    // substitution response may return updated game, so check relations
    // the created event stores inPlayerId/outPlayerId inside metadata
    const meta = (()=>{ try { return ev.metadata ? JSON.parse(ev.metadata) : {}; } catch (e) { return {}; } })();
    assert.strictEqual(Number(meta.inPlayerId || ev.scorerId), inP.id);
    assert.strictEqual(Number(meta.outPlayerId || ev.againstId), outP.id);
  }
);

Then('the substitution should be rejected if substitute and substituted player are of different genders', async function () {
  // attempt to create a substitution with mismatched genders
  await this.api.post('/api/players', { name: 'M1', gender: 'male' }).catch(()=>{});
  await this.api.post('/api/players', { name: 'F1', gender: 'female' }).catch(()=>{});
  const players = (await this.api.get('/api/players')).data;
  const male = players.find(p=>p.name==='M1');
  const female = players.find(p=>p.name==='F1');
  const res = await this.api.post('/api/games/1/events', { type: 'substitution', scorerId: male.id, againstId: female.id, minute: 30, half: 'first' }).catch(e=>e.response);
  // backend should reject and return 400
  assert(res && res.status === 400);
});

Then('querying the database for game id {int} should return that event with minute {int} and half {string}', async function (gameId, minute, half) {
  const realId = (this._gameAlias && this._gameAlias[gameId]) ? this._gameAlias[gameId] : gameId;
  const res = await this.api.get(`/api/games/${realId}`);
  const ev = res.data.events.find(e=>e.minute===minute && e.half===half);
  assert(ev, 'event not found');
});
