/* ===== 美國篇的空白日（AA_424，AA-B 2026-10-23 19:0x，第①級；D109 AA 定稿；D99 第三優先：美國交換系統）=====
   BB-B BB_301 用遊戲的函式一天一天列出美國篇 143 天，沒有任何為那天寫的事的日子：交往中 10 天、挽回中 21 天。AA 定：全部補，每一天一小段。
   台詞在 src/data/us_blank_lines.js（US_BLANK_LINES，照 AA 原文）；這裡是時間、條件、手機、出遊、REPAIR、掛勾。不改 us_life3d.js／us208_3d.js／r2y4a3d.js：都是包一層或讀它們的函式。
   「交往中」＝當天 dating_heroine_05；「挽回中」＝美國路線、不是交往中（BB_204 第 4 節，同 USL）。時間都是當地時間（同 USL、R2Y4A）。
   第 1 節 挽回中的週六 10:00：學姊在交換生群組（g:us_exchange）一則，16 個週六（AA_516 第 5 節補 9/2，共 17 個）；三個回法：
          在群組回＝REPAIR +1（R2Y4A.repairAdd：一週最多 +1，用抵達後第幾週算，和 US2「還沒。」、芝加哥的邀約、US3 合起來算）；（私訊她）＝已讀不回、不加（同日本路線 jp3d.js）；（不回）＝沒有。
          別人接的那一句：她、群組裡的旁白跟著回覆一起出；何俊朗的要見過他才有（回的當下看 MET_LONG）。11/11 那一則只有玩家沒有去芝加哥（US_CHICAGO 'missed'）；
          12/9 那一則 12/2 初雪重新交往的（US_RESTART）也有，回了不加 REPAIR（已經沒有挽回了）。這一則開著到下一個週六 10:00（ask.until）。
   第 2 節 秋假：交往中、沒有大峽谷（USL.canyonGone 沒有、行事曆的那一趟不是等出發）＝10/9 21:00 私訊 →「好。」→ 10/10 14:00 湖邊（出遊）；
          挽回中＝10/12 她在會所自習室的時候（USL.sisClub，週四 19～21）去自習室讀書才演（包住 USL.club）；快轉停在 10/12 19:30。
          日期卡：USL.SUM（跳日期時出在日期卡下面，沒跳過的那天到時間出一次）多幾張，每張有 if（包住 USL.sumDue、USL.tick：if 不成立的不出）。
   第 3 節 交往中、開學前（還沒演 US2：9/13 以前）的週六：8/12 竹葉亞洲超市、8/19 湖邊、8/26 法學院圖書館＝前一天 21:00 私訊約（「好。」→ 排行程；「明天不行。」→「好。」）；
          竹葉、圖書館是 3D 的區域：演之前換到那裡（OUT.STAGE），畫面用模糊的 3D，演完回到原本的地方。
          AA_453 1-2：8/26 早上學姊的七夕（sis_qixi3d.js 的週六市集 sisqx_2028）排了或演了＝8/25 21:00 那一則換句（S.qxOn）；七夕演過的，圖書館的第一句換句（us_blank_lines.js 的 QX）。
          9/9 上午（08:00～12:00）在公寓「洗衣機」那裡選「洗衣服」才演（社區的洗衣間）；快轉停在 9/9 11:00。
          「洗衣服」平常也可以做（40 分鐘、不加數值，同宿舍洗衣間 closed3d.js）；「只看看」＝原本「看」的字（AA_287）。
          AA_412 3-2 滷肉：有 US_ASIAN_MARKET 的，開頭（第一句旁白後面）多一句「（你認得那包八角。）」（patchLurou，改 ev_us208_lurou 的 dialogue）。
   第 4 節 8/15 迎新週第二天的摘要（每個人都有）：那天第一次出門（人在美國、不在公寓）就演；快轉跳過 8/15 18:00 的，跳完演（包住 USL.jump）；還沒演就又快轉的，那一次快轉以前先演（AA_450 1-3）。
   第 5 節 11/11 交往中、沒有去芝加哥（US_CHICAGO 'missed'：「這週不行。」、沒回、沒趕上巴士）：日期卡＋21:00 私訊（兩個回覆，她已讀不回）。
   存檔：G.flags.USB_*（群組回法 USB_GRP_<月日>、約的回覆 USB_SAT_<月日>、迎新摘要 USB_ORIENT）、G.flags.USB_REC={grp:{月日:回的那天}}（REPAIR 算過了）；舊存檔沒有＝空的。
   測試：node tests/aa424_us_blank_unit.js */
