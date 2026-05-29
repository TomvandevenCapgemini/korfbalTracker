import { describe, it, expect } from 'vitest';
import { migrateGebruikers, DEFAULT_ADMIN } from '../App';

describe('migrateGebruikers', () => {
  it('returns the default admin seed when the list is null', () => {
    expect(migrateGebruikers(null as unknown as never[])).toEqual([DEFAULT_ADMIN]);
  });

  it('returns the default admin seed when the list is empty', () => {
    expect(migrateGebruikers([])).toEqual([DEFAULT_ADMIN]);
  });

  it('upgrades a legacy Manager-named Teammanager to a protected Admin', () => {
    const legacy = [{ id: '1', naam: 'Manager', rol: 'Teammanager', teamId: null, wachtwoord: 'admin' }];
    const out = migrateGebruikers(legacy);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: '1', naam: 'Manager', rol: 'Admin', protected: true });
  });

  it('keeps an existing protected admin and other users untouched', () => {
    const list = [
      { id: 'admin', naam: 'Manager', rol: 'Admin', teamId: null, wachtwoord: 'admin', protected: true },
      { id: 'u2', naam: 'Speler1', rol: 'Speler', teamId: 't1', wachtwoord: 'pw' },
    ];
    expect(migrateGebruikers(list)).toEqual(list);
  });

  it('prepends the DEFAULT_ADMIN if no protected admin exists in a non-empty list', () => {
    const list = [{ id: 'u2', naam: 'Coach', rol: 'Teammanager', teamId: 't1', wachtwoord: 'pw' }];
    const out = migrateGebruikers(list);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(DEFAULT_ADMIN);
    expect(out[1]).toEqual(list[0]);
  });
});
