import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchGithubRepos, fetchGithubRepoDetails, githubRepositoryResponse } from '../lib/githubPortfolioData.ts';
import { projects } from '../data/projects.ts';
import { loadGithubRepoDetails } from '../lib/githubRepoClient.ts';

function repository(name, extra = {}) {
  return {
    name, full_name: `elephancy/${name}`, html_url: `https://github.com/elephancy/${name}`,
    description: `${name} public project`, language: 'TypeScript', private: false,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
    pushed_at: '2026-03-01T00:00:00Z', stargazers_count: 0, ...extra,
  };
}

test('retired projects never enter the portfolio or trigger detail fetches', async (t) => {
  const names = ['Curate', 'FoundRoll', 'Found-Roll', 'SituationRoom', 'Situation-Room', 'TariffGuard', 'Tariff-Guard', 'OtherArchived', 'Planora'];
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
  assert.equal(requests.some((url) => /\/repos\/elephancy\/(?:Curate|Found-?Roll|Situation-?Room|Tariff-?Guard)\//i.test(url)), false);
});

test('a catalogue larger than 26 repositories needs only one upstream request and keeps its API source', async (t) => {
  const names = Array.from({ length: 30 }, (_, index) => `Public${index}`);
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = String(input);
    requests.push(url);
    assert.match(url, /\/users\/elephancy\/repos\?/);
    return Response.json([...names.map((name) => repository(name)), repository('Private', { private: true }), repository('.github'), repository('Curate'), repository('TariffGuard')]);
  });
  const response = await githubRepositoryResponse(null, projects);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.source, 'github-api-live');
  assert.equal(payload.repos.length, 30);
  assert.deepEqual(payload.repos.map((repo) => repo.name), names);
  assert.equal(requests.length, 1);
});

test('opening a public repository retains rich README, stack and language details with at most four requests', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = String(input); requests.push(url);
    if (url.endsWith('/FreshResearch')) return Response.json(repository('FreshResearch'));
    if (url.endsWith('/readme')) return new Response('# Research\n\nA detailed React application README describing the implemented public project.\n\n- A documented feature with useful behavior');
    if (url.endsWith('/contents')) return Response.json([{ name: 'package.json', type: 'file' }]);
    if (url.endsWith('/languages')) return Response.json({ TypeScript: 75, CSS: 25 });
    assert.fail(`Unexpected request ${url}`);
  });
  const response = await githubRepositoryResponse('FreshResearch', projects);
  const payload = await response.json();
  assert.equal(payload.source, 'github-api-live');
  assert.match(payload.repo.about, /detailed React application README/);
  assert.ok(payload.repo.techStack.includes('Node.js') && payload.repo.techStack.includes('React'));
  assert.deepEqual(payload.repo.languages.map(({ name, percent }) => [name, percent]), [['TypeScript', 75], ['CSS', 25]]);
  assert.equal(requests.length, 4);
});

test('individual optional detail failures retain the public repository instead of losing the catalogue', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = String(input); requests.push(url);
    if (url.endsWith('/PartialResearch')) return Response.json(repository('PartialResearch'));
    if (url.endsWith('/contents')) return new Response('upstream unavailable', { status: 503 });
    if (url.endsWith('/readme')) throw new Error('simulated transport failure');
    if (url.endsWith('/languages')) return new Response('malformed JSON');
    assert.fail(`Unexpected request ${url}`);
  });
  const repo = await fetchGithubRepoDetails('PartialResearch');
  assert.equal(repo.name, 'PartialResearch');
  assert.equal(repo.about, 'PartialResearch public project');
  assert.deepEqual(repo.languages, [{ name: 'TypeScript', bytes: 1, percent: 100 }]);
  assert.equal(requests.length, 4);
});

test('retired, malformed, private and different-owner detail requests never disclose or enrich their data', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = String(input); requests.push(url);
    if (url.endsWith('/Private')) return Response.json(repository('Private', { private: true }));
    if (url.endsWith('/Redirected')) return Response.json(repository('Redirected', { full_name: 'someone-else/Redirected' }));
    assert.fail(`Unexpected request ${url}`);
  });
  for (const name of ['Curate', 'Found-Roll', 'SituationRoom', 'TariffGuard', '.github', '../Private', 'someone/Private', '', 'Private', 'Redirected']) {
    const response = await githubRepositoryResponse(name, projects);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Repository not available.' });
  }
  assert.equal(requests.length, 2);
});

test('an upstream list outage serves a real labelled static fallback; details fail without secret diagnostics', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async () => new Response('sensitive upstream body must not be returned', { status: 403 }));
  const response = await githubRepositoryResponse(null, projects);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.source, 'portfolio-static-fallback');
  assert.equal(payload.repos.length, projects.length);
  assert.ok(payload.repos.length > 0);
  assert.ok(payload.repos.every((repo) => !/^(?:Curate|Found-?Roll|Situation-?Room|TariffGuard)$/i.test(repo.name)));
  assert.ok(payload.repos.some((repo) => repo.name === 'Planora'));
  assert.ok(!JSON.stringify(payload).includes('sensitive upstream body'));
  const detailResponse = await githubRepositoryResponse('Unavailable', projects);
  assert.equal(detailResponse.status, 503);
  assert.deepEqual(await detailResponse.json(), { error: 'Repository details are temporarily unavailable.' });
  assert.ok(warn.mock.calls.some(({ arguments: args }) => args[0] === 'portfolio-github-list-http' && args[1].status === 403));
});

test('client detail loads deduplicate successful requests and retry transient failures', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (input) => {
    calls++;
    const name = new URL(String(input), 'https://elfeel.me').searchParams.get('repo');
    if (name === 'ClientRetry' && calls === 1) return new Response('', { status: 503 });
    return Response.json({ repo: { name, fullName: `elephancy/${name}` } });
  });
  assert.equal(await loadGithubRepoDetails('ClientRetry'), null);
  const [left, right] = await Promise.all([loadGithubRepoDetails('ClientRetry'), loadGithubRepoDetails('clientretry')]);
  assert.equal(left.name, 'ClientRetry');
  assert.equal(left, right);
  assert.equal((await loadGithubRepoDetails('ClientRetry')), left);
  assert.equal(calls, 2);
});
