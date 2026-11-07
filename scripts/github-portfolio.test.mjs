import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { fetchGithubRepos, fetchGithubRepoDetails, githubRepositoryResponse } from '../lib/githubPortfolioData.ts';
import { projects } from '../data/projects.ts';
import { loadGithubRepoDetails } from '../lib/githubRepoClient.ts';
import { refreshGithubSnapshot } from './refresh-github-snapshot.mjs';

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

test('an upstream list outage serves the dated public snapshot; unknown details fail without secret diagnostics', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async () => new Response('sensitive upstream body must not be returned', { status: 403 }));
  const response = await githubRepositoryResponse(null, projects);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.source, 'github-public-snapshot');
  assert.equal(payload.repos.length, 26);
  assert.ok(payload.repos.length > 0);
  assert.ok(Number.isFinite(Date.parse(payload.snapshotAt)));
  assert.equal(payload.snapshotSource, 'https://api.github.com/users/elephancy/repos?per_page=100&sort=updated');
  assert.ok(payload.repos.every((repo) => repo.snapshotAt === payload.snapshotAt));
  assert.ok(payload.repos.every((repo) => !/^(?:Curate|Found-?Roll|Situation-?Room|TariffGuard)$/i.test(repo.name)));
  assert.ok(payload.repos.some((repo) => repo.name === 'Planora'));
  assert.ok(!JSON.stringify(payload).includes('sensitive upstream body'));
  const detailResponse = await githubRepositoryResponse('Unavailable', projects);
  assert.equal(detailResponse.status, 503);
  assert.deepEqual(await detailResponse.json(), { error: 'Repository details are temporarily unavailable.' });
  assert.ok(warn.mock.calls.some(({ arguments: args }) => args[0] === 'portfolio-github-list-http' && args[1].status === 403));
});

test('the versioned snapshot contains only public project fields, accurate language arithmetic and no retired identities', async () => {
  const text = await readFile(new URL('../data/github-repos.snapshot.json', import.meta.url), 'utf8');
  const snapshot = JSON.parse(text);
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.owner, 'elephancy');
  assert.ok(Number.isFinite(Date.parse(snapshot.generatedAt)));
  assert.equal(snapshot.repositories.length, 26);
  assert.ok(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text));
  assert.ok(!/\b(?:gh[pousr]_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]+)\b/.test(text));
  for (const repo of snapshot.repositories) {
    assert.equal(repo.fullName, `elephancy/${repo.name}`);
    assert.equal(repo.url, `https://github.com/${repo.fullName}`);
    assert.ok(!/^(?:Curate|Found-?Roll|Situation-?Room|TariffGuard)$/i.test(repo.name));
    assert.ok(Number.isFinite(Date.parse(repo.createdAt)) && Number.isFinite(Date.parse(repo.pushedAt)));
    const total = repo.languages.reduce((sum, language) => sum + language.bytes, 0);
    for (const language of repo.languages) {
      assert.ok(Number.isSafeInteger(language.bytes) && language.bytes > 0);
      assert.ok(Math.abs(language.percent - 100 * language.bytes / total) <= 0.051);
    }
    assert.ok(!repo.features.includes('Repository maintained with regular updates and clear structure.'));
  }
});

test('rate-limit reset is respected and known snapshot details remain useful without another upstream request', async (t) => {
  const api = await import('../lib/githubPortfolioData.ts?test=rate-limit-snapshot');
  const now = Date.now();
  let clock = now;
  t.mock.method(Date, 'now', () => clock);
  t.mock.method(console, 'warn', () => {});
  let calls = 0;
  const reset = Math.ceil(now / 1000) + 180;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return calls === 1
      ? new Response('body must not leak', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) } })
      : Response.json([repository('Recovered')]);
  });
  const first = await (await api.githubRepositoryResponse(null, projects)).json();
  assert.equal(first.source, 'github-public-snapshot');
  const detail = await (await api.githubRepositoryResponse('Planora', projects)).json();
  assert.equal(detail.source, 'github-public-snapshot');
  assert.equal(detail.repo.name, 'Planora');
  assert.ok(detail.repo.languages.length > 1);
  clock = reset * 1000 - 1;
  assert.equal((await (await api.githubRepositoryResponse(null, projects)).json()).source, 'github-public-snapshot');
  assert.equal(calls, 1);
  clock = reset * 1000 + 1;
  const recovered = await (await api.githubRepositoryResponse(null, projects)).json();
  assert.equal(recovered.source, 'github-api-live');
  assert.deepEqual(recovered.repos.map((repo) => repo.name), ['Recovered']);
  assert.equal(calls, 2);
});

