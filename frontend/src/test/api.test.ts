import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as api from '../api';

vi.mock('axios');

// keep typing simple to avoid TS issues in test environment
const mocked = axios as any;

beforeEach(() => {
  vi.resetAllMocks();
});

describe('frontend api helpers', () => {
  it('fetchPlayers calls /players and returns data', async () => {
    const fake = [{ id: 1, name: 'T' }];
    const get = vi.fn().mockResolvedValue({ data: fake });
    mocked.create = vi.fn().mockReturnValue({ get });
  vi.resetModules();
  const api = await import('../api');
    const data = await api.fetchPlayers();
    expect(data).toEqual(fake);
    expect(get).toHaveBeenCalledWith('/players');
  });

  it('createPlayer posts and returns created player', async () => {
    const created = { id: 2, name: 'Z' };
    const post = vi.fn().mockResolvedValue({ data: created });
    mocked.create = vi.fn().mockReturnValue({ post });
  vi.resetModules();
  const api = await import('../api');
    const p = await api.createPlayer({ name: 'Z' });
    expect(p).toEqual(created);
    expect(post).toHaveBeenCalledWith('/players', { name: 'Z' });
  });

  it('exportGameExcel calls export endpoint', async () => {
    const buf = new ArrayBuffer(8);
    const get = vi.fn().mockResolvedValue({ data: buf });
    mocked.create = vi.fn().mockReturnValue({ get });
  vi.resetModules();
  const api = await import('../api');
    const res = await api.exportGameExcel(5);
    expect(res).toBe(buf);
    expect(get).toHaveBeenCalledWith('/export/game/5', { responseType: 'arraybuffer' });
  });
});
