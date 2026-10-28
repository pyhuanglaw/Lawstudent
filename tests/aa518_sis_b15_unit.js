// AA_518 學姊第十五批：學校裡的平常日子（企劃線 973dd1b74，AA-C 2026-10-28；任務 SIS-B15-1028、SIS-LEAD-1021、D111、USER_WANTS C25）——不需要瀏覽器。
// 台詞逐字對稿（git show 973dd1b74：第 1～3 節的「>」、選項、→ 同一行的回覆、說明裡的「」；第 4 節表「改成」那一欄；兩個方向）。
// 四種玩家：A 交往中、B 朋友以上（朋友）、C 認識、有點熟（熟悉）、D 沒見過（沒有 met_sis／SIS_W1／FIRST_MET）。
//   0  讀稿、新檔載得到、index.html 順序、白名單；稿 → 遊戲（每一句、每個選項、說明裡的「」）、遊戲 → 稿（新檔每一句＋改字）；第 4 節換掉的舊句不在遊戲裡
//   1  第 1 節九場：事件（地點、時段、走近她、一次）、那一天她的作息在那裡（交往中週三晚上讓給法圖）、C 走近演（逐字、兩個選項）、A 多的那一句、D／別的日子／前任以外照稿、
//      1-8 要走進討論室、1-9「我幫妳。」記 SIS15_BOOKS3、房間多一個物件、時間往前一小時
//   2  第 2 節：週四 19～21 法圖討論室（21～22 Café；9/16～7/13；Café 還有她沒演的戲那一晚照舊）、白板三句輪流（一天一次、認識以上、要走進討論室）、
//      四次：前一天 21:00 家族群組 Kevin 揪＋「去。」→ 19:00 出遊、逐字、SIS15_STUDY_n、D 也能來（記 met_sis）、沒在群組 FAMILIAR 以上私訊「明天讀書會。」、人在日本沒有「去。」；2-3 Kevin 九點那一則；2-1 法律內容
//   3  第 3 節十件（逐件）
//   4  第 4 節十五處（逐處）
//   5  BB 測試六項
//   6  舊存檔：沒有新旗標照常跑、不丟例外；不撞（日子的星期）
// 修改前（開發分支 64e12da0e：git archive 那一版的 index.html、src/、tests/、lib/、tools/ 放進這支測試真的跑過，白名單用新的，稿從這個 repo 讀：AA518_DOCREPO）：FAILED 30、PASS 9
//   （PASS＝讀稿、白名單、1-1 作息（她本來就在總圖）、3-1 日子、6/3 13:00 那則照舊、沒回不排、BB 六項讀得到、新的一局沒有 SIS15_ 旗標、不撞；
//    第 1～4 節找不到新事件、SISB15／FEED.WENT.sisS4Lx 不存在＝丟例外中斷）。修改後 ALL PASS（174 項）。
// 用法：node tests/aa518_sis_b15_unit.js（在沒有 .git 的目錄跑，設環境變數 AA518_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa516_sis_b14_unit.js：pg_harness 已經載過的不再載；畫 3D 的幾支在 Node 載不進來，跳過）*/
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
const X=()=>typeof SISB15!=='undefined'?SISB15:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(D(d)).wd;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null, evDone=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const wait=()=>new Promise(r=>setTimeout(r,0));
/* 存檔：kind＝'none'（D 沒見過）／'fam'（C 有點熟＝熟悉）／'friend'（B 朋友）／'dating'（A 交往中）／'ex'（前任）*/
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(typeof key==='number'?keyOf(key):key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
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
const tickOnly=async(id,picks)=>{ const keep=STORY_EVENTS.slice(), e=ev(id); STORY_EVENTS.length=0; if(e) STORY_EVENTS.push(e); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); let r=false;
  try{ r=!!EVENTS.tick(0.5); for(let i=0;i<50&&EVENTS.running;i++) await wait(); } finally { STORY_EVENTS.length=0; for(const x of keep) STORY_EVENTS.push(x); } return r; };
const place=(x,z,lv)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=lv|0; };
const her=(x,z,lv)=>{ GM.npc[ID]={obj:{position:{x,y:0,z}},lv:lv|0}; };   /* 她在 3D 裡（EVENTS.npcOf）*/
const zoneOf=G=>{ const s=STORY.schedEnt(CHARACTERS[ID],G||H.G); return s?s.zone+(s.room?'/'+s.room:''):null; };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const LL=()=>typeof LAWLIB_LAYOUT!=='undefined'?LAWLIB_LAYOUT:null;
const inDiscA=()=>{ place(-5.4,-5.4); her(-4.6,-6.0); };   /* 走進法圖討論室 A（北側那一排房間）、她坐在裡面 */

/* ---------- 讀稿 ---------- */
const SHA='973dd1b74', DOCF='docs/story_planning/AA_518_學姊第十五批_學校裡的平常日子.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA518_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+1):-1; return S.slice(i,j<0?S.length:j); };
const S1=part('## 1. 寒暑假補九場','## 2. '), S2=part('## 2. 家族讀書會','## 3. '), S3=part('## 3. 說了沒發生的','## 4. '), S4=part('## 4. 前後對不上的','## 5. '), S5=part('## 5. 給 LAWWW、BB',null);
const BODY=S1+'\n'+S2+'\n'+S3;
const qtext=s=>/^（/.test(s)?s:s.slice(s.indexOf('：')+1);   /* 「> 學姊：…」→ 那一句；「> （…）」→ 旁白整句 */
const QUOTES=BODY.split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>qtext(m[1].trim()));
const OPTRE=/^\s*- (「[^」]+」|（[^）]+）)→(.*)$/;
const inl=s=>[...String(s).matchAll(/「([^」]+)」/g)].map(x=>x[1]);   /* 同一行 → 右邊的「…」*/
const OPTS=[], INLR=[]; for(const l of BODY.split('\n')){ const m=OPTRE.exec(l); if(!m) continue; OPTS.push(m[1]); INLR.push(...inl(m[2])); }
const unq=t=>String(t).replace(/^「|」$/g,'');
/* 一段：pre＝選項前的句子、opts＝[{o,r}]（r：縮排在那個選項下面的「>」）、post＝選項後回到頂格的句子 */
const blk=t=>{ const out={pre:[],opts:[],post:[]}; let cur=null, ci=-1;
  for(const raw of String(t).split('\n')){ const ind=raw.length-raw.trimStart().length, l=raw.trim(); let m=OPTRE.exec(raw);
    if(m){ cur={o:m[1],r:inl(m[2])}; ci=ind; out.opts.push(cur); continue; }
    m=/^>\s*(.+)$/.exec(l); if(!m){ if(/^- /.test(l)&&cur&&ind<=ci) cur=null; continue; }
    const s=qtext(m[1].trim()); if(cur&&ind>ci) cur.r.push(s); else if(out.opts.length){ cur=null; out.post.push(s); } else out.pre.push(s); }
  return out; };
/* 第 4 節的表：| 4-x | 哪裡 | 現在 | 改成 | */
const ROW={}; for(const l of S4.split('\n')){ const c=l.split('|').map(x=>x.trim()); if(/^4-\d+$/.test(c[1]||'')) ROW[c[1]]={where:c[2],now:c[3],to:c[4],toQ:inl(c[4])}; }
/* 遊戲這一批的字：新檔（SISB15_LINES、SISB15_EVENTS）＋改在現有檔的字 */
const strDeep=(v,out)=>{ if(v==null) return out; if(typeof v==='string'){ out.push(v); return out; } if(Array.isArray(v)){ v.forEach(x=>strDeep(x,out)); return out; } if(typeof v==='object') for(const k in v) strDeep(v[k],out); return out; };
const LINE_KEYS=new Set(['k','s','noodle','avenue','plan']);   /* SISB15_LINES 裡不是台詞的字（[誰,字] 的「誰」、照片的鍵）*/
const evTexts=L=>{ const A=[]; for(const l of (L||[])){ if(typeof l.text==='string') A.push(l.text); if(l.choice) for(const c of l.choice) A.push(c.text); } return A; };
const ladStep=(term,id)=>{ const L=LADDER&&LADDER.byTerm&&LADDER.byTerm[term]&&LADDER.byTerm[term][ID]; return L&&L.steps?L.steps.find(s=>s.id===id)||null:null; };
const resolveL=(arr,G)=>(arr||[]).map(x=>typeof x==='function'?x(G):x).filter(x=>x!=null);
const mine=()=>{ const A=[]; if(typeof SISB15_LINES!=='undefined') strDeep(SISB15_LINES,[]).filter(t=>!LINE_KEYS.has(t)).forEach(t=>A.push(t));
  if(typeof SISB15_EVENTS!=='undefined') for(const e of SISB15_EVENTS) A.push(...evTexts(e.dialogue));
  return A; };
