import { Github, ExternalLink, Loader2 } from 'lucide-react';
import { useReviewContext } from '../../context/ReviewContext';
import styles from './publishButton.module.scss';

const PublishButton = (): JSX.Element | null => {
  const { comments, reviewId, isPublishing, publishedUrl, publishAcceptedComments } =
    useReviewContext();

  const acceptedCount = comments.filter(({ status }) => status === 'accepted').length;
  const { length: totalCount } = comments;

  if (!reviewId || totalCount === 0) return null;

  return (
    <section className={styles.wrapper} aria-label="Publish review to GitHub">
      <span className={styles.row}>
        <span className={styles.copy}>
          <p className={styles.count}>
            {acceptedCount} of {totalCount} finding(s) accepted
          </p>
          <p className={styles.hint}>Only accepted comments are posted to the pull request.</p>
        </span>

        {publishedUrl ? (
          <a className={styles.link} href={publishedUrl} target="_blank" rel="noreferrer">
            View published review on GitHub
            <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        ) : (
          <button
            className={`${styles.button} ${acceptedCount > 0 ? styles['button--primary'] : styles['button--secondary']}`}
            type="button"
            onClick={() => publishAcceptedComments()}
            disabled={acceptedCount === 0 || isPublishing}
          >
            {isPublishing ? (
              <Loader2 size={15} strokeWidth={2.25} className={styles.spinner} aria-hidden="true" />
            ) : (
              <Github size={15} strokeWidth={2.25} aria-hidden="true" />
            )}
            {isPublishing ? 'Publishing…' : 'Publish to GitHub'}
          </button>
        )}
      </span>

      <progress
        className={styles.progress}
        value={acceptedCount}
        max={totalCount}
        aria-label={`${acceptedCount} of ${totalCount} findings accepted`}
      />
    </section>
  );
};

export default PublishButton;
