/* ===== 畢業以後的固定格：可昕「我們的日子」（AA_366 第二版，AA366-KX-POSTGRAD-1021）、交往中的六位每月一格（AA_367，AA367-PG-DATES-1021）=====
   台詞（開頭那一則、每一格她說的一句）在 src/data/pg_dates.js：tools/story/import_pg_dates.py 照白名單的企劃線 a7bd9741 產生，不要手改。這裡是規則（照稿的條文，註解寫出處）。
   一格（S.kxList、S.upcoming 回傳的格式）＝{who, key, day, h, kind, place, bg, line, id, ev, title, travel, travelH}：
     who 人物 id；key 可昕＝稿上的日子（P3＝那一週的週一）、六位＝月份 YYYY-MM；day 第幾天、h 幾點（臺灣時間）；
     kind meet 見面／video 視訊／call 電話／tn 去台南；place 地點字幕（也是出遊的地點）；bg 2D 背景；line 她說的那一句；
     id 出遊的 id（可昕 kx_od_<day>，和 AA_354 大二～大四的固定格同一套；六位 pg_date_<id>_<YYYY-MM>）；ev 那一格的事件（ev_kx_od_pg_<key>、ev_pg_date_<id>_<YYYY-MM>）。
   旗標（存檔；舊存檔沒有＝沒有）：KX_OD_PG＝可昕最近傳過的開頭那一則（'p1'～'p5'，AA_366 第 3 節）；PG_DATE_<id>＝六位用過的月份（陣列，排成出遊的那一刻記，AA_367 第 0 節）。
   做法（畢業後篇的停點，src/postgrad3d.js）：
     - PG.stops：下一格「該問要不要出發」的時間（約好的時間減車程、再減 15 分鐘，同 OUT.due）。長跳（跳到下一件事）停在那裡，不靠每 6 小時看一次的整點規則。
     - PG.RULES（每 0.5 秒、跳的每一步）：到了那個時間、還沒排＝排成出遊（OUT.plan，不跳「排進行程」的提示），照常問「出發／晚一點／不去了」；
       去了＝地點字幕＋她那一句（每一格一個事件），結束、跳到下一站；略過＝沒有台詞、不扣分。
       不再交往（分手、ROM.end；AA_346 選了另一位、還沒談的那幾位）＝已經排好的改成 skipped，之後不排。
     - 過了的格子不補：可昕從現在之後的下一格開始（AA_366 第 3 節）；六位從現在這個月開始，那個月的週六過了就往後找同月的下一個週六（AA_367 第 0 節「從讀檔那個月開始排，不補過去的月份」）。
     - 可昕開頭那一則：PG.MSGS（21:00 她私訊兩則），那一段的第一週內才傳（win，到第 7 天 24:00），過了不補（AA_366 第 3 節）。
   AA_366（可昕）：法律系、交往中、KX_OUR_DAY 有值、畢業後篇；P1 一試前（隔週日 19:00）、P2 一試後（隔週日 19:00）、P3 二試後（照 KX_OUR_DAY.day 那一週：週五 19:00／週六、週日 14:00）、
     P4 職前訓練（隔週六 21:00 電話，祐廷打給她）、P5 實習以後（每月第一個週日 19:00）。日子照稿（第 1、2 節）；地點：見面照「公館、河濱、政大小吃街」輪流，P4＝電話。
     不排：讀書小組有她的＝P1（開頭那一則也不傳）；P5 那個月已經有一對一接觸（第 1 節四種）。和 AA_351 接：只和她一位交往的時候，準時到 KX_CRACK −1（最低 0）、遲到超過 15 分鐘 ＋1、
     說了「晚一點」最後沒到 ＋1、「不去了」不算（第 3 節；「答應了」＝說了晚一點，見回報給 AA 的問題）。
   AA_367（以安、芷若、語彤、子晴、學姊、沛珊）：交往中、畢業後篇、2029-06-03～2030-12-13；每月第一個週六（各人的時間、地點、方式照第 1～6 節）；
     那一天有別的事（稿上舉的四天、PG 的場景、別的出遊、可昕的格子、排在前面的另一位）就往後找同月的下一個週六；整個月排不到就跳過；
     表上沒有那個月＝那個月已經有一對一接觸；有條件的不排照各節；交換延畢的大五上（2029-09～2030-01）照一般遊戲、不排（第 0、8 節）。
   測試：node tests/aa366_kx_postgrad_unit.js、tests/aa367_pg_dates_unit.js */