/* 改在現有檔的字（第 3 節第 8 點、第 4 節）*/
const changed=()=>{ const A=[], G0={flags:{SIS15_YOUPAY:true,dating_heroine_05:true}}; const TL=typeof TERMEND_LINES!=='undefined'?TERMEND_LINES:null;
  if(TL){ for(const x of resolveL(TL.GF.heroine_05.lastByTerm&&TL.GF.heroine_05.lastByTerm.Y2S1,G0)) A.push(typeof x==='string'?x:x.narr);
    A.push(TL.POOL.Y1S2.heroine_05[1],TL.POOL.Y2S1.heroine_05[1]); for(const x of resolveL(TL.POOL.Y3S1.heroine_05,G0)) A.push(x); }
  const s7=ladStep('Y2S2','S4-L7'), s8=ladStep('Y2S2','S4-L8'); if(s7) A.push(s7.lines[0]); if(s8&&s8.linesIf&&s8.linesIf[0]) A.push(...s8.linesIf[0].lines);
  if(typeof FEED!=='undefined'){ const p=FEED.post('sis4d'); if(p&&p.dm&&typeof p.dm[1]==='object') A.push(p.dm[1].yes); const f=FEED.post('sis4f'), e=FEED.post('sis2e'); if(f) A.push(f.cm[1]); if(e) A.push(e.cm[1]); }
  return A.filter(t=>typeof t==='string'&&t.length); };

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{ const a=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_518 '+SHA+'：第 1 節九場、第 2 節 2-1～2-4、第 3 節十件、第 4 節表十五列、第 5 節）',DOC.length>8000&&S1.indexOf('### 1-9')>0&&S2.indexOf('### 2-4')>0&&/\n10\. \*\*/.test(S3)&&Object.keys(ROW).length===15&&S5.indexOf('**測試（BB）**')>0,J({len:DOC.length,rows:Object.keys(ROW)}));
  { const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_518_/.test(e.path));
    check('0. 劇情匯入白名單有 AA_518（sha '+SHA+'、approved、AA-C 定稿、任務 SIS-B15-1028）；這支測試對同一版的稿',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='SIS-B15-1028'&&/AA-C 定稿/.test(A[0].approvedBy||''),J(A.map(e=>({sha:e.sha,status:e.status,task:e.task})))); }
  check('0. 新檔載得到（SISB15、SISB15_LINES、SISB15_EVENTS）；全部的檔載入沒有錯誤',!loadErr.length&&!!X()&&typeof SISB15_LINES!=='undefined'&&Array.isArray(typeof SISB15_EVENTS!=='undefined'?SISB15_EVENTS:null),J(loadErr));
  check('0. index.html：sis_b14_3d.js → data/sis_b15_events.js → sis_b15_3d.js；在 GAME.boot() 前面',
    /src\/sis_b14_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b15_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b15_3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/sis_b15_3d.js')<a('<script>GAME.boot();</script>'));
  const G0=mine().concat(changed()), GS=new Set(G0.concat(G0.map(unq)));
  /* 稿 → 遊戲 */
  const lostQ=QUOTES.filter(t=>!GS.has(t)&&!(t==='學姊今天遲到十分鐘 我拍下來了'&&typeof SISB15_LINES!=='undefined'&&SISB15_LINES.late===t)), lostO=OPTS.filter(o=>!GS.has(o)&&!GS.has(unq(o))), lostR=INLR.filter(t=>!GS.has(t)&&!/^（/.test(t));
  check('0. 稿 → 遊戲：第 1～3 節每一句「>」（'+QUOTES.length+' 句）都在遊戲裡',QUOTES.length===98&&!lostQ.length,J({n:QUOTES.length,lostQ}));
  check('0. 稿 → 遊戲：每個選項（'+OPTS.length+' 個）、→ 同一行的回覆（'+INLR.length+' 句）都在遊戲裡',OPTS.length===35&&INLR.length===7&&!lostO.length&&!lostR.length,J({o:OPTS.length,r:INLR.length,lostO,lostR}));
  const INLINE=['今天的題目在白板上。','坐。題目自己看。','佳穎，你先講。……好，換人。','明天讀書會。','去。','禮拜六畢業典禮 霖澤館門口拍照 家族都來','（傳一張照片給她）','坐。還有十分鐘。','你沒去過吧。','學姊的三本書（每一本都畫了線）'];   /* 稿寫在說明句裡的（「」括起來）*/
  check('0. 稿寫在說明裡的句子（白板三句、私訊、回「去。」、Kevin 6/1 那一則、照片的選項、A 多的兩句、房間物件）都在稿裡、也在遊戲裡',INLINE.every(t=>DOC.indexOf('「'+t+'」')>=0&&GS.has(t)),J(INLINE.filter(t=>!(DOC.indexOf('「'+t+'」')>=0&&GS.has(t)))));
  /* 遊戲 → 稿（說明：①studyAsk 是 AA_470 12-4 Kevin 那一句（稿沒寫揪的字，子代理解讀），對 SISB12_LINES；②「旁白：」那一句遊戲只放括號裡的字；③11/12 那一次椰林大道＝兩段照稿接起來）*/
  const notIn=[...new Set(G0)].filter(t=>DOC.indexOf(t)<0&&DOC.indexOf(unq(t))<0);
  const okExtra={'每週四晚上七點 法圖討論室 學姊帶':typeof SISB12_LINES!=='undefined'&&(SISB12_LINES.studyAsk||[]).some(x=>x[1]==='每週四晚上七點 法圖討論室 學姊帶'),
    '（你講了二十分鐘，她都在聽，沒有打斷。）':DOC.indexOf('（旁白：你講了二十分鐘，她都在聽，沒有打斷。）')>=0};
  const bad=notIn.filter(t=>!okExtra[t]);
  check('0. 遊戲 → 稿：新檔的每一句、改字（'+new Set(G0).size+' 句）都在稿裡（一字不差；揪的那一句是 AA_470 12-4 Kevin 的原句、「旁白：」只取括號裡的字）',G0.length>=110&&!bad.length&&Object.keys(okExtra).every(k=>okExtra[k]),J({bad,okExtra}));
  const P=(typeof SISB15_LINES!=='undefined'&&SISB15_LINES.photos)||[], av=P.find(p=>p.k==='avenue');
  check('0. 11/12 那一次椰林大道：「葉子還是綠的吧。」＋稿 11/12 那一句「這邊已經沒有葉子了。」（兩段都在稿裡）',!!av&&J(av.r11)===J(['葉子還是綠的吧。','這邊已經沒有葉子了。'])&&DOC.indexOf('「葉子還是綠的吧。這邊已經黃了。」')>=0&&DOC.indexOf('（11/12 那一次：「這邊已經沒有葉子了。」）')>=0);
  /* 第 4 節換掉的舊句不在遊戲裡 */
  const OLD=['他說兩匙剛好。','每個月加一趟。','下禮拜畢業。……之後還是在這裡讀書，只是換一張學生證。','暑假我在法圖。','寒假我在法圖。','論文的題目定了。','明年夏天，我申請了美國的交換。還在等結果。','搬家以後，我從家裡到法學院要多坐四站。','期末考完了嗎？我在等美國那邊的結果。……吃飯的時候不要問。'];
  const srcAll=['src/data/feed_y3s1.js','src/data/feed_y3s2.js','src/data/sis_y2y3_events.js','src/data/termend_lines.js','src/data/ladder.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,'')).join('\n');
  const still=OLD.filter(t=>srcAll.indexOf("'"+t+"'")>=0||srcAll.indexOf('"'+t+'"')>=0);
  check('0. 第 4 節換掉的舊句（4-2、4-4～4-8、4-10）不在遊戲裡（註解除外）',!still.length,J(still)); });

/* ---- 1 第 1 節 寒暑假補九場 ---- */
const Y1=[ {id:'ev_sis15_flask',n:'1-1',day:'2026-01-14',h:14.5,zone:'library',time:[14,17],wd:3},{id:'ev_sis15_novel',n:'1-2',day:'2026-03-04',h:19.5,zone:'lawlib',time:[19,21],wd:3},
  {id:'ev_sis15_swim',n:'1-3',day:'2026-08-31',h:8.8,zone:'campus',time:[8.75,9],wd:1,pos:[83,3],r:4},{id:'ev_sis15_chishang',n:'1-4',day:'2027-01-27',h:14.5,zone:'library',time:[14,17],wd:3},
  {id:'ev_sis15_move',n:'1-5',day:'2027-02-24',h:19.5,zone:'lawlib',time:[19,21],wd:3},{id:'ev_sis15_ch1',n:'1-6',day:'2027-07-07',h:19.5,zone:'lawlib',time:[19,21],wd:3},
  {id:'ev_sis15_drill',n:'1-7',day:'2027-08-25',h:19.5,zone:'lawlib',time:[19,21],wd:3},{id:'ev_sis15_interview',n:'1-8',day:'2028-01-19',h:19.5,zone:'lawlib',time:[19,21],wd:3,disc:true},
  {id:'ev_sis15_lab_clear',n:'1-9',day:'2028-06-28',h:19.5,zone:'linze_5f',time:[19,21],wd:3} ];
