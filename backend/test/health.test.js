"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
// Quick smoke test: ensure server returns health
(0, vitest_1.it)('returns health ok', async () => {
    const app = (0, express_1.default)();
    app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
    const res = await (0, supertest_1.default)(app).get('/api/health');
    (0, vitest_1.expect)(res.status).toBe(200);
    (0, vitest_1.expect)(res.body.status).toBe('ok');
});
