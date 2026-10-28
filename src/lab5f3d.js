/* 霖澤館 5F 研究室的劇情接線（CLOSED-SPACES-1023；AA_399 第 1 節，AA-B 2026-10-23；空間是 LAWWW2-B 的 linze_5f，src/linze_upper3d.js）
   1. 學姊的作息（characters.js）：碩一～碩三週一～週四 12:20～14:00 在研究室門邊的位子（spot sis_desk；AA_399 1-1 更正，企劃 8a21184d）；美國期間不在。
   2. 4F 樓梯間往上的刷卡門：她在的時段多一個「傳訊息給學姊」，兩分鐘後她出來開門（照關係一句），一天一次；進去以後找她說話照一般的說話（talkSis）。
      其他時候照舊只有門上的那一句。14:00 她收東西：「我要去總圖了。」（大三起「我要去法圖了。」、2028-02 起去研究小間的日子「我去研究小間了。」，AA_437）祐廷跟著出去（回到 4F 樓梯間）。
   3. 原本 2D 研究室走廊的出遊（AA_399 1-2 的表）：演之前換到 5F（OUT.STAGE），畫面用模糊的 3D，台詞不變；演完回到原本的地方。
      在家、在國外、騎車、有人跟著的時候照舊用 2D。研究室走廊的底圖（linze_prof_hall、ra_lab）在 5F 演的時候換成 3D（OUT.bg 包一層）。 */
