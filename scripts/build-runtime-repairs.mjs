import fs from 'node:fs';import path from 'node:path';import {repairFleetRuntime} from './repair-runtime.mjs';
function files(directory){if(!fs.existsSync(directory))return[];return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(directory,e.name)):[path.join(directory,e.name)])}
let count=0;
for(const file of ['public','rendered','data'].flatMap(files).filter(f=>f.endsWith('.html'))){const before=fs.readFileSync(file,'utf8'),after=repairFleetRuntime(before);if(after!==before){fs.writeFileSync(file,after);count++}}
function repair(value){if(typeof value==='string'&&value.includes('<'))return repairFleetRuntime(value);if(Array.isArray(value))return value.map(repair);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,repair(v)]));return value}
for(const file of files('data').filter(f=>f.endsWith('.json')&&!/fleet-runtime-repairs\.json$/.test(f))){const before=fs.readFileSync(file,'utf8');let value;try{value=JSON.parse(before)}catch{continue}const after=repair(value);if(JSON.stringify(after)!==JSON.stringify(value)){fs.writeFileSync(file,JSON.stringify(after,null,2)+'\n');count++}}
console.log('Applied runtime repairs to',count,'captured documents');
