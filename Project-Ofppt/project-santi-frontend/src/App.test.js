import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the OFPPT login screen', () => {
  render(<App />);
  expect(screen.getByText(/Gestion des formations des formateurs OFPPT/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
});
