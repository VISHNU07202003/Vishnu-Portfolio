import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
export function loadPublicModule(name) {
 const exports={};
 const compiled=ts.transpileModule(readFileSync(new URL(`../app/src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 runInNewContext(compiled,{exports,require:id=>{if(id==='./publicContent')return loadPublicModule('publicContent');throw Error(`Unexpected import ${id}`);}});
 return exports;
}
