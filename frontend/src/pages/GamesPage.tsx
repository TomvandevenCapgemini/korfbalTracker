import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGames, createGame } from '../api';
import { useUI } from '../contexts/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [opponent, setOpponent] = useState('');
  const [copyFrom, setCopyFrom] = useState<number | null>(null);
  const { loading, setLoading, showToast } = useUI();

  useEffect(() => {
    setLoading(true);
    fetchGames()
      .then(setGames)
      .catch((e) => showToast('Failed to load games'))
      .finally(() => setLoading(false));
  }, []);

  async function addGame() {
    try {
      setLoading(true);
      const payload: any = { opponent: opponent || 'New Game', date: new Date().toISOString().split('T')[0], home: true };
      const g = await createGame(payload);
      // if copyFrom provided, request backend to copy team assignment
      if (copyFrom) {
        // find previous game's team and assign
        const prevRes = await fetch(`/api/games/${copyFrom}`).then(r=>r.json()).catch(()=>null);
        if (prevRes && prevRes.teamId) await fetch(`/api/games/${g.id}/team`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ teamId: prevRes.teamId }) });
      }
      setGames((s) => [g, ...s]);
      setOpponent('');
      setCopyFrom(null);
    } catch (e) {
      showToast('Could not create game');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input className="border p-2" value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Opponent or new game name" />
        <input className="border p-2 w-32" type="number" placeholder="Copy from id" value={copyFrom??''} onChange={(e)=>setCopyFrom(Number(e.target.value)||null)} />
        <button className="bg-blue-600 text-white px-4 py-2" onClick={addGame}>Create</button>
      </div>
      {loading && <div className="mb-4"><LoadingSpinner /></div>}
      <ul className="space-y-2">
        {games.map((g) => (
          <li key={g.id} className="bg-white p-3 rounded shadow">
            <Link to={`/games/${g.id}`} className="font-semibold">{g.opponent}</Link>
            <div className="text-sm text-gray-600">{g.date} — {g.home ? 'Home' : 'Away'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
