// AA_520 予樂自己的線：辦活動的人不在照片裡（企劃線 481dd8238；AA-C 2026-10-28 定稿，D109；任務 NPC-STORY2-1028、USER_WANTS X119）——不需要瀏覽器。
//   src/data/yule_lines.js（YULE_LINES、YULE_EVENTS）、src/yule3d.js（YULE）；第 2 節在 src/data/heard_lines.js（h503_yule 兩句、h509_yule 的選項）＋src/heard3d.js（ask、COND.yuleOwn）。
// 玩家：A 和可昕交往中、B 沒和可昕交往過（朋友）、C 和可昕分開了（ROM.end）、D 慢慢分手以後照朋友（KXDRIFT.frOn）、E 被抓包（退回朋友／坦白以後分開）、F 沒見過予樂。
//   0  讀稿、白名單（481dd8238 approved）、新檔載得到、index.html 順序（heard3d.js → data/yule_lines.js → yule3d.js，在 GAME.boot() 前面）；
//      稿 → 遊戲（第 2～6 節每一句「>」、每個選項、表格裡的回覆）、遊戲 → 稿（新檔每一句、h503 兩句、h509 選項與回覆、事件每一句與選項）；日子對星期
//   1  第 1 節誰收得到：交往中、朋友照傳；分開了從那天起不傳（之前的照傳）；慢慢分手照朋友＝下一學期起照傳（同一學期不傳、照朋友那天在寒暑假算前一學期）；
//      被抓包＝一律不傳（之後重新交往也不傳）；沒見過予樂不傳；原有八則照原本的條件（分開了照樣收到）；人在國外照當地時間收
//   2  第 2 節：原有八則都在、條件不變；h503_yule 三則（後面兩句是 AA_520）
//   3  第 3 節十三則：每一則的時間、p:yule、逐字（{if} 那幾則兩種都測：電影夜、kx_yule 回過〔回覆當下記 KX_YULE_REPLIED；舊存檔看手機那一則〕、YL_ROOM）；
//      早一分鐘沒有、只送一次、晚三天以上不補
//   4  第 4 節演講那一晚：10/14 22:00 四則＋三個選項（期限 10/20 18:00）；①→ 10/20 18:50 霖澤館 201 出遊（4-2＋4-3 三支逐字、背景、記 YL_ROOM、記憶 YL_LECTURE、時間）；
//      ②→ 20:15 阿鳳麵店（4-2b＋4-3）；③、沒回（期限過了記 'no'）→ 21:40 四則；①②沒到（不去了、過了時間沒出發）→ 21:40 第一則換掉；都不記 YL_ROOM；
//      那之前和可昕分開＝出遊取消、21:40 不送；10/14 已經分開＝沒有邀請；立繪只用 neutral、smile；阿姨不說話
//   5  第 5 節 11/7：h509_yule 兩則＋三個選項（期限 23:54）、回覆逐字、記 YL_RPT；23:55 三則（不管回了沒有；②多一則）；分開了的照原本兩則、沒有選項、沒有 23:55；
//      1/12 22:00 只有①：三則＋第十二頁那一則（沒有 YL_ROOM／有）
//   6  第 6 節可昕 9/16 21:10 兩則（p:kexin），23:30 予樂那幾則接在後面；分開了沒有
//   7  舊存檔：沒有新旗標、沒有 YL_PH、沒有 msgs 照常跑、不丟例外；新的局沒有預先寫 YL_*；跳過一大段時間（存檔停在很久以前）不補一堆
//   8  給 BB（稿第 9 節）：立繪三種表情夠用（只用 neutral、smile）；不用 3D（出遊 2D、沒有 3D 當面的入口）；霖澤館 201 的 2D 背景等 BB 要圖（scene_bg_keys PENDING）
// 修改前（只拿掉這次 src 的改動：git archive 出 src、tests、lib、index.html、白名單，src/yule3d.js、src/data/yule_lines.js 刪掉，src/heard3d.js、src/data/heard_lines.js、index.html
//   換回開發分支 38594a3d8；白名單、這支測試用新的；AA520_DOCREPO 指這個 repo 實際跑過）：FAILED 36、PASS 10
//   （PASS＝讀稿、白名單、日子對星期、「不該有／照舊」那一類：被抓包不傳、原有八則照原本的條件、八則都在、3/27 在 kx_yule 後面、23:54 以後不能回、新的局沒有 YL_*、經濟系不傳；
//    第 0 段、第 4 段找不到 YULE_LINES 丟例外中斷、第 7 段舊存檔丟例外（沒有 YULE））。修改後 ALL PASS（57 項）。
// 照 AA_520 改的舊測試：tests/aa503_others_unit.js（h503_yule 三則、items 第 4 欄的稿、句數 121→123）、tests/scene_bg_keys_unit.js（PENDING 加 linze_201）。
// 全部 Node 單元測試（tests/*_unit.js，這一批的成果 a302ab1cd，2026-10-28）：726 支、結束碼不是 0 的 0 支。
// 第 10 節（c884a12ca，AA-C 回 LAWWW-C 13:18：實作時定的第 1～6 點照現在；第 7 點 4-4 ①②沒到各四則）：稿改讀 c884a12ca（第 1～9 節和 481dd8238 一樣）、加第 10 節的對字與 ①②沒到 的檢查。
//   修改前（只拿掉這次 src 的改動：src/data/yule_lines.js、src/yule3d.js 用開發分支 d38992889 那一版；白名單、測試用新的）：FAILED 2、PASS 56
//   （FAIL＝第 0 段稿 → 遊戲少「我哭得很醜」「沒事 我等一下再去吃雞排」、第 4 段 ①②沒到那四則）；修改後 ALL PASS（58 項）。
// 用法：node tests/aa520_yule_unit.js（在沒有 .git 的目錄跑，設環境變數 AA520_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, KX='kexin', J=JSON.stringify;
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
const Y=()=>typeof YULE!=='undefined'?YULE:null, YLX=()=>typeof YULE_LINES!=='undefined'?YULE_LINES:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t);
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=tag=>byTag(tag).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(key,h)=>{ at(key,h); ph(); };
const answer=(id,k)=>PHONE.answer(H.G,id,k);
const replies=(tag,th)=>{ const L=TH(th||'p:yule'), i=L.map(m=>m.tag).lastIndexOf(tag); return i<0?[]:L.slice(i+1); };   /* 回覆（祐廷那一句、她回的）沒有 tag：接在那一組後面的 */
/* 到了那個時間跑一次規則（訊息的時間＝那一刻，PHONE.tick 15 分鐘內照現在的時間送）*/
const askOf=id=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===id); return m?m.ask:null; };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); H.bgs=[]; if(!q) return false; await OUT.go(GM,q); return true; };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };   /* 出遊過了時間＝missed（遊戲裡是 OUT.tick）*/
/* 存檔：kx＝和可昕 'dating'（交往中）／'friend'（沒交往過）／'ex'（分開了，ROM.end）／'drift'（慢慢分手，KXDRIFT.end）／'caught'（坦白以後退回朋友，R2Y4B.toFriend）；met:false＝沒見過予樂 */
const fresh=(key,h,o)=>{ o=o||{}; const k=typeof key==='number'?keyOf(key):key;
  const G=H.fresh(k,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},o.met===false?{}:{yulePassDay:1},o.flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  const kx=o.kx||'dating'; H.FRIEND(KX);
  if(kx!=='friend'){ H.date(KX); if(kx==='ex') ROM.end(G,KX,'apart_talk'); else if(kx==='drift'){ KXDRIFT.end(G,'test'); } else if(kx==='caught') R2Y4B.toFriend(G,KX); }
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM);
  H.at(k,h); return G; };
