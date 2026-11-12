// SHOP-JOBS-1112（2026-11-12；BB 在使用者電腦判 FAIL：YUE_SIS、SHIFT7_425 四次都一樣）：祐廷在越好吃上晚班、學姊照規則來吃飯——
//   她說「你在這裡。幾點下班？」那一刻，3D 裡她在 (−1.1, 2.05)、走路姿勢、obj.visible=false；講完、下班以後才看得到她坐著。朋友版、交往版都一樣。
//   原因：①帶進來的人從門口走去位子，那一句出來時還在半路 ②祐廷站櫃台後、鏡頭對著櫃台，門口和靠窗的桌子在鏡頭外——引擎每一格照視錐算 obj.visible（engine3d.js updateNPC）。
//   改法（src/jobs3d.js S.mealWalkIn／mealStand／mealSeat）：進門先走到祐廷面前（櫃台外的點餐點）；她那一句以前一定站好、面向祐廷、n.hidden=false；
//     還是不在鏡頭裡才切過肩鏡頭；「（你幫她點了餐。）」以後才去位子坐下。台詞一個字沒動。
// 這裡的 3D 是假的，但比第五～七輪的替身多三樣真的行為：E.moveTo 真的排路、每 10 ms 走一步（照 engine3d.js：走到才叫 onArrive）；
//   引擎那一段照同一條式子（vis＝!n.hidden＆在鏡頭的視錐裡）每一步重設 obj.visible；鏡頭＝跟隨鏡頭在祐廷的 +z 那一側往櫃台看（進店時的方向）。
// 修改前（src/jobs3d.js 6c2ecfc0af）：0～7 的「那一刻」各項 FAIL（她在半路／鏡頭外、visible=false）。
// 實際的鏡頭、走進來的樣子沒有在瀏覽器看過（排使用者電腦：cc_yue_meal_probe.py）。用法：node tests/yue_meal_visible_1112_unit.js
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
const DOC8='docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md', NOW8='33e9522155', OLD8='3e9cd7d9d4';   /* NOW8＝第 10 節那一版；OLD8＝上一版（第 9 節）*/
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

const SIS='heroine_05', MX='classmate_mingxuan', TERMS8=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
const isShiftWd=d=>{ const wd=CALENDAR.dateOf(d).wd%7; return wd===2||wd===4; };
const hireTerm=R=>hire('yue',[2,4],{since:R.from-30,from:(R.from-30)*24});
/* 這一天學姊照規則會不會來、來不來得了（真的 SHOPLIFE.yueDatePlan＋why）：'come'｜'blocked:<原因>'｜null（規則不成立）*/
const ruleDay=(G)=>{ const g=Object.assign({},G,{hour:18.5}), p=SHOPLIFE.yueDatePlan(g,SIS); if(!p) return null; const w=SHOPLIFE.why(Object.assign({},G,{hour:(p.t0+p.t1)/2}),CHARACTERS[SIS],p); return w?'blocked:'+w:'come'; };
/* 四年掃一遍（真的 SHOPLIFE／STORY／JOBS／CALENDAR）：祐廷整個學期在越好吃做週二、週四晚班；每一個有班的日子在開班前看 JOBS.mealAt（＝那一段會不會演她）；會＝照演過記一次（SHOPLIFE.yueDateMark）。
   回 {out:{學期:[日期…]}, why:{學期:{沒來的原因:幾天}}} */
