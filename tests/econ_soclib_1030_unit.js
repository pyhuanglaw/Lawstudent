// AA_536 經濟系的同學在社科院圖書館遇得到（企劃線 1a65846c5；AA-B 定稿 D109；任務 ECON-FRIENDS-SOCLIB-1030，USER_WANTS X141）——不需要瀏覽器。
//   使用者 2026-10-30 05:1x：「經濟系以前的同學 要能夠在社科院圖書館遇到吧」。
//   src/data/econfr_soclib.js（ECONFR_SOCLIB 台詞）、src/econsl3d.js（ECONSL 點人說話）、src/data/characters.js 四人的 daily_schedule（zone soclib）、src/story3d.js talkCharacter 兩個掛勾。
//   0  讀稿、白名單（1a65846c5 approved）、新檔載得到、index.html 順序；稿 → 遊戲（第 2 節四張表的每一句與 when、四組打招呼、旁白、館員那一句、第 0 節兩句自我介紹）、
//      遊戲 → 稿（ECONFR_SOCLIB 的每一句都在稿上；唐睿、韋綸的自我介紹＝events.js 現有那一句〔S.tangIntro／S.wlIntro〕）；第 1 節作息表每一列的時間、label 在稿上
//   1  第 1 節作息（STORY.schedEnt）：每一列的學期、星期、時段在社科圖、label 照稿；時段外、別的星期、別的學期不在；品妤大一下週二週四照舊補習班；
//      阿勳大三下 3/22 以前在、以後不在、週三擲到 D2 的 15:20～15:45 照現有在社科院門口；唐睿只在品妤也在的晚上；韋綸只有考試週（calendar.js 的 exam）週四；大一上一個都不在；家豪不出現；
//      寒暑假、國定（校定）假日一個都不在；每一筆都在社科圖的開館時間內
//   2  走進社科圖（STORY.populate，真的座位 SL3.seatsOf）：第 4 節測試清單——大二上週一 19:30 品妤在長桌（SK12 那張，座位 16）；大三上週二 20:00、大三下週三 20:00
//      品妤、唐睿同時在、不同位子（不同桌）；考試週週四 19:30 韋綸在（另一張長桌）；寒暑假、國定假日一個都不在
//   3  點他們說話（STORY.talkCharacter）：第 4 節——沒玩前傳的存檔：旁白 → 自我介紹 → met，之後記 MET_PINYU（也記 FIRST_MET）；玩過前傳：旁白 → met（不自我介紹），
//      前傳那一句之後出一次；一天最多一句、說完換打招呼輪流（本人＋館員那一句、照順序）；這一學期沒說完的不帶到下一學期；阿勳 MET_XUN、唐睿 tangIntro、韋綸 wlIntro；
//      阿勳大三下 3/22 以前那一句、3/22 以後那一句在別處（校園）說一次；品妤 SK12 那四天不接；不新增訊息、邀約、事件
//   4  舊存檔：沒有 ECON_SL、ECON_SL 壞掉都不丟例外
// 修改前（3808792fe：git archive 出這個 commit 的 src、lib、index.html、tests，只換上這支測試和新的白名單，ECONSL_DOCREPO 指這個 repo 實際跑過）：FAILED 51、PASS 24
//   （PASS＝讀稿五項、白名單〔用新的〕、作息表在稿上、三個前提，以及「本來就不在／照現有」的項目：表外時段、大一上、補習班、唐睿跟著品妤、家豪、寒暑假、假日、開館時間、
//   點不到人所以「沒有自我介紹那一套」「不新增訊息」、校園照現有、SK12 不說閒聊）。修改後 ALL PASS（75 項）。
// 用法：node tests/econ_soclib_1030_unit.js（在沒有 .git 的目錄跑，設環境變數 ECONSL_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{}});
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
global.CHAR=Object.assign(global.CHAR||{},{build:()=>mkObj(),setExpr(){}});
/* index.html 的順序載入其餘的檔（同 tests/aa521_econ_friends_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const SCRIPTS=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
{ const files=SCRIPTS.filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.D=GM.D||{}; GM.D.busyDepth=0;
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
const warns=[]; { const w0=console.warn; console.warn=(...a)=>{ warns.push(a.map(String).join(' ').slice(0,200)); }; void w0; }
const X=()=>typeof ECONSL!=='undefined'?ECONSL:null, LX=()=>typeof ECONFR_SOCLIB!=='undefined'?ECONFR_SOCLIB:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const unq=s=>String(s==null?'':s).replace(/^「([\s\S]*)」$/,'$1');
const IDS=['econ_pinyu','econ_zhengxun','econ_tangrui','econ_weilun'];
const NAMEOF={'品妤':'econ_pinyu','阿勳':'econ_zhengxun','唐睿':'econ_tangrui','韋綸':'econ_weilun'};
/* 學期第幾週星期幾（wd：1＝週一 … 7＝週日）*/
const TD=(t,w,wd)=>{ const R=CALENDAR.termDays(t); return R?R.from+(w-1)*7+(wd-1):null; };
/* 那一學期第 w 週起第一個星期 wd、不是假日的日子 */
const dayIn=(t,wd,w0,ok)=>{ for(let w=w0||3;w<=16;w++){ const d=TD(t,w,wd); if(d!=null&&!CALENDAR.holiday(d)&&(!ok||ok(d))) return d; } return null; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(keyOf(D(d)),h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; G.goal=''; PHONE.rec(G); E.player.busy=false; E.paused=false; E.player.lv=0; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM); return G; };
const at=(d,h)=>{ H.at(keyOf(D(d)),h); };
const ent=(id,d,h)=>{ at(d,h); return STORY.schedEnt(CHARACTERS[id],H.G); };
const inSL=(id,d,h)=>{ const e=ent(id,d,h); return !!e&&e.zone==='soclib'; };
/* 走進社科圖（STORY.populate；真的座位）：回傳在場的人、坐的位子、說話的入口 */
const SEATS=()=>SL3.seatsOf(SOCLIB_LAYOUT);
const settle=async()=>{ for(let i=0;i<200&&(EVENTS.running||(GM.D&&GM.D.busyDepth>0));i++) await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); };
const enter=(zone)=>{ const G=H.G; G.zone=zone; G.social=G.social||{};
  E.npcs=[]; E.zone={id:zone,seats:zone==='soclib'?SEATS():[],spawn:{x:-9,z:9.3,lv:0},spots:{}}; E.levels=null; E.indoor=true; E.addNPC=n=>{ E.npcs.push(n); return n; }; E.canStand=()=>true; E.interactables=[]; E.q={level:'high'};
  const talks={}; GM.npc={};
  GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; const ob=mkObj(); ob.position.set(x,0,z); const n={obj:ob,id,charId:id,beh:'idle',pose:(o||{}).pose,seat:(o||{}).seat||null,lv:0,name:id}; E.npcs.push(n); GM.npc[id]=n; talks[id]=(o&&o.talk)||(nn=>STORY.talkCharacter(id,nn)); return n; };
  GM.spawnNPC=(id,spec,x,z,o)=>{ const n=GM.spawnCharacter(id,x,z,o); talks[id]=o&&o.talk; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; }; GM.spawnExtra=()=>{}; GM.spawnRider=()=>{}; GM.knownIds=()=>[];
  warns.length=0; STORY.populate(zone,GM);
  return {ids:Object.keys(GM.npc),seat:id=>GM.npc[id]&&GM.npc[id].seat,talk:async id=>{ H.said=[]; H.opts=[]; H.picks=['就這樣','就這樣','就這樣']; const f=talks[id]; if(!f) return [];   /* 不在場＝什麼都沒說（修改前：每一項照樣算 FAIL，不在中途丟例外）*/ await f(GM.npc[id]); await settle(); return H.said.map(s=>s.t); }}; };
