/* ===== 可昕「我們的日子」大二到大四（AA_354，企劃線 86c104df；AA354-KX-OURDAYS-1021）=====
   大一下（K5 之後每週）在 story3d.js；畢業以後在 pgdates3d.js；這裡接中間的大二上～大四下。做法和大一下一樣：固定格（出遊 ev_kexin_our_day_wk，id kx_od_<天>），
   見面出一句地點字幕、推進閒聊階梯，沒有新台詞；可以接受、也可以略過（略過沒有台詞、不扣分）；撞到別的出遊、選了別的＝她說「好，這週換一天。」（事件的 outingMissed）。
   觸發（第 3 節）：法律系、和可昕交往中（dating_kexin）、KX_OUR_DAY 有值（大一下 K5 選過）。不再交往就停，已排的改 skipped。
   多久一次（第 1 節）：大二上、大二下每週；大三上起隔週（單週：第 3、5、7…週）；大四下開學那一則她問「改回每週？」——「好。」＝每週，「隔週就好。」或不回＝隔週（KX_OD_Y4S2）。
     第 2 週起排；期中考週（第 8、9 週）、期末考週（最後一週）不排；寒暑假不排（她在高雄）；那一週有她自己的事件不排（生日 4/24、週年 10/17、她的出遊、和她的校外約會）。
   時間、地點（第 3 節）：照大一下（週五 19:00、週六 14:00、週日 14:00；政大小吃街／社科院門口／約在中間輪流公館、溫州街、河濱／視訊，視訊每個月第一次改見面）。
     日本路線的大三下：一律視訊，臺灣時間 19:00（日本 20:00），星期照 KX_OUR_DAY.day；美國路線的大四上：一律視訊，臺灣時間週六 08:00（美國那邊週五晚上）。
     人在國外時遊戲時鐘是當地時間：排出遊、傳訊息都換成當地時間（STORY.tzOffset）。
   每學期開學那一則（第 2 節）：第 1 週週一 21:00（臺灣時間）她私訊；只在那學期第 1 週內傳，過了不補（舊存檔也是）。
   和 AA_351 接（第 3 節）：準時到 KX_CRACK −1、答應了（說了「晚一點」）沒到或遲到超過 15 分鐘 +1；略過不算——照畢業後篇同一套（PGDATE.kxArrive、kxMissed：只和她一位交往才算）。
   舊存檔：大二以後讀檔的，從讀檔那一週開始排（過了的格子不補）。
   測試：node tests/kxod_unit.js */
