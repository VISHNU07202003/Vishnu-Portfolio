import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const {gsap}=require('gsap');
const exports={};
runInNewContext(ts.transpileModule(readFileSync(new URL('../app/src/sceneTimeline.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require});
const target=()=>({x:0,y:0,yPercent:0,scale:1,rotation:0,opacity:1});
test('shared scene hands off before scatter and restores hero on reverse',()=>{
 const hero=Object.assign(target(),{querySelector:()=>target()});
 const parts=new Map();const experience={querySelector:key=>{if(!parts.has(key))parts.set(key,target());return parts.get(key);}};
 const sample={progress:0};const scatter=gsap.timeline({paused:true}).to(sample,{progress:1,duration:1,ease:'none'});
 const scene=exports.buildSceneTimeline(hero,experience,scatter);
 scene.progress(.14);assert.equal(sample.progress,0);assert.ok(parts.get('.experience-scene-stack').opacity>0);
 scene.progress(.28);assert.equal(hero.opacity,0);assert.equal(sample.progress,0);
 scene.progress(1);assert.equal(sample.progress,1);
 scene.progress(.14);const opacity=hero.opacity;scene.progress(.8);scene.progress(.14);assert.equal(hero.opacity,opacity);
 scene.progress(0);assert.equal(hero.opacity,1);assert.equal(parts.get('.experience-scene-stack').opacity,0);scene.kill();
});
test('experience progress is clamped and cannot scatter during hero exit',()=>{assert.equal(exports.experienceProgress(.15),0);assert.equal(exports.experienceProgress(1),1);assert.equal(exports.experienceProgress(2),1);});

test('three chapter controls select composed states and copy switches at each transition midpoint',()=>{
 for(let index=0;index<3;index++)assert.equal(exports.chapterState(exports.chapterProgress(index,3),3).active,index);
 assert.equal(exports.chapterState(.24,3).active,0);
 assert.equal(exports.chapterState(.26,3).active,1);
 assert.equal(exports.chapterState(.74,3).active,1);
 assert.equal(exports.chapterState(.76,3).active,2);
 assert.equal(exports.chapterState(1,3).active,2);
});
test.after(()=>gsap.ticker.sleep());
