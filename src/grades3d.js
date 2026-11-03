/* 成績出來以後：BB 人物的反應（AA_553，企劃線 AUDIT-AA-FOLLOWUP 第 5 項；BB_120 第 2 節照現行設定重寫，D116 不跟別人比、D42 沒有暑修）
   - 成績級別（BB_120 0-4）：法律科期末平均答對 ≥4 高、≥3 中、<3 低（HONOR.avg）；被當（CLS.failedIn）取代那一格：有一科法律課 0 題／缺考＝法律課被當，
     只有看出席的課不到三堂＝出席被當。進步＝比上學期平均多 0.5 題以上。
   - 當面（學姊、芷若、沛珊、明軒、方奕廷）：成績公布日（CALENDAR.gradeDay）起到下學期第 3 週結束，第一次找他／她說話先演（STORY.PRE_TALK，同 HONOR.preTalk）；
     每人每學期一次、沒見到不補；有點熟以上。芷若只在 Café；沛珊只有大一上、大一下。
   - 手機（子晴、阿凱）：成績公布日 21:00；朋友以上。
   - 書卷獎一句（學姊、沛珊、明軒）：公告以後第一次說話；同一次見面成績那段也到期＝先演成績，書卷獎留到下一次。
   - 第 3 節：沛珊「全部。」→ 下學期第 1 週週一 21:00 起約週三總圖二樓（PS_STUDY）；明軒的筆記（MX_NOTES，房間物件）；阿凱期末考週第一天的泡麵（大一同房）。
   - 第 4 節可昕：一起打開成績的兩場（events.js ev_kexin_grades_open*）照級別換句；大四上「各說一科最滿意的」多一個「沒有最滿意的。」（r2y4a3d.js）；
     其他學期被當＝成績公布日 21:30 她傳一句。
   - 讀書地點的次數（芷若「常在 Café 看到他」、子晴「常在圖書館」、阿凱「常在宿舍」）：STORY.onStudy 每次自習記一筆（GR_STUDY；這一版起才記，舊存檔從 0 開始——機會，不是門檻）。
   - 子晴「這學期都在測我的遊戲」那兩則：拿掉（AA-B 11-01 回：沒有機制，不為它加計數）。
   - 沛珊「坐她旁邊＝一起念」：AA-B 11-01 回——週三 19～21 走到她旁邊說話時多一句旁白「（你在她旁邊坐下。她把一半的桌面讓出來，什麼都沒說。）」，記 STUDIED_TOGETHER。 */
