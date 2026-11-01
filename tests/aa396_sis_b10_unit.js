// AA_396 學姊第十批（企劃線 53af5dfc4；任務 SIS-B10-L-1023；D111）——不需要瀏覽器。
//   0  逐字對稿、新檔載得到
//   1  交往中的跨年：大二～大四私訊（大四 12/26）、去找她＝出遊且不排頂樓、頂樓＝零點電話（大四祐廷打過去）、沒回＝頂樓、沒接、答應了沒去
//   2  交往中的除夕電話三年（2028 是「如果」版）、沒接 21:40
//   3  前任四場：分手滿 3 週、照順序、隔 3 週；3-4 8/1 私訊（美國路線也收）；過了 8/1 不補；重新交往以後沒有
//   4  畢業以後每季一次 Café：四季、窗口過了不補、Q2 三種開頭、和她交往中／前任沒有
// 修改前（開發分支 07c03e67a）：沒有 src/sis_b10_3d.js（全部 FAIL）。用法：node tests/aa396_sis_b10_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js']) L3(f);
const ok1=L3('src/data/sis_b10_events.js'), ok2=L3('src/sis_b10_3d.js');
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ID);
const X=()=>typeof SISB10!=='undefined'?SISB10:null;
const fresh=(key,h,route,lv,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1,met_sis:true,SIS_W1:true},flags||{})); if(lv) (H[lv])(ID); G.contacts={[ID]:G.day-60}; G.outings=[]; G.acts={att:{}}; H.at(key,h); return G; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const walk=(key0,key1,hs,f)=>{ for(let d=D(key0);d<=D(key1);d++) for(const h of hs){ H.at(keyOf(d),h); ph(); if(f) f(d,h); } };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 53af5dfc4:"docs/story_planning/AA_396_學姊第十批_交往中的節日_前任_畢業以後的朋友.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 sis_b9_3d.js 後面；STORY.sisNyeDate',ok1&&ok2&&!!X()&&typeof STORY.sisNyeDate==='function'&&/sis_b9_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b10_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b10_3d\.js\?v=[^"]+"><\/script>/.test(html));
  const all=J(SISB10_EVENTS)+J(SISB10_LINES), q=[...all.matchAll(/"(?:text|t|r)":"([^"]+)"/g)].map(m=>m[1]).concat(Object.values(SISB10_LINES).flat().filter(x=>typeof x==='string'));
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!['映月湖','總圖前','學姊家的巷口','跨年：映月湖','跨年：總圖前','跨年：學姊家的巷口','走路 約 10 分鐘','捷運 約 30 分鐘','總圖・門口','巷口的便利商店前','電話','法圖・二樓','兩點半 Café'].includes(t));
  check('0. 每一句台詞、選項都在稿裡（一字不差）',!!doc&&!notIn.length,J(notIn)); });
