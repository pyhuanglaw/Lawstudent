// AA_523 學姊第十六批：回臺灣以後的最後半年（2028-12-24～2029-06-30；企劃線 0d7b5388b，AA-C 2026-10-28；任務 SIS-B16-1028、SIS-LEAD-1021、D111、USER_WANTS C25）——不需要瀏覽器。
// 台詞逐字對稿（git show 0d7b5388b：第 1～5 節的「>」、選項、→ 後面的回覆（說話的人前綴拿掉；同一行的旁白＋台詞拆開也要接得起來）、私訊的「回「…」→ 學姊：「…」」；第 6 節表「改成」那一欄、書桌夜四句；兩個方向）。
// 五種玩家：A 交往中、B 朋友以上沒交往、C 認識／有點熟、D 沒見過（12/28 才認識的＝acq）、R 美國路線回來時沒在一起的前任。
//   0  讀稿、新檔載得到、index.html 順序、白名單；稿 → 遊戲、遊戲 → 稿；第 6 節換掉的舊句不在遊戲裡；日子的星期
//   1  第 1 節 A 五場（12/24 滷肉飯、1/20 最後一箱、3/28 書桌夜的回信＋4/15 私訊、5/12 游泳早餐店、6/5 修正本）
//   2  第 2 節 B（2/16 借書＋還書、3/3～3/24 受訪阿姨、3/26～4/13 碩一的學妹、6/23 還書、12/25 白天的電話）
//   3  第 3 節 家族（1/10 明信片、3/20 群組＋3/22 讀書會旁聽、6/2 生日群組＋C 典禮、6/29 群組）
//   4  第 4 節 R（2/19～3/2 總圖門口）
//   5  第 5 節 說了沒發生的（g6b 外套、h9b 拍照、情人節補一天、S7-L2 口試前一天、S7-L8 典禮拍照；其他四件在第 1～3 節）
//   6  第 6 節十五處＋書桌夜七句
//   7  第 7、9 節給 BB 的測試項目、2D 背景；舊存檔
// 修改前（開發分支 f07dfb683：git archive 那一版的 index.html、src/、tests/、lib/、tools/ 放進這支測試真的跑過，白名單用新的，稿從這個 repo 讀：AA523_DOCREPO）：FAILED 76、PASS 16
//   （PASS＝讀稿、白名單、日子的星期、1-1 兩個人版等四種不排、1-2 B／C／前任沒有、1-3 第一次去不換、1-3 沒交往沒有私訊、2-1 交往中等三種沒有、2-2 演過以後不坐長椅（本來就沒有那一筆）、3-1 不在群組沒有、
//    5-3 沒有 SIS_VDAY_MAKEUP 照舊三選一、5-4 沒選沒有、5-6～9 不兌現的照設計、6-6 大二照舊兩項、7 現成背景有圖；
//    第 1、2、3、4、6、7 節找不到新事件、SISB16 不存在＝丟例外中斷）。修改後 ALL PASS（138 項）。
// 用法：node tests/aa523_sis_b16_unit.js（在沒有 .git 的目錄跑，設環境變數 AA523_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa518_sis_b15_unit.js：pg_harness 已經載過的不再載；畫 3D 的幾支在 Node 載不進來，跳過）*/
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
const X=()=>typeof SISB16!=='undefined'?SISB16:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(D(d)).wd;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const seqJ=(a,src)=>{ const j=(src||said()).join('\u0001'); let p=0; for(const t of a){ const k=j.indexOf(t,p); if(k<0){ const k2=j.replace(/\u0001/g,'').indexOf(t); if(k2<0) return false; continue; } p=k+t.length; } return true; };   /* 稿同一行的旁白＋台詞，遊戲拆成兩行也算 */
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null, evDone=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const wait=()=>new Promise(r=>setTimeout(r,0));
/* 存檔：kind＝'none'（D 沒見過）／'acq'（12/28 才認識的 D：見過、認識）／'fam'（C 有點熟＝熟悉）／'friend'（B 朋友）／'dating'（A 交往中）／'ex'（前任）*/
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(typeof key==='number'?keyOf(key):key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='acq') SOCIAL.meet(ID,'l118'); else if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  if(met&&typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,ID);
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false; if(typeof SUP497!=='undefined') SUP497.bind(GM); STORY._bindGM(GM);
  H.at(typeof key==='number'?keyOf(key):key,h); return G; };
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(key,h)=>{ at(key,h); ph(); };
const pg=()=>{ PG.rules(GM); ph(); };   /* 畢業以後篇的手機（postgrad3d.js S.MSGS）*/
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const answer=(id,k)=>PHONE.answer(H.G,id,k);
const askOpts=id=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; };
const tickOnly=async(id,picks)=>{ const keep=STORY_EVENTS.slice(), e=ev(id); STORY_EVENTS.length=0; if(e) STORY_EVENTS.push(e); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); let r=false;
  try{ r=!!EVENTS.tick(0.5); for(let i=0;i<50&&EVENTS.running;i++) await wait(); } finally { STORY_EVENTS.length=0; for(const x of keep) STORY_EVENTS.push(x); } return r; };
const place=(x,z,lv)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=lv|0; };
const her=(x,z,lv)=>{ GM.npc[ID]={obj:{position:{x,y:0,z}},lv:lv|0}; };
const zoneOf=G=>{ const s=STORY.schedEnt(CHARACTERS[ID],G||H.G); return s?s.zone+(s.room?'/'+s.room:''):null; };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const inDiscA=()=>{ place(-5.4,-5.4); her(-4.6,-6.0); };   /* 走進法圖討論室 A（同 aa518）*/
const atGate=()=>{ place(84,3); her(83,3); };   /* 總圖門口（她站的地方 [83,3]）*/
const relOf=()=>{ const r=SOCIAL.rel(ID); return {fam:r.fam,trust:r.trust,comf:r.comf,aff:r.aff,resp:r.resp,rom:r.rom,npcRom:r.npcRom}; };
const L=()=>typeof SISB16_LINES!=='undefined'?SISB16_LINES:{};

/* ---------- 讀稿 ---------- */
const SHA='bfede0a62', DOCF='docs/story_planning/AA_523_學姊第十六批_回臺灣以後的最後半年.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA523_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+1):-1; return S.slice(i,j<0?S.length:j); };
const S0=part('## 0. ','## 1. '), S1=part('## 1. A（交往中）','## 2. '), S2=part('## 2. B（朋友以上）','## 3. '), S3=part('## 3. 家族','## 4. '), S4=part('## 4. R','## 5. '), S5=part('## 5. 說了沒發生的','## 6. '), S6=part('## 6. 對不上的','## 7. '), S7=part('## 7. 新旗標','## 8. '), S9=part('## 9. 給 LAWWW、BB');
const sub=(a,b,src)=>part('### '+a,b?'### '+b:null,src);
const SPK=/^(學姊|Kevin|佳穎|學妹)：/;
const qtext=s=>/^（/.test(s)?s:s.replace(SPK,'');   /* 「> 學姊：…」→ 那一句；「> （…）」→ 旁白整句 */
const quotesOf=t=>String(t).split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>qtext(m[1].trim()));
const OPTRE=/^\s*- (「[^」]+」|（[^）]+）)→\s*(.*)$/;
const unwrap=t=>/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
const atoms=r=>String(r).split(/(?:學姊|Kevin|佳穎|學妹)：/).map(x=>x.trim()).filter(x=>x&&!/^電話：?$/.test(x)).map(unwrap);   /* → 後面：說話的人前綴拿掉，旁白、台詞拆開 */
const optsOf=t=>{ const out=[]; for(const l of String(t).split('\n')){ const m=OPTRE.exec(l); if(m) out.push({o:m[1],r:atoms(m[2])}); } return out; };
const PHR=/(?:(?<!她)回|選項)「([^」]+)」(?:→\s*學姊：「([^」]+)」)?/g;   /* 私訊、群組的回覆：「回「好。」排出遊」「回「明天不行。」→ 學姊：「好。我先拆一半。」」「選項「生日快樂。」→ 學姊：「謝謝。」」*/
const BODY=[S1,S2,S3,S4,S5].join('\n');
const QUOTES=quotesOf(BODY), OPTS=optsOf(BODY), PHONES=[...BODY.matchAll(PHR)].map(m=>({o:m[1],r:m[2]||null}));
/* 第 6 節的表：| 6-x | 現在 | 在哪 | 改成 | */
const ROW={}; for(const l of S6.split('\n')){ const c=l.split('|').map(x=>x.trim()); if(/^6-\d+$/.test(c[1]||'')) ROW[c[1]]={now:c[2],where:c[3],to:c[4],toQ:[...String(c[4]).matchAll(/「([^」]+)」/g)].map(x=>x[1])}; }
const DESK4=String(S6.split('書桌夜三句旁白')[1]||'').split('\n').map(l=>/^\s*- (（[^）]+）)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]);   /* 書桌夜加的四句 */
/* 一段：pre＝選項前的句子（> 行）、opts＝[{o,r:[…]}]、post＝選項後的 > 行 */
const blk=t=>{ const out={pre:[],opts:[],post:[]}; for(const raw of String(t).split('\n')){ const m=OPTRE.exec(raw); if(m){ out.opts.push({o:m[1],r:atoms(m[2])}); continue; }
    const q=/^\s*>\s*(.+)$/.exec(raw); if(!q) continue; const s=qtext(q[1].trim()); if(out.opts.length) out.post.push(s); else out.pre.push(s); } return out; };
/* 遊戲這一批的字：新檔（SISB16_LINES、SISB16_EVENTS）＋改在現有檔的字 */
const strDeep=(v,out)=>{ if(v==null) return out; if(typeof v==='string'){ out.push(v); return out; } if(Array.isArray(v)){ v.forEach(x=>strDeep(x,out)); return out; } if(typeof v==='object') for(const k in v) strDeep(v[k],out); return out; };
const evTexts=Lx=>{ const A=[]; for(const l of (Lx||[])){ if(typeof l.text==='string') A.push(l.text); if(l.choice) for(const c of l.choice) A.push(c.text); } return A; };
const aaLines=id=>{ const e=ev(id); const A=[]; for(const l of ((e&&e.dialogue)||[])){ if(l.aa523&&typeof l.text==='string') A.push(l.text); if(l.choice) for(const c of l.choice) if(c.aa523) A.push(c.text); } return A; };
const ladStep=(term,id)=>{ const Lx=LADDER&&LADDER.byTerm&&LADDER.byTerm[term]&&LADDER.byTerm[term][ID]; return Lx&&Lx.steps?Lx.steps.find(s=>s.id===id)||null:null; };
const mine=()=>{ const A=[]; if(typeof SISB16_LINES!=='undefined') strDeep(Object.assign({},SISB16_LINES,{greetUS:null}),[]).filter(t=>!/^[a-z_0-9]+$/.test(t)).forEach(t=>A.push(t));   /* greetUS＝現有那一句（只是給條件用的鍵）；[誰,句子] 的「誰」不算 */
  if(typeof SISB16_EVENTS!=='undefined') for(const e of SISB16_EVENTS) A.push(...evTexts(e.dialogue)); return A; };
const changed=()=>{ const A=[];
  for(const id of ['ev_sis_y4_desks','ev_sis_pickup','ev_sis_w1_late','ev_sis_blank_jan']) A.push(...aaLines(id));
  const s8=ladStep('Y4S2','S7-L8'); if(s8) A.push(s8.choices[1].reply);
  const gb=((LADDER.byTerm.Y4S1[ID]||{}).greet||{}).base||[]; A.push(...gb.filter(t=>t.indexOf('回來了')>=0));
  const h=(HEARD_LINES.talk||[]).find(x=>x.id==='h509_ta_sis'); if(h) A.push(h.t);
  const hv=TERMEND.heart(ID,'Y4S1'); if(hv) A.push(hv.table);
  const p0=TERMEND_LINES.POOL.Y4S1[ID][0]; if(typeof p0==='function') A.push(p0({flags:{EXCHANGE_ROUTE:'TW'},day:D('2028-12-24')}));
  const pg6=((PG_DATES.six||{})[ID]||[]).find(x=>x.ym==='2029-06'); if(pg6) A.push(pg6.line);
  for(const x of (SISB13_LINES.welcomeAsk||[])) A.push(x[1]);
  for(const x of ((FEST_DATA.PEOPLE[ID]||{}).fest||{}).white.dt||[]) if(x.aa523) A.push((/「(.+)」/.exec(x.text)||[])[1]||x.text);   /* 6-14：稿只寫便條上的字（「明年也要。上班以後也要。」），旁白括號是原本那一句的 */
  return A.filter(t=>typeof t==='string'&&t.length); };
