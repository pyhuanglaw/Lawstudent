// CC #14（BB 10:01）：BUG-DELAY-RETAKE-SKIP-1102——延畢大五上，畢業後篇跳日期（PG.advance）要停在重修課前
// 用法：WT=<受測資料夾> [FD_COURSE=<課 id>] node n14_delay_retake.js     （修改前 5b40dad61：A1 FAIL；修改後 5506d6259：全 PASS）
// FD_COURSE：延畢那一門（FAIL_DELAY_COURSES，預設 enforcement＝D124 定版 690ac5f4d 起；maritime＝舊規則）。BB 10:48 D124：海商法改成選修、被當不延畢以後，
//   延畢的課應改用「前面學期被當、重修排到大四下又沒過」的那門重修課（例如大四上的 enforcement 強制執行法），或日本路線的補修（civpro_2_re、insurance_re）。
//   A1/A2 的期望時間（2029-09-05（三）08:25）是照海商法週三上午寫的；換成別的課，Y5.classItems 的時段照那門課，期望要照下面印出的「重修課全部 N 堂」看。
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ if(f==='src/y5s1_3d.js'&&typeof Y5!=='undefined') continue; load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
GM.caption=()=>{}; GM.toast=()=>{};
const D=k=>PG.DK(k), now=()=>H.G.day*24+H.G.hour, lbl=t=>{ const d=Math.floor(t/24), h=t-d*24, x=CALENDAR.dateOf(d); return x.key+'('+'日一二三四五六'[x.wd%7]+') '+String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0'); };
const FDC=process.env.FD_COURSE||'enforcement';   /* BB 10:57：D124 定版 690ac5f4d 起預設強制執行法（大四上被當→大四下重修沒過）；舊規則＝FD_COURSE=maritime */   /* D124 以後應改用重修課（例如 retake 那門 enforcement）或 JP 補修（civpro_2_re／insurance_re）*/
console.log('FD_COURSE＝'+FDC);
const base=()=>{ const G=H.fresh('2029-09-02',22,'dorm',{FAIL_DELAY:true,FAIL_DELAY_V:2,FAIL_DELAY_COURSES:[FDC],FAIL_DELAY_DAY:D('2029-06-26'),Y5_DAYS:'study',BAR_REG:false,
  GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',PACKED_Y4:D('2029-06-01')}); PG.rec(G).done.grad=1; return G; };
const run=async(attend,lab,k)=>{ const G=base(); const stops=[]; let went=0, guard=0; const end=D('2029-12-27')*24+12;
  while(now()<end&&guard++<300){ const t0=now(); let ok=false; try{ ok=await PG.advance(GM); }catch(e){ stops.push({t:now(),why:'例外 '+e.message}); break; }
    const open=(Y5.classItems(G)||[]).filter(it=>it.fd&&Y5.status(G,it)==='open'); const opts=(Y5.homeOpts?Y5.homeOpts(G):[]).map(o=>o.t);
    stops.push({t:now(),open:open.map(it=>it.c.name+' '+it.t0),opts});
    if(attend&&open.length&&(k==null||went<k)){ const r=await Y5.attend(GM,open[0]); if(r!==false){ went++; } }
    if(!ok||now()<=t0+1e-6) PG.setT(G,H.E,G.day,G.hour+0.25); }
  console.log('== '+lab+'：停點 '+stops.length+' 個'); stops.slice(0,14).forEach(s=>console.log('   '+lbl(s.t)+(s.open&&s.open.length?'  有課可上：'+s.open.join('、'):'')+(s.why?'  '+s.why:'')+(s.opts&&s.opts.length?'  選單：'+s.opts.join('｜'):'')));
  return {G,stops,went}; };
(async()=>{
  const clsOf=()=>{ const G0=base(); const r=CALENDAR.termDays('Y5S1'); const out=[]; for(let d=G0.day;d<=r.to;d++) for(const it of Y5.classItems(G0,d)) if(it.fd&&it.c.id===FDC) out.push(d*24+it.t0-0.75); return out; };
  const exp1=FDC==='maritime'?'2029-09-05(三) 08:25':(()=>{ const c=clsOf(); return c.length?lbl(c[0]):'(沒有排到課)'; })();   /* 別的課：照 Y5.classItems 的第一堂 */
  const A=await run(true,'A 照停點去上課');
  const first=A.stops[0];
  check('A1. 9/2 22:00 跳日期，第一個停點＝'+exp1+'（重修課前 45 分）',!!first&&lbl(first.t)===exp1,first&&lbl(first.t));
  check('A2. 那個停點有重修課可上（Y5.classItems open），家裡選單有「直接去上課：…」',!!first&&first.open.length>0&&first.opts.some(t=>/直接去上課/.test(t)),J(first));
  const thirdIdx=(()=>{ let n=0; for(let i=0;i<A.stops.length;i++){ if(A.stops[i].open&&A.stops[i].open.length) n++; if(n===3) return i; } return -1; })();
  const after=thirdIdx<0?[]:A.stops.slice(thirdIdx+1).filter(s=>s.open&&s.open.length);
  check('A3. 上滿三堂（實際 '+A.went+'）以後不再停在重修課',A.went>=3&&FD.attended(A.G,FDC)>=3&&after.length===0,J({went:A.went,att:FD.attended(A.G,FDC),after:after.map(s=>lbl(s.t))}));
  check('A4. 12/24 以後：FAIL_DELAY_PASS true、沒有 FAIL_DELAY_CERT（證書照常）',A.G.flags.FAIL_DELAY_PASS===true&&!A.G.flags.FAIL_DELAY_CERT,J({pass:A.G.flags.FAIL_DELAY_PASS,cert:A.G.flags.FAIL_DELAY_CERT}));
  const B=await run(false,'B 不去上課（對照）');
  check('B1. 不去上課：12/24 以後 FAIL_DELAY_PASS false、FAIL_DELAY_CERT＝2030-06',B.G.flags.FAIL_DELAY_PASS===false&&B.G.flags.FAIL_DELAY_CERT==='2030-06',J({pass:B.G.flags.FAIL_DELAY_PASS,cert:B.G.flags.FAIL_DELAY_CERT,att:FD.attended(B.G,FDC)}));
  /* BB 10:08（7776c53c8）：上了 k 堂以後就不去——剩下的堂數湊不到三堂以後就不能再停；每個停點都要「已上＋剩下（含這一堂）≥3」*/
  { const G0=base(); const r=CALENDAR.termDays('Y5S1'); const cls=[]; for(let d=G0.day;d<=r.to;d++) for(const it of Y5.classItems(G0,d)) if(it.fd&&it.c.id===FDC) cls.push(d*24+it.t0-0.75);
    console.log('重修課全部 '+cls.length+' 堂：'+cls.map(lbl).join('、'));
    for(const k of [0,1,2]){ const R=await run(true,'C'+k+' 上了 '+k+' 堂以後不去',k); const cs=R.stops.filter(s=>s.open&&s.open.length).map(s=>s.t);
      const exp=[]; for(let j=0;j<cls.length;j++){ const att=Math.min(j,k); if(att>=3) break; if(j<k||att+(cls.length-j)>=3) exp.push(cls[j]); else break; }
      check('C'+k+'. 上 '+k+' 堂後不去：重修停點＝前 '+k+' 堂＋之後到「已上＋剩下 ≥3」的最後一堂為止（期望 '+exp.length+' 個，最後 '+(exp.length?lbl(exp[exp.length-1]):'-')+'）',J(cs.map(lbl))===J(exp.map(lbl)),J({got:cs.map(lbl),exp:exp.map(lbl)}));
      check('C'+k+'b. 12/24 以後證書延到 2030-06',R.G.flags.FAIL_DELAY_CERT==='2030-06',J(R.G.flags.FAIL_DELAY_CERT)); } }
  H.done();
})();
