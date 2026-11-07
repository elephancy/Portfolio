import type { RepoView } from './githubPortfolioData';

const details = new Map<string, RepoView>();
const pending = new Map<string, Promise<RepoView | null>>();

export async function loadGithubRepoDetails(name: string): Promise<RepoView | null> {
  if (!/^[a-z0-9][a-z0-9._-]{0,99}$/i.test(name)) return null;
  const key = name.toLowerCase();
  const cached = details.get(key);
  if (cached) return cached;
  const existing = pending.get(key);
  if (existing) return existing;

  const request = fetch(`/api/github/repos?repo=${encodeURIComponent(name)}`)
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = await response.json() as { repo?: RepoView };
      const repo = payload.repo;
      if (!repo || repo.name.toLowerCase() !== key || repo.fullName.toLowerCase() !== `elephancy/${key}`) return null;
      // Reuse successful details during this page visit; failed loads can retry.
      if (details.size >= 100) details.delete(details.keys().next().value!);
      details.set(key, repo);
      return repo;
    })
    .catch(() => null)
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}
