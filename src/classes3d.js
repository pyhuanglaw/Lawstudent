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
  const WIN0=0.5, WIN1=0.5, LATE_END=0.5;   // 開始前 30 分鐘就可以進教室；開始 30 分鐘以後進去＝遲到（照樣上課、有一句旁白），下課前 30 分鐘還沒來＝沒來
                                            // （AA_104 4-1、4-2 原本是開始 30 分鐘後就不能進；使用者 2026-10-15：「遲到就沒辦法上課喔」→ 改成可以遲到）
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
  S.rec=function(G){ const R=G.courses&&typeof G.courses==='object'?G.courses:(G.courses={}); for(const k of ['done','attend','prep','electives','grades','note','disc','ask']) if(!R[k]||typeof R[k]!=='object') R[k]={}; migrateIds(R,G); return R; };
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
  S.dayItems=function(G,day){ if(day==null) day=G.day; if(typeof CALENDAR==='undefined'||CALENDAR.holiday(day)) return []; if(day<=1) return [];   /* 第 1 天（9/17 週三）遊戲從晚上 21:12 開始：那天白天的課在遊戲開始之前，不排、不算沒去（使用者 2026-10-15：「第一天就有一個刑法課顯示沒去？」）*/ const t=CALENDAR.termOf(day); if(!t) return []; const wd=CALENDAR.dateOf(day).wd; const out=[];
    const R0=G.courses&&typeof G.courses==='object'?G.courses:null;
    for(const c of S.termCourses(G,t.id)){ if(c.weeks&&!c.weeks.includes(t.week)){ const att=R0&&R0.attend?(R0.attend[c.id]||0):0; if(!(c.makeupWeeks&&c.makeupWeeks.includes(t.week)&&att<c.weeks.length)) continue; }   /* 只有某幾週的課（服務學習：AA_110 6-1）；次數不夠時補做週也排 */
     for(const s of c.slots){ if(s.wd!==wd) continue; const b=B(s.block); out.push({c,slot:s,t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+s.block,room:COURSES.rooms[c.room]||{},week:t.week,exam:c.kind==='service'?null:t.exam,term:t.id}); } }
    if(t.exam&&S.isExamCourse){   /* 考五題的法律課：考試週只考一次（AA_130 第 3-2 節第 2 點）——那門課在考試週的第一堂不是假日的課；兩週都放假就補一堂（S.examDay）*/
      for(let i=out.length-1;i>=0;i--){ const it=out[i]; if(!it.exam||!S.isExamCourse(it.c)) continue; const d=S.examDay(G,it.c,t.id,t.exam); if(d&&d.day===day&&d.block===it.slot.block) it.examMain=true; else out.splice(i,1); }
      for(const c of S.termCourses(G,t.id)){ if(!S.isExamCourse(c)||out.some(it=>it.c===c)) continue; const d=S.examDay(G,c,t.id,t.exam); if(!d||!d.makeup||d.day!==day) continue; const b=B(d.block);
        out.push({c,slot:{wd,block:d.block},t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+d.block,room:COURSES.rooms[c.room]||{},week:t.week,exam:t.exam,term:t.id,examMain:true,makeup:true}); } }
    out.sort((a,b)=>a.t0-b.t0);
    /* 同一門課同一天連著兩格（大四下的實習整天）：合併成一格 */
    for(let i=out.length-1;i>0;i--){ if(out[i].c===out[i-1].c){ out[i-1].t1=out[i].t1; out.splice(i,1); } }
    return out; };
  /* 'upcoming'（還沒開始、還不能進）／'open'（可以進教室上課）／'missed'（開始後 30 分鐘還沒來）／'done'（上過了）*/
  S.status=function(G,it){ const R=S.rec(G), h=hr(G); if(R.done[it.key]) return 'done'; if(it.day<G.day||(it.day===G.day&&late(G))) return 'missed'; if(it.day>G.day) return 'upcoming'; if(h<it.t0-WIN0) return 'upcoming'; if(h<it.t1-LATE_END) return 'open'; return 'missed'; };
  S.isLate=(G,it)=>it.day===G.day&&hr(G)>=it.t0+WIN1;
  S.live=(G,it)=>it.day===G.day&&!late(G)&&hr(G)>=it.t0-WIN0&&hr(G)<it.t1;   // 這堂課現在在上（教授在教室、同學在座位上）
  /* 第二天的民法總則（劇情課）：story3d.js 處理 */
  S.storyClass=(G,it)=>it.c.id==='civ_general'&&it.day===2;   /* 第二天的民總是劇情（story3d.js）；用那一堂的日期（翹課轉述也查前一天）*/
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
  const inScene=id=>{ if(typeof GAME==='undefined'||!GAME.E||!GAME.E.npcs||typeof EVENTS==='undefined'||!EVENTS.npcOf) return true; return !!EVENTS.npcOf(id); };   /* 3D 場景裡：同學要真的在教室才有反應句（使用者 2026-10-15：以安不在教室卻回答老師）；沒有場景（單元測試）照舊 */
  const reactOK=(r,day)=>r&&r.text&&(r.who==='class'||(r.who!=='heroine_06'&&r.who!=='heroine_05'&&typeof CHARACTERS!=='undefined'&&!!CHARACTERS[r.who]&&(day==null||typeof STORY==='undefined'||!STORY.present||STORY.present(r.who,{day}))&&inScene(r.who)));   /* 那學期不在學校的人（presence）沒有反應句；溫書瑀高兩屆，不在祐廷的任何一堂課（AA_110 5-7）*/
  S.reactLine=function(r){ if(!r) return ''; const act=/^（.*）$/.test(r.text); if(r.who==='class') return act?r.text:'同學：「'+r.text+'」';
    const nm=(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(r.who):((CHARACTERS[r.who]||{}).name||'同學'); return act?nm+r.text:nm+'：「'+r.text+'」'; };
  const pickReact=(arr,it)=>{ const ok=(arr||[]).filter(r=>reactOK(r,it.day)); return ok.length?S.reactLine(ok[(it.day+it.week)%ok.length]):''; };
  /* 一週兩格的課（大三上的民訴甲上、刑訴；AA_103）：這一堂是那一週的第幾格（照星期排）、前面的格子是不是都放假 */
  S.slotOrder=function(it){ const ss=(it.c.slots||[]).slice().sort((a,b)=>a.wd-b.wd||String(a.block).localeCompare(String(b.block))); return {i:ss.indexOf(it.slot),ss}; };
  S.earlierSlotsOff=function(it){ const o=S.slotOrder(it); if(o.i<1||typeof CALENDAR==='undefined') return false; const wd=it.slot.wd; return o.ss.slice(0,o.i).every(q=>q.wd!==wd&&CALENDAR.holiday(it.day-(wd-q.wd))); };
  /* 第二格是短片段（BB 的 second_slot_lines，一句）；第一格碰到國定假日，那一週的主要內容改在第二格播、第二格原本的內容不播（AA_110 5-6；兩格都放假＝那一週的內容看不到，和真的停課一樣）*/
  /* 法律審查（AA_122 第 0a 節，使用者 2026-10-14 同意）：還沒審查的課堂法律內容，不能當作已確認的法律結論發布。每週的黑板、教授一句、同學反應、觀察／被點到的選擇，
     只有審查過的那一週才用（SYLLABUS.reviewed：['課程代號|週次']，匯入時照 BB_115 的審查結果產生）；其他週用不含法律結論的一般句子（STYLE／GENERAL：只寫這週的主題）。
     v9.6 的課堂內容是審查之前的版本，沒有 reviewed：法律系的課全部用一般句子。國文、英文、體育、實習的台詞池、第二格的短片段（不在審查清單裡）照舊 */
  S.sylReviewed=(c,w)=>!!(typeof SYLLABUS!=='undefined'&&Array.isArray(SYLLABUS.reviewed)&&SYLLABUS.reviewed.includes(c.id+'|'+w));
  S.content=function(it){ attachSyllabus(); const c=it.c, t=S.topic(c,it.week)||c.name; const sy=c.syllabus&&S.sylReviewed(c,it.week)&&c.syllabus.find(q=>q.w===it.week);
    if(c.second&&c.second.length&&S.slotOrder(it).i>=1&&!S.earlierSlotsOff(it)){ const L=c.second; return {board:[c.name+'：'+t,'（這週的第二堂）',''],line:L[(it.day+it.week)%L.length],react:'',second:true}; }
    if(sy) return {board:sy.board||[c.name+'：'+t,'',''],line:sy.line,react:pickReact(sy.react,it),tpl:sy.tpl,obs:sy.obs,call:sy.call};
    if(c.pool&&c.pool.lines&&c.pool.lines.length){ const L=c.pool.lines; return {board:[c.name+'：'+t,'本週：'+t,''],line:L[(it.day+it.week)%L.length],react:pickReact(c.pool.react,it),prof:c.pool.prof_label}; }
    const f=(c.prof&&STYLE[c.prof])||GENERAL; const [line,react]=f(t); const ti=(TEACH.indexOf(it.week)); const nt=ti>=0&&ti<TEACH.length-1?S.topic(c,TEACH[ti+1]):'';
    return {board:[c.name+'：'+t,'本週：'+t,nt&&nt!==t?'下週：'+nt:(it.week<8?'第 8～9 週期中考':'第 17～18 週期末考')],line,react}; };
  /* 討論型 B 課堂（AA_119；BB 的 syllabus 裡 obs.kind==='discuss'）：教授一問 → 三個看法＋「我想先聽別人說」（最後一個選項）→ 兩三位同學依序回應 → 教授收尾（不說誰對）。
     記下玩家的看法：R.disc[record]＝選項的序號（record＝B_<學期>_<課>_w<週>；最後一個＝先聽別人說；存在 G.courses，舊存檔從空的開始）。
     去過就有那一週的「理解」（obs.understand → G.flags 的 U_*，AA_117 第 2 節）。不計分、不影響成績（AA_119 第 0 節）。
     回想（obs.recall）：讀之前的看法（record：said 的 {choice}＝當時選的那一句／listened／missed）、去過的課（attended '學期:課程:w週'）、旗標（flag）、人物記憶（memory {npc,tag}）、
     聽過的活動（activity）——條件成立才多一句旁白；沒有 after 的在選項前，after＝那位同學的回應之後（那位同學這學期不在就一起略過）*/
  let recIdx=null;
  const recObs=id=>{ if(!recIdx){ attachSyllabus(); if(typeof SYLLABUS==='undefined') return null; recIdx={}; for(const cid in SYLLABUS.courses) for(const w of SYLLABUS.courses[cid]) if(w.obs&&w.obs.record) recIdx[w.obs.record]=w.obs; } return recIdx[id]||null; };
  S.attendedWeek=function(G,spec){ const p=String(spec||'').split(':'); if(p.length!==3||typeof CALENDAR==='undefined') return false; const w=+p[2].replace(/^w/,''), R=S.rec(G);
    for(const k in R.done){ const q=k.split(':'); if(q[1]!==p[1]) continue; const t=CALENDAR.termOf(+q[0]); if(t&&t.id===p[0]&&t.week===w) return true; } return false; };
  S.recallText=function(G,r){ if(!r) return ''; const R=S.rec(G);
    if(r.record){ const i=R.disc[r.record]; if(i==null) return r.missed||''; const opts=(recObs(r.record)||{}).options||[]; if(!opts.length||i>=opts.length-1) return r.listened||'';
      const ch=opts[i]&&opts[i].text; return ch?String(r.said||'').replace('{choice}',ch):''; }
    let ok=false;
    if(r.attended) ok=S.attendedWeek(G,r.attended);
    else if(r.flag) ok=!!(G.flags&&G.flags[r.flag]);
    else if(r.memory) ok=typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(r.memory.npc,r.memory.tag);
    else if(r.activity) ok=typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,r.activity);
    return ok?(r.say||''):''; };
  S.discuss=async function(GM,it,ct,prof){ const G=GM.G, R=S.rec(G), ob=ct.obs, c=it.c, opts=ob.options||[], rc=ob.recall||[];
    const recall=async who=>{ for(const r of rc) if((r.after||null)===who){ const t=S.recallText(G,r); if(t) await GM.say(null,t); } };
    if(ob.prompt) await GM.say(null,ob.prompt);
    await recall(null);
    const i=await GM.choose(opts.map(o=>({t:o.text}))); const res=opts[i]&&opts[i].result; if(res) await GM.say(null,res);
    if(ob.record) R.disc[ob.record]=i;
    for(const q of (ob.replies||[])){ if(!reactOK(q,it.day)) continue; await GM.say(null,S.reactLine(q)); await recall(q.who); }
    if(ob.close) await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+ob.close);
    if(G.flags) for(const u of (ob.understand||[])) G.flags[u]=true; };
  /* 翹課的轉述（AA_104 4-2「同學偶爾會在群組吐槽他沒來（一行，不是懲罰）」、AA_119 第 0 節第 4 點「群組裡一句轉述，不補演」）：
     沒去的課下課以後，手機「訊息」多一行——討論週：那一週的 skip_line（那堂課發生了什麼，每次都有）；其他週：那門課的 skip 句子，偶爾（這學期第 1、4、7…次沒去那門課）。
     今天的課下課後才發；睡過一整天的，前一天的照那堂課下課的時間補進訊息。考試、服務學習、劇情的課、第一二天不發。R.note 記發過了（skip_<key>）和沒去的次數（skipn_<課>_<學期>）*/
  S.skipNotes=function(GM){ const G=GM.G; if(typeof INV==='undefined'||!INV.msgAt) return 0; const R=S.rec(G), h=hr(G); let n=0;
    for(const day of [G.day-1,G.day]){ if(day<3) continue;   /* 第一、二天是劇情（玩家第一天晚上才到宿舍、第二天跟著劇情走）：那兩天的課不算翹課 */
      for(const it of S.dayItems(G,day)){ const k='skip_'+it.key; if(R.note[k]||R.done[it.key]||it.exam||it.c.kind==='service'||S.storyClass(G,it)) continue; if(day===G.day&&h<it.t1+0.1) continue;
        R.note[k]=1; const ct=S.content(it), sl=ct.obs&&ct.obs.kind==='discuss'?ct.obs.skip_line:null; let text='';
        if(sl&&reactOK(sl,it.day)) text='（群組）'+((typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(sl.who):((CHARACTERS[sl.who]||{}).name||'同學'))+'：'+sl.text;   /* 和 BB 那門課的 skip 句子同一個格式 */
        else if(!sl){ const nk='skipn_'+it.c.id+'_'+it.term, m=(R.note[nk]||0)+1; R.note[nk]=m; const L=it.c.skipLines||[]; if(L.length&&(m-1)%3===0) text=L[Math.floor((m-1)/3)%L.length]; }
        if(text){ INV.msgAt(G,null,text,day,it.t1+0.15); n++; } } }
    return n; };
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
      if(exam&&S.isExamCourse(c)) await S.runExam(GM,it);   /* 考五題的法律課（AA_130 第 3 節）*/
      else if(exam){ const p=R.prep[c.id]||0; await GM.say(null,'考卷發下來。'+c.name+(exam==='mid'?'期中考':'期末考')+'。');
        await GM.say(null,p>=8?'題目你都見過——上課講過、自己也讀過。你寫得很順。':p>=4?'有幾題你有印象，有一題你只記得老師在黑板上畫過圖。':'你認得題目裡的每一個字，合起來就不太認得了。'); }
      else { if(S.isLate(G,it)) await GM.say(null,'（你遲到了。從後門進去，找了最後面的空位坐下。）');
        await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+ct.line); if(ct.react) await GM.say(null,ct.react);
        /* B：觀察的小選擇（只顯示一行結果，不影響數值）；C：被點到（三個選項共用收尾）——BB 的 syllabus（AA_104）*/
        if(ct.tpl==='B'&&ct.obs&&ct.obs.kind==='discuss'&&ct.obs.options&&ct.obs.options.length) await S.discuss(GM,it,ct,prof);
        else if(ct.tpl==='B'&&ct.obs&&ct.obs.options&&ct.obs.options.length){ if(ct.obs.prompt) await GM.say(null,ct.obs.prompt); const i=await GM.choose(ct.obs.options.map(o=>({t:o.text}))); const r=ct.obs.options[i]&&ct.obs.options[i].result; if(r) await GM.say(null,r); }
        else if(ct.tpl==='C'&&ct.call&&ct.call.options&&ct.call.options.length){ await GM.say(null,(c.prof?S.profName(c):'老師')+'點到你。'); await GM.choose(ct.call.options.map(o=>({t:'「'+o+'」'}))); for(const f of (ct.call.follow||[])) await GM.say(prof||null,(prof?'':(ct.prof||S.profName(c))+'：')+f); }
        if(!ct.second) await S.classAsk(GM,it,prof,ct); }
      if(E.zone&&E.zone.layout) S.syncRooms(GM);   /* 快轉前同學先坐好（人流每 15 分鐘才排一次；剛好在那之前坐下的話，下課時沒有人站起來走出去）*/
      await GM.fade(true); const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); keepCrowd(G); R.done[it.key]=1; if(!exam){ R.attend[c.id]=(R.attend[c.id]||0)+1; R.prep[c.id]=(R.prep[c.id]||0)+1; } GM.energy(exam?-10:-6); await GM.fade(false);
      GM.caption('',exam?'考完了。':'下課了。'+(c.prof?S.profName(c)+'收起講義。':''),2400);
      }
    } finally { if(!o.inScene) GM.sceneEnd(); }
    if(c.kind!=='service'&&!o.inScene) await S.afterClassEvent(GM,it);   /* 下課後、考完的人物事件（A12、A15 G1）*/
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  /* 聽演講、參加活動（AA_107 第 10-1 節第 5 項）：坐在活動的那一間選「聽演講」→ 記下到場（ACTIVITIES.markAttended）→ 快轉到結束。
     之後的事件用 prereq.attended／missed 判斷（沒去就不會觸發聽完才合理的對話）。活動的內容（講者說什麼、誰在場）由 AA、BB 寫成條件事件；這裡只有一般的場面。 */
  /* 社課的人物事件（AA_110 6-8 (a)，AA 暫定）：同一場社課只播一個——符合條件的人物事件優先，否則播一般社課的旁白（narr）；有人物事件的那一次也算出席。
     吉他社：還沒認識子晴（沒有 FIRST_MET）的玩家第一次去社課，一開始自動播 ev_ziqing_club 的初遇（EVENTS.run 會寫 FIRST_MET；只有這一次是自動的，之後要自己去找她講話）；
     法服讀書會：ev_studygroup_wed 就是讀書會本身——第一次整段（學姊研究計畫那段只有這一次），之後旁白＋題庫兩三題（studyQs）。 */
  S.clubEvent=function(G,a){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined') return null; const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
    const here=id=>typeof STORY==='undefined'||!STORY.present||STORY.present(id,G);
    if(a.id==='public_law_group') return !(G.events&&G.events.done&&G.events.done.ev_public_law_group)?ev('ev_public_law_group'):null;   /* 公法讀書會第一次：白板（交接包 v2 C14）；門口參加＝2D 畫面，不看人在不在 */
    if(a.id==='club_guitar'){ const met=typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_04','FIRST_MET'); return !met&&here('heroine_04')?ev('ev_ziqing_club'):null; }
    if(a.id==='lawclub_study'){ const done=!!(G.events&&G.events.done&&G.events.done.ev_studygroup_wed); if(!done) return here('heroine_05')?ev('ev_studygroup_wed'):null;
      /* 第一次之後：沛珊問「為什麼要背」（P1）的下一次讀書會，學姊回答（BB_95 3-4）；隔週沒來的，之後第一次來時沛珊轉述一句——讀書會一開始，代替這一次的旁白＋題目（事件裡自己有兩題）*/
      if(G.flags&&G.flags.PEISHAN_ASKED_WHY&&here('classmate_peishan')&&here('heroine_05')) for(const id of ['ev_studygroup_p1b','ev_studygroup_p1b_missed']){ const e=ev(id); if(e&&EVENTS.check(e,{chain:true})) return e; }
      return null; }
    return null; };
  /* 社課的旁白（6-8 (d)）：同一學期照順序、每句最多一次；用完了回 ''（只顯示「社課結束了。」）。存在 G.acts.narr['<活動>@<學期>']＝用過幾句（舊存檔沒有＝從頭）*/
  S.clubNarr=function(G,a){ const L=a.narr||[]; if(!L.length||typeof ACTIVITIES==='undefined') return ''; const A=ACTIVITIES.rec(G); if(!A.narr||typeof A.narr!=='object') A.narr={};
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, k=a.id+'@'+(t?t.id:'-'), n=A.narr[k]||0; if(n>=L.length) return ''; A.narr[k]=n+1; return L[n]; };
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
  S.lastExamEnd=function(G,termId,kind){ kind=kind||'final'; let best=null; for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(!t){ if(best) break; continue; } if(t.id!==termId) continue;
      for(const it of S.dayItems(G,d)) if(it.exam===kind&&(!best||d>best.day||(d===best.day&&it.t1>best.h))) best={day:d,h:it.t1}; } return best; };
  S.afterClassEvent=async function(GM,it){ if(typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined'||!it||!it.c) return false; const ev=STORY_EVENTS.find(e=>e.afterClass===it.c.id&&(e.afterExam?e.afterExam===it.exam:!it.exam)&&EVENTS.check(e,{chain:true})); if(!ev) return false; await EVENTS.run(ev); return true; };   /* afterExam:'mid'／'final'＝那一科考完（G1 考完試走出教室）；沒寫＝一般的課 */
  S.attendActivity=async function(GM,a,o){ o=o||{}; const G=GM.G; if(!a||typeof ACTIVITIES==='undefined'||ACTIVITIES.attended(G,a.id,G.day)) return false;
    const lec=a.kind==='lecture', tour=a.kind==='tour', club=a.kind==='club';
    ACTIVITIES.markAttended(G,a); if(club&&G.flags){ G.flags['CLUB_'+a.id]=true; if(a.id==='lawclub_study') G.flags.lawclub=true; }   /* 第一次去社課就算加入（AA_110 6-3：CLUB_<id>）；法服另外記 lawclub（看過招募公告的那個旗標）*/
    const ev=club?S.clubEvent(G,a):(a.event?S.actEvent(G,a):null);   /* 活動的事件（event：迎新，交接包 v1 A11）*/
    if(ev) await EVENTS.run(ev);   /* 人物事件（6-8 (a)）：自己的 ADV 畫面；播完再快轉到社課結束 */
    if(!o.inScene) GM.sceneBegin(o.door&&!ev?{adv:a.id==='lawclub_study'?{charId:'heroine_05',expression:'neutral'}:true}:undefined);   /* 門口參加（進不去的房間）＝2D 畫面 */
    try{
      if(GM.E&&GM.E.zone&&GM.E.zone.setBoard) GM.E.zone.setBoard(a.title,lec?'演講':'活動',hhmm(a.t0)+'–'+hhmm(a.t1));
      if(!ev&&!(club&&a.spot)) await GM.say(null,tour?(hr(G)<a.t0?'你在集合點等「'+a.title+'」開始。':'你跟上「'+a.title+'」的隊伍。'):hr(G)<a.t0?(lec?'你找了位子坐下。台上的人在試麥克風，投影片停在第一頁：「'+a.title+'」。':'你找了位子坐下，等「'+a.title+'」開始。'):(lec?'你輕輕坐下。台上已經開始講「'+a.title+'」了。':'你輕輕坐下。「'+a.title+'」已經開始了。'));   /* 系籃（集合點的社課）：AA 6-8 (c) 選「去練球」→ 直接轉暗 */
      let narr=''; if(club&&!ev){ narr=S.clubNarr(G,a); if(narr&&a.narrAt==='start') await GM.say(null,narr); if(a.id==='lawclub_study') await S.studyQs(GM); }
      if(GM.E&&GM.E.zone&&GM.E.zone.layout) S.syncRooms(GM);   /* 快轉前聽眾先坐好（2026-10-13 批次 3：演講開始前 5 分鐘坐下選「聽演講」，聽眾還沒排進來就快轉到結束，散場時沒有人站起來）*/
      await GM.fade(true); const h=hr(G); if(h<a.t1) GM.advance(a.t1-h); keepCrowd(G); GM.energy(club?-6:-4); await GM.fade(false);
      if(narr&&a.narrAt!=='start') await GM.say(null,narr);   /* 社課的旁白：做完以後的一句（系籃：轉暗、時間過去、播旁白）*/
      GM.caption('',club?'社課結束了。':lec?'演講結束了。台下有人舉手，有人已經在收東西。':tour?'導覽結束了。':'活動結束了。',2800);
      { const after=S.afterActEvent(G,a); if(after) await EVENTS.run(after); }   /* 活動結束後接著演的畫面（afterActivity＝活動 id；例：大一下第 4 週法服讀書會結束後的沛珊和柏翰，交接包 v2 C21）*/
    } finally { if(!o.inScene) GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 社團博覽會（AA_110 6-8 (b)，AA 暫定）：椰林大道上的公告欄，選單列五個社團，選了就加入（CLUB_<id>；法服另外記 lawclub）；已經加入的寫「已加入」。
     開放時間（11:00–17:00）以外按：寫幾點開始／今天收了。沒去博覽會的玩家，第一次去社課也算加入（6-3）*/
  const WDN=['日','一','二','三','四','五','六'];
  S.clubWhen=function(c,termId){ const wds=c.weekdays||(c.weekday?[c.weekday]:[]); const w0=((termId&&c.termWeeks&&c.termWeeks[termId])||c.weeks||[])[0]; return (wds.length?'每週'+wds.map(d=>WDN[d]).join('、')+' ':'')+hhmm(c.t0)+'–'+hhmm(c.t1)+(c.roomName?'，'+c.roomName:'')+(w0>1?'（第 '+w0+' 週起）':''); };
  S.fairMenu=async function(GM,a){ const G=GM.G, h=hr(G), F=G.flags||(G.flags={});
    if(!ACTIVITIES.on(a,G.day)||h<a.t0||h>=a.t1){ GM.caption('',a.title+'：'+(!ACTIVITIES.on(a,G.day)?'':h<a.t0?'今天 '+hhmm(a.t0)+' 開始。':'今天的攤位收了。')+(a.desc||''),4200); return 0; }
    if(!ACTIVITIES.attendedAny(G,a.id,G.day)) ACTIVITIES.markAttended(G,a);   /* 去過博覽會（出席紀錄：之後的事件可以用 attended）*/
    const L=(a.clubs||[]).map(id=>ACTIVITIES.list.find(q=>q.id===id)).filter(Boolean); let n=0;
    GM.sceneBegin(); try{ await GM.say(null,'椰林大道上一整排攤位。公告欄貼著今天擺攤的社團。');
      for(let guard=0;guard<12;guard++){ const opts=L.map(c=>{ const j=!!F['CLUB_'+c.id]; return {t:(c.clubName||c.title)+(j?'（已加入）':''),hint:S.clubWhen(c)}; }); opts.push({t:'逛完了'});
        const i=await GM.choose(opts); if(i<0||i>=L.length) break; const c=L[i];
        if(F['CLUB_'+c.id]){ await GM.say(null,'「'+(c.clubName||c.title)+'」的表你已經填過了。'); continue; }
        F['CLUB_'+c.id]=true; if(c.id==='lawclub_study') F.lawclub=true; n++; await GM.say(null,'你在「'+(c.clubName||c.title)+'」的攤位填了表。'+S.clubWhen(c)+'。'); }
    } finally { GM.sceneEnd(); }
    if(n&&GM.autosave) GM.autosave(); return n; };
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
  /* 沒有座位的活動（總圖新生導覽…）在集合點參加（AA_110 6-3）：今天有這個活動就放一個互動點；時間到了按下去參加，還沒到寫幾點集合 */
  S.addActSpots=function(GM,zoneId){ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.spotsIn) return; const E=GM.E, G=GM.G;
    for(const a of ACTIVITIES.spotsIn(G,zoneId)){ const sp=a.spot; E.interactables.push({x:sp.x,z:sp.z,radius:sp.r||1.2,lv:sp.lv|0,label:sp.label||a.title,mark:true,actSpot:a.id,onInteract:()=>S.spotInteract(GM,a)}); } };
  S.spotInteract=async function(GM,a){ const G=GM.G, h=hr(G);
    if(a.kind==='fair') return S.fairMenu(GM,a);   /* 社團博覽會：選社團（6-8 (b)）*/
    if(ACTIVITIES.canJoin(G,a)){ GM.sceneBegin(); let i=1; try{ i=await GM.choose([{t:(a.verb||'參加')+'：'+a.title,hint:hhmm(a.t0)+'–'+hhmm(a.t1)+'　'+(a.desc||'')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i===0) await S.attendActivity(GM,a); return; }
    const s=ACTIVITIES.onceDone(G,a)?'你已經參加過了。':(ACTIVITIES.attended(G,a.id,G.day)?'今天這一場你參加過了。':(h<a.t0-0.25?'今天 '+hhmm(a.t0)+' 在這裡集合。':'今天這一場已經開始一段時間了。'));
    GM.caption('',a.title+'：'+s+(a.desc?a.desc:''),4200); };
  /* 進不去的房間門口（萬才館一樓多功能教室、二樓研討室 A；wancai3d.js）：那一間的社課現在可以參加 →「參加：…」（門口參加＝2D 畫面）；
     研討室 A 有課 → 照門口上課（doorInteract）；今天晚一點才有社課 → 寫幾點；今天參加過了 → 寫參加過了；都沒有 → 原本的說明（門鎖著／研討室的課的說明）*/
  S.roomDoor=async function(GM,zone,room,o){ o=o||{}; const G=GM.G, h=hr(G); const acts=typeof ACTIVITIES!=='undefined'?ACTIVITIES.list.filter(a=>a.zone===zone&&a.room===room&&ACTIVITIES.on(a,G.day)):[];
    const a=acts.find(q=>ACTIVITIES.canJoin(G,q));
    if(a){ GM.sceneBegin(); let i=1; try{ i=await GM.choose([{t:(a.verb||'參加')+'：'+a.title,hint:hhmm(a.t0)+'–'+hhmm(a.t1)+'　'+(a.desc||'')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i===0) await S.attendActivity(GM,a,{door:true}); return; }
    if(o.door&&S.liveDoor(G,o.door)) return S.doorInteract(GM,o.door);
    const later=acts.find(q=>h<q.t0-0.25&&!ACTIVITIES.attended(G,q.id,G.day)), went=acts.find(q=>ACTIVITIES.attended(G,q.id,G.day));
    if(later||went){ GM.caption('',later?later.title+'：今天 '+hhmm(later.t0)+' 在這裡（開始前 15 分鐘可以進去）。':'今天的「'+went.title+'」你參加過了。',3600); return; }
    /* 這學期這一間有社課、今天沒有（AA 2026-10-13 P2：吉他社在多功能教室，週二去門口只看到「門鎖著」，不知道什麼時候來）：寫社課的時間＋「今天沒有社課。」；研討室 A 的課照舊接在後面 */
    const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, club=T&&typeof ACTIVITIES!=='undefined'?ACTIVITIES.list.find(q=>q.zone===zone&&q.room===room&&q.kind==='club'&&(!q.term||q.term.includes(T.id))):null;
    const td=acts.find(q=>h>=(q.t0+q.t1)/2);   /* 今天有、但已經過了一半（canJoin 到一半為止）或結束了：不能說「今天沒有社課」*/
    const note=club?club.title+'：'+S.clubWhen(club,T&&T.id)+'。'+(td?(h<td.t1?'今天的社課已經過了一半，下次再來。':'今天的社課已經結束了。'):'今天沒有社課。'):'';
    if(o.door) return S.doorInteract(GM,o.door,note?{pre:note}:undefined);
    GM.caption('',note||o.look||'',note?4200:3600); };
  S.doorInteract=async function(GM,k,o){ o=o||{}; const G=GM.G, d=DOORS[k]; const it=S.liveDoor(G,k);
    if(d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]&&(!it||it.room.zone===d.enter)){ await GM.enter(d.enter); if(it&&S.status(G,it)!=='done') GM.toast(S.status(G,it)==='open'?'上課的教室：'+it.room.name+'（找個位子坐下）':it.c.name+'已經開始超過 30 分鐘了（'+it.room.name+'），現在進去不算出席',4200); return; }   /* liveDoor 只會是 open 或 missed（2026-10-13 審查：遲到時原本寫「等一下的課在」）*/   /* 課在館內的教室上（2026-10-13）*/
    if(it&&S.status(G,it)==='open'){ const opts=[{t:(d.verb||'進去上課')+'：'+it.c.name,hint:hhmm(it.t0)+'–'+hhmm(it.t1)+'（點對話可以略過）'}]; if(d.enter&&Z3.ZONES[d.enter]) opts.push({t:'進館裡逛逛（不上課）'}); opts.push({t:'不上了'});
      const ch=await (async()=>{ GM.sceneBegin(); try{ return await GM.choose(opts); } finally { GM.sceneEnd(); } })(); if(ch===0) await S.attend(GM,it,{door:true}); else if(d.enter&&opts[ch].t.startsWith('進館')) await GM.enter(d.enter); return; }
    if(d.enter&&typeof Z3!=='undefined'&&Z3.ZONES[d.enter]){ await GM.enter(d.enter); return; }   /* 沒有課：公共空間照常可以進（使用者 2026-10-13：「不必每次進入都觸發故事」）*/
    const today=S.dayItems(G).filter(q=>q.room.door===k); if(d.noToday&&!today.length){ GM.caption('',o.look||d.look,4800); return; } const s=today.length?'今天在這裡的課：'+today.map(q=>hhmm(q.t0)+' '+q.c.name+'（'+({done:'上過了',missed:'沒去',open:'可以進去',upcoming:'還沒開始'})[S.status(G,q)]+'）').join('、'):'今天沒有你在這裡的課。'; GM.caption('',(o.pre?o.pre:'')+(o.look||d.look)+s,o.pre?6000:4800); };
  // ---------- 自學：選一門課（AA_104 4-3：和上課累積同一個「準備」）----------
  /* 回傳：null＝沒有給選單（放假、沒有課）；{course}＝選了一科；{notes:true}＝整理這週的筆記（不挑一科）；{extra:i}＝選了 extra 的第 i 項（game3d.js：研究所準備）*/
  S.studyPick=async function(GM,extra){ const G=GM.G; const t=CALENDAR.termOf(G.day); if(!t) return null; const cs=S.termCourses(G,t.id).filter(c=>c.kind!=='service'&&(c.kind!=='general'||c.id.startsWith('ge_'))); if(!cs.length) return null;   /* 通識（ge_*）可以自學；國文、英文、體育不列 */
    const nx=S.next(G); cs.sort((a,b)=>(nx&&a===nx.c?-1:0)-(nx&&b===nx.c?-1:0));
    const ex=extra||[], opts=ex.concat(cs.slice(0,6).map(c=>({t:c.name,hint:'這週：'+(S.topic(c,t.week)||'')}))); opts.push({t:'整理這週的筆記（不挑一科）'}); const i=await GM.choose(opts);
    if(i<ex.length) return {extra:i}; if(i>=ex.length+cs.slice(0,6).length) return {notes:true};
    const c=cs[i-ex.length]; const R=S.rec(G); R.prep[c.id]=(R.prep[c.id]||0)+1; R.lastStudy={day:G.day,id:c.id,name:c.name}; return {course:c}; };   /* lastStudy：今天念了哪一科（Café 的學姊問「今天念了什麼？」，BB_120 1-1）*/
  // ---------- 期末考（使用者 2026-10-14 16:15、17:10；企劃分支 AA_126 1-5、AA_130 第 3 節）----------
  /* 考五題的課＝題庫對照表（EXAM_BANK.courseMap）寫 exam:'mc5' 的法律課；非法律課照出席、不考五題（AA_126 1-4）；法律專題研究、實習是 NO_EXAM。
     題目：大一～大三＝使用者確認的正式題目（exam_official/，status USER_CONFIRMED）＋刑訴 QBANK；大四＝交叉審通過的題目（Y4_CROSS_REVIEWED）。AI 不出題、不補題、不改寫。
     兩堆：課堂題（askedIn＝這學期這門課在課堂上問過，或 source:'CLASS_DISC'）優先，不夠才從題庫題補（EXAM_MIX）。兩堆加起來不到 5 題＝不開考。
     抽到的題號存進存檔：讀檔再考是同一份。選項不洗牌、答案不動。 */
  S.EXAM_MIX='class_first';   /* 'class_first'（預設：課堂題最多 5 題，不夠才補）／'3_2'（課堂 3＋題庫 2，任一邊不夠由另一邊補）——使用者選了再改 */
  S.EXAM_WEEKS={mid:[8,9],final:[17,18]};
  S.isExamCourse=c=>!!c&&typeof EXAM_BANK!=='undefined'&&!!EXAM_BANK.courseMap[c.id]&&EXAM_BANK.courseMap[c.id].exam==='mc5';
  const examDayMemo={};
  /* 這門課這個考試的日子：考試週裡那門課第一堂不是假日的課；都放假（例：大一上民法總則 12/25、1/1）＝放假那一堂之後，第二週第一個同一時段空著的平日（1/2 週五下午一）*/
  S.examDay=function(G,c,termId,kind){ if(typeof CALENDAR==='undefined') return null; const el=JSON.stringify((G.courses&&G.courses.electives)||{}); const mk=c.id+'|'+termId+'|'+kind+'|'+el; if(mk in examDayMemo) return examDayMemo[mk];
    const wk=S.EXAM_WEEKS[kind]||[]; const days=[]; let d0=null; for(let d=1;d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===termId){ if(d0==null) d0=d; if(wk.includes(t.week)) days.push(d); } else if(d0!=null&&d>d0+200) break; }
    let res=null, lastMiss=null;
    for(const d of days){ const wd=CALENDAR.dateOf(d).wd; const s0=c.slots.find(s=>s.wd===wd); if(!s0) continue; if(CALENDAR.holiday(d)){ lastMiss=d; continue; } res={day:d,block:s0.block}; break; }
    if(!res&&lastMiss!=null){ const busy=(d,b)=>S.termCourses(G,termId).some(x=>x!==c&&x.slots.some(s=>s.wd===CALENDAR.dateOf(d).wd&&s.block===b));
      const lastWeek=days.filter(d=>CALENDAR.termOf(d).week===wk[wk.length-1]); const cand=lastWeek.filter(d=>d>lastMiss).concat(lastWeek.filter(d=>d<=lastMiss));
      for(const d of cand){ const wd=CALENDAR.dateOf(d).wd; if(wd>5||CALENDAR.holiday(d)) continue; for(const s of c.slots){ if(!busy(d,s.block)){ res={day:d,block:s.block,makeup:true}; break; } } if(res) break; } }
    return examDayMemo[mk]=res; };
  S.examQuestions=function(courseId,termId){ const out=[]; if(typeof EXAM_BANK!=='undefined') for(const q of EXAM_BANK.questions) if(q.course===courseId&&q.term===termId) out.push(q);
    if(courseId==='crimpro'&&termId==='Y3S1'&&typeof QBANK!=='undefined') for(const q of QBANK) if(q.complete!==false) out.push(Object.assign({},q,{course:'crimpro',term:'Y3S1',status:'USER_CONFIRMED'}));   /* 刑訴：使用者的 QBANK（沒有週次＝全部）*/
    return out; };
  const okStatus=(q,termId)=>termId==='Y4S1'||termId==='Y4S2'?q.status==='Y4_CROSS_REVIEWED':q.status==='USER_CONFIRMED';
  S.examPool=function(courseId,termId,kind){ const maxW=kind==='mid'?7:18; const cls=[], bank=[];
    for(const q of S.examQuestions(courseId,termId)){ if(!okStatus(q,termId)) continue; if(q.scopeWeek!=null&&q.scopeWeek>maxW) continue; const asked=(q.askedIn&&(q.askedIn.course||courseId)===courseId&&(!q.askedIn.term||q.askedIn.term===termId))||q.source==='CLASS_DISC'; (asked?cls:bank).push(q); }
    return {cls,bank}; };
  const hashStr=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
  const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const shuffled=(arr,r)=>{ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a; };
  /* 抽 5 題（同一份存檔、同一門課、同一學期、同一種考試＝同一份）；不足 5 題＝{ok:false,n} */
  S.drawExam=function(G,courseId,termId,kind){ const R=S.rec(G); R.exam=R.exam&&typeof R.exam==='object'?R.exam:{}; const key=termId+':'+courseId+':'+kind;
    const pool=S.examPool(courseId,termId,kind), n=pool.cls.length+pool.bank.length; if(n<5) return {ok:false,n,key};
    if(R.exam[key]&&Array.isArray(R.exam[key].qs)&&R.exam[key].qs.length===5){ const all=pool.cls.concat(pool.bank); const qs=R.exam[key].qs.map(id=>all.find(q=>q.id===id)).filter(Boolean); if(qs.length===5) return {ok:true,n,key,qs,saved:R.exam[key]}; }
    if(!G.flags) G.flags={}; if(G.flags.examSeed==null) G.flags.examSeed=Math.floor(Math.random()*1e9);   /* 這份存檔的亂數種子（存在存檔裡）*/
    const r=rng(hashStr(G.flags.examSeed+'|'+key)); const cls=shuffled(pool.cls,r), bank=shuffled(pool.bank,r); let pick=[];
    if(S.EXAM_MIX==='3_2'){ pick=cls.slice(0,3).concat(bank.slice(0,2)); const restC=cls.slice(3), restB=bank.slice(2); while(pick.length<5&&(restC.length||restB.length)) pick.push(restC.length?restC.shift():restB.shift()); }
    else { pick=cls.slice(0,5); for(const q of bank){ if(pick.length>=5) break; pick.push(q); } }
    /* 期末不排除期中用過的題，除非排除以後仍有 5 題以上 */
    if(kind==='final'){ const used=new Set(((R.exam[termId+':'+courseId+':mid']||{}).qs)||[]); if(used.size){ const fresh=cls.concat(bank).filter(q=>!used.has(q.id)); if(fresh.length>=5){ const fc=cls.filter(q=>!used.has(q.id)), fb=bank.filter(q=>!used.has(q.id)); pick=S.EXAM_MIX==='3_2'?fc.slice(0,3).concat(fb.slice(0,2)):fc.slice(0,5); for(const q of fc.slice(3).concat(fb)) { if(pick.length>=5) break; if(!pick.includes(q)) pick.push(q); } } } }
    pick=pick.slice(0,5); R.exam[key]={qs:pick.map(q=>q.id)}; return {ok:true,n,key,qs:pick}; };
  /* 課堂提問（AA_130 第 3 節第 3 點，BB 提議、AA 同意）：syllabus 那一週的 ask:{qid} 指到 EXAM_BANK 的使用者題目（題幹、選項、答案、考點照題庫，一字不改）。
     那堂課的最後（A：教授那句之後；B：討論收尾之後；C：點名收尾之後）——黑板角落一題 → 玩家選 → 「答案是（X）。」→ 有使用者給的考點或解析才顯示 →
     這學期第一次課堂提問時教授說「期末考，會考這樣的題目。」。不計分、不影響成績；沒去上課就不演（期末考照樣算課堂題）。第二格的短片段不問。
     題目是使用者給的、AA 逐題對過那一週的主題，所以不看 SYLLABUS.reviewed（那是 BB 寫的課堂內容的審查）。玩家選的記在 R.ask['學期:題號']（舊存檔從空的開始）*/
  S.askOf=function(it){ attachSyllabus(); const c=it.c; if(!c.syllabus||typeof EXAM_BANK==='undefined') return null; const sy=c.syllabus.find(q=>q.w===it.week); const qid=sy&&sy.ask&&sy.ask.qid; if(!qid) return null;
    return EXAM_BANK.questions.find(q=>q.id===qid&&q.course===c.id&&q.term===it.term&&q.status==='USER_CONFIRMED')||null; };
  S.classAsk=async function(GM,it,prof,ct){ const q=S.askOf(it); if(!q) return false; const R=S.rec(GM.G), c=it.c, pre=prof?'':((ct&&ct.prof)||S.profName(c))+'：';
    const first=!Object.keys(R.ask).some(k=>k.startsWith(it.term+':'));
    await GM.say(null,'（下課前，教授在黑板角落寫了一題。）'); await GM.say(null,q.q);
    const opts=optList(q); const j=await GM.choose(opts.map(o=>({t:o.t}))); const v=(opts[j]||opts[0]).v; R.ask[it.term+':'+q.id]=v;
    await GM.say(null,'答案是'+(q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）')+'。'+(q.core?'考點：'+q.core+(/[。！？]$/.test(q.core)?'':'。'):'')+(q.explanation||''));
    if(first) await GM.say(prof||null,pre+'期末考，會考這樣的題目。');
    return true; };
  S.scoreOf=k=>[0,60,70,80,90,100][Math.max(0,Math.min(5,k|0))];   /* 答對 0～5 題＝0、60、70、80、90、100（AA_126 1-2）；0 題＝被當（重修等使用者確認）*/
  const optList=q=>q.type==='tf'||!q.options?['對','錯'].map(t=>({t,v:t})):Object.keys(q.options).map(k=>({t:'（'+k+'）'+q.options[k],v:k}));
  /* 考試那一堂：五題答完才交卷；交卷後，答錯的題目顯示答案、考點、解析（有才顯示）。法條只有大四顯示：大一～大三的 basis／mapBasis 是 AA、BB 對週次時自己標的，
     不是使用者給的（AA 2026-10-14 17:4x；匯入時也不帶進來），大四是 AI 出題、使用者授權 */
  S.runExam=async function(GM,it){ const G=GM.G, R=S.rec(G), c=it.c, kind=it.exam, termId=it.term; const nm=kind==='mid'?'期中練習':'期末考';
    const r=S.drawExam(G,c.id,termId,kind);
    if(!r.ok){ console.error('EXAM_BANK_INSUFFICIENT',c.id,r.n); R.exam=R.exam||{}; R.exam[r.key]={status:'insufficient',n:r.n};
      await GM.say(null,'這一科的'+nm+'題庫還沒準備好（正式題目 '+r.n+'／5）。'+(kind==='mid'?'這次不舉行。':'這學期不舉行期末考。')); return {held:false,n:r.n}; }
    await GM.say(null,'考卷發下來。'+c.name+nm+(kind==='mid'?'（不算成績）':'')+'。五題。'); const ans=[]; let k=0;
    for(let i=0;i<5;i++){ const q=r.qs[i]; await GM.say(null,(i+1)+'／5　'+q.q); const opts=optList(q); const j=await GM.choose(opts.map(o=>({t:o.t}))); const v=(opts[j]||opts[0]).v; ans.push(v); if(String(v)===String(q.answer)) k++; }
    const score=S.scoreOf(k); R.exam[r.key]=Object.assign({},R.exam[r.key]||{},{qs:r.qs.map(q=>q.id),ans,correct:k,score,status:'done'});
    await GM.say(null,'交卷。答對 '+k+'／5'+(kind==='final'?'，'+score+' 分。':'。'));
    for(let i=0;i<5;i++){ const q=r.qs[i]; if(String(ans[i])===String(q.answer)) continue; const a=q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）'+q.options[q.answer];
      await GM.say(null,'第 '+(i+1)+' 題的答案：'+a+(q.core?'。考點：'+q.core:'')+(q.explanation?'。'+q.explanation:'')+(q.basis&&q.status==='Y4_CROSS_REVIEWED'?'（'+q.basis+'）':'')); }
    return {held:true,correct:k,score}; };
  /* ?dev 的除錯面板：這學期考五題的課裡，期末考正式題目不到 5 題（不開考）的課（AA_130 第 3 節第 4 點；玩家版不顯示）*/
  S.examShort=function(G,termId){ if(!termId){ const t=typeof CALENDAR!=='undefined'&&G?CALENDAR.termOf(G.day):null; termId=t&&t.id; } if(!termId) return [];
    return S.termCourses(G,termId).filter(S.isExamCourse).map(c=>{ const p=S.examPool(c.id,termId,'final'); return {id:c.id,name:c.name,n:p.cls.length+p.bank.length}; }).filter(e=>e.n<5); };
  // ---------- 學期結束的成績單（AA_104 第 5、10 節：文字，不顯示分數與排名，不會沒過）----------
  S.gradeOf=p=>p>=10?'很好':(p>=5?'不錯':'過了');
  S.reportFor=function(G,termId){ const R=S.rec(G); const g={}; for(const c of S.termCourses(G,termId)){ if(c.kind==='service') continue;
      if(S.isExamCourse(c)){ const e=(R.exam||{})[termId+':'+c.id+':final']; g[c.id]=e&&e.status==='done'?e.score+' 分':e&&e.status==='insufficient'?'未開考（題庫不足）':(S.examPool(c.id,termId,'final').cls.length+S.examPool(c.id,termId,'final').bank.length<5?'未開考（題庫不足）':'缺考'); continue; }   /* 未開考：不算不及格、不算進書卷獎、不擋畢業（AA_130 第 3-2 節第 4 點）*/
      g[c.id]=S.gradeOf(R.prep[c.id]||0); } return g; };   /* 服務學習只記次數，不進成績單（AA_110 6-1）*/
  // ---------- 選課結果（AA_104 第 2 節、AA_110 第 4 點）----------
  /* 新學期第一週的前一天早上，讓玩家選這學期的選修：同一組二選一；choice.none＝可以不修（大一下的法律與社會）。預設的那一門排第一。
     錯過前一天（開學頭兩週才第一次起床）就在那時候問；第三週以後才第一次起床（舊存檔）＝照預設，不再問。大一上沒有選課（遊戲從第 3 週開始，AA_103）。 */
  S.choiceGroups=function(termId){ const out={}; for(const c of COURSES.list){ if(c.term!==termId||!c.choice) continue; const g=out[c.choice.group]||(out[c.choice.group]={group:c.choice.group,def:c.choice.default,none:false,opts:[]}); g.opts.push(c); if(c.choice.none) g.none=true; } return Object.values(out); };
  S.slotText=c=>c.slots.map(s=>WD[s.wd]+(COURSES.blocks[s.block]||{}).label).join('、')+'・'+S.roomName(c);
  S.selectTerm=async function(GM,termId){ const G=GM.G, R=S.rec(G), gs=S.choiceGroups(termId); R.note['sel_'+termId]=1; if(!gs.length&&termId!=='Y1S2') return false;   /* 大一下：法律與社會（下）刪了（2026-10-14 課程調整）以後沒有選修，選課結果照樣播（通識那兩句，AA_130 第 2 節第 1 列）*/
    GM.sceneBegin(); try{ await GM.say(null,'選課結果出來了：'+S.termName(termId)+'。');
      /* 交接包 v2 第 3 節第 1 週（AA_104）：大一下接 v1 的選課結果——v1 選加簽的、選「下學期再選」的（或沒遇到的）各一句，通識選上「天文與我們」*/
      if(termId==='Y1S2'){ await GM.say(null,G.flags&&G.flags.ge_walk_waitlist?'上學期加簽沒成功的「城市與散步」，這學期——備取三。':'「城市與散步」——備取三。差一點。'); await GM.say(null,'選上的是「天文與我們」。'); }
      for(const g of gs){ const opts=g.opts.map(c=>({t:c.name,hint:S.slotText(c),id:c.id})); if(g.none) opts.push({t:'這學期不修'+(g.opts.length===1?g.opts[0].name:''),hint:'那個時段沒有課',id:'none'});
        opts.sort((a,b)=>(b.id===g.def)-(a.id===g.def));
        await GM.say(null,g.none&&g.opts.length===1?g.opts[0].name+'要修嗎？':g.opts.map(c=>c.name).join('、')+'，選一門。');
        const i=await GM.choose(opts.map(o=>({t:o.t,hint:o.hint}))); R.electives[g.group]=(opts[i]||opts[0]).id; }
      await GM.say(null,'這學期的課表在手機的「課表」。'); } finally { GM.sceneEnd(); }
    return true; };
  /* 發成績單（文字；服務學習只寫次數，AA_110 6-1）：opts.inScene＝在別的場景裡（例如可昕的視訊）接著顯示 */
  S.showGrades=async function(GM,termId,opts){ opts=opts||{}; const G=GM.G, R=S.rec(G); if(!R.grades[termId]) R.grades[termId]=S.reportFor(G,termId);
    const lines=S.termCourses(G,termId).map(c=>c.name+'：'+(c.kind==='service'?(R.attend[c.id]||0)+'／'+(c.weeks||[]).length+' 次':R.grades[termId][c.id]));
    if(R.leMoved){ const le=S.byId('legal_english'); if(le){ if(termId==='Y2S2'&&!R.leMoved.took){ const i=lines.findIndex(t=>t.indexOf(le.name+'：')===0); const txt=le.name+'：未修（2026-10-14 課程調整）'; if(i>=0) lines[i]=txt; else lines.push(txt); }
      if(termId==='Y4S2'&&R.leMoved.took) lines.push(le.name+'：已修'); } }   /* 舊存檔（AA_130 第 4 節）：已經過了大二下＝不補修；大四下上過＝照「已修」 */
    if(!opts.inScene) GM.sceneBegin(); try{ await GM.say(null,S.termName(termId)+'的成績出來了。'); await GM.say(null,lines.join('　')); } finally { if(!opts.inScene) GM.sceneEnd(); } return true; };
  /* 起床時呼叫：前一個學期剛結束（今天不在那個學期、成績還沒發）→ 發成績單；新學期的前一天（或開學頭兩週）→ 選課結果 */
  S.morning=async function(GM){ const G=GM.G, R=S.rec(G); const prev=CALENDAR.termOf(G.day-1), now=CALENDAR.termOf(G.day);
    if(prev&&(!now||now.id!==prev.id)&&!R.grades[prev.id]){
      const hold=typeof STORY!=='undefined'&&STORY.holdGrades?await STORY.holdGrades(GM,prev.id):false;   /* 可昕的約定（BB_95 9-8）：等晚上一起打開 */
      if(!hold) await S.showGrades(GM,prev.id); }
    if(R.note.gradesDue&&!R.grades[R.note.gradesDue]){ const t=R.note.gradesDue; delete R.note.gradesDue; await S.showGrades(GM,t); }   /* 先等的成績單、那晚沒有一起打開：隔天早上照常發 */
    const tmr=CALENDAR.termOf(G.day+1), selT=tmr&&tmr.week===1&&(!now||now.id!==tmr.id)?tmr:(now&&now.week<=2?now:null);
    if(selT&&!R.note['sel_'+selT.id]) await S.selectTerm(GM,selT.id);
    else if(now&&!R.note['sel_'+now.id]) R.note['sel_'+now.id]=1;
    if(now&&now.week===1&&CALENDAR.dateOf(G.day).wd===1&&R.note.termStart!==now.id){ R.note.termStart=now.id; GM.toast(S.termName(now.id)+'開學了。手機的「課表」可以看這學期的課。',4800); }
    if(now&&(now.exam)&&R.note['exam_'+now.id+'_'+now.exam]!==1){ R.note['exam_'+now.id+'_'+now.exam]=1; GM.toast((now.exam==='mid'?'期中考週':'期末考週')+'開始了。這兩週的課都是考試。',4800); } };
  // ---------- 每 0.5 秒（story3d.js 的 S.tick）：上課前 30 分鐘的提醒、目標更新、教室裡的同學 ----------
  let lastT=null;
  S.tick=function(GM){ const G=GM.G; if(!G||!G.flags) return; const R=S.rec(G), h=hr(G);
    for(const it of S.dayItems(G)){ if(S.storyClass(G,it)) continue; const k='rem_'+it.key; if(R.note[k]) continue; if(h>=it.t0-WIN0&&h<it.t0&&!R.done[it.key]){ R.note[k]=1; if(!GM.S||GM.S.classRemind!==false) GM.toast('30 分鐘後上課：'+S.itemText(it),4200); } }
    const sig=G.day+':'+Math.floor(h*4); if(sig!==lastT){ lastT=sig; S.skipNotes(GM); S.refreshGoal(GM); if(G.zone==='classroom'||(GM.E.zone&&GM.E.zone.layout)) S.syncRoom(GM); }
    S.figTick(GM); S.updateHUD(GM); };
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
      const P=GM.E.player&&GM.E.player.obj.position, by=new Map(), pby=new Map(); const add=(m,k,st)=>{ if(!m.has(k)) m.set(k,[]); m.get(k).push(st); };
      rec.seats.forEach((st,i)=>{ const nm=names[(h+i*7)%names.length], far=!(P&&Math.hypot(st.x-P.x,st.z-P.z)<7), k=far?nm+'_lod1':nm; const kk=vars[k]?k:nm; add(by,kk,st);
        const set=deskSet(nm,h+i*13); if(set){ const pk=far&&props[set+'_lod1']?set+'_lod1':set; if(props[pk]) add(pby,pk,st); } });
      const g=new THREE.Group(); g.name='seated_figures:'+key; const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), ONE=new THREE.Vector3(1,1,1), V=new THREE.Vector3();
      const inst=(src,L,name)=>{ const im=new THREE.InstancedMesh(src.geometry,src.material,L.length); L.forEach((st,i)=>{ Q.setFromAxisAngle(UP,st.yaw||0); V.set(st.x,st.y||0,st.z); M.compose(V,Q,ONE); im.setMatrixAt(i,M); });
        im.instanceMatrix.needsUpdate=true; im.castShadow=false; im.receiveShadow=true; im.computeBoundingSphere(); im.name=name; g.add(im); };
      for(const [k,L] of by) inst(vars[k],L,k);
      for(const [k,L] of pby) inst(props[k],L,'desk:'+k);   /* 桌上小物：和替身同一個矩陣 */
      const LG=rec.zone.levelGroups, lg=LG&&LG[rec.seats[0].lv|0]; (lg&&lg.group||rec.zone.group||GM.E.scene).add(g); rec.group=g; }).catch(e=>{ console.warn('seated_figures',e); });   /* 放進那一層的群組：上下樓時跟著那一層顯示／隱藏 */
    return seats.length; };
  const figGone=rec=>{ if(rec.group&&rec.group.parent) rec.group.parent.remove(rec.group); for(const st of rec.seats) if(st.taken===rec.key) st.taken=null; FIG.on.delete(rec.key); };
  S.figRemove=function(GM,key,instant){ const rec=FIG.on.get(key); if(!rec) return; if(instant||!rec.group||GM.E.zone!==rec.zone) figGone(rec); else rec.leaving=true; };
  let figFr=null;
  S.figTick=function(GM){ if(!FIG.on.size) return; const E=GM.E; for(const rec of [...FIG.on.values()]){ if(E.zone!==rec.zone){ FIG.on.delete(rec.key); continue; } if(!rec.leaving||!rec.group) continue;
      const cam=E.camera; let seen=false; if(cam&&THREE.Frustum){ figFr=figFr||new THREE.Frustum(); figFr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
        for(const im of rec.group.children){ if(!im.boundingSphere) continue; const sp=im.boundingSphere.clone().applyMatrix4(im.matrixWorld); if(figFr.intersectsSphere(sp)){ seen=true; break; } } }
      if(!seen) figGone(rec); } };
  S.figState=()=>[...FIG.on.values()].map(r=>({key:r.key,n:r.seats.length,leaving:r.leaving,loaded:!!r.group}));   /* 測試用 */
  S.syncRooms=function(GM,opt){ const G=GM.G, E=GM.E; if(!E.zone||!E.zone.seats||!E.zone.layout) return; const live=S.liveIn(G,G.zone).filter(it=>it.room.room);
    const instant=(opt&&opt.instant)||!lastSync||lastSync.zone!==G.zone||Math.abs(G.hour-lastSync.h)>0.6; lastSync={zone:G.zone,h:G.hour};
    if(typeof ACTIVITIES!=='undefined') for(const a of ACTIVITIES.active(G,{before:0.25})) if(a.zone===G.zone&&a.room) live.push({key:'act:'+a.id+':'+G.day,room:{room:a.room},n:a.crowd&&a.crowd.n});
    const keys=new Set(live.map(it=>it.key));
    for(const n of E.npcs.slice()){ if(n.clsStudent&&!keys.has(n.clsKey)){ if(instant||!walkOut(GM,n)) E.removeNPC(n); } }
    for(const k of [...FIG.on.keys()]) if(!keys.has(k)) S.figRemove(GM,k,instant);   /* 下課：替身整組在畫面外才拿掉 */
    for(const it of live){ if(E.npcs.some(n=>n.clsStudent&&n.clsKey===it.key)) continue; const seats=E.zone.seats.filter(q=>q.room===it.room.room&&(q.kind==='class'||q.kind==='lecture')); let h=0; for(const ch of it.key) h=(h*31+ch.charCodeAt(0))>>>0;
      /* 一半的位子（照種子洗牌：同一堂課同一些位子），留一半給玩家 */ let sd=h%2147483646+1; const rnd=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; }; const idx=seats.map((q,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
      for(const i of idx.slice(0,Math.min(16,it.n||Math.round(seats.length*0.5)))){   /* 最多 16 人（和霖澤館 201 一樣；階梯教室 40 個位子不會一次載 20 個人物）*/ const st=seats[i]; if(st.taken||E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35)) continue; const o=CHAR.build(STORY.extraSpec(200+((h+i*7)%97))); o.position.set(st.x,st.y||0,st.z); o.rotation.y=st.yaw;   /* 階梯教室：座位的高度（addNPC 也照 seat.y 放）*/
        E.addNPC({obj:o,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,seat:st,lv:st.lv|0,clsStudent:true,clsKey:it.key}); }
      const want=Math.min(seats.length,it.n||Math.round(seats.length*0.5)); if(seats.length>=40&&want>16) S.figPlace(GM,it.key,idx.slice(16,want).map(i=>seats[i]));   /* 其餘的位子：替身 */ } };
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
    const passed=S.dayItems(G).filter(it=>S.status(G,it)!=='done'&&it.t1-LATE_END>h0&&it.t1-LATE_END<=target&&!S.storyClass(G,it));
    if(passed.length){ GM.sceneBegin(); let i=0; try{ i=await GM.choose([{t:'照樣跳過',hint:'會錯過：'+passed.map(it=>hhmm(it.t0)+' '+it.c.name).join('、')},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(i!==0) return false; }
    GM.sceneBegin(); try{ await GM.fade(true); GM.advance(target-h0); if(o.nap&&GM.energy) GM.energy(Math.min(40,Math.round((target-h0)*8))); await GM.sleep(300); await GM.fade(false); } finally { GM.sceneEnd(); }
    const zn=(typeof Z3!=='undefined'&&Z3.ZONES[G.zone])?Z3.ZONES[G.zone].name:''; GM.caption('',(stop?'（'+stop.why+'）':'')+(o.nap?'你睡了一下，醒來是 '+hhmm(hr(G))+'。':'你在'+(zn||'這裡')+'待到 '+hhmm(hr(G))+'。'),3200);
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  // ---------- 手機的「今天」「課表」----------
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  /* 開學第一週的待辦（AA_110 第 6-4 節，AA 暫定）：手機「今天」底下一張小清單，做完一項劃掉一項；不做也不擋任何事；大一上第 3～5 週顯示，第 6 週自動收起來。
     「買六法」等 AA 定價錢、「逛社團博覽會」等博覽會做進遊戲（AA_110 6-3，已問 AA）——還沒列。 */
  S.todoItems=function(G){ if(typeof CALENDAR==='undefined') return []; const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y1S1'||t.week>5) return [];
    const R=S.rec(G), F=G.flags||{}, A=typeof ACTIVITIES!=='undefined'?ACTIVITIES:null, went=id=>!!(A&&A.stateOf&&A.stateOf(G,id));
    return [{key:'textbook',text:'買民總、刑總、憲法的教科書（舊路書房），或在法律學院圖書館看指定參考書',done:!!(F.textbook||F.readReserve)},
            {key:'libtour',text:'總圖新生導覽（9/19、9/23、9/25、9/26 15:30，總圖大廳；去一場就好）',done:went('lib_tour_y1s1')},
            {key:'lawlibintro',text:'法律資料怎麼查（9/24、10/1 15:30，法律學院圖書館 討論室 A）',done:went('lawlib_intro_y1s1')},
            {key:'service',text:'服務學習報到（9/24 週三 13:20，法律學院圖書館 櫃台）',done:(R.attend.service_1||0)>=1}]; };
  S.todoHTML=function(G){ const its=S.todoItems(G); if(!its.length) return ''; const left=its.filter(q=>!q.done).length;
    return '<div class="item"><b>開學待辦</b>'+(left?'<span class="muted">（還有 '+left+' 項，不做也沒關係）</span>':'<span class="muted">（都做完了）</span>')+its.map(q=>'<div class="'+(q.done?'muted':'')+'" style="margin-top:4px'+(q.done?';text-decoration:line-through':'')+'">'+(q.done?'✓ ':'☐ ')+esc(q.text)+'</div>').join('')+'</div>'; };
  S.todayHTML=function(G){ const its=S.dayItems(G).filter(it=>!S.storyClass(G,it)); const st={done:'上過了',missed:'沒去',open:'現在可以進教室',upcoming:'還沒開始'};
    let h='<div class="item"><b>'+esc(S.dayLabel(G))+'</b><div class="muted">現在 '+hhmm(hr(G))+'</div></div>'+S.todoHTML(G);
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