/* 慢慢分手、已經照朋友（那一天 fd）*/
const friendOn=fd=>{ const R=KXDRIFT.rec(H.G); R.r6={st:'friend',friend:fd}; };

/* ---------- 讀稿 ---------- */
const SHA='c884a12ca', DOCF='docs/story_planning/AA_520_予樂自己的線_辦活動的人不在照片裡.md';   /* 第 1～9 節和 481dd8238 一樣；第 10 節（實作時定的、4-4 沒到的兩種版本）是 c884a12ca 加的 */
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA520_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+1):-1; return S.slice(i,j<0?S.length:j); };
/* 「> 予樂：…」「> 予樂（smile）：…」「> （去了電影夜的才有）予樂：…」→ {who, pre, x, t}；「> （…）」→ 旁白整句 */
const QRE=/^(（[^）]*）)?([^：（）\s]{1,6})(（[^）]*）)?：(.+)$/;
const qparse=s=>{ const m=QRE.exec(s); return m?{who:m[2],pre:m[1]||null,x:m[3]||null,t:m[4].trim()}:{who:null,pre:null,x:null,t:s}; };
const quotes=t=>String(t).split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>qparse(m[1].trim()));
const qt=t=>quotes(t).map(q=>q.t);
const S2=part('## 2. ','## 3. '), S3=part('## 3. ','## 4. '), S4=part('## 4. ','## 5. '), S5=part('## 5. ','## 6. '), S6=part('## 6. ','## 7. '), S7=part('## 7. ','## 8. ');
/* 第 3 節：每一則 {n:'3-1', date, wd, hm, base:[{t,pre}], plus:[t]（「後面再加」那一行之後的）} */
const S3B={}; { const parts=S3.split(/\n(?=\*\*3-\d+｜)/); for(const p of parts){ const m=/^\*\*(3-\d+)｜(\d{4}-\d\d-\d\d)（(.)）(\d\d:\d\d)｜/.exec(p); if(!m) continue; const cut=p.search(/\n- [^\n]*後面再加/);
    S3B[m[1]]={n:m[1],date:m[2],wd:m[3],hm:m[4],base:quotes(cut<0?p:p.slice(0,cut)),plus:cut<0?[]:qt(p.slice(cut))}; } }
/* 表格：| ①「…」 | 回 | `旗標:'值'` | … | */
const rows=t=>String(t).split('\n').filter(l=>/^\|\s*[①②③]/.test(l)).map(l=>{ const c=l.split('|').map(x=>x.trim()); const o=/「([^」]+)」/.exec(c[1]), f=/`(\w+):'(\w+)'`/.exec(c[3]||'');
  return {o:o?o[1]:null,r:c[2].split('／').map(x=>x.trim()).filter(Boolean),flag:f?f[1]:null,val:f?f[2]:null,after:c[4]||''}; });
/* 一段有選項的（4-3）：pre、opts:[{o, r}]、post（「三支會合」之後）*/
const blk=t=>{ const out={pre:[],opts:[],post:[]}; let cur=null, mode='pre';
  for(const raw of String(t).split('\n')){ const ind=raw.length-raw.trimStart().length, l=raw.trim(); let m;
    if(/^三支會合/.test(l)){ mode='post'; cur=null; continue; }
    if((m=/^- (「[^」]+」|（[^）]+）)$/.exec(l))){ cur={o:m[1],r:[]}; out.opts.push(cur); mode='opt'; continue; }
    if((m=/^>\s*(.+)$/.exec(l))){ const q=qparse(m[1].trim()); if(mode==='opt'&&cur&&ind>0) cur.r.push(q); else if(mode==='post') out.post.push(q); else if(mode==='pre') out.pre.push(q); } }
  return out; };
const B41=part('### 4-1','### 4-2｜'), B42=part('### 4-2｜','### 4-2b'), B42b=part('### 4-2b','### 4-3'), B43=blk(part('### 4-3','### 4-4')), B44=part('### 4-4','## 5. ');
const LEC_ROWS=rows(B41), RPT_ROWS=rows(S5);
const B44_DEF=qt(part('- 選③或沒回','- 選①沒到',B44)), B44_L=qt(part('- 選①沒到','- 選②沒到',B44)), B44_E=qt(part('- 選②沒到','- 這幾種',B44));
/* 第 10 節（c884a12ca）：實作時定的；第 7 點 4-4 沒到的兩種版本（四則都寫出來，取代 4-4「把第一句換成」那兩行）*/
const S10=part('## 10. ',null), S10_L=qt(part('- **①沒到**','- **②沒到**',S10)), S10_E=qt(part('- **②沒到**','- 她剛吃完麵',S10));
const S5_ORIG=qt(part('原本兩則照舊','第二則加選項',S5)), S5_2355=qt(part('**23:55','- 選②的',S5)), S5_UP=qt(part('- 選②的','**2029-01-12',S5)),
  S5_0112=qt(part('**2029-01-12','- 再加一則',S5)), S5_NOROOM=qt(part('- 沒有：','- 有：',S5)), S5_ROOM=qt(part('- 有：','- 這一則兌現',S5));
