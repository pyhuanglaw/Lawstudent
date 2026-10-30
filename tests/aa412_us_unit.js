// AA_412 美國篇的四個缺口（AA-B 2026-10-23 18:1x）——不需要瀏覽器。照 AA_412 第 6 節「測試（BB）」的情境寫，每一項至少一個檢查：
//   F  第 2 節 主線 8「遠方」美國版 ev_far_call_us（src/data/r2y3b_events.js、src/r2y3b3d.js 的 S.farPhoneUS）：
//      9/20 美國 09:00 阿哲私訊、兩個回覆；9/21 07:30 視訊（標 alarm，睡覺 07:00 醒）；在場的人照條件；何俊朗只在有 MET_LONG；「明天不行。」不演；沒接＝07:45 照片；不在麵店團、和阿哲熟的版本
//   W  第 3 節「208 的週末」七場（src/us208_3d.js）：交往中、US2 以後的週末進 208 照順序演；一個週末一場；過了範圍跳過；3-5 只有 11/5；3-3、3-7 多一句旁白有條件；
//      挽回中、平日、芝加哥不演；記憶（第 3-8 節）＋面板名稱；演完不吃掉當天的閒聊階梯
//   C  第 4 節 美國的課每門八句輪流（src/data/us_life_events.js classLines）：第 5 次上那門課起出現新的句子
//   L  第 5 節「看」的文字（src/us3d.js）：校園活動中心路口照日期換季、「（這一版還沒開放。）」拿掉；圖書館服務台交往中的多一句只在她在的時候；超市街招租
//   Z  接線：index.html（us_life3d.js 後面）；在 Node 裡建出真正的區域（us_campus、us_lawlib、us_market_street），互動點的「看」是定稿（另一個行程，同 tests/nav_us_unit.js 的載法）
// 台詞逐字對 AA_412：每一句都直接寫在這裡比對（不從程式讀）。修改前（開發分支 27b5e58b）：沒有 ev_far_call_us、沒有 src/us208_3d.js、classLines 四句、暫用的「看」——全部 FAIL。
// 用法：node tests/aa412_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');

/* ============ Z：真正的區域（另一個行程：three.js、引擎、區域；不載劇情）============ */
if(process.argv[2]==='--zones'){
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/us_layouts.js','src/us3d.js']){
    let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const dayOf=k=>{ for(let d=-420;d<2200;d++) if(CALENDAR.dateOf(d).key===k) return d; return null; };
  const wd=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
  global.GAME={G:null}; let sisIn=true; global.USL={sisAt:()=>sisIn?{zone:'us_lawlib',act:'read',to:12}:null};
  const setG=(k,h,dating)=>{ const d=dayOf(k); GAME.G={day:d,hour:h,weekday:wd(d),flags:dating?{dating_heroine_05:true}:{}}; };
  const build=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; return E.interactables.slice(); };
  const out={};
  const C=build('us_campus'), gate=C.find(i=>i.usGate), cls=C.find(i=>i.usClass==='law');
  for(const k of ['2028-10-08','2028-10-09','2028-10-31','2028-11-01','2028-12-01','2028-12-02']){ setG(k,15,false); out['gate@'+k]=gate&&gate.look; out['season@'+k]=US3.usSeasonKey(); }
  out.cls=cls&&cls.look;
  const L=build('us_lawlib'), desk=L.find(i=>i.usLib==='desk');
  setG('2028-10-02',10,true); out.deskIn=desk&&desk.look; sisIn=false; out.deskOut=desk&&desk.look; sisIn=true; setG('2028-10-02',10,false); out.deskSingle=desk&&desk.look;
  for(const q of L.filter(i=>i.usLib&&i.usLib!=='desk')) out['lib.'+q.usLib]=q.look;
  if(Z3.ZONES.us_market_street){ const M=build('us_market_street'), ls=M.find(i=>i.label==='看招租的告示'); out.lease=ls&&ls.look; }
  process.stdout.write(JSON.stringify(out)); process.exit(0);
}

/* ============ 劇情、系統（pg_harness＋美國篇的檔案）============ */
const H=require('./pg_harness.js');
const {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const capt=[]; GM.caption=(a,b)=>{ capt.push(b); };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
GM.studySession=async()=>{};
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,flags); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; G.stats.study=0; ROM.rec(G); capt.length=0; E.player.busy=false; E.paused=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating'; SOCIAL.remember(S5,'FIRST_MET',''); };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const txt=th=>(H.G.msgs||[]).filter(m=>m.th===th).map(m=>(m.from||'')+':'+m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const run=async(id,o)=>{ H.said=[]; H.opts=[]; await EVENTS.run(ev(id),o); };
const L=()=>H.lines();
const grp=()=>PHONE.join(H.G,'noodle_team','麵店團');

