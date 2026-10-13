/* ===== 地點資料（2026-10-11）：區域名稱、開放時間、大地圖的地名 =====
   使用者實機回報：早上七點多去總圖只寫「閉館了」，不知道幾點開；入口不明顯；點小地圖要能看整張地圖。
   - 開放時間：只寫遊戲真的有檢查的地方（story3d.js 的 onInteract 擋門用同一份，檢查和畫面上寫的永遠一致）。
     其他店家目前整天都進得去，不另外製造門檻（CLAUDE.md 合作規範第 5 點）；便利商店標 24 小時只是說明。
   - 地名座標：區域座標（x 往東、−z 往北；公館的區域座標轉過方向，大地圖照 zones3d.js 的 sunYaw 轉成北朝上），
     和 zones3d.js 擺建築的位置相同；搬建築時這裡一起改。入口不用寫在這裡：大地圖和入口標記直接讀區域的出口互動點。 */
const PLACES={
  names:{ gongtong:'共同教學館', boya:'博雅教學館', putong:'普通教學館', campus:'台大校園', gongguan:'公館', wenzhou:'溫州街', cafe:'兩點半 Café', cvs:'全日便利商店', noodle:'阿鳳麵店', bookstore:'舊路書房',
    linze:'霖澤館', classroom:'霖澤館 201 教室', wancai:'萬才館', library_hall:'總圖書館', library:'總圖 3F 閱覽區', lawlib:'法律學院圖書館', dorm:'宿舍房間', dorm_hall:'男生宿舍' },
  // open／close：小時（close 超過 24＝隔天凌晨）；text：畫面上寫的時間
  hours:{ cafe:{open:11,close:26.5,text:'11:00–02:30'}, library_hall:{open:8,close:22,text:'08:00–22:00'}, library:{open:8,close:22,text:'08:00–22:00'}, lawlib:{ rules:{ term:{wd:[8+10/60,21.75],we:[9+10/60,17]}, break:{wd:[9+10/60,17],we:null}, holiday:null },
      text:'學期間 週一至五 08:10–21:45、週六日 09:10–17:00；寒暑假 週一至五 09:10–17:00（週末不開）；國定、校定假日不開' }, cvs:{text:'24 小時'} },
  /* 法律學院圖書館（D53，使用者 2026-10-13 查證台大法律圖書館官網）：依日曆（src/data/calendar.js）分學期間／寒暑假／國定假日、平日／週末。
     rules 的時間：[開, 關]（小時）；null＝不開。其他地點照舊是每天同一個時間（open／close） */
  /* 有 rules 的地點：這一天的開放時間 [開, 關]、或 null（不開）。day 沒給就用現在的遊戲日（GAME.G.day） */
  windowOf(zone,day){ const o=PLACES.hours[zone]; if(!o||!o.rules) return undefined; if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; if(typeof CALENDAR==='undefined') return o.rules.term.wd;
    const k=CALENDAR.kind(day); if(k==='holiday') return o.rules.holiday||null; const r=o.rules[k]; if(!r) return null; return CALENDAR.weekend(day)?r.we:r.wd; },
  isOpen(zone,h,day){ const o=PLACES.hours[zone]; if(!o) return true; if(h<0||h>=24) h=((h%24)+24)%24; if(o.rules){ const w=PLACES.windowOf(zone,day); return !!w&&h>=w[0]-1e-6&&h<w[1]-1e-6; }   /* 1e-6：08:10 剛好的時候（8+10/60 的浮點誤差）算開 */ if(o.open==null) return true; return o.close>24?(h>=o.open||h<o.close-24):(h>=o.open&&h<o.close); },
  hhmm(x){ return String(Math.floor(x+1e-6)).padStart(2,'0')+':'+String(Math.round((x%1)*60)%60).padStart(2,'0'); },
  /* 今天的開放時間（一行）：「今天 08:10–21:45」「今天不開放（國定假日）」；沒有 rules 的地點＝原本的 text */
  todayText(zone,day){ const o=PLACES.hours[zone]; if(!o) return ''; if(!o.rules) return o.text||''; const w=PLACES.windowOf(zone,day); if(w) return '今天 '+PLACES.hhmm(w[0])+'–'+PLACES.hhmm(w[1]);
    if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; const hn=typeof CALENDAR!=='undefined'&&CALENDAR.holiday(day); return '今天不開放'+(hn?'（'+hn+'）':(typeof CALENDAR!=='undefined'&&!CALENDAR.termOf(day)?'（寒暑假的週末）':'')); },
  // 閉館時的說明：開放時間＋幾點開（今天還是明天）
  closedText(zone,h,day){ const o=PLACES.hours[zone], nm=PLACES.names[zone]||zone; if(o&&o.rules){ if(day==null) day=(typeof GAME!=='undefined'&&GAME.G&&GAME.G.day)||1; h=((h%24)+24)%24;
      /* 下一次開館：今天還沒開＝今天；不然往後找（最多兩週：寒假可能連著好幾天不開）*/ let nx=null; const w0=PLACES.windowOf(zone,day); if(w0&&h<w0[0]) nx=[0,w0[0]]; else for(let k=1;k<=14&&!nx;k++){ const w=PLACES.windowOf(zone,day+k); if(w) nx=[k,w[0]]; }
      const wdn=['','週一','週二','週三','週四','週五','週六','週日']; let when=''; if(nx){ if(nx[0]===0) when='今天'; else if(nx[0]===1) when='明天'; else if(typeof CALENDAR==='undefined') when=nx[0]+' 天後'; else { const a=CALENDAR.dateOf(day), b=CALENDAR.dateOf(day+nx[0]); when=nx[0]<=6?((a.wd+nx[0]<=7?'這':'下')+wdn[b.wd]):(b.m+'/'+b.d+'（'+wdn[b.wd]+'）'); } when+=' '+PLACES.hhmm(nx[1]); }
      const alt=PLACES.isOpen('library_hall',h,day)?'可以去總圖（開到 22:00），或回宿舍讀書。':'可以回宿舍讀書。';
      return nm+' 現在沒有開（'+PLACES.todayText(zone,day).replace(/^今天/,'今天')+'）。'+(when?'下次開館：'+when+'。':'')+alt; }
    if(!o||o.open==null) return nm; h=((h%24)+24)%24; const hh=String(Math.floor(o.open)).padStart(2,'0')+':'+String(Math.round((o.open%1)*60)).padStart(2,'0');
    const later=o.close>24?(h<o.open&&h>=o.close-24):(h<o.open); return nm+' 開放時間 '+o.text+'。現在沒有開，'+(later?'今天 ':'明天 ')+hh+' 開'+(zone==='cafe'?'門':'館')+'。'; },
  /* 快速前往的地點（D54 ①；手機「地點」與大地圖用同一份）：[區域, 名稱, 落點 {x,z,yaw}（null＝區域預設的出生點）]。
     落點都要站得住、走得出去（tests/quick_travel_unit.js）。建築的落點照 layout 的入口（layout 檔在 places.js 之前載入）*/
  quickList(){ const sp=(L)=>typeof L!=='undefined'?Object.assign({},L.entrance.spawn):null; const L1=typeof LINZE_LAYOUT!=='undefined'?sp(LINZE_LAYOUT):null, LB=typeof LIBRARY_LAYOUT!=='undefined'?sp(LIBRARY_LAYOUT):null, LL=typeof LAWLIB_LAYOUT!=='undefined'?sp(LAWLIB_LAYOUT):null;
    return [['campus','台大校園（霖澤館前）',{x:34,z:-98,yaw:0}],['campus','椰林大道・傅鐘',{x:-38,z:6,yaw:0}],['campus','校門口',{x:-112,z:0,yaw:-Math.PI/2}],['campus','共同教學館',{x:2,z:21.4,yaw:0}],['campus','普通教學館',{x:-38,z:-47.4,yaw:0}],['campus','博雅教學館',{x:-38,z:-71.4,yaw:0}],['campus','大一女舍（門口）',{x:-93,z:56,yaw:0}],
      L1&&['linze','霖澤館（大廳）',L1],['classroom','霖澤館 201 教室',null],['wancai','萬才館（大廳）',{x:0,z:5,yaw:Math.PI}],LL&&['lawlib','法律學院圖書館',LL],LB&&['library_hall','總圖書館（大廳）',LB],
      ['gongguan','公館商圈',{x:0,z:-30,yaw:Math.PI}],['noodle','阿鳳麵店',{x:0,z:3.4,yaw:Math.PI}],['cvs','全日便利商店',{x:0,z:3.4,yaw:Math.PI}],['bookstore','舊路書房',{x:0,z:4,yaw:Math.PI}],
      ['wenzhou','溫州街',{x:20,z:0,yaw:-Math.PI/2}],['cafe','兩點半 Café',{x:0,z:5,yaw:Math.PI}],['dorm','宿舍',{x:0,z:2.5,yaw:Math.PI}]].filter(Boolean); },
  /* 「已知」的地點（D54 ①）：開學第三週的大一生本來就知道的地方（校園、上課的教室、圖書館、宿舍、公館、溫州街、便利商店）；
     特定的店（麵店、書店、Café）自己走去過一次才會出現在清單上，留給探索去發現 */
  known0:{campus:1,linze:1,classroom:1,wancai:1,lawlib:1,library_hall:1,library:1,gongguan:1,cvs:1,wenzhou:1,dorm:1,dorm_hall:1},
  // 大地圖上的地名（沒有入口、或想讓玩家認得的地標）
  landmarks:{
    campus:[ ['校門',-120,0], ['椰林大道',-60,0], ['傅鐘',-38,16.5], ['行政大樓',-38,33], ['共同教學館',2,33], ['大一女舍',-93,67], ['文學院',-38,-34], ['農業陳列館',-104,-30], ['校史館',-77,-29],
      ['普通教學館',-38,-58.5], ['博雅教學館',-38,-83], ['醉月湖',-36,-112], ['總圖書館',100,0], ['霖澤館',34,-112], ['萬才館',88,-112], ['社會科學院',110,-70], ['小椰林道',30,-40], ['男生宿舍',20,68] ],
    gongguan:[ ['捷運公館站',-36.6,11], ['羅斯福路',20,-6], ['往溫州街',-71,20], ['台大校門',0,-46] ],
    wenzhou:[ ['兩點半 Café',54.2,0], ['小公園',26,6], ['往公館',51.3,-13.4] ]
  }
};
