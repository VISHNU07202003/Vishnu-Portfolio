import { readFileSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { walk, auditSource } from './privacy-audit.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const assets = new Map([
 ['app/src/assets/portrait.jpg', '6ce56d40b85044ef8a9d57989af5afc0aebf52cd7156455365f0e585e826c26b'],
 ['app/src/assets/manu-approved.png', '4f3ff6214f2cbcbac376f2aad058d56acdf08e67c098d062b4579aeb9dd94b57'],
 ['app/src/assets/manu-chat-portrait.png', 'cef5544f34700590c002a03e7f0df4b4e6679aa032cfff2449124a424429d23a'],
]);
export function auditPublication(base = root, strict = false) {
 const manifest = JSON.parse(readFileSync(resolve(base, 'publication-files.json'), 'utf8'));
 const files = manifest.files;
 if (!Array.isArray(files) || files.some(p => typeof p !== 'string' || p.includes('..') || p.includes('\\') || p.startsWith('/'))) throw Error('Invalid publication manifest');
 const allowed = new Set(files), problems = auditSource(base);
 if (allowed.size !== files.length) problems.push('Duplicate publication path');
 for (const path of files) {
  if (/^(private-documents|design-inputs|docs|content|prompts|references|public|node_modules|dist|\.git)\//.test(path) || /\.(pdf|docx|zip|pem|key)$/i.test(path) || path.startsWith('.env') && path !== '.env.example') problems.push(`Forbidden publication path: ${path}`);
  const full = resolve(base, path);
  if (!existsSync(full)) { problems.push(`Missing publication file: ${path}`); continue; }
  const data = readFileSync(full);
  if (assets.has(path) && createHash('sha256').update(data).digest('hex') !== assets.get(path)) problems.push(`Changed approved artwork: ${path}`);
  if (['.png', '.jpg'].includes(extname(path)) && !assets.has(path)) problems.push(`Unapproved artwork: ${path}`);
  if (/AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(data.toString())) problems.push(`Potential credential: ${path}`);
 }
 for (const dir of ['app', 'api', 'server', 'scripts']) for (const full of walk(resolve(base, dir))) {
  const path = relative(base, full).replaceAll('\\', '/');
  // The old local source-preflight tool is deliberately not part of publication.
  if (path === 'scripts/preflight.py') continue;
  if (!allowed.has(path)) problems.push(`Unlisted source file: ${path}`);
 }
 const strictFiles = dir => readdirSync(dir).flatMap(name => {
  if (['node_modules', 'dist', '.git'].includes(name)) return [];
  const full = resolve(dir, name), stat = lstatSync(full);
  if (stat.isSymbolicLink()) throw Error('Symlink in publication copy');
  return stat.isDirectory() ? strictFiles(full) : [full];
 });
 if (strict) for (const full of strictFiles(base)) {
  const path = relative(base, full).replaceAll('\\', '/');
  if (!allowed.has(path)) problems.push(`Extra file in publication copy: ${path}`);
 }
 let git = 'not initialized; candidate audit only';
 if (existsSync(resolve(base, '.git'))) {
  const result = spawnSync('git', ['ls-files', '--cached', '-z'], { cwd: base, encoding: 'utf8' });
  if (result.status !== 0) problems.push('Unable to inspect Git index');
  else { git = 'index inspected'; for (const path of result.stdout.split('\0').filter(Boolean)) if (!allowed.has(path)) problems.push(`Unapproved tracked file: ${path}`); }
 }
 return { files: files.length, git, problems };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 const result = auditPublication(root, process.argv.includes('--strict'));
 console.log(JSON.stringify(result, null, 2));
 if (result.problems.length) process.exitCode = 1;
}
