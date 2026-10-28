/* ===== 學姊第九批：大三下學期中兩場、大四上她在美國時朋友的遠距（AA_395；任務 SIS-B9-L-1023；D111）：接線 =====
   台詞、事件在 src/data/sis_b9_events.js（照稿不改字）。這個檔：
   - 1-1 雨天，總圖門口（S.tick）：大三下這學期人在臺灣（臺灣路線、美國路線；日本路線 3/25 就走了）、熟悉以上、不是前任；
     4/24（一）～5/5（五）第一個下雨的平日 16:50～17:20，人在總圖門口（校園、總圖大門 15 m 以內）或總圖大廳；
     兩週都沒下雨（下午看到過雨就算有＝SIS_RAIN_SEEN）＝5/3（三）12:00 起改成雨天；和 1-4（ev_sis_adv_y4）同一天＝順延到下一個下雨的平日；過了 5/5 不演。
   - 1-1 撐過傘的「傘帶了。」：臺灣路線 7/31 22:00 私訊、美國路線 8/1 22:00；交往中、有送機那一場的（y34b3d.js AIRPORT／AIRPORT_WAIT）接在那一場的第一句前，不另外傳。
   - 1-2 帶哪一本：5/18、5/25（四）19:30～21:30 在 Café 找她說話（說話前接演，包住 SISY23.preTalk）；那晚已經演了 1-4（或她別的說話前接演）＝下一個週四；6/1 不演。
     「兩本都帶。我幫妳寄一本。」只給 8/14 人在臺灣的（美國路線 8/2 和她同一班飛機，S.canMail）。
   - 1-3 三種 SIS_BOOK 的訊息（她在美國；臺灣週一 09:00，排在那一格後面）：law 9/18、novel 11/20；both＝8/14 21:00 手機提醒、8/14～8/20 公館郵局（OUT，
     30 分、郵資 900 元）→ 9/4 照片；沒寄＝9/4「書的事不用了。這邊的圖書館有。」。
   - 2-2 楓葉書籤：R2Y4B.saOn 的玩家（臺灣、日本路線，朋友版、交往中都有），10/26（四）18:00 以後第一次回到自己的房間；演完可以傳她一則（照她的回覆時間回）；
     房間物件 sis_maple（STORY.ROOM_EXTRA）；12/23 接機車上那一句在 r2y4a_events.js（有書籤、傳過「書籤收到了。」）。
   - 2-1 短視訊、2-3 大峽谷條件在 src/r2y4b3d.js。
   測試：node tests/aa395_sis_b9_unit.js */
