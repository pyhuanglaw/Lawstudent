/* ===== 課表與每日上課（D52：AA_103、AA_104；D54：日常生活的設計原則）=====
   課程資料：src/data/courses.js；日曆（學期、週次、寒暑假、國定假日）：src/data/calendar.js。
   玩家怎麼知道今天有什麼課（AA_104 第 3 節）：起床時的目標寫今天的課、HUD 的「下一堂」、手機的「今天」「課表」（index.html #phone）、開始前 30 分鐘的提醒。
   上課（AA_104 4-1）：開始前 30 分鐘到開始後 30 分鐘走進教室、坐下 → 上課（黑板三行 → 教授一句 → 同學一句 → 時間快轉到下課；可以點過去）。
     霖澤館 201（3D）：坐下時選「上課」；共同教學館、體育館、萬才館研討室：走到門口（2D 課堂畫面）；校外實習：之後做。
   翹課（4-2）：不用操作，開始後 30 分鐘還沒來就算沒來；不警告、不扣分（只記「來了幾次」）。
   自學（4-3）：在宿舍、圖書館、Café 讀書時選一門課，累積同一個「準備」。
   考試週（第 8～9、17～18 週）：那一週的課變成考試；學期結束的第一個早上看到成績單（文字，不是分數，不會「沒過」：AA_104 第 10 節）。
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
  const WIN0=0.5, WIN1=0.5;                 // 開始前 30 分鐘就可以進教室、開始後 30 分鐘還沒來＝沒來（AA_104 4-1、4-2）
  const WD=['','週一','週二','週三','週四','週五','週六','週日'];
  S.WD=WD;
  // ---------- 紀錄（存檔 G.courses；舊存檔沒有＝空的，全部有預設值：AA_104 第 9 節）----------
  /* 課程代號 2026-10-13 照 AA_103 第 8 節改了（AA_110 差異表）：舊存檔的出席、準備、成績、提醒、選修照這張表換成新代號（不會讓玩家的紀錄消失）*/
  const OLD_IDS={chinese1:'chinese_y1',con_law1:'const_1',english1:'english_y1',gened1:'ge_film_y1s1',pe1:'pe_y1s1',chinese2:'chinese_y1_2',civ_obl1:'oblig_gen1',con_law2:'const_2',econ:'econ_principles_2',
    english2:'english_y1_2',gened2:'ge_y1s2',law_society2:'law_society_2',pe2:'pe_y1s2',civ_obl2:'oblig_gen2',civ_property:'property',gened3:'ge_y2s1',jurisprudence:'juris',pe3:'pe_y2s1',civ_obl_spec:'oblig_spec',
    gened4:'ge_y2s2',civ_proc1:'civpro_1',crim_proc:'crimpro',civ_proc2:'civpro_2',pil:'conflict_laws',case_seminar:'crim_judgment_sem',ethics:'legal_ethics',practicum:'legal_practice',anglo_law:'legal_english'};
  S.OLD_IDS=OLD_IDS;
  function migrateIds(R){ if(R.idv===2) return; const ren=id=>OLD_IDS[id]||id; const rkey=k=>{ const p=String(k).split(':'); if(p.length===3) p[1]=ren(p[1]); return p.join(':'); };   /* 上課紀錄的 key＝天:課程:時段 */
    const merge=(o,f)=>{ const n={}; for(const k in o){ const nk=f(k); n[nk]=(typeof o[k]==='number'&&typeof n[nk]==='number')?n[nk]+o[k]:o[k]; } return n; };   /* 英美法併進法學英文：次數相加 */
    R.done=merge(R.done,rkey); R.attend=merge(R.attend,ren); R.prep=merge(R.prep,ren);
    for(const t in R.grades) if(R.grades[t]&&typeof R.grades[t]==='object') R.grades[t]=merge(R.grades[t],ren);
    R.note=merge(R.note,k=>k.indexOf('rem_')===0?'rem_'+rkey(k.slice(4)):k);
    const EL=R.electives; if(EL.Y1S2_elec!==undefined){ EL.Y1S2_ls=EL.Y1S2_elec==='econ'?'none':'law_society_2'; delete EL.Y1S2_elec; }   /* 大一下：經濟學原理改成必修（重修），法律與社會可選可不選 */
    delete EL.Y1S1_ls; delete EL.Y4S2_elec;   /* 大一上的法律與社會算已選；大四下法學英文／英美法是一門 */
    R.idv=2; }
  S.rec=function(G){ const R=G.courses&&typeof G.courses==='object'?G.courses:(G.courses={}); for(const k of ['done','attend','prep','electives','grades','note']) if(!R[k]||typeof R[k]!=='object') R[k]={}; migrateIds(R); return R; };
  S.byId=id=>COURSES.list.find(c=>c.id===id)||null;
  S.enrolled=function(G,c){ if(!c.choice) return true; const pick=S.rec(G).electives[c.choice.group]; const cur=pick===undefined?c.choice.default:pick; return cur===c.id; };
  S.termCourses=(G,termId)=>COURSES.list.filter(c=>c.term===termId&&S.enrolled(G,c));
  S.termName=id=>({Y0S1:'經濟系大一上',Y0S2:'經濟系大一下',Y1S1:'大一上',Y1S2:'大一下',Y2S1:'大二上',Y2S2:'大二下',Y3S1:'大三上',Y3S2:'大三下',Y4S1:'大四上',Y4S2:'大四下'})[id]||id;
  S.profName=c=>c.prof?((COURSES.profs[c.prof]||'').slice(0,1)+'老師'):(c.profName||'老師');
  S.roomName=c=>(COURSES.rooms[c.room]||{}).name||'';
  // 每一週講哪一個主題：上課週（第 1～7、10～16 週）照順序平均分到 topics；考試週＝考試
  const TEACH=[1,2,3,4,5,6,7,10,11,12,13,14,15,16];
  S.topic=function(c,week){ const i=TEACH.indexOf(week); const T=c.topics||[]; if(!T.length) return ''; if(i<0) return T[T.length-1]; return T[Math.min(T.length-1,Math.floor(i*T.length/TEACH.length))]; };
  // ---------- 某一天的課 ----------
  S.dayItems=function(G,day){ if(day==null) day=G.day; if(typeof CALENDAR==='undefined'||CALENDAR.holiday(day)) return []; const t=CALENDAR.termOf(day); if(!t) return []; const wd=CALENDAR.dateOf(day).wd; const out=[];
    const R0=G.courses&&typeof G.courses==='object'?G.courses:null;
    for(const c of S.termCourses(G,t.id)){ if(c.weeks&&!c.weeks.includes(t.week)){ const att=R0&&R0.attend?(R0.attend[c.id]||0):0; if(!(c.makeupWeeks&&c.makeupWeeks.includes(t.week)&&att<c.weeks.length)) continue; }   /* 只有某幾週的課（服務學習：AA_110 6-1）；次數不夠時補做週也排 */
     for(const s of c.slots){ if(s.wd!==wd) continue; const b=B(s.block); out.push({c,slot:s,t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+s.block,room:COURSES.rooms[c.room]||{},week:t.week,exam:c.kind==='service'?null:t.exam,term:t.id}); } }
    out.sort((a,b)=>a.t0-b.t0);
    /* 同一門課同一天連著兩格（大四下的實習整天）：合併成一格 */
    for(let i=out.length-1;i>0;i--){ if(out[i].c===out[i-1].c){ out[i-1].t1=out[i].t1; out.splice(i,1); } }
    return out; };
  /* 'upcoming'（還沒開始、還不能進）／'open'（可以進教室上課）／'missed'（開始後 30 分鐘還沒來）／'done'（上過了）*/
  S.status=function(G,it){ const R=S.rec(G), h=hr(G); if(R.done[it.key]) return 'done'; if(it.day<G.day||(it.day===G.day&&late(G))) return 'missed'; if(it.day>G.day) return 'upcoming'; if(h<it.t0-WIN0) return 'upcoming'; if(h<it.t0+WIN1) return 'open'; return 'missed'; };
  S.live=(G,it)=>it.day===G.day&&!late(G)&&hr(G)>=it.t0-WIN0&&hr(G)<it.t1;   // 這堂課現在在上（教授在教室、同學在座位上）
  /* 第二天的民法總則（劇情課）：story3d.js 處理 */
  S.storyClass=(G,it)=>it.c.id==='civ_general'&&G.day===2;
  S.next=function(G){ return S.dayItems(G).find(it=>{ const s=S.status(G,it); return (s==='open'||s==='upcoming')&&!S.storyClass(G,it); })||null; };
  S.open=function(G){ return S.dayItems(G).find(it=>S.status(G,it)==='open'&&!S.storyClass(G,it))||null; };
  S.liveIn=function(G,zone){ return S.dayItems(G).filter(it=>S.live(G,it)&&it.room.zone===zone&&!S.storyClass(G,it)); };
  S.liveDoor=function(G,door){ return S.dayItems(G).find(it=>S.live(G,it)&&it.room.door===door)||null; };
  /* 教授現在在哪（story3d.js 的 schedFor 用）：上課時在那間教室、下課後 1.5 小時在萬才館（和以前一樣） */
  S.profWhere=function(G,profId){ for(const it of S.dayItems(G)){ if(it.c.prof!==profId) continue; const h=hr(G); if(S.live(G,it)) return it.room.zone?{zone:it.room.zone,act:'class'}:null; if(h>=it.t1&&h<it.t1+1.5) return {zone:'wancai',act:'office'}; } return null; };
  // ---------- 文字 ----------
  S.itemText=it=>hhmm(it.t0)+' '+it.c.name+'（'+(it.room.name||'')+'）';
  S.dayLabel=function(G,day){ if(day==null) day=G.day; const d=CALENDAR.dateOf(day), t=CALENDAR.termOf(day), hol=CALENDAR.holiday(day); let s=d.m+'/'+d.d+' '+WD[d.wd];
    if(hol) s+='・'+hol; if(t) s+='・'+S.termName(t.id)+' 第 '+t.week+' 週'+(t.exam==='mid'?'（期中考週）':t.exam==='final'?'（期末考週）':''); else s+='・'+(d.m>=6&&d.m<=9?'暑假':'寒假'); return s; };   /* 9 月開學前還是暑假（2026-10-13 審查：原本寫成寒假）*/
  S.todayLine=function(G){ const its=S.dayItems(G).filter(it=>!S.storyClass(G,it)); if(!its.length){ const hol=CALENDAR.holiday(G.day), t=CALENDAR.termOf(G.day); return hol?'今天放假（'+hol+'），沒有課':(t?'今天沒有課':'放假中，沒有課'); }
    const ex=its[0].exam; return '今天'+(ex?'考試':'的課')+'：'+its.map(it=>hhmm(it.t0)+' '+it.c.name).join('、'); };
  // ---------- 目標（起床時、下課後）：今天的課＋往下一堂的教室導航；不蓋掉劇情的目標 ----------
  S.goalFor=function(G){ const nx=S.next(G); const txt=S.todayLine(G)+(nx?'。上課、讀書或自由活動都可以':'。自由活動：去圖書館、公館，或找人聊天');
    let dest=null; if(nx){ if(nx.room.zone==='classroom') dest={zone:'classroom',name:nx.room.name}; else if(nx.room.zone&&nx.room.room) dest={zone:nx.room.zone,label:S.roomLook(nx.room),name:nx.room.name}; else if(nx.room.door&&nx.room.zone) dest={zone:nx.room.zone,label:nx.room.label||nx.room.name,name:nx.room.name};   /* 區域裡的門口上課（沒有教室座位：萬才館研討室 A）：導航指那扇門 */ else if(nx.room.door) dest={zone:'campus',label:nx.room.name,name:nx.room.name}; }
    return {text:txt,dest}; };
  /* 建築裡的教室（src/teach3d.js）：門口「看看共同 101 教室」那個互動點（目標導航找得到）*/
  const BLDG_SHORT={gongtong:'共同 ',boya:'博雅 ',putong:'普通 '};
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
  /* BB 的普通課堂內容（src/data/syllabus.js，AA_104 的 syllabus 格式）：每週 {w, tpl A／B／C, board 三行, line 教授一句, react 同學反應[{who,text}], obs 觀察小選擇, call 被點到}；
     國文、英文、體育、實習是台詞池（pools：每週一句）。同學反應只用遊戲裡已經有的人物（heroine_06、日文班等新人物的設定還沒確認：略過），'class'＝不具名同學 */
  let sylDone=false; function attachSyllabus(){ if(sylDone||typeof SYLLABUS==='undefined'||typeof COURSES==='undefined') return; sylDone=true;
    for(const c of COURSES.list){ if(SYLLABUS.courses[c.id]) c.syllabus=SYLLABUS.courses[c.id]; if(SYLLABUS.pools[c.id]) c.pool=SYLLABUS.pools[c.id]; if(SYLLABUS.skip[c.id]) c.skipLines=SYLLABUS.skip[c.id]; if(SYLLABUS.second&&SYLLABUS.second[c.id]) c.second=SYLLABUS.second[c.id]; } }
  const reactOK=(r,day)=>r&&r.text&&(r.who==='class'||(r.who!=='heroine_06'&&r.who!=='heroine_05'&&typeof CHARACTERS!=='undefined'&&!!CHARACTERS[r.who]&&(day==null||typeof STORY==='undefined'||!STORY.present||STORY.present(r.who,{day}))));   /* 那學期不在學校的人（presence）沒有反應句；溫書瑀高兩屆，不在祐廷的任何一堂課（AA_110 5-7）*/
  S.reactLine=function(r){ if(!r) return ''; const act=/^（.*）$/.test(r.text); if(r.who==='class') return act?r.text:'同學：「'+r.text+'」';
    const nm=(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(r.who):((CHARACTERS[r.who]||{}).name||'同學'); return act?nm+r.text:nm+'：「'+r.text+'」'; };
  const pickReact=(arr,it)=>{ const ok=(arr||[]).filter(r=>reactOK(r,it.day)); return ok.length?S.reactLine(ok[(it.day+it.week)%ok.length]):''; };
  /* 一週兩格的課（大三上的民訴甲上、刑訴；AA_103）：這一堂是那一週的第幾格（照星期排）、前面的格子是不是都放假 */
  S.slotOrder=function(it){ const ss=(it.c.slots||[]).slice().sort((a,b)=>a.wd-b.wd||String(a.block).localeCompare(String(b.block))); return {i:ss.indexOf(it.slot),ss}; };
  S.earlierSlotsOff=function(it){ const o=S.slotOrder(it); if(o.i<1||typeof CALENDAR==='undefined') return false; const wd=it.slot.wd; return o.ss.slice(0,o.i).every(q=>q.wd!==wd&&CALENDAR.holiday(it.day-(wd-q.wd))); };
  /* 第二格是短片段（BB 的 second_slot_lines，一句）；第一格碰到國定假日，那一週的主要內容改在第二格播、第二格原本的內容不播（AA_110 5-6；兩格都放假＝那一週的內容看不到，和真的停課一樣）*/
  S.content=function(it){ attachSyllabus(); const c=it.c, t=S.topic(c,it.week)||c.name; const sy=c.syllabus&&c.syllabus.find(q=>q.w===it.week);
    if(c.second&&c.second.length&&S.slotOrder(it).i>=1&&!S.earlierSlotsOff(it)){ const L=c.second; return {board:[c.name+'：'+t,'（這週的第二堂）',''],line:L[(it.day+it.week)%L.length],react:'',second:true}; }
    if(sy) return {board:sy.board||[c.name+'：'+t,'',''],line:sy.line,react:pickReact(sy.react,it),tpl:sy.tpl,obs:sy.obs,call:sy.call};
    if(c.pool&&c.pool.lines&&c.pool.lines.length){ const L=c.pool.lines; return {board:[c.name+'：'+t,'本週：'+t,''],line:L[(it.day+it.week)%L.length],react:pickReact(c.pool.react,it),prof:c.pool.prof_label}; }
    const f=(c.prof&&STYLE[c.prof])||GENERAL; const [line,react]=f(t); const ti=(TEACH.indexOf(it.week)); const nt=ti>=0&&ti<TEACH.length-1?S.topic(c,TEACH[ti+1]):'';
    return {board:[c.name+'：'+t,'本週：'+t,nt&&nt!==t?'下週：'+nt:(it.week<8?'第 8～9 週期中考':'第 17～18 週期末考')],line,react}; };
  // ---------- 上課（普通課堂；考試週＝考試）----------
  S.attend=async function(GM,it,o){ o=o||{}; const G=GM.G, E=GM.E, R=S.rec(G), c=it.c; if(R.done[it.key]) return false;
    const exam=it.exam, prof=c.prof&&typeof EVENTS!=='undefined'?EVENTS.npcOf(c.prof):null; const ct=S.content(it); const door=!!o.door;
    if(!o.inScene) GM.sceneBegin(door?{adv:true}:undefined);
    try{
      /* 服務學習（AA_110 第 6-1 節，AA 暫定）：0 學分、只記次數；在櫃台報到，2D 畫面每次一句（不帶人物）——第 n 次報到用第 n 句：第 1、9 句固定在第一次和最後一次，
         中間照順序；補做（第 15、16 週）用的是還沒看過的那幾句（照次數排，不照週次）*/
      if(c.kind==='service'){ const n=R.attend[c.id]||0, Ls=c.serviceLines||[], need=(c.weeks||[]).length;
        await GM.say(null,Ls.length?Ls[Math.min(n,Ls.length-1)]:'你在'+(it.room.name||'這裡')+'做了兩個小時的服務學習。');
        await GM.fade(true); const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); R.done[it.key]=1; R.attend[c.id]=n+1; GM.energy(-4); await GM.fade(false);
        GM.caption('',c.name+'：第 '+(n+1)+' 次'+(need?'（'+Math.min(n+1,need)+'／'+need+'）':'')+(need&&n+1>=need?'，時數滿了。':'。'),2800); }
      else {
      if(!door&&E.zone&&E.zone.setBoard) E.zone.setBoard(exam?c.name+'：'+(exam==='mid'?'期中考':'期末考'):ct.board[0],exam?'不可以翻書':ct.board[1],exam?'鈴響請停筆':ct.board[2]);
      if(exam){ const p=R.prep[c.id]||0; await GM.say(null,'考卷發下來。'+c.name+(exam==='mid'?'期中考':'期末考')+'。');
        await GM.say(null,p>=8?'題目你都見過——上課講過、自己也讀過。你寫得很順。':p>=4?'有幾題你有印象，有一題你只記得老師在黑板上畫過圖。':'你認得題目裡的每一個字，合起來就不太認得了。'); }
      else { await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+ct.line); if(ct.react) await GM.say(null,ct.react);
        /* B：觀察的小選擇（只顯示一行結果，不影響數值）；C：被點到（三個選項共用收尾）——BB 的 syllabus（AA_104）*/
        if(ct.tpl==='B'&&ct.obs&&ct.obs.options&&ct.obs.options.length){ if(ct.obs.prompt) await GM.say(null,ct.obs.prompt); const i=await GM.choose(ct.obs.options.map(o=>({t:o.text}))); const r=ct.obs.options[i]&&ct.obs.options[i].result; if(r) await GM.say(null,r); }
        else if(ct.tpl==='C'&&ct.call&&ct.call.options&&ct.call.options.length){ await GM.say(null,(c.prof?S.profName(c):'老師')+'點到你。'); await GM.choose(ct.call.options.map(o=>({t:'「'+o+'」'}))); for(const f of (ct.call.follow||[])) await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+f); } }
      if(E.zone&&E.zone.layout) S.syncRooms(GM);   /* 快轉前同學先坐好（人流每 15 分鐘才排一次；剛好在那之前坐下的話，下課時沒有人站起來走出去）*/
      await GM.fade(true); const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); keepCrowd(G); R.done[it.key]=1; if(!exam){ R.attend[c.id]=(R.attend[c.id]||0)+1; R.prep[c.id]=(R.prep[c.id]||0)+1; } GM.energy(exam?-10:-6); await GM.fade(false);
      GM.caption('',exam?'考完了。':'下課了。'+(c.prof?S.profName(c)+'收起講義。':''),2400);
      }
    } finally { if(!o.inScene) GM.sceneEnd(); }
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  /* 聽演講、參加活動（AA_107 第 10-1 節第 5 項）：坐在活動的那一間選「聽演講」→ 記下到場（ACTIVITIES.markAttended）→ 快轉到結束。
     之後的事件用 prereq.attended／missed 判斷（沒去就不會觸發聽完才合理的對話）。活動的內容（講者說什麼、誰在場）由 AA、BB 寫成條件事件；這裡只有一般的場面。 */
  S.attendActivity=async function(GM,a,o){ o=o||{}; const G=GM.G; if(!a||typeof ACTIVITIES==='undefined'||ACTIVITIES.attended(G,a.id,G.day)) return false;
    if(!o.inScene) GM.sceneBegin();
    try{
      ACTIVITIES.markAttended(G,a); const lec=a.kind==='lecture';
      if(GM.E&&GM.E.zone&&GM.E.zone.setBoard) GM.E.zone.setBoard(a.title,lec?'演講':'活動',hhmm(a.t0)+'–'+hhmm(a.t1));
      await GM.say(null,hr(G)<a.t0?(lec?'你找了位子坐下。台上的人在試麥克風，投影片停在第一頁：「'+a.title+'」。':'你找了位子坐下，等「'+a.title+'」開始。'):(lec?'你輕輕坐下。台上已經開始講「'+a.title+'」了。':'你輕輕坐下。「'+a.title+'」已經開始了。'));
      if(GM.E&&GM.E.zone&&GM.E.zone.layout) S.syncRooms(GM);   /* 快轉前聽眾先坐好（2026-10-13 批次 3：演講開始前 5 分鐘坐下選「聽演講」，聽眾還沒排進來就快轉到結束，散場時沒有人站起來）*/
      await GM.fade(true); const h=hr(G); if(h<a.t1) GM.advance(a.t1-h); keepCrowd(G); GM.energy(-4); await GM.fade(false);
      GM.caption('',lec?'演講結束了。台下有人舉手，有人已經在收東西。':'活動結束了。',2800);
    } finally { if(!o.inScene) GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 座位（霖澤館 201）：這堂課現在可以上 → 坐下時的第一個選項（game3d.js 的 seatMenu）*/
  S.seatClass=function(G,seat){ if(!G) return null; if(seat&&seat.room) return S.liveIn(G,G.zone).find(it=>it.room.room===seat.room&&S.status(G,it)==='open')||null;   /* 建築裡的教室（共同教學館 101…）：座位在那一間 */
    if(G.zone!=='classroom') return null; return S.liveIn(G,'classroom').find(it=>S.status(G,it)==='open')||null; };
  // ---------- 門口上課（共同教學館、體育館、萬才館研討室）：校園的互動點 ----------
  const DOORS={ common:{zone:'campus',x:2,z:22.8,radius:1.6,label:'共同教學館',mark:true,enter:'gongtong',look:'共同教學館：大一國文、大一英文、通識在這裡上課。'},   /* enter：館內（src/teach3d.js，D55 第二階段）；沒有課時按門就進館，有課時多一個「進去上課」 */   /* 2026-10-13：原本在 (45,22.6) 一棟無名系館門口；共同教學館蓋在真實位置（行政大樓東邊）後搬到它的正門 */
                putong:{zone:'campus',x:-38,z:-49.4,radius:1.6,label:'普通教學館',mark:true,enter:'putong',look:'普通教學館：文學院後面那棟，很多共同課程、通識在這裡上；二樓有空橋通博雅。'},   /* 方案 A（D55）：文學院正後方，正門朝南 */
                boya:{zone:'campus',x:-38,z:-72.8,radius:1.6,label:'博雅教學館',mark:true,enter:'boya',look:'博雅教學館：一樓有大階梯教室和自習區，常有演講；北邊就是醉月湖。'},   /* 方案 A：普通北邊，正門朝南（空橋底下）*/
                gym:{zone:'campus',x:74,z:59.4,radius:1.6,label:'體育館',look:'體育館：體育課在這裡上。'},
                lawlib_desk:{zone:'lawlib',built:true,label:'櫃台',verb:'報到',noToday:true,look:'櫃台：借書、還書、借討論室都在這裡辦。館員正把一疊還回來的書一本一本掃條碼，抬頭說：「還書放旁邊的還書口就好。」'},   /* 服務學習（一）在櫃台報到（AA_110 6-1）；互動點是法律學院圖書館自己的櫃台（lawlib3d.js）*/
                campus_service:{zone:'campus',x:-40,z:11.2,radius:1.6,label:'服務學習集合點',verb:'報到',terms:['Y2S1'],look:'傅鐘旁的服務學習集合點。'},   /* 服務學習（二）（大二上；內容 AA 大二前再補）：只在那學期出現 */
                wancai_seminar:{zone:'wancai',built:true,label:'研討室 A',look:'研討室 A：萬才館二樓的小教室，大四的研討課在這裡上。'} };   /* built：門的互動點由區域自己建（wancai3d.js 的研討室 A），addDoors 不另外加 */
  S.DOORS=DOORS;
  S.addDoors=function(GM,zoneId){ const E=GM.E; const tm=typeof CALENDAR!=='undefined'&&GM.G?CALENDAR.termOf(GM.G.day):null; for(const k in DOORS){ const d=DOORS[k]; if(d.zone!==zoneId||d.built) continue; if(d.terms&&!(tm&&d.terms.includes(tm.id))) continue;
      E.interactables.push(Object.assign({x:d.x,z:d.z,radius:d.radius,lv:0,label:d.label,door:k,mark:!!d.mark,onInteract:()=>S.doorInteract(GM,k)},d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]?{exit:{to:d.enter}}:{})); } };   /* exit：讓目標導航知道這個門通到館裡（按下去照樣走 onInteract）*/
  S.doorInteract=async function(GM,k,o){ o=o||{}; const G=GM.G, d=DOORS[k]; const it=S.liveDoor(G,k);
    if(d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]&&(!it||it.room.zone===d.enter)){ await GM.enter(d.enter); if(it&&S.status(G,it)!=='done') GM.toast(S.status(G,it)==='open'?'上課的教室：'+it.room.name+'（找個位子坐下）':it.c.name+'已經開始超過 30 分鐘了（'+it.room.name+'），現在進去不算出席',4200); return; }   /* liveDoor 只會是 open 或 missed（2026-10-13 審查：遲到時原本寫「等一下的課在」）*/   /* 課在館內的教室上（2026-10-13）*/
    if(it&&S.status(G,it)==='open'){ const opts=[{t:(d.verb||'進去上課')+'：'+it.c.name,hint:hhmm(it.t0)+'–'+hhmm(it.t1)+'（點對話可以略過）'}]; if(d.enter&&Z3.ZONES[d.enter]) opts.push({t:'進館裡逛逛（不上課）'}); opts.push({t:'不上了'});
      const ch=await (async()=>{ GM.sceneBegin(); try{ return await GM.choose(opts); } finally { GM.sceneEnd(); } })(); if(ch===0) await S.attend(GM,it,{door:true}); else if(d.enter&&opts[ch].t.startsWith('進館')) await GM.enter(d.enter); return; }
    if(d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]){ await GM.enter(d.enter); return; }   /* 沒有課：公共空間照常可以進（使用者 2026-10-13：「不必每次進入都觸發故事」）*/
    const today=S.dayItems(G).filter(q=>q.room.door===k); if(d.noToday&&!today.length){ GM.caption('',o.look||d.look,4800); return; } const s=today.length?'今天在這裡的課：'+today.map(q=>hhmm(q.t0)+' '+q.c.name+'（'+({done:'上過了',missed:'沒去',open:'可以進去',upcoming:'還沒開始'})[S.status(G,q)]+'）').join('、'):'今天沒有你在這裡的課。'; GM.caption('',(o.look||d.look)+s,4800); };
  // ---------- 自學：選一門課（AA_104 4-3：和上課累積同一個「準備」）----------
  /* 回傳：null＝沒有給選單（放假、沒有課）；{course}＝選了一科；{notes:true}＝整理這週的筆記（不挑一科）；{extra:i}＝選了 extra 的第 i 項（game3d.js：研究所準備）*/
  S.studyPick=async function(GM,extra){ const G=GM.G; const t=CALENDAR.termOf(G.day); if(!t) return null; const cs=S.termCourses(G,t.id).filter(c=>c.kind!=='service'&&(c.kind!=='general'||c.id.startsWith('ge_'))); if(!cs.length) return null;   /* 通識（ge_*）可以自學；國文、英文、體育不列 */
    const nx=S.next(G); cs.sort((a,b)=>(nx&&a===nx.c?-1:0)-(nx&&b===nx.c?-1:0));
    const ex=extra||[], opts=ex.concat(cs.slice(0,6).map(c=>({t:c.name,hint:'這週：'+(S.topic(c,t.week)||'')}))); opts.push({t:'整理這週的筆記（不挑一科）'}); const i=await GM.choose(opts);
    if(i<ex.length) return {extra:i}; if(i>=ex.length+cs.slice(0,6).length) return {notes:true};
    const c=cs[i-ex.length]; const R=S.rec(G); R.prep[c.id]=(R.prep[c.id]||0)+1; return {course:c}; };
  // ---------- 學期結束的成績單（AA_104 第 5、10 節：文字，不顯示分數與排名，不會沒過）----------
  S.gradeOf=p=>p>=10?'很好':(p>=5?'不錯':'過了');
  S.reportFor=function(G,termId){ const R=S.rec(G); const g={}; for(const c of S.termCourses(G,termId)){ if(c.kind==='service') continue; g[c.id]=S.gradeOf(R.prep[c.id]||0); } return g; };   /* 服務學習只記次數，不進成績單（AA_110 6-1）*/
  // ---------- 選課結果（AA_104 第 2 節、AA_110 第 4 點）----------
  /* 新學期第一週的前一天早上，讓玩家選這學期的選修：同一組二選一；choice.none＝可以不修（大一下的法律與社會）。預設的那一門排第一。
     錯過前一天（開學頭兩週才第一次起床）就在那時候問；第三週以後才第一次起床（舊存檔）＝照預設，不再問。大一上沒有選課（遊戲從第 3 週開始，AA_103）。 */
  S.choiceGroups=function(termId){ const out={}; for(const c of COURSES.list){ if(c.term!==termId||!c.choice) continue; const g=out[c.choice.group]||(out[c.choice.group]={group:c.choice.group,def:c.choice.default,none:false,opts:[]}); g.opts.push(c); if(c.choice.none) g.none=true; } return Object.values(out); };
  S.slotText=c=>c.slots.map(s=>WD[s.wd]+(COURSES.blocks[s.block]||{}).label).join('、')+'・'+S.roomName(c);
  S.selectTerm=async function(GM,termId){ const G=GM.G, R=S.rec(G), gs=S.choiceGroups(termId); R.note['sel_'+termId]=1; if(!gs.length) return false;
    GM.sceneBegin(); try{ await GM.say(null,'選課結果出來了：'+S.termName(termId)+'。');
      for(const g of gs){ const opts=g.opts.map(c=>({t:c.name,hint:S.slotText(c),id:c.id})); if(g.none) opts.push({t:'這學期不修'+(g.opts.length===1?g.opts[0].name:''),hint:'那個時段沒有課',id:'none'});
        opts.sort((a,b)=>(b.id===g.def)-(a.id===g.def));
        await GM.say(null,g.none&&g.opts.length===1?g.opts[0].name+'要修嗎？':g.opts.map(c=>c.name).join('、')+'，選一門。');
        const i=await GM.choose(opts.map(o=>({t:o.t,hint:o.hint}))); R.electives[g.group]=(opts[i]||opts[0]).id; }
      await GM.say(null,'這學期的課表在手機的「課表」。'); } finally { GM.sceneEnd(); }
    return true; };
  /* 起床時呼叫：前一個學期剛結束（今天不在那個學期、成績還沒發）→ 發成績單；新學期的前一天（或開學頭兩週）→ 選課結果 */
  S.morning=async function(GM){ const G=GM.G, R=S.rec(G); const prev=CALENDAR.termOf(G.day-1), now=CALENDAR.termOf(G.day);
    if(prev&&(!now||now.id!==prev.id)&&!R.grades[prev.id]){ R.grades[prev.id]=S.reportFor(G,prev.id); const lines=S.termCourses(G,prev.id).map(c=>c.name+'：'+(c.kind==='service'?(R.attend[c.id]||0)+'／'+(c.weeks||[]).length+' 次':R.grades[prev.id][c.id]));   /* 服務學習只寫次數（AA_110 6-1）*/
      GM.sceneBegin(); try{ await GM.say(null,S.termName(prev.id)+'的成績出來了。'); await GM.say(null,lines.join('　')); } finally { GM.sceneEnd(); } }
    const tmr=CALENDAR.termOf(G.day+1), selT=tmr&&tmr.week===1&&(!now||now.id!==tmr.id)?tmr:(now&&now.week<=2?now:null);
    if(selT&&!R.note['sel_'+selT.id]) await S.selectTerm(GM,selT.id);
    else if(now&&!R.note['sel_'+now.id]) R.note['sel_'+now.id]=1;
    if(now&&now.week===1&&CALENDAR.dateOf(G.day).wd===1&&R.note.termStart!==now.id){ R.note.termStart=now.id; GM.toast(S.termName(now.id)+'開學了。手機的「課表」可以看這學期的課。',4800); }
    if(now&&(now.exam)&&R.note['exam_'+now.id+'_'+now.exam]!==1){ R.note['exam_'+now.id+'_'+now.exam]=1; GM.toast((now.exam==='mid'?'期中考週':'期末考週')+'開始了。這兩週的課都是考試。',4800); } };
  // ---------- 每 0.5 秒（story3d.js 的 S.tick）：上課前 30 分鐘的提醒、目標更新、教室裡的同學 ----------
  let lastT=null;
  S.tick=function(GM){ const G=GM.G; if(!G||!G.flags) return; const R=S.rec(G), h=hr(G);
    for(const it of S.dayItems(G)){ if(S.storyClass(G,it)) continue; const k='rem_'+it.key; if(R.note[k]) continue; if(h>=it.t0-WIN0&&h<it.t0&&!R.done[it.key]){ R.note[k]=1; if(!GM.S||GM.S.classRemind!==false) GM.toast('30 分鐘後上課：'+S.itemText(it),4200); } }
    const sig=G.day+':'+Math.floor(h*4); if(sig!==lastT){ lastT=sig; S.refreshGoal(GM); if(G.zone==='classroom'||(GM.E.zone&&GM.E.zone.layout)) S.syncRoom(GM); }
    S.updateHUD(GM); };
  /* 霖澤館 201：上課時間座位上有同學（背景人物，坐著）；下課後離開。教授由 story3d.js 的作息（schedFor → CLS.profWhere）處理 */
  /* 建築裡的教室（共同教學館…）：正在上課的每一間坐一半左右的同學（位子照課程與日期固定：出去再進來是同一批人）；下課的那一間的人離開 */
  /* 建築裡的教室（共同、博雅…）：上課的時候坐一部分同學；演講、活動（src/data/activities.js，有 zone、room 的）開始前 15 分鐘到結束也一樣（人數照活動的 crowd.n）*/
  /* 下課：同學站起來、從教室門走到建築出口（走到了、不在畫面上才移除，crowd3d.js 的 sweep）；時間突然跳了（跳過時間、讀檔、快速前往、剛進區域）就直接移除 */
  let lastSync=null;
  /* 玩家自己坐著上完課、聽完演講（快轉到結束）：時間是「待在這裡過完的」，不是跳過去——下一次同步照一般的下課處理，同學站起來走出去（不是在黑畫面裡一起消失）*/
  const keepCrowd=G=>{ lastSync={zone:G.zone,h:G.hour}; if(typeof CROWD!=='undefined'&&CROWD.keep) CROWD.keep(G); };   /* crowd3d.js 自己也記時間（門口的人群、走出去的同學 n.crowd）：兩邊都要知道 */
  function walkOut(GM,n){ const E=GM.E, L=E.zone&&E.zone.layout; if(!L||typeof CROWD==='undefined'||!CROWD.seatSide) return false; const st=n.seat, ap=st&&CROWD.seatSide(E,st); if(!ap) return false; const lv=st.lv|0;
    n.obj.position.set(ap[0],E.heightAt(ap[0],ap[1],lv),ap[1]); n.lv=lv; n.seat=null; n.clsStudent=false; n.frozen=false; n.pose='walk'; n.idlePose='idle'; n.leaving=true; n.arrived=false; n.crowd='cls';
    const ex=L.entrance.exit; return E.moveTo(n,ex.x,ex.z-0.7,()=>{ n.arrived=true; },0); }
  S.syncRooms=function(GM,opt){ const G=GM.G, E=GM.E; if(!E.zone||!E.zone.seats||!E.zone.layout) return; const live=S.liveIn(G,G.zone).filter(it=>it.room.room);
    const instant=(opt&&opt.instant)||!lastSync||lastSync.zone!==G.zone||Math.abs(G.hour-lastSync.h)>0.6; lastSync={zone:G.zone,h:G.hour};
    if(typeof ACTIVITIES!=='undefined') for(const a of ACTIVITIES.active(G,{before:0.25})) if(a.zone===G.zone&&a.room) live.push({key:'act:'+a.id+':'+G.day,room:{room:a.room},n:a.crowd&&a.crowd.n});
    const keys=new Set(live.map(it=>it.key));
    for(const n of E.npcs.slice()){ if(n.clsStudent&&!keys.has(n.clsKey)){ if(instant||!walkOut(GM,n)) E.removeNPC(n); } }
    for(const it of live){ if(E.npcs.some(n=>n.clsStudent&&n.clsKey===it.key)) continue; const seats=E.zone.seats.filter(q=>q.room===it.room.room&&(q.kind==='class'||q.kind==='lecture')); let h=0; for(const ch of it.key) h=(h*31+ch.charCodeAt(0))>>>0;
      /* 一半的位子（照種子洗牌：同一堂課同一些位子），留一半給玩家 */ let sd=h%2147483646+1; const rnd=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; }; const idx=seats.map((q,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
      for(const i of idx.slice(0,Math.min(16,it.n||Math.round(seats.length*0.5)))){   /* 最多 16 人（和霖澤館 201 一樣；階梯教室 40 個位子不會一次載 20 個人物）*/ const st=seats[i]; if(E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35)) continue; const o=CHAR.build(STORY.extraSpec(200+((h+i*7)%97))); o.position.set(st.x,st.y||0,st.z); o.rotation.y=st.yaw;   /* 階梯教室：座位的高度（addNPC 也照 seat.y 放）*/
        E.addNPC({obj:o,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,seat:st,lv:st.lv|0,clsStudent:true,clsKey:it.key}); } } };
  S.syncRoom=function(GM){ const G=GM.G, E=GM.E; if(E.zone&&E.zone.layout) return S.syncRooms(GM); if(!E.zone||!E.zone.seats) return; const live=S.liveIn(G,'classroom'); const key=live.length?live[0].key:null;
    const mine=E.npcs.filter(n=>n.clsStudent); if(mine.length&&mine[0].clsKey!==key){ for(const n of mine){ if(n.obj&&n.obj.parent) n.obj.parent.remove(n.obj); } E.npcs=E.npcs.filter(n=>!n.clsStudent); }
    if(!key||E.npcs.some(n=>n.clsStudent)) return; const seats=E.zone.seats; let i=0; const cells=[[0,0],[0,2],[0,5],[1,1],[1,6],[2,0],[2,2],[2,4],[2,7],[3,1],[3,3],[3,6],[4,0],[4,5],[5,2],[5,7]];
    for(const [r,c] of cells){ const s=seats.find(q=>q.row===r&&q.col===c); if(!s) continue; if(E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-s.x,n.seat.z-s.z)<0.35)) continue; const o=CHAR.build(STORY.extraSpec(60+i)); i++; o.position.set(s.x,s.y||0,s.z); o.rotation.y=s.yaw;
      E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s,clsStudent:true,clsKey:key}); } };
  // ---------- HUD：下一堂（點了打開手機）----------
  S.updateHUD=function(GM){ const el=document.getElementById('nextClass'); if(!el) return; const G=GM.G; if(!G||GM.titleIdle){ el.classList.add('hide'); return; }
    const cur=S.dayItems(G).find(it=>S.live(G,it)&&S.rec(G).done[it.key]); let s='';
    const nx=S.next(G); if(nx){ const st=S.status(G,nx); s=(st==='open'?'現在可以上課：':'下一堂 ')+S.itemText(nx); } else s=S.dayItems(G).length?'今天的課都結束了':(CALENDAR.termOf(G.day)?'今天沒有課':'放假中');
    if(el.dataset.s!==s){ el.dataset.s=s; el.textContent=s; } el.classList.remove('hide'); };
  // ---------- 快速前往（D54 ①：已知地點可以快速前往，依距離花合理的遊戲時間）----------
  /* 各區域在校園座標裡大概的位置（公館、溫州街照 zones3d.js 的換算：公館 (gx,gz) → 校園 (x=-170-gz, z=gx)；溫州街和公館在巷口 (-71,16.5) 相接）。只用來估時間。
     遊戲的校園比真的小（校門到霖澤館 160 m，真的大約 1 km）：時間照真實步行算——遊戲距離 ×6、每分鐘 80 m，加 2 分鐘進出建築，四捨五入到 5 分鐘、最少 5 分鐘
     （宿舍→霖澤館約 15 分鐘、霖澤館→溫州街 Café 約 20 分鐘）*/
  const ANCHOR={ linze:[34,-112], classroom:[34,-112], gongtong:[2,33], boya:[-38,-83], putong:[-38,-58.5], wancai:[93.8,-100], lawlib:[85,-102], soclib:[97.9,-70], library_hall:[80,0], library:[80,0], dorm:[20,68], dorm_hall:[20,68],
                 gongguan:[-140,0], cvs:[-188,-29], bookstore:[-188,-42], noodle:[-188,-63], wenzhou:[-200,-95], cafe:[-192,-75] };
  S.travelMinutes=function(G,fromZone,toZone,pos,toPos){ if(fromZone===toZone&&toZone!=='campus') return 0;
    const a=fromZone==='campus'&&pos?[pos.x,pos.z]:ANCHOR[fromZone], b=toZone==='campus'?(toPos?[toPos.x,toPos.z]:[-38,6]):ANCHOR[toZone]; if(!a||!b) return 15;
    const d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(fromZone==='campus'&&toZone==='campus'&&d<12) return 0;
    const m=2+d/13; return Math.max(5,Math.round(m/5)*5); };
  // ---------- 時間跳轉（D54 ③：要安全）----------
  /* 規則：
     - 第一、二天（主線劇情的兩天）不能跳；劇情、對話進行中不能跳；不跳過午夜（隔天＝回宿舍睡覺）。
     - 跳轉一次走 10 分鐘，每一步檢查：特殊課堂（有內容的那一週）開始前 10 分鐘停；已接受的邀約（之後的手機邀約）前 10 分鐘停；
       這個地方的自動劇情事件（沒有隨機權重、不靠近某人才觸發的）條件成立就停，讓它照常發生；人在法圖、閉館前 10 分鐘停。
     - 普通課堂不中斷跳轉（D54：普通課堂與可重複的日常不必強制中斷）：中間經過的課＝沒去（手機會寫）；跳之前確認一次。
     - 跳完：NPC 作息、目標、HUD 照新的時間更新（story3d.js 的 S.tick），自動存檔。 */
  S.canSkip=function(GM){ const G=GM.G; if(!G||G.day<3) return '第一、二天先跟著劇情走'; if(late(G)) return '已經過午夜了，回宿舍睡覺吧（睡醒就是明天）'; if(GM.D&&GM.D.active) return '對話中'; if(GM.E&&GM.E.player&&GM.E.player.busy) return '現在不能跳'; return ''; };
  S.skipStops=function(GM,h1){ const G=GM.G, out=[]; const h0=hr(G);
    for(const it of S.dayItems(G)){ const sp=(it.c.specials||[]).find(q=>q.w===it.week&&q.content); if(sp&&it.t0-1/6>h0&&it.t0-1/6<h1) out.push({h:it.t0-1/6,why:'特殊課堂：'+it.c.name}); }
    for(const iv of (G.invites||[])){ if(iv.day===G.day&&iv.accepted&&!iv.done&&iv.h-1/6>h0&&iv.h-1/6<h1) out.push({h:iv.h-1/6,why:'約好的時間：'+(iv.label||'')}); }
    if(typeof PLACES!=='undefined'&&PLACES.hours[G.zone]){ const o=PLACES.hours[G.zone]; const c=o.rules?(PLACES.windowOf(G.zone,G.day)||[0,0])[1]:(o.close!=null&&o.close<=24?o.close:null);   /* 人在有開放時間的地方（法圖、總圖、Café…）：閉館前 10 分鐘停，不會跳到閉館以後還待在館裡 */
      if(c&&c-1/6>h0&&c-1/6<h1) out.push({h:c-1/6,why:(PLACES.names&&PLACES.names[G.zone]||'這裡')+'快關門了'}); }
    if(typeof EVENTS!=='undefined'&&typeof STORY_EVENTS!=='undefined'&&EVENTS.check){ const keep=G.hour; try{ /* 每 10 分鐘的整點（整數 k 算，不累加 1/6：浮點誤差會晚 10 分鐘）*/ for(let k=Math.floor(h0*6+1e-6)+1;k/6<h1;k++){ const t=k/6; G.hour=Math.floor(keep/24)*24+t; const ev=STORY_EVENTS.find(e=>e.trigger==='auto'&&e.random_weight===undefined&&!e.near&&EVENTS.check(e)); if(ev){ out.push({h:t,why:ev.title||'有事發生'}); break; } } } finally { G.hour=keep; } }
    out.sort((a,b)=>a.h-b.h); return out; };
  /* 人在有開放時間的地方、已經在閉館前 10 分鐘以內（或已經過了閉館時間）：不能跳過閉館，先離開（不然停在閉館前 10 分鐘之後再按一次，就會跳到閉館後還待在館裡）*/
  S.closingBlock=function(G,h1){ if(typeof PLACES==='undefined'||!PLACES.hours[G.zone]) return ''; const o=PLACES.hours[G.zone], h0=hr(G); const c=o.rules?(PLACES.windowOf(G.zone,G.day)||[0,0])[1]:(o.close!=null&&o.close<=24?o.close:null);
    if(!c||h1<=c) return ''; if(h0>=c-1/6-1e-6) return (PLACES.names&&PLACES.names[G.zone]||'這裡')+(h0>=c?'已經':'快要')+'閉館了（'+hhmm(c)+'），先離開再跳過時間。'; return ''; };
  /* o.nap：在床上小睡（story3d.js 的 S.bedOptions）——一樣的停點與確認；醒來體力每小時 +8（最多 +40），旁白寫「醒來」*/
  S.skipTo=async function(GM,h1,o){ o=o||{}; const G=GM.G, why=S.canSkip(GM); if(why){ GM.toast(why,3000); return false; } const h0=hr(G); if(h1<=h0+0.05) return false; if(h1>23.99) h1=23.99;
    const cb=S.closingBlock(G,h1); if(cb){ GM.toast(cb,4000); return false; }
    const stops=S.skipStops(GM,h1); const stop=stops[0]; const target=stop?stop.h:h1;
    const passed=S.dayItems(G).filter(it=>S.status(G,it)!=='done'&&it.t0+WIN1>h0&&it.t0+WIN1<=target&&!S.storyClass(G,it));
    if(passed.length){ GM.sceneBegin(); let i=0; try{ i=await GM.choose([{t:'照樣跳過',hint:'會錯過：'+passed.map(it=>hhmm(it.t0)+' '+it.c.name).join('、')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i!==0) return false; }
    GM.sceneBegin(); try{ await GM.fade(true); GM.advance(target-h0); if(o.nap&&GM.energy) GM.energy(Math.min(40,Math.round((target-h0)*8))); await GM.sleep(300); await GM.fade(false); } finally { GM.sceneEnd(); }
    const zn=(typeof Z3!=='undefined'&&Z3.ZONES[G.zone])?Z3.ZONES[G.zone].name:''; GM.caption('',(stop?'（'+stop.why+'）':'')+(o.nap?'你睡了一下，醒來是 '+hhmm(hr(G))+'。':'你在'+(zn||'這裡')+'待到 '+hhmm(hr(G))+'。'),3200);
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  // ---------- 手機的「今天」「課表」----------
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.todayHTML=function(G){ const its=S.dayItems(G).filter(it=>!S.storyClass(G,it)); const st={done:'上過了',missed:'沒去',open:'現在可以進教室',upcoming:'還沒開始'};
    let h='<div class="item"><b>'+esc(S.dayLabel(G))+'</b><div class="muted">現在 '+hhmm(hr(G))+'</div></div>';
    if(!its.length) h+='<div class="item">'+esc(S.todayLine(G))+'</div>';
    for(const it of its){ const s=S.status(G,it); h+='<div class="item phrow"><div><b>'+hhmm(it.t0)+'–'+hhmm(it.t1)+'</b> '+esc(it.c.name)+(it.exam?'（考試）':'')+'<div class="muted">'+esc(it.room.name||'')+(it.c.prof||it.c.profName?'・'+esc(S.profName(it.c)):'')+'・'+st[s]+'</div></div>'+
      ((s==='open'||s==='upcoming')&&it.room.zone?'<button class="btn" data-go="'+esc(it.key)+'">去教室</button>':'')+'</div>'; }
    if(typeof PLACES!=='undefined') h+='<div class="item muted">法律學院圖書館：'+esc(PLACES.todayText('lawlib',G.day))+'　總圖：08:00–22:00</div>';
    const h0=hr(G), nx=S.next(G); const skips=[]; if(late(G)){}   /* 過了午夜：不給跳（睡覺才是明天）*/ else if(nx&&nx.t0-1/6>h0+0.25) skips.push([nx.t0-1/6,'等到下一堂課前（'+hhmm(nx.t0-1/6)+'）']); for(const [t,l] of [[12,'等到中午'],[14,'等到下午'],[17.5,'等到傍晚'],[20,'等到晚上']]) if(!late(G)&&t>h0+0.25&&!skips.some(q=>Math.abs(q[0]-t)<0.3)) skips.push([t,l+'（'+hhmm(t)+'）']);
    if(skips.length) h+='<div class="item"><b>跳過時間</b><div class="muted">沒有想做的事可以跳過；遇到特殊課堂、約好的時間、劇情會停下來。</div><div class="row2" style="flex-wrap:wrap;gap:6px;margin-top:6px">'+skips.map(([t,l])=>'<button class="btn" data-skip="'+t.toFixed(3)+'">'+esc(l)+'</button>').join('')+'</div></div>';
    h+='<div class="item muted">翹課不會被扣分；沒去的課，可以在宿舍、圖書館、Café 讀書補回來。</div>'; return h; };
  /* 只有某幾週的課：「第 4–7、10–14 週」*/
  S.weeksText=function(c){ const w=(c.weeks||[]).slice().sort((a,b)=>a-b); if(!w.length) return ''; const rs=[]; let a=w[0], b=w[0]; for(const x of w.slice(1)){ if(x===b+1){ b=x; continue; } rs.push(a===b?''+a:a+'–'+b); a=b=x; } rs.push(a===b?''+a:a+'–'+b); return '第 '+rs.join('、')+' 週'; };
  S.weekHTML=function(G){ const t=CALENDAR.termOf(G.day); let termId=t?t.id:null; if(!termId){ for(let k=1;k<200&&!termId;k++){ const q=CALENDAR.termOf(G.day+k); if(q) termId=q.id; } }
    if(!termId) return '<div class="item">沒有課表。</div>'; const cs=S.termCourses(G,termId); const todayWd=CALENDAR.dateOf(G.day).wd; const R=S.rec(G);
    let h='<div class="item"><b>'+S.termName(termId)+'</b>'+(t?'・第 '+t.week+' 週':'（下學期）')+'</div><div class="tt"><div class="tth"></div>'; for(let d=1;d<=5;d++) h+='<div class="tth'+(d===todayWd&&t?' on':'')+'">'+WD[d]+'</div>';
    for(const bk of ['am','pm1','pm2']){ h+='<div class="ttb">'+B(bk).label+'<br><span class="muted">'+hhmm(B(bk).t0)+'</span></div>'; for(let d=1;d<=5;d++){ const c=cs.find(q=>q.slots.some(s=>s.wd===d&&s.block===bk)); h+='<div class="ttc'+(d===todayWd&&t?' on':'')+'">'+(c?esc(c.name)+'<br><span class="muted">'+esc(S.roomName(c))+(c.weeks?'・'+esc(S.weeksText(c)):'')+'</span>':'')+'</div>'; } }
    h+='</div><div class="item muted">出席：'+cs.map(c=>esc(c.name)+' '+(R.attend[c.id]||0)+(c.weeks?'／'+c.weeks.length:'')+' 次').join('、')+'</div>'; return h; };
  return S;
})();
