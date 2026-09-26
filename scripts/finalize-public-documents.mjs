import fs from 'node:fs';
import path from 'node:path';
import {normalizePublicDocument} from './normalize-public-document.mjs';
const root=process.cwd(),fileRoutes=new Map();
const add=(file,route)=>{if(typeof file==='string'&&route?.startsWith('/'))fileRoutes.set(path.resolve(root,file),route.replace(/\/$/,'')||'/')};
for(const relative of ['public/routes.json','public/route-map.json','public/site-pages/routes.json','data/rendered-pages/manifest.json','rendered/route-manifest.json']){
 const file=path.join(root,relative);if(!fs.existsSync(file))continue;
 const raw=JSON.parse(fs.readFileSync(file,'utf8'));const routes=raw.routes||raw;
 for(const [route,entry] of Object.entries(routes)){const name=typeof entry==='string'?entry:entry?.file;if(!name)continue;
 const base=relative==='public/routes.json'?'public/site-pages':relative==='public/route-map.json'?'public/rendered-pages':relative==='rendered/route-manifest.json'?'rendered/pages':path.dirname(relative);
 add(path.join(base,name+(path.extname(name)?'':'.html')),route);
 }
}
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!['node_modules','.next'].includes(e.name)?walk(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[])}
let changed=0;
function transform(html,route){return normalizePublicDocument(html,route)}
for(const file of ['public','data/rendered-pages','data/leak-first-rendered','rendered'].flatMap(d=>walk(path.join(root,d))).filter(f=>f.endsWith('.html'))){
 const before=fs.readFileSync(file,'utf8');let route=fileRoutes.get(file);
 if(!route){const rel=path.relative(root,file).replace(/^public\/(?:__static-pages|rendered-pages|site-pages)\/|^data\/rendered-pages\/|^rendered\/pages\/|^public\//,'');route='/'+rel.replace(/\.html$/,'').replace(/__/g,'/').replace(/\/index$/,'');if(['/index','/home','/root'].includes(route))route='/'}
 const next=transform(before,route);if(next!==before){fs.writeFileSync(file,next);changed++}
}
for(const rel of ['data/site-pages.json','data/pages.generated.json','data/routes.generated.json']){const file=path.join(root,rel);if(!fs.existsSync(file))continue;const raw=JSON.parse(fs.readFileSync(file,'utf8'));let touched=false;
 const visit=(obj,route)=>{if(!obj||typeof obj!=='object')return;for(const [k,v] of Object.entries(obj)){const nextRoute=obj.route||obj.path||(k.startsWith('/')?k:route);if(k==='html'&&typeof v==='string'){const next=transform(v,nextRoute||'/');if(next!==v){obj[k]=next;touched=true}}else if(k.startsWith('/')&&typeof v==='string'&&v.includes('<')){const next=transform(v,k);if(next!==v){obj[k]=next;touched=true}}else if(typeof v==='object')visit(v,nextRoute)}};visit(raw,null);if(touched){fs.writeFileSync(file,JSON.stringify(raw,null,2)+'\n');changed++}
}
for(const file of walk(path.join(root,'public')).filter(f=>f.endsWith('.css'))){const before=fs.readFileSync(file,'utf8');if(before.includes('data-rr-former-h1'))continue;const next=before.replace(/([^{}]+)(\{|$)/g,(all,s,brace)=>brace?s.replace(/(?<![.#\w-])h1(?![\w-])/gi,':is(h1,h2:where([data-rr-former-h1]))')+brace:all);if(next!==before){fs.writeFileSync(file,next);changed++}}
console.log(`Finalized headings and canonical markup in ${changed} files`);
