'use client';

import { useEffect, useState } from 'react';
import type { RepoView } from '../lib/githubPortfolioData';
import { loadGithubRepoDetails } from '../lib/githubRepoClient';

export function useGithubRepoDetails(name: string | undefined) {
  const [detail, setDetail] = useState<RepoView | null>(null);
  useEffect(() => {
    let active = true;
    setDetail(null);
    if (name) loadGithubRepoDetails(name).then((repo) => {
      if (active) setDetail(repo);
    });
    return () => { active = false; };
  }, [name]);
  return detail?.name.toLowerCase() === name?.toLowerCase() ? detail : null;
}
