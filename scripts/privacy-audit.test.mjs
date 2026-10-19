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
