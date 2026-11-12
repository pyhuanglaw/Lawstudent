/* ===== 禮貌生財：上師的免費算命、聊天（LIMAO-SHOP-1110，使用者 X332「開始做，聊天免費」；LAWWW 2026-11-11）=====
   字：src/data/limao.js（LIMAO，AA_750 匯入：tools/story/import_limao.py）——台詞一字照稿，這裡不寫任何台詞（選單多出來的那一項＝稿 reveal.talk 的第一句）。
   場景（LAWWW2，不改它的檔）：街上 src/tingzhou3d.js（zone.tzLimao＝{open, masterAway, table, door}、zone.tzLimaoOff／tzLimaoAway；配置 TINGZHOU_LAYOUT.limao）、
     室內 src/tz_shops3d.js（區域 tz_limao；書房 zone.setStudy、TZS3.studyOpen；配置 TZ_SHOPS_LAYOUT.limao）。這支只包它們的 build（和 night_market3d.js 同一個做法）。
   做的事：
   1 桌前的互動點（配置 limao.table.at；按鈕 S.LABEL）：店開著、上師在、祐廷是法律系的時候是「算命桌」（聊天）；收攤、上師不在＝按鈕變「看算命桌」、念稿 closed 的一句旁白（AA 93f731790）；經濟系那一年整個藏起來。
     第一次＝first（記 LM_MET＝那一天）；之後＝選單（稿的四類＋離開）→ 那一類抽一組演完就結束；每聊一次時間過 15 分鐘（S.HRS）。一天幾次稿沒寫＝不限。全部免費，不加好感、不動成績。
     抽法（S.pick）：條件成立的組裡，先挑還沒講過的；全部講過再輪（不連續抽到剛講過的那一組）。講過哪幾組只記在記憶體，不進存檔。
     serious 的兩組（剛分手 lv4、落榜 lf5）：條件成立、還沒演過＝不管選哪一類先演這一組一次（記在 LM_SER），之後不再出、也不進一般的抽組。
   2 when（稿是文字）對成現有的判斷：S.WHEN（對照表；稿的字改了、表裡沒有＝那一組不出，S.unmapped 列得出來，測試會擋）。
   3 教授偶遇 prof：有 LM_MET（不是今天才認識）、沒有 LM_PROF、法律系大一下以後、走到算命桌（店只有晚上開）＝這一次演 prof、記 LM_PROF，不出選單。吳教授＝prof_wu（名字照人物資料）。
   4 身分揭曉 reveal（有 LM_PROF、沒有 LM_KNOWN、大四以後）：
     入口 A：進法律系館（wancai）遇到吳教授＝事件 ev_limao_wu_corridor（STORY_EVENTS，一次；臨時生出吳教授）；
     入口 B：店開著的時候在店裡按「書房的門」＝兩句旁白（門沒關好，只能看）。
     看過任何一個（LM_HINT）＝算命桌的選單最上面多一項（稿 reveal.talk 的第一句）→ talk（選了那一項＝那一句已經說了，從第二句演）→ 記 LM_KNOWN、LM_STUDY。
   5 書房：LM_STUDY＝TZS3.studyOpen 回傳 true（區域 tz_limao 建的時候就開著；旗標是在街上的算命桌立的，下一次走進店裡門就開了）。書房裡的互動點照稿 study_room 只有旁白：
     看書櫃／看書桌／看牆上的合照＝配置的三個點；「學生來信」配置沒有點＝這支在東牆矮櫃前補一個（S.LETTERS；配置之後有 id study_letters 的點就用配置的）。
   6 哪幾天不開：規格、稿都沒寫固定公休＝每天開（配置 19:00～23:30）；颱風假不開（zone.tzLimaoOff，和夜市同一個 CALENDAR.typhoon）。上師不在（tzLimaoAway）現在沒有任何事件設。
   7 上師的 3D 人物（2026-11-11 接上）：街上坐在算命桌後面（S.placeMaster，配置 limao.table.seatMaster），店開著、他在的時候才看得到；說話的人帶他的 obj（S.who）。
     店裡（區域 tz_limao 的 zone.shopClerk）還沒放人。對話照舊用 ADV 的模糊背景＋名字 S.MASTER（沒有立繪＝compact）。
   存檔：只有 G.flags 的 LM_MET（第幾天認識的）、LM_PROF、LM_KNOWN、LM_STUDY（稿的四個）＋LM_HINT（看過哪個入口 'A'／'B'）、LM_SER（{組 id: 第幾天}）；舊存檔沒有＝都還沒發生，不用遷移。
   測試：node tests/limao_unit.js */