(async()=>{
/* ======================= 0 載入、接線 ======================= */
await sec(0,()=>{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('0. 美國篇的檔案都載得到（含新的 src/us208_3d.js）',!loadErr.length,loadErr.join('；'));
  check('0. index.html：us208_3d.js 接在 us_life3d.js 的下一行',/src\/us_life3d\.js\?v=[^"]+"><\/script>\n<script src="src\/us208_3d\.js\?v=[^"]+"><\/script>/.test(html));
  check('0. ev_far_call_us 在 STORY_EVENTS、R2Y3B.farPhoneUS／farPhotoUS；US208 七場事件、掛在 STORY.TICKS',!!ev('ev_far_call_us')&&typeof R2Y3B.farPhoneUS==='function'&&typeof R2Y3B.farPhotoUS==='function'&&typeof US208!=='undefined'&&US208.SCENES&&US208.SCENES.length===7&&US208.SCENES.every(s=>!!ev(s.ev))&&STORY.TICKS.length>0); });
if(typeof US208==='undefined'||!ev('ev_far_call_us')){ H.done(); return; }

/* ======================= F 主線 8「遠方」美國版 ======================= */
const FAR_ALL=['（早上七點半。你端著一碗麥片，走到門外的平台上。這裡的收訊比房間好。）','你那邊幾點？……你吃什麼？給我看。','（你舉起那碗麥片。）','就這樣？',
  '你瘦了！……不對，是鏡頭。','強制執行法的筆記，我留了一份。你大五補修用得到。','讀書會你的位子，我們沒有人坐。','（語彤從廚房探出頭，舉起田野筆記，沒說話。）','滷蛋要不要！隔著螢幕也要問！',
  '（樓下有人經過，是何俊朗，手上提著一袋早餐。他抬頭看到你在講視訊。）','Hello，台灣！','好了，麵要糊了。……你自己也要吃飯。','（畫面關掉。平台上很安靜，遠處有人在割草。）'];
const FAR_SOLO=[0,1,2,3,11,12].map(i=>FAR_ALL[i]);
const farSetup=(key,h,o)=>{ o=o||{}; fresh(key,h,'us_apartment',US(o.flags)); if(o.grp!==false) grp(); R('zhe',o.zhe||'FRI'); for(const id of (o.ppl||[])) R(id,'FRI'); dateSis(); return H.G; };
await sec('F0',()=>{ const G=farSetup('2028-09-20',8.9);
  check('F0. 9/20 美國時差：STORY.tzOffset＝−12（臺灣 21:00＝美國 09:00）',STORY.tzOffset(G,D('2028-09-20'))===-12&&STORY.tzOffset(G,D('2028-09-21'))===-12);
  rules(); check('F0. 08:54（當地）還沒有私訊',!PHONE.sent(G,'us_far_call'));
  at('2028-09-20',9.05); rules(); const m=PHONE.byAsk(G,'us_far_call');
  check('F0. 9/20（三）美國 09:00 阿哲私訊（p:zhe）「明天你那邊早上七點半 視訊 給我起床」，兩個回覆「好。」「明天不行。」',J(txt('p:zhe'))===J(['zhe:明天你那邊早上七點半 視訊 給我起床'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天不行。'])&&m.day===D('2028-09-20')&&m.h>=9&&m.h<9.06,J([txt('p:zhe'),m&&{d:m.day,h:m.h}]));
  PHONE.answer(G,'us_far_call',0); rules(); const q=OUT.get(G,'us_far_call');
  check('F0. 「好。」→「記得吃飯」；排 9/21（四）美國 07:30（臺灣 19:30）：「接起來：阿哲打視訊來（麵店，臺灣 19:30）」「先不接」、15 分鐘',txt('p:zhe').includes('zhe:記得吃飯')&&!!q&&q.day===D('2028-09-21')&&q.h===7.5&&q.late===0.25&&q.verb==='接起來'&&q.no==='先不接'&&q.title==='阿哲打視訊來（麵店，臺灣 19:30）'&&q.ev==='ev_far_call_us',J(q));
  const al=STORY.wakeAlarms(G,D('2028-09-21')).find(a=>/阿哲打視訊來/.test(a.why));
  check('F0. 早上的視訊有鬧鐘：9/20 晚上睡覺 07:00 醒（不會睡到中午錯過）',!!al&&Math.abs(al.h-7)<1e-6,J(al));
  check('F0. 9/21 下午 13:00 Comparative 不衝突（同一天照常有課）',USL.items(G,D('2028-09-21')).some(it=>it.c.id==='us_comp'&&it.t0===13)); });
await sec('F1',async()=>{ const G=farSetup('2028-09-21',7.5,{ppl:['yu','classmate_bohan','classmate_xinci','heroine_03'],flags:{MET_LONG:true}});
  ACTIVITIES.rec(G).att['public_law_group@'+D('2028-03-02')]={h:20,end:'full'};
  await run('ev_far_call_us');
  check('F1. 在麵店團、都認識、參加過讀書會、見過何俊朗：台詞逐字、順序照 AA_412 第 2 節（【美】的麥片、柏翰、何俊朗、割草）；FAR_CALL us',J(H.said.map(s=>s.t))===J(FAR_ALL)&&G.flags.FAR_CALL==='us',J(L()));
  check('F1. 說話的人：阿哲、Alison、柏翰、芯慈；「阿姨（畫面外）」；何俊朗',H.said.some(s=>s.who==='阿姨（畫面外）'&&s.t==='滷蛋要不要！隔著螢幕也要問！')&&H.said.some(s=>s.who==='何俊朗'&&s.t==='Hello，台灣！')&&H.said.filter(s=>s.t==='就這樣？').every(s=>s.who&&s.who!=='何俊朗'),J(L()));
  check('F1. 美國版沒有以安那一則、沒有日本版的柏翰「筆記拍給我」、沒有便利商店飯糰',!H.said.some(s=>/他吃飯糰|筆記拍給我|飯糰/.test(s.t)));
  check('F1. 背景：視訊（同日本版 bg video）',H.bgs.some(b=>J(b)===J(OUT.bg('video'))),J(H.bgs)); });
await sec('F2',async()=>{ const G=farSetup('2028-09-21',7.5,{ppl:['yu','classmate_bohan','classmate_xinci','heroine_03']});
  await run('ev_far_call_us');
  check('F2. 沒見過何俊朗（沒有 MET_LONG）：他那兩句不出；沒參加過讀書會：芯慈那句不出；其他照樣',!H.has('Hello，台灣！')&&!H.has(FAR_ALL[9])&&!H.has('讀書會你的位子，我們沒有人坐。')&&H.has('強制執行法的筆記，我留了一份。你大五補修用得到。')&&H.has('（畫面關掉。平台上很安靜，遠處有人在割草。）'),J(L()));
  farSetup('2028-09-21',7.5); SOCIAL.remember('npc_long','MET_LONG',''); await run('ev_far_call_us');
  check('F2. MET_LONG 是記憶（舊存檔 R3 版迎新記的，AA_370 M3 兩邊互相認）也算：何俊朗出現',H.has('Hello，台灣！')&&H.has(FAR_ALL[9]));
  check('F2. 不認識 Alison、柏翰、語彤：她們的句子不出（照日本版的條件）',!H.has('你瘦了！……不對，是鏡頭。')&&!H.has('強制執行法的筆記，我留了一份。你大五補修用得到。')&&!H.has('（語彤從廚房探出頭，舉起田野筆記，沒說話。）')&&H.has('滷蛋要不要！隔著螢幕也要問！')); });
await sec('F3',async()=>{ const G=farSetup('2028-09-20',9.1,{grp:false,zhe:'FAM',flags:{MET_LONG:true}}); rules();
  check('F3. 不在麵店團、和阿哲 FAMILIAR：一樣收到私訊',txt('p:zhe').includes('zhe:明天你那邊早上七點半 視訊 給我起床'));
  at('2028-09-21',7.5); await run('ev_far_call_us');
  check('F3. 阿哲一個人打來：只留阿哲的三句、麥片的旁白、最後一句旁白（群組那幾行、何俊朗都不出）',J(H.said.map(s=>s.t))===J(FAR_SOLO),J(L()));
  fresh('2028-09-20',9.1,'us_apartment',US()); SOCIAL.rel('zhe').fam=5; SOCIAL.remember('zhe','FIRST_MET',''); rules();
  check('F3. 不在麵店團、和阿哲不熟：沒有私訊',!PHONE.sent(H.G,'us_far_call')); });
await sec('F4',async()=>{ let G=farSetup('2028-09-20',9.1); rules(); PHONE.answer(G,'us_far_call',1); rules();
  const q=OUT.get(G,'us_far_call');
  check('F4. 「明天不行。」→「好啦 那下次」、記 FAR_CALL_NO、不排視訊',txt('p:zhe').includes('zhe:好啦 那下次')&&G.flags.FAR_CALL_NO===true&&(!q||q.state==='cancelled'));
  at('2028-09-21',8); rules(); OUT.tick(GM); PHONE.tick(G);
  check('F4. 「明天不行。」：07:45 沒有照片',!(G.msgs||[]).some(m=>/長桌上空著一個位子/.test(m.text||'')));
  G=farSetup('2028-09-20',9.1); rules(); PHONE.answer(G,'us_far_call',0); rules(); at('2028-09-21',7.7); rules(); PHONE.tick(G);
  check('F4. 07:42 還在 15 分鐘裡：還沒算沒接',OUT.get(G,'us_far_call').state==='planned'&&!(G.msgs||[]).some(m=>/長桌上空著一個位子/.test(m.text||'')));
  at('2028-09-21',7.76); rules(); OUT.tick(GM); PHONE.tick(G);
  const q2=OUT.get(G,'us_far_call'), ph=(G.msgs||[]).find(m=>/長桌上空著一個位子/.test(m.text||''));
  check('F4. 答應了、15 分鐘沒接：沒接（missed）、美國 07:45（臺灣 19:45）群組一張照片「（照片：長桌上空著一個位子，前面放了一碗麵）」',q2.state==='missed'&&!!ph&&ph.th==='g:noodle_team'&&ph.from==='zhe'&&ph.text==='（照片：長桌上空著一個位子，前面放了一碗麵）'&&ph.day===D('2028-09-21')&&ph.h>=7.75&&ph.h<7.77,J([q2&&q2.state,ph]));
  G=farSetup('2028-09-20',9.1,{grp:false,zhe:'FAM'}); rules(); PHONE.answer(G,'us_far_call',0); rules(); at('2028-09-21',7.5); H.picks=[2]; await OUT.prompt(GM,OUT.get(G,'us_far_call')); at('2028-09-21',7.8); PHONE.tick(G);
  check('F4. 「先不接」（不在麵店團）：照片傳到阿哲私訊',OUT.get(G,'us_far_call').state==='missed'&&txt('p:zhe').includes('zhe:（照片：長桌上空著一個位子，前面放了一碗麵）'),J(txt('p:zhe')));
  G=farSetup('2028-09-20',9.1); rules(); PHONE.answer(G,'us_far_call',0); rules(); at('2028-09-21',7.5); H.picks=[0]; H.said=[]; await OUT.prompt(GM,OUT.get(G,'us_far_call'));
  check('F4. 「接起來」：演 ev_far_call_us、FAR_CALL us、沒有照片',G.flags.FAR_CALL==='us'&&H.has('就這樣？')&&!(G.msgs||[]).some(m=>/長桌上空著一個位子/.test(m.text||''))); });
await sec('F5',()=>{ fresh('2028-09-20',21.1,'dorm',{EXCHANGE_ROUTE:'TW',EXCH_RULE:1}); grp(); R('zhe','FRI'); rules();
  check('F5. 臺灣路線：沒有美國版的私訊',!PHONE.sent(H.G,'us_far_call'));
  fresh('2028-04-12',22.1,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1}); grp(); R('zhe','FRI'); rules();
  check('F5. 日本路線照舊（4/12 日本 22:00 的「明天七點半 視訊 麵店」，沒有美國版）',txt('p:zhe').includes('zhe:明天七點半 視訊 麵店')&&!PHONE.sent(H.G,'us_far_call')); });

/* ======================= W 208 的週末 ======================= */
const W={
  '3-1':['（門沒鎖。她坐在沙發上，腿上放著筆電。）','Legal Writing 的作業寫完了嗎？','拿來。我看一下。','（她拿鉛筆在你印出來的那兩頁上畫線。畫得很輕，擦得掉。）','第一段太長了。你的教授說得對。','這裡。你想說的是這一句，可是你把它放在最後面。'],
  '3-1a':['你自己搬。我只畫線。','（她把鉛筆遞給你。）'], '3-1b':['沒有。我只是被退過。','（她看了一眼桌上那份被退回的報告。上面的紅字比你的多。）'],
  '3-2':['（還沒進門就聞到了。醬油、八角，還有一點焦味。）','亞洲超市買得到八角。冰糖沒有，我用一般的糖。','……所以有一點焦。','（她的小鍋子在爐子上，蓋子一直被頂起來。室友從房間探出頭，用英文問這是什麼味道，可不可以吃一碗。）',"（對室友）It's my mom's recipe.",'（小聲，對你）我媽的不會焦。'],
  '3-2a':['香是香。吃了再說。'], '3-2b':['這裡買不到。','（她翻開計畫本，在十二月底的格子裡寫了兩個字：冰糖。）'],
  '3-3':['（沙發上放著一個從臺灣寄來的牛皮紙信封，郵票貼了一整排。）','我爸寄的。','一張剪報。法律扶助的新聞。……郵資比報紙貴。','（信封裡只有那一張剪報，沒有信。剪報的邊剪得很整齊。）'],
  '3-3x':'（你想起她說過，她爸以前會把報紙剪下來，放在她的書桌上。）', '3-3c':['他還是一個字都沒寫。'],
  '3-3a':['回了。我拍照傳給他，說收到了。','（她把手機轉過來給你看。她爸只回了一個字：好。）'], '3-3b':['……嗯。','（她把剪報夾進那本從臺灣帶來的、大一的民總。）'],
  '3-4':['（她站在客廳中間，手上拿著幾張小卡。看到你進來，把卡片翻過去。）','下禮拜三研討課，我要報告。二十分鐘，英文。','你坐那裡。哪裡聽不懂就舉手。','（她開始講。你在第二句就舉手了。）','……哪裡？'],
  '3-4a':['手放下。','（她從第一句重新開始。這一次你沒有舉手，一直聽到最後。）'], '3-4b':['……真的？','（她在卡片上那個字的旁邊畫了一條線。之後每講到那個字，她都慢一點。）'], '3-4e':['好。這樣可以。','冰箱裡有飲料。你自己拿。'],
  '3-5':['（今天開始冬令時間。手機自己把時間往回撥了一個小時。）','今天多一個小時。','（她的計畫本攤在桌上。今天那一格，什麼都沒寫。）','本來想拿來寫論文。……後來沒有寫上去。'],
  '3-5a':['不知道。','（她把計畫本闔起來。）','坐著吧。','（你們坐在沙發上，看窗外的天比昨天早黑。誰都沒有去看時間。）'], '3-5b':['……也可以。','（她真的靠在沙發上睡著了。毯子是你幫她蓋的。）'],
  '3-6':['（客廳那盆快乾掉的植物，被搬到了窗邊。旁邊放著一個量杯。）','室友說它九月就這樣了。','我查了。是水澆太多。','（她把量杯裡的水倒掉一半，才澆下去。）'],
  '3-6a':['不知道。我只顧到十二月。','之後交給室友。我寫在冰箱上了。'], '3-6b':['沒有排。','……好，有排。星期六。'],
  '3-7':['（客廳的桌上堆滿了影印的資料。她在寫期末的報告，沒有抬頭。）','你坐那裡就好。','……有人在，我寫得比較快。','（你在沙發上讀你的期末。兩個小時，她只說了一句話。）','幫我倒水。熱的。'],
  '3-7x':'（窗邊那盆植物長出了一片新的葉子，很小。她沒有提，你也沒有。）', '3-7a':['還沒。……今天的寫完了。'], '3-7b':['（過了一會兒，她起來倒水，把你的杯子也倒滿了。）'] };
const OPTS={'3-1':['「那要搬到前面嗎？」','「妳英文寫得比我好。」'],'3-2':['「很香。」','「下次放冰糖。」'],'3-3':['「妳要回他嗎？」','「他在等妳回去。」'],'3-4':['「沒有，只是想試試看。」','「Legal aid 妳念得太快。」'],
  '3-5':['「那拿來做什麼？」','「拿來睡覺。」'],'3-6':['「救得回來嗎？」','「妳連植物都排時間。」'],'3-7':['「寫完了嗎？」','（不問，繼續讀）']};
const MEM={'3-1':['US208_MEMO','書瑀幫你看 Legal Writing 的作業'],'3-2':['US208_LUROU','書瑀煮了有一點焦的滷肉'],'3-3':['US208_CLIPPING','書瑀的爸爸寄了一張剪報到美國'],'3-4':['US208_REHEARSAL','聽書瑀練習英文報告'],
  '3-5':['US208_EXTRA_HOUR','冬令時間那天，計畫本空了一格'],'3-6':['US208_PLANT','書瑀在救客廳那盆植物'],'3-7':['US208_LASTWEEK','期末那個週末，坐在 208 的沙發上讀書']};
const sc=n=>US208.SCENES.find(s=>s.n===n);
const w208=(key,h,flags)=>{ const G=fresh(key,h,'us_shared',US(Object.assign({US2:'there'},flags||{}))); dateSis(); return G; };
const play=async picks=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=US208.tick(GM,0.5); for(let i=0;i<100&&US208.isBusy();i++) await new Promise(res=>setTimeout(res,1)); return r; };
const who=()=>[...new Set(H.said.filter(s=>s.who).map(s=>s.who))];
await sec('W0',()=>{
  check('W0. 七場的日期範圍照 AA_412 第 3 節的標題',J(US208.SCENES.map(s=>[s.n,s.from,s.to]))===J([['3-1','2028-09-16','2028-09-24'],['3-2','2028-09-23','2028-10-01'],['3-3','2028-10-14','2028-10-22'],['3-4','2028-10-21','2028-10-29'],['3-5','2028-11-05','2028-11-05'],['3-6','2028-11-18','2028-12-03'],['3-7','2028-12-09','2028-12-10']]));
  check('W0. 2028-09-16 是週六、11/5 是週日（冬令時間那天：STORY.tzOffset 從 −12 變 −13）、12/9 是週六',wdOf(D('2028-09-16'))===6&&wdOf(D('2028-11-05'))===0&&wdOf(D('2028-12-09'))===6&&(w208('2028-11-05',14.5),STORY.tzOffset(H.G,D('2028-11-05'))===-13&&STORY.tzOffset(H.G,D('2028-11-04'))===-12));
  check('W0. 記憶與面板名稱（第 3-8 節）：social3d.js 的 MEMORY_LABEL；事件標題＝筆記本那一行',Object.keys(MEM).every(n=>sc(n).tag===MEM[n][0]&&SOCIAL.MEMORY_LABEL[MEM[n][0]]===MEM[n][1]&&ev(sc(n).ev).title===MEM[n][1]),J(Object.keys(MEM).map(n=>SOCIAL.MEMORY_LABEL[MEM[n][0]]))); });
await sec('W1',async()=>{ let G=w208('2028-09-16',14.5);
  check('W1. 9/16（六）14:30 交往中、US2 以後，人在 208：該演 3-1',US208.due(G)===sc('3-1'));
  const r=await play([0]);
  check('W1. 進 208 先演 3-1「備忘錄」：台詞逐字、選項兩個、選「那要搬到前面嗎？」',r===true&&J(H.said.map(s=>s.t))===J(W['3-1'].concat(W['3-1a']))&&J(H.opts[0])===J(OPTS['3-1']),J(L()));
  check('W1. 她說話框的名字是「書瑀」（交往中，AA_411）',J(who())===J(['書瑀']),J(who()));
  check('W1. 背景：照 US2（模糊的 3D 208，blur；不換成黑底的圖）；不出標題字卡、地點字幕',J(H.bgs)===J(['blur'])&&!capt.includes(MEM['3-1'][1])&&!capt.length,J([H.bgs,capt]));
  check('W1. 記憶 US208_MEMO（不另外加數值）；記這個週末',SOCIAL.has(S5,'US208_MEMO')&&G.flags.US208_WK===D('2028-09-16')&&!!G.events.done.ev_us208_memo);
  H.said=[]; const r2=await play(); check('W1. 同一天再進 208：不再演',r2===false&&!H.said.length);
  at('2028-09-17',15); check('W1. 同一個週末的週日（9/17）：不演（一個週末最多一場）',US208.due(G)===null&&(await play())===false);
  at('2028-09-23',15); check('W1. 下一個週末（9/23）：3-2「滷肉」（3-1 演過了）',US208.due(G)===sc('3-2'));
  await play([1]); check('W1. 3-2 台詞逐字、選「下次放冰糖。」',J(H.said.map(s=>s.t))===J(W['3-2'].concat(W['3-2b']))&&J(H.opts[0])===J(OPTS['3-2'])&&SOCIAL.has(S5,'US208_LUROU'),J(L()));
  check('W1. 演完不吃掉當天的閒聊階梯（照常可以和她說話）',!(G.social&&G.social.ladderDay&&G.social.ladderDay[S5]===G.day));
  at('2028-09-30',15); check('W1. 9/30（六）：3-1、3-2 都演過，下一場 3-3 從 10/14 起，今天沒有',US208.due(G)===null);
  at('2028-10-14',14); check('W1. 10/14（六）14:00：3-3',US208.due(G)===sc('3-3')); });
await sec('W2',async()=>{ let G=w208('2028-09-23',16);
  check('W2. 9/16～9/17 沒去：9/23 先演 3-1（範圍 9/16～9/24 還在），不是 3-2',US208.due(G)===sc('3-1'));
  await play([1]); check('W2. 3-1 選「妳英文寫得比我好。」',J(H.said.map(s=>s.t))===J(W['3-1'].concat(W['3-1b'])),J(L()));
  at('2028-09-30',16); check('W2. 9/30：3-2（範圍到 10/1）',US208.due(G)===sc('3-2'));
  G=w208('2028-09-30',16);
  check('W2. 9/16～9/24 都沒去：3-1 過了範圍就不演（9/30 直接 3-2）',US208.due(G)===sc('3-2'));
  G=w208('2028-10-21',16);
  check('W2. 3-1、3-2、3-3 都沒演：10/21 在 3-3、3-4 的範圍重疊，先演 3-3',US208.due(G)===sc('3-3'));
  G.events.done.ev_us208_clipping=1; check('W2. 3-3 演過：10/21 演 3-4',US208.due(G)===sc('3-4'));
  G=w208('2028-11-18',15); check('W2. 前面的都沒去：11/18 只剩 3-6（3-1～3-5 不補）',US208.due(G)===sc('3-6'));
  G=w208('2028-12-10',15); check('W2. 12/10（日）：3-7',US208.due(G)===sc('3-7')); });
await sec('W3',async()=>{ let G=w208('2028-11-04',15);
  check('W3. 11/4（六）：沒有該演的（3-4 到 10/29、3-5 只有 11/5）',US208.due(G)===null);
  at('2028-11-05',15); check('W3. 11/5（日）：3-5「多出來的一個小時」',US208.due(G)===sc('3-5'));
  await play([0]); check('W3. 3-5 台詞逐字、選「那拿來做什麼？」',J(H.said.map(s=>s.t))===J(W['3-5'].concat(W['3-5a']))&&J(H.opts[0])===J(OPTS['3-5'])&&SOCIAL.has(S5,'US208_EXTRA_HOUR'),J(L()));
  G=w208('2028-11-05',15); await play([1]); check('W3. 3-5 選「拿來睡覺。」',J(H.said.map(s=>s.t))===J(W['3-5'].concat(W['3-5b'])),J(L()));
  G=w208('2028-11-04',15); at('2028-11-06',19); check('W3. 11/5 沒去：11/6（一）平日不演',US208.due(G)===null);
  at('2028-11-18',15); check('W3. 11/5 沒去：之後不補 3-5（11/18 是 3-6）',US208.due(G)===sc('3-6'));
  at('2028-11-11',15); check('W3. 11/11（六）她在芝加哥（門關著）：不演',US208.due(G)===null&&USL.c208Open(G)===false); });
await sec('W4',async()=>{ let G=w208('2028-10-14',15);
  await play([0]); check('W4. 3-3 沒聽過她大一下 S2-L5（剪報那一層）：沒有「你想起她說過……」；選「妳要回他嗎？」',J(H.said.map(s=>s.t))===J(W['3-3'].concat(W['3-3c'],W['3-3a']))&&J(H.opts[0])===J(OPTS['3-3']),J(L()));
  G=w208('2028-10-14',15); SOCIAL.remember(S5,'SIS4_CLIPPINGS','S2-L5'); await play([1]);
  check('W4. 3-3 聽過 S2-L5（記憶 SIS4_CLIPPINGS）：多一句旁白，在「他還是一個字都沒寫。」前面；選「他在等妳回去。」',J(H.said.map(s=>s.t))===J(W['3-3'].concat([W['3-3x']],W['3-3c'],W['3-3b']))&&SOCIAL.has(S5,'US208_CLIPPING'),J(L()));
  G=w208('2028-10-14',15); G.social.ladSeen={'S2-L5':D('2027-03-20')}; await play([0]); check('W4. 3-3 S2-L5 是過場演過的（ladSeen）也算',H.has(W['3-3x']));
  G=w208('2028-10-21',15); G.events.done.ev_us208_clipping=1; await play([1]);
  check('W4. 3-4「練習」台詞逐字、選「Legal aid 妳念得太快。」，兩支都接「好。這樣可以。」「冰箱裡有飲料。你自己拿。」',J(H.said.map(s=>s.t))===J(W['3-4'].concat(W['3-4b'],W['3-4e']))&&J(H.opts[0])===J(OPTS['3-4']),J(L()));
  G=w208('2028-10-28',15); await play([0]); check('W4. 3-4 選「沒有，只是想試試看。」',J(H.said.map(s=>s.t))===J(W['3-4'].concat(W['3-4a'],W['3-4e'])),J(L()));
  G=w208('2028-11-18',15); await play([0]); check('W4. 3-6「植物」台詞逐字、選「救得回來嗎？」',J(H.said.map(s=>s.t))===J(W['3-6'].concat(W['3-6a']))&&J(H.opts[0])===J(OPTS['3-6'])&&SOCIAL.has(S5,'US208_PLANT'),J(L()));
  G=w208('2028-12-02',15); await play([1]); check('W4. 3-6 選「妳連植物都排時間。」（12/2 14:00～20:00 她在 208）',J(H.said.map(s=>s.t))===J(W['3-6'].concat(W['3-6b'])),J(L()));
  at('2028-12-02',20.5); G.events.done={}; G.flags.US208_WK=null; check('W4. 12/2 20:00～21:30 初雪那晚她在小教堂台階：不演',US208.due(G)===null);
  G=w208('2028-12-09',15); await play([0]); check('W4. 3-7 沒演過 3-6：沒有植物那一句；選「寫完了嗎？」',J(H.said.map(s=>s.t))===J(W['3-7'].concat(W['3-7a']))&&J(H.opts[0])===J(OPTS['3-7'])&&SOCIAL.has(S5,'US208_LASTWEEK'),J(L()));
  G=w208('2028-12-10',15); G.events.done.ev_us208_plant=1; await play([1]);
  check('W4. 3-7 演過 3-6：多一句植物的旁白（在選項前）；選「（不問，繼續讀）」',J(H.said.map(s=>s.t))===J(W['3-7'].concat([W['3-7x']],W['3-7b'])),J(L())); });
await sec('W5',()=>{ let G=fresh('2028-09-16',15,'us_shared',US({US2:'repair'}));
  check('W5. 挽回中（沒在交往）：不演、208 門關著',US208.due(G)===null&&USL.c208Open(G)===false);
  G=w208('2028-09-18',19); check('W5. 平日（9/18 週一 19:00）：不演',US208.due(G)===null);
  G=w208('2028-09-16',13.9); check('W5. 週六 13:54：不演；21:00 以後：不演',US208.due(G)===null&&(at('2028-09-16',21),US208.due(G)===null));
  G=fresh('2028-09-16',15,'us_shared',US()); dateSis(); check('W5. US2 沒有紀錄（9/13 不在附近、之後才在一起）：9/16 照樣演（同 USL.c208Open 的「US2 以後」）',US208.due(G)===sc('3-1'));
  G=w208('2028-09-16',15); G.zone='us_outside'; check('W5. 不在 208（社區）：tick 不演',US208.tick(GM,0.5)===false&&!G.flags.US208_WK);
  G=w208('2028-09-16',15,{EXCHANGE_ROUTE:'TW'}); check('W5. 不是美國路線：不演',US208.due(G)===null); });

/* ======================= C 美國的課：每門八句輪流 ======================= */
const CL={us_intro:['教授問，誰的國家用的是法典。一半的人舉手，另一半看著那一半。','今天讀一份很長的判決。你在第一頁查過的單字，最後一頁又查了一次。','後排的同學在電腦上打筆記，打字聲比教授的聲音還大。','下課前，教授問大家覺得陪審團公不公平。沒有人回答，時間就到了。'],
  us_comp:['教授的投影片上有一張世界地圖。臺灣太小，他用紅筆圈了起來。','一個巴西來的同學說，他們的憲法很長。全班笑了，他沒有笑。','今天輪到你帶討論。你準備的東西講完了，時間還剩一大半，後面都是別人在問。','下課以後，德國來的同學把你的報告借去看。還你的時候，上面多了幾個問號。'],
  us_writing:['今天練習改一個太長的句子。你改完的，比原本的還長。','教授在你的作業上畫了一個箭頭，旁邊寫：Start here. 箭頭指的是你的第二段。','中間休息的時候，你走去圖書館。咖啡機上還是貼著『故障』。','今天交的是一封給客戶的信。教授說：你的客戶不是法官，不要嚇他。']};
await sec('C',async()=>{ const X=US_LIFE_EVENTS.DATA.classLines, G=fresh('2028-08-21',9,'us_apartment',US());
  check('C. 三門課都是十二句（AA_531 5-1 又接四句；原本八句）：原本四句不動、AA_412 的四句接在後面（第 5～8 句，AA_412 第 4 節逐字）',['us_intro','us_comp','us_writing'].every(id=>X[id].length===12&&J(X[id].slice(4,8))===J(CL[id]))&&X.us_intro[0]==='教授第一堂課就問：『誰讀過陪審團的電影？』全班都舉手。'&&typeof X.us_writing[1]==='function');
  check('C. 輪流：第 1～4 次是原本的、第 5～8 次是新的、第 13 次回到第一句（AA_531 5-1 起十二句；原本第 9 次）',['us_intro','us_comp','us_writing'].every(id=>USL.classLine(id,4,G)===CL[id][0]&&USL.classLine(id,7,G)===CL[id][3]&&USL.classLine(id,12,G)===USL.classLine(id,0,G)));
  check('C. Legal Writing 第二句照舊：沒見過何俊朗＝「坐你前面的交換生」（AA_370 L1；AA_451 1-2 換字）',USL.classLine('us_writing',1,G)==='坐你前面的交換生交出去的作業，被圈出三個『however』。');
  /* 一鍵上課（USL.attend）實際上五次 Introduction（週一、三 10:00）：第五次出現新的第一句 */
  const got=[]; let d=D('2028-08-21'); while(got.length<5){ const w=wdOf(d); if((w===1||w===3)&&USL.classDay(d)){ at(CALENDAR.dateOf(d).key,9.5); const it=USL.items(G).find(x=>x.c.id==='us_intro'); H.said=[]; await USL.attend(GM,it); got.push(H.said.map(s=>s.t).join('｜')); } d++; }
  check('C. 一鍵上課五次 Introduction：第 1 次＝原本第一句、第 5 次＝新的第一句（第 5 次上那門課起出現新的）',got[0]===X.us_intro[0]&&got[4]===CL.us_intro[0]&&G.usLife.att.us_intro===5,J(got)); });

/* ======================= L「看」的文字 ======================= */
const GATE='往學生活動中心的路，兩旁是一排老橡樹。活動中心在整修，路口圍了一圈欄杆。';
const LIB={desk:'服務台。館員在蓋還書章。旁邊一盒鉛筆，牌子上寫著：自己拿。',stair_rope:'樓梯口拉著紅絨繩，牌子上寫著：樓上書庫整理中，暫停開放。要借樓上的書，到服務台填單。',window:'彩色玻璃窗，拼的是一架天平和幾本書。下午的光照進來，天平的影子落在長桌上。',stacks:'書架。一整排深紅色書背的判例彙編，書背上的金字磨掉了一半。',catalog:'查詢電腦。螢幕還停在前一個人查的那一頁：一本英國的契約法。'};
const DESK_SIS='（館員看到你，往中庭的長桌點了一下頭。她在那裡。）';
const LEASE='空的店面。玻璃上貼著招租的紙，一個電話號碼。旁邊還看得到舊招牌的膠痕，以前是一家洗衣店。';
const CLS_LOOK='法學院的台階。上去的走廊兩邊都是教室，門上貼著課號和上課時間。現在沒有你的課。';
await sec('L',()=>{ const g=(k)=>{ fresh(k,15,'us_campus',US()); return US3.campusLook('gate',H.G); };
  check('L1. 校園「往活動中心」：8～10/8 只有定稿那一句（拿掉「（這一版還沒開放。）」；AA_448 換季日子）',g('2028-08-21')===GATE&&g('2028-10-08')===GATE);
  check('L1. 10/9 起多一句「橡樹的葉子開始轉紅了。」（到 10/31）',g('2028-10-09')===GATE+'橡樹的葉子開始轉紅了。'&&g('2028-10-31')===GATE+'橡樹的葉子開始轉紅了。',g('2028-10-09'));
  check('L1. 11/18 起換成「葉子掉得差不多了，地上都是橡實。」',g('2028-11-18')===GATE+'葉子掉得差不多了，地上都是橡實。'&&g('2028-12-01')===GATE+'葉子掉得差不多了，地上都是橡實。');
  check('L1. 12/2（初雪）起換成「欄杆上積了一層雪。」',g('2028-12-02')===GATE+'欄杆上積了一層雪。'&&g('2028-12-15')===GATE+'欄杆上積了一層雪。');
  check('L1. 「進教室」（現在沒有課的時候）定稿',US3.campusLook('class',H.G)===CLS_LOOK);
  const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8'); check('L1. us3d.js 裡沒有「這一版還沒開放」',!/這一版還沒開放/.test(src));
  const lib=id=>US3.libLook(id,H.G,'x');
  fresh('2028-10-02',10,'us_lawlib',US()); dateSis();
  check('L2. 圖書館：樓梯、彩色玻璃窗、書架定稿；查詢電腦照原本的字',['stair_rope','window','stacks','catalog'].every(id=>lib(id)===LIB[id]));
  check('L2. 服務台：交往中、10/2（一）10:00 她在圖書館（USL.sisAt）＝多一句',USL.sisAt(H.G).zone==='us_lawlib'&&lib('desk')===LIB.desk+DESK_SIS,lib('desk'));
  at('2028-10-02',11.6); check('L2. 11:30 以後（她 11:30～12:00 收書）：沒有那一句',lib('desk')===LIB.desk);
  at('2028-10-02',8.9); check('L2. 09:00 以前：沒有',lib('desk')===LIB.desk);
  at('2028-09-29',10); check('L2. 10/1 以前（9/29 週五 10:00）：沒有',lib('desk')===LIB.desk);
  at('2028-10-07',10); check('L2. 週末（10/7 週六）：沒有',lib('desk')===LIB.desk);
  at('2028-11-13',10); check('L2. 11/13（一）10:00：有',lib('desk')===LIB.desk+DESK_SIS);
  fresh('2028-10-02',10,'us_lawlib',US()); check('L2. 挽回中（沒在交往）：沒有',lib('desk')===LIB.desk);
  check('L3. 超市街「看招租的告示」定稿（配置的暫用字由 us3d.js 蓋過）',US3.LOOK_MS.lease===LEASE); });

/* ======================= Z 真正的區域（另一個行程）======================= */
await sec('Z',()=>{ const cp=require('child_process'); let o=null, err='';
  try{ o=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--zones'],{cwd:ROOT,encoding:'utf8',timeout:120000,maxBuffer:1<<24})); }catch(e){ err=String(e.message||e).slice(0,300); }
  check('Z. 建得出 us_campus、us_lawlib、us_market_street',!!o,err);
  if(!o) return;
  check('Z. 校園的「往活動中心」：按下去照那一天的日期，換季的日子照 usSeasonKey（AA_448 1-1：10/8 原句、10/9 轉紅、10/31 還是轉紅、11/1 橡實、12/1 還是橡實、12/2 雪）',o['gate@2028-10-08']===GATE&&o['gate@2028-10-09']===GATE+'橡樹的葉子開始轉紅了。'&&o['gate@2028-10-31']===GATE+'橡樹的葉子開始轉紅了。'&&o['gate@2028-11-01']===GATE+'葉子掉得差不多了，地上都是橡實。'&&o['gate@2028-12-01']===GATE+'葉子掉得差不多了，地上都是橡實。'&&o['gate@2028-12-02']===GATE+'欄杆上積了一層雪。'&&o['season@2028-10-09']!==o['season@2028-10-08']&&o['season@2028-11-01']!==o['season@2028-10-31']&&o['season@2028-12-02']!==o['season@2028-12-01']&&o['season@2028-10-09']===o['season@2028-10-31'],J(o));
  check('Z. 校園「進教室」的看＝定稿',o.cls===CLS_LOOK,o.cls);
  check('Z. 圖書館服務台：交往中、她在＝多一句；她不在、沒在交往＝原句',o.deskIn===LIB.desk+DESK_SIS&&o.deskOut===LIB.desk&&o.deskSingle===LIB.desk,J([o.deskIn,o.deskOut,o.deskSingle]));
  check('Z. 圖書館其他互動點＝定稿',['stair_rope','window','stacks','catalog'].every(id=>o['lib.'+id]===LIB[id]),J(Object.keys(o).filter(k=>/^lib\./.test(k)).map(k=>[k,o[k]])));
  check('Z. 超市街「看招租的告示」＝定稿',o.lease===LEASE,o.lease); });

H.done();
})();
