import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchGame } from '../api';
import { fetchPlayers, createEvent } from '../api';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [minute, setMinute] = useState(1);
  const [half, setHalf] = useState<'first'|'second'>('first');
  const [scorerId, setScorerId] = useState<number | null>(null);
  const [goalType, setGoalType] = useState('schot');
  const [inPlayerId, setInPlayerId] = useState<number | null>(null);
  const [outPlayerId, setOutPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchGame(id).then(setGame).catch(console.error);
    fetchPlayers().then(setPlayers).catch(console.error);
  }, [id]);

  if (!game) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{game.opponent}</h2>
      <div>Date: {game.date}</div>
      <div>Home: {game.home ? 'Yes' : 'No'}</div>
      <section>
        <h3 className="font-semibold">Events</h3>
        <ul className="space-y-2">
          {(game.events || []).map((e) => (
            <li key={e.id} className="bg-white p-2 rounded">{e.type} – minute {e.minute} ({e.half})</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold">Log goal</h3>
        <div className="flex gap-2 items-center">
          <select value={scorerId ?? ''} onChange={(e)=>setScorerId(Number(e.target.value) || null)}>
            <option value="">Select scorer</option>
            {players.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.gender})</option>)}
          </select>
          <select value={goalType} onChange={(e)=>setGoalType(e.target.value)}>
            <option value="schot">schot</option>
            <option value="doorloopbal">doorloopbal</option>
            <option value="vrije worp">vrije worp</option>
            <option value="strafworp">strafworp</option>
            <option value="vrij invoerveld">vrij invoerveld</option>
          </select>
          <input type="number" value={minute} onChange={(e)=>setMinute(Number(e.target.value))} className="w-20" />
          <select value={half} onChange={(e)=>setHalf(e.target.value as any)}>
            <option value="first">first</option>
            <option value="second">second</option>
          </select>
          <button className="bg-blue-600 text-white px-3" onClick={async ()=>{
            if (!scorerId) return alert('select scorer');
            await createEvent(game.id, { type: 'goal', goalType, scorerId, minute, half });
            const updated = await fetchGame(id!);
            setGame(updated);
          }}>Log goal</button>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold">Substitution</h3>
        <div className="flex gap-2 items-center">
          <select value={outPlayerId ?? ''} onChange={(e)=>setOutPlayerId(Number(e.target.value) || null)}>
            <option value="">Out player</option>
            {players.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.gender})</option>)}
          </select>
          <select value={inPlayerId ?? ''} onChange={(e)=>setInPlayerId(Number(e.target.value) || null)}>
            <option value="">In player</option>
            {players.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.gender})</option>)}
          </select>
          <input type="number" value={minute} onChange={(e)=>setMinute(Number(e.target.value))} className="w-20" />
          <select value={half} onChange={(e)=>setHalf(e.target.value as any)}>
            <option value="first">first</option>
            <option value="second">second</option>
          </select>
          <button className="bg-blue-600 text-white px-3" onClick={async ()=>{
            if (!inPlayerId || !outPlayerId) return alert('select both players');
            // client-side gender check
            const inP = players.find(p=>p.id===Number(inPlayerId));
            const outP = players.find(p=>p.id===Number(outPlayerId));
            if (inP.gender !== outP.gender) return alert('Substitution genders must match');
            await createEvent(game.id, { type: 'substitution', inPlayerId, outPlayerId, minute, half });
            const updated = await fetchGame(id!);
            setGame(updated);
          }}>Make substitution</button>
        </div>
      </section>
    </div>
  );
}
