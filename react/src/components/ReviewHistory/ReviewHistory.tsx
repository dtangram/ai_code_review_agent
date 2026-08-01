import { History, Clock, Loader2, CircleCheck, CircleX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReviewHistory } from '../../hooks/useReviewHistory';
import type { ReviewSummary } from '../../types/review.types';
import styles from './reviewHistory.module.scss';

const STATUS_CLASS: Record<ReviewSummary['status'], string> = {
  pending: 'statusPending',
  running: 'statusRunning',
  completed: 'statusCompleted',
  failed: 'statusFailed',
};

const STATUS_ICONS: Record<ReviewSummary['status'], LucideIcon> = {
  pending: Clock,
  running: Loader2,
  completed: CircleCheck,
  failed: CircleX,
};

const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const ReviewHistory = (): JSX.Element => {
  const { reviews, isLoading, errorMessage } = useReviewHistory();

  return (
    <section className={styles.panel} aria-label="Past reviews">
      <h2 className={styles.heading}>
        <History size={18} strokeWidth={2} aria-hidden="true" />
        Review history
      </h2>

      {isLoading && <p className={styles.empty}>Loading past reviews…</p>}

      {errorMessage && (
        <p className={styles.empty} role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && reviews.length === 0 && (
        <p className={styles.empty}>No reviews yet — run one above to see it here.</p>
      )}

      {reviews.length > 0 && (
        <ol className={styles.list}>
          {reviews.map(({ id, repoOwner, repoName, pullNumber, prTitle, status, comments, createdAt }) => {
            const StatusIcon = STATUS_ICONS[status];
            return (
              <li className={styles.item} key={id}>
                <span className={styles.rowMain}>
                  <p className={styles.prTitle}>
                    {prTitle ?? `${repoOwner}/${repoName} #${pullNumber}`}
                  </p>
                  {prTitle && (
                    <p className={styles.repo}>
                      {repoOwner}/{repoName} #{pullNumber}
                    </p>
                  )}
                </span>
                <p className={styles.meta}>
                  <span className={styles[STATUS_CLASS[status]]}>
                    <StatusIcon
                      size={13}
                      strokeWidth={2.25}
                      className={status === 'running' ? styles.spinner : undefined}
                      aria-hidden="true"
                    />
                    {status}
                  </span>
                  <span>{comments.length} finding(s)</span>
                  <time dateTime={createdAt}>{formatDate(createdAt)}</time>
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default ReviewHistory;
