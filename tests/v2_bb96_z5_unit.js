// 交接包 v2（BB_96 3-5、3-6）：芷若 Z5「東京物語的早場」（改寫邀約＋新增早場）、方奕廷 Z6——不需要瀏覽器。修改前沒有早場事件（第 1 項失敗）。
// 檢查：邀約在大一下第 12～13 週週五 19–22 的 Café、Z4 之後；單身／交往中兩種邀約與數字（交往中沒有 aff）；「早場我起不來。」不扣分；隔天 10:00 的出遊；
//   早場台詞、「誰？」／方奕廷「笠智眾是誰？」、WATCHED_FILM／WATCHED_FILM_GROUP、三個「下次」與兩週內的回聲；Z6 的條件與台詞
// 用法：node tests/v2_bb96_z5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
(async()=>{
  const inv=ev('ev_zhiruo_film_night'), show=ev('ev_zhiruo_early_show'), kai=ev('ev_kai_cafe_film'), z6=ev('ev_fangyt_hint'), bar=ev('ev_cafe_barista_zhiruo');
  check('Z5／Z6：邀約、早場、阿凱的回聲、方奕廷的事件都在',!!inv&&!!show&&!!kai&&!!z6);
  if(!inv||!show||!kai||!z6){ console.log('FAILED '+fails); process.exit(1); }
  const FRI=termDay('Y1S2',12,5);
  const prep=(day,h,zone,flags,o)=>{ o=o||{}; fresh(day,h,zone||'cafe',flags||{}); SOCIAL.meet('heroine_02','cafe'); R('heroine_02',o.fam==null?25:o.fam,10,10); if(o.secret!==false) SOCIAL.remember('heroine_02','SHARED_SECRET','十點的電話'); if(o.z4!==false) G.events.done.ev_zhiruo_secret=1; };
  { const at=(day,h,zone,o)=>{ prep(day,h,zone,{},o); return EVENTS.check(inv); };
    const r={ok:at(FRI,20),w13:at(termDay('Y1S2',13,5),21.5),w11:at(termDay('Y1S2',11,5),20),sat:at(FRI+1,20),early:at(FRI,18),noZ4:at(FRI,20,'cafe',{z4:false}),wz:at(FRI,20,'wenzhou')};
    check('邀約：大一下第 12～13 週的週五 19–22、Café、Z4 之後（第 11 週、週六、18:00、沒有 Z4、溫州街都沒有）',r.ok&&r.w13&&!r.w11&&!r.sat&&!r.early&&!r.noZ4&&!r.wz,JSON.stringify(r)); }
  const nm=CHARACTERS.heroine_02.name;
  const invite=async(pick,dating)=>{ prep(FRI,20,'cafe',dating?{dating_kexin:true}:{}); const r0=Object.assign({},SOCIAL.rel('heroine_02')); picks=[pick]; await EVENTS.run(inv); const r1=SOCIAL.rel('heroine_02'); return {L:lines(),d:{aff:(r1.aff||0)-(r0.aff||0),fam:r1.fam-r0.fam}}; };
  { let r=await invite('幾點');
    check('單身：「明天我沒班，要去看《東京物語》重映，早場。」「……你要不要一起？不來也沒關係啦。」（AA_209）；「幾點？」aff+6；zhiruo_film_date、zhiruoFilmDay',r.L[0]===nm+'：明天我沒班，要去看《東京物語》重映，早場。'&&r.L[1]===nm+'：……你要不要一起？不來也沒關係啦。'&&r.d.aff===6&&G.flags.zhiruo_film_date===true&&G.flags.zhiruoFilmDay===FRI,JSON.stringify(r));
    r=await invite('幾點',true); check('交往中：「明天我沒班。我要去看《東京物語》的重映，早場。方奕廷也去。……你要來嗎？」（AA_209：店休→我沒班）；「幾點？」沒有 aff',r.L[0]===nm+'：明天我沒班。我要去看《東京物語》的重映，早場。方奕廷也去。……你要來嗎？'&&r.L.length>=2&&r.d.aff===0&&G.flags.zhiruo_film_date===true,JSON.stringify(r));
    r=await invite('起不來'); check('「早場我起不來。」：「好。那下次有午場再說。」；不扣分（aff 沒有減）；沒有 zhiruo_film_date',r.L[r.L.length-1]===nm+'：好。那下次有午場再說。'&&r.d.aff>=0&&!G.flags.zhiruo_film_date,JSON.stringify(r));
    r=await invite('看過了',true); check('劇透那一條（交往中）：算答應、沒有 aff',G.flags.zhiruo_film_date===true&&G.flags.zhiruoFilmDay===FRI&&r.d.aff===0,JSON.stringify(r.d));
    await invite('幾點'); run(20,20.2); const q=OUT.get(G,'zr_early_show'); check('答應：排出遊——隔天週六 09:40 戲院門口碰面、10:00 開演（AA_147 #3；ev_zhiruo_early_show）',!!q&&q.day===FRI+1&&Math.abs(q.h-(9+40/60))<0.01&&/10:00 開演/.test(q.title)&&q.ev==='ev_zhiruo_early_show',JSON.stringify(q)); }
  /* 早場 */
  let meet=[]; const MEET=['九點四十，巷子裡的二輪戲院。她已經到了。',nm+'：（把兩張票舉到臉旁邊）早。……票我先買了。',nm+'：早場的人比較少。我喜歡。'], MEET3=[nm+'：（看了一下手錶）方奕廷已經進去了。……他坐倒數第三排。我教的。'];
  const go=async(pick,dating)=>{ fresh(FRI+1,10,'dorm',dating?{dating_kexin:true}:{}); SOCIAL.meet('heroine_02','cafe'); picks=[pick]; await EVENTS.run(show); const L=lines(); const k=dating?1:3; meet=L.slice(0,k); return L.slice(k); };   /* 戲院門口碰面那一拍（BB-B c86cd8cf）另外檢查；其他照原本的位置比 */
  { let L=await go('妳挑'); check('戲院門口碰面（雙方單身，BB_96 3-5 BB-B c86cd8cf）：「九點四十，巷子裡的二輪戲院。她已經到了。」＋兩句；BCG-21 疊在這一拍',JSON.stringify(meet)===JSON.stringify(MEET)&&show.dialogue.some(l=>l.cg==='cg_two_tickets_heroine02'),JSON.stringify(meet));
    const base=[nm+'：我每次看都在想，那個媽媽到東京看小孩，大家都很忙。',nm+'：最後對她最好的，是一個不是她小孩的人。',nm+'：……我在想，我媽會不會也是這樣。',nm+'：我在台北，對每個客人都很好。',nm+'：（喝豆漿）好了，太沉重了。',nm+'：你覺得那個老闆，像不像笠智眾？'];
    check('早場台詞照原文',JSON.stringify(L.slice(0,6))===JSON.stringify(base),JSON.stringify(L.slice(0,6)));
    check('單身：祐廷「誰？」→「……沒事。下次帶你看別部。」；三個選項照原文；「下次妳挑。」→「好。我列一張表給你。很長。」；WATCHED_FILM；Z5_NEXT hers',/誰？$/.test(L[6])&&L[7]===nm+'：……沒事。下次帶你看別部。'&&JSON.stringify(opts[0])==='["「下次妳挑。」","「下次我挑。」","「我下次帶我室友來。」"]'&&L[8]===nm+'：好。我列一張表給你。很長。'&&SOCIAL.has('heroine_02','WATCHED_FILM')&&!SOCIAL.has('heroine_02','WATCHED_FILM_GROUP')&&G.flags.Z5_NEXT==='hers',JSON.stringify(L.slice(6)));
    L=await go('我挑'); check('「下次我挑。」→「你？你看過幾部電影？」（她笑。）「……好，你挑。我不笑你。大概。」',JSON.stringify(L.slice(8))===JSON.stringify([nm+'：你？你看過幾部電影？','她笑。',nm+'：……好，你挑。我不笑你。大概。']),JSON.stringify(L.slice(8)));
    L=await go('室友'); check('「我下次帶我室友來。」→「……好。」（不扣分，只是錯過）',JSON.stringify(L.slice(8))===JSON.stringify([nm+'：……好。']),JSON.stringify(L.slice(8)));
    L=await go('妳挑',true); check('交往中（三個人、不出 CG）：門口一句「（看了一下手錶）方奕廷已經進去了。…」',JSON.stringify(meet)===JSON.stringify(MEET3),JSON.stringify(meet)); check('交往中：三個人——問「笠智眾是誰？」的是方奕廷；記 WATCHED_FILM_GROUP（不是 WATCHED_FILM）',L[6]===CHARACTERS.npc_fangyt.name+'：笠智眾是誰？'&&SOCIAL.has('heroine_02','WATCHED_FILM_GROUP')&&!SOCIAL.has('heroine_02','WATCHED_FILM'),JSON.stringify(L.slice(6,8))); }
  /* 回聲 */
  { await go('妳挑'); const d0=G.day; G.day=d0+2; run(20,21.5); check('「下次妳挑」：兩天後 21:00 私訊一張很長的片單',txt('p:heroine_02').slice(-1)[0]==='heroine_02:📄（一張很長的片單）',JSON.stringify(txt('p:heroine_02').slice(-1)));
    await go('妳挑',true); G.day=G.day+2; run(20,21.5); check('交往中：傳到三個人的群組，方奕廷「這張表要看到明年」',JSON.stringify(txt('g:zr_film'))==='["heroine_02:📄（一張很長的片單）","npc_fangyt:這張表要看到明年"]',JSON.stringify(txt('g:zr_film')));
    await go('我挑'); const s0=G.day; G.day=s0+3; G.hour=15; G.zone='cafe'; G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; picks=[0,0,0,0]; await EVENTS.run(bar); let L=lines();
    check('「下次我挑」：兩週內在 Café 點餐，她問「你挑好了嗎？」（一次）',L.includes(nm+'：你挑好了嗎？')&&G.flags.Z5_MINE_ASKED===true,JSON.stringify(L.slice(-3)));
    said.length=0; G.day=s0+4; picks=[0,0,0,0]; await EVENTS.run(bar); check('之後點餐不再問',!lines().includes(nm+'：你挑好了嗎？'));
    await go('室友'); const r0=G.day; G.zone='cafe'; G.day=r0+5; check('「帶室友來」：兩週內走進 Café，阿凱「聽說這裡有電影。」芷若「……這裡是咖啡廳。」',EVENTS.check(kai)&&(G.day=r0+15,!EVENTS.check(kai)));
    G.day=r0+5; said.length=0; await EVENTS.run(kai); check('阿凱那兩句',JSON.stringify(lines())===JSON.stringify([CHARACTERS.kai?CHARACTERS.kai.name+'：聽說這裡有電影。':'阿凱：聽說這裡有電影。',nm+'：……這裡是咖啡廳。'])||lines().length===2,JSON.stringify(lines())); }
  /* Z6 */
  { const at=(w,wd,h,o)=>{ o=o||{}; fresh(termDay('Y1S2',w,wd),h,'campus',o.dating?{dating_kexin:true}:{}); if(o.film!==false) SOCIAL.remember('heroine_02',o.group?'WATCHED_FILM_GROUP':'WATCHED_FILM','早場'); return EVENTS.check(z6); };
    const r={ok:at(15,2,12.5),w16:at(13,1,12.2),w14:at(12,2,12.5),w17:at(16,2,12.5),sat:at(15,6,12.5),late:at(15,2,13.2),dating:at(15,2,12.5,{dating:true}),group:at(15,2,12.5,{group:true}),none:at(15,2,12.5,{film:false})};   /* Z6 改第 13～15 週（AA_243 #50：16 週制）；w16＝第 13 週（窗口第一週）、w14＝第 12 週、w17＝第 16 週 */
    check('Z6：第 13～15 週平日 12–13 在校園、兩個人看過早場、沒有在交往（第 12 週、第 16 週、週六、13:12、交往中、三個人的版本、沒看過都沒有）',r.ok&&r.w16&&!r.w14&&!r.w17&&!r.sat&&!r.late&&!r.dating&&!r.group&&!r.none,JSON.stringify(r));
    at(17,2,12.5); await EVENTS.run(z6); const F=CHARACTERS.npc_fangyt.name;
    check('Z6 台詞照 AA_209 2-1 第 4 列；FANG_HINT',JSON.stringify(lines())===JSON.stringify([F+'：你最近常去兩點半喔？',F+'：我跟芷若高中同校。她那時候就常一個人去看二輪。',F+'：好，我先去上課了。'])&&SOCIAL.has('npc_fangyt','FANG_HINT'),JSON.stringify(lines()));
    check('記憶的中文說明：WATCHED_FILM、WATCHED_FILM_GROUP、FANG_HINT',['WATCHED_FILM','WATCHED_FILM_GROUP','FANG_HINT'].every(k=>!!SOCIAL.MEMORY_LABEL[k])); }
  // 芷若的午場（BB_96 3-5b）、電影票根（3-5c）
  { const mat=ev('ev_zhiruo_matinee'); check('午場：事件在',!!mat);
    prep(FRI,20); picks=['起不來']; await EVENTS.run(inv); check('午場：拒絕早場記 zrDeclineDay（週五）',G.flags.zrDeclineDay===FRI);
    const MS=FRI+22; check('午場：三週後的週六（第 15 週）',CALENDAR.dateOf(MS).wd===6&&CALENDAR.termOf(MS).week===15);
    const base=JSON.stringify(G); const back=()=>{ G=JSON.parse(base); SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; };
    back(); G.day=MS; G.weekday=6; run(9.0,9.4); check('午場：09:30 以前沒有訊息',!TH('p:heroine_02').some(m=>m.text==='今天有午場。你上次說早場起不來。'));
    run(9.45,9.6); const T=TH('p:heroine_02').map(m=>m.text);
    check('午場：09:30 兩則「今天有午場。你上次說早場起不來。」「十一點四十。這個時間，你總起得來了吧。」、回覆到 11:25',T.includes('今天有午場。你上次說早場起不來。')&&T.includes('十一點四十。這個時間，你總起得來了吧。')&&TH('p:heroine_02').find(m=>m.ask).ask.until===MS*24+11.25,JSON.stringify(T));
    const s2=JSON.stringify(G);
    PHONE.answer(G,'zr_matinee',0); run(9.65,9.7); const q=OUT.get(G,'zr_matinee');
    check('午場：「起得來。」→「好。戲院門口見。午場也是會開演的。」＋11:40 出遊',TH('p:heroine_02').some(m=>m.text==='好。戲院門口見。午場也是會開演的。')&&!!q&&Math.abs(q.h-(11+40/60))<1e-6&&q.ev==='ev_zhiruo_matinee');
    const a0=SOCIAL.rel('heroine_02').aff|0; G.hour=11.7; said=[]; picks=['下午要做什麼']; await EVENTS.run(mat); const L=lines(), nm=CHARACTERS.heroine_02.name;
    check('午場：散場「散場的時候，外面還是白天。」→ 三句 →「那下午要做什麼？」→ 溫州街 →「今天這部，叫《晚春》。……」',L[0]==='散場的時候，外面還是白天。'&&L.includes(nm+'：……可是也有好處。看完，還有一整個下午。')&&L.includes(nm+'：我兩點要去溫州街。……還有半小時。你決定。')&&L.includes('你們沿著新生南路慢慢走到溫州街。她一路在講剛剛那個父親說的話，講到一半停下來。')&&L[L.length-1]===nm+'：今天這部，叫《晚春》。你不用記片名。記得是午場就好。',JSON.stringify(L));
    check('午場：單身＝WATCHED_FILM、aff +3；票根是《晚春》那張',SOCIAL.has('heroine_02','WATCHED_FILM')&&(SOCIAL.rel('heroine_02').aff|0)>=a0+3&&STORY.roomItemList(G).some(r=>r[0]==='電影票根'&&r[1][0]==='二輪戲院的票根。《晚春》，午場 11:40。'));
    G=JSON.parse(s2); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; PHONE.answer(G,'zr_matinee',1); run(9.65,12);
    check('午場：「今天不行。」→「好。……那我自己去。我本來就是自己去的。」、沒有出遊、不扣分',TH('p:heroine_02').some(m=>m.text==='好。……那我自己去。我本來就是自己去的。')&&!OUT.get(G,'zr_matinee'));
    back(); G.flags.dating_kexin=true; G.day=MS; G.weekday=6; run(9.45,9.6); check('午場：交往中多一句「方奕廷也去。」（回覆掛在這一句）',TH('p:heroine_02').some(m=>m.text==='方奕廷也去。'&&m.ask));
    PHONE.answer(G,'zr_matinee',1); picks=['早場起得來']; said=[]; G.hour=11.7; await EVENTS.run(mat); const L2=lines(), fy=CHARACTERS.npc_fangyt.name;
    check('午場：交往中＝方奕廷「午場出來太陽還在。我每次都覺得被騙。」→「……我也是。」（BB-B 改）；「下次我早場起得來。」＝ZR_EARLY_PROMISE；WATCHED_FILM_GROUP；票根三張',L2.includes(fy+'：午場出來太陽還在。我每次都覺得被騙。')&&L2.includes(nm+'：……我也是。')&&G.flags.ZR_EARLY_PROMISE===true&&SOCIAL.has('heroine_02','WATCHED_FILM_GROUP')&&STORY.roomItemList(G).some(r=>r[0]==='三張連號的票根'),JSON.stringify(L2));
    back(); G.day=FRI+29; run(9.4,10); check('午場：第 4 週以後不會補發',!TH('p:heroine_02').some(m=>m.text==='今天有午場。你上次說早場起不來。'));
    fresh(FRI+5,20,'dorm'); SOCIAL.remember('heroine_02','WATCHED_FILM','《東京物語》的早場'); check('票根：Z5 兩人版＝《東京物語》那張',STORY.roomItemList(G).some(r=>r[0]==='電影票根'&&r[1][0]==='二輪戲院的票根。《東京物語》，早場。'));
    fresh(FRI+5,20,'dorm'); check('票根：沒看過電影＝沒有',!STORY.roomItemList(G).some(r=>/票根/.test(r[0])&&r[0]!=='摩天輪的票根（夾在桌墊下）')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