const covered=(set,t)=>{ if(set.has(t)||set.has('「'+t+'」')) return true; for(let i=1;i<t.length;i++) if(set.has(t.slice(0,i))&&set.has(t.slice(i))) return true; return false; };   /* 稿同一行的旁白＋台詞，遊戲拆成兩行也算 */

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{ const a=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_523 '+SHA+'：第 0～9 節；第 1 節 1-1～1-5、第 2 節 2-1～2-5、第 3 節 3-1～3-4、第 4 節 4-1、第 5 節 9 點、第 6 節表十五列、書桌夜四句）',
    DOC.length>12000&&S1.indexOf('### 1-5')>0&&S2.indexOf('### 2-5')>0&&S3.indexOf('### 3-4')>0&&S4.indexOf('### 4-1')>0&&/\n9\. \*\*/.test(S5)&&Object.keys(ROW).length===15&&DESK4.length===4&&S9.indexOf('BB：')>0,J({len:DOC.length,rows:Object.keys(ROW),desk:DESK4}));
  { const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_523_/.test(e.path));
    check('0. 劇情匯入白名單有 AA_523（sha '+SHA+'、approved、AA-C 定稿、任務 SIS-B16-1028）；這支測試對同一版的稿',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='SIS-B16-1028'&&/AA-C 定稿/.test(A[0].approvedBy||''),J(A.map(e=>({sha:e.sha,status:e.status,task:e.task})))); }
  check('0. 新檔載得到（SISB16、SISB16_LINES、SISB16_EVENTS）；全部的檔載入沒有錯誤',!loadErr.length&&!!X()&&typeof SISB16_LINES!=='undefined'&&Array.isArray(typeof SISB16_EVENTS!=='undefined'?SISB16_EVENTS:null),J(loadErr));
  check('0. index.html：sis_b15_3d.js → data/sis_b16_events.js → sis_b16_3d.js；在 GAME.boot() 前面',
    /src\/sis_b15_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b16_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b16_3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/sis_b16_3d.js')>0&&a('src/sis_b16_3d.js')<a('<script>GAME.boot();</script>'));
  const G0=mine().concat(changed()), GS=new Set(G0.concat(G0.map(t=>t.replace(/^「|」$/g,''))));
  /* 稿 → 遊戲 */
  const lostQ=QUOTES.filter(t=>!covered(GS,t)), lostO=OPTS.filter(o=>!covered(GS,o.o)&&!covered(GS,o.o.replace(/^「|」$/g,''))), lostR=[].concat(...OPTS.map(o=>o.r)).filter(t=>!covered(GS,t)), lostP=PHONES.filter(p=>!covered(GS,p.o)||(p.r!=null&&!covered(GS,p.r)));
  check('0. 稿 → 遊戲：第 1～5 節每一句「>」（'+QUOTES.length+' 句）都在遊戲裡（AA_527 3-1 明信片兩則換三則：132→133）',QUOTES.length===133&&!lostQ.length,J({n:QUOTES.length,lostQ}));
  check('0. 稿 → 遊戲：每個選項（'+OPTS.length+' 個）、→ 後面的回覆、私訊群組的回覆（'+PHONES.length+' 組）都在遊戲裡',OPTS.length===27&&PHONES.length===8&&!lostO.length&&!lostR.length&&!lostP.length,J({o:OPTS.length,p:PHONES.length,lostO,lostR,lostP}));
  const INLINE=['Shu，謝謝。'];   /* 稿寫在說明句裡的（「」括起來）*/
  check('0. 稿寫在說明裡的句子（1-2 多的那個選項「Shu，謝謝。」）都在稿裡、也在遊戲裡',INLINE.every(t=>DOC.indexOf('「'+t+'」')>=0&&covered(GS,t)),J(INLINE));
  /* 遊戲 → 稿 */
  const notIn=[...new Set(G0)].filter(t=>DOC.indexOf(t)<0&&DOC.indexOf(t.replace(/^「|」$/g,''))<0);
  check('0. 遊戲 → 稿：新檔的每一句、改字（'+new Set(G0).size+' 句）都在稿裡（一字不差）',G0.length>=200&&!notIn.length,J({n:G0.length,notIn}));
  /* 第 6 節換掉的舊句不在遊戲裡（註解除外）*/
  const OLD=[['src/data/sis_b13_events.js',"'學姊回來了！！'"],['src/data/sis_b13_events.js',"'禮拜四家聚 歡迎回來 118 巷那家'"],['src/data/sis_b12_events.js',"'「美國好玩嗎？」'"],['src/data/sis_b12_events.js',"'好玩。……照片你都看過了。'"],
    ['src/data/heard_lines.js',"'書瑀回來第一個週五就來吃飯。她說美國的麵都太軟。'"],['src/data/pg_dates.js','"論文送進圖書館了。櫃台的人蓋了章，說『好，下一位』。……就這樣。"'],['src/data/ladder.js','"先把修正本交出去。之後……還沒想。"'],
    ['src/data/termend_lines.js',"'我現在凌晨三點最清醒。……時差還沒調回來。'"],['src/data/termend_lines.js',"table:'我這學期的計畫本，最後一格還沒寫。'"]];
  const still=OLD.filter(([f,t])=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,''); return t.startsWith('table:')?false:s.indexOf(t)>=0; });
  check('0. 第 6 節換掉的舊句（6-2、6-3、6-5、6-11、6-12、6-13）不在遊戲裡（註解除外）；6-4 舊句只留給其他學期',!still.length,J(still));
  /* 日子的星期（稿寫的）*/
  const WD=[['2028-12-24',7],['2028-12-25',1],['2029-01-10',3],['2029-01-19',5],['2029-01-20',6],['2029-02-16',5],['2029-02-20',2],['2029-03-03',6],['2029-03-20',2],['2029-03-22',4],['2029-03-24',6],['2029-03-28',3],['2029-04-11',3],['2029-04-15',7],['2029-05-11',5],['2029-05-12',6],['2029-05-28',1],['2029-06-04',1],['2029-06-05',2],['2029-06-22',5],['2029-06-23',6],['2029-06-29',5],['2029-07-01',7],['2029-07-02',1]];
  const badWd=WD.filter(([k,w])=>wdOf(k)!==w); check('0. 稿寫的日子和星期都對得上（7/1 是星期日、上班日 7/2 是星期一）',!badWd.length,J(badWd)); });

