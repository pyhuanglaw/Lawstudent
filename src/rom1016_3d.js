/* ===== PLAN-1016-ROM 剩下的四件（BB_165，企劃線 a54ec2b4a；事件與台詞在 src/data/rom1016_events.js）=====
   一、芷若 3-1「你點的那一杯」（ev_zhiruo_his_order）：大三下（Y3S2）、Z13 還沒發生，Z13 的條件到齊（r2y3b3d.js 的 z13Ready＋學期末心意邀約的條件 TERMEND.cond，
       AA_326 2-Y3-46 第 1 節）、有 ZR_GAVE_HER_ORDER（Z11 選「有一點」，y34b3d.js）、她在吧檯上班：和她說話（點餐）時多一個選項「（點一杯熱可可加濃縮）」；
       不選＝照平常點（她的點餐事件或吧檯的點餐單）。演完：交往（照 Z13 的交往，R2Y3B.romStart）、ZR_HE_ORDERED；Z13 不再觸發。
       「（照平常點）」是介面字（同 Z1 的「（就這樣）」），不是台詞。
   二、沛珊 5-1「被等的感覺」（ev_peishan_waited）：交往中、她在台南、祐廷在台灣：2027-11-17（三）23:10 私訊（有選項）→ 答應＝11/19（五）坐高鐵去台南
       （AA_282 第 3 節：同 hometown3d.js 去台南的車程、票錢 2,700），18:40 到課輔班門口；18:45 還沒到＝19:10 她傳兩則、改到 11/26（五）同一個時間；
       第二次也沒到＝當晚 21:00 她傳兩則，也記 PS_WAITED。這週可能不行＝不演、不記。
   三、沛珊 5-2「她的紅筆」（ev_peishan_red_pen）：交往中、她在台南、祐廷在台灣（美國路線 2028-08～12 在國外＝沒有這一場）：2028-11-15（三）23:00 私訊 →
       11/17（五）19:30 她學校後門的咖啡店；19:45 還沒到＝21:00 她傳照片和兩則，下一次當面的私下約（去台南、台中；台南的學期末飯、公開課）送上車以前演短版、記 PS_RED_PEN。
   四、可昕 K7 第一年週年卡片的後面幾頁（第 9 節）：宿舍房間物件「她的週年卡片」（story3d.js 的 roomItemList，K7 第一年去了才有）多一個「翻後面幾頁」，
       翻完記 KX_CARD_READ（只是紀錄）。第 5 頁照 7/24 的選擇（KH_GO 'bus'＝客運版，其他＝在家查的版本）。
   沒做（不在這個檔）：PS_WAITED 尾聲多一句、PS_RED_PEN 之後每月摘要日的照片（摘要日 SYS-08 還沒有）、5-2 短版的視訊那一種、可昕沒去 K7 的人下一次見面拿到卡片
   （AA_313 2-3 A 已經改成「卡片我寫好了。我自己帶回去。」＋隔天中午的照片）；AA_438 第 2 節：之後第一次當面見面照 BB_165 第 9 節給卡片，給了房間才有。
   接線：EVENTS.onInteract（芷若）、STORY.PHONE_RULES（兩封邀約、改期）、OUT.AFTER（短版）、STORY.ROOM_EXTRA（卡片）。測試：node tests/rom1016_unit.js */
