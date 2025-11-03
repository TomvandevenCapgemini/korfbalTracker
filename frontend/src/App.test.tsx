import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UIProvider } from './contexts/UIContext';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <UIProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UIProvider>
    );
    expect(container).toBeDefined();
  });
});