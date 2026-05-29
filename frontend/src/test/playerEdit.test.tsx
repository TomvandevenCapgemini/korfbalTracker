// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { DEFAULT_ADMIN } from '../App';

function seed({ user, teams = [], spelers = [], wedstrijden = [], gebruikers = [DEFAULT_ADMIN] }: any) {
  localStorage.clear();
  localStorage.setItem('ow_teams', JSON.stringify(teams));
  localStorage.setItem('ow_spelers', JSON.stringify(spelers));
  localStorage.setItem('ow_wedstrijden', JSON.stringify(wedstrijden));
  localStorage.setItem('ow_gebruikers', JSON.stringify(gebruikers));
  if (user) localStorage.setItem('ow_huidigGebruiker', JSON.stringify(user));
}

const A1 = { id: 't1', naam: 'A1', manager: '' };
const B1 = { id: 't2', naam: 'B1', manager: '' };
const sp1 = { id: 'p1', naam: 'Jonas', nummer: '7', teamId: 't1' };

// Find the top-nav tab button (in the nav bar), distinguishing from in-page secondary tabs
// of the same label (e.g. "👤 Spelers" appears both as a nav tab and as a stat-tab toggle).
function topNav(label: RegExp) {
  const all = screen.getAllByRole('button', { name: label });
  return all[0]; // the nav bar is rendered first
}

describe('Inline player edit (admin)', () => {
  it('updates name, number and team in localStorage when saved', async () => {
    seed({ user: DEFAULT_ADMIN, teams: [A1, B1], spelers: [sp1] });
    render(<App />);
    await userEvent.click(topNav(/👤 Spelers/));

    const row = screen.getByText('Jonas').closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: /✏/ }));

    const editedRow = screen.getByDisplayValue('Jonas').closest('tr')!;
    const textInputs = within(editedRow).getAllByRole('textbox');
    const nameInput = textInputs.find(i => (i as HTMLInputElement).value === 'Jonas')!;
    const numberInput = textInputs.find(i => (i as HTMLInputElement).value === '7')!;
    const teamSelect = within(editedRow).getByRole('combobox');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jonas Updated');
    await userEvent.clear(numberInput);
    await userEvent.type(numberInput, '12');
    await userEvent.selectOptions(teamSelect, 't2');

    await userEvent.click(within(editedRow).getByRole('button', { name: /💾/ }));

    const stored = JSON.parse(localStorage.getItem('ow_spelers') || '[]');
    expect(stored).toEqual([
      { id: 'p1', naam: 'Jonas Updated', nummer: '12', teamId: 't2' },
    ]);
    expect(screen.getByText('Jonas Updated')).toBeInTheDocument();
  });

  it('does not modify state when Cancel is clicked', async () => {
    seed({ user: DEFAULT_ADMIN, teams: [A1, B1], spelers: [sp1] });
    render(<App />);
    await userEvent.click(topNav(/👤 Spelers/));
    const row = screen.getByText('Jonas').closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: /✏/ }));
    const editedRow = screen.getByDisplayValue('Jonas').closest('tr')!;
    const nameInput = within(editedRow).getByDisplayValue('Jonas') as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Discarded');
    await userEvent.click(within(editedRow).getByRole('button', { name: /✖/ }));
    const stored = JSON.parse(localStorage.getItem('ow_spelers') || '[]');
    expect(stored).toEqual([sp1]);
  });
});

describe('Stats persist when player is edited', () => {
  it('a goal scored before renaming/moving the player still counts on Statistieken', async () => {
    const game = {
      id: 'g1',
      teamId: 't1',
      tegenstander: 'Opponent',
      thuis: true,
      datum: '2026-05-01',
      locatie: 'Home',
      status: 'Gespeeld',
      events: [
        { id: 'e1', type: 'doelpunt', voorOns: true, spelerId: 'p1', minuut: 10, helft: '1e helft', doeltype: 'Schot' },
      ],
      speeltijden: [],
    };
    seed({ user: DEFAULT_ADMIN, teams: [A1, B1], spelers: [sp1], wedstrijden: [game] });
    render(<App />);

    // Edit Jonas: rename + move to B1
    await userEvent.click(topNav(/👤 Spelers/));
    const row = screen.getByText('Jonas').closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: /✏/ }));
    const editedRow = screen.getByDisplayValue('Jonas').closest('tr')!;
    const nameInput = within(editedRow).getByDisplayValue('Jonas') as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jonas Renamed');
    await userEvent.selectOptions(within(editedRow).getByRole('combobox'), 't2');
    await userEvent.click(within(editedRow).getByRole('button', { name: /💾/ }));

    // Open Statistieken; default statTab is "teams" — toggle to spelers (the LAST "👤 Spelers"
    // button is inside the stat-tab toggle, the first one is the top-nav tab).
    await userEvent.click(topNav(/📈 Statistieken/));
    const allSpelersBtns = screen.getAllByRole('button', { name: /👤 Spelers/ });
    await userEvent.click(allSpelersBtns[allSpelersBtns.length - 1]);

    const renamedRow = screen.getByText('Jonas Renamed').closest('tr')!;
    const cells = within(renamedRow).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('B1');
    expect(cells[2]).toHaveTextContent('1');
  });
});
