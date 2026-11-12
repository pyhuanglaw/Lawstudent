// SHOP-JOBS-1112 第七輪（2026-11-12；USER_WANTS X356）：AA_828 第 10 節「回 LAWWW-C 第六輪合併後六題」（企劃線 33e9522155）。不需要瀏覽器。
//   六題裡只有兩點改流程（其餘四點＝照第六輪，tests/shop_jobs_round6_1112_unit.js 照舊驗）：
//   1 學姊「你在這裡。幾點下班？」每學期說一次（每學期她第一次來那天）；同學期第二次來（交往中）只有進店坐下＋旁白。其他同學照舊每人一生一次。
//     存檔多 G.jobs.yue.mealHiT＝{人物: 上一次說的那個學期}；舊存檔 mealHi 裡已經有學姊＝當作讀進來那時候的學期說過。
//   5 家教「我現在可以接家教了。」一律掛在明軒那一串他最新的一則底下；他之後又傳訊息＝選項跟著移（一次只掛一個）；那一則有別的還開著的選項、或回過的選項＝不蓋掉，往前找。
// 修改前（開發分支 f3e19b8eca 的 src/jobs3d.js，其他檔照這一輪）：22 項 FAIL——1「下一個學期第一次來再說一次」「舊存檔」「mealHiT」那幾項、5「之後又傳訊息跟著移」「一開始就掛最新一則」「過期的那一組放回去」「兩個剩一個」「第六輪的存檔」那幾項；0 的白名單／來源在白名單換版本以前 FAIL。
// 學姊走進店裡的樣子、手機上那個選項實際的位置沒有在瀏覽器看過（排使用者電腦）。用法：node tests/shop_jobs_round7_1112_unit.js
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

