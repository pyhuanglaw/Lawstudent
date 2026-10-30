// AA_529 經濟系那一年（玩家實際玩得到的）第 2～6 點（企劃線 881029f98；AA-B 2026-10-30 定稿，D109；任務 AA529-ECON-FIX-1030；第 1 點 HASK 已在 b38b112a8）——不需要瀏覽器。
//   0  讀稿：這次放進遊戲的每一句都在 AA_529（一字不差）
//   2  「走啦」群組：30 分鐘版 10/15 聚會（ev_y0_gather）演完、回家的路上建（旁白「（回家的路上，手機震了一下。）」＋系統一則＋三則，時間＝聚會演完）；
//      跳的途中停在那幾則、打開「走啦」；已經在群組裡（長版 P2、P2b）不重複建、不出旁白；AA_440 7/16 群組訊息收得到；
//      舊存檔讀檔：玩過經濟系、已經在法律系、沒有群組＝加進去（只有一則系統訊息）；經濟系那一年聚會演過、沒有群組的也一樣；game3d.js migrate 有呼叫
//   3  兩張日期卡：10/16 總圖那句掛在 10/17 那天第一張日期卡（照實際的跳：10/16 00:00 停在可昕的訊息、再跳到 10/17 14:40）；7/13 對答案那句掛在 7/13 10:00（對發票那一站）
//   4  K7 週年卡第 4 頁換句
//   5  長頸鹿鑰匙圈：30 分鐘版信箱那則剪了＝12/29 記旗標時記 due；之後第一張日期卡下面兩句（實際的 y0Jump 跨過 12/29）、只出一次；沒有日期卡＝掛在起床；
//      長版（信箱那則送到）、E20 演過的不加
//   6  6-1 K0b-L1 只在 2/15～3/15（4/24 跳過、接 K0b-L2）；出遊演完階梯前面說了「（晚上，回到家。）」就不再接「回臺北的家」卡（沒說的照舊有卡）
//      6-2 品妤 10/31 換句（3/10 那則照留）；6-3 8/29「這個暑假，你還是住在家裡。」；6-4 三個社團各三則（9/27、10/18、12/6 21:00，標籤寫全名，不用回，之前就過了的不補）；
//      6-5 4/25～6/7 拆兩張
// 修改前（基準 acc883b3e＝v9.10.14 候選 b38b112a8 的遊戲檔：git archive 出 src、tests、lib、index.html，這支測試用新的，AA529_DOCREPO 指這個 repo）：
//   FAILED 25、PASS 14（PASS＝讀稿、對照組、長版／E20 不加、7/16 有群組才收到等；第 2、3 節找不到 STORY.zoulaMigrate／zoulaGather 丟例外中斷）。修改後 ALL PASS（46 項）。
// 用法：node tests/aa529_econ_unit.js（在沒有 .git 的目錄跑，設環境變數 AA529_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa521_econ_friends_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
const phoneOpened=[]; GM.phoneThread=async(th,o)=>{ phoneOpened.push(th); };
const cardsMs=[]; GM.titleCard=async(a,b,ms)=>{ H.cards.push([a,b]); cardsMs.push([a,b,ms]); };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, md=d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const setAt=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=((CALENDAR.dateOf(d).wd%7)+7)%7; E.hour=h; };
/* 照時間跑手機規則（每 step 小時一次）*/
const runTo=(d1,h1,step)=>{ step=step||1; const G=H.G, t1=T(d1,h1); let t=T(G.day,G.hour); while(t<t1-1e-9){ t=Math.min(t1,t+step); const d=Math.floor(t/24); setAt(d,t-d*24); ph(); } };
const thr=th=>(H.G.msgs||[]).filter(m=>m.th===th);
/* 經濟系那一年（30 分鐘版：ECONFF.short）*/
const econ=(key,h,flags,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',Object.assign({E01_MORNING:true,LEAVE_WEEK:6,dating_kexin:true,KX_FIRST_MSG:false,PLAYED_Y0:true},flags||{}));
  G.stage='econ'; G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); G.events.done.ev_y0_e02=1;
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.path=null; E.npcs.length=0; GM.npc={}; ADV.active=false; STORY._bindGM(GM); setAt(G.day,h); phoneOpened.length=0; cardsMs.length=0; return G; };
const home=G=>{ G.flags.Y0_MOVED_OUT=true; const R=HOME.rec(G); R.at=true; R.base=true; R.day=G.day; G.zone='home'; return G; };

