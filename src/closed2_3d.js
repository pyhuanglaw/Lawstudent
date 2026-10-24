/* 關著的空間（二）：AA_399（企劃線 5d09bb725，AA-B 2026-10-23）第 5、7、12 節裡不用新空間就做得到的部分（第 6、11 節的洗衣間在 src/closed3d.js；第 3、4 節在 lupstory3d.js、gymcer3d.js）。
   第 5 節　萬才館研討室 B（法服的初談室）：還沒有 3D 的房間，門照舊關著；門上換成那一張紙：平常「法服初談：單週六上午」，2028-10-26（推甄面試那天）「推甄面試，請在外面等候」。
            這扇門有 onInteract（activities.js 的模擬法庭 moot_2～4 在 seminarB，classes3d.js 的 roomDoor 在按下去的時候讀 WANCAI_LAYOUT 那扇門的 closed），
            所以把那扇門的 closed 換成 getter（不改 wancai_layout.js 的 JSON：Blender 讀檔案，不受影響）。
            語彤阿姨（2027-05-22）、推甄面試、SQ02 照舊用 2D；柏翰在裡面值班要等房間做好。
   第 7 節　法律學院辦公室（系辦）：還沒有 3D 的房間；交換志願表在門口交（辦公時間：平日 09:00～12:00、13:30～17:00），系辦助理一句，記 EXCH_FORM_DESK（一次）。
            交換路線照舊在 11/18 12:00 照交往狀態定（story3d.js 的 S.routeWatch），沒交照現在的規則（11/18 的截止旁白）。
            什麼時候可以交（不和現有的劇情打架）：
              - 2027-11-15 起、截止旁白（ROUTE_NARR）播之前（11/18 起床那一刻就播，所以實際上是 11/15～11/17）；
              - 只有「表上有第一志願」的路線：S.routeFor＝US。TW＝截止旁白「最後沒有交」；JP（和以安交往中）＝以安 11/16 的「我們一起填」、Café 的「那我們明天早上一起交」，交給 11/18 的旁白；
              - US、以安那一段還在（STORY.an15On）：Café（11/17）演過以後才可以（Café 上填表）；
              - 在門口交了：11/18 旁白裡「（你把表交到系辦。……）」那一句不再播（包住 STORY.routeNarrLines，story3d.js 不改）。
            延畢的證書（2030-01-21）已經在 src/r2y4b3d.js 的 S.cert。
   第 12 節　總圖多媒體中心：還沒有 3D 的房間；門口多一個「看一部片」（60 分鐘），一句旁白（洗衣間那種做法）；看完會過總圖 22:00 關門的（21:00 以後）不給，照舊是門上的字。芷若在裡面要等她的作息和房間。
   系統字：選項「交志願表」「看一部片」「算了」、小字「60 分鐘」、研討室 B 的「研討室 B。門上貼著一張紙：」。測試：node tests/aa399_closed2_unit.js */
'use strict';
const CLOSED2=(function(){
  const S={};
  S.LINES={
    semB:{ sign:'「法服初談：單週六上午」', interview:'「推甄面試，請在外面等候」' },   /* AA_399 第 5 節：門上的紙 */
    office:{ who:'系辦助理', form:'交換志願表？放這裡。……第一志願寫好了嗎？好。' },   /* AA_399 第 7 節 */
    media:'（你借了一副耳機。片子很長，你看到一半睡著了。）' };   /* AA_399 第 12 節 */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const hr=G=>G.hour%24;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const wd=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7);
  /* 第 5 節：研討室 B 門上的紙 */
  S.semBSign=G=>G&&G.day===DK('2028-10-26')?S.LINES.semB.interview:S.LINES.semB.sign;
  S.semBText=G=>'研討室 B。門上貼著一張紙：'+S.semBSign(G);
  const curG=()=>typeof GAME!=='undefined'&&GAME&&GAME.G?GAME.G:null;
  S.hookSemB=function(){ if(typeof WANCAI_LAYOUT==='undefined'||!Array.isArray(WANCAI_LAYOUT.doors)) return false; const d=WANCAI_LAYOUT.doors.find(x=>x.id==='seminarB'); if(!d) return false;
    const p=Object.getOwnPropertyDescriptor(d,'closed'); if(p&&p.get&&p.get._closed2) return true; const get=()=>S.semBText(curG()); get._closed2=true;
    Object.defineProperty(d,'closed',{get,enumerable:true,configurable:true}); return true; };
  S.hookSemB();
  /* 第 7 節：系辦的辦公時間、交志願表的期間 */
  S.officeOpen=G=>{ if(!G||typeof CALENDAR==='undefined') return false; const w=wd(G), h=hr(G); if(w<1||w>5||CALENDAR.holiday(G.day)) return false; return (h>=9&&h<12)||(h>=13.5&&h<17); };
  const st=(k,G)=>typeof STORY!=='undefined'&&typeof STORY[k]==='function'?STORY[k](G):null;
  S.formDue=G=>{ if(!law(G)) return false; const F=G.flags||{}; if(F.EXCH_FORM_DESK!=null||F.ROUTE_NARR!=null) return false;
    const a=DK('2027-11-15'), b=DK('2027-11-18'); if(a==null||b==null||G.day<a||G.day>b) return false; if(G.day===b&&hr(G)>=12) return false;
    if(st('routeFor',G)!=='US') return false; if(st('an15On',G)&&F.AN15_SEEN==null) return false;
    return S.officeOpen(G); };
  S.officeForm=async function(GM){ const G=GM.G; let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:'交志願表'},{t:'算了'}]); if(k===0){ G.flags.EXCH_FORM_DESK=G.day; await GM.say({name:S.LINES.office.who},S.LINES.office.form); } } finally { GM.sceneEnd(); } return true; };
  /* 第 12 節：多媒體中心看一部片（總圖開館的時候才進得來；看完會過關門的不給）*/
  S.mediaOk=G=>{ const P=typeof PLACES!=='undefined'&&PLACES.hours&&PLACES.hours.library_hall, c=P&&P.close!=null?P.close:22; return hr(G)+1<=c; };
  S.media=async function(GM){ const G=GM.G; let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:'看一部片',hint:'60 分鐘'},{t:'算了'}]); } finally { GM.sceneEnd(); } if(k!==0) return true;
    if(GM.fade) await GM.fade(true); GM.advance(1); if(GM.fade) await GM.fade(false); GM.sceneBegin(); try{ await GM.say(null,S.LINES.media); } finally { GM.sceneEnd(); } return true; };
  S.interact=async function(it,GM){ const G=GM&&GM.G; if(!it||!G) return false;
    if(G.zone==='linze'&&it.label==='法律學院辦公室'&&S.formDue(G)) return S.officeForm(GM);
    if(G.zone==='library_hall'&&it.label==='多媒體中心'&&S.mediaOk(G)) return S.media(GM);
    return false; };
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._closed2Interact){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; return o0.apply(this,arguments); }; STORY._closed2Interact=true; }
  /* 第 7 節：在系辦門口交過的，11/18 截止旁白不再說「你把表交到系辦」*/
  if(typeof STORY!=='undefined'&&typeof STORY.routeNarrLines==='function'&&!STORY._closed2Narr){ const n0=STORY.routeNarrLines; STORY.routeNarrLines=function(G){ const L=n0.apply(this,arguments); return G&&G.flags&&G.flags.EXCH_FORM_DESK!=null&&Array.isArray(L)?L.filter(t=>!/^（你把表交到系辦/.test(t)):L; }; STORY._closed2Narr=true; }
  return S;
})();
if(typeof window!=='undefined') window.CLOSED2=CLOSED2;
