const DOMAIN = 'commercialroofingcontractorslascruces.com';
const escape = s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
export function normalizePublicDocument(html, route='/') {
 if(typeof html!=='string')return html;
 let seen=0;
 html=html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi,(all,attrs,content)=>++seen===1?all:`<h2 data-rr-former-h1="true"${attrs}>${content}</h2>`);
 const css=c=>c.includes(':is(h1,h2:where([data-rr-former-h1]))')?c:c.replace(/([^{}]+)(\{|$)/g,(all,selector,brace)=>brace?selector.replace(/(?<![.#\w-])h1(?![\w-])/gi,':is(h1,h2:where([data-rr-former-h1]))')+brace:all);
 html=html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi,(_,attrs,c)=>`<style${attrs}>${css(c)}</style>`);
 if(seen>1&&!html.includes('id="rr-heading-defaults"'))html=html.replace(/<head([^>]*)>/i,'<head$1><style id="rr-heading-defaults">h2:where([data-rr-former-h1]){display:block;font-size:2em;margin-block:0.67em;font-weight:bold}</style>');
 let canonical=0;
 html=html.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,tag=>++canonical===1?tag:'');
 if(!canonical&&/<\/head>/i.test(html)&&route!=='/404')html=html.replace(/<\/head>/i,`<link rel="canonical" href="${escape('https://'+DOMAIN+(route==='/'?'/':route))}">\n</head>`);
 return html;
}