const S6_KX=quotes(S6), S2_Q=quotes(S2);
const one=(re,src)=>{ const m=re.exec(src==null?DOC:src); return m?m.slice(1):[]; };
const [LEC_DAY,LEC_WD,LEC_HM]=one(/### 4-1｜邀請：(\d{4}-\d\d-\d\d)（(.)）(\d\d:\d\d)/), [UNTIL_MD,UNTIL_HM]=one(/選項（期限 (\d+\/\d+) (\d\d:\d\d)）/,B41), [AFTER_MD,AFTER_HM]=one(/### 4-4｜[^：]*：(\d+\/\d+)（.）(\d\d:\d\d)/);
const [RPT_UNTIL]=one(/第二則加選項（期限 (\d\d:\d\d)）/,S5), [RPT_AFTER]=one(/\*\*(\d\d:\d\d)，不管回了沒有都傳/,S5), [RPT_DAY,RPT_WD,RPT_HM]=one(/\*\*(\d{4}-\d\d-\d\d)（(.)）(\d\d:\d\d)，只有選①的/,S5);
const [KX_DAY,KX_WD,KX_HM]=one(/## 6\. 可昕那一則：(\d{4}-\d\d-\d\d)（(.)）(\d\d:\d\d)/), [H509_DAY,H509_HM]=one(/\*\*3-13｜(\d{4}-\d\d-\d\d)（.）(\d\d:\d\d)/);
const [MEMNOTE]=one(/記憶簿文字是「([^」]+)」/,S7);
const WDC='一二三四五六日', wdOk=(key,c)=>!!key&&WDC[(CALENDAR.dateOf(D(key)).wd+6)%7]===c;   /* CALENDAR wd：1＝週一 … 7＝週日 */
const hOf=hm=>{ const [a,b]=String(hm).split(':').map(Number); return a+b/60; };
const md2key=(md,y)=>{ const [m,d]=md.split('/').map(Number); return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); };
/* 遊戲這一批的字（遊戲 → 稿）*/
const HL=()=>typeof HEARD_LINES!=='undefined'?HEARD_LINES:{phone:[]};
const h509=()=>HL().phone.find(e=>e.id==='h509_yule')||null, h503=()=>HL().phone.find(e=>e.id==='h503_yule')||null;
const lineT=x=>typeof x==='string'?x:(x&&x.t);
const mineTexts=()=>{ const A=[], L=YLX(); if(L){ for(const e of L.own||[]) A.push(...e.t.map(lineT)); A.push(...L.lecture.t,...L.lecture.opts.map(o=>o.t),...L.lecture.opts.flatMap(o=>o.r),...L.lectureAfter.t,...Object.values(L.lectureAfter.miss).flat(),...L.rptAfter.t.map(lineT),...L.kexin.t,L.mem); }
  const e3=h503(); if(e3) for(const it of e3.items) if(it[3]) A.push(it[2]);
  const e9=h509(); if(e9&&e9.ask) for(const o of e9.ask.opts) A.push(o.t,...o.r);
  const E1=ev('ev_yule_lecture'); if(E1) for(const l of E1.dialogue){ if(typeof l.text==='string') A.push(l.text); if(l.choice) for(const c of l.choice) A.push(c.text); }
  return A.filter(t=>typeof t==='string'&&t.length); };
const evLines=()=>{ const E1=ev('ev_yule_lecture'); return E1?E1.dialogue:[]; };
const yuleSaid=()=>H.said.map(s=>s.t);
const NOTEXT=new Set();

(async()=>{
/* ---------- 0 ---------- */
await sec(0,()=>{ const a=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_520 '+SHA+'：第 2～7 節；第 3 節 3-1～3-16 的標題）',DOC.length>6000&&!!S2&&!!S3&&!!S4&&!!S5&&!!S6&&Object.keys(S3B).length===16,J({len:DOC.length,s3:Object.keys(S3B)}));
  { const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_520_/.test(e.path));
    check('0. 劇情匯入白名單有 AA_520（sha '+SHA+'、approved、AA-C 定稿、任務 NPC-STORY2-1028）；這支測試對同一版的稿',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&/AA-C/.test(A[0].approvedBy||'')&&A[0].task==='NPC-STORY2-1028',J(A.map(e=>({sha:e.sha,status:e.status,task:e.task})))); }
  check('0. 新檔載得到（YULE、YULE_LINES、YULE_EVENTS）；全部的檔載入沒有錯誤；事件在 STORY_EVENTS',!loadErr.length&&!!Y()&&!!YLX()&&typeof YULE_EVENTS!=='undefined'&&!!ev('ev_yule_lecture'),J(loadErr));
  check('0. index.html：heard3d.js → data/yule_lines.js → yule3d.js（相鄰）；在 story3d.js、outings3d.js、kxdrift3d.js、multirel3d.js 以後，GAME.boot() 前面',
    /src\/heard3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/yule_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/yule3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/yule3d.js')<a('<script>GAME.boot();</script>')&&
    ['src/story3d.js','src/outings3d.js','src/kxdrift3d.js','src/multirel3d.js','src/r2y4b3d.js'].every(f=>a(f)>0&&a(f)<a('src/data/yule_lines.js')));
  /* 日子對星期（稿寫的星期）*/
  const wbad=[]; for(const k in S3B){ const b=S3B[k]; if(!wdOk(b.date,b.wd)) wbad.push(k+' '+b.date+b.wd); }
  if(!wdOk(LEC_DAY,LEC_WD)) wbad.push('4-1'); if(!wdOk(KX_DAY,KX_WD)) wbad.push('6'); if(!wdOk(RPT_DAY,RPT_WD)) wbad.push('3-14');
  if(!wdOk(md2key(AFTER_MD,2027),'三')) wbad.push('4-4 10/20');
  check('0. 稿上的日子都對得上星期（第 3 節十六則、4-1 10/14 週四、4-4 10/20 週三、第 6 節 9/16 週六、1/12 週五）',!wbad.length&&!!LEC_DAY&&!!KX_DAY&&!!RPT_DAY,J(wbad));
  const GS=new Set(mineTexts());
  /* 稿 → 遊戲 */
  const want=[]; for(const s of [S2_Q.slice(1),...Object.values(S3B).map(b=>b.base),S6_KX]) for(const q of s) want.push(q.t);
  for(const b of Object.values(S3B)) want.push(...b.plus);
  want.push(...qt(B41),...qt(B42),...qt(B42b),...B43.pre.map(q=>q.t),...B43.opts.map(o=>o.o),...B43.opts.flatMap(o=>o.r.map(q=>q.t)),...B43.post.map(q=>q.t),...B44_DEF,...B44_L,...B44_E,
    ...S5_2355,...S5_UP,...S5_0112,...S5_NOROOM,...S5_ROOM,...S10_L,...S10_E);
  for(const r of LEC_ROWS.concat(RPT_ROWS)){ want.push(r.o,...r.r); }
  const lost=want.filter(t=>!GS.has(t));
  check('0. 稿 → 遊戲：第 2～6 節、第 10 節每一句「>」、4-3 的三個選項、兩張表的選項與回覆（'+want.length+' 句）都在遊戲裡（一字不差）',want.length===123&&!lost.length,J({n:want.length,lost}));
  check('0. 第 10 節（c884a12ca）讀得到：第 1～6 點照現在；第 7 點 ①沒到、②沒到各四則（第一則同 4-4，①沒有「坐最後一排」、②最後一則換掉）',
    /第 1～6 點：全部照現在/.test(S10)&&S10_L.length===4&&S10_E.length===4&&S10_L[0]===B44_L[0]&&S10_E[0]===B44_E[0]&&S10_L[2]==='我哭得很醜'&&S10_E[3]!==B44_DEF[3]&&J(S10_E.slice(1,3))===J(B44_DEF.slice(1,3)),J({S10_L,S10_E}));
  /* 遊戲 → 稿 */
  const M=mineTexts(), notIn=[...new Set(M)].filter(t=>DOC.indexOf(t)<0);
  check('0. 遊戲 → 稿：新檔每一句、h503 兩句、h509 的選項與回覆、事件每一句與選項（'+new Set(M).size+' 句）都在稿裡（一字不差）',new Set(M).size>=100&&!notIn.length,J(notIn));
  /* 第 2 節原本那一句還在 h503 第一則；h509 原本兩則照舊（稿第 5 節「原本兩則照舊」）*/
  const e3=h503(), e9=h509();
  check('0. 第 2 節：h503_yule 第一則是原本那一句（AA_503），後面兩句照稿；h509_yule 兩則照舊（稿第 5 節）',!!e3&&J(e3.items.map(i=>i[2]))===J(S2_Q.map(q=>q.t))&&e3.items.slice(1).every(i=>i[3]==='AA_520 2')&&!e3.items[0][3]&&!!e9&&J(e9.items.map(i=>i[2]))===J(S5_ORIG),J({e3:e3&&e3.items,S2:S2_Q,e9:e9&&e9.items}));
  check('0. 記憶 YL_LECTURE（予樂）的記憶簿文字照稿（第 7 節「'+MEMNOTE+'」：SOCIAL.MEMORY_LABEL；記憶本身 note 空的，同現有 mem() 的寫法）',!!MEMNOTE&&YLX().mem===MEMNOTE&&SOCIAL.MEMORY_LABEL.YL_LECTURE===MEMNOTE&&
    evLines().some(l=>Array.isArray(l.mem)&&l.mem.some(m=>m.npc==='yule'&&m.tag==='YL_LECTURE'&&m.note==='')),J({MEMNOTE,label:SOCIAL.MEMORY_LABEL.YL_LECTURE})); });

/* ---------- 1 第 1 節 誰收得到 ---------- */
await sec(1,async()=>{ const b=S3B['3-4'], d=D(b.date), h=hOf(b.hm), n=b.base.length;   /* 用 3-4（大二上 9/19 22:30）*/
  const got=(o,fn)=>{ fresh(d,h-0.5,o); if(fn) fn(); phAt(d,h+0.05); return txt('yl_officer').length; };
  const dating=got({kx:'dating'}), friend=got({kx:'friend'}), noMet=got({kx:'dating',met:false});
  check('1. 交往中、沒交往過（朋友）照傳；沒見過予樂（沒有宵夜、手機裡沒有她）不傳',dating===n&&friend===n&&noMet===0,J({dating,friend,noMet}));
  const viaHeard=got({kx:'dating',met:false},()=>{ H.G.flags.HEARD={said:{},day:{},ph:{h503_yule:'sent'}}; }), viaOwn=got({kx:'dating',met:false},()=>{ H.G.flags.YL_PH={yl_run:'sent'}; }), viaX=got({kx:'dating',met:false},()=>{ H.G.flags.YL_PH={yl_run:'x:late'}; });
  check('1. 手機裡有她：她傳過的（原有八則、她自己的事）送出過就算——手機 200 則的上限把那幾則擠掉也一樣；沒送出過的（x:）不算',viaHeard===n&&viaOwn===n&&viaX===0,J({viaHeard,viaOwn,viaX}));
  const ex=got({kx:'ex'}); const xr=(H.G.flags.YL_PH||{}).yl_officer;
  check('1. 和可昕分開了（ROM.end）：不傳，之後條件成立也不補（記 x:cond）',ex===0&&xr==='x:cond',J({ex,xr}));
  /* 從分開那天起：之前的照傳 */
  fresh(d,h-0.5,{kx:'dating'}); phAt(d,h+0.05); const before=txt('yl_officer').length; at(d+20,12); ROM.end(H.G,KX,'apart_talk'); const b5=S3B['3-5'], d5=D(b5.date); phAt(d5,hOf(b5.hm)+0.05); const after=txt('yl_photo').length;
  check('1. 從分開那天起不再傳：分開以前的（9/19）照傳、分開以後的（12/12）不傳',before===n&&after===0,J({before,after}));
  /* 被抓包 */
  const caught=got({kx:'caught'}); fresh(d,h-0.5,{kx:'caught'}); H.G.flags.romance.kexin.status='dating'; H.G.flags.dating_kexin=true; phAt(d,h+0.05); const again=txt('yl_officer').length;
  fresh(d,h-0.5,{kx:'friend',flags:{EX_kexin_REASON:'caught'}}); phAt(d,h+0.05); const oldSave=txt('yl_officer').length;
  fresh(d,h-0.5,{kx:'dating'}); ROM.end(H.G,KX,'mrel'); phAt(d,h+0.05); const mrel=txt('yl_officer').length;
  check('1. 被抓包（坦白以後退回朋友、被發現分開 mrel、舊存檔 EX_kexin_REASON caught）一律不傳；之後重新交往也不傳',caught===0&&again===0&&oldSave===0&&mrel===0,J({caught,again,oldSave,mrel}));
  /* 慢慢分手：照朋友的下一學期起 */
  const b7=S3B['3-7'], d7=D(b7.date), b6=S3B['3-6'], d6=D(b6.date);
  fresh(D('2026-11-20'),20,{kx:'drift'}); const drift=H.G.flags.KX_ENDED==='drift'&&!!H.G.flags.EX_kexin; friendOn(D('2026-12-20')); phAt(d6,hOf(b6.hm)+0.05); const same=txt('yl_chiayi').length;   /* 照朋友 12/20（大二上），1/30（寒假＝大二上）不傳 */
  phAt(d7,hOf(b7.hm)+0.05); const next=txt('yl_bday').length;   /* 3/27（大二下）照傳 */
  fresh(D('2026-11-20'),20,{kx:'drift'}); phAt(d6,hOf(b6.hm)+0.05); const notYet=txt('yl_chiayi').length; phAt(d7,hOf(b7.hm)+0.05); const notFr=txt('yl_bday').length;   /* 還沒照朋友：不傳 */
  fresh(D('2026-11-20'),20,{kx:'drift'}); friendOn(D('2027-01-25')); phAt(d7,hOf(b7.hm)+0.05); const vac=txt('yl_bday').length;   /* 照朋友那天在寒假（1/25）＝前一學期（大二上）的下一個＝大二下照傳 */
  fresh(D('2027-03-01'),20,{kx:'drift'}); friendOn(D('2027-03-05')); phAt(d7,hOf(b7.hm)+0.05); const sameTerm=txt('yl_bday').length;   /* 照朋友 3/5（大二下）＝3/27 同一學期不傳 */
  check('1. 慢慢分手（KX_ENDED drift）以後：還沒照朋友不傳；照朋友的同一學期（含後面的寒暑假）不傳、下一學期起照傳；照朋友那天在寒假算前一學期',drift&&same===0&&next===b7.base.length&&notYet===0&&notFr===0&&vac===b7.base.length&&sameTerm===0,J({drift,same,next,notYet,notFr,vac,sameTerm}));
  /* 原有八則照原本的條件 */
  fresh(D('2026-07-22'),21,{kx:'ex'}); phAt(D('2026-07-22'),22.05); const h504=byTag('heard_h504_yule').length;
  check('1. 原有八則照原本的條件（分開了照樣收到 h504_yule 兩則）',h504===2,J(h504));
  /* 人在國外：照當地時間（美國路線大四上 9/16 23:30 臺灣＝當地 10:30 前後）*/
  const b12=S3B['3-12'], d12=D(b12.date), tw=T(d12,hOf(b12.hm));
  fresh(d12,8,{kx:'dating',route:'US',zone:'us_apartment',flags:{US_ARRIVED:true,US1:'together'}}); const z=+STORY.tzOffset(H.G,d12)||0; const loc=tw+z;
  phAt(Math.floor((loc-0.1)/24),(loc-0.1)%24); const early=txt('yl_decide').length; phAt(Math.floor((loc+0.001)/24),(loc+0.001)%24); const M12=byTag('yl_decide');
  check('1. 人在國外（美國路線）：照當地時間收（時差 '+z+' 小時；早六分鐘沒有、到了才有）',z!==0&&early===0&&M12.length===b12.base.length&&Math.abs(T(M12[0].day,M12[0].h)-loc)<0.02,J({z,early,m:M12.map(m=>[m.day,m.h])})); });

/* ---------- 2 第 2 節 ---------- */
await sec(2,async()=>{ const Y8=HL().phone.filter(e=>e.th==='p:yule');
  check('2. 原有八則 p:yule 都在（h503～h510；h508、h509 各一則），條件都還是 yule',Y8.length===8&&Y8.every(e=>e.cond==='yule')&&J(Y8.map(e=>e.id))===J(['h503_yule','h504_yule','h505_yule','h506_yule','h507_yule','h508_yule','h509_yule','h510_yule']),J(Y8.map(e=>e.id+':'+e.cond)));
  const W11=CALENDAR.termDays('Y1S1').from+10*7+3; fresh(W11,23,{kx:'dating'}); phAt(W11,23+40/60); const M=byTag('heard_h503_yule');
  check('2. h503_yule（大一上第 11 週週四 23:40）三則同一組：原本那一句＋「我的也被講了 老師說我很敢講」「……我在想這是不是好話」',J(M.map(m=>[m.th,m.from,m.text]))===J(S2_Q.map(q=>['p:yule','yule',q.t]))&&M.every(m=>Math.abs(m.h-(23+40/60))<0.02),J(M.map(m=>[m.h,m.text])));
  fresh(W11,23,{kx:'ex'}); phAt(W11,23.7); const M2=byTag('heard_h503_yule');
  check('2. h503_yule 照原本的條件（分開了照樣三則）',M2.length===3,J(M2.length)); });

/* ---------- 3 第 3 節 她自己的事 ---------- */
await sec(3,async()=>{ const L=YLX(); const IDS={'3-1':'yl_run','3-2':'yl_halfmara','3-3':'yl_ahuang','3-4':'yl_officer','3-5':'yl_photo','3-6':'yl_chiayi','3-7':'yl_bday','3-8':'yl_family_law','3-10':'yl_interview','3-11':'yl_crayons','3-12':'yl_decide','3-15':'yl_study','3-16':'yl_after_exam'};
  const own=(L&&L.own)||[];
  check('3. 第 3 節十三則（3-9 邀請、3-13 h509、3-14 報告另外測）＋1/12 報告：id、時間、稿的哪一節對得上',own.length===14&&Object.keys(IDS).every(k=>{ const e=own.find(x=>x.id===IDS[k]); return !!e&&e.at===S3B[k].date+' '+S3B[k].hm&&e.src==='AA_520 '+k; })&&
    !!own.find(x=>x.id==='yl_report'&&x.at===RPT_DAY+' '+RPT_HM&&x.need==='rpt'),J(own.map(e=>e.id+' '+e.at+' '+e.src)));
  const bad=[];
  for(const k of Object.keys(IDS)){ const b=S3B[k], d=D(b.date), h=hOf(b.hm), id=IDS[k], plain=b.base.filter(q=>!q.pre).map(q=>q.t);
    fresh(d,h-0.5,{kx:'dating'}); phAt(d,h-1/60); const early=txt(id).length; phAt(d,h); const M=byTag(id); ph(); phAt(d+1,h); const again=byTag(id).length;
    if(early!==0||again!==M.length||J(M.map(m=>m.text))!==J(plain)||!M.every(m=>m.th==='p:yule'&&m.from==='yule'&&m.name==='予樂'&&m.day===d&&Math.abs(m.h-h)<0.02)) bad.push({k,early,again,got:M.map(m=>[m.day,m.h,m.text]),plain}); }
  check('3. 十三則：到了時間才有（早一分鐘沒有）、只送一次、p:yule、逐字（條件那幾則不成立的版本）',!bad.length,J(bad.slice(0,3)));
  /* 3-5 電影夜 */
  const b5=S3B['3-5'], d5=D(b5.date), h5=hOf(b5.hm), film=b5.base.find(q=>q.pre);
  fresh(d5,h5-0.5,{kx:'dating'}); H.G.events.done.ev_kexin_film_night=1; phAt(d5,h5+0.05); const went=txt('yl_photo');
  fresh(d5,h5-0.5,{kx:'dating',flags:{KX_FILM_NIGHT:'went'}}); phAt(d5,h5+0.05); const went2=txt('yl_photo');
  fresh(d5,h5-0.5,{kx:'dating',flags:{KX_FILM_NIGHT:'missed'}}); phAt(d5,h5+0.05); const miss=txt('yl_photo');
  check('3. 3-5：去了電影夜的第三則「'+(film&&film.t)+'」（「（去了電影夜的才有）」）；沒去的沒有',!!film&&film.pre==='（去了電影夜的才有）'&&J(went)===J(b5.base.map(q=>q.t))&&J(went2)===J(went)&&J(miss)===J(b5.base.filter(q=>!q.pre).map(q=>q.t)),J({went,miss}));
  /* 3-7 kx_yule 回過 */
  const b7=S3B['3-7'], d7=D(b7.date), h7=hOf(b7.hm), need=(typeof NEEDED_MSGS!=='undefined'?NEEDED_MSGS.list:[]).find(e=>e.id==='kx_yule');
  const W2=CALENDAR.termDays('Y2S2').from+13;   /* 大二下第 2 週週日 */
  fresh(W2,20,{kx:'dating'}); PHONE.postAt(H.G,{th:'p:kexin',from:KX,text:need?need.msg[0]:'',ask:{id:'need_'+W2+'_kx_yule',grp:'need_'+W2,max:2,opts:[{t:need?need.reply:'',say:[],need:'kx_yule'}]}},W2,21); at(W2,21.5); const r=answer('need_'+W2+'_kx_yule',0);
  const rep=H.G.flags.KX_YULE_REPLIED===true; phAt(d7,h7+0.05); const yes=txt('yl_bday');
  fresh(W2,20,{kx:'dating'}); phAt(d7,h7+0.05); const no=txt('yl_bday');
  fresh(W2,20,{kx:'dating'}); PHONE.postAt(H.G,{th:'p:kexin',from:KX,text:'x',ask:{id:'need_'+W2+'_kx_yule',opts:[{t:'y',need:'kx_yule'}]}},W2,21); H.G.msgs[H.G.msgs.length-1].ans=0; phAt(d7,h7+0.05); const old=txt('yl_bday');   /* 舊存檔：沒有 KX_YULE_REPLIED，手機那一則回過 */
  fresh(W2,20,{kx:'dating'}); H.G.needed={batches:[{d:W2,ids:[['kx_yule',KX]],ans:['kx_yule'],closedAt:null,said:{}}]}; phAt(d7,h7+0.05); const oldN=txt('yl_bday');   /* 舊存檔：手機那一則已經被擠掉、STORY 的 needed 紀錄還在 */
  const wantYes=b7.base.map(q=>q.t).concat(b7.plus);
  check('3. 3-7：回過 kx_yule（「'+(need&&need.reply)+'」，回的當下記 KX_YULE_REPLIED）＝後面再加三則；沒回＝三則；舊存檔看手機那一則、needed 紀錄',!!r&&rep&&b7.plus.length===3&&J(yes)===J(wantYes)&&J(no)===J(b7.base.map(q=>q.t))&&J(old)===J(wantYes)&&J(oldN)===J(wantYes),J({rep,yes,no,old,oldN}));
  check('3. 3-7 在 kx_yule（大二下第 2～4 週）後面：3/27 是大二下第 5 週週六',(()=>{ const t=CALENDAR.termOf(d7); return !!t&&t.id==='Y2S2'&&t.week===5&&CALENDAR.dateOf(d7).wd===6&&!!need&&need.term==='Y2S2'&&need.w[1]<5; })());
  /* 3-12 YL_ROOM */
  const b12=S3B['3-12'], d12=D(b12.date), h12=hOf(b12.hm);
  fresh(d12,h12-0.5,{kx:'dating',flags:{YL_ROOM:true}}); phAt(d12,h12+0.05); const room=txt('yl_decide'); fresh(d12,h12-0.5,{kx:'dating'}); phAt(d12,h12+0.05); const noRoom=txt('yl_decide');
  check('3. 3-12：聽過她講小房間（YL_ROOM）的後面再加「'+b12.plus[0]+'」；沒聽過三則',b12.plus.length===1&&J(room)===J(b12.base.map(q=>q.t).concat(b12.plus))&&J(noRoom)===J(b12.base.map(q=>q.t)),J({room,noRoom}));
  /* 晚三天以上不補 */
  const b1=S3B['3-1'], d1=D(b1.date), h1=hOf(b1.hm); fresh(d1,h1-0.5,{kx:'dating'}); phAt(d1+3,h1+0.2); const late=txt('yl_run').length, lr=(H.G.flags.YL_PH||{}).yl_run;
  fresh(d1,h1-0.5,{kx:'dating'}); phAt(d1+2,h1); const fill=byTag('yl_run');
  check('3. 規則晚跑到：兩天內照原本的時間補（12/06 22:40）、晚三天以上不補（記 x:late）',late===0&&lr==='x:late'&&fill.length===b1.base.length&&fill[0].day===d1&&Math.abs(fill[0].h-h1)<0.02,J({late,lr,fill:fill.map(m=>[m.day,m.h])})); });

/* ---------- 4 第 4 節 演講那一晚 ---------- */
await sec(4,async()=>{ const L=YLX(), d0=D(LEC_DAY), h0=hOf(LEC_HM), d=D(md2key(AFTER_MD,2027)), hA=hOf(AFTER_HM), uAbs=T(D(md2key(UNTIL_MD,2027)),hOf(UNTIL_HM));
  const q41=qt(B41);
  fresh(d0,h0-0.5,{kx:'dating'}); phAt(d0,h0-1/60); const early=byTag('yl_lec_ask').length; phAt(d0,h0); const M=byTag('yl_lec_ask'), A=askOf('yl_lec');
  check('4. 4-1 10/14（四）22:00 四則（p:yule，逐字；21:59 還沒有）；最後一則三個選項（逐字），期限 10/20 18:00',early===0&&J(M.map(m=>m.text))===J(q41)&&M.every(m=>m.th==='p:yule'&&m.day===d0&&Math.abs(m.h-h0)<0.02)&&!!A&&
    J(A.opts.map(o=>o.t))===J(LEC_ROWS.map(r=>r.o))&&A.until===uAbs&&M[M.length-1].ask===A,J({early,M:M.map(m=>m.text),A}));
  check('4. 4-1 表：三個選項的回覆、記的旗標照稿；沒回＝同③（YL_LEC no）',LEC_ROWS.length===3&&L.lecture.opts.every((o,k)=>J(o.r)===J(LEC_ROWS[k].r)&&o.set&&o.set[LEC_ROWS[k].flag]===LEC_ROWS[k].val)&&/沒回[^\n]*`YL_LEC:'no'`[^\n]*同③/.test(B41),J({rows:LEC_ROWS,opts:L.lecture.opts}));
  /* ① 我去聽。*/
  const B=n=>{ const b=B43; return b.pre.map(q=>q.t).concat(b.opts[n].r.map(q=>q.t),b.post.map(q=>q.t)); };
  const run1=async(pick,kx)=>{ fresh(d0,h0+0.05,{kx:kx||'dating'}); ph(); const r=answer('yl_lec',0); const rep=replies('yl_lec_ask').map(m=>[m.from,m.text]); phAt(d0+1,10); const q=OUT.get(H.G,'yl_lecture'), qc=q&&Object.assign({},q);
    at(d,18.5); ph(); const due=!!OUT.due(H.G); const t0=T(H.G.day,H.G.hour); await goOut('yl_lecture',[pick]); return {r:!!r,rep,q:qc,due,s:yuleSaid(),t1:T(H.G.day,H.G.hour),t0}; };
  const o1=await run1(0); const lines1=evLines(), scene1=lines1.filter(l=>l.scene).map(l=>l.scene+'/'+l.bg);
  const want1=qt(B42).slice(0,2).concat(qt(B42).slice(2,5),qt(B42).slice(5),B(0));
  check('4. ①「我去聽。」：她回「'+LEC_ROWS[0].r[0]+'」、YL_LEC listen；排 10/20（三）18:50 霖澤館 201 出遊（走過去約 10 分鐘）',J(o1.rep)===J([['player','我去聽。'],['yule',LEC_ROWS[0].r[0]]])&&
    !!o1.q&&o1.q.day===d&&Math.abs(o1.q.h-(18+50/60))<1e-9&&o1.q.place==='法律系館A 201'&&o1.q.ev==='ev_yule_lecture'&&o1.q.state==='planned'&&o1.due&&H.G.flags.YL_LEC==='listen'&&/18:50，法律系館A 201/.test(LEC_ROWS[0].after),J(o1));
  check('4. ①演：4-2（霖澤館 201）接 4-3、選「妳那時候怎麼說？」那一支，逐字；背景 霖澤館 201 → 阿鳳麵店；記 YL_ROOM、記憶 YL_LECTURE；演完 21:15 左右（不到 21:40）',J(o1.s)===J(want1)&&
    J(scene1)===J(['法律系館A 201/linze_201','阿鳳麵店/noodle_table','阿鳳麵店/noodle_table'])&&H.G.flags.YL_ROOM===true&&SOCIAL.has('yule','YL_LECTURE')&&OUT.get(H.G,'yl_lecture').state==='done'&&!!H.G.events.done.ev_yule_lecture&&Math.abs(o1.t1-T(d,21.25))<0.05,J({s:o1.s,want1,scene1,t1:o1.t1-T(d,0)}));
  phAt(d,hA+0.1); phAt(d+1,9); const none1=byTag('yl_lec_after').length;
  check('4. ①去了：21:40 沒有那一則私訊（記 x:went）',none1===0&&(H.G.flags.YL_PH||{}).yl_lec_after==='x:went',J((H.G.flags.YL_PH||{}).yl_lec_after));
  const o1b=await run1(1), o1c=await run1(2);
  check('4. 4-3 另外兩支逐字：「妳想走家事？」、（不說話，把湯推到她那邊。）',J(o1b.s)===J(qt(B42).concat(B(1)))&&J(o1c.s)===J(qt(B42).concat(B(2)))&&B43.opts.length===3,J({b:o1b.s,c:o1c.s}));
  /* ② 聽完去吃東西？ */
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); answer('yl_lec',1); const rep2=replies('yl_lec_ask').map(m=>m.text); phAt(d,19); const q2=OUT.get(H.G,'yl_lecture'), q2c=q2&&Object.assign({},q2);
  at(d,20.05); await goOut('yl_lecture',[0]); const s2=yuleSaid(), t2=T(H.G.day,H.G.hour);
  check('4. ②「聽完去吃東西？」：她回「'+LEC_ROWS[1].r[0]+'」、YL_LEC eat；排 10/20 20:15 阿鳳麵店（走過去約 15 分鐘）',J(rep2)===J(['聽完去吃東西？',LEC_ROWS[1].r[0]])&&!!q2c&&q2c.day===d&&q2c.h===20.25&&q2c.place==='阿鳳麵店'&&H.G.flags.YL_LEC==='eat'&&/20:15，阿鳳麵店/.test(LEC_ROWS[1].after),J(q2c));
  check('4. ②演：4-2b（阿鳳麵店）接 4-3，逐字；記 YL_ROOM；演完 21:15',J(s2)===J(qt(B42b).concat(B(0)))&&H.G.flags.YL_ROOM===true&&Math.abs(t2-T(d,21.25))<0.05,J({s2,t2:t2-T(d,0)}));
  /* ③、沒回 */
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); answer('yl_lec',2); const rep3=replies('yl_lec_ask').map(m=>m.text); phAt(d,hA-1/60); const e3=byTag('yl_lec_after').length; phAt(d,hA); const M3=byTag('yl_lec_after');
  check('4. ③「那天不行。」：她回「'+LEC_ROWS[2].r[0]+'」、YL_LEC no；10/20 21:40 四則（逐字，21:39 還沒有）；沒有出遊、不記 YL_ROOM',J(rep3)===J(['那天不行。',LEC_ROWS[2].r[0]])&&H.G.flags.YL_LEC==='no'&&e3===0&&
    J(M3.map(m=>m.text))===J(B44_DEF)&&M3.every(m=>m.day===d&&Math.abs(m.h-hA)<0.02&&m.th==='p:yule')&&!OUT.get(H.G,'yl_lecture')&&H.G.flags.YL_ROOM==null,J({rep3,M3:M3.map(m=>[m.h,m.text])}));
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); phAt(d,17.9); const lec0=H.G.flags.YL_LEC; phAt(d,18.05); const lec1=H.G.flags.YL_LEC, late=PHONE.answer(H.G,'yl_lec',0); phAt(d,hA+0.05); const M4=txt('yl_lec_after');
  check('4. 沒回：期限 10/20 18:00 以前還沒定；過了記 YL_LEC no（不能再回）；21:40 四則同③',lec0==null&&lec1==='no'&&late===null&&J(M4)===J(B44_DEF)&&!OUT.get(H.G,'yl_lecture'),J({lec0,lec1,M4}));
  /* ①②沒到 */
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); answer('yl_lec',0); phAt(d,18.5); H.picks=[2]; const pr=await OUT.prompt(GM,OUT.get(H.G,'yl_lecture')); phAt(d,hA+0.05); const ML=txt('yl_lec_after');
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); answer('yl_lec',1); phAt(d,19); at(d,21); expire(); const st=OUT.get(H.G,'yl_lecture').state; phAt(d,hA+0.05); const ME=txt('yl_lec_after');
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); answer('yl_lec',1); phAt(d,19); phAt(d,hA+0.05); const MH=txt('yl_lec_after'), stH=OUT.get(H.G,'yl_lecture').state;   /* 人在家（OUT.tick 不跑）：21:40 還沒出發 */
  check('4. ①沒到（問出發時選「不去了」）＝21:40 第 10 節第 7 點①那四則（「'+S10_L.join('」「')+'」）；②沒到（過了時間沒出發）＝②那四則（最後一則「'+S10_E[3]+'」）；21:40 還沒出發（OUT 沒跑）同②；都不記 YL_ROOM',
    pr==='no'&&J(ML)===J(S10_L)&&st==='missed'&&J(ME)===J(S10_E)&&J(MH)===J(ME)&&stH==='missed'&&H.G.flags.YL_ROOM==null&&S10_L.length===4&&S10_E.length===4,J({pr,ML,st,ME,MH}));
  /* 那之前和可昕分開；10/14 已經分開 */
  fresh(d0,h0+0.05,{kx:'dating'}); ph(); answer('yl_lec',0); phAt(d0+2,12); ROM.end(H.G,KX,'apart_talk'); phAt(d,17); const qc=OUT.get(H.G,'yl_lecture'), stc=qc&&qc.state; phAt(d,hA+0.05); const Mc=txt('yl_lec_after').length;
  fresh(d0,h0+0.05,{kx:'ex'}); ph(); const noInv=byTag('yl_lec_ask').length;
  check('4. 排好以後、10/20 以前和可昕分開了＝出遊取消、21:40 不送；10/14 已經分開＝沒有邀請',stc==='cancelled'&&Mc===0&&noInv===0,J({stc,Mc,noInv}));
  /* 立繪、阿姨 */
  const ex=lines1.filter(l=>l.speaker==='yule').map(l=>l.expression), last=lines1.filter(l=>l.speaker==='yule').slice(-1)[0];
  check('4. 立繪只用 neutral，最後一句「這頓我請。我點太多了。」用 smile（稿：只有 neutral／smile／surprised）；阿姨（阿鳳）這一段不說話',ex.length>0&&ex.slice(0,-1).every(x=>x==='neutral')&&!!last&&last.expression==='smile'&&last.text===B43.post[1].t&&B43.post[1].x==='（smile）'&&
    !lines1.some(l=>l.speaker&&l.speaker!=='yule')&&!lines1.some(l=>typeof l.text==='string'&&/^阿姨：/.test(l.text)),J(ex)); });

