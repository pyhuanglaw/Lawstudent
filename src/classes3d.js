/* ===== 課表與每日上課（D52：AA_103、AA_104；D54：日常生活的設計原則）=====
   課程資料：src/data/courses.js；日曆（學期、週次、寒暑假、國定假日）：src/data/calendar.js。
   玩家怎麼知道今天有什麼課（AA_104 第 3 節）：起床時的目標寫今天的課、HUD 的「下一堂」、手機的「今天」「課表」（index.html #phone）、開始前 30 分鐘的提醒。
   上課（AA_104 4-1；AA_137 第 4 節改）：開始前 30 分鐘起走進教室、坐下 → 上課（開始後 1～15 分鐘＝遲到；超過 15 分鐘提示「會記缺席」，可以選還是進去聽；下課前 30 分鐘就不能進）（黑板三行 → 教授一句 → 同學一句 → 時間快轉到下課；可以點過去）。
     霖澤館 201（3D）：坐下時選「上課」；共同教學館、體育館、萬才館研討室：走到門口（2D 課堂畫面）；校外實習：之後做。
   翹課（4-2）：不用操作，沒來就算沒來（超過 15 分鐘才進去＝記缺席）；不警告、不扣分（只記「來了幾次」）。
   自學（4-3）：在宿舍、圖書館、Café 讀書時選一門課，累積同一個「準備」。
   考試週（第 8～9、16 週；16 週制）：那一週的課變成考試；成績公布日（放假後第 3 個週一，CALENDAR.gradeDay）早上看到成績單（文字，不是分數，不會「沒過」：AA_104 第 10 節）。
   特殊課堂：AA_103 第 5 節的週次在資料裡；內容（BB 寫）還沒做的週照普通課堂上；牽涉主要人物劇情的（story:true）照大一上「劇情暫緩」等使用者批准。
   普通課堂的黑板、教授一句、同學一句：BB 依 AA_103 寫（AA_104 的 syllabus）；還沒寫的用這裡依教授風格（AA_103 第 2 節）的一般句子（PLACEHOLDER，等 BB）。
   第二天的民法總則（第 3 週，劇情課：網拍相機）照舊由 story3d.js 的 classScene 處理，這裡不重複。 */
