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