/* ---------- 5 第 5 節 11/7 ---------- */
await sec(5,async()=>{ const d=D(H509_DAY), h=hOf(H509_HM), dR=D(RPT_DAY), hR=hOf(RPT_HM), uR=hOf(RPT_UNTIL), hA=hOf(RPT_AFTER);
  fresh(d,h-0.5,{kx:'dating'}); phAt(d,h+0.05); const M=byTag('heard_h509_yule'), A=askOf('yl_rpt');
  check('5. 11/7 23:30 h509_yule 兩則照舊，第二則三個選項（逐字），期限 23:54',J(M.map(m=>m.text))===J(S5_ORIG)&&!!A&&M[1].ask===A&&J(A.opts.map(o=>o.t))===J(RPT_ROWS.map(r=>r.o))&&A.until===T(d,uR)&&RPT_ROWS.length===3,J({M:M.map(m=>m.text),A}));
  const run=k=>{ fresh(d,h-0.5,{kx:'dating'}); phAt(d,h+0.05); const r=k==null?null:answer('yl_rpt',k); const rep=replies('heard_h509_yule').map(m=>m.text); phAt(d,hA-1/60); const e=txt('yl_rpt_after').length; phAt(d,hA);
    return {r:!!r,rep,flag:H.G.flags.YL_RPT,e,after:byTag('yl_rpt_after').map(m=>[m.day,Math.round(m.h*60),m.text])}; };
  const r0=run(0), r1=run(1), r2=run(2), rn=run(null);
  const aft=k=>S5_2355.map(t=>[d,Math.round(hA*60),t]).concat(k===1?S5_UP.map(t=>[d,Math.round(hA*60),t]):[]);
  check('5. 回覆逐字（①三則、②一則、③一則；「／」分開的三則），記 YL_RPT ask／up／night',r0.r&&J(r0.rep)===J([RPT_ROWS[0].o].concat(RPT_ROWS[0].r))&&r0.flag===RPT_ROWS[0].val&&J(r1.rep)===J([RPT_ROWS[1].o].concat(RPT_ROWS[1].r))&&r1.flag==='up'&&
    J(r2.rep)===J([RPT_ROWS[2].o].concat(RPT_ROWS[2].r))&&r2.flag==='night'&&RPT_ROWS[0].r.length===3,J({r0,r1,r2}));
  check('5. 23:55 三則（不管回了沒有；23:54 還沒有），②「貼高一點。」的後面加「'+S5_UP[0]+'」',[r0,r2,rn].every(x=>x.e===0&&J(x.after)===J(aft(0)))&&r1.e===0&&J(r1.after)===J(aft(1))&&rn.flag==null,J({r0:r0.after,r1:r1.after,rn:rn.after}));
  fresh(d,h-0.5,{kx:'dating'}); phAt(d,h+0.05); at(d,uR+1/60); const lateAns=answer('yl_rpt',0);
  check('5. 23:54 以後不能回',lateAns===null);
  fresh(d,h-0.5,{kx:'ex'}); phAt(d,h+0.05); const Mx=byTag('heard_h509_yule'); phAt(d,hA+0.05); const ax=byTag('yl_rpt_after').length;
  check('5. 分開了：h509_yule 照原本兩則（沒有選項）、沒有 23:55 那幾則',J(Mx.map(m=>m.text))===J(S5_ORIG)&&Mx.every(m=>!m.ask)&&ax===0&&(H.G.flags.YL_PH||{}).yl_rpt_after==='x:noask',J({Mx:Mx.map(m=>[m.text,!!m.ask]),ax}));
  /* 1/12 報告 */
  const rep=(flags,kx)=>{ fresh(dR,hR-0.5,{kx:kx||'dating',flags}); phAt(dR,hR-1/60); const e=txt('yl_report').length; phAt(dR,hR); return {e,m:byTag('yl_report').map(m=>[m.day,Math.round(m.h*60),m.text])}; };
  const a0=rep({YL_RPT:'ask'}), a1=rep({YL_RPT:'ask',YL_ROOM:true}), n1=rep({YL_RPT:'up'}), n2=rep({YL_RPT:'night'}), n3=rep({}), nx=rep({YL_RPT:'ask'},'ex');
  fresh(dR,hR-0.5,{kx:'dating',met:false,flags:{YL_RPT:'ask'}}); phAt(dR,hR); const cut=txt('yl_report').length;   /* 11/7 選了①、之後手機裡她的訊息都被擠掉（沒有宵夜那一筆）*/
  check('5. 1/12：11/7 選了①的，之後手機裡她的訊息被擠掉也照送（見過她那時已經成立，只看和可昕）',cut===4,J(cut));
  const W=extra=>S5_0112.concat(extra).map(t=>[dR,Math.round(hR*60),t]);
  check('5. 1/12（五）22:00 只有選①的：三則＋「'+S5_NOROOM[0]+'」（沒有 YL_ROOM）／「'+S5_ROOM[0]+'」（有）；②③沒回、分開了都沒有',a0.e===0&&J(a0.m)===J(W(S5_NOROOM))&&J(a1.m)===J(W(S5_ROOM))&&!n1.m.length&&!n2.m.length&&!n3.m.length&&!nx.m.length,J({a0,a1,n1,nx}));
  /* 美國路線：11/7 人在美國，照當地時間；期限也是 */
  fresh(d,8,{kx:'dating',route:'US',zone:'us_apartment',flags:{US_ARRIVED:true,US1:'together'}}); const z=+STORY.tzOffset(H.G,d)||0, l0=T(d,h)+z; phAt(Math.floor((l0+0.05)/24),(l0+0.05)%24); const Au=askOf('yl_rpt');
  check('5. 人在國外（美國路線）：h509_yule 照當地時間收，選項期限也換成當地（23:54 臺灣）',z!==0&&!!Au&&Math.abs(Au.until-(T(d,uR)+z))<0.01,J({z,until:Au&&Au.until})); });

