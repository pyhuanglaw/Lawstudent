/* ===== 日本篇的空白日（AA_435 第 1～5 節、第 7 節，AA-B 2026-10-24 定稿，企劃線 0bb6e2fe6；回 BB_302；第①級、D109）=====
   台詞在 src/data/jp_blank_lines.js（JP_BLANK_LINES，照 AA 原文）；這裡是時間、條件、私訊、群組、出遊。做法同美國篇（src/us_blank3d.js）：不重寫 jp3d.js，往它的表裡加東西。
   - 一鍵的場景、摘要一句：JP.SCH 多幾列（{k,d,h,w:'jp',if,ev|sum}）——據點的選單之前到了就演、快轉停在那裡（jp3d.js dueStop／nextStop）。
   - 「回『好。』＝出遊」：私訊的回覆記旗標（JPB_*），JPB.phone 照旗標 OUT.plan（據點的選單多「出發：…」，同 jp3d.js 的 dinnerPhone）。
   - 交往中、挽回中照演的那一刻看（以安和祐廷交往中＝交往版；7/7 七夕重新交往的照交往版）。
   第 1 節 3/29～4/9：1-1 百元商店（交往中 3/28 21:30 私訊「好。」／「我想睡。」；挽回中一個人 11:00）；1-2 二手腳踏車（12:00 以安或立衡的私訊、15:00 照演；沒遇過立衡＝隔壁房間的交換生）；
          1-3 超市（交往中 15:30 私訊「我陪妳去。」＝17:00 出遊、「我查給妳。」＝祐廷回「晚上九點。」她回「好。謝謝。」；挽回中摘要）；1-4 選課（交往中 20:00；挽回中摘要）；
          1-5 分級考（兩版 10:00）；1-6 交換生的花見（挽回中：群組 4/7 21:00「+1」＝4/8 13:00 出遊；不回＝摘要）；1-7 明天開學（交往中 4/9 21:00 私訊）。
   第 2 節 2-1 交往中八場（她的私訊、「好。」＝出遊、「這週不行。」＝「好。」那天換 2-4）；2-2 挽回中三場（5/13 二手店、6/17 洗衣店、7/22 煙火＝群組「+1」）；
          2-3 交往中週末下午去河邊找她（jp3d.js 的 S.visit 叫 JPB.riverLine；那個週末有 2-1 的場景就不出）；
          2-4 沒有任何一件的週末日：每個週六、週日 18:30 看今天有沒有演過什麼（事件、日本的摘要、出遊、河邊那一句）、今天之後還有沒有排定的——都沒有＝照順序一句（兩版各自輪）。
   第 3 節 7/25 交往中 20:00 單字（她在你這邊）、7/27 摘要；挽回中 7/25、7/27 摘要。
   第 4 節 4-1 送別會（群組 7/27 21:00「+1」＝7/29 18:00 出遊；不去＝摘要）；4-2 退租前打掃（交往中 7/29 22:30 私訊；挽回中 7/30 摘要）；4-3 郵局 7/31；4-4 最後一次去學校 8/2 10:00。
   第 5 節 挽回中 5/5 摘要；7/17 海之日（群組 7/16 21:00「+1」＝09:00 一鍵；不回＝摘要）。
   第 7 節 記憶 AN_JP_LIGHT、AN_JP_FIREWORK 的面板名稱（SOCIAL.MEMORY_LABEL，載入時登記）；旗標 JP_HANAMI_GROUP（花見去了，不進面板）。
   存檔：G.jpb＝{pool:{dating:i,repair:i}, river:i, riverDay}；旗標 JPB_<那一則>（私訊、群組的回覆：'go'／'no'）。舊存檔沒有＝空的。
   測試：node tests/aa435_jp_blank_unit.js */
