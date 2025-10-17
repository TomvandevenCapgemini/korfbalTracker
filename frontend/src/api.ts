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

export async function fetchTeams() {
  const r = await api.get('/teams');
  return r.data;
}

export async function createTeam(payload) {
  const r = await api.post('/teams', payload);
  return r.data;
}

export async function addTeamMember(teamId, payload) {
  const r = await api.post(`/teams/${teamId}/members`, payload);
  return r.data;
}

export async function removeTeamMember(teamId, playerId) {
  const r = await api.delete(`/teams/${teamId}/members/${playerId}`);
  return r.data;
}

export async function copyTeamMembers(teamId, fromTeamId) {
  const r = await api.post(`/teams/${teamId}/copy-members`, { fromTeamId });
  return r.data;
}

export async function assignTeamToGame(gameId, teamId) {
  const r = await api.post(`/games/${gameId}/team`, { teamId });
  return r.data;
}

export async function fetchOverallStats() {
  // using the same aggregation logic as backend (simple endpoint could be added)
  const r = await api.get('/export/all');
  return r.data;
}

export default api;
