/* 大四下被當的延畢（D14-T5B；AA_421 第 1 節，企劃線 42c87f4f，AA-B 2026-10-23；台詞一字不改）
   - 誰：2029-06-18 大四下成績單（CLS.showGrades 'Y4S2'）出來的那一刻，大四下有一門不及格（含大四下的重修又被當；照 classes3d.js 的被當規則）。
     記 FAIL_DELAY_COURSES＝[課 id…]；沒有交換的記 FAIL_DELAY＝true（交換路線又被當的：本來就延畢，只是大五上多那一門重修）。
   - 從那一刻起 PG.delayed 成立（2029 不考、2030 問報名、日期卡照延畢）；「只屬於交換」的句子用 PG.exchDelayed 擋（postgrad3d.js、termend3d.js、r2y4b3d.js、y5s1_3d.js）。
     6/2 典禮照一般畢業生（那天沒有人知道，包括他自己）；6/3～6/17 的日期卡照一般畢業生。
   - D118 補考（使用者 2026-11-02 05:0x 選擇題 Q4，D118_PLAN 第 10 節）：大四下被當的全部是「考五題的法律課」（CLS.isExamCourse）＝6/18 不延畢，
     改排一次補考（S.MK_AT：2029-06-26（二）10:00，法律系館A）；FAIL_DELAY_COURSES 記 []、FD_MAKEUP＝{v,courses,status:'pending'}。補考結果出來以前＝還沒確定延畢
     （PG.delayed 不成立、BAR_REG 不動、日期卡照一般畢業生）。補考全部過＝照常畢業；有一門沒過、或那天沒去＝那時才照下面的延畢（FAIL_DELAY_COURSES＝沒過的那幾門）。
     被當的課裡有一門不是考五題的課（看出席的課：沒有考試可以補）＝照舊 6/18 直接延畢（全部被當的課都記進 FAIL_DELAY_COURSES，不排補考）。交換路線照舊（本來就延畢）。
   - 6/18 成績單之後：旁白兩句；已經報名 2029 國考的多一句、BAR_REG＝false；22:00 阿哲私訊兩則。
   - 大五上：重修那一門在原本的時段（衝堂換時段），今日頁、家裡選單「重修：{課名}」＋一鍵上課（y5s1_3d.js 的 classItems 讀 FD.items）；
     第一次上課，課名字卡後面老師一句；沒有期末考，及格＝出席三堂以上（12/24 算）。不到三堂：證書延到 2030-06（FAIL_DELAY_CERT）；
     AA_471 第 5 節：12/26（三）09:00 旁白兩句、2030-06-17（一）10:00 系辦領證書（PG.STEPS fd_late_note、fd_late_cert；6 月的日期卡 06-18 起）。
   - 畢業後篇的成績單：大四下的成績在 6/18 一定要發（PG 的跳日期停在 6/18 09:00；CLS.morning 已經發過就不再發）。 */
