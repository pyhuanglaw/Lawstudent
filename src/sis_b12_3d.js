/* ===== 學姊第十二批：三種玩家總檢查，大一暑假到大四寒假補七場（AA_470，企劃線 5f54b6545；SIS-LEAD-1021、D111、USER_WANTS C25）：接線 =====
   台詞、事件在 src/data/sis_b12_events.js（照稿不改字）。這個檔：
   - 找她說話時先演（S.preTalk；包住 SISY23.preTalk，同 sis_b8／b9／b10；同一天只演一場她的說話前接演）：
     12-1 學生證：2026-07-06～07-31 平日 9:00～17:00 在總圖閱覽區（library）；認識她（met_sis）、熟悉以上（交往中也演）、不是前任、她在、你人不在國外。
          演完第 21 天 21:00 私訊兩則（不用回；SIS_CARD_DAY＝演的那一天）。
     12-5 法圖的午休：2028-03-01～03-24 平日 12:00～14:00 在法圖（lawlib）；認識她、熟悉以上（交往中也演）、不是前任、人在臺灣（三條路線都有：日本路線 3/25 才走）。
     12-7 空白的一月：2029-01-02～02-08 週一、二、四 19:00～21:30 在兩點半 Café；認識她、熟悉以上、沒在和她交往、不是前任、人在臺灣（朋友版）。
     錯過不補（窗口過了就不演）。
   - 家族群組（STORY.PHONE_RULES；在家族群組 family_law 的人都收得到，不看認不認識她——AA_470 5-2；只有選項、出遊、私訊要「認識她」，12-4、12-6a 的選項寫明所有人）：
     12-2 四則（2026-09-07、09-14、10-26、2027-03-08 21:00；不用回）；
     12-3 2027-01-12 21:00 三則（「我也在。」只給認識她、不是前任的）→ 1/13 19:00 出遊「公館的火鍋店（幫 Kevin 吃一份）」；沒回、沒有選項＝1/13 12:00 兩則；演完群組三則；SIS_HOTPOT_GO／SIS_HOTPOT_Y2；
     12-4 2027-09-13 21:00 五則（「我去。」／「這週不行。」所有人）→ 9/16（四）19:00 出遊「法圖・討論室（家族讀書會）」；9/16 21:40 兩則；SIS_FAMSTUDY_GO／SIS_FAM_STUDY；
          之後的週四（AA_470 12-4「LAWWW 看成本決定」）這一版不做：她週四照舊在 Café；
     12-6a 2028-06-03 13:00 五則（「學長恭喜！」所有人）；12-6b 2028-07-10 21:00 三則（認識她的才有選項：人在臺灣「我去。」／「這週不行。」→ 7/13 19:00 出遊；
          人在日本「我在日本。」）；SIS_FAMSTUDY_LAST_GO／SIS_FAM_STUDY_LAST、SIS_STUDY_ROOM。人在日本＝當地時間（STORY.tzOffset）。
   - 4-2 交往版「另外一本」：S.bookWithYou（termend_lines.js 學姊女朋友版大四上 lastByTerm 讀）；朋友版接在 12-7 裡。
   - 5-1 舊存檔：有 FAMILY_DINNER 記憶、去過家族聖誕（SIS_FAMXMAS_Y1，'missed' 不算）、或 ev_sis_family_dinner／ev_sis_results_dinner(_y1) 演過的，讀檔時補 met_sis、SIS_W1
     （game3d.js migrate 會叫 ROM.rec：包一層，同 multirel3d.js）。
   測試：node tests/aa470_sis_b12_unit.js */