/* ---- 1 ---- */
await sec(1,async()=>{ fresh('2026-12-24',20,'TW','FRIEND'); H.date(ID); H.at('2026-12-24',21); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisb10_nye_ask_y2');
  check('1. 大二 12/24 21:00「三十一號晚上，你有事嗎。」；「阿哲他們揪頂樓。」／「沒有。」',!!m&&m.text==='三十一號晚上，你有事嗎。'&&J(m.ask.opts.map(o=>o.t))===J(['阿哲他們揪頂樓。','沒有。']),J(m));
  PHONE.answer(H.G,'sisb10_nye_ask_y2',1); ph(); PHONE.tick(H.G); H.at('2026-12-31',21.2); ph(); STORY.nyeY2&&STORY.nyeY2(GM); const q=OUT.get(H.G,'sisb10_nye_y2');
  check('1. 「沒有。」→「十一點半，映月湖。人比較少。」；12/31 23:30「跨年：映月湖」；頂樓不排',th().some(x=>x.text==='十一點半，映月湖。人比較少。')&&!!q&&q.h===23.5&&q.title==='跨年：映月湖'&&!OUT.get(H.G,'nye_y2'),J({q,roof:OUT.get(H.G,'nye_y2')}));
  H.at('2026-12-31',23.4); await goOut('sisb10_nye_y2',[1]); ph();
  check('1. 映月湖照稿；（陪她看湖）；「新年快樂。」；SIS_NYE[2] date',seq(['（湖邊沒有幾個人。遠遠的，聽得到椰影大道那邊有人在倒數。）','我每年這時候都在家，寫明年的計畫本。','（湖心亭的燈映在水上。她把手放進你外套的口袋。）','新年快樂。'])&&H.G.flags.SIS_NYE[2]==='date',J(H.said.map(x=>x.t)));
  fresh('2026-12-24',21,'TW','FRIEND'); H.date(ID); ph(); PHONE.answer(H.G,'sisb10_nye_ask_y2',0); ph(); H.at('2026-12-31',21.2); ph(); const c=OUT.get(H.G,'sisb10_nye_call_y2');
  check('1. 頂樓：零點「書瑀打電話來」（接起來）',!!c&&c.day===D('2027-01-01')&&c.h===0&&c.verb==='接起來'&&c.title==='書瑀打電話來',J(c));
  H.at('2027-01-01',0.2); await goOut('sisb10_nye_call_y2'); ph();
  check('1. 零點電話（大二）：「新年快樂。……你們那邊好吵。」「我在寫明年的計畫本。好，你回去。」；SIS_NYE call',seq(['新年快樂。……你們那邊好吵。','我在寫明年的計畫本。好，你回去。'])&&H.G.flags.SIS_NYE[2]==='call',J(H.said.map(x=>x.t)));
  fresh('2026-12-24',21,'TW','FRIEND'); H.date(ID); ph(); H.at('2026-12-31',21.1); ph(); check('1. 21:00 以前沒回：當作頂樓（零點電話）',(H.G.flags.SIS_NYE_PICK||{})[2]==='roof'&&!!OUT.get(H.G,'sisb10_nye_call_y2'));
  const q2=OUT.get(H.G,'sisb10_nye_call_y2'); q2.state='missed'; OUT.onMissed(GM,q2); H.at('2027-01-01',0.2); PHONE.tick(H.G); check('1. 電話沒接：00:05「新年快樂。」',th().some(x=>x.text==='新年快樂。'&&x.day===D('2027-01-01')));
  fresh('2026-12-24',21,'TW','FRIEND'); H.date(ID); ph(); PHONE.answer(H.G,'sisb10_nye_ask_y2',1); ph(); H.at('2026-12-31',21.2); ph(); const q3=OUT.get(H.G,'sisb10_nye_y2'); q3.state='missed'; OUT.onMissed(GM,q3); H.at('2027-01-01',0.2); PHONE.tick(H.G);
  check('1. 答應了沒去：00:05「新年快樂。……我先回去了。」；missed',th().some(x=>x.text==='新年快樂。……我先回去了。')&&H.G.flags.SIS_NYE[2]==='missed');
  fresh('2027-12-24',21,'TW','FRIEND'); H.date(ID); ph(); PHONE.answer(H.G,'sisb10_nye_ask_y3',1); ph(); H.at('2027-12-31',21.2); ph(); const q4=OUT.get(H.G,'sisb10_nye_y3'); H.at('2027-12-31',23.1); await goOut('sisb10_nye_y3',[1]);
  check('1. 大三：「三十一號我要寫交換的讀書計畫…」→ 總圖前 23:15；「寄出去了嗎？」→「還沒。十一點五十九分寄。」…',th().some(x=>x.text==='……十一點以後有空。')&&!!q4&&Math.abs(q4.h-23.25)<1e-6&&seq(['讀書計畫寫完了。英文的。','還沒。十一點五十九分寄。','……我想讓它是今年的事。','新年快樂。','（她把熱飲換到另一隻手，空出來的那隻，放進你的手裡。）']),J(H.said.map(x=>x.t)));
  fresh('2028-12-26',20,'TW','FRIEND'); H.date(ID); H.at('2028-12-24',21); ph(); const early=(H.G.msgs||[]).some(x=>x.ask&&x.ask.id==='sisb10_nye_ask_y4'); H.at('2028-12-26',21); ph();
  PHONE.answer(H.G,'sisb10_nye_ask_y4',0); ph(); H.at('2028-12-31',21.2); ph(); const c4=OUT.get(H.G,'sisb10_nye_call_y4');
  check('1. 大四：12/26 才問（12/24 不問）；頂樓＝祐廷打過去（「打給書瑀」）',!early&&!!c4&&c4.verb==='打過去'&&c4.title==='打給書瑀',J(c4));
  H.at('2029-01-01',0.1); await goOut('sisb10_nye_call_y4'); check('1. 大四零點：「……喂。我醒著。」「新年快樂。你們那邊好吵。好，你回去。」',seq(['……喂。我醒著。','新年快樂。你們那邊好吵。好，你回去。']));
  for(const [r,cold,line,coat] of [['TW',true,'新年快樂。……今年在同一個時區了。','我說過很醜。'],['US',false,'新年快樂。……臺灣比較暖。','美國買的。……很暖，所以醜一點沒關係。']]){ fresh('2028-12-26',21,r,'FRIEND',cold?{SIS_MAPLE_MSG:'cold'}:{}); H.date(ID); ph(); PHONE.answer(H.G,'sisb10_nye_ask_y4',1); ph(); H.at('2028-12-31',21.2); ph(); const q5=OUT.get(H.G,'sisb10_nye_y4'); H.at('2028-12-31',23.1); await goOut('sisb10_nye_y4',[1]);
    check('1. 大四去她家巷口（'+r+'）：23:40、捷運 30 分；「那件外套好醜。」→「'+coat+'」；最後「'+line+'」',!!q5&&Math.abs(q5.h-(23+40/60))<1e-6&&q5.travelH===0.5&&has(coat)&&has(line)&&!has('最後'),J(H.said.map(x=>x.t))); }
  fresh('2026-12-24',21,'TW','FRIEND'); ph(); check('1. 沒和她交往：沒有私訊',!(H.G.msgs||[]).some(x=>/^sisb10_/.test(x.tag||''))); });
