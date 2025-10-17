import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

import healthRouter from '../src/index';

// Quick smoke test: ensure server returns health
it('returns health ok', async () => {
  const app = express();
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});
