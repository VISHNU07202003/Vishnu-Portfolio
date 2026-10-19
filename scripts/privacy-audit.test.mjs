import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {auditSource,auditBundle} from './privacy-audit.mjs';
function fixture(fn){const dir=mkdtempSync(join(tmpdir(),'portfolio-audit-'));try{for(const p of ['public/assets','app/src/assets','dist/assets','private-documents/career-sources','design-inputs'])mkdirSync(join(dir,p),{recursive:true});writeFileSync(join(dir,'app/src/assets/portrait.jpg'),'approved-photo');writeFileSync(join(dir,'dist/index.html'),'<html>Portfolio</html>');fn(dir);}finally{rmSync(dir,{recursive:true,force:true});}}
test('rejects personal file restored to public',()=>fixture(dir=>{writeFileSync(join(dir,'public/assets/Resume.pdf'),'private');assert.ok(auditSource(dir).some(x=>x.includes('Unapproved public')));}));
test('rejects private import in app source',()=>fixture(dir=>{writeFileSync(join(dir,'app/src/bad.ts'),'import x from "../../private-documents/career-sources/CV.pdf"');assert.ok(auditSource(dir).some(x=>x.includes('Private source')));}));
test('detects renamed private image by fingerprint',()=>fixture(dir=>{writeFileSync(join(dir,'design-inputs/manu.jpg'),'private-art');writeFileSync(join(dir,'dist/assets/innocent.jpg'),'private-art');assert.ok(auditBundle(dir).some(x=>x.includes('fingerprint')));}));
test('detects draft content and review endpoint in bundle',()=>fixture(dir=>{writeFileSync(join(dir,'dist/assets/app.js'),'fetch("/__review/manu.jpg")');assert.ok(auditBundle(dir).some(x=>x.includes('Draft/private')));}));
test('allows only the approved portrait with clean output',()=>fixture(dir=>{writeFileSync(join(dir,'dist/assets/portrait.jpg'),'approved-photo');assert.deepEqual(auditBundle(dir),[]);}));
test('rejects a replacement or unrelated PNG even at the approved Manu path',()=>fixture(dir=>{writeFileSync(join(dir,'app/src/assets/manu-approved.png'),'unapproved');writeFileSync(join(dir,'dist/assets/manu.png'),'unapproved');assert.ok(auditSource(dir).some(x=>x.includes('Unapproved')));assert.ok(auditBundle(dir).some(x=>x.includes('Unapproved release image')));}));
test('allows approved identity, credentials and exact email while rejecting held metrics and other emails',()=>fixture(dir=>{writeFileSync(join(dir,'dist/assets/app.js'),'TransGIS FedGuard VIT-AP University Blueberry Breeding AWS Certified AI Practitioner vishnusaipadyala07@gmail.com');assert.deepEqual(auditBundle(dir),[]);writeFileSync(join(dir,'dist/assets/app.js'),'Accuracy: 98.76% secret@example.org');assert.ok(auditBundle(dir).length>=2);}));

// Publication regressions use isolated copies of the exact release manifest.
import { readFileSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { auditPublication } from './publication-audit.mjs';
const publicationRoot = fileURLToPath(new URL('..', import.meta.url));
function publicationFixture(fn, vercel = false) {
 const dir = mkdtempSync(join(tmpdir(), 'publication-regression-'));
 const old = { VERCEL: process.env.VERCEL, VERCEL_ENV: process.env.VERCEL_ENV };
 try {
  if (vercel) { process.env.VERCEL = '1'; process.env.VERCEL_ENV = 'preview'; }
  else { delete process.env.VERCEL; delete process.env.VERCEL_ENV; }
  const manifest = JSON.parse(readFileSync(join(publicationRoot, 'publication-files.json'), 'utf8'));
  for (const path of manifest.files) { const target = join(dir, path); mkdirSync(dirname(target), { recursive: true }); copyFileSync(join(publicationRoot, path), target); }
  fn(dir);
 } finally {
  for (const [key, value] of Object.entries(old)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  rmSync(dir, { recursive: true, force: true });
 }
}
function fixtureGit(dir, ...args) { return execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
test('publication without Git metadata still checks missing source files', () => publicationFixture(dir => { assert.deepEqual(auditPublication(dir, true).problems, []); rmSync(join(dir, 'app/src/App.tsx')); assert.ok(auditPublication(dir).problems.some(x => x.includes('Missing publication file'))); }));
test('Vercel stripped metadata retains source privacy and artwork integrity checks', () => publicationFixture(dir => { mkdirSync(join(dir, '.git/objects'), { recursive: true }); assert.deepEqual(auditPublication(dir, true).problems, []); writeFileSync(join(dir, 'app/src/assets/manu-approved.png'), 'unapproved'); writeFileSync(join(dir, 'app/src/private.ts'), 'import x from "../../private-documents/CV.pdf"'); const issues = auditPublication(dir).problems; assert.ok(issues.some(x => x.includes('Changed approved artwork'))); assert.ok(issues.some(x => x.includes('Private source'))); assert.ok(issues.some(x => x.includes('Unlisted source file'))); }, true));
test('Vercel stripped metadata retains secret and forbidden manifest checks', () => publicationFixture(dir => { mkdirSync(join(dir, '.git')); const manifest = JSON.parse(readFileSync(join(dir, 'publication-files.json'), 'utf8')); manifest.files.push('private-documents/source.pdf'); mkdirSync(join(dir, 'private-documents')); writeFileSync(join(dir, 'private-documents/source.pdf'), 'private'); writeFileSync(join(dir, 'publication-files.json'), JSON.stringify(manifest)); writeFileSync(join(dir, '.env.example'), '-----BEGIN ' + 'PRIVATE KEY-----'); const issues = auditPublication(dir).problems; assert.ok(issues.some(x => x.includes('Potential credential'))); assert.ok(issues.some(x => x.includes('Forbidden publication path'))); }, true));
test('incomplete local Git metadata fails closed', () => publicationFixture(dir => { mkdirSync(join(dir, '.git')); assert.ok(auditPublication(dir).problems.includes('Unable to validate local Git checkout')); }));
test('local checkout rejects extra tracked and missing tracked manifest files', () => publicationFixture(dir => { fixtureGit(dir, 'init', '--quiet'); fixtureGit(dir, 'config', 'core.autocrlf', 'false'); fixtureGit(dir, 'add', '--all'); assert.deepEqual(auditPublication(dir).problems, []); writeFileSync(join(dir, 'unexpected.txt'), 'extra'); fixtureGit(dir, 'add', '--force', 'unexpected.txt'); assert.ok(auditPublication(dir).problems.includes('Unapproved tracked file: unexpected.txt')); fixtureGit(dir, 'rm', '--cached', 'app/src/App.tsx'); assert.ok(auditPublication(dir).problems.includes('Publication file not tracked: app/src/App.tsx')); }));
test('valid Vercel checkout still rejects an unreadable index', () => publicationFixture(dir => { fixtureGit(dir, 'init', '--quiet'); writeFileSync(join(dir, '.git/index'), 'corrupted'); assert.ok(auditPublication(dir).problems.includes('Unable to inspect Git index')); }, true));
test('release config disables automatic Git deployments and preserves routes and headers', () => { const config = JSON.parse(readFileSync(join(publicationRoot, 'vercel.json'), 'utf8')); assert.equal(config.git.deploymentEnabled, false); assert.deepEqual(config.rewrites, [{source:'/work/:path*',destination:'/index.html'}]); assert.equal(config.functions['api/github.ts'].maxDuration, 30); assert.equal(config.headers[0].headers.length, 4); });
