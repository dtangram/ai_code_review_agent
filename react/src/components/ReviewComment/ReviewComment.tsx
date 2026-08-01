import { Check, X, FileCode } from 'lucide-react';
import { useReviewContext } from '../../context/ReviewContext';
import StatusBadge from '../StatusBadge/StatusBadge';
import type { ReviewComment as ReviewCommentType } from '../../types/review.types';
import styles from './reviewComment.module.scss';

interface ReviewCommentProps {
  comment: ReviewCommentType;
}

const ReviewComment = ({ comment }: ReviewCommentProps): JSX.Element => {
  const { setCommentStatus } = useReviewContext();
  const { id, filePath, line, severity, summary, explanation, suggestedFix, status } = comment;

  const stateClass =
    status === 'accepted'
      ? styles['comment--accepted']
      : status === 'dismissed'
        ? styles['comment--dismissed']
        : '';
  const severityClass = styles[`sev--${severity}`];

  return (
    <article className={`${styles.comment} ${severityClass} ${stateClass}`.trim()}>
      <header className={styles.header}>
        <p className={styles.path}>
          <FileCode size={14} strokeWidth={2} aria-hidden="true" />
          {filePath}
          {line !== null ? `:${line}` : ''}
        </p>
        <StatusBadge severity={severity} />
      </header>

      <h3 className={styles.summary}>{summary}</h3>
      <p className={styles.explanation}>{explanation}</p>

      {suggestedFix && <pre className={styles.fix}>{suggestedFix}</pre>}

      <footer className={styles.actions} role="group" aria-label={`Actions for ${summary}`}>
        <button
          className={`${styles.actionButton} ${styles.acceptButton}`}
          type="button"
          onClick={() => setCommentStatus(id, 'accepted')}
          aria-pressed={status === 'accepted'}
        >
          <Check size={15} strokeWidth={2.25} aria-hidden="true" />
          Accept
        </button>
        <button
          className={`${styles.actionButton} ${styles.dismissButton}`}
          type="button"
          onClick={() => setCommentStatus(id, 'dismissed')}
          aria-pressed={status === 'dismissed'}
        >
          <X size={15} strokeWidth={2.25} aria-hidden="true" />
          Dismiss
        </button>
      </footer>
    </article>
  );
};

export default ReviewComment;
