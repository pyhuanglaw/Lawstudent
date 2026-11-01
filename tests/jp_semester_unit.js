// 日本那一學期（AA_341，AA-C 定稿 c2c5a66e；src/jp3d.js、src/data/jp_events.js）——不需要瀏覽器。照 AA_341 第 4 節 J-S1～S19、第 3 節 G0～G9、第 2 節裁定、第 6 節 JP-A～H 逐項檢查：
//   0. 接線（index.html、STORY.TICKS 之後的 JP.tick、home3d.js 的 JP.homeRound、PHONE_RULES、事件登記）
//   J-S12 出發（挽回中、paused、睡過頭也出發；8/5 以後不出發）→ J-S10 進日本的據點（臺灣的區域、邀約、出遊、回家都關）→ J-S1 日本的學期 → J-S2 一鍵上課（G2、G5）
//   J-S3 快轉、睡覺（停點、日期卡「宿舍」）→ J-S4 以安的作息 → J-S5 據點的選單 → J-S6 台灣大三下不修（課、選課、提示）＋大四下補修 → J-S7／S13 時差
//   J-S8 邀約 → J-S9 8/5 回程（入境大廳、X2、當晚 1A-08）→ J-S11 2/20 以後住臺北的家 → J-S14 該關的 → J-S15 成績單 → J-S16 以安的手機 → J-S17 旗標別名 → J-S18 子晴的電話兩版 → J-S19 8/5 一定停
//   G0～G9（交往中、挽回中兩版）、裁定 3、4、10；JP-A～H。
// 修改前：沒有 src/jp3d.js、src/data/jp_events.js（第 0 項 FAIL，之後用到 JP 的每一項都 FAIL）。不用 JP 也會 FAIL 的（改的是共用檔）：
//   J-S12（y34b3d.js：挽回中 paused／隔天才出發）、J-S6（classes3d.js：日本路線 2/22 照樣排台灣的課、開學提示）、J-S13（group3d.js 哲 4 在當地 23:00、直播 19:00；y34b3d.js 5/20 21:00、6/2 12:00；
//   home3d.js 7/15 10:05；r2y3a3d.js 4/25 21:00）、J-S14（6/11 暑住、7/5 營隊照片、F.abroad）、J-S16（invites3d.js「這學期不在學校」）、J-S18（電話固定《九點以後》）、裁定 4（日本路線沒有 T1、照片從 2/24 起）。
// 2026-10-21 接上開發分支的 AA_326 大三後半（src/r2y3b3d.js，日本的事件都是出遊）、寒暑假快轉（src/holff3d.js）以後加的（修改前 FAIL）：
//   R1 r2y3b 的日本事件在據點：當地時間、must 只有「出發」；R2 裁定 10（8/5 沒有三選一）；R3 8/12 摘要日兩版（AA_345 H3）；R4 家人群組在日本不問；R5 臺灣朋友回訊息的時間；
//   R6 每天的手機小事；R7 holff 朋友回老家的訊息；R8 子晴遊戲展的照片；R9 可昕 K19、學姊 M6 的照片；R10 REPAIR 和 r2y3b 町公所那一步同一個；J-S3／H2 快轉停在要回的訊息、打開手機再接著跳；D103 選單前先開手機。
// AA_355 1-1（2026-10-21）：G7 以安約的那一頓改成 6/9 私訊、6/10 出遊（6 項；修改前 6 項都 FAIL：6/9 沒有私訊、6/16 自動演）。
// jp_room 6（2026-10-22，BB 12:5x）：人在 3D 房間時必接的電話到了要回據點；修改前（開發分支 522dbf6a）FAIL。
// E08（2026-10-27）：3/25 出發先到 3D 出境大廳（airport_dep），玩家按「登機」才演登機口、飛往日本——J-S12、J-S10 在 Y34B.departJP 後面加 EXCH.airBoard（大廳那一段在 tests/e08_airport_unit.js）。
// 用法：node tests/jp_semester_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
let toasts=[]; GM.toast=t=>{ toasts.push(t); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js']) load(f);   /* 照 index.html 的順序（jp3d.js 在 r2y3b3d.js 之後）*/
const hasFiles=fs.existsSync(path.join(H.ROOT,'src/jp3d.js'))&&fs.existsSync(path.join(H.ROOT,'src/data/jp_events.js'));
if(hasFiles){ load('src/data/jp_events.js'); load('src/jp3d.js'); }
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
check('0. src/jp3d.js、src/data/jp_events.js 載入；事件登記；index.html 在 GAME.boot 之前載入；story3d.js 在事件包 TICKS 之後叫 JP.tick；home3d.js 的 loop 叫 JP.homeRound；PHONE_RULES 有 JP',
  hasFiles&&typeof JP!=='undefined'&&Array.isArray(JP_EVENTS)&&JP_EVENTS.length>=13&&JP_EVENTS.every(id=>STORY_EVENTS.some(e=>e.id===id))&&typeof STORY.inJapan==='function'
  &&/src\/data\/jp_events\.js[\s\S]*src\/jp3d\.js[\s\S]*GAME\.boot\(\)/.test(src('index.html'))&&/STORY\.TICKS'[^\n]*\n[^\n]*JP\.tick\(GM\)/.test(src('src/story3d.js'))&&/JP\.homeRound\(GM\)/.test(src('src/home3d.js'))&&STORY.PHONE_RULES.length>0);
if(H.fails){ H.done(); }
const S=JP, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const fresh=(key,h,zone,route,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'JP',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; G.visited={}; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; toasts=[]; caps.length=0; HOME.rec(G); return G; };
const at=(key,h)=>H.at(key,h);
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const has=t=>H.said.some(s=>s.t===t);
const idx=t=>H.said.findIndex(s=>s.t===t);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const run=async id=>{ H.said=[]; H.opts=[]; H.cgs=[]; await EVENTS.run(ev(id)); };
const date=id=>H.date(id);
const repairMode=()=>{ date('heroine_01'); ROM.end(H.G,'heroine_01','test'); };   /* 日本路線的挽回中：交往過、出發前分開（AA_253 第 5 節）*/
const inJapan=(key,h,flags,dating)=>{ const G=fresh(key,h,'jp_hub','JP',Object.assign({X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'},flags||{})); H.FAMILIAR('heroine_01'); if(dating!==false) date('heroine_01'); else repairMode(); return G; };
(async()=>{
  /* ===================== J-S12 出發 ===================== */
  { fresh('2028-03-25',7,'dorm','JP',{X1_JP:D('2028-02-20')}); H.FAMILIAR('heroine_01'); date('heroine_01'); ROM.get(H.G,'heroine_01').status='paused'; H.G.flags.dating_heroine_01=false;
    const a=Y34B.alarms(H.G,D('2028-03-25')).some(x=>x.h===7.5); at('2028-03-25',8); const b=Y34B.sendoffJPDue(H.G); at('2028-03-26',9); const c=Y34B.sendoffJPDue(H.G); at('2028-08-05',9); const d=Y34B.sendoffJPDue(H.G);
    check('J-S12 日本路線 paused（等你說清楚，不是交往中也不是前任）：3/25 一樣出發、前一晚的鬧鐘；3/25 睡過頭＝3/26 醒來也出發；8/5 以後不出發', a&&b&&c&&!d, [a,b,c,d].join()); }
  { fresh('2028-03-25',8,'dorm','JP',{X1_JP:D('2028-02-20')}); H.FAMILIAR('heroine_01'); H.said=[]; await Y34B.departJP(GM); await EXCH.airBoard(GM);   /* E08（10-27）：先到 3D 出境大廳，玩家按「登機」才演登機口、飛往日本 */
    check('J-S12 挽回中（REL_STATE 不是交往中）：「到了再說。」「（座位分開。）」；沒有交往版的句子', has('到了再說。')&&has('（座位分開。）')&&!has('好。走吧。')); }
  /* ===================== J-S10 出發以後進日本的據點 ===================== */
  { const G=fresh('2028-03-25',8,'gongguan','JP',{X1_JP:D('2028-02-20')}); H.FAMILIAR('heroine_01'); date('heroine_01'); H.FAMILIAR('zhe');
    OUT.plan(G,{id:'tw_x',ev:'ev_an_farewell_dinner',day:D('2028-04-02'),h:18,place:'公館',title:'臺灣的約'}); OUT.plan(G,{id:'tw_v',ev:'ev_an_farewell_dinner',day:D('2028-04-02'),h:21,place:'視訊',verb:'接起來',title:'視訊'});
    G.invites=[{id:'iv1',who:'zhe',place:'noodle',day:D('2028-04-01'),h:18,state:'accepted'}]; HOME.rec(G).at=true;
    H.said=[]; H.entered=[]; await Y34B.departJP(GM); await EXCH.airBoard(GM);   /* E08：出境大廳 →「登機」*/
    check('J-S10 出發演完：進日本的據點（jp_hub）、人在日本（STORY.inJapan）、不在臺北的家；JP_DEPARTED、AN_JP_DEPARTED',
      H.entered.includes('jp_hub')&&G.zone==='jp_hub'&&STORY.inJapan(G)&&!HOME.at(G)&&G.flags.JP_DEPARTED===D('2028-03-25')&&G.flags.AN_JP_DEPARTED===G.flags.JP_DEPARTED, JSON.stringify(H.entered));
    check('J-S10 出發以後臺灣的約：出遊不去了（視訊照留）、當面約延後（不算爽約）', OUT.get(G,'tw_x').state==='missed'&&OUT.get(G,'tw_v').state==='planned'&&G.invites[0].state==='postponed');
    check('J-S10 人在日本：不能回臺北的家、不能約臺灣的朋友（按鈕不出現、沒有原因字）、帶到臺灣區域的出遊不排；story3d.js 的 JP.tick 回傳 true（不往下跑臺灣的區域）',
      !HOME.canGo(G)&&!INV.canInvite(G,'zhe')&&INV.whyNot(G,'zhe')===''&&OUT.plan(G,{id:'tw_goto',goto:{zone:'noodle',x:0,z:0},day:G.day+1,h:19,title:'x'})===false&&!OUT.get(G,'tw_goto')
      &&(()=>{ const old=S.loop; S.loop=async()=>{}; const r=S.tick(GM); S.loop=old; return r===true; })());
    check('J-S10 game3d.js 手機「地點」在日本是空的；退宿以後清單沒有宿舍', /JP\.inJapan\(G\)\) return \[\]/.test(src('src/game3d.js'))&&/jpOut&&\(p\[0\]==='dorm'\|\|p\[0\]==='dorm_hall'\)/.test(src('src/game3d.js'))); }
  { const G=inJapan('2028-04-03',10); G.zone='campus'; H.entered=[]; const r=S.tick(GM); await new Promise(res=>setTimeout(res,5));
    check('J-S10 舊存檔（開發分支出發以後還在臺灣的區域）：JP.tick 先帶回日本的據點', r===true&&H.entered.includes('jp_hub')); }
  /* ===================== J-S1 日本的學期 ===================== */
  { const cd=k=>S.classDay(D(k));
    check('J-S1 日本的學期：4/10（一）開學、4/7 還沒；黃金週 4/29、5/3～5/5、海之日 7/17 沒有課；7/21 最後一堂、期末週 7/24 沒有課',
      cd('2028-04-10')&&!cd('2028-04-07')&&!cd('2028-04-29')&&!cd('2028-05-03')&&!cd('2028-05-04')&&!cd('2028-05-05')&&!cd('2028-07-17')&&cd('2028-07-21')&&!cd('2028-07-24')&&cd('2028-05-02')); }
  { const G=inJapan('2028-04-04',10); const h=CLS.todayHTML(G), w=CLS.weekHTML(G);
    check('J-S1 人在日本的手機「今天」「課表」：交換學校的課、日本時間；台灣的清明節不顯示', /交換學校/.test(h)&&/日本時間/.test(h)&&!/清明/.test(h)&&/日本法入門/.test(w)&&/比較行政法/.test(w)&&/日本語（中級）/.test(w)&&/不算學分/.test(w)); }
  /* ===================== J-S2 一鍵上課（G2、G5）===================== */
  { const G=inJapan('2028-04-10',8.5); const c=S.classNow(G); H.picks=['去上課']; H.said=[]; await S.round(GM);
    check('J-S2／G2 4/10 第一堂（日本語（中級）09:00）：選單「去上課：日本語（中級）」；交往中＝「以安在後面小聲說：ほうりつ。」；上到 10:30',
      !!c&&c.c.name==='日本語（中級）'&&H.opts[0].includes('去上課：日本語（中級）')&&has(S.FIRST_LINE.dating)&&Math.abs(G.hour-10.5)<1e-6&&G.jp.n.jp_nihongo===1, JSON.stringify(H.opts[0]));
    at('2028-04-11',10); const c2=S.classNow(G); H.said=[]; await S.attend(GM,c2); at('2028-04-18',10); H.said=[]; await S.attend(GM,S.classNow(G)); const l2=H.said.map(s=>s.t);
    check('J-S2 日本法入門（週二 10:40）：兩句輪流（AA_185 1-5）', c2&&c2.c.id==='jp_law_intro'&&l2[0]==='同學問台灣的民法從哪裡來。你答了很久。'&&G.jp.rot.jp_law_intro===2, JSON.stringify(l2)); }
  { const G=inJapan('2028-04-10',8.9,{},false); H.said=[]; await S.attend(GM,S.classNow(G)); check('G2 挽回中：「……你講到一半忘了「法律」怎麼說，自己想了起來。」', has(S.FIRST_LINE.repair)&&!has(S.FIRST_LINE.dating)); }
  { const G=inJapan('2028-05-18',12.5); G.flags.AN_TOWN_NOTICE='there'; H.picks=['妳的答案呢']; H.said=[]; await S.attend(GM,S.classNow(G));
    check('J-S2／G5 5/18 比較行政法＝以安的報告：「它到底是不是法律？」、教授「下一週大家都要想。」；交往中有 J2＝「五月六號那張通知以後，我一直在想。」；算一次出席',
      has('所以我想問的是：它到底是不是法律？')&&has('（教授沒有回答。他說：「這一題，下一週大家都要想。」）')&&has('還沒有。……五月六號那張通知以後，我一直在想。')&&G.jp.n.jp_comp_admin===1&&G.flags.AN_JP_REPORT===true); }
  { const G=inJapan('2028-05-18',12.5); H.picks=['妳的答案呢']; H.said=[]; await S.attend(GM,S.classNow(G));
    check('G5 交往中、沒有 J2：只說「還沒有。」', has('還沒有。')&&!has('還沒有。……五月六號那張通知以後，我一直在想。')); }
  { const G=inJapan('2028-05-18',12.5,{},false); H.said=[]; H.opts=[]; await S.attend(GM,S.classNow(G));
    check('G5 挽回中：只有報告那一段（沒有下課後的選項）', has('日本的行政指導，沒有強制力。可是大家都照做。')&&!H.opts.some(o=>o.some(t=>/妳的答案呢/.test(t)))); }
  /* ===================== J-S3 快轉、睡覺 ===================== */
  { const G=inJapan('2028-03-25',16); phone(); H.cards=[]; const j1=OUT.get(G,'y3_an_j1'), ff=S.ffOpts(G,'jp'), t1=T(D('2028-03-26'),22)-((j1&&j1.travelH)||0)-0.25;
    check('J-S3 3/25 抵達以後「快轉」：到下一個有事的日子＝3/26 晚上 J1 便利商店（AA_326 2-Y3-34，日本 22:00；停在出發提醒的時間）', !!j1&&j1.h===22&&!!ff&&Math.abs(ff[0].to-t1)<1e-6&&ff.map(x=>x.t).join('|')==='到下一個有事的日子|過三天|過一週|不用了', JSON.stringify([j1&&j1.h,ff&&ff[0]]));
    await S.jump(GM,ff[0].to,'jp'); check('J-S3 跳過去：日期卡寫「宿舍」', G.day===D('2028-03-26')&&Math.abs(T(G.day,G.hour)-t1)<1e-6&&H.cards.some(c=>c[1]==='宿舍')&&OUT.due(G)===j1, JSON.stringify(H.cards));
    j1.state='done'; at('2028-03-26',22.5); await S.jump(GM,T(D('2028-04-10'),8.5),'jp'); check('J-S3 中間有事會先停：3/27 10:00 國際學生辦公室', G.day===D('2028-03-27')&&Math.abs(G.hour-10)<1e-6&&!!S.dueStop(G,'jp')&&S.dueStop(G,'jp').k==='g1_office');
    at('2028-04-09',23); await S.sleep(GM); check('J-S3 睡覺：4/10 有課＝第一堂前一小時 08:00 醒', G.day===D('2028-04-10')&&Math.abs(G.hour-8)<1e-6, G.day+' '+G.hour); }
  const ask=(G,day,h,id)=>PHONE.at(G,day,h,[{th:'p:zhe',from:'zhe',text:'問你',ask:{id,opts:[{t:'好'}]}}],id);
  { const G=inJapan('2028-04-24',8); ask(G,D('2028-04-25'),12,'jp_t_ask'); const why=await S.jump(GM,T(D('2028-05-01'),8.5),'jp',{ff:true});
    check('J-S3／H2 玩家選的快轉：要回的訊息先停（停在收到的那一刻）', why==='msg'&&G.day===D('2028-04-25')&&Math.abs(G.hour-12)<1e-6, why+' '+G.day+' '+G.hour); }
  { const G=inJapan('2028-04-24',8); ask(G,D('2028-04-25'),12,'jp_t_ask2'); const calls=[], pt0=GM.phoneThread; GM.phoneThread=async(th,o)=>{ calls.push([th,!!(o&&o.skip)]); }; await S.ff(GM,T(D('2028-05-01'),8.5),'jp'); GM.phoneThread=pt0;
    check('J-S3／H2 停下來打開手機（那個對話串、「跳過」），關掉以後接著跳到原本選的日子（同 home3d.js，AA_340 6-1）', calls.length===1&&calls[0][0]==='p:zhe'&&calls[0][1]===true&&G.day===D('2028-05-01')&&Math.abs(G.hour-8.5)<1e-6, JSON.stringify([calls,G.day,G.hour])); }
  { const G=inJapan('2028-04-24',23); ask(G,D('2028-04-25'),3,'jp_t_ask3'); await S.sleep(GM);
    check('J-S3 睡覺不會被訊息叫醒（只有玩家選的快轉才停）', G.day===D('2028-04-25')&&G.hour>=8, G.day+' '+G.hour); }
  { const G=inJapan('2028-04-25',12.5); ask(G,G.day,12,'jp_t_ask4'); PHONE.tick(G); let n=0; const pt0=GM.phoneThread; GM.phoneThread=async()=>{ n++; }; const a=await S.askAuto(GM,'jp'), b=await S.askAuto(GM,'jp'); GM.phoneThread=pt0;
    check('D103 據點的選單之前：沒開過的要回的訊息先打開手機（同一則只開一次）', a===true&&b===false&&n===1, [a,b,n].join()); }
  /* ===================== J-S4、G9 以安在日本 ===================== */
  { const G=inJapan('2028-04-11',19); const a=S.anWhere(G); at('2028-04-12',10); const b=S.anWhere(G); at('2028-04-15',14); const c=S.anWhere(G); at('2028-04-15',20); const d=S.anWhere(G); at('2028-04-11',19); const w=STORY.whereIs(GM,'heroine_01');
    check('J-S4／G9 交往中：週二晚上「宿舍（你那邊）」、平日白天「學校」、週末下午「河邊」、其他「她的房間」；手機「現在大概在」照這個', a==='宿舍（你那邊）'&&b==='學校'&&c==='河邊'&&d==='她的房間'&&w&&w.away==='宿舍（你那邊）', [a,b,c,d,w&&w.away].join()); }
  { const G=inJapan('2028-04-11',19,{},false); check('J-S4 挽回中：週二晚上不在你那邊（她的房間）', S.anWhere(G)==='她的房間'); }
  { const G=inJapan('2028-04-12',12); INV.addContact(G,'heroine_01'); const L=[]; for(let i=0;i<5;i++){ const e=MSG.pick(G,'heroine_01','chat'); L.push(e&&e.msgs[0]); }
    check('G9 問以安「在哪？」（交往中）：四句輪流（「學校。剛下課。」…「投幣洗衣機前面。還有十二分鐘。」）；不再回「在總圖。」「在台中。」', JSON.stringify(L)===JSON.stringify(S.G9.concat([S.G9[0]]))&&!L.includes('在總圖。'), JSON.stringify(L)); }
  { const G=inJapan('2028-04-12',12,{},false); const L=[]; for(let i=0;i<3;i++){ const e=MSG.pick(G,'heroine_01','chat'); L.push(e&&e.msgs[0]); } check('G9 挽回中：只回前兩句', JSON.stringify(L)===JSON.stringify([S.G9[0],S.G9[1],S.G9[0]]), JSON.stringify(L)); }
  /* ===================== J-S5 據點的選單 ===================== */
  { const G=inJapan('2028-04-13',12.5); H.picks=['不用了']; H.opts=[]; H.picks=['在房間休息一下']; await S.round(GM); const o=H.opts[0]||[];
    check('J-S5 據點的選單：去上課（一鍵）、共用廚房、便利商店、河邊、看手機、在房間休息一下、快轉、存檔、睡覺；沒有回宿舍、沒有臺灣的地點',
      o.includes('去上課：比較行政法')&&['共用廚房','便利商店','河邊','看手機','在房間休息一下','快轉','存檔','睡覺'].every(t=>o.includes(t))&&!o.some(t=>/回宿舍|公館|校園/.test(t))&&Math.abs(G.hour-13.5)<1e-6, JSON.stringify(o)); }
  { const G=inJapan('2028-04-20',15,{},false); H.picks=['共用廚房']; H.said=[]; await S.round(GM);
    check('J-S5／G3 挽回中去共用廚房：字幕「宿舍・共用廚房」、「看」＝「（流理台上有人留了一張紙條：鍋子用完請洗。是中文寫的。）」；回到房間', caps.includes('宿舍・共用廚房')&&has('（流理台上有人留了一張紙條：鍋子用完請洗。是中文寫的。）')&&S.place(G)==='room'); }
  /* ===================== J-S6 台灣的大三下（＋大四下補修）===================== */
  { const G=fresh('2028-02-22',8,'jp_x','JP',{X1_JP:D('2028-02-20')}); const a=CLS.dayItems(G,D('2028-02-22')).length, b=CLS.termCourses(G,'Y3S2').length; const g2=fresh('2028-02-22',8,'dorm','TW'); const c=CLS.dayItems(g2,D('2028-02-22')).length;
    check('J-S6 日本路線：2/22（大三下第 1 週，人還在臺灣）不排台灣的課、大三下沒有修課；台灣路線照排', a===0&&b===0&&c>0, [a,b,c].join()); }
  { const G=fresh('2028-02-21',7,'dorm','JP',{X1_JP:D('2028-02-20')}); toasts=[]; await CLS.morning(GM); const t1=toasts.slice(); fresh('2028-02-21',7,'dorm','TW'); toasts=[]; await CLS.morning(GM);
    check('J-S6／JP-H 日本路線大三下第 1 週：不跳「大三下開學了」；台灣路線照跳', !t1.some(t=>/大三下開學了/.test(t))&&toasts.some(t=>/大三下開學了/.test(t)), JSON.stringify(t1)); }
  { const G=fresh('2028-04-10',7,'dorm','JP',{X1_JP:D('2028-02-20')}); toasts=[]; await CLS.morning(GM); check('J-S6／J-S14 日本路線：不跳台灣的期中考週提示', !toasts.some(t=>/期中考週/.test(t)), JSON.stringify(toasts)); }
  { const G=fresh('2029-02-19',7,'dorm','JP'); const L=CLS.termCourses(G,'Y4S2'), cv=L.find(c=>c.id==='civpro_2_re'), ins=L.find(c=>c.id==='insurance_re'); CLS.legalCourses&&CLS.legalCourses(G); const g2=fresh('2029-02-19',7,'dorm','TW');
    check('J-S6 大四下補修（AA_144 X4）：日本路線多民事訴訟法甲下（週一上午）、保險法（週四上午，不撞海商法），重播大三下的 syllabus；台灣路線沒有',
      !!cv&&!!ins&&cv.slots[0].wd===1&&ins.slots[0].wd===4&&!CLS.termCourses(g2,'Y4S2').some(c=>/_re$/.test(c.id))&&(!SYLLABUS.courses.civpro_2||cv.syllabus===SYLLABUS.courses.civpro_2), [!!cv,!!ins].join()); }
  /* ===================== J-S7／J-S13 時差 ===================== */
  { const G=inJapan('2028-04-28',20); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('zhe'); at('2028-04-28',21); phone(); const a=th('g:noodle_team').includes('明天晚上七點，冠軍賽 來喊'); at('2028-04-28',22); phone(); const b=th('g:noodle_team').includes('明天晚上七點，冠軍賽 來喊');
    at('2028-04-28',23); phone(); const c=!!OUT.get(G,'y3_zhe4'); at('2028-04-29',0); phone(); const q=OUT.get(G,'y3_zhe4');
    check('J-S13 group3d.js 日本路線：4/28 群組「冠軍賽」當地 22:00（台灣 21:00）；哲 4 的視訊當地 0:00（台灣 23:00），不是當地 23:00', !a&&b&&!c&&!!q&&q.day===D('2028-04-28')&&q.h>=24&&q.place==='視訊', [a,b,c,q&&q.h].join());
    at('2028-04-29',19.5); phone(); const s1=GROUP.streamDue(G); at('2028-04-29',20); phone(); const s2=GROUP.streamDue(G);
    check('J-S13 冠軍賽直播的旁白「日本晚上八點」：當地 19:30 還沒、20:00 才演', !s1&&s2, [s1,s2].join()); }
  { const G=inJapan('2028-05-20',21); H.FAMILIAR('heroine_04'); const a=Y34B.zqCallDue(G); at('2028-05-20',22); const b=Y34B.zqCallDue(G);
    check('J-S13 子晴的電話（5/20）：台灣 21:00＝當地 22:00', !a&&b, [a,b].join()); }
  { const G=inJapan('2028-06-02',12); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); phone(); const a=th('g:family_law').includes('學姊今天生日！'); at('2028-06-02',13); phone(); const b=th('g:family_law').includes('學姊今天生日！');
    check('J-S13 6/2 家族群組「學姊今天生日！」：當地 13:00（台灣 12:00）', !a&&b, [a,b].join()); }
  { const G=inJapan('2028-07-15',10.5); PHONE.join(G,'noodle_team','麵店團'); phone(); const a=th('g:noodle_team').includes('我又二樓'); at('2028-07-15',11.1); phone(); const b=th('g:noodle_team').includes('我又二樓');
    check('J-S13 7/15 阿哲的抽籤群組：當地 11:05（台灣 10:05）', !a&&b, [a,b].join()); }
  { const G=inJapan('2028-04-25',21.5); date('kexin'); phone(); const a=th('p:kexin').includes('讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。'); at('2028-04-25',22); phone(); const b=th('p:kexin').includes('讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。'); const q=OUT.get(G,'y3_k17_jrv');
    check('J-S7 可昕 K17（日本路線）：台灣 21:00＝當地 22:00；視訊台灣 19:30＝當地 20:30', !a&&b&&!!q&&Math.abs(q.h-20.5)<1e-6, [a,b,q&&q.h].join()); }
  /* ===================== J-S8 在日本約台灣的朋友 ===================== */
  { const G=inJapan('2028-04-20',12); H.FRIEND('zhe'); INV.addContact(G,'zhe'); check('J-S8 人在日本：台灣朋友沒有「約」（canInvite false、沒有原因字）', !INV.canInvite(G,'zhe')&&INV.whyNot(G,'zhe')===''); }
  /* ===================== J-S9／J-S19 8/5 回程 ===================== */
  { const G=inJapan('2028-08-04',23); S.rec(G).done.g8_konbini=G.day; H.cards=[]; await S.sleep(GM);
    check('J-S19 8/4 晚上睡覺：8/5 早上停（回程），不會睡過去', G.day===D('2028-08-05')&&Math.abs(G.hour-8)<1e-6&&S.returnDue(G), G.day+' '+G.hour);
    H.said=[]; H.cards=[]; H.entered=[]; await S.returnHome(GM); const ci=H.cards.findIndex(c=>c[0]==='抵達');
    check('J-S9 回程：字卡「飛回臺灣」「抵達」（臺灣時間 13:00 以後）；入境大廳「（自動門一打開，臺灣的熱氣撲過來。）」「……好熱。」「明天有空的話，打給我。」「（她媽媽在出口等。……）」',
      H.cards.some(c=>c[0]==='飛回臺灣')&&ci>=0&&has('（自動門一打開，臺灣的熱氣撲過來。）')&&has('……好熱。')&&has('明天有空的話，打給我。')&&has('（她媽媽在出口等。她跑過去，又回頭跟你揮手。）')&&G.flags.JP_RETURNED===D('2028-08-05')&&!STORY.inJapan(G), JSON.stringify(H.cards));
    check('J-S9 回臺北的家（AA_144 X2）：「你回來了。媽媽把你的房間打掃過，桌上多了一盒你小時候的模型。」；在家', has('你回來了。媽媽把你的房間打掃過，桌上多了一盒你小時候的模型。')&&HOME.at(G)&&idx('你回來了。媽媽把你的房間打掃過，桌上多了一盒你小時候的模型。')>idx('……好熱。'));
    at('2028-08-05',19); const ff=S.ffOpts(G,'home'); check('J-S9／裁定 10 回來的那晚：快轉停在 20:00（1A-08「大四要怎麼過？」在家演）；沒有大三暑假三選一', !!ff&&ff[0].to===T(D('2028-08-05'),20)&&(at('2028-08-05',20),STORY.y4HomeDue(G)==='stay'), JSON.stringify(ff&&ff[0])); }
  { const G=inJapan('2028-08-05',8,{},false); H.said=[]; await S.returnHome(GM); check('J-S9 挽回不成：入境大廳只有旁白「（你們同一班飛機回來。她坐在前面幾排，下飛機的時候，你看見她先走了。）」', has('（你們同一班飛機回來。她坐在前面幾排，下飛機的時候，你看見她先走了。）')&&!has('……好熱。')); }
  /* BUG-HOME-REST-NOCAP-1027（BB-C 10-27）：凌晨 2:30 以後日本據點、日本路線住臺北的家都不出一小時的「休息一下」（只剩睡覺） */
  { const G=inJapan('2028-04-13',27); H.opts=[]; H.picks=['睡覺']; await S.round(GM); const o=H.opts[0]||[];
    check('J-REST 日本據點凌晨 3:00：沒有一小時的「在房間休息一下」（有 3D 房間的走進房間照舊）、有「睡覺」',!o.some(t=>t==='在房間休息一下')||S.hasRoom3d(),JSON.stringify(o)); }
  { const menuAt=async h=>{ const G=fresh('2028-02-22',h,'jp_x','JP',{X1_JP:D('2028-02-20')}); HOME.rec(G).at=true; H.opts=[]; H.picks=['睡覺']; await S.homeRound(GM); return H.opts[0]||[]; };
    const o26=await menuAt(26), o266=await menuAt(26.6);
    check('J-REST 住臺北的家：凌晨 2:00 有「在家休息一下」；2:36 以後沒有（不出選單或只剩睡覺）',o26.includes('在家休息一下')&&!o266.includes('在家休息一下'),JSON.stringify({o26,o266})); }
  /* ===================== J-S11 住臺北的家（2/20 退宿以後）===================== */
  { const G=fresh('2028-02-22',10,'jp_x','JP',{X1_JP:D('2028-02-20')}); HOME.rec(G).at=true; H.opts=[]; H.picks=['在家休息一下']; await S.homeRound(GM); const o=H.opts[0]||[];
    check('J-S11 2/22 住臺北的家：選單沒有「回宿舍」、有「出門」「快轉」；平日也能回家（canGo）、從家裡出發（livesHome）', S.homeOn(G)&&o.includes('出門')&&o.includes('快轉')&&!o.some(t=>/回宿舍/.test(t))&&HOME.canGo(G)&&HOME.livesHome(G), JSON.stringify(o));
    H.picks=['出門','公館商圈']; H.entered=[]; HOME.rec(G).at=true; await S.homeRound(GM); check('J-S11 出門 → 公館商圈（捷運＋公車）', H.entered.includes('gongguan')&&!HOME.at(G));
    check('J-S11 story3d.js：退宿以後校園的宿舍入口進不去（JP.movedOut）', /JP\.movedOut&&JP\.movedOut\(G\)\)\)\) for\(const it of E\.interactables\)/.test(src('src/story3d.js'))); }
  { const G=fresh('2028-02-22',10,'campus','JP'); phone(); check('J-S11 舊存檔：2/20 退宿那一場沒演到、2/21 以後才讀檔＝直接記退宿（不演），之後住家裡', G.flags.X1_JP===D('2028-02-22')&&G.flags.X1_JP_LATE===true&&S.homeOn(G)); }
  /* ===================== J-S14 該關的 ===================== */
  { const G=inJapan('2028-04-20',18); G.flags.noodleTableDay=D('2027-09-07'); G.flags.ndlTrack0=D('2027-09-07'); G.flags.ndlDays=[]; phone();
    check('J-S14 人在日本：F.abroad（麵店團阿哲的「麵店。我揪了。」不發）', G.flags.abroad===true&&!(G.msgs||[]).some(m=>m.th==='g:noodle_team'&&/^rt_zhe_ndl_/.test(m.tag||''))&&!th('g:noodle_team').some(t=>/^麵店[。 ]/.test(t))); }
  { const G=inJapan('2028-06-11',12.5); phone(); const tw=fresh('2028-06-11',12.5,'dorm','TW'); phone();
    check('J-S14 6/11 暑住的問題：日本路線不問、台灣路線照問', !(G.msgs||[]).some(m=>/暑假住宿/.test(m.text))&&(tw.msgs||[]).some(m=>/暑假住宿/.test(m.text))); }
  { const G=inJapan('2028-07-05',21.5); PHONE.join(G,'law_class','法律系'); phone(); const tw=fresh('2028-07-05',21.5,'dorm','TW'); PHONE.join(tw,'law_class','法律系'); phone();
    check('J-S14 7/5 系學會營隊的大合照：日本路線不發、台灣路線照發', !(G.msgs||[]).some(m=>/營隊的大合照/.test(m.text))&&(tw.msgs||[]).some(m=>/營隊的大合照/.test(m.text))); }
  /* ===================== J-S15 成績單 ===================== */
  { const G=inJapan('2028-08-05',8); S.rec(G).n={jp_nihongo:30,jp_law_intro:12,jp_comp_admin:6}; await S.returnHome(GM); at('2028-08-06',8.5); H.said=[]; await CLS.morning(GM); const L=H.said.map(s=>s.t).join('｜');
    check('J-S15 回來以後發大三下的成績：只有日本的兩門（日本法入門、比較行政法），日本語不算；沒有「缺考」、沒有台灣的課', /大三下的成績出來了/.test(L)&&/日本法入門（英語授課）：很好/.test(L)&&/比較行政法：不錯/.test(L)&&!/日本語/.test(L)&&!/缺考/.test(L)&&!/民事訴訟法/.test(L), L); }
  { const G=inJapan('2028-07-03',8); H.said=[]; check('J-S15 在日本的時候不發（jp3d 的據點不叫 CLS.morning；6/26 公布日那時人在日本）', !G.courses||!G.courses.grades||!G.courses.grades.Y3S2); }
  /* ===================== J-S16 以安的婉拒句 ===================== */
  { const G=fresh('2028-04-20',12,'campus','TW'); H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01'); check('J-S16 台灣路線約在日本的以安：「她這學期在國外。」', INV.whyNot(G,'heroine_01')==='她這學期在國外。', INV.whyNot(G,'heroine_01')); }
  /* ===================== J-S17 旗標別名 ===================== */
  { const G=fresh('2028-03-26',10,'campus','TW'); phone(); check('J-S17 以安 3/25 出發以後（所有路線）：AN_JP_DEPARTED（階梯 A6 的 skipIf 讀這個）', G.flags.AN_JP_DEPARTED===D('2028-03-25')); }
  /* ===================== J-S18 子晴的電話（AA_360 第 1 節：「依 ZQ_Q12 分兩版」作廢——發表哪一個她自己決定，一律《九點以後》）===================== */
  { const G=inJapan('2028-05-20',22); H.FAMILIAR('heroine_04'); G.flags.ZQ_Q10='nameless'; H.said=[]; await Y34B.zqCall(GM); const a=has('他打了五次。第五次過了。……我在後面笑到不行。');
    const G2=inJapan('2028-05-20',22); H.FAMILIAR('heroine_04'); G2.flags.ZQ_Q10='cat'; H.said=[]; await Y34B.zqCall(GM); const b=has('他打了五次。第五次過了。……我在後面笑到不行。')&&!has('下一個做完，你來測。')&&!has('下一個做完，第一個給你玩。');
    check('J-S18 5/20 子晴的電話一律《九點以後》＝「他打了五次……」（AA_360 第 1 節；Q10 選「交貓。貓很好。」的也一樣、沒有貓那一句）', a&&b&&G.flags.ZQ_Q12==='nine'&&G2.flags.ZQ_Q12==='nine'&&G2.flags.WATCHED_SHOW_ONLINE===true, [a,b].join()); }
  /* ===================== G0 出發前 ===================== */
  { fresh('2028-02-24',17,'gongguan','JP',{X1_JP:D('2028-02-20')}); H.FRIEND('heroine_03'); E.player.obj.position.x=-63; E.player.obj.position.z=22; H.picks=['我三月底才出發']; await run('ev_yt_thursday_first');
    check('G0／裁定 4／JP-C 2/24 語彤的週四（日本路線）：「你下個月才走。」；選項「我三月底才出發。」→「嗯。那剛好。」', Y34B.t1FirstDue(H.G,E)===false&&has('你下個月才走。')&&H.opts[0].includes('「我三月底才出發。」')&&!H.opts[0].includes('「我沒交志願表。」')&&has('嗯。那剛好。')&&!has('你沒去交換。'));
    at('2028-03-23',17); const a=Y34B.t1On(H.G); at('2028-03-30',17); const b=Y34B.t1On(H.G); check('裁定 4 日本路線的週四到 3/23；3/25 以後沒有', a&&!b); }
  { const G=fresh('2028-03-30',21,'jp_hub','JP',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25')}); H.FRIEND('heroine_03'); at('2028-03-30',21.5); phone(); const a=th('p:heroine_03').length; at('2028-03-30',22); phone(); const b=th('p:heroine_03').slice();
    const g2=fresh('2028-02-24',21,'dorm','JP',{X1_JP:D('2028-02-20')}); H.FRIEND('heroine_03'); phone(); const c=(g2.msgs||[]).filter(m=>m.th==='p:heroine_03'&&/^📷/.test(m.text)).length;
    check('裁定 4 3/30 起每週四一張田野照片（台灣 21:00＝日本 22:00，第一張是水源市場）；2/24 在臺灣沒有照片', a===0&&JSON.stringify(b)===JSON.stringify([Y34B.YT_JP[0]])&&c===0, JSON.stringify([a,b,c])); }
  { const G=fresh('2028-03-10',20,'jp_x','JP',{X1_JP:D('2028-02-20')}); H.FAMILIAR('heroine_01'); date('heroine_01'); at('2028-03-10',21); phone(); const q=OUT.get(G,'jp_g0_bag');
    check('G0 3/10 21:00 以安私訊「行李箱，明天一起去買？……我的輪子壞了一個。」→ 出遊 3/11 14:00 公館', th('p:heroine_01').includes('行李箱，明天一起去買？……我的輪子壞了一個。')&&!!q&&q.day===D('2028-03-11')&&q.h===14&&q.place==='公館');
    at('2028-03-11',13.5); H.picks=[0]; H.said=[]; H.opts=[]; await OUT.go(GM,q,{fromHome:true});
    check('G0 3/11 行李箱：「這個比較安靜。公寓的走廊晚上會有回音。」（AA_377 第 4 項：她租公寓）；「那我也買這個。」→「好。……兩個一樣的，在機場不要拿錯。」', has('（行李箱的店。她把每一個都推了一圈，聽輪子的聲音。）')&&has('這個比較安靜。公寓的走廊晚上會有回音。')&&has('好。……兩個一樣的，在機場不要拿錯。')&&H.opts[0].join('|')==='「那我也買這個。」|「妳連這個都查了？」'); }
  { const G=fresh('2028-03-10',21,'jp_x','JP',{X1_JP:D('2028-02-20')}); H.FAMILIAR('heroine_01'); repairMode(); phone(); check('G0 挽回中：沒有行李箱', !th('p:heroine_01').length&&!OUT.get(G,'jp_g0_bag')); }
  { const G=fresh('2028-02-26',20,'jp_x','JP',{X1_JP:D('2028-02-20')}); HOME.rec(G).at=true; const ff=S.ffOpts(G,'home'); await S.ff(GM,ff[0].to,'home');   /* X58（10-27）：途中收到訊息會先停、打開手機——照玩家的快轉（S.ff，「跳過」接著跳），不直接叫 S.jump */ const st=S.dueStop(G,'home'); H.said=[]; if(st) await S.playStop(GM,st,'home');
    check('G0 摘要日（住家裡快轉）：2/27 18:30「（不用上課的第一週。你每天早上還是七點醒。）」', G.day===D('2028-02-27')&&has('（不用上課的第一週。你每天早上還是七點醒。）'), G.day+' '+G.hour);
    const sums=S.SCH.filter(s=>/^g0_s/.test(s.k)).map(s=>s.d+'|'+s.sum); check('G0 四句摘要日照順序：2/27、3/6、3/13、3/20', sums.join('\n')==='2028-02-27|（不用上課的第一週。你每天早上還是七點醒。）\n2028-03-06|（你把日文課本的第一課念了五遍。）\n2028-03-13|（媽媽問你日本的冬天冷不冷。你說三月底就不冷了。她還是買了一件外套。）\n2028-03-20|（行李箱打開在房間地上，一個禮拜都沒有闔上。）'); }
  /* ===================== G1 剛到 ===================== */
  { const G=inJapan('2028-03-27',10); const st=S.dueStop(G,'jp'); H.said=[]; await S.playStop(GM,st,'jp');
    check('G1 3/27 10:00 國際學生辦公室（交往中）：「……你只聽懂「宿舍」。」＋「（以安在旁邊小聲翻譯。……）」；加入交換生群組', has('（國際學生辦公室。你們排在一列交換生的最後面。輪到你的時候，職員用很慢的日文說了一句話，你只聽懂「宿舍」。）')&&has('（以安在旁邊小聲翻譯。翻完她說：「我也只聽懂一半。剩下一半是猜的。」）')&&PHONE.inGroup(G,'jp_exchange')&&caps.includes('國際學生辦公室')); }
  { const G=inJapan('2028-03-27',10,{},false); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp'); check('G1 挽回中：「（以安排在你前面兩個人。她辦完，沒有回頭。）」', has('（以安排在你前面兩個人。她辦完，沒有回頭。）')&&!has('（以安在旁邊小聲翻譯。翻完她說：「我也只聽懂一半。剩下一半是猜的。」）')); }
  { const G=inJapan('2028-03-28',18.5); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp'); check('G1 3/28 摘要日（AA_377 第 17 項：3/25 就入住）', has('（住了三天，房間還是覺得小。窗外是一片田，遠一點的地方有一座山。）')); }
  /* ===================== G3 共用廚房 ===================== */
  { const G=inJapan('2028-04-19',17); phone(); const m=th('p:heroine_01').includes('今天去你那邊的廚房。我買了菜。'); at('2028-04-19',18.5); const st=S.dueStop(G,'jp'); H.picks=['跟妳媽做的比呢']; H.said=[]; await S.playStop(GM,st,'jp');
    check('G3 4/19 17:00 以安私訊、18:30 共用廚房：「寒假我媽教我的那一道。」「……第一次一個人做。」；「跟妳媽做的比呢？」→「我媽的比較鹹。……我的比較對。」＋（她自己笑了一下。）', m&&st&&st.k==='g3_kitchen'&&has('寒假我媽教我的那一道。')&&has('……第一次一個人做。')&&has('我媽的比較鹹。……我的比較對。')&&has('（她自己笑了一下。）')); }
  { const G=inJapan('2028-04-19',18.5); SOCIAL.remember('heroine_01','AN_L10_WINTER',''); H.picks=['好吃']; H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G3 有 AN_L10_WINTER：第二句換「寒假我媽教的那一道。你那時候問過。」；「好吃。」→「……哪裡好吃？」→（你說了一個地方。……）（AA_435 第 0 節）', has('寒假我媽教的那一道。你那時候問過。')&&!has('寒假我媽教我的那一道。')&&has('……哪裡好吃？')&&has('（你說了一個地方。她點點頭，記在手帳上。）')&&!has('理由？')); }
  { const G=inJapan('2028-04-19',18.5,{},false); phone(); check('G3 挽回中：沒有私訊、沒有這一場', !th('p:heroine_01').length&&!S.dueStop(G,'jp')); }
  /* ===================== G4 黃金週 ===================== */
  { const G=inJapan('2028-05-02',21); phone(); const m=th('p:heroine_01').includes('黃金週，哪裡都是人。……明天去河邊就好。'); at('2028-05-03',14); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G4 5/2 21:00 私訊、5/3 14:00 河邊：「你讀你的。我讀我的。」→（一個小時以後，她把書闔上。）「……這裡比總圖吵。可是我讀得比較快。」', m&&has('你讀你的。我讀我的。')&&idx('（一個小時以後，她把書闔上。）')<idx('……這裡比總圖吵。可是我讀得比較快。')&&idx('（一個小時以後，她把書闔上。）')>0); }
  { const G=inJapan('2028-05-03',18.5,{},false); H.said=[]; const st=S.dueStop(G,'jp'); await S.playStop(GM,st,'jp'); check('G4 挽回中：5/3 摘要日「（黃金週。電車上都是人。你在宿舍讀了一整天。）」', st&&st.k==='g4_s'&&has('（黃金週。電車上都是人。你在宿舍讀了一整天。）')); }
  /* ===================== G6 梅雨 ===================== */
  { const G=inJapan('2028-06-07',21.5); phone(); check('G6 6/7 21:30 以安兩則（交往中）', JSON.stringify(th('p:heroine_01').slice(-2))===JSON.stringify(['梅雨開始了。','投幣洗衣機前面排了四個人。……我在讀行政法。'])); }
  { const G=inJapan('2028-06-07',21.5,{},false); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp'); check('G6／L7 挽回中：旁白加括號「（交換生群組有人傳『梅雨開始了』，以安按了一個讚。）」（AA_349 L7）', has('（交換生群組有人傳『梅雨開始了』，以安按了一個讚。）')&&!has('交換生群組有人傳「梅雨開始了」，以安按了一個讚')); }
  /* ===================== G7 ===================== */
  /* AA_355 1-1（2026-10-21）：以安約的那一頓＝6/9（五）21:00（日本時間）她私訊；「好。」＝6/10（六）18:30 出遊（地點字幕「日本・學校後面的小餐館」、深色底），接 AA_250 6-2 那三句；
     「那天不行。」＝她回「好。」、不補；交往中或和她 FRIEND 以上。原本 AA_341 G7 的 6/16（五）19:00 自動演那一場拿掉（修改前：6/9 沒有私訊、6/16 自動演）*/
  /* AA_355 第 5 節（AA-C 2026-10-21 2f1aaa22）：4b「臺大今天考完了」差一天＝「今天」改「昨天」（台大 6/9 考完，她 6/10 說）；4c 挽回中、冷靜中不約；1-1 走路約 10 分鐘 */
  const DINNER3=['首都帝大昨天考完了。Alison 在群組說她要睡三天。','我們這邊七月底才考，還有一個多月。','八月五號那班，我跟你一起訂好了。'];
  { const G=inJapan('2028-06-09',20.5); phone(); const n0=th('p:heroine_01').length; at('2028-06-09',21); phone(); const L=th('p:heroine_01').slice(n0), m=(G.msgs||[]).filter(x=>x.th==='p:heroine_01').slice(-1)[0];
    check('G7／AA_355 1-1 6/9（五）21:00（日本時間）以安私訊：「週六晚上有空嗎。」「學校後面那家小餐館，六點半。我訂了兩個人。」；回「好。」／「那天不行。」（20:30 還沒有）', n0===0&&JSON.stringify(L)===JSON.stringify(['週六晚上有空嗎。','學校後面那家小餐館，六點半。我訂了兩個人。'])&&!!m&&!!m.ask&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['好。','那天不行。']), JSON.stringify(L));
    PHONE.answer(G,'jp_g7_dinner_ask',0); phone(); const q=OUT.get(G,'jp_g7_dinner');
    check('G7／AA_355 1-1 回「好。」：排出遊 6/10（六）18:30「日本・學校後面的小餐館」（ev_jp_dinner）', !!q&&q.state==='planned'&&q.day===D('2028-06-10')&&q.h===18.5&&q.ev==='ev_jp_dinner'&&q.place==='日本・學校後面的小餐館', JSON.stringify(q));
    check('G7／AA_355 第 5 節 1-1：學校後面的小餐館走路約 10 分鐘（字幕「走路約 10 分鐘」）', !!q&&q.travel==='走路約 10 分鐘'&&Math.abs(q.travelH-1/6)<1e-9, JSON.stringify(q&&[q.travel,q.travelH]));
    at('2028-06-10',18.25); H.said=[]; H.bgs=[]; const logs=[], log0=ADV.log; ADV.log=(a,b)=>{ logs.push(b); }; if(q) await OUT.go(GM,q); ADV.log=log0;
    check('G7／AA_355 1-1 6/10 那一頓：地點字幕「日本・學校後面的小餐館」、深色底（不是商店街 jp_street_night）；AA_250 6-2 三句照抄；AN_JP_DINNER', DINNER3.every(has)&&logs.includes('日本・學校後面的小餐館')&&H.bgs.length>0&&H.bgs.every(b=>b==='dark')&&G.flags.AN_JP_DINNER===true&&!!q&&q.state==='done', JSON.stringify([logs,H.bgs]));
    at('2028-06-16',19); H.said=[]; const st=S.dueStop(G,'jp'); if(st) await S.playStop(GM,st,'jp');
    check('G7／AA_355 1-1 6/16 19:00 不再自動演那一頓（AA_341 G7 那一場拿掉）', (!st||st.k!=='g7_dinner')&&!DINNER3.some(has)&&!S.SCH.some(s=>s.k==='g7_dinner'), st&&st.k); }
  { const G=inJapan('2028-06-09',21); phone(); PHONE.answer(G,'jp_g7_dinner_ask',1); phone(); at('2028-06-16',19); H.said=[]; const st=S.dueStop(G,'jp'); if(st) await S.playStop(GM,st,'jp');
    check('G7／AA_355 1-1 回「那天不行。」：她回「好。」、不排出遊、之後不補（6/16 也沒有）', JSON.stringify(th('p:heroine_01').slice(-3))===JSON.stringify(['學校後面那家小餐館，六點半。我訂了兩個人。','那天不行。','好。'])&&G.flags.AN_JP_DINNER_ASK==='no'&&!OUT.get(G,'jp_g7_dinner')&&!DINNER3.some(has), JSON.stringify(th('p:heroine_01').slice(-3))); }
  { const G=inJapan('2028-06-09',21,{},false); H.FRIEND('heroine_01'); phone(); const a=th('p:heroine_01').includes('週六晚上有空嗎。');
    const G2=inJapan('2028-06-09',21,{},false); phone(); const b=th('p:heroine_01').includes('週六晚上有空嗎。');
    const G3=fresh('2028-06-09',21,'jp_hub','JP',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'}); H.FRIEND('heroine_01'); date('heroine_01'); ROM.get(G3,'heroine_01').status='paused'; G3.flags.dating_heroine_01=false; phone(); const c=th('p:heroine_01').includes('週六晚上有空嗎。');
    const G4=fresh('2028-06-09',21,'jp_hub','JP',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'}); H.FRIEND('heroine_01'); phone(); const d=th('p:heroine_01').includes('週六晚上有空嗎。');
    check('G7／AA_355 第 5 節 4c：挽回中（分手以後，和以安 FRIEND 以上）、冷靜中（對質後「等你說清楚」paused）都不約；沒交往過、FRIEND 以上照舊收到；只有 FAMILIAR（挽回中）：沒有', !a&&!b&&!c&&d, [a,b,c,d].join()); }
  { const G=inJapan('2028-06-24',16,{REPAIR:{heroine_01:2}},false); H.picks=['對不起']; H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G7 6/24 16:00 挽回第 4 步（河邊）：「那時候我很生氣……」「……現在可以聽了。你說。」；「對不起。……」→「……嗯。你那時候應該要說的。」REPAIR +1', has('那時候我很生氣，生氣到不想聽你講。')&&has('……現在可以聽了。你說。')&&has('……嗯。你那時候應該要說的。')&&G.flags.REPAIR.heroine_01===3);
    at('2028-06-24',16); G.jp.done={}; S.repair(G); check('挽回：一週最多 +1（AA_254 第 10 節）', G.flags.REPAIR.heroine_01===3); }
  { const G=inJapan('2028-07-07',19); H.picks=['偷看']; H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G7 7/7 七夕（交往中）：竹子、短冊；偷看＝「明年的七夕，在臺灣。」；AN_TANABATA_JP', has('（宿舍門口立了一枝竹子，掛滿了短冊。）')&&has('一人一張。寫願望。')&&has('她把短冊按住：「說了不要看。」（過了一下，她把手移開。）短冊上寫著：「明年的七夕，在臺灣。」')&&G.flags.AN_TANABATA_JP===true); }
  { const G=inJapan('2028-07-07',19,{REPAIR:{heroine_01:3}},false); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G7 7/7 挽回中、REPAIR ≥ 3：「（短冊上只有一行：「再一次。理由：我想。」）」「……不准賴。」→ 重新交往', has('你要看嗎？')&&has('（短冊上只有一行：「再一次。理由：我想。」）')&&has('……不准賴。')&&G.flags.dating_heroine_01===true&&ROM.get(G,'heroine_01').status==='dating'); }
  { const G=inJapan('2028-07-07',19,{REPAIR:{heroine_01:1}},false); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G7 7/7 挽回中、REPAIR 不到：只演前兩句', has('（宿舍門口的竹子上掛滿了短冊。以安拿著一張，寫了很久。）')&&has('你要看嗎？')&&!has('……不准賴。')&&G.flags.dating_heroine_01!==true); }
  /* ===================== G8 ===================== */
  { const G=inJapan('2028-07-16',21); phone(); const m=th('p:heroine_01').includes('明天海之日。……我想看海。電車一個小時。'); at('2028-07-17',9); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G8 7/16 私訊、7/17 海之日（字幕「海邊」）：「比淡水的冷。」、傍晚回來', m&&caps.includes('海邊')&&has('比淡水的冷。')&&has('（回來的時候，兩個人的手臂都曬紅了。）')&&G.hour>=17); }
  { const G=inJapan('2028-07-24',18.5); const L=[]; for(const [k,h] of [['2028-07-24',18.5],['2028-07-26',18.5],['2028-07-28',18.5],['2028-08-01',18.5]]){ at(k,h); const st=S.dueStop(G,'jp'); H.said=[]; if(st) await S.playStop(GM,st,'jp'); L.push(H.said.map(s=>s.t).join()); }
    check('G8 期末週摘要日（7/24、7/26、7/28）、8/1 收行李', JSON.stringify(L)===JSON.stringify(['（日本語的期末考。聽力那一段，你聽懂了七成。）','（日本法入門交報告。你在最後一頁寫了台灣的對照表。）','（比較行政法的期末報告。你的題目是：協力，和義務。）','（你開始收行李。來的時候的那件外套，一次都沒穿過。）']), JSON.stringify(L)); }
  { const G=inJapan('2028-08-04',22); H.picks=['妳教我的']; H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('G8／JP-F 8/4 22:00 最後一個晚上的便利商店（交往中）：「……現在看得懂了嗎？」；「妳教我的。」→「我只教你看字。標籤是你自己看懂的。」（她把兩個飯糰放進籃子。）（AA_435 第 0 節）', has('第一個晚上，你在這裡看不懂標籤。')&&has('……現在看得懂了嗎？')&&has('我只教你看字。標籤是你自己看懂的。')&&has('（她把兩個飯糰放進籃子。）')); }
  { const G=inJapan('2028-08-04',22,{},false); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp'); check('G8 挽回中（沒有回到交往）：一個人去便利商店', has('（最後一個晚上。你一個人去了便利商店。冷藏櫃的燈，和第一個晚上一樣亮。）')); }
  { const G=fresh('2028-08-12',18.5,'jp_hub','JP',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05')}); HOME.rec(G).at=true; H.said=[]; const st=S.dueStop(G,'home'); if(st) await S.playStop(GM,st,'home');
    check('G8／R3 8/5～9/3 回來以後的暑假：8/12 摘要日（AA_340 6-3；AA_345 H3 還沒決定那一版）；住家裡（9/3 以前）', has('（八月。你把大四可以走的路寫在紙上：國考、研究所。兩個都畫了問號。）')&&S.homeOn(G));
    G.jp.done={}; G.flags.Y4_PATH='bar'; H.said=[]; await S.playStop(GM,S.dueStop(G,'home'),'home'); check('R3 8/12 摘要日：8/5 晚上選好了路（國考）＝「列到第三頁」那一版（AA_345 H3）', has('（八月。你把大四要走的那條路寫在紙上，下面列了要讀的書。列到第三頁。）')); }
  /* ===================== JP-A 交往中一路快轉 3/25～4/14：中間沒有空白的整週 ===================== */
  { const G=inJapan('2028-03-25',16); H.FAMILIAR('yu'); INV.addContact(G,'yu'); H.FRIEND('zhe'); INV.addContact(G,'zhe'); phone(); let t=T(D('2028-03-25'),16); const stops=[];
    for(let i=0;i<40&&t<T(D('2028-04-14'),0);i++){ const ff=S.ffOpts(G,'jp'); if(!ff) break; await S.jump(GM,ff[0].to,'jp',{ff:true}); stops.push(G.day);   /* 停下來以後照玩家會做的：回訊息、演該演的、出發 */
      for(const m of PHONE.pending(G)) PHONE.answer(G,m.ask.id,0);
      const st=S.dueStop(G,'jp'); if(st){ H.picks=[0,0,0]; await S.playStop(GM,st,'jp'); }
      const q=OUT.due(G); if(q){ H.picks=[0,0,0]; await OUT.go(GM,q); }
      if(S.classSpecialNow(G)){ H.picks=[0,0]; await S.attend(GM,S.classNow(G)); }
      phone(); G.hour+=0.25; t=T(G.day,G.hour); }
    let gap=0; for(let i=1;i<stops.length;i++) gap=Math.max(gap,stops[i]-stops[i-1]);
    check('JP-A 交往中，3/25 出發後一路快轉到 4/14（接上 AA_326 的日本事件：J1 便利商店、語 4 視訊、主線 8 的訊息與視訊）：停在 3/26、3/27、3/28、4/2、4/10、4/13…；中間沒有空白的整週', [D('2028-03-26'),D('2028-03-27'),D('2028-03-28'),D('2028-04-02'),D('2028-04-10'),D('2028-04-13')].every(d=>stops.includes(d))&&gap<7, JSON.stringify(stops.map(d=>CALENDAR.dateOf(d).m+'/'+CALENDAR.dateOf(d).d))); }
  /* ===================== R1 AA_326 的日本事件在據點（src/r2y3b3d.js）===================== */
  { const G=inJapan('2028-03-26',21.75); phone(); const q=OUT.get(G,'y3_an_j1'); H.opts=[]; H.said=[]; caps.length=0; const r0=S.round, w0=console.warn; S.round=async()=>{ throw new Error('stop'); }; console.warn=()=>{};
    try{ await S.loop(GM); } finally{ S.round=r0; console.warn=w0; }
    check('R1 J1 便利商店（AA_326 2-Y3-34）：日本 22:00（遊戲時鐘＝日本時間）；據點只有「出發」一個選項（must）；演完回到宿舍', !!q&&q.h===22&&q.must===true&&H.opts[0]&&H.opts[0].length===1&&/^出發：/.test(H.opts[0][0])&&q.state==='done'&&caps.includes('回到宿舍。')&&G.zone==='jp_hub', JSON.stringify([q&&q.h,H.opts[0],q&&q.state,caps])); }
  { const G=inJapan('2028-04-12',22.5); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('zhe'); phone(); PHONE.answer(G,'y3_far_call',0); at('2028-04-13',20); phone(); const q=OUT.get(G,'y3_far_call'); const nx=S.nextStop(G,T(D('2028-04-13'),8),'jp');
    check('R1 主線 8「遠方」：4/12 臺灣 21:00＝日本 22:00 阿哲私訊、4/13 臺灣 19:30＝日本 20:30 視訊；快轉停在接起來的時間', th('p:zhe').includes('明天七點半 視訊 麵店')&&!!q&&q.h===20.5&&q.verb==='接起來'&&Math.abs(nx-(T(D('2028-04-13'),20.5)-0.25))<1e-6, JSON.stringify([q&&q.h,nx])); }
  /* ===================== R2 裁定 10：日本路線 8/5 晚上只演 1A-08，沒有大三暑假的三選一 ===================== */
  { const G=fresh('2028-08-05',21.5,'jp_hub','JP',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05')}); phone(); const st=(R2Y3B.stops(G)||[]).map(x=>x-T(D('2028-08-05'),0));
    const tw=fresh('2028-06-19',21.5,'dorm','TW'); phone();
    check('R2 裁定 10：日本路線 8/5 21:00 沒有「這個暑假要做什麼？」、快轉不停在 8/5 21:00；台灣路線 6/19 照舊', !PHONE.sent(G,'y3_summer_plan')&&!st.includes(21)&&PHONE.sent(tw,'y3_summer_plan'), JSON.stringify(st)); }
  /* ===================== R4 家人群組：人在日本不問「這週回來吃飯嗎」 ===================== */
  { const G=inJapan('2028-04-13',20.5); HOME.phoneRules(GM); PHONE.tick(G); const a=(G.msgs||[]).some(m=>/^home_ask_/.test(m.tag||''));
    const tw=fresh('2028-04-13',20.5,'dorm','TW'); HOME.phoneRules(GM); PHONE.tick(tw); const b=(tw.msgs||[]).some(m=>/^home_ask_/.test(m.tag||''));
    check('R4 每週四 20:00 家人群組：人在日本不問；台灣路線照問', !a&&b, [a,b].join()); }
  /* ===================== R5 臺灣的朋友回訊息的時間（MSG.replyAt）===================== */
  { const G=inJapan('2028-04-12',2.5); const r=MSG.replyAt(G,'classmate_bohan'); const tw=fresh('2028-04-12',2.5,'dorm','TW'); const r2=MSG.replyAt(tw,'classmate_bohan');
    check('R5 柏翰（臺灣 02:00 睡）：日本 02:30＝臺灣 01:30 還醒著，三十分鐘內回；台灣路線同一個時鐘時間已經睡了，隔天早上才回', !!r&&r.day===D('2028-04-12')&&r.h>2.5&&r.h<=3.01&&!!r2&&r2.h>=8.5, JSON.stringify([r,r2])); }
  /* ===================== R6 每天的手機小事（阿凱的泡麵評鑑表）===================== */
  { const d=(STORY.DAILY_PHONE||[]).find(x=>x.id==='kai_sheet'); const G=inJapan('2028-04-21',12); const a=d&&d.h(G); const tw=fresh('2028-04-21',12,'dorm','TW'); const b=d&&d.h(tw);
    check('R6 阿凱的泡麵評鑑表：臺灣 21:48＝日本 22:48', !!d&&Math.abs(a-(b+1))<1e-6&&Math.abs(b-21.8)<1e-6, [a,b].join()); }
  /* ===================== R7 holff3d.js 朋友回老家的訊息（大三暑假，人在日本）===================== */
  { const G=inJapan('2028-06-30',22.5); PHONE.join(G,'noodle_team','麵店團'); phone(); const a=th('g:noodle_team').includes('明天回高雄'); at('2028-06-30',23); phone(); const b=th('g:noodle_team').includes('明天回高雄');
    check('R7 6/30 阿哲「明天回高雄」：臺灣 22:00＝日本 23:00', !a&&b, [a,b].join()); }
  /* ===================== R8 子晴遊戲展的照片（vac3d.js alt：日本路線收不到邀約）===================== */
  { const G=inJapan('2028-07-05',21.5); H.FAMILIAR('heroine_04'); phone(); const a=th('p:heroine_04').includes('你不在 好可惜'); at('2028-07-05',22); phone(); const b=th('p:heroine_04').includes('你不在 好可惜');
    check('R8 7/5 子晴「你不在 好可惜」：臺灣 21:00＝日本 22:00', !a&&b, [a,b].join()); }
  /* ===================== R9 可昕 K19、學姊 M6 的照片（y34b3d.js）===================== */
  { const G=inJapan('2028-05-03',17.5); date('kexin'); phone(); const a=th('p:kexin').includes('報告講完了。……好累。'); at('2028-05-03',18); phone(); const b=th('p:kexin').includes('報告講完了。……好累。');
    check('R9 可昕 K19 的照片：臺灣 17:00＝日本 18:00（日本路線那句照 AA_377 第 13 項「報告講完了。……好累。」）', !a&&b, [a,b].join()); }
  { const G=inJapan('2028-08-03',9.5); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); phone(); const a=(G.msgs||[]).some(m=>/^y4_m6_d/.test(m.tag||'')); at('2028-08-03',10); phone(); const b=(G.msgs||[]).some(m=>/^y4_m6_d/.test(m.tag||''));
    check('R9 學姊 M6 每天的照片（8/3 還在日本）：臺灣 09:00＝日本 10:00', !a&&b, [a,b].join()); }
  /* ===================== R10 REPAIR：和 r2y3b3d.js 町公所那一步同一個 ===================== */
  { const G=inJapan('2028-05-06',22,{},false); R2Y3B.repairAdd(G,'heroine_01'); at('2028-06-24',16); S.rec(G).done={}; H.picks=['對不起']; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('R10 挽回：町公所那一步（r2y3b3d.js）＋河邊那一步（jp3d.js）加在同一個 G.flags.REPAIR.heroine_01', G.flags.REPAIR.heroine_01===2&&S.repairN(G)===2, JSON.stringify(G.flags.REPAIR)); }
  /* ===================== JP-D 平日 09:00 在宿舍＝有「去上課」；黃金週、海之日沒有 ===================== */
  { const G=inJapan('2028-05-10',8.5); const a=!!S.classNow(G); at('2028-05-03',8.5); const b=!!S.classNow(G); at('2028-07-17',8.5); const c=!!S.classNow(G);
    check('JP-D 平日 08:30 有「去上課」（一鍵）；黃金週、海之日沒有課', a&&!b&&!c, [a,b,c].join()); }
  /* ===================== AA_349（2026-10-21 AA-C 回 K、L）：L1 交換生群組每週那一則、L2 8/21、L3 便利商店點頭、L8 補修班、L9 不算學分 ===================== */
  const GRP='g:jp_exchange';
  { const G=inJapan('2028-04-02',19.5,{},false); PHONE.join(G,'jp_exchange','交換生群組'); phone(); const a=th(GRP).length; at('2028-04-02',20); phone(); const m=PHONE.byAsk(G,'jp_grp_1');
    check('L1 挽回中 4/2（日）日本時間 20:00（19:30 還沒有）：以安在交換生群組「國際學生辦公室週三下午不開。要交表的，請上午去。」；選項：在群組回「收到。週三上午去。」、「（私訊她）……我們可以談一下嗎？」',
      a===0&&!!m&&m.th===GRP&&m.from==='heroine_01'&&m.text==='國際學生辦公室週三下午不開。要交表的，請上午去。'&&m.ask.opts.map(o=>o.t).join('|')==='收到。週三上午去。|（私訊她）……我們可以談一下嗎？', JSON.stringify(m));
    const r0=S.repairN(G); PHONE.answer(G,'jp_grp_1',0); phone();
    check('L1 在群組回：群組裡多「收到。週三上午去。」、REPAIR +1（G.flags.REPAIR.heroine_01）', th(GRP).includes('收到。週三上午去。')&&S.repairN(G)===r0+1&&G.flags.REPAIR.heroine_01===r0+1, JSON.stringify([r0,G.flags.REPAIR]));
    at('2028-04-09',20); phone(); PHONE.answer(G,'jp_grp_2',0); phone();
    check('L1 第 2 週 4/9：「公寓的垃圾分六種。……」（AA_377 第 4 項）→「謝謝。寶特瓶的蓋子要拆嗎？」→ 以安「要。蓋子是另一類。」；REPAIR 再 +1', th(GRP).join('|').includes('公寓的垃圾分六種。分類表我拍了，在相簿。|謝謝。寶特瓶的蓋子要拆嗎？|要。蓋子是另一類。')&&S.repairN(G)===r0+2, JSON.stringify(th(GRP)));
    at('2028-04-16',20); phone(); PHONE.answer(G,'jp_grp_3',0); phone();
    check('L1 第 3 週 4/16：回了以後群組裡「（群組裡有人回了一個笑臉。）」；回了三週＝REPAIR 3（一個月內就到）', th(GRP).includes('（群組裡有人回了一個笑臉。）')&&S.repairN(G)===r0+3, JSON.stringify([th(GRP).slice(-3),S.repairN(G)])); }
  { const G=inJapan('2028-04-23',20,{},false); PHONE.join(G,'jp_exchange','交換生群組'); phone(); const n0=th('p:heroine_01').length; PHONE.answer(G,'jp_grp_4',1); phone(); at('2028-04-25',22); phone();
    const p=(G.msgs||[]).filter(x=>x.th==='p:heroine_01').slice(n0);
    check('L1 「（私訊她）……我們可以談一下嗎？」：私訊她「……我們可以談一下嗎？」（不貼在群組）、她沒有回、不加分', p.length===1&&p[0].from==='player'&&p[0].text==='……我們可以談一下嗎？'&&!th(GRP).includes('……我們可以談一下嗎？')&&!th(GRP).includes('我也發現了。還以為是我抄錯。')&&S.repairN(G)===0, JSON.stringify([p,S.repairN(G)])); }
  { const G=inJapan('2028-04-09',20,{},false); PHONE.join(G,'jp_exchange','交換生群組'); at('2028-04-02',20); phone(); at('2028-04-09',20); phone(); PHONE.answer(G,'jp_grp_1',0); PHONE.answer(G,'jp_grp_2',0); phone();
    check('L1 一週最多 +1：同一週回了兩則（上週那則晚回）只 +1', S.repairN(G)===1, JSON.stringify(G.flags.REPAIR)); }
  { const G=inJapan('2028-04-02',20); PHONE.join(G,'jp_exchange','交換生群組'); phone(); check('L1 交往中的玩家不收這一套', !PHONE.sent(G,'jp_grp_1')&&!th(GRP).length); }
  { const G=inJapan('2028-04-02',19,{},false); PHONE.join(G,'jp_exchange','交換生群組'); const RP=[]; const tags=[];
    for(let i=0;i<S.GRP.length;i++){ at(S.GRP[i][0],20); phone(); tags.push(PHONE.sent(G,S.grpTag(i))); PHONE.answer(G,S.grpTag(i),0); phone(); RP.push(S.repairN(G)); }
    const third=RP.findIndex(n=>n>=3);
    check('L1 14 週：4/2～7/2 每週日一則（共 14 則）；每週在群組回的玩家第 3 週（4/16）就到 3', S.GRP.length===14&&tags.every(Boolean)&&S.GRP[0][0]==='2028-04-02'&&S.GRP[13][0]==='2028-07-02'&&third===2&&S.GRP[third][0]==='2028-04-16', JSON.stringify(RP));
    at('2028-07-07',19); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('L1 → 7/7 七夕：挽回到了（REPAIR ≥ 3）＝短冊「再一次。理由：我想。」、重新交往', S.repairN(G)>=3&&has('（短冊上只有一行：「再一次。理由：我想。」）')&&G.flags.dating_heroine_01===true&&ROM.get(G,'heroine_01').status==='dating', JSON.stringify([S.repairN(G),H.said.map(s=>s.t)])); }
  { const G=inJapan('2028-04-02',19,{},false); PHONE.join(G,'jp_exchange','交換生群組');
    for(let i=0;i<S.GRP.length;i++){ at(S.GRP[i][0],20); phone(); PHONE.answer(G,S.grpTag(i),1); phone(); }
    at('2028-07-07',19); H.said=[]; await S.playStop(GM,S.dueStop(G,'jp'),'jp');
    check('L1 只私訊追問、不在群組回的：到不了 3，7/7 只演前兩句', S.repairN(G)===0&&has('你要看嗎？')&&!has('……不准賴。')&&G.flags.dating_heroine_01!==true, S.repairN(G)); }
  /* L3 便利商店點頭 */
  { const G=inJapan('2028-04-10',8,{},false); H.said=[]; caps.length=0; const r0=S.round, w0=console.warn; S.round=async()=>{ throw new Error('stop'); }; console.warn=()=>{};
    try{ await S.loop(GM); } finally{ S.round=r0; console.warn=w0; }
    check('L3 挽回中 4/10（一）08:00（有 9:00 的課，08:00 醒）：據點的選單之前演「（宿舍附近的便利商店。以安在飯糰架前面。……）」、字幕「便利商店」；不加 REPAIR', has(S.NOD[0])&&S.NOD[0]==='（宿舍附近的便利商店。以安在飯糰架前面。她看到你，點了一下頭，拿了一個鮭魚的就去結帳。）'&&caps.includes('便利商店')&&S.repairN(G)===0&&S.place(G)==='room', JSON.stringify(H.said.map(s=>s.t)));
    at('2028-04-12',8); const a=S.nodDue(G); at('2028-04-17',7.75); const b=S.nodDue(G); H.said=[]; await S.nod(GM); at('2028-04-24',8); H.said=[]; await S.nod(GM); const c=has(S.NOD[2]); at('2028-05-01',8); const d=S.nodDue(G);
    check('L3 一週最多一次（4/12 同一週沒有）、共三次照順序（4/17 第二句「麥茶」、4/24 第三句「側身讓你」）、5 月沒有', !a&&b&&c&&!d&&S.rec(G).nod.length===3, [a,b,c,d].join()); }
  { const G=inJapan('2028-04-10',8); check('L3 交往中：沒有', !S.nodDue(G)); at('2028-04-11',9.75); G.flags.dating_heroine_01=false; ROM.get(G,'heroine_01').status='ended'; const a=S.nodDue(G); at('2028-04-15',7.75); const b=S.nodDue(G); check('L3 07:30～08:00 以外、週末：沒有', !a&&!b, [a,b].join()); }
  /* L2 8/21 */
  { const G=fresh('2028-08-13',9,'jp_hub','JP',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05'),Y4_PATH:'bar'}); HOME.rec(G).at=true; S.rec(G).done.s_0812=D('2028-08-12'); const ff=S.ffOpts(G,'home');   /* Y4_PATH：8/5 晚上 1A-08 選好了（不然快轉先停在 1A-08）*/
    await S.ff(GM,ff[0].to,'home'); const st=S.dueStop(G,'home'); H.said=[]; if(st) await S.playStop(GM,st,'home');   /* X58：照玩家的快轉（S.ff）*/
    check('L2 日本路線 8/21 18:30 摘要日一句（不看三選一）：「（八月。時差調回來了。你把在日本的筆記和大四的課表放在一起，書桌一下子滿了。）」；快轉停在那裡', G.day===D('2028-08-21')&&Math.abs(G.hour-18.5)<1e-6&&JSON.stringify(H.said.map(s=>s.t))===JSON.stringify(['（八月。時差調回來了。你把在日本的筆記和大四的課表放在一起，書桌一下子滿了。）']), JSON.stringify([G.day,G.hour,H.said.map(s=>s.t)]));
    G.flags.SUMMER_Y3='study'; S.rec(G).done={s_0812:1}; at('2028-08-21',18.5); H.said=[]; await S.playStop(GM,S.dueStop(G,'home'),'home');
    check('L2 舊存檔有 SUMMER_Y3 也是同一句（AA_343 D5 日本路線作廢）；9/3 的房間沒有三選一的物件', JSON.stringify(H.said.map(s=>s.t))===JSON.stringify(['（八月。時差調回來了。你把在日本的筆記和大四的課表放在一起，書桌一下子滿了。）'])&&R2Y3B.roomSummer(G)===null, JSON.stringify(H.said.map(s=>s.t))); }
  /* L8 補修班的第一堂 */
  { const G=fresh('2029-02-19',9,'classroom','JP'); const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='civpro_2_re'); H.said=[]; H.opts=[]; H.picks=['交換回來補的']; const a=!!it&&await CLS.beforeClassEvent(GM,it);
    check('L8 民訴甲下（補修，週一上午）第一堂：「（補修班。教室裡都是大三的學弟妹。……）」學弟「學長，你也來補這門喔？」；「交換回來補的。」→「喔，日本！那邊的民訴也這樣上嗎？」→（你想了一下……）',
      a&&has('（補修班。教室裡都是大三的學弟妹。你坐在最後一排，旁邊的學弟看了你兩次。）')&&H.said.some(s=>s.who==='學弟'&&s.t==='學長，你也來補這門喔？')&&H.opts[0].join('|')==='「交換回來補的。」|「嗯。」'&&has('喔，日本！那邊的民訴也這樣上嗎？')&&has('（你想了一下，說不出一樣還是不一樣。）'), JSON.stringify(H.said));
    H.said=[]; const b=await CLS.beforeClassEvent(GM,it); check('L8 之後的補修課照一般上課（只演第一次）', b===false&&!H.said.length);
    const G2=fresh('2029-02-19',9,'classroom','JP'); const it2=CLS.dayItems(G2,G2.day).find(x=>x.c.id==='civpro_2_re'); H.said=[]; H.picks=['嗯']; await CLS.beforeClassEvent(GM,it2);
    check('L8 選「嗯。」→（他沒有再問，把講義往你這邊推了一點。）', has('（他沒有再問，把講義往你這邊推了一點。）')&&!has('喔，日本！那邊的民訴也這樣上嗎？'));
    const G3=fresh('2029-02-22',9,'classroom','JP'); const it3=CLS.dayItems(G3,G3.day).find(x=>x.c.id==='insurance_re'); H.said=[]; const c=!!it3&&await CLS.beforeClassEvent(GM,it3);
    check('L8 保險法（補修）第一堂：「（保險法。老師點名點到你，停了一下：「交換回來的？」你點頭。他在名單上打了一個勾。）」', c&&JSON.stringify(H.said.map(s=>s.t))===JSON.stringify(['（保險法。老師點名點到你，停了一下：「交換回來的？」你點頭。他在名單上打了一個勾。）']), JSON.stringify(H.said)); }
  /* L9 （不算學分）只標在日文課 */
  { const G=inJapan('2028-04-04',10); const w=CLS.weekHTML(G), items=w.split('<div class="item">').filter(x=>/不算學分/.test(x));
    check('L9 手機課表「（不算學分）」只在日本語（中級）那一列；交換學校的法律課沒有', items.length===1&&/日本語（中級）/.test(items[0])&&!/回國申請抵免/.test(w), JSON.stringify(items)); }
  // ===== jp_room：3D 的「你的房間」（使用者 10-21 13:0x「已經做的 3D 保留」；LAWWW2 c8c810e1、jp_dorm3d.js）=====
  { const Z0=global.Z3, L0=global.JP_DORM_LAYOUTS; global.Z3=Object.assign({},Z0||{},{ZONES:Object.assign({},(Z0&&Z0.ZONES)||{},{jp_room:{id:'jp_room'}})}); global.JP_DORM_LAYOUTS={jp_room:{spawn:{x:0,z:0.5,yaw:0}}};
    try{
      const G=inJapan('2028-04-12',20.5); H.entered=[]; H.picks=['在房間休息一下']; await JP.loop(GM);
      const a=H.entered.slice(), z1=G.zone;
      H.entered=[]; const t=JP.tick(GM); const b=H.entered.slice();
      check('jp_room 1：選單「在房間休息一下」＝走進 3D 的房間（GM.enter jp_room）；人在房間時 JP.tick 不把人拉回據點、也不跑選單（回傳 true，臺灣的事不往下跑）', a[a.length-1]==='jp_room'&&z1==='jp_room'&&t===true&&!b.includes('jp_hub'), JSON.stringify({a,z1,t,b}));
      const d0=G.day; H.entered=[]; await JP.bedFromRoom(GM); const pend=!!JP.rec(G).pendingSleep, e1=H.entered.slice();
      H.picks=['在房間休息一下']; await JP.loop(GM);
      check('jp_room 2：房間的床「睡覺」＝回據點、接著睡到隔天（照選單的睡覺）；睡完選「在房間休息一下」又走進房間', pend&&e1[0]==='jp_hub'&&G.day===d0+1&&!JP.rec(G).pendingSleep&&H.entered[H.entered.length-1]==='jp_room', JSON.stringify({pend,e1,day:G.day-d0,ent:H.entered}));
      /* jp_room 6（BB 10-22 12:5x：在房間待著，22:00 奕廷的電話沒響）：必接的電話到了＝回據點（由據點的迴圈問「接起來」）；還沒到、正在忙＝留在房間 */
      { const G6=inJapan('2028-05-29',21.5); G6.zone='jp_room'; H.entered=[]; const t0=JP.tick(GM); const e0=H.entered.slice(); await Promise.resolve();
        OUT.plan(G6,{id:'t_room_call',ev:'ev_fangyt_tickets',day:G6.day,h:22,late:1,must:true,place:'電話',title:'方奕廷打電話來',verb:'接起來',travel:'',travelH:0});
        G6.hour=21.9; H.entered=[]; JP.tick(GM); const e1=H.entered.slice(); await Promise.resolve(); await Promise.resolve();
        G6.zone='jp_room'; G6.hour=22.05; E.player.busy=true; H.entered=[]; JP.tick(GM); const e2=H.entered.slice(); E.player.busy=false; await Promise.resolve(); await Promise.resolve();
        H.entered=[]; JP.tick(GM); const e3=H.entered.slice(); await Promise.resolve(); await Promise.resolve();
        check('jp_room 6：人在房間、必接的電話到了（22:00 方奕廷）＝回據點（GM.enter jp_hub）；21:30 沒事＝留在房間；正在忙（坐著、對話）先不打斷，忙完才回',
          t0===true&&!e0.includes('jp_hub')&&!e2.includes('jp_hub')&&e3.includes('jp_hub'), JSON.stringify({t0,e0,e1,e2,e3}));
        check('jp_room 6：電話前 15 分鐘（21:54）就回據點（OUT.due 的規則，和據點的選單提早出現「接起來」一樣）', e1.includes('jp_hub'), JSON.stringify(e1));
        OUT.rec(G6).splice(0); }
    } finally { global.Z3=Z0; global.JP_DORM_LAYOUTS=L0; }
    const G2=inJapan('2028-04-12',20.5); H.picks=[]; const O=[]; const ch0=GM.choose; GM.choose=async(o)=>{ O.push(o.map(x=>x.t+'｜'+(x.hint||''))); return o.length-1; }; try{ await JP.round(GM); } finally { GM.choose=ch0; }
    check('jp_room 3：沒有 3D 房間（jp_dorm3d.js 沒載入）＝「在房間休息一下」照舊是過一小時', O[0].some(x=>/^在房間休息一下｜一小時/.test(x)), JSON.stringify(O[0])); }
  /* jp_room 4～5：「你的房間」三個「看」（AA_341 檔尾附加，AA-C 2026-10-21 56a36a4d）：窗外分兩段日子（4/30 以前田是乾的、5/1 以後灌水）、小冰箱、行李箱各一句；床已經接成「睡覺」不用字。
     字在 src/jp3d.js 的 JP.roomLook（產生的配置檔 jp_dorm_layouts.js 不改）；jp_dorm3d.js 只在有字的時候加「看」。修改前：沒有 JP.roomLook、三個「看」都沒有加（note 是空的）*/
  { const W1='（窗外的田還是乾的，土是深褐色。有人在田埂上騎腳踏車。）', W2='（窗外的田灌了水。傍晚的時候，整片田會反光。）', FR='（小冰箱裡有一瓶麥茶、兩顆便利商店的飯糰。其中一顆明天到期。）', SU='（行李箱還攤在地上，一直沒收進櫃子。最底下有一包從台北帶來的泡麵。）';
    const lk=(id,k)=>typeof JP.roomLook==='function'?JP.roomLook(id,{day:D(k)}):undefined;
    check('jp_room 4：JP.roomLook——窗外 4/30 以前「（窗外的田還是乾的……）」、5/1 以後「（窗外的田灌了水……）」；小冰箱、行李箱各一句；床沒有字',
      lk('window','2028-03-27')===W1&&lk('window','2028-04-30')===W1&&lk('window','2028-05-01')===W2&&lk('window','2028-08-04')===W2&&lk('fridge','2028-04-12')===FR&&lk('suitcase','2028-07-20')===SU&&!lk('bed','2028-04-12'),
      JSON.stringify([lk('window','2028-04-30'),lk('window','2028-05-01'),lk('fridge','2028-04-12'),lk('suitcase','2028-07-20')]));
    const keep={}; for(const k of ['Z3','THREE','E3','W3','P3','ASSETS','GAME','JP_DORM_LAYOUTS']) keep[k]=global[k];
    const grp=()=>({name:'',userData:{},children:[],add(o){ this.children.push(o); },remove(o){ const i=this.children.indexOf(o); if(i>=0) this.children.splice(i,1); },traverse(){}}), vec=()=>({x:0,y:0,z:0,set(){}});
    let IT=[], err='', w1=null, w2=null;
    try{
      global.THREE={Group:function(){ return grp(); },Mesh:function(){ return {rotation:{x:0},position:vec(),receiveShadow:false}; },PlaneGeometry:function(){},BoxGeometry:function(){},PointLight:function(){ return {position:vec(),intensity:0,isLight:true}; },Vector3:keep.THREE&&keep.THREE.Vector3};
      global.Z3={ZONES:{},room:()=>({group:grp(),walls:[],winParts:[],onLamps(){},applyTime(){}}),attachRoomGLB(){}}; global.E3={NavGrid:function(){ return {blockOutside(){},blockRect(){},_cm:null}; }};
      global.W3={stoneTex:()=>({})}; global.P3=Object.assign({},keep.P3,{M:()=>({})}); global.ASSETS={manifest:{},loadOne:()=>Promise.resolve(null)};
      const G=inJapan('2028-04-30',20.5); global.GAME={G};
      vm.runInThisContext(src('src/data/jp_dorm_layouts.js').replace(/^const JP_DORM_LAYOUTS\s*=/m,'globalThis.JP_DORM_LAYOUTS='),{filename:'src/data/jp_dorm_layouts.js'});
      vm.runInThisContext(src('src/jp_dorm3d.js'),{filename:'src/jp_dorm3d.js'});
      const E={interactables:[],zone:null}; E.zone=Z3.ZONES.jp_room.build(E); IT=E.interactables;
      const win=IT.find(x=>x.jpLook==='window'); w1=win?win.look:null; G.day=D('2028-05-01'); w2=win?win.look:null;
    }catch(e){ err=String(e&&e.stack||e).slice(0,300); } finally{ for(const k in keep) global[k]=keep[k]; }
    const it=k=>IT.find(x=>x.jpLook===k);
    check('jp_room 5：3D 房間（jp_dorm3d.js）三個「看」都加上：窗外（4/30 是乾的田、同一個房間到了 5/1 是灌了水的田）、小冰箱、行李箱；床照舊是「睡覺」',
      !err&&w1===W1&&w2===W2&&!!it('fridge')&&it('fridge').look===FR&&it('fridge').label==='小冰箱'&&!!it('suitcase')&&it('suitcase').look===SU&&!!it('bed')&&it('bed').label==='睡覺'&&!it('bed').look,
      err||JSON.stringify(IT.filter(x=>x.jpLook).map(x=>[x.jpLook,x.label,x.look]))); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
