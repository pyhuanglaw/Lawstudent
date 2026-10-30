/* ===== 學姊第八批：大二整年＋兩個暑假（AA_394；任務 SIS-B8-L-1023；D111 學校裡也要充實學姊）：接線 =====
   台詞、事件在 src/data/sis_b8_events.js（照稿不改字）。條件全部共用（S.ok）：認識她、熟悉以上、不是前任、她在臺北、你人不在國外。
   - 有約的三場（OUT；她私訊兩則＋回覆，同 sis_y2y3_3d.js 的 ASKS）：
     第 1 節 8/12（三）21:00 → 8/14（五）15:00 兩點半 Café（「我已經排好了」也排；「不行」＝8/14 20:00 她傳一句）；
     2-2 11/4（三）21:00 → 11/6（五）12:20 公館的自助餐（「不行」＝「好。下次。」不補）；
     第 4 節 7/20（二）21:00 → 7/22（四）15:00 霖澤館研究室（「我看得懂嗎？」也排；「不行」＝不排、7/25 21:00 她傳，SIS_CH1_READ 'mail'）。
   - 找她說話時先演（S.preTalk；包住 SISY23.preTalk，sis_b4 的那一層之後）：法圖、週三晚上——2-1 大二上第 5～6 週（19:30 以後）、
     2-3 第 14～15 週（AA_386 1-2 演過、不是同一天）、3-1 大二下第 3 週、3-2 第 7 週（那天先演了 AA_379 2-3＝下一個週三，到第 9 週；同 2-3 讓 1-2 的做法）、3-3 第 14 週（21:30 以後，那一天她在法圖到 21:45，characters.js）；
     3-1 教她的那一版之後第一次在 Café 找她說話：「上次的」熱拿鐵。同一天只演一場（她的說話前接演，這幾個檔都算）。
   測試：node tests/aa394_sis_b8_unit.js */
