// AA_395 學姊第九批（企劃線 e81a1afe1；任務 SIS-B9-L-1023；D111）——不需要瀏覽器。
//   0  逐字對稿、新檔載得到
//   1  1-1 雨天，總圖門口：4/24～5/5 下雨的平日 16:50～17:20、總圖門口；兩種走法、交往中多一行；和 1-4 同一天順延；5/3 保底雨天；日本路線沒有；「傘帶了。」
//   2  1-2 帶哪一本（5/18、5/25 Café）：三個選項（美國路線沒有寄書那個）、交往中最後一句；1-3 三種的訊息、寄書（提醒按鈕 → 郵局 900 元）、沒寄
//   3  2-1 T2 的短視訊：奇數週臺灣週日 10:00 十分鐘，三組照順序、之後旁白，沒接「你在忙。下次。」；算回過
//   4  2-2 楓葉書籤：10/26 18:00 以後第一次回房間，署名兩種，傳訊息、她回；房間物件；12/23 車上那一句
//   5  2-3 大峽谷條件：第 5 階＋9 月接過兩次 T3 視訊（AA 定第 2 條）
// 修改前（開發分支 5e5db4bac 之後的 e618f1422）：沒有 src/sis_b9_3d.js（第 0、1、2、4 項 FAIL；第 3、5 項 FAIL）。用法：node tests/aa395_sis_b9_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|R2Y4A|R2Y4A_EVENTS|EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/y34b3d.js']) load(f);
for(const f of ['src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_jp_events.js','src/sis_jp3d.js','src/data/sis_b8_events.js','src/sis_b8_3d.js']) L3(f);
const ok1=L3('src/data/sis_b9_events.js'), ok2=L3('src/sis_b9_3d.js');
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ID);
const X=()=>typeof SISB9!=='undefined'?SISB9:null, S=R2Y4B;
const fresh=(key,h,route,lv,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1,met_sis:true,SIS_W1:true},flags||{})); if(lv) (H[lv])(ID); G.contacts={[ID]:G.day-60}; G.outings=[]; G.acts={att:{}}; H.at(key,h); return G; };
const E=H.E, door=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; };
const ph=()=>{ if(X()) X().phone(H.G); S.phone(H.G,GM); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=picks||[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id===id)); };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_395_學姊第九批_大三下學期中與大四上的遠距.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 sis_b8_3d.js 後面',ok1&&ok2&&!!X()&&/sis_b8_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b9_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b9_3d\.js\?v=[^"]+"><\/script>/.test(html));
  const all=J(SISB9_EVENTS)+J(SISB9_LINES), q=[...all.matchAll(/text":"([^"]+)"/g)].map(m=>m[1]).concat(Object.values(SISB9_LINES).flat().flatMap(x=>typeof x==='string'?[x]:[x.t,x.r]));
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!['總圖・門口','公館・郵局','視訊','（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——書瑀」）'].includes(t));   /* 署名「書瑀」那一版＝稿「很熟以上、交往中：署名『書瑀』」套同一行 */
  check('0. 每一句台詞、選項都在稿裡（一字不差）',!!doc&&!notIn.length,J(notIn)); });
