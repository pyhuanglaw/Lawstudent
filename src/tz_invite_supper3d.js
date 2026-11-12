/* ===== 汀州路兩間店可以約人＋泡麵帶回 203 當宵夜（TZ-INVITE-SUPPER-1112；SHOP-STANDARD-BACKFILL-1112：店面標準第 5 點「可以當約人的地點的排進邀約地點」）=====
   字：src/data/tz_invite_supper.js（TZ_INVITE_SUPPER；tools/story/import_tz_invite_supper.py 從 AA_851 匯入，企劃線 b039356f5，AA 定稿、BB_397 聽過）——這支不寫任何台詞。
   ■ 約去越好吃小館（tz_yuehaochi）、客居雲南（tz_keju）：照洋洋鹹酥雞、泰米村食那一套（src/data/invites.js 的 places＋people[人].acc）。
     - 吃飯那一類（meal）、有點熟以上（FAMILIAR）；時間照店的營業時間（hoursFrom：src/data/places.js 那一區，每天 11:00～21:00）；不用先自己去過（和洋洋、泰米一樣，稿沒有寫）。
     - 答應的那一句：七位各一句（people[人].acc[店]）；沒列的人照一般的。不答應照一般回覆表。
     - 兩個人坐下以後的那一句（稿的 at_table，每人一句）：INV.seatOpenLines 先問這裡（S.tableLine）；學姊分兩版——好朋友以上（很熟）或交往中＝heroine_05_close，其他＝heroine_05。
       沒有自己句子的人＝照吃飯那一類一般的開場句（seatOpen.byPlace＝meal）。座位用店裡現有的（GG3.attach 補的 zone.seats）。
   ■ 泡麵宵夜（稿 dorm_supper）：「物品」裡有東南大聯的「泡麵（五包裝）」（G.flags.GG3_OWN.tz_dongnan.tz_dn_noodle5）、晚上 21:00 以後人在 203、
     大一 203 四人房的學期（DORM203.era：8/29～6/14，而且那一天在學期裡）、阿哲、柏翰、阿凱照作息都在房間（正在走進來的等他坐下，和 203 的六件小事同一個判斷）
     ＝自動演稿的那一場（STORY_EVENTS：一學期一個事件、各演一次＝一學期最多一次）；演完那一袋用掉（份數 −1）。沒有別的效果（現有 3-3 宵夜也只有那一場的字和旗標）。
   存檔：只多事件演過的紀錄（G.events.done 現有的做法）；物品照現有的 GG3_OWN。舊存檔沒有＝沒買過泡麵，不會演。
   測試：node tests/tz_invite_supper_unit.js */
