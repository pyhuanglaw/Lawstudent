// 期末考前的圖書館：位子很滿、請朋友占位子、看到同學在念書（AA_669 第 0～5、7 節，企劃線 468a1d0b9，AA-C 定稿 D109；EXAM-LIB-CROWD-1104、USER_WANTS X228）——不需要瀏覽器。
// 使用者 2026-11-04 16:1x：「期末考前一定要看到圖書館，反正幾乎是不管哪個圖書館就是位子會很滿還要請同學佔位子，然後會看到很多同學在唸書不一定有約，但是就是會看到也可以跟朋友約過去喔，你可以請朋友佔位子」。
// 座位用遊戲真正的座位：子程序在 Node 建出總圖大廳、3F、B1、社科圖、法圖、霖澤館 4F（同 tests/crowd_depts_unit.js 的做法），把 E.zone.seats 傳回來；其他照 tests/aa595_rules_unit.js（pg_harness＋index.html 其餘的檔）。
//   0  對稿：src/data/examlib_lines.js 每一句都在 AA_669（git show 468a1d0b9）裡、一字不差；表上的人、欄位都有。index.html 載入順序；掛上去的地方（SCHED_X、TICKS、PHONE_RULES、MSG、LIBQ、SEATACT.AWAY）
//   1  時段：第 13 週沒有、第 14 週起有、期末考最後一場考完沒有（考試週還沒考完照樣有）、國外那一學期沒有（美國路線大四上、日本路線大三下）、大四下（15 週）第 14 週有、經濟系那一年有
//   2  四個圖書館（總圖大廳二樓、3F、B1、研究小間；社科圖；法圖；A館 4F）都算；平日 10:00、週末 11:00 全滿，開館一小時七成；社科圖二樓做好以後平日 09:00；第 13 週不滿
//   3  座位：全滿＝讀書的位子都「有人了」（座位的按鈕、按了「有人了。」、SEATACT 桌上放東西）、總圖一樓大廳不算、劇情寫死的位子不放、坐著的人照舊；同一天進出是同一批
//   4  第 1 節一進門的旁白（每學期每一間一次、輪流、閉館前 30 分鐘第 6 句）；第 2 節找不到位子：三個選項、有 FRIEND 以上的朋友坐著＝多「招手」、再繞一圈（有、沒有兩種）、去別間、回宿舍讀／回家讀、一天一間一次、10:00 以前和週末 11:00 以前不跳
//   5  第 3 節：讀書的時段換到表上的地方（上課照舊、同一間不動、那一間沒開照作息、同一天最多三位）；說話＝點頭→（小聲）那幾句照順序→用完只點頭、換學期重來、交往中第一句前面多一個動作、
//      LIBQ 今天點過頭也算、pool 一學期一句；這一段以外、讀書區以外照原本的閒聊
//   6  第 4-1 節：手機話題「明天幫我占位子」（18:00～23:00、FRIEND 以上、一天只能問一個人、芷若沒有）；四種回覆：答應、到了以後（直接走過去坐下）、沒到（他說的時間）、不行（照作息：沒有讀書的時段、早上要考試）；
//      這一學期沒來過再問＝「這次會來吧」；子晴 9:50 前後兩種；占著的位子路人不坐、那一天不跳找不到位子
//   7  第 4-2 節：前一天 21:00 私訊、回「好。」、10:00 以前坐下＝放講義留位子、他照時間走進來坐下說那一句；沒去＝沒占到那一則；語彤只在明天是平日問
//   8  第 5 節經濟系那一年：人換成品妤、阿勳、韋綸（法律系的人不說）；他們平日有讀書的時間；手機的話題不出（經濟系那一年還沒有私訊、休學以後不約去台大）
//   9  不扣關係、不改成績：沒到、沒占到、沒去都只發那一則（SOCIAL.adjust 沒有負的、關係數值沒有下降、考試紀錄不變）
//   10 舊存檔：沒有 G.exlib、壞掉的、JSON 存讀
//   11 BB_260 多給的讀書時段（子晴、阿哲、Alison、明軒大二以後；只填空檔、上課吃飯照舊）——修改前（8215f8d53）FAIL
// 修改前（開發分支 1f7283aee，git archive 那一版、把這支測試放進去真的跑過）：FAILED 13——index.html 沒有載入、沒有 EXLIB／EXAMLIB_LINES（第 0 節三項、第 1～10 節每一節都 FAIL）；
//   修改後：ALL PASS。用法：node tests/exam_lib_crowd_unit.js（第 0 節用 git show 讀 AA 的稿；讀不到先 git fetch origin claude/magical-albattani-bk7b4n）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify, ROOT=H.ROOT;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
console.warn=()=>{};
/* index.html 的順序載入其餘的檔（同 tests/aa595_rules_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就跳過 */ } }
const HAVE=typeof EXLIB!=='undefined'&&typeof EXAMLIB_LINES!=='undefined';
const sec=async(n,f)=>{ if(!HAVE&&n!=='0'){ check(n+'. EXLIB／EXAMLIB_LINES 沒有載入（這一節不能測）',false); return; } try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };

/* ---------- 遊戲真正的座位（子程序建區域；同 crowd_depts_unit 的載入法）---------- */
const SEAT_DUMP=`const fs=require('fs'),vm=require('vm'),path=require('path');const ROOT=process.env.EXROOT;global.window=global;global.self=global;
const ctx2d=new Proxy({},{get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={createElementNS:()=>({getContext:()=>ctx2d,style:{}}),createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}),getElementById:()=>null,addEventListener(){}};
global.navigator={userAgent:'node'};global.addEventListener=()=>{};global.innerWidth=844;global.innerHeight=390;global.location={search:''};console.warn=()=>{};console.log=()=>{};process.on('unhandledRejection',()=>{});global.fetch=()=>Promise.reject(new Error('x'));
const GL=/^[A-Z][A-Z0-9_]+$/;const F=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/library_3f_layout.js','src/library_3f_v2.js','src/data/library_b1_layout.js','src/library_b1_3d.js','src/data/library_upper_layouts.js','src/library_upper3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/linze_upper_layouts.js','src/linze_upper3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js'];
for(const f of F){let s=fs.readFileSync(path.join(ROOT,f),'utf8');s=s.replace(/^const (\\w+)\\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m);try{vm.runInThisContext(s,{filename:f});}catch(e){}}
global.CHAR={build:spec=>{const g=new THREE.Group();g.userData.spec=spec;return g;},release(){}};const E=E3;E.scene=new THREE.Scene();E.q={level:'medium'};const out={};
for(const id of ['library_hall','library','library_b1','soclib','lawlib','linze_4f']){E.interactables=[];E.colliders=[];E.lampGlows=[];E.seats=[];E.npcs=[];E.spawnHint=null;let z;try{z=Z3.ZONES[id].build(E);}catch(e){continue;}
 out[id]=(z.seats||[]).map(s=>{const o={x:+s.x.toFixed(3),z:+s.z.toFixed(3),yaw:+(s.yaw||0).toFixed(4),lv:s.lv|0};for(const k of ['kind','table','room','study']) if(s[k]!=null) o[k]=s[k];const it=E.interactables.find(q=>q.seat===s);if(it){o.it=it.label;if(it.study) o.st=1;}return o;});}
process.stdout.write(JSON.stringify(out));`;
let SEATS={}; try{ SEATS=JSON.parse(cp.execFileSync(process.execPath,['-e',SEAT_DUMP],{cwd:ROOT,env:Object.assign({},process.env,{EXROOT:ROOT}),encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<26})); }catch(e){ SEATS={}; }

/* ---------- 假的 GM 補上這一批要用的 ---------- */
const toasts=[], seatCalls=[], goCalls=[], homeCalls=[];
GM.toast=t=>{ toasts.push(t); }; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.autosave=()=>{};
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); delete GM.npc[id]; } };
GM.seatMenu=async it=>{ seatCalls.push(it); E.player.seat=it.seat; if(STORY.onSeat) await STORY.onSeat(GM,it.seat); };   /* game3d.js seatMenu：走過去、坐下、STORY.onSeat（之後的選單這裡不演）*/
GM.quickGo=async p=>{ goCalls.push(p); };
if(typeof HOME!=='undefined'){ HOME.go=async()=>{ homeCalls.push(1); return true; }; }
const flush=async()=>{ for(let i=0;i<40;i++) await new Promise(r=>setImmediate(r)); };
const P=E.player;
const setT=(key,h)=>{ const d=typeof key==='number'?key:STORY.dayOfKey(key); H.G.day=d; H.G.hour=h; const w=CALENDAR.dateOf(d).wd; H.G.weekday=w===7?0:w; };
const DK=k=>STORY.dayOfKey(k);
/* 進一間：遊戲真正的座位、座位的按鈕（同區域的 E.interactables），玩家站在某一點 */
function zone(id,lv,x,z){ const src=SEATS[id]||[]; const seats=src.map(s=>{ const o=Object.assign({},s); delete o.it; delete o.st; return o; });
  E.zone={id,roomAt:()=>null,seats}; E.interactables.length=0; src.forEach((s,i)=>{ if(s.it) E.interactables.push({x:s.x,z:s.z,lv:s.lv,radius:0.8,label:s.it,seat:seats[i],study:!!s.st}); });
  E.npcs.length=0; for(const k of Object.keys(GM.npc)) delete GM.npc[k]; H.G.zone=id; P.lv=lv|0; P.obj.position.x=x||0; P.obj.position.z=z||0; P.seat=null; EXLIB._reset(); EXLIB._bindGM(GM); STORY._bindGM(GM); return seats; }
