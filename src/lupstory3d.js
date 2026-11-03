/* 總圖研究小間、5F 書庫的劇情（AA_399 第 3 節，企劃線 5d09bb725；空間是 LAWWW2 的 src/library_upper3d.js〔LUP〕；台詞一字不改）
   - 3-1 玩家：大四起在 1F 服務台預約研究小間，一次三小時、一天一次（LOANS.DESK_EXTRA 多一個選項）。預約了 08 的門開著、可以坐下讀書；
     第一次進去那天的旁白「（小間裡只聽得到自己翻書的聲音。）」。效果和讀書一樣（08 的座位本來就是讀書座位），不另外加數值。
   - 3-1 學姊：2028-02～2029-05 平日 14:00～17:00 在 03（美國期間除外＝那天她不在臺北就不在）；03 的門「敲玻璃」：她不開門，便利貼一天一次，照關係一句（AA_398：一句、不編號）。
     還沒到「有點熟」＝沒有「敲玻璃」，照舊只是看。五點前後在總圖門口照一般的 talkSis：作息在 characters.js（另外排）。
   - 3-3 方奕廷：大二上第 12～14 週，週二 15:00～17:00 在 5F 最裡面那一排（spots.fang）找植物圖鑑；找他說話照他的階梯，多一句（一次）。
   - 「便利貼」的說話人標籤、預約的選項字是程式補的（系統字）。 */
