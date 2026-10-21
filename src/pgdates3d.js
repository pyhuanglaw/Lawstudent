/* ===== 畢業以後的固定格：可昕「我們的日子」（AA_366 第二版，AA366-KX-POSTGRAD-1021）=====
   台詞（開頭那一則、每一格她說的一句）在 src/data/pg_dates.js：tools/story/import_pg_dates.py 照白名單的企劃線 a7bd9741 產生，不要手改。這裡是規則（照稿的條文，註解寫出處）。
   一格（S.kxList、S.upcoming 回傳的格式）＝{who, key, day, h, kind, place, bg, line, id, ev, title, travel, travelH}：
     who 人物 id；key＝稿上的日子（P3＝那一週的週一）；day 第幾天、h 幾點（臺灣時間）；
     kind meet 見面／call 電話；place 地點字幕（也是出遊的地點）；bg 2D 背景；line 她說的那一句；
     id 出遊的 id（kx_od_<day>，和 AA_354 大二～大四的固定格同一套）；ev 那一格的事件（ev_kx_od_pg_<key>）。
   旗標（存檔；舊存檔沒有＝沒有）：KX_OD_PG＝可昕最近傳過的開頭那一則（'p1'～'p5'，AA_366 第 3 節）。
   做法（畢業後篇的停點，src/postgrad3d.js）：
     - PG.stops：下一格「該問要不要出發」的時間（約好的時間減車程、再減 15 分鐘，同 OUT.due）。長跳（跳到下一件事）停在那裡，不靠每 6 小時看一次的整點規則。
     - PG.RULES（每 0.5 秒、跳的每一步）：到了那個時間、還沒排＝排成出遊（OUT.plan，不跳「排進行程」的提示），照常問「出發／晚一點／不去了」；
       去了＝地點字幕＋她那一句（每一格一個事件），結束、跳到下一站；略過＝沒有台詞、不扣分。
       不再交往（分手、ROM.end；AA_346 選了另一位、還沒談的時候也算）＝已經排好的改成 skipped，之後不排。
     - 過了的格子不補：從現在之後的下一格開始（AA_366 第 3 節）。
     - 開頭那一則：PG.MSGS（21:00 她私訊兩則），那一段的第一週內才傳（win，到第 7 天 24:00），過了不補（AA_366 第 3 節）。
   AA_366（可昕）：法律系、交往中、KX_OUR_DAY 有值、畢業後篇；P1 一試前（隔週日 19:00）、P2 一試後（隔週日 19:00）、P3 二試後（照 KX_OUR_DAY.day 那一週：週五 19:00／週六、週日 14:00）、
     P4 職前訓練（隔週六 21:00 電話，祐廷打給她）、P5 實習以後（每月第一個週日 19:00）。日子照稿（第 1、2 節）；地點：見面照「公館、河濱、政大小吃街」輪流，P4＝電話。
     不排：讀書小組有她的＝P1（開頭那一則也不傳）；P5 那個月已經有一對一接觸（第 1 節四種）。和 AA_351 接：只和她一位交往的時候，準時到 KX_CRACK −1（最低 0）、遲到超過 15 分鐘 ＋1、
     說了「晚一點」最後沒到 ＋1、「不去了」不算（第 3 節；「答應了」＝說了晚一點，見回報給 AA 的問題）。
   測試：node tests/aa366_kx_postgrad_unit.js */
