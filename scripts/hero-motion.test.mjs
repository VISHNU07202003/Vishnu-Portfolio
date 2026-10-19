import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync(new URL('../app/src/heroMotion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function eligible({reduced=false,search='',pathname='/',hash='',seen=null,storageFails=false}={}){
 const exports={};
 runInNewContext(compiled,{exports,require:()=>({}),URLSearchParams,matchMedia:()=>({matches:reduced}),location:{search,pathname,hash},sessionStorage:{getItem(){if(storageFails)throw Error('Storage blocked');return seen;}}});
 return exports.shouldShowIntro();
}
test('reduced motion bypasses both automatic and requested intro',()=>{assert.equal(eligible({reduced:true}),false);assert.equal(eligible({reduced:true,search:'?intro'}),false);});
test('first home visit shows intro, repeat session and deep links bypass it',()=>{assert.equal(eligible(),true);assert.equal(eligible({seen:'1'}),false);assert.equal(eligible({pathname:'/work/fedguard'}),false);assert.equal(eligible({hash:'#work'}),false);});
test('blocked storage fails open; explicit replay remains available',()=>{assert.equal(eligible({storageFails:true}),false);assert.equal(eligible({seen:'1',search:'?intro'}),true);});