test('a live not-found or newly private repository does not get revived from the snapshot', async (t) => {
  const api = await import('../lib/githubPortfolioData.ts?test=snapshot-private');
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  assert.equal((await api.githubRepositoryResponse('Planora', projects)).status, 404);
  t.mock.method(globalThis, 'fetch', async () => Response.json(repository('Planora', { private: true })));
  assert.equal((await api.githubRepositoryResponse('Planora', projects)).status, 404);
});

test('secondary retry-after is respected without discarding dated repository data', async (t) => {
  const api = await import('../lib/githubPortfolioData.ts?test=secondary-retry-after');
  let clock = Date.now();
  t.mock.method(Date, 'now', () => clock);
  t.mock.method(console, 'warn', () => {});
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return new Response('', { status: 429, headers: { 'x-ratelimit-remaining': '25', 'retry-after': '120' } });
  });
  assert.equal((await (await api.githubRepositoryResponse(null, projects)).json()).source, 'github-public-snapshot');
  clock += 119_999;
  assert.equal((await api.githubRepositoryResponse('Planora', projects)).status, 200);
  assert.equal(calls, 1);
  clock += 2;
  await api.githubRepositoryResponse(null, projects);
  assert.equal(calls, 2);
});

test('concurrent blocked responses cannot shorten an existing longer retry deadline', async (t) => {
  const api = await import('../lib/githubPortfolioData.ts?test=concurrent-backoff');
  let clock = Date.now();
  t.mock.method(Date, 'now', () => clock);
  t.mock.method(console, 'warn', () => {});
  let calls = 0;
  const pending = [];
  t.mock.method(globalThis, 'fetch', () => {
    calls++;
    return calls <= 2
      ? new Promise((resolve) => pending.push(resolve))
      : Promise.resolve(Response.json([repository('Recovered')]));
  });
  const first = api.githubRepositoryResponse(null, projects);
  const second = api.githubRepositoryResponse(null, projects);
  const reset = Math.ceil(clock / 1000) + 180;
  pending[0](new Response('', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) } }));
  await first;
  pending[1](new Response('', { status: 429, headers: { 'retry-after': '60' } }));
  await second;
  clock += 61_000;
  assert.equal((await (await api.githubRepositoryResponse(null, projects)).json()).source, 'github-public-snapshot');
  assert.equal(calls, 2);
  clock = reset * 1000 + 1;
  assert.equal((await (await api.githubRepositoryResponse(null, projects)).json()).source, 'github-api-live');
  assert.equal(calls, 3);
});

test('manual refresh uses public requests only and writes complete, retired-filtered source metadata', async () => {
  let calls = 0;
  let output;
  const report = await refreshGithubSnapshot({
    fetcher: async (url, options) => {
      calls++;
      assert.equal(new URL(url).hostname, 'api.github.com');
      assert.equal(Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization'), false);
      const body = url.includes('/users/')
        ? [repository('Planora'), repository('FreshProject'), repository('TariffGuard')]
        : { TypeScript: 75, CSS: 25 };
      return Response.json(body, { headers: { 'x-ratelimit-remaining': String(60 - calls) } });
    },
    writer: async (_url, text) => { output = JSON.parse(text); },
    now: () => new Date('2026-11-07T00:00:00Z'),
  });
  assert.equal(report.publicRequests, 3);
  assert.equal(output.repositories.length, 2);
  assert.equal(output.generatedAt, '2026-11-07T00:00:00.000Z');
  assert.deepEqual(output.repositories[0].languages.map(({ percent }) => percent), [75, 25]);
  assert.equal(output.repositories[0].createdAt, '2026-01-01T00:00:00Z');
});

test('manual refresh stops before quota exhaustion and never overwrites a snapshot after incomplete collection', async () => {
  for (const scenario of ['low-quota', 'http-failure', 'missing-quota', 'pagination']) {
    let calls = 0;
    let writes = 0;
    await assert.rejects(refreshGithubSnapshot({
      fetcher: async () => {
        calls++;
        if (scenario === 'http-failure' && calls > 1) return new Response('', { status: 403 });
        return Response.json(calls === 1 ? [repository('Planora'), repository('FreshProject')] : {}, {
          headers: scenario === 'missing-quota' ? {} : {
            'x-ratelimit-remaining': scenario === 'low-quota' ? '1' : '59',
            ...(scenario === 'pagination' ? { link: '<https://api.github.com/users/elephancy/repos?page=2>; rel="next"' } : {}),
          },
        });
      },
      writer: async () => { writes++; },
    }));
    assert.equal(writes, 0, scenario);
    assert.equal(calls, scenario === 'http-failure' ? 2 : 1, scenario);
  }
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