/* ---------- 讀稿 ---------- */
const SHA='881029f98', DOCF='docs/story_planning/AA_529_D99經濟系那一年_可昕主動約你擋掉_走啦群組建不起來_長頸鹿鑰匙圈.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA529_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const inDoc=t=>!!DOC&&DOC.includes(t);
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+1):-1; return DOC.slice(i,j<0?DOC.length:j); };
const S2=part('## 2. ','## 3. '), S3=part('## 3. ','## 4. '), S4=part('## 4. ','## 5. '), S5=part('## 5. ','## 6. '), S61=part('### 6-1','### 6-2'), S62=part('### 6-2','### 6-3'), S63=part('### 6-3','### 6-4'), S64=part('### 6-4','### 6-5'), S65=part('### 6-5','## 7. ');
const quotes=t=>String(t).split('\n').filter(l=>/^\s*>\s*\S/.test(l)).map(l=>l.replace(/^\s*>\s*/,'').trim());   /* 稿裡的引文（「  > 」縮排）*/
const ZOULA=quotes(S2);   /* 旁白、系統、三則 */
const sp=l=>{ const i=l.indexOf('：'); return [l.slice(0,i),l.slice(i+1)]; };
const PIN1016=(/`econff3d\.js:100`「([^」]+）)」/.exec(S3)||[])[1], PIN0713=(/`econff3d\.js:119`「([^」]+）)」/.exec(S3)||[])[1];
const P4=quotes(S4)[0], KEY=quotes(S5), PY=quotes(S62)[0], SUMMER=quotes(S63)[0];
const CLUB=(()=>{ const out={}; for(const l of S64.split('\n')){ const m=/^\|\s*(吉他社|登山社|羽球社)（`(y0_\w+)`）\s*\|(.+)\|\s*$/.exec(l); if(!m) continue; out[m[2]]={n:m[1],cells:m[3].split('|').map(c=>c.trim().split('／').map(sp))}; } return out; })();
const NEW65=quotes(S65)[0];

