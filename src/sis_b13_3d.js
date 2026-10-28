/* ===== 學姊第十三批：她自己的事當面演、八段空白、說了沒發生九件（AA_512，企劃線 c444f0757；SIS-B13-1028、SIS-LEAD-1021、D111、USER_WANTS C25）：接線 =====
   台詞、事件在 src/data/sis_b13_events.js（照稿不改字）。這個檔：
   - 家族群組（STORY.PHONE_RULES；在家族群組 family_law 的人都收得到，回「去。」才演——同 AA_497 5-2 的做法）：
     13-2 2027-05-06（四）21:00 三則 →「去。」→ 5/9（日）12:00 出遊「學姊的新家」；有 SIS4_CURRY（閒聊 S4-L3）的，21:05 學姊私訊「你說過要來吃。」（時間稿沒寫，LAWWW 排）；
     13-7 2028-12-26（二）21:00 兩則 →「去。」→ 12/28（四）18:30 出遊「118 巷・定食店」。
   - 3D 位置觸發（src/data/sis_b13_events.js 的 trigger:'auto'）：13-3 霖澤館門口（2027-12-06～07 17:00～18:00）、13-4 公館她們那桌（2028-06-02 18:30～20:30，走近她）、
     13-6 美國社區（2028-10-08～10-20 21:00～22:00，挽回中）、13-8 新體育館門口（2029-05-07～10 週一～四 08:00～08:40）。條件在下面 walkOk／cakeOk／laundryOk／poolOk。
   - 13-5 日本路線的生日：玩家 6/2 傳「生日快樂」（MSG-2，y34b3d.js 的朋友版回「謝謝。研究室的人買了一個小蛋糕。」）＝那一句先不回，
     臺灣 21:00（日本 22:00）她打視訊來（出遊「接起來」）；沒接、先不接＝照現有那一句。22:00 以後才傳的照舊。
   - 13-6 挽回中的短招呼：三句放進 SMALLTALK（美國、挽回中、各一次、照順序先說）。
   - 第 2 節：1 佳穎 3/8 私訊多一個選項（src/sup497_3d.js kvPhone 問 S.yzOpts；之後才拿到筆記、那則還沒回的也補上）→ 隔天 21:00 學姊兩則；
     3 修正本 2029-07-15 21:00 → 7/20 18:30 公館；4 慶祝（sis_y2y3_events.js）；5 研究室的晚上（characters.js 作息 S.labEve、lab5f3d.js 晚上開門、ev_sis13_lab_eve 一次）；
     6 第四十天（美國路線 9/11 22:00 私訊；臺灣、日本路線 r2y4b_events.js 那一週的視訊開頭 S.day40Video）；7 報告完了（彩排後的下一個週三 21:00）；
     8 二月那一頁（2029-01-31 21:00 → 2/1 15:00 Café）；9 每週視訊 g3、g2 的下一次開頭（r2y4b_events.js，S.g3Due／S.g2Due）。
   - 第 5 節 伴手禮：2029-01-03 21:00 約（回了才演，回覆鍵開到 1/6 10:00）→ 1/6 11:30 出遊「家裡的中飯」→ 當晚 21:00 她、1/7 08:00 媽媽。
   - 2D 背景：學姊的新家（沒有圖，先用公寓室內 tutor_home）、C 棟的洗衣間（沒有圖＝深色底＋地點字幕）。
   測試：node tests/aa512_sis_b13_unit.js */