'use strict';
const JPB=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof JP==='undefined'||!JP.SCH||typeof JP_BLANK_LINES==='undefined') return S;
  const X=JP_BLANK_LINES, A1='heroine_01', TH='g:jp_exchange';
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null, T=(d,h)=>d*24+h, NOW=G=>T(G.day,G.hour);
  const dat=G=>X.dating(G), rep=G=>!X.dating(G), metLH=G=>X.metLH(G);
  const inJP=G=>!!JP.inJapan&&JP.inJapan(G);
  const wdOf=d=>{ const w=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd:((d%7)+7)%7; return w===7?0:w; };
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  S.rec=G=>{ if(!G.jpb||typeof G.jpb!=='object') G.jpb={}; const R=G.jpb; if(!R.pool||typeof R.pool!=='object') R.pool={}; return R; };

  /* ---------------- JP.SCH 多的列（一鍵的場景、摘要一句）---------------- */
  const sum=t=>G=>t, F=k=>G=>G.flags&&G.flags[k];
  S.SCH=[
    {k:'jpb_1_1r',d:'2028-03-29',h:11,w:'jp',if:rep,ev:'ev_jpb_100yen_alone'},
    {k:'jpb_1_1n',d:'2028-03-29',h:12,w:'jp',if:G=>dat(G)&&G.flags.JPB_YEN==='no',sum:X.SUM.d0329},   /* 交往中回「我想睡。」（AA_437 第 7 節第 3 點）*/
    {k:'jpb_1_2',d:'2028-03-31',h:15,w:'jp',if:dat,ev:'ev_jpb_bike'},
    {k:'jpb_1_2r',d:'2028-04-07',h:15,w:'jp',if:rep,ev:'ev_jpb_bike_repair'},   /* AA_519 第 6 節：挽回中的腳踏車移到 4/7（原本 3/31：立衡版要先遇過立衡，可是重逢在 4/2，到不了）；字不改 */
    {k:'jpb_1_3r',d:'2028-04-01',h:18.5,w:'jp',if:rep,sum:X.SUM.r0401},
    {k:'jpb_1_4',d:'2028-04-04',h:20,w:'jp',if:dat,ev:'ev_jpb_courses'},
    {k:'jpb_1_4r',d:'2028-04-04',h:18.5,w:'jp',if:rep,sum:X.SUM.r0404},
    {k:'jpb_1_5r',d:'2028-04-07',h:18.5,w:'jp',if:rep,sum:X.SUM.r0407},   /* AA_437 第 7 節第 3 點 */
    {k:'jpb_1_5',d:'2028-04-05',h:10,w:'jp',ev:'ev_jpb_placement'},
    {k:'jpb_1_6r',d:'2028-04-08',h:18.5,w:'jp',if:G=>rep(G)&&!done(G,'ev_jpb_hanami')&&G.flags.JPB_HANAMI!=='go',sum:X.SUM.r0408},
    {k:'jpb_2_2a',d:'2028-05-13',h:14,w:'jp',if:rep,ev:'ev_jpb_r_shop'},
    {k:'jpb_2_2b',d:'2028-06-17',h:13,w:'jp',if:rep,ev:'ev_jpb_r_laundry'},
    {k:'jpb_3_1',d:'2028-07-25',h:20,w:'jp',if:dat,ev:'ev_jpb_vocab'},
    {k:'jpb_3_1r',d:'2028-07-25',h:22,w:'jp',if:rep,sum:X.SUM.r0725},
    {k:'jpb_3_2',d:'2028-07-27',h:23,w:'jp',if:dat,sum:X.SUM.d0727},
    {k:'jpb_3_2r',d:'2028-07-27',h:22,w:'jp',if:rep,sum:X.SUM.r0727},
    {k:'jpb_4_1n',d:'2028-07-29',h:20,w:'jp',if:G=>!done(G,'ev_jpb_farewell'),sum:X.SUM.party0},   /* 不去（沒回「+1」、或回了沒到）*/
    {k:'jpb_4_2r',d:'2028-07-30',h:18.5,w:'jp',if:rep,sum:X.SUM.r0730},
    {k:'jpb_4_3',d:'2028-07-31',h:11,w:'jp',ev:'ev_jpb_post'},
    {k:'jpb_4_4',d:'2028-08-02',h:10,w:'jp',ev:'ev_jpb_lastschool'},
    {k:'jpb_5_1',d:'2028-05-05',h:18.5,w:'jp',if:rep,sum:X.SUM.r0505},
    {k:'jpb_5_2',d:'2028-07-17',h:9,w:'jp',if:G=>rep(G)&&G.flags.JPB_SEA==='go',ev:'ev_jpb_r_sea'},
    {k:'jpb_5_2n',d:'2028-07-17',h:18.5,w:'jp',if:G=>rep(G)&&G.flags.JPB_SEA!=='go',sum:X.SUM.r0717} ];

  /* ---------------- 2-4 沒有任何一件的週末日（每個週六、週日 18:30）---------------- */
  S.FROM='2028-03-26'; S.TO='2028-08-04';
  S.weekendDays=function(){ const a=DK(S.FROM), b=DK(S.TO), out=[]; if(a==null||b==null) return out; for(let d=a;d<=b;d++){ const w=wdOf(d); if(w===0||w===6) out.push(d); } return out; };
  /* 今天演過什麼（事件、日本的摘要一列、出遊、河邊那一句），或今天之後還有排定的（出遊、JP.SCH 的列）：有＝不出摘要 */
  S.dayHas=function(G,day){ const L=(G.events&&G.events.last)||{}; for(const k in L) if(L[k]===day) return true;
    const R=JP.rec(G); for(const k in R.done) if(R.done[k]===day&&!/^jpb_pool_/.test(k)) return true;
    if(S.rec(G).riverDay===day) return true;
    for(const f of (JP.KNOWN||[])){ let t=null; try{ t=f(G); }catch(e){ t=null; } if(t!=null&&Math.floor(t/24+1e-9)===day) return true; }   /* 開發分支其他事件包那一天的電話、視訊、直播（JP.KNOWN）*/
    const Q=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; if(Q.some(q=>q&&q.day===day&&(q.state==='planned'||q.state==='done'))) return true;
    const now=NOW(G); for(const s of JP.SCH){ if(s.w!=='jp'||/^jpb_pool_/.test(s.k)||R.done[s.k]!=null||DK(s.d)!==day) continue; if(s.if&&!s.if(G)) continue; if(T(day,s.h)>=now) return true; }
    return false; };
  S.poolDue=(G,day)=>inJP(G)&&G.day===day&&!S.dayHas(G,day);
  S.poolLine=function(G){ const v=dat(G)?'dating':'repair', P=X.POOL[v], R=S.rec(G), i=(R.pool[v]|0)%P.length; R.pool[v]=(R.pool[v]|0)+1; return P[i]; };
  S.POOL_SCH=S.weekendDays().map(d=>{ const x=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d):null, key=x?x.key:String(d);
    return {k:'jpb_pool_'+key,d:key,h:18.5,w:'jp',if:G=>S.poolDue(G,d),sum:G=>S.poolLine(G)}; });
  for(const s of S.SCH.concat(S.POOL_SCH)) if(!JP.SCH.some(q=>q.k===s.k)) JP.SCH.push(s);

  /* ---------------- 2-3 交往中：週末下午去河邊找她 ---------------- */
  S.weekKeys=new Set(X.WEEK.map(w=>w.d));
  S.fixedWeekend=function(G,day){ const w=wdOf(day), sat=w===6?day:(w===0?day-1:null); if(sat==null) return false; for(const d of [sat,sat+1]){ const x=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d):null; if(x&&S.weekKeys.has(x.key)) return true; } return false; };
  S.riverLine=function(G){ if(!inJP(G)||!dat(G)||!JP.anAt||JP.anAt(G)!=='river') return null; const w=wdOf(G.day); if(w!==0&&w!==6) return null; if(S.fixedWeekend(G,G.day)) return null;
    const R=S.rec(G), n=R.river|0, line=X.RIVER[n<X.RIVER.length?n:0]; R.river=n+1; R.riverDay=G.day; return line; };   /* 八句用完以後只有第一句；每次 30 分鐘（S.visit 本來就過 30 分鐘）、不加數值 */

  /* ---------------- 手機：以安、立衡的私訊，交換生群組 ---------------- */
  const an=t=>({th:'p:'+A1,from:A1,text:t});
  const due=(G,key,h)=>{ const d=DK(key); return d!=null&&G.day>=d&&G.day<=d+1&&NOW(G)>=T(d,h); };
  S.ask=function(G,P,tag,key,h,lines,o){ if(P.sent(G,tag)||!due(G,key,h)) return false; const d=DK(key), L=lines.map(an); if(o) L[L.length-1].ask=o; return P.at(G,d,G.day===d?Math.max(h,G.hour):h,L,tag); };
  S.plan=function(G,id,ev,key,h,place,title){ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,id)) return; const d=DK(key); if(d==null||NOW(G)>=T(d,h)+0.5) return;
    OUT.plan(G,{id,ev,day:d,h,late:0.5,place,title,travel:'',travelH:0.25}); };
  S.phone=function(G){ const P=P_(); if(!P||!G||!G.flags||!inJP(G)) return; const Fl=G.flags, M=X.DM;
    try{
      /* 1-1 百元商店（交往中）*/
      if(dat(G)){ const m=M.yen; S.ask(G,P,'jpb_yen',m.ask,m.h,m.msg,{id:'jpb_yen',until:T(DK(m.d),m.at),opts:[{t:m.yes,set:{JPB_YEN:'go'}},{t:m.no,set:{JPB_YEN:'no'},say:[{from:A1,text:m.noReply}]}]}); }
      if(Fl.JPB_YEN==='go') S.plan(G,'jpb_yen','ev_jpb_100yen',M.yen.d,M.yen.at,'車站旁邊的百元商店','和以安：車站旁邊的百元商店（日本 11:00）');
      /* 1-2 腳踏車：交往中＝以安；挽回中＝遇過立衡的才有他的私訊（15:00 照演）*/
      if(dat(G)) S.ask(G,P,'jpb_bike',M.bike.ask,M.bike.h,M.bike.msg);
      else if(metLH(G)&&!P.sent(G,'jpb_bike_lh')&&due(G,M.bikeLH.ask,M.bikeLH.h)){ const d=DK(M.bikeLH.ask); P.at(G,d,G.day===d?Math.max(M.bikeLH.h,G.hour):M.bikeLH.h,M.bikeLH.msg.map(t=>({th:'p:jp_liheng',from:'jp_liheng',text:t})),'jpb_bike_lh'); }
      /* 1-3 超市（交往中）*/
      if(dat(G)){ const m=M.market; S.ask(G,P,'jpb_market',m.ask,m.h,m.msg,{id:'jpb_market',until:T(DK(m.d),m.at),opts:[{t:m.yes,set:{JPB_MARKET:'go'}},{t:m.no,set:{JPB_MARKET:'no'},say:[{from:'player',who:null,text:m.noMe},{from:A1,text:m.noReply}]}]}); }
      if(Fl.JPB_MARKET==='go') S.plan(G,'jpb_market','ev_jpb_market',M.market.d,M.market.at,'小鎮的超市','和以安：小鎮的超市（日本 17:00）');
      /* 1-7 明天開學（交往中）*/
      if(dat(G)){ const m=M.first; S.ask(G,P,'jpb_first',m.ask,m.h,m.msg,{id:'jpb_first',opts:m.opts.map(o=>({t:o.t,say:o.say.map(t=>({from:A1,text:t}))}))}); }
      /* 2-1 交往中八場 */
      for(const w of X.WEEK){ const d=DK(w.d); if(d==null) continue; const tag='jpb_w_'+w.k, key='JPB_W_'+w.k.toUpperCase(), ak=w.same?w.d:null;
        if(dat(G)){ const aDay=w.same?d:d-1, aH=w.same?w.h-2:21; const x=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(aDay).key:null;
          if(x) S.ask(G,P,tag,x,aH,[w.msg],{id:tag,until:T(d,w.h),opts:[{t:X.WEEK_YES,set:{[key]:'go'}},{t:X.WEEK_NO,set:{[key]:'no'},say:[{from:A1,text:X.WEEK_NO_REPLY}]}]}); }
        if(Fl[key]==='go') S.plan(G,tag,w.ev,w.d,w.h,w.place,'和以安：'+w.place+'（日本 '+String(Math.floor(w.h)).padStart(2,'0')+':'+(w.h%1?'30':'00')+'）'); }
      /* 2-2 5/13 立衡的私訊（挽回中、遇過他；14:00 照演）*/
      if(rep(G)&&metLH(G)&&!P.sent(G,'jpb_shop_lh')&&due(G,M.shopLH.ask,M.shopLH.h)){ const d=DK(M.shopLH.ask); P.at(G,d,G.day===d?Math.max(M.shopLH.h,G.hour):M.shopLH.h,M.shopLH.msg.map(t=>({th:'p:jp_liheng',from:'jp_liheng',text:t})),'jpb_shop_lh'); }
      /* 4-2 退租前打掃（交往中）*/
      if(dat(G)){ const m=M.clean; S.ask(G,P,'jpb_clean',m.ask,m.h,m.msg,{id:'jpb_clean',until:T(DK(m.d),m.at),opts:[{t:m.yes,set:{JPB_CLEAN:'go'}},{t:m.no,set:{JPB_CLEAN:'no'},say:[{from:A1,text:m.noReply}]}]}); }
      if(Fl.JPB_CLEAN==='go') S.plan(G,'jpb_clean','ev_jpb_clean',M.clean.d,M.clean.at,'她的房間','和以安：她退租前的打掃（日本 14:00）');
      /* 交換生群組：花見、海之日、煙火（挽回中）；送別會（兩版）*/
      if(P.inGroup&&P.inGroup(G,'jp_exchange')){ const g=X.GRP;
        const grp=(tag,r,flag,ok)=>{ if(!ok||P.sent(G,tag)||!due(G,r.d,r.h)) return; const d=DK(r.d);
          P.at(G,d,G.day===d?Math.max(r.h,G.hour):r.h,[{th:TH,from:'npc_jp_exchange',name:X.GRP_NAME,text:r.msg,ask:{id:tag,until:T(DK(r.at),r.atH),opts:[{t:X.GRP_YES,set:{[flag]:'go'}}]}}],tag); };
        grp('jpb_g_hanami',g.hanami,'JPB_HANAMI',rep(G)); grp('jpb_g_sea',g.sea,'JPB_SEA',rep(G)); grp('jpb_g_fire',g.fire,'JPB_FIRE',rep(G)); grp('jpb_g_party',g.party,'JPB_PARTY',true); }
      if(Fl.JPB_HANAMI==='go') S.plan(G,'jpb_hanami','ev_jpb_hanami',X.GRP.hanami.at,X.GRP.hanami.atH,'河堤','交換生的花見（日本 13:00）');
      if(Fl.JPB_FIRE==='go'&&rep(G)) S.plan(G,'jpb_r_fire','ev_jpb_r_fire',X.GRP.fire.at,X.GRP.fire.atH,'河堤','交換生：河堤的煙火（日本 19:30）');
      if(Fl.JPB_PARTY==='go') S.plan(G,'jpb_party','ev_jpb_farewell',X.GRP.party.at,X.GRP.party.atH,'宿舍大廳','交換生的送別會（日本 18:00）');
    }catch(e){ console.warn('JPB.phone',e); } };

  /* ---------------- 第 7 節 記憶的面板名稱 ---------------- */
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) for(const k in X.MEM_LABEL) if(!SOCIAL.MEMORY_LABEL[k]) SOCIAL.MEMORY_LABEL[k]=X.MEM_LABEL[k];

  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  /* AA 稿沒有、照實補的（回報 AA）*/
  S.GAPS=['1-2（3/31）以安的私訊沒有回覆選項：照 AA_341 G3、G4 的做法，私訊以後 15:00 照演；立衡那一則（挽回中）也一樣',
    '2-1 字裡寫「今天」「一整天」的三場（6/11 燈、7/8 媽媽的東西、7/22 煙火）：私訊改在當天、場景前兩小時（「前一天 21:00 前後」會和字對不上）',
    '交換生群組沒有名字的人發的那一則：說話框寫「交換生」',
    '1-1「我想睡。」、4/7（五）挽回中「摘要一句」：AA 沒有給字（3/29、4/7 是平日，2-4 的池子只給週末）——沒有補',
    '1-6 花見「立衡坐到你旁邊：」、4-1「以安站在你旁邊。」：描述寫成旁白一句（加括號）',
    '2-1 e「不進去也可以，選項」：AA 沒有給不進去那一版的字，只演兩個選項',
    '4-2 打掃：6/11 沒演過的，第一句旁白「那盞你換過的燈」AA 沒有說要換（只換第二句）——照原文'];
  return S;
})();
if(typeof window!=='undefined') window.JPB=JPB;
