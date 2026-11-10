/* ===== 新生運動廣場（xs_xsports）的按鈕、旁白、買東西（區域＝src/xsports3d.js 的 XP3，配置 src/data/xinsheng_sports_layout.js 是 LAWWW2 的）=====
   企劃：AA_699 第 2 節（企劃線 0e112816a，AA 定稿 D109：每個互動點的字）＋AA_620 第 2 節（企劃線 bf0efded8：新生運動廣場的價錢、二樓球衣牆那一句）。字一字照抄（S.L）；稿裡沒有的句子不寫。
   做法照大步／好拍（src/xsshop_sys3d.js：包住區域的 build 加按鈕、STORY.interact 接旁白、STORY.onSeat 接試穿；買東西＝同一套選單、錢不夠、時間 +0.15）。
   - 一樓：看看（球架）look、看看（球鞋牆）look_shoes＝旁白一句；買東西 cashier＝選單：籃球 900、排球 800、運動 T 恤 390、運動褲 590、護膝 450、水壺 350、球衣（一般款）890、不用了
       → 買了：扣錢、時間 +0.15 小時、旁白一句（AA_699 沒有店員輪流的話、沒有旗標：不記）；錢不夠＝「錢不夠」（選項變灰，按了不扣錢）。
     試穿椅「坐下試穿」（座位在 xsports3d.js，STORY.onSeat）＝旁白一句（這間的鞋不另外訂價：試穿只是旁白，不扣錢、不加時間）。
   - 二樓：看看（系隊球衣）jersey_wall＝旁白一句（AA_620 原句）；系服訂做 order＝店員一句，兩版：
       訂系服那段時間（AA_620 3-2：加入系籃＝CLUB_dept_basketball，大一上第 9 週週五～第 10 週）＝「法律系的？你們學長會整批送來，號碼跟他登記就好。」
       其他時候＝「系服要整隊一起訂，最少十件。你們系上誰負責？」＋旁白（型錄）。系服不在這裡個人訂（AA_620 3-2：學長收號碼、尺寸）——不扣錢、不記旗標。
       （AA_620 3-2 的學長收號碼、扣 650、第 14 週發球衣，遊戲裡還沒有；這裡只照日曆和系籃旗標判斷「那段時間」。）
     裁縫車前的圓凳：不開放（店員用的；xsports3d.js 已經是 npcOnly，沒有按鈕）。
   - 打烊＝PLACES.closedText（店門 story3d.js 照開放時間擋；人已經在店裡、過了打烊時間按按鈕＝寫開放時間，不演；打烊那一句在 src/xs_close3d.js）。
   存檔：不加東西。測試：node tests/xsports_act_unit.js */