const npcAt=(id,st)=>{ const n={id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x:st.x,y:0,z:st.z},rotation:{y:0}},pose:'read',idlePose:'read',seat:st,lv:st.lv|0,isExtra:false}; E.npcs.push(n); GM.npc[id]=n; return n; };
const anon=st=>{ const n={obj:{position:{x:st.x,y:0,z:st.z},rotation:{y:0}},pose:'read',seat:st,lv:st.lv|0,isExtra:true,name:''}; E.npcs.push(n); return n; };
/* game3d.js doInteract 的說話：讀書區今天第一次＝LIBQ.gate 點頭；不然 n.talk（spawnCharacter 的 talk＝STORY.talkCharacter）*/
const talk=async(id,n)=>{ H.said=[]; if(typeof LIBQ!=='undefined'&&await LIBQ.gate(GM,n)) return 'gate'; await STORY.talkCharacter(id,n); return 'talk'; };
const lines=()=>H.said.map(s=>s.t);
const tick=async()=>{ const r=EXLIB.tick(GM); await flush(); return r; };
const msgs=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>(m.from==='player'?'我：':'')+m.text);
const deliver=()=>{ PHONE.tick(H.G); };
const fresh=(key,h,zoneId,flags)=>{ H.fresh(key,h,zoneId||'library_hall',flags); INV.rec(H.G); H.G.visited=Object.assign({},H.G.visited||{},{soclib:1,lawlib:1,library_hall:1,linze:1}); if(typeof LIBQ!=='undefined') LIBQ.reset(); EXLIB._reset(); EXLIB._bindGM(GM); STORY._bindGM(GM); toasts.length=0; seatCalls.length=0; goCalls.length=0; homeCalls.length=0; return H.G; };
/* FRIEND 以上（直接設數值＝門檻台詞還沒說：當成以前就說過了，SOCIAL.markUp；不然這一次說話先演門檻台詞，那是 talkCharacter 照舊的）*/
const friend=(id,contact)=>{ H.FRIEND(id); if(contact!==false) INV.addContact(H.G,id); for(let k=0;k<6&&SOCIAL.upLine&&SOCIAL.upLine(id);k++) SOCIAL.markUp(id,SOCIAL.upLine(id).k); };
const L=typeof EXAMLIB_LINES!=='undefined'?EXAMLIB_LINES:{people:{},econ:{}};
const NOD=id=>LIBQ.nodLine(id);
/* SOCIAL.adjust 有沒有被叫成負的（第 9 節）*/
const ADJ=[]; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ ADJ.push([id,J(d)]); return a0.apply(this,arguments); }; }
const neg=()=>ADJ.filter(([,d])=>/:-\d/.test(d));

