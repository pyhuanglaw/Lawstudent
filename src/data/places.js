/* ===== 地點資料（2026-10-11）：區域名稱、開放時間、大地圖的地名 =====
   使用者實機回報：早上七點多去總圖只寫「閉館了」，不知道幾點開；入口不明顯；點小地圖要能看整張地圖。
   - 開放時間：只寫遊戲真的有檢查的地方（story3d.js 的 onInteract 擋門用同一份，檢查和畫面上寫的永遠一致）。
     其他店家目前整天都進得去，不另外製造門檻（CLAUDE.md 合作規範第 5 點）；便利商店都是 24 小時（使用者 11-04 02:1x「所有便利商店都是24小時」，取代 AA_647 第 6 節的 07:00–24:00）。
   - 地名座標：區域座標（x 往東、−z 往北；公館的區域座標轉過方向，大地圖照 zones3d.js 的 sunYaw 轉成北朝上），
     和 zones3d.js 擺建築的位置相同；搬建築時這裡一起改。入口不用寫在這裡：大地圖和入口標記直接讀區域的出口互動點。 */
const PLACES={
  names:{ gongtong:'共同教學館', boya:'博思教學館', putong:'普通教學館', campus:'首都帝大校園', gongguan:'公館', tingzhou:'汀州路', wenzhou:'溫州街', lane118:'118 巷', cafe:'2:30 AM', cvs:'日和便利店', noodle:'公館燒臘', bikeshop:'慢輪單車', aoki:'青木茶室', afar:'afar café', daybreak:'Daybreak', yangyang:'洋洋鹹酥雞', corner_records:'轉角唱片', bookstore:'頁間書屋', wz_brunch:'SUNNY SIDE', wz_print:'阿德影印輸出', xs_tongxian:'同弦樂器', xs_nanyang:'南洋戲院', xs_nanyang_hall:'南洋戲院 1 廳', xs_shanlan:'山嵐書店', xs_dakou:'大口漢堡', xs_dabu:'大步球鞋', xs_haopai:'好拍運動', xs_xsports:'新生運動廣場', wz_teahouse:'一盞', wz_lin:'林家乾麵', wz_teishoku:'小路', wz_tea:'帝大紅茶', wz_books:'溫州書屋', wz_ice:'夏日冰菓室', wz_mokuyobi:'木曜日', wz_offbeat:'日常失速', xinsheng:'新生南路', gym:'綜合體育館', gym_b1:'綜合體育館 B1',
    linze:'法律系館A', linze_3f:'法律系館A 3F 討論區', linze_4f:'法律系館A 4F 自習討論區', classroom:'法律系館A 201 教室', wancai:'法律系館B', library_hall:'總圖書館', library:'總圖 3F 閱覽區', library_b1:'總圖 B1 自習室・討論室', library_carrels:'總圖 2F 研究小間', library_stacks:'總圖 5F 書庫', lawlib:'法律學院圖書館', soclib:'社科院圖書館', dorm:'宿舍房間', dorm_hall:'男生宿舍',
    gg_antai:'安泰藥局', gg_xianguo:'汀州鮮果', gg_rongendian:'榮恩典文具社', tz_taimi:'泰米村食', tz_xile:'洗樂洗衣坊', tz_yindehao:'印得好', tz_yuehaochi:'越好吃小館' },   /* 越好吃小館：TINGZHOU-SHOPS5-1110（AA_821）*/   /* 公館三間＋汀州路三間的室內（GG-SHOPS3-SYS-1110；關門的說明用這個名字）*/
  // open／close：小時（close 超過 24＝隔天凌晨）；text：畫面上寫的時間
  hours:{ cafe:{open:11,close:26.5,text:'11:00–02:30'}, library_hall:{open:8,close:22,text:'08:00–22:00'}, library:{open:8,close:22,text:'08:00–22:00'}, library_carrels:{open:8,close:22,text:'08:00–22:00'}, library_stacks:{open:8,close:22,text:'08:00–22:00'}, lawlib:{ rules:{ term:{wd:[8+10/60,21.75],we:[9+10/60,17]}, break:{wd:[9+10/60,17],we:null}, holiday:null },
      text:'學期間 週一至五 08:10–21:45、週六日 09:10–17:00；寒暑假 週一至五 09:10–17:00（週末不開）；國定、校定假日不開' },
    /* 社科院 辜振甫先生紀念圖書館（D62，使用者 2026-10-14 查證館方網頁 https://web.lib.ntu.edu.tw/koolib/about/hours.html）：週六、週日的時間不一樣（sat／sun）。
       遊戲裡只有一樓開架閱覽室，用閱覽室的時間；樓層、借還書服務各自的時間等遊戲做了那些功能再分開。特殊公告（臨時閉館、考試期間延長）沒有做 */
    soclib:{ rules:{ term:{wd:[8+20/60,22],sat:[9,22],sun:[9,17]}, break:{wd:[8+20/60,21],sat:[9,17],sun:null}, holiday:null },
      text:'學期間 週一至五 08:20–22:00、週六 09:00–22:00、週日 09:00–17:00；寒暑假 週一至五 08:20–21:00、週六 09:00–17:00（週日不開）；國定、校定假日不開' }, cvs:{text:'24 小時'},   /* 公館的便利商店（AA_647 第 6 節：照新圖 07:00～24:00）。只寫說明、門照舊整天進得去：便利商店夜班（週五 22:00～02:00）、「凌晨的便利商店」（00:15）還在用，等 AA 改稿（BIKE-SHOP-PARK-1104 回報）*/
    /* 溫州街三家新店（AA_164 1-2，AA-B 定）：照星期（week[0]＝週日）；影印店考試週（第 8～9、16 週）開到 24:00。shop：關門的說明寫「開門」「公休」，不推薦去總圖 */
    /* 公館第二批（GG-SHOPS2-1104；AA_652 開頭、AA_650 §4）：afar café 每天 11:00–21:00、Daybreak 每天 08:00–15:00（稿上沒寫公休）；颱風天關（typhoonShops）。打烊人在店裡＝src/gg2shops3d.js 請你出來 */
    afar:{shop:true,rules:{week:[[11,21],[11,21],[11,21],[11,21],[11,21],[11,21],[11,21]]},text:'每天 11:00–21:00'},
    daybreak:{shop:true,rules:{week:[[8,15],[8,15],[8,15],[8,15],[8,15],[8,15],[8,15]]},text:'每天 08:00–15:00'},
    /* 洋洋鹹酥雞（AA_650 §4、AA_724：宵夜 17:00～01:00，每天開）：進得去了（區域 yangyang，YANGYANG-IN-1107）；照星期寫（rules）＝關門的說明寫「開門」；17～25＋late＝過了午夜到 01:00（和小路一樣）。
       颱風天關（typhoonShops）；打烊人在店裡＝src/gg2shops3d.js 請你出來；公館窗卡打烊調暗（Z3.ggShopLit）照同一份 */
    yangyang:{shop:true,late:true,rules:{week:[[17,25],[17,25],[17,25],[17,25],[17,25],[17,25],[17,25]]},text:'每天 17:00–01:00'},
    corner_records:{shop:true,rules:{week:[[12,21],[12,21],[12,21],[12,21],[12,21],[12,21],[12,21]]},text:'每天 12:00–21:00'},   /* 轉角唱片（AA_650 §4，照外觀圖的牌子，每天開）：進得去了（區域 corner_records，CORNER-IN-1107；AA_725）；颱風天關（typhoonShops）；打烊人在店裡＝src/gg2shops3d.js 請你出來 */
    aoki:{shop:true,rules:{week:[[11,21],[11,21],[11,21],[11,21],[11,21],[11,21],[11,21]]},text:'每天 11:00–21:00'},   /* 青木茶室（AA_653 §0 B，企劃線 d26fecd2f）：每天 11:00～21:00、沒有公休日；颱風假不開（typhoonShops）。門口外帶照同一個時間；打烊、颱風天門口那一句、21:00 請你出來＝src/ggshops_sys3d.js */
    bikeshop:{shop:true,rules:{week:[[10,20],null,[10,20],[10,20],[10,20],[10,20],[10,20]]},text:'週二～週日 10:00–20:00；週一公休'},   /* 慢輪單車（AA_646 第 1 節：10:00～20:00、週一公休）*/
    wz_brunch:{shop:true,rules:{week:[[7.5,15],null,[8,15],[8,15],[8,15],[8,15],[7.5,15]]},text:'週二～週日 08:00–15:00（週末 07:30 開）；週一公休'},
    wz_print:{shop:true,rules:{week:[null,[9,22],[9,22],[9,22],[9,22],[9,22],[9,22]],examClose:24},text:'週一～週六 09:00–22:00（考試週開到 24:00）；週日公休'},
    wz_teahouse:{shop:true,rules:{week:[[12,20],null,null,[12,20],[12,20],[12,20],[12,20]]},text:'週三～週日 12:00–20:00；週一、週二公休'},
    /* 溫州街其他四家（AA_364 第 2 節，AA 2026-10-21 d7708ebe）：林家乾麵、巷子裡定食能進去內用（區域 wz_lin、wz_teishoku）；巷口茶飲、夏日冰菓室是騎樓的外帶窗口（不是區域，src/wzshops3d.js 的點餐擋）。
       一天兩段的店（午餐、晚餐）：那一天寫 [[開, 關], [開, 關]]。months：只有這幾個月開（夏日冰菓室 5～9 月；10～4 月鐵捲門拉著，AA_164 1-2）*/
    wz_lin:{shop:true,rules:{week:[[[11,21]],null,[[11,21]],[[11,21]],[[11,21]],[[11,21]],[[11,21]]]},text:'11:00–21:00；週一公休'},
    /* 小路（居酒屋，原本的巷子裡定食；AA_655 第 2、4 節，使用者 11-04 04:5x 定 18:00～02:00）：只有晚上，拿掉午餐那一段；18～26＝過了午夜到 02:00（isOpen 照前一天晚上那一段算）。
       公休日照舊是週二（原本的 week[2]＝null）：AA_655 寫「原本週三休：照舊週三休」，可是原本就是週二，學姊七夕 2026-08-19 是週三、要開（sis_qixi3d.js）。門口三句在 src/wzshops3d.js 的 S.teiDoor */
    wz_teishoku:{shop:true,late:true,rules:{week:[[18,26],[18,26],null,[18,26],[18,26],[18,26],[18,26]]},text:'18:00–02:00；週二公休'},
    /* 溫州書屋（原本的巷口書房；AA_658 第 5 節，企劃線 6ee7ea3a5）：不能進去，週二～週日 10:00–20:00、週一公休、颱風天關；櫥窗那一句照這裡換（src/wzshops3d.js S.booksLook）*/
    wz_books:{shop:true,rules:{week:[[10,20],null,[10,20],[10,20],[10,20],[10,20],[10,20]]},text:'10:00–20:00；週一公休'},
    wz_tea:{shop:true,rules:{week:[[10,22],[10,22],[10,22],[10,22],[10,22],[10,22],[10,22]]},text:'每天 10:00–22:00'},
    wz_ice:{shop:true,rules:{week:[[12,21],null,[12,21],[12,21],[12,21],[12,21],[12,21]],months:[5,6,7,8,9]},text:'5～9 月 12:00–21:00；週一公休'},
    /* 木曜日（AA_617 第 3 節，使用者 11-03 同意；區域 wz_mokuyobi，溫州街 B4 二樓）：13:00–22:00、週二公休；颱風天關（typhoonShops）。打烊時人還在店裡＝src/mokuyobi_sys3d.js 請你出來 */
    wz_mokuyobi:{shop:true,rules:{week:[[13,22],[13,22],null,[13,22],[13,22],[13,22],[13,22]]},text:'13:00–22:00；週二公休'},
    /* 日常失速（AA_617 第 3 節；區域 wz_offbeat，溫州街轉角 W2 一樓）：每天 13:00–01:00（跨午夜照兩點半 Café 的 open／close）；颱風天關；打烊人在店裡＝src/offbeat_sys3d.js 請你出來 */
    wz_offbeat:{open:13,close:25,text:'每天 13:00–01:00'},
    /* 同弦樂器（新生南路二樓的吉他行；AA_619 第 1 節，使用者 11-03「安排一家吉他店」；區域 xs_tongxian＝src/tongxian3d.js，GUITAR-SHOP-ZONE-1105）：12:00–21:30、週一公休；颱風天關（typhoonShops）。店門擋在 story3d.js 的 onInteract */
    xs_tongxian:{shop:true,rules:{week:[[12,21.5],null,[12,21.5],[12,21.5],[12,21.5],[12,21.5],[12,21.5]]},text:'週二～週日 12:00–21:30；週一公休'},
    /* 美國交換：大超市對面的竹葉亞洲超市（AA_370 L9：照台詞「亞洲超市九點關。」、結帳台的「週日公休」；開門照 AA_291 第 3 節 10:00，AA_370 第 6 節第 2 題）；擋門在 us_life3d.js 的 S.interact（從草原超市過馬路）*/
    /* 南洋戲院（新生南路的二輪戲院；AA_615 第 3 節：09:30～24:00、每天四場 10:00／13:00／16:00／19:30；區域 xs_nanyang 大廳＋xs_nanyang_hall 1 廳＝src/nanyang3d.js，ART-NANYANG-CINEMA-1103）。
       AA_615 沒寫颱風天，先不關（要關就加進 typhoonShops）。店門擋在 story3d.js 的 interact */
    xs_nanyang:{shop:true,rules:{week:[[9.5,24],[9.5,24],[9.5,24],[9.5,24],[9.5,24],[9.5,24],[9.5,24]]},text:'每天 09:30–24:00'},   /* shop：關著的時候說「下次開門」（不是「開館」）*/
    /* 山嵐書店（新生南路那一排的兩層書店；AA_613 第 3 節：11:00～22:00，週五、週六到 23:00；區域 xs_shanlan＝src/shanlan3d.js，ART-SHANLAN-BOOKSTORE-1103）。
       AA_613 沒寫颱風天，先不關（要關就加進 typhoonShops）。店門擋在 story3d.js 的 interact */
    xs_shanlan:{shop:true,rules:{week:[[11,22],[11,22],[11,22],[11,22],[11,22],[11,23],[11,23]]},text:'週日～週四 11:00–22:00；週五、週六 11:00–23:00'},
    xs_dakou:{text:'24 小時'},   /* 大口漢堡（新生南路南邊路口的速食店；AA_621：24 小時，考試那兩週是大家念書的地方；區域 xs_dakou＝src/dakou3d.js，XS-SHOPS-REST-1105）。只寫說明、店門整天進得去（和便利商店一樣）*/
    /* 大步球鞋、好拍運動（新生南路的一層小店；AA_620 第 1 節；區域 xs_dabu、xs_haopai＝src/xsshop3d.js，XS-SHOPS-REST-1105）*/
    xs_dabu:{shop:true,rules:{week:[[11,22],[11,22],[11,22],[11,22],[11,22],[11,22],[11,22]]},text:'每天 11:00–22:00'},
    xs_haopai:{shop:true,rules:{week:[null,[12,21],[12,21],[12,21],[12,21],[12,21],[12,21]]},text:'週一～週六 12:00–21:00；週日公休'},
    xs_xsports:{shop:true,rules:{week:[[11,22],[11,22],[11,22],[11,22],[11,22],[11,22],[11,22]]},text:'每天 11:00–22:00'},   /* 新生運動廣場（兩層；AA_620 第 1 節；區域 xs_xsports＝src/xsports3d.js，XS-SPORTS-V1-1105）*/
    us_asian_market:{shop:true,rules:{week:[null,[10,21],[10,21],[10,21],[10,21],[10,21],[10,21]]},text:'週一～週六 10:00–21:00；週日公休'},
    /* 公館三間＋汀州路三間的室內（GG-SHOPS3-SYS-1110；AA_742 開頭的表，企劃線 75f5de658；區域＝src/tz_shops3d.js，台詞與打烊＝src/gg3shops3d.js）；颱風天都關（typhoonShops，洗樂照 AA_742「一律關比較穩」）。
       印得好：期末考週和前一週延到 24:00（finalsClose；溫州街阿德影印的 examClose 是期中、期末都延，這間只有期末）；洗樂 24 小時（只寫說明，和便利商店一樣）*/
    gg_antai:{shop:true,rules:{week:[[10,18],[9,22],[9,22],[9,22],[9,22],[9,22],[9,22]]},text:'週一～六 09:00–22:00、週日 10:00–18:00'},
    gg_xianguo:{shop:true,rules:{week:[[10,22],[10,22],[10,22],[10,22],[10,22],[10,22],[10,22]]},text:'每天 10:00–22:00'},
    gg_rongendian:{shop:true,rules:{week:[null,[9.5,21.5],[9.5,21.5],[9.5,21.5],[9.5,21.5],[9.5,21.5],[9.5,21.5]]},text:'週一～六 09:30–21:30；週日公休'},
    tz_taimi:{shop:true,rules:{week:[[[11,21]],null,[[11,21]],[[11,21]],[[11,21]],[[11,21]],[[11,21]]]},text:'11:00–21:00；週一公休'},
    tz_xile:{text:'24 小時'},
    tz_yuehaochi:{shop:true,rules:{week:[[11,21],[11,21],[11,21],[11,21],[11,21],[11,21],[11,21]]},text:'每天 11:00–21:00'},   /* 越好吃小館（TINGZHOU-SHOPS5-1110；AA_821「11:00～21:00」，企劃線 65e38a5de；沒有寫公休＝每天；台詞 src/data/tz_meal_lines.js）*/
    tz_yindehao:{shop:true,rules:{week:[null,[9,22],[9,22],[9,22],[9,22],[9,22],[10,18]],finalsClose:24},text:'週一～五 09:00–22:00、週六 10:00–18:00；週日公休（期末考週和前一週開到 24:00）'} },
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
    if(o.rules.finalsClose&&typeof CALENDAR!=='undefined'&&PLACES.finalsNear(day)) ws[ws.length-1]=[ws[ws.length-1][0],o.rules.finalsClose];   /* 印得好：期末考週和前一週開到 24:00（AA_742）*/
    return ws; },
  /* 這一天在不在開店的月份（rules.months；沒寫＝整年）：夏日冰菓室 5～9 月 */
  inSeason(zone,day){ const o=PLACES.hours[zone], M=o&&o.rules&&o.rules.months; if(!M) return true; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; if(typeof CALENDAR==='undefined') return true; return M.includes(CALENDAR.dateOf(day).m); },
  /* 颱風假店家不開（AA_160 3-4 D，AA-B 2026-10-16：颱風假不能搭捷運、店家不開、不能打工、不能回家）；便利商店照開 */
  /* 期末考週或期末考的前一週（同一個學期；印得好的 finalsClose、src/gg3shops3d.js 的「裝訂期末報告」）*/
  finalsNear(day){ if(typeof CALENDAR==='undefined'||!CALENDAR.termOf) return false; const t=CALENDAR.termOf(day); if(!t) return false; if(t.exam==='final') return true; const n=CALENDAR.termOf(day+7); return !!n&&n.id===t.id&&n.exam==='final'; },
  typhoonShops:['cafe','noodle','bookstore','wz_brunch','wz_print','wz_teahouse','wz_lin','wz_teishoku','wz_tea','wz_ice','wz_books','wz_mokuyobi','wz_offbeat','afar','daybreak','aoki','xs_tongxian','yangyang','corner_records',
    'gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao','tz_yuehaochi'],   /* 公館三間＋汀州路三間（GG-SHOPS3-SYS-1110；洗樂 24 小時也照 AA_742「一律關比較穩」）*/
  typhoonClosed(zone,day){ if(!PLACES.typhoonShops.includes(zone)) return false; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G)?GAME.G.day:null; return day!=null&&typeof CALENDAR!=='undefined'&&!!CALENDAR.typhoon&&CALENDAR.typhoon(day); },
  isOpen(zone,h,day){ if(PLACES.typhoonClosed(zone,day)) return false; const o=PLACES.hours[zone]; if(!o) return true; if(h<0||h>=24) h=((h%24)+24)%24; if(o.rules){ const inW=(ws,x)=>!!ws&&ws.some(w=>x>=w[0]-1e-6&&x<w[1]-1e-6); const ws=PLACES.windowsOf(zone,day); if(inW(ws,h)) return true;
      /* 過午夜的那一段（late：[18,26]＝開到 02:00，小路 AA_655）：遊戲過了午夜還是同一天（G.hour 25，或呼叫的人先 %24 成 1）＝照這一天晚上那一段算（和 cafe 的 close>24 同一個想法）*/
      return !!o.late&&inW(ws,h+24); }   /* 1e-6：08:10 剛好的時候（8+10/60 的浮點誤差）算開；一天兩段的店：在任何一段裡都算開 */ if(o.open==null) return true; return o.close>24?(h>=o.open||h<o.close-24):(h>=o.open&&h<o.close); },
  /* 接在中文字後面的地點名（「和以安約在」＋名字）：英文店名（2:30 AM、SUNNY SIDE）前面空一個半形空格；after＝後面也接中文字（AA_655 第 1 節最後一列）*/
  at(n,after){ n=String(n==null?'':n); const L=/^(2:30 AM|SUNNY SIDE)$/.test(n); return (L?' ':'')+n+(after&&L?' ':''); },   /* 只管這兩個（afar café、Daybreak 照原本的寫法）*/
  hhmm(x){ if(x>24+1e-6) x-=24;   /* 過午夜的關門時間（26＝02:00，小路）；24 照舊寫 24:00 */ return String(Math.floor(x+1e-6)).padStart(2,'0')+':'+String(Math.round((x%1)*60)%60).padStart(2,'0'); },
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
    const IN=k=>{ const q=typeof Z3!=='undefined'&&Z3.SHOP_IN&&Z3.SHOP_IN[k]; return q&&q.gg?{x:q.x,z:q.z,yaw:q.yaw}:null; }, AK=IN('aoki')||(typeof AOKI_LAYOUT!=='undefined'?{x:AOKI_LAYOUT.exit.at.x,z:+(AOKI_LAYOUT.exit.at.z-1.2).toFixed(2),yaw:Math.PI}:null);
    const G2=(k,L)=>IN(k)||(L?{x:L.exit.at.x,z:+(L.d/2-2).toFixed(2),yaw:Math.PI}:null), AF=G2('afar',typeof AFAR_LAYOUT!=='undefined'?AFAR_LAYOUT:null), DB=G2('daybreak',typeof DAYBREAK_LAYOUT!=='undefined'?DAYBREAK_LAYOUT:null);
    const YL=typeof YANGYANG_LAYOUT!=='undefined'&&YANGYANG_LAYOUT.shop?YANGYANG_LAYOUT.shop:null, YY=IN('yangyang')||(YL?{x:YL.exit.at.x,z:+(YL.d/2-1.4).toFixed(2),yaw:Math.PI}:null);
    const CL=typeof CORNER_LAYOUT!=='undefined'&&CORNER_LAYOUT.corner?CORNER_LAYOUT.corner:null, CR=IN('corner_records')||(CL?{x:CL.front.door.x,z:+(CL.d/2-1.5).toFixed(2),yaw:Math.PI}:null);   /* 轉角唱片（CORNER-IN-1107）：和 zones3d.js SHOP_IN 同一個算法（門往裡 1.5 m）*/   /* 洋洋鹹酥雞（YANGYANG-IN-1107）：和 zones3d.js SHOP_IN 同一個算法（門往裡 1.4 m）*/   /* afar café、Daybreak（GG-SHOPS2-1104）：和 zones3d.js SHOP_IN 同一個算法（進門往裡 2 m）*/   /* 青木茶室：zones3d.js 還沒載入時照配置算（和 SHOP_IN 同一個算法）*/   /* 公館三間新室內的落點（GG-SHOPS-REDO-1104：zones3d.js SHOP_IN；配置沒載入＝舊的）*/
    /* 新生南路（XS-PHONEMAP-1105，使用者 11-05 手機「地點」沒有新生南路）：落點＝從側門進來站的地方（XINSHENG_LAYOUT.sideGate.spawn，也是區域的出生點）；
       店照配置 shops 的順序（xs_＋id；名字照 PLACES.names），落點 null＝區域的出生點＝從店門進去站的地方（xinsheng3d.js 的店門 exit 沒寫 spawn）。南洋戲院 1 廳要從大廳進去（買票），不放 */
    const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, XS=XL?[['xinsheng',PLACES.names.xinsheng,Object.assign({},XL.sideGate.spawn)]].concat(XL.shops.filter(q=>PLACES.names['xs_'+q.id]).map(q=>['xs_'+q.id,PLACES.names['xs_'+q.id],null])):[];
    /* 溫州街其他的店（WZ-QUICKTRAVEL-1110，使用者 11-10 18:3x「溫州街在地圖上就只能到溫州街……像手機裡面你點某個地區會出現那個地區的所有店家你可以馬上到達……地圖上的馬上過去要改」）：
       和公館一樣，溫州街那一區列出每一家店。進得去的店（SUNNY SIDE、阿德影印輸出、林家乾麵、小路）落點 null＝區域出生點（從店門進去站的地方，和一盞一樣）；
       只有騎樓窗口、櫥窗的店（帝大紅茶、夏日冰菓室、溫州書屋）落在溫州街、站在窗口前面對它（座標照 src/wzshops3d.js S.WINDOW、溫州街「看書店的櫥窗」(14.2, 3.8)，往街上退 0.5～0.8 m；tests/wz_quicktravel_1110_unit.js 驗站得住）。
       第 4 格＝營業時間照哪一家（game3d.js placeState：關著＝「已閉館」、按了說幾點開，和公館的店一樣；冰菓室 10～4 月照 places.js 的 months）。
       溫州街照舊只從新生南路走進去（X199）；快速前往直接到店和 2:30 AM 一樣 */
    /* 汀州路商圈（TINGZHOU-SHOPS-MOVE-1110；使用者 11-10 X321「同步更新地圖標記、店鋪位置、場景入口」、X319 快速前往列出每一家店）：
       第一筆「汀州路」＝從公館的巷子走進來站的地方（配置 fromGongguan，也是區域的出生點）；使用者指定名字的八間店（PLACES.TZ_SHOPS，名字照配置、不在這裡另外寫）
       落在那一間的店門口、面對店面（PLACES.tzDoor：和 src/tingzhou3d.js 店門互動點同一個算法——立面往騎樓裡 arcade−0.9 m、店面中間）。
       這一版店都還沒有室內（只有「看」）：都在 tingzhou 這一區，沒有營業時間（第 4 格不寫）；有室內以後（tz_＋id 的區域）再改成進店裡。測試：node tests/tingzhou_places_1110_unit.js */
    const TL=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null, TZ=TL?[['tingzhou',PLACES.names.tingzhou,{x:TL.fromGongguan.x,z:TL.fromGongguan.z,yaw:TL.fromGongguan.yaw}]].concat(PLACES.TZ_SHOPS.map(id=>{ const q=TL.shops.find(s=>s.id===id), sp=PLACES.tzDoor(id); return q&&sp?['tingzhou',q.name,sp,undefined,'tingzhou']:null;   /* 第 5 格＝要自己走進過這一區一次才出現（D54 ①：特定的店留給探索去發現；BB 11-10：新存檔一開始就能直達八間店門口）；街本身一開始就知道 */ })):[];
    const N=PLACES.names, WZ=[['wz_brunch',N.wz_brunch,null],['wz_print',N.wz_print,null],['wz_lin',N.wz_lin,null],['wz_teishoku',N.wz_teishoku,null],
      ['wenzhou',N.wz_tea,{x:17.4,z:-6.85,yaw:Math.PI},'wz_tea'],['wenzhou',N.wz_ice,{x:24.4,z:-6.9,yaw:Math.PI},'wz_ice'],['wenzhou',N.wz_books,{x:14.2,z:3.0,yaw:0},'wz_books']];
    /* BUG-YIZHAN-1107（使用者 11-07 試玩「一盞不見了？」）：一盞（wz_teahouse）進得去，但手機「地點」、大地圖、導航都沒列；落點 null＝區域出生點（從冠木門進來站的地方）。營業週三～週日 12–20 */
    return [['campus','首都帝大校園（法律系館A前）',{x:34,z:-98,yaw:0}],['campus','椰影大道・晨思鐘',{x:-38,z:6,yaw:0}],['campus','校門口',{x:-112,z:0,yaw:-Math.PI/2}],['campus','共同教學館',{x:2,z:21.4,yaw:0}],['campus','普通教學館',{x:-38,z:-47.4,yaw:0}],['campus','博思教學館',{x:-38,z:-71.4,yaw:0}],['campus','大一女舍（門口）',{x:-93,z:56,yaw:0}],GY&&['gym','新體育館（大廳）',GY],
      L1&&['linze','法律系館A（大廳）',L1],['classroom','法律系館A 201 教室',null],['wancai','法律系館B（大廳）',{x:0,z:5,yaw:Math.PI}],LL&&['lawlib','法律學院圖書館',LL],LB&&['library_hall','總圖書館（大廳）',LB],SC&&['soclib','社科院圖書館',SC],
      /* 公館商圈：面向南邊的店（yaw 0；鏡頭在背後、校門那一側）。原本 yaw π 面向校門，店在鏡頭後面，要去店裡只能往鏡頭走（CAM-GONGGUAN-GATE-1107，LAWWW2-B）。
         位置和「走出校門」同一點 (−2.5, −29)（BB-B 11-07 18:40 P3：原本 (0, −30) 鏡頭和人中間是校門正前方那一台機車 (0, −32)，直向畫面擋住腿）*/
      ['gongguan','公館商圈',{x:-2.5,z:-29,yaw:0}],['gongguan','捷運公館站',{x:-35.6,z:13.2,yaw:0}],['noodle','公館燒臘',{x:0,z:3.4,yaw:Math.PI}],['cvs','日和便利店',IN('cvs')||{x:0,z:3.4,yaw:Math.PI}],['bookstore','頁間書屋',IN('bookstore')||{x:0,z:4,yaw:Math.PI}],AK&&['aoki','青木茶室',AK],AF&&['afar','afar café',AF],DB&&['daybreak','Daybreak',DB],YY&&['yangyang','洋洋鹹酥雞',YY],CR&&['corner_records','轉角唱片',CR]].concat(TZ,[
      ['wenzhou','溫州街',{x:20,z:0,yaw:-Math.PI/2}],['lane118','118 巷',{x:0,z:47.6,yaw:Math.PI}]].concat(PLACES.l118List(),[['cafe','2:30 AM',{x:0,z:5,yaw:Math.PI}],['wz_mokuyobi','木曜日',{x:-3.75,z:5.4,yaw:Math.PI,lv:0}],['wz_offbeat','日常失速',{x:-3.9,z:3.0,yaw:Math.PI}],['wz_teahouse','一盞',null]]),WZ,XS,[['dorm','宿舍',{x:0,z:2.5,yaw:Math.PI}]]).filter(Boolean); },
  /* 汀州路使用者指定名字的八間店（配置 src/data/tingzhou_layout.js 的 id；X321 三間＋X322 五間，名字照配置）。順序：巷子出來先看到的三間、再照概念圖由北往南 */
  /* 118 巷的每一間店（L118-QUICKGO-1112，使用者 2026-11-12：「118巷在手機快速到達一家店都沒有」）：店名照配置 src/data/lane118_layout.js，落在那一間的店門口、面對店面
     （和 src/lane118.js 的 S.door 同一點：立面往巷子裡 0.9 m、店面中間）；118 巷一開始就知道，所以每一間也一開始就列 */
  l118Door(id){ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null, q=L&&L.shops.find(s=>s.id===id); if(!q||!q.name) return null; const w=q.side==='W'; return {x:+((w?L.facade.west+0.9:L.facade.east-0.9)).toFixed(2),z:+((q.z0+q.z1)/2).toFixed(2),yaw:w?-Math.PI/2:Math.PI/2}; },
  l118List(){ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null; if(!L) return []; return L.shops.filter(q=>q.name&&q.menu).map(q=>{ const sp=PLACES.l118Door(q.id); return sp?['lane118',q.name,sp]:null; }).filter(Boolean); },
  TZ_SHOPS:['taimi','xile','yindehao','wente','liantong','dongnan','keju','yuehaochi'],
  /* 汀州路一間店的店門口（站的地方、面對店面）：和 tingzhou3d.js 的店門互動點同一點；西側的店在 −x＝面向西（yaw −π/2），東側面向東 */
  tzDoor(id){ const L=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null, q=L&&L.shops.find(s=>s.id===id); if(!q) return null; const sx=q.side==='W'?-1:1, F=L.facade; return {x:+((sx>0?F.east:F.west)+sx*(F.arcade-0.9)).toFixed(2),z:+((q.z0+q.z1)/2).toFixed(2),yaw:sx*Math.PI/2}; },
  /* 一個區域在哪一棟、哪一條街（PHONE-UNIFY-1030）：樓上樓層、房間、店面對到它的那一棟／那條街（霖澤館 3F→linze、總圖 B1→library_hall、118 巷的店→lane118、溫州街的店→wenzhou、新生南路的店（xs_）→xinsheng、宿舍 205→dorm_hall）；
     其他照原樣。用在：手機「朋友」直接過去的開放時間（那一棟關門＝進不去）、休學退宿以後不回台大、路程的時間（classes3d.js travelMinutes 沒有那一區的位置時照那一棟算）*/
  base(z){ z=String(z||''); if(/^l118_/.test(z)) return 'lane118'; if(/^wz_/.test(z)) return 'wenzhou'; if(/^xs_/.test(z)) return 'xinsheng'; if(/^tz_/.test(z)) return 'tingzhou';   /* 汀州路的店以後有室內（tz_＋id，tingzhou3d.js）＝算汀州路 */ if(z==='library'||/^library_/.test(z)) return 'library_hall'; if(z==='dorm'||/^dorm_/.test(z)) return 'dorm_hall';
    if(/^(linze|wancai|gym|gongtong|boya|putong|us_lawlib)_/.test(z)) return z.replace(/_[^_]+$/,''); if(z==='soclib_2f') return 'soclib'; return z; },   /* soclib_2f：社科圖東側館（二樓自習室，SOCLIB-2F-1104）＝社科圖那一棟（開放時間、路程照閱覽室）*/
  /* 「已知」的地點（D54 ①）：開學第三週的大一生本來就知道的地方（校園、上課的教室、圖書館、宿舍、公館、溫州街、便利商店）；
     特定的店（麵店、書店、Café）自己走去過一次才會出現在清單上，留給探索去發現 */
  known0:{campus:1,linze:1,classroom:1,wancai:1,lawlib:1,soclib:1,library_hall:1,library:1,gongguan:1,cvs:1,wenzhou:1,lane118:1,dorm:1,dorm_hall:1,gym:1,xinsheng:1,tingzhou:1},   /* tingzhou：汀州路（公館店面街的巷子過去就是，和公館一樣一開始就知道；店都在街上、還沒有室內，TINGZHOU-SHOPS-MOVE-1110）*/   /* xinsheng：新生南路（側門外，現在進溫州街主要走這裡，X199；XS-PHONEMAP-1105）；那一排的店照舊自己走進去一次才出現 */   /* gym：體育課（必修）的新體育館，一開始就知道 */   /* 118 巷：法學院後門那條巷子，一開始就知道（使用者 2026-10-20「118巷也要可及時到達吧手機地圖那邊」，X65；落點＝從霖澤館後門走過去的出生點）*/
  // 大地圖上的地名（沒有入口、或想讓玩家認得的地標）
  landmarks:{
    campus:[ ['校門',-120,0], ['椰影大道',-60,0], ['晨思鐘',-38,16.5], ['行政大樓',-38,33], ['共同教學館',2,33], ['大一女舍',-93,67], ['文學院',-38,-34], ['農業陳列館',-104,-30], ['校史館',-77,-29],
      ['普通教學館',-38,-58.5], ['博思教學館',-38,-83], ['映月湖',-36,-112], ['總圖書館',100,0], ['法律系館A',34,-112], ['法律系館B',94,-96], ['國青大樓',65,-119], ['社會科學院',2,-85], ['社科院圖書館',2,-54], ['椰影小徑',30,-40], ['男生宿舍',20,68],
      ['電機二館',119,-62], ['土木工程館',7,-28], ['圖書資訊學系館',51.5,-34], ['農業綜合大樓',45,33] ],   /* CAMPUS-RELAYOUT-1102：照官方地圖同一個相對位置的系館（使用者 11-02 09:03；電機二館跟著法學院區重排讓到 (119,−62)） */
    gongguan:[ ['捷運公館站',-36.6,11], ['羅斯福路',20,-6], ['首都帝大校門',0,-46] ],   /* 「往溫州街」(−71, 20) 拿掉：巷口不通了（WZ-ENTRY-XINSHENG-1103，X199）*/
    get tingzhou(){ const L=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null; if(!L) return []; const F=L.facade;   /* 汀州路：八間店的店名寫在店面那一側（配置算，店搬了跟著動）、水源市場；巷子那一頭的「往公館」大地圖照出口互動點畫 */
      return PLACES.TZ_SHOPS.map(id=>{ const q=L.shops.find(s=>s.id===id); return q?[q.name,(q.side==='W'?F.west-F.arcade-3:F.east+F.arcade+3),(q.z0+q.z1)/2]:null; }).filter(Boolean).concat(L.shops.filter(q=>q.id==='e_market').map(q=>[q.name,F.east+F.arcade+3,(q.z0+q.z1)/2])); },
    wenzhou:[ ['2:30 AM',54.2,0], ['小公園',26,6], ['往新生南路',-33.4,-28.4] ]   /* 原本「往公館」(51.3, −13.4)：溫州街只從新生南路進出（X199），出口在西側橫巷北口（zones3d.js buildWenzhou）*/
  }
};