const FD=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const exch=G=>law(G)&&typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G);
  S.LINES={ fail:'（{課名}，不及格。）', cert:'（證書要等下學期。九月，你要回學校重修。）', bar:'（今年的國考，考不成了。明年再報。）',
    zhe:['聽說了','九月我還在總圖 B1 你來，我幫你占位子'], teacher:'延畢的同學，期末交一份報告就好。……課要來。',
    plan1:'（這學期，只要重修{課名}。其他的日子——）', plan2:'（這學期，要重修兩門課。其他的日子——）',
    lateNote:['（{課名}的重修，出席不到三堂。）','（證書，要等到六月。）'], lateCert:'延了兩個學期。……這次是真的恭喜。' };   /* AA_471 第 5 節（企劃線 763993620）：12/26（三）09:00 旁白兩句；2030-06-17（一）10:00 系辦助教那一句 */
  S.on=G=>law(G)&&!!(G.flags&&G.flags.FAIL_DELAY);   /* 被當延畢（沒有交換）*/
  /* 大五上有重修、重修的規則照被當延畢（BB 10:21 判定：交換延畢又被當的一樣——不到三堂證書延到六月、畢業後篇跳日期停在上課前）：被當延畢，或交換路線 FAIL_DELAY_COURSES 有課（法律實習不算）*/
  S.retakeOn=G=>S.on(G)||(exch(G)&&S.courses(G).some(id=>id!=='legal_practice'));
  /* BUG-Y4S2-NOFINAL-1102（BB_218 6879）：舊版大四下沒有期末考日，考五題的課一律算缺考 → 6/18 誤判延畢。讀檔時救：
     FAIL_DELAY_COURSES 裡「考五題、大四下沒有期末考紀錄」的拿掉；拿光了就取消延畢；國考報名是被延畢取消的（BARCANCEL）才恢復。
     沒有 BARCANCEL 的更舊存檔分不出報名是自己沒報還是被取消，照舊不動、記 FD_RESCUE_BAR_UNKNOWN（交 BB／AA 定）*/
  S.migrate=function(s){ const F=s&&s.flags; if(!F||!Array.isArray(F.FAIL_DELAY_COURSES)||!F.FAIL_DELAY_COURSES.length||F.FD_RESCUE_NOFINAL||(F.FAIL_DELAY_V|0)>=2) return false;   /* BB 06:46 ①：修好以後判的延畢（V2）不救——玩家真的沒去考就照規定延畢 */
    if(typeof CLS==='undefined'||!CLS.isExamCourse||!CLS.byId||!CLS.termCourses) return false; const R=s.courses&&typeof s.courses==='object'?s.courses:(s.courses={}), E=R.exam&&typeof R.exam==='object'?R.exam:(R.exam={});
    const y4s2=new Set(CLS.termCourses(s,'Y4S2').map(c=>c.id));   /* BB 06:46 ②：只救大四下有排的課（含排在大四下的重修：舊版重修的期末考一樣沒有日子）*/
    const bogus=F.FAIL_DELAY_COURSES.filter(id=>{ if(!y4s2.has(id)) return false; const c=CLS.byId(id)||CLS.termCourses(s,'Y4S2').find(x=>x.id===id); if(!c||!CLS.isExamCourse(c)) return false; const e=E['Y4S2:'+id+':final']; return !e||e.status!=='done'; });
    if(!bogus.length) return false; F.FD_RESCUE_NOFINAL=bogus.slice(); F.FAIL_DELAY_COURSES=F.FAIL_DELAY_COURSES.filter(id=>!bogus.includes(id));
    R.grades=R.grades&&typeof R.grades==='object'?R.grades:{}; const g=R.grades.Y4S2&&typeof R.grades.Y4S2==='object'?R.grades.Y4S2:null;   /* BB 06:46 ③：成績單不能留「缺考」；期末考沒辦法補算＝「及格（期末考補登）」；期末紀錄記 rescued，之後 failedIn 不再算它不及格 */
    for(const id of bogus){ E['Y4S2:'+id+':final']=Object.assign({},E['Y4S2:'+id+':final']||{},{status:'rescued'}); if(g) g[id]='及格（期末考補登）'; }
    if(!F.FAIL_DELAY_COURSES.length){ delete F.FAIL_DELAY; delete F.FAIL_DELAY_DAY; if(F.FAIL_DELAY_BARCANCEL||(F.BAR_REG===false&&S.regTrace(s))){ F.BAR_REG=true; delete F.FAIL_DELAY_BARCANCEL; F.FD_RESCUE_BAR='restored'; } else if(F.BAR_REG===false) F.FD_RESCUE_BAR_UNKNOWN=true; }
    return true; };
  /* 報名的痕跡（BB 06:35 判定：找得到＝當時有報、是被延畢取消的；找不到＝當作自己沒報，不給重新報名）：
     ①大四選了國考那條路（Y4_PATH bar：5/10 自動報名）；②5/10 以後去過國考讀書會（BAR_REG 是 true 才排得到）*/
  S.regTrace=function(s){ const F=(s&&s.flags)||{}; if(F.Y4_PATH==='bar') return true; const A=(s&&s.acts&&s.acts.att)||{};
    const d0=typeof PG!=='undefined'&&PG.DK?PG.DK('2029-05-10'):null; if(d0==null) return false;
    return Object.keys(A).some(k=>{ const m=/^act_bar_study@(-?\d+)$/.exec(k); return !!m&&+m[1]>=d0&&!!A[k]; }); };
  S.courses=G=>{ const L=G&&G.flags&&G.flags.FAIL_DELAY_COURSES; return Array.isArray(L)?L:[]; };
  const course=id=>typeof CLS!=='undefined'&&CLS.byId?CLS.byId(id):(typeof COURSES!=='undefined'&&COURSES.list?COURSES.list.find(c=>c.id===id):null);
  S.cname=id=>{ const c=course(id); return c?String(c.name).replace(/（重修）/g,''):id; };   /* 「{課名}」不寫「（重修）」*/
  S.names=G=>S.courses(G).map(S.cname).join('、');
  S.fill=(G,t)=>String(t).replace(/\{課名\}/g,S.names(G));
  S.namesAnd=G=>{ const L=S.courses(G).map(S.cname); return L.length<2?L.join(''):L.slice(0,-1).join('、')+'和'+L[L.length-1]; };   /* K1 兩門以上（AA 2026-11-02 13:53 選 (a)）：「刑法和民法」*/
  S.fillAnd=(G,t)=>String(t).replace(/\{課名\}/g,S.namesAnd(G));
  S.lp=G=>S.courses(G).includes('legal_practice');   /* 被當的是法律實習：週二實習照交換那一版（這門課現在不會被當：不是考試的課、也不看出席）*/
  S.certLate=G=>!!(G&&G.flags&&G.flags.FAIL_DELAY_CERT);
  /* ---------- 6/18 成績單 ---------- */
  S.check=async function(GM,o){ o=o||{}; const G=GM.G, F=G.flags; if(!law(G)||F.FAIL_DELAY_COURSES!=null||typeof CLS==='undefined'||!CLS.failedIn) return false;
    const fails=CLS.failedIn(G,'Y4S2').filter(S.counts);   /* D124：大四下只判必修和重修；選修（海商法…）被當只記成績、不延畢、不排補考（前面學期的選修被當照舊排重修）*/
    if(fails.length&&!exch(G)&&fails.every(c=>CLS.isExamCourse&&CLS.isExamCourse(c))&&S.mkOpen(G)) return S.mkPlan(GM,fails.map(c=>c.id),o);   /* D118：全部是考五題的課＝排補考，先不延畢 */
    F.FAIL_DELAY_COURSES=fails.map(c=>c.id); F.FAIL_DELAY_V=2; if(!fails.length) return false;   /* FAIL_DELAY_V＝2：修好以後判的延畢（BUG-Y4S2-NOFINAL-1102 的救援不碰，BB 06:46）*/
    if(exch(G)) return true;   /* 交換路線又被當：大五上多那一門重修，其他照交換版 */
    const bar=S.applyDelay(G,F.FAIL_DELAY_COURSES);
    if(!o.inScene) GM.sceneBegin(); try{ await GM.say(null,S.fill(G,S.LINES.fail)); await GM.say(null,S.LINES.cert); if(bar) await GM.say(null,S.LINES.bar); } finally { if(!o.inScene) GM.sceneEnd(); }
    return true; };
  /* 延畢的旗標（6/18 直接延畢、補考沒過、補考沒去共用）：回傳國考報名是不是被這一次取消的（要不要說 S.LINES.bar）*/
  S.applyDelay=function(G,ids){ const F=G.flags; F.FAIL_DELAY_COURSES=ids.slice(); F.FAIL_DELAY_V=2; F.FAIL_DELAY=true; F.FAIL_DELAY_DAY=G.day;
    const bar=F.BAR_REG===true; if(bar){ F.BAR_REG=false; F.FAIL_DELAY_BARCANCEL=true; }   /* BARCANCEL：國考報名是被延畢取消的（BUG-Y4S2-NOFINAL-1102 的救援要分得出「自己沒報」和「被取消」）*/
    if(typeof PHONE!=='undefined'&&(typeof STORY==='undefined'||!STORY.knows||STORY.knows('zhe',G))) PHONE.at(G,G.day,22,S.LINES.zhe.map(t=>({th:'p:zhe',from:'zhe',text:t})),'fd_zhe');
    return bar; };
  /* ---------- D118 大四下補考（使用者 2026-11-02 05:0x Q4：「大四下被當的科目，6 月底補考同科五題，過了照常畢業、照常考當年國考；沒過才延畢」）----------
     日子：2029-06-26（二）10:00，法律系館A（S.MK_AT）。為什麼是這一天：
       ①6/18（一）成績單出來以後隔一個多禮拜，中間可以總複習（STUDY.REVIEW_EXTRA，見下面）；
       ②6/28（四）10:00 宿舍期滿收鑰匙（PG.SOFT；dorm_y24_3d.js 6/27 23:00 最後一晚）以前，人還住宿舍、離系館近，也不會和退宿、最後一晚撞；
       ③避開畢業後篇已有的停點：6/22（五）19:00 期末最後一頓、6/23（六）學姊回來、週五～週日的交往固定格（pgdates3d.js）；6/20、6/26 21:00 的動態只是貼文、不停；
       ④平日上午：結果當天中午前出來，沒過的話阿哲 22:00 那兩則照舊在當天晚上；⑤遠在 7/12 總圖 B1、8/4 國考一試以前——過了就照常考當年國考。
     停點：09:30（S.MK_STEP_H）演「補考」場景（時間帶到 10:00、每科五題）；11:00（S.MK_UNTIL_H）以前沒能開始（一直坐著、在別的場景裡、讀檔時已經過了）＝沒去，照延畢。
     前一天 20:00 系統提醒（手機訊息＝畢業後篇跳日期會停在那裡，可以先做總複習）。
     存檔：G.flags.FD_MAKEUP＝{v:1, courses:[課 id], status:'pending'|'pass'|'fail'|'missed', res:{課 id:'pass'|'fail'|'missed'}}；沒有＝沒有補考（舊存檔照舊，已經 FAIL_DELAY 的不補）。
     補考的五題：CLS.drawExam(G,課,'Y4S2','makeup')——同一份期末範圍，先抽期末沒考過的題（classes3d.js）；計分 CLS.scoreOf、及格＝答對 1 題以上（同 CLS.failedIn 的期末）。 */
  S.MK_AT=['2029-06-26',10]; S.MK_STEP_H=9.5; S.MK_UNTIL_H=11; S.MK_REMIND_AT=['2029-06-25',20];
  S.MK_LINES={   /* AA_578 定稿（企劃線 b13db535f 第 5 節；D118 補考；全部集中在這裡）：remind 刪後半「考前可以在讀書的地方做一次總複習。」，其餘照用 */
    notice:'（補考在 6/26（二）上午十點，法律系館A。考過了，就照常畢業。）',
    sys:'【教務處】大四下補考通知：{課名}。6/26（二）10:00，法律系館A。',
    remind:'【教務處】明天上午 10:00 補考：{課名}（法律系館A）。',
    open:'（法律系館A 201。前面幾排零零散散坐了四五個人。有人穿著實習的襯衫，有人一邊吃早餐一邊翻講義。）',   /* AA_578 第 6 節 @4ea79cff4（BB 口氣審 PASS，10:18）：考場有人＋監考助教（使用者 10:3x「考試教室都沒人也很怪」）*/
    proctor:'考卷發下去了。一樣五題，十一點收。',   /* 陳助教（npc_ta_chen，有立繪）*/
    examName:'補考',
    pass:'（{課名}，補考過了。）',
    passAll:'（這樣，就真的畢業了。）',
    passBar:'（今年的國考，照常考。）',
    fail:'（{課名}的補考，沒有過。）',
    missed:'（補考的時間過了。{課名}，你沒有去考。）',
    gradePass:'及格（補考）', gradeFail:'不及格（補考未過）', gradeMissed:'不及格（補考缺考）',
    missItem:'補考：{課名}', fixLabel:'補考',noSkip:'補考的時間到了（10:00，法律系館A）。', migNotice:'（教務處來了通知：{課名}，可以補考。）',
    reviewWhat:'補考的', reviewBlock:'會錯過補考。' , homeOpt:'出發：補考（法律系館A）', homeHint:'{課名}　10:00　捷運＋公車 約 40 分鐘'};
  S.counts=c=>!!c&&(!!c.rt||(c.kind!=='elective'&&c.kind!=='general'));   /* D124：會讓大四下延畢的課＝必修，或重修（c.rt，原本是選修也算）*/
  /* D124 舊存檔（BB 決定只救這一種）：6/18 排了補考、還沒考（FD_MAKEUP pending、不是舊延畢改的 mig），補考的課裡有選修＝那幾門拿掉；全部是選修＝取消補考、照常畢業（FD_RESCUE_ELECTIVE）。
     補考沒過／沒去、已經延畢、已經進大五上的照舊（延畢劇情演過了，回頭改會前後矛盾）*/
  S.rescueElective=function(s){ const F=s&&s.flags, M=F&&F.FD_MAKEUP; if(!M||typeof M!=='object'||M.status!=='pending'||M.mig!=null||F.FD_RESCUE_ELECTIVE||!Array.isArray(M.courses)) return false;
    const RT=s.courses&&Array.isArray(s.courses.retake)?s.courses.retake:[]; const keep=M.courses.filter(id=>{ if(RT.some(r=>r.id===id&&r.term==='Y4S2')) return true; const c=course(id); return !c||S.counts(c); });
    if(keep.length===M.courses.length) return false; F.FD_RESCUE_ELECTIVE=true;
    if(keep.length){ M.courses=keep; return true; }
    M.status='cancelled'; M.cancel='elective';
    const P=s.phone; if(P&&Array.isArray(P.q)) P.q=P.q.filter(q=>!q||q.tag!=='fd_mk_remind');   /* 前一天的補考提醒不再送 */
    return true; };
  S.mk=G=>{ const M=G&&G.flags&&G.flags.FD_MAKEUP; return M&&typeof M==='object'&&Array.isArray(M.courses)?M:null; };
  S.mkPending=G=>{ const M=S.mk(G); return !!M&&M.status==='pending'&&law(G); };
  S.mkDay=()=>DK(S.MK_AT[0]);
  S.mkOpen=G=>{ const d=S.mkDay(); return d!=null&&G.day<d; };   /* 成績單補考那天（含）以後才發（放假很久才醒來的舊存檔）＝來不及補考，照舊直接延畢 */
  S.fillIds=(ids,t)=>String(t).replace(/\{課名\}/g,ids.map(S.cname).join('、'));
  const mkCourse=(G,id)=>(typeof CLS!=='undefined'&&CLS.termCourses?CLS.termCourses(G,'Y4S2').find(c=>c.id===id):null)||course(id);
  const gradesY4S2=G=>{ if(typeof CLS==='undefined'||!CLS.rec) return null; const R=CLS.rec(G); return R.grades.Y4S2&&typeof R.grades.Y4S2==='object'?R.grades.Y4S2:null; };
  /* 6/18：排補考（旁白、手機通知、前一天的提醒）*/
  S.mkPlan=async function(GM,ids,o){ o=o||{}; const G=GM.G, F=G.flags, L=S.MK_LINES; F.FAIL_DELAY_COURSES=[]; F.FAIL_DELAY_V=2; F.FD_MAKEUP={v:1,courses:ids.slice(),status:'pending',res:{}};   /* FAIL_DELAY_COURSES＝[]：6/18 判過了（S.check 不再判、FD.migrate 不碰）*/
    if(typeof PHONE!=='undefined'){ if(PHONE.post&&!PHONE.sent(G,'fd_mk_sys')) PHONE.post(G,{th:'sys',text:S.fillIds(ids,L.sys),tag:'fd_mk_sys'});
      const rd=DK(S.MK_REMIND_AT[0]); if(rd!=null&&now(G)<T(rd,S.MK_REMIND_AT[1])) PHONE.at(G,rd,S.MK_REMIND_AT[1],[{th:'sys',text:S.fillIds(ids,L.remind)}],'fd_mk_remind'); }
    if(!o.inScene) GM.sceneBegin(); try{ await GM.say(null,S.fillIds(ids,S.LINES.fail)); await GM.say(null,L.notice); } finally { if(!o.inScene) GM.sceneEnd(); }   /* 「（{課名}，不及格。）」照原句 */
    return true; };
  /* 補考那一場（PG.STEPS fd_makeup）*/
  S.makeup=async function(GM){ const G=GM.G, F=G.flags, M=S.mk(G), L=S.MK_LINES; if(!S.mkPending(G)||typeof CLS==='undefined'||!CLS.runExam) return false; const ids=M.courses.slice(), res={}, d=S.mkDay();
    if(GM.E&&GM.E.player&&GM.E.player.seat&&GM.standUp) GM.standUp(GM.E.player);   /* 坐著讀到補考前、待到補考前停下來：站起來去考（PG.tick 的 seatOk）*/
    /* BUG-MAKEUP-BG-1102（BB 10:14）：補考那一場不管人在哪裡（家、校園、坐在總圖），從開場到結算都是法律系館A 201 的考場背景、開頭一行地點字幕；考完回到原本的地方（在家＝家裡的背景、原本沒有 ADV＝收掉）*/
    const A=typeof ADV!=='undefined'?ADV:null, wasAdv=!!(A&&A.active), home=typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G), bg=typeof OUT!=='undefined'&&OUT.bg?OUT.bg(S.MK_BG):'dark';
    GM.sceneBegin(); try{
      if(GM.fade) await GM.fade(true); if(typeof PG!=='undefined'&&PG.toAtLeast&&d!=null) PG.toAtLeast(GM,T(d,S.MK_AT[1]));
      if(A){ if(A.active&&A.setBg) A.setBg(bg); else if(A.begin) A.begin({background:bg}); }
      if(GM.fade) await GM.fade(false); if(GM.caption) GM.caption('',S.MK_PLACE,2400);
      await GM.say(null,L.open); await GM.say({name:(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName('npc_ta_chen'):'')||'陳助教',charId:'npc_ta_chen'},L.proctor);   /* 字幕 → 旁白 → 助教 → 作答 */
      for(const id of ids){ const c=mkCourse(G,id); if(!c){ res[id]='pass'; continue; }   /* 找不到那門課（不應該發生）：不罰 */
        let r=null; try{ r=await CLS.runExam(GM,{c,exam:'makeup',term:'Y4S2',examName:L.examName,skipIntro:true}); }catch(e){ console.warn('FD.makeup',e); r=null; }
        res[id]=!r||!r.held||(r.correct|0)>0?'pass':'fail'; }   /* 題庫不夠沒開考（不會發生：期末有開考才會被當）、出錯＝不罰 */
      M.res=res; const passIds=ids.filter(id=>res[id]==='pass'), failIds=ids.filter(id=>res[id]!=='pass'), g=gradesY4S2(G);
      if(g){ for(const id of passIds) g[id]=L.gradePass; for(const id of failIds) g[id]=L.gradeFail; }
      if(passIds.length) await GM.say(null,S.fillIds(passIds,L.pass));
      if(!failIds.length){ M.status='pass'; await GM.say(null,L.passAll); if(F.BAR_REG===true) await GM.say(null,L.passBar); }
      else { M.status='fail'; const bar=S.applyDelay(G,failIds); await GM.say(null,S.fillIds(failIds,L.fail)); await GM.say(null,S.LINES.cert); if(bar) await GM.say(null,S.LINES.bar); }   /* 延畢那兩三句照原句（AA_421）*/
      if(typeof PG!=='undefined'&&PG.toAtLeast&&d!=null) PG.toAtLeast(GM,T(d,S.MK_UNTIL_H));
    } finally { if(A){ if(wasAdv&&home&&A.setBg&&typeof HOME!=='undefined'&&HOME.bgNow) A.setBg(HOME.bgNow()); else if(!wasAdv&&A.active&&A.end) A.end(); } GM.sceneEnd(); }
    return true; };
  S.MK_BG='linze_201'; S.MK_PLACE='法律系館A';
  /* 沒去（PG 的 onMiss：時間過了才發現）：旗標當下記好（PG.delayed、BAR_REG 馬上一致），旁白在下一個停點（fd_mk_missed）*/
  S.mkMissed=function(G){ const M=S.mk(G); if(!M||M.status!=='pending') return false; const L=S.MK_LINES; M.status='missed'; M.res={}; for(const id of M.courses) M.res[id]='missed';
    const g=gradesY4S2(G); if(g) for(const id of M.courses) g[id]=L.gradeMissed; M.bar=S.applyDelay(G,M.courses); return true; };
  S.mkMissedNarr=async function(GM){ const G=GM.G, M=S.mk(G); if(!M||M.status!=='missed'||M.said) return false; M.said=G.day; GM.sceneBegin(); try{ await GM.say(null,S.fillIds(M.courses,S.MK_LINES.missed)); await GM.say(null,S.LINES.cert); if(M.bar) await GM.say(null,S.LINES.bar); } finally { GM.sceneEnd(); } return true; };
  /* 總複習（STUDY.REVIEW_EXTRA）：6/18 成績單以後到補考開始以前，補考那幾科的期末範圍（STUDY.units 照 Y4S2 期末；學期外的日子 STUDY 原本不開總複習）*/
  S.mkReview=function(G){ if(!S.mkPending(G)||typeof STUDY==='undefined'||!STUDY.units) return null; const d=S.mkDay(); if(d==null||now(G)>=T(d,S.MK_AT[1])) return null; const out=[];
    for(const id of S.mk(G).courses){ const c=mkCourse(G,id); if(!c) continue; const us=STUDY.units(G,c,'Y4S2','final'); if(!us.length) continue; out.push({c,exam:{c,kind:'makeup',day:d,t0:S.MK_AT[1]},units:us}); }
    return out.length?{kind:'final',term:'Y4S2',courses:out,what:S.MK_LINES.reviewWhat,makeup:true}:null; };
  S.mkReviewBlock=(G,hh)=>{ if(!S.mkPending(G)) return null; const d=S.mkDay(); if(d==null) return null; const t=now(G); return t<T(d,S.MK_AT[1])&&t+hh>T(d,S.MK_AT[1])+1e-6?S.MK_LINES.reviewBlock:null; };   /* 讀到一半會過了補考的時間 */
  /* ---------- 大五上的重修（y5s1_3d.js 的 classItems 接這裡）---------- */
  /* K1-2、K1-3（CC_K1、BB 10:21）：原本只避開重修自己互撞，美國補修（週一、週三上午）、週二實習（交換版）佔掉的時段照排——y5s1_3d.js 的 classItems 遇到衝堂就丟掉那一門，
     課表卻照列（「重修：海商法 週三上午」永遠上不到）。現在：衝到 Y5.busySlots 的那一門整門換到空著的時段（CLS.placeSlots，和 planRetakes 的衝堂換時段同一個做法）；
     沒衝到的照舊（重修互撞：同一天換時段）。課表（weekHTML）、今日頁（FD.items）、上課停點（FD.clsStop）都讀這裡，三邊一致 */
  S.slots=function(G){ const out=[], used={}; const ORDER=['am','pm1','pm2'], K=s=>s.wd+':'+s.block;
    const busy=new Set((typeof Y5!=='undefined'&&Y5.busySlots?Y5.busySlots(G):[]).map(K));
    for(const id of S.courses(G)){ if(id==='legal_practice') continue; const c=course(id); if(!c) continue; const ss=(c.slots&&c.slots.length?c.slots:[{wd:1,block:'am'}]);
      const u2=Object.assign({},used); let mine=[];
      for(const s0 of ss){ let s={wd:s0.wd,block:s0.block}; if(u2[K(s)]){ const alt=ORDER.find(b=>!u2[s.wd+':'+b]); if(alt) s={wd:s.wd,block:alt}; }   /* 衝堂：同一天換時段 */
        u2[K(s)]=1; mine.push(s); }
      if(busy.size&&mine.some(s=>busy.has(K(s)))){ const all=new Set(busy); for(const k in used) all.add(k); const pl=typeof CLS!=='undefined'&&CLS.placeSlots?CLS.placeSlots(ss,all):null;
        mine=pl?pl.slots:mine.filter(s=>!busy.has(K(s))); }   /* 排不下（一週 15 個時段，不會發生）：衝到的那一堂不列，課表和今日頁一樣 */
      for(const s of mine){ used[K(s)]=1; out.push({c,slot:s}); } }
    return out; };
  S.items=function(G,day){ if(typeof Y5==='undefined'||!Y5.term) return []; const d=day==null?G.day:day, t=Y5.term(G,d); if(!t||typeof CALENDAR==='undefined'||CALENDAR.holiday(d)||!S.courses(G).length) return [];
    const wd=CALENDAR.dateOf(d).wd, B=(typeof COURSES!=='undefined'&&COURSES.blocks)||{}, out=[];
    for(const x of S.slots(G)){ if(x.slot.wd!==wd) continue; const b=B[x.slot.block]||{t0:9+10/60,t1:12+10/60}; out.push({key:d+':'+x.c.id,c:x.c,label:'重修：'+S.cname(x.c.id),t0:b.t0,t1:b.t1,day:d,week:t.week,term:'Y5S1',slot:x.slot,bg:'classroom_small',fd:true}); }
    return out; };
  S.attended=(G,id)=>{ const R=G.y5&&G.y5.cls; if(!R) return 0; let n=0; for(const k in R){ const p=k.split(':'); if(p[1]===id&&R[k]) n++; } return n; };
  S.firstLine=function(G,it){ const F=G.flags, L=F.FD_TEACHER||(F.FD_TEACHER={}); if(!it||!it.fd||L[it.c.id]) return null; L[it.c.id]=G.day; return S.LINES.teacher; };
  /* 12/24：重修過了沒（出席三堂以上）*/
  S.result=function(G){ const F=G.flags; if(F.FAIL_DELAY_PASS!=null||!S.courses(G).length) return; const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y5S1'):null; if(!r||G.day<=r.to) return;
    const att=typeof CLS!=='undefined'&&CLS.ATT_PASS?CLS.ATT_PASS:3, ok=S.courses(G).filter(id=>id!=='legal_practice').every(id=>S.attended(G,id)>=att); F.FAIL_DELAY_PASS=ok; if(!ok&&S.retakeOn(G)) F.FAIL_DELAY_CERT='2030-06'; };
  /* ---------- AA_471 第 5 節：重修不到三堂（證書延到六月）——12/26（三）09:00 旁白兩句、2030-06-17（一）10:00 系辦領證書（照 r2y4b3d.js 的 S.cert）---------- */
  const ATT=()=>typeof CLS!=='undefined'&&CLS.ATT_PASS?CLS.ATT_PASS:3;
  S.short=G=>S.courses(G).filter(id=>id!=='legal_practice'&&S.attended(G,id)<ATT());   /* 出席不到三堂的那幾門 */
  S.lateFill=(G,t)=>{ const L=S.short(G); return L.length?String(t).replace(/\{課名\}/g,L.map(S.cname).join('、')):S.fill(G,t); };   /* {課名}＝不到三堂的那一門（只有一門被當＝FD.fill 同一門）*/
  S.lateLikely=G=>{ const F=G.flags||{}; if(F.FAIL_DELAY_PASS!=null) return S.certLate(G); return S.retakeOn(G)&&S.short(G).length>0; };   /* 12/24 以前照目前的出席算（跳到下一件事的途中不會多上課；後面還有課的，那一堂的停點比較早）*/
  S.NOTE_AT=['2029-12-26',9]; S.CERT_AT=['2030-06-17',10];
  S.lateNote=async function(GM){ const G=GM.G; GM.sceneBegin(); try{ for(const t of S.LINES.lateNote) await GM.say(null,S.lateFill(G,t)); } finally { GM.sceneEnd(); } return true; };
  S.lateCert=async function(GM){ if(typeof R2Y4B==='undefined'||!R2Y4B.cert) return false; return R2Y4B.cert(GM,{key:S.CERT_AT[0],ta:S.LINES.lateCert,tag:'fd'}); };   /* 手機「畢業證書已可領取。」、12:00 媽媽那一則照 S.cert（tag fd_cert_sys、fd_cert_mom）*/
  /* ---------- 掛上去 ---------- */
  if(typeof CLS!=='undefined'&&CLS.showGrades&&!CLS._fdWrap){ const sg0=CLS.showGrades; CLS.showGrades=async function(GM,termId,opts){ const r=await sg0.apply(this,arguments); if(termId==='Y4S2'&&GM&&GM.G){ try{ await S.check(GM,opts); }catch(e){ console.warn('FD.check',e); } } return r; }; CLS._fdWrap=true; }
  if(typeof PG!=='undefined'&&Array.isArray(PG.STEPS)&&!PG.STEPS.some(s=>s.id==='fd_grades_y4s2')){ const gd=()=>typeof CALENDAR!=='undefined'&&CALENDAR.gradeDay?CALENDAR.gradeDay('Y4S2'):null;
    PG.STEPS.push({id:'fd_grades_y4s2',at:G=>{ const d=gd(); return d==null?null:T(d,9); },until:G=>{ const d=gd(); return d==null?null:T(d+2,24); },cond:G=>law(G)&&typeof CLS!=='undefined'&&!!CLS.rec&&!CLS.rec(G).grades.Y4S2,run:GM=>CLS.showGrades(GM,'Y4S2')}); }   /* 畢業後篇跳日期：停在 6/18 發成績單 */
  if(typeof PG!=='undefined'&&Array.isArray(PG.STEPS)&&!PG.STEPS.some(s=>s.id==='fd_late_note')){ const at=A=>{ const d=DK(A[0]); return d==null?null:T(d,A[1]); };
    PG.STEPS.push({id:'fd_late_note',at:G=>at(S.NOTE_AT),until:G=>{ const d=DK('2030-01-20'); return d==null?null:T(d,24); },cond:G=>S.retakeOn(G)&&S.certLate(G),run:GM=>S.lateNote(GM)},   /* AA_471 第 5 節 1（記號 12/24 記下以後第一次停）*/
      {id:'fd_late_cert',at:G=>at(S.CERT_AT),until:G=>{ const d=DK('2030-06-30'); return d==null?null:T(d,24); },cond:G=>S.retakeOn(G)&&S.certLate(G),run:GM=>S.lateCert(GM)});   /* AA_471 第 5 節 2 */
    if(Array.isArray(PG.stops)) PG.stops.push(G=>{ if(!S.retakeOn(G)||(PG.done&&PG.done(G,'fd_late_note'))||!S.lateLikely(G)) return null; const t=at(S.NOTE_AT); return t!=null&&t>now(G)?t:null; }); }   /* 12/24 記號還沒記的時候就排好 12/26 09:00 的停點（長跳每 6 小時看一次，不然會停在 11:00）*/
  /* BUG-DELAY-RETAKE-SKIP-1102（CC M1、BB 09:57）：畢業後篇跳日期（PG.nextStop）原本看不到重修課——9/2 一跳就到 12/14，中間沒機會上課，12/26 就「不到三堂、證書延到六月」。
     還不到三堂的那幾門：下一堂上課前 45 分鐘當停點（Y5.status 上課前 1 小時起是 open；剛好 1 小時會因為小數誤差差一點點還沒開）；到三堂、12/24 判過了、剩下的堂數已經湊不到三堂（BB 10:05）就不再停 */
  S.clsStop=function(G){ if(!S.retakeOn(G)||G.flags.FAIL_DELAY_PASS!=null||typeof Y5==='undefined'||!Y5.classItems||!Y5.status) return null; const need=S.short(G); if(!need.length) return null;
    const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y5S1'):null; if(!r) return null; const t=now(G), L={};
    for(let d=Math.max(G.day,r.from);d<=r.to;d++){ for(const it of Y5.classItems(G,d)){ if(!it.fd||!need.includes(it.c.id)) continue; const st=d===G.day?Y5.status(G,it):'upcoming'; if(st==='done'||st==='missed') continue;
      (L[it.c.id]||(L[it.c.id]=[])).push(T(d,it.t0-0.75)); } }
    let best=null; for(const id of need){ const A=L[id]||[]; for(let i=0;i<A.length;i++){ if(A[i]<=t+1e-6) continue; if(S.attended(G,id)+(A.length-i)>=ATT()&&(best==null||A[i]<best)) best=A[i]; break; } }   /* 在那個停點那一刻算：已上的＋從那一堂起還有的 ≥ 三堂才停（BB 10:05、10:12 C0）*/
    return best; };
  if(typeof PG!=='undefined'&&Array.isArray(PG.stops)&&!PG.stops.some(f=>f&&f._fdCls)){ const f=G=>S.clsStop(G); f._fdCls=true; PG.stops.push(f); }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ if(law(G)) S.result(G); });
  if(typeof PG!=='undefined'&&Array.isArray(PG.STEPS)&&!PG.STEPS.some(s=>s.id==='fd_makeup')){ const md=()=>S.mkDay();
    PG.STEPS.push({id:'fd_makeup',at:G=>{ const d=md(); return d==null?null:T(d,S.MK_STEP_H); },until:G=>{ const d=md(); return d==null?null:T(d,S.MK_UNTIL_H); },cond:G=>S.mkPending(G),ready:G=>!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)),run:GM=>S.makeup(GM),onMiss:G=>{ S.mkMissed(G); },seatOk:true},   /* ready：人在家＝不自己開考（睡覺停在 09:30 家裡的選單，按「出發：補考」才去；BB 11:03 第 1 點）*/   /* D118 補考（seatOk：坐著也演，見 postgrad3d.js S.tick）*/
      {id:'fd_mk_missed',at:G=>{ const d=md(); return d==null?null:T(d,S.MK_UNTIL_H); },until:G=>Infinity,cond:G=>{ const M=S.mk(G); return !!M&&M.status==='missed'&&!M.said&&law(G); },run:GM=>S.mkMissedNarr(GM)},   /* 補考沒去：旁白（延畢那幾句）。until 不設上限（BB 08:59 ④）：缺考是 PG.pending 第一次跑到時才記，之後下一個停點一定演（M.said 擋重複）*/
      {id:'fd_mk_notice',at:G=>{ const M=S.mk(G); return M&&M.mig!=null?M.mig:null; },until:G=>{ const d=md(); return d==null?null:T(d,S.MK_STEP_H); },cond:G=>{ const M=S.mk(G); return !!M&&M.mig!=null&&!M.noticed&&S.mkPending(G); },run:GM=>S.mkMigNarr(GM)}); }   /* BB 08:59 ⑤：舊存檔改給補考，下一個停點補一句通知 */
  /* BUG-MAKEUP-HOME-1102（BB 08:34 P1）：6/26 人在家（HOME.at）時 PG.tick 不跑，原本會一直待到 11:00 被算缺考。
     家裡的選單直接列「出發：補考」（一鍵：照補考那一場演、考完回到家的選單）；
     在家睡覺（BUG-MAKEUP-HOME-SLEEP-WARN-1102，BB 11:03）：前一晚睡＝醒來停在補考日家裡的選單（09:30，有「出發：補考」）；補考當天 11:00 以前睡，「會錯過：補考」選「照樣」＝睡過頭、算缺考（HOME.MISS_OK → S.mkMissed），不會再自己去考 */
  S.homeMakeupOpt=G=>{ if(!S.mkPending(G)) return null; const d=S.mkDay(); if(d==null||G.day!==d||now(G)>=T(d,S.MK_UNTIL_H)) return null;
    return {t:S.MK_LINES.homeOpt,hint:S.fillIds(S.mk(G).courses,S.MK_LINES.homeHint),run:async GM=>{ await S.makeup(GM); }}; };
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.MENU_OPTS)&&!HOME.MENU_OPTS.includes(S.homeMakeupOpt)) HOME.MENU_OPTS.push(S.homeMakeupOpt);
  /* ---------- BB 08:59 第二輪（CC_audit_4174）：補考的時間只登記在 PG.STEPS，一般「會跳時間」的動作看不到——照可昕電話的做法（CLS.STOP_FNS）一個一個登記 ----------
     ① BUG-MAKEUP-STUDY-NOWARN-1102：CLS.HARD_FNS——座位讀書跨過 10:00 的長度變灰（「會錯過：補考：{課名}」）、多一項「讀到補考：{課名}前（09:50）」、一鍵總複習（CLS.spanCheck 的 hard）也擋
     ② BUG-MAKEUP-SKIPTO-1102：CLS.STOP_FNS——待到中午、小睡（CLS.skipTo）停在 09:30（PG 的補考停點；停下來以後 PG.tick 演那一場，坐著也演：seatOk）；
        09:30～11:00 之間不能再跳（CLS.canSkip 擋：「補考的時間到了」）
     ③ BUG-MAKEUP-HOME-REST-1102：HOME.wouldMiss（在家休息、等晚餐、睡覺的「會錯過」）、TRIP.wouldMiss（自由出行的預告）列補考（過了 11:00＝沒去）
     ⑤ 舊存檔：6/18 已經判延畢、讀檔時還在 6/26 09:30 以前、被當的全部是考五題的課、不是交換＝改給補考（S.migrateMk，FD.migrate 一起跑）*/
  S.MK_GO_H=S.MK_AT[1]-1/6;   /* 「讀到補考前」停在 09:50（開考前 10 分鐘；PG 的停點 09:30 已經到了，一站起來就演）*/
  S.mkToday=G=>S.mkPending(G)&&G.day===S.mkDay();
  S.mkLabel=G=>S.fillIds(S.mk(G).courses,S.MK_LINES.missItem);
  S.mkHard=G=>S.mkToday(G)?[{t:S.MK_GO_H,start:S.MK_AT[1],until:S.MK_UNTIL_H,label:S.mkLabel(G),fixLabel:S.MK_LINES.fixLabel}]:[];   /* fixLabel：座位「讀到補考前（09:50）」*/
  S.mkStops=(G,h0,h1)=>S.mkToday(G)&&h0<S.MK_STEP_H?[{h:S.MK_STEP_H,why:S.mkLabel(G)}]:[];
  S.mkNoSkip=G=>{ if(!S.mkToday(G)) return ''; const h=+G.hour||0; return h>=S.MK_STEP_H-1e-6&&h<S.MK_UNTIL_H?S.MK_LINES.noSkip:''; };
  S.mkMissList=(G,toH)=>{ if(!S.mkPending(G)) return []; const d=S.mkDay(); if(d==null) return []; const u=T(d,S.MK_UNTIL_H), a=now(G), b=G.day*24+toH; return u>a&&u<=b?[String(S.MK_AT[1]).padStart(2,'0')+':00 '+S.mkLabel(G)]:[]; };
  if(typeof CLS!=='undefined'){ if(Array.isArray(CLS.HARD_FNS)&&!CLS.HARD_FNS.includes(S.mkHard)) CLS.HARD_FNS.push(S.mkHard); if(Array.isArray(CLS.STOP_FNS)&&!CLS.STOP_FNS.includes(S.mkStops)) CLS.STOP_FNS.push(S.mkStops);
    if(CLS.canSkip&&!CLS._fdSkip){ const cs0=CLS.canSkip; CLS.canSkip=function(GM){ const r=cs0.apply(this,arguments); if(r) return r; return GM&&GM.G?S.mkNoSkip(GM.G):''; }; CLS._fdSkip=true; } }
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.MISS_OK)&&!HOME.MISS_OK.some(f=>f&&f._fdMk)){ const f=(G,toH)=>{ if(S.mkMissList(G,toH).length) S.mkMissed(G); }; f._fdMk=true; HOME.MISS_OK.push(f); }   /* 警告說會錯過補考、玩家選「照樣」＝缺考（BB 11:03）*/
  if(typeof HOME!=='undefined'&&HOME.wouldMiss&&!HOME._fdMiss){ const w0=HOME.wouldMiss; HOME.wouldMiss=function(G,toH){ const r=w0.apply(this,arguments)||[]; try{ return S.mkMissList(G,toH).concat(r); }catch(e){ console.warn('FD wouldMiss',e); return r; } }; HOME._fdMiss=true; }   /* 補考排第一個（BB 09:27，CC F5：confirmMiss 只列前三件，接在後面會被擠掉；錯過補考＝延畢）*/   /* home3d.js 的 confirmMiss 叫 S.wouldMiss（＝HOME.wouldMiss）；jp3d.js 也用它 */
  if(typeof TRIP!=='undefined'&&TRIP.wouldMiss&&!TRIP._fdMiss){ const w0=TRIP.wouldMiss; TRIP.wouldMiss=function(G,h1){ const r=w0.apply(this,arguments)||[]; try{ return S.mkMissList(G,h1).concat(r).slice(0,3); }catch(e){ return r; } }; TRIP._fdMiss=true; }
  /* ⑤ 舊存檔改給補考（BB 08:59 判定）：冪等（有 FD_MAKEUP 就不動）。BAR_REG 是被延畢取消的（FAIL_DELAY_BARCANCEL）才恢復；22:00 阿哲那兩則還沒送的拿掉。
     通知：手機 sys＋前一天 20:00 提醒（S.mkNotify，PHONE_RULES 跑：讀檔時的 s 還不是遊戲中的 G）；旁白在下一個停點補一句（PG fd_mk_notice）*/
  S.migrateMk=function(s){ const F=s&&s.flags; if(!F||typeof F!=='object'||F.FD_MAKEUP||F.FAIL_DELAY!==true||!Array.isArray(F.FAIL_DELAY_COURSES)||!F.FAIL_DELAY_COURSES.length||!law(s)||typeof s.day!=='number') return false;
    if(F.FAIL_DELAY_PASS!=null||F.FAIL_DELAY_CERT||exch(s)) return false; const d=S.mkDay(); if(d==null||now(s)>=T(d,S.MK_STEP_H)) return false;
    if(typeof CLS==='undefined'||!CLS.isExamCourse) return false; const L=CLS.termCourses?CLS.termCourses(s,'Y4S2'):[];
    if(!F.FAIL_DELAY_COURSES.every(id=>{ const c=L.find(x=>x.id===id); return !!c&&CLS.isExamCourse(c); })) return false;   /* 有點名制的課（沒有考試可以補）、不是大四下排的課（含大四下的重修；exam_every_term ② 那種）＝照舊延畢 */
    F.FD_MAKEUP={v:1,courses:F.FAIL_DELAY_COURSES.slice(),status:'pending',res:{},mig:now(s)}; F.FAIL_DELAY_COURSES=[]; F.FAIL_DELAY_V=2; delete F.FAIL_DELAY; delete F.FAIL_DELAY_DAY;
    if(F.FAIL_DELAY_BARCANCEL){ F.BAR_REG=true; delete F.FAIL_DELAY_BARCANCEL; }
    try{ const P=s.phone&&s.phone.q; if(Array.isArray(P)) s.phone.q=P.filter(q=>q.tag!=='fd_zhe'); else if(typeof PHONE!=='undefined'&&PHONE.rec){ const R=PHONE.rec(s); R.q=R.q.filter(q=>q.tag!=='fd_zhe'); } }catch(e){ console.warn('FD.migrateMk phone',e); }
    return true; };
  S.mkNotify=function(G){ const M=S.mk(G); if(!M||M.mig==null||M.notified||!S.mkPending(G)||typeof PHONE==='undefined') return false; M.notified=G.day; const L=S.MK_LINES;
    if(PHONE.post&&!PHONE.sent(G,'fd_mk_sys')) PHONE.post(G,{th:'sys',text:S.fillIds(M.courses,L.sys),tag:'fd_mk_sys'});
    const rd=DK(S.MK_REMIND_AT[0]); if(rd!=null&&now(G)<T(rd,S.MK_REMIND_AT[1])) PHONE.at(G,rd,S.MK_REMIND_AT[1],[{th:'sys',text:S.fillIds(M.courses,L.remind)}],'fd_mk_remind'); return true; };
  S.mkMigNarr=async function(GM){ const G=GM.G, M=S.mk(G); if(!M||M.noticed) return false; M.noticed=G.day; S.mkNotify(G); GM.sceneBegin(); try{ await GM.say(null,S.fillIds(M.courses,S.MK_LINES.migNotice)); await GM.say(null,S.MK_LINES.notice); } finally { GM.sceneEnd(); } return true; };
  { const mig0=S.migrate; S.migrate=function(s){ let a=false, b=false, c=false; try{ a=mig0(s); }catch(e){ console.warn('FD.migrate',e); } try{ b=S.migrateMk(s); }catch(e){ console.warn('FD.migrateMk',e); } try{ c=S.rescueElective(s); }catch(e){ console.warn('FD.rescueElective',e); } return a||b||c; }; }   /* 先跑原本的救援（BUG-Y4S2-NOFINAL），再看要不要改給補考 */
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ if(law(G)) S.mkNotify(G); });
  if(typeof STUDY!=='undefined'){ if(Array.isArray(STUDY.REVIEW_EXTRA)&&!STUDY.REVIEW_EXTRA.includes(S.mkReview)) STUDY.REVIEW_EXTRA.push(S.mkReview); if(Array.isArray(STUDY.REVIEW_CHECKS)&&!STUDY.REVIEW_CHECKS.includes(S.mkReviewBlock)) STUDY.REVIEW_CHECKS.push(S.mkReviewBlock); }
  return S;
})();
if(typeof window!=='undefined') window.FD=FD;