(async()=>{
/* ======================= 0 對稿、載入、掛上去 ======================= */
await sec('0',async()=>{
  let MD=null; try{ MD=cp.execFileSync('git',['show','468a1d0b9:docs/story_planning/AA_669_期末考前的圖書館_位子很滿_請朋友占位子_社科圖二樓.md'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  check('0. 讀得到 AA_669 的稿（git show 468a1d0b9；沒有的話先 git fetch origin claude/magical-albattani-bk7b4n）',!!MD);
  check('0. index.html 載入 src/data/examlib_lines.js、src/examlib3d.js（台詞在前；在 crowd3d、seatact3d、msg3d、libquiet3d、story3d、pool3d 後面）',
    ORDER.includes('src/data/examlib_lines.js')&&ORDER.includes('src/examlib3d.js')&&ORDER.indexOf('src/data/examlib_lines.js')<ORDER.indexOf('src/examlib3d.js')
    &&['src/crowd3d.js','src/seatact3d.js','src/msg3d.js','src/libquiet3d.js','src/story3d.js','src/pool3d.js','src/phone3d.js'].every(f=>ORDER.indexOf(f)>=0&&ORDER.indexOf(f)<ORDER.indexOf('src/examlib3d.js')));
  check('0. EXLIB、EXAMLIB_LINES 載得進來',HAVE);
  if(!HAVE) return;
  check('0. 掛上去：STORY.SCHED_X、STORY.TICKS、STORY.PHONE_RULES、STORY.talkCharacter／interact／onSeat／populate、LIBQ.gate、MSG.topics／send、PHONE.ON_ANSWER、SEATACT.AWAY',
    STORY.SCHED_X.includes(EXLIB.sched)&&STORY.TICKS.includes(EXLIB.tick)&&!!STORY._exlibPhone&&!!STORY._exlibTalk&&!!STORY._exlibInteract&&!!STORY._exlibSeat&&!!STORY._exlibPop&&!!LIBQ._exlib&&!!MSG._exlib&&!!PHONE._exlib&&!!SEATACT._exlib&&SEATACT.AWAY.length>0);
  if(!MD) return;
  const strs=[]; const walk=(o,p)=>{ if(typeof o==='string'){ strs.push([p,o]); return; } if(Array.isArray(o)){ o.forEach((x,i)=>walk(x,p+'['+i+']')); return; } if(o&&typeof o==='object') for(const k of Object.keys(o)){ if(['src','place','terms','side'].includes(k)) continue; walk(o[k],p+'.'+k); } };
  walk(L,'L'); const miss=strs.filter(([,t])=>!MD.includes(t));
  check('0. examlib_lines.js 每一句都在 AA_669 裡、一字不差（'+strs.length+' 句）',strs.length>120&&!miss.length,J(miss.slice(0,6)));
  /* 表上的人、欄位 */
  const S3=['heroine_01','classmate_bohan','classmate_xinci','zhe','yu','classmate_mingxuan','heroine_03','heroine_04','heroine_02','heroine_05','classmate_peishan'];
  const T41=['heroine_01','classmate_bohan','classmate_xinci','zhe','yu','classmate_mingxuan','heroine_03','heroine_04','heroine_05','classmate_peishan'];
  const T42=['zhe','yu','classmate_xinci','heroine_03'];
  check('0. 第 3 節十一位（每人兩句；阿勳以外）、交往中六位的動作、pool 四句',S3.every(id=>L.people[id]&&L.people[id].lines.length===2)&&['heroine_01','heroine_04','heroine_03','heroine_05','classmate_peishan','heroine_02'].every(id=>!!L.people[id].dating)&&L.pool.length===4);
  check('0. 第 4-1 節十位（答應、到了以後、沒到、不行四欄都有；芷若沒有）',T41.every(id=>{ const h=L.people[id].hold; return h&&h.yes.length&&h.at.length&&h.miss.length&&h.no.length; })&&!L.people.heroine_02.hold);
  check('0. 第 4-2 節四位（前一天的訊息、到的時間、到了以後、沒占到）',T42.every(id=>{ const a=L.people[id].ask; return a&&a.msg.length&&typeof a.h==='number'&&a.at.length&&a.miss.length; })&&Object.keys(L.people).filter(id=>L.people[id].ask).length===4);
  check('0. 第 1 節六句（第 6 句閉館前）、第 2 節提示與選項（招手照人換她／他）、第 5 節三位',L.atmos.length===5&&!!L.atmosClose&&!!L.full.say&&!!L.full.again&&!!L.full.other&&!!L.full.dorm&&!!L.full.home&&EXLIB.waveText('heroine_01')==='（看到她在對你招手）'&&EXLIB.waveText('zhe')==='（看到他在對你招手）'&&!!L.full.lucky&&!!L.full.none
    &&['econ_pinyu','econ_zhengxun','econ_weilun'].every(id=>L.econ[id]&&L.econ[id].lines.length&&L.econ[id].hold.yes.length));
  check('0. 拿到遊戲真正的座位（子程序建出六間）',['library_hall','library','library_b1','soclib','lawlib','linze_4f'].every(z=>(SEATS[z]||[]).length>10),J(Object.keys(SEATS).map(z=>z+':'+SEATS[z].length)));
});

/* ======================= 1 時段 ======================= */
await sec('1',async()=>{
  fresh('2025-12-01',10.5); const G=H.G;
  const on=(key,h)=>EXLIB.on(G,DK(key),h);
  const last=CLS.examList(G,'Y1S1').filter(e=>e.kind==='final').sort((a,b)=>(a.day*24+a.t1)-(b.day*24+b.t1)).pop();
  check('1. 第 13 週（11/28）沒有；第 14 週第一天（12/01）起有；第 15 週有',!on('2025-11-28',10.5)&&on('2025-12-01',8.5)&&on('2025-12-08',15));
  check('1. 期末考週還沒考完照樣有；最後一場（'+CALENDAR.dateOf(last.day).key+' '+last.t1.toFixed(2)+'）考完以後沒有；放寒假沒有',on('2025-12-15',8)&&EXLIB.on(G,last.day,last.t1-0.5)&&!EXLIB.on(G,last.day,last.t1+0.01)&&!on('2025-12-22',10));
  G.flags.EXCHANGE_ROUTE='US'; const us=EXLIB.on(G,DK('2028-12-04'),10); G.flags.EXCHANGE_ROUTE='TW'; const tw=EXLIB.on(G,DK('2028-12-04'),10); G.flags.EXCHANGE_ROUTE=null;
  check('1. 國外那一學期沒有（美國路線的大四上）；臺灣路線的大四上照樣有',us===false&&tw===true,J([us,tw]));
  const jpAway=typeof JP!=='undefined'&&JP.skipTerm; if(jpAway){ G.flags.EXCHANGE_ROUTE='JP'; const jp=EXLIB.on(G,DK('2028-05-22'),10)===!JP.skipTerm(G,'Y3S2'); G.flags.EXCHANGE_ROUTE=null; check('1. 日本路線不修的那一學期（JP.skipTerm）沒有',jp); }
  check('1. 大四下（15 週）第 14 週有',CALENDAR.termOf(DK('2029-05-21')).week===14&&on('2029-05-21',10));
  check('1. 經濟系那一年（大一上第 14 週 2024-12-02）也有',CALENDAR.termOf(DK('2024-12-02')).id==='Y0S1'&&on('2024-12-02',10));
});

/* ======================= 2 四個圖書館、滿的時間 ======================= */
await sec('2',async()=>{
  fresh('2025-12-01',10.5); const G=H.G;
  const Z=['library_hall','library','library_b1','library_carrels','soclib','lawlib','linze_4f'];
  check('2. 四個圖書館都算：總圖（大廳二樓、3F、B1、研究小間）、社科圖、法圖、A館 4F',Z.every(z=>EXLIB.isLib(z))&&!EXLIB.isLib('cafe')&&!EXLIB.isLib('library_stacks'));
  const f=(z,key,h)=>{ setT(key,h); return EXLIB.fill(G,z); };
  check('2. 平日 10:00 以後每一間都滿（1）',['library_hall','library','library_b1','soclib','lawlib','linze_4f'].every(z=>f(z,'2025-12-02',10.5)===1));
  check('2. 開館後一小時坐到七成（總圖 09:00＝0.7）、開館前沒有、10:00 前還沒全滿',Math.abs(f('library_hall','2025-12-02',9)-0.7)<1e-9&&f('library_hall','2025-12-02',7.5)===0&&f('library_hall','2025-12-02',9.5)<1);
  check('2. 週末晚一個小時滿（週六 10:30 還沒滿、11:00 滿）',f('library','2025-12-06',10.5)<1&&f('library','2025-12-06',11)===1);
  check('2. 第 13 週不滿（0）',f('library_hall','2025-11-25',10.5)===0);
  global.Z3.ZONES.soclib_2f={name:'社科圖二樓（測試用）'}; const z2=EXLIB.zoneOf('soc2f'); const nine=f('soclib_2f','2025-12-02',9); delete global.Z3.ZONES.soclib_2f; const z1=EXLIB.zoneOf('soc2f');
  check('2. 社科圖二樓：區域做好以後用二樓、平日 09:00 就滿；還沒做好＝照一樓',z2==='soclib_2f'&&nine===1&&z1==='soclib',J([z2,nine,z1]));
});

/* ======================= 3 座位「有人了」 ======================= */
await sec('3',async()=>{
  fresh('2025-12-02',10.5); const seats=zone('library_hall',1,-9.6,3.0);
  const lv1=seats.filter(s=>s.lv===1), lv0=seats.filter(s=>s.lv===0);
  const a=anon(lv1[6]);   /* 一個坐著的路人 */
  EXLIB.syncSeats(GM,true); const ZS=EXLIB._zs();
  const held=lv1.filter(s=>s.exHeld), free=lv1.filter(s=>!s.exHeld);
  check('3. 平日 10:30 總圖大廳二樓：讀書的位子都「有人了」（劇情寫死的 0、1 號和坐著的人除外）',held.length===lv1.length-3&&!seats[0].exHeld&&!seats[1].exHeld&&!lv1[6].exHeld,held.length+'／'+lv1.length);
  check('3. 一樓大廳的座位不算',lv0.length>0&&lv0.every(s=>!s.exHeld));
  const its=E.interactables.filter(it=>it.seat&&it.seat.exHeld);
  check('3. 「有人了」的位子：座位的按鈕寫「有人了」，按了只說「有人了。」（不坐下）',its.length>0&&its.every(it=>it.label==='有人了')&&await STORY.interact(its[0],GM)===true&&toasts.includes('有人了。')&&!seatCalls.length);
  check('3. 桌上放東西：SEATACT.AWAY 給的就是這些位子（人不在的）',J(EXLIB.awaySeats(GM).map(s=>s.x+','+s.z).sort())===J(held.map(s=>s.x+','+s.z).sort()));
  if(typeof SEATACT!=='undefined'&&SEATACT.awayTick){ SEATACT.clear(); SEATACT.awayTick(GM,'library',false); const st0=SEATACT.state().list.filter(r=>r.act==='rest'&&!r.named);
    anon(held[0]); EXLIB.syncSeats(GM,true); SEATACT.awayTick(GM,'library',false); const st1=SEATACT.state().list.filter(r=>r.act==='rest'&&!r.named);
    check('3. SEATACT：每個占著的位子一組「休息」的桌上東西；有人坐下了那一組拿掉',st0.length===held.length&&st1.length===held.length-1,st0.length+' → '+st1.length); SEATACT.clear(); }
  /* 同一天同一批 */
  const k1=EXLIB._zs().order.map(s=>s.x+','+s.z).join('|'); zone('library_hall',1,-9.6,3.0); EXLIB.syncSeats(GM,true); const k2=EXLIB._zs().order.map(s=>s.x+','+s.z).join('|');
  check('3. 同一天出去再進來：占著的是同一批（照日期＋區域＋座位）',k1===k2);
  setT('2025-12-02',8.5); zone('library_hall',1,-9.6,3.0); EXLIB.syncSeats(GM,true); const n85=lv1.length?EXLIB._zs().held.size:0;
  setT('2025-11-25',10.5); zone('library_hall',1,-9.6,3.0); EXLIB.syncSeats(GM,true); const n13=EXLIB._zs().held.size;
  check('3. 08:30 大約三成五；第 13 週一個都沒有',n85>0&&n85<lv1.length-2&&n13===0,n85+'、'+n13);
  /* 其他間：只算讀書的位子 */
  setT('2025-12-02',10.5); const sb=zone('library_b1',0,-14,-10); EXLIB.syncSeats(GM,true); const b1=sb.filter(s=>s.exHeld);
  const ss=zone('soclib',0,-9,-5); EXLIB.syncSeats(GM,true); const so=ss.filter(s=>s.exHeld);
  const sl=zone('lawlib',0,-1,-2); EXLIB.syncSeats(GM,true); const la=sl.filter(s=>s.exHeld);
  const s4=zone('linze_4f',0,0,0); EXLIB.syncSeats(GM,true); const l4=s4.filter(s=>s.exHeld);
  check('3. B1 只算 24 小時自習室、社科圖只算長桌和窗邊（閱報區、SK12 那張不算）、法圖只算長桌和個人座（討論室不算）、A館 4F 只算自習座（走廊長椅不算）',
    b1.length>20&&b1.every(s=>s.room==='study24')&&so.length>20&&so.every(s=>s.kind==='table'||s.kind==='window')&&!ss[16].exHeld&&la.length>20&&la.every(s=>/^T\d$|^carrel$/.test(s.table))&&l4.length>10&&l4.every(s=>s.study),
    [b1.length,so.length,la.length,l4.length].join('、'));
});

/* ======================= 4 一進門的旁白、找不到位子 ======================= */
await sec('4',async()=>{
  fresh('2025-12-02',10.5); zone('library_hall',1,-9.6,3.0);
  check('4. 一樓大廳不放旁白、不跳提示',(P.lv=0,!EXLIB.atmosDue(GM))&&(P.lv=1,true));
  H.said=[]; await tick(); const a1=lines();
  check('4. 第一次走進二樓讀書區：一進門的旁白（第 1 句）',J(a1)===J([L.atmos[0]]),J(a1));
  H.said=[]; H.opts=[]; H.picks=['回宿舍讀']; await tick();
  check('4. 接著（平日 10:30，第一次走到滿的座位旁邊）：「（繞了一圈，空的位子上都有人放了東西。）」＋三個選項',lines()[0]===L.full.say&&J(H.opts[0])===J(['再繞一圈','去別間','回宿舍讀']),J(H.opts[0]));
  check('4. 回宿舍讀＝快速前往宿舍',goCalls.length===1&&goCalls[0][0]==='dorm',J(goCalls));
  H.said=[]; H.opts=[]; await tick();
  check('4. 同一天同一間只跳一次',!H.said.length&&!H.opts.length);
  zone('lawlib',0,-1,-2); H.said=[]; H.opts=[]; H.picks=['去別間','社科院圖書館']; await tick(); const a2=lines(); await tick();
  check('4. 換一間（法圖）：旁白換下一句（輪流）',J(a2)===J([L.atmos[1]]),J(a2));
  check('4. 去別間＝列出其他開著的圖書館（總圖、社科圖、A館；不含自己這一間）＋不去了；選了＝快速前往那一間',J(H.opts[1].slice().sort())===J(['總圖書館（大廳）','社科院圖書館','法律系館A（大廳）','不去了'].sort())&&goCalls.length===2&&goCalls[1][0]==='soclib',J(H.opts[1])+' '+J(goCalls.slice(-1)));
  /* 再繞一圈：照日期＋區域一半的機會；找兩天，一天有、一天沒有 */
  let dYes=null, dNo=null; for(let d=DK('2025-12-01');d<=DK('2025-12-12')&&(dYes==null||dNo==null);d++){ if(CALENDAR.dateOf(d).wd>=6) continue; setT(d,10.5); H.G.zone='library_hall'; if(EXLIB.againLucky(H.G,10.5)){ if(dYes==null) dYes=d; } else if(dNo==null) dNo=d; }
  check('4. 再繞一圈的機會照日期換（有的日子有、有的沒有）；週末、14:00 以後沒有',dYes!=null&&dNo!=null&&(setT('2025-12-06',10.5),!EXLIB.againLucky(H.G,10.5))&&(setT(dYes,14.5),!EXLIB.againLucky(H.G,14.5)));
  setT(dYes,10.5); zone('library_hall',1,-9.6,3.0); H.G.exlib.prompt={}; H.G.exlib.atm.seen['Y1S1:library_hall']=1; H.said=[]; H.opts=[]; H.picks=['再繞一圈']; seatCalls.length=0; const h0=H.G.hour; await tick();
  check('4. 再繞一圈（有）：時間 +20 分鐘、「（靠走道的那個人剛好在收書包。）」、坐下',Math.abs(H.G.hour-h0-1/3)<1e-6&&lines().includes(L.full.lucky)&&seatCalls.length===1&&!!P.seat&&!P.seat.exHeld,J(lines()));
  setT(dNo,10.5); zone('library_hall',1,-9.6,3.0); H.G.exlib.prompt={}; H.G.exlib.atm.seen['Y1S1:library_hall']=1; H.said=[]; H.opts=[]; H.picks=['再繞一圈','去別間','不去了']; seatCalls.length=0; await tick();
  check('4. 再繞一圈（沒有）：「（還是沒有。）」，這一次不能再繞（下一個選單沒有再繞一圈）；不去了＝留在原地',lines().includes(L.full.none)&&!H.opts[1].includes('再繞一圈')&&H.opts[1].includes('去別間')&&!seatCalls.length,J(H.opts));
  /* 招手 */
  setT('2025-12-03',10.5); const s=zone('library_hall',1,-9.6,3.0); H.G.exlib.atm.seen['Y1S1:library_hall']=1; friend('heroine_01'); const an=npcAt('heroine_01',s[1]); EXLIB.syncSeats(GM,true);
  H.said=[]; H.opts=[]; H.picks=['（看到她在對你招手）']; seatCalls.length=0; await tick();
  check('4. 這一間有 FRIEND 以上的朋友坐著：多一個「（看到她在對你招手）」→ 坐到她旁邊，第 3 節的招呼照演（第一次＝點頭）',H.opts[0]&&H.opts[0].length===4&&H.opts[0][3]==='（看到她在對你招手）'&&seatCalls.length===1&&Math.hypot(P.seat.x-s[1].x,P.seat.z-s[1].z)<1.6&&lines().includes(NOD('heroine_01')),J(H.opts[0])+' '+J(lines()));
  /* 不跳的時候 */
  setT('2025-12-04',9.5); zone('library_hall',1,-9.6,3.0); H.G.exlib.atm.seen['Y1S1:library_hall']=1; H.opts=[]; await tick(); const early=H.opts.length;
  setT('2025-12-06',10.5); zone('library_hall',1,-9.6,3.0); H.G.exlib.atm.seen['Y1S1:library_hall']=1; H.opts=[]; await tick(); const we1=H.opts.length; setT('2025-12-06',11.2); EXLIB.syncSeats(GM,true); H.picks=['去別間','不去了']; await tick(); const we2=H.opts.length;
  check('4. 平日 10:00 以前不跳；週末 11:00 以前不跳、11:00 以後跳',early===0&&we1===0&&we2>0,J([early,we1,we2]));
  /* 住家裡 */
  setT('2025-12-05',10.5); zone('library_hall',1,-9.6,3.0); H.G.exlib.atm.seen['Y1S1:library_hall']=1; const bm=HOME.baseMode; HOME.baseMode=()=>true; H.opts=[]; H.picks=['回家讀']; homeCalls.length=0; await tick(); HOME.baseMode=bm;
  check('4. 住家裡：選項是「回家讀」、選了＝回家',H.opts[0]&&H.opts[0][2]==='回家讀'&&homeCalls.length===1,J(H.opts[0]));
  /* 早上搶到位子、10:00 以後起來走動 */
  setT('2025-12-09',9.2); const se=zone('library_hall',1,-9.6,3.0); H.G.exlib.atm.seen['Y1S1:library_hall']=1; EXLIB.syncSeats(GM,true); const free=se.find(q=>q.lv===1&&!q.exHeld&&!q.taken&&se.indexOf(q)>1);
  await GM.seatMenu({seat:free,study:true}); P.seat=null; setT('2025-12-09',10.6); EXLIB.syncSeats(GM,true); H.opts=[]; await tick();
  check('4. 今天在這一間坐過了（早上搶到位子）：10:00 以後起來走動不跳「找不到位子」',!!free&&!H.opts.length,J(H.opts));
  /* 閉館前 30 分鐘的旁白 */
  setT('2025-12-05',21.6); zone('library',0,0,0); H.said=[]; await tick();
  check('4. 閉館前 30 分鐘內進來：第 6 句（閉館前十分鐘的廣播）',J(lines())===J([L.atmosClose]),J(lines()));
});

/* ======================= 5 第 3 節：有名字的人 ======================= */
await sec('5',async()=>{
  fresh('2025-12-02',8.5); const G=H.G; const ent=(id,key,h)=>{ setT(key,h); return STORY.schedEnt(CHARACTERS[id],G); };
  const an=ent('heroine_01','2025-12-02',8.5), an13=ent('heroine_01','2025-11-25',8.5);
  check('5. 以安：第 14 週早上讀書的時段（總圖 3F）換到總圖大廳二樓；第 13 週照作息',an&&an.zone==='library_hall'&&an.exlib==='3'&&an13&&an13.zone==='library'&&!an13.exlib,J([an&&an.zone,an13&&an13.zone]));
  const bo=ent('classmate_bohan','2025-12-03',8.5);
  check('5. 柏翰：作息本來就在總圖 3F（表上的地方）＝照作息、不換',bo&&bo.zone==='library'&&!bo.exlib,J(bo));
  const yt=ent('heroine_03','2025-12-02',10); global.Z3.ZONES.soclib_2f={name:'t'}; EXLIB._reset(); const yt2=ent('heroine_03','2025-12-02',10); delete global.Z3.ZONES.soclib_2f; EXLIB._reset();
  const sis=ent('heroine_05','2025-12-02',10), ps=ent('classmate_peishan','2025-12-02',16.5), xc=ent('classmate_xinci','2025-12-02',16);
  check('5. 語彤→社科圖（二樓做好以後＝二樓）、學姊→法圖、沛珊→總圖大廳二樓、芯慈→法圖',yt&&yt.zone==='soclib'&&yt2&&yt2.zone==='soclib_2f'&&sis&&sis.zone==='lawlib'&&ps&&ps.zone==='library_hall'&&xc&&xc.zone==='lawlib',J([yt,yt2,sis,ps,xc].map(e=>e&&e.zone)));
  const cls=ent('heroine_01','2025-12-01',10);
  check('5. 上課照舊（以安週一上午的憲法）',cls&&cls.act==='class',J(cls));
  const ac=ent('heroine_01','2025-12-02',16.5), zq=ent('heroine_04','2025-12-03',21.8), sc=ent('heroine_05','2026-12-10',19.5);
  check('5. Café 的讀書照作息（那裡有她們的戲）：以安 16:30、子晴週三 21:40、學姊大二上第 14 週週四 19:30 都還在 Café',ac&&ac.zone==='cafe'&&!ac.exlib&&zq&&zq.zone==='cafe'&&!zq.exlib&&sc&&sc.zone==='cafe'&&!sc.exlib,J([ac,zq,sc].map(e=>e&&[e.zone,e.exlib])));
  const yS=ent('heroine_03','2026-05-30',17.75), yU=ent('heroine_03','2026-05-31',17.75);
  check('5. 那一間沒開＝照作息（語彤大一下第 14 週週末 17:30 在總圖 3F 讀書：週六社科圖開到 22:00＝換過去；週日社科圖 17:00 關＝照舊在總圖 3F）',yS&&yS.zone==='soclib'&&yS.exlib==='3'&&yU&&yU.zone==='library'&&!yU.exlib,J([yS,yU].map(e=>e&&[e.zone,e.exlib])));
  /* 同一天最多三位 */
  const old=L.people.classmate_bohan.place; L.people.classmate_bohan.place='hall2f'; L.people.heroine_02.place='hall2f';
  const ids=Object.keys(L.people).filter(id=>L.people[id].place==='hall2f'); setT('2025-12-02',9); const ok=ids.filter(id=>EXLIB.capOk(G,id,'library_hall'));
  L.people.classmate_bohan.place=old; L.people.heroine_02.place='lib3f';
  check('5. 同一間表上超過三位：同一天只放三位（多的照作息）',ids.length===5&&ok.length===3,ids.length+' → '+ok.length);
  /* 說話 */
  setT('2025-12-02',10.5); const s=zone('library_hall',1,-9.6,3.0); friend('heroine_01'); const n=npcAt('heroine_01',s[1]);
  const r1=await talk('heroine_01',n), l1=lines(); const r2=await talk('heroine_01',n), l2=lines(); const r3=await talk('heroine_01',n), l3=lines(); const r4=await talk('heroine_01',n), l4=lines();
  check('5. 第一次碰到（這一段、這一間）＝點頭，不說話',r1==='gate'&&J(l1)===J([NOD('heroine_01')]),J(l1));
  check('5. 之後：（小聲）那幾句照順序，一次一句',J(l2)===J(L.people.heroine_01.lines[0])&&J(l3)===J(L.people.heroine_01.lines[1])&&H.said.length>=0,J([l2,l3]));
  check('5. 用完了＝只點頭',J(l4)===J([NOD('heroine_01')]),J(l4));
  setT('2025-12-03',10.5); zone('library_hall',1,-9.6,3.0); const n2=npcAt('heroine_01',EXLIB.spotSeat(E,'library_hall','heroine_01')); await talk('heroine_01',n2); const d1=lines(); await talk('heroine_01',n2); const d2=lines();
  check('5. 隔天：LIBQ 再點一次頭（換一天）；這學期的句子用完了＝只點頭',J(d1)===J([NOD('heroine_01')])&&J(d2)===J([NOD('heroine_01')]),J([d1,d2]));
  /* 換學期 */
  fresh('2026-05-25',10.5); { const t=CALENDAR.termOf(H.G.day); check('5. 測試用的日子：大一下第 14 週',t&&t.id==='Y1S2'&&t.week===14,J(t)); }
  const s3=zone('library_hall',1,-9.6,3.0); friend('heroine_01'); const n3=npcAt('heroine_01',s3[1]); await talk('heroine_01',n3); await talk('heroine_01',n3); const t2=lines();
  check('5. 換學期：重來（點頭、第一句）',J(t2)===J(L.people.heroine_01.lines[0]),J(t2));
  /* 交往中 */
  fresh('2025-12-02',10.5,'library_hall',{dating_heroine_01:true}); const s4=zone('library_hall',1,-9.6,3.0); friend('heroine_01'); const n4=npcAt('heroine_01',s4[1]); await talk('heroine_01',n4); await talk('heroine_01',n4); const dl=lines();
  check('5. 交往中：第一句前面多一個動作旁白（她把旁邊椅子上的書收起來）',J(dl)===J([L.people.heroine_01.dating].concat(L.people.heroine_01.lines[0])),J(dl));
  /* 明軒的那一句：動作＋說的 */
  fresh('2025-12-02',20); const s5=zone('linze_4f',0,0,0); friend('classmate_mingxuan'); const st5=s5.find(q=>q.study); const n5=npcAt('classmate_mingxuan',st5); await talk('classmate_mingxuan',n5); await talk('classmate_mingxuan',n5);
  check('5. A館 4F 明軒：（他把一包餅乾塞到講義下面。）是旁白、（小聲）你什麼都沒看到。是他說的',H.said.length===2&&H.said[0].who===null&&H.said[0].t===L.people.classmate_mingxuan.lines[0][0]&&H.said[1].who&&H.said[1].t===L.people.classmate_mingxuan.lines[0][1],J(H.said));
  /* LIBQ 今天點過頭（別的時間）也算點過了；換一間＝再點一次頭 */
  fresh('2025-12-02',10.5); let s6=zone('library_hall',1,-9.6,3.0); friend('heroine_05'); let n6=npcAt('heroine_05',s6[2]); await talk('heroine_05',n6);
  s6=zone('lawlib',0,-1,-2); n6=npcAt('heroine_05',s6[3]); const g6=await talk('heroine_05',n6), l6=lines(); const l6b=(await talk('heroine_05',n6),lines());
  check('5. 同一天換一間（總圖點過頭了、法圖第一次）：LIBQ 不再點頭，這裡照「這一間第一次」點頭；再說＝（小聲）第一句',g6==='talk'&&J(l6)===J([NOD('heroine_05')])&&J(l6b)===J(L.people.heroine_05.lines[0]),J([l6,l6b]));
  /* 表上的人在別間（明軒在總圖 3F）：不說那幾句 */
  fresh('2025-12-02',10.5); const s9=zone('library',0,0,0); friend('classmate_mingxuan'); const n9=npcAt('classmate_mingxuan',s9[20]); await talk('classmate_mingxuan',n9); await talk('classmate_mingxuan',n9); const o9=lines();
  check('5. 表上的人在別間（明軒在總圖 3F，表上是 A館 4F）：不說那幾句，照 LIBQ、照原本的閒聊',o9.length>0&&!L.people.classmate_mingxuan.lines.some(x=>x.some(t=>o9.includes(t))),J(o9));
  /* pool */
  fresh('2025-12-02',10.5); const s7=zone('library_hall',1,-9.6,3.0); const pids=Object.keys(CHARACTERS).filter(id=>EXLIB.isPool(id)).slice(0,2); for(const id of pids){ H.FAMILIAR(id); }
  const p1=npcAt(pids[0],s7[4]), p2=npcAt(pids[1],s7[6]); await talk(pids[0],p1); await talk(pids[0],p1); const q1=lines(); await talk(pids[1],p2); await talk(pids[1],p2); const q2=lines(); await talk(pids[0],p1); const q3=lines();
  check('5. pool（二十位同學）：點頭以後一句（四句輪流，下一個人下一句）；這學期說過了＝照原本的閒聊',J(q1)===J(L.pool[0])&&J(q2)===J(L.pool[1])&&!L.pool.some(x=>J(q3)===J(x))&&!q3.includes(NOD(pids[0])),J([q1,q2,q3]));
  /* 這一段以外、讀書區以外 */
  fresh('2025-11-25',10.5); const s8=zone('library_hall',1,-9.6,3.0); friend('heroine_01'); const n8=npcAt('heroine_01',s8[1]); await talk('heroine_01',n8); await talk('heroine_01',n8); const o1=lines();
  check('5. 第 13 週：照原本的閒聊（沒有這一段的句子）',o1.length>0&&!Object.values(L.people).some(p=>p.lines.some(x=>J(o1)===J(x))),J(o1));
});

/* ======================= 6 第 4-1 節：請朋友占位子 ======================= */
await sec('6',async()=>{
  const topics=id=>MSG.topics(H.G,id).map(q=>q.k);
  fresh('2025-12-01',19); friend('heroine_01'); friend('classmate_bohan'); friend('heroine_02'); friend('zhe'); friend('heroine_04');
  check('6. 18:00～23:00、FRIEND 以上：手機私訊多一個話題「明天幫我占位子」',topics('heroine_01').includes('exlib_seat')&&MSG.topics(H.G,'heroine_01').some(q=>q.t==='明天幫我占位子'));
  setT('2025-12-01',17.5); const t17=topics('heroine_01'); setT('2025-12-01',23.2); const t23=topics('heroine_01'); setT('2025-12-01',19);
  check('6. 18:00 以前、23:00 以後沒有；芷若沒有（考前還在排班）；第 13 週沒有',!t17.includes('exlib_seat')&&!t23.includes('exlib_seat')&&!topics('heroine_02').includes('exlib_seat')&&(setT('2025-11-24',19),!topics('heroine_01').includes('exlib_seat'))&&(setT('2025-12-01',19),true));
  H.rel('yu',10,0,0); INV.addContact(H.G,'yu'); check('6. 不熟（FRIEND 以下）沒有',!topics('yu').includes('exlib_seat'));
  /* 找一個以安答應的晚上（明天早上 8:00～9:30 沒有課、明天有讀書的時段）*/
  let dAn=null; for(let d=DK('2025-12-01');d<DK('2025-12-12');d++){ setT(d,19); if(EXLIB.goes(H.G,'heroine_01',d+1)){ dAn=d; break; } }
  check('6. 測試用的日子：以安明天會去（'+(dAn&&CALENDAR.dateOf(dAn+1).key)+'）',dAn!=null);
  setT(dAn,19); const r=MSG.send(H.G,'heroine_01','exlib_seat'); setT(dAn,22); deliver();
  check('6. 答應：照稿兩則（好。我八點到。……／九點半以前要到。），玩家那一則是「明天幫我占位子」',r.ok&&r.goes&&J(msgs('heroine_01'))===J(['我：明天幫我占位子'].concat(L.people.heroine_01.hold.yes)),J(msgs('heroine_01')));
  check('6. 一天只能問一個人：問過以後其他人今天沒有這個話題',!topics('classmate_bohan').includes('exlib_seat'));
  const hold=H.G.exlib.hold; check('6. 記下：隔天、總圖大廳二樓、到 9:30',hold&&hold.day===dAn+1&&hold.zone==='library_hall'&&hold.until===9.5&&hold.who==='heroine_01',J(hold));
  /* 隔天 */
  setT(dAn+1,8.8); const s=zone('library_hall',1,-9.6,3.0); EXLIB.syncSeats(GM,true); const ZS=EXLIB._zs(), hs=ZS.holdSeat;
  const spot=EXLIB.spotSeat(E,'library_hall','heroine_01'); const se=STORY.schedEnt(CHARACTERS.heroine_01,H.G);
  check('6. 那一間：她的位子旁邊一個「有人了」（路人、別人不坐：taken）、按鈕「坐到以安占的位子」',!!hs&&hs.taken==='exlib41'&&Math.hypot(hs.x-spot.x,hs.z-spot.z)<1.6&&E.interactables.some(it=>it.exHoldSeat===hs&&/以安/.test(it.label)),J(hs));
  check('6. 她那天早上在那一間（作息 4-1，坐她自己的位子）',se&&se.zone==='library_hall'&&se.exlib==='4-1'&&se.seatAt&&Math.hypot(se.seatAt[0]-spot.x,se.seatAt[1]-spot.z)<0.01&&se.seatAt[2]===1,J(se));
  const an=npcAt('heroine_01',spot); H.said=[]; seatCalls.length=0; H.opts=[]; await tick(); await tick();
  check('6. 玩家走進讀書區＝直接走過去坐下（不跳找不到位子）；她說到了以後那一句「（小聲）九點二十八。」',seatCalls.length===1&&seatCalls[0].seat===hs&&!H.opts.length&&lines().includes(L.people.heroine_01.hold.at[0])&&H.G.exlib.hold.arrived===true,J(lines()));
  setT(dAn+1,9.6); H.G.exlib.hold=Object.assign({},H.G.exlib.hold); EXLIB.phone(H.G); deliver();
  check('6. 到了＝她不傳沒到那一則',!msgs('heroine_01').includes(L.people.heroine_01.hold.miss[0]));
  /* 第 7 節給 BB 的測試點：前一晚請柏翰占位子，隔天 09:00 進 3F */
  { fresh('2025-12-01',19); friend('classmate_bohan'); let d=null; for(let x=DK('2025-12-01');x<DK('2025-12-12');x++){ setT(x,19); if(EXLIB.goes(H.G,'classmate_bohan',x+1)){ d=x; break; } }
    setT(d,19); MSG.send(H.G,'classmate_bohan','exlib_seat'); setT(d,22); deliver(); setT(d+1,9); zone('library',0,0,0); EXLIB.syncSeats(GM,true);
    const bs=EXLIB.spotSeat(E,'library','classmate_bohan'); npcAt('classmate_bohan',bs); H.G.exlib.atm.seen['Y1S1:library']=1; H.said=[]; seatCalls.length=0; await tick();
    const hs=seatCalls[0]&&seatCalls[0].seat;
    check('6. 前一晚請柏翰占位子、隔天 09:00 進 3F：直接坐到他旁邊那個位子，他說「（小聲）你的位子旁邊有插座，我順便看了。」',!!hs&&Math.hypot(hs.x-bs.x,hs.z-bs.z)<2.01&&J(lines())===J(L.people.classmate_bohan.hold.at),J(lines())); }
  /* 交往中：到了以後的動作照第 3 節 */
  { fresh('2025-12-01',19,'library_hall',{dating_heroine_01:true}); friend('heroine_01'); setT(dAn,19); MSG.send(H.G,'heroine_01','exlib_seat'); setT(dAn+1,8.8); const s2=zone('library_hall',1,-9.6,3.0); EXLIB.syncSeats(GM,true);
    npcAt('heroine_01',EXLIB.spotSeat(E,'library_hall','heroine_01')); H.G.exlib.atm.seen['Y1S1:library_hall']=1; H.said=[]; await tick();
    check('6. 交往中：答應那一句一樣；到了以後先第 3 節的動作（她把旁邊椅子上的書收起來），再「（小聲）九點二十八。」',J(lines())===J([L.people.heroine_01.dating].concat(L.people.heroine_01.hold.at)),J(lines())); }
  /* 沒到 */
  fresh('2025-12-01',19); friend('classmate_bohan'); let dBo=null; for(let d=DK('2025-12-01');d<DK('2025-12-12');d++){ setT(d,19); if(EXLIB.goes(H.G,'classmate_bohan',d+1)){ dBo=d; break; } }
  setT(dBo,19); MSG.send(H.G,'classmate_bohan','exlib_seat'); setT(dBo,22); deliver(); const y1=msgs('classmate_bohan');
  setT(dBo+1,11.9); EXLIB.phone(H.G); deliver(); const m0=msgs('classmate_bohan').length; setT(dBo+1,12.05); EXLIB.phone(H.G); deliver(); const m1=msgs('classmate_bohan');
  check('6. 柏翰答應（照稿）；12:00 以前不傳；12:00 還沒到＝「十二點零一分。位子收了。」',J(y1.slice(1))===J(L.people.classmate_bohan.hold.yes)&&m0===y1.length&&m1[m1.length-1]===L.people.classmate_bohan.hold.miss[0],J(m1));
  check('6. 記下這一學期沒來過',!!(H.G.exlib.noShow.Y1S1&&H.G.exlib.noShow.Y1S1.classmate_bohan));
  let dBo2=null; for(let d=dBo+1;d<DK('2025-12-13');d++){ setT(d,19); if(EXLIB.goes(H.G,'classmate_bohan',d+1)){ dBo2=d; break; } }
  setT(dBo2,19); MSG.rec(H.G).sent={}; MSG.send(H.G,'classmate_bohan','exlib_seat'); setT(dBo2,22); deliver(); const y2=msgs('classmate_bohan');
  check('6. 這一學期再問同一個人：第一句前面多一則「這次會來吧」',y2[y2.length-1-L.people.classmate_bohan.hold.yes.length]==='這次會來吧',J(y2.slice(-3)));
  /* 學姊 9:00、子晴 10:00 */
  fresh('2025-12-01',19); friend('heroine_05'); let dS=null; for(let d=DK('2025-12-01');d<DK('2025-12-12');d++){ setT(d,19); if(EXLIB.goes(H.G,'heroine_05',d+1)){ dS=d; break; } }
  setT(dS,19); MSG.send(H.G,'heroine_05','exlib_seat'); setT(dS+1,8.95); EXLIB.phone(H.G); deliver(); const sb=msgs('heroine_05').includes(L.people.heroine_05.hold.miss[0]); setT(dS+1,9.02); EXLIB.phone(H.G); deliver();
  check('6. 學姊「九點以前到」：9:00 還沒到＝「位子給一個站很久的學妹了。」（不是 12:00）',!sb&&msgs('heroine_05').includes(L.people.heroine_05.hold.miss[0]),J(msgs('heroine_05')));
  for(const late of [false,true]){ fresh('2025-12-01',19); friend('heroine_04'); let dZ=null; for(let d=DK('2025-12-01');d<DK('2025-12-14');d++){ setT(d,19); if(EXLIB.goes(H.G,'heroine_04',d+1)){ dZ=d; break; } }
    if(dZ==null){ check('6. 子晴：找不到她明天會去的日子',false); break; }
    setT(dZ,19); MSG.send(H.G,'heroine_04','exlib_seat'); setT(dZ,22); deliver(); setT(dZ+1,late?9.85:9.2); zone('library_hall',1,-9.6,3.0); EXLIB.syncSeats(GM,true);
    npcAt('heroine_04',EXLIB.spotSeat(E,'library_hall','heroine_04')); H.G.exlib.atm.seen['Y1S1:library_hall']=1; H.said=[]; await tick();
    check('6. 子晴「十點以前要來」：'+(late?'9:50 以後到＝「（小聲）九點五十九。好險。」':'9:50 以前到＝（她把耳機拿下一邊。）'),J(lines())===J(late?L.people.heroine_04.hold.at:L.people.heroine_04.hold.atEarly),J(lines())); }
  /* 不行 */
  fresh('2025-12-01',19); friend('zhe'); setT(DK('2025-12-01'),19); const gz=EXLIB.goes(H.G,'zhe',DK('2025-12-02')); MSG.send(H.G,'zhe','exlib_seat'); setT(DK('2025-12-01'),22); deliver();
  check('6. 不行（照作息：阿哲第 14 週沒有讀書的時段）＝「我明天睡到中午 不要靠我」，沒有占位子',!gz&&J(msgs('zhe').slice(1))===J(L.people.zhe.hold.no)&&!H.G.exlib.hold,J(msgs('zhe')));
  fresh('2025-12-14',19); friend('classmate_bohan'); const ex=EXLIB.goes(H.G,'classmate_bohan',DK('2025-12-15')); MSG.send(H.G,'classmate_bohan','exlib_seat'); setT('2025-12-14',22); deliver();
  check('6. 不行（明天早上考試：12/15 憲法 09:10）＝柏翰「明天我考兩科，早上不去圖書館。」',!ex&&msgs('classmate_bohan').slice(-1)[0]===L.people.classmate_bohan.hold.no[0],J(msgs('classmate_bohan')));
  fresh('2025-12-05',19); friend('heroine_03'); MSG.send(H.G,'heroine_03','exlib_seat'); setT('2025-12-05',22.5); deliver(); const ytWe=msgs('heroine_03');
  check('6. 語彤明天是週末的「不行」＝「明天我上班。」',ytWe.slice(-1)[0]===L.people.heroine_03.hold.noWe[0]||(ytWe.slice(-2).join('|')===L.people.heroine_03.hold.yes.join('|')),J(ytWe));
});

/* ======================= 7 第 4-2 節：朋友請你占 ======================= */
await sec('7',async()=>{
  const run42=(id,from,to)=>{ for(let d=DK(from);d<=DK(to);d++){ setT(d,21.05); EXLIB.phone(H.G); deliver(); const D=(H.G.exlib||{}).d42; if(D&&D.who===id&&D.askDay===d) return d; } return null; };
  fresh('2025-12-01',21); friend('zhe'); friend('yu'); friend('classmate_xinci'); friend('heroine_03');
  const dZ=run42('zhe','2025-11-30','2025-12-13');
  check('7. 阿哲：這一段某一天 21:00 私訊（照稿兩則），可以回「好。」',dZ!=null&&J(msgs('zhe').slice(0,2))===J(L.people.zhe.ask.msg)&&(()=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&/^exlib42_/.test(x.ask.id)&&x.from==='zhe'); return m&&J(m.ask.opts.map(o=>o.t))===J(['好。']); })(),J(msgs('zhe')));
  const asked=Object.keys((H.G.exlib.asked42||{}).Y1S1||{}); check('7. 一個晚上只有一個人問',asked.length>=1&&new Set(Object.values(H.G.exlib.asked42.Y1S1)).size===asked.length,J(H.G.exlib.asked42));
  const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===H.G.exlib.d42.tag); PHONE.answer(H.G,m.ask.id,0);
  check('7. 回「好。」＝記下（隔天、B1 自習室、10:40）',H.G.exlib.d42.ok===true&&H.G.exlib.d42.day===dZ+1&&H.G.exlib.d42.zone==='library_b1'&&Math.abs(H.G.exlib.d42.at-(10+40/60))<1e-9,J(H.G.exlib.d42));
  setT(dZ+1,9.5); const s=zone('library_b1',0,-14,-10); EXLIB.syncSeats(GM,true); const my=s.find(q=>q.room==='study24'&&!q.exHeld&&!q.taken); H.said=[]; await GM.seatMenu({seat:my,study:true});
  const D=H.G.exlib.d42; const res=D.seat&&s.find(q=>Math.hypot(q.x-D.seat[0],q.z-D.seat[1])<0.01);
  check('7. 10:00 以前在那一間坐下＝「（你把一本講義放在旁邊的位子上。）」、旁邊留一個位子',J(lines())===J([L.place42])&&D.placed&&!!res&&Math.hypot(res.x-my.x,res.z-my.z)<1.6&&!res.exHeld,J(lines()));
  EXLIB.syncSeats(GM,true); check('7. 留的位子不會變成「有人了」',!res.exHeld);
  setT(dZ+1,10.5); const e1=STORY.schedEnt(CHARACTERS.zhe,H.G); setT(dZ+1,10.75); const e2=STORY.schedEnt(CHARACTERS.zhe,H.G);
  check('7. 他照時間（10:40）才走進來，坐留的那個位子',(!e1||e1.exlib!=='4-2')&&e2&&e2.exlib==='4-2'&&e2.zone==='library_b1'&&Math.hypot(e2.seatAt[0]-res.x,e2.seatAt[1]-res.z)<0.01,J([e1&&e1.exlib,e2]));
  H.G.exlib.atm.seen['Y1S1:library_b1']=1; npcAt('zhe',res); H.said=[]; await tick();
  check('7. 他坐下：「（他喘著氣坐下。）（小聲）……鬧鐘沒響。謝啦。」',J(lines())===J(L.people.zhe.ask.at)&&H.said[0].who===null&&!!H.said[1].who,J(H.said));
  /* 沒去 */
  fresh('2025-12-01',21); friend('yu'); const dY=run42('yu','2025-11-30','2025-12-13'); const my2=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===(H.G.exlib.d42||{}).tag);
  if(dY==null||!my2) check('7. Alison 有問',false); else { PHONE.answer(H.G,my2.ask.id,0); setT(dY+1,10.9); EXLIB.phone(H.G); deliver(); const b=msgs('yu').length; setT(dY+1,11.02); EXLIB.phone(H.G); deliver();
    check('7. 回了「好。」但沒去：她照時間（11:00）傳「我在走廊站了二十分鐘 最後去法圖了」',msgs('yu').length===b+1&&msgs('yu').slice(-1)[0]===L.people.yu.ask.miss[0],J(msgs('yu').slice(-2))); }
  /* 10:00 以後才到 */
  fresh('2025-12-01',21); friend('yu'); const dY2=run42('yu','2025-11-30','2025-12-13'); const my3=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===(H.G.exlib.d42||{}).tag);
  if(dY2==null||!my3) check('7. Alison 有問（10:00 以後才到）',false); else { PHONE.answer(H.G,my3.ask.id,0); setT(dY2+1,10.3); const s3=zone('library_b1',0,-14,-10); EXLIB.syncSeats(GM,true);
    const st3=s3.find(q=>q.room==='study24'&&!q.taken); H.said=[]; await GM.seatMenu({seat:st3,study:true}); const placed=H.G.exlib.d42.placed; setT(dY2+1,11.02); EXLIB.phone(H.G); deliver();
    check('7. 10:00 以後才到：不放講義；她照時間傳沒占到那一則',!placed&&!lines().includes(L.place42)&&msgs('yu').slice(-1)[0]===L.people.yu.ask.miss[0],J([placed,lines(),msgs('yu').slice(-1)])); }
  /* 沒回 */
  fresh('2025-12-01',21); friend('classmate_xinci'); const dX=run42('classmate_xinci','2025-11-30','2025-12-13'); if(dX!=null){ setT(dX+1,11); EXLIB.phone(H.G); deliver(); }
  check('7. 沒回：隔天不傳沒占到',dX!=null&&!msgs('classmate_xinci').includes(L.people.classmate_xinci.ask.miss[0]),J(msgs('classmate_xinci')));
  check('7. 芯慈 4-2 問過＝這一學期 4-1 不給她（便利貼同一學期只用一個）',(setT(dX+2,19),!MSG.topics(H.G,'classmate_xinci').some(q=>q.k==='exlib_seat')));
  /* 語彤只在明天是平日問 */
  fresh('2025-12-01',21); friend('heroine_03'); const dT=run42('heroine_03','2025-11-30','2025-12-13');
  check('7. 語彤：只在明天是平日的晚上問（照稿「明天我九點才能去。……」，09:20）',dT!=null&&CALENDAR.dateOf(dT+1).wd<=5&&msgs('heroine_03')[0]===L.people.heroine_03.ask.msg[0]&&Math.abs(H.G.exlib.d42.at-(9+20/60))<1e-9,J([dT&&CALENDAR.dateOf(dT+1).key,msgs('heroine_03')]));
  check('7. 不熟（FRIEND 以下）不問',(()=>{ fresh('2025-12-01',21); H.rel('zhe',10,0,0); INV.addContact(H.G,'zhe'); return run42('zhe','2025-11-30','2025-12-13')==null; })());
});