'use strict';
const ROM1016=(function(){
  const S={}, ZR='heroine_02', PS='classmate_peishan';
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const EV=()=>typeof ROM1016_EVENTS!=='undefined'?ROM1016_EVENTS:null;
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]);
  const paused=(G,id)=>{ if(typeof ROM==='undefined'||!ROM.get) return false; const R=ROM.get(G,id); return !!R&&R.status==='paused'; };
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const law=G=>(G.stage||'law')==='law';
  const abroadOn=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(Object.assign({},G,{day}));
  const inTainan=(G,id,day)=>typeof DATE!=='undefined'&&!!DATE.whereOn&&(DATE.whereOn(G,id,day)||{}).city==='台南';
  const TN=()=>(typeof HOMETOWN_LINES!=='undefined'&&HOMETOWN_LINES[PS+'@台南'])||{travel:'高鐵約一小時四十分鐘',travelH:1.75,fare:2700};
  const P_=(t,from)=>({th:'p:'+PS,from:from||PS,text:t});
  let gm=null; S.gm=()=>gm||(typeof GAME!=='undefined'?GAME:null);
  if(typeof EVENTS!=='undefined'&&EVENTS.bind&&!EVENTS._rom1016b){ const b0=EVENTS.bind; EVENTS.bind=function(x){ gm=x; return b0.apply(this,arguments); }; EVENTS._rom1016b=true; }

  /* ===================== 一、芷若 3-1 你點的那一杯 ===================== */
  const R2=()=>typeof R2Y3B!=='undefined'?R2Y3B:null;
  S.onShift=GM=>{ const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(ZR):null; return !!(n&&n.staff==='cafe'&&!n.leaving); };
  S.hisOrderDue=function(G,GM){ if(!G||!G.flags||!law(G)||G.zone!=='cafe') return false; const F=G.flags;
    if(done(G,'ev_zhiruo_his_order')||F.ZR_HE_ORDERED||F.ZR_CUP!=null||dating(G,ZR)||!F.ZR_GAVE_HER_ORDER) return false;
    const x=R2(); if(!x||!x.z13Ready||!x.z13Ready(G)) return false;   /* Z13 的七環（拿掉作廢的兩環）*/
    if(!S.hisWindow(G,x)) return false;   /* 大三下、只在她的學期末心意邀約窗口（6/8～6/18：學期最後一天以後 termOf 是 null，所以不看 termOf）（AA_438 第 1 節：告白只在學期末，他點她的點法就是告白）*/
    if(typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,ZR)) return false;
    if(typeof TERMEND==='undefined'||!TERMEND.cond) return false; const c=TERMEND.cond(G,ZR); if(!c.ok||c.decline) return false;   /* 心意邀約的條件（她的戀愛 ≥30、4 次正式校外約會含心願 D05、她當時願意）*/
    if(TERMEND.knownOthers&&TERMEND.knownOthers(G,ZR).length) return false;   /* AA_474 3b：她知道祐廷正在和別人交往＝這學期不演 Z13 特別版（這一杯也是），改走一般的知情版心意邀約 */
    return GM?S.onShift(GM):true; };
  /* 窗口：大三下學期末（TERMEND.window＝Y3S2，6/8 起）到 Z13 那頓飯（排好的話＝那天 22:00）以前；Z13 沒排（條件不到、她不約）就到窗口結束 */
  S.hisWindow=function(G,x){ const w=typeof TERMEND!=='undefined'&&TERMEND.window?TERMEND.window(G):null; if(!w||w.id!=='Y3S2') return false;
    const q=x&&x.z13Out?x.z13Out(G):null; if(q&&(q.arrived||q.state!=='planned'||now(G)>=T(q.day,22))) return false; return true; };
  S.HIS_OPT='（點一杯熱可可加濃縮）'; S.NORMAL_OPT='（照平常點）'; S.PRICE=120;
  S.hisOrderOffer=async function(GM){ const G=GM.G; let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:S.HIS_OPT,hint:S.PRICE+' 元',dim:(G.money|0)<S.PRICE},{t:S.NORMAL_OPT}]); } finally { GM.sceneEnd(); }
    if(k===0&&(G.money|0)<S.PRICE){ if(GM.toast) GM.toast('錢不夠'); k=1; }
    if(k===0){ const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_zhiruo_his_order'):null; if(ev&&typeof EVENTS!=='undefined'){ await EVENTS.run(ev); return 'order'; } }
    if(!(S._oi&&S._oi.call(EVENTS,ZR))&&typeof STORY!=='undefined'&&STORY.interact) await STORY.interact({counter:'cafe'},GM);   /* 照平常點：她的點餐事件（Z1），沒有就是吧檯的點餐單 */
    return 'normal'; };
  S.hisOrderStart=function(G){ const x=R2(); const ok=x&&x.romStart?x.romStart(G,ZR):(typeof ROM!=='undefined'&&ROM.start?ROM.start(G,ZR):(G.flags['dating_'+ZR]=true));   /* 照 Z13 的交往（OPEN_OK、confessed）*/
    if(ok&&typeof TERMEND!=='undefined'&&TERMEND.rec){ const R=TERMEND.rec(G); if(R&&R.think) delete R.think[ZR]; }
    if(ok){ const x=R2(), q=x&&x.z13Out?x.z13Out(G):null; if(q&&q.state==='planned'){ q.state='skipped'; q.arrived=true; } }   /* Z13 那頓飯已經排了：不再演（她已經知道了）*/
    return ok; };
  if(typeof EVENTS!=='undefined'&&EVENTS.onInteract&&!EVENTS._rom1016){ const oi=EVENTS.onInteract; S._oi=oi; let busy=false;
    (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['rom1016_3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
    EVENTS.onInteract=function(charId){ try{ const GM=S.gm(); if(charId===ZR&&!busy&&GM&&GM.G&&S.hisOrderDue(GM.G,GM)){ busy=true; S.hisOrderOffer(GM).catch(e=>console.warn('ROM1016 hisOrder',e)).finally(()=>{ busy=false; }); return true; } }catch(e){ console.warn('ROM1016 onInteract',e); }
      return oi.apply(this,arguments); };
    EVENTS._rom1016=true; }

  /* ===================== 二、三、沛珊 5-1、5-2（台南）===================== */
  S.WAITED={ask:'2027-11-17',askH:23+10/60,day:'2027-11-19',retry:'2027-11-26',h:18+40/60,missBy:18.75,miss1H:19+10/60,miss2H:21};
  S.RED_PEN={ask:'2028-11-15',askH:23,day:'2028-11-17',h:19.5,missBy:19.75,missH:21};
  /* 那一天約得到：交往中（不是在等你說清楚）、她在台南、祐廷在台灣 */
  S.psOk=(G,day)=>law(G)&&dating(G,PS)&&!(G.flags&&G.flags.EX_classmate_peishan)&&!paused(G,PS)&&inTainan(G,PS,day)&&!abroadOn(G,day);
  /* 該出發的最後一刻＝晚到的界線減高鐵車程（OUT 的 late：約好的時間以後多久還能出發，這裡是負的）*/
  S.lateOf=(o)=>o.missBy-TN().travelH-o.h;
  S.plan=function(G,id,ev,day,o){ if(typeof OUT==='undefined'||!OUT.plan||day==null) return false; const C=TN();
    return OUT.plan(G,{id,ev,day,h:o.h,late:S.lateOf(o),place:'台南',title:'去台南找'+nm(PS),travel:C.travel,travelH:C.travelH,back:'回到臺北。'}); };
  const ask=(G,o,lines,yes,no,flag,tag)=>{ const d=DK(o.ask), dd=DK(o.day); if(d==null||dd==null) return false; const t=now(G), at=T(d,o.askH), last=T(dd,0)+o.missBy-TN().travelH;
    if(t<at-24||t>=last||PHONE.sent(G,tag)||G.flags[flag]!=null||!S.psOk(G,dd)) return false;   /* 前一天起才排（還在條件裡）；過了該出發的時間就不傳 */
    const items=lines.map(x=>P_(x)); items[items.length-1].ask={id:tag,until:last,opts:[{t:yes[0],set:{[flag]:'yes'},say:[{from:PS,text:yes[1]}]},{t:no[0],set:{[flag]:'no'},say:[{from:PS,text:no[1]}]}]};
    const [ad,ah]=t>at?[G.day,G.hour]:[d,o.askH]; return PHONE.at(G,ad,ah,items,tag); };
  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!EV()) return; const F=G.flags, M=EV().MSG;
    if(!F.PS_WAITED){ ask(G,S.WAITED,M.waitedAsk,M.waitedYes,M.waitedNo,'PS_WAITED_GO','ps_waited_ask');
      const dd=DK(S.WAITED.day); if(F.PS_WAITED_GO==='yes'&&dd!=null&&typeof OUT!=='undefined'&&!OUT.get(G,'ps_waited_1')&&now(G)<T(dd,0)+S.WAITED.missBy-TN().travelH) S.plan(G,'ps_waited_1','ev_peishan_waited',dd,S.WAITED); }
    if(!F.PS_RED_PEN&&!F.PS_RED_PEN_SHORT){ ask(G,S.RED_PEN,M.redPenAsk,M.redPenYes,M.redPenNo,'PS_RED_PEN_GO','ps_redpen_ask');
      const dd=DK(S.RED_PEN.day); if(F.PS_RED_PEN_GO==='yes'&&dd!=null&&typeof OUT!=='undefined'&&!OUT.get(G,'ps_redpen')&&now(G)<T(dd,0)+S.RED_PEN.missBy-TN().travelH) S.plan(G,'ps_redpen','ev_peishan_red_pen',dd,S.RED_PEN); } };
  /* 5-1 沒到：第一次＝19:10 兩則、改到下週五同一個時間；第二次＝21:00 兩則、記 PS_WAITED */
  S.waitedMissed=function(G,q){ const M=EV()&&EV().MSG; if(!M||typeof PHONE==='undefined') return; const d=q&&q.day!=null?q.day:G.day;
    if(q&&q.id==='ps_waited_1'){ PHONE.at(G,d,S.WAITED.miss1H,M.waitedMiss1.map(x=>P_(x)),'ps_waited_miss1'); const d2=DK(S.WAITED.retry); if(d2!=null&&S.psOk(G,d2)) S.plan(G,'ps_waited_2','ev_peishan_waited',d2,S.WAITED); return; }
    PHONE.at(G,d,S.WAITED.miss2H,M.waitedMiss2.map(x=>P_(x)),'ps_waited_miss2'); G.flags.PS_WAITED=true; };
  /* 5-2 沒到：21:00 照片和兩則；之後的短版 */
  S.redPenMissed=function(G,q){ const M=EV()&&EV().MSG; if(!M||typeof PHONE==='undefined') return; const d=q&&q.day!=null?q.day:G.day;
    PHONE.at(G,d,S.RED_PEN.missH,M.redPenMiss.map(x=>P_(x)),'ps_redpen_miss'); if(!G.flags.PS_RED_PEN) G.flags.PS_RED_PEN_SHORT=d; };
  S.fare=function(GM){ const C=TN(); if(C.fare&&GM&&GM.money) GM.money(-C.fare,'交通'); };   /* 高鐵來回（出發的時候付，同 hometown3d.js 去台南）*/
  S.ladder=async function(GM){ if(typeof HV!=='undefined'&&HV.ladder) return HV.ladder(GM,PS,'meet'); return false; };
  S.visit=function(G){ if(typeof DATE!=='undefined'&&DATE.countVisit&&typeof HV!=='undefined'&&HV.visitCounts&&HV.visitCounts(G,PS)) DATE.countVisit(G,PS,'台南'); };   /* 去台南那一天＝一次正式校外約會（AA_349 K3，同 hometown3d.js）*/
  /* 短版：下一次當面的私下約（OUT.AFTER，送上車以前）*/
  S.faceMeet=q=>!!q&&((q.hv&&q.hv.id===PS)||(typeof HV!=='undefined'&&HV.LADDER_OUTINGS&&HV.LADDER_OUTINGS[PS]&&HV.LADDER_OUTINGS[PS](q)));
  S.redPenShort=async function(GM,q){ const G=GM.G, F=G.flags; if(F.PS_RED_PEN||F.PS_RED_PEN_SHORT==null||!S.faceMeet(q)||!EV()) return false; if(q.day!=null&&q.day<=F.PS_RED_PEN_SHORT) return false;
    const me={name:nm(PS),charId:PS}; for(const x of EV().RED_PEN_SHORT){ if(x.narr) await GM.say(null,x.narr); else await GM.say(me,x.text); }
    F.PS_RED_PEN=true; delete F.PS_RED_PEN_SHORT; return true; };
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.AFTER)&&!OUT._rom1016){ OUT.AFTER.push(async(GM,q)=>{ try{ await S.redPenShort(GM,q); }catch(e){ console.warn('ROM1016 redPenShort',e); } }); OUT._rom1016=true; }

  /* ===================== 四、可昕 K7 第一年週年卡片的後面幾頁 ===================== */
  S.CARD='她的週年卡片'; S.FLIP_OPT='翻後面幾頁'; S.CLOSE_OPT='不看了';
  S.pages=function(G){ const P=EV()&&EV().PAGES; if(!P) return []; return [P.p2,P.p3,P.p4,(G.flags&&G.flags.KH_GO==='bus')?P.p5bus:P.p5home,P.last,P.blank]; };
  S.readCard=async function(GM,first){ const G=GM.G; for(const t of [].concat(first||[])) await GM.say(null,t);
    const k=await GM.choose([{t:S.FLIP_OPT},{t:S.CLOSE_OPT}]); if(k!==0) return false;
    for(const t of S.pages(G)) await GM.say(null,t); G.flags.KX_CARD_READ=true; return true; };
  /* 週年那天沒去（KX_ANNIV[n]='missed'）：當晚 21:00 的電話、隔天的照片照舊（AA_313 2-3 A）；之後第一次當面見面她把卡片給你（BB_165 第 9 節），
     給了以後房間才有第一年那張卡片（AA_438 第 2 節；第二年以後沒去的也一樣當面給，房間只有第一年那張）。記 KX_CARD_GIVEN {n: 那一天} */
  S.GIVE=['你那天沒來。我還在氣。','卡片還是給你。後面的，回去再看。'];   /* BB_165 第 9 節（a54ec2b4a）*/
  S.cardDue=function(G){ const F=G&&G.flags; if(!F||!F.dating_kexin||!F.KX_ANNIV||typeof STORY==='undefined'||!STORY.KX_ANNIV_DAYS) return 0; const Gv=F.KX_CARD_GIVEN||{};
    for(const n of [1,2,3,4,5]){ if(F.KX_ANNIV[n]!=='missed'||Gv[n]) continue; const an=DK(STORY.KX_ANNIV_DAYS[n]); if(an!=null&&G.day>an) return n; } return 0; };
  S.cardGive=async function(GM){ const G=GM.G, n=S.cardDue(G); if(!n) return false; const me={name:nm('kexin'),charId:'kexin'};
    G.flags.KX_CARD_GIVEN=Object.assign({},G.flags.KX_CARD_GIVEN||{},{[n]:G.day}); for(const t of S.GIVE) await GM.say(me,t); return true; };
  /* 當面：和她的出遊（視訊不算）、在 3D 裡跟她說話 */
  const tripWho=(G,id)=>{ const t=id!=null&&G&&Array.isArray(G.trips)?G.trips.find(x=>x.trip===id):null; return t?t.who:null; };   /* 校外約會的 OUT 記行程 id（dateTrip），人在 G.trips */
  S.kxFace=(q,G)=>!!q&&q.place!=='視訊'&&!!((q.dateTrip!=null&&tripWho(G,q.dateTrip)==='kexin')||/^ev_(kexin|kx)_/.test(q.ev||'')||(q.te&&q.te.who==='kexin')||(q.hv&&q.hv.id==='kexin'));
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.AFTER)&&!OUT._rom1016k){ OUT.AFTER.push(async(GM,q)=>{ try{ if(S.kxFace(q,GM.G)) await S.cardGive(GM); }catch(e){ console.warn('ROM1016 cardGive',e); } }); OUT._rom1016k=true; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PRE_TALK)&&!STORY._rom1016t){ STORY.PRE_TALK.push(async(GM,who,id)=>{ if(id==='kexin') await S.cardGive(GM); }); STORY._rom1016t=true; }
  S.CARD_FIRST='那天在最高的地方，你說在一起吧。我說好。';   /* 第一頁（story3d.js S.roomItemList 那一句，AA_303 第 2 節 9）*/
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.ROOM_EXTRA)&&!STORY._rom1016r){ STORY.ROOM_EXTRA.push((G,L)=>{ let i=L.findIndex(r=>r&&r[0]===S.CARD);
      if(i<0){ const F=G.flags||{}; if(F.KX_ANNIV&&F.KX_ANNIV[1]==='missed'&&F.KX_CARD_GIVEN&&F.KX_CARD_GIVEN[1]){ L.push([S.CARD,S.CARD_FIRST]); i=L.length-1; } }   /* 沒去、之後當面給了 */
      if(i<0||typeof L[i][2]==='function') return; const first=L[i][1]; L[i]=[S.CARD,first,GM=>S.readCard(GM,first)]; }); STORY._rom1016r=true; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._rom1016p){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._rom1016p=true; }
  return S;
})();
