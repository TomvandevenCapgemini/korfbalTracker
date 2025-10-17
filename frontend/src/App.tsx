import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import GamesPage from './pages/GamesPage';
import GameDetail from './pages/GameDetail';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import ExportPage from './pages/ExportPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex gap-6">
          <h1 className="text-xl font-bold">Korfbal Tracker</h1>
          <nav className="flex gap-4">
            <Link to="/games" className="text-blue-600">Games</Link>
            <Link to="/players" className="text-blue-600">Players</Link>
            <Link to="/teams" className="text-blue-600">Teams</Link>
            <Link to="/export" className="text-blue-600">Export</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<GamesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </main>
    </div>
  );
}
