import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function fetchGames() {
  const r = await api.get('/games');
  return r.data;
}

export async function fetchGame(id) {
  const r = await api.get(`/games/${id}`);
  return r.data;
}

export async function createGame(payload) {
  const r = await api.post('/games', payload);
  return r.data;
}

export async function fetchPlayers() {
  const r = await api.get('/players');
  return r.data;
}

export async function createPlayer(payload) {
  const r = await api.post('/players', payload);
  return r.data;
}

export async function createEvent(gameId, payload) {
  const r = await api.post(`/games/${gameId}/events`, payload);
  return r.data;
}

export async function exportGameExcel(gameId) {
  const r = await api.get(`/export/game/${gameId}`, { responseType: 'arraybuffer' });
  return r.data;
}

export async function exportAllExcel() {
  const r = await api.get(`/export/all`, { responseType: 'arraybuffer' });
  return r.data;
}

export async function fetchOverallStats() {
  // using the same aggregation logic as backend (simple endpoint could be added)
  const r = await api.get('/export/all');
  return r.data;
}

export default api;
