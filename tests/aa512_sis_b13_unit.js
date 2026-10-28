// AA_512 學姊第十三批：她自己的事當面演、八段空白、說了沒發生九件（企劃線 c444f0757，AA-C 2026-10-28；任務 SIS-B13-1028、SIS-LEAD-1021、D111、USER_WANTS C25）——不需要瀏覽器。
// 台詞逐字對稿（git show c444f0757：第 1、2、5、6 節的「>」、選項、13-6 三句短招呼；兩個方向）。三種玩家：交往中、朋友（認識、朋友以上、沒交往）、沒認識（沒有 met_sis／SIS_W1）。
//   0  讀稿、新檔載得到、index.html 順序；稿 → 遊戲（每一句、每個選項）、遊戲 → 稿（新檔的每一句＋各檔帶 aa512 的行）；作廢的兩句（「第二次。」、4-1 舊句）不在遊戲裡
//   1  13-1 交棒那一晚：沒認識的開場三句（Kevin 介紹她、記 FIRST_MET）、交棒以後的書單、演完記 met_sis／SIS_W1（W1、W1 晚到版不演）；認識的只有「來了。」
//   2  13-2 咖哩：5/6 21:00 群組三則＋「去。」、SIS4_CURRY 的私訊 21:05、不在群組沒有；回了 → 5/9 12:00 出遊、三個選項、SIS13_CURRY；沒回不排
//   3  13-3 霖澤館門口：12/6～12/7 17:00～18:00、朋友以上沒交往；「我等一下有課。」結束不再演；「好。」走一圈＋兩個選項、SIS13_WALK；作息那兩天 17:00～18:00 在研究室
//   4  13-4 公館的蛋糕：6/2 18:30～20:30 走近她（near 她）、朋友以上、臺灣美國路線、現有 6/2 那場沒演；第一次見陳助教的三句；SIS13_CAKE
//   5  13-5 日本路線：傳「生日快樂」＝那一句先不回、22:00（當地）視訊；接起來演、SIS13_JP_BDAY；沒接＝照現有那一句；22:00 以後才傳照舊；臺灣朋友、日本交往中照舊
//   6  13-6 洗衣間：美國挽回中、10/8～10/20 21:00～22:00 人在社區；不改挽回數值；三句短招呼（SMALLTALK：照順序、各一次；交往中沒有）
//   7  13-7 歡迎回來：12/26 21:00 群組＋「去。」→ 12/28 18:30；美國路線多一個選項；沒認識的在這裡認識
//   8  13-8 新體育館門口：5/7～5/10 週一～四 08:00～08:40、朋友以上沒交往；兩組選項、SIS13_POOL；作息在門口
//   9  第 2 節第 1 點：佳穎私訊多一個選項（有 SIS_OLD_NOTES；之後才拿到的也補）→ 隔天 21:00 學姊兩則、SIS_NOTES_PASSED
//  10  第 2 節第 3、4 點：修正本 7/15 → 7/20、SIS_THESIS_COPY；慶祝 SIS_US_CELEB → 7/29 買鎖以後那一段
//  11  第 2 節第 5 點：研究室的晚上（作息、週三法圖還有戲照舊、刷卡門晚上另外一次、21:30 一起出去、走進去那一句一次）
//  12  第 2 節第 6、7、8、9 點：第四十天（美國私訊、臺灣日本視訊開頭）、報告完了、二月那一頁、每週視訊 g3／g2 的下一次開頭
//  13  第 5 節伴手禮：1/3 約、回了才演、1/6 中飯、當晚、1/7 媽媽；臺灣路線、沒回、1/6 不在交往都沒有
//  14  第 6 節：J3／J4 記旗標、接機戀人版 (a)(b)(c)、兩個人版沒有；6-2 重新開始那一次四句、第一次照舊；6-3 改字
//  15  舊存檔：沒有新旗標照常跑、不丟例外
// 修改前（開發分支 86986abdf；git archive 那一版的 index.html、src/、tests/、lib/ 放進這支測試真的跑過，稿從這個 repo 讀：AA512_DOCREPO）：第 0～15 節每一節都有 FAIL——83 項 FAIL、21 項 PASS（PASS 的都是「不該演／照舊」那一類；第 3、4、5、6、8、11、15 節找不到新事件、丟例外中斷）。修改後 128 項 ALL PASS。
// 用法：node tests/aa512_sis_b13_unit.js（在沒有 .git 的目錄跑，設環境變數 AA512_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', TA='npc_ta_chen', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa497_supporting_unit.js：pg_harness 已經載過的不再載；畫 3D 的幾支在 Node 載不進來，跳過）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
const X=()=>typeof SISB13!=='undefined'?SISB13:null;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null, evDone=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const relNow=()=>Object.assign({},SOCIAL.rel(ID));
const wait=()=>new Promise(r=>setTimeout(r,0));
/* 存檔：kind＝'none'（沒認識：沒有 met_sis、SIS_W1、FIRST_MET）／'acq'／'fam'（熟悉）／'friend'（朋友）／'dating'（交往中）／'ex'（前任）*/
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(typeof key==='number'?keyOf(key):key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='acq') H.rel(ID,10,0,0); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  if(met&&typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,ID);
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false; if(typeof SUP497!=='undefined') SUP497.bind(GM); STORY._bindGM(GM);
  H.at(typeof key==='number'?keyOf(key):key,h); return G; };
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(key,h)=>{ at(key,h); ph(); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const answer=(id,k)=>PHONE.answer(H.G,id,k);
const askOpts=id=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; };
/* 只留這一個事件跑一次 EVENTS.tick（3D 位置、時間、她在旁邊的判斷；其他自動事件先拿掉，跑完放回去）*/
const tickOnly=async(id)=>{ const keep=STORY_EVENTS.slice(), e=ev(id); STORY_EVENTS.length=0; if(e) STORY_EVENTS.push(e); H.said=[]; H.opts=[]; let r=false;
  try{ r=!!EVENTS.tick(0.5); for(let i=0;i<50&&EVENTS.running;i++) await wait(); } finally { STORY_EVENTS.length=0; for(const x of keep) STORY_EVENTS.push(x); } return r; };
const place=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };   /* 出遊過了時間＝missed（遊戲裡是 OUT.tick，每 0.5 秒）*/

/* ---------- 讀稿 ---------- */
const SHA='c444f0757', DOCF='docs/story_planning/AA_512_學姊第十三批_她自己的事當面演_說了沒發生九件.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA512_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+1):-1; return DOC.slice(i,j<0?DOC.length:j); };
const BODY=part('## 1. 八場','## 3. ')+'\n'+part('## 5. 伴手禮')+'\n';   /* 第 1、2、5、6 節（第 3 節不補、第 4 節是給 LAWWW 的說明）*/
/* 稿的句子：「> 誰：台詞」「> （旁白）」；誰＝學姊、Kevin、佳穎、陳助教、我、書瑀、媽媽 */
const QUOTES=(()=>{ const out=[]; for(const l of BODY.split('\n')){ const m=/^\s*>\s*(.+)$/.exec(l); if(!m) continue; const s=m[1].trim();
    if(/^（/.test(s)){ out.push({who:'旁白',t:s}); continue; } const k=s.indexOf('：'); if(k<0) continue; out.push({who:s.slice(0,k),t:s.slice(k+1)}); } return out; })();
/* 稿的選項：「- 「…」→」「- （…）→」（→ 在行尾；前面的（條件）不算。第 6 節「- J3「…」→ 記…」那種說明不是選項）*/
const OPTS=(()=>{ const out=[]; for(const l of BODY.split('\n')){ const m=/^\s*- (.+?)→\s*(?:下面)?\s*$/.exec(l); if(!m) continue; const s=m[1].trim(); const q=[...s.matchAll(/「([^」]+)」/g)];
    if(q.length) out.push('「'+q[q.length-1][1]+'」'); else if(/^（[^）]+）$/.test(s)) out.push(s); } return out; })();
/* 13-6 挽回中的三句短招呼（稿是條列，不是「>」）*/
const GREET=(()=>{ const s=part('**挽回中的短招呼**','### 13-7'); return s.split('\n').slice(1).map(l=>(/^\s*- (.+)$/.exec(l)||[])[1]).filter(Boolean).map(x=>x.trim()); })();

/* 遊戲這一批的字：新檔（SISB13_LINES、SISB13_HAND、SISB13_EVENTS）＋各檔帶 aa512 的行（事件的台詞、選項）＋ SMALLTALK 的三句＋confess、feed 的改字 */
const strDeep=(v,out)=>{ if(v==null) return out; if(typeof v==='string'){ out.push(v); return out; } if(Array.isArray(v)){ v.forEach(x=>strDeep(x,out)); return out; } if(typeof v==='object') for(const k in v) strDeep(v[k],out); return out; };
const LINE_KEYS=new Set(['k','s','yes','no']);   /* SISB13_LINES 裡不是台詞的字（[誰,字] 的「誰」、選項的鍵）*/
const gameTexts=()=>{ const A=[]; if(typeof SISB13_LINES!=='undefined') strDeep(SISB13_LINES,[]).filter(t=>!LINE_KEYS.has(t)).forEach(t=>A.push(t));
  if(typeof SISB13_HAND!=='undefined') for(const k of ['open','after']) for(const l of SISB13_HAND[k]) if(typeof l.text==='string') A.push(l.text);
  const walk=L=>{ for(const l of (L||[])){ if(typeof l.text==='string'&&(l.aa512||mine.has(l))) A.push(l.text); if(l.choice) for(const c of l.choice) if(c.aa512||mine.has(l)) A.push(c.text); } };
  const mine=new Set(); if(typeof SISB13_EVENTS!=='undefined') for(const e of SISB13_EVENTS) for(const l of (e.dialogue||[])) mine.add(l);
  for(const e of STORY_EVENTS) walk(e.dialogue);
  for(const e of ((typeof SMALLTALK!=='undefined'&&SMALLTALK[ID])||[])) if(e&&e.aa512) A.push(e.t);
  if(typeof CONFESS_LINES!=='undefined'&&typeof SISB4!=='undefined'){ const rs=SISB4.restartYes; SISB4.restartYes=()=>true; try{ (CONFESS_LINES.heroine_05.yes({flags:{}})||[]).forEach(t=>A.push(t)); } finally { SISB4.restartYes=rs; } }   /* 6-2：重新開始那一次的四句（confess_lines.js）*/
  return A; };