const scan=(flags,o)=>{ o=o||{}; const out={}, why={}; let seen={};
  for(const term of TERMS8){ out[term]=[]; why[term]={}; const R=CALENDAR.termDays(term); if(!R) continue;
    for(let d=R.from;d<=R.to;d++){ if(!isShiftWd(d)) continue;
      fresh(d,17.4,'tz_yuehaochi',Object.assign({},flags,{SHOP_YUE_DATE:JSON.parse(J(seen))})); hireTerm(R); if(o.date) H.G.flags['dating_'+SIS]=true; SHOPLIFE._reset();
      if(!JOBS.due(H.G,'yue',d)){ why[term]['沒有班']=(why[term]['沒有班']|0)+1; continue; }
      const m=JOBS.mealAt(H.G,SIS);
      if(m){ at(d,m.hour,'tz_yuehaochi'); SHOPLIFE.yueDateMark(H.G,SIS); seen=JSON.parse(J(H.G.flags.SHOP_YUE_DATE)); out[term].push(key(d)); }
      else { const k=typeof SHOPLIFE.yueDatePlan==='function'?(ruleDay(H.G)||'規則不成立'):'沒有規則'; why[term][k]=(why[term][k]|0)+1; } } }
  return {out,why}; };


/* ---------- 比較像真的 3D：會走的路、照視錐算顯示、鏡頭 ---------- */
const CAM={x:0,z:0,dx:0,dz:-1};   /* 位置、往哪裡看（水平）；半視角 30° */
const inView=(x,z)=>{ const vx=x-CAM.x, vz=z-CAM.z, d=Math.hypot(vx,vz); if(d<0.15) return false; const c=(vx*CAM.dx+vz*CAM.dz)/d; return c>Math.cos(30*Math.PI/180); };
global.THREE.Vector3=class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } project(){ const ok=inView(this.x,this.z); this.x=ok?0:2; this.y=0; this.z=ok?0.5:2; return this; } };   /* S.mealInView 用（真的是投影到螢幕座標）*/
const cines=[]; let cineEnds=0, walking=true, blockStand=false, WHO2='', camAwayNow=false;
const enginePass=()=>{ for(const n of H.E.npcs){ if(!n||!n.obj) continue; n.obj.visible=!n.hidden&&inView(n.obj.position.x,n.obj.position.z); } };   /* engine3d.js updateNPC 那一行：只設 obj.visible 會被這裡蓋回去 */
const step=dt=>{ const E=H.E; if(walking) for(const n of E.npcs.slice()){ if(!n||!n.path) continue; let left=1.35*dt; while(n.path&&left>0){ const t=n.path[0], o=n.obj.position, dx=t[0]-o.x, dz=t[1]-o.z, d=Math.hypot(dx,dz);
      if(d<=left+1e-6){ o.x=t[0]; o.z=t[1]; left-=d; n.path.shift(); if(!n.path.length){ n.path=null; const f=n.onArrive; n.onArrive=null; if(f) f(n); } } else { o.x+=dx/d*left; o.z+=dz/d*left; left=0; n.pose='walk'; } } }
  enginePass(); };
const camFollow=(away)=>{ const p=H.E.player.obj.position; if(away){ CAM.x=p.x; CAM.z=p.z+1.2; CAM.dx=0; CAM.dz=-1; }   /* 鏡頭貼在祐廷前面往廚房看：櫃台外面都在鏡頭後面 */
  else { CAM.x=p.x; CAM.z=p.z+5; CAM.dx=0; CAM.dz=-1; } };   /* 跟隨鏡頭：祐廷的 +z 那一側 5 m、往櫃台（−z）看 */
const camFollowIfIdle=()=>{ if(cines.length>cineEnds) return; camFollow(camAwayNow); };
const world3=(o)=>{ o=o||{}; world(); const E=H.E; walking=o.walking!==false; blockStand=!!o.blockStand; cines.length=0; cineEnds=0;
  E.camera={fake:true}; E.moveTo=(n,x,z,f)=>{ n.path=[[x,z]]; n.onArrive=f||null; n.pose='walk'; return true; };
  E.canStand=(x,z)=>!blockStand&&Math.abs(x)<2.9&&z>-2.3&&z<4.4;   /* 櫃台（z −2.9～−2.35）後面是廚房；blockStand＝祐廷面前站不了人 */
  E.endCinematic=()=>{ cineEnds=cines.length; camFollow(camAwayNow); };
  GM.cine=(kind,A,B,opt)=>{ cines.push([kind,A===E.player.obj,B,opt&&opt.snap]); const a=A.position, b=B.position, d=Math.hypot(b.x-a.x,b.z-a.z)||1; CAM.dx=(b.x-a.x)/d; CAM.dz=(b.z-a.z)/d; CAM.x=a.x-CAM.dx*1.3; CAM.z=a.z-CAM.dz*1.3; }; };   /* 過肩：玩家背後往她看 */