'use strict';
const TZIS=(function(){
  const S={};
  const X=()=>typeof TZ_INVITE_SUPPER!=='undefined'?TZ_INVITE_SUPPER:null;
  S.SIS='heroine_05'; S.CLOSE='heroine_05_close';
  S.STAY=0.75;   /* 和洋洋、泰米、Daybreak 一樣 */
  const placeOf=pid=>{ const d=X(); return d?d.places.find(p=>p.id===pid)||null:null; };

  /* ---------- 邀約地點 ---------- */
  S.registerInvite=function(){ const d=X(); if(!d||typeof INVITE_DATA==='undefined'||!Array.isArray(INVITE_DATA.places)) return 0; let n=0;
    const PP=INVITE_DATA.people||(INVITE_DATA.people={}), SO=INVITE_DATA.seatOpen;
    for(const p of d.places){
      if(!INVITE_DATA.places.some(q=>q&&q.id===p.id)){ INVITE_DATA.places.push({id:p.id,zone:p.zone,name:p.name,verb:p.verb,kind:p.kind,minStage:p.minStage,stay:S.STAY,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],hoursFrom:p.zone}); n++; }
      for(const id in p.accept){ const q=PP[id]||(PP[id]={}); (q.acc||(q.acc={}))[p.id]=[p.accept[id]]; }
      if(SO&&SO.byPlace&&!SO.byPlace[p.id]) SO.byPlace[p.id]='meal'; }   /* 沒有自己入座句的人＝吃飯那一類一般的開場句 */
    return n; };
  S.registerInvite();
  /* 很熟以上（好朋友、之後的每一階）或交往中 */
  S.close=function(G,id){ const F=(G&&G.flags)||{}; if(F['dating_'+id]===true||(F.romance&&F.romance[id]&&F.romance[id].status==='dating')) return true;
    if(typeof SOCIAL==='undefined'||!SOCIAL.stage||!SOCIAL.STAGES) return false; const L=SOCIAL.STAGES, st=typeof INV!=='undefined'&&INV.stageOf?INV.stageOf(G,id):SOCIAL.stage(id);
    return L.indexOf(st)>=L.indexOf('CLOSE_FRIEND')||(!!SOCIAL.friendLevel&&SOCIAL.friendLevel(id)==='CLOSE_FRIEND'); };
  S.tableLine=function(G,who,pid){ const p=placeOf(pid); if(!p) return null; const T=p.at_table; if(who===S.SIS&&T[S.CLOSE]&&S.close(G,who)) return T[S.CLOSE]; return T[who]||null; };
  if(typeof INV!=='undefined'&&INV.seatOpenLines&&!INV._tzis){ INV._tzis=true; const s0=INV.seatOpenLines;
    INV.seatOpenLines=async function(GM,iv,who,P){ const t=P&&iv&&!P.scene&&!P.ownMeal?S.tableLine(GM.G,iv.who,P.id):null; if(t){ await INV.playLines(GM,who,[t]); return true; } return s0.apply(this,arguments); }; }

  /* ---------- 泡麵宵夜 ---------- */
  S.TERMS=['Y1S1','Y1S2']; S.T=[21,24]; S.MATES=['zhe','classmate_bohan','kai'];
  S.evId=t=>'ev_tzis_supper_'+t;
  const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  S.packs=function(G){ const d=X(), R=G&&G.flags&&G.flags.GG3_OWN, r=d&&isObj(R)?R[d.supper.shop]:null; return isObj(r)?Math.max(0,r[d.supper.item]|0):0; };
  S.usePack=function(G){ const d=X(), r=G.flags.GG3_OWN[d.supper.shop]; r[d.supper.item]=(r[d.supper.item]|0)-1; if(r[d.supper.item]<=0) delete r[d.supper.item]; };
  S.due=function(G,GM,term){ if(!G||!X()||G.zone!=='dorm'||typeof DORM203==='undefined'||!DORM203.era||!DORM203.allIn||!DORM203.era(G)) return false;
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; if(!t||t.id!==term) return false;
    const h=(((+G.hour||0)%24)+24)%24; if(h<S.T[0]||h>=S.T[1]) return false; if(S.packs(G)<1) return false; if(!DORM203.allIn(G,S.MATES,G.day,G.hour)) return false;
    for(const id of S.MATES){ const n=GM&&GM.npc&&GM.npc[id]; if(n&&n.dormGo!=null) return false; }   /* 正在走進來：等他坐下 */
    return true; };
  if(typeof STORY_EVENTS!=='undefined'&&X()) for(const term of S.TERMS){ const id=S.evId(term); if(STORY_EVENTS.some(e=>e.id===id)) continue;
    STORY_EVENTS.push({ id, title:'203 泡麵宵夜', participants:S.MATES.slice(), location:'dorm', trigger:'auto', once:true, background:'blur', portraitLater:true, time:S.T.slice(), stage:'law',
      prereq:{custom:(G,GM)=>S.due(G,GM,term)}, dialogue:X().supper.scene.map(l=>({speaker:l.who,text:l.text})),
      after:G=>{ if(S.packs(G)>0) S.usePack(G); } }); }   /* 演完那一袋就用掉 */
  return S;
})();
if(typeof module!=='undefined') module.exports=TZIS;
