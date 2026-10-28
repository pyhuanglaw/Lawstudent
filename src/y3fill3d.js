/* ===== 法律系大三：逐週補空白（AA_342 第 3 節）＋修正稿的條件（AA_376 大三上；任務 AA342-COVERAGE-1021、AA376-Y3S1-FIX-1021）=====
   台詞在 src/data/y3fill_events.js（Y3FILL_LINES、Y3FILL_EVENTS，照 AA_342 不改字）。這個檔只接線：
   - STORY.PHONE_RULES：3-1 的群組（9/27 21:00 阿哲揪河濱三對三、11/5 22:00 Alison、12/8 21:00 阿哲）、10/8 21:00 柏翰私訊（沒參加讀書會的）；
     9/27 回「去。」＝9/28 15:00 公館河濱的出遊（OUT.plan）。群組訊息在那一天一開始就排好（PHONE.at），晚兩天以上才讀到的不補（同 y1fill3d.js）。
   - STORY.TICKS：在學期間的摘要日（11/3、12/18）：那一天 18:30 以後第一個空檔出日期卡，下面那一行是旁白（同寒暑假的摘要日 18:30，holff3d.js；在學期間沒有快轉＝不跳時間）。
     只出一次（G.flags.Y3_SUMS）；那一天已經過了（睡過去、在外面過夜）就不補；人在國外不出。
   - 閒聊階梯的條件（AA_376；匯入的 ladder.js 不手改，登記在 story3d.js 的表，同 r2y4a3d.js）：
     LADDER_SKIP K5-L3（K17 演過＝算過）、K5-L2（9/22 K15 沒有三十分鐘的見面 KX_SHORT_MEET＝算過）、Y5-L6（到過續約現場 YT_EV14 'there'＝算過）、Y5-L7（事件 13 以後＝算過）；
     LADDER_HOLD Y5-L1（事件 12、9/14 第一次上台以後）；LADDER_WEEK_IF A5-L1 第 2 週起、Y5-L7 第 14～15 週；
     LADDER_CHOICE_IF 以安 A5-L8、語彤 Y5-L8 日本路線的選項（字疊在 ladder.js，tools/ladder/import_ladder.py）。
   存檔：G.flags 的 Y3_RIVER33（'go'／'no'／'went'）、Y3_PLG_TOPIC（'yes'／'notyet'）、Y3_PLG_LEAD（那一天）、Y3_SUMS（{日期:出了的那一天}）；訊息照 PHONE 的 tag。
   測試：node tests/aa376_y3s1_unit.js */
