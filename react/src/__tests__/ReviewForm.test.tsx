import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from '../components/ReviewForm/ReviewForm';
import { ReviewProvider } from '../context/ReviewContext';

const mockRepos = ['dtangram/heroLog-heroku', 'dtangram/ai-code-review-agent'];

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ repos: mockRepos }),
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

const renderWithProvider = (): void => {
  render(
    <ReviewProvider>
      <ReviewForm />
    </ReviewProvider>
  );
};

describe('ReviewForm', () => {
  it('renders accessible labeled controls for repository and PR number', async () => {
    renderWithProvider();

    expect(screen.getByLabelText(/repository/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pull request #/i)).toBeInTheDocument();
  });

  it('populates the repository dropdown from the allowed-repos endpoint', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: mockRepos[0] })).toBeInTheDocument();
    });
    expect(screen.getByRole('option', { name: mockRepos[1] })).toBeInTheDocument();
  });

  it('disables submit until a repository is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const submitButton = screen.getByRole('button', { name: /start review/i });
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: mockRepos[0] })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/repository/i), mockRepos[0]);
    await user.type(screen.getByLabelText(/pull request #/i), '42');

    expect(submitButton).toBeEnabled();
  });
});