const LUPS=(function(){
  const S={}, SIS='heroine_05', FY='npc_fangyt';
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const hr=G=>(+G.hour||0)%24;
  const LAY=k=>typeof LIBRARY_UPPER_LAYOUTS!=='undefined'?LIBRARY_UPPER_LAYOUTS[k]:null;
  const stage=id=>typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id):'STRANGER';
  const rank=st=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES.indexOf(st):-1;
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]);
  S.LINES={ quiet:'（小間裡只聽得到自己翻書的聲音。）', fang:'這本借不出去，只能在這裡看。……所以我每個禮拜二來。',
    note:{FAMILIAR:'圖書館裡不能講話。',FRIEND:'五點出去。',CLOSE:'我在寫第五章。你去念你的。',DATING:'（便利貼上畫了一個時鐘，指著五點。）'} };
  /* ---------- 3-1 玩家預約 ---------- */
  S.y4=G=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y4S1'):null; return !!r&&(G.day|0)>=r.from; };
  S.canBook=G=>law(G)&&S.y4(G)&&G.flags.carrelDay!==(G.day|0)&&hr(G)>=8&&hr(G)<21;   /* 一天一次；開館時間內（三小時讀得完：21:00 以前）*/
  S.book=function(G){ if(!S.canBook(G)) return false; G.flags.carrelDay=G.day|0; G.flags.carrelUntil=Math.min(hr(G)+3,24); return true; };
  S.booked=G=>!!(G&&G.flags&&G.flags.carrelDay===(G.day|0)&&(G.flags.carrelUntil==null||hr(G)<G.flags.carrelUntil));
  /* ---------- 3-1 學姊 ---------- */
  S.sisAway=G=>typeof STORY!=='undefined'&&STORY.present&&!STORY.present(SIS,{day:G.day|0});   /* 美國那學期、回家：那天不在臺北 */
  S.noteKey=G=>{ if(dating(G,SIS)) return 'DATING'; const r=rank(stage(SIS)); if(r>=rank('CLOSE_FRIEND')) return 'CLOSE'; if(r>=rank('FRIEND')) return 'FRIEND'; if(r>=rank('FAMILIAR')) return 'FAMILIAR'; return null; };
  S.knockOk=G=>law(G)&&typeof LUP!=='undefined'&&LUP.sisHere(G)&&!!S.noteKey(G);
  S.knock=async function(GM){ const G=GM.G, F=G.flags; if(!S.knockOk(G)) return false; GM.sceneBegin();
    try{ if(F.carrelNoteDay===(G.day|0)){ const k=S.noteKey(G); if(typeof LUP!=='undefined') LUP.note(true); await say(GM,k); return true; }   /* 今天已經貼過：同一張 */
      F.carrelNoteDay=G.day|0; const k=S.noteKey(G); (F.CARREL_NOTES||(F.CARREL_NOTES={}))[k]=(F.CARREL_NOTES[k]|0)+1; if(typeof LUP!=='undefined') LUP.note(true); await say(GM,k); }
    finally { GM.sceneEnd(); } return true; };
  const say=(GM,k)=>{ const t=S.LINES.note[k]; return /^（/.test(t)?GM.say(null,t):GM.say({name:'便利貼'},t); };
  S.placeSis=function(GM){ const G=GM.G; if(G.zone!=='library_carrels'||typeof LUP==='undefined'||!LUP.sisHere(G)||!GM.spawnCharacter||(GM.npc&&GM.npc[SIS])) return false;
    const sp=(LAY('carrels')||{spots:{}}).spots.sis_seat; if(!sp) return false; const n=GM.spawnCharacter(SIS,sp.x,sp.z,{seat:{x:sp.x,z:sp.z,yaw:sp.yaw,lv:0},pose:'read'}); if(n){ n.idlePose='read'; n.frozen=true; n.lupSis=true; } return !!n; };
  /* ---------- 3-3 方奕廷 ---------- */
  S.fangWin=G=>{ if(!law(G)||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day|0); if(!t||t.id!=='Y2S1'||t.week<12||t.week>14) return false;
    const d=CALENDAR.dateOf(G.day|0); return d.wd===2&&!(CALENDAR.holiday&&CALENDAR.holiday(G.day|0))&&hr(G)>=15&&hr(G)<17&&(typeof STORY==='undefined'||!STORY.present||STORY.present(FY,{day:G.day|0})); };
  S.fangKnown=()=>typeof STORY!=='undefined'&&STORY.knows?STORY.knows(FY,typeof GAME!=='undefined'?GAME.G:null):rank(stage(FY))>=rank('ACQUAINTANCE');
  S.placeFang=function(GM){ const G=GM.G; if(G.zone!=='library_stacks'||!S.fangWin(G)||!S.fangKnown()||!GM.spawnCharacter||(GM.npc&&GM.npc[FY])) return false;
    const sp=(LAY('stacks')||{spots:{}}).spots.fang; if(!sp) return false; const n=GM.spawnCharacter(FY,sp.x,sp.z,{yaw:sp.yaw,pose:'idle'}); if(n){ n.frozen=true; n.lupFang=true; } return !!n; };
  S.preTalk=async function(GM,who,id){ const G=GM.G; if(id!==FY||G.zone!=='library_stacks'||!S.fangWin(G)||G.flags.FY_STACKS_SAID) return; G.flags.FY_STACKS_SAID=G.day|0; await GM.say(who,S.LINES.fang); };
  /* ---------- 掛上去 ---------- */
  /* 那個時間她的作息在別的地方（例：2028-07-31 總圖三樓 10:00～16:00，AA_392）＝不在 03（研究小間那三小時作息是空的，characters.js）*/
  S.sisElsewhere=G=>{ if(typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined'||!CHARACTERS[SIS]) return false; let e=null; try{ e=STORY.schedEnt(CHARACTERS[SIS],{day:G.day|0,hour:G.hour,weekday:G.weekday,flags:G.flags||{},noInvite:true}); }catch(err){ e=null; } return !!(e&&e.zone&&e.zone!=='library_carrels'); };
  if(typeof LUP!=='undefined'){
    const sp0=LUP.sisPeriod; LUP.sisPeriod=G=>!!sp0(G)&&!S.sisAway(G);   /* 美國期間除外（AA_399 3-1）*/
    const sh0=LUP.sisHere; LUP.sisHere=G=>!!sh0(G)&&!S.sisElsewhere(G);
    LUP.booked=S.booked; }
  if(typeof LOANS!=='undefined'&&Array.isArray(LOANS.DESK_EXTRA)) LOANS.DESK_EXTRA.push(G=>S.canBook(G)?[{t:'預約研究小間（三小時）',run:async GM=>{ if(S.book(GM.G)&&GM.toast) GM.toast('研究小間 08：今天 '+Math.floor(hr(GM.G))+':00 起三小時',2800); }}]:[]);
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(S.preTalk);
    if(STORY.populate&&!STORY._lupsPopulate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments);
        try{ if(GM&&GM.E&&GM.G){ const G=GM.G;
            if(zoneId==='library_carrels'){ S.placeSis(GM); for(const it of GM.E.interactables) if(it&&it.id==='door03') it.lupKnock=true;
              if(S.booked(G)&&G.flags.CARREL_QUIET!==(G.day|0)){ G.flags.CARREL_QUIET=G.day|0; if(GM.say){ GM.sceneBegin(); Promise.resolve().then(()=>GM.say(null,S.LINES.quiet)).catch(e=>console.warn('LUPS.quiet',e)).finally(()=>{ if(GM.G===G){ GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); } } }   /* 決定開演的那一刻就鎖住（STUCK-HARDEN-1027，同 invites3d.js S.autoStart）：延後開演的空檔裡，玩家按的「說話」、同一格的 EVENTS.tick 都進不來；演完放開再自動存檔 */
            if(zoneId==='library_stacks') S.placeFang(GM); } }catch(e){ console.warn('LUPS.populate',e); }
        return r; }; STORY._lupsPopulate=true; }
    if(STORY.interact&&!STORY._lupsInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&G&&it.lupKnock&&G.zone==='library_carrels'&&S.knockOk(G)) return S.knock(GM);
        return o0.apply(this,arguments); }; STORY._lupsInteract=true; }
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ const G=GM&&GM.G; if(!G||G.zone!=='library_carrels'||!GM.E) return false; const on=S.knockOk(G);   /* 學姊來了／走了：03 的門換成「敲玻璃」或照舊看 */
      for(const it of GM.E.interactables) if(it&&it.lupKnock){ if(it.label0==null) it.label0=it.label; it.label=on?'敲玻璃':it.label0; } if(on) S.placeSis(GM); return false; }); }
  return S;
})();
if(typeof window!=='undefined') window.LUPS=LUPS;