'use strict';
const Y3FILL=(function(){
  const S={};
  const L=typeof Y3FILL_LINES!=='undefined'?Y3FILL_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const contact=(G,id,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,id)) return false; const c=G.contacts&&G.contacts[id]; return c==null||c<(day==null?G.day:day); };   /* 前一天以前就有聯絡方式（同 y1fill3d.js）*/
  const member=G=>{ const F=(G&&G.flags)||{}; return !!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const NG='g:noodle_team';
  const grpMsg=([from,text])=>({th:NG,from,text});
  const after=(G,k,h)=>{ const d=D(k); return d!=null&&(G.day>d||(G.day===d&&hh(G)>=(h||0))); };

  /* ===================== 3-1 群組、私訊 ===================== */
  const RV=k=>[{t:'去。',set:{[k]:'go'}},{t:'不去。',set:{[k]:'no'},say:[{from:'zhe',text:L.riverNo}]}];   /* 選項的字照 AA_342（「去。」「不去。」）；「不去。」＝阿哲「好喔」*/
  S.GROUPS=[
    {tag:'y3_river33_ask',day:'2027-09-27',h:21,ms:L.riverAsk,ask:{until:['2027-09-28',14.5],opts:RV('Y3_RIVER33')}},   /* 第 4 週：到 9/28 14:30 都回得了 */
    {tag:'y3_noclass_week',day:'2027-11-05',h:22,ms:L.noClass},   /* 第 9 週 */
    {tag:'y3_last_noodle_ask',day:'2027-12-08',h:21,ms:L.lastNoodleAsk} ];   /* 第 14 週 */
  S.groups=function(G){ for(const g of S.GROUPS){ if(!g.ms||PHONE.sent(G,g.tag)) continue; const d=D(g.day); if(d==null||G.day<d||G.day>d+1||!inGrp(G,'noodle_team')) continue;
      const M=g.ms.map(grpMsg); if(g.ask){ const u=D(g.ask.until[0]); M[M.length-1].ask={id:g.tag,until:u!=null?T(u,g.ask.until[1]):null,opts:g.ask.opts.map(o=>Object.assign({},o,{set:Object.assign({},o.set)}))}; }
      PHONE.at(G,d,g.h,M,g.tag); } };
  /* 9/27 回「去。」＝9/28（二，教師節）15:00 公館河濱的出遊；「不去。」或沒回：沒有後續 */
  S.RIVER_DAY='2027-09-28';
  S.river=function(G){ const F=G.flags, d=D(S.RIVER_DAY); if(d==null||F.Y3_RIVER33!=='go'||typeof OUT==='undefined'||!OUT.plan||OUT.get(G,'y3_river33')||now(G)>=T(d,15.25)) return;
    OUT.plan(G,{id:'y3_river33',ev:'ev_y3_river33',day:d,h:15,late:0.25,place:'公館河濱',title:'河濱 三對三',travel:'走過去約 15 分鐘',travelH:0.25}); };
  /* 沒參加讀書會的：10/8（五）21:00 柏翰私訊（要有他的聯絡方式）*/
  S.bohanNotes=function(G){ const d=D('2027-10-08'); if(d==null||G.day<d||G.day>d+1||member(G)||PHONE.sent(G,'y3_bohan_notes')||!contact(G,'classmate_bohan',d)||!L.bohanNotes) return;
    PHONE.at(G,d,21,L.bohanNotes.map((t,k)=>({th:'p:classmate_bohan',from:'classmate_bohan',text:t,dt:k/60})),'y3_bohan_notes'); };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.groups,S.river,S.bohanNotes]){ try{ f(G); }catch(e){ console.warn('Y3FILL phone',e); } } };

  /* ===================== 在學期間的摘要日：那一天 18:30 以後第一個空檔，日期卡＋一行旁白 ===================== */
  S.SUM_H=18.5;
  S.SUMS=[{date:'2027-11-03',line:L.sum1103},{date:'2027-12-18',line:L.sum1218}];
  S.sumDue=function(G){ if(!law(G)||abroad(G)) return null; const R=(G.flags&&G.flags.Y3_SUMS)||{};
    for(const s of S.SUMS){ const d=D(s.date); if(d==null||G.day!==d||hh(G)<S.SUM_H||R[s.date]!=null) continue; const l=typeof s.line==='function'?s.line(G):s.line; if(l) return {s,line:l}; }
    return null; };
  const WD=['日','一','二','三','四','五','六'];
  S.cardTitle=G=>{ if(typeof CALENDAR==='undefined') return ''; const x=CALENDAR.dateOf(G.day), h=hh(G), m=Math.round((h-Math.floor(h))*60); return x.m+'/'+x.d+'（'+WD[x.wd%7]+'）'+String(Math.floor(h)).padStart(2,'0')+':'+String(m).padStart(2,'0'); };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['y3fill3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.sumShow=async function(GM,x){ const G=GM.G, F=G.flags; (F.Y3_SUMS||(F.Y3_SUMS={}))[x.s.date]=G.day; if(GM.titleCard) await GM.titleCard(S.cardTitle(G),x.line,3200); return true; };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!G.flags||busy) return false;
    const free=typeof EVENTS!=='undefined'&&!EVENTS.running&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy);
    if(!free) return false;
    const x=S.sumDue(G); if(!x) return false; busy=true; S.sumShow(GM,x).catch(e=>console.warn('Y3FILL 摘要日',e)).finally(()=>{ busy=false; }); return true; };
  S.reset=()=>{ busy=false; };   /* 測試用 */

  /* ===================== AA_376：閒聊階梯的條件（story3d.js 的表；已經有的不蓋掉）===================== */
  S.ytThuFree=G=>typeof STORY!=='undefined'&&!!STORY.ytThuFree&&STORY.ytThuFree(G);
  S.LAD={
    skip:{
      'K5-L3':G=>done(G,'ev_kexin_tutor_practice'),   /* #5：K17（12/9 視訊）已經宣布過民總讀書會 */
      'K5-L2':G=>!(G.flags&&G.flags.KX_SHORT_MEET)&&after(G,'2027-09-23'),   /* #6：要在 K15（9/22 三十分鐘的晚餐）之後；沒有那一次見面的算過 */
      'Y5-L6':G=>!!(G.flags&&G.flags.YT_EV14==='there'),   /* #10：到過續約現場的不再聽一次轉述 */
      'Y5-L7':G=>S.ytThuFree(G) },   /* #10：事件 13（12/16）以前才說（以後就算過，不卡住後面那一層）*/
    hold:{ 'Y5-L1':G=>done(G,'ev_yt_umbrella_y3')||after(G,'2027-09-14',17.5) },   /* #11：事件 12（9/14 第一次上台）之後 */
    week:{ 'A5-L1':{if:{},week:[2,18]}, 'Y5-L7':{if:{},week:[14,15]} },   /* #11：A5-L1 第 2 週起；#10：Y5-L7 第 14～15 週 */
    choice:{ 'A5-L8':{'「我們幫妳把位子占著。」':{custom:G=>!(G.flags&&G.flags.EXCHANGE_ROUTE==='JP')},'「那我們在日本找一家麵店。」':{flagIs:{EXCHANGE_ROUTE:'JP'}}},   /* #18：日本路線祐廷 3/25 也要走 */
      'Y5-L8':{'「一起去。」':{custom:G=>!(G.flags&&G.flags.EXCHANGE_ROUTE==='JP')},'「我們同一班。」':{flagIs:{EXCHANGE_ROUTE:'JP'}}} } };
  S.installLadder=function(){ if(typeof STORY==='undefined') return 0; let n=0; const put=(tbl,k,v)=>{ if(tbl&&tbl[k]==null){ tbl[k]=v; n++; } };
    for(const k in S.LAD.skip) put(STORY.LADDER_SKIP,k,S.LAD.skip[k]);
    for(const k in S.LAD.hold) put(STORY.LADDER_HOLD,k,S.LAD.hold[k]);
    for(const k in S.LAD.week) put(STORY.LADDER_WEEK_IF,k,S.LAD.week[k]);
    if(STORY.LADDER_CHOICE_IF) for(const k in S.LAD.choice){ const R=STORY.LADDER_CHOICE_IF[k]||(STORY.LADDER_CHOICE_IF[k]={}); for(const t in S.LAD.choice[k]) if(R[t]==null){ R[t]=S.LAD.choice[k][t]; n++; } }
    return n; };
  S.installLadder();

  /* ===================== 掛勾 ===================== */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  return S;
})();
