/* ===== 大口漢堡的按鈕與台詞（區域 xs_dakou＝src/dakou3d.js，配置 src/data/dakou_layout.js 是 LAWWW2／BB 的）=====
   企劃：AA_697（互動點的字，企劃線 54bf612c3，AA 定稿 D109）＋AA_621（菜單第 1 節、二樓讀書第 2 節、一個人深夜去第 3 節，企劃線 52e3d83a8）。字一字照抄（S.L）；稿裡沒有的句子不寫。
   做法照山嵐書店、木曜日、afar（src/shanlan_sys3d.js、mokuyobi_sys3d.js、gg2shops3d.js）：包住 DK3.zone.build 加按鈕、STORY.interact 接台詞。
   - 一樓（DK3.INTERACT 的 order／kiosk／pickup／tray；按鈕名照配置的 label）：
     點餐（櫃檯）＝店員「您好，內用還是外帶？」→ 菜單 → 點了：（店員把號碼單遞給你。）＋店員「好了會叫號。」
     自助點餐＝（螢幕上的漢堡…）→ 同一份菜單 → 點了：（機器吐出一張號碼單。）
     菜單（AA_621 第 1 節）：七樣固定價錢；05:00～10:30 多一項豬肉滿福堡 59。錢不夠＝選項變暗、按了「錢不夠」（和其他店一樣，不扣錢）；「不用了」＝什麼都不點（其他店的選單一樣有）。
     點了＝扣錢、時間 +9 分鐘（照兩點半 Café 的櫃台、afar）、吃過的登記到 src/eat3d.js（EAT.ordered，店名「新生南路・大口漢堡」）——AA_697「點了東西沒按『取餐』也照樣算吃到」：點的那一刻就算。
     取餐＝這一趟有點、還沒取：（櫃檯叫了你的號碼…）（取了就清掉）；沒點：（取餐區的螢幕上…）。回收餐盤＝那一句旁白。店員不另外說話（配置的 clerk 不放按鈕）；
     人站在配置的 clerk（櫃檯後面、面向客人；S.populate，營業時間內，SHOP-STAFF-1107）。
   - 二樓：插座、看書架＝那一句旁白（不加任何數值）。坐下讀書＝區域原本的 62 個座位（label「坐下讀書」、it.study：照兩點半的 studySession，D118 不另外加分）；
     配置 interact 的 study（長桌中間）就是這些座位，不另外放按鈕。AA_621 第 2 節：
     ① 讀完的旁白四句輪流（G.flags.DAKOU_NARR；game3d.js studySession 讀完問 STORY.studyNarr）；
     ② 天亮：這一段讀書跨過 05:00（讀到天亮）＝那一句代替四句輪流的那一句；
     ③ 第一次進去：考試那兩週（日曆的考試週 term.exam，和木曜日同一個判斷）、22:00～05:00、第一次走上二樓＝兩句旁白（只一次：G.flags.DAKOU_EXAM_FIRST＝那一天）；
     ④ 一個人深夜去（AA_621 第 3 節）：不是考試週、00:00～05:00、今天沒有約在這裡、走上二樓＝那一句（一趟一次）。
   - 營業 24 小時（places.js）：按鈕都不擋；PLACES.isOpen 關著的時候（以後改營業時間）點餐不出菜單。
   存檔：不加欄位（只用 G.flags 的兩個鍵，舊存檔沒有＝從頭開始；「這一趟有沒有點」不存）。
   測試：node tests/dakou_act_unit.js */
