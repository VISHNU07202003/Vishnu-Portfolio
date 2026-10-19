# Deployment operations

These are proposed operations, not authorization to commit, push or deploy.

## Vercel settings

Use the repository root containing package.json, vercel.json, api/ and app/ as the project root. Framework: Vite. Node: 24.x, pinned in package.json. Install: npm ci. Build: npm run build. Output: dist. Do not set the project root to app/ because it would omit the server function and root build configuration.

`/work/:path*` rewrites to `/index.html` for client rendering and refresh. The rewrite does not match `/api/github` or `/assets/*`. Case paths are cell-counter, campus-events, snack-squad, transgis, fedguard and plant-cropper. Unknown case paths render the application's not-found view; the SPA shell may still return HTTP 200. Security headers are configured in vercel.json. The GitHub function has a 30-second hosting duration limit.

Reference: [Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas), [Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## GitHub activity in production

The browser requests same-origin GET `/api/github`. The root api/github.ts entry imports server/github.ts; Vercel supplies the Node runtime. No GitHub token, paid API, database or external AI service is required or configured. The account and upstream GitHub destinations are fixed. The response includes only counts, timestamps and public commit metadata, not messages or author emails.

Public repository total comes from the user profile; the recent subset uses creation-sorted repository pages for the last 90 days. Indexed authored commits come from GitHub commit search and cover indexed public default-branch history, not lifetime/private/all-branch commits. Incomplete search results withhold the total. Indexing can lag.

Caching layers:

- The browser refreshes every five minutes while visible, on returning to visibility and on a guarded manual refresh.
- Each warm function instance keeps successful data for five minutes and coalesces concurrent refreshes. This cache is ephemeral and is not shared across cold starts, instances or regions.
- Successful HTTP responses set `public, max-age=60, s-maxage=300`. Browser and CDN caches can therefore serve data after its fetchedAt time; five minutes is a refresh policy, not a hard freshness guarantee.
- Upstream failures back off for one minute. A warm instance can return its previous data with `stale: true` and `no-store`; without cached data the endpoint returns 503, `Retry-After: 60`, and `no-store`. Non-GET requests return 405.
- Each upstream request has a ten-second deadline. Repository pagination is bounded. Hosting can terminate a request at its duration limit; the UI remains usable and provides the public-profile fallback.

Unauthenticated GitHub requests share the originating IP's rate budget, and search has additional limits. Cold starts or distributed traffic can exhaust the budget despite caching. No token is silently read from environment variables. Higher-limit authentication would require a separately reviewed server-only change; never expose a token with a VITE_ prefix. See [GitHub rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## Proposed release procedure — after explicit authorization only

1. Confirm repository name, owner and visibility, target Vercel account/project, production domain and the exact approved file manifest. A private source repository is a conservative initial option; the public site can still be deployed from it.
2. Initialize Git only in the reviewed publication copy. Re-run tests, lint, build and publication audit. Stage only manifest paths; inspect `git diff --cached --name-only` and the complete staged diff. Never stage the entire original working folder indiscriminately.
3. Commit and push only after authorized. Keep source-review folders, generated dist, dependencies, secrets and unapproved assets absent from tracked files. The publication audit checks tracked paths when Git exists.
4. Import that repository into Vercel using the settings above. Do not add credentials for GitHub activity or Manu. Obtain authorization for the preview deployment as well as production publication.
5. On an authorized preview, directly open and refresh all six case routes. Verify `/api/github` JSON, cache/error headers, contact links, approved certification statuses, Manu, mobile/reduced motion, image loading and private-path behavior. A local pass does not validate the hosted runtime.
6. Only after preview review, authorize production promotion and domain connection. Record the release commit and deployment URL. Keep the prior known-good deployment available for rollback; on an initial release, rollback means unpublishing/reverting the first release.

No publishing commands have been executed merely by creating this document.
