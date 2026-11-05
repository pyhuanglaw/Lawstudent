/* ===== 阿哲「宵夜？大口漢堡」（AA_621 第 3 節；AA_705 補「回 LAWWW-C 10:06」第 2 點，企劃線 2c62cdf1e，AA-C 定 D109；任務 SHOP-NAMED-NPC-1105）=====
   稿（AA_705 2c62cdf1e）：和 AA_614 第 3 節第 1 列分開，不做「輪流」（那一列是 AA614-CLASSMATE-JOBS-1103，這裡不做）：
   - 每學期一次：第 11 週週五 22:30（考試週以外；認識阿哲；人在臺北）。大一上～大四下。
   - 私訊（阿哲，不打句號，AA_477）：「宵夜？大口漢堡」
   - 選項：「好。」→ 23:00 大口漢堡一樓（出遊，可以錯過）：（阿哲已經點好了，托盤上兩份雞塊。）阿哲：我先點了。你的我用猜的。／「今天不了。」→ 阿哲：「OK 下次」
   - 明軒那兩句不要。
   句子在 src/data/shop_npc.js 的 SHOP_NPC.zheDakou（一字照抄）。
   做法照阿凱的週日宵夜（story3d.js 的 phoneRules：PHONE.at＋ask、選項 set 旗標 → OUT.plan → 2D 出遊 ev_kai_sunday_supper）和明軒的桌遊夜（src/bgnight3d.js：STORY.PHONE_RULES、STORY_EVENTS.push）：
   - S.phone（STORY.PHONE_RULES）：那一學期第 11 週週五 22:30～23:00 之間（S.H_MSG～S.H_OUT）第一次算到、條件都成立＝傳那一則（PHONE.at，tag zhe_dk_<學期>；同一個 tag 只傳一次＝每學期一次）。
     條件（S.cond）：法律系（G.stage law）、這一天是那一學期第 11 週週五、不是考試週（term.exam）、認識阿哲（STORY.knows）、有阿哲的聯絡方式（INV.hasContact；開場就有）、
       祐廷人在臺北（S.away：交換出國 STORY.abroad、美國 EXCH.inUS、日本 JP.inJapan、寒暑假出國途中 STORY.tzOffset≠0 都不算）、阿哲那一天人在（STORY.presence）、
       23:00 祐廷沒有別的約（S.busy：INV.mineAt 的邀約、校外約會、自己的考試，和 OUT 裡還沒結束、時間重疊的出遊）。條件不成立＝這學期不傳（過了 23:00 就不補）。
     傳了就記 G.flags.ZHE_DK[學期]＝那一天（舊存檔沒有＝這學期還沒傳）。
   - 回「好。」＝G.flags.ZHE_DK_GO＝那一天 → 下一次 S.phone 排出遊（OUT.plan，id zhe_dk_<學期>，23:00、可以晚到 30 分鐘、走路 約 10 分鐘）；那時候 23:00 已經有別的約（回覆前才排的）＝不排，
     系統字照 INV 的「那個時間你已經約了別人。」。「今天不了。」＝阿哲「OK 下次」（PHONE 的 say）。回覆期限：23:30（最晚能出發的時間）。沒回、不去、過了時間＝錯過，不扣分。
   - 出遊（S.EVENT，ev_zhe_dakou_supper，2D，0.5 小時）：地點字幕「新生南路・大口漢堡」（遊戲裡已有的店名）→ 旁白一句 → 阿哲一句。
     OUT.STAGE：換到大口漢堡一樓（xs_dakou）的雙人桌演，阿哲坐在桌子北邊、祐廷坐對面，畫面用模糊的 3D（同 src/b1story3d.js 的考古題小組）；演完回到原本的地方。
     換不了（區域沒載入、在家出發、騎車、有人同行）＝深色底照樣演。
   存檔：G.flags.ZHE_DK＝{學期:那一天}、G.flags.ZHE_DK_GO＝回「好。」的那一天；出遊照 G.outings。舊存檔沒有＝從現在的學期開始照常。
   測試：node tests/zhe_dakou_msg_unit.js */