'use strict';
const PGDATE=(function(){
  const S={};
  const D=()=>typeof PG_DATES!=='undefined'?PG_DATES:null;
  const DK=k=>typeof PG!=='undefined'&&PG.DK?PG.DK(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);   /* 交往中的叫法（學姊＝書瑀）照 SOCIAL.displayName */
  S.FROM='2029-06-03'; S.TO='2030-12-13';   /* 畢業以後到尾聲（P5 到 12/13，之後是尾聲；AA_366 第 1 節）*/
  S.LATE=0.5;   /* 出遊的「晚一點」可以到幾點（約好的時間後 30 分鐘；同畢業後篇其他的出遊）*/
  S.OPEN_H=21;   /* AA_366 第 1 節：開頭那一則（她私訊，21:00）*/
  S.OPEN_WIN=6*24+3;   /* AA_366 第 3 節：開頭那一則只在那一段的第一週內傳（到第 7 天 24:00），過了不補 */
  /* ---------- 不再交往、選了別人 ---------- */
  /* 選一個人以後（AA_346）要分開的那幾位：選了以後、談話以前她還是交往中（r2y4b3d.js 的 CHOICE_APART29／30），這裡就當作停了（同 AA_367 第 0 節的通則）*/
  S.leaving=function(G,id){ const F=(G&&G.flags)||{}; for(const k of ['CHOICE_APART29','CHOICE_APART30']){ const R=F[k], P=R&&R.at&&R.at[id]; if(P&&P.st!=='done'&&P.st!=='void') return true; } return false; };
  S.wants=(G,id)=>dating(G,id)&&!S.leaving(G,id);
  S.on=G=>law(G)&&typeof PG!=='undefined'&&!!PG.on&&PG.on(G)&&DK(S.TO)!=null&&now(G)<T(DK(S.TO),24);   /* 畢業後篇（跳日期）；尾聲以前 */
  /* ---------- 可昕（AA_366）---------- */
  S.KX_DAY={fri:4,sat:5,sun:6};   /* P3：那一週（稿上寫週一）往後幾天＝KX_OUR_DAY.day */
  S.WD_NAME={fri:'週五',sat:'週六',sun:'週日'};   /* P3 開頭那一則的 {星期}（AA_354 第 2 節：{星期}＝週五／週六／週日）*/
  /* 見面的地點（AA_366 第 1 節「地點照 AA_354（公館、河濱、政大小吃街輪流）」）：字幕、背景、車程照大一下那一段（story3d.js K5 之後每週），政大照畢業後篇（6/9、K26：開車約 40 分鐘）*/
  S.KX_PLACES=[{place:'公館',bg:'gongguan',title:'我們的日子：約在公館',travel:'騎車約 10 分鐘',travelH:1/6},
    {place:'河濱',bg:'riverside',title:'我們的日子：河濱',travel:'騎車約 15 分鐘',travelH:0.25},
    {place:'政大・山下的小吃街',bg:'nccu_food',title:'我們的日子：開車去政大',travel:'開車約 40 分鐘',travelH:2/3}];
  S.KX_CALL={place:'電話',bg:null,title:'我們的日子：電話',travel:'',travelH:0};   /* P4（受訓：「隔週六晚上。你打給我。」）：地點字幕寫「電話」*/
  let kxDefs=null;
  S.kxDefs=function(){ if(kxDefs) return kxDefs; const K=D()&&D().kexin; if(!K) return []; let n=0;
    kxDefs=K.slots.map(s=>{ const call=!!(K.segs[s.seg]&&K.segs[s.seg].call), P=call?S.KX_CALL:S.KX_PLACES[(n++)%S.KX_PLACES.length];   /* 輪流：見面的格子照稿的順序（P4 電話不算）*/
      return Object.assign({who:'kexin',seg:s.seg,key:s.key,week:!!s.week,line:s.line,kind:call?'call':'meet',ev:'ev_kx_od_pg_'+s.key,hours:call?1:2},P); });
    return kxDefs; };
  S.kxOn=G=>S.on(G)&&S.wants(G,'kexin')&&!!G.flags.KX_OUR_DAY&&typeof G.flags.KX_OUR_DAY==='object';   /* 第 3 節觸發：法律系、交往中、KX_OUR_DAY 有值 */
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
  /* 下一格（還沒排成出遊的）*/
  S.upcoming=function(G){ const out=[]; if(!G||!G.flags||!S.on(G)) return out; const n=now(G);
    if(S.kxOn(G)) for(const s of S.kxList(G)){ if(T(s.day,s.h)+S.LATE<n-1e-6) continue; if(typeof OUT!=='undefined'&&OUT.get(G,s.id)) continue; out.push(s); break; }
    return out; };
  /* 出遊（OUT.plan 的那一筆）*/
  S.outOf=function(G,s){ const o={id:s.id,ev:s.ev,day:s.day,h:s.h,late:S.LATE,place:s.place,title:s.title,travel:s.travel||'',travelH:s.travelH||0,who:s.who,pgWho:s.who,pgKey:s.key,silent:true};   /* who：那一天不會在外面偶遇她（encounter3d.js）；silent：不跳「排進行程」（排的那一刻就要出發了）*/
    if(s.kind==='video') Object.assign(o,{verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'});
    if(s.kind==='call') Object.assign(o,{verb:'打給她',call:true,travel:'',travelH:0,back:'電話結束。'});
    return o; };
  S.askAt=(G,s)=>T(s.day,s.h)-((typeof OUT!=='undefined'&&OUT.trip?OUT.trip(G,S.outOf(G,s)).travelH:s.travelH)||0)-0.25;   /* 同 OUT.due：約好的時間減車程（在家出發的照家裡算）再減 15 分鐘 */
  S.plan=function(G,s){ if(typeof OUT==='undefined'||OUT.get(G,s.id)) return false; const ok=OUT.plan(G,S.outOf(G,s));
    return ok; };
  /* PG.stops：下一格該問的時間 */
  S.stop=function(G){ let best=null; const n=now(G); for(const s of S.upcoming(G)){ const t=S.askAt(G,s); if(t>n+1e-6&&(best==null||t<best)) best=t; } return best; };
  /* PG.RULES：不再交往＝排好的改 skipped；到了該問的時間＝排成出遊 */
  S.rules=function(G){ if(!G||!G.flags||!law(G)||typeof OUT==='undefined') return;
    for(const q of OUT.rec(G)) if(q.state==='planned'&&q.pgWho&&!S.wants(G,q.pgWho)) q.state='skipped';
    if(!S.on(G)||typeof CALENDAR==='undefined') return; const wd=CALENDAR.dateOf(G.day).wd, h=+G.hour||0; if(wd<5||h<7) return;   /* 格子只在週五（P3）、週六、週日 */
    const n=now(G); for(const s of S.upcoming(G)){ const a=S.askAt(G,s); if(n>=a-1e-6&&n<=T(s.day,s.h)+S.LATE+1e-6) S.plan(G,s); } };
  /* ---------- 事件：每一格一個（地點字幕＋她那一句；不加選項）---------- */
  S.EVS=[];
  S.buildEvents=function(){ if(S.EVS.length||!D()) return S.EVS;
    for(const s of S.kxDefs()) S.EVS.push({id:s.ev,title:'我們的日子',participants:[],location:'any',trigger:'outing',background:'dark',hours:s.hours,
      dialogue:[s.kind==='call'?{scene:'電話'}:{scene:s.place,bg:s.bg},{speaker:'kexin',text:s.line}],   /* 電話：背景照 events3d.js 的 {scene:'電話'}（在家＝家裡，不在家＝晚上的路邊）*/
      beforeOuting:(G,GM,q)=>{ S.kxArrive(G,q); }, outingMissed:(G,GM,q)=>{ S.kxMissed(G,q); }});
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
