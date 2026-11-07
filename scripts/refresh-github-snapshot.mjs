import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { publicGithubRepoSummaries } from "../lib/githubPortfolioData.ts";

export async function refreshGithubSnapshot({
  fetcher = globalThis.fetch,
  writer = writeFile,
  now = () => new Date(),
} = {}) {
  const headers = {
    "User-Agent": "portfolio",
    Accept: "application/vnd.github+json",
  };
  const source =
    "https://api.github.com/users/elephancy/repos?per_page=100&sort=updated";
  let remaining;
  let calls = 0;
  async function publicGet(url) {
    assert.equal(new URL(url).hostname, "api.github.com");
    assert.ok(
      remaining !== 0,
      "Public API quota exhausted; no further request sent",
    );
    const response = await fetcher(url, { headers });
    calls++;
    if (!response.ok)
      throw new Error(`Public API HTTP${response.status}; generation stopped`);
    const value = response.headers.get("x-ratelimit-remaining");
    assert.ok(
      value !== null && /^\d+$/.test(value),
      "Public API quota header missing; generation stopped",
    );
    remaining = Number(value);
    assert.ok(Number.isSafeInteger(remaining));
    assert.ok(
      !response.headers.get("link")?.includes('rel="next"'),
      "Public inventory requires pagination; generation stopped without a partial snapshot",
    );
    return response.json();
  }
  const primary = await publicGet(source);
  assert.ok(
    Array.isArray(primary) && primary.every((repo) => repo.private === false),
  );
  const repos = publicGithubRepoSummaries(primary);
  assert.ok(
    remaining >= repos.length,
    "Insufficient public API quota to capture every language breakdown",
  );
  for (const repo of repos) {
    const bytes = await publicGet(
      `https://api.github.com/repos/elephancy/${encodeURIComponent(repo.name)}/languages`,
    );
    const entries = Object.entries(bytes).filter(
      ([, count]) =>
        typeof count === "number" && Number.isFinite(count) && count > 0,
    );
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    repo.languages = entries
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({
        name,
        bytes: count,
        percent: Math.round((count / total) * 1000) / 10,
      }));
    if (
      repo.features.length === 1 &&
      repo.features[0] ===
        "Repository maintained with regular updates and clear structure."
    )
      repo.features = [];
    if (repo.about === "Repository details are loaded from GitHub.")
      repo.about = "Public repository metadata captured in this snapshot.";
  }
  const snapshot = {
    schemaVersion: 1,
    owner: "elephancy",
    generatedAt: now().toISOString(),
    sources: {
      repositories: source,
      languages: "https://api.github.com/repos/elephancy/{repo}/languages",
      summaries:
        "Existing portfolio curation plus public descriptions and topics; README contents are not copied into this snapshot.",
    },
    repositories: repos,
  };
  const json = JSON.stringify(snapshot, null, 2) + "\n";
  assert.ok(
    !/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(json),
    "Email-like data must be reviewed before snapshot publication",
  );
  assert.ok(
    !/\b(?:gh[pousr]_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]+)\b/.test(json),
    "Credential-like data detected",
  );
  await writer(
    new URL("../data/github-repos.snapshot.json", import.meta.url),
    json,
  );
  return {
    generatedAt: snapshot.generatedAt,
    repositories: repos.length,
    publicRequests: calls,
    remaining,
    bytes: Buffer.byteLength(json),
    languageBreakdowns: repos.filter((repo) => repo.languages.length > 0)
      .length,
  };
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  console.log(JSON.stringify(await refreshGithubSnapshot(), null, 2));
}
