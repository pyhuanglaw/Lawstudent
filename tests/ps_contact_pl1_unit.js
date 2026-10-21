// 沛珊的聯絡方式（AA_310 第 7 節；AA-C 2026-10-20 14:40）——不需要瀏覽器。
//   沒有宿營、也沒去 8/31 迎新的局（9/17 開局的舊存檔，例如使用者 10-20 的 9/25 存檔）拿不到沛珊的聯絡方式（P1／P1b 讀書會已停用）：
//   1. 第一次聊到她（階梯 P-L1）還沒有聯絡方式：她的回覆後面多一句「……我加你好不好？上課的筆記可以互傳。」、拿到聯絡方式；
//   2. 已經有聯絡方式的不出這句；
//   3. 別人的階梯、她別的層不出。
// 修改前 1 FAIL。用法：node tests/ps_contact_pl1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|LADDER)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[];
const GM={get G(){ return G; },E:{player:{obj:{position:{x:0,z:0}}},npcs:[]},npc:{},sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push(String(t)); },choose:async()=>0,fade:async()=>{},advance(){},sleep:()=>Promise.resolve()};
const LINE='……我加你好不好？上課的筆記可以互傳。';
const mk=()=>{ const day=STORY.dayOfKey('2025-09-25'); G={day,hour:15,zone:'campus',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:{},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; };
const steps=(LADDER.byTerm&&LADDER.byTerm.Y1S1&&LADDER.byTerm.Y1S1.classmate_peishan&&LADDER.byTerm.Y1S1.classmate_peishan.steps)||((LADDER.characters||{}).classmate_peishan||{}).steps||[];
const P1=steps.find(s=>s.id==='P-L1'), P2=steps.find(s=>s.id!=='P-L1');
(async()=>{
  check('0. 沛珊大一上的階梯有 P-L1', !!P1);
  mk(); SOCIAL.meet('classmate_peishan','campus'); const had=INV.hasContact(G,'classmate_peishan'); await STORY.ladPlay(GM,'classmate_peishan','classmate_peishan',P1);
  check('1. 還沒有聯絡方式：P-L1 回覆後面「……我加你好不好？上課的筆記可以互傳。」、拿到聯絡方式', !had&&said.includes(LINE)&&INV.hasContact(G,'classmate_peishan'), JSON.stringify(said));
  mk(); SOCIAL.meet('classmate_peishan','campus'); INV.addContact(G,'classmate_peishan'); await STORY.ladPlay(GM,'classmate_peishan','classmate_peishan',P1);
  check('2. 已經有聯絡方式：不出這句', !said.includes(LINE), JSON.stringify(said));
  if(P2){ mk(); SOCIAL.meet('classmate_peishan','campus'); await STORY.ladPlay(GM,'classmate_peishan','classmate_peishan',P2); check('3. 她別的層不出', !said.includes(LINE)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
