/* 關著的空間（二）：AA_399（企劃線 5d09bb725，AA-B 2026-10-23）第 5、7、12 節裡不用新空間就做得到的部分（第 6、11 節的洗衣間在 src/closed3d.js；第 3、4 節在 lupstory3d.js、gymcer3d.js）。
   第 5 節　萬才館研討室 B（法服的初談室）：房間做好了（LAWWW2 #82，87a4a60ca：rooms_glb3d.js 的 wancai_semb；單週六 09～12、2027-05-22、2028-10-26 門才開）；時段外門照舊關著，門上那一張紙：平常「法服初談：單週六上午」，2028-10-26（推甄面試那天）「推甄面試，請在外面等候」。
            這扇門有 onInteract（activities.js 的模擬法庭 moot_2～4 在 seminarB，classes3d.js 的 roomDoor 在按下去的時候讀 WANCAI_LAYOUT 那扇門的 closed），
            所以把那扇門的 closed 換成 getter（不改 wancai_layout.js 的 JSON：Blender 讀檔案，不受影響）。
            柏翰值班、語彤阿姨（2027-05-22）、推甄面試、SQ02 搬進房間：本檔最下面「房間做好以後」；房間不在（舊版、測試）照舊用 2D。
   第 7 節　法律學院辦公室（系辦）：房間做好了（rooms_glb3d.js 的 linze_office，辦公時間門才開）：交換志願表在裡面的服務台交；房間不在（舊版）＝在門口交（辦公時間：平日 09:00～12:00、13:30～17:00）。系辦助理一句，記 EXCH_FORM_DESK（一次）。
            交換路線照舊在 11/18 12:00 照交往狀態定（story3d.js 的 S.routeWatch），沒交照現在的規則（11/18 的截止旁白）。
            什麼時候可以交（不和現有的劇情打架）：
              - 2027-11-15 起、截止旁白（ROUTE_NARR）播之前（11/18 起床那一刻就播，所以實際上是 11/15～11/17）；
              - 只有「表上有第一志願」的路線：S.routeFor＝US。TW＝截止旁白「最後沒有交」；JP（和以安交往中）＝以安 11/16 的「我們一起填」、Café 的「那我們明天早上一起交」，交給 11/18 的旁白；
              - US、以安那一段還在（STORY.an15On）：Café（11/17）演過以後才可以（Café 上填表）；
              - 在門口交了：11/18 旁白裡「（你把表交到系辦。……）」那一句不再播（包住 STORY.routeNarrLines，story3d.js 不改）。
            延畢的證書（2030-01-21）在 src/r2y4b3d.js 的 S.cert；C10 學分採計、證書換到系辦房間演：本檔最下面「房間做好以後」。
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
    if(((G.zone==='linze'&&it.label==='法律學院辦公室'&&!S.roomOk('linze_office'))||(G.zone==='linze_office'&&it.label==='服務台'))&&S.formDue(G)) return S.officeForm(GM);   /* 系辦有 3D 房間以後（rooms_glb3d.js linze_office，辦公時間門才開）：在裡面的服務台交；門口交只在沒有房間的版本 */
    if(G.zone==='library_hall'&&it.label==='多媒體中心'&&S.mediaOk(G)) return S.media(GM);
    if(G.zone==='library_media'&&it.label==='多媒體服務台') return S.mediaDesk(GM);   /* AA_443 第 1 節：服務台、座位耳機各一句，再接看一部片 */
    if(G.zone==='library_media'&&it.zrDesk){ GM.sceneBegin(); try{ await GM.say(null,S.zrDeskLook(G)); } finally { GM.sceneEnd(); } return true; }   /* 多媒體中心有 3D 房間以後（rooms_glb3d.js 的 library_media：總圖 2F 的門變成「進入 多媒體中心」）：在裡面的服務台借耳機；門口那一條留著（沒有房間的版本）*/
    return false; };
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._closed2Interact){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; return o0.apply(this,arguments); }; STORY._closed2Interact=true; }
  /* 第 7 節：在系辦門口交過的，11/18 截止旁白不再說「你把表交到系辦」*/
  if(typeof STORY!=='undefined'&&typeof STORY.routeNarrLines==='function'&&!STORY._closed2Narr){ const n0=STORY.routeNarrLines; STORY.routeNarrLines=function(G){ const L=n0.apply(this,arguments); return G&&G.flags&&G.flags.EXCH_FORM_DESK!=null&&Array.isArray(L)?L.filter(t=>!/^（你把表交到系辦/.test(t)):L; }; STORY._closed2Narr=true; }

  /* ===================== 房間做好以後（LAWWW2 #82，87a4a60ca：rooms_glb3d.js 的 wancai_semb、linze_office、gongtong_3f；任務 ROOMS-AB3-PEOPLE-1024）=====================
     房間裡的人（配置檔的 spots；背景的人用路人／老師的底模，不說話、不能搭話）：
       - 宿舍洗衣間：阿凱大一週日 21～22 坐在長椅（spots.kai；characters.js 作息，這一個小時 203 的房間裡沒有他）；宿舍 205：方奕廷大一 21～23 坐在書桌前（spots.fang；作息，
         他不在的日子照 presence 不在＝門也不開），「敲門（205）」進去就看到他，找他說話照他平常的說話（階梯），沒有 205 專用的台詞。
       - 博雅 203（2026-05-27 18:30～21:30）：即興劇社社員兩位（spots.member，站著）、觀眾（spots.audience，坐著；畫質低／中只放一半／四分之三）。
       - 研討室 B 平常的初談隔間：柏翰在西邊隔間值班（characters.js 他的作息：大二起、法服值班的單週六 09:00～12:00，zone wancai_semb、spot duty——STORY.schedEnt 和人物線索一致，
         populateSchedule 照作息放、時間到照作息走）；同一段時間（STORY.fafuDuty）東邊隔間一位背景的初談志工（spots.volunteer）。2028-10-26（推甄面試的布置）09:00～12:00：口試委員三位（spots.panel）。
       - 系辦（辦公時間，Z3.roomGlbOpen）：系辦助理站在櫃台後面（spots.counter）。
       - 共同 3F 考場（考試那兩天 08:00～12:30）：監考老師（spots.proctor）、考生（spots.examinees；畫質低／中只放一半／四分之三）。
     事件搬進房間（台詞、選項一字不改，once 的紀錄照原本的事件 ID；畫面用模糊的 3D＝ADV 'blur'；房間不在（舊版、測試）、人在家、在國外＝照原本的 2D）：
       - 第 5 節　語彤阿姨 2027-05-22（y2b3d.js Y2B.auntConsult）：從萬才館大廳圓桌「坐到圓桌（做初談紀錄）」或人在研討室 B（自動開始）都在研討室 B 演——柏翰坐 spots.duty、阿姨 client、
                語彤 companion，祐廷（做紀錄）站在柏翰旁邊；散會（「萬才館門口」那一行字幕）以後的畫面照舊沒有換（2D 版也是同一張背景）。阿姨、語彤演完離開，柏翰照作息留著。
                推甄面試 2028-10-26（r2y4a_events.js ev_push_interview）：柏翰那兩句照舊在二樓走廊（人在研討室 B 也算到了：包住 R2Y4A.ivHere），「萬才館二樓」那一場換到研討室 B、坐考生的椅子，
                口試委員坐 spots.panel；演完站起來，人留在研討室 B。
                SQ02 法服初談（sideq3d.js ev_sq02_fafu，出遊）：OUT.STAGE 換到研討室 B 的東邊隔間（西邊是柏翰）：店員、祐廷坐來談的人的兩張椅子（西邊 client、companion 的鏡像），
                「值班的學長」＝東邊的志工；演完回到原本的地方（同 lab5f3d.js）。
       - 第 7 節　C10 學分採計（vac_activities.js 的 pre0、post，出遊 ev_vac_key）、延畢的證書（r2y4b3d.js R2Y4B.cert，辦公時間內）：換到系辦櫃台前（spots.player），助理站在櫃台後面；演完回到原本的地方。
                C10 的時間 AA 10-24 改到 14:00（9a033f397，避開系辦午休）。
       - 第 9 節　2029-02-03 筆試（ev_grad_exam）：門口那幾句照舊在教學館門口；「考場」那一場以前走上 3F（共同 301）、走到自己的位子（15 號）坐下，考試本身照舊黑底旁白；
                考完：和以安 FAMILIAR 以上（r2y4a3d.js 的 AN_FAM）＝帶回教學館門口（ev_grad_exam_after「考完，門口」）；其他＝在 3F 站起來，考生、監考離開。
                學姊 08:30 的便條（r3_3d.js R3.noteRun）：帶到共同教學館門口，學姊站在旁邊（3D），演完她離開（淡出）。
                2030-02-16 延畢版（R2Y4B.gradExam(GM,2030)）：換到 3F、走到位子坐下，黑底旁白，演完回到原本的地方。2031-02-15 照舊 2D（考場那天沒開）。
       - 第 10 節　SK07 唐睿的即興劇（events.js ev_sk07_improv，出遊；2026-05-27 19:00）：博雅 203（rooms_glb3d.js boya_203，LAWWW2 5fff78834；只有那一晚 18:30～21:30 開）——OUT.STAGE 換到 203：
                唐睿站在舞台中間（spots.tang）、品妤坐第一排正中間（pinyu）、阿哲（被你拉來的，zhe）、祐廷坐品妤旁邊（me）；社員兩位（member）、觀眾（audience，照畫質減少）；
                場景那一步的 classroom_small 換成 blur，演完回到原本的地方（人已經在 203＝不換區域，散場大家離開）。那一晚走進 203 也看得到社員、觀眾。K11 照舊在博雅 101（103 沒有做）。
       - 第 11 節　洗衣間（closed3d.js CLOSED.laundry，選項、40 分鐘、阿凱那一句、「衣服洗好了。」照舊）：洗衣服先走到洗衣機前（spots.wash）；阿凱那一句＝黑幕中他站到烘衣機前（kai_stand）、祐廷站在他旁邊（player）。
     系統字：沒有新的台詞、選項或按鈕字；房間名稱（PLACES.names，人物線索用）照配置檔的 name。測試：node tests/rooms_ab3_people_unit.js */
  const ZN=id=>typeof Z3!=='undefined'&&!!Z3.ZONES&&!!Z3.ZONES[id];
  const LAY=id=>(typeof ROOM_GLB_LAYOUTS!=='undefined'&&ROOM_GLB_LAYOUTS[id])||null;
  S.roomOk=id=>ZN(id)&&!!LAY(id);
  S.roomOpen=(id,G)=>!!G&&typeof Z3!=='undefined'&&!!Z3.roomGlbOpen&&!!Z3.roomGlbOpen(id,G);
  S.roomSet=(id,G)=>{ const L=LAY(id); if(!L||!L.sets) return null; return typeof Z3!=='undefined'&&Z3.roomGlbSet?Z3.roomGlbSet(id,G):L.set_default; };
  S.spots=(id,G)=>{ const L=LAY(id); if(!L) return {}; const k=S.roomSet(id,G); return (k&&L.sets[k]?L.sets[k].spots:L.spots)||{}; };
  S.seats=(id,G)=>{ const L=LAY(id); if(!L) return []; const k=S.roomSet(id,G); return (k&&L.sets[k]?L.sets[k].seats:L.seats)||[]; };
  if(typeof PLACES!=='undefined'&&PLACES.names) for(const k of ['wancai_semb','linze_office','gongtong_3f','dorm_laundry','dorm_205','library_media']) if(!PLACES.names[k]&&ZN(k)&&Z3.ZONES[k].name) PLACES.names[k]=Z3.ZONES[k].name;   /* 人物線索「萬才館 研討室 B（幫忙，到 12:00）」（柏翰的作息）*/
  const P_=p=>p?{x:p.x,z:p.z,yaw:p.yaw||0,lv:0}:null;
  S.away=G=>!G||!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))||!!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))||!!(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G))||!!(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G));
  /* 換到房間演、演完回到原本的地方（OUT.STAGE 那種；同 lab5f3d.js 的 canStage）*/
  S.canStage=function(GM,id){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||!GM.enter||!S.roomOk(id)||!ZN(G.zone)) return false; if(typeof OUT!=='undefined'&&OUT.fromHome) return false;
    if(S.away(G)) return false; if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  /* ---------- 背景的人 ---------- */
  const XS=i=>typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(i):null;
  const PS=(id,g)=>typeof STORY!=='undefined'&&STORY.profSpec?STORY.profSpec({id,gender:g,name:''}):XS(7);   /* 口試委員、監考老師：老師的底模（story3d.js profSpec，照 id 變化）*/
  S.extra=function(GM,id,spec,p,sit){ if(!GM||!GM.spawnNPC||!spec||!p) return null; if(GM.npc&&GM.npc[id]) return GM.npc[id];
    const o={yaw:p.yaw||0,greet:false}; if(sit) o.seat=P_(p); const n=GM.spawnNPC(id,Object.assign({},spec,{name:''}),p.x,p.z,o); if(n){ n.frozen=true; n.rab3=true; if(!sit) n.pose=n.idlePose='idle'; } return n; };   /* 沒有 talk＝不能搭話；greet:false＝不揮手 */
  S.drop=function(GM,pre){ if(!GM||!GM.npc) return 0; let k=0; for(const id of Object.keys(GM.npc)) if(id.indexOf(pre)===0){ if(GM.removeNPC) GM.removeNPC(id); else delete GM.npc[id]; k++; } return k; };
  S.seatChar=function(GM,id,p){ if(!p||!GM||!GM.spawnCharacter) return null; let n=GM.npc&&GM.npc[id]; if(n&&n.seat&&Math.hypot(n.seat.x-p.x,n.seat.z-p.z)<0.35) return n;   /* 作息已經讓他坐在那裡 */
    if(n&&GM.removeNPC) GM.removeNPC(id); n=GM.spawnCharacter(id,p.x,p.z,{seat:P_(p),pose:'sit'}); if(n){ n.frozen=true; n.rab3=true; } return n; };
  S.standChar=function(GM,id,p){ if(!p||!GM||!GM.spawnCharacter) return null; if(GM.npc&&GM.npc[id]&&GM.removeNPC) GM.removeNPC(id); const n=GM.spawnCharacter(id,p.x,p.z,{yaw:p.yaw||0,pose:'idle'}); if(n){ n.frozen=true; n.rab3=true; } return n; };
  S.moveChar=function(GM,id,p){ const n=GM&&GM.npc&&GM.npc[id]; if(!n) return S.standChar(GM,id,p); if(n.seat&&GM.standUp) GM.standUp(n);   /* 已經在場（作息放的）：站起來、換到那個位置（保留作息的記號，時間到照樣走）*/
    if(GM.E&&GM.E.placeAt) GM.E.placeAt(n,p.x,p.z,0); else { n.obj.position.x=p.x; n.obj.position.z=p.z; } n.obj.rotation.y=p.yaw||0; n.frozen=true; n.pose=n.idlePose='idle'; return n; };
  S.dropChars=function(GM,ids){ for(const id of ids){ const n=GM.npc&&GM.npc[id]; if(n&&n.rab3&&GM.removeNPC) GM.removeNPC(id); } };
  const sitMe=(GM,p)=>{ const P=GM.E&&GM.E.player; if(P&&p&&GM.sitAt) GM.sitAt(P,P_(p)); };
  const standMe=GM=>{ const P=GM.E&&GM.E.player; if(P&&P.seat&&GM.standUp) GM.standUp(P); };
  S.dutyNow=G=>!!G&&law(G)&&typeof STORY!=='undefined'&&!!STORY.fafuDuty&&!!STORY.fafuDuty(G)&&hr(G)>=9&&hr(G)<12;   /* 法服值班的單週六 09:00～12:00（柏翰的作息同一套週次）*/
  S.placePanel=function(GM){ const sp=S.spots('wancai_semb',GM.G); let k=0; (sp.panel||[]).forEach((p,i)=>{ if(S.extra(GM,'rab3_iv_panel'+i,PS('iv_panel'+i,i===1?'f':'m'),p,true)) k++; }); return k; };
  S.placeSemb=function(GM){ const G=GM.G, sp=S.spots('wancai_semb',G); if(S.roomSet('wancai_semb',G)==='interview') return hr(G)>=9&&hr(G)<12?S.placePanel(GM):0;
    return S.dutyNow(G)&&sp.volunteer&&S.extra(GM,'rab3_semb_vol',XS(84),sp.volunteer,true)?1:0; };
  S.placeClerk=function(GM){ const sp=S.spots('linze_office',GM.G), L=LAY('linze_office'), p=sp.counter||(L&&L.clerk); const n=p&&S.extra(GM,'rab3_office_clerk',XS(90),p,false); if(n) n.clerk=true; return n?1:0; };
  S.examPeople=G=>S.roomOpen('gongtong_3f',G)&&hr(G)>=8&&hr(G)<12.5;
  S.placeExam=function(GM){ const E=GM.E, sp=S.spots('gongtong_3f',GM.G); let k=0; if(sp.proctor&&S.extra(GM,'rab3_g3f_proctor',PS('g3f_proctor','m'),sp.proctor,true)) k++;
    const L=sp.examinees||[], q=E&&E.q&&E.q.level, n=Math.round(L.length*(q==='low'?0.5:(q==='medium'?0.75:1)));
    for(let i=0;i<n;i++) if(S.extra(GM,'rab3_g3f_exam'+i,XS(110+i),L[i],true)) k++; return k; };
  S.placeShow=function(GM){ const E=GM.E, sp=S.spots('boya_203',GM.G); let k=0; (sp.member||[]).forEach((p,i)=>{ if(S.extra(GM,'rab3_b203_member'+i,XS(130+i),p,false)) k++; });
    const A=sp.audience||[], q=E&&E.q&&E.q.level, n=Math.round(A.length*(q==='low'?0.5:(q==='medium'?0.75:1))); for(let i=0;i<n;i++) if(S.extra(GM,'rab3_b203_aud'+i,XS(140+i),A[i],true)) k++; return k; };
  S.kaiLaundry=G=>{ if(!G||typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined'||!CHARACTERS.kai) return false; let e=null; try{ e=STORY.schedEnt(CHARACTERS.kai,G); }catch(err){ e=null; } return !!e&&e.zone==='dorm_laundry'; };
  S.populate=function(zoneId,GM){ const G=GM&&GM.G; if(!G||!GM.E||!law(G)) return 0;
    if(zoneId==='dorm'){ if(S.roomOk('dorm_laundry')&&S.kaiLaundry(G)&&GM.npc&&GM.npc.kai&&GM.removeNPC){ GM.removeNPC('kai'); return -1; } return 0; }   /* 203：週日 21～22 阿凱在洗衣間（作息），房間裡沒有他（story3d.js 晚上照舊放他坐書桌）*/
    if(!S.roomOk(zoneId)) return 0;
    if(zoneId==='boya_203') return S.roomOpen(zoneId,G)?S.placeShow(GM):0;
    if(zoneId==='dorm_laundry'||zoneId==='dorm_205') return 0;   /* 阿凱（週日 21～22）、方奕廷（大一 21～23）：characters.js 的作息（spot kai／fang），populateSchedule 放 */
    if(zoneId==='wancai_semb') return S.placeSemb(GM);
    if(zoneId==='linze_office') return S.roomOpen(zoneId,G)?S.placeClerk(GM):0;
    if(zoneId==='gongtong_3f') return S.examPeople(G)?S.placeExam(GM):0;
    return 0; };
  if(typeof STORY!=='undefined'&&STORY.populate&&!STORY._rab3Pop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.populate(zoneId,GM); }catch(e){ console.warn('CLOSED2.populate',e); } return r; }; STORY._rab3Pop=true; }
  /* ---------- 劇情帶進房間 ---------- */
  S.staged=null;   /* {room, id}：這一段在房間裡演＝原本的 2D 背景換成模糊的 3D（OUT.bg）*/
  S.BG3D={wancai_semb:['wancai_seminar'],linze_office:['classroom_small'],boya_203:['classroom_small'],exam_door:['ntu_avenue']};
  if(typeof OUT!=='undefined'&&OUT.bg&&!OUT._rab3Bg){ const b0=OUT.bg; OUT.bg=function(id){ const st=S.staged; if(st&&(S.BG3D[st.room]||[]).includes(id)) return 'blur'; return b0.apply(this,arguments); }; OUT._rab3Bg=true; }
  const ENTER_O={noFade:true,deferStory:true,noAutosave:true};
  S.enterRoom=async function(GM,id,at){ const G=GM.G; if(G.zone===id) return true; if(!GM.enter) return false; if(GM.fade) await GM.fade(true); try{ await GM.enter(id,Object.assign({lv:0},at),ENTER_O); } finally { if(GM.fade) await GM.fade(false); } return G.zone===id; };   /* 不回原本的地方；已經在那裡就不換 */
  S.stageRoom=async function(GM,id,at){ const G=GM.G, P=GM.E.player, p=P.obj.position, prev={zone:G.zone,x:p.x,z:p.z,yaw:P.obj.rotation.y,lv:P.lv|0}, same=G.zone===id;   /* 演完回到原本的地方（淡入淡出由呼叫的人做）；人已經在那個房間＝不換區域 */
    standMe(GM); if(!same) await GM.enter(id,Object.assign({lv:0},at),ENTER_O); let done=false;
    return { same, restore:async()=>{ if(done) return; done=true; standMe(GM); if(!same) await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},ENTER_O); } }; };
  S.withStage=async function(GM,mk,f){ let st=null; if(GM.fade) await GM.fade(true); try{ st=await mk(); }catch(e){ console.warn('CLOSED2.stage',e); st=null; } finally { if(GM.fade) await GM.fade(false); }
    try{ return await f(st); } finally { if(st){ if(GM.fade) await GM.fade(true); try{ await st.restore(); } finally { if(GM.fade) await GM.fade(false); } } } };
  /* 第 5 節　語彤阿姨：祐廷做紀錄，站在柏翰（spots.duty）旁邊、看著來談的人 */
  S.recorder=sp=>{ if(!sp||!sp.duty||!sp.client) return null; const x=sp.duty.x+1.0, z=sp.duty.z+0.13; return {x,z,yaw:Math.atan2(sp.client.x-x,sp.client.z-z)}; };
  S.auntOk=GM=>{ const G=GM&&GM.G; return !!G&&S.roomOk('wancai_semb')&&S.roomSet('wancai_semb',G)!=='interview'&&!S.away(G)&&!!GM.enter; };
  S.auntStage=async function(GM){ const G=GM.G, sp=S.spots('wancai_semb',G), me=S.recorder(sp); if(!me) return false;
    GM.sceneBegin(); try{ if(G.zone!=='wancai_semb'){ if(!(await S.enterRoom(GM,'wancai_semb',me))) return false; } else { standMe(GM); if(GM.walkTo) await GM.walkTo(GM.E.player,me.x,me.z); }
      S.seatChar(GM,'classmate_bohan',sp.duty); S.seatChar(GM,'heroine_03',sp.companion); S.extra(GM,'rab3_aunt',XS(40),sp.client,true);   /* 阿姨：麵店工作台那位（story3d.js 店員 extraSpec(40)）的底模 */
      if(GM.face&&GM.E&&GM.E.player) GM.face(GM.E.player,sp.client.x,sp.client.z); S.staged={room:'wancai_semb',id:'aunt'}; return true; }
    finally { GM.sceneEnd(); } };
  S.auntEnd=function(GM){ if(S.staged&&S.staged.id==='aunt') S.staged=null; S.drop(GM,'rab3_aunt'); const yt=GM.npc&&GM.npc.heroine_03; if(yt&&yt.rab3&&GM.removeNPC) GM.removeNPC('heroine_03'); };   /* 散會：阿姨、語彤走了；柏翰照作息留著 */
  if(typeof Y2B!=='undefined'&&Y2B.auntConsult&&!Y2B._rab3){ const a0=Y2B.auntConsult; Y2B.auntConsult=async function(GM){ const G=GM&&GM.G; if(!G||!Y2B.auntDue||!Y2B.auntDue(G)||!S.auntOk(GM)) return a0.apply(this,arguments);
      let ok=false; try{ ok=await S.auntStage(GM); }catch(e){ console.warn('CLOSED2.auntStage',e); }
      try{ return await a0.apply(this,arguments); } finally { if(ok) S.auntEnd(GM); } }; Y2B._rab3=true; }
  /* 第 5 節　推甄面試：研討室 B 的考生椅子（配置 seats 裡同一個位置的走近點）*/
  S.candSeat=G=>{ const sp=S.spots('wancai_semb',G).candidate; if(!sp) return null; const s=S.seats('wancai_semb',G).find(q=>Math.hypot(q.x-sp.x,q.z-sp.z)<0.05); return Object.assign({},sp,{ap:(s&&s.ap)||[sp.x,sp.z-0.8]}); };
  S.ivOk=GM=>{ const G=GM&&GM.G; return !!G&&S.roomOk('wancai_semb')&&S.roomSet('wancai_semb',G)==='interview'&&!S.away(G)&&!!GM.enter; };
  S._iv=false;
  S.ivEnter=async function(GM){ S._iv=false; if(!S.ivOk(GM)) return; const G=GM.G, c=S.candSeat(G); if(!c) return;
    if(G.zone!=='wancai_semb'){ if(!(await S.enterRoom(GM,'wancai_semb',{x:c.ap[0],z:c.ap[1],yaw:c.yaw||0}))) return; } else standMe(GM);
    S.placePanel(GM); sitMe(GM,c); S.staged={room:'wancai_semb',id:'ev_push_interview'}; S._iv=true; };
  S.ivEnd=function(GM){ if(!S._iv) return; S._iv=false; standMe(GM); };
  if(typeof R2Y4A!=='undefined'&&R2Y4A.ivHere&&!R2Y4A._rab3){ const h0=R2Y4A.ivHere; R2Y4A.ivHere=function(GM){ return (!!GM&&!!GM.G&&GM.G.zone==='wancai_semb'&&S.roomOk('wancai_semb'))||h0.apply(this,arguments); }; R2Y4A._rab3=true; }   /* 人在研討室 B 也算到了（不會再被帶回二樓走廊）*/
  /* 第 9 節　筆試 */
  S.EX_DOOR={x:2,z:22.8}; S.EX_SPAWN={x:2,z:20.6,yaw:0};   /* r2y4a3d.js 的 EX_DOOR／EX_SPAWN（classes3d.js DOORS.common；從館裡出來的位置）*/
  S.mySeat=()=>{ const L=LAY('gongtong_3f'), me=L&&L.spots&&L.spots.me; if(!me) return null; const s=(L.seats||[]).find(q=>q.no===me.no); return Object.assign({},me,{ap:(s&&s.ap)||[me.x,me.z-0.9]}); };   /* 玩家的位子（座號 15）*/
  S.examSit=async function(GM){ const P=GM.E&&GM.E.player, s=S.mySeat(); if(!P||!s) return false; standMe(GM); if(GM.walkTo){ try{ await GM.walkTo(P,s.ap[0],s.ap[1]); }catch(e){ console.warn('CLOSED2.examSit',e); } } sitMe(GM,s); return true; };
  S.examDone=function(GM){ standMe(GM); S.drop(GM,'rab3_g3f_'); };
  S.exOk=GM=>{ const G=GM&&GM.G; return !!G&&S.roomOk('gongtong_3f')&&S.roomOpen('gongtong_3f',G)&&!S.away(G)&&!!GM.enter; };
  S.anFam=G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('heroine_01',G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_01'))>=SOCIAL.STAGES.indexOf('FAMILIAR');   /* r2y4a3d.js 的 AN_FAM（考完 ev_grad_exam_after）*/
  S._ex=false;
  S.examEnter=async function(GM){ S._ex=false; if(!S.exOk(GM)) return; const G=GM.G, L=LAY('gongtong_3f'), A=typeof ADV!=='undefined'?ADV:null;
    if(A&&A.active&&A.end) A.end();   /* 走上去、找位子這一段看 3D（不疊對話框）*/
    try{ if(G.zone!=='gongtong_3f'){ if(!(await S.enterRoom(GM,'gongtong_3f',Object.assign({},L.spawn)))) return; } await S.examSit(GM); S._ex=true; }
    finally { if(A&&A.begin&&!A.active) A.begin({background:'dark'}); } };   /* 考試本身照舊黑底（下一步「考場」的場景也是 dark）*/
  S.examEnd=async function(GM){ if(!S._ex) return; S._ex=false; S.examDone(GM);
    if(S.anFam(GM.G)&&GM.enter){ if(GM.fade) await GM.fade(true); try{ await GM.enter('campus',Object.assign({},S.EX_SPAWN),ENTER_O); } finally { if(GM.fade) await GM.fade(false); } } };   /* 以安「……考完，門口。」：12:30 在教學館門口演 */
  /* 事件裡插兩步（call）：那一場以前換到房間、最後收尾。台詞的步驟不動；房間不在＝兩步什麼都不做（照原本的 2D）*/
  S.EV3D={ ev_push_interview:{at:l=>!!l&&l.scene==='萬才館二樓',pre:GM=>S.ivEnter(GM),post:GM=>S.ivEnd(GM)},
    ev_grad_exam:{at:l=>!!l&&l.scene==='考場',pre:GM=>S.examEnter(GM),post:GM=>S.examEnd(GM)} };
  S.inject=function(ev){ const c=ev&&S.EV3D[ev.id]; if(!c||ev._rab3||!Array.isArray(ev.dialogue)) return ev; const i=ev.dialogue.findIndex(c.at); if(i<0) return ev;
    const L=ev.dialogue.slice(); L.splice(i,0,{call:(G,GM)=>c.pre(GM)}); L.push({call:(G,GM)=>c.post(GM)}); return Object.assign({},ev,{dialogue:L,_rab3:true}); };
  if(typeof EVENTS!=='undefined'&&EVENTS.run&&!EVENTS._rab3){ const r0=EVENTS.run; EVENTS.run=function(ev,o){ const e2=S.inject(ev); if(e2===ev) return r0.apply(this,arguments);
      return Promise.resolve(r0.call(this,e2,o)).finally(()=>{ if(S.staged&&S.staged.id===ev.id) S.staged=null; S._iv=false; S._ex=false; }); }; EVENTS._rab3=true; }
  /* 第 9 節　學姊 08:30 的便條：共同教學館門口（3D），學姊站在旁邊 */
  S.atExamDoor=GM=>{ const G=GM.G, p=GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position; return G.zone==='campus'&&!!p&&Math.hypot(p.x-S.EX_DOOR.x,p.z-S.EX_DOOR.z)<6; };
  S.noteOk=GM=>{ const G=GM&&GM.G; return !!G&&S.roomOk('gongtong_3f')&&ZN('campus')&&!S.away(G)&&!!GM.enter; };
  S.sisAtDoor=function(GM){ const E=GM.E, P=E&&E.player; if(!P||!GM.spawnCharacter) return null; for(const k of ['heroine_05','sis']) if(GM.npc&&GM.npc[k]&&GM.removeNPC) GM.removeNPC(k);
    const p=P.obj.position, y=P.obj.rotation.y||0, C=[[Math.sin(y)*1.1,Math.cos(y)*1.1],[Math.cos(y),-Math.sin(y)],[-Math.cos(y),Math.sin(y)],[-Math.sin(y)*1.1,-Math.cos(y)*1.1]];   /* 前面、右、左、後：站得住的第一個 */
    const c=C.find(d=>!E.canStand||E.canStand(p.x+d[0],p.z+d[1],0.3,P.lv|0))||C[0], x=p.x+c[0], z=p.z+c[1];
    const n=GM.spawnCharacter('heroine_05',x,z,{yaw:Math.atan2(p.x-x,p.z-z),pose:'idle'}); if(n){ n.frozen=true; n.rab3=true; } if(GM.face) GM.face(P,x,z); return n; };
  if(typeof R3!=='undefined'&&R3.noteRun&&!R3._rab3){ const n0=R3.noteRun; R3.noteRun=async function(GM){ if(!S.noteOk(GM)) return n0.apply(this,arguments);
      let sis=null; if(GM.fade) await GM.fade(true);
      try{ if(!S.atExamDoor(GM)) await GM.enter('campus',Object.assign({},S.EX_SPAWN),ENTER_O); sis=S.sisAtDoor(GM); S.staged={room:'exam_door',id:'ev_sis_exam_note'}; }catch(e){ console.warn('CLOSED2.note',e); }
      try{ return await n0.apply(this,arguments); }
      finally { if(S.staged&&S.staged.id==='ev_sis_exam_note') S.staged=null; if(sis&&GM.removeNPC){ if(GM.fade) await GM.fade(true); GM.removeNPC('heroine_05'); } if(GM.fade) await GM.fade(false); } }; R3._rab3=true; }   /* 演完她去對面（淡出）；接著 08:40 是以安在門口那一段（r2y4a3d.js）*/
  /* 第 7 節　系辦櫃台前（C10、證書）；第 5 節　SQ02 東邊隔間 */
  S.officeStage=async function(GM,tag){ const G=GM.G, sp=S.spots('linze_office',G), L=LAY('linze_office'), me=sp.player||L.spawn; const st=await S.stageRoom(GM,'linze_office',{x:me.x,z:me.z,yaw:me.yaw||0});
    S.placeClerk(GM); S.staged={room:'linze_office',id:tag}; return {restore:async()=>{ if(S.staged&&S.staged.id===tag) S.staged=null; await st.restore(); }}; };
  S.mirror=p=>p?{x:-p.x,z:p.z,yaw:p.yaw||0}:null;   /* 東邊隔間＝西邊的鏡像（配置的座位 (±2.18, 0.38)、(±1.42, 0.38)，志工 (±1.8, 1.62)）*/
  S.sq02Stage=async function(GM){ const G=GM.G, sp=S.spots('wancai_semb',G), me=S.mirror(sp.companion), cl=S.mirror(sp.client), L=LAY('wancai_semb'); if(!me||!cl||!sp.volunteer) return null;
    const st=await S.stageRoom(GM,'wancai_semb',Object.assign({},L.spawn)); S.extra(GM,'rab3_semb_vol',XS(84),sp.volunteer,true); S.extra(GM,'rab3_sq02_clerk',XS(88),cl,true); sitMe(GM,me);
    S.staged={room:'wancai_semb',id:'ev_sq02_fafu'}; return {restore:async()=>{ if(S.staged&&S.staged.id==='ev_sq02_fafu') S.staged=null; S.drop(GM,'rab3_sq02_'); await st.restore(); }}; };
  /* 第 10 節　SK07：博雅 203 */
  S.SHOW_CAST=['econ_tangrui','econ_pinyu','zhe'];
  S.b203Stage=async function(GM){ const G=GM.G, sp=S.spots('boya_203',G), L=LAY('boya_203'); if(!sp.me||!sp.tang||!sp.pinyu||!sp.zhe) return null;
    const st=await S.stageRoom(GM,'boya_203',Object.assign({},L.spawn)); S.placeShow(GM);
    S.standChar(GM,'econ_tangrui',sp.tang); S.seatChar(GM,'econ_pinyu',sp.pinyu); S.seatChar(GM,'zhe',sp.zhe); sitMe(GM,sp.me);
    S.staged={room:'boya_203',id:'ev_sk07_improv'};
    return {restore:async()=>{ if(S.staged&&S.staged.id==='ev_sk07_improv') S.staged=null; if(st.same){ S.dropChars(GM,S.SHOW_CAST); S.drop(GM,'rab3_b203_'); } await st.restore(); }}; };   /* 散場：人已經在 203 的，大家離開 */
  S.outStage=async function(GM,q,ev){ if(!q||!ev||!GM||!GM.G) return null;
    if(ev.id==='ev_sk07_improv'&&S.roomOpen('boya_203',GM.G)&&S.canStage(GM,'boya_203')) return S.b203Stage(GM);
    if(ev.id==='ev_sq02_fafu'&&S.roomSet('wancai_semb',GM.G)!=='interview'&&S.canStage(GM,'wancai_semb')) return S.sq02Stage(GM);
    const v=q.vac; if(ev.id==='ev_vac_key'&&v&&/^C10@/.test(String(v.key))&&(v.k==='pre0'||v.k==='post')&&S.canStage(GM,'linze_office')) return S.officeStage(GM,'c10');
    return null; };
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.STAGE)&&!OUT._rab3Stage){ OUT.STAGE.push(S.outStage); OUT._rab3Stage=true; }
  if(typeof R2Y4B!=='undefined'&&!R2Y4B._rab3){
    if(R2Y4B.cert){ const c0=R2Y4B.cert; R2Y4B.cert=function(GM){ const G=GM&&GM.G, me=this, a=arguments; if(!G||!S.roomOpen('linze_office',G)||!S.canStage(GM,'linze_office')) return c0.apply(me,a);   /* 辦公時間外（這一步排到 1/24）照舊 2D */
        return S.withStage(GM,()=>S.officeStage(GM,'cert'),()=>c0.apply(me,a)); }; }
    if(R2Y4B.gradExam){ const g0=R2Y4B.gradExam; R2Y4B.gradExam=function(GM,y){ const G=GM&&GM.G, me=this, a=arguments; if(!G||y!==2030||!S.roomOpen('gongtong_3f',G)||!S.canStage(GM,'gongtong_3f')) return g0.apply(me,a);
        return S.withStage(GM,async()=>{ const st=await S.stageRoom(GM,'gongtong_3f',Object.assign({},LAY('gongtong_3f').spawn)); S.placeExam(GM); return {restore:async()=>{ S.examDone(GM); await st.restore(); }}; },
          async st=>{ if(st){ await S.examSit(GM); if(typeof ADV!=='undefined'&&ADV.begin&&!ADV.active) ADV.begin({background:'dark'}); } return g0.apply(me,a); }); }; }   /* 考試本身照舊黑底旁白（R2Y4B 的 scene 收尾時關 ADV）*/
    R2Y4B._rab3=true; }
  /* 第 11 節　洗衣間（closed3d.js CLOSED.laundry 的 WASH）：洗衣服＝先走到第 2 台洗衣機前（spots.wash）；阿凱那一句（大一週日 21～22、第一次）＝黑幕中他站到烘衣機前（kai_stand）、祐廷在他旁邊（player）*/
  S.wash=async function(GM,ph,kai){ const G=GM&&GM.G, P=GM&&GM.E&&GM.E.player; if(!G||!P||G.zone!=='dorm_laundry'||!S.roomOk('dorm_laundry')) return false; const sp=S.spots('dorm_laundry',G);
    if(ph==='start'&&sp.wash){ GM.sceneBegin(); try{ standMe(GM); if(GM.walkTo) await GM.walkTo(P,sp.wash.x,sp.wash.z); P.obj.rotation.y=sp.wash.yaw||0; } finally { GM.sceneEnd(); } return true; }
    if(ph==='done'&&kai&&sp.kai_stand&&sp.player){ const n=S.moveChar(GM,'kai',sp.kai_stand); if(GM.E.placeAt) GM.E.placeAt(P,sp.player.x,sp.player.z,0); else { P.obj.position.x=sp.player.x; P.obj.position.z=sp.player.z; }
      if(GM.face) GM.face(P,sp.kai_stand.x,sp.kai_stand.z); else P.obj.rotation.y=sp.player.yaw||0; return !!n; }
    return false; };
  if(typeof CLOSED!=='undefined'&&Array.isArray(CLOSED.WASH)&&!CLOSED._rab3Wash){ CLOSED.WASH.push((GM,ph,kai)=>S.wash(GM,ph,kai)); CLOSED._rab3Wash=true; }
  /* 人在研討室 B、阿姨那天的值班時間（09:00 起，和大廳圓桌的按鈕一樣；12:00 以後 auntDue 就不成立）：自動開始（在大廳圓桌按「坐到圓桌」的照舊從 STORY.fafuShift 進來）*/
  let busy=false; S.pending=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['closed2_3d:busy']=()=>{ busy=false; S.staged=null; S._iv=false; S._ex=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!law(G)||G.zone!=='wancai_semb') return false;
    if(hr(G)>=9&&typeof Y2B!=='undefined'&&Y2B.auntDue&&Y2B.auntDue(G)&&S.auntOk(GM)){ busy=true; if(GM.sceneBegin) GM.sceneBegin(); S.pending=Promise.resolve().then(()=>Y2B.auntConsult(GM)).catch(e=>console.warn('CLOSED2.aunt',e)).finally(()=>{ busy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; }   /* 決定開演的那一刻就鎖住（STUCK-HARDEN-1027，同 invites3d.js S.autoStart）：延後開演的空檔裡，玩家按的「說話」、同一格的 EVENTS.tick 都進不來；演完放開再自動存檔 */
    return false; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)&&!STORY._rab3Tick){ STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); STORY._rab3Tick=true; }
  /* ===== 總圖 2F 多媒體中心（AA_443 第 1 節，企劃線 f93fa3eda；LAWWW2 a8c448288）=====
     服務台「看」：服務台一句 → 座位／耳機一句 → 看一部片（60 分，AA_399 第 12 節，S.media）。西牆中間那一格（spots.zhiruo）她不在的時候：三版。
     她在那裡、和她說話：每學期第一次在這裡講話前面多一段（有 ZR3_SUBTITLE＝兩個選項；沒有＝一句）。不記旗標、不加數值。 */
  S.MEDIA={ desk:'（多媒體服務台。登記簿最上面寫著：「耳機請於閉館前歸還」。值班的工讀生在看一部沒有開聲音的片子。）',
    seats:'（一格一格的座位，每一格一台螢幕、一副耳機。耳機線都纏得很整齊。）',
    zrKnow:'（西牆中間那一格。桌上留著一張印出來的字幕稿，每一行後面用鉛筆寫著一個數字。最大的是十四。）',
    zr:'（西牆中間那一格。桌上留著一張印出來的字幕稿，每一行後面用鉛筆寫著一個數字。）',
    zrUK:'（西牆中間那一格空著。螢幕上貼著一張便條：「座位請勿保留」。）',
    talkSub:'這一行十七個字。……要刪三個。你覺得刪哪三個？', optLast:'「最後三個。」', optKeep:'「不要刪。」',
    rLast:'最後三個是他的名字。……不行。', rKeep:'不刪的話，觀眾來不及看。……我再想。',
    talkNo:'字幕翻譯的作業。……要看的話坐旁邊那格，耳機去服務台借。' };
  const ZR='heroine_02', ymdOf=G=>{ const q=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day|0):null; return q?q.y*10000+q.m*100+q.d:0; };
  const zrSub=()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(ZR,'ZR3_SUBTITLE');
  S.zrUK=G=>{ const k=ymdOf(G); return k>=20270901&&k<=20280228; };
  S.zrDeskLook=G=>S.zrUK(G)?S.MEDIA.zrUK:(zrSub()?S.MEDIA.zrKnow:S.MEDIA.zr);
  S.mediaDesk=async function(GM){ const G=GM.G; GM.sceneBegin(); try{ await GM.say(null,S.MEDIA.desk); if(S.mediaOk(G)) await GM.say(null,S.MEDIA.seats); } finally { GM.sceneEnd(); } if(S.mediaOk(G)) return S.media(GM); return true; };
  S.zrDeskPopulate=function(zoneId,GM){ if(zoneId!=='library_media') return; const E=GM&&GM.E, L=typeof ROOM_GLB_LAYOUTS!=='undefined'&&ROOM_GLB_LAYOUTS.library_media; const p=L&&L.spots&&L.spots.zhiruo; if(!E||!Array.isArray(E.interactables)||!p) return;
    E.interactables.push({x:p.x+0.6,z:p.z,radius:0.8,lv:0,prio:-0.2,label:'看西牆中間那一格',zrDesk:true,get hidden(){ return !!(GM.npc&&GM.npc[ZR]); }}); };   /* 她在＝看不到這個（直接跟她說話）*/
  if(typeof STORY!=='undefined'&&STORY.populate&&!STORY._mediaPop){ const p1=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p1.apply(this,arguments); try{ S.zrDeskPopulate(zoneId,GM); }catch(e){ console.warn('CLOSED2.zrDesk',e); } return r; }; STORY._mediaPop=true; }
  S.zrMediaTalk=async function(GM,id){ const G=GM.G; if(id!==ZR||G.zone!=='library_media') return false; const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, key=T?T.id:'?';
    const F=G.flags||(G.flags={}); if(F.ZR_MEDIA_TALK===key) return false; F.ZR_MEDIA_TALK=key;   /* 每學期第一次（記在哪個學期講過，只是避免重複，不是劇情旗標）*/
    const me={name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(ZR):'芷若',charId:ZR}, X=S.MEDIA;
    if(zrSub()){ await GM.say(me,X.talkSub); const k=await GM.choose([{t:X.optLast},{t:X.optKeep}]); await GM.say(me,k===0?X.rLast:X.rKeep); } else await GM.say(me,X.talkNo);
    return true; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PRE_TALK)&&!STORY._mediaTalk){ STORY.PRE_TALK.push(async(GM,who,id)=>{ try{ await S.zrMediaTalk(GM,id); }catch(e){ console.warn('CLOSED2.zrMediaTalk',e); } }); STORY._mediaTalk=true; }
  return S;
})();
if(typeof window!=='undefined') window.CLOSED2=CLOSED2;
