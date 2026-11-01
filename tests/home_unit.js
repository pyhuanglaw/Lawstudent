// 週末回臺北的家（AA_134 第 3 節、AA_137 第 6 節；家人台詞池 AA_138 → src/data/home_lines.js）——不需要瀏覽器。
// 照 AA_137 第 6 節的驗收：週五晚上在宿舍選「回家」→ 到家 → 晚餐一句 → 睡覺 → 週六早上在家醒來 → 可以取車 → 週日回宿舍；週一早上的課照常。
// 另外：只有週五 17:00～週日 21:30 回得了家；週日 21:30 以後自動提醒回宿舍；晚餐四週內同一句不重複（媽媽收尾；爸爸在上海）；家人群組週四 20:00、兩小時沒回爸爸傳「？」；舊存檔沒有 G.home。
// 修改前 HOME 不存在（第 1 項失敗）。用法：node tests/home_unit.js
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
  check('1. HOME、HOME_LINES 存在',typeof HOME!=='undefined'&&typeof HOME_LINES!=='undefined');
  if(typeof HOME==='undefined'){ console.log('FAILED '+fails); process.exit(1); }
  const FRI=termDay('Y1S1',4,5);
  fresh(FRI,10,'dorm',{introDone:true,classDone:true,afternoonDone:true}); check('2. 週五 10:00：還不能回家',!HOME.canGo(G));
  G.hour=19; check('2. 週五 19:00：可以回家',HOME.canGo(G)); G.weekday=1; check('2. 週一：不能回家',!HOME.canGo(G)); G.weekday=5;
  GM.npc={}; E.interactables=[]; GM.spawnNPC=()=>({}); GM.spawnCharacter=()=>null; try{ STORY.populate('dorm',GM); }catch(e){ console.log('  populate 其他部分在 node 裡跑不起來（不影響這一項）：'+e.message); } const it=E.interactables.find(i=>i.home);
  check('3. 宿舍房間有「收拾背包回臺北的家」（週五晚上看得到）',!!it&&!it.hidden,it&&it.label); G.hour=10; check('3. 週五白天藏起來',!!it&&it.hidden); G.hour=19;
  { const keep=E.interactables; E.interactables=[]; G.zone='campus'; try{ STORY.populate('campus',GM); }catch(e){ console.log('  populate campus 其他部分在 node 裡跑不起來（不影響這一項）：'+e.message); } const ig=E.interactables.find(i=>i.home); E.interactables=keep; G.zone='dorm';
    check('3b. 校門口也有「回臺北的家」（AA_134 第 3 節；週五晚上看得到、白天藏起來；不和走出校門重疊；校門 2026-10-18 改成兩側通道各一個出口）',!!ig&&!ig.hidden&&(G.hour=10,ig.hidden)&&[[-125.5,5.27],[-125.5,-5.27]].every(([ex,ez])=>Math.hypot(ig.x-ex,ig.z-ez)>2.5+ig.radius),ig&&JSON.stringify([ig.x,ig.z,ig.label])); G.hour=19; }
  picks=['吃晚餐',0,'睡覺','玄關','回宿舍'];
  await STORY.interact(it,GM); const t=lines().join('｜');
  check('4. 到家：媽媽一句（到家池）',said.some(s=>s.who==='媽媽'&&HOME_LINES.arrive.some(a=>a.t===s.t)),t.slice(0,80));
  check('4. 晚餐：媽媽問、玩家二選一、媽媽收尾（爸爸在上海，AA_298 第 8 節）；旁白「媽媽煮了一桌」、沒有「（爸爸」',said.some(s=>s.who==='媽媽'&&HOME_LINES.dinner.some(d=>d.mom===s.t))&&(said.some(s=>s.who==='媽媽'&&HOME_LINES.dinner.some(d=>d.dad===s.t))||/（媽媽/.test(t))&&/媽媽煮了一桌/.test(t)&&!/（爸爸|爸爸、媽媽都在/.test(t)&&!said.some(s=>s.who==='爸爸'));
  check('5. 睡覺：週六早上在家醒來（08:30、精力回滿、早上一句）',said.some(s=>HOME_LINES.morning.some(m=>s.t===m.t)));
  check('6. 取車：媽媽一句、車在身邊（carWithMe）',G.flags.carWithMe===true&&said.some(s=>s.who==='媽媽'&&HOME_LINES.car.some(c=>c.t===s.t)));
  check('7. 回宿舍：媽媽一句、回到宿舍房間、不在家了',said.some(s=>s.who==='媽媽'&&HOME_LINES.back.some(b=>b.t===s.t))&&G.zone==='dorm'&&!HOME.at(G)&&G.weekday===6,JSON.stringify({zone:G.zone,wd:G.weekday,at:HOME.at(G)}));
  // 週日 21:30 以後：自動提醒回宿舍
  const SUN=FRI+2; fresh(SUN,21.6,'dorm',{introDone:true,classDone:true,afternoonDone:true}); G.home={at:true,day:SUN}; picks=[];
  await HOME.loop(GM); check('8. 週日 21:30 以後在家：媽媽說早點回去、自動回宿舍',said.some(s=>/早點回去/.test(s.t))&&!HOME.at(G)&&G.zone==='dorm',lines().join('｜').slice(0,80));
  // 晚餐四週內不重複
  fresh(FRI,19,'dorm',{}); const seen=[]; for(let w=0;w<4;w++){ G.day=FRI+7*w; const d=HOME.dinnerPick(G); seen.push(d&&d.n); if(d) HOME.rec(G).ate[d.n]=G.day; }
  check('9. 晚餐：連續四個週末問的都不一樣',new Set(seen).size===4,JSON.stringify(seen));
  { fresh(termDay('Y1S1',3,5),19,'dorm',{}); const ns=new Set(); for(let k=0;k<20;k++){ const d=HOME.dinnerPick(G); if(d){ ns.add(d.n); HOME.rec(G).ate[d.n]=G.day-30; } G.day++; } check('9. 第 3 週不會問期中考',!ns.has(8),JSON.stringify([...ns])); }
  // 家人群組
  const THU=termDay('Y1S1',4,4); fresh(THU,20.1,'dorm',{introDone:true}); STORY.phoneRules(GM); PHONE.tick(G);
  const g=(G.msgs||[]).filter(m=>m.th==='g:home'); check('10. 週四 20:00 家人群組：媽媽一句、可以回「會回去／這週不回」（AA_458 第 1 節起句子在 HOME.GROUP_WK、照這一週的種類挑）',g.length===1&&g[0].ask&&g[0].ask.opts.length===2&&(HOME_LINES.group.some(x=>x.t===g[0].text)||Object.values(HOME.GROUP_WK||{}).some(w=>w[0]===g[0].text)||(HOME.ELDER||[]).includes(g[0].text)),JSON.stringify(g.map(m=>m.text)));
  G.hour=22.2; STORY.phoneRules(GM); PHONE.tick(G); check('10. 兩小時沒回：爸爸傳「？」',(G.msgs||[]).some(m=>m.th==='g:home'&&m.from==='dad'&&m.text==='？'));
  fresh(THU,20.1,'dorm',{introDone:true}); STORY.phoneRules(GM); PHONE.tick(G); const q=(G.msgs||[]).find(m=>m.th==='g:home'&&m.ask); PHONE.answer(G,q.ask.id,0); G.hour=22.5; STORY.phoneRules(GM); PHONE.tick(G);
  check('10. 回「會回去」：媽媽「好」＋愛心貼圖、爸爸不傳「？」',(G.msgs||[]).some(m=>m.from==='mom'&&m.text==='好')&&!(G.msgs||[]).some(m=>m.from==='dad'));
  // AA_140 G49：「你姊說她下個月回來。」姊姊在家的週末（每月 1～7 號）不問
  { let sat=null; for(let d=1;d<400&&!sat;d++){ const x=CALENDAR.dateOf(d); if(x.wd===6&&x.d<=7&&CALENDAR.termOf(d)) sat=d; }
    fresh(sat,19,'dorm',{}); let hit=0; for(let k=0;k<40;k++){ HOME.rec(G).ate={}; HOME.rec(G).used={}; const d=HOME.dinnerPick(G); if(d&&/你姊說/.test(d.mom)) hit++; G.day+=0; HOME.rec(G).ate[(k%10)+1]=G.day; }
    const pool=HOME_LINES.dinner.filter(d=>!/你姊說/.test(d.mom)).length;
    check('G49 姊姊在家的週末（1～7 號）晚餐不會問「你姊說她下個月回來。」',hit===0&&pool>0,JSON.stringify({sat,hit})); }
  // AA_140 G48：在家也要赴約；週日晚上在家睡覺＝先回宿舍（修改前 12～15 失敗）
  { const SAT=termDay('Y1S2',9,6); fresh(SAT,18.5,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); HOME.rec(G).at=true; HOME.rec(G).day=G.day;
    OUT.plan(G,{id:'t_out',ev:'ev_kexin_tour_nccu',day:G.day,h:18.75,place:'木柵大學',title:'去木柵大學找可昕',travel:'開車約 30 分鐘',travelH:0.5}); opts=[]; picks=['出發']; await HOME.loop(GM);
    check('12. 在家、到了出遊該出發的時間：選單最上面「出發：去木柵大學找可昕」（從家裡出發）；出發＝演出遊、離開家',(opts[0]||[])[0]==='出發：去木柵大學找可昕'&&OUT.get(G,'t_out').state==='done'&&!HOME.at(G),JSON.stringify({o:opts[0],st:OUT.get(G,'t_out').state,at:HOME.at(G)})); }
  { const SAT=termDay('Y1S2',9,6); fresh(SAT,17,'dorm',{introDone:true,classDone:true,afternoonDone:true}); HOME.rec(G).at=true; HOME.rec(G).day=G.day;
    OUT.plan(G,{id:'t_out2',ev:'ev_kexin_tour_nccu',day:G.day,h:19,place:'木柵大學',title:'去木柵大學找可昕',travelH:0.5}); said=[]; picks=['睡覺','先不要','回宿舍']; const d0=G.day; await HOME.loop(GM);
    check('13. 睡覺會跳過約好的時間：先問「會錯過：19:00 去木柵大學找可昕」，選「先不要」＝不睡（還是同一天）',said.some(x=>/^會錯過：19:00 去木柵大學找可昕/.test(x.t))&&G.day===d0&&OUT.get(G,'t_out2').state==='planned',JSON.stringify({s:said.map(x=>x.t).slice(-3),day:G.day})); }
  { const SAT=termDay('Y1S2',9,6); fresh(SAT,12,'dorm',{introDone:true}); HOME.rec(G).at=true; G.invites=[{id:'iv_t',who:'heroine_01',place:'cafe',day:G.day,h:10,state:'accepted'}];
    HOME.postponeMissed(G); check('14. 在家的時候過了時間的當面約＝延後、不扣分（不是沒赴約、不記 MISSED_DINNER）',G.invites[0].state==='postponed'&&!SOCIAL.has('heroine_01','MISSED_DINNER')); }
  { const SAT=termDay('Y1S2',9,6); fresh(SAT,15,'dorm',{introDone:true}); HOME.rec(G).at=true; G.invites=[{id:'iv_t2',who:'heroine_01',place:'cafe',day:G.day,h:15.5,state:'accepted'}]; opts=[]; picks=['出發']; await HOME.loop(GM);
    check('14b. 當面約前 1 小時起：選單有「出發：和…約在兩點半 Café」→ 回到那個地方（不在家了）',(opts[0]||[]).some(t=>/^出發：和.*約在兩點半 Café/.test(t))&&!HOME.at(G)&&G.zone==='cafe',JSON.stringify({o:opts[0],zone:G.zone})); }
  { const SUN=termDay('Y1S2',9,7); fresh(SUN,20,'dorm',{introDone:true,classDone:true,afternoonDone:true}); HOME.rec(G).at=true; opts=[]; picks=['睡覺']; const d0=G.day; let err=null; try{ await HOME.loop(GM); }catch(e){ err=String(e); }
    check('15. 週日晚上在家選「睡覺」：先回宿舍（不在家睡到週一）',!HOME.at(G)&&G.zone==='dorm'&&(opts[0]||[]).some(t=>t==='睡覺'),JSON.stringify({at:HOME.at(G),zone:G.zone,err,day:G.day-d0})); }
  // 舊存檔
  fresh(FRI,19,'dorm',{}); delete G.home; let ok=true; try{ ok=!HOME.at(G); HOME.tick(GM); }catch(e){ ok=false; } check('11. 舊存檔沒有 G.home：不在家、不出錯',ok);
  { const L=HOME_LINES, sk=HOME.HOME_SKIP, ds=HOME.DINNER_SKIP; const d=n=>L.dinner.find(x=>x.n===n);
  check('11. 住在家裡不出提宿舍的句子（AA_298 第 4 節）：群組「這週回來吃飯嗎」「回來的話先講」、到家「宿舍的床」、晚餐「宿舍的飯」「室友」都在台詞池裡（比對得到）',sk.group.every(t=>L.group.some(x=>x.t===t))&&sk.arrive.every(t=>L.arrive.some(x=>x.t===t))&&ds.every(t=>L.dinner.some(x=>x.mom===t)));
  const g0=GM.G, lh=HOME.livesHome; HOME.livesHome=()=>true; const picks=new Set(); for(let k=0;k<12;k++){ const x=HOME.pick({day:k,home:{used:{}},flags:{}},'arrive'); if(x) picks.add(x.t); } const dn=new Set(); for(let k=0;k<20;k++){ const x=HOME.dinnerPick({day:k,flags:{},home:{ate:{},used:{}}}); if(x) dn.add(x.n); } HOME.livesHome=lh;
  check('11. livesHome 時：到家不會抽到「宿舍的床」、晚餐不會抽到 n3、n4',!picks.has('宿舍的床睡得習慣嗎？')&&picks.size>0&&!dn.has(3)&&!dn.has(4)&&dn.size>0,JSON.stringify([...dn])); }
{ const g3=require('fs').readFileSync(require('path').join(__dirname,'..','src/game3d.js'),'utf8'); check('12. 在臺北的家：右上角地點、存檔列表都寫「臺北的家」（BB-C BUG-HOME-HUDZONE）',/HOME\.at\(G\)\)\?'臺北的家'/.test(g3)&&/s\.home&&s\.home\.at\?'臺北的家'/.test(g3)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
