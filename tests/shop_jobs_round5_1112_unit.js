// SHOP-JOBS-1112 第五輪（2026-11-12；USER_WANTS X356）：BB 判的 P1（BB_255，使用者電腦實測 d4daa6326c）＋AA_828 第 8 節（企劃線 1e539b8eb9）。不需要瀏覽器。
//   A1 祐廷在越好吃上班、同學（可昕、阿哲、其他人）來吃飯的那一段：演的時候那個人真的在店裡的 3D 裡（照作息那一套：SHOPLIFE.bringIn → STORY.refreshSchedule＝從門口進來、走到位子坐下），
//      演完照同一筆作息留在位子上吃、時段結束離開；帶不進來＝不演只有台詞的那一段。這裡的 3D 是假的（座位、門口、spawnCharacter 的替身），STORY.refreshSchedule、SHOPLIFE、JOBS 是真的。
//   A2 新店那幾間上班期間：祐廷站到櫃台後（店員旁邊）、包拿下來；下班還原；班中途讀檔不卡、包還原；沒有圍裙模型（只驗「祐廷的模型沒有 apron 配件」）。
//   A3 上班的時候排進行程的提示（可昕「我們的日子」）先留著、下班補說。
//   B  AA_828 第 8 節：沒認識過宋知寧＝她不出現在山嵐、「新來的？」那一版不演（資料不再有 co.new／newFrom）；家教回「不了」以後不再問。
// 修改前（開發分支 c0a12c42e3，含第四輪 d4daa6326c）：A1～A3 的「有 …（修改前：沒有）」那幾項、A1 人在店裡、A2 站位藏包、A3 提示、B 白名單版本／資料沒有 new／B1 大一下不演／B5 都 FAIL。
// 3D 站位、走進來的樣子沒有在瀏覽器看過（排使用者電腦）。用法：node tests/shop_jobs_round5_1112_unit.js
require('./alison.js');
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/data/she_pays.js','src/date3d.js',
  'src/data/termend_lines.js','src/data/termend_opts.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
const toasts=[]; GM.toast=t=>{ toasts.push(t); }; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
/* 選單哪幾項是灰的（pg_harness 的 choose 只記字）*/
const dims=[]; { const c0=GM.choose; GM.choose=async o=>{ dims.push(o.filter(q=>q.dim).map(q=>q.t)); return c0(o); }; }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd), key=d=>CALENDAR.dateOf(d).key;
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(key(d),h,zone||'dorm',flags); toasts.length=0; dims.length=0; return G; };
const said=t=>H.said.some(s=>s.t===t), saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w), L=()=>H.lines();
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
const ZONE={flower:'flower_notes',yue:'tz_yuehaochi',dakou:'xs_dakou',shanlan:'xs_shanlan'};
const sleeps=[]; if(typeof STORY!=='undefined') STORY.sleepNow=async(gm,h)=>{ sleeps.push(h); H.G.day+=1; H.G.hour=h; };   /* 大夜班下班（S.nightSleep）：只記有沒有叫、睡到幾點 */
const shift=async(k,d,picks)=>{ const h0=JOBS.hrs(k,d)[0]; at(d,h0-0.1,ZONE[k]); H.said=[]; H.opts=[]; H.entered=[]; H.picks=(picks||[]).slice(); toasts.length=0; sleeps.length=0; const m0=H.G.money; await JOBS.runShift(GM,k); return H.G.money-m0; };
const desk=z=>{ H.E.interactables=[]; return JOBS.addDesk(GM,z); };
const ask=async(it,picks)=>{ H.said=[]; H.opts=[]; dims.length=0; toasts.length=0; H.picks=picks.slice(); await STORY.interact(it,GM); };

