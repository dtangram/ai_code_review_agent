import { createContext, useContext, type ReactNode } from 'react';
import { useAgentReview } from '../hooks/useAgentReview';
import type {
  AgentEvent,
  ReviewComment,
  ReviewFormValues,
  ReviewRunState,
} from '../types/review.types';

interface ReviewContextValue {
  runState: ReviewRunState;
  trace: AgentEvent[];
  comments: ReviewComment[];
  reviewId: string | null;
  errorMessage: string | null;
  publishedUrl: string | null;
  isPublishing: boolean;
  startReview: (values: ReviewFormValues) => Promise<void>;
  setCommentStatus: (id: string, status: ReviewComment['status']) => void;
  publishAcceptedComments: () => Promise<void>;
}

const ReviewContext = createContext<ReviewContextValue | undefined>(undefined);

interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider = ({ children }: ReviewProviderProps): JSX.Element => {
  const value = useAgentReview();
  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
};

export const useReviewContext = (): ReviewContextValue => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviewContext must be used within a ReviewProvider');
  }
  return context;
};

export default ReviewProvider;
