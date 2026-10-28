/* 總圖 B1 的劇情接線（CLOSED-SPACES-1023 第 2 項；AA_399 第 2 節，AA-B 2026-10-23；空間是 LAWWW2-B 的 library_b1，src/library_b1_3d.js）
   1. 柏翰的考古題小組（大二上週六 16～18，出遊 bohan_group_<day>）：演之前換到 B1 討論室 1（OUT.STAGE），柏翰站在白板前、芯慈坐在桌邊，畫面用模糊的 3D，台詞不變；演完回到原本的地方。
      在家、在國外、騎車、有人跟著的時候照舊用 2D（library_b1 的底圖）。
   2. 國考讀書會（act_bar_study，r2y4b3d.js）：集合點改到 B1 討論室 2（原本一樓大廳）；那幾個週四 19:30～22:00 阿哲、柏翰、Alison（認識的才在）坐在討論室 2。
      人在 B1 參加的時候，B1 的底圖（ntu_lib_b1、library_b1）換成模糊的 3D（OUT.bg 包一層）。
   3. 期末前的夜（AA_97）：期末考前兩週（第 W-2、W-1 週）22:00～02:00，柏翰坐在 24 小時自習室中間那排（spot study_night）。
      23:30～24:00 祐廷在自習室裡、他在座位上：「十一點四十。你還有二十分鐘可以決定要不要回宿舍。」一學期一次。宿舍門禁照現有的（24:00）。
   4. 24 小時自習室晚上進得去：總圖大廳 22:00 關門以後，校園的總圖門口多一個「從側門下 B1（24 小時自習室，刷學生證）」；
      人在 B1、大廳已經關了，樓梯間的出口改成走側門出去（回到校園的總圖門口）。休學的那一年沒有學生證，不能刷。
   5. 自助借還書機、還書口（AA_399 第 3 節「B1 自助借還機也可以還」）：借還照 loans3d.js（服務台那幾句館員的話只在服務台）；還書口只能還。
   這裡的字只有選單、提示（UI）；台詞照 AA 的稿一字不改（D100、D109）。 */
