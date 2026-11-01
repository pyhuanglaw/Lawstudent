/* ===== 學姊第四批（AA_386，企劃線 e848154a；任務 AA386-SIS-BATCH4-1022）：接線 =====
   台詞、事件在 src/data/sis_b4_events.js（照稿不改字）。這個檔：
   - 說話前接演（第 0 節，同 AA_379 2-3）：在她讀書的地方（Café、法圖、閱覽室、總圖大廳自習區）找她說話，先演這一場，演完照常閒聊（那一次的階梯照樣推進）。
     她有別的事件要先演（說話的事件、AA_379 的 2-3／2-6），這一場等下一次：story3d.js 的 talkSis、talkCharacter 本來就問 SISY23.preTalk，這個檔包一層（檔尾），那一段沒演才問 S.preTalk。
     第 1 節（熟悉以上；一般、交往中都演；分開過的玩家不演——同 AA_379 2-9「分手過的玩家八場都不演」；她在國外、祐廷在國外不演）：
       1-1 ev_sis_adv_grad 大一下第 6～12 週（3/27 上榜聚餐以後）　1-2 ev_sis_adv_exch 大二上第 12～15 週（旗標 SIS_ADV_EXCH same／go）
       1-3 ev_sis_adv_pick 2027-11-13～11-17（志願表 11/18 12:00 截止以前；交往中＝那張志願表那一版）　1-4 ev_sis_adv_y4 大三下第 10～14 週（日本路線在日本，不演）
     第 4 節 4-1 ev_sis_three_conditions：前任（ex）或被發現退回朋友（friend_after_catch）、分開那天起滿 6 週、她朋友以上、祐廷現在沒有在和別人交往（ROM.partners 空的）、她在臺北；
       這一次分開演一次（記 SIS_REBUILD＝那天、SIS_REBUILD_N＝那時候和她正式校外約會的次數）。
   - STORY.PHONE_RULES（第 3 節；只有交往中；她自己約；出遊系統 OUT，不算正式校外約會、不進 dateLog）：
       3-1 2026-12-23 21:00 私訊 → 12/24 22:00 兩點半 Café 門口（SIS_XMAS_Y2）　3-2 2027-12-24 20:30 → 21:00 研究室（SIS_XMAS_Y3）
       3-4 2027-02-13 21:00 → 2/14 14:00 臺北植物園（SIS_VDAY_Y2）　3-5 2028-02-13 21:00 → 2/14 10:00 公館捷運站二號出口（SIS_VDAY_Y3）
       回「好。」＝排出遊；回不行＝那個旗標記 no；沒來（回不行、沒回、說好了沒到）＝那天她再傳一則（沒回、沒到記 missed）。回「不行」或沒到都不扣關係。
       3-6 2029-02-14 22:30 她打電話來（SIS_VDAY_Y4 call）；沒接＝22:40 私訊、記 missed。
       私訊要有她的聯絡方式；那一天晚兩天以上才讀到（很久沒跑手機規則）的不補（同 SISY23）。
   - 第 4 節 4-2：分開過的學姊，演過 4-1 才會再出現告白；之後兩次正式校外約會（不要求四次，AA_128 3-3），第二次那一趟的結尾告白＝答應——
       date3d.js 的 canConfess／confessOffer 問 S.rebuild、S.rebuildReady（期末才告白的規則 TERMEND.ON 對她這一次例外）；confess_lines.js 的 decide、yes 問 S.rebuildReady、S.restartYes；
       termend3d.js 的心意邀約（第一次的台詞）不給分開過的玩家（S.brokeUp）。
   測試：node tests/aa386_sis_batch4_unit.js */
