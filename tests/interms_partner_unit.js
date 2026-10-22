// 「她現在有伴侶」的兩個判斷改用 STORY.partnerOn（BUG-INTERMS-PARTNER-1021；AA_373 子代理 2026-10-21 順手發現）——不需要瀏覽器。
// 原因：STORY.inTerms 只看 from／until（學期），不看 fromWeek／untilWeek／startEvent／endEvent；msg3d.js 的 herPartner（手機聊天能不能進 L 層）、
//       social3d.js 的 SOCIAL.partnered（拿不拿掉 {solo} 旁白）用它——小語（partner fromWeek Y2S1 第 15 週＋ev_yu_together）從開局就被當成有伴侶，
//       沛珊（2026-04-06～大二上第 6 週＋ev_peishan_split）分手以後也一直被當成有伴侶。其他地方（date3d、invites3d、termend3d）早就用 partnerOn。
// 檢查：1. SOCIAL.partnered（祐廷沒和任何人交往）每一天都和 STORY.partnerOn 一樣（小語、沛珊，大一上到大三上取樣）；
//       2. 沛珊第 5 階以上、兩人都單身：伴侶期間（2026-05-04）手機聊天不是 L；分手以後（2026-11-02，大二上第 9 週）是 L。
// 修改前：第 1 項（小語 2025-10-01、沛珊 2026-11-02）、第 2 項 FAIL。用法：node tests/interms_partner_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const D=k=>STORY.dayOfKey(k);
const fresh=day=>{ const G={v:3,day,hour:20,zone:'dorm',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:{LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,stats:{classes:0},contacts:{}}; SOCIAL.bind(G); return G; };
{ const bad=[]; for(const id of ['yu','classmate_peishan']){ const p=CHARACTERS[id].partner; for(let day=D('2025-09-17');day<=D('2027-12-31');day+=7){ const G=fresh(day); const a=SOCIAL.partnered(id), b=STORY.partnerOn(G,p); if(a!==b) bad.push(id+'@'+CALENDAR.dateOf(day).key+':'+a+'/'+b); } }
  check('1. SOCIAL.partnered 每一天都和 STORY.partnerOn 一樣（小語開局不算有伴侶、沛珊分手以後不算）',!bad.length,bad.length+' 天不一樣，例：'+bad.slice(0,4).join('　')); }
{ const hi=G=>{ const r=SOCIAL.rel('classmate_peishan'); r.fam=95; r.trust=90; r.comf=90; r.rom=40; r.npcRom=40; SOCIAL.remember('classmate_peishan','FIRST_MET',''); };
  const Gin=fresh(D('2026-05-04')); hi(Gin); const tIn=MSG.tier(Gin,'classmate_peishan'), pIn=STORY.partnerOn(Gin,CHARACTERS.classmate_peishan.partner);
  const Gout=fresh(D('2026-11-02')); hi(Gout); const tOut=MSG.tier(Gout,'classmate_peishan'), pOut=STORY.partnerOn(Gout,CHARACTERS.classmate_peishan.partner);
  check('2. 沛珊（高好感、兩人都單身）：伴侶期間 2026-05-04 手機聊天不是 L；分手以後 2026-11-02 是 L',pIn&&!pOut&&tIn!=='L'&&tOut==='L',JSON.stringify({pIn,tIn,pOut,tOut,stage:SOCIAL.stage&&SOCIAL.stage('classmate_peishan')})); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
