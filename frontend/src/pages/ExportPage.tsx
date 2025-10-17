import React, { useEffect, useState } from 'react';
import { exportGameExcel, exportAllExcel, fetchOverallStats } from '../api';

export default function ExportPage(){
  const [stats, setStats] = useState<any>(null);

  useEffect(()=>{
    // fetch overall export (it returns workbook currently) - we'll call the endpoint for stats via HEAD or expand backend if needed
  },[]);

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
        <pre>{stats?JSON.stringify(stats,null,2):'Statistics will be available in the exported workbook'}</pre>
      </div>
    </div>
  );
}