(async()=>{
/* ================= 0 白名單、資料、對稿 ================= */
await sec('0',async()=>{
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===DOC8);
  check('0. 白名單：AA_828@'+NOW8+' approved（一筆）；上一版 '+OLD8+' 在 history；approvedBy 有「第 10 節回六題」（修改前：白名單還是 '+OLD8+'）',e.length===1&&e[0].status==='approved'&&e[0].sha===NOW8&&(e[0].history||[]).some(h=>h.sha===OLD8)&&/AA-C 11-12 11:4x：第 10 節回六題/.test(e[0].approvedBy||''),J(e.map(x=>x.sha)));
  check('0. 資料寫明來源那一版',!!D8&&D8.src===DOC8+'@'+NOW8,D8&&D8.src);
  let ck=''; try{ ck=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_shop_jobs_aa828.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(err){ ck='ERR '+String(err.stderr||err.message||err).slice(0,300); }
  if(/讀不到|fatal|invalid object|CalledProcessError/i.test(ck)) console.log('（跳過：匯入工具讀不到 '+NOW8+'，企劃線沒 fetch）'); else check('0. tools/story/import_shop_jobs_aa828.py --check：資料和稿一致',/^OK/.test(ck),ck.slice(0,120));
  const B=D8.reapply.tutorBack, Z=D8.yueMeal.sis;
  check('0. 資料沒有變（第 10 節只有說明）：yueMeal.sis、reapply.tutorBack、學姊那一句照第六輪',J(Z)===J({who:'學姊',met:'met_sis',inTaiwan:true,slot:'dinner',termMax:1,datingMax:2,gapWeeks:3})&&J(B)===J({opt:'我現在可以接家教了。',re:'好，剛好還有一個學生。時間我傳給你。',expired:true})&&D8.yueMeal.own['學姊']==='你在這裡。幾點下班？',J([Z,B]));
  const raw=sha=>{ try{ return (cp.__worldEf||cp.execFileSync).call(cp,'git',['-C',H.ROOT,'show',sha+':'+DOC8],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ return null; } }, r1=raw(NOW8), r0=raw(OLD8);   /* 原文（不經 tests/alison.js 換字）*/
  if(r1){ const q=r1.slice(r1.indexOf('## 10. 回 LAWWW'));
    check('0. 稿第 10 節六點逐句在：第 1 點（每學期說一次）、第 5 點（一律掛最新一則）；第 2、3、4、6 點（照原本）',r1.includes('## 10. 回 LAWWW')
      &&q.includes('1. 學姊「'+D8.yueMeal.own['學姊']+'」**每學期說一次**（每學期她第一次來那天）；同學期第二次來（交往中）只有進店坐下＋旁白。')
      &&q.includes('5. 那個選項**一律掛在明軒那一串最新一則底下**，不用往回捲。')
      &&q.includes('2. 她這學期的次數用完以後，不再照晚餐名單亂數來越好吃：對。')&&q.includes('3. 「她人在臺灣」用當天判斷，大四上實際 0 次：確認。')
      &&q.includes('4. 開學那一則「這學期還來嗎」沒回、過期的，也給「'+B.opt+'」：可以。')&&q.includes('6. 「先停」（連續三週沒去）不算回「不了」，下學期明軒照舊先問一次：維持。'));
    if(r0){ const p0=r0.replace(/\n+$/,''); check('0. 第 1～9 節和上一版（'+OLD8+'）一字不差：只多第 10 節',r1.startsWith(p0)&&r1.slice(p0.length).trim().startsWith('## 10. 回 LAWWW')); } }
  else console.log('（跳過：讀不到稿 '+NOW8+'）');
  const strip=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,''), code=strip('src/jobs3d.js')+strip('src/shoplife3d.js');
  check('0. 那三句只在匯入的資料裡，程式不自己寫字（D79）',!!B&&!code.includes(B.opt)&&!code.includes(B.re)&&!code.includes(D8.yueMeal.own['學姊']));
});
/* ================= 1 學姊那一組：每學期說一次 ================= */
await sec('1',async()=>{
  const Y=D8.yueMeal, LINE=Y.own['學姊'];
  check('1. 有 JOBS.yueHiT／termNear（修改前：沒有）',typeof JOBS.yueHiT==='function'&&typeof JOBS.termNear==='function');
  const A=scan({met_sis:true}), B=scan({met_sis:true},{date:true});
  const stage=()=>{ world(); clerkNPC(); SHOPLIFE._reset(); snap.length=0; };
  const run=async d=>{ stage(); await shift('yue',d,P3); };
  /* 整組＝旁白 → 她那一句（人在店裡）→ 祐廷 →（你幫她點了餐。）；只有旁白＝只有最後那一句、她人在店裡坐著 */
  const full=()=>{ const i=snap.findIndex(s=>s.t===Y.narr); return i>=0&&snap[i+1].t===LINE&&snap[i+1].who===SIS&&snap[i+1].npcs.includes(SIS)&&snap[i+2].t===Y.me&&snap[i+3].t===Y.done.f&&snap.filter(s=>s.t===LINE).length===1; };
  const quiet=()=>{ const L=snap.filter(s=>s.t===Y.done.f), n=GM.npc[SIS]; return !snap.some(s=>s.t===LINE||s.t===Y.narr||s.t===Y.me)&&L.length===1&&L[0].npcs.includes(SIS)&&!!n&&!!n.seat; };
  const head=()=>J(snap.map(s=>s.t).filter(t=>[Y.narr,LINE,Y.me,Y.done.f,Y.done.m].includes(t)));
  const yj=()=>JOBS.job(H.G,'yue');
  /* 沒交往：每學期一次，每一次都是那個學期的第一次 */
  { const a1=H.D(A.out.Y1S2[0]), a2=H.D(A.out.Y2S1[0]), a3=H.D(A.out.Y2S2[0]);
    fresh(a1,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); await run(a1); const f1=full(), t1=J(yj().mealHiT);
    await run(a2); const f2=full(), h2=head(), t2=J(yj().mealHiT);
    await run(a3); const f3=full();
    check('1. 大一下第一次來：整組演（旁白 → 「你在這裡。幾點下班？」→ 祐廷 →（你幫她點了餐。））；記這個學期（mealHiT）',f1&&t1===J({[SIS]:'Y1S2'}),t1);
    check('1. 下一個學期（大二上）她第一次來：整組再演一次（修改前：一生一次——只有「（你幫她點了餐。）」）',f2&&t2===J({[SIS]:'Y2S1'}),h2+' '+t2);
    check('1. 再下一個學期（大二下）第一次來：又演一次；來過的日子三個學期各一筆',f3&&J(yj().mealHiT)===J({[SIS]:'Y2S2'})&&J(H.G.flags.SHOP_YUE_DATE)===J({[SIS+'|Y1S2']:[a1],[SIS+'|Y2S1']:[a2],[SIS+'|Y2S2']:[a3]}),J(H.G.flags.SHOP_YUE_DATE));
    check('1. mealHi 照舊也記著她（一筆，不重複）；存檔 JSON 來回不壞',yj().mealHi.filter(x=>x===SIS).length===1&&J(JSON.parse(J(H.G)))===J(H.G),J(yj().mealHi)); }
  /* 交往中：同一個學期兩次——第一次整組、第二次只有進店坐下＋旁白；下一個學期第一次又整組 */
  { const b1=H.D(B.out.Y1S2[0]), b2=H.D(B.out.Y1S2[1]), b3=H.D(B.out.Y2S1[0]);
    fresh(b1,17.4,'tz_yuehaochi',{met_sis:true,['dating_'+SIS]:true}); hire('yue',[2,4]); await run(b1); const f1=full();
    await run(b2); const q2=quiet(), h2=head(), seen=J(H.G.flags.SHOP_YUE_DATE);
    await run(b3); const f3=full();
    check('1. 交往中、同一個學期第二次來（隔三週以上）：她照樣走進店裡坐下，只有「（你幫她點了餐。）」，不再說那一句；這一次也算來過',f1&&q2&&seen===J({[SIS+'|Y1S2']:[b1,b2]})&&b2-b1>=21,h2+' '+seen);
    check('1. 交往中、下一個學期第一次來：整組再演一次',f3&&J(yj().mealHiT)===J({[SIS]:'Y2S1'}),head()); }
  /* 帶不進店裡：不演、不記學期；下一個有班的日子她來了才說 */
  { const a1=H.D(A.out.Y1S2[0]); let n1=a1+1; while(!isShiftWd(n1)) n1++;
    fresh(a1,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); world(); H.E.zone.seats=[]; SHOPLIFE._reset(); snap.length=0; await shift('yue',a1,P3);
    const none=!snap.some(s=>s.t===LINE||s.t===Y.done.f)&&!(yj().mealHiT&&yj().mealHiT[SIS])&&!H.G.flags.SHOP_YUE_DATE;
    let said2='skip'; at(n1,17.4,'tz_yuehaochi'); SHOPLIFE._reset(); if(JOBS.due(H.G,'yue',n1)&&JOBS.mealAt(H.G,SIS)){ await run(n1); said2=full(); }
    check('1. 她帶不進店裡（沒有位子）：整段不演、不記這個學期說過；下一個有班的日子她來了＝整組演',none&&(said2==='skip'||said2===true),J([none,said2])); }
  /* 其他同學照舊每人一生一次 */
  { let z=null, who=null; for(const id of JOBS.yueMealIds()){ if(id==='kexin'||id===SIS) continue; const r=findDay(id); if(r){ z=r; who=id; break; } }
    check('1. 找得到一位其他同學、一天：照真的名單在祐廷越好吃的班裡來吃飯',!!z,who);
    if(z){ const c=CHARACTERS[who], own=JOBS.yueOwn(c)||Y.ask, dn=Y.done[c.gender==='f'?'f':'m'];
      fresh(z.d,17.4,'tz_yuehaochi',{}); hire('yue',[2,4]); friend(who); stage(); await shift('yue',z.d,P3);
      const i=snap.findIndex(s=>s.t===Y.narr), first=i>=0&&snap[i+1].t===own&&snap[i+1].who===who&&snap[i+3].t===dn&&yj().mealHi.includes(who)&&!(who in (yj().mealHiT||{}));
      fresh(z.d,17.4,'tz_yuehaochi',{}); hire('yue',[2,4],{mealHi:[who],mealHiT:{}}); friend(who); stage(); await shift('yue',z.d,P3);
      const again=!snap.some(s=>s.t===own||s.t===Y.narr)&&snap.filter(s=>s.t===dn).length===1&&J(yj().mealHiT)===J({});
      fresh(z.d,17.4,'tz_yuehaochi',{}); hire('yue',[2,4],{mealHi:[who],mealHiT:{[who]:'Y1S1'}}); friend(who); stage(); await shift('yue',z.d,P3);
      const still=!snap.some(s=>s.t===own||s.t===Y.narr)&&snap.filter(s=>s.t===dn).length===1;
      check('1. 其他同學（'+who+'）照舊每人一生一次：第一次整組、不記學期；以前說過的（不管哪一個學期、mealHiT 寫了什麼）再來只有「（你幫他／她點了餐。）」',first&&again&&still,J([first,again,still])); } }
  { const KXF={dating_kexin:true}, k=findDay('kexin',KXF); check('1. 找得到可昕（交往中）來吃飯的一天',!!k); if(k){
      fresh(k.d,17.4,'tz_yuehaochi',KXF); hire('yue',[2,4],{mealHi:['kexin']}); friend('kexin'); stage(); await shift('yue',k.d,P3);
      check('1. 可昕照舊一生一次：以前說過、換了學期再來只有旁白（不照學期算）',!snap.some(s=>s.t===Y.own['可昕']||s.t===Y.narr)&&snap.filter(s=>s.t===Y.done.f).length===1&&!(yj().mealHiT&&yj().mealHiT.kexin),head()); } }
  /* 舊存檔 */
  { const b1=H.D(B.out.Y1S2[0]), b2=H.D(B.out.Y1S2[1]), a1=H.D(A.out.Y1S2[0]), a2=H.D(A.out.Y2S1[0]), load=()=>{ H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); };
    /* 第六輪存的：學姊在 mealHi、沒有 mealHiT；同一個學期讀進來 */
    fresh(b2,9,'dorm',{met_sis:true,['dating_'+SIS]:true,SHOP_YUE_DATE:{[SIS+'|Y1S2']:[b1]}}); hire('yue',[2,4],{mealHi:[SIS]}); load(); let err=''; try{ JOBS.phone(H.G); }catch(e){ err=String(e&&e.message||e); }
    const m1=J(yj().mealHiT); await run(b2);
    check('1. 舊存檔（mealHi 已經有學姊、沒有 mealHiT）：讀進來跑一次手機規則就記成這個學期說過；同一個學期她再來只有旁白',err===''&&m1===J({[SIS]:'Y1S2'})&&quiet(),err+m1+' '+head());
    /* 同一份舊存檔在大一下讀進來，玩到大二上：照新規則再說一次 */
    fresh(a1+1,9,'dorm',{met_sis:true,SHOP_YUE_DATE:{[SIS+'|Y1S2']:[a1]}}); hire('yue',[2,4],{mealHi:[SIS]}); load(); JOBS.phone(H.G); await run(a2);
    check('1. 那一份舊存檔玩到下一個學期：她第一次來整組再演一次',full()&&J(yj().mealHiT)===J({[SIS]:'Y2S1'}),head());
    /* 暑假讀進來＝算前一個學期 */
    { const v=CALENDAR.termDays('Y1S2').to+10; fresh(v,9,'dorm',{met_sis:true}); hire('yue',[2,4],{mealHi:[SIS]}); load(); JOBS.phone(H.G);
      check('1. 舊存檔在暑假讀進來：算前一個學期（大一下）說過',!CALENDAR.termOf(v)&&J(yj().mealHiT)===J({[SIS]:'Y1S2'}),J(yj().mealHiT)); }
    /* 手機規則還沒跑就上班（不知道是哪個學期）＝當作現在這個學期說過 */
    fresh(a2,17.4,'tz_yuehaochi',{met_sis:true,SHOP_YUE_DATE:{[SIS+'|Y1S2']:[a1]}}); hire('yue',[2,4],{mealHi:[SIS]}); await run(a2);
    check('1. 舊存檔、還沒記學期就遇到她來：當作現在這個學期說過（只有旁白），之後照學期算',quiet()&&J(yj().mealHiT)===J({[SIS]:'Y2S1'}),head());
    /* 壞掉的值、沒有 mealHi、沒有這份工作 */
    fresh(a1,9,'dorm',{met_sis:true}); const j=hire('yue',[2,4],{mealHiT:['x']}); JOBS.phone(H.G); const g0=J(JOBS.yueHiT(H.G,j)); delete j.mealHi; j.mealHiT='x'; const r=JOBS.yueHiT(H.G,j);
    fresh(a1,9,'dorm',{met_sis:true}); let err2=''; try{ JOBS.phone(H.G); JOBS.yueHiT(H.G,null); }catch(e){ err2=String(e&&e.message||e); }
    check('1. mealHiT 不是物件＝當作空的；沒有 mealHi、沒有越好吃這份工作：不丟例外、不多寫東西',g0==='{}'&&J(r)==='{}'&&err2===''&&!(H.G.jobs&&H.G.jobs.yue),J([g0,r,err2])); }
  /* 再應徵：帶到新的一份 */
  { const a1=H.D(A.out.Y1S2[0]); fresh(a1,10,'tz_yuehaochi',{met_sis:true}); const old=hire('yue',[2,4],{mealHi:[SIS,'zhe'],mealHiT:{[SIS]:'Y1S2'},gone:'quit',quit:a1-1,shifts:3}); H.picks=[0]; const ok=await JOBS.apply(GM,'yue'), j=yj();
    check('1. 辭職以後再應徵：mealHiT 和 mealHi 一樣帶到新的一份',ok===true&&j!==old&&!j.gone&&J(j.mealHiT)===J({[SIS]:'Y1S2'})&&J(j.mealHi)===J([SIS,'zhe']),J([ok,j&&j.mealHiT])); }
});
/* ================= 5 家教那個選項掛最新一則 ================= */
await sec('5',async()=>{
  const U=WZ_JOBS_DATA.tutor, B=D8.reapply.tutorBack||{}, stop=TD('Y1S2',8,3), y1s2=CALENDAR.termDays('Y1S2').from, s1=CALENDAR.termDays('Y2S1').from, s2=CALENDAR.termDays('Y2S2').from, kk=JOBS.tutorKK(), TH='p:'+MX;
  const took=()=>({JOB_TUTOR:true,TUTOR_WD:2,TUTOR_N:4,tutorFromDay:TD('Y1S1',6,1)}), base=()=>Object.assign(took(),{TUTOR_STOP:stop}), saidNo=()=>Object.assign(base(),{TUTOR_STOP:y1s2,TUTOR_TERM_Y1S2:'stop'});
  const run=()=>{ JOBS.tutorPhone(H.G); PHONE.tick(H.G); JOBS.tutorPhone(H.G); PHONE.tick(H.G); };
  const open=()=>(H.G.msgs||[]).filter(m=>m.ask&&/^tutor_back_/.test(m.ask.id)&&PHONE.askOpen(H.G,m)), mx=()=>(H.G.msgs||[]).filter(m=>m.th===TH);
  const post=(t,o)=>PHONE.post(H.G,Object.assign({th:TH,from:MX,text:t},o||{})), me=t=>PHONE.post(H.G,{th:TH,from:'player',who:null,text:t});
  const T1='（測試用：明軒後來傳的第一則）', T2='（測試用：明軒後來傳的第二則）', T0='（測試用：以前的訊息）', TQ='（測試用：有選項的訊息）', TM='（測試用：祐廷傳的）';
  check('5. 有 JOBS.tutorBackSpot（修改前：沒有）',typeof JOBS.tutorBackSpot==='function');
  /* a 掛上去以後明軒又傳訊息＝跟著移 */
  { fresh(y1s2,13,'dorm',took()); run(); PHONE.answer(H.G,'tutor_term_Y1S2',1); run(); at(s1,13); run(); const o0=open(), first=o0[0], id0=first&&first.ask.id, until0=first&&first.ask.until, txt0=first&&first.text;
    at(s1+3,10); post(T1); run(); const o1=open();
    check('5. 回「不了」、下一個學期開學：掛在明軒最新的一則（這時候＝他回的那一句）；他之後又傳一則＝選項移到新的那一則、舊那一則的拿掉、一次只掛一個（修改前：留在舊那一則，要往回捲）',o0.length===1&&txt0===U.stopReply&&o1.length===1&&o1[0].text===T1&&!first.ask&&o1[0]===mx()[mx().length-1],J([txt0,o1.map(q=>q.text),!!(first&&first.ask)]));
    check('5. 移過去的是同一個選項：id、期限（會考前）、字都一樣',o1.length===1&&o1[0].ask.id===id0&&o1[0].ask.until===until0&&(kk==null||until0===kk*24)&&J(o1[0].ask.opts.map(q=>q.t))===J([B.opt]),J([id0,o1[0]&&o1[0].ask.id]));
    at(s1+5,10); post(T2); run(); const o2=open(); run(); run();
    check('5. 再傳一則＝再移一次；多跑幾次不會多掛；手機那一串「待回覆」一直是 1',o2.length===1&&o2[0].text===T2&&open().length===1&&open()[0].text===T2&&PHONE.threads(H.G).find(t=>t.th===TH).pending===1&&!mx().some(m=>m.ask&&m.text===T1),J(open().map(q=>q.text)));
    const sv=JSON.parse(J(H.G)); check('5. 存檔 JSON 來回不壞、沒有多旗標',J(sv)===J(H.G)&&!Object.keys(H.G.flags).some(k=>/TUTOR_BACK/.test(k)));
    H.G=sv; SOCIAL.bind(H.G); run(); const o3=open(), n0=mx().length, r=PHONE.answer(H.G,o3[0].ask.id,0); run(); const L=mx().slice(n0).map(q=>[q.from,q.text]);
    check('5. 讀檔以後照樣回得了：祐廷那一句 → 明軒回的那一句；照回「來」那條路接回來；回了以後不再掛（也不掛到他新回的那一則）',o3.length===1&&o3[0].text===T2&&!!r&&J(L)===J([['player',B.opt],[MX,B.re]])&&H.G.flags.TUTOR_STOP==null&&H.G.flags.TUTOR_TERM_Y2S1==='go'&&!!JOBS.at(H.G,'tutor')&&open().length===0,J(L)); }
  /* b 一開始就有比「那一則家教的對話」更新的訊息 */
  { fresh(s1-20,13,'dorm',saidNo()); post(U.stopReply); at(s1-5,13); post(T1); at(s1,13); run(); const o=open();
    check('5. 那一則家教的對話後面明軒還傳過別的：一開始就掛在他最新的一則（修改前：掛在「好，我跟家長說。…」那一則）',o.length===1&&o[0].text===T1&&!mx().find(m=>m.text===U.stopReply).ask,J(o.map(q=>q.text))); }
  /* c 最新一則有別的還開著的選項＝不蓋掉 */
  { fresh(s1-20,13,'dorm',saidNo()); post(T0); at(s1,13); const q=post(TQ,{ask:{id:'sj7_other',opts:[{t:'（測試：甲）',post:false},{t:'（測試：乙）',post:false}]}}); run(); const o=open();
    check('5. 明軒最新一則有別的還開著的選項：不蓋掉——掛在他前一則沒有選項的訊息；那一組還回得了',o.length===1&&o[0].text===T0&&q.ask.id==='sj7_other'&&PHONE.askOpen(H.G,q)&&q.ask.opts.length===2,J(o.map(m=>m.text)));
    PHONE.answer(H.G,'sj7_other',0); run(); const o2=open();
    check('5. 那一組回了以後（回過的也不蓋）：選項留在原地；那一則還是原本的選項、記著回了哪一個',o2.length===1&&o2[0].text===T0&&q.ask.id==='sj7_other'&&q.ans===0,J(o2.map(m=>m.text)));
    at(s1+2,10); post(T1); run(); check('5. 之後他傳了沒有選項的新訊息：移過去',open().length===1&&open()[0].text===T1&&q.ask.id==='sj7_other'); }
  /* d 最新一則的選項過期沒回＝換成這一個；移走的時候放回去 */
  { fresh(s1-20,13,'dorm',saidNo()); post(T0); const q=post(TQ,{ask:{id:'sj7_old',until:(s1-19)*24,opts:[{t:'（測試：甲）'}]}}); at(s1,13); run(); const o=open();
    check('5. 明軒最新一則的選項過期沒回：換成這一個（同原本的後備做法）；原本那一組收著（ask.was）',o.length===1&&o[0]===q&&!!q.ask.was&&q.ask.was.id==='sj7_old'&&PHONE.byAsk(H.G,'sj7_old')===null,J(o.map(m=>m.text)));
    const sv=JSON.parse(J(H.G)); H.G=sv; SOCIAL.bind(H.G); at(s1+2,10); post(T1); run(); const q2=mx().find(m=>m.text===TQ), o2=open();
    check('5. 存讀檔以後他又傳一則：選項移走，原本過期的那一組放回那一則（不是開著的）；新的那一則上沒有 was',o2.length===1&&o2[0].text===T1&&!o2[0].ask.was&&!!q2.ask&&q2.ask.id==='sj7_old'&&!q2.ask.was&&!PHONE.askOpen(H.G,q2),J([o2.map(m=>m.text),q2.ask&&q2.ask.id])); }
  /* 再問的那一則過期（第六輪第 3 點）：掛在那一則；移走以後那一則還原，明軒也不會再問一次 */
  { fresh(s1,13,'dorm',base()); run(); at(s2,13); run(); const o=open(), re=o[0];
    at(s2+2,10); post(T1); run(); const o2=open(), again=(H.G.msgs||[]).filter(m=>m.ask&&/^tutor_re_Y2S2$/.test(m.ask.id)).length;
    check('5. 再問的那一則沒回過期：先掛在那一則（他最新的一則）；他又傳訊息＝移走、那一則還原成過期的「來／不了」；不會因此再問一次',o.length===1&&re.text===U.termAsk&&o2.length===1&&o2[0].text===T1&&!!re.ask&&re.ask.id==='tutor_re_Y2S1'&&!PHONE.askOpen(H.G,re)&&again===0,J([o.map(m=>m.text),o2.map(m=>m.text),re.ask&&re.ask.id,again])); }
  /* e 祐廷自己傳的、置頂、旁白、約你的那一則：不掛 */
  { fresh(s1-20,13,'dorm',saidNo()); post(T0); at(s1,13); me(TM); run(); const o=open();
    check('5. 最新一則是祐廷自己傳的：掛在明軒最新的那一則（不掛在自己的訊息上）',o.length===1&&o[0].text===T0&&o[0].from===MX,J(o.map(m=>m.text)));
    at(s1+1,10); post('（測試用：置頂）',{pin:true}); post('（測試用：旁白）',{narr:true}); const iv=post('（測試用：約你）'); iv.iv='sj7_iv'; run();
    check('5. 之後的置頂、旁白、約你的那一則（有自己的按鈕）都不掛：留在原地',open().length===1&&open()[0].text===T0,J(open().map(m=>m.text)));
    at(s1+2,10); post(T1); run(); check('5. 再來一則普通訊息：移過去',open().length===1&&open()[0].text===T1); }
  /* f 找不到可以掛的 */
  { fresh(s1,13,'dorm',saidNo()); H.G.msgs=[]; const q=post(TQ,{ask:{id:'sj7_only',opts:[{t:'（測試：甲）',post:false}]}}); let threw=false; try{ run(); }catch(e){ threw=true; }
    const none=open().length===0&&q.ask.id==='sj7_only'; post(T1); run();
    check('5. 明軒那一串只有一則、上面有別的還開著的選項：先不掛、不丟例外、不動那一組；他有新訊息就掛上',!threw&&none&&open().length===1&&open()[0].text===T1,J([threw,none])); }
  /* g 兩個＝剩一個 */
  { fresh(s1,13,'dorm',saidNo()); const a=post(T0), b=post(T1), mk=()=>({id:'tutor_back_'+s1,opts:[{t:B.opt,say:[{th:TH,from:MX,text:B.re}],set:{TUTOR_RE_ANS:'go'}}]}); a.ask=mk(); b.ask=mk(); run();
    check('5. 不知道為什麼掛了兩個：剩一個，在最新一則',open().length===1&&open()[0]===b&&!a.ask,J(open().map(m=>m.text))); }
  /* h 第六輪的存檔：選項掛在上面那一則，讀進來就移到最新一則 */
  { fresh(s1+10,13,'dorm',saidNo()); const a=post(U.stopReply); a.ask={id:'tutor_back_'+s1,opts:[{t:B.opt,say:[{th:TH,from:MX,text:B.re}],set:{TUTOR_RE_ANS:'go'}}]}; if(kk!=null) a.ask.until=kk*24; post(T1); post(T2);
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); run(); const o=open();
    check('5. 第六輪的存檔（選項掛在「好，我跟家長說。…」、後面還有兩則）：讀進來下一次就移到最新一則，id 不變',o.length===1&&o[0].text===T2&&o[0].ask.id==='tutor_back_'+s1&&!mx().find(m=>m.text===U.stopReply).ask,J(o.map(m=>m.text))); }
  /* i 掛著的那一則被刪（超過 200 則）、整串沒了 */
  { fresh(s1,13,'dorm',saidNo()); post(T0); at(s1,13.5); post(T1); run(); const o=open(), t0=o.map(m=>m.text); H.G.msgs=H.G.msgs.filter(m=>m!==o[0]); run(); const o2=open(), t2=o2.map(m=>m.text); H.G.msgs=[]; let threw=false; try{ run(); }catch(e){ threw=true; }
    check('5. 掛著的那一則被刪（訊息超過 200 則）：下一次掛在剩下最新的一則；整串都沒了＝不掛、不丟例外',J(t0)===J([T1])&&J(t2)===J([T0])&&!threw&&open().length===0,J([t0,t2,threw])); }
  /* 不該掛的時候照舊不掛（第六輪的條件沒動）*/
  { fresh(s1,13,'dorm',base()); post(T0); run(); const asked=(H.G.msgs||[]).some(m=>m.ask&&m.ask.id==='tutor_re_Y2S1'), o1=open().length;
    fresh(s1+20,13,'dorm',Object.assign(took(),{TUTOR_TERM_Y1S2:'go',TUTOR_TERM_Y2S1:'go'})); post(T0); run(); const on=open().length;
    fresh(y1s2+30,13,'dorm',saidNo()); post(U.stopReply); run();
    check('5. 第 6 點照舊：「先停」（不是回「不了」）下學期明軒先問一次、那一則開著不掛；還在做的不掛；回「不了」的同一個學期不掛',asked&&o1===0&&on===0&&open().length===0,J([asked,o1,on,open().length])); }
});
console.log(H.fails?'FAILED '+H.fails:'ALL PASS');
process.exit(H.fails?1:0);
})();
