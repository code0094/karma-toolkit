// Package and hook smoke checks. This does not evaluate model behavior.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const plugin=path.join(root,'plugins/karma-toolkit');
const read=p=>fs.readFileSync(p,'utf8');
const manifest=JSON.parse(read(path.join(plugin,'.claude-plugin/plugin.json')));
const marketplace=JSON.parse(read(path.join(root,'.claude-plugin/marketplace.json')));
assert.match(manifest.version,/^\d+\.\d+\.\d+$/);
assert.equal(marketplace.plugins[0].source,'./plugins/karma-toolkit');
const skillsDir=path.join(plugin,'skills');
const skills=fs.readdirSync(skillsDir).filter(n=>fs.statSync(path.join(skillsDir,n)).isDirectory()).sort();
assert.equal(skills.length,11,'README and release expect eleven skills');
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);assert(!item.isSymbolicLink(),'Unexpected symlink: '+p);if(item.isDirectory())walk(p);else files.push(p);}}
walk(plugin);
let references=0;
for(const name of skills){
 const text=read(path.join(skillsDir,name,'SKILL.md'));
 assert(text.startsWith('---\n'),'Missing frontmatter: '+name);
 assert.match(text,new RegExp('^name: '+name+'$','m'));
 assert.match(text,/^description: .+/m);
 assert(read(path.join(root,'README.md')).includes('`'+name+'`'),'Undocumented skill: '+name);
}
for(const file of files.filter(p=>p.endsWith('.md'))){
 const text=read(file);
 for(const [,target]of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  if(/^[a-z]+:|^#/.test(target))continue;
  const dest=path.resolve(path.dirname(file),target.split('#')[0]);
  assert(dest.startsWith(plugin+path.sep),'Reference leaves plugin: '+file);
  assert(fs.existsSync(dest),'Missing reference in '+file+': '+target);references++;
 }
}
const checks=read(path.join(skillsDir,'karma-slop/references/checklist.md'));
const ids=[...checks.matchAll(/^\| (CH\d{2}) \|/gm)].map(m=>m[1]);
assert.deepEqual(ids,Array.from({length:48},(_,i)=>'CH'+String(i+1).padStart(2,'0')));
assert(read(path.join(skillsDir,'karma-humanize/LICENSE')).includes('MIT License'));
const upstream=JSON.parse(read(path.join(skillsDir,'karma-humanize/UPSTREAM.json')));
assert.match(upstream.revision,/^[a-f0-9]{40}$/);
const hook=JSON.parse(read(path.join(plugin,'hooks/hooks.json'))).hooks.SessionStart[0].hooks[0];
assert.equal(hook.type,'command');assert.equal(hook.command,'node');assert(Array.isArray(hook.args));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'karma hook smoke '));
try{
 const result=spawnSync(process.execPath,hook.args.map(a=>a.replaceAll('${CLAUDE_PLUGIN_ROOT}',plugin)),{cwd:temp,input:JSON.stringify({hook_event_name:'SessionStart',source:'startup',cwd:temp}),encoding:'utf8',timeout:5000});
 assert.equal(result.status,0,result.stderr);assert.equal(result.stderr,'');
 const output=JSON.parse(result.stdout);assert.equal(output.hookSpecificOutput.hookEventName,'SessionStart');
 assert.match(output.hookSpecificOutput.additionalContext,/AGENTS\.md/);
 assert.deepEqual(fs.readdirSync(temp),[],'Hook must not write project files');
}finally{fs.rmdirSync(temp);}
// High-confidence credential markers only; report paths, never matched values.
const suspicious=files.filter(file=>/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}|\bsk-proj-[A-Za-z0-9_-]{40,}/.test(read(file)));
assert.deepEqual(suspicious,[],'Possible credentials; inspect privately before publishing');
console.log(JSON.stringify({version:manifest.version,skills,localReferences:references,checklistItems:ids.length,hookExecAndOutput:'pass',hookWrites:0,credentialMarkerScan:'pass (working package only; not exhaustive)',limits:'Package validation, not model behavior, real Claude session, or full security audit.'},null,2));
