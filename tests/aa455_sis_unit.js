// AA_455 學姊第十一批：大四下的朋友版——摘要、口試的日子（企劃線 2de70709f；3-1 節答案 0c5afca90，AA-B 2026-10-25 05:4x；D111、USER_WANTS C25）——不需要瀏覽器。台詞逐字對 AA_455。
//   0  新檔載得到、index.html 接線；每一句台詞、旁白、選項都在稿裡（一字不差），稿裡兩場的每一句學姊、旁白都在遊戲裡；人物頁 SIS_ABSTRACT
//   1  11-1：3/20 21:00 私訊（要回）、快轉停在那則；「有。」＝排出遊「法圖 12:30」、「明天不行。」／沒回＝不排；法圖二樓三個選項照稿；熟悉 +2、自在 +2、記憶 SIS_ABSTRACT；
//      朋友版才有（交往中、前任、不熟、沒認識她都沒有；和別人交往中、三條交換路線都有）
//   2  11-2：4/16～4/27 平日 17:00～17:30 在總圖門口遇到就演（時間、地點、週末、窗口外都沒有）；兩組選項照稿；熟悉 +2、自在 +3、信任 +1、記憶 SIS_DEFENSE_DATE；
//      4/18 學期中的快轉停在 16:45 問「去：總圖」（去／晚一點／不去了）→ 去＝17:00 總圖門口、遇到就演；只停一次（已經遇到不停、4/19 不停）；4/27 以前沒遇到＝21:00 私訊；朋友版才有
//   3  接 5/29：選了「那天我去門口等。」又不在家族群組＝5/28 21:00「明天四點。……你說要來的。」＋5/29 M9「學姊的口試」（演 M9、沒到 18:30 記 missed）；
//      在家族群組＝Kevin 那一則照舊、不多傳；沒選那一句、和她交往中都不傳
//   4  舊存檔：沒有新旗標照常跑、不丟例外；兩場以外的日子不傳不排
// 修改前（開發分支 6fc6e302d）：沒有 src/sis_b11_3d.js、src/data/sis_b11_events.js——每一節至少一項 FAIL。用法：node tests/aa455_sis_unit.js
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(Y34B|SEMFF|SISB11|SISB11_LINES|SISB11_EVENTS)$/;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/y34b3d.js','src/semff3d.js']) L3(f);   /* 照 index.html：y34b3d.js（M9）在前面 */
const ok1=L3('src/data/sis_b11_events.js'), ok2=L3('src/sis_b11_3d.js');
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, now=()=>T(H.G.day,H.G.hour);
const lbl=t=>{ const d=Math.floor(t/24+1e-9), m=Math.round((t-d*24)*60); return keyOf(d).slice(5)+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const X=()=>typeof SISB11!=='undefined'?SISB11:null;
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ID);
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const evDone=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const waitFor=async f=>{ for(let i=0;i<400&&!f();i++) await new Promise(r=>setTimeout(r,0)); return f(); };
GM.toast=()=>{}; GM.caption=()=>{};
GM.enter=async(z,p)=>{ H.entered.push(z); H.G.zone=z; if(p){ E.player.obj.position.x=p.x; E.player.obj.position.z=p.z; } };
/* 真的玩家：大一就認識學姊（met_sis）；有她的聯絡方式（預設聯絡人）；route＝三條交換路線（大四下都回臺灣了）*/
const fresh=(key,h,lv,flags,route)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1,met_sis:true,SIS_W1:true},flags||{})); if(lv) (typeof lv==='function'?lv:H[lv])(ID); G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; H.at(key,h); E.player.obj.position.x=0; E.player.obj.position.z=0; return G; };
const ACQ=id=>H.rel(id,10,0,0);
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const atDoor=(key,h,x,z)=>{ H.at(key,h); H.G.zone='campus'; E.player.obj.position.x=x==null?84:x; E.player.obj.position.z=z==null?2:z; };
const meet=async(picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=X().tick(GM); if(r) await waitFor(()=>evDone('ev_sis_defense_date')&&!EVENTS.running); return r; };
const relNow=()=>Object.assign({},SOCIAL.rel(ID));
/* 學期中的快轉（semff3d.js）跳到 to：停下來是有劇情的課、要回的訊息就照玩家那樣處理（課記成上過、訊息先不回），再接著跳；回傳最後一次的結果與停點 */
const ff=async(to,until)=>{ const L=[]; let r=null;
  for(let k=0;k<30;k++){ r=await SEMFF.jump(GM,to); L.push((r.why)+'@'+lbl(now())+(r.stop?'（'+r.stop.why+'）':''));
    if(until(r)||now()>=to-1e-6) break;
    if(r.why==='now'||r.why==='stop'){ for(const it of CLS.dayItems(H.G,H.G.day)) if(T(H.G.day,it.t0)-SEMFF.PRE<=now()+1e-6&&T(H.G.day,it.t1)>now()) CLS.rec(H.G).done[it.key]=1; if(r.why==='stop') H.G.hour+=1/60; }
    else if(r.why==='out'){ const q=OUT.due(H.G); if(q){ q.state='missed'; } }
    else if(r.why==='msg'||r.why==='event'){ H.G.hour+=1/60; } }
  return {r,L}; };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 0c5afca90:"docs/story_planning/AA_455_學姊第十一批_大四下的朋友版.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
