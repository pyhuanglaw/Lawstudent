// BB-B 10-25：AA_458 瀏覽器情境（zrlast_probe R39）用的日期與句子，照遊戲資料算。用法：node docs/story_planning/test_tools/aa458_dates.js <開發分支工作樹>
const WT=process.argv[2]; process.chdir(WT);
require(WT+'/tests/alison.js'); const H=require(WT+'/tests/pg_harness.js'); const fs=require('fs'), vm=require('vm'), path=require('path');
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
for(const f of ['src/data/bbpack_events.js','src/bbpack3d.js','src/family_xmas3d.js','src/sis_grad3d.js']){ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
const {GM}=H; GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, wd=d=>CALENDAR.dateOf(d).wd%7;
const NEW={LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW};
const fresh=(k,h,fl)=>{ const G=H.fresh(k,h,'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},fl||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); return G; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const hr=()=>{ HOME.phoneRules(GM); PHONE.tick(H.G); };
const out={};
fresh('2025-09-01',8,NEW); for(const k of ['2025-09-04','2025-09-11','2025-09-18','2025-10-02']){ const d=D(k); at(d,20.05); hr(); const m=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='home_ask_'+d); out['mom_'+k]=m?[m.text,m.ask.k,(+m.h).toFixed(2)]:null; at(d,23.5); hr(); }
/* 中秋 10/6、颱風假前一晚 */
const fam=()=>(H.G.msgs||[]).filter(m=>m.th==='g:home').map(m=>[K(m.day),(+m.h).toFixed(2),m.from,m.text,m.tag]);
fresh('2025-10-06',17.9,NEW); for(let h=17.9;h<=21.3;h+=0.05){ H.G.hour=+h.toFixed(3); hr(); } out.moon=fam().filter(x=>x[0]==='2025-10-06');
const ty=(typeof CALENDAR!=='undefined'&&CALENDAR.TYPHOON)||null; out.typhoonData=ty?JSON.stringify(ty).slice(0,300):null;
fresh('2025-10-12',20.5,NEW); for(let h=20.5;h<=21.3;h+=0.05){ H.G.hour=+h.toFixed(3); hr(); } out.ty1012=fam().filter(x=>x[0]==='2025-10-12');
out.D5=BBPACK.D5_LINES||null;
console.log(JSON.stringify(out,null,1));
