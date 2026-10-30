// BUG-US-WKND-EMPTYSTOP-1025（BB-B BB_218 R36 附註③，2026-10-25）：美國交換、和學姊交往中，快轉（「到下一個有事的日子」）週末 14:00 的停點——不需要瀏覽器。
//   原本（us_life3d.js S.nextStop）交往中、US2 以後每個週六、日 14:00 都停；週六去過 208 的週日、沒有該演的那一場的週末（10/7～8、11/4）、七場都演完以後，停下來什麼都沒有。
//   改成只停在她那天 14:00 真的會傳 208 私訊的時候（us208_3d.js US208.stopAt，和 S.dmPhone 共用同一個判斷）：
//     有該演的那一場（US208.due）、這個週末還沒演，而且是這個週末的第一則、或週六回了「今天不行。」的週日。
//   用實際的快轉停點算：USL.nextStop（照 index.html 的順序，us_blank3d.js、sis_qixi3d.js 也包了一層）、USL.ffOpts、USL.jump。
// 修改前（開發分支 661423a71）：15 項 FAIL——「空停」那幾項（週六沒回的週日、去過的週日、週六自己走進去演過的週日、10/7～8、11/4、七場演完、3-7 演完、一路快轉停在 10/7～8 什麼都沒有），
//   和「不是美國路線／已經回臺灣」的 USL.nextStop 兩項（原本會算週末 14:00，只是美國的快轉選單沒有、玩家碰不到）；「該停的照停」「照舊不停」「快轉選單照舊沒有」修改前就通過。
// 第 7 節（同一個 bug 的第二個 commit，LAWWW-B 追加）：us_life3d.js FIXED 的 10/16 21:00 原本不看條件都停；改成學姊「改過的報告拿了 A。」那一則的條件
//   （r2y4a3d.js R2Y4A.us2GradeOn：交往中、US2 是 there 或 missed），或那時「大四要怎麼過？」要再問一次（STORY.y4Path2Due）。修改前「不該停的不停」那幾項 FAIL。
// 2026-10-30 AA_539 5-2 第 6 點（208 私訊每一句最多傳一次）：第 2 節最後一項的期待從 9/23 改成 9/30（見那一項的註解）。
//   用法：node tests/us_wknd_stop_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY|SISQX|SISQX_LINES|SISQX_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
/* 照 index.html 的順序：us208_3d.js 在 us_life3d.js 之後；us_blank3d.js、sis_qixi3d.js 都包 USL.nextStop */
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js','src/data/sis_qixi_events.js','src/sis_qixi3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
GM.caption=()=>{}; GM.toast=()=>{}; GM.studySession=async()=>{};
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
GM.sitAt=(P,s)=>{ P.seat=s; }; GM.standUp=P=>{ P.seat=null; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'us_apartment',US(flags)); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G); E.player.busy=false; E.paused=false; E.player.seat=null; ADV.active=false;
  SOCIAL.remember(S5,'FIRST_MET',''); PHONE.join(G,'us_exchange','交換生'); return G; };
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating'; };
const w208=(key,h,zone,flags)=>{ const G=fresh(key,h,zone||'us_apartment',Object.assign({US2:'there'},flags||{})); dateSis(); return G; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const EVN={'3-1':'ev_us208_memo','3-2':'ev_us208_lurou','3-3':'ev_us208_clipping','3-4':'ev_us208_rehearsal','3-5':'ev_us208_extra_hour','3-6':'ev_us208_plant','3-7':'ev_us208_lastweek'};
const doneUpTo=(...ns)=>{ for(const n of ns) H.G.events.done[EVN[n]]=1; };
const lab=t=>t==null?'null':CALENDAR.dateOf(Math.floor(t/24)).key+' '+(+(t-Math.floor(t/24)*24).toFixed(2));
const nowT=()=>T(H.G.day,H.G.hour);
const ns=t0=>USL.nextStop(H.G,t0!=null?t0:nowT());
/* 從 t0 到 t1 所有的停點（存檔不動：一個接一個問 nextStop）；wk14＝落在週六、日 14:00 的 */
const stopsIn=(t0,t1)=>{ const out=[]; let t=t0; for(let i=0;i<400;i++){ const x=USL.nextStop(H.G,t); if(x==null||x>t1) break; out.push(x); t=x; } return out; };
const wk14=L=>L.filter(x=>{ const d=Math.floor(x/24), w=wdOf(d); return (w===6||w===0)&&Math.abs(x-T(d,14))<1e-6; });
const stop=()=>lab(nowT());

(async()=>{
await sec(0,()=>{
  check('0. 美國篇的檔案（含 us208_3d.js、us_blank3d.js、sis_qixi3d.js）都載得到',!loadErr.length&&typeof US208!=='undefined'&&typeof USL!=='undefined'&&typeof USL.nextStop==='function',loadErr.join('；'));
  check('0. 日子對：2028-09-16 週六、09-17 週日、10-07 週六、11-04 週六、11-05 週日',wdOf(D('2028-09-16'))===6&&wdOf(D('2028-09-17'))===0&&wdOf(D('2028-10-07'))===6&&wdOf(D('2028-11-04'))===6&&wdOf(D('2028-11-05'))===0);
});

/* ======================= 1. 該演的週六（還沒演）14:00 會停 ======================= */
await sec(1,async()=>{
  w208('2028-09-15',12,'us_apartment');
  check('1. 9/15（五）12:00：下一個停點＝9/16（六）14:00（3-1 該演、這個週末還沒傳）',ns()===T(D('2028-09-16'),14),lab(ns()));
  { const o=USL.ffOpts(H.G); check('1. 床的快轉「到下一個有事的日子」：跳到 9/16（六）14:00',!!o&&o[0].to===T(D('2028-09-16'),14)&&/9\/16（六）14:00/.test(o[0].hint),J(o&&o[0])); }
  const why=await USL.jump(GM,T(D('2028-09-18'),9)); const m=byTag('us208_dm_0916');
  check('1. 一路快轉：停在 9/16（六）14:00，她傳 3-1 那一句、要回（快轉停在要回的訊息）',why==='msg'&&stop()==='2028-09-16 14'&&m.length===1&&m[0].text===US208.SCENES[0].dm,J({why,at:stop(),m:m.map(x=>x.text)}));
  check('1. 傳了以後：同一天 14:00 不再是停點（下一個不是 9/16 14:00）',ns()!==T(D('2028-09-16'),14),lab(ns()));
});

/* ======================= 2. 週六回「今天不行。」以後，週日 14:00 再停一次 ======================= */
await sec(2,async()=>{
  const G=w208('2028-09-16',13.9,'us_apartment'); at('2028-09-16',14); rules();
  check('2. 週六 14:00 傳了、還沒回：週日 9/17 14:00 還不是停點（沒回＝週日不傳）',wk14(stopsIn(nowT(),T(D('2028-09-17'),23))).length===0,J(stopsIn(nowT(),T(D('2028-09-17'),23)).map(lab)));
  PHONE.answer(G,'us208_ask_0916',1); rules(); at('2028-09-16',15);
  check('2. 回「今天不行。」以後：下一個停點＝9/17（日）14:00',ns()===T(D('2028-09-17'),14),lab(ns()));
  const why=await USL.jump(GM,T(D('2028-09-18'),9)); const m=byTag('us208_dm_0917');
  check('2. 一路快轉：停在 9/17（日）14:00「'+US208.DM_SUN+'」',why==='msg'&&stop()==='2028-09-17 14'&&m.length===1&&m[0].text===US208.DM_SUN,J({why,at:stop(),m:m.map(x=>x.text)}));
  PHONE.answer(G,'us208_ask_0917',1); rules(); at('2028-09-17',15);
  /* 2026-10-30 AA_539 5-2 第 6 點（企劃線 90d0a41d0）：208 的私訊每一句最多傳一次——3-1 的第二句「今天也在 208。」9/17 已經傳過（週日那一句），9/23～24 不再傳、不停；
     下一個停點＝9/30（六）14:00 3-2 的第一句（原本期待 9/23；us_life3d.js nextStop 也改成往後找到第一個會傳的週末，不只看 7 天）*/
  check('2. 週日也回「今天不行。」：這個週末不再停；9/23～24 也不停（3-1 的句子都傳過了，AA_539 5-2）；下一個 208 的停點是 9/30（六）14:00 3-2',ns()===T(D('2028-09-30'),14)&&US208.stopAt(G,D('2028-09-23'))===false&&US208.stopAt(G,D('2028-09-24'))===false,lab(ns()));
});

/* ======================= 3. 這個週末已經演過（去過的週日）不停 ======================= */
await sec(3,async()=>{
  /* 週六回「我過去。」、出發演 3-1（同 AA_454 的流程：beforeOuting 記 US208_WK）*/
  w208('2028-09-16',16,'us_apartment'); H.G.flags.US208_DM=D('2028-09-16'); H.G.flags.US208_WK=D('2028-09-16'); doneUpTo('3-1');
  check('3. 週六（9/16）去過 208、演了 3-1：週日 9/17 14:00 不是停點；下一個＝9/23（六）14:00（3-2）',ns()===T(D('2028-09-23'),14),lab(ns()));
  { const o=USL.ffOpts(H.G); check('3. 床的快轉「到下一個有事的日子」：跳到 9/23（不是 9/17 14:00 什麼都沒有）',!!o&&o[0].to===T(D('2028-09-23'),14),J(o&&o[0])); }
  const why=await USL.jump(GM,T(D('2028-09-24'),9)); const m=byTag('us208_dm_0923');
  check('3. 一路快轉：不停在 9/17 14:00；停在 9/23（六）14:00 她傳 3-2 那一句',why==='msg'&&stop()==='2028-09-23 14'&&m.length===1&&m[0].text===US208.SCENES[1].dm&&!byTag('us208_dm_0917').length,J({why,at:stop(),m:m.map(x=>x.text)}));
  /* 週六沒傳、自己走進 208 先演了（S.tick 記 US208_WK、S.dmDone）*/
  w208('2028-09-23',16,'us_apartment'); doneUpTo('3-1','3-2'); H.G.flags.US208_WK=D('2028-09-23');
  check('3. 週六自己走進 208 演了 3-2（沒傳私訊）：週日 9/24 14:00 不是停點',wk14(stopsIn(nowT(),T(D('2028-09-24'),23))).length===0,J(stopsIn(nowT(),T(D('2028-09-24'),23)).map(lab)));
});

/* ======================= 4. 沒有該演的那一場的日子不停：10/7～8、11/4 ======================= */
await sec(4,async()=>{
  w208('2028-10-06',9,'us_apartment'); doneUpTo('3-1','3-2');
  { const L=stopsIn(nowT(),T(D('2028-10-08'),23)); check('4. 10/7（六）、10/8（日）：3-2 到 10/1、3-3 從 10/14，沒有該演的＝14:00 都不停',!L.includes(T(D('2028-10-07'),14))&&!L.includes(T(D('2028-10-08'),14)),J(L.map(lab))); }
  { const x=ns(); check('4. 10/6 09:00 的下一個停點不在 10/7～8',x==null||x>T(D('2028-10-08'),24),lab(x)); }
  /* 3-1、3-2 沒演也一樣（過了範圍不補）*/
  w208('2028-10-06',9,'us_apartment');
  { const L=stopsIn(nowT(),T(D('2028-10-08'),23)); check('4. 3-1、3-2 錯過了（沒演、過了範圍不補）：10/7～8 也不停',!L.includes(T(D('2028-10-07'),14))&&!L.includes(T(D('2028-10-08'),14)),J(L.map(lab))); }
  /* 11/4（六）：3-4 到 10/29、3-5 只有 11/5 */
  w208('2028-11-03',9,'us_apartment'); doneUpTo('3-1','3-2','3-3','3-4');
  check('4. 11/3（五）09:00：下一個停點＝11/5（日）14:00（3-5 只有 11/5、是這個週末的第一則），不是 11/4 14:00',ns()===T(D('2028-11-05'),14),lab(ns()));
  let why=null, other=[]; for(let i=0;i<6;i++){ why=await USL.jump(GM,T(D('2028-11-06'),9)); const p=why==='msg'?PHONE.pending(H.G).filter(m=>!/^us208_ask_/.test(m.ask.id)):[]; if(!p.length) break;
    for(const m of p){ other.push(stop()+' '+m.ask.id); PHONE.answer(H.G,m.ask.id,0); } rules(); }   /* 別的要回的訊息（11/3 21:00 芝加哥的邀約）先回掉，再接著快轉 */
  const m=byTag('us208_dm_1105');
  check('4. 一路快轉：不停在 11/4；停在 11/5（日）14:00 她傳 3-5 那一句',why==='msg'&&stop()==='2028-11-05 14'&&m.length===1&&m[0].text===US208.SCENES[4].dm&&!byTag('us208_dm_1104').length,J({why,at:stop(),m:m.map(x=>x.text),other}));
});

/* ======================= 5. 七場都演完以後的週末不停 ======================= */
await sec(5,async()=>{
  w208('2028-09-14',9,'us_apartment'); doneUpTo('3-1','3-2','3-3','3-4','3-5','3-6','3-7');
  const L=stopsIn(nowT(),T(D('2028-12-15'),23)), W=wk14(L);
  check('5. 七場都演完（9/14～12/15）：沒有任何週六、日 14:00 的停點',W.length===0,J(W.map(lab)));
  check('5. 其他停點照舊（例：10/16 21:00、12/2 18:00、12/8 08:00）',L.includes(T(D('2028-10-16'),21))&&L.includes(T(D('2028-12-02'),18))&&L.includes(T(D('2028-12-08'),8)),J(L.map(lab)));
  /* 12/9～12/10（3-7）演完以後：期末的週末不停 */
  w208('2028-12-08',12,'us_apartment'); doneUpTo('3-6','3-7');
  { const L2=stopsIn(nowT(),T(D('2028-12-15'),23)); check('5. 3-7 演完：12/9、12/10 14:00 不停',!L2.includes(T(D('2028-12-09'),14))&&!L2.includes(T(D('2028-12-10'),14)),J(L2.map(lab))); }
});

/* ======================= 6. 不是交往中、不在美國、她不在的週末：照舊不停 ======================= */
await sec(6,async()=>{
  fresh('2028-09-14',9,'us_apartment',{US2:'there'});
  { const W=wk14(stopsIn(nowT(),T(D('2028-12-15'),23))); check('6. 挽回中（沒在交往）：週末 14:00 照舊不停',W.length===0,J(W.map(lab))); }
  w208('2028-09-09',9,'us_apartment',{US2:null}); delete H.G.flags.US2;
  check('6. US2（9/13）以前：9/9、9/10 14:00 照舊不停',!stopsIn(nowT(),T(D('2028-09-10'),23)).some(x=>x===T(D('2028-09-09'),14)||x===T(D('2028-09-10'),14)),J(stopsIn(nowT(),T(D('2028-09-10'),23)).map(lab)));
  w208('2028-11-10',9,'us_apartment'); doneUpTo('3-1','3-2','3-3','3-4','3-5');
  { const L=stopsIn(nowT(),T(D('2028-11-12'),23)); check('6. 她在芝加哥（11/11～12）：照舊不停',!L.includes(T(D('2028-11-11'),14))&&!L.includes(T(D('2028-11-12'),14)),J(L.map(lab))); }
  w208('2028-09-15',12,'us_apartment',{EXCHANGE_ROUTE:'TW'});
  check('6. 不是美國路線：美國的快轉選單照舊沒有（USL.ffOpts＝null：玩家碰不到美國的停點）',USL.ffOpts(H.G)===null);
  check('6. 不是美國路線：USL.nextStop 也不算週末 14:00（原本會算，只是選單沒有、玩家碰不到；現在照 US208.due 的「美國路線」）',wk14(stopsIn(nowT(),T(D('2028-09-17'),23))).length===0,J(stopsIn(nowT(),T(D('2028-09-17'),23)).map(lab)));
  w208('2028-09-15',12,'us_apartment',{US_RETURNED:D('2028-09-01')});
  check('6. 已經回臺灣（US_RETURNED）：美國的快轉選單照舊沒有',USL.ffOpts(H.G)===null);
  check('6. 已經回臺灣：USL.nextStop 也不算週末 14:00（原本會算、玩家碰不到）',wk14(stopsIn(nowT(),T(D('2028-09-17'),23))).length===0,J(stopsIn(nowT(),T(D('2028-09-17'),23)).map(lab)));
  /* 一路快轉（交往中、七場都還有）：每個停點都有事＝要回的訊息或該出發的出遊 */
  w208('2028-09-14',9,'us_apartment'); let empty=[], n=0;
  for(let i=0;i<40&&nowT()<T(D('2028-10-30'),0);i++){ const t0=nowT(), o=USL.ffOpts(H.G); if(!o) break; const why=await USL.jump(GM,o[0].to); n++;
    const d=H.G.day, w=wdOf(d); if((w===6||w===0)&&Math.abs(H.G.hour-14)<1e-6&&why==='end') empty.push(stop());
    if(why==='msg'){ const p=PHONE.pending(H.G); for(const m of p) if(/^us208_ask_/.test(m.ask.id)) PHONE.answer(H.G,m.ask.id,1); else PHONE.answer(H.G,m.ask.id,0); rules(); }
    if(nowT()<=t0) H.G.hour+=0.25; }
  check('6. 9/14～10/29 一路快轉（208 的私訊都回「今天不行。」）：沒有停在週末 14:00 卻什麼都沒有（共 '+n+' 次快轉）',empty.length===0,J(empty));
});

/* ======================= 7. 10/16 21:00：學姊「改過的報告拿了 A。」那一則的條件（R2Y4A.us2GradeOn）才停 ======================= */
await sec(7,async()=>{
  const A='改過的報告拿了 A。教授說：『這次我讀到妳了。』', d16=D('2028-10-16'), t21=T(d16,21), in16=()=>stopsIn(T(d16,12),T(d16,23)).includes(t21);
  /* 一路快轉到 10/17 08:30：途中要回的訊息（不是這裡要看的）先回第一個選項再接著快轉；回傳停過的時間 */
  const ff=async()=>{ const end=T(D('2028-10-17'),8.5), seen=[]; for(let i=0;i<12&&nowT()<end-1e-6;i++){ const why=await USL.jump(GM,end); seen.push(stop()+(why==='msg'?'（訊息）':''));
      if(why!=='msg') break; for(const m of PHONE.pending(H.G)) PHONE.answer(H.G,m.ask.id,0); rules(); } return seen; };
  check('7. 停點和那一則用同一個判斷：R2Y4A.us2GradeOn（r2y4a3d.js）、USL.oct16On（us_life3d.js FIXED 10/16 21:00）都在',typeof R2Y4A!=='undefined'&&typeof R2Y4A.us2GradeOn==='function'&&typeof USL.oct16On==='function');
  /* 該停的照停 */
  for(const v of ['there','missed']){ w208('2028-10-16',12,'us_apartment',{US2:v}); doneUpTo('3-1','3-2');
    check('7. 交往中、US2＝'+v+'：10/16 21:00 是停點',in16(),J(stopsIn(T(d16,12),T(d16,23)).map(lab)));
    const seen=await ff(), m=byTag('us2_grade');
    check('7. 交往中、US2＝'+v+'：一路快轉停在 10/16 21:00，她傳「'+A+'」',seen.includes('2028-10-16 21')&&m.length===1&&m[0].text===A&&m[0].day===d16&&m[0].h===21,J({seen,m:m.map(x=>x.text)})); }
  /* 不該停的不停 */
  fresh('2028-10-16',12,'us_apartment',{US2:'there'});
  check('7. 挽回中（沒在交往）、US2＝there：10/16 21:00 不停',!in16(),J(stopsIn(T(d16,12),T(d16,23)).map(lab)));
  { const seen=await ff(); check('7. 挽回中：一路快轉（途中的訊息回掉、接著快轉到 10/17 08:30）不停在 10/16 21:00、也沒有那一則',!seen.includes('2028-10-16 21')&&seen[seen.length-1]==='2028-10-17 8.5'&&!byTag('us2_grade').length,J(seen)); }
  fresh('2028-10-16',12,'us_apartment',{US2:'repair'});
  check('7. 挽回中、US2＝repair（還了鍋子）：10/16 21:00 不停',!in16(),J(stopsIn(T(d16,12),T(d16,23)).map(lab)));
  w208('2028-10-16',12,'us_apartment',{US2:'repair'}); doneUpTo('3-1','3-2');
  check('7. 交往中但 US2＝repair（還了鍋子以後才在一起）：10/16 21:00 不停',!in16(),J(stopsIn(T(d16,12),T(d16,23)).map(lab)));
  { const seen=await ff(); check('7. 交往中、US2＝repair：一路快轉不停在 10/16 21:00、也沒有那一則',!seen.includes('2028-10-16 21')&&seen[seen.length-1]==='2028-10-17 8.5'&&!byTag('us2_grade').length,J(seen)); }
  /* 10/16 21:00 另一件事：「大四要怎麼過？」再問一次（上次選④；story3d.js STORY.y4Path2Due，在公寓演）——挽回中也照停 */
  fresh('2028-10-16',12,'us_apartment',{US2:'repair',Y4_PATH:'undecided',Y4_PATH_DAY:D('2028-06-02')});
  check('7. 挽回中、上次「大四要怎麼過？」選④（再問一次在 10/16 21:00）：照停',in16(),J(stopsIn(T(d16,12),T(d16,23)).map(lab)));
  { const end=T(D('2028-10-17'),8.5); let seen=[], due=false; for(let i=0;i<12&&nowT()<end-1e-6;i++){ const why=await USL.jump(GM,end); seen.push(stop()); if(stop()==='2028-10-16 21'){ due=STORY.y4Path2Due(H.G); break; } if(why!=='msg') break; for(const m of PHONE.pending(H.G)) PHONE.answer(H.G,m.ask.id,0); rules(); }
    check('7. 選④：一路快轉停在 10/16 21:00，那時候 STORY.y4Path2Due 為真（公寓裡就演再問一次）',due,J(seen)); }
  fresh('2028-10-16',12,'us_apartment',{US2:'repair',Y4_PATH:'undecided',Y4_PATH_DAY:D('2028-06-02'),Y4_PATH_ASK2:D('2028-10-15')});
  check('7. 選④但已經再問過（Y4_PATH_ASK2）：不停',!in16(),J(stopsIn(T(d16,12),T(d16,23)).map(lab)));
});

H.done();
})();