/* ---- 0 ---- */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), at=s=>html.indexOf(s);
  check('0. 新檔載得到（SISB11、SISB11_LINES、SISB11_EVENTS）',ok1&&ok2&&!!X()&&typeof SISB11_LINES!=='undefined'&&Array.isArray(SISB11_EVENTS),J(loadErr));
  check('0. index.html：data/sis_b11_events.js → sis_b11_3d.js 接在一起，在 y34b3d.js（M9）、sis_b10_3d.js、semff3d.js 後面、GAME.boot() 前面',/src\/data\/sis_b11_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b11_3d\.js\?v=[^"]+"><\/script>/.test(html)&&at('src/sis_b11_3d.js')>at('src/y34b3d.js')&&at('src/sis_b11_3d.js')>at('src/sis_b10_3d.js')&&at('src/sis_b11_3d.js')>at('src/semff3d.js')&&at('src/sis_b11_3d.js')<at('<script>GAME.boot();</script>'));
  check('0. 兩場都在 STORY_EVENTS（ev_sis_abstract 出遊、ev_sis_defense_date 遇到就演）',['ev_sis_abstract','ev_sis_defense_date'].every(id=>STORY_EVENTS.some(e=>e.id===id))&&STORY_EVENTS.find(e=>e.id==='ev_sis_abstract').trigger==='outing');
  const all=J(SISB11_EVENTS)+J(SISB11_LINES), q=[...all.matchAll(/"(?:text|t|r)":"([^"]+)"/g)].map(m=>m[1]).concat(Object.values(SISB11_LINES).flat().filter(x=>typeof x==='string'));
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!['（樓下的自助餐。她付錢的時候，摘要的資料夾一直夾在手臂下面。）'].includes(t));   /* AA_470 4-4（企劃線 5f54b6545）加的一句旁白，對字在 tests/aa470_sis_b12_unit.js */
  check('0. 每一句台詞、旁白、選項、私訊都在稿裡（一字不差）',!!doc&&q.length>30&&!notIn.length,J(notIn));
  const body=doc.slice(doc.indexOf('## 1.'),doc.indexOf('## 3.')), lines=[...body.matchAll(/(?:學姊|旁白)：([^\n]+)/g)].map(m=>m[1].trim()), mine=new Set(q.map(t=>t.replace(/^「|」$/g,'')));
  const lost=lines.filter(t=>!mine.has(t));
  check('0. 稿裡 11-1、11-2 的每一句學姊、旁白都在遊戲裡（'+lines.length+' 句）',!!doc&&lines.length>=25&&!lost.length,J(lost));
  check('0. 人物頁：SIS_ABSTRACT＝「她給你看過論文摘要」、SIS_DEFENSE_DATE＝「她告訴你口試的日子」（AA_455 3-1 節②）',SOCIAL.MEMORY_LABEL&&SOCIAL.MEMORY_LABEL.SIS_ABSTRACT==='她給你看過論文摘要'&&SOCIAL.MEMORY_LABEL.SIS_DEFENSE_DATE==='她告訴你口試的日子'); });
