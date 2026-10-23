/* ===== 溫州街四條故事線＋單一事件：什麼時候演、演完觸發什麼（DL-11；USER_WANTS B05；AA_420 第 3～10 節）=====
   事件本身在 src/data/wz_events.js（WZ_EVENTS）；打工的班在 src/jobs3d.js（JOBS，事件掛在 JOBS.SHIFT_EV／ENTER／AFTER_VISIT／EXCUSE）。
   線一（阿德影印）：1-1 第 3 班以後；1-2 大二上第 6～10 週的班；1-3、1-4 法服值班的週六（出門提醒「法服值班（今天陪阿德）」，那天早午餐自動請假；「這次不去」順延一次，再沒去就停）；
     1-5 1-4 之後兩週、最早大二上第 13 週（大二上第 15 週 1-4 還沒做完、1-2 選「也不太懂」＝搬走；沒有 1-2 的玩家大二下第 1 週直接記搬走，不演）；
     阿芃的三個問題第 2、5、9 班，第 9 班結尾 1-6；1-7 C02 法律生活營 2028-07-02 下午（大三升大四，日本路線不在；VAC.jump 走過那一刻時停下來演），7/5 21:00 阿德的訊息。
   線二（一盞茶屋）：2-1、2-3、2-6 週六下午，打工或喝茶都可以（AA_420 4-1；2-1 要茶屋第 2 班以後的週六或週六下午第 2 次來喝茶）；2-2 要在二手市集買舊地圖集（市集還沒做：WZ_YE_MAP_BOUGHT）；
     2-4 公法讀書會那一晚（大三上起，clubEvent）；2-5 以安的訊息（AN_MOM_TEA＋AN_YE_STUDY 的隔天 21:00）；2-6 大四上起（美國路線大四下）；大四下結束都沒遇到＝下次來茶屋蘇姨一句。
   線三（半熟早午餐）：3-1 第 4 班起的旁白；3-2 第 7 班；3-3 3-2 之後至少兩週、大二以後的週末班；3-4 法服值班的週六（同線一的週六規則）；3-3' 下一個週末班；3-5 之後第三個週末班；
     沒幫忙的那一條：第 10 班以後先生回來（沒有卡片）。
   線四（小公園，大三上第 10 週）：餵過貓三次以上＝走進公園演 4-1；「找貓」（公園、巷子、茶屋院子）：陪的人照 AA_420 6-2 的順序；茶屋院子＝4-3（芷若在倫敦：拍照傳給她）；
     沒找到＝第 11 週以後第一次進公園 4-4。之後第一次和陪的人說話多一句（語彤是隔天 21:00 的照片）。
   單一事件：WZ-B3、B4、C3（之後每個考試週週二 19:00 一次考古題讀書會，一科準備 +2）、C4、C5、C6（那週五 17:00 走廊小展）、T3、T4、T5、P4（＋6/18 私訊、6/25 法律小教室）、P5。
   既有事件多一句（linesIf，不改條件）：ev_ziqing_show（WZ_ZQ_POSTER）、ev_sis_defense（WZ_SIS_THESIS）、ev_an_mother_map（AN_MOM_TEA）、ev_yt_lease_text（WZ_COPY_LEASE≥2，在 y2b_events.js）。
   之後聊天一句（STORY.PRE_TALK；學姊走 SISY23.preTalk）：學姊 SIS_SAW_BRUNCH、SIS_TEAHOUSE；子晴 ENC_PARK_ZQ；陪找貓的人；麵店長桌的阿哲；那罐茶可以送人（以安、語彤、學姊、芷若，對方要在台灣）。
   課堂回想（CLS.IN_CLASS）：智財第 4 週（NOTE_COPY_FAIR）、保險法第 5 週（NOTE_INS_CLAUSE）、勞動法第 6 週（NOTE_HOLIDAY_WAGE），那一科準備 +1。
   存檔：全部在 G.flags（舊存檔沒有＝都還沒發生）；餵貓次數 G.daily.park.feedN（src/wzpark3d.js）。測試：node tests/aa420_wz_unit.js */
