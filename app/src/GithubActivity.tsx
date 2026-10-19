import { useEffect, useState } from 'react';

interface Activity {
  repositories: number;
  recentRepositories: number;
  commits: number | null;
  commitsIncomplete: boolean;
  latest: { sha: string; repository: string; date: string; url: string }[];
  fetchedAt: string;
  stale: boolean;
}
const profile = 'https://github.com/VISHNU07202003';
const number = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString();
export default function GithubActivity() {
  const [data, setData] = useState<Activity | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refresh, setRefresh] = useState(0);
  const [refreshAllowed, setRefreshAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    let running = false;
    const update = async () => {
      if (document.hidden || running) return;
      running = true;
      controller = new AbortController();
      try {
        const response = await fetch('/api/github', { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw Error('Unavailable');
        const result: Activity = await response.json();
        if (!Number.isInteger(result.repositories) || !Array.isArray(result.latest) || !Number.isFinite(Date.parse(result.fetchedAt))) throw Error('Invalid response');
        if (active) { setData(result); setStatus('ready'); }
      } catch {
        if (active) setStatus('error');
      } finally { running = false; }
    };
    void update();
    const interval = window.setInterval(() => { void update(); }, 5 * 60 * 1000);
    const visible = () => { if (!document.hidden) void update(); };
    document.addEventListener('visibilitychange', visible);
    return () => { active = false; controller?.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', visible); };
  }, [refresh]);
  useEffect(() => {
    const timer = window.setTimeout(() => setRefreshAllowed(true), 60000);
    return () => clearTimeout(timer);
  }, [refresh]);
  const stale = data && (data.stale || status === 'error');
  return <section id="github" className="github-section frame section-space" aria-labelledby="github-title">
    <div className="section-heading"><span className="eyebrow">Beyond selected work</span><a href={profile} className="github-profile" rel="noreferrer">@VISHNU07202003 ↗</a></div>
    <div className="github-heading"><h2 id="github-title">Still building<span className="accent-dot">.</span></h2><span className={`github-signal${stale || status==='error'?' is-stale':''}`}>{status==='loading'?'Connecting to GitHub':stale?'Last available snapshot':status==='error'?'GitHub unavailable':'GitHub · auto-updating'}</span></div>
    <div className="github-stats">
      <div><span className="github-number">{number(data?.repositories)}</span><h3>Public repositories</h3><p>All current repositories, new and old.<br/>Includes forks and archived repositories.</p></div>
      <div><span className="github-number">{number(data?.recentRepositories)}</span><h3>Created in the last 90 days</h3><p>A recent slice of the total above.</p></div>
      <div><span className="github-number">{number(data?.commits)}</span><h3>Indexed public commits</h3><p>Commits authored by my GitHub account.<br/>Public default branches indexed by GitHub.</p></div>
    </div>
    <div className="github-update" role="status"><span>{data?`${stale?'Last successful check':'Checked'} ${new Date(data.fetchedAt).toLocaleString()}`:status==='error'?'Unable to load counts. View my GitHub profile for current activity.':'Loading public activity…'}{data?.commitsIncomplete?' · GitHub returned an incomplete commit search; the total is withheld.':''}</span><button aria-disabled={!refreshAllowed} onClick={()=>{if(!refreshAllowed)return;setRefreshAllowed(false);setRefresh(value=>value+1);}}>Refresh data ↻</button></div>
    <div className="github-latest"><div><span className="eyebrow">Latest indexed commits</span><p>Public history, directly from GitHub.</p></div><ol>{data?.latest.map(commit=><li key={`${commit.repository}-${commit.sha}`}><a href={commit.url} rel="noreferrer"><code>{commit.sha}</code><span>{commit.repository.split('/')[1]}</span><time dateTime={commit.date}>{new Date(commit.date).toLocaleDateString()}</time><span aria-hidden="true">↗</span></a></li>)}{!data&&<li className="github-feed-state">{status==='error'?<a href={profile} rel="noreferrer">Activity unavailable. Visit GitHub ↗</a>:'Checking GitHub for recent commits…'}</li>}{data&&!data.latest.length&&<li className="github-feed-state">No public commits returned by GitHub.</li>}</ol></div>
    <p className="github-note">Refreshes every five minutes while this page is visible. GitHub indexing can lag; private work, deleted repositories and commits on other branches are excluded. Repository totals are separate from the three curated case studies.</p>
  </section>;
}