/* ---------- 6 第 6 節 可昕 9/16 21:10 ---------- */
await sec(6,async()=>{ const d=D(KX_DAY), h=hOf(KX_HM), b12=S3B['3-12'], h12=hOf(b12.hm);
  fresh(d,h-0.5,{kx:'dating'}); phAt(d,h-1/60); const e=txt('yl_kx_family').length; phAt(d,h); const M=byTag('yl_kx_family'); phAt(d,h12+0.05); const Y12=byTag('yl_decide');
  check('6. 9/16（六）21:10 可昕兩則（p:kexin，逐字；21:09 還沒有），23:30 予樂那幾則接在後面',e===0&&J(M.map(m=>[m.th,m.from,m.text]))===J(S6_KX.map(q=>['p:kexin',KX,q.t]))&&S6_KX.every(q=>q.who==='可昕')&&M.every(m=>m.day===d&&Math.abs(m.h-h)<0.02)&&
    Y12.length>0&&T(Y12[0].day,Y12[0].h)>T(M[1].day,M[1].h),J({e,M:M.map(m=>[m.h,m.text]),y:Y12.map(m=>m.h)}));
  fresh(d,h-0.5,{kx:'friend'}); phAt(d,h+0.05); const fr=txt('yl_kx_family').length; fresh(d,h-0.5,{kx:'ex'}); phAt(d,h+0.05); const ex=txt('yl_kx_family').length; fresh(d,h-0.5,{kx:'caught'}); phAt(d,h+0.05); const ca=txt('yl_kx_family').length;
  check('6. 沒交往過（朋友）照傳；分開了、被抓包沒有',fr===2&&ex===0&&ca===0,J({fr,ex,ca})); });