'use strict';
const DKS=(function(){
  const S={}, ZONE='xs_dakou';
  S.ZONE=ZONE;
  const CLERK={name:'店員'};
  /* ---------- 台詞（AA_697、AA_621，一字照抄）---------- */
  S.L={
    menu:[['雙層牛肉堡套餐',159],['勁辣雞腿堡套餐',149],['雞塊 6 塊',69],['薯條（大）',59],['可樂',35],['熱咖啡',45],['蘋果派',35]],   /* AA_621 第 1 節 */
    breakfast:['豬肉滿福堡',59], BF:[5,10.5],   /* 早餐（05:00～10:30）*/
    counterAsk:'您好，內用還是外帶？', counterDone:'（店員把號碼單遞給你。）', counterCall:'好了會叫號。',   /* AA_697 一樓：點餐（櫃檯）*/
    kiosk:'（螢幕上的漢堡一張比一張大。你按了兩次「返回」，才找到飲料在哪裡。）', kioskDone:'（機器吐出一張號碼單。）',   /* 自助點餐 */
    pickup:'（櫃檯叫了你的號碼。托盤上的薯條還在冒煙。）', pickupNone:'（取餐區的螢幕上，號碼一個一個往下跳。）',   /* 取餐：有點東西／沒點 */
    tray:'（你把紙杯和包裝紙丟進回收台，托盤疊到最上面。）',   /* 回收餐盤 */
    outlet:'（你把手機插上。旁邊那個人的筆電也插在同一排，螢幕上是一份還沒寫完的報告。）',   /* AA_697 二樓：插座 */
    books:'（書架上是幾本舊雜誌和一套沒排齊的漫畫。第三集不見了。）',   /* 看書架 */
    examFirst:['（二樓。每一桌都有人，桌上是課本、筆電、喝到一半的可樂。沒有人在講話，只有冰塊的聲音。）','（有一個人趴在桌上睡著了，手上還拿著螢光筆。）'],   /* AA_621 第 2 節：第一次進去 */
    narr:['（你點了一杯熱咖啡。四點的時候它已經冷了。）','（對面那桌的人整理好東西走了。下一個人五分鐘後就坐下來。）','（窗外新生南路的車越來越少。只剩公車和計程車。）','（天亮的時候，一樓開始賣早餐。煎蛋的味道飄上來。）'],   /* 讀書的旁白（四句輪流）*/
    dawn:'（樓下換了早餐的菜單。有人買了滿福堡，邊走邊吃去考試。）',   /* 天亮：05:00 以後 */
    lateAlone:'（二樓只有你和一個在打電腦的人。店員在拖地。）' };   /* AA_621 第 3 節：一個人深夜去 */
  S.NONE='不用了';   /* 什麼都不點（其他店的選單一樣的字）*/
  S.EAT_KEY='大口漢堡'; S.EAT_SHOP='新生南路・大口漢堡';
  S.HRS=0.15;   /* 點完的時間：照兩點半 Café 的櫃台、afar（稿上沒寫）*/
  S.DAWN=5; S.EXAM_FROM=22;   /* 第一次進去：22:00～05:00；一個人深夜去：00:00～05:00 */
  const hr=G=>((((+G.hour||0)%24)+24)%24);
  const isOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(ZONE,G.hour,G.day);
  S.isOpen=isOpen;
  /* ---------- 菜單：05:00～10:30 多一項早餐 ---------- */
  S.breakfastNow=G=>{ const h=hr(G); return h>=S.L.BF[0]-1e-6&&h<S.L.BF[1]-1e-6; };
  S.menu=G=>S.breakfastNow(G)?S.L.menu.concat([S.L.breakfast]):S.L.menu.slice();
  S.eatReg=function(){ if(typeof EAT==='undefined'||!EAT.addShop) return null; if(!(EAT.SHOPS_X&&EAT.SHOPS_X[S.EAT_KEY])) EAT.addShop(S.EAT_KEY,{shop:S.EAT_SHOP,staff:{who:'店員',line5:null,same:null,alt:null},first:null,door:false}); return EAT; };
  /* 這一趟（GM.enterN）點了、還沒取餐 */
  let pendingVisit=null;
  S.pending=GM=>pendingVisit!=null&&pendingVisit===(GM.enterN|0);
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['dakou:pending']=()=>{ pendingVisit=null; };   /* 讀檔：上一趟的單不算 */
  /* 點餐：kiosk＝自助點餐機；其他＝櫃檯 */
  S.order=async function(GM,kiosk){ const G=GM.G; if(!isOpen(G)) return null;
    if(kiosk) await GM.say(null,S.L.kiosk); else await GM.say(CLERK,S.L.counterAsk);
    const M=S.menu(G), opts=M.map(m=>({t:m[0]+'　'+m[1]+' 元',dim:(G.money|0)<m[1]})).concat([{t:S.NONE}]); const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,S.EAT_KEY):null; if(gO) opts.push(gO);   /* 買一份帶走送人（GIFT-ALL-DRINK-SHOPS-1112，src/gift3d.js GIFT.SHOPS）：放在最後，原本的選項位置不動 */ const i=await GM.choose(opts);
    if(gO&&i===M.length+1){ await GIFT.buy(GM,S.EAT_KEY); return null; }
    if(i==null||!(i>=0&&i<M.length)) return null; const [nm,p]=M[i];
    if((G.money|0)<p){ GM.toast('錢不夠'); return 'short'; }
    GM.money(-p); if(GM.advance) GM.advance(S.HRS);
    if(kiosk) await GM.say(null,S.L.kioskDone); else { await GM.say(null,S.L.counterDone); await GM.say(CLERK,S.L.counterCall); }
    pendingVisit=GM.enterN|0;
    const E_=S.eatReg(); if(E_&&E_.ordered){ try{ await E_.ordered(GM,S.EAT_KEY,nm); }catch(e){ console.warn('EAT.ordered',e); } }   /* 沒按取餐也算吃到 */
    if(GM.autosave) GM.autosave(); return nm; };
  S.pickup=async function(GM){ if(S.pending(GM)){ pendingVisit=null; await GM.say(null,S.L.pickup); return 'got'; } await GM.say(null,S.L.pickupNone); return 'none'; };
  S.LOOK={tray:'tray',outlet:'outlet',books:'books'};
  /* ---------- 按鈕：照 DK3.INTERACT（配置的 interact，去掉樓梯、店員）---------- */
  S.KINDS={order:1,kiosk:1,pickup:1,tray:1,outlet:1,books:1};
  S.buttons=function(E){ if(!E||!Array.isArray(E.interactables)||typeof DK3==='undefined'||!DK3.INTERACT) return 0; let n=0;
    for(const q of DK3.INTERACT()){ if(!S.KINDS[q.kind]) continue; E.interactables.push({x:q.x,z:q.z,lv:q.lv|0,radius:0.9,label:q.label,dakou:q.kind}); n++; }   /* study＝原本的座位（不另外放）*/
    return n; };
  /* ---------- 櫃檯後面的店員（SHOP-STAFF-1107：使用者 11-07 試玩「大口漢堡可以點餐但櫃檯沒店員」）----------
     原因：配置 floor1.interact 有 clerk（櫃檯後面、面向客人），DK3.INTERACT 照設計把它濾掉（店員不放按鈕），但沒有任何地方照那一點生出人——點餐時「店員」說話、櫃檯後面卻沒有人。
     照同弦、木曜日的老闆（guitar3d.js、mokuyobi_sys3d.js 的 S.populate）：換到這一區（STORY.populate）時、營業時間內（isOpen；現在 24 小時）站在配置的 clerk；路人底模、不說話、不放按鈕（話照舊是點餐那幾句）。*/
  S.CLERK_SPEC=95;   /* STORY.extraSpec：奇數＝男；91～94 是木曜日、日常失速、同弦、南洋戲院 */
  S.clerkAt=function(){ const L=typeof DAKOU_LAYOUT!=='undefined'?DAKOU_LAYOUT.shop:null, c=L&&L.floor1&&(L.floor1.interact||[]).find(q=>q.kind==='clerk'); return c?{x:c.x,z:c.z,yaw:c.yaw||0}:null; };
  S.populate=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.addNPC||G.zone!==ZONE||typeof CHAR==='undefined'||!CHAR.build||!isOpen(G)) return null; if((E.npcs||[]).some(n=>n&&n.dakouClerk)) return null;
    const at=S.clerkAt(); if(!at) return null; const sp=Object.assign({},typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(S.CLERK_SPEC):{}); sp.bag=null;   /* 站櫃檯不背包 */
    const o=CHAR.build(sp); if(!o) return null; o.position.set(at.x,0,at.z); o.rotation.y=at.yaw;
    return E.addNPC({obj:o,lv:0,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,dakouClerk:true}); };
  /* ---------- 讀書（AA_621 第 2 節）---------- */
  let lastStudy=null;
  S.markStudy=function(GM,hrs){ const G=GM&&GM.G; if(!G) return; lastStudy={zone:G.zone,day:G.day,to:+G.hour||0,from:(+G.hour||0)-(+hrs||1)}; };
  /* 這一段讀書跨過 05:00（from＜5＋24k≦to）*/
  S.crossDawn=ls=>{ if(!ls) return false; const k=Math.ceil((ls.from-S.DAWN)/24+1e-9); const t=S.DAWN+24*k; return t>ls.from+1e-9&&t<=ls.to+1e-9; };
  S.narr=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE) return null; const ls=lastStudy;
    if(ls&&ls.zone===ZONE&&S.crossDawn(ls)) return S.L.dawn;
    const F=G.flags||(G.flags={}), n=F.DAKOU_NARR|0; F.DAKOU_NARR=n+1; return S.L.narr[n%S.L.narr.length]; };
  /* ---------- 走上二樓：第一次進去（考試週深夜）、一個人深夜去 ---------- */
  S.examWeek=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return !!(t&&t.exam); };
  S.alone=G=>!(G.invites||[]).some(iv=>iv&&(iv.zone===ZONE||iv.place==='dakou')&&iv.day===G.day&&(iv.state==='going'||iv.state==='done'||iv.state==='accepted'));
  S.upstairs=function(GM){ const E=GM&&GM.E, P=E&&E.player; if(!P||(P.lv|0)!==1) return false; const L=typeof DAKOU_LAYOUT!=='undefined'?DAKOU_LAYOUT.shop:null, yU=L?L.levels[1].y:3.6;
    return !!(P.obj&&P.obj.position&&P.obj.position.y>yU-0.3); };
  let upVisit=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['dakou:busy']=()=>{ busy=false; };
  S.upLines=function(G){ const h=hr(G), F=G.flags||{};
    if(S.examWeek(G)){ if(F.DAKOU_EXAM_FIRST!=null) return null; if(h>=S.EXAM_FROM-1e-6||h<S.DAWN-1e-6) return 'exam'; return null; }
    if(h<S.DAWN-1e-6&&S.alone(G)) return 'alone'; return null; };
  S.up=async function(GM){ const G=GM.G; upVisit=GM.enterN|0; const k=S.upLines(G); if(!k) return null;
    GM.sceneBegin(); try{ if(k==='exam'){ (G.flags||(G.flags={})).DAKOU_EXAM_FIRST=G.day; for(const t of S.L.examFirst) await GM.say(null,t); } else await GM.say(null,S.L.lateAlone); } finally { GM.sceneEnd(); }
    return k; };
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE||busy||GM.titleIdle||upVisit===(GM.enterN|0)||!S.upstairs(GM)||!sceneFree(GM)) return false;
    const p=S.up(GM); busy=true; p.catch(e=>console.warn('DKS.tick',e)).finally(()=>{ busy=false; }); return true; };
  /* ---------- 接到遊戲 ---------- */
  const ZB=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[ZONE];
  if(ZB&&!ZB._dks){ ZB._dks=true; const b0=ZB.build; ZB.build=function(E){ const z=b0.apply(this,arguments); try{ S.buttons(E); }catch(e){ console.warn('DKS.buttons',e); } return z; }; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(!STORY._dks){ STORY._dks=true;
      if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId===ZONE) S.populate(GM); }catch(e){ console.warn('DKS.populate',e); } return r; }; }   /* 櫃檯後面的店員（SHOP-STAFF-1107）*/
      const ost=STORY.onStudy; STORY.onStudy=function(GM,hrs){ if(ost){ try{ ost.apply(this,arguments); }catch(e){ console.warn('STORY.onStudy',e); } } S.markStudy(GM,hrs); };
      const n0=STORY.studyNarr; STORY.studyNarr=GM=>S.narr(GM)||(typeof n0==='function'?n0(GM):null);
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.dakou&&G){ const k=it.dakou; GM.sceneBegin(); try{
            if(k==='order'||k==='kiosk') await S.order(GM,k==='kiosk'); else if(k==='pickup') await S.pickup(GM); else if(S.LOOK[k]) await GM.say(null,S.L[S.LOOK[k]]); }
          finally { GM.sceneEnd(); } return true; }
        return oi.apply(this,arguments); }; } } }
  return S;
})();
