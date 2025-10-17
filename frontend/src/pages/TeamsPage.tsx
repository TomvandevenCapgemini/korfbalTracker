import React, { useEffect, useState } from 'react';
import { fetchTeams, createTeam, fetchPlayers, addTeamMember, removeTeamMember, copyTeamMembers, fetchGames, assignTeamToGame } from '../api';
import { useUI } from '../contexts/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TeamsPage(){
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any|null>(null);
  const [selectedGame, setSelectedGame] = useState<number|null>(null);

  const { loading, setLoading, showToast } = useUI();

  async function load(){
    try {
      setLoading(true);
      const [t,p] = await Promise.all([fetchTeams(), fetchPlayers()]);
      const g = await (await fetch('/api/games')).json();
      setTeams(t); setPlayers(p); setGames(g);
    } catch (e) { showToast('Failed to load teams'); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function handleCreate(){
    if(!newTeamName) return showToast('Enter a team name');
    try {
      setLoading(true);
      await createTeam({ name: newTeamName });
      setNewTeamName('');
      await load();
    } catch (e) { showToast('Could not create team'); }
    finally { setLoading(false); }
  }

  async function handleAddMember(teamId: any, playerId: any){
    await addTeamMember(teamId, { playerId });
    load();
  }

  async function handleRemoveMember(teamId: any, playerId: any){
    await removeTeamMember(teamId, playerId);
    load();
  }

  async function handleCopy(teamId: any, fromTeamId: any){
    await copyTeamMembers(teamId, fromTeamId);
    load();
  }

  async function handleAssignTeam(gameId: any, teamId: any){
    await assignTeamToGame(gameId, teamId);
    load();
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Teams</h2>

      <div className="my-4">
        <input className="border p-1" value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} placeholder="New team name" />
        <button className="ml-2 btn" onClick={handleCreate} disabled={loading}>Create</button>
      </div>

      {loading && <div className="mb-4"><LoadingSpinner /></div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Teams</h3>
          {teams.map((t:any)=>(
            <div key={t.id} className="border p-2 my-2">
              <div className="flex justify-between">
                <div>
                  <strong>{t.name}</strong>
                </div>
                <div>
                  <button className="btn" onClick={()=>setSelectedTeam(t)}>Manage</button>
                </div>
              </div>
              <div className="text-sm mt-2">Members: {t.members.map((m:any)=>m.player.name).join(', ')}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-semibold">Manage Team</h3>
          {selectedTeam ? (
            <div>
              <h4 className="font-bold">{selectedTeam.name}</h4>
              <div className="mt-2">
                <div className="text-sm">Members:</div>
                {selectedTeam.members.map((m:any)=>(
                  <div key={m.id} className="flex items-center my-1">
                    <div className="flex-1">{m.player.name} ({m.player.gender})</div>
                    <button className="btn-sm" onClick={()=>handleRemoveMember(selectedTeam.id, m.player.id)}>Remove</button>
                  </div>
                ))}

                <div className="mt-4">
                  <div className="text-sm">Add player:</div>
                  {players.map((p:any)=>(
                    <div key={p.id} className="flex items-center my-1">
                      <div className="flex-1">{p.name} ({p.gender})</div>
                      <button className="btn-sm" onClick={()=>handleAddMember(selectedTeam.id, p.id)}>Add</button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="text-sm">Copy members from:</div>
                  {teams.filter((tt:any)=>tt.id!==selectedTeam.id).map((tt:any)=>(
                    <div key={tt.id} className="flex items-center my-1">
                      <div className="flex-1">{tt.name}</div>
                      <button className="btn-sm" onClick={()=>handleCopy(selectedTeam.id, tt.id)}>Copy</button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="text-sm">Assign to game:</div>
                  <select onChange={e=>setSelectedGame(Number(e.target.value))} className="border p-1">
                    <option value="">-- select game --</option>
                    {games.map((g:any)=>(<option key={g.id} value={g.id}>{g.opponent} ({g.date})</option>))}
                  </select>
                  <button className="ml-2 btn" onClick={()=>handleAssignTeam(selectedGame, selectedTeam.id)}>Assign</button>
                </div>
              </div>
            </div>
          ) : (
            <div>Select a team and click Manage</div>
          )}
        </div>
      </div>
    </div>
  );
}
