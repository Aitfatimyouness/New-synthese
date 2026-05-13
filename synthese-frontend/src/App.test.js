import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the OFPPT secure application shell', () => {
  render(<App />);
  expect(screen.getByText(/chargement securise/i)).toBeInTheDocument();
});
