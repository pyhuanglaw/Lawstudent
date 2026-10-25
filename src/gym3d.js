/* 新體育館（綜合體育館）室內 第一階段：大廳＋1F 多功能球場（BB_151；LAWWW2-B 4d19c88d：src/data/gym_layout.js v2＋gym_interior.glb）。
   校園的體育館門口（classes3d.js 的 DOORS.gym）按下去走進來；體育課照舊可以在門口上，也可以在球場中圈「體育課集合」上（同一堂課、同一套出席）。
   3F 主球場（gym_arena，ART-GYM2-INT 2026-10-21）、B1 健身中心與游泳池（gym_b1）都開了：樓梯口的紅龍拿掉，A 字架的告示改成樓層名稱。
   程序化的量體放在 fb（備用模型，dyn）：正式模型載入後整組藏起來；導航、座位、互動點、出口不受影響（和社科院圖書館一樣）。
   畫面上的字（服務台、開館時間、公告欄、樓層指引、樓梯口的告示）照配置檔與 BB_151 查到的開館時間，是設施的說明，不是劇情。 */
const GY3=(function(){
  const L=()=>GYM_LAYOUT;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.8},o||{}));
  const CAMPUS={x:74,z:58.0,yaw:Math.PI};
  /* 1F 大廳 ⇄ 3F 主球場（ART-GYM2-INT）：上樓的點在樓梯口朝大廳那一側（配置的 (−18, 18.6) 在樓梯量體和前牆之間，站不住）；從 3F 下來落在它東邊 0.9 m、面向大廳（不一落地就出「上樓」）*/
  const ARENA_UP={x:-16.0,z:17.4}, ARENA_DOWN={x:-15.1,z:17.4,yaw:Math.PI/2};
  /* 3F 主球場的「看主球場」「大螢幕」（AA_371 第 2 節，企劃線 7eb45d69，AA 定稿）：分平常、典禮的日子。平常的看主球場兩句輪流（每按一次換一句），第二句「有人在睡午覺」只在 11～17 點出（LAWWW 照「看」的做法定：晚上不講午覺）。
     典禮的日子＝典禮的布置打開的時候（z.ceremonyOn）：開學典禮 2025-08-31、畢業典禮 2029-06-02 那天把 SET_CEREMONY 打開（加導航阻擋）是 LAWWW2 的下一步，打開前一律用平常的句子（不讓字說「排滿了折疊椅」、畫面上卻是空球場）。
     AA 的「晚上球場關燈」那句：體育館沒有關燈的時段（燈晚上反而亮），先不用。 */
  const ARENA_LOOK={arena_look:{day:['（三樓的主球場。木頭地板上畫了好幾種顏色的線，籃球、排球、羽球，疊在一起。）','（看台一排一排往上，大部分的位子都空著。最上面那排，有人在睡午覺。）'],noon:[1],cer:'（球場上排滿了折疊椅。看台上有人舉著手機，找自己的家人。）'},
    arena_screen:{day:['（大螢幕是黑的。角落有一個小燈亮著。）'],cer:'（大螢幕上是校徽。音響在試音，一聲一聲的「喂、喂」。）'}};
  function arenaLook(kind,G,z,n){ const L0=ARENA_LOOK[kind]; if(!L0) return ''; if(z&&z.ceremonyOn) return L0.cer; const h=G&&typeof G.hour==='number'?G.hour:12, ok=L0.day.filter((t,i)=>!(L0.noon||[]).includes(i)||(h>=11&&h<17)); return ok[(n||0)%ok.length]; }
  const LOOK={
    gym_desk:'服務台：刷學生證進場。',
    gym_hours:'開館時間：週一到週五 08:00～22:00、週六 09:00～22:00、週日 09:00～18:00。',
    closed_3f:'樓梯口拉著紅龍：「3F 主球場　今日不開放」。',
    gym_notice:'公告欄：系際盃籃球賽報名、羽球場借用規則、體適能檢測、游泳池冬季開放、失物招領。最下面一張：球場內禁止飲食。',
    gym_directory:'樓層指引：3F 主球場／1F 多功能球場（目前位置：1F 大廳）／B1 健身中心・游泳池。'
  };
  /* GLOW_* 空節點（userData.glow：顏色、大小、白天／晚上的亮度）＝燈的光暈：體育館的兩個 GLB 都有（1F 50 個：天井燈、天窗、筒燈、販賣機；B1 69 個：泳池、健身房、走廊），原本沒有接（LAWWW2-C 2026-10-21 清查 A1）。
     合成一個網格（Z3.glowBatch，和溫州街、公館的正式模型同一套：一次 draw call）；室內沒有 TK.setNight，所以照路燈開了沒（z.onLamps）切白天／晚上的亮度；離鏡頭 3 m 以內淡出（B1 天花板 3.6 m，頭頂的燈原本撐滿畫面） */
  function glowBatch(E,z,g0,root,name){ if(!Z3.glowBatch) return null; const gl=[]; root.traverseVisible(o=>{ if(o.userData&&o.userData.glow) gl.push(o); }); if(!gl.length) return null;   /* 只收看得到的：藏著的布置（3F 的 SET_*）自己另外一批（setGlowBatch）*/
    const mesh=Z3.glowBatch(E,g0,root,gl,name,3.0); const on0=z.onLamps; z.onLamps=function(on){ if(on0) on0.call(z,on); mesh.material.emissiveIntensity=on?1:0; }; return mesh; }
  /* 布置（SET_*，平常藏著）自己的光暈：合成一批掛在布置底下——布置藏著時不畫、打開時跟著亮（ART-GYM2-INT：原本和全場一起合成，演唱會的燈架藏著、十個光暈還飄在半空中）*/
  function setGlowBatch(E,z,set,name){ if(!Z3.glowBatch) return null; const gl=[]; set.traverse(o=>{ if(o.userData&&o.userData.glow) gl.push(o); }); if(!gl.length) return null;
    const mesh=Z3.glowBatch(E,set,set,gl,name,3.0); const on0=z.onLamps; z.onLamps=function(on){ if(on0) on0.call(z,on); mesh.material.emissiveIntensity=on?1:0; }; return mesh; }
  /* 導航：配置的阻擋＋大廳和球場之間的牆（三個 4 m 的開口以外）*/
  function buildNav(Ly,nav){ for(const b of Ly.blocks){ const tiny=b[2]<0.4&&b[3]<0.4; nav.blockRect(b[0],b[1],tiny?0.4:b[2],tiny?0.4:b[3],0,0.05); }   /* 羽球網柱（0.12 m 見方）比導航格（0.4 m）細：至少擋一格。閘門柱（0.12×0.9）照舊：放大會把 1.2 m 的通道擋掉 */
    const P=Ly.partition, xs=[Ly.hall.x0]; for(const [a,b] of P.openings){ xs.push(a,b); } xs.push(Ly.hall.x1);
    for(let i=0;i<xs.length;i+=2){ const a=xs[i], b=xs[i+1]; if(b-a>0.01) nav.blockRect((a+b)/2,P.z,b-a,0.3,0,0.05); } }
  /* 備用模型：球場地板、隔間牆、看台、服務台、長椅、樓梯口（量體）*/
  function buildFallback(Ly,fb){ const wood=M('#c8a36a',{roughness:0.55}), wall=M('#efece4'), dark=M('#3a3f46',{roughness:0.5}), red=M('#9c2f2a');
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(Ly.hall.x1-Ly.hall.x0,Ly.hall.z1-Ly.hall.z0),wood); floor.rotation.x=-Math.PI/2; floor.position.set(0,0.01,(Ly.hall.z0+Ly.hall.z1)/2); fb.add(floor);
    const P=Ly.partition, xs=[Ly.hall.x0]; for(const [a,b] of P.openings) xs.push(a,b); xs.push(Ly.hall.x1);
    for(let i=0;i<xs.length;i+=2){ const a=xs[i], b=xs[i+1]; const m=new THREE.Mesh(new THREE.BoxGeometry(b-a,4.2,0.3),wall); m.position.set((a+b)/2,2.1,P.z); fb.add(m); }
    for(const b of Ly.blocks){ if(b[2]<0.2&&b[3]<0.2) continue; const h=b[2]>10?1.4:0.9; const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],h,b[3]),b[2]>10?dark:wall); m.position.set(b[0],h/2,b[1]); fb.add(m); }
    for(const it of Ly.items) if((it.kind==='stairs_up'&&!Z3.ZONES.gym_arena)||(it.kind==='stairs_down'&&!Z3.ZONES.gym_b1)){ const cx=(it.x0+it.x1)/2, rope=new THREE.Mesh(new THREE.BoxGeometry(it.x1-it.x0,0.06,0.06),red); rope.position.set(cx,0.9,it.kind==='stairs_up'?it.z1+0.1:it.z1+0.3); fb.add(rope); }
    for(const [cx,cz] of Ly.courts.badminton){ const net=new THREE.Mesh(new THREE.PlaneGeometry(6.2,0.76),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.35,side:THREE.DoubleSide})); net.position.set(cx,1.17,cz); fb.add(net); } }
  /* 樓梯口 A 字架的告示（PLATE_FACE_gym_stairs_up／down）：沒有 UV 就照板面補一組，畫上字 */
  function plateTex(lines){ const c=document.createElement('canvas'); c.width=512; c.height=384; const x=c.getContext('2d'); x.fillStyle='#f7f6f2'; x.fillRect(0,0,512,384); x.fillStyle='#9c2f2a'; x.fillRect(0,0,512,22);
    x.fillStyle='#2f3338'; x.textAlign='center'; x.textBaseline='middle'; x.font='600 54px "Noto Sans TC","PingFang TC","Noto Sans CJK TC","Microsoft JhengHei",sans-serif'; lines.forEach((t,i)=>x.fillText(t,256,140+i*110));
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.flipY=false; return t; }
  function paintPlate(o,lines){ const g=o.geometry; if(!g.attributes.uv){ g.computeBoundingBox(); const bb=g.boundingBox, p=g.attributes.position, uv=new Float32Array(p.count*2), wx=bb.max.x-bb.min.x, wz=bb.max.z-bb.min.z, h=bb.max.y-bb.min.y||1, alongX=wx>=wz;
      for(let i=0;i<p.count;i++){ const a=alongX?(p.getX(i)-bb.min.x)/(wx||1):(p.getZ(i)-bb.min.z)/(wz||1); uv[i*2]=a; uv[i*2+1]=1-(p.getY(i)-bb.min.y)/h; } g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); }
    const t=plateTex(lines); const m=o.material.clone(); m.map=t; m.color=new THREE.Color(0xffffff); m.needsUpdate=true; o.material=m; }
  /* ---------- 一個人打羽球、販賣機、直飲台（AA-B AA_174，93c0bce9）----------
     體能（AA_126 6-1：0～100，玩家看不到數字；這一版只有打羽球會加，其他來源之後接）。存檔：G.daily.gym＝{fit, wk, wkN, joined, seen:[], serveN, sportDay, drinkDay}（舊存檔沒有＝全部 0）*/
  const rec=G=>{ G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; if(!Array.isArray(r.seen)) r.seen=[]; return r; };
  const wkOf=G=>{ const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7); return G.day-(wd-1); };   /* 這一週的週一 */
  const isWeekend=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd>=6:[0,6].includes(G.weekday|0);
  const fitStage=f=>f>=75?'經常鍛鍊':(f>=50?'結實':(f>=25?'有在運動':'普通'));
  const secondHallOn=G=>!!(G&&G.flags&&G.flags.GYM_SECONDHALL);   /* 第二會場打開的日子（畢業典禮；那個事件做好時設）*/
  const JOIN=['你和兩個研究生、一個大一的湊成雙打。研究生說：「你殺球很直。」','對面戴護腕的學長，每一球都回到底線。你輸了，可是學到一點。','打到第三局，大家都不說話了，只剩鞋子摩擦地板的聲音。','你和一個很強的人同一隊。他一直喊「你的」「我的」。你們贏了。','打完，T 恤濕透了。走出球場，大廳的冷氣很冷。'];
  const SERVE=['你把十顆球發完，撿回來，再發一次。','發到第三十顆，球終於不再掛網了。','旁邊的場地在比賽。你一邊撿球，一邊看了一下。'];
  const VEND=[['運動飲料',25,'你一口氣喝了半瓶。'],['礦泉水',20,'冰的。瓶子上馬上凝了一層水。'],['無糖綠茶',25,'你看了一下成分表。……就是茶。'],['罐裝咖啡',30,'下午還有課。你把拉環拉開。']];
  async function badminton(GM){ const G=GM.G, h=G.hour%24, r=rec(G), we=isWeekend(G), h0=we?9:12, h1=we?17:21;
    if(secondHallOn(G)){ await GM.say(null,'今天這裡有活動，不開放打球。'); return; }
    if(h<h0){ await GM.say(null,'早上的場地是體育課在用。中午以後再來。'); return; }
    if(h>=h1){ await GM.say(null,'場地要收了。網子已經放下來一半。'); return; }
    const C=typeof CLS!=='undefined'?CLS:null, plan=C&&C.slotPlan?C.slotPlan(G,1,'gym'):{ok:true,uses:[]};
    const i=await GM.choose([{t:'去場邊等人併場',hint:'60 分鐘',dim:!plan.ok},{t:'自己練發球',hint:'20 分鐘'},{t:'算了'}]);
    if(i===0){ if(!plan.ok){ GM.toast(plan.why||'今天這個時段已經排滿了',3000); return; }
      if(!r.joined){ r.joined=1; await GM.say(null,'場邊有一塊白板，你把名字寫在最下面，排在三個人後面。'); }
      GM.advance(1); if(C&&C.slotUse){ C.slotUse(G,plan.uses); if(C.queueJump) C.queueJump(G); } r.sportDay=G.day;
      const wk=wkOf(G); if(r.wk!==wk){ r.wk=wk; r.wkN=0; r.seen=[]; } if((r.wkN|0)<2){ r.wkN=(r.wkN|0)+1; r.fit=Math.min(100,(r.fit|0)+1); } r.fitDay=G.day;   /* 體能 +1，每週最多算 2 次（和健身的 3 次分開）*/
      let cand=JOIN.filter(l=>!r.seen.includes(l)); if(!cand.length){ r.seen=[]; cand=JOIN.slice(); } const l=cand[Math.floor(Math.random()*cand.length)]; r.seen.push(l); await GM.say(null,l);
      if((r.fit|0)>=50){ r.strongN=((r.strongN|0)+1)%3; if(r.strongN===0) await GM.say(null,'以前追不到的球，你現在追得到了。'); } }   /* 結實以上：三次裡一次 */
    else if(i===1){ GM.advance(1/3); r.sportDay=G.day; r.serveN=((r.serveN|0)+1)%SERVE.length; await GM.say(null,SERVE[r.serveN]); } }
  async function vending(GM){ const G=GM.G, r=rec(G), sport=r.sportDay===G.day; const i=await GM.choose(VEND.map(v=>({t:v[0]+'　'+v[1]+' 元',dim:G.money<v[1]})).concat([{t:'不用了'}]));
    if(i>=VEND.length) return; const v=VEND[i]; if(G.money<v[1]){ GM.toast('錢不夠'); return; } GM.money(-v[1]); await GM.say(null,i===0&&sport?'運動完的那一罐，總是喝得特別快。':v[2]); }   /* 只是一句旁白，不放進背包 */
  async function fountain(GM){ const G=GM.G, r=rec(G); if(r.drinkDay===G.day) return; r.drinkDay=G.day; await GM.say(null,r.sportDay===G.day?'你喝了很久。後面排隊的人在等你。':'你按下按鈕，彎腰喝了幾口。'); }   /* 一天第二次以後不再說話 */
  async function scene(GM,f){ GM.sceneBegin(); try{ await f(GM); } finally { GM.sceneEnd(); } }
  /* 球場中圈「體育課集合」：這堂體育課現在可以上 → 上課（和門口同一套）；不然寫今天的體育課 */
  async function peClass(GM){ const G=GM.G; if(typeof CLS==='undefined') return; const it=CLS.liveDoor?CLS.liveDoor(G,'gym'):null;
    if(it&&CLS.status(G,it)==='open'){ let ch=1; GM.sceneBegin(); try{ ch=await GM.choose([{t:'上課：'+it.c.name},{t:'等一下'}]); } finally { GM.sceneEnd(); } if(ch===0) await CLS.attend(GM,it,{door:true}); return; }
    const today=CLS.dayItems(G).filter(q=>q.room&&q.room.door==='gym'); GM.caption('',today.length?'體育課在這裡集合。今天：'+today.map(q=>q.c.name+'（'+({done:'上過了',missed:'沒去',open:'可以上',upcoming:'還沒開始'})[CLS.status(G,q)]+'）').join('、'):'體育課在這裡集合。今天沒有你的體育課。',4200); }

  const gym={ id:'gym', name:'綜合體育館', indoor:true, camDist:5.2, build(E){ const Ly=L();
    const z=Z3.room(E,{w:Ly.w,d:Ly.d,h:Ly.h,windows:false,cool:true,wallColor:'#f2f0ea',floorTex:W3.stoneTex('#c9c4b8'),spawn:Object.assign({},Ly.spawn)}); const g0=z.group, nav=z.nav;
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    buildNav(Ly,nav); buildFallback(Ly,fb);
    /* 挑高 9 m、40×38 m：房間預設的頂燈不夠，球場多四盞（白天弱、晚上亮）*/
    const lamps=[]; for(const [x,zz] of [[-10,-10],[10,-10],[-10,4],[10,4],[0,15]]){ const l=new THREE.PointLight(0xfff6ea,3,22,2); l.position.set(x,zz>11?3.8:8.2,zz); l.userData.on=8; l.userData.off=3; g0.add(l); lamps.push(l); }
    const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    /* 東西兩面高窗（正式模型的 gym_window_sky 自發光的天空色）：白天亮、黃昏暗、晚上只剩一點（LAWWW2-B 的建議，像柏油入夜調暗）*/
    const skyMats=[]; const skyLevel=(h,weather)=>{ h=h%24; const k=(h<5.5||h>=19.2)?0.06:(h<6.5?0.35:(h>=17.8?0.3:1)); return k*(weather==='rain'?0.6:(weather==='cloudy'?0.8:1)); };
    const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); const k=skyLevel(h,weather); for(const m of skyMats) m.emissiveIntensity=m.userData.gyBase*k; };
    // 座位、互動點、出口（一層，全部 lv 0）
    const IT=E.interactables; z.seats=[];
    for(const st of Ly.seats){ const seat={x:st.x,z:st.z,yaw:st.yaw}; if(st.y!=null) seat.y=st.y; z.seats.push(Object.assign({kind:'gym'},seat)); IT.push({x:st.x,z:st.z,radius:0.8,lv:0,label:st.label||'坐下',seat}); }
    if(Ly.b1&&typeof Z3!=='undefined'&&Z3.ZONES.gym_b1) IT.push({x:18.0,z:18.2,radius:0.8,lv:0,label:'下樓到 B1（健身中心・游泳池）',exit:{to:'gym_b1',spawn:Object.assign({},Ly.b1.spawn)}});   /* 第三階段（LAWWW2-B f3180c69）：原本「往 B1 的樓梯（今天不開放）」*/
    const AT={closed_3f:{x:-16.0,z:17.4}};   /* 配置的 (−18,18.6) 在樓梯量體和前牆之間（站不住）：移到樓梯口朝大廳的那一側 */
    for(const q0 of Ly.interact){ if(q0.kind==='closed_3f'&&Ly.arena&&Z3.ZONES.gym_arena){ IT.push({x:ARENA_UP.x,z:ARENA_UP.z,radius:0.8,lv:0,label:'上樓到 3F 主球場',exit:{to:'gym_arena',spawn:Object.assign({},Ly.arena.spawn)}}); continue; }   /* ART-GYM2-INT：原本「往 3F 的樓梯（今天不開放）」*/
      const q=Object.assign({},q0,AT[q0.kind]||{}); if(LOOK[q.kind]) IT.push({x:q.x,z:q.z,radius:1.2,lv:0,label:q.label,look:LOOK[q.kind]}); else if(q.kind==='pe_class') IT.push({x:q.x,z:q.z,radius:1.4,lv:0,label:'體育課集合',mark:true,onInteract:()=>peClass(GAME)});
      else if(q.kind==='badminton'||q.kind==='vending'||q.kind==='fountain'){ const f={badminton,vending,fountain}[q.kind]; IT.push({x:q.x,z:q.z,radius:1.2,lv:0,label:q.label,gym:q.kind,onInteract:()=>scene(GAME,f)}); } }   /* AA_174 */
    IT.push({x:Ly.exit.at.x,z:18.5,radius:0.8,lv:0,label:Ly.exit.label,exit:{to:'campus',spawn:Object.assign({},CAMPUS)}});   /* 出生點 z 17.6：出口範圍 0.8 m，一進來不會先看到「離開」*/
    // 正式模型（GLB）：第二會場平常藏起來；樓梯口的告示畫字
    z.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gym_interior']){ ASSETS.loadOne('bldg.gym_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      Z3.attachRoomGLB(z,g0,fb,root); glowBatch(E,z,g0,root,'gym_glows');
      const sh=root.getObjectByName('SET_SECONDHALL'); if(sh) sh.visible=false;   /* 畢業典禮那天才打開（打開時導航加 sets.second_hall.blocks；下一階段）*/
      const nets=root.getObjectByName('SET_NETS'); if(nets) nets.visible=!secondHallOn(typeof GAME!=='undefined'?GAME.G:null);   /* 羽球網（LAWWW2-B f1e732f8；BB_151 第 6 節）：第二會場打開的日子收起來 */
      root.traverse(o=>{ if(!o.isMesh) return; if(o.name==='PLATE_FACE_gym_stairs_up') paintPlate(o,Z3.ZONES.gym_arena?['3F','主球場']:['3F 主球場','今日不開放']); else if(o.name==='PLATE_FACE_gym_stairs_down') paintPlate(o,['B1','游泳池・健身中心']);   /* B1 開了（9ee41835）：不再寫今日不開放 */
        if(o.material&&o.material.name==='gym_window_sky'&&!skyMats.includes(o.material)){ if(o.material.userData.gyBase==null) o.material.userData.gyBase=o.material.emissiveIntensity||1; skyMats.push(o.material); } });
      const G=typeof GAME!=='undefined'?GAME.G:null; if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('體育館正式模型載入失敗，用程序化備用模型',e)); }
    return z; } };
  /* ---------- B1：大廳、健身中心、游泳池（LAWWW2-B f3180c69：gym_layout.js 的 b1 段＋gym_b1.glb；使用者「一定要有健身房」）----------
     「去健身房」（AA_126 6-1、6-4；台詞 BB_124 7-3、7-4）：平日、週六 21:30 以前、週日 17:30 以前；每月第四個星期一休館；第一次在櫃台辦會員證（單次 50／當月月票 200）；
     月票到那個月底、每個月重新買（過期後那個月第一次去才問；那個月選單次的之後直接扣）；重訓一小時、扣一次（時段次數）、體能 +2（每週最多算 3 次）；
     器材旁白照體能階段三句輪流、不連續重複。存檔：G.daily.gym＝{card, pass:'YYYY-MM', single:'YYYY-MM', fitWk, fitN, fitLast:{階段:句}}（舊存檔沒有＝沒辦卡）*/
  const FIT_LINES={'普通':['你在跑步機上走了二十分鐘。旁邊的人在跑。你決定先走。','啞鈴從兩公斤排到四十公斤。你拿了最左邊那一對。','你學旁邊的人調座椅，調了三次才對。沒有人在看你。'],
    '有在運動':['深蹲架前面排了兩個人。你在旁邊伸展，等了五分鐘。','腳踏車機騎了三十分鐘。螢幕上的里程，比你騎去公館還遠。','你拿起上週那一對啞鈴。……好像沒那麼重了。'],
    '結實':['史密斯機的槓，你多加了一片。鏡子裡的人，站得比較直。','划船機拉到第五百公尺，你才開始流汗。','一個大一的問你深蹲架怎麼調。你教他，像去年有人教你。'],
    '經常鍛鍊':['訓練的順序已經不用想了。毛巾、學生證、室內鞋，一樣不少。','重訓區的老面孔對你點頭。你們不知道彼此的名字。','練完走上樓梯，外面的空氣是涼的。你不想坐下。']};
  const ym=G=>{ const d=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day):{y:2025,m:10}; return d.y+'-'+String(d.m).padStart(2,'0'); };
  const fourthMonday=G=>{ if(typeof CALENDAR==='undefined') return false; const d=CALENDAR.dateOf(G.day); return d.wd===1&&d.d>=22&&d.d<=28; };
  const SAY_DESK=(GM,t)=>GM.say({name:'櫃台阿姨'},t);
  async function cardScene(GM,r){ const G=GM.G; await GM.say(null,'B1 的櫃台。阿姨推過來一張同意書。'); await SAY_DESK(GM,'第一次喔？這張填一下，學生證給我。'); await GM.say(null,'你簽了名。她對著你拍了一張大頭照，你還沒準備好。'); await SAY_DESK(GM,'好，卡做好了。單次五十，月票兩百，要哪一個？');
    const i=await buyPass(GM,r,true); if(i<0) return false; await SAY_DESK(GM,'毛巾要帶喔。還有——（看了一眼你的鞋）下次記得穿室內鞋喔。'); await GM.say(null,'她還是讓你進去了。卡上的照片，表情像在等公車。'); r.card=G.day; return true; }
  /* 單次／月票：first＝第一次辦卡那一段的選項（回答不同）；回傳 0 單次、1 月票、−1 錢不夠 */
  async function buyPass(GM,r,first){ const G=GM.G; const i=await GM.choose([{t:'「單次。」',dim:G.money<50},{t:'「這個月的月票。」',dim:G.money<200}]); const cost=i===1?200:50; if(G.money<cost){ GM.toast('錢不夠'); return -1; }
    GM.money(-cost); if(i===1){ r.pass=ym(G); if(first) await SAY_DESK(GM,'好，兩百。用到這個月底喔。'); } else { r.single=ym(G); if(first) await SAY_DESK(GM,'好，五十。下次刷卡就可以。'); } return i; }
  async function workout(GM){ const G=GM.G, r=rec(G), h=G.hour%24, wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7);
    if(fourthMonday(G)){ await GM.say(null,'今天第四個星期一，健身房休館。'); return; }
    const open=wd>=6?9:8, last=wd===7?17.5:21.5; if(h<open){ GM.caption('',LOOK.gym_hours,3600); return; } if(h>=last){ await GM.say(null,'健身房在清場了。明天吧。'); return; }
    const C=typeof CLS!=='undefined'?CLS:null, plan=C&&C.slotPlan?C.slotPlan(G,1,'gym'):{ok:true,uses:[]}; if(!plan.ok){ GM.toast(plan.why||'今天這個時段已經排滿了',3000); return; }
    if(!r.card){ if(!await cardScene(GM,r)) return; }
    else if(r.pass!==ym(G)){ if(r.single===ym(G)){ if(G.money<50){ GM.toast('錢不夠'); return; } GM.money(-50); }   /* 這個月選了單次：之後直接扣，不再問 */
      else { await SAY_DESK(GM,'這個月要買月票嗎？'); if(await buyPass(GM,r,false)<0) return; } }
    GM.advance(1); if(C&&C.slotUse){ C.slotUse(G,plan.uses); if(C.queueJump) C.queueJump(G); } r.sportDay=G.day;
    const wk=wkOf(G); if(r.fitWk!==wk){ r.fitWk=wk; r.fitN=0; } if((r.fitN|0)<3){ r.fitN=(r.fitN|0)+1; r.fit=Math.min(100,(r.fit|0)+2); } r.fitDay=G.day;   /* fitDay：最後一次運動（src/fit3d.js 的 8 週提醒）*/   /* 重訓一小時 +2，每週最多算 3 次（和打羽球的 2 次分開）*/
    const st=fitStage(r.fit|0), L=FIT_LINES[st]; r.fitLast=r.fitLast||{}; const prev=r.fitLast[st]; let k=(prev==null?0:(prev+1)%L.length); r.fitLast[st]=k; await GM.say(null,L[k]); }   /* 三句輪流、不連續重複 */
  async function deskB1(GM){ const r=rec(GM.G); if(!r.card){ await cardScene(GM,r); return; } GM.toast(r.pass===ym(GM.G)?'會員證：這個月的月票':'會員證：單次 50 元（或買這個月的月票）',3200); }
  const gym_b1={ id:'gym_b1', name:'綜合體育館 B1', indoor:true, windowless:true, camDist:3.6, build(E){ const Ly=L(), B=Ly.b1, cz=-5;   /* 配置：x −24～24、z −24～14（room() 中心在原點，整個往 −z 移 5 m）*/
    const z=Z3.room(E,{w:48,d:38,h:B.h,windows:false,cool:true,wallColor:'#eceae4',floorTex:W3.stoneTex('#3a3d40'),spawn:Object.assign({},B.spawn)}); const g0=z.group, nav=z.nav;
    g0.position.z+=cz; nav.oz+=cz; for(const w of z.walls) w.userData.center=new THREE.Vector3(w.position.x,w.position.y,w.position.z+cz);
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    const blk=(x0,x1,z0,z1)=>{ if(x1-x0>0.01&&z1-z0>0.01) nav.blockRect((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,0,0.05); };
    const wallM=new THREE.MeshStandardMaterial({color:0xdedbd3,roughness:0.85}); const wallBox=(x0,x1,z0,z1,h)=>{ const tz=z1-z0<0.5?(0.5-(z1-z0))/2:0, tx=x1-x0<0.5?(0.5-(x1-x0))/2:0; blk(x0-tx,x1+tx,z0-tz,z1+tz);   /* 導航至少 0.5 m 厚（格子 0.4 m，太薄的牆擋不到格子中心）*/ const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.05,x1-x0),h||B.h,Math.max(0.05,z1-z0)),wallM); m.position.set((x0+x1)/2,(h||B.h)/2,(z0+z1)/2-cz); fb.add(m);
      const cm=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.2,x1-x0),B.h,Math.max(0.2,z1-z0)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); cm.position.set((x0+x1)/2,B.h/2,(z0+z1)/2-cz); g0.add(cm); E.colliders.push(cm); };   /* 隔間牆（玻璃牆、泳池的牆）＝鏡頭碰撞：鏡頭不跑到牆的另一邊。B1 v6 起正式模型的隔間牆是 WALL_（partition＝1：鏡頭和玩家在不同邊才淡出，zones3d.js 的 room().fadeWalls），碰撞照舊留著（2026-10-16 LAWWW-B：這一版不改鏡頭行為）*/
    // 牆：健身中心北側玻璃牆（門 3.2～5.0）、健身中心和大廳之間（x 10～12）、游泳池的牆（門 −5.0～−3.2；大廳那一段到 x 24）、大廳和走廊之間的閘門照開著
    const F=B.fitness, P=B.pool; wallBox(F.x0,F.door.x0,F.z0-0.1,F.z0+0.1,2.6); wallBox(F.door.x1,F.x1,F.z0-0.1,F.z0+0.1,2.6); wallBox(F.x1,12,F.z0,F.z1);
    wallBox(P.x0,P.door.x0,P.z1-0.1,P.z1+0.1); wallBox(P.door.x1,P.x1,P.z1-0.1,P.z1+0.1);
    const S=B.lobby.stairs; blk(S.x0,S.x1,S.z0,S.z1); const bs=P.basin; blk(bs.x0,bs.x1,bs.z0,bs.z1);
    { const water=new THREE.Mesh(new THREE.PlaneGeometry(bs.x1-bs.x0,bs.z1-bs.z0),new THREE.MeshStandardMaterial({color:0x3f8fb0,roughness:0.2})); water.rotation.x=-Math.PI/2; water.position.set((bs.x0+bs.x1)/2,0.02,(bs.z0+bs.z1)/2-cz); fb.add(water); }
    for(const eq of B.equipment.concat(B.entryProps)){ if(eq.walk) continue; const q=Math.abs(Math.sin(eq.ry||0))>0.5, w=q?eq.size[1]:eq.size[0], d=q?eq.size[0]:eq.size[1];
      for(const [x,zz] of eq.at){ blk(x-w/2,x+w/2,zz-d/2,zz+d/2); const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.9,d),wallM); m.position.set(x,0.45,zz-cz); fb.add(m); } }
    for(const [x,zz] of B.poolBenches) blk(x-1.0,x+1.0,zz-0.2,zz+0.2);
    const IT=E.interactables; z.seats=[]; for(const [x,zz] of B.poolBenches){ const seat={x,z:zz-0.1,yaw:Math.PI}; z.seats.push(Object.assign({kind:'gym'},seat)); IT.push({x,z:zz-0.1,radius:0.8,lv:0,label:'坐在池邊的長椅',seat}); }   /* 面向北邊的泳池 */
    IT.push({x:B.exit.at.x,z:B.exit.at.z,radius:0.6,lv:0,label:B.exit.label,exit:{to:'gym',spawn:{x:16.8,z:18.4,yaw:0}}});   /* 回 1F：落點在「下樓到 B1」範圍外；面向大廳（原本 π 面向剛上來的樓梯井，BB-C X64）*/
    for(const q of B.interact){ if(q.kind==='gym_fitness') IT.push({x:q.x,z:q.z,radius:1.2,lv:0,label:'去健身房',mark:true,onInteract:()=>scene(GAME,workout)}); else if(q.kind==='gym_b1_desk') IT.push({x:q.x,z:q.z,radius:1.1,lv:0,label:'服務櫃台',onInteract:()=>scene(GAME,deskB1)}); }   /* 看游泳池、更衣室：還沒有字（要 AA／BB），先不開 */
    z.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gym_b1']){ ASSETS.loadOne('bldg.gym_b1').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); root.position.z-=cz; Z3.attachRoomGLB(z,g0,fb,root); glowBatch(E,z,g0,root,'gym_b1_glows'); }   /* 天花板 b1_ceiling* 是單面、法線朝下（B1 v5）：從下面看得到，跟隨鏡頭在天花板上面時自動透空；不要改材質的 side */).catch(e=>console.warn('體育館 B1 正式模型載入失敗，用程序化備用模型',e)); }
    return z; } };
  /* ---------- 3F 主球場（ART-GYM2-INT，LAWWW2 2026-10-21；gym_layout.js 的 arena 段＋gym_arena.glb（LAWWW2-B 3effc0e0、f1e732f8、f1d23fd4））----------
     從 1F 大廳西側的樓梯上來＝南看台中間的入口通道（vomitory）。場地整片能走；三面看台走中間的走道（樓梯）上去：導航是連續的斜面（碰撞、找路），
     畫面一階一階（走道每排兩階，最前面多一階；和 gym_arena.py 的 stand() 同一組數字）。每條走道第 3、7 排旁邊的座位可以坐（面向場地）。
     上層看台（4、5F）只有畫面；舞台、典禮、演講、演唱會的布置（SET_*）平常藏著，劇情要用時再打開。看台每一排當鏡頭碰撞（走在走道上，鏡頭不鑽進看台）。
     「看主球場」「大螢幕」還沒有字（要 AA／BB），先不開。座標：x 往東、z 往南、y＝場地地板 0（配置的座標，不平移）。 */
  function arenaGeo(A){ const SR=A.standRows, T=SR.tread, R=SR.rise, H0=SR.h0, N=SR.rows, DEPTH=N*T, TOP=H0+(N-1)*R;
    const sides=A.stands.map(sd=>{ const ax=sd.axis==='x';   /* ax：看台的深度沿 x（東、西）；d＝離最前排前緣的距離（往看台裡面為正）；u＝沿著看台的座標 */
      return {side:sd.side, ax, yaw:sd.yaw, along:sd.along, gap:sd.gap||null, aisles:A.aisles[sd.side],
        d:(x,z)=>ax?(x-sd.front)*sd.dir:(z-sd.front)*sd.dir, u:(x,z)=>ax?z:x, at:(u,d)=>ax?[sd.front+sd.dir*d,u]:[u,sd.front+sd.dir*d]}; });
    const cont=d=>Math.max(0,Math.min(1,(d+0.42)/(DEPTH+0.42)))*TOP;   /* 走道：碰撞、找路用的連續斜面（前緣外 0.42 m 的那一階起算，到最上一排）*/
    const step=d=>{ if(d<-0.42) return 0; if(d<0) return H0/2; const r=Math.min(N-1,Math.floor(d/T)), y=H0+r*R; return (d-r*T)<T/2?(r?y-R/2:H0*0.75):y; };   /* 畫面上一階一階 */
    return {T,R,H0,N,DEPTH,TOP,AW:A.aisles.w,sides,cont,step}; }
  function arenaNav(A,G){ const nav=new E3.NavGrid(66.3,56.4,0.3,-33.15,-28.35); nav.fillBlocked();   /* 格子 0.3 m、中心在 0.3 的整數倍：走道中心（z 0、±9；x ±12）剛好在格子中心，三格寬 0.9 m（走道 1.2 m） */
    const F=A.floor, V=A.vomitory; nav.freeRect(F.x0+0.3,F.z0+0.3,F.x1-0.3,F.z1-0.3); nav.freeRect(V.x0+0.35,F.z1-0.4,V.x1-0.35,V.z1-0.35);   /* 入口通道整條走得到，盡頭是回 1F 的門（z1＝看台後牆）*/
    for(const s of G.sides) for(const c of s.aisles){ const [ax0,az0]=s.at(c-0.45,-0.42), [ax1,az1]=s.at(c+0.45,G.DEPTH-0.15);
      const r={x0:Math.min(ax0,ax1),x1:Math.max(ax0,ax1),z0:Math.min(az0,az1),z1:Math.max(az0,az1)}; nav.freeRect(r.x0,r.z0,r.x1,r.z1);
      nav.addSurf(Object.assign(r,{fn:(x,z)=>G.cont(s.d(x,z)),vfn:(x,z)=>G.step(s.d(x,z))})); }
    return nav; }
  /* 鏡頭碰撞（和 gym_arena.py 同一組數字）：看台每一排；看台後牆＋上層看台（4、5F）；入口通道兩側的牆、入口上方的橫樑＋出口燈；看台轉角（兩面看台端牆中間封起來的空間）；北牆。
     ART-GYM2-INT 第二輪：原本只有每一排——進場時鏡頭在入口通道盡頭的牆後面、坐在看台第 7 排以上鏡頭退進看台後牆，整個畫面是一片牆（遊戲內截圖）。測試：tests/gym_arena_unit.js 第 12 項 */
  function arenaCamCols(A,G,g){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[];
    const raw=(name,x0,x1,z0,z1,y0,y1)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),inv); m.name=name; m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); m.userData.noMerge=true; g.add(m); out.push(m); };
    const box=(name,s,u0,u1,d0,d1,y1)=>{ const [xa,za]=s.at(u0,d0), [xb,zb]=s.at(u1,d1); raw(name,Math.min(xa,xb),Math.max(xa,xb),Math.min(za,zb),Math.max(za,zb),0,y1); };
    const UP=A.upper, U0=UP.front-22, UO=U0+UP.rows*UP.tread+0.3, TOPH=UP.h0+UP.rows*UP.rise+2.0, V=A.vomitory, F=A.floor, EX=22+UO, SZ=17+UO;   /* 上層看台前緣離下層看台前緣 10.6 m、外牆 x ±40.9、z 35.9（gym_arena.py 的 U0L、EX、SZ）*/
    for(const s of G.sides){ const segs=s.gap?[[s.along[0],s.gap[0]],[s.gap[1],s.along[1]]]:[s.along];
      for(let r=0;r<G.N;r++) for(const [u0,u1] of segs) box('cam_row',s,u0,u1,r*G.T,(r+1)*G.T,G.H0+r*G.R);   /* 每一排：從地板到那一排的平台頂（走道前半階低 21 cm，鏡頭用不到這麼細）*/
      box('cam_back',s,s.along[0],s.along[1],G.DEPTH,UO,UP.h0+0.9);   /* 看台後牆（到 7.6 m）＋上層看台前面的色帶、玻璃（入口通道盡頭的門也在這一面）*/
      for(let r=1;r<UP.rows;r++) box('cam_upper',s,s.along[0],s.along[1],U0+r*UP.tread,UO,UP.h0+r*UP.rise+0.9); }   /* 上層看台每一排到椅背（底下當實心：鏡頭不鑽進看台下面）*/
    const yb=G.H0+1.0, yt=G.TOP+1.6;   /* 入口通道兩側的牆：照看台的斜度收邊（前端 1.6 m、後端 6.82 m），每一排一段、取那一段後端的高度 */
    for(const [x0,x1] of [[V.x0-0.25,V.x0+0.005],[V.x1-0.005,V.x1+0.25]]) for(let r=0;r<G.N;r++) raw('cam_vom',x0,x1,V.z0+r*G.T,V.z0+(r+1)*G.T,0,yb+(r+1)/G.N*(yt-yb));
    raw('cam_beam',V.x0-0.27,V.x1+0.27,V.z0-0.27,V.z0+0.2,2.8,3.8);   /* 入口上方的橫樑＋綠色出口燈 */
    for(const sx of [-1,1]) raw('cam_corner',sx>0?22:-EX,sx>0?EX:-22,17,SZ,0,TOPH);   /* 東南、西南角：兩面看台的端牆中間封起來的空間 */
    raw('cam_north',-EX,EX,F.z0-0.4,F.z0,0,A.h);   /* 北牆（大螢幕那一面）*/
    return out; }
  /* 典禮的日子（SET-CEREMONY-1023，AA_399 第 4 節、A16；LAWWW2-B 10-23）：gym_layout.js 的 sets.ceremony.days，那一整天打開舞台＋典禮的布置
     （開學典禮 2025-08-31 14:00、畢業典禮 2029-06-02 09:00）；回傳 'open'／'grad'／null。劇情什麼時候從 2D 換成 3D 由 LAWWW 接（站位在 sets.ceremony.spots）*/
  function ceremonyDay(G){ const C=L().arena.sets.ceremony; if(!G||!C||!C.days||typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return null; return C.days[CALENDAR.dateOf(G.day|0).key]||null; }
  /* 典禮那天的導航：舞台（含兩側上台的樓梯）擋住；折疊椅照 chairs 分成幾塊（中間、兩側三條走道留著），每一塊整片擋住（學院的牌子在每一區最後一排後面，也包在裡面）*/
  function ceremonyNav(nav,A){ const C=A.sets.ceremony, ch=C.chairs, st=A.sets.stage; nav.blockRect((st.x0+st.x1)/2,(st.z0+st.z1)/2,st.x1-st.x0+2.8,st.z1-st.z0,0,0.05);
    const xs=[]; for(let x=ch.x[0];x<=ch.x[1]+1e-6;x+=ch.pitch[0]) if(!ch.aisles.some(([a,b])=>x>=a&&x<=b)) xs.push(x);
    const groups=[]; for(const x of xs){ const g=groups[groups.length-1]; if(g&&x-g[1]<ch.pitch[0]*1.5) g[1]=x; else groups.push([x,x]); }
    let zl=ch.z[0]; while(zl+ch.pitch[1]<=ch.z[1]+1e-6) zl+=ch.pitch[1]; const z0=ch.z[0]-0.3, z1=Math.max(zl+0.3,...(C.sections||[]).map(s=>s.z1+0.62));
    for(const [a,b] of groups) nav.blockRect((a+b)/2,(z0+z1)/2,b-a+0.5,z1-z0,0,0); nav._cm=null; return groups; }
  const gym_arena={ id:'gym_arena', name:'綜合體育館 3F 主球場', indoor:true, camDist:5.2, build(E){ const A=L().arena, G=arenaGeo(A);
    const z=Z3.room(E,{w:66,d:56,h:A.h,windows:false,cool:true,wallColor:'#eceae4',floorTex:W3.stoneTex('#c8a36a'),spawn:Object.assign({},A.spawn)}); const g0=z.group;
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    z.nav=arenaNav(A,G); z.camCols=[arenaCamCols(A,G,g0)];
    const G0c=typeof GAME!=='undefined'?GAME.G:null, cer=ceremonyDay(G0c); z.ceremonyOn=cer; if(cer){ ceremonyNav(z.nav,A); z.cerSpots=A.sets.ceremony.spots; }
    { const st=M('#5c6670',{roughness:0.7}); for(const s of G.sides){ const segs=s.gap?[[s.along[0],s.gap[0]],[s.gap[1],s.along[1]]]:[s.along];   /* 備用模型：每一排一條量體（正式模型載入前、失敗時）*/
        for(let r=0;r<G.N;r+=2) for(const [u0,u1] of segs){ const [xa,za]=s.at(u0,r*G.T), [xb,zb]=s.at(u1,(r+2)*G.T), h=G.H0+(r+1)*G.R; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xb-xa),h,Math.abs(zb-za)),st); m.position.set((xa+xb)/2,h/2,(za+zb)/2); fb.add(m); } } }
    /* 挑高 23 m、66×56 m：房間的頂燈不夠，場地上方六盞（白天弱、晚上亮）*/
    const lamps=[]; for(const [x,zz] of [[-12,-12],[12,-12],[-12,2],[12,2],[-12,14],[12,14]]){ const l=new THREE.PointLight(0xfff6ea,4,34,2); l.position.set(x,17,zz); l.userData.on=12; l.userData.off=4; g0.add(l); lamps.push(l); }
    const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    // 座位：每條走道第 3、7 排，往 +u 那一邊的第一個位子（走道邊）；互動點在走道上同一排（走近點 ap）
    const IT=E.interactables; z.seats=[];
    for(const s of G.sides) for(const c of s.aisles) for(const r of [2,6]){ const d=r*G.T+0.5, [sx,sz]=s.at(c+G.AW/2+0.25,d), [ax,az]=s.at(c,r*G.T+0.62);
      const seat={x:sx,z:sz,y:G.H0+r*G.R,yaw:s.yaw,ap:[ax,az],lv:0}; z.seats.push(Object.assign({kind:'gym'},seat)); IT.push({x:ax,z:az,radius:0.5,lv:0,label:'坐在看台',seat}); }
    if(cer){ const LS=A.sets.ceremony.lawSeats; for(const zz of LS.z){ const seat={x:LS.x,z:zz,y:0,yaw:Math.PI,ap:[LS.ap,zz],lv:0}; z.seats.push(Object.assign({kind:'ceremony'},seat)); IT.push({x:LS.ap,z:zz,radius:0.4,lv:0,label:'坐下（法律學院）',seat}); } }   /* 典禮那天：法律學院那一區靠中間走道的座位 */
    IT.push({x:A.exit.at.x,z:A.exit.at.z,radius:0.5,lv:0,label:A.exit.label,exit:{to:'gym',spawn:Object.assign({},ARENA_DOWN)}});
    for(const q of A.interact||[]) if(ARENA_LOOK[q.kind]){ const k=q.kind; IT.push({x:q.x,z:q.z,radius:1.4,lv:0,label:q.label,onInteract:()=>{ const n=z.lookN[k]=(z.lookN[k]||0)+1, G1=typeof GAME!=='undefined'?GAME.G:null; if(typeof GAME!=='undefined'&&GAME.caption) GAME.caption('',arenaLook(k,G1,z,n-1),4600); }}); }
    z.lookN={};
    z.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gym_arena']){ ASSETS.loadOne('bldg.gym_arena').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      const sets=['SET_STAGE','SET_CEREMONY','SET_LECTURE','SET_CONCERT'].map(n=>root.getObjectByName(n)).filter(Boolean); for(const o of sets) o.visible=!!z.ceremonyOn&&(o.name==='SET_STAGE'||o.name==='SET_CEREMONY');   /* 典禮那天打開舞台＋典禮（SET-CEREMONY-1023）*/   /* 布置平常藏著（劇情要用時打開：導航加椅子區的阻擋，見 gym_layout.js arena.sets）*/
      Z3.attachRoomGLB(z,g0,fb,root); glowBatch(E,z,g0,root,'gym_arena_glows'); for(const o of sets) setGlowBatch(E,z,o,o.name+'_glows'); const G0=typeof GAME!=='undefined'?GAME.G:null; if(G0) z.applyTime(G0.hour,G0.weather); }).catch(e=>console.warn('3F 主球場正式模型載入失敗，用程序化備用模型',e)); }
    return z; } };
  return {gym,gym_b1,gym_arena,ceremonyDay,ceremonyNav,arenaGeo,arenaLook,ARENA_LOOK,ARENA_UP,ARENA_DOWN,CAMPUS,buildNav,LOOK,badminton,vending,fountain,fitStage,JOIN,SERVE,VEND,rec,workout,deskB1,FIT_LINES,fourthMonday};
})();
Z3.ZONES.gym=GY3.gym; Z3.ZONES.gym_b1=GY3.gym_b1; Z3.ZONES.gym_arena=GY3.gym_arena;
