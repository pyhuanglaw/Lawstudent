/* 測試用（LAWWW2-C 臨時接線；正式接線由 LAWWW-C 做）：走得進去的房間（照霖澤館 3F、118 巷店面的做法）。
   wancai_sema：萬才館 2F 研討室 A（wancai_layout.js doors.seminarA）；linze_202：霖澤館 2F 的 202（linze_layout.js doors.c202）；
   wancai_multi：萬才館 1F 多功能教室（wancai_layout.js doors.multi）。配置 src/data/room_glb_layouts.js（從 layout.json 產生），門的資料在 layout 的 host_door。
   進出：那棟樓的門 → 這裡；「離開…」→ 回到那個門前面。
   課堂、社課怎麼從「門口上課」改成走進來坐下，由 LAWWW-C 改 classes3d.js（這裡只把門接成出入口；座位 kind 'class'、teacherSpot 在 layout）。 */
(function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)){ if(m.userData.wrBase==null) m.userData.wrBase=m.emissiveIntensity!=null?m.emissiveIntensity:1; out.push(m); } } }); return out; }
  function setGlow(mats,k){ for(const m of mats) m.emissiveIntensity=m.userData.wrBase*k; }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  const HOST=()=>({wancai:typeof WANCAI_LAYOUT!=='undefined'?WANCAI_LAYOUT:null, linze:typeof LINZE_LAYOUT!=='undefined'?LINZE_LAYOUT:null, dorm_hall:typeof DORM_LAYOUT!=='undefined'?DORM_LAYOUT:null, library_hall:typeof LIBRARY_LAYOUT!=='undefined'?LIBRARY_LAYOUT:null});   /* dorm_hall：宿舍的門（洗衣間、205；dorm3d.js 認 d.to／d.gate）；library_hall：總圖 2F 多媒體中心（library3d.js）*/
  function hostDoor(id){ const h=ROOM_GLB_LAYOUTS[id].host_door, HL=HOST()[h.zone]; return HL?{h,HL,d:HL.doors.find(q=>q.id===h.id)}:null; }
  function backSpawn(id){ const r=hostDoor(id), BS=ROOM_GLB_LAYOUTS[id].back_spawn; if(BS) return Object.assign({},BS); if(!r||!r.d) return null;   /* 配置有 back_spawn 就用它（共同教學館 3F：2F 樓梯口；宿舍：走廊上門的互動點）*/   /* 不是 doors 裡的門（共同教學館 3F：2F 樓梯口）：配置的 back_spawn */
    return {x:r.d.x,z:-r.HL.D/2+(r.h.zone==='linze'?1.0:1.4),lv:r.d.lv,yaw:Math.PI}; }   /* 門前面（霖澤館照 201 的 spawnBack；萬才館在門的互動範圍外面一點），面向南 */
  /* 看東西的字：配置檔的 note 有字就用；dev 那一欄是 LAWWW2 給開發組的話（不會出現在遊戲裡）。
     AA_355 1-3（AA-C 2026-10-21）：白板（研討室 A、多功能教室）——當天有事件或課堂寫字的照事件的字，這一句是沒有字的時候用（現在還沒有寫白板的事件＝一律這一句）。
     AA_355 5-1（2f1aaa22）：研討室 A 的書櫃、借用登記表；202 的黑板（同白板：沒有課堂寫字的時候用這一句；現在沒有寫黑板的課堂＝一律這一句）、公告欄；多功能教室的公告欄。台詞照抄 */
  const BOARD='（白板上還留著上一堂課的字，擦了一半。）';
  const LOOK={ us_lawlib_2f:{ stacks:'（書架很高，最上層要用梯子。整排都是很舊的判例彙編。）' },   /* AA_399 第 8 節（AA_287 第 120 行）*/
    wancai_sema:{ board:BOARD, books:'（書櫃裡是歷屆的研究所論文，有些書背的字已經褪色了。）', signup:'（借用登記表夾在門邊。今天下午那一格，已經有人寫了名字。）' },
    linze_202:{ board:'（黑板角落寫著「下週停課」，不知道是哪一堂的。）', notice:'（公告欄上貼著獎學金、徵才、讀書會的傳單，最上面那張一直被風吹起來。）' },
    wancai_multi:{ board:BOARD, notice:'（公告欄上只剩一張場地借用規則，四個角都用膠帶補過。）' } };
  const lookText=(id,q)=>(LOOK[id]&&LOOK[id][q.id])||q.note||q.label;
  if(typeof Z3!=='undefined') Z3.roomGlbLook=lookText;   /* 測試、除錯用 */
  /* 兩套布置的房間（研討室 B：平常＝初談隔間 consult，2028-10-26＝推甄面試 interview；LAWWW2-B 10-24）：sets.<名字>＝{node, blocks, seats, spots}，set_days＝{日期:名字}，其他日子 set_default。
     進區域那一刻照當天決定（同一天不會換），GLB 的 SET_<名字> 節點只開那一套 */
  function setOf(L,G){ if(!L.sets) return null; const k=G&&L.set_days&&typeof CALENDAR!=='undefined'?L.set_days[CALENDAR.dateOf(G.day).key]:null; return k&&L.sets[k]?k:(L.sets[L.set_default]?L.set_default:null); }
  /* 有開放時段的房間（L.open；研討室 B＝AA_399 第 5 節：單週六 09:00～12:00＋事件那天；系辦＝第 7 節：平日 09:00～12:00、13:30～17:00）：門照舊是門上的字（closed），時段內才變成出入口（wancai3d.js、building3d.js 的 d.gate）。
     open＝{wd:星期（數字或陣列；1＝週一…6＝週六）, h0, h1（或 ranges:[[h0,h1],…]）, holiday:false（國定假日不開）, termWeeks:'odd'（學期的第 1、3、5…週）, days:[整天開的日期], dayHours:[h0,h1]（days 那幾天只在這段時間開；博雅 203＝AA_399 第 10 節：SK07 那一晚 18:30～21:30）, daysOnly:true（只有 days 那幾天開）,
       range:[起,迄]（只有這段日子，含頭尾）, who:人物 id（他不在的日子不開：characters.js 的 presence.absentDates；宿舍 205＝AA_399 第 11 節：方奕廷大一 21～23 在的時候）}；沒有 open＝一直開 */
  function openNow(L,G){ const O=L&&L.open; if(!O) return true; if(!G||typeof CALENDAR==='undefined') return false; const q=CALENDAR.dateOf(G.day);
    if(Array.isArray(O.days)&&O.days.includes(q.key)){ const h=G.hour%24, DH=O.dayHours; if(!DH||(h>=DH[0]&&h<DH[1])) return true; if(O.daysOnly) return false; } else if(O.daysOnly) return false; const wds=O.wd==null?[]:[].concat(O.wd); if(wds.length&&!wds.includes(q.wd)) return false;
    if(O.range&&(q.key<O.range[0]||q.key>O.range[1])) return false;
    if(O.who&&typeof CHARACTERS!=='undefined'){ const P=(CHARACTERS[O.who]||{}).presence; if(P&&Array.isArray(P.absentDates)&&P.absentDates.some(a=>q.key>=a[0]&&q.key<a[1])) return false; }
    if(O.dating){ const F=G.flags||{}, R=F.romance||{}; if(!(F['dating_'+O.dating]===true||(R[O.dating]&&R[O.dating].status==='dating'))) return false; }   /* dating：交往中才開（美國臥室 C＝學姊的房間；和各支線的 S.dating 同一個判斷）*/
    if(O.holiday===false&&CALENDAR.holiday&&CALENDAR.holiday(G.day)) return false;
    const h=G.hour%24, R=O.ranges||(O.h0!=null?[[O.h0,O.h1]]:null); if(R&&!R.some(r=>h>=r[0]&&h<r[1])) return false;
    if(O.termWeeks){ const t=CALENDAR.termOf(G.day); if(!t) return false; if(O.termWeeks==='odd'&&t.week%2!==1) return false; if(O.termWeeks==='even'&&t.week%2!==0) return false; } return true; }
  /* 門的互動點照開放時段藏起來（wancai3d.js、building3d.js 的門）：shut＝false 是「進入…」（時段外藏起來）、true 是原本的門（時段內藏起來）；每一格問一次 */
  function gateHide(it,shut){ Object.defineProperty(it,'hidden',{configurable:true,enumerable:true,get(){ const G=G_(), op=!!G&&openNow(ROOM_GLB_LAYOUTS[it.gate],G); return shut?op:!op; }}); return it; }
  if(typeof Z3!=='undefined'){ Z3.roomGlbSet=(id,G)=>ROOM_GLB_LAYOUTS[id]?setOf(ROOM_GLB_LAYOUTS[id],G):null; Z3.roomGlbOpen=(id,G)=>openNow(ROOM_GLB_LAYOUTS[id],G); Z3.roomGlbGate=gateHide; }
  const BACKDROP=new Set(['linze_202','wancai_multi']);   /* 牆外暗殼的房間（LAWWW2-C 10-28 逐間確認過：窗都有窗景板）*/
  function zoneFor(id){ const L=ROOM_GLB_LAYOUTS[id], WIN=L.windows;
    return { id, name:L.name, indoor:true, windowless:!(WIN&&WIN.xs&&WIN.xs.length), camDist:L.cam_dist||4.2, build(E){   /* windowless：沒有窗的房間（視聽室、美國法圖 2F）晚上和白天一樣亮（engine3d.js applyTime）*/ const sk=setOf(L,G_()), SET=sk?L.sets[sk]:null, BL=SET?SET.blocks:L.blocks, SE=SET?SET.seats:L.seats; const Bd=L.bounds, H=L.h||3.2, W=Bd.x1-Bd.x0, D=Bd.z1-Bd.z0;
      const z=Z3.room(E,{w:W,d:D,h:H,cool:true,winWall:WIN.wall,winXs:WIN.xs.map(x=>WIN.wall==='front'?-x:x),winY:WIN.y,view:(L.view_season==='us'&&typeof US3!=='undefined'&&US3.usSeasonKey?L.view+'_'+US3.usSeasonKey():L.view)||id,viewDepth:30,wallColor:'#ece7dc',floorTex:W3.stoneTex('#cdb594'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});   /* view_season:'us'：窗景照美國篇的季節換（us_bed_c_summer／autumn／bare／snow，us3d.js 的 usSeasonKey）*/
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; if(z.winParts&&z.winParts.some(p=>p.obj===o)) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      const nav=new E3.NavGrid(W,D,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of BL) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W+3,d:D+3};
      plane(fb,W,D,M('#9c7a58'),0,0,0.005); const bm=M('#8e6a4a'); for(const b of BL){ const h=/bookcase/.test(b.why)?2.0:0.75; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamps=[]; for(const [x,zz] of (L.lamps||[[-2.8,0],[2.8,0]])){ const l=new THREE.PointLight(0xf6f8ff,3,12,2); l.position.set(x,H-0.4,zz); l.userData.on=5; l.userData.off=3.2; g0.add(l); lamps.push(l); }
      let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); };
      const IT=E.interactables; z.seats=[];
      z.glbRoom=true;   /* CLS.syncRooms 認得：上課時同學照課表坐進來（classes3d.js roomy）*/
      for(const s of SE){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0,room:L.host_door.id,kind:s.kind||'class'}; if(s.ap) st.ap=s.ap; z.seats.push(st); IT.push({x:s.x,z:s.z,radius:0.7,lv:0,prio:0.3,seat:st,label:s.label||'坐下'}); }
      for(const q of L.interact) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,prio:-0.3,label:q.label,look:lookText(id,q)});
      for(const X of L.exits) IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:{to:L.host_door.zone,spawn:backSpawn(id)}});
      z.teacherSpot=L.teacherSpot||L.clerk||null; if(L.spawn) z.spawn=Object.assign({},L.spawn); z.roomSet=sk; z.spots=(SET?SET.spots:L.spots)||null;   /* spots：人站／坐的位置（研討室 B：柏翰值班、志工、口試委員…；劇情放人用）*/   /* 直接進來（「直接去上課」GM.enter 沒給落點）：站在門口裡面 */
      if(BACKDROP.has(id)&&Z3.roomBackdrop) Z3.roomBackdrop(g0,W,D,H,7,(Bd.x0+Bd.x1)/2,(Bd.z0+Bd.z1)/2);   /* 牆外暗色的殼（INTERIOR-AAA-REVIEW-1028，見 zones3d.js roomBackdrop）：只給窗都有窗景板、沒有玻璃隔間的房間 */
      if(L.cam_box) z.camBox=L.cam_box; if(L.see_thru) z.seeThru=true;   /* 宿舍 205（和祐廷的房間同一型）：運鏡只在中間走道、上鋪擋住時網點透空（同 zones3d.js 的 dorm）*/
      /* glb：借另一個區域的正式模型（法圖 2F 書庫＝一樓那一個 us_lawlib.glb 往下 glb_y，glb_hide 的節點藏起來）；自己的 GLB（bldg.<id>）只放這一層才有的東西，另外加進來（LAWWW2-B 10-24）*/
      z.formal=false; const key='bldg.'+(L.glb||id); if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); if(L.glb_y) root.position.y=L.glb_y;
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } if(L.glb_hide&&L.glb_hide.includes(o.name)) o.visible=false; });
        if(L.glb&&has('bldg.'+id)) ASSETS.loadOne('bldg.'+id).then(c2=>{ if(!c2||!c2.scene||E.zone!==z) return; const r2=c2.scene.clone(true); r2.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g0.add(r2); glow=glow.concat(glowMats(r2,/^GLOW_/)); }).catch(e=>console.warn('房間的另一個模型載入失敗',id,e)); Z3.attachRoomGLB(z,g0,fb,root); if(L.dorm_interior&&Z3.attachDormInterior) Z3.attachDormInterior(z,g0,root); z.formal=true; if(L.sets) root.traverse(o=>{ if(/^SET_/.test(o.name)) o.visible=!!SET&&o.name===SET.node; });
        glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('萬才館房間正式模型載入失敗',id,e));
      return z; } }; }
  if(typeof ROOM_GLB_LAYOUTS!=='undefined') for(const id of Object.keys(ROOM_GLB_LAYOUTS)){ Z3.ZONES[id]=zoneFor(id);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.'+id]={url:'assets/models/env/second_ai/'+id+'.glb',type:'building',lazy:true,source:'LAWWW2-C '+(id==='wancai_sema'?'wancai_seminar.py':'flat_classroom.py'),license:'本作'};
    /* 那棟樓的門：接成出入口（測試用；正式改 linze_layout.js／wancai_layout.js 的 doors，門口上課的流程由 LAWWW-C 改）。霖澤館的門用 building3d.js 的 d.spawn、萬才館用 wancai3d.js 的 d.to */
    const r=hostDoor(id); if(r&&r.d){ if(ROOM_GLB_LAYOUTS[id].open) r.d.gate=id; else delete r.d.closed; r.d.to=id; r.d.spawn=Object.assign({},ROOM_GLB_LAYOUTS[id].spawn); } }   /* 有開放時段的（open）：closed 留著（時段外照舊是門上的字），d.gate 給 wancai3d.js 判斷 */
})();
