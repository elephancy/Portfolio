# Public GitHub catalogue

The live catalogue uses one GitHub request. Rich details are loaded only when a
repository is selected, using at most four upstream requests. The Worker has no
GitHub credential requirement. GitHub's unauthenticated limit is shared by the
originating IP, so a shared Worker egress address can be rate limited.

When GitHub is unavailable, the API serves
`data/github-repos.snapshot.json` with `source: github-public-snapshot`, its
capture time and public source URL. The UI labels these records as a GitHub
snapshot. Language byte counts and repository dates in the snapshot come from
the public API; descriptions and existing portfolio curation provide summaries.
It contains no copied README bodies, account profiles or credentials.

Successful live data replaces snapshot data normally. A live 404 or private
repository is not revived from the snapshot. Retired project exclusions are
reapplied when the snapshot is served. A 403/429 defers further GitHub requests
within that Worker isolate according to rate-limit reset or retry-after headers,
with at least a one-minute pause. Other isolates may have separate state.

Refresh the public snapshot manually with Node 24:

```sh
node scripts/refresh-github-snapshot.mjs
node --test scripts/github-portfolio.test.mjs
npx tsc --noEmit --incremental false
```

The refresh script sends no authentication header and reads no token. It checks
the remaining public quota before fetching all language breakdowns and stops on
upstream errors without writing a partial snapshot. Review the resulting JSON
diff and source timestamp before committing and releasing it. The snapshot is
refreshed through normal reviewed releases; no recurring work is scheduled.

GitHub documents the [unauthenticated rate limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
and [required retry behavior](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api#rate-limit-errors).