/* 每一句說出來的那一刻記她的樣子（先讓引擎跑一格）*/
const shots=[]; { const s0=GM.say; GM.say=async function(who,t){ camFollowIfIdle(); enginePass(); const n=GM.npc[SIS]||GM.npc[WHO2]||null; shots.push({t:String(t),who:who&&who.charId||null,n:n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),vis:n.obj.visible!==false&&!n.hidden,hidden:!!n.hidden,seat:!!n.seat,pose:n.pose,path:!!n.path,yaw:n.obj.rotation.y}:null,px:H.E.player.obj.position.x,pz:H.E.player.obj.position.z,cine:cines.length}); return s0.apply(this,arguments); }; }
const timer=setInterval(()=>step(0.3),10);
const run3=async(d,o)=>{ o=o||{}; world3(o); clerkNPC(); SHOPLIFE._reset(); shots.length=0; snap.length=0; camAwayNow=!!o.camAway; if(o.pre) o.pre(); await shift('yue',d,P3); for(let i=0;i<40;i++) step(0.3); };
const ORDER_PT=YUE.points&&YUE.points.find(p=>p.id==='order')||{x:1,z:-1.75};
const inShop=q=>!!q&&Math.abs(q.x)<3&&q.z>-2.35&&q.z<4.5, atDoor=q=>!!q&&Math.hypot(q.x-YUE.spawn.x,q.z-YUE.spawn.z)<0.3;

