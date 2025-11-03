import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GamesPage from '../pages/GamesPage';
import { UIProvider } from '../contexts/UIContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../api');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GamesPage', () => {
  it('renders list of games and creates a new game', async () => {
    const fakeGames = [{ id: 1, opponent: 'Team A', date: '2025-10-01', home: true }];
    const fetchGames = vi.fn().mockResolvedValue(fakeGames);
    const createGame = vi.fn().mockResolvedValue({ id: 2, opponent: 'New', date: '2025-11-03', home: true });
    const mocked = await import('../api');
    mocked.fetchGames = fetchGames;
    mocked.createGame = createGame;

    render(
      <UIProvider>
        <BrowserRouter>
          <GamesPage />
        </BrowserRouter>
      </UIProvider>
    );

    // initial load should call fetchGames
    await waitFor(() => expect(fetchGames).toHaveBeenCalled());
    expect(screen.getByText('Team A')).toBeTruthy();

    // create a new game via UI
    fireEvent.change(screen.getByPlaceholderText('Opponent or new game name'), { target: { value: 'New' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(createGame).toHaveBeenCalled());
    expect(screen.getByText('New')).toBeTruthy();
  });
});
