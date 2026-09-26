import config from '../data/fleet-runtime-repairs.json' with {type:'json'};
export function repairFleetRuntime(html){
 if(!html)return html;
 html=html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi,(tag,source)=>{
  let p;try{p=new URL(source,'https://'+config.domain).pathname}catch{return tag}
  if(config.dropScripts?.includes(p))return '';
  const target=config.scriptRemaps?.[p];if(target)return tag.replace(source,target);
  return tag;
 });
 for(const r of config.replacements||[])html=html.split(r.from).join(r.to);
 return html;
}
