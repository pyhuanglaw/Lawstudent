// CC #14（BB 10:01）：BUG-DELAY-RETAKE-SKIP-1102——延畢大五上，畢業後篇跳日期（PG.advance）要停在重修課前
// 用法：WT=<受測資料夾> node n14_delay_retake.js     （修改前 5b40dad61：A1 FAIL；修改後 5506d6259：全 PASS）
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ if(f==='src/y5s1_3d.js'&&typeof Y5!=='undefined') continue; load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
GM.caption=()=>{}; GM.toast=()=>{};
const D=k=>PG.DK(k), now=()=>H.G.day*24+H.G.hour, lbl=t=>{ const d=Math.floor(t/24), h=t-d*24, x=CALENDAR.dateOf(d); return x.key+'('+'日一二三四五六'[x.wd%7]+') '+String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0'); };
const base=()=>{ const G=H.fresh('2029-09-02',22,'dorm',{FAIL_DELAY:true,FAIL_DELAY_V:2,FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY_DAY:D('2029-06-26'),Y5_DAYS:'study',BAR_REG:false,
  GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',PACKED_Y4:D('2029-06-01')}); PG.rec(G).done.grad=1; return G; };
const run=async(attend,lab)=>{ const G=base(); const stops=[]; let went=0, guard=0; const end=D('2029-12-27')*24+12;
  while(now()<end&&guard++<300){ const t0=now(); let ok=false; try{ ok=await PG.advance(GM); }catch(e){ stops.push({t:now(),why:'例外 '+e.message}); break; }
    const open=(Y5.classItems(G)||[]).filter(it=>it.fd&&Y5.status(G,it)==='open'); const opts=(Y5.homeOpts?Y5.homeOpts(G):[]).map(o=>o.t);
    stops.push({t:now(),open:open.map(it=>it.c.name+' '+it.t0),opts});
    if(attend&&open.length){ const r=await Y5.attend(GM,open[0]); if(r!==false){ went++; } }
    if(!ok||now()<=t0+1e-6) PG.setT(G,H.E,G.day,G.hour+0.25); }
  console.log('== '+lab+'：停點 '+stops.length+' 個'); stops.slice(0,14).forEach(s=>console.log('   '+lbl(s.t)+(s.open&&s.open.length?'  有課可上：'+s.open.join('、'):'')+(s.why?'  '+s.why:'')+(s.opts&&s.opts.length?'  選單：'+s.opts.join('｜'):'')));
  return {G,stops,went}; };
(async()=>{
  const A=await run(true,'A 照停點去上課');
  const first=A.stops[0];
  check('A1. 9/2 22:00 跳日期，第一個停點＝2029-09-05（三）08:25（重修課前 45 分）',!!first&&lbl(first.t)==='2029-09-05(三) 08:25',first&&lbl(first.t));
  check('A2. 那個停點有重修課可上（Y5.classItems open），家裡選單有「直接去上課：…」',!!first&&first.open.length>0&&first.opts.some(t=>/直接去上課/.test(t)),J(first));
  const thirdIdx=(()=>{ let n=0; for(let i=0;i<A.stops.length;i++){ if(A.stops[i].open&&A.stops[i].open.length) n++; if(n===3) return i; } return -1; })();
  const after=thirdIdx<0?[]:A.stops.slice(thirdIdx+1).filter(s=>s.open&&s.open.length);
  check('A3. 上滿三堂（實際 '+A.went+'）以後不再停在重修課',A.went>=3&&FD.attended(A.G,'maritime')>=3&&after.length===0,J({went:A.went,att:FD.attended(A.G,'maritime'),after:after.map(s=>lbl(s.t))}));
  check('A4. 12/24 以後：FAIL_DELAY_PASS true、沒有 FAIL_DELAY_CERT（證書照常）',A.G.flags.FAIL_DELAY_PASS===true&&!A.G.flags.FAIL_DELAY_CERT,J({pass:A.G.flags.FAIL_DELAY_PASS,cert:A.G.flags.FAIL_DELAY_CERT}));
  const B=await run(false,'B 不去上課（對照）');
  check('B1. 不去上課：12/24 以後 FAIL_DELAY_PASS false、FAIL_DELAY_CERT＝2030-06',B.G.flags.FAIL_DELAY_PASS===false&&B.G.flags.FAIL_DELAY_CERT==='2030-06',J({pass:B.G.flags.FAIL_DELAY_PASS,cert:B.G.flags.FAIL_DELAY_CERT,att:FD.attended(B.G,'maritime')}));
  H.done();
})();
