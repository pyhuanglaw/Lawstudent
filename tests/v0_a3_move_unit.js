// v0 A3 搬出宿舍那天（BB_112 A3）＋休學以後從家裡出發（AA_154 1-3b）：觸發、請／不請、搬回家、在家的選單、在家讀書、去學校、回家——不需要瀏覽器。
// 修改前沒有 ev_y0_a3（全部失敗）。用法：node tests/v0_a3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const D=STORY.dayOfKey('2025-03-29'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_a3'); check('0. A3 在、3/29 是週六',!!ev&&CALENDAR.dateOf(D).wd===6); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(h,z,f)=>{ fresh(D,h,z,Object.assign({LEAVE_WEEK:6},f||{})); G.stage='econ'; return EVENTS.check(ev); };
  check('1. 3/29 09:00 以後在宿舍演；08:00、在校園（20:00 前）不演；20:00 以後在哪裡都演；沒有休學不演',ck(9.5,'dorm')&&!ck(8,'dorm')&&!ck(15,'campus')&&ck(20.5,'campus')&&!(()=>{ fresh(D,10,'dorm'); G.stage='econ'; return EVENTS.check(ev); })());
  let menus=[], script=[]; const choose0=GM.choose;
  GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  fresh(D,10,'dorm',{LEAVE_WEEK:6,Y0_STICKY:true}); G.stage='econ'; said=[]; script=['請阿勳']; await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20));
  const L=said.map(x=>x.t);
  check('2. 阿勳「箱子我幫你封。你的膠帶貼得很醜。」…「一個人講，就是自言自語了。」→ 請吃飯 →「這是我吃過最有效率的告別。」',L[0]==='箱子我幫你封。你的膠帶貼得很醜。'&&L.includes('一個人講，就是自言自語了。')&&L.includes('這是我吃過最有效率的告別。')&&G.flags.A3_TREAT===true,JSON.stringify(L));
  check('3. 搬回臺北的家：在家、H.base、便利貼還在那句、選單（去學校／在家讀書／睡覺，沒有回宿舍）',HOME.at(G)&&G.home.base===true&&G.flags.Y0_MOVED_OUT===true&&L.includes('回到臺北的家拆箱時，檯燈上那張便利貼還在：「保齡球欠我一場。」')&&menus.length>=2&&menus[menus.length-1].includes('去學校')&&menus[menus.length-1].includes('在家讀書')&&!menus[menus.length-1].some(t=>/回宿舍/.test(t)),JSON.stringify(menus));
  check('3. 搬出以後 HOME.canGo 一直是 true（校門口「回臺北的家」每天都在）',HOME.baseMode(G)&&HOME.canGo(G));
  // 在家讀書
  const h0=G.hour; script=['在家讀書']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('4. 在家讀書：兩小時、habit retake:study +1',Math.abs(G.hour-(h0+2))<1e-6&&EVENTS.habitCount({key:'retake:study'})===1,G.hour+' '+h0);
  // 去學校
  script=['去學校']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('5. 去學校：30 分鐘、到校門（校園）、不在家',!HOME.at(G)&&G.zone==='campus');
  // 回家：HOME.go 走 30 分鐘、還是 base
  script=[]; G.hour=17; const t0=G.hour; try{ await HOME.go(GM); }catch(e){ if(e.message!=='STOP') throw e; } check('6. 校門口回家：約 30 分鐘、在家、base',HOME.at(G)&&G.home.base===true&&Math.abs(G.hour-(t0+0.5))<1e-6,G.hour);
  // 不請
  fresh(D,10,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; said=[]; script=['不請']; try{ await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20)); }catch(e){}
  check('7. 不請：阿勳傳一張照片；沒有便利貼那句（沒有 Y0_STICKY）',PHONE.thread(G,'p:econ_zhengxun').some(m=>m.text==='📷（他自己買的便當）')&&G.flags.A3_TREAT===false&&!said.some(x=>/便利貼/.test(x.t)));
  // 法律系：不受影響
  fresh(termDay('Y1S1',4,3),19,'dorm'); check('8. 法律系的存檔：週三晚上不能回家（baseMode 不成立）',!HOME.baseMode(G)&&!HOME.canGo(G));
  GM.choose=choose0;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
