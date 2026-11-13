// BB_106、BB_105 法律系大一那幾件（AA-C 2026-10-18 審過＝可以實作；企劃線 BB_106@71b3e6c3、BB_105@68a8479e；白名單 LAWWW-C 10-21 已登記）——不需要瀏覽器。
//   BB_106：SK06 特別感謝：法律系的路人（V2-SK06）、SK07 唐睿的即興劇（V2-SK07）、日常 D1 女舍門口的長椅＋D2 社科院—霖澤館—博雅的偶遇表（V1-B106-D1D2）、4-2 經濟系群組的三則（V1-B106-42）
//   BB_105：女舍 D4 還筆記、D4b 以安準時下樓、D7 宿舍的人們、D9 法服的攤位（V1-B105-D2）
// 修改前（y1b 19b4fb36）：每一項都會失敗。用法：node tests/y1_bb_items_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES|FREE_TRIPS|TRIP|ENCOUNTERS|ENC|CROWD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js','src/crowd3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
let said=[], opts=[], picks=[], caps=[], memos=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,removeNPC(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(who,t){ caps.push([who,t]); },sleep:()=>Promise.resolve(),memo(m){ memos.push(m); },autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },removeNPC(){},hasNote:()=>true,
  spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:id,name:spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>(q.t||q.text)+(q.hint?'〔'+q.hint+'〕':''))); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), TD=(t,w,wd)=>STORY.termDay?STORY.termDay(t,w,wd):null;
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,MAIN_D1:D('2025-09-03'),LAW_START_DAY:D('2025-08-29'),introDone:true,classDone:true,afternoonDone:true,metAn:true,AN_NAME_TOLD:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); if(EVENTS.zoneChanged) EVENTS.zoneChanged(); INV.rec(G); if(typeof ROM!=='undefined'&&ROM.rec) ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; memos=[]; GM.npc={}; E.npcs=[]; E.interactables=[]; E.player.obj.position={x:0,y:0,z:0}; ADV.active=false; return G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); if(typeof OUT!=='undefined') OUT.expire(G); } };
const setDay=(d,h)=>{ G.day=d; G.weekday=wdOf(d); G.hour=h; };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const has=(L,t)=>L.some(x=>x===t||x.endsWith('：'+t));
const RUN=async e=>{ if(e) await EVENTS.run(e); };
const B2={ key:(G,id)=>STORY.b106d2Key?STORY.b106d2Key(G,id):'(沒有)', due:(G,id)=>STORY.b106d2Due?STORY.b106d2Due(G,id):false, done:(G,id,k)=>{ if(STORY.b106d2Done) STORY.b106d2Done(G,id,k); }, term:G=>STORY.b106d2Term?STORY.b106d2Term(G):null };   /* 修改前這些函式不存在：各項照樣 FAIL，不整支當掉 */
const near=(id,dx)=>{ const n={id,charId:id,name:id,obj:{position:{x:E.player.obj.position.x+(dx||1),y:0,z:E.player.obj.position.z}},lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
(async()=>{
  const okId=id=>!!ev(id);
  // ======================= BB_106 =======================
  /* SK06、SK07、4-2 群組三則、日常 D1（舊序章人物）（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  // ---- V1-B106-D1D2 日常 D2 ----
  { const d8=TD('Y1S1',8,1), d10=TD('Y1S1',10,1);
    /* D2 舊序章人物那幾項（CANON-NO-ECON-1112 第三批：這一項拿掉）；語彤那一場照測，日子用大二上第 10 週週一 */
    const dd=TD('Y2S1',10,1);
    const Y=ev('ev_b106d2_yutong'); const yt=async(flags,pick)=>{ fresh(dd,17.4,'campus',flags); SOCIAL.remember('heroine_03','FIRST_MET',''); picks=[pick]; await RUN(Y); return {L:lines().map(t=>t.replace(/^[^：]*語彤：/,'語彤：')),F:G.flags,O:opts.slice()}; };
    let y=await yt({},0);   /* （CANON-NO-ECON-1112 第四批：照 AA_886 換字）不分支（原本照 ECON_PAST_SHARED 三支、記 YT_KNOWS_ECON）*/
    check('D2：語彤：「你怎麼在我們這一區？」→「我來借書。」「法律系的來這裡借書？」「總圖人太多。」「這裡也不少。坐那邊，那排插座是好的。」，不記旗標（AA_886 第 2 節）',J(y.L)===J(['語彤：你怎麼在我們這一區？','祐廷：我來借書。','語彤：法律系的來這裡借書？','祐廷：總圖人太多。','語彤：……這裡也不少。坐那邊，那排插座是好的。'])&&y.F.YT_KNOWS_ECON===undefined&&!y.O.length,J(y.L));
    check('D2：語彤週一、五 17:20～17:50 在社科院門口（週三她在 118 巷）；說過一次就不再排',(()=>{ const e=CHARACTERS.heroine_03.daily_schedule.find(x=>x.b106d2); fresh(dd,17.4,'campus'); G.events.done.ev_b106d2_yutong=1; return !!e&&J(e.days)==='[1,5]'&&!B2.due(G,'heroine_03'); })()); }
  // ======================= BB_105 大一女舍門口（V1-B105-D2）=======================
  // ---- D4 一年後，再走到女舍門口（AA_289 5-4：沛珊還筆記）----
  { const D4=ev('ev_b105_d4_notes'), wk5=TD('Y1S1',5,3), sat=D('2025-10-04'), wk9=TD('Y1S1',9,3);
    check('D4：事件存在（大一上第 4～8 週、大一女舍門口、12:00～21:00、一次）',!!D4&&J(D4.weeks)==='[4,5,6,7,8]'&&J(D4.term)==='["Y1S1"]'&&!!D4.near&&D4.near.x===-93&&D4.once===true);
    const ck=(day,h,contact)=>{ fresh(day,h,'campus'); if(contact!==false) INV.addContact(G,'classmate_peishan'); return !!D4&&EVENTS.check(D4); };
    check('D4：有沛珊的聯絡方式、她在臺北＝第 5 週週三 15:00 走到門口就演；沒有聯絡方式、她回台中的週末（10/4）、第 9 週都不演',ck(wk5,15)&&!ck(wk5,15,false)&&!ck(sat,15)&&!ck(wk9,15)&&!ck(wk5,22));
    ck(wk5,15); await RUN(D4); const L=lines().map(t=>t.replace(/^[^：]*沛珊（手機）：/,'沛珊（手機）：').replace(/^[^：]*沛珊：/,'沛珊：'));
    check('D4：「我下樓了！你等我一下下」（私訊）→ 旁白「一年前，你常在這裡等人。」→「（下樓）對不起！你的筆記我找了一下……」「在我手上。我自己拿著還在找。」「謝謝你借我！第三章我抄完了。」',
      J(L)===J(['沛珊（手機）：我下樓了！你等我一下下','一年前，你常在這裡等人。','沛珊：（下樓）對不起！你的筆記我找了一下……','沛珊：在我手上。我自己拿著還在找。','沛珊：謝謝你借我！第三章我抄完了。'])&&txt('p:classmate_peishan').includes('classmate_peishan:我下樓了！你等我一下下'),J(lines()));
    check('D4：演過一次就不再演（旁白只出現這一次）',!!D4&&!!G.events.done[D4.id]&&!EVENTS.check(D4));
    { let busy=null, free=null; for(let w=4;w<=8&&!(busy&&free);w++) for(let wd=1;wd<=5&&!(busy&&free);wd++) for(let h=12;h<21&&!(busy&&free);h+=0.5){ const d=TD('Y1S1',w,wd); fresh(d,h,'campus'); const e=STORY.schedEnt(CHARACTERS.classmate_peishan,G); if(!busy&&e&&e.act==='class') busy=[d,h,e.zone]; if(!free&&!e) free=[d,h]; }
      check('D4：她照作息在上課的時候不演（下不了樓）；沒有別的事的時候演',!!busy&&!!free&&!ck(busy[0],busy[1])&&ck(free[0],free[1]),J({busy,free})); } }
  // ---- D4b 以安準時下樓 ----
  { const D4B=ev('ev_b105_d4b_on_time'), tue=TD('Y1S1',5,2);
    const ck=(day,h,grp)=>{ G.day=day; G.weekday=wdOf(day); G.hour=h; return !!D4B&&EVENTS.check(D4B); };
    fresh(tue,19.05,'campus'); PHONE.join(G,'noodle_team','桌遊團');
    check('D4b：桌遊團在女舍門口集合（大一上週二麵店日）19:00～19:15＝以安下來；週三不是',ck(tue,19.05)&&!ck(tue+1,19.05)&&!ck(tue,18.9));
    G.day=tue; G.weekday=2; G.hour=19.05; said=[]; await RUN(D4B);
    check('D4b：以安「七點。你們遲到兩分鐘。」',J(lines().map(t=>t.replace(/^[^：]*：/,'')))===J(['七點。你們遲到兩分鐘。']),J(lines()));
    check('D4b：可以重複，隔兩週（下週二不會、兩週後的週二會）',!ck(tue+7,19.05)&&ck(tue+14,19.05)); }
  // ---- D7 宿舍的人們 ----
  { const C=typeof CROWD!=='undefined'?CROWD:null, sp=C&&C.SPOTS.find(s=>s.id==='fdorm');
    const L=(day,key)=>{ fresh(day,8,'campus'); return sp&&sp.lines?sp.lines(G,{key}):null; };
    const w1=TD('Y1S1',1,2), w5=TD('Y1S1',5,2), w8=TD('Y1S1',8,2);
    check('D7：開學第一週白天＝「（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……沒有電梯啦，我爬上來的。五樓。」」',J(L(w1,'am'))===J(['（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……沒有電梯啦，我爬上來的。五樓。」']),J(L(w1,'am')));
    check('D7：傍晚「她說五分鐘。……我數到第三個五分鐘了。」；晚上兩句（宵夜、講電話）；考試週「總圖還有位子嗎？……那我去社科圖。」；第 5 週早上沒有',J(L(w5,'eve'))===J(['「她說五分鐘。……我數到第三個五分鐘了。」'])&&J(L(w5,'night'))===J(['（提著兩袋宵夜的人）「鹹酥雞到了，誰下來拿？」','（在門口講電話）「沒有啦，我只是想打給你。」'])&&J(L(w8,'eve'))===J(['（抱著一疊書的人）「總圖還有位子嗎？……那我去社科圖。」'])&&J(L(w5,'am'))==='[]',J([L(w5,'eve'),L(w5,'night'),L(w8,'eve'),L(w5,'am')]));
    fresh(w5,20.5,'campus'); const ns=[0,1,2].map(i=>({obj:{position:{x:i,y:0,z:0}}})); const got=C&&C.giveLines?C.giveLines(GM,sp,{key:'night'},ns):[];
    check('D7：一群人裡一句給一個人（晚上兩句＝兩個人可以點「聽一句」，第三個不行）',got.length===2&&ns[0].talkLabel==='聽一句'&&typeof ns[0].talk==='function'&&!ns[2].talk);
    said=[]; if(ns[1].talk) await ns[1].talk();
    check('D7：點了＝那一句（旁白）',J(said)===J([{who:null,t:'（在門口講電話）「沒有啦，我只是想打給你。」'}]),J(said)); }
  // ---- D9 法服的攤位 ----
  { const C=typeof CROWD!=='undefined'?CROWD:null, sp=C&&C.SPOTS.find(s=>s.id==='fdorm_fafu');
    const sl=(day,h,stage)=>{ fresh(day,h,'campus'); if(stage) G.stage=stage; return sp?C.slotAt(G,sp,h):null; };
    const y2w1=TD('Y2S1',1,2), y2w3=TD('Y2S1',3,2), y1w1=TD('Y1S1',1,2), y3w2=TD('Y3S1',2,4), sat=y2w1+4;
    check('D9：大二以後上學期第 1～2 週平日 12:00～17:00 法服在女舍外的路邊擺攤；大一、第 3 週、週末、晚上都沒有',!!sl(y2w1,13)&&!!sl(y3w2,16.5)&&!sl(y1w1,13)&&!sl(y2w3,13)&&!sl(sat,13)&&!sl(y2w1,18),'');
    const s1=sl(y2w1,13); const g=s1?(()=>{ const ox=STORY.CROWD_X; STORY.CROWD_X=2; const r=C.group(G,sp,s1); STORY.CROWD_X=ox; return r; })():[];
    check('D9：攤位兩位社員（路人加倍也不加）',g.length===2,String(g.length));
    const ns=[0,1].map(i=>({obj:{position:{x:i,y:0,z:0}}})); const got=sp&&C.giveLines?C.giveLines(GM,sp,s1,ns):[];
    check('D9：兩位都可以點「看法服的攤位」',got.length===2&&ns[0].talkLabel==='看法服的攤位'&&ns[1].talkLabel==='看法服的攤位');
    said=[]; if(ns[0].talk) await ns[0].talk();
    check('D9：點了＝旁白「（攤位上一疊傳單，法服的社員在喊：「法律服務社！免費法律諮詢的那個！」）」＋社員「新生可以來旁聽喔。……你是學長？那你也可以來。」',J(said)===J([{who:null,t:'（攤位上一疊傳單，法服的社員在喊：「法律服務社！免費法律諮詢的那個！」）'},{who:'法服的社員',t:'新生可以來旁聽喔。……你是學長？那你也可以來。'}]),J(said)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