const GRADES=(function(){
  const S={};
  const LAW_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const FL=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND'];
  const fl=id=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'STRANGER';
  const atLeast=(id,lv)=>FL.indexOf(fl(id))>=FL.indexOf(lv);
  const has=(id,m)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,m);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const away=(G,t)=>typeof CLS!=='undefined'&&CLS.termAway&&CLS.termAway(G,t);
  const gd=t=>typeof CALENDAR!=='undefined'&&CALENDAR.gradeDay?CALENDAR.gradeDay(t):null;
  const avg=(G,t)=>typeof HONOR!=='undefined'&&HONOR.avg?HONOR.avg(G,t):null;
  S.LAW_TERMS=LAW_TERMS;
  /* 級別：'fail_law'／'fail_att'／'high'／'mid'／'low'；沒有法律課、人在國外的學期＝null */
  S.lv=function(G,t){ if(!G||away(G,t)||typeof CLS==='undefined') return null; const f=CLS.failedIn?CLS.failedIn(G,t):[];
    if(f.some(c=>CLS.isExamCourse(c))) return 'fail_law'; if(f.length) return 'fail_att';
    const a=avg(G,t); if(a==null) return null; return a>=4?'high':(a>=3?'mid':'low'); };
  S.fail=lv=>lv==='fail_law'||lv==='fail_att';
  S.improved=function(G,t){ const i=LAW_TERMS.indexOf(t); if(i<1) return false; const a=avg(G,t), b=avg(G,LAW_TERMS[i-1]); return a!=null&&b!=null&&a-b>=0.5; };
  /* 現在是哪一學期的「成績出來以後」：成績公布日 ～ 下學期第 3 週結束（Y4S2：公布日起三週）*/
  S.windowTerm=function(G){ if(typeof CALENDAR==='undefined') return null; for(let i=LAW_TERMS.length-1;i>=0;i--){ const t=LAW_TERMS[i], g=gd(t); if(g==null||G.day<g) continue;
      const nx=LAW_TERMS[i+1], r=nx?CALENDAR.termDays(nx):null, end=r?r.from+20:g+20; return G.day<=end?t:null; } return null; };
  /* ---- 讀書地點的次數（每學期）---- */
  const LIBS=['library','library_hall','library_carrels','library_stacks','library_b1','lawlib','soclib'];
  S.studyN=function(G,t,kind){ const R=(G.flags&&G.flags.GR_STUDY&&G.flags.GR_STUDY[t])||{}; return R[kind]|0; };
  S.onStudy=function(GM){ const G=GM&&GM.G; if(!law(G)||typeof CALENDAR==='undefined') return; const T=CALENDAR.termOf(G.day); if(!T) return;
    const kind=G.zone==='cafe'?'cafe':(LIBS.includes(G.zone)?'lib':(G.zone==='dorm'?'dorm':null)); if(!kind) return;
    const A=G.flags.GR_STUDY||(G.flags.GR_STUDY={}), R=A[T.id]||(A[T.id]={}); R[kind]=(R[kind]|0)+1; };
  /* ---- 當面 ---- */
  const LV_WORD={high:'很好。',mid:'還可以。',low:'不太好。'};
  const say=async(GM,who,t)=>GM.say(who,t), nar=async(GM,t)=>GM.say(null,t);
  const choose=async(GM,opts)=>{ const k=await GM.choose(opts.map(t=>({t}))); return opts[k|0]; };
  S.FACE={
    heroine_05:async(GM,who,G,t,lv)=>{ await say(GM,who,'放假了。有什麼打算？');   /* 2-1；AA_590 第 55、56 列（使用者 11-02 選擇題「就問放假要做什麼就好了」）：不再問成績、不記 TOLD_SCORE；
         舊的成績那幾句（「下學期，我出難一點的題目給你。」「好。有翻開就好。」「好。……下學期的進度，我幫你排。」「比上學期好。我看得出來。」）不再演 */
      const R={'在家讀書。':'好。','出去玩。':'好啊。','還沒想。':'那就先睡飽。','不說。':'好。那不問了。'};
      const pick=await choose(GM,Object.keys(R)); await say(GM,who,R[pick]); },
    heroine_02:async(GM,who,G,t,lv)=>{   /* 2-2：成績出來以後第一次在 Café 跟她說話 */
      if(S.fail(lv)){ await say(GM,who,'……今天這杯我請。不是安慰，是剛好。'); return; }
      if(S.studyN(G,t,'cafe')>=5){ await say(GM,who,'成績出來了吧。今天這杯我請。'); await say(GM,who,'這學期你坐那個位子，坐了好多個晚上。'); }
      else { await say(GM,who,'成績出來了吧。……今天這杯我請。'); await say(GM,who,'不是因為你考得好，是因為你看起來很需要。'); } },
    classmate_peishan:async(GM,who,G,t,lv)=>{   /* 2-4 */
      if(lv==='fail_law'){ await say(GM,who,'哪一題你最想再寫一次？……下學期重修的時候寫。'); return; }
      if(lv==='fail_att'){ await say(GM,who,'三堂。……明年那門課，我每週傳一次提醒。不是管你，是提醒。'); return; }
      await say(GM,who,'哪一題，你最想再寫一次？'); const pick=await choose(GM,['第二題。','都寫完了。','全部。']);
      if(pick==='第二題。'){ await say(GM,who,'為什麼？'); await nar(GM,'（你講了。）'); await say(GM,who,'那你現在會寫了。'); }
      else if(pick==='都寫完了。') await say(GM,who,'……那很好。我每一題都想重寫。');
      else { await nar(GM,'（她笑了。）'); await say(GM,who,'好。那下學期一起念。'); G.flags.PS_STUDY=t; } },
    classmate_mingxuan:async(GM,who,G,t,lv)=>{   /* 2-6 */
      if(lv==='fail_law'){ await say(GM,who,'哈哈……筆記借你。這次不是隨便寫的。'); G.flags.MX_NOTES=t; return; }
      if(lv==='fail_att'){ await say(GM,who,'哈哈……明年一起修？我也還欠一門。'); return; }
      await say(GM,who,'考得怎樣？哈哈，我隨便念念。');
      const opts=[LV_WORD[lv],'不說。'].concat(has('classmate_mingxuan','SAW_HIM_STUDY')?['你隨便念念？']:[]), pick=await choose(GM,opts);
      if(pick==='不說。'){ await say(GM,who,'哈哈，好。'); return; }
      if(pick==='你隨便念念？'){ await say(GM,who,'……哈哈。下一題。'); return; }
      if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('classmate_mingxuan','TOLD_SCORE',t);
      if(lv==='high') await say(GM,who,'哇。……我請你一顆滷蛋。一顆。');
      else if(lv==='mid') await say(GM,who,'不錯啊。哈哈，下學期繼續。');
      else { await say(GM,who,'筆記借你。我隨便寫的。'); await nar(GM,'（筆記的字很整齊，一點都不隨便。）'); G.flags.MX_NOTES=t; } },
    npc_fangyt:async(GM,who,G,t,lv)=>{   /* 2-7 */
      if(lv==='fail_law'){ await say(GM,who,'我們系被當的人，要再上一次山。'); await say(GM,who,'……下學期，再上一次就好。'); return; }
      if(lv==='fail_att'){ await say(GM,who,'出席不夠喔。……明年換一門要出去走的。'); return; }
      await say(GM,who,'我們系的期末在山上考。認樹。');
      if(lv==='high'||S.studyN(G,t,'lib')>=10) await say(GM,who,'你這學期都在室內。……週末去走走。不用帶書。'); } };
  /* 書卷獎一句（學姊、沛珊、明軒）*/
  S.HONOR_LINE={
    heroine_05:async(GM,who)=>{ await say(GM,who,'系上的公告我看到了。……恭喜。'); await say(GM,who,'這頓你請。'); },
    classmate_peishan:async(GM,who)=>{ await say(GM,who,'我看到公告了。……拿到的時候，是什麼感覺？'); const pick=await choose(GM,['很開心。','沒什麼感覺。']);
      await say(GM,who,pick==='很開心。'?'好。我記下來。':'……這是最奇怪的答案。'); },
    classmate_mingxuan:async(GM,who)=>{ await say(GM,who,'哈哈，恭喜。'); await say(GM,who,'這次滷蛋你請。'); } };
  const faceOk=(G,id,t)=>{ if(id==='heroine_02'&&G.zone!=='cafe') return false;
    if(id==='heroine_05'){ const nx=LAW_TERMS[LAW_TERMS.indexOf(t)+1], r=nx&&typeof CALENDAR!=='undefined'?CALENDAR.termDays(nx):null; if(r&&G.day>=r.from) return false; }   /* AA_590 第 55 列：她問「放假了。有什麼打算？」——下學期開學以後不演（原本到第 3 週） */ if(id==='classmate_peishan'&&!['Y1S1','Y1S2'].includes(t)) return false; return true; };
  /* 吧檯班的芷若（story3d.js 點餐那一條路沒有走 PRE_TALK）：這次說話會不會演成績那段或書卷獎那一句（BB-B 11-01 讀程式預料 FAIL）*/
  S.preTalkDue=function(G,id){ if(!law(G)||!S.FACE[id]) return false; const F=G.flags, t=S.windowTerm(G);
    if(t&&F['GR_'+id+'_'+t]==null&&atLeast(id,'FAMILIAR')&&faceOk(G,id,t)&&S.lv(G,t)) return true;
    const tm=F.HONOR_LAST; return !!(S.HONOR_LINE[id]&&tm&&F['HONOR_'+tm]&&F['HONOR_GR_'+id+'_'+tm]==null&&(id!=='classmate_peishan'||['Y1S1','Y1S2'].includes(tm))&&atLeast(id,'FAMILIAR')); };
  S.preTalk=async function(GM,who,id){ const G=GM&&GM.G; if(!law(G)||!S.FACE[id]) return; const F=G.flags;
    const t=S.windowTerm(G);
    if(t&&F['GR_'+id+'_'+t]==null&&atLeast(id,'FAMILIAR')&&faceOk(G,id,t)){ const lv=S.lv(G,t);
      if(lv){ F['GR_'+id+'_'+t]=G.day; await S.FACE[id](GM,who,G,t,lv); return; } }   /* 成績那段演了＝這次不說書卷獎（下一次）*/
    const tm=F.HONOR_LAST; if(S.HONOR_LINE[id]&&tm&&F['HONOR_'+tm]&&F['HONOR_GR_'+id+'_'+tm]==null&&(id!=='classmate_peishan'||['Y1S1','Y1S2'].includes(tm))&&atLeast(id,'FAMILIAR')){
      F['HONOR_GR_'+id+'_'+tm]=G.day; await S.HONOR_LINE[id](GM,who); return; }
    if(id==='classmate_peishan'&&G.zone==='library_hall'&&S.sched(CHARACTERS&&CHARACTERS.classmate_peishan,G)&&F.GR_PS_SAT!==G.day){   /* PS_STUDY 那學期週三 19～21 在總圖二樓：走到她旁邊說話（AA-B 11-01）*/
      F.GR_PS_SAT=G.day; await nar(GM,'（你在她旁邊坐下。她把一半的桌面讓出來，什麼都沒說。）'); if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('classmate_peishan','STUDIED_TOGETHER','總圖二樓'); } };
  /* ---- 手機（成績公布日 21:00）---- */
  const P=(who,t)=>({th:'p:'+who,from:who,text:t});
  S.zqLines=function(G,t,lv){ const grad=t==='Y4S1'||t==='Y4S2', Z=s=>P('heroine_04',s);
    if(lv==='fail_law') return [Z('欸不是 被當？'),Z('我大一也被當過一科 隔年重修就過了')];
    if(lv==='fail_att') return [Z('欸不是 通識被當？那個只要去就會過欸'),Z('……明年我叫你起床')];
    if(grad) return ['欸 你們成績出來了吧','我已經沒有成績可以看了','……有點想念'].map(Z);
    const L=['欸不是','成績出來了','你的不用說','我的必修很好 其他過了'].map(Z); if(S.studyN(G,t,'lib')>=10) L.push(Z('你念書的樣子很像在 debug')); return L; };
  S.kaiLines=function(G,t,lv){ const y1=t==='Y1S1'||t==='Y1S2', K=s=>P('kai',s);
    const L=(y1?['所以我的成績出來了','程設 很好','微積分 過了','其他 不要問']:['所以我的成績出來了','必修 很好','選修 過了']).map(K);
    if(lv==='fail_law') return L.concat(['所以你也被當了','歡迎加入重修'].map(K));
    if(lv==='fail_att') return L.concat(['通識被當','這個比較難','因為要出門'].map(K));
    if(y1&&lv==='high'&&S.studyN(G,t,'dorm')>=10) L.push(K('所以法律系真的要念書'),K('我以為是傳說'));
    if(S.improved(G,t)) L.push(K('所以你這學期怎麼了'),K('我有看到你在念'));
    return L; };
  const contact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const F=G.flags;
    for(const t of LAW_TERMS){ const g=gd(t); if(g==null||G.day<g||G.day>g+2) continue; if(G.day===g&&G.hour<21) continue; const lv=S.lv(G,t); if(!lv) continue;
      if(!sent(G,'gr_zq_'+t)&&atLeast('heroine_04','FRIEND')&&contact(G,'heroine_04')) PHONE.at(G,g,21,S.zqLines(G,t,lv),'gr_zq_'+t);
      if(!sent(G,'gr_kai_'+t)&&t!=='Y4S2'&&atLeast('kai','FRIEND')&&contact(G,'kai')) PHONE.at(G,g,21,S.kaiLines(G,t,lv),'gr_kai_'+t);   /* 阿凱 2029-06 畢業以後沒有（Y4S2 公布日在那之後）*/
      /* 第 4 節：可昕，被當、不是一起打開的學期（大一上、大一下有一起打開的那一場）*/
      if(S.fail(lv)&&t!=='Y1S1'&&t!=='Y1S2'&&!sent(G,'gr_kx_'+t)&&(F.dating_kexin||atLeast('kexin','FRIEND'))&&contact(G,'kexin'))
        PHONE.at(G,g,21.5,[P('kexin','被當？……好。下學期重修那一科，我每週出一題給你。')],'gr_kx_'+t); }
    /* 第 3 節：沛珊 PS_STUDY → 下學期第 1 週週一 21:00（已經過了＝下一個 21:00）*/
    if(F.PS_STUDY&&!sent(G,'gr_ps_study')){ const i=LAW_TERMS.indexOf(F.PS_STUDY), nx=LAW_TERMS[i+1], r=nx&&typeof CALENDAR!=='undefined'?CALENDAR.termDays(nx):null;
      if(r){ const day=G.hour>=21?G.day:G.day-1;   /* 最近一次的 21:00 */ if(day>=r.from&&day<=r.from+20)
        PHONE.at(G,day,21,[Object.assign(P('classmate_peishan','這學期，週三晚上總圖二樓。……要來嗎？'),{ask:{id:'gr_ps_study_ask',until:(day+7)*24,opts:[{t:'好。',set:{PS_STUDY_ON:nx}}]}})],'gr_ps_study'); } } };
  /* 沛珊週三 19:00～21:00 在總圖二樓（PS_STUDY_ON 那學期；她不在法律系以後停）*/
  S.sched=function(c,G){ if(!c||c.id!=='classmate_peishan'||!G||!G.flags||!G.flags.PS_STUDY_ON||typeof CALENDAR==='undefined') return null; const T=CALENDAR.termOf(G.day);
    if(!T||T.id!==G.flags.PS_STUDY_ON||G.weekday!==3) return null; const hr=G.hour%24; if(hr<19||hr>=21) return null;
    if(typeof STORY!=='undefined'&&STORY.presence){ const p=STORY.presence('classmate_peishan',G); if(p&&p.here===false) return null; }
    return {days:[3],from:19,to:21,zone:'library_hall',act:'read',label:'總圖二樓自習區',note:'AA_553 第 3 節 PS_STUDY'}; };
  /* 房間物件：明軒的筆記（MX_NOTES 的下學期起）、阿凱的泡麵（大一上、大一下期末考週）*/
  S.room=function(G,L){ if(!law(G)) return; const F=G.flags, T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
    if(F.MX_NOTES){ const i=LAW_TERMS.indexOf(F.MX_NOTES); if(T&&LAW_TERMS.indexOf(T.id)>i) L.push(['明軒的筆記','明軒的筆記。字很整齊，一點都不隨便。']); }
    if(T&&(T.id==='Y1S1'||T.id==='Y1S2')&&T.week===16&&atLeast('kai','FRIEND')) L.push(['桌上的泡麵','（你的桌上有一碗泡麵，貼著一張便利貼：「考試週限定」。）']); };
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(S.preTalk);
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,L)=>S.room(G,L));
    if(Array.isArray(STORY.SCHED_X)) STORY.SCHED_X.push(S.sched);
    const prev=STORY.onStudy; STORY.onStudy=function(GM,hrs){ try{ S.onStudy(GM); }catch(e){ console.warn('GRADES.onStudy',e); } return prev?prev.apply(this,arguments):undefined; }; }
  return S;
})();
if(typeof window!=='undefined') window.GRADES=GRADES;
