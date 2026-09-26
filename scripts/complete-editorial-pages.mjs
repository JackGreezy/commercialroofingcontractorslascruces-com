import fs from 'node:fs';import path from 'node:path';
const plans=JSON.parse(fs.readFileSync('data/audited-editorial-pages.json','utf8'));
function update(s,route=''){
 if(typeof s!=='string'||!s.includes('<'))return s;
 const canonical=s.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)/i)?.[1];
 const match=plans.find(p=>route===p.route||(canonical&&new URL(canonical,'https://example.com').pathname.replace(/\/$/,'')===p.route)||(p.promote&&(s.includes(p.promote.text)||s.includes(p.promote.text.replaceAll('&amp;','&')))));if(!match)return s;
 for(const tag of ['div','h2','h3'])s=s.replaceAll(`h1[data-audited-primary-heading=${tag}]{`,`:where(h1[data-audited-primary-heading=${tag}]){`);
 for(const [a,b]of match.replace||[])s=a==='Skiato'?s.replace(/\bSkiato(?:okok)+\b|\bSkiato\b/g,b):s.split(a).join(b);
 if(match.h1)s=s.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i,`$1${match.h1}$2`);
 if(match.promote&&!/<h1\b/i.test(s)){
  const {tag,text}=match.promote;const escaped=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replaceAll('&amp;','(?:&amp;|&)');const re=new RegExp(`<${tag}\\b([^>]*)>${escaped}<\\/${tag}>`,'i');
  s=s.replace(re,(_,attrs)=>`<h1 data-audited-primary-heading="${tag}"${attrs}>${text}</h1>`);
  if(!s.includes('id="audited-primary-heading-css"'))s=s.replace(/<\/head>/i,`<style id="audited-primary-heading-css">:where(h1[data-audited-primary-heading=div]){font-size:inherit;font-weight:inherit;margin:0}:where(h1[data-audited-primary-heading=h2]){font-size:1.5em;margin-block:.83em}:where(h1[data-audited-primary-heading=h3]){font-size:1.17em;margin-block:1em}</style></head>`);
 }
 if(match.addHeading&&!/<h1\b/i.test(s)){
  const heading=`<h1 class="audited-page-heading" style="font-family:inherit;font-size:clamp(28px,5vw,44px);line-height:1.15;margin:24px 0">${match.addHeading}</h1>`;
  if(/<main\b/i.test(s))s=s.replace(/(<main\b[^>]*>)/i,'$1'+heading);
  else if(/<form\b/i.test(s))s=s.replace(/(<form\b)/i,heading+'$1');
 }
 return s;
}
function walk(d){return fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[]}
let changed=0;
for(const f of ['public','rendered','data'].flatMap(walk).filter(f=>f.endsWith('.html'))){let before=fs.readFileSync(f,'utf8');const route='/'+f.replace(/^(?:public\/(?:__static-pages\/|site-pages\/|rendered-pages\/)?|rendered\/pages\/|data\/rendered-pages\/|data\/audit-recovered-pages\/)/,'').replace(/\.html$/,'').replace(/__/g,'/');const after=update(before,route);if(after!==before){fs.writeFileSync(f,after);changed++}}
for(const f of ['data/site-pages.json','data/pages.generated.json','data/leak-first-funnel.json']){if(!fs.existsSync(f))continue;const data=JSON.parse(fs.readFileSync(f,'utf8'));let touched=false;function visit(o,route=''){if(!o||typeof o!=='object')return;for(const[k,v]of Object.entries(o)){const r=o.route||o.path||(k.startsWith('/')?k:route);if(typeof v==='string'&&v.includes('<')){const next=update(v,r);if(next!==v){o[k]=next;touched=true}}else if(typeof v==='object')visit(v,r)}}visit(data);if(touched){fs.writeFileSync(f,JSON.stringify(data,null,2)+'\n');changed++}}
console.log('Completed editorial markup in',changed,'files');