const B1S=(function(){
  const S={}, Z='library_b1', BH='classmate_bohan', XC='classmate_xinci';
  const L=()=>typeof LIBRARY_B1_LAYOUT!=='undefined'?LIBRARY_B1_LAYOUT:null;
  const sp=k=>{ const l=L(); return (l&&l.spots&&l.spots[k])||null; };
  const met=id=>typeof SOCIAL==='undefined'||!SOCIAL.has||SOCIAL.has(id,'FIRST_MET');
  const name=id=>typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(id):SOCIAL.displayName(id)):id;
  const law=G=>!!G&&G.stage!=='econ';
  const CAMPUS={x:80,z:0,yaw:-Math.PI/2};   /* 從總圖出去：門廊前面（library3d.js 的 CAMPUS）*/
  S.LINE='十一點四十。你還有二十分鐘可以決定要不要回宿舍。';   /* AA_399 第 2 節（AA_97）*/

  /* ---------- 期末考前兩週 ---------- */
  S.examSoon=function(day){ if(typeof CALENDAR==='undefined'||!CALENDAR.termOf) return false; const t=CALENDAR.termOf(day); if(!t) return false;
    const W=typeof STORY!=='undefined'&&STORY.termWeeks?STORY.termWeeks(t.id):16; return !!W&&t.week>=W-2&&t.week<W; };
  if(typeof CALENDAR!=='undefined'&&!CALENDAR.examSoon) CALENDAR.examSoon=S.examSoon;   /* LB1.want（背景的同學期末考前兩週加倍）讀這個 */
  /* 那一晚算哪一天（G.hour 過了半夜照樣往上加到 26；睡過覺的換日以後是 0～2）*/
  S.nightDay=function(G){ const h=G.hour; if(h>=22&&h<26) return G.day; if(h<2) return G.day-1; return null; };
  const away=G=>(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))||(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G))||(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G));
  S.nightOn=function(G){ if(!law(G)||away(G)||!met(BH)) return false; const d=S.nightDay(G); if(d==null||!S.examSoon(d)) return false;
    if(typeof STORY!=='undefined'&&STORY.presence){ const p=STORY.presence(BH,G); if(p&&p.here===false) return false; } return true; };
  const termKey=G=>{ const d=S.nightDay(G), t=d!=null&&typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null; return t?t.id:null; };
  S.nightSaid=G=>{ const k=termKey(G), R=G.flags.B1_NIGHT; return !!(k&&R&&R[k]); };
  const inStudy=(x,z)=>{ const l=L(), r=l&&(l.rooms||[]).find(q=>q.id==='study24'); return !!r&&x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1; };
  S.lineDue=function(GM){ const G=GM.G, E=GM.E; if(!G||G.zone!==Z||!E||!E.player||!S.nightOn(G)||S.nightSaid(G)) return false;
    const h=G.hour%24; if(!(h>=23.5&&h<24)) return false; const n=GM.npc&&GM.npc[BH]; if(!n||!n.b1Night) return false;
    const p=E.player.obj.position; return inStudy(p.x,p.z); };
  let playing=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['b1story3d:playing']=()=>{ playing=false; S.staged=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.playLine=async function(GM){ const G=GM.G, k=termKey(G); if(!k) return false; const R=G.flags.B1_NIGHT||(G.flags.B1_NIGHT={}); R[k]=G.day; playing=true;
    GM.sceneBegin(); try{ await GM.say({name:name(BH),charId:BH},S.LINE); } finally { GM.sceneEnd(); playing=false; } return true; };

  /* 柏翰坐在自習室（期末前的夜）：進來的時候已經坐著；待在 B1 時段到了從樓梯間走進來 */
  S.seatNight=function(){ const q=sp('study_night'); return q?{x:q.x,z:q.z,yaw:q.yaw||0,lv:0}:null; };
  S.placeNight=function(GM,entering){ const G=GM.G, E=GM.E; if(G.zone!==Z||!E||!E.player||!GM.spawnCharacter) return false; const st=S.seatNight(); if(!st) return false;
    const n0=GM.npc&&GM.npc[BH]; if(n0) return false;   /* 作息已經讓他在這裡（或在別的事件裡）*/
    if(entering){ const n=GM.spawnCharacter(BH,st.x,st.z,{seat:st,pose:'read'}); if(n){ n.idlePose='read'; n.frozen=true; n.b1Night=true; } return !!n; }
    const dr=(L().stairs||{}).spawn||{x:-10.5,z:-2.4}; const n=GM.spawnCharacter(BH,dr.x,dr.z,{yaw:Math.PI/2,pose:'idle'}); if(!n) return false; n.b1Night=true;
    const sit=()=>{ if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='read'; n.frozen=true; };
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z+0.6]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,0))) sit(); return true; };
  S.leaveNight=function(GM){ const n=GM.npc&&GM.npc[BH]; if(n&&n.b1Night&&GM.removeNPC){ GM.removeNPC(BH); return true; } return false; };

  /* ---------- 國考讀書會：討論室 2 ---------- */
  S.BAR_SEATS={ zhe:[-0.58,3.55,Math.PI/2], classmate_bohan:[-0.58,4.4,Math.PI/2], yu:[1.58,3.55,-Math.PI/2] };
  S.barNow=function(G){ if(typeof ACTIVITIES==='undefined') return false; const a=ACTIVITIES.list.find(q=>q.id==='act_bar_study'); if(!a||!ACTIVITIES.on(a,G.day,G)) return false;
    const h=G.hour%24; return h>=a.t0-0.5&&h<a.t1; };
  S.placeBar=function(GM){ const G=GM.G; if(G.zone!==Z||!S.barNow(G)||!GM.spawnCharacter) return 0; let k=0;
    for(const id of Object.keys(S.BAR_SEATS)){ if(!met(id)||(GM.npc&&GM.npc[id])) continue; const [x,z,yaw]=S.BAR_SEATS[id]; const n=GM.spawnCharacter(id,x,z,{seat:{x,z,yaw,lv:0},pose:'read'}); if(n){ n.idlePose='read'; n.frozen=true; n.b1Bar=true; k++; } }
    return k; };

  /* ---------- 考古題小組：討論室 1（OUT.STAGE）---------- */
  S.STAGES={ ev_bohan_group_session:{ me:[-3.42,4.4,-Math.PI/2], cast:[ {id:BH,spot:'disc1_head'}, {id:XC,seat:[-5.58,4.4,Math.PI/2]} ] } };
  S.staged=null;
  S.canStage=function(GM){ const G=GM.G, E=GM.E; if(!G||!E||!E.player||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[Z]||!Z3.ZONES[G.zone]||!L()) return false;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false; if(away(G)) return false;
    if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  S.stage=async function(GM,cfg){ const G=GM.G, E=GM.E, P=E.player; if(!cfg) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0};
    if(P.seat&&GM.standUp) GM.standUp(P);
    S.staged=cfg; const [mx,mz,my]=cfg.me; await GM.enter(Z,{x:mx+0.57,z:mz,yaw:my},{noFade:true,deferStory:true,noAutosave:true});   /* 座位的入座點在桌子外側 */
    for(const c of cfg.cast){ if(!GM.spawnCharacter) break; if(GM.npc&&GM.npc[c.id]&&GM.removeNPC) GM.removeNPC(c.id); let n=null;
      if(c.seat){ const [x,z,yaw]=c.seat; n=GM.spawnCharacter(c.id,x,z,{seat:{x,z,yaw,lv:0},pose:'read'}); }
      else { const q=sp(c.spot); if(q) n=GM.spawnCharacter(c.id,q.x,q.z,{yaw:q.yaw||0,pose:'idle'}); }
      if(n){ n.idlePose=n.pose; n.frozen=true; } }
    if(GM.sitAt) GM.sitAt(P,{x:mx,z:mz,yaw:my,lv:0});
    let done=false;
    return { restore:async()=>{ if(done) return; done=true; S.staged=null; if(P.seat&&GM.standUp) GM.standUp(P);
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); } }; };
  S.outingStage=async function(GM,q,ev){ const cfg=ev&&S.STAGES[ev.id]; if(!cfg||!S.canStage(GM)) return null; return S.stage(GM,cfg); };

  /* ---------- 晚上進出 24 小時自習室 ---------- */
  const hallOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen('library_hall',G.hour%24,G.day);
  S.card=G=>!(G.stage==='econ'&&G.flags&&G.flags.Y0_LEFT);   /* 休學（Y0_LEFT）沒有學生證 */
  S.nightDoor=async function(GM,it){ const G=GM.G, l=L(); if(!l) return false;
    let k=1; GM.sceneBegin(); try{ if(GM.caption&&typeof PLACES!=='undefined'&&PLACES.closedText) GM.caption('',PLACES.closedText('library_hall',G.hour%24),3600);
      k=await GM.choose(S.card(G)?[{t:'從側門下 B1',hint:'24 小時自習室，刷學生證'},{t:'先不要'}]:[{t:'（沒有學生證，刷不進去）'}]); } finally { GM.sceneEnd(); }
    if(k!==0||!S.card(G)) return true; await GM.enter(Z,Object.assign({},l.stairs.spawn)); return true; };
  S.nightOut=async function(GM){ if(GM.caption) GM.caption('','大廳已經關了，從樓梯間的側門出去。',2600); await GM.enter('campus',Object.assign({},CAMPUS)); return true; };

  /* ---------- 自助借還書機、還書口 ---------- */
  S.machine=async function(GM,it,retOnly){ const G=GM.G; if(typeof LOANS==='undefined'||!law(G)) return false;
    const O=LOANS.deskOptions(G).filter(o=>!retOnly||o.act==='ret'); if(!O.length) return false;
    GM.sceneBegin(); try{ const k=await GM.choose(O.concat([{t:'（離開）'}])); const o=O[k]; if(!o) return true;
      if(o.act==='borrow'){ if(!LOANS.borrow(G,o.id)){ if(GM.toast) GM.toast('一次最多借兩本。',2600); return true; } const d=CALENDAR.dateOf(LOANS.due(LOANS.out(G,o.id))); if(GM.toast) GM.toast('借了'+LOANS.name(o.id)+'：'+d.m+'/'+d.d+' 以前還',2800); }
      else { LOANS.giveBack(G,o.id); if(GM.toast) GM.toast('還了'+LOANS.name(o.id),2400); }
      if(GM.autosave) GM.autosave(); } finally { GM.sceneEnd(); }
    return true; };

  /* ---------- 每一格（STORY.TICKS）---------- */
  S.tick=function(GM){ const G=GM.G; if(!G||G.zone!==Z||playing||S.staged) return;
    if(S.nightOn(G)) S.placeNight(GM,false); else S.leaveNight(GM);
    S.placeBar(GM);
    if(S.lineDue(GM)) S.playLine(GM).catch(e=>console.warn('B1S.line',e)); };

  if(typeof OUT!=='undefined'){
    if(OUT.STAGE) OUT.STAGE.push(S.outingStage);
    if(OUT.bg&&!OUT._b1Bg){ const b0=OUT.bg; OUT.bg=function(id){ const G=typeof GAME!=='undefined'?GAME.G:null; if((id==='library_b1'||id==='ntu_lib_b1')&&(S.staged||(G&&G.zone===Z))) return 'blur'; return b0.apply(this,arguments); }; OUT._b1Bg=true; } }
  if(typeof STORY!=='undefined'){
    if(STORY.TICKS) STORY.TICKS.push(S.tick);
    if(STORY.populate&&!STORY._b1Populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments);
      try{ if(zoneId===Z&&GM&&GM.E&&!S.staged){ const G=GM.G; if(S.nightOn(G)) S.placeNight(GM,true); S.placeBar(GM);
          for(const it of GM.E.interactables){ if(!it) continue; if(it.exit&&it.exit.to==='library_hall') it.b1Stairs=true; if(it.id==='selfcheck') it.b1Machine='all'; if(it.id==='return_slot') it.b1Machine='ret'; } }
        if(zoneId==='campus'&&GM&&GM.E){ for(const it of GM.E.interactables) if(it&&it.exit&&(it.exit.to==='library_hall'||it.exit.to==='library')) it.b1Door=true; } }catch(e){ console.warn('B1S.populate',e); }
      return r; }; STORY._b1Populate=true; }
    if(STORY.interact&&!STORY._b1Interact){ const o0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
      if(it&&G){
        if(it.b1Door&&G.zone==='campus'&&!hallOpen(G)) return S.nightDoor(GM,it);
        if(it.b1Stairs&&G.zone===Z&&!hallOpen(G)) return S.nightOut(GM);
        if(it.b1Machine&&G.zone===Z&&await S.machine(GM,it,it.b1Machine==='ret')) return true; }
      return o0.apply(this,arguments); }; STORY._b1Interact=true; } }
  return S;
})();
if(typeof window!=='undefined') window.B1S=B1S;
