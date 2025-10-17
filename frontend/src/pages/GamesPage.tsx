import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGames, createGame } from '../api';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [opponent, setOpponent] = useState('');

  useEffect(() => {
    fetchGames().then(setGames).catch(console.error);
  }, []);

  async function addGame() {
    const g = await createGame({ opponent, date: new Date().toISOString().split('T')[0], home: true });
    setGames((s) => [g, ...s]);
    setOpponent('');
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input className="border p-2" value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Opponent" />
        <button className="bg-blue-600 text-white px-4 py-2" onClick={addGame}>Create</button>
      </div>
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
