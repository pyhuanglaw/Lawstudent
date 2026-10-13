/* ===== 地點資料（2026-10-11）：區域名稱、開放時間、大地圖的地名 =====
   使用者實機回報：早上七點多去總圖只寫「閉館了」，不知道幾點開；入口不明顯；點小地圖要能看整張地圖。
   - 開放時間：只寫遊戲真的有檢查的地方（story3d.js 的 onInteract 擋門用同一份，檢查和畫面上寫的永遠一致）。
     其他店家目前整天都進得去，不另外製造門檻（CLAUDE.md 合作規範第 5 點）；便利商店標 24 小時只是說明。
   - 地名座標：區域座標（x 往東、−z 往北；公館的區域座標轉過方向，大地圖照 zones3d.js 的 sunYaw 轉成北朝上），
     和 zones3d.js 擺建築的位置相同；搬建築時這裡一起改。入口不用寫在這裡：大地圖和入口標記直接讀區域的出口互動點。 */
const PLACES={
  names:{ campus:'台大校園', gongguan:'公館', wenzhou:'溫州街', cafe:'兩點半 Café', cvs:'全日便利商店', noodle:'阿鳳麵店', bookstore:'舊路書房',
    linze:'霖澤館', classroom:'霖澤館 201 教室', wancai:'萬才館', library_hall:'總圖書館', library:'總圖 3F 閱覽區', lawlib:'法律學院圖書館', dorm:'宿舍房間', dorm_hall:'男生宿舍' },
  // open／close：小時（close 超過 24＝隔天凌晨）；text：畫面上寫的時間
  hours:{ cafe:{open:11,close:26.5,text:'11:00–02:30'}, library_hall:{open:8,close:22,text:'08:00–22:00'}, library:{open:8,close:22,text:'08:00–22:00'}, lawlib:{open:8.5,close:21.5,text:'08:30–21:30'}, cvs:{text:'24 小時'} },   /* 法律學院圖書館的時間是推估（D46，使用者知道實際時間再改）*/
  isOpen(zone,h){ const o=PLACES.hours[zone]; if(!o||o.open==null) return true; h=((h%24)+24)%24; return o.close>24?(h>=o.open||h<o.close-24):(h>=o.open&&h<o.close); },
  // 閉館時的說明：開放時間＋幾點開（今天還是明天）
  closedText(zone,h){ const o=PLACES.hours[zone], nm=PLACES.names[zone]||zone; if(!o||o.open==null) return nm; h=((h%24)+24)%24; const hh=String(Math.floor(o.open)).padStart(2,'0')+':'+String(Math.round((o.open%1)*60)).padStart(2,'0');
    const later=o.close>24?(h<o.open&&h>=o.close-24):(h<o.open); return nm+' 開放時間 '+o.text+'。現在沒有開，'+(later?'今天 ':'明天 ')+hh+' 開'+(zone==='cafe'?'門':'館')+'。'; },
  // 大地圖上的地名（沒有入口、或想讓玩家認得的地標）
  landmarks:{
    campus:[ ['校門',-120,0], ['椰林大道',-60,0], ['傅鐘',-38,16.5], ['行政大樓',-38,33], ['文學院',-38,-34], ['農業陳列館',-104,-30], ['校史館',-77,-29],
      ['醉月湖',-30,-66], ['總圖書館',100,0], ['霖澤館',34,-112], ['萬才館',88,-112], ['社會科學院',110,-70], ['小椰林道',30,-40], ['男生宿舍',20,68] ],
    gongguan:[ ['捷運公館站',-36.6,11], ['羅斯福路',20,-6], ['往溫州街',-71,20], ['台大校門',0,-46] ],
    wenzhou:[ ['兩點半 Café',54.2,0], ['小公園',26,6], ['往公館',51.3,-13.4] ]
  }
};
