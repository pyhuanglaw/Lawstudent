// 1B-12～1B-25（AA_322、AA_323；src/y34b3d.js）——不需要瀏覽器。照 AA 的「給 BB 的驗收情境」逐件檢查（台詞只查有沒有出現、出現在哪一段）：
//   1B-12 A1～A4（餞行、送機友情版／戀愛版、日本路線一起出發、沒去＝登機證）；1B-13 T1～T3；1B-14 Z1～Z3；1B-15 Q1～Q4；1B-16 K1、K2；1B-17 S1～S3；
//   1B-18＋22 W1～W4（家族共乘／兩個人、客運＋便條、美國一起出發、US0、M6 每天的照片只留 7 張、六題爭論＋今天不吵、11/5 起 20:00）；1B-19 N1～N3；
//   1B-20 Y1～Y3（12/12、帶到場、最後一碗、騎樓三版、美國遠端版＋阿姨那句）；1B-21 P1、P2；1B-23 C1、C2（＋交往中、畢業後篇的子晴線）；1B-24 A1～A3（＋延到 17:00、帶到場）；1B-25 M1、M2。
//   另外：掛勾登記、在家（home3d.js 的 loop 問 STORY.y4HomeDue）、睡著也會醒來、鬧鐘、出錯的事件不重開、讀書會大四上有開。
//   AA_337（回 1B-12～25 實作八題＋補字）：1B-13 每週的選項「走吧。」「今天不行。」、2/24 沒去之後的週四演第一次（17:00～17:30）、日本路線每週四的照片；1B-15 阿凱 5/18 私訊；
//   1B-17 改成 MSG-2 私訊；1B-18 機場旁白改早上；1B-12／1B-18 可昕送機的動作；1B-19 Alison 兩句＋「知道。」、「今天跟你說」「然後是你」；1B-20 最後一碗給阿哲、群組倒數、可昕事後照片、
//   芷若的明信片；1B-21「改天」的回覆；U_COPYRIGHT（智財法第 4 週的討論課）→ Q14「三件事」；RA_WORK 不設。
//   AA_337 第 7 節（6d344677；修改前 FAIL）：1B-17 交往中 17:05 以後才傳＝22:30「明天下午，Café？」＋「好。」（6/3 15:00 Café）／「明天不行。」；日本路線＝台灣 18:00 視訊；
//   1B-15 阿凱私訊回了「去。」卻沒到＝16:30 阿凱三則。
//   AA_363（2026-10-21）：R1 阿凱 16:30 的照片換《九點以後》（舊存檔 ZQ_Q12 cat 照舊）、R8 名單的配樂每個玩家都有——在開發分支 6a47ff46 上 5 項 FAIL，改完 PASS。
//   AA_296 2-3-1 ①（2026-10-22，企劃線 3f406dbc）改了 1B-19 美國路線交往中的期待值：當地 10:00 她打來的視訊，那兩則私訊是沒接的替代版（逐字對稿在 tests/aa296_phone_live_unit.js）。
// E08（2026-10-27）：日本路線 3/25 出發先到 3D 出境大廳，玩家按「登機」才演登機口、飛往日本——A3、挽回中在 S.departJP 後面加 EXCH.airBoard。
// AA_513 1-3（2026-10-28，a2e4bf196）：1B-15 阿凱 16:30 那兩組照片後面再兩則「所以我坐第一排」「她叫我不要坐第一排」——五項（「去。」卻沒到兩項、「不了。」、舊存檔貓兩項）
//   原本查「照片是最後一則」，改查照片＋那兩則（ROW）；開發分支 44e8ff8b7 的 y34b3d.js 跑這五項 FAIL（沒有那兩則），改完 PASS。到場、日本路線不加在 tests/aa513_unit.js。
// 修改前：沒有 src/y34b3d.js（第 0 項 FAIL）。用法：node tests/y34b_events_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };   // 地點字幕（{scene}）
load('src/exchange3d.js'); load('src/data/msg2_pool.js'); load('src/msg3d.js');   // 1B-17 的「生日快樂」走 MSG-2（index.html 裡 msg3d.js 在 y34b3d.js 前面）
const hasFile=fs.existsSync(path.join(H.ROOT,'src/y34b3d.js'));
if(hasFile) load('src/y34b3d.js');
check('0. src/y34b3d.js 載入、事件登記、掛勾登記、index.html 有載入', hasFile&&typeof Y34B!=='undefined'&&Array.isArray(Y34B.EVENTS)&&Y34B.EVENTS.length>=20&&Y34B.EVENTS.every(id=>STORY_EVENTS.some(e=>e.id===id))&&STORY.TICKS.length>0&&STORY.PHONE_RULES.length>0&&STORY.WAKE_AT.length>0&&STORY.ALARMS.length>0&&/src\/y34b3d\.js/.test(fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8')));
if(H.fails){ H.done(); }
const S=Y34B, D=k=>STORY.dayOfKey(k);
const CAT='📷（投影幕上一隻在找插座的貓）', NINE='📷（投影幕上，一個小孩坐在玄關，腿上放著兩支搖桿。標題：《九點以後》）';   /* 阿凱 5/20 16:30 的照片：AA_363 R1 起＝NINE（舊存檔 ZQ_Q12 cat＝CAT）*/
const ROW=['所以我坐第一排','她叫我不要坐第一排'];   /* AA_513 1-3（2026-10-28，a2e4bf196）：照片後面阿凱再兩則（AA_508 4-4 改私訊；逐字對稿、到場的不加在 tests/aa513_unit.js）*/
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const fresh=(key,h,zone,flags,route)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; E.player.obj.position.x=0; E.player.obj.position.z=0; return G; };
const at=(key,h)=>{ H.at(key,h); };
const phone=()=>{ S.phone(H.G); PHONE.tick(H.G); };
const said=()=>H.lines();
const has=t=>H.said.some(s=>s.t===t||s.t.endsWith(t));
const idx=t=>H.said.findIndex(s=>s.t===t);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const msg=(t,text)=>(H.G.msgs||[]).find(m=>m.th===t&&m.text===text);
const answer=(askId,k)=>PHONE.answer(H.G,askId,k);
const run=async id=>{ H.said=[]; H.opts=[]; H.cgs=[]; await EVENTS.run(ev(id)); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.cgs=[]; H.picks=picks||[]; if(!q) return false; await OUT.go(GM,q); return true; };
const date=id=>H.date(id);
(async()=>{
  /* ===== 1B-12 ===== */
  fresh('2028-03-23',20,'dorm'); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('heroine_03'); PHONE.join(H.G,'noodle_team','麵店團');
  at('2028-03-23',21); phone();
  check('1B-12 3/23 21:00 麵店團群組：阿哲「明天 以安餞行」「七點 麵店」', JSON.stringify(th('g:noodle_team'))===JSON.stringify(['明天 以安餞行','七點 麵店']), JSON.stringify(th('g:noodle_team')));
  at('2028-03-24',18); H.G.zone='dorm'; phone(); const qf=OUT.get(H.G,'y3_an_farewell');
  check('1B-12 3/24 傍晚還沒到麵店：排出遊「阿鳳麵店」19:00（帶到長桌）', !!qf&&qf.h===19&&qf.goto&&qf.goto.zone==='noodle');
  at('2028-03-24',18.8); H.G.zone='noodle'; check('1B-12 18:45～19:15 在麵店＝演', S.farewellDue(H.G));
  await run('ev_an_farewell_dinner');
  check('A1 餞行：「敬以安。半年。」、Alison、語彤那兩句；收尾阿姨「那今天吃完。」；AN_FAREWELL went', has('（舉起麵店的塑膠杯）敬以安。半年。')&&has('……每天太多了。一個禮拜一張。')&&has('應該沒有這種的。')&&has('那今天吃完。')&&H.G.flags.AN_FAREWELL==='went'&&H.opts[0].join('|')==='「一路順風。」|「回來第一碗我請。」', JSON.stringify(H.opts));
  { fresh('2028-03-24',18.8,'noodle',{},'JP'); H.FAMILIAR('heroine_01'); date('heroine_01'); await run('ev_an_farewell_dinner');
    check('1B-12 日本路線的餞行：阿哲「還有你。兩個都要傳。」；選項換成「到了我幫妳顧行李。」「（舉杯）」；不認識 Alison＝她那兩句都不出', has('（轉向你）還有你。兩個都要傳。')&&H.opts[0].join('|')==='「到了我幫妳顧行李。」|「（舉杯）」'&&!has('要傳照片喔。每天。')&&!has('……每天太多了。一個禮拜一張。')); }
  fresh('2028-03-24',20,'dorm'); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); PHONE.join(H.G,'noodle_team','麵店團'); H.G.flags.HOOK_AN_SENDOFF=D('2027-12-20');
  at('2028-03-24',21); phone(); const qs=OUT.get(H.G,'y3_an_sendoff');
  check('1B-12 3/24 21:00 群組「明天以安的飛機……要去的舉手」→ 出發選單「桃園機場」10:00（鬧鐘）', th('g:noodle_team').includes('明天以安的飛機 早上十點，桃園機場 要去的舉手')&&!!qs&&qs.h===10&&qs.title==='桃園機場'&&qs.alarm===true);
  at('2028-03-25',9); await goOut('y3_an_sendoff',[0]);
  check('A1 送機友情版：「位子幫我占著」、期末說過要送＝「你說你會來。……你來了。」；AN_SENDOFF went、沒有撕頁', has('八月五號回來。位子幫我占著。')&&has('（看著你）你說你會來。……你來了。')&&H.G.flags.AN_SENDOFF==='went'&&!H.G.flags.AN_PAGE_GIVEN&&!has('手帳的理由欄，空的。'));
  { fresh('2028-03-25',9,'dorm'); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); date('heroine_01'); PHONE.join(H.G,'noodle_team','麵店團'); at('2028-03-24',21); phone(); at('2028-03-25',9); await goOut('y3_an_sendoff',[2]);
    check('A2 和以安交往：先跟大家說完「位子幫我占著」才撕一頁「手帳的理由欄，空的。」；AN_PAGE_GIVEN', idx('八月五號回來。位子幫我占著。')>=0&&idx('手帳的理由欄，空的。')>idx('八月五號回來。位子幫我占著。')&&has('（她看了你一下，轉身走進去。走到一半回頭，揮了一下手。）')&&H.G.flags.AN_PAGE_GIVEN===true&&!has('（看著你）你說你會來。……你來了。')); }
  { fresh('2028-03-24',21,'dorm',{HOOK_AN_SENDOFF:1}); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); PHONE.join(H.G,'noodle_team','麵店團'); phone(); at('2028-03-25',11.7); phone();
    check('A4 期末說了「我去送妳」、沒去：11:40 登機證照片＋「……你說你會來的。沒關係。」', JSON.stringify(th('p:heroine_01'))===JSON.stringify(['（照片：登機證）','要登機了','到了再傳','……你說你會來的。沒關係。'])&&H.G.flags.AN_SENDOFF==='missed', JSON.stringify(th('p:heroine_01'))); }
  { fresh('2028-03-25',7,'dorm',{},'JP'); H.FAMILIAR('heroine_01'); date('heroine_01'); H.FAMILIAR('zhe'); PHONE.join(H.G,'noodle_team','麵店團');
    check('1B-12 日本路線 3/25：前一晚的鬧鐘 07:30', S.alarms(H.G,D('2028-03-25')).some(a=>a.h===7.5)); at('2028-03-25',8);
    check('1B-12 日本路線 3/25 08:00 以後：一起出發到期（在家也是：STORY.y4HomeDue＝stay）', S.sendoffJPDue(H.G)&&(()=>{ const old=HOME.at; HOME.at=()=>true; const r=STORY.y4HomeDue(H.G); HOME.at=old; return r==='stay'; })());
    H.said=[]; H.cgs=[]; H.cards=[]; await S.departJP(GM); await EXCH.airBoard(GM);   /* E08（10-27）：先到 3D 出境大廳，玩家按「登機」才演登機口、飛往日本 */
    check('A3 日本路線、交往中：報到櫃台「二十二公斤」、媽媽「你們互相」、麵店團、「好。走吧。」、登機口 CG-22、字卡「飛往日本」「抵達」；AN_SENDOFF together', has('行李我量過了，二十二公斤。……你的呢？')&&has('她就交給你了。……你們互相照顧。')&&has('兩個人都要傳照片')&&has('好。走吧。')&&H.cgs.includes('cg_depart_together_heroine01')&&has('（她靠著窗，把手帳翻到四月那一頁。）')&&H.cards.some(c=>c[0]==='飛往日本')&&H.cards.some(c=>c[0]==='抵達')&&H.G.flags.AN_SENDOFF==='together'&&!S.sendoffJPDue(H.G)); }
  { fresh('2028-03-25',8,'dorm',{},'JP'); H.FAMILIAR('heroine_01'); date('heroine_01'); ROM.end(H.G,'heroine_01','test'); H.said=[]; await S.departJP(GM); await EXCH.airBoard(GM);   /* E08：出境大廳 →「登機」*/
    check('1B-12 日本路線、挽回中：只有「到了再說。」「（座位分開。）」', has('到了再說。')&&has('（座位分開。）')&&!has('行李我量過了，二十二公斤。……你的呢？')&&!has('好。走吧。')); }
  { fresh('2028-03-25',8,'dorm',{},'JP'); H.FAMILIAR('heroine_01'); date('heroine_01'); date('kexin'); H.said=[]; await S.departJP(GM);
    check('1B-12 9-1b 也和可昕交往、她不知道：媽媽換中性的那句、可昕「時差一個小時，不要算錯。」', has('到了打電話回來。……你們兩個都是。')&&!has('她就交給你了。……你們互相照顧。')&&has('到了傳訊息。……時差一個小時，不要算錯。'));
    const hug='（可昕走過來，抱了你一下，很快就放開。以安在看航班表。）';
    check('AA_337 第 6 節 日本路線、可昕不知道：先抱一下的旁白，再「到了傳訊息。……」', idx(hug)>=0&&idx(hug)<idx('到了傳訊息。……時差一個小時，不要算錯。')); }
  { fresh('2028-03-25',8,'dorm',{},'JP'); H.FAMILIAR('heroine_01'); date('heroine_01'); date('kexin'); ROM.relRec(H.G).kexin={heroine_01:true}; H.said=[]; await S.departJP(GM);
    check('AA_337 第 6 節 日本路線、可昕知道：只有她那一句，沒有動作', has('……我知道你們同一班。到了傳訊息。兩個都是。')&&!H.said.some(s=>/抱了你一下/.test(s.t))); }
  /* ===== 1B-13 ===== */
  fresh('2028-02-23',20,'dorm'); H.FRIEND('heroine_03'); at('2028-02-23',21); phone();
  check('1B-13 2/23 21:00 語彤私訊「明天傍晚 麵店門口」「我有事想問你」', JSON.stringify(th('p:heroine_03'))===JSON.stringify(['明天傍晚 麵店門口','我有事想問你']));
  at('2028-02-24',17); H.G.zone='gongguan'; E.player.obj.position.x=-63; E.player.obj.position.z=22;
  check('1B-13 2/24 17:00 在麵店門口：第一次到期（離門口遠＝不演）', S.t1FirstDue(H.G,E)&&(()=>{ E.player.obj.position.x=0; const r=S.t1FirstDue(H.G,E); E.player.obj.position.x=-63; return !r; })());
  H.picks=['我沒交志願表']; await run('ev_yt_thursday_first');
  check('T1 台灣路線：「你沒去交換。」；第二個選項是「我沒交志願表。」；YT_T1', has('你沒去交換。')&&H.opts[0].includes('「我沒交志願表。」')&&!H.opts[0].includes('「我八月才走。」')&&has('嗯。那剛好。')&&H.G.flags.YT_T1===true);
  { fresh('2028-02-24',17,'gongguan',{},'US'); H.FRIEND('heroine_03'); E.player.obj.position.x=-63; E.player.obj.position.z=22; H.picks=['我八月才走']; await run('ev_yt_thursday_first');
    check('T2 美國路線：「你下學期才去交換。」、「我八月才走。」→「嗯。那這學期剛好。」', has('你下學期才去交換。')&&H.opts[0].includes('「我八月才走。」')&&has('嗯。那這學期剛好。')); }
  { fresh('2028-02-24',17,'gongguan',{},'JP'); H.FRIEND('heroine_03'); E.player.obj.position.x=-63; E.player.obj.position.z=22; check('1B-13 日本路線（AA_341 裁定 4，原本「沒有」）：2/21～3/24 在臺灣，照台灣路線有第一次；3/25 出發以後沒有', S.t1On(H.G)&&S.t1FirstDue(H.G,E)&&(at('2028-03-30',17),!S.t1On(H.G))); }
  fresh('2028-03-02',17,'gongguan',{YT_T1:true,YT_T1_DAY:D('2028-02-24')}); H.FRIEND('heroine_03'); E.player.obj.position.x=-63; E.player.obj.position.z=22;
  check('1B-13 之後的週四 17:00 在門口：問「今天要去嗎？」', S.t1WeekDue(H.G,E));
  H.said=[]; H.opts=[]; H.picks=[0]; const h0=H.G.hour; await S.t1Week(GM);
  check('1B-13 去＝旁白輪流第一段（地點字幕「公館・水源市場」）、快轉 2 小時、YT_T1_N 1', has('今天要去嗎？')&&has('（水源市場。賣菜的阿嬤講了四十分鐘她媳婦的事。語彤一直點頭，筆記寫了三頁。）')&&caps.includes('公館・水源市場')&&Math.abs(H.G.hour-h0-2)<1e-6&&H.G.flags.YT_T1_N===1&&!S.t1WeekDue(H.G,E));
  check('AA_337 第 2 節 每週的選項：「走吧。」「今天不行。」', JSON.stringify(H.opts[0])===JSON.stringify(['「走吧。」','「今天不行。」']), JSON.stringify(H.opts[0]));
  at('2028-03-09',17); H.said=[]; H.picks=[0]; caps.length=0; await S.t1Week(GM); check('1B-13 下一週：第二段（老書店，地點字幕）', has('（公館的老書店。老闆說他的客人一半是來躲雨的。語彤問他：「那另一半呢？」）')&&caps.includes('公館・老書店')&&!caps.includes('公館・水源市場'));
  at('2028-03-23',17); H.said=[]; H.picks=[1]; await S.t1Week(GM); check('1B-13 3/23 今天不去：沒有田野的發現', !has('你們法律系的，問問題都像在找誰錯。')&&!H.G.flags.FIELD_FINDING);
  check('AA_337 第 2 節 「今天不行。」→ 語彤「好。下週四。」、不快轉', has('好。下週四。')&&Math.abs(H.G.hour-17)<1e-6&&H.G.flags.YT_T1_N===2);
  at('2028-03-30',17); H.said=[]; H.picks=[0,0]; await S.t1Week(GM);
  check('T3 3/23 沒去＝3/30 修鞋店「你們法律系的，問問題都像在找誰錯。」；FIELD_FINDING；AA 的 ID ev_field_finding、快轉 2 小時、不演那一週的旁白', has('你們法律系的，問問題都像在找誰錯。')&&has('嗯。所以你們需要我們。')&&H.G.flags.FIELD_FINDING===true&&H.G.flags.YT_T1_N===3&&H.G.events.done.ev_field_finding===1&&Math.abs(H.G.hour-19)<1e-6&&!has('（巷子裡的鐘錶行。老闆修錶的時候不說話。你們在旁邊站了半小時，他才抬頭：「問吧。」）'));
  at('2028-06-08',17); check('1B-13 第 16 週（期末）不去', !S.t1WeekDue(H.G,E));
  { fresh('2028-03-09',16.9,'gongguan'); H.FRIEND('heroine_03'); E.player.obj.position.x=-63; E.player.obj.position.z=22; const a=S.t1FirstDue(H.G,E); at('2028-03-09',17); const b=S.t1FirstDue(H.G,E);
    at('2028-02-24',16.8); const c=S.t1FirstDue(H.G,E); at('2028-03-09',17); H.said=[]; H.picks=[0]; await run('ev_yt_thursday_first');
    check('AA_337 第 2 題 2/24 沒去：之後的週四 17:00～17:30 在門口演「第一次」（16:54 還不演；2/24 照舊 16:45 起）', !a&&b&&c&&has('你沒去交換。')&&H.G.flags.YT_T1===true&&!S.t1WeekDue(H.G,E));
    at('2028-06-01',17.2); H.G.flags.YT_T1=false; const d=S.t1FirstDue(H.G,E); at('2028-06-08',17.2); const e=S.t1FirstDue(H.G,E); check('AA_337 第 2 題 第一次到第 15 週（6/1）為止', d&&!e); }
  { fresh('2028-02-24',20,'dorm',{},'JP'); H.FRIEND('heroine_03'); const ph=()=>th('p:heroine_03').filter(t=>/^📷（/.test(t)); at('2028-02-24',21); phone(); const a=ph().length; at('2028-03-02',21); phone(); const b=ph().length;
    at('2028-03-30',21.5); phone(); const d=ph().length; at('2028-03-30',22); phone(); const e=ph();
    at('2028-04-06',22); phone(); const f=ph().slice(-1)[0]; at('2028-05-11',22); phone(); const f2=ph().slice(-1)[0], n=ph().length; at('2028-06-08',22); phone(); const g=ph().length;
    check('AA_337 第 2 節＋AA_341 裁定 4 日本路線：田野的照片從 3/30（四）起（2/24、3/2 人在臺灣，照台灣路線去麵店門口，沒有照片）；人在日本＝當地 22:00（台灣 21:00），第一張是水源市場', a===0&&b===0&&d===0&&JSON.stringify(e)===JSON.stringify([S.YT_JP[0]])&&S.YT_JP[0]==='📷（水源市場的菜攤，阿嬤背對鏡頭在算錢）', JSON.stringify([a,b,d,e]));
    check('AA_466 第 2 節（原本 AA_337 每週一張、六張輪）日本路線：兩週一張、照順序各一次——4/6 沒有新的；5/11 第二張（中間 4/13、4/27 沒跑規則、不補）；6/8 還有（第三張）', f===S.YT_JP[0]&&f2===S.YT_JP[1]&&g===n+1&&n===2, JSON.stringify([f,f2,n,g]));
    check('AA_337 第 2 節 日本路線的照片：沒有字、不用回（沒有選項）', (H.G.msgs||[]).filter(m=>m.th==='p:heroine_03').every(m=>!m.ask&&/^📷（/.test(m.text))); }
  /* ===== 1B-14 ===== */
  const z=ev('ev_zhiruo_no_sugar');
  fresh('2028-03-01',15,'cafe'); H.FAMILIAR('heroine_02'); check('1B-14 大三下在 Café、FAMILIAR 以上＝可以演（interact，priority 比一般點餐高）', EVENTS.check(z)&&z.trigger==='interact'&&z.priority>(ev('ev_cafe_barista_zhiruo').priority||0));
  { fresh('2028-04-10',15,'cafe',{},'JP'); H.FAMILIAR('heroine_02'); const a=EVENTS.check(z); at('2028-08-10',15); H.G.zone='cafe'; const b=EVENTS.check(z); at('2028-08-27',15); H.G.zone='cafe'; const c=EVENTS.check(z);
    check('1B-14 日本路線：在日本的時候不算；8/5 回來以後她 8/1～9/1 不上班（AA_508 0-2 第 9 點，在店裡是客人）也不算；8/27 以後不算', !a&&!b&&!c, [a,b,c].join());
    fresh('2028-06-20',15,'cafe'); H.FAMILIAR('heroine_02'); const d=EVENTS.check(z); at('2028-08-10',15); H.G.zone='cafe'; const e=EVENTS.check(z);
    check('1B-14 台灣路線：6/20 還在班＝算；8/10 不上班＝不算', d&&!e, [d,e].join()); }
  fresh('2028-03-01',15,'cafe',{CAFE_VISITS:4,ZR_CARDS_SENT:['film','cried']}); H.FAMILIAR('heroine_02'); H.picks=[0]; await run('ev_zhiruo_no_sugar');
  check('Z1 常客、回寄過（最後一張「第二次才哭」）：「老樣子？」「……不對。你最近不加糖了。」、唸回寄的那句、「寫這句話的人」', has('老樣子？')&&has('……不對。你最近不加糖了。')&&has('你寄來的那張明信片，我在倫敦看了三遍。')&&has('你說你第二次才哭。我第一次就哭了。我贏。')&&has('……我那時候就在想，寫這句話的人，是不是很累。')&&!has('我在倫敦的時候常常想，台灣這邊的大家是不是都很累。'));
  check('Z1 「有一點。」＝她的點法、ZR_GAVE_HER_ORDER；記憶 SHE_SAW_HIM', has('這杯我請。我的點法。小孩子的東西加大人的東西。你現在需要這個。')&&H.G.flags.ZR_GAVE_HER_ORDER===true&&SOCIAL.has('heroine_02','SHE_SAW_HIM'));
  fresh('2028-03-01',15,'cafe'); H.FAMILIAR('heroine_02'); H.picks=[1]; await run('ev_zhiruo_no_sugar');
  check('Z2 不是常客、沒回寄：「你要喝什麼？……」「我在倫敦的時候常常想……」；「沒有啦。」＝「你騙人的時候會看門口。」', has('你要喝什麼？……我在倫敦想了一學期，台灣的客人都點什麼。')&&has('我在倫敦的時候常常想，台灣這邊的大家是不是都很累。')&&has('你騙人的時候會看門口。')&&!has('老樣子？'));
  fresh('2028-03-01',15,'cafe',{ZR_CARDS_SENT:['blank']}); H.FAMILIAR('heroine_02'); date('kexin'); H.picks=[0]; await run('ev_zhiruo_no_sugar');
  check('Z3 和可昕交往：加了糖的拿鐵；寄空白的＝唸「你寄空白的。……」、沒有「寫這句話的人」', has('（她做一杯拿鐵，加了糖，推給你。）')&&has('你寄空白的。……我還是貼在牆上了。')&&!has('……我那時候就在想，寫這句話的人，是不是很累。')&&!H.G.flags.ZR_GAVE_HER_ORDER);
  fresh('2028-03-01',15,'cafe',{ZR_CARDS_SENT:['noisy']}); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','POSTCARDS_GROUP',''); H.picks=[1]; await run('ev_zhiruo_no_sugar');
  check('1B-14 和別人交往中寄到店裡的：「店裡寄來的那張，最下面那句是你寫的吧。」＋那一句', has('店裡寄來的那張，最下面那句是你寫的吧。')&&has('很吵的那部。我回來以後要去看，看有多吵。')&&!has('你寄來的那張明信片，我在倫敦看了三遍。'));
  check('1B-14 回寄的 id 也認序號、選項的字', S.zrCardKey(H.G,1)==='cried'&&S.zrCardKey(H.G,'「我還沒看。先寄一張空白的。」')==='blank'&&S.zrCardKey({flags:{}},2)==='quiet'&&S.zrCardKey({flags:{TICKET_STUB:true}},2)==='noisy');
  /* ===== 1B-15 ===== */
  fresh('2028-05-19',20,'dorm',{ZQ_Q10:'nameless',FIRST_BUG:true,ZQ_MUSIC_CREDIT:true,TOLD_KAI_TELL_HER:true}); H.FAMILIAR('heroine_04'); SOCIAL.remember('heroine_04','PLAYTESTED',''); SOCIAL.remember('kai','KAI_WANTS_CREDIT','');
  at('2028-05-19',21); phone(); const qz=OUT.get(H.G,'y3_zq_q12');
  check('1B-15 5/19 21:00 子晴「明天兩點，資工系館一樓。一百個人」→ 5/20 14:00 出遊', JSON.stringify(th('p:heroine_04'))===JSON.stringify(['明天兩點，資工系館一樓。一百個人','……你會來吧'])&&!!qz&&qz.h===14);
  at('2028-05-20',13.8); await goOut('y3_zq_q12');
  check('Q1 《九點以後》、製作名單（測試、插座的位置、音樂、謝謝：爸爸）、爸爸「最後一關，我打過了。」CG；ZQ_Q12 nine、ATTENDED_SHOW', has('（一個小孩每天晚上等一個人回家，一起打一場。最後一關，那個人回來了，但小孩已經長大了，換她陪那個人打。）')&&has('測試：祐廷')&&has('插座的位置：祐廷')&&has('音樂：吉他社的學妹')&&has('謝謝：爸爸')&&has('（轉過來）最後一關，我打過了。')&&H.cgs.includes('cg_final_stage_heroine04')&&H.G.flags.ZQ_Q12==='nine'&&H.G.flags.ATTENDED_SHOW===true);
  check('Q2／Q4 阿凱 K4：「她把我放在第二行。」、KAI_WANTS_CREDIT、TOLD_KAI_TELL_HER 兩句', has('……她把我放在第二行。')&&has('我後來有跟她說。她說『你早講啊，白痴』。')&&has('你那時候叫我跟她說。我沒說。……她自己寫的。'));
  { fresh('2028-05-19',21,'dorm'); H.FAMILIAR('heroine_04'); phone(); at('2028-05-20',13.8); await goOut('y3_zq_q12');
    check('1B-15 沒有 nameless、沒有 PLAYTESTED：也是《九點以後》（AA_360 第 1 節：她自己決定）、「謝謝：爸爸」和爸爸那一幕；沒有測試那一行、沒有貓那一版', has('（一個小孩每天晚上等一個人回家，一起打一場。最後一關，那個人回來了，但小孩已經長大了，換她陪那個人打。）')&&has('謝謝：爸爸')&&has('（轉過來）最後一關，我打過了。')&&!has('（她爸爸也來了，在試玩機前玩貓，卡在第三關。）')&&!has('測試：祐廷')&&H.G.flags.ZQ_Q12==='nine');
    check('AA_363 R8 沒有 ZQ_MUSIC_CREDIT（沒演過 Q10）的玩家：製作名單照樣有「音樂：吉他社的學妹」，在「謝謝：爸爸」前面（修改前 FAIL）', !H.G.flags.ZQ_MUSIC_CREDIT&&idx('音樂：吉他社的學妹')>=0&&idx('音樂：吉他社的學妹')<idx('謝謝：爸爸'), JSON.stringify(said().slice(0,8))); }
  { fresh('2028-05-19',21,'dorm'); H.FAMILIAR('heroine_04'); phone(); at('2028-05-20',15); OUT.tick(GM); phone(); at('2028-05-20',21); phone();
    check('1B-15 沒去：當晚 21:00 製作名單的照片', th('p:heroine_04').includes('（照片：製作名單）')&&H.G.flags.ZQ_Q12_SEEN==='missed'); }
  { fresh('2028-05-20',21,'dorm',{},'JP'); H.FAMILIAR('heroine_04'); phone(); const a=S.zqCallDue(H.G); at('2028-05-20',22); phone(); check('Q3 日本路線：沒有邀約；人在日本＝當地 22:00（台灣 21:00，AA_341 J-S13）電話到期', !th('p:heroine_04').length&&!a&&S.zqCallDue(H.G));
    H.G.flags.ZQ_Q10='nameless'; H.said=[]; await S.zqCall(GM); phone(); check('Q3 《九點以後》（ZQ_Q12 nine，AA_341 J-S18）：「他打了五次。第五次過了。……」；阿凱「子晴的製作名單。」；WATCHED_SHOW_ONLINE', has('他打了五次。第五次過了。……我在後面笑到不行。')&&H.G.flags.ZQ_Q12==='nine'&&H.G.flags.WATCHED_SHOW_ONLINE===true&&th('p:kai').includes('子晴的製作名單。')); }
  /* AA_337 第 5 節：收不到子晴那則的（和阿凱 FAMILIAR 以上、認識子晴但不到 FAMILIAR）＝5/18（四）21:00 阿凱私訊 */
  { fresh('2028-05-18',20,'dorm'); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); at('2028-05-18',20.9); phone(); const a=th('p:kai').length; at('2028-05-18',21); phone(); const mk=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y3_zq_kai');
    check('AA_337 第 5 節 5/18 21:00 阿凱：「週六下午兩點，子晴學姊的發表會。資工系館一樓。」「我要去占位子。你要不要？」→「去。」「不了。」', a===0&&th('p:kai').join('|')==='週六下午兩點，子晴學姊的發表會。資工系館一樓。|我要去占位子。你要不要？'&&!!mk&&mk.ask.opts.map(o=>o.t).join('|')==='去。|不了。');
    at('2028-05-19',21); phone(); check('AA_337 第 5 節 和子晴不到 FAMILIAR：收不到子晴 5/19 那則', !th('p:heroine_04').length);
    answer('y3_zq_kai',0); phone(); const q=OUT.get(H.G,'y3_zq_q12_kai');
    check('AA_337 第 5 節 「去。」＝排出遊 5/20 13:45（資工系館展示廳）', !!q&&q.day===D('2028-05-20')&&Math.abs(q.h-13.75)<1e-6&&q.place==='資工系館一樓展示廳'&&q.ev==='ev_ziqing_q12');
    at('2028-05-20',13.6); await goOut('y3_zq_q12_kai'); check('AA_337 第 5 節 去了＝同一場發表會（製作名單、阿凱 K4）；ATTENDED_SHOW', has('製作：高子晴')&&has('……她把我放在第二行。')&&H.G.flags.ATTENDED_SHOW===true);
    at('2028-05-20',16.6); phone(); check('AA_337 第 7 節 「去。」而且去了：16:30 沒有「你說要來的。」、沒有照片', !th('p:kai').includes('你說要來的。')&&!th('p:kai').includes(CAT)&&!th('p:kai').includes(NINE), JSON.stringify(th('p:kai'))); }
  /* AA_337 第 7 節（修改前 FAIL）：回了「去。」卻沒到發表會＝16:30 阿凱三則 */
  { fresh('2028-05-18',21,'dorm'); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',0); phone(); const q=OUT.get(H.G,'y3_zq_q12_kai');
    at('2028-05-20',15); OUT.tick(GM); phone(); const a=th('p:kai').length; at('2028-05-20',16.4); phone(); const b=th('p:kai').length; at('2028-05-20',16.5); phone(); const L=th('p:kai');
    check('AA_337 第 7 節＋AA_363 R1＋AA_513 1-3 「去。」卻沒到（出遊過了時間＝missed）：16:30 阿凱「你說要來的。」「……我幫你拍了。」＋《九點以後》的照片（修改前是貓）＋「所以我坐第一排」「她叫我不要坐第一排」；16:30 以前沒有；沒有「好。我幫你拍。」',
      !!q&&q.state==='missed'&&a===b&&L.length===b+5&&JSON.stringify(L.slice(-5))===JSON.stringify(['你說要來的。','……我幫你拍了。',NINE].concat(ROW))&&!L.includes('好。我幫你拍。'), JSON.stringify(L)); }
  { fresh('2028-05-18',21,'dorm'); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',0); phone(); at('2028-05-20',13.75); H.picks=[2]; await OUT.prompt(GM,OUT.get(H.G,'y3_zq_q12_kai')); at('2028-05-20',16.5); phone();
    check('AA_337 第 7 節＋AA_363 R1＋AA_513 1-3 「去。」到了出發又選「不去了」：16:30 同樣是阿凱三則（照片是《九點以後》）＋照片後面兩則', JSON.stringify(th('p:kai').slice(-5))===JSON.stringify(['你說要來的。','……我幫你拍了。',NINE].concat(ROW)), JSON.stringify(th('p:kai'))); }
  { fresh('2028-05-18',21,'dorm'); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',1); phone(); const n=th('p:kai').length; at('2028-05-20',16.4); phone(); const b=th('p:kai').length; at('2028-05-20',16.5); phone();
    check('AA_337 第 5 節＋AA_363 R1＋AA_513 1-3 「不了。」→ 阿凱「好。我幫你拍。」→ 5/20 16:30「📷（投影幕上，一個小孩坐在玄關，腿上放著兩支搖桿。標題：《九點以後》）」（修改前是貓）＋「所以我坐第一排」「她叫我不要坐第一排」；不排出遊', th('p:kai').includes('好。我幫你拍。')&&b===n&&JSON.stringify(th('p:kai').slice(-3))===JSON.stringify([NINE].concat(ROW))&&!th('p:kai').includes(CAT)&&!OUT.get(H.G,'y3_zq_q12_kai')&&!th('p:kai').includes('你說要來的。'), JSON.stringify(th('p:kai'))); }
  /* AA_363 R1：舊存檔已經演過貓那一版（ZQ_Q12 'cat'）照舊用貓的照片（兩種都是）；舊版本已經排進手機佇列、還沒送出的貓（ZQ_Q12 不是 cat）16:30 送出的是《九點以後》*/
  { fresh('2028-05-18',21,'dorm',{ZQ_Q12:'cat'}); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',1); phone(); at('2028-05-20',16.5); phone(); const a=th('p:kai').slice(-3);
    fresh('2028-05-18',21,'dorm',{ZQ_Q12:'cat'}); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',0); phone(); at('2028-05-20',15); OUT.tick(GM); phone(); at('2028-05-20',16.5); phone(); const b=th('p:kai').slice(-3);
    check('AA_363 R1 舊存檔 ZQ_Q12 cat：「不了。」和「去。」卻沒到的照片都照舊是貓（後面照樣是 AA_513 1-3 那兩則）', JSON.stringify(a)===JSON.stringify([CAT].concat(ROW))&&JSON.stringify(b)===JSON.stringify([CAT].concat(ROW)), JSON.stringify([a,b])); }
  { fresh('2028-05-18',21,'dorm'); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',1); PHONE.at(H.G,D('2028-05-20'),16.5,[{th:'p:kai',from:'kai',text:CAT}],'y3_zq_kai_photo');   /* 舊版本在回「不了。」的時候就排好的那一則 */
    at('2028-05-19',12); phone(); at('2028-05-20',16.5); phone(); const L=th('p:kai');
    fresh('2028-05-18',21,'dorm'); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); phone(); answer('y3_zq_kai',1); PHONE.at(H.G,D('2028-05-20'),16.5,[{th:'p:kai',from:'kai',text:CAT}],'y3_zq_kai_photo'); H.G.flags.ZQ_Q12='cat'; at('2028-05-20',16.5); phone(); const L2=th('p:kai');
    check('AA_363 R1 舊存檔已經排好、還沒送出的貓：送出的是《九點以後》（只一則）；ZQ_Q12 cat 的照舊是貓；舊版本排好的那一組沒有 AA_513 1-3 那兩則＝送出前補在照片後面（各一次）',
      L.filter(t=>t===NINE).length===1&&!L.includes(CAT)&&JSON.stringify(L.slice(-3))===JSON.stringify([NINE].concat(ROW))&&L.filter(t=>t===ROW[0]).length===1&&JSON.stringify(L2.slice(-3))===JSON.stringify([CAT].concat(ROW))&&!L2.includes(NINE), JSON.stringify([L,L2])); }
  { const none=(fl,route,setup)=>{ fresh('2028-05-18',21,'dorm',fl,route); setup(); phone(); return !th('p:kai').length; };
    check('AA_337 第 5 節 跟阿凱不熟、和子晴 FAMILIAR 以上、日本路線：都沒有阿凱那則', none({},null,()=>{ H.rel('heroine_04',10,0,0); })&&none({},null,()=>{ H.FAMILIAR('kai'); H.FAMILIAR('heroine_04'); })&&none({},'JP',()=>{ H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); })); }
  /* ===== 1B-16 ===== */
  fresh('2028-05-01',20,'dorm'); date('kexin'); at('2028-05-01',21); phone(); const m19=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y3_kx19');
  check('1B-16 5/1 21:00 可昕兩則、「去。」「那天不行。」', JSON.stringify(th('p:kexin'))===JSON.stringify(['我的期末報告被選去發表。禮拜三下午三點。','你要來的話，坐最後一排。'])&&!!m19&&m19.ask.opts.map(o=>o.t).join('|')==='去。|那天不行。');
  answer('y3_kx19',0); phone(); at('2028-05-03',14.2); await goOut('y3_kx19',[1]);
  check('K1 去了：最後一排、停半秒、CG；「你坐最後一排。我看得到。」；KX_PRESENT came', has('（政大的小教室。你坐在最後一排。她講到一半看了你一眼，停了半秒，接著講完。）')&&has('你坐最後一排。我看得到。……講得還好嗎？')&&has('因為你真的坐最後一排。')&&H.cgs.includes('cg_last_row_kexin')&&H.G.flags.KX_PRESENT==='came');
  { fresh('2028-05-03',16,'dorm',{},'JP'); date('kexin'); at('2028-05-03',17); phone(); const a=th('p:kexin').includes('報告講完了。……好累。'); at('2028-05-03',18); phone(); check('K2 日本路線：照片＋「報告講完了。……好累。」（沒收到「坐最後一排」的邀約，AA_377 第 13 項；人在日本＝臺灣 17:00＝當地 18:00，AA_341 J-S13）；KX_PRESENT photo', !a&&th('p:kexin').includes('報告講完了。……好累。')&&!th('p:kexin').some(t=>/最後一排/.test(t))&&H.G.flags.KX_PRESENT==='photo'); }
  /* ===== 1B-17 ===== */
  /* AA_337 第 6 節：群組「收到。」後面不掛選項；「生日快樂」改成玩家在學姊的私訊用 MSG-2 的話題，回覆照她回訊息的時間（12:10／17:05／22:30）*/
  const bdayTp=()=>MSG.topics(H.G,'heroine_05').map(q=>q.k).includes('bday');
  fresh('2028-06-02',11,'dorm'); H.FRIEND('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); at('2028-06-02',12); phone();
  check('1B-17 白天家族群組：Kevin「學姊今天生日！」學姊「收到。」；後面不掛選項（AA_337）', JSON.stringify(th('g:family_law'))===JSON.stringify(['學姊今天生日！','收到。'])&&!(H.G.msgs||[]).some(m=>m.ask)&&!th('p:heroine_05').length);
  { const tp=bdayTp(), r=MSG.send(H.G,'heroine_05','bday'); const a=th('p:heroine_05').slice(); at('2028-06-02',12.2); phone();
    check('S1 朋友：學姊的私訊有「生日快樂」（MSG-2）；傳了 12:10 才回「謝謝。研究室的人買了一個小蛋糕。」；SIS_BDAY_Y3 msg', tp&&r.ok&&JSON.stringify(a)===JSON.stringify(['生日快樂'])&&JSON.stringify(th('p:heroine_05'))===JSON.stringify(['生日快樂','謝謝。研究室的人買了一個小蛋糕。'])&&H.G.flags.SIS_BDAY_Y3==='msg', JSON.stringify(th('p:heroine_05'))); }
  fresh('2028-06-02',12,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); MSG.send(H.G,'heroine_05','bday'); phone(); const qb0=OUT.get(H.G,'y3_sis_bday'); at('2028-06-02',12.2); phone();
  check('1B-17 交往中：12:10 回「蛋糕我買了。……」「六點，兩點半 Café。……」→ 她的回覆到了才排 Café', !qb0&&th('p:heroine_05').join('|')==='生日快樂|蛋糕我買了。……一個人吃很奇怪。|六點，兩點半 Café。你點什麼都可以。'&&!!OUT.get(H.G,'y3_sis_bday')&&H.G.flags.SIS_BDAY_Y3==='invited');
  at('2028-06-02',18); H.G.zone='cafe'; check('1B-17 18:00 在 Café＝演', S.bdayCafeDue(H.G)); await run('ev_sis_birthday_y3');
  check('S2 交往中、去 Café：兩支叉子；SIS_BDAY_Y3 cafe', has('（Café 窗邊，一小塊蛋糕，兩支叉子。）')&&has('……你先吃。我看你吃。')&&H.G.flags.SIS_BDAY_Y3==='cafe');
  { fresh('2028-06-02',12,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); MSG.send(H.G,'heroine_05','bday'); at('2028-06-02',12.2); phone(); at('2028-06-02',21); phone();
    check('S3 交往中、沒去：21:00「另一半在冰箱，明天還算生日。」', th('p:heroine_05').includes('蛋糕我吃了一半。另一半在冰箱，明天還算生日。')&&H.G.flags.SIS_BDAY_Y3==='missed'); }
  /* AA_337 第 7 節（修改前 FAIL：原本暫用「蛋糕我吃了一半。……」記 missed）：交往中、17:05 以後才傳＝22:30「謝謝。今天研究室比較晚。」「蛋糕留了一半。……明天下午，Café？」＋「好。」／「明天不行。」 */
  const late22=()=>{ fresh('2028-06-02',17.5,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); MSG.send(H.G,'heroine_05','bday'); at('2028-06-02',21); phone(); const n21=th('p:heroine_05').length; at('2028-06-02',22.5); phone();
    return {n21,m:(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y3_sis_bday_late')}; };
  { const {n21,m}=late22();
    check('AA_337 第 7 節 交往中、17:05 以後才傳：21:00 還沒回、不排六點的 Café；22:30「謝謝。今天研究室比較晚。」「蛋糕留了一半。……明天下午，Café？」＋「好。」「明天不行。」；沒有「蛋糕我吃了一半。……」',
      n21===1&&th('p:heroine_05').join('|')==='生日快樂|謝謝。今天研究室比較晚。|蛋糕留了一半。……明天下午，Café？'&&!!m&&m.text==='蛋糕留了一半。……明天下午，Café？'&&m.ask.opts.map(o=>o.t).join('|')==='好。|明天不行。'&&!OUT.get(H.G,'y3_sis_bday')&&H.G.flags.SIS_BDAY_Y3==='late_ask', JSON.stringify(th('p:heroine_05')));
    answer('y3_sis_bday_late',0); phone(); const q=OUT.get(H.G,'y3_sis_bday_next'), d3=D('2028-06-03');
    check('AA_337 第 7 節 「好。」→ 學姊「三點。」→ 排 6/3（六）15:00 兩點半 Café', th('p:heroine_05').slice(-2).join('|')==='好。|三點。'&&!!q&&q.day===d3&&q.h===15&&q.goto&&q.goto.zone==='cafe'&&CALENDAR.dateOf(d3).wd===6&&H.G.flags.SIS_BDAY_Y3==='next_cafe', JSON.stringify(q));
    at('2028-06-03',14.8); H.G.zone='dorm'; await goOut('y3_sis_bday_next'); const due=S.bdayCafeDue(H.G); await run('ev_sis_birthday_y3');
    check('AA_337 第 7 節 6/3 15:00 到 Café＝「去了」那一場（窗邊、一小塊蛋糕、兩支叉子、「……你先吃。我看你吃。」）；記 cafe；整段沒有「蛋糕我吃了一半。……」', due&&has('（Café 窗邊，一小塊蛋糕，兩支叉子。）')&&has('……你先吃。我看你吃。')&&H.G.flags.SIS_BDAY_Y3==='cafe'&&!th('p:heroine_05').includes('蛋糕我吃了一半。另一半在冰箱，明天還算生日。')); }
  { late22(); answer('y3_sis_bday_late',1); phone(); at('2028-06-03',15); phone();
    check('AA_337 第 7 節 「明天不行。」→ 學姊「好。那蛋糕歸我。」；記 missed；不排 Café、沒有「蛋糕我吃了一半。……」', th('p:heroine_05').slice(-2).join('|')==='明天不行。|好。那蛋糕歸我。'&&H.G.flags.SIS_BDAY_Y3==='missed'&&!OUT.get(H.G,'y3_sis_bday_next')&&!S.bdayCafeDue(Object.assign({},H.G,{zone:'cafe'}))&&!th('p:heroine_05').includes('蛋糕我吃了一半。另一半在冰箱，明天還算生日。'), JSON.stringify(th('p:heroine_05'))); }
  { late22(); at('2028-06-03',15.1); phone(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='y3_sis_bday_late');
    check('AA_337 第 7 節 22:30 那則一直沒回：6/3 15:00 以後不能回（until）、記 missed（暫定：不另外傳）', !!m&&!PHONE.askOpen(H.G,m)&&H.G.flags.SIS_BDAY_Y3==='missed'&&th('p:heroine_05').slice(-1)[0]==='蛋糕留了一半。……明天下午，Café？'); }
  /* AA_337 第 7 節（AA-C 20:57 改字）：22:30 以後才傳＝隔天 12:10「謝謝。昨天十點半就睡了，剛看到。」「蛋糕還在冰箱。……今天下午三點，Café？」（MSG 不另外加「抱歉，昨天十點半就睡了。」）＋「好。」／「今天不行。」 */
  const late23=()=>{ fresh('2028-06-02',22.7,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); MSG.send(H.G,'heroine_05','bday'); at('2028-06-03',12.2); phone();
    return (H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y3_sis_bday_late'); };
  { const m=late23(), d3=D('2028-06-03');
    check('AA_337 第 7 節 22:30 以後才傳：6/3 12:10「謝謝。昨天十點半就睡了，剛看到。」「蛋糕還在冰箱。……今天下午三點，Café？」＋「好。」「今天不行。」；沒有「抱歉，昨天十點半就睡了。」',
      th('p:heroine_05').join('|')==='生日快樂|謝謝。昨天十點半就睡了，剛看到。|蛋糕還在冰箱。……今天下午三點，Café？'&&!!m&&m.ask.opts.map(o=>o.t).join('|')==='好。|今天不行。'&&H.G.flags.SIS_BDAY_Y3==='late_ask'&&H.G.flags.SIS_BDAY_Y3_NEXT===d3, JSON.stringify(th('p:heroine_05')));
    answer('y3_sis_bday_late',0); phone(); const q=OUT.get(H.G,'y3_sis_bday_next');
    check('AA_337 第 7 節 22:30 以後才傳「好。」→ 當天 6/3 15:00 兩點半 Café（她不再說「三點。」）', th('p:heroine_05').slice(-1)[0]==='好。'&&!!q&&q.day===d3&&q.h===15&&H.G.flags.SIS_BDAY_Y3==='next_cafe', JSON.stringify(th('p:heroine_05').slice(-2))); }
  { late23(); answer('y3_sis_bday_late',1); phone();
    check('AA_337 第 7 節 22:30 以後才傳「今天不行。」→「好。那蛋糕歸我。」記 missed、不排 Café', th('p:heroine_05').slice(-2).join('|')==='今天不行。|好。那蛋糕歸我。'&&H.G.flags.SIS_BDAY_Y3==='missed'&&!OUT.get(H.G,'y3_sis_bday_next')); }
  /* AA_337 第 7 節：日本路線、和學姊交往中（人在日本、手機是當地時間）＝「蛋糕我買了。……一個人吃很奇怪。」「你那邊七點吧。視訊，十分鐘。」→ 台灣 18:00（當地 19:00）視訊 */
  { fresh('2028-06-02',12,'dorm',{},'JP'); H.FRIEND('heroine_05'); date('heroine_05'); MSG.send(H.G,'heroine_05','bday'); at('2028-06-02',12.2); phone();
    const t=th('p:heroine_05').join('|'); at('2028-06-02',18.9); const d0=S.bdayVideoDue(H.G); at('2028-06-02',19); const d1=S.bdayVideoDue(H.G), hd=S.homeDue(H.G);
    check('AA_337 第 7 節 日本路線＋交往中：回「蛋糕我買了。……一個人吃很奇怪。」「你那邊七點吧。視訊，十分鐘。」；不排 Café；當地 18:54 還沒、19:00（台灣 18:00）視訊到期（在家也演）', t==='生日快樂|蛋糕我買了。……一個人吃很奇怪。|你那邊七點吧。視訊，十分鐘。'&&!OUT.get(H.G,'y3_sis_bday')&&!d0&&d1&&hd==='stay'&&H.G.flags.SIS_BDAY_Y3==='video_set', JSON.stringify({t,d0,d1,hd}));
    await run('ev_sis_birthday_video_y3'); at('2028-06-02',21.5); phone();
    check('AA_337 第 7 節 日本路線 視訊：旁白「（她把一小塊蛋糕舉到鏡頭前，用叉子切了一口。）」＋「……你看到了。這樣算一起吃過。」；記 video；21:00 沒有「蛋糕我吃了一半。……」', has('（她把一小塊蛋糕舉到鏡頭前，用叉子切了一口。）')&&has('……你看到了。這樣算一起吃過。')&&H.G.flags.SIS_BDAY_Y3==='video'&&!S.bdayVideoDue(H.G)&&!th('p:heroine_05').includes('蛋糕我吃了一半。另一半在冰箱，明天還算生日。'), JSON.stringify(H.said.map(s=>s.t))); }
  { fresh('2028-06-02',17.5,'dorm',{},'JP'); H.FRIEND('heroine_05'); date('heroine_05'); MSG.send(H.G,'heroine_05','bday'); at('2028-06-02',19); const d1=S.bdayVideoDue(H.G); at('2028-06-02',22.5); phone();
    check('1B-17 日本路線、17:05 以後才傳（她回的時候視訊的時間已經過了；AA_392 第 9 節確認）：只回「蛋糕我買了。……一個人吃很奇怪。」、沒有視訊、記 missed', !d1&&th('p:heroine_05').join('|')==='生日快樂|蛋糕我買了。……一個人吃很奇怪。'&&H.G.flags.SIS_BDAY_Y3==='missed', JSON.stringify(th('p:heroine_05'))); }
  { fresh('2028-06-02',12,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); ROM.end(H.G,'heroine_05','test'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); MSG.send(H.G,'heroine_05','bday'); at('2028-06-02',12.2); phone();
    check('1B-17 前任：只回「謝謝。」', JSON.stringify(th('p:heroine_05'))===JSON.stringify(['生日快樂','謝謝。'])&&H.G.flags.SIS_BDAY_Y3==='msg', JSON.stringify(th('p:heroine_05'))); }
  { fresh('2028-06-02',12,'dorm'); H.FAMILIAR('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); const a=bdayTp(); at('2028-06-03',12); const b=bdayTp();
    fresh('2027-06-02',12,'dorm'); H.FRIEND('heroine_05'); MSG.send(H.G,'heroine_05','bday'); at('2027-06-02',12.2); phone();
    check('1B-17 不到 FRIEND（也不是交往、前任）：2028 沒有「生日快樂」、沒有群組那則；6/3 沒有；2027 照 MSG-2 原本的回覆池', !a&&!b&&!th('g:family_law').length&&th('p:heroine_05').slice(-1)[0]==='謝謝。今天的計畫本，我沒有排事情。', JSON.stringify(th('p:heroine_05'))); }
  /* ===== 1B-18＋22 ===== */
  fresh('2028-07-26',20,'dorm',{SAID_HAS_CAR:true}); H.FRIEND('heroine_05'); SOCIAL.remember('heroine_05','FAMILY_DINNER',''); PHONE.join(H.G,'family_law','法律系直屬家族'); at('2028-07-26',21); phone();
  const mr=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_ride');
  check('1B-18 7/26 21:00 家族群組「八月二號早上的飛機。」「我搭客運去機場。大家不用送。」＋「我送妳。我有車。」', th('g:family_law').join('|')==='八月二號早上的飛機。|我搭客運去機場。大家不用送。'&&!!mr&&mr.ask.opts[0].t==='我送妳。我有車。');
  answer('y4_sis_ride',0); phone(); PHONE.tick(H.G); at('2028-07-26',21.3); phone();
  check('W1 單身、FRIEND 以上：Kevin「學弟的車！家聚那台！」（AA_207 §7 第 5 列：Kevin 不是直屬）→ 兩個人：她私訊「……你確定？……」；排 8/2 08:00（鬧鐘）', th('g:family_law').includes('學弟的車！家聚那台！')&&!th('g:family_law').includes('直屬學弟的車！家聚那台！')&&th('p:heroine_05').join('|')==='……你確定？到機場要一個多小時，還要上高速公路。|確定。|……好。'&&OUT.get(H.G,'y4_sis_airport')&&OUT.get(H.G,'y4_sis_airport').alarm===true);
  at('2028-08-02',7.9); await goOut('y4_sis_airport');
  check('W1 兩個人的車、機場「回程路上喝。冰的。」「……回到家傳訊息給我。」；DROVE_HER；SIS_SENDOFF two', has('（她一路看著前面的路。）')&&has('回程路上喝。冰的。')&&has('……回到家，傳訊息給我。')&&!has('（Kevin 一路講話，學妹睡著。）')&&SOCIAL.has('heroine_05','DROVE_HER')&&H.G.flags.SIS_SENDOFF==='two');
  check('AA_337 第 3 題 機場的旁白改早上：下車處第一句「（八月的早上，機場外面已經很熱了。）」（沒有午後雷陣雨）', idx('（八月的早上，機場外面已經很熱了。）')>idx('（她一路看著前面的路。）')&&idx('（八月的早上，機場外面已經很熱了。）')<idx('回程路上喝。冰的。')&&!H.said.some(s=>/雷陣雨/.test(s.t)));
  at('2028-08-03',9); phone();
  check('W1 8/3 私訊 US0「是因為那是高速公路。」', th('p:heroine_05').includes('是因為那是高速公路。')&&!th('g:family_law').includes('這裡的天空很大，大家保重。'));
  PHONE.post(H.G,{th:'p:heroine_05',from:'player',who:null,text:'謝謝'}); phone(); check('1B-18 回了 US0＝REPLIED_US0', H.G.flags.REPLIED_US0===true&&SOCIAL.has('heroine_05','REPLIED_US0'));
  { fresh('2028-07-26',21,'dorm',{HOOK_SIS_SENDOFF:1,SAID_HAS_CAR:true}); H.FRIEND('heroine_05'); date('kexin'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); const gb=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_ride'); at('2028-07-26',21.1); phone(); answer('y4_sis_hook_dm',0); phone(); PHONE.tick(H.G); at('2028-07-26',21.3); phone();
    /* AA_392 第 2-2 節：說過要送的（HOOK_SIS_SENDOFF）群組那則沒有 Kevin 的按鈕，21:05 她私訊「八月二號早上八點，我家樓下。」「你說要送我。」→「我開車去載妳。」＝照原本的共乘 */
    check('W2 交往中（別人）、說過要送：群組沒有按鈕；私訊回「我開車去載妳。」→「我也要去！我坐後面！」學妹「我也要！」', !(gb&&gb.ask)&&th('p:heroine_05').slice(0,2).join('|')==='八月二號早上八點，我家樓下。|你說要送我。'&&th('g:family_law').includes('我也要去！我坐後面！')&&th('g:family_law').includes('我也要！'), JSON.stringify(th('p:heroine_05')));
    at('2028-08-02',7.9); await goOut('y4_sis_airport');
    check('W2 家族共乘：「Kevin，看前面的是司機，不是你。」、說過要送＝「……你說你會來。」、「回到家在群組說一聲」', has('Kevin，看前面的是司機，不是你。')&&has('……你說你會來。')&&has('……回到家，在群組說一聲。')&&H.G.flags.SIS_SENDOFF==='family');
    /* 2026-10-28 改：AA_497 5-4（企劃線 7a38216ca）「學姊多講兩個字」只留第一次——US0 第 2、3 則換成 Kevin「天空有多大 拍給我們看啦」、學姊「（照片：停車場上面的天空）」「大家保重。」（tests/aa497_supporting_unit.js 5-4）*/
    at('2028-08-03',9); phone(); { const T=th('g:family_law'), i=T.indexOf('到了。天空很大。'); check('1B-18 家族共乘：US0 在家族群組「到了。天空很大。」「天空有多大 拍給我們看啦」「（照片：停車場上面的天空）」「大家保重。」（AA_497 5-4）', i>=0&&JSON.stringify(T.slice(i,i+4))===JSON.stringify(['到了。天空很大。','天空有多大 拍給我們看啦','（照片：停車場上面的天空）','大家保重。'])&&!T.includes('學姊妳可以多講兩個字'), JSON.stringify(T.slice(-6))); } }
  { fresh('2028-07-26',21,'dorm',{},'JP'); H.FRIEND('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); const early=(H.G.msgs||[]).some(x=>x.text==='我搭客運去機場。大家不用送。');
    at('2028-07-26',22); phone(); const m=(H.G.msgs||[]).find(x=>x.text==='我搭客運去機場。大家不用送。');
    at('2028-08-03',9.9); phone(); const early2=th('g:family_law').includes('到了。天空很大。'); at('2028-08-03',10); phone();
    check('W4 日本路線（人在日本：台灣時間＋1）：7/26 群組照發（當地 22:00）、沒有按鈕；8/3 群組「這裡的天空很大」（當地 10:00）', !early&&!!m&&!m.ask&&!early2&&th('g:family_law').includes('到了。天空很大。')); }
  { fresh('2028-07-26',22,'dorm'); H.FRIEND('heroine_05'); H.FAMILIAR('heroine_03'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); at('2028-08-02',9); phone();
    check('1B-18 沒說要送：8/2 09:00 客運的照片「出發了。」；SIS_SENDOFF bus', th('g:family_law').includes('（照片：客運的窗外）')&&H.G.flags.SIS_SENDOFF==='bus');
    at('2028-08-10',19); H.G.zone='noodle'; const nb=ev('ev_sis_note_bus'); const before=EVENTS.check(nb); GM.npc.heroine_03={obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}; E.npcs=[GM.npc.heroine_03]; const after=EVENTS.check(nb);
    await run('ev_sis_note_bus'); check('1B-18 之後第一次在麵店遇到語彤（她在店裡）：「學姊叫我拿給你的。」（一張便條：「好好念書。」）', !before&&after&&has('學姊叫我拿給你的。')&&has('（一張便條：「好好念書。」）')); E.npcs=[]; }
  /* M6 */
  { fresh('2028-08-04',8,'dorm',{SIS_SENDOFF:'bus'}); H.FRIEND('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族');
    for(let d=D('2028-08-04');d<D('2028-08-06');d++){ H.G.day=d; H.G.hour=9.5; phone(); }
    check('M6 每天一張照片（沒有字；8/3 抵達那則 US0 裡的照片不算，AA_497 5-4）', (H.G.msgs||[]).filter(m=>m.th==='g:family_law'&&/^（照片：/.test(m.text)&&m.tag!=='y4_us0').length===2);
    at('2028-08-06',18.9); phone(); const n0=th('g:family_law').length; at('2028-08-06',19); phone(); const q1=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_m6_q1');
    check('M6 週日 19:00 第一題：「（照片）」「今天的爭論題：這裡的學生直接叫教授的名字。要不要學？」「你們先講。我這裡早上七點。」三選一（19:00 以前不發）', th('g:family_law').length===n0+3&&th('g:family_law').includes('今天的爭論題：這裡的學生直接叫教授的名字。要不要學？')&&!!q1&&q1.ask.opts.length===3);
    answer('y4_m6_q1',2); check('M6 選一個立場：她回一句、Kevin「我去睡了」；ARGUED_GOOD', th('g:family_law').includes('那要先知道對方喜歡怎麼被叫。我還不知道。')&&th('g:family_law').slice(-1)[0]==='我去睡了'&&SOCIAL.has('heroine_05','ARGUED_GOOD'));
    for(let d=D('2028-08-07');d<D('2028-08-20');d++){ H.G.day=d; H.G.hour=9.5; phone(); }
    check('M6 每天的照片只留最近 7 張', (H.G.msgs||[]).filter(m=>/^y4_m6_d\d+$/.test(m.tag||'')).length===7, String((H.G.msgs||[]).filter(m=>/^y4_m6_d\d+$/.test(m.tag||'')).length));
    const sun=S.m6Sundays(); at('2028-09-17',19); phone(); check('M6 六題用完（第 7 個週日）：「今天不吵。今天只放空白。」', sun.length>=7&&sun[6]===D('2028-09-17')&&th('g:family_law').includes('今天不吵。今天只放空白。'));
    at('2028-11-12',19.5); phone(); const a=th('g:family_law').filter(t=>/^今天不吵。/.test(t)).length; at('2028-11-12',20); phone(); const b=th('g:family_law').filter(t=>/^今天不吵。/.test(t)).length;   /* 11/12 是第 9 個「不吵」的週日（AA_464 第 2 節換句）*/
    check('M6 11/5 起 20:00（她那邊早上七點）', b===a+1); }
  /* 美國路線一起出發 */
  { fresh('2028-08-02',13,'airport_dep',{US_DEPARTED:true},'US'); date('heroine_05'); check('W3 美國路線：在機場（3D）＝一起出發到期', S.usDepartDue(H.G));
    await run('ev_sis_depart_us'); check('W3 「護照、簽證、學校的文件。……你的拿出來，我看一次。」（AA_370 L8：不寫死 I-20）、媽媽塞鳳梨酥、「走了。」；SIS_SENDOFF together', has('護照、簽證、學校的文件。……你的拿出來，我看一次。')&&has('（你媽媽塞了一袋鳳梨酥給學姊。）')&&has('走了。')&&H.G.flags.SIS_SENDOFF==='together'&&!S.usDepartDue(H.G));
    H.said=[]; H.cards=[]; await EXCH.fly(GM); check('W3 登機：先演登機口「（她在看一本論文。飛機起飛的時候，她把書闔上了。）」再飛', has('（她在看一本論文。飛機起飛的時候，她把書闔上了。）')&&H.G.flags.US_ARRIVED===true&&H.cards.some(c=>c[0]==='飛往美國')); }
  { fresh('2028-08-02',13,'airport_dep',{US_DEPARTED:true},'US'); date('heroine_05'); date('kexin'); await run('ev_sis_depart_us');
    check('1B-18 9-1b 美國、和可昕也在交往、她不知道：兩袋鳳梨酥、可昕「十二個小時，我算過了。」', has('（你媽媽塞了兩袋鳳梨酥，一袋給學姊。）')&&has('到了傳訊息。十二個小時，我算過了。'));
    const hug='（可昕抱了你一下，很快就放開。學姊在看手機上的登機證。）';
    check('AA_337 第 6 節 美國路線、可昕不知道：先抱一下的旁白，再「到了傳訊息。十二個小時……」', idx(hug)>=0&&idx(hug)<idx('到了傳訊息。十二個小時，我算過了。')); }
  { fresh('2028-08-02',13,'airport_dep',{US_DEPARTED:true},'US'); date('heroine_05'); date('kexin'); ROM.relRec(H.G).kexin={heroine_05:true}; await run('ev_sis_depart_us');
    check('AA_337 第 6 節 美國路線、可昕知道：只有她那一句，沒有動作', has('……我知道你們同一班。到了傳訊息。兩個都是。')&&!H.said.some(s=>/抱了你一下/.test(s.t))); }
  { fresh('2028-07-26',21,'dorm',{},'US'); date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); check('1B-18 美國路線：7/26 那則不發（同一班飛機）', !th('g:family_law').length); }
  /* ===== 1B-19 ===== */
  fresh('2028-10-19',21.6,'wancai'); H.FAMILIAR('heroine_01'); for(const k of ['2028-09-14','2028-09-21','2028-09-28']) H.G.acts.att['public_law_group@'+D(k)]={end:'full'};
  check('1B-19 讀書會大四上有開（10/19 週四），第 15 週（12/14）停一次', (()=>{ const A=ACTIVITIES.list.find(a=>a.id==='public_law_group'); const G0={day:D('2028-10-19'),hour:20,flags:{},stage:'law'}; const G1={day:D('2028-12-14'),hour:20,flags:{},stage:'law'}; return !!ACTIVITIES.on(A,G0.day,G0)&&!ACTIVITIES.on(A,G1.day,G1); })());
  check('N1 讀書會常去：散會以後在萬才館＝走廊', S.an18Due(H.G)); H.picks=[2]; await run('ev_an_her_choice');
  check('N1 「考台大法研所，商法組」；三選一；AN_CHOICE_TOLD', has('我決定了。考台大法研所，商法組。')&&has('公司法、證交法、保險法。這兩年讀下來，最想再讀的是這些。')&&H.opts[0].length===3&&has('知道。Alison 說我背叛憲法。')&&SOCIAL.has('heroine_01','AN_CHOICE_TOLD')&&H.G.flags.AN_CHOICE==='here');
  { fresh('2028-10-19',21.6,'wancai'); H.FAMILIAR('heroine_01'); date('heroine_01'); H.G.acts.att['public_law_group@'+D('2028-10-19')]={end:'full'}; await run('ev_an_her_choice');
    check('N2 和以安交往中：「……今天跟你說。」（AA_337 第 4 節改句）', has('昨天先跟我媽說了。……今天跟你說。')&&!H.said.some(s=>/你是第二個/.test(s.t))&&!has('公司法、證交法、保險法。這兩年讀下來，最想再讀的是這些。')); }
  { fresh('2028-10-19',21.6,'wancai'); H.FAMILIAR('heroine_01'); H.FAMILIAR('yu'); date('kexin'); H.G.acts.att['public_law_group@'+D('2028-10-19')]={end:'full'}; H.picks=[2]; await run('ev_an_her_choice');
    const y1=idx('我先說，這是背叛憲法。'), y2=idx('……商法的考古題，我明天印給妳。'), a4=idx('念完以後，司法官還是事務所，還沒決定。……先考上。');
    check('AA_337 第 4 節 和別人交往中、Alison 也在：以安四句之後 Alison 兩句「我先說，這是背叛憲法。」「……商法的考古題，我明天印給妳。」', a4>=0&&y1>a4&&y2===y1+1&&H.said[y1].who&&/Alison/.test(H.said[y1].who), JSON.stringify(H.said[y1]));
    check('AA_337 第 4 節 這一版「讀書會那邊知道嗎？」＝以安「知道。」＋「（她看了 Alison 一眼。Alison 在看天花板。）」', H.opts[0][2]==='「讀書會那邊知道嗎？」'&&has('知道。')&&has('（她看了 Alison 一眼。Alison 在看天花板。）')&&!has('知道。Alison 說我背叛憲法。')&&!has('……她講完就去幫我印商法的考古題了。')&&H.G.flags.AN_CHOICE==='here'); }
  { fresh('2028-10-19',21.6,'wancai'); H.FAMILIAR('heroine_01'); H.FAMILIAR('yu'); date('heroine_01'); date('kexin'); H.G.acts.att['public_law_group@'+D('2028-10-19')]={end:'full'}; H.picks=[2]; await run('ev_an_her_choice');
    check('1B-19 和以安交往中（也和別人交往）：Alison 先走了＝沒有 Alison 那兩句、選項照主版', has('昨天先跟我媽說了。……今天跟你說。')&&!has('我先說，這是背叛憲法。')&&has('知道。Alison 說我背叛憲法。')); }
  { fresh('2028-10-19',21.6,'dorm'); H.FAMILIAR('heroine_01'); PHONE.join(H.G,'noodle_team','麵店團'); check('N3 不在萬才館：不演走廊', !S.an18Due(H.G)); at('2028-10-19',22); phone();
    check('N3 22:00 麵店團群組一則；記「聽說」', th('g:noodle_team').includes('我決定了。考台大法研所，商法組。')&&SOCIAL.has('heroine_01','AN_CHOICE_TOLD')&&H.G.flags.AN_CHOICE==='group'); }
  { fresh('2028-10-19',9,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FAMILIAR('heroine_01'); date('heroine_01'); at('2028-10-19',10); H.G.zone='us_apartment'; phone();
    const qv=OUT.get(H.G,'y4_an18_video');   /* AA_296 2-3-1 ①（企劃線 3f406dbc）：原本這一刻就是兩則私訊，改成她打來的視訊；私訊變成沒接的替代版（台詞、逐字對稿在 tests/aa296_phone_live_unit.js）*/
    check('1B-19 美國路線、和以安交往中：當地 10:00 她打來的視訊（AA_296 ①；不發群組、不先傳私訊）', !!qv&&qv.place==='視訊'&&Math.abs(qv.h-10)<1e-6&&!!OUT.due(H.G)&&!th('p:heroine_01').length&&!th('g:noodle_team').length, JSON.stringify(qv));
    at('2028-10-19',10.6); phone();
    check('1B-19 美國路線、和以安交往中、視訊沒接（30 分鐘）：照原本當地 10:00 的私訊「先跟我媽說了。然後是你。……你那邊早上十點，先去上課。」（AA_337 第 4 節改句）', th('p:heroine_01').includes('先跟我媽說了。然後是你。……你那邊早上十點，先去上課。')&&!th('p:heroine_01').some(t=>/你是第二個/.test(t))&&H.G.flags.AN_CHOICE==='dm'); }
  /* ===== 1B-20 ===== */
  fresh('2028-12-11',20,'dorm'); H.FAMILIAR('heroine_01'); PHONE.join(H.G,'public_law','公法讀書會'); at('2028-12-11',21); phone();
  check('1B-20 12/11 21:00 讀書會群組：以安「學弟說這週四停一次」「大家去麵店」', th('g:public_law').join('|')==='學弟說這週四停一次|大家去麵店');
  { fresh('2028-12-12',19,'noodle'); H.FAMILIAR('heroine_03'); const a=S.a23TueDue(H.G); GM.npc.heroine_03={obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}; const b=S.a23TueDue(H.G); await run('ev_yt_23rd_notice');
    check('1B-20 12/12 語彤的班（她在店裡）：「週四，二十三週年。你要來。」', !a&&b&&has('週四，二十三週年。你要來。')); GM.npc={}; }
  fresh('2028-12-14',18.9,'noodle',{rain_umbrella:'none'}); H.FRIEND('heroine_03'); H.FAMILIAR('yu'); H.FAMILIAR('heroine_05'); SOCIAL.remember('heroine_03','SHARED_MEAL','她端來的乾麵');
  check('1B-20 12/14 18:45～ 在麵店＝演', S.a23Due(H.G)); H.said=[]; H.cgs=[]; await S.a23Run(GM);
  check('Y1 Alison「這兩個位子」、阿哲「今天剛好是週四」、阿姨「明年也是。」、最後一碗「乾麵，加滷蛋。」、CG-8、「這次我帶了兩把傘。」、強制下雨；ANNIVERSARY_23', has('（坐下）第四年了。這兩個位子，本來就是我們的。')&&has('今天剛好是週四。……以後不是週四也一樣，不用約，來就有人。')&&has('（舉起湯勺）明年也是。')&&has('（把最後一碗放在你面前）乾麵，加滷蛋。')&&has('我記得。我記得每個人第一次點什麼。')&&H.cgs.includes('cg_anniversary_23')&&has('這次我帶了兩把傘。')&&has('週年快樂。')&&H.G.weather==='rain'&&H.G.flags.ANNIV23==='there'&&SOCIAL.has('heroine_03','ANNIVERSARY_23'));
  { fresh('2028-12-14',18.9,'noodle'); H.FRIEND('heroine_03'); date('heroine_03'); await S.a23Run(GM);
    check('Y3 和語彤交往中：媽媽多一句、「這把是我們的。」；最後一碗一定給你（沒有備註＝招牌乾麵那句）', has('……他也很少講話。你們兩個怎麼聊天的？')&&has('（撐開另一把）這把是我們的。')&&has('招牌乾麵。你第一次來一定是點這個，大家都是。')&&!has('這次我帶了兩把傘。')); }
  { fresh('2028-12-14',18.9,'noodle',{rain_umbrella:'share'}); H.FRIEND('heroine_03'); date('kexin'); await S.a23Run(GM);
    check('1B-20 和別人交往中：「兩把。你們自己分。」（傘的那幾句不出）；不熟的最後一碗不給你', has('兩把。你們自己分。')&&!has('這次換我送你。')&&!has('（把最後一碗放在你面前）乾麵，加滷蛋。'));
    const a=idx('你點的是餛飩湯，你記錯了。'), b=idx('（把最後一碗放在阿哲面前）餛飩湯。'), c=idx('……我真的記錯了喔。'), e=idx('我記得。我記得每個人第一次點什麼。');
    check('AA_337 第 3 節 最後一碗給阿哲：接阿姨那句 →「（把最後一碗放在阿哲面前）餛飩湯。」→ 阿哲「……我真的記錯了喔。」→「我記得。我記得每個人第一次點什麼。」', a>=0&&b>a&&c===b+1&&e===c+1&&/阿哲|哲/.test(H.said[c].who||''), JSON.stringify([a,b,c,e]));
    at('2028-12-14',22.4); phone(); const k0=th('p:kexin').length; at('2028-12-14',22.5); phone(); const km=(H.G.msgs||[]).filter(m=>m.th==='p:kexin');
    check('AA_337 第 3 節 和可昕交往、她沒見過麵店團：22:30 系統字「（你傳了一張長桌的照片給可昕。）」＋可昕「人好多。」「……下次帶我去。人少的時候。」', k0===0&&km.map(m=>m.text).join('|')==='（你傳了一張長桌的照片給可昕。）|人好多。|……下次帶我去。人少的時候。'&&!km[0].from&&km[1].from==='kexin', JSON.stringify(km.map(m=>[m.from,m.text]))); }
  { fresh('2028-12-14',18.9,'noodle',{KX_MET_NOODLE_TEAM:true}); H.FRIEND('heroine_03'); date('kexin'); await S.a23Run(GM); at('2028-12-14',22.5); phone();
    check('1B-20 見過麵店團的可昕：她在場（「你說了三年的麵，原來是真的。」）、沒有事後照片', has('你說了三年的麵，原來是真的。')&&!th('p:kexin').length); }
  { fresh('2028-12-11',20,'dorm'); H.FAMILIAR('zhe'); PHONE.join(H.G,'noodle_team','麵店團'); at('2028-12-11',21); phone(); const a=th('g:noodle_team').slice(); at('2028-12-12',21); phone(); const b=th('g:noodle_team').slice(); at('2028-12-13',20.9); phone(); const c=th('g:noodle_team').length; at('2028-12-13',21); phone();
    const L=(H.G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.from+':'+m.text);
    check('AA_337 第 3 節 麵店團群組的倒數：12/11 阿哲「週四 麵店二十三週年 倒數三天」（AA_464 4-1 加「麵店」）、12/12 Alison「兩天」、12/13 阿哲「明天七點 不准遲到」柏翰「我六點半到。」', a.join('|')==='週四 麵店二十三週年 倒數三天'&&b.slice(-1)[0]==='兩天'&&c===2&&L.join('|')==='zhe:週四 麵店二十三週年 倒數三天|yu:兩天|zhe:明天七點 不准遲到|classmate_bohan:我六點半到。', JSON.stringify(L)); }
  { const zc=ev('ev_noodle_zr_postcard'); fresh('2028-12-16',15,'noodle'); H.FAMILIAR('heroine_02'); const a=EVENTS.check(zc); at('2028-12-17',15); H.G.zone='noodle'; const b=EVENTS.check(zc); H.G.zone='cafe'; const c=EVENTS.check(zc); H.G.zone='noodle';
    await run('ev_noodle_zr_postcard'); const said=has('（麵店的牆上多了一張明信片，英國的郵戳。背面寫著：「麵店生日快樂。」）'), d=EVENTS.check(zc); fresh('2028-12-20',15,'noodle'); const e=EVENTS.check(zc);
    check('AA_337 第 3 節 芷若的明信片：12/17 以後、和她 FAMILIAR 以上第一次進麵店＝牆上的旁白（只一次；不熟的沒有）', !a&&b&&!c&&said&&!d&&!e&&zc.trigger==='auto'); }
  { fresh('2028-12-14',18,'dorm'); H.FAMILIAR('heroine_03'); check('1B-20 睡著也會在 19:30 醒來', S.wakeAt(H.G)===19.5);
    at('2028-12-14',19.5); H.G.zone='campus'; check('1B-20 19:30 還沒到＝電話帶到場', S.a23CallDue(H.G)); H.said=[]; H.entered=[]; await S.a23Bring(GM);
    check('1B-20 電話「你在哪？大家都到了。」（語彤 FAMILIAR 以上＝語彤打）→ 到長桌 → 演', H.said.some(s=>s.t==='你在哪？大家都到了。'&&/語彤|陳語彤/.test(s.who||''))&&H.entered.includes('noodle')&&H.G.flags.ANNIV23==='there'); }
  { fresh('2028-12-14',6,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FAMILIAR('heroine_03'); date('kexin'); PHONE.join(H.G,'noodle_team','麵店團'); at('2028-12-14',6.5); H.G.zone='us_apartment'; phone();
    check('Y2 美國路線：當地 06:30 群組滿座的照片、「美國那兩個 阿姨說照片也算」（AA_524 Y7 改原句）；可昕「23 號回來，第一碗我請。」', th('g:noodle_team').includes('（一張滿座的照片）')&&th('g:noodle_team').includes('美國那兩個 阿姨說照片也算')&&th('p:kexin').includes('23 號回來，第一碗我請。')&&H.G.flags.ANNIV23==='remote');
    at('2028-12-24',19); H.G.zone='noodle'; check('1B-20 回來以後第一次去麵店：阿姨', S.a23AuntDue(H.G)); await run('ev_noodle_23rd_missed'); check('1B-20 「你錯過了，明年再來。」', has('你錯過了，明年再來。')&&!S.a23AuntDue(H.G)); }
  /* ===== 1B-21 ===== */
  fresh('2028-10-18',20,'dorm',{Y4_PATH:'bar'}); date('kexin'); at('2028-10-18',21); phone(); const m23=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_kx23');
  check('1B-21 10/18 21:00 三則＋「去。」「改天。」', th('p:kexin').join('|')==='你的那條路，現在走到哪了？不用現在說。|我的也想跟你說。|週五晚上七點，政大。我們走一段路，各自說。'&&!!m23&&m23.ask.opts.map(o=>o.t).join('|')==='去。|改天。');
  answer('y4_kx23',0); phone(); at('2028-10-20',18.2); await goOut('y4_kx23',[0]);
  check('P1 交往中、Y4_PATH bar：「我要考律師。從現在開始準備。」→「好。那我們各自準備。」「……晚上十點還是要通話喔。」；KX_PATHS told', has('我要考律師。從現在開始準備。')&&has('好。那我們各自準備。')&&has('……晚上十點還是要通話喔。')&&H.G.flags.KX_PATHS==='told'&&H.opts[0][0]==='（照實說自己的選擇）');
  { fresh('2028-10-18',21,'dorm',{Y4_PATH:'undecided'}); date('kexin'); phone(); answer('y4_kx23',1); phone(); const q2=OUT.get(H.G,'y4_kx23b');
    check('1B-21 改天：「好。那週六下午三點，同一個地方。」（AA_337 第 5 題；「這次我等你」不在這裡）→ 10/21 15:00', th('p:kexin').includes('好。那週六下午三點，同一個地方。')&&!th('p:kexin').includes('週六下午三點。這次我等你。')&&!!q2&&q2.h===15&&q2.day===D('2028-10-21'));
    at('2028-10-21',16); OUT.tick(GM); at('2028-10-21',21); phone(); check('P2 兩次都沒到：21:00 電話', S.kx23CallDue(H.G)); await run('ev_kexin_own_paths_call');
    check('P2 「那我們用電話各自說。」；還沒決定＝「還在想。」', has('那我們用電話各自說。')&&has('那我先記你『還在想』。想好了，第一批告訴我。')&&H.G.flags.KX_PATHS==='thinking'); }
  { fresh('2028-10-18',21,'dorm',{Y4_PATH:'bar'}); date('kexin'); phone(); answer('y4_kx23',0); phone(); at('2028-10-20',20); OUT.tick(GM); phone(); const q2=OUT.get(H.G,'y4_kx23b');
    check('1B-21 答應了卻沒到：「我想好了。我們找一天，各自說。」「週六下午三點。這次我等你。」→ 10/21 15:00', th('p:kexin').slice(-2).join('|')==='我想好了。我們找一天，各自說。|週六下午三點。這次我等你。'&&!th('p:kexin').includes('好。那週六下午三點，同一個地方。')&&!!q2&&q2.h===15, JSON.stringify(th('p:kexin'))); }
  { fresh('2028-10-18',9,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true,Y4_PATH:'grad'},'US'); date('kexin'); at('2028-10-18',9); H.G.zone='us_apartment'; phone(); answer('y4_kx23',0); phone(); const q=OUT.get(H.G,'y4_kx23');
    check('1B-21 美國路線：視訊（當地 07:00「接起來」）', !!q&&q.verb==='接起來'&&q.place==='視訊'&&Math.abs(q.h-7)<1e-6, q&&JSON.stringify({h:q.h,verb:q.verb}));
    at('2028-10-20',6.9); await goOut('y4_kx23',[0]); check('1B-21 美國路線那句：「台灣晚上十點、你那邊早上十點」', has('……台灣晚上十點、你那邊早上十點，還是要通話喔。')&&!has('（政大的校園。她先說她的：準備律師考試。）')); }
  /* ===== 1B-23 ===== */
  fresh('2028-10-11',20,'dorm'); H.FRIEND('heroine_04'); at('2028-10-11',21); phone(); const mq=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_q14');
  check('C1 四則、沒有任何法律結論；沒去過法服、沒有 U_ 旗標＝兩個選項', th('p:heroine_04').join('|')==='欸不是，你是法律系的吧。|我們要跟一間發行商簽約。合約四十頁。|我看不懂|你看得懂嗎'&&!!mq&&mq.ask.opts.length===2);
  answer('y4_q14',1); check('1B-23 「我還是學生……」→「……你好老實。好，那你陪我去找律師。」；ZQ_CONTRACT honest', th('p:heroine_04').includes('……你好老實。好，那你陪我去找律師。')&&H.G.flags.ZQ_CONTRACT==='honest');
  check('1B-23 畢業後篇的子晴線：honest 也算陪她去找律師', (()=>{ const old=PG.lean; PG.lean=()=>({top:'C'}); const r=PG.zqLine(H.G); PG.lean=old; return r; })());
  { fresh('2028-10-11',21,'dorm',{LAWCLUB_SAT_VISITS:2}); H.FRIEND('heroine_04'); phone(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14'); check('1B-23 去過法服：多「介紹法服的指導律師給妳。」', m.ask.opts.some(o=>o.t==='介紹法服的指導律師給妳。'));
    const k=m.ask.opts.findIndex(o=>o.t==='介紹法服的指導律師給妳。'); answer('y4_q14',k);
    check('1B-23 選「介紹法服的指導律師給妳。」＝「法服？你們系上那個社團？……好。」（AA_378 S5：學姊四年都不在法服）', th('p:heroine_04').includes('法服？你們系上那個社團？……好。')&&!th('p:heroine_04').some(t=>/那個學姊的法服/.test(t)), JSON.stringify(th('p:heroine_04').slice(-2))); }
  { /* AA_378 #15：臺灣、日本路線去大峽谷找學姊（10/7～10/15）的，期限延到回到臺北的隔天中午 10/16 12:00；沒去的照舊 10/13 */
    fresh('2028-10-11',21,'dorm'); const u0=Y34B.q14Until(H.G); OUT.plan(H.G,{id:'y4_sis_canyon',ev:'ev_sis_canyon',day:D('2028-10-07'),h:7,place:'桃園機場',title:'t'}); OUT.get(H.G,'y4_sis_canyon').state='done'; const u1=Y34B.q14Until(H.G);
    at('2028-10-15',20.5); H.FRIEND('heroine_04'); phone(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14');
    check('1B-23 去了大峽谷（AA_378 #15）：期限 10/16 12:00（沒去的照舊 10/13 00:00）；10/15 20:30 回到臺北還收得到、回得了', u0===D('2028-10-13')*24&&u1===D('2028-10-16')*24+12&&!!m&&PHONE.askOpen(H.G,m), JSON.stringify([u0,u1,!!m])); }
  { fresh('2028-10-11',9,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FRIEND('heroine_04'); at('2028-10-11',9); H.G.zone='us_apartment'; phone(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14');
    check('C2 美國路線：「你那邊是早上吧」、第一個選項「我回去陪妳找律師。……」', th('p:heroine_04')[0]==='你那邊是早上吧'&&!!m&&m.ask.opts[0].t==='我回去陪妳找律師。先把看不懂的地方標起來傳給妳。'); }
  { fresh('2028-10-11',21,'dorm'); H.FRIEND('heroine_04'); date('heroine_04'); phone(); answer('y4_q14',0);
    check('1B-23 交往中：開頭「你不用當律師啦。陪我看到第四十頁就好」、第一個回應「好。你標，我畫重點。」', th('p:heroine_04').includes('你不用當律師啦。陪我看到第四十頁就好')&&th('p:heroine_04').includes('好。你標，我畫重點。')&&!th('p:heroine_04').includes('欸不是，你是法律系的吧。')); }
  /* AA_337 第 6 題：U_COPYRIGHT＝大四上智財法（ip_law，選修、沒有分組＝每個人都有）第 4 週週三（9/27）的討論課；討論課照 syllabus 的 understand 記旗標（classes3d.js 的 discuss）*/
  { fresh('2028-09-27',8,'campus'); const it=CLS.dayItems(H.G,D('2028-09-27')).find(q=>q.c.id==='ip_law'); let ok=false, err='';
    if(it){ H.G.day=it.day; H.G.hour=it.t0; H.picks=[0,0,0,0,0,0]; try{ await CLS.attend(GM,it,{door:true}); ok=true; }catch(e){ err=String(e&&e.stack||e).slice(0,300); } }
    const ob=SYLLABUS.courses.ip_law.find(q=>q.w===4).obs;
    check('第 6 題 大四上智財法第 4 週（9/27 週三）是討論課（understand U_COPYRIGHT）：去了就記 U_COPYRIGHT', !!it&&it.week===4&&it.c.kind==='elective'&&!it.c.choice&&ob.kind==='discuss'&&ob.understand.includes('U_COPYRIGHT')&&ok&&H.G.flags.U_COPYRIGHT===true, err||(it?'':'找不到 9/27 的智財法')); }
  { fresh('2028-10-11',21,'dorm',{U_COPYRIGHT:true,U_CONTRACT:true}); H.FRIEND('heroine_04'); phone(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14'); const k=m?m.ask.opts.findIndex(o=>/^先看權利歸誰/.test(o.t)):-1; if(k>=0) answer('y4_q14',k);
    check('第 6 題 U_COPYRIGHT＋U_CONTRACT：多「先看權利歸誰、錢怎麼分、怎麼解約。然後拿去給律師看。」→「……你講話越來越像律師了。好，找律師。」', k>=0&&th('p:heroine_04').includes('……你講話越來越像律師了。好，找律師。')&&H.G.flags.ZQ_CONTRACT==='lawyer'); }
  /* ===== 1B-24 ===== */
  fresh('2029-05-02',20,'dorm',{whyLaw:'econ'}); H.FRIEND('heroine_01'); at('2029-05-02',21); phone();
  check('1B-24 5/2 21:00 以安「明天下午四點有空嗎」「兩點半窗邊 想找人聊天」', th('p:heroine_01').join('|')==='明天下午四點有空嗎|兩點半窗邊 想找人聊天');
  at('2029-05-03',16); H.G.zone='cafe'; check('1B-24 16:00 在 Café＝演', S.an20Due(H.G)); H.picks=[2]; await run('ev_an_your_turn');
  check('A1 「換妳問我。」＋第二天 econ：「我念過一個多月經濟……」→「……你四年前也是這樣講。」；IMPORTANT_CONVERSATION', has('以安，妳為什麼念法律？')&&has('所以我念法律，是為了把地圖畫好。')&&has('我念過一個多月經濟，才知道我想念的是這個。')&&has('……你四年前也是這樣講。')&&SOCIAL.has('heroine_01','IMPORTANT_CONVERSATION')&&H.G.flags.AN_YOUR_TURN===true);
  { fresh('2029-05-03',16,'cafe'); H.FRIEND('heroine_01'); date('heroine_01'); H.picks=[2]; await run('ev_an_your_turn');
    check('A3 和以安交往：「……第一個問我的人是你。這也是理由之一。」；沒聊過＝「……也沒有人問過我。」「那你畢業以前要告訴我。」', has('……第一個問我的人是你。這也是理由之一。')&&has('……也沒有人問過我。讓我想一下。')&&has('好。那你畢業以前要告訴我。')); }
  { fresh('2029-05-03',18,'noodle'); H.FRIEND('heroine_01'); date('kexin'); check('A2 和可昕交往：5/3 18:00 麵店長桌（Café 不演）', S.an20Mode(H.G)==='noodle'&&S.an20Due(H.G)); await run('ev_an_your_turn_noodle'); check('A2 麵店版一樣的回答', has('以安，妳為什麼念法律？')); }
  { fresh('2029-05-03',16.4,'dorm'); H.FRIEND('heroine_01'); phone(); at('2029-05-03',16.5); phone(); at('2029-05-03',16.8); H.G.zone='cafe';
    check('1B-24 16:30「我在窗邊。」＝延到 17:00', th('p:heroine_01').includes('我在窗邊。')&&S.an20Due(H.G)); }
  { fresh('2029-05-03',14,'dorm'); H.FRIEND('heroine_01'); check('1B-24 睡著也會在 17:15 醒來', S.wakeAt(H.G)===17.25); at('2029-05-03',17.3); H.G.zone='campus';
    check('1B-24 17:15 還沒到＝帶到場', S.an20BringDue(H.G)); H.said=[]; H.entered=[]; H.picks=[0]; await S.an20Bring(GM);
    check('1B-24 「（你走進兩點半的時候，她已經點了第二杯。）」', H.entered.includes('cafe')&&has('（你走進兩點半的時候，她已經點了第二杯。）')&&H.G.flags.AN_YOUR_TURN===true); }
  /* AA_355 第 5 節第 7 題（AA-C 2026-10-21 2f1aaa22）：麵店版只有「手機響了。」→ 帶到麵店之前加一句以安（電話）「我在麵店。……你來了再說。」（修改前 FAIL：沒有這一句）*/
  { fresh('2029-05-03',18,'dorm'); H.FRIEND('heroine_01'); date('kexin'); at('2029-05-03',18.6); H.G.zone='campus';
    const due=S.an20Mode(H.G)==='noodle'&&S.an20BringDue(H.G); H.said=[]; H.entered=[]; await S.an20Bring(GM); const i=H.said.findIndex(s=>s.t==='我在麵店。……你來了再說。'), w=i>=0?H.said[i].who:'';
    check('1B-24 麵店版（和可昕交往）18:30 還沒到＝帶到場：先以安（電話）「我在麵店。……你來了再說。」，再到麵店演', due&&i===0&&/以安/.test(w||'')&&/（電話）$/.test(w||'')&&H.entered.includes('noodle')&&has('以安，妳為什麼念法律？'), JSON.stringify(H.said.slice(0,2))); }
  /* ===== 1B-25 ===== */
  fresh('2029-05-28',20,'dorm'); H.FRIEND('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); at('2029-05-28',21); phone();
  check('1B-25 5/28 21:00 家族群組 Kevin「學姊明天下午四點口試！……」學姊「……不用來。」→ 出遊 16:00～18:00', th('g:family_law').join('|')==='學姊明天下午四點口試！大家去門口等！|……不用來。'&&!!OUT.get(H.G,'y4_m9')&&OUT.get(H.G,'y4_m9').late===2);
  at('2029-05-29',15.9); await goOut('y4_m9');
  check('M1 朋友、去了：「等妳。大家都是。」「販賣機的。」BCG-10；SIS_DEFENSE there', has('過了。')&&has('等妳。大家都是。')&&has('……好。我請大家喝飲料。販賣機的。')&&H.cgs.includes('cg_defense_day_heroine05')&&H.G.flags.SIS_DEFENSE==='there');
  { const setters=fs.readdirSync(path.join(H.ROOT,'src')).filter(f=>/\.js$/.test(f)).map(f=>'src/'+f).concat(fs.readdirSync(path.join(H.ROOT,'src/data')).filter(f=>/\.js$/.test(f)).map(f=>'src/data/'+f))
      .filter(f=>/RA_WORK['"]?\s*:(?!\s*\{)|RA_WORK\s*=(?!=)/.test(fs.readFileSync(path.join(H.ROOT,f),'utf8')));
    check('第 6 題 RA_WORK 不設（M8 作廢）：沒有任何檔案寫它；M9 走「沒有」那一版（沒有「致謝裡有你。寫的是研究助理。」）', !setters.length&&!has('致謝裡有你。寫的是研究助理。'), setters.join(',')); }
  { fresh('2029-05-28',21,'dorm'); date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); phone(); check('1B-25 交往中多一則私訊', th('p:heroine_05').includes('明天四點口試。……你坐在外面就好。'));
    at('2029-05-29',18.5); OUT.tick(GM); phone();
    check('M2 戀人、沒去：18:30 群組＋私訊「……你今天在忙？好。晚上打給我。」', th('g:family_law').includes('學姊過了！！（一張研究室門口的照片）')&&th('p:heroine_05').includes('……你今天在忙？好。晚上打給我。')&&H.G.flags.SIS_DEFENSE==='missed'); }
  /* ===== 其他 ===== */
  { fresh('2028-12-14',19.6,'campus'); H.FAMILIAR('heroine_03'); EVENTS.failed.ev_noodle_23rd=true; const r=S.tick(GM); delete EVENTS.failed.ev_noodle_23rd;
    check('出錯的事件不再自動開（不擋住後面的 S.tick）', r===false); }
  { fresh('2025-08-30',12,'dorm'); let ok=true; try{ for(const k of ['2026-09-10','2027-03-25','2028-03-24','2028-08-06','2028-12-14','2029-05-29','2030-01-01']){ at(k,12); phone(); S.tick(GM); S.wakeAt(H.G); S.alarms(H.G,H.G.day+1); } }catch(e){ ok=false; console.log(e); }
    check('舊存檔、其他日子：不出錯、不發這一批的訊息', ok&&!(H.G.msgs||[]).some(m=>/^y3_|^y4_/.test(m.tag||''))); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
