import type { IncomingMessage, ServerResponse } from 'node:http';

export const GITHUB_ACCOUNT = 'VISHNU07202003';
const TTL = 5 * 60 * 1000;
export interface GithubActivity {
  repositories: number;
  recentRepositories: number;
  commits: number | null;
  commitsIncomplete: boolean;
  latest: { sha: string; repository: string; date: string; url: string }[];
  fetchedAt: string;
}
type Repo = { created_at: string; private: boolean };
type Commit = { sha: string; repository: { full_name: string; private: boolean }; commit: { author: { date: string } } };
const count = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw Error('Invalid GitHub count');
  return value;
};

export async function fetchGithubActivity(fetcher: typeof fetch = fetch, now = Date.now()): Promise<GithubActivity> {
  const get = async (path: string) => {
    const response = await fetcher(`https://api.github.com${path}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Vishnu-Portfolio', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error(`GitHub unavailable (${response.status})`);
    return response.json();
  };
  const cutoff = now - 90 * 24 * 60 * 60 * 1000;
  const recent = async () => {
    let total = 0;
    // Walk creation-sorted pages until older repositories are reached. Forks count too.
    for (let page = 1; page <= 20; page++) {
      const repos: Repo[] = await get(`/users/${GITHUB_ACCOUNT}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`);
      if (!Array.isArray(repos)) throw Error('Invalid GitHub repositories');
      for (const repo of repos) {
        const created = Date.parse(repo.created_at);
        if (!Number.isFinite(created) || repo.private !== false) throw Error('Invalid public repository');
        if (created < cutoff) return total;
        if (created <= now) total++;
      }
      if (repos.length < 100) return total;
    }
    throw Error('Repository pagination limit reached');
  };
  const [user, search, recentRepositories] = await Promise.all([
    get(`/users/${GITHUB_ACCOUNT}`),
    get(`/search/commits?q=${encodeURIComponent(`author:${GITHUB_ACCOUNT}`)}&sort=author-date&order=desc&per_page=3`),
    recent(),
  ]);
  if (!Array.isArray(search.items) || typeof search.incomplete_results !== 'boolean') throw Error('Invalid commit search');
  const repositories = count(user.public_repos);
  if (recentRepositories > repositories) throw Error('GitHub changed during refresh');
  const latest = search.items.filter((item: Commit) => item.repository?.private === false).slice(0, 3).map((item: Commit) => {
    const repository = item.repository.full_name;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^[a-f0-9]{40,64}$/.test(item.sha) || !Number.isFinite(Date.parse(item.commit.author.date))) throw Error('Invalid commit metadata');
    return { sha: item.sha.slice(0, 7), repository, date: item.commit.author.date, url: `https://github.com/${repository}/commit/${item.sha}` };
  });
  return { repositories, recentRepositories, commits: search.incomplete_results ? null : count(search.total_count), commitsIncomplete: search.incomplete_results, latest, fetchedAt: new Date(now).toISOString() };
}

// Shared cache and single-flight refresh keep public API traffic bounded.
export function createGithubService(loader = fetchGithubActivity, clock = Date.now) {
  let cached: GithubActivity | undefined;
  let pending: Promise<GithubActivity> | undefined;
  let retryAfter = 0;
  return async () => {
    const now = clock();
    if (cached && now - Date.parse(cached.fetchedAt) < TTL) return { ...cached, stale: false };
    if (now < retryAfter) {
      if (cached) return { ...cached, stale: true };
      throw Error('GitHub temporarily unavailable');
    }
    try {
      pending ??= loader();
      cached = await pending;
      return { ...cached, stale: false };
    } catch {
      retryAfter = now + 60000;
      if (cached) return { ...cached, stale: true };
      throw Error('GitHub temporarily unavailable');
    } finally { pending = undefined; }
  };
}
const activity = createGithubService();
export async function githubHandler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return; }
  try {
    const result = await activity();
    res.setHeader('Cache-Control', result.stale ? 'no-store' : 'public, max-age=60, s-maxage=300');
    res.end(JSON.stringify(result));
  } catch {
    res.statusCode = 503; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Retry-After', '60');
    res.end(JSON.stringify({ error: 'GitHub activity is temporarily unavailable. Visit the public profile for current activity.' }));
  }
}