'use strict';
const SISB8=(function(){
  const S={}, ID='heroine_05', L=typeof SISB8_LINES!=='undefined'?SISB8_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  const isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const contact=(G,day)=>{ if(S.dating(G)) return true; if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,ID)) return false; const c=G.contacts&&G.contacts[ID]; return c==null||c<(day==null?G.day:day); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  S.ok=G=>law(G)&&!!G.flags.met_sis&&!isEx(G)&&(S.dating(G)||stageOk('FAMILIAR'))&&here(G)&&!abroad(G);
  S.econFull=G=>{ const F=G.flags||{}; return F.Y0_LEFT!=null||F.ECON_PAST_SHARED==='full'||F.ECON_PAST_SHARED==='half'; };   /* 3-1 第一個選項：經濟系那一年念完的（休學那天 Y0_LEFT）、或同學知道他念過經濟 */

  /* ---------------- 有約的三場 ---------------- */
  S.ASKS=[
    {k:'course',ask:'2026-08-12',h:21,lines:L.courseAsk,flag:'SIS_COURSE_Y2',go:'SIS_COURSE_Y2_GO',
      opts:[{t:L.courseYes,go:true},{t:L.courseDone,go:true,r:L.courseDoneR},{t:L.courseNoT,go:false,r:L.courseNo}],
      out:{id:'sisb8_course',ev:'ev_sis_course_y2',day:'2026-08-14',h:15,late:0.25,place:'兩點半 Café',title:'兩點半 Café（學姊幫你看課表）',travel:'走路 約 10 分鐘',travelH:1/6},
      no:{day:'2026-08-14',h:20,lines:[L.courseNoLater]}},
    {k:'lunch',ask:'2026-11-04',h:21,lines:L.lunchAsk,flag:'SIS_LUNCH_Y2',go:'SIS_LUNCH_Y2_GO',
      opts:[{t:L.lunchYes,go:true},{t:L.lunchNoT,go:false,r:L.lunchNo}],
      out:{id:'sisb8_lunch',ev:'ev_sis_lunch_y2',day:'2026-11-06',h:12+20/60,late:0.25,place:'公館・自助餐',title:'直屬的午餐（公館的自助餐）',travel:'走路 約 15 分鐘',travelH:0.25}},
    {k:'ch1',ask:'2027-07-20',h:21,lines:L.ch1Ask,flag:'SIS_CH1_READ',go:'SIS_CH1_GO',
      opts:[{t:L.ch1Yes,go:true},{t:L.ch1Q,go:true,r:L.ch1QR},{t:L.ch1NoT,go:false,r:L.ch1No}],
      out:{id:'sisb8_ch1',ev:'ev_sis_ch1_read',day:'2027-07-22',h:15,late:0.25,place:'法律系館A・研究室',title:'研究室（幫學姊讀論文第一章）',travel:'走路 約 10 分鐘',travelH:1/6},
      no:{day:'2027-07-25',h:21,lines:[L.ch1Mail],flagNo:'mail'}} ];
  S.asks=function(G){ const F=G.flags;
    for(const a of S.ASKS){ const d=D(a.ask), od=D(a.out.day); if(d==null||od==null||!Array.isArray(a.lines)) continue; const tag='sisb8_'+a.k+'_ask';
      if(!sent(G,tag)&&F[a.flag]==null&&G.day>=d&&G.day<=d+1&&now(G)<T(od,a.out.h)&&S.ok(G)&&contact(G,d)){
        const M=a.lines.map(dm); M[M.length-1].ask={id:tag,until:T(od,a.out.h),opts:a.opts.map(o=>Object.assign({t:o.t,set:{[a.go]:o.go}},o.r?{say:[{from:ID,text:o.r}]}:{}))};
        PHONE.at(G,d,a.h,M,tag); }
      if(F[a.go]===true&&F[a.flag]==null&&now(G)<T(od,a.out.h+a.out.late)) plan(G,Object.assign({},a.out,{day:od}));
      if(F[a.go]===false&&a.no){ const nd=D(a.no.day); if(nd!=null&&now(G)>=T(nd,a.no.h)&&G.day<=nd+1&&!sent(G,tag+'_no')){ if(a.no.flagNo&&F[a.flag]==null) F[a.flag]=a.no.flagNo; PHONE.at(G,nd,a.no.h,a.no.lines.map(dm),tag+'_no'); } } } };
  S.missed=function(G,k){ const a=S.ASKS.find(x=>x.k===k); if(a&&G.flags[a.flag]==null) G.flags[a.flag]='missed'; };   /* 錯過不補 */

  /* ---------------- 找她說話時先演 ---------------- */
  const SIS_PRE=/^ev_sis_(adv_|three_conditions|lab_desk|seminar|topic|us_told|db_taught|ta_papers|econ_|old_notes|hot_water_back|jp_note)/;
  const preToday=G=>{ const R=G.events&&G.events.last; if(!R) return false; return Object.keys(R).some(id=>SIS_PRE.test(id)&&R[id]===G.day); };   /* 同一天只演一場 */
  S.LIST=[{id:'ev_sis_db_taught',term:'Y2S1',w:[5,6],h:19.5},{id:'ev_sis_ta_papers',term:'Y2S1',w:[14,15],h:19.5,need:'ev_sis_adv_exch'},
    {id:'ev_sis_econ_graph',term:'Y2S2',w:[3,3],h:19.5},{id:'ev_sis_old_notes',term:'Y2S2',w:[7,9],h:19.5},{id:'ev_sis_hot_water_back',term:'Y2S2',w:[14,14],h:21.5}];
  S.preTalkEv=function(G){ if(!G||!law(G)||!S.ok(G)||preToday(G)) return null;
    if(G.zone==='cafe'&&G.flags.SIS_ECON_GRAPH==='taught'&&!done(G,'ev_sis_econ_latte')&&(G.events.last||{}).ev_sis_econ_graph!==G.day) return 'ev_sis_econ_latte';
    if(G.zone!=='lawlib') return null; const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!t) return null;
    const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:null; if(wd!==3) return null;
    for(const s of S.LIST){ if(done(G,s.id)||t.id!==s.term||t.week<s.w[0]||t.week>s.w[1]||hh(G)<s.h) continue; if(s.need&&!done(G,s.need)) continue; return s.id; }
    return null; };
  S.preTalk=async function(GM){ const G=GM&&GM.G, id=S.preTalkEv(G); if(!id||typeof EVENTS==='undefined'||!EVENTS.runLines||typeof STORY_EVENTS==='undefined') return false;
    const ev=STORY_EVENTS.find(e=>e.id===id); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[id]=(R.done[id]|0)+1; R.last[id]=G.day;   /* 先記（同 SISB4.preTalk）*/
    await EVENTS.runLines(ev.dialogue,ev); return true; };

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; try{ S.asks(G); }catch(e){ console.warn('SISB8 phone',e); } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb8){ const p0=SISY23.preTalk;
    SISY23.preTalk=async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); }; Object.assign(SISY23.preTalk,{_sisb8:true,_sisb4:p0._sisb4,_sisjp:p0._sisjp}); }
  return S;
})();
