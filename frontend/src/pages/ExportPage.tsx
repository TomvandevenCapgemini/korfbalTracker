import React, { useEffect, useState } from 'react';

interface TeamStats {
  homeWins: number;
  awayWins: number;
  homeLosses: number;
  awayLosses: number;
}

interface Statistics {
  type_of_goals_scored_the_most: string;
  type_of_goals_scored_against_the_most: string;
  most_goals_against_males_or_female_players: string;
  home_advantage: Record<string, TeamStats>;
}
import { exportGameExcel, exportAllExcel, fetchOverallStats } from '../api';

export default function ExportPage(){
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await fetchOverallStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }
    fetchStats();
  }, []);

  async function downloadGame(id:number){
    const data = await exportGameExcel(id);
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `game-${id}.xlsx`; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAll(){
    const data = await exportAllExcel();
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `all-games.xlsx`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Export & Statistics</h2>
      <div className="mt-4">
        <label>Export single game (id):</label>
        <div className="flex gap-2 mt-2">
          <input id="gameId" className="border p-2" placeholder="game id" />
          <button className="bg-blue-600 text-white px-3" onClick={()=>{ const id = Number((document.getElementById('gameId') as HTMLInputElement).value); if(id) downloadGame(id); }}>Download</button>
        </div>
      </div>

      <div className="mt-6">
        <button className="bg-green-600 text-white px-3" onClick={downloadAll}>Download all games</button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Overall statistics</h3>
        {stats ? (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium">Most common goals</h4>
              <p>Most scored type: {stats.type_of_goals_scored_the_most || 'N/A'}</p>
              <p>Most scored against type: {stats.type_of_goals_scored_against_the_most || 'N/A'}</p>
            </div>
            
            <div>
              <h4 className="font-medium">Goals by gender</h4>
              <p>Most goals against: {stats.most_goals_against_males_or_female_players || 'N/A'}</p>
            </div>

            <div>
              <h4 className="font-medium">Home/Away advantage</h4>
              {Object.entries(stats.home_advantage || {}).map(([team, homeStats]) => (
                <div key={team} className="ml-4">
                  <p className="font-medium">{team}</p>
                  <p className="ml-2">Home: {homeStats.homeWins}W - {homeStats.homeLosses}L</p>
                  <p className="ml-2">Away: {homeStats.awayWins}W - {homeStats.awayLosses}L</p>
                  <p className="ml-2 text-sm">
                    {homeStats.homeWins/(homeStats.homeWins + homeStats.homeLosses) > homeStats.awayWins/(homeStats.awayWins + homeStats.awayLosses)
                      ? 'Home advantage: Yes'
                      : 'Home advantage: No'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Loading statistics...</p>
        )}
      </div>
    </div>
  );
}