/* ---- 1 ---- */
await sec(1,async()=>{ const due=()=>X().rainDue(H.G,E);
  fresh('2028-04-24',16.9,'TW','FAMILIAR'); H.G.zone='campus'; door(86,2); H.G.weather='rain'; const a=due(); H.G.weather='clear'; const b=due(); H.G.weather='rain'; door(40,40); const c=due(); door(86,2); H.at('2028-04-24',16.7); const d=due(); H.at('2028-04-24',16.9); H.G.zone='library_hall'; const e=due();
  check('1. 4/24（一）下雨 16:54 在總圖門口＝演；沒下雨、離門口遠、16:42 都不演；總圖大廳也算',a&&!b&&!c&&!d&&e,J([a,b,c,d,e]));
  H.G.zone='campus'; const r0=Object.assign({},SOCIAL.rel(ID)); await run('ev_sis_y3s2_rain',[0,0]); const r1=SOCIAL.rel(ID);
  check('1. 一起撐：照稿（「……計畫本上有寫「帶傘」。」→ 傘往她那邊偏 →「今天那頁寫什麼？」→「十七點，回家。」→「謝謝。……下次我會看今天。」）；share；熟悉 +2、自在 +2',seq(['（雨下得很大。她站在屋簷下，看著手機上的天氣。）','……計畫本上有寫「帶傘」。','寫在下禮拜那一頁。','（傘不大。她走在靠馬路那一邊，你把傘往她那邊偏。）','十七點，回家。','謝謝。……下次我會看今天。'])&&H.G.flags.SIS_Y3S2_RAIN==='share'&&r1.fam-r0.fam===2&&r1.comf-r0.comf===2,J(H.said.map(x=>x.t)));
  fresh('2028-04-25',16.9,'US','FAMILIAR'); H.date(ID); await run('ev_sis_y3s2_rain',[1]);
  check('1. 美國路線（還沒走）、交往中、買傘：開頭「（她看到你，沒有說話，直接走到你的傘下面。）」；「……好。錢我給你。」…「……我會記得帶。」；buy',has('（她看到你，沒有說話，直接走到你的傘下面。）')&&seq(['……好。錢我給你。','下次換我帶兩把。','八月以後，那邊也會下雨吧。','……我會記得帶。'])&&H.G.flags.SIS_Y3S2_RAIN==='buy');
  fresh('2028-04-25',16.9,'TW','FAMILIAR'); H.date(ID); await run('ev_sis_y3s2_rain',[0,1]); check('1. 交往中一起撐：「（傘不大。她勾著你的手臂。）」',has('（傘不大。她勾著你的手臂。）')&&!has('（傘不大。她走在靠馬路那一邊，你把傘往她那邊偏。）'));
  fresh('2028-04-26',16.9,'TW','FAMILIAR'); H.G.zone='campus'; door(86,2); H.G.weather='rain'; H.G.events.done.ev_sis_adv_y4=1; H.G.events.last.ev_sis_adv_y4=H.G.day; const f=due();
  fresh('2028-04-26',16.9,'JP','FAMILIAR'); H.G.zone='campus'; door(86,2); H.G.weather='rain'; const g=due();
  check('1. 和 1-4 同一天：順延；日本路線（3/25 就走了）：沒有',!f&&!g,J([f,g]));
  fresh('2028-05-03',12.2,'TW','FAMILIAR'); H.G.weather='clear'; X().tick(GM); const h1=H.G.weather;
  fresh('2028-05-03',12.2,'TW','FAMILIAR'); H.G.flags.SIS_RAIN_SEEN=true; H.G.weather='clear'; X().tick(GM); const h2=H.G.weather;
  check('1. 兩週下午都沒下雨：5/3（三）12:00 起改成雨天；之前下午下過雨就不改',h1==='rain'&&h2==='clear',J([h1,h2]));
  fresh('2028-07-31',21.9,'TW','FRIEND',{SIS_Y3S2_RAIN:'share'}); H.at('2028-07-31',22); ph();
  check('1. 撐過傘的（臺灣路線）：7/31 22:00 私訊「傘帶了。」',th().some(m=>m.text==='傘帶了。'&&keyOf(m.day)==='2028-07-31'&&m.h===22));
  fresh('2028-08-02',7.9,'TW','FRIEND',{SIS_Y3S2_RAIN:'share',SIS_RIDE:'family',SIS_RIDE_ASK:'yes'}); H.date(ID); OUT.plan(H.G,{id:'y4_sis_airport',ev:'ev_sis_airport',day:D('2028-08-02'),h:8,place:'x',title:'x',travel:'',travelH:0}); await goOut('y4_sis_airport');
  check('1. 交往中、有送機那一場：「傘帶了。」接在那一場的第一句前，7/31 不另外傳',H.said[0]&&H.said[0].t==='傘帶了。'&&(H.at('2028-07-31',22),true)); });
