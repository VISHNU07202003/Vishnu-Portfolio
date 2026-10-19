import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const compiled=ts.transpileModule(readFileSync(new URL('../app/src/experienceTimeline.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};runInNewContext(compiled,{exports,require});
const {gsap}=require('gsap');
function setup(){
 const rotations=[[-7,-7,6,-4,-12],[5,5,-8,5,-7]];
 const targets=rotations.map(group=>group.map(rotation=>({x:0,y:0,z:0,rotation,rotationX:0,rotationY:0,scale:1,opacity:1})));
 let size=520;
 const timeline=exports.buildExperienceTimeline(targets[0],targets[1],()=>size,rotations);
 return {targets,timeline,resize:()=>{size=400;timeline.progress(0);timeline.invalidate();}};
}
const snapshot=targets=>targets.flat().map(t=>Object.fromEntries(['x','y','z','rotation','rotationX','rotationY','scale','opacity'].map(k=>[k,Math.round(t[k]*10000)/10000])));
test('five layers detach independently; overlap never becomes an empty scene',()=>{
 const {targets,timeline}=setup();
 timeline.progress(.4);assert.equal(new Set(targets[0].map(t=>`${t.x},${t.y}`)).size,5);
 for(let p=0;p<=1;p+=.01){timeline.progress(p);assert.ok(targets.flat().some(t=>t.opacity>=.45),`blank at ${p}`);}
 timeline.progress(.48);assert.ok(targets[0].some(t=>t.opacity>.3));assert.ok(targets[1].some(t=>t.opacity>.3));timeline.kill();
});
test('reverse and rapid seeks restore deterministic endpoints and midpoint',()=>{
 const {targets,timeline}=setup();timeline.progress(.5);const middle=snapshot(targets);
 timeline.progress(1);assert.ok(targets[0].every(t=>t.opacity===0));assert.ok(targets[1].every(t=>t.x===0&&t.y===0&&t.z===0&&t.scale===1&&t.opacity===1));
 for(const p of [.12,.9,.37,.8,0,.5])timeline.progress(p);
 assert.deepEqual(snapshot(targets),middle);
 timeline.progress(0);assert.ok(targets[0].every(t=>t.x===0&&t.y===0&&t.scale===1&&t.opacity===1));assert.ok(targets[1].every(t=>t.opacity===0));timeline.kill();
});
test('resize recomputes spatial offsets and keeps final composition intact',()=>{
 const {targets,timeline,resize}=setup();timeline.progress(.45);const before=targets[0][0].x;resize();timeline.progress(.45);assert.ok(Math.abs(targets[0][0].x)<Math.abs(before));timeline.progress(1);assert.ok(targets[1].every(t=>t.x===0&&t.y===0&&t.scale===1));timeline.kill();
});

test('three chapters hold the middle composition, assemble the third and reverse without ghosts',()=>{
 const rotations=[[-7,-7,6,-4,-12],[5,5,-8,5,-7],[4,-7,7,-3,-6]];
 const targets=rotations.map(group=>group.map(rotation=>({x:0,y:0,z:0,rotation,rotationX:0,rotationY:0,scale:1,opacity:1})));
 let size=520;
 const timeline=exports.buildExperienceSequence(targets,()=>size,rotations);
 const composed=index=>{targets.forEach((group,i)=>assert.ok(group.every(t=>i===index?t.opacity===1&&t.x===0&&t.y===0&&t.scale===1:t.opacity===0),`chapter ${index}, group ${i}`));};
 timeline.progress(.001);composed(0);
 timeline.progress(.5);composed(1);
 timeline.progress(1);composed(2);
 timeline.progress(.74);const middle=snapshot(targets);
 for(const p of [.02,.98,.3,.9,.51,.74])timeline.progress(p);
 assert.deepEqual(snapshot(targets),middle);
 for(let p=1;p>=0;p-=.005){timeline.progress(p);assert.ok(targets.flat().some(t=>t.opacity>=.45),`blank at ${p}`);}
 timeline.progress(.5);composed(1);
 timeline.progress(0);composed(0);
 timeline.progress(.2);const before=targets[0][1].x;
 timeline.progress(0);size=360;timeline.invalidate();timeline.progress(.2);
 assert.ok(Math.abs(targets[0][1].x)<Math.abs(before));
 timeline.progress(1);composed(2);
 timeline.kill();
});
test.after(()=>gsap.ticker.sleep());

