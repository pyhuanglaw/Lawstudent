// 交接包 v2 C20：重訪日 1——可昕的版本（草稿第 3 節、AA_12、BB_96 9-10）——不需要瀏覽器。修改前沒有這個事件（第 1 項失敗）。
// 檢查：大一最後一天（第 18 週最後一天）中午可昕的訊息＋目標；18:00 以後在兩點半 Café 演；選項只從經歷過的事裡出（最多三個＋一定有的那一個）；
//   她的回應照 BB 的表（中秋烤肉看 K3、她自己的那一件看 K6）；REVISIT_Y1:{who:'kexin',pick}；不是交往中、別天、別的地方都沒有
// 用法：node tests/v2_c20_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|REVISIT_Y1_OPTS|REVISIT_Y1_SHOWN)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const e=ev('ev_revisit_y1_kexin');
  check('C20：可昕的重訪日 1 事件在',!!e&&!!STORY.revisitDay);
  if(!e||!STORY.revisitDay){ console.log('FAILED '+fails); process.exit(1); }
  const RD=STORY.revisitDay(), dt=CALENDAR.dateOf(RD), t=CALENDAR.termOf(RD);
  check('日子：大一下第 18 週最後一天（2026-06-28 週日）',t&&t.id==='Y1S2'&&t.week===18&&dt.y===2026&&dt.m===6&&dt.d===28&&!(CALENDAR.termOf(RD+1)&&CALENDAR.termOf(RD+1).id==='Y1S2'),JSON.stringify({dt,t}));
  /* 中午的訊息＋目標 */
  { fresh(RD,9,'dorm',{dating_kexin:true}); let goal=''; GM.setGoal=t=>{ goal=t; }; run(9,13); const L=txt('p:kexin');
    check('交往中：中午 12:00 可昕「最後一天。你說的那張桌子，我六點到。」；收到以後目標「18:00 兩點半 Café（可昕）」',JSON.stringify(L.slice(-1))==='["kexin:最後一天。你說的那張桌子，我六點到。"]'&&goal==='18:00 兩點半 Café（可昕）'&&Math.abs((TH('p:kexin').slice(-1)[0]||{}).h-12)<0.01,JSON.stringify(L)+' '+goal);
    fresh(RD,9,'dorm',{}); run(9,13); check('單身：沒有這則訊息',!TH('p:kexin').some(m=>/六點到/.test(m.text)));
    fresh(RD,18.5,'dorm',{dating_kexin:true}); run(18.5,19); check('已經過了六點才開始玩那一天：不補傳（約的時間過了）',!TH('p:kexin').some(m=>/六點到/.test(m.text)));
    fresh(RD-1,9,'dorm',{dating_kexin:true}); run(9,23); check('前一天：沒有',!TH('p:kexin').some(m=>/六點到/.test(m.text))); GM.setGoal=()=>{}; }
  /* 條件 */
  { const at=(day,h,zone,flags)=>{ fresh(day,h,zone||'cafe',flags==null?{dating_kexin:true}:flags); return EVENTS.check(e); };
    const r={ok:at(RD,18),late:at(RD,21.9),early:at(RD,17.5),prev:at(RD-1,18.5),single:at(RD,18.5,'cafe',{}),wz:at(RD,18.5,'wenzhou'),done:at(RD,18.5,'cafe',{dating_kexin:true,REVISIT_Y1:{who:'kexin',pick:'daily'}})};
    check('18:00–22:00 人在兩點半 Café＋交往中＝演；17:30、前一天、單身、在溫州街、已經演過都沒有',r.ok&&r.late&&!r.early&&!r.prev&&!r.single&&!r.wz&&!r.done,JSON.stringify(r));
    check('早到的玩家等到六點：auto（人在 Café 裡就會開始，不用重新走進來）',e.trigger==='auto'&&e.location==='cafe'); }
  /* 選項只從經歷過的事裡出 */
  const optsFor=async(flags,extra)=>{ fresh(RD,18.2,'cafe',Object.assign({dating_kexin:true},flags||{})); if(extra) extra(); picks=[0]; await EVENTS.run(e); return opts[0]||[]; };
  { let o=await optsFor({}); check('什麼都沒經歷過：只有「每天都差不多。可是我很喜歡。」',JSON.stringify(o)==='["「每天都差不多。可是我很喜歡。」"]',JSON.stringify(o));
    o=await optsFor({AN_APPEAL:'ask',rain_umbrella:'shared'}); check('申訴、雨天：兩個＋一定有的那一個',JSON.stringify(o)==='["「幫以安室友寫申訴。」","「那天下雨，總圖門口。」","「每天都差不多。可是我很喜歡。」"]',JSON.stringify(o));
    o=await optsFor({noodleTableDay:30,AN_APPEAL:'rule',rain_umbrella:'none'},()=>{ G.courses={attend:{econ_principles_1:2}}; G.events.done.ev_mid_autumn_bbq=1; });
    check('經歷了五件：最多三個（照表的順序：重修、中秋烤肉、麵店）＋一定有的那一個',JSON.stringify(o)==='["「重修的第一堂，坐回同一間教室。」","「中秋烤肉，借來的烤肉架。」","「麵店的第一碗。」","「每天都差不多。可是我很喜歡。」"]',JSON.stringify(o));
    o=await optsFor({B4_ATTENDED:true},()=>{ SOCIAL.meet('heroine_04','wancai'); SOCIAL.remember('heroine_04','CLAPPED','成發'); });
    check('演講（B4_ATTENDED）、成發拍手（子晴的 CLAPPED）：之後做了就會出現',JSON.stringify(o)==='["「那場演講。」","「成發那天，我負責拍手。」","「每天都差不多。可是我很喜歡。」"]',JSON.stringify(o)); }
  /* 她的回應＋她自己的那一件 */
  { const play=async(flags,want,extra)=>{ fresh(RD,18.2,'cafe',Object.assign({dating_kexin:true},flags||{})); if(extra) extra(); picks=[want]; await EVENTS.run(e); return lines(); };
    const base=['杜可昕：（坐下，手放在桌上）假設這張桌子，記得每一個坐過的人。','杜可昕：它會記得你今年最意外的一件事嗎？說吧。'];
    const nm=(CHARACTERS.kexin&&CHARACTERS.kexin.name)||'杜可昕'; const fix=L=>L.map(x=>x.replace(/^杜可昕：/,nm+'：'));
    let L=await play({},'每天都差不多');
    check('開頭兩句照原文',JSON.stringify(L.slice(0,2))===JSON.stringify(fix(base)),JSON.stringify(L.slice(0,2)));
    check('「每天都差不多。可是我很喜歡。」：（她嘴角先動了。）「……這題答得太好。我要記下來。」；她自己的：沒做過 K6＝「假設題的答案」；REVISIT_Y1',JSON.stringify(L.slice(2))===JSON.stringify(fix(['她嘴角先動了。','杜可昕：……這題答得太好。我要記下來。','杜可昕：我的最意外？我以為我們會常常吵架。','杜可昕：結果我們吵最多的，是假設題的答案。']))&&JSON.stringify(G.flags.REVISIT_Y1)==='{"who":"kexin","pick":"daily"}',JSON.stringify(L.slice(2))+' '+JSON.stringify(G.flags.REVISIT_Y1));
    L=await play({KX_K6_EXAM:true,AN_APPEAL:'ask'},'申訴'); check('「幫以安室友寫申訴。」：「你們系的人，連宿舍的事都寫成申訴書。……我喜歡。」；做過 K6＝「是考古題。」；pick appeal',L[2]===nm+'：你們系的人，連宿舍的事都寫成申訴書。……我喜歡。'&&L[L.length-1]===nm+'：結果我們吵最多的，是考古題。'&&G.flags.REVISIT_Y1.pick==='appeal',JSON.stringify(L.slice(2)));
    const bbq=()=>{ G.events.done.ev_mid_autumn_bbq=1; };
    L=await play({KX_MET_NOODLE_TEAM:true},'中秋',bbq); check('中秋烤肉、K3 有來：「那天阿哲輸給我三個冷笑話。」',L[2]===nm+'：那天阿哲輸給我三個冷笑話。',L[2]);
    L=await play({},'中秋',bbq); check('中秋烤肉、K3 沒來：「我只看過照片。玉米還是我們系的好。」',L[2]===nm+'：我只看過照片。玉米還是我們系的好。',L[2]);
    L=await play({rain_umbrella:'shared'},'下雨'); check('雨天：「那天的雨很大。你後來有沒有感冒？」',L[2]===nm+'：那天的雨很大。你後來有沒有感冒？',L[2]);
    L=await play({noodleTableDay:30},'麵店'); check('麵店：「你講了一整年的麵。暑假帶我去。」',L[2]===nm+'：你講了一整年的麵。暑假帶我去。',L[2]);
    L=await play({},'重修',()=>{ G.courses={attend:{econ_principles_2:1}}; }); check('重修：「一年前你也坐在那間教室。……這次你待到最後了。」',L[2]===nm+'：一年前你也坐在那間教室。……這次你待到最後了。',L[2]); }
  /* 引擎：auto 在 Café 裡 18:05 開始 */
  { fresh(RD,18.05,'cafe',{dating_kexin:true}); const r=EVENTS.tick(0.1); await new Promise(z=>setTimeout(z,30)); check('引擎：Café 裡 18:03 自動開始',r&&!!G.events.done.ev_revisit_y1_kexin,JSON.stringify(r)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
