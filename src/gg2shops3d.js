/* ===== 公館第二批兩間店的遊戲系統與台詞：afar café（區域 afar，G07）、Daybreak（區域 daybreak，G14）=====
   GG-SHOPS2-1104（USER_WANTS X209；使用者 11-04 02:0x 對 AA「公館第二批四間改名＋進得去」）。場景 zones3d.js（ggRoom、SHOP_IN；配置 src/data/afar_layout.js、daybreak_layout.js 是 AA 的，LAWWW2 驗收 MODEL_READY）。
   台詞：AA_652（AA 定稿 D109，企劃線 303cded56＝4a98d57f6 同一份），一字照抄（S.L）；稿裡沒有的句子不寫。做法照木曜日、日常失速（src/mokuyobi_sys3d.js、offbeat_sys3d.js）。
   - 營業時間：afar 每天 11:00～21:00、Daybreak 每天 08:00～15:00（places.js；颱風天關）。關門時按店門：afar＝寫開放時間（PLACES.closedText）；
     Daybreak 15:00 以後＝「（Daybreak 的門上掛著「今日營業結束」的木牌。）」（AA_652 第 2 節），開門以前、颱風天＝寫開放時間。
   - 進門：一天第一次進來（一個人；今天約在這裡的不說），隨機一句（S.L.<店>.door；G.flags.GG2_DOOR＝{店: 那天}）。
   - 點餐（吧台的「點咖啡」「點餐」）：店員一句 → 選單（價錢照稿）→ 錢不夠＝店員那一句（不扣錢）；買了＝扣錢、隨機一句（只在點手沖／法式吐司時說的那一句只在那時候放進去）。
     afar：時間 +9 分鐘（照兩點半 Café 的櫃台）；Daybreak：坐到最近的空位（和半熟一樣）、吃 40 分鐘、吃完的旁白隨機一句。吃過的登記到 src/eat3d.js（店名「公館・afar café」「公館・Daybreak」）。
   - 看甜點櫃、看看書架（afar）、看菜單：隨機一句、同一句不連續出。
   - 坐下（STORY.onSeat）：照位子的類型說那一句（afar：窗邊長桌／中間方桌／靠牆小桌／卡座；Daybreak：窗邊兩人桌／中間四人桌／長桌／卡座）。
     卡座小桌對面的椅子（afar 小圓桌、Daybreak 卡座小桌的「坐下」）稿上沒有句子：不說。
   - 打烊（afar 21:00、Daybreak 15:00）人還在店裡：這一趟進來時開著、或那一刻（關門後半小時內）＝店員「我們今天要打烊了。」（AA_700，XSCLOSE.say；不另外出旁白），回公館店門口；其他（颱風、讀檔回到關門以後）＝回店門口、寫開放時間。
   - 約去：src/data/invites.js 的地點 afar（喝咖啡）、daybreak（吃飯，08:00～14:00 開始、14:00 以後的旁白）；答應的一句七位在 invites.js，其他人＝一般那句（S.ACC0，包 INV.personal）；
     兩個人坐下以後的開場句＝invites.js 的 seatOpen.afar／daybreak。
   - 店員站在吧台後面（story3d.js populate，zones3d.js SHOP_IN.clerk）；路人照 crowd3d.js（afar＝咖啡、Daybreak＝早午餐）。
   測試：node tests/gg_shops2_1104_unit.js */
