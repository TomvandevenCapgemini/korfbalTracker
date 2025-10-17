import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchGame } from '../api';
import { fetchPlayers, createEvent } from '../api';
import { useUI } from '../contexts/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

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

  const { loading, setLoading, showToast } = useUI();

  useEffect(() => {
    if (!id) return;
    const gameId = Number(id);
    if (Number.isNaN(gameId)) return;
    setLoading(true);
    Promise.all([fetchGame(gameId), fetchPlayers()])
      .then(([g, p]) => { setGame(g); setPlayers(p); })
      .catch(() => showToast('Failed to load game'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!game) return <div className="py-8"><LoadingSpinner /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{game.opponent}</h2>
      <div>Date: {game.date}</div>
      <div>Home: {game.home ? 'Yes' : 'No'}</div>
      <section>
        <h3 className="font-semibold">Events</h3>
        <ul className="space-y-2">
          {(game.events || []).map((e: any) => {
            const scorer = players.find((p:any)=>p.id===e.scorerId);
            const against = players.find((p:any)=>p.id===e.againstId);
            if (e.type === 'goal') {
              const meta = (()=>{ try { return JSON.parse(e.metadata || '{}'); } catch (err) { return {}; } })();
              const how = meta.goalType || 'other';
              return <li key={e.id} className="bg-white p-2 rounded">Goal: {scorer ? scorer.name : 'Unknown'} — {how} {against ? `(against ${against.name})` : ''} — minute {e.minute} ({e.half})</li>;
            }
            if (e.type === 'substitution') {
              const inP = players.find((p:any)=>p.id===e.scorerId);
              const outP = players.find((p:any)=>p.id===e.againstId);
              return <li key={e.id} className="bg-white p-2 rounded">Substitution: {inP ? inP.name : 'Unknown'} in, {outP ? outP.name : 'Unknown'} out — minute {e.minute} ({e.half})</li>;
            }
            return <li key={e.id} className="bg-white p-2 rounded">{e.type} – minute {e.minute} ({e.half})</li>;
          })}
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
            <option value="other">other</option>
          </select>
          <input type="number" value={minute} onChange={(e)=>setMinute(Number(e.target.value))} className="w-20" />
          <select value={half} onChange={(e)=>setHalf(e.target.value as any)}>
            <option value="first">first</option>
            <option value="second">second</option>
          </select>
          <button className="bg-blue-600 text-white px-3" onClick={async ()=>{
            if (!scorerId) return showToast('Select a scorer');
            try {
              setLoading(true);
              await createEvent(game.id, { type: 'goal', goalType, scorerId, minute, half });
              const updated = await fetchGame(Number(id!));
              setGame(updated);
              showToast('Goal logged');
            } catch (e) {
              showToast('Could not log goal');
            } finally { setLoading(false); }
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
            if (!inPlayerId || !outPlayerId) return showToast('Select both players');
            const inP = players.find(p=>p.id===Number(inPlayerId));
            const outP = players.find(p=>p.id===Number(outPlayerId));
            if (inP.gender !== outP.gender) return showToast('Substitution genders must match');
            try {
              setLoading(true);
              await createEvent(game.id, { type: 'substitution', inPlayerId, outPlayerId, minute, half });
              const updated = await fetchGame(Number(id!));
              setGame(updated);
              showToast('Substitution recorded');
            } catch (e) { showToast('Could not create substitution'); }
            finally { setLoading(false); }
          }}>Make substitution</button>
        </div>
      </section>
    </div>
  );
}