const unq=t=>{ const s=String(t), m=/^(（[^）]*）)「(.+)」$/.exec(s); return m?m[1]+m[2]:s.replace(/^「|」$/g,''); };   /* 選項的「」、SMALLTALK 說的話加的「」 */

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{ const a=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_512 '+SHA+'：有第 5 節伴手禮、第 6 節）',DOC.length>8000&&DOC.indexOf('## 5. 伴手禮')>0&&DOC.indexOf('## 6. 說了沒發生，再補四件')>0&&QUOTES.length>=150,J({len:DOC.length,q:QUOTES.length}));
  check('0. 新檔載得到（SISB13、SISB13_LINES、SISB13_HAND、SISB13_EVENTS）；全部的檔載入沒有錯誤',!loadErr.length&&!!X()&&typeof SISB13_LINES!=='undefined'&&typeof SISB13_HAND!=='undefined'&&Array.isArray(typeof SISB13_EVENTS!=='undefined'?SISB13_EVENTS:null),J(loadErr));
  check('0. index.html：sis_b12_3d.js → data/sis_b13_events.js → sis_b13_3d.js；sup497_3d.js（交棒讀 SISB13_HAND）在後面、GAME.boot() 前面',
    /src\/sis_b12_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b13_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b13_3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/sup497_3d.js')>a('src/sis_b13_3d.js')&&a('src/sis_b13_3d.js')<a('<script>GAME.boot();</script>'));
  const G0=gameTexts(), GS=new Set(G0.map(unq).concat(G0));
  /* 稿 → 遊戲 */
  const lostQ=QUOTES.filter(q=>!GS.has(q.t)).map(q=>q.who+'：'+q.t), lostO=OPTS.filter(o=>!GS.has(o)&&!GS.has(unq(o))), lostG=GREET.filter(t=>!GS.has(t));
  check('0. 稿 → 遊戲：第 1、2、5、6 節每一句（'+QUOTES.length+' 句「>」）都在遊戲裡',QUOTES.length>=150&&!lostQ.length,J(lostQ));
  check('0. 稿 → 遊戲：每個選項（'+OPTS.length+' 個）、13-6 三句短招呼都在遊戲裡',OPTS.length===35&&GREET.length===3&&!lostO.length&&!lostG.length,J({lostO,lostG}));
  const INLINE=['你說過要來吃。','（把學姊的筆記傳給她）','去。','好','（愛心貼圖）','麵店？說好的。'];   /* 稿寫在說明句裡的（「」括起來）：13-2 私訊、第 2 節第 1 點的選項、回「去。」、媽媽那則的回覆鍵、6-1 (c) 換上的選項 */
  check('0. 稿寫在說明裡的句子（13-2 私訊、佳穎那則的選項、回「去。」、回覆鍵「好」「（愛心貼圖）」）都在稿裡、也在遊戲裡',INLINE.every(t=>DOC.indexOf('「'+t+'」')>=0&&GS.has(t)),J(INLINE.filter(t=>!(DOC.indexOf('「'+t+'」')>=0&&GS.has(t)))));
  /* 遊戲 → 稿 */
  const notIn=[...new Set(G0)].filter(t=>DOC.indexOf(t)<0&&DOC.indexOf(unq(t))<0);
  check('0. 遊戲 → 稿：新檔的每一句、各檔帶 aa512 的行、SMALLTALK 的三句（'+new Set(G0).size+' 句）都在稿裡（一字不差；SMALLTALK 說的話加「」、手機選項不加「」）',G0.length>=150&&!notIn.length,J(notIn));
  /* 改在現有檔的字 */
  const yes=(typeof CONFESS_LINES!=='undefined'&&CONFESS_LINES.heroine_05&&CONFESS_LINES.heroine_05.yes)||null, rs=SISB4.restartYes; SISB4.restartYes=()=>true; let yl=null; try{ yl=yes?yes({flags:{}}):null; } finally { SISB4.restartYes=rs; }
  check('0. 6-2：confess_lines.js 重新開始那一次四句（稿 6-2）',J(yl)===J(QUOTES.filter(q=>/^(你做到了。|……我也想好了。|其他的，想了很久。……沒有了。|這次，我選你。)$/.test(q.t)).map(q=>q.t))&&J(yl)===J(['你做到了。','……我也想好了。','其他的，想了很久。……沒有了。','這次，我選你。']),J(yl));
  const src4=fs.readFileSync(path.join(H.ROOT,'src/data/sis_b4_events.js'),'utf8'), feed=fs.readFileSync(path.join(H.ROOT,'src/data/feed_y3s1.js'),'utf8');
  check('0. 6-3：4-1 那句是「還有，我要時間。等到我說好的那天。」（稿 6-3 的「→」右邊）；舊句只剩註解',DOC.indexOf('→「還有，我要時間。等到我說好的那天。」')>0&&/SIS\('還有，我要時間。等到我說好的那天。'\)/.test(src4)&&!/SIS\('還有，我要時間。不是一週，是我說好的那天。'\)/.test(src4));
  const s1=typeof FEED_Y3S1!=='undefined'?FEED_Y3S1.posts.find(p=>p.id==='sis1e'):null;
  check('0. 改字（稿第 4 節第 5 點）：feed_y3s1 學姊第 1 則「第二次。」→「又煮了。」',DOC.indexOf('「第二次。」→「又煮了。」')>0&&!!s1&&s1.say==='又煮了。'&&!/say:'第二次。'/.test(feed),J(s1&&s1.say)); });

/* ---- 1 13-1 交棒 ---- */
await sec(1,async()=>{ const h=D('2026-09-17');
  fresh(h,18.5,'none',{},{zone:'lane118'}); const m0=SOCIAL.has(ID,'FIRST_MET'); await runEv('ev_kv_handover',[0]);
  check('1. 沒認識（沒有 SIS_W1）：開場旁白之後「（長桌另一頭，…）」→ Kevin「學弟，這是溫學姊。我們家族最大的。」→「……溫書瑀。碩一。」→「你是祐廷吧。…」→ Kevin 介紹佳穎；沒有「來了。」',
    !m0&&seq(['（118 巷的定食店。長桌的一頭坐著一個大一的女生，很緊張，筷子一直沒拆。）','（長桌另一頭，一個抱著一疊講義的女生坐得很直，面前的茶還沒喝。）','學弟，這是溫學姊。我們家族最大的。','……溫書瑀。碩一。','你是祐廷吧。群組裡的照片，看起來比本人緊張。','學弟，這是佳穎。你的直屬學妹。……對，你現在是學長了。'])&&!has('（對你點了一下頭）來了。'),J(said()));
  check('1. 交棒以後：「（學姊把一張紙推到佳穎面前。）」「書單。…」佳穎「謝、謝謝學姊！」Kevin「學姊的書單是傳家寶。…」「你沒讀。」「……我讀了第一本。」（接在 Kevin 的回答後面）',
    seq(['好！！你看，學長就是要這樣，一個字。','（學姊把一張紙推到佳穎面前。）','書單。大一上先讀前面三本，後面的不急。','謝、謝謝學姊！','學姊的書單是傳家寶。我大一也拿到一張。','你沒讀。','……我讀了第一本。'])&&H.said.find(x=>x.t==='謝、謝謝學姊！').who==='佳穎'&&H.said.find(x=>x.t==='你沒讀。').who===SOCIAL.displayName(ID),J(H.said.slice(-8)));
  check('1. 沒認識的在這裡認識：FIRST_MET（118 巷）、met_sis、SIS_W1、KV_HANDOVER；之後 W1、W1 晚到版的條件不成立',SOCIAL.has(ID,'FIRST_MET')&&H.G.flags.met_sis===true&&H.G.flags.SIS_W1===true&&H.G.flags.KV_HANDOVER===true&&!EVENTS.cond(ev('ev_sis_w1').prereq)&&!EVENTS.cond(ev('ev_sis_w1_late').prereq));
  fresh(h,18.5,'friend',{},{zone:'lane118'}); await runEv('ev_kv_handover',[2]);
  check('1. 認識的：只有「（對你點了一下頭）來了。」（沒有 Kevin 介紹她、沒有「碩一」）；「學姊不管嗎？」那一句照舊；書單照演',has('（對你點了一下頭）來了。')&&!has('學弟，這是溫學姊。我們家族最大的。')&&!has('……溫書瑀。碩一。')&&seq(['（長桌另一頭，一個抱著一疊講義的女生坐得很直，面前的茶還沒喝。）','（對你點了一下頭）來了。','學弟，這是佳穎。你的直屬學妹。……對，你現在是學長了。','學姊管的是我們。考古題這種事，交給學弟就好。','書單。大一上先讀前面三本，後面的不急。']),J(said())); });