/* 不經過 populate：直接放一個人在玩家旁邊、點他說話（同一天反覆點、換日子用）*/
const talkNow=async(id)=>{ const ob=mkObj(); const n={obj:ob,id,charId:id,beh:'idle',pose:'read',seat:{x:0,z:0,yaw:0},lv:0,name:id}; GM.npc[id]=n; H.said=[]; H.opts=[]; H.picks=['就這樣','就這樣','就這樣'];
  await STORY.talkCharacter(id,n); await settle(); return H.said.map(s=>s.t); };
const metHas=id=>SOCIAL.has(id,'FIRST_MET');
const OWNS=(G,id,first)=>X()?X().owns(G,id,first):null;   /* 修改前沒有 ECONSL＝null（算 FAIL，不丟例外）*/

/* ---------- 讀稿 ---------- */
const SHA='1a65846c5', DOCF='docs/story_planning/AA_536_經濟系同學在社科院圖書館_作息與台詞.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.ECONSL_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+1):-1; return S.slice(i,j<0?S.length:j); };
const rowsOf=t=>String(t).split('\n').filter(l=>/^\|/.test(l)&&!/^\|\s*(---|when|誰|節)\s*\|/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
/* 「…」（可以有巢狀的「」）＝開頭那一個到配對的那一個 */
const firstQ=s=>{ s=String(s); const i=s.indexOf('「'); if(i<0) return null; let dep=0; for(let k=i;k<s.length;k++){ if(s[k]==='「') dep++; else if(s[k]==='」'){ dep--; if(dep===0) return s.slice(i,k+1); } } return null; };
const WHENZH=w=>{ if(/^met/.test(w)) return 'met'; if(/PLAYED_Y0/.test(w)) return 'y0'; if(/^任何學期/.test(w)) return 'any'; if(/^大三下（3\/22 以前）/.test(w)) return 'Y3S2pre'; if(/^大三下（3\/22 以後/.test(w)) return 'Y3S2post';
  return {'大一下':'Y1S2','大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2','大二':'Y2','大三':'Y3'}[w]||('?'+w); };
const S0=part('## 0. ','## 1. '), S1=part('## 1. ','## 2. '), S2=part('## 2. ','## 3. '), S4=part('## 4. ',null);
const SUB={econ_pinyu:part('### 2-2','### 2-3',S2),econ_zhengxun:part('### 2-3','### 2-4',S2),econ_tangrui:part('### 2-4','### 2-5',S2),econ_weilun:part('### 2-5',null,S2)};
const DOCTALK={}, DOCGREET={};
for(const id of IDS){ DOCTALK[id]=rowsOf(SUB[id]).map(c=>({when:WHENZH(c[0]),t:firstQ(c[1])})).filter(x=>x.t);
  const g=part('- 打招呼輪流：',null,SUB[id]); DOCGREET[id]=g.split('\n').slice(1).map(l=>l.replace(/^\s*>\s?/,'').trim()).filter(Boolean).filter(l=>/^[（「]/.test(l)); }
const S21=part('### 2-1','### 2-2',S2);
const NARR=(()=>{ const i=S21.indexOf('固定一句旁白'); return i<0?null:((/>\s*(（[^\n]+）)/.exec(S21.slice(i))||[])[1]||null); })();
const GALL=(()=>{ const i=S21.indexOf('三種人都有的打招呼'); return i<0?null:((/>\s*(（[^\n]+）)/.exec(S21.slice(i))||[])[1]||null); })();
const INTRO0={econ_pinyu:((/- 品妤：(「[^\n]+」)/.exec(S0)||[])[1]||null),econ_zhengxun:((/- 阿勳：(「[^\n]+」)/.exec(S0)||[])[1]||null)};
const INTRO_FN=/唐睿：`S\.tangIntro`；韋綸：`S\.wlIntro`/.test(S0);
/* 第 1 節作息表（測試裡的期待值；每一列的關鍵字串要在稿的那一列上）*/
const SCHED=[
  {id:'econ_pinyu',row:'| 品妤 | 大一下 |',terms:['Y1S2'],days:[1,3],from:19,to:21.5,label:'念書',docs:['週一、週三 19:00～21:30','念書']},
  {id:'econ_pinyu',row:'| 品妤 | 大二上、大二下 |',terms:['Y2S1','Y2S2'],days:[1,3],from:19,to:21.5,label:'念書、對系學會的帳',docs:['週一、週三 19:00～21:30','念書、對系學會的帳']},
  {id:'econ_pinyu',row:'| 品妤 | 大二上、大二下 |',terms:['Y2S1','Y2S2'],days:[6],from:13,to:17,label:'念書、對系學會的帳',docs:['週六 13:00～17:00']},
  {id:'econ_pinyu',row:'| 品妤 | 大三上 |',terms:['Y3S1'],days:[1,2,3,4],from:18.5,to:21.5,label:'念精算',docs:['週一～週四 18:30～21:30','念精算']},
  {id:'econ_pinyu',row:'| 品妤 | 大三上 |',terms:['Y3S1'],days:[6],from:10,to:17,label:'念精算',docs:['週六 10:00～17:00']},
  {id:'econ_pinyu',row:'| 品妤 | 大三下（到 2028-06-03） |',terms:['Y3S2'],days:[1,3],from:19,to:21,label:'念精算、準備面試',until:'2028-06-03',docs:['週一、週三 19:00～21:00','念精算、準備面試']},
  {id:'econ_zhengxun',row:'| 阿勳 | 大二上～大三上 |',terms:['Y2S1'],days:[3],from:14,to:17,label:'統計作業',docs:['週三 14:00～17:00','跑研究的資料（大二上是統計作業）']},
  {id:'econ_zhengxun',row:'| 阿勳 | 大二上～大三上 |',terms:['Y2S2','Y3S1'],days:[3],from:14,to:17,label:'跑研究的資料',docs:['週三 14:00～17:00','跑研究的資料']},
  {id:'econ_zhengxun',row:'| 阿勳 | 大三上 |',terms:['Y3S1'],days:[6],from:10,to:12,label:'跑研究的資料',docs:['另加週六 10:00～12:00']},
  {id:'econ_zhengxun',row:'| 阿勳 | 大三下 |',terms:['Y3S2'],days:[1,3],from:14,to:17,label:'準備發表',until:'2028-03-21',docs:['3/22 以前：週一、週三 14:00～17:00；3/22 以後不排','準備發表']},
  {id:'econ_tangrui',row:'| 唐睿 |',terms:['Y3S1'],days:[2],from:19.5,to:21,label:'念書',docs:['大三上週二','19:30～21:00','「念書」']},
  {id:'econ_tangrui',row:'| 唐睿 |',terms:['Y3S2'],days:[3],from:19.5,to:21,label:'念書',until:'2028-06-03',docs:['大三下週三','19:30～21:00']},
  {id:'econ_weilun',row:'| 韋綸 |',terms:['Y2S1','Y2S2','Y3S1','Y3S2'],days:[4],from:19,to:21,label:'期中、期末抱佛腳',exam:true,until:'2028-06-03',docs:['大二上～大三下','週四 19:00～21:00','期中、期末抱佛腳']} ];
const docRow=r=>{ const l=DOC.split('\n').find(x=>x.startsWith(r.row)&&r.docs.every(k=>x.includes(k))); return l||null; };
const WD7=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };   /* 作息的星期：0＝週日 */
const dayOfTerm=(t,wd,o)=>dayIn(t,wd===0?7:wd,(o&&o.w0)||3,d=>{ if(o&&o.until&&d>D(o.until)) return false; if(o&&o.exam!=null){ const T=CALENDAR.termOf(d); if(!!(T&&T.exam)!==o.exam) return false; } if(o&&o.notExam){ const T=CALENDAR.termOf(d); if(T&&T.exam) return false; } return true; });

