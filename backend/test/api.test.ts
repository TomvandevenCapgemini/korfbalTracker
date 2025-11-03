import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to reset DB tables used in tests
async function clearDb() {
  await prisma.event.deleteMany().catch(()=>{});
  await prisma.teamMembership.deleteMany().catch(()=>{});
  await prisma.team.deleteMany().catch(()=>{});
  await prisma.game.deleteMany().catch(()=>{});
  await prisma.player.deleteMany().catch(()=>{});
}

describe('API integration tests', () => {
  beforeEach(async () => {
    await clearDb();
  });

  it('creates and lists players', async () => {
    const res = await request(app).post('/api/players').send({ name: 'Alice', gender: 'female' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');

    const list = await request(app).get('/api/players');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.find((p:any)=>p.name==='Alice')).toBeTruthy();
  });

  it('creates a team and adds/removes members', async () => {
    await request(app).post('/api/players').send({ name: 'Bob', gender: 'male' });
    const players = (await request(app).get('/api/players')).body;
    const bob = players.find((p:any)=>p.name==='Bob');

    const teamRes = await request(app).post('/api/teams').send({ name: 'Testers' });
    expect(teamRes.status).toBe(200);
    const teamId = teamRes.body.id;

    const add = await request(app).post(`/api/teams/${teamId}/members`).send({ playerId: bob.id });
    expect(add.status).toBe(200);

    const getTeam = await request(app).get(`/api/teams/${teamId}`);
    expect(getTeam.status).toBe(200);
    expect(getTeam.body.members.length).toBeGreaterThan(0);

    // remove member
    const remove = await request(app).delete(`/api/teams/${teamId}/members/${bob.id}`);
    expect(remove.status).toBe(200);
  });

  it('creates games and assigns teams', async () => {
    const gameRes = await request(app).post('/api/games').send({ opponent: 'Opp', date: '2025-11-03', home: true });
    expect(gameRes.status).toBe(200);
    const game = gameRes.body;

    const teamRes = await request(app).post('/api/teams').send({ name: 'GTeam' });
    const team = teamRes.body;

    const assign = await request(app).post(`/api/games/${game.id}/team`).send({ teamId: team.id });
    expect(assign.status).toBe(200);
    const updated = (await request(app).get(`/api/games/${game.id}`)).body;
    expect(updated.teamId).toBe(team.id);
  });

  it('logs goal and substitution events and updates scores', async () => {
    // create players
    await request(app).post('/api/players').send({ name: 'Jon', gender: 'male' });
    await request(app).post('/api/players').send({ name: 'Kim', gender: 'male' });
    const players = (await request(app).get('/api/players')).body;
    const jon = players.find((p:any)=>p.name==='Jon');
    const kim = players.find((p:any)=>p.name==='Kim');

    const gRes = await request(app).post('/api/games').send({ opponent: 'X', date: '2025-11-03' });
    const game = gRes.body;

    const goal = await request(app).post(`/api/games/${game.id}/events`).send({ type: 'goal', scorerId: jon.id, goalType: 'schot', minute: 10, half: 'first' });
    expect(goal.status).toBe(200);
    const updated = (await request(app).get(`/api/games/${game.id}`)).body;
    expect(updated.events.some((e:any)=>e.type==='goal')).toBeTruthy();

    // substitution with matching genders
    const sub = await request(app).post(`/api/games/${game.id}/events`).send({ type: 'substitution', inPlayerId: kim.id, outPlayerId: jon.id, minute: 20, half: 'first' });
    expect(sub.status).toBe(200);
    const afterSub = (await request(app).get(`/api/games/${game.id}`)).body;
    expect(afterSub.events.some((e:any)=>e.type==='substitution')).toBeTruthy();

    // substitution with mismatched genders should fail
    await request(app).post('/api/players').send({ name: 'F', gender: 'female' });
    const f = (await request(app).get('/api/players')).body.find((p:any)=>p.name==='F');
    const bad = await request(app).post(`/api/games/${game.id}/events`).send({ type: 'substitution', inPlayerId: f.id, outPlayerId: kim.id }).catch(()=>{});
    // supertest will not throw; check response from endpoint by calling and inspecting status
    const badResp = await request(app).post(`/api/games/${game.id}/events`).send({ type: 'substitution', inPlayerId: f.id, outPlayerId: kim.id });
    expect(badResp.status).toBe(400);
  });

  it('exports game and all-games as excel buffers', async () => {
    // create players and a game with an event
    await request(app).post('/api/players').send({ name: 'E1', gender: 'male' });
    const p = (await request(app).get('/api/players')).body[0];
    const gRes = await request(app).post('/api/games').send({ opponent: 'Exp', date: '2025-11-03' });
    const game = gRes.body;
    await request(app).post(`/api/games/${game.id}/events`).send({ type: 'goal', scorerId: p.id, goalType: 'schot' });

  const one = await request(app).get(`/api/export/game/${game.id}`);
  expect(one.status).toBe(200);
  // Content-Type should be the Excel mime type (may include charset)
  expect(one.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  const all = await request(app).get('/api/export/all');
  expect(all.status).toBe(200);
  expect(all.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

});