const D8=typeof SHOP_JOBS_AA828!=='undefined'?SHOP_JOBS_AA828:null;
const DOC8='docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md', SHA8='f6aa917593', PREV8='33e9522155';   /* 2026-11-12 第七輪合併後（AA_828 第 11 節，企劃線 f6aa917593）改期望：舊 SHA8 33e9522155（第 1～10 節一樣；多第 11 節，資料不變）、上一版在 history 的舊期望 3e9cd7d9d4——白名單換版本｜第七輪改期望：舊 SHA8 3e9cd7d9d4（第 1～9 節一樣；多第 10 節，資料不變）、上一版在 history 的舊期望 1e539b8eb9——白名單換版本｜第六輪改期望：舊 SHA8 1e539b8eb9（第 1～8 節一樣；多第 9 節）、上一版在 history 的舊期望 1d6055568c——白名單換版本 */
const friend=id=>{ const r=SOCIAL.rel(id); r.fam=40; r.trust=25; };
/* 假的 3D：座位、門口、生人（照 game3d.js spawnCharacter 回傳的樣子：charId、obj、seat）；STORY.refreshSchedule 是真的 */
const YUE=typeof TZ_SHOPS_LAYOUT!=='undefined'&&TZ_SHOPS_LAYOUT.yuehaochi?TZ_SHOPS_LAYOUT.yuehaochi:{seats:[{x:-2.6,z:2.25,yaw:0},{x:-2,z:2.25,yaw:0}],spawn:{x:0.75,z:2.9},clerk:{x:1,z:-3.4,yaw:0}};
const placed=[];
const world=()=>{ const E=H.E; E.npcs=[]; GM.npc={}; E.indoor=true; E.zone={indoor:true,roomAt:()=>null,seats:YUE.seats.map(s=>Object.assign({},s)),spawn:Object.assign({},YUE.spawn),shopClerk:Object.assign({},YUE.clerk),shopLayout:YUE};
  E.player.obj.position.x=0.75; E.player.obj.position.z=2.9; E.player.obj.rotation.y=Math.PI; E.player.obj.userData={}; E.player.jobWork=null; E.player.seat=null; placed.length=0;
  E.moveTo=()=>false; E.canStand=()=>true; E.removeNPC=n=>{ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); if(n&&n.charId&&GM.npc[n.charId]===n) delete GM.npc[n.charId]; };
  E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; placed.push([n===E.player?'player':(n.charId||'npc'),x,z]); };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n) E.removeNPC(n); };
  GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; }; GM.standUp=n=>{ n.seat=null; }; GM.seatApproach=st=>[st.x,st.z];
  GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; o=o||{}; const n={charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:o.yaw||0},visible:true,userData:{}},seat:o.seat||null,pose:o.pose||'idle',lv:o.lv|0,spawnAt:[x,z]}; GM.npc[id]=n; E.npcs.push(n); return n; }; };
const clerkNPC=()=>{ const n={clerk:true,name:'',obj:{position:{x:YUE.clerk.x,y:0,z:YUE.clerk.z},rotation:{y:YUE.clerk.yaw||0},visible:true},lv:0}; H.E.npcs.push(n); return n; };
/* 每一句說出來的那一刻：那個人在不在店裡、玩家站哪裡、包拿下來了沒 */
const snap=[]; { const s0=GM.say; GM.say=async function(who,t){ const E=H.E, P=E.player; snap.push({t:String(t),who:who&&who.charId||null,npcs:(E.npcs||[]).filter(n=>n&&n.charId).map(n=>n.charId),px:P.obj.position.x,pz:P.obj.position.z,off:!!(P.obj.userData&&P.obj.userData.carryOff),hour:H.G.hour}); return s0.apply(this,arguments); }; }
global.CHAR=global.CHAR||{}; CHAR.carryOff=h=>{ h.userData=h.userData||{}; h.userData.carryOff=true; return h2=>{ const x=h2||h; x.userData=x.userData||{}; x.userData.carryOff=false; }; };
const P3=['「再跟客人確認一次。」','「喊『小心燙』。」','「先補豆芽和九層塔。」'];
/* 找一天：這個人照名單（真的 SHOPLIFE.plan／why，不 stub）在祐廷越好吃的班裡來吃飯 */
const findDay=(id,flags)=>{ for(const term of ['Y1S2','Y2S1','Y2S2','Y1S1','Y3S1','Y3S2']){ const W=STORY.termWeeks(term); for(let w=2;w<=W;w++) for(const wd of [2,4]){ const d=TD(term,w,wd); if(d==null) continue; fresh(d,17.5,'tz_yuehaochi',flags||{}); hire('yue',[2,4]); friend(id); if(!JOBS.due(H.G,'yue',d)) continue; const m=JOBS.mealAt(H.G,id); if(m) return {d,m}; } } return null; };