/* ---- 2 13-2 咖哩 ---- */
await sec(2,async()=>{ const a=D('2027-05-06'), d=D('2027-05-09');
  check('2. 日子：2027-05-06 週四、05-09 週日',CALENDAR.dateOf(a).wd===4&&CALENDAR.dateOf(d).wd===7);
  fresh(a,20,'friend'); SOCIAL.remember(ID,'SIS4_CURRY','S4-L3'); phAt(a,20.9); const n0=byTag('sisb13_curry_ask').length; phAt(a,21.4); const M=byTag('sisb13_curry_ask'), dm=byTag('sisb13_curry_dm');   /* 21:24 才看：照原本的時間補進去（PHONE.tick 15 分鐘以上）*/
  check('2. 5/6 21:00 家族群組：Kevin、Kevin、學姊三則（照稿）；最後一則「去。」；21:00 以前沒有',n0===0&&J(M.map(m=>m.text))===J(['禮拜天中午 學姊家 吃咖哩！！','學姊說她煮 我負責帶白飯','白飯我煮了。你帶水果。'])&&M.every(m=>m.th==='g:family_law')&&M[0].from==='kevin'&&M[2].from===ID&&J(askOpts('sisb13_curry_ask'))===J(['去。']),J(M));
  check('2. 有 SIS4_CURRY（閒聊 S4-L3）：21:05 學姊私訊「你說過要來吃。」（不用回）',dm.length===1&&dm[0].th==='p:'+ID&&dm[0].text==='你說過要來吃。'&&Math.abs(dm[0].h-(21+5/60))<0.02&&!dm[0].ask,J(dm));
  fresh(a,20,'friend'); phAt(a,21.2); check('2. 沒有 SIS4_CURRY：沒有私訊；群組照收',byTag('sisb13_curry_ask').length===3&&!byTag('sisb13_curry_dm').length);
  fresh(a,20,'friend',{},{grp:false}); SOCIAL.remember(ID,'SIS4_CURRY',''); phAt(a,21.2); check('2. 不在家族群組：都沒有',!byTag('sisb13_curry_ask').length&&!byTag('sisb13_curry_dm').length);
  fresh(a,20,'friend'); phAt(a,21.2); phAt(d,10); check('2. 沒回「去。」：不排出遊',!OUT.get(H.G,'sisb13_curry'));
  fresh(a,20,'none'); phAt(a,21.2); answer('sisb13_curry_ask',0); ph(); const q=OUT.get(H.G,'sisb13_curry');
  check('2. 沒認識也可以回「去。」→ 排 5/9（日）12:00「學姊的新家」（ev_sis13_curry）',!!q&&q.day===d&&q.h===12&&q.ev==='ev_sis13_curry'&&q.place==='學姊的新家',J(q));
  at(d,11.6); await goOut('sisb13_curry',[0]);
  check('2. 演：新家的旁白、Kevin「（吃一口）好吃！」、「你什麼都說好吃。」、佳穎問「適量」；選項三個；「好吃。」→「……你說的，我比較信。」Kevin「欸！」',seq(['（學姊的新家。紙箱還沒全部拆完，餐桌上一鍋咖哩。食譜攤在旁邊。）','（吃一口）好吃！','你什麼都說好吃。','學姊，食譜上這兩個字為什麼被圈起來？','「適量」。……我討厭適量。','……你說的，我比較信。','欸！'])&&J(H.opts[0])===J(['「好吃。」','（看食譜）','「我可以再一碗嗎？」']),J({s:said(),o:H.opts}));
  check('2. 記 SIS13_CURRY；沒認識的演完記 met_sis、SIS_W1（同 12-4）；背景 sis_new_home（先用公寓室內）',H.G.flags.SIS13_CURRY===true&&H.G.flags.met_sis===true&&H.G.flags.SIS_W1===true&&OUT.BG.sis_new_home&&OUT.BG.sis_new_home.label==='學姊的新家');
  for(const [k,want] of [[1,['（「適量」被紅筆圈起來，旁邊畫了一個問號。）','下次我會寫數字。']],[2,['可以。……鍋子在那邊，自己盛。','（Kevin 也站起來。學姊說：「你不行。你帶的水果還沒切。」）']]]){
    fresh(a,20,'friend'); phAt(a,21.2); answer('sisb13_curry_ask',0); ph(); at(d,11.6); await goOut('sisb13_curry',[k]);
    check('2. 選項 '+(k+1)+' → '+want[0],seq(want),J(said())); } });

/* ---- 3 13-3 霖澤館門口 ---- */
await sec(3,async()=>{ const e3=ev('ev_sis13_walk'), d6=D('2027-12-06'), d7=D('2027-12-07');
  check('3. 事件：校園、自動觸發、17:00～18:00、霖澤館門口（34, −109）7 m 內、一次',!!e3&&e3.trigger==='auto'&&e3.location==='campus'&&J(e3.time)===J([17,18])&&e3.near.x===34&&e3.near.z===-109&&e3.once===true);
  fresh(d6,17.2,'friend',{},{zone:'campus'}); place(34,-106); const ran=await tickOnly('ev_sis13_walk');
  check('3. 12/6（一）17:12 朋友、走過霖澤館門口：演（EVENTS.tick）',ran===true&&has('（學姊從霖澤館走出來，抱著一件外套，看到你，停了一下。）')&&has('論文卡住了。出來走一下。……你要一起嗎？'),J(said()));
  fresh(d6,17.2,'friend',{},{zone:'campus'}); place(34,-106); await runEv('ev_sis13_walk',[0,1]);
  check('3. 「好。」→ 椰林大道：兩句（咖哩兩匙、剪報）；「剪報上寫什麼？」→「等的人越來越多。…」；回霖澤館門口三句；記 SIS13_WALK',
    seq(['（傍晚的椰林大道。腳踏車一台一台從你們旁邊過去。）','咖哩的「適量」，我改成兩匙了。我自己決定的。','我爸寄了一份剪報給我。法律扶助的新聞。旁邊用原子筆寫：「妳寫的這個。」','等的人越來越多。……我的論文寫的就是他們。','好。可以回去寫了。','（她走上樓梯，走到一半回頭。）','謝謝你走這一圈。'])&&J(H.opts[0])===J(['「好。」','「我等一下有課。」'])&&J(H.opts[1])===J(['「他在關心妳。」','「剪報上寫什麼？」'])&&H.G.flags.SIS13_WALK===true,J({s:said(),o:H.opts}));
  fresh(d6,17.2,'friend',{},{zone:'campus'}); place(34,-106); await runEv('ev_sis13_walk',[1]);
  check('3. 「我等一下有課。」→「好。那你去。」結束，不記 SIS13_WALK、不再演（隔天 17:30 也不演）',has('好。那你去。')&&!has('咖哩的「適量」，我改成兩匙了。我自己決定的。')&&!H.G.flags.SIS13_WALK&&(at(d7,17.5),!EVENTS.check(e3)),J(said()));
  fresh(d6,17.2,'friend',{},{zone:'campus'}); await runEv('ev_sis13_walk',[0,0]); check('3. 「他在關心妳。」→「他不會說。……他會寄剪報。」',has('他不會說。……他會寄剪報。'));
  const no=[]; for(const [n,key,hh,kind,o] of [['交往中',d6,17.2,'dating'],['前任',d6,17.2,'ex'],['熟悉（不到朋友）',d6,17.2,'fam'],['沒認識',d6,17.2,'none'],['12/5（窗口前）',D('2027-12-05'),17.2,'friend'],['12/8（避開 12/8～10）',D('2027-12-08'),17.2,'friend'],['16:50',d6,16.83,'friend'],['18:00',d7,18,'friend'],['在宿舍',d6,17.2,'friend',{zone:'dorm'}]]){
    fresh(key,hh,kind,{},Object.assign({zone:'campus'},o||{})); if(EVENTS.check(e3)) no.push(n); }
  check('3. 交往中、前任、熟悉、沒認識、窗口外、時間外、不在校園：不演',!no.length,J(no));
  fresh(d6,17.2,'friend',{},{zone:'campus'}); place(0,0); check('3. 離霖澤館門口太遠：tick 不演',!(await tickOnly('ev_sis13_walk')));
  fresh(d7,17.6,'friend'); const s7=STORY.schedEnt(CHARACTERS[ID],H.G); H.G.events.done.ev_sis13_walk=1; const s7b=STORY.schedEnt(CHARACTERS[ID],H.G);
  check('3. 作息：12/7（二）17:36 她在研究室（linze_5f，蓋過週二 17:30 的 118 巷自助餐）；演過以後照平常（自助餐）',!!s7&&s7.zone==='linze_5f'&&!!s7b&&s7b.zone==='l118_self',J([s7&&s7.zone,s7b&&s7b.zone])); });

/* ---- 4 13-4 公館的蛋糕 ---- */
await sec(4,async()=>{ const e4=ev('ev_sis13_cake'), d=D('2028-06-02');
  check('4. 事件：公館、自動觸發、18:30～20:30、走近她（near 她 5 m）、一次；陳助教一起在場',!!e4&&e4.location==='gongguan'&&e4.trigger==='auto'&&J(e4.time)===J([18.5,20.5])&&e4.near.npc===ID&&e4.once===true&&J(e4.participants)===J([ID,TA]));
  fresh(d,19,'friend',{},{zone:'gongguan'}); GM.npc[ID]={obj:{position:{x:3,y:0,z:0}},lv:0}; place(1,0); const ran=await tickOnly('ev_sis13_cake');
  check('4. 6/2（五）19:00 朋友、臺灣路線、公館走近她：演（tick）；第一次見陳助教＝自我介紹三句',ran===true&&J(said().slice(0,6))===J(['（公館一家小店的窗邊。學姊和陳助教中間放著一個切了一半的小蛋糕。）','（看到你）欸，學弟。過來，幫忙吃。','……研究室的人買的。太大了。','我是陳助教。書瑀的……飯友。','同學。','同學。'])&&H.said[4].who===SOCIAL.displayName(ID)&&H.said[5].who===SOCIAL.displayName(TA),J(said()));
  fresh(d,19,'friend',{},{zone:'gongguan'}); GM.npc[ID]={obj:{position:{x:9,y:0,z:0}},lv:0}; place(1,0); check('4. 離她太遠：tick 不演',!(await tickOnly('ev_sis13_cake')));
  fresh(d,19,'friend',{},{zone:'gongguan'}); SOCIAL.meet(TA,'wancai'); await runEv('ev_sis13_cake',[0]);
  check('4. 見過陳助教：沒有自我介紹；「生日快樂。」→「……你怎麼知道？」陳助教「我剛剛講太大聲了。」；SIS13_CAKE',!has('我是陳助教。書瑀的……飯友。')&&seq(['……你怎麼知道？','我剛剛講太大聲了。'])&&H.said.find(x=>x.t==='我剛剛講太大聲了。').who===SOCIAL.displayName(TA)&&H.G.flags.SIS13_CAKE===true&&J(H.opts[0])===J(['「生日快樂。」','（坐下來吃一塊）']),J(said()));
  fresh(d,19,'friend',{},{zone:'gongguan'}); await runEv('ev_sis13_cake',[1]); check('4. （坐下來吃一塊）→ 三個人吃完、「今天我請。……生日的人請。」；演完記得陳助教（FIRST_MET）',seq(['（三個人把剩下的蛋糕吃完。陳助教要付錢，學姊先把錢放在桌上。）','今天我請。……生日的人請。'])&&SOCIAL.has(TA,'FIRST_MET'));
  const ok=[], no=[]; for(const [n,kind,fl,o,want] of [['美國路線（8/2 才走）','friend',{},{route:'US'},true],['交往中、沒傳生日快樂','dating',{},{},true],['朋友、傳過（朋友版 msg）','friend',{SIS_BDAY_Y3:'msg'},{},true],
      ['交往中、約了六點 Café（invited）','dating',{SIS_BDAY_Y3:'invited'},{},false],['交往中、Café 演過（cafe）','dating',{SIS_BDAY_Y3:'cafe'},{},false],['交往中、22:30 那版（late_ask）','dating',{SIS_BDAY_Y3:'late_ask'},{},false],
      ['日本路線','friend',{},{route:'JP'},false],['前任','ex',{},{},false],['熟悉','fam',{},{},false],['沒認識','none',{},{},false]]){
    fresh(d,19,kind,fl,Object.assign({zone:'gongguan'},o)); const r=EVENTS.check(e4); if(r!==want) (want?ok:no).push(n); }
  fresh('2028-06-09',19,'friend',{},{zone:'gongguan'}); if(EVENTS.check(e4)) no.push('6/9（下一個週五）'); fresh(d,18.25,'friend',{},{zone:'gongguan'}); if(EVENTS.check(e4)) no.push('18:15');
  check('4. 美國路線、交往中沒傳、朋友版傳過＝演；和現有 6/2 那場互斥（invited、cafe、late_ask）、日本路線、前任、熟悉、沒認識、別的週五、18:30 以前＝不演',!ok.length&&!no.length,J({ok,no})); });