'use strict';
const CLS=(function(){
  const S={};
  const B=b=>COURSES.blocks[b];
  const hr=G=>G.hour%24;
  /* 過了午夜還沒睡（G.hour ≥ 24，G.day 還沒換）：今天的課都已經過去了——不能變回「還沒開始」、不能跳回早上重上一次（2026-10-13 審查第 1 項）*/
  const late=G=>G.hour>=24;
  const hhmm=x=>{ x=((x%24)+24)%24; return String(Math.floor(x+1e-6)).padStart(2,'0')+':'+String(Math.round((x%1)*60)%60).padStart(2,'0'); };
  S.hhmm=hhmm;
  const WIN0=0.5, WIN1=0.25, LATE_END=0.5;  // 開始前 30 分鐘就可以進教室；開始後 1～15 分鐘＝遲到（出席，另記一次遲到）；超過 15 分鐘＝提示「會記缺席」，可以選還是進去聽；下課前 30 分鐘以後＝沒去
                                            // （AA_137 第 4 節，使用者 2026-10-15「遲到就沒辦法上課喔」；原本 AA_104 4-1、4-2 是開始 30 分鐘後就不能進）
  const WD=['','週一','週二','週三','週四','週五','週六','週日'];
  S.WD=WD;
  // ---------- 紀錄（存檔 G.courses；舊存檔沒有＝空的，全部有預設值：AA_104 第 9 節）----------
  /* 課程代號 2026-10-13 照 AA_103 第 8 節改了（AA_110 差異表）：舊存檔的出席、準備、成績、提醒、選修照這張表換成新代號（不會讓玩家的紀錄消失）*/
  const OLD_IDS={chinese1:'chinese_y1',con_law1:'const_1',english1:'english_y1',gened1:'ge_film_y1s1',pe1:'pe_y1s1',chinese2:'chinese_y1_2',civ_obl1:'oblig_gen1',con_law2:'const_2',econ:'econ_principles_2',
    english2:'english_y1_2',gened2:'ge_y1s2',law_society2:'law_society_2',pe2:'pe_y1s2',civ_obl2:'oblig_gen2',civ_property:'property',gened3:'ge_y2s1',jurisprudence:'juris',pe3:'pe_y2s1',civ_obl_spec:'oblig_spec',
    gened4:'ge_y2s2',civ_proc1:'civpro_1',crim_proc:'crimpro',civ_proc2:'civpro_2',pil:'conflict_laws',case_seminar:'crim_judgment_sem',ethics:'legal_ethics',practicum:'legal_practice',anglo_law:'legal_english'};
  S.OLD_IDS=OLD_IDS;
  function migrateIds(R,G){ if((R.idv|0)>=3) return; if((R.idv|0)<2) migrateV2(R); migrateV3(R,G); }
  function migrateV2(R){ const ren=id=>OLD_IDS[id]||id; const rkey=k=>{ const p=String(k).split(':'); if(p.length===3) p[1]=ren(p[1]); return p.join(':'); };   /* 上課紀錄的 key＝天:課程:時段 */
    const merge=(o,f)=>{ const n={}; for(const k in o){ const nk=f(k); n[nk]=(typeof o[k]==='number'&&typeof n[nk]==='number')?n[nk]+o[k]:o[k]; } return n; };   /* 英美法併進法學英文：次數相加 */
    R.done=merge(R.done,rkey); R.attend=merge(R.attend,ren); R.prep=merge(R.prep,ren);
    for(const t in R.grades) if(R.grades[t]&&typeof R.grades[t]==='object') R.grades[t]=merge(R.grades[t],ren);
    R.note=merge(R.note,k=>k.indexOf('rem_')===0?'rem_'+rkey(k.slice(4)):k);
    const EL=R.electives; if(EL.Y1S2_elec!==undefined){ EL.Y1S2_ls=EL.Y1S2_elec==='econ'?'none':'law_society_2'; delete EL.Y1S2_elec; }   /* 大一下：經濟學原理改成必修（重修），法律與社會可選可不選 */
    delete EL.Y1S1_ls; delete EL.Y4S2_elec;   /* 大一上的法律與社會算已選；大四下法學英文／英美法是一門 */
    R.idv=2; }
  /* idv 3（2026-10-14 課程調整，使用者 16:15，企劃分支 AA_130 第 4 節）：刪掉的 7 門課的出席、準備、成績、上課紀錄、提醒、翹課、討論紀錄一起刪；
     選修群組 Y1S2_ls、Y3S2_elec 刪掉（選過公平交易法的人，大三下週四上午照勞動法上課）；法學英文搬到大二下，討論紀錄的鍵跟著換。
     存檔已經過了大二下：法學英文不補修，大二下的成績單寫「未修（2026-10-14 課程調整）」；大四下已經上過：成績單照「已修」。其他資料都不動 */
  const DROPPED=['law_society','law_society_2','juris','intl_public','legal_history','fair_trade','conflict_laws'];
  S.DROPPED=DROPPED;
  const TERM_ORDER=['Y0S1','Y0S2','Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.termIndex=id=>TERM_ORDER.indexOf(id);
  function migrateV3(R,G){ const gone=id=>DROPPED.includes(id); const keyGone=k=>{ const p=String(k).split(':'); return p.length===3&&gone(p[1]); };
    for(const k of Object.keys(R.done)) if(keyGone(k)) delete R.done[k];
    for(const id of DROPPED){ delete R.attend[id]; delete R.prep[id]; }
    for(const t in R.grades) if(R.grades[t]&&typeof R.grades[t]==='object') for(const id of DROPPED) delete R.grades[t][id];
    for(const k of Object.keys(R.note)){ let drop=false; if(k.indexOf('rem_')===0||k.indexOf('skip_')===0) drop=keyGone(k.slice(k.indexOf('_')+1)); else if(k.indexOf('skipn_')===0) drop=DROPPED.some(id=>k.indexOf('skipn_'+id+'_')===0); if(drop) delete R.note[k]; }
    for(const k of Object.keys(R.disc||{})){ if(DROPPED.some(id=>k.indexOf('_'+id+'_w')>0)) delete R.disc[k]; }
    if(R.disc&&R.disc.B_Y4S2_legal_english_w4!==undefined){ R.disc.B_Y2S2_legal_english_w4=R.disc.B_Y4S2_legal_english_w4; delete R.disc.B_Y4S2_legal_english_w4; }
    delete R.electives.Y1S2_ls; delete R.electives.Y3S2_elec;
    /* 法學英文搬家前已經在哪個學期：之後大二下／大四下的成績單照這個寫 */
    const T=G&&typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; const ti=T?S.termIndex(T.id):-1;
    if(ti>S.termIndex('Y2S2')) R.leMoved={after:T.id,took:(R.attend.legal_english|0)>0};
    R.idv=3; }
  S.rec=function(G){ const R=G.courses&&typeof G.courses==='object'?G.courses:(G.courses={}); for(const k of ['done','attend','prep','electives','grades','note','disc','ask','late','abs']) if(!R[k]||typeof R[k]!=='object') R[k]={}; migrateIds(R,G); if(R.rollSince==null) R.rollSince=G.day!=null?G.day:0; return R; };   /* rollSince：ATTEND-ROLLCALL-1102 的規則從哪一天開始（新遊戲＝開局那天、舊存檔＝第一次讀到的那天）*/
  S.byId=id=>COURSES.list.find(c=>c.id===id)||null;
  S.enrolled=function(G,c){
    if(c.route&&!(G&&typeof STORY!=='undefined'&&STORY.route&&c.route.includes(STORY.route(G)))) return false;   /* 只給某條交換路線的課（AA_144 X4 日本路線大四下的補修，courses.js 的 route）*/
    if(!c.route&&G&&S.termAway(G,c.term)) return false;   /* 日本路線不修台灣的大三下（AA_341 J-S6；src/jp3d.js）：不排課、不考試、成績單換日本的兩門。
       K1-1（CC_K1、BB 10:21）：美國路線不修台灣的大四上也一樣（原本只問 JP.skipTerm：手機「法律」頁的「這學期」在美國時列出台灣大四上的課、每門 0／N；examList 也排出 5 場）*/
    if(!c.choice) return true; const pick=(S.rec(G).electives||{})[c.choice.group];   /* ||{}：rec 被換掉、沒有 electives 時不丟例外（pool_aafix 的假 rec）*/ const cur=pick===undefined?c.choice.default:pick; return cur===c.id; };
  S.termCourses=(G,termId)=>{ const L=COURSES.list.filter(c=>c.term===termId&&S.enrolled(G,c)); if(G) S._lastG=G; const rt=G&&G.courses&&Array.isArray(G.courses.retake)?G.courses.retake.filter(r=>r.term===termId):[]; return rt.length?L.concat(rt.map(r=>S.rtCourse(r)).filter(Boolean)):L; };
  /* ---------- 被當、重修（D42：使用者 10-18 02:2x「沒有暑修」，被當的課下一學期再修；衝堂就開另一個老師的同一門課，放在不衝堂的時段；00_現行設定總表第 3 節）----------
     被當：法律課期末考 0 分（答對 0 題）或缺考；看出席的課不到三堂。成績單發的那一刻（showGrades）排進下一個學期（G.courses.retake：{id,from,term,slots,alt}）；
     那一學期的課表多一門「○○（重修）」，原本的時段不衝堂就照原本的時段，衝堂就換到空著的時段（另一位老師的班）；期末一樣考五題（題目照原本那一學期的題庫），出席一樣三堂。
     重修又被當＝再下一學期再修。大四下被當的延畢一學期還沒做（成績單照樣寫不及格）。日本路線不修台灣的大三下、美國路線不修台灣的大四上：排到再下一學期。舊存檔已經發過的成績單不追溯。 */
  const rtObjs=new WeakMap();
  S.rtCourse=function(r){ if(!r) return null; let o=rtObjs.get(r); if(o) return o; const c=S.byId(r.id); if(!c) return null;
    o=Object.assign({},c,{term:r.term,slots:r.slots.map(s=>Object.assign({},s)),name:c.name+'（重修）',rt:{from:r.from,base:r.base||r.from,alt:!!r.alt}});   /* rt（不用 retake：經濟學原理的 retake:true 是另一件事）*/ delete o.choice; delete o.route; rtObjs.set(r,o); return o; };
  S.rtTerm=function(courseId,termId){ const G=S._lastG; const L=G&&G.courses&&Array.isArray(G.courses.retake)?G.courses.retake:[]; const r=L.find(x=>x.id===courseId&&x.term===termId); return r?(r.base||r.from):termId; };   /* 重修那一學期抽題用原本那一學期的題庫（重修又被當：base 還是最原本那一學期）*/
  S.LAW_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.termAway=(G,t)=>(typeof JP!=='undefined'&&JP.skipTerm&&JP.skipTerm(G,t))||(t==='Y4S1'&&typeof STORY!=='undefined'&&STORY.route&&STORY.route(G)==='US');   /* 人在國外的學期：台灣的課不上、不考 */
  /* 修過的考五題法律課（D118-B7-1102；D118_PLAN 第 1 節 ③-4、第 4 節 B7：國考一試只出修過的範圍，PG.poolFor 用）：
     法律系八個學期的成績單（R.grades[學期]）上有的課；成績單還沒發、期末考（或大四下補考）已經考過的也算（R.exam 的 '學期:課:final|makeup' status done）。
     人在國外的學期（S.termAway：日本路線的大三下、美國路線的大四上）不算——舊存檔留著那一學期的成績單、考試紀錄也一樣。
     重修那一門＝原課（id 一樣）；日本路線的補修（civpro_2_re、insurance_re）＝原課（S.redoOf）；刪掉的舊課（DROPPED）、不考五題的課不算。
     回傳 COURSES.list 的課（照課程順序、不重複）；沒有 G.courses（新遊戲、舊的測試存檔）＝[]，也不建 G.courses。不改成績單、考試紀錄（S.rec 照舊換舊課程代號）*/
  S.Y5_MAKEUP=['enforcement','legal_ethics'];   /* 美國路線大五上補修的兩門（同 src/y5s1_3d.js Y5.MAKEUP；Y5 載入了就照 Y5.MAKEUP）*/
  S.takenCourses=function(G){ if(!G||!G.courses||typeof G.courses!=='object') return []; const R=S.rec(G), seen=new Set();
    const add=id=>{ const rd=S.redoOf(id), cid=rd?rd.id:id, c=S.byId(cid); if(c&&S.isExamCourse(c)) seen.add(cid); };
    for(const t of S.LAW_TERMS){ if(S.termAway(G,t)) continue; const g=R.grades&&R.grades[t]; if(g&&typeof g==='object'&&!Array.isArray(g)) for(const id in g) add(id); }
    const E=R.exam&&typeof R.exam==='object'?R.exam:{};
    for(const k in E){ const p=String(k).split(':'); if(p.length!==3||(p[2]!=='final'&&p[2]!=='makeup')||!S.LAW_TERMS.includes(p[0])||S.termAway(G,p[0])) continue; const e=E[k]; if(e&&e.status==='done') add(p[1]); }
    /* BB-C 11-04 23:46（D118-B7 ①）：美國路線大五上補修的強制執行法、法律倫理（src/y5s1_3d.js Y5.MAKEUP）沒有成績單、也沒有考試，可是課是在遊戲裡上過的
       （Y5.attend 播大四上那兩門的課堂內容 CLS.content）——上過至少一堂（G.y5.cls 有那一門的鍵 '日:課'）＝算修過；不算等於罰去交換的人。Y5 晚載入（y5s1_3d.js 在後面），呼叫的時候才看 */
    { const y5=G.y5&&G.y5.cls&&typeof G.y5.cls==='object'?G.y5.cls:null, MK=typeof Y5!=='undefined'&&Array.isArray(Y5.MAKEUP)?Y5.MAKEUP.map(m=>m.id):S.Y5_MAKEUP;
      if(y5){ const ks=Object.keys(y5); for(const id of MK) if(ks.some(k=>y5[k]&&String(k).split(':')[1]===id)) add(id); } }
    return COURSES.list.filter(c=>seen.has(c.id)); };
  S.retakeTermAfter=function(G,termId){ let i=S.LAW_TERMS.indexOf(termId); if(i<0) return null;
    for(i++;i<S.LAW_TERMS.length;i++){ const t=S.LAW_TERMS[i]; if(S.termAway(G,t)) continue; return t; } return null; };
  S.failedIn=function(G,termId){ const R=S.rec(G), out=[]; if(S.termAway(G,termId)) return out; for(const c of S.termCourses(G,termId)){ if(c.kind==='service') continue;
      if(S.isExamCourse(c)){ if(S.makeupPassed(R,termId,c.id)) continue;   /* D118 大四下補考過了（src/faildelay3d.js）＝及格 */ const e=(R.exam||{})[termId+':'+c.id+':final']; if(e&&(e.status==='insufficient'||e.status==='rescued')) continue;   /* rescued：BUG-Y4S2-NOFINAL-1102 舊存檔救回來的（期末考補登）*/ const p=S.examPool(c.id,termId,'final'); if(!e&&p.cls.length+p.bank.length+p.ai.length<5) continue; if(!e||e.status!=='done'||(e.correct|0)===0) out.push(c); continue; }
      if(S.attCourse(c)&&!S.attPass(G,c,termId)) out.push(c); } return out; };
  /* D118 大四下補考（使用者 2026-11-02 05:0x Q4；src/faildelay3d.js）：補考的紀錄 R.exam['學期:課:makeup']（drawExam／runExam 的 kind 'makeup'）；及格門檻同期末（答對 1 題以上） */
  S.makeupPassed=(R,termId,id)=>{ const m=R&&R.exam&&R.exam[termId+':'+id+':makeup']; return !!m&&m.status==='done'&&(m.correct|0)>0; };
  /* 重修排時段（planRetakes 的 place；大五上的重修 FD.slots 也用）：原本的時段都沒被佔＝照原本；有一個衝到＝整門換到空著的時段（週一起、同一天只排一堂）；排不下＝null。used＝Set('wd:block')，不會被改 */
  S.placeSlots=function(slots0,used0){ const used=new Set(used0); const clash=slots0.some(s=>used.has(s.wd+':'+s.block)); let slots=slots0.map(s=>({wd:s.wd,block:s.block})), alt=false;
    if(clash){ alt=true; slots=[]; for(let wd=1;wd<=5&&slots.length<slots0.length;wd++) for(const b of ['am','pm1','pm2']){ if(slots.length>=slots0.length) break; const k=wd+':'+b; if(used.has(k)||slots.some(s=>s.wd===wd)) continue; slots.push({wd,block:b}); used.add(k); } }
    return slots.length<slots0.length?null:{slots,alt}; };
  S.planRetakes=function(G,termId){ const R=S.rec(G); if(!Array.isArray(R.retake)) R.retake=[]; const fails=S.failedIn(G,termId), to=S.retakeTermAfter(G,termId), made=[]; if(!to) return made;
    /* 排進某一學期：那學期的課（含已排的重修）佔掉的時段避開；排不下回 null */
    const place=(c,tt)=>{ const used=new Set(); for(const x of S.termCourses(G,tt)) for(const s of x.slots) used.add(s.wd+':'+s.block); return S.placeSlots(c.slots,used); };
    for(const c of fails){ if(R.retake.some(r=>r.id===c.id&&r.from===termId)) continue;
      /* BUG-RETAKE-OVERFLOW-1102（BB 09:45，CC M3）：全部被當時重修可能把下一學期一週 15 個時段排滿，後面的原本直接消失（繼續修不到、成績一直是不及格）。
         排不下＝順延到再下一學期，手機用教務處的系統通知告訴玩家（暫定字 S.RT_DEFER_TEXT，AA 定稿後換）；再下一學期也排不下（或已經沒有學期）才放棄並記 R.retakeDropped */
      let tt=to, pl=place(c,tt), deferred=false; while(!pl){ const nx=S.retakeTermAfter(G,tt); if(!nx){ tt=null; break; } tt=nx; deferred=true; pl=place(c,tt); }
      if(!pl){ R.retakeDropped=R.retakeDropped||[]; if(!R.retakeDropped.includes(c.id)) R.retakeDropped.push(c.id); console.warn('CLS.planRetakes 排不下',c.id,termId); continue; }
      const r={id:c.id,from:termId,base:(c.rt&&c.rt.base)||termId,term:tt,slots:pl.slots,alt:pl.alt}; if(deferred) r.deferred=true; R.retake.push(r); made.push(r); if(S.attCourse(c)) R.attend[c.id]=0;   /* 看出席的課：重修那一學期重新算三堂 */
      if(deferred&&typeof PHONE!=='undefined'&&PHONE.post&&!PHONE.sent(G,'rt_defer_'+c.id+'_'+termId)) PHONE.post(G,{th:'sys',text:S.RT_DEFER_TEXT(c.name,S.termName(tt)),tag:'rt_defer_'+c.id+'_'+termId}); }
    return made; };
  S.RT_DEFER_TEXT=(n,tn)=>'【教務處】'+n+'重修：下學期課表衝堂，改排在'+tn+'。';   /* AA 2026-11-02 09:51 定稿 */
  /* 書店的教科書（SYS-BOOKS-1018；使用者 10-18 選擇題 D102、USER_WANTS X15）：這學期（放假時＝下一個學期）修的必修、選修各一本，書名照課名（去掉「（上）」「（一）」）；
     同一本書上下學期共用（經濟學原理（上）（下）是同一本）；研討、實習沒有教科書。買了記 G.flags.books[書名]；舊存檔買過民總（F.textbook）算有《民法總則》。
     效果只有讀那一科（D102：不做書架、同學注意、解鎖內容）：自學那一科多一分準備（studyPick）、那一科的期末考（五題）多一次想起答案（runExam）*/
  S.BOOK_SKIP=new Set(['legal_research','legal_practice','crim_judgment_sem','public_judgment_sem','service_1','service_2']);
  S.bookTitle=c=>String(c&&c.name||'').replace(/（[上下一二三四]）$/,'');
  S.hasBook=(G,c)=>{ const F=(G&&G.flags)||{}, t=S.bookTitle(c); return !!((F.books&&F.books[t])||(t==='民法總則'&&F.textbook)); };
  S.bookList=function(G){ if(typeof CALENDAR==='undefined'||!CALENDAR.termOf) return []; let t=null; for(let d=G.day;d<G.day+120&&!t;d++) t=CALENDAR.termOf(d); if(!t) return [];
    const out=[], seen=new Set(); for(const c of S.termCourses(G,t.id)){ if((c.kind!=='required'&&c.kind!=='elective')||S.BOOK_SKIP.has(c.id)) continue; const title=S.bookTitle(c); if(seen.has(title)) continue; seen.add(title); out.push({title,c,price:650}); } return out; };
  S.termName=id=>({Y0S1:'經濟系大一上',Y0S2:'經濟系大一下',Y1S1:'大一上',Y1S2:'大一下',Y2S1:'大二上',Y2S2:'大二下',Y3S1:'大三上',Y3S2:'大三下',Y4S1:'大四上',Y4S2:'大四下',Y5S1:'大五上'})[id]||id;   /* Y5S1：交換延畢（AA_357 1-1，src/y5s1_3d.js）*/
  S.profName=c=>c.prof?((COURSES.profs[c.prof]||'').slice(0,1)+'老師'):(c.profName||'老師');
  S.roomName=c=>(COURSES.rooms[c.room]||{}).name||'';
  // 每一週講哪一個主題：上課週（第 1～7、10～16 週）照順序平均分到 topics；考試週＝考試
  const TEACH=[1,2,3,4,5,6,7,10,11,12,13,14,15,16];   /* 第 8～9 週（D118 起沒有期中考、照常上課）：S.topic 用第 7 週的主題 */
  const LISTED=TEACH.concat([8,9]);   /* 法律頁、自習筆記列的週（AA_585 補了 30 門第 8、9 週的黑板，AA588-AA585 整合時子代理提醒）：TEACH 只管 S.topic 的主題分配，不動 */
  S.topic=function(c,week){ if(week===8||week===9) week=7; const i=TEACH.indexOf(week); const T=c.topics||[]; if(!T.length) return ''; if(i<0) return T[T.length-1]; return T[Math.min(T.length-1,Math.floor(i*T.length/TEACH.length))]; };
  // ---------- 某一天的課 ----------
  S.DAY2_START=13+5/60;   /* 第 2 天開始的時間（story3d.js sleepNow：「第二天 週四 13:05 · 霖澤館前」）*/
  S.dayItems=function(G,day){ if(day==null) day=G.day; if(typeof CALENDAR==='undefined'||CALENDAR.holiday(day)) return []; if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(Object.assign({},G,{day}))) return [];   /* 交換期間人在國外：台灣的課不排（src/exchange3d.js）*/ if(!(t0=>t0&&/^Y0/.test(t0.id))(CALENDAR.termOf(day))){ const ls=typeof STORY!=='undefined'&&STORY.lawStart?STORY.lawStart(G):1, m1=typeof STORY!=='undefined'&&STORY.mainD1?STORY.mainD1(G):1; if(day<ls||(day===m1&&ls===m1)) return []; }   /* 經濟系大一（Y0，負的天數）照常排課（v0）；法律系：這一局開始那天（STORY.lawStart：舊存檔與現在的開局＝第 1 天，開局 B＝第 −16 天 8/31，D91）以前的課不排；從第 1 天開始的局，9/17 白天的課在遊戲開始（21:12）之前，不排、不算沒去（使用者 2026-10-15：「第一天就有一個刑法課顯示沒去？」）*/ const t=CALENDAR.termOf(day); if(!t) return []; const wd=CALENDAR.dateOf(day).wd; const out=[];
    const R0=G.courses&&typeof G.courses==='object'?G.courses:null;
    for(const c of S.termCourses(G,t.id)){ if(c.weeks&&!c.weeks.includes(t.week)){ const att=R0&&R0.attend?(R0.attend[c.id]||0):0; if(!(c.makeupWeeks&&c.makeupWeeks.includes(t.week)&&att<c.weeks.length)) continue; }   /* 只有某幾週的課（服務學習：AA_110 6-1）；次數不夠時補做週也排 */
     for(const s of c.slots){ if(s.wd!==wd) continue; const b=B(s.block); out.push({c,slot:s,t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+s.block,room:COURSES.rooms[c.room]||{},week:t.week,exam:/^Y0/.test(t.id)?(c.kind==='service'||S.noExam(c)?null:t.exam):(S.isExamCourse(c)&&t.exam==='final'?'final':null),term:t.id}); } }   /* D118-B1：法律系沒有期中考（使用者 2026-11-02 05:0x；期中週照常上課）、只有考五題的法律課有期末考（經濟系那一年 Y0 照舊：E11、E19 等劇情掛在那幾場考試上，成績固定及格）；其他課（國文、英文、通識、體育、經濟系那一年、服務學習、法律專題研究、實習）考試週照常上課、算出席——原本是照讀書次數給旁白的假考試、而且那一堂不算出席 */   /* 沒有考試的課（題庫標 exam:'none'：大四下法律專題研究、法律實習）期中期末週照常上課（AA_327 2-Y4-41：5/28 第 15 週是專題研究最後一堂）*/
    if(t.exam==='final'&&S.isExamCourse){   /* 考五題的法律課：考試週只考一次（AA_130 第 3-2 節第 2 點）——那門課在考試週的第一堂不是假日的課；兩週都放假就補一堂（S.examDay）*/
      for(let i=out.length-1;i>=0;i--){ const it=out[i]; if(!it.exam||!S.isExamCourse(it.c)) continue; const d=S.examDay(G,it.c,t.id,t.exam); if(d&&d.day===day&&d.block===it.slot.block) it.examMain=true; else out.splice(i,1); }
      for(const c of S.termCourses(G,t.id)){ if(!S.isExamCourse(c)||out.some(it=>it.c===c)) continue; const d=S.examDay(G,c,t.id,t.exam); if(!d||!d.makeup||d.day!==day) continue; const b=B(d.block);
        out.push({c,slot:{wd,block:d.block},t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+d.block,room:COURSES.rooms[c.room]||{},week:t.week,exam:t.exam,term:t.id,examMain:true,makeup:true}); } }
    out.sort((a,b)=>a.t0-b.t0);
    /* 第 2 天（9/18 週四）遊戲從 13:05 霖澤館前開始（story3d.js 的 sleepNow）：早上的大一英文在那之前，不排、不算沒去（使用者 2026-10-16：「第二天……卻顯示當天早上有一堂課沒有參加」；第 1 天同理，見上）*/
    if(day===m1d(G)+1&&(typeof STORY!=='undefined'&&STORY.lawStart?STORY.lawStart(G):1)===m1d(G)&&!/^Y0/.test(t.id)) for(let i=out.length-1;i>=0;i--) if(out[i].t0<S.DAY2_START) out.splice(i,1);   /* 主線第二天（舊存檔 9/18）：13:05 以前睡過去了。選 1 的局 9/4 早上照常上課（AA-B 20:50 第 5 題）*/
    /* 同一門課同一天連著兩格（大四下的實習整天）：合併成一格 */
    for(let i=out.length-1;i>0;i--){ if(out[i].c===out[i-1].c){ out[i-1].t1=out[i].t1; out.splice(i,1); } }
    return out; };
  /* 'upcoming'（還沒開始、還不能進）／'open'（可以進教室上課）／'missed'（開始後 30 分鐘還沒來）／'done'（上過了）*/
  S.status=function(G,it){ const R=S.rec(G), h=hr(G); if(R.done[it.key]) return 'done'; if(it.day<G.day||(it.day===G.day&&late(G))) return 'missed'; if(it.day>G.day) return 'upcoming'; if(h<it.t0-WIN0) return 'upcoming'; if(h<it.t1-LATE_END) return 'open'; return 'missed'; };
  S.lateMin=(G,it)=>it.day===G.day?Math.max(0,(hr(G)-it.t0)*60):0;   /* 開始後幾分鐘才進教室（0＝準時）*/
  S.isLate=(G,it)=>{ const m=S.lateMin(G,it); return m>=1&&m<=WIN1*60; };
  S.isLateAbsent=(G,it)=>S.lateMin(G,it)>WIN1*60;
  S.live=(G,it)=>it.day===G.day&&!late(G)&&hr(G)>=it.t0-WIN0&&hr(G)<it.t1;   // 這堂課現在在上（教授在教室、同學在座位上）
  /* 第二天的民法總則（劇情課）：story3d.js 處理 */
  const m1d=G=>typeof STORY!=='undefined'&&STORY.mainD1?STORY.mainD1(G):1;   /* 主線第一天（START-WEEK 選 1：舊存檔＝1、新局＝−13）*/
  S.storyClass=(G,it)=>it.c.id==='civ_general'&&it.day===m1d(G)+1;   /* 第二天的民總是劇情（story3d.js）；用那一堂的日期（翹課轉述也查前一天）*/
  S.next=function(G){ return S.dayItems(G).find(it=>{ const s=S.status(G,it); return (s==='open'||s==='upcoming')&&!S.storyClass(G,it); })||null; };
  S.open=function(G){ return S.dayItems(G).find(it=>S.status(G,it)==='open'&&!S.storyClass(G,it))||null; };
  S.liveIn=function(G,zone){ return S.dayItems(G).filter(it=>S.live(G,it)&&it.room.zone===zone&&!S.storyClass(G,it)); };
  S.liveDoor=function(G,door){ return S.dayItems(G).find(it=>S.live(G,it)&&it.room.door===door)||null; };
  /* 教授現在在哪（story3d.js 的 schedFor 用）：上課時在那間教室、下課後 1.5 小時在萬才館（和以前一樣） */
  S.profWhere=function(G,profId){ for(const it of S.dayItems(G)){ if(it.c.prof!==profId) continue; const h=hr(G); if(S.live(G,it)) return it.room.zone?{zone:it.room.zone,act:'class',room:it.room.room}:null; if(h>=it.t1&&h<it.t1+1.5&&!(typeof CHARACTERS!=='undefined'&&CHARACTERS[profId]&&CHARACTERS[profId].office===false)) return {zone:'wancai',act:'office'}; } return null; };   /* office:false＝下課後不去萬才館（經濟系的魏教授）*/
  // ---------- 文字 ----------
  S.itemText=it=>hhmm(it.t0)+' '+it.c.name+'（'+(it.room.name||'')+'）';
  /* AA_363 T7-1：畢業生（GRADUATED）已經不是學生——沒延畢的 2029-09-03 起、交換延畢的領證書那天（2030-01-21，AA_357 1-1「1/21 以後照畢業後篇」）起，
     日期標籤只寫日期和星期（例：「10/17 週三」；國定假日照寫「10/10 週三・國慶日」），不寫學期、不寫寒暑假。之前照原本（沒延畢的 6/2～9/2「暑假」；延畢的大五上 y5s1_3d.js、12/24～1/20「寒假」）*/
  S.PG_PLAIN={plain:'2029-09-03',delayed:'2030-01-21'};
  S.pgPlain=function(G,key){ const F=G&&G.flags; if(!F||!F.GRADUATED||(G.stage||'law')!=='law'||!key) return false; const del=typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G); return key>=S.PG_PLAIN[del?'delayed':'plain']; };
  S.dayLabel=function(G,day){ if(day==null) day=G.day; const d=CALENDAR.dateOf(day), t=CALENDAR.termOf(day), hol=CALENDAR.holiday(day), mk=!hol&&CALENDAR.mark?CALENDAR.mark(day):null; let s=d.m+'/'+d.d+' '+WD[d.wd];
    if(S.pgPlain(G,d.key)) return hol?s+'・'+hol:s;   /* AA_363 T7-1：只寫日期和星期；國定假日名照留（AA_363 第 4 節第 3 題：拿掉的只是學期、寒暑假這種學生的字）*/
    if(hol) s+='・'+hol; else if(mk) s+='・'+mk;   /* mark：日曆只標字、照常上課（大二起的全校運動會，AA_355 第 5 節第 6 題）*/
    if(t) s+='・'+S.termName(t.id)+' 第 '+t.week+' 週'+(t.exam==='final'?'（期末考週）':''); else s+='・'+(d.m>=6&&d.m<=9?'暑假':'寒假'); return s; };   /* 9 月開學前還是暑假（2026-10-13 審查：原本寫成寒假）*/
  S.todayLine=function(G){ const its=S.dayItems(G); if(!its.length){   /* 第二天的民總（劇情課）也列出來：原本濾掉＝HUD 寫「今天沒有課」、劇情目標卻是「進入霖澤館上課（13:20）」（BB-B 10-23 DAY12）；一鍵上課照舊不給它（storyClass 在 S.next／按鈕那邊擋）*/ const hol=CALENDAR.holiday(G.day), t=CALENDAR.termOf(G.day); return hol?'今天放假（'+hol+'），沒有課':(t?'今天沒有課':'放假中，沒有課'); }
    const ex=its[0].exam; return '今天'+(ex?'考試':'的課')+'：'+its.map(it=>hhmm(it.t0)+' '+it.c.name).join('、'); };
  // ---------- 目標（起床時、下課後）：今天的課＋往下一堂的教室導航；不蓋掉劇情的目標 ----------
  S.goalFor=function(G){ const nx=S.next(G); const txt=nx&&nx.exam?hhmm(nx.t0)+' '+S.examName(nx)+'：'+nx.c.name+(nx.room&&nx.room.name?'（'+nx.room.name+'）':''):S.todayLine(G)+(nx?'。上課、讀書或自由活動都可以':'。自由活動：去圖書館、公館，或找人聊天');   /* UX-EXAMDAY-GOAL（BB 14:30）：今天還有沒考的考試＝目標寫「09:10 期末考：刑法總則（一）」*/
    let dest=null; if(nx){ if(nx.room.zone==='classroom'||nx.room.whole) dest={zone:nx.room.zone,name:nx.room.name};   /* whole：整個區域就是那間教室（萬才館多功能教室、霖澤館 202）：導航到那個區域 */ else if(nx.room.zone&&nx.room.room) dest={zone:nx.room.zone,label:S.roomLook(nx.room),name:nx.room.name}; else if(nx.room.door&&nx.room.zone) dest={zone:nx.room.zone,label:nx.room.label||nx.room.name,name:nx.room.name};   /* 區域裡的門口上課（沒有教室座位：萬才館研討室 A）：導航指那扇門 */ else if(nx.room.door) dest={zone:'campus',label:nx.room.name,name:nx.room.name}; }
    return {text:txt,dest}; };
  /* 建築裡的教室（src/teach3d.js）：門口「看看共同 101 教室」那個互動點（目標導航找得到）*/
  const BLDG_SHORT={gongtong:'共同 ',boya:'博思 ',putong:'普通 '};
  S.roomLook=room=>'看看'+(BLDG_SHORT[room.zone]||'')+room.room;   /* 門口的「看看共同 101 階梯教室」「看看博雅 101 階梯教室」「看看普通 101 教室」（開頭相同就找得到）*/
  S.isClsGoal=G=>!!G.flags&&G.flags.clsGoal===G.goal;
  S.setGoal=function(GM){ const G=GM.G, g=S.goalFor(G); GM.setGoal(g.text,g.dest); G.flags.clsGoal=G.goal; };
  S.refreshGoal=function(GM){ const G=GM.G; if(!G||!S.isClsGoal(G)) return; const g=S.goalFor(G); if(g.text!==G.goal||JSON.stringify(g.dest||null)!==JSON.stringify(G.goalDest||null)) S.setGoal(GM); };   /* 文字或目的地有一個變了就重設（2026-10-13 審查第 3 項：文字整天一樣，原本目的地停在早上那堂課）*/
  // ---------- 課堂的內容：BB 的 syllabus（之後）或依教授風格的一般句子 ----------
  const STYLE={
    prof_zhou:t=>['「今天講'+t+'。先不要翻課本——你們覺得呢？」','坐你旁邊的人小聲說：「他又要點人了。」'],
    prof_zhang:t=>['「講義翻到今天這一節：'+t+'。我們照講義走。」','前排的人已經把講義翻到下一頁了。'],
    prof_wu:t=>['「'+t+'——上週講了一半，今天繼續。」','後排有人笑了一聲：「上週也是這樣說的。」'],
    prof_huang:t=>['「今天先從一則新聞開始，再談'+t+'。」','有人把手機收起來，開始抄投影片上的標題。'],
    prof_xu:t=>['「先看德國怎麼處理'+t+'，再看日本。」','你前面的人在筆記上畫了兩個欄位：德、日。'],
    prof_tsai:t=>['「'+t+'，實務上最常出問題的是這裡。」','有人小聲說：「聽說她上學期請了一個律師來上課。」'],
    prof_lin:t=>['「今天從一個真實的案子開始，談'+t+'。」','教室很安靜，只有翻講義的聲音。'],
    prof_chen:t=>['「這週輪到誰報告'+t+'？」','你旁邊的人默默把頭低下去。'],
    prof_zheng:t=>['「我先畫張圖。」黑板上多了一塊地、一棟房子。今天講'+t+'。','你也跟著在筆記上畫了一塊地。'],
    prof_ye:t=>['「這是一份真的契約，名字都塗掉了。今天從這裡談'+t+'。」','有人舉手問：「老師，這份可以拍照嗎？」'],
    prof_he:t=>['「今天的議程：'+t+'。有問題先記下來，最後一起問。」','坐你後面的人說：「好像在開會。」'],
    prof_jian:t=>['「出事了——假設你是保險公司。今天談'+t+'。」','有人小聲說：「每次都是出事了。」'],
  };
  const GENERAL=t=>['老師今天上'+t+'。','旁邊的人打了一個呵欠，又趕快坐直。'];
  /* 外面整句一對「」拿掉（同 invites3d.js、libquiet3d.js 的 S.unq；「A」「B」這種好幾段的、「…」後面還有字的不動）。TEXT-QUOTE-UNIFY-1108 第八批（AA-B 11-08 13:05「只做有名字的」）：
     上面 STYLE 的開場同一個字串兩條路——教授在場（S.attend 的 GM.say(prof,…)，對話框是教授的名字）＝拿掉外面的「」；不在場（EVENTS.npcOf 找不到教授：名字寫在字裡「周老師：「…」」、對話框沒有名字；
     y5s1_3d.js 大五補修的重播也是這樣）照留、一字不改。所以 STYLE 的字不改，只在教授在場那一條路拿掉；鄭教授那句「「我先畫張圖。」黑板上…」不是整句一對，不動 */
  /* 教授在場時那一句拆開（AA-B 11-08 13:38「鄭教授 STYLE 拆成三段（字不改）：鄭教授「我先畫張圖。」→ 旁白「（黑板上多了一塊地、一棟房子。）」→ 鄭教授「今天講{t}。……」；不在場的版本照現在」）：
     只認鄭教授那一句的寫法（syllabus 有「「有逃亡之虞」，五個字。」這種引用開頭的，不能拆）；其他照舊 S.unq（整句一對「」才拿掉）。回傳 [['prof'|'narr',字],…] */
  S.SPLIT=[/^「(我先畫張圖。)」(黑板上多了一塊地、一棟房子。)(今天講.*)$/];
  S.profParts=t=>{ for(const re of S.SPLIT){ const m=re.exec(t); if(m) return [['prof',m[1]],['narr','（'+m[2]+'）'],['prof',m[3]]]; } return [['prof',S.unq(t)]]; };
  S.unq=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return t; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='「') d++; else if(ch==='」'){ d--; if(d===0&&i!==t.length-1) return t; } } return d===0?t.slice(1,-1):t; };
  /* BB 的普通課堂內容（src/data/syllabus.js，AA_104 的 syllabus 格式）：每週 {w, tpl A／B／C, board 三行, line 教授一句, react 同學反應[{who,text}], obs 觀察小選擇, call 被點到}；
     國文、英文、體育、實習是台詞池（pools：每週一句）。同學反應只用遊戲裡已經有的人物（heroine_06、日文班等新人物的設定還沒確認：略過），'class'＝不具名同學 */
  let sylDone=false; function attachSyllabus(){ if(sylDone||typeof SYLLABUS==='undefined'||typeof COURSES==='undefined') return; sylDone=true;
    for(const c of COURSES.list){ const sid=c.redo||c.id; if(SYLLABUS.courses[sid]) c.syllabus=SYLLABUS.courses[sid]; if(SYLLABUS.pools[sid]) c.pool=SYLLABUS.pools[sid]; if(SYLLABUS.skip[sid]) c.skipLines=SYLLABUS.skip[sid]; if(SYLLABUS.second&&SYLLABUS.second[sid]) c.second=SYLLABUS.second[sid]; } }   /* redo：補修重播那一門的 syllabus（AA_144 X4）*/
  const inScene=id=>{ if(typeof GAME==='undefined'||!GAME.E||!GAME.E.npcs||typeof EVENTS==='undefined'||!EVENTS.npcOf) return true; return !!EVENTS.npcOf(id); };   /* 3D 場景裡：同學要真的在教室才有反應句（使用者 2026-10-15：以安不在教室卻回答老師）；沒有場景（單元測試）照舊 */
  /* 門口上課（2D，S.attend 的 o.door；進不去的房間：萬才館研討室 A、共同教學館 102…）：教室沒有 3D 同學，inScene 一律 false＝有名字的同學的反應句、obs 回話全部被濾掉（CC 11-11 17:11：法律專題研究 w12 阿哲、芯慈、柏翰三句沒播）。
     改看作息：那個時間的作息是這一堂（STORY.schedEnt：法律系同屆必修＝STORY.classmateClass 帶 cls＝這一堂的 key；日文班照 daily_schedule 的教室）＝在教室，和 3D 教室生出同學用同一套（使用者 2026-10-15「以安不在教室卻回答老師」的規則照舊）。
     體育課在館內 3D 上（inGym）照舊看 inScene */
  let doorIt=null; (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['classes3d:doorIt']=()=>{ doorIt=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：門口上課上到一半讀檔，舊的那一堂不留著 */
  const schedIn=(id,it)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt||typeof GAME==='undefined'||!GAME.G||typeof CHARACTERS==='undefined'||!CHARACTERS[id]) return true; let e=null; try{ e=STORY.schedEnt(CHARACTERS[id],GAME.G); }catch(err){ console.warn('CLS.schedIn',err); return false; }
    if(!e||e.act!=='class') return false; if(e.cls!=null) return e.cls===it.key; const R=it.room||{}; return !!R.zone&&e.zone===R.zone&&(R.room==null||e.room==null||String(e.room)===String(R.room)); };
  const reactOK=(r,day,away)=>r&&r.text&&(r.who==='class'||(r.who!=='heroine_06'&&r.who!=='heroine_05'&&typeof CHARACTERS!=='undefined'&&!!CHARACTERS[r.who]&&(day==null||typeof STORY==='undefined'||!STORY.present||STORY.present(r.who,{day}))&&(away||(doorIt?schedIn(r.who,doorIt):inScene(r.who)))));   /* 那學期不在學校的人（presence）沒有反應句；溫書瑀高兩屆，不在祐廷的任何一堂課（AA_110 5-7）*/   /* away：翹課的群組轉述（skipNotes）是群組訊息，說的人不用在玩家身邊（2026-10-19：原本也要 inScene，中午在校園收不到轉述）*/
  S.reactLine=function(r){ if(!r) return ''; const act=/^（.*）$/.test(r.text); if(r.who==='class') return act?r.text:'同學：「'+r.text+'」';
    const known=typeof STORY==='undefined'||!STORY.knows||STORY.knows(r.who);   /* BB_170 第 11、32 列：還沒認識的同學（例：開學第一週的沛珊、明軒、以安）顯示「同學」，認識以後才顯示名字 */
    const nm=!known?'同學':((typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(r.who):((CHARACTERS[r.who]||{}).name||'同學')); return act?nm+r.text:nm+'：「'+r.text+'」'; };
  S.rot=(it,n)=>(((it.day+it.week)%n)+n)%n;   /* 輪流的序號：經濟系那一年的日子是負數，% 會變負的、取不到句子（BB_218：2024-09-04 微積分、體育「老師：undefined」）*/
  /* 宥辰不在的那一堂（AA_497 1-2：12:00 以前的必修只在考試前後，STORY.youchenAway）：他那一句照舊，說話人改「同學」（不具名同學，'class'）*/
  S.reactAs=(r,it)=>r&&typeof STORY!=='undefined'&&STORY.YOUCHEN&&r.who===STORY.YOUCHEN&&STORY.youchenAway&&STORY.youchenAway(it)?Object.assign({},r,{who:'class'}):r;
  const pickReact=(arr,it)=>{ const ok=(arr||[]).map(r=>S.reactAs(r,it)).filter(r=>reactOK(r,it.day)); return ok.length?S.reactLine(ok[S.rot(it,ok.length)]):''; };
  /* 一週兩格的課（大三上的民訴甲上、刑訴；AA_103）：這一堂是那一週的第幾格（照星期排）、前面的格子是不是都放假 */
  S.slotOrder=function(it){ const ss=(it.c.slots||[]).slice().sort((a,b)=>a.wd-b.wd||String(a.block).localeCompare(String(b.block))); return {i:ss.indexOf(it.slot),ss}; };
  S.earlierSlotsOff=function(it){ const o=S.slotOrder(it); if(o.i<1||typeof CALENDAR==='undefined') return false; const wd=it.slot.wd; return o.ss.slice(0,o.i).every(q=>q.wd!==wd&&CALENDAR.holiday(it.day-(wd-q.wd))); };
  /* 第二格是短片段（BB 的 second_slot_lines，一句）；第一格碰到國定假日，那一週的主要內容改在第二格播、第二格原本的內容不播（AA_110 5-6；兩格都放假＝那一週的內容看不到，和真的停課一樣）*/
  /* 法律審查（AA_122 第 0a 節，使用者 2026-10-14 同意）：還沒審查的課堂法律內容，不能當作已確認的法律結論發布。每週的黑板、教授一句、同學反應、觀察／被點到的選擇，
     只有審查過的那一週才用（SYLLABUS.reviewed：['課程代號|週次']，匯入時照 BB_115 的審查結果產生）；其他週用不含法律結論的一般句子（STYLE／GENERAL：只寫這週的主題）。
     v9.6 的課堂內容是審查之前的版本，沒有 reviewed：法律系的課全部用一般句子。國文、英文、體育、實習的台詞池、第二格的短片段（不在審查清單裡）照舊 */
  /* 選單「法律」頁（使用者 2026-10-16 試玩：一開始就列出刑訴三大類、而且只有刑訴）：只列玩家真的上過的法律課——每一門寫上過幾堂、每一週的主題
     （審查過的週＝黑板第一行；還沒審查＝課表的主題）；考試週、缺席不算。現在這學期在前，之前的學期在後。經濟、日文、體育、國文、通識不列 */
  const LAWNAME=/法|憲|刑|民|債|物權|親屬|繼承|訴訟|行政|票據|勞動|財稅|海商|判決|證券|智慧財產/, NOTLAW=/經濟|日文|微積分|會計|體育|國文|英文（|通識/;
  S.legalCourses=function(G){ attachSyllabus(); const R=S.rec(G), by={};
    for(const k in R.done){ const p=k.split(':'); if(p.length<3||R.abs[k]) continue; const day=+p[0], cid=p[1], t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(day):null; if(!t||!LISTED.includes(t.week)) continue;
      if((t.week===8||t.week===9)&&R.exam&&R.exam[t.id+':'+cid+':mid']) continue;   /* 舊存檔（D118 以前）第 8、9 週那一堂是期中考：照舊不算上課 */
      const c0=COURSES.list.find(x=>x.id===cid); if(!c0||!LAWNAME.test(c0.name)||NOTLAW.test(c0.name)) continue; let c=c0; if(c0.term!==t.id){ try{ c=S.termCourses(G,t.id).find(x=>x.id===cid)||c0; }catch(e){} }   /* 重修那一學期：用重修的那一門（名字「（重修）」、學期是重修的學期）*/ const bk=cid+'|'+t.id, e=by[bk]||(by[bk]={c,term:t.id,weeks:new Set()}); e.weeks.add(t.week); }   /* 一學期一列（BUG-LEGALPAGE-RETAKE-ROW-1102：重修那學期另一列；原本照課號，重修的那一列會留在第一次上的學期）*/
    const cur=typeof CALENDAR!=='undefined'?(CALENDAR.termOf(G.day)||{}).id:null, ord=id=>{ const m=/^Y(\d)S(\d)$/.exec(id||''); return m?(+m[1])*2+(+m[2]):0; };
    return Object.values(by).map(e=>({c:e.c,term:e.term,current:e.term===cur,topics:[...e.weeks].sort((a,b)=>a-b).map(w=>{ const sy=(e.c.syllabus||[]).find(x=>x.w===w); return {w,title:S.sylReviewed(e.c,w)&&sy&&sy.board&&sy.board[0]?sy.board[0]:e.c.name+'：'+(S.topic(e.c,w)||'第 '+w+' 週')}; })}))
      .sort((a,b)=>(b.current-a.current)||(ord(b.term)-ord(a.term))||a.c.name.localeCompare(b.c.name)); };
  S.sylReviewed=(c,w)=>!!(typeof SYLLABUS!=='undefined'&&Array.isArray(SYLLABUS.reviewed)&&SYLLABUS.reviewed.includes(c.id+'|'+w));
  S.content=function(it){ attachSyllabus(); const c=it.c, t=S.topic(c,it.week)||c.name; const sy=c.syllabus&&S.sylReviewed(c,it.week)&&c.syllabus.find(q=>q.w===it.week);
    if(c.second&&c.second.length&&S.slotOrder(it).i>=1&&!S.earlierSlotsOff(it)){ const L=c.second; return {board:[c.name+'：'+t,'（這週的第二堂）',''],line:L[S.rot(it,L.length)],react:'',second:true}; }
    if(sy) return {board:sy.board||[c.name+'：'+t,'',''],line:sy.line,react:pickReact(sy.react,it),tpl:sy.tpl,obs:sy.obs,call:sy.call,recall:sy.recall,more:sy.more};
    if(c.pool&&c.pool.lines&&c.pool.lines.length){ const L=c.pool.lines; return {board:[c.name+'：'+t,'本週：'+t,''],line:L[S.rot(it,L.length)],react:pickReact(c.pool.react,it),prof:c.pool.prof_label}; }
    const f=(c.prof&&STYLE[c.prof])||GENERAL; const [line,react]=f(t); const ti=(TEACH.indexOf(it.week)); const nt=ti>=0&&ti<TEACH.length-1?S.topic(c,TEACH[ti+1]):'';
    return {board:[c.name+'：'+t,'本週：'+t,nt&&nt!==t?'下週：'+nt:'第 16 週期末考'],line,react}; };
  /* 討論型 B 課堂（AA_119；BB 的 syllabus 裡 obs.kind==='discuss'）：教授一問 → 三個看法＋「我想先聽別人說」（最後一個選項）→ 兩三位同學依序回應 → 教授收尾（不說誰對）。
     記下玩家的看法：R.disc[record]＝選項的序號（record＝B_<學期>_<課>_w<週>；最後一個＝先聽別人說；存在 G.courses，舊存檔從空的開始）。
     去過就有那一週的「理解」（obs.understand → G.flags 的 U_*，AA_117 第 2 節）。不計分、不影響成績（AA_119 第 0 節）。
     回想（obs.recall）：讀之前的看法（record：said 的 {choice}＝當時選的那一句／listened／missed）、去過的課（attended '學期:課程:w週'）、旗標（flag）、人物記憶（memory {npc,tag}）、
     聽過的活動（activity）——條件成立才多一句旁白；沒有 after 的在選項前，after＝那位同學的回應之後（那位同學這學期不在就一起略過）*/
  let recIdx=null;
  const recObs=id=>{ if(!recIdx){ attachSyllabus(); if(typeof SYLLABUS==='undefined') return null; recIdx={}; for(const cid in SYLLABUS.courses) for(const w of SYLLABUS.courses[cid]) if(w.obs&&w.obs.record) recIdx[w.obs.record]=w.obs; } return recIdx[id]||null; };
  S.attendedWeek=function(G,spec){ const p=String(spec||'').split(':'); if(p.length!==3||typeof CALENDAR==='undefined') return false; const w=+p[2].replace(/^w/,''), R=S.rec(G);
    for(const k in R.done){ const q=k.split(':'); if(q[1]!==p[1]) continue; const t=CALENDAR.termOf(+q[0]); if(t&&t.id===p[0]&&t.week===w) return true; } return false; };
  /* 「你不在」的版本（AA_294 第 1 節「討論課的選擇被大四引用」那一列，企劃 b3ec8820）：大四那堂引用大一的答案，玩家大一那一堂沒去（沒有紀錄）時說的那一句。
     課表資料（syllabus.js，企劃匯入）有 missed 的照它（公法判決研討第 3 週）；還沒有的兩處照 AA_294 這一句：課程|週|引用的紀錄 */
  S.RECALL_MISSED={'crim_judgment_sem|3|B_Y1S2_crim_gen2_w3':'（大一那一堂，你不在。老師講的那一題，你是第一次聽。）','legal_research|11|B_Y1S1_const_1_w11':'（大一那一堂，你不在。老師講的那一題，你是第一次聽。）',
    /* AA_350 R5：法學研究第 11 週引用大四上公法判決研討第 3 週那一題——美國路線（大四上人在美國）／其他沒去的 */
    'legal_research|11|B_Y4S1_public_judgment_sem_w3':G=>typeof STORY!=='undefined'&&STORY.route&&STORY.route(G)==='US'?'（大四上那一堂，你在美國。老師講的那一題，你是第一次聽。）':'（大四上那一堂，你不在。老師講的那一題，你是第一次聽。）'};
  S.recallText=function(G,r,it){ if(!r) return ''; const R=S.rec(G);
    if(r.record){ const i=R.disc[r.record]; if(i==null){ const m=it&&it.c?S.RECALL_MISSED[it.c.id+'|'+it.week+'|'+r.record]:''; return r.missed||(typeof m==='function'?m(G):m)||''; } const opts=(recObs(r.record)||{}).options||[]; if(!opts.length||i>=opts.length-1) return r.listened||'';
      const ch=opts[i]&&opts[i].text; return ch?String(r.said||'').replace('{choice}',ch):''; }
    let ok=false;
    if(r.attended) ok=S.attendedWeek(G,r.attended);
    else if(r.flag) ok=!!(G.flags&&G.flags[r.flag]);
    else if(r.memory) ok=typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(r.memory.npc,r.memory.tag);
    else if(r.activity) ok=typeof ACTIVITIES!=='undefined'&&(r.full?!!ACTIVITIES.attended&&ACTIVITIES.attended(G,r.activity):!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,r.activity));   /* full：要聽完（含 left_after；AA-B 10-16：C15 那句中途離開的沒有）*/
    return ok?(r.say||''):''; };
  S.discuss=async function(GM,it,ct,prof){ const G=GM.G, R=S.rec(G), ob=ct.obs, c=it.c, opts=ob.options||[], rc=ob.recall||[];
    const recall=async who=>{ for(const r of rc) if((r.after||null)===who){ const t=S.recallText(G,r,it); if(t) await GM.say(null,t); } };
    if(ob.prompt) await GM.say(null,ob.prompt);
    await recall(null);
    const i=await GM.choose(opts.map(o=>({t:o.text}))); const res=opts[i]&&opts[i].result; if(res) await GM.say(null,res);
    if(ob.record) R.disc[ob.record]=i;
    for(const q0 of (ob.replies||[])){ const q=S.reactAs(q0,it); if(!reactOK(q,it.day)) continue; await GM.say(null,S.reactLine(q)); await recall(q0.who); }   /* reactAs：宥辰不在的那一堂＝「同學」（同上）*/
    if(ob.close) await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+ob.close);
    if(G.flags) for(const u of (ob.understand||[])) G.flags[u]=true; };
  /* 翹課的轉述（AA_104 4-2「同學偶爾會在群組吐槽他沒來（一行，不是懲罰）」、AA_119 第 0 節第 4 點「群組裡一句轉述，不補演」）：
     沒去的課下課以後，手機「訊息」多一行——討論週：那一週的 skip_line（那堂課發生了什麼，每次都有）；其他週：那門課的 skip 句子，偶爾（這學期第 1、4、7…次沒去那門課）。
     今天的課下課後才發；睡過一整天的，前一天的照那堂課下課的時間補進訊息。考試、服務學習、劇情的課、第一二天不發。R.note 記發過了（skip_<key>）和沒去的次數（skipn_<課>_<學期>）*/
  /* 翹課那一句照那一週的課程主題選（AA_374 第 21 項，大二上）：原本第 1、4、7 次照順序發，講到的主題（行政處分第 5 週、竊盜第 10 週、給付遲延第 3 週、相鄰關係第 6 週）常常不是那一週。
     表裡的課＝那一週有對應的句子才發那一句；那週沒有對應的＝同學私訊「今天的筆記我拍給你。」（傳的人：認識的人裡，照芯慈、以安、柏翰、Alison、阿哲的順序；都不認識寫「同學」——給 AA 的問題）。
     句子照 syllabus.js 的原文比對（syllabus 改了字、對不到＝那一週當作沒有對應的；tests/aa374_y2s1_unit.js 會抓到）；表裡沒有的課照舊（第 1、4、7…次照順序）*/
  S.SKIP_TOPIC={admin_law:{5:'（群組）以安：許教授今天講行政處分。筆記在雲端。第三頁很重要。'},crim_spec:{10:'（群組）阿哲：吳教授今天講竊盜，舉例舉到他自己的雨傘。'},
    oblig_gen2:{3:'（群組）芯慈：周教授今天講給付遲延。他點了你的座位。'},property:{6:'（群組）阿哲：今天講相鄰關係，我想到我們宿舍。'}};
  S.SKIP_NOTES='今天的筆記我拍給你。';
  S.skipLine=function(G,it,L,m){ const T=S.SKIP_TOPIC[it.c.id]; if(!T) return L[Math.floor((m-1)/3)%L.length];
    const t=T[it.week]; if(t&&L.includes(t)) return t;
    const who=['classmate_xinci','heroine_01','classmate_bohan','yu','zhe'].find(id=>typeof STORY!=='undefined'&&STORY.knows&&STORY.knows(id,G));
    const nm=who?((typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(who):((CHARACTERS[who]||{}).name||'同學')):'同學';
    return '（私訊）'+nm+'：'+S.SKIP_NOTES; };
  S.skipNotes=function(GM){ const G=GM.G; if(typeof INV==='undefined'||!INV.msgAt) return 0; const R=S.rec(G), h=hr(G); let n=0;
    for(const day of [G.day-1,G.day]){ const m1=m1d(G), ls1=typeof STORY!=='undefined'&&STORY.lawStart?STORY.lawStart(G):1; if(ls1===m1&&(day===m1||day===m1+1)) continue;   /* 第一、二天是劇情（玩家第一天晚上才到宿舍、第二天跟著劇情走）：那兩天的課不算翹課；開局 B 的第 1、2 週（第 1 天以前）照常（D91）*/
      for(const it of S.dayItems(G,day)){ const k='skip_'+it.key; if(R.note[k]||R.done[it.key]||it.exam||it.c.kind==='service'||S.storyClass(G,it)) continue; if(day===G.day&&h<it.t1+0.1) continue;
        R.note[k]=1; const ct=S.content(it), sl=ct.obs&&ct.obs.kind==='discuss'?ct.obs.skip_line:null; let text='';
        if(sl&&reactOK(sl,it.day,true)) text='（群組）'+((typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(sl.who):((CHARACTERS[sl.who]||{}).name||'同學'))+'：'+sl.text;   /* 和 BB 那門課的 skip 句子同一個格式 */
        else if(!sl){ const nk='skipn_'+it.c.id+'_'+it.term, m=(R.note[nk]||0)+1; R.note[nk]=m; const L=it.c.skipLines||[]; if(L.length&&(m-1)%3===0) text=S.skipLine(G,it,L,m); }
        if(text){ INV.msgAt(G,null,text,day,it.t1+0.15); n++; } } }
    return n; };
  // ---------- 上課（普通課堂；考試週＝考試）----------
  const ROOM_FIRST={wancai_multi:'（法律系館B一樓的多功能教室。椅子是可以移動的那種，大家坐得比在 201 鬆。）',linze_202:'（二樓的 202 是平面教室。長桌一排一排，沒有階梯。坐後面也看得到黑板。）'};   /* AA_330（企劃 48845c36）第 3 點，字照抄 */
  S.ROOM_FIRST=ROOM_FIRST;
  /* 特別週多的幾句（課程代號|週次）：AA-103-SP 大三上刑訴第 15 週強制辯護（AA_103 末節，AA-C 2026-10-17 定稿；法律審查 BB_182：§31 I 第 1～4、6 款看案件與被告狀況，只有第 5 款低收入戶、中低收入戶聲請指定和資力有關）*/
  S.SPECIAL_PRE={'crimpro|15':[['yu','有些案子一定要有律師……那請不起的人，是國家幫他請？'],['prof','不是看請不請得起，是看案子。最輕本刑三年以上，或是被告沒辦法好好替自己說話——沒有律師，審判長就要指定公設辯護人或律師。有錢沒錢都一樣。'],['prof','那請不起、案子又不是這種的呢？低收入戶可以自己聲請指定。其他的——去找法扶。']],'ge_y1s2|6':[[null,'（這堂課移到天文館。）'],[null,'（天文館的圓頂關了燈。）']]};   /* 'ge_y1s2|6'：AA_373 #9（企劃線 a48fe1b7）；開頭「（這堂課移到天文館。）」AA_373 第 6-2 節第 3 題（bdab2f42：3D 照舊在教室，旁白交代移地點；黑板「（本週在天文館）」、觀察「宥辰仰著頭…」在 syllabus.js）：大一下通識第 6 週（週一 13:20）的觀星練習改在天文館的圓頂（白天關燈看星空投影）；宥辰那句、「圓頂裡很暗。」在 syllabus.js（匯入工具疊 AA_373）*/
  S.IN_CLASS=[];   /* 課堂那一句後面、下課之前的劇情段（async (GM,it,prof,ct)；例：1B-02 債各第 6 週的語彤，src/y2b3d.js）。函式上要掛 due(G,it,ct)（這一堂會演＝true）：學期中的快轉（src/semff3d.js）停在那一堂前面、不自動上 */
  { const f=(GM,it)=>typeof STORY!=='undefined'&&STORY.kxHandIn?STORY.kxHandIn(GM,it):false; f.due=(G,it)=>typeof STORY!=='undefined'&&!!STORY.kxHandDue&&STORY.kxHandDue(G,it); f.kx=true; S.IN_CLASS.push(f); }   /* 可昕大一上第 6 週「老師問問題」課堂中那一半（CANON-1112，AA_856 第 3 節②；下課那一半＝events.js ev_kx_hand）*/
  const seatTalk=(GM,it,ph)=>{ if(typeof CROWD==='undefined'||!CROWD.seatTalkPrep) return null; try{ return CROWD.seatTalkPrep(GM,it,ph); }catch(e){ console.warn('CROWD.seatTalkPrep',e); return null; } };   /* AA_495 第 3、4 節：坐在玩家前一排或旁邊的同學（crowd3d.js）*/
  S.attend=async function(GM,it,o){ o=o||{}; const G=GM.G, E=GM.E, R=S.rec(G), c=it.c; if(R.done[it.key]) return false;
    const exam=it.exam, prof=c.prof&&typeof EVENTS!=='undefined'?EVENTS.npcOf(c.prof):null; const ct=S.content(it); const door=!!o.door;
    const lateAbs=!exam&&c.kind!=='service'&&S.isLateAbsent(G,it);
    const wasLate=!exam&&S.isLate(G,it);   /* 進教室那一刻算遲到（BB-B 11-01：原本快轉到下課才問 S.isLate，lateMin＝整堂課、一定超過 15 分鐘＝R.late 從來寫不進去）*/
    if(lateAbs&&!o.lateOk){ const k=await (async()=>{ if(!o.inScene) GM.sceneBegin(); try{ await GM.say(null,'已經開始 '+Math.floor(S.lateMin(G,it))+' 分鐘了。現在進去會記缺席。'); return await GM.choose([{t:'還是進去聽',hint:'記缺席；聽得到後半堂'},{t:'算了'}]); } finally { if(!o.inScene) GM.sceneEnd(); } })(); if(k!==0) return false; }
    let preEv=false; if(c.kind!=='service'&&!lateAbs) preEv=await S.beforeClassEvent(GM,it);
    const kxOk=!exam&&!door&&!lateAbs&&!wasLate&&c.kind!=='service'&&typeof STORY!=='undefined'&&!!STORY.kxClassMeet;   /* 可昕第一次見面（CANON-1112，AA_856 第 2 節）：準時進 3D 教室上必修才演；遲到、門口上課的那一堂順延 */
    if(kxOk&&!preEv){ try{ await STORY.kxClassMeet(GM,it,'pre'); }catch(e){ console.warn('STORY.kxClassMeet pre',e); } }   /* 順延的那一版：坐下以後、老師還沒來（這一堂課前已經演了別的人物事件就再順延）*/
    { const zf=it.room&&it.room.zone, line=zf&&ROOM_FIRST[zf]; if(line&&!exam&&!lateAbs&&G.flags&&!G.flags['ROOM_FIRST_'+zf]){ G.flags['ROOM_FIRST_'+zf]=true; if(!o.inScene) GM.sceneBegin(); try{ await GM.say(null,line); } finally { if(!o.inScene) GM.sceneEnd(); } } }   /* 第一次在那間教室上課的一句旁白（X78，AA_330 第 3 點；只演一次）*/   /* 上課前的人物事件（BB_135 1-4：芯慈在重修教室上課前）。坐在 3D 座位上課（inScene）也要演：原本只有門口上課才演，座位教室（201、普通 101…）的課前、課後事件從來不會出現（AA-B 2026-10-16 回報）*/
    const peN=!exam&&S.peNarr?S.peNarr(G,it):null; if(o.inGym&&!exam){ try{ S.peCast(GM,it); }catch(e){ console.warn('CLS.peCast',e); } }   if(o.inGym){ S.peWear=it.key; if(typeof FIT!=='undefined'&&FIT.gymWearSync) FIT.gymWearSync(GM); }   /* 體育課換上短袖運動服（GYM-FIT-1107 ③；下課 finally 換回）*/   /* 體育課（AA_644）：這週的旁白；有修這堂、在場的朋友站進半圈 */
    const dBg=door&&o.inGym?'freeze':(door&&it.room&&S.DOOR_BG[it.room.door]&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(S.DOOR_BG[it.room.door]):null);   /* inGym：在體育館裡上體育課＝看得到館內（BUG-PE-DOOR-2D-1103）*/   /* 門口上課有自己的背景圖（BB 10:24：研討室 A 上課、考試都是空的模糊背景）*/
    if(!o.inScene) GM.sceneBegin(door?(dBg?{adv:true,background:dBg}:{adv:true}):undefined); else if(dBg&&typeof ADV!=='undefined'&&ADV.active&&ADV.setBg) ADV.setBg(dBg);
    if(GM.skipScope) GM.skipScope(true);   /* 座位上課的對話可以略過（BB 2026-11-11；2D 門口上課本來就有「略過對話」）；下面 finally 關掉——下課後的人物事件（afterClassEvent）不在範圍裡 */
    try{
      if(door&&exam&&it.room&&S.DOOR_EXAM_LINE[it.room.door]) await GM.say(null,S.DOOR_EXAM_LINE[it.room.door].replace(/\{課名\}/g,c.name));   /* 考試那一堂開頭一句（研討室裡的人；AA 寫，到了填進 S.DOOR_EXAM_LINE）*/
      /* 服務學習（AA_110 第 6-1 節，AA 暫定）：0 學分、只記次數；在櫃台報到，2D 畫面每次一句（不帶人物）——第 n 次報到用第 n 句：第 1、9 句固定在第一次和最後一次，
         中間照順序；補做（第 15、16 週）用的是還沒看過的那幾句（照次數排，不照週次）*/
      if(c.kind==='service'){ const n=R.attend[c.id]||0, Ls=c.serviceLines||[], need=(c.weeks||[]).length;
        await GM.say(null,Ls.length?Ls[Math.min(n,Ls.length-1)]:'你在'+(it.room.name||'這裡')+'做了兩個小時的服務學習。');
        await GM.fade(true); const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); R.done[it.key]=1; R.attend[c.id]=n+1; await GM.fade(false);
        GM.caption('',c.name+'：第 '+(n+1)+' 次'+(need?'（'+Math.min(n+1,need)+'／'+need+'）':'')+(need&&n+1>=need?'，時數滿了。':'。'),2800); }
      else {
      if(!door&&E.zone&&(roomy(E.zone)||G.zone==='classroom')){ const h0=hr(G); let stPre=null;
        /* 開始上課的時候同學都坐好了（2026-10-18 BB-C：開始前 30 分鐘就能坐下上課，同學 10 分鐘前才陸續進來——提早坐下的話整堂課教室只有祐廷一個人）。
           CROWD-CLASS-ARRIVE-1027（使用者 2026-10-27「開始上課教室突然出現更多人已經坐在位置上?」）：原本選「上課」那一刻，沒到的同學一起出現在座位上。改成——
           提早坐下（還沒開始）：先轉暗、等到上課時間（時間真的過去了），走在半路的人在這段時間坐好（CROWD-NO-DOOR-1103 起教室門口沒有等的人）；已經開始：還沒到的同學從門口走進來，不在座位上冒出來 */
        if(h0<it.t0-0.5/60){ await GM.fade(true); { const R=S.rec(G); if(R.waitLast!==it.key){ R.waitLast=it.key; await GM.say(null,'（你在座位上等。教室慢慢坐滿了。）'); } }   /* AA_489 第 3 節（c4bcf86f6）：提早坐下等上課，轉暗時一句，一堂課一次 */ S.settleRoom(GM); GM.advance(it.t0-h0); keepCrowd(G); if(typeof CROWD!=='undefined'&&CROWD.resync) CROWD.resync(GM); S.syncRoom(GM,{full:true,instant:true}); stPre=seatTalk(GM,it,'pre'); await GM.fade(false); if(stPre) await CROWD.seatTalkPlay(GM,stPre); }   /* 前一排或旁邊的同學說上課前那一段（AA_495 第 3、4 節，原本在教室門口；CROWD-NO-DOOR-1103）：轉暗的時候排好位子、亮了才說 */
        else S.syncRoom(GM,{full:true}); }
      if(!door&&E.zone&&E.zone.setBoard) E.zone.setBoard(exam?c.name+'：'+(exam==='mid'?'期中考':'期末考'):ct.board[0],exam?'不可以翻書':ct.board[1],exam?'鈴響請停筆':ct.board[2]);
      else if(!exam&&!o.inGym&&GM.caption&&ct.board&&ct.board[0]) GM.caption('黑板',ct.board.filter(Boolean).join('　'),6000);   /* D118-B2（D118_PLAN ②-7）：沒有 3D 黑板的教室（法律系館B多功能教室、法律系館A 202、研討室 A、門口上課）用字幕顯示黑板三行 */
      if(exam&&S.isExamCourse(c)) await S.runExam(GM,it);   /* 考五題的法律課（AA_130 第 3 節）*/
      else if(exam){ const p=R.prep[c.id]||0; await GM.say(null,'考卷發下來。'+c.name+(exam==='mid'?'期中考':'期末考')+'。');
        await GM.say(null,p>=8?'題目你都見過——上課講過、自己也讀過。你寫得很順。':p>=4?'有幾題你有印象，有一題你只記得老師在黑板上畫過圖。':'你認得題目裡的每一個字，合起來就不太認得了。'); }
      else { if(kxOk){ try{ await STORY.kxClassMeet(GM,it,'open'); }catch(e){ console.warn('STORY.kxClassMeet open',e); } }   /* 這學期第一堂必修：老師開場那一版（教授第一句之前）*/
        const PL=o.inGym&&S.PE_LATE&&GM.G&&S.PE_LATE[GM.G.zone]; if(lateAbs) await GM.say(null,PL?PL.abs:'（你從後門進去，在最後面的空位坐下。前半堂已經講完了。）'); else if(S.isLate(G,it)) await GM.say(prof||null,(prof?'':S.profName(c)+'：')+(PL?PL.late:'後面有位子。'));   /* AA_137 第 4 節：遲到 1～15 分鐘，教授一句、課照常；超過 15 分鐘選了還是進去聽：記缺席、看得到後半堂、課堂提問照常 */
        if(S.attCourse(c)){ const rk=it.term+':'+c.id; R.attRule=R.attRule&&typeof R.attRule==='object'?R.attRule:{}; if(!R.attRule[rk]){ R.attRule[rk]=G.day; for(const [w,t] of S.attRuleLines(G,c)) await GM.say(w?{name:w}:null,t); } if(!lateAbs&&S.rollWeeks(G,c,it.term).includes(it.week)){ R.rollSaid=R.rollSaid&&typeof R.rollSaid==='object'?R.rollSaid:{}; const rk2=it.term+':'+c.id+':'+it.week; if(!R.rollSaid[rk2]){ R.rollSaid[rk2]=1; await GM.say(null,'（老師今天點名。）'); } } }   /* ATTEND-ROLLCALL-1102（AA_574 方案 B）：點名日那堂坐在教室才知道；遲到超過 15 分鐘＝缺，不說 */   /* AA_418 第 1 節：這一學期第一次出席（遲到記缺席的那一堂不算）*/
        for(const [w,t] of (S.SPECIAL_PRE[c.id+'|'+it.week]||[])) await GM.say(w==='prof'?(prof||null):w,(w==='prof'&&!prof?(ct.prof||S.profName(c))+'：':'')+t);   /* 特別週：黑板第一行講完以後、原本那一句之前（AA-103-SP）*/
        if(peN) await GM.say(null,peN); else if(prof){ for(const [k,t] of S.profParts(''+ct.line)) await GM.say(k==='narr'?null:prof,t); } else await GM.say(null,(ct.prof||S.profName(c))+'：'+ct.line);   /* 體育課：每週一句旁白取代台詞池那一句（AA_644）*/   /* 教授在場（對話框有名字）：外面整句的「」拿掉（STYLE 的開場；TEXT-QUOTE-UNIFY-1108 第八批）；不在場＝「周老師：「…」」照舊 */
        if(!peN) for(const m of (Array.isArray(ct.more)?ct.more:[])){ if(!m) continue; if(prof){ for(const [k,t] of S.profParts(''+m)) await GM.say(k==='narr'?null:prof,t); } else await GM.say(null,(ct.prof||S.profName(c))+'：'+m); }   /* more＝教授在 line 之後接著講的句子，照順序各一個對話框（AA 2026-11-11：課堂內容補寫 STUDY-EXAM-STORY-1102；沒有 more 的週照舊）*/
        for(const r of (ct.recall||[])) if(!r.after||r.after==='line'){ const t=S.recallText(G,r,it); if(t) await GM.say(null,t); }   /* 週層級的回想（v2 C15：憲法二第 12 週，聽過 B4 演講的玩家多一句旁白）；條件不到不說 */
        for(const f of S.IN_CLASS){ try{ await f(GM,it,prof,ct); }catch(e){ console.warn('CLS.IN_CLASS',e); } }
        if(ct.react&&!peN) await GM.say(null,ct.react);
        /* E04 微積分初體驗（BB_104 8b-1）：第 2 週那一堂才有，沒去就沒有 */   /* P1：BB_105 2-3 的四句（阿勳、韋綸、品妤、遠處的可昕）*/
        /* B：觀察的小選擇（只顯示一行結果，不影響數值）；C：被點到（三個選項共用收尾）——BB 的 syllabus（AA_104）*/
        if(ct.tpl==='B'&&ct.obs&&ct.obs.kind==='discuss'&&ct.obs.options&&ct.obs.options.length){ await S.discuss(GM,it,ct,prof); if(ct.obs.disc&&ct.obs.disc.qid) await S.classAsk(GM,it,prof,ct,ct.obs.disc.qid); }   /* 討論課的題目（BB-B 64406c8，使用者 2026-10-15：討論課的題目要進期末考）：討論收尾之後教授在黑板寫這一題，流程和課堂提問一樣 */
        else if(ct.tpl==='B'&&ct.obs&&ct.obs.options&&ct.obs.options.length){ if(ct.obs.prompt) await GM.say(null,ct.obs.prompt); const i=await GM.choose(ct.obs.options.map(o=>({t:o.text}))); const r=ct.obs.options[i]&&ct.obs.options[i].result; if(r) await GM.say(null,r); }
        else if(ct.tpl==='C'&&ct.call&&ct.call.options&&ct.call.options.length){ await GM.say(null,(c.prof?S.profName(c):'老師')+'點到你。'); const ci=await GM.choose(ct.call.options.map(o=>({t:'「'+o+'」'}))); /* 記玩家的回答（選項原文，例「睡覺。」）：法律系 P4 的旁白「那時候你答的是——」讀它（BB_105 L98）*/ for(const f of (ct.call.follow||[])) await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+f); }
        if(!ct.second&&!(ct.obs&&ct.obs.disc&&S.askOf(it)&&S.askOf(it).id===ct.obs.disc.qid)) await S.classAsk(GM,it,prof,ct); }
      if(roomy(E.zone)) S.syncRooms(GM);   /* 快轉前同學先坐好（人流每 15 分鐘才排一次；剛好在那之前坐下的話，下課時沒有人站起來走出去）*/
      await GM.fade(true); S.settleRoom(GM); const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); keepCrowd(G);   /* settleRoom：轉暗以後，還在走向座位、講台的人到位（不然快轉以後還在半路，下課的同步把沒坐下的人當場拿掉）*/ R.done[it.key]=1; if(lateAbs) R.abs[it.key]=1; else if(!exam){ R.attend[c.id]=(R.attend[c.id]||0)+1; R.prep[c.id]=(R.prep[c.id]||0)+1; if(wasLate) R.late[it.key]=1; } if(!exam&&typeof STUDY!=='undefined'){ try{ STUDY.heard(G,c,it.week); }catch(e){ console.warn('STUDY.heard',e); } }   /* D118-B2：這一週的觀念卡＝上過課（遲到記缺席的也聽了後半堂）*/ const stPost=door?null:seatTalk(GM,it,'post'); await GM.fade(false);
      GM.caption('',exam?'考完了。':'下課了。'+(c.prof?S.profName(c)+'收起講義。':''),2400);
      if(stPost) await CROWD.seatTalkPlay(GM,stPost);   /* 下課後那一段（AA_495 第 3、4 節，原本在教室門口；CROWD-NO-DOOR-1103）*/
      }
    } finally { if(GM.skipScope) GM.skipScope(false); if(!o.inScene) GM.sceneEnd(); if(S.peWear===it.key){ S.peWear=null; if(typeof FIT!=='undefined'&&FIT.gymWearSync) FIT.gymWearSync(GM); } }
    S.slotFillSpan(G,it.t0,Math.max(it.t1,hr(G)));   /* 上過一堂課＝那個時段的一件主要的事（DEC-SLOTS-1018 ③；時段用過了照樣能上）*/
    afterP={day:G.day,key:it.key,t:Date.now()};   /* 下課選單（DL-01 1-4）：課後事件演完、站起來以後才出（S.oneTick）*/
    if(c.kind!=='service'&&await S.afterClassEvent(GM,it)&&afterP&&afterP.key===it.key) afterP.ev=1;   /* ev＝這一堂下課演了課後劇情（118 巷午餐邀約那一天就不邀，src/l118_lunch3d.js）*/   /* 下課後、考完的人物事件（A12、A15 G1）；座位上課（inScene）也演（場景深度有計數，事件自己的 sceneBegin／sceneEnd 不會放開座位那一層）*/
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  /* 聽演講、參加活動（AA_107 第 10-1 節第 5 項）：坐在活動的那一間選「聽演講」→ 記下到場（ACTIVITIES.markAttended）→ 快轉到結束。
     之後的事件用 prereq.attended／missed 判斷（沒去就不會觸發聽完才合理的對話）。活動的內容（講者說什麼、誰在場）由 AA、BB 寫成條件事件；這裡只有一般的場面。 */
  /* 社課的人物事件（AA_110 6-8 (a)，AA 暫定）：同一場社課只播一個——符合條件的人物事件優先，否則播一般社課的旁白（narr）；有人物事件的那一次也算出席。
     吉他社：還沒認識子晴（沒有 FIRST_MET）的玩家第一次去社課，一開始自動播 ev_ziqing_club 的初遇（EVENTS.run 會寫 FIRST_MET；只有這一次是自動的，之後要自己去找她講話）；
     法服讀書會：2026-10-17 停用（AA_236 A1）；公法讀書會：第一次白板、沛珊 P1／P1b、P4、翰 3、以安新 8。 */
  S.clubEvent=function(G,a){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined') return null; const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
    { const ce=STORY_EVENTS.find(e=>e.clubEvent===a.id&&EVENTS.check(e,{chain:true})); if(ce) return ce; }   /* 事件寫 clubEvent:'活動 id'（例：1B-05 子晴「我那天很兇」，吉他社社課）：條件到了，這一場社課先演它 */
    const here=id=>typeof STORY==='undefined'||!STORY.present||STORY.present(id,G);
    if(a.id==='public_law_group'){ { const n8=ev('ev_plg_rules'); if(n8&&EVENTS.check(n8,{chain:true})) return n8; }   /* 大二上第 7 週週四：以安新 8 讀書會的規則太多（交接包 v3 3b）*/
      /* 沛珊、柏翰的讀書會場面（原本在法服週三讀書會；使用者 07:5x 方案 A、BB_191 §8-7、AA_222）：大二下第 1 週沛珊 P4 交接、第 2 週起翰 3 分數表 */
      { const p4=ev('ev_peishan_handover'); if(p4&&(typeof STORY==='undefined'||!STORY.reachable||STORY.reachable('classmate_peishan',G))&&EVENTS.check(p4,{chain:true})) return p4; }   /* 她這學期休學、人在臺北＝reachable 不是 present，作息那一晚在萬才館 */
      for(const id of ['ev_bohan_scores','ev_bohan_scores_month']){ const e=ev(id); if(e&&(id!=='ev_bohan_scores'||here('classmate_bohan'))&&EVENTS.check(e,{chain:true})) return e; }
      if(!(G.events&&G.events.done&&G.events.done.ev_public_law_group)&&!/^Y2/.test((typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day)||{}).id||'')) return ev('ev_public_law_group');   /* 公法讀書會第一次：白板（交接包 v2 C14）；門口參加＝2D 畫面，不看人在不在 */
      { const ay=ev('ev_an_yu_argument'); if(ay&&here('heroine_01')&&EVENTS.check(ay,{chain:true})) return ay; }   /* 大一下第 12 週週四：以安和 Alison 吵架（AA_238 5-3，原本麵店）*/
      if(here('classmate_peishan')&&here('heroine_01')) for(const id of ['ev_peishan_why_answer_plg','ev_peishan_why_plg']){ const e=ev(id); if(e&&EVENTS.check(e,{chain:true})) return e; }   /* P1b（下一次，以安回答）優先於 P1 */
      return null; }
    if(a.id==='club_guitar'){ const met=typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_04','FIRST_MET'); if(!met) return here('heroine_04')?ev('ev_ziqing_club'):null;
      { const q7=ev('ev_ziqing_lab_letter'); if(q7&&here('heroine_04')&&EVENTS.check(q7,{chain:true})) return q7; }   /* 大二上第 3 週：子晴 Q7 實驗室的信（BB_97 3-1）*/ return null; }
    if(a.id==='lawclub_study') return null;   /* 法服讀書會停用（AA_236 A1；activities.js skip）：交接、P4、翰 3 搬到公法讀書會，P1／P1b 也是 */
    return null; };
  S.CLUB_IN=[];   /* 社課一開始（人物事件演完、入座那一句之後）接著演的：async fn(GM,a,ev)→{narr} 或 null（attendActivity）。吉他社第一次社課（AA_619 2-1）在 src/guitar3d.js */
  /* 社課的旁白（6-8 (d)）：同一學期照順序、每句最多一次；用完了回 ''（只顯示「社課結束了。」）。存在 G.acts.narr['<活動>@<學期>']＝用過幾句（舊存檔沒有＝從頭）*/
  /* CLUB-LATER-TERMS-1112（AA_852）：辯論社、登山社、系籃大一下～大二下每學期自己一組旁白（src/data/club_later_terms.js：CLUB_LATER_TERMS.clubs[活動][學期]）——那一學期有就用那一組，沒有＝照舊用活動的 narr。
     那一組裡開頭「（下雨」的那一句（CLUB_LATER_TERMS.rain[活動][學期]＝第幾句）是下雨場才演的：晴天照順序輪的時候跳過它；下雨那一場固定演它（S.clubRainNarr，不佔照順序輪的那一格）*/
  S.termNarr=function(G,a){ const D=typeof CLUB_LATER_TERMS!=='undefined'?CLUB_LATER_TERMS:null, t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, C=D&&a&&D.clubs&&D.clubs[a.id], L=C&&t?C[t.id]:null;
    if(!Array.isArray(L)||!L.length) return null; const R=D.rain&&D.rain[a.id], r=R&&typeof R[t.id]==='number'?R[t.id]:-1; return {L,rain:r}; };
  S.clubNarr=function(G,a){ const T=S.termNarr(G,a), L=T?T.L:(a.narr||[]); if(!L.length||typeof ACTIVITIES==='undefined') return ''; const A=ACTIVITIES.rec(G); if(!A.narr||typeof A.narr!=='object') A.narr={};
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, k=a.id+'@'+(t?t.id:'-'); let n=A.narr[k]||0; if(T&&n===T.rain) n++;   /* 下雨場那一句不在晴天輪 */ if(n>=L.length) return ''; A.narr[k]=n+1; return L[n]; };
  /* 下雨場的旁白（BBALL-RAIN-1030）：大一上＝活動的 narr[rain.narr]（走廊那一句）；大一下～大二下＝那一學期「（下雨」的那一句，那一學期沒有＝null（照順序輪）*/
  S.clubRainNarr=function(G,a){ if(!a||!a.rain) return null; const T=S.termNarr(G,a); if(T) return T.rain>=0?T.L[T.rain]:null; return a.narr?a.narr[a.rain.narr]:null; };
  /* 特殊活動的旁白（AA_737 specialEvents，BULLETIN-BOARD-1110）：一場一整串（narr 照順序），同一學期每句最多一次（G.acts.narr['<id>@<學期>']＝1）。
     narrAlt {第幾句:{flag,text}}：有那個旗標換那一句（校慶園遊會第 2 句：吉他社社員）。
     narrLater（學生會迎新派對）：大一上以外的學年每年一句、照順序（G.acts.narr['<id>@later']＝用到第幾句），用完 end＝endLater（「派對結束了。」，取代「活動結束了。」）。
     回傳 {lines, end}；舊存檔沒有 G.acts.narr：第一次用到時補上 */
  S.specialNarr=function(G,a){ const out={lines:[],end:null}; if(!a||typeof ACTIVITIES==='undefined') return out; const A=ACTIVITIES.rec(G); if(!A.narr||typeof A.narr!=='object') A.narr={};
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, tid=t?t.id:'-', kt=a.id+'@'+tid, F=G.flags||{}; if(A.narr[kt]) return out;
    if(a.narrLater&&tid!=='Y1S1'){ const kl=a.id+'@later', n=A.narr[kl]|0; A.narr[kt]=1; if(n>=a.narrLater.length){ out.end=a.endLater||null; return out; } A.narr[kl]=n+1; out.lines=[a.narrLater[n]]; return out; }
    A.narr[kt]=1; out.lines=(a.narr||[]).map((s,i)=>{ const x=a.narrAlt&&a.narrAlt[i]; return x&&F[x.flag]?x.text:s; }); return out; };
  /* 社博沒填表的，大一上第 5、6 週社課結束時問要不要入社（AA_737 lateJoin）：旁白、社長一句、「填／先不要」、社長回一句。
     填＝CLUB_<id>（跟社博填表一樣）；不管選什麼都記 CLUB_LATE_<id>＝這一週（同一週不再問；ACTIVITIES.lateDeclined）。系籃：社長→系籃隊長、社費→隊費；第 6 週「先不要」換 no6 */
  S.lateJoinAsk=async function(GM,a){ const L=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.LATE_JOIN; if(!L||!a) return false; const G=GM.G, F=G.flags||(G.flags={}), t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, wk=t?t.week:0, by=(L.by&&L.by[a.id])||{}, who={name:by.who||L.who};
    await GM.say(null,L.narr); await GM.say(who,L.ask); const i=await GM.choose(L.opts.map(x=>({t:x}))); F['CLUB_LATE_'+a.id]=wk;
    if(i===0){ F['CLUB_'+a.id]=true; await GM.say(who,by.yes||L.yes);
      if(typeof CLUBFAIR!=='undefined'&&Array.isArray(CLUBFAIR.DOOR_AFTER)){ const h0=G.hour; if(a.t1!=null&&G.hour>=a.t1) G.hour=a.t1-1/60;   /* 「社課快結束的時候」：照結束前一分鐘判斷誰在場（阿哲的作息 19:00 離開球場）*/
        try{ for(const f of CLUBFAIR.DOOR_AFTER){ try{ await f(GM,a); }catch(e){ console.warn('CLS.lateJoinAsk DOOR_AFTER',e); } } } finally { G.hour=h0; } }   /* 原本第一次去社課（門口填表）之後接著演的：AA_613 2-4 阿哲「我就說吧。」（2-3 說了「好，我去看看。」、阿哲在場）——第 5、6 週改成填了入社單以後演 */
      return true; }
    await GM.say(who,wk===6?L.no6:L.no); return false; };
  /* 法服讀書會第二次以後：題庫兩三題（LEGAL 的讀書會包裝，題目和答案不改；學姊照作息週三晚上在萬才館，不在學校的學期換柏翰問）*/
  S.studyQs=async function(GM){ if(typeof LEGAL==='undefined'||!LEGAL.ask) return 0; const G=GM.G; const here=id=>typeof STORY==='undefined'||!STORY.present||STORY.present(id,G);
    const by=here('heroine_05')?'heroine_05':(here('classmate_bohan')?'classmate_bohan':null); if(!by) return 0; const n=2+(G.day%2); let k=0;
    for(let i=0;i<n;i++){ await LEGAL.ask({context:'study',by,pick:{}},{id:'lawclub_study',participants:[by]}); k++; } return k; };
  /* 活動本身就是一段劇情（a.event：例如迎新）：條件照一般事件（once、term、prereq…）；不看觸發方式（trigger:'activity'）*/
  S.afterActEvent=function(G,a){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!a) return null; return STORY_EVENTS.find(e=>e.afterActivity===a.id&&EVENTS.check(e,{chain:true}))||null; };
  S.actEvent=function(G,a){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!a.event) return null; const e=STORY_EVENTS.find(q=>q.id===a.event); return e&&EVENTS.check(e,{chain:true})?e:null; };
  /* 下課後的人物事件（交接包 v1 A12：以安的報告分工）：事件寫 afterClass:'課的 id'（＋一般條件：term、weeks、weekday、npcPresent、prereq…）；
     那堂課真的上完（不是翹課、不是考試、不是在別的劇情裡）就在教室裡接著演 */
  /* 這學期最後一科考完的時間（{day, h}：期末考的最後一場結束；沒有考試＝null）——期末最後一頓（交接包 v1 A22）用 */
  S.lastExamEnd=function(G,termId,kind){ kind=kind||'final'; let best=null; for(let d=(/^Y0/.test(termId)?-420:1);d<1500;d++){ const t=CALENDAR.termOf(d); if(!t){ if(best) break; continue; } if(t.id!==termId) continue;
      for(const it of S.dayItems(G,d)) if(it.exam===kind&&(!best||d>best.day||(d===best.day&&it.t1>best.h))) best={day:d,h:it.t1}; } return best; };
  /* 上課前的人物事件（BB_135 1-4）：事件寫 beforeClass:'課的 id'，或函式 it=>…（例：霖澤館的任何一堂課，SK02 阿哲那句）（＋一般條件）；人進了教室、要開始上課（不是遲到缺席）就先演 */
  /* 挑法拆成 beforeClassPick／afterClassOk、First、Also：翹課前預告會錯過的事（S.classEvs，DL-04B 1-5）用同一個挑法；chk＝條件怎麼查（預設 EVENTS.check chain）*/
  const chainChk=e=>EVENTS.check(e,{chain:true});
  S.beforeClassPick=function(it,chk){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!it||!it.c) return null; chk=chk||chainChk; return STORY_EVENTS.find(e=>(e.beforeClass===it.c.id||(typeof e.beforeClass==='function'&&e.beforeClass(it)))&&chk(e))||null; };
  S.afterClassOk=(it,chk)=>{ chk=chk||chainChk; return e=>(e.afterClass===it.c.id||(typeof e.afterClass==='function'&&e.afterClass(it)))&&(e.afterExam?e.afterExam===it.exam:!it.exam)&&chk(e); };
  S.afterClassFirst=ok=>STORY_EVENTS.find(e=>e.classFirst&&ok(e))||STORY_EVENTS.find(e=>!e.classAlso&&ok(e))||STORY_EVENTS.find(ok)||null;
  S.afterClassAlso=(ev,ok)=>ev&&!ev.classAlso?(STORY_EVENTS.find(e=>e.classAlso&&e!==ev&&ok(e))||null):null;
  S.beforeClassEvent=async function(GM,it){ const ev=S.beforeClassPick(it); if(!ev) return false; await EVENTS.run(ev); return true; };
  S.afterClassEvent=async function(GM,it){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!it||!it.c) return false; const ok=S.afterClassOk(it);   /* afterClass 也可以是函式 it=>…（同 beforeClass；例：AA_497 1-3 宥辰認識的那一堂下課，src/sup497_3d.js）*/ const ev=S.afterClassFirst(ok);   /* classFirst：同一堂下課先演這一件（例：經濟系 P1b1 先、再接 P2，AA_272 第 13 節）*/ if(!ev) return false; await EVENTS.run(ev);
    { const ev2=S.afterClassAlso(ev,ok); if(ev2) await EVENTS.run(ev2); }   /* classAlso：同一堂下課前面已經演了別的，也接著演（阿哲第一次民總下課約吃麵，AA_542 1-1；同一堂有學姊家聚 ev_sis_fam_hall2）*/ return true; };   /* afterExam:'mid'／'final'＝那一科考完（G1 考完試走出教室）；沒寫＝一般的課 */
  /* 總圖新生導覽（AA_134 第 2 節，使用者 2026-10-15「開始到結束就是一個按鈕？」）：館員走在前面，玩家自己用搖桿跟上（走太遠她停下來等），每站一到兩句（字幕，不擋操作）；
     同場的新生 2 個跟在館員後面（buddy）；9/19 那一場、還沒走過「總圖的下午」（第二天和以安約總圖）的話，以安站在最前面，最後一站對玩家說一句。
     中途離開（離開這一區、或離館員 25 m 以上超過 40 秒）＝館員不等、記「去過但沒走完」（left），清單不打勾、改天可以再參加別場。走完＝full */
  const TOUR=[
    {x:-3.0,z:2.8,lv:0,say:'新生導覽，十五分鐘。跟著我走，問題留到最後。'},
    {x:0,z:4.4,lv:0,say:'進出都要刷學生證。忘記帶的，服務台可以臨時登記，一學期三次。'},
    (()=>{ const d=typeof LIBRARY_LAYOUT!=='undefined'&&LIBRARY_LAYOUT.furniture?LIBRARY_LAYOUT.furniture.find(f=>f.type==='desk'&&(f.lv|0)===0):null;   /* LIB-PLAN-1103：服務台前（讀配置；第四版服務台搬到閘門北邊 (3.0,1.0)，站在讀者那一側 (3.0,−0.3)；第三版 (7.8,4.4) → (7.8,3.2) 照舊）*/
      return d&&d.z<3?{x:d.x,z:+(d.z-d.d/2-0.9).toFixed(2),lv:0,say:'借書、還書都在這邊。找不到書也可以來問。'}:{x:7.8,z:3.2,lv:0,say:'借書、還書都在這邊。找不到書也可以來問。'}; })(),
    {x:-7.0,z:-5.3,lv:1,say:'二樓的長桌不用預約，晚上很搶。插座在桌子底下。'},
    {x:10.6,z:5.6,lv:1,say:'研究小間不用預約，有空的就能進去，一個人也可以。要跟同學討論的話，B1 有討論室，兩個人以上，要上網預約。'},   /* 同一站（新生導覽照舊七站，tests/flow_lib_tour.py）；AA_635（企劃線 db117b0f8；AA 11-03 12:06 AA_399 3-1 更正：研究小間一個人用、討論室兩人以上上網預約）；「大四以後」照使用者 11-03 選擇題「大一就能用，免預約」改（CARREL-FREE-1103）*/
    {x:10.8,z:-6.0,lv:1,say:'三樓比較安靜。講話請到樓梯間。',up:true},
    {x:0,z:4.4,lv:0,say:'以上。法律的書在四樓以上，這學期在整理，下學期再帶你們上去。',zone:'library'} ];   /* LIB-3F-1102 第二版：最後一站 (0, 4.4)（第一版 (0, 3.2) 在第二版的科技中文書架上）*/
  S.runLibTour=async function(GM,a){ const G=GM.G, E=GM.E, A=ACTIVITIES.rec(G).att, k=a.id+'@'+G.day; A[k]={h:+(G.hour%24).toFixed(2),end:'left'};
    if(hr(G)<a.t0){ await GM.fade(true); GM.advance(a.t0-hr(G)); await GM.fade(false); }
    const D19=(()=>{ for(let d=1;d<30;d++){ const x=CALENDAR.dateOf(d); if(x.m===9&&x.d===19) return d; } return -1; })(), withAn=G.day===D19&&!(G.flags.plan==='library'&&G.flags.afternoonDone);
    let lib=null, crew=[];
    const spawnCrew=(x,z,lv)=>{ const o=CHAR.build(STORY.extraSpec(45)); o.position.set(x,0,z); lib=E.addNPC({obj:o,name:'館員',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,lv:lv|0}); if(E.placeAt) E.placeAt(lib,x,z,lv|0); crew=[];
      for(let i=0;i<2;i++){ const q=CHAR.build(STORY.extraSpec(150+i*7)); q.position.set(x+0.8*(i?1:-1),0,z+1.2); const n=E.addNPC({obj:q,name:'',beh:'buddy',buddy:lib,side:i?1:-1,followOff:0.9+i*0.4,isExtra:true,lv:lv|0}); if(E.placeAt) E.placeAt(n,x+0.8*(i?1:-1),z+1.2,lv|0); crew.push(n); }
      if(withAn&&GM.spawnCharacter){ const an=GM.spawnCharacter('heroine_01',x+0.6,z-0.8,{lv:lv|0,beh:'buddy'}); if(an){ an.buddy=lib; an.side=1; an.followOff=0.7; crew.push(an); } } };
    const near=()=>{ const P=E.player.obj.position, L=lib.obj.position; return (E.player.lv|0)===(lib.lv|0)&&Math.hypot(P.x-L.x,P.z-L.z)<4.5; };
    const far=()=>{ const P=E.player.obj.position, L=lib.obj.position, h=Math.hypot(P.x-L.x,P.z-L.z); return (E.player.lv|0)!==(lib.lv|0)?h>8:h>25; };   /* BUG-TOUR-STAIRS-FAR-1103（BB 17:01，CC N19_tour_joy）：館員在樓梯平台等、玩家在下一層就在她腳下＝不算走遠（原本不同層一律算，40 秒就判「你離開了」）*/
    let zone0=G.zone, farT=0, left=false, upNote=false, warned=false;
    /* BUG-TOUR-STAIRS-FAR-1103 的兩句（AA 11-03 17:04）：館員在上一層等＝旁白一次（每一站）；走遠到一半時間（20 秒）＝館員小聲提醒一次（回來以後再走遠才會再提醒）*/
    const TOUR_UP='（館員站在樓梯平台上，回頭等你們跟上來。）', TOUR_WARN='（小聲）導覽往這邊喔，還要一起走嗎？';
    const waitFor=async(cond,maxS)=>{ let t=0; while(!cond()){ await GM.sleep(300); t+=0.3; if(G.zone!==zone0&&!E._tourMove){ left=true; return false; } if(far()) farT+=0.3; else { farT=0; warned=false; } if(!upNote&&lib&&(lib.lv|0)>(E.player.lv|0)){ upNote=true; GM.caption('',TOUR_UP,3600); } if(!warned&&farT>=20){ warned=true; GM.caption('館員',TOUR_WARN,4200); } if(farT>40){ left=true; return false; } if(maxS&&t>maxS) return true; } return true; };
    spawnCrew(TOUR[0].x,TOUR[0].z,0); GM.caption('館員',TOUR[0].say,5000); await waitFor(near,20);
    for(let i=1;i<TOUR.length&&!left;i++){ const st=TOUR[i]; upNote=false;
      if(st.zone){ E._tourMove=true; GM.caption('','（你們跟著館員從樓梯間上三樓。）',2400); const sp=(typeof LIBRARY_LAYOUT!=='undefined'&&LIBRARY_LAYOUT.reading&&LIBRARY_LAYOUT.reading.spawnFromStairs)?Object.assign({},LIBRARY_LAYOUT.reading.spawnFromStairs):{x:0,z:7,yaw:Math.PI};   /* 3F 的樓梯間（第一版南牆 (0,7)；LIB-3F-1102 第二版東牆 (10.6,−6)，src/library_3f_v2.js 寫回 reading.spawnFromStairs）*/ try{ await GM.enter(st.zone,sp); } finally { E._tourMove=false; } if(GM.G.zone!==st.zone){ left=true; break; } zone0=st.zone; { const dx=0-sp.x, dz=-4-sp.z, dl=Math.hypot(dx,dz)||1; spawnCrew(sp.x+dx/dl*1.5-dz/dl*0.8,sp.z+dz/dl*1.5+dx/dl*0.8,0); } }
      let arrived=false; if(!E.moveTo(lib,st.x,st.z,()=>{ arrived=true; },st.lv)){ if(E.placeAt) E.placeAt(lib,st.x,st.z,st.lv); arrived=true; }
      await waitFor(()=>arrived,60); if(left) break; lib.pose=lib.idlePose='idle'; if(GM.face) GM.face(lib,E.player.obj.position.x,E.player.obj.position.z);
      await waitFor(near,90); if(left) break; GM.caption('館員',st.say,5200); await GM.sleep(2600); }
    if(left){ GM.caption('','你離開了「'+a.title+'」。館員帶著其他人繼續走。改天還有別場。',3800); }
    else { A[k]={h:A[k].h,end:'full'}; if(withAn&&GM.npc.heroine_01){ await GM.sleep(1800); GM.caption(SOCIAL.displayName('heroine_01'),'三樓要安靜。……那我還是坐二樓。',4200); } }
    setTimeout(()=>{ try{ for(const n of crew.concat(lib?[lib]:[])){ if(n&&!n.charId&&E.npcs.includes(n)) E.removeNPC(n); } }catch(e){} },6000);
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return !left; };
  /* 導覽進行中（BB 11-03：大一第 1 週 15:55 系學會合照的出發選單在導覽中間跳出來，按了就離開導覽）：OUT.tick 先不跳出發選單，導覽結束再跳 */
  S.touring=false; (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['classes3d:touring']=()=>{ S.touring=false; };
  { const run0=S.runLibTour; S.runLibTour=async function(GM,a){ S.touring=true; try{ return await run0(GM,a); } finally { S.touring=false; } }; }
  S.attendActivity=async function(GM,a,o){ o=o||{}; const G=GM.G; if(!a||typeof ACTIVITIES==='undefined'||ACTIVITIES.attended(G,a.id,G.day)) return false;
    if(a.id==='lib_tour_y1s1'&&GM.E&&GM.E.player&&GM.E.moveTo&&typeof CHAR!=='undefined'&&GM.G.zone==='library_hall'&&!o.inScene) return S.runLibTour(GM,a);   /* 沒有 3D 引擎（單元測試）照舊快轉 */   /* 總圖新生導覽：館員帶著走一圈（AA_134 第 2 節）*/
    const lec=a.kind==='lecture', tour=a.kind==='tour', club=a.kind==='club';
    const lj=club&&!!ACTIVITIES.lateJoinDue&&ACTIVITIES.lateJoinDue(G,a), noAuto=club&&!!ACTIVITIES.noAutoJoin&&ACTIVITIES.noAutoJoin(G,a);   /* AA_737 lateJoin（BULLETIN-BOARD-1110）：大一上第 5、6 週還不是社員＝社課結束時問（不在開頭自動入社）；問過選「先不要」的＝旁聽。要在 markAttended 以前判斷 */
    const small=lec&&!!a.smallRoom, who=a.speakerWord||'學長';   /* 小房間（討論室、沒有台）的講座：AA-B 11-08 01:20 兩句（AA_613 最後一節）；講的人照那一場（館員就寫 speakerWord:'館員'）*/
    const rainNarr=a.rain&&ACTIVITIES.rainy&&ACTIVITIES.rainy(a,G,true)&&a.narr?S.clubRainNarr(G,a):null;   /* 下雨場（BBALL-RAIN-1030）：17:30 以前就參加＝參加的那一刻照當下的天氣定；旁白固定用走廊那一句（不佔晴天照順序輪的那一格）*/
    ACTIVITIES.markAttended(G,a); if(a.id==='public_law_group'&&typeof STORY!=='undefined'&&STORY.mootTogetherCheck) STORY.mootTogetherCheck(G,'plg');   /* 模擬法庭準備分第 4 項（AA_143 3-3）*/ if(a.id==='B4'&&G.flags) G.flags.B4_ATTENDED=true;   /* AA_140 G07：聽過 B4 演講（重訪日 1 的「那場演講。」、C15 回想讀它）*/ if(club&&G.flags&&!noAuto){ G.flags['CLUB_'+a.id]=true; if(a.id==='lawclub_study') G.flags.lawclub=true; }   /* 第一次去社課就算加入（AA_110 6-3：CLUB_<id>）；法服另外記 lawclub（看過招募公告的那個旗標）*/
    const ev=club?S.clubEvent(G,a):(a.event?S.actEvent(G,a):null);   /* 活動的事件（event：迎新，交接包 v1 A11）*/
    if(ev) await EVENTS.run(ev);   /* 人物事件（6-8 (a)）：自己的 ADV 畫面；播完再快轉到社課結束 */
    if(!o.inScene) GM.sceneBegin(o.door&&!ev?{adv:a.id==='lawclub_study'?{charId:'heroine_05',expression:'neutral'}:true}:undefined);   /* 門口參加（進不去的房間）＝2D 畫面 */
    try{
      if(GM.E&&GM.E.zone&&GM.E.zone.setBoard) GM.E.zone.setBoard(a.title,lec?'演講':'活動',hhmm(a.t0)+'–'+hhmm(a.t1));
      if(!ev&&!(a.spot&&(club||a.special))) await GM.say(null,tour?(hr(G)<a.t0?'你在集合點等「'+a.title+'」開始。':'你跟上「'+a.title+'」的隊伍。'):hr(G)<a.t0?(lec?(small?'你找了位子坐下。白板前的'+who+'在接投影機，螢幕停在第一頁：「'+a.title+'」。':'你找了位子坐下。台上的人在試麥克風，投影片停在第一頁：「'+a.title+'」。'):'你找了位子坐下，等「'+a.title+'」開始。'):(lec?(small?'你輕輕坐下。白板前的'+who+'已經開始講「'+a.title+'」了。':'你輕輕坐下。台上已經開始講「'+a.title+'」了。'):'你輕輕坐下。「'+a.title+'」已經開始了。'));   /* 系籃（集合點的社課）：AA 6-8 (c) 選「去練球」→ 直接轉暗 */
      let cin=null; if(club) for(const f of S.CLUB_IN){ try{ const r=await f(GM,a,ev); if(r) cin=r; }catch(e){ console.warn('CLS.CLUB_IN',e); } }   /* 社課開始、人物事件之後接著演的（S.CLUB_IN.push(async fn(GM,a,ev))；回傳 {narr}＝這一次的旁白換成它，輪流的那幾句不往前；例：AA_619 2-1 吉他社第一次社課，src/guitar3d.js）*/
      let narr=''; if(club&&cin&&cin.narr!=null){ narr=cin.narr; if(narr&&a.narrAt==='start') await GM.say(null,narr); } else if(club&&!ev){ narr=rainNarr||S.clubNarr(G,a); if(narr&&a.narrAt==='start') await GM.say(null,narr); if(a.id==='lawclub_study') await S.studyQs(GM); }
      if(GM.E&&roomy(GM.E.zone)) S.syncRooms(GM);   /* 快轉前聽眾先坐好（2026-10-13 批次 3：演講開始前 5 分鐘坐下選「聽演講」，聽眾還沒排進來就快轉到結束，散場時沒有人站起來）*/
      await GM.fade(true); S.settleRoom(GM); const h=hr(G); if(h<a.t1) GM.advance(a.t1-h); keepCrowd(G); await GM.fade(false);
      if(narr&&a.narrAt!=='start') await GM.say(null,narr);   /* 社課的旁白：做完以後的一句（系籃：轉暗、時間過去、播旁白）*/
      let endCap=null; if(a.special&&!club){ const sn=S.specialNarr(G,a); for(const t of sn.lines) await GM.say(null,t); endCap=sn.end; }   /* 特殊活動（AA_737 specialEvents）：快轉以後播整串旁白 */
      if(lj) await S.lateJoinAsk(GM,a);   /* AA_737 lateJoin：社課快結束的時候，社長拿著入社單過來 */
      GM.caption('',endCap||(club?'社課結束了。':lec?'演講結束了。台下有人舉手，有人已經在收東西。':tour?'導覽結束了。':'活動結束了。'),2800);
      { const after=S.afterActEvent(G,a); if(after) await EVENTS.run(after); }   /* 活動結束後接著演的畫面（afterActivity＝活動 id；例：大一下第 4 週法服讀書會結束後的沛珊和柏翰，交接包 v2 C21）*/
    } finally { if(!o.inScene) GM.sceneEnd(); }
    S.slotFillSpan(G,a.t0,a.t1);   /* 社團、演講、活動＝那個時段的一件主要的事（DEC-SLOTS-1018 ③）*/
    if(GM.autosave) GM.autosave(); return true; };
  /* 社團博覽會（AA_110 6-8 (b)；CLUBFAIR-REAL-1027 起照 AA_485 第 3 節）：服務台（椰林大道上的集合點）＝十五攤的選單（CLUBFAIR.menu）；各攤帳篷前面也有互動點（src/clubfair3d.js）。
     開放時間（10:00–16:00）以外按：寫幾點開始／今天收了。沒去博覽會的玩家，第一次去社課也算加入（6-3），旁白多一句「（你在門口填了表。）」（AA_485 3-4，clubfair3d.js）*/
  const WDN=['日','一','二','三','四','五','六'];
  S.clubWhen=function(c,termId){ if(c&&c.whenText) return c.whenText;   /* whenText：時間地點不照課表寫（法服，AA_372 第 1 項）*/
    const wds=c.weekdays||(c.weekday?[c.weekday]:[]); const w0=((termId&&c.termWeeks&&c.termWeeks[termId])||c.weeks||[])[0]; return (wds.length?'每週'+wds.map(d=>WDN[d]).join('、')+' ':'')+hhmm(c.t0)+'–'+hhmm(c.t1)+(c.roomName?'，'+c.roomName:'')+(w0>1?'（第 '+w0+' 週起）':''); };
  S.fairMenu=async function(GM,a){ const G=GM.G, h=hr(G);
    if(!ACTIVITIES.on(a,G.day,G)||h<a.t0||h>=a.t1){ GM.caption('',a.title+'：'+(!ACTIVITIES.on(a,G.day,G)?'':h<a.t0?'今天 '+hhmm(a.t0)+' 開始。':'今天的攤位收了。')+(a.desc||''),4200); return 0; }
    if(!ACTIVITIES.attendedAny(G,a.id,G.day)) ACTIVITIES.markAttended(G,a);   /* 去過博覽會（出席紀錄：之後的事件可以用 attended）*/
    /* CLUBFAIR-REAL-1027（AA_485 3-3）：服務台＝十五攤的選單（能加入的五攤＋只能看看的十攤；src/clubfair3d.js、src/data/club_fair.js）。原本只有五個社團、選了就填表 */
    if(typeof CLUBFAIR!=='undefined'&&CLUBFAIR.menu) return CLUBFAIR.menu(GM,a);
    GM.caption('',a.title+'：'+(a.desc||''),4200); return 0; };
  /* 座位（霖澤館 201）：這堂課現在可以上 → 坐下時的第一個選項（game3d.js 的 seatMenu）*/
  S.seatClass=function(G,seat){ if(!G) return null; if(seat&&seat.room) return S.liveIn(G,G.zone).find(it=>it.room.room===seat.room&&S.status(G,it)==='open')||null;   /* 建築裡的教室（共同教學館 101…）：座位在那一間 */
    if(G.zone!=='classroom') return null; return S.liveIn(G,'classroom').find(it=>S.status(G,it)==='open')||null; };
  // ---------- 門口上課（共同教學館、體育館、萬才館研討室）：校園的互動點 ----------
  const DOORS={ common:{zone:'campus',x:2,z:22.8,radius:1.6,label:'共同教學館',mark:true,enter:'gongtong',look:'共同教學館：大一國文、大一英文、通識在這裡上課。'},   /* enter：館內（src/teach3d.js，D55 第二階段）；沒有課時按門就進館，有課時多一個「進去上課」 */   /* 2026-10-13：原本在 (45,22.6) 一棟無名系館門口；共同教學館蓋在真實位置（行政大樓東邊）後搬到它的正門 */
                putong:{zone:'campus',x:-38,z:-49.4,radius:1.6,label:'普通教學館',mark:true,enter:'putong',look:'普通教學館：文學院後面那棟，很多共同課程、通識在這裡上；二樓有空橋通博思。'},   /* 方案 A（D55）：文學院正後方，正門朝南 */
                boya:{zone:'campus',x:-38,z:-72.8,radius:1.6,label:'博思教學館',mark:true,enter:'boya',look:'博思教學館：一樓有大階梯教室和自習區，常有演講；北邊就是映月湖。'},   /* 方案 A：普通北邊，正門朝南（空橋底下）*/
                gym:{zone:'campus',x:-75,z:-125.0,radius:1.6,label:'體育館',enter:'gym',look:'體育館：體育課在這裡上。'},   /* enter：館內（src/gym3d.js，新體育館第一階段）；體育課照舊可以在門口上（選單「進館裡逛逛」），館內球場中圈也可以 */
                lawlib_desk:{zone:'lawlib',built:true,label:'櫃台',verb:'報到',noToday:true,look:'櫃台：借書、還書、借討論室都在這裡辦。館員正把一疊還回來的書一本一本掃條碼，抬頭說：「還書放旁邊的還書口就好。」'},   /* 服務學習（一）在櫃台報到（AA_110 6-1）；互動點是法律學院圖書館自己的櫃台（lawlib3d.js）*/
                wancai_lsc_desk:{zone:'wancai',built:true,label:'法律服務中心',verb:'報到',noToday:true,look:'法律服務中心　週三 14:00～17:30 民眾諮詢'},   /* 服務學習（二）在接待桌報到（AA_735；原本晨思鐘旁的集合點 campus_service 不再用）；互動點是法律系館B 大廳自己的接待桌（wancai3d.js）*/   /* 服務學習（二）（大二上；內容 AA 大二前再補）：只在那學期出現 */
                wancai_seminar:{zone:'wancai',built:true,label:'研討室 A',look:'研討室 A：法律系館B二樓的小教室，大四的研討課在這裡上。'} };   /* built：門的互動點由區域自己建（wancai3d.js 的研討室 A），addDoors 不另外加 */
  S.DOORS=DOORS;
  S.PE_IN_GYM={x:0,z:-2.6,yaw:Math.PI};   /* 體育課的站位：體育館球場中圈（gym_layout.js pe_class (0,-4)）前面、面向中圈 */
  /* ---------- 體育課在體育館裡上（AA_644，企劃線 96d771c8d，AA 定稿 D109；PE-IN-GYM-AA644-1103）----------
     站位：老師在中圈北邊、面向南；同學圍成半圈（crowd3d.js 的 gym_pe：10 個位子，玩家站在半圈最南邊 S.PE_IN_GYM）；有修這堂、在場的朋友站進半圈（S.peCast：換掉離玩家最近的路人）。
     游泳週（大一上第 10～16 週）整班改到 B1 游泳池（gym_b1）：老師站池邊、同學坐池邊的長椅（crowd3d.js 的 gym_pe_pool），玩家站在 S.PE_POOL；
     B1 那天沒開（每月第四個星期一休館；B1 區域沒有）＝照舊在球場，旁白換成 S.PE_SWIM_CLOSED。
     每週一句旁白（S.PE_NARR，稿上的字照抄）取代原本台詞池（syllabus.js pools）的那一句和同學反應；朋友不在場（S.peHere）＝名字換成「有人」（稿第 3 節的例子）。
     經濟系那一年（pe_y0s1）：大一上第 1～8 週的旁白，名字換經濟系的同學（S.PE_Y0）。體育老師不認得個別學生（AA_596 §八）；旁白沒有選項、不影響數值，朋友只在旁白裡出現（不另開對話）。測試：node tests/pe_aa644_unit.js */
  S.PE_POOL={x:16.6,z:-2.2,yaw:+Math.atan2(19.8-16.6,-3.4+2.2).toFixed(4)};   /* B1 池邊（東側兩張長椅西邊）、面向站在池邊的老師（crowd3d.js gym_pe_pool：老師 (19.8,−3.4)）*/
  S.PE_NARR={
    pe_y1s1:['（第一堂。老師點完名，說這學期分三段：體適能、球類、游泳。）','（暖身跑了六圈。最後一圈大家都在用走的。）','（量身高、體重、坐姿體前彎。排隊的時候大家都在講昨天的報告。）','（折返跑。阿哲跑在最前面，回頭喊你們快一點。）',
      '（開始打籃球。老師先教運球，球一直滾到隔壁的羽球場。）','（分組三對三。球一直打到界外。）','（排球低手傳球。整堂課都在撿球。）','（分組比賽。柏翰站在籃下，算好位置才動。輸的那一組收球。）',
      '（老師說下週開始游泳，記得帶泳衣泳帽。）','（第一次下水。水比想像中冷。老師說先閉氣十秒就好。）','（扶著池邊練踢水。旁邊那一水道有人游得很快。）','（第一次不扶池邊，游了半趟。上岸的時候腿有點軟。）',
      '（換氣。嗆了兩次水，第三次就對了。）','（老師說期末要游二十五公尺，不限姿勢。）','（期末前最後一次練習。你游到對面，扶著牆喘了很久。）','（期末測驗。二十五公尺，你游完了。）'],
    pe_y1s2:['（這學期打羽球。老師發球拍，有幾支的線鬆了。）','（練握拍和高遠球。羽球一直往旁邊飛。）','（兩人一組對打。Alison 每打一球就喊一聲。）','（練殺球。老師說手腕不要太用力。）',
      '（雙打的站位。你和同組的人撞在一起兩次。）','（羽球分組比賽。打到後來沒人在記分。）','（換排球。網子拉起來，比去年高。）','（練發球。第五球終於過網。）',
      '（排球分組比賽。明軒一直跑到你的位置接球。）','（練扣球。跳起來的那一下，球擦過手指。）','（排球分組比賽第二輪。這次贏了一局。）','（體適能檢測前的練習：仰臥起坐一分鐘。）',
      '（立定跳遠。粉筆在地上畫了一條線。）','（八百公尺。跑完大家都坐在地上。）','（體適能檢測。老師一個一個登記。）','（期末：羽球和排球各考一項。考完老師說暑假也要動。）'],
    pe_y2s1:['（這學期打桌球和籃球。桌球桌從倉庫推出來，有一張的網歪了。）','（練正手推擋。球一直彈到別桌。）','（練反手。老師說腳要動，不要只動手。）','（練發球。芯慈一直在調球拍的角度，發得很準。）',
      '（桌球單打比賽。打到十一分，換人。）','（桌球雙打。輪流接球，常常兩個人都沒動。）','（桌球考試前的練習。一直有人喊「好球」。）','（桌球考試：推擋連續二十下。）',
      '（換籃球。阿哲說他等這一段等一年了。）','（練上籃。第三次終於進了。）','（練傳球和跑位。老師一直吹哨。）','（分組比賽。阿哲傳給你一球，你沒進，他說沒事啦。）',
      '（分組比賽第二輪。中場的時候大家都在喝水。）','（體適能：一分鐘仰臥起坐、坐姿體前彎。）','（八百公尺。今年比去年快了一點。）','（期末：投籃十球、運球繞錐。考完大家一起收球。）']};
  S.PE_SWIM={pe_y1s1:[10,11,12,13,14,15,16]};   /* 稿上地點寫「B1 游泳池」的週 */
  S.PE_SWIM_CLOSED='（今天在球場講游泳的安全守則。下週下水。）';   /* 稿第 3 節：游泳週 B1 沒開 */
  /* AA_644 §4（企劃線 a1302b8db，AA 11-03 23:36）：第 16 週（期末）碰到 B1 休館、換成「有人」以後要另寫的那一句、遲到的體育館版（教室那兩句在體育館不出）*/
  S.PE_SWIM_CLOSED16='（B1 游泳池今天休館。期末改在球場考體適能。）';
  S.PE_SWIM_CLOSED_MID='（今天 B1 游泳池休館，改在球場練划手和換氣的動作。）';   /* AA_644 §5（企劃線 92c089f47）*/
  S.PE_ANON_FIX={'（換籃球。有人說他等這一段等一年了。）':'（換籃球。有人說終於輪到籃球了。）'};   /* 不認識的人不會知道他等了一年 */
  S.PE_LATE={gym:{abs:'（你到的時候大家已經在暖身了。你站到半圈最後面。）',late:'先跑兩圈再進來。'},gym_b1:{abs:'（你到的時候大家已經下水了。）',late:'先在池邊暖身。'}};
  S.PE_FRIENDS=['zhe','classmate_bohan','classmate_mingxuan','yu','classmate_xinci','classmate_youchen'];   /* 稿第 1 節：有修這堂的朋友（法律系同屆）*/
  S.PE_NAME={'阿哲':'zhe','柏翰':'classmate_bohan','明軒':'classmate_mingxuan','Alison':'yu','芯慈':'classmate_xinci'};   /* 旁白裡的名字 → 人物 */
  S.peTable=function(c){ if(!c) return null; if(S.PE_NARR[c.id]) return {lines:S.PE_NARR[c.id],name:S.PE_NAME,friends:S.PE_FRIENDS};
    return null; };
  S.b1Open=function(G){ if(typeof Z3==='undefined'||!Z3.ZONES.gym_b1||typeof GYM_LAYOUT==='undefined'||!GYM_LAYOUT.b1) return false; if(typeof CALENDAR==='undefined'||!G) return true; const d=CALENDAR.dateOf(G.day); return !(d.wd===1&&d.d>=22&&d.d<=28); };   /* 每月第四個星期一休館（gym3d.js fourthMonday、crowd3d.js gymHours 同一個判斷）*/
  S.peSwimWeek=it=>!!(it&&it.c&&(S.PE_SWIM[it.c.id]||[]).includes(it.week));
  S.peSwim=(G,it)=>S.peSwimWeek(it)&&S.b1Open(G);   /* 這一堂在 B1 游泳池上 */
  /* 朋友在不在這一堂：這學期在學校（STORY.present）、認識（不認識的人旁白不寫名字，S.reactLine 同一個規矩）；宥辰照他的作息：第 14 週以後才來（稿第 1 節）*/
  S.peHere=function(G,id,it){ if(typeof STORY==='undefined') return false; if(STORY.present&&!STORY.present(id,G)) return false; if(STORY.knows&&!STORY.knows(id,G)) return false;
    if(id===(STORY.YOUCHEN||'classmate_youchen')&&!((it&&it.week)>=14)) return false; return true; };
  S.peFriends=function(G,it){ const T=S.peTable(it&&it.c); return T?T.friends.filter(id=>S.peHere(G,id,it)):[]; };
  S.peNarr=function(G,it){ const T=S.peTable(it&&it.c); if(!T) return null; let t=T.lines[(it.week|0)-1]; if(!t) return null; if(S.peSwimWeek(it)&&!S.b1Open(G)) return (it.week|0)===16?S.PE_SWIM_CLOSED16:((it.week|0)>=11?S.PE_SWIM_CLOSED_MID:S.PE_SWIM_CLOSED);   /* AA_644 §5：第 10 週還沒下過水＝講安全守則；11～15 週＝在球場練划手換氣；16 週＝改考體適能 */
    for(const nm in T.name){ if(t.indexOf(nm)<0||S.peHere(G,T.name[nm],it)) continue; t=t.split(nm+(/^[A-Za-z]/.test(nm)?' ':'')).join('有人'); } return S.PE_ANON_FIX[t]||t; };
  /* BUG-PE-CLASS-1107（使用者 11-07 試玩：「體育館上課 直接過去 還是顯示在法律系館a前方上完所有課」）：一鍵上課（goClass）原本 GM.enter('campus') 沒有落點＝校園預設出生點（法律系館A前）、2D 上課；
     體育課改照門口那條路（doorInteract）：進體育館（或 B1 游泳池）站到上課位置、inGym 上課 */
  S.peGoClass=(G,it)=>it&&it.room&&it.room.door==='gym'&&S.PE_IN_GYM&&typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES.gym?S.pePlace(G,it):null;
  S.pePlace=(G,it)=>S.peSwim(G,it)?Object.assign({zone:'gym_b1'},S.PE_POOL):Object.assign({zone:'gym'},S.PE_IN_GYM);
  /* 朋友站進半圈（坐上長椅）：換掉這一堂離玩家最近的路人同學（crowd3d.js 的 pe_student／pe_swim，crowdKey 最後的序號＝離玩家的遠近），朋友照那個位置、朝向、座位；
     下課（it.t1）照作息離開（story3d.js n.until）。換掉的位子記在 S._peTaken：人群重排時那幾個位子不再放路人 */
  S._peTaken={key:null,keys:new Set()};
  S.peTakenKey=k=>S._peTaken.keys.has(k);
  S.peCast=function(GM,it){ const E=GM.E; if(!E||!Array.isArray(E.npcs)||!GM.spawnCharacter) return []; if(S._peTaken.key!==it.key) S._peTaken={key:it.key,keys:new Set()};
    const role=S.peSwim(GM.G,it)?'pe_swim':'pe_student', idx=n=>+String(n.crowdKey||'').split('|').pop();
    const ext=E.npcs.filter(n=>n&&n.crowdRole===role&&!n.leaving&&String(n.crowdKey||'').indexOf(it.key)>=0).sort((a,b)=>idx(a)-idx(b)), out=[];
    for(const id of S.peFriends(GM.G,it)){ if(GM.npc&&GM.npc[id]&&E.npcs.includes(GM.npc[id])){ out.push(GM.npc[id]); continue; } const x=ext.shift(); if(!x) break;
      const P=x.obj.position, yaw=x.obj.rotation.y, st=x.seat||null; S._peTaken.keys.add(x.crowdKey); E.removeNPC(x);
      const n=GM.spawnCharacter(id,P.x,P.z,{yaw,lv:x.lv|0,seat:st||undefined,pose:st?'sit':'idle',talk:null,talkLabel:null,greet:false}); if(!n) continue;
      n.until=it.t1; n.peFriend=it.key; n.frozen=true; if(!st) n.obj.rotation.y=yaw; out.push(n); }
    return out; };
  S.DOOR_BG={wancai_seminar:'wancai_seminar'};   /* 門口上課的 ADV 背景（OUT.BG 的 id）：研討室 A＝法律系館B・研討室（現有的圖）；共同、普通、博思、體育館照舊模糊（不考五題，BB 10:24 先記下）*/
  S.DOOR_EXAM_LINE={wancai_seminar:'（法律系館B 的研討室。{課名}只有十幾個人，大家圍著長桌坐，老師坐在桌子的另一頭，手邊一疊考卷。）'};   /* 研討室 A 期末考開頭的旁白（AA_578 第 7 節 @9a767de08，BB 口氣審 PASS 10:24）：法律倫理、刑事判決研討、公法判決研討共用 */
  S.addDoors=function(GM,zoneId){ const E=GM.E; const tm=typeof CALENDAR!=='undefined'&&GM.G?CALENDAR.termOf(GM.G.day):null; for(const k in DOORS){ const d=DOORS[k]; if(d.zone!==zoneId||d.built) continue; if(d.terms&&!(tm&&d.terms.includes(tm.id))) continue;
      E.interactables.push(Object.assign({x:d.x,z:d.z,radius:d.radius,lv:0,label:d.label,door:k,mark:!!d.mark,onInteract:()=>S.doorInteract(GM,k)},d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]?{exit:{to:d.enter}}:{})); } };   /* exit：讓目標導航知道這個門通到館裡（按下去照樣走 onInteract）*/
  /* 沒有座位的活動（總圖新生導覽…）在集合點參加（AA_110 6-3）：今天有這個活動就放一個互動點；時間到了按下去參加，還沒到寫幾點集合 */
  S.addActSpots=function(GM,zoneId){ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.spotsIn) return; const E=GM.E, G=GM.G;
    for(const a of ACTIVITIES.spotsIn(G,zoneId)){ const sp=a.spot, it={x:sp.x,z:sp.z,radius:sp.r||1.2,lv:sp.lv|0,label:sp.label||a.title,mark:true,actSpot:a.id,onInteract:()=>S.spotInteract(GM,a)};
      if(a.rain) Object.defineProperty(it,'look',{enumerable:true,get(){ return GM.G&&ACTIVITIES.rainy&&ACTIVITIES.rainy(a,GM.G)?a.rain.hint:undefined; }});   /* 下雨場（BBALL-RAIN-1030）：這裡只剩提示——按了寫 a.rain.hint（spotInteract），只看、不參加 */
      E.interactables.push(it); }
    /* 下雨的備案的集合點（系籃練球下雨＝新體育館一樓走廊，BBALL-RAIN-1030）：那一場的那一天都放，不是下雨場就藏起來（17:30 以前照現在的天氣、17:30 定了以後整場照定的：ACTIVITIES.rainy）。
       mark 跟著 hidden（遠遠的名牌、大地圖）；參加照同一套（spotInteract → attendActivity）*/
    if(ACTIVITIES.rainy) for(const a of ACTIVITIES.list){ const R=a.rain; if(!R||R.zone!==zoneId||!R.spot||!ACTIVITIES.on(a,G.day,G)) continue; const sp=R.spot;
      E.interactables.push({x:sp.x,z:sp.z,radius:sp.r||1.2,lv:sp.lv|0,label:sp.label||a.title,actSpot:a.id,rainSpot:true,get hidden(){ return !(GM.G&&ACTIVITIES.rainy(a,GM.G)); },get mark(){ return !this.hidden; },onInteract:()=>S.spotInteract(GM,a)}); } };
  /* 集合點的社課（系籃練球：球場沒有門口）今天沒有的時候（BBALL-PRESENT-1030；使用者 2026-10-30「系藍練團時間到 根本球場空的」——週四 17:45 站在球場邊）：
     這學期有這個社課、今天不是那一天（或國定假日停練）＝集合點放一個只看不參加的提示：名牌寫星期幾幾點（mark：遠遠看得到），按了寫時間地點和下一次是哪一天。
     今天有（ACTIVITIES.on）就藏起來（真正的集合點由 addActSpots 放）。和 addActSpots 分開：集合點只在活動那一天出現（activities_aa110_unit 的規則照舊）*/
  S.actHints=function(G,zoneId){ if(typeof ACTIVITIES==='undefined'||typeof CALENDAR==='undefined'||!G) return []; const T=CALENDAR.termOf(G.day); if(!T) return [];
    return ACTIVITIES.list.filter(a=>a.spot&&a.kind==='club'&&a.zone===zoneId&&!(typeof a.skip==='function'&&a.skip(G))&&(!a.term||a.term.includes(T.id))&&!ACTIVITIES.on(a,G.day,G)); };
  S.actHintLabel=a=>{ const wds=a.weekdays||(a.weekday?[a.weekday]:[]); return a.title+'（'+(wds.length?'星期'+wds.map(d=>WDN[d%7]).join('、')+' ':'')+hhmm(a.t0)+'）'; };
  S.actHintText=function(G,a){ const T=CALENDAR.termOf(G.day), d0=CALENDAR.dateOf(G.day), hol=CALENDAR.holiday(G.day); let s='今天沒有'+a.title+'。';
    if(hol&&ACTIVITIES.on(Object.assign({},a,{holidays:true}),G.day,G)) s='今天'+(typeof hol==='string'?hol:'放假')+'，'+a.title+'停一次。';   /* 照排是今天、因為國定假日不辦（ACTIVITIES.on：放假那天不辦）*/
    let nx=null; for(let d=G.day+1;d<=G.day+120;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==T.id) break; if(ACTIVITIES.on(a,d,G)){ nx=d; break; } }
    const nt=nx!=null?(()=>{ const q=CALENDAR.dateOf(nx); return '下一次：'+q.m+'/'+q.d+'（'+WDN[q.wd%7]+'）'+hhmm(a.t0)+'。'; })():'這學期的'+a.title+'結束了。';
    return a.title+'：'+S.clubWhen(a,T&&T.id)+'。'+s+nt; };
  S.addActHints=function(GM,zoneId){ const E=GM.E; for(const a of S.actHints(GM.G,zoneId)){ const sp=a.spot;
      E.interactables.push({x:sp.x,z:sp.z,radius:sp.r||1.2,lv:sp.lv|0,label:S.actHintLabel(a),mark:true,actHint:a.id,get look(){ return S.actHintText(GM.G,a); },get hidden(){ return !!(GM.G&&ACTIVITIES.on(a,GM.G.day,GM.G)); }}); } };
  S.spotInteract=async function(GM,a){ const G=GM.G, h=hr(G);
    if(a.kind==='fair'&&a.clubs) return S.fairMenu(GM,a);   /* 社團博覽會：選社團（6-8 (b)）；校慶園遊會（AA_737，kind:'fair'、沒有 clubs）照一般活動參加 */
    if(a.rain&&ACTIVITIES.rainy){ const atRain=G.zone===a.rain.zone, rain=ACTIVITIES.rainy(a,G);   /* 下雨的備案（BBALL-RAIN-1030）*/
      if(rain&&!atRain){ GM.caption('',a.rain.hint,4600); return; }   /* 下雨場：球場的集合點只剩提示（系統字，AA 原句）*/
      if(!rain&&atRain) return; }   /* 不是下雨場：體育館那一點藏著（防呆）*/
    if(ACTIVITIES.canJoin(G,a)){ GM.sceneBegin(); let i=1; try{ i=await GM.choose([{t:(a.verb||'參加')+'：'+a.title,hint:hhmm(a.t0)+'–'+hhmm(a.t1)+'　'+(a.desc||'')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i===0) await S.attendActivity(GM,a); return; }
    if(ACTIVITIES.gapBlocked&&ACTIVITIES.gapBlocked(G,a)&&ACTIVITIES.on(a,G.day,G)&&!ACTIVITIES.attendedAny(G,a.id,G.day)){ GM.caption('',a.title+'：'+(a.gapText||''),4200); return; }   /* 捐血車：上次捐血還不到兩個月（AA_737）*/
    const s=ACTIVITIES.onceDone(G,a)?'你已經參加過了。':(ACTIVITIES.attended(G,a.id,G.day)?'今天這一場你參加過了。':(h<a.t0-0.25?'今天 '+hhmm(a.t0)+' 在這裡集合。':(h>=a.t1?'今天這一場已經結束了。':'今天這一場已經開始一段時間了。')));   /* 結束以後（BBALL-PRESENT-1030）：原本也寫「已經開始一段時間了」*/
    GM.caption('',a.title+'：'+s+(a.desc?a.desc:''),4200); };
  /* 進不去的房間門口（萬才館一樓多功能教室、二樓研討室 A；wancai3d.js）：那一間的社課現在可以參加 →「參加：…」（門口參加＝2D 畫面）；
     研討室 A 有課 → 照門口上課（doorInteract）；今天晚一點才有社課 → 寫幾點；今天參加過了 → 寫參加過了；都沒有 → 原本的說明（門鎖著／研討室的課的說明）*/
  /* 門口現在有事（社課可以參加、門口上課的課正在上）：走得進去的房間（rooms_glb3d.js）的門，有事的時候照舊在門口參加，沒事就走進去 */
  S.roomDoorBusy=function(GM,zone,room,o){ o=o||{}; const G=GM.G; const acts=typeof ACTIVITIES!=='undefined'?ACTIVITIES.list.filter(a=>a.zone===zone&&a.room===room&&ACTIVITIES.on(a,G.day,G)):[]; if(acts.some(q=>ACTIVITIES.canJoin(G,q))) return true; return !!(o.door&&S.liveDoor(G,o.door)); };
  S.roomDoor=async function(GM,zone,room,o){ o=o||{}; const G=GM.G, h=hr(G); const acts=typeof ACTIVITIES!=='undefined'?ACTIVITIES.list.filter(a=>a.zone===zone&&a.room===room&&ACTIVITIES.on(a,G.day,G)):[];
    const a=acts.find(q=>ACTIVITIES.canJoin(G,q));
    if(a){ GM.sceneBegin(); let i=1; try{ i=await GM.choose([{t:(a.verb||'參加')+'：'+a.title,hint:hhmm(a.t0)+'–'+hhmm(a.t1)+'　'+(a.desc||'')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i===0) await S.attendActivity(GM,a,{door:true}); return; }
    if(o.door&&S.liveDoor(G,o.door)) return S.doorInteract(GM,o.door);
    const later=acts.find(q=>h<q.t0-0.25&&!ACTIVITIES.attended(G,q.id,G.day)), went=acts.find(q=>ACTIVITIES.attended(G,q.id,G.day));
    if(later||went){ GM.caption('',later?later.title+'：今天 '+hhmm(later.t0)+' 在這裡（開始前 15 分鐘可以進去）。':'今天的「'+went.title+'」你參加過了。',3600); return; }
    /* 這學期這一間有社課、今天沒有（AA 2026-10-13 P2：吉他社在多功能教室，週二去門口只看到「門鎖著」，不知道什麼時候來）：寫社課的時間＋「今天沒有社課。」；研討室 A 的課照舊接在後面 */
    const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, club=T&&typeof ACTIVITIES!=='undefined'?ACTIVITIES.list.find(q=>q.zone===zone&&q.room===room&&q.kind==='club'&&!(typeof q.skip==='function'&&q.skip(G))&&(!q.term||q.term.includes(T.id))):null;   /* 停用的社團（skip：法服讀書會，AA_372 第 1 項）不寫時間 */
    const td=acts.find(q=>h>=(q.t0+q.t1)/2);   /* 今天有、但已經過了一半（canJoin 到一半為止）或結束了：不能說「今天沒有社課」*/
    const note=club?club.title+'：'+S.clubWhen(club,T&&T.id)+'。'+(td?(h<td.t1?'今天的社課已經過了一半，下次再來。':'今天的社課已經結束了。'):'今天沒有社課。'):'';
    if(o.door) return S.doorInteract(GM,o.door,note?{pre:note}:undefined);
    GM.caption('',note||o.look||'',note?4200:3600); };
  S.doorInteract=async function(GM,k,o){ o=o||{}; const G=GM.G, d=DOORS[k]; const it=S.liveDoor(G,k);
    if(d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]&&(!it||it.room.zone===d.enter)){ await GM.enter(d.enter); if(it&&S.status(G,it)!=='done') GM.toast(S.status(G,it)==='open'?'上課的教室：'+it.room.name+'（找個位子坐下）':it.c.name+'快下課了（'+it.room.name+'），現在進去不算出席',4200); return; }   /* liveDoor 只會是 open 或 missed（2026-10-13 審查：遲到時原本寫「等一下的課在」）*/   /* 課在館內的教室上（2026-10-13）*/
    if(it&&S.status(G,it)==='open'){ const opts=[{t:(d.verb||'進去上課')+'：'+it.c.name,hint:hhmm(it.t0)+'–'+hhmm(it.t1)+'（點對話可以略過）'}]; if(d.enter&&Z3.ZONES[d.enter]) opts.push({t:'進館裡逛逛（不上課）'}); opts.push({t:'不上了'});
      const ch=await (async()=>{ GM.sceneBegin(); try{ return await GM.choose(opts); } finally { GM.sceneEnd(); } })();
      /* BUG-PE-DOOR-2D-1103（使用者 11-03 22:5x 截圖：「體育課上課 用對話呈現？體育館都已經建立好了」「然後背景是校園？」）：體育課＝走進體育館、站到球場中圈上課，背景是館內的 3D（freeze），不在校園門口用模糊背景演 */
      if(ch===0&&k==='gym'&&S.PE_IN_GYM&&typeof Z3!=='undefined'&&Z3.ZONES.gym&&GM.enter){ const P=S.pePlace(G,it); await GM.enter(P.zone,{x:P.x,z:P.z,yaw:P.yaw||0,lv:0}); await S.attend(GM,it,{door:true,inGym:true}); return; }   /* 游泳週：B1 游泳池（S.pePlace，AA_644）*/
      if(ch===0) await S.attend(GM,it,{door:true}); else if(d.enter&&opts[ch].t.startsWith('進館')) await GM.enter(d.enter); return; }
    if(d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]){ await GM.enter(d.enter); return; }   /* 沒有課：公共空間照常可以進（使用者 2026-10-13：「不必每次進入都觸發故事」）*/
    const today=S.dayItems(G).filter(q=>q.room.door===k); if(d.noToday&&!today.length){ GM.caption('',o.look||d.look,4800); return; } const s=today.length?'今天在這裡的課：'+today.map(q=>hhmm(q.t0)+' '+q.c.name+'（'+({done:'上過了',missed:'沒去',open:'可以進去',upcoming:'還沒開始'})[S.status(G,q)]+'）').join('、'):'今天沒有你在這裡的課。'; GM.caption('',(o.pre?o.pre:'')+(o.look||d.look)+s,o.pre?6000:4800); };
  // ---------- 自學：選一門課（AA_104 4-3：和上課累積同一個「準備」）----------
  /* 回傳：null＝沒有給選單（放假、沒有課）；{course}＝選了一科；{notes:true}＝整理這週的筆記（不挑一科）；{extra:i}＝選了 extra 的第 i 項（game3d.js：研究所準備）*/
  S.studyPick=async function(GM,extra){ const G=GM.G; const t=CALENDAR.termOf(G.day); if(!t) return null; const cs=S.termCourses(G,t.id).filter(c=>c.kind!=='service'&&(c.kind!=='general'||c.id.startsWith('ge_'))); if(!cs.length) return null;   /* 通識（ge_*）可以自學；國文、英文、體育不列 */
    const nx=S.next(G); cs.sort((a,b)=>(nx&&a===nx.c?-1:0)-(nx&&b===nx.c?-1:0));
    const ex=extra||[], opts=ex.concat(cs.map(c=>({t:c.name,hint:'這週：'+(S.topic(c,t.week)||'')}))); opts.push({t:'整理這週的筆記（不挑一科）'}); const i=await GM.choose(opts);
    if(i<ex.length) return {extra:i}; if(i>=ex.length+cs.length) return {notes:true};   /* D118-B1：列出全部的課（原本最多 6 門，大二 6 門課＋重修時重修課選不到）*/
    const c=cs[i-ex.length]; const R=S.rec(G); R.prep[c.id]=(R.prep[c.id]||0)+1+(S.hasBook(G,c)?1:0); R.lastStudy={day:G.day,id:c.id,name:c.name}; return {course:c}; };   /* 有那一科的教科書：多一分準備（SYS-BOOKS-1018）*/   /* lastStudy：今天念了哪一科（Café 的學姊問「今天念了什麼？」，BB_120 1-1）*/
  // ---------- 期末考（使用者 2026-10-14 16:15、17:10；企劃分支 AA_126 1-5、AA_130 第 3 節）----------
  /* 考五題的課＝題庫對照表（EXAM_BANK.courseMap）寫 exam:'mc5' 的法律課；非法律課照出席、不考五題（AA_126 1-4）；法律專題研究、實習是 NO_EXAM。
     題目：大一～大三＝使用者確認的正式題目（exam_official/，status USER_CONFIRMED）＋刑訴 QBANK；大四＝交叉審通過的題目（Y4_CROSS_REVIEWED）。AI 不出題、不補題、不改寫。
     兩堆：課堂題（askedIn＝這學期這門課在課堂上問過，或 source:'CLASS_DISC'）優先，不夠才從題庫題補（EXAM_MIX）。兩堆加起來不到 5 題＝不開考。
     抽到的題號存進存檔：讀檔再考是同一份。選項不洗牌、答案不動。 */
  S.EXAM_MIX='class_first';   /* 課堂題最多 5 題，不夠才從題庫補（AA_126 1-5 方案一定案，2026-10-15；3_2 已拿掉）*/
  S.EXAM_WEEKS={mid:[8,9]};   /* final 不再用（期末週照日曆的 exam==='final'，BB 08:58 請刪 final:[16]）；mid 只剩舊存檔讀 R.exam[*:mid] 時用得到 */   /* 16 週制（AA_197 1-6）：期末只有第 16 週；examDay 的期末週照日曆（大四下只有 15 週，BUG-Y4S2-NOFINAL-1102）*/
  /* 進教室時黑板的字（BUG-EXAM-BOARD-1021，BB 10-21 16:51）：今天這間教室還沒考完的期中／期末考＝和坐下開始考的時候一樣的三行；沒有＝null（story3d.js 照星期幾的表）*/
  S.examBoard=function(G,zone){ const h=hr(G), R=S.rec(G); const it=S.dayItems(G).find(x=>x.exam&&x.room&&x.room.zone===zone&&h<x.t1&&!(R.done&&R.done[x.key])); return it?[it.c.name+'：'+(it.exam==='mid'?'期中考':'期末考'),'不可以翻書','鈴響請停筆']:null; };
  S.redoOf=id=>{ const c=typeof COURSES!=='undefined'&&COURSES.list?COURSES.list.find(x=>x.id===id):null; if(!c||!c.redo) return null; const o=COURSES.list.find(x=>x.id===c.redo); return o?{id:o.id,term:o.term}:null; };   /* D118-B1：日本路線的補修（civpro_2_re、insurance_re）考原課（大三下那一門）的題庫——原本只上課、成績照讀書次數（AA_144 X4，D118 取代）*/
  S.isExamCourse=c=>{ if(!c||typeof EXAM_BANK==='undefined') return false; const id=c.redo&&S.redoOf(c.id)?c.redo:c.id; return !!EXAM_BANK.courseMap[id]&&EXAM_BANK.courseMap[id].exam==='mc5'; };
  /* 看出席的課（D43／AA_126 1-4：國文、英文、通識、體育、日文、經濟學原理）：每學期出席三堂才及格，不到三堂不及格；成績單寫及格／不及格。服務學習照舊只記次數 */
  S.ATT_PASS=3;   /* 舊規則（D74 出席三堂）：只給「這學期在改規則以前就開始」的舊存檔當保底（ATTEND-ROLLCALL-1102）*/
  /* ATTEND-ROLLCALL-1102（使用者 2026-11-02「教授通常是隨機點名 一年只點名幾次」→「改成隨機點名日」；AA_574 末節）：
     看出席的課每學期 4 個點名週（第 2～7、10～15 週；照存檔種子 examSeed，每門課不一樣，玩家事先看不到）；只有點名日記到／缺；
     點名缺 3 次以上（只到 0～1 次）不及格。到沒到從 R.done（上過的那一堂）算，所以自動上課、跳過時間補上的課都算；遲到算缺（R.abs）。
     R.rollSince＝開始用這個規則的那一天：在那之前就開始的學期，出席 ≥3（舊規則）照樣及格，舊存檔不會突然被當 */
  S.ROLL_N=4; S.ROLL_FAIL=3; S.ROLL_WEEKS=[2,3,4,5,6,7,10,11,12,13,14,15];
  const hashS=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
  S.rollWeeks=function(G,c,termId){ if(!c||!S.attCourse(c)) return []; const R=G?S.rec(G):null, key=termId+':'+c.id; if(R&&R.roll&&Array.isArray(R.roll[key])) return R.roll[key].slice();
    if(G&&G.flags&&G.flags.examSeed==null) G.flags.examSeed=Math.floor(Math.random()*1e9);   /* BUG-ROLLCALL-SEED0-1102（BB 09:45，CC M3）：新遊戲 9/1 就抽點名週，原本 examSeed 要到 12/15 第一次考試才產生＝種子 0、每個玩家大一上點名週都一樣。已經抽好存起來的（R.roll）照舊 */
    const F=G&&G.flags||{}; const seed=(F.examSeed!=null?F.examSeed:0)+'|roll|'+termId+'|'+c.id;
    const met=new Set(); let fw=null; if(G&&typeof CALENDAR!=='undefined') for(let d=-600;d<2400;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==termId) continue; if(t.exam==='final') fw=fw==null?t.week:Math.min(fw,t.week); if(S.dayItems(Object.assign({},G,{day:d}),d).some(it=>it.c.id===c.id)) met.add(t.week); }   /* fw＝期末考週（大四下 15 週＝第 15 週，BUG-ROLLCALL-Y4S2W15-1102）*/   /* 那門課這學期真的有上的週（開學前、放假、只有某幾週的課都排除）*/
    const cand=S.ROLL_WEEKS.filter(w=>(fw==null||w<fw)&&(!c.weeks||c.weeks.includes(w))&&(!met.size||met.has(w))); const a=cand.slice(); let h=hashS(seed);
    for(let i=a.length-1;i>0;i--){ h=Math.imul(h^(h>>>13),0x5bd1e995)>>>0; const j=h%(i+1); const x=a[i]; a[i]=a[j]; a[j]=x; }
    const W=a.slice(0,S.ROLL_N).sort((x,y)=>x-y); if(R&&met.size&&W.length){ if(!R.roll||typeof R.roll!=='object') R.roll={}; R.roll[key]=W.slice(); } return W; };   /* 抽好就存進存檔（G.courses.roll），之後照存的 */
  S.rollStat=function(G,c,termId,upToDay){ const R=S.rec(G), W=S.rollWeeks(G,c,termId), hit=new Set();
    for(const k in R.done){ const p=k.split(':'); if(p.length<3||p[1]!==c.id||R.abs[k]) continue; const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(+p[0]):null; if(t&&t.id===termId&&W.includes(t.week)) hit.add(t.week); }
    let past=W; if(upToDay!=null&&typeof CALENDAR!=='undefined'){ const tw=(CALENDAR.termOf(upToDay)||{});
      /* BUG-ROLLCALL-CURWEEK-1102（BB 07:01）：這一週的點名，要那一堂已經去了、或下課時間已經過了才算（週一早上不能把週二還沒上的課算成缺）*/
      const over=w=>{ if(hit.has(w)) return true; for(let d=upToDay-7;d<=upToDay;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==termId||t.week!==w) continue; for(const it of S.dayItems(Object.assign({},G,{day:d}),d)){ if(it.c.id!==c.id) continue; if(d<upToDay||(d===G.day&&(G.hour||0)>=it.t1)) return true; } } return false; };
      if(tw.id===termId) past=W.filter(w=>w<tw.week||(w===tw.week&&over(w))); else { const d0=S.termStartDay(termId); past=d0!=null&&upToDay<d0?[]:W; } }   /* 學期還沒開始＝一次都還沒點（BB-B 11-07 BUG-LAW830-ATTEND-CARRY-1107：8/30 進法律系，課表寫「缺 4 次」）；學期已經結束＝全部 */
    return {weeks:W,past:past.length,present:past.filter(w=>hit.has(w)).length,missed:past.filter(w=>!hit.has(w)).length}; };
  S.termStartDay=function(termId){ if(typeof CALENDAR==='undefined') return null; const T=(CALENDAR.TERMS||[]).find(x=>x.id===termId); if(T&&T.t0!=null&&CALENDAR.DAY) return Math.floor(T.t0/CALENDAR.DAY); for(let d=-500;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===termId) return d; } return null; };
  S.attPass=function(G,c,termId){ const R=S.rec(G); const st=S.rollStat(G,c,termId); if(st.missed<S.ROLL_FAIL) return true;
    const since=R.rollSince, t0=S.termStartDay(termId); return since!=null&&t0!=null&&t0<since&&(R.attend[c.id]||0)>=S.ATT_PASS; };
  S.attCourse=c=>!!c&&!S.isExamCourse(c)&&(c.kind==='general'||c.kind==='elective'||/^econ_principles_\d$/.test(c.id));
  /* 第一堂課老師說的規定（AA_418 第 1 節，企劃線 2e90719c／f4aab3d2）：那一學期第一次出席的那一堂、課堂開頭，一學期一次；重修的學期多一句；
     法律系的經濟學原理：演過經濟系那一年的玩家多一句旁白 */
  S.ATT_RULE=[[/^chinese_/,['這門課我會點名，不會事先講。','……可是我希望你們不是因為點名才來。']],   /* ATTEND-ROLLCALL-1102：AA 06:39 定稿（原本「三次就及格」）；第二句沒給新字的照舊 */
    [/^english_/,['我會隨機點名幾次，不會事先說。','點名我用英文點。聽到自己的名字要回答。']],
    [/^ge_/,['通識沒有考試。我會點名，次數不多。','……來了就聽一下。不聽也不要睡太大聲。']],
    [/^pe_/,['體育會點名。不會每次點。','鞋子穿對，不要受傷。受傷的不算請假，算我的麻煩。']],
    [/^japanese_/,['この授業は、ときどき出席を取ります。','……聽不懂的話：我會突然點名。']],
    [/^econ_principles_\d$/,['法律系的經濟學原理會點名，不會事先講。','……我知道你們是被規定來的。我盡量講得有趣。']]];
  S.attRuleLines=function(G,c){ const row=S.ATT_RULE.find(r=>r[0].test(c.id)); if(!row) return []; const out=row[1].map(t=>['老師',t]);
    if(c.rt) out.push(['老師','重修的同學，這學期一樣會點名。']); return out; };   /* AA_578 第 5 節定稿（原本暫定「重修的同學，這學期重新算三次。」）*/
  S.noExam=c=>!!c&&typeof EXAM_BANK!=='undefined'&&!!EXAM_BANK.courseMap[c.id]&&EXAM_BANK.courseMap[c.id].exam==='none';
  /* BUG-EXAMDAY-MEMO-1102（BB 08:58，CC N1）：快取按存檔分（WeakMap 以 G 為鍵：讀另一份存檔＝另一個 G）；鍵含這門課的時段（重修換了時段）、選修、這學期的重修。讀檔、開新遊戲另外呼叫 S.resetExamMemo() */
  let examDayMemo=new WeakMap();
  S.resetExamMemo=()=>{ examDayMemo=new WeakMap(); };
  /* 這門課這個考試的日子：考試週裡那門課第一堂不是假日的課；都放假（例：大一上民法總則 12/25、1/1）＝放假那一堂之後，第二週第一個同一時段空著的平日（1/2 週五下午一）*/
  S.examDay=function(G,c,termId,kind){ if(typeof CALENDAR==='undefined') return null; const el=JSON.stringify((G.courses&&G.courses.electives)||{}), rt=JSON.stringify((G.courses&&G.courses.retake)||[]); const mk=c.id+'|'+termId+'|'+kind+'|'+JSON.stringify(c.slots||[])+'|'+el+'|'+rt; let memo=G&&typeof G==='object'?examDayMemo.get(G):null; if(!memo&&G&&typeof G==='object'){ memo={}; examDayMemo.set(G,memo); } if(memo&&(mk in memo)) return memo[mk];
    const wk=S.EXAM_WEEKS[kind]||[]; const days=[]; let d0=null; for(let d=(/^Y0/.test(termId)?-420:1);d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===termId){ if(d0==null) d0=d; if(kind==='final'?t.exam==='final':wk.includes(t.week)) days.push(d); }   /* BUG-Y4S2-NOFINAL-1102（BB_218 6879）：期末週＝這學期最後一週（日曆的 exam==='final'）；原本寫死第 16 週，大四下只有 15 週＝沒有期末考日＝考五題的課全部算缺考、6/18 延畢 */ else if(d0!=null&&d>d0+200) break; }
    let res=null, lastMiss=null;
    for(const d of days){ const wd=CALENDAR.dateOf(d).wd; const s0=c.slots.find(s=>s.wd===wd); if(!s0) continue; if(CALENDAR.holiday(d)){ lastMiss=d; continue; } res={day:d,block:s0.block}; break; }
    /* 補排的考試不能和別科的考試同一天同一節（BB 09:01）：排在這門課前面（termCourses 的順序）的考五題課，它們的考試日先算、這門課讓開（只看前面的，不會互相遞迴）*/
    const taken=new Set(); if(kind==='final'&&S.isExamCourse(c)){ for(const x of S.termCourses(G,termId)){ if(x===c||x.id===c.id) break; if(!S.isExamCourse(x)) continue; const dx=S.examDay(G,x,termId,kind); if(dx) taken.add(dx.day+'|'+dx.block); } }
    const free=(d,b)=>!taken.has(d+'|'+b);
    if(!res&&lastMiss!=null){ const busy=(d,b)=>!free(d,b)||S.termCourses(G,termId).some(x=>x!==c&&x.slots.some(s=>s.wd===CALENDAR.dateOf(d).wd&&s.block===b));
      const lw=days.length?Math.max(...days.map(d=>CALENDAR.termOf(d).week)):null; const lastWeek=days.filter(d=>CALENDAR.termOf(d).week===lw); const cand=lastWeek.filter(d=>d>lastMiss).concat(lastWeek.filter(d=>d<=lastMiss));
      for(const d of cand){ const wd=CALENDAR.dateOf(d).wd; if(wd>5||CALENDAR.holiday(d)) continue; for(const s of c.slots){ if(!busy(d,s.block)){ res={day:d,block:s.block,makeup:true}; break; } } if(res) break; } }
    /* BUG-RETAKE-NOEXAM-1102（BB 08:58，CC N1）：同一節都排不到（例：重修排在週五下午二、期末週週五 12/25 放假、週一～四同一節都有課）＝原本 null → 判缺考、一直重修。
       考五題的課一定要有期末考日：① 期末週任何一天（平日、不放假）任何一節空堂 ② 還是沒有＝期末週不放假的平日裡第一個「不是別科考試」的那一節（先試這門課自己那一節；和一般上課撞也照考，和考試撞就換下一個，BB 09:01）。
       不排到期末週之後：學期結束（CALENDAR.termOf＝null）的日子 dayItems 不會出考試，排了也考不到 */
    if(!res&&kind==='final'&&S.isExamCourse(c)&&days.length){ const busy=(d,b)=>!free(d,b)||S.termCourses(G,termId).some(x=>x!==c&&x.slots.some(s=>s.wd===CALENDAR.dateOf(d).wd&&s.block===b));
      const examAt=(d,b)=>!free(d,b)||S.termCourses(G,termId).some(x=>x!==c&&x.id!==c.id&&S.isExamCourse(x)&&x.slots.some(s=>s.wd===CALENDAR.dateOf(d).wd&&s.block===b));   /* 那一節是別科的考試（第二步撞一般上課可以，撞考試不行，BB 09:01）*/
      const lw=Math.max(...days.map(d=>CALENDAR.termOf(d).week)), wkDays=days.filter(d=>CALENDAR.termOf(d).week===lw&&CALENDAR.dateOf(d).wd<=5&&!CALENDAR.holiday(d)), blocks=Object.keys(COURSES.blocks||{});
      for(const d of wkDays){ for(const b of blocks){ if(!busy(d,b)){ res={day:d,block:b,makeup:true}; break; } } if(res) break; }
      if(!res) for(const d of wkDays){ const own=(c.slots[0]||{}).block||blocks[0]; for(const b of [own].concat(blocks.filter(x=>x!==own))){ if(!examAt(d,b)){ res={day:d,block:b,makeup:true}; break; } } if(res) break; } }
    if(memo) memo[mk]=res; return res; };
  /* 考試時段（D14-T3）：這學期考五題的法律課的期中、期末考在哪一天哪一節（S.examDay）；手機「課表」列出來，約人、約會都避開（invites3d.js 的 free、date3d.js 的 DATE.check）*/
  S.examList=function(G,termId){ if(!termId) return []; const out=[]; for(const c of S.termCourses(G,termId)){ if(!S.isExamCourse(c)) continue; for(const kind of ['final'])   /* D118：沒有期中考 */{ const d=S.examDay(G,c,termId,kind); if(d){ const b=B(d.block)||{}; out.push({c,kind,day:d.day,block:d.block,t0:b.t0,t1:b.t1,makeup:!!d.makeup}); } } }
    return out.sort((a,b)=>a.day-b.day||a.t0-b.t0); };
  S.examAt=function(G,day,h0,h1){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(day):null; if(!t||!t.exam) return null; return S.examList(G,t.id).find(e=>e.day===day&&e.t0<h1&&e.t1>h0)||null; };
  S.examQuestions=function(courseId,termId){ const out=[]; if(typeof EXAM_BANK!=='undefined') for(const q of EXAM_BANK.questions) if(q.course===courseId&&q.term===termId) out.push(q);
    if(courseId==='crimpro'&&termId==='Y3S1'&&typeof QBANK!=='undefined') for(const q of QBANK) if(q.complete!==false) out.push(Object.assign({},q,{course:'crimpro',term:'Y3S1',status:'USER_CONFIRMED'}));   /* 刑訴：使用者的 QBANK（沒有週次＝全部）*/
    return out; };
  const okStatus=(q,termId)=>termId==='Y4S1'||termId==='Y4S2'?q.status==='Y4_CROSS_REVIEWED':(q.status==='USER_CONFIRMED'||q.status==='AI_CROSS_REVIEWED');   /* 大一～大三的 AI 補題（exam_ai，使用者 2026-10-16 授權、10-18「下一個版本就要放進去」）：只用來補到 5 題 */
  S.examPool=function(courseId,termId,kind){ const maxW=kind==='mid'?7:15;   /* 16 週制：期末考範圍到第 15 週（AA_198：原本第 16 週的題目範圍改到第 15 週）*/ const cls=[], bank=[], ai=[]; termId=S.rtTerm?S.rtTerm(courseId,termId):termId; { const rd=S.redoOf(courseId); if(rd){ courseId=rd.id; termId=rd.term; } }   /* 重修：原本那一學期的題庫 */
    for(const q of S.examQuestions(courseId,termId)){ if(!okStatus(q,termId)) continue; if(q.scopeWeek!=null&&+q.scopeWeek>maxW) continue; if(q.status==='AI_CROSS_REVIEWED'){ ai.push(q); continue; } const asked=(q.askedIn&&(q.askedIn.course||courseId)===courseId&&(!q.askedIn.term||q.askedIn.term===termId))||q.source==='CLASS_DISC'; (asked?cls:bank).push(q); }
    return {cls,bank,ai}; };   /* 抽題順序（exam_ai/README.md 第 3 節）：課堂題 → 使用者的正式題庫 → AI 題 */
  const hashStr=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
  const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const shuffled=(arr,r)=>{ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a; };
  /* 抽 5 題（同一份存檔、同一門課、同一學期、同一種考試＝同一份）；不足 5 題＝{ok:false,n} */
  S.drawExam=function(G,courseId,termId,kind){ const R=S.rec(G); R.exam=R.exam&&typeof R.exam==='object'?R.exam:{}; const key=termId+':'+courseId+':'+kind;
    const pool=S.examPool(courseId,termId,kind), n=pool.cls.length+pool.bank.length+pool.ai.length; if(n<5) return {ok:false,n,key};
    if(R.exam[key]&&Array.isArray(R.exam[key].qs)&&R.exam[key].qs.length===5){ const all=pool.cls.concat(pool.bank,pool.ai); const qs=R.exam[key].qs.map(id=>all.find(q=>q.id===id)).filter(Boolean); if(qs.length===5) return {ok:true,n,key,qs,saved:R.exam[key]}; }
    if(!G.flags) G.flags={}; if(G.flags.examSeed==null) G.flags.examSeed=Math.floor(Math.random()*1e9);   /* 這份存檔的亂數種子（存在存檔裡）*/
    const r=rng(hashStr(G.flags.examSeed+'|'+key)); const cls=shuffled(pool.cls,r), bank=shuffled(pool.bank,r), ai=shuffled(pool.ai,r); let pick=[];   /* ai 最後洗：沒有 AI 題的課抽到的和以前一樣 */
    pick=cls.slice(0,5); for(const q of bank.concat(ai)){ if(pick.length>=5) break; pick.push(q); }   /* 課堂題（課堂提問、討論課）優先，不夠才從題庫補（AA_126 1-5 方案一定案，2026-10-15：拿掉 3_2）*/
    /* 期末不排除期中用過的題，除非排除以後仍有 5 題以上 */
    if(kind==='final'){ const used=new Set(((R.exam[termId+':'+courseId+':mid']||{}).qs)||[]); if(used.size){ const fresh=cls.concat(bank,ai).filter(q=>!used.has(q.id)); if(fresh.length>=5){ const fc=cls.filter(q=>!used.has(q.id)), fb=bank.filter(q=>!used.has(q.id)), fa=ai.filter(q=>!used.has(q.id)); pick=fc.slice(0,5); for(const q of fc.slice(3).concat(fb,fa)) { if(pick.length>=5) break; if(!pick.includes(q)) pick.push(q); } } } }
    /* D118 大四下補考（kind 'makeup'）：和期末同一份範圍（examPool 第 15 週以前），但先抽期末沒考過的題（照課堂→題庫→AI 的順序）；
       亂數種子照 key（'學期:課:makeup'）和期末不同。期末沒考過的不到 5 題才用期末考過的補（題庫只有 5 題的課＝和期末同一份，沒辦法，只能這樣）；
       題庫 6 題以上＝補考一定至少有一題和期末不同 */
    if(kind==='makeup'){ const used=new Set(((R.exam[termId+':'+courseId+':final']||{}).qs)||[]); if(used.size){ const all=cls.concat(bank,ai), fresh=all.filter(q=>!used.has(q.id)), old=all.filter(q=>used.has(q.id)); pick=fresh.slice(0,5); for(const q of old){ if(pick.length>=5) break; pick.push(q); } } }
    pick=pick.slice(0,5); R.exam[key]={qs:pick.map(q=>q.id)}; return {ok:true,n,key,qs:pick}; };
  /* 課堂提問（AA_130 第 3 節第 3 點，BB 提議、AA 同意）：syllabus 那一週的 ask:{qid} 指到 EXAM_BANK 的使用者題目（題幹、選項、答案、考點照題庫，一字不改）。
     那堂課的最後（A：教授那句之後；B：討論收尾之後；C：點名收尾之後）——黑板角落一題 → 玩家選 → 「答案是（X）。」→ 有使用者給的考點或解析才顯示 →
     這學期第一次課堂提問時教授說「期末考，會考這樣的題目。」。不計分、不影響成績；沒去上課就不演（期末考照樣算課堂題）。第二格的短片段不問。
     題目是使用者給的、AA 逐題對過那一週的主題，所以不看 SYLLABUS.reviewed（那是 BB 寫的課堂內容的審查）。玩家選的記在 R.ask['學期:題號']（舊存檔從空的開始）*/
  /* 讀書的主題照科目（AA_134 第 1 節，使用者 2026-10-15「讀憲法為什麼會出現強行規定無效」）：選了科目 X → 從 X 的課表取這一週以前教過、還沒讀過的最早一週；
     審查過的那一週：標題＝黑板第一行、內容＝黑板第二三行；還沒審查的週：只寫主題（法律審查，AA_122 第 0a 節）。筆記 id＝<課程>_w<週>。都讀過＝null */
  S.studyTopic=function(G,c,has){ attachSyllabus(); if(!c||typeof CALENDAR==='undefined') return null; const t=CALENDAR.termOf(G.day); const wk=t&&t.id===c.term?t.week:99;
    const weeks=(c.syllabus||[]).filter(w=>w.w<=wk&&LISTED.includes(w.w)).sort((a,b)=>a.w-b.w);
    for(const w of weeks){ const id=c.id+'_w'+w.w; if(has(id)) continue; const rv=S.sylReviewed(c,w.w)&&w.board&&w.board[0]; const title=rv?w.board[0]:c.name+'：'+(S.topic(c,w.w)||'第 '+w.w+' 週'); const body=rv?[w.board[1],w.board[2]].filter(Boolean).join('　')+(w.line?'　'+S.profName(c)+'：'+w.line:''):'';   /* D118-B2（D118_PLAN ②-7）：筆記收黑板三行（標題＝第一行）＋教授那一句 */
      if(typeof STUDY!=='undefined'){ try{ const u=STUDY.weekUnit(c,w.w); if(u) STUDY.mark(G,u.id,'read','study'); }catch(e){ console.warn('STUDY.mark',e); } }   /* D118-B2：自習讀到這一週＝那張觀念卡讀過（呼叫端一定把這份筆記收進去：game3d.js studySession）*/
      return {id,title,body,read:'你把〈'+title+'〉的筆記整理了一遍。'}; }
    return null; };
  S.askOf=function(it,qidIn){ attachSyllabus(); const c=it.c; if(!c.syllabus||typeof EXAM_BANK==='undefined') return null; const sy=c.syllabus.find(q=>q.w===it.week); const qid=qidIn||(sy&&sy.ask&&sy.ask.qid); if(!qid) return null;
    return EXAM_BANK.questions.find(q=>q.id===qid&&q.course===c.id&&q.term===it.term&&q.status==='USER_CONFIRMED')||null; };
  S.classAsk=async function(GM,it,prof,ct,qidIn){ const q=S.askOf(it,qidIn); if(!q) return false; const R=S.rec(GM.G), c=it.c, pre=prof?'':((ct&&ct.prof)||S.profName(c))+'：';
    const first=!Object.keys(R.ask).some(k=>k.startsWith(it.term+':'));
    await GM.say(null,'（下課前，教授在黑板角落寫了一題。）'); await GM.say(null,q.q);
    const opts=optList(q); const j=await GM.choose(opts.map(o=>({t:o.t}))); const v=(opts[j]||opts[0]).v; R.ask[it.term+':'+q.id]=v;
    { const ok=String(v)===String(q.answer), ans=q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）'+q.options[q.answer];   /* D118-B2（D118_PLAN ②-8）：課堂提問的答案之後可以回頭看——筆記記題目、答案、考點（題庫原文）；觀念卡：上過課，答對＝答對過 */
      if(GM.addNote) GM.addNote('ask_'+q.id,c.name+'・第 '+it.week+' 週課堂提問',q.q+'　答案：'+ans+(q.core?'　考點：'+q.core:'')+(q.explanation?'　'+q.explanation:''));
      if(typeof STUDY!=='undefined'){ try{ for(const u of STUDY.unitsOfQ(q.id)) STUDY.mark(GM.G,u.id,'heard','ask'); STUDY.answer(GM.G,q.id,ok,'ask'); }catch(e){ console.warn('STUDY.answer',e); } } }
    await GM.say(null,'答案是'+(q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）')+'。'+(q.core?'考點：'+q.core+(/[。！？]$/.test(q.core)?'':'。'):'')+(q.explanation||''));
    if(first) await GM.say(prof||null,pre+'期末考，會考這樣的題目。');
    { const F=GM.G.flags=GM.G.flags||{}; if(!F.ASK_NOTE_HINT){ F.ASK_NOTE_HINT=GM.G.day; if(GM.toast) GM.toast(S.ASK_NOTE_HINT,4200); } }   /* 第一次答完課堂題：提示去哪裡看（BB 2026-11-11：紀錄在 ☰ 筆記本、不在手機，玩家不知道）；一個存檔一次 */
    return true; };
  S.ASK_NOTE_HINT='題目和答案記在 ☰ 筆記本的「筆記」頁，學習進度在「法律」頁。';
  S.scoreOf=k=>[0,60,70,80,90,100][Math.max(0,Math.min(5,k|0))];   /* 答對 0～5 題＝0、60、70、80、90、100（AA_126 1-2）；0 題＝被當（重修等使用者確認）*/
  const optList=q=>q.type==='tf'||!q.options?['對','錯'].map(t=>({t,v:t})):Object.keys(q.options).map(k=>({t:'（'+k+'）'+q.options[k],v:k}));
  /* 考試那一堂：五題答完才交卷；交卷後，答錯的題目顯示答案、考點、解析（有才顯示）。法條只有大四顯示：大一～大三的 basis／mapBasis 是 AA、BB 對週次時自己標的，
     不是使用者給的（AA 2026-10-14 17:4x；匯入時也不帶進來），大四是 AI 出題、使用者授權 */
  S.curExam=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['classes3d:curExam']=()=>{ S.curExam=null; };   /* 讀檔時清掉（考到一半讀檔：測試掛勾不留上一場）*/
  S.peWear=null; (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['classes3d:peWear']=()=>{ S.peWear=null; };   /* 讀檔時清掉（體育課換運動服，GYM-FIT-1107 ③）：上到一半讀檔，舊流程走不到 attend 的 finally；下一次 FIT.gymWearSync 照區域換回 */
  S.runExam=async function(GM,it){ const G=GM.G, R=S.rec(G), c=it.c, kind=it.exam, termId=it.term; const nm=it.examName||(kind==='mid'?'期中練習':'期末考');   /* it.examName：大四下補考（faildelay3d.js 的 FD.MK_LINES.examName）*/
    const r=S.drawExam(G,c.id,termId,kind);
    if(!r.ok){ console.error('EXAM_BANK_INSUFFICIENT',c.id,r.n); R.exam=R.exam||{}; R.exam[r.key]={status:'insufficient',n:r.n};
      /* BB 09:45 P3：補考（題庫不夠）說「這次不舉行」，不說「這學期不舉行期末考」*/
      await GM.say(null,'這一科的'+nm+'題庫還沒準備好（題目 '+r.n+'／5）。'+(kind==='mid'||kind==='makeup'?'這次不舉行。':'這學期不舉行期末考。')); return {held:false,n:r.n}; }
    S.curExam={cid:c.id,kind,term:termId,i:0,qid:null};   /* 測試用掛勾（BB_229 第 7 條，BB 17:52）：現在考哪一門、第幾題；考完＝null。不影響遊戲 */
    const ans=[]; let k=0;
    try{
    if(!it.skipIntro) await GM.say(null,'考卷發下來。'+c.name+nm+(kind==='mid'?'（不算成績）':'')+'。五題。');   /* skipIntro：補考（陳助教已經說「考卷發下去了。一樣五題」，BB 10:24）*/
    let recall=(kind==='final'||kind==='makeup')&&S.hasBook(G,c)?1:0;   /* 補考同期末 */   /* 有那一科的教科書：期末考多一次想起答案（D102）——第一次選錯，那個選項拿掉、旁白一句（AA 2026-10-21 20:23）、再選一次 */
    for(let i=0;i<5;i++){ const q=r.qs[i]; S.curExam.i=i+1; S.curExam.qid=q.id; if(typeof STUDY!=='undefined'&&STUDY.cueFor){ let cue=null; try{ cue=STUDY.cueFor(G,q); }catch(e){ console.warn('STUDY.cueFor',e); } if(cue) await GM.say(null,cue); }   /* D118-B4：讀過那張卡＝想起筆記上的一行（不影響計分）*/
      await GM.say(null,(i+1)+'／5　'+q.q); let opts=optList(q); const j=await GM.choose(opts.map(o=>({t:o.t}))); let v=(opts[j]||opts[0]).v;
      if(recall&&String(v)!==String(q.answer)&&opts.length>2){ recall=0; R.examRecall=R.examRecall||{}; R.examRecall[r.key]=(i+1); opts=opts.filter((o,x)=>x!==j); await GM.say(null,'（你想起課本上那一段。旁邊還有你自己畫的線。）'); await GM.say(null,(i+1)+'／5　'+q.q); const j2=await GM.choose(opts.map(o=>({t:o.t}))); v=(opts[j2]||opts[0]).v; }
      ans.push(v); if(String(v)===String(q.answer)) k++; }
    } finally { S.curExam=null; }
    const score=S.scoreOf(k); R.exam[r.key]=Object.assign({},R.exam[r.key]||{},{qs:r.qs.map(q=>q.id),ans,correct:k,score,status:'done'});
    if(typeof STUDY!=='undefined'){ try{ r.qs.forEach((q,i)=>STUDY.answer(G,q.id,String(ans[i])===String(q.answer),'exam')); }catch(e){ console.warn('STUDY.answer',e); } }   /* D118-B2：答對＝那張觀念卡答對過；答錯只記進 miss（不扣任何東西）*/
    await GM.say(null,'交卷。答對 '+k+'／5'+(kind==='final'||kind==='makeup'?'，'+score+' 分。':'。'));
    const wrong=[]; for(let i=0;i<5;i++){ const q=r.qs[i]; if(String(ans[i])===String(q.answer)) continue; const a=q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）'+q.options[q.answer]; wrong.push({n:i+1,q,a});
      await GM.say(null,'第 '+(i+1)+' 題的答案：'+a+(q.core?'。考點：'+q.core:'')+(q.explanation?'。'+q.explanation:'')+(q.basis&&q.status==='Y4_CROSS_REVIEWED'?'（'+q.basis+'）':'')); }
    if(typeof STUDY!=='undefined'&&STUDY.fixNote){ try{ STUDY.fixNote(GM,c,r.key,wrong); }catch(e){ console.warn('STUDY.fixNote',e); } }   /* D118-B4：考後訂正筆記 */
    return {held:true,correct:k,score}; };
  /* ?dev 的除錯面板：這學期考五題的課裡，期末考正式題目不到 5 題（不開考）的課（AA_130 第 3 節第 4 點；玩家版不顯示）*/
  S.examShort=function(G,termId){ if(!termId){ const t=typeof CALENDAR!=='undefined'&&G?CALENDAR.termOf(G.day):null; termId=t&&t.id; } if(!termId) return [];
    return S.termCourses(G,termId).filter(S.isExamCourse).map(c=>{ const p=S.examPool(c.id,termId,'final'); return {id:c.id,name:c.name,n:p.cls.length+p.bank.length+p.ai.length}; }).filter(e=>e.n<5); };
  // ---------- 學期結束的成績單（AA_104 第 5、10 節：文字，不顯示分數與排名，不會沒過）----------
  S.gradeOf=p=>p>=10?'很好':(p>=5?'不錯':'過了');
  S.reportFor=function(G,termId){ const R=S.rec(G); const g={}; for(const c of S.termCourses(G,termId)){ if(c.kind==='service') continue;
      if(S.isExamCourse(c)){ if(S.makeupPassed(R,termId,c.id)){ g[c.id]=(typeof FD!=='undefined'&&FD.MK_LINES&&FD.MK_LINES.gradePass)||'及格（補考）'; continue; }   /* D118 大四下補考過了 */ const e=(R.exam||{})[termId+':'+c.id+':final']; const p=S.examPool(c.id,termId,'final'); g[c.id]=e&&e.status==='done'?e.score+' 分':e&&e.status==='rescued'?'及格（期末考補登）':e&&e.status==='insufficient'?'未開考':(p.cls.length+p.bank.length+p.ai.length<5?'未開考':'缺考'); if(S.failedIn&&S.failedIn(G,termId).includes(c)) g[c.id]+=S.retakeTermAfter(G,termId)?'（不及格，下學期重修）':'（不及格）'; continue; }   /* D42 */   /* BB 退件 GRADE-NOBANK（10-21）：原本寫「未開考（題庫不足）」＝開發用語給玩家看到；而且沒考的課算題數時漏了 AI 補的題（抽題照課堂→使用者題目→AI 補到 5 題），憲法、民訴甲上被說成題庫不足——其實是缺考。題數不夠的原因只在 ?dev（CLS.examShort）*/   /* 未開考：不算不及格、不算進書卷獎、不擋畢業（AA_130 第 3-2 節第 4 點）*/
      if(S.attCourse(c)){ g[c.id]=S.attPass(G,c,termId)?'及格':('不及格'+(S.retakeTermAfter(G,termId)?'（下學期重修）':'')); continue; }   /* D43：出席三堂（舊存檔已經發過的成績單照舊：R.grades 已經存了就不重算）*/
      g[c.id]=S.noExam(c)?'通過':'及格'; } return g; };   /* D118-B1：剩下的課（法律專題研究、法律實習＝通過；經濟系那一年的必修＝及格）不照讀書次數（原本 S.gradeOf(R.prep)）*/   /* 服務學習只記次數，不進成績單（AA_110 6-1）*/
  // ---------- 選課結果（AA_104 第 2 節、AA_110 第 4 點）----------
  /* 新學期第一週的前一天早上，讓玩家選這學期的選修：同一組二選一；choice.none＝可以不修（大一下的法律與社會）。預設的那一門排第一。
     錯過前一天（開學頭兩週才第一次起床）就在那時候問；第三週以後才第一次起床（舊存檔）＝照預設，不再問。大一上沒有選課（遊戲從第 3 週開始，AA_103）。 */
  S.choiceGroups=function(termId){ const out={}; for(const c of COURSES.list){ if(c.term!==termId||!c.choice) continue; const g=out[c.choice.group]||(out[c.choice.group]={group:c.choice.group,def:c.choice.default,none:false,opts:[]}); g.opts.push(c); if(c.choice.none) g.none=true; } return Object.values(out); };
  S.slotText=c=>c.slots.map(s=>WD[s.wd]+(COURSES.blocks[s.block]||{}).label).join('、')+'・'+S.roomName(c);
  S.selectTerm=async function(GM,termId){ const G=GM.G, R=S.rec(G), gs=S.choiceGroups(termId); R.note['sel_'+termId]=1; if(!gs.length&&termId!=='Y1S2') return false;   /* 大一下：法律與社會（下）刪了（2026-10-14 課程調整）以後沒有選修，選課結果照樣播（通識那兩句，AA_130 第 2 節第 1 列）*/
    GM.sceneBegin(); try{ await GM.say(null,'選課結果出來了：'+S.termName(termId)+'。');
      /* 交接包 v2 第 3 節第 1 週（AA_104）：大一下接 v1 的選課結果——v1 選加簽的、選「下學期再選」的（或沒遇到的）各一句，通識選上「天文與我們」*/
      /* AA_605 第 3 列（BUG-GE-NOT-SELECTED-1103）：大一下不再說「城市與散步備取三」「選上天文與我們」，只留「選課結果出來了」和真的選單 */
      for(const g of gs){ const opts=g.opts.map(c=>({t:c.name,hint:S.slotText(c),id:c.id})); if(g.none) opts.push({t:'這學期不修'+(g.opts.length===1?g.opts[0].name:''),hint:'那個時段沒有課',id:'none'});
        opts.sort((a,b)=>(b.id===g.def)-(a.id===g.def));
        await GM.say(null,g.none&&g.opts.length===1?g.opts[0].name+'要修嗎？':g.opts.map(c=>c.name).join('、')+'，選一門。');
        const i=await GM.choose(opts.map(o=>({t:o.t,hint:o.hint}))); R.electives[g.group]=(opts[i]||opts[0]).id; }
      await GM.say(null,'這學期的課表在手機的「課表」。'); } finally { GM.sceneEnd(); }
    return true; };
  /* 發成績單（文字；服務學習只寫次數，AA_110 6-1）：opts.inScene＝在別的場景裡（例如可昕的視訊）接著顯示 */
  S.showGrades=async function(GM,termId,opts){ opts=opts||{}; const G=GM.G, R=S.rec(G); let rts=[]; if(!R.grades[termId]){ R.grades[termId]=S.reportFor(G,termId); if((G.stage||'law')==='law'&&S.LAW_TERMS.includes(termId)) rts=S.planRetakes(G,termId); }   /* D42：成績單發的那一刻排重修 */
    const lines=S.termCourses(G,termId).map(c=>c.name+'：'+(c.kind==='service'?(R.attend[c.id]||0)+'／'+(c.weeks||[]).length+' 次':R.grades[termId][c.id]));
    if(R.leMoved){ const le=S.byId('legal_english'); if(le){ if(termId==='Y2S2'&&!R.leMoved.took){ const i=lines.findIndex(t=>t.indexOf(le.name+'：')===0); const txt=le.name+'：未修（2026-10-14 課程調整）'; if(i>=0) lines[i]=txt; else lines.push(txt); }
      if(termId==='Y4S2'&&R.leMoved.took) lines.push(le.name+'：已修'); } }   /* 舊存檔（AA_130 第 4 節）：已經過了大二下＝不補修；大四下上過＝照「已修」 */
    if(typeof HONOR!=='undefined'&&HONOR.won&&(G.stage||'law')==='law'&&HONOR.won(G,termId)) lines.push('書卷獎');   /* D44：法律科平均答對 4 題（src/honor3d.js）*/
    if(!opts.inScene) GM.sceneBegin(); try{ await GM.say(null,S.termName(termId)+'的成績出來了。'); await GM.say(null,lines.join('　')); for(const r of rts){ const c=S.byId(r.id); if(c) await GM.say(null,'重修：'+c.name+'，'+S.termName(r.term)+'，'+r.slots.map(s=>WD[s.wd]+(COURSES.blocks[s.block]||{}).label).join('、')+(r.alt?'（原本的時段衝堂，排另一位老師的班）':'（原本的時段）')+'。'); } } finally { if(!opts.inScene) GM.sceneEnd(); } return true; };
  /* 起床時呼叫：前一個學期剛結束（今天不在那個學期、成績還沒發）→ 發成績單；新學期的前一天（或開學頭兩週）→ 選課結果 */
  S.morning=async function(GM){ const G=GM.G, R=S.rec(G); const now=CALENDAR.termOf(G.day);
    /* 成績照公布日發（16 週制，AA_197 1-6、AA_198 第 2 節第 3 點）：剛結束的那個學期，公布日（放假後第 3 個週一）那天早上起；放假太久才醒來的（公布日後 45 天以上）不補 */
    const prev=(()=>{ let best=null; for(const T of CALENDAR.TERMS){ const r=CALENDAR.termDays(T.id); if(r&&r.to<G.day&&(!best||r.to>best.to)) best={id:T.id,to:r.to}; } return best; })(), gd=prev?CALENDAR.gradeDay(prev.id):null;
    if(prev&&gd!=null&&G.day>=gd&&G.day<=gd+45&&!R.grades[prev.id]){
      const hold=typeof STORY!=='undefined'&&STORY.holdGrades?await STORY.holdGrades(GM,prev.id):false;   /* 可昕的約定（BB_95 9-8）：等晚上一起打開 */
      if(!hold) await S.showGrades(GM,prev.id); }
    if(R.note.gradesDue&&!R.grades[R.note.gradesDue]){ const t=R.note.gradesDue; delete R.note.gradesDue; await S.showGrades(GM,t); }   /* 先等的成績單、那晚沒有一起打開：隔天早上照常發 */
    const tmr=CALENDAR.termOf(G.day+1), selT=tmr&&tmr.week===1&&(!now||now.id!==tmr.id)?tmr:(now&&now.week<=2?now:null);
    const skipT=id=>!!id&&S.termAway(G,id);   /* 人在國外的學期（日本路線的大三下 AA_341 J-S6、JP-H；美國路線的大四上 BUG-US-Y4S1-SELECT-1102，BB 11:20）：不選課、不跳「開學了」、期中期末的提示 */
    if(selT&&skipT(selT.id)) R.note['sel_'+selT.id]=1;
    if(selT&&!R.note['sel_'+selT.id]) await S.selectTerm(GM,selT.id);
    else if(now&&!R.note['sel_'+now.id]) R.note['sel_'+now.id]=1;
    if(now&&!skipT(now.id)&&now.week===1&&CALENDAR.dateOf(G.day).wd===1&&R.note.termStart!==now.id){ R.note.termStart=now.id; GM.toast(S.termName(now.id)+'開學了。手機的「課表」可以看這學期的課。',4800); }
    if(now&&!skipT(now.id)&&now.exam==='final'&&R.note['exam_'+now.id+'_'+now.exam]!==1){ R.note['exam_'+now.id+'_'+now.exam]=1; GM.toast(now.exam==='mid'?'期中考週開始了。這兩週的課都是考試。':'期末考週開始了。這週的課都是考試。',4800); } };   /* 16 週制：期末只有第 16 週 */
  // ---------- 每 0.5 秒（story3d.js 的 S.tick）：上課前 30 分鐘的提醒、目標更新、教室裡的同學 ----------
  let lastT=null, lastRoomT=null;
  S.tick=function(GM){ const G=GM.G; if(!G||!G.flags) return; const R=S.rec(G), h=hr(G);
    if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.rainLock) ACTIVITIES.rainLock(G);   /* 下雨的備案（系籃練球）：17:30 一到照那時的天氣定整場（BBALL-RAIN-1030）*/
    if(!(typeof PG!=='undefined'&&PG.on&&PG.on(G))) for(const it of S.dayItems(G)){ if(S.storyClass(G,it)) continue; const k='rem_'+it.key; if(R.note[k]) continue; if(h>=it.t0-WIN0&&h<it.t0&&!R.done[it.key]){ R.note[k]=1; if((!GM.S||GM.S.classRemind!==false)&&!R.note['plan_skip_'+it.key]) GM.toast('30 分鐘後上課：'+S.itemText(it),4200); } }
    const sig=G.day+':'+Math.floor(h*4); if(sig!==lastT){ lastT=sig; S.skipNotes(GM); S.refreshGoal(GM); }
    { const sg=G.day+':'+Math.floor(h*30); if(sg!==lastRoomT){ lastRoomT=sg; if(G.zone==='classroom'||roomy(GM.E.zone)) S.syncRoom(GM); } }   /* 教室的人每 2 遊戲分鐘排一次（陸續進來）；其他照舊每 15 分鐘 */
    S.figTick(GM); S.updateHUD(GM); S.oneTick(GM); };
  /* 霖澤館 201：上課時間座位上有同學（背景人物，坐著）；下課後離開。教授由 story3d.js 的作息（schedFor → CLS.profWhere）處理 */
  /* 建築裡的教室（共同教學館…）：正在上課的每一間坐一半左右的同學（位子照課程與日期固定：出去再進來是同一批人）；下課的那一間的人離開 */
  /* 建築裡的教室（共同、博雅…）：上課的時候坐一部分同學；演講、活動（src/data/activities.js，有 zone、room 的）開始前 15 分鐘到結束也一樣（人數照活動的 crowd.n）*/
  /* 下課：同學站起來、從教室門走到建築出口（走到了、不在畫面上才移除，crowd3d.js 的 sweep）；時間突然跳了（跳過時間、讀檔、快速前往、剛進區域）就直接移除 */
  let lastSync=null;
  /* 玩家自己坐著上完課、聽完演講（快轉到結束）：時間是「待在這裡過完的」，不是跳過去——下一次同步照一般的下課處理，同學站起來走出去（不是在黑畫面裡一起消失）*/
  const keepCrowd=G=>{ lastSync={zone:G.zone,h:G.hour}; if(typeof CROWD!=='undefined'&&CROWD.keep) CROWD.keep(G); };   /* crowd3d.js 自己也記時間（校園門口的人群、走出去的同學 n.crowd）：兩邊都要知道 */
  function walkOut(GM,n){ const E=GM.E, ex=S.entryPoint(E); if(!ex||typeof CROWD==='undefined'||!CROWD.seatSide) return false; const st=n.seat, ap=st&&CROWD.seatSide(E,st); if(!ap) return false; const lv=st.lv|0;   /* 教學館＝大門；霖澤館 201、GLB 教室（沒有 layout）＝教室的門（CROWD-CLASS-ARRIVE-1027，原本直接拿掉）*/
    n.obj.position.set(ap[0],E.heightAt(ap[0],ap[1],lv),ap[1]); n.lv=lv; n.seat=null; n.clsStudent=false; n.frozen=false; n.pose='walk'; n.idlePose='idle'; n.leaving=true; n.arrived=false; n.crowd='cls';
    return E.moveTo(n,ex.x,ex.z,()=>{ n.arrived=true; },ex.lv|0); }
  // ---------- 遠處座位的替身（LAWWW2 167fc2d：assets/models/env/second_ai/seated_figures.glb）----------
  /* 使用者 2026-10-13（經 LAWWW2 轉達）：「101 要有遠處座位的低成本坐姿人物、近處少量 NPC；不要先做 400 個完整 3D NPC」。
     大的階梯教室（40 個位子以上）上課、演講時：完整人物照舊最多 16 個，其餘要坐的位子用替身——路人底模 4 種×聽講／抄筆記／滑手機×2 配色；
     每種外型一個 InstancedMesh；離玩家 7 m 內用 LOD0（約 1,500 個三角形）、更遠用 LOD1（約 350）。替身的原點＝座位地面中心、+z 朝講台（和座位 yaw 同一個方向）。
     替身坐的位子標 taken（玩家、其他人不坐）。下課：整組在畫面外才拿掉（不在玩家眼前消失）；換區域、時間跳過直接拿掉。不是有名字的人，不能對話 */
  const FIG={on:new Map(),zone:null}, FIG_KEY='prop.seated_figures', PROP_KEY='prop.desk_props';
  /* 桌上小物（LAWWW2 desk_props.glb，VISUAL_REVIEW（second_ai）第 27 節）：每個替身面前一組，和替身同一個矩陣（原點＝座位地面中心，東西在桌面 0.75 m 上）；
     照替身的姿勢配：抄筆記 lset_write（攤開的筆記本、右手的筆）、滑手機 lset_phone（兩手中間的手機＋桌上闔起的筆記本）、聽講 lset_laptop／lset_book／lset_code 三選一（照位子固定）；
     遠近跟替身一樣（7 m 以外用 _lod1）。滑手機的人不配有手機的組（一個人兩支手機）。載入失敗：替身照放，桌上沒有東西 */
  const LISTEN_SETS=['lset_laptop','lset_book','lset_code'];
  const deskSet=(nm,n)=>{ const pose=(String(nm).match(/_(listen|write|phone)_/)||[])[1]; return pose==='write'?'lset_write':(pose==='phone'?'lset_phone':(pose==='listen'?LISTEN_SETS[n%LISTEN_SETS.length]:null)); };
  S.deskSet=deskSet;   /* 測試用 */
  const figFree=(E,st)=>!st.taken&&!E.npcs.some(n=>(n.seat||n.seatTarget)&&Math.hypot((n.seat||n.seatTarget).x-st.x,(n.seat||n.seatTarget).z-st.z)<0.35)&&!(E.player&&E.player.seat&&Math.hypot(E.player.seat.x-st.x,E.player.seat.z-st.z)<0.35);
  S.figPlace=function(GM,key,seats){ const E=GM.E; if(typeof ASSETS==='undefined'||!ASSETS.manifest[FIG_KEY]||typeof THREE==='undefined'||!E.zone) return 0;
    if(FIG.zone!==E.zone){ FIG.on.clear(); FIG.zone=E.zone; } if(FIG.on.has(key)) return 0; seats=seats.filter(st=>figFree(E,st)); if(!seats.length) return 0;
    const rec={key,seats,group:null,leaving:false,zone:E.zone}; FIG.on.set(key,rec); for(const st of seats) st.taken=key;
    const propP=ASSETS.manifest[PROP_KEY]?ASSETS.loadOne(PROP_KEY).catch(e=>{ console.warn('desk_props（替身照樣放，桌上沒有東西）',e); return null; }):Promise.resolve(null);
    Promise.all([ASSETS.loadOne(FIG_KEY),propP]).then(([c,pc])=>{ if(FIG.on.get(key)!==rec||GM.E.zone!==rec.zone) return; const vars={}; c.scene.traverse(o=>{ if(o.isMesh&&/^fig_/.test(o.name)) vars[o.name]=o; });
      const props={}; if(pc&&pc.scene) pc.scene.traverse(o=>{ if(o.isMesh&&/^lset_/.test(o.name)) props[o.name]=o; });
      const names=Object.keys(vars).filter(n=>!/_lod1$/.test(n)).sort(); if(!names.length) return; let h=0; for(const ch of key) h=(h*31+ch.charCodeAt(0))>>>0;
      /* 遠近（BUG-03，使用者 10-15 第 17 項「博雅 101……披頭散髮很可怕」）：原本放的那一刻照玩家位置選 LOD0／_lod1、之後不換——玩家在門口時整班都是 _lod1，
         走到座位旁邊還是 350 個三角形的版本（臉糊、頭髮一塊塊）。改成每種外型（桌上小物也是）一個 LOD0、一個 _lod1 的 InstancedMesh，figTick（每 0.5 秒）照玩家現在的位置重排：
         7 m 內用 LOD0（離開到 7.5 m 才換回 _lod1、走近到 6.5 m 才換成 LOD0，不在邊界來回換）。放的那一刻和原本一樣（< 7 m＝LOD0）。名稱照舊：<外型>、<外型>_lod1、desk:<組>、desk:<組>_lod1 */
      const slots=rec.seats.map((st,i)=>{ const nm=names[(h+i*7)%names.length], set=deskSet(nm,h+i*13+Math.floor(i/3));   /* +floor(i/3)：替身的種類數是 3 的倍數時（LAWWW2-C 24923842：12 位×3 種姿勢），聽講的人剛好都落在 i 同餘 3 的位子，只用 h+i*13 會全部配到同一組（全是筆電）*/
        return {st,nm,set:set&&(props[set]||props[set+'_lod1'])?set:null,near:null}; });
      const g=new THREE.Group(); g.name='seated_figures:'+key; const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), ONE=new THREE.Vector3(1,1,1), V=new THREE.Vector3();
      const mk=(src,n,name)=>{ const im=new THREE.InstancedMesh(src.geometry,src.material,n); im.count=0; im.castShadow=false; im.receiveShadow=true; im.name=name; g.add(im); return im; };
      const cnt=new Map(); for(const s of slots){ cnt.set('f:'+s.nm,(cnt.get('f:'+s.nm)||0)+1); if(s.set) cnt.set('d:'+s.set,(cnt.get('d:'+s.set)||0)+1); }
      const ims={}; for(const [k,n] of cnt){ const src=k[0]==='f'?vars:props, pre=k[0]==='f'?'':'desk:', base=k.slice(2), a=src[base], b=src[base+'_lod1'];
        const near=a?mk(a,n,pre+base):null; ims[k]={near,far:b?mk(b,n,pre+base+'_lod1'):near}; }   /* 沒有 _lod1：遠的也用 LOD0；桌上小物沒有 LOD0：近的不放（和原本一樣）*/
      const put=(k,s)=>{ const r=ims[k], im=r&&(s.near?r.near:r.far); if(!im) return; Q.setFromAxisAngle(UP,s.st.yaw||0); V.set(s.st.x,s.st.y||0,s.st.z); M.compose(V,Q,ONE); im.setMatrixAt(im.count++,M); };
      rec.lay=(P,force)=>{ let ch=!!force; for(const s of slots){ const d=P?Math.hypot(s.st.x-P.x,s.st.z-P.z):1e9, nr=s.near==null?d<7:(s.near?d<7.5:d<6.5); if(nr!==s.near){ s.near=nr; ch=true; } } if(!ch) return false;
        for(const im of g.children) im.count=0; for(const s of slots){ put('f:'+s.nm,s); if(s.set) put('d:'+s.set,s); }
        for(const im of g.children){ im.visible=im.count>0; im.instanceMatrix.needsUpdate=true; im.computeBoundingSphere(); } return true; };   /* count 0 的不畫（不多一個 draw call）*/
      rec.lay(GM.E.player&&GM.E.player.obj.position,true);
      const LG=rec.zone.levelGroups, lg=LG&&LG[rec.seats[0].lv|0]; (lg&&lg.group||rec.zone.group||GM.E.scene).add(g); rec.group=g; }).catch(e=>{ console.warn('seated_figures',e); });   /* 放進那一層的群組：上下樓時跟著那一層顯示／隱藏 */
    return seats.length; };
  const figGone=rec=>{ if(rec.group&&rec.group.parent) rec.group.parent.remove(rec.group); for(const st of rec.seats) if(st.taken===rec.key) st.taken=null; FIG.on.delete(rec.key); };
  S.figRemove=function(GM,key,instant){ const rec=FIG.on.get(key); if(!rec) return; if(instant||!rec.group||GM.E.zone!==rec.zone) figGone(rec); else rec.leaving=true; };
  /* 替身的遠近（STANDIN-LOD-1104，BB-C 17:19「博思 101 的 17 個替身全部是 _lod1……把玩家移到替身中間，7 m 內也沒換」）：原本只在 figTick 換，figTick 在 S.tick 裡——
     S.tick 每 30 格才一次（SwiftShader 1～4 fps＝8～30 秒），而且在演、對話中、玩家 busy（上課坐著聽講）、睡覺時整段不跑（story3d.js 的 S.tick 開頭就 return）；
     改成主迴圈每 0.5 秒（真實時間）照玩家現在的位置換，不管忙不忙（game3d.js 的 frame）。figTick 照舊也換（下課拿掉替身照舊在 figTick）*/
  S.figLod=function(GM){ if(!FIG.on.size) return 0; const E=GM.E, PP=E.player&&E.player.obj&&E.player.obj.position; if(!PP) return 0; let n=0; for(const rec of FIG.on.values()) if(rec.lay&&E.zone===rec.zone&&rec.lay(PP)) n++; return n; };
  let figFr=null;
  S.figTick=function(GM){ if(!FIG.on.size) return; const E=GM.E, PP=E.player&&E.player.obj&&E.player.obj.position; for(const rec of [...FIG.on.values()]){ if(E.zone!==rec.zone){ FIG.on.delete(rec.key); continue; } if(rec.lay&&PP) rec.lay(PP);   /* 照玩家現在的位置換遠近（BUG-03）*/ if(!rec.leaving||!rec.group) continue;
      const cam=E.camera; let seen=false; if(cam&&THREE.Frustum){ figFr=figFr||new THREE.Frustum(); figFr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
        for(const im of rec.group.children){ if(!im.boundingSphere||!im.count) continue;   /* 空的（這一邊沒有人）：包圍球是空的（半徑 −1），不算看得到 */ const sp=im.boundingSphere.clone().applyMatrix4(im.matrixWorld); if(figFr.intersectsSphere(sp)){ seen=true; break; } } }
      if(!seen) figGone(rec); } };
  S.figState=()=>[...FIG.on.values()].map(r=>({key:r.key,n:r.seats.length,leaving:r.leaving,loaded:!!r.group}));   /* 測試用 */
  /* 教室裡的人（AA_137 第 8 節第 3 點，使用者 2026-10-15「上課前教室根本沒有人，一下課教室就坐滿」）：上課前 10 分鐘起陸續進來，開始時坐滿八成，開始後坐滿；
     原本整堂課的 30 分鐘前一次全部坐好（剛好在那之前進教室＝空的，過一下突然坐滿）。下課照舊走出去（walkOut）*/
  S.arriveFrac=function(G,it){ if(!it.t0) return 1; const h=hr(G), a=it.t0-1/6; if(h<a) return 0; if(h<it.t0) return 0.15+0.65*(h-a)/(1/6); return 1; };
  const roomy=Z=>!!(Z&&(Z.layout||Z.glbRoom));   /* 有很多間教室的區域（霖澤館、萬才館的 layout），或一間就是一個區域的 GLB 教室（rooms_glb3d.js：霖澤館 202、萬才館多功能教室、研討室 A）——同學照課表坐進來（BB-C 10-21：202 上課前一個同學都沒有）*/
  function walkInSeat(GM,o,st,key,pose){ const E=GM.E, L=E.zone&&E.zone.layout; const from=(L&&L.entrance&&L.entrance.exit)?{x:L.entrance.exit.x,z:L.entrance.exit.z-0.7,lv:0}:(E.zone&&E.zone.spawn); if(!from||!E.moveTo||!GM.sitAt) return false;
    const ap=(typeof CROWD!=='undefined'&&CROWD.seatSide&&CROWD.seatSide(E,st))||(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; o.position.set(from.x,0,from.z);
    const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'walk',idlePose:'idle',isExtra:true,lv:from.lv|0,clsStudent:true,clsKey:key,seatTarget:st});
    const sit=()=>{ n.seatTarget=null; if(!n.clsStudent) return; GM.sitAt(n,st); n.seat=st; n.pose=n.idlePose=pose; n.frozen=true; };
    if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)) sit(); return true; }
  /* 這個位子有人了（同學坐著或正走過去；玩家坐著）*/
  function seatBusy(E,st){ const near=q=>q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35&&((q.lv|0)===(st.lv|0)||q.lv==null||st.lv==null); return E.npcs.some(n=>near(n.seat||n.seatTarget))||!!(E.player&&near(E.player.seat)); }
  /* 每 2 遊戲分鐘排一次：照 arriveFrac 補到這個時間該有的人數（陸續進來）。2026-10-16 修：原本這一堂只要已經有一個同學就整堂跳過，
     第一次排進來的 2～3 人之後就不再增加（AA_137 第 8 節：上課時大約坐滿一半的位子）——霖澤館 201（syncRoom）沒有這個問題 */
  S.syncRooms=function(GM,opt){ const G=GM.G, E=GM.E; if(!E.zone||!E.zone.seats||!roomy(E.zone)) return; const live=S.liveIn(G,G.zone).filter(it=>it.room.room);
    const instant=(opt&&opt.instant)||!lastSync||lastSync.zone!==G.zone||Math.abs(G.hour-lastSync.h)>0.6; lastSync={zone:G.zone,h:G.hour};
    if(typeof ACTIVITIES!=='undefined') for(const a of ACTIVITIES.active(G,{before:0.25})) if(a.zone===G.zone&&a.room) live.push({key:'act:'+a.id+':'+G.day,room:{room:a.room},n:a.crowd&&a.crowd.n});
    const keys=new Set(live.map(it=>it.key));
    for(const n of E.npcs.slice()){ if(n.clsStudent&&!keys.has(n.clsKey)&&!n.seatTalk){ if(instant||!walkOut(GM,n)) E.removeNPC(n); } }   /* seatTalk：下課後正在說話的同學（AA_495 第 3、4 節，crowd3d.js 的 seatTalkPlay）說完才走 */
    for(const k of [...FIG.on.keys()]) if(!keys.has(k)) S.figRemove(GM,k,instant);   /* 下課：替身整組在畫面外才拿掉 */
    for(const it of live){ const seats=E.zone.seats.filter(q=>q.room===it.room.room&&(q.kind==='class'||q.kind==='lecture')); let h=0; for(const ch of it.key) h=(h*31+ch.charCodeAt(0))>>>0;
      /* 一半的位子（照種子洗牌：同一堂課同一些位子），留一半給玩家 */ let sd=h%2147483646+1; const rnd=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; }; const idx=seats.map((q,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
      const cap=Math.min(16,it.n||Math.round(seats.length*0.5)), tgt=Math.round(cap*(opt&&opt.full?1:S.arriveFrac(G,it))); let have=E.npcs.filter(n=>n.clsStudent&&n.clsKey===it.key).length;   /* CROWD-NO-DOOR-1103：教室門口沒有等的人了，同學都從大門走進來（walkInSeat）*/
      for(const i of idx.slice(0,cap)){ if(have>=tgt) break;   /* 最多 16 人（和霖澤館 201 一樣；階梯教室 40 個位子不會一次載 20 個人物）*/ const st=seats[i]; if(st.taken||seatBusy(E,st)) continue; const o=CHAR.build(STORY.extraSpec(200+((h+i*7)%97)));
        if(!instant&&walkInSeat(GM,o,st,it.key,'sit')){ have++; continue; }   /* 待在教室裡：同學從門口走進來坐下（AA_137 第 8 節第 3 點：上課前 10 分鐘起陸續進來）*/
        o.position.set(st.x,st.y||0,st.z); o.rotation.y=st.yaw;   /* 階梯教室：座位的高度（addNPC 也照 seat.y 放）*/
        E.addNPC({obj:o,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,seat:st,lv:st.lv|0,clsStudent:true,clsKey:it.key}); have++; }
      const want=Math.min(seats.length,it.n||Math.round(seats.length*0.5)), P=E.player&&E.player.obj&&E.player.obj.position;
      const watching=!instant&&!!P&&(E.zone.roomAt?E.zone.roomAt(P.x,P.z,E.player.lv|0)===it.room.room:true);   /* 玩家人在這一間裡（GLB 教室：整個區域就是這一間）*/
      if(seats.length>=40&&want>16&&!watching&&((opt&&opt.full)||!it.c||S.arriveFrac(G,it)>=0.8)) S.figPlace(GM,it.key,idx.slice(16,want).map(i=>seats[i]));   /* 其餘的位子：替身——替身不會走路，玩家在這一間裡看著的時候不放（CROWD-CLASS-ARRIVE-1027：原本開放進教室那一刻（開始前 30 分鐘），十幾個替身一起出現在座位上）；
        剛走進來、時間跳了、人在走廊才放，而且要到同學差不多都到了（開始前 2 分鐘起、上課時；演講照舊）——不然前排空著、後排已經坐滿 */ }
    S.syncTeacher(GM,live,instant); };   /* 講台前的老師（CLASS-TEACHER-1027）：演講、活動（沒有 it.c）不放 */
  S.syncRoom=function(GM,opt){ const G=GM.G, E=GM.E; if(roomy(E.zone)) return S.syncRooms(GM,opt); if(!E.zone||!E.zone.seats) return; const live=S.liveIn(G,'classroom'); const key=live.length?live[0].key:null;
    const instant=(opt&&opt.instant)||!lastSync||lastSync.zone!==G.zone||Math.abs(G.hour-lastSync.h)>0.6; lastSync={zone:G.zone,h:G.hour};   /* 沒有課的時候也記（老師下課要走出去：CLASS-TEACHER-1027）*/
    const mine=E.npcs.filter(n=>n.clsStudent); if(mine.length&&mine[0].clsKey!==key){ for(const n of mine){ if(instant||!walkOut(GM,n)) E.removeNPC(n); } }   /* 下課：同學起身從門口走出去（CROWD-CLASS-ARRIVE-1027；原本 201 的同學一下課就在座位上消失）；時間跳了才直接拿掉 */
    S.syncTeacher(GM,G.flags&&G.flags.classNow?[]:live,instant);   /* 劇情課（第二天的民總、F.classNow）：講台上的周教授由 story3d.js 生，這裡不另外放 */
    if(!key) return; const seats=E.zone.seats; let i=0; const cells=[[0,0],[0,2],[0,5],[1,1],[1,6],[2,0],[2,2],[2,4],[2,7],[3,1],[3,3],[3,6],[4,0],[4,5],[5,2],[5,7]];
    const tgt=Math.round(cells.length*(opt&&opt.full?1:S.arriveFrac(G,live[0]))); let have=E.npcs.filter(n=>n.clsStudent).length;   /* 上課前 10 分鐘起陸續進來（AA_137 第 8 節）*/
    for(const [r,c] of cells){ const sIdx=i++; if(have>=tgt) break; const s=seats.find(q=>q.row===r&&q.col===c); if(!s) continue; if(seatBusy(E,s)) continue; const o=CHAR.build(STORY.extraSpec(60+sIdx));
      if(!instant&&walkInSeat(GM,o,s,key,'read')){ have++; continue; }
      o.position.set(s.x,s.y||0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s,clsStudent:true,clsKey:key}); have++; } };
  /* ---------- 講台前的老師（CLASS-TEACHER-1027；使用者 2026-10-27 20:3x「電影敘事上課沒老師? 如果我晚到也要看到有老師啊」「每一堂課都要檢查」）----------
     每一堂上課中（S.live：開始前 30 分鐘到下課）的教室，講台前都有一位老師，面向學生：
     - 有名字、有 3D 人物的教授（CHARACTERS 的 prof_*，社會圖 E 層）：照 story3d.js 的作息（schedFor → S.profWhere）站上講台，位置問 S.teacherSpot。
       原本只查教學館的 teacherSpots[房號]：萬才館多功能教室、霖澤館 202（GLB 教室只有 teacherSpot）、共同 102、普通 101（平面教室沒有講台位置）都找不到，教授不出現（鄭、何、簡、蔡教授在萬才館、202 的課，黃教授的法學緒論）。
     - 沒有 3D 教授的課（prof:null：國文、英文、通識、會計、微積分、日文、兼任老師的選修…）：一位一般的老師（路人底模、教授的穿著：STORY.profSpec；同一門課同一位），
       名字＝課堂上說話的那個稱呼（c.pool.prof_label 或 S.profName：國文老師、通識老師、兼任老師…）。玩家待在教室裡時從門口走進來、下課走出去；剛進教室（晚到、讀檔、快速前往）就已經站在講台前。
     老師站的位置（S.teacherSpot）：階梯教室＝講桌旁（teach3d.js 的 teacherSpots）；平面教室（共同 102、普通 101…）＝講桌旁邊離門遠的那一側、面向學生；霖澤館 201、GLB 教室＝區域的 teacherSpot。
     測試：node tests/class_teacher_unit.js（課表四年每一門有 3D 教室的課，準時、晚 20 分鐘兩種）*/
  S.teacherSpot=function(E,roomId){ const Z=E&&E.zone; if(!Z) return null;
    if(roomId&&Z.teacherSpots&&Z.teacherSpots[roomId]) return Z.teacherSpots[roomId];
    const L=Z.layout, r=roomId&&L&&Array.isArray(L.rooms)?L.rooms.find(q=>q.id===roomId):null;
    if(r&&r.teacher){ const C=Z._tSpots||(Z._tSpots={}); if(C[roomId]) return C[roomId];
      const T=r.teacher, s=r.board==='E'?-1:1, dz=r.doorZ!=null?r.doorZ:-0.4, away=(T.z-dz)>=0?1:-1, lv=r.lv|0, off=T.d/2+0.5;   /* 黑板在西（W）＝學生面向 −x、老師面向 +x */
      const cand=[[T.x,T.z+away*off],[T.x,T.z-away*off],[T.x+s*(T.w/2+0.55),T.z]];   /* 講桌旁邊（離門遠的那一側 → 另一側 → 講桌前面）*/
      const ok=p=>!E.canStand||E.canStand(p[0],p[1],0.3,lv); const p=cand.find(ok)||cand[0];
      return (C[roomId]={x:+p[0].toFixed(2),z:+p[1].toFixed(2),yaw:s*Math.PI/2,lv}); }
    return Z.teacherSpot||null; };
  /* 這門課有沒有自己的 3D 教授（story3d.js 照作息生）：有＝這裡不放一般的老師 */
  S.namedProf=c=>{ const id=c&&c.prof; return id&&typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].social_layer==='E'?id:null; };
  S.teacherName=c=>{ attachSyllabus(); return (c&&c.pool&&c.pool.prof_label)||S.profName(c); };
  S.teacherSpec=function(c){ const id='tch_'+(c.redo||c.id); let h=0; for(const ch of id) h=(h*31+ch.charCodeAt(0))>>>0; const f=h%2===0;
    if(typeof STORY!=='undefined'&&STORY.profSpec) return Object.assign(STORY.profSpec({id,name:S.teacherName(c),gender:f?'f':'m'}),{name:S.teacherName(c)});
    return typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(600+(h%40)*2+(f?0:1)):{id}; };
  /* 從哪裡走進來、走出去：教學館＝大門（和同學一樣）；霖澤館 201、GLB 教室＝教室的門 */
  S.entryPoint=function(E){ const L=E.zone&&E.zone.layout; if(L&&L.entrance&&L.entrance.exit) return {x:L.entrance.exit.x,z:L.entrance.exit.z-0.7,lv:0}; const sp=E.zone&&E.zone.spawn; return sp?{x:sp.x,z:sp.z,lv:sp.lv|0}:null; };
  const tStand=(E,n,sp)=>{ n.path=null; if(E.placeAt) E.placeAt(n,sp.x,sp.z,sp.lv|0); else n.obj.position.set(sp.x,0,sp.z); n.obj.rotation.y=sp.yaw||0; n.faceYaw=null; n.pose=n.idlePose='idle'; n.frozen=true; n.arrived=true; };
  S.syncTeacher=function(GM,live,instant){ const G=GM.G, E=GM.E; if(!E||!E.zone||!E.npcs||typeof CHAR==='undefined') return 0; const want=new Map();
    const rooms=new Set(); for(const it of (live||[]).slice().sort((a,b)=>(a.t0||0)-(b.t0||0))){ if(!it||!it.c) continue; const rk=(it.room&&it.room.room)||'_'; if(rooms.has(rk)) continue; rooms.add(rk);   /* 同一間連著兩堂（重修排到相鄰的時段）：先上那一堂的老師下課走了，下一堂的才進來（講台只站一個人）*/
      if(S.namedProf(it.c)||want.has(it.key)||(S.storyClass&&S.storyClass(G,it))) continue; const sp=S.teacherSpot(E,it.room&&it.room.room); if(sp) want.set(it.key,{it,sp}); }
    let n0=0;
    for(const n of E.npcs.slice()){ if(!n.clsTeacher||want.has(n.clsTeacher)||n.leaving) continue;   /* 下課：走出去（時間跳了就直接拿掉）*/
      const ex=S.entryPoint(E); n.frozen=false; n.leaving=true; n.arrived=false; n.crowd='tch'; n.pose='walk';   /* crowd：時間跳了（crowd3d.js 的 tick）一起拿掉、走到了不在眼前就拿掉（sweep）；'tch'＝老師（'cls' 是同學）*/
      if(instant||!ex||!E.moveTo||!E.moveTo(n,ex.x,ex.z,()=>{ n.arrived=true; },ex.lv|0)) E.removeNPC(n); }
    for(const [key,{it,sp}] of want){ if(E.npcs.some(n=>n.clsTeacher===key&&!n.leaving)) continue;
      const o=CHAR.build(S.teacherSpec(it.c)), from=!instant?S.entryPoint(E):null; const at=from||sp; o.position.set(at.x,0,at.z); o.rotation.y=sp.yaw||0;
      const n=E.addNPC({obj:o,name:S.teacherName(it.c),beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,lv:at.lv|0,clsTeacher:key,clsTeacherOf:it.c.id,tSpot:sp}); n0++;
      if(from&&E.moveTo){ n.frozen=false; n.pose='walk'; if(E.moveTo(n,sp.x,sp.z,()=>tStand(E,n,sp),sp.lv|0)) continue; }   /* 待在教室裡：從門口走到講台 */
      tStand(E,n,sp); }
    return n0; };
  /* 快轉、轉暗以前：還在走向座位、講台的人直接到位（黑畫面裡時間過去了；不然快轉以後還走在半路，下課的同步會把沒坐下的人當場拿掉）*/
  S.settleRoom=function(GM){ const E=GM.E; if(!E||!E.npcs) return 0; let k=0;
    for(const n of E.npcs.slice()){ if(!(n.clsStudent||n.clsTeacher||n.tSpot||n.seatTarget)||n.leaving||!n.path||!n.path.length) continue;   /* tSpot：走上講台的教授；seatTarget：作息裡走去坐下的同學（story3d.js）*/ const p=n.path[n.path.length-1]; if(E.placeAt) E.placeAt(n,p[0],p[1],p[2]!=null?p[2]:(n.lv|0)); else n.obj.position.set(p[0],0,p[1]); n.path=null; const f=n.onArrive; n.onArrive=null; if(f) f(n); k++; }
    return k; };
  // ---------- HUD：下一堂（點了打開手機）----------
  S.updateHUD=function(GM){ const el=document.getElementById('nextClass'); if(!el) return; const G=GM.G; if(!G||GM.titleIdle){ el.classList.add('hide'); return; }
    const cur=S.dayItems(G).find(it=>S.live(G,it)&&S.rec(G).done[it.key]); let s='';
    const nx=S.next(G); if(nx){ const st=S.status(G,nx); s=(st==='open'?'現在可以上課：':'下一堂 ')+S.itemText(nx); } else s=S.dayItems(G).length?'今天的課都結束了':(CALENDAR.termOf(G.day)?'今天沒有課':'放假中');
    if(el.dataset.s!==s){ el.dataset.s=s; el.textContent=s; } el.classList.remove('hide'); };
  // ---------- 快速前往（D54 ①：已知地點可以快速前往，依距離花合理的遊戲時間）----------
  /* 各區域在校園座標裡大概的位置（公館、溫州街照 zones3d.js 的換算：公館 (gx,gz) → 校園 (x=-170-gz, z=gx)；溫州街經新生南路，見下面 WZ-ENTRY-XINSHENG-1103）。只用來估時間。
     遊戲的校園比真的小（校門到霖澤館 160 m，真的大約 1 km）：時間照真實步行算——遊戲距離 ×6、每分鐘 80 m，加 2 分鐘進出建築，四捨五入到 5 分鐘、最少 5 分鐘
     （宿舍→霖澤館約 15 分鐘、霖澤館→溫州街 Café 約 20 分鐘）*/
  const ANCHOR={ linze:[34,-112], classroom:[34,-112], gongtong:[2,33], boya:[-38,-83], putong:[-38,-58.5], wancai:[90.28,-83.2], lawlib:[85.08,-90.58], soclib:(typeof SL3!=='undefined'?[SL3.DOOR.x,SL3.DOOR.z]:[11,-65.7]), library_hall:[80,0], library:[80,0], dorm:[20,68], dorm_hall:[20,68],
                 gongguan:[-140,0], cvs:[-188,-29], bookstore:[-188,-42], noodle:[-188,-63], wenzhou:[-90,-240], cafe:[-90,-300], xinsheng:[-101.4,-150], tingzhou:[-215,37] };   /* 汀州路（TINGZHOU-SHOPS-MOVE-1110）：公館店面街 G10 的巷子往西 27 m（公館的區域座標 +x 往南、+z 往西：巷口 (37.1,18) ≈ 校園座標 (−190,37)）*/   /* 新生南路：側門外（側門在校園北牆 (−101.4,−141)，XS-GATE-NORTH-1105；原本寫舊的西牆 (−124,−84)）；那一排的店照 PLACES.base 算新生南路（XS-PHONEMAP-1105）*/
  /* 溫州街、Café（WZ-ENTRY-XINSHENG-1103，X199：溫州街只從新生南路進出）：原本 [-200,-95]、[-192,-75]＝從公館巷口進去的位置。現在照新生南路往北走：
     新生南路的「往溫州街」在校園座標約 (−90,−190)（xinsheng3d.js 的 C2X 反算），進溫州街西側橫巷、再沿主巷往東到 Café 約 110 m——溫州街取中間 (−90,−240)、Café (−90,−300)。
     路程：霖澤館→Café 約 20 分鐘（和原本一樣）、公館→Café 約 25 分鐘（要繞回校園走側門；原本經巷口約 10 分鐘）*/
  S.travelMinutes=function(G,fromZone,toZone,pos,toPos){ if(fromZone===toZone&&(toZone==='gongguan'||toZone==='wenzhou'||toZone==='tingzhou')&&pos&&toPos){   /* 汀州路：巷子口＋八間店門口（TINGZHOU-SHOPS-MOVE-1110）*/   /* 溫州街也有好幾個落點（溫州街、帝大紅茶、夏日冰菓室、溫州書屋；WZ-QUICKTRAVEL-1110）*/ const d=Math.hypot(pos.x-toPos.x,pos.z-toPos.z); return d<12?0:Math.max(5,Math.round((2+d/13)/5)*5); }   /* 公館有兩個落點（商圈、捷運站）：照距離算，和校園一樣（BB-B 10-23：人在公館時捷運站也寫「你在這裡」）*/
    if(fromZone===toZone&&toZone!=='campus') return 0;
    const anc=z=>ANCHOR[z]||(typeof PLACES!=='undefined'&&PLACES.base?ANCHOR[PLACES.base(z)]:null);   /* 沒有自己位置的樓上樓層、房間：照那一棟（PHONE-UNIFY-1030，手機「朋友」直接過去到霖澤館 3F＝霖澤館）*/
    const a=fromZone==='campus'&&pos?[pos.x,pos.z]:anc(fromZone), b=toZone==='campus'?(toPos?[toPos.x,toPos.z]:[-38,6]):anc(toZone); if(!a||!b) return 15;
    const d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(fromZone==='campus'&&toZone==='campus'&&d<12) return 0;
    const m=2+d/13; return Math.max(5,Math.round(m/5)*5); };
  // ---------- 時間跳轉（D54 ③：要安全）----------
  /* 規則：
     - 第一、二天（主線劇情的兩天）不能跳；劇情、對話進行中不能跳；不跳過午夜（隔天＝回宿舍睡覺）。
     - 跳轉一次走 10 分鐘，每一步檢查：特殊課堂（有內容的那一週）開始前 10 分鐘停；已接受的邀約（之後的手機邀約）前 10 分鐘停；
       這個地方的自動劇情事件（沒有隨機權重、不靠近某人才觸發的）條件成立就停，讓它照常發生；人在法圖、閉館前 10 分鐘停。
     - 普通課堂不中斷跳轉（D54：普通課堂與可重複的日常不必強制中斷）：中間經過的課＝沒去（手機會寫）；跳之前確認一次。
     - 跳完：NPC 作息、目標、HUD 照新的時間更新（story3d.js 的 S.tick），自動存檔。 */
  const opening=G=>typeof STORY!=='undefined'&&STORY.opening?STORY.opening(G):G.day<3;   /* 開場劇情的日子（法律系第 1、2 天、經濟系 2024-09-01）*/
  S.canSkip=function(GM){ const G=GM.G; if(!G||opening(G)) return '第一、二天先跟著劇情走'; if(late(G)) return '已經過午夜了，回宿舍睡覺吧（睡醒就是明天）'; if(GM.D&&GM.D.active) return '對話中'; if(GM.E&&GM.E.player&&GM.E.player.busy) return '現在不能跳'; return ''; };
  S.STOP_FNS=[G=>{ const cw=typeof STORY!=='undefined'&&STORY.coreCallAt?STORY.coreCallAt(G):null; if(cw!=null) return [{h:cw,why:'約好的時間過了，對方會打電話來'}];
    const lw=typeof STORY!=='undefined'&&STORY.lawWakeAt?STORY.lawWakeAt(G):null; return lw!=null?[{h:lw,why:STORY.ceremonyDue&&STORY.ceremonyDue(G)&&lw===14?'開學典禮（綜合體育館）':'有約好的事'}]:[]; }];
  /* 經濟系 9/21 16:00 韋綸問系烤要不要去（BUG-Y0-E08-MISSED-AFTER-GOING-1109 (a)）*/   /* 經濟系 9/20 回了可昕、要去普通教學館見面（AA_727；BB-B 11-07 17:20 P3）*/   /* 法律系那幾年睡著也會醒來的時間（lawWakeAt：8/31 開學典禮 14:00、10/24 電話…）小睡和跳過時間也停（BB-B 10-31 cer831：「睡到傍晚」睡到 18:00 才演典禮）*/   /* 小睡、跳過時間停在她打來的那一刻（STORY.coreCallAt：經濟系那幾場重要的出遊、法律系 8/30 E37；BB-B 10-31 E37 twice）*/   /* 事件包各自的停點：CLS.STOP_FNS.push(fn)，fn(G,h0,h1) 回傳 [{h,why}]（h＝今天幾點）。AA_296 那幾通電話（AA 10-22 08:41：跳過時間碰到她打來要停下來，睡覺照舊算沒接）——電話打來前 2 小時才排進 OUT，跳過時間一開始就要知道 */
  S.skipStops=function(GM,h1){ const G=GM.G, out=[]; const h0=hr(G);
    for(const f of S.STOP_FNS){ try{ for(const a of (f(G,h0,h1)||[])) if(a&&a.h>h0&&a.h<h1) out.push(a); }catch(e){ console.warn('CLS.STOP_FNS',e); } }
    for(const it of S.dayItems(G)){ const sp=(it.c.specials||[]).find(q=>q.w===it.week&&q.content); if(sp&&it.t0-1/6>h0&&it.t0-1/6<h1) out.push({h:it.t0-1/6,why:'特殊課堂：'+it.c.name}); }
    for(const it of S.dayItems(G)){ if(it.exam&&!S.rec(G).done[it.key]&&it.t0-1/6>h0&&it.t0-1/6<h1) out.push({h:it.t0-1/6,why:'考試：'+it.c.name}); }   /* 考試不給翹（AA_294 ①）：跳過時間停在考試前 10 分鐘，接著 S.oneTick 帶進考場 */
    for(const iv of (G.invites||[])){ if(iv.day===G.day&&iv.accepted&&!iv.done&&iv.h-1/6>h0&&iv.h-1/6<h1) out.push({h:iv.h-1/6,why:'約好的時間：'+(iv.label||'')}); }
    if(typeof DATE!=='undefined'&&DATE.alarmsFor) for(const q of DATE.alarmsFor(G,G.day)){ if(q.dep-1/6>h0&&q.dep-1/6<h1) out.push({h:q.dep-1/6,why:'約好的出發時間：'+q.label}); }   /* 校外約會：出發前 10 分鐘停（DATE-S4）*/
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)){ if(!(OUT.alarmOn?OUT.alarmOn(q):q.alarm)||q.state!=='planned'||q.day!==G.day) continue; const dep=q.h-(OUT.trip?OUT.trip(G,q).travelH:(q.travelH||0)); if(dep-1/6>h0&&dep-1/6<h1) out.push({h:dep-1/6,why:'約好的出發時間：'+q.title}); }   /* 出遊標 alarm 的（X81：8/30 載可昕上山）：出發前 10 分鐘停 */
    if(typeof PLACES!=='undefined'&&PLACES.hours[G.zone]){ const o=PLACES.hours[G.zone]; const c=o.rules?(PLACES.windowOf(G.zone,G.day,h0)||[0,0])[1]:(o.close!=null&&o.close<=24?o.close:null);   /* 人在有開放時間的地方（法圖、總圖、Café…）：閉館前 10 分鐘停，不會跳到閉館以後還待在館裡（一天兩段的店：現在這一段，AA_364）*/
      if(c&&c-1/6>h0&&c-1/6<h1) out.push({h:c-1/6,why:(PLACES.names&&PLACES.names[G.zone]||'這裡')+'快關門了'}); }
    if(typeof EVENTS!=='undefined'&&typeof STORY_EVENTS!=='undefined'&&EVENTS.check){ const keep=G.hour; try{ /* 每 10 分鐘的整點（整數 k 算，不累加 1/6：浮點誤差會晚 10 分鐘）*/ for(let k=Math.floor(h0*6+1e-6)+1;k/6<h1;k++){ const t=k/6; G.hour=Math.floor(keep/24)*24+t; const ev=STORY_EVENTS.find(e=>e.trigger==='auto'&&e.random_weight===undefined&&!e.near&&EVENTS.check(e)); if(ev){ out.push({h:t,why:ev.title||'有事發生'}); break; } } } finally { G.hour=keep; } }
    out.sort((a,b)=>a.h-b.h); return out; };
  /* 人在有開放時間的地方、已經在閉館前 10 分鐘以內（或已經過了閉館時間）：不能跳過閉館，先離開（不然停在閉館前 10 分鐘之後再按一次，就會跳到閉館後還待在館裡）*/
  S.closingBlock=function(G,h1){ if(typeof PLACES==='undefined'||!PLACES.hours[G.zone]) return ''; const o=PLACES.hours[G.zone], h0=hr(G); const c=o.rules?(PLACES.windowOf(G.zone,G.day,h0)||[0,0])[1]:(o.close!=null&&o.close<=24?o.close:null);
    if(!c||h1<=c) return ''; if(h0>=c-1/6-1e-6) return (PLACES.names&&PLACES.names[G.zone]||'這裡')+(h0>=c?'已經':'快要')+'閉館了（'+hhmm(c)+'），先離開再跳過時間。'; return ''; };
  /* o.nap：在床上小睡（story3d.js 的 S.bedOptions）——一樣的停點與確認；旁白寫「醒來」*/
  S.skipTo=async function(GM,h1,o){ o=o||{}; const G=GM.G, why=S.canSkip(GM); if(why){ GM.toast(why,3000); return false; } const h0=hr(G); if(h1<=h0+0.05) return false; if(h1>23.99) h1=23.99;
    const cb=S.closingBlock(G,h1); if(cb){ GM.toast(cb,4000); return false; }
    { const ex=S.dayItems(G).find(it=>it.exam&&!S.rec(G).done[it.key]&&S.status(G,it)==='open'&&h0>=it.t0-1/6); if(ex){ GM.toast(S.examName(ex)+'快開始了。',3000); return false; } }   /* 考試前 10 分鐘以後不能跳過去（AA_294 ①）*/
    if(typeof STORY!=='undefined'&&STORY.phoneRules){ try{ STORY.phoneRules(GM); }catch(e){ console.warn('CLS.skipTo phoneRules',e); } }   /* 先跑一次手機規則：剛回完私訊（例：韋綸問系烤回「好」＝E08_GO）、手機還開著就按跳過時間，回覆以後才排的出遊要先排出來，停點才算得到（BB-B 11-09 20:3x E26v4：q8 還沒排、直接跳到 20:00）*/
    const stops=S.skipStops(GM,h1); const stop=stops[0]; const target=stop?stop.h:h1;
    const passed=S.dayItems(G).filter(it=>S.status(G,it)!=='done'&&it.t1-LATE_END>h0&&it.t1-LATE_END<=target&&!S.storyClass(G,it)&&!(h0>it.t0+WIN1));   /* 已經遲到超過 15 分鐘的課（照樣記缺席）不再警告「會錯過」（v9.7 試玩回歸 flow_playtest_fixes C：10:00 小睡，跳出「會錯過 09:10 國文」）*/
    if(passed.length){ GM.sceneBegin(); let i=0; try{ i=await GM.choose([{t:'照樣跳過',hint:'會錯過：'+passed.map(it=>hhmm(it.t0)+' '+it.c.name).join('、')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i!==0) return false; }
    GM.sceneBegin(); try{ await GM.fade(true); GM.advance(target-h0); await GM.sleep(300); await GM.fade(false); } finally { GM.sceneEnd(); }
    const zn=(typeof Z3!=='undefined'&&Z3.ZONES[G.zone])?Z3.ZONES[G.zone].name:''; GM.caption('',(stop?'（'+stop.why+'）':(o.why?'（'+o.why+'）':''))+(o.nap?'你睡了一下，醒來是 '+hhmm(hr(G))+'。':'你在'+(zn||'這裡')+'待到 '+hhmm(hr(G))+'。'),3200);
    if(o.nap&&S.queueWake) S.queueWake(GM);   /* 小睡醒來也出起床選單（DL-01 1-1 ②）*/
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  // ---------- 手機的「今天」「課表」----------
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  /* 開學第一週的待辦（AA_110 第 6-4 節，AA 暫定）：手機「今天」底下一張小清單，做完一項劃掉一項；不做也不擋任何事；大一上第 3～5 週顯示，第 6 週自動收起來。
     「買六法」「逛社團博覽會」不列（AA_110 6-3；AA_355 第 3 節：過時、不用做事——社團博覽會已經在遊戲裡，S.fairMenu）。 */
  S.todoItems=function(G){ if(typeof CALENDAR==='undefined') return []; const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y1S1'||t.week>5) return [];
    const R=S.rec(G), F=G.flags||{}, A=typeof ACTIVITIES!=='undefined'?ACTIVITIES:null, went=id=>!!(A&&A.stateOf&&A.stateOf(G,id));
    return [{key:'textbook',text:'買民總、刑總、憲法的教科書（頁間書屋），或在法律學院圖書館看指定參考書',done:!!(F.textbook||F.readReserve||(F.books&&Object.keys(F.books).length))},
            {key:'libtour',text:'總圖新生導覽（9/19、9/23、9/25、9/26 15:30，總圖大廳；去一場就好）',done:went('lib_tour_y1s1')},
            {key:'lawlibintro',text:'法律資料怎麼查（9/24、10/1 15:30，法律學院圖書館 討論室 A）',done:went('lawlib_intro_y1s1')},
            {key:'service',text:'服務學習報到（9/24 週三 13:20，法律學院圖書館 櫃台）',done:(R.attend.service_1||0)>=1}]; };
  S.todoHTML=function(G){ const its=S.todoItems(G); if(!its.length) return ''; const left=its.filter(q=>!q.done).length;
    return '<div class="item"><b>開學待辦</b>'+(left?'<span class="muted">（還有 '+left+' 項，不做也沒關係）</span>':'<span class="muted">（都做完了）</span>')+its.map(q=>'<div class="'+(q.done?'muted':'')+'" style="margin-top:4px'+(q.done?';text-decoration:line-through':'')+'">'+(q.done?'✓ ':'☐ ')+esc(q.text)+'</div>').join('')+'</div>'; };
  /* 手機「今天」：今天排進行程的出遊（UX-GROUP-NOTICE-1018；BB 10-21：排進行程的提示寫「手機的『今天』也看得到」，可是「今天」原本只列課和當面約，出遊看不到）*/
  S.outTodayHTML=function(G){ if(typeof OUT==='undefined'||!OUT.rec) return ''; const L=OUT.rec(G).filter(q=>q&&q.state==='planned'&&q.day===G.day).sort((a,b)=>a.h-b.h); if(!L.length) return '';
    return '<div class="item"><b>今天的行程</b>'+L.map(q=>{ const t=q.title||q.place||'出遊', pl=q.place&&!t.includes(q.place)?'（'+q.place+'）':''; const tr=q.dateTrip&&typeof DATE!=='undefined'&&DATE.trip?DATE.trip(G,q.dateTrip):null; return '<div>'+esc((tr&&tr.depart!=null?hhmm(tr.depart)+' 出發':hhmm(q.h))+'　'+t+pl)+'</div>'; }).join('')+'<div class="muted">時間到會跳出「出發」</div></div>'; };   /* 校外約會寫出發的時間（q.h 是到達；兩天一夜車程長，BB 帳號 A 10-21 22:5x：寫 10:50 看不出來 9:00 要出門）*/
  S.todayHTML=function(G){ const its=S.dayItems(G).filter(it=>!S.storyClass(G,it)); const st={done:'上過了',missed:'沒去',open:'現在可以進教室',upcoming:'還沒開始'};
    let h='<div class="item"><b>'+esc(S.dayLabel(G))+'</b><div class="muted">現在 '+hhmm(hr(G))+'</div></div>'+(S.slotHTML?S.slotHTML(G):'')+S.todoHTML(G)+(typeof SIDEQ!=='undefined'&&SIDEQ.todayHTML?SIDEQ.todayHTML(G):'')+S.outTodayHTML(G);   /* 順手的事（店員的支線，AA_397；src/sideq3d.js）：開學待辦下面 */
    /* 經濟系休學在家：序章行事曆（衝刺班、模擬考、放榜…；home3d.js）*/   /* 時段次數（DL-03 2-6）在最上面 */
    if(!its.length) h+='<div class="item">'+esc(S.todayLine(G))+'</div>';
    const R2=S.rec(G); for(const it of its){ const s=S.status(G,it); const lab=s==='done'&&R2.abs[it.key]?'進去聽了（記缺席）':(s==='done'&&R2.late[it.key]?'上過了（遲到）':(s==='open'&&S.isLateAbsent(G,it)?'已經開始超過 15 分鐘（進去會記缺席）':(s==='open'&&S.lateMin(G,it)>=1?'已經開始（現在進去算遲到）':((s==='open'||s==='upcoming')&&R2.note['plan_skip_'+it.key]?'翹課':st[s])))); h+='<div class="item phrow"><div><b>'+hhmm(it.t0)+'–'+hhmm(it.t1)+'</b> '+esc(it.c.name)+(it.exam?'（考試）':'')+'<div class="muted">'+esc(it.room.name||'')+(it.c.prof||it.c.profName?'・'+esc(S.profName(it.c)):'')+'・'+lab+'</div></div>'+
      ((s==='open'||s==='upcoming')&&(it.room.zone||it.room.door||it.room.offsite)?'<button class="btn" data-go="'+esc(it.key)+'">'+(s==='open'&&S.isLateAbsent(G,it)?'去聽後半堂（記缺席）':(R2.note['plan_skip_'+it.key]?'反悔：直接去上課':'直接去上課'))+'</button>':'')+'</div>'; }   /* DL-01：「去教室」改成「直接去上課」（走 S.goClass）*/
    if(typeof PLACES!=='undefined') h+='<div class="item muted">法律學院圖書館：'+esc(PLACES.todayText('lawlib',G.day))+'　總圖：08:00–22:00</div>';
    const h0=hr(G), nx=S.next(G); const skips=[]; if(late(G)){}   /* 過了午夜：不給跳（睡覺才是明天）*/ else if(nx&&nx.t0-1/6>h0+0.25) skips.push([nx.t0-1/6,'等到下一堂課前（'+hhmm(nx.t0-1/6)+'）']); for(const [t,l] of [[12,'等到中午'],[14,'等到下午'],[17.5,'等到傍晚'],[20,'等到晚上']]) if(!late(G)&&t>h0+0.25&&!skips.some(q=>Math.abs(q[0]-t)<0.3)) skips.push([t,l+'（'+hhmm(t)+'）']);
    if(skips.length) h+='<div class="item"><b>跳過時間</b><div class="muted">沒有想做的事可以跳過；遇到特殊課堂、約好的時間、劇情會停下來。</div><div class="row2" style="flex-wrap:wrap;gap:6px;margin-top:6px">'+skips.map(([t,l])=>'<button class="btn" data-skip="'+t.toFixed(3)+'">'+esc(l)+'</button>').join('')+'</div></div>';
    h+='<div class="item muted">翹課不會被扣分；沒去的課，可以在宿舍、圖書館、Café 讀書補回來。</div>'; return h; };
  /* 只有某幾週的課：「第 4–7、10–14 週」*/
  S.weeksText=function(c){ const w=(c.weeks||[]).slice().sort((a,b)=>a-b); if(!w.length) return ''; const rs=[]; let a=w[0], b=w[0]; for(const x of w.slice(1)){ if(x===b+1){ b=x; continue; } rs.push(a===b?''+a:a+'–'+b); a=b=x; } rs.push(a===b?''+a:a+'–'+b); return '第 '+rs.join('、')+' 週'; };
  S.weekHTML=function(G){ /* 經濟系休學在家：沒有課表，看行事曆 */ const t=CALENDAR.termOf(G.day); let termId=t?t.id:null; if(!termId){ for(let k=1;k<200&&!termId;k++){ const q=CALENDAR.termOf(G.day+k); if(q) termId=q.id; } }
    if(!termId) return '<div class="item">沒有課表。</div>'; const cs=S.termCourses(G,termId); const todayWd=CALENDAR.dateOf(G.day).wd; const R=S.rec(G);
    let h='<div class="item"><b>'+S.termName(termId)+'</b>'+(t?'・第 '+t.week+' 週':'（還沒開學）')+'</div><div class="tt"><div class="tth"></div>'; for(let d=1;d<=5;d++) h+='<div class="tth'+(d===todayWd&&t?' on':'')+'">'+WD[d]+'</div>';
    for(const bk of ['am','pm1','pm2']){ h+='<div class="ttb">'+B(bk).label+'<br><span class="muted">'+hhmm(B(bk).t0)+'</span></div>'; for(let d=1;d<=5;d++){ const c=cs.find(q=>q.slots.some(s=>s.wd===d&&s.block===bk)); h+='<div class="ttc'+(d===todayWd&&t?' on':'')+'">'+(c?esc(c.name)+'<br><span class="muted">'+esc(S.roomName(c))+(c.weeks?'・'+esc(S.weeksText(c)):'')+'</span>':'')+'</div>'; } }
    h+='</div><div class="item"><b>出席</b>'+cs.map(c=>{ const n=R.attend[c.id]||0; let t;
      if(S.attCourse(c)){ const st=S.rollStat(G,c,termId,G.day); t='點過 '+st.past+' 次名'+(st.missed?'（缺 '+st.missed+' 次）':''); }   /* ATTEND-ROLLCALL-1102：看出席的課只顯示已經點過的（還沒到的點名日看不到）*/
      else t=c.weeks?n+'／'+c.weeks.length+' 次':'去過 '+n+' 次';   /* D43：有週數的（服務學習）隨時看得到還差幾堂 */
      return '<div class="phrow attRow" style="margin-top:4px"><span>'+esc(c.name)+'</span><span class="muted" style="flex:none">'+esc(t)+'</span></div>'; }).join('')+'</div>';   /* 一門課一行（ATTEND-TIDY-1110，使用者 11-10 X292「太亂了」：原本一長串用頓號接起來）*/
    const ex=S.examList(G,termId); if(ex.length) h+='<div class="item"><b>考試</b><span class="muted">（這段時間不能約人、約會）</span>'+ex.map(e=>{ const dt=CALENDAR.dateOf(e.day), past=e.day<G.day; return '<div class="'+(past?'muted':'')+'" style="margin-top:4px">'+(e.kind==='mid'?'期中':'期末')+'　'+esc(e.c.name)+'　'+dt.m+'/'+dt.d+'（'+'日一二三四五六日'[dt.wd]+'）'+hhmm(e.t0)+'–'+hhmm(e.t1)+'　'+esc(S.roomName(e.c))+(e.makeup?'（補考那一堂）':'')+(past?'　考過了':'')+'</div>'; }).join('')+'</div>';   /* D14-T3：考試時段標在課表 */
    return h; };

  // ---------- 一鍵上課（DL-01，AA_160 第 1 節；AA-B 定案，使用者 10-16 授權 AA-B 主導日常系統）----------
  /* 起床選單（1-2）、直接去上課（1-3）、下課選單（1-4）、翹課（1-5）；期末考到時間自動帶進考場（AA_126 1-1）。
     待出的選單記在這裡，S.oneTick 等玩家空下來（沒有劇情、對話、移動中、沒坐著）連續 1.5 秒才出：起床選單因此排在宿舍的晨間事件（阿凱 K-D3 等）之後
     （AA-B 2026-10-16 05:49 同意）。不存檔：重新整理就不再問。出席紀錄全部由 S.attend 照實際時間寫，這裡不寫。
     劇情保護（DL-04B，AA_160 第 3 節）：路上經過的區域有到達時就會演的【固】【必】事件＝停下來演、演完「繼續去上課」（1-3 第 3 點，S.routeStop）；
     翹課確認多一行「你會錯過：○○」（這一堂課裡的【固】【必】，最多三件，一般的說法，S.classMissList）。起床選單「翹這堂課」的灰字照 1-2 原文。
     腳踏車：騎著才照騎車算（和手機快速前往一樣；車停到那棟門外由 bike3d.js 處理）；人在宿舍、車在宿舍門口還是照走路算（要先把車移過去，之後做）。 */
  let wakeP=null, afterP=null, contP=null, goBusy=false, freeSince=0, freeTicks=0;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['classes3d:goBusy']=()=>{ goBusy=false; freeSince=0; freeTicks=0; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const WAKE_GRACE=2500, FREE_MS=1500;
  S.wakeMenuOn=GM=>!(GM&&GM.S&&GM.S.wakeMenu===false);
  S.planSkip=(G,it)=>!!S.rec(G).note['plan_skip_'+it.key];
  S.queueWake=GM=>{ if(GM&&GM.G) wakeP={day:GM.G.day,t:Date.now(),zone:GM.G.zone,h:hr(GM.G)}; };   /* zone、h：醒來的地方、時間（WAKE-STALE-1110）*/   /* story3d.js 的 sleepNow、小睡醒來（skipTo nap）*/
  S.goList=G=>S.dayItems(G).filter(it=>{ const st=S.status(G,it); return (st==='open'||st==='upcoming')&&!S.storyClass(G,it); });
  /* 起床選單只在剛醒來的地方出（WAKE-STALE-1110，使用者 11-10：「我都移動到圖書館 顯示要不要去某堂課 居然還有再睡一下的選項?還可以起床?」）：
     醒來以後馬上走開、或先演了別的，選單會一直等到人停下來才出——人已經在別的區域、或過了 30 分鐘遊戲時間＝不出（手機的「今天」照樣能直接去上課）。舊的排隊沒有 zone／h＝照舊 */
  S.wakeFresh=(G,w)=>!!w&&w.day===G.day&&(w.zone==null||w.zone===G.zone)&&(w.h==null||hr(G)-w.h<=0.5);
  S.pending=()=>({wake:wakeP,after:afterP,cont:contP});   /* 測試用 */
  S.clearPending=()=>{ wakeP=afterP=contP=null; goBusy=false; freeSince=0; freeTicks=0; };
  const bldName=it=>String((it.room&&(it.room.label||it.room.name))||'教室').replace(/ \S+$/,'');
  /* 目的地：201＝classroom 區域（從霖澤館大廳 3 分鐘）；教學館的教室＝那棟建築的區域（建築門口到教室 3 分鐘）；門口上課＝DOORS 的區域 */
  const destOf=it=>{ const rm=it.room||{}; if(rm.zone) return Object.assign({zone:rm.zone,via:rm.via||(rm.zone==='classroom'?'linze':rm.zone),inner:rm.zone==='classroom'||!!rm.room},rm.door&&!rm.room?{door:rm.door}:{});   /* 有 zone 也有 door、沒有 room（萬才館研討室 WSEM、法圖櫃台 LAWLIB_DESK）＝門口上課：留著 door，goClass 進去以後直接報到（BB-B 11-01：原本 door 丟掉＝走選座位、沒有座位就停住，「直接去上課：服務學習」永遠報不到）*/   /* via：走得進去的教室（萬才館多功能教室、霖澤館 202）照那棟樓算路程 */ const d=DOORS[rm.door]; return d?{zone:d.zone,via:d.zone,door:rm.door,pos:d.built?null:{x:d.x,z:d.z}}:null; };
  /* 路程與出門時間（1-3 第 1 點）：目標是開始前 10 分鐘到教室 */
  S.goPlan=function(GM,it){ const G=GM.G, E=GM.E, d=destOf(it); if(!d) return null; const pos=E&&E.player&&E.player.obj?E.player.obj.position:null;
    let mins=G.zone===d.zone?0:(G.zone==='linze'&&d.zone==='classroom'?3:S.travelMinutes(G,G.zone,d.via,pos,d.pos)+(d.inner&&G.zone!==d.via?3:0));
    const bike=mins>0&&!!(E&&E.player&&E.player.riding); if(bike) mins=Math.max(5,Math.round(mins/3.5/5)*5);
    const h=hr(G), depart=it.t0-1/6-mins/60, arrive=Math.max(h,depart)+mins/60; return {d,mins,bike,depart,arrive,late:Math.round((arrive-it.t0)*60)}; };
  S.planHint=function(GM,it,pl){ pl=pl||S.goPlan(GM,it); if(!pl) return ''; const how=pl.mins?(pl.bike?'騎腳踏車 ':'走路 ')+pl.mins+' 分鐘，':'';
    if(pl.late<=0) return how+hhmm(pl.arrive)+' 到教室'; const started=hr(GM.G)>it.t0; if(pl.late<=WIN1*60) return (started?'已經開始了，':'')+'現在出門會遲到 '+pl.late+' 分鐘';
    return started?'已經開始 '+Math.round((hr(GM.G)-it.t0)*60)+' 分鐘，進去會記缺席':'會遲到 '+pl.late+' 分鐘，進去會記缺席'; };
  // ---------- 劇情保護（DL-04B，AA_160 第 3 節 R1、R2：1-3 第 3 點「路上的事件」、1-5「翹課確認列事件」）----------
  /* 事件的四類（3-1）：keep 寫明的照寫（'fixed'【固】／'promise'【約】／'defer'【延】／'must'【必】）；
     沒寫的：有 dates、weeks、time、afterClass、beforeClass 其中一個＝【固】，其他＝【延】（【必】一定要明確標）。 */
  S.evKeep=e=>e&&e.keep?e.keep:((e&&(e.dates||e.weeks||e.time||e.afterClass||e.beforeClass))?'fixed':'defer');
  S.evGuard=e=>{ const k=S.evKeep(e); return k==='fixed'||k==='must'; };   /* 【固】【必】：路上停下來演（R2）、翹課前列出來（R1）；【延】不攔 */
  /* 把時間、地點暫時放到那一刻檢查，檢查完放回去（同 semff3d.js 的 at）*/
  const evAt=(G,h,zone,f)=>{ const k={hour:G.hour,zone:G.zone}; G.hour=h; if(zone) G.zone=zone; try{ return f(); }catch(e){ console.warn('CLS.evAt',e); return null; } finally { G.hour=k.hour; G.zone=k.zone; } };
  /* 路線（R2；1-3 第 3 點「宿舍 → 校園 → 那棟建築 → 教室」）：每一區出去是哪裡，往外走到校園，再走進要去的那一棟。
     樓上樓層、房間照 PLACES.base 對到那一棟（宿舍房間→男生宿舍、總圖 3F→總圖、霖澤館 3F→霖澤館、溫州街的店→溫州街）；
     公館從校門進校園；溫州街經新生南路、從新生南路側門進校園（X199）。走不到校園的區域（國外、日本、美國…）＝不知道路線，不停（照舊直接到）。 */
  const OUTER={library_b1:'campus',classroom:'linze',lawlib:'wancai',linze:'campus',wancai:'campus',dorm_hall:'campus',library_hall:'campus',gongtong:'campus',putong:'campus',boya:'campus',gym:'campus',soclib:'campus',soclib_2f:'soclib',lane118:'campus',gongguan:'campus',
               noodle:'gongguan',cvs:'gongguan',bookstore:'gongguan',bikeshop:'gongguan',aoki:'gongguan',afar:'gongguan',daybreak:'gongguan',yangyang:'gongguan',corner_records:'gongguan',wenzhou:'xinsheng',cafe:'wenzhou',xinsheng:'campus',tingzhou:'gongguan'};   /* 汀州路只從公館店面街的巷子進出（TINGZHOU-SHOPS-MOVE-1110）*/   /* 新生南路從側門進校園（xs_ 的店照 PLACES.base→xinsheng）；溫州街只從新生南路進出（WZ-ENTRY-XINSHENG-1103，X199；原本 wenzhou:'gongguan'）*/
  const outerOf=z=>{ if(OUTER[z]) return OUTER[z]; const b=typeof PLACES!=='undefined'&&PLACES.base?PLACES.base(z):z; return b&&b!==z?b:null; };
  const upTo=z=>{ const out=[]; for(let q=z,n=0;q&&n<8;n++){ out.push(q); if(q==='campus') return out; q=outerOf(q); } return null; };
  /* 中間經過的區域（不含出發的那一區、不含教室那一區），照走的順序 */
  S.routeVia=function(from,to){ const a=upTo(from), b=upTo(to); if(!a||!b) return []; const k=a.findIndex(z=>b.includes(z)); if(k<0) return []; const j=b.indexOf(a[k]);
    return a.slice(1,k+1).concat(b.slice(0,j).reverse()).filter(z=>z!==to&&z!==from); };
  /* 停在校園時站的地方：要走進去的那一棟門口（和各棟「走出去」的落點、手機快速前往的落點一樣）。其他的區域照那一區的出生點（大門、大廳）*/
  const CAMPUS_AT={ linze:{x:34,z:-98,yaw:0}, wancai:{x:89.21,z:-82.01,yaw:0}, gongtong:{x:2,z:21.4,yaw:0}, putong:{x:-38,z:-47.4,yaw:0}, boya:{x:-38,z:-71.4,yaw:0}, gym:{x:-75,z:-123.4,yaw:0}, library_hall:{x:80,z:0,yaw:-Math.PI/2}, dorm_hall:{x:20,z:54,yaw:Math.PI} };
  /* 到達時就會演的事件（R2）：enter，或不用走近、不是隨機的 auto；地點明確寫了那一區；不靠人物在場、在旁邊、玩家在哪一間（那些要到了現場才知道，走過去的時候再演）*/
  S.arriveEv=(e,z)=>!!e&&(e.trigger==='enter'||(e.trigger==='auto'&&!e.near))&&e.random_weight===undefined&&!e.npcPresent&&!e.npcNear&&!e.npcRoom&&!e.room&&!!e.location&&e.location!=='any'&&[].concat(e.location).includes(z);
  /* 路上第一個要停的地方：照路線順序，每一區「到那裡的時間」照 goPlan 的算法倒推（剩下的路程＝從那一區到教室；到那裡＝現在＋總路程−剩下的），
     把時間、地點放到那一刻問 EVENTS.check；有到達時就會演的【固】【必】就停。回傳 {zone, spawn, leg（分鐘）, ev} 或 null */
  S.routeStop=function(GM,it,pl,o){ o=o||{}; const G=GM.G; if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!EVENTS.check||!pl||!pl.d) return null; /* 經濟系事件接事件（D102）：S.oneTick 不跑，停下來以後「繼續去上課」出不來＝不在路上停（BB-B 11-01 讀碼）*/ const d=pl.d;
    const via=o.fromHome?['campus'].concat(S.routeVia('campus',d.zone)).filter(z=>z!==d.zone):S.routeVia(G.zone,d.zone); if(!via.length) return null;   /* 從家（DL-05）：捷運＋公車到校園 */
    const rest=(z,spot)=>{ if(z===d.zone) return 0; let m=z==='linze'&&d.zone==='classroom'?3:S.travelMinutes(G,z,d.via,spot,d.pos)+(d.inner&&z!==d.via?3:0); if(pl.bike&&m>0) m=Math.max(5,Math.round(m/3.5/5)*5); return m; };
    for(let i=0;i<via.length;i++){ const z=via[i], spot=z==='campus'?(CAMPUS_AT[via[i+1]||d.zone]||CAMPUS_AT.linze):null, leg=Math.max(0,pl.mins-rest(z,spot));
      const ev=evAt(G,G.hour+leg/60,z,()=>STORY_EVENTS.find(e=>S.arriveEv(e,z)&&S.evGuard(e)&&EVENTS.check(e)));
      if(ev) return {zone:z,spawn:spot?Object.assign({},spot):undefined,leg,ev:ev.id}; }
    return null; };
  /* 快速前往（手機「地點」quickGo）的 R2（AA_160 3-2 R2；DL-04B 剩的那一項）：從現在的區域到 toZone 中間經過的區域，有到達時就會演的【固】【必】＝停在那裡演；
     演完不另外出「繼續」選單（玩家自己再按一次快速前往）。mins＝quickGo 算的總分鐘；bike＝騎車（照 goPlan 的換算）。經濟系事件接事件、約好的地方（force）不停。
     回傳 {zone, spawn, leg（分鐘）, ev} 或 null */
  S.routeStopTo=function(GM,toZone,mins,o){ o=o||{}; const G=GM.G; if(o.force||typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!EVENTS.check||!toZone) return null;
    const via=S.routeVia(G.zone,toZone); if(!via.length) return null;
    const rest=(z,spot)=>{ let m=S.travelMinutes(G,z,toZone,spot,null); if(o.bike&&m>0) m=Math.max(5,Math.round(m/3.5/5)*5); return m; };
    for(let i=0;i<via.length;i++){ const z=via[i], spot=z==='campus'?(CAMPUS_AT[via[i+1]||toZone]||null):null, leg=Math.max(0,(mins|0)-rest(z,spot));
      const ev=evAt(G,G.hour+leg/60,z,()=>STORY_EVENTS.find(e=>S.arriveEv(e,z)&&S.evGuard(e)&&EVENTS.check(e)));
      if(ev) return {zone:z,spawn:spot?Object.assign({},spot):undefined,leg,ev:ev.id}; }
    return null; };
  /* 這一堂課裡會演的事件（1-5、R1）：上課前（beforeClass）、下課後（afterClass）——只有去上課才會演；時間放到開始（上課前）、下課（下課後），地點放到教室那一區。
     人物在不在場景裡、在不在旁邊（npcPresent／npcNear／npcRoom）、玩家在哪一間（room）要到了教室才知道：預告時當作在（例：民總報告分組要以安在場）*/
  const guess=e=>EVENTS.check(Object.assign({},e,{npcPresent:null,npcNear:null,npcRoom:null,room:null}),{chain:true});
  S.classEvs=function(G,it){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!EVENTS.check||!it||!it.c||it.exam||it.c.kind==='service') return []; const d=destOf(it), z=d&&d.zone, out=[];
    const b=evAt(G,it.t0,z,()=>S.beforeClassPick(it,guess)); if(b) out.push(b);
    evAt(G,it.t1,z,()=>{ const ok=S.afterClassOk(it,guess), a=S.afterClassFirst(ok); if(a){ out.push(a); const a2=S.afterClassAlso(a,ok); if(a2) out.push(a2); } });
    return out; };
  /* 翹課確認那一行的說法（1-5：不寫劇情內容，只寫一般的說法；不寫人名、不寫台詞）。這裡沒有的：上課前的事／下課後的事 */
  S.MISS_TEXT={ ev_an_report_split:'同學的報告分組', ev_midterm_walkout:'考完試走出教室', ev_midterm_walkout_y1s2:'考完試走出教室', ev_midterm_walkout_y2:'考完試走出教室', ev_midterm_walkout_y2s2:'考完試走出教室',
    ev_sis_fam_hall:'家聚的邀約', ev_sis_fam_hall2:'家聚的邀約', ev_zhe_noodle_invite:'同學約吃晚餐', ev_bohan_score:'同學問作業的題目', ev_econ_hallway:'下課後在走廊遇到人', ev_sk03_lunch:'午餐的邀約',
    ev_p4_retake:'經原的第一堂', ev_p4b_familiar:'下課後同學的閒聊', ev_sk04_note1:'座位上的便利貼', ev_sk04_note2:'座位上的便利貼', ev_sk04_note3:'座位上的便利貼', ev_sk04_reveal:'座位上的便利貼',
    ev_sk02_spy:'上課前同學的閒聊', ev_sk03_xinci_class:'上課前同學的閒聊', ev_b4_left_an:'聊那天的演講', ev_peishan_table_later_class:'上課前同學找你', ev_ps_w1_room:'找教室', ev_ps_w1_notes:'同學借筆記',
    ev_mx_w1_addclass:'通識第一堂門口', ev_prof_zhou_y4_call:'老師找你', ev_yt_lease_text:'下課後的一則訊息', ev_an_ex_admin:'下課後聊課堂的內容', ev_yc_meet_after:'認識新同學',
    ev_jp_redo_civpro:'補修班', ev_jp_redo_insurance:'補修班' };
  S.missText=e=>S.MISS_TEXT[e.id]||(e.beforeClass?'上課前的事':'下課後的事');
  /* 「你會錯過：○○」：這一堂的【固】【必】，最多三件，同樣的說法只寫一次；沒有＝空陣列 */
  S.classMissList=function(G,it){ const L=[]; for(const e of S.classEvs(G,it)){ if(!S.evGuard(e)) continue; const t=S.missText(e); if(!L.includes(t)) L.push(t); } return L.slice(0,3); };
  /* 今天還有（1-2）：約好的見面、出遊，最多兩件 */
  S.todayMore=function(G){ const out=[], h=hr(G); for(const iv of (G.invites||[])) if(iv.day===G.day&&iv.accepted&&!iv.done&&iv.h>h) out.push([iv.h,iv.label||'約好的見面']);
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.state==='planned'&&q.day===G.day&&q.h>h) out.push([q.h,(q.title||q.place||'出遊')+'（時間到會跳出「出發」）']);   /* UX-GROUP-NOTICE-1018：玩家不知道約好的活動怎麼去 */
    return out.sort((a,b)=>a[0]-b[0]).slice(0,2).map(([t,l])=>hhmm(t)+' '+l); };
  const freeNow=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!P.seat&&!(GM.D&&GM.D.active)&&!GM.titleIdle&&!(P.path&&P.path.length); };   /* E.paused＝手機或選單開著：下課選單、起床選單不要跳在手機下面（flow_v0_to1017 9/19 卡住：選單在手機後面點不到）*/
  S.canGo=function(GM){ const why=S.canSkip(GM); if(why) return why; if(typeof HOME!=='undefined'&&HOME.rec&&HOME.rec(GM.G).at) return '你在家'; return ''; };
  /* 起床選單（1-2）*/
  S.wakeMenu=async function(GM){ const G=GM.G; /* 經濟系重考期的起床選單（AA_154 A39）*/ if(!S.wakeMenuOn(GM)||S.canGo(GM)) return false; const list=S.goList(G).filter(it=>!S.planSkip(G,it)); if(!list.length) return false; const it=list[0], exam=!!it.exam;   /* 期中、期末都一樣不給翹（AA_294 ①；原本只有期末）*/
    const pl=S.goPlan(GM,it); let k=-1; GM.sceneBegin(); try{
      await GM.say(null,'早安。今天的課：'+list.slice(0,3).map(q=>hhmm(q.t0)+'　'+q.c.name+'　'+(q.room.name||'')).join('　／　')); const more=S.todayMore(G); if(more.length) await GM.say(null,'今天還有：'+more.join('、'));
      /* 2026-11-11（BUG-GOCLASS-SKIPPED-1111，使用者 day57；BB）：前面已經翹掉的課要明講——小睡醒來的第二次起床選單，第一項已經是下一堂（原本什麼都沒說，使用者以為按的是早上那一堂）。系統提示，不是台詞 */
      { const sk=S.dayItems(G).filter(q=>S.planSkip(G,q)&&!S.rec(G).done[q.key]); if(sk.length) await GM.say(null,'已經翹掉：'+sk.map(q=>hhmm(q.t0)+' '+q.c.name).join('、')+'。（手機的「今天」可以反悔）'); }
      const opts=exam?[{t:'直接去考場：'+it.c.name,hint:S.planHint(GM,it,pl)},{t:'先起床',hint:'考試前 10 分鐘會自動帶你進考場'}]
                     :[{t:'直接去上課：'+(it.exam==='mid'?'期中練習：':'')+it.c.name,hint:hhmm(it.t0)+'，'+(it.room.name||'')+'。'+S.planHint(GM,it,pl)+(pl&&pl.depart-hr(G)>0.5?'。時間會直接跳到 '+hhmm(pl.depart)+' 出門':'')},   /* 離出門還有半小時以上：寫明時間會跳（第二次起床選單按下去直接從 10:30 跳到 13:00，使用者 day57）*/{t:'翹這堂課',hint:'記沒去，不扣分。這堂課裡的事你會錯過。'},{t:'先起床再說',hint:'手機的「今天」隨時可以直接去'}];
      k=await GM.choose(opts); } finally { GM.sceneEnd(); }
    if(k===0) await S.goClass(GM,it); else if(!exam&&k===1&&await S.skipClass(GM,it)){ const nx=S.goList(G).find(q=>!S.planSkip(G,q)), to=Math.min(10.5,nx?nx.t0-1/3:10.5);
      if(to>hr(G)+0.25){ let j=1; GM.sceneBegin(); try{ j=await GM.choose([{t:'再睡一下（睡到 '+hhmm(to)+'）'},{t:'起床'}]); } finally { GM.sceneEnd(); } if(j===0) await S.skipTo(GM,to,{nap:true}); } }   /* 小睡醒來 skipTo 會再排一次起床選單 */
    return true; };
  /* 翹課（1-5）：確認一句；記 plan_skip（手機寫「翹課」、30 分鐘提醒不出）；不加旗標、不改關係；期末考不能翹 */
  S.examName=it=>it&&it.exam==='mid'?'期中考':'期末考';
  S.skipClass=async function(GM,it,o){ const G=GM.G, flip=!!(o&&o.flip), SK=flip?0:1;   /* flip（BB 2026-11-11 CHOOSE_SCAN ①）：下課選單的「下一堂不去」在最下面，確認的最下面要是「還是去」——選單從下緣往上排，連點落在「從下面數同一個位置」；起床選單的「翹這堂課」是倒數第二個，所以照舊「還是去」在倒數第二 */ if(it.exam){ GM.toast(S.examName(it)+'不能翹。',3000); return false; }   /* 考試不給翹：期中、期末都一樣（AA_294 ①）*/ let k=1-SK; const miss=S.classMissList(G,it); GM.sceneBegin(); try{ await GM.say(null,'翹掉'+it.c.name+'？記「沒去」，不扣分。'); if(miss.length) await GM.say(null,'你會錯過：'+miss.join('、')+'。'); k=await GM.choose(flip?[{t:'翹'},{t:'還是去'}]:[{t:'還是去'},{t:'翹'}]); } finally { GM.sceneEnd(); }   /* 2026-11-11（BUG-GOCLASS-SKIPPED-1111，使用者 day57：連點把第一堂記成翹課）：「還是去」放第一個、「翹」第二個——連點落在第一個位置＝去上課，不是翹課（原本「翹」在第一個）*/   /* 這一堂課裡的【固】【必】（1-5、R1；DL-04B）*/
    if(k!==SK){ await S.goClass(GM,it); return false; } S.rec(G).note['plan_skip_'+it.key]=1; if(GM.autosave) GM.autosave(); return true; };
  /* 校外上課（教室 OFF：大四下「法律實習或法律扶助實務」，courses.js rooms.OFF offsite）：沒有 3D 的地點——2D 出門、時間跳到下課、記出席（同服務學習的做法）。
     那一天有旁白的（OFFSITE_LINES：fn(G,it)→一句或 null；例：AA_342 4-2 第 4 週 3/13，twfill3d.js）就說那一句。COURSE-PRACTICE-Y4-1024 */
  S.OFFSITE_LINES=[];
  S.OFFSITE_AFTER=[];   /* 那一句之後多說的旁白：fn(G,it,line)→一句、幾句或 null（例：AA_499 4-5 法扶實習的維倫，src/pool_more3d.js）*/
  S.goOffsite=async function(GM,it,o){ o=o||{}; const G=GM.G, R=S.rec(G), c=it.c; if(R.done[it.key]) return false;
    if(S.status(G,it)==='missed'){ GM.toast(c.name+'已經快結束了，現在去不算出席。',3600); return false; }
    let line=null; for(const f of S.OFFSITE_LINES){ try{ line=f(G,it)||line; }catch(e){ console.warn('CLS.OFFSITE_LINES',e); } }
    if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.leave) ACTIVITIES.leave(G);
    GM.sceneBegin(); try{ await GM.fade(true); GM.caption('','到'+(it.room.name||'校外')+'。',2400); await GM.sleep(500);
      if(line){ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:it.room.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(it.room.bg):'dark'}); await GM.fade(false); await GM.say(null,line);
        for(const f of S.OFFSITE_AFTER){ let x=null; try{ x=f(G,it,line); }catch(e){ console.warn('CLS.OFFSITE_AFTER',e); } for(const t of [].concat(x||[])) await GM.say(null,t); }
        if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); await GM.fade(true); }
      const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); R.done[it.key]=1; R.attend[c.id]=(R.attend[c.id]||0)+1; await GM.fade(false);
      GM.caption('',c.name+'：第 '+R.attend[c.id]+' 次。',2800);
    } finally { GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 直接去上課（1-3）*/
  S.goClass=async function(GM,it,o){ o=o||{}; const G=GM.G; if(S.rec(G).done[it.key]) return false; const why=o.forced||o.fromHome?'':S.canGo(GM); if(why){ GM.toast(why,3000); return false; }
    if(it.room&&it.room.offsite) return S.goOffsite(GM,it,o);   /* 校外（法律實習）：沒有地點，2D */
    delete S.rec(G).note['plan_skip_'+it.key]; let pl=S.goPlan(GM,it); if(!pl) return false; if(o.fromHome){ pl=Object.assign({},pl,{mins:o.mins||43,bike:false,mrt:true}); }   /* 從家出發（DL-05）：捷運＋公車；等待在 HOME.homeWake 做完了 */
    if(!o.forced&&!o.fromHome&&hr(G)<pl.depart-0.02&&pl.depart-hr(G)>0.06){ const ok=await S.skipTo(GM,pl.depart); if(!ok) return false; if(hr(G)<pl.depart-0.02){ contP={day:G.day,key:it.key}; return false; } pl=S.goPlan(GM,it); }   /* BUG-GOCLASS-WINDOW-1102（BB_218 6865）：離出門不到 3 分鐘＝直接出門（skipTo 對 3 分鐘以內的跳轉回 false，原本按了沒反應）。等待照跳過時間的規則（停點：約好的時間、特殊課堂、劇情）；停下來的話，劇情演完出「繼續去上課」*/
    if(S.status(G,it)==='missed'){ GM.toast(it.c.name+'已經快下課了，現在進去不算出席。',3600); return false; }
    const d=pl.d, pe=S.peGoClass(G,it); if(G.zone!==(pe?pe.zone:d.zone)||o.fromHome){   /* BUG-PE-CLASS-1107：體育課的目的地是體育館裡（球場中圈／游泳週 B1），不是校園門口 */ if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.leave) ACTIVITIES.leave(G);
      const stop=o.forced?null:S.routeStop(GM,it,pl,o);   /* 路上的事件（R2，DL-04B）：經過的區域有到達時就會演的【固】【必】＝停在那裡，照常進去讓事件演（STORY.onEnter→EVENTS.onEnter、auto 照 tick）；
                                                              演完 S.oneTick 出「繼續去上課」（contP），從那裡照 goPlan 接著走、時間照實際的算（可能因此遲到）。考試帶進考場（forced）不停 */
      if(stop){ GM.sceneBegin(); try{ await GM.fade(true); GM.caption('',(pl.mrt?'坐捷運、轉公車往':(pl.bike?'騎腳踏車往':'走路往'))+bldName(it)+'去。',2400); GM.advance(stop.leg/60); await GM.sleep(500); } finally { GM.sceneEnd(); }
        await GM.enter(stop.zone,stop.spawn); contP={day:G.day,key:it.key}; return false; }
      GM.sceneBegin(); try{ await GM.fade(true); GM.caption('',o.forced?S.examName(it)+'快開始了。你收拾東西往考場走。':(pl.mrt?'坐捷運、轉公車到':(pl.bike?'騎腳踏車到':'走路到'))+bldName(it)+'。',2400); GM.advance(pl.mins/60); await GM.sleep(500); } finally { GM.sceneEnd(); }
      if(pe) await GM.enter(pe.zone,{x:pe.x,z:pe.z,yaw:pe.yaw||0,lv:0}); else await GM.enter(d.zone); }
    if(pe) return S.attend(GM,it,{door:true,inGym:true,lateOk:!!o.forced});   /* 已經在體育館裡也一樣：館內 3D 背景上課（同門口 doorInteract 的 inGym）*/
    if(d.door) return S.attend(GM,it,{door:true,lateOk:!!o.forced});   /* 門口上課（萬才館研討室、法圖櫃台、服務學習、體育館）：不選座位 */
    return S.seatPick(GM,it,o); };
  /* 坐哪裡（1-3 第 5 點）：老位子（G.courses.seat[課程]）／坐在○○旁邊（在場、認識以上、旁邊有空位，最多兩位）／自己找位子 */
  S.rememberSeat=function(G,it,seat){ if(!it||!seat) return; const R=S.rec(G); if(!R.seat||typeof R.seat!=='object') R.seat={}; R.seat[it.c.id]={zone:G.zone,room:seat.room||null,x:+(+seat.x).toFixed(2),z:+(+seat.z).toFixed(2),lv:seat.lv|0}; };
  const seatFree=(E,st)=>!st.taken&&!E.npcs.some(n=>(n.seat||n.seatTarget)&&Math.hypot((n.seat||n.seatTarget).x-st.x,(n.seat||n.seatTarget).z-st.z)<0.35);
  S.seatChoices=function(GM,it){ const G=GM.G, E=GM.E, rm=it.room||{}; const its=E.interactables.filter(q=>q.seat&&(rm.room?q.seat.room===rm.room:G.zone==='classroom'));
    const free=its.filter(q=>seatFree(E,q.seat)); if(!free.length) return []; const R=S.rec(G), mem=R.seat&&R.seat[it.c.id]; const out=[];
    let home=mem&&mem.zone===G.zone?free.find(q=>Math.hypot(q.seat.x-mem.x,q.seat.z-mem.z)<0.3):null;
    if(home) out.push({t:'老位子',hint:'上次上'+it.c.name+'坐的地方',it:home});
    else { const cx=its.reduce((a,q)=>a+q.seat.x,0)/its.length, cz=its.reduce((a,q)=>a+q.seat.z,0)/its.length; home=free.slice().sort((a,b)=>Math.hypot(a.seat.x-cx,a.seat.z-cz)-Math.hypot(b.seat.x-cx,b.seat.z-cz))[0]; out.push({t:'坐中間的位子',hint:mem?'老位子有人坐了':'第一次上這門課',it:home}); }
    const stg=id=>typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id):'STRANGER'; const used=new Set([home]);
    for(const n of E.npcs){ if(out.length>=3) break; const id=n.charId||n.id; if(!n.seat||!id||!(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||stg(id)==='STRANGER') continue; if(rm.room&&n.seat.room!==rm.room) continue;
      const nb=free.filter(q=>!used.has(q)&&Math.hypot(q.seat.x-n.seat.x,q.seat.z-n.seat.z)<1.3&&(q.seat.lv|0)===(n.seat.lv|0)).sort((a,b)=>Math.hypot(a.seat.x-n.seat.x,a.seat.z-n.seat.z)-Math.hypot(b.seat.x-n.seat.x,b.seat.z-n.seat.z))[0];
      if(nb){ used.add(nb); out.push({t:'坐在'+(SOCIAL.displayName?SOCIAL.displayName(id):(CHARACTERS[id].name||id))+'旁邊',it:nb,who:id}); } }
    return out; };
  S.seatPick=async function(GM,it,o){ const G=GM.G, E=GM.E; if(E.zone&&(roomy(E.zone)||G.zone==='classroom')){ try{ S.syncRoom(GM); }catch(e){} }
    const ch=S.seatChoices(GM,it); if(!ch.length||!GM.seatMenu){ GM.toast('上課的教室：'+(it.room.name||'')+'（找個位子坐下）',4200); return false; }
    const k=0;   /* 不問坐哪裡（SEAT-NO-ASK-1110，使用者 11-10：「一鍵去上課的時候 不要再出現坐哪裡 隨便好嗎」、選擇題「先直接坐，占位子之後再加」）：所有去上課的路（手機的今天、上課提醒、下課的直接去下一堂、一鍵）都直接坐第一個＝老位子，沒有就中間的位子；想換位子自己走進教室坐。朋友幫忙占位子之後另外加（台詞歸 AA）。原本 o.autoSeat 只有一鍵（ONE-TAP-GO-1103）這樣 */
    await GM.seatMenu(ch[k].it,{autoClass:true}); return true; };
  /* 下課選單（1-4）：課後事件演完、玩家站起來以後；今天還有下一堂才出 */
  S.afterMenu=async function(GM,key,a){ const G=GM.G; if(S.canGo(GM)) return false;
    /* 118 巷課後午餐邀約（L118-LUNCH-INVITE-1111，X339；src/l118_lunch3d.js）：課後事件演完、下課選單出來以前，同堂認識的同學可能當面約去吃午餐；吃完（或婉拒）接著照常出下面的選單 */
    if(typeof LUNCH118!=='undefined'&&LUNCH118.afterClass){ try{ await LUNCH118.afterClass(GM,key,a); }catch(e){ console.warn('LUNCH118.afterClass',e); } if(S.canGo(GM)) return false; }
    const ate=typeof LUNCH118!=='undefined'&&!!LUNCH118.doneToday&&LUNCH118.doneToday(G);   /* 今天已經去 118 巷吃過午餐：不再出「先去吃飯，再去下一堂」*/
    const nx=S.goList(G).find(q=>q.key!==key&&!S.rec(G).done[q.key]&&!S.planSkip(G,q));
    if(!nx){ GM.caption('','今天的課上完了。',2600); return false; }
    const pl=S.goPlan(GM,nx), gap=(pl.depart-hr(G))*60; const go={t:'直接去下一堂：'+nx.c.name,hint:hhmm(nx.t0)+'，'+(nx.room.name||'')+'。'+S.planHint(GM,nx,pl),k:'go'};
    const opts=(gap>=60?[{t:'先去吃飯，再去下一堂',hint:'約 40 分鐘',k:'eat'},(sp=>({t:'在附近讀書，再去下一堂',hint:sp.ok?'讀到 '+hhmm(pl.depart)+' 出門。'+sp.hint:sp.why,dim:!sp.ok,k:'study'}))(S.slotPlan(G,Math.max(0.5,pl.depart-hr(G)),'study')),{t:'先自由活動',hint:'手機的「今天」隨時可以直接去',k:'free'},{t:'下一堂不去',k:'skip'}]
                      :[go,{t:'先自由活動',hint:'手機的「今天」隨時可以直接去',k:'free'},{t:'下一堂不去',k:'skip'}]).filter(q=>!(ate&&q.k==='eat'));
    let i=-1; GM.sceneBegin(); try{ i=await GM.choose(opts); } finally { GM.sceneEnd(); } const c=opts[i]&&opts[i].k;
    if(c==='go') await S.goClass(GM,nx); else if(c==='skip') await S.skipClass(GM,nx,{flip:true}); else if(c==='eat'){ if(await S.lunchBreak(GM)) await S.goClass(GM,nx); } else if(c==='study'){ if(opts[i].dim){ GM.toast(opts[i].hint,3000); return true; } if(await S.studyUntil(GM,nx,pl.depart)) await S.goClass(GM,nx); }
    return true; };
  /* 先去吃飯（1-4）：一頓飯 40 分鐘、照價錢扣錢（吃飯不扣時段次數）；只寫一般的場面（和誰一起吃、偶遇是第 5 節第二批）*/
  const MEALS=[{t:'小松',price:90,line:'小松的自助餐，夾了三樣菜。'},{t:'公館燒臘',price:100,line:'公館燒臘，一盤叉燒飯加一顆滷蛋。',bg:'noodle_table'},{t:'便利商店',price:75,line:'便利商店的微波義大利麵，在門口的桌子吃完。',bg:'cvs_table_day',bgNight:'cvs_table_night'}];   /* bg：吃飯那一段的 2D 背景（BUG-EAT-AFTER-CLASS-SCENE-1103）；小松／學活還沒有圖＝深色底＋地點字幕，不再停在教室 */
  /* 小福（AA_186 4-4：小福樓 2025/12/31 停業、2026/1/10 拆除重建）：經濟系那一年、大一上照常；大一下起改成活大的自助餐 */
  const mealsOf=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, id=t?t.id:(typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):null); return id&&!/^Y0/.test(id)&&id!=='Y1S1'?MEALS.map(m=>m.t==='小松'?{t:'學活',price:m.price,line:'學活的自助餐，夾了三樣菜。'}:m):MEALS; };
  /* AA_350 R2（AA_294 第 3 節「翹了經原下也還有機會」）：大一下那個週五沒去經原下、12:00～13:00 選了「先去吃飯→活大」＝ ev_sk03_lunch 在活大演（阿勳已經坐在那裡，不出選項）。
     其他條件照事件本身（EVENTS.check：大一下、週五、prereq 的 P4d／10-3／⑱ 和 SK03_ASKED）；那天放假（沒有經原下這一堂）、去上了經原下（走廊那一條演過）都不算 */
  S.sk03Huoda=function(G){ if(!G||(G.stage||'law')!=='law'||typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined'||!EVENTS.check) return null; const h=hr(G); if(h<12||h>=13) return null;
    const it=S.dayItems(G).find(q=>q.c&&q.c.id==='econ_principles_2'&&!q.exam); if(!it||S.rec(G).done[it.key]) return null;
    const ev=STORY_EVENTS.find(e=>e.id==='ev_sk03_lunch'); return ev&&EVENTS.check(ev)?ev:null; };
  /* 不問吃哪家（LUNCH-NO-ASK-1110，使用者 11-10：「下課選先去吃飯的時候 只有三家可以選 然後也不會真的去吃 可以不用特別問嗎」）：直接挑一家——
     學活的事件（SK03）還沒演＝學活；其他照錢夠的輪流（不連著同一家）；都不夠＝不吃。want：指定那一家（測試、劇情用）*/
  S.lunchPick=function(G,MEALS){ const ok=MEALS.filter(m=>G.money>=m.price); if(!ok.length) return null; if(S.sk03Huoda&&S.sk03Huoda(G)){ const h=ok.find(m=>m.t==='學活'); if(h) return h; }
    const last=G.flags&&G.flags.LUNCH_LAST, c=ok.length>1?ok.filter(m=>m.t!==last):ok; return c[((G.day|0)%c.length+c.length)%c.length]; };
  S.lunchBreak=async function(GM,want){ const G=GM.G, MEALS=mealsOf(G); G.flags=G.flags||{};
    const m=want?MEALS.find(x=>x.t===want):S.lunchPick(G,MEALS); if(!m){ GM.toast('錢不夠，先不吃了',2400); return false; } if(G.money<m.price){ GM.toast('錢不夠',2400); return false; } G.flags.LUNCH_LAST=m.t;
    const sk=m.t==='學活'?S.sk03Huoda(G):null; if(sk){ GM.sceneBegin(); try{ await GM.fade(true); GM.money(-m.price); await GM.fade(false); } finally { GM.sceneEnd(); } G.flags.SK03_HUODA=G.day; await EVENTS.run(sk); return true; }   /* 時間：事件的 after 快轉到 13:00「午休結束。」*/
    /* BUG-EAT-AFTER-CLASS-SCENE-1103（使用者 11-03：「上課完去吃飯居然扣錢和吃飽 場景都是教室」）：吃飯那一段換到那家店（2D 背景＋地點字幕），吃完再出發去下一堂；原本只淡出淡入、人一直在教室 */
    const bgKey=(hr(G)>=18&&m.bgNight)||m.bg, bg=bgKey&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(bgKey):'dark';
    GM.sceneBegin(); try{ await GM.fade(true); GM.money(-m.price); GM.advance(40/60); if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:bg}); GM.caption('',m.t,2400); await GM.fade(false); await GM.say(null,m.line); if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); } finally { GM.sceneEnd(); } return true; };
  /* 在附近讀書（1-4）：讀到出門時間；每小時一份準備給下一堂（和自學同一個 prep，AA_104 4-3）。時段次數（DL-03）做好以後算一次自習 */
  S.studyUntil=async function(GM,nx,until){ const G=GM.G, h0=hr(G); if(until<=h0+0.1) return true; if(S.slotPlan){ const sp=S.slotPlan(G,until-h0,'study'); if(!sp.ok){ GM.toast(sp.why,3000); return false; } S.slotUse(G,sp.uses); }   /* 算一次自習（DL-03）*/ const R=S.rec(G), hrs=Math.max(1,Math.floor(until-h0)); GM.sceneBegin(); try{ await GM.fade(true); GM.advance(until-h0); R.prep[nx.c.id]=(R.prep[nx.c.id]||0)+hrs; R.lastStudy={day:G.day,id:nx.c.id,name:nx.c.name}; if(G.stats) G.stats.study=(G.stats.study||0)+hrs; GM.caption('','你找了個位子，把'+nx.c.name+'這週的進度讀到 '+hhmm(hr(G))+'。',2800); await GM.sleep(600); await GM.fade(false); } finally { GM.sceneEnd(); } return true; };
  /* 開學第二天的民總（劇情課：story3d.js 的 classScene，進 201 就開始）不能翹（AA_294 第 1 節第 1 列、第 3 節「時間到了直接帶去」，任務 AA294-SKIPCLASS-1018）：
     法律系主線第 2 天（週四）12:30～15:12 還沒上（classDone）、玩家空下來，就帶過去。還沒演過霖澤館前那一段（campusIntro：阿哲；新局 9/4 的初遇也在那裡，
     AA_294 ev_zhe_w1_meet 那一列靠它）先帶到校園，演完再帶進 201；人已經在 201（12:30 以前就進來了）＝重新進一次，照舊開始上課 */
  S.day2Due=function(G){ if(!G||late(G)||typeof STORY==='undefined'||!STORY.mainDay||STORY.mainDay(G)!==2) return false; const F=G.flags||{}, h=hr(G);
    return G.weekday===4&&!F.classDone&&!F.classNow&&h>=12.5&&h<15.2; };
  /* UX-DAY2-AUTOPULL（BB 15:34，CC 在使用者電腦量到：阿哲那一段演完 2.83 秒就被帶走）：還沒演阿哲那一段＝照舊（空下來 1.5 秒就帶到霖澤館前）；
     演過了（campusIntro）＝等到上課前 5 分鐘（13:15）而且空下來 S.DAY2_GRACE_MS 才帶進 201，帶之前字幕寫「快上課了。」；玩家自己走進 201 就照舊開始上課（story3d.js onEnter），不用帶。「民總不能翹」不變 */
  S.DAY2_GRACE_MS=8000; S.DAY2_PULL_H=13+15/60;
  S.day2PullReady=function(G,freeMs){ const F=G.flags||{}; if(!F.campusIntro) return true; return hr(G)>=S.DAY2_PULL_H&&freeMs>=S.DAY2_GRACE_MS; };
  S.goDay2=async function(GM){ const G=GM.G, F=G.flags||{}; if(!S.day2Due(G)) return false; const to=F.campusIntro?'classroom':'campus';   /* 已經在那一區也重新進一次：進區域才會開始那一段（story3d.js S.onEnter）*/
    GM.sceneBegin(); try{ await GM.fade(true); GM.caption('',to==='classroom'?'快上課了。走路到法律系館A 201。':'走路到法律系館A。',2400); await GM.sleep(500); } finally { GM.sceneEnd(); } await GM.enter(to,to==='campus'?{x:26,z:-90,yaw:Math.PI}:undefined);   /* 霖澤館前（和舊局第二天 13:05 同一個位置；阿哲 12:30～13:24 在 (30,-93)，story3d.js populate）*/
    return true; };
  /* 每 0.5 秒（S.tick）：待出的選單；期末考到時間（開始前 10 分鐘）自動帶進考場（AA_126 1-1）*/
  S.oneTick=function(GM){ const G=GM.G; if(!G||goBusy) return; /* 經濟系事件接事件（D102）：不跳「去上課」「起床」選單，由 ECONFF 帶 */ if(typeof PG!=='undefined'&&PG.on&&PG.on(G)) return;   /* 畢業後篇（src/postgrad3d.js）：不再跳去上課、考試 */ if(!freeNow(GM)){ freeSince=0; freeTicks=0; return; } if(!G.goal||G.goal==='—'){ const nx=S.next(G); if(nx&&nx.exam) S.setGoal(GM); }   /* UX-EXAMDAY-GOAL：考試日起床劇情演完、目標欄空著（—）＝補上考試的目標 */ const now=Date.now(); if(!freeSince) freeSince=now; freeTicks++; if(now-freeSince<FREE_MS||freeTicks<3) return;   /* 連續空下來 1.5 秒、而且至少 3 次 tick：這一區的 auto／enter 事件先檢查過（低幀率時一幀可能就超過 1.5 秒）*/
    const run=f=>{ goBusy=true; (async()=>{ try{ await f(); }catch(e){ console.warn('oneclick',e); } finally{ goBusy=false; freeSince=0; freeTicks=0; } })(); };
    if(!opening(G)&&!late(G)){ const ex=S.dayItems(G).find(q=>q.exam&&!S.rec(G).done[q.key]&&S.status(G,q)==='open'&&hr(G)>=q.t0-1/6); if(ex&&!S.canGo(GM)){ run(()=>S.goClass(GM,ex,{forced:true})); return; } }   /* 期中、期末都帶進考場（AA_294 ①；原本只有期末）*/
    if(S.day2Due(G)&&S.day2PullReady(G,now-freeSince)){ run(()=>S.goDay2(GM)); return; }   /* 開學第二天的民總（AA_294 ①）；阿哲那一段演完以後等到上課前 5 分鐘、而且空下來 8 秒（UX-DAY2-AUTOPULL）*/
    if(contP){ const c=contP; contP=null; if(c.day===G.day){ const it=S.dayItems(G).find(q=>q.key===c.key); if(it&&!S.rec(G).done[it.key]&&S.status(G,it)!=='missed'){ run(async()=>{ let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:'繼續去上課：'+it.c.name,hint:S.planHint(GM,it)},{t:'先不去了'}]); } finally { GM.sceneEnd(); } if(k===0) await S.goClass(GM,it); }); return; } } }
    if(afterP&&now-(afterP.t||0)>=WAKE_GRACE){ const a=afterP; afterP=null; if(a.day===G.day){ run(()=>S.afterMenu(GM,a.key,a)); return; } }   /* 下課選單也排在這一區的 auto／enter 事件之後（AA_160 3-4 C，AA-B 10-16：例 週五 12:06 普通的芷若 ev_zhiruo_ge_group）*/
    if(wakeP&&now-wakeP.t>=WAKE_GRACE){ const w=wakeP; wakeP=null; if(S.wakeFresh(G,w)) run(()=>S.wakeMenu(GM)); } };

  // ---------- 時段次數制（DL-03，AA_160 第 2 節；取代體力）----------
  /* 一天三個時段：上午（起床～12:00）、下午（12:00～18:00）、晚上（18:00～睡覺；過了午夜還是晚上）。
     DEC-SLOTS-1018（使用者 10-23 選擇題 ③「每個時段只能做一件主要的事（上課、約會、打工這類），小事（吃飯、聊天）不限」；取代 AA_160 第 2 節的上午 1、下午 2、晚上 2）：
     每個時段 1 件主要的事。主要的事：上課、考試、社團與活動、出遊與校外約會、打工（S.slotFill／S.slotFillSpan 填滿那個時段）；自習（一段 1～3 小時或「讀到○○前」只算 1 件）、
     自由出行、健身（S.slotPlan 先問、S.slotUse 扣）。（ACTION-BUDGET-1107，使用者 11-07：約好的見面也算一件，INV.spendSlot）上課、考試、活動、約好的出遊、約好的見面和打工永遠不被擋（時段用過了照樣能去，去了就填滿）；吃飯、聊天、劇情、睡覺不算（約好的見面 2026-11-07 起也算一件，INV.spendSlot）。
     考試週（期中練習週、期末考週）每個時段多 1 次，只能拿來自習（照舊）。跨進下一個時段 30 分鐘以上，下一個時段也算。
     存檔 G.slots={day,used:{am,pm,ev}}，換日歸零（讀的時候發現 day 不同就重算）；舊存檔沒有＝今天都還沒用。第一、二天（開場劇情）不算 */
  S.SLOT_BASE={am:1,pm:1,ev:1}; S.SLOT_NAME={am:'上午',pm:'下午',ev:'晚上'};
  S.slotsOn=G=>!!G&&!opening(G);
  S.periodAt=t=>t<12?'am':(t<18?'pm':'ev');
  S.examWeek=G=>{ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !!(t&&t.exam); };
  /* AA_638 ①-4（取代 AA_126 1-1）：出遊（一日遊、兩天一夜、遠程自由出遊、去她的縣市）只擋「自己有考試的那一天」和「前一天」；考試週裡沒考試的日子照一般日子 */
  S.examNear=(G,d)=>{ if(d==null) d=G.day; const has=x=>(S.dayItems(G,x)||[]).some(it=>it.exam); try{ return has(d)||has(d+1); }catch(e){ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null; return !!(t&&t.exam); } };
  S.EXAM_NEAR_WHY='那幾天有考試。';
  S.slotRec=G=>{ if(!G.slots||typeof G.slots!=='object'||G.slots.day!==G.day||!G.slots.used) G.slots={day:G.day,used:{am:0,pm:0,ev:0}}; return G.slots; };
  S.slotCap=(G,p,kind)=>S.SLOT_BASE[p]+(kind==='study'&&S.examWeek(G)?1:0);
  S.slotLeft=(G,p,kind)=>Math.max(0,S.slotCap(G,p,kind)-(S.slotRec(G).used[p]||0));
  S.slotPlan=function(G,hours,kind){ if(!S.slotsOn(G)) return {ok:true,uses:[],hint:''}; const t0=G.hour, t1=t0+hours, p0=S.periodAt(t0); const uses=[p0]; const ns=p0==='am'?12:(p0==='pm'?18:null); if(ns!=null&&t1-ns>=0.5-1e-6) uses.push(S.periodAt(ns));
    for(const p of uses){ if(S.slotLeft(G,p,kind)<=0) return {ok:false,uses,why:p===p0?'這個'+S.SLOT_NAME[p]+'已經排滿了（'+(S.slotRec(G).used[p]||0)+'／'+S.slotCap(G,p,kind)+'）':S.SLOT_NAME[p]+'已經排滿了'}; }
    return {ok:true,uses,hint:uses.length>1?'用掉'+uses.map(p=>S.SLOT_NAME[p]).join('、')+'各 1 次':'用掉'+S.SLOT_NAME[p0]+' 1 次（還剩 '+(S.slotLeft(G,p0,kind)-1)+'）'}; };
  S.slotUse=(G,uses)=>{ if(!S.slotsOn(G)||!uses) return; const R=S.slotRec(G); for(const p of uses) R.used[p]=(R.used[p]||0)+1; };
  /* 時段次數用完就到下一個時段（使用者 2026-10-16：「下午還剩 0 次，就應該跳晚上」）：讀書、運動這類主要活動做完，那個時段（上午、下午）的次數用完 → 跳到下一個時段開始（12:00、18:00）。
     今天在那之前還有沒上的課：只跳到上課前 10 分鐘；約好的時間、特殊課堂、自動劇情、閉館照 skipStops 停。晚上用完：2026-11-07 起直接回去睡（S.eveSleep，使用者選擇題）。走路、移動（freetrip）不觸發。 */
  S._jump=null; const jumpG=new WeakMap();   /* 排跳轉的是哪一局（BUG-LOAD-INVITE-LEAK-1107，CC-B 11-07 19:1x：咖啡廳約會演完排了「下午用完、跳到 18:00」，馬上讀 13:48 的檔，新的一局 2.5～4.5 秒後跳到 18:00）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['classes3d:jump']=()=>{ S._jump=null; };   /* 讀檔、開新遊戲：上一局排的跳轉不帶過去 */
  S.queueJump=G=>{ if(!S.slotsOn(G)) return; const p=S.periodAt(hr(G)); if((p==='am'||p==='pm'||p==='ev')&&S.slotLeft(G,p,'study')<=0) { S._jump={day:G.day,p}; jumpG.set(S._jump,G); } };   /* ev：使用者 11-07 選「直接跳到隔天早上」（ACTION-BUDGET-1107）*/
  S.jumpTarget=function(G,p){ const h0=hr(G), B=p==='am'?12:18; let t=B; for(const it of S.dayItems(G)){ if(S.status(G,it)==='done'||S.storyClass(G,it)) continue; if(it.t0>h0+1/6&&it.t0-1/6<t) t=it.t0-1/6; } return t; };
  /* 晚上用完（ACTION-BUDGET-1107；使用者 11-07 選擇題「直接跳到隔天早上」）：今天後面沒有約好的見面、出遊、還沒上的課＝直接回去睡（ONETAP 的「回去睡覺」：宿舍、家、日本、美國照住的地方），
     後面還有約＝不跳（約好的照樣能去，去完再看）；回不去（ONETAP.sleepPlan 不行：劇情中、回不了家…）＝不跳 */
  S.laterToday=function(G){ const h0=hr(G); if((G.invites||[]).some(iv=>iv&&iv.day===G.day&&(iv.state==='accepted'||iv.state==='going')&&iv.h>h0-0.25)) return true;
    for(const it of S.dayItems(G)){ if(S.status(G,it)==='done'||S.status(G,it)==='missed'||S.storyClass(G,it)) continue; if(it.t0>h0) return true; }
    if(typeof DATE!=='undefined'&&DATE.tripAt&&DATE.tripAt(G,G.day,h0+0.1,3)) return true; return false; };
  S.eveSleep=async function(GM){ const G=GM.G; if(S.laterToday(G)||typeof ONETAP==='undefined'||!ONETAP.sleepPlan||!ONETAP.goSleep) return false; const pl=ONETAP.sleepPlan(GM); if(!pl||!pl.ok) return false;
    if(GM.toast) GM.toast('晚上的時間用完了，回去睡覺。',3000); await ONETAP.goSleep(GM,pl); return true; };
  S.afterSlot=async function(GM){ const G=GM.G, J=S._jump, JG=J?jumpG.get(J):null; if(!J||!G||J.day!==G.day||(JG&&JG!==G)){ S._jump=null; return false; }   /* JG：別的一局排的（讀檔前的舊流程）＝丟掉 */ const p=S.periodAt(hr(G)); if(p!==J.p){ S._jump=null; return false; } if(S.canSkip(GM)) return false;   /* 現在不能跳（對話中、busy）＝留著，等空下來再跳（ACTION-BUDGET-1107：BB-B 非考試週約好的見面演完沒跳）*/ S._jump=null;
    if(p==='ev') return S.eveSleep(GM);
    const t=S.jumpTarget(G,p); if(t<=hr(G)+0.05) return false; return S.skipTo(GM,t,{why:S.SLOT_NAME[p]+'的時間用完了'}); };
  S.slotFill=(G,p)=>{ if(!S.slotsOn(G)) return; const R=S.slotRec(G); R.used[p]=Math.max(R.used[p]||0,S.slotCap(G,p,'job')); };
  /* 一段固定行程（上課、活動、出遊）從 a 到 b（今天的小時數，可以超過 24）：開始的時段＋跨進 30 分鐘以上的下一個時段都填滿（DEC-SLOTS-1018 ③）*/
  S.slotFillSpan=function(G,a,b){ if(!S.slotsOn(G)||a==null||b==null) return; a=Math.max(a,0); if(b<=a) b=a; const P=[S.periodAt(a)]; for(const ns of [12,18]) if(ns>a&&b-ns>=0.5-1e-6) P.push(S.periodAt(ns)); for(const p of new Set(P)) S.slotFill(G,p); };   /* 約好的打工（家教，AA_163）：次數用完也照樣能去；去了以後那個時段不能再開始別的主要活動 */
  S.slotLine=G=>{ if(!S.slotsOn(G)) return ''; const R=S.slotRec(G), ex=S.examWeek(G); return ['am','pm','ev'].map(p=>{ let s=''; const n=S.SLOT_BASE[p]+(ex?1:0); for(let i=0;i<n;i++) s+=i<(R.used[p]||0)?'●':'○'; return S.SLOT_NAME[p]+' '+s; }).join('　'); };
  S.slotHTML=G=>{ if(!S.slotsOn(G)) return ''; const R=S.slotRec(G), ex=S.examWeek(G); return '<div class="item"><b>今天的時間</b>　'+['am','pm','ev'].map(p=>{ let s=''; const b=S.SLOT_BASE[p], n=b+(ex?1:0); for(let i=0;i<n;i++){ const c=i<(R.used[p]||0)?'●':'○'; s+=i>=b?'<span style="color:#e9b96a">'+c+'</span>':c; } return esc(S.SLOT_NAME[p])+' '+s; }).join('　')+'<div class="muted">每個時段一件主要的事：上課、社團活動、出遊約會、自習、打工、自由出行、健身都算一件（上課、約好的出遊照樣能去）；約好的見面也算一件（約好的照樣能去）；吃飯、聊天不算。'+(ex?'考試週：每個時段多一次（金色），只能拿來自習。':'')+'</div>'+'</div>'; };
  /* 下一件固定行程（「讀到○○前」）：下一堂課的出門時間、約好的見面前 10 分鐘 */
  /* 不能錯過的固定行程（課表以外，別的模組加：fn(G)→[{t:出發／該停下來的時間, start:開始, until:過了就算沒去, label}]，都是今天的小時）。
     讀書長度（studyLengths：跨過 start 的變灰、寫「會錯過：label」）、「讀到○○前」（nextFixed：停在 t）、一鍵總複習（spanCheck 的 hard）都看。
     D118 大四下補考（BUG-MAKEUP-STUDY-NOWARN-1102，BB 08:59；src/faildelay3d.js）。跳過時間（skipTo）照舊看 S.STOP_FNS */
  S.HARD_FNS=[];
  S.hardItems=function(G){ const out=[]; for(const f of S.HARD_FNS){ try{ for(const x of (f(G)||[])) if(x&&x.start!=null) out.push(x); }catch(e){ console.warn('CLS.HARD_FNS',e); } } return out; };
  S.hardMiss=(G,h,hh)=>S.hardItems(G).filter(x=>(x.until!=null?x.until:x.start)>h&&h+hh>x.start+1e-6).map(x=>x.label);   /* 從 h 起做 hh 小時會跨過開始時間 */
  S.nextFixed=function(GM){ const G=GM.G, h=G.hour; if(h>=24) return null; const c=[]; for(const it of S.goList(G)){ if(S.planSkip(G,it)) continue; const pl=S.goPlan(GM,it); c.push({t:pl?pl.depart:it.t0-1/6,label:it.c.name}); }   /* 正在上的課（出門時間已過）跳過，看下一堂 */
    for(const x of S.hardItems(G)) c.push({t:x.t!=null?x.t:x.start,label:x.fixLabel||x.label});   /* HARD_FNS（補考）：「讀到補考前」*/
    for(const iv of (G.invites||[])) if(iv.day===G.day&&iv.accepted&&!iv.done&&iv.h>h) c.push({t:iv.h-1/6,label:iv.label||'約好的見面'});
    return c.filter(q=>q.t>h+0.25).sort((a,b)=>a.t-b.t)[0]||null; };
  /* 自習要讀多久（2-3）：1～3 小時，或讀到下一件固定行程前（最多 3 小時）；次數不夠、閉館前讀不完的變灰；中間會錯過的課寫出來（R1）*/
  S.studyLengths=function(GM){ const G=GM.G, h=G.hour; const ow=typeof PLACES!=='undefined'?PLACES.hours[G.zone]:null; const close=ow?(ow.rules?(PLACES.windowOf(G.zone,G.day,h)||[0,0])[1]:(ow.close!=null&&ow.close<=24?ow.close:null)):null;
    const miss=hh=>S.dayItems(G).filter(it=>S.status(G,it)!=='done'&&!S.planSkip(G,it)&&!S.storyClass(G,it)&&it.t0<h+hh&&it.t1-LATE_END>h&&!(h>it.t0+WIN1)).map(it=>hhmm(it.t0)+' '+it.c.name);
    const one=(t,hh)=>{ const pl=S.slotPlan(G,hh,'study'); let dim=!pl.ok, hint=pl.ok?pl.hint:pl.why; if(!dim&&close!=null&&h+hh>close+1e-6){ dim=true; hint='閉館前讀不完'; } if(!dim&&h+hh>26.5){ dim=true; hint='太晚了'; }
      if(!dim){ const hm0=S.hardMiss(G,h,hh); if(hm0.length){ dim=true; hint='會錯過：'+hm0.join('、'); } }   /* 補考這種不能錯過的（HARD_FNS）：變灰，不是只提醒 */ const m=dim?[]:miss(hh); return {t,hours:hh,dim,hint:hint+(m.length?'。會錯過：'+m.join('、'):''),uses:pl.uses}; };
    const out=[1,2,3].map(hh=>one('讀 '+hh+' 小時',hh)); const fx=S.nextFixed(GM); if(fx){ const hh=Math.round((fx.t-h)*60)/60; if(hh>=0.5&&hh<=3+1e-6) out.push(one('讀到'+fx.label+'前（'+hhmm(fx.t)+'）',hh)); }
    return out; };
  /* 從現在起讀 hh 小時：閉館前讀不完（closed）、會錯過的課（miss）、其中的考試（exam）——和 studyLengths 同一套判斷（D118-B3 一鍵總複習用，study3d.js STUDY.reviewCheck）。o.noClose：不看閉館（在家）*/
  S.spanCheck=function(G,hh,o){ o=o||{}; const h=G.hour; const ow=!o.noClose&&typeof PLACES!=='undefined'&&PLACES.hours?PLACES.hours[G.zone]:null; const close=ow?(ow.rules?(PLACES.windowOf(G.zone,G.day,h)||[0,0])[1]:(ow.close!=null&&ow.close<=24?ow.close:null)):null;
    const its=S.dayItems(G).filter(it=>S.status(G,it)!=='done'&&!S.planSkip(G,it)&&!S.storyClass(G,it)&&it.t0<h+hh&&it.t1-LATE_END>h&&!(h>it.t0+WIN1));
    return {closed:close!=null&&h+hh>close+1e-6,miss:its.map(it=>hhmm(it.t0)+' '+it.c.name),exam:its.filter(it=>it.exam==='final').map(it=>hhmm(it.t0)+' '+it.c.name),hard:S.hardMiss(G,h,hh)}; };   /* hard：HARD_FNS（補考）——呼叫的地方當成不能做 */
  /* 選讀多久；回傳 {hours,uses} 或 null（算了、變灰的選項）。呼叫的地方讀完再 S.slotUse */
  S.chooseStudy=async function(GM){ const L=S.studyLengths(GM); const opts=L.map(q=>({t:q.t,hint:q.hint,dim:q.dim})).concat([{t:'算了'}]); const i=await GM.choose(opts); const q=L[i]; if(!q) return null; if(q.dim){ GM.toast(q.hint.replace(/。會錯過.*$/,''),3000); return null; } return {hours:q.hours,uses:q.uses}; };
  /* 門口上課（o.door、不是館內 3D 的體育課）：這一堂演的期間 doorIt＝這一堂，反應句、obs 回話照作息判斷同學在不在（見 reactOK 上面）*/
  { const a0=S.attend; S.attend=async function(GM,it,o){ const prev=doorIt; doorIt=(o&&o.door&&!o.inGym)?it:null; try{ return await a0.apply(this,arguments); } finally { doorIt=prev; } }; }
  return S;
})();
