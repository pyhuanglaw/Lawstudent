// BB-B 10-25：AA_456／457 瀏覽器情境（zrlast_probe R38）用的日期，照遊戲資料算、不猜。用法：node docs/story_planning/test_tools/aa456_457_dates.js <開發分支工作樹>
const WT=process.argv[2]; process.chdir(WT);
const H=require(WT+'/tests/pg_harness.js'); const fs=require('fs'), vm=require('vm'), path=require('path');
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(NOODLE_CLOSED|HOLFF|MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|FEST|FEST_DATA|FEST_EVENTS)$/;
for(const f of ['src/noodle_closed3d.js','src/holff3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/data/fest_events.js','src/fest3d.js']){
  const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) continue; let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); try{ vm.runInThisContext(s,{filename:f}); }catch(e){ console.log('載入失敗',f,e.message); } }
const {GM,E}=H; GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key;
const out={};
for(const y of ['2026','2027','2028','2029']){ const W=NOODLE_CLOSED.window(D(NOODLE_CLOSED.CNY[y])); out['noodle_'+y]={from:K(W.from),to:K(W.to),open:K(W.open)}; }
for(const yk of ['Y2','Y3','Y4']){ const d=VAC.c01Day(yk); out['c01_'+yk]={day:K(d),ask:K(VAC.c01Ask(d))}; }
for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1']){ const w=TERMEND.windowOf(t); out['te_'+t]=w?{from:K(w.from),to:K(w.to)}:null; }
/* 以安交往中、大二上：照單元測試的走法找 gfDay */
const T=(d,h)=>d*24+h, run=(h0,h1)=>{ for(let h=h0;h<=h1+1e-9;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
for(const [id,t] of [['heroine_01','Y2S1'],['heroine_03','Y2S2']]){ const w=TERMEND.windowOf(t); const G=H.fresh(K(w.from),20,'dorm',{['dating_'+id]:true}); G.outings=[]; G.acts={att:{}}; PHONE.rec(G); H.CLOSE(id); run(20,21);
  const gd=((G.termend&&G.termend[t]||{}).gfDay||{})[id]; out['gf_'+id+'_'+t]={gfDay:K(gd)}; }
console.log(JSON.stringify(out,null,1));