/* ---- 5 13-5 日本路線的生日視訊 ---- */
await sec(5,async()=>{ const d=D('2028-06-02');
  const jp=(kind,h,fl)=>{ fresh(d,h,kind,fl,{route:'JP'}); H.G.flags.JP_DEPARTED=D('2028-03-25'); };
  jp('friend',13); const tp=MSG.topics(H.G,ID).map(q=>q.k).includes('bday'), r=MSG.send(H.G,ID,'bday'); const q=OUT.get(H.G,'sisb13_jp_bday'); phAt(d,21.9);
  check('5. 日本路線、朋友、沒交往：6/2（當地 13:00）傳「生日快樂」→ 那一句先不回；排視訊 6/2 當地 22:00（臺灣 21:00；接起來／先不接）',tp&&r&&r.ok&&!!q&&q.day===d&&q.h===22&&q.verb==='接起來'&&q.no==='先不接'&&q.ev==='ev_sis13_jp_bday'&&!txt('p:'+ID).includes('謝謝。研究室的人買了一個小蛋糕。')&&H.G.flags.SIS_BDAY_Y3==='msg',J({q,t:txt('p:'+ID)}));
  at(d,21.9); await goOut('sisb13_jp_bday',[1]);
  check('5. 接起來：蛋糕的旁白、「研究室的人買的。……我吃不完。」「你那邊幾點？」祐廷「十點。」「……那你早點睡。我只打十分鐘。」；「許了什麼願？」→「一個。跟論文有關。……你不要笑。」；「好。十分鐘到了。謝謝你接。」；SIS13_JP_BDAY',
    seq(['（視訊。她把一個小蛋糕拿到鏡頭前，上面插著一根蠟燭，已經吹熄了。）','研究室的人買的。……我吃不完。','你那邊幾點？','十點。','……那你早點睡。我只打十分鐘。','一個。跟論文有關。……你不要笑。','好。十分鐘到了。謝謝你接。'])&&H.said.find(x=>x.t==='十點。').who===H.G.name&&J(H.opts[0])===J(['「生日快樂。」','「許了什麼願？」'])&&H.G.flags.SIS13_JP_BDAY===true&&(phAt(d,23),!txt('p:'+ID).includes('謝謝。研究室的人買了一個小蛋糕。')),J(said()));
  jp('friend',13); MSG.send(H.G,ID,'bday'); at(d,23); expire(); ph(); ph();
  check('5. 沒接（過了時間）：照現有那一句「謝謝。研究室的人買了一個小蛋糕。」；沒有 SIS13_JP_BDAY',txt('p:'+ID).includes('謝謝。研究室的人買了一個小蛋糕。')&&!H.G.flags.SIS13_JP_BDAY&&OUT.get(H.G,'sisb13_jp_bday').state==='missed',J(txt('p:'+ID)));
  jp('friend',13); MSG.send(H.G,ID,'bday'); at(d,21.8); H.picks=[2]; await OUT.prompt(GM,OUT.get(H.G,'sisb13_jp_bday')); ph();
  check('5. 「先不接」：照現有那一句',txt('p:'+ID).includes('謝謝。研究室的人買了一個小蛋糕。')&&!H.G.flags.SIS13_JP_BDAY);
  jp('friend',22.4); MSG.send(H.G,ID,'bday'); at(d+1,13); ph();
  check('5. 22:00（當地）以後才傳：不打視訊、照舊回那一句',!OUT.get(H.G,'sisb13_jp_bday')&&txt('p:'+ID).includes('謝謝。研究室的人買了一個小蛋糕。'),J(txt('p:'+ID)));
  fresh(d,13,'friend'); MSG.send(H.G,ID,'bday'); at(d,17.2); ph(); check('5. 臺灣路線朋友：照舊（17:05 回那一句、沒有視訊）',!OUT.get(H.G,'sisb13_jp_bday')&&txt('p:'+ID).includes('謝謝。研究室的人買了一個小蛋糕。'));
  jp('dating',13); MSG.send(H.G,ID,'bday'); at(d,14); ph(); check('5. 日本路線交往中：照現有交往版（「你那邊七點吧。視訊，十分鐘。」），不排這一場',!OUT.get(H.G,'sisb13_jp_bday')&&txt('p:'+ID).includes('你那邊七點吧。視訊，十分鐘。'),J(txt('p:'+ID))); });

/* ---- 6 13-6 洗衣間、短招呼 ---- */
await sec(6,async()=>{ const e6=ev('ev_sis13_laundry'), d=D('2028-10-10');
  const us=(key,h,kind,fl,zone)=>{ fresh(key,h,kind,Object.assign({US_ARRIVED:true,US1:'alone'},fl||{}),{route:'US',zone:zone||'us_outside'}); };
  us(d,21.3,'ex'); const r0=J(H.G.flags.REPAIR||{}); const ran=await tickOnly('ev_sis13_laundry');
  check('6. 美國路線挽回中、10/10 21:18 人在社區：演（tick）；C 棟洗衣間（2D 背景 us_c_laundry）',ran===true&&!!e6&&e6.location==='us_outside'&&J(e6.time)===J([21,22])&&has('（C 棟地下室的洗衣間。烘衣機在轉。學姊坐在摺衣台上，手上一本英文書。）')&&H.bgs.includes('dark')&&OUT.BG.us_c_laundry.label==='C 棟・地下室的洗衣間',J(said()));
  us(d,21.3,'ex'); await runEv('ev_sis13_laundry',[0]);
  check('6. 「妳在讀什麼？」→「下週的報告。…」旁白「（她把書翻過來…）」「……謝謝。」→「你的還有十分鐘。……我先上去了。」；SIS13_LAUNDRY；不改挽回（REPAIR 沒動）',
    seq(['……你也來洗衣服。','（她挪了一下，讓出摺衣台的一角。）','這裡的烘衣機要投三次硬幣。我第一次只投一次，衣服還是濕的。','下週的報告。……有一個字，我一直念錯。','（她把書翻過來，指給你看。你念了一次。她跟著念了一次。）','……謝謝。','你的還有十分鐘。……我先上去了。'])&&H.G.flags.SIS13_LAUNDRY===true&&J(H.G.flags.REPAIR||{})===r0,J(said()));
  us(d,21.3,'ex'); await runEv('ev_sis13_laundry',[1]); check('6. （坐在旁邊等）→「（你們都沒說話。…）」',seq(['（你們都沒說話。烘衣機停的時候，她先站起來。）','你的還有十分鐘。……我先上去了。']));
  const no=[]; for(const [n,key,h,kind,fl,zone] of [['交往中',d,21.3,'dating'],['10/7（窗口前）','2028-10-07',21.3,'ex'],['10/21（窗口後）','2028-10-21',21.3,'ex'],['20:50',d,20.83,'ex'],['在公寓裡',d,21.3,'ex',{},'us_apartment'],['還沒到美國',d,21.3,'ex',{US_ARRIVED:false}]]){
    us(key,h,kind,fl,zone); if(EVENTS.check(e6)) no.push(n); }
  fresh(d,21.3,'ex',{},{zone:'us_outside'}); if(EVENTS.check(e6)) no.push('臺灣路線');
  check('6. 交往中、窗口外、時間外、不在社區、還沒到、臺灣路線：不演',!no.length,J(no));
  const G3=GREET.map(t=>/^（/.test(t)?t.replace(/^(（[^）]*）)(.+)$/,'$1「$2」'):'「'+t+'」'), got=[];
  us(D('2028-10-02'),10,'ex',{},'us_lawlib'); for(let i=0;i<4;i++){ H.G.day=D('2028-10-02')+i; H.G.weekday=wdOf(H.G.day); const r=STORY.smallTalk(H.G,ID); got.push(r.say||r.narr); }
  check('6. 挽回中的短招呼（SMALLTALK，美國、挽回中）：照順序一天一句「（她點了一下頭。）「早。」」「「這邊的咖啡很淡。…」」「「報告完了。…」」，各一次；第四天回到「……我沒事。只是沒睡。」',J(got.slice(0,3))===J(G3)&&got[3]==='「……我沒事。只是沒睡。」',J(got));
  us(D('2028-10-02'),10,'dating',{},'us_lawlib'); const gd=STORY.smallTalk(H.G,ID); fresh(D('2028-10-02'),10,'ex',{},{zone:'library'}); const gt=STORY.smallTalk(H.G,ID);
  check('6. 交往中、臺灣：沒有這三句',!G3.includes(gd.say)&&!G3.includes(gt.say),J([gd,gt])); });

