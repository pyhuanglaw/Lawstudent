// 1A-02 交換路線依交往狀態分流（AA_315；BB_204 第 1、5 節、AA_253 第 2 節；使用者 2026-10-17 經 BB-C）——不需要瀏覽器。
//   志願表截止 2027-11-18（四）12:00 那一刻照「交往中」定：學姊＝US、以安＝JP、都沒有（只和可昕交往也算）＝TW；之後任何事都不改；
//   宿舍的舊選單選過、還沒截止的清掉重來；截止以後已經有路線的照原本的；2028-02-20 以後補的一律 TW；經濟系那一年不定。
//   對 AA_315 的驗收情境 E1、E2、E3、E6、E7、E8。修改前 1～6 FAIL。
//   BB-C 10-20 回報的兩個 bug（7～10，修改前 FAIL）：(a) 截止那一刻坐著上課、在劇情裡（S.tick 不跑），空下來以前開始交往＝定錯；(b) 舊選單的 US 讀檔後坐著沒清。
//   改成 STORY.routeWatch：主迴圈每一格、GM.advance、讀檔 migrate、ROM.start／ROM.end 之前都跑；routeFor 不算截止以後才開始的那一段（ROM 的 sinceDay＋sinceH）。用法：node tests/route_decide_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
(async()=>{
  const dl=D('2027-11-18'), date=(id)=>{ G.flags['dating_'+id]=true; ROM.rec(G); };
  const at=(day,h,flags)=>{ fresh(day,h,'campus',flags||{}); G.stage='law'; if(typeof ROM!=='undefined') ROM.rec(G); return G; };
  check('0. 有 STORY.routeDecide、routeFor、routeMigrate', typeof STORY.routeDecide==='function'&&typeof STORY.routeFor==='function'&&typeof STORY.routeMigrate==='function');
  at(dl,11.9); date('heroine_05'); const r0=STORY.routeDecide(G); G.hour=12; const r1=STORY.routeDecide(G);
  check('1. E1 和學姊交往：11/18 11:54 還不定；12:00 定成 US（EXCH_APPLIED_DAY＝那天）', r0===null&&r1==='US'&&G.flags.EXCHANGE_ROUTE==='US'&&G.flags.EXCH_APPLIED_DAY===dl, JSON.stringify([r0,r1]));
  at(dl,12.5); date('heroine_01'); check('1. E2 和以安交往：JP', STORY.routeDecide(G)==='JP');
  at(dl,12.5); date('kexin'); check('1. E3 只和可昕交往：TW', STORY.routeDecide(G)==='TW');
  at(dl,12.5); date('kexin'); date('heroine_01'); check('1. 和可昕、以安同時交往：照以安（可昕不決定路線）＝JP', STORY.routeDecide(G)==='JP');
  at(dl,12.5); check('1. 沒有交往：TW（不要英國）', STORY.routeDecide(G)==='TW');
  at(dl,12.5); date('heroine_01'); STORY.routeDecide(G); ROM.end(G,'heroine_01','apart_talk'); G.day=D('2027-11-20'); STORY.routeDecide(G); G.day=D('2028-03-01'); STORY.routeDecide(G);
  check('2. E6 和以安交往、11/20 分手：路線還是 JP（定了以後不改）', G.flags.EXCHANGE_ROUTE==='JP'&&STORY.route(G)==='JP');
  at(D('2027-12-20'),15,{EXCHANGE_ROUTE:'TW',EXCH_APPLIED_DAY:dl,EXCH_RULE:1}); date('heroine_01'); STORY.routeMigrate(G); STORY.routeDecide(G);
  check('3. E7 大三上學期末才和以安在一起：路線照截止時的 TW', G.flags.EXCHANGE_ROUTE==='TW');
  at(D('2027-11-01'),15,{EXCHANGE_ROUTE:'US',EXCH_APPLIED_DAY:D('2027-10-20')}); const mg=STORY.routeMigrate(G);
  const cleared=!G.flags.EXCHANGE_ROUTE&&G.flags.EXCH_APPLIED_DAY==null; G.day=dl; G.hour=12; STORY.routeDecide(G);
  check('4. E8 舊存檔 11/1、舊選單選過「美國」、沒和學姊交往：讀檔清掉，11/18 中午定成 TW', mg&&cleared&&G.flags.EXCHANGE_ROUTE==='TW', JSON.stringify({mg,cleared,r:G.flags.EXCHANGE_ROUTE}));
  at(D('2027-12-01'),15,{EXCHANGE_ROUTE:'JP',EXCH_APPLIED_DAY:D('2027-10-20')}); STORY.routeMigrate(G);
  check('4. 截止以後已經有路線（舊選單）的照原本的，不改', G.flags.EXCHANGE_ROUTE==='JP');
  at(D('2027-12-01'),15); date('heroine_05'); check('5. 截止以後、還沒有路線的舊存檔：照同一個規則補（和學姊交往＝US）', STORY.routeBackfill(G)===true&&G.flags.EXCHANGE_ROUTE==='US');
  at(D('2028-02-20'),15); date('heroine_05'); STORY.routeDecide(G); check('5. 2028-02-20（日本路線退宿日）以後才補：一律 TW（來不及準備）', G.flags.EXCHANGE_ROUTE==='TW');
  at(dl,12.5); G.stage='econ'; check('5. 經濟系那一年：不定路線', STORY.routeDecide(G)===null&&!G.flags.EXCHANGE_ROUTE);
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), x=fs.readFileSync(path.join(ROOT,'src/exchange3d.js'),'utf8');
    const tk=s.indexOf('S.tick=function(GM,dt)');
    check('6. S.tick：每一格先 routeWatch（routeMigrate＋沒有路線就 routeDecide）', tk>0&&/S\.routeWatch\(G\);/.test(s.slice(tk,tk+4000))&&/S\.routeWatch=function\(G\)\{[^\n]*S\.routeMigrate\(G\);[^\n]*S\.routeDecide\(G\)/.test(s));
    check("6. 宿舍沒有「交換申請（志願表）」：exchange3d.js 沒有 APPLY_OPTS、不推 exchApply、applyOpen 永遠是 false", !/APPLY_OPTS/.test(x)&&!/exchApply:true/.test(x)&&/S\.applyOpen=\(\)=>false;/.test(x)); }
  /* ===== BB-C 10-20 回報的兩個 bug（修改前 7～10 FAIL）：
     (a) 路線照「12:00 以後第一次 S.tick」定——上課坐著（E.player.busy）、劇情裡、睡覺時 S.tick 第一行就 return，空下來以前交往狀態變了就定錯；
     (b) 舊存檔（舊宿舍選單選過 US、沒有 EXCH_RULE）讀檔後玩家坐著或在劇情裡，routeMigrate 沒跑、舊的 US 沒清（過了截止就永遠留著）。
     改成：STORY.routeWatch 在主迴圈每一格（不管忙不忙）、GM.advance、讀檔（migrate）、ROM.start／ROM.end 改狀態之前都跑 ===== */
  const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), grab=re=>{ const m=g3.match(re); return m?m[0]:null; };
  const frameTick=()=>{ if(STORY.routeWatch) STORY.routeWatch(G); };   // game3d.js frame()：每一格都叫（不管 busy／D.active）
  const runIn=(src,name,ctx)=>{ if(!src) return null; vm.createContext(ctx); vm.runInContext(src+'\nthis.'+name+'='+name+';',ctx); return ctx[name]; };
  const busySeat=b=>{ E.player.busy=b; };   // 上課坐著＝E.player.busy（S.tick 第一行 return）
  // 7. (a) BB 的重現步驟：11/17 沒交往 → 11/18 11:54 上課坐到 13:13 → 13:15 開始和以安交往 → 下一次 tick
  { at(D('2027-11-17'),20); busySeat(false); STORY.tick(GM,0.6); const r17=G.flags.EXCHANGE_ROUTE||null;
    G.day=dl; G.weekday=wdOf(dl); G.hour=11.9; busySeat(true); STORY.tick(GM,0.6); frameTick();   // 11:54 坐下：S.tick 不跑、還沒到截止
    const r1154=G.flags.EXCHANGE_ROUTE||null; G.hour=13+13/60; frameTick();   // 上課的跳時間（坐著）：13:13，主迴圈那一格
    const r1313=G.flags.EXCHANGE_ROUTE||null; busySeat(false); G.hour=13.25; ROM.start(G,'heroine_01'); STORY.tick(GM,0.6);
    check('7. (a) 11/17 沒交往 → 11/18 11:54 上課坐到 13:13（坐著：S.tick 不跑）→ 13:15 和以安開始交往 → 下一次 tick：TW（截止那一刻沒有交往；修改前 JP）',
      r17===null&&r1154===null&&r1313==='TW'&&G.flags.EXCHANGE_ROUTE==='TW'&&G.flags.EXCH_APPLIED_DAY===dl&&G.flags.dating_heroine_01===true, JSON.stringify({r17,r1154,r1313,r:G.flags.EXCHANGE_ROUTE})); busySeat(false); }
  { at(dl,11.9); busySeat(true); STORY.tick(GM,0.6); G.hour=13.25; ROM.start(G,'heroine_01'); busySeat(false); STORY.tick(GM,0.6);   // 中間一格都沒有（同一段劇情裡跳時間、接著告白）
    check('7. (a) 最壞的情況：坐著跨過截止、中間一格都沒有就開始交往——ROM.start 改狀態之前先照改之前的定：TW（修改前 JP）', G.flags.EXCHANGE_ROUTE==='TW'&&G.flags.dating_heroine_01===true, G.flags.EXCHANGE_ROUTE); busySeat(false); }
  { at(dl,11.9); date('heroine_05'); busySeat(true); G.hour=13.25; ROM.end(G,'heroine_05','apart_talk'); busySeat(false); STORY.tick(GM,0.6);
    check('7. (a) 反過來：截止那一刻和學姊交往中、坐著跨過 12:00 以後才分手：US（ROM.end 改狀態之前先定；修改前 TW）', G.flags.EXCHANGE_ROUTE==='US', G.flags.EXCHANGE_ROUTE); busySeat(false); }
  { const adv=runIn(grab(/function advance\(hours\)\{[\s\S]*?actTrack\(h0\); \}/),'advance',{get G(){ return G; },E:{hour:0,applyTime(){}},STORY,actTrack(){},updateHUD(){},A3:{setScene(){}}});
    at(dl,11.9); busySeat(true); let r=null; if(adv){ adv(13+13/60-11.9); r=G.flags.EXCHANGE_ROUTE||null; }   // game3d.js 的 GM.advance（上課的跳時間 classes3d.js 用它）
    check('7. (a) game3d.js 的 GM.advance 跨過截止就定（坐著上課 11:54 → 13:13，還沒有下一格）：TW', !!adv&&r==='TW'&&G.flags.EXCH_APPLIED_DAY===dl, String(r)); busySeat(false); }
  // 8. (b) 舊存檔 11/1：舊宿舍選單選了「美國」（EXCHANGE_ROUTE US、EXCH_APPLIED_DAY、沒有 EXCH_RULE）
  const mig=runIn(grab(/function migrate\(s\)\{[\s\S]*?\n    s\.v=SAVE_VER; return s; \}/),'migrate',{CALENDAR,STORY,ROM,console:{warn(){}},SAVE_VER:99,defaults:()=>({rel:{}}),DATE:undefined});
  for(const [who,want] of [['heroine_01','JP'],[null,'TW'],['heroine_05','US']]){
    at(D('2027-11-01'),15,{EXCHANGE_ROUTE:'US',EXCH_APPLIED_DAY:D('2027-10-20')}); if(who) date(who); let cleared=false;
    if(mig){ mig(G); cleared=!G.flags.EXCHANGE_ROUTE&&G.flags.EXCH_APPLIED_DAY==null; }   // 讀檔（applySave → migrate）
    busySeat(true); STORY.tick(GM,0.6);   // 讀進來就坐著：S.tick 不跑
    G.day=D('2027-11-17'); G.hour=20; frameTick(); const r17=G.flags.EXCHANGE_ROUTE||null; G.day=dl; G.hour=12; frameTick(); busySeat(false);
    check('8. (b) 舊存檔 11/1（舊選單選了美國）'+(who?'、和'+(who==='heroine_01'?'以安':'學姊')+'交往中':'、沒有交往')+'：讀檔（migrate）就清掉，玩家一直坐著；11/17 還沒有路線；11/18 12:00 照那一刻定＝'+want,
      !!mig&&cleared&&r17===null&&G.flags.EXCHANGE_ROUTE===want&&G.flags.EXCH_RULE===1, JSON.stringify({cleared,r17,r:G.flags.EXCHANGE_ROUTE})); }
  { at(D('2027-12-01'),15,{EXCHANGE_ROUTE:'US',EXCH_APPLIED_DAY:D('2027-10-20')}); if(mig) mig(G); check('8. (b) 截止以後讀檔：舊選單的路線照原本的（不清）', !!mig&&G.flags.EXCHANGE_ROUTE==='US'); }
  // 9. 補舊存檔也照截止那一刻：ROM 記得是截止以後才開始的那一段不算（sinceDay＋sinceH；舊紀錄只有 sinceDay＝那一天以後才算）
  { const back=(sinceDay,sinceH)=>{ at(D('2027-12-01'),15); G.flags.dating_heroine_05=true; ROM.rec(G); const r=ROM.get(G,'heroine_05'); r.status='dating'; r.sinceDay=sinceDay; if(sinceH!=null) r.sinceH=sinceH; else delete r.sinceH; return STORY.routeDecide(G); };
    const a=back(D('2027-11-25'),15), b=back(dl,13.25), c=back(dl,11.5), d=back(D('2027-11-25'),null), e=back(dl,null), f=back(D('2027-10-01'),20);
    check('9. 補舊存檔：11/25 才和學姊交往＝TW、11/18 13:15＝TW、11/18 11:30＝US；舊紀錄沒有 sinceH：11/25＝TW、11/18（不知道幾點）＝US；10/1＝US', a==='TW'&&b==='TW'&&c==='US'&&d==='TW'&&e==='US'&&f==='US', JSON.stringify([a,b,c,d,e,f])); }
  // 10. ROM.start 記 sinceH、ROM.BEFORE、routeDue 用絕對時間、game3d.js 的接線
  { at(dl,11.5); ROM.start(G,'heroine_05'); const rs=ROM.get(G,'heroine_05'); G.hour=12; frameTick();
    check('10. ROM.start 記開始的時刻（sinceDay＋sinceH）；ROM.BEFORE 有 STORY.routeWatch；11:30 開始和學姊交往、12:00＝US', rs.sinceDay===dl&&rs.sinceH===11.5&&Array.isArray(ROM.BEFORE)&&ROM.BEFORE.includes(STORY.routeWatch)&&G.flags.EXCHANGE_ROUTE==='US', JSON.stringify({sd:rs.sinceDay,sh:rs.sinceH,r:G.flags.EXCHANGE_ROUTE})); }
  { at(dl-1,25); const a=STORY.routeDue(G); G.day=dl; const b=STORY.routeDue(G);
    check('10. routeDue 用絕對時間：11/17 的 G.hour 25（11/18 凌晨 1 點）還沒到；11/18 的 G.hour 25（11/19 凌晨）算過了', !a&&b, JSON.stringify([a,b])); }
  check('10. game3d.js：主迴圈每一格（在「自由行動才走時間」那一段外面）、GM.advance、讀檔 migrate（ROM.rec 之後）都叫 STORY.routeWatch',
    /if\(!E\.player\.busy&&!D\.active\)\{ G\.hour\+=dt\*GM\.hourRate;[^\n]*\n\s*if\(!GM\.titleIdle&&STORY\.routeWatch\) STORY\.routeWatch\(G\);/.test(g3)&&/function advance\(hours\)\{[^\n]*STORY\.routeWatch\(G\)/.test(g3)&&/ROM\.rec\(s\)[\s\S]*?STORY\.routeWatch\(s\)[\s\S]*?\n    s\.v=SAVE_VER; return s; \}/.test(g3));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