const LAB5=(function(){
  const S={}; const SIS='heroine_05', Z='linze_5f';
  const L5=()=>typeof LINZE_UPPER_LAYOUTS!=='undefined'?LINZE_UPPER_LAYOUTS['5f']:null;
  const L4=()=>typeof LINZE_UPPER_LAYOUTS!=='undefined'?LINZE_UPPER_LAYOUTS['4f']:null;
  const hr=G=>G.hour%24;
  const dating=G=>!!(G.flags&&G.flags['dating_'+SIS]);
  S.LINES={ open:{ low:'……有事嗎。進來。', friend:'你來了。進來，小聲一點。', lover:'（她開了門，沒有說話，拉你的袖子進去。）' }, leave:'我要去總圖了。', leaveLaw:'我要去法圖了。', leaveCarrel:'我去研究小間了。' };   /* AA_399 1-2 第 1 點；AA_437 第 2 節：大三起（2027-09）她下午在法圖「我要去法圖了。」，2028-02 起去研究小間的日子「我去研究小間了。」*/
  S.leaveLine=G=>{ if(typeof LUP!=='undefined'&&LUP.sisPeriod&&LUP.sisPeriod(G)) return S.LINES.leaveCarrel;
    const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day|0):null; return d&&(d.y*10000+d.m*100+d.d)>=20270901?S.LINES.leaveLaw:S.LINES.leave; };
  /* 她現在照作息在研究室（不看玩家在哪裡）*/
  S.labNow=function(G){ if(!G||typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined') return false; const c=CHARACTERS[SIS]; if(!c) return false;
    if(STORY.presence){ const p=STORY.presence(SIS,G); if(p&&p.here===false) return false; }   /* 美國、在家（寒暑假）*/
    const ent=STORY.schedEnt(c,G); return !!ent&&ent.zone===Z; };
  const contact=G=>(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,SIS))&&(typeof SOCIAL==='undefined'||!SOCIAL.has||SOCIAL.has(SIS,'FIRST_MET'));   /* 直屬學姊一開始就有聯絡方式（invites.js contacts0）：還要見過她 */
  /* AA_512 第 2 節第 5 點（企劃線 c444f0757）：交往中週一、三 19:00～21:30 她也在研究室（characters.js；src/sis_b13_3d.js S.labEve）——晚上那一段另外算一次（LAB5_DOOR_EVE），
     進去記 LAB5_IN_EVE；她的作息離開研究室（21:30）就一起出去回到 4F（稿沒有晚上收東西的那一句：不說話）。白天照舊 */
  const eve=G=>hr(G)>=19;
  S.canKnock=G=>S.labNow(G)&&contact(G)&&(eve(G)?G.flags.LAB5_DOOR_EVE!==G.day:G.flags.LAB5_DOOR!==G.day);
  const tier=G=>{ if(dating(G)) return 'lover'; if(typeof SOCIAL==='undefined') return 'low'; const st=SOCIAL.STAGES.indexOf(SOCIAL.stage(SIS)); return st>=SOCIAL.STAGES.indexOf('FRIEND')?'friend':'low'; };
  const who=()=>({name:typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(SIS):SOCIAL.displayName(SIS)):'學姊',charId:SIS});
  const say=async(GM,line)=>{ if(/^（/.test(line)) await GM.say(null,line); else await GM.say(who(),line); };
  const sp=(L,k)=>(L&&L.spots&&L.spots[k])||null;
  /* 4F 刷卡門（往 5F 以上） */
  S.door=async function(GM,it){ const G=GM.G, F=G.flags, closed=(it&&it.look)||(L4()&&L4().stairs.up.closed)||'';
    if(!S.canKnock(G)){ if(GM.caption) GM.caption('',closed,4600); return true; }
    let k=1; GM.sceneBegin(); try{ if(GM.caption) GM.caption('',closed,3000); k=await GM.choose([{t:'傳訊息給學姊'},{t:'算了'}]); } finally { GM.sceneEnd(); }
    if(k!==0) return true;
    const ev=eve(G); if(ev) F.LAB5_DOOR_EVE=G.day; else F.LAB5_DOOR=G.day; GM.sceneBegin();
    try{ GM.advance(2/60); await say(GM,S.LINES.open[tier(G)]); } finally { GM.sceneEnd(); }
    const L=L5(); if(!L) return true; if(ev) F.LAB5_IN_EVE=G.day; else F.LAB5_IN=G.day; await GM.enter(Z,Object.assign({},L.stairs.spawn)); return true; };
  /* 14:00：她收東西，祐廷跟著出去；晚上那一段（AA_512）：她的作息不在研究室了（21:30）、或已經過了那一天＝一起出去，不說話 */
  let leaving=false;
  S.eveTerm=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return t?t.id:null; };   /* 一學期一次：記學期（G.flags.LAB5_EVE_OUT）*/
  S.eveOutLine=()=>typeof SISB13_LINES!=='undefined'&&SISB13_LINES.labEveOut||null;
  S.leaveDue=G=>!!G&&G.zone===Z&&!S.staged&&((G.flags.LAB5_IN===G.day&&hr(G)>=14)||(G.flags.LAB5_IN_EVE!=null&&(G.flags.LAB5_IN_EVE!==G.day||!S.labNow(G))));
  S.tick=function(GM){ const G=GM&&GM.G; if(leaving||!S.leaveDue(G)) return false; if(GM.D&&GM.D.active) return false; if(typeof EVENTS!=='undefined'&&EVENTS.running) return false; if(typeof ADV!=='undefined'&&ADV.active) return false;
    leaving=true; (async()=>{ try{ const evIn=G.flags.LAB5_IN_EVE!=null; G.flags.LAB5_IN=null; G.flags.LAB5_IN_EVE=null; if(!evIn&&GM.npc&&GM.npc[SIS]){ GM.sceneBegin(); try{ await say(GM,S.leaveLine(G)); } finally { GM.sceneEnd(); } }
      if(evIn){ const tk=S.eveTerm(G), t=S.eveOutLine(); if(t&&tk&&G.flags.LAB5_EVE_OUT!==tk){ G.flags.LAB5_EVE_OUT=tk; GM.sceneBegin(); try{ await say(GM,t); } finally { GM.sceneEnd(); } } }   /* AA_512 第 7 節第 12 點：晚上 21:30 一起出去，一學期一次那一句旁白 */
      const L=L4(); if(L) await GM.enter('linze_4f',Object.assign({},L.stairs.spawn)); } catch(e){ console.warn('LAB5.leave',e); } finally { leaving=false; } })(); return true; };
  /* 出遊換到 5F 演（AA_399 1-2 的表）：me＝祐廷站的位置 [x,z,yaw]；sis＝她在哪個 spot（sit＝坐著）；lights、exam 照 LZUP */
  const DESK_ME='me_desk';   /* 主角站著和她說話的位置：配置的 spots.me_desk（10-23 AA_399 1-1 更正：她的桌子在門邊；原本寫死在靠窗那張旁邊 [-4.75,4.55,-0.55]）*/
  S.STAGES={
    ev_sis_lab_desk:{ me:DESK_ME, sis:'sis_desk', sit:true, lights:'all' },
    ev_sis_xmas_y3:{ me:DESK_ME, sis:'sis_desk', sit:true, lights:'sis' },   /* 只開她那一盞燈 */
    ev_sis_plan_lab:{ me:DESK_ME, sis:'sis_desk', sit:true, lights:'all' },
    ev_sis_y4_desks:{ meSeat:'beside', sis:'sis_desk', sit:true, lights:'all' },   /* 兩張桌子並排 */
    ev_sis_defense:{ me:'meeting_door', exam:true, lights:'all' },   /* M9：會議室門口，門上「口試中」；她在裡面 */
    ev_choice_apart_heroine_05:{ me:'corridor', sis:'corridor', face:true, lights:'all', when:q=>!!(q&&q.apart&&q.apart.y===2029) },   /* 分開談話 2029-05-30 17:00：5F 走廊（2030 年那一場不在這裡）*/
    ev_pg_sis_bday:{ me:DESK_ME, sis:'sis_desk', sit:true, lights:'all' } };
  S.staged=null;
  S.canStage=function(GM,o){ const G=GM.G, E=GM.E; if(!G||!E||!E.player) return false; if(typeof Z3==='undefined'||!Z3.ZONES[Z]||!Z3.ZONES[G.zone]||!L5()) return false;
    if(o&&o.fromHome) return false; if(typeof OUT!=='undefined'&&OUT.fromHome) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;
    if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false; if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return false; if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return false;
    if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  S.stage=async function(GM,cfg){ const G=GM.G, E=GM.E, P=E.player, L=L5(); if(!cfg||!L) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0};
    if(P.seat&&GM.standUp) GM.standUp(P);
    if(typeof LZUP!=='undefined'){ LZUP.examSign(!!cfg.exam); LZUP.labLights(cfg.lights||'all'); }
    const at=Array.isArray(cfg.me)?{x:cfg.me[0],z:cfg.me[1],yaw:cfg.me[2]||0}:(sp(L,cfg.me)?Object.assign({},sp(L,cfg.me)):(cfg.meSeat&&sp(L,cfg.meSeat)?{x:sp(L,cfg.meSeat).x,z:sp(L,cfg.meSeat).z-0.7,yaw:0}:Object.assign({},L.stairs.spawn)));
    S.staged=cfg; await GM.enter(Z,{x:at.x,z:at.z,yaw:at.yaw||0},{noFade:true,deferStory:true,noAutosave:true});
    const s=cfg.sis&&sp(L,cfg.sis);
    if(s&&GM.spawnCharacter){ let n=GM.npc&&GM.npc[SIS];
      if(n&&cfg.sit&&n.seat&&Math.hypot(n.seat.x-s.x,n.seat.z-s.z)<0.35){ /* 作息已經讓她坐在那裡 */ }
      else { if(n&&GM.removeNPC) GM.removeNPC(SIS);
        if(cfg.sit) n=GM.spawnCharacter(SIS,s.x,s.z,{seat:{x:s.x,z:s.z,yaw:s.yaw||0,lv:0},pose:'read'});
        else { const x=s.x+Math.sin(at.yaw||0)*1.2, z=s.z+Math.cos(at.yaw||0)*1.2; n=GM.spawnCharacter(SIS,x,z,{yaw:Math.atan2(at.x-x,at.z-z),pose:'idle'}); }
        if(n){ n.idlePose=n.pose; n.frozen=true; } } }
    if(cfg.meSeat&&GM.sitAt){ const q=sp(L,cfg.meSeat); if(q) GM.sitAt(P,{x:q.x,z:q.z,yaw:q.yaw||0,lv:0}); }
    else if(s&&GM.face){ GM.face(P,s.x,s.z); }
    let done=false;
    return { restore:async()=>{ if(done) return; done=true; S.staged=null; if(typeof LZUP!=='undefined'){ LZUP.examSign(false); LZUP.labLights('all'); }
      if(P.seat&&GM.standUp) GM.standUp(P);
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); } }; };
  S.outingStage=async function(GM,q,ev){ const cfg=ev&&S.STAGES[ev.id]; if(!cfg||(cfg.when&&!cfg.when(q))) return null; if(!S.canStage(GM)) return null; return S.stage(GM,cfg); };
  if(typeof OUT!=='undefined'){
    if(OUT.STAGE) OUT.STAGE.push(S.outingStage);
    if(OUT.bg&&!OUT._lab5Bg){ const b0=OUT.bg; OUT.bg=function(id){ if(S.staged&&(id==='linze_prof_hall'||id==='ra_lab')) return 'blur'; return b0.apply(this,arguments); }; OUT._lab5Bg=true; } }
  if(typeof STORY!=='undefined'){
    if(STORY.TICKS) STORY.TICKS.push(S.tick);
    if(STORY.populate&&!STORY._lab5Populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ if(zoneId===Z&&GM&&GM.E&&GM.E.zone&&!GM.E.zone.spots&&L5()) GM.E.zone.spots=L5().spots;   /* 作息的 spot（學姊的位子）要在補人以前就有 */
      const r=p0.apply(this,arguments); try{ if(zoneId==='linze_4f'&&GM&&GM.E){ const lab=L4()&&L4().stairs.up.label; for(const it of GM.E.interactables) if(it&&it.label===lab&&it.look) it.lab5door=true; } }catch(e){ console.warn('LAB5.populate',e); } return r; }; STORY._lab5Populate=true; }
    if(STORY.interact&&!STORY._lab5Interact){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.lab5door&&GM&&GM.G) return S.door(GM,it); return o0.apply(this,arguments); }; STORY._lab5Interact=true; } }
  return S;
})();
if(typeof window!=='undefined') window.LAB5=LAB5;