'use strict';
const XPA=(function(){
  const S={}; const ZONE='xs_xsports';
  const CLERK={name:'店員'};
  const fmt=n=>Number(n).toLocaleString('en-US');
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  /* ---------- 台詞（AA_699 第 2 節、AA_620 第 2 節，一字照抄；「店員：」＝對話框的名字）---------- */
  S.L={
    look:'（籃球、排球、網球分三籠裝著。有人拿出一顆籃球拍了兩下，又放回去。）',   /* 一樓球架 */
    lookShoes:'（這面牆的鞋比大步少，大多是跑鞋和室內鞋。）',   /* 一樓球鞋牆 */
    tryOn:'（你坐下來試了一雙室內鞋。鞋底的膠還有一點新的味道。）',   /* 一樓長凳「坐下試穿」*/
    bought:'（店員把東西裝進一個大塑膠袋，袋子上印著店名。）',   /* 一樓收銀台：買了 */
    jersey:'（牆上掛了好幾件系隊球衣：電機、土木、經濟……法律系那件是深藍色的，背號 7。）',   /* 二樓球衣牆（AA_620 原句）*/
    orderPeriod:'法律系的？你們學長會整批送來，號碼跟他登記就好。',   /* 二樓訂做櫃台：訂系服那段時間 */
    orderOther:'系服要整隊一起訂，最少十件。你們系上誰負責？', orderOtherNarr:'（型錄攤在櫃台上，每一件都印著系名。）' };   /* 其他時候 */
  S.ITEMS=[{id:'basketball',name:'籃球',price:900},{id:'volleyball',name:'排球',price:800},{id:'tshirt',name:'運動 T 恤',price:390},{id:'shorts',name:'運動褲',price:590},
           {id:'kneepad',name:'護膝',price:450},{id:'bottle',name:'水壺',price:350},{id:'jersey',name:'球衣（一般款）',price:890}];
  S.BUY_H=0.15;   /* 買了的時間照同弦、大步的櫃台 */
  S.BTN={look:'look',look_shoes:'look',cashier:'shop',jersey_wall:'look',order:'order'};
  const LOOK={look:'look',look_shoes:'lookShoes',jersey_wall:'jersey'};
  /* ---------- 共用 ---------- */
  S.isOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(ZONE,hr(G),G.day);
  S.closedText=G=>typeof PLACES!=='undefined'&&PLACES.closedText?PLACES.closedText(ZONE,hr(G),G.day):'';
  const LAY=()=>typeof XINSHENG_SPORTS_LAYOUT!=='undefined'?XINSHENG_SPORTS_LAYOUT:null;
  /* 訂系服那段時間（AA_620 3-2）：加入系籃（第一次去社課＝CLUB_dept_basketball，AA_110 6-3）、大一上第 9 週週五～第 10 週週日 */
  S.orderPeriod=function(G){ if(!G||!G.flags||!G.flags.CLUB_dept_basketball||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day);
    if(!t||t.id!=='Y1S1') return false; if(t.week===10) return true; return t.week===9&&CALENDAR.dateOf(G.day).wd>=5; };
  /* ---------- 買東西 ---------- */
  S.menu=G=>S.ITEMS.map(it=>({t:it.name+'　'+fmt(it.price)+' 元',dim:(G.money|0)<it.price,id:it.id}));
  /* 資料層（測試直接用）：'poor'＝錢不夠（不扣錢）、true＝買了、false＝沒有這一樣 */
  S.buy=function(G,id,pay){ const it=S.ITEMS.find(q=>q.id===id); if(!it) return false; if((G.money|0)<it.price) return 'poor';
    if(pay) pay(-it.price); else G.money=(G.money|0)-it.price; return true; };
  S.shop=async function(GM){ const G=GM.G;
    const opts=S.menu(G), i=await GM.choose(opts.concat([{t:'不用了'}])), o=opts[i]; if(!o) return null;
    const res=S.buy(G,o.id,GM.money?d=>GM.money(d):null);
    if(res==='poor'){ if(GM.toast) GM.toast('錢不夠'); return 'poor'; } if(res!==true) return null;
    if(GM.advance) GM.advance(S.BUY_H);
    await GM.say(null,S.L.bought);
    if(GM.autosave) GM.autosave(); return o.id; };
  /* ---------- 系服訂做 ---------- */
  S.order=async function(GM){ const G=GM.G;
    if(S.orderPeriod(G)){ await GM.say(CLERK,S.L.orderPeriod); return 'period'; }
    await GM.say(CLERK,S.L.orderOther); await GM.say(null,S.L.orderOtherNarr); return 'other'; };
  /* ---------- 坐下（STORY.onSeat）：一樓試穿椅＝試穿的旁白 ---------- */
  S.isBench=function(seat){ const L=LAY(); if(!L||!seat||(seat.lv|0)!==0) return false; return (L.seats||[]).some(s=>s.kind==='bench'&&(s.lv|0)===0&&Math.hypot(s.x-seat.x,s.z-seat.z)<0.5); };
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G; if(!G||G.zone!==ZONE||!S.isOpen(G)||!S.isBench(seat)) return false;
    await GM.say(null,S.L.tryOn); return true; };
  /* ---------- 按鈕（區域建好的時候加；位置、樓層照 XP3.INTERACT＝配置的 interact）---------- */
  S.buttons=function(E){ if(!E||!Array.isArray(E.interactables)||typeof XP3==='undefined'||!XP3.INTERACT) return 0; let n=0;
    for(const q of XP3.INTERACT()){ const act=S.BTN[q.kind]; if(!act) continue; const it={x:q.x,z:q.z,lv:q.lv|0,radius:0.9,label:q.label,xpa:{act,kind:q.kind}};
      if(act==='look') it.xpa.text=S.L[LOOK[q.kind]];
      E.interactables.push(it); n++; }
    return n; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['xsports_sys3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.interact=async function(GM,it){ const G=GM.G, a=it.xpa; if(busy) return true;
    if(!S.isOpen(G)){ if(GM.caption) GM.caption('',S.closedText(G),3600); else if(GM.toast) GM.toast(S.closedText(G),3600); return true; }
    busy=true; GM.sceneBegin(); try{
      if(a.act==='look') await GM.say(null,a.text);
      else if(a.act==='shop') await S.shop(GM);
      else if(a.act==='order') await S.order(GM);
    } finally { busy=false; GM.sceneEnd(); } return true; };
  /* ---------- 接到遊戲 ---------- */
  { const ZB=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[ZONE];
    if(ZB&&!ZB._xpa){ ZB._xpa=true; const b0=ZB.build; ZB.build=function(E){ const z=b0.apply(this,arguments); try{ S.buttons(E); }catch(e){ console.warn('XPA.buttons',e); } return z; }; } }
  if(typeof STORY!=='undefined'&&!STORY._xpa){ STORY._xpa=true;
    if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.xpa&&GM&&GM.G){ await S.interact(GM,it); return true; } return oi.apply(this,arguments); }; }
    { const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&GM.G.zone===ZONE) await S.onSeat(GM,seat); }catch(e){ console.warn('XPA.onSeat',e); } return r; }; } }
  return S;
})();