/* ======================= 8 第 5 節：經濟系那一年 ======================= */
await sec('8',async()=>{
  fresh('2024-12-02',10,'soclib'); H.G.stage='econ'; const G=H.G;
  check('8. 經濟系那一年：表上的人換成品妤、阿勳、韋綸（法律系的人不算）',!!EXLIB.inCast(G,'econ_pinyu')&&!!EXLIB.inCast(G,'econ_zhengxun')&&!!EXLIB.inCast(G,'econ_weilun')&&!EXLIB.inCast(G,'heroine_01')&&!EXLIB.inCast(G,'classmate_bohan'));
  setT('2024-12-02',10); const py=STORY.schedEnt(CHARACTERS.econ_pinyu,G), xu=STORY.schedEnt(CHARACTERS.econ_zhengxun,G), wl=STORY.schedEnt(CHARACTERS.econ_weilun,G); setT('2024-12-02',14.5); const py2=STORY.schedEnt(CHARACTERS.econ_pinyu,G);
  check('8. 平日有讀書的時間：品妤社科圖（到 14:00）、阿勳社科圖（二樓還沒做好＝一樓）、韋綸總圖 B1',py&&py.zone==='soclib'&&xu&&xu.zone==='soclib'&&wl&&wl.zone==='library_b1'&&!(py2&&py2.zone==='soclib'),J([py,xu,wl,py2].map(e=>e&&e.zone)));
  setT('2024-11-25',10); check('8. 第 13 週沒有',!STORY.schedEnt(CHARACTERS.econ_pinyu,G));
  setT('2024-12-02',10); const s=zone('soclib',0,-9,-5); H.FRIEND('econ_pinyu'); const n=npcAt('econ_pinyu',s[16]); await talk('econ_pinyu',n); await talk('econ_pinyu',n); const l=lines();
  check('8. 社科圖的品妤：點頭以後（小聲）那一句（第 5 節）',J(l)===J(L.econ.econ_pinyu.lines[0]),J(l));
  setT('2024-12-02',19); INV.addContact(G,'econ_pinyu'); const tp=MSG.topics(G,'econ_pinyu').map(q=>q.k);
  check('8. 手機的話題不出（經濟系那一年還沒有私訊：MSG.open；休學以後也不約去台大）',!tp.includes('exlib_seat')&&(G.flags.Y0_LEFT=true,!EXLIB.topicOk(G,'econ_pinyu')),J(tp));
  check('8. 答應那一句照稿（品妤、阿勳、韋綸），韋綸到了以後那一句',J(L.econ.econ_pinyu.hold.yes)===J(['可以。早餐幫我帶，三十五塊以內。'])&&L.econ.econ_weilun.hold.at[0].startsWith('（小聲）八點二十。'));
});

