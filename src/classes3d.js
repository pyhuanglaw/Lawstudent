/* ===== 課表與每日上課（D52：AA_103、AA_104；D54：日常生活的設計原則）=====
   課程資料：src/data/courses.js；日曆（學期、週次、寒暑假、國定假日）：src/data/calendar.js。
   玩家怎麼知道今天有什麼課（AA_104 第 3 節）：起床時的目標寫今天的課、HUD 的「下一堂」、手機的「今天」「課表」（index.html #phone）、開始前 30 分鐘的提醒。
   上課（AA_104 4-1）：開始前 30 分鐘到開始後 30 分鐘走進教室、坐下 → 上課（黑板三行 → 教授一句 → 同學一句 → 時間快轉到下課；可以點過去）。
     霖澤館 201（3D）：坐下時選「上課」；共同課程教室、體育館、萬才館研討室：走到門口（2D 課堂畫面）；校外實習：之後做。
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
  const hhmm=x=>{ x=((x%24)+24)%24; return String(Math.floor(x+1e-6)).padStart(2,'0')+':'+String(Math.round((x%1)*60)%60).padStart(2,'0'); };
  S.hhmm=hhmm;
  const WIN0=0.5, WIN1=0.5;                 // 開始前 30 分鐘就可以進教室、開始後 30 分鐘還沒來＝沒來（AA_104 4-1、4-2）
  const WD=['','週一','週二','週三','週四','週五','週六','週日'];
  S.WD=WD;
  // ---------- 紀錄（存檔 G.courses；舊存檔沒有＝空的，全部有預設值：AA_104 第 9 節）----------
  S.rec=function(G){ const R=G.courses&&typeof G.courses==='object'?G.courses:(G.courses={}); for(const k of ['done','attend','prep','electives','grades','note']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };
  S.byId=id=>COURSES.list.find(c=>c.id===id)||null;
  S.enrolled=function(G,c){ if(!c.choice) return true; const pick=S.rec(G).electives[c.choice.group]; const cur=pick===undefined?c.choice.default:pick; return cur===c.id; };
  S.termCourses=(G,termId)=>COURSES.list.filter(c=>c.term===termId&&S.enrolled(G,c));
  S.termName=id=>({Y1S1:'大一上',Y1S2:'大一下',Y2S1:'大二上',Y2S2:'大二下',Y3S1:'大三上',Y3S2:'大三下',Y4S1:'大四上',Y4S2:'大四下'})[id]||id;
  S.profName=c=>c.prof?((COURSES.profs[c.prof]||'').slice(0,1)+'老師'):(c.profName||'老師');
  S.roomName=c=>(COURSES.rooms[c.room]||{}).name||'';
  // 每一週講哪一個主題：上課週（第 1～7、10～16 週）照順序平均分到 topics；考試週＝考試
  const TEACH=[1,2,3,4,5,6,7,10,11,12,13,14,15,16];
  S.topic=function(c,week){ const i=TEACH.indexOf(week); const T=c.topics||[]; if(!T.length) return ''; if(i<0) return T[T.length-1]; return T[Math.min(T.length-1,Math.floor(i*T.length/TEACH.length))]; };
  // ---------- 某一天的課 ----------
  S.dayItems=function(G,day){ if(day==null) day=G.day; if(typeof CALENDAR==='undefined'||CALENDAR.holiday(day)) return []; const t=CALENDAR.termOf(day); if(!t) return []; const wd=CALENDAR.dateOf(day).wd; const out=[];
    for(const c of S.termCourses(G,t.id)) for(const s of c.slots){ if(s.wd!==wd) continue; const b=B(s.block); out.push({c,slot:s,t0:b.t0,t1:b.t1,day,key:day+':'+c.id+':'+s.block,room:COURSES.rooms[c.room]||{},week:t.week,exam:t.exam,term:t.id}); }
    out.sort((a,b)=>a.t0-b.t0);
    /* 同一門課同一天連著兩格（大四下的實習整天）：合併成一格 */
    for(let i=out.length-1;i>0;i--){ if(out[i].c===out[i-1].c){ out[i-1].t1=out[i].t1; out.splice(i,1); } }
    return out; };
  /* 'upcoming'（還沒開始、還不能進）／'open'（可以進教室上課）／'missed'（開始後 30 分鐘還沒來）／'done'（上過了）*/
  S.status=function(G,it){ const R=S.rec(G), h=hr(G); if(R.done[it.key]) return 'done'; if(it.day<G.day) return 'missed'; if(it.day>G.day) return 'upcoming'; if(h<it.t0-WIN0) return 'upcoming'; if(h<it.t0+WIN1) return 'open'; return 'missed'; };
  S.live=(G,it)=>it.day===G.day&&hr(G)>=it.t0-WIN0&&hr(G)<it.t1;   // 這堂課現在在上（教授在教室、同學在座位上）
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
    if(hol) s+='・'+hol; if(t) s+='・'+S.termName(t.id)+' 第 '+t.week+' 週'+(t.exam==='mid'?'（期中考週）':t.exam==='final'?'（期末考週）':''); else s+='・'+(d.m>=6&&d.m<=8?'暑假':'寒假'); return s; };
  S.todayLine=function(G){ const its=S.dayItems(G).filter(it=>!S.storyClass(G,it)); if(!its.length){ const hol=CALENDAR.holiday(G.day), t=CALENDAR.termOf(G.day); return hol?'今天放假（'+hol+'），沒有課':(t?'今天沒有課':'放假中，沒有課'); }
    const ex=its[0].exam; return '今天'+(ex?'考試':'的課')+'：'+its.map(it=>hhmm(it.t0)+' '+it.c.name).join('、'); };
  // ---------- 目標（起床時、下課後）：今天的課＋往下一堂的教室導航；不蓋掉劇情的目標 ----------
  S.goalFor=function(G){ const nx=S.next(G); const txt=S.todayLine(G)+(nx?'。上課、讀書或自由活動都可以':'。自由活動：去圖書館、公館，或找人聊天');
    let dest=null; if(nx){ if(nx.room.zone==='classroom') dest={zone:'classroom',name:nx.room.name}; else if(nx.room.door) dest={zone:'campus',label:nx.room.name,name:nx.room.name}; }
    return {text:txt,dest}; };
  S.isClsGoal=G=>!!G.flags&&G.flags.clsGoal===G.goal;
  S.setGoal=function(GM){ const G=GM.G, g=S.goalFor(G); GM.setGoal(g.text,g.dest); G.flags.clsGoal=G.goal; };
  S.refreshGoal=function(GM){ const G=GM.G; if(!G||!S.isClsGoal(G)) return; const g=S.goalFor(G); if(g.text!==G.goal) S.setGoal(GM); };
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
  S.content=function(it){ const c=it.c, t=S.topic(c,it.week)||c.name; const sy=c.syllabus&&c.syllabus.find(q=>q.w===it.week);   /* BB 的內容（AA_104：{w, board:[三行], line, react:[…]}）*/
    if(sy) return {board:sy.board||[c.name+'：'+t,'',''],line:sy.line,react:(sy.react&&sy.react.length)?sy.react[(it.day+it.week)%sy.react.length]:''};
    const f=(c.prof&&STYLE[c.prof])||GENERAL; const [line,react]=f(t); const ti=(TEACH.indexOf(it.week)); const nt=ti>=0&&ti<TEACH.length-1?S.topic(c,TEACH[ti+1]):'';
    return {board:[c.name+'：'+t,'本週：'+t,nt&&nt!==t?'下週：'+nt:(it.week<8?'第 8～9 週期中考':'第 17～18 週期末考')],line,react}; };
  // ---------- 上課（普通課堂；考試週＝考試）----------
  S.attend=async function(GM,it,o){ o=o||{}; const G=GM.G, E=GM.E, R=S.rec(G), c=it.c; if(R.done[it.key]) return false;
    const exam=it.exam, prof=c.prof&&typeof EVENTS!=='undefined'?EVENTS.npcOf(c.prof):null; const ct=S.content(it); const door=!!o.door;
    if(!o.inScene) GM.sceneBegin(door?{adv:true}:undefined);
    try{
      if(!door&&E.zone&&E.zone.setBoard) E.zone.setBoard(exam?c.name+'：'+(exam==='mid'?'期中考':'期末考'):ct.board[0],exam?'不可以翻書':ct.board[1],exam?'鈴響請停筆':ct.board[2]);
      if(exam){ const p=R.prep[c.id]||0; await GM.say(null,'考卷發下來。'+c.name+(exam==='mid'?'期中考':'期末考')+'。');
        await GM.say(null,p>=8?'題目你都見過——上課講過、自己也讀過。你寫得很順。':p>=4?'有幾題你有印象，有一題你只記得老師在黑板上畫過圖。':'你認得題目裡的每一個字，合起來就不太認得了。'); }
      else { await GM.say(prof||null,(prof?'':S.profName(c)+'：')+ct.line); if(ct.react) await GM.say(null,ct.react); }
      await GM.fade(true); const h=hr(G); if(h<it.t1) GM.advance(it.t1-h); R.done[it.key]=1; if(!exam){ R.attend[c.id]=(R.attend[c.id]||0)+1; R.prep[c.id]=(R.prep[c.id]||0)+1; } GM.energy(exam?-10:-6); await GM.fade(false);
      GM.caption('',exam?'考完了。':'下課了。'+(c.prof?S.profName(c)+'收起講義。':''),2400);
    } finally { if(!o.inScene) GM.sceneEnd(); }
    S.refreshGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  /* 座位（霖澤館 201）：這堂課現在可以上 → 坐下時的第一個選項（game3d.js 的 seatMenu）*/
  S.seatClass=function(G){ if(!G||G.zone!=='classroom') return null; return S.liveIn(G,'classroom').find(it=>S.status(G,it)==='open')||null; };
  // ---------- 門口上課（共同課程教室、體育館、萬才館研討室）：校園的互動點 ----------
  const DOORS={ common:{zone:'campus',x:45,z:22.6,radius:1.6,label:'共同課程教室',look:'共同課程教室：大一國文、大一英文、通識在這裡上課。'},
                gym:{zone:'campus',x:74,z:59.4,radius:1.6,label:'體育館',look:'體育館：體育課在這裡上。'} };
  S.DOORS=DOORS;
  S.addDoors=function(GM,zoneId){ const E=GM.E; for(const k in DOORS){ const d=DOORS[k]; if(d.zone!==zoneId) continue;
      E.interactables.push({x:d.x,z:d.z,radius:d.radius,lv:0,label:d.label,door:k,onInteract:()=>S.doorInteract(GM,k)}); } };
  S.doorInteract=async function(GM,k){ const G=GM.G, d=DOORS[k]; const it=S.liveDoor(G,k);
    if(it&&S.status(G,it)==='open'){ const ch=await (async()=>{ GM.sceneBegin(); try{ return await GM.choose([{t:'進去上課：'+it.c.name,hint:hhmm(it.t0)+'–'+hhmm(it.t1)+'（點對話可以略過）'},{t:'不上了'}]); } finally { GM.sceneEnd(); } })(); if(ch===0) await S.attend(GM,it,{door:true}); return; }
    const today=S.dayItems(G).filter(q=>q.room.door===k); const s=today.length?'今天在這裡的課：'+today.map(q=>hhmm(q.t0)+' '+q.c.name+'（'+({done:'上過了',missed:'沒去',open:'可以進去',upcoming:'還沒開始'})[S.status(G,q)]+'）').join('、'):'今天沒有你在這裡的課。'; GM.caption('',d.look+s,4800); };
  // ---------- 自學：選一門課（AA_104 4-3：和上課累積同一個「準備」）----------
  S.studyPick=async function(GM){ const G=GM.G; const t=CALENDAR.termOf(G.day); if(!t) return null; const cs=S.termCourses(G,t.id).filter(c=>c.kind!=='general'||c.id.startsWith('gened')); if(!cs.length) return null;
    const nx=S.next(G); cs.sort((a,b)=>(nx&&a===nx.c?-1:0)-(nx&&b===nx.c?-1:0));
    const opts=cs.slice(0,6).map(c=>({t:c.name,hint:'這週：'+(S.topic(c,t.week)||'')})); opts.push({t:'整理這週的筆記（不挑一科）'}); const i=await GM.choose(opts); if(i>=cs.slice(0,6).length) return null;
    const c=cs[i]; const R=S.rec(G); R.prep[c.id]=(R.prep[c.id]||0)+1; return c; };
  // ---------- 學期結束的成績單（AA_104 第 5、10 節：文字，不顯示分數與排名，不會沒過）----------
  S.gradeOf=p=>p>=10?'很好':(p>=5?'不錯':'過了');
  S.reportFor=function(G,termId){ const R=S.rec(G); const g={}; for(const c of S.termCourses(G,termId)) g[c.id]=S.gradeOf(R.prep[c.id]||0); return g; };
  /* 起床時呼叫：前一個學期剛結束（今天不在那個學期、成績還沒發）→ 發成績單 */
  S.morning=async function(GM){ const G=GM.G, R=S.rec(G); const prev=CALENDAR.termOf(G.day-1), now=CALENDAR.termOf(G.day);
    if(prev&&(!now||now.id!==prev.id)&&!R.grades[prev.id]){ R.grades[prev.id]=S.reportFor(G,prev.id); const lines=S.termCourses(G,prev.id).map(c=>c.name+'：'+R.grades[prev.id][c.id]);
      GM.sceneBegin(); try{ await GM.say(null,S.termName(prev.id)+'的成績出來了。'); await GM.say(null,lines.join('　')); } finally { GM.sceneEnd(); } }
    if(now&&now.week===1&&CALENDAR.dateOf(G.day).wd===1&&R.note.termStart!==now.id){ R.note.termStart=now.id; GM.toast(S.termName(now.id)+'開學了。手機的「課表」可以看這學期的課。',4800); }
    if(now&&(now.exam)&&R.note['exam_'+now.id+'_'+now.exam]!==1){ R.note['exam_'+now.id+'_'+now.exam]=1; GM.toast((now.exam==='mid'?'期中考週':'期末考週')+'開始了。這兩週的課都是考試。',4800); } };
  // ---------- 每 0.5 秒（story3d.js 的 S.tick）：上課前 30 分鐘的提醒、目標更新、教室裡的同學 ----------
  let lastT=null;
  S.tick=function(GM){ const G=GM.G; if(!G||!G.flags) return; const R=S.rec(G), h=hr(G);
    for(const it of S.dayItems(G)){ if(S.storyClass(G,it)) continue; const k='rem_'+it.key; if(R.note[k]) continue; if(h>=it.t0-WIN0&&h<it.t0&&!R.done[it.key]){ R.note[k]=1; if(!GM.S||GM.S.classRemind!==false) GM.toast('30 分鐘後上課：'+S.itemText(it),4200); } }
    const sig=G.day+':'+Math.floor(h*4); if(sig!==lastT){ lastT=sig; S.refreshGoal(GM); if(G.zone==='classroom') S.syncRoom(GM); }
    S.updateHUD(GM); };
  /* 霖澤館 201：上課時間座位上有同學（背景人物，坐著）；下課後離開。教授由 story3d.js 的作息（schedFor → CLS.profWhere）處理 */
  S.syncRoom=function(GM){ const G=GM.G, E=GM.E; if(!E.zone||!E.zone.seats) return; const live=S.liveIn(G,'classroom'); const key=live.length?live[0].key:null;
    const mine=E.npcs.filter(n=>n.clsStudent); if(mine.length&&mine[0].clsKey!==key){ for(const n of mine){ if(n.obj&&n.obj.parent) n.obj.parent.remove(n.obj); } E.npcs=E.npcs.filter(n=>!n.clsStudent); }
    if(!key||E.npcs.some(n=>n.clsStudent)) return; const seats=E.zone.seats; let i=0; const cells=[[0,0],[0,2],[0,5],[1,1],[1,6],[2,0],[2,2],[2,4],[2,7],[3,1],[3,3],[3,6],[4,0],[4,5],[5,2],[5,7]];
    for(const [r,c] of cells){ const s=seats.find(q=>q.row===r&&q.col===c); if(!s) continue; if(E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-s.x,n.seat.z-s.z)<0.35)) continue; const o=CHAR.build(STORY.extraSpec(60+i)); i++; o.position.set(s.x,s.y||0,s.z); o.rotation.y=s.yaw;
      E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s,clsStudent:true,clsKey:key}); } };
  // ---------- HUD：下一堂（點了打開手機）----------
  S.updateHUD=function(GM){ const el=document.getElementById('nextClass'); if(!el) return; const G=GM.G; if(!G||GM.titleIdle){ el.classList.add('hide'); return; }
    const cur=S.dayItems(G).find(it=>S.live(G,it)&&S.rec(G).done[it.key]); let s='';
    const nx=S.next(G); if(nx){ const st=S.status(G,nx); s=(st==='open'?'現在可以上課：':'下一堂 ')+S.itemText(nx); } else s=S.dayItems(G).length?'今天的課都結束了':(CALENDAR.termOf(G.day)?'今天沒有課':'放假中');
    if(el.dataset.s!==s){ el.dataset.s=s; el.textContent=s; } el.classList.remove('hide'); };
  // ---------- 手機的「今天」「課表」----------
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.todayHTML=function(G){ const its=S.dayItems(G).filter(it=>!S.storyClass(G,it)); const st={done:'上過了',missed:'沒去',open:'現在可以進教室',upcoming:'還沒開始'};
    let h='<div class="item"><b>'+esc(S.dayLabel(G))+'</b><div class="muted">現在 '+hhmm(hr(G))+'</div></div>';
    if(!its.length) h+='<div class="item">'+esc(S.todayLine(G))+'</div>';
    for(const it of its){ const s=S.status(G,it); h+='<div class="item phrow"><div><b>'+hhmm(it.t0)+'–'+hhmm(it.t1)+'</b> '+esc(it.c.name)+(it.exam?'（考試）':'')+'<div class="muted">'+esc(it.room.name||'')+(it.c.prof||it.c.profName?'・'+esc(S.profName(it.c)):'')+'・'+st[s]+'</div></div>'+
      ((s==='open'||s==='upcoming')&&it.room.zone==='classroom'?'<button class="btn" data-go="'+esc(it.key)+'">去教室</button>':'')+'</div>'; }
    if(typeof PLACES!=='undefined') h+='<div class="item muted">法律學院圖書館：'+esc(PLACES.todayText('lawlib',G.day))+'　總圖：08:00–22:00</div>';
    h+='<div class="item muted">翹課不會被扣分；沒去的課，可以在宿舍、圖書館、Café 讀書補回來。</div>'; return h; };
  S.weekHTML=function(G){ const t=CALENDAR.termOf(G.day); let termId=t?t.id:null; if(!termId){ for(let k=1;k<200&&!termId;k++){ const q=CALENDAR.termOf(G.day+k); if(q) termId=q.id; } }
    if(!termId) return '<div class="item">沒有課表。</div>'; const cs=S.termCourses(G,termId); const todayWd=CALENDAR.dateOf(G.day).wd; const R=S.rec(G);
    let h='<div class="item"><b>'+S.termName(termId)+'</b>'+(t?'・第 '+t.week+' 週':'（下學期）')+'</div><div class="tt"><div class="tth"></div>'; for(let d=1;d<=5;d++) h+='<div class="tth'+(d===todayWd&&t?' on':'')+'">'+WD[d]+'</div>';
    for(const bk of ['am','pm1','pm2']){ h+='<div class="ttb">'+B(bk).label+'<br><span class="muted">'+hhmm(B(bk).t0)+'</span></div>'; for(let d=1;d<=5;d++){ const c=cs.find(q=>q.slots.some(s=>s.wd===d&&s.block===bk)); h+='<div class="ttc'+(d===todayWd&&t?' on':'')+'">'+(c?esc(c.name)+'<br><span class="muted">'+esc(S.roomName(c))+'</span>':'')+'</div>'; } }
    h+='</div><div class="item muted">出席：'+cs.map(c=>esc(c.name)+' '+(R.attend[c.id]||0)+' 次').join('、')+'</div>'; return h; };
  return S;
})();
