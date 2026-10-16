/* ===== 劇情與世界內容：人物、日程、路人、事件、法律系內容 ===== */
'use strict';
const STORY = (function(){
  const S={};
  const C=P3.CAST; const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  // 人物卡（虛構）
  S.people={
    an:{name:'小安',tag:'法律系一年級・同班',desc:'講話直接，筆記整齊到像印的。喜歡溫州街那間開到凌晨的咖啡廳。',memory:G=>G.flags.cafeView?('記得你在咖啡廳說：'+({A:'法律該保護粗心的人',B:'錯誤是自己的責任',C:'重大過失就不該保護'}[G.flags.cafeView])):'還沒真正聊過'},
    zhe:{name:'阿哲',tag:'法律系一年級・同班',desc:'系籃。總是笑著，租屋在公館，什麼店好吃都知道。',known:true,memory:G=>G.flags.classAnswer==='good'?'覺得你上課回答得很帥':'覺得你人不錯'},
    sis:{name:'溫學姊',tag:'法律系三年級・法律服務社社長',desc:'總圖常客。說話很快，講到法服眼睛會亮。',memory:G=>G.flags.lawclub?'知道你看過法服的招募公告':''},
    kai:{name:'阿凱',tag:'資工系一年級・室友',desc:'晚上不是在打遊戲就是在寫程式。對法律的理解停留在「所以可以告嗎」。',known:true,memory:G=>G.flags.readCase==='full'?'看過你熬夜讀案例':''},
    yu:{name:'小語',tag:'法律系一年級・同班',desc:'參加了三個社團。常在傅鐘旁邊的長椅吃早餐。',memory:G=>''},
    prof:{name:'周教授',tag:'民法總則',desc:'上課喜歡點人。被點到的人下週會被記得。',known:true,memory:G=>G.flags.classAnswer==='good'?'記得你答對了要約之引誘':(G.flags.classAnswer==='none'?'記得你沒看案例':'')},
  };
  // 額外人物規格（教授、路人）
  // 教授外觀（資料驅動人物用）：以 PROF 為基底，依 id 變化髮色／髮型／眼鏡／上衣，避免八位教授長得一樣
  function profSpec(c){ const seed=Array.from(c.id).reduce((a,ch)=>a+ch.charCodeAt(0),0); const f=c.gender==='f'; const hairC=['#6d6a66','#2a2420','#4a4a4a','#3b2a1e','#8a8580'][seed%5]; const hairS=f?['chicBob','ponyLow','softMid'][seed%3]:['shortClean','softMid','shortTextured'][seed%3]; const tops=[['shirt','#dfe3ea','#dfe3ea'],['shirt','#c9d3dd','#c9d3dd'],['knit','#6b5a4a','#ffffff'],['cardiganOpen','#3a3f4a','#ffffff'],['shirt','#ede7dc','#ede7dc'],['knit','#5a6b7a','#ffffff']][seed%6]; const bots=f?[['slacks','#3a3a3a'],['skirtLong','#3b3340'],['slacks','#5b4a3a']][seed%3]:[['slacks','#3a3a3a'],['slacks','#4a4238'],['slacks','#2b2b3a']][seed%3]; return {id:c.id,name:c.name,height:f?1.60+(seed%4)*0.02:1.70+(seed%4)*0.02,build:'slim',sex:f?'f':'m',skin:['#efd0b3','#f3d9c4','#e6c3a4'][seed%3],hair:{color:hairC,style:hairS},face:{iris:'#2e211c',brow:f?'soft':'thick',lash:f,glasses:seed%3!==1},outfit:{top:{type:tops[0],color:tops[1],inner:tops[2]},bottom:{type:bots[0],color:bots[1]},shoes:{type:'loafer',color:'#2b2118',sole:'#2b2118'},bag:seed%2?'shoulder':null,bagColor:'#3b2a1e'},posture:{sway:0.01}}; }
  S.profSpec=profSpec;
  const PROF={id:'prof',name:'周教授',height:1.74,build:'slim',sex:'m',skin:'#efd0b3',hair:{color:'#6d6a66',style:'shortClean'},face:{iris:'#2e211c',brow:'thick',lash:false,glasses:true},outfit:{top:{type:'shirt',color:'#dfe3ea',inner:'#dfe3ea'},bottom:{type:'slacks',color:'#3a3a3a'},shoes:{type:'loafer',color:'#2b2118',sole:'#2b2118'},bag:null},posture:{sway:0.01}};
  S.PROF=PROF;
  const AN=Object.assign({},C.hero_f,{id:'an',name:'小安',model:'char.heroine_01',height:1.66});
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
  function extraSpec(i){ const f=(i%2===0); const tops=f?[['tee','#f7f4ee'],['knit','#c9a24f'],['cardiganOpen','#4a6c8c'],['shirt','#ffffff'],['tee','#8c3b47']]:[['tee','#2b2b3a'],['shirtOpen','#eef0f2'],['hoodie','#3a3f4a'],['tee','#2f5d50'],['shirt','#dfe3ea']]; const bots=f?[['skirtMid','#2e3340'],['wideLeg','#3b2a1e'],['jeans','#4a5a78'],['skirtLong','#5c3a21']]:[['jeans','#2b2b3a'],['slacks','#3a3f4a'],['jeans','#4a5a78'],['slacks','#7b6a5a']]; const hairs=f?['softMid','longStraight','ponyLow','chicBob','wavyMid']:['shortTextured','shortClean','softMid']; const t=tops[i%tops.length], b=bots[(i*3)%bots.length]; return {id:'x'+i,name:'',height:f?1.58+(i%4)*0.03:1.70+(i%4)*0.03,build:(i%5===0)?'athletic':'slim',sex:f?'f':'m',skin:['#f3d9c4','#efd0b3','#e6c3a4','#f6dcc9'][i%4],hair:{color:['#2a1d16','#1f1613','#3b2a1e','#4b2e1e'][(i*7)%4],style:hairs[(i*5)%hairs.length]},face:{iris:'#3a2a22',brow:f?'soft':'thick',lash:f,glasses:i%4===1},outfit:{top:{type:t[0],color:t[1],inner:'#ffffff'},bottom:{type:b[0],color:b[1]},shoes:{type:['sneaker','canvas','loafer'][i%3],color:['#f4f1ea','#2b2118','#3a6fb0'][i%3],sole:'#ffffff'},bag:[null,'backpack','tote','shoulder'][i%4],bagColor:['#3b3f4a','#d9d3c6','#3b2a1e','#4a4238'][i%4]},posture:{sway:0.02}}; }
  S.extraSpec=extraSpec;
  // ---------- 法律內容 ----------
  const CASE={id:'case_camera',title:'指定案例：網拍相機 1,000 元',body:'賣家在拍賣網站把一台市價約一萬元的相機標成 1,000 元（少打一個零）。買家下標付款，賣家拒絕出貨。爭點：網頁標價是「要約」還是「要約之引誘」？賣家能否主張錯誤撤銷？'};
  S.studyTopics=G=>[{id:'law_154',title:'民法 §154：要約與要約之引誘',body:'貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。網拍頁面是哪一種，實務與學說有爭論。',read:'你讀了民法第 154 條和幾則判決。網拍標價到底算不算要約，原來連法院都吵過。'},{id:'law_88',title:'民法 §88：意思表示錯誤',body:'表意人若無過失，得撤銷錯誤之意思表示；但撤銷後對信賴者要負賠償責任（§91）。',read:'你讀了錯誤與撤銷的部分。重點在「無過失」和「信賴利益賠償」。'},{id:'law_153',title:'民法 §153：契約成立',body:'當事人互相表示意思一致者，契約即為成立。必要之點須一致，非必要之點推定成立。',read:'你把契約成立的要件整理成一張圖。'},{id:'law_71',title:'民法 §71：強行規定',body:'法律行為違反強制或禁止規定者無效，但其規定不以之為無效者，不在此限。',read:'你讀了強行規定與無效。'}];
  // ---------- 開新遊戲 ----------
  S.resumeWalk=function(GM){ if(!GM.G.flags.walkCk) GM.G.flags.walkCk={}; startWalkTalk(GM); };
  S.newGame=async function(GM){ const E=GM.E, G=GM.G; E.player.busy=false; E.endCinematic(); GM.titleIdle=false; GM.D.busyDepth=0; GM.hideHUD(false); G.day=1; G.weekday=3; G.hour=21.2; G.flags.fundsV2=1; G.flags.allowanceMonth=S.dateOf(1).m; G.zone='dorm'; E.hour=G.hour; G.weather='clear'; E.setWeather('clear'); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{}); };
  // ---------- 日程與路人 ----------
  /* 路線點可以是 [x,z,層]（v9.4 多樓層）。校園第 6 條（萬才館第二階段）：法學院廣場 → 萬才館大樓梯 → 樓梯頂端平台、弧形陽台（第 1 層）→ 走下來 */
  const walkRoutes={campus:[[[-112,-7],[-60,-7],[-30,-7],[0,-7],[30,-7],[30,-40],[30,-70],[30,-40],[30,-7],[60,-7]],[[60,7],[20,7],[-20,7],[-70,7],[-110,7],[-70,7],[-20,7]],[[34,-92],[50,-80],[30,-60],[8,-40],[30,-60],[50,-80]],[[-38,9],[-50,14],[-44,19.4],[-32,19.4],[-26,14]],[[92,-62],[80,-62],[60,-62],[36,-62],[60,-62],[80,-62]],[[64,-86,0],[87,-85,0],[87,-99.2,1],[92.5,-100.6,1],[95.5,-100.9,1],[87,-99.2,1],[87,-85,0],[104,-84,0]]],gongguan:[[[-70,-38],[-20,-38],[30,-38],[70,-38],[30,-38],[-20,-38]],[[-70,16.5],[-30,16.5],[10,16.5],[60,16.5],[10,16.5],[-30,16.5]],[[-40,14.5],[0,10],[40,14],[0,10]],[[-72,12],[-60,10],[-48,14.5],[-60,10]]],wenzhou:[[[44,-2.4],[20,-2.2],[-6,-2.6],[-30,-2.4],[-6,-2.6],[20,-2.2]],[[-28,2.6],[-4,2.2],[18,2.6],[42,2.4],[18,2.6],[-4,2.2]],[[26,11],[26,4.5],[6,2],[5.8,16],[6,2],[26,4.5]],[[-33.5,10],[-33.5,-1.5],[-12,-1],[-12.2,-14],[-12,-1],[-33.5,-1.5]]]};
  const bikeRoutes={campus:[[[-112,-3],[30,-3],[30,-72],[92,-60],[30,-72],[30,-3]],[[60,3],[-110,3],[60,3]]],gongguan:[[[-70,-12],[70,-12],[70,-2],[-70,-2]]],wenzhou:[[[-29,1.2],[50,1.2],[-29,1.2]],[[50,-1.4],[-29,-1.4],[50,-1.4]]]};
  function h(G){ return G.hour%24; }
  function isThu(G){ return G.weekday===4; }
  function classTime(G){ return isThu(G)&&h(G)>=13.1&&h(G)<15.2; }
  S.populate=function(zoneId,GM){ const E=GM.E, G=GM.G; const hr=h(G); const day=hr>=6.5&&hr<23; const F=G.flags; const tm=(key,to)=>{ const n=GM.npc[key]; if(n&&F.afternoonDone) n.until=to; };
    /* 週末回家的第二個入口：校門口（AA_134 第 3 節「宿舍或校門口的『回家』選項」；AA-B 2026-10-16 確認，時段同宿舍：週五 17:00～週日 21:30）。
       位置在校門內側、從公館進校園的出生點 (-119,0) 旁邊（站得住、走得到、不和「走出校門」(-126,0) 半徑 3 重疊；scratchpad gate_check 用 Node 的校園導航格量過）*/
    if(zoneId==='campus'&&typeof HOME!=='undefined') E.interactables.push({x:-120.5,z:2.4,radius:1.0,lv:0,label:'回臺北的家',home:true,get hidden(){ return !HOME.canGo(GM.G); }});   /* 舊的固定時段（第三天以後）：時段結束時 refreshSchedule 讓他離開（不在玩家眼前）；第一、二天的劇情人物不標 */ let xi=0;
    const qf=E.q.level==='low'?0.5:(E.q.level==='medium'?0.75:1); const extras=(n,pockets)=>{ n=Math.max(2,Math.round(n*qf)); const rs=walkRoutes[zoneId]||[]; for(let i=0;i<n&&rs.length;i++){ const r=rs[i%rs.length]; GM.spawnExtra(extraSpec(xi++),r.map(p=>[p[0]+(rnd()-0.5)*2,p[1]+(rnd()-0.5)*2,p[2]]),{pockets:pockets&&i%3===0}); } };   /* 牽腳踏車的路人拿掉（2026-10-14 使用者試玩 v9.6：「邊走路邊牽腳踏車的人還是很奇怪跟腳踏車重疊」——車掛在走路的人旁邊，手沒有握把手）；路上的腳踏車改成真的在騎的人（riders） */
    const riders=(n)=>{ if(/[?&]noriders\b/.test(location.search)) return;   /* 2026-10-11 使用者回報：騎腳踏車的人其實是「坐姿的人＋腳踏車」一起平移，腳沒踩踏板、看起來像人和車重疊——之後一直關著。
       2026-10-14：騎士換成 BIKE.rider（88c9cdc：和玩家騎車同一套，腳踝在踏板上、手腕在把手上、曲柄照走的距離轉）→ 預設打開，網址加 ?noriders 可以關掉。v9.7 回歸 flow_bike 量過玩家的騎姿（≤5 cm）；路人騎士的瀏覽器畫面還沒看 */ const rs=bikeRoutes[zoneId]||[]; for(let i=0;i<n&&rs.length;i++){ GM.spawnRider(extraSpec(xi+++20),rs[i%rs.length],['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][i%4]); } };
    if(zoneId==='campus'){ if(day){ extras(hr<19?10:5,true); riders(hr<20?3:1);   /* v9.3 第十八批：校園人太少（原本 7 人走路、2 人騎車）*/
        // 坐在長椅上讀書的人、站著聊天的兩人
        const seats=E.zone.seats||[]; for(const si of [1,4,7,10]){ const st=seats[si]; if(!st) continue; const o=CHAR.build(extraSpec(xi++)); o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true}); }
        if(hr>=10&&hr<17.5){ const o=CHAR.build(extraSpec(xi++)); o.position.set(-18,0,15.4); o.rotation.y=Math.PI; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true}); }
        const pairs=hr<18?[[-47,13.5],[58,-90]]:[[-47,13.5]]; for(const [px,pz] of pairs){ const a=CHAR.build(extraSpec(xi++)), b=CHAR.build(extraSpec(xi++)); a.position.set(px-0.5,0,pz); b.position.set(px+0.5,0,pz); a.rotation.y=Math.PI/2; b.rotation.y=-Math.PI/2; E.addNPC({obj:a,name:'',beh:'idle',pose:'talk',idlePose:'talk',frozen:true,isExtra:true}); E.addNPC({obj:b,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,pockets:true}); } }
      // 週四上課前：阿哲在霖澤館前等
      if(isThu(G)&&!F.classDone&&hr>=12.5&&hr<13.4){ GM.spawnNPC('zhe',C.zhe,30,-93,{yaw:Math.PI,pockets:true,talk:n=>talkZhe(GM,n)}); }
      // 下課後小安（劇情：由 tick 觸發）；之後在椰林大道散步
      if(F.afternoonDone&&hr>=18&&hr<20.5&&F.companion!=='an'){ GM.spawnNPC('an',AN,-20,6,{beh:'wander',waypoints:[[-20,6],[-60,6],[-90,-6],[-40,-6]],talk:n=>talkAn(GM,n)}); tm('an',20.5); }
      if(hr>=9.5&&hr<12){ GM.spawnNPC('yu',C.yu,-46,20.94,{seat:{x:-46,z:20.94,yaw:Math.PI},talk:n=>talkYu(GM,n)}); tm('yu',12); } else if(hr>=15.2&&hr<17.5){ GM.spawnNPC('yu',C.yu,20,-80,{beh:'wander',waypoints:[[20,-80],[40,-78],[10,-60],[48,-70]],talk:n=>talkYu(GM,n)}); tm('yu',17.5); }
      if(F.afternoonDone&&hr>=15.5&&hr<17.5&&F.companion!=='an'&&!F.zheAtNoodle){ GM.spawnNPC('zhe',C.zhe,-60,3,{beh:'wander',waypoints:[[-60,3],[-30,-6],[-90,3],[-20,3]],talk:n=>talkZhe(GM,n)}); tm('zhe',17.5); }
      if(F.companion==='an'){ spawnCompanion(GM); } }
    if(zoneId==='gongguan'){ extras(hr<22?8:4,true); if(hr>=10&&hr<23) riders(1); if(F.companion==='an') spawnCompanion(GM); }
    if(zoneId==='wenzhou'){ extras(3,true); if(hr>=10&&hr<23) riders(1); if(F.companion==='an') spawnCompanion(GM); if(hr>=19&&hr<21.5){ GM.spawnNPC('yu',C.yu,23.6,7.94,{seat:{x:23.6,z:7.94,yaw:Math.PI},talk:n=>talkYu(GM,n)}); tm('yu',21.5); } }
    if(zoneId==='classroom'&&E.zone.setBoard){ const BOARD={1:['憲法：基本權的限制','案例：集會遊行的事前許可','比例原則？審查密度？'],2:['刑事訴訟法：證據能力與證明力','案例：夜間詢問取得的自白','§156？§158-2？毒樹果實？'],3:['刑法總則：故意與過失','案例：把行李箱誤認為自己的帶走','§13？§14？構成要件錯誤？'],4:['民法總則：法律行為的成立與生效','案例：網拍標價 1,000 元的相機','要約？要約之引誘？承諾？錯誤？'],5:['法學緒論：法源與法律解釋','案例：「車輛」包不包括電動滑板車？','文義？體系？目的？'],6:['（週末）','教室借給法服社辦活動','—'],0:['（週日）','','']}; const b=BOARD[G.weekday]||BOARD[4]; E.zone.setBoard(b[0],b[1],b[2]); if(E.zone.clockHand){ const ang=-(hr%12)/12*Math.PI*2; E.zone.clockHand.rotation.z=ang; E.zone.clockHand.position.x=6.2+Math.sin(ang)*0.08; E.zone.clockHand.position.y=3.0+Math.cos(ang)*0.08; } }
    if(zoneId==='classroom'){ const z=E.zone; const inClass=(isThu(G)&&!F.classDone&&hr>=12.5&&hr<15.2)||F.classNow; if(inClass){ GM.spawnNPC('prof',PROF,z.teacherSpot.x,z.teacherSpot.z,{yaw:0,pose:'idle'}); const seats=z.seats; const pick=(r,c)=>seats.find(s=>s.row===r&&s.col===c); GM.spawnNPC('an',AN,0,0,{seat:pick(0,3),talk:n=>talkAn(GM,n)}); GM.spawnNPC('zhe',C.zhe,0,0,{seat:pick(1,4),talk:n=>talkZhe(GM,n)}); GM.spawnNPC('yu',C.yu,0,0,{seat:pick(0,6),talk:n=>talkYu(GM,n)}); const cells=[[0,1],[1,1],[1,6],[2,0],[2,2],[2,5],[2,7],[0,0]]; for(const [r,c] of cells){ const s=pick(r,c); const o=CHAR.build(extraSpec(xi++)); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s}); } } else { for(const [r,c] of [[2,1],[1,6]]){ const s=E.zone.seats.find(s=>s.row===r&&s.col===c); const o=CHAR.build(extraSpec(xi++)); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:s}); } } }
    if(zoneId==='linze'){ const L=LINZE_LAYOUT; const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(hr>=8&&hr<21.5){ const ct=L.furniture.find(f=>f.type==='counter'); if(ct&&hr<17) mk(ct.x,ct.z-0.75,0,Math.PI,'idle');   /* 服務台的工讀生 */
        const so=L.furniture.filter(f=>f.type==='sofa'); if(so[0]) mk(so[0].x-0.5,so[0].z-0.05,0,Math.PI,'read',{x:so[0].x-0.5,z:so[0].z-0.05,yaw:Math.PI,y:0}); if(so[1]&&hr>=10) mk(so[1].x+0.4,so[1].z-0.05,0,Math.PI,'read',{x:so[1].x+0.4,z:so[1].z-0.05,yaw:Math.PI,y:0});
        mk(1.2,-3.95,1,0,'idle');   /* 二樓迴廊靠著欄杆往下看的人 */
        /* 上下樓的人（v9.4 多樓層：NPC 照路線走樓梯上二樓、到教室門口、再走下來）*/ const up=[[2,1.5,0],[-6.4,6.0,0],[-6.4,-4.6,1],[-2,-5.6,1],[5.6,-4.6,1],[-6.4,-4.8,1],[-6.6,5.8,0],[4,5.6,0]];
        for(let k=0;k<(hr<18?2:1);k++){ const rt=k?up.slice(3).concat(up.slice(0,3)):up; GM.spawnExtra(extraSpec(xi++),rt,{}); } }
      if(F.companion==='an') spawnCompanion(GM); }
    if(zoneId==='library'){ const seats=E.zone.seats; if(hr>=9&&hr<17){ GM.spawnNPC('sis',C.sis,0,0,{seat:seats[2],pose:'read',talk:n=>talkSis(GM,n)}); GM.npc.sis.idlePose='read'; tm('sis',17); } if(G.day>=3&&hr>=8&&hr<12&&F.companion!=='an'){ GM.spawnNPC('an',AN,0,0,{seat:seats[8],pose:'read',talk:n=>talkAn(GM,n)}); GM.npc.an.idlePose='read';  tm('an',12); } for(const i of [5,11,14]){ const o=CHAR.build(extraSpec(xi++)); const s=seats[i]; o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true}); } if(F.companion==='an') spawnCompanion(GM); }
    /* 總圖大廳（總圖第一階段，D43）的背景人物：服務台的館員、二樓自習區讀書的人、走大樓梯上下樓的人、一樓走動的人。不是劇情人物、沒有對話 */
    if(zoneId==='library_hall'&&typeof LIBRARY_LAYOUT!=='undefined'){ const L=LIBRARY_LAYOUT; const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(hr>=8&&hr<22){ const dk=L.furniture.find(f=>f.type==='desk'); if(dk) mk(dk.x-0.6,dk.z+0.75,0,Math.PI,'idle');
        const sts=E.zone.seats.slice(2); for(const k of (hr<18?[3,8,13]:[8,13])){ const st=sts[k]; if(st) mk(st.x,st.z,1,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:1}); }
        GM.spawnExtra(extraSpec(xi++),[[0,2.0,0],[-2.6,0.2,1],[-8.0,-2.0,1],[-2.6,0.2,1],[0,2.0,0],[2.6,0.2,1],[8.0,-5.0,1],[2.6,0.2,1]],{});   /* 走大樓梯上下樓的人：大廳 ⇄ 二樓（西翼、東翼輪流）*/
        if(hr<18) GM.spawnExtra(extraSpec(xi++),[[6.5,-6.5,0],[2.5,2.0,0],[-3.5,3.0,0],[-7.0,-6.5,0]],{}); }
      if(F.companion==='an') spawnCompanion(GM); }
    /* 法律學院圖書館（D46，2026-10-13）的背景人物：櫃台的館員、一樓自習區和二樓讀書的人、走樓梯上下樓的人。不是劇情人物、沒有對話 */
    if(zoneId==='lawlib'&&typeof LAWLIB_LAYOUT!=='undefined'){ const L=LAWLIB_LAYOUT; const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(PLACES.isOpen('lawlib',hr,G.day)){ const C=L.counter; mk(C.staff.x,C.staff.z,0,C.staff.yaw,'idle');
        const ss=E.zone.seats||[]; const pick=(tb,k)=>ss.filter(q=>q.table===tb)[k]; const busy=hr<18?[['T1',1],['T1',6],['T2',3],['carrel',2],['T6',1],['T3',0]]:[['T1',2],['carrel',0],['T5',3]];
        for(const [tb,k] of busy){ const st=pick(tb,k); if(st) mk(st.x,st.z,st.lv,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:st.lv}); }
        GM.spawnExtra(extraSpec(xi++),[[2.0,4.6,0],[-6.2,1.6,0],[-4.2,1.6,1],[1.6,-1.8,1],[-4.2,1.6,1],[-6.2,1.6,0],[3.0,5.6,0]],{}); }   /* 一樓 → A 跑 → 平台 → B 跑 → 二樓書庫 → 走回一樓 */
      if(F.companion==='an') spawnCompanion(GM); }
    /* 社科院圖書館（D56 社科院第①步，2026-10-13）的背景人物：服務台的館員、閱覽長桌和窗邊讀書的人、在書架之間走的人。不是劇情人物、沒有對話。
       開館時才有人（開放時間：src/data/places.js，D62 使用者 2026-10-14 查證館方網頁）*/
    if(zoneId==='soclib'&&typeof SOCLIB_LAYOUT!=='undefined'){ const L=SOCLIB_LAYOUT; const mk=(x,z,yaw,pose,seat)=>{ const o=CHAR.build(extraSpec(xi++)); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:0,seat}); };
      if(PLACES.isOpen('soclib',hr,G.day)){ const dk=L.desk; mk((dk.x0+dk.x1)/2-0.8,(dk.z1+dk.staff.z1)/2-0.6,Math.PI,'idle');
        const ss=E.zone.seats||[]; const pick=(kind,k)=>ss.filter(q=>q.kind===kind)[k]; const busy=hr<18?[['table',1],['table',8],['table',14],['table',21],['window',4],['window',12],['window',27],['lounge',2]]:[['table',6],['window',9],['window',20]];
        for(const [kind,k] of busy){ const st=pick(kind,k); if(st) mk(st.x,st.z,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:0}); }
        GM.spawnExtra(extraSpec(xi++),[[-9,6.6,0],[-6,3.6,0],[0.5,1.0,0],[9,-2.5,0],[7,-9,0],[-6,-9,0],[-12.5,-3,0],[-11.5,3.5,0]],{}); }   /* 閘門內 → 長桌南邊 → 林間書房之間 → 北邊窗前的走道 → 西邊窗前 → 回到入口（tests/nav_soclib_unit.js 檢查每一段走得到）*/
      if(F.companion==='an') spawnCompanion(GM); }
    if(zoneId==='dorm_hall'&&typeof DORM_LAYOUT!=='undefined'){ const L=DORM_LAYOUT; const boy=()=>{ if(xi%2===0) xi++; return extraSpec(xi++); };   /* 男生宿舍：路人都是男生（extraSpec 奇數＝男）*/
      const mk=(x,z,lv,yaw,pose,seat)=>{ const o=CHAR.build(boy()); o.position.set(x,0,z); o.rotation.y=yaw||0; return E.addNPC({obj:o,name:'',beh:'idle',pose:pose||'idle',idlePose:pose||'idle',frozen:true,isExtra:true,lv:lv|0,seat}); };
      if(hr>=7&&hr<23){ const ww=L.furniture.find(f=>f.type==='wardenWindow'); if(ww) mk(ww.x-1.25,ww.z,0,Math.PI/2,'read',{x:ww.x-1.25,z:ww.z,yaw:Math.PI/2,lv:0}); }   /* 舍監室窗口裡值班的工讀生（隔著玻璃看得到）*/
      if(hr>=7&&hr<24){ GM.spawnExtra(boy(),[[0,4.6,0],[-0.8,0,0],[0,-5.2,0],[1.4,0.2,1],[-9.5,0.2,1],[9.5,-0.2,1],[1.4,0.2,1],[0,-5.2,0],[-0.8,0,0]],{});   /* 走樓梯上下樓的人：門廳 ⇄ 二樓走廊 */
        GM.spawnExtra(boy(),[[-12.4,0,0],[12.4,0,0]],{});   /* 一樓走廊來回 */
        if(hr>=12){ const st=E.zone.seats[1]; if(st) mk(st.x,st.z,0,st.yaw,'read',{x:st.x,z:st.z,yaw:st.yaw,lv:0}); }
        if(hr>=19){ const sf=L.furniture.find(f=>f.type==='sofa'); if(sf) mk(sf.x,sf.z,0,sf.ry,'sit',{x:sf.x,z:sf.z,yaw:sf.ry,lv:0}); } } }
    if(zoneId==='cafe'){ const seats=E.zone.seats; const z3=S.z3Pending(G), shut=S.Z3_SHUT, quiet=z3&&hr>=shut&&hr<22;   /* 芷若 Z3（BB_96 3-1）還沒發生的平日：21:40 起店裡只剩祐廷——之前進來的客人 21:40 起身走出去（until）、21:40～22:00 不生成（S.z3Pending）*/
      if(hr>=19&&hr<23&&!quiet){ GM.spawnNPC('sis',C.sis,0,0,{seat:seats[5],pose:'read',talk:n=>talkSis(GM,n)}); GM.npc.sis.idlePose='read'; tm('sis',z3&&hr<shut?shut:23); } for(const i of [6]){ if(quiet) continue; const o=CHAR.build(extraSpec(xi++)); const s=seats[i]; o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; const x=E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true}); if(x&&z3&&hr<shut) x.until=shut; } if(F.companion==='an') spawnCompanion(GM); }
    /* 店員（2026-10-11 使用者回報：便利商店、麵店、書店都沒有人顧店）：站在櫃台後面、工作台前；只是讓店有人在顧，不加對話和劇情（結帳還是櫃台的互動點）。
       外觀用路人模型（extraSpec：偶數＝女性、奇數＝男性）；年紀比較大的老闆娘、老闆要等有中年人物模型（MISSING_EXTERNAL_ART）*/
    { const clerk=(x,z,yaw,i)=>{ const o=CHAR.build(extraSpec(i)); o.position.set(x,0,z); o.rotation.y=yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true}); };
      if(zoneId==='cvs') clerk(4.0,-2.35,0,41);              // 櫃台（(4,-1.5)、寬 3 m）後面，面向結帳的客人
      if(zoneId==='noodle') clerk(-2.0,-2.75,Math.PI,40);    // 廚房工作台前，面向湯鍋
      if(zoneId==='bookstore') clerk(0.55,1.95,0,43);       // 門口那張桌子（像櫃台）後面，面向門口
      /* 2026-10-14 使用者試玩 v9.6：「有一些店面還是沒有店員」——兩點半在芷若沒班的時段吧檯沒人、總圖服務台沒有館員 */
      if(zoneId==='cafe') clerk(-0.6,-5.25,0,44);           // 吧檯後面靠東邊（芷若上班時站中間 (-2.5,-5.15)，兩個人不重疊；咖啡機在西邊 (-4.5,-4.8)）
      if(zoneId==='library_hall'&&typeof LIBRARY_LAYOUT!=='undefined'){ const d=(LIBRARY_LAYOUT.furniture||[]).find(f=>f.type==='desk'); if(d) clerk(d.x,d.z+d.d/2+0.45,Math.PI,45); } }   // 服務台後面（兩片隔板中間），面向借書的人
    if(zoneId==='noodle') noodleRegulars(GM,true);   /* 週二、週四傍晚的固定客人（AA_110 6-3）：進店時已經坐著 */
    if(zoneId==='noodle'){ if(F.afternoonDone&&hr>=17.5&&hr<20.5&&!F.zheNoodleDone){ GM.spawnNPC('zhe',C.zhe,0,0,{seat:{x:0,z:-0.3,yaw:0},talk:n=>talkZhe(GM,n)}); F.zheAtNoodle=true; } }
    if(zoneId==='dorm'){ if(hr>=18||hr<8){ GM.spawnNPC('kai',C.kai,0,0,{seat:{x:1.8,z:2.2,yaw:Math.PI},talk:n=>talkKai(GM,n)}); }
      if(typeof HOME!=='undefined') E.interactables.push({x:2.35,z:-0.9,radius:0.6,lv:0,label:'收拾背包回臺北的家',home:true,get hidden(){ return !HOME.canGo(GM.G); }}); }   /* 週末回家（AA_137 第 6 節）：週五 17:00 以後到週日 21:30 才出現（背包在 2.55,-1.6）*/
    if(zoneId==='wancai'){ if(hr>=15.2&&hr<17){ GM.spawnNPC('sis',C.sis,4,-5,{yaw:Math.PI,talk:n=>talkSis(GM,n)}); tm('sis',17); } if(isThu(G)&&hr>=15.2&&hr<16.2){ GM.spawnNPC('prof',PROF,-5,1.2,{yaw:0,talk:n=>talkProf(GM,n)}); } if(G.weekday===3&&hr>=18.8&&hr<21){ GM.spawnNPC('sis',C.sis,-3,3.6,{yaw:Math.PI,talk:n=>talkSis(GM,n)}); tm('sis',21); }
      /* 萬才館室內兩層樓（第三階段，D42）的背景路人：一個照路線上下樓（一樓大廳 → 樓梯 → 二樓門廳 → 走廊的研討室門口 → 走回一樓），一個在二樓走廊靠著欄杆往下看。不是劇情人物、沒有對話 */
      if(E.levels&&hr>=8&&hr<21.5){ GM.spawnExtra(extraSpec(xi++),[[3,4.6,0],[-6.2,5.4,1],[1.5,-6.0,1],[-6.2,5.4,1],[2.5,5.0,0]],{});
        const o=CHAR.build(extraSpec(xi++)); o.position.set(2.6,0,-2.35); o.rotation.y=0; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,lv:1}); } }
    if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ if(zoneId==='campus') CLS.addDoors(GM,'campus'); if(CLS.addActSpots) CLS.addActSpots(GM,zoneId);   /* 活動的集合點（AA_110 6-3）*/ if(zoneId==='classroom'&&!F.classNow&&!(isThu(G)&&!F.classDone)) CLS.syncRoom(GM); if(E.zone&&E.zone.layout) CLS.syncRoom(GM);   /* 建築裡的教室（共同教學館…，D55）*/ }catch(e){ console.warn('CLS populate',e); } }   /* 課表（D52）：共同教學館、體育館的門口；201 上課時的同學 */
    if(typeof CROWD!=='undefined'){ try{ CROWD.enter(GM,zoneId); }catch(e){ console.warn('CROWD.enter',e); } }   /* 公共場景的人流（D55）：照現在的時間直接排好；同一天同一時段進出看到同一批人 */
    GM_ref=GM; if(G.social){ try{ populateSchedule(zoneId,GM); }catch(e){ console.warn('schedule populate failed',e); } }
  };
  // ---------- 資料驅動的 NPC 日程（CHARACTERS[*].daily_schedule）與不熟同學 pool ----------
  const LEGACY_IDS=['heroine_01','heroine_05','zhe','yu','kai','prof_zhou'];
  const CLUB_SPOTS=[[-3,3.6],[3,3.6],[0,4.6],[-6,0.5],[6,0.5],[-1.5,-2.5]]; const TA_SPOT=[2.6,-4.5];
  const LEGACY_ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
  /* 這個人現在該不該在這個區域：回傳日程那一筆（或教授的 {prof}），不該在就 null。進入區域（populateSchedule）和待在區域裡補人（refreshSchedule）共用同一套規則 */
  /* 這個人現在照作息在哪一筆——一個人同一時間只有一筆（2026-10-13：原本進區域時是「這個區域的第一筆」、人物線索是「全部的第一筆」，兩筆時間重疊時
     同一個人會在兩個地方都生出來，例如芷若週五 14–15 點 Café 和校園）：
     ・寫了 terms 的只在那幾個學期的上課期間（寒暑假不算），而且比沒寫的優先（AA_110 5-7 芷若大一上的週五）；
     ・上課（act:'class'）和 noHoliday 的只在上課期間、國定假日不算（和課表一樣停課）；
     ・zone:null＝不在遊戲的場景裡（away 是人物線索的文字，例如「在小福吃午餐」）*/
  function schedEnt(c,G){ if(typeof INV!=='undefined'&&INV.entryFor&&c&&c.id){ const iv=INV.entryFor(G,c.id); if(iv) return iv; }   /* 約好的時間人在那裡、一起走過去的人跟著你（src/invites3d.js）*/
    { const cc=S.classmateClass(c,G); if(cc) return cc; }   /* 同班同學：必修課的時間在那間教室（使用者 2026-10-15：以安也是大一，課要跟我一樣） */
    const hr=h(G), wd=G.weekday; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hol=!!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(G.day));
    const hit=ent=>{ if(!ent.days.includes(wd)) return false; if(ent.activity&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list){ const a=ACTIVITIES.list.find(x=>x.id===ent.activity); if(!a||!ACTIVITIES.on(a,G.day)) return false; }   /* activity：那個活動當天有開才在（學姊的法服讀書會：第 5 週起；使用者 2026-10-15 第 3 週去，學姊站在那裡、沒有活動）*/ if((ent.act==='class'||ent.noHoliday)&&(!T||hol)) return false; if(ent.weeks&&(!T||!ent.weeks.includes(T.week))) return false; if(ent.if&&!(typeof EVENTS!=='undefined'&&EVENTS.cond&&EVENTS.cond(ent.if))) return false; const to=ent.to;   /* if：條件成立才在（AA_155：阿勳、品妤 P4d 之後才在走廊；寫法和閒聊階梯的 if 一樣）*/   /* weeks：學期的第幾週才有（子晴的吉他社：第 5～7、10～16 週）*/ return to<=24?(hr>=ent.from&&hr<to):(hr>=ent.from||hr<to-24); };
    const L=c.daily_schedule||[]; for(const ent of L) if(ent.terms&&T&&ent.terms.includes(T.id)&&hit(ent)) return ent; for(const ent of L) if(!ent.terms&&hit(ent)) return ent; return null; }
  S.schedEnt=schedEnt;
  /* 法律系同屆（department 法律系、year 1、不是外校、不是路人 B 層）：祐廷那一堂「必修」正在上（CLS.live）＝人在那間教室坐著——作息表（daily_schedule）原本是手寫的、和課表對不上，
     使用者試玩：「常常我去上課遇不到她，或她在圖書館」「以安不在教室卻會回答老師」（9/22 憲法）。選修、通識、體育照各自的作息；劇情課（第一、二天）照劇情 */
  S.classmateClass=function(c,G){ if(!c||c.department!=='法律系'||c.year!==1||c.school||c.social_layer==='B'||typeof CLS==='undefined'||!CLS.dayItems) return null;
    for(const it of CLS.dayItems(G)){ if(it.c.kind!=='required'||!CLS.live(G,it)||(CLS.storyClass&&CLS.storyClass(G,it))) continue; return {zone:it.room.zone||'classroom',room:it.room.room,act:'class',days:[G.weekday],from:it.t0-0.25,to:it.t1,cls:it.key}; }
    return null; };
  /* 沒有開課的教授（2026-10-14 課程調整：黃教授、陳教授的課都刪了，AA_130 第 2 節第 4 列）：上課期間照人物資料的星期、時間，在霖澤館一樓大廳（lobby）。
     國定假日、寒暑假不在；這個時段剛好有自己的課（之後若再開課）就照課表 */
  S.profLobby=function(c,G){ if(!c||!c.lobby||!c.time||!(c.time[1]>c.time[0])||c.weekday!==G.weekday) return false; const hr=h(G); if(hr<c.time[0]||hr>=c.time[1]) return false;
    if(typeof CALENDAR==='undefined') return false; const T=CALENDAR.termOf(G.day); return !!T&&!CALENDAR.holiday(G.day); };
  function schedFor(id,zoneId,G){ const c=CHARACTERS[id], F=G.flags, hr=h(G), wd=G.weekday; if(!c) return null; if(c.presence&&!S.present(id,G)) return null;   /* 這學期不在學校（presence，AA_110 第 3 節）*/
    if(LEGACY_IDS.includes(id)){ if(!F.afternoonDone||F.classNow) return null; const al=LEGACY_ALIAS[id]||id; if(F.companion===al) return null; }
    if(c.social_layer==='E'&&typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ const w=CLS.profWhere(G,id); if(!w) return S.profLobby(c,G)&&zoneId===c.lobby?{prof:'lobby'}:null; if(w.zone==='classroom'&&zoneId==='classroom') return {prof:'class',until:null}; if(w.zone==='wancai'&&zoneId==='wancai') return {prof:'wancai'}; return null; }   /* 課表（D52）：上課時在教室、下課後 1.5 小時在萬才館 */
    if(c.social_layer==='E'){ if(zoneId==='classroom'&&c.weekday===wd&&hr>=c.time[0]-0.3&&hr<c.time[1]) return {prof:'class'}; if(zoneId==='wancai'&&c.weekday===wd&&hr>=c.time[1]&&hr<c.time[1]+1.5) return {prof:'wancai'}; return null; }
    if(c.social_layer==='B') return null; const ent=schedEnt(c,G); return ent&&ent.zone===zoneId?ent:null; }
  function populateSchedule(zoneId,GM,refresh){ const E=GM.E, G=GM.G; const hr=h(G); const wd=G.weekday; const used=new Set(); for(const n of E.npcs){ const st=n.seat||n.seatTarget; if(st) used.add(st.x.toFixed(1)+','+st.z.toFixed(1)); } let clubI=0, routeI=0;   /* seatTarget：正從門口走過去要坐的位子（還沒坐下）*/
    const seatFree=(pref,room)=>{ const all=(E.zone.seats||[]).slice(); const seats=room&&all.some(s=>s.room===room)?all.filter(s=>s.room===room):all;   /* 作息寫了 room（建築裡的教室，例：芷若在普通 101）就坐那一間 */ if(pref&&Array.isArray(pref)){ const sp=seats.find(s=>s.row===pref[0]&&s.col===pref[1]); if(sp&&!sp.taken&&!used.has(sp.x.toFixed(1)+','+sp.z.toFixed(1))) return sp; } for(let i=seats.length-1;i>=0;i--){ const st=seats[i]; const k=st.x.toFixed(1)+','+st.z.toFixed(1); if(!used.has(k)&&!st.taken) return st; } return null; };   /* taken：替身坐的位子（classes3d.js）*/
    // 朋友坐一起：若圖上的朋友已在這區坐著，挑離他最近的空位
    const friendSeat=(id)=>{ for(const e of SOCIAL_GRAPH){ if(e.a!==id&&e.b!==id) continue; const other=EVENTS.npcOf(e.a===id?e.b:e.a); if(other&&other.seat) return other.seat; } return null; };
    const seatNear=(fs)=>{ let best=null, bd=1e9; for(const st of (E.zone.seats||[])){ const k=st.x.toFixed(1)+','+st.z.toFixed(1); if(used.has(k)) continue; const d=Math.hypot(st.x-fs.x,st.z-fs.z); if(d<bd){ bd=d; best=st; } } return bd<3.5?best:null; };
    const spawnAt=(id,ent)=>{ const act=ent.act; let n=null; if(act==='read'||act==='class'||act==='eat'||(act==='sit'&&E.zone.seats&&!ent.seat)){ const fs=!ent.seat&&friendSeat(id); const st=(fs&&!ent.room&&seatNear(fs))||seatFree(ent.seat,ent.room); if(!st) return; used.add(st.x.toFixed(1)+','+st.z.toFixed(1)); const pz=act==='class'?'sit':'read', door=refresh&&(E.indoor||E.zone.indoor)&&E.zone.spawn;
        if(door&&E.moveTo&&GM.sitAt){   /* 待在區域裡補人（室內）：從門口走進來、走到位子才坐下——不在座位上憑空出現（v9.6 回歸 flow_class_real：劇情課結束後同學在座位上冒出來）*/
          n=GM.spawnCharacter(id,door.x,door.z,{lv:door.lv|0,pose:'idle'});
          if(n){ n.seatTarget=st; n.idlePose='idle'; const sit=()=>{ n.seatTarget=null; const P=E.player; if(P&&P.seat&&Math.hypot(P.seat.x-st.x,P.seat.z-st.z)<0.35){ n.pose=n.idlePose='idle'; return; } GM.sitAt(n,st); n.pose=n.idlePose=pz; };   /* 位子被玩家坐走了：站在旁邊 */
            const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)) sit(); } }
        else { n=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:pz}); if(n) n.idlePose=pz; } }
      else if(act==='sit'&&ent.seat==='bell'){ n=GM.spawnCharacter(id,-30,20.94,{seat:{x:-30,z:20.94,yaw:Math.PI},pose:'sit'}); }
      else if(act==='sit'&&zoneId==='wenzhou'){ const st=GM.npc.yu&&GM.npc.yu.seat&&GM.npc.yu.seat.x===23.6?{x:28.4,z:7.94,yaw:Math.PI}:{x:23.6,z:7.94,yaw:Math.PI}; n=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:'sit'}); }
      else if(act==='linger'&&ent.at){ n=GM.spawnCharacter(id,ent.at[0],ent.at[1],{yaw:ent.at[2]||0,pose:'idle',lv:ent.at[3]|0}); }   /* 在日程寫的位置站一下（芷若經原下課後在 101 門口）*/
      else if(act==='barista'){ n=GM.spawnCharacter(id,-2.5,-5.15,{yaw:0,pose:'idle'}); if(n){ n.frozen=true; n.talkLabel='和店員說話'; n.staff='cafe'; } }   /* staff：比吧檯的點餐點優先（engine3d.js nearestInteractable）；沒有事件時和她說話就是點餐（talkCharacter）*/
      else if(act==='help'){ n=GM.spawnCharacter(id,2.6,-3.6,{yaw:-Math.PI/2,pose:'idle'}); if(n) n.frozen=true; }
      else if(act==='ta'){ n=GM.spawnCharacter(id,TA_SPOT[0],TA_SPOT[1],{yaw:0,pose:'idle'}); if(n) n.frozen=true; }
      else if(act==='club'){ const sp=CLUB_SPOTS[clubI++%CLUB_SPOTS.length]; n=GM.spawnCharacter(id,sp[0],sp[1],{yaw:Math.atan2(-sp[0],-sp[1]),pose:'idle',pockets:true}); if(n) n.frozen=true; }
      else if(act==='desk'){ /* legacy kai */ }
      else if(act==='follow'){ const P=E.player.obj; n=GM.spawnCharacter(id,P.position.x-Math.sin(P.rotation.y)*1.2+0.5,P.position.z-Math.cos(P.rotation.y)*1.2,{beh:'follow',lv:E.player.lv|0}); if(n) n.followOff=1.1; }   /* 和你一起走過去的人（邀約「現在一起過去」）*/
      else if(act==='wait'&&ent.invite){ const sp=E.zone.spawn||{x:0,z:0}; let x=sp.x+1.6, z=sp.z+1.2; if(E.canStand&&!E.canStand(x,z,0.32,0)){ x=sp.x; z=sp.z+1.6; } n=GM.spawnCharacter(id,x,z,{pose:'idle'}); if(n){ n.frozen=true; if(GM.face) GM.face(n,sp.x,sp.z); } }   /* 約在路上碰面（溫州街）：在入口附近等 */
      else { const rs=walkRoutes[zoneId]||[]; if(!rs.length){ n=GM.spawnCharacter(id,0,0,{}); return n; } const r=rs[(routeI++)%rs.length]; let wp=r[(Math.random()*r.length)|0];
        if(refresh){ const P=E.player.obj.position; for(const q of r) if(Math.hypot(q[0]-P.x,q[1]-P.z)>Math.hypot(wp[0]-P.x,wp[1]-P.z)) wp=q; }   /* 待在區域裡補人：從路線上離玩家最遠的點走出來，不在眼前憑空出現 */
        n=GM.spawnCharacter(id,wp[0],wp[1],{beh:'wander',waypoints:r}); } return n; };
    // 教授：依課表
    const F=G.flags;
    const z3c=zoneId==='cafe'&&S.z3Pending(G);   /* 芷若 Z3 那天：Café 的客人 21:40 起身離開、21:40～22:00 不補（店員不算）*/
    for(const id in CHARACTERS){ if(EVENTS.npcOf(id)) continue; const ent=schedFor(id,zoneId,G); if(!ent) continue; let n=null; const z3cust=z3c&&ent.act!=='barista'; if(z3cust&&hr>=S.Z3_SHUT&&hr<22) continue;
      if(refresh&&typeof ent.to==='number'&&typeof ent.from==='number'&&(ent.to<=24?ent.to-hr:(hr>=ent.from?ent.to-hr:ent.to-24-hr))<0.25) continue;   /* 待在區域裡補人：時段剩不到 15 分鐘的不補（劇情場景擋住補人時，結束後同學在座位上憑空出現、一分鐘後又起身離開——v9.6 回歸 flow_class_real）*/
      if(ent.prof==='class'){ const ts=E.zone.teacherSpot||{x:-1.5,z:-4.4}; n=GM.spawnCharacter(id,ts.x,ts.z,{yaw:0,pose:'idle'}); if(n) n.frozen=true; }
      else if(ent.prof==='wancai'){ n=GM.spawnCharacter(id,-5,1.2,{yaw:0,pose:'idle'}); if(n) n.frozen=true; }
      else if(ent.prof==='lobby'){ const cand=[].concat(E.zone.profSpot?[E.zone.profSpot]:[],[{x:-0.6,z:-5.4,yaw:0},{x:2.6,z:2.2,yaw:Math.PI},{x:-2.4,z:1.6,yaw:Math.PI/2}]);   /* 霖澤館一樓大廳：樓層簡介前、沙發旁 */
        const sp=cand.find(q=>!E.canStand||E.canStand(q.x,q.z,0.32,0))||(E.zone.spawn||{x:0,z:0}); n=GM.spawnCharacter(id,sp.x,sp.z,{yaw:sp.yaw||0,pose:'idle',lv:0}); if(n) n.frozen=true; }
      else n=spawnAt(id,ent);
      if(n) n.sched=true; if(n&&z3cust&&hr<S.Z3_SHUT) n.until=S.Z3_SHUT; }   /* sched：照行程出現的人（時段結束時 refreshSchedule 會讓他離開；劇情裡生出來的人不算） */
    if(refresh) return;   /* 待在區域裡補人：不重排不熟同學、不把已經在的人搬到朋友旁邊（pairUp 會瞬移） */
    // 不熟同學 pool：教室（上課時）、圖書館、校園各幾位（固定分配，讓玩家會重複看到同一批人）
    const poolIds=Object.keys(CHARACTERS).filter(id=>id.startsWith('pool_')); const pick=(from,n)=>poolIds.filter((_,i)=>i%5===from).filter(id=>S.present(id,G)).slice(0,n);   /* 畢業的不出現（AA_120 7-3：presence until）；分配不變 */
    if(zoneId==='classroom'&&(GM.G.flags.classNow||(typeof CLS!=='undefined'?CLS.liveIn(G,'classroom').length>0:((wd===4&&hr>=12.5&&hr<15.2)||(wd===2&&hr>=9.9&&hr<12.2))))){ for(const id of pick(1,3)) spawnAt(id,{act:'class'}); }   /* 上課時間照課表（D52）*/
    if(zoneId==='library'&&hr>=8&&hr<22){ for(const id of pick(2,2)) spawnAt(id,{act:'read'}); }
    if(zoneId==='campus'&&hr>=8&&hr<19){ for(const id of pick(3,2)) spawnAt(id,{act:'wander'}); }
    if(zoneId==='cafe'&&hr>=11&&hr<23&&!(z3c&&hr>=S.Z3_SHUT&&hr<22)){ for(const id of pick(4,1)){ const n=spawnAt(id,{act:'read'}); if(n&&z3c&&hr<S.Z3_SHUT) n.until=S.Z3_SHUT; } }
    if(zoneId==='gongguan'&&hr>=17.5&&hr<23.5){ for(const id of pick(0,2)) spawnAt(id,{act:'wander'}); }
    if(zoneId==='wenzhou'&&hr>=12&&hr<21){ for(const id of pick(0,1)) spawnAt(id,{act:'wander'}); }
    pairUp(zoneId,GM); }
  // NPC 與 NPC：依 SOCIAL_GRAPH，同一區域、同時段、都有空的兩個人會一起走或站著聊天（玩家不是世界的中心）
  function pairUp(zoneId,GM){ const E=GM.E; const free=n=>n&&!n.seat&&!n.frozen&&!n.paired&&(n.beh==='wander'||n.beh==='idle'); const nv=E.navOf?E.navOf(0):E.nav; const standable=(x,z)=>!nv||(nv.free(x,z)&&nv.free(x+0.3,z)&&nv.free(x-0.3,z)&&nv.free(x,z+0.3)&&nv.free(x,z-0.3));   /* 路人在地面那一層（玩家在萬才館陽台上讀檔時 E.nav 是第 1 層）*/
    const edges=SOCIAL_GRAPH.slice(); const poolFree=Object.keys(GM.npc).filter(k=>k.startsWith('pool_')&&free(GM.npc[k])); if(poolFree.length>=2&&Math.random()<0.6) edges.push({a:poolFree[0],b:poolFree[1],type:'classmate'});
    for(const e of edges){ const a=EVENTS.npcOf(e.a), b=EVENTS.npcOf(e.b); if(!free(a)||!free(b)) continue; if(Math.random()<0.3) continue; a.paired=b; b.paired=a; const ax=a.obj.position.x, az=a.obj.position.z;
      if(a.beh==='wander'&&Math.random()<0.5){ b.beh='buddy'; b.buddy=a; b.side=Math.random()<0.5?1:-1; b.followOff=0.9; b.waypoints=null; b.path=null; const bx=ax+b.side*0.9, bz=az; if(standable(bx,bz)) b.obj.position.set(bx,0,bz); else b.obj.position.set(ax,0,az+0.9); b.obj.rotation.y=a.obj.rotation.y; a.timer=0.5; }
      else { const yaw=Math.random()*Math.PI*2; const bx=ax+Math.sin(yaw)*1.15, bz=az+Math.cos(yaw)*1.15; if(!standable(bx,bz)){ a.paired=null; b.paired=null; continue; } b.obj.position.set(bx,0,bz); b.path=null; a.path=null; a.obj.rotation.y=yaw; b.obj.rotation.y=yaw+Math.PI; a.beh='chat'; b.beh='chat'; a.chatWith=b; b.chatWith=a; a.chatLead=true; a.pose='talk'; a.idlePose='talk'; b.pose='idle'; b.idlePose='idle'; b.pockets=Math.random()<0.6; a.timer=1+Math.random()*2; a.frozen=true; b.frozen=true; a.lookAt=b.obj.position; b.lookAt=a.obj.position; } } }
  S.pairUp=pairUp;
  /* 閒聊（2026-10-13 使用者試玩：洪珮瑜一直說「喜歡聽 podcast」、高子晴第一次聊天就說「期末成發你要來」）：
     ① SMALLTALK 的一句可以帶條件 {t,if}（EVENTS.cond；例如吉他社那幾句要在 ev_ziqing_club 之後）；
     ② 輪流說、說完一輪才重來（不會連續兩次同一句）；③ 一天只聊一句新的（熟悉度 +1 也只有這一次），同一天再找他就是打個招呼（旁白）；
     ④ 不太熟的同學（社會圖 B 層）沒有閒聊台詞：用旁白記一件聊到的事（facts），不把「喜歡聽 podcast」當成台詞一直講。
     記在 G.social.small[id]＝{day, used:[已經說過的句子], last}（新欄位，舊存檔沒有就從頭開始）*/
  /* 2026-10-13 AA_120：⑤ 條件鍵和事件一致——if／unless、term、week:[a,b]、location、time:[a,b]、weekday、once（true 一次；'term' 每學期一次，記在 r.once）；
     ⑥ 不熟的同學（B 層）說完自己的句子就只點頭或短招呼（AA_120 7-2：三句整個存檔各說一次，換學期不重播；見下面的 greetB）；他們的旁白只用 facts[0]（facts[1] 是心事，要等他自己說「其實……」）*/
  /* 閒聊階梯（AA_135、AA_136、BB_130；src/data/ladder.js；使用者 2026-10-15「要一層一層聊天認識彼此……可以限制每天只能多認識多少，但不要一直講一樣的話」，全案通過直接實作）：
     每人每天最多推進一層（G.social.ladder[id]＝已經聊過幾層、ladderDay[id]＝哪一天推進的；舊存檔從第 1 層開始）。條件不到、今天推進過＝短招呼（情境句優先、一天同一句只說一次；
     基本句輪替、不連續重複）。芷若在吧檯上班不推進；可昕（dateOnly）只在見面／視訊推進，路上不推進；學姊只有朋友的話（資料已經這樣寫） */
  S.LADDER_ON=G=>typeof LADDER!=='undefined';
  /* 一學期一個檔（企劃線 ladder/README，2026-10-16）：這學期有她的檔才推進；換學期從新檔第 1 層開始，上學期沒走完的層不帶過去。
     進度的 key：大一上照舊用人物 id（舊存檔）；其他學期用「id@學期」（例 heroine_01@Y1S2）。「一天最多推進一層」不分學期，照舊記在 ladderDay[id]。寒暑假沒有學期＝不推進、不招呼（照舊閒聊） */
  S.ladData=function(G,id){ if(!S.LADDER_ON(G)) return null; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
    const B=LADDER.byTerm||{Y1S1:LADDER.characters}, t=T&&T.id; if(t&&B[t]&&B[t][id]) return {L:B[t][id],term:t,key:t==='Y1S1'?id:id+'@'+t};
    if(!LADDER.byTerm&&LADDER.characters[id]&&!(LADDER.terms&&LADDER.terms[id])) return {L:LADDER.characters[id],term:t,key:id};   /* 舊格式、沒有學期的資料（測試用）*/
    if(B.Y1S1&&B.Y1S1[id]&&!(LADDER.terms&&LADDER.terms[id])) return {L:B.Y1S1[id],term:t,key:id};   /* 沒有寫學期的測試資料 */
    return null; };
  const ladRec=G=>{ const so=G.social||(G.social={}); if(!so.ladder||typeof so.ladder!=='object') so.ladder={}; if(!so.ladderDay||typeof so.ladderDay!=='object') so.ladderDay={}; if(!so.greetUsed||typeof so.greetUsed!=='object') so.greetUsed={}; return so; };
  const ladCtxOk=(G,e,id)=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hh=G.hour%24, ec=typeof EVENTS!=='undefined'&&EVENTS.cond;
    if(e.if&&!(ec&&EVENTS.cond(e.if))) return false; if(e.unless&&ec&&EVENTS.cond(e.unless)) return false; if(e.any&&!(ec&&e.any.some(c=>EVENTS.cond(c)))) return false;
    if(e.term&&!(T&&[].concat(e.term).includes(T.id))) return false; if(e.week&&!(T&&T.week>=e.week[0]&&T.week<=e.week[1])) return false;
    if(e.location&&!(Array.isArray(e.location)?e.location:[e.location]).includes(G.zone)) return false; if(e.time&&!(hh>=e.time[0]&&hh<e.time[1])) return false;
    if(e.weekday&&!e.weekday.includes(G.weekday)) return false; if(e.weather&&![].concat(e.weather).includes(G.weather)) return false; if(e.dayMin&&G.day<e.dayMin) return false;
    if(e.weekParity&&T){ const odd=T.week%2===1; if((e.weekParity==='odd')!==odd) return false; }   /* weekParity（BB，ladder README）：'odd'＝單週、'even'＝雙週（法服值班的短招呼；2026-10-16 AA-B 驗收：原本沒有處理）*/
    if(e.locTime&&e.locTime[G.zone]){ const lt=e.locTime[G.zone]; if(lt.weekday&&!lt.weekday.includes(G.weekday)) return false; if(lt.time&&!(hh>=lt.time[0]&&hh<lt.time[1])) return false; }
    if(e.unlessWeekdayTime){ const u=e.unlessWeekdayTime; if((!u.weekday||u.weekday.includes(G.weekday))&&(!u.time||(hh>=u.time[0]&&hh<u.time[1]))) return false; }
    if(e.unlessWorking&&S.ladWorking(G,id)) return false; return true; };
  const ladIf=c=>{ const ec=typeof EVENTS!=='undefined'&&EVENTS.cond; if(!c) return true; if(c.if||c.unless) return (!c.if||(ec&&EVENTS.cond(c.if)))&&!(c.unless&&ec&&EVENTS.cond(c.unless)); return !!(ec&&EVENTS.cond(c)); };   /* {if?,unless?} 或直接一個條件 */
  S.ladWorking=(G,id)=>{ try{ const en=schedEnt(CHARACTERS[id],G); return !!(en&&en.act==='barista'); }catch(e){ return false; } };
  S.ladNext=function(G,id,mode){ const D=S.ladData(G,id); if(!D) return null; const L=D.L, K=D.key;
    const so=ladRec(G); if(so.ladderDay[id]===G.day) return null; let st=L.steps[so.ladder[K]|0];
    while(st&&st.skipIf&&ladIf(st.skipIf)){ so.ladder[K]=(so.ladder[K]|0)+1; st=L.steps[so.ladder[K]]; }   /* skipIf（AA 2026-10-16）：條件成立＝這一層直接算過（記層數、不播、不算今天推進）——if 用 notMemory 會讓階梯永遠卡住 */
    if(!st) return null;
    if(L.context==='date'||st.dateOnly){ if(!mode||(st.dateOnly&&st.dateOnly!==mode)) return null; if(!(G.flags&&G.flags.dating_kexin)&&id==='kexin') return null; }
    return ladCtxOk(G,st,id)?st:null; };
  S.ladGreet=function(G,id){ const D=S.ladData(G,id), L=D&&D.L; if(!L||!L.greet) return null; const so=ladRec(G), u=so.greetUsed[id]&&so.greetUsed[id].day===G.day?so.greetUsed[id]:(so.greetUsed[id]={day:G.day,list:[],last:(so.greetUsed[id]||{}).last}); const g=L.greet;
    const work=S.ladWorking(G,id); for(const w of (g.when||[])){ if(w.working&&!work) continue; if(!w.working&&work) continue; if(u.list.includes(w.t)) continue; if(ladCtxOk(G,Object.assign({},w,{t:undefined}),id)){ u.list.push(w.t); u.last=w.t; return w.t; } }
    const B=g.base||[]; if(!B.length) return null; const n=(G.day*7+(so.ladder[D.key]|0)+u.list.length)%B.length; let t=B[n]; if(t===u.last&&B.length>1) t=B[(n+1)%B.length]; u.list.push(t); u.last=t; return t; };
  /* 播一層：她說的話 → 玩家的回答（最多 2）→ 她的收尾；rel、mem 照資料；推進一層（今天不再推進）*/
  /* linesIf／extraIf 的一套：情境 key（week、term、weekday、time、location、weather、weekParity、dayMin、locTime）照 ladCtxOk 檢查，其他（if、unless、或直接寫的條件）交給 EVENTS.cond。
     2026-10-16 AA-B 驗收：原本整套丟給 EVENTS.cond，它不認得 week 就忽略＝永遠成立（以安大一下第 3 週就說「杜鵑花謝了」）*/
  const LAD_CTX=['week','term','weekday','time','location','weather','weekParity','dayMin','locTime'];
  const ladAlt=(G,x,id)=>{ if(!G) return ladIf(x); const ctx={}, rest={}; for(const k in x){ if(k==='lines') continue; if(LAD_CTX.includes(k)) ctx[k]=x[k]; else rest[k]=x[k]; } if(Object.keys(ctx).length&&!ladCtxOk(G,ctx,id)) return false; return Object.keys(rest).length?ladIf(rest):true; };
  /* 法服的民眾服務（AA_132 F2、AA_140 G03／G47）：單週週六 9～12、第 3 週起、考試週停。day 那一週（還沒過的週六）起第一個值班的週六：{day, thisWeek}；十六週內沒有＝null（例：大一上第 16 週以後＝考試週＋七週寒假，下一次是大一下第 3 週）*/
  /* 日期字串 → 第幾天（'2026-02-14'）；找不到＝null。結果快取 */
  const dayKeyCache={}; S.dayOfKey=function(k){ if(k in dayKeyCache) return dayKeyCache[k]; let r=null; if(typeof CALENDAR!=='undefined') for(let d=1;d<2200;d++){ if(CALENDAR.dateOf(d).key===k){ r=d; break; } } dayKeyCache[k]=r; return r; };
  S.fafuSat=function(day){ if(typeof CALENDAR==='undefined'||day==null) return null; const sat0=day+(6-CALENDAR.dateOf(day).wd);
    for(let k=0;k<16;k++){ const s=sat0+7*k; if(s<=day) continue; const t=CALENDAR.termOf(s); if(t&&t.week>=3&&t.week%2===1&&!t.exam) return {day:s,thisWeek:k===0,wk:k}; } return null; };   /* wk：0＝這週六、1＝下週六…（週一開始算一週；當天是週六＝已經過了 9 點的值班，從下週算）*/
  S.ladLines=function(st,g,id){ const G=g||(typeof GAME!=='undefined'&&GAME.G)||null; const alt=(st.linesIf||[]).find(x=>ladAlt(G,x,id)); const L=(alt?alt.lines:st.lines||[]).slice(); for(const x of (st.extraIf||[])) if(ladAlt(G,x,id)) L.push(...(x.lines||[])); return L; };   /* linesIf：第一個成立的那一套取代 lines；extraIf：成立就在後面多說（AA 2026-10-16）*/
  S.ladPlay=async function(GM,who,id,st){ const G=GM.G, so=ladRec(G), D=S.ladData(G,id), K=D?D.key:id; for(const l of S.ladLines(st,G,id)) await GM.say(who,typeof l==='string'?l:l.t);
    let ch=null; if(st.choices&&st.choices.length){ const k=await GM.choose(st.choices.map(c=>({t:c.t}))); ch=st.choices[k]||st.choices[0]; if(ch.reply) await GM.say(who,ch.reply); }
    const rel=Object.assign({},st.rel||{}); if(ch&&ch.rel) for(const k in ch.rel) rel[k]=(rel[k]||0)+ch.rel[k]; if(Object.keys(rel).length&&SOCIAL.adjust) SOCIAL.adjust(id,rel);
    for(const m of [st.mem,ch&&ch.mem]) if(m&&SOCIAL.remember) SOCIAL.remember(id,m,st.id);
    so.ladder[K]=(so.ladder[K]|0)+1; so.ladderDay[id]=G.day; if(SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } return true; };
  /* 和她說話時：有下一層就播；沒有就短招呼。回傳 true＝處理了（呼叫的人不要再接舊的閒聊）*/
  S.ladderTalk=async function(GM,who,id,mode){ const G=GM.G; if(!S.ladData(G,id)) return false;
    const st=S.ladNext(G,id,mode); if(st) return S.ladPlay(GM,who,id,st);
    const g=S.ladGreet(G,id); if(!g) return false; await GM.say(who,g); if(SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; };
  /* 載妹墊（AA_137 第 5 節；使用者 2026-10-15「腳踏車要可以載人」；使用者 2026-10-16 更正：「一開始腳踏車就有載妹墊不用加裝 學姊也要給我載」——取代 AA_137 的公館車行加裝、學姊走在旁邊）：
     開局就有載妹墊。誰願意坐（約好同行的人）：可昕（交往中）、以安／語彤／芷若／子晴／沛珊／學姊（熟悉以上；女生側坐）、阿凱／阿哲（跨坐）。
     台詞：AA_137 的表（SEAT_AA）、BB-B 的 LADDER.bikeSeat（芷若、子晴、沛珊）——沒有寫的就不說話（學姊坐後座的台詞等 BB-B）。
     rideMode：'ride' 坐後座、'refuse' 還不願意（一起走路） */
  const SEAT_AA={ kexin:{need:'dating',on:'出發。……不要騎太快，我在後面看不到前面。'}, heroine_01:{min:'FAMILIAR',on:'好。不准突然煞車。',decline:'我走路。……不是不信任你，是我還不熟你的煞車。'},
    heroine_03:{min:'FAMILIAR',on:'……嗯。我很輕。'}, kai:{astride:true,any:true,on:'所以 這個墊子是給我的嗎'}, zhe:{astride:true,any:true} };
  S.rideInfo=function(G,id){ let bs=(typeof LADDER!=='undefined'&&LADDER.bikeSeat&&LADDER.bikeSeat[id])||null, a=SEAT_AA[id]||null;
    if(bs&&bs.whilePartner) bs=null;   /* 學姊：BB 原本寫「有伴侶時不坐、走在旁邊」——使用者 10-16 要她也坐後座；走路的兩句不用，坐後座的台詞還沒有 */
    if(a&&a.need==='dating') return G.flags&&G.flags.dating_kexin?{mode:'ride',on:a.on}:{mode:'refuse'};
    const d=Object.assign({},a||{},bs||{}); if(!(a&&a.any)&&typeof EVENTS!=='undefined'&&!EVENTS.cond({stage:{npc:id,min:d.min||'FAMILIAR'}})) return {mode:'refuse',decline:d.decline||null};
    return {mode:'ride',on:d.on||null,off:d.off||null,astride:!!(a&&a.astride)}; };
  S.rideMode=function(n){ const G=GM_ref&&GM_ref.G; if(!G||!n) return 'ride'; return S.rideInfo(G,n.charId||n.id).mode; };
  /* 上車、下車的一句話（字幕，不停下遊戲）；一趟只說一次 */
  S.onRide=function(GM,n,on){ const G=GM.G, id=n.charId||n.id, r=S.rideInfo(G,id), nm=SOCIAL.displayName(id); if(on){ n.astride=!!r.astride; if(r.on&&GM.caption) GM.caption(nm,'「'+r.on+'」',2800); } else if(r.off&&GM.caption) GM.caption(nm,'「'+r.off+'」',2600); };
  /* 不坐後座的理由（上車前）：回傳字幕的文字；null＝可以上車 */
  S.rideBlock=function(GM,n){ const G=GM.G, id=n.charId||n.id; if(S.rideMode(n)==='ride') return null; const r=S.rideInfo(G,id), nm=SOCIAL.displayName(id); return r.decline?nm+'：「'+r.decline+'」':'（'+nm+'說她走路就好。）'; };
  S.smallTalk=function(G,id){ const c=CHARACTERS[id]||{}, nm=SOCIAL.displayName(id); const R=G.social.small||(G.social.small={}), r=R[id]||(R[id]={day:0,used:[],last:null});
    if(r.day===G.day) return {narr:'（'+nm+'跟你打了個招呼，又忙自己的事。）',fresh:false};
    const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, tid=T?T.id:'none', hh=G.hour%24;
    const ok=e=>{ if(typeof e==='string') return true; const ec=typeof EVENTS!=='undefined'&&EVENTS.cond;
      if(e.if&&!(ec&&EVENTS.cond(e.if))) return false; if(e.unless&&ec&&EVENTS.cond(e.unless)) return false;
      if(e.term&&!e.term.includes(tid)) return false; if(e.week&&!(T&&T.week>=e.week[0]&&T.week<=e.week[1])) return false;
      if(e.location&&!(Array.isArray(e.location)?e.location:[e.location]).includes(G.zone)) return false;
      if(e.time&&!(hh>=e.time[0]&&hh<e.time[1])) return false; if(e.weekday&&!e.weekday.includes(G.weekday)) return false;
      if(e.midterm){ const n=S.daysToMidterm(G); if(n==null||n<e.midterm[0]||n>e.midterm[1]) return false; }   /* 柏翰的倒數（AA_120 7-1 第 1 項）：到第一科期中考的天數在範圍裡才說 */
      if(e.once&&r.once&&r.once[e.t]&&(e.once!=='term'||r.once[e.t]===tid)) return false; return true; };
    const B=c.social_layer==='B';
    /* 不熟的同學（AA_120 7-2）：三句各只說一次（整個存檔，once），換學期不從頭重播；說完以後只點頭或短招呼（greetB） */
    const fill=t=>t.indexOf('{n}')<0?t:t.replace('{n}',zhNum(S.daysToMidterm(G)));
    let cands=(SMALLTALK[id]||[]).filter(ok).map(e=>({key:typeof e==='string'?e:e.t,say:fill(typeof e==='string'?e:e.t),once:typeof e==='string'?null:e.once}));
    if(!cands.length&&B) return greetB(G,id,r,nm,T,tid);
    if(!cands.length&&c.facts&&c.facts.length) cands=c.facts.slice(0,1).map(f=>({key:'fact:'+f,narr:'（你們聊了幾句。'+nm+'：'+f+'。）'}));   /* 只用公開的 facts[0]（facts[1] 是心事）*/
    if(!cands.length){ r.day=G.day; r.last='__greet'; return {narr:'（'+nm+'跟你打了個招呼，聊了兩句天氣。）',fresh:true}; }
    let pick=cands.find(q=>!r.used.includes(q.key));
    if(!pick){ if(B){ r.day=G.day; return {narr:'（'+nm+'對你點點頭。）',fresh:false}; } r.used=[]; pick=cands.find(q=>q.key!==r.last);
      if(!pick){ r.day=G.day; r.last='__greet'; return {narr:'（'+nm+'跟你打了個招呼，聊了兩句天氣。）',fresh:true}; } }   /* 只剩一句能說：不連續兩天說同一句，中間隔一次打招呼 */
    r.used.push(pick.key); r.last=pick.key; r.day=G.day; if(pick.once){ (r.once||(r.once={}))[pick.key]=pick.once==='term'?tid:true; }
    const out={fresh:true}; if(pick.say) out.say=pick.say; else out.narr=pick.narr; return out; };
  /* 不熟同學說完三句以後（AA_120 7-2 第 3 點）：開學（第 1～3 週）、期中（第 7～9 週）、期末（第 15～18 週）偶爾一句短招呼——每人每天最多一句、
     同一個人同一學期同一句只說一次；其他日子只有旁白（點頭、揮手、笑一下）。記在 r.greet＝{term, used} */
  const B_GREET=[{w:[1,3],L:['「開學了。」','「這學期修了什麼？」']},{w:[7,9],L:['「期中加油。」','「你也在趕報告嗎？」']},{w:[15,18],L:['「期末了，撐住。」','「考完了嗎？我還有一科。」']}];
  const B_NOD=['（{n}對你點點頭。）','（{n}揮了一下手。）','（{n}抬頭看了你一眼，笑了一下。）'];
  function greetB(G,id,r,nm,T,tid){ r.day=G.day; const per=T&&B_GREET.find(p=>T.week>=p.w[0]&&T.week<=p.w[1]); let hsh=0; for(const ch of id) hsh=(hsh*31+ch.charCodeAt(0))>>>0;
    if(per&&(G.day+hsh)%3===0){ const g=r.greet||(r.greet={}); if(g.term!==tid){ g.term=tid; g.used=[]; } const line=per.L.find(t=>!g.used.includes(t)); if(line){ g.used.push(line); return {say:line,fresh:false}; } }
    return {narr:B_NOD[(G.day+hsh)%B_NOD.length].replace('{n}',nm),fresh:false}; }
  S.greetB=greetB;
  /* 柏翰的期中倒數：今天到這學期第一個期中考時段（照玩家的課表與日曆；放假的日子沒有課，自然跳過）的天數；這學期沒有期中考＝null */
  S.daysToMidterm=function(G){ if(typeof CLS==='undefined'||typeof CALENDAR==='undefined') return null; const t=CALENDAR.termOf(G.day); if(!t) return null;
    for(let d=G.day;d<G.day+140;d++){ const tt=CALENDAR.termOf(d); if(!tt||tt.id!==t.id) return null; if(tt.exam==='mid'&&CLS.dayItems(G,d).some(it=>it.exam==='mid')) return d-G.day; } return null; };
  const zhNum=n=>{ if(n==null) return ''; const D='零一二三四五六七八九'; if(n<10) return D[n]; if(n<20) return '十'+(n%10?D[n%10]:''); return D[Math.floor(n/10)]+'十'+(n%10?D[n%10]:''); };
  S.zhNum=zhNum;
  /* 不熟同學說心事（「其實……」）的時機（AA_120 7-2）：三句裡不需要心事的那兩句都說過了，而且今天還沒聊過新的（一天一句）；沒有台詞的人照舊聊過三次 */
  S.secretReady=function(G,id){ const L=(SMALLTALK[id]||[]).filter(e=>typeof e==='object'&&e.once&&!(e.if&&e.if.memory)); const r=(G.social.small||{})[id]; if(r&&r.day===G.day) return false;
    if(!L.length) return SOCIAL.rel(id).talked>=3; return !!(r&&r.once)&&L.every(e=>r.once[e.t]); };
  /* 當面約、交換聯絡方式（talkCharacter 和舊的 talkAn／talkZhe／talkSis／talkKai／talkYu 共用；使用者 2026-10-15：「有手機可以約人，見到本人反而不能約？」——以安、阿哲等走舊的對話，原本沒有這個選單）*/
  S.offerInvite=async function(GM,id,n,who){ const G=GM.G, c=CHARACTERS[id]; if(!c||typeof INV==='undefined') return; who=who||{name:SOCIAL.displayName(id),obj:n&&n.obj,charId:id}; { const her=c.gender==='f'?'她':'他', O=[];   /* 當面約（使用者第 3 點；src/invites3d.js）：「認識」就可以，不用聯絡方式（AA_124 1-7）*/
      if(INV.canInvite(G,id)&&!(G.invites||[]).some(v=>v.who===id&&v.state==='going')) O.push({t:'約'+her+'去…',hint:'Café、總圖、吃飯、散步',k:'inv'});
      /* 保底的「交換聯絡方式」（AA_124 1-7 第 2 點）：到「有點熟」以後還沒有聯絡方式的人；對方的一句照 INVITE_DATA.exchange（還沒寫的人用旁白）*/
      if(INV.canInvite(G,id)&&!INV.hasContact(G,id)&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('FAMILIAR')) O.push({t:'交換聯絡方式',k:'ex'});
      if(O.length){ O.push({t:'就這樣'}); const k=await GM.choose(O); const o=O[k]||{};
        if(o.k==='inv') await INV.flow(GM,id,n,true);
        else if(o.k==='ex'){ const L=((typeof INVITE_DATA!=='undefined'&&INVITE_DATA.exchange)||{})[id]||[{narr:'（你們交換了聯絡方式。）'}]; for(const l of L){ if(l.say) await GM.say(who,l.say); else await GM.say(null,l.narr); } INV.addContact(G,id); GM.toast&&GM.toast('加了'+SOCIAL.displayName(id)+'的聯絡方式'); } } } };
  // 與資料驅動人物對話：先看事件，再閒聊；名字依揭露階段
  S.talkCharacter=async function(id,n){ const G=GM_ref.G; const first=!SOCIAL.has(id,'FIRST_MET'), unmetH=first&&/^heroine_0[1-5]$/.test(id); if(!unmetH) SOCIAL.talkedTo(id);   /* 還沒見過的女主角：搭話不算認識——不加熟悉度、不揭露名字（AA 2026-10-13 P1-1：原本搭話一次名字就出現在按鈕上）；她的相遇事件自己會記（SOCIAL.meet）*/ if(EVENTS.onInteract(id)){ const lab=()=>{ n.name=SOCIAL.displayName(id); n.talkLabel=(n.staff&&!SOCIAL.has(id,'FIRST_MET'))?'和店員說話':'和'+n.name+'說話'; }; lab(); const w=setInterval(()=>{ if(!(GM_ref.D&&GM_ref.D.busyDepth>0)){ clearInterval(w); lab(); } },400); return; }   /* 事件是非同步的：演完（例：兩點半的第一次見面記下 FIRST_MET）再更新按鈕上的名字——原本在事件開始前就定了，見過以後還是「和不認識的女生說話」（v9.7 回歸 flow_first_meet C）*/
    if(typeof INV!=='undefined'){ const iv=INV.meetable(G,id); if(iv){ await INV.meet(GM_ref,iv,n); n.name=SOCIAL.displayName(id); n.talkLabel='和'+n.name+'說話'; return; } }   /* 約好的時間在約好的地方：見面 */
    if(n&&n.staff==='cafe'){ await counter(GM_ref,'兩點半 Café',CAFE_MENU); n.name=SOCIAL.displayName(id); n.talkLabel=SOCIAL.has(id,'FIRST_MET')?'和'+n.name+'說話':'和店員說話'; return; }   /* 吧檯後面的店員：今天沒有她的事件（兩點半的店員一天一次）就是點餐——店員擋住了吧檯的點餐點（engine3d.js），不能讓玩家在她上班時買不到東西 */
    const GM=GM_ref; GM.sceneBegin({adv:id}); const E=GM.E; if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); const c=CHARACTERS[id]; const who={name:SOCIAL.displayName(id),obj:n.obj,charId:id,pose:n.pose};
    /* 五位女主角的第一次見面是專屬的事件（AA_120 3-1，AA、BB 2026-10-13：只算五位女主角）：還沒見過時被搭話不走一般自我介紹、不記 FIRST_MET，只有一句旁白；舊存檔已經記下的不追溯 */
    if(unmetH){ const busy=n.seat||n.pose==='read'||n.pose==='sit'||n.idlePose==='read'; await GM.say(null,busy?'（她低頭在忙自己的事，沒有注意到你。）':'（她看了你一眼，對你點了一下頭，又轉回去忙自己的事。）'); n.name=SOCIAL.displayName(id); n.talkLabel='和'+n.name+'說話'; GM.sceneEnd(); return; }
    if(first){ SOCIAL.meet(id,G.zone); if(c.social_layer==='B'){ const py=SOCIAL.playerYear?SOCIAL.playerYear():1, cy=SOCIAL.yearOf?SOCIAL.yearOf(id):(c.year||1); await GM.say(who,cy>py?'「你是大'+['','一','二','三','四'][py]+'的吧？」':(py===1?['「……嗯？喔，你是我們班的吧。」','「你好。……我們是不是修同一堂民總？」','「欸，你是周老師點過的那個。」'][(Math.random()*3)|0]:'「……嗯？喔，你是我們班的吧。」'));   /* 年級跟著遊戲走（AA_120 7-3）*/   /* 學長姊不會說「同一堂民總」（AA_120 3-4）*/ await GM.say(who,'「我是'+c.name+'。」'); if(c.facts&&c.facts[0]) await GM.say(who,'「'+c.facts[0]+'。……你呢？」'); } else { await GM.say(who,'「你好，我是'+c.name+'。'+(c.department||'')+'的。」',{expr:'smile'}); if(c.personality) await GM.say(null,c.personality.split('；')[0]+'。'); } SOCIAL.adjust(id,{fam:3}); }
    else { const rv=SOCIAL.reveal(id); if(SOCIAL.playUp&&await SOCIAL.playUp(GM,who,id)){ if(SOCIAL.activity) SOCIAL.activity(id,'chat'); }   /* 升到有點熟／朋友／好朋友以後的下一次見面：先說門檻台詞（AA_124 1-6、BB_120 第 1 節），這次就不閒聊 */
      else if(c.social_layer==='B'&&rv==='ACQUAINTANCE'&&c.facts&&c.facts[1]&&S.secretReady(G,id)&&!SOCIAL.has(id,'SHARED_SECRET')){ await GM.say(who,'「其實……'+String(c.facts[1]).replace(/^其實/,'')+'。沒跟很多人講過。」'); SOCIAL.remember(id,'SHARED_SECRET',c.facts[1]); SOCIAL.adjust(id,{fam:4,trust:4}); const SM=G.social.small||(G.social.small={}); (SM[id]||(SM[id]={day:0,used:[],last:null})).day=G.day; }
      else if(await S.ladderTalk(GM,who,id)){}   /* 閒聊階梯（大一上的七位＋之後的）：有資料的人走階梯，沒有的照舊閒聊 */
      else { const L=S.smallTalk(G,id); if(L.say) await GM.say(who,L.say,{expr:'smile'}); else await GM.say(null,L.narr); if(SOCIAL.activity){ SOCIAL.activity(id,'chat'); if(L.fresh) SOCIAL.activity(id,'chatNew'); } else if(L.fresh) SOCIAL.adjust(id,{fam:1}); } }   /* AA_124 1-2：今天第一次聊天熟悉 +2、聽到新的一句自在 +1（一天一次、有上限）*/
    if(!first) await S.offerInvite(GM,id,n,who);
    n.name=SOCIAL.displayName(id); n.talkLabel='和'+n.name+'說話'; GM.sceneEnd(); };
  let GM_ref=null; let libSceneOn=false;
  function spawnCompanion(GM){ const E=GM.E; const P=E.player.obj; const lv=E.player.lv|0; const n=GM.spawnNPC('an',AN,P.position.x-Math.sin(P.rotation.y)*1.2+0.6,P.position.z-Math.cos(P.rotation.y)*1.2,{lv,beh:'follow',greet:false,talk:n=>talkAn(GM,n),talkLabel:'和小安說話'}); n.followOff=1.1;
    if(E.unstick) E.unstick(n,6); return n; }   /* 和玩家同一層、站得住的地方（v9.5 審查：從萬才館二樓的門出來是校園第 1 層的平台，原本放在第 0 層，生在平台的石頭裡）。一起走的人不會每隔一段時間對你揮手 */  // 一起走的人不會每隔一段時間對你揮手
  // ---------- 進入區域時 ----------
  S.onEnter=async function(zoneId,GM,opts){ opts=opts||{}; const G=GM.G, F=G.flags, E=GM.E; if(G.day===1&&zoneId==='dorm'&&!F.introDone){ await introDorm(GM); return; }
    if(typeof INV!=='undefined'&&!opts.fromLoad&&await INV.arrive(GM,zoneId)) return;   /* 一起走過去的人到了約好的地方：見面 */
    if(zoneId==='campus'&&G.day===2&&!F.classDone&&!F.campusIntro){ F.campusIntro=true; await campusMorning(GM); return; }
    if(zoneId==='classroom'&&isThu(G)&&!F.classDone&&h(G)>=12.5&&h(G)<15.2){ await classScene(GM); return; }
    if(zoneId==='linze'&&isThu(G)&&!F.classDone&&h(G)>=12.5&&h(G)<15.2&&!opts.fromLoad){ await GM.sleep(700); GM.caption('','民法總則在二樓的 201 階梯教室。樓梯在大廳西側，電梯在中庭。',4200); GM.setGoal('上二樓，到 201 教室上課'); }   /* v9.4：霖澤館改成真的大樓（大廳、樓梯、二樓），教室在二樓 */
    if(zoneId==='cafe'&&F.companion==='an'&&F.plan==='cafe'){ await cafeScene(GM); return; }
    if(zoneId==='library'&&F.companion==='an'&&F.plan==='library'){ await libraryScene(GM); return; }
    if(zoneId==='dorm_hall'&&!F.dormHallHint&&!opts.fromLoad&&(E.player.lv|0)===0){ F.dormHallHint=true; await GM.sleep(900); GM.caption('','你和阿凱的房間在二樓，203。樓梯在走廊北邊。',3600); }   /* 宿舍走廊（D44）：第一次從大門進來時說一次房間在哪（不是劇情，只是指路）*/
    if(zoneId==='library_hall'&&F.companion==='an'&&F.plan==='library'&&!opts.fromLoad){ await GM.sleep(900); GM.caption('','自習區在二樓：從中間的大樓梯上去。',3600); GM.setGoal('上二樓的自習區（跟小安一起）'); }   /* 總圖（D43）：走到二樓就開始「總圖的下午」（S.tick）*/
    if(zoneId==='gongguan'&&F.companion==='an'&&!F.gongguanLine){ F.gongguanLine=true; await GM.sleep(1200); GM.caption('小安','公館這邊人真的很多。溫州街在那邊，過馬路再往裡面走。',3600); GM.setGoal('往溫州街（跟小安一起）'); }
    if(zoneId==='wenzhou'&&F.companion==='an'&&!F.wenzhouLine){ F.wenzhouLine=true; await GM.sleep(1000); GM.caption('小安','就是那間，招牌是深色的。他們開到凌晨兩點半，所以叫兩點半。',3800); GM.setGoal('進入 兩點半 Café'); }
    if(zoneId==='dorm'&&F.afternoonDone&&!F.nightKai&&GM.npc.kai){ F.nightKai=true; await GM.sleep(800); GM.caption('阿凱','喔，回來了。今天很晚耶。',2600); }
    if(G.social&&!E.player.busy&&!GM.D.active&&!opts.fromLoad){ await GM.sleep(600); if(!E.player.busy&&!GM.D.active) EVENTS.onEnter(zoneId); } };
  // ---------- 每 0.5 秒左右呼叫 ----------
  const AMBIENT=[{zone:'campus',x:-47,z:13.5,r:7,key:'bellArgue',from:8,to:18,lines:['「……所以網頁標價到底算不算要約？」','「你煩不煩，都下課了。」']},{zone:'campus',x:-18,z:13,r:5,key:'clubTable',from:10,to:17.5,lines:['「同學！法律服務社了解一下？一年級也可以喔。」']},{zone:'campus',x:34,z:-90,r:8,key:'lawPlaza',from:15.2,to:17,lines:['有人在霖澤館前的長椅上翻著判決，旁邊放著一杯沒喝完的飲料。']},{zone:'gongguan',x:-40,z:12,r:7,key:'mrt',from:17,to:22,lines:['捷運站出口湧出一波人，又很快散進巷子裡。']},{zone:'wenzhou',x:26,z:8,r:7,key:'park',from:16,to:21,lines:['小公園的長椅上有隻貓在睡覺。有人蹲在旁邊拍照。']}];
  /* 待在同一個區域時，照行程該出現的人要出現、時段結束的人要離開（2026-10-11 v9.5 審查：populateSchedule 原本只在進入區域時跑，
     人物線索（S.whereIs、大地圖 👥）照時間說「阿哲在校園」，但要出去再進來他才會出現）。每 3 秒看一次（遊戲裡約 1.2 分鐘）：
     該來的人照進入區域時同一套規則補上；時段結束的人（sched，劇情生出來的不算）離玩家 12 m 以上、或不在畫面裡才離開，不在玩家眼前消失 */
  let schedT=3;
  function inView(E,o){ const cam=E.camera; if(!cam||typeof THREE==='undefined'||!THREE.Vector3.prototype.project) return true; const v=new THREE.Vector3(o.x,o.y+1.0,o.z).project(cam); return v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05; }
  function refreshSchedule(GM){ const E=GM.E, G=GM.G; if(!G.social||!E.zone||!E.player) return; const zoneId=G.zone;
    try{ populateSchedule(zoneId,GM,true); }catch(e){ console.warn('schedule refresh failed',e); }
    lingerMove(GM,zoneId); roomMove(GM,zoneId);
    const P=E.player.obj.position, hr=h(G); for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n) continue; const gone=(n.sched&&n.charId===id&&!schedFor(id,zoneId,G))||(n.until!=null&&hr>=n.until); if(!gone) continue;
      if(G.flags.companion&&id===G.flags.companion) continue; const o=n.obj.position, d=Math.hypot(o.x-P.x,o.z-P.z), vis=inView(E,o);
      /* 2026-10-13 使用者試玩：「林芷若第一次講完話直接消失在校園，本來在我前面」——時段結束時只要鏡頭沒對著她就拿掉（玩家一轉頭人就不見了）。
         改成：還在附近的人先走到最近的門口／出口，走到了才離開（進了那棟樓、走出這一區）；已經在遠處又看不到的照舊直接離開 */
      if(n.leaving){ if(n.arrived||(d>=30&&!vis)) GM.removeNPC(id); continue; }
      if(d>=12&&!vis){ GM.removeNPC(id); continue; }
      if(walkAway(GM,n)) continue;
      if(d<12&&vis) continue; GM.removeNPC(id); }
    for(const n of (E.npcs||[]).slice()){ if(!n||!n.isExtra||n.clerk||n.until==null||hr<n.until) continue;   /* 路人（不在 GM.npc）有 until 的：同一套，走到門口才離開（芷若 Z3 那天 Café 座位 6 的客人）*/
      const o=n.obj.position, d=Math.hypot(o.x-P.x,o.z-P.z), vis=inView(E,o);
      if(n.leaving){ if(n.arrived||(d>=30&&!vis)) E.removeNPC(n); continue; }
      if(d>=12&&!vis){ E.removeNPC(n); continue; }
      n.pose=n.idlePose='idle'; if(walkAway(GM,n)) continue;
      if(d<12&&vis) continue; E.removeNPC(n); } }
  /* 同一區、下一個時段是「在某個位置站一下」（linger，例：芷若經原 12:10 下課後走到 101 門口的走廊，12:40 才去吃飯）：已經在場的人（坐在教室裡）起身走過去，不瞬移；
     走不到就留在原地（下一個時段照常離開）。進區域時才生出來的人直接站在那裡（spawnAt）*/
  function lingerMove(GM,zoneId){ const E=GM.E, G=GM.G; for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n||!n.sched||n.leaving||n.lingerGo||n.charId!==id) continue; const ent=schedFor(id,zoneId,G); if(!ent||ent.act!=='linger'||!ent.at) continue;
      const [x,z,yaw,lv]=ent.at; if(Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<0.6&&(n.lv|0)===(lv|0)) continue; if(n.lingerFail===ent) continue;
      if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; n.lingerGo=true;
      if(!E.moveTo(n,x,z,()=>{ n.lingerGo=false; n.obj.rotation.y=yaw||0; n.pose=n.idlePose='idle'; },lv|0)){ n.lingerGo=false; n.lingerFail=ent; } } }
  /* 同一區、下一個時段換到另一間（作息寫了不同的 room，坐著的動作：read、class、eat、sit）：已經在場的人起身、走過去坐到那一間的空位，不瞬移、不留在原地
     （2026-10-14 flow_b4_lecture：演講完以安、小語的作息換成博雅的圓桌，原本只處理「走到某一點站著」（linger）和「離開」，兩個人一直坐在 101）。
     同一間有朋友已經坐著（或正走過去）＝優先坐同一張桌子；沒有空位、走不到＝留在原地（下一個時段照常）*/
  const ROOM_ACTS=['read','class','eat','sit'];
  function roomMove(GM,zoneId){ const E=GM.E, G=GM.G; if(!E.zone||!E.zone.seats) return; for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n||!n.sched||n.leaving||n.lingerGo||n.roomGo||n.charId!==id||n.paired||n.beh==='follow') continue;
      if(G.flags&&G.flags.companion===id) continue; const ent=schedFor(id,zoneId,G); if(!ent||!ent.room||!ROOM_ACTS.includes(ent.act)||ent.seat) continue;
      const cur=(n.seat&&n.seat.room)||(n.seatTarget&&n.seatTarget.room)||null; if(cur===ent.room||n.roomFail===ent) continue;
      if(!cur&&E.zone.roomAt&&E.zone.roomAt(n.obj.position.x,n.obj.position.z,n.lv|0)===ent.room) continue;   /* 站在那一間裡（還沒坐下）：照原本的規則 */
      const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&Math.hypot((m.seat||m.seatTarget).x-st.x,(m.seat||m.seatTarget).z-st.z)<0.35)||(E.player&&E.player.seat&&Math.hypot(E.player.seat.x-st.x,E.player.seat.z-st.z)<0.35);
      const free=E.zone.seats.filter(st=>st.room===ent.room&&!busy(st)); if(!free.length){ n.roomFail=ent; continue; }
      const tables=new Set(E.npcs.filter(m=>m!==n&&m.charId&&(m.seat||m.seatTarget)&&(m.seat||m.seatTarget).room===ent.room).map(m=>(m.seat||m.seatTarget).table).filter(Boolean));
      const st=free.find(q=>q.table&&tables.has(q.table))||free[free.length-1]; const pz=ent.act==='class'?'sit':'read';
      const old=n.seat, oldPose=n.pose; if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; n.seatTarget=st; n.roomGo=true;   /* 先站起來（座位的格子是擋住的，從座位旁邊才找得到路）*/
      const sit=()=>{ n.roomGo=false; n.seatTarget=null; if(busy(st)){ n.pose=n.idlePose='idle'; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pz; };
      const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)){ n.roomGo=false; n.seatTarget=null; n.roomFail=ent; if(old&&GM.sitAt){ GM.sitAt(n,old); n.pose=n.idlePose=oldPose||'sit'; } } } }   /* 走不到：坐回原來的位子 */
  /* 時段結束：走到最近的出口（區域的出口、建築入口）——走得到才走；坐著的先起身；聊天的對象回到原本的樣子 */
  function walkAway(GM,n){ const E=GM.E; const o=n.obj.position, lv=n.lv|0; let best=null, bd=1e9;
    for(const it of (E.interactables||[])){ if(!it.exit&&!it.enter) continue; if((it.lv|0)!==lv) continue; const dd=Math.hypot(it.x-o.x,it.z-o.z); if(dd<bd){ bd=dd; best=it; } }
    if(!best) return false;
    if(n.seat&&GM.standUp) GM.standUp(n); if(n.paired){ const b=n.paired; b.paired=null; if(b.beh==='chat'){ b.beh='idle'; b.chatWith=null; b.pose=b.idlePose='idle'; } n.paired=null; } n.chatWith=null;
    n.beh='leave'; n.frozen=false; n.waypoints=null; n.leaving=true; n.arrived=false;
    if(!E.moveTo(n,best.x,best.z,()=>{ n.arrived=true; },lv)){ n.leaving=false; return false; }
    return true; }
  S.walkAway=walkAway;
  S._day2={walkChecks:p=>walkChecks(p),startWalkTalk:GM=>startWalkTalk(GM),meetAn:GM=>meetAn(GM),cafeScene:GM=>cafeScene(GM),libraryScene:GM=>libraryScene(GM),talkAn:(GM,n)=>talkAn(GM,n)};   /* 測試用（tests/day2_whylaw_unit.js）：第二天下課後的邀約、走路對話、Café、總圖、之後找以安 */
  /* 麵店的固定客人（AA_110 第 6-3 節，AA 暫定：「週二、週四 17:30–19:00，阿鳳麵店裡固定有兩到四個法律系的一般同學」——是日程，不是活動）：
     上課日（不是放假）才有；同一天同一批人（日期當種子：出去再進來看到同樣的人坐同樣的位子）；坐在東西兩張桌子北側先坐（中間那張留給玩家和阿哲，
     玩家的「坐下吃麵」坐南側）；進店時已經在吃（先套好坐姿）；19:00 起身走到門口才離開；路人沒有名字（有名字的人照各自的日程）。 */
  const NDL_SEATS=[[-3,-0.3,0],[3,-0.3,0],[-3,1.3,Math.PI],[3,1.3,Math.PI]];
  /* 麵店日：上課週（不是考試週、不是國定假日）的週二、週四 */
  S.noodleDay=function(day){ if(typeof CALENDAR==='undefined') return false; const wd=CALENDAR.dateOf(day).wd, t=CALENDAR.termOf(day); return (wd===2||wd===4)&&CALENDAR.kind(day)==='term'&&!!t&&!t.exam; };
  const NDL_PINGS=['麵店。我揪了。','麵店。我先到。','今天阿姨有滷蛋。','麵店。不用回。'];
  S.noodleOn=function(G){ if(typeof CALENDAR==='undefined') return false; const h=G.hour%24, wd=CALENDAR.dateOf(G.day).wd; return (wd===2||wd===4)&&CALENDAR.kind(G.day)==='term'&&h>=17.5&&h<19; };
  S.noodleCount=G=>{ let sd=(G.day*7919+13)%2147483646+1; sd=(sd*16807)%2147483647; return 2+Math.floor(((sd-1)/2147483646)*3); };
  let ndlLastH=null;
  let springBusy=false;   /* 春假三選一的選單正在問（S.tick）*/
  function noodleRegulars(GM,entering){ const E=GM.E, G=GM.G; if(G.zone!=='noodle'||!E.player) return; const mine=E.npcs.filter(n=>n.ndlRegular);
    const hh=G.day*24+G.hour; if(ndlLastH==null||Math.abs(hh-ndlLastH)>0.2) entering=true; ndlLastH=hh;   /* 時間跳過（跳過時間、讀檔）：照新的時間直接坐好，不從門口走進來 */
    if(!S.noodleOn(G)){ for(const n of mine){ if(n.leaving) continue; if(GM.standUp) GM.standUp(n); n.leaving=true; n.beh='leave'; if(!E.moveTo(n,0,3.6,()=>E.removeNPC(n))) E.removeNPC(n); } return; }
    const P=E.player.obj.position, cnt=S.noodleCount(G);
    for(let i=0;i<cnt;i++){ if(mine.some(n=>n.ndlIdx===i)) continue; const [x,z,yaw]=NDL_SEATS[i];
      if(E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.3)||Math.hypot(P.x-x,P.z-z)<0.6) continue;   /* 位子有人（阿哲、玩家）就不坐 */
      const o=CHAR.build(extraSpec(300+((G.day*3+i)%60))), seat={x,z,yaw};
      if(entering){ o.position.set(x,0,z); o.rotation.y=yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,seat,ndlRegular:true,ndlIdx:i}); continue; }
      /* 玩家在店裡時 17:30 到了：從門口走進來、走到位子坐下（不在玩家眼前憑空出現）*/
      o.position.set(0,0,3.6); o.rotation.y=Math.PI; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,ndlRegular:true,ndlIdx:i});
      const ap=(GM.seatApproach&&GM.seatApproach(seat))||[x,z+(yaw?0.6:-0.6)]; if(!E.moveTo(n,ap[0],ap[1],()=>{ if(GM.sitAt) GM.sitAt(n,seat); })&&GM.sitAt) GM.sitAt(n,seat); } }
  S.noodleRegulars=noodleRegulars;
  S.refreshSchedule=refreshSchedule;
  S.tick=function(GM,dt){ const G=GM.G, F=G.flags, E=GM.E; if(E.player.busy||GM.D.active) return; const P=E.player.obj.position;
    schedT-=dt; if(schedT<=0){ schedT=3; refreshSchedule(GM); }
    if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ CLS.tick(GM); }catch(e){ console.warn('CLS.tick',e); } }   /* 課表（D52）*/
    if(typeof PHONE!=='undefined'){ try{ S.phoneRules(GM); PHONE.tick(G,out=>{ if(out.length) GM.toast('手機｜'+PHONE.notice(G,out[0]),3800); if(GM.phoneBadge) GM.phoneBadge(); }); }catch(e){ console.warn('PHONE',e); } }   /* 手機：排定時間的訊息（交接包 v1）*/
    if(G.zone==='noodle') noodleRegulars(GM);   /* 麵店的固定客人：時間到了進來、離開 */
    if(typeof HOME!=='undefined'&&HOME.at(G)){ HOME.tick(GM); return; }   /* 讀檔時人在臺北的家：回到家的選單（在家的時候宿舍、校園的事件不發生）*/
    if(G.zone==='dorm'){ S.dormItems(GM); if(fyPotsTick(GM,dt)) return; }
    S.kaiDormTick(GM);   /* 室友阿凱的宿舍事件（K-D3 鍵盤聲、K-D5 和解；吵架第 4 天自己和好）*/   /* 房間裡跟著劇情出現的東西（黃金葛、阿凱的鍵盤盒子、方奕廷的三盆植物）*/
    if(typeof CROWD!=='undefined'){ try{ CROWD.tick(GM,dt); }catch(e){ console.warn('CROWD.tick',e); } }   /* 公共場景的人流（D55）*/
    if(typeof INV!=='undefined'){ try{ INV.tick(GM); if(INV.walkChat) INV.walkChat(GM,dt); }catch(e){ console.warn('INV.tick',e); } }   /* 邀約：過了時間沒見到＝沒赴約；一起走過去的路上聊一句 */
    let outP=null; if(typeof OUT!=='undefined'){ try{ const p=OUT.tick(GM); outP=p; if(p&&p.catch) p.catch(e=>console.warn('OUT.tick',e)); }catch(e){ console.warn('OUT.tick',e); } }   /* 出遊（離開 3D 地圖的約）：時間到了問「出發」*/
    if(!outP&&!springBusy&&typeof PHONE!=='undefined'&&S.springPending(G)){ springBusy=true; S.springPrompt(GM).catch(e=>console.warn('spring',e)).finally(()=>{ springBusy=false; }); }   /* 春假三選一（交接包 v2 C9）*/
    /* 法律學院圖書館閉館（D53，使用者 2026-10-13）：閉館前 10 分鐘廣播；過了閉館時間人還在館裡，館員請你離館（回到萬才館大廳的門口），
       並告訴你下次幾點開、可以改去總圖或回宿舍。不讓法圖變成 24 小時開放（讀檔回到閉館後的館裡也一樣）*/
    if(G.zone==='lawlib'&&typeof PLACES!=='undefined'&&PLACES.hours.lawlib&&typeof LL3!=='undefined'){ const hr=h(G), w=PLACES.windowOf('lawlib',G.day);
      if(w&&hr>=w[1]-1/6&&hr<w[1]&&F.lawlibWarn!==G.day){ F.lawlibWarn=G.day; GM.toast('廣播：「本館將於 '+PLACES.hhmm(w[1])+' 閉館，請準備離館。」',5000); }
      if(!PLACES.isOpen('lawlib',hr,G.day)&&!S._llOut){ S._llOut=true; (async()=>{ try{ GM.sceneBegin(); await GM.say(null,'館員：「同學，我們閉館了喔。」你收好東西，走出圖書館。'); GM.sceneEnd(); await GM.enter('wancai',Object.assign({},LL3.HALL)); GM.toast(PLACES.closedText('lawlib',h(G),G.day),6000); } finally { S._llOut=false; } })(); return; } }
    /* 社科院圖書館閉館（D62，使用者 2026-10-14 查證館方網頁）：和法圖一樣——閉館前 10 分鐘廣播；過了閉館時間人還在館裡，館員請你離館（回到社科院正門前）*/
    if(G.zone==='soclib'&&typeof PLACES!=='undefined'&&PLACES.hours.soclib&&typeof SL3!=='undefined'){ const hr=h(G), w=PLACES.windowOf('soclib',G.day);
      if(w&&hr>=w[1]-1/6&&hr<w[1]&&F.soclibWarn!==G.day){ F.soclibWarn=G.day; GM.toast('廣播：「本館將於 '+PLACES.hhmm(w[1])+' 閉館，請準備離館。」',5000); }
      if(!PLACES.isOpen('soclib',hr,G.day)&&!S._slOut){ S._slOut=true; (async()=>{ try{ GM.sceneBegin(); await GM.say(null,'館員：「同學，我們閉館了喔。」你收好東西，走出圖書館。'); GM.sceneEnd(); await GM.enter('campus',Object.assign({},SL3.CAMPUS)); GM.toast(PLACES.closedText('soclib',h(G),G.day),6000); } finally { S._slOut=false; } })(); return; } }
    /* 之後的週四：13:20 民法總則的目標，下課以後換成自由活動（v9.5 審查：F.classDone 第二天之後一直是 true，不會再有上課劇情來換目標，導航整晚指著空的 201）*/
    if(G.weekday===4&&F.classDone&&h(G)>=15.2&&G.goal==='13:20 民法總則（霖澤館）') GM.setGoal('下課後自由活動。去圖書館、公館，或找人聊天');
    /* 阿哲約的麵：20:30 以後阿哲就不在麵店了（populate 只在 17:30–20:30 放他），目標不能一直停在「阿鳳麵店」（2026-10-11 使用者：吃完麵目標沒更新、不知道接下來要幹嘛）*/
    if(F.zheInvite&&!F.zheNoodleDone&&h(G)>=20.5&&G.goal&&G.goal.indexOf('阿鳳麵店（阿哲）')>=0&&!(G.zone==='noodle'&&GM.npc.zhe)) GM.setGoal('今晚沒去吃麵。回宿舍休息（睡覺就到明天）');   /* 阿哲還在店裡（20:30 前進來的）就先不換 */
    // 環境事件（每天一次）
    F.amb=F.amb||{}; for(const a of AMBIENT){ if(a.zone!==G.zone) continue; const k=a.key+G.day; if(F.amb[k]) continue; const hh=h(G); if(hh<a.from||hh>=a.to) continue; if(Math.hypot(P.x-a.x,P.z-a.z)<a.r){ F.amb[k]=true; playLines(GM,a.lines.map(l=>['',l,2800])); } }
    // 總圖（D43）：和小安約好去總圖——走上二樓自習區就開始「總圖的下午」（劇情寫的是「二樓靠牆的長桌」）
    if(G.zone==='library_hall'&&F.companion==='an'&&F.plan==='library'&&(E.player.lv|0)===1&&P.y>4.9&&GM.npc.an&&!libSceneOn){ libSceneOn=true; libraryScene(GM).finally(()=>{ libSceneOn=false; }); return; }
    // 下課後：小安追上來
    if(G.zone==='campus'&&G.day===2&&!F.metAn&&!F.anSkipped&&(F.classDone||h(G)>=15.3)){ const DR=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}; const d=Math.hypot(P.x-DR.x,P.z-DR.z);   /* 走出霖澤館大廳之後再走 6 m，小安追上來 */ if(d>6||!F.classDone){ if(!F.classDone){ F.classDone=true; F.classAnswer='absent'; GM.memo('翹掉了民法總則'); } F.metAn=true; meetAn(GM); } }
    // 太晚了
  };
  // 電梯：和小安約好在總圖二樓自習區時，3F 閱覽區先不去（game3d.js 的 elevatorRide 問這裡）
  S.elevatorLock=function(f,GM){ const F=GM.G.flags; if(f.zone==='library'&&F.companion==='an'&&F.plan==='library') return {hint:'和小安約好在二樓自習區',toast:'和小安約好在二樓的自習區讀書，先到二樓。'}; return null; };
  /* 凌晨 2:30 還沒睡：在外面就走回宿舍睡；已經在宿舍（房間、走廊）就直接睡著（2026-10-13 審查：原本在宿舍可以一直不睡，G.day 不換、隔天的課變成「還沒開始」）*/
  S.forceHome=async function(GM){ const G=GM.G; if(G.flags._forcing) return; G.flags._forcing=true; try{ const home=G.zone==='dorm'; GM.sceneBegin(); await GM.say(null,home?'已經凌晨了。你撐不住，躺上床就睡著了。':'已經凌晨了。你的腳自己往宿舍走。'); GM.sceneEnd(); G.flags.companion=null; if(!home) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await sleepNow(GM); } finally { G.flags._forcing=false; } };
  // ---------- 互動 ----------
  S.interact=async function(it,GM){ const G=GM.G, F=G.flags, E=GM.E;
    if(it.home){ if(typeof HOME!=='undefined') await HOME.go(GM); return true; }   /* 回臺北的家（src/home3d.js）*/
    if(it.deskStudy){ await deskScene(GM,it); return true; }
    if(it.roomItems){ await roomItems(GM); return true; }
    if(it.pothos){ await pothosScene(GM); return true; }
    if(it.kaiBox){ await kaiBoxScene(GM,it); return true; }
    if(it.fyPots){ await fyPotsScene(GM); return true; }
    if(it.sleep){ await bedScene(GM); return true; }
    if(it.counter==='cafe'){ await counter(GM,'兩點半 Café',CAFE_MENU); return true; }
    if(it.shop==='cvs'){ await counter(GM,'便利商店',[['飯糰',35,12],['美式咖啡',45,8],['運動飲料',30,6],['微波義大利麵',75,22]]); return true; }
    if(it.shop==='tea'){ await counter(GM,'青葉茶行',[['珍珠奶茶',60,10],['青茶 微糖',40,6]]); return true; }
    if(it.shop==='book'){ await bookshop(GM); return true; }
    if(it.eat==='noodle'){ await noodleScene(GM,it); return true; }
    if(it.notice==='lawclub'){ GM.sceneBegin(); await GM.say(null,'【法律服務社 招募新社員】每週三晚上 19:00 萬才館二樓研討室 A（讀書會，第 5 週起）。免費法律諮詢、模擬法庭、學長姊帶你讀判決。聯絡人：溫學姊。'); if(!F.lawclub){ F.lawclub=true; GM.memo('看了法律服務社的招募公告'); GM.addNote('club_law','法律服務社','每週三 19:00 萬才館二樓研討室 A（讀書會，第 5 週起）。社長是溫學姊。');   /* 地點、週次照 AA_110 6-8（原本寫萬才館 201：遊戲裡沒有這間）*/ } GM.sceneEnd(); return true; }
    if(it.mrt){ GM.sceneBegin(); await GM.say(null,'捷運公館站。今天的生活範圍還在走路可以到的地方。'); GM.sceneEnd(); return true; }
    /* 201 的課照課表（src/classes3d.js，D52）；沒有課的時候照常走得進去（D54）。v9.5 以前：週四、週二以外會先跳一句「今天沒有民法總則」 */
    if(it.exit&&it.exit.to==='classroom'&&G.day===2&&isThu(G)&&h(G)>=15.2&&!F.classDone){ F.classDone=true; GM.toast('你錯過了今天的民法總則'); G.flags.classAnswer='absent'; return false; }
    if(it.exit&&it.exit.to==='cafe'&&!PLACES.isOpen('cafe',h(G))){ GM.toast(PLACES.closedText('cafe',h(G)),4500); return true; }   /* 開放時間在 src/data/places.js（入口標記、大地圖讀同一份）*/
    if(it.exit&&it.exit.to==='lawlib'&&G.zone==='wancai'&&!PLACES.isOpen('lawlib',h(G),G.day)){ GM.toast(PLACES.closedText('lawlib',h(G),G.day),5500); return true; }
    if(it.exit&&it.exit.to==='soclib'&&G.zone==='campus'&&!PLACES.isOpen('soclib',h(G),G.day)){ GM.toast(PLACES.closedText('soclib',h(G),G.day),5500); return true; }   /* 社科院圖書館（D62）：只擋從校園進去 */   /* 法律學院圖書館（D46）：只擋從大廳進去；人在館裡照樣走得出來 */
    if(it.exit&&(it.exit.to==='library'||it.exit.to==='library_hall')&&G.zone==='campus'&&!PLACES.isOpen('library_hall',h(G))){ GM.toast(PLACES.closedText('library_hall',h(G)),4500); return true; }   /* 2026-10-11 使用者回報：只寫「閉館了」不知道幾點開 */   /* 只擋從校園進去；人在館裡（大廳、閱覽室）之間照樣走得通，不會被關在裡面 */
    return false; };
  const CAFE_MENU=[['拿鐵',120,10],['手沖咖啡',150,12],['檸檬塔',110,14]];
  async function counter(GM,shop,items){ const G=GM.G; GM.sceneBegin(); const opts=items.map(([n,p,e])=>({t:n+'　'+p+' 元',hint:'體力 +'+e,dim:G.money<p})); opts.push({t:'不用了'}); const i=await GM.choose(opts); if(i<items.length){ const [n,p,e]=items[i]; if(G.money<p){ GM.toast('錢不夠'); } else { GM.money(-p); GM.energy(e); GM.advance(0.15); await GM.say(null,'你買了'+n+'。'+(shop==='兩點半 Café'?'店員把杯子放在你面前的時候，杯底和木桌碰出一聲很小的響。':'')); } } GM.sceneEnd(); }
  async function bookshop(GM){ const G=GM.G, F=G.flags; GM.sceneBegin(); const opts=[{t:'《民法總則》教科書　650 元',hint:F.textbook?'已經有了':'讀書時會多整理一條筆記',dim:F.textbook||G.money<650},{t:'螢光筆一組　80 元',hint:'讓筆記好看一點',dim:G.money<80},{t:'只是看看'}]; const i=await GM.choose(opts); if(i===0&&!F.textbook&&G.money>=650){ GM.money(-650); F.textbook=true; GM.memo('買了民法總則教科書'); await GM.say(null,'很厚。老闆說一年級都會買，然後大部分人到期末都只翻到第三章。'); } else if(i===1&&G.money>=80){ GM.money(-80); GM.toast('買了螢光筆'); } else if(i===2){ await GM.say(null,'架上有一整排判決彙編。有人在角落翻著《法律人的第一堂課》。'); } GM.sceneEnd(); }
  // ---------- 第一天：宿舍 ----------
  async function introDorm(GM){ const G=GM.G, F=G.flags, E=GM.E; GM.sceneBegin(); GM.letterbox(true); await GM.titleCard('第一天','週三 21:12 · 男生宿舍',2600); await GM.say(null,'你是{name}，台大法律系一年級。開學第三週。'); await GM.say(null,'書桌上放著明天民法總則要討論的案例——網拍上標價 1,000 元的相機。老師上週說：「會點人。」'); /* 交接包 v1 第 1 節（AA_12 0-3 第 1 點、0-2）＋可昕的第一則訊息（BB_95 9-0）*/ for(const t of DAY1_NARR) await GM.say(null,t); await kexinFirstMsg(GM,'night'); const kai=GM.npc.kai; if(kai){ GM.cine('two',E.player.obj,kai.obj); ADV.begin({background:'blur',right:'kai'}); await GM.say(kai,'欸，你們法律系是不是每堂課都要先讀一堆東西？',{expr:'smile'}); const i=await GM.choose([{t:'差不多。明天有個案例還沒看。'},{t:'還好，看心情。'}]); if(i===0){ await GM.say(kai,'那你快看啊，我要開遊戲了，等一下會很吵。'); } else { await GM.say(kai,'心情好就會被點到，我室友上學期就是這樣。',{expr:'laugh'}); } GM.rel('kai',2); } GM.letterbox(false); familyGroupD1(GM); F.introDone=true; GM.setGoal('讀（或不讀）明天的案例，然後睡覺'); GM.sceneEnd(); GM.autosave(); }
  /* ---------- 交接包 v1：第一天的旁白、可昕的第一則訊息、家族群組、房間物件、手機的規則 ---------- */
  const DAY1_NARR=['以前遇到事情，你會去翻民法。翻得到條文，卻不知道條文和條文怎麼接起來，也不知道怎麼用在一件真的事情上。','這次不一樣。這次有人要教你怎麼讀。','經濟系的那一年，你不是一個人過的。'];   /* AA_12 0-3 第 1 點、0-2 */
  /* 手機上的一段對話，在劇情裡演（開場是過場，不打開手機面板）：對話框的名字寫「可昕（手機）」，回覆用一般的選項；演完的內容同時寫進手機的對話串（之後打開手機看得到）*/
  async function phoneScene(GM,th,lines,ask){ const G=GM.G; let last=null;
    for(const l of lines){ last=PHONE.post(G,Object.assign({th},l)); await GM.say({name:PHONE.who(l)+'（手機）'},l.text); }
    if(!ask) return -1; last.ask=Object.assign({id:'scene_'+th+'_'+G.day+'_'+Math.round(G.hour*100)},ask); const k=await GM.choose(ask.opts.map(o=>({t:o.t})));
    const r=PHONE.answer(G,last.ask.id,k); if(r) for(const m of r.out.slice(1)) await GM.say({name:PHONE.who(m)+'（手機）'},m.text); if(GM.phoneBadge) GM.phoneBadge(); return k; }
  /* 可昕的第一則訊息（BB_95 9-0；旗標 KX_FIRST_MSG）：night＝第一天晚上；morning＝舊存檔下一個早上補的（第一句、最後一句換）。三個回覆不影響關係、之後也不讀 */
  async function kexinFirstMsg(GM,variant){ const G=GM.G, F=G.flags; if(F.KX_FIRST_MSG||typeof PHONE==='undefined') return false; F.KX_FIRST_MSG=true; if(F.dating_kexin===undefined) F.dating_kexin=true;
    if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts.kexin==null) G.contacts.kexin=0; }
    const am=variant==='morning', end=am?'去上課吧。下課再跟我說你讀到哪了。':'晚安。不要讀到太晚。', K=t=>({from:'kexin',text:t});
    if(GM.toast) GM.toast('手機｜可昕：'+(am?'早安。今天的假設題。':'今天的假設題。'),2600);
    await phoneScene(GM,'p:kexin',[K(am?'早安。今天的假設題。':'今天的假設題。'),K('假設你在台大讀的案例，和我在政大讀的是同一個。'),K('兩邊的老師講出兩個答案。考試的時候，我們要寫哪一個？'),K('……不用回答。我只是想知道你讀到哪了。')],
      {opts:[{t:'讀到一半。案例比想像的長。',say:[K('我也是。讀到一半去泡麵，回來就忘了誰告誰。'),K(end)]},{t:'寫自己老師的。',say:[K('好現實。……但是對的。'),K(end)]},{t:'讀到一半，在想妳。',say:[K('那就是沒在讀。回去讀，讀完再想。'),K(end)]}]});
    return true; }
  /* 家族群組（BB_95 4-1；ev_family_group_pin）：第一天晚上回宿舍後手機亮起。群組名「法律系直屬家族」（家族制度的叫法需查證）；置頂是學姊開學前發的；
     回「（舉手）」或「活著。」設 FAM_GROUP_REPLIED（學姊第一次見面 talkSis 會讀），Kevin：「很好，有一個活的。」；不回就是不回。舊存檔已經過了第一天的不補 */
  function familyGroupD1(GM){ const G=GM.G, F=G.flags; if(F.FAM_GROUP_SENT||typeof PHONE==='undefined') return; F.FAM_GROUP_SENT=true; const th='g:family_law'; PHONE.join(G,'family_law','法律系直屬家族');
    const sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t}), kv=t=>({th,from:'kevin',name:'Kevin',text:t});
    PHONE.postAt(G,Object.assign(sis('學弟妹好。三件事。一，開學第一週不要買二手書，先等學長姐的。二，民總很重要。三，有問題可以問，但先自己查。'),{pin:true}),-16,21);   /* 開學前（8/31）發的置頂 */
    PHONE.post(G,Object.assign(kv('第三週了，直屬學弟妹還活著嗎？要考古題的舉手'),{ask:{opts:[{t:'（舉手）',set:{FAM_GROUP_REPLIED:true},say:[kv('很好，有一個活的。')]},{t:'活著。',set:{FAM_GROUP_REPLIED:true},say:[kv('很好，有一個活的。')]}]}}));
    PHONE.post(G,sis('先看置頂。')); if(GM.toast) GM.toast('手機｜法律系直屬家族｜Kevin：第三週了，直屬學弟妹還活著嗎？',4200); if(GM.phoneBadge) GM.phoneBadge(); }
  /* 手機上照旗標排時間的訊息（內容照企劃組原文）。每 0.5 秒（S.tick）；同一則用 tag 只排一次 */
  /* 某學期第幾週星期幾是第幾天（wd：1＝週一…7＝週日）；沒有＝null */
  const termDayCache={}; function termDay(term,week,wd){ const k=term+'|'+week+'|'+wd; if(k in termDayCache) return termDayCache[k]; let r=null; if(typeof CALENDAR!=='undefined') for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&CALENDAR.dateOf(d).wd===wd){ r=d; break; } } return termDayCache[k]=r; }
  S.termDay=termDay;
  /* 芷若 Z3「妳自己都喝什麼」（BB_96 3-1）：還沒發生、大一下第 3 週起的平日（她 19–22 晚班）、和她有點熟以上——這一天 21:40～22:00「店裡只剩祐廷」：
     之前進來的客人 21:40 起身走出去（until：refreshSchedule 讓他們走到門口才離開，不在眼前消失）、21:40～22:00 不生成客人（populate）；
     事件本身要等店裡沒有別的客人（S.cafeOthers：還沒在離開的人、跟著你的人）。吧檯的店員（clerk、芷若自己）是員工，不算客人 */
  S.Z3_SHUT=21+40/60;
  S.z3Pending=function(G){ if(!G||((G.events&&G.events.done)||{}).ev_zhiruo_own_drink) return false; if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false;
    const wd=G.weekday; if(!(wd>=1&&wd<=5)) return false; const d0=termDay('Y1S2',3,1); if(d0==null||G.day<d0) return false;
    return SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_02'))>=SOCIAL.STAGES.indexOf('FAMILIAR'); };
  S.cafeOthers=function(GM){ GM=GM||GM_ref; const out=[]; if(!GM) return out;
    for(const k of Object.keys(GM.npc||{})){ const n=GM.npc[k]; if(!n||k==='heroine_02'||n.charId==='heroine_02'||n.staff||n.leaving) continue; out.push(k); }
    for(const n of ((GM.E&&GM.E.npcs)||[])){ if(n&&n.isExtra&&!n.clerk&&!n.leaving) out.push('extra'); }
    return out; };
  S.zhNum=n=>{ const d='零一二三四五六七八九'; n=n|0; if(n<=0) return '零'; if(n<10) return d[n]; if(n<20) return '十'+(n%10?d[n%10]:''); return d[Math.floor(n/10)]+'十'+(n%10?d[n%10]:''); };   /* 3→三、12→十二、20→二十 */
  /* 玩家認識這個人了嗎（群戲只放認識的人：交接包 v1 交付清單第 0 節第 1 點、AA_120 初遇規則）：FIRST_MET；小語的第一次說話是 talkYu（met_yu）；阿哲開場就熟 */
  S.knows=function(id,G){ G=G||(GM_ref&&GM_ref.G); if(id==='zhe') return true; if(id==='yu'&&G&&G.flags&&G.flags.met_yu) return true; return typeof SOCIAL!=='undefined'&&SOCIAL.has(id,'FIRST_MET'); };
  S.phoneRules=function(GM){ const G=GM.G, F=G.flags; if(typeof PHONE==='undefined') return; if(typeof HOME!=='undefined'){ try{ HOME.phoneRules(GM); }catch(e){ console.warn('HOME.phoneRules',e); } }   /* 家人群組（週四 20:00）*/ const silentContact=id=>{ if(typeof INV==='undefined') return; INV.rec(G); if(G.contacts[id]==null) G.contacts[id]=G.day; };
    /* 芷若的第一則私訊（BB_95 4-2）：Café 第五次加了店裡的帳號（zhiruoShopContactDay）→ 那天 22:07；交往中改在隔天 15:10＋友情版的第三句（AA_112 8-1：交往中的玩家不收晚上只傳給他的訊息）*/
    /* 第三句（BB_95 4-2，BB 2026-10-14 654f5dd）：照第一次點的東西——有奶的（拿鐵、卡布奇諾、熱可可）「奶泡我多打了三秒」、手沖「悶蒸我多等了十秒」、
       美式「水我少加了一點」、茶「我多泡了十秒」、點心「挑」；交往中隔天 15:10 才傳：飲料都是「你昨天的那杯，是我做的。好喝的話，跟老闆說。」*/
    const ZR_DESSERT={'檸檬塔':['你今天的檸檬塔，我挑了邊邊最脆的那一塊。你沒發現。','你昨天的檸檬塔，是我挑的。好吃的話，跟老闆說。']};
    const zrThird=(order,dating)=>{ const d=ZR_DESSERT[order]; if(d) return d[dating?1:0]; if(dating) return '你昨天的那杯，是我做的。好喝的話，跟老闆說。';
      if(order==='手沖') return '你今天的手沖，悶蒸我多等了十秒。你沒發現。'; if(order==='美式') return '你今天的美式，水我少加了一點。你沒發現。'; if(/茶/.test(order)) return '你今天的茶，我多泡了十秒。你沒發現。';
      return '你今天的'+order+'，奶泡我多打了三秒。你沒發現。'; };
    if(F.zhiruoShopContactDay!=null&&!PHONE.sent(G,'zr_dm1')){ const d=F.zhiruoShopContactDay, dating=!!F.dating_kexin, Z=t=>({th:'p:heroine_02',from:'heroine_02',text:t});
      PHONE.at(G,dating?d+1:d,dating?15+10/60:22+7/60,[Z('我是 Café 的芷若。'),Z('……你應該知道。'),Z(zrThird(F.zhiruoFirstOrder||'拿鐵',dating))],'zr_dm1'); }
    if(G.msgs&&G.msgs.some(m=>m.tag==='zr_dm1')) silentContact('heroine_02');   /* 收到了＝有她的聯絡方式（之後她改用自己的帳號）*/
    /* 語彤事件 3（AA_11 事件 3、BB_95 4-3）：選「我知道誰會知道」→ 祐廷第一次私訊學姊；學姊當晚 22:30 回；祐廷把截圖傳給語彤：「……法服是什麼？」
       （沒有語彤的聯絡方式：下次在麵店當面給她看，ev_yutong_fwd）*/
    if(F.yutongAskSisDay!=null&&!PHONE.sent(G,'sis_yutong_q')){ silentContact('heroine_05'); for(const t of ['學姊，想請問一件事。麵店的阿姨被客人說吃壞肚子，要賠三萬。','客人還錄了跟阿姨吵架的聲音，說要告。這種事可以去法服問嗎？']) PHONE.post(G,{th:'p:heroine_05',from:'player',who:null,text:t,tag:'sis_yutong_q'});   /* 祐廷傳給學姊的兩則（AA 2026-10-14：不用括號說明）*/
      const W=t=>({th:'p:heroine_05',from:'heroine_05',text:t}), fs=S.fafuSat(F.yutongAskSisDay);   /* AA_140 G47、BB_95 4-3 兩版：那一週的週六就是法服值班＝「這週六」，不是＝「下週六」*/
      PHONE.at(G,F.yutongAskSisDay,22.5,[W('三件事。'),W(!(fs&&fs.thisWeek)?'一，叫阿姨下週六早上九點來萬才館，法服有值班。':'一，叫阿姨這週六早上九點來萬才館，法服有值班。'),W('二，發票、那天的進貨單、監視器的時間，全部留著。'),W('三，叫阿姨先睡覺。這種事，準備好就不可怕。')],'sis_yutong'); }
    /* 芷若 Z2（BB_95 2-4）：經原分組之後加入小組群組，她的第一則；祐廷可以回（BB_95 4-2，BB 2026-10-14 654f5dd）：三個回覆都算「回過她一次」，她不在群組回；也可以不回 */
    if(F.geGroupDay!=null&&!PHONE.sent(G,'ge_grp1')){ PHONE.join(G,'ge_econ','經原分組報告'); PHONE.at(G,G.day,G.hour+0.2,[{th:'g:ge_econ',from:'heroine_02',text:'我負責剪片。不要叫我上台。',
      ask:{opts:[{t:'好。我上台，妳剪片。',set:{ZR_GRP_REPLY:1}},{t:'收到。報告的稿我先寫。',set:{ZR_GRP_REPLY:2}},{t:'（貼一張「OK」的貼圖）',post:'（貼圖：OK）',set:{ZR_GRP_REPLY:3}}]}}],'ge_grp1'); }
    /* 芷若的第一則私訊——通識群組的替代觸發（BB_95 4-2）：回過她以後的那晚 22:07（交往中隔天 15:10）；回的時候已經過了 22:07＝隔天 22:07，第三句用「昨天」。
       和 Café 第五次的版本共用 tag zr_dm1：哪一個先到就傳哪一個，只傳一次 */
    if(F.ZR_GRP_REPLY&&!PHONE.sent(G,'zr_dm1')){ const r=(G.msgs||[]).find(m=>m.th==='g:ge_econ'&&m.from==='player'), d=r?r.day:G.day, h=r?r.h:G.hour, dating=!!F.dating_kexin, Z=t=>({th:'p:heroine_02',from:'heroine_02',text:t});
      const late=!dating&&h>=22+7/60-0.02, yday=dating||late;
      PHONE.at(G,dating||late?d+1:d,dating?15+10/60:22+7/60,[Z('我是通識小組的芷若。'),Z('……也是 Café 的那個。'),Z(yday?'你昨天在群組回得很快。我以為法律系的人都很慢。':'你剛剛在群組回得很快。我以為法律系的人都很慢。')],'zr_dm1'); }
    /* 學姊 W2（BB_95 2-5）：第一次參加讀書會那晚 22:30（她的睡前時間），發在法服讀書會的群組（給所有新來的人，不是私訊）*/
    if(F.studyGroupFirstDay!=null&&!PHONE.sent(G,'lawstudy_grp1')){ PHONE.join(G,'lawclub_study','法服讀書會'); const W=t=>({th:'g:lawclub_study',from:'heroine_05',name:'溫學姊',text:t}); PHONE.at(G,F.studyGroupFirstDay,22.5,[W('三件事。'),W('一，下週還是刑訴，一年級聽就好。'),W('二，民總第三章自己先讀，那個比較重要。'),W('三，不要遲到。')],'lawstudy_grp1'); }
    /* 子晴 Q2（BB_95 2-6）：第一次去吉他社的晚上被拉進群組 */
    /* 校慶（BB_95 3-7）：子晴——在吉他社群組、INVITED_CLUB——攤位照片 */
    if(F.festivalBoothDay!=null&&PHONE.inGroup(G,'guitar')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','INVITED_CLUB')&&!PHONE.sent(G,'fest_guitar')) PHONE.at(G,F.festivalBoothDay,Math.max(12,h(G)),[{th:'g:guitar',from:'heroine_04',text:'📷 吉他撥片賣了三個。三個都是阿凱買的。'}],'fest_guitar');
    /* 家族聚餐（BB_95 3-8）：前一週 Kevin 在家族群組約；當晚 22:30 學姊訂正考古題；沒去的玩家 22:00 Kevin 貼資料夾、學姊說書會留給學弟 */
    if(PHONE.inGroup(G,'family_law')){ const fri=termDay('Y1S1',14,5); if(fri){ const th='g:family_law', sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t}), kv=t=>({th,from:'kevin',name:'Kevin',text:t});
      if(G.day>=fri-7&&G.day<=fri) PHONE.at(G,fri-7,20.5,[kv('家族聚餐！週五 18:30，阿鳳麵店。學姊說她會來（截圖為證）'),sis('收到。')],'fam_dinner_invite');
      if(G.day===fri) PHONE.at(G,fri,22.5,[sis('考古題第七題，我的紅筆改錯了。正確的在附件。')],'fam_dinner_fix');
      if(G.day===fri&&h(G)>=19&&!(G.events&&G.events.done&&G.events.done.ev_sis_family_dinner)) PHONE.at(G,fri,22,[kv('📷 學姊整理的，沒來的人自己拿。'),sis('下學期的書，我會留給學弟。')],'fam_dinner_noshow'); } }
    if(F.guitarFirstDay!=null&&!PHONE.sent(G,'guitar_grp1')){ PHONE.join(G,'guitar','吉他社'); PHONE.at(G,F.guitarFirstDay,21.5,[{th:'g:guitar',from:'heroine_04',text:'新人自己報名字，不要讓我問。這不是問句。'}],'guitar_grp1'); }
    if(G.msgs&&G.msgs.some(m=>m.tag==='sis_yutong')&&!F.yutongFwd){ F.yutongFwd=true;
      if(typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')){ PHONE.post(G,{th:'p:heroine_03',from:'player',who:null,text:'（把學姊的回覆截圖傳給語彤）',tag:'yutong_fwd_q'}); PHONE.at(G,G.day,G.hour+0.1,[{th:'p:heroine_03',from:'heroine_03',text:'……法服是什麼？'}],'yutong_fwd'); }
      else F.yutongFwdInPerson=true; }
    /* 考完的宵夜（A15，AA 2026-10-14）：民總期中考那天，考完（考試結束後 6 分鐘）阿哲在麵店團群組「考完了。滷味。」＝排 20:30 公館滷味攤（出遊，到時候問要不要去）；
       沒有群組的玩家：G1 結束時阿哲當面問，回「去。」（SUPPER_MID1）才排 */
    if(typeof CLS!=='undefined'&&typeof OUT!=='undefined'){ const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='civ_general'&&x.exam==='mid'), t=CALENDAR.termOf(G.day);
      if(it&&t&&t.id==='Y1S1'){ const plan=()=>{ if(G.hour<20.5+0.75) OUT.plan(G,{id:'supper_mid1',ev:'ev_midterm_supper',day:G.day,h:20.5,place:'公館滷味攤',title:'考完的宵夜',travel:'走過去約 10 分鐘',travelH:1/6}); };
        if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'zhe_supper_mid1')&&G.hour<20.5){ PHONE.at(G,G.day,Math.max(G.hour,it.t1+0.1),[{th:'g:noodle_team',from:'zhe',text:'考完了。滷味。'}],'zhe_supper_mid1'); plan(); }
        else if(F.SUPPER_MID1==='yes'&&!OUT.get(G,'supper_mid1')) plan(); }
      /* 期中考完的晚餐（大一下，交接包 v2 C11、C21；AA 64ceb70）：刑總二期中考那天，考完阿哲在麵店團群組「刑總考完了。今天麵店，七點，長桌。」＝排 19:00 阿鳳麵店長桌；
         沒有群組的玩家：G1 大一下版最後阿哲當面問，回「去。」（SUPPER_MID2）才排 */
      const it2=CLS.dayItems(G,G.day).find(x=>x.c.id==='crim_gen2'&&x.exam==='mid');
      if(it2&&t&&t.id==='Y1S2'){ const plan2=()=>{ if(G.hour<19+0.75) OUT.plan(G,{id:'supper_mid2',ev:'ev_midterm_supper_y1s2',day:G.day,h:19,place:'阿鳳麵店',title:'考完的晚餐',travel:'走過去約 10 分鐘',travelH:1/6}); };
        if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'zhe_supper_mid2')&&G.hour<19){ PHONE.at(G,G.day,Math.max(G.hour,it2.t1+0.1),[{th:'g:noodle_team',from:'zhe',text:'刑總考完了。今天麵店，七點，長桌。'}],'zhe_supper_mid2'); plan2(); }
        else if(F.SUPPER_MID2==='yes'&&!OUT.get(G,'supper_mid2')) plan2(); } }
    /* 麵店團（AA_70 2-3、AA_40 哲 1）：哲 1 那天阿哲建的群組。麵店日＝上課週的週二、週四（考試週、國定假日、出國期間沒有）。
       阿哲 17:30 在群組裡揪，只在你上一個麵店日沒來的時候（AA 2026-10-14：一直有來的玩家，群組是安靜的）；四句輪流。tag rt_＝例行訊息（每天的手機小事不把它當成劇情訊息）。
       有沒有來：麵店日 17:00–21:00 在麵店（ndlDays，最近 12 個）；開始記以前（ndlTrack0：舊存檔）的麵店日當作有來 */
    if(F.noodleTableDay!=null&&typeof CALENDAR!=='undefined'){ if(!PHONE.inGroup(G,'noodle_team')){ PHONE.join(G,'noodle_team','麵店團'); PHONE.post(G,{th:'g:noodle_team',text:'阿哲建立了群組「麵店團」，把你加了進來。',tag:'noodle_team_new'}); }
      if(F.ndlTrack0==null) F.ndlTrack0=G.day;
      if(G.zone==='noodle'&&S.noodleDay(G.day)&&G.hour>=17&&G.hour<21){ const L=F.ndlDays||(F.ndlDays=[]); if(L[L.length-1]!==G.day){ L.push(G.day); if(L.length>12) L.shift(); } }
      if(G.day>F.noodleTableDay&&S.noodleDay(G.day)&&!F.abroad&&!PHONE.sent(G,'rt_zhe_ndl_'+G.day)){ let p=null; for(let d=G.day-1;d>=F.noodleTableDay;d--) if(S.noodleDay(d)){ p=d; break; }   /* abroad：之後的交換系統設 */
        const came=p==null||p<F.ndlTrack0||(F.ndlDays||[]).includes(p);
        if(!came){ const k=(F.ndlPingN|0)%NDL_PINGS.length; if(PHONE.at(G,G.day,17.5,[{th:'g:noodle_team',from:'zhe',text:NDL_PINGS[k]}],'rt_zhe_ndl_'+G.day)) F.ndlPingN=(F.ndlPingN|0)+1; } } }
    /* 可昕 K1 導遊（BB_95 9-1）：第 3 週週五 19:30 她傳「週末來政大？我當導遊。」——答應就排週六下午 14:00 去政大（出遊，src/outings3d.js）；
       答應得晚（過了那個週六下午）就排下一個週六。回覆的兩句與她的回應照 BB 2026-10-14（494e510）。這週不行的玩家：下一週週五 19:30 她再約一次
      （「這週末呢？導遊還在。」，兩個回覆同上；回覆比那天晚才回的，從回覆的下一個週五起）；兩次都不行＝之後第一次「開車去政大」才有導遊（那個功能還沒做：K1 先不發生，K2 照「K1 還沒發生」的結尾）*/
    const KX_TOUR_OPTS=(no)=>[{t:'好，週六下午過去。',set:{KX_TOUR_YES:true},say:[{from:'kexin',text:'好。導遊在校門口等。'}]},{t:'這週末不行。',set:{[no]:true},say:[{from:'kexin',text:'好。導遊的位子幫你留著。'}]}];
    if(F.dating_kexin&&!PHONE.sent(G,'kx_tour_ask')){ const fri=termDay('Y1S1',3,5); if(fri) PHONE.at(G,fri,19.5,[{th:'p:kexin',from:'kexin',text:'週末來政大？我當導遊。',ask:{opts:KX_TOUR_OPTS('KX_TOUR_NO')}}],'kx_tour_ask'); }
    if(F.dating_kexin&&F.KX_TOUR_NO&&!F.KX_TOUR_YES&&!PHONE.sent(G,'kx_tour_ask2')&&typeof CALENDAR!=='undefined'){ let d=termDay('Y1S1',4,5); if(d&&(G.day>d||(G.day===d&&h(G)>19.5))){ d=G.day+1; while(CALENDAR.dateOf(d).wd!==5) d++; }
      if(d) PHONE.at(G,d,19.5,[{th:'p:kexin',from:'kexin',text:'這週末呢？導遊還在。',ask:{opts:KX_TOUR_OPTS('KX_TOUR_NO2')}}],'kx_tour_ask2'); }
    if(F.KX_TOUR_YES&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_tour')&&!(G.events&&G.events.done&&G.events.done.ev_kexin_tour_nccu)&&typeof CALENDAR!=='undefined'){ let d=G.day; while(CALENDAR.dateOf(d).wd!==6||(d===G.day&&G.hour>13.5)) d++;
      OUT.plan(G,{id:'kx_tour',ev:'ev_kexin_tour_nccu',day:d,h:14,place:'政大',title:'去政大找可昕',travel:'開車約 30 分鐘',travelH:0.5});
      const tw=CALENDAR.termOf(d); F.kxTourWeeks=S.zhNum(tw?tw.week:3); }   /* 她在政大念了幾個禮拜（照那天的週次；政大和台大同一天開學） */
    /* 可昕 K1b（BB_95 9-2）：K1 之後（NCCU_VISITED），第 6～8 週第一個平日下午 15:30 她傳；三個回覆照原文 */
    if(F.NCCU_VISITED&&!PHONE.sent(G,'kx_yule_ask')&&typeof CALENDAR!=='undefined'){ const tm=CALENDAR.termOf(G.day), wd=CALENDAR.dateOf(G.day).wd;
      if(tm&&tm.id==='Y1S1'&&tm.week>=6&&tm.week<=8&&wd>=1&&wd<=5&&!CALENDAR.holiday(G.day)&&G.hour<15.5){ const K=t=>({from:'kexin',text:t});
        PHONE.at(G,G.day,15.5,[{th:'p:kexin',from:'kexin',text:'明天晚上有空嗎？我們系上有人揪宵夜，予樂一直說要看你本人。',ask:{opts:[
          {t:'好，我開車過去。',set:{KX_YULE:'yes'}},{t:'我七點跟麵店團吃飯，晚一點可以嗎？',set:{KX_YULE:'late'},say:[K('那九點？你來吃第二輪。')]},{t:'這週不行，下週換我請。',set:{KX_YULE:'no'},say:[K('好，那下週換你請。')]}]}}],'kx_yule_ask'); F.kxYuleAskDay=G.day; } }
    if((F.KX_YULE==='yes'||F.KX_YULE==='late')&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_yule')&&F.kxYuleAskDay!=null)
      OUT.plan(G,{id:'kx_yule',ev:'ev_kexin_yule_pass',day:Math.max(F.kxYuleAskDay+1,G.day),h:F.KX_YULE==='late'?21:19.5,place:'政大',title:'去政大見予樂',travel:'開車約 30 分鐘',travelH:0.5});
    if(F.yulePassDay!=null) PHONE.at(G,F.yulePassDay+1,12.5,[{th:'p:kexin',from:'kexin',text:'📷（予樂寫的紙條：「及格。」）'}],'kx_yule_pass');
    if(F.KX_YULE==='no'&&F.kxYuleAskDay!=null) PHONE.at(G,F.kxYuleAskDay+2,12.5,[{th:'p:kexin',from:'kexin',text:'📷（予樂戴著用紙巾做的皇冠）'}],'kx_yule_crown');
    /* 中秋烤肉（A13）：第 5 週週三 21:00 阿哲揪（有麵店團群組在群組，沒有的私訊）；去＝週六 15:00 河濱（出遊，走過去約 15 分鐘）。揪的那一句和兩個回覆是 LAWWW 寫的（等 AA）*/
    { const wed=termDay('Y1S1',5,3), sat=termDay('Y1S1',5,6);
      if(wed&&sat&&!PHONE.sent(G,'bbq_ask')&&G.day<=sat){ const th=PHONE.inGroup(G,'noodle_team')?'g:noodle_team':'p:zhe'; PHONE.at(G,wed,21,[{th,from:'zhe',text:'週六中秋烤肉。河濱，下午三點。',ask:{opts:[{t:'去。',set:{BBQ_YES:true}},{t:'這次不行。',set:{BBQ_NO:true}}]}}],'bbq_ask'); }
      if(F.BBQ_YES&&typeof OUT!=='undefined'&&!OUT.get(G,'bbq')&&sat&&G.day<=sat) OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:sat,h:15,place:'河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',travelH:0.25});
      /* 可昕 K3（BB_95 9-4）：前一天（週五）20:00 她問；回「來我們這邊」她就來；「妳去妳們系的」她傳烤玉米的照片（週六 20:30）*/
      if(sat&&F.dating_kexin&&(F.BBQ_YES||!F.BBQ_NO)&&!PHONE.sent(G,'kx_bbq_ask')&&G.day>=sat-1&&G.day<=sat){ const K=t=>({from:'kexin',text:t});
        PHONE.at(G,sat-1,20,[{th:'p:kexin',from:'kexin',text:'我們系也有烤肉。……你們的比較好玩嗎？',ask:{opts:[{t:'來我們這邊。',set:{KX_BBQ_COME:true}},{t:'妳去妳們系的。',set:{KX_BBQ_NO:true}}]}}],'kx_bbq_ask'); }
      if(F.KX_BBQ_NO&&sat) PHONE.at(G,sat,20.5,[{th:'p:kexin',from:'kexin',text:'📷（烤玉米）'},{th:'p:kexin',from:'kexin',text:'我們的玉米比較好。'}],'kx_bbq_corn'); }
    /* 以安新 3 宿舍的規則（A14，交接包_v1 第 3 節）：第 7 週週二晚上麵店團群組，小語轉述（她是聽說的）、阿哲、以安隔一陣子才回；只給在群組裡的玩家（其他人由沛珊當面說：ev_an_dorm_rules_peishan）*/
    if(PHONE.inGroup(G,'noodle_team')&&!F.AN_DORM_RULES){ const d=termDay('Y1S1',7,2), gj=PHONE.rec(G).groups.noodle_team; if(d&&G.day>=d-1&&gj.day<=d){ const th='g:noodle_team';   /* 那天以前就在群組裡（之後才加入的，看不到加入以前的訊息：由沛珊當面說）*/
      PHONE.at(G,d,21.7,[{th,from:'yu',text:'報告！聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。'},{th,from:'yu',text:'大家笑她，她說：「規則是我們要住的，總要有人讀完。」'},{th,from:'zhe',text:'……她說得對耶。'}],'an_rules_grp');
      PHONE.at(G,d,22.4,[{th,from:'heroine_01',text:'三頁是因為字很大。'}],'an_rules_an'); } }
    if(G.msgs&&!F.AN_DORM_RULES&&G.msgs.some(m=>m.tag==='an_rules_grp')) F.AN_DORM_RULES='group';
    /* 以安的聯絡方式（AA 2026-10-14：第二天 Café、總圖兩條路線的結尾她要了聯絡方式＝anContactDay2）：沒和她走的玩家、舊存檔在下午結束時默默加上（不補訊息）*/
    if(F.afternoonDone) silentContact('heroine_01');
    /* 她的第一則訊息（AA 2026-10-14）：當晚 21:30 一張筆記的照片；報告「一起寫」的玩家（A12 REPORT_PARTNER）那天晚上再傳一張分工表 */
    if(F.AN_CONTACT_DAY2&&!PHONE.sent(G,'an_first_note')&&G.day<=F.AN_CONTACT_DAY2+1) PHONE.at(G,F.AN_CONTACT_DAY2,21.5,[{th:'p:heroine_01',from:'heroine_01',text:'📷（筆記的照片，字很整齊）'}],'an_first_note');
    { const d=G.events&&G.events.last&&G.events.last.ev_an_report_split; if(d!=null&&G.day<=d+1&&!PHONE.sent(G,'an_split_table')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','REPORT_PARTNER')&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_01'))
        PHONE.at(G,d,G.day===d?Math.max(21.5,h(G)+0.25):21.5,[{th:'p:heroine_01',from:'heroine_01',text:'📷（報告的分工表）'}],'an_split_table'); }
    /* 以安的邀約（交付清單 A19：AA_70 2-1「認識以上」那一列；交接包_v1 第 16 週「期末前的總圖」）：第 16 週週一～四 19:00 以後約隔天 8:00 總圖——
       邀約系統（invites3d.js 的 offer：手機上回答應／改天／不了；見面照邀約系統）；只約一次 */
    { const d=termDay('Y1S1',16,1); if(d&&G.day>=d&&G.day<=d+3&&h(G)>=19&&!F.anFinalInvite&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_01')&&typeof SOCIAL!=='undefined'&&SOCIAL.stage('heroine_01')!=='STRANGER'){
        F.anFinalInvite=G.day; INV.offer(G,'heroine_01','library',G.day+1,8,'明天 8:00 總圖。周老師那題，我寫了反方的理由。你來反駁。'); } }
    /* 可昕 K2 她第一次來台大（BB_95 9-3）：第 6 週週五 20:00 她傳（避開第 4 週六的迎新、第 5 週六的中秋）；週六 16:00 社科院門口（出遊：走過去約 10 分鐘）*/
    { const fri=termDay('Y1S1',6,5);
      if(fri&&F.dating_kexin&&G.day<=fri&&G.day>=fri-7&&!PHONE.sent(G,'kx_ntu_ask')) PHONE.at(G,fri,20,[{th:'p:kexin',from:'kexin',text:'這次換我去台大。我先去找品妤，再去霖澤館抓你。'}],'kx_ntu_ask');
      if(fri&&F.dating_kexin&&G.day>=fri&&G.day<=fri+1&&PHONE.sent(G,'kx_ntu_ask')&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_ntu'))
        OUT.plan(G,{id:'kx_ntu',ev:'ev_kexin_visits_ntu',day:fri+1,h:16,place:'社科院門口',title:'可昕來台大：去社科院門口',travel:'走過去約 10 分鐘',travelH:1/6,back:'回到台大。'}); }
    /* 可昕 K4 第一次視訊一起讀書（BB_95 9-5）：第 16 週週二 20:00 她問（期末前；回覆到 21:45 為止）。「好，九點開。」＝當天 21:00 視訊（ev_kexin_video_study，出遊）；
       「今天不行。」或沒回＝23:00 她傳書桌的照片（沒接也是，ev_kexin_video_study 的 outingMissed）*/
    /* K5「我們的日子」（BB_96 9-3）：大一下第 2 週週一 21:00 她傳；玩家選哪一天（回她的那一句裡接著選方式）。兩樣都選了＝KX_OUR_DAY {day, mode}，排同一週那一天的「第一次」（出遊）；
       那一週那天已經過了＝下週同一天。時間、地點是 AA-B 確認前的提案值（週五 19:00、週六 14:00、週日 14:00；政大小吃街／社科院門口／公館／視訊）。之後每週的固定格等 AA-B（2026-10-16 問）*/
    { const m2=termDay('Y1S2',2,1); if(m2&&F.dating_kexin&&G.day>=m2-1&&G.day<=m2+13){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        const MODE=[{t:'我開車去政大。',set:{_kxOM:'nccu'},say:[K('好。我負責選宵夜。')]},{t:'妳來台大。',set:{_kxOM:'ntu'},say:[K('好。我順便看品妤。')]},{t:'約在中間。',set:{_kxOM:'mid'},say:[K('公館、溫州街、河濱，輪流。')]},{t:'視訊也算。',set:{_kxOM:'video'},say:[K('算。可是一個月至少見一次面。')]}];
        const DAYS=[['週五晚上。','fri','一週的最後一晚。好，你把它留給我。'],['週六。','sat','整天？……好，我不會整天都要。'],['週日下午。','sun','週日下午很好。隔天要上課，我們不會玩太晚。']].map(([t,k,r])=>({t,set:{_kxOD:k},say:[Object.assign(K(r),{ask:{opts:MODE}})]}));
        const L=[K('我們選一天。不是約會日，是「我們的日子」。')]; if(F.KX_VDAY_SEE) L.push(K('開學第一個週末我寫了。現在要決定的是以後。')); L.push(Object.assign(K('名字很重要。'),{ask:{opts:DAYS}}));
        if(!PHONE.sent(G,'kx_our_day')) PHONE.at(G,m2,21,L,'kx_our_day');
        if(F._kxOD&&F._kxOM&&!F.KX_OUR_DAY){ F.KX_OUR_DAY={day:F._kxOD,mode:F._kxOM}; delete F._kxOD; delete F._kxOM; }
        const OD=F.KX_OUR_DAY; if(OD&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_our_day1')){ const wd={fri:5,sat:6,sun:7}[OD.day], hh={fri:19,sat:14,sun:14}[OD.day]; let d=termDay('Y1S2',2,wd); if(d!=null&&(G.day>d||(G.day===d&&G.hour>hh))) d=termDay('Y1S2',3,wd);
          const P={nccu:['政大・山下的小吃街','我們的日子：開車去政大','開車約 30 分鐘',0.5],ntu:['社科院門口','我們的日子：她來台大','走過去約 10 分鐘',1/6],mid:['公館','我們的日子：約在公館','騎車約 10 分鐘',1/6],video:['視訊','我們的日子：視訊','',0]}[OD.mode];
          if(d!=null&&P) OUT.plan(G,Object.assign({id:'kx_our_day1',ev:'ev_kexin_our_day',day:d,h:hh,place:P[0],title:P[1],travel:P[2],travelH:P[3]},OD.mode==='video'?{verb:'接起來',no:'今天先不要',back:'視訊結束。'}:{})); } } }
    /* K6 她第一次因為自己的事改期（BB_96 9-6）：第 7 週週三 21:00 她提兩校互考（回「好」或「視訊可以嗎」，KX_QUIZ_MODE）；第 8 週週四 21:00 改期（三種回應記 K6_RESPONSE）；
       週日 14:00 互考（出遊；時間是 AA-B 確認前的提案值）。沒去：考古題的照片「下次你逃不掉。」（ev_kexin_reschedule 的 outingMissed）。之後改「我們的日子」的回聲等每週固定格（AA-B）*/
    { const w7=termDay('Y1S2',7,3), w8=termDay('Y1S2',8,4), sun=termDay('Y1S2',8,7); if(w7&&w8&&sun&&F.dating_kexin&&G.day>=w7-1&&G.day<=sun+1){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        if(!PHONE.sent(G,'kx_quiz_ask')) PHONE.at(G,w7,21,[K('期中前，兩校互考。'),K('只能出老師上課講過的。冷門學說算犯規。'),Object.assign(K('輸的人請山下那一攤。週六下午，山下。'),{ask:{opts:[{t:'好。',set:{KX_QUIZ_MODE:'meet'}},{t:'視訊可以嗎？',set:{KX_QUIZ_MODE:'video'}}]}})],'kx_quiz_ask');
        if(!PHONE.sent(G,'kx_k6')) PHONE.at(G,w8,21,[K('對不起，週六可以改週日嗎？'),Object.assign(K('我們讀書會的報告被退回來，週六要重做。'),{ask:{opts:[
          {t:'好，週日。報告加油。',set:{K6_RESPONSE:'understand'},say:[K('好。週日我請一攤，當改期費。')]},{t:'為什麼被退？',set:{K6_RESPONSE:'ask'},say:[K('老師說我們的理由跳太快。……我也覺得。週日跟你說。')]},
          {t:'我週六都空下來了。',set:{K6_RESPONSE:'sulk'},say:[K('……我知道。對不起。週日你多出一題。')]}]}})],'kx_k6');
        if(PHONE.sent(G,'kx_k6')&&G.day*24+G.hour>=w8*24+21&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_quiz1')){ const v=F.KX_QUIZ_MODE==='video';   /* 改期那則傳出以後才排（那時候已經知道見面還是視訊）*/
          OUT.plan(G,Object.assign({id:'kx_quiz1',ev:'ev_kexin_reschedule',day:sun,h:14,place:v?'視訊':'政大・山下的小吃街',title:v?'可昕的視訊：兩校互考':'兩校互考：開車去政大',travel:v?'':'開車約 30 分鐘',travelH:v?0:0.5},v?{verb:'接起來',no:'今天先不要',back:'視訊結束。'}:{})); } } }
    /* K6b 第一次寫申論題（BB_96 9-7）：第 9 週週三 21:00 她考完民總期中（時間是提案值）；只一次；記 KX_DIR {Y1:'reasons'}（第 10 週以後手機小事「答案被拿去當範例」）*/
    { const w9=termDay('Y1S2',9,3); if(w9&&F.dating_kexin&&G.day>=w9&&G.day<=w9+6&&!PHONE.sent(G,'kx_essay')&&G.day*24+G.hour>=w9*24+21){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        PHONE.at(G,w9,21,[K('剛考完。四頁。手好痛。'),Object.assign(K('原來法律不是背答案，是把理由說給一個不認識你的人聽。'),{ask:{opts:[
          {t:'那妳說給誰聽？',say:[K('改考卷的老師。他不認識我。……寫完的時候，我覺得他懂了。')]},{t:'我也是這學期才發現。',say:[K('那我們發現得一樣晚。很好，沒有人贏。')]},{t:'四頁？',say:[K('老師說兩頁就夠。我停不下來。')]}]}})],'kx_essay');
        F.KX_DIR=Object.assign({},F.KX_DIR||{},{Y1:'reasons'}); } }
    /* K7 交往週年（BB_96 9-4）：2026-03-22（週日）。一週前 3/15 21:00 她傳、玩家選地點（KX_ANNIV_PLACE）；當天 18:00 出遊（提案時間，AA-B 確認中），出門前選準備的東西（K7_GIFT）。
       沒選地點、沒去、婉拒＝當晚卡片的照片「週年快樂。下次你準備。」，記 KX_ANNIV {1:'missed'}（ev_kexin_anniversary_y1 的 outingMissed）*/
    { const a0=S.dayOfKey('2026-03-15'), a1=S.dayOfKey('2026-03-22'); if(a0&&a1&&F.dating_kexin&&G.day>=a0-1&&G.day<=a1+1){ const th='p:kexin', K=t=>({th,from:'kexin',text:t});
        if(!PHONE.sent(G,'kx_anniv_ask')) PHONE.at(G,a0,21,[K('下週日是我們的週年。'),Object.assign(K('地點你選。我準備一樣東西，你也準備一樣。'),{ask:{until:a1*24+18,opts:[
          {t:'摩天輪。',set:{KX_ANNIV_PLACE:'wheel'},say:[K('……回到最高點。好。')]},{t:'政大山下，我們的店。',set:{KX_ANNIV_PLACE:'shop'},say:[K('老闆會以為是普通的週日。我們不要告訴他。')]},{t:'河堤。',set:{KX_ANNIV_PLACE:'river'},say:[K('好。這次不看煙火，看河。')]}]}})],'kx_anniv_ask');
        const AP=F.KX_ANNIV_PLACE; if(AP&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_anniv1')){ const P={wheel:['摩天輪','週年：摩天輪','開車約 40 分鐘',2/3],shop:['政大・山下的小吃街','週年：政大山下，我們的店','開車約 30 分鐘',0.5],river:['河堤','週年：河堤','騎車約 15 分鐘',0.25]}[AP];
          OUT.plan(G,{id:'kx_anniv1',ev:'ev_kexin_anniversary_y1',day:a1,h:18,place:P[0],title:P[1],travel:P[2],travelH:P[3]}); }
        if(!AP&&G.day*24+G.hour>=a1*24+19&&!(F.KX_ANNIV&&F.KX_ANNIV[1])){ F.KX_ANNIV=Object.assign({},F.KX_ANNIV||{},{1:'missed'}); PHONE.at(G,G.day,G.hour,[K('📷（一張卡片）'),K('週年快樂。下次你準備。')],'kx_anniv_photo'); } } }
    /* 情人節（BB_96 9-1，寒假，各自在家）：2/14 20:00 她打視訊來（出遊系統「接起來」；在臺北的家也會問，home3d.js）；沒接＝窗戶的照片（outingMissed）*/
    { const vd=S.dayOfKey('2026-02-14'); if(vd&&F.dating_kexin&&G.day>=vd-7&&G.day<=vd&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_vday1')) OUT.plan(G,{id:'kx_vday1',ev:'ev_kexin_valentine_y1',day:vd,h:20,place:'視訊',title:'可昕的視訊：情人節',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'}); }
    { const d=termDay('Y1S1',16,2);
      if(d&&F.dating_kexin&&G.day<=d&&G.day>=d-7&&!PHONE.sent(G,'kx_video_ask')) PHONE.at(G,d,20,[{th:'p:kexin',from:'kexin',text:'要不要視訊一起讀書？各讀各的。我每半小時出一題假設題，你可以不理我。',
        ask:{until:d*24+21.75,opts:[{t:'好，九點開。',set:{KX_VIDEO:'yes'},say:[{from:'kexin',text:'好。我先把書排好。'}]},{t:'今天不行。',set:{KX_VIDEO:'no'},say:[{from:'kexin',text:'好。我自己讀，讀完傳照片給你。'}]}]}}],'kx_video_ask');
      if(d&&F.KX_VIDEO==='yes'&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_video')) OUT.plan(G,{id:'kx_video',ev:'ev_kexin_video_study',day:d,h:21,place:'視訊',title:'可昕的視訊：一起讀書',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'});
      if(d&&PHONE.sent(G,'kx_video_ask')&&!F.KX_VIDEO&&G.day*24+h(G)>=d*24+21.75) F.KX_VIDEO='none';
      if(d&&(F.KX_VIDEO==='no'||F.KX_VIDEO==='none')) PHONE.at(G,d,23,KX_DESK_PHOTO,'kx_video_photo'); }
    /* 第一份報告交出去的晚上（BB_95 9-6 改版，2026-10-15 BB-B；AA_140 G01：生日改 4/24）：12/3（第 14 週週三）。不再跳「今天是可昕的生日」。
       前一晚 21:00 她傳「明天交第一份期末報告。交完我要去山下那一家。一個人吃好像有點悲壯。」；當天她的對話串多一則「祐廷的草稿」（「交出去了嗎？」23:59 前可以傳，
       她回「交了。今天的假設題取消，換你出一題給我。」）；18:00 出遊提示「開車去政大」（ev_kexin_birthday_y1，id 不改）。都沒做：那晚 22:30 她傳一張照片（山下那一家的酸辣湯餃，對面的椅子空著）
       「一個人吃了。很好吃。下次你要來。」，不扣分、不記仇。過了那一天記 KX_DEC3:{1:'visit'|'message'|'none'}（不再寫 KX_BDAY；舊存檔讀檔時搬，game3d.js migrate）*/
    { const bd=termDay('Y1S1',14,3);
      if(bd&&F.dating_kexin&&G.day>=bd-1&&G.day<=bd&&!(G.day===bd-1&&h(G)<21)&&!PHONE.sent(G,'kx_dec3_eve')) PHONE.at(G,bd-1,21,[{th:'p:kexin',from:'kexin',text:'明天交第一份期末報告。交完我要去山下那一家。一個人吃好像有點悲壯。'}],'kx_dec3_eve');
      if(bd&&F.dating_kexin&&G.day===bd){
        if(!PHONE.sent(G,'kx_dec3_draft')) PHONE.at(G,bd,Math.max(6,h(G)),[{th:'p:kexin',from:'player',who:null,text:'（草稿）',
          ask:{until:bd*24+24,opts:[{t:'交出去了嗎？',set:{KX_DEC3_MSG:true},say:[{from:'kexin',text:'交了。今天的假設題取消，換你出一題給我。'}]}]}}],'kx_dec3_draft');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'kx_bday')) OUT.plan(G,{id:'kx_bday',ev:'ev_kexin_birthday_y1',day:bd,h:18.75,place:'政大',title:'開車去政大',travel:'開車約 30 分鐘',travelH:0.5});
        if(h(G)>=22.5&&!F.KX_DEC3_VISIT&&!F.KX_DEC3_MSG&&!PHONE.sent(G,'kx_dec3_none')) PHONE.at(G,bd,22.5,[{th:'p:kexin',from:'kexin',text:'📷（山下那一家的酸辣湯餃，對面的椅子空著）'},{th:'p:kexin',from:'kexin',text:'一個人吃了。很好吃。下次你要來。'}],'kx_dec3_none'); }
      if(bd&&F.dating_kexin&&G.day>bd&&G.day<=bd+7&&!(F.KX_DEC3&&F.KX_DEC3[1])){ const v=F.KX_DEC3_VISIT?'visit':(F.KX_DEC3_MSG?'message':'none'); F.KX_DEC3=Object.assign({},F.KX_DEC3||{},{1:v}); } }
    /* 可昕的生日（BB_96 9-7b；4/24 大一下第 9 週週五；AA_140 G01）：早上行事曆「可昕生日」（祐廷自己記的）；草稿「生日快樂。」（23:59 前，她回「收到。今天的假設題取消，換你出一題給我。」）；
       18:00 出遊提示（ev_kexin_birthday_y1s2）。過了那一天：去過＝visit、只傳訊息＝message、都沒做＝none＋隔天早上她只傳「我等了一天。」（一次，之後照常）。KX_BDAY:{1:…}（BB_107：每年一筆；大一的記在這一天）。
       之後幾年的 4/24：大二下第 9 週、大三下第 11 週、大四下第 10 週（AA_140 G01），跟著 v3～v5 做 */
    { const bd=termDay('Y1S2',9,5);
      if(bd&&F.dating_kexin&&G.day===bd){
        if(h(G)>=6&&!F.kxBdayCal){ F.kxBdayCal=1; if(GM.toast) GM.toast('行事曆：可昕生日',5200); }
        if(!PHONE.sent(G,'kx_bday_draft')) PHONE.at(G,bd,Math.max(6,h(G)),[{th:'p:kexin',from:'player',who:null,text:'（草稿）',
          ask:{until:bd*24+24,opts:[{t:'生日快樂。',set:{KX_BDAY_MSG:true},say:[{from:'kexin',text:'收到。今天的假設題取消，換你出一題給我。'}]}]}}],'kx_bday_draft');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'kx_bday_y1s2')) OUT.plan(G,{id:'kx_bday_y1s2',ev:'ev_kexin_birthday_y1s2',day:bd,h:18.75,place:'政大',title:'可昕的生日：開車去政大',travel:'開車約 30 分鐘',travelH:0.5}); }
      if(bd&&F.dating_kexin&&G.day>bd&&G.day<=bd+7&&!(F.KX_BDAY&&F.KX_BDAY[1])){ const v=F.KX_BDAY_VISIT?'visit':(F.KX_BDAY_MSG?'message':'none'); F.KX_BDAY=Object.assign({},F.KX_BDAY||{},{1:v});
        if(v==='none') PHONE.at(G,bd+1,8,[{th:'p:kexin',from:'kexin',text:'我等了一天。'}],'kx_bday_none'); } }
    /* 颱風假 T1b「照常上課的喜劇」（BB_110 第 2 節、交付清單 B3）：颱風假（calendar.js 的 TYPHOON：第 7 週週一，憲法（上）那天）前一晚 20:30 新聞通知「明天停止上班上課。」、21:00 張教授的信（通知），
       21:20 起麵店團群組（那天以前就在群組裡的玩家）：阿哲、小語、柏翰、阿哲；最後一則可以回三種（到颱風假當天 24:00）。睡著、跳過時間的玩家照原本的時間補收（PHONE.at）。
       AA 角色的台詞（阿哲、小語、柏翰）照 BB_110，AA 可以改 */
    { const ty=termDay('Y1S1',7,1); if(ty&&typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(ty)&&G.day>=ty-1&&G.day<=ty){ const eve=ty-1;
        if(!PHONE.sent(G,'ty1_news')) PHONE.at(G,eve,20.5,[{th:'sys',name:'新聞',text:'明天停止上班上課。'}],'ty1_news');   /* 前一晚市政府宣布（BB 2026-10-14 照 AA 建議加）：沒有群組的玩家也收得到 */
        if(!PHONE.sent(G,'ty1_mail')) PHONE.at(G,eve,21,[{th:'sys',from:'prof_zhang',name:'張教授（信）',text:'明日停課。附件為明日進度的講義，共四十二頁，請自行閱讀。'}],'ty1_mail');
        const gj=PHONE.inGroup(G,'noodle_team')&&PHONE.rec(G).groups.noodle_team; if(gj&&gj.day<=eve&&!PHONE.sent(G,'ty1_g4')){ const T='g:noodle_team';
          PHONE.at(G,eve,21+20/60,[{th:T,from:'zhe',text:'四十二頁。颱風比較仁慈。'}],'ty1_g1');
          PHONE.at(G,eve,21+24/60,[{th:T,from:'yu',text:'我讀完第一頁了。第一頁是目錄。'}],'ty1_g2');
          PHONE.at(G,eve,21+31/60,[{th:T,from:'classmate_bohan',text:'我讀到第十二頁。'}],'ty1_g3');
          PHONE.at(G,eve,21+32/60,[{th:T,from:'zhe',text:'……你是颱風嗎？',ask:{until:ty*24+24,opts:[
            {t:'「我讀到第三頁。」',post:'我讀到第三頁。',set:{TY1_REPLY:'page3'},say:[{from:'classmate_bohan',text:'很好。'}]},
            {t:'「我在吃泡麵。」',post:'我在吃泡麵。',set:{TY1_REPLY:'noodle'},say:[{from:'zhe',text:'這才是正確的颱風假。'}]},
            {t:'（貼一張颱風的貼圖）',post:'🌀（颱風的貼圖）',set:{TY1_REPLY:'sticker'},say:[{from:'yu',text:'這張貼圖比講義有用。'}]}]}}],'ty1_g4'); } } }
    /* 聖誕交換禮物（A20、AA_71 2-6）：阿哲在麵店團群組揪（第 17 週週一 12/22 21:00；之後才加入群組的，加入時看到）。活動本身是 ev_xmas_exchange（12/24 週三中午霖澤館一樓）*/
    { const mon=termDay('Y1S1',17,1); if(mon&&PHONE.inGroup(G,'noodle_team')&&G.day>=mon&&(G.day<mon+2||(G.day===mon+2&&h(G)<12+20/60))&&!PHONE.sent(G,'xmas_ask')){ const late=G.day>mon||h(G)>=21;
        PHONE.at(G,late?G.day:mon,late?h(G):21,[{th:'g:noodle_team',from:'zhe',text:'聖誕交換禮物，週三中午，霖澤館一樓。一百五以內。'}],'xmas_ask'); } }
    /* 跨年（A21、BB_95 9-7）：一週前（第 17 週週三 12/24 21:00）可昕問；KX_NYE_PICK 換成 KX_NYE:{1:…}（每年一筆）；12/31 排出遊：河堤 23:30（開車）、頂樓 23:45（走上去）；
       沒有回她、在麵店團群組的玩家：頂樓（AA 的群戲，沒有視訊）。河堤回來的路上（00:12）麵店團群組：頂樓的照片＋阿哲「我們就說有看到。」*/
    { const nye=termDay('Y1S1',18,3);
      if(nye&&F.dating_kexin&&!PHONE.sent(G,'kx_nye_ask')&&G.day<=nye&&G.day>=nye-7) PHONE.at(G,nye-7,21,[{th:'p:kexin',from:'kexin',text:'跨年要不要去人少的地方？',ask:{opts:[{t:'好。',set:{KX_NYE_PICK:'river'}},{t:'我答應麵店團要去頂樓了。',set:{KX_NYE_PICK:'roof'},say:[{from:'kexin',text:'好。那你幫我跟阿哲說新年快樂。'}]}]}}],'kx_nye_ask');
      if(F.KX_NYE_PICK){ F.KX_NYE=Object.assign({},F.KX_NYE||{},{1:F.KX_NYE_PICK}); delete F.KX_NYE_PICK; }
      const pick=F.KX_NYE&&F.KX_NYE[1];
      if(nye&&typeof OUT!=='undefined'&&!OUT.get(G,'nye')&&G.day===nye){
        if(pick==='river') OUT.plan(G,{id:'nye',ev:'ev_nye_river',day:nye,h:23.5,place:'河堤',title:'跨年：和可昕去河堤',travel:'開車約 30 分鐘',travelH:0.5});
        else if(pick==='roof'||PHONE.inGroup(G,'noodle_team')) OUT.plan(G,{id:'nye',ev:'ev_nye_roof',day:nye,h:23.75,place:'宿舍頂樓',title:'跨年：宿舍頂樓',travel:'',travelH:0,back:'回到房間。'}); }
      if(F.NYE_DONE==='river'&&nye&&PHONE.inGroup(G,'noodle_team')) PHONE.at(G,nye,24.2,[{th:'g:noodle_team',from:'zhe',text:'📷（宿舍頂樓，遠遠的煙火）'},{th:'g:noodle_team',from:'zhe',text:'我們就說有看到。'}],'nye_roof_photo'); }
    /* 期末成績的約定（BB_95 9-8、BB_107 第 13 節）：期末考週最後一個上課日（1/2 週五）21:00 她傳；兩個回覆都算約好（KX_GRADES_PACT_SET）。
       成績出來那天（寒假第一天的早上，classes3d.js 的 morning）先問「要不要先看自己的成績？」（S.holdGrades）；那天 21:00 視訊一起打開（出遊系統，「接起來」）；
       先看的玩家那天晚上她先傳「你偷看了吧。……」，視訊照樣一起打開。記 KX_GRADES_PACT:'kept'|'peeked'。遊戲不顯示分數（成績單是文字）*/
    { const last=termDay('Y1S1',18,5);
      if(last&&F.dating_kexin&&!PHONE.sent(G,'kx_grades_ask')&&G.day<=last+2&&G.day>=last-1) PHONE.at(G,last,21,[{th:'p:kexin',from:'kexin',text:'成績出來先不要給對方看。寒假第一天一起打開。',ask:{opts:[{t:'好。',set:{KX_GRADES_PACT_SET:true}},{t:'我會忍不住。',set:{KX_GRADES_PACT_SET:true},say:[{from:'kexin',text:'那你偷看的時候，表情不要寫在訊息裡。'}]}]}}],'kx_grades_ask');
      if(F.KX_GRADES_PACT==='peeked'&&F.kxGradesDay!=null) PHONE.at(G,F.kxGradesDay,21,[{th:'p:kexin',from:'kexin',text:'你偷看了吧。你的表情寫在訊息的標點符號上。'}],'kx_grades_peek'); }
    /* 9-9 期末：成績的約定（大一下版；BB_96 9-9、AA_157 第 2 節、BB_139 第 2 節）＋P4e（BB_105／BB_135 第 3 節）。順序（AA-B 2026-10-16）：
       ① 6/26（五，第 18 週）21:00 可昕傳約定：大一上 'kept' 或舊存檔沒有旗標＝「這次也一起打開？暑假第一天。」（together）；'peeked'＝「這次換個方式：各自先看，然後各說一科最滿意的。」（best_one）。記 KX_GRADES_Y1S2。
       ② 6/27（六）10:00 經原（下）成績先公布（P4e）：看得到的 11 堂去了 6 堂以上＝旁白「一年前沒拿到的，這次拿到了。」；5 堂以下＝芯慈三句＋「……靠一本借來的筆記拿到了。」。
          交往中才有「傳給可昕」：傳＝長頸鹿貼圖＋together「這一科可以先說。其他的，暑假第一天一起開。」／best_one「這科就是你最滿意的那一科吧。」；不傳、單身＝「你把成績單收進抽屜。」。
       ③ 6/29（一）暑假第一天：together＝早上先問「先看／等到晚上」、21:00 視訊（S.holdGrades、ev_kexin_grades_open_y1s2）；best_one＝21:00 她先說「憲法」再問你一科（P4e 已經傳給她的不問）。
       冷戰（AA_112 第 6 節）還沒有系統：交往中都照上面 */
    { const last=termDay('Y1S2',18,5), K=t=>({th:'p:kexin',from:'kexin',text:t});
      if(last&&F.dating_kexin&&!PHONE.sent(G,'kx_grades2_ask')&&G.day<=last+2&&G.day>=last-1){ F.KX_GRADES_Y1S2=F.KX_GRADES_PACT==='peeked'?'best_one':'together';
        PHONE.at(G,last,21,[K(F.KX_GRADES_Y1S2==='best_one'?'這次換個方式：各自先看，然後各說一科最滿意的。':'這次也一起打開？暑假第一天。')],'kx_grades2_ask'); }
      const took=typeof CLS!=='undefined'&&CLS.termCourses&&CLS.termCourses(G,'Y1S2').some(c=>c.id==='econ_principles_2');
      if(last&&took&&!PHONE.sent(G,'p4e')&&G.day>=last+1&&G.day<=last+3){
        const att=(CLS.rec(G).attend||{}).econ_principles_2||0, items=[{th:'sys',text:'經濟學原理（下）的成績公布了。'}], N=t=>({th:'sys',who:null,text:t}), drawer=N('你把成績單收進抽屜。');
        if(att>=6) items.push(N('一年前沒拿到的，這次拿到了。'));
        else { silentContact('classmate_xinci'); const X=t=>({th:'p:classmate_xinci',from:'classmate_xinci',text:t}); items.push(X('過了吧？……我的筆記功不可沒。'),{th:'p:classmate_xinci',from:'player',who:null,text:'請妳吃飯。'},X('兩次。'),N('一年前沒拿到的，這次靠一本借來的筆記拿到了。')); }
        if(F.dating_kexin){ const mode=F.KX_GRADES_Y1S2||'together'; Object.assign(items[items.length-1],{ask:{until:(last+3)*24+24,opts:[
            {t:'傳給可昕',post:'（傳給可昕）',set:{KX_P4E:'sent'},say:[{th:'p:kexin',from:'player',who:null,text:'📷（經濟學原理（下）的成績）'},K('（貼圖：長頸鹿）'),K(mode==='best_one'?'這科就是你最滿意的那一科吧。':'這一科可以先說。其他的，暑假第一天一起開。')]},
            {t:'不傳',post:'（不傳）',set:{KX_P4E:'kept'},say:[drawer]}]}}); }
        else items.push(drawer);
        PHONE.at(G,last+1,Math.max(10,G.day===last+1?h(G):10),items,'p4e'); }
      const sum1=termDay('Y1S2',18,7)+1;
      if(sum1&&F.dating_kexin&&F.KX_GRADES_Y1S2==='best_one'&&F.KX_P4E!=='sent'&&G.day>=sum1&&G.day<=sum1+1&&!PHONE.sent(G,'kx_best_one')){
        const cs=CLS.termCourses(G,'Y1S2').filter(c=>c.kind!=='service'), short=c=>c.name.replace(/（.*?）/g,'');
        PHONE.at(G,sum1,21,[K('說好的，各說一科。我先：憲法。老師說我的答案像在寫信。'),Object.assign(K('換你。'),{ask:{until:(sum1+1)*24+24,opts:cs.map(c=>({t:short(c),set:{KX_BEST_ONE_Y1S2:c.id},say:[K(c.id==='econ_principles_2'?'經原？……那一科，我們以前坐在同一間教室。它也替你高興。':'「'+short(c)+'」。好，我記下來了。……明年再比一次。')]}))}})],'kx_best_one'); } }
    /* 方奕廷「學弟好。明天寒流。」（BB_120 1-7c、BB 2026-10-14）：第一波寒流（S.firstColdDay，AA_71 十二月第一波；遊戲還沒有寒流的天氣，先放大一上第 15 週週一）的前一晚 20:30；
       「有點熟」以前、有黃金葛、有他的聯絡方式（前一天以前拿到）*/
    { const cold=S.firstColdDay(); if(cold&&G.day>=cold-2&&G.day<=cold-1&&!PHONE.sent(G,'fy_cold')&&fyEarly(G)&&F.POTHOS) PHONE.at(G,cold-1,20.5,[P1('npc_fangyt','學弟好。明天寒流。黃金葛不要放窗邊。'),P1('npc_fangyt','它怕冷。我也是。',1/60)].map(x=>{ const y=Object.assign({},x); delete y.dt; return y; }),'fy_cold'); }
    /* 以安新 5 的結果（交接包 v2 C8）：第 7 週週五 21:00 還沒在總圖當面聽到＝私訊同樣的話（有她的聯絡方式）；沒遇到的玩家第 7 週週三 21:30 麵店團群組「我室友的申訴過了一半。」（聽說）*/
    { const fri=termDay('Y1S2',7,5), wed=termDay('Y1S2',7,3), done=id=>!!(G.events&&G.events.done&&G.events.done[id]);
      if(fri&&G.day===fri&&h(G)<21&&done('ev_an_dorm_appeal')&&!F.AN_APPEAL_RESULT&&!PHONE.sent(G,'an_appeal_result')&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_01')){ F.AN_APPEAL_RESULT='phone';
        PHONE.at(G,fri,21,[P1('heroine_01','點數減了一點。宿舍說，以後記點以前會先問。'),P1('heroine_01','我本來想證明規定是錯的。後來發現規定沒錯，是它沒想到這種情況。')].concat(F.AN_APPEAL==='ask'?[P1('heroine_01','你說的那一句，我放在第一段。')]:[]).map(x=>{ const y=Object.assign({},x); delete y.dt; return y; }),'an_appeal_result'); }
      if(wed&&G.day>=wed-1&&G.day<=wed&&!done('ev_an_dorm_appeal')&&!PHONE.sent(G,'an_appeal_heard')&&PHONE.inGroup(G,'noodle_team')&&S.knows('heroine_01',G)){
        PHONE.at(G,wed,21.5,[{th:'g:noodle_team',from:'heroine_01',text:'我室友的申訴過了一半。'}],'an_appeal_heard'); if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!SOCIAL.has('heroine_01','HEARD_ABOUT')) SOCIAL.remember('heroine_01','HEARD_ABOUT','聽說她室友的申訴過了一半'); } }
    /* 寒假拜年（交接包 v2 C3；AA_71 2-8「大一的台詞」，芷若、方奕廷兩則 BB 7451e42 改字）：大一上和大一下之間的春節（S.lunarNewYear＝初一）。只有認識的人：
       麵店團群組初一 11:00 阿哲、以安各一張照片＋拜年，可以回姊姊帶你去吃的牛肉麵（2026-10-14 祐廷改成臺北人，原本是火雞肉飯）或「新年快樂」的貼圖（不回就只是沒回，AA_70 1-9）；
       芷若有點熟以上、有聯絡方式：初一 15:30 私訊（朋友以上多「……我家的。」）；方奕廷有點熟以上、有聯絡方式：初三 15:00 才到（山上沒有訊號），朋友以上隔天公布答案 */
    { const ny=S.lunarNewYear(); if(ny!=null&&G.day>=ny-1&&G.day<=ny+4){ const LV=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND'], atL=(id,lv)=>LV.indexOf(fl(id))>=LV.indexOf(lv);
      if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'cny_noodle')){ const th='g:noodle_team';
        PHONE.at(G,ny,11,[{th,from:'zhe',text:'📷（高雄的夜市，人擠人）'},{th,from:'zhe',text:'新年快樂！高雄沒有冬天'},{th,from:'zhe',text:'你們那邊冷嗎'},{th,from:'heroine_01',text:'📷（台中的老街，一整排紅燈籠）'},
          {th,from:'heroine_01',text:'新年快樂。人太多，只走到第三個路口就回家了。',ask:{id:'cny_noodle_reply',opts:[{t:'（傳姊姊帶你去吃的牛肉麵）',post:'📷（姊姊帶你去吃的牛肉麵）',say:[{from:'zhe',text:'牛肉麵！！開學帶我們去'},{from:'heroine_01',text:'哪一家？……記下來了。'}]},
            {t:'（傳一張「新年快樂」的貼圖）',post:'（貼圖：新年快樂）',say:[{from:'zhe',text:'（貼圖：新年快樂）'}]}]}}],'cny_noodle'); }
      if(atL('heroine_02','FAMILIAR')&&gotBefore(G,'heroine_02')&&!PHONE.sent(G,'cny_zhiruo')){ const th='p:heroine_02';
        PHONE.at(G,ny,15.5,[{th,from:'heroine_02',text:'📷（台中，高中旁邊的影印店，鐵門拉下來，貼著紅紙「初一至初三休息」）'},{th,from:'heroine_02',text:'新年快樂。'},{th,from:'heroine_02',text:atL('heroine_02','FRIEND')?'店休三天。……我家的。':'店休三天。'}],'cny_zhiruo'); }
      if(atL('npc_fangyt','FAMILIAR')&&gotBefore(G,'npc_fangyt')&&!PHONE.sent(G,'cny_fangyt')){ const th='p:npc_fangyt', fr=atL('npc_fangyt','FRIEND'), Y=t=>({th,from:'npc_fangyt',text:t});
        PHONE.at(G,ny+2,15,[Y('📷（山上的雲海和一棵松樹）'),Y('新年快樂。初一拍的，山上沒有訊號。')].concat(fr?[Y('這棵你猜。')]:[Y('台灣二葉松，Pinus taiwanensis。針葉兩根一束。'),Y('山上聽不到鞭炮。很好。')]),'cny_fangyt');
        if(fr) PHONE.at(G,ny+3,10,[Y('答案：台灣二葉松。針葉兩根一束，名字就是提示。')],'cny_fangyt_answer'); } } }
    /* 以安新 7（交接包 v2 C14）：①第 11 週週二晚上沒在麵店看到吵架（ev_an_yu_argument 沒演）＝21:30 小語在麵店團群組「我跟以安吵架了。」、22:10「……吵得很好。」，記「聽說」；
       ②公法讀書會的邀請：第 12 週週一 21:00 麵店團群組以安「公法讀書會。週四晚上八點，萬才館研討室。」小語「我也是發起人喔。」（所有人都收到：不在麵店團、有以安聯絡方式的＝她私訊同一句）*/
    { const tue=termDay('Y1S2',11,2), mon=termDay('Y1S2',12,1), done=id=>!!(G.events&&G.events.done&&G.events.done[id]);
      if(tue&&G.day>=tue&&G.day<=tue+1&&!(G.day===tue&&h(G)<21.5)&&!done('ev_an_yu_argument')&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'an_yu_heard')){ const th='g:noodle_team';
        PHONE.at(G,tue,21.5,[{th,from:'yu',text:'我跟以安吵架了。'}],'an_yu_heard'); PHONE.at(G,tue,22+1/6,[{th,from:'yu',text:'……吵得很好。'}],'an_yu_heard2');
        if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('heroine_01','HEARD_ABOUT','聽說她和小語吵架了'); }
      if(mon&&G.day>=mon-1&&G.day<=mon+3&&!PHONE.sent(G,'plg_invite')){
        if(PHONE.inGroup(G,'noodle_team')){ const th='g:noodle_team'; PHONE.at(G,mon,21,[{th,from:'heroine_01',text:'公法讀書會。週四晚上八點，萬才館研討室。'},{th,from:'yu',text:'我也是發起人喔。'}],'plg_invite'); }
        else if(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'heroine_01')) PHONE.at(G,mon,21,[{th:'p:heroine_01',from:'heroine_01',text:'公法讀書會。週四晚上八點，萬才館研討室。'}],'plg_invite'); } }
    /* B4 博雅午後講座（交接包 v2 C13；BB_105 4-5、AA_115 第 1 節）：①第 11 週週二 12:30 麵店團群組以安揪人（和以安新 7 前半同一天；時間是 LAWWW 排的），小語、阿哲回；
       玩家回「我去。」／「我看看。」／不回都一樣（只記 B4_REPLY），去不去看週四有沒有走進博雅 101。②沒去（missed:B4）：週四 21:30 小語在群組轉述一句 */
    { const tue=termDay('Y1S2',11,2), thu=termDay('Y1S2',11,4);
      if(tue&&thu&&G.day>=tue-1&&G.day<=thu&&PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'b4_invite')){ const th='g:noodle_team';
        PHONE.at(G,tue,12.5,[{th,from:'heroine_01',text:'週四晚上七點，博雅 101 有演講。'},{th,from:'heroine_01',text:'「政府可以為了大家，限制一個人嗎？」誰要去？'},{th,from:'yu',text:'我！我是憲法迷。'},
          {th,from:'zhe',text:'……我跟。散場有宵夜嗎？',ask:{until:thu*24+19,opts:[{t:'我去。',set:{B4_REPLY:'go'}},{t:'我看看。',set:{B4_REPLY:'maybe'}}]}}],'b4_invite'); }
      if(thu&&G.day>=thu&&G.day<=thu+1&&!(G.day===thu&&h(G)<21.5)&&PHONE.inGroup(G,'noodle_team')&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.missed(G,'B4')&&!PHONE.sent(G,'b4_missed')){
        PHONE.at(G,thu,21.5,[{th:'g:noodle_team',from:'yu',text:'講者最後問：被限制的人可以去哪裡。我想了一路。'}],'b4_missed'); } }
    /* 可玩切片的選擇③——沛珊的那張表（BB_96 3-7；AA_115 第 1 節）：有沛珊聯絡方式的玩家。①第 11 週週二 12:00 她私訊兩句（「好。」＝比 OK 的貼圖；「我不一定會去演講。」＝「那你經過女舍的時候說一聲。」）；
       ②週四 20:40 改約的兩句（所有人都收到；人在女舍門口長椅旁＝events.js 的 ev_peishan_table_bench 三選一）；③等了十分鐘的玩家，隔天 12:00「你真的等了十分鐘？……下次我會先說。」*/
    { const tue=termDay('Y1S2',11,2), thu=termDay('Y1S2',11,4), th='p:classmate_peishan', ps=t=>({th,from:'classmate_peishan',text:t});
      if(tue&&thu&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')){
        if(G.day>=tue-1&&G.day<=thu&&!PHONE.sent(G,'ps_table_ask')) PHONE.at(G,tue,12,[ps('刑總二未遂那一章，我做了一張表，印給大家。'),Object.assign(ps('你的那份，週四演講完，來女舍門口拿？'),{ask:{until:thu*24+20+40/60,opts:[
            {t:'好。',set:{PS_TABLE_REPLY:'ok'},say:[ps('（貼圖：比 OK）')]},{t:'我不一定會去演講。',set:{PS_TABLE_REPLY:'maybe'},say:[ps('那你經過女舍的時候說一聲。')]}]}})],'ps_table_ask');
        if(G.day>=thu&&G.day<=thu+1&&!(G.day===thu&&h(G)<20+40/60)&&!PHONE.sent(G,'ps_table_cancel')) PHONE.at(G,thu,20+40/60,[ps('對不起。課輔班的作業還沒改完，明天要發回去。'),ps('今天下不去了。')],'ps_table_cancel');
        if(F.PS_CANCEL==='waited'&&G.day>=thu+1&&G.day<=thu+3&&!PHONE.sent(G,'ps_table_waited')) PHONE.at(G,Math.max(thu+1,G.day),G.day>thu+1?G.hour+0.05:12,[ps('你真的等了十分鐘？……下次我會先說。')],'ps_table_waited'); } }
    /* 法律系的班級群組 law_class（AA-B 2026-10-16，AA_140 第 4 節 B10；台詞歸 BB-B）：所有玩家大一上第 1 天自動加入（舊存檔讀檔時補）；名稱照年級「法律系 大一（全班）」→ 大二、大三、大四。
       會說話的只有同班（阿哲、小語、柏翰、明軒、芯慈、宥辰、沛珊、以安）；只在事件或手機小事指定時出現、不隨機洗版；玩家不能自由發言，只在選項裡回 */
    { const yr=(()=>{ for(let d=G.day;d>G.day-200;d--){ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null; if(T){ const y=+String(T.id).charAt(1); return y>=1&&y<=4?y:0; } } return 1; })();
      if(yr>=1){ const nm='法律系 '+['大一','大二','大三','大四'][yr-1]+'（全班）'; const g=PHONE.join(G,'law_class',nm); if(g&&g.name!==nm) g.name=nm; } }
    /* 經濟系那群的群組「走啦」econ_friends（AA_157 第 1 節，AA-B 2026-10-16）：韋綸建的；從法律系開始的玩家、舊存檔第一天就在手機裡，裡面只有 2025-08-13 放榜那晚的一張照片（只有照片說明、沒有台詞）。
       之後的訊息照各事件（AA_115 xun_met、BB_96 10-4 沒去午餐）。v0（經濟系開局）由 P2 那晚建立，等 v0 做 */
    if(!PHONE.inGroup(G,'econ_friends')){ const g=PHONE.join(G,'econ_friends','走啦'); g.day=Math.min(g.day,-34); if(!PHONE.sent(G,'econ_photo_0813')) PHONE.postAt(G,{th:'g:econ_friends',from:'econ_weilun',name:'韋綸',text:'📷（公館的宵夜攤，六個人和準備收攤的老闆）',tag:'econ_photo_0813'},-34,23.5); if(PHONE.markSeen) PHONE.markSeen(G,'g:econ_friends'); }   /* 一年多前的舊照片：不算未讀 */
    /* 10-3 之後（AA_115 第 2 節、BB_96 10-3／10-4、AA_157）：「聊兩句就走」（xun_met）＝阿勳在「走啦」說一句；「期末考一起讀？」（pact）＝他私訊期末的行程表；
       「一起讀到閉館」（night）的玩家第 11 週週五沒有去小福午餐（SK03_LAST 不是那天）＝12:40 群組一張便當照片「欠你的，下週。」，下一個去的週五照樣推過來（ev_sk03_lunch 的 repay）。
       便當照片只給有週五午餐的玩家（P4d 之後）；只在共同見過阿勳的玩家沒有午餐，這一則先不發（待 AA-B） */
    if(F.XUN_DAY!=null){ const xd=F.XUN_DAY, fri=xd+1;
      if(F.XUN_MET_Y1S2&&!PHONE.sent(G,'xun_met_grp')) PHONE.at(G,xd,21.2,[{th:'g:econ_friends',from:'econ_zhengxun',text:'我在共同遇到他。法律系果然比較累。'}],'xun_met_grp');
      if(F.XUN_PACT&&!PHONE.sent(G,'xun_pact_plan')){ silentContact('econ_zhengxun'); PHONE.at(G,xd,21.2,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'📄（期末考那兩週的行程表）'}],'xun_pact_plan'); }
      if(F.XUN_NIGHT&&F.P4D_ANSWER&&!F.XUN_REPAID&&F.SK03_LAST!==fri&&(G.day>fri||(G.day===fri&&h(G)>=12+40/60))&&!PHONE.sent(G,'xun_repay_photo'))
        PHONE.at(G,fri,12+40/60,[{th:'g:econ_friends',from:'econ_zhengxun',text:'📷（一個便當）'},{th:'g:econ_friends',from:'econ_zhengxun',text:'欠你的，下週。'}],'xun_repay_photo'); }
    /* SK05 三閃，販賣機見（大一版；BB_135 第 2 節；AA-B 2026-10-16：期末考週（第 17～18 週，2026-06-15～06-28）第一個晚上玩家在霖澤館（22:55～23:30；23:00 以後才走進去＝一進去就亮））：
       23:00 阿勳傳訊息說暗號（一年一次）。法律系時期一直沒見過他的玩家（MET_XUN 沒有）先多一則「我是盧正勳。你經濟系那年的室友。」。pact 多兩句、night 多一句（都有＝先 pact 再 night）。
       三個回覆：閃三下＝SK05_GO（今晚 23:00～23:45 他在法學院廣場的販賣機前，events.js ev_sk05_vending_y1）；閃一下、只回訊息＝這一年沒有這五分鐘 */
    { const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hh=h(G);
      if(T&&T.id==='Y1S2'&&(T.week===17||T.week===18)&&(G.zone==='linze'||G.zone==='classroom')&&hh>=22+55/60&&hh<23.5&&!PHONE.sent(G,'sk05_y1')){
        silentContact('econ_zhengxun'); const th='p:econ_zhengxun', X=t=>({th,from:'econ_zhengxun',text:t}), N=t=>({th,who:null,text:t}), d=G.day;
        const items=[]; if(!F.MET_XUN) items.push(X('我是盧正勳。你經濟系那年的室友。'));
        items.push(X('你們那邊燈還亮著。'),X('我在社科院四樓，窗邊。看對面。'),N('（對面的窗，燈閃了一下。）'),X('一閃是還活著。兩閃是救我。'));
        const last=X('三閃是販賣機見。'); const opts=[{t:'（閃三下）',set:{SK05_GO:d},say:[X('……真的？好，五分鐘。')]},{t:'（閃一下）',set:{SK05_Y1_REPLY:'one'},say:[X('好。活著就好。')]},{t:'還活著。',set:{SK05_Y1_REPLY:'text'},say:[X('用閃的比較快。……好啦，加油。')]}];
        const tail=[]; if(F.XUN_PACT) tail.push(N('（對面的窗又閃了三下。）'),X('我先閃了。')); if(F.XUN_NIGHT) tail.push(X('這次不用等你了。'));
        if(tail.length){ items.push(last,...tail.slice(0,-1),Object.assign(tail[tail.length-1],{ask:{until:d*24+23.75,opts}})); } else items.push(Object.assign(last,{ask:{until:d*24+23.75,opts}}));
        PHONE.at(G,d,Math.max(23,hh+0.02),items,'sk05_y1'); }
      if(F.SK05_GO!=null&&!F.SK05_Y1&&(G.day>F.SK05_GO||hh>=23.75)&&!PHONE.sent(G,'sk05_noshow_y1')) PHONE.at(G,F.SK05_GO,23.75,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'……你閃了三下又不來。'},{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'明年再說。'}],'sk05_noshow_y1'); }
    /* 沛珊「欠的，還了。」（BB_96 3-7；BB-B 2026-10-16 02:00）：大一下第 16 週週日 21:00 在班級群組，只有沛珊說話、沒有別人接話。第 11 週選「沒關係」（PS_CANCEL:'ok'）的玩家看到「欠的，還了。」，
       其他玩家（另外兩個選項、沒去女舍、不回）看到「期末加油。」——同一則公開訊息，只有後半句不同。沒有沛珊聯絡方式的玩家，整條線不發生。玩家三選一（貼圖／「謝謝！」／不回），沒有後續、不記數值 */
    { const sun=termDay('Y1S2',16,7);   /* 週日：CALENDAR 的 wd 是 1～7（7＝週日）*/
      if(sun&&G.day>=sun&&G.day<=sun+1&&!(G.day===sun&&h(G)<21)&&!PHONE.sent(G,'ps_owed')&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')&&PHONE.inGroup(G,'law_class'))
        PHONE.at(G,sun,21,[{th:'g:law_class',from:'classmate_peishan',text:'📄 刑總二重點。'+(F.PS_CANCEL==='ok'?'欠的，還了。':'期末加油。'),ask:{opts:[{t:'（貼一個貼圖）',post:'（貼圖）'},{t:'謝謝！'}]}}],'ps_owed'); }
    /* W3b 不讓步的晚上（BB_96 2-4；文章 BB 137bf31，不是法律、不需法律審查）：ev_grad_debate 之後每兩週一次，20:30，大一下到大二（學期中）。
       她這段期間有伴侶＝發在讀書會群組（不在群組的玩家那一次就沒有）。三篇輪流；第一次的開頭依 W3_STANCE 換一句（BB_96 2-3 回聲）；
       玩家的三個反例都打第二點，她的回應依反例、長回覆折起來（fold：手機上點開看全文）；記 ARGUED_GOOD（累計）。三篇都輪過以後：「這篇你讀過了。」玩家選哪一點有問題（第二點＝「對。」，其他＝「再讀一次。」，不扣分）。
       摘要日／精華日還沒做，時間先定 20:30（「晚上 21:00 前」）*/
    { const dd=G.events&&G.events.last?G.events.last.ev_grad_debate:null;
      if(dd!=null&&G.day>dd&&PHONE.inGroup(G,'lawclub_study')){ const k=Math.floor((G.day-dd)/14)-1, d=dd+14*(k+1), tg='w3b_'+k, tm=typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
        if(k>=0&&tm&&['Y1S2','Y2S1','Y2S2'].includes(tm.id)&&G.day<=d+1&&!(G.day===d&&h(G)<20.5)&&!PHONE.sent(G,tg)){
          const n=F.W3B_N|0, A=W3B_ART[n%3], th='g:lawclub_study', W=(t,o)=>Object.assign({th,from:'heroine_05',name:'溫學姊',text:t},o||{}), ME=t=>({th,from:'player',text:t}); let items;
          if(n<3){ const open=n===0&&W3B_OPEN[F.W3_STANCE]?[W(W3B_OPEN[F.W3_STANCE])]:[];
            items=open.concat([W('這篇。三個論點。'),W('📄 校刊投書〈'+A.title+'〉'),W('一，'+A.pts[0]),W('二，'+A.pts[1]),
              W('三，'+A.pts[2],{ask:{opts:A.cx.map((c,i)=>({t:c[0],post:'第二點有反例。'+c[0],say:[W(W3B_RESP[i]),ME('哪裡。'),W(A.long[0],{fold:A.long}),ME('那我換一個反例。'),W('……重點是，你的論點比上週好。')],
                mem:[{npc:'heroine_05',tag:'ARGUED_GOOD',note:'W3b〈'+A.title+'〉'}]}))}})]); }
          else items=[W('📄 校刊投書〈'+A.title+'〉'),W('這篇你讀過了。這次換你先說三個論點。',{ask:{opts:['第一點','第二點','第三點'].map((t,i)=>({t:t+'有問題。',say:[W(i===1?'對。':'再讀一次。')]}))}})];
          items.forEach((m,i)=>{ m.dt=i/60; }); PHONE.at(G,d,20.5,items,tg); F.W3B_N=n+1; } } }
    /* 法四學長姊畢業的群組（交接包 v2 C17；AA_71 2-12）：大一下第 15 週週六。法服群組（加入法服的玩家）12:30 有人傳合照＋「恭喜學長姊！法服永遠歡迎回來值班！」（傳的人：法服社長——法三的學長姊、不具名，社團公告的口氣；AA 2026-10-14）；
       家族群組 13:00 Kevin 傳畢業照，學姊「恭喜。」（不是「收到」，BB_96 第 5 節）*/
    { const gd=termDay('Y1S2',15,6); if(gd&&G.day>=gd-1&&G.day<=gd+1){
      if(PHONE.inGroup(G,'lawclub_study')&&!PHONE.sent(G,'grad_lawclub')){ const th='g:lawclub_study'; PHONE.at(G,gd,12.5,[{th,from:'npc_lawclub_pres',name:'法服社長',text:'📷（學長姊穿學士服、抱著花的合照）'},{th,from:'npc_lawclub_pres',name:'法服社長',text:'恭喜學長姊！法服永遠歡迎回來值班！'}],'grad_lawclub'); }
      if(PHONE.inGroup(G,'family_law')&&!PHONE.sent(G,'grad_family')){ const th='g:family_law'; PHONE.at(G,gd,13,[{th,from:'kevin',name:'Kevin',text:'📷（學長姊的畢業照）'},{th,from:'heroine_05',name:'溫學姊',text:'恭喜。'}],'grad_family'); } } }
    /* 芷若 Z5（BB_96 3-5；交接包 v2）：週五答應（zhiruoFilmDay）＝隔天週六 10:00 的早場（出遊 ev_zhiruo_early_show）；「下次妳挑」的回聲：兩天後 21:00 她傳一張很長的片單
       （單身＝私訊；交往中＝三個人的群組，方奕廷回「這張表要看到明年」）*/
    if(F.zhiruo_film_date&&F.zhiruoFilmDay!=null&&typeof OUT!=='undefined'&&!OUT.get(G,'zr_early_show')&&G.day<=F.zhiruoFilmDay+1) OUT.plan(G,{id:'zr_early_show',ev:'ev_zhiruo_early_show',day:F.zhiruoFilmDay+1,h:10,place:'公館的二輪戲院',title:'東京物語的早場',travel:'走過去約 15 分鐘',travelH:0.25});
    if(F.Z5_NEXT==='hers'&&F.zhiruoFilmSeenDay!=null&&!PHONE.sent(G,'zr_film_list')){ const d=F.zhiruoFilmSeenDay+2;
      if(F.dating_kexin){ if(!PHONE.inGroup(G,'zr_film')) PHONE.join(G,'zr_film','東京物語'); PHONE.at(G,d,21,[{th:'g:zr_film',from:'heroine_02',text:'📄（一張很長的片單）'},{th:'g:zr_film',from:'npc_fangyt',text:'這張表要看到明年'}],'zr_film_list'); }
      else PHONE.at(G,d,21,[{th:'p:heroine_02',from:'heroine_02',text:'📄（一張很長的片單）'}],'zr_film_list'); }
    /* 子晴 Q5 成發（BB_96 4-4；交接包 v2）：第 13 週週三 21:30 吉他社群組「期末成發你要來。這不是問句。」（伏筆）；成發隔天 10:00：先走的「你看到一半。後半比較好。」、
       收到邀請或是吉他社的人卻沒去＝「你沒來」（ZQ_SHOW absent；之後一週她不約他：zqColdUntil）*/
    { const dInv=termDay('Y1S2',13,3), dShow=termDay('Y1S2',14,3);
      if(dInv&&dShow&&G.day>=dShow-15&&G.day<=dShow+2){ const th='p:heroine_04', Z=t=>({th,from:'heroine_04',text:t});
        if(PHONE.inGroup(G,'guitar')&&!PHONE.sent(G,'zq_show_inv')) PHONE.at(G,dInv,21.5,[{th:'g:guitar',from:'heroine_04',text:'期末成發你要來。這不是問句。'}],'zq_show_inv');
        if(PHONE.inGroup(G,'guitar')&&!PHONE.sent(G,'zq_show_cd')&&G.day<=dShow-14) PHONE.at(G,dShow-14,21,['成發','倒數','十四天','不能請假','這不是問句'].map((t,k)=>({th:'g:guitar',from:'heroine_04',text:t})),'zq_show_cd');   /* 成發倒數（BB_96 第 5 節）：十四天前 */
        if(G.day>dShow||(G.day===dShow&&G.hour>=21.2)){
          if(F.ZQ_SHOW==='half'&&!PHONE.sent(G,'zq_show_half')) PHONE.at(G,dShow+1,10,[Z('你看到一半。後半比較好。')],'zq_show_half');
          const invited=PHONE.sent(G,'zq_show_inv')||!!F.CLUB_club_guitar, went=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attended(G,'guitar_show_y1s2',dShow);
          if(F.ZQ_SHOW==null&&invited&&!went&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','FIRST_MET')){ F.ZQ_SHOW='absent'; F.zqColdUntil=dShow+8; PHONE.at(G,dShow+1,10,[Z('你沒來')],'zq_show_absent'); } } } }
    /* 學姊 W2b／W2c、「誰有車？」（BB_96 2-1、2-2、BB_97 2-9；交接包 v2）：大一下的家族群組（法律系直屬家族，給所有人；學姊有伴侶，沒有兩個人的時間）。
       第 3 週週二 21:00 Kevin 開玩笑（說要請全家族飲料＝SAID_TREAT_SIS／貼圖／不回）；週五 21:00 Kevin 揪第 4 週週五 18:30 永康街的咖哩（「去。」＝排出遊 ev_family_dinner；有 SAID_TREAT_SIS 學姊多三句）；
       接著 Kevin「家聚要搬兩箱飲料，誰有車？」（「我有。」＝SAID_HAS_CAR）。聚餐當晚 21:30 學姊「三件事」（W2c，給所有人，沒去也看得到；TREATED_FAMILY 換第三件）。
       沒去聚餐、有 SAID_TREAT_SIS 的期末那三句：要先有 Kevin 揪期末聚餐的那一則（台詞已問 BB）*/
    if(PHONE.inGroup(G,'family_law')&&typeof CALENDAR!=='undefined'){ const th='g:family_law', kv=t=>({th,from:'kevin',name:'Kevin',text:t}), sis=t=>({th,from:'heroine_05',name:'溫學姊',text:t});
      const dJ=termDay('Y1S2',3,2), dI=termDay('Y1S2',3,5), dD=termDay('Y1S2',4,5);
      /* W2b 期末（BB_96 2-1，BB 14265eb）：第 17 週週五 21:00 Kevin 在家族群組揪期末聚餐（只有群組訊息，不另做聚餐事件）；學姊照玩家回：
         去了而且請了（TREATED_FAMILY）＝「收到。這次飲料我請。」；沒去家聚、說過要請（SAID_TREAT_SIS）＝學姊、Kevin、學姊三句；其他＝「收到。」*/
      { const dF=termDay('Y1S2',17,5); if(dF&&G.day>=dF&&G.day<=dF+1&&!PHONE.sent(G,'fam_final_y1s2')){ const went=typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER');
          const L=[kv('期末考完，家族聚餐。這次地方我選：公館的火鍋吃到飽。全家族。')];
          if(F.TREATED_FAMILY) L.push(sis('收到。這次飲料我請。'));
          else if(!went&&F.SAID_TREAT_SIS) L.push(sis('你上次說要請全家族飲料。'),kv('學姊以為是客套吧。'),sis('……對。可是我記得。'));
          else L.push(sis('收到。'));
          PHONE.at(G,dF,21,L,'fam_final_y1s2'); } }
      if(dJ&&dI&&dD&&G.day>=dJ-1&&G.day<=dD+1){
        if(!PHONE.sent(G,'fam_joke_y1s2')) PHONE.at(G,dJ,21,[kv('學姊上學期聚餐遲到一分鐘。'),Object.assign(kv('這學期罰她出來吃飯。全家族。'),{ask:{until:dI*24+21,opts:[
            {t:'那學姊來，我請全家族一輪飲料。謝謝她的書。',set:{SAID_TREAT_SIS:true},say:[kv('學弟好勇。'),sis('好啊。')]},{t:'（貼圖）',say:[kv('至少有人回。')]}]}})],'fam_joke_y1s2');
        if(!PHONE.sent(G,'fam_dinner_inv')&&G.day>=dI){ const L=[Object.assign(kv('週五六點半，永康街那家咖哩。全家族。'),{ask:{until:dD*24+18,opts:[{t:'去。',set:{FAM_DINNER_GO:true}},{t:'這次不行。',set:{FAM_DINNER_GO:false}}]}})];
          if(F.SAID_TREAT_SIS) L.push(sis('……學弟，你是認真的？'),sis('我以為那是客套話。'),sis('好。六點半。我會準時。重點是，你們不要遲到。'));
          PHONE.at(G,dI,21,L,'fam_dinner_inv'); PHONE.at(G,dI,21.3,[Object.assign(kv('家聚要搬兩箱飲料，誰有車？'),{ask:{until:dD*24+18,opts:[{t:'我有。',set:{SAID_HAS_CAR:true},say:[kv('直屬學弟有車！'),sis('……好。之後有用。')]}]}})],'fam_car'); }
        if(F.FAM_DINNER_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'fam_dinner_y1s2')) OUT.plan(G,{id:'fam_dinner_y1s2',ev:'ev_family_dinner',day:dD,h:18.5,place:'永康街的咖哩店',title:'家族聚餐',travel:'約 20 分鐘',travelH:1/3});
        if(!PHONE.sent(G,'fam_three_things')&&(G.day>dD||(G.day===dD&&G.hour>=21.4))){
          PHONE.at(G,dD,21.5,[sis('三件事。'),sis('一，今天謝謝大家。'),sis('二，Kevin 遲到七分鐘，下次地方他選。'),
            Object.assign(sis(F.TREATED_FAMILY?'三，學弟的飲料，我記得。':'三，我這學期第一次好好吃完一頓飯。'),{ask:{until:(dD+1)*24+12,opts:[{t:'（貼圖）'},{t:'收到'}]}})],'fam_three_things');
          if(typeof SOCIAL!=='undefined') SOCIAL.remember('heroine_05','FAMILY_THREE_THINGS','家族群組的三件事'); } } }
    /* 除夕：可昕 KN 的假設題（BB_96 9-2；接主線 2＝交接包 v2 C2）：交往中，除夕晚上主線 2 演完以後 22:00 她傳（22:00 還沒演＝照樣 22:00 傳，沒有「家裡在講一件事」）。
       「今天家裡在講一件事。」只在有 FAMILY_LAND_Y1；之後再選「妳聽就好。」／「一起看。」（記 KX_FAMILY_LAND）；「一起看」而且主線 2 選了「先問哪幾件事」多一句。
       不回：隔天 9:00「新年快樂。昨天的題目，你可以想一年。」（回覆在那之前可以回）。打給妳：電話（她那邊的鞭炮聲、新年快樂、早點睡）寫在對話串裡 */
    { const ny=S.lunarNewYear(); if(ny!=null&&F.dating_kexin&&G.day>=ny-1&&G.day<=ny){ const eve=ny-1, th='p:kexin', K=t=>({th,from:'kexin',text:t});
        if(!PHONE.sent(G,'kx_kn_y1')&&(F.FAMILY_LAND_Y1||G.day>eve||G.hour>=22)){ const land=!!F.FAMILY_LAND_Y1;
          const look=[K('我們還沒教到物權。所以先查清楚，不要猜。')].concat(F.FAMILY_LAND_Y1==='ask'?[K('……可是你先問了大家想要什麼。這很好。')]:[]);
          const opts=[{t:'再吃一輪。',say:[K('好。那我的一小時拿來消化。')]},
            {t:'打給妳。',say:[K('……那這一小時現在開始。'),{who:null,text:'（電話響了。她那邊的鞭炮聲。）'},K('新年快樂。'),K('早點睡。')]}];
          if(land) opts.push({t:'今天家裡在講一件事。',say:[Object.assign(K('我可以只聽，也可以一起看。你選。'),{ask:{until:ny*24+9,opts:[
            {t:'妳聽就好。',set:{KX_FAMILY_LAND:'listen'},say:[{who:null,text:'（她聽你講完大伯、十四個名字、姊姊在旁邊憋笑。）'},K('……你還好嗎？'),{from:'player',who:null,text:'還好。有點好笑。'},K('那就好。')]},
            {t:'一起看。',set:{KX_FAMILY_LAND:'look'},say:[{from:'player',who:null,text:'📷（土地謄本，地號遮住）'}].concat(look)}]}})]});
          PHONE.at(G,eve,Math.max(22,G.day>eve?22:G.hour+0.05),[K('新年快樂。今天的假設題。'),Object.assign(K('假設除夕可以延長一小時，你要拿來做什麼？'),{ask:{until:ny*24+9,opts}})],'kx_kn_y1'); }
        if(G.day===ny&&G.hour>=9&&!PHONE.sent(G,'kx_kn_noreply')){ const m=(G.msgs||[]).find(q=>q.tag==='kx_kn_y1'&&q.ask); if(m&&m.ans==null) PHONE.at(G,ny,9,[K('新年快樂。昨天的題目，你可以想一年。')],'kx_kn_noreply'); } } }
    /* 春假三選一的邀約（交接包 v2 C9；草稿第 3 節、BB_96 9-5）：第 5 週週二 21:00 以安在麵店團群組、週三 21:30 可昕（交往中）。收到以後的選擇在 S.springPrompt（S.tick）。
       4/2 過了還沒選＝留在宿舍（不傳可昕的回覆：玩家沒有回她）*/
    { const D=S.springDays(); if(D.inv1&&G.day>=D.inv1-1&&G.day<=D.d0+3){
        if(PHONE.inGroup(G,'noodle_team')&&!PHONE.sent(G,'an_spring_y1')&&G.day<=D.dl) PHONE.at(G,D.inv1,21,[{th:'g:noodle_team',from:'heroine_01',text:'春假要不要一起出去？我做行程表。'}],'an_spring_y1');
        if(F.dating_kexin&&!PHONE.sent(G,'kx_spring_y1')&&G.day<=D.dl) PHONE.at(G,D.inv2,21.5,[{th:'p:kexin',from:'kexin',text:'春假我們開車去哪裡？'},{th:'p:kexin',from:'kexin',text:'我做了行程表。第二頁是假設題，第三頁才是行程。'}],'kx_spring_y1');
        if(G.day>D.dl&&F.SPRING_Y1==null&&(PHONE.sent(G,'an_spring_y1')||PHONE.sent(G,'kx_spring_y1'))) S.springChoose(GM,'dorm',{silent:true}); } }
    /* 重訪日 1（交接包 v2 C20；BB_96 9-10）：大一最後一天中午，交往中的玩家可昕傳「最後一天。你說的那張桌子，我六點到。」；收到以後目標改成 18:00 兩點半 Café */
    { const rd=S.revisitDay(); if(rd&&G.day===rd&&F.dating_kexin&&!F.REVISIT_Y1){
        if(!PHONE.sent(G,'kx_revisit1')&&G.hour<18) PHONE.at(G,rd,Math.max(12,G.hour),[{th:'p:kexin',from:'kexin',text:'最後一天。你說的那張桌子，我六點到。'}],'kx_revisit1');
        if(!F.revisitGoalY1&&G.hour>=12&&G.hour<22&&(G.msgs||[]).some(m=>m.tag==='kx_revisit1')){ F.revisitGoalY1=true; GM.setGoal('18:00 兩點半 Café（可昕）'); } }
      /* 沒有和可昕交往（AA 50da3a9）：在麵店團＝17:00 阿哲在群組揪併桌；不在麵店團＝最親近的人（STORY.revisitClosest）。女生 18:00 傳訊息（BB_96 第 11 節）。
         目標的字是 LAWWW 加的（不在麵店團的玩家沒有人揪，用目標提醒傍晚去兩點半）*/
      if(rd&&G.day===rd&&!F.dating_kexin&&!F.REVISIT_Y1){ const grp=PHONE.inGroup(G,'noodle_team');
        if(grp&&!PHONE.sent(G,'zhe_revisit1')&&G.hour<18) PHONE.at(G,rd,Math.max(17,G.hour),[{th:'g:noodle_team',from:'zhe',text:'學期最後一天。兩點半，六點，併桌。'}],'zhe_revisit1');
        if(!F.revisitGoalY1&&G.hour>=12&&G.hour<22){ F.revisitGoalY1=true; GM.setGoal(grp?'18:00 兩點半 Café（麵店團併桌）':'18:00 兩點半 Café（學期最後一天）'); }
        if(!grp&&!PHONE.sent(G,'revisit1_msg')&&G.hour>=17.5){ const c=S.revisitClosest(G), L=c.kind==='female'?REVISIT_MSG[c.id](G):null; if(L) PHONE.at(G,rd,Math.max(18,G.hour),L.map((t,k)=>({th:'p:'+c.id,from:c.id,text:t})),'revisit1_msg'); } } }
    dailyPhone(GM); };
  /* 重訪日 1 的日子（交接包 v2 C20：第 18 週最後一天＝大一學年最後一天）*/
  S.revisitDay=function(){ return termDay('Y1S2',18,7); };
  /* 重訪日 1：單身、不在麵店團的玩家，這一年最親近的人（AA 50da3a9、d1fa44f；BB_96 第 11 節）：先看階段、再看熟悉；至少「有點熟」。
     學姊、沛珊這時有伴侶，不算（不傳只給一個人的閒聊私訊）；可昕另外處理。以安、語彤、小語、芯慈、阿哲（AA 的人物）還沒有台詞，暫時不列（已問 AA）。
     回傳 {id, kind:'male'|'female'|'none'} */
  const REVISIT_MALE=['classmate_bohan','kai','classmate_mingxuan','npc_fangyt','zhe'], REVISIT_FEMALE=['heroine_02','heroine_04','heroine_01','heroine_03','yu','classmate_xinci'];   /* 阿哲、以安、語彤、小語、芯慈：AA 2100018（交接包 v2 草稿第 3 節）*/
  S.revisitClosest=function(G){ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES) return {id:null,kind:'none'}; const st=id=>SOCIAL.STAGES.indexOf(SOCIAL.stage(id)), min=SOCIAL.STAGES.indexOf('FAMILIAR');
    let best=null; for(const id of REVISIT_MALE.concat(REVISIT_FEMALE)){ if(!S.knows(id,G)) continue; if(REVISIT_FEMALE.includes(id)&&typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,id)) continue;   /* 女生是傳訊息：要有她的聯絡方式 */ const s=st(id); if(s<min) continue; const f=(SOCIAL.rel(id)||{}).fam||0;
      if(!best||s>best.s||(s===best.s&&f>best.f)) best={id,s,f}; }
    return best?{id:best.id,kind:REVISIT_MALE.includes(best.id)?'male':'female'}:{id:null,kind:'none'}; };
  /* 女生的訊息（BB_96 11-2；芷若「我媽」那則不提她喝什麼，也不提交換）*/
  /* W3b 的三篇文章（BB_96 2-4，BB 137bf31；作者寫「校刊投書」、沒有真名）。cx＝玩家的三個反例（極端／實務／換角度），都打第二點；long＝她的長回覆（折起來）*/
  const W3B_OPEN={no:'這篇作者沒跳步。你找找看他哪裡偷懶。',diff:'這篇的結論你大概會同意。我想聽你的理由。',unsure:'這篇比上次短。第二節我先畫了線。'};
  const W3B_RESP=['太極端了，制度不是為極端設計的。','實務上是這樣，但這篇問的是應不應該。','……這個角度我沒想過。但你漏了一步。'];
  const W3B_ART=[
    {title:'總圖應該全面禁止占位',pts:['座位是公共的，占著不用，別人就用不到。','規定要簡單：離開超過三十分鐘就清位，沒有例外。','禁止占位，考試週更多人用得到總圖。'],
     cx:[['有人突然不舒服去保健中心，回來位子就沒了？'],['館員沒有人力每三十分鐘巡一次。'],['三十分鐘，對吃飯的人太短，對午睡的人太長。']],
     long:['第二點的問題不在三十分鐘，在「沒有例外」。','好的規定要先問：它要保護誰。','這篇要保護的是想用位子的人。','可是離開的那個人，也是想用位子的人，只是剛好不在。','所以要分兩種離開：一下子，和不回來。','分不出來的時候，留一個說明的機會，不要讓巡的人自己猜。','你要反駁，就打「沒有例外」這四個字。']},
    {title:'期中考應該全部改成開書考',pts:['背得起來不等於會用。','以後工作都能查資料，開書考比較接近真的工作。','開書考不用作弊，也就沒人作弊。'],
     cx:[['急救的時候，沒有時間查。'],['開書考的題目比較難出，老師改得更久。'],['工作也有不能查的時候，像當面跟人談。']],
     long:['第二點把「真的工作」當成只有一種。','有的時候可以查，有的時候不能查，而且常常是同一份工作。','所以問題不是開書或閉書，是這一科要練哪一種時候。','這篇跳過了一步：先說這一科要練什麼，再選考法。','你的反例，打中的是它跳過的那一步。']},
    {title:'通識課應該取消點名',pts:['大學生是成年人，來不來自己決定。','點名不能證明有學到，所以沒有意義。','老師應該用課吸引人，不是用點名。'],
     cx:[['如果全班都不來呢？'],['分組討論的課，人不在就做不了。'],['點名證明的不是學到，是來了。']],
     long:['第二點偷換了一個詞。','點名本來就不是在證明「學到」，是在證明「來了」。','所以要問的是：這一門課，「來了」本身有沒有意義？','有討論、有分組的課，來了就有意義；只聽講的課，比較沒有。','這篇可以改成：哪些課該點名，哪些不用。這樣第一點和第三點也站得住。']} ];
  const REVISIT_MSG={
    /* AA 的人物（AA 2026-10-14 2100018）。小語和阿哲大二上才在一起，這時候還單身，算數 */
    heroine_01:G=>['這一年最意外的一件事。','我以為規則寫清楚就好。後來發現，規則常常只是沒想到。','（貼圖：兔子「收到」）','……傳錯了。不好意思，打擾了。'],
    heroine_03:G=>['最意外的一件事。','阿姨說，我今年講的話比去年多。','……嗯。'],
    yu:G=>['最意外的？','我跟以安吵了一架，結果變成每週四都要見面。','……讀書會啦。'],
    classmate_xinci:G=>['最意外的一件事：','這學期有一次，我沒有先去看以安的成績。','……就一次。'],
    heroine_02:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','SHARED_SECRET')?['期末辛苦了。','我今年最意外的事：我把交換的申請表印出來了。','還沒交。……可是印出來了。']:['期末辛苦了。','我今年最意外的事：我媽學會用貼圖了。','她傳的第一張，是一隻戴眼鏡的貓。'],
    heroine_04:G=>{ const has=t=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04',t); return has('PLAYTESTED')?['最意外的事：我把還沒做完的東西給人看了。','而且我沒有死掉。']:(has('CONTEST_DAY')?['最意外的事：比賽那天我沒去，天沒有塌。','第四罐的錢我不還。']:['最意外的事：法律系的人，比我想的好玩。','一點點。']); } };
  /* 春假三選一（交接包 v2 C9）的日子：inv1＝第 5 週週二（以安揪）、inv2＝週三（可昕問）、dl＝4/2（最後可以選的一天）、d0＝4/3（春假第一天，出發）*/
  S.springDays=function(){ return {inv1:termDay('Y1S2',5,2), inv2:termDay('Y1S2',5,3), dl:termDay('Y1S2',6,4), d0:termDay('Y1S2',6,5)}; };
  const msgIn=(G,tag)=>(G.msgs||[]).some(m=>m.tag===tag);
  /* 該問了：收到的邀約都到了（麵店團的、交往中可昕的）、還沒選、沒過 4/2、「晚一點再決定」的時間到了 */
  S.springPending=function(G){ const F=G.flags, D=S.springDays(); if(F.SPRING_Y1!=null||!D.inv1||G.day<D.inv1||G.day>D.dl) return false;
    const grp=PHONE.inGroup(G,'noodle_team'), kx=!!F.dating_kexin; if(!grp&&!kx) return false;
    if(grp&&!msgIn(G,'an_spring_y1')) return false; if(kx&&!msgIn(G,'kx_spring_y1')) return false;
    return F.springAskAt==null||G.day*24+G.hour>=F.springAskAt; };
  /* 選擇（介面文字，不是祐廷說的話；AA 確認中）：跟麵店團出去（麵店團才有）／和可昕開車旅行（交往中才有）／留在宿舍／晚一點再決定（隔天同一時間再問）*/
  S.springPrompt=async function(GM){ const G=GM.G, F=G.flags, O=[];
    if(PHONE.inGroup(G,'noodle_team')) O.push({t:'春假：跟麵店團出去',hint:'以安做行程表（4/3～4/4）',k:'noodle'});
    if(F.dating_kexin) O.push({t:'春假：和可昕開車旅行',hint:'4/3，一天來回',k:'kexin'});
    O.push({t:'春假：留在宿舍',k:'dorm'},{t:'晚一點再決定',hint:'明天再問',k:'later'});
    let i=O.length-1; GM.sceneBegin(); try{ i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); } finally { GM.sceneEnd(); }
    const k=(O[i]||O[O.length-1]).k; if(k==='later'){ F.springAskAt=(G.day+1)*24+G.hour; return k; } S.springChoose(GM,k); return k; };
  /* 選了以後：可昕的回覆與照片（BB_96 9-5）、可昕那一趟的出遊、麵店團的照片（沒去的玩家；草稿：以安的行程表第二版、阿哲「下次你要來。」）。
     麵店團那一趟（4/3～4/4）的事件 ev_noodle_trip_spring_y1 等 AA 的旁白，還沒有就先不排。silent：沒選就過了 4/2（可昕不回） */
  S.springChoose=function(GM,k,o){ o=o||{}; const G=GM.G, F=G.flags, D=S.springDays(), kx=!!F.dating_kexin, grp=PHONE.inGroup(G,'noodle_team'); F.SPRING_Y1=k;
    const KX=(day,h,L,tag)=>PHONE.at(G,day,h,L.map(t=>({th:'p:kexin',from:'kexin',text:t})),tag);
    if(k==='kexin'&&typeof OUT!=='undefined') OUT.plan(G,{id:'kx_trip_y1s2',ev:'ev_kexin_trip_spring_y1',day:D.d0,h:8,place:'宿舍門口（她開車來）',title:'春假：開車旅行',travel:'',travelH:0,back:'回到台北。'});
    if(k==='noodle'){ if(kx){ if(!o.silent) KX(G.day,G.hour+0.1,['好。那我們暑假再去，我先選地方。','你們去哪裡，照片要傳給我。'],'kx_spring_reply'); KX(D.d0,21.5,['📷（她和予樂的宵夜）','予樂說她今天代替你。她吃得比你多。'],'kx_spring_photo'); F.KX_TRIP_DEFERRED='summer'; }
      if(typeof OUT!=='undefined'&&typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.some(e=>e.id==='ev_noodle_trip_spring_y1')) OUT.plan(G,{id:'ndl_trip_y1s2',ev:'ev_noodle_trip_spring_y1',day:D.d0,h:8,place:'台北車站',title:'春假・小旅行',travel:'',travelH:0.5,back:'回到台北。'}); }
    if(k==='dorm'&&kx){ if(!o.silent) KX(G.day,G.hour+0.1,['留在宿舍？……好。那暑假我們去遠一點。'],'kx_spring_reply'); KX(D.d0+1,16,['📷（政大山上的階梯）','山上沒有人。階梯只剩我一個人在數。'],'kx_spring_photo'); F.KX_TRIP_DEFERRED='summer'; }
    if(!o.silent){ const me=(th,t)=>({th,from:'player',who:null,text:t}), ng='g:noodle_team';   /* 選完以後祐廷自動傳一句（AA 71186c7）*/
      if(k==='noodle'&&grp) PHONE.at(G,G.day,G.hour+0.05,[me(ng,'我去。'),{th:ng,from:'heroine_01',text:'收到。行程表多一個人。'}],'spring_pick_msg');
      if(k==='kexin'){ PHONE.at(G,G.day,G.hour+0.05,[me('p:kexin','好。我們去。')].concat(grp?[me(ng,'我這次有約了。'),{th:ng,from:'zhe',text:'……喔～'}]:[]),'spring_pick_msg'); }
      if(k==='dorm'&&grp) PHONE.at(G,G.day,G.hour+0.05,[me(ng,'我這次留在宿舍。'),{th:ng,from:'zhe',text:'好啦，照片會傳給你。'}],'spring_pick_msg'); }
    if(k!=='noodle'&&grp){ const th='g:noodle_team'; PHONE.at(G,D.d0,20.5,[{th,from:'heroine_01',text:'📷（行程表第二版）'},{th,from:'heroine_01',text:'理由欄寫『雨』。'},{th,from:'zhe',text:'下次你要來。'}],'ndl_spring_photos'); } };
  /* 大一的春節初一（遊戲第一個「春節」、前一天是「除夕」：2026-02-17）；寒假拜年（C3）用 */
  let lunarNY; S.lunarNewYear=function(){ if(lunarNY!==undefined) return lunarNY; lunarNY=null; if(typeof CALENDAR==='undefined'||!CALENDAR.holiday) return null; for(let d=2;d<500;d++){ if(CALENDAR.holiday(d)==='春節'&&CALENDAR.holiday(d-1)==='除夕'){ lunarNY=d; break; } } return lunarNY; };
  /* 出遊住外面一晚（春假麵店團的兩天一夜，交接包 v2 C9）：日期、星期往後；體力照睡一覺（+65）；天氣晴；不演宿舍的夜晚事件（人不在宿舍）；
     春假沒有課（第 6 週週五～週一），所以不跑早上的課表通知 */
  S.travelOvernight=function(GM,day,hour){ const G=GM.G, F=G.flags, E=GM.E; while(G.day<day){ G.day++; G.weekday=(G.weekday+1)%7; G.energy=Math.min(100,(G.energy||0)+65); }
    G.hour=hour; if(E) E.hour=hour; G.weather='clear'; if(E&&E.setWeather) E.setWeather('clear'); F.companion=null; F.nightKai=false; if(GM.updateHUD) GM.updateHUD(); };
  S.firstColdDay=()=>termDay('Y1S1',15,1);   /* 第一波寒流（AA_71 十二月；阿哲的薑母鴨、AA_12 紙箱旁白也用這一天，之後接）*/
  /* 成績單先等一下（classes3d.js 的 morning 呼叫；回傳 true＝先不發，晚上視訊一起打開）：只有大一上、和可昕約好的玩家問一次 */
  S.holdGrades=async function(GM,termId){ const G=GM.G, F=G.flags;
    if(termId==='Y1S2'){ if(!F.dating_kexin||F.KX_GRADES_Y1S2!=='together'||F.KX_GRADES2_DAY!=null||typeof OUT==='undefined') return false;   /* 大一下 together（AA_157 第 2 節）：暑假第一天早上先問、21:00 視訊；best_one 照常發（晚上的一問一答在 phoneRules）*/
      F.KX_GRADES2_DAY=G.day; GM.sceneBegin(); let k=0; try{ await GM.say(null,'大一下的成績出來了。'); k=await GM.choose([{t:'先看。'},{t:'等到晚上。'}]); } finally { GM.sceneEnd(); }
      if(k===0) F.KX_GRADES2_PEEK=true;
      OUT.plan(G,{id:'kx_grades2',ev:'ev_kexin_grades_open_y1s2',day:G.day,h:21,place:'視訊',title:'可昕的視訊：一起打開成績',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊掛掉了。'});
      return k!==0; }
    if(termId!=='Y1S1'||!F.KX_GRADES_PACT_SET||F.KX_GRADES_PACT||typeof OUT==='undefined') return false;
    F.kxGradesDay=G.day; GM.sceneBegin(); let k=0; try{ await GM.say(null,'大一上的成績出來了。'); k=await GM.choose([{t:'先看。'},{t:'等寒假第一天。'}]); } finally { GM.sceneEnd(); }
    F.KX_GRADES_PACT=k===0?'peeked':'kept';
    OUT.plan(G,{id:'kx_grades',ev:'ev_kexin_grades_open',day:G.day,h:21,place:'視訊',title:'可昕的視訊：一起打開成績',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊掛掉了。'});
    if(k===0) return false;   /* 先看：照常發成績單 */
    return true; };
  /* 每天的手機小事（BB_95 4-4）：摘要日（AA_90 第 10 節「週曆＋精華日」）還沒做，照 BB「沒有摘要日的話放進每天的手機小事」——大一上第 4 週起，一天最多一則；
     那天已經有排好時間的劇情訊息就不加。每天第一次（或讀檔後第一次）決定今天是哪一則：照順序輪流，挑條件成立、時間還沒到的；時間到了再確認一次
     （阿凱：你醒著待在宿舍或便利商店時，不會收到「我已經在便利商店了」——那天就不傳，改天）；睡覺、跳過時間跨過去的照原本的時間補進去。
     每則一次；Kevin 的影片最多四次、照順序、每次更無關，第四次 Kevin 多問一句（BB 2026-10-14）。學姊：讀書會的前一天（週二）17:05 發在讀書會群組（BB 2026-10-14：地點不變，只是提醒）。
     沛珊不用招牌句（「我可以問一個奇怪的問題嗎」留給大二 P5）。方奕廷那則：F1 他說「死掉的話傳照片給我。」——你傳的是新葉的照片（BB 2026-10-14 確認：他說「死掉的話」才傳，結果傳的是活的）*/
  const DAILY_KEVIN=['📹（一隻貓把桌上的筆一支一支推下去）','📹（一隻柯基在海邊追浪，又被浪追回來）','📹（Kevin 自己煎荷包蛋，蛋黃破了。「第三次了」）','📹（高速公路塞車的空拍，配樂很激昂）'];
  const actOn=(id,day)=>{ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list) return false; const a=ACTIVITIES.list.find(x=>x.id===id); return !!a&&ACTIVITIES.on(a,day); };
  const gotBefore=(G,id)=>!!(G.contacts&&G.contacts[id]!=null&&G.contacts[id]<G.day);   /* 前一天以前就有聯絡方式（不和第一則訊息同一天）*/
  const fl=id=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'STRANGER';
  const dpSent=(G,id)=>!!(G.flags.dpN&&G.flags.dpN[id]);
  const fyEarly=G=>gotBefore(G,'npc_fangyt')&&['STRANGER','ACQUAINTANCE'].includes(fl('npc_fangyt'));   /* 方奕廷「有點熟」以前還說「學弟好」（BB_120 1-7）*/
  const P1=(id,t,dt)=>({th:'p:'+id,from:id,text:t,dt:dt||0}), seq=(id,L,th)=>L.map((t,k)=>Object.assign(P1(id,t,k/60),th?{th}:{}));
  const DAILY=[
    {id:'kevin_video',max:()=>DAILY_KEVIN.length,h:()=>21.3,ok:G=>PHONE.inGroup(G,'family_law'),
      items:(G,n)=>{ const K=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), W=(t,dt)=>({th:'g:family_law',from:'heroine_05',name:'溫學姊',text:t,dt:dt||0});
        return [K(DAILY_KEVIN[n]),W('收到。')].concat(n===3?[Object.assign(K('學姊妳到底有沒有看'),{dt:2/60}),W('有。三分十二秒。',3/60)]:[]); }},
    {id:'sis_study_eve',h:()=>17+5/60,ok:(G,day)=>PHONE.inGroup(G,'lawclub_study')&&CALENDAR.dateOf(day).wd===2&&actOn('lawclub_study',day+1),
      items:()=>[{th:'g:lawclub_study',from:'heroine_05',name:'溫學姊',text:'明天讀書會。三件事。一，研討室 A。二，研討室 A。三，上次走錯的那位，也是研討室 A。'}]},
    {id:'ziqing_five',h:()=>17.5,ok:(G,day)=>PHONE.inGroup(G,'guitar')&&actOn('club_guitar',day),
      items:()=>['今天','社課','C 和弦','不會的不能走','這不是問句'].map(t=>({th:'g:guitar',from:'heroine_04',text:t}))},
    {id:'ziqing_black',h:()=>15.6,ok:G=>PHONE.inGroup(G,'guitar')&&!!G.flags.ZIQING_MAKING_SOMETHING,
      items:()=>[{th:'g:guitar',from:'heroine_04',text:'📷（截圖：畫面全黑，角落只有一個小小的插座）'},{th:'g:guitar',from:'heroine_04',text:'不要問。'}]},
    {id:'zhiruo_latte',h:G=>G.flags.dating_kexin?15+10/60:22+7/60,ok:G=>gotBefore(G,'heroine_02'),
      items:()=>[{th:'p:heroine_02',from:'heroine_02',text:'今天有個客人點「跟昨天一樣」。我不知道他昨天是誰。我做了拿鐵。他說對。'}]},
    {id:'kai_snack',h:()=>22.7,ok:()=>typeof SOCIAL==='undefined'||!SOCIAL.friendLevel||['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('kai')),live:G=>G.zone!=='dorm'&&G.zone!=='cvs',   /* BB_120 1-5「固定的改變」：有點熟以後，半夜的「宵夜？」才有你的份 */
      items:()=>['宵夜？','我餓了','我已經在便利商店了','你要什麼'].map((t,k)=>({th:'p:kai',from:'kai',text:t,dt:k/60}))},
    {id:'fangyt_leaf',h:()=>20,ok:(G,day)=>!!G.flags.POTHOS&&G.flags.pothosWaterWk===weekNo(day)&&gotBefore(G,'npc_fangyt'),
      items:()=>[{th:'p:npc_fangyt',from:'player',who:null,text:'📷（黃金葛長出一片新葉）'},{th:'p:npc_fangyt',from:'npc_fangyt',text:'新葉。你的。'}]},
    {id:'mingxuan_bento',h:()=>12.1,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('classmate_mingxuan','SAW_HIM_STUDY')&&gotBefore(G,'classmate_mingxuan'),
      items:()=>[{th:'p:classmate_mingxuan',from:'classmate_mingxuan',text:'公館新開一家便當店，八十。已加進清單。你什麼都沒看到。'}]},
    {id:'peishan_handout',h:()=>21.6,ok:G=>PHONE.inGroup(G,'lawclub_study'),
      items:()=>[{th:'g:lawclub_study',from:'classmate_peishan',text:'📷（講義的照片，邊角畫了一個問號）'}]},
    /* BB_120 1-7c「固定的改變」（BB 2026-10-14，第②級）：照熟度傳的訊息，只在那個階段（過了就不補）。子晴「認識」只有事情、發在吉他社群組（還沒有私訊）；
       「有點熟」一句拆五則；「朋友」測試版先私訊給你（22:10），同一晚 22:40 群組才出現；「好朋友」真的問問題（第二組在期末考那兩週）*/
    {id:'zq_a1',h:()=>21,ok:(G,day)=>fl('heroine_04')==='ACQUAINTANCE'&&PHONE.inGroup(G,'guitar')&&actOn('club_guitar',day+1),
      items:()=>[{th:'g:guitar',from:'heroine_04',text:'明天社課 19:00。萬才館一樓。帶琴。'}]},
    {id:'zq_a2',h:()=>22+10/60,ok:G=>fl('heroine_04')==='ACQUAINTANCE'&&PHONE.inGroup(G,'guitar'),
      items:()=>seq('heroine_04',['📎 cat_v0.3','測試版。'],'g:guitar')},
    {id:'zq_f1',h:()=>21.5,ok:G=>fl('heroine_04')==='FAMILIAR'&&gotBefore(G,'heroine_04'),
      items:()=>['欸不是','滷味','十點後','半價','你要來'].map(t=>P1('heroine_04',t))},
    {id:'zq_f2',h:()=>23,ok:G=>fl('heroine_04')==='FAMILIAR'&&gotBefore(G,'heroine_04'),
      items:()=>['欸不是','我的貓','卡在牆裡','出不來','不用回'].map(t=>P1('heroine_04',t))},
    {id:'zq_r1',h:()=>22+10/60,ok:G=>fl('heroine_04')==='FRIEND'&&gotBefore(G,'heroine_04'),
      items:G=>seq('heroine_04',['📎 cat_v0.9','這版貓會爬樓梯。']).concat(PHONE.inGroup(G,'guitar')?[{th:'g:guitar',from:'heroine_04',text:'新版本。測試的人報名。',dt:0.5}]:[])},
    {id:'zq_c1',h:()=>19+40/60,ok:G=>fl('heroine_04')==='CLOSE_FRIEND'&&gotBefore(G,'heroine_04'),
      items:()=>seq('heroine_04',['你今天吃飯了嗎。','這是問句。'])},
    {id:'zq_c2',h:()=>22.5,ok:(G,day)=>fl('heroine_04')==='CLOSE_FRIEND'&&gotBefore(G,'heroine_04')&&(CALENDAR.termOf(day)||{}).exam==='final',
      items:()=>seq('heroine_04',['期末考還好嗎。','這是問句。','……不用回很長。'])},
    /* 沛珊：問題換人問——「認識」在讀書會群組問所有人（23:10）、「有點熟」私訊書頁照片（23:20、23:21）、「朋友」長訊息最後問你（上課日）、「好朋友」不問、等你問（23:05、23:06）*/
    {id:'ps_a',h:()=>23+10/60,ok:G=>fl('classmate_peishan')==='ACQUAINTANCE'&&PHONE.inGroup(G,'lawclub_study'),
      items:()=>seq('classmate_peishan',['睡前想到一個問題：一條規定沒有人知道，它還算規定嗎？','大家明天可以回答。'],'g:lawclub_study')},
    {id:'ps_f',h:()=>23+20/60,ok:G=>fl('classmate_peishan')==='FAMILIAR'&&gotBefore(G,'classmate_peishan'),
      items:()=>seq('classmate_peishan',['📷（一頁書，劃了一行線）','這行讓我想到讀書會那題。你不用回。'])},
    {id:'ps_r',h:()=>23,ok:(G,day)=>fl('classmate_peishan')==='FRIEND'&&gotBefore(G,'classmate_peishan')&&CALENDAR.dateOf(day).wd<=5&&!CALENDAR.holiday(day),
      items:()=>seq('classmate_peishan',['今天老師說，法律是最低限度的道德。','我抄下來了。可是回家的路上一直在想：','那最高限度的，是誰在管？','……你覺得呢？'])},
    {id:'ps_c',h:()=>23+5/60,ok:G=>fl('classmate_peishan')==='CLOSE_FRIEND'&&gotBefore(G,'classmate_peishan'),
      items:()=>seq('classmate_peishan',['今天我沒有問題。','你有的話，我在。'])},
    /* 方奕廷「有點熟」以前（「學弟好」開頭、學名、一段說明、最後一句很短的真話）：九、十月台灣欒樹；十月以後黃金葛的葉子（欒樹那則先）；寒流前那則是定時的（phoneRules：第一波寒流前一晚）*/
    {id:'fy_tree',h:()=>20.5,ok:(G,day)=>fyEarly(G)&&[9,10].includes(CALENDAR.dateOf(day).m),
      items:()=>seq('npc_fangyt',['學弟好。舟山路的台灣欒樹開花了。','📷 Koelreuteria elegans。秋天先開黃花，再結粉紅色的果。','很漂亮。'])},
    {id:'fy_pothos',h:()=>20.5,ok:(G,day)=>{ const m=CALENDAR.dateOf(day).m; return fyEarly(G)&&!!G.flags.POTHOS&&m!==9&&(m!==10||dpSent(G,'fy_tree')); },
      items:()=>seq('npc_fangyt',['學弟好。你的黃金葛葉子，最近有沒有變黃？','變黃通常是水太多。不是你的錯，是它比較挑。','拍給我看。'])},
    /* 大一下的手機小事（BB_96 第 5 節；交接包 v2）：只在大一下（term）。學姊的畢業照那則在 C17（固定日子）；子晴成發倒數那則在 Q5（固定日子）。
       芷若「熱可可加濃縮」要 Z3（ASKED_HER_DRINK，還沒做）、明軒那則要家教打工（JOB_TUTOR，還沒做）——條件成立以後自然會出現 */
    {id:'sis_case_y1s2',term:t=>t.id==='Y1S2',h:()=>12+10/60,ok:G=>PHONE.inGroup(G,'family_law')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_THREE_THINGS'),
      items:()=>[{th:'g:family_law',from:'heroine_05',name:'溫學姊',text:'今天讀到一個判決。三件事。一，很長。二，很好。三，學弟妹一定會反對。下次聚餐給你們看。'}]},
    {id:'zr_cocoa_y1s2',term:t=>t.id==='Y1S2',h:G=>G.flags.dating_kexin?15+10/60:22+7/60,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','ASKED_HER_DRINK')&&gotBefore(G,'heroine_02'),
      items:G=>[P1('heroine_02',G.flags.dating_kexin?'今天有人點熱可可加濃縮。我以為只有我會喝這個。':'今天有人點熱可可加濃縮。不是你。我差點以為是你。')]},
    {id:'zr_art_y1s2',term:t=>t.id==='Y1S2',h:G=>G.flags.dating_kexin?15+10/60:22+7/60,ok:G=>gotBefore(G,'heroine_02'),
      items:G=>G.flags.dating_kexin?seq('heroine_02',['📷（拉花）','今天的拉花。老闆說及格。']):[P1('heroine_02','📷（拉花）')]},
    {id:'zq_cat03_y1s2',term:t=>t.id==='Y1S2',h:()=>22+10/60,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_04','PLAYTESTED')&&gotBefore(G,'heroine_04'),
      items:G=>[P1('heroine_04','📎 cat_v0.3'),P1('heroine_04',G.flags.FIRST_BUG?'插座修好了':'這版比較不會當機',3/60)]},
    {id:'kai_pothos_y1s2',term:t=>t.id==='Y1S2',h:()=>16.5,ok:G=>!!G.flags.POTHOS,live:G=>G.zone!=='dorm',
      items:()=>seq('kai',['你的黃金葛長新葉了','我幫你澆了','不用謝','我只是順手'])},
    {id:'mx_tutor_y1s2',term:t=>t.id==='Y1S2',h:()=>21.5,ok:G=>!!G.flags.JOB_TUTOR&&gotBefore(G,'classmate_mingxuan'),
      items:()=>[P1('classmate_mingxuan','今天我學生問：『老師，法律系的人吵架都會贏嗎？』我說會。你學生問什麼？')]},
    {id:'ps_teacher_y1s2',term:t=>t.id==='Y1S2',h:()=>19,ok:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('classmate_peishan','SAW_HER_TEACH')&&gotBefore(G,'classmate_peishan'),
      items:()=>seq('classmate_peishan',['📷（課輔班白板上歪歪的「謝謝沛珊老師」）','他們叫我老師。好奇怪。'])},
    {id:'fy_water_y1s2',term:t=>t.id==='Y1S2',h:()=>20.5,ok:G=>!!G.flags.POTHOS&&gotBefore(G,'npc_fangyt'),
      items:()=>[P1('npc_fangyt','黃金葛可以剪一段水耕。要不要我教你。三分鐘。')]},
    /* 阿凱的泡麵評鑑表：大一同房時是房間物件（S.roomItemList）；大二起分開住，偶爾傳照片（四次、至少隔四週）*/
    {id:'kai_sheet',term:t=>!/^Y1/.test(t.id),max:()=>4,gap:28,h:()=>21.8,ok:()=>fl('kai')!=='STRANGER',
      items:()=>seq('kai',['表更新了','📷（泡麵評鑑表）'])},
    /* 可昕大一下的手機小事（BB_96 9-8；交往中；每則一次、照週次）。時間 21:10（她傳訊息的時段，技術預設）*/
    ...[['kx2_late',1,2,'開學了。予樂說這學期要每天早到。今天她遲到。'],['kx2_azalea',3,3,'政大也有杜鵑花。可是開在山上，要爬上去才看得到。'],['kx2_steps',3,5,'我數過了，一百二十七階。四年後我會比你強壯。'],
        ['kx2_yule_hand',4,7,'予樂今天在課堂上舉手，問老師能不能下課。老師說可以。'],['kx2_apology',10,14,'你們老師對強制道歉怎麼講？我們老師講了兩節。'],['kx2_dumpling',12,18,'今天的酸辣湯餃，老闆多給一顆。他一定覺得我很可憐。']]
      .map(([id,w0,w1,t])=>({id,term:T=>T.id==='Y1S2'&&T.week>=w0&&T.week<=w1,h:()=>21+10/60,ok:G=>!!G.flags.dating_kexin,items:()=>[P1('kexin',t)]})),
    {id:'kx2_example',term:T=>T.id==='Y1S2'&&T.week>=10,h:()=>21+10/60,ok:G=>!!G.flags.dating_kexin&&!!(G.flags.KX_DIR&&G.flags.KX_DIR.Y1),   /* K6b 之後 */
      items:()=>[P1('kexin','民總期中考，我的答案被老師拿去當範例。匿名的，可是我認得自己的字。')]},
    {id:'kx2_coffee',term:T=>T.id==='Y1S2'&&T.week>=15&&T.week<=16,h:()=>21+10/60,ok:G=>!!G.flags.dating_kexin,items:()=>seq('kexin',['📷（書桌，旁邊一杯咖啡）','期末的第一杯。'])} ];
  S.DAILY_PHONE=DAILY;
  /* ok(G, day)：那一天條件成立嗎（決定時是今天、補送時是原本那天）。存檔：dpDay（決定過的那天）、dpPick（{id, day}：今天那一則）、dpN（每則出現過幾次）、dpLast（上一次輪到哪一則，輪流用）、dpDayOf（每則上一次是哪一天）；舊存檔沒有＝從頭開始 */
  function dailyPhone(GM){ const G=GM.G, F=G.flags; if(typeof CALENDAR==='undefined') return; const N=()=>F.dpN||(F.dpN={});
    const p=F.dpPick; if(p){ const d=DAILY.find(x=>x.id===p.id); if(!d) F.dpPick=null; else { const h0=d.h(G), t=p.day*24+h0, now=G.day*24+G.hour;
        if(now>=t){ F.dpPick=null; const late=now-t>0.25; if(d.ok(G,p.day)&&(late||!d.live||d.live(G))){ const n=N()[d.id]|0; N()[d.id]=n+1; F.dpLast=d.id; (F.dpDayOf||(F.dpDayOf={}))[d.id]=p.day; const h1=late?h0:G.hour;
            d.items(G,n).forEach((it,k)=>{ const x=Object.assign({},it), dt=x.dt||0; delete x.dt; PHONE.at(G,late?p.day:G.day,h1+dt,[x],'dp_'+d.id+'_'+n+'_'+k); }); }
          else F.dpLast=d.id; } } }   /* 那天不傳（例：阿凱那則你醒著待在宿舍）：輪到下一則，改天再輪回來——不然每天都挑到它，別人的小事永遠輪不到 */
    if(F.dpDay===G.day) return; F.dpDay=G.day; const t=CALENDAR.termOf(G.day); if(!t||t.week<4||F.dpPick) return;   /* 每學期第 4 週起；條目沒寫 term 的只在大一上（BB_95 4-4），寫了的照它自己的（阿凱大二起的評鑑表照片）*/
    if(PHONE.rec(G).q.some(q=>q.day===G.day&&!(q.tag&&q.tag.startsWith('rt_')))) return;   /* 今天已經有排好的劇情訊息（rt_ 例行訊息不算）*/
    const i0=DAILY.findIndex(d=>d.id===F.dpLast)+1;
    const last=F.dpDayOf||{};
    for(let k=0;k<DAILY.length;k++){ const d=DAILY[(i0+k)%DAILY.length]; if(!(d.term?d.term(t):t.id==='Y1S1')||(N()[d.id]|0)>=(d.max?d.max():1)||(last[d.id]!=null&&G.day-last[d.id]<(d.gap||7))||d.h(G)<=G.hour+0.1||!d.ok(G,G.day)) continue; F.dpPick={id:d.id,day:G.day}; break; } }   /* 會出現好幾次的（Kevin 的影片）：同一則至少隔 7 天（gap：阿凱的照片隔 28 天）*/
  /* 宿舍房間的物件（交接包 v1 第 1 節「房間物件」，AA_12 0-2、0-3）：點了看一句旁白。可昕的物件分開以後的旁白，之後由 AA 補（大一上不會分開）*/
  const ROOM_ITEMS=[['書架上的舊《民法》','以前翻過。看得到字，看不懂意思。'],['經濟學原理（一年前的課本）','經濟系那一年的課本。邊角都翻軟了。'],['寫滿的筆記本','重考那段時間的筆記。一半是你的字，一半是她的。'],['摩天輪的票根（夾在桌墊下）','摩天輪的票根。兩個人開始交往的那一天。'],['手機相簿的一張照片','河堤邊停著幾台腳踏車。那一群人，那一年。']];
  S.ROOM_ITEMS=ROOM_ITEMS;
  /* 跟著劇情多出來的東西（放在固定的那幾樣後面）：明軒送的三色螢光筆（聖誕交換禮物 XMAS_HL3；BB_95 3-6b，BB 2026-10-14 寫的旁白）*/
  /* 阿凱的泡麵評鑑表（BB_120 1-7c）：大一同房時，他書桌上方牆上貼的一張紙；口味用通稱。朋友的門檻台詞（F-K2「泡麵第一名是這個 你可以知道了」）那天起第一名填上了，
     多一欄你的名字（他替你填的分數，BB 沒有寫分數：只描述、不編數字）*/
  const KAI_SHEET='「紅燒牛肉 8.5」「蔥燒排骨 8」「麻辣 7.5（太辣扣分）」「海鮮 6（有一隻蝦）」';
  S.kaiRoommate=function(G){ if(typeof CALENDAR==='undefined'||!CALENDAR.TERMS) return true; const T=CALENDAR.TERMS.find(t=>t.id==='Y2S1'); return !T||CALENDAR.tOf(G.day)<T.t0; };   /* 大一同房（大二上開學以前）*/
  S.kaiSheet=function(G){ const up=((G&&G.social&&G.social.relUp)||{}).kai|0;
    return up>=3?['「第一名：沙茶 9.5」'+KAI_SHEET,'（多了一欄「{name}」，裡面是他替你填的分數。最下面一行：「不準的話自己改」）']:['「第一名：不能說（怕被搶）」'+KAI_SHEET]; };
  S.roomItemList=function(G){ const F=(G&&G.flags)||{}, L=ROOM_ITEMS.slice();
    if(F.XMAS_HL3) L.push(['桌上的三色螢光筆',F.GREEN_HIGHLIGHTER?'明軒送的三色螢光筆，和上次那支綠的放在一起。他說他用不到。':'明軒送的三色螢光筆。他說他用不到。']);
    if(G&&S.kaiRoommate(G)) L.push(['阿凱的泡麵評鑑表',S.kaiSheet(G)]);
    { const T=F.KX_TRIP&&F.KX_TRIP.Y1S2, txt={sea:'海邊。她拎著鞋子站在浪裡，褲管濕到膝蓋。',oldtown:'老街。牆上貼滿發黃的老照片，她站在中間，手上拿著第三家的點心。',stars:'山上。照片幾乎全黑，右上角有一個小白點。她說那是星星。你覺得是路燈。'}[T]; if(txt) L.push(['旅行的照片',txt]); }   /* 可昕 K8 春假旅行（BB_96 9-5，BB 14265eb）*/
    return L; };
  async function roomItems(GM){ GM.sceneBegin(); try{ const L=S.roomItemList(GM.G); for(let n=0;n<12;n++){ const i=await GM.choose([...L.map(r=>({t:r[0]})),{t:'不看了'}]); if(i<0||i>=L.length) break; for(const t of [].concat(L[i][1])) await GM.say(null,t); } } finally { GM.sceneEnd(); } }
  /* 宿舍房間裡跟著劇情出現的東西（交接包 v1 第 4 批，BB_95 3-1、3-2）：黃金葛（POTHOS，方奕廷送的，書桌旁）、阿凱書桌下的鍵盤盒子（KAI_SILENT_KB；看過就收起來）。
     進宿舍、待在宿舍時（S.tick）補上，同一個東西不重複加。3D 模型：黃金葛的小盆栽還沒有——先只有互動點；小道具集中成一批「環境細節」，主要工作穩定後一起做（D70，使用者 2026-10-14：低優先）*/
  S.dormItems=function(GM){ const G=GM.G, F=G.flags, E=GM.E; if(G.zone!=='dorm'||!E||!E.interactables) return; const has=k=>E.interactables.some(it=>it[k]);
    if(F.POTHOS&&!has('pothos')) E.interactables.push({x:0.7,z:-2.3,radius:0.7,label:'黃金葛',pothos:true});
    if(F.KAI_SILENT_KB&&!F.KAI_BOX_SEEN&&!has('kaiBox')) E.interactables.push({x:0.6,z:1.5,radius:0.8,label:'書桌下的盒子',kaiBox:true});
    const FP=F.fyPots; if(FP&&FP.hand!=null&&!FP.done&&!has('fyPots')) E.interactables.push({x:1.0,z:-1.6,radius:0.55,label:'方奕廷的三盆植物',fyPots:true}); };   /* 窗台（書桌上方的窗）前 */
  /* 黃金葛：每週（週一開始）澆一次就夠；沒澆也不會枯，只是不長大（BB_95 3-1；v1 只有一個大小，澆了幾次記在 pothosWaterN，之後長大用）*/
  const weekNo=day=>Math.floor((day+1)/7);   /* 第 6 天＝9/22 週一 */
  S.pothosWeek=weekNo;
  async function pothosScene(GM){ const G=GM.G, F=G.flags; GM.sceneBegin(); try{ const wk=weekNo(G.day);
      if(F.pothosWaterWk===wk){ await GM.say(null,'土還是濕的。這週澆過了。'); return; }
      const i=await GM.choose([{t:'澆水'},{t:'不用了'}]); if(i!==0) return; F.pothosWaterWk=wk; F.pothosWaterN=(F.pothosWaterN|0)+1; await GM.say(null,'你幫黃金葛澆了水。'); } finally { GM.sceneEnd(); } }
  /* 阿凱的鍵盤盒子（BB_95 3-2）：「靜音軸。這個很貴喔。」——阿凱：「……我本來就想換。」記憶 HELPED（為你換鍵盤）。阿凱不在房間時只有前一句，等他在再說 */
  async function kaiBoxScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E; const kai=GM.npc.kai; GM.sceneBegin(); try{ await GM.say(ME(G),'靜音軸。這個很貴喔。'); if(!kai) return;
      await GM.say(kai,'……我本來就想換。'); F.KAI_BOX_SEEN=true; SOCIAL.remember('kai','HELPED','為你換鍵盤'); const k=E.interactables.indexOf(it); if(k>=0) E.interactables.splice(k,1); } finally { GM.sceneEnd(); } }
  /* 方奕廷上山的一週（BB_120 1-7、1-7c，BB 2026-10-14）：好朋友的門檻台詞「我下週上山。我的植物，可以拜託你澆嗎？」之後的下週一起，第一次待在房間（7:00～23:00）時
     他把三盆搬到窗台：「三盆。兩天一次。早上澆，不要澆到葉子。」（房間物件「方奕廷的三盆植物」，可以點「澆水」）；七天裡檢查三次（第 2、4、6 天結束時：
     那兩天裡沒有澆就算忘了一次）；第 8 天（之後第一次待在房間時）他回來：都有澆「三盆都很好。土的濕度剛好。」「……謝謝。下次上山還找你。」，
     忘了一次以上「它們很堅強。」；三盆搬回他的房間、物件拿掉。存檔 F.fyPots＝{ask（門檻台詞那天）, hand（交給你那天）, w:[澆水的日子], done, forgot}；
     門檻台詞那天沒有記錄（SOCIAL relUpDay 以前的存檔）就不演，不知道他是哪一天說的 */
  const monAfter=day=>{ let d=day+1; while(CALENDAR.dateOf(d).wd!==1&&d<day+8) d++; return d; };
  const fyWho=()=>({name:SOCIAL.displayName?SOCIAL.displayName('npc_fangyt'):'方奕廷',charId:'npc_fangyt'});
  S.fyForgot=P=>{ let n=0; for(let k=0;k<3;k++){ const a=P.hand+2*k; if(!(P.w||[]).some(d=>d===a||d===a+1)) n++; } return n; };
  let fyT=0;
  function fyPotsTick(GM,dt){ const G=GM.G, F=G.flags; if(typeof SOCIAL==='undefined'||!G.social||typeof CALENDAR==='undefined') return false; let P=F.fyPots;
    if(!P){ if((((G.social.relUp||{}).npc_fangyt)|0)<4) return false; const d=(G.social.relUpDay||{}).npc_fangyt; P=F.fyPots=d==null?{done:true,old:true}:{ask:d,hand:null,w:[]}; }
    if(P.done) return false; const hr=h(G); if(hr<7||hr>=23){ fyT=0; return false; }
    if(!(P.hand==null?G.day>=monAfter(P.ask):G.day>=P.hand+7)){ fyT=0; return false; }
    fyT+=dt||0; if(fyT<2.5) return false; fyT=0;   /* 進房間 2.5 秒以後（不和進門的事件搶）*/
    (async()=>{ try{ if(P.hand==null) await fyHand(GM); else await fyBack(GM); }catch(e){ console.warn('fyPots',e); } })(); return true; }
  async function fyHand(GM){ const G=GM.G, P=G.flags.fyPots; P.hand=G.day; GM.sceneBegin(); try{ await SOCIAL.playSteps(GM,fyWho(),'npc_fangyt',['（方奕廷把三盆植物搬到你的房間窗台。）','「三盆。兩天一次。早上澆，不要澆到葉子。」']); } finally { GM.sceneEnd(); } S.dormItems(GM); }
  async function fyBack(GM){ const G=GM.G, E=GM.E, P=G.flags.fyPots, n=S.fyForgot(P); P.done=true; P.forgot=n; GM.sceneBegin();
    try{ await SOCIAL.playSteps(GM,fyWho(),'npc_fangyt',(n===0?['「三盆都很好。土的濕度剛好。」','「……謝謝。下次上山還找你。」']:['「它們很堅強。」']).concat(['（三盆搬回他的房間了。）'])); } finally { GM.sceneEnd(); }
    const k=E&&E.interactables?E.interactables.findIndex(it=>it.fyPots):-1; if(k>=0) E.interactables.splice(k,1); }
  async function fyPotsScene(GM){ const G=GM.G, P=G.flags.fyPots; if(!P||P.done||P.hand==null) return; GM.sceneBegin(); try{
      if((P.w||[]).includes(G.day)){ await GM.say(null,'土還是濕的。今天澆過了。'); return; }
      const i=await GM.choose([{t:'澆水'},{t:'不用了'}]); if(i!==0) return; (P.w||(P.w=[])).push(G.day); await GM.say(null,'你幫三盆植物澆了水。'); } finally { GM.sceneEnd(); } }
  S._fy={tick:(GM,dt)=>fyPotsTick(GM,dt),hand:GM=>fyHand(GM),back:GM=>fyBack(GM),scene:GM=>fyPotsScene(GM),monAfter,reset(){ fyT=0; }};   /* 測試用 */
  /* 睡著之後、天亮之前的事件（EVENTS.sleepEvent：trigger 'sleep'，例：阿凱凌晨三點的螢幕）：畫面換成凌晨三點的房間演，演完再暗下來繼續睡 */
  async function nightEvent(GM){ const G=GM.G, E=GM.E; if(typeof EVENTS==='undefined'||!EVENTS.sleepEvent) return false; const ev=EVENTS.sleepEvent(); if(!ev) return false;
    G.hour=Math.max(G.hour,27); E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); await GM.titleCard('03:00','',1400); await GM.fade(false);
    try{ await EVENTS.run(ev); } finally { await GM.fade(true); } return true; }
  S._v1={kexinFirstMsg:(GM,v)=>kexinFirstMsg(GM,v),familyGroupD1:GM=>familyGroupD1(GM),roomItems:GM=>roomItems(GM),phoneScene:(GM,th,l,a)=>phoneScene(GM,th,l,a),talkSis:(GM,n)=>talkSis(GM,n),pothosScene:GM=>pothosScene(GM),kaiBoxScene:(GM,it)=>kaiBoxScene(GM,it),nightEvent:GM=>nightEvent(GM),talkYu:(GM,n)=>talkYu(GM,n)};   /* 測試用 */
  async function deskScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; GM.sceneBegin(); await GM.walkTo(P,it.seat.x,it.seat.z+0.5); GM.sitAt(P,it.seat); E.cam.distTarget=3.2; await GM.sleep(300);
    if(G.day===1&&!F.readCase){ await GM.say(null,'案例影本放在桌上。「'+CASE.title.replace('指定案例：','')+'」。標題底下是兩頁判決節錄。'); const i=await GM.choose([{t:'認真讀完（約 1 小時）',hint:'體力 −10。明天上課可能用得到'},{t:'讀一半就好',hint:'體力 −4'},{t:'不讀了，明天再說'}]); if(i===0){ P.pose='read'; P.idlePose='read'; await GM.fade(true); GM.advance(1.1); GM.energy(-10); await GM.fade(false); F.readCase='full'; GM.addNote(CASE.id,CASE.title,CASE.body); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。網拍頁面算哪一種，有爭論。'); GM.addNote('law_88','民法 §88：意思表示錯誤','表意人若無過失，得撤銷；撤銷後對信賴者負賠償責任（§91）。'); await GM.say(null,'你讀到最後一頁的時候，阿凱的遊戲已經打到第三場。你在頁邊寫下：「標價陳列 vs 價目表寄送——網頁到底像哪一個？」'); GM.memo('熬夜讀完了網拍相機的案例'); }
      else if(i===1){ P.pose='read'; P.idlePose='read'; await GM.fade(true); GM.advance(0.5); GM.energy(-4); await GM.fade(false); F.readCase='half'; GM.addNote(CASE.id,CASE.title,CASE.body); await GM.say(null,'你看完事實部分就停了。賣家說自己少打一個零，想撤銷。至於法院怎麼判——明天再說。'); GM.memo('案例只讀了一半'); }
      else { F.readCase='none'; await GM.say(null,'你把影本推到桌角。反正一班六十幾個人，不會那麼剛好。'); GM.memo('沒有讀案例'); }
      GM.setGoal('睡覺（明天 13:20 民法總則）'); }
    else { const opts=[{t:'讀書（1 小時）',hint:'體力 −8'},{t:'整理今天的筆記（30 分鐘）',hint:'體力 −3'},{t:'起身'}]; const i=await GM.choose(opts); if(i===0){ P.pose='read'; P.idlePose='read'; await GM.studySession(); } else if(i===1){ P.pose='read'; await GM.fade(true); GM.advance(0.5); GM.energy(-3); await GM.fade(false); await GM.say(null,'你把筆記重看一遍。有些地方當時覺得懂，現在看又不太確定。'); } }
    GM.standUp(P); GM.sceneEnd(); }
  async function bedScene(GM){ const G=GM.G, F=G.flags; GM.sceneBegin(); if(G.day===1&&!F.readCase){ const i=await GM.choose([{t:'還沒讀案例，先睡了'},{t:'等等，先去看一下'}]); if(i===1){ GM.sceneEnd(); return; } F.readCase='none'; GM.memo('沒有讀案例就睡了'); } const opts=S.bedOptions(G); const i=await GM.choose(opts.map(o=>({t:o.t,hint:o.hint}))); GM.sceneEnd(); const o=opts[i]; if(!o||o.kind==='stay') return; if(o.kind==='sleep') await sleepNow(GM,o.wake,o.alarm); else if(typeof CLS!=='undefined'&&CLS.skipTo) await CLS.skipTo(GM,o.to,{nap:true}); }
  /* 床的選項（2026-10-13 使用者試玩：「睡覺只能隔天醒來？應該要有小睡一下的選項」「早上睡覺醒來變成下午、下午睡覺起來變成晚上」；AA_110 第 6-5 節，AA 暫定）：
     白天（05:00–17:30）小睡 30 分鐘／1 小時／2 小時——預設在下一堂課前 20 分鐘叫醒（鬧鐘）；「睡到傍晚」不設鬧鐘（照手機跳過時間：會錯過課先問一次）。
     晚上（17:30 以後、過午夜）睡到明天：早上（有課就在第一堂前 1 小時，沒課 07:30）、中午、下午、晚上——每個選項寫會錯過什麼（只提醒不阻止，翹課照現有規則）；
     考試、答應了的約（A 類）鬧鐘一定叫醒：考試前 1 小時、約前 30 分鐘。第一、二天照劇情只有「睡覺」。小睡、跳過的時間不產生偶遇、不補觸發事件、不算出席（AA_109 7-1）。 */
  const hm=x=>{ const m=Math.round(x*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  S.wakeAlarms=function(G,day){ const out=[]; if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined') for(const it of CLS.dayItems(G,day)) if(it.exam) out.push({h:it.t0-1,why:it.c.name+'考試'});
    for(const iv of (G.invites||[])) if(iv.day===day&&iv.accepted&&!iv.done&&iv.h!=null) out.push({h:iv.h-0.5,why:'約好的時間'+(iv.label?'：'+iv.label:'')}); return out.sort((a,b)=>a.h-b.h); };
  S.missText=function(G,day,h0,h1){ if(typeof CLS==='undefined'||typeof CALENDAR==='undefined') return ''; const its=CLS.dayItems(G,day).filter(it=>!it.exam&&!CLS.storyClass(Object.assign({},G,{day}),it)&&it.t0+0.5>h0&&it.t0+0.5<=h1&&!(CLS.rec(G).done[it.key]));
    return its.length?'會錯過：'+its.map(it=>hm(it.t0)+' '+it.c.name).join('、'):''; };
  /* 小睡的長度（30 分鐘、1 小時、2 小時；maxH 以內——圖書館、自習區的桌上趴著睡最多 1 小時）：預設在下一堂課前 20 分鐘叫醒 */
  S.napOptions=function(G,maxH){ const out=[], hh=h(G); if(G.day<3||G.hour>=24) return out; const nx=typeof CLS!=='undefined'&&CLS.next?CLS.next(G):null, alarm=nx&&nx.t0-1/3>hh+0.05?nx.t0-1/3:null;
    for(const [d,lab] of [[0.5,'小睡 30 分鐘'],[1,'小睡 1 小時'],[2,'小睡 2 小時']]){ if(d>maxH+1e-6) continue; let to=hh+d, hint='睡到 '+hm(to); if(alarm!=null&&alarm<to){ to=alarm; hint='下一堂 '+hm(nx.t0)+' '+nx.c.name+'前 20 分鐘叫醒你（'+hm(to)+'）'; }
      if(to>hh+0.05&&to<24&&!out.some(o=>Math.abs(o.to-to)<0.02)) out.push({kind:'nap',to,t:lab,hint}); } return out; };
  S.bedOptions=function(G){ const out=[]; const hh=h(G), late=G.hour>=24, night=late||hh>=17.5||hh<5;
    if(G.day<3){ out.push({kind:'sleep',t:'睡覺',hint:'明天早上醒來'}); out.push({kind:'stay',t:'再撐一下'}); return out; }
    if(!night){ out.push(...S.napOptions(G,2));
      if(hh<17.5){ const ms=S.missText(G,G.day,hh,18); out.push({kind:'nap',to:18,t:'睡到傍晚（不設鬧鐘）',hint:'睡到 18:00'+(ms?'。'+ms:'')}); } }
    else { const day=G.day+1, its=typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'?CLS.dayItems(G,day).filter(it=>!CLS.storyClass(Object.assign({},G,{day}),it)):[], first=its.length?its[0]:null, A=S.wakeAlarms(G,day);
      const morning=first?Math.max(6.5,first.t0-1):7.5;
      for(const [k,lab,w0,why] of [['morning','睡到明天早上',morning,first?(first.exam?'考試 ':'第一堂 ')+hm(first.t0)+' '+first.c.name+'前一小時':'明天沒有課'],['noon','睡到明天中午',12,''],['afternoon','睡到明天下午',14,''],['evening','睡到明天晚上',18,'']]){
        if(k!=='morning'&&w0<=morning+0.05) continue; let w=w0, hint=hm(w)+(why?'（'+why+'）':''); const a=A.find(q=>q.h<w);
        if(a){ w=Math.max(6.5,a.h); hint=hm(w0)+'——但'+a.why+'，鬧鐘 '+hm(w)+' 會叫醒你'; } else { const ms=S.missText(G,day,0,w); if(ms) hint+='。'+ms; }
        if(!out.some(o=>Math.abs(o.wake-w)<0.02)) out.push({kind:'sleep',wake:w,alarm:a?a.why:null,t:lab+(k==='morning'?'（'+hm(w)+'）':''),hint}); } }
    out.push({kind:'stay',t:'再撐一下'}); return out; };
  /* 生活費（D48；企劃 AA_72 5b-1：每月 30,000 元，只用在生活——宿舍、學費、手機家裡另外付；每月 1 日匯進帳戶；額外收入只有過年紅包和可選的打工）。
     遊戲畫面沒有日期：第一天是「開學第三週的週三」＝9/17（9/1 週一開學；AA 2026-10-11 09:28Z 確認），只用來算「每月 1 日」；企劃的週曆改了就改 CAL0。
     開局：帳戶約 20,000＋錢包約 2,000（game3d.js defaults 的 money 22000；S.newGame 設 fundsV2）。舊存檔（沒有 fundsV2）：下一個早上補帳戶裡的 20,000 元一次——
     讀檔本身不改錢（tests/save_compat_v7.py 檢查讀檔前後金錢一樣）。睡覺一次只過一天，所以「換月份的第一個早上」就是 1 日。測試：node tests/allowance_unit.js */
  const CAL0={m:9,d:17}, MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
  S.dateOf=function(day){ let m=CAL0.m, d=CAL0.d+(day-1); while(d>MDAYS[m-1]){ d-=MDAYS[m-1]; m=m%12+1; } return {m,d}; };
  S.monthlyFunds=function(G){ const F=G.flags, mo=S.dateOf(G.day).m; if(F.fundsV2!==1){ F.fundsV2=1; F.allowanceMonth=mo; return {amount:20000,text:'帳戶裡還有這個月的生活費：20,000 元'}; }
    if(F.allowanceMonth!==mo){ F.allowanceMonth=mo; return {amount:30000,text:'家裡匯來這個月的生活費：30,000 元'}; } return null; };
  S.sleepNow=(GM,wake,alarm)=>sleepNow(GM,wake,alarm);   /* 測試用（tests/bed_nap_unit.js）*/
  async function sleepNow(GM,wake,alarm){ const G=GM.G, F=G.flags, E=GM.E; GM.sceneBegin(); await GM.fade(true); await GM.sleep(400); if(G.day>=3){ try{ await nightEvent(GM); }catch(e){ console.warn('nightEvent',e); } }   /* 睡著之後、天亮之前（trigger 'sleep'）*/ G.day++; G.weekday=(G.weekday+1)%7; G.energy=Math.min(100,G.energy+65); if(F.morningEnergyAdj){ G.energy=Math.max(0,Math.min(100,G.energy+(+F.morningEnergyAdj))); F.morningEnergyAdj=0; }   /* 前一晚打電動到兩點（阿凱 K-D2）：隔天早上精力 −10 */ G.weather=(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day))?'rain':(Math.random()<0.7?'clear':(Math.random()<0.7?'cloudy':'rain'));   /* 颱風假整天下雨（calendar.js 的 TYPHOON）*/ E.setWeather(G.weather); F.companion=null; F.nightKai=false;
    if(G.day===2){ G.hour=13.05; E.hour=G.hour; GM.sceneEnd(); await GM.titleCard('第二天','週四 13:05 · 霖澤館前',2400); await GM.enter('campus',{x:26,z:-90,yaw:Math.PI}); return; }
    G.hour=wake!=null&&G.day>=3?wake:7.5; E.hour=G.hour; F.morningLine=false;   /* 醒來的時間（AA_110 6-5）：沒給＝07:30（舊行為）*/ if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined') CLS.setGoal(GM); else GM.setGoal(isThu(G)?'13:20 民法總則（霖澤館）':'自由的一天。去圖書館、公館，或找人聊天'); GM.sceneEnd(); await GM.titleCard('第 '+G.day+' 天',['週日','週一','週二','週三','週四','週五','週六'][G.weekday]+' '+hm(G.hour)+(alarm?'・鬧鐘：'+alarm:''),2200); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); { const f=S.monthlyFunds(G); if(f){ GM.money(f.amount); GM.toast(f.text,3800); } }   /* 生活費（D48）：S.monthlyFunds */ if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ await CLS.morning(GM); }catch(e){ console.warn('CLS.morning',e); } } if(!F.KX_FIRST_MSG&&F.dating_kexin){ GM.sceneBegin(); try{ await GM.say(null,'經濟系的那一年，你不是一個人過的。'); await kexinFirstMsg(GM,'morning'); } finally { GM.sceneEnd(); } }   /* 舊存檔（BB_95 9-0）：已經過了第一天、沒看過可昕的訊息的，下一個早上補一次；只補一次 */ GM.autosave(); }
  // ---------- 第二天：校園早上（其實是中午）----------
  async function campusMorning(GM){ const G=GM.G, F=G.flags, E=GM.E; const zhe=GM.npc.zhe; GM.sceneBegin(); GM.letterbox(true); await GM.sleep(300); if(zhe){ GM.face(zhe,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,zhe.obj); ADV.begin({background:'blur',right:'zhe'}); await GM.say(zhe,'{name}！你走路超慢。周老師那堂我不想坐最前面。',{expr:'smile'}); const i=await GM.choose([{t:'你先進去佔位子啊。'},{t:'昨天的案例你看了嗎？'}]); if(i===1){ if(F.readCase==='full') await GM.say(zhe,'看了一半。你看完了？那等一下被點到你幫我。',{expr:'laugh'}); else await GM.say(zhe,'沒有。我們兩個今天要低調一點。',{expr:'laugh'}); } else { await GM.say(zhe,'好啦好啦。'); } zhe.beh='follow'; zhe.followOff=1.4; GM.rel('zhe',1); } GM.letterbox(false); GM.sceneEnd(); GM.setGoal('進入霖澤館上課（13:20）'); }
  // ---------- 課堂 ----------
  async function classScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const z=E.zone; F.classNow=true; GM.sceneBegin(); GM.letterbox(true); const seat=z.seats.find(s=>s.row===1&&s.col===3); await GM.walkTo(P,seat.x,seat.z+0.6); GM.sitAt(P,seat); const prof=GM.npc.prof, an=GM.npc.an, zhe=GM.npc.zhe; if(zhe){ zhe.beh='idle'; } G.hour=Math.max(G.hour,13.35); E.hour=G.hour; GM.updateHUD(); await GM.sleep(500);
    GM.cine('front',prof.obj,null,{pos:V(0.6,1.5,-1.2),look:V(prof.obj.position.x,1.5,prof.obj.position.z)}); ADV.begin({background:'freeze',right:'prof_zhou'}); await GM.say(prof,'上週的案例。網拍上標價一千元的相機，市價一萬。買家下標付款，賣家說少打一個零，不出貨。'); await GM.say(prof,'買家告他。第一個問題：契約成立了嗎？'); GM.cine('ots',P.obj,prof.obj); await GM.say(prof,'我們先看民法一五四條。標定賣價陳列，視為要約；價目表之寄送，不視為要約。網頁上的商品頁，比較像哪一個？'); await GM.say(null,'教室安靜了兩秒。前排的小安低頭寫字。'); GM.cine('close',prof.obj,P.obj); prof.lookAt=P.obj.position; await GM.say(prof,'……這位同學。'+G.name+'，對吧。你說。'); G.stats.classes++;
    const full=F.readCase==='full', half=F.readCase==='half'; const opts=[]; opts.push({t:'「網頁標價比較像要約之引誘，下標才是要約。賣家沒有承諾，契約還沒成立。」',hint:full?'你昨晚讀到的':'需要讀過案例',dim:!full,key:'good'}); if(half) opts.push({t:'「賣家想主張錯誤撤銷……但這算要約還是引誘，我不太確定。」',hint:'你只讀了一半',key:'half'}); opts.push({t:'「標價就是要約，下標就是承諾，契約成立。」',hint:'直覺回答',key:'bold'}); opts.push({t:'「老師……我還沒看完案例。」',key:'none'}); const i=await GM.choose(opts); const key=opts[i].key;
    if(key==='good'&&!full){ await GM.say(null,'你想這樣說，但腦中一片空白。案例你根本沒讀完。'); F.classAnswer='none'; await GM.say(prof,'沒讀對吧。下次先讀。'); }
    else if(key==='good'){ F.classAnswer='good'; GM.cine('close',P.obj,prof.obj); await GM.say(prof,'嗯。那賣家那邊——他能不能主張錯誤，把這個「要約」撤銷？'); const j=await GM.choose([{t:'「八十八條。表意人無過失才能撤銷，少打一個零算不算過失，是爭點。」'},{t:'「……可以撤銷？」'}]); if(j===0){ await GM.say(prof,'對。而且撤銷之後還有九十一條的信賴利益賠償。很好，坐下。'); GM.addNote('law_91','民法 §91：撤銷後的賠償','表意人撤銷錯誤的意思表示後，對信賴其有效的相對人要負損害賠償。'); F.classAnswerPlus=true; } else { await GM.say(prof,'條文號碼？……八十八。回去把但書看清楚。'); } if(an){ CHAR.setExpr(an.obj,'smile'); an.lookAt=P.obj.position; } await GM.say(null,'前排的小安回頭看了你一眼，很快又轉回去。'); GM.rel('an',3); GM.rel('zhe',2); SOCIAL.remember('heroine_01','CLASS_ANSWER_GOOD','民總：要約之引誘'); SOCIAL.remember('zhe','CLASS_ANSWER_GOOD'); SOCIAL.profEvent('prof_zhou','perf',6,'民總課堂答對'); SOCIAL.profEvent('prof_zhou','part',2); }
    else if(key==='half'){ F.classAnswer='half'; await GM.say(prof,'你抓到爭點了，但停在一半。一五四條後段——「價目表之寄送」。網頁比較像價目表還是陳列？'); await GM.say(null,'你沒有答案。周教授點了另一個人。'); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。'); }
    else if(key==='bold'){ F.classAnswer='bold'; await GM.say(prof,'成立。那你怎麼處理一五四條第一項但書？如果每個標錯價的網頁都成立契約，賣家一夜之間要賠多少？'); await GM.say(null,'你說不出來。有人在後面小聲笑。'); await GM.say(prof,'不是錯，是不完整。坐下。'); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。'); }
    else { F.classAnswer='none'; SOCIAL.remember('heroine_01','CLASS_ANSWER_BAD','民總沒讀案例'); SOCIAL.profEvent('prof_zhou','part',1,'沒讀案例'); await GM.say(prof,'沒讀。……好，下週我還會點你。'); await GM.say(null,'阿哲在旁邊用手肘頂了你一下。'); GM.addNote('law_154','民法 §154：要約與要約之引誘','貨物標定賣價陳列者，視為要約；但價目表之寄送，不視為要約。（上課聽到的）'); }
    prof.lookAt=null; GM.cine('wide',prof.obj,P.obj); ADV.end(); await GM.say(prof,'實務上，法院看的是網頁有沒有「明確、可以直接成立契約」的表示。這個案子的判決在講義第三頁。下週——錯誤與撤銷。'); await GM.fade(true); GM.advance(15.17-G.hour); F.classDone=true; F.classNow=false; GM.energy(-6); GM.memo('上了民法總則：要約之引誘'); // 下課
    GM.removeNPC('prof'); for(const n of E.npcs.slice()){ if(n.isExtra){ E.removeNPC(n); } } await GM.fade(false); GM.standUp(P); if(an){ GM.standUp(an); an.beh='idle'; an.frozen=true; } if(zhe){ GM.standUp(zhe); GM.cine('two',P.obj,zhe.obj); await GM.say(zhe,'我要去打球。晚一點公館吃麵？阿鳳麵店，六點半。',{expr:'smile'}); await GM.say(zhe,'還有——你剛剛那個，'+(F.classAnswer==='good'?'很帥。':'很慘。')); GM.rel('zhe',1); zhe.beh='idle'; F.zheInvite=true; } GM.letterbox(false); GM.sceneEnd(); GM.setGoal('走出霖澤館'); if(an){ an.talk=n=>talkAn(GM,n); } GM.autosave(); }
  // ---------- 下課後：小安追上來 ----------
  async function meetAn(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; GM.sceneBegin(); GM.letterbox(true); E.player.path=null; const px=P.obj.position.x, pz=P.obj.position.z, py=P.obj.position.y; const DR=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}; // 從霖澤館門口跑來（v9.4：霖澤館的大廳入口在穿堂西側）
    const an=GM.spawnNPC('an',AN,DR.x,DR.z,{yaw:0,talk:n=>talkAn(GM,n),talkLabel:'和小安說話'}); an.run=true; GM.caption('小安','{name}！等一下！',2200); GM.cine('sky',P.obj); await GM.sleep(600); GM.face(P,DR.x,DR.z); P.pose='idle'; // 玩家回頭
    const dir=V(px-DR.x,0,pz-DR.z); const len=Math.max(0.01,dir.length()); dir.normalize(); const tx=px-dir.x*1.3, tz=pz-dir.z*1.3; GM.cine('front',P.obj,null,{pos:V(px+dir.x*0.5-dir.z*1.6,py+1.6,pz+dir.z*0.5+dir.x*1.6),look:V((px+DR.x)/2,py+1.4,(pz+DR.z)/2)}); await GM.walkTo(an,tx,tz,{run:true}); an.run=false; an.pose='idle'; GM.face(an,px,pz); await GM.sleep(300); GM.cine('two',P.obj,an.obj); CHAR.setExpr(an.obj,'smile'); ADV.begin({background:'blur',right:'heroine_01'}); SOCIAL.meet('heroine_01','campus');
    await GM.say(an,'呼——你走好快。'); if(F.classAnswer==='absent') await GM.say(an,'你今天沒來？周老師點了你的名字，全班都在找你。……我有抄筆記，等一下給你看。',{expr:'worried'}); else if(F.classAnswer==='good') await GM.say(an,'剛剛周老師點你的時候我還以為你會慘掉，結果你連八十八條都講出來。你昨天讀到幾點？',{expr:'smile'}); else if(F.classAnswer==='bold') await GM.say(an,'剛剛那個「標價就是要約」——很敢耶。周老師好像有點開心，他喜歡有人跟他吵。',{expr:'laugh'}); else if(F.classAnswer==='half') await GM.say(an,'剛剛你講到錯誤撤銷就停了。其實你講的那一半是對的，我有寫在筆記上。'); else await GM.say(an,'剛剛周老師說下週還要點你。……我有把他講的重點抄下來，你要不要看？'); F.flags_met_an=true; G.flags.met_an=true;
    GM.cine('ots',P.obj,an.obj); await GM.say(an,'我等一下要去溫州街那間咖啡廳寫民總的報告，就是開到凌晨兩點半那間。'); await GM.say(an,'你要不要一起？……還是你比較想去總圖？那邊安靜。'); const i=await GM.choose([{t:'好啊，去咖啡廳。',hint:'跟小安一起走去溫州街'},{t:'總圖比較安靜，去總圖吧。',hint:'跟小安一起走去總圖'},{t:'今天有點累，改天。'}]);
    if(i===2){ CHAR.setExpr(an.obj,'normal'); await GM.say(an,'喔，好。那……明天見。'); await GM.say(null,'她轉身往校門走。走了幾步又回頭揮了一下手。'); F.anSkipped=true; F.afternoonDone=true; GM.rel('an',-1); GM.memo('拒絕了小安的邀請'); SOCIAL.remember('heroine_01','DECLINED_INVITE','下課後她約你去咖啡廳'); GM.letterbox(false); GM.sceneEnd(); an.beh='route'; an.waypoints=[[30,-60],[30,-6],[-110,-6]]; an.pauseAt=false; an.talk=null; setTimeout(()=>{ if(GM.npc.an===an) GM.removeNPC('an'); },40000); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'自由行動'); return; }
    F.plan=i===0?'cafe':'library'; F.companion='an'; an.beh='follow'; an.followOff=1.1; CHAR.setExpr(an.obj,'smile'); await GM.say(an,i===0?'走吧。從校門出去，過馬路就是。':'走吧。總圖在那邊——經過社科院。'); GM.rel('an',2); GM.memo(i===0?'和小安一起去溫州街的咖啡廳':'和小安一起去總圖'); GM.letterbox(false); GM.sceneEnd(); GM.setGoal(i===0?'和小安一起走到校門，往公館・溫州街':'和小安一起走到總圖書館'); F.walkCk={}; startWalkTalk(GM); }
  // 一起走的路上：依位置觸發的對話
  /* 第二天走路時的對話（Café 或總圖兩條路線）。「為什麼是法律系」（D60，使用者 2026-10-14；AA_12 0-4、AA_120 7-5 第 5 項）：
     祐廷回「說來話長」，理由留到坐下來再說（AA_12 0-4）；以安講自己的理由，剛認識不提媽媽的工作（AA_113 第 0 節）*/
  const WHY_LAW_WALK=[['小安','你有沒有想過，為什麼是法律系？'],['我','……說來話長。你呢？'],['小安','我家吃飯的時候，一件小事也要講理由講半天。我想知道，理由要怎麼講才算數。']];
  function walkChecks(plan){ return plan==='cafe'?[{k:'road',x:30,z:-40,r:9,lines:WHY_LAW_WALK},{k:'bell',x:-38,z:6,r:12,lines:[['小安','傅鐘二十一響。上課十分鐘的那個故事。'],['我','我每次經過都在想，那剩下的三小時要幹嘛。'],['小安','……你這個人講話很煩耶。',3200]]},{k:'gate',x:-100,z:0,r:12,lines:[['小安','校門口那家豆花，週末排隊要二十分鐘。'],['小安','報告寫完我請你——如果你等一下有幫到忙的話。']]}]:[{k:'soc',x:40,z:-70,r:16,lines:WHY_LAW_WALK},{k:'lib',x:78,z:0,r:9,lines:[['小安','總圖三樓靠窗那排，下午光線很好，但四點以後會被曬到。'],['小安','我們坐二樓好了。']]}]; }
  function startWalkTalk(GM){ const G=GM.G, F=G.flags, E=GM.E; const cks=walkChecks(F.plan); const iv=setInterval(()=>{ if(F.companion!=='an'||F.afternoonDone){ clearInterval(iv); return; } if(E.player.busy||GM.D.active||G.zone!=='campus') return; const P=E.player.obj.position; for(const c of cks){ if(F.walkCk[c.k]) continue; if(Math.hypot(P.x-c.x,P.z-c.z)<c.r){ F.walkCk[c.k]=true; if(c.lines===WHY_LAW_WALK) F.whyWalkNew=true; playLines(GM,c.lines); break; } } },700); }   /* whyWalkNew：這次存檔裡真的播過新版的「說來話長」（AA 2026-10-14）*/
  async function playLines(GM,lines){ for(const l of lines){ GM.caption(l[0]==='我'?GM.G.name:l[0],l[1],l[2]||3000); await GM.sleep((l[2]||3000)+300); } }
  /* 為什麼念法律（D60）：Café、總圖兩個版本共用。只有 econ（說出念過一年經濟系）以安才記得（KNOWS_ECON_YEAR）；不設全域旗標——其他同學知不知道另外管。
     舊存檔的 whyLaw（ok／hero／family／unknown）保留原值不遷移 */
  const WHY_LAW_KEYS=['curious','econ','help','own'], ME=G=>({name:G.name});   /* ME：祐廷自己說的話（對話框寫名字；不改他坐著的姿勢）*/
  function whyLawChosen(G,F,k){ F.whyLaw=WHY_LAW_KEYS[k]; G.choices.whyLaw=F.whyLaw; if(F.whyLaw==='econ'&&typeof SOCIAL!=='undefined') SOCIAL.remember('heroine_01','KNOWS_ECON_YEAR','他說他念過一年經濟系'); }
  S.whyLawKey=F=>{ const v=F&&F.whyLaw; return v==null?null:({hero:'help',ok:'own',family:'own',unknown:'own'})[v]||v; };   /* 以後要讀 whyLaw 用這個（AA_120 7-5）：舊存檔的 hero 當 help，ok／family／unknown 當 own；沒聊過是 null */
  // ---------- 咖啡廳 ----------
  async function cafeScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const an=GM.npc.an; if(!an) return; GM.sceneBegin(); GM.letterbox(true); an.beh='idle'; const table={x:4.5,z:-2.5}; await Promise.all([GM.walkTo(P,table.x-0.6,table.z+1.6),GM.walkTo(an,table.x-0.6,table.z-1.6)]); GM.sitAt(P,{x:table.x,z:table.z+0.8,yaw:Math.PI}); GM.sitAt(an,{x:table.x,z:table.z-0.8,yaw:0}); G.money-=120; GM.updateHUD(); await GM.sleep(400); GM.advance(0.3);
    GM.cine('two',P.obj,an.obj,{flip:true}); ADV.begin({background:'blur',right:'heroine_01'}); await GM.say(null,'窗邊的雙人桌。她把筆電打開，又把它闔上。'); await GM.say(an,'先不寫。我想先問你一件事。',{expr:'normal'}); GM.cine('ots',P.obj,an.obj); await GM.say(an,'那個賣家——少打一個零的那個。你覺得法律應該保護他嗎？他自己粗心欸。'); const hasNote=GM.hasNote('law_88'); const i=await GM.choose([{t:'應該。交易要有誠信，但也不能讓人因為一個手誤就賠十倍。',key:'A'},{t:'不應該。錯誤是自己造成的，後果就自己承擔。',key:'B'},{t:'看情況。八十八條說「無過失」才能撤銷——少打一個零可能就是有過失。',key:'C',hint:hasNote?'你的筆記裡有':'需要讀過 §88',dim:!hasNote}]); let key=['A','B','C'][i]; if(key==='C'&&!hasNote){ await GM.say(null,'你想引條文，但想不起來是哪一條。'); key='A'; }
    F.cafeView=key; G.choices.cafeView=key; GM.cine('close',P.obj,an.obj);
    if(key==='A'){ CHAR.setExpr(an.obj,'smile'); await GM.say(an,'我也這樣想。可是我寫報告的時候一直被自己反駁——那買家呢？他真的以為撿到便宜，也沒做錯事。'); }
    else if(key==='B'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'好狠。'); CHAR.setExpr(an.obj,'normal'); await GM.say(an,'……但我懂。「我不是故意的」，現實裡每天都有人說。可是法律不是用來原諒粗心的。'); }   /* D60：剛認識的人，她不提媽媽在法院工作（AA_113 第 0 節）*/
    else { CHAR.setExpr(an.obj,'smile'); await GM.say(an,'對，就是「無過失」那三個字。我報告的結論想寫這個——可是要怎麼判斷「少打一個零」有沒有過失？你覺得呢？'); const j=await GM.choose([{t:'看賣家有沒有機會發現。網頁掛了三天都沒改，就有過失。'},{t:'看數字差多少。一千和一萬，正常人會發現。'}]); await GM.say(an,j===0?'時間。好，這個我沒想到。':'金額落差。嗯，這個判決好像有提到。'); GM.rel('an',2); F.cafeHelp=true; }
    await GM.say(null,'她打開筆電，打了幾行字，又停下來。'); GM.cine('two',P.obj,an.obj); await GM.say(an,F.whyWalkNew?'欸，剛剛路上你說「說來話長」。我們有一整個下午。':'欸，剛剛路上那個問題——為什麼是法律系？我們有一整個下午。');   /* 沒聽過新版走路台詞（舊版走到一半存的檔、沒經過觸發點就到店裡）：不提「說來話長」（AA 2026-10-14）*/
    /* 為什麼念法律（D60）：四個回答都是祐廷自己選的；只有說出念過經濟系（econ）以安才記得——其他同學知不知道另外管（ECON_PAST_SHARED），這裡不設全域旗標 */
    const k=await GM.choose([{t:'我小時候遇到事情就會去翻民法。翻得到，看不懂。我想知道怎麼看懂。',key:'curious'},{t:'我念過一年經濟。後來發現，我比較想知道事情「應該」怎麼處理。',key:'econ'},{t:'我想幫身邊的人把事情弄清楚。',key:'help'},{t:'還在找怎麼說。但這是我自己選的。',key:'own'}]); whyLawChosen(G,F,k);
    if(F.whyLaw==='curious'){ await GM.say(an,'……小時候？'); await GM.say(null,'她停了一下。'); await GM.say(an,'那你很誠實。大部分人會說自己從小就懂。',{expr:'smile'}); }
    else if(F.whyLaw==='econ'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'所以你比我大？'); await GM.say(ME(G),'一歲。'); await GM.say(an,'……學長。',{expr:'smile'}); await GM.say(ME(G),'不要。'); }
    else if(F.whyLaw==='help') await GM.say(an,'這個理由我喜歡。很多人不是輸在法律，是輸在沒人幫他把事情弄清楚。',{expr:'smile'});
    else { await GM.say(an,'「自己選的」。'); await GM.say(null,'她重複一次，好像要記住。'); } GM.rel('an',3);
    await GM.fade(true); GM.advance(17.7-G.hour); await GM.fade(false); GM.cine('wide',P.obj,an.obj); await GM.say(null,'窗外的光慢慢變成橘色。巷子裡有機車經過，吧檯的磨豆機響了一聲。'); await GM.say(an,'我再待一下，你先走吧。'+(F.zheInvite?'阿哲不是約你吃麵？':'')+'',{expr:'smile'}); await GM.say(an,'今天……謝謝。'); await GM.say(an,'你的聯絡方式給我。筆記我拍給你。'); anContactDay2(G); F.afternoonDone=true; F.companion=null; GM.memo('和小安在兩點半 Café 待到黃昏'); SOCIAL.remember('heroine_01','CAFE_AFTERNOON','聊了報告和為什麼念法律'); SOCIAL.remember('heroine_01','WALKED_TOGETHER','從法學院走到溫州街'); SOCIAL.adjust('heroine_01',{fam:8,trust:5,comf:6}); GM.standUp(P); an.talk=n=>talkAn(GM,n); an.frozen=true; GM.letterbox(false); GM.sceneEnd(); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'今晚去公館吃點東西，或回宿舍'); GM.autosave(); }
  /* 以安的聯絡方式（交付清單 A19 的前提，AA 2026-10-14）：第二天 Café、總圖兩條路線的結尾她說「你的聯絡方式給我。筆記我拍給你。」——加聯絡方式、記那一天；
     當晚 21:30 她的第一則訊息是一張筆記的照片（phoneRules）。沒和她走的玩家、舊存檔：下午結束時默默加聯絡方式（phoneRules 的 silentContact），不補訊息 */
  function anContactDay2(G){ if(typeof INV!=='undefined'){ INV.rec(G); if(G.contacts.heroine_01==null) G.contacts.heroine_01=G.day; } G.flags.AN_CONTACT_DAY2=G.day; }
  async function libraryScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const an=GM.npc.an; if(!an) return; GM.sceneBegin(); GM.letterbox(true); an.beh='idle'; const seats=E.zone.seats; const sA=seats[0], sB=seats[1]; await Promise.all([GM.walkTo(P,sA.x,sA.z-0.7,{lv:sA.lv}),GM.walkTo(an,sB.x,sB.z+0.7,{lv:sB.lv})]); GM.sitAt(P,sA); GM.sitAt(an,sB); await GM.sleep(400); GM.advance(0.3);
    GM.cine('two',P.obj,an.obj); ADV.begin({background:'blur',right:'heroine_01'}); await GM.say(null,'二樓靠牆的長桌。翻書的聲音、有人把水壺放下的聲音。她把聲音壓得很低。'); GM.cine('ots',P.obj,an.obj); await GM.say(an,'（小聲）那個賣家——少打一個零的那個。你覺得法律應該保護他嗎？'); const hasNote=GM.hasNote('law_88'); const i=await GM.choose([{t:'應該。交易要有誠信，但不能讓人因為一個手誤就賠十倍。',key:'A'},{t:'不應該。錯誤是自己造成的。',key:'B'},{t:'看情況。八十八條「無過失」才能撤銷。',key:'C',hint:hasNote?'你的筆記裡有':'需要讀過 §88',dim:!hasNote}]); let key=['A','B','C'][i]; if(key==='C'&&!hasNote){ await GM.say(null,'你想引條文，但想不起來是哪一條。'); key='A'; } F.cafeView=key; G.choices.cafeView=key; GM.cine('close',P.obj,an.obj); if(key==='A') await GM.say(an,'（小聲）我也這樣想。可是那買家沒做錯事啊。'); else if(key==='B'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'（小聲）好狠。……但我懂。'); } else { CHAR.setExpr(an.obj,'smile'); await GM.say(an,'（小聲）對，「無過失」。我的結論就想寫這個。'); GM.rel('an',2); F.cafeHelp=true; }
    GM.cine('two',P.obj,an.obj); await GM.say(an,F.whyWalkNew?'（小聲）剛剛路上你說「說來話長」。……小聲講，可以講短一點。':'（小聲）剛剛路上那個問題……小聲講，可以講短一點。');
    const k=await GM.choose([{t:'小時候遇到事情就去翻民法。翻得到，看不懂。',key:'curious'},{t:'我念過一年經濟。後來比較想知道事情「應該」怎麼處理。',key:'econ'},{t:'想幫身邊的人把事情弄清楚。',key:'help'},{t:'還在找怎麼說。但是我自己選的。',key:'own'}]); whyLawChosen(G,F,k);   /* 總圖的小聲版（D60）*/
    if(F.whyLaw==='curious') await GM.say(an,'（小聲）……小時候？那你很誠實。',{expr:'smile'});
    else if(F.whyLaw==='econ'){ await GM.say(an,'（小聲）所以你比我大？'); await GM.say(ME(G),'一歲。'); await GM.say(an,'（小聲）……學長。',{expr:'smile'}); await GM.say(ME(G),'不要。'); }
    else if(F.whyLaw==='help') await GM.say(an,'（小聲）這個理由我喜歡。',{expr:'smile'});
    else await GM.say(an,'（小聲）「自己選的」。……好。',{expr:'smile'}); GM.rel('an',3);
    await GM.fade(true); GM.advance(17.7-G.hour); await GM.fade(false); await GM.say(null,'窗外的光變成橘色，照在書架上。'); await GM.say(an,'（小聲）我再待一下。今天……謝謝。',{expr:'smile'}); await GM.say(an,'（小聲）你的聯絡方式給我。筆記我拍給你。'); anContactDay2(G); F.afternoonDone=true; F.companion=null; GM.memo('和小安在總圖待到黃昏'); SOCIAL.remember('heroine_01','LIBRARY_AFTERNOON','聊了報告和為什麼念法律'); SOCIAL.remember('heroine_01','WALKED_TOGETHER','從法學院走到總圖'); SOCIAL.adjust('heroine_01',{fam:8,trust:5,comf:5}); GM.standUp(P); an.talk=n=>talkAn(GM,n); an.frozen=true; GM.letterbox(false); GM.sceneEnd(); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'今晚去公館吃點東西，或回宿舍'); GM.autosave(); }
  // ---------- 麵店 ----------
  async function noodleScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const zhe=GM.npc.zhe; GM.sceneBegin(); const opts=[{t:'乾麵　60 元',hint:'體力 +22',dim:G.money<60},{t:'餛飩湯　70 元',hint:'體力 +25',dim:G.money<70},{t:'先不吃'}]; const i=await GM.choose(opts); if(i===2){ GM.sceneEnd(); return; } const cost=i===0?60:70; if(G.money<cost){ GM.toast('錢不夠'); GM.sceneEnd(); return; } GM.money(-cost); await GM.walkTo(P,it.seat.x,it.seat.z+0.5); GM.sitAt(P,it.seat); await GM.sleep(300); GM.advance(0.5); GM.energy(i===0?22:25);
    if(zhe&&zhe.seat&&Math.hypot(zhe.obj.position.x-it.seat.x,zhe.obj.position.z-it.seat.z)<2.5&&!F.zheNoodleDone){ F.zheNoodleDone=true; GM.letterbox(true); GM.cine('two',P.obj,zhe.obj); ADV.begin({background:'blur',right:'zhe'}); SOCIAL.remember('zhe','SHARED_MEAL','阿鳳麵店'); await GM.say(zhe,'來了。我點了滷蛋，你要不要？',{expr:'smile'}); await GM.say(zhe,'所以下午你跟小安去哪了？我在球場看到你們往校門走。'); const j=await GM.choose([{t:F.plan==='library'?'總圖。她在寫民總報告。':'溫州街的咖啡廳。她在寫民總報告。'},{t:'沒有啊，剛好同路。'}]); if(j===0){ await GM.say(zhe,'寫報告。嗯哼。',{expr:'laugh'}); await GM.say(zhe,'她她說開學這兩個禮拜，每天都在那間店寫東西，寫到店員都認識她。你是第一個被帶去的。'); GM.rel('an',1); } else { await GM.say(zhe,'同路。從霖澤館走到校門要「剛好同路」二十分鐘喔。',{expr:'laugh'}); } await GM.say(zhe,'對了，法服在招人。溫學姊——大三那個——說一年級去會被操，但真的學得到東西。'); if(!F.lawclub) GM.addNote('club_law','法律服務社','週三 19:00 萬才館研討室 A（法服讀書會）。對外服務：隔週週六上午。社長溫學姊。阿哲說一年級去會被操。'); GM.memo('和阿哲在阿鳳麵店吃麵'); GM.rel('zhe',3); GM.letterbox(false); GM.setGoal('吃飽了。晚上自由活動，回宿舍睡覺就到明天'); }   /* 2026-10-11 使用者回報：吃完麵目標還停在「阿鳳麵店（阿哲）」，不知道接下來要幹嘛 */
    else { await GM.say(null,i===0?'乾麵很燙。老闆娘多給了一匙肉燥。':'餛飩湯上面漂著一點油蔥。'); }
    GM.standUp(P); GM.sceneEnd(); }
  // ---------- 對話（自由互動）----------
  /* 舊的對話函式（以安、阿哲、學姊、阿凱、小語固定時段的人）也先說門檻台詞（好感看得見：AA_124 1-6、BB_120）；第一二天、一起走的時候不插 */
  async function relUp(GM,id,n){ const G=GM.G; if(G.day<=2||G.flags.companion||typeof SOCIAL==='undefined'||!SOCIAL.playUp) return false; if(!(await SOCIAL.playUp(GM,n,id))) return false; if(SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; }
  /* Café 的學姊（BB_120 1-1，使用者 2026-10-14「在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」）：晚上（19 點以後）每晚第一次＝打招呼（照關係）→ 小交流（「今天念了什麼？」和她的小事輪流）
     → 她推過來的便條（件數照關係；W8 以前一律三件：SOCIAL.friendLevel 的 cap）；同一晚再找她只有一句。存檔：flags.SIS_CAFE＝{night, k, s}。台詞在 data/rel_lines.js */
  async function sisCafe(GM,n){ const G=GM.G, F=G.flags, id='heroine_05', D=typeof REL_LINES!=='undefined'&&REL_LINES[id]&&REL_LINES[id].cafe; if(!D||typeof SOCIAL==='undefined'||!SOCIAL.playSteps||G.hour%24<19) return false;
    const CS=F.SIS_CAFE||(F.SIS_CAFE={}), P=st=>SOCIAL.playSteps(GM,n,id,st);
    if(CS.night===G.day){ await P(D.again); return true; }
    CS.night=G.day; let lv=SOCIAL.friendLevel(id); if(lv==='STRANGER') lv='ACQUAINTANCE';
    await P(D.hello[lv]||D.hello.ACQUAINTANCE);
    if(((CS.k|0)%2)===0){ await P(D.today.ask); const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):null, st=R&&R.lastStudy&&R.lastStudy.day===G.day?R.lastStudy:null;
      const O=D.today.opts.filter(o=>o.need!=='studied'||st); const k=await GM.choose(O.map(o=>({t:o.need==='studied'?'（說今天念的'+st.name+'）':o.t}))); if(O[k]) await P(O[k].r); }
    else { const it=D.small[(CS.s|0)%D.small.length]; CS.s=(CS.s|0)+1; await P(it.l); const k=await GM.choose(it.ch.map(c=>({t:c.t}))); if(it.ch[k]) await P(it.ch[k].r); }
    CS.k=(CS.k|0)+1;
    await GM.say(null,'（她推過來一張便條。'+(D.note[lv]||D.note.ACQUAINTANCE)+'）');
    if(SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; }
  S.sisCafe=sisCafe;   /* 測試用（tests/sis_cafe_unit.js） */
  async function talkAn(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('heroine_01')) return; GM.sceneBegin({adv:'heroine_01'}); SOCIAL.talkedTo('heroine_01'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); const isCompanion=F.companion==='an'; if(!isCompanion&&F.met_an&&await relUp(GM,'heroine_01',n)){ GM.sceneEnd(); return; } if(isCompanion){ const l=[['走吧，還沒到。'],['你走路真的很快。'],['……在想報告要怎麼開頭。']]; await GM.say(n,l[(Math.random()*l.length)|0][0]); }
    else if(!F.afternoonDone&&F.classDone){ await GM.say(n,'嗯？我等一下要去寫報告。'); }
    else if(F.afternoonDone){ if(!F.anAfter){ F.anAfter=true; if(F.cafeView==='C'){ await GM.say(n,'報告我用了你說的那個——「無過失」。老師如果打槍我，就說是你的主意。',{expr:'smile'}); } else if(F.cafeView==='B'){ await GM.say(n,'我後來想了一下你說的「後果自己承擔」。……我把它寫進反方意見了。'); } else { await GM.say(n,'報告寫到一半。你那個「不能賠十倍」的講法，我放在結論。'); } /* 舊版「家裡希望我念」的追問拿掉（D60：舊的四個回答連同反應整組拿掉；舊存檔的 family 照 AA_120 7-5 當 own 讀，沒有追問）*/GM.rel('an',1); } else if(!(await S.ladderTalk(GM,n,'heroine_01'))){ const l=['明天要不要一起去總圖？早上人少。','周老師下週說要講錯誤與撤銷，你先看八十八條。','那間咖啡廳的檸檬塔你還沒吃過吧。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } }   /* 閒聊階梯（AA_135）優先；沒有階梯資料（之後的學期）才用舊的三句 */
    else { await GM.say(n,'你好，我是小安。……同班的，你不記得？',{expr:'normal'}); G.flags.met_an=true; }
    if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'heroine_01',n); GM.sceneEnd(); }
  async function talkZhe(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('zhe')) return; GM.sceneBegin({adv:'zhe'}); SOCIAL.talkedTo('zhe'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); if(!(F.zheInvite&&!F.zheNoodleDone)&&await relUp(GM,'zhe',n)){ GM.sceneEnd(); return; } if(n.seat&&G.zone==='noodle'){ await GM.say(n,'坐啊，麵要涼了。',{expr:'smile'}); } else if(!F.classDone&&isThu(G)){ await GM.say(n,'快進去啦，周老師要來了。'); } else if(F.zheInvite&&!F.zheNoodleDone){ await GM.say(n,'六點半，阿鳳麵店，公館那條街上。別忘了。',{expr:'smile'}); } else { const l=['系籃週五練球，你要來嗎？不會打也可以來坐。','公館那家滷味晚上十點後半價。','你知道傅鐘旁邊那棵樹有八十歲了嗎？我也不知道，我亂講的。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'laugh'}); } if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'zhe',n); GM.sceneEnd(); }
  async function talkSis(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('heroine_05')) return; GM.sceneBegin({adv:'heroine_05'}); SOCIAL.talkedTo('heroine_05'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('talk',E.player.obj,n.obj); if(F.met_sis&&await relUp(GM,'heroine_05',n)){ GM.sceneEnd(); return; } if(F.met_sis&&G.zone==='cafe'&&await sisCafe(GM,n)){ GM.sceneEnd(); return; } if(!F.met_sis){ F.met_sis=true; if(typeof SOCIAL!=='undefined'&&!SOCIAL.has('heroine_05','FIRST_MET')) SOCIAL.meet('heroine_05',G.zone);
      /* 學姊 W1（BB_95 2-1，交接包 v1）：六句以內、說完就走。第一天晚上的家族群組有沒有回（FAM_GROUP_REPLIED）；第一堂民總之前／之後兩種。舊存檔沒有家族群組（4-1 不補）：不提群組 */
      const grp=F.FAM_GROUP_SENT?(F.FAM_GROUP_REPLIED?'群組裡回過話的那個。':'群組裡沒講過話的那個。'):'';
      await GM.say(n,'一年級的？……喔，你是我的直屬。'+grp); await GM.say(n,'我是溫學姊，法律服務社。三件事。'); await GM.say(n,'一，法服週三晚上在萬才館。'); await GM.say(n,'二，一年級去會被操。但真的學得到東西。');
      if(F.classDone) await GM.say(n,'三，先把民總讀好。周老師的課你被點過了吧？消息傳很快。',{expr:'smile'}); else await GM.say(n,'三，先把民總讀好。周老師的課在明天吧？他會點人。');
      await GM.say(n,'（看了一下手錶）好，我要走了。不用現在決定。'); GM.rel('sis',3); }
    else if(!(await S.ladderTalk(GM,n,'heroine_05'))){ const l=['兩件事。一，判決要看事實。二，不要只背結論。','法服週三晚上。來不來都可以。重點是先來看一次。','總圖三樓的判例彙編，去年被人翻到脫頁。……不是我。']; await GM.say(n,l[(Math.random()*l.length)|0]); }   /* 閒聊階梯（BB_130）優先 */ if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'heroine_05',n); GM.sceneEnd(); }
  /* 室友阿凱的宿舍事件（BB_130 第 6 節；LADDER.kaiDorm K-D1～6；使用者 2026-10-15 試玩回報：室友要有故事——打電動、吵架、和好）：
     K-D1 晚上找他說話（週日～四 21～24、一週一次）＝一起打一場；K-D2 第二次以上、打完已經 23 點以後＝一場變三場（時間到 02:00；選「八點。」隔天早上精力 −10）；
     K-D3 有早八的早上（7:00～8:30）、昨晚沒一起打，在宿舍 30%＝鍵盤聲；不說話累積 KAI_FRICTION，到 3 或選「你到底要不要睡？」＝K-D4 吵架（之後兩天他只說「嗯」）；
     K-D5 吵架後第 1～3 天在宿舍＝和解的飲料；沒回宿舍的話第 4 天自己和好、下次見面他先說（不鎖線）；K-D6 和好以後的週日晚上＝室友模式。台詞照資料，一字不改 */
  const KD=id=>((typeof LADDER!=='undefined'&&LADDER.kaiDorm)||[]).find(e=>e.id===id)||null;
  const kdRec=G=>{ const F=G.flags; if(!F.kaiDorm||typeof F.kaiDorm!=='object') F.kaiDorm={}; return F.kaiDorm; };
  const kdWeek=G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return T?T.id+':'+T.week:'d'+Math.floor(G.day/7); };
  const kdIn=(G,e)=>{ const hh=G.hour; if(e.time&&!(hh>=e.time[0]&&hh<e.time[1])) return false; if(e.weekday&&!e.weekday.includes(G.weekday)) return false; return true; };
  async function kdChoice(GM,n,ev){ const G=GM.G, F=G.flags; const k=await GM.choose(ev.choices.map(c=>({t:c.t}))); const ch=ev.choices[k]||ev.choices[0];
    if(ch.advance) GM.advance(ch.advance); if(ch.energy) GM.energy(ch.energy); if(ch.rel) for(const id in ch.rel) SOCIAL.adjust(id,ch.rel[id]);
    if(ch.random) await GM.say(n,ch.random[(Math.random()*ch.random.length)|0]); if(ch.count) F[ch.count]=(+F[ch.count]||0)+1; if(ch.inc) F[ch.inc]=(+F[ch.inc]||0)+1;
    if(ch.reply) await GM.say(n,ch.reply); if(ch.narr) await GM.say(null,ch.narr); if(ch.mem) SOCIAL.remember('kai',ch.mem,ev.id);
    if(ch.nextMorningEnergy) F.morningEnergyAdj=(+F.morningEnergyAdj||0)+ch.nextMorningEnergy; if(ch.clear) F[ch.clear]=false; return {k,ch}; }
  async function kdFight(GM,n){ const G=GM.G, F=G.flags, ev=KD('K-D4'); if(!ev) return; for(const l of (ev.lines||[])){ if(l.who==='player') await GM.say(ME(G),l.t); else await GM.say(n,l.t); }
    if(ev.narr) await GM.say(null,ev.narr); F.KAI_FIGHT=true; F.KAI_FRICTION=0; kdRec(G).fightDay=G.day; }
  const kaiWho=GM=>GM.npc.kai||{name:SOCIAL.displayName?SOCIAL.displayName('kai'):'阿凱',charId:'kai'};
  /* 和阿凱說話時（talkKai）：吵架中只說「嗯」；第 4 天自己和好的那一句；K-D6；K-D1（一起打電動，接 K-D2）。回傳 true＝處理了 */
  S.kaiDormTalk=async function(GM,n){ const G=GM.G, F=G.flags, R=kdRec(G); if(typeof LADDER==='undefined'||!LADDER.kaiDorm||G.zone!=='dorm') return false;
    if(R.sorryPending){ R.sorryPending=false; const fb=(KD('K-D5')||{}).fallback||'', m=fb.match(/「([^」]+)」/); if(m){ await GM.say(n,m[1]); return true; } }
    if(F.KAI_FIGHT&&G.day-(R.fightDay|0)<=2){ await GM.say(n,'嗯'); return true; }   /* K-D4：之後兩天他只說「嗯」*/
    const d6=KD('K-D6'); if(d6&&!R.d6&&SOCIAL.has('kai','KAI_ROOM_RULES')&&kdIn(G,d6)){ R.d6=G.day; for(const l of d6.lines) await GM.say(n,l); await kdChoice(GM,n,d6); return true; }
    const d1=KD('K-D1'); if(d1&&!F.KAI_FIGHT&&R.d1Week!==kdWeek(G)&&kdIn(G,d1)){ R.d1Week=kdWeek(G); for(const l of d1.lines) await GM.say(n,l); const r=await kdChoice(GM,n,d1);
      if(r.k===0){ R.lastGameDay=G.day; const d2=KD('K-D2'); if(d2&&!R.d2&&(+F.KAI_GAMES||0)>=2&&G.hour>=d2.time[0]){ R.d2=G.day; if(d2.narr) await GM.say(null,d2.narr); if(G.hour<26) GM.advance(26-G.hour); for(const l of d2.lines) await GM.say(n,l); await kdChoice(GM,n,d2); } }   /* K-D2：一場變三場，抬頭已經兩點 */
      return true; }
    return false; };
  /* 在宿舍時（S.tick）：K-D3 早上的鍵盤聲、K-D5 和解的飲料；吵架第 4 天自己和好（不在宿舍也算）*/
  let kdBusy=false;
  S.kaiDormTick=function(GM){ const G=GM.G, F=G.flags, R=kdRec(G); if(kdBusy||typeof LADDER==='undefined'||!LADDER.kaiDorm) return;
    if(F.KAI_FIGHT&&G.day-(R.fightDay|0)>=4){ F.KAI_FIGHT=false; SOCIAL.remember('kai','KAI_ROOM_RULES','K-D5'); R.sorryPending=true; return; }   /* 沒回宿舍：第 4 天自己和好（BB_130 fallback）*/
    if(G.zone!=='dorm') return; const run=f=>{ kdBusy=true; (async()=>{ GM.sceneBegin({adv:'kai'}); try{ await f(); } finally { GM.sceneEnd(); kdBusy=false; } })().catch(e=>{ console.warn('kaiDorm',e); kdBusy=false; }); };
    const d5=KD('K-D5'), dd=G.day-(R.fightDay|0); if(d5&&F.KAI_FIGHT&&dd>=d5.daysAfter[0]&&dd<=d5.daysAfter[1]&&R.d5!==R.fightDay){ R.d5=R.fightDay; run(async()=>{ const n=kaiWho(GM); if(d5.narr) await GM.say(null,d5.narr); await kdChoice(GM,n,d5); }); return; }
    const d3=KD('K-D3'); if(d3&&kdIn(G,d3)&&R.d3Roll!==G.day&&GM.npc.kai&&!F.KAI_FIGHT&&!SOCIAL.has('kai','KAI_QUIET_KEYBOARD')&&!SOCIAL.has('kai','KAI_ROOM_RULES')&&R.lastGameDay!==G.day-1){
      const early=typeof CLS!=='undefined'&&CLS.dayItems&&CLS.dayItems(G).some(it=>it.t0<=9.25); R.d3Roll=G.day; if(!early||Math.random()>=0.3) return;   /* 今天有早上的第一堂課、昨晚沒一起打：30%。BB 寫「早八」；遊戲的大一必修最早是 09:10（第 2 節），只算 08:10 的話這個事件永遠不會發生——早上 9:10 以前的課都算 */
      run(async()=>{ const n=kaiWho(GM); if(d3.narr) await GM.say(null,d3.narr); const r=await kdChoice(GM,n,d3); if(r.ch.goto==='K-D4'||(+F.KAI_FRICTION||0)>=3) await kdFight(GM,n); }); } };
  async function talkKai(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('kai')) return; GM.sceneBegin({adv:'kai'}); SOCIAL.talkedTo('kai'); GM.cine('talk',E.player.obj,n.obj); if(await relUp(GM,'kai',n)){ GM.sceneEnd(); return; } if(await S.kaiDormTalk(GM,n)){ GM.sceneEnd(); return; } if(G.day===1){ await GM.say(n,'案例讀了沒？我等一下要開麥，會很吵。',{expr:'smile'}); } else if(F.afternoonDone&&!F.kaiAsked){ F.kaiAsked=true; await GM.say(n,'今天這麼晚。跟誰出去？'); const i=await GM.choose([{t:'同學。寫報告。'},{t:'沒有啊。'}]); await GM.say(n,i===0?'「寫報告」。好，你們法律系的都很會用這個詞。':'喔。',{expr:'laugh'}); } else { const l=['所以那個賣家可以告嗎？……不能？那法律系在幹嘛。','我明天早八，你走的時候小聲一點。','宿舍網路又斷了，我要去投訴。你們有教這個嗎？']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'kai',n); GM.sceneEnd(); }
  async function talkYu(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('yu')) return; GM.sceneBegin({adv:'yu'}); SOCIAL.talkedTo('yu'); GM.cine('talk',E.player.obj,n.obj); if(F.met_yu&&await relUp(GM,'yu',n)){ GM.sceneEnd(); return; } if(!F.met_yu){ F.met_yu=true; F.metYuDay=G.day; await GM.say(n,'你是周老師點的那個！我是小語，坐你前面右邊。',{expr:'smile'}); await GM.say(n,'我參加了三個社團，法服、辯論、還有吉他社。你要不要來吉他社？不用會彈。'); GM.rel('yu',2); } else { const l=['傅鐘旁邊這張椅子早上曬不到太陽，是全校最好的位子。','辯論社下週辯「網拍標錯價要不要出貨」，你要來看嗎？','溫州街的貓你有看到嗎？咖啡廳門口那隻。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } if(G.flags.afternoonDone&&G.flags.companion==null) await S.offerInvite(GM,'yu',n); GM.sceneEnd(); }
  async function talkProf(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('prof_zhou')) return; GM.sceneBegin({adv:'prof_zhou'}); SOCIAL.talkedTo('prof_zhou'); GM.cine('talk',E.player.obj,n.obj); if(F.classAnswer==='good') await GM.say(n,G.name+'。今天回答得不錯。下週的錯誤與撤銷，先看八十八和九十一。'); else if(F.classAnswer==='none') await GM.say(n,G.name+'。案例要讀。下週我還會點你，這不是威脅，是預告。'); else await GM.say(n,'有問題就來研究室。法律不是背的，是想的。'); GM.sceneEnd(); }
  // ---------- 認識的人現在大概在哪（2026-10-11 使用者：「自由那天根本不知道其他 NPC 在哪，至少給我線索吧」）----------
  // 用角色資料的 daily_schedule——和 populateSchedule 生人物用的是同一份，地圖上寫的和走過去看到的一致。
  // 第一二天主線還在安排的人（LEGACY_IDS，下午的劇情結束前、上課中）不猜：那時候劇情會帶玩家去找他們。
  const ACT={read:'看書',class:'上課',barista:'打工',wander:'走走',help:'幫忙',sit:'坐著',club:'社團',eat:'吃飯',wait:'等人',desk:'在書桌前',ta:'助教課',follow:'和你在一起',linger:'待一下'};
  /* 人物在不在學校（AA_110 第 3 節：跨學年的出場條件）：CHARACTERS[id].presence＝{from:'Y1S1', until:'Y2S1', absent:['Y3S2'], away:{Y3S2:'在日本交換', after:'在別的學校念書'}}。
     學期照日曆（寒暑假算前一個學期）；不在的時候不生人物、人物線索寫 away 的文字、課堂沒有她的反應句、事件的 npcHere 不成立。
     沒有 presence 的人物照舊（現在的資料都還沒填：內容要 AA 確認、使用者批准，見 docs/STORY_EVENT_SCHEMA.md）。 */
  const TERM_ORDER=['Y0S1','Y0S2','Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.termAt=function(day){ if(typeof CALENDAR==='undefined') return null; for(let d=day; d>day-200; d--){ const t=CALENDAR.termOf(d); if(t) return t.id; } return null; };
  S.presence=function(id,G){ const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; const P=c&&c.presence; if(!P) return {here:true}; const t=S.termAt(G.day); if(!t) return {here:true}; const i=TERM_ORDER.indexOf(t);
    const A=P.away||{}; if(P.from&&i<TERM_ORDER.indexOf(P.from)) return {here:false,away:A.before||'',kind:'before'}; if(P.until&&i>TERM_ORDER.indexOf(P.until)) return {here:false,away:A[t]||A.after||'',kind:'after'};
    if(P.absent&&P.absent.includes(t)) return {here:false,away:A[t]||'',kind:'absent'}; return {here:true}; };   /* kind：手機「約不了的原因」（AA_125 第 1 節：交換＝國外、until 過了＝畢業）*/
  /* 現在的學期在不在 {from, until} 裡（例：人物有伴侶的那幾個學期，invites3d.js 的 partnerBlock）*/
  /* 伴侶期間（AA 2026-10-14：照劇情事件，不照整學期；事件還沒發生、或玩家沒看到時，照日期當保底）：
     {from, until}＝學期（舊格式照舊）；fromWeek／untilWeek＝{term, week}（untilWeek 那一週結束算分開）；startEvent／endEvent＝事件 id（演過就開始／結束；那些事件做好時填）*/
  S.partnerOn=function(G,p){ if(!p) return false; const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; if(!T) return false;
    const done=id=>!!(id&&G.events&&G.events.done&&G.events.done[id]); const ti=id=>TERM_ORDER.indexOf(id), cur=[ti(T.id),T.week|0];
    const ge=(a,b)=>a[0]>b[0]||(a[0]===b[0]&&a[1]>=b[1]), gt=(a,b)=>a[0]>b[0]||(a[0]===b[0]&&a[1]>b[1]);
    const started=done(p.startEvent)||(p.fromWeek?ge(cur,[ti(p.fromWeek.term),p.fromWeek.week]):(p.startEvent&&!p.from?false:(!p.from||cur[0]>=ti(p.from))));
    const ended=done(p.endEvent)||(p.untilWeek?gt(cur,[ti(p.untilWeek.term),p.untilWeek.week]):(!!p.until&&cur[0]>ti(p.until)));
    return started&&!ended; };
  S.inTerms=function(G,r){ if(!r) return false; const t=S.termAt(G.day); if(!t) return false; const i=TERM_ORDER.indexOf(t); return i>=0&&(!r.from||i>=TERM_ORDER.indexOf(r.from))&&(!r.until||i<=TERM_ORDER.indexOf(r.until)); };
  S.present=(id,G)=>S.presence(id,G).here;
  S.whereIs=function(GM,id){ const G=GM.G, F=G.flags, hr=h(G), wd=G.weekday; const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; if(!c) return null;
    { const pr=S.presence(id,G); if(!pr.here) return pr.away?{zone:null,act:'',away:pr.away}:null; }
    if(LEGACY_IDS.includes(id)&&(!F.afternoonDone||F.classNow)) return null;
    const ent=schedEnt(c,G); if(!ent) return c.school?{zone:null,act:'',away:'在'+c.school}:null; const end=ent.to%24, hh=Math.floor(end), mm=Math.round((end-hh)*60), until=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    if(ent.zone==null) return ent.away?{zone:null,act:ACT[ent.act]||'',away:ent.away,until}:null;   /* 不在遊戲的場景裡（例：在小福吃午餐）*/
    return {zone:ent.zone, room:ent.room||null, act:ent.label||ACT[ent.act]||'', until}; };   /* label：這一筆自己的說法（芷若：「剛下課，在 101 門口」）*/
  return S;
})();