/* ---------- 7 舊存檔 ---------- */
await sec(7,async()=>{ let ok=true, err='';
  try{ for(const [k,h] of [['2025-12-06',22.8],['2027-10-14',22.1],['2027-10-20',21.8],['2028-11-07',23.95],['2029-01-12',22.1],['2028-09-16',23.6]]){ const G=fresh(k,h,{kx:'dating'}); delete G.flags.YL_PH; delete G.needed; Y().phone(G); ph(); }
    Y().phone({flags:{},stage:'law',day:D('2027-10-14'),hour:22.1}); Y().phone({flags:{},stage:'law',day:D('2027-10-20'),hour:21.8,msgs:[]}); Y().phone({flags:{YL_LEC:'listen',YL_PH:{yl_lec_ask:'sent'}},stage:'law',day:D('2027-10-20'),hour:21.8,msgs:[]});
    Y().kxOk({flags:{romance:{kexin:{status:'ex'}}},day:1}); Y().phone({flags:{},stage:'econ',day:D('2025-12-06'),hour:23}); Y().glasses({flags:{}}); }
  catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  check('7. 舊存檔（沒有 YL_*、YL_PH、needed、msgs；經濟系那一年）照常跑、不丟例外',ok,err);
  const F=fresh('2025-12-01',20,{kx:'dating'}).flags; check('7. 新的局沒有預先寫進任何 YL_* 旗標（都是用到才寫）',!Object.keys(F).some(k=>/^YL_/.test(k)),J(Object.keys(F).filter(k=>/^YL_/.test(k))));
  fresh('2027-10-10',20,{kx:'dating'}); phAt('2027-10-25',12); const skip=['yl_lec_ask','yl_lec_after'].map(t=>byTag(t).length), R=H.G.flags.YL_PH||{};
  check('7. 存檔停在 10/10、下一次跑規則已經 10/25：邀請、21:40 都不補（晚三天以上），也不排出遊',skip[0]===0&&skip[1]===0&&R.yl_lec_ask==='x:late'&&!OUT.get(H.G,'yl_lecture'),J({skip,R}));
  fresh(D('2025-08-31'),20,{kx:'dating',flags:{}}); H.G.stage='econ'; phAt('2025-12-06',22.8); const econ=byTag('yl_run').length;
  check('7. 不是法律系（經濟系那一年）不傳',econ===0); });