await sec(1,async()=>{
  for(const s of Y1){ const e=ev(s.id), b=blk(part('### '+s.n,s.n==='1-9'?'## 2. ':'### '+s.n.replace(/\d+$/,x=>+x+1),S1));
    check('1. '+s.n+' 事件：'+s.zone+'、自動觸發、'+s.time.join('～')+'、走近她（near 她）、一次；那一天是星期'+s.wd,!!e&&e.trigger==='auto'&&e.location===s.zone&&J(e.time)===J(s.time)&&e.near&&e.near.npc===ID&&e.once===true&&wdOf(s.day)===s.wd,J(e&&{loc:e.location,t:e.time,near:e.near}));
    /* 她那一天、那個時段在那裡（C、B、A）*/
    const zs=['fam','friend','dating'].map(k=>{ fresh(s.day,s.h,k); return zoneOf(); });
    check('1. '+s.n+' 作息：'+s.day+' '+s.h+' 她在 '+s.zone+(s.disc?'（討論室 A）':'')+'（C、B、A 都一樣；交往中週三晚上不在研究室）',zs.every(z=>z===s.zone+(s.disc?'/discA':'')),J(zs));
    /* C（有點熟）走近她：演；逐字 */
    fresh(s.day,s.h,'fam',{},{zone:s.zone}); if(s.disc) inDiscA(); else { const p=s.pos||[0,0]; place(p[0]+1,p[1]); her(p[0],p[1]); }
    const ran=await tickOnly(s.id,[0]);
    check('1. '+s.n+' C（有點熟）那一天走近她：演；選項前的句子照稿（'+b.pre.length+' 句）、兩個選項照稿；記在 events.done（一次）',ran&&J(said().slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&evDone(s.id)&&!EVENTS.check(e),J({s:said(),o:H.opts,want:b}));
    for(let k=0;k<b.opts.length;k++){ fresh(s.day,s.h,'fam',{},{zone:s.zone}); await runEv(s.id,[k]); const w=b.opts[k].r.concat(b.post);
      check('1. '+s.n+' 選項 '+b.opts[k].o+' → '+w.join('／'),seq(w)&&w.every(has),J(said())); }
    const no=[]; for(const [nm,key,hh,kind,o] of [['D 沒見過',s.day,s.h,'none'],['前一天',D(s.day)-1,s.h,'fam'],['隔天',D(s.day)+1,s.h,'fam'],['時段以前',s.day,s.time[0]-0.1,'fam'],['時段以後',s.day,s.time[1],'fam'],['不在那一區',s.day,s.h,'fam',{zone:s.zone==='campus'?'dorm':'campus'}]]){
      fresh(key,hh,kind,{},Object.assign({zone:s.zone},o||{})); if(s.disc) inDiscA(); if(EVENTS.check(e)) no.push(nm); }
    check('1. '+s.n+' D（沒見過）、別的日子、時段外、不在那一區：不演',!no.length,J(no)); }
  /* 1-3、1-4：A 多一句 */
  { fresh('2026-08-31',8.8,'dating',{},{zone:'campus'}); await runEv('ev_sis15_swim',[1]);
    check('1. 1-3 A（交往中）：第一句後面多「（她把游泳包往旁邊挪，讓你坐）」「坐。還有十分鐘。」（稿沒寫位置：放在「游完了，等開門。」後面，子代理解讀）',seq(['游完了，等開門。','（她把游泳包往旁邊挪，讓你坐）','坐。還有十分鐘。','下禮拜開始，我就是碩一了。……感覺跟昨天一樣。','週一到週四。週五起不來。']),J(said()));
    fresh('2026-08-31',8.8,'friend',{},{zone:'campus'}); await runEv('ev_sis15_swim',[0]); check('1. 1-3 B（朋友、沒交往）：沒有 A 那一句',!has('坐。還有十分鐘。')&&!has('（她把游泳包往旁邊挪，讓你坐）'));
    fresh('2027-01-27',14.5,'dating',{},{zone:'library'}); await runEv('ev_sis15_chishang',[0]); check('1. 1-4 A：最後多「你沒去過吧。」',said()[said().length-1]==='你沒去過吧。',J(said()));
    fresh('2027-01-27',14.5,'friend',{},{zone:'library'}); await runEv('ev_sis15_chishang',[1]); check('1. 1-4 B：沒有「你沒去過吧。」',!has('你沒去過吧。')); }
  /* 交往中週三晚上：那三天讓給法圖，其他週三照舊研究室 */
  { const z=[]; for(const k of ['2027-02-24','2027-07-07','2027-08-25','2027-02-17','2027-07-14']){ fresh(k,19.5,'dating'); z.push(zoneOf()); }
    check('1. 交往中：1-5／1-6／1-7 那三個週三晚上她在法圖（SISB13.labYield 包一層）；別的週三照舊在研究室（AA_512）',J(z)===J(['lawlib','lawlib','lawlib','linze_5f','linze_5f']),J(z)); }
  /* 1-8 要走進討論室 */
  { const e=ev('ev_sis15_interview'); fresh('2028-01-19',19.5,'fam',{},{zone:'lawlib'}); place(-5.4,-3.9); her(-4.6,-6.0); const out=EVENTS.check(e); inDiscA(); const inn=EVENTS.check(e);
    check('1. 1-8：在討論室外面（走廊，門口那一排的南邊）不演；走進討論室 A 才演',out===false&&inn===true,J([out,inn])); }
  /* 1-9 三本書 */
  { fresh('2028-06-28',19.5,'friend',{},{zone:'linze_5f'}); const h0=H.G.hour; await runEv('ev_sis15_lab_clear',[0]);
    const R=STORY.roomItemList(H.G), it=R.find(r=>r[0]==='學姊的三本書（每一本都畫了線）');
    check('1. 1-9「我幫妳。」：記 SIS15_BOOKS3、時間往前一小時（你們裝了一個小時）；宿舍房間多一個物件「學姊的三本書（每一本都畫了線）」',H.G.flags.SIS15_BOOKS3===true&&Math.abs(H.G.hour-h0-1)<0.01&&!!it&&J([].concat(it[1]))===J(['（每一本都畫了線）']),J({f:H.G.flags.SIS15_BOOKS3,dh:H.G.hour-h0,it}));
    fresh('2028-06-28',19.5,'friend',{},{zone:'linze_5f'}); await runEv('ev_sis15_lab_clear',[1]);
    check('1. 1-9「這些都要帶去美國？」：不記 SIS15_BOOKS3、房間沒有那三本',!H.G.flags.SIS15_BOOKS3&&!STORY.roomItemList(H.G).some(r=>r[0]==='學姊的三本書（每一本都畫了線）'));
    fresh('2028-06-28',19.3,'fam'); const k=typeof LAB5!=='undefined'?LAB5.canKnock(H.G):null;
    check('1. 1-9：那一晚 4F 刷卡門可以傳訊息給她開門（LAB5.canKnock；有點熟也可以）',k===true,J(k)); } });

/* ---- 2 第 2 節 家族讀書會 ---- */
const STUDY=[{n:1,day:'2027-10-21',head:'### 2-1',next:'### 2-2'},{n:2,day:'2027-12-09',head:'### 2-2',next:'### 2-3'},{n:3,day:'2028-03-16',head:'### 2-3',next:'### 2-4'},{n:4,day:'2028-05-11',head:'### 2-4',next:'## 3.'}];
await sec(2,async()=>{
  /* 作息 */
  { const z=[]; for(const [k,h,kind,o] of [['2027-09-16',19.5,'fam'],['2027-10-21',19.5,'dating'],['2027-10-21',21.5,'friend'],['2028-07-13',20.9,'friend'],['2027-09-09',19.5,'friend'],['2028-07-20',19.5,'friend'],['2028-03-02',19.5,'friend']]){ fresh(k,h,kind,{},o); z.push(zoneOf()); }
    check('2. 作息：大三那一年（9/16～7/13）週四 19:00～21:00 法圖討論室 A、21:00 以後 Café；9/9、7/20 照舊 Café',J(z)===J(['lawlib/discA','lawlib/discA','cafe','lawlib/discA','cafe','cafe','lawlib/discA']),J(z)); }
  { const z=[]; for(const [k,fl,o,done] of [['2028-05-18',{},{}],['2028-05-25',{},{}],['2028-05-25',{SIS_BOOK:'law'},{},'2028-05-18'],['2028-03-23',{},{route:'JP'}],['2028-03-23',{},{}]]){ fresh(k,19.6,'friend',fl,o); if(done){ H.G.events.done.ev_sis_which_book=1; H.G.events.last.ev_sis_which_book=D(done); } z.push(zoneOf()); }
    check('2. 那個週四 Café 還有她的戲（5/18、5/25「帶哪一本」還沒演；日本路線 3/23）＝照舊在 Café；演過了（5/18 演的）5/25 回討論室；臺灣路線 3/23 在討論室',J(z)===J(['cafe','cafe','lawlib/discA','cafe','lawlib/discA']),J(z)); }
  /* 白板三句 */
  { const e=ev('ev_sis15_board'), got=[];
    for(const k of ['2027-09-23','2027-09-30','2027-10-07','2027-10-14']){ fresh(k,19.4,'fam',{SIS15_BOARD_N:got.length},{zone:'lawlib'}); inDiscA(); await tickOnly('ev_sis15_board'); got.push(said().join('')); }
    check('2. 白板：走進討論室 A，她說一句（三句照順序輪流：「今天的題目在白板上。」「坐。題目自己看。」「佳穎，你先講。……好，換人。」，第四次回到第一句）',J(got)===J(['今天的題目在白板上。','坐。題目自己看。','佳穎，你先講。……好，換人。','今天的題目在白板上。'])&&e.trigger==='auto'&&J(e.weekday)===J([4])&&J(e.time)===J([19,21]),J(got));
    fresh('2027-09-23',19.4,'fam',{},{zone:'lawlib'}); inDiscA(); await tickOnly('ev_sis15_board'); const n1=H.G.flags.SIS15_BOARD_N; const again=EVENTS.check(e); at('2027-09-30',19.4); inDiscA(); const nextWeek=EVENTS.check(e);
    check('2. 白板：同一天不再說（一天一次）；下一個週四再說；說了記 SIS15_BOARD_N',n1===1&&again===false&&nextWeek===true,J([n1,again,nextWeek]));
    const no=[]; for(const [nm,k,h,kind,o,pos] of [['D 沒見過','2027-09-23',19.4,'none'],['在討論室外面','2027-09-23',19.4,'fam',{},'out'],['21:00 以後','2027-09-23',21.2,'fam'],['9/9（還沒開始）','2027-09-09',19.4,'fam'],['週三','2027-09-22',19.4,'fam']]){
      fresh(k,h,kind,{},Object.assign({zone:'lawlib'},o||{})); inDiscA(); if(pos==='out') place(-5.4,-3.9); if(EVENTS.check(e)) no.push(nm); }
    check('2. 白板：D（沒見過）、在討論室外面、21:00 以後、9/16 以前、別的星期：沒有',!no.length,J(no)); }
  /* 四次 */
  for(const s of STUDY){ const d=D(s.day), b=blk(part(s.head,s.next,S2)), tag='sisb15_study'+s.n; b.pre=b.pre.filter(t=>t!=='學姊今天遲到十分鐘 我拍下來了');   /* 2-3 Kevin（群組，九點）那一句：家族群組 21:00（下面另外查），不在場景裡 */
    fresh(d-1,20.5,'fam'); phAt(d-1,20.9); const n0=byTag(tag).length; phAt(d-1,21.3); const M=byTag(tag);   /* 21:18 才看：照原本的時間補進去（PHONE.tick 15 分鐘以上）*/
    check('2. 2-'+s.n+' '+s.day+'（星期 '+wdOf(d)+'）前一天 21:00 家族群組 Kevin 揪（「每週四晚上七點 法圖討論室 學姊帶」）、回覆只有「去。」；21:00 以前沒有',wdOf(d)===4&&n0===0&&M.length===1&&M[0].th==='g:family_law'&&M[0].from==='kevin'&&M[0].text==='每週四晚上七點 法圖討論室 學姊帶'&&Math.abs(M[0].h-21)<0.02&&J(askOpts(tag))===J(['去。']),J(M));
    phAt(d,10); check('2. 2-'+s.n+' 沒回「去。」：不排出遊',!OUT.get(H.G,'sisb15_study_'+s.n));
    fresh(d-1,21.2,'fam'); ph(); answer(tag,0); ph(); const q=OUT.get(H.G,'sisb15_study_'+s.n);
    check('2. 2-'+s.n+' 回「去。」→ 排 '+s.day+' 19:00「法圖・討論室」（ev_sis15_study_'+s.n+'，2 小時）',!!q&&q.day===d&&q.h===19&&q.ev==='ev_sis15_study_'+s.n&&q.place==='法圖・討論室'&&q.hours===2,J(q));
    at(d,18.9); await goOut('sisb15_study_'+s.n,[0]);
    check('2. 2-'+s.n+' 演：選項前的句子照稿（'+b.pre.length+' 句）、兩個選項照稿；記 SIS15_STUDY_'+s.n,J(said().slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&H.G.flags['SIS15_STUDY_'+s.n]===true,J({s:said(),o:H.opts,want:b}));
    for(let k=0;k<b.opts.length;k++){ fresh(d-1,21.2,'fam'); ph(); answer(tag,0); ph(); at(d,18.9); await goOut('sisb15_study_'+s.n,[k]); const w=b.opts[k].r.concat(b.post);
      check('2. 2-'+s.n+' 選項 '+b.opts[k].o+' → '+w.join('／'),seq(w),J(said())); }
    /* D 也能來 */
    fresh(d-1,21.2,'none'); ph(); const dOpts=askOpts(tag); answer(tag,0); ph(); at(d,18.9); const m0=SOCIAL.has(ID,'FIRST_MET'); await goOut('sisb15_study_'+s.n,[0]);
    check('2. 2-'+s.n+' D（沒見過）：群組收得到、也能回「去。」；演完記 met_sis、SIS_W1、FIRST_MET（這幾場就是認識她）',J(dOpts)===J(['去。'])&&!m0&&H.G.flags.met_sis===true&&H.G.flags.SIS_W1===true&&SOCIAL.has(ID,'FIRST_MET'),J({dOpts,f:[H.G.flags.met_sis,H.G.flags.SIS_W1]})); }
  /* 沒在家族群組 */
  { const d=D('2027-10-21'); fresh(d-1,21.2,'fam',{},{grp:false}); ph(); const M=byTag('sisb15_study1');
    check('2. 沒在家族群組、和她 FAMILIAR 以上：她私訊「明天讀書會。」（回覆「去。」；子代理解讀）→ 回了一樣排出遊',M.length===1&&M[0].th==='p:'+ID&&M[0].text==='明天讀書會。'&&J(askOpts('sisb15_study1'))===J(['去。'])&&(answer('sisb15_study1',0),ph(),!!OUT.get(H.G,'sisb15_study_1')),J(M));
    fresh(d-1,21.2,'none',{},{grp:false}); ph(); check('2. 沒在家族群組、沒見過她：沒有',!byTag('sisb15_study1').length); }
  /* 以安的公法讀書會同一晚（週四 20:00）：照 AA_490 第 3 節同一個讀書會的做法——那一學期去過的「去。」帶小字 */
  { const d=D('2027-10-21'); fresh(d-1,21.3,'fam'); H.G.acts.att['public_law_group@'+D('2027-10-14')]={h:20,end:'full'}; ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisb15_study1');
    fresh(d-1,21.3,'fam'); ph(); const m0=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisb15_study1');
    check('2. 同一晚有以安的公法讀書會（那一學期去過）：「去。」帶小字「那天晚上也是公法讀書會」（AA_490 第 3 節照撞期處理，子代理解讀）；沒去過的沒有小字',!!m&&m.ask.opts[0].hint==='那天晚上也是公法讀書會'&&!!m0&&!m0.ask.opts[0].hint,J([m&&m.ask.opts,m0&&m0.ask.opts])); }
  /* 人在日本（日本路線 3/25 出發）：5/11 那一次訊息照收、沒有「去。」*/
  { const d=D('2028-05-11'); fresh(d-1,22.5,'fam',{JP_DEPARTED:D('2028-03-25')},{route:'JP'}); ph(); const M=byTag('sisb15_study4');
    check('2. 日本路線 5/11（人在日本）：群組那一則照收（日本 22:00）、沒有「去。」、不排',M.length===1&&!M[0].ask&&!OUT.get(H.G,'sisb15_study_4')&&Math.abs(M[0].h-22)<0.02,J(M)); }
  /* 2-3 Kevin 九點 */
  { const d=D('2028-03-16'); fresh(d,20.8,'none'); ph(); const n0=byTag('sisb15_late').length; phAt(d,21.1); const M=byTag('sisb15_late');
    check('2. 2-3：3/16 21:00 家族群組 Kevin「學姊今天遲到十分鐘 我拍下來了」（群組的人都看得到，去沒去都一樣）；21:00 以前沒有',n0===0&&M.length===1&&M[0].from==='kevin'&&M[0].th==='g:family_law'&&M[0].text==='學姊今天遲到十分鐘 我拍下來了',J(M)); }
  /* 2-1 法律內容 */
  { const L=evTexts((ev('ev_sis15_study_1')||{}).dialogue).join('\n');
    check('2. 2-1 法律內容：民法第 12、13、75、79 條（稿）；十七歲、七歲以下無效、法定代理人承認才有效、「效力未定」、以前是二十歲；只講到效力未定（不寫第 84、85 條、沒有判決字號）',
      /民法第 12 條（滿 18 歲成年/.test(S2)&&/第 79 條/.test(S2)&&/十七歲/.test(L)&&/七歲以下的，才是無效/.test(L)&&/爸媽承認了，才有效/.test(L)&&/效力未定/.test(L)&&/以前是二十歲/.test(L)&&!/第\s*8[45]\s*條|字第\s*\d+\s*號|判決/.test(L),L.slice(0,120).replace(/\n/g,'／')); } });

/* ---- 3 第 3 節 說了沒發生的 ---- */
await sec(3,async()=>{
  /* 1 Kevin 畢業、國考 */
  { const a=D('2028-06-01'), d=D('2028-06-03');
    check('3. 1 日子：6/1 週四、6/3 週六、8/26 週六',wdOf(a)===4&&wdOf(d)===6&&wdOf('2028-08-26')===6);
    fresh(a,20.8,'none'); ph(); const n0=byTag('sisb15_kv_grad_ask').length; phAt(a,21.2); const M=byTag('sisb15_kv_grad_ask');
    check('3. 1 6/1 21:00 家族群組 Kevin「禮拜六畢業典禮 霖澤館門口拍照 家族都來」、回覆「去。」（D 也有）',n0===0&&M.length===1&&M[0].from==='kevin'&&M[0].text==='禮拜六畢業典禮 霖澤館門口拍照 家族都來'&&J(askOpts('sisb15_kv_grad_ask'))===J(['去。']),J(M));
    answer('sisb15_kv_grad_ask',0); ph(); const q=OUT.get(H.G,'sisb15_kv_grad');
    check('3. 1 回「去。」→ 6/3 10:30「霖澤館門口」（ev_sis15_kv_grad）',!!q&&q.day===d&&q.h===10.5&&q.place==='霖澤館門口'&&q.ev==='ev_sis15_kv_grad',J(q));
    at(d,10.4); await goOut('sisb15_kv_grad',[]); const want=quotesOf(part('**6/3（六）10:30','- 記 `SIS15_KV_GRAD`',S3));
    check('3. 1 演：照稿四句（Kevin「學姊！站中間！」、她「……你是主角。」、扶正帽子）；記 SIS15_KV_GRAD；D 演完記 met_sis',J(said())===J(want)&&want.length===4&&H.G.flags.SIS15_KV_GRAD===true&&H.G.flags.met_sis===true&&H.said[1].who==='Kevin',J({s:said(),want}));
    phAt(d,13.2); check('3. 1 6/3 13:00 那則群組照舊（sisb12_grad「好。日子跟我說。」）',txt('g:family_law').includes('好。日子跟我說。'));
    fresh(a,21.2,'fam'); ph(); phAt(d,11); check('3. 1 沒回：不排',!OUT.get(H.G,'sisb15_kv_grad'));
    const b=D('2028-08-26'); fresh(b-1,23,'friend'); phAt(b,8.3); const B=byTag('sisb15_bar_cheer');
    check('3. 1 國考那天 2028-08-26（六）臺灣 08:00 家族群組：學姊「Kevin。」「今天。……集氣。」Kevin「學姊！！！！」',J(B.map(m=>[m.from,m.text]))===J([[ID,'Kevin。'],[ID,'今天。……集氣。'],['kevin','學姊！！！！']])&&B[0].day===b&&Math.abs(B[0].h-8)<0.02,J(B));
    fresh(b-1,10,'friend',{US_ARRIVED:true,US1:'together'},{route:'US',zone:'us_apartment'}); phAt(b-1,21); const U=byTag('sisb15_bar_cheer');
    check('3. 1 美國路線（人在美國）：照當地時間（臺灣 8/26 08:00＝美國 8/25 20:00）',U.length===3&&U[0].day===b-1&&Math.abs(U[0].h-20)<0.02,J(U.map(m=>[m.day,m.h]))); }
  /* 2 期中考完再說一次 */
  { const lunch=async(kind,k)=>{ fresh('2026-11-06',12.3,kind); await runEv('ev_sis_lunch_y2',[k]); };
    await lunch('fam',1); const f1=H.G.flags.SIS15_ALLOK; await lunch('fam',0); const f0=H.G.flags.SIS15_ALLOK;
    check('3. 2 11/6 午餐選「都還好。」記 SIS15_ALLOK；選「債總。」不記',f1===true&&!f0,J([f1,f0]));
    const pre=async(key,h,fl,picks)=>{ fresh(key,h,'fam',Object.assign({SIS15_ALLOK:true},fl||{}),{zone:'library'}); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return X().preTalk(GM); };
    const r1=await pre('2026-11-16',10,{},[0]);
    check('3. 2 11/16 起第一次找她說話：「期中考完了。……再說一次，都還好嗎？」兩個選項；「這次是真的還好。」→「好。」',r1===true&&J(said())===J(['期中考完了。……再說一次，都還好嗎？','好。'])&&J(H.opts[0])===J(['「這次是真的還好。」','「其實不太好。」']),J({s:said(),o:H.opts}));
    const h0=(fresh('2026-11-17',10,'fam',{SIS15_ALLOK:true},{zone:'library'}),H.G.hour); H.said=[]; H.picks=[1]; await X().preTalk(GM);
    check('3. 2「其實不太好。」→「……說來聽聽。」＋旁白「（你講了二十分鐘，她都在聽，沒有打斷。）」、時間往前 20 分鐘；只一次',J(said().slice(1))===J(['……說來聽聽。','（你講了二十分鐘，她都在聽，沒有打斷。）'])&&Math.abs(H.G.hour-h0-1/3)<0.01&&!X().midDue(H.G),J(said()));
    const no=[]; if(await pre('2026-11-15',10)) no.push('11/15'); fresh('2026-11-20',10,'fam',{},{zone:'library'}); if(X().midDue(H.G)) no.push('沒有 SIS15_ALLOK');
    check('3. 2 11/16 以前、沒選「都還好。」：沒有',!no.length,J(no));
    fresh('2026-11-18',10,'fam',{SIS15_ALLOK:true},{zone:'library'}); H.said=[]; H.picks=[0]; const p0=SISY23.preTalk; await SISY23.preTalk(GM);
    check('3. 2 接在找她說話的前面（SISY23.preTalk 整條鏈跑一次；同一天沒有她別的說話前接演）',typeof p0==='function'&&has('期中考完了。……再說一次，都還好嗎？'),J(said())); }
  /* 3 3/15 21:30 */
  { const d=D('2028-03-15'); for(const kind of ['fam','friend']){ fresh(d,21,kind); phAt(d,21.4); const n0=byTag('sisb15_us_up').length; phAt(d,21.6); const M=byTag('sisb15_us_up'), call=OUT.get(H.G,'sisy23_result');
      check('3. 3 '+(kind==='fam'?'有點熟（沒有電話）':'朋友以上（有 21:30 的電話）')+'：3/15 21:30 家族群組 學姊「美國那邊，上了。」「八月走。」Kevin「學姊！！！！！」',n0===0&&J(M.map(m=>[m.from,m.text]))===J([[ID,'美國那邊，上了。'],[ID,'八月走。'],['kevin','學姊！！！！！']])&&(kind==='fam'?!call:!!call),J({M,call:!!call})); } }
  /* 4 3/16 12:20 研究室 */
  { const call=async(kind,k)=>{ fresh('2028-03-15',21.5,kind); await runEv('ev_sis_us_result',k); };
    await call('dating',[1]); const go=H.G.flags.SIS15_LUNCH_GO; ph(); const q=OUT.get(H.G,'sisb15_lunch0316');
    check('3. 4 交往中 3/15 電話選「我現在過去。」：記 SIS15_LUNCH_GO；排 3/16（四）12:20 研究室（出遊 1 小時；回「好。」已經在電話裡）',go===true&&!!q&&q.day===D('2028-03-16')&&Math.abs(q.h-(12+20/60))<0.01&&q.hours===1&&q.ev==='ev_sis15_lunch0316',J(q));
    at('2028-03-16',12.2); await goOut('sisb15_lunch0316',[0]); const b=blk(part('4. **「很晚了。','5. **',S3));
    check('3. 4 演：「說好中午。」…；「現在還抖嗎？」→（她把手伸出來給你看。）「不抖了。吃飯。」；記 SIS15_LUNCH_0316',seq(b.pre.concat(b.opts[0].r))&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&H.G.flags.SIS15_LUNCH_0316===true,J({s:said(),b}));
    await call('dating',[1]); ph(); at('2028-03-16',12.2); await goOut('sisb15_lunch0316',[1]); check('3. 4（把她的便當蓋子打開）→「……謝謝。」',has('……謝謝。'));
    await call('dating',[0]); ph(); check('3. 4 選「恭喜。」：不排',!H.G.flags.SIS15_LUNCH_GO&&!OUT.get(H.G,'sisb15_lunch0316'));
    await call('dating',[1]); ph(); ROM.end(H.G,ID,'test'); at('2028-03-16',8); ph(); const qq=OUT.get(H.G,'sisb15_lunch0316'); check('3. 4 3/16 已經不在交往：取消',!!qq&&qq.state==='cancelled',J(qq)); }
  /* 5 傳一張照片給她 */
  { const act=()=>(PHONE.GROUP_ACTS||[]).find(a=>a.id==='sisb15_photo');
    fresh('2028-09-10',19.9,'dating'); const A=act(), s0=A&&A.show(H.G); at('2028-09-10',20.1); const s1=A&&A.show(H.G);
    check('3. 5 臺灣路線交往中 9/10（日）：20:00 起她的私訊對話框多一個「（傳一張照片給她）」（PHONE.GROUP_ACTS、th p:她）；20:00 以前沒有',!!A&&A.th==='p:'+ID&&A.label==='（傳一張照片給她）'&&s0===false&&s1===true&&wdOf('2028-09-10')===7&&wdOf('2028-11-12')===7,J({s0,s1}));
    H.said=[]; H.opts=[]; H.picks=[0]; await A.run(GM); phAt('2028-09-10',22.6); const T0=txt('p:'+ID);
    check('3. 5 三選一（照稿）；選「（麵店的長桌）」→ 傳出去、她回「阿姨有沒有問我。」（照 MSG 的時間：22:30）；記 SIS15_PHOTO_9；一次一張',J(H.opts[0])===J(['（麵店的長桌）','（椰林大道）','（你的計畫本）'])&&J(T0)===J(['（麵店的長桌）','阿姨有沒有問我。'])&&H.G.flags.SIS15_PHOTO_9==='noodle'&&A.show(H.G)===false,J(T0));
    const rep=async(key,k)=>{ fresh(key,20.5,'dating'); H.picks=[k]; await act().run(GM); phAt(key,23); return txt('p:'+ID).slice(-1)[0]; };
    const r9=await rep('2028-09-10',1), r11=await rep('2028-11-12',1), rp=await rep('2028-11-12',2), f11=H.G.flags.SIS15_PHOTO_11;
    check('3. 5 椰林大道：9/10「葉子還是綠的吧。這邊已經黃了。」、11/12「葉子還是綠的吧。這邊已經沒有葉子了。」；計畫本「這一頁太滿了。……睡覺那一格呢。」；11/12 記 SIS15_PHOTO_11',r9==='葉子還是綠的吧。這邊已經黃了。'&&r11==='葉子還是綠的吧。這邊已經沒有葉子了。'&&rp==='這一頁太滿了。……睡覺那一格呢。'&&f11==='plan',J([r9,r11,rp,f11]));
    const no=[]; for(const [nm,key,kind,o] of [['美國路線','2028-09-10','dating',{route:'US'}],['日本路線','2028-09-10','dating',{route:'JP'}],['朋友（沒交往）','2028-09-10','friend'],['別的週日 9/17','2028-09-17','dating']]){ fresh(key,20.5,kind,{},o); if(act().show(H.G)) no.push(nm); }
    check('3. 5 美國路線、日本路線、沒交往、別的日子：沒有',!no.length,J(no));
    const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    check('3. 5 手機畫面：一對一的對話串也讀 PHONE.GROUP_ACTS（game3d.js threadHTML）',/const gAct=\(th\.startsWith\('g:'\)\|\|th\.startsWith\('p:'\)\)&&Array\.isArray\(PHONE\.GROUP_ACTS\)/.test(g3)); }
  /* 6 兩把傘 */
  { const e=ev('ev_sis15_umbrella'), rd=D('2028-04-26');
    const setup=(key,h,kind,fl,weather)=>{ fresh(key,h,kind,Object.assign({SIS_Y3S2_RAIN:'buy'},fl||{}),{zone:'campus'}); H.G.events.done.ev_sis_y3s2_rain=1; H.G.events.last.ev_sis_y3s2_rain=rd; H.G.weather=weather||'rain'; place(84,3); her(83,3); };
    setup('2028-05-10',17.1,'fam'); const z=zoneOf(); const ran=await tickOnly('ev_sis15_umbrella');
    check('3. 6「下次換我帶兩把。」（SIS_Y3S2_RAIN buy）以後第一個下雨天 17:00 總圖門口走近她：「（她手上拿著兩把傘。一把遞給你。）」「說好的。」；一次',z==='campus'&&ran&&J(said())===J(['（她手上拿著兩把傘。一把遞給你。）','說好的。'])&&!EVENTS.check(e)&&e.weather==='rain'&&J(e.time)===J([17,17.5]),J({z,s:said()}));
    const no=[]; for(const [nm,key,h,kind,fl,w] of [['沒下雨','2028-05-10',17.1,'fam',{},'clear'],['選了一起撐（share）','2028-05-10',17.1,'fam',{SIS_Y3S2_RAIN:'share'}],['那一天（雨天那一場當天）','2028-04-26',17.1,'fam'],['17:30 以後','2028-05-10',17.6,'fam'],['前任','2028-05-10',17.1,'ex']]){ setup(key,h,kind,fl,w); if(EVENTS.check(e)) no.push(nm); }
    check('3. 6 沒下雨、選一起撐、雨天那一場當天、17:30 以後、前任：沒有',!no.length,J(no)); }
  /* 7 兩件外套 */
  { const e=ev('ev_sis15_coat'), c=D('2027-07-29');
    const setup=(key,h,kind,fl)=>{ fresh(key,h,kind,Object.assign({VF_Y2_0729:'find'},fl||{}),{zone:'lawlib'}); H.G.events.done.ev_vf_y2_0729=1; H.G.events.last.ev_vf_y2_0729=c; place(1,1); her(1.5,1.5); };
    setup('2027-08-04',19.5,'dating'); const z=zoneOf(); const ran=await tickOnly('ev_sis15_coat');
    check('3. 7 7/29 法圖「……下次我帶兩件。」（交往中 VF_Y2_0729 find）以後第一次週三晚上：她在法圖（不在研究室）、走近：「（她的包包裡多帶了一件外套，遞給你。）」「法圖冷。說好的。」；一次',wdOf(c)===4&&z==='lawlib'&&ran&&J(said())===J(['（她的包包裡多帶了一件外套，遞給你。）','法圖冷。說好的。'])&&!EVENTS.check(e),J({z,s:said()}));
    at('2027-08-11',19.5); const z2=zoneOf(); check('3. 7 給過以後：下一個週三照舊在研究室（AA_512）',z2==='linze_5f',z2);
    const no=[]; for(const [nm,key,kind,fl] of [['回「我明天去。」（go）','2027-08-04','dating',{VF_Y2_0729:'go'}],['沒交往','2027-08-04','friend'],['週四','2027-08-05','dating']]){ setup(key,19.5,kind,fl); if(EVENTS.check(e)) no.push(nm); }
    check('3. 7 不是「我去找妳。」那一版、沒交往、別的星期：沒有',!no.length,J(no)); }
  /* 8 說好你請 */
  { fresh('2026-11-06',12.3,'dating'); await runEv('ev_sis_lunch_y2',[0]); const yp=H.G.flags.SIS15_YOUPAY; fresh('2026-11-06',12.3,'fam'); await runEv('ev_sis_lunch_y2',[0]); const np=H.G.flags.SIS15_YOUPAY;
    const dinner=async(fl,term)=>{ fresh('2027-01-15',18.5,'dating',fl); H.said=[]; H.opts=[]; H.picks=[0,0,0]; await TERMEND.dinner(GM,{te:{term:term||'Y2S1',who:ID,kind:'gf'}}); };
    await dinner({SIS15_YOUPAY:true}); const s1=said(); await dinner({}); const s0=said(); await dinner({SIS15_YOUPAY:true},'Y2S2'); const s2=said();
    check('3. 8 11/6 交往版「……下次你請。」記 SIS15_YOUPAY（朋友版不記）；大二上女朋友版期末飯收尾多兩行「（結帳的時候，她站在旁邊沒有動。）」「……說好你請。」；沒聽過、別的學期沒有',
      yp===true&&!np&&s1.indexOf('（結帳的時候，她站在旁邊沒有動。）')>=0&&s1.indexOf('……說好你請。')===s1.indexOf('（結帳的時候，她站在旁邊沒有動。）')+1&&!s0.includes('……說好你請。')&&!s2.includes('……說好你請。'),J({yp,np,s1})); }
  /* 9 火鍋的照片 */
  { const d=D('2026-06-19'); fresh(d,21.5,'none'); phAt(d,21.9); const n0=byTag('sisb15_hotpot').length; phAt(d,22.1); const M=byTag('sisb15_hotpot');
    check('3. 9 2026-06-19（五）22:00 家族群組 Kevin「（照片：火鍋店的長桌，學姊坐在最旁邊，碗裡只有青菜）」「學姊只吃菜 我們吃了九盤肉」（所有群組成員）',wdOf(d)===5&&n0===0&&J(M.map(m=>[m.from,m.text]))===J([['kevin','（照片：火鍋店的長桌，學姊坐在最旁邊，碗裡只有青菜）'],['kevin','學姊只吃菜 我們吃了九盤肉']]),J(M)); }
  /* 10 7/26 21:10 她私訊 */
  { const a=D('2028-07-26'), go=D('2028-08-02');
    fresh(a,21,'dating'); ph(); const n0=byTag('sisb15_sendoff').length; phAt(a,21.5); const M=byTag('sisb15_sendoff');   /* 21:30 才看：照原本的時間 21:10 補進去 */
    check('3. 10 臺灣路線交往中 7/26（三）21:10 她私訊「八月二號。七點，我家巷口。」、回覆「好。」「我那天沒辦法。」；21:10 以前沒有',wdOf(a)===3&&n0===0&&M.length===1&&M[0].th==='p:'+ID&&M[0].text==='八月二號。七點，我家巷口。'&&Math.abs(M[0].h-(21+10/60))<0.02&&J(askOpts('sisb15_sendoff'))===J(['好。','我那天沒辦法。']),J(M));
    answer('sisb15_sendoff',0); ph(); const q=OUT.get(H.G,'y4_sis_airport');
    check('3. 10「好。」→ 排送機（同按鈕那一條：SIS_RIDE_ASK yes → y34b3d.js 的家族共乘、ev_sis_airport），出發照她說的 8/2 07:00 學姊家巷口（子代理解讀）',H.G.flags.SIS_RIDE_ASK==='yes'&&!!H.G.flags.SIS_RIDE&&!!q&&q.day===go&&q.h===7&&q.ev==='ev_sis_airport'&&q.place==='學姊家巷口',J({f:[H.G.flags.SIS_RIDE_ASK,H.G.flags.SIS_RIDE],q}));
    fresh(a,21.2,'dating'); ph(); answer('sisb15_sendoff',1); ph(); const T1=txt('p:'+ID);
    check('3. 10「我那天沒辦法。」→「好。……那我自己去。」；不排送機',T1.slice(-2).join('|')==='我那天沒辦法。|好。……那我自己去。'&&!OUT.get(H.G,'y4_sis_airport')&&H.G.flags.SIS_RIDE_ASK==null,J(T1));
    const no=[]; for(const [nm,kind,fl,o] of [['已經在群組按了','dating',{SIS_RIDE_ASK:'yes'}],['期末聚餐說過要送（21:05 她已經私訊）','dating',{HOOK_SIS_SENDOFF:true}],['美國路線','dating',{},{route:'US'}],['日本路線','dating',{},{route:'JP'}],['沒交往','friend']]){ fresh(a,21.3,kind,fl,o); ph(); if(byTag('sisb15_sendoff').length) no.push(nm); }
    check('3. 10 已經在群組按了、期末聚餐說過要送、美國／日本路線、沒交往：不送',!no.length,J(no)); } });
function quotesOf(t){ return String(t).split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>qtext(m[1].trim())); }

/* ---- 4 第 4 節 前後對不上的 ---- */
await sec(4,async()=>{
  /* 4-1 */
  { const p=FEED.post('sis4d'), Gx=fresh('2027-06-26',16.5,'fam'); const v0=FEED.WENT.sisS4Lx(H.G);
    const St=LADDER.byTerm.Y2S2[ID].steps, i=St.findIndex(s=>s.id==='S4-Lx'); H.G.social.ladder=H.G.social.ladder||{}; H.G.social.ladder[ID+'@Y2S2']=i+1; const v1=FEED.WENT.sisS4Lx(H.G);
    check('4. 4-1 6/26 動態：私訊回兩版——聽過 S4-Lx 的「你知道的。……美國那邊的書。」（ROW 4-1 改成）、沒聽過照舊「……之後告訴你。」',(ROW['4-1']||{toQ:[]}).toQ.includes('你知道的。……美國那邊的書。')&&p.went==='sisS4Lx'&&FEED.txt(p.dm[1],'yes')==='你知道的。……美國那邊的書。'&&FEED.txt(p.dm[1],'no')==='……之後告訴你。'&&v0===false&&v1===true,J({dm:p.dm,v0,v1}));
    /* 真的貼一次、私訊 */
    const run=async heard=>{ fresh('2027-06-26',16.5,'friend'); H.CLOSE(ID);   /* 那一則是「很熟」才看得到 */ if(heard){ H.G.social.ladder=H.G.social.ladder||{}; H.G.social.ladder[ID+'@Y2S2']=i+1; } FEED.decide(H.G,p,{day:D('2027-06-26'),h:16}); const r=FEED.respond(H.G,'sis4d','dm'); return r?r.out.map(m=>m.text):null; };
    const r1=await run(true), r0=await run(false);
    check('4. 4-1 私訊問「為什麼讀英文的？」：聽過的回「你知道的。……美國那邊的書。」、沒聽過的回「……之後告訴你。」',J(r1)===J(['為什麼讀英文的？','你知道的。……美國那邊的書。'])&&J(r0)===J(['為什麼讀英文的？','……之後告訴你。']),J([r1,r0]));
    const e=PRIVTALK.byKey.sis_us_told; fresh('2027-11-03',19.5,'friend'); const p0=PRIVTALK.privAt(H.G,e); SOCIAL.remember(ID,'SIS5_EXCHANGE_APP',''); const p1=PRIVTALK.privAt(H.G,e);
    fresh('2027-11-03',19.5,'friend'); H.G.social.ladder=H.G.social.ladder||{}; H.G.social.ladder[ID+'@Y2S2']=i+1; const p2=PRIVTALK.privAt(H.G,e);
    check('4. 4-1 privtalk3d.js「學姊美國交換」：聽過 S4-Lx 或 S5-L1（SIS5_EXCHANGE_APP）的玩家不算私密；沒聽過照舊私密',p0===true&&p1===false&&p2===false&&typeof e.pub==='function',J([p0,p1,p2])); }
  /* 4-2 */
  { const s7=ladStep('Y2S2','S4-L7');
    check('4. 4-2 S4-L7 第一句「搬出來以後，我到法學院要多坐四站。」（ROW 4-2）、註解改綁 2027-03-20；匯入工具（tools/ladder/import_ladder.py 的 _fix）、ladder.js 的來源寫了 AA_518@'+SHA,
      (ROW['4-2']||{toQ:[]}).toQ.includes('搬出來以後，我到法學院要多坐四站。')&&s7.lines[0]==='搬出來以後，我到法學院要多坐四站。'&&/2027-03-20/.test(s7.note)&&!/她家 2026-07-11 搬家/.test(s7.note)&&LADDER.source.indexOf('AA_518@'+SHA)>=0&&/_fix\('docs\/story_planning\/AA_518_'/.test(fs.readFileSync(path.join(H.ROOT,'tools/ladder/import_ladder.py'),'utf8')),J({l:s7.lines,n:s7.note}));
    /* vac3d.js：出國旅遊和學姊（女朋友）出發前一天「我跟我媽說了。」限 2027-03-20 以前 */
    const trip=async(key,start)=>{ fresh(key,10,'dating'); H.G.flags.romance[ID].history=[{ev:'start',day:D(key)-200}]; H.G.dateLog=H.G.dateLog||{}; const DL0=DATE.log; DATE.log=()=>({count:5});
      try{ const B=VAC.nextBreak(H.G); const D0=VAC.TV?VAC.TV():null; H.said=[]; H.opts=[]; let n=0; GM.choose=async o=>{ H.opts.push(o.map(q=>q.t)); n++; if(n===1) return o.findIndex(q=>q.t!=='不去了'&&!/美國|歐洲|英國|澳洲/.test(q.t)); if(n===2) return o.findIndex(q=>/學姊|書瑀/.test(q.t)); if(n===3) return 0; return 0; };
        const r=await VAC.plan13(GM); return {r,B,tags:(PHONE.rec(H.G).q||[]).map(q=>q.tag)}; } finally { DATE.log=DL0; GM.choose=H.GM.choose; } };
    const c0=H.GM.choose; let t1=null, t2=null; try{ t1=await trip('2027-01-10'); t2=await trip('2027-06-10'); } finally { GM.choose=c0; }
    const eve=x=>!!x&&(x.tags||[]).some(t=>/^vac_t13eve_/.test(t));
    check('4. 4-2 vac3d.js：和學姊出國旅遊，出發前一天 21:00「我跟我媽說了。」只到 2027-03-20 以前（寒假的那一趟有、暑假的那一趟沒有）',eve(t1)&&!eve(t2)&&!!t1.r&&!!t2.r,J({t1,t2})); }
  /* 4-3 見第 2 節 */
  /* 4-4、4-5 */
  { const f=FEED.post('sis4f'), e=FEED.post('sis2e');
    check('4. 4-4 6/23 咖哩那則的留言回「他說要三匙。我沒給。」（ROW 4-4）；4-5 游泳那則「最近加得比較快。」（ROW 4-5）',f.cm[1]==='他說要三匙。我沒給。'&&e.cm[1]==='最近加得比較快。'&&(ROW['4-4']||{toQ:[]}).toQ.includes('他說要三匙。我沒給。')&&(ROW['4-5']||{toQ:[]}).toQ.includes('最近加得比較快。'),J([f.cm,e.cm])); }
  /* 4-6 見第 5 節 BB 第 5 項 */
  /* 4-7、4-8、4-10、4-11 */
  { const TL=TERMEND_LINES; fresh('2027-01-15',18,'fam'); const y3fam=resolveL(TL.POOL.Y3S1.heroine_05,H.G); fresh('2027-01-15',18,'friend'); const y3fri=resolveL(TL.POOL.Y3S1.heroine_05,H.G);
    check('4. 4-7 大一下「暑假我在總圖。」、大二上「寒假我在總圖。」；大二下「暑假我在法圖，寫報告。」不改',TL.POOL.Y1S2.heroine_05[1]==='暑假我在總圖。'&&TL.POOL.Y2S1.heroine_05[1]==='寒假我在總圖。'&&TL.POOL.Y2S2.heroine_05[0]==='暑假我在法圖，寫報告。'&&(ROW['4-7']||{toQ:[]}).toQ.includes('暑假我在總圖。'),J([TL.POOL.Y1S2.heroine_05,TL.POOL.Y2S1.heroine_05]));
    check('4. 4-8、4-10、4-11 大三上：「明年夏天，我申請了美國的交換。下個月面試。」「論文第二章，卡住的那一段過了。」；朋友以上第三句「……收到信那天，我打給你。」、有點熟沒有',
      J(y3fam)===J(['明年夏天，我申請了美國的交換。下個月面試。','論文第二章，卡住的那一段過了。'])&&J(y3fri)===J(['明年夏天，我申請了美國的交換。下個月面試。','論文第二章，卡住的那一段過了。','……收到信那天，我打給你。']),J({y3fam,y3fri}));
    check('4. 4-10 邀約那一句（termend_lines.js 朋友版大三上）：「我在等美國那邊的結果。」換成「明年夏天，我申請了美國的交換。下個月面試。」',TL.FRIEND.heroine_05.genByTerm.Y3S1==='期末考完了嗎？明年夏天，我申請了美國的交換。下個月面試。……吃飯的時候不要問。',TL.FRIEND.heroine_05.genByTerm.Y3S1);
    fresh('2028-01-14',18.5,'friend'); H.said=[]; H.picks=[0,0,0]; await TERMEND.dinner(GM,{te:{term:'Y3S1',who:ID,kind:'friend'}});
    check('4. 4-11 朋友版期末飯（話題三句）：說到「……收到信那天，我打給你。」',seq(['明年夏天，我申請了美國的交換。下個月面試。','論文第二章，卡住的那一段過了。','……收到信那天，我打給你。']),J(said())); }
  /* 4-9 */
  check('4. 4-9 characters.js 學姊 contradictions「財經法學組」（不是公法組）',/財經法學組/.test(CHARACTERS[ID].contradictions)&&!/公法組/.test(CHARACTERS[ID].contradictions),CHARACTERS[ID].contradictions);
  /* 4-12 */
  { const c1=ev('ev_sis_c1_festival'), gi=ev('ev_grad_info_session'); fresh('2026-04-08',16.6,'none',{SIS_CONTACTED:true,SIS_RESULT_OUT:true}); const a=EVENTS.cond(c1.prereq), b=EVENTS.cond(gi.prereq);
    fresh('2026-04-08',16.6,'fam',{SIS_CONTACTED:true,SIS_RESULT_OUT:true}); const a1=EVENTS.cond(c1.prereq), b1=EVENTS.cond(gi.prereq);
    check('4. 4-12 C1「高二的校慶」、研究所說明會：要 met_sis（只加過好友、沒見過的不演）',a===false&&b===false&&a1===true&&b1===true,J([a,b,a1,b1])); }
  /* 4-13 */
  { const R=id=>HCIRCLE.row(id), ok=(id,key,h)=>{ fresh(key,h,'friend'); return HCIRCLE.timeOk(R(id),H.G); };
    const r=[ok('c504_5_1','2026-03-20',19),ok('c504_5_1','2026-03-27',19),ok('c505_5_1',STORY.termDay('Y2S1',3,5),19),ok('c505_5_1',STORY.termDay('Y2S1',4,5),19),ok('c506_5_1','2027-04-30',19),ok('c506_5_1','2027-05-07',19),ok('c506_5_1b','2027-04-30',19),ok('c506_5_1b','2027-05-07',19)];
    check('4. 4-13 圈子旁聽：c504_5_1「上榜了，還在念？」3/23 起（3/20 沒有、3/27 有）；c505_5_1「演習課怎樣？」第 4 週起；c506_5_1「題目定了沒？」到 5/3、5/4 起換「題目定了？」「定了。」（c506_5_1b）',
      J(r)===J([false,true,false,true,true,false,false,true])&&!!R('c506_5_1b')&&J(R('c506_5_1b').lines.map(l=>l.t))===J(['題目定了？','定了。']),J(r)); }
  /* 4-14 */
  { const w3=STORY.termDay('Y2S1',3,2), w4=STORY.termDay('Y2S1',4,2); fresh(w3,19,'friend'); const e3=STORY.schedEnt(CHARACTERS[ID],H.G); fresh(w4,19,'friend'); const e4=STORY.schedEnt(CHARACTERS[ID],H.G);
    fresh(w3,19,'friend'); const c3=CLOSED.taWeek(H.G); fresh(w4,19,'friend'); const c4=CLOSED.taWeek(H.G);
    check('4. 4-14 演習課第 4 週起（作息、closed3d.js TA_WEEKS）：第 3 週週二 19:00 不在 101、第 4 週在',J(CLOSED.TA_WEEKS)===J([4,5,6,7,10,11,12,13,14,15])&&!(e3&&e3.away==='在霖澤館 101 帶演習課')&&!!e4&&e4.away==='在霖澤館 101 帶演習課'&&c3===false&&c4===true,J([e3&&(e3.away||e3.zone),e4&&e4.away,c3,c4])); }
  /* 4-15 */
  { const s8=ladStep('Y2S2','S4-L8'); fresh('2027-05-17',12,'fam'); const a=STORY.ladLines(s8,H.G,ID); H.G.events.done.ev_sis13_curry=1; const b=STORY.ladLines(s8,H.G,ID);
    check('4. 4-15 S4-L8（第 13～16 週）：5/9 咖哩演過的「上次在我家，大一的學弟妹一進門就全部站起來。」「……我說坐。他們站得更直。」；沒演過的照原句',J(s8.week)===J([13,16])&&J(b)===J(['上次在我家，大一的學弟妹一進門就全部站起來。','……我說坐。他們站得更直。'])&&J(a)===J(['Kevin 辦家族聚餐，叫我一定要去。','我到的時候，大一的學弟妹全部站起來叫學姊。……我坐下來，他們又站一次。'])&&(ROW['4-15']||{toQ:[]}).toQ.includes('……我說坐。他們站得更直。'),J({a,b})); } });

/* ---- 5 BB 測試六項（稿第 5 節）---- */
await sec(5,async()=>{
  const bb=S5.split('\n').filter(l=>/^\s+- /.test(l)&&S5.indexOf('**測試（BB）**')<S5.indexOf(l));
  check('5. 稿第 5 節 BB 測試六項讀得到',bb.length===6,J(bb));
  /* ① C（有點熟）大二寒假 1/27 走進總圖 → 1-4 演 */
  fresh('2027-01-27',14.5,'fam',{},{zone:'library'}); place(1,1); her(1.5,1.2); const z=zoneOf(); const r1=await tickOnly('ev_sis15_chishang',[0]);
  check('5. ① C（有點熟）大二寒假 1/27 走進總圖（她在總圖、走近）→ 1-4 演',z==='library'&&r1&&has('池上。……上禮拜去的。'),J({z,s:said()}));
  /* ② D（沒見過）大三 10/21 回「去。」→ 2-1 演、記 met_sis */
  { const d=D('2027-10-21'); fresh(d-1,21.2,'none'); ph(); answer('sisb15_study1',0); ph(); at(d,18.9); await goOut('sisb15_study_1',[0]);
    check('5. ② D（沒見過）10/20 21:00 群組回「去。」→ 10/21 2-1 演、記 met_sis',has('佳穎。')&&has('（她在白板上寫下「效力未定」四個字，圈起來。）')&&H.G.flags.met_sis===true&&H.G.flags.SIS15_STUDY_1===true); }
  /* ③ 3/15 有點熟的玩家 21:30 群組看到「上了」*/
  { const d=D('2028-03-15'); fresh(d,21,'fam'); phAt(d,21.6); check('5. ③ 3/15 有點熟的玩家 21:30 家族群組看到「美國那邊，上了。」',txt('g:family_law').includes('美國那邊，上了。')); }
  /* ④ 交往中 3/15 電話選「我現在過去。」→ 3/16 12:20 研究室便當 */
  { fresh('2028-03-15',21.5,'dating'); await runEv('ev_sis_us_result',[1]); ph(); const q=OUT.get(H.G,'sisb15_lunch0316'); at('2028-03-16',12.25); await goOut('sisb15_lunch0316',[0]);
    check('5. ④ 交往中 3/15 電話選「我現在過去。」→ 3/16 12:20 研究室，桌上兩個便當',!!q&&Math.abs(q.h-(12+20/60))<0.01&&has('（研究室。她的桌上放著兩個便當，筷子已經拆好了。）')); }
  /* ⑤ 4-6：6/2 生日那場說「這禮拜六畢業」*/
  { const e=STORY_EVENTS.find(x=>evTexts(x.dialogue).includes('這禮拜六畢業。……之後還是在這裡讀書，只是換一張學生證。'));
    const L=e?evTexts(e.dialogue):[]; check('5. ⑤ 4-6：2026-06-02（二）生日那場說「這禮拜六畢業。……之後還是在這裡讀書，只是換一張學生證。」（舊句「下禮拜畢業。」沒有了）',!!e&&wdOf('2026-06-02')===2&&!L.some(t=>/下禮拜畢業/.test(t))&&(ROW['4-6']||{toQ:[]}).toQ.includes('這禮拜六畢業。……之後還是在這裡讀書，只是換一張學生證。'),e&&e.id);
    if(e&&e.trigger!=='manual'){ fresh('2026-06-02',12.5,'fam'); H.said=[]; H.picks=[0]; await EVENTS.runLines(e.dialogue,e); check('5. ⑤ 演一次：說了那一句',has('這禮拜六畢業。……之後還是在這裡讀書，只是換一張學生證。'),J(said())); } }
  /* ⑥ 4-12：沒見過她的玩家，大一下沒有 C1 */
  { const c1=ev('ev_sis_c1_festival'); fresh('2026-04-08',16.6,'none',{SIS_CONTACTED:true,SIS_RESULT_OUT:true},{zone:'campus'}); const n=EVENTS.check(c1); fresh('2026-04-08',16.6,'fam',{SIS_CONTACTED:true,SIS_RESULT_OUT:true},{zone:'campus'}); const y=EVENTS.check(c1);
    check('5. ⑥ 4-12：沒見過她的玩家（加過好友、她放榜了），大一下 4/8 沒有 C1；見過的照舊',n===false&&y===true,J([n,y])); } });

/* ---- 6 舊存檔、不撞 ---- */
await sec(6,async()=>{
  const ow=console.warn; let warns=0; console.warn=()=>{ warns++; };
  try{ for(const key of ['2026-01-14','2026-06-19','2026-08-31','2026-11-16','2027-02-24','2027-07-26','2027-10-20','2027-10-21','2028-01-19','2028-03-15','2028-03-16','2028-05-10','2028-06-01','2028-06-28','2028-07-26','2028-08-26','2028-09-10','2028-11-12']){
      const G=fresh(key,21,'friend'); delete G.outings; delete G.phone; G.msgs=[]; ph(); for(const e of (typeof SISB15_EVENTS!=='undefined'?SISB15_EVENTS:[])) EVENTS.check(e);
      if(X()){ X().photoNow(G); X().wedYield(G); X().thuYield(G); X().midDue(G); STORY.schedEnt(CHARACTERS[ID],G); STORY.roomItemList(G); } } } finally { console.warn=ow; }
  check('6. 舊存檔（沒有 outings／phone、沒有新旗標）：手機規則、事件條件、作息、房間物件照常跑，不丟例外、不印警告',warns===0&&!!X(),'warn '+warns);
  const fresh0=fresh('2027-10-20',21.2,'friend'); ph(); const keys=Object.keys(fresh0.flags).filter(k=>/^SIS15_/.test(k));
  check('6. 新的一局在讀書會前一天：沒有任何 SIS15_ 旗標（只有回了才記）',!keys.length,J(keys));
  const wds=['2027-10-21','2027-12-09','2028-03-16','2028-05-11'].map(wdOf), wd1=Y1.map(s=>wdOf(s.day));
  check('6. 不撞：2-1～2-4 都是週四；1-1～1-9 照稿的星期（1-3 是週一，其他週三）',J(wds)===J([4,4,4,4])&&J(wd1)===J([3,3,1,3,3,3,3,3,3]),J({wds,wd1})); });

H.done();
})();
