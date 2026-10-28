// AA_521 經濟系的朋友：法律系那三年；何俊朗；日文班（企劃線 0f4b48f20；AA-C 2026-10-28 定稿，D109；任務 NPC-STORY2-1028、USER_WANTS X119）——不需要瀏覽器。
//   src/data/econfr_lines.js（ECONFR_LINES）、src/econfr3d.js（ECONFR）；src/data/events.js ev_b106d2_xun 改照鍵演；src/data/us_life_events.js、src/us_life3d.js 何俊朗的招呼。
//   0  讀稿、白名單（0f4b48f20 approved）、新檔載得到、index.html 順序（yule3d.js → data/econfr_lines.js → econfr3d.js，在 GAME.boot() 前面）；
//      稿 → 遊戲（第 1 節四張表＋唐睿「靈感是你。」、第 2 節五則、第 3 節六句、第 4 節三則＋4-3 的回覆與後續）、遊戲 → 稿（新檔每一句、招呼六句）；日子對星期；品妤轉述可昕的七則照舊
//   1  D2 照學期取鍵：大一上照現有（品妤沒有）；大一下起每人兩句 a、b 照順序、說完就不站、沒說到的不帶到下一學期；大一上沒說到的大一下排在前面（大二上起不帶）；
//      阿勳要 MET_XUN、大三下 a 只在 3/22 以前、b 只在 3/22 以後；唐睿大三下 b 要 4-2 那張畢業照傳過；品妤要 MET_PINYU、大一下開始；
//      擲骰不改（同 story3d.js 的 d2rand、三成五、每天一句）；15:30 阿勳、唐睿一天一個；鍵名「人＿學期＿a/b」（wl_Y2S1_a、py_Y3S2）
//   2  D2 的事件：每人每學期兩句逐字（對話框的名字照現有）、唐睿大一下 a 走錯棟的多「靈感是你。」、品妤大三下旁白在前；第一次見面照現有先自我介紹；
//      阿勳大一下照舊先說大一上那一句（沒見過＝先自我介紹）再換新的；品妤 ev_b106d2_pinyu 週五 12:05～12:25 普通教學館（大一下現有那一格；大二上起擲到才在）
//   3  「走啦」群組五則：時間、說的人、逐字；不在群組沒有；晚三天以上不補
//   4  何俊朗的招呼：照日期範圍加進輪流（頭尾那天都算、範圍外沒有）、沒有 LONG_HAIHAO 的不說「……還好。」「還好。」、現有的句子照舊
//   5  日文班：4-1、4-2 在群組裡才有；4-3 只有日本路線、人在日本（日本 22:00）、兩個回覆（期限 4/20）：「好。」＝4/22 白天旁白一句、當晚采蓁兩則，
//      「這週沒空。」＝她回「好，不急！」、沒有後續，不回＝沒有後續；記 CZ_VET_PHOTO
//   6  舊存檔：沒有 EF_PH、B106D2_SAID、msgs 照常跑、不丟例外；新的局沒有預先寫 CZ_VET_PHOTO、EF_PH
// 修改前（只拿掉這次 src 的改動：git archive 出 b73f6745c〔AA_520 第 10 節做完、AA_521 還沒動〕的 src、tests、lib、index.html，白名單、這支測試用新的；AA521_DOCREPO 指這個 repo 實際跑過）：
//   FAILED 15、PASS 7（PASS＝讀稿、白名單、日子對星期、大一上照現有、何俊朗「範圍外沒有」〔沒有新句子＝一句都沒有〕、新的局沒有 CZ_VET_PHOTO、經濟系不傳；
//   第 0～5 段找不到 ECONFR／ECONFR_LINES 丟例外中斷、第 6 段舊存檔丟例外）。修改後 ALL PASS（45 項）。
// 用法：node tests/aa521_econ_friends_unit.js（在沒有 .git 的目錄跑，設環境變數 AA521_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa516_sis_b14_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
const X=()=>typeof ECONFR!=='undefined'?ECONFR:null, LX=()=>typeof ECONFR_LINES!=='undefined'?ECONFR_LINES:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const at=(d,h)=>{ H.at(typeof d==='number'?keyOf(d):d,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(d,h)=>{ at(d,h); ph(); };
const fresh=(d,h,flags,o)=>{ o=o||{}; const k=typeof d==='number'?keyOf(d):d; const G=H.fresh(k,h,o.zone||'campus',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); for(const g of (o.groups||[])) PHONE.join(G,g[0],g[1]);
  E.player.busy=false; E.paused=false; E.player.lv=0; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM); H.at(k,h); return G; };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); return H.said.map(s=>(s.who?s.who+'：':'')+s.t); };
const said=(id,k)=>{ const F=H.G.flags; F.B106D2_SAID=F.B106D2_SAID||{}; F.B106D2_SAID[k]=1; };
/* 學期第幾週星期幾（1＝週一）；D2 的學期日（不是考試週、上課週）*/
const TD=(term,w,wd)=>{ const R=CALENDAR.termDays(term); return R?R.from+(w-1)*7+(wd-1):null; };
const termDay=(term,wd)=>{ const G0={flags:{},stage:'law',day:0,hour:12}; for(let w=6;w<=15;w++){ const d=TD(term,w,wd||2); G0.day=d; if(STORY.b106d2Term(G0)&&!(CALENDAR.holiday&&CALENDAR.holiday(d))) return d; } return null; };   /* 第 6 週起第一個 D2 的日子（上課週、不是假日）*/
const fri=term=>termDay(term,5);
/* story3d.js 的 d2rand（同一個式子：擲骰不改）*/
const d2rand=s=>{ let x=2166136261; for(let i=0;i<s.length;i++){ x^=s.charCodeAt(i); x=Math.imul(x,16777619); } x^=x>>>13; x=Math.imul(x,1274126177); x^=x>>>16; return (x>>>0)/4294967296; };

