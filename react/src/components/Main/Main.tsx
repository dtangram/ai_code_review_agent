import { ListChecks, Bot, TriangleAlert, Loader2 } from 'lucide-react';
import ReviewForm from '../ReviewForm/ReviewForm';
import TracePanel from '../TracePanel/TracePanel';
import ReviewComment from '../ReviewComment/ReviewComment';
import PublishButton from '../PublishButton/PublishButton';
import ReviewHistory from '../ReviewHistory/ReviewHistory';
import { useReviewContext } from '../../context/ReviewContext';
import { useFindingsFilter, SEVERITIES, type FindingsFilter } from '../../hooks/useFindingsFilter';
import { SEVERITY_LABELS } from '../../consts';
import styles from './main.module.scss';

const FILTER_OPTIONS: FindingsFilter[] = ['all', ...SEVERITIES];

const ReviewResults = (): JSX.Element => {
  const { comments, errorMessage, runState } = useReviewContext();
  const { filter, setFilter, filteredComments, counts } = useFindingsFilter(comments);
  const isWaitingOnFindings = runState === 'running' && comments.length === 0;

  return (
    <>
      {errorMessage && (
        <p className={styles.errorBanner} role="alert">
          <TriangleAlert size={16} strokeWidth={2} aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      <PublishButton />

      <section className={styles.grid}>
        <TracePanel />

        <section className={styles.findingsPanel} aria-label="Review comments">
          <h2 className={styles.findingsHeading}>
            <ListChecks size={18} strokeWidth={2} aria-hidden="true" />
            Findings
            <span className={styles.countPill}>{comments.length}</span>
          </h2>

          {comments.length > 0 && (
            <ul className={styles.filterRow} aria-label="Filter findings by severity">
              {FILTER_OPTIONS.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    className={styles.filterChip}
                    aria-pressed={filter === option}
                    onClick={() => setFilter(option)}
                  >
                    {option === 'all' ? 'All' : SEVERITY_LABELS[option]} ({counts[option]})
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isWaitingOnFindings && (
            <p className={styles.findingsLoading} role="status" aria-live="polite">
              <Loader2 size={15} strokeWidth={2.25} className={styles.loadingSpinner} aria-hidden="true" />
              Compiling findings once the agent finishes investigating…
            </p>
          )}

          <ul className={styles.commentList}>
            {filteredComments.length === 0 && !isWaitingOnFindings && comments.length > 0 && (
              <li className={styles.filterEmpty}>
                No {filter === 'all' ? '' : `${SEVERITY_LABELS[filter]?.toLowerCase()} `}findings.
              </li>
            )}
            {filteredComments.map((comment) => (
              <li key={comment.id}>
                <ReviewComment comment={comment} />
              </li>
            ))}
          </ul>
        </section>
      </section>
    </>
  );
};

const Main = (): JSX.Element => (
  <main className={styles.app}>
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Bot size={28} strokeWidth={2} aria-hidden="true" />
        AI Code Review Agent
      </h1>
      <p className={styles.subtitle}>
        Point it at a pull request. Watch it read the diff, search the codebase for context, and
        leave review comments you can accept or dismiss.
      </p>
    </header>

    <ReviewForm />
    <ReviewResults />
    <ReviewHistory />
  </main>
);

export default Main;