/* ---- 7 13-7 歡迎回來 ---- */
await sec(7,async()=>{ const a=D('2028-12-26'), d=D('2028-12-28');
  check('7. 日子：2028-12-26 週二、12-28 週四',CALENDAR.dateOf(a).wd===2&&CALENDAR.dateOf(d).wd===4);
  fresh(a,20,'none',{},{route:'JP'}); phAt(a,21.2); const M=byTag('sisb13_welcome_ask');
  check('7. 12/26 21:00 家族群組：Kevin 兩則（照稿）＋「去。」（沒認識、日本路線也有）',J(M.map(m=>m.text))===J(['學姊回來了！！','禮拜四家聚 歡迎回來 118 巷那家'])&&M.every(m=>m.from==='kevin'&&m.th==='g:family_law')&&J(askOpts('sisb13_welcome_ask'))===J(['去。']),J(M));
  answer('sisb13_welcome_ask',0); ph(); const q=OUT.get(H.G,'sisb13_welcome');
  check('7. 回「去。」→ 排 12/28（四）18:30「118 巷・定食店」',!!q&&q.day===d&&q.h===18.5&&q.place==='118 巷・定食店'&&q.ev==='ev_sis13_welcome',J(q));
  at(d,18.4); await goOut('sisb13_welcome',[1]);
  check('7. 演：餅乾旁白、Kevin「學姊，報告一下美國。」「……冷。」「就這樣？」「圖書館整面都是窗。……然後很冷。」佳穎「…熬夜嗎？」「熬。熬完還去跑步。」；日本路線兩個選項；「餅乾可以吃嗎？」→「可以。很甜。不要一次吃完。」「（Kevin 把手收回去。）」',
    seq(['（長桌那一頭，學姊面前放著一盒美國的餅乾。這一盒是新的。）','學姊，報告一下美國。','……冷。','就這樣？','圖書館整面都是窗。……然後很冷。','學姊，美國的研究生也熬夜嗎？','熬。熬完還去跑步。','可以。很甜。不要一次吃完。','（Kevin 把手收回去。）'])&&J(H.opts[0])===J(['「美國好玩嗎？」','「餅乾可以吃嗎？」']),J({s:said(),o:H.opts}));
  check('7. 沒認識的在這裡認識：FIRST_MET、met_sis、SIS_W1；SIS13_WELCOME',H.G.flags.SIS13_WELCOME===true&&H.G.flags.met_sis===true&&H.G.flags.SIS_W1===true&&SOCIAL.has(ID,'FIRST_MET'));
  fresh(a,20,'dating',{US_ARRIVED:true,US_RETURNED:D('2028-12-23')},{route:'US'}); phAt(a,21.2); answer('sisb13_welcome_ask',0); ph(); at(d,18.4); await goOut('sisb13_welcome',[2]);
  check('7. 美國路線（同一班回來的）：多「我們剛回來，又見面了。」→「……嗯。這次是在臺灣。」',J(H.opts[0])===J(['「美國好玩嗎？」','「餅乾可以吃嗎？」','「我們剛回來，又見面了。」'])&&has('……嗯。這次是在臺灣。'),J({o:H.opts,s:said()}));
  fresh(a,20,'friend'); phAt(a,21.2); at(d,19.5); ph(); check('7. 沒回「去。」：不排',!OUT.get(H.G,'sisb13_welcome'));
  fresh(a,20,'friend'); phAt(a,21.2); answer('sisb13_welcome_ask',0); ph(); at(d,18.4); await goOut('sisb13_welcome',[0]); check('7. 「美國好玩嗎？」→「好玩。……回來比較好。」',has('好玩。……回來比較好。')); });

/* ---- 8 13-8 新體育館門口 ---- */
await sec(8,async()=>{ const e8=ev('ev_sis13_pool'), d=D('2029-05-08');
  fresh(d,8.3,'friend',{},{zone:'campus'}); place(74,57); const ran=await tickOnly('ev_sis13_pool');
  check('8. 5/8（二）08:18 朋友、走過新體育館門口：演（tick）',ran===true&&has('（新體育館門口。學姊的頭髮還是濕的，手上拿著泳鏡。）')&&has('……早。你這麼早來體育館？'),J(said()));
  fresh(d,8.3,'friend',{},{zone:'campus'}); await runEv('ev_sis13_pool',[1,1]);
  check('8. 「剛好經過。」→「剛好。我要去法圖，同一個方向。」；走到法圖兩句；「會想念研究室嗎？」→「會想念門口那張。…」；法圖門口「（她把泳鏡塞進包包。）」「你要進去嗎？……那一起。」；SIS13_POOL',
    seq(['剛好。我要去法圖，同一個方向。','七月就要上班了。研究單位。','我上禮拜去看了位子。靠窗。……第一次有一張不用抽籤的桌子。','會想念門口那張。每個人進來都跟我說早。','（她把泳鏡塞進包包。）','你要進去嗎？……那一起。'])&&J(H.opts)===J([['「來跑步。」','「剛好經過。」'],['「恭喜。」','「會想念研究室嗎？」']])&&H.G.flags.SIS13_POOL===true,J({s:said(),o:H.opts}));
  fresh(d,8.3,'friend',{},{zone:'campus'}); await runEv('ev_sis13_pool',[0,0]); check('8. 「來跑步。」→「跑完記得吃早餐。」；「恭喜。」→「謝謝。……還沒上班就被恭喜，有點早。」',seq(['跑完記得吃早餐。','謝謝。……還沒上班就被恭喜，有點早。']));
  const no=[]; for(const [n,key,h,kind] of [['交往中',d,8.3,'dating'],['前任',d,8.3,'ex'],['熟悉',d,8.3,'fam'],['5/11（五）','2029-05-11',8.3,'friend'],['5/6（日、窗口前）','2029-05-06',8.3,'friend'],['5/14（下週一）','2029-05-14',8.3,'friend'],['08:40',d,8+40/60,'friend'],['07:50',d,7.83,'friend']]){
    fresh(key,h,kind,{},{zone:'campus'}); if(EVENTS.check(e8)) no.push(n); }
  check('8. 交往中、前任、熟悉、週五、窗口外、08:40 以後、08:00 以前：不演',!no.length,J(no));
  fresh(d,8.3,'friend',{},{zone:'campus'}); place(20,20); check('8. 離體育館門口太遠：tick 不演',!(await tickOnly('ev_sis13_pool')));
  fresh(d,8.3,'friend'); const s=STORY.schedEnt(CHARACTERS[ID],H.G); H.G.events.done.ev_sis13_pool=1; const s2=STORY.schedEnt(CHARACTERS[ID],H.G);
  check('8. 作息：5/8 08:18 她在新體育館門口（校園）；演過就照平常',!!s&&s.zone==='campus'&&s.label==='新體育館門口（剛游完泳）'&&!(s2&&s2.label==='新體育館門口（剛游完泳）'),J([s&&s.label,s2&&s2.label])); });

/* ---- 9 第 2 節第 1 點 ---- */
await sec(9,async()=>{ const d=D('2027-03-08'), YZ='family_junior';
  fresh(d,20,'friend',{SIS_OLD_NOTES:true}); phAt(d,21.1);
  check('9. 有 SIS_OLD_NOTES：3/8 佳穎私訊多一個選項「（把學姊的筆記傳給她）」',J(askOpts('kv_yz'))===J(['（傳給她）','（把學姊的筆記傳給她）']),J(askOpts('kv_yz')));
  at(d,21.5); answer('kv_yz',1); ph(); const t1=txt('p:'+YZ);
  check('9. 傳了 →佳穎「這是……溫學姊的字？謝謝學長！！」；記 SIS_NOTES_PASSED',J(t1.slice(-2))===J(['（把學姊的筆記傳給她）','這是……溫學姊的字？謝謝學長！！'])&&H.G.flags.SIS_NOTES_PASSED===true,J(t1));
  phAt(d+1,20.9); const b0=byTag('sisb13_notes_back').length; phAt(d+1,21.1); const B=byTag('sisb13_notes_back');
  check('9. 隔天 21:00 學姊私訊兩則（不用回）：「佳穎拿著我的筆記來問問題。」「……你真的傳下去了。」',b0===0&&J(B.map(m=>m.text))===J(['佳穎拿著我的筆記來問問題。','……你真的傳下去了。'])&&B.every(m=>m.th==='p:'+ID&&!m.ask)&&B[0].day===d+1,J(B));
  fresh(d,20,'friend'); phAt(d,21.1); check('9. 沒有 SIS_OLD_NOTES：照舊一個選項',J(askOpts('kv_yz'))===J(['（傳給她）']));
  fresh(d,20,'friend'); phAt(d,21.1); H.G.flags.SIS_OLD_NOTES=true; phAt(D('2027-04-07'),20.5);
  check('9. 3/8 那則還沒回、後來才拿到筆記（大二下第 7 週）：補上這個選項',J(askOpts('kv_yz'))===J(['（傳給她）','（把學姊的筆記傳給她）']),J(askOpts('kv_yz')));
  fresh(d,20,'friend',{SIS_OLD_NOTES:true}); phAt(d,21.1); answer('kv_yz',0); phAt(d+1,21.2); check('9. 選「（傳給她）」：沒有 SIS_NOTES_PASSED、隔天沒有學姊那兩則',!H.G.flags.SIS_NOTES_PASSED&&!byTag('sisb13_notes_back').length); });