'use strict';
const SISB9=(function(){
  const S={}, ID='heroine_05', L=typeof SISB9_LINES!=='undefined'?SISB9_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  const isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  /* 大三下這一學期（人在臺灣）*/
  S.okY3=G=>law(G)&&!!G.flags.met_sis&&route(G)!=='JP'&&!isEx(G)&&(S.dating(G)||stageOk('FAMILIAR'))&&!abroad(G);
  S.canMail=G=>route(G)!=='US';
  S.mapleClose=G=>S.dating(G)||stageOk('CLOSE_FRIEND');
  const SIS_PRE=/^ev_sis_(adv_|three_conditions|lab_desk|seminar|topic|us_told|db_taught|ta_papers|econ_|old_notes|hot_water_back|jp_note|which_book|y3s2_rain)/;
  const preToday=G=>{ const R=G.events&&G.events.last; if(!R) return false; return Object.keys(R).some(id=>SIS_PRE.test(id)&&R[id]===G.day); };

  /* ---------------- 1-1 雨天 ---------------- */
  S.RAIN={from:'2028-04-24',to:'2028-05-05',force:'2028-05-03',door:{x:86.4,z:0,r:15}};
  const weekday=G=>{ const w=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:0; return w>=1&&w<=5; };
  const inRainWin=G=>{ const a=D(S.RAIN.from), b=D(S.RAIN.to); return a!=null&&b!=null&&G.day>=a&&G.day<=b&&weekday(G); };
  const nearDoor=(G,E)=>{ if(G.zone==='library_hall') return true; if(G.zone!=='campus') return false; const p=E&&E.player&&E.player.obj&&E.player.obj.position, d=S.RAIN.door; return !!p&&Math.hypot(p.x-d.x,p.z-d.z)<=d.r; };
  S.rainDue=(G,E)=>!!G&&inRainWin(G)&&G.flags.SIS_Y3S2_RAIN==null&&G.weather==='rain'&&hh(G)>=16+50/60&&hh(G)<17+20/60&&S.okY3(G)&&!preToday(G)&&nearDoor(G,E);
  S.rainWatch=function(G,E){ const F=G.flags; if(F.SIS_Y3S2_RAIN!=null||!inRainWin(G)) return; if(G.weather==='rain'&&hh(G)>=12&&hh(G)<17+20/60) F.SIS_RAIN_SEEN=true;   /* 這兩週下午看過雨 */
    const f=D(S.RAIN.force); if(f!=null&&G.day===f&&hh(G)>=12&&!F.SIS_RAIN_SEEN&&!F.SIS_RAIN_FORCED&&S.okY3(G)){ F.SIS_RAIN_FORCED=true; G.weather='rain'; if(E&&E.setWeather) E.setWeather('rain'); } };
  /* ---------------- 1-2 帶哪一本 ---------------- */
  S.BOOK_DAYS=['2028-05-18','2028-05-25'];
  S.bookDue=G=>!!G&&G.zone==='cafe'&&hh(G)>=19.5&&hh(G)<21.5&&G.flags.SIS_BOOK==null&&!done(G,'ev_sis_which_book')&&S.BOOK_DAYS.some(k=>D(k)===G.day)&&S.okY3(G)&&!preToday(G);
  S.preTalk=async function(GM){ const G=GM&&GM.G; if(!S.bookDue(G)||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; const ev=evOf('ev_sis_which_book'); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[ev.id]=(R.done[ev.id]|0)+1; R.last[ev.id]=G.day;
    await EVENTS.runLines(ev.dialogue,ev); return true; };
  /* ---------------- 1-3、1-1 的「傘帶了。」---------------- */
  const twAt=(G,day,h,items,tag)=>{ if(day==null) return false; return PHONE.at(G,day,h+tz(G,day),items,tag); };   /* 臺灣時間 → 遊戲時鐘 */
  S.books=function(G){ const F=G.flags; if(!law(G)||isEx(G)||!F.SIS_BOOK) return;
    if(F.SIS_BOOK==='law'){ const d=D('2028-09-18'); if(d!=null&&G.day>=d&&G.day<=d+2) twAt(G,d,9.05,L.bookLaw.map(dm),'sisb9_book_law'); }
    if(F.SIS_BOOK==='novel'){ const d=D('2028-11-20'); if(d!=null&&G.day>=d&&G.day<=d+2) twAt(G,d,9.05,L.bookNovel.map(dm),'sisb9_book_novel'); }
    if(F.SIS_BOOK==='both'){ const a=D('2028-08-14'), b=D('2028-08-20'), r=D('2028-09-04');
      if(a!=null&&G.day>=a&&G.day<=b&&now(G)>=T(a,21)&&!sent(G,'sisb9_book_remind')) PHONE.at(G,a,21,[{th:'sys',text:L.bookRemind,ask:{id:'sisb9_book_remind',until:T(b,17.5),opts:[{t:'去公館郵局寄（30 分鐘，郵資 900 元）',post:false,set:{SIS_BOOK_GO:true}}]}}],'sisb9_book_remind');   /* 手機跳出提醒；按了＝現在出發 */
      if(F.SIS_BOOK_GO&&!F.SIS_BOOK_SENT&&a!=null&&G.day<=b&&!abroad(G)){ const q=typeof OUT!=='undefined'?OUT.get(G,'sisb9_book_mail'):null;
        if(q&&q.state==='missed'){ OUT.rec(G).splice(OUT.rec(G).indexOf(q),1); F.SIS_BOOK_GO=false; }   /* 這次沒去：提醒還在的話可以再按 */
        else if(!q) plan(G,{id:'sisb9_book_mail',ev:'ev_sis_book_mail',day:G.day,h:G.hour+0.05,late:0.5,place:'公館郵局',title:'寄書給學姊（30 分鐘，郵資 900 元）',travel:'走路 約 15 分鐘',travelH:0.25,hours:0.5,alarm:false}); }
      if(r!=null&&G.day>=r&&G.day<=r+2) twAt(G,r,9.05,(F.SIS_BOOK_SENT?L.bookSent:L.bookNotSent).map(dm),'sisb9_book_both'); } };
  S.umbrella=function(G){ const F=G.flags; if(!law(G)||!F.SIS_Y3S2_RAIN||isEx(G)) return; const r=route(G); if(r==='JP') return;
    if(S.dating(G)&&(F.SIS_RIDE||F.SIS_RIDE_ASK==='airport')) return;   /* 交往中、有送機那一場：接在那一場裡 */
    const d=D(r==='US'?'2028-08-01':'2028-07-31'); if(d!=null&&G.day>=d&&G.day<=d+1&&now(G)>=T(d,22)&&!sent(G,'sisb9_umbrella')) PHONE.at(G,d,22,[dm(L.umbrella)],'sisb9_umbrella'); };
  /* ---------------- 2-2 楓葉書籤 ---------------- */
  S.mapleOk=G=>law(G)&&!G.flags.SIS_MAPLE&&typeof R2Y4B!=='undefined'&&!!R2Y4B.saOn&&R2Y4B.saOn(G);
  S.mapleDue=G=>{ const d=D('2028-10-26'); return !!G&&d!=null&&G.day>=d&&now(G)>=T(d,18)&&G.zone==='dorm'&&S.mapleOk(G); };
  S.maple=async function(GM){ const G=GM.G, ev=evOf('ev_sis_maple'); if(!ev||typeof EVENTS==='undefined') return false; await EVENTS.run(ev);
    const O=(L.maple||[]).map(x=>({t:'傳給她：「'+x.t+'」'})).concat([{t:'（不傳）'}]); const k=GM.choose?await GM.choose(O):O.length-1; const m=(L.maple||[])[k];
    if(m&&typeof PHONE!=='undefined'){ G.flags.SIS_MAPLE_MSG=m.k; PHONE.post(G,{th:'p:'+ID,from:'player',who:null,text:m.t});
      const at=typeof MSG!=='undefined'&&MSG.replyAt?MSG.replyAt(G,ID):{day:G.day,h:G.hour+1}; PHONE.at(G,at.day,at.h,[dm(m.r)],'sisb9_maple_r'); }
    return true; };
  /* ---------------- 每 0.5 秒、手機規則 ---------------- */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['sis_b9_3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const go=f=>{ busy=true; Promise.resolve().then(f).catch(e=>console.warn('SISB9',e)).finally(()=>{ busy=false; }); return true; };
  S.tick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(busy||!G||!G.flags||!law(G)) return false; try{ S.rainWatch(G,E); }catch(e){ console.warn('SISB9 rain',e); }
    if(S.rainDue(G,E)){ const ev=evOf('ev_sis_y3s2_rain'); if(ev) return go(()=>EVENTS.run(ev)); }
    if(S.mapleDue(G)) return go(()=>S.maple(GM));
    return false; };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.books,S.umbrella]){ try{ f(G); }catch(e){ console.warn('SISB9 phone',e); } } };
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lr)=>{ if(G&&G.flags&&G.flags.SIS_MAPLE) Lr.push(['學姊寄來的楓葉書籤','夾在你現在讀的那本書裡。']); }); }
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb9){ const p0=SISY23.preTalk;
    SISY23.preTalk=async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); }; Object.assign(SISY23.preTalk,{_sisb9:true,_sisb4:p0._sisb4,_sisjp:p0._sisjp,_sisb8:p0._sisb8}); }
  return S;
})();