'use strict';
const WZL=(function(){
  const S={};
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour);
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const J=()=>typeof JOBS!=='undefined'?JOBS:null;
  const wd=d=>CALENDAR.dateOf(d).wd;
  const hh=G=>G.hour;
  S.term=(G,d)=>{ const j=J(); return j?j.termAt(G,d==null?G.day:d):(typeof CALENDAR!=='undefined'?CALENDAR.termOf(d==null?G.day:d):null); };
  const ORDER=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2','Y5S1'];
  const ti=id=>ORDER.indexOf(id);
  /* 這一天在某一學期的第幾週以後（寒暑假算前一個學期已經過完）*/
  S.after=function(G,term,week,d){ if(d==null) d=G.day; const r=CALENDAR.termDays&&CALENDAR.termDays(term); if(!r) return false; return d>=r.from+(week-1)*7; };
  /* ---------- 給事件的條件用 ---------- */
  const STG=()=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND'];
  S.stageIx=id=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return 0; return STG().indexOf(SOCIAL.stage(id)); };
  S.met=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  S.atLeast=(id,st)=>S.met(id)&&S.stageIx(id)>=STG().indexOf(st);
  S.rel=(G,id)=>S.stageIx(id)>=STG().indexOf('FRIEND')?'F':(S.stageIx(id)>=STG().indexOf('FAMILIAR')?'f':'a');   /* 認識 a／有點熟 f／朋友以上 F */
  S.dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  S.year=G=>J()?J().year(G):1;
  S.grade=G=>'Y'+Math.min(5,Math.max(1,S.year(G)));
  S.fafuMember=G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G);
  S.route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  S.usLate=G=>S.route(G)==='US';
  S.reachable=(id,G)=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(id,G);
  S.brunchSat=G=>{ const j=J()&&J().job(G,'brunch'); return !!j&&Array.isArray(j.day)&&j.day.includes(6); };
  S.b1Done=G=>{ const j=J()&&J().job(G,'brunch'); return !!j&&(j.shifts|0)>=1||!!(J()&&J().running); };
  S.oddSunday=G=>{ const t=S.term(G); return wd(G.day)===7&&!!t&&t.week%2===1; };
  /* 上過 ip_law 第 4 週（AA_420 2-4、3-3）*/
  S.ipW4=function(G){ if(typeof CLS==='undefined'||!CLS.rec) return false; const R=CLS.rec(G); for(const k in (R.done||{})){ const q=k.split(':'); if(q[1]!=='ip_law') continue; const t=S.term(G,+q[0]); if(t&&t.week===4) return true; } return false; };
  /* 芷若在倫敦（BB_148 8c-2）：有她的聯絡方式、有點熟以上 */
  S.zrPhoto=G=>S.atLeast('heroine_02','FAMILIAR')&&typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,'heroine_02');
  S.p5First=G=>{ const F=G.flags, t=S.term(G), R=F.WZ_P5||{}; return !t||(R[t.id]|0)<=1; };   /* 這一學期第一次（WZ_P5 在演之前加一）*/
  S.hasNote=(G,id)=>Array.isArray(G.notes)&&G.notes.some(n=>n.id===id);
  const busy=GM=>(J()&&J().busy(GM))||S.playing;
  S.playing=false;
  S.run=async function(GM,id,o){ const e=evOf(id); if(!e||typeof EVENTS==='undefined') return false;
    if(EVENTS.running&&EVENTS.runLines){ const G=GM.G, own=typeof ADV!=='undefined'&&!ADV.active; if(own) ADV.begin({background:e.background||'blur'});   /* 在別的事件裡面（營隊：VAC 的行程本身是一個出遊事件）：直接演台詞、記成演過 */
      try{ await EVENTS.runLines(e.dialogue||[],e); if(EVENTS.applyConsequences) EVENTS.applyConsequences(e.consequences); G.events.done[id]=(G.events.done[id]||0)+1; G.events.last[id]=G.day; } finally { if(own&&ADV.active) ADV.end(); }
      return true; }
    await EVENTS.run(e,o); return !!done(GM.G,id); };
  const fire=(GM,id,after)=>{ S.playing=true; S.run(GM,id).then(r=>after&&after(r)).catch(e=>console.warn('WZL',id,e)).finally(()=>{ S.playing=false; }); return true; };

  // ================= 線一、線三：法服值班的週六（AA_420 3-1 最後的規則）=================
  S.LINE={lease2:{ev:'ev_wz_c_lease2',title:'法服值班（今天陪阿德）'},lease3:{ev:'ev_wz_c_lease3',title:'法服值班（今天陪阿德）'},ins2:{ev:'ev_wz_b_ins2',title:'法服值班（今天陪林太太）'}};
  S.duty=(G,d)=>typeof STORY!=='undefined'&&!!STORY.fafuDuty&&STORY.fafuDuty({day:d,flags:G.flags,stage:G.stage});
  S.nextDuty=function(G,from,lim){ for(let d=from;d<from+120;d++){ if(lim&&d>lim) return null; if(S.duty(G,d)) return d; } return null; };
  S.leaseStep=G=>{ const F=G.flags; if(F.WZ_LEASE_STOP||F.WZ_COPY_SHOP) return null; const v=+F.WZ_COPY_LEASE||0; return v===1?'lease2':(v===2?'lease3':null); };
  S.insStep=G=>{ const F=G.flags; if(F.WZ_INS_STOP) return null; return (+F.WZ_BRUNCH_INS||0)===1?'ins2':null; };
  S.w15End=()=>{ const r=CALENDAR.termDays('Y2S1'); return r?r.from+15*7-1:null; };   /* 大二上第 15 週的最後一天 */
  /* 每一條的目標週六：{k, day, tries}（G.flags.WZ_LINE_L／WZ_LINE_I）；目標過了沒演＝順延一次，再沒去就停 */
  S.linePlan=function(G){ const F=G.flags; if(!law(G)||typeof CALENDAR==='undefined') return;
    const step=(key,stepK,from,lim,stopF,avoid)=>{ let R=F[key]; if(!stepK){ if(R) F[key]=null; return; }
      if(R&&R.k!==stepK) R=F[key]=null;
      if(R&&!done(G,S.LINE[R.k].ev)&&now(G)>=T(R.day,12)){ const tr=(R.tries|0)+1; if(tr>=2){ F[stopF]=G.day; F[key]=null; return; } const nd=S.nextDuty(G,R.day+1,lim); if(nd==null){ F[stopF]=G.day; F[key]=null; return; } R=F[key]={k:stepK,day:nd,tries:tr}; }
      if(!R){ let nd=S.nextDuty(G,Math.max(from,G.day),lim); while(nd!=null&&avoid!=null&&nd===avoid) nd=S.nextDuty(G,nd+1,lim); if(nd==null){ if(lim!=null&&G.day>lim) F[stopF]=G.day; return; } R=F[key]={k:stepK,day:nd,tries:0}; } };
    const ls=S.leaseStep(G), w7=CALENDAR.termDays('Y2S1')?CALENDAR.termDays('Y2S1').from+6*7:0;
    step('WZ_LINE_L',ls,ls==='lease2'?Math.max((+F.WZ_C_L1||0)+1,w7):(+F.WZ_C_L2||0)+1,S.w15End(),'WZ_LEASE_STOP',null);
    const LL=F.WZ_LINE_L; step('WZ_LINE_I',S.insStep(G),(+F.WZ_B_INS_DAY||0)+1,null,'WZ_INS_STOP',LL?LL.day:null);
    if(F.WZ_LINE_I&&LL&&F.WZ_LINE_I.day===LL.day){ const nd=S.nextDuty(G,LL.day+1); if(nd!=null) F.WZ_LINE_I.day=nd; }   /* 同一個週六兩件：林太太順延（不算沒去）*/
    /* 出門提醒：「法服值班（今天陪阿德）」「法服值班（今天陪林太太）」；選「這次不去」＝順延 */
    const today=S.lineToday(G); if(today&&typeof OUT!=='undefined'&&G.hour<9.5){ const id='fafu_'+G.day, q=OUT.get(G,id), L=S.LINE[today.k];
      if(q){ if(q.state==='planned'){ q.title=L.title; q.no='這次不去'; } }
      else OUT.plan(G,{id,day:G.day,h:9,place:'萬才館一樓',title:L.title,travel:'走過去約 10 分鐘',travelH:0.25,no:'這次不去',goto:{zone:'wancai',x:0,z:5,yaw:Math.PI},silent:true}); } };
  S.lineToday=function(G){ const F=G.flags; for(const k of ['WZ_LINE_L','WZ_LINE_I']){ const R=F[k]; if(R&&R.day===G.day&&!done(G,S.LINE[R.k].ev)) return R; } return null; };
  /* 那個週六早午餐自動請假（JOBS.EXCUSE）*/
  S.excuse=(G,k,d)=>{ if(k!=='brunch') return null; const F=G.flags; for(const key of ['WZ_LINE_L','WZ_LINE_I']){ const R=F[key]; if(R&&R.day===d) return 'fafu_line'; } return null; };
  S.lineAt=function(GM){ const G=GM.G; if(G.zone!=='wancai'||hh(G)<9||hh(G)>=12) return false; const R=S.lineToday(G); if(!R) return false; const F=G.flags;
    return fire(GM,S.LINE[R.k].ev,()=>{ if(F.LAWCLUB_SAT_LAST!==G.day){ F.LAWCLUB_SAT_LAST=G.day; F.LAWCLUB_SAT_VISITS=(F.LAWCLUB_SAT_VISITS|0)+1; } if(S.fafuMember(G)) F.FAFU_SHIFT_N=(F.FAFU_SHIFT_N|0)+1; if(GM.autosave) GM.autosave(); }); };   /* LAWCLUB_SAT_VISITS +1（落點 A）*/
  /* 1-5 結果 */
  S.lease4=function(G){ const F=G.flags; if(!law(G)||!F.WZ_C_L1||F.WZ_COPY_SHOP) return null; if(!S.after(G,'Y2S1',13)) return null;
    const v=+F.WZ_COPY_LEASE||0; if(v>=3) return G.day>=(+F.WZ_C_L3||0)+14?'stay':null;
    if(v===0||F.WZ_LEASE_STOP||G.day>S.w15End()) return 'moved'; return null; };

  // ================= 打工的班裡的事件（JOBS.SHIFT_EV）=================
  const sat=G=>wd(G.day)===6;
  const tid=G=>{ const t=S.term(G); return t?t.id:null; };
  const worked=(G,k)=>{ const j=J()&&J().job(G,k); return j&&Array.isArray(j.worked)?j.worked:[]; };
  S.typhoonPend=function(G){ const F=G.flags; if(typeof CALENDAR==='undefined'||!CALENDAR.typhoon) return null; for(let d=G.day-1;d>G.day-40;d--){ if(CALENDAR.typhoon(d)){ if((+F.WZ_T3_TY||-1e9)>=d) return null; const w=worked(G,'tea').filter(x=>x>d&&x<G.day); return w.length?null:d; } } return null; };   /* 颱風假之後的第一個班 */
  S.momSat=G=>{ const x=CALENDAR.dateOf(G.day); return x.wd===6&&x.d<=7; };   /* 以安的媽媽北上的週六：每月第一個週六（AA_113 9-2「每月一次的晚餐」；遊戲沒有她的行程，照這個算）*/
  S.SHIFT={
    brunch:[
      {id:'ev_wz_b_back',due:(G,n)=>{ const F=G.flags; if(F.WZ_BRUNCH_BACK) return false; const ok=(+F.WZ_BRUNCH_INS||0)===2||(F.WZ_BRUNCH_SELF&&done(G,'ev_wz_b_ins_self')); if(!ok||F.WZ_B_HELP_DAY==null) return false; return worked(G,'brunch').filter(d=>d>F.WZ_B_HELP_DAY).length+1>=3; }},
      {id:'ev_wz_b_ins_self',due:G=>{ const F=G.flags; return !!F.WZ_BRUNCH_SELF&&!done(G,'ev_wz_b_ins_self')&&G.day>(+F.WZ_B_INS_DAY||0); }},
      {id:'ev_wz_b_ins',due:G=>{ const F=G.flags; return !!F.WZ_BRUNCH_HELP&&!done(G,'ev_wz_b_ins')&&F.WZ_B2_DAY!=null&&G.day>=F.WZ_B2_DAY+14&&S.year(G)>=2; }},
      {id:'ev_wz_b_home',due:(G,n)=>{ const F=G.flags; return n>=10&&done(G,'ev_wz_b2')&&!F.WZ_BRUNCH_BACK&&(!F.WZ_BRUNCH_HELP||!!F.WZ_INS_STOP); }},
      {id:'ev_wz_b2',due:(G,n)=>n>=7&&!done(G,'ev_wz_b2')},
      {id:'ev_wz_b4',due:G=>{ const t=tid(G); if(!(t==='Y2S1'||t==='Y2S2')||!sat(G)||!S.met('heroine_05')) return false; const R=G.flags.WZ_B4||{}; return !R[t]; },pre:G=>{ const R=G.flags.WZ_B4=Object.assign({},G.flags.WZ_B4); R[tid(G)]=G.day; }},
      {id:'ev_wz_b3',due:(G,n)=>n>=3&&!done(G,'ev_wz_b3')&&S.atLeast('zhe','FAMILIAR'),post:(G,GM)=>{ if(typeof PHONE!=='undefined'&&PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'wz_b3_photo')) PHONE.at(G,G.day,Math.max(G.hour,11.5),[{th:'g:noodle_team',from:'zhe',text:'📷（你端著三個盤子的背影）'},{th:'g:noodle_team',from:'zhe',text:'麵店團週末分部成立。'}],'wz_b3_photo'); }} ],
    copy:[
      {id:'@lease4',due:G=>!!S.lease4(G)},
      {id:'ev_wz_c_lease1',due:G=>{ const t=S.term(G); return !!t&&t.id==='Y2S1'&&t.week>=6&&t.week<=10&&!G.flags.WZ_C_L1; }},
      {id:'ev_wz_c5',due:G=>{ const t=S.term(G); return !!t&&t.id==='Y4S2'&&(t.week===13||t.week===14)&&S.met('heroine_05')&&!done(G,'ev_wz_c5'); }},
      {id:'ev_wz_c3',due:G=>{ const t=S.term(G); return !!t&&(t.id==='Y2S1'||t.id==='Y2S2')&&t.exam==='final'&&S.atLeast('classmate_bohan','FAMILIAR')&&done(G,'ev_wz_c2')&&!done(G,'ev_wz_c3'); }},
      {id:'ev_wz_c4',due:G=>{ const t=S.term(G), w=wd(G.day); return !!t&&t.id==='Y1S2'&&(t.week===12||t.week===13)&&(w===2||w===4)&&S.met('heroine_04')&&!done(G,'ev_wz_c4'); }},
      {id:'ev_wz_c2',due:(G,n)=>n>=3&&!done(G,'ev_wz_c2')},
      {id:'ev_wz_c6',due:G=>{ const t=S.term(G); return !!t&&(t.id==='Y3S1'||t.id==='Y3S2')&&S.atLeast('heroine_03','FAMILIAR')&&!done(G,'ev_wz_c6'); }} ],
    tea:[
      {id:'ev_wz_t3',due:G=>S.typhoonPend(G)!=null,pre:G=>{ G.flags.WZ_T3_TY=S.typhoonPend(G); }},
      {id:'@line2',due:G=>!!S.line2Due(G,'shift')},
      {id:'ev_wz_t5',due:G=>{ const t=S.term(G); return sat(G)&&S.momSat(G)&&!!t&&ti(t.id)>=1&&ti(t.id)<=7&&S.atLeast('heroine_01','FAMILIAR')&&S.reachable('heroine_01',G)&&!done(G,'ev_wz_t5'); }},
      {id:'ev_wz_t4',due:G=>{ if(!sat(G)||!S.atLeast('heroine_05','FAMILIAR')) return false; const y=S.year(G), t=S.term(G); if(y<2||y>4) return false; if(y===4&&!(t&&t.id==='Y4S2')) return false;   /* 大四上她在美國（2028-08～12）*/
        const R=G.flags.WZ_T4||{}; return !R['Y'+y]; },pre:G=>{ const R=G.flags.WZ_T4=Object.assign({},G.flags.WZ_T4); R['Y'+S.year(G)]=G.day; }} ] };
  /* 線二（週六下午，打工或喝茶）：2-6 → 2-2 → 2-3 → 2-1 */
  S.line2Due=function(G,how){ const F=G.flags; if(!law(G)||!sat(G)||hh(G)<12||hh(G)>=18) return null; const ye=+F.WZ_YE||0;
    if(ye>=1&&!F.WZ_LU_GONE&&!done(G,'ev_wz_t2c')){ const t=S.term(G); if(t&&(S.usLate(G)?t.id==='Y4S2':(t.id==='Y4S1'||t.id==='Y4S2'))) return 'ev_wz_t2c'; }
    if(ye>=1&&F.WZ_YE_MAP_BOUGHT&&!F.WZ_YE_MAP) return 'ev_wz_t_map';   /* 二手市集（WZ-P2）還沒做：買到舊地圖集的玩家才有 */
    if(ye===1&&!done(G,'ev_wz_t2b')&&S.after(G,'Y2S1',3)) return 'ev_wz_t2b';
    if(ye===0&&!done(G,'ev_wz_t2a')){ const j=J()&&J().job(G,'tea'), M=J()?J().rec(G)._meta.n:{}; const n2=how==='shift'?(((j&&j.shifts)|0)+1>=2):((M.teaSat|0)>=2); if(n2) return 'ev_wz_t2a'; }
    return null; };
  S.shiftEv=async function(GM,k,n){ const G=GM.G; if(!law(G)) return; const L=S.SHIFT[k]||[];
    if(k==='copy'){ const c7={2:'ev_wz_c7a',5:'ev_wz_c7b',9:'ev_wz_c7c'}[n]; if(c7&&!done(G,c7)) await S.run(GM,c7); }   /* WZ-C7 阿芃的三個問題（第 2、5、9 班）*/
    for(const e of L){ let ok=false; try{ ok=!!e.due(G,n); }catch(err){ ok=false; } if(!ok) continue;
      if(e.pre) e.pre(G); let id=e.id; if(id==='@lease4') id=S.lease4(G)==='stay'?'ev_wz_c_lease4':'ev_wz_c_lease4m'; if(id==='@line2') id=S.line2Due(G,'shift');
      await S.run(GM,id); if(e.post) e.post(G,GM); break; }
    if(k==='copy'&&n>=9&&done(G,'ev_wz_c7c')&&!done(G,'ev_wz_c_apeng')) await S.run(GM,'ev_wz_c_apeng'); };   /* 1-6：第 9 班的結尾 */
  /* 3-1 老樣子（第 4 班起；先生住院那段沒有）＋3-5 以後「先生今天吃完了」*/
  S.OLD=['騎樓第二桌，兩份老樣子：一份半熟蛋、一份全熟。先生吃全熟，太太說他怕。','太太叫你『{name}弟弟』。先生叫你『小老闆』。小米姐說你不是老闆，先生說：『以後就是了。』'];
  S.shiftLines=function(G,k,n,seg){ if(k!=='brunch'||seg!=='mid'||n<4) return null; const F=G.flags; const away=done(G,'ev_wz_b2')&&!F.WZ_BRUNCH_BACK; if(away) return null;
    const out=[[null,S.OLD[(n-4)%2]]]; if(F.WZ_BRUNCH_BACK==='card') out.push([null,'先生今天吃完了']); return out; };
  /* 客人：週六下午喝茶（線二）*/
  S.afterVisit=async function(GM,k,o){ const G=GM.G; if(k!=='tea'||!o.bought) return false; const id=S.line2Due(G,'visit'); if(!id) return false; GM.sceneBegin(); try{ await S.run(GM,id); } finally { GM.sceneEnd(); } return true; };
  /* 走進店裡：1-5（影印店）、2-6 沒遇到以後蘇姨那一句（茶屋）*/
  S.ENTER=[ {due:(G,k)=>k==='copy'&&!!S.lease4(G),run:async GM=>{ await S.run(GM,S.lease4(GM.G)==='stay'?'ev_wz_c_lease4':'ev_wz_c_lease4m'); }},
    {due:(G,k)=>k==='tea'&&S.luMissed(G),run:async GM=>{ const G=GM.G; G.flags.WZ_LU_GONE='missed'; GM.sceneBegin(); try{ await GM.say({name:'蘇姨'},'呂老師搬走了。杯子留在這裡。'); } finally { GM.sceneEnd(); } }} ];
  S.luMissed=G=>{ const F=G.flags; if(F.WZ_LU_GONE||!(+F.WZ_YE>=1)||done(G,'ev_wz_t2c')) return false; const r=CALENDAR.termDays('Y4S2'); return !!r&&G.day>r.to; };   /* 大四下結束都沒遇到（AA_420 4-1）*/

  // ================= 線四：貓不見的那一週 =================
  const parkIn=GM=>{ const G=GM.G, P=GM.E&&GM.E.player; return G.zone==='wenzhou'&&!!P&&typeof PARK!=='undefined'&&!!PARK.inPark&&PARK.inPark(P.obj.position.x,P.obj.position.z); };
  S.feedN=G=>((G.daily&&G.daily.park&&G.daily.park.feedN)|0);
  S.catWeek=G=>{ const t=S.term(G); return !!t&&t.id==='Y3S1'&&t.week===10; };
  S.lostDue=G=>S.catWeek(G)&&S.feedN(G)>=3&&G.flags.WZ_CAT_LOST==null&&hh(G)>=6&&hh(G)<22;
  S.backDue=G=>{ const t=S.term(G); return !!t&&t.id==='Y3S1'&&t.week>=11&&S.feedN(G)>=3&&G.flags.WZ_CAT_FOUND==null&&G.flags.WZ_CAT_BACK==null; };
  S.searchOn=G=>S.catWeek(G)&&G.flags.WZ_CAT_LOST!=null&&G.flags.WZ_CAT_FOUND==null;
  /* 誰陪你找（AA_420 6-2）：以安 → 子晴 → 語彤 → Alison，取第一個符合的 */
  S.companion=function(G){ const h=hh(G)%24, w=wd(G.day), wkend=w>=6, hr=G.hour;
    if(S.atLeast('heroine_01','FRIEND')&&S.reachable('heroine_01',G)&&((!wkend&&h>=17&&h<19)||(wkend&&h>=14&&h<17))) return 'heroine_01';
    if(S.atLeast('heroine_04','FAMILIAR')&&(hr>=22)&&w!==3&&S.reachable('heroine_04',G)) return 'heroine_04';
    if(S.atLeast('heroine_03','FAMILIAR')&&S.reachable('heroine_03',G)&&h<17) return 'heroine_03';
    if(S.atLeast('yu','FAMILIAR')&&S.reachable('yu',G)) return 'yu';
    return null; };
  S.SEARCH_LINES={heroine_01:[['heroine_01','我知道牠。牠常在巷口曬太陽。'],['heroine_01','好。我們分區找。你巷子，我公園。……不對，一起找。分開會漏。']],
    heroine_03:[['heroine_03','……拍過牠。'],[null,'她翻手機，「這張，牠在茶屋的牆上。」']],
    yu:[['yu','欸我們要不要印傳單？……喔，公布欄已經有了。']], heroine_04:[]};
  const who=id=>id?{name:typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(id):SOCIAL.displayName(id)):id,charId:id}:null;
  S.search=async function(GM){ const G=GM.G, F=G.flags; if(!S.searchOn(G)) return false; const R=F.WZ_CAT_SEARCH=Object.assign({park:false,lane:false},F.WZ_CAT_SEARCH);
    GM.sceneBegin(); let go=null;
    try{ if(R.with===undefined){ const c=S.companion(G); R.with=c; F.WZ_CAT_WITH=c; if(c){ F['CAT_SEARCH_WITH_'+c]=true; for(const [w,t] of S.SEARCH_LINES[c]) await GM.say(who(w),t); } }
      const O=[]; if(!R.park) O.push({t:'找公園',hint:'10 分鐘',k:'park'}); if(!R.lane) O.push({t:'找巷子',hint:'10 分鐘',k:'lane'}); O.push({t:'找茶屋的院子',hint:'10 分鐘',k:'tea'},{t:'先不找',k:'no'});
      const o=O[await GM.choose(O.map(x=>({t:x.t,hint:x.hint})))]||{k:'no'};
      if(o.k==='park'||o.k==='lane'){ R[o.k]=true; GM.advance(1/6); if(GM.toast) GM.toast('沒有找到。',2400); }
      else if(o.k==='tea') go='tea'; }
    finally { GM.sceneEnd(); }
    if(go==='tea'){ GM.advance(1/6); if(GM.fade) await GM.fade(true); if(GM.enter) await GM.enter('wz_teahouse',{x:1.5,z:5.4,yaw:0}); if(GM.fade) await GM.fade(false); await S.found(GM); }
    if(GM.autosave) GM.autosave(); return true; };
  S.found=async function(GM){ const G=GM.G, F=G.flags, c=F.WZ_CAT_WITH; await S.run(GM,'ev_wz_p_found'); if(c&&typeof SOCIAL!=='undefined') SOCIAL.adjust(c,{fam:2,comf:2});
    if(c) F.WZ_CAT_FU=c;   /* 之後的閒聊多一句（語彤＝隔天 21:00 的照片）*/
    if(F.WZ_CAT_FOUND==null) F.WZ_CAT_FOUND=G.day; return true; };
  S.parkTick=function(GM){ const G=GM.G; if(!parkIn(GM)) return false;
    if(S.lostDue(G)) return fire(GM,'ev_wz_p_lost');
    if(S.backDue(G)) return fire(GM,'ev_wz_p_back');
    if(S.p4Due(G)) return fire(GM,'ev_wz_p4');
    if(S.classDue(G)) return fire(GM,'ev_wz_p4_class');
    if(S.p5Due(G)){ const F=G.flags, t=S.term(G), R=F.WZ_P5=Object.assign({},F.WZ_P5); R[t.id]=(R[t.id]|0)+1; R.last=G.day; return fire(GM,'ev_wz_p5',()=>{ if(!F.ENC_PARK_ZQ_SEEN){ F.ENC_PARK_ZQ_SEEN=G.day; F.WZ_ZQ_P5_FU=true; if(typeof SOCIAL!=='undefined'){ SOCIAL.remember('heroine_04','ENC_PARK_ZQ',''); SOCIAL.adjust('heroine_04',{fam:1}); } } }); }
    return false; };
  /* WZ-P4（AA_420 8-5：大一下第 3 週～2026-12-16，週二、四 17:00～17:30）*/
  S.p4Due=function(G){ const F=G.flags; if(done(G,'ev_wz_p4')||!S.after(G,'Y1S2',3)) return false; const e=DK('2026-12-16'); if(e==null||G.day>e) return false; const w=wd(G.day), h=hh(G);
    if(!(w===2||w===4)||h<17||h>=17.5) return false; if(typeof PARK!=='undefined'&&PARK.schoolDay&&!PARK.schoolDay(G)) return false; if(typeof PARK!=='undefined'&&PARK.rainy&&PARK.rainy(G)) return false;
    return S.atLeast('classmate_peishan','FAMILIAR')&&S.reachable('classmate_peishan',G); };
  S.classDue=G=>{ const d=DK('2026-06-25'); return !!G.flags.WZ_PS_KIDS&&G.day===d&&hh(G)>=17&&hh(G)<18&&!done(G,'ev_wz_p4_class'); };
  /* WZ-P5（BB_148 第 6 節）：22:00 以後；大一～大三、子晴畢業以前；週三沒有；考試週、下雨沒有；日期擲一次（固定）；一學期最多三次 */
  S.p5Due=function(G){ const F=G.flags; if(G.hour<22||!S.atLeast('heroine_04','FAMILIAR')) return false; const t=S.term(G); if(!t||ti(t.id)<0||ti(t.id)>5||t.exam) return false;
    const gd=DK('2028-06-10'); if(gd!=null&&G.day>=gd) return false; if(wd(G.day)===3) return false; if(typeof PARK!=='undefined'&&PARK.rainy&&PARK.rainy(G)) return false;
    const R=F.WZ_P5||{}; if((R[t.id]|0)>=3||R.last===G.day) return false; return ((G.day*7919+311)%100)<35; };

  // ================= 營隊（1-7）：VAC.jump 走過 7/2 下午時停下來演 =================
  S.campOn=G=>{ const F=G.flags; if(!F.WZ_APENG_LAW||done(G,'ev_wz_c_camp')||S.route(G)==='JP') return false; const R=typeof VAC!=='undefined'&&VAC.rec?VAC.rec(G).reg:{}; return R['C02@Y3']==='yes'||R['C02@Y3']==='done'; };
  if(typeof VAC!=='undefined'&&VAC.jump&&!VAC._wz){ const j0=VAC.jump; VAC.jump=async function(GM,t){ const G=GM&&GM.G, d=DK('2028-07-02'), at=d!=null?T(d,14):null;
      if(G&&at!=null&&S.campOn(G)&&now(G)<at&&t>at){ await j0.call(this,GM,at,'營隊（校內）',{quiet:true}); try{ await S.run(GM,'ev_wz_c_camp'); }catch(e){ console.warn('WZL camp',e); } }
      return j0.apply(this,arguments); }; VAC._wz=true; }

  // ================= 手機、出門提醒（STORY.PHONE_RULES）=================
  S.phone=function(G){ if(!law(G)||typeof CALENDAR==='undefined'||typeof PHONE==='undefined') return; const F=G.flags;
    S.linePlan(G);
    { const r=CALENDAR.termDays('Y2S2'); if(r&&G.day>=r.from&&!F.WZ_C_L1&&!F.WZ_COPY_SHOP) F.WZ_COPY_SHOP='moved'; }   /* 沒有 1-2 的玩家：大二下第 1 週店搬走（AA_420 3-1）*/
    /* 2-5 以安媽媽的一句話（AN_MOM_TEA＋AN_YE_STUDY 的隔天 21:00）*/
    if(F.AN_MOM_TEA&&F.AN_YE_STUDY&&!PHONE.sent(G,'wz_t_hint')){ const d=Math.max(+F.WZ_YE_STUDY_DAY||0,+F.WZ_AN_MOM_DAY||0)+1, A=t=>({th:'p:heroine_01',from:'heroine_01',text:t});
      if(G.day>=d){ PHONE.at(G,d,21,[A('我媽問起那位老師的事。我只說了大概。'),A('她說：先去調最早的那一份，再往後看。'),Object.assign(A('……她只說了這兩句。她平常不會說這麼多。'),{ask:{id:'wz_t_hint',opts:[{t:'替我謝謝媽媽。',say:[A('好。她會說『不用』。')]},{t:'最早的那一份，是哪一份？',say:[A('這就是我們下次讀書會要查的。')]}]}})],'wz_t_hint'); F.WZ_YE_HINT=true; if(typeof SOCIAL!=='undefined') SOCIAL.adjust('heroine_01',{fam:1}); } }
    /* WZ-T5 晚上以安的私訊 */
    if(F.WZ_AN_MOM_DAY!=null&&!PHONE.sent(G,'wz_t5_msg')){ const A=t=>({th:'p:heroine_01',from:'heroine_01',text:t}); PHONE.at(G,F.WZ_AN_MOM_DAY,21,[A('今天謝謝你'),A('我媽回家路上問，那間茶屋週末都有開嗎')],'wz_t5_msg'); }
    /* WZ-P4 → 6/18 沛珊的私訊（只給 6/18 以前演過的玩家）、6/25 法律小教室、沒來＝18:30 那一句 */
    { const d18=DK('2026-06-18'), d25=DK('2026-06-25'), P=t=>({th:'p:classmate_peishan',from:'classmate_peishan',text:t});
      if(F.WZ_P4_DAY!=null&&d18!=null&&F.WZ_P4_DAY<=d18&&G.day>=d18&&G.day<=d25&&!PHONE.sent(G,'wz_p4_invite'))
        PHONE.at(G,d18,21,[P('課輔班 6/25 是暑假前最後一天。想請一個會講法律的人來講十分鐘。'),Object.assign(P('……那個綁馬尾的小女生指定你。'),{ask:{id:'wz_p4_invite',until:T(d25,17),opts:[{t:'好。',set:{WZ_PS_KIDS:true},say:[P('好！我跟她說。')]},{t:'那天不行。',say:[P('好，我幫你跟她說。……她會記很久喔。')]}]}})],'wz_p4_invite');
      if(F.WZ_PS_KIDS&&d25!=null&&typeof OUT!=='undefined'&&!OUT.get(G,'wz_p4_class')&&now(G)<T(d25,17.5)) OUT.plan(G,{id:'wz_p4_class',day:d25,h:17,late:0.5,place:'溫州街小公園',title:'課輔班的法律小教室',travel:'走過去約 15 分鐘',travelH:0.25,goto:{zone:'wenzhou',x:26,z:16,yaw:Math.PI},silent:true});
      if(F.WZ_PS_KIDS&&d25!=null&&now(G)>=T(d25,18.5)&&!done(G,'ev_wz_p4_class')&&!PHONE.sent(G,'wz_p4_cards')) PHONE.at(G,d25,18.5,[P('她們有做卡片給你。我先收著。')],'wz_p4_cards'); }
    /* WZ-C6 → 那週五 17:00 的走廊小展 */
    if(F.WZ_YT_PHOTO_DAY!=null&&typeof OUT!=='undefined'&&!OUT.get(G,'wz_yt_show')){ let f=F.WZ_YT_PHOTO_DAY; while(wd(f)!==5) f++; if(now(G)<T(f,18.5)) OUT.plan(G,{id:'wz_yt_show',ev:'ev_wz_c6_show',day:f,h:17,late:1.5,place:'社科院一樓的走廊',title:'語彤的走廊小展',travel:'走過去約 10 分鐘',travelH:1/6}); }
    /* WZ-C3 → 考試週的考古題讀書會（週二 19:00；週二過了排週四）*/
    if(F.BH_STUDY_GROUP&&typeof OUT!=='undefined'){ const t=S.term(G); if(t&&t.exam){ const wk=t.id+':'+t.week, R=F.WZ_BH_WK||{}; if(!R[wk]){ const w=wd(G.day); if((w===2||w===4)&&G.hour<19.25&&!OUT.get(G,'wz_bh_'+G.day)) OUT.plan(G,{id:'wz_bh_'+G.day,ev:'ev_wz_bh_group',day:G.day,h:19,late:0.5,place:'社科院圖書館',title:'考古題讀書會（社科圖）',travel:'走過去約 10 分鐘',travelH:1/6,silent:true}); } } }
    /* 1-7 → 營隊結束當晚阿德的訊息 */
    if(F.WZ_CAMP_APENG!=null&&!PHONE.sent(G,'wz_camp_ade')){ const d5=DK('2028-07-05'); if(d5!=null) PHONE.at(G,d5,21,[{th:'p:wz_ade',from:'wz_ade',text:'她說營隊的那個哥哥講得很清楚。我說那是我們店的。'}],'wz_camp_ade'); }
    /* 線四：語彤隔天的照片 */
    if(F.WZ_CAT_FU==='heroine_03'&&F.WZ_CAT_FOUND!=null&&!PHONE.sent(G,'wz_cat_yt')){ const Y=t=>({th:'p:heroine_03',from:'heroine_03',text:t}); PHONE.at(G,F.WZ_CAT_FOUND+1,21,[Y('📷（緣側下面，一團橘白色）'),Y('那天的。')],'wz_cat_yt'); F.WZ_CAT_FU=null; } };
  /* 考古題讀書會：一科準備 +2（AA_124 2-3）*/
  S.bhGroupPick=async function(GM){ const G=GM.G, F=G.flags, t=S.term(G); if(!t||typeof CLS==='undefined'||!CLS.termCourses) return; const wk=t.id+':'+t.week; F.WZ_BH_WK=Object.assign({},F.WZ_BH_WK,{[wk]:G.day});
    const cs=CLS.termCourses(G,t.id).filter(c=>c.kind!=='service'); if(!cs.length) return; const k=await GM.choose(cs.map(c=>({t:c.name,hint:'準備 +2'}))); const c=cs[k]||cs[0]; const R=CLS.rec(G); R.prep[c.id]=(R.prep[c.id]||0)+2;
    if(CLS.slotFillSpan) CLS.slotFillSpan(G,19,21); };

  // ================= 之後聊天一句（STORY.PRE_TALK）、那罐茶 =================
  S.FU={ heroine_01:'所長的腳好了。我昨天經過，牠在巡公園。', yu:'欸我昨天在公園看到牠，牠瘦了一點點。……一點點。', heroine_04:'我昨天繞去公園。牠在巡邏，走路已經不跛了。' };
  S.TEA_GIFT={ heroine_01:'茶？……好。你泡得最好的那一種？我要知道是什麼味道。', heroine_03:'……我會慢慢喝。', heroine_05:'謝謝。……我會留到一個沒有排計畫的下午。', heroine_02:'你泡得最好的那一種？……那我不在店裡喝。帶回家，一個人喝。' };
  /* 對方在台灣：芷若大三上（倫敦）、2028-09 起一年在英國；學姊 2028-08～12 在美國 */
  S.inTaiwan=(G,id)=>{ if(id==='heroine_02'){ const t=S.term(G); if(t&&t.id==='Y3S1') return false; const a=DK('2028-09-01'), b=DK('2029-08-31'); if(a!=null&&G.day>=a&&G.day<=b) return false; }
    if(id==='heroine_05'){ const a=DK('2028-08-01'), b=DK('2028-12-31'); if(a!=null&&G.day>=a&&G.day<=b) return false; } return S.reachable(id,G); };
  S.preTalk=async function(GM,w,id){ const G=GM.G, F=G.flags; if(!law(G)) return;
    if(F.WZ_CAT_FU===id&&S.FU[id]&&G.day>(+F.WZ_CAT_FOUND||0)){ F.WZ_CAT_FU=null; await GM.say(w,S.FU[id]); return; }
    if(id==='heroine_04'&&F.WZ_ZQ_P5_FU&&G.day>(+F.ENC_PARK_ZQ_SEEN||0)){ F.WZ_ZQ_P5_FU=false; await GM.say(w,'昨天那個 bug，鞦韆解決了。……今天換你盪。'); return; }
    if(id==='zhe'&&G.zone==='noodle'&&F.NOODLE_SAW_APRON&&!F.WZ_ZHE_APRON){ F.WZ_ZHE_APRON=G.day; await GM.say(w,F.ZHE_CALLS_GE?'哥，你今天沒穿圍裙喔？':G.name+'，你今天沒穿圍裙喔？'); return; }
    await S.teaGift(GM,w,id); };
  S.sisPre=async function(GM){ const G=GM.G, F=G.flags, w=who('heroine_05'); if(!law(G)) return false;
    if(F.WZ_SIS_BRUNCH_FU&&(G.events.last||{}).ev_wz_b4!==G.day){ F.WZ_SIS_BRUNCH_FU=false; await GM.say(w,'週六早上的蛋，今天也是半熟嗎？'); return false; }
    if(F.WZ_SIS_TEA_FU&&(G.events.last||{}).ev_wz_t4!==G.day){ F.WZ_SIS_TEA_FU=false; await GM.say(w,'茶屋那壺水，我後來查了。……原來不能用滾的。'); return false; }
    await S.teaGift(GM,w,'heroine_05'); return false; };
  S.teaGift=async function(GM,w,id){ const G=GM.G, F=G.flags; if(!F.WZ_ITEM_TEA||F.WZ_TEA_GIVEN||!S.TEA_GIFT[id]) return false;
    if((id==='heroine_05'||id==='heroine_02')&&!S.atLeast(id,'FAMILIAR')) return false; if(!S.inTaiwan(G,id)) return false;
    const R=F.WZ_TEA_ASK=Object.assign({},F.WZ_TEA_ASK); if(R[id]===G.day) return false; R[id]=G.day;
    const k=await GM.choose([{t:'（把那罐茶送給她）'},{t:'（下次再說）'}]); if(k!==0) return false;
    F.WZ_TEA_GIVEN=id; await GM.say(w,S.TEA_GIFT[id]); if(typeof SOCIAL!=='undefined') SOCIAL.adjust(id,{fam:1,comf:1}); return true; };

  // ================= 課堂回想（CLS.IN_CLASS）=================
  S.RECALL=[ {c:'ip_law',w:4,note:'NOTE_COPY_FAIR',f:'WZ_RC_IP',t:'你想起影印店牆上那張紙。'},
    {c:'insurance',w:5,note:'NOTE_INS_CLAUSE',f:'WZ_RC_INS',t:'你想起那封用橡皮筋綁著的信。'},
    {c:'labor_law',w:6,note:'NOTE_HOLIDAY_WAGE',f:'WZ_RC_LAB',t:'你想起早午餐店那個國定假日的班。'} ];
  S.recallOf=(G,it)=>{ if(!it||!it.c||it.exam) return null; return S.RECALL.find(r=>r.c===it.c.id&&it.week===r.w&&S.hasNote(G,r.note)&&!G.flags[r.f])||null; };
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=async(GM,it)=>{ const G=GM.G, r=S.recallOf(G,it); if(!r) return; G.flags[r.f]=G.day; await GM.say(null,r.t); const R=CLS.rec(G); R.prep[r.c]=(R.prep[r.c]||0)+1; };
    f.due=(G,it)=>!!S.recallOf(G,it); CLS.IN_CLASS.push(f); }

  // ================= 公園的「找貓」按鈕（STORY.populate）、既有事件多一句 =================
  S.addSearch=function(GM){ const E=GM&&GM.E; if(!E||!Array.isArray(E.interactables)||typeof WZ_PARK_LAYOUT==='undefined') return; const n=(WZ_PARK_LAYOUT.interact||[]).find(q=>q.kind==='notice'); if(!n) return;
    E.interactables.push({x:n.x+1.2,z:n.z,radius:1.2,label:'找貓',wzCat:true,get hidden(){ const G=GM.G; return !(G&&S.searchOn(G)); }}); };
  S.patch=function(){ if(typeof STORY_EVENTS==='undefined') return; const E=id=>STORY_EVENTS.find(e=>e.id===id);
    const zq=E('ev_ziqing_show'); if(zq&&!zq._wz){ zq._wz=true; const D=zq.dialogue; D.unshift({if:{flags:['WZ_ZQ_POSTER']},speaker:null,text:'萬才館門口貼著那張藍色的海報。藍色是對的。'});
      const line={if:{flags:['WZ_ZQ_POSTER']},speaker:'heroine_04',text:'海報的藍色，台下的人有看到。'};
      const a=D.findIndex(l=>l.text==='我看到你了。你拍得超大聲。很丟臉。……謝啦。'); if(a>=0) D.splice(a+1,0,line);
      const b=D.findIndex(l=>l.text==='你有來。'); if(b>=0) D.splice(b+1,0,Object.assign({},line)); }   /* BB_148 8b：開場一句、她下台後一句（拍手、沒按兩個版本；沒去的沒有）*/
    const sd=E('ev_sis_defense'); if(sd&&!sd._wz&&Array.isArray(sd.dialogue)){ sd._wz=true; const D=sd.dialogue, i=D.findIndex(l=>l.set&&l.set.SIS_DEFENSE==='there'); const line={if:{flags:['WZ_SIS_THESIS']},speaker:'heroine_05',text:'委員翻開以前，先摸了一下書背。……書背是你裝的。'}; if(i>=0) D.splice(i,0,line); }
    const am=E('ev_an_mother_map'); if(am&&!am._wz&&Array.isArray(am.dialogue)){ am._wz=true; am.dialogue.push({if:{flags:['AN_MOM_TEA']},speaker:'heroine_01',text:'我媽說，你泡的茶很穩。……她很少稱讚人。'}); } };   /* AA_166 第 5 節 WZ-T5 */
  S.patch();

  // ================= 每一格 =================
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!law(G)||typeof CALENDAR==='undefined'||busy(GM)) return false;
    if(G.zone==='wancai'&&S.lineAt(GM)) return true;
    if(G.zone==='wenzhou'&&S.parkTick(GM)) return true;
    return false; };
  if(typeof JOBS!=='undefined'){ JOBS.SHIFT_EV.push(S.shiftEv); JOBS.SHIFT_LINES.push(S.shiftLines); JOBS.AFTER_VISIT.push(S.afterVisit); JOBS.EXCUSE.push(S.excuse); for(const e of S.ENTER) JOBS.ENTER.push(e); }
  if(typeof STORY!=='undefined'){
    if(STORY.TICKS) STORY.TICKS.push(S.tick);
    if(STORY.PHONE_RULES) STORY.PHONE_RULES.push(S.phone);
    if(STORY.PRE_TALK) STORY.PRE_TALK.push(S.preTalk);
    if(STORY.populate&&!STORY._wzlPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId==='wenzhou') S.addSearch(GM); }catch(e){ console.warn('WZL.populate',e); } return r; }; STORY._wzlPop=true; }
    if(STORY.interact&&!STORY._wzlInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.wzCat&&GM&&GM.G) return S.search(GM); return o0.apply(this,arguments); }; STORY._wzlInteract=true; } }
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._wz){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); if(!r) await S.sisPre(GM); return r; },p0,{_wz:true}); }
  return S;
})();
if(typeof window!=='undefined') window.WZL=WZL;
