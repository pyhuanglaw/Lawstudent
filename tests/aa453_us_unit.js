// AA_453（企劃線 38820fd5e，AA-B 2026-10-25 03:3x；讀 BB-B 美國交換逐日劇本（交往中、見過何俊朗）ec98a8836）——不需要瀏覽器。台詞逐字對 AA_453。
//   1-1 8/25 17:00 學姊美國的七夕：查原因——遊戲沒有問題（見過她的存檔有 met_sis，快轉停在 17:00、她當面約）；BB 探針的底檔只有 FIRST_MET、沒有 met_sis（SISQX.ok 要 met_sis）＝快轉直接跳到 21:00
//   1-2 七夕排了：8/25 21:00 那一則換「市集逛完，下午去圖書館。課表帶著。」；七夕演過：圖書館第一句換「（從市集回來，那顆桃子放在桌角。……）」；沒排的照舊
//   1-3 9/13 交往中「……我在煮麵。C 棟，廚房。要不要吃。」改成要回的：「我過去。」＝出遊「C 棟・廚房」18:30（快轉停在出發前、出發就到 C 棟演）；「今天不行。」、沒回照舊；自己走去先演的不演兩次
// 修改前（開發分支 32b1f99dc）：每一節至少一項 FAIL（1-1 沒有改遊戲：那幾項修改前就通過，是查原因的證據；同一節 1-2 的換句修改前 FAIL）。用法：node tests/aa453_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY|SISQX|SISQX_LINES|SISQX_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
/* 照 index.html 的順序：us_blank3d.js、sis_qixi3d.js 都包 USL.nextStop（七夕的停點在 sis_qixi3d.js）*/
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js','src/data/sis_qixi_events.js','src/sis_qixi3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
let doc=''; try{ doc=cp.execSync('git show 38820fd5e:"docs/story_planning/AA_453_美國交換讀後_交往中新版_七夕和退回的報告.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const inDoc=t=>doc.indexOf(t)>=0;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
GM.caption=()=>{}; GM.toast=()=>{}; GM.studySession=async()=>{};
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
let sat=[]; GM.sitAt=(P,s)=>{ P.seat=s; sat.push(s); }; GM.standUp=P=>{ P.seat=null; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'us_apartment',US(flags)); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G); E.player.busy=false; E.paused=false; E.player.seat=null; sat=[];
  SOCIAL.remember(S5,'FIRST_MET',''); PHONE.join(G,'us_exchange','交換生'); return G; };
const MS={met_sis:true,SIS_W1:true};   /* 真的玩家：大一就認識學姊（W1／晚到的 W1／家聚／社博都記 met_sis；沒有 met_sis 跟她說話只有一句旁白，關係推不動、交往不了）*/
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating'; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id),{noTitle:true}); return said(); };
const stop=()=>CALENDAR.dateOf(H.G.day).key+' '+(+H.G.hour.toFixed(2));
const done=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const waitFor=async f=>{ for(let i=0;i<400&&!f();i++) await new Promise(r=>setTimeout(r,0)); return f(); };
const go=async(picks)=>{ const q=OUT.due(H.G); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=q?await OUT.prompt(GM,q):null; return {id:q&&q.id,r,L:said()}; };