/* ---- 1 第 1 節 A（交往中）---- */
await sec(1,async()=>{
  /* 1-1 12/24 滷肉飯 */
  { const d=D('2028-12-24'), b=blk(sub('1-1','1-2',S1)), PK={SIS_PICKUP:'lover',SIS_PICKUP_V:'lover',SIS_PICKUP_TMR:true};
    fresh(d,10.5,'dating',PK); ph(); const q0=OUT.get(H.G,'sisb16_lurou'); phAt(d,11.1); ph(); const q=OUT.get(H.G,'sisb16_lurou'), m=byTag('y4_pickup_tmr');
    check('1. 1-1 A 戀人版接機選「先回家睡覺。」：12/24 11:00 收到「滷肉飯。今天。不要再說明天。」以前不排；收到以後排 12:00 公館（ev_sis16_lurou）',!q0&&m.length===1&&m[0].text==='滷肉飯。今天。不要再說明天。'&&!!q&&q.day===d&&q.h===12&&q.place==='公館'&&q.ev==='ev_sis16_lurou',J({q0,q,m:m.map(x=>x.text)}));
    at(d,11.8); await goOut('sisb16_lurou',[0]); const s0=said();
    check('1. 1-1 演：選項前照稿（'+b.pre.length+' 句）、兩個選項照稿；「我的滷蛋給妳。」→「（接過去）……我不客氣了。」；最後「晚上六點半，法圖旁邊。……那頓我會少吃一點。」；記 SIS16_LUROU',
      J(s0.slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&seqJ(b.opts[0].r.concat(b.post))&&H.G.flags.SIS16_LUROU===true&&b.post.length===1,J({s:s0,b}));
    fresh(d,10.5,'dating',PK); ph(); phAt(d,11.1); ph(); at(d,11.8); await goOut('sisb16_lurou',[1]); check('1. 1-1（看她吃）→「（她把整碗吃完，湯也喝了。）」',seqJ(b.opts[1].r.concat(b.post)),J(said()));
    fresh(d,10.5,'dating',PK); ph(); phAt(d,11.1); ph(); phAt(d,13); expire(); ph(); const qm=OUT.get(H.G,'sisb16_lurou'); const nm=(H.G.msgs||[]).filter(x=>/^sisb16_/.test(x.tag||'')).length;
    check('1. 1-1 沒到：不補（沒有新的私訊）',!!qm&&qm.state==='missed'&&nm===0,J({qm,nm}));
    const no=[]; for(const [nm2,kind,fl] of [['兩個人版（朋友）','friend',{SIS_PICKUP:'two',SIS_PICKUP_V:'two',SIS_PICKUP_TMR:true}],['家族共乘','friend',{SIS_PICKUP:'family',SIS_PICKUP_V:'family',SIS_PICKUP_TMR:true}],['沒選先回家睡覺','dating',{SIS_PICKUP:'lover',SIS_PICKUP_V:'lover'}],['接機沒到（mrt）','dating',{SIS_PICKUP:'mrt',SIS_PICKUP_V:'lover',SIS_PICKUP_TMR:true}]]){
      fresh(d,10.5,kind,fl); ph(); phAt(d,11.1); ph(); if(OUT.get(H.G,'sisb16_lurou')) no.push(nm2); }
    check('1. 1-1 兩個人版、家族共乘（這一批只給 A）、沒選「先回家睡覺。」、接機沒到：不排',!no.length,J(no)); }
  /* 1-2 1/20 美國寄回來的最後一箱 */
  { const a=D('2029-01-19'), d=D('2029-01-20'), b=blk(sub('1-2','1-3',S1)), tag='sisb16_box_ask';
    const quotes=quotesOf(sub('1-2','1-3',S1));
    fresh(a,20.8,'dating',{SIS_PICKUP:'lover'}); ph(); const n0=byTag(tag).length; phAt(a,21.3); const M=byTag(tag);
    check('1. 1-2 A：1/19（五）21:00 私訊「美國寄的箱子到了。」「明天下午，來幫我拆。」、回覆「好。」「明天不行。」；21:00 以前沒有',n0===0&&J(M.map(x=>x.text))===J(['美國寄的箱子到了。','明天下午，來幫我拆。'])&&J(askOpts(tag))===J(['好。','明天不行。'])&&Math.abs(M[0].h-21)<0.02,J(M));
    answer(tag,1); ph(); check('1. 1-2「明天不行。」→「好。我先拆一半。」；不排',txt('p:'+ID).slice(-2).join('|')==='明天不行。|好。我先拆一半。'&&!OUT.get(H.G,'sisb16_box'),J(txt('p:'+ID)));
    const run=async(fl,o,picks)=>{ fresh(a,21.1,'dating',fl,o); ph(); answer(tag,0); ph(); const q=OUT.get(H.G,'sisb16_box'); at(d,13.5); await goOut('sisb16_box',picks); return q; };
    const q=await run({SIS_PICKUP:'lover'},{},[0]); const s1=said();
    check('1. 1-2「好。」→ 1/20（六）14:00「學姊的新家」（ev_sis16_box，2 小時）；開頭照稿、臺灣路線戀人版接機＝「（旁邊多了一行小字，是後來補的：「出口有人。」）」、（收下）→「（杯子很重。……）」、最後「箱子空了。……晚上吃什麼。」；記 SIS16_BOX',
      !!q&&q.day===d&&q.h===14&&q.ev==='ev_sis16_box'&&seq(['（她家的客廳。地上一個紙箱，貼滿了海關的單子。）','海運。十月寄的，今天才到。','（最後一格寫著「回臺灣」。）','（旁邊多了一行小字，是後來補的：「出口有人。」）','一個給你。……我買了兩個。','（杯子很重。她把另一個放進廚房的櫃子。）','箱子空了。……晚上吃什麼。'])&&!has('（旁邊多了一行小字，是後來補的：「旁邊的人睡得比我好。」）')&&H.G.flags.SIS16_BOX===true&&J(H.opts[0])===J(['（收下）']),J({q,s:s1,o:H.opts}));
    await run({},{route:'US'},[0]); const sU=said(); await run({SIS_PICKUP:'two'},{},[0]); const sT=said(); await run({SIS_PICKUP:'lover'},{route:'JP'},[0]); const sJ=said(); await run({SIS_PICKUP:'mrt'},{},[0]); const sM=said();
    check('1. 1-2 美國路線＝「旁邊的人睡得比我好。」；日本路線戀人版＝「出口有人。」；兩個人版、接機沒到＝沒有那一行',sU.includes('（旁邊多了一行小字，是後來補的：「旁邊的人睡得比我好。」）')&&!sU.includes('（旁邊多了一行小字，是後來補的：「出口有人。」）')&&sJ.includes('（旁邊多了一行小字，是後來補的：「出口有人。」）')&&!sT.some(t=>/旁邊多了一行小字/.test(t))&&!sM.some(t=>/旁邊多了一行小字/.test(t)),J({sU,sT}));
    await run({SIS_PICKUP:'lover',SIS16_H3B:true,SIS16_COAT:true},{},[1]); const sS=said(), oS=H.opts[0];
    check('1. 1-2 h3b 的玩家多一個選項「Shu，謝謝。」→「……（她沒有抬頭。）只准在這個房間。」記 SIS16_SHU；接機借了外套（SIS16_COAT）的會合前「（她從椅背上拿起一件外套。）」「你的。洗過了。」',
      J(oS)===J(['（收下）','「Shu，謝謝。」'])&&seq(['……（她沒有抬頭。）只准在這個房間。','（她從椅背上拿起一件外套。）','你的。洗過了。','箱子空了。……晚上吃什麼。'])&&H.G.flags.SIS16_SHU===true&&!has('（杯子很重。她把另一個放進廚房的櫃子。）'),J({oS,sS}));
    check('1. 1-2 稿的每一句都演得到（各種玩家合起來）',quotes.filter(t=>!['美國寄的箱子到了。','明天下午，來幫我拆。'].includes(t)).every(t=>sS.concat(s1,sU).includes(t)),J(quotes.filter(t=>!sS.concat(s1,sU).includes(t))));
    fresh(a,21.1,'dating'); ph(); answer(tag,0); ph(); ROM.end(H.G,ID,'test'); at(d,10); ph(); const qq=OUT.get(H.G,'sisb16_box'); check('1. 1-2 1/20 已經不在交往：取消',!!qq&&qq.state==='cancelled',J(qq));
    const no=[]; for(const [nm,kind] of [['朋友（B）','friend'],['熟悉（C）','fam'],['前任','ex']]){ fresh(a,21.1,kind); ph(); if(byTag(tag).length) no.push(nm); } check('1. 1-2 B、C、前任：沒有',!no.length,J(no)); }
  /* 1-3 研究單位回信了（書桌夜）*/
  { const b=blk(sub('1-3','1-4',S1)), q4=quotesOf(sub('1-3','1-4',S1)), JOB=q4.slice(0,3);
    const desk=async(key,n,picks,fl)=>{ fresh(key,21,'dating',Object.assign({SIS_DESK_NIGHTS:n},fl||{})); await runEv('ev_sis_y4_desks',picks); };
    await desk('2029-03-28',2,[0]); const sJ=said();
    check('1. 1-3 3/28（三）書桌夜（第三次以上＝again 那一段）：輪流的旁白換成研究單位的回信（照稿）、三個選項；「恭喜。」→「嗯。……我還沒跟我爸說。」；會合兩句；記 SIS16_JOB_A；這一晚不說輪流那一句',
      seq(JOB.concat(b.opts[0].r,['論文還是要先寫完。','（她把信關掉，第四章回到螢幕上。）']))&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&!!H.G.flags.SIS16_JOB_A&&!has('（她起來倒水，順便把你的杯子也加滿，沒說話。）')&&H.G.flags.SIS_DESK_NIGHTS===3,J({s:sJ,o:H.opts}));
    for(let k=1;k<3;k++){ await desk('2029-03-28',2,[k]); check('1. 1-3 選項 '+b.opts[k].o+' → '+b.opts[k].r.join('／'),seqJ(b.opts[k].r.concat(['論文還是要先寫完。'])),J(said())); }
    await desk('2029-03-28',0,[0]); const f0=H.G.flags.SIS16_JOB_A; const s0=said();
    check('1. 1-3 3/28 是第一次去（第一次的全套）：不換（只換 again 那一段）；之後第一個有去的週三再演（子代理解讀）',!f0&&!s0.includes(JOB[0])&&s0.includes('（晚上十一點半。她還在打字，螢幕上是「第四章　第二節」。）'),J(s0));
    await desk('2029-04-04',1,[0]); const s44=said(); await desk('2029-04-11',4,[0]); const s411=said(); await desk('2029-04-18',4,[0]); const s418=said(); await desk('2029-04-11',4,[0],{SIS16_JOB_A:'desk'}); const sDone=said();
    check('1. 1-3 3/28 沒去：4/4、4/11 第一個有去的週三照演；4/18 不演（到 4/11）；演過的不再演（輪流旁白照舊）',s44.includes(JOB[0])&&s411.includes(JOB[0])&&!s418.includes(JOB[0])&&!sDone.includes(JOB[0])&&sDone.includes('（她把頭髮夾起來，又放下來。）'),J({s44,s418}));
    const d15=D('2029-04-15'); fresh(d15,20.8,'dating'); ph(); const n0=byTag('sisb16_job_dm').length; phAt(d15,21.3); const M=byTag('sisb16_job_dm');
    check('1. 1-3 4/11 以前都沒演到：4/15（日）21:00 私訊兩則（照稿）、也記 SIS16_JOB_A',n0===0&&J(M.map(x=>x.text))===J(['研究單位那邊回信了。七月二號報到。','……本來想在研究室跟你說。'])&&Math.abs(M[0].h-21)<0.02&&H.G.flags.SIS16_JOB_A==='msg',J(M));
    fresh(d15,21.1,'dating',{SIS16_JOB_A:'desk'}); ph(); const M2=byTag('sisb16_job_dm'); fresh(d15,21.1,'friend'); ph(); const M3=byTag('sisb16_job_dm');
    check('1. 1-3 書桌夜聽過的、沒交往的：4/15 沒有私訊',!M2.length&&!M3.length,J([M2,M3])); }
  /* 1-4 5/12 游泳、早餐店 */
  { const a=D('2029-05-11'), d=D('2029-05-12'), b=blk(sub('1-4','1-5',S1)), tag='sisb16_swim_ask';
    fresh(a,20.8,'dating'); ph(); const n0=byTag(tag).length; phAt(a,21.1); const M=byTag(tag);
    check('1. 1-4 A：5/11（五）21:00 私訊「明天早上七點，新體育館。」「你不用下水。看台有位子。」、回覆「好。」「明天不行。」',n0===0&&J(M.map(x=>x.text))===J(['明天早上七點，新體育館。','你不用下水。看台有位子。'])&&J(askOpts(tag))===J(['好。','明天不行。']),J(M));
    answer(tag,1); ph(); check('1. 1-4「明天不行。」→「好。」；不排',txt('p:'+ID).slice(-2).join('|')==='明天不行。|好。'&&!OUT.get(H.G,'sisb16_swim'),J(txt('p:'+ID)));
    const run=async(fl,o,picks)=>{ fresh(a,21.1,'dating',fl,o); ph(); answer(tag,0); ph(); const q=OUT.get(H.G,'sisb16_swim'); at(d,6.7); await goOut('sisb16_swim',picks); return q; };
    const q=await run({SIS16_JOB_A:'desk'},{},[0]); const s1=said();
    const pre=b.pre.filter(t=>!['明天早上七點，新體育館。','你不用下水。看台有位子。','在美國想到的就是這一家。','……現在補。'].includes(t));
    check('1. 1-4「好。」→ 5/12（六）07:00 新體育館（ev_sis16_swim）；游泳池、門口、早餐店照稿；「妳游得很快。」→「沒有。是池子短。」；聽過回信的「七月以後，早上要上班。……」；記 SIS16_SWIM_A',
      !!q&&q.day===d&&q.h===7&&q.place==='新體育館'&&J(s1.slice(0,pre.length))===J(pre)&&seqJ(b.opts[0].r.concat(['七月以後，早上要上班。……游泳要改到晚上了。']))&&!has('在美國想到的就是這一家。')&&H.G.flags.SIS16_SWIM_A===true,J({q,s:s1,pre}));
    await run({},{},[1]); const s2=said();
    check('1. 1-4「頭髮還在滴水。」→「七點半要到研究室。乾不了。」；沒有 SIS16_JOB_A 的最後一句換「七月要去上班了。研究單位。……游泳要改到晚上了。」',seqJ(b.opts[1].r.concat(['七月要去上班了。研究單位。……游泳要改到晚上了。']))&&!s2.includes('七月以後，早上要上班。……游泳要改到晚上了。'),J(s2));
    await run({SIS16_JOB_A:'desk',SIS16_DAY40_SHOP:true},{route:'US'},[0]); const sU=said(); await run({SIS16_JOB_A:'desk'},{route:'US'},[0]); const sU0=said(); await run({SIS16_JOB_A:'desk',SIS16_DAY40_SHOP:true},{},[0]); const sTW=said();
    check('1. 1-4 美國路線、第四十天選「想什麼？」的：「……半年。」後面多「在美國想到的就是這一家。」「……現在補。」；美國路線沒選、臺灣路線沒有',sU.indexOf('在美國想到的就是這一家。')===sU.indexOf('……半年。')+1&&sU.indexOf('……現在補。')===sU.indexOf('……半年。')+2&&!sU0.includes('在美國想到的就是這一家。')&&!sTW.includes('在美國想到的就是這一家。'),J({sU,sU0}));
    /* 第四十天的回覆記 SIS16_DAY40_SHOP（sis_b13_3d.js sisb13_day40；PHONE.ON_ANSWER）*/
    fresh('2028-09-11',22.2,'dating',{},{route:'US'}); PHONE.post(H.G,{th:'p:'+ID,from:ID,text:'……想。一點點。',ask:{id:'sisb13_day40',opts:(SISB13_LINES.day40Opts||[]).map(o=>({t:o.t,say:[{from:ID,text:o.r}]}))}}); answer('sisb13_day40',0); const f1=H.G.flags.SIS16_DAY40_SHOP;
    fresh('2028-09-11',22.2,'dating',{},{route:'US'}); PHONE.post(H.G,{th:'p:'+ID,from:ID,text:'……想。一點點。',ask:{id:'sisb13_day40',opts:(SISB13_LINES.day40Opts||[]).map(o=>({t:o.t,say:[{from:ID,text:o.r}]}))}}); answer('sisb13_day40',1); const f2=H.G.flags.SIS16_DAY40_SHOP;
    fresh('2029-05-12',7,'dating',{},{route:'US'}); PHONE.post(H.G,{th:'p:'+ID,from:ID,text:'x',ask:{id:'sisb13_day40',opts:[{t:'想什麼？'},{t:'我過去。'}]}}); const mm=H.G.msgs.find(x=>x.ask&&x.ask.id==='sisb13_day40'); mm.ans=0; const old=X().day40Shop(H.G);
    check('1. 1-4 第四十天選「想什麼？」記 SIS16_DAY40_SHOP（「我過去。」不記）；之前的存檔照手機裡那一則的回覆',f1===true&&!f2&&old===true&&(SISB13_LINES.day40Opts||[])[0].r==='家裡樓下那家早餐店。……很奇怪，平常我都沒吃。',J([f1,f2,old]));
    const no=[]; for(const [nm,kind] of [['朋友','friend'],['熟悉','fam']]){ fresh(a,21.1,kind); ph(); if(byTag(tag).length) no.push(nm); } check('1. 1-4 B、C：沒有',!no.length,J(no)); }
  /* 1-5 6/5 修正本 */
  { const a=D('2029-06-04'), d=D('2029-06-05'), b=blk(sub('1-5','## 2. ',S1)), tag='sisb16_rev_dm'; b.pre=b.pre.filter(t=>!['明天晚上七點，研究室。','修正本。你說要陪的。','我自己刪完了。'].includes(t));   /* 私訊、沒到那一則不在場景裡 */
    /* 6/2 研究室生日：選「修正本我陪妳改。」記 SIS16_REV_PROMISE */
    fresh('2029-06-02',20.5,'dating'); H.picks=[0]; H.said=[]; H.opts=[]; await PG.bdayScene(GM,'outing'); const f0=H.G.flags.SIS16_REV_PROMISE, s0=said();
    fresh('2029-06-02',20.5,'dating'); H.picks=[1]; await PG.bdayScene(GM,'outing'); const f1=H.G.flags.SIS16_REV_PROMISE;
    check('1. 1-5 6/2 研究室生日（交往中）選「修正本我陪妳改。」（她回「今天不改了。明天再說。」）記 SIS16_REV_PROMISE；別的選項不記',f0===true&&s0.includes('今天不改了。明天再說。')&&!f1,J({f0,f1}));
    fresh(a,20.8,'dating',{SIS16_REV_PROMISE:true}); ph(); const n0=byTag(tag).length; phAt(a,21.1); ph(); const M=byTag(tag), q=OUT.get(H.G,'sisb16_rev');
    check('1. 1-5 6/4（一）21:00 私訊「明天晚上七點，研究室。」「修正本。你說要陪的。」（不用回）→ 排 6/5（二）19:00 研究室（ev_sis16_rev，到 23:00）',n0===0&&J(M.map(x=>x.text))===J(['明天晚上七點，研究室。','修正本。你說要陪的。'])&&!M[1].ask&&!!q&&q.day===d&&q.h===19&&q.ev==='ev_sis16_rev'&&(ev('ev_sis16_rev')||{}).hours===4,J({M,q}));
    at(d,18.7); const h0=H.G.hour; await goOut('sisb16_rev',[0]); const s1=said();
    check('1. 1-5 演：照稿；「第三章比較的那一段。」→「……那一段我最喜歡。（停了一下）好。刪。」；「（十一點。……頁數是 122。）」「一百二十二頁。……這禮拜印。」；記 SIS16_REV',J(s1.slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&seqJ(b.opts[0].r.concat(b.post))&&H.G.flags.SIS16_REV===true,J({s:s1,b}));
    for(let k=1;k<3;k++){ fresh(a,21.1,'dating',{SIS16_REV_PROMISE:true}); ph(); ph(); at(d,18.7); await goOut('sisb16_rev',[k]); check('1. 1-5 選項 '+b.opts[k].o+' → '+b.opts[k].r.join('／'),seqJ(b.opts[k].r.concat(b.post)),J(said())); }
    fresh(a,21.1,'dating',{SIS16_REV_PROMISE:true}); ph(); ph(); phAt(d,20); expire(); phAt(d,23.3); const MM=byTag('sisb16_rev_miss');
    check('1. 1-5 沒到：6/5 23:00「我自己刪完了。」',MM.length===1&&MM[0].text==='我自己刪完了。'&&Math.abs(MM[0].h-23)<0.02&&MM[0].day===d,J(MM));
    fresh(a,21.1,'dating',{SIS16_REV_PROMISE:true}); ph(); ph(); ROM.end(H.G,ID,'test'); at(d,10); ph(); const qq=OUT.get(H.G,'sisb16_rev'); expire(); phAt(d,23.5);
    check('1. 1-5 6/5 已經不在交往：取消、沒有 23:00 那一則',!!qq&&qq.state==='cancelled'&&!byTag('sisb16_rev_miss').length,J(qq));
    fresh(a,21.1,'dating'); ph(); check('1. 1-5 沒說「修正本我陪妳改。」：沒有私訊',!byTag(tag).length); } });

/* ---- 2 第 2 節 B ---- */
await sec(2,async()=>{
  /* 2-1 下學期要的書 */
  { const a=D('2029-02-16'), d=D('2029-02-20'), due=D('2029-03-15'), tag='sisb16_book_ask', b=blk(sub('2-1','2-2',S2));
    const setup=(key,h,kind,fl,o)=>{ fresh(key,h,kind,fl,o); SOCIAL.remember(ID,'SIS_BLANK_JAN',''); };
    setup(a,20.8,'friend'); ph(); const n0=byTag(tag).length; phAt(a,21.1); const M=byTag(tag);
    check('2. 2-1 演過 12-7、沒交往：2/16（五）21:00 私訊「你下學期要的書，還沒說。」、兩個回覆（期限 2/19 21:00）',n0===0&&M.length===1&&M[0].text==='你下學期要的書，還沒說。'&&J(askOpts(tag))===J(['有一本，我找了很久。','我自己借就好。'])&&M[0].ask.until===T(D('2029-02-19'),21),J(M));
    answer(tag,1); ph(); check('2. 2-1「我自己借就好。」→「好。」；不排',txt('p:'+ID).slice(-2).join('|')==='我自己借就好。|好。'&&!OUT.get(H.G,'sisb16_book')&&!H.G.flags.SIS16_BOOK,J(txt('p:'+ID)));
    setup(a,21.1,'fam'); ph(); answer(tag,0); ph(); const q=OUT.get(H.G,'sisb16_book');
    check('2. 2-1 C（熟悉）也有；「有一本，我找了很久。」→「書名傳給我。……禮拜二五點，總圖門口。」、記 SIS16_BOOK、排 2/20（二）17:00 總圖門口',txt('p:'+ID).slice(-1)[0]==='書名傳給我。……禮拜二五點，總圖門口。'&&H.G.flags.SIS16_BOOK===true&&!!q&&q.day===d&&q.h===17&&q.place==='總圖門口',J(q));
    at(d,16.8); await goOut('sisb16_book',[]); const s1=said();
    check('2. 2-1 2/20 總圖門口：照稿四句（她把書遞過來、「三月十五號以前還。……我會記得。」、計畫本那一格寫「書」）；記拿到書',J(s1)===J(b.post.length?quotesOf(sub('2-1','2-2',S2)).slice(1,5):s1)&&s1.length===4&&H.G.flags.SIS16_BOOK_GOT===d,J(s1));
    /* 還書：Café 找她說話 */
    at('2029-03-01',19.5); H.G.zone='cafe'; await SISY23.preTalk(GM); const r1=H.G.flags.SIS16_BOOK_RET; phAt(due,21.2); const n1=byTag('sisb16_book_due').length;
    check('2. 2-1 3/15 以前在 Café 找她說話＝還了（不另外演）；3/15 21:00 沒有「書。」',r1===D('2029-03-01')&&n1===0,J({r1,n1}));
    setup(a,21.1,'friend'); ph(); answer(tag,0); ph(); at(d,16.8); await goOut('sisb16_book',[]); at('2029-03-05',13); H.G.zone='lawlib'; await SISY23.preTalk(GM); phAt(due,21.2); const M2=byTag('sisb16_book_due');
    check('2. 2-1 沒有在 Café、總圖找她（法圖不算）：3/15 21:00「書。」、回「明天還。」→「好。」',!H.G.flags.SIS16_BOOK_RET&&M2.length===1&&M2[0].text==='書。'&&J(askOpts('sisb16_book_due'))===J(['明天還。'])&&(answer('sisb16_book_due',0),txt('p:'+ID).slice(-1)[0]==='好。'),J(M2));
    setup(a,21.1,'friend'); ph(); answer(tag,0); ph(); at(d,16.8); at(d,17.8); expire(); phAt(d+1,12.3); const MB=byTag('sisb16_book_miss');
    check('2. 2-1 2/20 沒到：2/21 12:00「書放在 Café 櫃台。說是學姊放的就好。」',MB.length===1&&MB[0].text==='書放在 Café 櫃台。說是學姊放的就好。'&&MB[0].day===d+1&&Math.abs(MB[0].h-12)<0.02,J(MB));
    setup(a,21.1,'friend'); ph(); answer(tag,0); ph(); at(d,16.8); await goOut('sisb16_book',[]); at('2029-03-02',17.1); H.G.zone='campus'; place(84,3); await SISY23.preTalk(GM); const r3=H.G.flags.SIS16_BOOK_RET;
    check('2. 2-1 總圖門口（大門 15 m 以內）找她說話也算還了',r3===D('2029-03-02'),J(r3));
    const no=[]; for(const [nm,kind,mem] of [['交往中（A）','dating',true],['前任','ex',true],['沒演過 12-7','friend',false]]){ fresh(a,21.1,kind); if(mem) SOCIAL.remember(ID,'SIS_BLANK_JAN',''); ph(); if(byTag(tag).length) no.push(nm); }
    check('2. 2-1 交往中、前任、沒演過 12-7：沒有',!no.length,J(no)); }
  /* 2-2 受訪阿姨的那一段（週六上午，傅鐘旁邊的長椅）*/
  { const e=ev('ev_sis16_reader'), b=blk(sub('2-2','2-3',S2));
    fresh('2029-03-03',10.5,'friend',{},{zone:'campus'}); const s=STORY.schedEnt(CHARACTERS[ID],H.G);
    check('2. 2-2 作息：3/3～3/24 週六 10:00～12:00 她坐在傅鐘旁邊的長椅（campus，seatAt [-46,21]）；演過以後照平常',!!s&&s.zone==='campus'&&J(s.seatAt)===J([-46,21])&&e.weekday[0]===6&&J(e.time)===J([10,12]),J(s));
    place(-45,22); her(-46,21); const ran=await tickOnly('ev_sis16_reader',[0]); const s1=said();
    check('2. 2-2 B（朋友）走到她旁邊：演；照稿、三個選項；「很努力的人。」→「嗯。……她自己也會這樣說。」；會合三句；記 SIS16_READER；一次',ran&&J(s1.slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&seqJ(b.opts[0].r.concat(b.post))&&H.G.flags.SIS16_READER===true&&!EVENTS.check(e),J({s:s1,o:H.opts}));
    const s2=STORY.schedEnt(CHARACTERS[ID],H.G); check('2. 2-2 演過以後：長椅那一筆不再用（照平常週六上午在校園）',!!s2&&!(s2.seatAt&&s2.seatAt[0]===-46),J(s2));
    for(let k=1;k<3;k++){ fresh('2029-03-10',10.5,'friend',{},{zone:'campus'}); await runEv('ev_sis16_reader',[k]); check('2. 2-2 選項 '+b.opts[k].o+' → '+b.opts[k].r.join('／'),seqJ(b.opts[k].r.concat(b.post)),J(said())); }
    const no=[]; for(const [nm,key,kind] of [['C（熟悉）','2029-03-03','fam'],['A（交往中）','2029-03-03','dating'],['前任','2029-03-03','ex'],['3/31','2029-03-31','friend'],['週日','2029-03-04','friend']]){ fresh(key,10.5,kind,{},{zone:'campus'}); place(-45,22); her(-46,21); if(EVENTS.check(e)) no.push(nm); }
    check('2. 2-2 C、A、前任、3/24 以後、別的星期：沒有',!no.length,J(no)); }
  /* 2-3 碩一的學妹 */
  { const e=ev('ev_sis16_junior'), b=blk(sub('2-3','2-4',S2));
    for(const kind of ['friend','fam']){ fresh('2029-03-26',17.1,kind,{},{zone:'campus'}); atGate(); const ran=await tickOnly('ev_sis16_junior',[0]); const s1=said();
      check('2. 2-3 '+(kind==='friend'?'B':'C')+'：3/26～4/13 平日 17:00～17:30 總圖門口第一次走過去：演（照稿、學妹兩句、兩個選項）；記 SIS16_JUNIOR；一次',ran&&J(s1.slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&seqJ(b.opts[0].r.concat(b.post))&&H.G.flags.SIS16_JUNIOR===true&&!EVENTS.check(e)&&H.said[1].who==='學妹',J({s:s1,w:H.said[1]})); }
    fresh('2029-04-13',17.1,'friend',{},{zone:'campus'}); await runEv('ev_sis16_junior',[1]); check('2. 2-3「她很幸運。」→「……她問的問題都很好。是她自己想出來的。」',seqJ(b.opts[1].r.concat(b.post)),J(said()));
    const no=[]; for(const [nm,key,kind] of [['D（認識）','2029-03-26','acq'],['A','2029-03-26','dating'],['前任','2029-03-26','ex'],['3/23','2029-03-23','friend'],['4/16（P15 的日子）','2029-04-16','friend'],['週六','2029-03-31','friend']]){ fresh(key,17.1,kind,{},{zone:'campus'}); atGate(); if(EVENTS.check(e)) no.push(nm); }
    check('2. 2-3 D、A、前任、3/26 以前、4/14 以後、週末：沒有',!no.length,J(no)); }
  /* 2-4 6/23 還書 */
  { const a=D('2029-06-22'), d=D('2029-06-23'), tag='sisb16_return_ask', b=blk(sub('2-4','2-5',S2));
    fresh(a,21.9,'friend'); ph(); const n0=byTag(tag).length; phAt(a,22.1); const M=byTag(tag);
    check('2. 2-4 B：6/22（五）22:00 私訊「明天早上十點，法圖。」「我借的書要全部還掉。……一個人搬不動。」、回覆「好。」「明天不行。」（期末最後一頓 19:00 之後）',n0===0&&J(M.map(x=>x.text))===J(['明天早上十點，法圖。','我借的書要全部還掉。……一個人搬不動。'])&&J(askOpts(tag))===J(['好。','明天不行。']),J(M));
    answer(tag,1); ph(); check('2. 2-4「明天不行。」→「好。我分兩趟。」',txt('p:'+ID).slice(-1)[0]==='好。我分兩趟。'&&!OUT.get(H.G,'sisb16_return'));
    const run=async kind=>{ fresh(a,22.1,kind); ph(); answer(tag,0); ph(); const q=OUT.get(H.G,'sisb16_return'); at(d,9.7); await goOut('sisb16_return',[]); return q; };
    const q=await run('friend'); const sB=said(); await run('dating'); const sA=said();
    const core=quotesOf(sub('2-4','2-5',S2)).slice(2,9);
    check('2. 2-4「好。」→ 6/23（六）10:00 法圖門口（ev_sis16_return）；照稿七句；B 多「謝謝。……這種事，不好意思找家族。」；A 多「（走出法圖，她回頭看了一下門口。）」「……走吧。今天沒有要寫的東西。」；記 SIS16_RETURN',
      !!q&&q.day===d&&q.h===10&&q.place==='法圖門口'&&J(sB.slice(0,core.length))===J(core)&&sB.slice(-1)[0]==='謝謝。……這種事，不好意思找家族。'&&!sB.includes('……走吧。今天沒有要寫的東西。')&&J(sA.slice(-2))===J(['（走出法圖，她回頭看了一下門口。）','……走吧。今天沒有要寫的東西。'])&&!sA.includes('謝謝。……這種事，不好意思找家族。')&&H.G.flags.SIS16_RETURN===true,J({sB,sA,core}));
    fresh(a,22.1,'fam'); ph(); check('2. 2-4 C（熟悉）：沒有',!byTag(tag).length); }
  /* 2-5 12/25 白天的電話 */
  { const d=D('2028-12-25'), tag='sisb16_day_call_ask', q5=quotesOf(sub('2-5','## 3. ',S2));
    fresh(d,13.9,'friend',{SIS16_T7B:true}); ph(); const n0=byTag(tag).length; phAt(d,14.1); const M=byTag(tag);
    check('2. 2-5 B、臺灣路線、美國那一通選了 t7b：12/25（一，行憲紀念日）14:00「白天了。」、回覆「（打過去）」「晚一點打。」（期限當天 18:00）',wdOf(d)===1&&n0===0&&M.length===1&&M[0].text==='白天了。'&&J(askOpts(tag))===J(['（打過去）','晚一點打。'])&&M[0].ask.until===T(d,18),J(M));
    answer(tag,0); ph(); const q=OUT.get(H.G,'sisb16_day_call'); const sentMe=txt('p:'+ID).includes('（打過去）');
    check('2. 2-5「（打過去）」→ 電話（出遊「打給她」，現在）；不替你傳那一句',!!q&&q.call===true&&q.verb==='打給她'&&q.day===d&&!sentMe,J(q));
    await goOut('sisb16_day_call',[]); check('2. 2-5 電話照稿三句',J(said())===J(q5.slice(1,4))&&q5.length===4,J({s:said(),q5}));
    fresh(d,14.2,'friend',{SIS16_T7B:true}); ph(); answer(tag,1); ph(); check('2. 2-5「晚一點打。」→「好。」；不打',txt('p:'+ID).slice(-1)[0]==='好。'&&!OUT.get(H.G,'sisb16_day_call'));
    const no=[]; for(const [nm,kind,fl,o] of [['美國路線','friend',{SIS16_T7B:true},{route:'US'}],['交往中','dating',{SIS16_T7B:true}],['沒選 t7b','friend',{}],['前任','ex',{SIS16_T7B:true}]]){ fresh(d,14.2,kind,fl,o); ph(); if(byTag(tag).length) no.push(nm); }
    check('2. 2-5 美國路線、交往中、沒選 t7b、前任：沒有',!no.length,J(no));
    const vc=(ev('ev_sis_video')||{}).dialogue||[], t7=vc.find(l=>l.choice&&l.choice.some(c=>c.text==='「那換我打給妳。」'));
    check('2. 2-5 美國那一通 t7 選「那換我打給妳。」記 SIS16_T7B（r2y4b_events.js ev_sis_video）',!!t7&&J(t7.choice.find(c=>c.text==='「那換我打給妳。」').set)===J({SIS16_T7B:true}),J(t7&&t7.choice)); } });

/* ---- 3 第 3 節 家族 ---- */
await sec(3,async()=>{
  /* 3-1 1/10 明信片 */
  { const d=D('2029-01-10'); fresh(d,20.8,'none'); ph(); const n0=byTag('sisb16_postcard').length; phAt(d,21.1); const M=byTag('sisb16_postcard'), want=quotesOf(sub('3-1','3-2',S3));
    check('3. 3-1 1/10（三）21:00 家族群組七則（照稿；Kevin、學姊、佳穎——AA_527 1-2 後兩則換三則）；D（沒見過）也收得到；21:00 以前沒有',n0===0&&J(M.map(m=>m.text))===J(want)&&J(M.map(m=>m.from))===J(['kevin','kevin','kevin',ID,'kevin','family_junior',ID])&&want.length===7,J({M:M.map(m=>[m.from,m.text]),want}));
    fresh(d,21.1,'friend',{},{grp:false}); ph(); check('3. 3-1 不在家族群組：沒有',!byTag('sisb16_postcard').length); }
  /* 3-2 3/20 群組、3/22 讀書會 */
  { const a=D('2029-03-20'), d=D('2029-03-22'), e=ev('ev_sis16_study_visit'), b=blk(sub('3-2','3-3',S3));
    fresh(a,20.4,'none'); ph(); const n0=byTag('sisb16_visit_ask').length; phAt(a,20.8); const M=byTag('sisb16_visit_ask');
    check('3. 3-2 3/20（二）20:30 家族群組（Kevin 兩則、佳穎「我沒有說」）；在 21:00 學姊的私訊之前',n0===0&&J(M.map(m=>[m.from,m.text]))===J([['kevin','禮拜四讀書會 學姊說她要來旁聽'],['kevin','佳穎說她不緊張'],['family_junior','我沒有說']])&&Math.abs(M[0].h-20.5)<0.02,J(M));
    fresh(d,19.5,'friend',{},{zone:'lawlib'}); const z=zoneOf();
    check('3. 3-2 作息：3/22（四）19:00～21:00 她在法圖討論室 A（21:00 以後照舊 Café）',z==='lawlib/discA'&&(at(d,21.2),zoneOf())==='cafe',z);
    const pre=b.pre.filter(t=>!['禮拜四讀書會 學姊說她要來旁聽','佳穎說她不緊張','我沒有說'].includes(t));
    for(const kind of ['dating','friend','fam','acq']){ fresh(d,19.5,kind,{},{zone:'lawlib'}); inDiscA(); const r0=relOf(); const ran=await tickOnly('ev_sis16_study_visit',[0]); const s1=said(), r1=relOf();
      check('3. 3-2 '+({dating:'A',friend:'B',fam:'C',acq:'D（12/28 才認識）'})[kind]+'：走進討論室 A 演（照稿 '+pre.length+' 句、兩個選項）；記 SIS16_STUDY_VISIT；熟悉 +3、安心 +1'+(kind==='acq'?'；演完到「熟悉」':''),
        ran&&J(s1.slice(0,pre.length))===J(pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&seqJ(b.opts[0].r)&&H.G.flags.SIS16_STUDY_VISIT===true&&r1.comf===r0.comf+1&&(kind==='acq'?SOCIAL.stage(ID)==='FAMILIAR'&&r1.fam===20:r1.fam===Math.max(r0.fam+3,20))&&!EVENTS.check(e),J({s:s1,r0,r1,st:SOCIAL.stage(ID)})); }
    fresh(d,19.5,'friend',{},{zone:'lawlib'}); await runEv('ev_sis16_study_visit',[1]); check('3. 3-2「她講得很好。」→「嗯。你跟她說。她會比較相信你。」',seqJ(b.opts[1].r),J(said()));
    const who=H.said.filter(x=>x.t==='在！'||x.t==='……知道。'||x.t==='（散會的時候）學姊，剛剛那樣可以嗎？'||x.t==='今天的題目……（看了最後一排一眼）……學姊，妳不要看我。').map(x=>x.who);
    check('3. 3-2 說話的人：佳穎（family_junior「佳穎」）、Kevin',J(who)===J(['佳穎','佳穎','Kevin','Kevin']),J(who));
    const no=[]; for(const [nm,kind,o,pos,key] of [['前任','ex'],['不在家族群組','friend',{grp:false}],['D 沒見過','none'],['在討論室外面','friend',{},'out'],['3/29','friend',{},null,'2029-03-29']]){ fresh(key||d,19.5,kind,{},Object.assign({zone:'lawlib'},o||{})); inDiscA(); if(pos==='out') place(-5.4,-3.9); if(EVENTS.check(e)) no.push(nm); }
    check('3. 3-2 前任、不在家族群組、沒見過、在討論室外面、別的週四：沒有',!no.length,J(no)); }
  /* 3-3 6/2 生日群組、C 典禮上看她一眼 */
  { const g=D('2029-06-02'); const bday=(kind,fl,o)=>{ fresh(g,19.2,kind,fl,o); PG.rec(H.G).done.grad=1; at(g,19.6); pg(); return byTag('pg_kevin_bday'); };
    const res={}; for(const kind of ['dating','friend','fam','acq','ex']){ const M=bday(kind); res[kind]={n:M.length,ask:M[0]&&M[0].ask?M[0].ask.opts.map(o=>o.t):null,out:!!OUT.get(H.G,'pg_sis_bday')}; }
    check('3. 3-3 Kevin 19:30「學姊今天生日，研究室，八點半。」家族群組的人都收到（A、B、C、D、前任）；研究室（出遊）照舊只有朋友以上；C、D 只能回「生日快樂。」；前任照舊傳不傳',
      ['dating','friend','fam','acq','ex'].every(k=>res[k].n===1)&&res.friend.out&&!res.fam.out&&!res.acq.out&&!res.ex.out&&J(res.fam.ask)===J(['生日快樂。'])&&J(res.acq.ask)===J(['生日快樂。'])&&res.friend.ask==null&&J(res.ex.ask)===J(['傳一句生日快樂','不傳']),J(res));
    bday('fam'); answer('pg_sis_bday_cd',0); const T3=txt('g:family_law').slice(-2);
    check('3. 3-3 C 回「生日快樂。」→ 學姊「謝謝。」（在家族群組）',J(T3)===J(['生日快樂。','謝謝。'])&&(H.G.msgs||[]).slice(-1)[0].from===ID,J(T3));
    const e=ev('ev_sis16_ceremony'), line=quotesOf(sub('3-3','3-4',S3));
    fresh(g,13.5,'fam',{},{zone:'campus'}); place(-34,12.5); const ran=await tickOnly('ev_sis16_ceremony');
    check('3. 3-3 C（熟悉、在家族群組）6/2 13:00～14:30 走到椰林大道：旁白一句（照稿）；一次',ran&&J(said())===J(line)&&line.length===1&&!EVENTS.check(e),J(said()));
    const no=[]; for(const [nm,kind,o,pos,h] of [['B（朋友：有保溫瓶那一段）','friend'],['A','dating'],['D（認識）','acq'],['前任','ex'],['不在家族群組','fam',{grp:false}],['不在椰林大道','fam',{},'away'],['14:30 以後','fam',{},null,14.6]]){ fresh(g,h||13.5,kind,{},Object.assign({zone:'campus'},o||{})); place(-34,12.5); if(pos==='away') place(30,-60); if(EVENTS.check(e)) no.push(nm); }
    check('3. 3-3 B、A、D、前任、不在家族群組、不在椰林大道、14:30 以後：沒有',!no.length,J(no)); }
  /* 3-4 6/29 */
  { const d=D('2029-06-29'); fresh(d,20.8,'none'); ph(); const n0=byTag('sisb16_work_eve').length; phAt(d,21.1); const M=byTag('sisb16_work_eve'), want=quotesOf(sub('3-4','## 4. ',S3));
    check('3. 3-4 6/29（五）21:00 家族群組六則（照稿；「學姊下禮拜一上班了」＝7/2）',n0===0&&J(M.map(m=>m.text))===J(want)&&J(M.map(m=>m.from))===J(['kevin','kevin',ID,'family_junior',ID,ID]),J(M.map(m=>[m.from,m.text]))); } });

/* ---- 4 第 4 節 R ---- */
await sec(4,async()=>{
  const e=ev('ev_sis16_ex_door'), b=blk(sub('4-1','## 5. ',S4));
  const R=(key,h,fl,o,brk)=>{ fresh(brk||'2028-11-15',10,'ex',fl,Object.assign({route:'US',zone:'campus'},o||{})); at(key,h); atGate(); };
  R('2029-02-20',17.1); const r0=relOf(); const ran=await tickOnly('ev_sis16_ex_door',[0]); const s1=said(), r1=relOf();
  check('4. 4-1 R（美國路線、回來時沒在一起的前任）2/19～3/2 平日 17:00～17:30 總圖門口：演（照稿、三個選項）；記 SIS16_EX_DOOR；關係不加不減；一次',
    ran&&J(s1.slice(0,b.pre.length))===J(b.pre)&&J(H.opts[0])===J(b.opts.map(o=>o.o))&&seqJ(b.opts[0].r.concat(b.post))&&H.G.flags.SIS16_EX_DOOR===true&&J(r0)===J(r1)&&!EVENTS.check(e),J({s:s1,r0,r1}));
  for(let k=1;k<3;k++){ R('2029-02-21',17.1); await runEv('ev_sis16_ex_door',[k]); check('4. 4-1 選項 '+b.opts[k].o+' → '+b.opts[k].r.join('／'),seqJ(b.opts[k].r.concat(b.post)),J(said())); }
  const no=[]; const tryR=(nm,key,h,fl,o,brk,extra)=>{ R(key,h,fl,o,brk); if(extra) extra(); if(EVENTS.check(e)) no.push(nm); };
  tryR('臺灣路線的前任','2029-02-20',17.1,{},{route:'TW'}); tryR('12/23 以後才分開的','2029-02-20',17.1,{},{},'2029-01-10');
  tryR('演過 4-1 她要的時間','2029-02-20',17.1,{},{},null,()=>{ H.G.flags.SIS_REBUILD=D('2029-02-01'); });
  tryR('3/5（3/2 以後）','2029-03-05',17.1); tryR('週六','2029-02-24',17.1); tryR('17:30 以後','2029-02-20',17.6);
  fresh('2029-02-20',17.1,'friend',{},{route:'US',zone:'campus'}); atGate(); if(EVENTS.check(e)) no.push('朋友（不是前任）');
  check('4. 4-1 臺灣路線、12/23 以後才分開、在走 4-1、3/2 以後、週末、17:30 以後、不是前任：沒有',!no.length,J(no)); });

/* ---- 5 第 5 節 說了沒發生的 ---- */
await sec(5,async()=>{
  const pick=async(v,fl,o,picks)=>{ fresh('2028-12-23',20.4,v==='lover'?'dating':'friend',Object.assign({SIS_PICKUP_V:v},fl||{}),o); await runEv('ev_sis_pickup',picks||[0]); return said(); };
  /* 1 g6b 外套 */
  { const COAT=['（你把帶來的外套遞給她。她穿上，袖子長了一截。）','……剛好。'];
    const sT=await pick('two',{SIS16_G6B:true}); const fT=H.G.flags.SIS16_COAT; const sL=await pick('lover',{SIS16_G6B:true}); const fL=H.G.flags.SIS16_COAT; const sJ=await pick('lover',{SIS16_G6B:true,SIS_JP_COAT:true},{route:'JP'});
    const sF=await pick('family',{SIS16_G6B:true}); const fF=H.G.flags.SIS16_COAT; const sN=await pick('lover',{}); const fN=H.G.flags.SIS16_COAT;
    check('5. 1 g6b（12/9 視訊「要我帶什麼？」→「外套。」）：兩個人版第一句旁白後面多兩句、記 SIS16_COAT',sT.indexOf(COAT[0])===sT.indexOf('（她推著行李推車走出來。看到你，停了一下。）')+1&&sT.indexOf(COAT[1])===sT.indexOf(COAT[0])+1&&fT===true,J(sT.slice(0,4)));
    check('5. 1 戀人版：放開以後（「（很久，她才放開。）」後面、日本路線外套那四句以前；子代理解讀）；家族共乘、沒選 g6b：沒有',sL.indexOf(COAT[0])===sL.indexOf('（很久，她才放開。）')+1&&fL===true&&sJ.indexOf(COAT[1])+1===sJ.indexOf('（你穿的是三月她塞進你背包的那件外套。）')&&!sF.includes(COAT[0])&&!fF&&!sN.includes(COAT[0])&&!fN,J({sL:sL.slice(0,5),sJ:sJ.slice(0,8)}));
    const vg=(ev('ev_sis_video_gf')||{}).dialogue||[], g6=vg.find(l=>l.choice&&l.choice.some(c=>c.text==='「要我帶什麼？」')), h3=vg.find(l=>l.choice&&l.choice.some(c=>c.text==='「Shu 很好聽。」')), h9=vg.find(l=>l.choice&&l.choice.some(c=>c.text==='「還是開一下。」'));
    check('5. 1、2 和 1-2：女朋友視訊選 g6b、h3b、h9b 記 SIS16_G6B、SIS16_H3B、SIS16_H9B（r2y4b_events.js ev_sis_video_gf）',!!g6&&!!h3&&!!h9&&J(g6.choice[1].set)===J({SIS16_G6B:true})&&J(h3.choice[1].set)===J({SIS16_H3B:true})&&J(h9.choice[1].set)===J({SIS16_H9B:true}),J([g6&&g6.choice,h3&&h3.choice,h9&&h9.choice]));
    /* 1/20 還外套（1-2 已經查過有 SIS16_COAT 的兩句）*/ }
  /* 2 h9b 回程車上 */
  { const L9='（回程的高速公路上，她舉起手機，對著開車的你拍了一張。沒有開閃光燈。）'; const s1=await pick('lover',{SIS16_H9B:true}); const s2=await pick('two',{SIS16_H9B:true}); const s3=await pick('lover',{});
    check('5. 2 戀人版、選過 h9b：回程車上多一句旁白（車上那一段的第一句；子代理解讀）；兩個人版、沒選：沒有',s1.includes(L9)&&s1.indexOf(L9)<s1.indexOf('……不行，看前面。')&&s1.indexOf(L9)>s1.indexOf('（很久，她才放開。）')&&!s2.includes(L9)&&!s3.includes(L9),J(s1)); }
  /* 3 情人節補一天 */
  { fresh('2029-02-14',22.4,'dating'); await runEv('ev_sis_vday_y4',[0]); const f1=H.G.flags.SIS_VDAY_MAKEUP; fresh('2029-02-14',22.4,'dating'); await runEv('ev_sis_vday_y4',[1]); const f0=H.G.flags.SIS_VDAY_MAKEUP;
    check('5. 3 2/14 電話選「開學以後，我們再補一天。」（她「嗯。……那一天我來寫。」）記 SIS_VDAY_MAKEUP；陪她待著不記',f1===true&&!f0);
    const d27=D('2029-04-27'), d28=d27+1; fresh(d27,20.8,'dating',{SIS_VDAY_MAKEUP:true}); ph(); const n0=byTag('r3_sis_dayoff').length; phAt(d27,21.1); ph(); const M=byTag('r3_sis_dayoff'), q=OUT.get(H.G,'r3_sis_dayoff');
    check('5. 3 有 SIS_VDAY_MAKEUP：4/27 21:00 那則換成三句（照稿）、不給選項；直接排 4/28 河堤 10:00（ev_sis_y4_dayoff_river）',n0===0&&J(M.map(m=>m.text))===J(['明天我不寫論文。','……二月說好要補的那一天。我寫好了。','河堤，十點。我騎很慢。'])&&!M.some(m=>m.ask)&&!!q&&q.day===d28&&q.h===10&&q.ev==='ev_sis_y4_dayoff_river',J({M,q}));
    phAt(d28,9.2); check('5. 3 沒有「沒回」那一段（16:00 河邊的照片）',!byTag('r3_sis_dayoff_none').length&&H.G.flags.SIS_DAY_OFF_PLAN==='river');
    fresh(d27,21.1,'dating'); ph(); const M0=byTag('r3_sis_dayoff'); check('5. 3 沒有 SIS_VDAY_MAKEUP：照舊三選一',M0.length===2&&M0[1].text==='……你排。去哪裡都可以。'&&J(askOpts('r3_sis_dayoff')).indexOf('河堤')>=0,J(M0)); }
  /* 4 S7-L2 口試前一天 */
  { const s2=ladStep('Y4S2','S7-L2'); const Gx={flags:{}}; STORY.ladReply(s2,s2.choices[0],Gx,ID); const Gy={flags:{}}; STORY.ladReply(s2,s2.choices[1],Gy,ID); const Gz={flags:{}}; STORY.ladReply(s2,s2.choices[0],Gz,'heroine_01');
    check('5. 4 階梯 S7-L2 選「那現在還好嗎？」（她「現在還好。口試前大概不會好，到時候你再問。」）記 SIS7_ASK_LATER；別的選項、別人的不記',s2.choices[0].t==='「那現在還好嗎？」'&&s2.choices[0].reply==='現在還好。口試前大概不會好，到時候你再問。'&&Gx.flags.SIS7_ASK_LATER===true&&!Gy.flags.SIS7_ASK_LATER&&!Gz.flags.SIS7_ASK_LATER,J([Gx.flags,Gy.flags]));
    const d=D('2029-05-28'); for(const kind of ['dating','friend']){ fresh(d,21.9,kind,{SIS7_ASK_LATER:true}); ph(); const n0=byTag('sisb16_ask_later').length; phAt(d,22.3); const M=byTag('sisb16_ask_later');
      check('5. 4 '+(kind==='dating'?'A':'B')+'：5/28（一）22:00 私訊「明天口試。」「……你可以問了。」、回覆「現在還好嗎？」「早點睡。」（21:00 群組、私訊之後）',n0===0&&J(M.map(m=>m.text))===J(['明天口試。','……你可以問了。'])&&J(askOpts('sisb16_ask_later'))===J(['現在還好嗎？','早點睡。'])&&Math.abs(M[0].h-22)<0.02,J(M)); }
    answer('sisb16_ask_later',0); const r0=txt('p:'+ID).slice(-1)[0]; fresh(d,22.1,'friend',{SIS7_ASK_LATER:true}); ph(); answer('sisb16_ask_later',1); const r1=txt('p:'+ID).slice(-1)[0];
    check('5. 4「現在還好嗎？」→「不好。……比四月好。」；「早點睡。」→「嗯。」',r0==='不好。……比四月好。'&&r1==='嗯。',J([r0,r1]));
    const no=[]; for(const [nm,kind,fl] of [['沒記 SIS7_ASK_LATER','friend',{}],['C（熟悉）','fam',{SIS7_ASK_LATER:true}],['前任','ex',{SIS7_ASK_LATER:true}]]){ fresh(d,22.1,kind,fl); ph(); if(byTag('sisb16_ask_later').length) no.push(nm); }
    check('5. 4 沒選、C、前任：沒有',!no.length,J(no)); }
  /* 5 S7-L8 典禮拍照 */
  { const s8=ladStep('Y4S2','S7-L8'); const Gx={flags:{}}; STORY.ladReply(s8,s8.choices[0],Gx,ID); const Gy={flags:{}}; STORY.ladReply(s8,s8.choices[1],Gy,ID);
    check('5. 5 階梯 S7-L8 選「一起參加典禮。」（她「嗯。那天記得拍照。」）記 SIS7_PHOTO',s8.choices[0].reply==='嗯。那天記得拍照。'&&Gx.flags.SIS7_PHOTO===true&&!Gy.flags.SIS7_PHOTO);
    const th=async fl=>{ fresh('2029-06-02',12,'friend',fl); H.said=[]; H.opts=[]; H.picks=[]; await PG.thermos(GM); return said(); };
    const s1=await th({SIS7_PHOTO:true}), s0=await th({});
    check('5. 5 6/2 保溫瓶那一段最後多兩句「（拿出手機）……拍照。說好的。」「（照片裡，你們兩個都穿著借來的衣服。）」；沒選的沒有',J(s1.slice(-2))===J(['（拿出手機）……拍照。說好的。','（照片裡，你們兩個都穿著借來的衣服。）'])&&s1.includes('每天帶出門。')&&!s0.includes('（拿出手機）……拍照。說好的。'),J({s1,s0})); }
  /* 6～9 在第 1～3 節查過（1-5、2-1、2-5、3-1、3-2）*/
  check('5. 6～9 不兌現的三件照設計（除夕「明年，你來包一顆。」、二月那一頁、h3b「Shu」只給一個選項）：沒有加別的事件',!STORY_EVENTS.some(e=>/^ev_sis16_/.test(e.id)&&/除夕|包一顆/.test(J(e.dialogue))));
});

/* ---- 6 第 6 節 ---- */
await sec(6,async()=>{
  const s3=ladStep('Y4S2','S7-L3'); check('6. 6-1 S7-L3「研究室有人在白板上幫我倒數口試」週次 [9,14]（4/16 起）、第 14 週以後跳過照舊',!!s3&&J(s3.week)===J([9,14])&&s3.skipAfterWeek===14&&(ROW['6-1']||{}).to.indexOf('[9,14]')>=0,J(s3&&{w:s3.week,s:s3.skipAfterWeek}));
  const s8=ladStep('Y4S2','S7-L8'); check('6. 6-2 S7-L8 選項②「畢業以後要做什麼？」→「先把修正本交出去。七月，去上班。」（週次 [12,15] 在 3/28 回信以後）',!!s8&&s8.choices[1].reply==='先把修正本交出去。七月，去上班。'&&(ROW['6-2']||{toQ:[]}).toQ.includes(s8.choices[1].reply)&&J(s8.week)===J([12,15]),J(s8&&s8.choices));
  { const h=(HEARD_LINES.talk||[]).find(x=>x.id==='h509_ta_sis'); fresh('2029-01-12',12,'fam'); const w0=HEARD.inWin(H.G,h); at('2029-01-13',12); const w1=HEARD.inWin(H.G,h);
    check('6. 6-3 陳助教「書瑀回來休息了兩個禮拜，才來吃飯。她說美國的麵都太軟。」從 2029-01-13 起',!!h&&h.t==='書瑀回來休息了兩個禮拜，才來吃飯。她說美國的麵都太軟。'&&h.from==='2029-01-13'&&w0===false&&w1===true&&(ROW['6-3']||{toQ:[]}).toQ.includes(h.t),J({h,w0,w1})); }
  { const t4=TERMEND.heart(ID,'Y4S1'), t3=TERMEND.heart(ID,'Y3S2'), t2=TERMEND.heart(ID,'Y2S1');
    check('6. 6-4 心意版期末飯 大四上「這學期的計畫本寫完了。……下學期那本，第一頁還是空的。」；其他學期照舊',t4.table==='這學期的計畫本寫完了。……下學期那本，第一頁還是空的。'&&t3.table==='我這學期的計畫本，最後一格還沒寫。'&&t2.table==='我這學期的計畫本，最後一格還沒寫。'&&t3.decline==='好。那出發前再約。',J([t4.table,t3.table])); }
  { const c=(PG_DATES.six[ID]||[]).find(x=>x.ym==='2029-06'); check('6. 6-5 學姊 2029-06 那一格「修正本改完了。這禮拜印，下禮拜交。」（pg_dates.js 照 import_pg_dates.py 產生，來源寫 AA_523）',!!c&&c.line==='修正本改完了。這禮拜印，下禮拜交。'&&/AA_523/.test(J(PG_DATES.source)),J(c)); }
  { const e=ev('ev_sis_w1_late'), b6=ROW['6-6']||{toQ:[]}; const w1=async(key,k)=>{ fresh(key,19.5,'none',{},{zone:'cafe'}); const t=e.title; await runEv('ev_sis_w1_late',[k]); return {t,o:H.opts[0],s:said()}; };
    const y1=await w1('2026-07-15',0), y2=await w1('2026-10-14',0), y3=await w1('2027-10-13',0), y4=await w1('2029-03-07',0);
    check('6. 6-6 W1 晚到版照第一次見面那一年換：大二（含大一升大二的暑假）「大一太忙了。」→「嗯。大一都很忙。……我也是。」、標題「晚了一年」',y1.t==='直屬學姊（晚了一年）'&&y2.t==='直屬學姊（晚了一年）'&&J(y2.o)===J(['「大一太忙了。」','「我不知道去哪裡找學姊。」'])&&y2.s.includes('嗯。大一都很忙。……我也是。'),J([y1,y2]));
    check('6. 6-6 大三「之前一直沒遇到。」→「嗯。……現在遇到了。」、標題「晚了兩年」；大四「四年都沒遇到。」→「……那還來得及。我六月才畢業。」、標題「晚了三年」（稿）',
      y3.t==='直屬學姊（晚了兩年）'&&J(y3.o)===J(['「之前一直沒遇到。」','「我不知道去哪裡找學姊。」'])&&y3.s.includes('嗯。……現在遇到了。')&&y4.t==='直屬學姊（晚了三年）'&&J(y4.o)===J(['「四年都沒遇到。」','「我不知道去哪裡找學姊。」'])&&y4.s.includes('……那還來得及。我六月才畢業。')&&['之前一直沒遇到。','嗯。……現在遇到了。','四年都沒遇到。','……那還來得及。我六月才畢業。'].every(t=>b6.toQ.includes(t)),J([y3,y4]));
    const fy=await w1('2027-10-13',1); check('6. 6-6 選項②照舊「我不知道去哪裡找學姊。」→「晚上我大多在 Café 或法圖。……不難找。」',fy.s.includes('晚上我大多在 Café 或法圖。……不難找。')); }
  /* 6-7～6-9 她們主動約你（HASK）*/
  { const dW=D('2029-01-06'); fresh('2029-01-03',12,'dating',{},{route:'US'});
    const o0=HASK.storyAsk(H.G,ID,dW,'o'); OUT.plan(H.G,{id:'t_out',ev:'ev_sis16_box',day:dW,h:11.5,place:'x',title:'x'}); const o1=HASK.storyAsk(H.G,ID,dW,'o');
    fresh('2029-01-03',12,'dating',{},{route:'US'}); OUT.plan(H.G,{id:'t_dt',ev:'ev_sis16_box',day:dW,h:11.5,place:'x',title:'x',dateTrip:'tr1'}); const o2=HASK.storyAsk(H.G,ID,dW,'o');
    fresh('2029-01-03',12,'dating',{},{route:'US'}); PHONE.at(H.G,D('2029-01-03'),21,[{th:'p:'+ID,from:ID,text:'x',ask:{id:'t_gift',until:T(dW,10),opts:[{t:'好。'}]}}],'t_gift'); const o3=HASK.storyAsk(H.G,ID,dW,'o'); const o3b=HASK.storyAsk(H.G,ID,dW+7,'o');
    check('6. 6-7 HASK：那一週有她的劇情出遊（OUT，事件的 participants 有她）、或排好要傳的劇情私訊（回覆期限在那一週）＝不約；校外約會（dateTrip）照 DATE；別的週照舊',o0===false&&o1===true&&o2===false&&o3===true&&o3b===false,J([o0,o1,o2,o3,o3b]));
    /* AA_523 第 10 節（28c56dfdc）：大四下每週三的書桌夜（ev_sis_y4_desks，r3_3d.js 排的 r3_desk_*）不算劇情出遊——那一週她照樣主動約 */
    { const dd=D('2029-03-07'); fresh('2029-03-05',12,'dating',{},{route:'US'}); OUT.plan(H.G,{id:'r3_desk_t',ev:'ev_sis_y4_desks',day:dd,h:21,place:'x',title:'x'}); const o4=HASK.storyAsk(H.G,ID,dd,'o');
      check('6. 6-7（第 10 節）：那一週只有書桌夜（ev_sis_y4_desks）＝不擋，她照樣主動約；排除名單只有書桌夜',o4===false&&HASK.OUT_SKIP instanceof Set&&HASK.OUT_SKIP.size===1&&HASK.OUT_SKIP.has('ev_sis_y4_desks'),J({o4,skip:HASK.OUT_SKIP?[...HASK.OUT_SKIP]:null})); }
    /* 傳的時候再看一次：中午排好的，晚上多了伴手禮那則＝這次不傳 */
    const p5=HASK_DATA.people[ID], e5=p5.out.find(x=>x.dat); fresh('2029-01-03',22.6,'dating',{},{route:'US'}); const rec={sid:901,id:ID,k:'o',vk:'dat',loc:e5.loc,day:dW,depart:e5.dat.depart,kind:'half',send:{day:D('2029-01-03'),h:22.5},state:'planned'};
    HASK.rec(H.G).sent.push(rec); OUT.plan(H.G,{id:'t_out2',ev:'ev_sis16_box',day:dW,h:11.5,place:'x',title:'x'}); const f1=HASK.fire(H.G,rec);
    fresh('2029-01-03',22.6,'dating',{},{route:'US'}); const rec2=Object.assign({},rec,{sid:902,state:'planned'}); HASK.rec(H.G).sent.push(rec2); const f2=HASK.fire(H.G,rec2);
    check('6. 6-7 HASK.fire：排好以後那一週多了她的劇情出遊＝這次不傳（dropped）；沒有＝照傳',f1===false&&rec.state==='dropped'&&f2===true&&rec2.state==='sent',J([f1,rec.state,f2,rec2.state]));
    fresh('2029-02-12',12,'friend'); const P=HASK.PERIOD[ID]; const cny=['2029-02-12','2029-02-13','2029-02-16'].map(k=>P(H.G,D(k))), out=['2029-02-11','2029-02-17'].map(k=>P(H.G,D(k)));
    check('6. 6-8 2029 春節 2/12～2/16 她不主動約（sisCny）；2/11、2/17 照舊',cny.every(x=>x==='sisCny')&&out.every(x=>x===''),J({cny,out}));
    fresh('2028-11-15',10,'ex',{},{route:'US'}); at('2029-02-20',12); const x0=P(H.G,D('2029-02-24')); H.G.flags.SIS_REBUILD=D('2029-02-20'); const x1=P(H.G,D('2029-02-24'));
    fresh('2029-02-20',12,'friend'); const x2=P(H.G,D('2029-02-24'));
    check('6. 6-9 前任：不收（sisEx），等「4-1 她要的時間」這一次分開演過（SIS_REBUILD）才收；沒分開過照舊',x0==='sisEx'&&x1===''&&x2==='',J([x0,x1,x2])); }
  { const gb=LADDER.byTerm.Y4S1[ID].greet.base, US=L().greetUS, BK=L().greetBack, GI=STORY.LADDER_GREET_IF;
    fresh('2028-12-22',12,'friend'); const b0=[GI[US]&&GI[US].test(H.G),GI[BK]&&GI[BK].test(H.G)]; at('2028-12-24',12); const b1=[GI[US].test(H.G),GI[BK].test(H.G)];
    check('6. 6-10 大四上招呼：base 有回來以後那一句「（她把保溫瓶遞過來）……回來了。這邊的飲水機有熱水。」（ladder.js，import_ladder.py 疊上去）；12/23 以前說美國那一句、回來以後（12/24）說新的那一句',gb.includes(BK)&&gb.includes(US)&&gb.indexOf(BK)===gb.indexOf(US)+1&&J(b0)===J([true,false])&&J(b1)===J([false,true])&&(ROW['6-10']||{toQ:[]}).toQ.includes(BK),J({gb,b0,b1}));
    let got=[]; fresh('2028-12-24',12,'friend',{},{zone:'cafe'}); for(let i=0;i<12;i++){ H.G.social.greetUsed={}; H.G.day=D('2028-12-24'); const t=STORY.ladGreet(H.G,ID); if(t) got.push(t); H.G.social.ladder=H.G.social.ladder||{}; H.G.social.ladder[ID+'@Y4S1']=(H.G.social.ladder[ID+'@Y4S1']|0)+1; }
    check('6. 6-10 12/24 在臺灣找她說話：招呼不會出現「這邊的飲水機只有冰的。」',got.length>0&&!got.includes(US),J(got)); }
  { const W=SISB13_LINES.welcomeAsk; check('6. 6-11 12/26 家族群組 Kevin 第一句「禮拜四家聚！」、第二句「歡迎學姊回來 118 巷那家」',J(W)===J([['k','禮拜四家聚！'],['k','歡迎學姊回來 118 巷那家']])&&(ROW['6-11']||{toQ:[]}).toQ.includes('禮拜四家聚！')&&(ROW['6-11']||{toQ:[]}).toQ.includes('歡迎學姊回來 118 巷那家'),J(W)); }
  { fresh('2029-01-08',19.5,'fam',{},{zone:'cafe'}); await runEv('ev_sis_blank_jan',[0,2]); const o=H.opts[1]||[];
    check('6. 6-12 12-7 選項換「回來以後，習慣嗎？」→「……法圖的椅子比較矮。」（「美國好玩嗎？」沒有了）',o.includes('「回來以後，習慣嗎？」')&&!o.includes('「美國好玩嗎？」')&&has('……法圖的椅子比較矮。')&&!has('好玩。……照片你都看過了。'),J({o,s:said()})); }
  { const f=TERMEND_LINES.POOL.Y4S1[ID][0]; const tw=f({flags:{EXCHANGE_ROUTE:'TW'}}), us=f({flags:{EXCHANGE_ROUTE:'US'}}); fresh('2028-12-24',18,'friend',{},{route:'US'}); const us2=f(H.G);
    check('6. 6-13 期末飯話題第一句（非美國）「行李箱還沒收。打開它，就要整理美國的資料。」；美國版「回來那班飛機，你睡得比我好。」照舊',tw==='行李箱還沒收。打開它，就要整理美國的資料。'&&us2==='回來那班飛機，你睡得比我好。'&&(ROW['6-13']||{toQ:[]}).toQ.includes(tw),J([tw,us,us2])); }
  { const run=async y=>{ fresh(y+'-03-14',13,'dating'); H.said=[]; await FEST.play(GM,{id:ID,k:'white',y}); return said(); };
    const s29=await run(2029), s28=await run(2028), s27=await run(2027);
    check('6. 6-14 白色情人節交往版：2029 年那一張「（背面寫著：「上班以後也要。」）」（AA_527 1-1：便條一張一句）；2027、2028 照舊「明年也要。」',s29.includes('（背面寫著：「上班以後也要。」）')&&!s29.includes('（背面寫著：「明年也要。」）')&&s28.includes('（背面寫著：「明年也要。」）')&&s27.includes('（背面寫著：「明年也要。」）'),J({s29,s28}));
    const yrs=FEST.YEARS&&FEST.YEARS.white; check('6. 6-14（LAWWW 順便查）白色情人節交往中每年都演（FEST.YEARS.white 2026～2029、學姊沒有 dedicated 擋）',J(yrs)===J([2026,2027,2028,2029])&&!((FEST_DATA.PEOPLE[ID].fest.white||{}).dedicated),J(yrs)); }
  { fresh('2028-12-25',15,'friend'); const W=[]; for(let i=0;i<7;i++) W.push(X().winterLine(H.G)); at('2029-02-19',15); const after=X().winterLine(H.G); at('2028-12-24',15); const before=X().winterLine(H.G);
    const want=(ROW['6-15']||{toQ:[]}).toQ;
    check('6. 6-15 大四寒假（2028-12-25～2029-02-18）找她說話：六句照順序輪流（照稿）；開學、12/24 不用',J(W.slice(0,6))===J(want)&&W[6]===want[0]&&want.length===6&&after===null&&before===null,J({W,want}));
    const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); check('6. 6-15 story3d.js talkSis：閒聊階梯沒有的時候先問 SISB16.winterLine',/SISB16\.winterLine\(G\):null; if\(w\)\{ await GM\.say\(n,w\); \}/.test(st)); }
  { const n7=[]; for(let n=1;n<=8;n++){ fresh('2029-04-25',21,'dating',{SIS_DESK_NIGHTS:n,SIS16_JOB_A:'desk'}); await runEv('ev_sis_y4_desks',[0]); n7.push(said().find(t=>/^（/.test(t)&&t!=='我爸週六會過來，他要請吃飯。')); }
    const R7=['（十一點。她的螢幕上還是第四章。你的筆記寫到第三頁。）','（她起來倒水，順便把你的杯子也加滿，沒說話。）','（十一點半，她伸了一個懶腰。「今天到這裡。」）'].concat(DESK4);
    check('6. 書桌夜三句旁白加四句（照稿），七句照順序輪流（第 1～3 次和原本一樣）',J(n7)===J(R7.concat([R7[0]]))&&DESK4.length===4,J({n7,R7})); } });

/* ---- 7 第 7、9 節給 BB 的測試項目、2D 背景；舊存檔 ---- */
await sec(7,async()=>{
  const sb=fs.readFileSync(path.join(H.ROOT,'tests/scene_bg_keys_unit.js'),'utf8');
  check('7. 新體育館游泳池的 2D 背景＝gym_pool：OUT.BG 登記 image:null（深色底＋地點字幕）、tests/scene_bg_keys_unit.js 的 PENDING 有（BB 跟使用者要圖）',!!OUT.BG.gym_pool&&OUT.BG.gym_pool.image===null&&OUT.bg('gym_pool')==='dark'&&/gym_pool:'BB 要圖（AA_523/.test(sb),J(OUT.BG.gym_pool));
  const KEYS=['sis_new_home','linze_prof_hall','law_library_gate','library_gate_day','law_library','soymilk_shop','gongguan'], bad=KEYS.filter(k=>!(OUT.BG[k]&&OUT.BG[k].image));
  check('7. 現成的背景都有圖：她的新家（12/31 那一張）、研究室、法圖門口、總圖門口、法圖討論室（AA_518 那一張 law_library）、早餐店（豆漿店）、公館',!bad.length,J(bad));
  const used=new Set(); for(const e of SISB16_EVENTS) for(const l of e.dialogue) if(l.scene!==undefined&&l.bg) used.add(l.bg);
  check('7. 這一批的 2D 場景只用這幾張（新體育館門口：P17 是 3D，沒有 2D 的圖＝深色底＋地點字幕，子代理解讀）',[...used].every(k=>KEYS.includes(k)||k==='gym_pool'||k==='dark'),J([...used]));
  check('7. 稿第 9 節給 BB：新體育館游泳池、1-4 是 A 唯一看她游泳的一場——1-4 只有 A 有（私訊只給交往中）',/新體育館游泳池/.test(S9)&&/1-4/.test(S9));
  /* 舊存檔：沒有新旗標照常跑、不丟例外 */
  let err=null; try{ const G=fresh('2028-12-23',23,'dating',{SIS_PICKUP:'lover'}); delete G.flags.SIS16_LUROU; for(const k of ['2028-12-24','2029-01-10','2029-01-19','2029-02-16','2029-03-20','2029-03-28','2029-04-15','2029-05-11','2029-05-28','2029-06-04','2029-06-22','2029-06-29']){ phAt(k,21.5); phAt(k,22.5); }
    STORY.ladReply(ladStep('Y4S2','S7-L2'),ladStep('Y4S2','S7-L2').choices[0]); X().bookReturn(GM); X().planNote({flags:{}}); X().day40Shop({flags:{}}); X().winterLine({flags:{},day:D('2028-12-26')});
    fresh('2026-03-04',12,'none'); ph(); for(const e of SISB16_EVENTS) EVENTS.check(e); }catch(e){ err=String(e&&e.stack||e).slice(0,300); }
  check('7. 舊存檔：沒有 SIS16_ 旗標照常跑（半年的手機規則、階梯、條件），不丟例外；新的一局沒有 SIS16_ 旗標',!err&&!Object.keys(H.G.flags).some(k=>/^SIS16_/.test(k)),err||J(Object.keys(H.G.flags).filter(k=>/^SIS16_/.test(k))));
  const lk=fs.readFileSync(path.join(H.ROOT,'src/sis_b16_3d.js'),'utf8'); check('7. sis_b16_3d.js 沒有新的模組鎖（busy／running）：用 EVENTS 的 auto、出遊、手機，讀檔不會卡（tests/loadgen_locks_unit.js）',!/\blet\s+(busy|running|playing)\b/.test(lk));
});
H.done();
})();
