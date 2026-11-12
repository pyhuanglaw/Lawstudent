/* 和平東路二段 118 巷（D46；AA_280 @02ed9b0a；使用者 2026-10-18 02:2x 放進 v9.10）：店門口點餐、常客、阿哲週一揪午餐。
   區域（導航、立面、店門互動點、後門）在 zones3d.js 的 buildLane118；店家資料 src/data/lane118_shops.js（tools/lane118/import_lane118.py 從白名單上的 AA_280 產生）。
   - 點餐：沒開＝「（鐵門拉下來一半……）」；一個人＝店員招呼 → 點菜（「（你點了{品名}。）」）→ 吃完的旁白；
     那間店門口有常客（見過面的）＝一起吃：招呼換資料裡的 groupGreet（src/data/lane118_shops.js，現在是「幾位？……那邊那張可以坐。」）、吃完換那個人的一句（照 AA_280 第 3 節）。扣錢；吃飯約 40 分鐘、飲料 5 分鐘。
   - 常客：平日中午照 AA_280 第 3 節站在他那間店門口（寒暑假、第 16 週不出現；人在國外、老家、消失期照 STORY.presence）。
   - 阿哲週一 12:00 揪人（AA_280 第 4 節）：第一次 Y1S1 第 2 週；之後每學期第 2～15 週每週一，店照 noodle2 → dian → korea → self 輪（AA_480 第 4 節：AA_280 的 home 那一週改好家，S.LUNCH_FIX；AA_311 H4 選過的那一間排第一：S.rotation）；
     「走。」＝12:15 在那間店門口（出遊 goto，阿哲、Alison 在那裡等）；「今天不行。」＝阿哲「好喔 下次」。不在桌遊團群組、和阿哲 FAMILIAR 以上＝私訊（只有阿哲的句子）。
   - AA_311（118 巷每間店的故事，企劃線 580ed6302；第 5 節的改法優先：改名 Alison（使用者 10-21）、以安不說「理由：」、大四下考試週第 15 週、沛珊交往中照演）：
     H1 一一八茶飲 × 學姊（S.h1Due／S.playH1，記 SIS_TEA_ORDER）；第 2 節熟客三段招呼＋考試週（S.stage，一個人來）；第 1 節店員的稱呼（S.STAFF）；
     H2～H9（S.H2…S.H9：和人一起來的招呼 S.withScene＝H3／H5／H7／H9，吃完的 H4／H6／H7，店員多說的 H2／H8；H4 記 ZHE_118_RANK，阿哲揪午餐的輪流照它排）。H2b 作廢（AA_334 第 2 節），不做。
     存檔 G.l118＝{n:{店:來了幾次（點了東西才算、一天最多一次）}, d:{店:上次算的那天}, last:{店:上次點的}, w:{'人@店':{n,d0,d}}（一起吃的次數）, once:{H2…H9:哪一天}, rankAt}；舊存檔沒有＝從空的開始。
   - AA_480（企劃線 be47f6341，回實作後的六題）：「老樣子」上次點別的＝不帶菜名那一句（usual2）；118 巷九間和 AA_329 第 3 節合併（EAT.choose 的選項：不說第 5 次那一句、
     店員主動問過就不加選單的「老樣子」、回答的說話人照 S.STAFF）；H7 兩個選項留到選了為止；阿哲輪流 home 改 self（S.LUNCH_FIX）；H9 的路＝交往中約她「去義大麵屋吃午餐」（S.INVITE）。
   - 順手的事（AA_397，src/sideq3d.js）：點完餐最後叫 SIDEQ.atShop（慢讀咖啡、六張犁麵舖、好家自助餐、蛋包飯研究所；第二、三批 AA_404／405：滇香小館、巷口家常菜、Pasta 118、韓食小廚、一一八茶飲）；
     六張犁麵舖公休那兩週（SQ05）isOpen＝false、點餐＝門上那張紙；Pasta 118 做完 SQ12 的下學期起，一個人來的招呼換 SIDEQ.greet、她補一句 SIDEQ.greetMore。
   - 她們各自喜歡吃的（AA_410，src/foodfav3d.js）：點完自己的那一句之後 FAV.l118（一起來的常客＝也幫她點；一個人來滇香＝老闆娘那兩句，排在 AA_311 H8 之後、不同一天：S.ytHold）；選對的那一次常客吃完那一句不說。
   測試：node tests/lane118_unit.js、node tests/aa311_l118_unit.js、node tests/aa397_sideq_unit.js、node tests/aa410_food_fav_unit.js */
