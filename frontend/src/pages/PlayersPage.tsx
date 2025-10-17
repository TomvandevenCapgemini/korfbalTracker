import React, { useEffect, useState } from 'react';
import { fetchPlayers, createPlayer } from '../api';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');

  useEffect(() => { fetchPlayers().then(setPlayers).catch(console.error); }, []);

  async function add() {
    const p = await createPlayer({ name, gender });
    setPlayers((s) => [p, ...s]);
    setName('');
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input className="border p-2" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <select value={gender} onChange={(e)=>setGender(e.target.value)}>
          <option value="female">female</option>
          <option value="male">male</option>
        </select>
        <button onClick={add} className="bg-green-600 text-white px-3">Add</button>
      </div>
      <ul className="space-y-2">
        {players.map(p=> <li key={p.id} className="bg-white p-2 rounded">{p.name} — {p.gender}</li>)}
      </ul>
    </div>
  );
}