'use strict';
const SISB13=(function(){
  const S={}, ID='heroine_05', L=typeof SISB13_LINES!=='undefined'?SISB13_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  S.route=route;
  const tzH=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0);   /* 臺灣時間 → 手機的當地時間（人在日本 +1、美國 −12／−13）*/
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const friendUp=G=>S.dating(G)||stageOk('FRIEND');   /* 朋友以上（交往中也算）*/
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);
  const contact=G=>S.dating(G)||typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  const wd=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:0;   /* 1＝週一 … 7＝週日 */
  const inDays=(G,a,b)=>{ const x=D(a), y=D(b); return x!=null&&y!=null&&G.day>=x&&G.day<=y; };
  const inUS=G=>typeof USL!=='undefined'&&!!USL.here&&USL.here(G);   /* 美國路線、人在美國（抵達以後、回來以前）*/
  /* 家族群組的一則（k＝Kevin、s＝學姊；同 sis_b12_3d.js）*/
  const WHO={k:{from:'kevin',name:'Kevin'},s:{from:ID,name:'溫學姊'}};
  const g=([w,t])=>Object.assign({th:'g:family_law',text:t},WHO[w]);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const reply=o=>({t:o.t,say:[{from:ID,text:o.r}]});

  /* ---------------- 13-2 她新家的咖哩 ---------------- */
  S.CURRY={ask:'2027-05-06',day:'2027-05-09'};
  S.CURRY_OUT={id:'sisb13_curry',ev:'ev_sis13_curry',h:12,late:0.5,place:'學姊的新家',title:'學姊的新家（家族吃咖哩）',travel:'捷運 約 30 分鐘',travelH:0.5,hours:2,back:'回到住的地方。'};   /* 車程稿沒寫（她 3/20 搬的新家），LAWWW 排 */
  S.curry=function(G){ const F=G.flags, a=D(S.CURRY.ask), d=D(S.CURRY.day), tag='sisb13_curry_ask'; if(a==null||d==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&inGrp(G)&&now(G)<T(d,11.5)){ const M=(L.curryAsk||[]).map(g); M[M.length-1].ask={id:tag,until:T(d,11.5),opts:[{t:L.curryGo,set:{SIS13_CURRY_GO:true}}]}; PHONE.at(G,a,21,M,tag); }   /* 回「去。」（所有在群組的人；沒認識也可以來）*/
    if(sent(G,tag)&&!sent(G,'sisb13_curry_dm')&&G.day<=a+1&&has(ID,'SIS4_CURRY')&&!!G.flags.met_sis&&contact(G)) PHONE.at(G,a,21+5/60,[dm(L.curryDm)],'sisb13_curry_dm');   /* 閒聊 S4-L3 的記憶（那一層兩個選項都記）*/
    if(F.SIS13_CURRY_GO===true&&F.SIS13_CURRY==null&&now(G)<T(d,S.CURRY_OUT.h+S.CURRY_OUT.late)) plan(G,Object.assign({},S.CURRY_OUT,{day:d})); };

  /* ---------------- 13-3 論文卡住，出來走一圈：朋友以上、沒交往、不是前任；她在研究室那一層（characters.js 那兩天 17:00～18:00 在 linze_5f）---------------- */
  S.WALK={from:'2027-12-06',to:'2027-12-07'};
  S.walkOk=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FRIEND')&&inDays(G,S.WALK.from,S.WALK.to)&&here(G)&&!abroad(G);

  /* ---------------- 13-4 6/2，公館的蛋糕：朋友以上、臺灣或美國路線、現有 6/2 那一場（交往中：蛋糕＋Café、隔天的 Café；y34b3d.js SIS_BDAY_Y3）沒有演的 ---------------- */
  S.BDAY='2028-06-02';
  S.cakeOk=G=>{ if(!law(G)||G.day!==D(S.BDAY)||!G.flags.met_sis||S.isEx(G)||route(G)==='JP'||abroad(G)||!friendUp(G)) return false; const v=G.flags.SIS_BDAY_Y3; return v==null||v==='msg'; };   /* msg＝朋友版的回覆（不是交往中的那一場）；invited、cafe、late_ask、next_cafe…＝現有那一場（排了或演了）*/

  /* ---------------- 13-5 6/2，日本那邊的十分鐘（MSG.send 包一層）---------------- */
  S.friendReply=()=>((typeof Y34B!=='undefined'&&Y34B.BDAY_REPLY&&Y34B.BDAY_REPLY.friend)||[])[0]||'謝謝。研究室的人買了一個小蛋糕。';
  S.jpBdayDue=(G,id,topic)=>id===ID&&topic==='bday'&&law(G)&&route(G)==='JP'&&abroad(G)&&!S.dating(G)&&typeof Y34B!=='undefined'&&!!Y34B.bdayVer&&Y34B.bdayVer(G)==='friend';   /* 朋友以上、日本路線、沒交往（bdayVer 的朋友版＝FRIEND 以上、不是前任）*/
  S.JP_OUT={id:'sisb13_jp_bday',ev:'ev_sis13_jp_bday',late:0.5,place:'視訊',verb:'接起來',no:'先不接',title:'學姊的生日：視訊（日本 22:00）',travel:'',travelH:0,back:'視訊結束。'};
  S.jpBdayPlan=function(G){ const d=D(S.BDAY); if(d==null||G.day!==d||typeof PHONE==='undefined') return false; const h=tzH(G,d,21); if(now(G)>=T(d,h)) return false;   /* 22:00（日本）已經過了＝照舊回那一句 */
    const P=PHONE.rec(G), txt=S.friendReply(); let items=null;
    P.q=P.q.filter(q=>{ if(items||!q||!Array.isArray(q.items)||!q.items.some(it=>it&&it.th==='p:'+ID&&it.text===txt)) return true; items=q.items.map(it=>it.text); return false; });   /* 剛排進去的那一句回覆先拿掉（沒接再傳）*/
    if(!items) return false;
    G.flags.SIS13_JP_TXT=items; plan(G,Object.assign({},S.JP_OUT,{day:d,h})); return true; };
  S.jpBdayMissed=function(G){ const F=G.flags; if(F.SIS13_JP_BDAY||sent(G,'sisb13_jp_bday_txt')||typeof PHONE==='undefined') return; const A=Array.isArray(F.SIS13_JP_TXT)&&F.SIS13_JP_TXT.length?F.SIS13_JP_TXT:[S.friendReply()];
    PHONE.at(G,G.day,+G.hour||0,A.map(dm),'sisb13_jp_bday_txt'); };
  if(typeof MSG!=='undefined'&&MSG.send&&!MSG._sisb13){ const send0=MSG.send;
    MSG.send=function(G,id,topic){ const due=S.jpBdayDue(G,id,topic), r=send0.apply(this,arguments); if(due&&r&&r.ok&&!r.silent){ try{ S.jpBdayPlan(G); }catch(e){ console.warn('SISB13 jpBday',e); } } return r; };
    MSG._sisb13=true; }

  /* ---------------- 13-6 C 棟的洗衣間、挽回中的短招呼（美國路線：沒在交往＝挽回中，BB_204）---------------- */
  S.LAUNDRY={from:'2028-10-08',to:'2028-10-20'};
  S.laundryOk=G=>law(G)&&route(G)==='US'&&!S.dating(G)&&!!G.flags.met_sis&&inUS(G)&&inDays(G,S.LAUNDRY.from,S.LAUNDRY.to);
  S.repairGreetOk=G=>law(G)&&route(G)==='US'&&!S.dating(G)&&inUS(G);
  const smallQ=t=>{ const m=/^(（[^）]*）)(.+)$/.exec(t); return m?m[1]+'「'+m[2]+'」':'「'+t+'」'; };   /* SMALLTALK 的寫法：說的話加「」，前面的動作照留 */
  S.greetTexts=()=>(L.repairGreet||[]).map(smallQ);
  if(typeof SMALLTALK!=='undefined'){ const A=SMALLTALK[ID]||(SMALLTALK[ID]=[]); for(const t of S.greetTexts()) if(!A.some(e=>e&&e.t===t)) A.push({t,once:true,prio:1,if:{custom:G=>S.repairGreetOk(G)},aa512:true}); }   /* 輪流（一天一句）、各一次（once）；prio：比「……我沒事。只是沒睡。」先說 */

  /* ---------------- 13-7「歡迎回來」家聚 ---------------- */
  S.WELCOME={ask:'2028-12-26',day:'2028-12-28'};
  S.WELCOME_OUT={id:'sisb13_welcome',ev:'ev_sis13_welcome',h:18.5,late:0.5,place:'118 巷・定食店',title:'家聚：歡迎回來（118 巷的定食店 18:30）',travel:'走過去約 10 分鐘',travelH:1/6,hours:1.5,back:'家聚散了。'};
  S.welcome=function(G){ const F=G.flags, a=D(S.WELCOME.ask), d=D(S.WELCOME.day), tag='sisb13_welcome_ask'; if(a==null||d==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&inGrp(G)&&now(G)<T(d,18)){ const M=(L.welcomeAsk||[]).map(g); M[M.length-1].ask={id:tag,until:T(d,18),opts:[{t:L.welcomeGo,set:{SIS13_WELCOME_GO:true}}]}; PHONE.at(G,a,21,M,tag); }   /* 所有家族的人（臺灣、日本、美國路線）*/
    if(F.SIS13_WELCOME_GO===true&&F.SIS13_WELCOME==null&&now(G)<T(d,S.WELCOME_OUT.h+S.WELCOME_OUT.late)) plan(G,Object.assign({},S.WELCOME_OUT,{day:d})); };

  /* ---------------- 13-8 游完泳的早上：朋友以上、沒交往、不是前任 ---------------- */
  S.POOL={from:'2029-05-07',to:'2029-05-10'};
  S.poolOk=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FRIEND')&&inDays(G,S.POOL.from,S.POOL.to)&&here(G)&&!abroad(G);

  /* ---------------- 第 2 節第 1 點：「不用還。……傳給你下一個直屬。」---------------- */
  S.yzOpts=G=>G&&G.flags&&G.flags.SIS_OLD_NOTES?[{t:L.notesOpt,say:[{from:'family_junior',text:L.notesRep}],sisNotes:true}]:[];   /* src/sup497_3d.js kvPhone 排 3/8 那一則時接在「（傳給她）」後面 */
  S.notes=function(G){ const F=G.flags;
    if(F.SIS_OLD_NOTES&&typeof PHONE!=='undefined'&&PHONE.byAsk){ const m=PHONE.byAsk(G,'kv_yz'); if(m&&m.ans==null&&m.ask&&Array.isArray(m.ask.opts)&&!m.ask.opts.some(o=>o&&o.sisNotes)) m.ask.opts.push(...S.yzOpts(G)); }   /* 筆記是大二下第 7～9 週才拿到（4/7 起）：3/8 那則還沒回的，拿到以後補上這個選項 */
    if(F.SIS_NOTES_PASSED===true&&F.SIS_NOTES_DAY!=null&&contact(G)){ const d=F.SIS_NOTES_DAY+1; if(G.day>=d-1&&G.day<=d+1&&!sent(G,'sisb13_notes_back')) PHONE.at(G,d,21,(L.notesBack||[]).map(dm),'sisb13_notes_back'); } };   /* 隔天 21:00（不用回）*/
  S.onAnswer=function(G,m,o){ if(!m||!m.ask||m.ask.id!=='kv_yz'||!o||!o.sisNotes) return; G.flags.SIS_NOTES_PASSED=true; G.flags.SIS_NOTES_DAY=G.day; };

  /* ---------------- 第 2 節第 3 點：修正本的第二本 ---------------- */
  S.THESIS={ask:'2029-07-15',day:'2029-07-20'};
  S.THESIS_OUT={id:'sisb13_thesis',ev:'ev_sis13_thesis',h:18.5,late:0.5,place:'公館',title:'公館（學姊的論文）',travel:'走過去約 15 分鐘',travelH:0.25,hours:1};
  S.thesis=function(G){ const F=G.flags, a=D(S.THESIS.ask), d=D(S.THESIS.day), tag='sisb13_thesis_ask'; if(a==null||d==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&G.day<=a+1&&has(ID,'SIS6_FATHER_COPY')&&!!F.met_sis&&contact(G)){ const M=(L.thesisMsg||[]).map(dm); M[M.length-1].ask={id:tag,until:T(d,18),opts:(L.thesisOpts||[]).map(o=>Object.assign(reply(o),{set:{SIS_THESIS_GO:o.k==='yes'}}))}; PHONE.at(G,a,tzH(G,a,21),M,tag); }   /* 閒聊 S5-L5 的記憶（那一層兩個選項都記）*/
    if(F.SIS_THESIS_GO===true&&F.SIS_THESIS_COPY==null&&now(G)<T(d,S.THESIS_OUT.h+S.THESIS_OUT.late)) plan(G,Object.assign({},S.THESIS_OUT,{day:d})); };

  /* ---------------- 第 2 節第 5 點：交往中，週一、三 19:00～21:30 她在研究室（大二上起）---------------- */
  S.LAB_EVE={from:'2026-09-01',to:'2029-05-31'};
  /* 週三晚上法圖還有沒演的那幾場（sis_b8_3d.js S.LIST：大二上下第 x 週週三 19:30 以後在法圖找她說話）＝那一晚她照舊在法圖，不讓研究室搶走現有的戲 */
  S.labYield=G=>{ if(wd(G)!==3||typeof SISB8==='undefined'||!Array.isArray(SISB8.LIST)||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); if(!t) return false;
    return SISB8.LIST.some(s=>!done(G,s.id)&&t.id===s.term&&t.week>=s.w[0]&&t.week<=s.w[1]&&(!s.need||done(G,s.need))); };
  S.labEve=G=>law(G)&&S.dating(G)&&inDays(G,S.LAB_EVE.from,S.LAB_EVE.to)&&!S.labYield(G);   /* characters.js 那一筆作息的 if */
  S.labEveLine=G=>S.labEve(G)&&!G.flags.SIS13_LAB_EVE;   /* 走進去她在：一次，之後照一般招呼 */

  /* ---------------- 第 2 節第 6 點：第四十天 ---------------- */
  S.DAY40='2028-09-11', S.DAY40_WEEK=['2028-09-10','2028-09-16'];
  S.day40=function(G){ const d=D(S.DAY40), tag='sisb13_day40'; if(d==null||G.day<d||G.day>d+1||sent(G,tag)) return; if(!law(G)||route(G)!=='US'||!S.dating(G)||!inUS(G)||!contact(G)) return;   /* 美國路線交往中（當地 22:00）*/
    const M=[dm(L.day40[0])].concat(G.flags.SIS_ASKED_HOME_LAKE?[dm(L.day40Asked)]:[],[dm(L.day40[1])]); M[M.length-1].ask={id:tag,opts:(L.day40Opts||[]).map(reply)}; PHONE.at(G,d,22,M,tag); };   /* 湖邊（8/5 US）選過「想家嗎？」的多一句 */
  S.day40Video=G=>law(G)&&route(G)!=='US'&&S.dating(G)&&!!G.flags.SIS_ASKED_HOME_CNY&&!G.flags.SIS13_DAY40&&inDays(G,S.DAY40_WEEK[0],S.DAY40_WEEK[1]);   /* 臺灣、日本路線：除夕電話（2028）問過「妳會想家嗎？」、第四十天那一週的週日視訊（r2y4b3d.js 9/10）*/

  /* ---------------- 第 2 節第 7 點：報告完了（彩排那天以後的下一個週三 21:00）---------------- */
  S.report=function(G){ const r=G.events&&G.events.last&&G.events.last.ev_us208_rehearsal; if(r==null||typeof CALENDAR==='undefined') return; let w=r+1; while(CALENDAR.dateOf(w).wd!==3&&w<r+8) w++;
    const tag='sisb13_report'; if(G.day<w||G.day>w+1||sent(G,tag)) return; if(!law(G)||route(G)!=='US'||!S.dating(G)||!contact(G)) return; PHONE.at(G,w,21,(L.reportDone||[]).map(dm),tag); };

  /* ---------------- 第 2 節第 8 點：二月那一頁（醉月湖跨年 2026-12-31 選「寫到哪裡？」＝SIS_NYE_PLAN_Q；交往中）---------------- */
  S.FEB={ask:'2029-01-31',day:'2029-02-01'};
  S.FEB_OUT={id:'sisb13_feb',ev:'ev_sis13_feb_plan',h:15,late:0.5,place:'兩點半 Café',title:'兩點半 Café（二月那一頁）',travel:'走路 約 10 分鐘',travelH:1/6,hours:2};
  S.feb=function(G){ const F=G.flags, a=D(S.FEB.ask), d=D(S.FEB.day), tag='sisb13_feb_ask'; if(a==null||d==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&G.day<=a&&F.SIS_NYE_PLAN_Q&&S.dating(G)&&contact(G)){ const M=(L.febMsg||[]).map(dm); M[M.length-1].ask={id:tag,until:T(d,14.5),opts:(L.febOpts||[]).map(o=>Object.assign(reply(o),{set:{SIS13_FEB_GO:true}}))}; PHONE.at(G,a,21,M,tag); }
    if(F.SIS13_FEB_GO===true&&F.SIS_FEB_PLAN==null&&S.dating(G)&&now(G)<T(d,S.FEB_OUT.h+S.FEB_OUT.late)) plan(G,Object.assign({},S.FEB_OUT,{day:d})); };

  /* ---------------- 第 2 節第 9 點：每週視訊（臺灣、日本路線交往中，r2y4b_events.js ev_sis_video_gf）g3「我這邊也還沒吃。」、g2「那是好問題的意思嗎？」＝下一次視訊開頭 ---------------- */
  const vOn=G=>law(G)&&route(G)!=='US'&&S.dating(G);
  S.g3Due=G=>vOn(G)&&G.flags.SIS13_G3_DAY!=null&&G.day>G.flags.SIS13_G3_DAY&&!G.flags.SIS13_G3_SAID;
  S.g2Due=G=>vOn(G)&&G.flags.SIS13_G2_DAY!=null&&G.day>G.flags.SIS13_G2_DAY&&!G.flags.SIS13_G2_SAID;

  /* ---------------- 第 5 節 伴手禮（美國路線、CAME_BACK_TOGETHER、1/3 和 1/6 都還在交往）---------------- */
  S.GIFT={ask:'2029-01-03',day:'2029-01-06',mom:'2029-01-07'};
  S.GIFT_OUT={id:'sisb13_gift',ev:'ev_sis13_gift',h:11.5,late:0.5,place:'臺北・家裡',title:'家裡的中飯',travel:'捷運＋公車 約 30 分鐘',travelH:0.5,hours:2};   /* 大四寒假多半住 409：回家 30 分鐘（同 OUT 從家裡出發的算法）*/
  S.giftOk=G=>law(G)&&route(G)==='US'&&!!G.flags.CAME_BACK_TOGETHER&&S.dating(G);
  S.gift=function(G){ const F=G.flags, a=D(S.GIFT.ask), d=D(S.GIFT.day), m7=D(S.GIFT.mom), tag='sisb13_gift_ask'; if(a==null||d==null||m7==null||G.day<a||G.day>m7+1) return;
    if(!sent(G,tag)&&G.day<=a&&S.giftOk(G)&&contact(G)){ const M=(L.giftAsk||[]).map(dm); M[M.length-1].ask={id:tag,until:T(d,10),opts:(L.giftOpts||[]).map(o=>Object.assign(reply(o),{set:{SIS13_GIFT_GO:true}}))}; PHONE.at(G,a,21,M,tag); }   /* 沒回＝不演、伴手禮那一句留著不再補 */
    if(F.SIS13_GIFT_GO===true&&F.SIS13_GIFT==null){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,S.GIFT_OUT.id):null;
      if(!S.giftOk(G)){ if(q&&q.state==='planned') q.state='cancelled'; }   /* 1/6 已經不在交往＝不演 */
      else if(now(G)<T(d,S.GIFT_OUT.h+S.GIFT_OUT.late)) plan(G,Object.assign({},S.GIFT_OUT,{day:d})); }
    if(F.SIS13_GIFT===true){
      if(!sent(G,'sisb13_gift_night')&&G.day<=d+1&&contact(G)){ const M=(L.giftNight||[]).map(dm); M[M.length-1].ask={id:'sisb13_gift_night',opts:(L.giftNightOpts||[]).map(reply)}; PHONE.at(G,d,21,M,'sisb13_gift_night'); }   /* 當晚 21:00 */
      if(!sent(G,'sisb13_gift_mom')&&G.day<=m7+1){ const M=(L.giftMom||[]).map(t=>({th:'p:mom',from:'mom',name:'媽媽',text:t})); M[M.length-1].ask={id:'sisb13_gift_mom',opts:(L.giftMomOpts||[]).map(t=>({t}))}; PHONE.at(G,m7,8,M,'sisb13_gift_mom'); } } };   /* 1/7（日）08:00 媽媽 */

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.curry,S.welcome,S.notes,S.thesis,S.day40,S.report,S.feb,S.gift]){ try{ f(G); }catch(e){ console.warn('SISB13 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._sisb13){ PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k)); PHONE.ON_ANSWER._sisb13=true; }
  /* 2D 背景：學姊的新家（還沒有圖＝先用公寓室內：學生家的客廳，窗外是晚上；BB 跟使用者要白天的圖）、C 棟地下室的洗衣間（沒有圖＝深色底＋地點字幕）*/
  if(typeof OUT!=='undefined'&&OUT.BG){ if(!OUT.BG.sis_new_home) OUT.BG.sis_new_home={label:'學姊的新家',image:'assets/bg/tutor_home.webp'}; if(!OUT.BG.us_c_laundry) OUT.BG.us_c_laundry={label:'C 棟・地下室的洗衣間',image:null}; }
  return S;
})();
