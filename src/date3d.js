/* ===== 校外單獨約會的核心（DATE-S1、DATE-S2 的資料面；SYS-02 的告白判斷）=====
   規格：企劃線 AA_128（使用者原話三條：公館不計數；至少四次加她的專屬心願地點；到出發時間由玩家決定要不要切到行程）、
   AA_126 4-1（六個階段）、AA_215（2026-10-17 使用者定案：取消各人的故事閘門，告白＝第 6 階＋4 次＋心願地點＋她當時願意）。
   地點與互動點：src/data/date_locations.js（DATE_DATA，tools/date/import_dates.py 照白名單匯入）。
   這個檔只有資料與判斷，不管畫面：預約（DATE-S3）、出發（S4、S5）、半互動畫面（S6）之後接上來，完成一趟時呼叫 DATE.complete。
   存檔（G 的新欄位，舊存檔讀進來時補預設值，不追溯——AA_128 1-3）：
     G.dateLog[id]＝{count, wishKnown, wish, byLoc:{D13:2}, cancels:[], last:{trip,day}}
     G.trips＝[{trip:'T0001', who, locs:['D13'], day, depart, back, transport, fare, by:'player'|'her', wish, status, spots:[], departed}]
     G.groupTrips＝[{loc, day, members:[…]}]（一群人去，不計數） */