/* ---- 10 第 2 節第 3、4 點 ---- */
await sec(10,async()=>{ const a=D('2029-07-15'), d=D('2029-07-20');
  fresh(a,20,'friend'); SOCIAL.remember(ID,'SIS6_FATHER_COPY','S5-L5'); phAt(a,21.1); const M=byTag('sisb13_thesis_ask');
  check('10. 3 有 SIS6_FATHER_COPY：7/15（日）21:00 三則，選項「要。」「不用了，給更需要的人。」',J(M.map(m=>m.text))===J(['修正本印好了。','第一本給我爸了。他放在辦公室書架最上面。','第二本。……你說過要的。'])&&J(askOpts('sisb13_thesis_ask'))===J(['要。','不用了，給更需要的人。'])&&CALENDAR.dateOf(a).wd===7,J(M));
  answer('sisb13_thesis_ask',0); ph(); const q=OUT.get(H.G,'sisb13_thesis');
  check('10. 3「要。」→「週五晚上，公館。我放在陳助教那桌。」；排 7/20（五）18:30 公館',txt('p:'+ID).slice(-1)[0]==='週五晚上，公館。我放在陳助教那桌。'&&!!q&&q.day===d&&q.h===18.5&&CALENDAR.dateOf(d).wd===5,J(q));
  at(d,18.3); await goOut('sisb13_thesis'); check('10. 3 演：「（桌上一本裝訂好的論文，封面上寫著你的名字。）」「簽名不用。……我寫了一句在第一頁。你回家再看。」；SIS_THESIS_COPY',seq(['（桌上一本裝訂好的論文，封面上寫著你的名字。）','簽名不用。……我寫了一句在第一頁。你回家再看。'])&&H.G.flags.SIS_THESIS_COPY===true,J(said()));
  fresh(a,20,'friend'); SOCIAL.remember(ID,'SIS6_FATHER_COPY',''); phAt(a,21.1); answer('sisb13_thesis_ask',1); ph();
  check('10. 3「不用了…」→「……好。那我留一本在研究室，給學弟妹。」；不排',txt('p:'+ID).slice(-1)[0]==='……好。那我留一本在研究室，給學弟妹。'&&!OUT.get(H.G,'sisb13_thesis'));
  fresh(a,20,'friend'); phAt(a,21.1); check('10. 3 沒有 SIS6_FATHER_COPY：沒有',!byTag('sisb13_thesis_ask').length);
  /* 4 慶祝 */
  const call=ev('ev_sis_us_result'); fresh('2028-03-15',21.5,'friend'); await runEv('ev_sis_us_result',[1]);
  check('10. 4 3/15 結果的電話選「要慶祝嗎？」→ 記 SIS_US_CELEB（「要。……等我把八月以前的事排完。」照舊）',H.G.flags.SIS_US_CELEB===true&&has('要。……等我把八月以前的事排完。')&&!!call);
  fresh('2028-07-29',15,'friend',{SIS_US_CELEB:true}); await runEv('ev_sis_predepart',[1,0]);
  check('10. 4 7/29 買鎖：有 SIS_US_CELEB＝買完鎖以後「三月你說要慶祝。……我排完了。」「今天這樣，算嗎？」；「不算，要吃飯。」→「……那買完鎖去吃。你選。」；後面照舊',
    seq(['（騎樓下。她挑鎖挑了很久，最後買了最普通的那一個。）','三月你說要慶祝。……我排完了。','今天這樣，算嗎？','……那買完鎖去吃。你選。','那邊沒有騎樓。下雨要自己撐傘。'])&&J(H.opts[0])===J(['「算。」','「不算，要吃飯。」'])&&!has('好。……那我請你喝一杯。'),J({s:said(),o:H.opts}));
  fresh('2028-07-29',15,'friend',{SIS_US_CELEB:true}); await runEv('ev_sis_predepart',[0,0]); check('10. 4「算。」→「好。……那我請你喝一杯。」',has('好。……那我請你喝一杯。')&&!has('……那買完鎖去吃。你選。'));
  fresh('2028-07-29',15,'friend'); await runEv('ev_sis_predepart',[0]); check('10. 4 沒有 SIS_US_CELEB：照舊（沒有那一段、第一個選項是「四個多月很快。」）',!has('三月你說要慶祝。……我排完了。')&&J(H.opts[0])===J(['「四個多月很快。」','「會想回來嗎？」'])&&has('嗯。……計畫本排到十二月了，排完就覺得很快。'),J({s:said(),o:H.opts})); });

/* ---- 11 第 2 節第 5 點 研究室的晚上 ---- */
await sec(11,async()=>{ const C=CHARACTERS[ID], ent=()=>{ const e=STORY.schedEnt(C,H.G); return e?(e.zone||e.away):null; };
  const mon=D('2026-09-21'), wed5=STORY.termDay('Y2S1',5,3), wed8=STORY.termDay('Y2S1',8,3);
  fresh(mon,19.5,'dating'); const z1=ent(), k1=LAB5.canKnock(H.G); fresh(mon,19.5,'friend'); const z2=ent();
  check('11. 大二上 9/21（一）19:30：交往中在研究室（linze_5f；4F 刷卡門可以傳訊息）；朋友照舊在 Café',z1==='linze_5f'&&k1===true&&z2==='cafe',J([z1,k1,z2]));
  fresh(wed8,19.5,'dating'); const z3=ent(); fresh(wed5,19.5,'dating'); const z4=ent(), y4=X().labYield(H.G); H.G.events.done.ev_sis_db_taught=1; const z5=ent();
  check('11. 週三：交往中在研究室（第 8 週）；第 5 週法圖還有「教她資料庫」那一場（sis_b8 S.LIST）＝照舊在法圖，演過以後換研究室',z3==='linze_5f'&&z4==='lawlib'&&y4===true&&z5==='linze_5f',J([z3,z4,y4,z5]));
  fresh(mon+1,19.5,'dating'); const z6=ent(); fresh(mon,21.6,'dating'); const z7=ent(); fresh('2026-08-24',19.5,'dating'); const z8=ent();
  check('11. 週二（演習課、Café）、21:30 以後、大二上以前（8/24）：不在研究室',z6!=='linze_5f'&&z7!=='linze_5f'&&z8!=='linze_5f',J([z6,z7,z8]));
  fresh(mon,12.5,'dating'); H.G.flags.LAB5_DOOR=H.G.day; const kNoon=LAB5.canKnock(H.G); at(mon,19.5); const kEve=LAB5.canKnock(H.G);
  check('11. 刷卡門：中午傳過一次，晚上那一段另外可以再傳一次',kNoon===false&&kEve===true,J([kNoon,kEve]));
  fresh(mon,19.5,'dating',{},{zone:'linze_5f'}); H.G.flags.LAB5_IN_EVE=H.G.day; const l0=LAB5.leaveDue(H.G); at(mon,21.6); const l1=LAB5.leaveDue(H.G);
  fresh(mon,14.5,'dating',{},{zone:'linze_5f'}); H.G.flags.LAB5_IN=H.G.day; const l2=LAB5.leaveDue(H.G);
  check('11. 晚上進去的：她在的時候不出去、21:30 她的作息離開研究室＝一起出去；中午照舊 14:00',l0===false&&l1===true&&l2===true,J([l0,l1,l2]));
  const e5=ev('ev_sis13_lab_eve'); fresh(mon,19.5,'dating',{},{zone:'linze_5f'}); const c1=EVENTS.check(e5); await runEv('ev_sis13_lab_eve'); const c2=EVENTS.check(e5);
  check('11. 走進研究室（19:30、交往中）：「七點以後。……你準時。」一次（之後照一般招呼）',c1===true&&has('七點以後。……你準時。')&&c2===false&&e5.trigger==='enter'&&e5.location==='linze_5f',J([c1,c2]));
  fresh(mon,19.5,'friend',{},{zone:'linze_5f'}); const c3=EVENTS.check(e5); fresh(mon,13,'dating',{},{zone:'linze_5f'}); const c4=EVENTS.check(e5);
  check('11. 朋友、中午：沒有那一句',c3===false&&c4===false); });