/* ---- 2 ---- */
await sec(2,async()=>{ for(const [y,key,first,pick,want] of [[2027,'2027-02-05','我在陽台。裡面在打麻將，我被趕出來了。',0,'十二個。今年多一個，表姊的小孩。……一直哭。'],[2028,'2028-01-25','我媽問我，如果去交換，過年回不回來。',0,'嗯。我也是算這一天。'],[2029,'2029-02-12','（照片：一盤水餃）',1,'你在說謊。……謝謝。']]){
    fresh(key,20,'TW','FRIEND'); H.date(ID); H.at(key,21); ph(); const q=OUT.get(H.G,'sisb10_cny_'+y); const r0=Object.assign({},SOCIAL.rel(ID)); H.at(key,21.5); await goOut('sisb10_cny_'+y,[pick]); ph(); const r1=SOCIAL.rel(ID);
    check('2. 除夕 '+key+' 21:30 她打來：「'+first+'」…「'+want+'」；SIS_CNY call；自在 +1、她的戀愛 +1',!!q&&q.h===21.5&&q.verb==='接起來'&&has(first)&&has(want)&&H.G.flags.SIS_CNY[y]==='call'&&r1.comf-r0.comf===1&&r1.npcRom-r0.npcRom===1,J(H.said.map(x=>x.t))); }
  check('2. 2028 年是「如果」版（沒有「我媽問我，交換那半年，過年回不回來。」）',!J(SISB10_EVENTS).includes('我媽問我，交換那半年，過年回不回來。'));
  fresh('2029-02-12',21,'TW','FRIEND'); H.date(ID); ph(); const q=OUT.get(H.G,'sisb10_cny_2029'); q.state='missed'; OUT.onMissed(GM,q); H.at('2029-02-12',21+40/60); PHONE.tick(H.G);
  check('2. 沒接：21:40「新年快樂。……我先進去了。」；missed',th().some(x=>x.text==='新年快樂。……我先進去了。'&&Math.abs(x.h-(21+40/60))<0.02)&&H.G.flags.SIS_CNY[2029]==='missed'); });
/* ---- 3 ---- */
await sec(3,async()=>{ const ex=(key)=>{ fresh(key,12,'TW','FRIEND'); H.date(ID); ROM.end(H.G,ID,'test'); };
  const here=(zone)=>{ H.G.zone=zone; GM.npc={[ID]:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}}; };
  const tick=()=>X().exDue(GM);
  ex('2027-03-01'); H.at('2027-03-17',19.5); here('lawlib'); const a0=tick(); H.at('2027-03-24',19.5); here('lawlib'); const a1=tick(); GM.npc={}; const a2=tick();
  check('3. 分手滿 3 週以後的週三晚上在法圖、她在＝還東西（未滿 3 週、她不在＝沒有）',a0===null&&a1==='ev_sis_ex_1'&&a2===null,J([a0,a1,a2]));
  here('lawlib'); X().tick(GM); await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0));
  H.said=[]; H.picks=[1]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_sis_ex_1'));
  check('3. 3-1 照稿：「你的東西。一直在我那裡。」→「妳最近好嗎？」→「在寫論文。」「……你也好好念。」；SIS_EX_SEEN 1',seq(['你的東西。一直在我那裡。','在寫論文。','……你也好好念。','（她回到自己的位子。整個晚上，她沒有再抬頭。）'])&&H.G.flags.SIS_EX_SEEN===1&&H.G.flags.SIS_EX_LAST===D('2027-03-24'));
  H.at('2027-04-01',19.5); here('cafe'); const b0=tick(); H.at('2027-04-15',19.5); here('cafe'); const b1=tick();
  check('3. 第二場和上一場隔 3 週（4/1 沒有、4/15（四）Café 有）',b0===null&&b1==='ev_sis_ex_2',J([b0,b1]));
  H.G.flags.SIS_EX_SEEN=2; H.G.flags.SIS_EX_LAST=D('2027-04-15'); H.at('2027-05-10',14); H.G.zone='linze'; GM.npc={}; const c1=tick(); H.at('2027-05-10',15); const c2=tick();
  check('3. 3-3 霖澤館一樓大廳、週一～四 14:00 前後（5F 研究室還沒做好）',c1==='ev_sis_ex_3'&&c2===null,J([c1,c2]));
  H.G.flags.SIS_EX_SEEN=1; H.G.flags.SIS_EX_LAST=D('2027-03-24'); H.at('2028-08-02',19.5); here('cafe'); check('3. 過了 2028-08-01：沒演到的不補',tick()===null);
  for(const r of ['TW','US']){ ex('2028-05-01'); H.G.flags.EXCHANGE_ROUTE=r; H.at('2028-08-01',21+(r==='US'?0:0)); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisb10_ex_last');
    check('3. 3-4（'+r+'）：8/1 21:00「明天走了。」「……你也保重。」；「一路順風。」／「到了說一聲。」',!!m&&th().some(x=>x.text==='明天走了。')&&J(m.ask.opts.map(o=>o.t))===J(['一路順風。','到了說一聲。']),J(th().map(x=>x.text))); }
  ex('2028-07-20'); H.at('2028-08-01',21); ph(); check('3. 分手未滿 3 週：8/1 沒有那則',!th().some(x=>x.text==='明天走了。'));
  ex('2027-03-01'); H.G.flags.dating_heroine_05=true; H.at('2027-03-24',19.5); here('lawlib'); check('3. 重新交往以後：沒有',tick()===null); GM.npc={}; });