/* ---- 2 ---- */
await sec(2,async()=>{ const talk=async(key,h,picks)=>{ H.at(key,h); H.G.zone='cafe'; H.said=[]; H.opts=[]; H.picks=picks||[]; return SISY23.preTalk(GM); };
  fresh('2028-05-18',19.4,'TW','FAMILIAR'); H.G.events.done.ev_sis_adv_y4=1; H.G.events.last.ev_sis_adv_y4=H.G.day-7; const a0=await talk('2028-05-18',19.4); const a1=await talk('2028-05-18',19.6,[0]); const O=H.opts[0];
  check('2. 5/18（四）19:30 以後在 Café：帶哪一本；三個選項；「刑訴。」→「……這是我大一的課本。」…；SIS_BOOK law；最後「另外一本，回來再看。」',!a0&&a1===true&&J(O)===J(['「刑訴。」','「小說。」','「兩本都帶。我幫妳寄一本。」'])&&seq(['行李只放得下一本。','你幫我選。','……這是我大一的課本。','好。帶這本。到了那邊，問號多的時候可以看。','（十點，她把兩本書收進包包。）','另外一本，回來再看。'])&&H.G.flags.SIS_BOOK==='law',J({O,s:H.said.map(x=>x.t)}));
  fresh('2028-05-18',19.6,'TW','FAMILIAR'); const b0=await talk('2028-05-18',19.6); const b1=!!H.G.events.done.ev_sis_adv_y4&&!H.G.events.done.ev_sis_which_book; const b2=await talk('2028-05-25',19.7,[1]);
  check('2. 那晚先演了 1-4：下一個週四（5/25）才演；「小說。」→ novel',b0===true&&b1&&b2===true&&has('好。帶這本。在那邊看完。')&&H.G.flags.SIS_BOOK==='novel');
  fresh('2028-05-25',19.6,'US','FAMILIAR'); H.G.events.done.ev_sis_adv_y4=1; H.G.events.last.ev_sis_adv_y4=H.G.day-7; H.date(ID); await talk('2028-05-25',19.6,[0]);
  check('2. 美國路線：沒有寄書那個選項；交往中最後「另外一本，放你那邊。……回來跟你拿。」',H.opts[0]&&H.opts[0].length===2&&has('另外一本，放你那邊。……回來跟你拿。'),J(H.opts));
  fresh('2028-06-01',19.6,'TW','FAMILIAR'); H.G.events.done.ev_sis_adv_y4=1; H.G.events.last.ev_sis_adv_y4=H.G.day-7; const c=await talk('2028-06-01',19.6); check('2. 6/1 不演',c!==true);
  fresh('2028-09-17',20,'TW','FAMILIAR',{SIS_BOOK:'law'}); H.at('2028-09-18',9.2); ph(); const m=th().find(x=>x.text==='今天問號很多。看了一頁我大一寫的。……我那時候比現在敢問。');
  check('2. 1-3 law：9/18（一）09:00 之後一點（排在那一格後面）照片＋那一句',!!m&&keyOf(m.day)==='2028-09-18'&&Math.floor(m.h)===9);
  fresh('2028-11-19',20,'TW','FAMILIAR',{SIS_BOOK:'novel'}); H.at('2028-11-20',9.2); ph(); check('2. 1-3 novel：11/20「看完了。結局我高中就猜到了。……還是看完了。」',th().some(x=>x.text==='看完了。結局我高中就猜到了。……還是看完了。'&&keyOf(x.day)==='2028-11-20'));
  fresh('2028-08-14',20,'TW','FAMILIAR',{SIS_BOOK:'both'}); H.at('2028-08-14',21); ph(); const rm=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisb9_book_remind');
  check('2. both：8/14 21:00 手機提醒「要寄給學姊的書」＋按鈕',!!rm&&rm.text==='要寄給學姊的書'&&rm.th==='sys',J(rm));
  H.at('2028-08-16',10); PHONE.answer(H.G,'sisb9_book_remind',0); ph(); const q=OUT.get(H.G,'sisb9_book_mail'); const m0=H.G.money; let paid=0; GM.money=(n)=>{ paid+=n; }; await goOut('sisb9_book_mail'); delete GM.money;
  check('2. 按了＝去公館郵局（出遊 30 分）；寄出 SIS_BOOK_SENT、郵資 900',!!q&&q.place==='公館郵局'&&H.G.flags.SIS_BOOK_SENT===true&&paid===-900,J({q,paid}));
  H.at('2028-09-04',9.2); ph(); check('2. 9/4「（照片：拆開的包裹，書上面放著一張你寫的紙條）」「到了。……紙條比書先看。」',th().some(x=>x.text==='到了。……紙條比書先看。'));
  fresh('2028-08-14',20,'TW','FAMILIAR',{SIS_BOOK:'both'}); H.at('2028-08-21',10); ph(); H.at('2028-09-04',9.2); ph(); check('2. 沒寄：9/4「書的事不用了。這邊的圖書館有。」',th().some(x=>x.text==='書的事不用了。這邊的圖書館有。')&&!H.G.flags.SIS_BOOK_SENT); });
