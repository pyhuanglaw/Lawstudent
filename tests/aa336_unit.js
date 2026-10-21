// AA_336（AA-C 2026-10-20 回 LAWWW 實作問題 17 題，企劃線 724d7703）裡要接真的手機訊息、作息的兩題——不需要瀏覽器：
//   C9  「知道以安的生日」再加一種：2026 年傳過她生日快樂（MSG 的 bday 紀錄 heroine_01:2026，src/msg3d.js 傳 bday 時記）；三種（AN5_BIRTHDAY、交往中、2026 傳過）有一種就算
//       → 大三中秋（1C-02）那一句「（九月十五日。中秋，也是以安的生日。）」在開頭
//   C12 明軒 2028-05-02 起每週二 18:00～19:00 在麵店吃（19:30 家教前），到 2029-08-28（AA_345 G4 更正年份：原本寫 2028-08-29）；不在臺北的日子（8/10～8/17 回彰化）照 presence
// 其他題目的測試在各自的檔：吃東西 tests/eat_unit.js、1B tests/y2b_events_unit.js、1C tests/group_events_unit.js。
// 修改前：C9 的 2026 傳過那一項、C12 的作息都 FAIL。用法：node tests/aa336_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|GROUP|GROUP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/group_events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/group3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return false; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const LV={FAM:[25,10,10],FRI:[45,30,10]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const team=()=>{ PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','heroine_01','heroine_03','classmate_bohan','classmate_xinci']) R(id,'FAM'); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
(async()=>{
  check('0. 有 GROUP（src/group3d.js）、MSG（src/msg3d.js）', typeof GROUP!=='undefined'&&typeof MSG!=='undefined'&&!!MSG.send&&!!MSG.rec);
  // ---------- C9 知道以安的生日 ----------
  const BDAY='（九月十五日。中秋，也是以安的生日。）';
  fresh('2027-09-15',18,'gongguan'); team();
  check('C9. 三種都沒有：不算知道', !GROUP.knowsAnBday(G));
  // 2026-09-15 用手機傳她生日快樂（真的 MSG.send，記在 G.msgChat.bday）
  fresh('2026-09-15',20,'dorm'); team(); R('heroine_01','FRI'); G.contacts.heroine_01=1;
  const tp=MSG.topics(G,'heroine_01').map(q=>q.k), r=tp.includes('bday')?MSG.send(G,'heroine_01','bday'):null;
  check('C9 前置：2026-09-15 可以傳以安「生日快樂」，傳出去以後記在 MSG 的 bday（heroine_01:2026）', !!r&&r.ok&&MSG.rec(G).bday['heroine_01:2026']===D('2026-09-15'), JSON.stringify([tp,r,G.msgChat&&G.msgChat.bday]));
  at('2027-09-15',18); G.zone='gongguan';
  check('C9. 2026 年傳過她生日快樂（沒有 AN5_BIRTHDAY、沒交往）：算知道', GROUP.knowsAnBday(G)&&!SOCIAL.has('heroine_01','AN5_BIRTHDAY')&&!G.flags.dating_heroine_01);
  said=[]; picks=[0]; await EVENTS.run(ev('ev_midautumn_y3'));
  check('C9. 大三中秋：「（九月十五日。中秋，也是以安的生日。）」在開頭（不是在語彤拿出柚子之後）', said[0]&&said[0].t===BDAY, JSON.stringify(lines().slice(0,2)));
  fresh('2027-09-15',18,'gongguan'); team(); MSG.rec(G).bday['heroine_01:2025']=D('2025-09-15');
  check('C9. 只有 2025 年傳過：照 AA_336 只看 2026 年那一次，不算', !GROUP.knowsAnBday(G));
  fresh('2027-09-15',18,'gongguan'); team(); SOCIAL.remember('heroine_01','AN5_BIRTHDAY','');
  check('C9. AN5_BIRTHDAY 照舊算', GROUP.knowsAnBday(G));
  fresh('2027-09-15',18,'gongguan'); team(); G.flags.dating_heroine_01=true;
  check('C9. 和以安交往中照舊算', GROUP.knowsAnBday(G));
  // ---------- C12 明軒週二麵店 ----------
  const MX=CHARACTERS.classmate_mingxuan, se=()=>STORY.schedEnt(MX,G);
  check('C12 前置：2028-05-02、2028-08-29、2029-08-28 是週二', wdOf(D('2028-05-02'))===2&&wdOf(D('2028-08-29'))===2&&wdOf(D('2029-08-28'))===2);
  fresh('2028-05-02',18.5,'noodle'); { const e=se(); check('C12. 2028-05-02（二）18:30：明軒在麵店吃（act eat）', !!e&&e.zone==='noodle'&&e.act==='eat', JSON.stringify(e)); }
  at('2028-05-02',19.2); { const e=se(); check('C12. 19:00 以後不在麵店（19:30 家教）', !(e&&e.zone==='noodle'), JSON.stringify(e)); }
  at('2028-04-25',18.5); { const e=se(); check('C12. 5/2 以前的週二（4/25）：沒有', !(e&&e.zone==='noodle'), JSON.stringify(e)); }
  at('2028-05-04',18.5); { const e=se(); check('C12. 週四：沒有（只有週二）', !(e&&e.zone==='noodle'), JSON.stringify(e)); }
  at('2028-07-11',18.5); { const e=se(); check('C12. 暑假的週二（7/11）照樣在麵店', !!e&&e.zone==='noodle'&&e.act==='eat', JSON.stringify(e)); }
  at('2028-08-29',18.5); { const e=se(); check('C12. 2028-08-29：在麵店', !!e&&e.zone==='noodle', JSON.stringify(e)); }
  at('2028-09-05',18.5); { const e=se(); check('C12. 2028-09-05（大四上，還沒出發）：照樣在麵店（AA_345 G4：到 2029-08-28）', !!e&&e.zone==='noodle'&&e.act==='eat', JSON.stringify(e)); }
  at('2029-03-06',18.5); { const e=se(); check('C12. 2029-03-06（大四下的週二）：在麵店', !!e&&e.zone==='noodle'&&e.act==='eat', JSON.stringify(e)); }
  at('2029-08-28',18.5); { const e=se(); check('C12. 2029-08-28（最後一個週二）：在麵店', !!e&&e.zone==='noodle', JSON.stringify(e)); }
  at('2029-09-04',18.5); { const e=se(); check('C12. 2029-09-04（他 2029-09-02 出發以後）：沒有', !(e&&e.zone==='noodle'), JSON.stringify(e)); }
  at('2028-08-15',18.5); check('C12. 8/15（二）回彰化（presence）：人不在臺北，作息不用', !STORY.reachable('classmate_mingxuan',G)&&STORY.reachable('classmate_mingxuan',(at('2028-08-22',18.5),G)));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
