import { useMemo, useState } from 'react';
import type { ReviewComment, Severity } from '../types/review.types';

export type FindingsFilter = Severity | 'all';

interface UseFindingsFilterResult {
  filter: FindingsFilter;
  setFilter: (filter: FindingsFilter) => void;
  filteredComments: ReviewComment[];
  counts: Record<FindingsFilter, number>;
}

const SEVERITIES: Severity[] = ['critical', 'warning', 'suggestion', 'info'];

export const useFindingsFilter = (comments: ReviewComment[]): UseFindingsFilterResult => {
  const [filter, setFilter] = useState<FindingsFilter>('all');

  const counts = useMemo(() => {
    const base: Record<FindingsFilter, number> = {
      all: comments.length,
      critical: 0,
      warning: 0,
      suggestion: 0,
      info: 0,
    };
    comments.forEach(({ severity }) => {
      base[severity] += 1;
    });
    return base;
  }, [comments]);

  const filteredComments = useMemo(
    () => (filter === 'all' ? comments : comments.filter(({ severity }) => severity === filter)),
    [comments, filter]
  );

  return { filter, setFilter, filteredComments, counts };
};

export { SEVERITIES };