/* ---- 3 ---- */
await sec(3,async()=>{ fresh('2028-08-05',20,'TW'); H.rel(ID,60,45,40); SOCIAL.rel(ID).npcRom=10;
  for(let d=D('2028-08-06');d<=D('2028-09-11');d++) for(const h of [8,9.5,10.5,20]){ H.at(keyOf(d),h); ph(); }
  const V=OUT.rec(H.G).filter(q=>/^y4_sa_s_/.test(q.id)).sort((a,b)=>a.day-b.day);
  check('3. T2：奇數週（8/13、8/27、9/10）臺灣週日 10:00「和學姊視訊（十分鐘）」、0.2 小時；偶數週照舊是訊息',H.G.flags.SIS_ABROAD_TIER===2&&J(V.map(q=>keyOf(q.day)+'@'+q.h+':'+q.sa.sset))===J(['2028-08-13@10:0','2028-08-27@10:1','2028-09-10@10:2'])&&V.every(q=>q.title==='和學姊視訊（十分鐘）'&&q.hours===0.2&&q.ev==='ev_sis_video_short')&&th().some(m=>/^y4_sa_t2_/.test(m.tag||'')),J(V.map(q=>keyOf(q.day)+'@'+q.h+':'+q.sa.sset)));
  H.at('2028-08-13',10); await goOut(V[0].id,[0]); const s1=seq(['（她背後是一排洗衣機，有一台在轉。）','洗衣機還有十二分鐘。','聊到它停。','好了。……下次也挑洗衣服的時候。']);
  H.at('2028-08-27',10); await goOut(V[1].id,[1]); const s2=seq(['剛從圖書館出來。這條路燈很少。','……你在管我。','好。下次早一點。','到了。謝謝。']);
  H.at('2028-09-10',10); await goOut(V[2].id,[1]); const s3=seq(['（打字）這邊不能講話。','（你們看著對方，十分鐘沒有人說話。她中間笑了一次。）','（打字）十分鐘到了。……謝謝你沒掛。']);
  check('3. 三組照順序：洗衣間、走回宿舍、不能講話的地方',s1&&s2&&s3,J([s1,s2,s3]));
  OUT.rec(H.G).push({id:'y4_sa_s_99',ev:'ev_sis_video_short',day:D('2028-09-24'),h:10,state:'planned',sa:{k:99,sset:3}}); H.at('2028-09-24',10); await goOut('y4_sa_s_99'); check('3. 用完以後只有旁白「（視訊。十分鐘，她那邊在洗衣服。）」',H.said.length===1&&H.said[0].t==='（視訊。十分鐘，她那邊在洗衣服。）',J(H.said));
  check('3. 接了就算回過（saReplied 的 video）',S.saRate(H.G)>0);
  fresh('2028-08-05',20,'TW'); H.rel(ID,60,45,40); SOCIAL.rel(ID).npcRom=10; for(let d=D('2028-08-06');d<=D('2028-08-13');d++) for(const h of [8,9.5,10.5,11.5,20]){ H.at(keyOf(d),h); ph(); for(const q of OUT.rec(H.G)) if(q.id==='y4_sa_s_1'&&q.state==='planned'&&T(q.day,q.h)+1<=T(d,h)){ q.state='missed'; OUT.onMissed(GM,q); } }
  const mm=th().find(m=>m.text==='你在忙。下次。'); check('3. 沒接：10:20「你在忙。下次。」',!!mm&&keyOf(mm.day)==='2028-08-13'&&Math.abs(mm.h-(10+1/3))<0.02,J(mm)); });