'use strict';
const US_BLANK=(function(){
  const S={}, S5='heroine_05', TH='g:us_exchange', GID='us_exchange';
  if(typeof STORY==='undefined'||typeof STORY_EVENTS==='undefined'||typeof US_BLANK_LINES==='undefined'||typeof USL==='undefined'||!USL.here) return S;
  const X=US_BLANK_LINES.DATA, dating=US_BLANK_LINES.dating, LONG=US_BLANK_LINES.LONG;
  const dk={}; const D=k=>{ if(k in dk) return dk[k]; return dk[k]=STORY.dayOfKey?STORY.dayOfKey(k):null; };
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour, hh=G=>((G.hour%24)+24)%24;
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const has=(id,t)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,t);
  const isUS=G=>!!G&&!!G.flags&&(G.stage||'law')==='law'&&!!STORY.route&&STORY.route(G)==='US';
  const here=G=>isUS(G)&&USL.here(G);
  const inUS=G=>typeof EXCH!=='undefined'&&!!EXCH.inUS&&EXCH.inUS(G);
  const evOf=id=>STORY_EVENTS.find(e=>e.id===id)||null;
  const run=(id,o)=>{ const e=evOf(id); return e&&typeof EVENTS!=='undefined'?EVENTS.run(e,o):Promise.resolve(); };
  const bg=id=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg(id):'dark';
  const mmdd=k=>k.slice(5,7)+k.slice(8,10);
  S.rec=G=>{ const F=G.flags; if(!F.USB_REC||typeof F.USB_REC!=='object') F.USB_REC={}; const R=F.USB_REC; if(!R.grp||typeof R.grp!=='object') R.grp={}; return R; };
  S.US2_DAY='2028-09-13';

  /* ======================= 第 1 節 挽回中的週六：交換生群組 ======================= */
  S.GRP=X.GRP.map(([d,post,reply,after,o])=>Object.assign({d,post,reply,after:after||null,n:mmdd(d)},o||{}));
  S.grpTag=r=>'usb_grp_'+r.n; S.grpKey=r=>'USB_GRP_'+r.n;
  /* 這一則傳不傳（傳的那一刻看）：挽回中；11/11＝玩家沒有去芝加哥；12/9＝重新交往的也傳 */
  S.grpOK=(G,r)=>{ const F=G.flags; if(r.chicago&&F.US_CHICAGO!=='missed') return false; return !dating(G)||(!!r.redate&&F.US_RESTART!=null); };
  S.grpUntil=r=>Math.min(T(D(r.d)+7,10),T(D(USL.CAL?USL.CAL.leave:'2028-12-16'),7));
  S.grpItems=function(G,r){ const k=S.grpKey(r), A=r.after||{}, L=r.post.map(t=>({th:TH,from:S5,text:t}));
    const say=[]; if(A.sis) say.push({th:TH,from:S5,text:A.sis}); if(A.nar) say.push({th:TH,text:A.nar});   /* 何俊朗（A.long）：回的當下見過他才接（S.grpPhone）*/
    L[L.length-1].ask={id:S.grpTag(r),until:S.grpUntil(r),opts:[{t:r.reply,say,set:{[k]:'group'}},
      {t:X.GRP_DM,post:false,say:[{th:'p:'+S5,from:'player',who:null,text:X.GRP_DM_TEXT}],set:{[k]:'dm'}},
      {t:X.GRP_NONE,post:false,set:{[k]:'none'}}]};
    return L; };
  S.grpPhone=function(G){ if(!PHONE.inGroup(G,GID)) return; const F=G.flags, R=S.rec(G);
    for(const r of S.GRP){ const d=D(r.d); if(d==null) continue;
      if(now(G)>=T(d,10)&&now(G)<T(d+7,10)&&!PHONE.sent(G,S.grpTag(r))&&S.grpOK(G,r)) PHONE.at(G,d,10,S.grpItems(G,r),S.grpTag(r));   /* 讀檔回來、快轉跨過去的：一週以內照原本的時間補，太舊的不補 */
      if(F[S.grpKey(r)]==='group'&&R.grp[r.n]==null){ R.grp[r.n]=G.day;   /* 在群組回了：REPAIR +1（回的那一週算）；重新交往以後不加 */
        if(!dating(G)&&typeof R2Y4A!=='undefined'&&R2Y4A.repairAdd) R2Y4A.repairAdd(G,'us_grp_'+r.n);
        if(r.after&&r.after.long&&LONG(G)) PHONE.post(G,{th:TH,from:'npc_long',name:'何俊朗',text:r.after.long}); } } };

  /* ======================= 第 2-1、3 節 交往中：前一天 21:00 她私訊約 ======================= */
  /* 交往中、沒有去大峽谷：去了（US_CANYON／那一趟 done）不算；行事曆的那一趟還在等出發（約好的時間＋late 以前）也不算 */
  S.noCanyon=G=>{ if(USL.canyonGone&&USL.canyonGone(G)) return false; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,(USL.CANYON&&USL.CANYON.out)||'y4_us_canyon'):null;
    return !(q&&q.state==='planned'&&now(G)<=T(q.day,q.h)+(q.late!=null?q.late:0.75)); };
  S.fbDating=G=>here(G)&&dating(G)&&S.noCanyon(G);
  S.fbRepair=G=>here(G)&&!dating(G);
  S.SAT=X.SAT.map(r=>Object.assign({},r,{tag:'usb_sat_'+r.n,key:'USB_SAT_'+r.n,out:'usb_sat_'+r.n}));
  S.satOK=(G,r)=>dating(G)&&(r.fall?S.noCanyon(G):D(r.d)<D(S.US2_DAY));   /* 開學前的週六：還沒演 US2（9/13 以前）；秋假：沒有大峽谷 */
  S.qxOn=G=>{ const s=US_BLANK_LINES.QX?US_BLANK_LINES.QX(G):null; return s==='planned'||s==='done'; };   /* AA_453 1-2：8/26 早上學姊的七夕（週六市集，sisqx_2028）排了或演了＝8/25 21:00 那一則換成 msgQx（「市集逛完，下午去圖書館。課表帶著。」）；傳的那一刻看，沒排的照舊 */
  S.satPhone=function(G){ const F=G.flags;
    for(const r of S.SAT){ const da=D(r.ask), d=D(r.d); if(da==null||d==null) continue;
      if(now(G)>=T(da,21)&&now(G)<T(d,r.h)&&!PHONE.sent(G,r.tag)&&S.satOK(G,r)){
        const m={th:'p:'+S5,from:S5,text:r.msgQx&&S.qxOn(G)?r.msgQx:r.msg,ask:{id:r.tag,until:T(d,r.h),opts:[{t:X.SAT_YES,set:{[r.key]:'go'}},{t:X.SAT_NO,say:[{from:S5,text:X.SAT_NO_REPLY}],set:{[r.key]:'no'}}]}};
        PHONE.at(G,da,G.day===da?Math.max(21,G.hour):21,[m],r.tag); }
      if(F[r.key]==='go'&&typeof OUT!=='undefined'&&!OUT.get(G,r.out)&&now(G)<T(d,r.h)+0.75)
        OUT.plan(G,{id:r.out,ev:r.ev,day:d,h:r.h,late:0.75,place:r.place,title:r.title,travel:r.travel,travelH:r.travelH,back:'回到社區。'}); } };

  /* ======================= 第 5 節 11/11 交往中、沒有去芝加哥：21:00 私訊 ======================= */
  S.chiOK=G=>here(G)&&dating(G)&&G.flags.US_CHICAGO==='missed';
  S.chiPhone=function(G){ const d=D('2028-11-11'); if(d==null||!S.chiOK(G)||G.day<d||G.day>d+1||now(G)<T(d,21)||PHONE.sent(G,'usb_chi_1111')) return;
    const L=X.CHI.map(t=>({th:'p:'+S5,from:S5,text:t})); L[L.length-1].ask={id:'usb_chi_1111',opts:X.CHI_ASK.map(t=>({t}))};   /* 她不回（已讀）*/
    PHONE.at(G,d,21,L,'usb_chi_1111'); };

  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!here(G)) return;
    try{ S.grpPhone(G); S.satPhone(G); S.chiPhone(G); S.laundryPhone(G); }catch(e){ console.warn('US_BLANK.phone',e); } };

  /* ======================= 日期卡（第 2 節六張、第 5 節一張）：USL.SUM 多幾張，每張有 if ======================= */
  S.cardIf=(c,G)=>(!!c.dating&&S.fbDating(G))||(!!c.repair&&S.fbRepair(G))||(!!c.chicago&&S.chiOK(G));
  S.cardText=(c,G)=>c.chicago&&S.chiOK(G)?c.chicago:(dating(G)?c.dating:c.repair);
  S.CARDS=Object.keys(X.CARDS).map(d=>{ const c=X.CARDS[d]; return {d,h:c.h,usb:true,if:G=>S.cardIf(c,G),t:G=>S.cardText(c,G)||''}; });
  if(Array.isArray(USL.SUM)) for(const s of S.CARDS) if(!USL.SUM.some(q=>q.d===s.d)) USL.SUM.push(s);
  if(!USL._usbSum){ const sd0=USL.sumDue, tk0=USL.tick;
    if(sd0) USL.sumDue=function(G){ return sd0.apply(this,arguments).filter(s=>!s.if||s.if(G)); };   /* 快轉的日期卡：if 不成立的不出（也不記成出過）*/
    if(tk0) USL.tick=function(GM){ const G=GM&&GM.G, all=USL.SUM; if(!G||!Array.isArray(all)) return tk0.apply(this,arguments);
      USL.SUM=all.filter(s=>!s.if||s.if(G)); try{ return tk0.apply(this,arguments); } finally { USL.SUM=all; } };   /* 沒跳過的那天到時間出一次（USL.tick 讀 S.SUM）：同上 */
    USL._usbSum=true; }

  /* ======================= 第 4 節 8/15 迎新週第二天 ======================= */
  S.ORIENT_DAY='2028-08-15'; S.ORIENT_H=18;   /* 快轉跨過 8/15 18:00（那一天大半跳過了）＝跳完演 */
  S.orientDone=G=>done(G,'ev_usb_orient')||!!G.flags.USB_ORIENT;
  S.orientOn=(G,day)=>here(G)&&day===D(S.ORIENT_DAY)&&!S.orientDone(G);
  S.orientDue=function(G){ if(!here(G)||S.orientDone(G)) return false; const d=D(S.ORIENT_DAY);
    if(G.flags.USB_ORIENT_DUE) return G.day<=d+7;
    return G.day===d&&hh(G)>=7&&G.hour<24&&G.zone!=='us_apartment'&&inUS(G); };   /* 那天的第一次出門 */
  /* AA_450 1-3：上一次快轉跨過 8/15 18:00、還沒演就又快轉（快轉停在要回的訊息＝手機自動打開（story3d.js S.phoneAuto 在 STORY.TICKS 前面、E.paused），收起手機馬上又按快轉，
     中間沒有一格空下來的 tick——BB-B 的逐日劇本 8/14→8/18 21:00 停在她的私訊，到 8/21 跳完才演）：這一次快轉以前先演 */
  S.orientBeforeJump=async function(GM){ const G=GM&&GM.G; if(!G||!G.flags||!G.flags.USB_ORIENT_DUE||busy||!S.orientDue(G)||(typeof EVENTS!=='undefined'&&EVENTS.running)) return false;
    G.flags.USB_ORIENT_DUE=false; try{ await run('ev_usb_orient',{noTitle:true}); }catch(e){ console.warn('US_BLANK.orient',e); } return true; };
  if(USL.jump&&!USL._usbJump){ const j0=USL.jump; USL.jump=async function(GM){ const G=GM&&GM.G; await S.orientBeforeJump(GM); const tS=G?now(G):0; const r=await j0.apply(this,arguments);
      try{ const x=T(D(S.ORIENT_DAY),S.ORIENT_H); if(G&&here(G)&&!S.orientDone(G)&&tS<x&&now(G)>=x) G.flags.USB_ORIENT_DUE=true; }catch(e){ console.warn('US_BLANK.jump',e); }
      try{ const d=D(S.STUDY_DAY); if(G&&d!=null&&G.day===d&&Math.abs(G.hour-19.5)<0.01&&!G.flags.USB_STUDY_HINT&&S.studyDue(G)){ G.flags.USB_STUDY_HINT=G.day; GM.sceneBegin(); try{ await GM.say(null,S.STUDY_HINT); } finally{ GM.sceneEnd(); } if(GM.setGoal) GM.setGoal('會所的自習室還開著'); } }catch(e){ console.warn('US_BLANK.studyHint',e); }   /* 10/12 19:30 停點的提示（AA_483 第 3 節）*/
      return r; }; USL._usbJump=true; }

  /* ======================= 第 3-4 節 9/9 社區的洗衣間（交往中、還沒演 US2）======================= */
  S.LAUNDRY_DAY='2028-09-09';
  S.laundryOn=(G,day)=>here(G)&&dating(G)&&day===D(S.LAUNDRY_DAY)&&!done(G,'ev_usb_laundry');
  S.laundryDue=G=>false;   /* AA_424 第 7-1 節：不再是「上午去洗衣服才演」，改成 10:30 她私訊、11:00 在 214（S.laundryPhone、OUT.STAGE）*/
  S.laundryPhone=function(G){ const L=X.LAUNDRY, d=D(L.d), F=G.flags; if(d==null) return;
    if(S.laundryOn(G,d)&&now(G)>=T(d,L.ask)&&now(G)<T(d,L.h)&&!PHONE.sent(G,'usb_laundry_ask'))
      PHONE.at(G,d,G.day===d?Math.max(L.ask,G.hour):L.ask,[{th:'p:'+S5,from:S5,text:L.msg,ask:{id:'usb_laundry_ask',until:T(d,L.h),opts:[{t:L.yes,set:{USB_LAUNDRY:'go'}},{t:L.no,say:[{from:S5,text:L.noReply}],set:{USB_LAUNDRY:'no'}}]}}],'usb_laundry_ask');
    if(F.USB_LAUNDRY==='go'&&typeof OUT!=='undefined'&&!OUT.get(G,'usb_laundry')&&now(G)<T(d,L.h)+0.75)
      OUT.plan(G,{id:'usb_laundry',ev:'ev_usb_laundry',day:d,h:L.h,late:0.75,must:true,place:'你的公寓（214）',title:'她來借洗衣機',travel:'',travelH:0}); };
  S.isLaundryDoor=(it,G)=>!!it&&!!G&&G.zone==='us_apartment'&&!!it.look&&it.label==='洗衣機';   /* us3d.js 的關著的門（配置 doors 的 laundry，label「洗衣機」）*/
  S.laundry=async function(GM,it){ const G=GM.G; let k=1;
    GM.sceneBegin(); try{ k=await GM.choose([{t:'洗衣服',hint:'40 分鐘'},{t:'只看看'}]); } finally { GM.sceneEnd(); }
    if(k!==0){ const t=(USL.look&&USL.look(G,'us_apartment','laundry'))||(typeof it.look==='string'?it.look:''); if(t) GM.caption('',t,4600); return true; }   /* 「看」的字照 AA_287 */
    if(S.laundryDue(G)){ GM.sceneBegin(); try{ await run('ev_usb_laundry',{noTitle:true}); if(GM.fade) await GM.fade(true); GM.advance(40/60); if(GM.fade) await GM.fade(false); } finally { GM.sceneEnd(); }
      if(GM.autosave) GM.autosave(); return true; }
    GM.sceneBegin(); try{ if(GM.fade) await GM.fade(true); GM.advance(40/60); if(GM.fade) await GM.fade(false); } finally { GM.sceneEnd(); }
    if(GM.toast) GM.toast('衣服洗好了。',2400); return true; };
  if(STORY.interact&&!STORY._usbInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G; if(G&&here(G)&&S.isLaundryDoor(it,G)) return S.laundry(GM,it); return o0.apply(this,arguments); }; STORY._usbInteract=true; }

  /* ======================= 第 2-2 節 10/12 挽回中，會所自習室 ======================= */
  S.STUDY_DAY='2028-10-12';
  S.studyOn=(G,day)=>here(G)&&!dating(G)&&day===D(S.STUDY_DAY)&&!done(G,'ev_usb_fb_study');
  S.studyDue=G=>S.studyOn(G,G.day)&&!!USL.sisClub&&USL.sisClub(G);   /* 她週二、四晚上本來就在（10 月起 19～21）*/
  /* 10/12 19:30 快轉停下來只有日期卡、看不出她在會所（BB-C 10-27 BB_218，US-BLANK-1012-HINT-1027）：AA_483 第 3 節（企劃線 187584ca8）定句，只在 S.studyDue 時出這句旁白；
     HUD 目標「會所的自習室還開著」（LAWWW 定）。接在上面包住 USL.jump 的那一段（停在 10/12 19:30 這一點才演，只一次：USB_STUDY_HINT）*/
  S.STUDY_HINT='（秋假的社區很安靜。窗外，會所自習室的燈還亮著。）';
  /* 會所的選單（同 USL.club）：選「讀書」進自習室＝先演這一場，再選讀多久（何俊朗秋假不在，AA_370 L4；她「抬頭看了你一眼」那句由這一場取代）*/
  S.club=async function(GM){ const G=GM.G; let k=1; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg('us_club_study')}); GM.caption('','會所',2000); { const lk=USL.look?USL.look(G,'us_outside','club'):null; if(lk) await GM.say(null,lk); }
      const sp=typeof CLS!=='undefined'&&CLS.slotPlan?CLS.slotPlan(G,1,'study'):{ok:true,hint:''}; k=await GM.choose([{t:'讀書',hint:sp.ok?'自習室。選讀多久（1～3 小時只算一次）。'+sp.hint:sp.why,dim:!sp.ok},{t:'離開'}]);
      if(k===0&&!sp.ok){ GM.toast(sp.why,3000); k=1; }
      if(k===0){ await run('ev_usb_fb_study',{noTitle:true}); if(typeof ADV!=='undefined'&&!ADV.active) ADV.begin({background:bg('us_club_study')});
        const L=typeof CLS!=='undefined'&&CLS.chooseStudy?await CLS.chooseStudy(GM):{hours:1,uses:[]}; if(L){ await GM.studySession(false,L.hours); if(typeof CLS!=='undefined'){ if(CLS.slotUse) CLS.slotUse(G,L.uses); if(CLS.queueJump) CLS.queueJump(G); } } } }
    finally{ if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    return true; };
  if(USL.club&&!USL._usbClub){ const c0=USL.club; USL.club=function(GM){ if(GM&&GM.G&&S.studyDue(GM.G)) return S.club(GM); return c0.apply(this,arguments); }; USL._usbClub=true; }

  /* ======================= 快轉的停點（包住 USL.nextStop）：9/9 11:00 洗衣間、10/12 19:30 自習室（同 208 的週末：到那裡才演的事，快轉停在開始的時候）======================= */
  S.stops=G=>{ const out=[]; { const d=D(S.LAUNDRY_DAY); if(d!=null&&S.laundryOn(G,d)) out.push(T(d,X.LAUNDRY.ask)); }   /* 9/9 10:30 她的私訊 */ { const d=D(S.STUDY_DAY); if(d!=null&&S.studyOn(G,d)) out.push(T(d,19.5)); } return out; };
  if(USL.nextStop&&!USL._usbStop){ const n0=USL.nextStop; USL.nextStop=function(G,t0){ let best=n0.apply(this,arguments); if(!G||!G.flags) return best;
      for(const x of S.stops(G)) if(x>t0+1e-6&&(best==null||x<best)) best=x; return best; }; USL._usbStop=true; }

  /* ======================= 3D 的出遊：竹葉亞洲超市、法學院圖書館（OUT.STAGE：演之前換到那個區域，畫面用模糊的 3D）======================= */
  S.STAGES={ev_usb_asian:{zone:'us_asian_market'},ev_usb_syllabus:{zone:'us_lawlib',sisSeat:3,mySeat:0},ev_usb_laundry:{zone:'us_apartment'}};   /* 9/9：她站在 214 門口（AA_424 第 7-1 節）*/   /* 圖書館：中庭第一張長閱覽桌，她和你對面（同 USL.sisSync 的位子）*/
  S.staged=null;
  S.stage=async function(GM,q,ev){ const cfg=ev&&S.STAGES[ev.id]; if(!cfg) return null; const G=GM.G, E=GM.E, P=E&&E.player;
    if(!G||!P||!P.obj||!GM.enter||!here(G)||P.riding||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[cfg.zone]||!Z3.ZONES[G.zone]) return null;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0};
    if(P.seat&&GM.standUp) GM.standUp(P);
    const sp=Object.assign({x:0,z:2,yaw:Math.PI},(typeof US3!=='undefined'&&US3.SPAWN&&US3.SPAWN[cfg.zone])||{});
    await GM.enter(cfg.zone,{x:sp.x,z:sp.z,yaw:sp.yaw||0},{noFade:true,deferStory:true,noAutosave:true}); S.staged=ev.id;
    try{ const st=(GM.E&&GM.E.zone&&GM.E.zone.seats)||[], ss=cfg.sisSeat!=null?st[cfg.sisSeat]:null, ms=cfg.mySeat!=null?st[cfg.mySeat]:null;
      if(GM.npc&&GM.npc[S5]&&GM.removeNPC) GM.removeNPC(S5);
      let n=null; if(GM.spawnCharacter){ if(ss) n=GM.spawnCharacter(S5,ss.x,ss.z,{seat:ss,pose:'read'});
        else { const x=sp.x+Math.sin(sp.yaw||0)*1.2, z=sp.z+Math.cos(sp.yaw||0)*1.2; n=GM.spawnCharacter(S5,x,z,{yaw:Math.atan2(sp.x-x,sp.z-z),pose:'idle'}); } }   /* 竹葉：進門往裡 1.2 m、面向你 */
      if(n){ n.idlePose=n.pose; n.frozen=true; n.usbStage=true; }
      if(ms&&GM.sitAt) GM.sitAt(P,ms); else if(n&&n.obj&&GM.face) GM.face(P,n.obj.position.x,n.obj.position.z); }
    catch(e){ console.warn('US_BLANK.stage',e); }
    let fin=false;
    return {restore:async()=>{ if(fin) return; fin=true; S.staged=null; if(P.seat&&GM.standUp) GM.standUp(P);
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.STAGE)&&!OUT._usbStage){ OUT.STAGE.push(S.stage); OUT._usbStage=true; }

  /* ======================= AA_412 3-2 滷肉：有 US_ASIAN_MARKET 的開頭多一句旁白 ======================= */
  S.patchLurou=function(){ const e=evOf('ev_us208_lurou'); if(!e||!Array.isArray(e.dialogue)||e.usbPatched) return false;
    const i=e.dialogue.findIndex(l=>!!l&&l.speaker===null&&typeof l.text==='string'&&!l.if&&!l.unless);   /* 第一句沒有條件的旁白：前面那一句有條件的（us208_3d.js 七場共用的 BOWL，AA_516 第 8 節第 1 點）不算 */
    e.dialogue.splice(i<0?1:i+1,0,{if:{custom:()=>has(S5,'US_ASIAN_MARKET')},speaker:null,text:X.LUROU_EXTRA}); e.usbPatched=true; return true; };   /* 第一句「（還沒進門就聞到了。醬油、八角，還有一點焦味。）」的下一句 */
  S.patchLurou();

  /* ======================= 每 0.5 秒（STORY.TICKS）：8/15 的摘要 ======================= */
  let busy=false; const go=fn=>{ busy=true; Promise.resolve().then(fn).catch(e=>console.warn('US_BLANK',e)).finally(()=>{ busy=false; }); return true; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['us_blank3d:busy']=()=>{ busy=false; S.staged=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.isBusy=()=>busy;
  const free=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof ADV!=='undefined'&&ADV.active)&&!GM.titleIdle; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||!here(G)||!free(GM)) return false;
    if(S.orientDue(G)){ G.flags.USB_ORIENT_DUE=false; return go(()=>run('ev_usb_orient',{noTitle:true})); }
    return false; };

  /* ======================= 給 BB_301 的工具（us_sweep61.js）：那一天有哪些「到那裡／那個時候才演」的（不是手機、不是日期卡、不是出遊）======================= */
  S.scenesOn=function(G,day){ const out=[];
    if(S.orientOn(G,day)) out.push('8/15 迎新週的摘要（那天第一次出門，或快轉跳過）');
    if(S.studyOn(G,day)) out.push('19:00～21:00 會所自習室（她在；去讀書才演）');
    return out; };

  STORY.PHONE_RULES.push(G=>S.phone(G));
  STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
  /* AA 稿沒有、照實補的（回報 AA）*/
  S.GAPS=['六個新記憶的面板名稱（social3d.js MEMORY_LABEL）：AA_424 沒有寫，照台詞暫定',
    '「洗衣服」：us_apartment 原本沒有這個互動點——做在公寓「洗衣機」那裡（洗衣服／只看看）；9/9 那一場的背景是模糊的 3D＋「社區的洗衣間」（沒有洗衣間的 2D 圖）',
    '群組裡「她按了一個讚」「她已讀了」：寫成群組裡的旁白「（她按了一個讚。）」「（她已讀了。）」'];
  return S;
})();
