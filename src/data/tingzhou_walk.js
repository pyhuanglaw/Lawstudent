/* ===== 汀州路的路人（TINGZHOU-WALKERS-1110；BB 11-10：汀州路街上 0 個路人；使用者 11-10「真實城市道路（車流、機車、行人、固定店面、部分夜市攤位共存）」「傍晚熱鬧」）=====
   和公館、溫州街、118 巷同一套（src/story3d.js 的 S.populate → GM.spawnExtra：沒有名字、不說話、沿路線一直走不停下來），只是汀州路的騎樓只有 3.2 m 深，
   路點的隨機偏移不能用其他街的 ±1 m（會進柱子、店面玻璃），每一條路線自己寫偏多少（jit＝[x, z] 各 ± 幾公尺）。
   座標照 src/data/tingzhou_layout.js（x 往東、z 往南）：騎樓 x ±5～±8.2（柱子在 x ±5.3、每一棟的一端；店門互動點在 x ±7.3、店面中間），巷 A z −2～2（兩側夜市攤，中間留 1.9 m）。
   routes：0 西側騎樓（五間沒有騎樓的店前面是人行道，同一條線）、1 東側騎樓（經過巷 A 口、水源市場旁的巷口、水源市場前面）、2 水源市場旁的巷子（走兩排攤位中間，z 23.5）→ 巷口 → 過斑馬線到西側（SHUIYUAN-MARKET-LANE-1112，原本是巷 A）。
     路點放在兩間店的交界附近（離店門、攤車都遠）；路人不停、不站在店門口。
   base：一天裡各時段的基本人數 [從幾點, 到幾點, 幾個人]；實際人數＝基本 × STORY.CROWD_X（路人加倍）× 畫質（low 0.5、medium 0.75、high 1），和其他街一樣。
     夜市時段（17:00～23:00，攤位 17:00～24:00）最多、收攤前後少一點、深夜只剩一兩個、白天是一般店面街。颱風假：攤位不擺、街上只剩一個人。
   order：這個時段的第幾個人走哪一條（夜市時段先排市場旁的巷子）。
   測試：node tests/tingzhou_walkers_1110_unit.js（在 Node 建真正的區域：每個路點連偏移的四個角都站得住、每一段走得到、離店門和攤車夠遠；各時段、各畫質的人數） */
const TINGZHOU_WALK={
  routes:[
    [[-6.7,-34.2],[-6.7,-29.5],[-6.7,-19.5],[-6.7,-10],[-6.7,3],[-6.7,13],[-6.7,20.5],[-6.7,32],[-6.7,36],[-6.7,32],[-6.7,20.5],[-6.7,13],[-6.7,3],[-6.7,-10],[-6.7,-19.5],[-6.7,-29.5]],
    [[6.7,-35.5],[6.7,-31],[6.7,-21],[6.7,-11.5],[6.7,-1.5],[6.7,9],[6.7,19],[6.7,28],[6.7,37],[6.7,28],[6.7,19],[6.7,9],[6.7,-1.5],[6.7,-11.5],[6.7,-21],[6.7,-31]],
    [[27.0,23.5],[24,23.5],[20.5,23.5],[17,23.5],[13.5,23.5],[9.8,23.5],[6.2,23.9],[0,24.3],[-6.2,26.0],[0,24.3],[6.2,23.9],[9.8,23.5],[13.5,23.5],[17,23.5],[20.5,23.5],[24,23.5]]   /* SHUIYUAN-MARKET-LANE-1112：原本走巷 A（z 0），攤位搬到水源市場旁的巷子（z 19～28）以後改走這一條的中間 */
  ],
  jit:[[0.3,0.4],[0.3,0.4],[0.3,0.2]],
  base:[[0,1,2],[1,6.5,1],[6.5,11,3],[11,17,4],[17,23,8],[23,24,4]],
  order:{day:[0,1,0,1,2],night:[2,0,1,2,1,0]},
  night(h){ return h>=17&&h<23; },
  /* 這個時間、這個畫質要幾個路人；x＝路人加倍（STORY.CROWD_X，沒給＝2）；typhoon＝颱風假 */
  count(h,level,typhoon,x){ h=((h%24)+24)%24; const b=TINGZHOU_WALK.base.find(q=>h>=q[0]&&h<q[1]), n=typhoon?0.5:(b?b[2]:0), qf=level==='low'?0.5:(level==='medium'?0.75:1); return n>0?Math.max(1,Math.round(n*(x==null?2:x)*qf)):0; },
  /* 第 i 個人走哪一條路線 */
  routeOf(i,h){ const o=TINGZHOU_WALK.night(((h%24)+24)%24)?TINGZHOU_WALK.order.night:TINGZHOU_WALK.order.day; return o[i%o.length]; },
  /* 這一批路人每個人怎麼走（使用者 11-10 看到一排一模一樣的機車：路人不能像同一個人複製一排）——
     同一條路線上的人輪流正著走、倒著走（兩個方向都有人）；出發的路點平均分散在整條路線上，而且離同一批已經排好的人至少 gap 公尺（不疊在一起、不排成一列）；
     每個人的速度不一樣（speeds 輪流＋一點隨機，0.95～1.6 m/s）。外型照 story3d.js 的 extraSpec（第 i 個人＝男女輪流、上衣五種 × 下身四種 × 髮型、身高、包包；底模照路人底模池 CHAR.anonPool）。
     回傳 [{route, pts（偏移過的路點，倒著走的已經反過來）, start（從第幾個路點出發）, rev, speed}]；rnd＝0～1 的亂數（沒給＝Math.random） */
  gap:2, speeds:[1.25,1.05,1.45,1.15,1.55,0.95,1.35],
  plan(h,level,typhoon,x,rnd){ const W=TINGZHOU_WALK, R=rnd||Math.random, n=W.count(h,level,typhoon,x), per=[0,0,0], tot=[0,0,0], used=[], out=[]; for(let i=0;i<n;i++) tot[W.routeOf(i,h)]++;
    for(let i=0;i<n;i++){ const k=W.routeOf(i,h), m=per[k]++, j=W.jit[k], rev=m%2===1, base=rev?W.routes[k].slice().reverse():W.routes[k], pts=base.map(p=>[+(p[0]+(R()-0.5)*2*j[0]).toFixed(2),+(p[1]+(R()-0.5)*2*j[1]).toFixed(2)]), len=pts.length;
      let s=Math.floor((m+(rev?0.5:0))*len/Math.max(1,tot[k]))%len; { let best=s, bd=-1; for(let t=0;t<len;t++){ const c=pts[(s+t)%len], d=used.length?Math.min(...used.map(u=>Math.hypot(u[0]-c[0],u[1]-c[1]))):1e9; if(d>=W.gap){ best=(s+t)%len; break; } if(d>bd){ bd=d; best=(s+t)%len; } } s=best; }   /* 都太近（不該發生：路點比人多）＝挑離大家最遠的 */
      used.push(pts[s]); out.push({route:k,pts,start:s,rev,speed:+(W.speeds[i%W.speeds.length]+(R()-0.5)*0.1).toFixed(2)}); }
    return out; }
};
