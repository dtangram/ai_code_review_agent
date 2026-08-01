import { validateReviewIdParam, validateReviewRequest } from '../utils/validation';

describe('validateReviewRequest', () => {
  it('accepts a valid payload', () => {
    const result = validateReviewRequest({
      repoOwner: 'dtangram',
      repoName: 'heroLog-heroku',
      pullNumber: 12,
    });
    expect(result.success).toBe(true);
  });

  it('coerces a numeric string pullNumber', () => {
    const result = validateReviewRequest({
      repoOwner: 'dtangram',
      repoName: 'heroLog-heroku',
      pullNumber: '12',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing repoOwner', () => {
    const result = validateReviewRequest({
      repoName: 'heroLog-heroku',
      pullNumber: 12,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive pullNumber', () => {
    const result = validateReviewRequest({
      repoOwner: 'dtangram',
      repoName: 'heroLog-heroku',
      pullNumber: -3,
    });
    expect(result.success).toBe(false);
  });
});

describe('validateReviewIdParam', () => {
  it('accepts a valid UUID', () => {
    const result = validateReviewIdParam({ id: '123e4567-e89b-12d3-a456-426614174000' });
    expect(result.success).toBe(true);
  });

  it('rejects a non-UUID string', () => {
    const result = validateReviewIdParam({ id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});