'use strict';
const ZHEDK=(function(){
  const S={}, ZHE='zhe', TH='p:zhe', Z='xs_dakou';
  S.EV='ev_zhe_dakou_supper'; S.WEEK=11; S.WD=5; S.H_MSG=22.5; S.H_OUT=23; S.LATE=0.5; S.HOURS=0.5;
  S.TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.PLACE='大口漢堡'; S.TITLE='宵夜（阿哲）'; S.TRAVEL='走路 約 10 分鐘'; S.TRAVEL_H=1/6; S.SCENE='新生南路・大口漢堡';   /* 介面字：照遊戲裡已有的寫法（阿凱「週日宵夜（阿凱）」、同弦「走路 約 10 分鐘」、eat3d.js 的店名）*/
  S.BUSY_TEXT='那個時間你已經約了別人。';   /* INV.answer 原本的系統字 */
  const T=()=>(typeof SHOP_NPC!=='undefined'&&SHOP_NPC.zheDakou)||null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const hasCal=()=>typeof CALENDAR!=='undefined'&&!!CALENDAR.termOf;
  const abs=(d,h)=>d*24+h, now=G=>abs(G.day,+G.hour||0);
  const F_=G=>G.flags||(G.flags={});
  /* 那一學期第 11 週週五（第幾天）*/
  S.dayOf=function(tid){ if(!hasCal()||!CALENDAR.termDays) return null; const r=CALENDAR.termDays(tid); if(!r) return null;
    for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===tid&&t.week===S.WEEK&&CALENDAR.dateOf(d).wd%7===S.WD) return d; } return null; };
  /* 這一天是哪一學期的第 11 週週五（不是＝null）*/
  S.termAt=function(day){ if(!hasCal()) return null; const t=CALENDAR.termOf(day); if(!t||!S.TERMS.includes(t.id)||t.week!==S.WEEK||CALENDAR.dateOf(day).wd%7!==S.WD) return null; return t; };
  S.tag=tid=>'zhe_dk_'+tid;
  S.knows=G=>typeof STORY!=='undefined'&&!!STORY.knows&&!!STORY.knows(ZHE,G);
  /* 祐廷不在臺北 */
  S.away=function(G){ if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return 'abroad'; if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return 'us'; if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return 'jp';
    if(typeof STORY!=='undefined'&&STORY.tzOffset&&(+STORY.tzOffset(G)||0)!==0) return 'tz'; return null; };
  /* 23:00～23:30 祐廷已經有別的約 */
  const evH=id=>{ const e=typeof STORY_EVENTS!=='undefined'&&id?STORY_EVENTS.find(x=>x&&x.id===id):null; return e&&e.hours!=null?+e.hours:1; };
  S.busy=function(G,day,skipId){ const h=S.H_OUT, st=S.HOURS; if(typeof INV!=='undefined'&&INV.mineAt&&INV.mineAt(G,day,h,st)) return 'mine';
    const a=abs(day,h), b=a+st; for(const q of (Array.isArray(G.outings)?G.outings:[])){ if(!q||q.id===skipId||q.state!=='planned') continue; const q0=abs(q.day,q.h), q1=q0+(q.hours!=null?+q.hours:evH(q.ev)); if(q0<b&&a<q1) return 'outing'; }
    return null; };
  /* 這一則現在能不能傳；why：給測試看的原因 */
  S.cond=function(G,why){ const no=w=>{ if(why) why.push(w); return false; };
    if(!law(G)) return no('econ'); const t=S.termAt(G.day); if(!t) return no('day'); if(t.exam) return no('exam');
    if(!S.knows(G)) return no('know'); if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,ZHE)) return no('contact');
    const aw=S.away(G); if(aw) return no('away:'+aw);
    if(typeof STORY!=='undefined'&&STORY.presence){ const p=STORY.presence(ZHE,G); if(p&&p.here===false) return no('zhe_away'); }
    if(S.busy(G,G.day)) return no('busy'); return true; };
  S.sent=(G,tid)=>{ const R=(G.flags||{}).ZHE_DK; return !!(R&&typeof R==='object'&&R[tid]!=null)||(typeof PHONE!=='undefined'&&PHONE.sent(G,S.tag(tid))); };
  S.items=function(G,d){ const L=T(); if(!L) return null; const A=t=>({th:TH,from:ZHE,text:t});
    const ask={id:'zhe_dk_'+d,until:abs(d,S.H_OUT+S.LATE),opts:[{t:L.yes,set:{ZHE_DK_GO:d}},{t:L.no,say:[A(L.noReply)]}]};
    return [Object.assign(A(L.msg),{ask})]; };
  S.planOut=function(G,d,tid){ if(typeof OUT==='undefined'||!OUT.plan) return false; const id=S.tag(tid); if(OUT.get&&OUT.get(G,id)) return false;
    return OUT.plan(G,{id,ev:S.EV,day:d,h:S.H_OUT,late:S.LATE,place:S.PLACE,title:S.TITLE,travel:S.TRAVEL,travelH:S.TRAVEL_H}); };
  /* 手機（STORY.PHONE_RULES，每 0.5 秒）*/
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined'||!hasCal()) return; const F=G.flags, d=G.day, t=S.termAt(d);
    if(t&&G.hour>=S.H_MSG&&G.hour<S.H_OUT&&!S.sent(G,t.id)&&S.cond(G)){ const items=S.items(G,d); if(items){ const R=F.ZHE_DK&&typeof F.ZHE_DK==='object'?F.ZHE_DK:(F.ZHE_DK={}); R[t.id]=d; PHONE.at(G,d,Math.max(S.H_MSG,G.hour),items,S.tag(t.id)); } }
    if(t&&F.ZHE_DK_GO===d&&now(G)<abs(d,S.H_OUT+S.LATE)&&typeof OUT!=='undefined'&&!(OUT.get&&OUT.get(G,S.tag(t.id)))){
      if(S.busy(G,d,S.tag(t.id))){ F.ZHE_DK_GO=null; if(typeof INV!=='undefined'&&INV.msg) INV.msg(G,null,S.BUSY_TEXT); }   /* 回「好。」以前才約了別的（同一個時間）：不排，照 INV 的系統字 */
      else S.planOut(G,d,t.id); } };
  /* ---------- 出遊：大口漢堡一樓 ---------- */
  const N=t=>({speaker:null,text:t});
  S.event=function(){ const L=T()||{}; return { id:S.EV, title:S.TITLE, participants:[ZHE], location:'any', trigger:'outing', once:false, background:'dark', hours:S.HOURS,
    dialogue:[ {scene:S.SCENE,bg:false}, N(L.narr), {speaker:ZHE,text:L.zhe} ] }; };
  /* OUT.STAGE：大口漢堡一樓靠窗那一排的雙人桌（配置 floor1.seats 的 (−3.3,−1.15) 和 (−3.3,−0.05)，桌子在 z −0.6）：阿哲坐北邊那一張（朝南）、祐廷坐對面 */
  S.STAGE={ zhe:[-3.3,-1.15,0], me:[-3.3,-0.05,Math.PI], meIn:[-3.3,0.55] };
  S.staged=null;
  S.canStage=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[Z]||!Z3.ZONES[G.zone]) return false;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false; if(S.away(G)) return false;
    if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  S.stage=async function(GM){ const G=GM.G, E=GM.E, P=E.player, C=S.STAGE;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0};
    if(P.seat&&GM.standUp) GM.standUp(P);
    S.staged=true; await GM.enter(Z,{x:C.meIn[0],z:C.meIn[1],yaw:C.me[2],lv:0},{noFade:true,deferStory:true,noAutosave:true});
    if(GM.spawnCharacter){ if(GM.npc&&GM.npc[ZHE]&&GM.removeNPC) GM.removeNPC(ZHE); const [x,z,yaw]=C.zhe; const n=GM.spawnCharacter(ZHE,x,z,{seat:{x,z,yaw,lv:0},pose:'eat'}); if(n){ n.idlePose=n.pose; n.frozen=true; } }
    if(GM.sitAt){ const [x,z,yaw]=C.me; GM.sitAt(P,{x,z,yaw,lv:0}); }
    let done=false;
    return { restore:async()=>{ if(done) return; done=true; S.staged=null; if(P.seat&&GM.standUp) GM.standUp(P);
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); } }; };
  S.outingStage=async function(GM,q,ev){ if(!ev||ev.id!==S.EV||!S.canStage(GM)) return null; return S.stage(GM); };
  S.install=function(){ if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e&&e.id===S.EV)) STORY_EVENTS.push(S.event());
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._zheDkPhone){ STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('ZHEDK.phone',e); } }); STORY._zheDkPhone=true; }
    if(typeof OUT!=='undefined'&&Array.isArray(OUT.STAGE)&&!OUT.STAGE.includes(S.outingStage)) OUT.STAGE.push(S.outingStage); };
  S.install();
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['zhedakou3d:staged']=()=>{ S.staged=null; };
  return S;
})();
if(typeof window!=='undefined') window.ZHEDK=ZHEDK;