/* ---- 4 ---- */
await sec(4,async()=>{ fresh('2028-10-26',17.5,'TW','FRIEND'); H.G.zone='dorm'; const a0=X().mapleDue(H.G); H.at('2028-10-26',18.2); H.G.zone='campus'; const a1=X().mapleDue(H.G); H.G.zone='dorm'; const a2=X().mapleDue(H.G);
  check('4. 10/26（四）18:00 以後第一次回自己的房間（17:30 不演、不在房間不演）',!a0&&!a1&&a2,J([a0,a1,a2]));
  const r0=SOCIAL.rel(ID).fam; H.said=[]; H.picks=[0]; await X().maple(GM);
  check('4. 朋友：照稿三行、署名「溫書瑀」；SIS_MAPLE；熟悉 +1',seq(['（門口的信箱裡有一個信封，寄件地址是英文的。）','（信封裡沒有信。只有一片壓乾的楓葉，護貝過，剪成書籤的形狀。）','（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——溫書瑀」）'])&&H.G.flags.SIS_MAPLE===true&&SOCIAL.rel(ID).fam-r0===1,J(H.said.map(x=>x.t)));
  PHONE.tick(H.G); H.at('2028-10-28',12); PHONE.tick(H.G);
  check('4. 傳「書籤收到了。」→ 照她的回覆時間回「十天。比我想的快。」',th().some(m=>m.from==='player'&&m.text==='書籤收到了。')&&th().some(m=>m.text==='十天。比我想的快。')&&H.G.flags.SIS_MAPLE_MSG==='got');
  const Lr=[]; for(const f of STORY.ROOM_EXTRA) f(H.G,Lr); check('4. 房間多一件「學姊寄來的楓葉書籤」／「夾在你現在讀的那本書裡。」',Lr.some(r=>r[0]==='學姊寄來的楓葉書籤'&&r[1]==='夾在你現在讀的那本書裡。'),J(Lr));
  fresh('2028-10-26',18.2,'JP','FRIEND'); H.G.flags.JP_DEPARTED=D('2028-03-25'); H.G.flags.JP_RETURNED=D('2028-08-05'); H.date(ID); H.G.zone='dorm'; H.said=[]; H.picks=[2]; await X().maple(GM);
  check('4. 交往中（日本路線）：署名「書瑀」；（不傳）＝她不會問',has('（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——書瑀」）')&&!th().some(m=>m.from==='player'));
  fresh('2028-10-26',18.2,'US','FRIEND'); H.G.zone='dorm'; check('4. 美國路線（和她在同一個地方）：沒有',!X().mapleDue(H.G));
  fresh('2028-12-23',20,'TW','FRIEND',{SIS_MAPLE:true,SIS_MAPLE_MSG:'got',SIS_PICKUP_V:'two'}); OUT.plan(H.G,{id:'t_pick',ev:'ev_sis_pickup',day:H.G.day,h:20,place:'x',title:'x',travel:'',travelH:0}); await goOut('t_pick',[1,0]);
  check('4. 12/23 接機車上：「書籤，你有用嗎。」→「捨不得用。」→「……用啊。不然寄它幹嘛。」',seq(['書籤，你有用嗎。','……用啊。不然寄它幹嘛。','我想吃滷肉飯。現在。']),J(H.said.map(x=>x.t)));
  fresh('2028-12-23',20,'TW','FRIEND',{SIS_PICKUP_V:'two'}); OUT.plan(H.G,{id:'t_pick',ev:'ev_sis_pickup',day:H.G.day,h:20,place:'x',title:'x',travel:'',travelH:0}); await goOut('t_pick',[0]);
  check('4. 沒有書籤：車上沒有那一段',!has('書籤，你有用嗎。')&&!has('……用啊。不然寄它幹嘛。')&&has('我想吃滷肉飯。現在。')); });
/* ---- 5 ---- */
await sec(5,()=>{ const setup=(n)=>{ fresh('2028-09-24',9,'TW'); H.rel(ID,65,50,45); const r=SOCIAL.rel(ID); r.npcRom=40; r.rom=10; DATE.log(H.G,ID).count=2; const R=S.saRec(H.G);
    for(let k=0;k<n;k++){ OUT.rec(H.G).push({id:'y4_sa_v_'+(5+k),ev:'ev_sis_video',day:D('2028-09-10')+k*7,h:10,state:'done',sa:{k:5+k,set:0}}); R.log.push({k:5+k,kind:'video',tag:'y4_sa_v_'+(5+k)}); } R.tier=3; R.k=6; };
  setup(2); const a=S.sisInviteDue(H.G), st=DATE.stageNum(ID); setup(1); const b=S.sisInviteDue(H.G);
  check('5. 大峽谷：第 5 階（不到第 6 階）＋9 月接過兩次 T3 視訊＝她約；只接過一次＝不約',st===5&&a===true&&b===false,J({st,a,b})); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