'use strict';
const KXOD=(function(){
  const S={};
  if(typeof STORY==='undefined') return S;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  S.TERMS=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.WD={fri:5,sat:6,sun:7}; S.HH={fri:19,sat:14,sun:14}; S.WD_NAME={fri:'週五',sat:'週六',sun:'週日'};
  S.JP_H=19; S.US_WD=6; S.US_H=8; S.OPEN_H=21;   /* 臺灣時間：日本路線 19:00、美國路線週六 08:00、開學那一則 21:00 */
  /* 開學那一則（第 2 節原文，{星期}＝週五／週六／週日）；大四下最後一句帶選項 */
  S.MSG={Y2S1:['這學期還是{星期}。','你的課表我看過了。那天下午你沒課。'],Y2S2:['{星期}照舊。','我們系的讀書會排在週間，不會撞到。'],
    Y3S1:['這學期改成隔週。','讀書會改到{星期}，我推不掉。……我也不想。'],
    Y3S2:['這學期還是隔週。','你要是那天有事，前一天跟我說。'],Y3S2_JP:['你在日本，我們的日子改視訊。','隔週一次。你那邊快一個小時。……不准遲到，你那邊的時間也算。'],
    Y4S1:['最後一年了。還是隔週。','……你要是忙，可以跟我說。不要不來。'],Y4S1_US:['你在美國，我們的日子改成我這邊的週六早上八點。','你那邊是週五晚上。……不准睡著。'],
    Y4S2:['最後一個學期。','我想改回每週。可以嗎？']};
  S.Y4S2_OPTS=[{t:'好。',v:'weekly',r:'好。'},{t:'隔週就好。',v:'biweekly',r:'……好。'}];
  /* 地點（同大一下 story3d.js 那一段）：[odPlace（事件的地點字幕）, 出遊地點, 標題, 車程, 車程（小時）] */
  S.PLACE={nccu:['nccu','木柵大學・山下的小吃街','我們的日子：開車去木柵大學','開車約 30 分鐘',0.5],ntu:['ntu','社科院門口','我們的日子：她來首都帝大','走過去約 10 分鐘',1/6],video:['video','視訊','我們的日子：視訊','',0]};
  S.MID=[['gongguan','公館','我們的日子：約在公館','騎車約 10 分鐘',1/6],['wenzhou','溫州街','我們的日子：溫州街','走過去約 10 分鐘',1/6],['river','河濱','我們的日子：河濱','騎車約 15 分鐘',0.25]];
  S.on=G=>law(G)&&!!G.flags&&G.flags.dating_kexin===true&&!!G.flags.KX_OUR_DAY&&typeof G.flags.KX_OUR_DAY==='object'&&!!S.WD[G.flags.KX_OUR_DAY.day]&&!(typeof MREL!=='undefined'&&MREL.kxOdPaused&&MREL.kxOdPaused(G));   /* 可昕收回以後回 B＝我們的日子暫停（AA_474 第 3 節，multirel3d.js）*/
  const route=G=>STORY.route?STORY.route(G):null;
  S.jp=(G,term)=>term==='Y3S2'&&route(G)==='JP';
  S.us=(G,term)=>term==='Y4S1'&&route(G)==='US';
  S.weekly=(G,term)=>term==='Y2S1'||term==='Y2S2'||(term==='Y4S2'&&G.flags.KX_OD_Y4S2==='weekly');
  S.weekOn=(G,term,w)=>w>=2&&(S.weekly(G,term)||w%2===1);   /* 隔週＝單週 */
  const tz=(G,day)=>STORY.tzOffset?(+STORY.tzOffset(G,day)||0):0;
  const local=(G,twDay,twH)=>{ const t=T(twDay,twH)+tz(G,twDay), d=Math.floor(t/24+1e-9); return {day:d,h:t-d*24}; };   /* 臺灣時間 → 遊戲時鐘（人在國外＝當地時間）*/
  const ym=d=>{ const x=CALENDAR.dateOf(d); return x.y*100+x.m; };
  /* 她的那一週（第 1 節「那一週有她自己的事件」）：生日 4/24、週年 10/17；她的出遊（kx_ 開頭、或事件有她，排了或去過的）；和她的校外約會 */
  S.herWeek=function(G,term,w){ const mon=STORY.termDayIn(term,w,1); if(mon==null) return false; const sun=mon+6;
    for(let d=mon;d<=sun;d++){ const x=CALENDAR.dateOf(d); if((x.m===4&&x.d===24)||(x.m===10&&x.d===17)) return true; }
    const evs=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[];
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)){ if(q.day<mon||q.day>sun||/^kx_od_/.test(q.id)||(q.state!=='planned'&&q.state!=='done')) continue;
      if(/^kx_/.test(q.id)) return true; const ev=q.ev&&evs.find(e=>e.id===q.ev); if(ev&&Array.isArray(ev.participants)&&ev.participants.includes('kexin')) return true; }
    for(const t of (Array.isArray(G.trips)?G.trips:[])) if(t.who==='kexin'&&t.status!=='cancelled'&&t.day+(t.nights||0)>=mon&&t.day<=sun) return true;
    return false; };
  /* 第 w 週那一格（不排＝null）：{day, h, P（S.PLACE 那一列）} */
  S.slot=function(G,term,w){ const OD=G.flags.KX_OUR_DAY; if(!S.weekOn(G,term,w)) return null;
    let at, P;
    if(S.us(G,term)){ const sat=STORY.termDayIn(term,w,S.US_WD); if(sat==null) return null; at=local(G,sat,S.US_H); P=S.PLACE.video; }
    else { const d=STORY.termDayIn(term,w,S.WD[OD.day]); if(d==null) return null; if(S.jp(G,term)){ at=local(G,d,S.JP_H); P=S.PLACE.video; } else at={day:d,h:S.HH[OD.day]}; }
    const tw=CALENDAR.termOf(at.day); if(!tw||tw.id!==term||tw.exam) return null;   /* 期中考週、期末考週不排（大四下第 15 週＝畢業典禮那一週，也是期末考週）*/
    if(S.herWeek(G,term,w)) return null;
    return Object.assign(at,{P}); };
  /* 見面的方式（臺灣）：照大一下——約在中間＝公館、溫州街、河濱輪流；視訊＝那個月第一次改見面（地點照約在中間那一輪）*/
  S.place=function(G,day){ const OD=G.flags.KX_OUR_DAY, F=G.flags; let mode=OD.mode;
    if(mode==='video'&&!OUT.rec(G).some(q=>/^kx_od_/.test(q.id)&&q.state!=='skipped'&&ym(q.day)===ym(day))) mode='mid';
    if(mode==='mid'){ const n=F.KX_OD_MID_N==null?(OD.mode==='mid'?1:0):F.KX_OD_MID_N; F.KX_OD_MID_N=n+1; return S.MID[n%3]; }
    return S.PLACE[mode]||null; };
  /* 開學那一則 */
  S.openItems=function(G,term){ const K=t=>({th:'p:kexin',from:'kexin',text:t.replace('{星期}',S.WD_NAME[G.flags.KX_OUR_DAY.day]||'')});
    const key=S.jp(G,term)?'Y3S2_JP':(S.us(G,term)?'Y4S1_US':term), L=S.MSG[key].map(K);
    if(term==='Y4S2') Object.assign(L[L.length-1],{ask:{opts:S.Y4S2_OPTS.map(o=>({t:o.t,set:{KX_OD_Y4S2:o.v},say:[K(o.r)]}))}});
    return L; };
  S.rule=function(G){ const F=G&&G.flags; if(!F||!law(G)||typeof OUT==='undefined'||typeof CALENDAR==='undefined') return;
    const mine=OUT.rec(G).filter(q=>q.kxod&&q.state==='planned');
    if(!S.on(G)){ for(const q of mine) q.state='skipped'; return; }   /* 不再交往：已排的改 skipped，之後不排 */
    for(const q of mine){ const t=CALENDAR.termOf(q.day); if(!t||S.herWeek(G,t.id,t.week)) q.state='skipped'; }   /* 排好以後才有她的事（例：後來約了和她的校外約會）*/
    const tm=CALENDAR.termOf(G.day); if(!tm||!S.TERMS.includes(tm.id)) return;
    const P=P_();
    if(P&&tm.week===1&&!P.sent(G,'kx_od_open_'+tm.id)){ const mon=STORY.termDayIn(tm.id,1,1); if(mon!=null){ const at=local(G,mon,S.OPEN_H); P.at(G,at.day,at.h,S.openItems(G,tm.id),'kx_od_open_'+tm.id); } }
    if(P&&tm.week===1&&!(G.msgs||[]).some(m=>m.tag==='kx_od_open_'+tm.id)) return;   /* 第 1 週：她開學那一則到了（說了這學期怎麼排）才排第一格 */
    for(let w=Math.max(2,tm.week),LW=STORY.termWeeks(tm.id);w<=LW;w++){ const s=S.slot(G,tm.id,w); if(!s) continue; if(T(s.day,s.h)<now(G)) continue;
      const id='kx_od_'+s.day; if(OUT.get(G,id)) break;
      const pl=s.P||S.place(G,s.day); if(!pl) break;
      OUT.plan(G,Object.assign({id,ev:'ev_kexin_our_day_wk',day:s.day,h:s.h,place:pl[1],title:pl[2],travel:pl[3],travelH:pl[4],odPlace:pl[0],kxod:tm.id},pl[0]==='video'?{verb:'接起來',no:'今天先不要',back:'視訊結束。'}:{}));
      break; } };
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.rule(G));
  /* 和 AA_351 接（第 3 節）：到了（OUT.BEFORE，到達的時間比約好的晚 15 分鐘以上＝+1，準時＝−1）；說了「晚一點」最後沒到＝+1；「不去了」不算 */
  if(typeof OUT!=='undefined'){
    if(Array.isArray(OUT.BEFORE)) OUT.BEFORE.push((GM,q)=>{ if(q&&q.kxod&&GM&&GM.G&&typeof PGDATE!=='undefined'&&PGDATE.kxArrive) PGDATE.kxArrive(GM.G,q); });
    const m0=OUT.onMissed; if(m0) OUT.onMissed=function(GM,q){ if(q&&q.kxod&&GM&&GM.G&&typeof PGDATE!=='undefined'&&PGDATE.kxMissed) PGDATE.kxMissed(GM.G,q); return m0.apply(this,arguments); }; }
  return S;
})();
