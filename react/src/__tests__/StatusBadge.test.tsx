import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge/StatusBadge';

describe('StatusBadge', () => {
  it('renders the human-readable label for a given severity', () => {
    render(<StatusBadge severity="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders suggestion severity correctly', () => {
    render(<StatusBadge severity="suggestion" />);
    expect(screen.getByText('Suggestion')).toBeInTheDocument();
  });
});
