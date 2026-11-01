// 交接包 v2：BB_96 第 10 節「經濟系的朋友」（BB 2026-10-14）——不需要瀏覽器。
// 10-1 P4d「你怎麼又在這裡？」：修改前沒有 ev_econ_hallway（第 1 項失敗）。檢查：重修經原（下）第 2 週週五下課演；那天沒去＝延到下一個有去的週五（第 3～5、7 週）；
//   第 8 週以後不演（一直沒去就不發生）；見過、沒見過品妤兩種；三個選項的回答與旗標；只演一次；大一上的經原（上）不演
// 用法：node tests/v2_econ_unit.js
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
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  const hw=ev('ev_econ_hallway');
  check('1. 10-1 P4d 事件在（ev_econ_hallway）',!!hw);
  if(!hw){ console.log('FAILED '+fails); process.exit(1); }
  check('1. 接在重修經原（下）下課之後、只在大一下、只演一次',hw.afterClass==='econ_principles_2'&&!hw.afterExam&&JSON.stringify(hw.term)==='["Y1S2"]'&&hw.once===true);
  const econOn=(w)=>{ const d=termDay('Y1S2',w,5); fresh(d,8,'putong'); const it=CLS.dayItems(G,d).find(x=>x.c.id==='econ_principles_2'); return {d,it}; };
  { const w2=econOn(2); check('2. 第 2 週週五（3/6）有重修經原（下）',!!w2.it&&!w2.it.exam&&CALENDAR.dateOf(w2.d).m===3&&CALENDAR.dateOf(w2.d).d===6,JSON.stringify({d:w2.d,date:CALENDAR.dateOf(w2.d),it:!!w2.it})); }
  { const w6=econOn(6), w10=econOn(10); check('2. 第 6 週週五（春假）、第 10 週週五（勞動節）停課',!w6.it&&!w10.it,JSON.stringify({w6:CALENDAR.holiday(w6.d),w10:CALENDAR.holiday(w10.d)})); }
  const attendWeek=async(w,setup,pk)=>{ const {d,it}=econOn(w); if(!it) return null; G.hour=it.t0+0.1; if(setup) setup(); picks=pk||[]; said=[]; opts=[]; await CLS.attend(GM,it); return lines(); };
  /* 沒見過品妤 */
  let L=await attendWeek(2,null,['「重修。」']);
  const want=['阿勳：……你怎麼又在這裡？','阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。','品妤：曾品妤。經濟系，可昕以前的室友。','阿勳：重修。……你看起來比去年清醒。','阿勳：週五中午，我們在學活。你要來就來。'];
  const k0=L?L.indexOf(want[0]):-1;
  check('3. 第 2 週下課：阿勳兩句（重新介紹）→ 沒見過品妤：她先介紹自己 → 選「重修。」→ 阿勳的回答 → 「週五中午，我們在學活。你要來就來。」',k0>=0&&JSON.stringify(L.slice(k0))===JSON.stringify(want),JSON.stringify(L&&L.slice(Math.max(0,k0))));
  check('3. 三個選項：「重修。」「我在法律系，很好。」「說來話長。」',JSON.stringify(opts[opts.length-1])==='["「重修。」","「我在法律系，很好。」","「說來話長。」"]',JSON.stringify(opts));
  check('3. 記 P4D_ANSWER＝retake、MET_XUN、MET_PINYU、ECON_HALLWAY_DAY＝那一天',G.flags.P4D_ANSWER==='retake'&&G.flags.MET_XUN===true&&G.flags.MET_PINYU===true&&G.flags.ECON_HALLWAY_DAY===termDay('Y1S2',2,5),JSON.stringify(G.flags));
  /* 見過品妤（K2）＋另外兩個選項 */
  L=await attendWeek(2,()=>{ G.flags.MET_PINYU=true; },['「我在法律系，很好。」']);
  check('4. 見過品妤（v1 K2）：她只說「你來了。」，不再自我介紹',L.includes('品妤：你來了。')&&!L.some(l=>l.includes('曾品妤')),JSON.stringify(L));
  check('4. 選「我在法律系，很好。」：阿勳「看得出來。你走路變快了。」；P4D_ANSWER＝good',L.includes('阿勳：看得出來。你走路變快了。')&&G.flags.P4D_ANSWER==='good',JSON.stringify(L));
  L=await attendWeek(2,null,['「說來話長。」']);
  check('4. 選「說來話長。」：阿勳「那下次說。」；P4D_ANSWER＝long',L.includes('阿勳：那下次說。')&&!L.includes('阿勳：重修。……你看起來比去年清醒。')&&G.flags.P4D_ANSWER==='long',JSON.stringify(L));
  /* 只演一次 */
  { await attendWeek(2,null,['「重修。」']); const {d,it}=econOn(3); G.events.done.ev_econ_hallway=true; G.hour=it.t0+0.1; said=[]; await CLS.attend(GM,it); check('5. 演過以後，第 3 週下課不再演',!lines().some(l=>l.includes('你怎麼又在這裡')),JSON.stringify(lines())); }
  /* 延到下一個有去的週五 */
  L=await attendWeek(3,null,['「重修。」']); check('5. 第 2 週沒去：第 3 週去了就演',L.includes('阿勳：……你怎麼又在這裡？')&&G.flags.ECON_HALLWAY_DAY===termDay('Y1S2',3,5));
  L=await attendWeek(7,null,['「重修。」']); check('5. 第 2～5 週都沒去：第 7 週去了也演',L.includes('阿勳：……你怎麼又在這裡？'));
  /* AA_294 ②（企劃 b3ec8820，2026-10-18 取代 BB_161 ⑱ 的「第 7 週以後走廊直接遇到」）：不限週次，這學期第一次出席經原下就演 P4d */
  L=await attendWeek(11,null,['「重修。」']); check('5. 第 7 週以前都沒去：第 11 週第一次去照樣演 P4d「你怎麼又在這裡？」（AA_294 ②：這學期第一次出席就演；原本 BB_161 ⑱ 是走廊直接遇到）',L&&L.includes('阿勳：……你怎麼又在這裡？')&&L.includes('阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。')&&L.includes('阿勳：週五中午，我們在學活。你要來就來。')&&!!G.flags.MET_XUN&&G.flags.P4D_ANSWER==='retake'&&G.flags.ECON_HALLWAY_DAY===termDay('Y1S2',11,5),JSON.stringify(L));
  { const {d,it}=(()=>{ const d=termDay('Y1S2',8,5); fresh(d,8,'putong'); return {d,it:CLS.dayItems(G,d).find(x=>x.c.id==='econ_principles_2')}; })();
    if(it){ G.hour=it.t0+0.1; said=[]; await CLS.attend(GM,it); } check('5. 第 8 週（期中考週）考完經原不演',!it||!lines().some(l=>l.includes('你怎麼又在這裡')),JSON.stringify({exam:it&&it.exam,L:lines()})); }
  /* 大一上 */
  { let d1=null,it1=null; for(let d=termDay('Y1S1',4,5);d<termDay('Y1S1',8,1);d++){ fresh(d,8,'putong'); const it=CLS.dayItems(G,d).find(x=>x.c.id==='econ_principles_1'); if(it){ d1=d; it1=it; break; } }
    if(it1){ G.hour=it1.t0+0.1; said=[]; await CLS.attend(GM,it1); } check('6. 大一上的經原（上）下課不演',!!it1&&!lines().some(l=>l.includes('你怎麼又在這裡')),JSON.stringify({d1,L:lines()})); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