/* ---- 1 ---- */
await sec(1,async()=>{ fresh('2029-03-20',20,'FAMILIAR'); ph(); const early=byTag('sisb11_abs_ask').length; H.at('2029-03-20',21); ph(); const M=byTag('sisb11_abs_ask'), m=M.find(x=>x.ask);
  check('1. 3/20 21:00 她私訊「明天中午有空嗎。法圖二樓。」「我需要一個不是財經法組的人。」（21:00 以前沒有）；回「有。」／「明天不行。」',early===0&&J(M.map(x=>x.text))===J(['明天中午有空嗎。法圖二樓。','我需要一個不是財經法組的人。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['有。','明天不行。'])&&m.ask.until===T(D('2029-03-21'),12.5),J(M));
  PHONE.answer(H.G,'sisb11_abs_ask',0); ph(); const q=OUT.get(H.G,'sisb11_abs');
  check('1. 回「有。」→「十二點半。帶筆。」；排出遊「法圖 12:30」（3/21 12:30、法圖二樓、快轉／睡覺停在出發前）',th().some(x=>x.text==='十二點半。帶筆。'&&x.from===ID)&&!!q&&q.day===D('2029-03-21')&&q.h===12.5&&q.title==='法圖 12:30'&&q.ev==='ev_sis_abstract'&&q.alarm===true,J(q));
  for(const [pick,want] of [[0,['（看了一眼）……我寫的時候覺得剛好。','好。切成兩句。','（她拿起筆，在中間畫了一個句號。）']],[1,['都這樣寫。所以才找你。']],[2,['（她看了那個圈很久，然後把整句劃掉，在旁邊重寫。）']]]){
    fresh('2029-03-20',21,'FAMILIAR'); ph(); PHONE.answer(H.G,'sisb11_abs_ask',0); ph(); const r0=relNow(); H.at('2029-03-21',12.2); await goOut('sisb11_abs',[pick]); const r1=relNow();
    check('1. 法圖二樓（選項 '+(pick+1)+'）：開場三句 →「'+want[0]+'」…→「好。下禮拜給教授。」「……謝謝。樓下的自助餐，我請。」「5/29」便利貼；熟悉 +2、自在 +2；記憶 SIS_ABSTRACT',
      seq(['（法圖二樓的長桌。她把兩張紙推過來，一張中文、一張英文。）','論文的摘要。中文那一張。','你讀一次。哪裡讀不懂，就畫起來。','（你讀到第三行，停了一下。）'].concat(want,['好。下禮拜給教授。','……謝謝。樓下的自助餐，我請。','（她把兩張紙收進資料夾。資料夾的封面貼著一張便利貼：「5/29」。）']))
      &&J(H.opts[0])===J(['「這句太長了。」','「財經法的人都這樣寫嗎？」','（畫了一個圈，沒有說話）'])&&r1.fam-r0.fam===2&&r1.comf-r0.comf===2&&SOCIAL.has(ID,'SIS_ABSTRACT')&&H.G.flags.SIS_ABSTRACT==='went'&&evDone('ev_sis_abstract'),J({said:said(),opts:H.opts,d:[r1.fam-r0.fam,r1.comf-r0.comf]})); }
  fresh('2029-03-20',21,'FAMILIAR'); ph(); PHONE.answer(H.G,'sisb11_abs_ask',1); ph(); H.at('2029-03-21',12); ph();
  check('1. 回「明天不行。」→「好。那我自己再讀一次。」；不排',th().some(x=>x.text==='好。那我自己再讀一次。')&&!OUT.get(H.G,'sisb11_abs'));
  fresh('2029-03-20',21,'FAMILIAR'); ph(); H.at('2029-03-21',12); ph(); H.at('2029-03-21',13); ph();
  check('1. 沒回：不排；12:30 以後不能再回',!OUT.get(H.G,'sisb11_abs')&&PHONE.answer(H.G,'sisb11_abs_ask',0)==null&&!OUT.get(H.G,'sisb11_abs'));
  fresh('2029-03-20',21,'FAMILIAR'); ph(); PHONE.answer(H.G,'sisb11_abs_ask',0); ph(); const qm=OUT.get(H.G,'sisb11_abs'), n0=th().length; H.at('2029-03-21',13); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); H.at('2029-03-22',9); ph();
  const lm=th()[th().length-1];
  check('1. 回了「有。」沒到：記 missed；3/21 13:15 她一則「沒看到你。我自己讀完了。」（AA_455 3-1 節①，0c5afca90），不扣關係',!!qm&&qm.state==='missed'&&H.G.flags.SIS_ABSTRACT==='missed'&&n0===4&&th().length===n0+1&&!!lm&&lm.text==='沒看到你。我自己讀完了。'&&lm.day===STORY.dayOfKey('2029-03-21')&&Math.abs(lm.h-13.25)<0.02,J({st:qm&&qm.state,f:H.G.flags.SIS_ABSTRACT,n0,n1:th().length,lm}));
  fresh('2029-03-20',18,'FAMILIAR'); { const {r,L}=await ff(T(D('2029-03-21'),7.5),r=>r.why==='msg'&&PHONE.pending(H.G).some(m=>m.ask&&m.ask.id==='sisb11_abs_ask'));
    check('1. 學期中的快轉停在 3/20 21:00 她那則（要回的訊息）',r&&r.why==='msg'&&lbl(now())==='03-20 21:00'&&PHONE.pending(H.G).some(m=>m.ask.id==='sisb11_abs_ask'),J(L)); }
  const none=[]; for(const [nm,lv,fl,dt] of [['和她交往中','FRIEND',{},()=>H.date(ID)],['前任','FRIEND',{},()=>{ H.date(ID); ROM.end(H.G,ID,'test'); }],['不熟（認識）',ACQ,{}],['沒認識她（met_sis 沒有）','FAMILIAR',{met_sis:false}]]){
    fresh('2029-03-20',20,lv,fl); if(dt) dt(); H.at('2029-03-20',21); ph(); if(byTag('sisb11_abs_ask').length) none.push(nm); }
  check('1. 交往中、前任、不熟、沒認識她：沒有那則',!none.length,J(none));
  const yes=[]; for(const [nm,route,dt] of [['和可昕交往中','TW',()=>H.date('kexin')],['日本路線','JP'],['美國路線','US']]){ fresh('2029-03-20',20,'FAMILIAR',{},route); if(dt) dt(); H.at('2029-03-20',21); ph(); if(byTag('sisb11_abs_ask').length===2) yes.push(nm); }
  check('1. 和別人交往中也有；日本、美國路線大四下回來了也有',yes.length===3,J(yes)); });
/* ---- 2 ---- */
await sec(2,async()=>{ fresh('2029-04-16',16,'FAMILIAR'); const r0=relNow(); atDoor('2029-04-16',17+10/60); const ok=await meet([2,1]); const r1=relNow();
  check('2. 4/16（一）17:10 在總圖門口：遇到就演「五月二十九日」；開場照稿；選項一「恭喜。」「緊張嗎？」「那天我去門口等。」',ok===true&&seq(['（總圖門口。她剛從研究小間出來，站在台階上，手機還亮著。）','（看到你）……剛好。','口試日期下來了。五月二十九日，下午四點。'])&&J(H.opts[0])===J(['「恭喜。」','「緊張嗎？」','「那天我去門口等。」']),J({ok,said:said(),opts:H.opts}));
  check('2. 「那天我去門口等。」→「……Kevin 一定會叫大家去。你站後面一點就好。」；椰影大道；「我不確定是不是對的。」→「我碩三才確定。……你比我早一年。」；結尾「五月二十九日。……不用帶東西。」',
    seq(['……Kevin 一定會叫大家去。你站後面一點就好。','（你們沿著椰影大道走了一段。路燈一盞一盞亮起來。）','口試完，就要開始上班了。','你呢。你那條路，走到哪裡了。','我碩三才確定。……你比我早一年。','（走到校門口，她說她要往捷運站。）','五月二十九日。……不用帶東西。'])&&J(H.opts[1])===J(['「還在走。」','「我不確定是不是對的。」'])&&!has('嗯。走就好。')&&H.G.flags.SIS_DEF_DATE==='wait',J(said()));
  check('2. 熟悉 +2、自在 +3、信任 +1；記憶 SIS_DEFENSE_DATE；只演一次',r1.fam-r0.fam===2&&r1.comf-r0.comf===3&&r1.trust-r0.trust===1&&SOCIAL.has(ID,'SIS_DEFENSE_DATE')&&!X().tick(GM),J([r1.fam-r0.fam,r1.comf-r0.comf,r1.trust-r0.trust]));
  for(const [p,line,k] of [[0,'還沒過。恭喜留到那天。','congrats'],[1,'現在不會。前一天晚上會。','nervous']]){ fresh('2029-04-23',16,'FAMILIAR'); atDoor('2029-04-23',17); await meet([p,0]);
    check('2. 選項一 '+(p+1)+' →「'+line+'」；選項二「還在走。」→「嗯。走就好。」；SIS_DEF_DATE '+k,has(line)&&has('嗯。走就好。')&&H.G.flags.SIS_DEF_DATE===k,J(said())); }
  const no=[]; for(const [nm,key,h,x,zone] of [['16:59','2029-04-16',16+59/60],['17:30','2029-04-16',17.5],['週六 4/21','2029-04-21',17.1],['4/13（窗口前）','2029-04-13',17.1],['4/30（窗口後）','2029-04-30',17.1],['離門口 25 m','2029-04-16',17.1,61],['在總圖大廳裡','2029-04-16',17.1,84,'library_hall']]){
    fresh(key,16,'FAMILIAR'); atDoor(key,h,x); if(zone) H.G.zone=zone; if(X().defDue(H.G,E)) no.push(nm); }
  check('2. 17:00 以前、17:30 以後、週末、窗口外、離門口太遠、在總圖裡面：不演',!no.length,J(no));
  const none=[]; for(const [nm,lv,dt] of [['和她交往中','FRIEND',()=>H.date(ID)],['前任','FRIEND',()=>{ H.date(ID); ROM.end(H.G,ID,'test'); }],['不熟',ACQ]]){ fresh('2029-04-16',16,lv); if(dt) dt(); atDoor('2029-04-16',17.1); if(X().defDue(H.G,E)) none.push(nm); }
  fresh('2029-04-16',16,'FAMILIAR'); H.date('kexin'); atDoor('2029-04-16',17.1); const other=X().defDue(H.G,E);
  check('2. 交往中、前任、不熟：不演；和別人交往中：演',!none.length&&other===true,J({none,other}));
  /* 4/18 快轉停一次 */
  fresh('2029-04-17',22,'FAMILIAR'); { const {r,L}=await ff(T(D('2029-04-25'),7.5),r=>r.why==='out'); const q=OUT.due(H.G);
    check('2. 學期中的快轉：停在 4/18 16:45「該出發了」（出遊 sisb11_lib：去總圖門口 17:00）',r&&r.why==='out'&&lbl(now())==='04-18 16:45'&&!!q&&q.id==='sisb11_lib'&&q.goto&&q.goto.zone==='campus',J(L));
    H.said=[]; H.opts=[]; H.picks=[0]; const res=await OUT.prompt(GM,q);
    check('2. 問「去：總圖」／「晚一點（20 分鐘後再提醒）」／「不去了」；去＝17:00 到總圖門口（校園）',J(H.opts[0])===J(['去：總圖','晚一點（20 分鐘後再提醒）','不去了'])&&res==='go'&&H.G.zone==='campus'&&lbl(now())==='04-18 17:00'&&X().defDue(H.G,E),J({opts:H.opts,res,zone:H.G.zone,t:lbl(now())}));
    const ok2=await meet([0,0]); check('2. 到了就演「五月二十九日」',ok2===true&&has('口試日期下來了。五月二十九日，下午四點。')&&evDone('ev_sis_defense_date')); }
  fresh('2029-04-17',22,'FAMILIAR'); H.G.events.done.ev_sis_defense_date=1; H.G.flags.SIS_DEF_DATE='nervous'; { const {r,L}=await ff(T(D('2029-04-19'),7.5),r=>r.why==='out'&&!!OUT.due(H.G)&&OUT.due(H.G).id==='sisb11_lib');
    check('2. 4/16、4/17 已經遇到：4/18 不停、不排',!OUT.get(H.G,'sisb11_lib')&&!L.some(s=>/04-18 16:45/.test(s)),J(L)); }
  fresh('2029-04-18',8,'FAMILIAR'); ph(); const q0=OUT.get(H.G,'sisb11_lib'); atDoor('2029-04-18',17); await meet([0,0]); ph(); const q1=OUT.get(H.G,'sisb11_lib');
  check('2. 4/18 排了以後自己走去先遇到：收掉，不再問',!!q0&&!!q1&&q1.state==='done'&&!OUT.due(H.G),J(q1));
  fresh('2029-04-19',7.5,'FAMILIAR'); { const {L}=await ff(T(D('2029-04-20'),7.5),()=>false); check('2. 4/19 不停（只停 4/18 一次）',!OUT.get(H.G,'sisb11_lib')&&!L.some(s=>/16:45/.test(s)),J(L)); }
  fresh('2029-04-27',20,'FAMILIAR'); ph(); const e0=byTag('sisb11_def_dm').length; H.at('2029-04-27',21); ph(); const dmm=byTag('sisb11_def_dm');
  check('2. 4/27 以前都沒遇到：21:00「口試日期下來了。五月二十九日，下午四點。」（只講資訊，不用回）；SIS_DEF_DATE msg',e0===0&&dmm.length===1&&dmm[0].text==='口試日期下來了。五月二十九日，下午四點。'&&!dmm[0].ask&&dmm[0].h===21&&H.G.flags.SIS_DEF_DATE==='msg'&&!X().defDue(H.G,E),J(dmm));
  fresh('2029-04-26',16,'FAMILIAR'); H.at('2029-04-28',9); ph(); const late=byTag('sisb11_def_dm');
  check('2. 跳過 4/27 晚上：照 4/27 21:00 補進來',late.length===1&&late[0].day===D('2029-04-27')&&late[0].h===21,J(late));
  fresh('2029-04-25',16,'FAMILIAR'); atDoor('2029-04-25',17.2); await meet([0,0]); H.at('2029-04-27',21.5); ph();
  check('2. 遇到過：4/27 不傳',!byTag('sisb11_def_dm').length);
  const none2=[]; for(const [nm,lv,dt] of [['和她交往中','FRIEND',()=>H.date(ID)],['前任','FRIEND',()=>{ H.date(ID); ROM.end(H.G,ID,'test'); }],['不熟',ACQ]]){ fresh('2029-04-17',22,lv); if(dt) dt(); H.at('2029-04-18',9); ph(); H.at('2029-04-27',21.5); ph(); if(OUT.get(H.G,'sisb11_lib')||byTag('sisb11_def_dm').length) none2.push(nm); }
  check('2. 交往中、前任、不熟：4/18 不排、4/27 不傳',!none2.length,J(none2)); });
/* ---- 3 ---- */
await sec(3,async()=>{ const m9=(lv,flags,grp)=>{ fresh('2029-05-28',20,lv,Object.assign({SIS_DEF_DATE:'wait'},flags||{})); if(grp) PHONE.join(H.G,'family_law','法律系家族'); ph(); };
  m9('FAMILIAR'); const e0=byTag('sisb11_m9_dm').length; H.at('2029-05-28',21); ph(); const dmm=byTag('sisb11_m9_dm'), q=OUT.get(H.G,'y4_m9');
  check('3. 選了「那天我去門口等。」、不在家族群組：5/28 21:00「明天四點。……你說要來的。」（21:00 以前沒有）',e0===0&&dmm.length===1&&dmm[0].text==='明天四點。……你說要來的。'&&dmm[0].h===21&&dmm[0].th==='p:'+ID,J(dmm));
  check('3. 排 5/29 16:00 M9 那一趟「學姊的口試」（y4_m9、霖澤館・研究室的走廊、ev_sis_defense）',!!q&&q.day===D('2029-05-29')&&q.h===16&&q.ev==='ev_sis_defense'&&q.title==='學姊的口試'&&q.place==='法律系館A・研究室的走廊'&&q.late===2,J(q));
  H.at('2029-05-29',15.8); await goOut('y4_m9');
  check('3. 去了＝演 M9（「（研究室門口的長椅，門上貼著「口試中」。）」…「過了。」…「等妳。大家都是。」）；SIS_DEFENSE there',seq(['（研究室門口的長椅，門上貼著「口試中」。）','過了。','……你們怎麼都還在？','等妳。大家都是。'])&&H.G.flags.SIS_DEFENSE==='there',J(said()));
  m9('FAMILIAR'); H.at('2029-05-28',21); ph(); H.at('2029-05-29',18.6); ph();
  check('3. 沒到：18:30 記 SIS_DEFENSE missed（同 M9）',H.G.flags.SIS_DEFENSE==='missed');
  m9('FRIEND',{},true); H.at('2029-05-28',21); ph(); const g=(H.G.msgs||[]).filter(x=>x.tag==='y4_m9_grp');
  check('3. 在家族群組：Kevin「學姊明天下午四點口試！大家去門口等！」照舊（M9 排 y4_m9），她不多傳',!byTag('sisb11_m9_dm').length&&g.some(x=>x.text==='學姊明天下午四點口試！大家去門口等！')&&!!OUT.get(H.G,'y4_m9'),J(g.map(x=>x.text)));
  m9('FRIEND',{SIS_DEF_DATE:'congrats'}); H.at('2029-05-28',21); ph();
  check('3. 沒選「那天我去門口等。」：不傳、不排',!byTag('sisb11_m9_dm').length&&!OUT.get(H.G,'y4_m9'));
  m9('FRIEND',{SIS_DEF_DATE:'msg'}); H.at('2029-05-28',21); ph(); check('3. 只收到 4/27 私訊的：不傳',!byTag('sisb11_m9_dm').length);
  m9('FRIEND'); H.date(ID); H.at('2029-05-28',21); ph();
  check('3. 後來和她交往了：不傳這一則（M9 交往版「明天四點口試。……你坐在外面就好。」）',!byTag('sisb11_m9_dm').length&&byTag('y4_m9_dm').some(x=>x.text==='明天四點口試。……你坐在外面就好。'));
  m9('FRIEND'); H.at('2029-05-28',21); ph(); check('3. 朋友（M9 會管的）、不在群組：一樣傳一則、排 y4_m9 一趟',byTag('sisb11_m9_dm').length===1&&OUT.rec(H.G).filter(x=>x.id==='y4_m9').length===1); });
/* ---- 4 ---- */
await sec(4,async()=>{ const errs=[]; const ow=console.warn; console.warn=(...a)=>{ if(/SISB11/.test(String(a[0]))) errs.push(a.map(String).join(' ')); };
  try{ for(const key of ['2029-03-19','2029-03-22','2029-04-15','2029-05-01','2029-05-30','2029-06-10']){ const G=fresh(key,21.5,'FAMILIAR'); delete G.outings; delete G.phone; G.msgs=[]; ph(); X().tick(GM); } } finally { console.warn=ow; }
  check('4. 舊存檔（沒有 outings、phone、新旗標）：照常跑、不丟例外',!!X()&&!errs.length,J(errs));
  check('4. 兩場以外的日子：不傳、不排',!(H.G.msgs||[]).some(m=>/^sisb11_/.test(m.tag||''))&&!OUT.rec(H.G).some(q=>/^sisb11_/.test(q.id))); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