/* ---- 12 第 2 節第 6、7、8、9 點 ---- */
await sec(12,async()=>{ const d40=D('2028-09-11');
  const us=(key,h,kind,fl)=>{ fresh(key,h,kind,Object.assign({US_ARRIVED:true,US1:'together'},fl||{}),{route:'US',zone:'us_apartment'}); };
  us(d40,20,'dating',{SIS_ASKED_HOME_LAKE:true}); phAt(d40,21.9); const n0=byTag('sisb13_day40').length; phAt(d40,22.1); const M=byTag('sisb13_day40');
  check('12. 6 美國路線交往中：9/11（第四十天）22:00「今天第四十天。」；湖邊問過「想家嗎？」的多「你之前問我想不想家。」；「……想。一點點。」＋兩個選項',n0===0&&J(M.map(m=>m.text))===J(['今天第四十天。','你之前問我想不想家。','……想。一點點。'])&&J(askOpts('sisb13_day40'))===J(['想什麼？','我過去。']),J(M));
  answer('sisb13_day40',1); check('12. 6「我過去。」→「好。……帶傘，外面在下雨。」',txt('p:'+ID).slice(-1)[0]==='好。……帶傘，外面在下雨。');
  us(d40,20,'dating'); phAt(d40,22.1); answer('sisb13_day40',0);
  check('12. 6 沒問過：兩則；「想什麼？」→「家裡樓下那家早餐店。……很奇怪，平常我都沒吃。」',J(byTag('sisb13_day40').map(m=>m.text))===J(['今天第四十天。','……想。一點點。'])&&txt('p:'+ID).slice(-1)[0]==='家裡樓下那家早餐店。……很奇怪，平常我都沒吃。',J(txt('p:'+ID)));
  us(d40,20,'ex'); phAt(d40,22.1); check('12. 6 美國路線挽回中：沒有',!byTag('sisb13_day40').length);
  const lake=ev('ev_usl_lake1'); us('2028-08-05',18.5,'dating'); await runEv('ev_usl_lake1',[1]); check('12. 6 湖邊「想家嗎？」→ 記 SIS_ASKED_HOME_LAKE（「……問我第四十天的時候。」照舊）',H.G.flags.SIS_ASKED_HOME_LAKE===true&&has('……問我第四十天的時候。')&&!!lake);
  fresh('2028-01-25',21.5,'dating'); OUT.rec(H.G).push({id:'sisb10_cny_2028',ev:'ev_sis_cny_call',day:D('2028-01-25'),h:21.5,state:'planned'}); await runEv('ev_sis_cny_call',[1]); const cny=H.G.flags.SIS_ASKED_HOME_CNY&&has('……到時候再告訴你。');   /* 2028 除夕的電話（SISB10.cnyYear 看出遊紀錄）*/
  /* 臺灣、日本路線交往中：第四十天那一週（9/10）的每週視訊開頭 */
  const vid=async(key,fl,picks,set)=>{ fresh(key,10,'dating',fl); const q={id:'y4_sa_g_t'+key,ev:'ev_sis_video_gf',day:D(key),h:10,late:1,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,sa:{k:0,gset:set==null?6:set}}; OUT.rec(H.G).push(Object.assign({state:'planned',ask:null},q)); await goOut(q.id,picks); };
  await vid('2028-09-10',{SIS_ASKED_HOME_CNY:true});
  check('12. 6 臺灣路線：除夕電話問過「妳會想家嗎？」（SIS_ASKED_HOME_CNY）→ 9/10 那一週的視訊開頭「你之前問我會不會想家。……會。今天第四十天。」；只一次',cny===true&&said()[0]==='你之前問我會不會想家。……會。今天第四十天。'&&H.G.flags.SIS13_DAY40==='video'&&!X().day40Video(H.G),J({cny,s:said()}));
  await vid('2028-09-17',{SIS_ASKED_HOME_CNY:true}); const late=has('你之前問我會不會想家。……會。今天第四十天。'); await vid('2028-09-10',{}); const non=has('你之前問我會不會想家。……會。今天第四十天。');
  check('12. 6 下一週（9/17）、沒問過：沒有',!late&&!non);
  /* 7 報告完了 */
  for(const [rk,wk] of [['2028-10-21','2028-10-25'],['2028-10-29','2028-11-01']]){ us(rk,16,'dating'); H.G.events.done.ev_us208_rehearsal=1; H.G.events.last.ev_us208_rehearsal=D(rk); SOCIAL.remember(ID,'US208_REHEARSAL','');
    phAt(D(wk),20.9); const b=byTag('sisb13_report').length; phAt(D(wk),21.1); const R=byTag('sisb13_report');
    check('12. 7 彩排 '+rk+'（'+'日一二三四五六'[wdOf(D(rk))]+'）→ 下一個週三 '+wk+' 21:00 三則（不用回）',b===0&&CALENDAR.dateOf(D(wk)).wd===3&&J(R.map(m=>m.text))===J(['報告完了。','最後有一個人舉手問問題。我聽懂了，也答了。','……你那天說聽不懂的地方，我改掉了。'])&&R.every(m=>!m.ask&&m.day===D(wk)),J(R)); }
  us('2028-10-25',20,'dating'); phAt('2028-10-25',21.1); check('12. 7 沒彩排：沒有',!byTag('sisb13_report').length);
  /* 8 二月那一頁 */
  const nye=ev('ev_sis_nye_y2'); fresh('2026-12-31',23.5,'dating'); await runEv('ev_sis_nye_y2',[0]); const pq=H.G.flags.SIS_NYE_PLAN_Q;
  const a8=D('2029-01-31'), d8=D('2029-02-01');
  fresh(a8,20,'dating',{SIS_NYE_PLAN_Q:true}); phAt(a8,21.1); const F8=byTag('sisb13_feb_ask');
  check('12. 8 醉月湖「寫到哪裡？」記 SIS_NYE_PLAN_Q；2029-01-31（三）21:00「明天二月了。」「計畫本，二月那一頁還是空的。」＋兩個選項',pq===true&&!!nye&&J(F8.map(m=>m.text))===J(['明天二月了。','計畫本，二月那一頁還是空的。'])&&J(askOpts('sisb13_feb_ask'))===J(['明天一起排。','妳先排，我配合。'])&&CALENDAR.dateOf(a8).wd===3,J(F8));
  answer('sisb13_feb_ask',1); ph(); const q8=OUT.get(H.G,'sisb13_feb');
  check('12. 8「妳先排，我配合。」→「……不要。說好一起排的。Café，下午三點。」；排 2/1 15:00 兩點半 Café',txt('p:'+ID).slice(-1)[0]==='……不要。說好一起排的。Café，下午三點。'&&!!q8&&q8.day===d8&&q8.h===15,J(q8));
  at(d8,14.8); await goOut('sisb13_feb'); check('12. 8 演：兩句旁白、「……這格我先寫了。」；SIS_FEB_PLAN',seq(['（她把計畫本攤開在二月那一頁。你們一格一格填。）','（填到週日那一格，她先寫了你的名字，看了一下，又在後面加了一個「（全天）」。）','……這格我先寫了。'])&&H.G.flags.SIS_FEB_PLAN===true,J(said()));
  fresh(a8,20,'dating',{SIS_NYE_PLAN_Q:true}); phAt(a8,21.1); answer('sisb13_feb_ask',0); check('12. 8「明天一起排。」→「好。Café，下午三點。帶筆。」',txt('p:'+ID).slice(-1)[0]==='好。Café，下午三點。帶筆。');
  fresh(a8,20,'friend',{SIS_NYE_PLAN_Q:true}); phAt(a8,21.1); const f1=byTag('sisb13_feb_ask').length; fresh(a8,20,'dating'); phAt(a8,21.1); const f2=byTag('sisb13_feb_ask').length;
  check('12. 8 沒在交往、沒選過「寫到哪裡？」：沒有',f1===0&&f2===0);
  /* 9 每週視訊 g3、g2 的下一次開頭 */
  await vid('2028-10-01',{},[0],2); const g3a=has('那星期二一起吃。你那邊早上，我這邊晚上。'), st3=H.G.flags.SIS13_G3_DAY; const F0=Object.assign({},H.G.flags);
  check('12. 9 g3「我這邊也還沒吃。」：記那一天（SIS13_G3_DAY）',g3a&&st3===D('2028-10-01'),J(st3));
  { fresh('2028-10-08',10,'dating',{SIS13_G3_DAY:st3}); const q={id:'y4_sa_g_n',ev:'ev_sis_video_gf',day:D('2028-10-08'),h:10,late:1,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,sa:{k:9,gset:6}}; OUT.rec(H.G).push(Object.assign({state:'planned',ask:null},q)); await goOut('y4_sa_g_n');
    check('12. 9 下一次視訊開頭：「（她把另一半月餅拿到鏡頭前。）」「說好的。……你的呢？」；只一次',J(said().slice(0,2))===J(['（她把另一半月餅拿到鏡頭前。）','說好的。……你的呢？'])&&H.G.flags.SIS13_G3_SAID===true&&!X().g3Due(H.G),J(said())); }
  await vid('2028-09-03',{},[0],1); const st2=H.G.flags.SIS13_G2_DAY;
  { fresh('2028-09-10',10,'dating',{SIS13_G2_DAY:st2}); const q={id:'y4_sa_g_m',ev:'ev_sis_video_gf',day:D('2028-09-10'),h:10,late:1,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,sa:{k:5,gset:6}}; OUT.rec(H.G).push(Object.assign({state:'planned',ask:null},q)); await goOut('y4_sa_g_m');
    check('12. 9 g2「那是好問題的意思嗎？」→ 下一次視訊開頭「我又舉手了。……教授說「下課來找我」。」「我去了。聊了半小時。……原來那真的是好問題。」',st2===D('2028-09-03')&&J(said().slice(0,2))===J(['我又舉手了。……教授說「下課來找我」。','我去了。聊了半小時。……原來那真的是好問題。'])&&H.G.flags.SIS13_G2_SAID===true,J(said())); }
  await vid('2028-09-03',{},[1],1); check('12. 9 g2 選「妳問了什麼？」：不記',H.G.flags.SIS13_G2_DAY==null&&has('臺灣的法律扶助要等多久。他們那邊等更久。')); });