/* ======================= 9 不扣關係、不改成績 ======================= */
await sec('9',async()=>{
  fresh('2025-12-01',19); const G=H.G; for(const id of ['heroine_01','classmate_bohan','zhe','yu','classmate_xinci','heroine_03','heroine_04','heroine_05']) friend(id);
  const relOf=()=>{ const o={}; for(const id of ['heroine_01','classmate_bohan','zhe','yu','classmate_xinci','heroine_03','heroine_04','heroine_05']){ const r=SOCIAL.rel(id); o[id]=['fam','trust','comf','rom'].map(k=>+r[k]||0); } return o; };
  const ex0=J(CLS.rec(G).exam||{}), st0=J(G.study||null), rel0=relOf(); ADJ.length=0;
  /* 四天：問、沒去、朋友請你占、沒占到 */
  for(let d=DK('2025-12-01');d<DK('2025-12-12');d++){ setT(d,19); MSG.rec(G).sent={}; for(const id of ['classmate_bohan','heroine_01','zhe']) if(MSG.topics(G,id).some(q=>q.k==='exlib_seat')){ MSG.send(G,id,'exlib_seat'); break; }
    setT(d,21.05); EXLIB.phone(G); deliver(); const m=(G.msgs||[]).find(x=>x.ask&&G.exlib.d42&&x.ask.id===G.exlib.d42.tag&&x.ans==null); if(m) PHONE.answer(G,m.ask.id,0);
    for(const h of [9,9.6,10.1,10.8,11.2,12.1]){ setT(d+1,h); EXLIB.phone(G); deliver(); } }
  const rel1=relOf(); const down=Object.keys(rel0).filter(id=>rel1[id].some((v,i)=>v<rel0[id][i]));
  check('9. 兩週裡一直沒去：只發那一則（沒到、沒占到），SOCIAL.adjust 沒有負的、關係數值沒有下降',(G.exlib.noShow.Y1S1&&Object.keys(G.exlib.noShow.Y1S1).length>0)&&!neg().length&&!down.length,J({noShow:G.exlib.noShow,neg:neg(),down}));
  check('9. 不改成績、讀書進度（考試紀錄、G.study 不變）',J(CLS.rec(G).exam||{})===ex0&&J(G.study||null)===st0);
});

