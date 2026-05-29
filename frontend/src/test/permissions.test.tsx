// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { DEFAULT_ADMIN } from '../App';

const team = (id: string, naam: string) => ({ id, naam, manager: '' });

function seed({
  user,
  teams = [],
  spelers = [],
  wedstrijden = [],
  gebruikers = [DEFAULT_ADMIN],
}: any) {
  localStorage.clear();
  localStorage.setItem('ow_teams', JSON.stringify(teams));
  localStorage.setItem('ow_spelers', JSON.stringify(spelers));
  localStorage.setItem('ow_wedstrijden', JSON.stringify(wedstrijden));
  localStorage.setItem('ow_gebruikers', JSON.stringify(gebruikers));
  if (user) localStorage.setItem('ow_huidigGebruiker', JSON.stringify(user));
}

describe('Login & default admin', () => {
  it('logs in with the default Manager / admin credentials and shows the role badge', async () => {
    seed({ user: null });
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText(/Gebruikersnaam/i), 'Manager');
    await userEvent.type(screen.getByPlaceholderText(/Wachtwoord/i), 'admin');
    await userEvent.click(screen.getByRole('button', { name: /Inloggen/i }));
    expect(screen.getByText(/Ingelogd als: Manager \(Admin\)/i)).toBeInTheDocument();
  });

  it('rejects bad credentials with a visible error', async () => {
    seed({ user: null });
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText(/Gebruikersnaam/i), 'Manager');
    await userEvent.type(screen.getByPlaceholderText(/Wachtwoord/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /Inloggen/i }));
    expect(screen.getByText(/Ongeldige gebruikersnaam of wachtwoord/i)).toBeInTheDocument();
  });
});

describe('Tab visibility by role', () => {
  it('Admin sees the Gebruikers tab', () => {
    seed({ user: DEFAULT_ADMIN });
    render(<App />);
    expect(screen.getByRole('button', { name: /Gebruikers/i })).toBeInTheDocument();
  });

  it('Teammanager does NOT see the Gebruikers tab', () => {
    const tm = { id: 'u2', naam: 'Coach', rol: 'Teammanager', teamId: 't1', wachtwoord: 'pw' };
    seed({ user: tm, teams: [team('t1', 'A1')], gebruikers: [DEFAULT_ADMIN, tm] });
    render(<App />);
    expect(screen.queryByRole('button', { name: /Gebruikers/i })).toBeNull();
  });

  it('Speler does NOT see the Gebruikers tab', () => {
    const sp = { id: 'u3', naam: 'Sp1', rol: 'Speler', teamId: 't1', wachtwoord: 'pw' };
    seed({ user: sp, teams: [team('t1', 'A1')], gebruikers: [DEFAULT_ADMIN, sp] });
    render(<App />);
    expect(screen.queryByRole('button', { name: /Gebruikers/i })).toBeNull();
  });
});

describe('Protected admin in Gebruikers', () => {
  it('shows a "system" badge and "onverwijderbaar" — no delete button — for the protected admin', async () => {
    const tm = { id: 'u2', naam: 'Coach', rol: 'Teammanager', teamId: 't1', wachtwoord: 'pw' };
    seed({ user: DEFAULT_ADMIN, teams: [team('t1', 'A1')], gebruikers: [DEFAULT_ADMIN, tm] });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /Gebruikers/i }));
    const adminRow = screen.getByText('Manager').closest('tr')!;
    expect(within(adminRow).getByText(/system/i)).toBeInTheDocument();
    expect(within(adminRow).getByText(/onverwijderbaar/i)).toBeInTheDocument();
    // The other user has a delete button — make sure we're checking the right row.
    const coachRow = screen.getByText('Coach').closest('tr')!;
    expect(within(coachRow).getByRole('button', { name: /🗑/ })).toBeInTheDocument();
  });
});

describe('Teammanager without team', () => {
  const tmNoTeam = { id: 'u9', naam: 'NewCoach', rol: 'Teammanager', teamId: null, wachtwoord: 'pw' };

  it('shows the "Maak je team aan" panel on the Teams tab', async () => {
    seed({ user: tmNoTeam, gebruikers: [DEFAULT_ADMIN, tmNoTeam] });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /👕 Teams/ }));
    expect(screen.getByRole('heading', { name: /Maak je team aan/i })).toBeInTheDocument();
  });

  it('creating a team links it to the user and removes the welcome panel', async () => {
    seed({ user: tmNoTeam, gebruikers: [DEFAULT_ADMIN, tmNoTeam] });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /👕 Teams/ }));
    await userEvent.type(screen.getByPlaceholderText(/Teamnaam/i), 'Mijn Eerste Team');
    await userEvent.click(screen.getByRole('button', { name: /Mijn team aanmaken/i }));
    // Welcome panel disappears, team appears in the list with "mijn team" badge
    expect(screen.queryByRole('heading', { name: /Maak je team aan/i })).toBeNull();
    expect(screen.getByText('Mijn Eerste Team')).toBeInTheDocument();
    expect(screen.getByText(/mijn team/i)).toBeInTheDocument();
    // The user's teamId is now persisted
    const stored = JSON.parse(localStorage.getItem('ow_gebruikers') || '[]');
    const me = stored.find((u: any) => u.id === 'u9');
    expect(me.teamId).toBeTruthy();
  });
});

describe('Teammanager visibility on Teams tab', () => {
  it('shows only their own team, not other teams', async () => {
    const tm = { id: 'u2', naam: 'Coach', rol: 'Teammanager', teamId: 't1', wachtwoord: 'pw' };
    seed({
      user: tm,
      teams: [team('t1', 'A1'), team('t2', 'B1')],
      gebruikers: [DEFAULT_ADMIN, tm],
    });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /👕 Teams/ }));
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.queryByText('B1')).toBeNull();
  });

  it('does NOT show the admin "Nieuw team toevoegen" panel', async () => {
    const tm = { id: 'u2', naam: 'Coach', rol: 'Teammanager', teamId: 't1', wachtwoord: 'pw' };
    seed({ user: tm, teams: [team('t1', 'A1')], gebruikers: [DEFAULT_ADMIN, tm] });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /👕 Teams/ }));
    expect(screen.queryByRole('heading', { name: /Nieuw team toevoegen/i })).toBeNull();
  });
});
