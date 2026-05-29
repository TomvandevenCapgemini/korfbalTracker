import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders login screen when no user is logged in', () => {
    localStorage.clear();
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(screen.getByText(/CKV Oranje Wit/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Gebruikersnaam/i)).toBeDefined();
  });
});
