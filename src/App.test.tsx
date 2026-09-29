import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without throwing', async () => {
    // jsdom cannot fetch /ghostty-vt.wasm; the TerminalPanel falls into its
    // error state and renders the red Alert. The App itself still mounts.
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('.mantine-AppShell-root')).toBeTruthy();
    });
  });
});
