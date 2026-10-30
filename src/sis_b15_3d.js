/* ===== 學姊第十五批：學校裡的平常日子（AA_518，企劃線 973dd1b74；SIS-B15-1028、SIS-LEAD-1021、D111、USER_WANTS C25）：接線 =====
   台詞、事件在 src/data/sis_b15_events.js（照稿不改字）。第 4 節十五處改在各自的檔（寫在 sis_b15_events.js 開頭）。這個檔：
   - 第 1 節 寒暑假補九場：3D 走到她在的地方（EVENTS 的 auto＋near 她；src/data/sis_b15_events.js），認識以上（met_sis）、那一天、那個時段、一次；交往中多那一句。
       她那幾天的作息（characters.js）：1-1、1-4 總圖平日 9～17；1-2 週三 19～21 法圖；1-3 2026-08-31 08:45～09:00 總圖門口的台階（新加那一天）；
       1-5、1-6、1-7 週三 19～21 法圖——交往中週三晚上她本來在研究室（AA_512 第 2 節第 5 點，SISB13.labEve），這三天讓給法圖（包一層 SISB13.labYield：S.wedYield）；
       1-8 2028-01-19 法圖討論室 A（新加那一天；要走進討論室）；1-9 2028-06-28 霖澤館 5F 研究室（新加那一天，4F 刷卡門晚上那一段照 src/lab5f3d.js 開）。
       1-9「我幫妳。」記 SIS15_BOOKS3；房間多一個物件（STORY.ROOM_EXTRA）。
   - 第 2 節 家族讀書會：大三那一年（2027-09-16～2028-07-13）週四 19:00～21:00 她在法圖討論室 A（characters.js；21:00～22:00 照舊 Café）。
       那天 Café 還有她沒演的戲（大三下 5/18、5/25「帶哪一本」sis_b9、日本路線 3/23 sis_jp）：那一晚照舊在 Café（S.thuYield），不縮別人的戲。
       3D 走進討論室：她說一句（三句輪流、一天一次、認識以上；ev_sis15_board）。
       四次有演出來的（10/21、12/9、3/16、5/11）：前一天 21:00 家族群組 Kevin 揪，回「去。」才演（出遊 19:00，2 小時）；沒在家族群組、和她 FAMILIAR 以上的：她私訊「明天讀書會。」。
       D（沒見過她）也能來：演完記 met_sis（同 sis_b13 13-2）。演完記 SIS15_STUDY_n。那一天人在國外（日本路線 3/25 以後、寒暑假出國）＝訊息照收、沒有「去。」。
       2-3：3/16 21:00 家族群組 Kevin 一則（所有群組成員）。
   - 第 3 節 說了沒發生的十件：
       1 6/1（四）21:00 Kevin 揪 → 回「去。」→ 6/3（六）10:30 霖澤館門口（出遊；D 也能來）、記 SIS15_KV_GRAD；國考那天 2028-08-26（六）臺灣 08:00 家族群組三則（sup497 沒有一試的日期＝用稿的日子）；
       2 2026-11-16 起第一次找她說話（SISY23.preTalk 包一層）：11/6 午餐選「都還好。」（sis_b8_events.js 記 SIS15_ALLOK）＝「期中考完了。……」一次；
       3 2028-03-15 21:30 家族群組三則（所有群組成員）；
       4 3/15 電話選「我現在過去。」（sis_y2y3_events.js 記 SIS15_LUNCH_GO）＝3/16（四）12:20 研究室（出遊 1 小時）、記 SIS15_LUNCH_0316；那時已經不在交往＝取消；
       5 臺灣路線交往中 9/10、11/12（日）20:00 起當天：她的私訊對話框多一個「（傳一張照片給她）」（PHONE.GROUP_ACTS 放在一對一的對話串，game3d.js），三選一、她照 MSG 的時間回；記 SIS15_PHOTO_9／_11；
       6 SIS_Y3S2_RAIN 'buy'（「下次換我帶兩把。」）以後第一個下雨天 17:00 總圖門口（3D，一次）；
       7 7/29 法圖「……下次我帶兩件。」（VF_Y2_0729 'find'）以後第一次週三晚上在法圖（3D，一次；交往中；那之前的週三晚上她讓給法圖：S.wedYield）；
       8 交往版「……下次你請。」（SIS15_YOUPAY）＝大二上女朋友版期末飯的最後兩行（termend_lines.js lastByTerm.Y2S1）；
       9 2026-06-19（五）22:00 家族群組 Kevin 兩則（照片的「你」不在字上：旁白不改）；
       10 臺灣路線交往中 7/26（三）21:10 她私訊（群組按過、期末聚餐說過要送的不送）：「好。」＝SIS_RIDE_ASK 'yes'（y34b3d.js 送機那一條）、出發排 8/2 07:00 學姊家巷口；「我那天沒辦法。」＝她一句。
   測試：node tests/aa518_sis_b15_unit.js */
