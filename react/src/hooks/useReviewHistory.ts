import { useCallback, useEffect, useState } from 'react';
import { fetchReviewHistory } from '../utils/api';
import type { ReviewSummary } from '../types/review.types';

interface UseReviewHistoryResult {
  reviews: ReviewSummary[];
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

export const useReviewHistory = (): UseReviewHistoryResult => {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchReviewHistory();
      setReviews(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load review history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reviews, isLoading, errorMessage, refresh };
};
