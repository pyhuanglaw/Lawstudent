/* ===== 目標導航、大地圖、入口標記（2026-10-11）=====
   使用者實機回報：第二天要跟小安去溫州街，但不知道到底在哪（只有左上角一行字）；店面和建築的入口不明顯，要自己走過去試；點小地圖要能放大。
   1. 目標可以帶目的地：GAME.setGoal(文字, {zone, x, z, lv, r, label, name})；沒帶就從文字推算（infer；舊存檔只有文字也算得出來）。
      null＝自由行動（文字裡有「或」的選擇，例如「去圖書館、公館，或找人聊天」），不指路。
   2. 目的地在別的區域：用區域連接（LINKS，只有名字）找下一個要去的區域；出口位置一律用當下區域真正的出口互動點（exit.to），不會和門對不上。
   3. 畫面：左上目標下面的導航條（箭頭指向路線前方約 4 m 的點，旁邊是剩下的路程）；小地圖上畫路線和目的地；點小地圖打開大地圖
      （北朝上、地名、入口、開放時間、目前的路線）。
   4. 入口標記：每個出口互動點上方的名牌（戶外 26 m、室內 12 m 內），導航目的地的那個入口是金色；有開放時間的寫時間或「已閉館」。
   路線用引擎的 A*（E.pathTo，多樓層會經過樓梯）；只在目標或區域改變、或玩家離開路線 5 m 以上（最多每 2 秒一次）才重算——校園很大，A* 不每幀算。
   設定裡可以關掉（S.guide=false：導航條、路線、金色入口都不顯示；入口名牌照樣有）。 */
