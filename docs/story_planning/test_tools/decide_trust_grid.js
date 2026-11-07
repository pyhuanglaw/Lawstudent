// BB-B：決定拍信任門檻在 Node 重算（86f0c924f）。stub SOCIAL.rel、DATE.stageNum（公式照 src/date3d.js 48–50 行）。
const fs=require('fs'),vm=require('vm'),root=process.argv[2];
const ld=(f,n)=>{let s=fs.readFileSync(root+'/'+f,'utf8'); s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f});};
let REL={};
globalThis.SOCIAL={rel:id=>REL};
globalThis.DATE={stageNum:id=>{ const r=REL,n=v=>+v||0; const fr=n(r.fam)>=60&&n(r.trust)>=45&&n(r.comf)>=40?4:(n(r.fam)>=40&&n(r.trust)>=25?3:(n(r.fam)>=20?2:1)); if(fr>=4&&n(r.npcRom)>=55&&n(r.rom)>=30) return 6; if(fr>=3&&n(r.npcRom)>=30) return 5; return fr; }};
ld('src/data/decide_rules.js','DECIDE_RULES'); ld('src/data/heroine_arcs.js','HEROINE_ARCS'); ld('src/decide3d.js','DECIDE');
const G={day:100,flags:{}};
const cases=[];
for(const fam of [40,60,100]) for(const trust of [25,29,30,39,40,45,50,59,60,70,90]) for(const comf of [20,40,60]) for(const npcRom of [0,30,55]) for(const rom of [0,30]) cases.push({fam,trust,comf,npcRom,rom});
const out={};
for(const e of DECIDE_RULES.keys){ const b=HEROINE_ARCS.people[e.who].beats.find(x=>x.n===e.beat); const need=b.need|0; const res={hi:0,lo:0,examples:{}};
  for(const c of cases){ REL=c; if(DATE.stageNum()<need) continue; const hi=DECIDE.trustHi(G,e.who); res[hi?'hi':'lo']++; const key=(hi?'hi':'lo'); if(!res.examples[key]) res.examples[key]=JSON.stringify(c)+' st'+DATE.stageNum(); }
  // push 的選項：hi／lo 各自的結果
  const pushes=e.opts.filter(o=>/^push:/.test(o.stance)); const pr=[];
  for(const o of pushes){ for(const t of ['hi','lo']){ const r=e.rules.find(x=>x.stance===o.stance&&(x.trust==='any'||x.trust===t)&&(x.opt==null||x.opt===o.i)); pr.push(`${o.stance}/${t}→${r?r.result:e.default}`); } }
  out[e.id]={need,hi:res.hi,lo:res.lo,exHi:res.examples.hi,exLo:res.examples.lo,push:pr.join(' ')};
}
for(const [k,v] of Object.entries(out)) console.log(k.padEnd(6),'need',v.need,'hi',String(v.hi).padStart(3),'lo',String(v.lo).padStart(3),'|',v.push,'\n    lo例',v.exLo||'—','\n    hi例',v.exHi||'—');