/* ---------- 8 給 BB（稿第 9 節）---------- */
await sec(8,()=>{ const P=typeof PORTRAIT_FILES!=='undefined'?PORTRAIT_FILES:(typeof PORTRAITS!=='undefined'?PORTRAITS:null), man=fs.readFileSync(path.join(H.ROOT,'src/data/portrait_manifest.js'),'utf8');
  const exprs=[...new Set(evLines().filter(l=>l.speaker==='yule').map(l=>l.expression))].sort(), ym=/"yule":\s*\{\s*"campus":\s*\[([^\]]*)\]/.exec(man), have=ym?[...ym[1].matchAll(/"(\w+)"/g)].map(m=>m[1]):[];
  check('8. 立繪：這一場只用 neutral、smile，portrait_manifest 的予樂都有（三種：neutral、smile、surprised）',J(exprs)===J(['neutral','smile'])&&exprs.every(x=>have.includes(x))&&have.length===3,J({exprs,have}));
  const E1=ev('ev_yule_lecture');
  check('8. 不用 3D：事件是出遊（trigger outing、沒有 3D 當面的入口、沒有 prereq）、participants 空的（予樂沒有 3D 模型）',!!E1&&E1.trigger==='outing'&&!E1.near&&!E1.prereq&&J(E1.participants)===J([])&&!(typeof CHARACTERS!=='undefined'&&CHARACTERS.yule),J(E1&&{t:E1.trigger,p:E1.participants}));
  const bgs=evLines().filter(l=>l.scene).map(l=>l.bg);
  check('8. 2D 背景：霖澤館 201（linze_201，沒有圖＝深色底，執行時登記、scene_bg_keys 的 PENDING 等 BB 要圖）、阿鳳麵店（noodle_table 有圖）',
    bgs.includes('linze_201')&&bgs.includes('noodle_table')&&!!OUT.BG.linze_201&&OUT.BG.linze_201.image===null&&!!OUT.BG.noodle_table.image&&/linze_201:/.test(fs.readFileSync(path.join(H.ROOT,'tests/scene_bg_keys_unit.js'),'utf8')),J(bgs)); });

H.done();
})();
