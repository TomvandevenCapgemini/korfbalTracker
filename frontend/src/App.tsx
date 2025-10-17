import React, { useEffect, useState } from 'react';

type Match = {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
};

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => r.json())
      .then(setMatches)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Korfbal Tracker</h1>
      <ul>
        {matches.map((m) => (
          <li key={m.id}>{`${m.date} — ${m.homeTeam} ${m.homeScore} : ${m.awayScore} ${m.awayTeam}`}</li>
        ))}
      </ul>
    </div>
  );
}
