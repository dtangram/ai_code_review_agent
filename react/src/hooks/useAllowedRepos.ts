import { useEffect, useState } from 'react';
import { fetchAllowedRepos } from '../utils/api';

interface UseAllowedReposResult {
  allowedRepos: string[];
  isLoading: boolean;
}

export const useAllowedRepos = (): UseAllowedReposResult => {
  const [allowedRepos, setAllowedRepos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchAllowedRepos()
      .then((repos) => {
        if (isMounted) setAllowedRepos(repos);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { allowedRepos, isLoading };
};