'use strict';
const SISB12=(function(){
  const S={}, ID='heroine_05', L=typeof SISB12_LINES!=='undefined'?SISB12_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const tzH=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0);   /* 臺灣時間 → 手機的當地時間（人在日本 +1）*/
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);
  const contact=G=>S.dating(G)||typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  const wd=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:0;
  const inDays=(G,a,b)=>{ const x=D(a), y=D(b); return x!=null&&y!=null&&G.day>=x&&G.day<=y; };
  /* 家族群組的一則（k＝Kevin、s＝學姊、j＝家族的學妹；同 r3_3d.js 的 GK／GW／GJ）*/
  const WHO={k:{from:'kevin',name:'Kevin'},s:{from:ID,name:'溫學姊'},j:{from:'family_junior',name:'家族的學妹'}};
  const g=([w,t])=>Object.assign({th:'g:family_law',text:t},WHO[w]);
  const r=([w,t])=>Object.assign({text:t},WHO[w]);   /* 選項回覆（PHONE.answer 補 th）*/
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  /* 共用條件 */
  S.nameUp=G=>S.dating(G)||stageOk('FRIEND');   /* {稱呼}：朋友以上叫名字（AA_470 第 2 節）*/
  S.xmasWent=G=>{ const v=G&&G.flags&&G.flags.SIS_FAMXMAS_Y1; return !!v&&v!=='missed'; };   /* 去過家族聖誕（family_xmas3d.js S.hasPencil 同一個判斷）*/
  S.usDating=G=>route(G)==='US'&&S.dating(G);
  S.okFam=G=>law(G)&&!!G.flags.met_sis&&!S.isEx(G)&&(S.dating(G)||stageOk('FAMILIAR'))&&here(G)&&!abroad(G);   /* 12-1、12-5 */
  S.okFriend=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FAMILIAR')&&here(G)&&!abroad(G);   /* 12-7 */

  /* ---------------- 找她說話時先演（12-1、12-5、12-7）---------------- */
  const SIS_PRE=/^ev_sis_(adv_|three_conditions|lab_desk|seminar|topic|us_told|db_taught|ta_papers|econ_|old_notes|hot_water_back|jp_note|which_book|y3s2_rain|pg_q|borrowed_card|lawlib_kevin|blank_jan)/;
  const preToday=G=>{ const R=G.events&&G.events.last; if(!R) return false; return Object.keys(R).some(id=>SIS_PRE.test(id)&&R[id]===G.day); };   /* 同一天只演一場 */
  S.CARD={from:'2026-07-06',to:'2026-07-31'}; S.KEVIN={from:'2028-03-01',to:'2028-03-24'}; S.JAN={from:'2029-01-02',to:'2029-02-08'};
  S.cardDue=G=>!!G&&law(G)&&G.zone==='library'&&inDays(G,S.CARD.from,S.CARD.to)&&wd(G)>=1&&wd(G)<=5&&hh(G)>=9&&hh(G)<17&&!done(G,'ev_sis_borrowed_card')&&G.flags.SIS_CARD_DAY==null&&S.okFam(G);
  S.kevinDue=G=>!!G&&law(G)&&G.zone==='lawlib'&&inDays(G,S.KEVIN.from,S.KEVIN.to)&&wd(G)>=1&&wd(G)<=5&&hh(G)>=12&&hh(G)<14&&!done(G,'ev_sis_lawlib_kevin')&&S.okFam(G);
  S.janDue=G=>!!G&&law(G)&&G.zone==='cafe'&&inDays(G,S.JAN.from,S.JAN.to)&&[1,2,4].includes(wd(G))&&hh(G)>=19&&hh(G)<21.5&&!done(G,'ev_sis_blank_jan')&&S.okFriend(G);
  S.preTalkEv=function(G){ if(!G||!G.flags||preToday(G)) return null;
    if(S.cardDue(G)) return 'ev_sis_borrowed_card'; if(S.kevinDue(G)) return 'ev_sis_lawlib_kevin'; if(S.janDue(G)) return 'ev_sis_blank_jan'; return null; };
  S.preTalk=async function(GM){ const G=GM&&GM.G, id=S.preTalkEv(G); if(!id||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; const ev=evOf(id); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[id]=(R.done[id]|0)+1; R.last[id]=G.day;   /* 先記（同 SISB4.preTalk）：演到一半出錯也不會每次說話都重來 */
    if(id==='ev_sis_borrowed_card') G.flags.SIS_CARD_DAY=G.day;   /* 演完第 21 天 21:00 她私訊（S.cardBack）*/
    await EVENTS.runLines(ev.dialogue,ev); return true; };

  /* ---------------- 12-1 第 21 天 21:00 私訊 ---------------- */
  S.cardBack=function(G){ const F=G.flags, d0=F.SIS_CARD_DAY; if(d0==null||typeof d0!=='number') return; const d=d0+21, tag='sisb12_card_back';
    if(G.day>=d&&G.day<=d+2&&!sent(G,tag)&&contact(G)) PHONE.at(G,d,21,(L.cardBack||[]).map(dm),tag); };   /* 那一天一開始就排好（21:00 才送到；跳過時間的照原本的時間補）*/

  /* ---------------- 12-2 大二的家族群組 ---------------- */
  S.fam2=function(G){ if(!inGrp(G)) return; const A=L.fam2||[];
    for(let i=0;i<A.length;i++){ const d=D(A[i].day), tag='sisb12_fam2_'+i; if(d==null||G.day<d||G.day>d+2||sent(G,tag)) continue; PHONE.at(G,d,A[i].h,A[i].L.map(g),tag); } };

  /* ---------------- 12-3 大二寒假：幫 Kevin 吃一份 ---------------- */
  S.HOT={ask:'2027-01-12',day:'2027-01-13'};
  S.HOT_OUT={id:'sisb12_hotpot',ev:'ev_sis_hotpot_y2',h:19,late:0.25,place:'公館・火鍋店',title:'公館的火鍋店（幫 Kevin 吃一份）',travel:'走路 約 15 分鐘',travelH:0.25,hours:2,back:'回到住的地方。'};
  S.hotOk=G=>law(G)&&!!G.flags.met_sis&&!S.isEx(G);   /* 「我也在。」只給認識她、不是前任的（交往中也有；住家裡也算在臺北）*/
  S.hot=function(G){ const F=G.flags, a=D(S.HOT.ask), b=D(S.HOT.day), tag='sisb12_hot_ask'; if(a==null||b==null||G.day<a||G.day>b+1) return;
    if(!sent(G,tag)&&inGrp(G)&&G.day<=b&&now(G)<T(b,12)){ const M=(L.hotAsk||[]).map(g);
      if(S.hotOk(G)&&L.hotYes) M[M.length-1].ask={id:tag,until:T(b,12),opts:[{t:L.hotYes.t,set:{SIS_HOTPOT_GO:true},say:L.hotYes.say.map(r)}]};
      PHONE.at(G,a,21,M,tag); }
    if(F.SIS_HOTPOT_GO===true&&F.SIS_HOTPOT_Y2==null&&now(G)<T(b,S.HOT_OUT.h+S.HOT_OUT.late)) plan(G,Object.assign({},S.HOT_OUT,{day:b}));
    if(sent(G,tag)&&F.SIS_HOTPOT_GO!==true&&now(G)>=T(b,12)&&!sent(G,'sisb12_hot_none')) PHONE.at(G,b,12,(L.hotNone||[]).map(g),'sisb12_hot_none'); };   /* 不回、或沒有選項的玩家 */
  S.hotAfter=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!inGrp(G)||sent(G,'sisb12_hot_after')) return; PHONE.at(G,G.day,(+G.hour||0)+0.05,(L.hotAfter||[]).map(g),'sisb12_hot_after'); };   /* 演完（火鍋的 afterOuting）*/

  /* ---------------- 12-4 大三上：家族讀書會的第一次 ---------------- */
  S.STUDY={ask:'2027-09-13',day:'2027-09-16'};
  S.STUDY_OUT={id:'sisb12_famstudy',ev:'ev_sis_fam_study',h:19,late:0.25,place:'法圖・討論室',title:'法圖・討論室（家族讀書會）',travel:'走路 約 10 分鐘',travelH:1/6,hours:2.5,back:'回到住的地方。'};
  S.study=function(G){ const F=G.flags, a=D(S.STUDY.ask), d=D(S.STUDY.day), tag='sisb12_study_ask'; if(a==null||d==null||G.day<a||G.day>d+2) return;
    if(!sent(G,tag)&&inGrp(G)&&G.day<=d&&now(G)<T(d,19)){ const M=(L.studyAsk||[]).map(g);
      M[M.length-1].ask={id:tag,until:T(d,19),opts:(L.studyOpts||[]).map(o=>({t:o.t,set:{SIS_FAMSTUDY_GO:o.k}}))}; PHONE.at(G,a,21,M,tag); }   /* 選項（所有人）*/
    if(F.SIS_FAMSTUDY_GO===true&&F.SIS_FAM_STUDY==null&&now(G)<T(d,S.STUDY_OUT.h+S.STUDY_OUT.late)) plan(G,Object.assign({},S.STUDY_OUT,{day:d}));
    if(inGrp(G)&&G.day>=d&&now(G)>=T(d,21+40/60)&&!sent(G,'sisb12_study_after')) PHONE.at(G,d,21+40/60,(L.studyAfter||[]).map(g),'sisb12_study_after'); };   /* 9/16 21:40 群組 */

  /* ---------------- 12-6 Kevin 畢業、讀書會最後一次 ---------------- */
  S.GRAD='2028-06-03'; S.LAST={ask:'2028-07-10',day:'2028-07-13'};
  S.LAST_OUT={id:'sisb12_famstudy_last',ev:'ev_sis_fam_study_last',h:19,late:0.25,place:'法圖・討論室',title:'法圖・討論室（讀書會最後一次）',travel:'走路 約 10 分鐘',travelH:1/6,hours:2.5,back:'回到住的地方。'};
  S.inJapan=(G,d)=>route(G)==='JP'&&typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d==null?G.day:d}));
  S.grad=function(G){ const d=D(S.GRAD), tag='sisb12_grad'; if(d==null||G.day<d||G.day>d+2||sent(G,tag)||!inGrp(G)) return; const M=(L.gradPost||[]).map(g);
    if(L.gradOpt) M[M.length-1].ask={id:tag,until:T(d+2,0),opts:[{t:L.gradOpt.t,say:L.gradOpt.say.map(r)}]};   /* 選項（所有人）*/
    PHONE.at(G,d,tzH(G,d,13),M,tag); };
  S.last=function(G){ const F=G.flags, a=D(S.LAST.ask), d=D(S.LAST.day), tag='sisb12_last_ask'; if(a==null||d==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&inGrp(G)&&G.day<=d&&now(G)<T(d,19)){ const M=(L.lastAsk||[]).map(g);
      if(law(G)&&G.flags.met_sis){ M[M.length-1].ask=S.inJapan(G,a)?{id:tag,until:T(d,19),opts:[{t:L.lastJp.t,say:L.lastJp.say.map(r)}]}:{id:tag,until:T(d,19),opts:(L.lastOpts||[]).map(o=>({t:o.t,set:{SIS_FAMSTUDY_LAST_GO:o.k}}))}; }   /* 選項要「認識她」（AA_470 5-2）*/
      PHONE.at(G,a,tzH(G,a,21),M,tag); }
    if(F.SIS_FAMSTUDY_LAST_GO===true&&F.SIS_FAM_STUDY_LAST==null&&!abroad(G)&&now(G)<T(d,S.LAST_OUT.h+S.LAST_OUT.late)) plan(G,Object.assign({},S.LAST_OUT,{day:d})); };

  /* ---------------- 4-2 交往版：「另外一本，放你那邊。……回來跟你拿。」聽過的（SIS_BOOK_WITH_YOU；舊存檔：她那時候已經在交往）---------------- */
  S.bookWithYou=G=>{ const F=(G&&G.flags)||{}; if(F.SIS_BOOK!=='law'&&F.SIS_BOOK!=='novel') return false; if(!S.dating(G)) return false;
    if(F.SIS_BOOK_WITH_YOU!=null) return F.SIS_BOOK_WITH_YOU===true;
    const w=G.events&&G.events.last&&G.events.last.ev_sis_which_book, R=F.romance&&F.romance[ID]; return w!=null&&!!R&&R.sinceDay!=null&&R.sinceDay<=w; };

  /* ---------------- 5-1 舊存檔補 met_sis、SIS_W1 ---------------- */
  S.metFix=function(s){ const F=s&&s.flags; if(!F||typeof F!=='object'||(F.met_sis&&F.SIS_W1)||(s.stage||'law')!=='law') return false;
    const M=s.social&&s.social.mem&&s.social.mem[ID], dn=(s.events&&s.events.done)||{}, x=F.SIS_FAMXMAS_Y1;
    const went=(Array.isArray(M)&&M.some(m=>m&&m.tag==='FAMILY_DINNER'))||(!!x&&x!=='missed')||!!dn.ev_sis_family_dinner||!!dn.ev_sis_results_dinner||!!dn.ev_sis_results_dinner_y1;
    if(!went) return false; F.met_sis=true; F.SIS_W1=true; return true; };

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.cardBack,S.fam2,S.hot,S.study,S.grad,S.last]){ try{ f(G); }catch(e){ console.warn('SISB12 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb12){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); },p0,{_sisb12:true}); }
  if(typeof ROM!=='undefined'&&ROM.rec&&!ROM._sisb12){ const r0=ROM.rec; ROM.rec=function(G){ const x=r0.apply(this,arguments); try{ S.metFix(G); }catch(e){ console.warn('SISB12 metFix',e); } return x; }; ROM._sisb12=true; }   /* 讀檔時補（game3d.js migrate 叫 ROM.rec）*/
  return S;
})();