'use strict';
const DATE=(function(){
  const S={};
  const D=()=>typeof DATE_DATA!=='undefined'?DATE_DATA:{locations:{},points:{points:{}},heroineIds:{}};
  S.HEROINES=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  /* 舊存檔：補欄位、不改已有的；不追溯以前的出遊、CG、告白 */
  S.rec=function(G){ if(!G) return null; if(!G.dateLog||typeof G.dateLog!=='object') G.dateLog={}; if(!Array.isArray(G.trips)) G.trips=[]; if(!Array.isArray(G.groupTrips)) G.groupTrips=[]; if(!G.dateMemory||typeof G.dateMemory!=='object') G.dateMemory={}; return G; };
  S.log=function(G,id){ S.rec(G); const L=G.dateLog[id]||(G.dateLog[id]={count:0,wishKnown:false,wish:false,byLoc:{},cancels:[],last:null});
    if(!L.byLoc) L.byLoc={}; if(!Array.isArray(L.cancels)) L.cancels=[]; return L; };
  S.loc=id=>D().locations[id]||null;
  S.wishOf=id=>{ const L=D().locations; for(const k in L) if(L[k].wishOf===id) return k; return null; };   /* 七位各一個專屬心願地點（AA_128 第 6 節） */
  /* 第 1 條：目的地在地點表裡（學校周邊日常生活圈以外）；公館、溫州街、Café、校園……不在表裡＝不計數 */
  S.isDateLoc=id=>!!S.loc(id);

  /* 一趟算不算一次正式校外單獨約會（AA_128 1-2：五個條件全部成立） */
  S.counts=function(t){ if(!t) return {ok:false,why:'沒有行程'};
    const locs=(t.locs||[]).filter(Boolean);
    if(!locs.length||!locs.every(S.isDateLoc)) return {ok:false,why:'目的地不在地點表（學校周邊不計數）'};
    if(!t.who||Array.isArray(t.who)||!S.HEROINES.includes(t.who)) return {ok:false,why:'要和一位女主角單獨去'};
    if(t.day==null||!t.depart||!t.back||!t.transport) return {ok:false,why:'行程要有日期、出發時間、交通、回程時間'};
    if(!t.departed) return {ok:false,why:'到了出發時間沒有選「出發」'};
    if(t.status!=='done'||!(t.spots||[]).length) return {ok:false,why:'要走完行程、至少做一個互動點'};
    return {ok:true}; };
  /* 第 6 階（AA_126 4-1）：好朋友（熟悉 ≥60、信任 ≥45、自在 ≥40），她的戀愛（npcRom）≥55、祐廷的戀愛（rom）≥30 */
  S.stageNum=function(id){ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return 0; const r=SOCIAL.rel(id), n=v=>+v||0;
    const fr=n(r.fam)>=60&&n(r.trust)>=45&&n(r.comf)>=40?4:(n(r.fam)>=40&&n(r.trust)>=25?3:(n(r.fam)>=20?2:1));
    if(fr>=4&&n(r.npcRom)>=55&&n(r.rom)>=30) return 6; if(fr>=3&&n(r.npcRom)>=30) return 5; return fr; };

  /* 走完一趟：符合五個條件才 +1（一趟只算一次；同一天去兩個地點也是一趟）；同一個地點記次數（遞減用）；心願地點和她單獨去＝wish */
  S.complete=function(G,t){ S.rec(G); const c=S.counts(t); if(!c.ok) return Object.assign({counted:false},c);
    if(G.trips.some(x=>x.trip===t.trip&&x.counted)) return {counted:false,why:'這一趟已經算過'};
    const L=S.log(G,t.who); L.count++; for(const l of t.locs) L.byLoc[l]=(L.byLoc[l]|0)+1;
    const w=S.wishOf(t.who); const wish=!!w&&t.locs.includes(w); if(wish){ L.wish=true; L.wishKnown=true; }
    L.last={trip:t.trip,day:t.day}; const rec=Object.assign({},t,{counted:true,wish}); const i=G.trips.findIndex(x=>x.trip===t.trip); if(i>=0) G.trips[i]=rec; else G.trips.push(rec);
    return {counted:true,count:L.count,wish}; };
  /* 一群人去（AA_128 1-2）：另外記，不計數；讓人物記得「上次大家一起去過」 */
  S.group=function(G,loc,day,members){ S.rec(G); G.groupTrips.push({loc,day,members:(members||[]).slice()}); };
  S.cancel=function(G,id,day){ const L=S.log(G,id); L.cancels.push(day); };
  S.knowWish=function(G,id){ S.log(G,id).wishKnown=true; };
  S.newTripId=function(G){ S.rec(G); return 'T'+String(G.trips.length+1).padStart(4,'0'); };

  /* 她當時願意（AA_128 3-1 第 5 點、AA_215 第 1 節，保留）：不在低潮期；沒有在等你說清楚（paused）；她自己沒有伴侶；她不知道祐廷有伴侶 */
  S.LOW={};   /* 各人的低潮期判斷 {id:G=>bool}（學姊沒有男朋友、沒有分手後的低潮：使用者 2026-10-17 P0；之後別人有再接） */
  S.willing=function(G,id){ const F=G.flags||{};
    if(S.LOW[id]&&S.LOW[id](G)) return {ok:false,why:'low'};
    if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'paused'}; if(ROM.knows&&ROM.knows(G,id).length) return {ok:false,why:'knows'}; }
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'partner'};
    if(F['dating_'+id]) return {ok:false,why:'dating'};
    return {ok:true}; };
  /* 告白的選項出不出現（AA_215：stage≥6 && count≥4 && wish && willing；沒有故事閘門）。
     學姊：沒有男朋友（使用者 2026-10-17 P0）；筆試 2026-02-02 以前婉拒（decline:'preexam'）；筆試後到放榜 2026-03-23 以前也婉拒（decline:'prerank'，使用者同意 BB_190 LOGIC-14、AA_223 第 1 節 @8dac7e49）；放榜以後照一般條件。
     可昕（開場交往中）、已經在交往的：不檢查次數（AA_128 3-3）。 */
  S.HOLD={};   /* 學姊原本在這裡暫停（等分手條件）；使用者 2026-10-17 P0：她一開始就沒有男朋友 → 拿掉，改成下面的筆試前婉拒 */
  /* 學姊：研究所筆試（2026-02-02）結束以前不想交往（BB_122 ★-1、★-2）：條件到齊時告白的選項照樣出現，她婉拒、不鎖線（decline:'preexam'，事件 ev_sis_confess_preexam 照 BB_122 ★-2）；筆試以後照一般條件 */
  S.SIS_EXAM_END='2026-02-02';
  S.SIS_RESULT_DAY='2026-03-23';   /* 學姊研究所放榜（告白的分界，AA_223 第 1 節 @8dac7e49）*/
  S.sisPrerank=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(S.SIS_RESULT_DAY):null; return d!=null&&G.day<d&&!S.sisPreexam(G); };   /* 筆試考完、還沒放榜 */
  S.sisPreexam=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(S.SIS_EXAM_END):null; return d!=null&&(G.day<d||(G.day===d&&(G.hour%24)<17)); };   /* 2/2 考完（當天 17:00）以前都算筆試前 */
  S.canConfess=function(G,id){ if(S.HOLD[id]) return {ok:false,why:'hold',note:S.HOLD[id]};
    const L=S.log(G,id), st=S.stageNum(id);
    if(st<6) return {ok:false,why:'stage',stage:st}; if(L.count<4) return {ok:false,why:'count',count:L.count}; if(!L.wish) return {ok:false,why:'wish'};
    const w=S.willing(G,id); if(!w.ok) return {ok:false,why:w.why}; if(id==='heroine_05'&&S.sisPreexam(G)) return {ok:true,decline:'preexam'}; if(id==='heroine_05'&&S.sisPrerank(G)) return {ok:true,decline:'prerank'}; return {ok:true}; };
  /* 人物頁的進度提示（AA_128 3-2；不寫數字） */
  S.hint=function(G,id){ const L=S.log(G,id); if(S.stageNum(id)<5) return null;
    if(L.count<4) return '再多一些兩個人出去的時間';
    if(!L.wish){ if(!L.wishKnown) return '她好像有一個很想去的地方'; const w=S.loc(S.wishOf(id)); return w?`她提過想去${w.name}`:null; }
    return null; };
  /* 一起去過的地方（人物頁）：每一次正式校外約會的地點和日期 */
  S.history=function(G,id){ S.rec(G); return G.trips.filter(t=>t.counted&&t.who===id).map(t=>({day:t.day,locs:t.locs.map(l=>(S.loc(l)||{}).name||l)})); };

  /* ===== 預約與出發（DATE-S3～S5 的第一版；AA_128 第 4 節）＝接在出遊系統（outings3d.js 的 OUT）上：時間到了問、轉場、回程照 OUT =====
     預約時算交通與回程：單程時間照地點資料「從臺大單程」；開車從宿舍出發要先回家取車，去回各多 30 分（AA_128 4-1，AA 暫定）。 */
  S.STAY={half:2.5,evening:2.5,day:6.5};   /* 停留時間（小時，不含交通）；overnight（兩天一夜）第一版不開放預約 */
  S.travel=function(locId,mode){ const L=S.loc(locId); if(!L) return null; const T=(L.transport||[]); const tr=T.find(x=>x.mode===mode)||T[0]; if(!tr) return null;
    const label=((D().codes||{}).mode||{})[tr.mode]||tr.mode; return {mode:tr.mode,minutes:tr.minutes|0,fare:tr.fare|0,label:String(label).replace(/（.*$/,'')}; };
  S.plan=function(G,o){ const locs=(o.locs||[]).filter(Boolean); if(!locs.length||!locs.every(S.isDateLoc)) return {ok:false,why:'地點不在約會地點表'};
    if(!S.HEROINES.includes(o.who)) return {ok:false,why:'對象不對'}; const L0=S.loc(locs[0]); const kind=o.kind&&(L0.kinds||[]).includes(o.kind)?o.kind:(L0.kinds||['half'])[0]; if(!S.STAY[kind]) return {ok:false,why:'兩天一夜的行程這一版還不能約'};
    const tr=S.travel(locs[0],o.transport); if(!tr) return {ok:false,why:'到不了'}; const fromHome=!!o.fromHome; const pick=tr.mode==='car'&&!fromHome?0.5:0;
    const travelH=tr.minutes/60+pick, back=o.depart+travelH+S.STAY[kind]+travelH;
    return {ok:true,locs,kind,transport:tr.mode,travelLabel:tr.label,fare:tr.fare*2,travelH,depart:o.depart,back}; };
  S.book=function(G,o){ const P=S.plan(G,o); if(!P.ok) return P; S.rec(G); const id=S.newTripId(G);
    const trip={trip:id,who:o.who,locs:P.locs,day:o.day,depart:P.depart,back:P.back,kind:P.kind,transport:P.transport,fare:P.fare,by:o.by||'player',status:'booked',spots:[],departed:false,moves:0};
    G.trips.push(trip);
    if(typeof OUT!=='undefined'&&OUT.plan){ const nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(o.who):o.who, L0=S.loc(P.locs[0]);
      OUT.plan(G,{id:'date_'+id,dateTrip:id,ev:null,day:o.day,h:P.depart+P.travelH,travelH:P.travelH,travel:P.travelLabel+' 約 '+Math.round(P.travelH*60)+' 分鐘',place:L0.name,title:'和'+nm+'去'+L0.name,late:1,back:'回到台大。'}); }
    return Object.assign({ok:true},trip); };
  S.trip=(G,id)=>{ S.rec(G); return G.trips.find(t=>t.trip===id)||null; };
  /* ===== 預約（AA_128 4-1；DATE-S3）=====
     玩家約她：地點（有底圖的才列）→ 日期（今天起 7 天）→ 出發時間（照停留類型）→ 交通 → 確認（對象、地點、日期、出發、交通、預計花費、回程）→ 加入行事曆（OUT）。
     衝突的時段直接不能選、寫原因：考試、已經約好的行程（含校園邀約、一天最多兩場、一日遊那天只能一場）、她的作息（上課、打工）、回來超過 23:30、錢不夠。
     祐廷自己的課：可以排，提示錯過哪一堂（法律課不點名）或少一次出席（非法律課，AA_126 1-4）。
     誰約得到：學姊以外照 INV.whyNot（有聯絡方式、不是陌生人）＋AA_126 4-1「第 5 階以後的私下約會」（交往中不看階段）＋她自己沒有伴侶、沒有在等你說清楚；
     任一方有伴侶的完整規則是 DATE-S7（AA_128 4-5）。她指定的交通（DATE_PREFS，BB 填）、改交通時她的一句、改三次她的一句：BB 交了再接。 */
  S.listable=function(locId){ const L=S.loc(locId); if(!L) return false; const bg=typeof OUT!=='undefined'&&OUT.BG?OUT.BG:{}, p=String(locId).toLowerCase()+'_base'; return Object.keys(bg).some(k=>k.startsWith(p))&&!!((LN().loc||{})[locId]);   /* 有底圖才出現在清單（DATE-L01～L32）；底圖也給自由出行用（DL-06B 的貓空、九份…），約會要等那個地點的台詞審完匯入才列（不然到了現場她一句話都沒有）*/ };
  S.kindAt=function(locId,depart){ const K=((S.loc(locId)||{}).kinds||['half']).filter(k=>S.STAY[k]); if(!K.length) return null; return depart>=16&&K.includes('evening')?'evening':(K.includes('half')||K.includes('day')?K.find(k=>k!=='evening'):K[0]); };
  S.TIMES={half:[9,10,13,14,15],evening:[17,18,19],day:[8,9]};
  S.canAsk=function(G,id){ if(!S.HEROINES.includes(id)) return {ok:false,why:'不能約'}; const F=G.flags||{}, dating=!!F['dating_'+id];
    if(typeof INV!=='undefined'&&INV.whyNot){ const w=INV.whyNot(G,id); if(w) return {ok:false,why:w}; }
    if(!dating&&S.stageNum(id)<5) return {ok:false,why:'還沒熟到可以兩個人出去'};
    if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'她在等你把話說清楚'}; }
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'她現在有交往的對象'};
    return {ok:true}; };
  const isLaw=c=>!!c&&!/^Y0/.test(c.term||'')&&c.kind!=='general'&&c.kind!=='service';
  const liveIv=v=>v.state==='accepted'||v.state==='going'||v.state==='offered'||v.state==='changed';
  /* 這個時間能不能約（o：who、locs、day、depart、transport、fromHome、skip＝改時間時排除的那一趟）→ {ok, why, warns, plan, cost} */
  S.check=function(G,o){ const kind=o.kind||S.kindAt((o.locs||[])[0],o.depart); const P=S.plan(G,Object.assign({},o,{kind})); const warns=[]; if(!P.ok) return {ok:false,why:P.why,warns};
    const day=o.day, a=P.depart, b=P.back, no=w=>({ok:false,why:w,warns,plan:P});
    if(day<G.day||(day===G.day&&a<G.hour+0.25)) return no('這個時間已經過了');
    if(a<7) return no('太早了');
    if(b>23.5) return no('回來會超過 23:30，來回趕不上');
    if(typeof CLS!=='undefined'&&CLS.dayItems){ for(const it of (CLS.dayItems(G,day)||[])){ if(it.t1<=a||it.t0>=b) continue;
      if(it.examMain||(CLS.examAt&&CLS.examAt(G,day,it.t0,it.t1))) return no('那天 '+hm(it.t0)+' 要考'+it.c.name);
      warns.push(isLaw(it.c)?'會錯過 '+hm(it.t0)+' 的'+it.c.name+'（法律課不點名）':'會少一次出席：'+hm(it.t0)+' 的'+it.c.name); } }
    const sk=o.skip&&(o.skip.trip||o.skip), mine=(G.trips||[]).filter(t=>t.trip!==sk&&t.status==='booked'&&t.day===day);   /* skip：改時間的那一趟（物件或行程 id）*/
    if(mine.length>=2) return no('那天已經約了兩場');
    if(P.kind==='day'&&mine.length) return no('一日遊那天只能排這一場');
    if(mine.some(t=>t.kind==='day')) return no('那天已經有一日遊');
    const ov=mine.find(t=>a<t.back&&t.depart<b); if(ov) return no('和'+nameOf(ov.who)+'的約（'+hm(ov.depart)+' 出發）撞時間');
    const iv=(G.invites||[]).find(v=>liveIv(v)&&v.day===day&&v.h<b&&v.h+(((typeof INV!=='undefined'&&INV.place&&INV.place(v.place))||{}).stay||1)>a); if(iv) return no('那天 '+hm(iv.h)+' 已經約了'+nameOf(iv.who));
    const oq=(G.outings||[]).find(q=>q.state==='planned'&&!q.dateTrip&&q.day===day&&q.h<b+0.5&&q.h+1.5>a); if(oq) return no('那天 '+hm(oq.h)+' 有別的行程：'+(oq.title||oq.place||''));
    if(typeof INV!=='undefined'&&INV.busyAt){ const e=INV.busyAt(G,o.who,day,a,b-a); if(e) return no('她那時候'+(e.act==='class'?'要上課':(e.act==='work'?'要上班':'有事'))); }
    const L0=S.loc(P.locs[0])||{}, cost=(P.fare|0)+(L0.admission|0); if((G.money|0)<cost) return no('錢不夠（預計 '+cost+' 元）');
    return {ok:true,why:'',warns,plan:P,cost}; };
  const wdName=d=>'日一二三四五六'[((d%7)+7)%7];
  S.dayLabel=function(G,day){ const k=day-G.day; const dt=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; const md=dt?dt.m+'/'+dt.d:'第 '+day+' 天';
    const wd=dt&&dt.wd!=null?dt.wd:(G.weekday+k); return (k===0?'今天 ':k===1?'明天 ':'')+md+'（'+wdName(wd)+'）'; };
  /* 選日期、出發時間（預約、改時間共用）→ {day, depart, kind, check} 或 null */
  S.pickWhen=async function(GM,o){ const G=GM.G; const days=[]; for(let k=0;k<7;k++) days.push(G.day+k);
    for(;;){ const dOpts=days.map(d=>({t:S.dayLabel(G,d)})); dOpts.push({t:'算了'}); const di=await GM.choose(dOpts); if(di>=days.length) return null; const day=days[di];
      const K=((S.loc(o.locs[0])||{}).kinds||['half']).filter(k=>S.STAY[k]); const hs=[...new Set(K.flatMap(k=>S.TIMES[k]||[]))].sort((x,y)=>x-y);
      const rows=hs.map(h=>({h,c:S.check(G,Object.assign({},o,{day,depart:h,kind:undefined}))}));
      const tOpts=rows.map(r=>({t:hm(r.h)+' 出發',hint:r.c.ok?('回到台大約 '+hm(r.c.plan.back)+(r.c.warns.length?'。'+r.c.warns.join('；'):'')):r.c.why,dim:!r.c.ok})); tOpts.push({t:'換一天'}); tOpts.push({t:'算了'});
      for(;;){ const ti=await GM.choose(tOpts); if(ti===rows.length) break; if(ti>rows.length) return null; const r=rows[ti]; if(!r.c.ok){ if(GM.toast) GM.toast(r.c.why,2600); continue; } return {day,depart:r.h,kind:r.c.plan.kind,check:r.c}; } } };
  /* 她的句子（DATE-S6；src/data/date_lines.js：BB_128 3-6、3-7、AA_127 1-7、2-7、第 8 節，白名單匯入）：每一格幾句輪流（記在 dateLog 的 lineIdx，讀檔補預設）；一句裡有好幾則＝連發。
     當面約（n）用她的名字講；其他時候是手機訊息（名字後面「（手機）」，同時寫進手機的對話串）。還沒匯入的人或格子＝不說話（只有旁白）。 */
  const LN=()=>typeof DATE_LINES!=='undefined'?DATE_LINES:{lines:{},prefs:{}};
  const noodleOff=day=>typeof PLACES!=='undefined'&&!!PLACES.hours&&!!PLACES.hours.noodle&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed('noodle',day))&&!PLACES.isOpen('noodle',12,day)&&!PLACES.isOpen('noodle',18,day);
  S.LINE_IF={heroine_03:{accept:(G,t,x)=>!/公休/.test(String(x))||noodleOff(t.day)}};   /* 語彤「那天店裡公休」只在麵店已定的公休日（AA_127 第 8 節；沒有固定的每週公休日＝其他日子用第一句）*/
  S.lineFor=function(G,id,kind,t){ const L=((LN().lines||{})[id]||{})[kind]; if(!L||!L.length) return null; const f=(S.LINE_IF[id]||{})[kind]; const ok=L.filter(x=>!f||f(G,t||{},x)); if(!ok.length) return null;
    const lg=S.log(G,id); if(!lg.lineIdx||typeof lg.lineIdx!=='object') lg.lineIdx={}; const k=(lg.lineIdx[kind]|0)%ok.length; lg.lineIdx[kind]=(lg.lineIdx[kind]|0)+1; return [].concat(ok[k]); };
  S.speak=async function(GM,id,kind,t,n){ const G=GM.G, msgs=S.lineFor(G,id,kind,t); if(!msgs) return false;
    for(const m of msgs){ if(n) await GM.say({name:nameOf(id),obj:n.obj,charId:id},m); else { if(typeof PHONE!=='undefined'&&PHONE.post) PHONE.post(G,{th:'p:'+id,from:id,text:m}); await GM.say({name:nameOf(id)+'（手機）',charId:id},m); } }
    if(!n&&GM.phoneBadge) GM.phoneBadge(); return true; };
  S.prefOf=(id,locId)=>(((LN().prefs||{})[id]||{})[locId]||{}).transport||null;   /* 她指定的交通（DATE_PREFS）：預約時預設選她的，玩家改了她說一句（不扣分）*/
  /* 玩家約她（手機或當面；入口在 INV.flow 的地點清單「去校外…」）*/
  S.menu=async function(GM,id,n){ const G=GM.G; S.rec(G); const ca=S.canAsk(G,id); if(!ca.ok){ await GM.say(null,ca.why+'。'); return null; }
    const locs=Object.keys(D().locations).filter(k=>S.listable(k)&&S.kindAt(k,10)); if(!locs.length){ await GM.say(null,'（還沒有可以約的校外地點。）'); return null; }
    for(;;){ const lo=locs.map(k=>{ const L=S.loc(k), tr=S.travel(k); return {t:L.name,hint:L.area+(tr?'　'+tr.label+' 約 '+tr.minutes+' 分':'')}; }); lo.push({t:'算了'});
      const li=await GM.choose(lo); if(li>=locs.length) return null; const loc=locs[li], L=S.loc(loc); let mode=((L.transport||[])[0]||{}).mode;
      const T=(L.transport||[]).filter(x=>x.mode), pref=S.prefOf(id,loc); let prefOff=false; if(pref&&T.some(x=>x.mode===pref)){ T.sort((a,b)=>(b.mode===pref)-(a.mode===pref)); mode=pref; }   /* 她的偏好排第一、預設選它 */
      if(T.length>1){ const to=T.map(x=>{ const tr=S.travel(loc,x.mode); return {t:tr.label+(x.mode===pref?'（她想這樣去）':''),hint:'單程約 '+tr.minutes+' 分、'+tr.fare+' 元'+(x.mode==='car'?'（從宿舍要先回家取車，多 30 分）':'')}; }); const ti=await GM.choose(to); mode=T[ti].mode; prefOff=!!pref&&mode!==pref; }
      const o={who:id,locs:[loc],transport:mode,fromHome:false}; const w=await S.pickWhen(GM,o); if(!w) return null;
      const P=w.check.plan, sum='和'+nameOf(id)+'去'+L.name+'：'+S.dayLabel(G,w.day).trim()+' '+hm(P.depart)+' 出發，'+P.travelLabel+'單程約 '+Math.round(P.travelH*60)+' 分鐘，預計花費 '+w.check.cost+' 元，約 '+hm(P.back)+' 回到台大。';
      await GM.say(null,sum+(w.check.warns.length?'（'+w.check.warns.join('；')+'）':'')); const k=await GM.choose([{t:'就這樣約'},{t:'重新選'},{t:'算了'}]); if(k===2) return null; if(k===1) continue;
      if(n&&GM.caption) GM.caption('','（'+(typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].gender==='m'?'他':'她')+'看了一下手機的行事曆，點點頭。）',2000);   /* 和 INV.flow 當面約一樣的動作字幕（AA_134 第 4 節）；她答應的那一句 BB 交了再接 */
      const t=S.book(G,Object.assign(o,{day:w.day,depart:w.depart,kind:w.kind,by:'player'})); if(!t.ok){ await GM.say(null,t.why||'約不成。'); return null; }
      await S.speak(GM,id,G.flags&&G.flags['dating_'+id]?'acceptDating':'accept',t,n); if(prefOff) await S.speak(GM,id,'transport',t,n);   /* 答應（交往中那一句只給和她交往中的玩家）；改掉她的交通偏好她說一句 */
      await GM.say(null,'約好了：'+S.dayLabel(G,w.day).trim()+' '+hm(P.depart)+'，'+L.name+'。'); return t; } };
  /* 每 0.5 秒（OUT.tick 呼叫）：一天一次的 daily；出發前 60 分鐘手機提醒（AA_128 4-1）*/
  S.tick=function(GM){ const G=GM&&GM.G; if(!G) return; S.rec(G); if(G.dateLog._daily!==G.day){ G.dateLog._daily=G.day; S.daily(G); }
    if(G.flags&&!G.flags.SIS_EXAM_DONE&&typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>=STORY.dayOfKey(S.SIS_EXAM_END)&&!S.sisPreexam(G)) G.flags.SIS_EXAM_DONE=true;   /* 學姊研究所筆試考完（2026-02-02 以後）：學姊心願 D15 的條件（wish_bb.json，BB-C 68f18538，取代 SIS_HEALED）*/
    const now=G.day*24+G.hour; for(const t of G.trips){ if(t.status!=='booked'||t.reminded) continue; const dep=t.day*24+t.depart; if(now>=dep-1&&now<dep){ t.reminded=true; const L=S.loc(t.locs[0])||{}; if(GM.toast) GM.toast('手機｜提醒：'+hm(t.depart)+'，你約了'+nameOf(t.who)+'去'+(L.name||'')+'。',3200); } } };
  const hm=h=>typeof INV!=='undefined'&&INV.hhmm?INV.hhmm(h):String(h);
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  /* 睡覺的鬧鐘、跳過時間的停點（DATE-S4；AA_128 4-1）：那天約好的校外約會。h＝出發前 30 分鐘（鬧鐘）、dep＝出發時間（story3d.js 的 wakeAlarms、小睡；classes3d.js 的 skipStops 停在出發前 10 分鐘）*/
  S.alarmsFor=function(G,day){ return (G.trips||[]).filter(t=>t.status==='booked'&&t.day===day).map(t=>{ const L=S.loc(t.locs[0])||{}, label='和'+nameOf(t.who)+'去'+(L.name||''); return {h:t.depart-0.5,dep:t.depart,label,why:label+'（'+hm(t.depart)+' 出發）'}; }).sort((a,b)=>a.h-b.h); };
  /* 出發時間到了（AA_128 4-2、4-3）：出發／改時間／今天不去了。晚 60 分鐘以內照常出發；更晚只剩改時間、不去 */
  S.prompt=async function(GM,q){ const G=GM.G, t=S.trip(G,q.dateTrip); if(!t){ q.state='missed'; return 'no'; }
    const now=G.day*24+G.hour, dep=t.day*24+t.depart, late=now-dep>1;
    const opts=late?[{t:'改時間'},{t:'今天不去了'}]:[{t:'出發',hint:q.place+'　'+q.travel},{t:'改時間'},{t:'今天不去了'}];
    let k; GM.sceneBegin(); try{ await GM.say(null,'今天 '+hm(t.depart)+'，你約了'+nameOf(t.who)+'去'+q.place+'。'+(late?'……這次趕不上了。':'現在要出發嗎？')); k=await GM.choose(opts); } finally { GM.sceneEnd(); }
    const pick=opts[k]&&opts[k].t;
    if(pick==='出發'){ t.departed=true; t.status='going'; await OUT.go(GM,q); return 'go'; }
    if(pick==='改時間'){ return S.move(GM,q,t); }
    return S.drop(GM,q,t); };
  /* 改時間（第一版：同一天晚一小時、或明天同一時間；完整的日期時間選單是 DATE-S3）；改到第三次她說一句（BB 寫，還沒交）*/
  S.move=async function(GM,q,t){ const G=GM.G; let k; GM.sceneBegin(); try{ k=await GM.choose([{t:'晚一個小時'},{t:'改到明天同一個時間'},{t:'算了，今天不去了'},{t:'選別的日期和時間'}]); } finally { GM.sceneEnd(); }
    if(k===2) return S.drop(GM,q,t);
    if(k===3){ let w; GM.sceneBegin(); try{ w=await S.pickWhen(GM,{who:t.who,locs:t.locs,transport:t.transport,skip:t}); } finally { GM.sceneEnd(); } if(!w) return S.move(GM,q,t);   /* 完整的日期時間選單（DATE-S3）：重新檢查雙方的日程 */
      const P=w.check.plan; t.day=w.day; t.depart=w.depart; t.kind=P.kind; t.back=P.back; t.moves=(t.moves|0)+1; t.status='booked'; t.reminded=false; q.day=w.day; q.h=w.depart+P.travelH; q.ask=null; q.state='planned'; await S.movedLine(GM,t); return 'moved'; }
    const nd=k===1?t.day+1:t.day, nh=k===1?t.depart:Math.max(t.depart,G.hour)+1; const P=S.plan(G,{who:t.who,locs:t.locs,depart:nh,transport:t.transport});
    if(!P.ok||P.back>24.5){ if(GM.toast) GM.toast('這個時間回來太晚了，換一天吧。'); return S.move(GM,q,t); }
    t.day=nd; t.depart=nh; t.back=P.back; t.moves=(t.moves|0)+1; t.status='booked'; t.reminded=false; q.day=nd; q.h=nh+P.travelH; q.ask=null; q.state='planned'; await S.movedLine(GM,t); return 'moved'; };
  /* 改時間她回一句；同一個行程改到第三次說「第三次」那句（只說一次，之後照一般）*/
  S.movedLine=async function(GM,t){ GM.sceneBegin(); try{ if(t.moves===3&&!t.move3Said){ t.move3Said=true; if(await S.speak(GM,t.who,'move3',t)) return; } await S.speak(GM,t.who,'move',t); } finally { GM.sceneEnd(); } };
  /* 今天不去了（AA_128 4-3）：不加次數；30 天內第二次當天取消＝FLAKED_<id>，自在 -2（只扣這一次）*/
  S.drop=async function(GM,q,t){ const G=GM.G; t.status='cancelled'; q.state='missed'; const L=S.log(G,t.who); const recent=L.cancels.filter(d=>G.day-d<=30).length; S.cancel(G,t.who,G.day); let flaked=false;
    if(recent>=1&&!G.flags['FLAKED_'+t.who]){ G.flags['FLAKED_'+t.who]=G.day; flaked=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(t.who,{comf:-2}); }
    GM.sceneBegin(); try{ await S.speak(GM,t.who,flaked?'flaked':'cancel',t); } finally { GM.sceneEnd(); }   /* 取消她回一句；30 天內第二次＝放鴿子那一句（只說一次，她不追問）*/
    return 'no'; };
  /* 30 天沒有再取消就清掉 FLAKED（每天呼叫一次也可以）*/
  S.daily=function(G){ const F=G.flags||{}; for(const id of S.HEROINES){ const k='FLAKED_'+id; if(F[k]!=null){ const L=S.log(G,id); const last=L.cancels.length?L.cancels[L.cancels.length-1]:F[k]; if(G.day-last>30) delete F[k]; } } };

  /* ===== 半互動約會（第一版：文字選單；2D 底圖＋熱區＋人物圖層是 DATE-S6）＝AA_128 第 5 節 =====
     抵達一句 → 選 2～4 個互動點（時間、花費照 point_specs；時間不夠的灰掉）→ 收尾 → 結算（5-3 的數值；不顯示數字）→ DATE.complete 計次 */
  S.points=function(locId){ const P=(D().points||{}).points||{}; return Object.keys(P).filter(k=>k.startsWith(locId+'.')).map(k=>Object.assign({id:k},P[k])); };
  S.GAIN=[{npcRom:5,rom:4,comf:4,fam:2,trust:2},{npcRom:3,rom:2,comf:2,fam:1,trust:1},{npcRom:2,rom:2,comf:1,fam:1,trust:0}];
  S.LIKE={like:{npcRom:1,comf:1},normal:{comf:1},dislike:{}};
  S.likeOf=(id,spot)=>((((LN().loc||{})[spot.split('.')[0]]||{}).likes||{})[id]||{})[spot]||'normal';   /* 她喜歡哪些互動點（BB／AA 標，lines/Dxx.json；還沒匯入的地點都算普通）*/
  /* ===== 各地點的台詞（DATE-S6；BB_128 2-6、2-7、2-9；lines/Dxx.json 白名單匯入）=====
     選句順序（2-9）：心願事件 → 第一次 → 記得上次（第二次，或上次點過同一個互動點）→ 交往中 → 普通（照階段：低＝剛到第 5 階、中＝第 5 階後段（和她正式出去過兩次以上）、高＝第 6 階；排除最近用過的 3 套）。
     可昕：normal 就是交往中的版本（她開場是女友），分開以後用 afterBreakup。who:'note'＝給開發的註記（不顯示；「記 TASTE＝…」照記）、who:'narr'＝旁白。
     {sunset}＝那天淡水的日落時間（算出來的）；{lastDrink}＝上次點的飲料：TASTE 的說法 AA 還沒給（S.TASTE_WORD），有這個欄位的那一套先跳過。
     心願事件（wishEvent）是另外的整場（AA_127、BB_128 第 3 節），還沒做：先照普通的抵達句。 */
  S.TASTE_WORD={};
  S.mem=function(G,id,loc){ S.rec(G); const M=G.dateMemory[id]||(G.dateMemory[id]={}); const m=M[loc]||(M[loc]={picks:[],last:[],taste:null,photos:0,recent:[]}); if(!Array.isArray(m.picks)) m.picks=[]; if(!Array.isArray(m.last)) m.last=[]; if(!Array.isArray(m.recent)) m.recent=[]; return m; };   /* picks＝和她在這裡點過的互動點、last＝上一次點的 */
  S.tierOf=function(G,id){ const st=S.stageNum(id); return st>=6?'high':((S.log(G,id).count|0)>=2?'mid':'low'); };
  S.sunset=function(day){ const dt=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; if(!dt) return '傍晚';   /* NOAA 簡化公式：淡水 25.17°N、121.44°E、UTC+8 */
    const N=Math.floor((Date.UTC(dt.y,dt.m-1,dt.d)-Date.UTC(dt.y,0,0))/864e5), g=2*Math.PI/365*(N-1), eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g)),
      de=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g), la=25.17*Math.PI/180,
      ha=Math.acos(Math.cos(90.833*Math.PI/180)/(Math.cos(la)*Math.cos(de))-Math.tan(la)*Math.tan(de))*180/Math.PI, min=720-4*(121.44-ha)-eq+480; return hm(min/60); };
  const setUsable=(G,id,set,t)=>{ if(!set||!Array.isArray(set.lines)) return false; const tx=JSON.stringify(set.lines); if(/\{lastDrink\}/.test(tx)){ const tw=S.TASTE_WORD[S.mem(G,id,t.locs[0]).taste]; if(!tw) return false; } return true; };
  S.pickSet=function(G,id,pool,t,key){ const m=S.mem(G,id,t.locs[0]), tier=S.tierOf(G,id); const all=(pool||[]).map((x,i)=>({x,k:key+'#'+i})).filter(o=>setUsable(G,id,o.x,t));
    let ok=all.filter(o=>!o.x.tier||o.x.tier==='any'||o.x.tier===tier); if(!ok.length) ok=all; if(!ok.length) return null; const fresh=ok.filter(o=>!m.recent.includes(o.k)); const c=fresh.length?fresh[0]:ok.slice().sort((a,b)=>m.recent.indexOf(a.k)-m.recent.indexOf(b.k))[0];   /* 都用過了：挑最久以前用的 */
    m.recent=m.recent.filter(k=>k!==c.k); m.recent.push(c.k); while(m.recent.length>3) m.recent.shift(); return c.x; };
  S.playSet=async function(GM,id,set,t){ if(!set) return false; const G=GM.G, m=S.mem(G,id,t.locs[0]), me={name:nameOf(id),charId:id};
    const fill=x=>String(x).replace(/\{sunset\}/g,S.sunset(t.day)).replace(/\{lastDrink\}/g,S.TASTE_WORD[m.taste]||'');
    const run=async L=>{ for(const ln of (L||[])){ if(!ln||ln.who==='note'){ const mm=ln&&/記 `?TASTE`?＝`?([^`]+)`?/.exec(ln.text||''); if(mm) m.taste=mm[1]==='玩家點的'?'player':mm[1]; continue; }
        const tx=fill(ln.text); if(ln.who==='narr') await GM.say(null,/^（/.test(tx)?tx:'（'+tx+'）'); else if(ln.who===id) await GM.say(me,tx); else if(ln.who==='player'||ln.who==='you') await GM.say({name:G.name||'祐廷'},tx); else await GM.say({name:nameOf(ln.who),charId:ln.who},tx); } };
    await run(set.lines); if(Array.isArray(set.choice)&&set.choice.length){ const k=await GM.choose(set.choice.map(c=>({t:c.t}))); await run((set.choice[k]||{}).reply); } return true; };
  const LL=(id,loc)=>((((LN().loc||{})[loc]||{}).lines||{})[id])||null;
  const brokeUp=(G,id)=>id==='kexin'&&!(G.flags&&G.flags.dating_kexin);
  S.arriveLine=async function(GM,t,visits){ const G=GM.G, id=t.who, A=(LL(id,t.locs[0])||{}).arrive; if(!A) return false; const dating=!!(G.flags&&G.flags['dating_'+id]);
    let set=null; if(!visits&&A.first&&!A.first.wishEvent) set=A.first; if(!set&&dating&&id!=='kexin'&&(A.dating||[]).length) set=S.pickSet(G,id,A.dating,t,'arrive.dating'); if(!set&&brokeUp(G,id)&&(A.afterBreakup||[]).length) set=S.pickSet(G,id,A.afterBreakup,t,'arrive.after'); if(!set) set=S.pickSet(G,id,A.normal,t,'arrive.normal');
    return S.playSet(GM,id,set,t); };
  /* 照時間分兩段的台詞（陣列）：沛珊 D13 欄杆 firstHigh＝[重考以前, 重考以後]（AA_281 第 4 節 B-6；原本當物件讀、播出空的）。重考結束＝她的消失期最後一天的隔天 */
  S.timedSet=function(G,id,v){ if(!Array.isArray(v)) return v; if(!v.length) return null; if(v.length===1) return v[0]; const back=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2027-08-06'):null; return id==='classmate_peishan'&&back!=null&&G.day>=back?v[v.length-1]:v[0]; };
  S.spotLine=async function(GM,t,pid,visits){ const G=GM.G, id=t.who, H=((LL(id,t.locs[0])||{}).hotspots||{})[pid]; if(!H) return false; const m=S.mem(G,id,t.locs[0]), dating=!!(G.flags&&G.flags['dating_'+id]), hi=dating||S.stageNum(id)>=6, before=m.picks.includes(pid);
    let set=null; if(!before&&H.first&&!H.first.wishEvent) set=hi&&H.firstHigh?S.timedSet(G,id,H.firstHigh):H.first;
    if(!set&&(visits===1||m.last.includes(pid))&&H.remember&&setUsable(G,id,H.remember,t)) set=H.remember;   /* 記得上次：第二次，或上一次點過同一個互動點（BB_128 2-6）*/
    if(!set&&dating&&id!=='kexin'&&(H.dating||[]).length) set=S.pickSet(G,id,H.dating,t,pid+'.dating');
    if(!set&&brokeUp(G,id)&&(H.afterBreakup||[]).length) set=S.pickSet(G,id,H.afterBreakup,t,pid+'.after');
    if(!set&&S.likeOf(id,pid)==='dislike'){ const dl=((((LN().loc||{})[t.locs[0]]||{}).dislikeLine||{})[id]||{})[pid]; if(dl) set={lines:[{who:id,text:dl}]}; }
    if(!set) set=S.pickSet(G,id,H.normal,t,pid+'.normal');
    const played=await S.playSet(GM,id,set,t);
    if(hi){ const xk=Object.keys(H).find(k=>k.indexOf('extra:合照')===0); const x=xk&&H[xk]; if(x) await S.playSet(GM,id,Array.isArray(x)?S.pickSet(G,id,x,t,pid+'.extra'):x,t); }   /* 合照：第 6 階以上或交往中才有的那一句 */
    if(!m.picks.includes(pid)) m.picks.push(pid); return played; };
  S.closeLine=async function(GM,t,visits){ const G=GM.G, id=t.who, C=(LL(id,t.locs[0])||{}).closing; if(!C) return false; const dating=!!(G.flags&&G.flags['dating_'+id]);
    let set=null; if(!visits&&C.first&&!C.first.wishEvent) set=C.first; if(!set&&dating&&id!=='kexin'&&(C.dating||[]).length) set=S.pickSet(G,id,C.dating,t,'close.dating'); if(!set&&brokeUp(G,id)&&(C.afterBreakup||[]).length) set=S.pickSet(G,id,C.afterBreakup,t,'close.after'); if(!set) set=S.pickSet(G,id,C.normal,t,'close.normal');
    return S.playSet(GM,id,set,t); };
  S.scene=async function(GM,q){ const G=GM.G, t=S.trip(G,q.dateTrip); if(!t) return false; const who={name:nameOf(t.who),charId:t.who}; const loc=t.locs[0], L=S.loc(loc);
    const visits=(S.log(G,t.who).byLoc[loc]|0); const endH=t.day*24+t.back-S.travel(loc,t.transport).minutes/60; const spots=[], m0=G.money|0;
    const pts=S.points(loc), qk=visits>=2?S.quickPick(G,t.who,pts,endH):null;   /* 快速約會（AA_128 5-4：同一個地點第三次以後）*/
    await GM.say(null,'（'+L.name+'。）'); if(L.admission&&GM.money) GM.money(-L.admission,L.name+' 門票');
    if(qk&&(await GM.choose([{t:'自己選',hint:'照常一個一個選'},{t:'快速約會',hint:'她喜歡的：'+qk.map(p=>p.name).join('、')+'，直接結算'}]))===1){   /* 系統做兩個她喜歡的互動點、跳過介紹（抵達句、反應、收尾），直接結算 */
      for(const p of qk){ spots.push(p.id); if(GM.advance) GM.advance((p.min|0)/60); if(p.cost&&GM.money) GM.money(-p.cost,p.name); const lk=S.likeOf(t.who,p.id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&Object.keys(S.LIKE[lk]).length) SOCIAL.adjust(t.who,S.LIKE[lk]); S.photoAt(GM,t,p); }
      return S.settle(GM,t,spots,pts,visits,m0,{quick:true}); }
    await S.arriveLine(GM,t,visits);   /* 抵達句（第一次／普通／交往中）*/
    for(let n=0;n<4;n++){ const now=G.day*24+G.hour; const left=pts.filter(p=>!spots.includes(p.id));
      const opts=left.map(p=>({t:p.name,hint:(p.min|0)+' 分'+(p.cost?'　'+p.cost+' 元':''),dis:now+(p.min|0)/60>endH,why:'時間差不多了'})).concat([{t:n?'差不多了，回去吧':'就這樣回去'}]);
      const k=await GM.choose(opts.map(o=>o.dis?{t:o.t,hint:o.why,dim:true}:o)); if(k>=left.length) break; if(opts[k].dis){ if(GM.toast) GM.toast('時間差不多了'); n--; continue; }   /* 灰掉的（時間不夠）按了只提示，不結束 */
      const p=left[k]; spots.push(p.id); const said=await S.spotLine(GM,t,p.id,visits); if(!said&&p.act) await GM.say(null,'（'+p.act+'。）'); if(GM.advance) GM.advance((p.min|0)/60); if(p.cost&&GM.money) GM.money(-p.cost,p.name);   /* 互動點的反應（沒有台詞的地點照舊一句旁白）*/
      const lk=S.likeOf(t.who,p.id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&Object.keys(S.LIKE[lk]).length) SOCIAL.adjust(t.who,S.LIKE[lk]); S.photoAt(GM,t,p);
      if(spots.length===3&&pts.length>3) await S.speak(GM,t.who,'enough',t,{obj:null});   /* 第三個互動點之後她說一句「差不多了」（BB_128 2-5 第 5 步；不分地點）*/ }
    t.spots=spots; S.mem(G,t.who,loc).last=spots.slice();
    if(!spots.length){ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(t.who,{fam:1}); t.status='cancelled'; if(!await S.speak(GM,t.who,'leaveEarly',t,{obj:null})) await GM.say(who,'……就這樣？'); return {counted:false}; }   /* 一個都沒做就走：她那一句（BB_128 3-6；沒有的人照 AA_128 5-2 的例句）*/
    await S.closeLine(GM,t,visits);   /* 收尾句（第一次／普通／交往中）*/   /* 做了 0 個就離開：不算次數、熟悉 +1（「就這樣？」是 AA_128 5-2 的例句，各人的句子 BB 寫）*/
    return S.settle(GM,t,spots,pts,visits,m0); };
  /* 結算（AA_128 5-1 第 5 步、5-3）：去了哪裡、做了什麼、花了多少錢（祐廷自己的：門票、互動點、來回車資）、照片存進相簿；不顯示好感數字 */
  S.settle=async function(GM,t,spots,pts,visits,m0,o){ const G=GM.G, loc=t.locs[0], L=S.loc(loc);
    t.spots=spots; S.mem(G,t.who,loc).last=spots.slice(); t.status='done'; const firstWish=S.wishOf(t.who)===loc&&!S.log(G,t.who).wish;
    const r=S.complete(G,t);
    if(r.counted&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ SOCIAL.adjust(t.who,S.GAIN[Math.min(visits,2)]); if(firstWish) SOCIAL.adjust(t.who,{npcRom:4,trust:3}); }
    if(r.counted&&typeof TERMEND!=='undefined'&&TERMEND.contact) TERMEND.contact(G,t.who,'meet');   /* 學期末的飯：正式約會 +2（BB_202 1-1）*/
    if(r.counted&&r.count===1) G.flags['DATED_1_'+t.who]=true;   /* 第一次之後：當晚她傳一張照片或一句話（AA_128 5-5；訊息內容 BB 寫）*/
    if(r.counted&&!(o&&o.quick)) await S.confessOffer(GM,t);   /* 告白：正式校外約會的結尾（AA_128 5-5、AA_215 第 1 節）*/
    const spent=Math.max(0,(m0|0)-(G.money|0))+(t.fare|0), ph=(G.album||[]).some(a=>a.trip===t.trip);
    await GM.say(null,'（今天去了'+L.name+'：'+spots.map(id=>(pts.find(p=>p.id===id)||{}).name).join('、')+'。'+(spent?'花了 '+spent+' 元'+(t.fare?'（含來回車資）':'')+'。':'')+(ph?'照片存進相簿。':'')+'）');   /* 結算畫面：去了哪裡、做了什麼、花了多少錢、相簿（不顯示好感數字）*/
    return r; };
  /* ===== 告白（ROM-1017-L／SYS-02；AA_215 第 1 節（使用者定案）、AA_128 3-1～3-3、AA_126 4-2）=====
     正式校外約會的結尾、條件到齊（canConfess）＋這一位的台詞已經交付（data/confess_lines.js）才出現「（告訴她）」；不說不扣分。
     答應＝ROM.start（dating_<id>、交往紀錄）；還沒＝記 notYetFlag，不鎖線：兩週後、而且中間再多一次正式校外約會才會再出現；
     答應還是還沒（BB_191 第 10 節 @f3ae0e82，不擲骰）：她願意時，她的戀愛（npcRom）到她的答應線（YES_LINE；第 6 階是 55，AA 可以調）＝答應，沒到＝還沒；
     「還沒」兩次以後的那一次（第三次告白）一定答應（仍然願意、仍是第 6 階）；「還沒」不扣數值、不改階段；
     學姊研究所筆試以前（decline:'preexam'）＝婉拒、記 preexamFlag，一樣不鎖線（筆試前再說還是婉拒）。台詞一律照交付的定稿，這裡不寫字 */
  S.YES_LINE={heroine_04:62,classmate_peishan:65,heroine_03:68,heroine_02:68,heroine_05:70,heroine_01:72};
  S.confessDecide=function(G,id){ const L=S.log(G,id); if((L.notYetN|0)>=2) return 'yes'; const line=S.YES_LINE[id]; if(line==null) return 'yes'; const CD=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[id]:null; if(CD&&!CD.notYet) return 'yes';   /* 沒有「還沒」台詞的人（語彤：YT_NOT_YET 作廢）＝答應 */
    const r=typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(id):null; return r&&(+r.npcRom||0)>=line?'yes':'notYet'; };
  /* 這一趟有沒有吃東西的互動點（AA_223 第 3 節：餐廳、小吃、甜點、飲料都算；只逛、只玩扭蛋不算）：子晴告白的第一句 */
  S.EAT=['D04.snack','D05.cafe','D06.cafe','D09.tea','D10.snack','D12.tea','D13.drink','D15.store','D16.rest','D18.snack','D18.teahouse','D20.street','D22.fish','D23.cook','D24.street','D25.cafe','D28.alley','D30.stall','D31.egg','D32.stall'];
  S.ate=t=>!!t&&Array.isArray(t.spots)&&t.spots.some(id=>S.EAT.includes(id));
  const CL=id=>(typeof CONFESS_LINES!=='undefined'&&CONFESS_LINES[id])||null;
  const CV=(x,G,...a)=>typeof x==='function'?x(G,...a):x;   /* 台詞表的欄位可以是陣列，或照情況給陣列的函式 (G,t,k) */
  S.confessReady=function(G,id,t){ const c=S.canConfess(G,id), D=CL(id); if(!c.ok) return c; if(!D||!D.yes) return {ok:false,why:'lines'};
    if(c.decline&&!D[c.decline]) return {ok:false,why:'lines'}; if(typeof D.hideIf==='function'&&D.hideIf(G,t)) return {ok:false,why:'hidden'};   /* hideIf：這段期間不走一般告白（例：沛珊重考期，改用特別場面；AA_223 第 4 節 @52702c92）*/ if(typeof D.only==='function'&&!D.only(G,t)) return {ok:false,why:'place'};   /* only：只在某些場合（例：語彤只在淡水收尾）*/
    const L=S.log(G,id), ny=L.notYet; if(ny&&(G.day-ny.day<14||(L.count|0)<=(ny.count|0))) return {ok:false,why:'notYet'}; return c; };
  S.confessOffer=async function(GM,t){ if(typeof TERMEND!=='undefined'&&TERMEND.ON) return false;   /* 告白只在學期末（BB_203；使用者 2026-10-17 11:40）：約會收尾不再有告白，改成期末飯後的回家路上（termend3d.js）*/ const G=GM.G, id=t.who, c=S.confessReady(G,id,t); if(!c.ok) return false;
    const k=await GM.choose([{t:'（告訴她）'},{t:'（今天先不說）'}]); if(k!==0) return false; return S.confess(GM,id,c,t); };
  S.confess=async function(GM,id,c,t){ const G=GM.G, D=CL(id), L=S.log(G,id), me={name:nameOf(id),charId:id};
    const run=async lines=>{ for(const ln of (lines||[])){ if(ln==null) continue; const x=typeof ln==='string'?{who:id,text:ln}:ln, o=x.expr?{expr:x.expr}:undefined;
        if(Array.isArray(x.choice)){ const kk=await GM.choose(x.choice.map(q=>({t:q.t}))); await run((x.choice[kk]||{}).say); continue; }   /* 中間的小選擇（例：學姊婉拒以後「好。」／「我知道了。」）*/
        if(x.who==='narr') await GM.say(null,/^（/.test(x.text)?x.text:'（'+x.text+'）'); else if(x.who==='player') await GM.say({name:G.name||'祐廷'},x.text); else if(x.who===id) await GM.say(me,x.text,o); else await GM.say({name:nameOf(x.who),charId:x.who},x.text,o); } };
    await run(CV(D.say,G,t)); let k=-1; const ch=CV(D.choice,G,t); if(Array.isArray(ch)&&ch.length){ k=await GM.choose(ch.map(q=>({t:q.t}))); await run((ch[k]||{}).say); }
    const res=c.decline?c.decline:(typeof D.unwillingIf==='function'&&D.unwillingIf(G,t)?'unwilling':(typeof D.decide==='function'?D.decide(G,t,k):S.confessDecide(G,id)));   /* unwilling：她當時不願意（AA_223：沛珊重考期等），選項照樣出現、她婉拒、不鎖線 */
    if(res==='yes'&&typeof ROM!=='undefined'&&ROM.start&&ROM.start(G,id)){ await run(CV(D.yes,G,t,k)); (G.flags.confessed||(G.flags.confessed={}))[id]=G.day; return 'yes'; }
    L.notYet={day:G.day,count:L.count|0};
    if(res==='preexam'||res==='prerank'){ await run(CV(D[res],G,t,k)); const fl=D[res+'Flag']; if(fl) G.flags[fl]=G.day; return res; }   /* 學姊：筆試前／放榜前婉拒，不鎖線 */
    if(res==='unwilling'){ await run(CV(D.unwilling,G,t,k)); return 'unwilling'; }
    L.notYetN=(L.notYetN|0)+1; L.notYet.n=L.notYetN; await run(CV(D.notYet,G,t,k)); if(D.notYetFlag) G.flags[D.notYetFlag]={n:L.notYetN,day:G.day}; return 'notYet'; };
  /* 快速約會可以做的兩個：她喜歡的優先，不夠用普通的補（不用她不太喜歡的）；時間要夠。少於兩個就不提供 */
  S.quickPick=function(G,id,pts,endH){ const now=G.day*24+G.hour; let tot=0; const ok=[]; for(const lk of ['like','normal']) for(const p of pts){ if(ok.length>=2) break; if(S.likeOf(id,p.id)!==lk||ok.includes(p)) continue; if(now+(tot+(p.min|0))/60>endH) continue; ok.push(p); tot+=p.min|0; } return ok.length>=2?ok:null; };
  /* 相簿（Life Album，AA_128 5-1、5-2 拍照位置）：拍照的互動點存一張（底圖＋她的人物圖層；合照要第 6 階或交往中）。G.album＝[{kind,trip,who,loc,day,h,both}]；手機「相簿」照時間排 */
  S.photoAt=function(GM,t,p){ if(!/\.photo$/.test(p.id)) return false; const G=GM.G; if(!Array.isArray(G.album)) G.album=[]; if(G.album.some(a=>a.trip===t.trip)) return false;
    const both=!!(G.flags&&G.flags['dating_'+t.who])||S.stageNum(t.who)>=6; G.album.push({kind:'date',trip:t.trip,who:t.who,loc:t.locs[0],day:G.day,h:+(G.hour%24).toFixed(2),both}); if(GM.toast) GM.toast('照片存進相簿',2200); return true; };
  return S;
})();