'use strict';
const GG2=(function(){
  const S={};
  S.ZONES=['afar','daybreak'];
  const CLERK={name:'店員'};
  /* ---------- 台詞（AA_652，一字照抄；說話的人寫「店員」，引號「」拿掉＝對話框）---------- */
  S.L={
    afar:{
      door:['（門上的小鈴響了一下。咖啡的味道比外面的騎樓還濃。）','（窗邊長桌坐了一排打筆電的人，每個人面前都有一盞小燈。）','（吧台後面的店員抬頭說了一聲「歡迎光臨」，又低頭繼續磨豆子。）'],
      ask:'內用還是外帶？',
      menu:[['濃縮咖啡',100],['美式',110],['拿鐵',140],['卡布奇諾',140],['摩卡',160],['手沖',170],['起司蛋糕',120],['布丁',90]],
      after:[['店員','好了叫你。……可以先找位子。'],['店員','手沖要等五分鐘喔。','手沖'],[null,'（店員在杯子上寫了一個字，看不出是你的名字還是飲料的名字。）']],   /* 第三格＝只有點那一樣才說 */
      short:'……要不要看一下比較便宜的？美式一百一。',
      look:{pastry:['（玻璃櫃裡三層甜點。最上面一層的起司蛋糕只剩兩塊。）','（櫃子裡的燈很亮，布丁看起來比實際上大一點。）'],
        bookshelf:['（書架上面是旅行的書，下面一層斜放著幾本雜誌。有一本的封面是一座你不知道名字的山。）','（書架上夾著一張手寫的小卡：「歡迎借閱，請放回原位。」）','（有人把一本《民法總則》放在旅行書中間。不知道是忘了帶走，還是故意的。）'],
        menu:['（黑板上寫著 afar COFFEE MENU。手沖那一行旁邊畫了一片小葉子。）']},
      seat:{window:'（你在窗邊坐下，把桌上的小燈打開。外面騎樓有人牽著腳踏車經過。）',middle:'（你在方桌坐下。隔壁桌有人戴著耳機在寫報告。）',wall:'（靠牆的位子很安靜。牆上那幅畫是一座霧裡的山。）',booth:'（吧台後面那一塊比較暗，卡座很軟。坐下就不太想起來。）'} },   /* 打烊的字（AA_652 的 close）作廢，照 AA_700 一句：XSCLOSE */
    daybreak:{
      door:['（一進門就是烤吐司和咖啡的味道。窗外的陽光照到第一排桌子。）','（店員：「早安！幾位？」……「一位的話，窗邊可以嗎？」）','（牆上那個太陽畫得很大。旁邊的卡座已經坐了兩桌。）'],
      ask:'內用的話，點好我們送過去。',
      menu:[['日式早餐盤',220],['厚蛋三明治',160],['法式吐司',180],['拿鐵',120]],
      after:[['店員','大概十五分鐘。……飲料先上。'],['店員','今天的法式吐司是最後兩份喔。','法式吐司']],
      eat:['（蛋捲切開，裡面是軟的。你吃得比想的快。）','（你把最後一片吐司沾了盤子上的蜂蜜。）'],
      short:'……要不要先點一杯拿鐵？',
      look:{pastry:['（玻璃櫃裡的麵包排得很整齊。可頌旁邊的牌子寫著「今天出爐」。）','（最下面一層的肉桂捲只剩一個。）'],
        menu:['（黑板上寫著 Brunch、Plates、Sandwiches……每一行後面都畫了一條線，沒有寫價錢。價錢在吧台的小菜單上。）']},
      seat:{window:'（窗邊的陽光很亮。桌上的小花瓶插了幾枝滿天星。）',middle:'（四人桌的椅子有一張是綠色坐墊。你坐了那一張。）',long:'（最裡面那張長桌，牆上的層板放滿了罐子和小盆栽。）',booth:'（你在卡座坐下，旁邊的黃色抱枕很軟。牆上的 Daybreak 字就在你頭上。）'},
      sign:'（Daybreak 的門上掛著「今日營業結束」的木牌。）', typhoon:'（Daybreak 的遮雨棚收起來了。門上貼著：「颱風天暫停營業」。）' } };
  /* AA_652（企劃線 89b4367ca）補的門口句：afar 打烊以後、afar 與 Daybreak 颱風假當天 */
  S.L.afar.sign='（afar 的玻璃門後面，椅子都倒扣在桌上了。門上掛著小木牌：「本日營業結束 11:00～21:00」。）'; S.L.afar.typhoon='（afar 的門上貼著一張手寫的紙：「颱風天休息，大家注意安全。」）';
  S.EAT_KEY={afar:'afar café',daybreak:'Daybreak'};
  S.HRS={afar:0.15,daybreak:40/60};   /* afar 點完的時間照兩點半 Café 的櫃台（稿上沒寫）；Daybreak「時間過 40 分鐘（吃飯）」 */
  /* 約去答應的「一般」那一句（沒有自己句子的人）*/
  S.ACC0={afar:'「好啊。那間的手沖很好喝。」',daybreak:'「好啊。早上嗎？我爬得起來。」'};

  /* ---------- 共用 ---------- */
  S.rand=()=>Math.random();
  const LAY=k=>k==='afar'?(typeof AFAR_LAYOUT!=='undefined'?AFAR_LAYOUT:null):(k==='daybreak'?(typeof DAYBREAK_LAYOUT!=='undefined'?DAYBREAK_LAYOUT:null):null);
  const hr=G=>((((+G.hour||0)%24)+24)%24);
  S.isOpen=(k,G)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(k,G.hour,G.day);
  const typhoon=(k,G)=>typeof PLACES!=='undefined'&&!!PLACES.typhoonClosed&&PLACES.typhoonClosed(k,G.day);
  const pickOne=(arr,prev)=>{ const pool=arr.map((t,i)=>i).filter(i=>arr.length<2||i!==prev); return pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; };
  const lastLook={};
  S.look=function(k,kind){ const L=S.L[k]&&S.L[k].look[kind]; if(!L||!L.length) return null; const key=k+':'+kind, i=pickOne(L,lastLook[key]); lastLook[key]=i; return L[i]; };
  const sayAll=async(GM,L)=>{ for(const [w,t] of L) await GM.say(w?CLERK:null,t); };
  /* 打烊的那一句（AA_700：店員「我們今天要打烊了。」，不另外出旁白；src/xs_close3d.js 的 XSCLOSE）*/
  const closeSay=GM=>typeof XSCLOSE!=='undefined'&&XSCLOSE.say?XSCLOSE.say(GM,'店員'):GM.say(CLERK,'我們今天要打烊了。');
  const closeGen=(GM,k,g)=>typeof XSCLOSE!=='undefined'&&XSCLOSE.gen?XSCLOSE.gen(GM,k,g):!!g;
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  /* 今天這一趟是不是一個人：今天在這間店有約（一起走過來、約好的時間到了、剛見過）＝不是 */
  S.alone=function(G,k){ const h=hr(G); return !(G.invites||[]).some(iv=>iv&&iv.place===k&&iv.day===G.day&&(iv.state==='going'||iv.state==='done'||(iv.state==='accepted'&&h>=iv.h-0.5&&h<iv.h+0.75))); };
  S.eatReg=function(){ if(typeof EAT==='undefined'||!EAT.addShop) return null; for(const k of S.ZONES){ const key=S.EAT_KEY[k]; if(!(EAT.SHOPS_X&&EAT.SHOPS_X[key])) EAT.addShop(key,{shop:'公館・'+key,staff:{who:'店員',line5:null,same:null,alt:null},first:null,door:false}); } return EAT; };

  /* ---------- 坐下：位子的類型（照配置的桌子；卡座＝座面 0.45 的那一排）---------- */
  S.seatKind=function(k,seat){ const L=LAY(k); if(!L||!seat) return null; let s=null, bd=0.3; for(const q of L.seats){ const d=Math.hypot(q.x-seat.x,q.z-seat.z); if(d<bd){ bd=d; s=q; } } if(!s) return null;
    if(s.seatH===0.45) return 'booth';
    if(k==='afar') return s.table===6?'window':([1,2,3].includes(s.table)?'middle':(s.table>=7&&s.table<=10?'wall':null));   /* 卡座小圓桌（4、5）對面的椅子：稿上沒有 */
    return [1,2,3].includes(s.table)?'window':([4,5].includes(s.table)?'middle':(s.table===6?'long':null)); };   /* Daybreak 卡座小桌（7、8）對面的椅子：稿上沒有 */
  S.seatLine=(k,seat)=>{ const t=S.seatKind(k,seat); return t?S.L[k].seat[t]:null; };
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G; if(!G||!S.ZONES.includes(G.zone)) return false; const t=S.seatLine(G.zone,seat); if(!t) return false; await GM.say(null,t); return true; };

  /* ---------- 點餐 ---------- */
  S.order=async function(GM,k){ const G=GM.G, D=S.L[k]; if(!D) return null; await GM.say(CLERK,D.ask);
    const opts=D.menu.map(m=>({t:m[0]+'　'+m[1]+' 元',dim:(G.money|0)<m[1]})).concat([{t:'不用了'}]); const i=await GM.choose(opts);
    if(i==null||!(i>=0&&i<D.menu.length)) return null; const [nm,p]=D.menu[i];
    if((G.money|0)<p){ await GM.say(CLERK,D.short); return 'short'; }   /* 錢不夠：店員的那一句（AA_652），不扣錢 */
    GM.money(-p); const pool=D.after.filter(a=>!a[2]||a[2]===nm), a=pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; await GM.say(a[0]?CLERK:null,a[1]);
    const E_=S.eatReg(), reg=async()=>{ if(E_&&E_.ordered){ try{ await E_.ordered(GM,S.EAT_KEY[k],nm); }catch(e){ console.warn('EAT.ordered',e); } } };
    if(k==='daybreak'){ const run=async()=>{ GM.advance(S.HRS.daybreak); await reg(); await GM.say(null,D.eat[Math.min(D.eat.length-1,Math.floor(S.rand()*D.eat.length))]); };
      if(typeof WZS!=='undefined'&&WZS._seated) await WZS._seated(GM,run); else await run(); }   /* 送到位子上：坐到最近的空位吃（和半熟一樣）*/
    else { GM.advance(S.HRS.afar); await reg(); }
    if(GM.autosave) GM.autosave(); return nm; };

  /* ---------- 店門：關門 ---------- */
  S.door=async function(GM,k){ const G=GM.G, h=hr(G), T=S.L[k]||{};
    const line=typhoon(k,G)?T.typhoon:((k==='daybreak'&&h>=15-1e-6)||(k==='afar'&&(h>=21-1e-6||h<6)))?T.sign:null;   /* 颱風假＝颱風那一句；打烊以後（Daybreak 15:00 起、afar 21:00 起到清晨）＝木牌那一句；開門以前＝寫開放時間 */
    if(line){ GM.sceneBegin(); try{ await GM.say(null,line); } finally { GM.sceneEnd(); } return typhoon(k,G)?'typhoon':'sign'; }
    if(typeof PLACES!=='undefined'&&PLACES.closedText) GM.toast(PLACES.closedText(k,G.hour,G.day),4500); return 'closed'; };

  /* ---------- 進門（一天第一次、一個人）---------- */
  let doorVisit=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['gg2shops3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.doorDue=function(GM){ const G=GM.G; if(!G||!S.ZONES.includes(G.zone)||doorVisit===(GM.enterN|0)||!S.isOpen(G.zone,G)) return false; const F=G.flags||(G.flags={}), r=F.GG2_DOOR;
    return !(r&&typeof r==='object'&&r[G.zone]===G.day); };
  S.enterLine=async function(GM){ const G=GM.G, k=G.zone, F=G.flags||(G.flags={}); doorVisit=GM.enterN|0;
    if(!F.GG2_DOOR||typeof F.GG2_DOOR!=='object'||Array.isArray(F.GG2_DOOR)) F.GG2_DOOR={};
    if(!S.alone(G,k)) return 'together';   /* 今天約在這裡：不說（進門句是一個人的）*/
    F.GG2_DOOR[k]=G.day; const L=S.L[k].door; GM.sceneBegin(); try{ await GM.say(null,L[Math.min(L.length-1,Math.floor(S.rand()*L.length))]); } finally { GM.sceneEnd(); } return 'door'; };

  /* ---------- 打烊：人還在店裡＝出來 ---------- */
  S.closingNow=function(k,G){ if(typhoon(k,G)) return false; const ws=typeof PLACES!=='undefined'&&PLACES.windowsOf?PLACES.windowsOf(k,G.day):null; if(!ws||!ws.length) return false;
    const c=ws[ws.length-1][1], h=hr(G); return h>=c-1e-6&&h<c+0.5; };
  S.closeOut=async function(GM){ const G=GM.G, k=G.zone, P=GM.E&&GM.E.player, gen=closeGen(GM,k,S.closingNow(k,G)), h=G.hour, d=G.day;
    GM.sceneBegin(); try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); if(gen) await closeSay(GM); } finally { GM.sceneEnd(); }
    const SI=typeof Z3!=='undefined'&&Z3.SHOP_IN&&Z3.SHOP_IN[k]; await GM.enter('gongguan',SI&&SI.out?Object.assign({},SI.out):{x:0,z:-30,yaw:Math.PI});
    if(!gen&&typeof PLACES!=='undefined'&&PLACES.closedText) GM.toast(PLACES.closedText(k,h,d),5000);
    return gen?'close':'out'; };

  /* ---------- 每 0.5 秒（STORY.TICKS）：打烊優先，再來進門 ---------- */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!S.ZONES.includes(G.zone)||busy||GM.titleIdle||!sceneFree(GM)) return false;
    let p=null; if(!S.isOpen(G.zone,G)) p=S.closeOut(GM); else if(S.doorDue(GM)) p=S.enterLine(GM); if(!p) return false;
    busy=true; p.catch(e=>console.warn('GG2.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 互動（zones3d.js 的 gg2 按鈕）---------- */
  S.interact=async function(GM,it){ const G=GM.G, k=it.gg2, kind=it.kind;
    GM.sceneBegin(); try{ if(kind==='order') await S.order(GM,k); else { const t=S.look(k,kind); if(t) await GM.say(null,t); } } finally { GM.sceneEnd(); } return true; };

  /* ---------- 接到遊戲 ---------- */
  if(typeof INV!=='undefined'&&INV.personal&&!INV._gg2){ INV._gg2=true; const p0=INV.personal; INV.personal=function(G,id,P,day,h,r){ const out=p0.apply(this,arguments);
      if(P&&S.ACC0[P.id]&&out&&out.res==='accept'&&!(Array.isArray(out.lines)&&out.lines.length)) return Object.assign({},out,{lines:[S.ACC0[P.id]]}); return out; }; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(!STORY._gg2){ STORY._gg2=true;
      const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&S.ZONES.includes(GM.G.zone)) await S.onSeat(GM,seat); }catch(e){ console.warn('GG2.onSeat',e); } return r; };
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.gg2&&G){ await S.interact(GM,it); return true; }
        if(it&&it.exit&&G&&S.ZONES.includes(it.exit.to)&&!S.isOpen(it.exit.to,G)){ await S.door(GM,it.exit.to); return true; }   /* 關門：寫開放時間（Daybreak 15:00 以後＝木牌）*/
        return oi.apply(this,arguments); }; } } }
  return S;
})();