const QX_ASK='明天早上九點，我在宿舍門口等你。這邊週六有市集。', PEACH='（她挑了兩顆桃子，捏了一下，放回去一顆。）';
const MSG0='明天下午圖書館。課表拿來。', MSG1='市集逛完，下午去圖書館。課表帶著。';
const LIB0='（開學後的第一個週六。一樓中庭的長桌，她把每一門課的 syllabus 攤在桌上。）', LIB1='（從市集回來，那顆桃子放在桌角。一樓中庭的長桌，她把每一門課的 syllabus 攤在桌上。）';
const US2A='報告被退回來了。', US2B='……我在煮麵。C 棟，廚房。要不要吃。', YES='我過去。', NO='今天不行。', YES_RE='樓下的門，按 208。', NO_RE='好。', MISSED='麵我吃完了。報告我自己再改一次。';
const K0='（她在煮泡麵，兩包。）';
const p5=()=>th('p:'+S5).map(m=>(m.from==='player'?'你':'她')+'：'+m.text);
(async()=>{
await sec(0,()=>{
  check('0. 美國篇的檔案（含 sis_qixi3d.js）都載得到',!loadErr.length&&typeof SISQX!=='undefined'&&typeof US_BLANK!=='undefined'&&typeof R2Y4A!=='undefined',loadErr.join('；'));
  check('0. 讀稿（企劃線 38820fd5e AA_453）',doc.length>2000&&inDoc('### 1-1.')&&inDoc('### 1-2.')&&inDoc('### 1-3.'));
  for(const t of [MSG1,LIB1.slice(1,-1),PEACH.slice(1,-2),US2A,US2B,'「'+YES+'」','「'+NO+'」','她回「'+YES_RE+'」','她回「'+NO_RE+'」',MISSED,'C 棟・廚房'])
    check('0. 稿裡有「'+t+'」',inDoc(t)); });

/* ======================= 1-1、1-2 8/25～8/26 學姊美國的七夕、同一天下午的圖書館 ======================= */
await sec('1-1',async()=>{
  /* BB 探針的底檔（zrlast_probe R18 TRX_US_DATING2：B['DATE']＝dating_heroine_05＋LV（只記 FIRST_MET）、沒有 met_sis）：快轉直接跳到 8/25 21:00 */
  let G=fresh('2028-08-21',12,'us_apartment'); dateSis();
  const base={metD:SOCIAL.metD(S5),met_sis:!!G.flags.met_sis,ok:SISQX.ok(G)};
  let why=await USL.jump(GM,T(D('2028-08-26'),13)); const s0=stop(), m0=byTag('usb_sat_0826').map(m=>m.text);
  check('1-1. 探針的底檔（FIRST_MET 有、met_sis 沒有）：SISQX.ok＝false，快轉 8/21 → 8/25 21:00「明天下午圖書館。」——和 BB 的劇本一樣（不是遊戲的問題）',base.metD&&!base.met_sis&&!base.ok&&why==='msg'&&s0==='2028-08-25 21'&&J(m0)===J([MSG0])&&!OUT.get(G,'sisqx_2028'),J({base,why,s0,m0}));
  /* 真的玩家（見過她：met_sis）：快轉停在 8/25 17:00、她當面約、排 8/26 09:00 市集 */
  G=fresh('2028-08-21',12,'us_apartment',MS); dateSis();
  why=await USL.jump(GM,T(D('2028-08-26'),13)); const s1=stop(), c1=EVENTS.check(ev('ev_sis_qixi_us_ask'));
  check('1-1. 見過她（met_sis）、交往中：快轉 8/21 →「到下一個有事的日子」停在 8/25 17:00，人在公寓＝她當面約的那一段可以演',s1==='2028-08-25 17'&&c1===true&&SISQX.ok(G),J({why,s1,c1}));
  const L=await play('ev_sis_qixi_us_ask'), q=OUT.get(G,'sisqx_2028');
  check('1-1. 她：「'+QX_ASK+'」→ 排 8/26（六）09:00 週六市集',J(L)===J([QX_ASK])&&!!q&&q.state==='planned'&&q.day===D('2028-08-26')&&q.h===9,J({L,q}));

  /* 1-2：同一份存檔接著快轉 */
  why=await USL.jump(GM,T(D('2028-08-26'),13)); const s2=stop(), m2=byTag('usb_sat_0826').map(m=>m.text);
  check('1-2. 七夕排了：快轉停在 8/25 21:00 她的私訊，換成「'+MSG1+'」',why==='msg'&&s2==='2028-08-25 21'&&J(m2)===J([MSG1]),J({why,s2,m2}));
  PHONE.answer(G,'usb_sat_0826',0); rules(); const qs=OUT.get(G,'usb_sat_0826');
  check('1-2. 回「好。」照舊排 8/26 14:00 法學院圖書館（同一天兩場：09:00 市集、14:00 圖書館）',!!qs&&qs.state==='planned'&&qs.h===14&&qs.day===D('2028-08-26')&&OUT.get(G,'sisqx_2028').state==='planned',J(qs));
  why=await USL.jump(GM,T(D('2028-08-26'),13)); const s3=stop(); const g1=await go([0,0]);
  check('1-2. 快轉停在 8/26 市集出發前，出發＝演七夕（桃子那一句）',s3==='2028-08-26 8.67'&&g1.id==='sisqx_2028'&&g1.r==='go'&&g1.L.indexOf(PEACH)>=0&&OUT.get(G,'sisqx_2028').state==='done',J({why,s3,id:g1.id,L:g1.L.slice(0,4)}));
  why=await USL.jump(GM,T(D('2028-08-26'),15)); const s4=stop(); const g2=await go([0,0]);
  check('1-2. 七夕演過：下午圖書館第一句換成「'+LIB1+'」，後面照舊',s4==='2028-08-26 13.42'&&g2.id==='usb_sat_0826'&&g2.r==='go'&&g2.L[0]===LIB1&&g2.L.indexOf(LIB0)<0&&g2.L[1]==='第一週的閱讀很多。',J({s4,id:g2.id,L:g2.L.slice(0,3)}));
});
await sec('1-2',async()=>{
  /* 七夕沒排（沒在交往的存檔不會到這裡；用和可昕也在交往＝只有可昕的七夕，SISQX.ok false）：照現在 */
  let G=fresh('2028-08-25',20.5,'us_apartment',Object.assign({},MS,{dating_kexin:true})); dateSis(); at('2028-08-25',21.05); rules();
  check('1-2. 七夕沒排：8/25 21:00 照舊「'+MSG0+'」',!OUT.get(G,'sisqx_2028')&&J(byTag('usb_sat_0826').map(m=>m.text))===J([MSG0]),J(byTag('usb_sat_0826').map(m=>m.text)));
  at('2028-08-26',14); let L=await play('ev_usb_syllabus',[0]);
  check('1-2. 七夕沒排：圖書館第一句照舊',L[0]===LIB0&&L.indexOf(LIB1)<0,J(L.slice(0,2)));
  /* 七夕排了、早上沒去（「不去了」）：21:00 那一則已經是新的（約的時候排了）；圖書館第一句照舊（只有演過的才換）*/
  G=fresh('2028-08-25',17.5,'us_apartment',MS); dateSis(); await play('ev_sis_qixi_us_ask'); at('2028-08-25',21.05); rules();
  const m=byTag('usb_sat_0826').map(x=>x.text); at('2028-08-26',8.8); const g=await go([2]);
  at('2028-08-26',14); L=await play('ev_usb_syllabus',[0]);
  check('1-2. 七夕排了但早上「不去了」：21:00 換句（排了）；圖書館第一句照舊（沒演）',J(m)===J([MSG1])&&g.id==='sisqx_2028'&&g.r==='no'&&OUT.get(G,'sisqx_2028').state==='missed'&&L[0]===LIB0,J({m,g:g.id,r:g.r,L0:L[0]}));
});

/* ======================= 1-3 9/13 交往中「退回的報告」：最後一則要回 ======================= */
const ZONES0=Z3.ZONES, SEATS0=E.zone.seats;
const stageOn=()=>{ Z3.ZONES={us_shared:{name:'C 棟 208'},us_apartment:{name:'公寓'},us_outside:{name:'社區'}}; E.zone.seats=[{x:-3.6,z:0.4,yaw:0,lv:0,lift:0.31},{x:-2.6,z:0.4,yaw:0,lv:0,lift:0.31},{x:-4.15,z:-1.2,yaw:1.57,lv:0}]; };
const stageOff=()=>{ Z3.ZONES=ZONES0; E.zone.seats=SEATS0; };
await sec('1-3',async()=>{
  let G=fresh('2028-09-13',12,'us_apartment'); dateSis();
  let why=await USL.jump(GM,T(D('2028-09-14'),9)); const s0=stop(), m=byTag('us2_msg'), last=m[m.length-1];
  check('1-3. 快轉停在 9/13 18:00 她的兩則私訊，最後一則要回（「'+YES+'」「'+NO+'」）——快轉停在要回的訊息',why==='msg'&&s0==='2028-09-13 18'&&J(m.map(x=>x.text))===J([US2A,US2B])&&!!last&&!!last.ask&&J(last.ask.opts.map(o=>o.t))===J([YES,NO])&&PHONE.askOpen(G,last),J({why,s0,m:m.map(x=>x.text),ask:last&&last.ask}));
  PHONE.answer(G,'us2_ask',0); rules(); const q=OUT.get(G,'us2_kitchen');
  check('1-3. 回「'+YES+'」→ 她回「'+YES_RE+'」→ 排出遊「C 棟・廚房」9/13 18:30（ev_us2_kitchen）',J(p5().slice(-2))===J(['你：'+YES,'她：'+YES_RE])&&!!q&&q.state==='planned'&&q.ev==='ev_us2_kitchen'&&q.place==='C 棟・廚房'&&q.title==='C 棟・廚房'&&q.day===D('2028-09-13')&&q.h===18.5,J({t:p5().slice(-3),q}));
  why=await USL.jump(GM,T(D('2028-09-14'),9)); const s1=stop(), due=OUT.due(G);
  check('1-3. 快轉（USL.jump）停在出發前（18:10，走路 5 分鐘），跳出「出發：C 棟・廚房」',s1==='2028-09-13 18.17'&&!!due&&due.id==='us2_kitchen',J({why,s1,due:due&&due.id}));
  stageOn(); let g; try{ H.entered=[]; g=await go([0,1]); } finally { stageOff(); }
  const n=GM.npc[S5];
  check('1-3. 出發＝換到 C 棟 208（OUT.STAGE）：她在爐子前、你坐高腳椅，演 ev_us2_kitchen；演完回到公寓',g.r==='go'&&g.L[0]===K0&&J(H.entered)===J(['us_shared','us_apartment'])&&sat.length===1&&sat[0].lift>0&&!!n&&n.obj.position.x===-3.2&&n.obj.position.z===2&&G.flags.US2==='there'&&done('ev_us2_kitchen')&&G.zone==='us_apartment',J({r:g.r,L0:g.L[0],en:H.entered,sat,n:n&&n.obj.position,US2:G.flags.US2}));
  at('2028-09-13',20.6); rules();
  check('1-3. 去了：20:00 沒有「'+MISSED+'」；出遊記成 done',!byTag('us2_missed').length&&OUT.get(G,'us2_kitchen').state==='done',J({m:byTag('us2_missed').map(x=>x.text)}));
  at('2028-10-16',21.05); rules();
  check('1-3. 10/16 21:00「改過的報告拿了 A。」照舊接這一晚',byTag('us2_grade').length===1);

  /* 「今天不行。」：她回「好。」→ 不排；20:00「麵我吃完了。……」照舊 */
  G=fresh('2028-09-13',17.9,'us_apartment'); dateSis(); at('2028-09-13',18.05); rules(); PHONE.answer(G,'us2_ask',1); rules();
  const n0=OUT.get(G,'us2_kitchen'); at('2028-09-13',19.6); rules(); at('2028-09-13',20.05); rules();
  check('1-3. 回「'+NO+'」→ 她回「'+NO_RE+'」、不排出遊；20:00「'+MISSED+'」照舊',J(p5())===J(['她：'+US2A,'她：'+US2B,'你：'+NO,'她：'+NO_RE,'她：'+MISSED])&&!n0&&G.flags.US2==='missed',J({t:p5(),n0}));
  /* 沒回：照現在 */
  G=fresh('2028-09-13',17.9,'us_apartment'); dateSis(); at('2028-09-13',18.05); rules(); at('2028-09-13',19.6); rules(); at('2028-09-13',20.05); rules();
  check('1-3. 沒回：不排出遊；20:00「'+MISSED+'」照舊',!OUT.get(G,'us2_kitchen')&&J(p5())===J(['她：'+US2A,'她：'+US2B,'她：'+MISSED])&&G.flags.US2==='missed',J(p5()));

  /* 自己走過去、坐高腳椅：沒回的照現在直接演；回了「我過去。」又自己先到的，演完不再問「出發」（不演兩次）*/
  for(const ans of [null,0]){ G=fresh('2028-09-13',17.9,'us_shared'); dateSis(); at('2028-09-13',18.05); rules(); if(ans!=null){ PHONE.answer(G,'us2_ask',ans); rules(); }
    at('2028-09-13',18.6); E.player.seat={lift:0.31}; H.said=[]; H.picks=[0]; const t0=R2Y4A.tick(GM,0.5); await waitFor(()=>done('ev_us2_kitchen')&&!R2Y4A.isBusy()); E.player.seat=null;
    rules(); const q2=OUT.get(G,'us2_kitchen'), d2=OUT.due(G);
    check('1-3. 自己走到 C 棟坐高腳椅（'+(ans==null?'沒回':'回了「'+YES+'」')+'）：18:30 直接演；'+(ans==null?'沒有出遊':'出遊記成 done、不再問「出發」')+'、只演一次',t0===true&&said()[0]===K0&&G.events.done.ev_us2_kitchen===1&&G.flags.US2==='there'&&!d2&&(ans==null?!q2:!!q2&&q2.state==='done'),J({t0,s:said()[0],n:G.events.done.ev_us2_kitchen,q2,d2:d2&&d2.id})); }
  /* 舊存檔：18:00 的兩則已經傳了（沒有要回的）＝照舊（沒有出遊、20:00 那一則）*/
  G=fresh('2028-09-13',18.1,'us_apartment'); dateSis(); PHONE.at(G,D('2028-09-13'),18,[{th:'p:'+S5,from:S5,text:US2A},{th:'p:'+S5,from:S5,text:US2B}],'us2_msg'); PHONE.tick(G);
  rules(); at('2028-09-13',20.05); rules();
  check('1-3. 舊存檔（兩則已經傳了、沒有要回的）：照舊，20:00「'+MISSED+'」',!OUT.get(G,'us2_kitchen')&&J(p5())===J(['她：'+US2A,'她：'+US2B,'她：'+MISSED]),J(p5()));
});

H.done();
})();