(async()=>{
/* ======================= 0 讀稿、白名單、逐字 ======================= */
await sec('0',async()=>{
  check('0. 讀得到稿（git show '+SHA+'）：第 0～4 節都在',!!DOC&&['## 0. 先說結論','## 1. 作息','## 2. 遇到的時候','### 2-2','### 2-5','## 3. 不做的','## 4. 給 LAWWW-B'].every(s=>DOC.includes(s)),DOC?'':'讀不到：沒有 .git 時設 ECONSL_DOCREPO');
  check('0. 讀稿：四張表（品妤 9、阿勳 7、唐睿 4、韋綸 3 句）、四組打招呼（3、3、2、2）、旁白、館員那一句、品妤阿勳的自我介紹、唐睿韋綸照 S.tangIntro／S.wlIntro',
    DOCTALK.econ_pinyu.length===9&&DOCTALK.econ_zhengxun.length===7&&DOCTALK.econ_tangrui.length===4&&DOCTALK.econ_weilun.length===3&&J(IDS.map(i=>DOCGREET[i].length))===J([3,3,2,2])&&!!NARR&&!!GALL&&!!INTRO0.econ_pinyu&&!!INTRO0.econ_zhengxun&&INTRO_FN,
    J({t:IDS.map(i=>DOCTALK[i].length),g:IDS.map(i=>DOCGREET[i].length),NARR,GALL,INTRO0,INTRO_FN}));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), hit=(A.files||[]).filter(e=>e.path===DOCF);
  check('0. 白名單：AA_536 照 1a65846c5、status approved、approvedBy',hit.length===1&&hit[0].sha===SHA&&hit[0].status==='approved'&&!!hit[0].approvedBy,J(hit.map(e=>[e.sha,e.status])));
  check('0. 新檔載得到（ECONSL、ECONFR_SOCLIB）；全部的檔載入沒有錯誤',!loadErr.length&&!!X()&&!!LX(),J(loadErr));
  const ix=f=>SCRIPTS.indexOf(f);
  check('0. index.html：econfr3d.js → data/econfr_soclib.js → econsl3d.js（相鄰）；在 story3d.js、characters.js、soclib3d.js 以後，GAME.boot() 前面',
    ix('src/econfr3d.js')>=0&&ix('src/data/econfr_soclib.js')===ix('src/econfr3d.js')+1&&ix('src/econsl3d.js')===ix('src/data/econfr_soclib.js')+1&&ix('src/econsl3d.js')>ix('src/story3d.js')&&ix('src/econsl3d.js')>ix('src/data/characters.js')&&ix('src/econsl3d.js')>ix('src/soclib3d.js')&&html.indexOf('src/econsl3d.js')<html.indexOf('GAME.boot()'),
    J([ix('src/econfr3d.js'),ix('src/data/econfr_soclib.js'),ix('src/econsl3d.js')]));
  const L=LX()||{people:{}};
  for(const id of IDS){ const P=L.people[id]||{talk:[],greet:[]}, g=(P.talk||[]).map(e=>({when:e.when,t:e.t}));
    check('0. 稿 → 遊戲 '+id+'：表上每一句、when、順序一字不差',J(g)===J(DOCTALK[id]),J({doc:DOCTALK[id].filter(x=>!g.some(y=>y.t===x.t&&y.when===x.when)).map(x=>x.when+' '+x.t),game:g.filter(x=>!DOCTALK[id].some(y=>y.t===x.t&&y.when===x.when)).map(x=>x.when+' '+x.t)}));
    check('0. 稿 → 遊戲 '+id+'：打招呼輪流（本人那幾句，照順序）',J(P.greet||[])===J(DOCGREET[id]),J({doc:DOCGREET[id],game:P.greet})); }
  check('0. 稿 → 遊戲：旁白、館員那一句（三種人都有的打招呼）',L.narr===NARR&&L.greetAll===GALL,J([L.narr,L.greetAll]));
  check('0. 自我介紹：品妤、阿勳照稿第 0 節；唐睿、韋綸＝events.js 現有那一句（S.tangIntro／S.wlIntro 那一行）',
    (L.people.econ_pinyu||{}).intro===INTRO0.econ_pinyu&&(L.people.econ_zhengxun||{}).intro===INTRO0.econ_zhengxun&&
    ['econ_tangrui','econ_weilun'].every(id=>{ const t=unq((L.people[id]||{}).intro), sp=id==='econ_tangrui'?'唐睿':'韋綸', fn=id==='econ_tangrui'?'tangIntro':'wlIntro';
      return !!t&&STORY_EVENTS.some(e=>(e.dialogue||[]).some(l=>l&&l.speaker===sp&&l.text===t&&l.if&&typeof l.if.custom==='function'&&String(l.if.custom).includes(fn))); }),
    J(IDS.map(i=>(L.people[i]||{}).intro)));
  /* 遊戲 → 稿：每一句都在稿上（引號裡的字） */
  const all=[]; for(const id of IDS){ const P=L.people[id]||{}; for(const e of P.talk||[]) all.push(e.t); for(const t of P.greet||[]) all.push(t); } all.push(L.narr,L.greetAll,(L.people.econ_pinyu||{}).intro,(L.people.econ_zhengxun||{}).intro);
  const miss=all.filter(t=>!t||!DOC.includes(t));
  check('0. 遊戲 → 稿：ECONFR_SOCLIB 的每一句都在稿上（'+all.length+' 句）',!!L.narr&&!miss.length,J(miss));
  /* 作息表 */
  const noRow=SCHED.filter(r=>!docRow(r));
  check('0. 第 1 節作息表：測試期待的每一列（誰、學期、時段、label）都在稿的那一列上',!noRow.length,J(noRow.map(r=>r.row+' '+r.docs.join('／'))));
  check('0. 稿：寒暑假、國定假日、校定假日都不排；品妤 SK12 那幾天照事件；大一上不排；宋家豪學長不出現',/寒暑假、國定假日、校定假日都不排/.test(S1)&&/SK12（2027-12-20～23 19:00～21:00，座位 16）那幾天照事件，她的閒聊不出/.test(S1)&&/大一上不排/.test(S1)&&/宋家豪學長不出現/.test(DOC));
});

/* ======================= 1 作息 ======================= */
await sec('1',async()=>{
  fresh('2026-03-02',12,'campus',{MET_PINYU:true,MET_XUN:true});
  const bad=[], seen=[];
  for(const r of SCHED){ for(const t of r.terms){ for(const wd of r.days){
    const d=dayOfTerm(t,wd,{until:r.until,exam:r.exam?true:undefined}); if(d==null){ bad.push(r.id+' '+t+' 週'+wd+'：找不到日子'); continue; }
    for(const mid of [r.from+0.25,r.to-0.25]){ const e=ent(r.id,d,mid); seen.push(r.id+' '+keyOf(d)+' '+mid);   /* 開頭、結尾各一個時間（阿勳週三 15:20～15:45 擲到 D2 的日子在社科院門口：照現有，見下面那一項）*/
      if(!e||e.zone!=='soclib'||e.label!==r.label||!e.seatAt||!e.noHoliday||!String(e.note||'').includes('AA_536')) bad.push(r.id+' '+keyOf(d)+' '+mid+'：'+J(e&&{z:e.zone,l:e.label,n:e.noHoliday})); }
    if(inSL(r.id,d,r.from-0.05)&&!SCHED.some(o=>o!==r&&o.id===r.id&&o.terms.includes(t)&&o.days.includes(wd)&&r.from-0.05>=o.from&&r.from-0.05<o.to)) bad.push(r.id+' '+keyOf(d)+' 開始以前就在');
    if(inSL(r.id,d,r.to)) bad.push(r.id+' '+keyOf(d)+' '+r.to+' 結束了還在'); } } }
  check('1. 第 1 節每一列：學期、星期、時段的開頭與結尾都在社科圖、label 照稿、有 seatAt、noHoliday、note 寫 AA_536；開始以前、結束的時候不在',!bad.length,J(bad.slice(0,6)));
  /* 別的星期、別的學期 */
  const off=[];
  for(const id of IDS){ const rows=SCHED.filter(r=>r.id===id);
    for(const t of ['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']) for(const wd of [0,1,2,3,4,5,6]) for(const hh of [10.5,14.5,19.75]){
      const want=rows.some(r=>r.terms.includes(t)&&r.days.includes(wd)&&hh>=r.from&&hh<r.to); if(want) continue;
      const d=dayOfTerm(t,wd); if(d!=null&&inSL(id,d,hh)) off.push(id+' '+t+' 週'+wd+' '+hh); } }
  check('1. 表上沒有的學期、星期、時段一律不在社科圖（大一上也不在）',!off.length,J(off.slice(0,8)));
  { const offY1=IDS.filter(id=>[1,2,3,4,6].some(wd=>{ const d=dayOfTerm('Y1S1',wd); return [10.5,14.5,19.75,20.5].some(hh=>inSL(id,d,hh)); }));
    check('1. 大一上（他們大二上，祐廷剛進法律系）一個都不在社科圖',!offY1.length,J(offY1)); }
  { const d=dayOfTerm('Y1S2',2); const e=ent('econ_pinyu',d,19.5); check('1. 品妤大一下週二、週四晚上照現有：補習班櫃台（不在社科圖）',!!e&&e.zone===null&&/補習班/.test(e.away||''),J(e&&{z:e.zone,a:e.away})); }
  { let dd=null, n=0; for(const t of ['Y2S1','Y2S2','Y3S1']) for(let w=3;w<=15;w++){ const d=TD(t,w,3); if(CALENDAR.holiday(d)) continue; n++; const e=ent('econ_zhengxun',d,15.5); if(e&&e.zone==='campus'&&e.b106d2){ dd=d; break; } }
    const e2=dd!=null?ent('econ_zhengxun',dd,15.1):null, e3=dd!=null?ent('econ_zhengxun',dd,15.8):null;
    check('1. 阿勳週三 14:00～17:00 在社科圖；擲到 D2 的週三（'+(dd!=null?keyOf(dd):'?')+'）15:20～15:45 照現有在社科院門口（D2 排在前面），前後照樣在社科圖',dd!=null&&!!e2&&e2.zone==='soclib'&&!!e3&&e3.zone==='soclib',J({dd:dd!=null&&keyOf(dd),n})); }
  { const d1=D('2028-03-20'), d2=D('2028-03-22'), d3=D('2028-03-27');
    check('1. 阿勳大三下：3/20（一）15:00 在社科圖（準備發表）；3/22（三，發表那天）、3/27（一）不在',inSL('econ_zhengxun',d1,15)&&!inSL('econ_zhengxun',d2,15)&&!inSL('econ_zhengxun',d3,15),J([keyOf(d1),keyOf(d2),keyOf(d3)])); }
  { const bad2=[]; for(const t of ['Y3S1','Y3S2']) for(let w=1;w<=16;w++) for(const wd of [1,2,3,4,5,6,7]){ const d=TD(t,w,wd); for(const hh of [19.6,20,20.9]){ if(inSL('econ_tangrui',d,hh)&&!inSL('econ_pinyu',d,hh)) bad2.push(keyOf(d)+' '+hh); } }
    check('1. 唐睿在社科圖的每一個時間，品妤也在（大三上、大三下逐日逐時）',!bad2.length,J(bad2.slice(0,5))); }
  { const ex=[], non=[]; for(const t of ['Y2S1','Y2S2','Y3S1','Y3S2']) for(let w=1;w<=16;w++){ const d=TD(t,w,4); if(CALENDAR.holiday(d)) continue; const T=CALENDAR.termOf(d), isEx=!!(T&&T.exam)&&d<=D('2028-06-03'); const there=inSL('econ_weilun',d,19.5); if(isEx&&!there) ex.push(keyOf(d)); if(!isEx&&there) non.push(keyOf(d)); }
    const wks=[...new Set(['Y2S1'].flatMap(t=>[...Array(16).keys()].map(i=>i+1).filter(w=>inSL('econ_weilun',TD(t,w,4),19.5))))];
    check('1. 韋綸：考試週（calendar.js termOf 的 exam）的週四 19:30 都在、其他週四不在；大三下到 6/3（畢業）',!ex.length&&!non.length,J({ex,non,Y2S1weeks:wks})); }
  { const n=(CHARACTERS.econ_jiahao.daily_schedule||[]).filter(e=>e.zone==='soclib').length; check('1. 宋家豪學長不出現（沒有社科圖的作息）',n===0,String(n)); }
  /* 寒暑假、國定假日 */
  { const brk=[], hol=[];
    for(const k of ['2026-07-06','2026-07-08','2026-07-11','2027-01-25','2027-01-27','2027-01-28','2027-07-12','2027-07-14','2027-07-15','2028-01-24','2028-01-26','2028-01-27','2028-01-29']){ const d=D(k); for(const hh of [10.5,14.5,15,19.5,20]) for(const id of IDS) if(inSL(id,d,hh)) brk.push(id+' '+k+' '+hh); }
    let nh=0; for(const t of ['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']){ const R=CALENDAR.termDays(t); for(let d=R.from;d<=R.to;d++){ if(!CALENDAR.holiday(d)) continue; nh++; for(const hh of [10.5,14.5,15,19.5,20]) for(const id of IDS) if(inSL(id,d,hh)) hol.push(id+' '+keyOf(d)+' '+hh); } }
    check('1. 寒暑假（含週一、三、四、六）一個都不在社科圖',!brk.length,J(brk.slice(0,5)));
    check('1. 國定、校定假日（大一下～大三下學期中 '+nh+' 天）一個都不在社科圖',nh>0&&!hol.length,J(hol.slice(0,5))); }
  /* 開館時間內 */
  { const bad3=[]; for(const id of IDS) for(const e of (CHARACTERS[id].daily_schedule||[]).filter(x=>x.zone==='soclib')) for(const t of e.terms||[]){ const R=CALENDAR.termDays(t); for(let d=R.from;d<=R.to;d++){ if(!e.days.includes(WD7(d))||CALENDAR.holiday(d)) continue; if(!PLACES.isOpen('soclib',e.from,d)||!PLACES.isOpen('soclib',e.to-0.01,d)) bad3.push(id+' '+keyOf(d)+' '+e.from+'～'+e.to); } }
    check('1. 每一筆社科圖的作息都在開館時間內（PLACES.isOpen，學期中逐日）',!bad3.length,J(bad3.slice(0,5))); }
});

/* ======================= 2 走進社科圖 ======================= */
await sec('2',async()=>{
  const seats=SEATS(), s16=seats[16];
  { const d=dayOfTerm('Y2S1',1); fresh(d,19.5,'soclib',{}); const R=enter('soclib'), st=R.seat('econ_pinyu');
    check('2. 沒玩前傳的存檔，大二上週一 19:30 進社科圖：品妤在、坐長桌（SK12 那張＝座位 16 那一張 '+(s16&&s16.table)+'）',R.ids.includes('econ_pinyu')&&!!st&&st.table===s16.table&&st.kind==='table',J({ids:R.ids,st,warn:warns.filter(w=>/schedule/.test(w))}));
    check('2. （同上）座位就是座位 16（r3_3d.js SK12_SEAT）',!!st&&Math.abs(st.x-s16.x)<0.01&&Math.abs(st.z-s16.z)<0.01,J(st)); }
  for(const [k,label] of [[()=>dayOfTerm('Y3S1',2),'大三上週二'],[()=>dayOfTerm('Y3S2',3,{until:'2028-06-03'}),'大三下週三']]){ const d=k(); fresh(d,20,'soclib',{PLAYED_Y0:true,MET_PINYU:true,MET_XUN:true,KNOWS_TANG:true}); const R=enter('soclib'), a=R.seat('econ_pinyu'), b=R.seat('econ_tangrui');
    check('2. '+label+' 20:00（'+keyOf(d)+'）：品妤、唐睿同時在社科圖，不同位子、不同桌（唐睿在閱報區沙發）',R.ids.includes('econ_pinyu')&&R.ids.includes('econ_tangrui')&&!!a&&!!b&&a.table!==b.table&&b.kind==='lounge'&&a.table===s16.table,J({ids:R.ids,a:a&&a.table,b:b&&[b.table,b.kind]})); }
  { const d=dayOfTerm('Y2S2',4,{exam:true}); fresh(d,19.5,'soclib',{}); const R=enter('soclib'), w=R.seat('econ_weilun'), T=CALENDAR.termOf(d);
    check('2. 考試週（'+keyOf(d)+'，第 '+(T&&T.week)+' 週）週四 19:30：韋綸在社科圖、坐長桌（不是品妤那一張）',R.ids.includes('econ_weilun')&&!!w&&w.kind==='table'&&w.table!==s16.table,J({ids:R.ids,w})); }
  { const d=dayOfTerm('Y3S1',3); fresh(d,15,'soclib',{MET_XUN:true}); const R=enter('soclib'), x=R.seat('econ_zhengxun');
    check('2. 大三上週三 15:00：阿勳在社科圖、坐窗邊',R.ids.includes('econ_zhengxun')&&!!x&&x.kind==='window',J({ids:R.ids,x})); }
  { const out=[]; for(const [k,h] of [['2027-01-25',19.5],['2027-07-14',15],['2028-01-27',19.5],['2027-07-10',14]]){ fresh(k,h,'soclib',{PLAYED_Y0:true}); const R=enter('soclib'); const hit=R.ids.filter(i=>IDS.includes(i)); if(hit.length) out.push(k+' '+hit); }
    let hk=null; for(let d=CALENDAR.termDays('Y2S1').from;d<=CALENDAR.termDays('Y3S2').to;d++){ if(CALENDAR.holiday(d)&&CALENDAR.termOf(d)&&[1,3].includes(WD7(d))){ hk=d; break; } }
    if(hk!=null){ fresh(hk,19.5,'soclib',{PLAYED_Y0:true}); const R=enter('soclib'); const hit=R.ids.filter(i=>IDS.includes(i)); if(hit.length) out.push(keyOf(hk)+' '+hit); }
    check('2. 寒暑假、國定假日（'+(hk!=null?keyOf(hk):'?')+'）走進社科圖：四個人一個都不在',hk!=null&&!out.length,J(out)); }
});

/* ======================= 3 點他們說話 ======================= */
await sec('3',async()=>{
  const L=LX()||{people:{}}, P=id=>L.people[id]||{talk:[],greet:[]}, T=(id,w)=>(P(id).talk.find(e=>e.when===w)||{}).t, Ts=(id,w)=>P(id).talk.filter(e=>e.when===w).map(e=>e.t);
  const G0=()=>H.G;
  /* 第 4 節第 1 項：沒玩前傳 */
  { const d=dayOfTerm('Y2S1',1); fresh(d,19.5,'soclib',{}); const R=enter('soclib'); const msgs0=(G0().msgs||[]).length, inv0=J(G0().invites||[]), ev0=STORY_EVENTS.length;
    check('3. （前提）沒玩前傳、法律系時期沒見過品妤：沒有 MET_PINYU、沒有 FIRST_MET',!G0().flags.MET_PINYU&&!metHas('econ_pinyu'));
    const s=await R.talk('econ_pinyu');
    check('3. 沒玩前傳：點品妤＝旁白「（在社科圖講話要很小聲。）」→ 自我介紹（現有那一句）→ met 那一句，只有這三句',J(s)===J([L.narr,P('econ_pinyu').intro,T('econ_pinyu','met')]),J(s));
    check('3. （同上）說完記 MET_PINYU；也算認識了（FIRST_MET）',G0().flags.MET_PINYU===true&&metHas('econ_pinyu'));
    check('3. （同上）沒有「你好，我是曾品妤。經濟系的。」那一套、沒有 personality 旁白',!s.some(t=>/你好，我是/.test(t)||/毒舌/.test(t)),J(s));
    const s2=await R.talk('econ_pinyu');
    check('3. 同一天再點：不再說新的一句（一天最多一句）、換打招呼輪流第一句；沒有旁白',J(s2)===J([P('econ_pinyu').greet[0]]),J(s2));
    const s3=await R.talk('econ_pinyu'), s4=await R.talk('econ_pinyu'), s5=await R.talk('econ_pinyu'), s6=await R.talk('econ_pinyu');
    check('3. 打招呼照順序輪流：本人三句 → 館員那一句 → 又從頭',J([s3,s4,s5,s6])===J([[P('econ_pinyu').greet[1]],[P('econ_pinyu').greet[2]],[L.greetAll],[P('econ_pinyu').greet[0]]]),J([s3,s4,s5,s6]));
    check('3. 不新增手機訊息、邀約、事件（點完以後 msgs、invites、STORY_EVENTS 數量不變）',(G0().msgs||[]).length===msgs0&&J(G0().invites||[])===inv0&&STORY_EVENTS.length===ev0);
    at(d+7,19.5); const s7=await R.talk('econ_pinyu');
    check('3. 下週一：大二上那一句（沒有旁白、沒有自我介紹）',J(s7)===J([T('econ_pinyu','Y2S1')]),J(s7));
    at(d+9,19.5); const s8=await R.talk('econ_pinyu');
    check('3. 再下一次（大二上的說完了、沒玩前傳）：打招呼，不說前傳那一句',s8.length===1&&s8[0]!==T('econ_pinyu','y0')&&S_greet('econ_pinyu').includes(s8[0]),J(s8)); }
  function S_greet(id){ return P(id).greet.concat([L.greetAll]); }
  /* 第 4 節第 2 項：玩過前傳 */
  { const d=dayOfTerm('Y1S2',1); fresh(d,19.5,'soclib',{PLAYED_Y0:true,MET_PINYU:true,MET_XUN:true,KNOWS_TANG:true}); SOCIAL.remember('econ_pinyu','FIRST_MET','');
    const R=enter('soclib'); const s=await R.talk('econ_pinyu');
    check('3. 玩過前傳（大一下週一）：旁白 → met（直接說，不自我介紹）',J(s)===J([L.narr,T('econ_pinyu','met')]),J(s));
    const got=[]; for(let i=1;i<=6;i++){ at(d+i*2,19.5); got.push((await R.talk('econ_pinyu')).join('／')); }
    const y0=T('econ_pinyu','y0'), Y=Ts('econ_pinyu','Y1S2');
    check('3. 之後每天一句：大一下兩句照順序 → 前傳那一句出一次 → 之後打招呼，前傳那一句不再出',got[0]===Y[0]&&got[1]===Y[1]&&got[2]===y0&&got.slice(3).every(t=>t!==y0&&S_greet('econ_pinyu').includes(t)),J(got));
    at(dayOfTerm('Y2S1',1),19.5); const s2=await R.talk('econ_pinyu');
    check('3. 到大二上：大二上那一句（met、前傳那一句不再出；沒有旁白）',J(s2)===J([T('econ_pinyu','Y2S1')]),J(s2)); }
  /* 這一學期沒說完的不帶到下一學期 */
  { fresh(dayOfTerm('Y1S2',1),19.5,'soclib',{PLAYED_Y0:true,MET_PINYU:true}); SOCIAL.remember('econ_pinyu','FIRST_MET','');
    const R=enter('soclib'); await R.talk('econ_pinyu'); at(dayOfTerm('Y2S1',1),19.5); const s=await R.talk('econ_pinyu');
    check('3. 大一下只說了 met、兩句大一下沒說：到大二上說大二上那一句（大一下的不帶過來）',J(s)===J([T('econ_pinyu','Y2S1')]),J(s)); }
  /* 阿勳 */
  { const d=dayOfTerm('Y2S1',3); fresh(d,15,'soclib',{}); const R=enter('soclib'); const s=await R.talk('econ_zhengxun');
    check('3. 阿勳（沒有 MET_XUN）：旁白 → 「盧正勳。你經濟系那年的室友。……你該不會連我都忘了。」→ met；記 MET_XUN',J(s)===J([L.narr,P('econ_zhengxun').intro,T('econ_zhengxun','met')])&&G0().flags.MET_XUN===true,J(s));
    at(d+7,15); const a=await R.talk('econ_zhengxun'); at(d+14,15); const b=await R.talk('econ_zhengxun'); at(d+21,15); const c=await R.talk('econ_zhengxun');
    check('3. 阿勳之後：大二上那一句 → 保齡球那一句（任何學期一次）→ 打招呼（三句＋館員那一句裡的第一句）',J([a,b,c])===J([[T('econ_zhengxun','Y2S1')],[T('econ_zhengxun','any')],[P('econ_zhengxun').greet[0]]]),J([a,b,c])); }
  { const d=dayOfTerm('Y3S1',3); fresh(d,15,'soclib',{MET_XUN:true}); SOCIAL.remember('econ_zhengxun','FIRST_MET',''); const R=enter('soclib'); const s=await R.talk('econ_zhengxun');
    at(d+7,15); const s2=await R.talk('econ_zhengxun');
    check('3. 阿勳（有 MET_XUN，大三上）：旁白 → met（不自我介紹）；下一次大三上那一句',J(s)===J([L.narr,T('econ_zhengxun','met')])&&J(s2)===J([T('econ_zhengxun','Y3S1')]),J([s,s2])); }
  { fresh('2028-03-13',15,'soclib',{MET_XUN:true}); SOCIAL.remember('econ_zhengxun','FIRST_MET',''); const R=enter('soclib'); await R.talk('econ_zhengxun'); at('2028-03-15',15); const s=await R.talk('econ_zhengxun');
    check('3. 阿勳大三下 3/15（3/22 以前）在社科圖：「三月要發表。……」',J(s)===J([T('econ_zhengxun','Y3S2pre')]),J(s)); }
  { const post=T('econ_zhengxun','Y3S2post');
    fresh('2028-03-20',15.5,'campus',{MET_XUN:true}); SOCIAL.remember('econ_zhengxun','FIRST_MET',''); let s=await talkNow('econ_zhengxun');
    check('3. 阿勳 3/20（3/22 以前）在校園說話：不說「發表完了」那一句',!s.includes(post),J(s));
    at('2028-03-27',15.5); s=await talkNow('econ_zhengxun');
    check('3. 阿勳 3/27（3/22 以後）在校園（社科圖以外）說話：說「發表完了。……」那一句（在別處遇到也可以說）',s.includes(post)&&!s.includes(L.narr),J(s));
    at('2028-03-29',15.5); s=await talkNow('econ_zhengxun');
    check('3. （同上）只說一次：再遇到不再說',!s.includes(post),J(s));
    fresh('2028-03-27',15.5,'campus',{}); SOCIAL.remember('econ_zhengxun','FIRST_MET',''); s=await talkNow('econ_zhengxun');
    check('3. 沒有 MET_XUN 的（法律系時期沒見過他）在校園：不說那一句、不自我介紹（照現有）',!s.includes(post)&&!s.includes(P('econ_zhengxun').intro),J(s)); }
  /* 唐睿、韋綸 */
  { const d=dayOfTerm('Y3S1',2); fresh(d,20,'soclib',{MET_PINYU:true}); const R=enter('soclib');
    check('3. （前提）沒玩前傳、沒見過唐睿：STORY.tangIntro 成立',STORY.tangIntro(G0())===true);
    const s=await R.talk('econ_tangrui');
    check('3. 唐睿（tangIntro）：旁白 → 「唐睿。全系最會講話的那個。」→ met；記 MET_TANG',J(s)===J([L.narr,P('econ_tangrui').intro,T('econ_tangrui','met')])&&G0().flags.MET_TANG===true,J(s));
    const p=await R.talk('econ_pinyu');
    check('3. 同一晚接著點品妤：她自己的第一次也有旁白（每個人的第一句前面各一次）',p[0]===L.narr&&p.includes(T('econ_pinyu','met')),J(p));
    at(d+7,20); const a=await R.talk('econ_tangrui'); at(d+14,20); const b=await R.talk('econ_tangrui'); at(d+21,20); const c=await R.talk('econ_tangrui'); at(d+28,20); const e=await R.talk('econ_tangrui');
    const Y=Ts('econ_tangrui','Y3S1');
    check('3. 唐睿大三上兩句照順序 → 打招呼輪流（兩句＋館員那一句）',J([a,b,c,e])===J([[Y[0]],[Y[1]],[P('econ_tangrui').greet[0]],[P('econ_tangrui').greet[1]]]),J([a,b,c,e])); }
  { const d=dayOfTerm('Y3S2',3,{until:'2028-06-03'}); fresh(d,20,'soclib',{KNOWS_TANG:true,MET_PINYU:true}); SOCIAL.remember('econ_tangrui','FIRST_MET',''); const R=enter('soclib'); const s=await R.talk('econ_tangrui'); at(d+7,20); const s2=await R.talk('econ_tangrui');
    check('3. 唐睿（KNOWS_TANG：SK04 揭曉過）：不自我介紹；大三下那一句',J(s)===J([L.narr,T('econ_tangrui','met')])&&J(s2)===J([T('econ_tangrui','Y3S2')]),J([s,s2])); }
  { const d=dayOfTerm('Y2S1',4,{exam:true}); fresh(d,19.5,'soclib',{}); const R=enter('soclib');
    check('3. （前提）沒玩前傳、沒見過韋綸：STORY.wlIntro 成立',STORY.wlIntro(G0())===true);
    const s=await R.talk('econ_weilun');
    check('3. 韋綸（wlIntro）：旁白 → 「韋綸！騎車的！」→ met；記 MET_WEILUN',J(s)===J([L.narr,P('econ_weilun').intro,T('econ_weilun','met')])&&G0().flags.MET_WEILUN===true,J(s));
    const d2=dayOfTerm('Y2S2',4,{exam:true}); at(d2,19.5); const a=await R.talk('econ_weilun'); at(d2+7,19.5); const b=await R.talk('econ_weilun');
    const d3=dayOfTerm('Y3S1',4,{exam:true}); at(d3,19.5); const c=await R.talk('econ_weilun');
    check('3. 韋綸：大二那一句（大二上沒說，大二下照樣可以說）→ 打招呼 → 大三那一句',J(a)===J([T('econ_weilun','Y2')])&&J(b)===J([P('econ_weilun').greet[0]])&&J(c)===J([T('econ_weilun','Y3')]),J([a,b,c])); }
  /* SK12 */
  { fresh('2027-12-21',20,'soclib',{MET_PINYU:true,SK12:true}); SOCIAL.remember('econ_pinyu','FIRST_MET','');
    check('3. 品妤 SK12 那四天（12/20～23）在社科圖：這裡不接（照事件；閒聊不出）',OWNS(G0(),'econ_pinyu',false)===false&&['2027-12-20','2027-12-22','2027-12-23'].every(k=>{ at(k,20); return OWNS(G0(),'econ_pinyu',false)===false; }));
    at('2027-12-21',20); const s=await talkNow('econ_pinyu');
    check('3. （同上）點她不會說社科圖的閒聊、旁白',!s.some(t=>P('econ_pinyu').talk.some(e=>e.t===t)||t===L.narr),J(s));
    at('2027-12-27',20);
    check('3. SK12 那週以後（12/27）照常接',OWNS(G0(),'econ_pinyu',false)===true); }
  /* 社科圖以外，其他三個人照現有 */
  { fresh(dayOfTerm('Y2S1',1),12,'campus',{MET_PINYU:true,MET_XUN:true}); for(const id of IDS) SOCIAL.remember(id,'FIRST_MET','');
    const own=IDS.filter(id=>OWNS(H.G,id,false));
    check('3. 社科圖以外（大二上的校園）：四個人都不接（照現有）',!own.length,J(own)); }
});

/* ======================= 4 舊存檔 ======================= */
await sec('4',async()=>{
  const d=dayOfTerm('Y2S1',1);
  for(const [nm,v] of [['沒有 ECON_SL',undefined],['ECON_SL 是字串','x'],['ECON_SL 是陣列',[1,2]],['人那一格壞掉',{econ_pinyu:5}],['once 壞掉',{econ_pinyu:{day:null,once:'x',g:'y'}}]]){
    fresh(d,19.5,'soclib',{PLAYED_Y0:true,MET_PINYU:true}); if(v!==undefined) H.G.flags.ECON_SL=v; else delete H.G.flags.ECON_SL; SOCIAL.remember('econ_pinyu','FIRST_MET','');
    let err=null, s=null; try{ const R=enter('soclib'); s=await R.talk('econ_pinyu'); }catch(e){ err=e; }
    check('4. 舊存檔（'+nm+'）：不丟例外、照常說 met',!err&&!!s&&s.includes((LX()||{people:{econ_pinyu:{talk:[{}]}}}).people.econ_pinyu.talk[0].t),err?String(err.message):J(s)); }
});

console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
})();