(async()=>{
  check('0. 讀得到 AA_529（'+SHA+'）、遊戲的檔都載得到（econff3d.js、home3d.js、vacfill3d.js、rom1016）',!!DOC&&loadErr.length===0&&typeof ECONFF!=='undefined'&&typeof HOME!=='undefined'&&typeof ROM1016_EVENTS!=='undefined',J(loadErr));
  check('0. 稿裡拿得到：走啦五行、兩張日期卡、第 4 頁、鑰匙圈兩句、品妤、8/29、三個社團、6-5 新句',ZOULA.length===5&&!!PIN1016&&!!PIN0713&&!!P4&&KEY.length===2&&!!PY&&!!SUMMER&&Object.keys(CLUB).length===3&&!!NEW65,J({ZOULA,PIN1016,PIN0713,P4,KEY,PY,SUMMER,CLUB:Object.keys(CLUB),NEW65}));

  /* ---------- 第 2 節：「走啦」群组 ---------- */
  await sec('2',async()=>{
    const [narr,sys,...three]=ZOULA, d15=D('2024-10-15');
    const G=econ('2024-10-15',17,{},{zone:'campus'}); check('2. 前提：30 分鐘版（ECONFF.short）、10/15 17:00 還沒有「走啦」',ECONFF.short(G)&&!PHONE.inGroup(G,'econ_friends'));
    setAt(d15,17.6); ph(); const q=OUT.get(G,'y0_gather'); check('2. 17:30 排了聚會（OUT y0_gather）',!!q&&q.state==='planned');
    H.said=[]; H.picks=['假裝沒看到']; setAt(d15,18.75); await OUT.go(GM,q); const L=H.said.map(s=>s.t);
    check('2. 聚會演完、回家的路上：最後一句旁白「'+narr+'」（在「她走進女舍以前」之後）',L[L.length-1]===narr&&L[L.length-2]==='（她走進女舍以前，回頭揮了一下手。）'&&G.flags.Y0_ZOULA==='gather',J(L.slice(-3)));
    check('2. 群組建好了（「走啦」），系統一則照原本 P2 的字',PHONE.inGroup(G,'econ_friends')&&PHONE.title(G,'g:econ_friends')==='走啦'&&sys==='系統：'+STORY.ZOULA_SYS);
    const t0=T(G.day,G.hour); PHONE.tick(G); const M=thr('g:econ_friends');
    check('2. 系統一則＋三則：照稿、照順序、說的人（韋綸、品妤、韋綸）、時間＝聚會演完（10/15 22:20 左右）',M.length===4&&M[0].text===STORY.ZOULA_SYS&&!M[0].from&&three.every((l,i)=>{ const [who,t]=sp(l), m=M[i+1]; return m&&m.text===t&&PHONE.who(m)===who; })&&M.every(m=>m.day===d15&&Math.abs(m.h-(22+1/3))<0.02)&&M.every(m=>m.tag==='econ_friends_new'),J(M.map(m=>[PHONE.who(m),m.text,m.day===d15,m.h])));
    /* 30 分鐘版的跳：聚會演完以後下一跳在那幾則停下來、打開「走啦」（沒在 3D 裡先收到的情況）*/
    { const G2=econ('2024-10-15',17,{},{zone:'campus'}); setAt(d15,17.6); ph(); const q2=OUT.get(G2,'y0_gather'); H.picks=['假裝沒看到']; setAt(d15,18.75); await OUT.go(GM,q2);
      const res=ECONFF.jumpTo(GM,D('2024-10-17'),14+40/60); check('2. 30 分鐘版跳到下一步的途中：在那幾則停下來（msg），最新的對話是「走啦」',res==='msg'&&G2.day===d15&&G2.hour<=23.01&&ECONFF.newestTh(G2)==='g:econ_friends'&&thr('g:econ_friends').length===4,J([res,md(G2.day),G2.hour,ECONFF.newestTh(G2)])); }
    /* 長版 P2 已經建了 */
    { const G3=econ('2024-10-15',17,{P2_PICK:'river'},{zone:'campus'}); ph(); const n0=thr('g:econ_friends').length; setAt(d15,17.6); ph(); const q3=OUT.get(G3,'y0_gather'); H.said=[]; H.picks=['假裝沒看到']; setAt(d15,18.75); await OUT.go(GM,q3); runTo(d15,23.5,0.25);
      check('2. 已經在群組裡（P2 去成、長版）：不重複建、不出「回家的路上」、系統訊息只有一則',n0===1&&PHONE.inGroup(G3,'econ_friends')&&!H.said.some(s=>s.t===narr)&&thr('g:econ_friends').filter(m=>m.text===STORY.ZOULA_SYS).length===1&&!thr('g:econ_friends').some(m=>m.text===sp(three[0])[1])&&G3.flags.Y0_ZOULA==null,J(thr('g:econ_friends').map(m=>m.text))); }
    /* 下游：AA_440 7/16 經濟系暑假的群組訊息（有加入「走啦」才收到）*/
    { const G4=home(econ('2025-07-16',20,{})); PHONE.join(G4,'econ_friends','走啦'); runTo(D('2025-07-16'),21.5,0.25); check('2. 有了「走啦」：AA_440 7/16 21:00 群組訊息收得到（vf_y0_0716）',(G4.msgs||[]).some(m=>m.tag==='vf_y0_0716'&&m.th==='g:econ_friends'));
      const G5=home(econ('2025-07-16',20,{})); runTo(D('2025-07-16'),21.5,0.25); check('2. （對照）沒有群組：收不到',!(G5.msgs||[]).some(m=>m.tag==='vf_y0_0716')); }
    /* 舊存檔 */
    { const s={v:3,stage:'law',day:D('2025-10-01'),hour:20,flags:{PLAYED_Y0:true},msgs:[{day:D('2025-09-30'),h:9,th:'p:kexin',from:'kexin',text:'x'}],events:{done:{}}};
      const r1=STORY.zoulaMigrate(s), M1=(s.msgs||[]).filter(m=>m.th==='g:econ_friends'); const r2=STORY.zoulaMigrate(s);
      check('2. 舊存檔（法律系、玩過經濟系、沒有群組）：讀檔加進「走啦」，只有一則系統訊息（讀檔那一刻），再讀一次不重複',r1===true&&r2===false&&s.phone.groups.econ_friends&&s.phone.groups.econ_friends.name==='走啦'&&M1.length===1&&M1[0].text===STORY.ZOULA_SYS&&M1[0].day===s.day&&(s.msgs||[]).filter(m=>m.th==='g:econ_friends').length===1&&s.flags.Y0_ZOULA==='load',J(M1));
      const s2={v:3,stage:'law',day:D('2025-10-01'),hour:20,flags:{},msgs:[],events:{done:{}}}; STORY.zoulaMigrate(s2);
      const s3={v:3,stage:'law',day:D('2025-10-01'),hour:20,flags:{PLAYED_Y0:true},msgs:[],events:{done:{}},phone:{groups:{econ_friends:{name:'走啦',day:-300}}}}; STORY.zoulaMigrate(s3);
      const s4={v:3,stage:'econ',day:D('2024-12-01'),hour:20,flags:{PLAYED_Y0:true},msgs:[],events:{done:{ev_y0_gather:1}}}; STORY.zoulaMigrate(s4);
      const s5={v:3,stage:'econ',day:D('2024-10-10'),hour:20,flags:{PLAYED_Y0:true},msgs:[],events:{done:{}}}; STORY.zoulaMigrate(s5);
      check('2. 舊存檔：沒玩經濟系的不加；已經有群組的不動；經濟系那一年聚會演過、沒有群組的加；聚會以前的不加',!(s2.phone&&s2.phone.groups&&s2.phone.groups.econ_friends)&&s3.msgs.length===0&&!!(s4.phone&&s4.phone.groups.econ_friends)&&s4.msgs.length===1&&!(s5.phone&&s5.phone.groups&&s5.phone.groups.econ_friends));
      const gsrc=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); check('2. game3d.js 讀檔（migrate）呼叫 STORY.zoulaMigrate',/function migrate\(s\)[\s\S]*STORY\.zoulaMigrate\(s\)[\s\S]*s\.v=SAVE_VER; return s; \}/.test(gsrc)); }
    check('2. 稿 → 遊戲：旁白、三則都在 AA_529',inDoc(narr)&&three.every(l=>inDoc(l))&&inDoc('系統：韋綸建立了群組「走啦」，把你加了進來。'));
  });

  /* ---------- 第 3 節：兩張日期卡 ---------- */
  await sec('3',async()=>{
    check('3. 稿 → 遊戲：兩句（ECONFF.PIN）照 AA_529 第 3 節',ECONFF.PIN&&ECONFF.PIN.length===2&&ECONFF.PIN[0][0]==='2024-10-17'&&ECONFF.PIN[0][1]===PIN1016&&ECONFF.PIN[1][0]==='2025-07-13'&&ECONFF.PIN[1][1]===PIN0713,J(ECONFF.PIN));
    /* 10/15 聚會演完（22:20）以後實際怎麼跳：ECONFF.advance（事件本身不演，只看日期卡）*/
    const G=econ('2024-10-15',22+1/3,{E10_EVE:'went'},{zone:'campus'}); const R=ECONFF.rec(G); for(const s of ECONFF.STEPS){ const t=ECONFF.tOf(G,s); if(t!=null&&t<T(D('2024-10-15'),20)) R.done[s.n]=1; } R.done[23]=1; G.events.done.ev_y0_gather=1; STORY.zoulaGather(G,22+1/3);
    const run0=EVENTS.run, chk0=EVENTS.check; const ran=[]; EVENTS.run=async e=>{ ran.push(e.id); G.events.done[e.id]=(G.events.done[e.id]||0)+1; }; EVENTS.check=()=>true;
    try{ for(let k=0;k<12&&!G.events.done.ev_y0_e30;k++) await ECONFF.advance(GM); } finally { EVENTS.run=run0; EVENTS.check=chk0; }
    const C=cardsMs.map(c=>[c[0],c[1]]), first17=cardsMs.find(c=>/^10\/17/.test(c[0])), c16=cardsMs.filter(c=>/^10\/16/.test(c[0]));
    check('3. 實際的跳：10/16 00:00 停在可昕「明天去總圖念書吧」（那張卡是空的），10/17 那天第一張日期卡下面是「十月十六日晚上……」',!!first17&&first17[1]===PIN1016&&c16.every(c=>c[1]!==PIN1016)&&ran.includes('ev_y0_e30'),J(C));
    check('3. 同一句只出一次（再跳一次 10/16→10/17 不再出）',ECONFF.cardLine(G,D('2024-10-16'),D('2024-10-17'))!==PIN1016);
    { const g=econ('2024-10-16',1,{}); check('3. 換了日子才算：10/17 當天再停一次（同一天）不出、10/16 那張不出',ECONFF.cardLine(g,D('2024-10-17'),D('2024-10-17'))==null&&ECONFF.cardLine(g,D('2024-10-15'),D('2024-10-16'))==null&&ECONFF.cardLine(g,D('2024-10-16'),D('2024-10-17'))===PIN1016); }
    /* 7/13：考完（7/12）以後在家快轉，停在 7/13 10:00 對發票 */
    { const g=home(econ('2025-07-12',20,{MATH_100:true})); ECONFF.rec(g).lines=[]; cardsMs.length=0; let why=null, n=0; while(n++<10&&!(g.day===D('2025-07-13')&&why)){ why=await HOME.y0Jump(GM,T(D('2025-07-14'),8)); if(g.day>D('2025-07-13')) break; }
      const c13=cardsMs.find(c=>/^7\/13/.test(c[0]));
      check('3. 7/12 晚上在家快轉：停在 7/13 10:00（對發票，家裡的事件），那張日期卡下面是「對答案……她回高雄過暑假。」',why==='event'&&g.day===D('2025-07-13')&&Math.abs(g.hour-10)<0.01&&!!c13&&c13[1]===PIN0713,J([why,md(g.day),g.hour,cardsMs.map(c=>[c[0],c[1]])])); }
    check('3. 長版（ECON_FULL）不出（日期卡那一句只有 30 分鐘版）',ECONFF.cardLine(econ('2024-10-16',1,{ECON_FULL:true}),D('2024-10-16'),D('2024-10-17'))==null);
  });

  /* ---------- 第 4 節：K7 週年卡第 4 頁 ---------- */
  await sec('4',async()=>{
    const P=ROM1016_EVENTS.PAGES; const G=econ('2025-10-17',10,{}); const pg=ROM1016.pages(G);
    check('4. 第 4 頁換句：「'+P4+'」（翻頁照順序：第 2、3 頁之後）',P.p4===P4&&pg[2]===P4&&!pg.some(t=>/筷子掉了兩次/.test(t))&&inDoc(P.p4),J(pg));
  });

  /* ---------- 第 5 節：長頸鹿鑰匙圈 ---------- */
  await sec('5',async()=>{
    check('5. 稿 → 遊戲：兩句（ECONFF.KEY_LINES）照 AA_529 第 5 節',J(ECONFF.KEY_LINES)===J(KEY)&&KEY.every(inDoc),J(ECONFF.KEY_LINES));
    const d25=D('2024-12-25'), d29=D('2024-12-29');
    const G=home(econ('2024-12-24',22,{})); runTo(d29-1,23,1);
    check('5. 30 分鐘版：信箱那則（y0_e20_mail）剪了、12/28 還沒有旗標',(G.phone.cut||[]).includes('y0_e20_mail')&&!G.msgs.some(m=>m.tag==='y0_e20_mail')&&!G.flags.GIRAFFE_KEYCHAIN&&G.flags.Y0_KEY_CARD==null);
    runTo(d29,1,1); check('5. 12/29 記 GIRAFFE_KEYCHAIN 的同時記 Y0_KEY_CARD＝due',G.flags.GIRAFFE_KEYCHAIN===true&&G.flags.Y0_KEY_CARD==='due',J([G.flags.GIRAFFE_KEYCHAIN,G.flags.Y0_KEY_CARD]));
    /* 實際的快轉：12/28 晚上在家跳，跨過 12/29 */
    { const g=home(econ('2024-12-24',22,{})); runTo(d29-1,22,1); cardsMs.length=0; let n=0, why=null; while(n++<8&&!cardsMs.some(c=>/長頸鹿/.test(c[1]||''))){ why=await HOME.y0Jump(GM,T(D('2025-01-03'),8)); }
      const ci=cardsMs.findIndex(c=>/長頸鹿/.test(c[1]||'')), c=cardsMs[ci], before=cardsMs.slice(0,ci);
      const X53=ECONFF.CARDS.find(x=>x[0]==='2024-12-20')[2], parts=c?c[1].split('<br>'):[];
      check('5. 在家快轉跨過 12/29：之後第一張日期卡下面加兩句（一行一句）；那張卡本來的那一句（12/20～12/30「十二月二十日，期末考考完了……」X53）照留在前面；每多一句多放 2 秒',!!c&&J(parts)===J([X53].concat(KEY))&&c[2]===3200+2000*2&&before.every(x=>{ const d=/^(\d+)\/(\d+)/.exec(x[0]); return d&&(+d[1]===12&&+d[2]<29); })&&g.flags.Y0_KEY_CARD===g.day,J(cardsMs.map(x=>[x[0],x[1],x[2]])));
      { const g2=home(econ('2025-01-02',10,{})); g2.flags.Y0_KEY_CARD='due'; ECONFF.rec(g2).lines=ECONFF.CARDS.map(x=>x[2]).filter(t=>typeof t==='string'); const l=ECONFF.cardLine(g2,g2.day,g2.day);
        check('5. 那張卡本來沒有句子（同一天、別的句子都用過）：只有兩句',l===KEY.join('<br>'),J(l)); }
      const more=[]; for(let k=0;k<4;k++){ cardsMs.length=0; await HOME.y0Jump(GM,T(g.day+3,8)); more.push(...cardsMs); } check('5. 只出一次（之後的日期卡沒有）',!more.some(x=>/長頸鹿/.test(x[1]||'')),J(more.map(x=>x[1]))); }
    /* 沒有日期卡：掛在起床 */
    { const g=home(econ('2024-12-29',22,{})); g.flags.GIRAFFE_KEYCHAIN=true; g.flags.Y0_KEY_CARD='due'; H.said=[]; await HOME.sleep(GM); const L=H.said.map(s=>s.t);
      check('5. 沒有日期卡（在家睡覺醒來）：起床掛那兩句、記成出過',L.indexOf(KEY[0])>=0&&L.indexOf(KEY[1])===L.indexOf(KEY[0])+1&&g.flags.Y0_KEY_CARD===g.day,J(L.slice(0,4))); }
    /* 長版、E20 演過 */
    { const g=home(econ('2024-12-24',22,{ECON_FULL:true})); runTo(d29,1,1); check('5. 長版（ECON_FULL）：信箱那則送到（「你的份，我放在你家信箱了。」）＝不加',g.msgs.some(m=>m.tag==='y0_e20_mail')&&g.flags.GIRAFFE_KEYCHAIN===true&&g.flags.Y0_KEY_CARD==null&&ECONFF.cardLine(g,d29-3,d29+2)==null); }
    { const g=home(econ('2024-12-26',10,{GIRAFFE_KEYCHAIN:true})); g.events.done.ev_y0_e20=1; runTo(d29+1,10,1); check('5. E20 演過（旗標是演出來的）＝不加',g.flags.Y0_KEY_CARD==null); }
    check('5. 畢業以後提到的那兩句還在（postgrad_lines.js 讀 GIRAFFE_KEYCHAIN）',/它還在。脖子還是很短。/.test(fs.readFileSync(path.join(H.ROOT,'src/data/postgrad_lines.js'),'utf8')));
  });

  /* ---------- 第 6 節 ---------- */
  await sec('6-1',async()=>{
    const lad=(key,h)=>{ const G=home(econ(key,h,{})); const st=STORY.ladNext(G,'kexin','meet'); return [G,st]; };
    const [g1,s1]=lad('2025-02-20',19), [g2,s2]=lad('2025-03-14',19), [g3,s3]=lad('2025-04-24',20), [g4,s4]=lad('2025-03-16',19);
    check('6-1. K0b-L1「國界」2/15～3/15 出（2/20、3/14）；3/16、4/24（生日那天）跳過、接 K0b-L2',s1&&s1.id==='K0b-L1'&&s2&&s2.id==='K0b-L1'&&s3&&s3.id==='K0b-L2'&&s4&&s4.id==='K0b-L2',J([s1&&s1.id,s2&&s2.id,s3&&s3.id,s4&&s4.id]));
    check('6-1. 日期窗照稿（2/15～3/15）',J(STORY.K0B_L1)===J(['2025-02-15','2025-03-15'])&&/K0b-L1 只在 2\/15～3\/15 出/.test(S61));
    /* 出遊演完、階梯前面說了「（晚上，回到家。）」：不再接「回臺北的家」卡 */
    const mk=(id,h)=>{ STORY_EVENTS.push({id,stage:'econ',title:'',participants:['kexin'],location:'any',trigger:'outing',once:true,hours:1,background:'dark',dialogue:[{speaker:null,text:'（測試的出遊。）'}]}); };
    mk('ev_t529_a'); mk('ev_t529_b');
    { const G=home(econ('2025-04-24',18,{})); OUT.plan(G,{id:'t529a',ev:'ev_t529_a',day:G.day,h:18,place:'公館',title:'測試',travel:'x',travelH:0}); const q=OUT.get(G,'t529a'); H.said=[]; cardsMs.length=0; await HOME.goOut(GM,q);
      check('6-1. 4/24 晚上的出遊（休學在家）：階梯前面「（晚上，回到家。）」、K0b-L2，後面沒有「回臺北的家」卡（只留一個）',H.said.some(s=>s.t==='（晚上，回到家。）')&&!cardsMs.some(c=>c[0]==='回臺北的家')&&HOME.at(G),J([H.said.map(s=>s.t).slice(-4),cardsMs.map(c=>c[0])])); }
    { const G=home(econ('2025-04-26',13,{})); OUT.plan(G,{id:'t529b',ev:'ev_t529_b',day:G.day,h:13,place:'公館',title:'測試',travel:'x',travelH:0}); const q=OUT.get(G,'t529b'); H.said=[]; cardsMs.length=0; await HOME.goOut(GM,q);
      check('6-1. （對照）白天的出遊不接階梯、沒有「回到家」旁白：照舊有「回臺北的家」卡',!H.said.some(s=>s.t==='（晚上，回到家。）')&&cardsMs.some(c=>c[0]==='回臺北的家'),J(cardsMs.map(c=>c[0]))); }
  });
  await sec('6-2',async()=>{
    const it=STORY.DAILY_PHONE.find(d=>d.id==='y0_py_notes'), it2=STORY.DAILY_PHONE.find(d=>d.id==='y0_py_notes2');
    const [who,t]=sp(PY), x=it&&it.items({flags:{}})[0];
    check('6-2. 品妤 10/31（y0_py_notes）換句；3/10（y0_py_notes2）照留＝「放著也是放著」只剩一次',who==='品妤'&&!!x&&x.text===t&&x.from==='econ_pinyu'&&!/放著也是放著/.test(x.text)&&it2.items({})[0].text==='我高中的筆記還在，掃描放雲端了。你要的話自己拿。放著也是放著。',J(x));
  });
  await sec('6-3',async()=>{ check('6-3. 8/29 暑假的摘要第 2 句：「'+SUMMER+'」',STORY.Y0_SUMMER[1]===SUMMER&&!STORY.Y0_SUMMER.some(t=>/整個暑假/.test(t))); });
  await sec('6-4',async()=>{
    const DAYS=['2024-09-27','2024-10-18','2024-12-06'];
    check('6-4. 三個日子都是星期五、稿上寫 21:00',DAYS.every(k=>CALENDAR.dateOf(D(k)).wd%7===5)&&/9\/27（五）21:00、10\/18（五）21:00、12\/6（五）21:00/.test(S64));
    for(const [club,gid] of [['guitar','y0_guitar'],['hiking','y0_hiking'],['badminton','y0_badminton']]){
      const G=home(econ('2024-09-21',13,{Y0_CLUB:club})); G.flags.Y0_MOVED_OUT=false; HOME.rec(G).at=false; G.zone='dorm'; ph(); const inG=PHONE.inGroup(G,gid);
      runTo(D('2024-12-07'),9,1); const M=thr('g:'+gid), C=CLUB[gid];
      const want=[]; C.cells.forEach((cell,i)=>{ for(const [w,t] of cell) want.push([DAYS[i],w,t]); });
      const got=M.map(m=>[keyOf(m.day),PHONE.who(m),m.text,m.h]);
      check('6-4. '+C.n+'：選了就在群組，三個日子 21:00 照稿（說的人寫全名「'+C.n+'社長」）、不用回',inG&&M.length===want.length&&want.every((w,i)=>got[i]&&got[i][0]===w[0]&&got[i][1]===w[1]&&got[i][2]===w[2]&&Math.abs(got[i][3]-21)<0.02)&&M.every(m=>!m.ask)&&want.every(w=>w[1]===C.n+'社長'),J(got)); }
    { const G=home(econ('2024-10-20',13,{Y0_CLUB:'guitar'})); runTo(D('2024-12-07'),9,1); const M=thr('g:y0_guitar');
      check('6-4. 休學以後（10/20 起）照樣在群組、看得到；之前就過了的（9/27、10/18）不補',PHONE.inGroup(G,'y0_guitar')&&M.length===1&&M[0].text==='12/18 期末成發，社辦，歡迎帶朋友',J(M.map(m=>m.text))); }
    { const G=econ('2024-09-21',13,{Y0_CLUB:'none'}); runTo(D('2024-12-07'),9,1); check('6-4. 不參加：沒有社團群組、沒有訊息',!['y0_guitar','y0_hiking','y0_badminton'].some(g=>PHONE.inGroup(G,g))&&!(G.msgs||[]).some(m=>/^g:y0_(guitar|hiking|badminton)$/.test(m.th))); }
  });
  await sec('6-5',async()=>{
    const A=ECONFF.CARDS.find(c=>c[0]==='2025-04-25'), B=ECONFF.CARDS.find(c=>c[0]==='2025-05-19');
    check('6-5. 4/25～6/7 拆兩張：4/25～5/18 新句、5/19～6/7 照原句',!!A&&A[1]==='2025-05-18'&&A[2]===NEW65&&!!B&&B[1]==='2025-06-07'&&/^（五月，書桌旁邊多了一台電風扇。考前一個月/.test(B[2])&&!ECONFF.CARDS.some(c=>c[0]==='2025-04-25'&&c[1]==='2025-06-07')&&/\['2025-04-25','2025-05-18'\]/.test(S65),J([A,B]));
    const G=home(econ('2025-05-10',10,{})); ECONFF.rec(G).lines=[]; const l1=ECONFF.cardLine(G,D('2025-04-24'),D('2025-05-10')), l2=ECONFF.cardLine(G,D('2025-05-18'),D('2025-06-08'));
    check('6-5. 跳的時候：4/24→5/10 出新句、5/18→6/8 出原句',l1===NEW65&&l2===B[2],J([l1,l2]));
  });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
