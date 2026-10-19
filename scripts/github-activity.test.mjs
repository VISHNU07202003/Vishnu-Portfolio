import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const moduleExports={};
runInNewContext(ts.transpileModule(readFileSync(new URL('../server/github.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleExports,AbortSignal});
const {fetchGithubActivity,createGithubService}=moduleExports;
const now=Date.parse('2026-10-18T12:00:00Z');
const fixture={repositories:17,recentRepositories:2,commits:277,commitsIncomplete:false,latest:[],fetchedAt:new Date(now).toISOString()};
function upstream({incomplete=false,fail=false,repositories=[]}={}) {
 return async url=>({ok:!fail,status:fail?403:200,json:async()=>url.includes('/repos?')?repositories:url.includes('/search/')?{total_count:277,incomplete_results:incomplete,items:[{sha:'a'.repeat(40),repository:{full_name:'VISHNU07202003/demo',private:false},commit:{author:{date:'2026-10-17T12:00:00Z',email:'must-not-be-returned'},message:'not included'}}]}:{public_repos:17,email:'not included'}});
}
test('counts both old and new repositories; exposes only allowlisted public commit metadata',async()=>{
 const result=await fetchGithubActivity(upstream({repositories:[{created_at:'2026-10-01T00:00:00Z',private:false},{created_at:'2021-01-01T00:00:00Z',private:false}]}),now);
 assert.equal(result.repositories,17);assert.equal(result.recentRepositories,1);assert.equal(result.commits,277);
 assert.equal(result.latest[0].sha,'aaaaaaa');assert.equal(result.latest[0].url,`https://github.com/VISHNU07202003/demo/commit/${'a'.repeat(40)}`);
 assert.ok(!JSON.stringify(result).includes('email'));assert.ok(!JSON.stringify(result).includes('message'));
});
test('incomplete GitHub search never masquerades as a verified commit total',async()=>{const result=await fetchGithubActivity(upstream({incomplete:true}),now);assert.equal(result.commits,null);assert.equal(result.commitsIncomplete,true);});
test('GitHub failure rejects instead of inventing zero activity',async()=>{await assert.rejects(fetchGithubActivity(upstream({fail:true}),now));});
test('simultaneous readers share one upstream refresh and fresh snapshots are reused',async()=>{
 let calls=0;let release;const service=createGithubService(()=>{calls++;return new Promise(resolve=>{release=resolve;});},()=>now);
 const a=service(),b=service();release(fixture);const results=await Promise.all([a,b]);assert.equal(calls,1);assert.equal(results[0].stale,false);await service();assert.equal(calls,1);
});
test('rate limits retain a labeled stale snapshot and back off without another fetch',async()=>{
 let time=now,calls=0;const service=createGithubService(async()=>{if(calls++===0)return fixture;throw Error('rate limit');},()=>time);
 await service();time+=301000;const stale=await service();assert.equal(stale.stale,true);assert.equal(stale.commits,277);await service();assert.equal(calls,2);
});

test('repository pagination counts every recent public repository before reaching old history',async()=>{
 let pages=0;const base=upstream();const fetcher=async url=>{if(!url.includes('/repos?'))return base(url);pages++;return {ok:true,json:async()=>pages===1?Array.from({length:100},()=>({created_at:'2026-10-10T00:00:00Z',private:false})):[{created_at:'2026-09-10T00:00:00Z',private:false},{created_at:'2020-01-01T00:00:00Z',private:false}]};};
 const result=await fetchGithubActivity(async url=>url.endsWith('/users/VISHNU07202003')?{ok:true,json:async()=>({public_repos:140})}:fetcher(url),now);assert.equal(result.recentRepositories,101);assert.equal(pages,2);
});
test('valid empty accounts keep zero totals distinct from upstream failure',async()=>{
 const result=await fetchGithubActivity(async url=>({ok:true,json:async()=>url.includes('/repos?')?[]:url.includes('/search/')?{total_count:0,incomplete_results:false,items:[]}:{public_repos:0}}),now);assert.equal(result.repositories,0);assert.equal(result.commits,0);assert.equal(result.latest.length,0);
});
test('commit URLs cannot be supplied by upstream data or point away from GitHub',async()=>{
 const result=await fetchGithubActivity(async url=>{const response=await upstream()(url);const data=await response.json();if(url.includes('/search/'))data.items[0].html_url='https://untrusted.example';return {...response,json:async()=>data};},now);assert.ok(result.latest[0].url.startsWith('https://github.com/'));assert.ok(!JSON.stringify(result).includes('untrusted.example'));
});
