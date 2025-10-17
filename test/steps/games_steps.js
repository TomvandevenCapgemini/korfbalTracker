const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

Given('a game exists with id {int} and opponent {string} and date {string}', async function (id, opponent, date) {
  // Create or update a game with specific id; backend may ignore ID, we'll store reference
  const res = await this.api.post('/api/games', { opponent, date }).catch(() => null);
  this.latestGame = res ? res.data : null;
});

When('I create a new game with:', async function (table) {
  const data = {};
  for (const row of table.rows()) data[row[0]] = row[1];
  const res = await this.api.post('/api/games', data);
  this.latestGame = res.data;
});

Then('the game should be saved with opponent {string} and date {string}', async function (opponent, date) {
  const res = await this.api.get(`/api/games/${this.latestGame.id}`);
  assert.strictEqual(res.data.opponent, opponent);
  assert.strictEqual(res.data.date, date);
});