'use strict';
const PGDATE=(function(){
  const S={};
  const D=()=>typeof PG_DATES!=='undefined'?PG_DATES:null;
  const DK=k=>typeof PG!=='undefined'&&PG.DK?PG.DK(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);   /* 交往中的叫法（學姊＝書瑀）照 SOCIAL.displayName */
  S.FROM='2029-06-03'; S.TO='2030-12-13';   /* AA_367 第 0 節：畢業以後到尾聲（12/13 以後就是尾聲）*/
  S.LATE=0.5;   /* 出遊的「晚一點」可以到幾點（約好的時間後 30 分鐘；同畢業後篇其他的出遊）*/
  S.OPEN_H=21;   /* AA_366 第 1 節：開頭那一則（她私訊，21:00）*/
  S.OPEN_WIN=6*24+3;   /* AA_366 第 3 節：開頭那一則只在那一段的第一週內傳（到第 7 天 24:00），過了不補 */
  /* ---------- 不再交往、選了別人 ---------- */
  /* AA_367 第 0 節「2030-05-25 選一個人以後，照 AA_346，分開的那幾位就停」：選了以後、談話以前她還是交往中（r2y4b3d.js 的 CHOICE_APART29／30），這裡就當作停了 */
  S.leaving=function(G,id){ const F=(G&&G.flags)||{}; for(const k of ['CHOICE_APART29','CHOICE_APART30']){ const R=F[k], P=R&&R.at&&R.at[id]; if(P&&P.st!=='done'&&P.st!=='void') return true; } return false; };
  S.wants=(G,id)=>dating(G,id)&&!S.leaving(G,id);
  S.on=G=>law(G)&&typeof PG!=='undefined'&&!!PG.on&&PG.on(G)&&DK(S.TO)!=null&&now(G)<T(DK(S.TO),24);   /* 畢業後篇（跳日期）；尾聲以前 */
  /* ---------- 可昕（AA_366）---------- */
  S.KX_DAY={fri:4,sat:5,sun:6};   /* P3：那一週（稿上寫週一）往後幾天＝KX_OUR_DAY.day */
  S.WD_NAME={fri:'週五',sat:'週六',sun:'週日'};   /* P3 開頭那一則的 {星期}（AA_354 第 2 節：{星期}＝週五／週六／週日）*/
  /* 見面的地點（AA_366 第 1 節「地點照 AA_354（公館、河濱、政大小吃街輪流）」）：字幕、背景、車程照大一下那一段（story3d.js K5 之後每週），政大照畢業後篇（6/9、K26：開車約 40 分鐘）*/
  S.KX_PLACES=[{place:'公館',bg:'gongguan',title:'我們的日子：約在公館',travel:'騎車約 10 分鐘',travelH:1/6},
    {place:'河濱',bg:'riverside',title:'我們的日子：河濱',travel:'騎車約 15 分鐘',travelH:0.25},
    {place:'木柵大學・山下的小吃街',bg:'nccu_food',title:'我們的日子：開車去木柵大學',travel:'開車約 40 分鐘',travelH:2/3}];
  S.KX_CALL={place:'電話',bg:null,title:'我們的日子：電話',travel:'',travelH:0};   /* P4（受訓：「隔週六晚上。你打給我。」）：地點字幕寫「電話」*/
  let kxDefs=null;
  S.kxDefs=function(){ if(kxDefs) return kxDefs; const K=D()&&D().kexin; if(!K) return []; let n=0;
    kxDefs=K.slots.map(s=>{ const call=!!(K.segs[s.seg]&&K.segs[s.seg].call), P=call?S.KX_CALL:S.KX_PLACES[(n++)%S.KX_PLACES.length];   /* 輪流：見面的格子照稿的順序（P4 電話不算）*/
      return Object.assign({who:'kexin',seg:s.seg,key:s.key,week:!!s.week,line:s.line,kind:call?'call':'meet',ev:'ev_kx_od_pg_'+s.key,hours:call?1:2},P); });
    return kxDefs; };
  S.kxOn=G=>S.on(G)&&S.wants(G,'kexin')&&!!G.flags.KX_OUR_DAY&&typeof G.flags.KX_OUR_DAY==='object'&&!(typeof MREL!=='undefined'&&MREL.kxOdPaused&&MREL.kxOdPaused(G));   /* 第 3 節觸發：法律系、交往中、KX_OUR_DAY 有值；可昕收回以後回 B＝暫停（AA_474 第 3 節）*/
  /* 那一段整段不排：讀書小組有她的玩家沒有 P1（7/29 以前每週已經有兩三次視訊和讀書）；P3 要知道是星期幾 */
  S.kxSegOff=function(G,seg){ const sg=typeof PG!=='undefined'&&PG.studyGroup?PG.studyGroup(G):null; if(seg==='p1'&&(sg==='kexin'||sg==='three')) return true;
    if(seg==='p3'){ const OD=G.flags.KX_OUR_DAY; if(!OD||S.KX_DAY[OD.day]==null) return true; } return false; };
  /* P5 那個月已經有她的一對一接觸＝那個月不排（第 1 節；群組訊息不算）*/
  S.kxMonthOff=function(G,s){ if(s.seg!=='p5') return false; const F=G.flags||{}, ym=s.key.slice(0,7);
    if(ym==='2030-03') return PG.delayed(G)&&(F.GRAD_EXAM_2030===true||F.GRAD_EXAM_RESULT!=null);   /* 延畢、研究所筆試有結果的（3/15 私訊，r2y4a3d.js y5_kx_grad）*/
    if(ym==='2030-08') return PG.retaker(G);   /* 重考的（8/2 私訊，r2y4b3d.js y5_kx_0802）*/
    if(ym==='2030-10') return !!F.KX_SHELF;   /* 有 KX_SHELF 的（10/1 私訊，y6_kx_shelf）*/
    if(ym==='2030-12') return PG.sits(G,2030);   /* 2030 年考的（12/13 麵店，她最後到）*/
    return false; };
  S.kxWhen=function(G,s){ const K=D().kexin, seg=K.segs[s.seg], d0=DK(s.key); if(d0==null) return null;
    if(s.week){ const OD=G.flags.KX_OUR_DAY, off=OD&&S.KX_DAY[OD.day]; if(off==null) return null; return {day:d0+off,h:seg.h[OD.day]}; }
    return {day:d0,h:seg.h}; };
  /* 這個玩家的全部格子（照日子排；不排的不在裡面）*/
  S.kxList=function(G){ const out=[]; if(!G||!G.flags||!G.flags.KX_OUR_DAY||!D()) return out;
    for(const s of S.kxDefs()){ if(S.kxSegOff(G,s.seg)||S.kxMonthOff(G,s)) continue; const w=S.kxWhen(G,s); if(!w) continue; out.push(Object.assign({},s,w,{id:'kx_od_'+w.day})); }
    return out.sort((a,b)=>T(a.day,a.h)-T(b.day,b.h)); };
  /* 開頭那一則（PG.MSGS）*/
  S.kxOpenItems=function(G,seg){ const K=D().kexin.segs[seg], OD=G.flags.KX_OUR_DAY||{}; return K.lines.map(t=>({th:'p:kexin',from:'kexin',text:t.replace('{星期}',S.WD_NAME[OD.day]||'')})); };
  S.MSGS=D()?Object.keys(D().kexin.segs).map(seg=>({tag:'kx_od_pg_'+seg,at:[D().kexin.segs[seg].open,S.OPEN_H],win:S.OPEN_WIN,
    cond:G=>S.kxOn(G)&&!S.kxSegOff(G,seg),items:G=>S.kxOpenItems(G,seg),after:G=>{ G.flags.KX_OD_PG=seg; }})):[];
  /* 和 AA_351 接（第 3 節）：只和她一位交往的時候才算（AA_351 第 1 節）。準時（到的時候不晚於約好的時間 15 分鐘）−1（最低 0）、遲到超過 15 分鐘 ＋1 */
  S.kxSolo=G=>{ const P=typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]; return P.length===1&&P[0]==='kexin'; };
  S.kxArrive=function(G,q){ if(!q||!S.kxSolo(G)||typeof ROM==='undefined'||!ROM.crack) return 0; const late=now(G)-T(q.day,q.h);
    if(late>0.25+1e-6){ ROM.crack(G,'kexin',1); return 1; } if((+G.flags.KX_CRACK||0)>0){ ROM.crack(G,'kexin',-1); return -1; } return 0; };
  /* 說了「晚一點」（q.ask）、最後過了時間還沒出發＝答應了沒到 ＋1；「不去了」（時間還沒過就 missed）＝略過，不算 */
  S.kxMissed=function(G,q){ if(!q||!S.kxSolo(G)||typeof ROM==='undefined'||!ROM.crack) return 0; if(q.ask!=null&&now(G)>T(q.day,q.h)+(q.late!=null?q.late:0.75)+1e-6){ ROM.crack(G,'kexin',1); return 1; } return 0; };
  /* ---------- 六位（AA_367）---------- */
  S.SIX=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan'];   /* 同一天撞到兩位：照這個順序（稿的第 1～6 節），後面那一位往後找下一個週六 */
  S.BLOCK=['2029-06-02','2029-08-04','2030-08-03','2030-02-02'];   /* 第 0 節舉的例：畢業典禮、兩年的國考一試、除夕——那一天一定往後一週 */
  S.TN=['2029-10','2030-03','2030-06','2030-10'];   /* 沛珊：大約每三個月一次改成去台南（第 6 節）*/
  /* 方式（第 1～6 節）：off＝週六之後第幾天（芷若單月、以安在紐約＝隔天週日），h＝幾點（臺灣時間）；hours＝演完往後幾小時（出遊的事件）*/
  S.MODE={
    lib:{kind:'meet',place:'總圖 B1 的長桌',bg:'ntu_lib_b1',travel:'走過去約 15 分鐘',travelH:0.25,hours:2},   /* 以安臺北：週六 15:00，總圖 B1 的長桌，她讀完一起走出來 */
    ny:{kind:'video',place:'視訊（紐約）',bg:'video',hours:1},   /* 以安 2030-08-11 以後：視訊，臺灣時間週日 08:00（紐約週六晚上）*/
    cafe:{kind:'meet',place:'兩點半 Café 打烊以後',bg:'dark',travel:'走過去約 15 分鐘',travelH:0.25,hours:1},   /* 芷若雙月：週六 22:00，Café 打烊以後（字幕照 termend_lines.js PLACE.cafe）*/
    movie:{kind:'meet',place:'早場電影',bg:'gongguan_cinema',travel:'走過去約 15 分鐘',travelH:0.25,hours:2},   /* 芷若單月：週日早上 10:00，早場電影 */
    noodle:{kind:'meet',place:'麵店打烊以後',bg:'noodle_table',travel:'走過去約 15 分鐘',travelH:0.25,hours:1},   /* 語彤：週六 21:30，麵店打烊以後 */
    yexiao:{kind:'meet',place:'公館宵夜',bg:'gongguan_luwei',travel:'走過去約 15 分鐘',travelH:0.25,hours:1},   /* 子晴：週六 23:00，公館宵夜 */
    eatery:{kind:'meet',place:'法圖旁邊那家',bg:'xiaofu',travel:'走過去約 10 分鐘',travelH:1/6,hours:1.5},   /* 學姊：週六 18:30，法圖旁邊那家（背景照期末飯那一家 termend_lines.js PLACE.eatery_lib）*/
    video:{kind:'video',place:'視訊',bg:'video',hours:1},   /* 沛珊平常：週六 22:00 視訊 */
    tn:{kind:'tn',place:'台南・她的學校',bg:'tn_school',travel:'高鐵約一小時四十分鐘',travelH:1.75,fare:2700,hours:1.75} };   /* 沛珊去台南：週六當天來回、坐高鐵（地點、車程、票錢照 AA_282 的台南私下約，hometown_lines.js；傍晚回程）*/
  S.sixMode=function(who,ym){ const m=+ym.slice(5);
    switch(who){
      case 'heroine_01': return ym>'2030-08'?{m:'ny',off:1,h:8}:{m:'lib',off:0,h:15};   /* 2030-08 是送機（不排）：9 月起在紐約 */
      case 'heroine_02': return m%2===0?{m:'cafe',off:0,h:22}:{m:'movie',off:1,h:10};
      case 'heroine_03': return {m:'noodle',off:0,h:21.5};
      case 'heroine_04': return {m:'yexiao',off:0,h:23};
      case 'heroine_05': return {m:'eatery',off:0,h:18.5};
      case 'classmate_peishan': return S.TN.includes(ym)?{m:'tn',off:0,h:10.5}:{m:'video',off:0,h:22};
    } return null; };
  S.line=(who,ym)=>{ const L=D()&&D().six&&D().six[who]; const r=L&&L.find(x=>x.ym===ym); return r?r.line:null; };
  S.used=(G,who,ym)=>{ const A=G.flags&&G.flags['PG_DATE_'+who]; return Array.isArray(A)&&A.includes(ym); };
  /* 那個月不排（第 1～6 節「不排的月份」）：表上沒有那個月的（她已經有接觸）＋有條件的那幾條；交換延畢的大五上 */
  S.sixOff=function(G,who,ym){ const F=G.flags||{}; if(!S.line(who,ym)) return true;
    if(PG.delayed(G)&&ym==='2029-12') return true;   /* 交換延畢：大五上（2029-09～2030-01）一樣排（AA_367 第 10 節 A4，企劃線 e6d4a198；原本「照一般遊戲」作廢——大五上也是跳日期），只有 2029-12 不排（12/21 延畢的期末約會，termend3d.js）*/
    const sg=PG.studyGroup(G), yt=sg==='three'||sg==='yutong', pass29=F.BAR_SIT_2029===true&&PG.stage2(G,2029);   /* 2029 年上榜＝一試過了（這一版二試都會上，12/14 放榜）*/
    if(who==='heroine_03'){
      if(yt&&ym>='2029-06'&&ym<='2029-08') return true;   /* 有讀書小組的玩家：2029-06～08 照小組 */
      if(ym==='2029-12'&&yt&&pass29) return true;   /* 2029 年上榜、有讀書小組的（放榜那天的麵店）*/
      if((ym==='2030-07'||ym==='2030-12')&&yt&&PG.sits(G,2030)) return true; }   /* 2030 年考、有讀書小組的（7/11 總圖 B1、12/13 麵店：那兩場會演就不排）——重考的，和交換延畢 2030 第一次考的（AA_367 第 10 節 A4，企劃線 e6d4a198）*/
    if(who==='heroine_05'){
      if(ym==='2029-08'&&PG.sits(G,2029)) return true;   /* 2029 年報國考的台灣路線（8/4 考場門口當面給便條）*/
      if(ym==='2029-09'&&F.BAR_SIT_2029===true&&PG.stage(G,2029)==='none') return true;   /* 2029 年沒考上、要重考的（9/7 私訊）*/
      if(ym==='2029-12'&&pass29) return true;   /* 2029 年上榜的（12/14 私訊）*/
      if((ym==='2030-08'||ym==='2030-12')&&PG.sits(G,2030)) return true; }   /* 2030 年才考的（8/3 考場門口、12/13 私訊）*/
    return false; };
  const satCache={};
  S.sats=function(ym){ if(satCache[ym]) return satCache[ym]; const out=[], a=DK(S.FROM), b=DK(S.TO), m=+ym.slice(5);
    for(let d=1;d<=31;d++){ const dd=DK(ym+'-'+String(d).padStart(2,'0')); if(dd==null) break; const x=CALENDAR.dateOf(dd); if(x.m!==m) break; if(x.wd===6&&dd>=a&&dd<=b) out.push(dd); }
    return satCache[ym]=out; };
  S.MONTHS=(()=>{ const out=[]; for(let y=2029,m=6;y<2031;){ out.push(y+'-'+String(m).padStart(2,'0')); if(++m>12){ m=1; y++; } } return out; })();   /* 2029-06～2030-12 */
  const ymOf=day=>{ const x=CALENDAR.dateOf(day); return x.y+'-'+String(x.m).padStart(2,'0'); };
  S.sixSlot=function(G,who,ym,day,md){ const M=S.MODE[md.m], n=nm(who), tl=M.kind==='tn'?'去台南找'+n:'和'+n+'：'+M.place;
    return Object.assign({who,key:ym,day,h:md.h,line:S.line(who,ym),id:'pg_date_'+who+'_'+ym,ev:'ev_pg_date_'+who+'_'+ym,title:tl},M,M.kind==='tn'&&S.TN_PLACE[ym]?{place:S.TN_PLACE[ym]}:{}); };
  S.TN_PLACE={'2030-10':'台南・她實習的國小'};   /* AA_367 第 10 節 A3（企劃線 a7bd9741 起）：2030-10 那一句是「帶你來看我實習的學校。」——地點字幕換這一個；2029-10、2030-03、2030-06 照「台南・她的學校」*/
  /* 這一天有別的事（第 0 節「那一天撞到別的停點」）：稿上舉的四天、PG 的場景（S.STEPS：時間到了一定演的）、別的出遊（排好的、去過的）、可昕的格子；
     只在手機上的訊息不算（不佔那一天）——見回報給 AA 的問題。d0～d1＝要看的日子 */
  S.busyDays=function(G,d0,d1){ const out=new Set(), add=d=>{ if(d!=null&&d>=d0&&d<=d1) out.add(d); };
    for(const k of S.BLOCK) add(DK(k));
    if(typeof PG!=='undefined'){ for(const [k] of (PG.SOFT||[])) add(DK(k));
      const done=PG.rec(G).done; for(const s of PG.STEPS){ if(done[s.id]) continue; let t=null; try{ t=s.at(G); }catch(e){ t=null; } if(t==null||!isFinite(t)) continue; const d=Math.floor(t/24); if(d<d0||d>d1) continue;
        let ok=false; try{ ok=!!s.cond(G); }catch(e){ ok=false; } if(ok) add(d); } }
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)) if(q.state==='planned'||q.state==='done') add(q.day);
    if(typeof DATE!=='undefined'&&DATE.tripDays) for(const d of DATE.tripDays(G)) add(d);   /* 已經約好的校外約會：兩天一夜的第二天也佔掉（出遊只記第一天，BUG-DATE-OVERLAP-1021）*/
    if(S.kxOn(G)) for(const s of S.kxList(G)) add(s.day);
    if(typeof PG!=='undefined'&&PG.seaOk&&PG.seaOk(G)) add(DK('2030-06-02'));   /* 學姊 2030 年的生日（AA_382 第 4 節：6/2 那天算有事，還沒回 6/1 的私訊也一樣）*/
    return out; };
  /* 那個月六位的格子（照順序，後面那一位不排在前面那一位的那一天）；過了的週六不補，往後找同月的下一個 */
  S.sixMonth=function(G,ym,busy){ const out={}, taken=new Set(), n=now(G), end=DK(S.TO);
    for(const who of S.SIX){ if(!S.wants(G,who)||S.used(G,who,ym)||S.sixOff(G,who,ym)) continue; const md=S.sixMode(who,ym);
      for(const sat of S.sats(ym)){ const day=sat+md.off; if(day>end||busy.has(day)||taken.has(day)) continue; if(T(day,md.h)+S.LATE<n-1e-6) continue;
        out[who]=S.sixSlot(G,who,ym,day,md); taken.add(day); break; } }
    return out; };
  /* 每一位的下一格（還沒排成出遊的；可昕、六位各一格）*/
  S.upcoming=function(G){ const out=[]; if(!G||!G.flags||!S.on(G)) return out; const n=now(G);
    if(S.kxOn(G)) for(const s of S.kxList(G)){ if(T(s.day,s.h)+S.LATE<n-1e-6) continue; if(typeof OUT!=='undefined'&&OUT.get(G,s.id)) continue; out.push(s); break; }
    const want=S.SIX.filter(id=>S.wants(G,id)); if(!want.length) return out;
    const left=new Set(want), y0=ymOf(G.day), busy=S.busyDays(G,G.day,DK(S.TO)+1);
    for(const ym of S.MONTHS){ if(ym<y0) continue; if(!left.size) break; const M=S.sixMonth(G,ym,busy); for(const id in M) if(left.has(id)){ out.push(M[id]); left.delete(id); } }
    return out; };
  /* 出遊（OUT.plan 的那一筆）*/
  S.outOf=function(G,s){ const o={id:s.id,ev:s.ev,day:s.day,h:s.h,late:S.LATE,place:s.place,title:s.title,travel:s.travel||'',travelH:s.travelH||0,who:s.who,pgWho:s.who,pgKey:s.key,silent:true};   /* who：那一天不會在外面偶遇她（encounter3d.js）；silent：不跳「排進行程」（排的那一刻就要出發了）*/
    if(s.kind==='video') Object.assign(o,{verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'});
    if(s.kind==='call') Object.assign(o,{verb:'打給她',call:true,travel:'',travelH:0,back:'電話結束。'});
    if(s.kind==='tn') Object.assign(o,{back:'回到臺北。',fare:s.fare});
    return o; };
  S.askAt=(G,s)=>T(s.day,s.h)-((typeof OUT!=='undefined'&&OUT.trip?OUT.trip(G,S.outOf(G,s)).travelH:s.travelH)||0)-0.25;   /* 同 OUT.due：約好的時間減車程（在家出發的照家裡算）再減 15 分鐘 */
  S.plan=function(G,s){ if(typeof OUT==='undefined'||OUT.get(G,s.id)) return false; const ok=OUT.plan(G,S.outOf(G,s));
    if(ok&&s.who!=='kexin'){ const k='PG_DATE_'+s.who, A=Array.isArray(G.flags[k])?G.flags[k]:(G.flags[k]=[]); if(!A.includes(s.key)) A.push(s.key); }
    return ok; };
  /* PG.stops：下一格該問的時間 */
  S.stop=function(G){ let best=null; const n=now(G); for(const s of S.upcoming(G)){ const t=S.askAt(G,s); if(t>n+1e-6&&(best==null||t<best)) best=t; } return best; };
  /* PG.RULES：不再交往＝排好的改 skipped；到了該問的時間＝排成出遊 */
  S.rules=function(G){ if(!G||!G.flags||!law(G)||typeof OUT==='undefined') return;
    for(const q of OUT.rec(G)) if(q.state==='planned'&&q.pgWho&&!S.wants(G,q.pgWho)) q.state='skipped';
    if(!S.on(G)||typeof CALENDAR==='undefined') return; const wd=CALENDAR.dateOf(G.day).wd, h=+G.hour||0; if(wd<5||h<7) return;   /* 格子只在週五（可昕 P3）、週六、週日，最早 07:45 */
    const n=now(G); for(const s of S.upcoming(G)){ const a=S.askAt(G,s); if(n>=a-1e-6&&n<=T(s.day,s.h)+S.LATE+1e-6) S.plan(G,s); } };
  /* ---------- 事件：每一格一個（地點字幕＋她那一句；不加選項）---------- */
  S.EVS=[];
  S.buildEvents=function(){ if(S.EVS.length||!D()) return S.EVS;
    for(const s of S.kxDefs()) S.EVS.push({id:s.ev,title:'我們的日子',participants:[],location:'any',trigger:'outing',background:'dark',hours:s.hours,
      dialogue:[s.kind==='call'?{scene:'電話'}:{scene:s.place,bg:s.bg},{speaker:'kexin',text:s.line}],   /* 電話：背景照 events3d.js 的 {scene:'電話'}（在家＝家裡，不在家＝晚上的路邊）*/
      beforeOuting:(G,GM,q)=>{ S.kxArrive(G,q); }, outingMissed:(G,GM,q)=>{ S.kxMissed(G,q); }});
    for(const who of S.SIX) for(const r of (D().six[who]||[])){ const md=S.sixMode(who,r.ym), M=S.MODE[md.m];
      S.EVS.push({id:'ev_pg_date_'+who+'_'+r.ym,title:M.place,participants:[],location:'any',trigger:'outing',background:'dark',hours:M.hours,
        dialogue:[{scene:M.place,bg:M.bg},{speaker:who,text:r.line}].concat(M.kind==='tn'?[{advance:G=>Math.max(0,17-(+G.hour||0))}]:[]),   /* 去台南：傍晚她陪你坐車到高鐵站（17:00），回程照事件的 hours */
        beforeOuting:M.kind==='tn'?(G,GM,q)=>{ if(q&&q.fare&&GM&&GM.money) GM.money(-q.fare,'交通'); }:undefined}); }   /* 高鐵來回的票錢（出發的時候付，同 hometown3d.js）*/
    return S.EVS; };
  /* ---------- 掛上去 ---------- */
  S.register=function(){ if(typeof PG==='undefined'||!D()) return false;
    if(Array.isArray(PG.MSGS)) for(const m of S.MSGS) if(!PG.MSGS.some(x=>x.tag===m.tag)) PG.MSGS.push(m);
    if(Array.isArray(PG.stops)&&!PG.stops.includes(S.stopFn)) PG.stops.push(S.stopFn);
    if(Array.isArray(PG.RULES)&&!PG.RULES.includes(S.rulesFn)) PG.RULES.push(S.rulesFn);
    if(typeof STORY_EVENTS!=='undefined') for(const e of S.buildEvents()) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
    return true; };
  S.stopFn=G=>S.stop(G); S.rulesFn=(G,GM)=>S.rules(G,GM);
  S.register();
  return S;
})();
