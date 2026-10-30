/* ===== 地點資料（2026-10-11）：區域名稱、開放時間、大地圖的地名 =====
   使用者實機回報：早上七點多去總圖只寫「閉館了」，不知道幾點開；入口不明顯；點小地圖要能看整張地圖。
   - 開放時間：只寫遊戲真的有檢查的地方（story3d.js 的 onInteract 擋門用同一份，檢查和畫面上寫的永遠一致）。
     其他店家目前整天都進得去，不另外製造門檻（CLAUDE.md 合作規範第 5 點）；便利商店標 24 小時只是說明。
   - 地名座標：區域座標（x 往東、−z 往北；公館的區域座標轉過方向，大地圖照 zones3d.js 的 sunYaw 轉成北朝上），
     和 zones3d.js 擺建築的位置相同；搬建築時這裡一起改。入口不用寫在這裡：大地圖和入口標記直接讀區域的出口互動點。 */
const PLACES={
  names:{ gongtong:'共同教學館', boya:'博雅教學館', putong:'普通教學館', campus:'台大校園', gongguan:'公館', wenzhou:'溫州街', lane118:'118 巷', cafe:'兩點半 Café', cvs:'日日便利', noodle:'阿鳳麵店', bookstore:'舊路書房', wz_brunch:'半熟', wz_print:'阿德影印輸出', wz_teahouse:'一盞', wz_lin:'林家乾麵', wz_teishoku:'巷子裡定食', wz_tea:'巷口茶飲', wz_ice:'夏日冰菓室', gym:'綜合體育館', gym_b1:'綜合體育館 B1',
    linze:'霖澤館', linze_3f:'霖澤館 3F 討論區', linze_4f:'霖澤館 4F 自習討論區', classroom:'霖澤館 201 教室', wancai:'萬才館', library_hall:'總圖書館', library:'總圖 3F 閱覽區', library_b1:'總圖 B1 自習室・討論室', library_carrels:'總圖 2F 研究小間', library_stacks:'總圖 5F 書庫', lawlib:'法律學院圖書館', soclib:'社科院圖書館', dorm:'宿舍房間', dorm_hall:'男生宿舍' },
  // open／close：小時（close 超過 24＝隔天凌晨）；text：畫面上寫的時間
  hours:{ cafe:{open:11,close:26.5,text:'11:00–02:30'}, library_hall:{open:8,close:22,text:'08:00–22:00'}, library:{open:8,close:22,text:'08:00–22:00'}, library_carrels:{open:8,close:22,text:'08:00–22:00'}, library_stacks:{open:8,close:22,text:'08:00–22:00'}, lawlib:{ rules:{ term:{wd:[8+10/60,21.75],we:[9+10/60,17]}, break:{wd:[9+10/60,17],we:null}, holiday:null },
      text:'學期間 週一至五 08:10–21:45、週六日 09:10–17:00；寒暑假 週一至五 09:10–17:00（週末不開）；國定、校定假日不開' },
    /* 社科院 辜振甫先生紀念圖書館（D62，使用者 2026-10-14 查證館方網頁 https://web.lib.ntu.edu.tw/koolib/about/hours.html）：週六、週日的時間不一樣（sat／sun）。
       遊戲裡只有一樓開架閱覽室，用閱覽室的時間；樓層、借還書服務各自的時間等遊戲做了那些功能再分開。特殊公告（臨時閉館、考試期間延長）沒有做 */
    soclib:{ rules:{ term:{wd:[8+20/60,22],sat:[9,22],sun:[9,17]}, break:{wd:[8+20/60,21],sat:[9,17],sun:null}, holiday:null },
      text:'學期間 週一至五 08:20–22:00、週六 09:00–22:00、週日 09:00–17:00；寒暑假 週一至五 08:20–21:00、週六 09:00–17:00（週日不開）；國定、校定假日不開' }, cvs:{text:'24 小時'},
    /* 溫州街三家新店（AA_164 1-2，AA-B 定）：照星期（week[0]＝週日）；影印店考試週（第 8～9、16 週）開到 24:00。shop：關門的說明寫「開門」「公休」，不推薦去總圖 */
    wz_brunch:{shop:true,rules:{week:[[7.5,15],null,[8,15],[8,15],[8,15],[8,15],[7.5,15]]},text:'週二～週日 08:00–15:00（週末 07:30 開）；週一公休'},
    wz_print:{shop:true,rules:{week:[null,[9,22],[9,22],[9,22],[9,22],[9,22],[9,22]],examClose:24},text:'週一～週六 09:00–22:00（考試週開到 24:00）；週日公休'},
    wz_teahouse:{shop:true,rules:{week:[[12,20],null,null,[12,20],[12,20],[12,20],[12,20]]},text:'週三～週日 12:00–20:00；週一、週二公休'},
    /* 溫州街其他四家（AA_364 第 2 節，AA 2026-10-21 d7708ebe）：林家乾麵、巷子裡定食能進去內用（區域 wz_lin、wz_teishoku）；巷口茶飲、夏日冰菓室是騎樓的外帶窗口（不是區域，src/wzshops3d.js 的點餐擋）。
       一天兩段的店（午餐、晚餐）：那一天寫 [[開, 關], [開, 關]]。months：只有這幾個月開（夏日冰菓室 5～9 月；10～4 月鐵捲門拉著，AA_164 1-2）*/
    wz_lin:{shop:true,rules:{week:[[[11,14],[17,21]],null,[[11,14],[17,21]],[[11,14],[17,21]],[[11,14],[17,21]],[[11,14],[17,21]],[[11,14],[17,21]]]},text:'11:00–14:00、17:00–21:00；週一公休'},
    wz_teishoku:{shop:true,rules:{week:[[[11.5,14],[17.5,20.5]],[[11.5,14],[17.5,20.5]],null,[[11.5,14],[17.5,20.5]],[[11.5,14],[17.5,20.5]],[[11.5,14],[17.5,20.5]],[[11.5,14],[17.5,20.5]]]},text:'11:30–14:00、17:30–20:30；週二公休'},
    wz_tea:{shop:true,rules:{week:[[10,22],[10,22],[10,22],[10,22],[10,22],[10,22],[10,22]]},text:'每天 10:00–22:00'},
    wz_ice:{shop:true,rules:{week:[[12,21],null,[12,21],[12,21],[12,21],[12,21],[12,21]],months:[5,6,7,8,9]},text:'5～9 月 12:00–21:00；週一公休'},
    /* 美國交換：大超市對面的竹葉亞洲超市（AA_370 L9：照台詞「亞洲超市九點關。」、結帳台的「週日公休」；開門照 AA_291 第 3 節 10:00，AA_370 第 6 節第 2 題）；擋門在 us_life3d.js 的 S.interact（從草原超市過馬路）*/
    us_asian_market:{shop:true,rules:{week:[null,[10,21],[10,21],[10,21],[10,21],[10,21],[10,21]]},text:'週一～週六 10:00–21:00；週日公休'} },
  /* 法律學院圖書館（D53，使用者 2026-10-13 查證台大法律圖書館官網）：依日曆（src/data/calendar.js）分學期間／寒暑假／國定假日、平日／週末。
     rules 的時間：[開, 關]（小時）；null＝不開。其他地點照舊是每天同一個時間（open／close） */
  /* 有 rules 的地點：這一天的開放時間 [開, 關]、或 null（不開）。day 沒給就用現在的遊戲日（GAME.G.day）。
     一天兩段的店（AA_364：林家乾麵、巷子裡定食）：h＝那個時間在的那一段；兩段中間＝剛關的那一段（閉館前停下、「先離開再跳過時間」照這一段）；第一段開始以前＝第一段。
     h 沒給：那一天是今天就用現在的遊戲時間，不然第一段。整天的時段表用 windowsOf */
  windowOf(zone,day,h){ const o=PLACES.hours[zone]; if(!o||!o.rules) return undefined; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1;
    if(o.rules.week){ const ws=PLACES.windowsOf(zone,day); if(!ws) return null; if(ws.length===1) return ws[0];   /* 店家：照星期 */
      if(h==null&&typeof GAME!=='undefined'&&GAME.G&&GAME.G.day===day) h=GAME.G.hour; if(h==null) return ws[0]; h=((h%24)+24)%24;
      let cur=ws[0]; for(const w of ws) if(h>=w[0]-1e-6) cur=w; return cur; }
    if(typeof CALENDAR==='undefined') return o.rules.term.wd;
    const k=CALENDAR.kind(day); if(k==='holiday') return o.rules.holiday||null; const r=o.rules[k]; if(!r) return null; if(!CALENDAR.weekend(day)) return r.wd;
    const wd=CALENDAR.dateOf(day).wd; if(wd===6&&'sat' in r) return r.sat; if(wd===7&&'sun' in r) return r.sun; return r.we; },   /* 週六、週日不一樣的地點寫 sat／sun（社科院圖書館）；一樣的寫 we */
  /* 這一天所有的開放時段 [[開, 關], …]（照時間先後）、或 null（不開）；只有一段的地點＝[windowOf]。店家的 months：不在這幾個月＝整天不開 */
  windowsOf(zone,day){ const o=PLACES.hours[zone]; if(!o||!o.rules) return undefined; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1;
    if(!o.rules.week){ const w=PLACES.windowOf(zone,day); return w?[w]:null; }
    if(!PLACES.inSeason(zone,day)) return null;
    const w=typeof CALENDAR==='undefined'?(o.rules.week[1]||o.rules.week[3]):o.rules.week[CALENDAR.dateOf(day).wd%7]; if(!w) return null;
    const ws=(typeof w[0]==='number'?[w]:w).map(x=>x.slice());
    if(o.rules.examClose&&typeof CALENDAR!=='undefined'){ const t=CALENDAR.termOf(day); if(t&&t.exam) ws[ws.length-1]=[ws[ws.length-1][0],o.rules.examClose]; }   /* 影印店考試週開到 24:00 */
    return ws; },
  /* 這一天在不在開店的月份（rules.months；沒寫＝整年）：夏日冰菓室 5～9 月 */
  inSeason(zone,day){ const o=PLACES.hours[zone], M=o&&o.rules&&o.rules.months; if(!M) return true; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; if(typeof CALENDAR==='undefined') return true; return M.includes(CALENDAR.dateOf(day).m); },
  /* 颱風假店家不開（AA_160 3-4 D，AA-B 2026-10-16：颱風假不能搭捷運、店家不開、不能打工、不能回家）；便利商店照開 */
  typhoonShops:['cafe','noodle','bookstore','wz_brunch','wz_print','wz_teahouse','wz_lin','wz_teishoku','wz_tea','wz_ice'],
  typhoonClosed(zone,day){ if(!PLACES.typhoonShops.includes(zone)) return false; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G)?GAME.G.day:null; return day!=null&&typeof CALENDAR!=='undefined'&&!!CALENDAR.typhoon&&CALENDAR.typhoon(day); },
  isOpen(zone,h,day){ if(PLACES.typhoonClosed(zone,day)) return false; const o=PLACES.hours[zone]; if(!o) return true; if(h<0||h>=24) h=((h%24)+24)%24; if(o.rules){ const ws=PLACES.windowsOf(zone,day); return !!ws&&ws.some(w=>h>=w[0]-1e-6&&h<w[1]-1e-6); }   /* 1e-6：08:10 剛好的時候（8+10/60 的浮點誤差）算開；一天兩段的店：在任何一段裡都算開 */ if(o.open==null) return true; return o.close>24?(h>=o.open||h<o.close-24):(h>=o.open&&h<o.close); },
  hhmm(x){ return String(Math.floor(x+1e-6)).padStart(2,'0')+':'+String(Math.round((x%1)*60)%60).padStart(2,'0'); },
  /* 今天的開放時間（一行）：「今天 08:10–21:45」「今天不開放（國定假日）」；沒有 rules 的地點＝原本的 text */
  todayText(zone,day){ const o=PLACES.hours[zone]; if(!o) return ''; if(!o.rules) return o.text||''; const ws=PLACES.windowsOf(zone,day); if(ws&&ws.length) return '今天 '+ws.map(w=>PLACES.hhmm(w[0])+'–'+PLACES.hhmm(w[1])).join('、');   /* 一天兩段：「今天 11:00–14:00、17:00–21:00」 */
    if(o.shop) return '今天公休';
    if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; const hn=typeof CALENDAR!=='undefined'&&CALENDAR.holiday(day); const wn=typeof CALENDAR!=='undefined'?['','週一','週二','週三','週四','週五','週六','週日'][CALENDAR.dateOf(day).wd]:'';
    return '今天不開放'+(hn?'（'+hn+'）':(typeof CALENDAR!=='undefined'&&!CALENDAR.termOf(day)?'（寒暑假的'+wn+'）':'')); },   /* 「寒暑假的週日」：社科院圖書館寒暑假週六有開、週日不開，不能寫「週末」 */
  // 閉館時的說明：開放時間＋幾點開（今天還是明天）
  closedText(zone,h,day){ const o=PLACES.hours[zone], nm=PLACES.names[zone]||zone; if(PLACES.typhoonClosed(zone,day)) return nm+'：颱風假，今天沒開。'; if(o&&o.rules){ if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; h=((h%24)+24)%24;
      /* 下一次開館：今天還沒開（或兩段中間：今天晚上那一段）＝今天；不然往後找（最多兩週：寒假可能連著好幾天不開）*/ let nx=null; const ws0=PLACES.windowsOf(zone,day), w0=ws0&&ws0.find(w=>h<w[0]); if(w0) nx=[0,w0[0]]; else for(let k=1;k<=14&&!nx;k++){ const ws=PLACES.windowsOf(zone,day+k); if(ws&&ws.length) nx=[k,ws[0][0]]; }
      const wdn=['','週一','週二','週三','週四','週五','週六','週日']; let when=''; if(nx){ if(nx[0]===0) when='今天'; else if(nx[0]===1) when='明天'; else if(typeof CALENDAR==='undefined') when=nx[0]+' 天後'; else { const a=CALENDAR.dateOf(day), b=CALENDAR.dateOf(day+nx[0]); when=nx[0]<=6?((a.wd+nx[0]<=7?'這':'下')+wdn[b.wd]):(b.m+'/'+b.d+'（'+wdn[b.wd]+'）'); } when+=' '+PLACES.hhmm(nx[1]); }
      const alt=o.shop?'':(PLACES.isOpen('library_hall',h,day)?'可以去總圖（開到 22:00），或回宿舍讀書。':'可以回宿舍讀書。');
      const tt=PLACES.todayText(zone,day); return nm+(/^今天(不開放|公休)/.test(tt)?' '+tt:' 現在沒有開（'+tt+'）')+'。'+(when?(o.shop?'下次開門：':'下次開館：')+when+'。':'')+alt; }   /* 整天不開：「社科院圖書館 今天不開放（寒暑假的週日）。」（不套兩層括號）*/
    if(!o||o.open==null) return nm; h=((h%24)+24)%24; const hh=String(Math.floor(o.open)).padStart(2,'0')+':'+String(Math.round((o.open%1)*60)).padStart(2,'0');
    const later=o.close>24?(h<o.open&&h>=o.close-24):(h<o.open); return nm+' 開放時間 '+o.text+'。現在沒有開，'+(later?'今天 ':'明天 ')+hh+' 開'+(zone==='cafe'?'門':'館')+'。'; },
  /* 快速前往的地點（D54 ①；手機「地點」與大地圖用同一份）：[區域, 名稱, 落點 {x,z,yaw}（null＝區域預設的出生點）]。
     落點都要站得住、走得出去（tests/quick_travel_unit.js）。建築的落點照 layout 的入口（layout 檔在 places.js 之前載入）*/
  quickList(){ const sp=(L)=>typeof L!=='undefined'?Object.assign({},L.entrance.spawn):null; const L1=typeof LINZE_LAYOUT!=='undefined'?sp(LINZE_LAYOUT):null, LB=typeof LIBRARY_LAYOUT!=='undefined'?sp(LIBRARY_LAYOUT):null, LL=typeof LAWLIB_LAYOUT!=='undefined'?sp(LAWLIB_LAYOUT):null, SC=typeof SOCLIB_LAYOUT!=='undefined'?sp(SOCLIB_LAYOUT):null, GY=typeof GYM_LAYOUT!=='undefined'&&GYM_LAYOUT.spawn?Object.assign({},GYM_LAYOUT.spawn):null;   /* GY：新體育館 1F 大廳（BB-C 10-27 23:4x：體育課、健身房、羽球都在那裡，清單上沒有）*/
    return [['campus','台大校園（霖澤館前）',{x:34,z:-98,yaw:0}],['campus','椰林大道・傅鐘',{x:-38,z:6,yaw:0}],['campus','校門口',{x:-112,z:0,yaw:-Math.PI/2}],['campus','共同教學館',{x:2,z:21.4,yaw:0}],['campus','普通教學館',{x:-38,z:-47.4,yaw:0}],['campus','博雅教學館',{x:-38,z:-71.4,yaw:0}],['campus','大一女舍（門口）',{x:-93,z:56,yaw:0}],GY&&['gym','新體育館（大廳）',GY],
      L1&&['linze','霖澤館（大廳）',L1],['classroom','霖澤館 201 教室',null],['wancai','萬才館（大廳）',{x:0,z:5,yaw:Math.PI}],LL&&['lawlib','法律學院圖書館',LL],LB&&['library_hall','總圖書館（大廳）',LB],SC&&['soclib','社科院圖書館',SC],
      ['gongguan','公館商圈',{x:0,z:-30,yaw:Math.PI}],['gongguan','捷運公館站',{x:-35.6,z:13.2,yaw:0}],['noodle','阿鳳麵店',{x:0,z:3.4,yaw:Math.PI}],['cvs','日日便利',{x:0,z:3.4,yaw:Math.PI}],['bookstore','舊路書房',{x:0,z:4,yaw:Math.PI}],
      ['wenzhou','溫州街',{x:20,z:0,yaw:-Math.PI/2}],['lane118','118 巷',{x:0,z:47.6,yaw:Math.PI}],['cafe','兩點半 Café',{x:0,z:5,yaw:Math.PI}],['dorm','宿舍',{x:0,z:2.5,yaw:Math.PI}]].filter(Boolean); },
  /* 一個區域在哪一棟、哪一條街（PHONE-UNIFY-1030）：樓上樓層、房間、店面對到它的那一棟／那條街（霖澤館 3F→linze、總圖 B1→library_hall、118 巷的店→lane118、溫州街的店→wenzhou、宿舍 205→dorm_hall）；
     其他照原樣。用在：手機「朋友」直接過去的開放時間（那一棟關門＝進不去）、休學退宿以後不回台大、路程的時間（classes3d.js travelMinutes 沒有那一區的位置時照那一棟算）*/
  base(z){ z=String(z||''); if(/^l118_/.test(z)) return 'lane118'; if(/^wz_/.test(z)) return 'wenzhou'; if(z==='library'||/^library_/.test(z)) return 'library_hall'; if(z==='dorm'||/^dorm_/.test(z)) return 'dorm_hall';
    if(/^(linze|wancai|gym|gongtong|boya|putong|us_lawlib)_/.test(z)) return z.replace(/_[^_]+$/,''); return z; },
  /* 「已知」的地點（D54 ①）：開學第三週的大一生本來就知道的地方（校園、上課的教室、圖書館、宿舍、公館、溫州街、便利商店）；
     特定的店（麵店、書店、Café）自己走去過一次才會出現在清單上，留給探索去發現 */
  known0:{campus:1,linze:1,classroom:1,wancai:1,lawlib:1,soclib:1,library_hall:1,library:1,gongguan:1,cvs:1,wenzhou:1,lane118:1,dorm:1,dorm_hall:1,gym:1},   /* gym：體育課（必修）的新體育館，一開始就知道 */   /* 118 巷：法學院後門那條巷子，一開始就知道（使用者 2026-10-20「118巷也要可及時到達吧手機地圖那邊」，X65；落點＝從霖澤館後門走過去的出生點）*/
  // 大地圖上的地名（沒有入口、或想讓玩家認得的地標）
  landmarks:{
    campus:[ ['校門',-120,0], ['椰林大道',-60,0], ['傅鐘',-38,16.5], ['行政大樓',-38,33], ['共同教學館',2,33], ['大一女舍',-93,67], ['文學院',-38,-34], ['農業陳列館',-104,-30], ['校史館',-77,-29],
      ['普通教學館',-38,-58.5], ['博雅教學館',-38,-83], ['醉月湖',-36,-112], ['總圖書館',100,0], ['霖澤館',34,-112], ['萬才館',88,-112], ['社會科學院',2,-85], ['社科院圖書館',2,-54], ['小椰林道',30,-40], ['男生宿舍',20,68] ],
    gongguan:[ ['捷運公館站',-36.6,11], ['羅斯福路',20,-6], ['往溫州街',-71,20], ['台大校門',0,-46] ],
    wenzhou:[ ['兩點半 Café',54.2,0], ['小公園',26,6], ['往公館',51.3,-13.4] ]
  }
};
