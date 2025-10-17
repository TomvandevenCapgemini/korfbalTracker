const { setDefaultTimeout, Before, After } = require('@cucumber/cucumber');
const playwright = require('playwright');
const axios = require('axios');

setDefaultTimeout(60 * 1000);

Before(async function () {
  this.api = axios.create({ baseURL: 'http://localhost:4000' });
  this.browser = await playwright.chromium.launch();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  if (this.browser) await this.browser.close();
});
