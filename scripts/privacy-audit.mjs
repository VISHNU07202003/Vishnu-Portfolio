import { readdirSync, readFileSync, existsSync, lstatSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function walk(dir){if(!existsSync(dir))return [];return readdirSync(dir).flatMap(name=>{const p=resolve(dir,name);if(lstatSync(p).isSymbolicLink())throw Error(`Symlink not allowed: ${p}`);return lstatSync(p).isDirectory()?walk(p):[p];});}
const hash=b=>createHash('sha256').update(b).digest('hex');
// Exact optimized derivative approved by the user; other PNGs remain forbidden.
const manuHash='4f3ff6214f2cbcbac376f2aad058d56acdf08e67c098d062b4579aeb9dd94b57';
// Owner supplied this close-up and requested an Adobe crop for the chat on 2026-10-18.
const manuChatHash='cef5544f34700590c002a03e7f0df4b4e6679aa032cfff2449124a424429d23a';
export function auditSource(base=root){
 const problems=[];
 for(const p of walk(resolve(base,'public')))if(relative(resolve(base,'public'),p).replaceAll('\\','/')!=='assets/README.md')problems.push(`Unapproved public file: ${relative(base,p)}`);
 for(const p of walk(resolve(base,'app'))){
  const rel=relative(base,p).replaceAll('\\','/');
  const approvedManu=(rel==='app/src/assets/manu-approved.png'&&hash(readFileSync(p))===manuHash)||(rel==='app/src/assets/manu-chat-portrait.png'&&hash(readFileSync(p))===manuChatHash);
  if(!['.ts','.tsx','.css','.html'].includes(extname(p))&&rel!=='app/src/assets/portrait.jpg'&&!approvedManu)problems.push(`Unapproved application file: ${rel}`);
  if(['.ts','.tsx','.css','.html'].includes(extname(p))&&/private-documents|design-inputs|career-sources|\.pdf\b|import\.meta\.glob/.test(readFileSync(p,'utf8')))problems.push(`Private source reference: ${rel}`);
 }
 return problems;
}
export function auditBundle(base=root){
 const problems=[];const dist=resolve(base,'dist');if(!existsSync(resolve(dist,'index.html')))return ['Missing production build'];
 const approved=resolve(base,'app/src/assets/portrait.jpg');const portraitHash=existsSync(approved)?hash(readFileSync(approved)):'';
 const privateFiles=[...walk(resolve(base,'private-documents/career-sources')),...walk(resolve(base,'design-inputs'))].filter(p=>!p.endsWith('portrait-original.jpg'));
 const hashes=new Set(privateFiles.map(p=>hash(readFileSync(p))));
 const draftPath=resolve(base,'private-documents/phase1-preview.json');
 const drafts=existsSync(draftPath)?JSON.parse(readFileSync(draftPath,'utf8')):{experiences:[],projects:[]};
 // Only these project identities and the VIT organization are now approved. Old draft
 // summaries, held identities, exact metric strings and private-source markers remain forbidden.
 const approvedIds=new Set(['transgis','fedguard','campus-events','cell-counter']);
 const forbidden=['__review/manu.jpg','private-documents','design-inputs','career-sources',
  ...drafts.experiences.flatMap(x=>[...(x.id==='campus-events'||x.kind==='lab'||x.organization==='SmartInternz'?[]:[x.organization]),x.summary]),
  ...drafts.projects.flatMap(x=>[...(approvedIds.has(x.id)?[]:[x.name]),x.heading]),
  'DepGraph','Road Damage Detection',
  'credential ID','exam score','verification code',
 ];
 for(const p of walk(dist)){
  const data=readFileSync(p);const ext=extname(p);const rel=relative(dist,p);
  if(!['.html','.js','.css','.jpg','.png'].includes(ext))problems.push(`Unexpected release file: ${rel}`);
  if(ext==='.png'&&![manuHash,manuChatHash].includes(hash(data)))problems.push(`Unapproved release image: ${rel}`);
  if(hashes.has(hash(data)))problems.push(`Private source fingerprint found: ${rel}`);
  if(ext==='.jpg'&&hash(data)!==portraitHash)problems.push(`Unapproved release image: ${rel}`);
  if(['.html','.js','.css'].includes(ext)){const text=data.toString();for(const needle of forbidden)if(text.includes(needle))problems.push(`Draft/private marker in ${rel}: ${needle}`);
   // Generic claim patterns avoid publishing actual withheld evaluation values in audit code.
   if(/(?:accuracy|R²|mean absolute error|MAE)\s*[:=]\s*\d+(?:\.\d+)?\s*%?|\b\d+(?:\.\d+)?\s+(?:reference masks|cells per sample|tools assessed)\b/i.test(text))problems.push(`Unapproved numerical evaluation in ${rel}`);
   const unapprovedEmails=(text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)||[]).filter(email=>email!=='vishnusaipadyala07@gmail.com');
   if(unapprovedEmails.length||/AKIA[0-9A-Z]{16}|-----BEGIN .*PRIVATE KEY-----/.test(text))problems.push(`Contact or secret marker in ${rel}`);
  }
 }
 return problems;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];const problems=mode==='source'?auditSource():mode==='bundle'?auditBundle():['Expected source or bundle'];
 if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log(`Privacy ${mode} audit: PASS`);
}
