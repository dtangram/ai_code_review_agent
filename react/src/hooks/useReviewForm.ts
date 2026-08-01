import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useReviewContext } from '../context/ReviewContext';
import { useAllowedRepos } from './useAllowedRepos';
import type { ReviewFormValues } from '../types/review.types';

interface UseReviewFormResult {
  selectedRepo: string;
  pullNumber: string;
  allowedRepos: string[];
  isLoadingRepos: boolean;
  isRunning: boolean;
  handleRepoChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handlePullNumberChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useReviewForm = (): UseReviewFormResult => {
  const { startReview, runState } = useReviewContext();
  const { allowedRepos, isLoading: isLoadingRepos } = useAllowedRepos();
  const [selectedRepo, setSelectedRepo] = useState('');
  const [pullNumber, setPullNumber] = useState('');

  const isRunning = runState === 'running';

  const handleRepoChange = ({ target }: ChangeEvent<HTMLSelectElement>): void => {
    const { value } = target;
    setSelectedRepo(value);
  };

  const handlePullNumberChange = ({ target }: ChangeEvent<HTMLInputElement>): void => {
    const { value } = target;
    setPullNumber(value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isRunning || !selectedRepo) return;

    const [repoOwner, repoName] = selectedRepo.split('/');
    const values: ReviewFormValues = { repoOwner, repoName, pullNumber };
    await startReview(values);
  };

  return {
    selectedRepo,
    pullNumber,
    allowedRepos,
    isLoadingRepos,
    isRunning,
    handleRepoChange,
    handlePullNumberChange,
    handleSubmit,
  };
};
