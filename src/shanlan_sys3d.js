/* ===== 山嵐書店的按鈕與旁白（區域 xs_shanlan＝src/shanlan3d.js，配置 src/data/shanlan_layout.js 是 LAWWW2 的）=====
   企劃：AA_695（企劃線 88ed60310，AA 定稿 D109；取代 AA_613 第 3 節那幾句——AA_613 的原句都收進 AA_695）。字一字照抄（S.L）；稿裡沒有的句子不寫。
   做法照日常失速（src/offbeat_sys3d.js）、同弦（src/guitar3d.js）：包住 SH3.zone.build 加按鈕、STORY.interact 接旁白。
   - 互動點 7 個（SH3.INTERACT＝配置的 interact）：按鈕名照配置的 label，按了＝AA_695 第 1 節那一句旁白（照位置對）。
     結帳＝「買書還沒做」那一句（AA_613「沒有就先不做」；頁間書屋也沒有買書的流程可以接）。
   - 坐地板 10 處（SH3.FLOOR_SIT＝配置的 floorSit；按鈕名照配置：坐在書架中間看書／坐在法律區看書）：
     走過去 → 坐在地上（現有的跪坐姿勢：sitAt 的 floor＝茶屋坐墊那一套，character3d.js 的 SEIZA_VRM＋sitFloorFit；沒有另外做盤腿）→ 轉暗、時間過一小時（GM.advance(1)）→
     那一區的一句（AA_695 第 2 節；藝術區「窗外已經暗了」只在 17:00 以後坐下，白天換另一句）→ 起身。
     照 D118：不加讀書進度、不改任何數值（不碰 G.stats、G.legal、筆記）。
     打烊前不到一小時（這一小時坐不完）、已經打烊：坐地板的按鈕不出現（PLACES.isOpen 現在和一小時後都要開著）。
   - 坐靠窗長椅、閱讀桌「坐下看書」：照區域原本的座位（AA_695 第 3 節：不另外出旁白）。
   存檔：不加欄位（每區只有一句，不用記上一句）。
   測試：node tests/shanlan_act_unit.js */