'use strict';
const SISB4=(function(){
  const S={}, ID='heroine_05', L=typeof SISB4_LINES!=='undefined'?SISB4_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const romR=G=>((G&&G.flags&&G.flags.romance)||{})[ID]||null;   /* 只讀（不替沒有紀錄的人建一筆）*/
  const dating=G=>{ const F=(G&&G.flags)||{}, R=romR(G); return F['dating_'+ID]===true||!!(R&&R.status==='dating'); };
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);   /* 她在臺北（2028-08-02～12-23 在美國）*/
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);   /* 祐廷交換人在國外 */
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const contact=(G,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,ID)) return false; const c=G.contacts&&G.contacts[ID]; return c==null||c<(day==null?G.day:day); };   /* 前一天以前就有聯絡方式（同 SISY23）*/
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };   /* alarm：跳過時間、睡覺都停在出發前（同 SISY23）*/
  const partners=G=>typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[];
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);

  /* ---------------- 分開過（第 4 節）：前任或被發現退回朋友、現在沒在和她交往 ---------------- */
  S.brokeUp=G=>{ if(!G||!G.flags||dating(G)) return false; const R=romR(G); return !!(R&&(R.status==='ex'||R.status==='friend_after_catch'))||G.flags['EX_'+ID]===true; };
  S.caught=G=>{ const R=romR(G); return !!R&&R.status==='friend_after_catch'; };
  /* 分開的那一天：她的交往紀錄最後一筆 end（ROM.end、R2Y4B.toFriend 都記 day）；舊紀錄只有學期週次＝那一週的最後一天（同 STORY.breakupDaysAgo）；沒有紀錄＝null（當作很久以前）*/
  const tDay=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const hDay=h=>{ if(!h) return null; if(typeof h.day==='number') return h.day; if(typeof h.at==='string'){ const m=/^(Y\dS\d)W(\d+)$/.exec(h.at), m2=/^D(-?\d+)$/.exec(h.at);
      if(m){ const a=tDay(m[1],+m[2],7); if(a!=null) return a; const b=tDay(m[1],+m[2],1); return b!=null?b+6:null; } if(m2) return +m2[1]; } return null; };
  S.breakDay=G=>{ const H=((romR(G)||{}).history)||[]; for(let i=H.length-1;i>=0;i--) if(H[i]&&H[i].ev==='end') return hDay(H[i]); return null; };
  S.REBUILD_WEEKS=6;   /* ROM.PARAMS.restartWeeks.heroine_05（BB_122 9-2：至少 6 週）*/
  /* 4-1 該演了：這一次分開還沒演過（SIS_REBUILD 在分開那天以前＝上一次分開的）、滿 6 週、朋友以上、祐廷沒有在和別人交往、她在臺北、祐廷在臺灣 */
  S.rebuildDue=function(G){ if(!law(G)||!G.flags.met_sis||!S.brokeUp(G)) return false; const F=G.flags, bd=S.breakDay(G);
    if(F.SIS_REBUILD!=null&&(bd==null||F.SIS_REBUILD>=bd)) return false;
    if(bd!=null&&G.day-bd<S.REBUILD_WEEKS*7) return false;
    return stageOk('FRIEND')&&!partners(G).length&&here(G)&&!abroad(G); };
  /* 4-2：分開過的學姊＝{done（這一次分開演過 4-1）, dates（那以後和她正式校外約會幾次）, ready（兩次以上）}；沒分開過（照一般的告白條件）＝null */
  S.rebuild=function(G){ if(!S.brokeUp(G)) return null; const F=G.flags, bd=S.breakDay(G), r=F.SIS_REBUILD;
    if(r==null||(bd!=null&&r<bd)) return {done:false,dates:0,ready:false};
    const Lg=G.dateLog&&G.dateLog[ID]; let n;
    if(typeof F.SIS_REBUILD_N==='number') n=Math.max(0,((Lg&&Lg.count)|0)-F.SIS_REBUILD_N);
    else n=(G.trips||[]).filter(t=>t&&t.who===ID&&t.counted&&t.day>r).length;   /* 沒有次數紀錄（測試、舊存檔）：照行程 */
    return {done:true,dates:n,ready:n>=2}; };
  S.rebuildReady=G=>{ const r=S.rebuild(G); return !!(r&&r.ready); };
  /* 答應的台詞（confess_lines.js；ROM.start 以後才問）：這一段交往是分開以後重新開始的、而且是演過 ev_sis_three_conditions以後 */
  S.restartYes=function(G){ const F=(G&&G.flags)||{}; if(F.SIS_REBUILD==null||!dating(G)) return false; const H=((romR(G)||{}).history)||[];
    let i=H.length-1; while(i>=0&&!(H[i]&&H[i].ev==='start')) i--; if(i<0) return false;
    for(let j=i-1;j>=0;j--){ if(H[j]&&H[j].ev==='end'){ const d=hDay(H[j]); return d==null||F.SIS_REBUILD>=d; } }
    return false; };

  /* ---------------- 說話前接演（第 0 節：第 1 節四場、4-1）---------------- */
  S.READ_ZONES=['cafe','lawlib','library','library_hall'];   /* 她讀書的地方：Café、法圖、閱覽室、總圖大廳二樓自習區 */
  S.ok=(G,min)=>law(G)&&!!G.flags.met_sis&&!S.brokeUp(G)&&stageOk(min)&&here(G)&&!abroad(G);
  S.preTalkEv=function(G){ if(!law(G)||!S.READ_ZONES.includes(G.zone)||!G.flags.met_sis||abroad(G)) return null;
    if(S.rebuildDue(G)) return 'ev_sis_three_conditions';
    if(!S.ok(G,'FAMILIAR')) return null;
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, wk=(id,a,b)=>!!t&&t.id===id&&t.week>=a&&t.week<=b;
    { const dn=D('2026-03-27'); if(!done(G,'ev_sis_adv_grad')&&wk('Y1S2',6,12)&&(dn==null||G.day>dn)) return 'ev_sis_adv_grad'; }   /* 1-1：放榜聚餐（3/27）以後 */
    if(!done(G,'ev_sis_adv_exch')&&wk('Y2S1',12,15)) return 'ev_sis_adv_exch';
    { const a=D('2027-11-13'), b=D('2027-11-17'); if(!done(G,'ev_sis_adv_pick')&&a!=null&&b!=null&&G.day>=a&&G.day<=b) return 'ev_sis_adv_pick'; }
    if(!done(G,'ev_sis_adv_y4')&&wk('Y3S2',10,14)&&route(G)!=='JP') return 'ev_sis_adv_y4';   /* 1-4：日本路線這時在日本 */
    return null; };
  S.preTalk=async function(GM){ const G=GM&&GM.G, id=S.preTalkEv(G); if(!id||typeof EVENTS==='undefined'||!EVENTS.runLines||typeof STORY_EVENTS==='undefined') return false;
    const ev=STORY_EVENTS.find(e=>e.id===id); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[id]=(R.done[id]|0)+1; R.last[id]=G.day;   /* 先記（同 SISY23.preTalk）：演到一半出錯也不會每次說話都重來 */
    if(id==='ev_sis_three_conditions'){ const Lg=G.dateLog&&G.dateLog[ID]; G.flags.SIS_REBUILD=G.day; G.flags.SIS_REBUILD_N=(Lg&&Lg.count)|0; }
    await EVENTS.runLines(ev.dialogue,ev); return true; };

  /* ---------------- 第 3 節：交往中的節日（她私訊約 → 出遊；沒來＝她再傳一則）---------------- */
  S.okDate=G=>law(G)&&!!G.flags.met_sis&&dating(G)&&here(G)&&!abroad(G);
  S.HOL=[
    {k:'xmas_y2',ask:'2026-12-23',h:21,lines:L.x2Ask,yes:L.x2Yes,noT:L.x2NoT,no:L.x2No,flag:'SIS_XMAS_Y2',ok:'there',go:'SIS_XMAS_Y2_GO',
      out:{id:'sisb4_xmas_y2',ev:'ev_sis_xmas_y2',day:'2026-12-24',h:22,late:0.25,place:'兩點半 Café 門口',title:'聖誕夜（兩點半 Café 門口）',travel:'走路 約 10 分鐘',travelH:1/6},
      miss:{day:'2026-12-24',h:22+20/60,lines:L.x2Missed}},
    {k:'xmas_y3',ask:'2027-12-24',h:20.5,lines:L.x3Ask,yes:L.x3Yes,noT:L.x3NoT,no:L.x3No,flag:'SIS_XMAS_Y3',ok:'there',go:'SIS_XMAS_Y3_GO',
      out:{id:'sisb4_xmas_y3',ev:'ev_sis_xmas_y3',day:'2027-12-24',h:21,late:0.25,place:'法律系館A・研究室',title:'聖誕夜（法律系館A・研究室）',travel:'走路 約 10 分鐘',travelH:1/6},
      miss:{day:'2027-12-24',h:21.5,lines:L.x3Missed}},
    {k:'vday_y2',ask:'2027-02-13',h:21,lines:L.v2Ask,yes:L.v2Yes,noT:L.v2NoT,no:L.v2No,flag:'SIS_VDAY_Y2',ok:'went',go:'SIS_VDAY_Y2_GO',
      out:{id:'sisb4_vday_y2',ev:'ev_sis_vday_y2',day:'2027-02-14',h:14,late:0.25,place:'臺北植物園',title:'情人節（臺北植物園）',travel:'捷運 約 20 分鐘',travelH:1/3},
      miss:{day:'2027-02-14',h:17,lines:L.v2Missed}},
    /* AA_392 第 6 節：荷花池——大二寒假情人節植物園約過的（SIS_VDAY_Y2 有值：來了、沒來、回不行都算）；7/1（四）21:00 → 7/3（六）09:00；不行或沒到 7/3 10:00 她傳照片 */
    {k:'lotus',ask:'2027-07-01',h:21,cond:G=>G.flags.SIS_VDAY_Y2!=null,lines:L.lotusAsk,yes:L.lotusYes,noT:L.lotusNoT,no:L.lotusNo,flag:'SIS_LOTUS',ok:'went',go:'SIS_LOTUS_GO',
      out:{id:'sisb4_lotus',ev:'ev_sis_lotus',day:'2027-07-03',h:9,late:0.25,place:'臺北植物園・荷花池',title:'荷花池（臺北植物園）',travel:'捷運 約 20 分鐘',travelH:1/3},
      miss:{day:'2027-07-03',h:10,lines:L.lotusMissed}},
    {k:'vday_y3',ask:'2028-02-13',h:21,lines:L.v3Ask,yes:L.v3Yes,noT:L.v3NoT,no:L.v3No,flag:'SIS_VDAY_Y3',ok:'went',go:'SIS_VDAY_Y3_GO',
      out:{id:'sisb4_vday_y3',ev:'ev_sis_vday_y3',day:'2028-02-14',h:10,late:0.25,place:'公館捷運站',title:'情人節（公館捷運站二號出口）',travel:'走路 約 15 分鐘',travelH:0.25},   /* 在臺北的家照出遊系統現有的算法（OUT.trip）*/
      miss:{day:'2028-02-14',h:15,lines:L.v3Missed}} ];
  S.asks=function(G){ const F=G.flags;
    for(const a of S.HOL){ const d=D(a.ask), od=D(a.out.day), md=D(a.miss.day); if(d==null||od==null||md==null||!Array.isArray(a.lines)) continue; const tag='sisb4_'+a.k+'_ask';
      if(!sent(G,tag)&&F[a.flag]==null&&G.day>=d&&G.day<=d+1&&now(G)<T(od,a.out.h)&&S.okDate(G)&&(!a.cond||a.cond(G))&&contact(G,d)){   /* 那一天一開始就排好（約的時間才送到；快轉會停在要回的訊息）*/
        const M=a.lines.map(dm); M[M.length-1].ask={id:tag,until:T(od,a.out.h),opts:[{t:a.yes,set:{[a.go]:true}},{t:a.noT,set:{[a.go]:false,[a.flag]:'no'},say:[{from:ID,text:a.no}]}]};
        PHONE.at(G,d,a.h,M,tag); }
      if(F[a.go]===true&&F[a.flag]==null&&now(G)<T(od,a.out.h+a.out.late)) plan(G,Object.assign({},a.out,{day:od}));
      /* 沒來（回了不行、沒回、說好了沒到）：那天她再傳一則；沒回、沒到記 missed（回不行的照 no）*/
      if(sent(G,tag)&&F[a.flag]!==a.ok&&now(G)>=T(md,a.miss.h)&&G.day<=md+1&&!sent(G,tag+'_miss')){ if(F[a.flag]==null) F[a.flag]='missed'; PHONE.at(G,md,a.miss.h,a.miss.lines.map(dm),tag+'_miss'); }
      if(sent(G,tag)&&F[a.flag]==null&&G.day>md+1) F[a.flag]='missed'; } };
  /* 出遊沒到、電話沒接（OUT 的 outingMissed）：記 missed，那則私訊照上面的時間傳 */
  S.missed=function(G,k){ const F=G.flags, a=S.HOL.find(x=>x.k===k); if(a){ if(F[a.flag]==null) F[a.flag]='missed'; return; } if(k==='vday_y4'&&F.SIS_VDAY_Y4==null) F.SIS_VDAY_Y4='missed'; };
  /* 3-6 2029-02-14（三）22:30 她打來（那一天一開始就排好；快轉、睡覺會停在電話）；沒接＝22:40 她傳 */
  S.CALL={id:'sisb4_vday_y4',ev:'ev_sis_vday_y4',day:'2029-02-14',h:22.5,late:1/6,miss:22+40/60};
  S.call=function(G){ const F=G.flags, C=S.CALL, d=D(C.day); if(d==null) return;
    if(F.SIS_VDAY_Y4==null&&G.day===d&&now(G)<T(d,C.h+C.late)&&S.okDate(G)&&contact(G,d)){ const nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(ID):'書瑀';
      plan(G,{id:C.id,ev:C.ev,day:d,h:C.h,late:C.late,place:'電話',verb:'接起來',no:'先不接',title:nm+'打電話來',call:true,travel:'',travelH:0,back:'電話掛了。'}); }
    const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,C.id):null; if(!q) return;
    if(F.SIS_VDAY_Y4!=='call'&&(q.state==='missed'||now(G)>T(d,C.miss))&&G.day<=d+1&&!sent(G,C.id+'_miss')){ if(F.SIS_VDAY_Y4==null) F.SIS_VDAY_Y4='missed'; PHONE.at(G,d,C.miss,(L.v4Missed||[]).map(dm),C.id+'_miss'); }
    if(F.SIS_VDAY_Y4==null&&G.day>d+1) F.SIS_VDAY_Y4='missed'; };
  /* 情人節（交往中）：這學期的裂縫計數 -1（AA_126 7-2；已經是 0 就不動，同 pgdates3d.js 可昕的）*/
  S.crackDown=function(G){ const k=(typeof ROM!=='undefined'&&ROM.CRACK&&ROM.CRACK[ID])||'SIS_CRACK'; if(!G||!G.flags||!((+G.flags[k]||0)>0)) return 0;
    if(typeof ROM!=='undefined'&&ROM.crack) ROM.crack(G,ID,-1); else G.flags[k]=(+G.flags[k]||0)-1; return -1; };
  /* 3-3 備援（AA_386，企劃線 d0468be4）：學姊交往版大四上那一頓固定 12/24 18:30；12/24 晚上已經有別的約、照現有規則往後讓的，當晚 21:00 她私訊三則（3-2 研究室那晚有來才有）。
     termend3d.js 排定（或改排）她這一頓、不在 12/24 的時候叫這裡；12/24 已經過了就不補 */
  S.XM3={day:'2028-12-24',h:21,tag:'sisb4_xmas_y4_dm'};
  S.xm3Fallback=function(G){ const F=G&&G.flags, X=S.XM3, d=D(X.day); if(!F||d==null||G.day>d||now(G)>=T(d,24)||sent(G,X.tag)||F.SIS_XMAS_Y3!=='there'||!law(G)||!dating(G)||!contact(G,d)||!Array.isArray(L.x3b)) return false;
    PHONE.at(G,d,X.h,L.x3b.concat([route(G)==='US'?L.x3bUs:L.x3bMe]).map(dm),X.tag); return true; };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.asks,S.call]){ try{ f(G); }catch(e){ console.warn('SISB4 phone',e); } } };

  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  /* 說話前接演的掛勾（不改 story3d.js）：talkSis、talkCharacter（學姊）本來就在說話前問 SISY23.preTalk——包一層：AA_379 的 2-3／2-6 那一段沒演，才問這裡的 S.preTalk
     （她有別的事件要先演，這一場等下一次）。index.html 裡 sis_y2y3_3d.js 在這個檔前面 */
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb4){ const p0=SISY23.preTalk;
    SISY23.preTalk=async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); }; SISY23.preTalk._sisb4=true; }
  return S;
})();
