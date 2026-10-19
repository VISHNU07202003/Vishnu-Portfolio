import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicModule } from './load-public-module.mjs';
const content=loadPublicModule('publicContent').default;

test('all three experiences link to approved cases without expanding Selected Work',()=>{
 assert.deepEqual(Array.from(content.projects,p=>p.id),['cell-counter','snack-squad','transgis','fedguard','campus-events','plant-cropper']);
 assert.deepEqual(Array.from(content.projects.filter(p=>p.featured),p=>p.id),['transgis','fedguard','plant-cropper']);
 assert.equal(content.experiences.length,3);
 assert.deepEqual(Array.from(content.experiences,s=>s.caseStudy),['cell-counter','campus-events','snack-squad']);
 assert.equal(content.experiences[0].organization,'University of Florida – Blueberry Breeding & Genomics Lab');
 assert.equal(content.experiences[0].title,'Machine Learning Engineer Student Assistant');
 assert.equal(content.experiences[1].title,'Software Engineering & UX Research Student Assistant');
 assert.match(content.projects.find(p=>p.id==='campus-events').sections[2].body,/led three student developers, working with a faculty advisor/);
});
test('education keeps the masters expected and omits unconfirmed enrollment wording',()=>{
 assert.match(content.profile.education[0].dates,/May 2027 \(expected\)/);
 assert.equal(content.profile.education[1].institution,'VIT-AP University');
 assert.doesNotMatch(content.profile.introduction,/enrolled|master.s student|pursuing/i);
});
test('held project claims, metrics and private source paths remain excluded',()=>{
 const data=JSON.stringify(content);
 for(const marker of ['DepGraph','Road Damage Detection'])assert.ok(!data.includes(marker),marker);
 assert.doesNotMatch(data,/\b\d+(?:\.\d+)?\s*%|\b\d+\+?\s+(?:users|customers|reference masks|cells|tools)\b|(?:R²|MAE|mean absolute error)\s*[:=]\s*\d/i);
 assert.doesNotMatch(data,/\.pdf\b|private-documents|career-sources|design-inputs|credential ID|exam score/i);
});

test('Android is the third animated chapter and retains externship and prototype boundaries',()=>{
 const android=content.experiences[2];
 assert.equal(android.kind,'android');
 assert.equal(android.organization,'SmartInternz');
 assert.equal(android.title,'Software Development Engineer (Android)');
 assert.equal(android.dates,'Aug 2023–Nov 2023');
 assert.match(android.classification,/externship/);
 assert.match(android.summary,/three-member team.*Snack Squad.*prototype/);
 assert.doesNotMatch(JSON.stringify(android),/Google|100\+|deployed|production|customers|salaried/);
});
test('only approved contact values and accurate credential statuses are published',()=>{
 assert.deepEqual(Array.from(content.contact,l=>l.href),['mailto:vishnusaipadyala07@gmail.com','https://github.com/VISHNU07202003','https://www.linkedin.com/in/vishnu-sai-padyala-95317b24b/','tel:+18134516587']);
 assert.equal(content.certifications.length,3);
 assert.match(content.certifications[0].dates,/August 2029/);
 assert.equal(content.certifications[1].status,'Course completed');
 assert.equal(content.certifications[2].status,'Expired');
});
test('all public links resolve to published case ids or known section anchors',()=>{
 const sections=new Set(['work','experience','about','education','skills','certifications','contact']);
 const ids=new Set(content.projects.map(p=>p.id));
 const links=[...content.projects.flatMap(p=>p.links),...content.answers.map(a=>a.link),...content.experiences.filter(s=>s.caseStudy).map(s=>({href:`/work/${s.caseStudy}`}))];
 for(const {href} of links){if(href.startsWith('/work/'))assert.ok(ids.has(href.slice(6)),href);else assert.ok(href.startsWith('/#')&&sections.has(href.slice(2)),href);}
 for(const p of content.projects){const count=p.id==='plant-cropper'?4:10;assert.equal(p.sections.length,count);assert.equal(new Set(p.sections.map(s=>s.title)).size,count);assert.ok(p.sections.every(s=>s.body.trim()));}
});