'use strict';
const SHL=(function(){
  const S={}, ZONE='xs_shanlan';
  S.ZONE=ZONE;
  /* ---------- 台詞（AA_695，一字照抄）---------- */
  S.L={
    look:[   /* 第 1 節：照配置 interact 的位置對 */
      {lv:0,x:2.2,z:7.3,text:'（平台上擺著這個月的新書。有一本法律的，書腰寫「給第一次打官司的人」。）'},
      {lv:0,x:-2.15,z:4.6,text:'（這一座是翻譯小說。每一本旁邊都立著一張店員手寫的小卡。）'},
      {lv:0,x:6.2,z:-1.85,text:'（雜誌牆從地板排到天花板。最上面那一排，要踮腳才拿得到。）'},
      {lv:0,x:4.5,z:6.5,text:'（筆都可以試寫。試寫的那張紙已經寫滿了，大部分是名字。）'},
      {lv:0,x:3.85,z:2.4,text:'（店員在幫前面的人包書套。你手上沒有要買的。）'},
      {lv:1,x:5.3,z:-4.75,text:'（六法排了三種版本。考試用書那一櫃，最下面一層翻得最舊。）'},
      {lv:1,x:-3.25,z:-1.4,text:'（走道上坐了三個人，各看各的。沒有店員來趕人。）'}],
    sit:{   /* 第 2 節：照配置 floorSit 的 section */
      '文學':'（你坐在書架中間，看完半本小說。旁邊的人換了兩個。）',
      '藝術':'（你翻了一本攝影集。抬頭的時候窗外已經暗了。）',
      '法律':'（你在法律區翻了一本《民法總則》的新版，翻到一半，覺得還是圖書館的舊版好讀。）',
      '人文':'（你翻了一本寫城市的書，看到第三章，腳麻了。）',
      '一樓書架':'（一樓有人在結帳，有人在講電話。你還是看完了兩篇短篇。）'},
    sitArtDay:'（你翻了一本攝影集。抬頭的時候，對面那個人也在看同一本。）',   /* 藝術區白天（17:00 以前）坐下 */
  };
  S.DARK=17;   /* 「窗外已經暗了」：17:00 以後坐下 */
  S.lookText=function(q){ if(!q) return null; const m=S.L.look.find(o=>(o.lv|0)===(q.lv|0)&&Math.abs(o.x-q.x)<0.05&&Math.abs(o.z-q.z)<0.05); return m?m.text:null; };
  S.sitText=function(section,hour){ if(section==='藝術'&&!((((hour%24)+24)%24)>=S.DARK)) return S.L.sitArtDay; return S.L.sit[section]||null; };
  const isOpen=(h,d)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(ZONE,h,d);
  /* 坐地板要坐滿一小時：現在開著、一小時後也還開著 */
  S.sitOpen=G=>!!G&&isOpen(G.hour,G.day)&&isOpen(G.hour+1,G.day);
  /* ---------- 按鈕 ---------- */
  S.buttons=function(E){ if(!E||!Array.isArray(E.interactables)||typeof SH3==='undefined') return 0; let n=0;
    for(const q of (SH3.INTERACT?SH3.INTERACT():[])){ const t=S.lookText(q); if(!t) continue; E.interactables.push({x:q.x,z:q.z,lv:q.lv|0,radius:0.9,label:q.label,shlLook:t}); n++; }
    for(const q of (SH3.FLOOR_SIT?SH3.FLOOR_SIT():[])){ if(!S.L.sit[q.section]) continue;
      E.interactables.push({x:q.x,z:q.z,lv:q.lv|0,radius:0.9,label:q.label,shlSit:{x:q.x,z:q.z,yaw:q.yaw,lv:q.lv|0,section:q.section},get hidden(){ const G=typeof GAME!=='undefined'&&GAME.G; return !!G&&!S.sitOpen(G); }}); n++; }
    return n; };
  /* ---------- 坐地板看書 ---------- */
  S.floorSit=async function(GM,spot){ const G=GM.G, E=GM.E, P=E&&E.player; if(!G||!P||!spot) return null; if(!S.sitOpen(G)) return null;
    const seat={x:spot.x,z:spot.z,yaw:spot.yaw,lv:spot.lv|0,floor:0.02};   /* floor：坐在地上（跪坐那一套，坐墊高度幾乎 0）*/
    if(GM.walkTo){ const ap=GM.seatApproach?GM.seatApproach(seat):[spot.x+Math.sin(spot.yaw)*0.6,spot.z+Math.cos(spot.yaw)*0.6]; await GM.walkTo(P,ap[0],ap[1],{lv:seat.lv}); }
    if(GM.sitAt) GM.sitAt(P,seat);
    const line=S.sitText(spot.section,G.hour);   /* 坐下那一刻的時間決定藝術區那一句 */
    if(GM.fade) await GM.fade(true); if(GM.advance) GM.advance(1); if(GM.fade) await GM.fade(false);
    await GM.say(null,line);
    if(P.seat&&GM.standUp) GM.standUp(P);
    if(GM.autosave) GM.autosave(); return line; };
  /* ---------- 接到遊戲 ---------- */
  const ZB=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[ZONE];
  if(ZB&&!ZB._shl){ ZB._shl=true; const b0=ZB.build; ZB.build=function(E){ const z=b0.apply(this,arguments); try{ S.buttons(E); }catch(e){ console.warn('SHL.buttons',e); } return z; }; }
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._shl){ STORY._shl=true; const oi=STORY.interact;
    STORY.interact=async function(it,GM){ const G=GM&&GM.G;
      if(it&&it.shlLook&&G){ GM.sceneBegin(); try{ await GM.say(null,it.shlLook); } finally { GM.sceneEnd(); } return true; }
      if(it&&it.shlSit&&G){ if(!S.sitOpen(G)) return true; GM.sceneBegin(); try{ await S.floorSit(GM,it.shlSit); } finally { GM.sceneEnd(); } return true; }
      return oi.apply(this,arguments); }; }
  return S;
})();