'use strict';
const LM=(function(){
  const S={};
  const D=()=>typeof LIMAO!=='undefined'?LIMAO:null;
  const LAY=()=>typeof TINGZHOU_LAYOUT!=='undefined'&&TINGZHOU_LAYOUT?TINGZHOU_LAYOUT.limao||null:null;
  const ROOM=()=>typeof TZ_SHOPS_LAYOUT!=='undefined'&&TZ_SHOPS_LAYOUT?TZ_SHOPS_LAYOUT.limao||null:null;
  const GMof=()=>typeof GAME!=='undefined'?GAME:null;
  const F_=G=>G.flags||(G.flags={});
  const CAL=()=>typeof CALENDAR!=='undefined'?CALENDAR:null;
  S.MASTER={name:'上師'};        /* 稿的 rules：ms＝上師（他的名字不出現）*/
  S.WU='prof_wu';
  S.LABEL_LOOK='看算命桌';        /* 收攤、上師不在的時候的按鈕（按了是稿 closed 的旁白）*/
  S.LABEL='算命桌';              /* 互動點的按鈕（不是台詞）*/
  S.HRS=0.25;                    /* 聊一次時間過多久 */
  S.EV_A='ev_limao_wu_corridor'; S.ZONE_A='wancai';
  S.LETTERS={id:'study_letters',x:1.35,z:-1.95,r:0.7};   /* 東牆矮櫃前（配置 study.blocks 的 [2.0,−1.95,0.6,0.9]）*/
  S.LOOK_AT={study_books:'書櫃',study_desk:'書桌',study_photo:'合照',study_letters:'學生來信'};   /* 配置的點 → 稿 study_room.look 的 at */
  S.rand=()=>Math.random();
  S._seen={}; S.masterNpc=null;

  /* ---------- 狀態 ---------- */
  S.hour=G=>(((+G.hour||0)%24)+24)%24;
  /* 祐廷現在的學期（法律系）：{y,s,id}；經濟系那一年、不知道＝null。寒暑假算剛過完的那個學期（STORY.termAt） */
  S.term=function(G){ if(!G||G.stage==='econ') return null; let id=null;
    try{ if(typeof STORY!=='undefined'&&STORY.termAt) id=STORY.termAt(G.day); else { const t=CAL()&&CAL().termOf?CAL().termOf(G.day):null; id=t?t.id:null; } }catch(e){ id=null; }
    const m=/^Y([1-5])S([12])/.exec(id||''); return m?{y:+m[1],s:+m[2],id}:null; };
  S.year=G=>{ const t=S.term(G); return t?t.y:0; };
  S.partners=G=>{ if(typeof ROM!=='undefined'&&ROM.partners) return ROM.partners(G); const F=G.flags||{}; return Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true); };
  /* 最近三十天分手（ROM.end 記的 history：{ev:'end', day}）*/
  S.brokeRecent=function(G){ const R=(G.flags&&G.flags.romance)||{}; for(const id in R){ const H=R[id]&&R[id].history; if(!Array.isArray(H)) continue;
      for(const h of H) if(h&&h.ev==='end'&&typeof h.day==='number'&&G.day>=h.day&&G.day-h.day<=30) return true; } return false; };
  /* 有朋友以上的女生（認識的人裡；SOCIAL.stage 到 FRIEND 以上）*/
  S.girlFriendly=function(G){ if(typeof SOCIAL==='undefined'||!SOCIAL.stage||!SOCIAL.STAGES||typeof CHARACTERS==='undefined') return false; const R=(G.social&&G.social.rel)||{}, i0=SOCIAL.STAGES.indexOf('FRIEND');
    for(const id in R){ const c=CHARACTERS[id]; if(!c||c.gender!=='f') continue; try{ if(SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=i0) return true; }catch(e){} } return false; };
  /* 下一週是期末考週（這一週還不是）*/
  S.finalsNext=function(G){ const C=CAL(); if(!C||!C.termOf) return false; const t=C.termOf(G.day), n=C.termOf(G.day+7); return !!t&&t.exam!=='final'&&!!n&&n.id===t.id&&n.exam==='final'; };
  /* 上學期（學期中＝前一個學期；寒暑假＝剛過完的那個）有科目被當（CLS.failedIn）；只看法律系的學期 */
  S.lastTerm=function(G){ const C=CAL(); if(!C||!C.termOf||!Array.isArray(C.TERMS)||!S.term(G)) return null; const cur=C.termOf(G.day), ids=C.TERMS.map(T=>T.id); let id=null;
    if(cur){ const i=ids.indexOf(cur.id); id=i>0?ids[i-1]:null; } else id=S.term(G).id; return id&&/^Y[1-4]S/.test(id)?id:null; };
  S.failedLast=function(G){ const id=S.lastTerm(G); if(!id||typeof CLS==='undefined'||!CLS.failedIn) return false; try{ return CLS.failedIn(G,id).length>0; }catch(e){ return false; } };
  /* 落榜：國考一試放榜沒過（PG.failed＋那一年的 r1 演過）、司法官二試沒上（JUDGE_PASS_<年> false）、研究所筆試放榜沒上（GRAD_EXAM_RESULT 'fail'）*/
  S.flunked=function(G){ const F=G.flags||{}; if(F.GRAD_EXAM_RESULT==='fail') return true; for(const k in F) if(/^JUDGE_PASS_\d{4}$/.test(k)&&F[k]===false) return true;
    if(typeof PG!=='undefined'&&PG.failed&&PG.done&&F.PG){ for(const k in F){ const m=/^BAR_SIT_(\d{4})$/.exec(k); if(!m||F[k]!==true) continue; try{ if(PG.failed(G,+m[1])&&PG.done(G,'r1_'+m[1])) return true; }catch(e){} } }
    return false; };
  S.rainy=G=>G.weather==='rain'||G.weather==='typhoon';
  /* 稿的 when（文字）→ 現有的判斷。沒寫 when＝任何時候都可以出 */
  S.WHEN={
    '期末考前一週':G=>S.finalsNext(G),
    '上學期有科目被當':G=>S.failedLast(G),
    '沒有交往對象':G=>S.partners(G).length===0,
    '有朋友以上的女生、沒有交往對象':G=>S.partners(G).length===0&&S.girlFriendly(G),
    '交往中':G=>S.partners(G).length>0,
    '最近分手（現有的分手旗標，三十天內）':G=>S.brokeRecent(G),
    '大三以後':G=>S.year(G)>=3,
    '大四':G=>S.year(G)===4,
    '落榜以後（國考或研究所，現有的結果旗標）':G=>S.flunked(G),
    '下雨天':G=>S.rainy(G),
    '有 LM_KNOWN':G=>!!(G.flags&&G.flags.LM_KNOWN) };
  /* first／prof／reveal／study_room 的 when 是整段的說明，判斷寫在 S.firstDue／profDue／revealOpen／studyOn；稿的字改了測試會擋（先看要不要改判斷）*/
  S.WHEN_FIXED={first:'第一次走到算命桌、店在營業、沒有 LM_MET',
    prof:'有 LM_MET、沒有 LM_PROF、大一下以後（修過或正在修吳教授的刑法）、晚上走到算命桌',
    reveal:'有 LM_PROF、沒有 LM_KNOWN、大四以後。兩個入口哪個先到都可以；看過任何一個入口以後，下一次在算命桌或店裡找他，選單最上面多一個「老師，你以前是不是教刑法的？」',
    study_room:'有 LM_STUDY'};
  S.ok=function(G,g){ if(!g.when) return true; const f=S.WHEN[g.when]; if(!f) return false; try{ return !!f(G); }catch(e){ console.warn('LM.when',g.id,e); return false; } };
  S.unmapped=function(){ const d=D(), out=[]; if(!d) return out; for(const k in d.pool) for(const g of d.pool[k]) if(g.when&&!S.WHEN[g.when]) out.push(g.id+'：'+g.when);
    for(const k in S.WHEN_FIXED){ const w=k==='study_room'?d.study_room.when:d[k].when; if(w!==S.WHEN_FIXED[k]) out.push(k+'：'+w); } return out; };

  S.met=G=>!!(G.flags&&G.flags.LM_MET);
  S.firstDue=G=>!S.met(G);
  S.profDue=function(G){ const F=G.flags||{}, t=S.term(G); if(!F.LM_MET||F.LM_PROF||!t) return false; if(F.LM_MET===G.day) return false;   /* 認識的那一天不演 */ return t.y>1||t.s>=2; };
  S.revealOpen=G=>{ const F=G.flags||{}; return !!F.LM_PROF&&!F.LM_KNOWN&&S.year(G)>=4; };
  S.hintDue=G=>S.revealOpen(G)&&!(G.flags&&G.flags.LM_HINT);
  S.askDue=G=>S.revealOpen(G)&&!!(G.flags&&G.flags.LM_HINT);
  S.studyOn=G=>!!(G&&G.flags&&G.flags.LM_STUDY);

  /* ---------- 營業 ---------- */
  S.typhoon=G=>{ try{ return !!(CAL()&&CAL().typhoon&&CAL().typhoon(G.day)); }catch(e){ return false; } };
  S.openAt=function(G){ const L=LAY(); if(!L||!G) return false; const h=S.hour(G);
    if(typeof PLACES!=='undefined'&&PLACES.isOpen&&PLACES.hours&&PLACES.hours.tz_limao) return PLACES.isOpen('tz_limao',h,G.day);   /* AA_831：14:00～21:00、週一公休（places.js；颱風假也在裡面）；和街上的模型（tingzhou3d.js S.limaoOpen）同一份 */
    return h>=L.from&&h<L.to&&!S.typhoon(G); };
  S.sync=function(zone,G){ if(zone&&G) zone.tzLimaoOff=S.typhoon(G); };
  /* 現在能不能在桌前找他：店開著、他在、祐廷是法律系學生（稿的句子都是法律系的；經濟系那一年沒有稿）*/
  S.canTalk=function(G,zone){ if(!D()||!G||!S.term(G)) return false; if(zone&&(zone.tzLimaoOff||zone.tzLimaoAway)) return false; return S.openAt(G); };
  S.masterSeat=()=>{ const L=LAY(); return L&&L.table&&L.table.seatMaster?Object.assign({},L.table.seatMaster):null; };

  /* ---------- 說話 ---------- */
  S.who=function(GM,w){ const G=GM.G; if(w==='narr') return null; if(w==='yt') return {name:(G&&G.name)||'祐廷'};
    if(w==='ms'){ const n=S.masterNpc, E=GM.E; return n&&n.obj&&!n.hidden&&E&&E.npcs&&E.npcs.includes(n)?Object.assign({},n,S.MASTER):S.MASTER; }   /* 人物在這個區域、看得到的時候才帶 obj（換區以後舊的那個不用）*/
    if(w==='wu'){ const n=GM.npc&&GM.npc[S.WU], nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(S.WU):((typeof CHARACTERS!=='undefined'&&CHARACTERS[S.WU]&&CHARACTERS[S.WU].name)||'吳教授'); return n&&n.obj?n:{name:nm,charId:S.WU}; }
    return null; };
  S.play=async function(GM,lines,from){ for(let i=from|0;i<lines.length;i++){ const l=lines[i]; await GM.say(S.who(GM,l.w),l.t,l.w==='yt'?{me:true}:undefined); } };
  S.begin=function(GM){ if(GM.sceneBegin) GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin&&!ADV.active) ADV.begin({background:'blur'}); }catch(e){ console.warn('LM.begin',e); } };
  S.end=function(GM){ if(GM.sceneEnd) GM.sceneEnd(); };
  S.spend=function(GM){ if(GM.advance) GM.advance(S.HRS); if(GM.autosave) GM.autosave(); };

  /* ---------- 抽一組 ---------- */
  S.serDone=(G,id)=>!!(G.flags&&G.flags.LM_SER&&G.flags.LM_SER[id]);
  S.seriousDue=function(G){ const d=D(); for(const k of ['love','life','study','chat']) for(const g of d.pool[k]||[]) if(g.serious&&!S.serDone(G,g.id)&&S.ok(G,g)) return g; return null; };
  S.pick=function(G,key){ const d=D(), all=(d.pool[key]||[]).filter(g=>!g.serious&&S.ok(G,g)); if(!all.length) return null;
    const R=S._seen[key]||(S._seen[key]={ids:[],last:null}); let pool=all.filter(g=>!R.ids.includes(g.id));
    if(!pool.length){ R.ids=[]; pool=all.filter(g=>all.length<2||g.id!==R.last); }   /* 全部講過：重新輪，不接著講剛講過的那一組 */
    const g=pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; R.ids.push(g.id); R.last=g.id; return g; };
  S.menu=function(G){ const d=D(), out=[]; if(S.askDue(G)) out.push({t:d.reveal.talk.lines[0].t,ask:true}); for(const m of d.menu) out.push(Object.assign({},m)); return out; };

  /* ---------- 算命桌 ---------- */
  S.table=async function(GM,zone){ const G=GM.G, d=D(); if(!d||!G) return null; S.sync(zone,G);
    if(zone&&zone.applyTimeOutdoor){ try{ zone.applyTimeOutdoor(S.hour(G),null); }catch(e){ console.warn('LM.table',e); } }   /* 模型的開收和這裡看同一個鐘點 */
    if(!S.canTalk(G,zone)){ const c=d.closed, lm=zone&&zone.tzLimao;   /* 收攤、店開著他不在：稿 closed 的一句旁白（AA 93f731790）；經濟系那一年不出（互動點藏著）*/
      if(c&&S.term(G)) await S.narr(GM,[lm&&lm.open&&zone.tzLimaoAway?c.away:c.shut]); return 'closed'; }
    const F=F_(G); S.begin(GM);
    try{
      if(S.firstDue(G)){ F.LM_MET=G.day; await S.play(GM,d.first.lines); S.spend(GM); return 'first'; }
      if(S.profDue(G)&&!S.seriousDue(G)){ F.LM_PROF=true;   /* BB 2026-11-11 定：剛分手、剛落榜那一組還沒演的時候，吳教授撞見留到下一次（認真那一組有時效，撞見晚一次沒有損失）*/ await S.play(GM,d.prof.lines); S.spend(GM); return 'prof'; }
      const M=S.menu(G), i=await GM.choose(M.map(m=>({t:m.t}))), m=i==null?null:M[i]; if(!m||m.leave) return 'leave';
      if(m.ask){ await S.play(GM,d.reveal.talk.lines,1); for(const f of d.reveal.talk.set) F[f]=true; S.spend(GM); return 'talk'; }
      const sg=S.seriousDue(G); if(sg){ (F.LM_SER||(F.LM_SER={}))[sg.id]=G.day; await S.play(GM,sg.lines); S.spend(GM); return sg.id; }
      const g=S.pick(G,m.pool); if(!g) return 'none'; await S.play(GM,g.lines); S.spend(GM); return g.id;
    } finally { S.end(GM); } };

  /* ---------- 店裡：書房的門、書房裡的東西 ---------- */
  S.lookNarr=function(at){ const d=D(), e=d&&d.study_room.look.find(q=>q.at===at); return e?e.narr:null; };
  S.narr=async function(GM,texts){ if(GM.sceneBegin) GM.sceneBegin(); try{ for(const t of texts) await GM.say(null,t); } finally { if(GM.sceneEnd) GM.sceneEnd(); } };
  S.studyDoor=async function(GM,zone,it){ const G=GM.G, d=D();
    if(d&&G&&!zone.studyOpen&&S.hintDue(G)&&S.openAt(G)){ F_(G).LM_HINT='B'; await S.narr(GM,d.reveal.entryB.lines.map(l=>l.t)); if(GM.autosave) GM.autosave(); return 'entryB'; }
    if(it.look&&GM.caption) GM.caption('',it.look,4600); return 'look'; };
  S.studyLook=async function(GM,it,at){ const t=S.lookNarr(at); if(!t){ if(it.look&&GM.caption) GM.caption('',it.look,4600); return null; } await S.narr(GM,[t]); return at; };
  /* 區域 tz_limao 建好、書房開關以後：把互動點接上（配置的點照 tzPoint 找；學生來信補一個）*/
  S.decorate=function(E,zone){ if(!E||!zone||!D()) return 0; const IT=E.interactables||[]; let n=0;
    for(const it of IT){ if(!it||it._lm) continue; const id=it.tzPoint;
      if(id==='study_door'){ it._lm=true; it.onInteract=()=>{ const GM=GMof(); return GM?S.studyDoor(GM,zone,it):null; }; n++; }
      else if(S.LOOK_AT[id]&&S.lookNarr(S.LOOK_AT[id])){ const at=S.LOOK_AT[id]; it._lm=true; it.onInteract=()=>{ const GM=GMof(); return GM?S.studyLook(GM,it,at):null; }; n++; } }
    const has=IT.some(q=>q&&q.tzPoint===S.LETTERS.id);
    if(zone.studyOpen&&!has&&S.lookNarr(S.LOOK_AT[S.LETTERS.id])){ const P=S.LETTERS, at=S.LOOK_AT[P.id], it={x:P.x,z:P.z,radius:P.r,label:'看'+at,tzPoint:P.id,lmAdded:true,_lm:true}; it.onInteract=()=>{ const GM=GMof(); return GM?S.studyLook(GM,it,at):null; }; IT.push(it); n++; }
    if(!zone.studyOpen){ for(let i=IT.length-1;i>=0;i--) if(IT[i]&&IT[i].lmAdded) IT.splice(i,1); }
    return n; };
  S.attachRoom=function(E,zone){ if(!zone||zone._lm||!D()) return zone; zone._lm=true;
    if(zone.setStudy){ const s0=zone.setStudy; zone.setStudy=function(on){ const r=s0.apply(this,arguments); try{ S.decorate(E,zone); }catch(e){ console.warn('LM.decorate',e); } return r; }; }
    S.decorate(E,zone); return zone; };

  /* ---------- 上師的 3D 人物（LAWWW 2026-11-11；模型 LAWWW2 第 3 版 char.limao_shangshi，照使用者 11-10 的人物圖）----------
     坐在算命桌後面那張椅子（配置 limao.table.seatMaster）。店開著、他在、祐廷是法律系學生的時候才看得到（和「算命桌」按鈕同一個 S.canTalk）；收攤、不在＝藏起來。
     模型是 lazy：第一次進汀州路才下載；下載完以前 CHAR.build 先建備用的人（藏著），到了由 GM.upgradeModels 換上；下載失敗＝露出備用的樣子（灰白頭髮、咖啡色開襟外套），不會一直隱形。做法同 us_life3d.js 的何俊朗 */
  S.MODEL_KEY='char.limao_shangshi'; S.NPC_ID='limao_master'; S._mFail=false; S._mLoading=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['limao3d:masterLoading']=()=>{ S._mLoading=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.masterModel=function(){ const K=S.MODEL_KEY; if(S._mFail||typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[K]) return null;
    if(ASSETS.has&&!ASSETS.has(K)&&ASSETS.loadOne&&!S._mLoading){ S._mLoading=true; let p; try{ p=Promise.resolve(ASSETS.loadOne(K)); }catch(e){ p=Promise.reject(e); } p.catch(e=>{ S._mFail=true; console.warn('LM master model',e&&e.message); S.masterReveal(); }).finally(()=>{ S._mLoading=false; }); }
    return K; };
  S.masterReveal=function(){ const GM=GMof(), E=GM&&GM.E; for(const n of (E&&E.npcs)||[]){ const u=n&&n.obj&&n.obj.userData; if(!u||u.wantModel!==S.MODEL_KEY) continue; u.wantModel=null; if(u.degradedHidden){ for(const c of n.obj.children) c.visible=true; u.degradedHidden=false; } } };
  S.masterSpec=function(){ const xs=typeof STORY!=='undefined'&&STORY.extraSpec; let s=xs?Object.assign({},xs(21)):{};
    s.sex='m'; s.height=1.69; s.skin='#efd0b3'; s.hair=Object.assign({},s.hair,{color:'#b9b6b0'}); s.outfit=Object.assign({},s.outfit,{top:{type:'cardiganOpen',color:'#4a3626',inner:'#3f4a36'},bottom:{type:'slacks',color:'#6b6358'}});
    const k=S.masterModel(); if(k) s.model=k; s.id=S.NPC_ID; s.name=S.MASTER.name; return s; };
  S.masterShow=function(zone,G){ const n=S.masterNpc; if(!n||!n.obj) return false; const on=!!(G&&S.canTalk(G,zone)); n.hidden=!on; n.obj.visible=on; return on; };   /* n.hidden：engine3d.js 每一格算顯示時照它（只設 visible 會被下一格蓋回來——CC 11-11：收攤時他還畫得出來、會閃）*/
  S.placeMaster=function(GM){ S.masterNpc=null; const E=GM&&GM.E, zone=E&&E.zone, G=GM&&GM.G, st=S.masterSeat();
    if(!zone||!zone.tzLimao||!st||!G||!D()||!S.term(G)||typeof CHAR==='undefined'||!CHAR.build||!E.addNPC) return null;
    const seat={x:st.x,z:st.z,yaw:st.yaw||0}, o=CHAR.build(S.masterSpec()); o.position.set(seat.x,0,seat.z); o.rotation.y=seat.yaw;
    const n=E.addNPC({obj:o,id:S.NPC_ID,name:S.MASTER.name,beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,lmMaster:true,seat});
    S.masterNpc=n; S.masterShow(zone,G); return n; };
  S.hookPopulate=function(){ if(typeof STORY==='undefined'||!STORY.populate||STORY._lmPop) return false; const p0=STORY.populate; STORY._lmPop=true;
    STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); if(zoneId==='tingzhou'){ try{ S.placeMaster(GM); }catch(e){ console.warn('LM.placeMaster',e); } } else S.masterNpc=null; return r; }; return true; };

  /* ---------- 街上：桌前的互動點 ---------- */
  S.attachStreet=function(E,zone){ const L=LAY(); if(!zone||zone._lm||!D()||!L||!L.table||!L.table.at||!zone.tzLimao) return zone; zone._lm=true; const A=L.table.at;
    E.interactables.push({x:A.x,z:A.z,radius:A.r,prio:1,lmTable:true,get label(){ const GM=GMof(); return GM&&GM.G&&S.canTalk(GM.G,zone)?S.LABEL:S.LABEL_LOOK; },get hidden(){ const GM=GMof(), G=GM&&GM.G; return !(G&&D()&&S.term(G)&&(S.canTalk(G,zone)||D().closed)); },onInteract:()=>{ const GM=GMof(); return GM?S.table(GM,zone):null; }});
    const t0=zone.applyTimeOutdoor; if(t0) zone.applyTimeOutdoor=function(h,E2){ const GM=GMof(), G=GM&&GM.G; if(G) S.sync(zone,G); const r=t0.call(this,h,E2); if(G) S.masterShow(zone,G);   /* 開店、收攤的時候人物跟著出現、不見 */ return r; };
    return zone; };

  /* ---------- 入口 A：系館遇到吳教授（事件）---------- */
  S.eventA=function(){ const d=D(); if(!d) return null; const sp={yt:'player',wu:S.WU,narr:null};
    return { id:S.EV_A, title:(d.reveal.entryA.title||''), participants:[S.WU], location:S.ZONE_A, trigger:'enter', once:true, background:'blur', spawn:{npc:S.WU,dist:2.2}, despawn:20,
      prereq:{custom:G=>S.hintDue(G)},
      dialogue:d.reveal.entryA.lines.map(l=>({speaker:sp[l.w],text:l.t})).concat([{call:G=>{ F_(G).LM_HINT='A'; }}]) }; };
  S.register=function(){ if(typeof STORY_EVENTS==='undefined'||!D()) return false; if(!STORY_EVENTS.some(e=>e&&e.id===S.EV_A)) STORY_EVENTS.push(S.eventA()); return true; };

  /* ---------- 接上去 ---------- */
  S.hook=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!D()) return false; let n=0; const L=LAY(), R=ROOM();
    { const zd=Z3.ZONES.tingzhou; if(zd&&!zd._lm&&L){ const b0=zd.build; zd.build=function(E){ const z=b0.call(this,E); try{ S.attachStreet(E,z); }catch(e){ console.warn('LM.attachStreet',e); } return z; }; zd._lm=true; n++; } }
    { const zd=R&&Z3.ZONES[R.zone]; if(zd&&!zd._lm){ const b0=zd.build; zd.build=function(E){ const z=b0.call(this,E); try{ S.attachRoom(E,z); }catch(e){ console.warn('LM.attachRoom',e); } return z; }; zd._lm=true; n++; } }
    if(typeof TZS3!=='undefined'&&TZS3.studyOpen&&!TZS3.studyOpen._lm&&R){ const s0=TZS3.studyOpen; TZS3.studyOpen=Object.assign(function(L2){ if(L2&&L2.id===R.id){ const GM=GMof(); return S.studyOn(GM&&GM.G); } return s0.apply(this,arguments); },{_lm:true}); n++; }
    return n>0; };
  S.hook();
  if(!S.register()&&typeof addEventListener==='function'){ addEventListener('DOMContentLoaded',()=>{ S.register(); }); addEventListener('load',()=>{ S.register(); }); }
  if(!S.hookPopulate()&&typeof addEventListener==='function'){ addEventListener('DOMContentLoaded',()=>{ S.hookPopulate(); }); addEventListener('load',()=>{ S.hookPopulate(); }); }   /* 這支排在 events.js 前面載入：整頁載完再登記 */
  return S;
})();