/* ---------- 讀稿 ---------- */
const SHA='0f4b48f20', DOCF='docs/story_planning/AA_521_經濟系的朋友_法律系那三年_何俊朗_日文班.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA521_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+1):-1; return S.slice(i,j<0?S.length:j); };
const TERM={'大一下':'Y1S2','大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2'};
const rowsOf=t=>String(t).split('\n').filter(l=>/^\|/.test(l)&&!/^\|\s*(---|學期|#|範圍)/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
/* 第 1 節：{人物 id:{學期:[a,b] 或 [一句]}} */
const S1=part('## 1. ','## 2. '), S2=part('## 2. ','## 3. '), S3=part('## 3. ','## 4. '), S4=part('## 4. ','## 5. ');
const TAB={}; for(const [id,h] of [['econ_weilun','### 1-2｜'],['econ_tangrui','### 1-3｜'],['econ_zhengxun','### 1-4｜'],['econ_pinyu','### 1-5｜']]){ const B=part(h,'\n### ',S1); TAB[id]={}; for(const c of rowsOf(B)) if(TERM[c[0]]) TAB[id][TERM[c[0]]]=c.slice(1); }
const [TANG_PLUS]=(/大一下 a：有 `SOC_WRONG_BUILDING`（走錯棟）的，後面多一句「([^」]+)」/.exec(S1)||[]).slice(1);
/* 第 2、4 節：#、時間、內容（「名字：一句」用「／」分開）*/
const msgRows=t=>rowsOf(t).filter(c=>/^\d-\d$/.test(c[0])).map(c=>{ const m=/^(\d{4}-\d\d-\d\d)（(.)）(\d\d:\d\d)/.exec(c[1]); return {n:c[0],date:m&&m[1],wd:m&&m[2],hm:m&&m[3],note:c[1],t:c[2].split('／').map(x=>{ const i=x.indexOf('：'); return [x.slice(0,i),x.slice(i+1)]; })}; });
const G2=msgRows(S2), G4=msgRows(S4);
/* 第 3 節：範圍、一句（去掉「（`haihao`…）」）*/
const G3=rowsOf(S3).filter(c=>/～/.test(c[0])).map(c=>{ const [a,b]=c[0].split('～'); const raw=c[1]; const t=raw.replace(/（`haihao`[^）]*）$/,''); return {from:a,to:b,t,hh:/`haihao`/.test(raw)}; });
const [HH_TAIL1]=(/沒有 `LONG_HAIHAO` 的不說「([^」]+)」/.exec(S3)||[]).slice(1);
/* 4-3 的回覆與後續 */
const B43=part('- 4-3 回覆','- 4-1：',S4);
const [UNTIL_MD,UNTIL_HM]=(/4-3 回覆（期限 (\d+\/\d+) (\d\d:\d\d)）/.exec(B43)||[]).slice(1), [OPT1]=(/①「([^」]+)」/.exec(B43)||[]).slice(1), [OPT2,REP2]=(/②「([^」]+)」→ 采蓁：「([^」]+)」/.exec(B43)||[]).slice(1);
const [PHOTO_MD,PHOTO_WD,PHOTO_T]=(/(\d+\/\d+)（(.)）白天走在鎮上，旁白一句：「([^」]+)」/.exec(B43)||[]).slice(1), [TH_HM,TH1,TH2]=(/當晚 (\d\d:\d\d) 采蓁：「([^」]+)」「([^」]+)」/.exec(B43)||[]).slice(1);
const WDC='一二三四五六日', wdOk=(key,c)=>!!key&&WDC[(CALENDAR.dateOf(D(key)).wd+6)%7]===c;
const md2key=(md,y)=>{ const [m,d]=md.split('/').map(Number); return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); };
const hOf=hm=>{ const [a,b]=String(hm).split(':').map(Number); return a+b/60; };
const NAME={'韋綸':'econ_weilun','阿勳':'econ_zhengxun','唐睿':'econ_tangrui','品妤':'econ_pinyu','采蓁':'jp_caizhen','宇恆':'jp_yuheng'};
/* 遊戲這一批的字（遊戲 → 稿）*/
const lineT=x=>typeof x==='string'?x:(x&&(x.t||x.n));
const longNew=()=>((typeof US_LIFE_EVENTS!=='undefined'&&US_LIFE_EVENTS.DATA&&US_LIFE_EVENTS.DATA.longGreet)||[]).filter(q=>q.from||q.to);
const mineTexts=()=>{ const A=[], L=LX(); if(L){ for(const id in L.d2){ const P=L.d2[id]; for(const t in P.terms){ const v=P.terms[t]; for(const arr of Array.isArray(v)?[v]:Object.values(v)) A.push(...arr.map(lineT)); } }
    for(const e of (L.grp||[]).concat(L.jp||[],[L.vetThanks])) A.push(...e.t.map(x=>x[2]));
    for(const e of L.jp||[]) for(const o of e.opts||[]){ A.push(o.t); A.push(...(o.r||[]).map(x=>x[2])); }
    A.push(L.vetPhoto.t); }
  A.push(...longNew().map(q=>q.t));
  return A.filter(t=>typeof t==='string'&&t.length); };

(async()=>{
/* ---------- 0 ---------- */
await sec(0,()=>{ const a=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_521 '+SHA+'：第 1 節四張表、第 2 節五則、第 3 節六句、第 4 節三則與 4-3 的回覆）',DOC.length>5000&&Object.values(TAB).every(t=>Object.keys(t).length===5)&&G2.length===5&&G3.length===6&&G4.length===3&&!!OPT1&&!!OPT2&&!!REP2&&!!PHOTO_T&&!!TH1&&!!TH2&&!!TANG_PLUS,
    J({len:DOC.length,tab:Object.keys(TAB).map(k=>k+':'+Object.keys(TAB[k]).length),g2:G2.length,g3:G3.length,g4:G4.length,OPT1,OPT2,REP2,PHOTO_T,TH1,TH2,TANG_PLUS}));
  { const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_521_/.test(e.path));
    check('0. 劇情匯入白名單有 AA_521（sha '+SHA+'、approved、AA-C 定稿、任務 NPC-STORY2-1028）；這支測試對同一版的稿',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&/AA-C/.test(A[0].approvedBy||'')&&A[0].task==='NPC-STORY2-1028',J(A.map(e=>({sha:e.sha,status:e.status,task:e.task})))); }
  check('0. 新檔載得到（ECONFR、ECONFR_LINES）；全部的檔載入沒有錯誤；品妤的事件在 STORY_EVENTS',!loadErr.length&&!!X()&&!!LX()&&!!ev('ev_b106d2_pinyu'),J(loadErr));
  check('0. index.html：yule3d.js → data/econfr_lines.js → econfr3d.js（相鄰）；在 story3d.js、data/events.js、jp3d.js、us_life3d.js 以後，GAME.boot() 前面',
    /src\/yule3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/econfr_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/econfr3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/econfr3d.js')<a('<script>GAME.boot();</script>')&&
    ['src/story3d.js','src/data/events.js','src/jp3d.js','src/us_life3d.js','src/r2y3b3d.js'].every(f=>a(f)>0&&a(f)<a('src/data/econfr_lines.js')));
  const wbad=[]; for(const r of G2.concat(G4)) if(!wdOk(r.date,r.wd)) wbad.push(r.n); if(!wdOk(md2key(PHOTO_MD,2028),PHOTO_WD)) wbad.push('4/22');
  check('0. 稿上的日子都對得上星期（第 2 節五則、第 4 節三則、4/22 週六）',!wbad.length&&G2.every(r=>!!r.date)&&G4.every(r=>!!r.date),J(wbad));
  const GS=new Set(mineTexts());
  /* 稿 → 遊戲 */
  const want=[]; for(const id in TAB) for(const t in TAB[id]) for(const c of TAB[id][t]){ const m=/^(（[^）]+）)(.+)$/.exec(c); if(m) want.push(m[1],m[2]); else want.push(c); }
  want.push(TANG_PLUS); for(const r of G2.concat(G4)) for(const [n,t] of r.t) want.push(t); for(const r of G3) want.push(r.t);
  want.push(OPT1,OPT2,REP2,PHOTO_T,TH1,TH2);
  const lost=want.filter(t=>!GS.has(t));
  check('0. 稿 → 遊戲：第 1 節四張表（括號的動作分開）、唐睿「'+TANG_PLUS+'」、第 2、4 節八則、第 3 節六句、4-3 的回覆與後續（'+want.length+' 句）都在遊戲裡（一字不差）',want.length===79&&!lost.length,J({n:want.length,lost}));
  /* 遊戲 → 稿 */
  const M=mineTexts(), notIn=[...new Set(M)].filter(t=>DOC.indexOf(t)<0);
  check('0. 遊戲 → 稿：新檔每一句、何俊朗的六句（'+new Set(M).size+' 句）都在稿裡（一字不差）',new Set(M).size===78&&!notIn.length,J(notIn));
  /* 第 1 節的表 → 遊戲的資料（照人、照學期、a、b 的順序）*/
  const L=LX(), tb=[]; for(const id in TAB){ const P=L.d2[id]; if(!P){ tb.push(id); continue; } for(const t in TAB[id]){ const v=P.terms[t], got=Array.isArray(v)?[v.map(lineT).join('')]:[v.a,v.b].map(arr=>arr.filter(x=>typeof x==='string'||x.n).map(lineT).join('')); if(J(got)!==J(TAB[id][t])) tb.push(id+' '+t+' '+J(got)); } }
  check('0. 第 1 節：四個人五個學期、a、b 的順序照表（品妤一學期一句）；對話框的名字照現有（韋綸、唐睿、阿勳、品妤）',!tb.length&&J(Object.keys(L.d2).map(k=>L.d2[k].sp))===J(['韋綸','唐睿','阿勳','品妤']),J(tb));
  /* 第 2、4 節：時間、說的人 */
  const g2bad=[]; (L.grp||[]).forEach((e,i)=>{ const r=G2[i]; if(!r||e.at!==r.date+' '+r.hm||J(e.t.map(x=>[x[1],x[2]]))!==J(r.t)||e.t.some(x=>NAME[x[1]]!==x[0])) g2bad.push(e.id); });
  const g4bad=[]; (L.jp||[]).forEach((e,i)=>{ const r=G4[i]; if(!r||e.at!==r.date+' '+r.hm||J(e.t.map(x=>[x[1],x[2]]))!==J(r.t)||e.t.some(x=>NAME[x[1]]!==x[0])) g4bad.push(e.id); });
  check('0. 第 2 節五則、第 4 節三則：時間、說的人（人物 id 對得上名字）、順序照表',(L.grp||[]).length===5&&(L.jp||[]).length===3&&!g2bad.length&&!g4bad.length&&/只有日本路線、人在日本/.test(G4[2].note)&&L.jp[2].jpOnly===true,J({g2bad,g4bad}));
  const PY7=(typeof HEARD_LINES!=='undefined'?HEARD_LINES.phone:[]).filter(e=>/_pinyu$/.test(e.id));
  check('0. 品妤轉述可昕的七則照舊（heard_lines.js h503～h510_pinyu，條件 econGroup）',PY7.length===7&&PY7.every(e=>e.cond==='econGroup'),J(PY7.map(e=>e.id))); });

/* ---------- 1 D2 照學期取鍵 ---------- */
await sec(1,async()=>{ const K=(id)=>STORY.b106d2Key(H.G,id);
  /* 大一上照現有 */
  fresh(TD('Y1S1',10,2),12.1,{}); const y11=[K('econ_weilun'),K('econ_tangrui'),K('econ_zhengxun'),K('econ_pinyu')];
  check('1. 大一上照現有：韋綸 wl_first、唐睿 tr_law、阿勳 xun_sched；品妤沒有（大一下才開始）',J(y11)===J(['wl_first','tr_law','xun_sched',null]),J(y11));
  /* 大一下：大一上沒說到的排在前面，再來 a、b，說完就沒有 */
  const d12=TD('Y1S2',6,2); fresh(d12,12.1,{MET_XUN:true,MET_PINYU:true}); const seq=[]; for(let i=0;i<5;i++){ const k=K('econ_weilun'); seq.push(k); if(!k) break; if(k==='wl_first') H.G.flags.WL_SAID_LAW=true; else said('econ_weilun',k); }
  check('1. 大一下：大一上沒說到的先（wl_first → wl_go），再來 wl_Y1S2_a → wl_Y1S2_b，說完＝沒有（不站）',J(seq)===J(['wl_first','wl_go','wl_Y1S2_a','wl_Y1S2_b',null])&&!STORY.b106d2Due(H.G,'econ_weilun'),J(seq));
  /* 大二上：不帶大一上、大一下沒說到的 */
  const d21=TD('Y2S1',6,2); fresh(d21,12.1,{}); const k21=[K('econ_weilun'),K('econ_tangrui')]; said('econ_weilun','wl_Y2S1_a'); const k21b=K('econ_weilun'); said('econ_weilun','wl_Y2S1_b'); const k21c=K('econ_weilun');
  check('1. 大二上：沒說到的（wl_first、大一下兩句）不帶過來＝wl_Y2S1_a → wl_Y2S1_b → 沒有；唐睿 tr_Y2S1_a',J(k21)===J(['wl_Y2S1_a','tr_Y2S1_a'])&&k21b==='wl_Y2S1_b'&&k21c===null,J({k21,k21b,k21c}));
  const terms=X().TERMS, allKeys=[]; for(const id of ['econ_weilun','econ_tangrui','econ_zhengxun','econ_pinyu']) for(const t of terms) allKeys.push(...X().keys(id,t));
  check('1. 鍵名照稿第 5 節「人＿學期＿a/b」（wl_Y2S1_a、py_Y3S2）：韋綸、唐睿、阿勳各十個、品妤五個',allKeys.length===35&&allKeys.includes('wl_Y2S1_a')&&allKeys.includes('py_Y3S2')&&allKeys.every(k=>/^(wl|tr|xun)_Y\dS\d_[ab]$|^py_Y\dS\d$/.test(k)),J(allKeys.slice(0,4)));
  /* 阿勳：MET_XUN */
  fresh(d21,15.5,{}); const xNo=K('econ_zhengxun'); H.G.flags.MET_XUN=true; const xYes=K('econ_zhengxun');
  fresh(d12,15.5,{}); const x12=K('econ_zhengxun'); said('econ_zhengxun','xun_sched'); const x12b=K('econ_zhengxun'); H.G.flags.MET_XUN=true; const x12c=K('econ_zhengxun');
  check('1. 阿勳的新句子要 MET_XUN（沒有＝不站）；大一下沒見過的照舊先 xun_sched（自我介紹那一場記 MET_XUN）再換新的',xNo===null&&xYes==='xun_Y2S1_a'&&x12==='xun_sched'&&x12b===null&&x12c==='xun_Y1S2_a',J({xNo,xYes,x12,x12b,x12c}));
  /* 阿勳大三下：3/22 */
  const d322=D('2028-03-22'), x=(d)=>{ fresh(d,15.5,{MET_XUN:true}); return K('econ_zhengxun'); };
  const xa=x(d322-1), xd=x(d322); fresh(d322+1,15.5,{MET_XUN:true}); const xb=K('econ_zhengxun'); fresh(d322-1,15.5,{MET_XUN:true}); said('econ_zhengxun','xun_Y3S2_a'); const xa2=K('econ_zhengxun');
  check('1. 阿勳大三下：a 只在 3/22 以前（3/21 是 a）、b 只在 3/22（SK13）以後（3/23 是 b，a 沒說到也跳過）；3/22 當天沒有；a 說過、還沒到 3/22＝沒有',xa==='xun_Y3S2_a'&&xd===null&&xb==='xun_Y3S2_b'&&xa2===null,J({xa,xd,xb,xa2}));
  /* 唐睿大三下 b：畢業照 */
  const d32=TD('Y3S2',6,2); fresh(d32,15.5,{}); const ta=K('econ_tangrui'); said('econ_tangrui','tr_Y3S2_a'); const tNo=K('econ_tangrui'); PHONE.at(H.G,H.G.day-1,21,[{th:'g:econ_friends',from:'econ_weilun',name:'韋綸',text:'x'}],'b106_42_photo'); PHONE.tick(H.G); const tb=K('econ_tangrui');
  check('1. 唐睿大三下：先 a；b 要 4-2 那張畢業照（b106_42_photo）傳過以後（之前＝只說 a、說完就不站）',ta==='tr_Y3S2_a'&&tNo===null&&tb==='tr_Y3S2_b',J({ta,tNo,tb}));
  /* 品妤：MET_PINYU，大一下起，一學期一句 */
  const f12=fri('Y1S2'); fresh(f12,12.1,{}); const pNo=K('econ_pinyu'); H.G.flags.MET_PINYU=true; const p12=K('econ_pinyu'); said('econ_pinyu','py_Y1S2'); const p12b=K('econ_pinyu');
  fresh(fri('Y3S2'),12.1,{MET_PINYU:true}); const p32=K('econ_pinyu');
  check('1. 品妤：有 MET_PINYU 才有；大一下 py_Y1S2，說過就沒有（一學期一句）；大三下 py_Y3S2',pNo===null&&p12==='py_Y1S2'&&p12b===null&&p32==='py_Y3S2',J({pNo,p12,p12b,p32}));
  /* 擲骰不改：有話說的日子，擲到＝同一個式子（三成五）；每天一句 */
  const roll=[]; let n=0, tot=0; for(let w=2;w<=15;w++) for(let wd=1;wd<=5;wd++){ const d=TD('Y2S2',w,wd); fresh(d,12.1,{}); if(!STORY.b106d2Term(H.G)||(CALENDAR.holiday&&CALENDAR.holiday(d))) continue; tot++; const due=STORY.b106d2Due(H.G,'econ_weilun'); if(due) n++; if(due!==(d2rand(d+':econ_weilun')<STORY.B106D2_P)) roll.push(keyOf(d)); }
  fresh(fri('Y2S2'),12.1,{MET_PINYU:true}); const pd=STORY.b106d2Due(H.G,'econ_pinyu')===(d2rand(H.G.day+':econ_pinyu')<0.35);
  check('1. 擲骰不改：大二下有話說的每一天，韋綸在不在＝story3d.js 同一個式子（三成五）；品妤也一樣',!roll.length&&n>0&&n<tot&&pd&&STORY.B106D2_P===0.35,J({roll,n,tot}));
  let dd=null; for(let w=2;w<=15&&dd==null;w++) for(let wd=1;wd<=5&&dd==null;wd++){ const d=TD('Y2S2',w,wd); fresh(d,12.1,{}); if(STORY.b106d2Due(H.G,'econ_weilun')) dd=d; }
  fresh(dd,12.1,{}); const before=STORY.b106d2Due(H.G,'econ_weilun'); STORY.b106d2Done(H.G,'econ_weilun','wl_Y2S2_a'); const after=STORY.b106d2Due(H.G,'econ_weilun');
  check('1. 每天一句：說了一句那一天就不站（還有 b 也一樣）',before===true&&after===false&&STORY.b106d2Key(H.G,'econ_weilun')==='wl_Y2S2_b',J({dd,before,after}));
  let two=0, one=0; for(let w=2;w<=15;w++) for(let wd=1;wd<=5;wd++){ const d=TD('Y2S1',w,wd); fresh(d,15.5,{MET_XUN:true}); if(!STORY.b106d2Term(H.G)) continue; const k=['econ_tangrui','econ_zhengxun'].filter(id=>STORY.b106d2Due(H.G,id)).length; if(k>1) two++; if(k===1) one++; }
  check('1. 15:30 社科院門口一天只有阿勳或唐睿其中一個（兩個都有話說的大二上）',one>0&&two===0,J({one,two}));
  fresh(D('2028-06-20'),12.1,{MET_PINYU:true,MET_XUN:true}); const after32=['econ_weilun','econ_tangrui','econ_zhengxun','econ_pinyu'].map(id=>STORY.b106d2Due(H.G,id));
  check('1. 大三下以後（他們 2028-06 畢業）D2 照現有沒有',after32.every(x=>!x),J(after32)); });

/* ---------- 2 D2 的事件 ---------- */
await sec(2,async()=>{ const L=LX();
  const EVID={econ_weilun:'ev_b106d2_weilun',econ_tangrui:'ev_b106d2_tang',econ_zhengxun:'ev_b106d2_xun',econ_pinyu:'ev_b106d2_pinyu'};
  const bad=[];
  for(const id in TAB) for(const t of X().TERMS){ const keys=X().keys(id,t);
    for(let i=0;i<keys.length;i++){ const d=id==='econ_pinyu'?fri(t):termDay(t,2);
      fresh(t==='Y3S2'&&id==='econ_zhengxun'&&i===1?D('2028-03-23'):(t==='Y3S2'&&id==='econ_zhengxun'?D('2028-03-14'):d),id==='econ_weilun'||id==='econ_pinyu'?12.1:15.5,{MET_XUN:true,MET_PINYU:true,MET_WEILUN:true,WL_SAID_LAW:true,MET_TANG:true,KNOWS_TANG:true,PLAYED_Y0:true});
      if(t==='Y1S2'){ said(id,'wl_go'); said(id,'xun_sched'); said(id,'tr_law'); }
      for(let j=0;j<i;j++) said(id,keys[j]); if(id==='econ_tangrui'&&t==='Y3S2'&&i===1){ PHONE.at(H.G,H.G.day-1,21,[{th:'g:econ_friends',from:'econ_weilun',name:'韋綸',text:'x'}],'b106_42_photo'); PHONE.tick(H.G); }
      const k=STORY.b106d2Key(H.G,id); const out=await run(EVID[id]); const sp=L.d2[id].sp, cell=TAB[id][t][id==='econ_pinyu'?0:i];
      const m=/^(（[^）]+）)(.+)$/.exec(cell), want=m?[m[1],sp+'：'+m[2]]:[sp+'：'+cell];
      const rec=(H.G.flags.B106D2_SAID||{})[keys[i]]===H.G.day;
      if(k!==keys[i]||J(out)!==J(want)||!rec) bad.push({id,t,i,k,out,want,rec}); } }
  check('2. 每人每學期的句子照鍵演、逐字（對話框的名字照現有；品妤大三下括號的動作是旁白、放在那一句前面）；演完記那一個鍵（B106D2_SAID）',!bad.length,J(bad.slice(0,3)));
  /* 唐睿大一下 a 走錯棟 */
  const d12=TD('Y1S2',6,2), base={MET_TANG:true,KNOWS_TANG:true,PLAYED_Y0:true};
  fresh(d12,15.5,Object.assign({SOC_WRONG_BUILDING:true},base)); said('econ_tangrui','tr_wrong'); const w1=await run('ev_b106d2_tang');
  fresh(d12,15.5,base); said('econ_tangrui','tr_law'); const w0=await run('ev_b106d2_tang');
  check('2. 唐睿大一下 a：有 SOC_WRONG_BUILDING（走錯棟）的後面多「'+TANG_PLUS+'」；沒有的不多',J(w1)===J(['唐睿：'+TAB.econ_tangrui.Y1S2[0],'唐睿：'+TANG_PLUS])&&J(w0)===J(['唐睿：'+TAB.econ_tangrui.Y1S2[0]]),J({w1,w0}));
  /* 第一次見面：照現有先自我介紹 */
  fresh(TD('Y2S1',6,2),12.1,{}); const wl=await run('ev_b106d2_weilun'); fresh(TD('Y2S1',6,2),15.5,{}); const tr=await run('ev_b106d2_tang');
  check('2. 從法律系開始、大二上第一次遇到：韋綸「韋綸！騎車的！」、唐睿「唐睿。全系最會講話的那個。」先自我介紹，再說那學期的句子（大一上那一句不帶過來）',
    J(wl)===J(['韋綸：韋綸！騎車的！','韋綸：'+TAB.econ_weilun.Y2S1[0]])&&J(tr)===J(['唐睿：唐睿。全系最會講話的那個。','唐睿：'+TAB.econ_tangrui.Y2S1[0]]),J({wl,tr}));
  /* 阿勳大一下：沒見過＝先大一上那一句（自我介紹），下一次新的 */
  fresh(d12,15.5,{}); const x1=await run('ev_b106d2_xun'); const x1k=(H.G.flags.B106D2_SAID||{}).xun_sched!=null, met=H.G.flags.MET_XUN===true; H.G.day++; H.G.weekday=wdOf(H.G.day); const x2=await run('ev_b106d2_xun');
  check('2. 阿勳大一下沒見過：先「盧正勳。……」＋大一上那一句「你們法律系的課表，是不是也很不合理？」（記 xun_sched、MET_XUN），下一次說大一下 a',
    J(x1)===J(['阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。','阿勳：你們法律系的課表，是不是也很不合理？'])&&x1k&&met&&J(x2)===J(['阿勳：'+TAB.econ_zhengxun.Y1S2[0]]),J({x1,x2}));
  fresh(TD('Y1S1',10,2),15.5,{}); const x0=await run('ev_b106d2_xun');
  check('2. 阿勳大一上照現有（事件改成照鍵演以後一樣）：沒見過＝自我介紹＋課表那一句',J(x0)===J(['阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。','阿勳：你們法律系的課表，是不是也很不合理？'])&&(H.G.flags.B106D2_SAID||{}).xun_sched!=null,J(x0));
  /* 品妤的事件與作息 */
  const P=ev('ev_b106d2_pinyu');
  check('2. 品妤 ev_b106d2_pinyu：週五 12:05～12:25、普通教學館（putong）、走到她旁邊（npcNear 3 m）、大一下～大三下、擲到才有（b106d2Due）',!!P&&P.location==='putong'&&J(P.weekday)==='[5]'&&Math.abs(P.time[0]-(12+5/60))<1e-9&&Math.abs(P.time[1]-(12+25/60))<1e-9&&P.npcNear==='econ_pinyu'&&P.nearDist===3&&J(P.term)===J(['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'])&&P.trigger==='auto',J(P&&{l:P.location,t:P.time,term:P.term}));
  const S0=CHARACTERS.econ_pinyu.daily_schedule, y12=S0.find(e=>e.days&&e.days[0]===5&&e.from===12+5/60&&J(e.terms)==='["Y1S2"]'), add=S0.find(e=>e.b106d2);
  let dIn=null, dOut=null; for(let w=2;w<=15&&(dIn==null||dOut==null);w++){ const d=TD('Y2S2',w,5); fresh(d,12.1,{MET_PINYU:true}); if(!STORY.b106d2Term(H.G)) continue; if(STORY.b106d2Due(H.G,'econ_pinyu')){ if(dIn==null) dIn=d; } else if(dOut==null) dOut=d; }
  fresh(dIn,12.1,{MET_PINYU:true}); const eIn=STORY.schedEnt(CHARACTERS.econ_pinyu,H.G); fresh(dOut,12.1,{MET_PINYU:true}); const eOut=STORY.schedEnt(CHARACTERS.econ_pinyu,H.G);
  check('2. 品妤的作息：大一下那一格照舊（putong 下課的走廊、有 MET_PINYU）；大二上～大三下加一格（同一個位置、b106d2、擲到才在：擲到的那個週五在、沒擲到的不在）',
    !!y12&&y12.zone==='putong'&&!!add&&add.zone==='putong'&&J(add.at.slice(0,2))===J(y12.at.slice(0,2))&&J(add.terms)===J(['Y2S1','Y2S2','Y3S1','Y3S2'])&&!!eIn&&eIn===add&&eOut!==add,J({add:add&&add.terms,eIn:!!eIn,dIn,dOut})); });

/* ---------- 3 「走啦」群組 ---------- */
await sec(3,async()=>{ const L=LX(), bad=[];
  for(const e of L.grp){ const [k,hm]=e.at.split(' '), d=D(k), h=hOf(hm);
    fresh(d,h-0.5,{},{groups:[['econ_friends','走啦']]}); phAt(d,h-1/60); const early=byTag(e.id).length; phAt(d,h); const M=byTag(e.id);
    fresh(d,h-0.5,{}); phAt(d,h); const notIn=byTag(e.id).length;
    if(early!==0||notIn!==0||J(M.map(m=>[m.th,m.from,m.name,m.text]))!==J(e.t.map(x=>['g:econ_friends',x[0],x[1],x[2]]))||!M.every(m=>m.day===d&&Math.abs(m.h-h)<0.02)) bad.push({id:e.id,early,notIn,M:M.map(m=>m.text)}); }
  check('3. 「走啦」群組五則：到了那一刻才有、g:econ_friends、說的人與名字、逐字；不在群組的沒有',!bad.length,J(bad.slice(0,2)));
  const e=L.grp[0], d=D(e.at.split(' ')[0]); fresh(d,20,{},{groups:[['econ_friends','走啦']]}); phAt(d+3,22); const late=byTag(e.id).length, R=(H.G.flags.EF_PH||{})[e.id];
  fresh(d,20,{},{groups:[['econ_friends','走啦']]}); phAt(d+2,21); const fill=byTag(e.id);
  check('3. 規則晚跑到：兩天內照原本的時間補、晚三天以上不補（記 x:late）',late===0&&R==='x:late'&&fill.length===3&&fill[0].day===d&&Math.abs(fill[0].h-21.5)<0.02,J({late,R})); });

/* ---------- 4 何俊朗的招呼 ---------- */
await sec(4,async()=>{ const all=(key,f)=>{ fresh(key,20,Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',MET_LONG:true},f||{}),{zone:'us_outside',route:'US'}); const o=new Set(); for(let n=0;n<14;n++){ H.G.usLife={greet:{day:H.G.day,n,t:null}}; o.add(USL.longGreet(H.G)[0]); } return [...o]; };
  const NEW=longNew(), cut=q=>q.tail?q.t.slice(0,q.t.length-q.tail.length):q.t;
  check('4. longGreet 多六句（from／to 照稿的範圍、2028 年；有 haihao 的兩句寫 tail「……還好。」「還好。」）',NEW.length===6&&NEW.every((q,i)=>{ const r=G3[i]; return q.t===r.t&&q.from===md2key(r.from,2028)&&q.to===md2key(r.to,2028)&&(!!q.tail)===r.hh; })&&NEW[2].tail===HH_TAIL1&&NEW[5].tail==='還好。',J(NEW));
  const bad=[]; for(const q of NEW){ const a=D(q.from), b=D(q.to);
    for(const [d,inR] of [[a-1,false],[a,true],[b,true],[b+1,false]]){ if(wdOf(d)===4&&false) continue; const o=all(d), oh=all(d,{LONG_HAIHAO:true}); const has=o.includes(cut(q))||o.includes(q.t), hasH=oh.includes(q.t);
      if(has!==inR||(inR&&!hasH)) bad.push(keyOf(d)+' '+q.t); } }
  check('4. 範圍裡的那幾天（頭尾都算）加進輪流的句子、範圍外沒有',!bad.length,J(bad));
  const oct=all('2028-10-04'), octH=all('2028-10-04',{LONG_HAIHAO:true}), dec=all('2028-12-01'), decH=all('2028-12-01',{LONG_HAIHAO:true});
  check('4. 沒有 LONG_HAIHAO 的不說「……還好。」「還好。」（10/4：「我媽傳了月餅的照片給我。這裡買不到。」；12/1：「期末考。我讀到第四次，懂了一半。」）；有的照全句',
    oct.includes('我媽傳了月餅的照片給我。這裡買不到。')&&!oct.includes(NEW[2].t)&&octH.includes(NEW[2].t)&&!octH.includes('我媽傳了月餅的照片給我。這裡買不到。')&&
    dec.includes('期末考。我讀到第四次，懂了一半。')&&decH.includes(NEW[5].t)&&!dec.includes(NEW[5].t),J({oct,dec}));
  const s901=all('2028-09-01');
  check('4. 現有的句子照舊在輪流裡（不取代）：9/1 有「欸，台灣人。這裡有位。」「你讀什麼？……我讀到第三次還是不懂。」「冷氣好冷。……」，也有那兩句新的',
    ['欸，台灣人。這裡有位。','你讀什麼？……我讀到第三次還是不懂。','冷氣好冷。美國人是不是都不怕冷？',NEW[0].t,NEW[1].t].every(t=>s901.includes(t)),J(s901));
  fresh('2028-12-09',20,{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US1:'together',MET_LONG:true},{zone:'us_outside',route:'US'});
  check('4. 12/9（六）照舊換「下禮拜考完，我就要回香港了。……」（G7）',USL.longGreet(H.G)[0]==='下禮拜考完，我就要回香港了。……你們什麼時候走？'); });

/* ---------- 5 日文班 ---------- */
await sec(5,async()=>{ const L=LX(), J1=[['jp_class','日文班']];
  const bad=[]; for(const e of L.jp.slice(0,2)){ const [k,hm]=e.at.split(' '), d=D(k), h=hOf(hm);
    fresh(d,h-0.5,{},{groups:J1}); phAt(d,h-1/60); const early=byTag(e.id).length; phAt(d,h); const M=byTag(e.id); fresh(d,h-0.5,{}); phAt(d,h); const notIn=byTag(e.id).length;
    if(early||notIn||J(M.map(m=>[m.th,m.from,m.name,m.text]))!==J(e.t.map(x=>['g:jp_class',x[0],x[1],x[2]]))||!M.every(m=>m.day===d&&Math.abs(m.h-h)<0.02)) bad.push(e.id); }
  check('5. 4-1（2027-10-26 21:30）、4-2（2027-12-07 21:30）：g:jp_class、逐字；不在日文班群組的沒有',!bad.length,J(bad));
  /* 4-3 */
  const e=L.jp[2], d=D(e.at.split(' ')[0]), JPF={X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'};
  const jp=(h,f,o)=>fresh(d,h,Object.assign({},JPF,f||{}),Object.assign({zone:'jp_hub',route:'JP',groups:J1},o||{}));
  jp(21.5); const z=+STORY.tzOffset(H.G,d)||0; phAt(d,21.9); const early=byTag(e.id).length; phAt(d,22); const M=byTag(e.id), A=M.length?M[M.length-1].ask:null;
  check('5. 4-3：日本路線、人在日本＝日本 22:00（臺灣 21:00，時差 '+z+'）三則（逐字），最後一則兩個回覆「'+OPT1+'」「'+OPT2+'」，期限 4/20 21:00（臺灣）＝日本 22:00',
    z===1&&early===0&&J(M.map(m=>m.text))===J(G4[2].t.map(x=>x[1]))&&M.every(m=>m.th==='g:jp_class'&&m.day===d&&Math.abs(m.h-22)<0.02)&&!!A&&J(A.opts.map(o=>o.t))===J([OPT1,OPT2])&&A.until===T(D(md2key(UNTIL_MD,2028)),hOf(UNTIL_HM)+1),J({z,early,A}));
  fresh(d,21.5,{},{groups:J1}); phAt(d,21.1); const tw=byTag(e.id).length;
  jp(21.5,{JP_RETURNED:D('2028-04-10')}); phAt(d,22.1); const back=byTag(e.id).length;
  jp(21.5,{},{groups:[]}); phAt(d,22.1); const noGrp=byTag(e.id).length;
  check('5. 4-3 只有日本路線、人在日本、在日文班群組：臺灣路線、已經回來、不在群組＝沒有',tw===0&&back===0&&noGrp===0,J({tw,back,noGrp}));
  /* ①「好。」*/
  const pd=D(md2key(PHOTO_MD,2028));
  jp(21.5); phAt(d,22); const r1=PHONE.answer(H.G,'cz_vet_photo',0); const f1=H.G.flags.CZ_VET_PHOTO; at(pd,10.9); const s0=JP.dueStop(H.G,'jp'); at(pd,11);
  const st=JP.dueStop(H.G,'jp'); H.said=[]; if(st) await JP.playStop(GM,st,'jp'); const nar=H.said.map(s=>s.t);
  at(pd,21.9); ph(); const thx0=byTag(L.vetThanks.id).length; phAt(pd,22); const thx=byTag(L.vetThanks.id);
  check('5. 4-3 回「'+OPT1+'」：記 CZ_VET_PHOTO yes；4/22（六）白天（11:00）日本的摘要一句「'+PHOTO_T+'」；當晚 21:00（臺灣＝日本 22:00）采蓁「'+TH1+'」「'+TH2+'」',
    !!r1&&f1==='yes'&&(!s0||s0.k!=='cz_vet_photo')&&!!st&&st.k==='cz_vet_photo'&&J(nar)===J([PHOTO_T])&&thx0===0&&J(thx.map(m=>[m.th,m.name,m.text]))===J([['g:jp_class','采蓁',TH1],['g:jp_class','采蓁',TH2]])&&thx.every(m=>m.day===pd&&Math.abs(m.h-22)<0.02)&&TH_HM==='21:00',J({f1,st:st&&st.k,nar,thx:thx.map(m=>m.text)}));
  jp(21.5); phAt(d,22); const r2=PHONE.answer(H.G,'cz_vet_photo',1); const rep=r2?r2.out.map(m=>[m.from||null,m.name||null,m.text]):null; at(pd,11); const st2=JP.dueStop(H.G,'jp'); phAt(pd,22.5); const thx2=byTag(L.vetThanks.id).length;
  check('5. 4-3 回「'+OPT2+'」：采蓁回「'+REP2+'」、記 CZ_VET_PHOTO no；沒有旁白、沒有那兩則',J(rep)===J([['player',null,OPT2],['jp_caizhen','采蓁',REP2]])&&H.G.flags.CZ_VET_PHOTO==='no'&&(!st2||st2.k!=='cz_vet_photo')&&thx2===0,J({rep,st2:st2&&st2.k}));
  jp(21.5); phAt(d,22); at(D(md2key(UNTIL_MD,2028)),22.1); const late=PHONE.answer(H.G,'cz_vet_photo',0); at(pd,11); const st3=JP.dueStop(H.G,'jp'); phAt(pd,22.5);
  check('5. 4-3 不回：期限過了不能回、沒有後續（沒有旁白、沒有那兩則、不記 CZ_VET_PHOTO）',late===null&&H.G.flags.CZ_VET_PHOTO==null&&(!st3||st3.k!=='cz_vet_photo')&&byTag(L.vetThanks.id).length===0); });

/* ---------- 6 舊存檔 ---------- */
await sec(6,async()=>{ let ok=true, err='';
  try{ for(const [k,h] of [['2026-05-13',21.6],['2027-10-26',21.6],['2028-06-03',22.1]]){ const G=fresh(k,h,{},{groups:[['econ_friends','走啦'],['jp_class','日文班']]}); delete G.flags.EF_PH; delete G.flags.B106D2_SAID; X().phone(G); ph(); }
    X().phone({flags:{},stage:'law',day:D('2027-10-26'),hour:21.6}); X().phone({flags:{},stage:'econ',day:D('2026-05-13'),hour:22});
    const G={flags:{},stage:'law',day:TD('Y2S1',6,2),hour:12.1,weekday:2,events:{done:{}}}; STORY.b106d2Key(G,'econ_weilun'); STORY.b106d2Key(G,'econ_pinyu'); STORY.b106d2Key({flags:null,day:1},'econ_tangrui'); X().d2Key({flags:{},day:TD('Y1S2',6,2)},'heroine_03',()=>null); }
  catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  check('6. 舊存檔（沒有 EF_PH、B106D2_SAID、msgs；經濟系那一年）照常跑、不丟例外',ok,err);
  const F=fresh('2026-05-01',20,{}).flags; check('6. 新的局沒有預先寫進 CZ_VET_PHOTO、EF_PH（用到才寫）',F.CZ_VET_PHOTO===undefined&&F.EF_PH===undefined,J(Object.keys(F).filter(k=>/^(CZ_|EF_)/.test(k))));
  fresh('2026-05-10',20,{},{groups:[['econ_friends','走啦']]}); H.G.stage='econ'; phAt('2026-05-13',21.6); check('6. 不是法律系（經濟系那一年）不傳',byTag('ef_chain').length===0); });

H.done();
})();