(async()=>{
/* ================= A1 來吃飯的人真的在店裡 ================= */
await sec('A1',async()=>{
  check('A1. 有 JOBS.mealAt／mealBring、SHOPLIFE.bringIn／schedHold（修改前 d4daa6326c：都沒有＝FAIL）',typeof JOBS.mealAt==='function'&&typeof JOBS.mealBring==='function'&&typeof SHOPLIFE.bringIn==='function'&&typeof SHOPLIFE.schedHold==='function');
  if(typeof JOBS.mealBring!=='function') return;
  const Y=D8.yueMeal;
  /* 同學（名單上的人裡找一位、一天）*/
  let hit=null, who=null; for(const id of JOBS.yueMealIds()){ if(id==='kexin') continue; const r=findDay(id); if(r){ hit=r; who=id; break; } }
  check('A1. 找得到一位同學、一天：照真的名單在祐廷越好吃的班裡來吃飯',!!hit,who);
  if(hit){ const d=hit.d; fresh(d,17.4,'tz_yuehaochi',{}); hire('yue',[2,4]); friend(who); world(); clerkNPC(); SHOPLIFE._reset(); snap.length=0;
    const before=JOBS.mealAt(H.G,who); await shift('yue',d,P3);
    const i=snap.findIndex(s=>s.t===Y.narr), n=GM.npc[who];
    check('A1. 那一段演了（旁白「門口的鈴響了…」→ 他的一句 → 祐廷 → 幫他點了餐）',i>=0&&snap[i+1].who===who&&snap[i+2].t===Y.me&&/^（你幫(他|她)點了餐。）$/.test(snap[i+3].t),J(snap.map(s=>s.t).slice(0,8)));
    check('A1. 旁白出來的那一刻他已經在店裡的 3D 裡（E.npcs 有他）——修改前：只有台詞、店裡沒有人',i>=0&&snap[i].npcs.includes(who)&&snap[i+1].npcs.includes(who),J(i>=0&&snap[i].npcs));
    check('A1. 他是照作息那一套進來的（STORY.refreshSchedule 生的：n.sched；待在店裡補人＝從門口出現、走到位子坐下）',!!n&&n.sched===true&&!!n.seat&&Math.abs(n.spawnAt[0]-YUE.spawn.x)<1e-6&&Math.abs(n.spawnAt[1]-YUE.spawn.z)<1e-6&&YUE.seats.some(s=>Math.abs(s.x-n.seat.x)<1e-6&&Math.abs(s.z-n.seat.z)<1e-6),n&&J([n.sched,n.seat,n.spawnAt]));
    /* 演完留在位子上吃：之後照作息還在（他的那一筆到 to 為止），時段過了作息就沒有他（照平常離開） */
    const c=CHARACTERS[who], e0=STORY.schedEnt(c,Object.assign({},H.G,{hour:before.hour}));
    const mid=Object.assign({},H.G,{hour:Math.min(e0.to-0.05,before.hour+0.05)}), late=Object.assign({},H.G,{hour:e0.to+0.01});
    const em=STORY.schedEnt(c,mid), el=STORY.schedEnt(c,late);
    check('A1. 演完以後他照同一筆作息留在店裡吃（act eat、這間店）；時段結束（to）以後作息不再是這一筆＝照平常起身離開',!!em&&em.zone==='tz_yuehaochi'&&em.act==='eat'&&!(el&&el.zone==='tz_yuehaochi'&&el.shopMeal),J([em&&[em.zone,em.act,em.from,em.to],el&&el.zone]));
    check('A1. 什麼都沒寫進存檔（只多原本的 mealHi／SHOP_MEAL_HI）；存檔 JSON 來回不壞',!/hold|jobWork|bringIn/.test(J(H.G))&&J(JSON.parse(J(H.G)))===J(H.G));
    /* 讀檔：那一筆放開（照名單原本的時間）*/
    { at(d,17.6,'tz_yuehaochi'); SHOPLIFE._reset(); world(); const ent=STORY.schedEnt(c,Object.assign({},H.G,{hour:before.hour})); const b=!STORY.schedEnt(c,H.G)||STORY.schedEnt(c,H.G).zone!=='tz_yuehaochi'||before.hour<=17.6;
      const n2=SHOPLIFE.bringIn(GM,who,ent), held=STORY.schedEnt(c,H.G); const okHeld=!!n2&&!!held&&held.zone==='tz_yuehaochi';
      globalThis.LOADLOCKS['shoplife3d:holds'](); const after=STORY.schedEnt(c,H.G);
      check('A1. SHOPLIFE.bringIn：那一筆從現在起就算數（STORY.schedEnt 回這間店）；讀檔（LOADLOCKS）＝放開，照名單原本的時間',b&&okHeld&&(before.hour<=17.6||!after||after.zone!=='tz_yuehaochi'),J([b,okHeld,after&&after.zone,before.hour])); }
    /* 帶不進來（沒有空位）＝不演只有台詞的那一段、也不記 */
    { fresh(d,17.4,'tz_yuehaochi',{}); const j=hire('yue',[2,4]); friend(who); world(); H.E.zone.seats=[]; SHOPLIFE._reset(); snap.length=0; await shift('yue',d,P3);
      check('A1. 店裡帶不進來（沒有位子）：那一段不演、不記（下一次再說）——不演「只有台詞」',!snap.some(s=>s.t===Y.narr)&&!(j.mealHi||[]).includes(who)&&!H.E.npcs.some(n=>n.charId===who),J(snap.map(s=>s.t).slice(0,6))); } }
  /* 可昕（交往中才來）*/
  const K=findDay('kexin',{dating_kexin:true});
  check('A1. 找得到一天：交往中的可昕來越好吃（真的 SHOPLIFE.yueDate）',!!K,J(K));
  if(K){ fresh(K.d,17.4,'tz_yuehaochi',{dating_kexin:true}); hire('yue',[2,4]); friend('kexin'); world(); clerkNPC(); SHOPLIFE._reset(); snap.length=0; await shift('yue',K.d,P3);
    const i=snap.findIndex(s=>s.t===Y.narr), n=GM.npc.kexin;
    check('A1. 可昕：旁白、她的那一句「你在這裡打工？……排幾點到幾點？」出來的時候她人在店裡；演完坐在位子上',i>=0&&snap[i].npcs.includes('kexin')&&snap[i+1].t===Y.own['可昕']&&snap[i+1].npcs.includes('kexin')&&!!n&&!!n.seat&&n.sched===true,J([i,i>=0&&snap[i].npcs,n&&n.seat]));
    check('A1. 可昕：這一次算來過（SHOP_YUE_DATE 一筆）',J(Object.values(H.G.flags.SHOP_YUE_DATE||{}))===J([[K.d]]),J(H.G.flags.SHOP_YUE_DATE)); }
});
/* ================= A2 上班站櫃台後、藏書包 ================= */
await sec('A2',async()=>{
  check('A2. 有 JOBS.workSpot／workOn／workOff／workHeal（修改前：沒有）',['workSpot','workOn','workOff','workHeal'].every(k=>typeof JOBS[k]==='function'));
  if(typeof JOBS.workOn!=='function') return;
  const d=TD('Y1S2',4,2); fresh(d,17.4,'tz_yuehaochi',{}); hire('yue',[2,4]); world(); clerkNPC(); snap.length=0; const P=H.E.player;
  const sp=JOBS.workSpot(GM,'yue');
  check('A2. 站哪裡：店員旁邊 0.9 m、櫃台後（配置 clerk 那一排，z 一樣）、和店員同一個方向；位置讀店員，不另外寫座標',!!sp&&Math.abs(sp.z-YUE.clerk.z)<1e-6&&Math.abs(Math.abs(sp.x-YUE.clerk.x)-0.9)<1e-6&&sp.yaw===(YUE.clerk.yaw||0)&&sp.z<YUE.counter.z0,J(sp));
  await shift('yue',d,P3);
  const during=snap.filter(s=>s.hour>=17.5-1e-6);
  check('A2. 上班的每一句：祐廷在櫃台後（不在用餐區中間）、包拿下來了——修改前：站在進門的地方、背著包',during.length>=6&&during.every(s=>Math.abs(s.px-sp.x)<1e-6&&Math.abs(s.pz-sp.z)<1e-6&&s.off),J(during.slice(0,2)));
  check('A2. 下班：包背回來、站回原本的位置；E.player 上不留東西',P.obj.userData.carryOff===false&&Math.abs(P.obj.position.x-0.75)<1e-6&&Math.abs(P.obj.position.z-2.9)<1e-6&&P.jobWork==null,J([P.obj.userData,P.obj.position,P.jobWork]));
  check('A2. 存檔沒有暫時狀態',!/jobWork|carry/.test(J(H.G)));
  /* 沒有店員 NPC：照配置（SHOPLIFE.clerkSpot）*/
  { world(); const s2=JOBS.workSpot(GM,'yue'); check('A2. 店裡還沒有店員 NPC：照配置的店員位置（zone.shopClerk）算，一樣的地方',J(s2)===J(sp),J(s2)); }
  /* 旁邊站不上去（店員那一格站得上去的店）＝不動，只藏包 */
  { world(); clerkNPC(); H.E.canStand=(x,z)=>Math.abs(x-YUE.clerk.x)<0.1; const s3=JOBS.workSpot(GM,'yue'); JOBS.workOn(GM,'yue');
    check('A2. 兩邊都站不上去：不搬人（不卡進牆裡），只藏包；workOff 還原',s3===null&&P.obj.userData.carryOff===true&&P.obj.position.x===0.75&&JOBS.workOff(GM)===true&&P.obj.userData.carryOff===false); }
  /* 班中途讀檔：舊的那一班凍住走不到 finally */
  { world(); clerkNPC(); JOBS.running=true; JOBS.workOn(GM,'yue'); const mid=P.obj.userData.carryOff===true&&!!P.jobWork; globalThis.LOADLOCKS['jobs3d:running'](); P.obj.position.x=5; P.obj.position.z=5;   /* 讀檔把人放到存檔的位置 */
    JOBS.tick(GM); check('A2. 班中途讀檔：下一次 JOBS.tick 把包還原、不搬人（位置照讀檔的）、不卡住',mid&&P.obj.userData.carryOff===false&&P.jobWork==null&&P.obj.position.x===5&&P.obj.position.z===5&&JOBS.running===false,J([mid,P.obj.userData,P.jobWork])); }
  /* 舊的打工（早午餐）照舊不動 */
  { const b=TD('Y1S2',4,6); fresh(b,7,'wz_brunch',{}); hire('brunch',[6]); world(); JOBS.workOn(GM,'brunch'); check('A2. 舊的打工（早午餐）不在這一批：不動',P.jobWork==null&&!P.obj.userData.carryOff); }
  check('A2. 沒有圍裙模型：祐廷（char.yuting）身上沒有 apron 這個配件——只做站位＋藏包',(()=>{ const s=fs.readFileSync(path.join(H.ROOT,'src/character3d.js'),'utf8'), m=/'char\.yuting':\[([^\]]*)\]/.exec(s); return !!m&&!/apron/.test(m[1]); })());
});
/* ================= A3 上班時「排進行程」的提示先留著 ================= */
await sec('A3',async()=>{
  const d=TD('Y1S2',4,2); fresh(d,18,'tz_yuehaochi',{_planHint:1}); const got=[]; global.GAME=global.GAME||{}; const t0=GAME.toast, ti=GAME.titleIdle; GAME.toast=t=>{ got.push(t); }; GAME.titleIdle=false;
  try{ check('A3. 有 OUT.planFlush（修改前：沒有）',typeof OUT.planFlush==='function'); if(typeof OUT.planFlush!=='function') return;
    JOBS.running=true; OUT.plan(H.G,{id:'t_od',ev:'ev_x',day:d+2,h:19,place:'公館',title:'我們的日子：約在公館',travel:'',travelH:0});
    const held=got.length===0&&!!OUT.get(H.G,'t_od'); OUT.planFlush(H.G); const still=got.length===0;
    JOBS.running=false; OUT.planFlush(H.G);
    check('A3. 上班的時候排進來的（可昕「我們的日子」）：行程照排、提示不跳；下班以後補說一次（沒弄丟）——修改前：上班中就跳',held&&still&&got.length===1&&/我們的日子：約在公館/.test(got[0])&&/^排進行程：/.test(got[0]),J(got));
    OUT.planFlush(H.G); check('A3. 只補一次',got.length===1);
    got.length=0; at(d,18.5); OUT.plan(H.G,{id:'t_od2',ev:'ev_x',day:d+3,h:19,place:'公館',title:'我們的日子：溫州街'}); check('A3. 不在上班：照舊當下就說',got.length===1);
    got.length=0; JOBS.running=true; OUT.plan(H.G,{id:'t_od3',ev:'ev_x',day:d+4,h:19,title:'我們的日子：河濱'}); globalThis.LOADLOCKS['outings3d:planHeld'](); JOBS.running=false; OUT.planFlush(H.G);
    check('A3. 讀檔：留著的提示清掉（行程本身在存檔裡）',got.length===0&&!!OUT.get(H.G,'t_od3'));
  } finally { JOBS.running=false; GAME.toast=t0; GAME.titleIdle=ti; }
});
/* ================= B AA_828 第 8 節 ================= */
await sec('B',async()=>{
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===DOC8);
  check('B. 白名單：AA_828@'+SHA8+' approved（一筆）；上一版 '+PREV8+' 在 history',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA8&&(e[0].history||[]).some(h=>h.sha===PREV8),J(e.map(x=>x.sha)));
  check('B. 資料寫明來源那一版',!!D8&&D8.src===DOC8+'@'+SHA8,D8&&D8.src);
  let ck=''; try{ ck=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_shop_jobs_aa828.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(err){ ck='ERR '+String(err.stderr||err.message||err).slice(0,300); }
  if(/讀不到|fatal|invalid object|CalledProcessError/i.test(ck)) console.log('（跳過：匯入工具讀不到 '+SHA8+'，企劃線沒 fetch）'); else check('B. tools/story/import_shop_jobs_aa828.py --check：資料和稿一致',/^OK/.test(ck),ck);
  let doc=null; try{ doc=cp.execFileSync('git',['-C',H.ROOT,'show',SHA8+':'+DOC8],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ doc=null; }
  const C=D8.jobs.shanlan.co;
  if(doc){ check('B. 稿第 8 節的字：沒認識過她不出現在山嵐、「新來的？」那一版不演、家教回「不了」以後不再問',doc.includes('**沒認識過宋知寧的玩家，她不出現在山嵐。**')&&doc.includes('所以「新來的？」那一版不演，SHOP_ZN_MET 不用動。')&&doc.includes('家教：回「'+D8.reapply.tutorNo+'」以後**不再問**（只問一次）。')); }
  else console.log('（跳過：讀不到稿 '+SHA8+'）');
  check('B1／B2. 資料：co 沒有 new、newFrom（舊期望 1d6055568c：new＝「新來的？二樓我比較熟，找不到可以問我。」、newFrom 大一下——AA_828 第 8 節第 1、2 點作廢）；只剩 met 三句',C.new===undefined&&C.newFrom===undefined&&C.met.length===3&&C.met[0][1]==='……又是你。'&&C.flag==='SHOP_ZN_MET'&&C.msgN===5,J(C));
  check('B2. 遊戲的資料、程式裡都沒有「新來的？」那一句',!/新來的？二樓我比較熟/.test(fs.readFileSync(path.join(H.ROOT,'src/data/shop_jobs_aa828.js'),'utf8'))&&!/C\.new\b|newFrom\)/.test(fs.readFileSync(path.join(H.ROOT,'src/jobs3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'')));
  /* B1：沒認識過她，大一下、大二上的週日班都沒有她 */
  for(const term of ['Y1S2','Y2S1']){ const sun=TD(term,4,7); fresh(sun,13,'xs_shanlan',{}); hire('shanlan',[3,7]); const on=JOBS.znCoOn(H.G,sun); await shift('shanlan',sun);
    check('B1. 沒認識過宋知寧（沒有 SHOP_ZN_MET）、'+term+' 的週日班：她不在山嵐＝沒有那一句、不記、SHOP_ZN_MET 不動（舊期望：大一下起「新來的？…」）',on===false&&JOBS.rec(H.G)._meta.znCo==null&&!H.said.some(s=>s.who==='宋知寧'||s.who==='知寧'||/新來的|又是你/.test(s.t))&&H.G.flags.SHOP_ZN_MET==null&&J(JOBS.znCoLines(H.G))==='[]',J(L().slice(0,5))); }
  /* B2：認識過、傳過第 5 則＝「……又是你。」那一組照舊 */
  { const sun=TD('Y1S2',4,7); fresh(sun,13,'xs_shanlan',{SHOP_ZN_MET:true,SHOP_ZN_BK:{sent:[0,1,2,3,4],moved:sun-3}}); hire('shanlan',[3,7]); await shift('shanlan',sun);
    check('B2. 認識過、傳過第 5 則：只剩這一版——「……又是你。」三句照舊',JOBS.rec(H.G)._meta.znCo===sun&&said('……又是你。')&&said(C.met[2][1])&&!said('新來的？二樓我比較熟，找不到可以問我。'),J(L().slice(0,6))); }
  /* B5：家教 */
  { const U=WZ_JOBS_DATA.tutor, MX='classmate_mingxuan', stop=TD('Y1S2',8,3), s1=CALENDAR.termDays('Y2S1').from, s2=CALENDAR.termDays('Y2S2').from;
    const base=()=>({JOB_TUTOR:true,TUTOR_WD:2,TUTOR_N:4,tutorFromDay:TD('Y1S1',6,1),TUTOR_STOP:stop}), asks=re=>(H.G.msgs||[]).filter(m=>m.ask&&re.test(m.ask.id));
    const run=()=>{ JOBS.tutorPhone(H.G); PHONE.tick(H.G); JOBS.tutorPhone(H.G); PHONE.tick(H.G); };
    check('B5. 資料：reapply.tutorAskOnce、tutorNo＝原本那個選項「不了」',D8.reapply.tutorAskOnce===true&&D8.reapply.tutorNo===U.termOpts[1]&&typeof JOBS.tutorSaidNo==='function',J(D8.reapply));
    if(typeof JOBS.tutorSaidNo!=='function') return;
    /* 不是回「不了」停的：下一個學期開學問一次（照舊）*/
    fresh(s1,13,'dorm',base()); run(); const first=asks(/^tutor_re_Y2S1$/).length;
    /* 那一次回「不了」*/
    PHONE.answer(H.G,'tutor_re_Y2S1',1); run(); const no=H.G.flags.TUTOR_RE_NO;
    at(s2,13); run();
    check('B5. 不是回「不了」停的：下一個學期開學明軒問一次；那一次回「不了」＝記 TUTOR_RE_NO、之後的學期不再問（舊期望：下一個學期開學再問一次）',first===1&&no===s1&&JOBS.tutorSaidNo(H.G)===true&&asks(/^tutor_re_Y2S2$/).length===0&&H.G.flags.TUTOR_STOP===stop&&JOBS.at(H.G,'tutor')===null,J([first,no,asks(/^tutor_re_/).map(m=>m.ask.id)]));
    /* 開學那一則回「不了」停的：之後不再問 */
    fresh(s2,13,'dorm',Object.assign(base(),{TUTOR_STOP:s1,TUTOR_TERM_Y2S1:'stop'})); run();
    check('B5. 開學那一則回「不了」停的（TUTOR_TERM_Y2S1 stop）：下一個學期不再問（舊期望：隔一個學期再問一次）',JOBS.tutorSaidNo(H.G)===true&&asks(/^tutor_re_/).length===0&&JOBS.at(H.G,'tutor')===null,J(asks(/^tutor_re_/).map(m=>m.ask.id)));
    /* 回「來」照舊 */
    fresh(s1,13,'dorm',base()); run(); PHONE.answer(H.G,'tutor_re_Y2S1',0); run();
    check('B5. 回「來」照舊：又有家教、不記 TUTOR_RE_NO',H.G.flags.TUTOR_STOP==null&&H.G.flags.TUTOR_RE===1&&H.G.flags.TUTOR_RE_NO==null&&!!JOBS.at(H.G,'tutor'));
    fresh(s1,13,'dorm',base()); check('B5. 舊存檔（沒有 TUTOR_RE_NO）：照常讀、還沒回過「不了」',JOBS.tutorSaidNo(H.G)===false&&J(JSON.parse(J(H.G)))===J(H.G)); }
});
console.log(H.fails?'FAILED '+H.fails:'ALL PASS');
process.exit(H.fails?1:0);
})();
