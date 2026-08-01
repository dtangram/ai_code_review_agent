import { useCallback, useState } from 'react';
import { startReviewStream, publishReviewToGithub } from '../utils/api';
import type {
  AgentEvent,
  ReviewComment,
  ReviewFormValues,
  ReviewRunState,
} from '../types/review.types';

interface UseAgentReviewResult {
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

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const parseSubmittedComments = ({ type, detail }: AgentEvent): ReviewComment[] | null => {
  if (type !== 'done' || !detail) return null;
  try {
    const parsed = JSON.parse(detail) as Array<Omit<ReviewComment, 'status'>>;
    return parsed.map((comment) => ({ ...comment, status: 'pending' }));
  } catch {
    return null;
  }
};

export const useAgentReview = (): UseAgentReviewResult => {
  const [runState, setRunState] = useState<ReviewRunState>('idle');
  const [trace, setTrace] = useState<AgentEvent[]>([]);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const startReview = useCallback(async (values: ReviewFormValues): Promise<void> => {
    setRunState('running');
    setTrace([]);
    setComments([]);
    setReviewId(null);
    setPublishedUrl(null);
    setErrorMessage(null);

    await startReviewStream(values, {
      onEvent: (event) => {
        const { type, label, detail } = event;
        setTrace((prev) => [...prev, event]);
        if (type === 'error') {
          setRunState('error');
          setErrorMessage(label);
        }
        const submitted = parseSubmittedComments(event);
        if (submitted) {
          setComments(submitted);
        } else if (type === 'done' && detail && isUuid(detail)) {
          setReviewId(detail);
        }
      },
      onError: (message) => {
        setRunState('error');
        setErrorMessage(message);
      },
      onClose: () => {
        setRunState((prev) => (prev === 'error' ? prev : 'completed'));
      },
    });
  }, []);

  const setCommentStatus = useCallback((id: string, status: ReviewComment['status']): void => {
    setComments((prev) =>
      prev.map((comment) => {
        const { id: commentId } = comment;
        return commentId === id ? { ...comment, status } : comment;
      })
    );
  }, []);

  const publishAcceptedComments = useCallback(async (): Promise<void> => {
    if (!reviewId) return;
    const accepted = comments.filter(({ status }) => status === 'accepted');
    if (accepted.length === 0) return;

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const htmlUrl = await publishReviewToGithub(reviewId, accepted);
      setPublishedUrl(htmlUrl);
    } catch (err) {
      const { message } = err instanceof Error ? err : { message: 'Failed to publish review to GitHub' };
      setErrorMessage(message);
    } finally {
      setIsPublishing(false);
    }
  }, [reviewId, comments]);

  return {
    runState,
    trace,
    comments,
    reviewId,
    errorMessage,
    publishedUrl,
    isPublishing,
    startReview,
    setCommentStatus,
    publishAcceptedComments,
  };
};