/* ======================= 10 舊存檔 ======================= */
await sec('10',async()=>{
  fresh('2025-12-02',10.5); const G=H.G; delete G.exlib;
  check('10. 沒有 G.exlib 的舊存檔：時段、作息照算、不寫存檔',EXLIB.on(G)===true&&!!STORY.schedEnt(CHARACTERS.heroine_05,G)&&G.exlib===undefined);
  setT('2025-11-20',12); EXLIB.phone(G); EXLIB.syncSeats(GM,true); setT('2025-12-02',10.5);
  check('10. 這一段以外：每一格的手機規則、座位不建 G.exlib',G.exlib===undefined);
  const R=EXLIB.rec(G); check('10. 第一次用到才補預設',R&&R.v===1&&typeof R.atm==='object'&&typeof R.nod==='object'&&R.hold==null);
  G.exlib='壞掉的'; const R2=EXLIB.rec(G); G.exlib.hold={who:'x'}; const R3=EXLIB.rec(G);
  check('10. 壞掉的欄位重設（不丟例外）',R2&&R2.v===1&&R3.hold===null);
  G.exlib.said={Y1S1:{heroine_01:2}}; const back=JSON.parse(J(G)); check('10. JSON 存讀',J(back.exlib)===J(G.exlib));
});

/* ======================= 11 BB_260 多給的讀書時段（BB-C 11-04 17:3x，企劃線 BB 分支 e814965c2）======================= */
/* 只填空檔（作息沒有東西、或只是 wander／walk）；上課、吃飯（劇情、約好的）照舊；子晴一三五 13～17:30、六 10～15（總圖大廳二樓）；阿哲一～四 10:40～16:30、日 13～18（B1）；
   Alison 一二四五 11～17（B1）；明軒大二以後一～四 13～19（A館 4F）；第 13 週、期末考考完以後沒有。修改前（8215f8d53）：子晴、阿哲、Alison、明軒的空檔都是 null＝FAIL */
