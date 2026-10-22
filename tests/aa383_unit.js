// AA_383 第 2、4 節（企劃線 98516b51；任務 AA383-BB0400-1022）——不需要瀏覽器。
//   0 逐字對稿：從 git 讀 98516b51 的稿，第 4-1 節三句旁白、第 4-2 節三則私訊在遊戲裡一字不差
//   2 以安第 8 週（10/25～26）照樣回台中，但期中考週：手機的約關著（「回台中，不在臺北。」，T7a 不適用）、D26 那天約不成；第 4、12 週照 T7a；D26 臺中偶遇只剩 9/27、11/22
//   4-1 韋綸的球賽：兩句旁白；和可昕交往中、她說了要來（選「走。」那時候交往中）＝最後多一句
//   4-2 沛珊還筆記：大一上第 4 週週一 12:00 私訊兩句（有聯絡方式才傳）；第 8 週結束還沒演＝第 9 週週一 12:00「筆記我上課的時候放你桌上了！謝謝你借我！」；演過＝不傳
// 修改前（開發分支 99ba2b20）：第 2 節 10/25 那幾項、4-1、4-2 FAIL。用法：node tests/aa383_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES|FREE_TRIPS|TRIP|ENCOUNTERS|ENC|CROWD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js','src/crowd3d.js'];
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,MAIN_D1:D('2025-09-03'),LAW_START_DAY:D('2025-08-29'),introDone:true,classDone:true,afternoonDone:true,metAn:true,AN_NAME_TOLD:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
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
const cp=require('child_process'), SPEC_SHA='98516b51';
(async()=>{
  // ---- 0. 逐字對稿 ----
  let spec=''; try{ spec=cp.execSync('git -c core.quotepath=false show '+SPEC_SHA+':"docs/story_planning/AA_383_回BB_0400_五題_台詞與企劃對不上.md"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  const GAME3=['（球場的看台。韋綸一邊看球，一邊在手機上記數字。）','（他們的隊每得一分，他就站起來喊「走啦！」，坐下來，再記一個數字。）','（可昕坐在你旁邊。她看的不是球，是韋綸的手機。）'];
  const DM=['你借我的筆記，我抄完了！','你哪天經過女舍門口跟我說，我拿下去給你！'], DESK='筆記我上課的時候放你桌上了！謝謝你借我！';
  const gameEv=ev('ev_b106_42_game'), st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  check('0. 讀得到稿（AA_383@'+SPEC_SHA+'）',/韋綸的球賽/.test(spec)&&/沛珊還筆記/.test(spec));
  check('0. 第 4-1 節三句旁白＝稿、＝遊戲（ev_b106_42_game）',GAME3.every(t=>spec.includes('「'+t+'」'))&&!!gameEv&&J((gameEv.dialogue||[]).map(l=>l.text))===J(GAME3),J(gameEv&&gameEv.dialogue));
  check('0. 第 4-2 節三則私訊＝稿、＝遊戲',DM.concat([DESK]).every(t=>spec.includes('「'+t+'」')&&st.includes("'"+t+"'")));
  // ---- 2. 以安第 8 週 ----
  const S6={fam:60,trust:45,comf:40,npcRom:55,rom:30};
  const know=(id,rel)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); G.contacts=G.contacts||{}; G.contacts[id]=1; if(INV.addContact) INV.addContact(G,id); };
  const P=(id,day)=>STORY.presence(id,{day,flags:{},stage:'law'});
  const w4=D('2025-09-27'), w8=D('2025-10-25'), w12=D('2025-11-22');
  check('2. 前提：10/25（六）是大一上第 8 週（期中考週）、以安照樣 presence trip「回台中」',CALENDAR.termOf(w8).week===8&&CALENDAR.termOf(w8).exam==='mid'&&P('heroine_01',w8).kind==='trip'&&P('heroine_01',w8).away==='回台中',J([CALENDAR.termOf(w8),P('heroine_01',w8)]));
  for(const [lab,day,open] of [['第 4 週 9/27',w4,true],['第 8 週 10/25（期中考週）',w8,false],['第 8 週 10/26（日）',w8+1,false],['第 12 週 11/22',w12,true]]){ fresh(day,10,'campus',{dating_heroine_01:true}); know('heroine_01',S6);
    const why=INV.whyNot(G,'heroine_01'), only=DATE.homeOnly(G,'heroine_01');
    check('2. '+lab+'：'+(open?'手機的約打開、只列 D26（T7a）':'手機的約關著「回台中，不在臺北。」（考試週，T7a 不適用）'),open?(why===''&&J(only)===J(['D26'])):(why==='回台中，不在臺北。'&&only==null),J([why,only])); }
  { fresh(w8-1,20,'campus',{dating_heroine_01:true}); know('heroine_01',S6); const c=DATE.check(G,{who:'heroine_01',locs:['D26'],day:w8,depart:9});
    check('2. 10/24 在臺北約 10/25 的 D26：約不成（考試週）',!c.ok&&/考試週/.test(c.why||''),J(c&&{ok:c.ok,why:c.why})); }
  { const e=(ENCOUNTERS.rows||[]).find(x=>x&&x.who==='heroine_01'&&x.spot==='D26');
    const ds=e?e.dates.filter(r=>r[0].startsWith('2025-')).map(r=>r[0]):null;
    check('2. D26 臺中偶遇（以安）大一上只剩 9/27、11/22（10/25 拿掉）',J(ds)===J(['2025-09-27','2025-11-22']),J(ds)); }
  { fresh(w8,15,'campus'); const e=STORY.schedEnt(CHARACTERS.heroine_01,G);
    check('2. 10/25 15:00 以安的作息照樣「在台中」（沒有偶遇，也不會掉回臺北的 Café）',!!e&&e.zone==null&&e.away==='在台中'&&!e.enc,J(e)); }
  // ---- 4-1. 韋綸的球賽 ----
  { const d3=TD('Y4S2',6,3), sat=d3+3;
    for(const [lab,kx,stay,want] of [['和可昕交往中、她說了要來',true,true,GAME3],['沒有交往',false,false,GAME3.slice(0,2)],['說了要來、後來分手了',true,false,GAME3.slice(0,2)]]){
      fresh(d3,20.5,'campus',kx?{dating_kexin:true}:{}); run(20.5,21.2); PHONE.answer(G,'b106_42_ticket',0); run(21.3,21.4); const q=OUT.get(G,'b106_wl_game');
      if(kx&&!stay) G.flags.dating_kexin=false;
      said=[]; setDay(sat,18.0); if(q) await OUT.go(GM,q); const L=lines().filter(t=>/^（/.test(t));
      check('4-1. '+lab+'：出發以後'+want.length+' 句旁白'+(want.length===3?'（最後「可昕坐在你旁邊……」）':'（沒有可昕那一句）')+'；WL_GAME_KX '+(kx?'記了':'沒有'),!!q&&J(L)===J(want)&&!!G.flags.WL_GAME_KX===kx,J([L,G.flags.WL_GAME_KX])); } }
  // ---- 4-2. 沛珊還筆記 ----
  { const d4=TD('Y1S1',4,1), d9=TD('Y1S1',9,1), D4=ev('ev_b105_d4_notes');
    check('4-2. 前提：大一上第 4 週週一＝9/22、第 9 週週一＝10/27',CALENDAR.dateOf(d4).key==='2025-09-22'&&CALENDAR.dateOf(d9).key==='2025-10-27',J([CALENDAR.dateOf(d4).key,CALENDAR.dateOf(d9).key]));
    fresh(d4,11.5,'campus'); INV.addContact(G,'classmate_peishan'); run(11.5,11.9); const before=txt('p:classmate_peishan').length; run(12.0,12.2);
    check('4-2. 9/22 12:00（有聯絡方式）：她私訊兩句「'+DM.join('」「')+'」；12:00 以前沒有',before===0&&J(txt('p:classmate_peishan').slice(-2))===J(DM.map(t=>'classmate_peishan:'+t)),J(txt('p:classmate_peishan')));
    fresh(d4,12.0,'campus'); run(12.0,12.2); check('4-2. 沒有她的聯絡方式＝不傳',!txt('p:classmate_peishan').length,J(txt('p:classmate_peishan')));
    // 一直沒走到女舍門口：第 9 週週一 12:00
    fresh(d4,11.9,'campus'); INV.addContact(G,'classmate_peishan'); run(11.9,12.2); setDay(d9,11.5); run(11.5,11.9); const b9=txt('p:classmate_peishan').slice(); run(12.0,12.2);
    check('4-2. 第 8 週結束還沒演：10/27 12:00「'+DESK+'」（12:00 以前沒有）；D4 第 9 週不演',!b9.some(t=>t.endsWith(DESK))&&txt('p:classmate_peishan').slice(-1)[0]==='classmate_peishan:'+DESK&&!!D4&&!EVENTS.check(D4),J(txt('p:classmate_peishan').slice(-2)));
    // 演過＝不傳
    fresh(d4,11.9,'campus'); INV.addContact(G,'classmate_peishan'); run(11.9,12.2); G.events.done.ev_b105_d4_notes=1; setDay(d9,11.9); run(11.9,12.3);
    check('4-2. 演過 D4＝10/27 不傳',!txt('p:classmate_peishan').some(t=>t.endsWith(DESK)),J(txt('p:classmate_peishan').slice(-2)));
    // 9/22 沒收到（那時還沒有聯絡方式）＝10/27 也不傳
    fresh(d4,12.0,'campus'); run(12.0,12.2); INV.addContact(G,'classmate_peishan'); setDay(d9,11.9); run(11.9,12.3);
    check('4-2. 9/22 那兩句沒收到（那時還沒有聯絡方式）＝10/27 也不傳',!txt('p:classmate_peishan').some(t=>t.endsWith(DESK)),J(txt('p:classmate_peishan'))); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
