/* 溫州街三家店：客人的選單與旁白（DL-09；AA-B AA_172，2026-10-16，給 LAWWW-B 直接接）。
   半熟（點餐、看今日推薦）、一盞（喝茶）、阿德影印輸出（印東西、買文具）。做法照麵店：選單是品項＋價錢，選了以後時間往前走，結束時一句旁白。
   - 不扣時段次數（AA_160 2-3：吃飯、買東西都不算）；店名、品項都是虛構（D77）。營業時間在 src/data/places.js（AA_164 1-2）。
   - 打工的玩家（熟練 3 以上）多的那一句、有班那天的黑板：等 DL-10 的打工系統（全域 JOBS.at(G,'brunch'|'print'|'teahouse') → {lv, today, board}）；還沒有 JOBS 時不播。
   - 和人約的早午餐（invites3d.js 的 brunch）不走這裡（AA_172 1-1：約會的台詞之後再寫）。
   - AA_364 的四家（第 4、5 節：林家乾麵、巷子裡定食內用；巷口茶飲、夏日冰菓室外帶窗口）也在這裡（S.AA364、S.order364；吃過的、老樣子登記到 src/eat3d.js）。測試：node tests/wz_aa364_shops_unit.js
   順手的事（AA_397，src/sideq3d.js）：AA_364 三家點完最後叫 SIDEQ.atShop；林家做完 SQ01 的招呼一次、菜單牆多一行；冰菓室 SQ03 的窗口多「看價目板」；一盞茶屋的蘇姨（SQ08 問一次）。
     第二、三批（AA_404 SQ14、AA_405 SQ19／SQ20）：一盞茶屋（喝茶）、半熟早午餐（點餐）買完也叫 SIDEQ.atShop（巷子裡定食本來就有）。
   存檔：G.daily.wzs＝{printWk, printUsed:[], brunchW, gardenN, tokoN}（影印旁白「同一週不重複」；其餘是輪流的位置）。AA_364 的四家不另外存（次數、上一次點的在 G.eat，src/eat3d.js）。 */
