/* 新體育館（綜合體育館）室內 第一階段：大廳＋1F 多功能球場（BB_151；LAWWW2-B 4d19c88d：src/data/gym_layout.js v2＋gym_interior.glb）。
   校園的體育館門口（classes3d.js 的 DOORS.gym）按下去走進來；體育課照舊可以在門口上，也可以在球場中圈「體育課集合」上（同一堂課、同一套出席）。
   3F 主球場、B1 健身中心與游泳池是下一階段：樓梯口用紅龍＋告示關起來（D38 第 4 條）。
   程序化的量體放在 fb（備用模型，dyn）：正式模型載入後整組藏起來；導航、座位、互動點、出口不受影響（和社科院圖書館一樣）。
   畫面上的字（服務台、開館時間、公告欄、樓層指引、樓梯口的告示）照配置檔與 BB_151 查到的開館時間，是設施的說明，不是劇情。 */
const GY3=(function(){
  const L=()=>GYM_LAYOUT;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.8},o||{}));
  const CAMPUS={x:74,z:58.0,yaw:Math.PI};
  const LOOK={
    gym_desk:'服務台：刷學生證進場。',
    gym_hours:'開館時間：週一到週五 08:00～22:00、週六 09:00～22:00、週日 09:00～18:00。',
    closed_3f:'樓梯口拉著紅龍：「3F 主球場　今日不開放」。',
    closed_b1:'樓梯口拉著紅龍：「B1 游泳池・健身中心　今日不開放」。',
    gym_notice:'公告欄：系際盃籃球賽報名、羽球場借用規則、體適能檢測、游泳池冬季開放、失物招領。最下面一張：球場內禁止飲食。',
    gym_directory:'樓層指引：3F 主球場／1F 多功能球場（目前位置：1F 大廳）／B1 健身中心・游泳池。'
  };
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
    for(const it of Ly.items) if(it.kind==='stairs_up'||it.kind==='stairs_down'){ const cx=(it.x0+it.x1)/2, rope=new THREE.Mesh(new THREE.BoxGeometry(it.x1-it.x0,0.06,0.06),red); rope.position.set(cx,0.9,it.kind==='stairs_up'?it.z1+0.1:it.z1+0.3); fb.add(rope); }
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
      GM.advance(1); if(C&&C.slotUse) C.slotUse(G,plan.uses); r.sportDay=G.day;
      const wk=wkOf(G); if(r.wk!==wk){ r.wk=wk; r.wkN=0; r.seen=[]; } if((r.wkN|0)<2){ r.wkN=(r.wkN|0)+1; r.fit=Math.min(100,(r.fit|0)+1); }   /* 體能 +1，每週最多算 2 次（和健身的 3 次分開）*/
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
    const AT={closed_3f:{x:-16.0,z:17.4}};   /* 配置的 (−18,18.6) 在樓梯量體和前牆之間（站不住）：移到樓梯口朝大廳的那一側 */
    for(const q0 of Ly.interact){ const q=Object.assign({},q0,AT[q0.kind]||{}); if(LOOK[q.kind]) IT.push({x:q.x,z:q.z,radius:1.2,lv:0,label:q.label,look:LOOK[q.kind]}); else if(q.kind==='pe_class') IT.push({x:q.x,z:q.z,radius:1.4,lv:0,label:'體育課集合',mark:true,onInteract:()=>peClass(GAME)});
      else if(q.kind==='badminton'||q.kind==='vending'||q.kind==='fountain'){ const f={badminton,vending,fountain}[q.kind]; IT.push({x:q.x,z:q.z,radius:1.2,lv:0,label:q.label,gym:q.kind,onInteract:()=>scene(GAME,f)}); } }   /* AA_174 */
    IT.push({x:Ly.exit.at.x,z:18.5,radius:0.8,lv:0,label:Ly.exit.label,exit:{to:'campus',spawn:Object.assign({},CAMPUS)}});   /* 出生點 z 17.6：出口範圍 0.8 m，一進來不會先看到「離開」*/
    // 正式模型（GLB）：第二會場平常藏起來；樓梯口的告示畫字
    z.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gym_interior']){ ASSETS.loadOne('bldg.gym_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      Z3.attachRoomGLB(z,g0,fb,root);
      const sh=root.getObjectByName('SET_SECONDHALL'); if(sh) sh.visible=false;   /* 畢業典禮那天才打開（打開時導航加 sets.second_hall.blocks；下一階段）*/
      root.traverse(o=>{ if(!o.isMesh) return; if(o.name==='PLATE_FACE_gym_stairs_up') paintPlate(o,['3F 主球場','今日不開放']); else if(o.name==='PLATE_FACE_gym_stairs_down') paintPlate(o,['B1 游泳池・健身中心','今日不開放']);
        if(o.material&&o.material.name==='gym_window_sky'&&!skyMats.includes(o.material)){ if(o.material.userData.gyBase==null) o.material.userData.gyBase=o.material.emissiveIntensity||1; skyMats.push(o.material); } });
      const G=typeof GAME!=='undefined'?GAME.G:null; if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('體育館正式模型載入失敗，用程序化備用模型',e)); }
    return z; } };
  return {gym,CAMPUS,buildNav,LOOK,badminton,vending,fountain,fitStage,JOIN,SERVE,VEND,rec};
})();
Z3.ZONES.gym=GY3.gym;