'use strict';
const GUIDE=(function(){
  const $=id=>document.getElementById(id);
  let GM=null, E=null;
  // 區域之間怎麼走（只有名字；第一步一定用當下區域真正的出口）。宿舍走廊（dorm_hall）還在開發分支外，存在時才會用到
  const LINKS={ dorm:['campus','dorm_hall'], dorm_hall:['campus','dorm'], campus:['gongguan','linze','wancai','library_hall','dorm','dorm_hall','gongtong','putong','boya','soclib'], gongtong:['campus'], boya:['campus'], putong:['campus'],   /* 博雅：校園上還沒有門（位置等使用者決定），只連出去 */
    gongguan:['campus','wenzhou','cvs','noodle','bookstore'], wenzhou:['gongguan','cafe'], cafe:['wenzhou'], cvs:['gongguan'], noodle:['gongguan'], bookstore:['gongguan'],
    linze:['campus','classroom','linze_3f','linze_202'], classroom:['linze'], linze_202:['linze'], linze_3f:['linze','linze_4f'], linze_4f:['linze_3f'], linze_5f:['linze_4f'], wancai:['campus','lawlib','wancai_multi','wancai_sema'], wancai_multi:['wancai'], wancai_sema:['wancai'], lawlib:['wancai'], library_hall:['campus','library','library_b1','library_carrels'], library:['library_hall'], library_b1:['library_hall'], library_carrels:['library_hall'], soclib:['campus'] };
  const ELEV={ library:['library_hall','library_stacks'], library_hall:['library','library_stacks'], library_stacks:['library_hall','library'], linze:['linze_3f','linze_4f'], linze_3f:['linze','linze_4f'], linze_4f:['linze','linze_3f'], linze_5f:['linze','linze_3f','linze_4f'] };   // 搭電梯可以到的別的區域（總圖：閱覽室 ⇄ 大廳；霖澤館 1F、2F ⇄ 3F、4F，LINZE-34F-TABLES-1020；5F 研究室只能往下，往 5F 要學姊開門，不指路）
  const st={ key:'', route:null, routeKey:'', reT:0, tgt:null, info:null, uiT:0, markers:[], markerZone:null, view:null, open:false, tipT:0, bmImgs:[] };

  /* ---------- 目的地推算（舊存檔、沒有明確給目的地的目標）----------
     順序有意義：先看「或」的選擇（自由行動）、再看閉館（「總圖要閉館了」：離開總圖，不是指進去）、睡覺／回宿舍（「睡覺（明天 13:20 民法總則）」要指床，不是教室）。
     「或」只算地點／活動之間的選擇（，或…／或回…／或找…／（或…）：「週一或週三 19:00 萬才館：吉他社」是時間的或，照樣指萬才館（v9.5 審查）。
     新增目標文字時，tests/guide_unit.js 會列出每一句推算出來的目的地，沒有對應的要在這裡決定。 */
  const LIB2F={zone:'library_hall',lv:1,x:0,z:0.4,r:3.0,name:'二樓自習區'};
  const RULES=[
    [/，或|或回|或找|（或/, null],
    [/閉館/, {zone:'campus',name:'離開總圖'}],
    [/睡覺|回宿舍/, {zone:'dorm',label:'睡覺',name:'床（睡覺）'}],
    [/201|民法總則|上課/, {zone:'classroom',name:'法律系館A 201 教室'}],
    [/走出(?:霖澤館|法律系館A)/, {zone:'campus',name:'法律系館A外面'}],
    [/霖澤館|法律系館A/, {zone:'linze',name:'法律系館A'}],
    [/法律學院圖書館|法圖/, {zone:'lawlib',name:'法律學院圖書館'}],
    [/社科院圖書館|辜先生/, {zone:'soclib',name:'社科院圖書館'}],
    [/萬才館|法律系館B/, {zone:'wancai',name:'法律系館B'}],
    [/共同教學館/, {zone:'campus',label:'共同教學館',name:'共同教學館'}],
    [/大一女舍|女舍/, {zone:'campus',label:'大一女舍 A 棟（傳達室）',name:'大一女舍'}],
    [/溫州街|兩點半|Café|咖啡廳/, {zone:'cafe',name:'兩點半 Café'}],
    [/自習區|總圖/, LIB2F],
    [/麵店/, {zone:'noodle',name:'阿鳳麵店'}],
  ];
  function infer(t){ t=String(t||''); if(!t||t==='—') return null; for(const [re,d] of RULES){ if(re.test(t)) return d?Object.assign({},d):null; } return null; }

  /* ---------- 路線 ---------- */
  function exitsTo(zone){ return E.interactables.filter(it=>it.exit&&it.exit.to===zone); }
  function nextZone(from,to){ if(from===to) return to; const first=new Set(E.interactables.filter(it=>it.exit).map(it=>it.exit.to)); if(E.interactables.some(it=>it.elevator)) for(const z of (ELEV[from]||[])) first.add(z);
    const prev={}; const q=[]; for(const z of first){ if(!(z in prev)){ prev[z]=null; q.push(z); } } if(to in prev) return to;
    while(q.length){ const z=q.shift(); for(const n of (LINKS[z]||[])){ if(n===from||n in prev) continue; prev[n]=z; if(n===to){ let c=n; while(prev[c]!==null) c=prev[c]; return c; } q.push(n); } } return null; }
  const P=()=>E.player.obj.position, PLV=()=>(E.player.lv|0);
  // 這個區域裡現在要去的點：{x,z,lv,r,text,exit(互動點)}；null＝已經到了或不用指路
  function target(d){ const G=GM.G, zone=G.zone; if(!d||!zone) return null;
    /* 找人（d.npc，2026-10-13 使用者：「說可以找朋友但朋友在哪啊」）：照他現在的作息決定往哪一區走；在同一區、人在場就指到他身上（他走動也跟著）*/
    if(d.npc&&typeof STORY!=='undefined'&&STORY.whereIs){ const w=STORY.whereIs(GM,d.npc); if(w&&w.zone&&w.zone!==d.zone) d=Object.assign({},d,{zone:w.zone});
      if(zone===d.zone&&typeof EVENTS!=='undefined'&&EVENTS.npcOf){ const n=EVENTS.npcOf(d.npc); if(n&&n.obj&&E.npcs.includes(n)) return {x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0,r:2.2,text:d.name||''}; } }
    if(zone===d.zone){ if(d.label){ const it=E.interactables.find(i=>i.label&&i.label.indexOf(d.label)===0); if(it) return {x:it.x,z:it.z,lv:it.lv|0,r:Math.max(1.0,(it.radius||1.2)),text:d.name||it.label,it}; }
      if(d.x!=null) return {x:d.x,z:d.z,lv:d.lv|0,r:d.r||2.5,text:d.name||''}; return null; }
    const nz=nextZone(zone,d.zone); if(!nz) return null; let ex=exitsTo(nz); let elev=false;
    if(!ex.length&&(ELEV[zone]||[]).indexOf(nz)>=0){ ex=E.interactables.filter(it=>it.elevator); elev=true; }
    if(!ex.length) return null; const p=P(), lv=PLV();
    ex.sort((a,b)=>(Math.hypot(a.x-p.x,a.z-p.z)+((a.lv|0)!==lv?30:0))-(Math.hypot(b.x-p.x,b.z-p.z)+((b.lv|0)!==lv?30:0)));
    const it=ex[0]; return {x:it.x,z:it.z,lv:it.lv|0,r:Math.max(1.0,(it.radius||1.2)*0.9),text:elev?'搭電梯':it.label,it,via:nz}; }
  function computeRoute(t){ const p=P(); let r=null; try{ r=E.pathTo(p.x,p.z,PLV(),t.x,t.z,t.lv|0); }catch(e){ r=null; } if(!r||!r.length) r=[[t.x,t.z,t.lv|0]];
    st.route=[[p.x,p.z,PLV()]].concat(r.map(q=>[q[0],q[1],q[2]==null?(t.lv|0):q[2]])); st.reT=6.0; st.offT=0; }
  // 玩家在路線上的位置：最近的一段、剩下的長度、前方 ahead 公尺的點
  function along(ahead){ const R=st.route, p=P(); if(!R||R.length<2) return null; let bd=1e9, bi=0, bt=0;
    for(let i=0;i<R.length-1;i++){ const a=R[i], b=R[i+1]; const dx=b[0]-a[0], dz=b[1]-a[1]; const L2=dx*dx+dz*dz||1e-9; let t=((p.x-a[0])*dx+(p.z-a[1])*dz)/L2; t=Math.max(0,Math.min(1,t)); const qx=a[0]+dx*t, qz=a[1]+dz*t; const d=Math.hypot(p.x-qx,p.z-qz); if(d<bd){ bd=d; bi=i; bt=t; } }
    let rem=0; const a=R[bi], b=R[bi+1]; const segL=Math.hypot(b[0]-a[0],b[1]-a[1]); rem+=segL*(1-bt); for(let i=bi+1;i<R.length-1;i++) rem+=Math.hypot(R[i+1][0]-R[i][0],R[i+1][1]-R[i][1]);
    let need=ahead, i=bi, px=a[0]+(b[0]-a[0])*bt, pz=a[1]+(b[1]-a[1])*bt; for(;;){ const c=R[i+1]; const l=Math.hypot(c[0]-px,c[1]-pz); if(l>=need||i+1>=R.length-1){ const k=l>1e-6?Math.min(1,need/l):1; px+=(c[0]-px)*k; pz+=(c[1]-pz)*k; break; } need-=l; px=c[0]; pz=c[1]; i++; }
    return {off:bd,rem:rem+bd,ax:px,az:pz}; }

  /* ---------- 每幀 ---------- */
  function on(){ return !(GM.S&&GM.S.guide===false); }
  /* 目的地在別的區域、而且現在沒開：導航條寫開放時間，不帶路（同一棟裡的總圖大廳 ⇄ 閱覽室不算）*/
  function closedNote(d){ const G=GM.G; if(!d||G.zone===d.zone) return ''; const lib=z=>/^library(_hall|_carrels|_stacks)?$/.test(z); if(lib(G.zone)&&lib(d.zone)) return ''; const o=PLACES.hours[d.zone]; if(!o||(o.open==null&&!o.rules)||PLACES.isOpen(d.zone,G.hour%24,G.day)) return ''; return (PLACES.names[d.zone]||'')+' 已閉館・'+(o.rules?PLACES.todayText(d.zone,G.day):'開放 '+o.text); }   /* 法律學院圖書館（D53）：照日期（學期／寒暑假／假日、平日／週末）*/
  function tick(dt){ if(!GM||!E||!E.player||!GM.G) return; const G=GM.G; const d=G.goalDest; st.uiT-=dt; st.reT-=dt;
    const cn=(d&&on()&&!GM.titleIdle)?closedNote(d):''; const t=(d&&on()&&!GM.titleIdle&&!cn)?target(d):null; const key=t?[G.zone,t.x.toFixed(1),t.z.toFixed(1),t.lv].join('|'):'';
    if(key!==st.routeKey){ st.routeKey=key; st.route=null; if(t) computeRoute(t); markGold(t&&t.it); }
    st.tgt=t; let info=null;
    if(t){ if(!st.route) computeRoute(t); info=along(4.0);
      /* 離開路線才重算：8 m 以上、持續 2.5 秒、不在劇情中，最多每 6 秒一次（v9.5 審查：校園兩層的 A* 一次 6–30 ms，原本離開 5 m 就每 2 秒算一次，手機上會固定一頓一頓）*/
      if(info&&info.off>8&&!E.player.busy){ st.offT=(st.offT||0)+dt; if(st.offT>2.5&&st.reT<=0){ computeRoute(t); info=along(4.0); } } else st.offT=0; }
    st.info=info; updateMarkers(dt);
    if(st.uiT>0) return; st.uiT=0.2; drawBar(t,info,cn); }
  function fmtDist(m){ if(m<8) return '就在附近'; if(m<100) return '約 '+(Math.round(m/5)*5)+' m'; return '約 '+(Math.round(m/10)*10)+' m'; }
  function drawBar(t,info,cn){ const el=$('guide'); if(!el) return; if(!t){ if(cn){ el.classList.remove('hide'); $('guideText').textContent=cn; $('guideArrow').style.opacity=0; return; } if(on()&&/自由/.test(GM.G.goal||'')&&!GM.E.indoor&&people().length){ el.classList.remove('hide'); $('guideText').textContent='點右上角的小地圖：看認識的人現在在哪'; $('guideArrow').style.opacity=0; } else el.classList.add('hide'); return; }
    const p=P(); const near=Math.hypot(t.x-p.x,t.z-p.z)<(t.r||1.5)+0.6&&(t.lv|0)===PLV(); el.classList.remove('hide');
    let txt=t.it&&t.it.exit?(near?'按「'+t.it.label+'」':t.it.label):(t.text||'目的地'); if(t.via&&!near){ const gd=GM.G.goalDest; if(gd&&gd.zone!==t.via) txt+='（往'+(PLACES.names[gd.zone]||'')+'）'; }
    if(!near&&info) txt+=' · '+fmtDist(info.rem);
    $('guideText').textContent=txt; const ax=info?info.ax:t.x, az=info?info.az:t.z; const dx=ax-p.x, dz=az-p.z; const yw=E.cam.yaw;   // 鏡頭在玩家 (sin yaw, cos yaw) 那一側：前方 (−sin,−cos)、右方 (cos,−sin)
    const sx=dx*Math.cos(yw)-dz*Math.sin(yw), sy=-dx*Math.sin(yw)-dz*Math.cos(yw); const ang=Math.atan2(sx,sy)*180/Math.PI;
    let a=ang; if(st.ang!=null) a=st.ang+((((ang-st.ang)%360)+540)%360-180); st.ang=a;   /* 角度連續：從 179° 到 -179° 是轉 2°，不是倒轉一圈（CSS transition 會照數字轉）*/
    $('guideArrow').style.transform='rotate('+a.toFixed(1)+'deg)'; $('guideArrow').style.opacity=near?0.35:1;
    const mm=$('minimap'); if(!GM.G.flags.guideTip&&!GM.E.player.busy&&!GM.E.indoor&&mm&&mm.offsetParent!==null&&getComputedStyle(mm).display!=='none'){ GM.G.flags.guideTip=true; GM.caption('提示','左上角的箭頭指向下一個要去的地方，小地圖上的金色線是路線。點右上角的小地圖可以打開整張地圖。',7000); } }
  // 小地圖（game3d.js 的 drawMinimap 在旋轉後的座標系呼叫）：路線＋目的地
  function drawMini(x,nav,cx,cz,scale){ if(!st.tgt||!on()) return; const f=(wx,wz)=>[((wx-nav.ox)/nav.cell-cx-0.5)*scale,((wz-nav.oz)/nav.cell-cz-0.5)*scale]; const R=st.route;
    if(R&&R.length>1){ x.strokeStyle='rgba(255,200,90,0.95)'; x.lineWidth=2.4; x.lineJoin='round'; x.setLineDash([]); x.beginPath(); R.forEach((q,i)=>{ const [u,v]=f(q[0],q[1]); if(i) x.lineTo(u,v); else x.moveTo(u,v); }); x.stroke(); }
    const [u,v]=f(st.tgt.x,st.tgt.z); const Rr=Math.min(x.canvas.width,x.canvas.height)/2-6; const d=Math.hypot(u,v); x.fillStyle='#ffc85a'; x.strokeStyle='rgba(20,24,30,0.9)'; x.lineWidth=1.5; x.beginPath();
    if(d>Rr){ const a=Math.atan2(v,u), t=Rr+1, b=Rr-8; x.moveTo(Math.cos(a)*t,Math.sin(a)*t); x.lineTo(Math.cos(a+0.42)*b,Math.sin(a+0.42)*b); x.lineTo(Math.cos(a-0.42)*b,Math.sin(a-0.42)*b); x.closePath(); }   /* 目的地在小地圖外：邊上畫往外指的箭頭（X77：原本是固定在邊上的金點，看起來像一個永遠走不到的黃點）*/
    else x.arc(u,v,4.5,0,7); x.fill(); x.stroke(); }

  /* ---------- 入口標記 ---------- */
  function exitName(it){ const L=it.label||''; if(it.elevator) return '電梯'; if(/^進入/.test(L)) return L.replace(/^進入\s*/,''); if(/^往/.test(L)) return L; const M={'走出校門':'校門・往公館','回到校園':'首都帝大校門','回公館':'往公館','回宿舍':'男生宿舍'}; if(M[L]) return M[L]; if(/^(離開|走出)/.test(L)) return '出口'; return L; }
  function hoursLine(zone){ const o=PLACES.hours[zone]; if(!o) return ''; const h=GM.G.hour%24; if(o.rules) return (PLACES.isOpen(zone,h,GM.G.day)?'開放・':'已閉館・')+PLACES.todayText(zone,GM.G.day); if(o.open==null) return o.text; return PLACES.isOpen(zone,h)?'開放 '+o.text:'已閉館・開放 '+o.text; }
  function label(text,sub,gold){ const c=document.createElement('canvas'); const x=c.getContext('2d'); const F1='600 40px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif', F2='28px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
    x.font=F1; const w1=x.measureText(text).width; x.font=F2; const w2=sub?x.measureText(sub).width:0; const W=Math.ceil(Math.max(w1,w2)+48), H=sub?104:68; c.width=W; c.height=H+16;
    x.fillStyle=gold?'rgba(255,200,90,0.96)':'rgba(22,26,32,0.80)'; const r=16; x.beginPath(); x.moveTo(r,0); x.lineTo(W-r,0); x.quadraticCurveTo(W,0,W,r); x.lineTo(W,H-r); x.quadraticCurveTo(W,H,W-r,H); x.lineTo(W/2+12,H); x.lineTo(W/2,H+14); x.lineTo(W/2-12,H); x.lineTo(r,H); x.quadraticCurveTo(0,H,0,H-r); x.lineTo(0,r); x.quadraticCurveTo(0,0,r,0); x.fill();
    x.textAlign='center'; x.textBaseline='middle'; x.fillStyle=gold?'#1c1a17':'#fbf6ec'; x.font=F1; x.fillText(text,W/2,sub?34:H/2+1); if(sub){ x.font=F2; x.fillStyle=gold?'#3a2d14':(/閉館/.test(sub)?'#ffb4a0':'#d9d2c4'); x.fillText(sub,W/2,76); }
    const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=2; return {tex,w:c.width,h:c.height}; }
  /* iOS 的 2D canvas 有總記憶體上限（超過整個畫面變黑，BUG-MAPBLACK 的懷疑原因），而且 canvas 的記憶體要等 GC：不用的 canvas 立刻把寬高設 0 釋放 */
  function freeCanvas(c){ if(c&&c.width!==undefined){ try{ c.width=0; c.height=0; }catch(e){} } }
  function dropTex(t){ if(!t) return; const im=t.image; t.dispose(); freeCanvas(im); }
  function clearMarkers(){ for(const m of st.markers){ if(m.spr.parent) m.spr.parent.remove(m.spr); dropTex(m.spr.material.map); m.spr.material.dispose(); if(m.ring){ if(m.ring.parent) m.ring.parent.remove(m.ring); m.ring.geometry.dispose(); m.ring.material.dispose(); } } st.markers=[]; }
  /* 室內出口的地上光圈（2026-10-18 使用者：離開店面不知道出口在哪，出口那一點要有標示，走上去就能按出去）：名牌在出口上方 2 m，鏡頭從裡面往外看常常在畫面外 */
  function addRing(m){ const it=m.it, r=0.62; const mat=new THREE.MeshBasicMaterial({color:0x7fd0d6,transparent:true,opacity:0.6,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,fog:false});
    const ring=new THREE.Mesh(new THREE.RingGeometry(r*0.8,r,40),mat); ring.rotation.x=-Math.PI/2; ring.position.set(it.x,m.y0+0.03,it.z); ring.renderOrder=19; ring.raycast=()=>{}; ring.userData.dyn=true; ring.userData.exitRing=true; E.zone.group.add(ring); m.ring=ring; }
  function buildMarkers(){ clearMarkers(); st.markerZone=E.zone; if(!E.zone||!E.zone.group) return; const indoor=!!E.indoor;
    for(const it of E.interactables){ if(!it.exit&&!it.elevator&&!it.mark) continue;   /* mark：沒有室內、但要讓玩家認得的入口（共同教學館，2026-10-13）*/ if(it.elevator&&!(ELEV[GM.G.zone])) continue; const m={it,gold:null,txt:exitName(it),sub:(it.exit&&!indoor)?hoursLine(it.exit.to):'',spr:null,indoor}; setLabel(m,m.it===goldIt); st.markers.push(m); } }
  function setLabel(m,gold){ if(m.gold===gold&&m.spr) return; const L=label(m.txt,m.sub,gold);     if(!m.spr){ const mat=new THREE.SpriteMaterial({map:L.tex,transparent:true,depthWrite:false,toneMapped:false,fog:false,sizeAttenuation:false}); const s=new THREE.Sprite(mat); s.center.set(0.5,0); s.renderOrder=20; s.raycast=()=>{};   /* 純介面：不參加射線檢測（Sprite 的 raycast 需要 raycaster.camera，對整個場景做射線時會丟例外——tests/indoor_camera_occlusion.py 抓到）*/ const it=m.it; const nv=E.navOf?E.navOf(it.lv|0):E.nav; const y0=it.y!=null?it.y:(nv?nv.heightAt(it.x,it.z):0); s.position.set(it.x,y0+(m.indoor?2.05:2.6),it.z); s.userData.dyn=true; E.zone.group.add(s); m.spr=s; m.y0=y0; if(m.indoor&&it.exit) addRing(m); }
    else { dropTex(m.spr.material.map); m.spr.material.map=L.tex; m.spr.material.needsUpdate=true; }
    m.w=L.w; m.h=L.h; m.gold=gold; fitMarker(m); }
  // 名牌在畫面上的高度固定（字約 15 px）：sizeAttenuation=false 時 scale 是「距離 1 處的世界尺寸」，換算成畫面像素要看視角與畫面高度
  function fitMarker(m){ const cam=E.camera, vh=(E.h||window.innerHeight||400); const tanH=Math.tan((cam&&cam.fov?cam.fov:50)*Math.PI/360); const px=(m.indoor?0.33:0.38)*(m.gold?1.12:1); const sy=m.h*px/vh*2*tanH; m.spr.scale.set(sy*m.w/m.h,sy,1); m.vh=vh; }
  let goldIt=null; function markGold(it){ goldIt=on()?(it||null):null; for(const m of st.markers) setLabel(m,m.it===goldIt); }
  function updateMarkers(dt){ if(st.markerZone!==E.zone) buildMarkers(); const p=P(), py=p.y; st.hT=(st.hT||0)-dt; const refresh=st.hT<=0; if(refresh) st.hT=5;
    for(const m of st.markers){ const lim=m.it===goldIt?60:(m.indoor?12:26); const d=Math.hypot(m.it.x-p.x,m.it.z-p.z); const vis=d<lim&&d>(m.it.radius||1.2)+0.8&&(m.indoor&&E.levels?(m.it.lv|0)===PLV():Math.abs(m.y0-py)<6)&&!(E.player.busy&&E.cam.mode!=='follow'); m.spr.visible=vis; if(m.ring){ const rv=(E.levels?(m.it.lv|0)===PLV():true)&&d<(m.it===goldIt?60:20)&&!(E.player.busy&&E.cam.mode!=='follow'); m.ring.visible=rv; if(rv) m.ring.material.opacity=0.42+0.22*Math.sin(performance.now()/420); }
      if(vis){ if(m.vh!==(E.h||window.innerHeight)) fitMarker(m); m.spr.material.opacity=Math.min(1,(lim-d)/4); if(m.it===goldIt) m.spr.position.y=m.y0+(m.indoor?2.05:2.6)+Math.sin(performance.now()/380)*0.08; }
      if(refresh&&!m.indoor&&m.it.exit&&PLACES.hours[m.it.exit.to]){ const s=hoursLine(m.it.exit.to); if(s!==m.sub){ m.sub=s; const g=m.gold; m.gold=null; setLabel(m,g); } } }
    hideOverlaps(p); }
  /* 名牌在畫面上疊在一起（LAWWW-C 10-20 截圖：118 巷兩排九間店，往巷子裡看名牌疊成一排、互相蓋住字）：會疊的只留近的，金色（導航目的地）優先。
     sizeAttenuation=false：名牌在畫面上的大小固定＝m.w、m.h 乘 fitMarker 的倍率；錨點在名牌底邊中間（center 0.5,0）*/
  function declutter(L){ L.sort((a,b)=>(b.gold?1:0)-(a.gold?1:0)||a.d-b.d); const kept=[]; for(const r of L){ if(kept.some(k=>r.x0<k.x1+6&&r.x1>k.x0-6&&r.y0<k.y1+4&&r.y1>k.y0-4)){ r.hide=true; continue; } kept.push(r); } return L; }
  function hideOverlaps(p){ const cam=E.camera; if(!cam||!THREE.Vector3) return; const W=E.w||window.innerWidth||800, H=E.h||window.innerHeight||400, L=[], v=new THREE.Vector3();
    for(const m of st.markers){ if(!m.spr.visible) continue; m.spr.getWorldPosition(v).project(cam); if(v.z>1) continue; const k=(m.indoor?0.33:0.38)*(m.gold?1.12:1), w=m.w*k, h=m.h*k, x=(v.x+1)/2*W, y=(1-v.y)/2*H;
      L.push({m,d:Math.hypot(m.it.x-p.x,m.it.z-p.z),gold:m.it===goldIt,x0:x-w/2,x1:x+w/2,y0:y-h,y1:y}); }
    if(L.length>1) for(const r of declutter(L)) if(r.hide) r.m.spr.visible=false; }

  /* ---------- 人物線索（2026-10-11 使用者：自由的那天不知道其他人在哪）---------- */
  function people(){ if(!GM.knownIds||typeof STORY==='undefined'||!STORY.whereIs) return []; const out=[]; for(const id of GM.knownIds()){ const w=STORY.whereIs(GM,id); if(!w||!w.zone) continue; out.push({id,name:SOCIAL.displayName(id),w,text:GM.whereText(id)}); } return out; }
  /* ---------- 大地圖 ---------- */
  function bmImage(nav){ if(nav._bmImg) return nav._bmImg; const img=navImage(nav); nav._bmImg=img; st.bmImgs.push({nav,img}); return img; }   /* 每個導航格只畫一張（原本每打開一次地圖就新開一張 canvas、不釋放）；換區域時釋放舊區域的 */
  function navImage(nav){ const c=document.createElement('canvas'); c.width=nav.cols; c.height=nav.rows; const x=c.getContext('2d'); const img=x.createImageData(nav.cols,nav.rows);
    for(let i=0;i<nav.cols*nav.rows;i++){ const b=nav.b[i]; img.data[i*4]=b?58:196; img.data[i*4+1]=b?64:204; img.data[i*4+2]=b?74:184; img.data[i*4+3]=b?255:255; } x.putImageData(img,0,0); return c; }
  function zoneYaw(){ const def=E.zone&&E.zone.def; return E.indoor?0:((def&&def.sunYaw)||0); }   // 北朝上：公館的區域座標轉過方向（sunYaw）
  function openMap(){ if(!GM||!E||!E.player||GM.titleIdle) return; if(E.player.busy){ GM.toast('現在不能看地圖'); return; }
    const perLv=!!(E.indoor&&E.levels); const lv=perLv?PLV():0; const nav=E.navOf?E.navOf(lv):E.nav; if(!nav) return;   /* 分層只用在室內；戶外（校園的萬才館平台是第 1 層）用地面那一層畫，入口、人、路線都畫 */
    const cv=$('bmCanvas'); $('bigmap').classList.remove('hide'); st.open=true; st.wasPaused=E.paused; E.paused=true;
    const W=cv.clientWidth||360, H=cv.clientHeight||600; const th=zoneYaw(); const wW=nav.cols*nav.cell, wH=nav.rows*nav.cell; const ex=Math.abs(Math.cos(th))*wW+Math.abs(Math.sin(th))*wH, ez=Math.abs(Math.sin(th))*wW+Math.abs(Math.cos(th))*wH;
    const fit=Math.min(W/ex,H/ez)*0.94; const p=P(); st.view={cx:nav.ox+wW/2,cz:nav.oz+wH/2,k:fit,fit,th,lv,perLv,img:bmImage(nav),nav};
    if(!E.indoor&&fit<2.2){ st.view.k=Math.min(3.2,fit*2.2); st.view.cx=p.x; st.view.cz=p.z; }   // 校園很大：先放大到玩家附近，用「－」看全圖
    const zn=PLACES.names[GM.G.zone]||(E.zone.def&&E.zone.def.name)||''; $('bmTitle').textContent=zn+(perLv?'　'+(lv+1)+'F':''); if($('bmNorth')) $('bmNorth').classList.toggle('hide',!!E.indoor); const d=GM.G.goalDest; $('bmSub').textContent=GM.G.goal?('目標：'+GM.G.goal):'';
    if($('bmPeople')){ renderPeoplePanel(); const w=whoShow(st.who,GM.G.goal,GM.G.goalDest); $('bmPeople').classList.toggle('hide',!w.show); if($('bmWho')) $('bmWho').classList.toggle('hot',w.hot); } drawMap(); }
  /* 大地圖的「認識的人現在大概在」（BB-B 10-30：一打開地圖清單就蓋住大半張地圖——直向蓋住大半、共同教學館蓋住「★ 102」、寬螢幕蓋住農業陳列館）：
     預設收起；自由的日子（原本自動打開的時候，使用者 10-11「自由那天根本不知道其他 NPC 在哪」）👥 亮一個點提示；玩家自己按 👥 打開過＝之後打開地圖照樣展開、收起來就照樣收起（st.who）。測試：node tests/bigmap_people_unit.js */
  function whoShow(who,goal,goalDest){ const free=/自由/.test(goal||'')||!goalDest; return {show:who===true,hot:free&&who!==true}; }
  function renderPeoplePanel(){ const el=$('bmPeople'); if(!el) return; const ppl=people(); el.innerHTML='<b>認識的人現在大概在</b>'+(ppl.length?ppl.map(q=>'<div class="row2" style="justify-content:space-between;gap:6px"><span>'+q.name+'：'+q.text+'</span><button class="btn" data-find="'+q.id+'">帶我去</button></div>').join(''):'<div class="muted">'+((typeof STORY!=='undefined'&&STORY.opening?STORY.opening(GM.G):GM.G.day<=2)&&!GM.G.flags.afternoonDone?'第一、二天的劇情還在進行，大家的行程還沒開始':'現在沒有人有固定的行程。去總圖、公館、溫州街走走，說不定會遇到')+'</div>'); el.querySelectorAll('[data-find]').forEach(b=>b.onclick=()=>{ if(GM.findPerson&&GM.findPerson(b.dataset.find)){ st.routeKey='~'; drawMap(); } }); }
  function closeMap(){ $('bigmap').classList.add('hide'); st.open=false; E.paused=!!st.wasPaused; freeCanvas($('bmCanvas')); }   /* 關掉就釋放大地圖畫布（手機 2 倍解析度約 5 MB；下次打開 drawMap 重設大小）*/
  function toScreen(v,W,H,wx,wz){ const dx=wx-v.cx, dz=wz-v.cz, c=Math.cos(v.th), s=Math.sin(v.th); return [W/2+(dx*c-dz*s)*v.k, H/2+(dx*s+dz*c)*v.k]; }
  function drawMap(){ const v=st.view; if(!v) return; const cv=$('bmCanvas'); const dpr=Math.min(2,window.devicePixelRatio||1); const W=cv.clientWidth, H=cv.clientHeight; if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
    const x=cv.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.fillStyle='#1d2127'; x.fillRect(0,0,W,H); const nav=v.nav;
    x.save(); x.translate(W/2,H/2); x.scale(v.k,v.k); x.rotate(v.th); x.translate(-v.cx,-v.cz); x.imageSmoothingEnabled=v.k<4; x.drawImage(v.img,nav.ox,nav.oz,nav.cols*nav.cell,nav.rows*nav.cell); x.restore();
    const S=(wx,wz)=>toScreen(v,W,H,wx,wz); const R=st.route; const ppl=people();
    if(R&&R.length>1&&on()){ x.strokeStyle='rgba(255,190,70,0.95)'; x.lineWidth=4; x.lineJoin='round'; x.lineCap='round'; x.beginPath(); R.forEach((q,i)=>{ if(v.perLv&&(q[2]|0)!==v.lv) return; const [u,w]=S(q[0],q[1]); if(i) x.lineTo(u,w); else x.moveTo(u,w); }); x.stroke(); }
    x.textAlign='center'; x.textBaseline='middle'; const boxes=[]; const free=(u,w,tw,th)=>{ const b=[u-tw/2-2,w-th/2-1,u+tw/2+2,w+th/2+1]; for(const q of boxes){ if(b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]) return false; } boxes.push(b); return true; };
    // 教學館室內的教室（門號、名字；今天的教室金色星號＋幾點哪一門課）：入口以前畫，入口的字和它重疊就不畫（霖澤館「201 階梯教室」的門本來就是入口，不寫兩次）——src/roommap3d.js，ROOM-MAP-LABELS-1030
    if(typeof ROOMMAP!=='undefined') ROOMMAP.drawBig(x,S,GM.G,GM.G.zone,v.perLv?v.lv:null,free);
    // 入口（青色門牌；目的地的入口金色）
    x.font='12px "Noto Sans TC","PingFang TC",sans-serif'; for(const it of E.interactables){ if(!it.exit&&!it.elevator&&!it.mark) continue;   /* mark：沒有室內、但要讓玩家認得的入口（共同教學館，2026-10-13）*/ if(v.perLv&&(it.lv|0)!==v.lv) continue; const [u,w]=S(it.x,it.z); const gold=st.tgt&&st.tgt.it===it&&on(); x.fillStyle=gold?'#ffc85a':'#7fd0d6'; x.strokeStyle='rgba(20,22,26,0.9)'; x.lineWidth=1.5; x.beginPath(); x.rect(u-5,w-5,10,10); x.fill(); x.stroke();
      const nm=exitName(it), hl=(it.exit&&!E.indoor)?hoursLine(it.exit.to):''; const who=it.exit?(ppl.filter(q=>q.w.zone!==GM.G.zone&&(q.w.zone===it.exit.to||nextZone(GM.G.zone,q.w.zone)===it.exit.to)).map(q=>q.name)):[]; if(!free(u,w-14,x.measureText(nm).width,15)&&!gold&&!who.length) continue;
      if(who.length){ x.font='600 12px "Noto Sans TC","PingFang TC",sans-serif'; const wt='👤 '+who.slice(0,3).join('、')+(who.length>3?'…':''); x.lineWidth=3; x.strokeStyle='rgba(20,22,26,0.9)'; x.strokeText(wt,u,w-30); x.fillStyle='#ffd88a'; x.fillText(wt,u,w-30); x.font='12px "Noto Sans TC","PingFang TC",sans-serif'; } x.lineWidth=3; x.strokeStyle='rgba(20,22,26,0.85)'; x.strokeText(nm,u,w-14); x.fillStyle=gold?'#ffd88a':'#cdeff2'; x.fillText(nm,u,w-14); if(hl&&v.k>1.2){ x.font='11px sans-serif'; x.strokeText(hl,u,w+15); x.fillStyle=/閉館/.test(hl)?'#ffb4a0':'#c9c2b4'; x.fillText(hl,u,w+15); x.font='12px "Noto Sans TC","PingFang TC",sans-serif'; } }
    // 地名（入口畫完之後才畫：和別的字重疊、或和附近入口同名的就不畫）
    x.font='600 13px "Noto Sans TC","PingFang TC",sans-serif'; const exitNames=E.interactables.filter(it=>it.exit).map(it=>[exitName(it),it.x,it.z]);
    for(const [n,lx,lz] of (E.indoor?[]:(PLACES.landmarks[GM.G.zone]||[]))){ if(exitNames.some(([en,ex,ez])=>en.indexOf(n)>=0&&Math.hypot(ex-lx,ez-lz)<40)) continue; const [u,w]=S(lx,lz); if(u<-40||u>W+40||w<-20||w>H+20) continue; if(!free(u,w,x.measureText(n).width,16)) continue; x.lineWidth=3.5; x.strokeStyle='rgba(20,22,26,0.85)'; x.strokeText(n,u,w); x.fillStyle='#f3eadb'; x.fillText(n,u,w); }
    // 目的地（同一區域、有位置）
    if(st.tgt&&!st.tgt.it&&on()){ const [u,w]=S(st.tgt.x,st.tgt.z); x.fillStyle='#ffc85a'; x.beginPath(); x.arc(u,w,7,0,7); x.fill(); x.lineWidth=2; x.strokeStyle='#1d2127'; x.stroke(); }
    // 認識的人（黃點）
    for(const n of E.npcs){ if(n.isExtra||!n.obj) continue; if(v.perLv&&(n.lv|0)!==v.lv) continue; const [u,w]=S(n.obj.position.x,n.obj.position.z); x.fillStyle='#e9b96a'; x.beginPath(); x.arc(u,w,4.5,0,7); x.fill(); if(n.name){ x.font='600 12px "Noto Sans TC","PingFang TC",sans-serif'; const tw=x.measureText(n.name).width; if(free(u+7+tw/2,w,tw,14)){ x.textAlign='left'; x.lineWidth=3; x.strokeStyle='rgba(20,22,26,0.9)'; x.strokeText(n.name,u+7,w); x.fillStyle='#ffe2a8'; x.fillText(n.name,u+7,w); x.textAlign='center'; } } }   /* 人名標籤也排隊（free）：會蓋住已經畫的地名、門口、別人的名字就只留點（BB-B 10-30：寬螢幕「總圖書館」被「洪珮瑜」「不認識的女生」蓋住）；測試：node tests/bigmap_people_unit.js */
    // 自己的腳踏車（停在這一區時；src/bike3d.js）：下車走開以後找得到車
    { const bk=typeof BIKE!=='undefined'&&BIKE.parkedAt(GM.G); if(bk&&bk.zone===GM.G.zone&&(!v.perLv||v.lv===0)){ const [u,w]=S(bk.x,bk.z); x.fillStyle='#8fd18a'; x.strokeStyle='rgba(20,22,26,0.9)'; x.lineWidth=1.5; x.beginPath(); x.arc(u,w,6,0,7); x.fill(); x.stroke();
      x.font='600 12px "Noto Sans TC","PingFang TC",sans-serif'; x.lineWidth=3; x.strokeText('🚲 你的腳踏車',u,w-14); x.fillStyle='#d6f5d2'; x.fillText('🚲 你的腳踏車',u,w-14); } }
    // 玩家：位置＋面向（世界的面向 (sin ry, cos ry) 轉到地圖上）
    if(!v.perLv||PLV()===v.lv){ const p=P(); const [u,w]=S(p.x,p.z); const ry=E.player.obj.rotation.y; const fx=Math.sin(ry), fz=Math.cos(ry); const c=Math.cos(v.th), s=Math.sin(v.th); const a=Math.atan2(fx*c-fz*s,-(fx*s+fz*c));
      x.save(); x.translate(u,w); x.fillStyle='rgba(255,255,255,0.18)'; x.beginPath(); x.arc(0,0,16,0,7); x.fill(); x.rotate(a); x.fillStyle='#ffffff'; x.strokeStyle='#d0533f'; x.lineWidth=2; x.beginPath(); x.moveTo(0,-11); x.lineTo(8,8); x.lineTo(0,4); x.lineTo(-8,8); x.closePath(); x.fill(); x.stroke(); x.restore();
      x.font='600 12px sans-serif'; x.lineWidth=3; x.strokeStyle='rgba(20,22,26,0.9)'; x.strokeText('你在這裡',u,w+24); x.fillStyle='#fff'; x.fillText('你在這裡',u,w+24); }
    // 北：在標題列（#bmNorth，openMap 設定；北一律朝上）
    // 目的地在別的區域：說明要先去哪
    const d=GM.G.goalDest, info=$('bmInfo'); if(d&&on()&&st.tgt){ info.textContent=d.zone!==GM.G.zone?('目的地：'+(PLACES.names[d.zone]||d.zone)+'　→ 先到「'+exitName(st.tgt.it||{label:st.tgt.text})+'」（金色）'):('目的地：'+(st.tgt.text||PLACES.names[d.zone]||'')); info.classList.remove('hide'); } else info.classList.add('hide'); }
  function bindMap(){ const cv=$('bmCanvas'); const pts=new Map(); let pinch=null;   /* 每根手指各自記位置：一指拖曳、兩指縮放（以兩指中點平移）*/
    const pan=(dxp,dyp)=>{ const v=st.view; const dx=dxp/v.k, dy=dyp/v.k, c=Math.cos(v.th), s=Math.sin(v.th); v.cx-=dx*c+dy*s; v.cz-=-dx*s+dy*c; };
    const two=()=>{ const [a,b]=[...pts.values()]; return {d:Math.hypot(a.x-b.x,a.y-b.y)||1,mx:(a.x+b.x)/2,my:(a.y+b.y)/2}; };
    cv.addEventListener('pointerdown',e=>{ pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); try{ cv.setPointerCapture(e.pointerId); }catch(err){} if(pts.size===2&&st.view){ const q=two(); pinch={d:q.d,k:st.view.k,mx:q.mx,my:q.my}; } });
    cv.addEventListener('pointermove',e=>{ const p=pts.get(e.pointerId); if(!p||!st.view) return; const v=st.view; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
      if(pts.size>=2&&pinch){ const q=two(); v.k=Math.max(v.fit*0.9,Math.min(12,pinch.k*q.d/pinch.d)); pan(q.mx-pinch.mx,q.my-pinch.my); pinch.mx=q.mx; pinch.my=q.my; drawMap(); return; }
      pan(dx,dy); drawMap(); });
    const up=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    const zoom=f=>{ const v=st.view; if(!v) return; v.k=Math.max(v.fit*0.9,Math.min(12,v.k*f)); drawMap(); };
    $('bmIn').onclick=()=>zoom(1.6); $('bmOut').onclick=()=>zoom(1/1.6); $('bmMe').onclick=()=>{ const v=st.view; if(!v) return; const p=P(); v.cx=p.x; v.cz=p.z; if(v.k<2.2) v.k=Math.min(3.2,Math.max(v.k,2.2)); drawMap(); };
    $('bmClose').onclick=closeMap; if($('bmWho')) $('bmWho').onclick=()=>{ const el=$('bmPeople'); renderPeoplePanel(); el.classList.toggle('hide'); st.who=!el.classList.contains('hide'); $('bmWho').classList.remove('hot'); }; if($('bmTravel')) $('bmTravel').onclick=()=>{ closeMap(); if(GM.openMenu) GM.openMenu('map'); }; $('minimap').addEventListener('click',()=>openMap()); window.addEventListener('resize',()=>{ if(st.open) drawMap(); }); }

  function init(gm){ GM=gm; E=gm.E; bindMap(); }
  function zoneChanged(){ st.routeKey='~'; st.route=null; clearMarkers(); st.markerZone=null; for(const c of st.bmImgs.splice(0)) if(c.nav!==E.nav&&!(E.levels&&E.levels.includes(c.nav))){ freeCanvas(c.img); c.nav._bmImg=null; } else st.bmImgs.push(c); }
  return { init, tick, infer, drawMini, openMap, closeMap, zoneChanged, nextZone:(a,b)=>nextZone(a,b), _st:st, target:d=>target(d), declutter };
})();
