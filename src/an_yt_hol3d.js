/* ===== 以安、語彤交往中的節日・第一批（AA_414，企劃線 b1fc4bf30；AA-B 2026-10-23 定稿，D109）：接線 =====
   台詞、事件在 src/data/an_yt_hol_events.js（照稿不改字）。這個檔（照學姊的 SISB4.HOL，src/sis_b4_3d.js）：
   - STORY.PHONE_RULES：前一天 21:00 她私訊約（PHONE.at＋ask）→ 回答應＝排出遊（OUT.plan，鬧鐘停在出發前；不算正式校外約會、不進 dateLog）→ 那一場（trigger 'outing'）。
     回不行＝那一年的旗標記 'no'（她回的那一句；1-1 另外 2/14 20:00 傳照片）；沒回＝'noreply'（沒有出遊、沒有後續）；
     答應了沒到（「不去了」或過了時間，OUT 的 outingMissed）＝'missed'，那天照稿的時間她再傳（晚兩天以上才讀到的不補，同 SISB4）。回不行、沒到都不扣關係。
   - 條件（每一場一樣，AA_414 檔頭）：法律系、和她交往中、她在臺北或那一場寫的地方（STORY.presence：以安 1-1、1-2、1-4 寒假在台中老家也算）、
     祐廷不在國外（STORY.abroad：約的那天和出遊那天都看；2028-10-03 中秋美國路線在美國＝不演）、手機有她的聯絡方式（前一天以前就有，同 SISB4）。
   - 語彤 2026、2029 的情人節是麵店店休那幾天、2027、2028 照常（noodle_closed3d.js 的 NOODLE_CLOSED.closed，初一前 7 天到初三）：表上寫 shop，和店休表對不上就不演。
     出遊地點寫「麵店」的那一天，店休的鐵門照 noodle_closed3d.js 的 storyDue 照常開。
   - 1-1 開車去台中：照 date3d.js 的算法——地點表 D26（臺中）開車單程＋先回家取車 30 分（AA_128 4-1）；油錢＋過路費＝D26 開車的來回（出發的時候付，同 hometown3d.js）。
   - 1-4 2029-02-14 21:00 她打電話來（演出來的電話，AA_296；同 SISB4 3-6：OUT 的電話，接起來／先不接；21:15 以前沒接＝21:30、21:31 兩則）。
   - 2-5 中秋（2026-09-25、2027-09-15、2028-10-03）：前一天 21:00 約，15:00～17:30 麵店門口（接 18:00 麵店團的烤肉，現有事件）；旗標 YT_MOON_<年>。
   - 第 3 節：2027-02-14 21:00 麵店團群組四則（在群組的玩家，一次；和交不交往無關）。
   - 時段（DEC-SLOTS-1018）：出遊、電話都是 OUT.go，到了那裡起的時段自動算一件主要的事，這裡不另外做。同一天兩位（多段感情）照現有規則：一個時段一件，另一場過了時間＝沒到。
   測試：node tests/aa414_hol_unit.js */