const WZS=(()=>{
  const S={};
  const T_=G=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
  const month=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).m:10;
  const wd=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7);   /* 1～7，週日＝7 */
  const hr=G=>G.hour;
  const job=(G,k)=>{ try{ return typeof JOBS!=='undefined'&&JOBS.at?JOBS.at(G,k):null; }catch(e){ return null; } };
  S.rec=G=>{ G.daily=G.daily||{}; const r=G.daily.wzs=G.daily.wzs||{}; if(!Array.isArray(r.printUsed)) r.printUsed=[]; return r; };

  // ---------- 1. 半熟早午餐 ----------
  S.BRUNCH=[['半熟蛋吐司套餐（附沙拉、紅茶）',190,'蛋黃剛好流到吐司邊。你終於知道，三分四十秒是什麼意思。'],
            ['班尼迪克蛋（附紅茶）',260,'醬汁很濃。你把最後一口麵包留下來擦盤子。'],
            ['法式吐司（附熱拿鐵）',220,'甜的。窗外的騎樓有人在排隊，你吃得很慢。']];
  S.BRUNCH_WORK=['小米姐從廚房探頭：「今天的蛋，是我煮的。你煮的話會少十秒。」','小蕙偷偷多放了一顆小番茄。'];
  S.BOARD={2:['今日推薦：半熟蛋吐司。蛋是三分四十秒，不是三分半。'],3:['今日推薦：半熟蛋吐司。蛋是三分四十秒，不是三分半。'],
           4:['今日推薦：班尼迪克蛋。醬是早上現打的。'],5:['今日推薦：班尼迪克蛋。醬是早上現打的。'],
           6:['今日推薦：法式吐司。週末，甜一點也沒關係。'],7:['今日推薦：老闆娘決定。','（下面一行小字：她今天心情很好。）']};
  S.boardLines=G=>{ const j=job(G,'brunch'); if(j&&j.today&&j.board) return [j.board,'這是你早上寫的。字有一點歪。']; return S.BOARD[wd(G)]||S.BOARD[2]; };

  // ---------- 2. 一盞茶屋 ----------
  S.winter=G=>{ const m=month(G); return m===12||m<=2; };
  S.TEA=[['凍頂烏龍（附一碟茶點）',280,1,'第三泡的時候，茶的味道變甜了。蘇姨說，這是茶在說話。'],
         ['東方美人（附一碟茶點）',330,1.5,'茶湯是琥珀色的。你一直等到它涼了一點才喝。'],
         ['焙茶',260,1,'焙過的香味，一進門就聞得到。手是暖的。',G=>S.winter(G)]];   /* 焙茶：冬天（12～2 月）才有 */
  S.teaSeason=G=>{ const m=month(G); return m>=3&&m<=5?'院子的老樟樹在換葉子。新葉是淺綠的，舊葉掉在石板上。':(m>=6&&m<=8?'緣側的風鈴一直在響。蘇姨說，風鈴響，就不用開冷氣。':(m>=9&&m<=11?'竹掃把靠在牆邊。院子裡的落葉，蘇姨說明天再掃。':'下午三點的陽光，剛好照到緣側的坐墊上。你不想起來。')); };
  S.TEA_WORK='蘇姨看了一眼你泡的那一壺。……沒有說話。你知道那是可以的意思。';
  S.teaMenu=G=>S.TEA.filter(t=>!t[4]||t[4](G));
  /* 看院子、看床之間的掛軸（AA_172 2-2，0 分鐘）：院子白天兩句輪流、18:00 以後換石燈籠那一句；掛軸兩句輪流 */
  S.GARDEN=['踏石一塊一塊排到緣側前面。石縫裡的苔很綠，像是有人每天澆水。','杜鵑、小楓樹、一棵老樟樹。院子不大，每一棵都站得剛剛好。','石燈籠亮了。院子裡只剩那一小團光，和老樟樹的影子。'];
  S.TOKONOMA=['掛軸上只有一個字：茶。寫得很慢，最後一筆特別長。','下面的花器插著一枝花，看起來是院子剪的。床之間不放東西，也不坐人。'];
  S.gardenLine=G=>{ if(hr(G)>=18) return S.GARDEN[2]; const r=S.rec(G); r.gardenN=((r.gardenN|0)+1)%2; return S.GARDEN[r.gardenN]; };
  S.tokonomaLine=G=>{ const r=S.rec(G); r.tokoN=((r.tokoN|0)+1)%2; return S.TOKONOMA[r.tokoN]; };

  // ---------- 3. 阿德影印輸出 ----------
  S.printMenu=G=>{ const t=T_(G), out=[['印筆記（黑白，約 30 頁）',30]];
    if(t&&t.week>=6) out.push(['印報告＋釘書（約 40 頁）',50]);   /* 學期中第 6 週以後才有報告 */
    if(t&&((/S1$/.test(t.id)&&t.week>=2&&t.week<=5)||(/S2$/.test(t.id)&&t.week>=10&&t.week<=14))) out.push(['彩色海報（A3）',80]);   /* 社團活動的季節 */
    return out; };
  S.PRINT_LINES=['你印了一份{科目}的整理。紙還是熱的。','影印機吐出最後一張。你把它疊整齊，邊角對好。','阿芃在角落寫功課，抬頭看了你一眼，又低下去。','你印的是{科目}的筆記。第三頁的字太小，你縮放了一次。'];
  S.PRINT_EXAM=['前面排了七個人。大家印的，好像都是同一份考古題。','阿德：「這週大家都在印{科目}。」'];
  S.PRINT_LATE='店裡只剩你和影印機的聲音。阿德在櫃檯後面打了一個哈欠。';   /* 考試週 22:00 以後 */
  S.subject=G=>{ const t=T_(G); if(!t||typeof CLS==='undefined'||!CLS.termCourses) return null; const cs=CLS.termCourses(G,t.id); return cs.length?cs[Math.floor(Math.random()*cs.length)].name:null; };
  /* 印完的旁白：照池輪流，同一週不重複；{科目}＝這學期有修的一門課（隨機）*/
  S.printLine=G=>{ const t=T_(G), r=S.rec(G), sub=S.subject(G), wk=t?t.id+':'+t.week:'break:'+Math.floor(G.day/7);
    if(r.printWk!==wk){ r.printWk=wk; r.printUsed=[]; }
    let pool=t&&t.exam?S.PRINT_EXAM.slice():S.PRINT_LINES.slice(); if(t&&t.exam&&hr(G)>=22) pool.push(S.PRINT_LATE);
    if(!sub) pool=pool.filter(l=>!/\{科目\}/.test(l));
    let cand=pool.filter(l=>!r.printUsed.includes(l)); if(!cand.length){ r.printUsed=r.printUsed.filter(l=>!pool.includes(l)); cand=pool; }
    const l=cand[Math.floor(Math.random()*cand.length)]; r.printUsed.push(l); return l.replace(/\{科目\}/g,sub||''); };
  S.STATIONERY=[['螢光筆（黃）',35,'新的螢光筆。你在想第一個要畫的是哪一條。'],['原子筆（藍、黑兩支）',20,'兩支。一支一定會不見。'],
                ['便利貼',30,'一疊便利貼。你已經想好第一張要寫什麼了。'],['透明資料夾（A4）',15,'你把剛印好的東西放進去。看起來比較像回事了。']];   /* 只是一句旁白，不放進背包 */

  // ---------- 4. AA_364 的四家（AA 2026-10-21 d7708ebe 第 1～4 節＋2026-10-22 d56da150 第 5 節＋5ae04087 第 5 節第 5 點，劇情匯入白名單 docs/handoff/story_import_allow.json；WZ-SHOP-AA364-SYS）----------
  /* 林家乾麵（區域 wz_lin）、巷子裡定食（wz_teishoku）：走進店裡內用（室內、座位、店員站的位置：LAWWW2 WZ-SHOP-AA364-ART，src/data/wz_shops_layout.js）；
     巷口茶飲、夏日冰菓室：溫州街 B5 騎樓的外帶窗口（不是區域：店員在窗口，點完拿了就走）。巷口書房照現在（只看櫥窗）。
     - 菜單、價錢：第 2 節照抄；林家多貢丸湯 30（第 5 節第 2 點：和明軒「小碗乾麵＋貢丸湯 70」對上）。wall＝牆上菜單那一行（「看菜單」唸它）。
       營業時間在 src/data/places.js（wz_lin、wz_teishoku、wz_tea、wz_ice；冰菓室只在 5～9 月開）；芒果冰只在 6～8 月。
     - 店員：第 3 節照抄（compact，不叫名字：說話的人寫「老闆」「店員」「老闆娘」）。第 1～4 次＝「第一次」那一欄（一般的招呼，每次都說）；
       第 5 次起每次都換成「認得你以後」那一句（第 5 節第 3 點；林家照上次點的換：乾麵（小）／乾麵（大）／不是乾麵＝「一樣的？」）。
     - 第 5 次起選單多「老樣子」（src/eat3d.js 的 EAT.choose，WZS.eatReg 登記），選了店員回 same（第 5 節第 4 點）；上次點的現在買不到（冰菓室 6～8 月以外的芒果冰）就不列。
     - 點完：「（你點了{品名}。）」（AA_280 共用的那一句，LANE118_SHOPS.orderLine；第 5 節第 1 點：四家都用）→ 第一次的旁白（只有那間店第一次，AA_329 第 2 節的做法，firstLine）
       → 吃完的旁白（一個人，done）。內用＝坐到最近的空位（和半熟一樣，seated）、吃 40 分鐘（118 巷的吃飯時間），有認識的人在吃＝問一起吃（AA_329，一起吃了就不說 done）；
       外帶＝在窗口拿了就走（飲料 5 分鐘，照 118 巷手搖飲；剉冰 10 分鐘），不問一起吃（騎樓沒有位子）。手機「吃過的」四家都記（店名、品項、日期）。
     - 冰菓室 10～4 月：窗口換成「看夏日冰菓室」，只有那一句旁白（第 3 節）。
     - 不扣時段次數（AA_160 2-3），錢照價錢扣；味噌湯續一碗不是單點的東西（AA_364 第 5 節第 5 點：點餐選單沒有，牆上的菜單照寫、吃定食就有湯）。 */
  const M68=G=>{ const m=month(G); return m>=6&&m<=8; };   /* 芒果的季節（6～8 月）*/
  S.AA364={
    lin:{zone:'wz_lin',key:'林家乾麵',who:'老闆',first:'內用外帶？',known:(G,last)=>last==='乾麵（小）'?'小的，不加辣。對吧。':(last==='乾麵（大）'?'大的，不加辣。對吧。':'一樣的？'),dine:true,h:40/60,
      menu:[['乾麵（小）',40],['乾麵（大）',55],['餛飩湯',40],['貢丸湯',30],['燙青菜',35],['滷蛋',15]],wall:'乾麵（小）40／乾麵（大）55／餛飩湯 40／貢丸湯 30／燙青菜 35／滷蛋 15',
      same:'好。一樣。',firstLine:'（攤子前面只有三張小桌子。老闆煮麵的時候，沒有抬頭。）',done:'（你吃完的時候，老闆已經在煮下一碗了。）'},
    teishoku:{zone:'wz_teishoku',key:'巷子裡定食',who:'店員',first:'幾位？這邊坐。',known:'今天的魚很好喔。',dine:true,h:40/60,
      menu:[['薑汁燒肉定食',180],['鹽烤鯖魚定食',190],['炸雞定食',170]],wall:'薑汁燒肉定食 180／鹽烤鯖魚定食 190／炸雞定食 170／味噌湯續一碗 免費',
      same:'好，一樣的定食。',firstLine:'（店裡只有八個位子。牆上貼著：「味噌湯免費續，但不要浪費。」）',done:'（你續了一碗味噌湯。比第一碗還燙。）'},
    tea:{zone:'wz_tea',key:'巷口茶飲',who:'店員',first:'甜度冰塊？',known:'半糖少冰？',dine:false,h:5/60,
      menu:[['紅茶',30],['青茶',30],['珍珠奶茶',55],['冬瓜檸檬',45]],
      same:'好，一樣的。',firstLine:'（窗口的菜單只有四樣。你點完，後面已經排了兩個人。）',done:'（你拿著飲料，沿著溫州街走回去。）'},
    ice:{zone:'wz_ice',key:'夏日冰菓室',who:'老闆娘',first:'冰要大碗小碗？',known:G=>M68(G)?'又來了啊。今天芒果很甜。':'又來了啊。',dine:false,h:10/60,
      menu:[['芒果冰',140,M68],['紅豆牛奶冰',70],['綜合剉冰',60]],shutter:'（鐵捲門拉著。上面貼了一張紙：「五月見」。）',
      same:'好。一樣的。',firstLine:'（價目表是手寫的。芒果冰那一行旁邊，用紅筆寫著「六到八月」。）',done:'（冰化得比你吃得快。最後幾口，你是用喝的。）'}
  };
  /* 登記到 src/eat3d.js（EAT.addShop）：吃過的店名「溫州街・<店名>」、店員（第 5 次那一句不說：熟客的招呼這裡自己演；老樣子的回答）、第一次的旁白、
     沒有回收台（內用兩家：林家是麵攤、定食是店員帶位的店，一起吃的結尾在店門口分開）。點餐前登記（eat3d.js 在這個檔之後才載入）*/
  S.eatReg=function(){ if(typeof EAT==='undefined'||!EAT.addShop) return null; for(const k of Object.keys(S.AA364)){ const D=S.AA364[k];
      if(!(EAT.SHOPS_X&&EAT.SHOPS_X[D.key])) EAT.addShop(D.key,{shop:'溫州街・'+D.key,staff:{who:D.who,line5:null,same:D.same,alt:null},first:D.firstLine,door:!!D.dine}); }
    return EAT; };
  /* 外帶窗口的位置（溫州街世界座標；LAWWW2 交件 README test_shots/wz_aa364_1022「外帶窗口：給 LAWWW 的座標」）：x、z＝點餐的人站的地方（騎樓，走得到）；
     clerk＝店員（店裡，導航格不能站，不 unstick）；shutter＝冰菓室 10～4 月看鐵捲門的地方。zones3d.js 的溫州街照這裡加按鈕（S.windowItems），story3d.js 照這裡放店員 */
  S.WINDOW={tea:{x:17.4,z:-7.35,clerk:{x:16.8,z:-9.2,yaw:0}},ice:{x:24.4,z:-7.4,clerk:{x:24.4,z:-9.3,yaw:0},shutter:{x:26.5,z:-7.4}}};
  S.inSeason=(k,G)=>typeof PLACES==='undefined'||!PLACES.inSeason||PLACES.inSeason(S.AA364[k].zone,G.day);   /* 冰菓室 5～9 月；其他三家整年 */
  S.isOpen364=(k,G)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(S.AA364[k].zone,hr(G),G.day);
  S.menu364=(k,G)=>S.AA364[k].menu.filter(m=>!m[2]||m[2](G));
  /* 店員的招呼：這一次點的是第 5 次以上＝店員認得你（「認得你以後」那一句；林家照上次點的、冰菓室照月份）；不然「第一次」那一欄 */
  S.greet364=(k,G)=>{ const D=S.AA364[k], E_=typeof EAT!=='undefined'&&EAT.count?EAT:null, kn=!!E_&&E_.count(G,D.key)>=4; if(!kn) return D.first;
    const last=E_.rec?(E_.rec(G).last[D.key]||null):null; return typeof D.known==='function'?D.known(G,last):D.known; };
  /* 溫州街騎樓的按鈕（zones3d.js 建溫州街時加）：茶飲「買一杯飲料」；冰菓室 5～9 月「買一碗冰」、10～4 月「看夏日冰菓室」（hidden 照現在的遊戲月份）。
     「看」和溫州街其他「看櫥窗」一樣是 look（game3d.js 的字幕；騎著腳踏車不用下車）*/
  S.windowItems=function(){ const W=S.WINDOW, ice=()=>{ const G=typeof GAME!=='undefined'&&GAME.G; return !G||S.inSeason('ice',G); };
    return [{x:W.tea.x,z:W.tea.z,radius:1.4,label:'買一杯飲料',wzShop:'tea',kind:'window'},
      {x:W.ice.x,z:W.ice.z,radius:1.4,label:'買一碗冰',wzShop:'ice',kind:'window',get hidden(){ return !ice(); }},
      {x:W.ice.shutter.x,z:W.ice.shutter.z,radius:1.4,label:'看夏日冰菓室',look:S.AA364.ice.shutter,get hidden(){ return ice(); }},
      {x:W.ice.x+1.0,z:W.ice.z,radius:1.0,label:'看價目板',wzShop:'ice',kind:'board',get hidden(){ const G=typeof GAME!=='undefined'&&GAME.G; return !(G&&typeof SIDEQ!=='undefined'&&SIDEQ.boardOpen&&SIDEQ.boardOpen(G)); }}]; };   /* 順手的事 SQ03（AA_397）：掛著那一則的時候才有 */
  /* 店員要不要站在窗口（story3d.js 進溫州街時放）：開門的時候才在（冰菓室 10～4 月鐵捲門拉著） */
  S.windowClerk=(k,G)=>S.inSeason(k,G)&&S.isOpen364(k,G);
  /* 點餐：關門＝和其他店一樣寫開放時間、下次開門（toast）→ 店員招呼 → 選單（老樣子）→ 扣錢 →「（你點了{品名}。）」→ 時間 → 吃過的＋第一次的旁白
     → 內用有認識的人在吃＝問一起吃 → 吃完的旁白（一起吃了就不說）*/
  S.order364=async function(GM,k){ const G=GM.G, D=S.AA364[k]; if(!D) return false; S.eatReg();
    if(D.shutter&&!S.inSeason(k,G)){ await GM.say(null,D.shutter); return false; }   /* 冰菓室 10～4 月（按鈕已經換成「看」；保險）*/
    if(!S.isOpen364(k,G)){ GM.toast(PLACES.closedText(D.zone,hr(G),G.day),4500); return false; }
    const E_=typeof EAT!=='undefined'?EAT:null, who={name:D.who};
    const sqG=typeof SIDEQ!=='undefined'&&SIDEQ.greet?SIDEQ.greet(G,D.key):null;   /* 順手的事 SQ01 做完以後，林家老闆的招呼一次（AA_397）*/
    await GM.say(who,sqG||S.greet364(k,G));
    const items=S.menu364(k,G), opts=items.map(m=>({t:m[0]+'　'+(m[1]?m[1]+' 元':'免費'),dim:(G.money|0)<m[1]})); opts.push({t:'不用了'});
    const i=E_?await E_.choose(GM,D.key,opts,items.map(m=>m[0]),items.map(m=>m[1])):await GM.choose(opts);   /* 第 5 次起多「老樣子」（src/eat3d.js）*/
    if(i==null||i>=items.length) return false; const [nm,p]=items[i]; if((G.money|0)<p){ GM.toast('錢不夠'); return false; }
    if(p) GM.money(-p);
    const ol=typeof LANE118_SHOPS!=='undefined'&&LANE118_SHOPS.orderLine;
    const run=async()=>{ if(ol) await GM.say(null,ol.replace('{品名}',nm)); if(k==='tea'&&typeof FAV!=='undefined'&&FAV.wzTea) await FAV.wzTea(GM);   /* 和可昕的學期末約會出發前一小時內：「帶一杯給可昕」（src/foodfav3d.js，AA_410）*/ GM.advance(D.h); let tg=false;
      if(E_){ if(D.dine) tg=await E_.after(GM,D.key,nm); else await E_.ordered(GM,D.key,nm); }   /* 內用：吃過的＋一起吃（AA_329）；外帶：只記吃過的 */
      if(!tg&&D.done) await GM.say(null,D.done); };   /* 吃完（一個人）的旁白（第 5 節第 4 點）；一起吃了＝結尾換成一起吃的那一句 */
    if(D.dine) await seated(GM,run); else await run();
    if(typeof SIDEQ!=='undefined'&&SIDEQ.atShop){ try{ await SIDEQ.atShop(GM,D.key,{item:nm,price:p}); }catch(e){ console.warn('SIDEQ',e); } }   /* 順手的事：店員偶爾多一句（AA_397）*/
    if(GM.autosave) GM.autosave(); return true; };

  // ---------- 共用：品項＋價錢的選單 ----------
  /* 點完坐下來吃（2026-10-18 使用者：「溫州街店面點餐是站著吃完？」）：找最近的空位（GM.freeSeat），黑幕裡坐好，吃完站起來；已經坐著就不換位子；沒有空位照舊 */
  async function seated(GM,fn){ const E=GM.E, P=E&&E.player; if(!P||P.seat||!GM.sitAt){ await fn(); return; } const pp=P.obj.position; let best=null, bd=1e9;
    for(const s of ((E.zone&&E.zone.seats)||[])){ const f=GM.freeSeat?GM.freeSeat(s):s; if(!f) continue; const d=Math.hypot(f.x-pp.x,f.z-pp.z); if(d<bd){ bd=d; best=f; } }
    if(!best){ await fn(); return; } await GM.fade(true); GM.sitAt(P,best); await GM.fade(false);
    try{ await fn(); } finally { if(GM.standUp) GM.standUp(P); } }
  S._seated=seated;
  async function buy(GM,items,h,after,sit,key){ const G=GM.G; const opts=items.map(it=>({t:it[0]+'　'+it[1]+' 元',dim:G.money<it[1]})); opts.push({t:'不用了'});
    const i=key&&typeof EAT!=='undefined'?await EAT.choose(GM,key,opts,items.map(x=>x[0]),items.map(x=>x[1])):await GM.choose(opts);   /* key：店員認得你、老樣子、吃過的、一起吃（src/eat3d.js，AA_329）*/ if(i>=items.length) return null; const it=items[i]; if(G.money<it[1]){ GM.toast('錢不夠'); return null; }
    GM.money(-it[1]); const hh=typeof h==='function'?h(it):h; const run=async()=>{ if(hh) GM.advance(hh); const tg=key&&typeof EAT!=='undefined'?await EAT.after(GM,key,it[0]):false; if(after&&!tg) await after(it); };   /* 一起吃了＝結尾換一起吃的那一句 */
    if(sit) await seated(GM,run); else await run(); return it; }

  /* 順手的事（src/sideq3d.js，AA_404 SQ14、AA_405 SQ20）：一盞茶屋、半熟早午餐點完（真的買了）叫 SIDEQ.atShop */
  async function sideq(GM,key,it){ if(!it||typeof SIDEQ==='undefined'||!SIDEQ.atShop) return; try{ await SIDEQ.atShop(GM,key,{item:it[0],price:it[1]}); }catch(e){ console.warn('SIDEQ',e); } }
  S.interact=async function(GM,it){ const G=GM.G, k=it.wzShop, kind=it.kind; GM.sceneBegin();
    try{
      if(k==='brunch'&&kind==='cashier'){ const it=await buy(GM,S.BRUNCH,40/60,async x=>{ await GM.say(null,x[2]); const j=job(G,'brunch'); if(j&&j.lv>=3){ const r=S.rec(G); r.brunchW=((r.brunchW|0)+1)%S.BRUNCH_WORK.length; await GM.say(null,S.BRUNCH_WORK[r.brunchW]); } },true,'溫州街・半熟'); await sideq(GM,'溫州街・半熟',it); }
      else if(k==='brunch'&&kind==='chalkboard'){ for(const l of S.boardLines(G)) await GM.say(null,l); }
      else if(k==='teahouse'&&kind==='tea'){ if(typeof SIDEQ!=='undefined'&&SIDEQ.ask8) await SIDEQ.ask8(GM,'su');   /* 順手的事 SQ08：問蘇姨（下午）*/ const it=await buy(GM,S.teaMenu(G),x=>x[2],async x=>{ await GM.say(null,x[3]); await GM.say(null,S.teaSeason(G)); const j=job(G,'teahouse'); if(j&&j.lv>=3) await GM.say(null,S.TEA_WORK); },true,'溫州街・一盞'); await sideq(GM,'溫州街・一盞',it); }
      else if(k==='teahouse'&&kind==='garden'){ await GM.say(null,S.gardenLine(G)); }
      else if(k==='teahouse'&&kind==='tokonoma'){ await GM.say(null,S.tokonomaLine(G)); }
      else if(k==='print'&&kind==='print'){ const j=job(G,'print'); if(j&&j.today&&j.lv!=null&&j.shiftNow){ GM.toast('今天是你的班。'); return; }   /* 他的班剛好是那一天：不能當客人（DL-10 接「上班」）*/
        if(j&&j.lv>=1) await GM.say(null,'阿德：「自己印吧。你知道機器在哪裡。」');
        await buy(GM,S.printMenu(G),1/6,async()=>{ await GM.say(null,S.printLine(G)); },false,'阿德影印輸出'); }
      else if(k==='print'&&kind==='stationery'){ await buy(GM,S.STATIONERY,0,async x=>{ await GM.say(null,x[2]); }); }
      else if(S.AA364[k]&&kind==='menu'&&S.AA364[k].wall){ await GM.say(null,S.AA364[k].wall); const sw=typeof SIDEQ!=='undefined'&&SIDEQ.wallExtra?SIDEQ.wallExtra(G,S.AA364[k].key):null; if(sw) await GM.say(null,sw); }   /* SQ01 做完：牆上多一行手寫（AA_397）*/
      else if(k==='ice'&&kind==='board'){ if(typeof SIDEQ!=='undefined'&&SIDEQ.iceBoard) await SIDEQ.iceBoard(GM); }   /* SQ03：看價目板、選誰來寫 */   /* AA_364：看菜單（林家牆上的紅紙、定食店吧台上方的木札），0 分鐘 */
      else if(S.AA364[k]){ await S.order364(GM,k); }   /* AA_364：點餐（林家攤車旁、定食店結帳台、騎樓的窗口）；冰菓室 10～4 月的「看」＝鐵捲門那一句 */
    } finally { GM.sceneEnd(); } };
  return S;
})();
