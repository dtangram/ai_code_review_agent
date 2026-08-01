import { GitBranch, GitPullRequest, Play, Loader2 } from 'lucide-react';
import { useReviewForm } from '../../hooks/useReviewForm';
import styles from './reviewForm.module.scss';

const ReviewForm = (): JSX.Element => {
  const {
    selectedRepo,
    pullNumber,
    allowedRepos,
    isLoadingRepos,
    isRunning,
    handleRepoChange,
    handlePullNumberChange,
    handleSubmit,
  } = useReviewForm();

  const isDisabled = isRunning || isLoadingRepos;

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Start a code review">
      <fieldset className={styles.field} disabled={isDisabled}>
        <label className={styles.label} htmlFor="repoSelect">
          <GitBranch size={14} strokeWidth={2} aria-hidden="true" />
          Repository
        </label>
        <select
          id="repoSelect"
          className={styles.input}
          value={selectedRepo}
          onChange={handleRepoChange}
          required
        >
          <option value="" disabled>
            {isLoadingRepos ? 'Loading demo repos…' : 'Select a repository'}
          </option>
          {allowedRepos.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>
        {!isLoadingRepos && allowedRepos.length === 0 && (
          <p className={styles.hint}>
            No demo repos configured — set DEMO_REPOS in the server's .env.
          </p>
        )}
      </fieldset>

      <fieldset className={styles.field} disabled={isDisabled}>
        <label className={styles.label} htmlFor="pullNumber">
          <GitPullRequest size={14} strokeWidth={2} aria-hidden="true" />
          Pull request #
        </label>
        <input
          id="pullNumber"
          className={styles.input}
          type="number"
          min={1}
          value={pullNumber}
          onChange={handlePullNumberChange}
          placeholder="e.g. 42"
          required
        />
      </fieldset>

      <button className={styles.submit} type="submit" disabled={isDisabled || !selectedRepo}>
        {isRunning ? (
          <Loader2 size={15} strokeWidth={2.25} className={styles.spinner} aria-hidden="true" />
        ) : (
          <Play size={15} strokeWidth={2.25} aria-hidden="true" />
        )}
        {isRunning ? 'Reviewing…' : 'Start review'}
      </button>
    </form>
  );
};

export default ReviewForm;