'use strict';
const ANYTHOL=(function(){
  const S={}, L=typeof ANYTHOL_LINES!=='undefined'?ANYTHOL_LINES:{};
  const AN='heroine_01', YT='heroine_03';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const romR=(G,id)=>((G&&G.flags&&G.flags.romance)||{})[id]||null;   /* 只讀（不替沒有紀錄的人建一筆）*/
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=romR(G,id); return F['dating_'+id]===true||!!(R&&R.status==='dating'); };
  const pres=(G,id,day)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,day==null?G:Object.assign({},G,{day})):{here:true};
  const abroad=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(day==null?G:Object.assign({},G,{day}));
  const contact=(G,id,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,id)) return false; const c=G.contacts&&G.contacts[id]; return c==null||c<day; };   /* 前一天以前就有聯絡方式（同 SISB4）*/
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=id=>t=>({th:'p:'+id,from:id,text:t});
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };   /* alarm：跳過時間、睡覺都停在出發前（同 SISB4）*/
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):'以安';
  const lateEnd=q=>T(q.day,q.h+(q.late!=null?q.late:0.75));
  S.dating=dating;
  /* 她在臺北，或那一場寫的地方（where：寒暑假在老家的城市也算）*/
  S.herOk=function(G,id,day,where){ const p=pres(G,id,day)||{here:true}; if(p.here||p.kind==='taipei') return true; return !!where&&((!!p.home&&where.includes(p.home))||(!!p.city&&where.includes(p.city))); };
  /* 麵店店休（noodle_closed3d.js）：shop 'closed'＝那天要是店休、'open'＝那天要照常；沒有 NOODLE_CLOSED（測試沒載）＝不看 */
  S.shopOk=(G,a,day)=>!a.shop||typeof NOODLE_CLOSED==='undefined'||!NOODLE_CLOSED.closed||NOODLE_CLOSED.closed(G,day)===(a.shop==='closed');
  S.ok=(G,a,askDay,day)=>law(G)&&dating(G,a.who)&&S.herOk(G,a.who,day,a.where)&&!abroad(G,askDay)&&!abroad(G,day)&&contact(G,a.who,askDay)&&S.shopOk(G,a,day);

  /* 1-1 開車去台中：date3d.js 地點表 D26（臺中）開車＝單程 150 分、來回 900 元（油錢加過路費）；從宿舍要先回家取車，多 30 分（DATE.plan 的 pick）*/
  S.DRIVE={loc:'D26',pick:0.5};
  const hm=m=>{ const h=Math.floor(m/60), r=m%60; return (h?h+' 小時':'')+(h&&r?' ':'')+(r?r+' 分鐘':''); };
  S.drive=function(){ const tr=typeof DATE!=='undefined'&&DATE.travel?DATE.travel(S.DRIVE.loc,'car'):null, min=tr&&tr.mode==='car'?tr.minutes:150, fare=tr&&tr.mode==='car'?tr.fare:900;
    return {travelH:min/60+S.DRIVE.pick,travel:'回家取車約 30 分鐘，再開車到台中約 '+hm(min),fare}; };
  S.payDrive=function(G,GM,q){ if(!q||!q.fare||q.paid) return 0; q.paid=true; if(GM&&GM.money) GM.money(-q.fare,'交通'); return q.fare; };   /* 出發的時候付；到了以後讀檔重演不再扣 */

  /* ---------------- 表（AA_414 第 1、2 節）：ask 約的那天（21:00）、opts 回覆（no＝不行）、out 出遊、miss 答應了沒到她傳的（[時間, 句子]）---------------- */
  const o=(t,say,x)=>Object.assign({t,say},x||{});
  S.HOL=[
    {k:'an_y1',who:AN,ask:'2026-02-12',h:21,lines:L.an1Ask,flag:'AN_VDAY_Y1',go:'AN_VDAY_Y1_GO',where:['台中'],
      opts:[o(L.an1YesT,L.an1Yes),o(L.an1NoT,L.an1No,{no:true})],
      out:{id:'anyt_an_vday_y1',ev:'ev_an_vday_y1',day:'2026-02-14',h:14,late:0.5,place:'台中・她家附近的公園門口',title:'情人節（開車去台中找以安）',back:'回到臺北。'},drive:true,
      miss:{day:'2026-02-14',at:[[15,L.an1Miss1],[17,L.an1Miss2]]},noMsg:{day:'2026-02-14',at:[[20,L.an1NoPhoto]]}},   /* 回「在臺北。」的：2/14 20:00 她傳照片 */
    {k:'an_y2',who:AN,ask:'2027-02-12',h:21,lines:L.an2Ask,flag:'AN_VDAY_Y2',go:'AN_VDAY_Y2_GO',where:['台中'],   /* 她在台中（2/1～2/21），上來臺北一天 */
      opts:[o(L.an2YesT,L.an2Yes),o(L.an2WhyT,G=>G.flags.AN_VDAY_Y1==='went'?L.an2WhyWent:L.an2Why),o(L.an2NoT,L.an2No,{no:true})],
      out:{id:'anyt_an_vday_y2',ev:'ev_an_vday_y2',day:'2027-02-14',h:14,late:0.25,place:'大安森林公園',title:'情人節（大安森林公園）',travel:'捷運約 15 分鐘',travelH:0.25},
      miss:{day:'2027-02-14',at:[[14+40/60,L.an2Miss1],[16.5,L.an2Miss2]]}},
    {k:'an_y3',who:AN,ask:'2028-02-13',h:21,lines:L.an3Ask,flag:'AN_VDAY_Y3',go:'AN_VDAY_Y3_GO',
      opts:[o(L.an3YesT,L.an3Yes),o(L.an3NoT,L.an3No,{no:true})],
      out:{id:'anyt_an_vday_y3',ev:'ev_an_vday_y3',day:'2028-02-14',h:14,late:0.25,place:'總圖門口',title:'情人節（總圖門口）',travel:'走路',travelH:1/6},
      miss:{day:'2028-02-14',at:[[15,L.an3Miss1],[17,L.an3Miss2]]}},
    {k:'yt_y1',who:YT,ask:'2026-02-13',h:21,lines:L.yt1Ask,flag:'YT_VDAY_Y1',go:'YT_VDAY_Y1_GO',shop:'closed',until:16,   /* 幫忙的 16:00：回覆開到 16:00 */
      opts:[o(L.yt1YesT,L.yt1Yes),o(L.yt1HelpT,L.yt1Help,{set:{YT_VDAY_Y1_HELP:true}}),o(L.yt1NoT,L.yt1No,{no:true})],
      hOf:G=>G.flags.YT_VDAY_Y1_HELP?16:17,
      out:{id:'anyt_yt_vday_y1',ev:'ev_yt_vday_y1',day:'2026-02-14',h:17,late:0.25,place:'阿鳳麵店門口',title:'情人節（麵店門口）',travel:'走路約 10 分鐘',travelH:1/6},
      miss:{day:'2026-02-14',at:[[17.5,L.yt1Miss1],[19,L.yt1Miss2]]}},
    {k:'yt_y2',who:YT,ask:'2027-02-13',h:21,lines:L.yt2Ask,flag:'YT_VDAY_Y2',go:'YT_VDAY_Y2_GO',shop:'open',
      opts:[o(L.yt2YesT,L.yt2Yes),o(L.yt2WhyT,L.yt2Why),o(L.yt2NoT,L.yt2No,{no:true})],
      out:{id:'anyt_yt_vday_y2',ev:'ev_yt_vday_y2',day:'2027-02-14',h:12,late:0.5,place:'阿鳳麵店',title:'情人節（阿鳳麵店）',travel:'走路',travelH:1/6},
      miss:{day:'2027-02-14',at:[[13,L.yt2Miss1],[13+1/60,L.yt2Miss2]]}},
    {k:'yt_y3',who:YT,ask:'2028-02-13',h:21,lines:L.yt3Ask,flag:'YT_VDAY_Y3',go:'YT_VDAY_Y3_GO',shop:'open',
      opts:[o(L.yt3YesT,L.yt3Yes),o(L.yt3NoT,L.yt3No,{no:true})],
      out:{id:'anyt_yt_vday_y3',ev:'ev_yt_vday_y3',day:'2028-02-14',h:14,late:0.25,place:'阿鳳麵店門口',title:'情人節（語彤要帶你去的地方）',travel:'走路約 15 分鐘',travelH:0.25},
      miss:{day:'2028-02-14',at:[[15,L.yt3Miss1],[15+1/60,L.yt3Miss2]]}},
    {k:'yt_y4',who:YT,ask:'2029-02-13',h:21,lines:L.yt4Ask,flag:'YT_VDAY_Y4',go:'YT_VDAY_Y4_GO',shop:'closed',
      opts:[o(L.yt4YesT,L.yt4Yes),o(L.yt4NoT,L.yt4No,{no:true})],
      out:{id:'anyt_yt_vday_y4',ev:'ev_yt_vday_y4',day:'2029-02-14',h:19,late:0.25,place:'河濱',title:'情人節（河濱）',travel:'走路約 15 分鐘',travelH:0.25},
      miss:{day:'2029-02-14',at:[[19.5,L.yt4Miss1],[19.5+1/60,L.yt4Miss2]]}} ];
  /* 2-5 中秋（AA_127 4-2 的時段，和麵店團的中秋烤肉同一天）*/
  S.MOON=[[2026,'2026-09-24','2026-09-25'],[2027,'2027-09-14','2027-09-15'],[2028,'2028-10-02','2028-10-03']];
  for(const [y,ask,day] of S.MOON) S.HOL.push({k:'yt_moon_'+y,who:YT,ask,h:21,lines:L.moonAsk,flag:'YT_MOON_'+y,go:'YT_MOON_'+y+'_GO',moon:y,
    opts:[o(L.moonYesT,L.moonYes),o(L.moonNoT,L.moonNo,{no:true})],
    out:{id:'anyt_yt_moon_'+y,ev:'ev_yt_moon',day,h:15,late:0.5,place:'阿鳳麵店門口',title:'中秋（麵店門口）',travel:'走路',travelH:1/6},
    miss:{day,at:[[16,L.moonMiss]]}});
  /* 1-4 2029-02-14（三，初二）21:00 以安打電話來（台中外婆家；沒有前一天的私訊）*/
  S.CALL={k:'an_y4',who:AN,flag:'AN_VDAY_Y4',ok:'called',where:['台中'],
    out:{id:'anyt_an_vday_y4',ev:'ev_an_vday_y4',day:'2029-02-14',h:21,late:0.25},
    miss:{day:'2029-02-14',at:[[21.5,L.an4Miss1],[21+31/60,L.an4Miss2]]}};
  S.byOut=id=>S.HOL.find(a=>a.out.id===id)||(S.CALL.out.id===id?S.CALL:null);

  /* 照稿的時間傳（那個時間到了才排；那一天晚兩天以上才讀到的不補）*/
  const sendAt=function(G,m,base,who){ const md=D(m.day); if(md==null||G.day>md+1||!Array.isArray(m.at)) return; m.at.forEach(([h,lines],i)=>{ const tg=base+i; if(Array.isArray(lines)&&now(G)>=T(md,h)&&!sent(G,tg)) PHONE.at(G,md,h,lines.map(dm(who)),tg); }); };
  const gone=(G,q)=>!!q&&(q.state==='missed'||(q.state==='planned'&&now(G)>lateEnd(q)));   /* 答應了沒到：「不去了」或過了時間（OUT.expire 還沒跑到也算）*/
  S.asks=function(G){ const F=G.flags;
    for(const a of S.HOL){ const d=D(a.ask), od=D(a.out.day); if(d==null||od==null||!Array.isArray(a.lines)) continue; const tag='anyt_'+a.k+'_ask', h0=a.until!=null?a.until:a.out.h;
      if(!sent(G,tag)&&F[a.flag]==null&&G.day>=d&&G.day<=d+1&&now(G)<T(od,h0)&&S.ok(G,a,d,od)){   /* 那一天一開始就排好（約的時間才送到；快轉會停在要回的訊息）*/
        const M=a.lines.map(dm(a.who)); M[M.length-1].ask={id:tag,until:T(od,h0),opts:a.opts.map(x=>({t:x.t,
          set:x.no?{[a.go]:false,[a.flag]:'no'}:Object.assign({[a.go]:true},x.set||{}),
          say:((typeof x.say==='function'?x.say(G):x.say)||[]).map(t=>({from:a.who,text:t}))}))};
        PHONE.at(G,d,a.h,M,tag); }
      const h=a.hOf?a.hOf(G):a.out.h;
      if(F[a.go]===true&&F[a.flag]==null&&now(G)<T(od,h+a.out.late)) plan(G,Object.assign({},a.out,{day:od,h},a.drive?S.drive():{},a.hOf&&h!==a.out.h?{help:true}:{}));
      const q=outGet(G,a.out.id);
      if(F[a.go]===true&&F[a.flag]==null&&(gone(G,q)||G.day>od+1)) F[a.flag]='missed';
      if(F[a.flag]==='missed'&&F[a.go]===true) sendAt(G,a.miss,tag+'_miss',a.who);
      if(F[a.flag]==='no'&&a.noMsg) sendAt(G,a.noMsg,tag+'_no',a.who);
      if(sent(G,tag)&&F[a.flag]==null&&F[a.go]==null&&now(G)>=T(od,h0)) F[a.flag]='noreply'; } };   /* 沒回：她沒有再約，不演、不傳 */
  /* 1-4：那一天一開始就排好（快轉、睡覺會停在電話）；21:15 以前沒接＝21:30、21:31 */
  S.call=function(G){ const F=G.flags, C=S.CALL, d=D(C.out.day); if(d==null) return;
    if(F[C.flag]==null&&G.day===d&&now(G)<T(d,C.out.h+C.out.late)&&S.ok(G,C,d,d))
      plan(G,{id:C.out.id,ev:C.out.ev,day:d,h:C.out.h,late:C.out.late,place:'電話',verb:'接起來',no:'先不接',title:nm(AN)+'打電話來',call:true,travel:'',travelH:0,back:'電話掛了。'});
    const q=outGet(G,C.out.id); if(!q) return;
    if(F[C.flag]==null&&(gone(G,q)||G.day>d+1)) F[C.flag]='missed';
    if(F[C.flag]==='missed') sendAt(G,C.miss,'anyt_an_y4_miss',AN); };
  /* 出遊沒到、電話沒接（事件的 outingMissed）：記 missed，那幾則照上面的時間傳 */
  S.missed=function(G,q){ const a=q&&S.byOut(q.id); if(!a||!G||!G.flags) return; if(G.flags[a.flag]==null) G.flags[a.flag]='missed'; };
  /* 2-5 演完：YT_MOON_<年> went、記憶 YT_MOON（一次）；關係在事件裡（{fam:4,comf:4,npcRom:4}）*/
  S.moonWent=function(G){ const y=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).y:null; if(y!=null) G.flags['YT_MOON_'+y]='went';
    if(typeof SOCIAL!=='undefined'&&!SOCIAL.has(YT,'YT_MOON')) SOCIAL.remember(YT,'YT_MOON',''); };
  /* 情人節（交往中）：這學期的裂縫計數 -1（AA_126 好感表；已經是 0 就不動，同 SISB4.crackDown）*/
  S.crackDown=function(G,id){ const k=(typeof ROM!=='undefined'&&ROM.CRACK&&ROM.CRACK[id])||null; if(!k||!G||!G.flags||!((+G.flags[k]||0)>0)) return 0;
    if(ROM.crack) ROM.crack(G,id,-1); else G.flags[k]=(+G.flags[k]||0)-1; return -1; };
  /* 第 3 節：2027-02-14（日）21:00 麵店團群組（在群組的玩家都看得到，一次）*/
  S.GRP={day:'2027-02-14',h:21,tag:'anyt_grp_vday_y2'};
  S.group=function(G){ const d=D(S.GRP.day); if(d==null||G.day<d||G.day>d+1||now(G)<T(d,S.GRP.h)||sent(G,S.GRP.tag)||!PHONE.inGroup||!PHONE.inGroup(G,'noodle_team')||!Array.isArray(L.grp)) return;
    PHONE.at(G,d,S.GRP.h,L.grp.map(([f,t])=>({th:'g:noodle_team',from:f,text:t})),S.GRP.tag); };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; for(const f of [S.asks,S.call,S.group]){ try{ f(G); }catch(e){ console.warn('ANYTHOL phone',e); } } };

  /* 2-2 的背景：最裡面靠窗那一桌（assets/bg/noodle_table_window.webp，LAWWW2 dcc4cf7 長桌第二版，一直沒登記）*/
  if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.noodle_table_window) OUT.BG.noodle_table_window={label:'阿鳳麵店・靠窗的桌子',image:'assets/bg/noodle_table_window.webp'};
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();
