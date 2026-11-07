import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchGithubRepos } from '../lib/githubPortfolioData.ts';

test('retired projects never enter the portfolio or trigger detail fetches', async (t) => {
  const names = ['Curate', 'FoundRoll', 'Found-Roll', 'SituationRoom', 'Situation-Room', 'OtherArchived', 'Planora'];
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = String(input);
    requests.push(url);
    if (url.includes('/users/elephancy/repos?')) {
      return Response.json(names.map((name) => ({
        name, full_name: `elephancy/${name}`, html_url: `https://github.com/elephancy/${name}`,
        description: `${name} project`, language: 'TypeScript', archived: name === 'OtherArchived',
        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
        pushed_at: '2026-01-01T00:00:00Z', stargazers_count: 0,
      })));
    }
    if (url.endsWith('/readme')) return new Response('A project with enough detail for its public portfolio description.');
    if (url.endsWith('/languages')) return Response.json({ TypeScript: 100 });
    if (url.endsWith('/contents')) return Response.json([]);
    assert.fail(`Unexpected request: ${url}`);
  });
  const repos = await fetchGithubRepos();
  assert.deepEqual(repos.map((repo) => repo.name).sort(), ['OtherArchived', 'Planora']);
  assert.equal(requests.some((url) => /\/repos\/elephancy\/(?:Curate|Found-?Roll|Situation-?Room)\//i.test(url)), false);
});
