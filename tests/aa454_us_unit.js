// AA_454（企劃線 eaa98aaa7，AA-B 2026-10-25 03:5x；美國 208 的週末七場：快轉的玩家一場都看不到，補她的私訊）——不需要瀏覽器。台詞逐字對 AA_454。
//   第 1 節 週末 14:00 她私訊一則要回的（七句照表，src/us208_3d.js）：「我過去。」＝出遊「C 棟 208」、快轉停在出發前、出發就換到 208 演那一場；
//          「今天不行。」＝她「好。」→ 週日 14:00「今天也在 208。」一次；週日也不行＝這個週末不演；沒回＝照現在（自己走過去也會演）；週六去過的週日不傳
//   2-1 湖邊的「看」照 US3.usSeasonKey（秋 10/9、初冬 11/1、雪 12/2；src/us_life3d.js S.lakeLook）
//   2-2 一個人的感恩節（ev_usl_thanks_alone）：「窗外開始飄小雪」→「社區很安靜，只有幾戶亮著燈。」
// 修改前（開發分支 7da7f35ad＝AA_454 的 WIP 檢查點 7c167dfa8 的前一個）：每一節至少一項 FAIL（第 1 節 28 項、2-1 3 項、2-2 2 項，共 33 項；第 1 節「不該傳的時候不傳」6 項、「沒回＝照現在」1 項修改前就通過）。
//   用法：node tests/aa454_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY|SISQX|SISQX_LINES|SISQX_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
/* 照 index.html 的順序：us208_3d.js 在 us_life3d.js 之後；us_blank3d.js、sis_qixi3d.js 都包 USL.nextStop */
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js','src/data/sis_qixi_events.js','src/sis_qixi3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
let doc=''; try{ doc=cp.execSync('git show eaa98aaa7:"docs/story_planning/AA_454_美國208週末七場_快轉看不到_補她的私訊.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const inDoc=t=>doc.indexOf(t)>=0;
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
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t);
const p5=()=>th('p:'+S5).map(m=>(m.from==='player'?'你':'她')+'：'+m.text);
const dm208=()=>(H.G.msgs||[]).filter(m=>/^us208_dm_/.test(m.tag||''));
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=()=>H.said.map(s=>s.t);
const stop=()=>CALENDAR.dateOf(H.G.day).key+' '+(+H.G.hour.toFixed(2));
const done=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const go=async(picks)=>{ const q=OUT.due(H.G); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=q?await OUT.prompt(GM,q):null; return {id:q&&q.id,r,L:said()}; };
const walk=async picks=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=US208.tick(GM,0.5); for(let i=0;i<200&&US208.isBusy&&US208.isBusy();i++) await new Promise(res=>setTimeout(res,1)); return r; };   /* 自己走進 208（US208.tick）*/
const ZONES0=Z3.ZONES;
const stageOn=()=>{ Z3.ZONES=Object.assign({},ZONES0,{us_shared:{name:'C 棟 208'},us_apartment:{name:'公寓'},us_outside:{name:'社區'}}); };
const stageOff=()=>{ Z3.ZONES=ZONES0; };

/* 照稿（AA_454 第 1 節的表＋週日那一句、兩個選項、她的回覆）*/
const DM={'3-1':'我在 208。門沒鎖。','3-2':'我在煮東西。……第一次煮這個。','3-3':'臺灣寄來的東西到了。','3-4':'下午在 208。你來的時候先敲門。',
  '3-5':'冬令時間。手機自己改了。……你過來嗎。','3-6':'客廳那盆植物，我在救它。','3-7':'我在寫報告。你要來的話，帶你自己的書。'};
