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
  S.populate=function(zoneId,GM){ const E=GM.E, G=GM.G; const hr=h(G); const day=hr>=6.5&&hr<23; const F=G.flags; const tm=(key,to)=>{ const n=GM.npc[key]; if(n&&F.afternoonDone) n.until=to; };   /* 舊的固定時段（第三天以後）：時段結束時 refreshSchedule 讓他離開（不在玩家眼前）；第一、二天的劇情人物不標 */ let xi=0;
    const qf=E.q.level==='low'?0.5:(E.q.level==='medium'?0.75:1); const extras=(n,pockets)=>{ n=Math.max(2,Math.round(n*qf)); const rs=walkRoutes[zoneId]||[]; for(let i=0;i<n&&rs.length;i++){ const r=rs[i%rs.length]; GM.spawnExtra(extraSpec(xi++),r.map(p=>[p[0]+(rnd()-0.5)*2,p[1]+(rnd()-0.5)*2,p[2]]),{pockets:pockets&&i%3===0,bike:zoneId==='campus'&&i%4===2}); } };
    const riders=(n)=>{ if(!/[?&]riders\b/.test(location.search)) return;   /* 2026-10-11 使用者回報：騎腳踏車的人其實是「坐姿的人＋腳踏車」一起平移，腳沒踩踏板、看起來像人和車重疊。正式的騎車要 Blender 騎車動作（手握把手、腳踩踏板、曲柄轉動），做好之前不放會動的騎士（網址加 ?riders 才看得到舊的）；停著的腳踏車不受影響 */ const rs=bikeRoutes[zoneId]||[]; for(let i=0;i<n&&rs.length;i++){ GM.spawnRider(extraSpec(xi+++20),rs[i%rs.length],['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][i%4]); } };
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
    if(zoneId==='cafe'){ const seats=E.zone.seats; if(hr>=19&&hr<23){ GM.spawnNPC('sis',C.sis,0,0,{seat:seats[5],pose:'read',talk:n=>talkSis(GM,n)}); GM.npc.sis.idlePose='read'; tm('sis',23); } for(const i of [6]){ const o=CHAR.build(extraSpec(xi++)); const s=seats[i]; o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true}); } if(F.companion==='an') spawnCompanion(GM); }
    /* 店員（2026-10-11 使用者回報：便利商店、麵店、書店都沒有人顧店）：站在櫃台後面、工作台前；只是讓店有人在顧，不加對話和劇情（結帳還是櫃台的互動點）。
       外觀用路人模型（extraSpec：偶數＝女性、奇數＝男性）；年紀比較大的老闆娘、老闆要等有中年人物模型（MISSING_EXTERNAL_ART）*/
    { const clerk=(x,z,yaw,i)=>{ const o=CHAR.build(extraSpec(i)); o.position.set(x,0,z); o.rotation.y=yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true}); };
      if(zoneId==='cvs') clerk(4.0,-2.35,0,41);              // 櫃台（(4,-1.5)、寬 3 m）後面，面向結帳的客人
      if(zoneId==='noodle') clerk(-2.0,-2.75,Math.PI,40);    // 廚房工作台前，面向湯鍋
      if(zoneId==='bookstore') clerk(0.55,1.95,0,43); }      // 門口那張桌子（像櫃台）後面，面向門口
    if(zoneId==='noodle') noodleRegulars(GM,true);   /* 週二、週四傍晚的固定客人（AA_110 6-3）：進店時已經坐著 */
    if(zoneId==='noodle'){ if(F.afternoonDone&&hr>=17.5&&hr<20.5&&!F.zheNoodleDone){ GM.spawnNPC('zhe',C.zhe,0,0,{seat:{x:0,z:-0.3,yaw:0},talk:n=>talkZhe(GM,n)}); F.zheAtNoodle=true; } }
    if(zoneId==='dorm'){ if(hr>=18||hr<8){ GM.spawnNPC('kai',C.kai,0,0,{seat:{x:1.8,z:2.2,yaw:Math.PI},talk:n=>talkKai(GM,n)}); } }
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
    const hr=h(G), wd=G.weekday; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, hol=!!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(G.day));
    const hit=ent=>{ if(!ent.days.includes(wd)) return false; if((ent.act==='class'||ent.noHoliday)&&(!T||hol)) return false; if(ent.weeks&&(!T||!ent.weeks.includes(T.week))) return false; const to=ent.to;   /* weeks：學期的第幾週才有（子晴的吉他社：第 5～7、10～16 週）*/ return to<=24?(hr>=ent.from&&hr<to):(hr>=ent.from||hr<to-24); };
    const L=c.daily_schedule||[]; for(const ent of L) if(ent.terms&&T&&ent.terms.includes(T.id)&&hit(ent)) return ent; for(const ent of L) if(!ent.terms&&hit(ent)) return ent; return null; }
  S.schedEnt=schedEnt;
  function schedFor(id,zoneId,G){ const c=CHARACTERS[id], F=G.flags, hr=h(G), wd=G.weekday; if(!c) return null; if(c.presence&&!S.present(id,G)) return null;   /* 這學期不在學校（presence，AA_110 第 3 節）*/
    if(LEGACY_IDS.includes(id)){ if(!F.afternoonDone||F.classNow) return null; const al=LEGACY_ALIAS[id]||id; if(F.companion===al) return null; }
    if(c.social_layer==='E'&&typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ const w=CLS.profWhere(G,id); if(!w) return null; if(w.zone==='classroom'&&zoneId==='classroom') return {prof:'class',until:null}; if(w.zone==='wancai'&&zoneId==='wancai') return {prof:'wancai'}; return null; }   /* 課表（D52）：上課時在教室、下課後 1.5 小時在萬才館 */
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
      else if(act==='barista'){ n=GM.spawnCharacter(id,-2.5,-5.15,{yaw:0,pose:'idle'}); if(n){ n.frozen=true; n.talkLabel='和店員說話'; } }
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
    for(const id in CHARACTERS){ if(EVENTS.npcOf(id)) continue; const ent=schedFor(id,zoneId,G); if(!ent) continue; let n=null;
      if(refresh&&typeof ent.to==='number'&&typeof ent.from==='number'&&(ent.to<=24?ent.to-hr:(hr>=ent.from?ent.to-hr:ent.to-24-hr))<0.25) continue;   /* 待在區域裡補人：時段剩不到 15 分鐘的不補（劇情場景擋住補人時，結束後同學在座位上憑空出現、一分鐘後又起身離開——v9.6 回歸 flow_class_real）*/
      if(ent.prof==='class'){ const ts=E.zone.teacherSpot||{x:-1.5,z:-4.4}; n=GM.spawnCharacter(id,ts.x,ts.z,{yaw:0,pose:'idle'}); if(n) n.frozen=true; }
      else if(ent.prof==='wancai'){ n=GM.spawnCharacter(id,-5,1.2,{yaw:0,pose:'idle'}); if(n) n.frozen=true; }
      else n=spawnAt(id,ent);
      if(n) n.sched=true; }   /* sched：照行程出現的人（時段結束時 refreshSchedule 會讓他離開；劇情裡生出來的人不算） */
    if(refresh) return;   /* 待在區域裡補人：不重排不熟同學、不把已經在的人搬到朋友旁邊（pairUp 會瞬移） */
    // 不熟同學 pool：教室（上課時）、圖書館、校園各幾位（固定分配，讓玩家會重複看到同一批人）
    const poolIds=Object.keys(CHARACTERS).filter(id=>id.startsWith('pool_')); const pick=(from,n)=>poolIds.filter((_,i)=>i%5===from).filter(id=>S.present(id,G)).slice(0,n);   /* 畢業的不出現（AA_120 7-3：presence until）；分配不變 */
    if(zoneId==='classroom'&&(GM.G.flags.classNow||(typeof CLS!=='undefined'?CLS.liveIn(G,'classroom').length>0:((wd===4&&hr>=12.5&&hr<15.2)||(wd===2&&hr>=9.9&&hr<12.2))))){ for(const id of pick(1,3)) spawnAt(id,{act:'class'}); }   /* 上課時間照課表（D52）*/
    if(zoneId==='library'&&hr>=8&&hr<22){ for(const id of pick(2,2)) spawnAt(id,{act:'read'}); }
    if(zoneId==='campus'&&hr>=8&&hr<19){ for(const id of pick(3,2)) spawnAt(id,{act:'wander'}); }
    if(zoneId==='cafe'&&hr>=11&&hr<23){ for(const id of pick(4,1)) spawnAt(id,{act:'read'}); }
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
  // 與資料驅動人物對話：先看事件，再閒聊；名字依揭露階段
  S.talkCharacter=async function(id,n){ const G=GM_ref.G; const first=!SOCIAL.has(id,'FIRST_MET'), unmetH=first&&/^heroine_0[1-5]$/.test(id); if(!unmetH) SOCIAL.talkedTo(id);   /* 還沒見過的女主角：搭話不算認識——不加熟悉度、不揭露名字（AA 2026-10-13 P1-1：原本搭話一次名字就出現在按鈕上）；她的相遇事件自己會記（SOCIAL.meet）*/ if(EVENTS.onInteract(id)){ n.name=SOCIAL.displayName(id); n.talkLabel='和'+n.name+'說話'; return; }
    if(typeof INV!=='undefined'){ const iv=INV.meetable(G,id); if(iv){ await INV.meet(GM_ref,iv,n); n.name=SOCIAL.displayName(id); n.talkLabel='和'+n.name+'說話'; return; } }   /* 約好的時間在約好的地方：見面 */
    const GM=GM_ref; GM.sceneBegin({adv:id}); const E=GM.E; if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,n.obj); const c=CHARACTERS[id]; const who={name:SOCIAL.displayName(id),obj:n.obj,charId:id,pose:n.pose};
    /* 五位女主角的第一次見面是專屬的事件（AA_120 3-1，AA、BB 2026-10-13：只算五位女主角）：還沒見過時被搭話不走一般自我介紹、不記 FIRST_MET，只有一句旁白；舊存檔已經記下的不追溯 */
    if(unmetH){ const busy=n.seat||n.pose==='read'||n.pose==='sit'||n.idlePose==='read'; await GM.say(null,busy?'（她低頭在忙自己的事，沒有注意到你。）':'（她看了你一眼，對你點了一下頭，又轉回去忙自己的事。）'); n.name=SOCIAL.displayName(id); n.talkLabel='和'+n.name+'說話'; GM.sceneEnd(); return; }
    if(first){ SOCIAL.meet(id,G.zone); if(c.social_layer==='B'){ const py=SOCIAL.playerYear?SOCIAL.playerYear():1, cy=SOCIAL.yearOf?SOCIAL.yearOf(id):(c.year||1); await GM.say(who,cy>py?'「你是大'+['','一','二','三','四'][py]+'的吧？」':(py===1?['「……嗯？喔，你是我們班的吧。」','「你好。……我們是不是修同一堂民總？」','「欸，你是周老師點過的那個。」'][(Math.random()*3)|0]:'「……嗯？喔，你是我們班的吧。」'));   /* 年級跟著遊戲走（AA_120 7-3）*/   /* 學長姊不會說「同一堂民總」（AA_120 3-4）*/ await GM.say(who,'「我是'+c.name+'。」'); if(c.facts&&c.facts[0]) await GM.say(who,'「'+c.facts[0]+'。……你呢？」'); } else { await GM.say(who,'「你好，我是'+c.name+'。'+(c.department||'')+'的。」',{expr:'smile'}); if(c.personality) await GM.say(null,c.personality.split('；')[0]+'。'); } SOCIAL.adjust(id,{fam:3}); }
    else { const rv=SOCIAL.reveal(id); if(c.social_layer==='B'&&rv==='ACQUAINTANCE'&&c.facts&&c.facts[1]&&S.secretReady(G,id)&&!SOCIAL.has(id,'SHARED_SECRET')){ await GM.say(who,'「其實……'+String(c.facts[1]).replace(/^其實/,'')+'。沒跟很多人講過。」'); SOCIAL.remember(id,'SHARED_SECRET',c.facts[1]); SOCIAL.adjust(id,{fam:4,trust:4}); const SM=G.social.small||(G.social.small={}); (SM[id]||(SM[id]={day:0,used:[],last:null})).day=G.day; }
      else { const L=S.smallTalk(G,id); if(L.say) await GM.say(who,L.say,{expr:'smile'}); else await GM.say(null,L.narr); if(L.fresh) SOCIAL.adjust(id,{fam:1}); } }
    if(!first&&typeof INV!=='undefined'&&INV.canInvite(G,id)&&!(G.invites||[]).some(v=>v.who===id&&v.state==='going')){ const k=await GM.choose([{t:'約'+(c.gender==='f'?'她':'他')+'去…',hint:'Café、總圖、吃飯、散步'},{t:'就這樣'}]); if(k===0) await INV.flow(GM,id,n,true); }   /* 當面約（使用者第 3 點；src/invites3d.js）*/
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
    lingerMove(GM,zoneId);
    const P=E.player.obj.position, hr=h(G); for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n) continue; const gone=(n.sched&&n.charId===id&&!schedFor(id,zoneId,G))||(n.until!=null&&hr>=n.until); if(!gone) continue;
      if(G.flags.companion&&id===G.flags.companion) continue; const o=n.obj.position, d=Math.hypot(o.x-P.x,o.z-P.z), vis=inView(E,o);
      /* 2026-10-13 使用者試玩：「林芷若第一次講完話直接消失在校園，本來在我前面」——時段結束時只要鏡頭沒對著她就拿掉（玩家一轉頭人就不見了）。
         改成：還在附近的人先走到最近的門口／出口，走到了才離開（進了那棟樓、走出這一區）；已經在遠處又看不到的照舊直接離開 */
      if(n.leaving){ if(n.arrived||(d>=30&&!vis)) GM.removeNPC(id); continue; }
      if(d>=12&&!vis){ GM.removeNPC(id); continue; }
      if(walkAway(GM,n)) continue;
      if(d<12&&vis) continue; GM.removeNPC(id); } }
  /* 同一區、下一個時段是「在某個位置站一下」（linger，例：芷若經原 12:10 下課後走到 101 門口的走廊，12:40 才去吃飯）：已經在場的人（坐在教室裡）起身走過去，不瞬移；
     走不到就留在原地（下一個時段照常離開）。進區域時才生出來的人直接站在那裡（spawnAt）*/
  function lingerMove(GM,zoneId){ const E=GM.E, G=GM.G; for(const id of Object.keys(GM.npc)){ const n=GM.npc[id]; if(!n||!n.sched||n.leaving||n.lingerGo||n.charId!==id) continue; const ent=schedFor(id,zoneId,G); if(!ent||ent.act!=='linger'||!ent.at) continue;
      const [x,z,yaw,lv]=ent.at; if(Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<0.6&&(n.lv|0)===(lv|0)) continue; if(n.lingerFail===ent) continue;
      if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; n.lingerGo=true;
      if(!E.moveTo(n,x,z,()=>{ n.lingerGo=false; n.obj.rotation.y=yaw||0; n.pose=n.idlePose='idle'; },lv|0)){ n.lingerGo=false; n.lingerFail=ent; } } }
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
  S.noodleOn=function(G){ if(typeof CALENDAR==='undefined') return false; const h=G.hour%24, wd=CALENDAR.dateOf(G.day).wd; return (wd===2||wd===4)&&CALENDAR.kind(G.day)==='term'&&h>=17.5&&h<19; };
  S.noodleCount=G=>{ let sd=(G.day*7919+13)%2147483646+1; sd=(sd*16807)%2147483647; return 2+Math.floor(((sd-1)/2147483646)*3); };
  let ndlLastH=null;
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
    if(typeof CROWD!=='undefined'){ try{ CROWD.tick(GM,dt); }catch(e){ console.warn('CROWD.tick',e); } }   /* 公共場景的人流（D55）*/
    if(typeof INV!=='undefined'){ try{ INV.tick(GM); }catch(e){ console.warn('INV.tick',e); } }   /* 邀約：過了時間沒見到＝沒赴約 */
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
    if(it.deskStudy){ await deskScene(GM,it); return true; }
    if(it.roomItems){ await roomItems(GM); return true; }
    if(it.sleep){ await bedScene(GM); return true; }
    if(it.counter==='cafe'){ await counter(GM,'兩點半 Café',[['拿鐵',120,10],['手沖咖啡',150,12],['檸檬塔',110,14]]); return true; }
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
  async function counter(GM,shop,items){ const G=GM.G; GM.sceneBegin(); const opts=items.map(([n,p,e])=>({t:n+'　'+p+' 元',hint:'體力 +'+e,dim:G.money<p})); opts.push({t:'不用了'}); const i=await GM.choose(opts); if(i<items.length){ const [n,p,e]=items[i]; if(G.money<p){ GM.toast('錢不夠'); } else { GM.money(-p); GM.energy(e); GM.advance(0.15); await GM.say(null,'你買了'+n+'。'+(shop==='兩點半 Café'?'店員把杯子放在你面前的時候，杯底和木桌碰出一聲很小的響。':'')); } } GM.sceneEnd(); }
  async function bookshop(GM){ const G=GM.G, F=G.flags; GM.sceneBegin(); const opts=[{t:'《民法總則》教科書　650 元',hint:F.textbook?'已經有了':'讀書時會多整理一條筆記',dim:F.textbook||G.money<650},{t:'螢光筆一組　80 元',hint:'讓筆記好看一點',dim:G.money<80},{t:'只是看看'}]; const i=await GM.choose(opts); if(i===0&&!F.textbook&&G.money>=650){ GM.money(-650); F.textbook=true; GM.memo('買了民法總則教科書'); await GM.say(null,'很厚。老闆說一年級都會買，然後大部分人到期末都只翻到第三章。'); } else if(i===1&&G.money>=80){ GM.money(-80); GM.toast('買了螢光筆'); } else if(i===2){ await GM.say(null,'架上有一整排判決彙編。有人在角落翻著《法律人的第一堂課》。'); } GM.sceneEnd(); }
  // ---------- 第一天：宿舍 ----------
  async function introDorm(GM){ const G=GM.G, F=G.flags, E=GM.E; GM.sceneBegin(); GM.letterbox(true); await GM.titleCard('第一天','週三 21:12 · 男生宿舍',2600); await GM.say(null,'你是{name}，台大法律系一年級。開學第三週。'); await GM.say(null,'書桌上放著明天民法總則要討論的案例——網拍上標價 1,000 元的相機。老師上週說：「會點人。」'); /* 交接包 v1 第 1 節（AA_12 0-3 第 1 點、0-2）＋可昕的第一則訊息（BB_95 9-0）*/ for(const t of DAY1_NARR) await GM.say(null,t); await kexinFirstMsg(GM,'night'); const kai=GM.npc.kai; if(kai){ GM.cine('two',E.player.obj,kai.obj); ADV.begin({background:'blur',right:'kai'}); await GM.say(kai,'欸，你們法律系是不是每堂課都要先讀一堆東西？',{expr:'smile'}); const i=await GM.choose([{t:'差不多。明天有個案例還沒看。'},{t:'還好，看心情。'}]); if(i===0){ await GM.say(kai,'那你快看啊，我要開遊戲了，等一下會很吵。'); } else { await GM.say(kai,'心情好就會被點到，我室友上學期就是這樣。',{expr:'laugh'}); } GM.rel('kai',2); } GM.letterbox(false); familyGroupD1(GM); F.introDone=true; GM.setGoal('讀（或不讀）明天的案例，然後睡覺'); GM.sceneEnd(); GM.autosave(); }
  /* ---------- 交接包 v1：第一天的旁白、可昕的第一則訊息、家族群組、房間物件、手機的規則 ---------- */
  const DAY1_NARR=['以前遇到事情，他會去翻民法。翻得到條文，卻不知道條文和條文怎麼接起來，也不知道怎麼用在一件真的事情上。','這次不一樣。這次有人要教他怎麼讀。','經濟系的那一年，他不是一個人過的。'];   /* AA_12 0-3 第 1 點、0-2 */
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
  S.phoneRules=function(GM){ const G=GM.G, F=G.flags; if(typeof PHONE==='undefined') return; const silentContact=id=>{ if(typeof INV==='undefined') return; INV.rec(G); if(G.contacts[id]==null) G.contacts[id]=G.day; };
    /* 芷若的第一則私訊（BB_95 4-2）：Café 第五次加了店裡的帳號（zhiruoShopContactDay）→ 那天 22:07；交往中改在隔天 15:10＋友情版的第三句（AA_112 8-1：交往中的玩家不收晚上只傳給他的訊息）*/
    if(F.zhiruoShopContactDay!=null&&!PHONE.sent(G,'zr_dm1')){ const d=F.zhiruoShopContactDay, dating=!!F.dating_kexin, Z=t=>({th:'p:heroine_02',from:'heroine_02',text:t});
      PHONE.at(G,dating?d+1:d,dating?15+10/60:22+7/60,[Z('我是 Café 的芷若。'),Z('……你應該知道。'),Z(dating?'你今天的那杯，是我做的。好喝的話，跟老闆說。':'你今天的'+(F.zhiruoFirstOrder||'拿鐵')+'，奶泡我多打了三秒。你沒發現。')],'zr_dm1'); }
    if(G.msgs&&G.msgs.some(m=>m.tag==='zr_dm1')) silentContact('heroine_02');   /* 收到了＝有她的聯絡方式（之後她改用自己的帳號）*/
    /* 語彤事件 3（AA_11 事件 3、BB_95 4-3）：選「我知道誰會知道」→ 祐廷第一次私訊學姊；學姊當晚 22:30 回；祐廷把截圖傳給語彤：「……法服是什麼？」
       （沒有語彤的聯絡方式：下次在麵店當面給她看，ev_yutong_fwd）*/
    if(F.yutongAskSisDay!=null&&!PHONE.sent(G,'sis_yutong_q')){ silentContact('heroine_05'); PHONE.post(G,{th:'p:heroine_05',from:'player',who:null,text:'（把語彤說的事傳給學姊）',tag:'sis_yutong_q'});
      const W=t=>({th:'p:heroine_05',from:'heroine_05',text:t}); PHONE.at(G,F.yutongAskSisDay,22.5,[W('三件事。'),W('一，叫阿姨週三晚上來萬才館，法服有值班。'),W('二，發票、那天的進貨單、監視器的時間，全部留著。'),W('三，叫阿姨先睡覺。這種事，準備好就不可怕。')],'sis_yutong'); }
    if(G.msgs&&G.msgs.some(m=>m.tag==='sis_yutong')&&!F.yutongFwd){ F.yutongFwd=true;
      if(typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')){ PHONE.post(G,{th:'p:heroine_03',from:'player',who:null,text:'（把學姊的回覆截圖傳給語彤）',tag:'yutong_fwd_q'}); PHONE.at(G,G.day,G.hour+0.1,[{th:'p:heroine_03',from:'heroine_03',text:'……法服是什麼？'}],'yutong_fwd'); }
      else F.yutongFwdInPerson=true; } };
  /* 宿舍房間的物件（交接包 v1 第 1 節「房間物件」，AA_12 0-2、0-3）：點了看一句旁白。可昕的物件分開以後的旁白，之後由 AA 補（大一上不會分開）*/
  const ROOM_ITEMS=[['書架上的舊《民法》','以前翻過。看得到字，看不懂意思。'],['經濟學原理（一年前的課本）','經濟系那一年的課本。邊角都翻軟了。'],['寫滿的筆記本','重考那段時間的筆記。一半是他的字，一半是她的。'],['摩天輪的票根（夾在桌墊下）','摩天輪的票根。兩個人開始交往的那一天。'],['手機相簿的一張照片','河堤邊停著幾台腳踏車。那一群人，那一年。']];
  S.ROOM_ITEMS=ROOM_ITEMS;
  async function roomItems(GM){ GM.sceneBegin(); try{ for(let n=0;n<12;n++){ const i=await GM.choose([...ROOM_ITEMS.map(r=>({t:r[0]})),{t:'不看了'}]); if(i<0||i>=ROOM_ITEMS.length) break; await GM.say(null,ROOM_ITEMS[i][1]); } } finally { GM.sceneEnd(); } }
  S._v1={kexinFirstMsg:(GM,v)=>kexinFirstMsg(GM,v),familyGroupD1:GM=>familyGroupD1(GM),roomItems:GM=>roomItems(GM),phoneScene:(GM,th,l,a)=>phoneScene(GM,th,l,a)};   /* 測試用 */
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
  /* 生活費（D48；2026-10-11 使用者＋AA 的企劃：每月 25,000 元，只用在生活——宿舍、學費、手機家裡另外付；每月 1 日匯進帳戶；額外收入只有過年紅包和可選的打工）。
     遊戲畫面沒有日期：第一天是「開學第三週的週三」＝9/17（9/1 週一開學；AA 2026-10-11 09:28Z 確認），只用來算「每月 1 日」；企劃的週曆改了就改 CAL0。
     開局：帳戶約 20,000＋錢包約 2,000（game3d.js defaults 的 money 22000；S.newGame 設 fundsV2）。舊存檔（沒有 fundsV2）：下一個早上補帳戶裡的 20,000 元一次——
     讀檔本身不改錢（tests/save_compat_v7.py 檢查讀檔前後金錢一樣）。睡覺一次只過一天，所以「換月份的第一個早上」就是 1 日。測試：node tests/allowance_unit.js */
  const CAL0={m:9,d:17}, MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
  S.dateOf=function(day){ let m=CAL0.m, d=CAL0.d+(day-1); while(d>MDAYS[m-1]){ d-=MDAYS[m-1]; m=m%12+1; } return {m,d}; };
  S.monthlyFunds=function(G){ const F=G.flags, mo=S.dateOf(G.day).m; if(F.fundsV2!==1){ F.fundsV2=1; F.allowanceMonth=mo; return {amount:20000,text:'帳戶裡還有這個月的生活費：20,000 元'}; }
    if(F.allowanceMonth!==mo){ F.allowanceMonth=mo; return {amount:25000,text:'家裡匯來這個月的生活費：25,000 元'}; } return null; };
  S.sleepNow=(GM,wake,alarm)=>sleepNow(GM,wake,alarm);   /* 測試用（tests/bed_nap_unit.js）*/
  async function sleepNow(GM,wake,alarm){ const G=GM.G, F=G.flags, E=GM.E; GM.sceneBegin(); await GM.fade(true); await GM.sleep(400); G.day++; G.weekday=(G.weekday+1)%7; G.energy=Math.min(100,G.energy+65); G.weather=Math.random()<0.7?'clear':(Math.random()<0.7?'cloudy':'rain'); E.setWeather(G.weather); F.companion=null; F.nightKai=false;
    if(G.day===2){ G.hour=13.05; E.hour=G.hour; GM.sceneEnd(); await GM.titleCard('第二天','週四 13:05 · 霖澤館前',2400); await GM.enter('campus',{x:26,z:-90,yaw:Math.PI}); return; }
    G.hour=wake!=null&&G.day>=3?wake:7.5; E.hour=G.hour; F.morningLine=false;   /* 醒來的時間（AA_110 6-5）：沒給＝07:30（舊行為）*/ if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined') CLS.setGoal(GM); else GM.setGoal(isThu(G)?'13:20 民法總則（霖澤館）':'自由的一天。去圖書館、公館，或找人聊天'); GM.sceneEnd(); await GM.titleCard('第 '+G.day+' 天',['週日','週一','週二','週三','週四','週五','週六'][G.weekday]+' '+hm(G.hour)+(alarm?'・鬧鐘：'+alarm:''),2200); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); { const f=S.monthlyFunds(G); if(f){ GM.money(f.amount); GM.toast(f.text,3800); } }   /* 生活費（D48）：S.monthlyFunds */ if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ await CLS.morning(GM); }catch(e){ console.warn('CLS.morning',e); } } if(!F.KX_FIRST_MSG&&F.dating_kexin){ GM.sceneBegin(); try{ await GM.say(null,'經濟系的那一年，他不是一個人過的。'); await kexinFirstMsg(GM,'morning'); } finally { GM.sceneEnd(); } }   /* 舊存檔（BB_95 9-0）：已經過了第一天、沒看過可昕的訊息的，下一個早上補一次；只補一次 */ GM.autosave(); }
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
    await GM.fade(true); GM.advance(17.7-G.hour); await GM.fade(false); GM.cine('wide',P.obj,an.obj); await GM.say(null,'窗外的光慢慢變成橘色。巷子裡有機車經過，吧檯的磨豆機響了一聲。'); await GM.say(an,'我再待一下，你先走吧。'+(F.zheInvite?'阿哲不是約你吃麵？':'')+'',{expr:'smile'}); await GM.say(an,'今天……謝謝。'); F.afternoonDone=true; F.companion=null; GM.memo('和小安在兩點半 Café 待到黃昏'); SOCIAL.remember('heroine_01','CAFE_AFTERNOON','聊了報告和為什麼念法律'); SOCIAL.remember('heroine_01','WALKED_TOGETHER','從法學院走到溫州街'); SOCIAL.adjust('heroine_01',{fam:8,trust:5,comf:6}); GM.standUp(P); an.talk=n=>talkAn(GM,n); an.frozen=true; GM.letterbox(false); GM.sceneEnd(); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'今晚去公館吃點東西，或回宿舍'); GM.autosave(); }
  async function libraryScene(GM){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const an=GM.npc.an; if(!an) return; GM.sceneBegin(); GM.letterbox(true); an.beh='idle'; const seats=E.zone.seats; const sA=seats[0], sB=seats[1]; await Promise.all([GM.walkTo(P,sA.x,sA.z-0.7,{lv:sA.lv}),GM.walkTo(an,sB.x,sB.z+0.7,{lv:sB.lv})]); GM.sitAt(P,sA); GM.sitAt(an,sB); await GM.sleep(400); GM.advance(0.3);
    GM.cine('two',P.obj,an.obj); ADV.begin({background:'blur',right:'heroine_01'}); await GM.say(null,'二樓靠牆的長桌。翻書的聲音、有人把水壺放下的聲音。她把聲音壓得很低。'); GM.cine('ots',P.obj,an.obj); await GM.say(an,'（小聲）那個賣家——少打一個零的那個。你覺得法律應該保護他嗎？'); const hasNote=GM.hasNote('law_88'); const i=await GM.choose([{t:'應該。交易要有誠信，但不能讓人因為一個手誤就賠十倍。',key:'A'},{t:'不應該。錯誤是自己造成的。',key:'B'},{t:'看情況。八十八條「無過失」才能撤銷。',key:'C',hint:hasNote?'你的筆記裡有':'需要讀過 §88',dim:!hasNote}]); let key=['A','B','C'][i]; if(key==='C'&&!hasNote){ await GM.say(null,'你想引條文，但想不起來是哪一條。'); key='A'; } F.cafeView=key; G.choices.cafeView=key; GM.cine('close',P.obj,an.obj); if(key==='A') await GM.say(an,'（小聲）我也這樣想。可是那買家沒做錯事啊。'); else if(key==='B'){ CHAR.setExpr(an.obj,'surprise'); await GM.say(an,'（小聲）好狠。……但我懂。'); } else { CHAR.setExpr(an.obj,'smile'); await GM.say(an,'（小聲）對，「無過失」。我的結論就想寫這個。'); GM.rel('an',2); F.cafeHelp=true; }
    GM.cine('two',P.obj,an.obj); await GM.say(an,F.whyWalkNew?'（小聲）剛剛路上你說「說來話長」。……小聲講，可以講短一點。':'（小聲）剛剛路上那個問題……小聲講，可以講短一點。');
    const k=await GM.choose([{t:'小時候遇到事情就去翻民法。翻得到，看不懂。',key:'curious'},{t:'我念過一年經濟。後來比較想知道事情「應該」怎麼處理。',key:'econ'},{t:'想幫身邊的人把事情弄清楚。',key:'help'},{t:'還在找怎麼說。但是我自己選的。',key:'own'}]); whyLawChosen(G,F,k);   /* 總圖的小聲版（D60）*/
    if(F.whyLaw==='curious') await GM.say(an,'（小聲）……小時候？那你很誠實。',{expr:'smile'});
    else if(F.whyLaw==='econ'){ await GM.say(an,'（小聲）所以你比我大？'); await GM.say(ME(G),'一歲。'); await GM.say(an,'（小聲）……學長。',{expr:'smile'}); await GM.say(ME(G),'不要。'); }
    else if(F.whyLaw==='help') await GM.say(an,'（小聲）這個理由我喜歡。',{expr:'smile'});
    else await GM.say(an,'（小聲）「自己選的」。……好。',{expr:'smile'}); GM.rel('an',3);
    await GM.fade(true); GM.advance(17.7-G.hour); await GM.fade(false); await GM.say(null,'窗外的光變成橘色，照在書架上。'); await GM.say(an,'（小聲）我再待一下。今天……謝謝。',{expr:'smile'}); F.afternoonDone=true; F.companion=null; GM.memo('和小安在總圖待到黃昏'); SOCIAL.remember('heroine_01','LIBRARY_AFTERNOON','聊了報告和為什麼念法律'); SOCIAL.remember('heroine_01','WALKED_TOGETHER','從法學院走到總圖'); SOCIAL.adjust('heroine_01',{fam:8,trust:5,comf:5}); GM.standUp(P); an.talk=n=>talkAn(GM,n); an.frozen=true; GM.letterbox(false); GM.sceneEnd(); GM.setGoal(F.zheInvite?'18:30 公館 阿鳳麵店（阿哲）':'今晚去公館吃點東西，或回宿舍'); GM.autosave(); }
  // ---------- 麵店 ----------
  async function noodleScene(GM,it){ const G=GM.G, F=G.flags, E=GM.E, P=E.player; const zhe=GM.npc.zhe; GM.sceneBegin(); const opts=[{t:'乾麵　60 元',hint:'體力 +22',dim:G.money<60},{t:'餛飩湯　70 元',hint:'體力 +25',dim:G.money<70},{t:'先不吃'}]; const i=await GM.choose(opts); if(i===2){ GM.sceneEnd(); return; } const cost=i===0?60:70; if(G.money<cost){ GM.toast('錢不夠'); GM.sceneEnd(); return; } GM.money(-cost); await GM.walkTo(P,it.seat.x,it.seat.z+0.5); GM.sitAt(P,it.seat); await GM.sleep(300); GM.advance(0.5); GM.energy(i===0?22:25);
    if(zhe&&zhe.seat&&Math.hypot(zhe.obj.position.x-it.seat.x,zhe.obj.position.z-it.seat.z)<2.5&&!F.zheNoodleDone){ F.zheNoodleDone=true; GM.letterbox(true); GM.cine('two',P.obj,zhe.obj); ADV.begin({background:'blur',right:'zhe'}); SOCIAL.remember('zhe','SHARED_MEAL','阿鳳麵店'); await GM.say(zhe,'來了。我點了滷蛋，你要不要？',{expr:'smile'}); await GM.say(zhe,'所以下午你跟小安去哪了？我在球場看到你們往校門走。'); const j=await GM.choose([{t:F.plan==='library'?'總圖。她在寫民總報告。':'溫州街的咖啡廳。她在寫民總報告。'},{t:'沒有啊，剛好同路。'}]); if(j===0){ await GM.say(zhe,'寫報告。嗯哼。',{expr:'laugh'}); await GM.say(zhe,'她上學期就在那間店寫到店員都認識她。你是第一個被帶去的。'); GM.rel('an',1); } else { await GM.say(zhe,'同路。從霖澤館走到校門要「剛好同路」二十分鐘喔。',{expr:'laugh'}); } await GM.say(zhe,'對了，法服在招人。溫學姊——大三那個——說一年級去會被操，但真的學得到東西。'); if(!F.lawclub) GM.addNote('club_law','法律服務社','週三 19:00 萬才館 201。社長溫學姊。阿哲說一年級去會被操。'); GM.memo('和阿哲在阿鳳麵店吃麵'); GM.rel('zhe',3); GM.letterbox(false); GM.setGoal('吃飽了。晚上自由活動，回宿舍睡覺就到明天'); }   /* 2026-10-11 使用者回報：吃完麵目標還停在「阿鳳麵店（阿哲）」，不知道接下來要幹嘛 */
    else { await GM.say(null,i===0?'乾麵很燙。老闆娘多給了一匙肉燥。':'餛飩湯上面漂著一點油蔥。'); }
    GM.standUp(P); GM.sceneEnd(); }
  // ---------- 對話（自由互動）----------
  async function talkAn(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('heroine_01')) return; GM.sceneBegin({adv:'heroine_01'}); SOCIAL.talkedTo('heroine_01'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,n.obj); const isCompanion=F.companion==='an'; if(isCompanion){ const l=[['走吧，還沒到。'],['你走路真的很快。'],['……在想報告要怎麼開頭。']]; await GM.say(n,l[(Math.random()*l.length)|0][0]); }
    else if(!F.afternoonDone&&F.classDone){ await GM.say(n,'嗯？我等一下要去寫報告。'); }
    else if(F.afternoonDone){ if(!F.anAfter){ F.anAfter=true; if(F.cafeView==='C'){ await GM.say(n,'報告我用了你說的那個——「無過失」。老師如果打槍我，就說是你的主意。',{expr:'smile'}); } else if(F.cafeView==='B'){ await GM.say(n,'我後來想了一下你說的「後果自己承擔」。……我把它寫進反方意見了。'); } else { await GM.say(n,'報告寫到一半。你那個「不能賠十倍」的講法，我放在結論。'); } /* 舊版「家裡希望我念」的追問拿掉（D60：舊的四個回答連同反應整組拿掉；舊存檔的 family 照 AA_120 7-5 當 own 讀，沒有追問）*/GM.rel('an',1); } else { const l=['明天要不要一起去總圖？早上人少。','周老師下週說要講錯誤與撤銷，你先看八十八條。','那間咖啡廳的檸檬塔你還沒吃過吧。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } }
    else { await GM.say(n,'你好，我是小安。……同班的，你不記得？',{expr:'normal'}); G.flags.met_an=true; }
    GM.sceneEnd(); }
  async function talkZhe(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('zhe')) return; GM.sceneBegin({adv:'zhe'}); SOCIAL.talkedTo('zhe'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,n.obj); if(n.seat&&G.zone==='noodle'){ await GM.say(n,'坐啊，麵要涼了。',{expr:'smile'}); } else if(!F.classDone&&isThu(G)){ await GM.say(n,'快進去啦，周老師要來了。'); } else if(F.zheInvite&&!F.zheNoodleDone){ await GM.say(n,'六點半，阿鳳麵店，公館那條街上。別忘了。',{expr:'smile'}); } else { const l=['系籃週五練球，你要來嗎？不會打也可以來坐。','公館那家滷味晚上十點後半價。','你知道傅鐘旁邊那棵樹有八十歲了嗎？我也不知道，我亂講的。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'laugh'}); } GM.sceneEnd(); }
  async function talkSis(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('heroine_05')) return; GM.sceneBegin({adv:'heroine_05'}); SOCIAL.talkedTo('heroine_05'); if(!n.seat) if(!n.seat) if(!n.seat) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); GM.cine('two',E.player.obj,n.obj); if(!F.met_sis){ F.met_sis=true; await GM.say(n,'一年級的？我是溫學姊，法律服務社。'+(F.lawclub?'你看過公告了吧？':'萬才館大廳有我們的公告。')); await GM.say(n,'不用現在決定。先把民總讀好——周老師的課你被點過了吧？消息傳很快。'); GM.rel('sis',3); } else { const l=['判決要看事實，不要只背結論。','法服週三晚上。來不來都可以，先來看一次。','總圖三樓的判例彙編，去年被人翻到脫頁。']; await GM.say(n,l[(Math.random()*l.length)|0]); } GM.sceneEnd(); }
  async function talkKai(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('kai')) return; GM.sceneBegin({adv:'kai'}); SOCIAL.talkedTo('kai'); GM.cine('two',E.player.obj,n.obj); if(G.day===1){ await GM.say(n,'案例讀了沒？我等一下要開麥，會很吵。',{expr:'smile'}); } else if(F.afternoonDone&&!F.kaiAsked){ F.kaiAsked=true; await GM.say(n,'今天這麼晚。跟誰出去？'); const i=await GM.choose([{t:'同學。寫報告。'},{t:'沒有啊。'}]); await GM.say(n,i===0?'「寫報告」。好，你們法律系的都很會用這個詞。':'喔。',{expr:'laugh'}); } else { const l=['所以那個賣家可以告嗎？……不能？那法律系在幹嘛。','我明天早八，你走的時候小聲一點。','宿舍網路又斷了，我要去投訴。你們有教這個嗎？']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } GM.sceneEnd(); }
  async function talkYu(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('yu')) return; GM.sceneBegin({adv:'yu'}); SOCIAL.talkedTo('yu'); GM.cine('two',E.player.obj,n.obj); if(!F.met_yu){ F.met_yu=true; await GM.say(n,'你是周老師點的那個！我是小語，坐你前面右邊。',{expr:'smile'}); await GM.say(n,'我參加了三個社團，法服、辯論、還有吉他社。你要不要來吉他社？不用會彈。'); GM.rel('yu',2); } else { const l=['傅鐘旁邊這張椅子早上曬不到太陽，是全校最好的位子。','辯論社下週辯「網拍標錯價要不要出貨」，你要來看嗎？','溫州街的貓你有看到嗎？咖啡廳門口那隻。']; await GM.say(n,l[(Math.random()*l.length)|0],{expr:'smile'}); } GM.sceneEnd(); }
  async function talkProf(GM,n){ const G=GM.G, F=G.flags, E=GM.E; if(EVENTS.onInteract('prof_zhou')) return; GM.sceneBegin({adv:'prof_zhou'}); SOCIAL.talkedTo('prof_zhou'); GM.cine('two',E.player.obj,n.obj); if(F.classAnswer==='good') await GM.say(n,G.name+'。今天回答得不錯。下週的錯誤與撤銷，先看八十八和九十一。'); else if(F.classAnswer==='none') await GM.say(n,G.name+'。案例要讀。下週我還會點你，這不是威脅，是預告。'); else await GM.say(n,'有問題就來研究室。法律不是背的，是想的。'); GM.sceneEnd(); }
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
    const A=P.away||{}; if(P.from&&i<TERM_ORDER.indexOf(P.from)) return {here:false,away:A.before||''}; if(P.until&&i>TERM_ORDER.indexOf(P.until)) return {here:false,away:A[t]||A.after||''};
    if(P.absent&&P.absent.includes(t)) return {here:false,away:A[t]||''}; return {here:true}; };
  S.present=(id,G)=>S.presence(id,G).here;
  S.whereIs=function(GM,id){ const G=GM.G, F=G.flags, hr=h(G), wd=G.weekday; const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; if(!c) return null;
    { const pr=S.presence(id,G); if(!pr.here) return pr.away?{zone:null,act:'',away:pr.away}:null; }
    if(LEGACY_IDS.includes(id)&&(!F.afternoonDone||F.classNow)) return null;
    const ent=schedEnt(c,G); if(!ent) return null; const end=ent.to%24, hh=Math.floor(end), mm=Math.round((end-hh)*60), until=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    if(ent.zone==null) return ent.away?{zone:null,act:ACT[ent.act]||'',away:ent.away,until}:null;   /* 不在遊戲的場景裡（例：在小福吃午餐）*/
    return {zone:ent.zone, room:ent.room||null, act:ent.label||ACT[ent.act]||'', until}; };   /* label：這一筆自己的說法（芷若：「剛下課，在 101 門口」）*/
  return S;
})();