(async()=>{
const Y=D8.yueMeal, LINE=Y.own['學姊'];
await sec('0',async()=>{
  check('0. 有 JOBS.mealWalkIn／mealStand／mealSeat／mealSpot／mealInView（修改前：沒有）',['mealWalkIn','mealStand','mealSeat','mealSpot','mealInView','mealNpc'].every(k=>typeof JOBS[k]==='function'));
  const strip=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  check('0. 台詞照舊只在匯入的資料裡（程式不自己寫字，D79）；那一組四句沒有變',!strip('src/jobs3d.js').includes(LINE)&&LINE==='你在這裡。幾點下班？'&&Y.narr==='（門口的鈴響了。進來的人看到你穿著圍裙，停了一下。）'&&Y.me==='對。要吃什麼？'&&Y.done.f==='（你幫她點了餐。）');
});
const A=scan({met_sis:true}), B=scan({met_sis:true},{date:true});
const at1=()=>{ const i=shots.findIndex(s=>s.t===LINE); return {i,narr:shots[i-1],her:shots[i],me:shots[i+1],done:shots[i+2]}; };
for(const [tag,flags,d0] of [['朋友版',{met_sis:true},A.out.Y1S2[0]],['交往版',{met_sis:true,['dating_'+SIS]:true},B.out.Y1S2[0]]]) await sec('1 '+tag,async()=>{
  const d=H.D(d0); fresh(d,17.4,'tz_yuehaochi',flags); hire('yue',[2,4]); await run3(d);
  const q=at1(), n=GM.npc[SIS], her=q.her&&q.her.n;
  check('1. '+tag+'：那一組演了（旁白 → 「你在這裡。幾點下班？」→ 祐廷 →（你幫她點了餐。））',q.i>0&&q.narr.t===Y.narr&&q.her.who===SIS&&q.me.t===Y.me&&q.done.t===Y.done.f,J(shots.map(s=>s.t).slice(0,10)));
  if(!(q.i>0)||!her){ check('1. '+tag+'：那一刻有她',false,J(q.her)); return; }
  check('1. '+tag+'：她說那一句的那一刻——n.hidden===false，引擎那一段跑過以後 obj.visible 還是 true（修改前：在鏡頭外＝false）',her.hidden===false&&her.vis===true,J(her));
  check('1. '+tag+'：那一刻她已經站在店裡、祐廷面前（櫃台外的點餐點），不是還在門口、不是在半路走（修改前：pose walk、還在走）',inShop(her)&&!atDoor(her)&&Math.hypot(her.x-ORDER_PT.x,her.z-ORDER_PT.z)<0.05&&her.pose==='idle'&&her.path===false&&her.seat===false,J(her));
  { const want=Math.atan2(q.her.px-her.x,q.her.pz-her.z); let dd=her.yaw-want; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); check('1. '+tag+'：面向祐廷（祐廷站在櫃台後）',Math.abs(dd)<0.01&&q.her.pz<-3,J([her.yaw,want,q.her.px,q.her.pz])); }
  check('1. '+tag+'：祐廷回話、「（你幫她點了餐。）」的時候她還站在那裡、看得到',[q.me,q.done].every(s=>s&&s.n&&s.n.vis===true&&s.n.seat===false&&Math.hypot(s.n.x-her.x,s.n.z-her.z)<0.01),J([q.me&&q.me.n,q.done&&q.done.n]));
  check('1. '+tag+'：人就在鏡頭裡＝不用切鏡頭（GM.cine 沒有叫）',cines.length===0,J(cines.map(c=>c[0])));
  check('1. '+tag+'：點完餐才走去位子坐下（原本留給她的那個位子）；下班以後她坐著',!!n&&!!n.seat&&!n.seatTarget&&!n.path&&YUE.seats.some(s=>Math.abs(s.x-n.seat.x)<1e-6&&Math.abs(s.z-n.seat.z)<1e-6)&&n.hidden===false,n&&J([n.seat,n.seatTarget,n.path]));
  check('1. '+tag+'：什麼都沒多寫進存檔；存檔 JSON 來回不壞',!/mealWalk|mealStand|"sp"|cine/.test(J(H.G))&&J(JSON.parse(J(H.G)))===J(H.G));
});
/* 交往中、同一個學期第二次來：只有旁白那一句——那一刻她也已經站在店裡、看得到 */
await sec('2',async()=>{ const b1=H.D(B.out.Y1S2[0]), b2=H.D(B.out.Y1S2[1]); fresh(b1,17.4,'tz_yuehaochi',{met_sis:true,['dating_'+SIS]:true}); hire('yue',[2,4]); await run3(b1); await run3(b2);
  const L=shots.filter(s=>s.t===Y.done.f), n=GM.npc[SIS];
  check('2. 交往中同一個學期第二次來：不再說那一句，只有「（你幫她點了餐。）」——那一刻她站在祐廷面前、看得到；之後去位子坐下',!shots.some(s=>s.t===LINE||s.t===Y.narr)&&L.length===1&&!!L[0].n&&L[0].n.vis===true&&L[0].n.hidden===false&&inShop(L[0].n)&&!atDoor(L[0].n)&&L[0].n.pose==='idle'&&!!n&&!!n.seat,J(L.map(s=>s.n)));
});
/* 走不到（路被擋、畫面沒在跑）：等不到也直接站好 */
await sec('3',async()=>{ const d=H.D(A.out.Y1S2[0]); fresh(d,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); const w0=JOBS.MEAL_WAIT; JOBS.MEAL_WAIT=0.3; const t0=Date.now();
  try{ await run3(d,{walking:false}); } finally { JOBS.MEAL_WAIT=w0; } const q=at1(), her=q.her&&q.her.n, ms=Date.now()-t0;
  check('3. 她一步都沒走成（路卡住）：那一句以前照樣站到祐廷面前、看得到（等最多 MEAL_WAIT 秒，不會卡住整段）',!!her&&her.vis===true&&her.hidden===false&&Math.hypot(her.x-ORDER_PT.x,her.z-ORDER_PT.z)<0.05&&her.pose==='idle'&&her.path===false&&ms<5000,J([her,ms]));
  check('3. 旁白出來的那一刻她在門口（剛進門）',!!q.narr&&!!q.narr.n&&atDoor(q.narr.n),J(q.narr&&q.narr.n));
});
/* 鏡頭被轉到看不到櫃台外面：切過肩鏡頭對著她，演完收回來 */
await sec('4',async()=>{ const d=H.D(A.out.Y1S2[0]); fresh(d,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); await run3(d,{camAway:true}); const q=at1(), her=q.her&&q.her.n, n=GM.npc[SIS];
  check('4. 鏡頭看不到祐廷面前：切過肩鏡頭（GM.cine \'ots\'，祐廷 → 她，直接切）一次；那一刻 obj.visible=true',cines.length===1&&cines[0][0]==='ots'&&cines[0][1]===true&&cines[0][2]===n.obj&&cines[0][3]===true&&!!her&&her.vis===true,J([cines.map(c=>[c[0],c[1],c[3]]),her]));
  check('4. 那一段演完鏡頭收回來（E.endCinematic）',cineEnds===1,String(cineEnds));
});
/* 祐廷面前站不了人：直接坐到位子上（不留在門口走）；位子在鏡頭外＝切鏡頭 */
await sec('5',async()=>{ const d=H.D(A.out.Y1S2[0]); fresh(d,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); await run3(d,{blockStand:true}); const q=at1(), her=q.her&&q.her.n;
  check('5. 祐廷面前站不了人：那一句以前她已經坐在位子上、看得到（位子在鏡頭外＝切過肩鏡頭）',!!her&&her.seat===true&&her.vis===true&&her.hidden===false&&her.path===false&&inShop(her)&&!atDoor(her),J([her,cines.length]));
});
/* 她早就照作息坐在店裡了（那一段演以前人已經在）：不搬她，只確認看得到 */
await sec('6',async()=>{ const d=H.D(A.out.Y1S2[0]); fresh(d,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); const seat=YUE.seats[0];
  await run3(d,{pre:()=>{ const n=GM.spawnCharacter(SIS,seat.x,seat.z,{seat:H.E.zone.seats[0],pose:'read'}); n.hidden=true; n.obj.visible=false; }}); const q=at1(), her=q.her&&q.her.n;
  check('6. 她已經坐在店裡：不搬（還坐在原位）、n.hidden 放開、那一刻看得到（坐在鏡頭外＝切過肩鏡頭對著她）',!!her&&her.seat===true&&Math.hypot(her.x-seat.x,her.z-seat.z)<0.01&&her.hidden===false&&her.vis===true,J([her,cines.length]));
});
/* 同一段路：其他來吃飯的人（共用句的同學、可昕）也一樣 */
await sec('7',async()=>{ let hit=null, who=null; for(const id of JOBS.yueMealIds()){ if(id===SIS) continue; const r=findDay(id); if(r){ hit=r; who=id; break; } }
  check('7. 找得到一位同學照名單在祐廷的班裡來吃飯',!!hit,who); if(!hit) return; WHO2=who; const d=hit.d; fresh(d,17.4,'tz_yuehaochi',{}); hire('yue',[2,4]); friend(who); await run3(d);
  const i=shots.findIndex(s=>s.t===Y.narr), her=i>=0&&shots[i+1]&&shots[i+1].n;
  check('7. 同學（'+who+'）說他那一句的那一刻：站在祐廷面前、看得到；之後去位子坐下',!!her&&shots[i+1].who===who&&her.vis===true&&her.hidden===false&&her.pose==='idle'&&her.path===false&&inShop(her)&&!atDoor(her)&&!!GM.npc[who]&&!!GM.npc[who].seat,J(her)); WHO2='';
});
clearInterval(timer);
console.log(H.fails?'FAILED '+H.fails:'ALL PASS');
process.exit(H.fails?1:0);
})();