const SUN='今天也在 208。', YES='我過去。', NO='今天不行。', NO_RE='好。';
const EVN={'3-1':'ev_us208_memo','3-2':'ev_us208_lurou','3-3':'ev_us208_clipping','3-4':'ev_us208_rehearsal','3-5':'ev_us208_extra_hour','3-6':'ev_us208_plant','3-7':'ev_us208_lastweek'};
const M01='（門沒鎖。她坐在沙發上，腿上放著筆電。）';   /* 3-1 的第一句（AA_412）*/
const LAKE={summer:'（湖邊有人在遛狗。太陽很晚才下山。）',autumn:'（湖面很平。對岸的樹，一棵一棵變顏色。）',bare:'（樹葉都掉光了。湖面的顏色比天還灰。）',snow:'（湖邊的長椅積了雪。）'};
const ALONE1='（你煮了一包台灣帶來的泡麵。社區很安靜，只有幾戶亮著燈。）', ALONE0='（你煮了一包台灣帶來的泡麵。窗外開始飄小雪。）';
(async()=>{
await sec(0,()=>{
  check('0. 美國篇的檔案（含 us208_3d.js、us_blank3d.js、sis_qixi3d.js）都載得到',!loadErr.length&&typeof US208!=='undefined'&&typeof USL!=='undefined'&&typeof US3!=='undefined',loadErr.join('；'));
  check('0. 讀稿（企劃線 eaa98aaa7 AA_454）',doc.length>2000&&inDoc('## 1. 補法')&&inDoc('### 2-1.')&&inDoc('### 2-2.'));
  for(const n in DM) check('0. 稿的表：'+n+'「'+DM[n]+'」',inDoc('| '+n+' ')&&inDoc('| '+DM[n]+' |'));
  for(const t of ['「'+SUN+'」','回「'+YES+'」','回「'+NO+'」','她回「'+NO_RE+'」','週日也說不行，這個週末就不演','沒回：照現在（自己走過去也會演）','週六已經去過的，週日不傳','`US208_DM`',
    'summer → `lakeSummer`','autumn → `lakeOct`','bare → `lakeNov`','snow → `lakeSnow`',ALONE1.slice(1,-1),ALONE0.slice(1,-1)]) check('0. 稿裡有「'+t+'」',inDoc(t)); });

/* ======================= 第 1 節 一路快轉：週六 14:00 她的私訊 ======================= */
await sec('1',async()=>{
  let G=w208('2028-09-15',12,'us_apartment');
  let why=await USL.jump(GM,T(D('2028-09-18'),9)); const s0=stop(), m=byTag('us208_dm_0916'), last=m[m.length-1];
  check('1. 一路快轉（9/15 →「到下一個有事的日子」）：停在 9/16（六）14:00，她私訊一則「'+DM['3-1']+'」，要回（「'+YES+'」「'+NO+'」）——快轉停在要回的訊息',why==='msg'&&s0==='2028-09-16 14'&&m.length===1&&!!last&&last.text===DM['3-1']&&last.from===S5&&last.th==='p:'+S5&&!!last.ask&&J(last.ask.opts.map(o=>o.t))===J([YES,NO])&&PHONE.askOpen(G,last),J({why,s0,m:m.map(x=>x.text),ask:last&&last.ask}));
  check('1. 記「這個週末傳過了」：G.flags.US208_DM＝那個週六（9/16）',G.flags.US208_DM===D('2028-09-16'),J(G.flags.US208_DM));
  PHONE.answer(G,last&&last.ask?last.ask.id:'',0); rules(); const q=OUT.get(G,'us208_0916');
  check('1. 回「'+YES+'」（她不回話）→ 排出遊「C 棟 208」9/16 14:30（演 3-1 ev_us208_memo）',J(p5().slice(-2))===J(['她：'+DM['3-1'],'你：'+YES])&&!!q&&q.state==='planned'&&q.ev===EVN['3-1']&&q.place==='C 棟 208'&&q.title==='C 棟 208'&&q.day===D('2028-09-16')&&q.h===14.5,J({t:p5().slice(-3),q}));
  why=await USL.jump(GM,T(D('2028-09-18'),9)); const s1=stop(), due=OUT.due(G);
  check('1. 再快轉：停在出發前（14:10，走路 5 分鐘），跳出「出發：C 棟 208」',s1==='2028-09-16 14.17'&&!!due&&due.id==='us208_0916',J({why,s1,due:due&&due.id}));
  stageOn(); let g; try{ H.entered=[]; g=await go([0,0]); } finally { stageOff(); }
  check('1. 出發＝換到 C 棟 208 演 3-1（OUT.STAGE：第一句「'+M01+'」）；演完回到公寓；記憶 US208_MEMO、這個週末演過了（US208_WK）',g.r==='go'&&g.L[0]===M01&&g.L.indexOf('Legal Writing 的作業寫完了嗎？')===1&&J(H.entered)===J(['us_shared','us_apartment'])&&G.zone==='us_apartment'&&done(EVN['3-1'])&&SOCIAL.has(S5,'US208_MEMO')&&G.flags.US208_WK===D('2028-09-16')&&OUT.get(G,'us208_0916').state==='done',J({r:g.r,L:g.L.slice(0,2),en:H.entered,WK:G.flags.US208_WK}));
  at('2028-09-17',14.05); rules(); G.zone='us_shared';
  check('1. 週六去過了：週日（9/17）14:00 不傳；也不再演（一個週末一場）',!byTag('us208_dm_0917').length&&dm208().length===1&&US208.due(G)===null,J(dm208().map(x=>x.text)));
  at('2028-09-23',14.05); G.zone='us_apartment'; rules(); const m23=byTag('us208_dm_0923');
  check('1. 下一個週末（9/23）：3-2「'+DM['3-2']+'」（3-1 演過了）',m23.length===1&&m23[0].text===DM['3-2']&&G.flags.US208_DM===D('2028-09-23'),J(m23.map(x=>x.text)));
});

/* ======================= 第 1 節 「今天不行。」：週日再一次；週日也不行＝這個週末不演 ======================= */
await sec('1-不行',async()=>{
  let G=w208('2028-09-16',13.9,'us_apartment'); at('2028-09-16',14); rules(); PHONE.answer(G,'us208_ask_0916',1); rules();
  check('1. 週六回「'+NO+'」→ 她「'+NO_RE+'」；不排出遊',J(p5().slice(-3))===J(['她：'+DM['3-1'],'你：'+NO,'她：'+NO_RE])&&!OUT.get(G,'us208_0916')&&G.flags.US208_NO==null,J(p5()));
  let why=await USL.jump(GM,T(D('2028-09-18'),9)); const s0=stop(), m=byTag('us208_dm_0917'), last=m[m.length-1];
  check('1. 快轉停在週日（9/17）14:00：「'+SUN+'」（同樣兩個選項）',why==='msg'&&s0==='2028-09-17 14'&&m.length===1&&last.text===SUN&&J(last.ask.opts.map(o=>o.t))===J([YES,NO])&&PHONE.askOpen(G,last),J({why,s0,m:m.map(x=>x.text)}));
  PHONE.answer(G,'us208_ask_0917',1); rules(); at('2028-09-17',15); G.zone='us_shared'; const w=await walk([0]);
  check('1. 週日也回「'+NO+'」→ 她「'+NO_RE+'」；這個週末不演（自己走進 208 也不演：US208_NO＝那個週六）',J(p5().slice(-3))===J(['她：'+SUN,'你：'+NO,'她：'+NO_RE])&&G.flags.US208_NO===D('2028-09-16')&&US208.due(G)===null&&w===false&&!done(EVN['3-1']),J({t:p5().slice(-3),NO:G.flags.US208_NO,w}));
  at('2028-09-17',16); rules();
  check('1. 一個週末最多兩則（週六一則、週日一則）',dm208().length===2,J(dm208().map(x=>x.text)));
  at('2028-09-23',14.05); G.zone='us_apartment'; rules(); const m23=byTag('us208_dm_0923');
  check('1. 下一個週末（9/23）：3-1 還在範圍（到 9/24）、沒演過＝再傳「'+DM['3-1']+'」',m23.length===1&&m23[0].text===DM['3-1'],J(m23.map(x=>x.text)));
  /* 週六不行、週日「我過去。」*/
  G=w208('2028-09-16',13.9,'us_apartment'); at('2028-09-16',14); rules(); PHONE.answer(G,'us208_ask_0916',1); at('2028-09-17',14); rules(); PHONE.answer(G,'us208_ask_0917',0); rules();
  const q=OUT.get(G,'us208_0917'); at('2028-09-17',14.2); stageOn(); let g; try{ H.entered=[]; g=await go([0,1]); } finally { stageOff(); }
  check('1. 週六不行、週日回「'+YES+'」→ 排 9/17 14:30「C 棟 208」，出發就到 208 演 3-1',!!q&&q.day===D('2028-09-17')&&q.h===14.5&&q.ev===EVN['3-1']&&g.id==='us208_0917'&&g.r==='go'&&g.L[0]===M01&&J(H.entered)===J(['us_shared','us_apartment'])&&done(EVN['3-1'])&&G.flags.US208_WK===D('2028-09-16'),J({q,g:g.id,L0:g.L[0]}));
  /* 晚一點才回：出遊排在回的當下 15 分鐘後（不是過去的 14:30）*/
  G=w208('2028-09-16',13.9,'us_apartment'); at('2028-09-16',14); rules(); at('2028-09-16',16.1); PHONE.answer(G,'us208_ask_0916',0); rules(); const q2=OUT.get(G,'us208_0916');
  check('1. 16:06 才回「'+YES+'」：出遊排在 16:30（回的當下 15 分鐘後、對齊 15 分）',!!q2&&q2.h===16.5&&q2.state==='planned',J(q2));
  G=w208('2028-09-16',13.9,'us_apartment'); at('2028-09-16',14); rules(); at('2028-09-16',20.6);
  { const mm=byTag('us208_dm_0916')[0]; check('1. 20:30 以後不能回（她 21:00 離開 208）',!!mm&&!!mm.ask&&!PHONE.askOpen(G,mm),J(mm&&mm.ask)); }
});

/* ======================= 第 1 節 沒回＝照現在；自己先走過去的 ======================= */
await sec('1-沒回',async()=>{
  let G=w208('2028-09-16',13.9,'us_apartment'); at('2028-09-16',14); rules(); at('2028-09-17',14.05); rules();
  check('1. 週六沒回：週日不再傳',dm208().length===1&&!byTag('us208_dm_0917').length,J(dm208().map(x=>x.text)));
  at('2028-09-17',15); G.zone='us_shared'; let w=await walk([0]);
  check('1. 沒回：照現在，自己走進 208 就演 3-1',w===true&&said()[0]===M01&&done(EVN['3-1'])&&!OUT.get(G,'us208_0916')&&!OUT.get(G,'us208_0917'),J({w,s:said()[0]}));
  G=w208('2028-09-16',13.9,'us_shared'); at('2028-09-16',14); rules(); at('2028-09-16',15); w=await walk([0]); const m=byTag('us208_dm_0916')[0];
  check('1. 沒回、同一天自己走進 208：照現在直接演；那一則不用回了（不能再回）、不排出遊',w===true&&done(EVN['3-1'])&&!!m&&!PHONE.askOpen(G,m)&&!OUT.get(G,'us208_0916'),J({w,ask:m&&m.ask}));
  /* 回了「我過去。」又自己先走到 208：直接演、出遊記成 done（不再問「出發」，只演一次）*/
  G=w208('2028-09-16',13.9,'us_shared'); at('2028-09-16',14); rules(); PHONE.answer(G,'us208_ask_0916',0); rules(); at('2028-09-16',14.1); w=await walk([0]); at('2028-09-16',14.3); rules();
  const q=OUT.get(G,'us208_0916'), d=OUT.due(G);
  check('1. 回了「'+YES+'」又自己先走進 208：直接演、只演一次；出遊記成 done、不再問「出發」',w===true&&G.events.done[EVN['3-1']]===1&&!!q&&q.state==='done'&&!d,J({w,n:G.events.done[EVN['3-1']],q,d:d&&d.id}));
  /* 舊存檔（沒有 US208_DM）：當作沒傳過 */
  G=w208('2028-09-16',14.5,'us_apartment'); delete G.flags.US208_DM; rules();
  check('1. 舊存檔（沒有 US208_DM、14:30 讀檔）：當作沒傳過，照現在的時間傳',byTag('us208_dm_0916').length===1&&byTag('us208_dm_0916')[0].h===14.5,J(byTag('us208_dm_0916')));
});

/* ======================= 第 1 節 七句照表；不搶那一場的第一句 ======================= */
await sec('1-表',async()=>{
  const SET=[['3-1','2028-09-16',[]],['3-2','2028-09-23',['3-1']],['3-3','2028-10-14',[]],['3-4','2028-10-21',['3-3']],['3-5','2028-11-05',[]],['3-6','2028-11-18',[]],['3-7','2028-12-09',[]]];
  for(const [n,k,pre] of SET){ const G=w208(k,13.9,'us_apartment'); for(const p of pre) G.events.done[EVN[p]]=1; at(k,14); rules(); const m=dm208();
    const e=ev(EVN[n]), first=e.dialogue.find(l=>l&&l.speaker===S5), all=e.dialogue.filter(l=>l&&typeof l.text==='string').map(l=>l.text);
    check('1. '+n+'（'+k.slice(5)+'）：她傳「'+DM[n]+'」（一則、要回）；不搶那一場的第一句（不是那一場裡的任何一句）',m.length===1&&m[0].text===DM[n]&&!!m[0].ask&&US208.due(G)===US208.SCENES.find(s=>s.n===n)&&!!first&&first.text!==DM[n]&&all.indexOf(DM[n])<0,J({m:m.map(x=>x.text),first:first&&first.text})); }
  /* 3-5 只有 11/5（日）：週六 11/4 沒有該演的、不傳；11/5 是這個週末的第一則 */
  let G=w208('2028-11-04',13.9,'us_apartment'); at('2028-11-04',14); rules(); const m4=dm208().length; at('2028-11-05',14); rules(); const m5=byTag('us208_dm_1105');
  check('1. 3-5：11/4（六）沒有該演的＝不傳；11/5（日）14:00 是這個週末第一則「'+DM['3-5']+'」',m4===0&&m5.length===1&&m5[0].text===DM['3-5']&&G.flags.US208_DM===D('2028-11-04'),J({m4,m5:m5.map(x=>x.text)}));
  PHONE.answer(G,'us208_ask_1105',1); rules(); at('2028-11-05',15); G.zone='us_shared';
  check('1. 3-5：週日回「'+NO+'」→「'+NO_RE+'」、這個週末不演（之後不補）',G.flags.US208_NO===D('2028-11-04')&&US208.due(G)===null&&(at('2028-11-18',15),US208.due(G)===US208.SCENES.find(s=>s.n==='3-6')),J({NO:G.flags.US208_NO}));
});

/* ======================= 第 1 節 條件同 S.due：不該傳的時候不傳 ======================= */
await sec('1-條件',async()=>{
  let G=fresh('2028-09-16',13.9,'us_apartment',{US2:'there'}); at('2028-09-16',14); rules();
  check('1. 挽回中（沒在交往）：不傳',!dm208().length);
  G=w208('2028-09-09',13.9,'us_apartment',{US2:null}); delete G.flags.US2; at('2028-09-09',14); rules();
  check('1. US2（9/13）以前的週六（9/9）：不傳',!dm208().length);
  G=w208('2028-09-18',18.9,'us_apartment'); at('2028-09-18',19); rules();
  check('1. 平日（9/18 週一 19:00）：不傳',!dm208().length);
  G=w208('2028-09-16',13.5,'us_apartment'); rules(); const a=dm208().length; at('2028-09-16',20.6); rules();
  check('1. 14:00 以前、20:30 以後：不傳',a===0&&!dm208().length);
  G=w208('2028-12-02',20.1,'us_apartment'); rules();
  check('1. 12/2 20:00 她在小教堂台階（門關著）：不傳',!dm208().length);
  G=w208('2028-09-16',13.9,'us_apartment',{EXCHANGE_ROUTE:'TW'}); at('2028-09-16',14); rules();
  check('1. 不是美國路線：不傳',!dm208().length);
});

/* ======================= 2-1 湖邊的「看」照 usSeasonKey ======================= */
await sec('2-1',async()=>{
  const r=[]; for(const [k,s] of [['2028-08-20','summer'],['2028-10-01','summer'],['2028-10-08','summer'],['2028-10-09','autumn'],['2028-10-31','autumn'],['2028-11-01','bare'],['2028-12-01','bare'],['2028-12-02','snow'],['2028-12-10','snow']]){
    const G=w208(k,15,'us_outside'); r.push([k,s,US3.usSeasonKey(G),USL.lakeLook(G)===LAKE[s]]); }
  check('2-1. US3.usSeasonKey(G)：照那一份存檔的日子（不靠 GAME.G）',r.every(x=>x[1]===x[2]),J(r.map(x=>x.slice(0,3))));
  check('2-1. 湖邊的「看」照季節：10/1～10/8 還是夏天那一句、10/9 起「（湖面很平。對岸的樹，一棵一棵變顏色。）」、11/1 起初冬、12/2 起雪',r.every(x=>x[3]),J(r.filter(x=>!x[3]).map(x=>x[0])));
  const G=w208('2028-10-05',15,'us_outside'); H.said=[]; await USL.lake(GM);
  check('2-1. 10/5 去湖邊：「'+LAKE.summer+'」（不是變顏色）',said().indexOf(LAKE.summer)>=0&&said().indexOf(LAKE.autumn)<0,J(said()));
});

/* ======================= 2-2 一個人的感恩節 ======================= */
await sec('2-2',async()=>{
  const e=ev('ev_usl_thanks_alone'); const t=e&&e.dialogue.filter(l=>typeof l.text==='string').map(l=>l.text);
  check('2-2. ev_usl_thanks_alone：「'+ALONE1+'」（沒有「窗外開始飄小雪」）',!!t&&J(t)===J([ALONE1])&&J(e.dialogue).indexOf('小雪')<0,J(t));
  const G=fresh('2028-11-23',18.5,'us_apartment'); H.said=[]; H.picks=[]; await EVENTS.run(e,{noTitle:true});
  check('2-2. 演出來就是那一句；記 USL_THANKS＝alone（照舊）',J(said())===J([ALONE1])&&G.flags.USL_THANKS==='alone',J(said()));
});

H.done();
})();
