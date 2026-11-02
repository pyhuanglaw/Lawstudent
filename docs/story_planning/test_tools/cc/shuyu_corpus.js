// 所有 src 的字串字面值（含「學姊」）在交往中經 shuyuT 以後有沒有重複字；另外跑 STORY_EVENTS 的 title／titleCard（真的會經過 shuyuT）
'use strict'; const path=require('path'),fs=require('fs'); const WT=path.resolve(process.argv[2]); const H=require(path.join(WT,'tests/pg_harness.js'));
const G=H.fresh('2026-10-14',12,'campus'); H.CLOSE('heroine_05'); G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; ROM.get(G,'heroine_05').status='dating';
const DUP=/林林|溫溫|學姊學姊|書瑀溫?書瑀|溫書瑀溫書瑀/; let n=0; const hits=[];
const walk=d=>{ for(const f of fs.readdirSync(d)){ const p=path.join(d,f); if(fs.statSync(p).isDirectory()) walk(p); else if(/\.js$/.test(f)){ const L=fs.readFileSync(p,'utf8').split('\n'); L.forEach((l,i)=>{ for(const m of l.matchAll(/'([^'\n]*學姊[^'\n]*)'|"([^"\n]*學姊[^"\n]*)"/g)){ const s=m[1]||m[2]; n++; const o=SOCIAL.shuyuT(s); if(DUP.test(o)&&!DUP.test(s)) hits.push(path.relative(WT,p)+':'+(i+1)+'　'+s.slice(0,60)+' → '+o.slice(0,60)); } }); } } };
walk(path.join(WT,'src'));
let ev=0; const evh=[]; const seen=new Set(); const scan=(o,p)=>{ if(!o||typeof o!=='object'||seen.has(o)) return; seen.add(o); for(const k of Object.keys(o)){ const v=o[k]; if((k==='title'||k==='titleCard')&&typeof v==='string'){ ev++; const r=SOCIAL.shuyuT(v); if(DUP.test(r)) evh.push(p+'.'+k+'　'+v+' → '+r); } else if(typeof v==='object') scan(v,p+'.'+k); } };
for(const g of ['STORY_EVENTS','STORY_EVENTS_V11','OUT','HOME','VAC','INVITE_DATA']) if(global[g]) scan(global[g],g);
console.log('字面值',n,'重複',hits.length); hits.forEach(h=>console.log('LIT',h)); console.log('title/titleCard',ev,'重複',evh.length); evh.forEach(h=>console.log('EV',h)); process.exit(0);