/* ---- 4 ---- */
await sec(4,async()=>{ const day=(a,b)=>{ for(let d=D(a);d<=D(b);d++) if([1,2,4].includes(CALENDAR.dateOf(d).wd)) return keyOf(d); };
  const talk=async(key,picks)=>{ H.at(key,19.6); H.G.zone='cafe'; H.said=[]; H.opts=[]; H.picks=picks||[]; return SISY23.preTalk(GM); };
  fresh('2029-10-01',19,'TW','FAMILIAR',{GRADUATED:true}); const a=await talk(day('2029-10-01','2029-10-31'),[0]);
  check('4. Q1（2029-10）：「你也還在來。」…「工作還好嗎？」→…「好。我把這段看完。你坐。」；SIS_PG_Q 1；熟悉 +1、自在 +1',a===true&&seq(['（她換了一個新的包包。筆電旁邊放著一張識別證，背面朝上。）','你也還在來。','每天都在寫報告，寫為什麼有人找不到律師。','好。我把這段看完。你坐。'])&&H.G.flags.SIS_PG_Q===1,J(H.said.map(x=>x.t)));
  for(const [rain,line] of [['buy','我現在都帶兩把。……說過的。'],['share','今天這一頁我有看。……寫的是「Café，帶傘」。'],[null,'下雨天，這裡人比較少。']]){ fresh('2030-01-02',19,'TW','FAMILIAR',rain?{SIS_Y3S2_RAIN:rain}:{}); H.G.events.done.ev_sis_pg_q1=1; await talk(day('2030-01-02','2030-01-31'),[1]);
    check('4. Q2 開頭（'+(rain||'都沒有')+'）：「'+line+'」',has(line)&&has('十二月結案，很累。一月比較好。'),J(H.said.map(x=>x.t))); }
  fresh('2030-04-01',19,'TW','FAMILIAR'); await talk(day('2030-04-01','2030-04-30'),[0]); check('4. Q3：「……我以前改你的筆記，你是不是很討厭。」→「有一點。」',has('……我以前改你的筆記，你是不是很討厭。')&&has('……現在改他的，我改得比較少。'));
  fresh('2030-09-01',19,'TW','FAMILIAR'); await talk(day('2030-09-01','2030-09-30'),[1]); check('4. Q4：「熱水。不是咖啡。」→（坐下）',has('熱水。不是咖啡。')&&has('（你們坐到十點。她先收好書，等你收完才一起走。）'));
  fresh('2029-11-05',19,'TW','FAMILIAR'); const late=await talk('2029-11-05'); check('4. 窗口過了（11 月）：Q1 不補',late!==true&&!H.G.events.done.ev_sis_pg_q1);
  fresh('2029-10-01',19,'TW','FAMILIAR'); H.date('kexin'); const o=await talk(day('2029-10-01','2029-10-31')); fresh('2029-10-01',19,'TW','FAMILIAR'); H.date(ID); const d1=await talk(day('2029-10-01','2029-10-31'));
  check('4. 和別人交往中也有；和她交往中沒有',o===true&&d1!==true,J([o,d1])); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
