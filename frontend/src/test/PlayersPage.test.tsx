import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlayersPage from '../pages/PlayersPage';

vi.mock('../api');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PlayersPage', () => {
  it('loads and adds a player', async () => {
    const fakePlayers = [{ id: 1, name: 'Jonas', gender: 'male' }];
    const fetchPlayers = vi.fn().mockResolvedValue(fakePlayers);
    const createPlayer = vi.fn().mockResolvedValue({ id: 2, name: 'Sofie', gender: 'female' });
    const mocked = await import('../api');
    mocked.fetchPlayers = fetchPlayers;
    mocked.createPlayer = createPlayer;

    render(<PlayersPage />);

    await waitFor(() => expect(fetchPlayers).toHaveBeenCalled());
    expect(screen.getByText(/Jonas/)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Sofie' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => expect(createPlayer).toHaveBeenCalled());
    expect(screen.getByText(/Sofie/)).toBeTruthy();
  });
});