/* ---- 13 第 5 節 伴手禮 ---- */
await sec(13,async()=>{ const a=D('2029-01-03'), d=D('2029-01-06'), m7=D('2029-01-07');
  const back=(kind,fl,route)=>{ fresh(a,20,kind,Object.assign({US_ARRIVED:true,US_RETURNED:D('2028-12-23'),CAME_BACK_TOGETHER:true},fl||{}),{route:route||'US'}); };
  check('13. 日子：1/3 週三、1/6 週六、1/7 週日',CALENDAR.dateOf(a).wd===3&&CALENDAR.dateOf(d).wd===6&&CALENDAR.dateOf(m7).wd===7);
  back('dating'); phAt(a,20.9); const n0=byTag('sisb13_gift_ask').length; phAt(a,21.1); const M=byTag('sisb13_gift_ask');
  check('13. 美國路線、一起回來、交往中：1/3 21:00「禮拜六中午，阿姨在家嗎。」「伴手禮一直放在我桌上。」＋兩個回覆鍵（開到 1/6 10:00）',n0===0&&J(M.map(m=>m.text))===J(['禮拜六中午，阿姨在家嗎。','伴手禮一直放在我桌上。'])&&J(askOpts('sisb13_gift_ask'))===J(['在。來吃中飯。','在。妳人來就好。'])&&M[1].ask.until===T(d,10),J(M));
  answer('sisb13_gift_ask',1); ph(); const q=OUT.get(H.G,'sisb13_gift');
  check('13.「在。妳人來就好。」→「東西已經買了。……十一點半。」；排 1/6 11:30「家裡的中飯」',txt('p:'+ID).slice(-1)[0]==='東西已經買了。……十一點半。'&&!!q&&q.day===d&&q.h===11.5&&q.ev==='ev_sis13_gift',J(q));
  at(d,11); await goOut('sisb13_gift',[2]);
  check('13. 演（臺北家裡 home_living_day）：玄關、「阿姨好。」、果醬、媽媽「奶油？」…「書瑀，他在美國有沒有好好吃飯？」「有。……我煮的。」…「今年夏天。……論文寫完的話。」；（夾一塊排骨給她）→ 旁白；一點半玄關、橘子；SIS13_GIFT',
    seq(['（十一點半。門鈴響的時候，媽媽已經站在玄關了。爸爸和你姊都出門了，媽媽說這樣比較不會嚇到人。）','阿姨好。','（她把一個紙袋遞過去。裡面是一罐果醬，標籤是手寫的英文。）','那邊市集買的。蘋果奶油。','奶油？','裡面沒有奶油。只是叫這個名字。……塗吐司。','好，明天早上就吃。','（中飯是媽媽一早去市場買的。桌上的菜，三個人吃不完。）','書瑀，他在美國有沒有好好吃飯？','有。……我煮的。','（媽媽看了你一眼。你低頭吃飯。）','那妳研究所呢？什麼時候畢業？','今年夏天。……論文寫完的話。','（她看著碗裡多出來的那塊排骨，沒說什麼，吃掉了。媽媽又夾了一塊給她。）','（一點半。她在玄關穿鞋。）','下次來吃飯就好，不用帶東西。','……好。','（走的時候，她手上的紙袋換成了媽媽裝的一袋橘子。）'])
    &&J(H.opts[0])===J(['「她寫得很快。」','「媽，妳不要一直問。」','（夾一塊排骨給她）'])&&H.said.find(x=>x.t==='奶油？').who==='媽媽'&&H.said.find(x=>x.t==='阿姨好。').who===SOCIAL.displayName(ID)&&H.G.flags.SIS13_GIFT===true,J(said()));
  phAt(d,20.9); const k0=byTag('sisb13_gift_night').length; phAt(d,21.1); const N=byTag('sisb13_gift_night');
  check('13. 當晚 21:00「橘子很甜。」「今天其實很緊張。」＋「看不出來。」「我媽很喜歡妳。」',k0===0&&J(N.map(m=>m.text))===J(['橘子很甜。','今天其實很緊張。'])&&J(askOpts('sisb13_gift_night'))===J(['看不出來。','我媽很喜歡妳。']),J(N));
  answer('sisb13_gift_night',1); check('13.「我媽很喜歡妳。」→「……橘子也是這樣說的。」',txt('p:'+ID).slice(-1)[0]==='……橘子也是這樣說的。');
  phAt(m7,7.9); const j0=byTag('sisb13_gift_mom').length; phAt(m7,8.1); const MM=byTag('sisb13_gift_mom');
  check('13. 1/7（日）08:00 媽媽（p:mom，不加句號）三則＋「好」「（愛心貼圖）」',j0===0&&J(MM.map(m=>m.text))===J(['（照片：一片吐司，塗了一層咖啡色的醬）','真的沒有奶油','很好吃 跟書瑀說謝謝'])&&MM.every(m=>m.th==='p:mom'&&m.from==='mom')&&J(askOpts('sisb13_gift_mom'))===J(['好','（愛心貼圖）']),J(MM));
  back('dating'); phAt(a,21.1); answer('sisb13_gift_ask',0); ph(); at(d,11); await goOut('sisb13_gift',[0]); check('13.「在。來吃中飯。」→「好。十一點半。」；「她寫得很快。」→「……第四章還沒寫完。」「那就是快寫完了。」',seq(['……第四章還沒寫完。','那就是快寫完了。'])&&txt('p:'+ID).includes('好。十一點半。'));
  back('dating'); phAt(a,21.1); answer('sisb13_gift_ask',0); ph(); at(d,11); await goOut('sisb13_gift',[1]); check('13.「媽，妳不要一直問。」→ 媽媽「問一下而已。」「沒關係。阿姨問的，我都答得出來。」',seq(['問一下而已。','沒關係。阿姨問的，我都答得出來。']));
  back('dating'); phAt(a,21.1); phAt(d,12); phAt(d,21.5); phAt(m7,9);
  check('13. 沒回：不演、沒有當晚和 1/7 那兩則（伴手禮那一句留著）',!OUT.get(H.G,'sisb13_gift')&&!byTag('sisb13_gift_night').length&&!byTag('sisb13_gift_mom').length&&!H.G.flags.SIS13_GIFT);
  const no=[]; back('dating',{},'TW'); phAt(a,21.1); if(byTag('sisb13_gift_ask').length) no.push('臺灣路線'); back('dating',{},'JP'); phAt(a,21.1); if(byTag('sisb13_gift_ask').length) no.push('日本路線');
  back('ex'); phAt(a,21.1); if(byTag('sisb13_gift_ask').length) no.push('挽回不成（不在交往）'); back('dating',{CAME_BACK_TOGETHER:false}); phAt(a,21.1); if(byTag('sisb13_gift_ask').length) no.push('沒有 CAME_BACK_TOGETHER');
  check('13. 臺灣、日本路線、挽回不成、沒有一起回來：沒有 1/3 那則',!no.length,J(no));
  back('dating'); phAt(a,21.1); answer('sisb13_gift_ask',0); ph(); ROM.end(H.G,ID,'test'); phAt(D('2029-01-05'),12); const qc=OUT.get(H.G,'sisb13_gift');
  check('13. 回了以後 1/6 以前不在交往：取消（cancelled），不演',!!qc&&qc.state==='cancelled',J(qc)); });

/* ---- 14 第 6 節 ---- */
await sec(14,async()=>{
  const jv=async(set,picks,fl)=>{ fresh('2028-06-18',22,'dating',Object.assign({SIS_JP_NOTE_GF:true},fl||{}),{route:'JP'}); H.G.flags.JP_DEPARTED=D('2028-03-25'); SISJP.vSet=SISJP.vSet||(()=>0); const v0=SISJP.vSet; SISJP.vSet=()=>set; try{ await runEv('ev_sis_jp_video',picks); } finally { SISJP.vSet=v0; } return H.G.flags; };
  let F=await jv(2,[0]); const c1=F.SIS_JP_COAT; F=await jv(2,[0],{SIS_JP_NOTE_GF:false}); const c2=F.SIS_JP_COAT; F=await jv(2,[1]); const c3=F.SIS_JP_COAT;
  check('14. 6-1 J3「咬了一口外套。」＋交往版便條＝記 SIS_JP_COAT；沒有便條（「外套還好嗎。」那一支）、「沒有，牠們很乖。」不記',c1===true&&!c2&&!c3,J([c1,c2,c3]));
  F=await jv(3,[0]); const f1=F.SIS_JP_FIRST; F=await jv(3,[1]); const f2=F.SIS_JP_FIRST;
  check('14. 6-1 J4「麵店。」＝SIS_JP_FIRST noodle、「妳決定。」＝secret（「好。第一天就去。」「那我十二月再告訴你。……先保密。」照舊）',f1==='noodle'&&f2==='secret',J([f1,f2]));
  const pick=async(v,fl,picks)=>{ fresh('2028-12-23',20.5,v==='lover'?'dating':'friend',Object.assign({SIS_PICKUP_V:v},fl||{}),{route:'JP'}); await runEv('ev_sis_pickup',picks); };
  await pick('lover',{SIS_JP_COAT:true,SIS_JP_FIRST:'noodle'},[2]);
  check('14. 6-1 戀人版＋SIS_JP_COAT：「（很久，她才放開。）」後面、車上前面 (a) 四句；SIS_JP_FIRST noodle：第三個選項換成「麵店？說好的。」→「……對。第一天。」兩句旁白（阿姨、滷肉飯）',
    seq(['（很久，她才放開。）','（你穿的是三月她塞進你背包的那件外套。）','（她退開一步，拉起你的袖口，翻過來看。）','……鹿咬的是這裡。','（袖口內側，一排很淡的齒痕。你自己都忘了是哪一邊。）','美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。','……對。第一天。','（你們開回公館。麵店的鐵門拉下一半，阿姨看到你，又把門拉上去。）','（阿姨端了兩碗麵，又多放一碗滷肉飯在她面前。她先吃滷肉飯。）'])
    &&J(H.opts[H.opts.length-1])===J(['「下交流道找一家。」','「先回家睡覺。」','「麵店？說好的。」'])&&!has('……七月說要保密的，就是這個。')&&!has('對。就那家。'),J({s:said(),o:H.opts}));
  await pick('lover',{SIS_JP_FIRST:'secret'},[2]);
  check('14. 6-1 secret：「我想吃滷肉飯。現在。」後面「……七月說要保密的，就是這個。」；選項照舊「公館那家？」；沒有 SIS_JP_COAT＝沒有 (a)',idx('……七月說要保密的，就是這個。')===idx('我想吃滷肉飯。現在。')+1&&J(H.opts[H.opts.length-1])===J(['「下交流道找一家。」','「先回家睡覺。」','「公館那家？」'])&&has('對。就那家。')&&!has('……鹿咬的是這裡。'),J({s:said(),o:H.opts}));
  await pick('two',{SIS_JP_COAT:true,SIS_JP_FIRST:'noodle'},[2]);
  check('14. 6-1 兩個人版（不是戀人版）：都不加',!has('……鹿咬的是這裡。')&&!has('（你穿的是三月她塞進你背包的那件外套。）')&&J(H.opts[H.opts.length-1])===J(['「下交流道找一家。」','「先回家睡覺。」','「公館那家？」']),J(H.opts));
  await pick('lover',{},[1]); check('14. 6-1 臺灣路線、沒有旗標的戀人版：照舊（沒有新句子）',!said().some(t=>/鹿咬|七月說要保密|麵店？說好的|阿姨端了兩碗麵/.test(t))&&has('……還有，我想你。'));
  /* 6-2、6-3 */
  const yes=CONFESS_LINES.heroine_05.yes, rs=SISB4.restartYes; let a1, a2; SISB4.restartYes=()=>true; try{ a1=yes({flags:{}}); } finally { SISB4.restartYes=()=>false; } try{ a2=yes({flags:{}}); } finally { SISB4.restartYes=rs; }
  check('14. 6-2 重新開始那一次（restartYes）：「你做到了。」「……我也想好了。」「其他的，想了很久。……沒有了。」「這次，我選你。」；第一次答應照舊',J(a1)===J(['你做到了。','……我也想好了。','其他的，想了很久。……沒有了。','這次，我選你。'])&&J(a2)===J(['……我知道。','其實我也是。考試那時候就有一點了，只是那時候不想想這個。','好。']),J([a1,a2]));
  const tc=ev('ev_sis_three_conditions'); fresh('2028-04-12',10,'friend'); await runEv('ev_sis_three_conditions',[0]);
  check('14. 6-3 4-1：「還有，我要時間。等到我說好的那天。」（舊句不出現）',has('還有，我要時間。等到我說好的那天。')&&!has('還有，我要時間。不是一週，是我說好的那天。')&&!!tc,J(said())); });

/* ---- 15 舊存檔 ---- */
await sec(15,async()=>{ const errs=[]; const ow=console.warn; console.warn=(...a)=>{ if(/SISB13/.test(String(a[0]))) errs.push(a.map(String).join(' ')); };
  try{ for(const key of ['2026-09-17','2027-03-08','2027-05-06','2027-12-06','2028-06-02','2028-09-11','2028-10-10','2028-12-26','2029-01-03','2029-01-31','2029-05-08','2029-07-15']){ const G=fresh(key,21,'friend'); delete G.outings; delete G.phone; G.msgs=[]; ph(); for(const id of ['ev_sis13_walk','ev_sis13_cake','ev_sis13_laundry','ev_sis13_pool','ev_sis13_lab_eve']) EVENTS.check(ev(id)); } } finally { console.warn=ow; }
  check('15. 舊存檔（沒有 outings、phone、新旗標）：照常跑、不丟例外',!!X()&&!errs.length,J(errs)); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