'use strict';
const L118=(function(){
  const S={};
  const D=()=>typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS:null;
  const LAY=()=>typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null;
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  S.shop=id=>(D()&&D().shops.find(s=>s.id===id))||null;
  /* 這間店是哪一種（L118-SHOPS-REDO-1111：照資料，不照店 id／類型的字）：'drink'＝外帶飲料店（資料的 drink；買了就走、5 分鐘）、'meal'＝吃飯的店（一餐 40 分鐘）。
     takeout＝沒有內用、沒有室內（資料的 takeout）。src/crowd3d.js 店裡的路人客人、src/seatact3d.js 坐下的小動作也讀這裡 */
  S.kindOf=id=>{ const s=S.shop(id); return s?(s.drink?'drink':'meal'):null; };
  S.isDrink=id=>S.kindOf(id)==='drink';
  S.isTakeout=id=>!!(S.shop(id)||{}).takeout;
  S.MEAL_H=40/60; S.DRINK_H=5/60;
  /* 街上有位置的店（src/data/lane118_layout.js 有那一列）：沒有位置的（剛加進資料、位置還沒量的店）不出現在街上——常客不站、約好的午餐不排、阿哲不約那一間，不報錯；配置加了那一列就自動出現 */
  S.placed=id=>{ const L=LAY(); return !L||!Array.isArray(L.shops)||L.shops.some(q=>q.id===id); };   /* 沒有載入配置（測試）＝不擋 */
  /* 店門口（人行道上，和 zones3d.js 的互動點同一個位置）；side W 的店門朝東（+x） */
  S.door=function(id){ const L=LAY(), s=L&&L.shops.find(q=>q.id===id); if(!s) return null; return {x:s.side==='W'?L.facade.west+0.9:L.facade.east-0.9, z:(s.z0+s.z1)/2, side:s.side, yaw:s.side==='W'?Math.PI/2:-Math.PI/2}; };
  const wdOf=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:G.weekday%7;
  S.isOpen=function(id,G){ const s=S.shop(id); if(!s) return false; if(typeof SIDEQ!=='undefined'&&SIDEQ.closedNote&&SIDEQ.closedNote(G,id)) return false;   /* 六張犁麵舖老闆開刀公休（AA_397 SQ05）*/ const h=G.hour%24; if(s.hours.closed.includes(wdOf(G))) return false; return s.hours.open.some(([a,b])=>h>=a&&h<b); };
  /* 這學期第幾週（寒暑假＝null）*/
  const termNow=G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return T&&T.week>=1?T:null; };
  S.regActive=function(r,G){ if(!G||(G.stage||'law')!=='law') return false; const T=termNow(G); if(!T||T.week>15) return false;
    const i=TERMS.indexOf(T.id), i0=TERMS.indexOf(r.term); if(i<0||i0<0||i<i0||(i===i0&&T.week<r.week)) return false;
    if(r.untilTerm&&i>TERMS.indexOf(r.untilTerm)) return false; if(r.until){ const u=DK(r.until); if(u!=null&&G.day>u) return false; }
    if(!r.days.includes(wdOf(G))) return false; const h=G.hour%24; if(h<r.from||h>=r.to) return false;
    const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(r.id,G):{here:true}; return p.here!==false; };
  S.regularsAt=(G,shopId)=>((D()&&D().regulars)||[]).filter(r=>(!shopId||r.shop===shopId)&&S.regActive(r,G));
  /* 約好的午餐（阿哲週一揪的）：那一天 12:00～14:00 在那間店門口 */
  S.lunchNow=function(G){ const L=G.flags&&G.flags.L118_LUNCH; if(!L||L.day!==G.day) return null; const h=G.hour%24; return h>=12&&h<14?L:null; };
  /* 一起吃的人：店門口真的站著、見過面的常客＋約好的午餐那幾個人 */
  S.companions=function(GM,shopId){ const G=GM.G, out=[]; const met=id=>typeof SOCIAL==='undefined'||!SOCIAL.has||SOCIAL.has(id,'FIRST_MET');
    const L=S.lunchNow(G); if(L&&L.shop===shopId) for(const id of L.with) if(met(id)&&!out.includes(id)) out.push(id);
    if(L&&L.shop===shopId&&S.LUNCH_ONLY.includes(shopId)) return out;   /* 阿哲約的午餐在好家：那一場優先，柏翰那一桌（AA_311 H6）不另外演（AA_480 第 4 節）*/
    for(const r of S.regularsAt(G,shopId)) if(GM.npc&&GM.npc[r.id]&&met(r.id)&&!out.includes(r.id)) out.push(r.id);
    return out; };
  S.LUNCH_ONLY=[];   /* AA_772（L118-SHOPS-REDO-1111）：阿哲的輪替 korea → dian → tea → home 沒有柏翰那一間（H6 搬到大學食堂 cafe2），不用再擋；原本是 ['self']（AA_480 第 4 節）*/
  const lineOf=(id,shopId,exact)=>{ const rs=((D()&&D().regulars)||[]).filter(r=>r.id===id); return (rs.find(r=>r.shop===shopId)||(exact?null:rs[0])||{}).line||null; };   /* exact：只用這間店的那一句（約來的人，S.order 的 o.with）*/
  /* 進到 118 巷、待在巷子裡（story3d.js refreshSchedule 每幾秒叫一次）：時段到了的常客、約好的午餐站到店門口；已經在的不重複 */
  S.populate=function(GM){ const G=GM.G; if(!GM||!GM.spawnCharacter||!LAY()) return 0; let n=0; const at={};
    for(const id in GM.npc){ const q=GM.npc[id]; if(q&&q.l118Shop) at[q.l118Shop]=(at[q.l118Shop]|0)+1; }
    const put=(id,shopId,until)=>{ if(GM.npc[id]) return; const d=S.door(shopId); if(!d) return; const k=at[shopId]=(at[shopId]|0)+1; const x=d.x+(d.side==='W'?0.7:-0.7), z=d.z+(k-1)*0.85-0.4;
      const c=GM.spawnCharacter(id,x,z,{yaw:d.yaw,pose:'idle'}); if(c){ c.idlePose='idle'; c.l118Shop=shopId; c.until=until; n++; } };   /* until：時段結束（story3d.js refreshSchedule 讓他走開） */
    const L=S.lunchNow(G); if(L) for(const id of L.with) put(id,L.shop,14);
    for(const r of S.regularsAt(G)) put(r.id,r.shop,r.to);
    return n; };
  /* 走進店裡（l118_<id>，LANE118-SHOPS-1020）：在店門口等的常客、約好的午餐一起進來，坐在店裡——不然點餐的時候他們還站在巷子裡，一起吃的那段（S.companions）演不到。
     座位照店裡的配置（E.zone.seats）由前往後，有人坐的跳過；已經在的不重複。story3d.js 進區域（S.populate）、待在店裡（refreshSchedule）都叫它 */
  S.populateShop=function(GM,shopId){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.zone||!GM.spawnCharacter||!S.shop(shopId)) return 0; const seats=E.zone.seats||[]; let n=0, k=0;
    const busy=st=>(E.npcs||[]).some(q=>q&&(q.seat===st||q.seatTarget===st))||(E.player&&E.player.seat===st);
    const put=(id,until,pair)=>{ if(GM.npc[id]) return; let st=null; if(!pair&&typeof CROWD!=='undefined'&&CROWD.shopSeatPick){ const q=CROWD.shopSeatPick(GM); if(q&&!busy(q)) st=q; }   /* 常客：先挑不是「留給約好的人那一組兩人座」的位子（SHOP-DINERS-1103 keep；BB 11-03 N19S l118_omu／noodle2 12:30 被常客坐掉一個）*/
      while(k<seats.length&&!st){ const q=seats[k++]; if(!busy(q)) st=q; }
      if(!st&&typeof CROWD!=='undefined'&&CROWD.shopMakeRoom&&CROWD.shopMakeRoom(GM,CROWD.shopFree(E)+1)){ k=0; while(k<seats.length&&!st){ const q=seats[k++]; if(!busy(q)) st=q; } }   /* 坐滿了路人客人（SHOP-DINERS-1103）：進門那一刻靠門口那一桌直接拿掉再找（待在店裡時 shopMakeRoom 不動，CROWD.shopTrim 讓客人自己走）*/ if(!st) return;
      const c=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:'sit'}); if(c){ c.idlePose='sit'; c.l118Shop=shopId; c.until=until; n++; } };
    const L=S.lunchNow(G); if(L&&L.shop===shopId) for(const id of L.with) put(id,14,true);   /* 約好的午餐：照原本從頭找（可以坐那一組）*/
    for(const r of S.regularsAt(G,shopId)) put(r.id,r.to);
    return n; };
  /* AA_311 H1（第②級，118 巷店員那一批）：一一八茶飲 × 學姊「她的老樣子」。大一上第 3 週～大一下第 16 週的平日 12:20～12:45 在 tea 點飲料、已經認識學姊（met_sis／FIRST_MET）、
     當天學姊來過 tea（AA_280 第 3 節的常客 12:30～12:40：那一天她照作息在，而且飲料做好的時候她的時段已經開始）→ 店員兩句＋兩選一，記 SIS_TEA_ORDER
     （學姊備考那一年「一起念書的日常」⑤ 才排得到，src/sis_grad3d.js）。只一次；不加數值（店員不是人物，AA_311 第 2 節）。台詞照 AA_311 H1 */
  S.H1={lines:['剛剛那個學姊，你認識喔？','她每天這個時間來。無糖綠茶，去冰。從來沒換過。'],
    opts:[{t:'「她很固定。」',say:[['店員','對啊。我都在她走到窗口以前就做好了。']]},{t:'「……謝謝。」',say:[[null,'（店員笑了一下，沒有再說。）']]}]};
  S.H1_SHOP='drink_a';   /* AA_772 moves（L118-SHOPS-REDO-1111）：H1 從一一八茶飲（tea 那一格）搬到喝不喝咖啡（drink_a；茶飲店員跟著搬，台詞不變）。drink_a 街上還沒有位置時點不到餐＝不會演 */
  S.h1Due=function(G,shopId,h0){ const F=G.flags||{}; if(shopId!==S.H1_SHOP||F.SIS_TEA_ORDER||(G.stage||'law')!=='law') return false;
    const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||!((T.id==='Y1S1'&&T.week>=3)||(T.id==='Y1S2'&&T.week>=1&&T.week<=16))) return false;
    const wd=wdOf(G); if(wd<1||wd>5) return false; const h=((h0!=null?h0:G.hour)%24); if(h<12+20/60||h>12.75) return false;   /* 點的那一刻 */
    const met=typeof SOCIAL!=='undefined'&&SOCIAL.metD?SOCIAL.metD('heroine_05'):!!F.met_sis; if(!met) return false;
    const r=((D()&&D().regulars)||[]).find(x=>x.id==='heroine_05'&&x.shop===S.H1_SHOP); if(!r||(G.hour%24)<r.from) return false;   /* 她已經來過（飲料做好的時候）*/
    return S.regActive(r,Object.assign({},G,{hour:r.from})); };   /* 那一天她照作息會來（學期第 2～15 週、平日、人在臺北）*/
  S.playH1=async function(GM,clerk){ const G=GM.G, H=S.H1; for(const t of H.lines) await GM.say(clerk,t);
    const k=await GM.choose(H.opts.map(o=>({t:o.t}))); for(const [w,t] of (H.opts[k]||H.opts[0]).say) await GM.say(w?clerk:null,t);
    G.flags.SIS_TEA_ORDER=true; };
  /* ---------- AA_311 第 1 節：店員的稱呼（點餐時店員說的每一句；AA_280 的資料只有阿姨、老闆娘、老闆三間寫了是誰）---------- */
  /* AA_772（L118-SHOPS-REDO-1111，使用者 2026-11-11 九間店改版；店員跟著他的故事走）：十一間店員的稱呼照 src/data/l118_redo772.js 的 staff（tools/story/l118_fix772.py 從白名單上的 AA_772 產生），不寫在這裡 */
  const RD=()=>typeof L118_REDO!=='undefined'?L118_REDO:null;
  S.STAFF=Object.assign({},(RD()&&RD().staff)||{});
  /* ---------- AA_311 第 2 節：熟客（第 5 節：台詞照舊；考試週大四下是第 15 週）----------
     每間店記一個次數：點了東西才算、一天最多記一次（G.l118.n／d；舊存檔沒有＝0，第 4 節第 2 點）。一個人來的招呼：第 1～2 次照 AA_280；第 3 次起「認得你」那一句；
     第 8 次起「老樣子」那一句 →「好」直接點上次那一樣、「看一下菜單」照常點；考試週（CALENDAR.termOf 的 exam：期中第 8～9 週、期末第 16 週，大四下第 15 週）有那一句的店用那一句代替招呼。
     「老樣子」說了菜名的五間（item）：上次點的不是那一樣＝不帶菜名的那一句（usual2，AA_480 第 1 節）；一一八茶飲的 {上次點的} 換成上次點的品名。
     和人一起來照舊是 AA_280 的「幾位？……」（熟客的招呼都是一個人的說法：Pasta「一位嗎？吧檯老位子。」），和 H3／H5／H7／H9 的人一起來換那一段。不加關係數值（店員不是人物）。
     '@'＝這間店的店員（S.STAFF）；null＝旁白 */
  /* AA_772 regular_greets（十一間，取代 AA_311 第 2 節那張表）：known、usual、item、exam 照 src/data/l118_redo772.js 的 reg。
     usual2（AA_480 第 1 節「上次點別的＝不帶菜名那一句」）AA_772 沒有新寫：原本那幾句跟著店員搬（滇香→dian 不動、Pasta→pasta 不動、韓食小廚→tea、好家自助餐→cafe2）；
     新的兩間有 item、沒有這一句的（水上便當 self、迪倫窯烤披薩 noodle2）：上次點的不是那一樣＝不說「老樣子」那一句，照「認得你」（S.stage），等 AA 補 */
  /* 2026-11-11 AA_772 @d78266901 補了 usual2（六間有 item 的店都有稿）：照資料，這裡不再另外寫；資料沒有這一欄的店照上面的退路（不說老樣子那一句，照「認得你」）*/
  S.REG=(function(){ const o={}, R=(RD()&&RD().reg)||{}; for(const k in R) o[k]=Object.assign({},R[k]); return o; })();
  S.USUAL_OPTS=['好','看一下菜單'];
  const law=G=>!!G&&(G.stage||'law')==='law';
  const hh=h=>(((+h||0)%24)+24)%24;
  const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', BH='classmate_bohan', XC='classmate_xinci';
  const hasMem=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  S.rec=function(G){ const R=G.l118&&typeof G.l118==='object'&&!Array.isArray(G.l118)?G.l118:(G.l118={}); for(const k of ['n','d','last','w','once']) if(!R[k]||typeof R[k]!=='object'||Array.isArray(R[k])) R[k]={}; return R; };
  /* 讀檔時做一次（game3d.js migrate；L118-SHOPS-REDO-1111，使用者 2026-11-11 九間店換菜單）：店 id 不變，來了幾次（n、d）、一起吃的次數（w）、演過的（once）照留；
     「上次點的」（last）不在那間店現在的菜單裡（或那間店已經不在資料裡）＝清掉那一筆——「老樣子」不會點到已經沒有的菜。做幾次結果都一樣；沒有 G.l118 的存檔不動。回傳清掉幾筆 */
  /* AA_772 的搬法（讀檔做一次，記在 G.l118.mv772；沒有 G.l118、也沒有 ZHE_118_RANK 的存檔不動）：
     - ZHE_118_RANK（H4 選的那一間，阿哲輪流排第一）：noodle2→korea、korea→tea、dian 不變（AA_772 moves H4）。
     - 一起吃的次數 G.l118.w（'人@店'）跟著故事搬：阿哲的四間 noodle2→korea、korea→tea、self／home→home（H4：四間都吃過）；柏翰 self→cafe2（H6：第三次）。其他人、其他店不動。
       兩筆併成一筆＝次數相加、第一天取早的、最後一天取晚的。
     - 第二步（mv772＝2；LAWWW 2026-11-11 決定：熟客次數跟著店員走）：來了幾次、上次哪天、上次點的（n、d、last）照故事搬——noodle2→korea、korea→tea、self→cafe2、tea→drink_a；
       dian、home、omu、pasta 留原位。原本 cafe2（慢讀咖啡）的次數不搬到 118 巷的店：併進木曜日自己的來過幾次（G.mokuyobi.n；慢讀整套搬到木曜日），那一格的 d、last 丟掉。
       新店 self（水上便當）、noodle2（迪倫窯烤披薩）、drink_b 從 0 開始（搬走以後那一格清掉）。搬過來的 last 是舊菜名＝接著由 S.migrate 清掉。
       只跑過第一步的存檔（mv772＝1）補跑第二步；兩步都跑過＝不動 */
  S.MV772={rank:{noodle2:'korea',korea:'tea'},w:{zhe:{noodle2:'korea',korea:'tea',self:'home'},classmate_bohan:{self:'cafe2'}},n:{noodle2:'korea',korea:'tea',self:'cafe2',tea:'drink_a'},gone:'cafe2'};
  S.migrate772n=function(G,R){ let n=0; const M=S.MV772.n, src=Object.keys(M).concat([S.MV772.gone]);
    const N=R.n&&typeof R.n==='object'&&!Array.isArray(R.n)?R.n:null, Dd=R.d&&typeof R.d==='object'&&!Array.isArray(R.d)?R.d:null, La=R.last&&typeof R.last==='object'&&!Array.isArray(R.last)?R.last:null;
    if(N&&N[S.MV772.gone]!=null){ const k=N[S.MV772.gone]|0; if(k>0){ const mk=G.mokuyobi&&typeof G.mokuyobi==='object'&&!Array.isArray(G.mokuyobi)?G.mokuyobi:(G.mokuyobi={n:0,seats:{}}); mk.n=(typeof mk.n==='number'&&mk.n>=0?mk.n:0)+k; } n++; }
    for(const T of [N,Dd,La]){ if(!T) continue; const old={}; for(const k of src){ if(T[k]!==undefined){ old[k]=T[k]; delete T[k]; } } for(const k of Object.keys(M)){ if(old[k]!==undefined){ T[M[k]]=old[k]; if(T===N) n++; } } }
    return n; };
  S.migrate772=function(G){ if(!G) return 0; const F=G.flags&&typeof G.flags==='object'?G.flags:null, has=G.l118&&typeof G.l118==='object'&&!Array.isArray(G.l118); if(!has&&!(F&&F.ZHE_118_RANK)) return 0;
    const R=has?G.l118:(G.l118={}); if((R.mv772|0)>=2) return 0; let n=0;
    if((R.mv772|0)===1){ n=S.migrate772n(G,R); R.mv772=2; return n; }   /* 第一步跑過的存檔：只補第二步 */
    if(F&&typeof F.ZHE_118_RANK==='string'&&S.MV772.rank[F.ZHE_118_RANK]){ F.ZHE_118_RANK=S.MV772.rank[F.ZHE_118_RANK]; n++; }
    const W=R.w&&typeof R.w==='object'&&!Array.isArray(R.w)?R.w:null;
    if(W){ const add=(out,k,v)=>{ const o=out[k]; if(!v||typeof v!=='object'){ if(o===undefined) out[k]=v; return; } if(!o||typeof o!=='object'){ out[k]=Object.assign({},v); return; } o.n=(o.n|0)+(v.n|0); if(typeof v.d0==='number'&&(typeof o.d0!=='number'||v.d0<o.d0)) o.d0=v.d0; if(typeof v.d==='number'&&(typeof o.d!=='number'||v.d>o.d)) o.d=v.d; };
      for(const who in S.MV772.w){ const M=S.MV772.w[who], out={}, keys=Object.keys(W).filter(k=>k.indexOf(who+'@')===0); let moved=0;
        for(const k of keys){ const shop=k.slice(who.length+1), to=M[shop]||shop; if(M[shop]) moved++; add(out,who+'@'+to,W[k]); }
        if(moved){ for(const k of keys) delete W[k]; Object.assign(W,out); n+=moved; } } }
    n+=S.migrate772n(G,R); R.mv772=2; return n; };
  S.migrate=function(G){ if(!G||!D()) return 0; try{ S.migrate772(G); }catch(e){ console.warn('L118.migrate772',e); } const R=G.l118; if(!R||typeof R!=='object'||Array.isArray(R)) return 0; const last=R.last; if(!last||typeof last!=='object'||Array.isArray(last)) return 0; let n=0;
    for(const id of Object.keys(last)){ const s=S.shop(id); if(!s||!s.menu.some(m=>m[0]===last[id])){ delete last[id]; n++; } } return n; };
  S.visitNo=(G,id)=>{ const R=S.rec(G); return (R.n[id]|0)+(R.d[id]===G.day?0:1); };   /* 今天這一次算第幾次來（今天已經記過＝同一次）*/
  S.visit=function(G,id,item){ const R=S.rec(G); if(R.d[id]!==G.day){ R.n[id]=(R.n[id]|0)+1; R.d[id]=G.day; } R.last[id]=item; };
  S.exam=G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !!(T&&T.exam); };
  /* 一個人來的招呼：{lines, usual＝「好」點的那一樣（選單序號）} 或 null（照 AA_280）*/
  S.stage=function(G,id){ const Q=S.REG[id], s=S.shop(id); if(!Q||!s) return null;
    if(Q.exam&&S.exam(G)) return {lines:[['@',Q.exam]],kind:'exam'};
    const v=S.visitNo(G,id); if(v<3) return null;
    if(v>=8){ const last=S.rec(G).last[id], i=last!=null?s.menu.findIndex(m=>m[0]===last):-1; if(i>=0&&!(Q.item&&Q.item!==last&&!Q.usual2)) return {lines:[['@',Q.item&&Q.item!==last&&Q.usual2?Q.usual2:Q.usual.replace('{上次點的}',last)]],usual:i,kind:'usual'}; }   /* 上次點別的＝不帶菜名那一句（AA_480 第 1 節：不倒回「認得你」）*/
    return {lines:Q.known,kind:'known'}; };
  /* 一起吃的次數（L118.companions 的常客、約好的午餐，和「坐過去一起吃」EAT.together）：一個人、一間店一筆，一天最多記一次 */
  S.ateWith=(G,id,shop)=>S.rec(G).w[id+'@'+shop]||null;
  S.ate=function(G,id,shop){ const R=S.rec(G), k=id+'@'+shop, w=R.w[k]||(R.w[k]={n:0,d0:G.day,d:null}); if(w.d!==G.day){ w.n=(w.n|0)+1; w.d=G.day; } return w; };
  const once=(G,k)=>S.rec(G).once[k]!=null, mark=(G,k)=>{ S.rec(G).once[k]=G.day; };
  /* ---------- AA_311 第 3 節 H2～H9（第 5 節改過的字；都只演一次、不加數值；H2b 作廢）。台詞照抄；'@'＝這間店的店員、null＝旁白、人物 id＝那個人 ---------- */
  S.H2={lines:[['店員','那個每次都點可樂餅咖哩的女生，這學期都沒來耶。']],
    opts:[{t:'「她最近比較忙。」',say:[['店員','喔。那你跟她說，靠牆那個位子我幫她留著。']]},{t:'「……我也不知道。」',say:[[null,'（店員點點頭，沒有再問。）']]}]};
  S.H3={lines:[['老闆','窗邊那張有插座。她幫你留了。'],[null,'（以安把她的包從旁邊的椅子拿起來。）'],[AN,'你的筆電電池撐不過一節課。']]};   /* 說話的人：AA 2026-11-11 定案木曜日一律「老闆」（這一段 AA_772 搬到木曜日演，SLOWREAD.h3；原本慢讀咖啡的「店長」）*/
  S.H4={lines:[['zhe','欸，118 巷四間都吃過了。'],['zhe','我的排名：這間第一。……你的呢？']],shops:['korea','dian','tea','home'],   /* AA_772 moves：四間＝阿哲輪流的 korea、dian、tea、home（不再有 self 代班）；在清州刀削麵（korea）一起吃完的那一次演 */
    opts:[{t:'「這間第一。」',rank:'korea',say:[['zhe','英雄所見略同。老闆，他也是大碗。']]},{t:'「牛排那間。」',rank:'dian',say:[['zhe','牛排喔……好，下禮拜去那間，我要點雙拼。']]},{t:'「韓式。」',rank:'tea',say:[['zhe','你被 Alison 洗腦了。']]}]};
  S.H5={lines:[['老闆','Alison 又帶朋友來了。小菜多一盤。']],three:[['老闆','三位？'],[null,'（他看了一下阿哲和 Alison 坐的位子。）'],['老闆','……兩位加一位。小菜一樣多一盤。']]};
  S.H6={lines:[[BH,'十二點四十了。'],[BH,'……今天等你五分鐘。']]};
  S.H7={lines:[['老闆娘','妹妹今天也是高麗菜的？'],[XC,'……一樣。']],third:[[XC,'我發現我每次都點一樣的。……下次我想換。你幫我記著。']],
    opts:[{t:'「她今天要換。」',key:'H7c',say:[[XC,'……韭菜的。'],['老闆娘','喔！難得！']]},{t:'（不說話）',say:[[XC,'……一樣。']]}]};   /* AA_480 第 3 節：老闆娘那句以後馬上兩個選項；沒選＝下一次一起來還會出，直到選了 */
  S.H8={lines:[['老闆娘','上次跟你一起來的那個妹妹，前幾天自己來，問我開店的事。'],['老闆娘','問了兩個小時，還寫筆記。我說我又不是名人。']],
    opts:[{t:'「她是社會系的。」',say:[['老闆娘','難怪。她問的我都沒想過。']]},{t:'「她問什麼？」',say:[['老闆娘','問我為什麼開在這裡。……我說房租便宜啊。她寫了一整頁。']]}]};
  S.H9={lines:[['老闆','兩位嗎？窗邊有位子。']],done:'（窗外的巷子有人牽著腳踏車經過。你們都沒有急著走。）'};
  /* 和人一起來的招呼（代替「幾位？……那邊那張可以坐。」）：{lines, key＝只演一次的記號（null＝每次）, ask＝H7 下一次一起來多的選項, h9}
     H3：大一上週三 12:10～13:10 在慢讀咖啡、以安在（常客）、民總報告和她同一組（REPORT_PARTNER）；H5：和 Alison 在韓食小廚（每次），大二上 12/19 起和阿哲、Alison 三個人＝那一段（一次）；
     H7：和芯慈在家常菜（每次），吃滿三次那一句說過以後（別天）＝老闆娘那句以後兩個選項，選「她今天要換。」以前每次都出（AA_480 第 3 節）；H9：平日中午、只有交往中的那一位和你一起來 Pasta 118（一次） */
  S.withScene=function(G,shopId,comp,h0){ if(!law(G)||!comp||!comp.length) return null; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, wd=wdOf(G), h=hh(h0!=null?h0:G.hour), R=S.rec(G);
    /* H3（以安窗邊的位子）：AA_772 搬到木曜日（大一下起週六下午她在木曜日念書、有 REPORT_PARTNER、一次；src/slowread3d.js 的 SLOWREAD.h3），118 巷不再演；演過的記號 G.l118.once.H3 照舊 */
    if(shopId==='tea'&&comp.includes('yu')){ const pd=DK('2026-12-19'); if(comp.length===2&&comp.includes('zhe')&&pd!=null&&G.day>=pd&&!once(G,'H5b')) return {lines:S.H5.three,key:'H5b'}; return {lines:S.H5.lines,key:null}; }
    if(shopId==='home'&&comp.includes(XC)){ if(R.once.H7a!=null&&R.once.H7a<G.day&&R.once.H7c==null) return {lines:[S.H7.lines[0]],key:null,ask:S.H7.opts}; return {lines:S.H7.lines,key:null}; }
    if(shopId==='pasta'&&comp.length===1&&dating(G,comp[0])&&!once(G,'H9')&&wd>=1&&wd<=5){ const s=S.shop('pasta'), L=s&&s.hours.open[0]; if(L&&h>=L[0]&&h<L[1]) return {lines:S.H9.lines,key:'H9',h9:true}; }
    return null; };
  /* H2：大二下週三 12:10～13:00 在蛋包飯研究所點餐、之前和沛珊在那裡一起吃過（舊存檔：AA_410 那一套記過她在蛋包飯研究所說的那一句、選對過也算）；交往中照演（第 5 節）*/
  S.h2Due=function(G,shopId,h0){ if(shopId!=='omu'||!law(G)||once(G,'H2')) return false; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||T.id!=='Y2S2'||wdOf(G)!==3) return false;
    const h=hh(h0); if(h<12+10/60||h>=13) return false; const F=G.fav||{};
    return !!(S.ateWith(G,PS,'omu')||(F.know&&F.know[PS]!=null)||(F.right&&F.right[PS]!=null)||hasMem(PS,'REMEMBERED_HER_FOOD')); };
  /* H4：和阿哲一起吃過輪流的四間（noodle2、dian、korea、self；家常菜也算 self 那一間）以後，在六張犁麵舖一起吃完（這一次記之前判斷）*/
  S.h4Due=(G,shopId,comp)=>shopId==='korea'&&law(G)&&comp.includes('zhe')&&!once(G,'H4')&&S.H4.shops.every(sh=>[].concat(sh).some(x=>((S.ateWith(G,'zhe',x)||{}).n|0)>=1));
  /* H6：和柏翰在好家自助餐一起吃的第三次、12:39 以後還沒吃完（這一次記完之後判斷；他吃完那一句換成這兩句）*/
  S.h6Due=(G,shopId,comp,hEnd)=>shopId==='cafe2'&&law(G)&&comp.includes(BH)&&!once(G,'H6')&&((S.ateWith(G,BH,'cafe2')||{}).n|0)>=3&&hh(hEnd)>12+39/60;
  /* H7：和芯慈在家常菜一起吃滿三次，第三次吃完多一句（她吃完那一句之後）*/
  S.h7cDue=(G,shopId,comp)=>shopId==='home'&&law(G)&&comp.includes(XC)&&!once(G,'H7a')&&((S.ateWith(G,XC,'home')||{}).n|0)>=3;
  /* H8：大二上起和語彤在滇香一起吃過以後，下一次（別天）自己來；語彤在臺北（presence）。AA_410 老闆娘說她點法的那兩句排在 H8 之後、不同一天（S.ytHold，foodfav3d.js 的 ytKnow 看它）*/
  S.h8Base=function(G){ if(!law(G)||once(G,'H8')) return false; const w=S.ateWith(G,YT,'dian'), D2=[w&&w.d,G.fav&&G.fav.ytWith].filter(x=>typeof x==='number'); if(!D2.length) return false; const last=Math.max.apply(null,D2); if(last>=G.day) return false;   /* 遊戲的日子可以是負的（大一上前兩週）：不用 -1 當「沒有」*/
    const y2=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null; return !(y2&&last<y2.from); };
  S.h8Due=function(G,shopId,comp){ if(shopId!=='dian'||(comp&&comp.length)||!S.h8Base(G)) return false;
    if(G.fav&&G.fav.know&&G.fav.know[YT]===G.day) return false;   /* 老闆娘今天已經說了她的點法（舊存檔）：不同一天 */
    const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(YT,G):{here:true}; return p.here!==false; };
  S.ytHold=G=>S.rec(G).once.H8===G.day||S.h8Base(G);
  const who=(GM,w,clerk)=>w==null?null:(w==='@'?clerk:(typeof CHARACTERS!=='undefined'&&CHARACTERS[w]?((GM.npc&&GM.npc[w])||{name:nm(w),charId:w}):{name:w}));
  const sayAll=async(GM,arr,clerk)=>{ for(const [w,t] of arr||[]) await GM.say(who(GM,w,clerk),t); };
  S.playOpts=async function(GM,H,clerk){ await sayAll(GM,H.lines,clerk); const k=await GM.choose(H.opts.map(o=>({t:o.t}))); const o=H.opts[k]||H.opts[0]; await sayAll(GM,o.say,clerk); return o; };
  /* H4 選的那一間＝ZHE_118_RANK；阿哲之後揪午餐的輪流把它排第一（S.rotation），從下一週起由它開始（rankAt；之後的學期第 2 週就是它）*/
  S.playH4=async function(GM){ const G=GM.G; mark(G,'H4'); const o=await S.playOpts(GM,S.H4,null); G.flags.ZHE_118_RANK=o.rank; const T=termNow(G); S.rec(G).rankAt=T?{term:T.id,week:T.week+1}:null; return o.rank; };
  /* 順手的事（src/sideq3d.js）認的是「那件事的店名 key」（舊存檔的進度、熟客次數照舊）：這間店現在是哪一件事的店照 AA_772 的搬法（SIDEQ.keyOf；沒有＝店名）*/
  const sqKey=(shopId,s)=>(typeof SIDEQ!=='undefined'&&SIDEQ.keyOf&&SIDEQ.keyOf(shopId))||s.name;
  /* 店門口點餐 */
  /* o.with：一起來的人由呼叫的地方給（約好的午餐：S.INVITE 的見面），不看店門口的常客；他們吃完那一句只用這間店自己的（AA_280 沒寫＝不說）*/
  S.order=async function(GM,shopId,o){ const G=GM.G, s=S.shop(shopId), Dd=D(); if(!s||!Dd) return false; GM.sceneBegin();
    try{ const sqClosed=typeof SIDEQ!=='undefined'&&SIDEQ.closedNote?SIDEQ.closedNote(G,shopId):null; if(sqClosed){ await GM.say(null,sqClosed); return true; }   /* 公休的紙（玩家寫的那一張，AA_397 SQ05）*/
      if(!S.isOpen(shopId,G)){ await GM.say(null,Dd.closedLine); return true; }
      const own=!!(o&&Array.isArray(o.with)), comp=own?o.with.slice():S.companions(GM,shopId), clerk={name:S.STAFF[shopId]||s.greet.who||'店員'}, h0=G.hour;   /* 店員的稱呼照 AA_311 第 1 節 */
      const hg=S.withScene(G,shopId,comp,h0);   /* AA_311 H3／H5／H7／H9：和那個人一起來的招呼 */
      const sqG=!comp.length&&typeof SIDEQ!=='undefined'&&SIDEQ.greet?SIDEQ.greet(G,sqKey(shopId,s)):null;   /* 順手的事 SQ12（AA_404）：Pasta 118 下學期起一個人來的招呼換一句、她補一句 */
      const st=!comp.length&&!sqG?S.stage(G,shopId):null;   /* AA_311 第 2 節：熟客、考試週（一個人來）*/
      let k=-1;
      if(hg){ if(hg.key) mark(G,hg.key); await sayAll(GM,hg.lines,clerk);
        if(hg.ask){ const q=hg.ask[await GM.choose(hg.ask.map(x=>({t:x.t})))]||hg.ask[hg.ask.length-1]; if(q.key) mark(G,q.key); await sayAll(GM,q.say,clerk); } }   /* H7：老闆娘那句以後馬上兩個選項（AA_480 第 3 節）*/
      else if(comp.length) await GM.say(clerk,Dd.groupGreet);
      else if(sqG){ await GM.say(clerk,sqG); if(SIDEQ.greetMore) for(const [w,t] of (SIDEQ.greetMore(G,sqKey(shopId,s))||[])) await GM.say({name:w},t); }
      else if(st){ await sayAll(GM,st.lines,clerk);
        if(st.usual!=null){ const [un,up]=s.menu[st.usual]; if(await GM.choose([{t:S.USUAL_OPTS[0],hint:un,dim:(G.money|0)<up},{t:S.USUAL_OPTS[1]}])===0){ k=st.usual; if(typeof EAT!=='undefined'&&EAT.atNow) EAT.atNow(G,s.name); } } }   /* 「好」＝直接點上次那一樣（不出選單；點餐那一刻照樣記給「一起吃」用）*/
      else await GM.say(clerk,s.greet.text);
      const names=s.menu.map(m=>m[0]), prices=s.menu.map(m=>m[1]), opts=s.menu.map(([n,p])=>({t:n+'　'+p+' 元',dim:(G.money|0)<p})).concat([{t:'不用了'}]);
      const gO=s.drink&&typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,s.name):null; if(gO) opts.push(gO);   /* 買一份帶走送人（GIFT-L118-DRINK-1112，src/gift3d.js）：放在「不用了」後面，原本的選項位置不動 */
      /* 選單的「老樣子」（src/eat3d.js，AA_329 第 3 節）：118 巷九間照 AA_480 第 2 節合併——不說 AA_329 第 5 次那一句（第 3 次起已經認得你）；
         第 5 次起照樣有「老樣子」、選了店員回 AA_329 最右欄那句（說話的人照 S.STAFF）；店員這一次已經主動問過（第 8 次起的「老樣子」那句）＝選單不另外出 */
      const asked=!!(st&&st.usual!=null);
      if(k<0) k=typeof EAT!=='undefined'?await EAT.choose(GM,s.name,opts,names,prices,{who:clerk.name,line5:false,usual:!asked}):await GM.choose(opts);
      if(gO&&k===s.menu.length+1){ await GIFT.buy(GM,s.name); return true; }
      if(k>=s.menu.length) return true; const [item,price]=s.menu[k];
      if((G.money|0)<price){ GM.toast('錢不夠'); return true; }
      GM.money(-price,'餐費'); await GM.say(null,Dd.orderLine.replace('{品名}',item)); S.visit(G,shopId,item);   /* 熟客的次數、上次點的（AA_311 第 2 節）*/
      const fav=typeof FAV!=='undefined'&&FAV.l118?await FAV.l118(GM,shopId,comp):null;   /* 她們各自喜歡吃的（src/foodfav3d.js，AA_410）：一起來的常客＝也幫她點；一個人來滇香＝老闆娘說語彤的點法。fav＝這一次選對的人 */
      GM.advance(s.drink?S.DRINK_H:S.MEAL_H); if(typeof EAT!=='undefined') await EAT.ordered(GM,s.name,item);   /* 外帶飲料 5 分鐘、其他一餐 40 分鐘：照資料的 drink（L118-SHOPS-REDO-1111；原本看類型是不是「手搖飲」）*/   /* 吃過的、第一次的旁白（AA_329 第 2 節）*/
      const h1=S.h1Due(G,shopId,h0);   /* AA_311 H1：飲料做好、拿到手的時候（一起來的人那一句之後、走回巷口以前）*/
      const h2=S.h2Due(G,shopId,h0), h8=S.h8Due(G,shopId,comp), h4=S.h4Due(G,shopId,comp);   /* H4 在這一次記之前判斷（四間都吃過「以後」的那一次）*/
      for(const id of comp) S.ate(G,id,shopId);
      const h6=S.h6Due(G,shopId,comp,G.hour), h7=S.h7cDue(G,shopId,comp), h9=!!(hg&&hg.h9);
      if(comp.length){ for(const id of comp){ if(h6&&id===BH){ mark(G,'H6'); await sayAll(GM,S.H6.lines,clerk); }   /* H6：柏翰今天等你五分鐘（代替「十二點四十了。我先回總圖。」）*/
          else if(!h9){ const t=lineOf(id,shopId,own); if(t&&!(fav&&fav.has(id))){ await GM.say(GM.npc&&GM.npc[id]||{name:nm(id),charId:id},t); if(typeof FAV!=='undefined'&&FAV.heard) FAV.heard(GM,id,shopId); } }   /* H9：AA_280 沒有誰在 Pasta 118 的那一句，吃完是 H9 的旁白 */
          if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(id,'meal'); } }   /* 選對的那一次她剛才那兩句代替吃完的那一句；以安、沛珊在蛋包飯研究所的那一句＝知道（AA_410）*/
      if(h7){ mark(G,'H7a'); await sayAll(GM,S.H7.third,clerk); }   /* H7：一起吃滿三次，第三次吃完多一句 */
      if(h4) await S.playH4(GM);   /* H4：118 巷的排名 */
      if(h1){ await S.playH1(GM,clerk); if(typeof FAV!=='undefined'&&FAV.sync) FAV.sync(GM); }   /* H1 店員那兩句＝知道學姊的點法：筆記本那一行（AA_410）*/
      if(h2){ mark(G,'H2'); await S.playOpts(GM,S.H2,clerk); }   /* H2：沛珊的位子 */
      if(h8){ mark(G,'H8'); await S.playOpts(GM,S.H8,clerk); }   /* H8：老闆娘的開店故事 */
      if(h9) await GM.say(null,S.H9.done);
      if(!comp.length){ if(typeof EAT!=='undefined'&&await EAT.together(GM,s.name)){ const x=EAT.lastTog; if(x&&x.key===s.name&&x.day===G.day) S.ate(G,x.id,shopId); } else await GM.say(null,s.done); }   /* 店裡有認識的人在吃：坐過去一起吃（AA_329 第 1 節；一起吃的次數也記，H4 的家常菜週日阿哲）*/
      const L=S.lunchNow(G); if(L&&L.shop===shopId) L.done=true;
      if(typeof SIDEQ!=='undefined'&&SIDEQ.atShop){ try{ await SIDEQ.atShop(GM,sqKey(shopId,s),{item,price}); }catch(e){ console.warn('SIDEQ',e); } }   /* 順手的事：店員偶爾多一句（AA_397）*/
      if(GM.autosave) GM.autosave(); return true;
    } finally { GM.sceneEnd(); } };
  /* 阿哲週一 12:00 揪午餐（PHONE 規則，每個 tick 叫一次）*/
  /* 輪流的店、每一間阿哲說的那一句照資料（AA_280 第 4 節：korea → dian → tea → home）。AA_480 第 4 節的換店（S.LUNCH_FIX：巷口家常菜週一休＝改好家自助餐）拿掉了
     ——AA_772 第 14 列：五湖四海週一有開。輪流裡街上還沒有位置的店（S.placed）跳過 */
  S.baseRotation=()=>((D()&&D().lunch&&D().lunch.rotation)||[]).filter(x=>S.placed(x));
  S.weeklyText=shop=>{ const W=(D()&&D().lunch&&D().lunch.weekly)||{}; return W[shop]!=null?W[shop]:null; };
  /* 第一次去哪一間：資料的 lunch.firstShop（AA_280 第 4 節「出遊排到…」；原本寫死 noodle2）；資料沒有、或那一間街上沒有位置＝輪流的第一間 */
  S.firstShop=()=>{ const f=D()&&D().lunch&&D().lunch.firstShop; return f&&S.shop(f)&&S.placed(f)?f:(S.baseRotation()[0]||null); };
  /* 輪流的順序：noodle2 → dian → korea → self；AA_311 H4 選過（ZHE_118_RANK）＝那一間排第一，H4 那一學期從下一週起由它開始（rankAt）、之後的學期第 2 週就是它 */
  S.rotation=function(G){ const R=S.baseRotation(), k=G&&G.flags&&G.flags.ZHE_118_RANK, i=R.indexOf(k); if(i>0){ R.splice(i,1); R.unshift(k); } return R; };
  S.lunchShop=function(T,G){ const R=S.rotation(G); if(!R.length) return null; const b=G&&G.flags&&G.flags.ZHE_118_RANK&&G.l118?G.l118.rankAt:null; const i=b&&b.term===T.id?T.week-b.week:T.week-2; return R[(i%R.length+R.length)%R.length]; };
  /* 祐廷人在國外（STORY.abroad：交換路線出發日 ≦ 今天 ＜ 返台日；或 tzOffset 不是 0＝寒暑假出國途中）（AA_531 第 1 節）*/
  S.meAbroad=G=>typeof STORY!=='undefined'&&((!!STORY.abroad&&!!STORY.abroad(G))||(!!STORY.tzOffset&&(+STORY.tzOffset(G)||0)!==0));
  S.firstMonday=()=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S1'):null; if(!r) return null; for(let d=r.from+7;d<r.from+14;d++) if(CALENDAR.dateOf(d).wd%7===1) return d; return null; };
  S.phone=function(G){ if(typeof PHONE==='undefined'||!D()||(G.stage||'law')!=='law') return; const F=G.flags, now=G.day*24+G.hour, Lc=D().lunch, T=termNow(G);
    if(!T||T.week<2||T.week>15||wdOf(G)!==1||G.hour<12||G.hour>=12.25) return;   /* 那個週一 12:00～12:15 才發（之後讀檔不補發過去的週）*/
    const d1=S.firstMonday(); if(d1==null||G.day<d1) return; const tag='l118_lunch_'+G.day; if(PHONE.sent(G,tag)) return;
    const zp=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('zhe',G):{here:true}; if(zp.here===false) return;
    if(S.meAbroad(G)) return;   /* AA_531 第 1 節：祐廷人在國外（美國、日本交換）不揪——原本只看阿哲在不在，9/11～12/11 每週一照揪、回「走。」還排出遊、快轉每週停一次（當地 12:00＝臺灣半夜）*/
    if(typeof DATE!=='undefined'&&DATE.tripAt&&DATE.tripAt(G,G.day,12.25,1)) return;   /* 12:15 那段時間已經約了校外約會：這週不揪（BUG-DATE-OVERLAP-1021；第一次那則順延到下一個週一）*/
    const inG=PHONE.inGroup(G,'noodle_team'), famZhe=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has('zhe','FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage('zhe'))>=SOCIAL.STAGES.indexOf('FAMILIAR');
    if(!inG&&!famZhe) return;
    const first=!F.L118_FIRST_SENT, shop=first?S.firstShop():S.lunchShop(T,G); if(!shop) return; const th=inG?'g:noodle_team':'p:zhe';
    let L=first?Lc.first.slice():[['zhe',S.weeklyText(shop)]];
    const paired=DK('2026-12-19'); if(!first&&inG&&paired!=null&&G.day>=paired) L.push(['yu',Lc.pairedYu]);   /* 阿哲和 Alison 交往以後（大二上 12/19 起）*/
    if(!inG) L=L.filter(([w])=>w==='zhe');
    const M=L.map(([w,t])=>({th,from:w,text:t})); const last=M[M.length-1];
    last.ask={id:tag,until:now+1.5,opts:[{t:Lc.yes,set:{L118_PICK:G.day+':'+shop},say:[{th,from:'zhe',text:Lc.yesReply}]},{t:Lc.no,say:[{th,from:'zhe',text:Lc.noReply}]}]};
    PHONE.at(G,G.day,12,M,tag); F.L118_FIRST_SENT=true; };
  /* 回了「走。」：排 12:15 那間店門口（出遊 goto）；阿哲、Alison 在那裡等 */
  S.tick=function(G){ const F=G.flags; if(typeof F.L118_PICK!=='string') return; const [ds,shop]=F.L118_PICK.split(':'); delete F.L118_PICK; const day=+ds; const d=S.door(shop), s=S.shop(shop); if(!d||!s) return;
    const withs=['zhe']; const yp=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('yu',G):{here:true}; if(yp.here!==false) withs.push('yu');
    F.L118_LUNCH={day,shop,with:withs};
    if(typeof OUT!=='undefined'&&!OUT.get(G,'l118_lunch_'+day)&&G.day<=day) OUT.plan(G,{id:'l118_lunch_'+day,ev:null,day,h:12.25,late:0.5,place:'118 巷',title:'中午 118 巷（'+s.name+'）',travel:'走路約 5 分鐘',travelH:1/12,goto:{zone:'lane118',x:d.x+(d.side==='W'?1.6:-1.6),z:d.z+1.2,yaw:d.yaw}}); };
  /* ---------- AA_480 第 5 節：H9 的路——交往中的玩家，平日中午約她「去義大麵屋吃午餐」（邀約的「一起吃飯」那一類 kind:'meal'，src/invites3d.js）----------
     地點：l118_pasta；週一、二、四、五（週三休、平日，照 AA_280）11:30～14:00，約 12:10（S.timeOptions 的 times）。只有交往中、法律系那幾年列出來（show）。
     她答應的句子照現有的（AA_415 的表、表上沒有就系統的旁白），不另寫。見面（INV.meet）＝在店裡照 S.order 和她一起點餐（scene；ownMeal：時間、吃完那一句由點餐那一段處理）：
     H9 第一次「兩位嗎？窗邊有位子。」＋吃完那句旁白；之後照一般的「幾位？」、沒有旁白（AA_480 第 5 節）。不算正式校外約會（AA_311 H9）。兩個人一起坐下（seatPose）*/
  S.INVITE={id:'pasta118',zone:'l118_pasta',name:(S.shop('pasta')||{}).name||'義大麵屋',verb:'去義大麵屋吃午餐',kind:'meal',minStage:'FAMILIAR',stay:40/60,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',ownMeal:true,
    /* 哪幾天、幾點照店家資料（L118-SHOPS-REDO-1111：義大麵屋公休改週一，原本寫死週一、二、四、五＝週三休）：平日扣掉公休日、午餐那一段 */
    days:[1,2,3,4,5].filter(d=>!((S.shop('pasta')||{hours:{closed:[]}}).hours.closed||[]).includes(d)),hours:(((S.shop('pasta')||{}).hours||{}).open||[[11.5,14]])[0].slice(),times:[12+10/60],
    show:(G,id)=>law(G)&&id!=null&&dating(G,id),
    scene:async(GM,iv)=>{ await S.order(GM,'pasta',{with:[iv.who]}); } };
  if(typeof INVITE_DATA!=='undefined'&&Array.isArray(INVITE_DATA.places)&&!INVITE_DATA.places.some(q=>q.id===S.INVITE.id)) INVITE_DATA.places.push(S.INVITE);
  return S;
})();