'use strict';
const SISB15=(function(){
  const S={}, ID='heroine_05', L=typeof SISB15_LINES!=='undefined'?SISB15_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>(((+G.hour||0)%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const tzH=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0);   /* 臺灣時間 → 手機的當地時間（人在日本 +1、美國 −12／−13）*/
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);
  const contact=G=>S.dating(G)||typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const last=(G,id)=>{ const R=G.events&&G.events.last; return R&&R[id]!=null?R[id]:null; };
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  const wd=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:0;   /* 1＝週一 … 7＝週日 */
  const inDays=(G,a,b)=>{ const x=D(a), y=D(b); return x!=null&&y!=null&&G.day>=x&&G.day<=y; };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  /* 家族群組的一則（k＝Kevin、s＝學姊；同 sis_b12／b13）、她的私訊 */
  const WHO={k:{from:'kevin',name:'Kevin'},s:{from:ID,name:'溫學姊'}};
  const g=([w,t])=>Object.assign({th:'g:family_law',text:t},WHO[w]);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  S.twRoute=G=>route(G)!=='US'&&route(G)!=='JP';   /* 臺灣路線（同 sis_b14 S.callOk 的寫法：沒有路線的舊存檔算臺灣）*/
  /* 那一天人在國外（交換的路線：日本 3/25 以後、美國 8/2 以後；寒暑假出國：VAC.abroadOn）*/
  S.awayOn=(G,d)=>(typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d})))||(typeof VAC!=='undefined'&&!!VAC.abroadOn&&!!VAC.abroadOn(G,d));

  /* ---------------- 第 1 節 寒暑假補九場（認識以上；那一天、一次）---------------- */
  S.Y1={ev_sis15_flask:'2026-01-14',ev_sis15_novel:'2026-03-04',ev_sis15_swim:'2026-08-31',ev_sis15_chishang:'2027-01-27',ev_sis15_move:'2027-02-24',
    ev_sis15_ch1:'2027-07-07',ev_sis15_drill:'2027-08-25',ev_sis15_interview:'2028-01-19',ev_sis15_lab_clear:'2028-06-28'};
  /* 法圖討論室 A（1-8、第 2 節的白板）：玩家走進那一間（北側那一排房間：frontZ 以北、那一間的 x 範圍、一樓）*/
  S.DISC='discA';
  S.inDisc=GM=>{ const E=GM&&GM.E, P=E&&E.player&&E.player.obj&&E.player.obj.position, LL=typeof LAWLIB_LAYOUT!=='undefined'?LAWLIB_LAYOUT:null; if(!P) return false; if(!LL||!Array.isArray(LL.rooms)) return true;
    const r=LL.rooms.find(q=>q.id===S.DISC); if(!r) return true; return (E.player.lv|0)===0&&P.x>=r.x0&&P.x<=r.x1&&P.z<LL.frontZ; };
  S.y1Ok=(G,id,GM)=>{ const k=S.Y1[id]; if(!k||!law(G)||!G.flags.met_sis||G.day!==D(k)||!here(G)||abroad(G)) return false; if(id==='ev_sis15_interview'&&!S.inDisc(GM)) return false; return true; };
  /* 交往中週三晚上她在研究室（AA_512 第 2 節第 5 點）：1-5、1-6、1-7 那一天、3-7 外套還沒給的週三，她照舊在法圖（包一層 SISB13.labYield；1-8、1-9 有自己那一天的作息）*/
  S.WED=['2027-02-24','2027-07-07','2027-08-25'];
  S.wedYield=G=>{ if(!G||!G.flags||wd(G)!==3) return false; if(S.WED.some(k=>D(k)===G.day)) return true; return S.coatPending(G); };

  /* ---------------- 第 2 節 家族讀書會 ---------------- */
  S.STUDY_FROM='2027-09-16'; S.STUDY_TO='2028-07-13';
  /* 那個週四 Café 還有她沒演的戲（演過的那一晚也留在 Café，不會演完就不見）：照舊在 Café，不在討論室 */
  S.thuYield=G=>{ if(!G||!G.flags) return false; const F=G.flags;
    if(typeof SISB9!=='undefined'&&Array.isArray(SISB9.BOOK_DAYS)&&SISB9.BOOK_DAYS.some(k=>D(k)===G.day)&&((F.SIS_BOOK==null&&!done(G,'ev_sis_which_book'))||last(G,'ev_sis_which_book')===G.day)) return true;   /* 大三下 5/18、5/25「帶哪一本」（sis_b9_3d.js）*/
    if(typeof SISJP!=='undefined'&&SISJP.DAYS&&D(SISJP.DAYS.note)===G.day&&((F.SIS_JP_NOTE==null&&!!SISJP.ok&&SISJP.ok(G))||last(G,'ev_sis_jp_note')===G.day)) return true;   /* 日本路線 3/23（sis_jp3d.js）*/
    return false; };
  S.boardOk=(G,GM)=>law(G)&&!!G.flags.met_sis&&inDays(G,S.STUDY_FROM,S.STUDY_TO)&&!abroad(G)&&S.inDisc(GM);
  S.boardIx=G=>(((G&&G.flags&&G.flags.SIS15_BOARD_N)|0)%3+3)%3;
  S.STUDY=[{n:1,day:'2027-10-21'},{n:2,day:'2027-12-09'},{n:3,day:'2028-03-16'},{n:4,day:'2028-05-11'}];
  S.studyOut=n=>({id:'sisb15_study_'+n,ev:'ev_sis15_study_'+n,h:19,late:0.25,place:'法圖・討論室',title:'法圖・討論室（家族讀書會）',travel:'走路 約 10 分鐘',travelH:1/6,hours:2,back:'回到住的地方。'});
  S.study=function(G){ const F=G.flags; for(const x of S.STUDY){ const d=D(x.day); if(d==null||G.day<d-1||G.day>d+1) continue; const tag='sisb15_study'+x.n, go='SIS15_STUDY'+x.n+'_GO';
      if(!sent(G,tag)&&now(G)<T(d,19)){ const hint=typeof SISB12!=='undefined'&&!!SISB12.plgTerm&&SISB12.plgTerm(G,d)&&typeof SISB12_LINES!=='undefined'&&SISB12_LINES.studyHint;   /* 以安的公法讀書會（週四 20:00）同一晚：照 AA_490 第 3 節同一個讀書會的做法——照撞期處理、「去。」帶小字（那一學期去過公法讀書會的）*/
        const ask=S.awayOn(G,d)?null:{id:tag,until:T(d,19),opts:[Object.assign({t:L.go,set:{[go]:true}},hint?{hint}:{})]};   /* 那天人在國外＝訊息照收、沒有「去。」*/
        if(inGrp(G)){ const m=g(['k',L.studyAsk]); if(ask) m.ask=ask; PHONE.at(G,d-1,tzH(G,d-1,21),[m],tag); }   /* 家族群組：所有人（D 也收得到）*/
        else if(G.flags.met_sis&&(S.dating(G)||stageOk('FAMILIAR'))&&contact(G)){ const m=dm(L.studyDm); if(ask) m.ask=ask; PHONE.at(G,d-1,tzH(G,d-1,21),[m],tag); } }   /* 沒在家族群組、FAMILIAR 以上：她私訊 */
      if(F[go]===true&&F['SIS15_STUDY_'+x.n]==null&&!S.awayOn(G,d)&&now(G)<T(d,19.25)) plan(G,Object.assign(S.studyOut(x.n),{day:d})); } };
  S.LATE='2028-03-16';
  S.late=function(G){ const d=D(S.LATE); if(d==null||G.day<d||G.day>d+1||!inGrp(G)) return; PHONE.at(G,d,tzH(G,d,21),[g(['k',L.late])],'sisb15_late'); };   /* 2-3 Kevin 九點（群組）*/

  /* ---------------- 第 3 節第 1 點 Kevin 畢業、國考那天 ---------------- */
  S.GRAD={ask:'2028-06-01',day:'2028-06-03'};
  S.GRAD_OUT={id:'sisb15_kv_grad',ev:'ev_sis15_kv_grad',h:10.5,late:0.25,place:'法律系館A門口',title:'法律系館A門口（Kevin 的畢業照）',travel:'走路 約 10 分鐘',travelH:1/6,hours:0.5,back:'回到住的地方。'};   /* 拍照多久稿沒寫：算 30 分鐘 */
  S.grad=function(G){ const F=G.flags, a=D(S.GRAD.ask), d=D(S.GRAD.day), tag='sisb15_kv_grad_ask'; if(a==null||d==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&inGrp(G)&&now(G)<T(d,S.GRAD_OUT.h)){ const m=g(['k',L.gradAsk]); if(!S.awayOn(G,d)) m.ask={id:tag,until:T(d,S.GRAD_OUT.h),opts:[{t:L.go,set:{SIS15_KV_GRAD_GO:true}}]}; PHONE.at(G,a,tzH(G,a,21),[m],tag); }
    if(F.SIS15_KV_GRAD_GO===true&&F.SIS15_KV_GRAD==null&&!S.awayOn(G,d)&&now(G)<T(d,S.GRAD_OUT.h+S.GRAD_OUT.late)) plan(G,Object.assign({},S.GRAD_OUT,{day:d})); };
  S.BAR='2028-08-26';   /* sup497 沒有 Kevin 一試的日期（只有 9/22 放榜）：用稿的 2028-08-26（六）*/
  S.bar=function(G){ const d=D(S.BAR); if(d==null||G.day<d-1||G.day>d+1||!inGrp(G)) return; PHONE.at(G,d,tzH(G,d,8),(L.barCheer||[]).map(g),'sisb15_bar_cheer'); };

  /* ---------------- 第 3 節第 2 點 期中考完再說一次（找她說話前接演；同一天只演一場她的說話前接演）---------------- */
  S.MID='2026-11-16';
  const SIS_PRE=/^ev_sis_(adv_|three_conditions|lab_desk|seminar|topic|us_told|db_taught|ta_papers|econ_|old_notes|hot_water_back|jp_note|which_book|y3s2_rain|pg_q|borrowed_card|lawlib_kevin|blank_jan)|^ev_sis15_midterm$/;
  const preToday=G=>{ const R=G.events&&G.events.last; if(!R) return false; return Object.keys(R).some(id=>SIS_PRE.test(id)&&R[id]===G.day); };
  S.midDue=G=>!!G&&law(G)&&!!G.flags&&G.flags.SIS15_ALLOK===true&&D(S.MID)!=null&&G.day>=D(S.MID)&&!done(G,'ev_sis15_midterm')&&!preToday(G);
  S.preTalk=async function(GM){ const G=GM&&GM.G; if(!S.midDue(G)||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; const ev=evOf('ev_sis15_midterm'); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[ev.id]=(R.done[ev.id]|0)+1; R.last[ev.id]=G.day;   /* 先記（同 SISB12.preTalk）：演到一半出錯也不會每次說話都重來 */
    await EVENTS.runLines(ev.dialogue,ev); return true; };

  /* ---------------- 第 3 節第 3 點 2028-03-15 21:30 家族群組 ---------------- */
  S.US_UP='2028-03-15';
  S.usUp=function(G){ const d=D(S.US_UP); if(d==null||G.day<d-1||G.day>d+1||!inGrp(G)) return; PHONE.at(G,d,tzH(G,d,21.5),(L.usUp||[]).map(g),'sisb15_us_up'); };

  /* ---------------- 第 3 節第 4 點 3/16 12:20 研究室的兩個便當 ---------------- */
  S.LUNCH='2028-03-16';
  S.LUNCH_OUT={id:'sisb15_lunch0316',ev:'ev_sis15_lunch0316',h:12+20/60,late:0.25,place:'法律系館A・研究室',title:'法律系館A・研究室（中午）',travel:'走路 約 10 分鐘',travelH:1/6,hours:1,back:'回到住的地方。'};
  S.lunch=function(G){ const F=G.flags, d=D(S.LUNCH); if(d==null||F.SIS15_LUNCH_GO!==true||F.SIS15_LUNCH_0316!=null||G.day>d) return; const q=outGet(G,S.LUNCH_OUT.id);
    if(!S.dating(G)){ if(q&&q.state==='planned') q.state='cancelled'; return; }   /* 3/16 已經不在交往＝不演 */
    if(now(G)<T(d,S.LUNCH_OUT.h+S.LUNCH_OUT.late)) plan(G,Object.assign({},S.LUNCH_OUT,{day:d})); };

  /* ---------------- 第 3 節第 5 點 傳一張照片給她（臺灣路線交往中；她人在美國）---------------- */
  S.PHOTO=[{day:'2028-09-10',f:'SIS15_PHOTO_9'},{day:'2028-11-12',f:'SIS15_PHOTO_11'}];
  S.photoNow=G=>{ if(!G||!G.flags||!law(G)||!S.twRoute(G)||!S.dating(G)||!contact(G)) return null;
    for(const x of S.PHOTO){ if(D(x.day)===G.day&&hh(G)>=20&&G.flags[x.f]==null) return x; } return null; };   /* 20:00 起當天；一次一張 */
  S.photoReply=(x,p)=>x&&x.f==='SIS15_PHOTO_11'&&Array.isArray(p.r11)?p.r11.join(''):p.r;   /* 11/12 那一次：椰林大道換後半句 */
  S.photoSend=async function(GM){ const G=GM&&GM.G, x=S.photoNow(G); if(!x||typeof PHONE==='undefined') return false; const P=L.photos||[]; if(!P.length) return false;
    let k=GM&&GM.choose?await GM.choose(P.map(p=>({t:p.t}))):0; if(!(k>=0&&k<P.length)) k=0; const p=P[k];
    if(G.flags[x.f]!=null) return false; G.flags[x.f]=p.k;
    PHONE.post(G,{th:'p:'+ID,from:'player',who:null,text:p.t});
    const at=typeof MSG!=='undefined'&&MSG.replyAt?MSG.replyAt(G,ID):{day:G.day,h:(+G.hour||0)+5/60};   /* 她照 MSG 的時間回（同 sis_b9 的楓葉書籤）*/
    PHONE.at(G,at.day,at.h,[dm(S.photoReply(x,p))],'sisb15_photo_'+x.f.slice(-2).replace('_',''));   /* 不加數值（稿沒寫；同 sis_b9 楓葉書籤的回覆）*/
    return true; };

  /* ---------------- 第 3 節第 6、7 點 兩把傘、兩件外套 ---------------- */
  S.umbrellaOk=G=>{ const F=G.flags; if(!law(G)||!F.met_sis||S.isEx(G)||F.SIS_Y3S2_RAIN!=='buy'||!here(G)||abroad(G)) return false; const rd=last(G,'ev_sis_y3s2_rain'); return rd==null||G.day>rd; };
  S.coatOk=G=>{ const F=G.flags; if(!law(G)||!S.dating(G)||F.VF_Y2_0729!=='find'||!done(G,'ev_vf_y2_0729')||!here(G)||abroad(G)) return false; const d=last(G,'ev_vf_y2_0729'); return d==null||G.day>d; };
  S.coatPending=G=>!!G&&!!G.flags&&S.coatOk(G)&&(!done(G,'ev_sis15_coat')||last(G,'ev_sis15_coat')===G.day);   /* 還沒給、或今天才給（那一晚留在法圖）*/

  /* ---------------- 第 3 節第 10 點 7/26 21:10 她私訊（臺灣路線交往中）---------------- */
  S.SEND={ask:'2028-07-26',go:'2028-08-02',h:21+10/60};
  S.SEND_OUT={id:'y4_sis_airport',ev:'ev_sis_airport',h:7,late:0.5,place:'學姊家巷口',title:'載學姊去機場',travel:'',travelH:0,hours:3,alarm:true,back:'回到台北。'};   /* 同按鈕那一條（y34b3d.js），出發照她說的「七點，我家巷口」*/
  S.sendoff=function(G){ const F=G.flags, a=D(S.SEND.ask), go=D(S.SEND.go), tag='sisb15_sendoff'; if(a==null||go==null||G.day<a||G.day>=go||sent(G,tag)||now(G)<T(a,S.SEND.h)) return;
    if(!S.twRoute(G)||!S.dating(G)||F.SIS_RIDE_ASK!=null||F.HOOK_SIS_SENDOFF!=null||!contact(G)) return;   /* 已經在群組按了（SIS_RIDE_ASK）、期末聚餐說過要送（21:05 她已經私訊）：不送 */
    const m=dm(L.sendoff); m.ask={id:tag,until:T(go,0),opts:[{t:L.sendoffYes,set:{SIS_RIDE_ASK:'yes',SIS15_SENDOFF:'yes'},sisb15Send:true},{t:L.sendoffNo,set:{SIS15_SENDOFF:'no'},say:[{from:ID,text:L.sendoffNoRep}]}]};
    PHONE.at(G,a,S.SEND.h,[m],tag); };
  S.onAnswer=function(G,m,o){ if(!m||!m.ask||m.ask.id!=='sisb15_sendoff'||!o||!o.sisb15Send||!G||!G.flags) return; const go=D(S.SEND.go); if(go==null||now(G)>=T(go,S.SEND_OUT.h)) return;
    plan(G,Object.assign({},S.SEND_OUT,{day:go})); };

  /* ---------------- 第 3 節第 9 點 2026-06-19 22:00 火鍋的照片 ---------------- */
  S.HOTPOT='2026-06-19';
  S.hotpot=function(G){ const d=D(S.HOTPOT); if(d==null||G.day<d-1||G.day>d+1||!inGrp(G)) return; PHONE.at(G,d,22,(L.hotpot||[]).map(t=>g(['k',t])),'sisb15_hotpot'); };

  /* ---------------- 第 4 節第 1 點：聽過她要去美國交換（大二下閒聊階梯 S4-Lx、大三上 S5-L1）---------------- */
  S.heardS4Lx=G=>{ const St=typeof LADDER!=='undefined'&&LADDER.byTerm&&LADDER.byTerm.Y2S2&&LADDER.byTerm.Y2S2[ID]&&LADDER.byTerm.Y2S2[ID].steps, i=Array.isArray(St)?St.findIndex(s=>s&&s.id==='S4-Lx'):-1, P=G&&G.social&&G.social.ladder;
    return i>=0&&!!P&&(P[ID+'@Y2S2']|0)>i; };   /* 階梯的進度＝G.social.ladder['heroine_05@Y2S2']（同 sis_y2y3_events.js heardUS 的那一段）*/
  S.heardUS=G=>S.heardS4Lx(G)||(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(ID,'SIS5_EXCHANGE_APP'));   /* S5-L1「我在寫交換的申請。」記 SIS5_EXCHANGE_APP */

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.study,S.late,S.grad,S.bar,S.usUp,S.lunch,S.sendoff,S.hotpot]){ try{ f(G); }catch(e){ console.warn('SISB15 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof PHONE!=='undefined'){ if(Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._sisb15){ PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k)); PHONE.ON_ANSWER._sisb15=true; }
    PHONE.GROUP_ACTS=PHONE.GROUP_ACTS||[]; if(!PHONE.GROUP_ACTS.some(a=>a.id==='sisb15_photo')) PHONE.GROUP_ACTS.push({id:'sisb15_photo',th:'p:'+ID,label:L.photoOpt||'（傳一張照片給她）',show:G=>!!S.photoNow(G),run:GM=>S.photoSend(GM)}); }   /* 她的私訊對話框多一個選項（game3d.js threadHTML：一對一的對話串也讀 GROUP_ACTS）*/
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb15){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); },p0,{_sisb15:true}); }
  if(typeof SISB13!=='undefined'&&typeof SISB13.labYield==='function'&&!SISB13._sisb15){ const y0=SISB13.labYield;
    SISB13.labYield=function(G){ return !!y0.apply(this,arguments)||S.wedYield(G); }; SISB13._sisb15=true; }   /* SISB13.labEve 每次都讀 S.labYield：交往中那幾個週三晚上她在法圖 */
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lr)=>{ if(G&&G.flags&&G.flags.SIS15_BOOKS3&&Array.isArray(L.books)) Lr.push(L.books.slice()); });   /* 1-9：學姊的三本書 */
  return S;
})();
