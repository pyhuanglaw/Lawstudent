/* 關著的空間：不用新空間就做得到的幾節（CLOSED-SPACES-1023；AA_399，AA-B 2026-10-23；霖澤館 5F 在 src/lab5f3d.js）
   第 6 節　霖澤館 101＝學姊的助教課：大二上（Y2S1）週二 18:30～20:20，第 4～15 週（第 8、9 週期中除外；AA_518 4-14 原本第 3 週起）。門上的小窗可以「看」，一週一次（三句照次數）；
            20:20 下課她最後一個出來，在門口等一下（作息：characters.js），找她說話照一般的說話，第一次多一句。其他時候 101 照舊關著。
   第 11 節　宿舍洗衣間：門口多一個「洗衣服」（40 分鐘，不加數值）；大一週日 21～22 阿凱在裡面，第一次遇到他說一句。
            有 3D 房間（dorm_laundry）以後在裡面的「洗衣機」洗（LAWWW2-B 10-24）。 */
const CLOSED=(function(){
  const S={}; const SIS='heroine_05';
  S.LINES={
    ta:{ look:['（小窗裡：她站在黑板前面。一年級的學弟妹低著頭在寫。她寫字很快，寫完會停下來等。）','（她在黑板上畫了一張圖，有人舉手，她點了一下頭。）','（她在上課。）'],
      first:'……你在外面看了多久。', firstLover:'我在上課的時候，不要從窗戶看我。……我會分心。' },   /* AA_399 第 6 節 */
    kai:'這台烘衣機要投兩次。第一次是騙你的。' };   /* AA_399 第 11 節 */
  S.TA_WEEKS=[4,5,6,7,10,11,12,13,14,15];   /* AA_518 4-14（企劃線 973dd1b74）：第 4 週起（原本第 3 週，和動態 9/29「第一次帶。」對不上）*/
  const T=G=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
  const hol=G=>typeof CALENDAR!=='undefined'&&!!CALENDAR.holiday(G.day);
  const hr=G=>G.hour%24;
  /* 那一週有沒有助教課（Y2S1 的週二、第 3～15 週扣期中、不是放假）*/
  S.taWeek=G=>{ const t=T(G); return !!t&&t.id==='Y2S1'&&G.weekday===2&&S.TA_WEEKS.includes(t.week)&&!hol(G); };
  S.taNow=G=>S.taWeek(G)&&hr(G)>=18.5&&hr(G)<20+20/60;
  S.taOut=G=>S.taWeek(G)&&hr(G)>=20+20/60&&hr(G)<20+40/60;   /* 下課、她在門口 */
  const say=async(GM,t,who)=>{ await GM.say(who||null,t); };
  S.window=async function(GM){ const G=GM.G, F=G.flags, t=T(G), wk=t?t.id+':'+t.week:String(G.day), n=F.TA101_N|0, again=F.TA101_WK===wk;
    if(!again){ F.TA101_WK=wk; F.TA101_N=n+1; }   /* 一週算一次；同一週再看＝「（她在上課。）」*/
    GM.sceneBegin(); try{ await say(GM,S.LINES.ta.look[again?2:Math.min(n,2)]); } finally { GM.sceneEnd(); } return true; };
  /* 下課第一次找她說話：多一句（說話前的掛勾 SISY23.preTalk 包一層：前面那幾層沒演、她在 101 門口才說）*/
  S.taPre=async function(GM){ const G=GM&&GM.G; if(!G||G.flags.TA101_TALK||G.zone!=='linze'||!S.taOut(G)) return false; G.flags.TA101_TALK=G.day;
    const dt=!!G.flags['dating_'+SIS], nm=typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(SIS):SOCIAL.displayName(SIS)):'學姊';
    await say(GM,dt?S.LINES.ta.firstLover:S.LINES.ta.first,{name:nm,charId:SIS}); return false; };   /* 回 false：接著照平常說話 */
  /* 洗衣間 */
  S.y1=G=>{ if((G.stage||'law')!=='law'||typeof CALENDAR==='undefined') return false; const k=CALENDAR.dateOf(G.day).key; return k>='2025-09-01'&&k<='2026-06-30'; };   /* 大一（含寒假、學期）*/
  S.kaiHere=G=>S.y1(G)&&G.weekday===0&&hr(G)>=21&&hr(G)<22;
  S.WASH=[];   /* fn(GM, 'start'|'done', 阿凱那一句會不會說)：洗衣服的前後（不改台詞、時間）*/
  S.laundry=async function(GM,it){ const G=GM.G, F=G.flags; let k=1;
    GM.sceneBegin(); try{ k=await GM.choose([{t:'洗衣服',hint:'40 分鐘'},{t:'算了'}]); } finally { GM.sceneEnd(); }
    if(k!==0) return true;
    const kai=S.kaiHere(G)&&!F.KAI_LAUNDRY;
    const wash=async ph=>{ for(const f of S.WASH){ try{ await f(GM,ph,kai); }catch(e){ console.warn('CLOSED.WASH',e); } } };   /* 洗衣間有 3D 房間的時候（closed2_3d.js）：start＝走到洗衣機前；done（黑幕中）＝阿凱站到烘衣機前、祐廷在他旁邊 */
    await wash('start'); if(GM.fade) await GM.fade(true); GM.advance(40/60); await wash('done'); if(GM.fade) await GM.fade(false);
    if(kai){ F.KAI_LAUNDRY=G.day; GM.sceneBegin(); try{ await say(GM,S.LINES.kai,{name:typeof SOCIAL!=='undefined'?SOCIAL.displayName('kai'):'阿凱',charId:'kai'}); } finally { GM.sceneEnd(); } }
    else if(GM.toast) GM.toast('衣服洗好了。',2400);
    return true; };
  S.interact=async function(it,GM){ const G=GM&&GM.G; if(!it||!G) return false;
    if(G.zone==='linze'&&it.label==='101 教室'&&S.taNow(G)) return S.window(GM);
    if(G.zone==='dorm_hall'&&it.label==='洗衣間') return S.laundry(GM,it);
    if(G.zone==='dorm_laundry'&&it.label==='洗衣機') return S.laundry(GM,it);   /* 洗衣間有 3D 房間以後（rooms_glb3d.js 的 dorm_laundry：走廊上的門變成「進入 洗衣間」）：在裡面的洗衣機洗；門口那一條留著（沒有房間的版本）*/
    return false; };
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._closedInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; return o0.apply(this,arguments); }; STORY._closedInteract=true; }
  /* AA_413 日日便利（溫州街 A5，wzshops3d.js 的 S.AA413；那個檔比 story3d.js 早載入，掛勾裝在這裡）：從溫州街進去的，便利商店的出口回溫州街；
     結帳以前店員一句（兩段時間、第 5 次起認得你）、結帳以後考試週 21:00 以後一句（一天一次）；從公館的門進去、去別的地方＝清掉 CVS_FROM */
  S.cvsInteract=async function(it,GM){ const G=GM&&GM.G, W=typeof WZS!=='undefined'?WZS:null; if(!G||!W||!W.AA413||!it) return null;
    if(it.exit&&it.exit.to==='cvs'){ G.flags.CVS_FROM='gongguan'; return null; }
    if(G.zone==='cvs'&&it.exit&&it.exit.to==='gongguan'&&G.flags.CVS_FROM==='wenzhou'){ G.flags.CVS_FROM=null; await GM.enter('wenzhou',Object.assign({},W.AA413.cvs.out)); return true; }
    if(it.shop==='cvs'&&W.cvsHere(G)){ GM.sceneBegin(); try{ await GM.say({name:'店員'},W.cvsGreet(G)); } finally { GM.sceneEnd(); } return 'after'; }
    return null; };
  S.cvsAfter=async function(GM){ const G=GM.G, W=WZS; G.flags.WZ_CVS_N=(G.flags.WZ_CVS_N|0)+1;
    if(W.cvsExamLine(G)){ G.flags.WZ_CVS_EXAM=G.day; GM.sceneBegin(); try{ await GM.say({name:'店員'},W.AA413.cvs.exam); } finally { GM.sceneEnd(); } } };
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._wz413){ const o1=STORY.interact; STORY.interact=async function(it,GM){ const r=await S.cvsInteract(it,GM); if(r===true) return true;
      const out=await o1.apply(this,arguments); if(r==='after') await S.cvsAfter(GM); return out; }; STORY._wz413=true; }
  /* 阿忠水果的老闆（LAWWW2-B 10-23 5437ec936：攤子在 B6 門廊前緣，WZS.AA413.fruit.owner＝老闆站位，在門廊裡、玩家走不到）：營業時間（09:00～22:00）站在攤子後面；不說話（買水果在攤子前面的互動點）*/
  S.fruitOwnerWant=G=>!!G&&G.zone==='wenzhou'&&typeof WZS!=='undefined'&&!!WZS.fruitOpen&&WZS.fruitOpen(G);
  S.fruitOwner=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.npcs||typeof CHAR==='undefined'||typeof STORY==='undefined'||!STORY.extraSpec||!E.addNPC) return 0;
    const cur=E.npcs.find(n=>n&&n.fruitOwner&&!n.leaving), want=S.fruitOwnerWant(G);
    if(cur&&!want){ cur.until=G.hour%24; cur.leaving=true; if(GM.removeNPC&&cur.charId) GM.removeNPC(cur.charId); else if(E.removeNPC) E.removeNPC(cur); return -1; }
    if(!cur&&want){ const o=(WZS.AA413.fruit||{}).owner; if(!o) return 0; const obj=CHAR.build(STORY.extraSpec(821)); obj.position.set(o.x,0,o.z); obj.rotation.y=o.yaw||0;
      E.addNPC({obj,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,fruitOwner:true}); return 1; }
    return 0; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ const G=GM&&GM.G; if(G&&G.zone==='wenzhou') S.fruitOwner(GM); }catch(e){ console.warn('CLOSED.fruitOwner',e); } return false; });
  if(typeof STORY!=='undefined'&&STORY.populate&&!STORY._wz413Pop){ const p1=STORY.populate; STORY.populate=function(zoneId,GM){ if(zoneId!=='cvs'&&GM&&GM.G&&GM.G.flags&&GM.G.flags.CVS_FROM) GM.G.flags.CVS_FROM=null; const r=p1.apply(this,arguments); if(zoneId==='wenzhou'){ try{ S.fruitOwner(GM); }catch(e){ console.warn('CLOSED.fruitOwner',e); } } return r; }; STORY._wz413Pop=true; }
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._closed){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); return r||await S.taPre(GM); },p0,{_closed:true}); }
  return S;
})();
if(typeof window!=='undefined') window.CLOSED=CLOSED;