await sec('11',async()=>{
  fresh('2025-12-01',10); const G=H.G;
  const at=(id,k,h)=>{ setT(k,h); const e=STORY.schedEnt(CHARACTERS[id],G); return e?(e.zone+(e.exlib?'/'+e.exlib:'')+(e.act&&e.act!=='read'?'/'+e.act:'')):'null'; };
  const want=(name,id,k,h,exp)=>{ const r=at(id,k,h); check('11. '+name+'：'+exp,typeof exp==='function'?exp(r):r===exp,r); };
  want('子晴 第 14 週一 13:30＝總圖大廳二樓','heroine_04','2025-12-01',13.5,'library_hall/bb260');
  want('子晴 週三 17:00','heroine_04','2025-12-03',17,'library_hall/bb260');
  want('子晴 週二 13:30 照原本（沒有加）','heroine_04','2025-12-02',13.5,'null');
  want('子晴 週六 10:30','heroine_04','2025-12-06',10.5,'library_hall/bb260');
  want('子晴 週一 18:00（時段外）','heroine_04','2025-12-01',18,'null');
  want('子晴 第 13 週一 13:30 沒有','heroine_04','2025-11-24',13.5,'null');
  want('阿哲 週一 11:00 上課照舊','zhe','2025-12-01',11,r=>/^classroom/.test(r)&&!/bb260/.test(r));
  want('阿哲 週一 14:00＝B1','zhe','2025-12-01',14,'library_b1/bb260');
  want('阿哲 週一 16:00（原本在校園晃）＝B1','zhe','2025-12-01',16,'library_b1/bb260');
  want('阿哲 週五 14:00 不去','zhe','2025-12-05',14,'null');
  want('阿哲 週日 13:30＝B1','zhe','2025-12-07',13.5,'library_b1/bb260');
  want('阿哲 週日 12:00 吃飯照舊','zhe','2025-12-07',12,r=>/\/eat$/.test(r));
  want('Alison 週一 15:00＝B1','yu','2025-12-01',15,'library_b1/bb260');
  want('Alison 週三 15:00 不去','yu','2025-12-03',15,'null');
  want('Alison 週一 11:00 上課照舊','yu','2025-12-01',11,r=>!/bb260/.test(r));
  want('明軒 大二上第 14 週一 13:30＝A館 4F','classmate_mingxuan','2026-12-07',13.5,'linze_4f/bb260');
  want('明軒 大二 週一 18:00（原本在 118 巷走路）＝A館 4F','classmate_mingxuan','2026-12-07',18,'linze_4f/bb260');
  want('明軒 大二 週五 14:00 不去','classmate_mingxuan','2026-12-11',14,'null');
  want('明軒 大一 週一 13:30 不加（大二以後）','classmate_mingxuan','2025-12-01',13.5,'null');
  const end=(()=>{ for(let d=DK('2025-12-15');d<DK('2026-01-20');d++){ setT(d,13.5); if(!EXLIB.on(G,d,13.5)&&CALENDAR.dateOf(d).wd===1) return d; } return null; })();
  check('11. 期末考考完以後的週一 13:30：子晴沒有',end!=null&&at('heroine_04',end,13.5)!=='library_hall/bb260',String(end));
  check('11. 經濟系那一年不用這張表（S.EXTRA 只給法律系）',(()=>{ const st=G.stage; G.stage='econ'; const r=EXLIB.extraSlot(G,'zhe',DK('2025-12-01'),14); G.stage=st; return r===null; })());
});

H.done(); })();
