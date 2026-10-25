// HUD 第二行（#nextClass）人在美國、日本照當地課表（BB-B 2026-10-25 R2／NO 12/8 08:07：第一行「今天的課：09:00 Legal Writing」、第二行卻是「今天沒有課」；v9.10.9 就有）——不需要瀏覽器。
//   classes3d.js 的 S.updateHUD 用臺灣的 S.dayItems／S.next 算；us_life3d.js、jp3d.js 沒有包它。修法：兩邊各包 CLS.updateHUD。用法：node tests/us_jp_nextclass_unit.js
// 修改前：1、2 FAIL。
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }

/* #nextClass 的假元素（pg_harness 的 document.getElementById 回 null）*/
const NC={dataset:{},textContent:'',cl:new Set(),get classList(){ const s=this.cl; return {add:c=>s.add(c),remove:c=>s.delete(c)}; }};
document.getElementById=id=>id==='nextClass'?NC:null;
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
GM.caption=()=>{}; GM.toast=()=>{};
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,flags)=>{ const G=H.fresh(key,h,'us_apartment',US(flags)); G.weekday=wdOf(G.day); return G; };
const hud=()=>{ GM.titleIdle=false; CLS.updateHUD(GM); return NC.textContent; };
(async()=>{
  /* 2028-12-08（五）08:07：美國有 09:00 Legal Writing（BB-B 10-25 截到的那一刻）*/
  let G=fresh('2028-12-08',8.1); const it=USL.items(G);
  check('0. 12/8（五）美國有課（Legal Writing）',it.length>0&&it.some(x=>/Legal Writing/.test(x.c.name)),JSON.stringify(it.map(x=>x.c.name)));
  const t1=hud();
  check('1. 人在美國、有課的日子：HUD 第二行照美國課表（「下一堂 09:00 Legal Writing…」或「現在可以上課：」），不是「今天沒有課」',/Legal Writing/.test(t1)&&!/今天沒有課/.test(t1),t1);
  G.hour=23; const t2=hud();
  check('2. 美國那天的課都過了：「今天的課都結束了」',t2==='今天的課都結束了',t2);
  G=fresh('2028-12-09',10); const t3=hud();
  check('3. 美國週六（沒課）：「今天沒有課」',t3==='今天沒有課',t3);
  /* 臺灣照舊（不在美國）*/
  const G4=H.fresh('2026-10-05',8.5,'dorm',{}); G4.weekday=wdOf(G4.day); GM.titleIdle=false; const t4=hud();
  check('4. 不在美國：照原本臺灣課表（classes3d.js），字照舊',typeof t4==='string'&&t4.length>0,t4);
  H.done();
})();
