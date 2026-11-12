// SHOP-JOBS-1112 第六輪（2026-11-12；USER_WANTS X356）：AA_828 第 9 節「回 LAWWW-C 第五輪四問」（企劃線 3e9cd7d9d4）。不需要瀏覽器。
//   1 學姊來越好吃「你在這裡。幾點下班？」不走晚餐名單的亂數：認識她、她人在臺灣、祐廷在越好吃有蓋到晚餐的班——每學期第一次符合的那一天；交往中一學期兩次、隔至少三週（資料 yueMeal.sis；SHOPLIFE.yueDatePlan）。
//   2 家教回「不了」以後：下一個學期開學起，明軒那一串那一則家教的對話底下多一個回覆選項「我現在可以接家教了。」→ 明軒回一句 → 照回「來」那條路（資料 reapply.tutorBack；JOBS.tutorBack）。
//   3 再問的那一則沒回、過期：也算問過、不再問，一樣用第 2 點的選項；開學那一則沒回過期的也一樣。
//   4 帶不進店裡＝整段不演、不記：AA 同意，照第五輪（這裡多驗學姊：不算次數，下一個有班的日子再來）。
// 修改前（開發分支 3e5da8ac04）：0 白名單／資料、1 全部（沒有 SHOPLIFE.yueDatePlan／yueRule；學姊只有照名單亂數）、2 全部（沒有 JOBS.tutorBack）、3「下一個學期不再問」（舊：下一個學期又問一次）都 FAIL；4 學姊那一項 FAIL。
// 學姊走進店裡的樣子、手機上那個選項的位置沒有在瀏覽器看過（排使用者電腦）。用法：node tests/shop_jobs_round6_1112_unit.js [--scan]（--scan＝印四年每個學期學姊哪幾天來）
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
const DOC8='docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md', SHA8='3e9cd7d9d4', PREV8='1e539b8eb9';
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
  check('0. 白名單：AA_828@'+SHA8+' approved（一筆）；上一版 '+PREV8+' 在 history（修改前：白名單還是 '+PREV8+'）',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA8&&(e[0].history||[]).some(h=>h.sha===PREV8),J(e.map(x=>x.sha)));
  check('0. 資料寫明來源那一版',!!D8&&D8.src===DOC8+'@'+SHA8,D8&&D8.src);
  let ck=''; try{ ck=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_shop_jobs_aa828.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(err){ ck='ERR '+String(err.stderr||err.message||err).slice(0,300); }
  if(/讀不到|fatal|invalid object|CalledProcessError/i.test(ck)) console.log('（跳過：匯入工具讀不到 '+SHA8+'，企劃線沒 fetch）'); else check('0. tools/story/import_shop_jobs_aa828.py --check：資料和稿一致',/^OK/.test(ck),ck);
  const show=sha=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'show',sha+':'+DOC8],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ return null; } };
  const doc=show(SHA8);
  const B=D8.reapply.tutorBack, Z=D8.yueMeal.sis;
  check('0. 資料：yueMeal.sis＝學姊、met_sis、在臺灣、晚餐、每學期 1 次、交往中 2 次、隔 3 週；reapply.tutorBack＝選項、明軒回的、過期也算（修改前：沒有這兩筆）',J(Z)===J({who:'學姊',met:'met_sis',inTaiwan:true,slot:'dinner',termMax:1,datingMax:2,gapWeeks:3})&&J(B)===J({opt:'我現在可以接家教了。',re:'好，剛好還有一個學生。時間我傳給你。',expired:true}),J([Z,B]));
  if(doc&&B&&Z){ const q9=doc.slice(doc.indexOf('## 9. 回 LAWWW'));
    check('0. 稿第 9 節的字逐句在：學姊那一句、選項、明軒回的；第 3、4 點',q9.includes('**學姊來越好吃「'+D8.yueMeal.own['學姊']+'」不走晚餐名單的亂數，另定**')&&q9.includes('多一個回覆選項「'+B.opt+'」；對方回：「'+B.re+'」之後照原本答應的流程。')&&q9.includes('家教那一則沒回、過期：也算問過，不再問；一樣用第 2 點的回覆選項自己回去找。')&&q9.includes('整段不演、不算次數：可以。'));
    { const raw=sha=>{ try{ return (cp.__worldEf||cp.execFileSync).call(cp,'git',['-C',H.ROOT,'show',sha+':'+DOC8],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ return null; } }, r1=raw(SHA8), r0=raw(PREV8);   /* 原文（不經 tests/alison.js 換字、接語彤那幾份）*/
      if(r0&&r1){ const p0=r0.replace(/\n+$/,''); check('0. 第 1～8 節和上一版（'+PREV8+'）一字不差：只多第 9 節',r1.startsWith(p0)&&r1.slice(p0.length).trim().startsWith('## 9. 回 LAWWW')); } } }
  else console.log('（跳過：讀不到稿 '+SHA8+'）');
  const strip=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,''), code=strip('src/jobs3d.js')+strip('src/shoplife3d.js');
  check('0. 那三句只在匯入的資料裡，程式不自己寫字（D79）',!!B&&!code.includes(B.opt)&&!code.includes(B.re)&&!code.includes(D8.yueMeal.own['學姊']));
});
/* ================= 1 學姊來越好吃 ================= */
await sec('1',async()=>{
  check('1. 有 SHOPLIFE.yueRule／yueDatePlan、JOBS.yueMetOnly（修改前：沒有）',typeof SHOPLIFE.yueRule==='function'&&typeof SHOPLIFE.yueDatePlan==='function'&&typeof JOBS.yueMetOnly==='function');
  const Y=D8.yueMeal, LINE=Y.own['學姊'];
  /* 四年掃一遍 */
  const A=scan({met_sis:true}), B=scan({met_sis:true},{date:true}), C=scan({}), n=o=>TERMS8.map(t=>o.out[t].length);
  if(process.argv.includes('--scan')){ for(const [nm,o] of [['認識她（只有 met_sis，不用到朋友）',A],['交往中',B],['不認識',C]]){ console.log('—— '+nm+'：'+J(n(o))); for(const t of TERMS8) console.log('  '+t+'：'+(o.out[t].join('、')||'（沒有）')+'　沒來的日子 '+J(o.why[t])); } }
  const IN=TERMS8.filter(t=>t!=='Y4S1');   /* 大四上她大部分的時間在美國（2028-08-02～12-23）*/
  check('1. 認識她（只有 met_sis，還不是朋友）：她在臺灣的每一個學期剛好來一次（修改前：照名單亂數、要到朋友——這樣掃是 0 次）',IN.every(t=>A.out[t].length===1)&&A.out.Y4S1.length<=1,J(n(A)));
  check('1. 交往中：一學期兩次，兩次隔至少三週（21 天）',IN.every(t=>{ const L=B.out[t]; return L.length===2&&H.D(L[1])-H.D(L[0])>=21; })&&B.out.Y4S1.length<=2,J(B.out));
  check('1. 她在美國的那一段（2028-08-02～12-23）沒有一天來；大四上只有她回臺灣以後的日子',A.out.Y4S1.concat(B.out.Y4S1).every(k=>H.D(k)>=H.D('2028-12-23'))&&STORY.presence(SIS,{day:H.D('2028-10-03'),hour:18,flags:{}}).here===false,J([A.out.Y4S1,B.out.Y4S1]));
  check('1. 不認識她（沒有 met_sis、沒見過）：四年都不來',n(C).every(x=>x===0),J(n(C)));
  if(typeof SHOPLIFE.yueDatePlan!=='function') return;
  check('1. 規則是資料那一份（學姊＝heroine_05，JOBS.YUE_ALIAS）；可昕的規則照舊（SHOPLIFE.yueDateCfg 還是資料原本那三欄、照擲機會）；別人沒有規則',SHOPLIFE.yueRule(SIS)===Y.sis&&SHOPLIFE.yueDateIs(SIS)&&J(SHOPLIFE.yueDateCfg())===J({who:'可昕',slot:'dinner',termMax:2})&&SHOPLIFE.yueRule('kexin').chance===true&&SHOPLIFE.yueRule('zhe')===null);
  /* 每學期的那一次＝第一個「符合、而且她來得了」的有班日：前面有班的日子不是規則不成立（考試週、颱風、學期剛開始）就是她有更優先的事（第 4 點）*/
  { let bad=null; for(const t of IN){ const R=CALENDAR.termDays(t), first=H.D(A.out[t][0]); for(let d=R.from;d<first&&!bad;d++){ if(!isShiftWd(d)) continue; fresh(d,17.4,'tz_yuehaochi',{met_sis:true}); hireTerm(R); SHOPLIFE._reset(); if(JOBS.due(H.G,'yue',d)&&ruleDay(H.G)==='come') bad=[t,key(d)]; } }
    check('1. 每學期的那一次＝這個學期第一個符合、她來得了的有班日（前面沒有「來得了卻沒來」的日子）',bad===null,J(bad)); }
  /* 一天從頭演一次 */
  const d0=H.D(A.out.Y1S2[0]), nextShift=d=>{ let x=d+1; while(!isShiftWd(x)) x++; return x; };
  { fresh(d0,17.4,'tz_yuehaochi',{met_sis:true}); const j=hire('yue',[2,4]); world(); clerkNPC(); SHOPLIFE._reset(); snap.length=0; await shift('yue',d0,P3);
    const i=snap.findIndex(s=>s.t===Y.narr), n1=GM.npc[SIS];
    check('1. 那一班：旁白 → 學姊「你在這裡。幾點下班？」→ 祐廷 →（你幫她點了餐。）；她那一句出來的時候人在店裡（照作息進來、坐在位子上）',i>=0&&snap[i+1].t===LINE&&snap[i+1].who===SIS&&snap[i+1].npcs.includes(SIS)&&snap[i+2].t===Y.me&&snap[i+3].t===Y.done.f&&!!n1&&!!n1.seat&&n1.sched===true,J(snap.map(s=>s.t).slice(0,8)));
    check('1. 這一次算來過（SHOP_YUE_DATE 學姊｜這個學期 一筆）、每人一次的那一組記了（mealHi）',J(H.G.flags.SHOP_YUE_DATE)===J({[SIS+'|Y1S2']:[d0]})&&(j.mealHi||[]).includes(SIS),J(H.G.flags.SHOP_YUE_DATE));
    const d1=nextShift(d0); at(d1,17.4,'tz_yuehaochi'); SHOPLIFE._reset();
    check('1. 同一個學期下一個有班的日子：照規則不再來（朋友版一學期一次）',SHOPLIFE.yueDatePlan(Object.assign({},H.G,{hour:18.5}),SIS)===null);
    H.G.flags['dating_'+SIS]=true; const soon=SHOPLIFE.yueDatePlan(Object.assign({},H.G,{hour:18.5}),SIS); let d2=d0+21; while(!isShiftWd(d2)) d2++; at(d2,17.4,'tz_yuehaochi'); SHOPLIFE._reset(); const late=JOBS.due(H.G,'yue',d2)?SHOPLIFE.yueDatePlan(Object.assign({},H.G,{hour:18.5}),SIS):'skip';
    check('1. 之後交往了：第二次要隔滿三週（不到三週的有班日不來、滿三週的來）',soon===null&&(late==='skip'||!!late),J([soon,late]));
    check('1. 存檔 JSON 來回不壞；舊存檔（沒有 SHOP_YUE_DATE）＝這個學期還沒來過',J(JSON.parse(J(H.G)))===J(H.G)&&(()=>{ delete H.G.flags.SHOP_YUE_DATE; delete H.G.flags['dating_'+SIS]; at(d0,18.5,'tz_yuehaochi'); SHOPLIFE._reset(); return !!SHOPLIFE.yueDatePlan(H.G,SIS); })()); }
  /* 那一天她不照名單亂數去別間 */
  { let other=0, yue=0; for(const t of ['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']){ const d=H.D(A.out[t][0]); fresh(d,18,'tz_yuehaochi',{met_sis:true}); hireTerm(CALENDAR.termDays(t)); SHOPLIFE._reset();
      for(let h=17.75;h<19.5;h+=0.05){ const e=STORY.schedEnt(CHARACTERS[SIS],Object.assign({},H.G,{hour:h})); if(e&&e.shopMeal){ if(e.zone==='tz_yuehaochi') yue++; else other++; } } }
    check('1. 輪到規則的那一餐：她只會在越好吃（不照名單亂數去別間）',yue>0&&other===0,J([yue,other])); }
  { fresh(d0,18.5,'tz_yuehaochi',{met_sis:true}); SHOPLIFE._reset(); const noJob=SHOPLIFE.yueDatePlan(H.G,SIS); hire('yue',[2,4]); at(d0+1,18.5,'tz_yuehaochi'); const noShift=SHOPLIFE.yueDatePlan(H.G,SIS);
    check('1. 祐廷沒在越好吃打工、那一天沒有班：規則不成立（照名單原本的）',noJob===null&&noShift===null); }
  if(typeof ROM!=='undefined'&&ROM.exOf){ fresh(d0,17.4,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); const x0=ROM.exOf; ROM.exOf=(G,id)=>id===SIS; SHOPLIFE._reset(); let m='x'; try{ m=JOBS.mealAt(H.G,SIS); } finally { ROM.exOf=x0; }
    check('1. 分手後的前任（還沒回到朋友）：不來（照原本 SHOPLIFE.exBlock）',m===null); }
  /* 4：帶不進來＝不演、不算次數，下一個有班的日子再來 */
  { fresh(d0,17.4,'tz_yuehaochi',{met_sis:true}); const j=hire('yue',[2,4]); world(); H.E.zone.seats=[]; SHOPLIFE._reset(); snap.length=0; await shift('yue',d0,P3);
    const none=!snap.some(s=>s.t===Y.narr||s.t===LINE)&&!(j.mealHi||[]).includes(SIS)&&!H.G.flags.SHOP_YUE_DATE;
    const d1=nextShift(d0); at(d1,17.4,'tz_yuehaochi'); SHOPLIFE._reset();
    check('4. 學姊帶不進店裡（沒有位子）：整段不演、不算次數；下一個有班的日子照規則再來（修改前：沒有這條規則）',none&&!!SHOPLIFE.yueDatePlan(Object.assign({},H.G,{hour:18.5}),SIS),J([none,snap.map(s=>s.t).slice(0,4)])); }
  { fresh(d0,18.5,'tz_yuehaochi',{met_sis:true}); hire('yue',[2,4]); world(); SHOPLIFE._reset(); const p=SHOPLIFE.yueDatePlan(H.G,SIS); at(d0,(p.t0+p.t1)/2,'tz_yuehaochi'); GM.spawnCharacter(SIS,0,0,{}); SHOPLIFE.markMet(GM);
    check('1. 那一段沒演到、玩家在店裡看到她（SHOPLIFE.markMet）也算一次',J(H.G.flags.SHOP_YUE_DATE)===J({[SIS+'|Y1S2']:[d0]}),J(H.G.flags.SHOP_YUE_DATE)); }
  { fresh(d0,18.5,'tz_yuehaochi',{}); hire('yue',[2,4]); SHOPLIFE._reset(); check('1. 可昕沒交往：照舊不來',SHOPLIFE.yueDatePlan(H.G,'kexin')===null); }
});
/* ================= 2、3 家教 ================= */
await sec('2',async()=>{
  const U=WZ_JOBS_DATA.tutor, B=D8.reapply.tutorBack||{}, stop=TD('Y1S2',8,3), y1s2=CALENDAR.termDays('Y1S2').from, s1=CALENDAR.termDays('Y2S1').from, s2=CALENDAR.termDays('Y2S2').from, e1=CALENDAR.termDays('Y2S1').to, kk=JOBS.tutorKK();
  const took=()=>({JOB_TUTOR:true,TUTOR_WD:2,TUTOR_N:4,tutorFromDay:TD('Y1S1',6,1)}), base=()=>Object.assign(took(),{TUTOR_STOP:stop}), asks=re=>(H.G.msgs||[]).filter(m=>m.ask&&re.test(m.ask.id));
  const run=()=>{ JOBS.tutorPhone(H.G); PHONE.tick(H.G); JOBS.tutorPhone(H.G); PHONE.tick(H.G); };
  const open=()=>(H.G.msgs||[]).filter(m=>m.ask&&/^tutor_back_/.test(m.ask.id)&&PHONE.askOpen(H.G,m)), mx=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+MX);
  const only=t=>{ H.G.msgs=[]; PHONE.post(H.G,{th:'p:'+MX,from:MX,text:t}); };
  const has=['tutorBack','tutorBackDue','tutorReAsked','tutorLimbo'].every(k=>typeof JOBS[k]==='function');
  check('2. 有 JOBS.tutorBack／tutorBackDue／tutorReAsked／tutorLimbo（修改前：沒有）',has);
  /* 3 再問的那一則沒回、過期（這一項不用新的函式：修改前 FAIL＝又問一次）*/
  { fresh(s1,13,'dorm',base()); run(); const first=asks(/^tutor_re_Y2S1$/).length; at(s1+40,13); run(); const mid=open().length;
    at(s2,13); run(); const o=open(), again=asks(/^tutor_re_Y2S2$/).length;
    check('3. 再問的那一則沒回、過期：也算問過——下一個學期不再問（舊期望／修改前：下一個學期開學又問一次 tutor_re_Y2S2）',first===1&&mid===0&&again===0,J([first,mid,again]));
    check('3. 一樣有第 2 點的選項：掛在問的那一則「家長問你這學期還來嗎」底下（過期的「來／不了」換成這一個）',o.length===1&&o[0].text===U.termAsk&&J(o[0].ask.opts.map(q=>q.t))===J([B.opt]),o[0]&&o[0].text);
    if(o[0]){ PHONE.answer(H.G,o[0].ask.id,0); run(); } check('3. 回了＝又有家教',H.G.flags.TUTOR_STOP==null&&H.G.flags.TUTOR_TERM_Y2S2==='go'&&!!JOBS.at(H.G,'tutor')); }
  if(!has) return;
  /* 2a 開學那一則回「不了」*/
  { fresh(y1s2,13,'dorm',took()); run(); const asked=asks(/^tutor_term_Y1S2$/).length; PHONE.answer(H.G,'tutor_term_Y1S2',1); run();
    const stopped=H.G.flags.TUTOR_STOP===y1s2&&JOBS.at(H.G,'tutor')===null; at(y1s2+30,13); run(); const same=open().length;
    at(s1-1,13); run(); const vac=open().length;
    at(s1,13); run(); const o=open(), m=o[0], i=m?mx().indexOf(m):-1;
    check('2. 開學那一則回「不了」：同一個學期、暑假都沒有那個選項；下一個學期開學那天起，明軒那一串多一個可以回的「我現在可以接家教了。」（只有這一個選項、一次只掛一個）',asked===1&&stopped&&same===0&&vac===0&&o.length===1&&m.th==='p:'+MX&&J(m.ask.opts.map(q=>q.t))===J([B.opt]),J([asked,stopped,same,vac,o.length]));
    check('2. 掛在「那一則家教的對話」底下：明軒回的「好，我跟家長說。有空回來看看。」那一則（前兩則＝問的、祐廷回的「不了」）',!!m&&m.text===U.stopReply&&m.from===MX&&i>=2&&mx()[i-1].text===U.termOpts[1]&&mx()[i-1].from==='player'&&mx()[i-2].text===U.termAsk,m&&m.text);
    check('2. 明軒不再問（第 8 節第 5 點照舊）；手機那一串算「待回覆」',asks(/^tutor_re_/).length===0&&PHONE.threads(H.G).find(t=>t.th==='p:'+MX).pending===1);
    run(); run(); check('2. 再跑幾次不會多掛',open().length===1);
    const sv=JSON.parse(J(H.G)); check('2. 存檔 JSON 來回不壞（選項在那一則訊息上，沒有多旗標）',J(sv)===J(H.G)&&sv.msgs.some(q=>q.ask&&/^tutor_back_/.test(q.ask.id))&&!Object.keys(H.G.flags).some(k=>/TUTOR_BACK/.test(k)));
    const n0=mx().length, r=PHONE.answer(H.G,m.ask.id,0); run(); const L=mx().slice(n0).map(q=>[q.from,q.text]);
    check('2. 回了：祐廷「我現在可以接家教了。」→ 明軒「好，剛好還有一個學生。時間我傳給你。」',!!r&&J(L)===J([['player',B.opt],[MX,B.re]]),J(L));
    const plan=OUT.rec(H.G).filter(q=>/^tutor_/.test(q.id)&&q.state==='planned');
    check('2. 之後照回「來」那條路：TUTOR_STOP 清掉、這個學期記 go、以前回「不了」的學期改記 stopped、TUTOR_RE 1、堂數留著；又有家教、下一堂排進行程',H.G.flags.TUTOR_STOP==null&&H.G.flags.TUTOR_TERM_Y2S1==='go'&&H.G.flags.TUTOR_TERM_Y1S2==='stopped'&&H.G.flags.TUTOR_RE===1&&H.G.flags.TUTOR_N===4&&H.G.flags.TUTOR_RE_ANS==null&&!!JOBS.at(H.G,'tutor')&&plan.length===1&&plan[0].day>=s1,J([H.G.flags.TUTOR_STOP,H.G.flags.TUTOR_TERM_Y2S1,H.G.flags.TUTOR_TERM_Y1S2,plan.map(q=>q.day)]));
    check('2. 回了以後選項收起來、不再掛',open().length===0&&JOBS.tutorBackDue(H.G)===false);
    at(s2,13); run(); check('2. 接回來以後的下一個學期：照原本開學問「家長問你這學期還來嗎」（原本的流程）；不掛回去的選項',asks(/^tutor_term_Y2S2$/).length===1&&open().length===0,J(asks(/^tutor_/).map(q=>q.ask.id))); }
  /* 2b 再問的那一則回「不了」*/
  { fresh(s1,13,'dorm',base()); run(); PHONE.answer(H.G,'tutor_re_Y2S1',1); run(); const no=H.G.flags.TUTOR_RE_NO===s1; at(s1+40,13); run(); const same=open().length; at(s2,13); run(); const o=open();
    check('2. 再問的那一則回「不了」：這個學期沒有選項；下一個學期開學起有，掛在明軒回的那一句底下；不再問',no&&same===0&&o.length===1&&o[0].text===U.stopReply&&asks(/^tutor_re_Y2S2$/).length===0,J([no,same,o.length]));
    PHONE.answer(H.G,o[0].ask.id,0); run(); check('2. 回了＝這個學期又有家教',H.G.flags.TUTOR_STOP==null&&H.G.flags.TUTOR_TERM_Y2S2==='go'&&!!JOBS.at(H.G,'tutor')); }
  /* 3 開學那一則沒回、過期（原本：之後不排課也不再問）*/
  { fresh(y1s2,13,'dorm',took()); run(); at(y1s2+50,13); run(); const mid=open().length;
    at(s1,13); run(); const o=open();
    check('3. 開學那一則沒回、過期（原本＝之後不排課、不再問，沒有路回去）：下一個學期開學起一樣有選項',mid===0&&o.length===1&&o[0].text===U.termAsk&&asks(/^tutor_term_Y2S1$/).length===0,J([mid,o.length]));
    PHONE.answer(H.G,o[0].ask.id,0); run(); const on=H.G.flags.TUTOR_TERM_Y2S1==='go'&&!!JOBS.at(H.G,'tutor')&&H.G.flags.TUTOR_STOP==null;
    at(s2,13); run(); check('3. 回了＝這個學期又有家教；下一個學期照原本開學問一次（這時候不掛選項）',on&&asks(/^tutor_term_Y2S2$/).length===1&&open().length===0,J([on,asks(/^tutor_/).map(q=>q.ask.id)])); }
  /* 不是回「不了」停的（連續沒去、明軒問了以後停）：下一個學期照舊先問一次，問的那一則開著的時候不掛 */
  { fresh(s1,13,'dorm',base()); run(); check('2. 不是回「不了」停的：下一個學期照舊明軒先問一次；那一則還回得了的時候不掛選項',asks(/^tutor_re_Y2S1$/).length===1&&open().length===0&&JOBS.tutorBackDue(H.G)===false); }
  /* 那幾則被刪掉了（訊息超過 200 則）：掛在明軒那一串最新的一則 */
  { fresh(s2,13,'dorm',Object.assign(base(),{TUTOR_STOP:s1,TUTOR_TERM_Y2S1:'stop'})); only('（測試用的舊訊息）'); run(); const o=open();
    check('2. 那一則家教的訊息已經不在（超過 200 則被刪）：掛在明軒那一串最新的一則底下',o.length===1&&o[0].from===MX,J(o.map(q=>q.text)));
    H.G.msgs=H.G.msgs.filter(q=>q!==o[0]); PHONE.post(H.G,{th:'p:'+MX,from:MX,text:'（測試用的第二則）'}); run();
    check('2. 掛著的那一則之後也被刪：下一次再掛一個',open().length===1);
    H.G.msgs=[]; let threw=false; try{ run(); }catch(e){ threw=true; } check('2. 明軒那一串一則都沒有：不掛、不丟例外（等他有訊息再掛）',!threw&&open().length===0); }
  /* 放假的時候才回 */
  { fresh(s1,13,'dorm',Object.assign(base(),{TUTOR_STOP:y1s2,TUTOR_TERM_Y1S2:'stop'})); only(U.stopReply); run(); const o=open();
    at(e1+3,13); const vac=!CALENDAR.termOf(H.G.day); PHONE.answer(H.G,o[0].ask.id,0); run(); const held=H.G.flags.TUTOR_RE_ANS==='go'&&H.G.flags.TUTOR_STOP!=null&&open().length===0;
    const sv=JSON.parse(J(H.G)); H.G=sv; SOCIAL.bind(H.G);   /* 這時候存檔、讀檔 */
    at(s2,13); run();
    check('2. 放假的時候回：先留著（不白回）、不重複掛；中間存讀檔照舊；開學那天接回來',o.length===1&&vac&&held&&H.G.flags.TUTOR_STOP==null&&H.G.flags.TUTOR_TERM_Y2S2==='go'&&H.G.flags.TUTOR_RE_ANS==null&&!!JOBS.at(H.G,'tutor'),J([vac,held,H.G.flags.TUTOR_TERM_Y2S2])); }
  /* 會考以後、家教結束：沒有選項 */
  if(kk!=null){ fresh(kk,13,'dorm',Object.assign(base(),{TUTOR_STOP:s1,TUTOR_TERM_Y2S1:'stop'})); only(U.stopReply); run(); const after=open().length;
    fresh(kk-3,13,'dorm',Object.assign(base(),{TUTOR_STOP:s1,TUTOR_TERM_Y2S1:'stop'})); only(U.stopReply); run(); const o=open(); at(kk,13); const closed=open().length===0; H.G.flags.TUTOR_RE_ANS='go'; run();
    check('2. 會考那一天起：不掛；會考前掛著的到會考那天收起來；那時候才收到的回覆不算（大三起沒有家教，照原本）',after===0&&o.length===1&&closed&&o[0].ask.until===kk*24&&H.G.flags.TUTOR_RE_ANS==null&&H.G.flags.TUTOR_STOP===s1,J([after,o.length,closed])); }
  /* 沒接過家教、還在做的：都沒有 */
  { fresh(s1,13,'dorm',{}); run(); const a=open().length; fresh(s1+20,13,'dorm',Object.assign(took(),{TUTOR_TERM_Y1S2:'go',TUTOR_TERM_Y2S1:'go'})); run();
    check('2. 沒接過家教、還在做的：沒有那個選項',a===0&&open().length===0&&!!JOBS.at(H.G,'tutor')); }
  /* 舊存檔（修改前的版本存的）*/
  { fresh(s2+20,13,'dorm',Object.assign(base(),{TUTOR_STOP:s1,TUTOR_RE_NO:s1})); only(U.stopReply); const sv=JSON.parse(J(H.G)); H.G=sv; SOCIAL.bind(H.G); run();
    check('2. 舊存檔（回過「不了」、現在已經是後面的學期中間）：讀進來下一次就掛上',open().length===1&&J(JSON.parse(J(H.G)))===J(H.G)); }
  { fresh(s2+5,13,'dorm',Object.assign(base(),{TUTOR_STOP:stop})); run(); const a=asks(/^tutor_re_Y2S2$/).length; H.G.phone.cut=(H.G.phone.cut||[]).concat(['tutor_re_Y2S1']); H.G.msgs=[]; H.G.phone.q=[]; only('（測試用的舊訊息）'); const sv=JSON.parse(J(H.G)); H.G=sv; SOCIAL.bind(H.G); run();
    check('3. 舊存檔（修改前：上個學期再問過、沒回，這個學期還沒問）：讀進來不再問、掛選項',a===1&&asks(/^tutor_re_Y2S2$/).length===0&&open().length===1,J([a,asks(/^tutor_/).map(q=>q.ask.id)])); }
});
console.log(H.fails?'FAILED '+H.fails:'ALL PASS');
process.exit(H.fails?1:0);
})();
