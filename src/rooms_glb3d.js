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
  const HOST=()=>({wancai:typeof WANCAI_LAYOUT!=='undefined'?WANCAI_LAYOUT:null, linze:typeof LINZE_LAYOUT!=='undefined'?LINZE_LAYOUT:null});
  function hostDoor(id){ const h=ROOM_GLB_LAYOUTS[id].host_door, HL=HOST()[h.zone]; return HL?{h,HL,d:HL.doors.find(q=>q.id===h.id)}:null; }
  function backSpawn(id){ const r=hostDoor(id); if(!r||!r.d) return null; return {x:r.d.x,z:-r.HL.D/2+(r.h.zone==='linze'?1.0:1.4),lv:r.d.lv,yaw:Math.PI}; }   /* 門前面（霖澤館照 201 的 spawnBack；萬才館在門的互動範圍外面一點），面向南 */
  /* 看東西的字：配置檔的 note 有字就用；dev 那一欄是 LAWWW2 給開發組的話（不會出現在遊戲裡）。
     AA_355 1-3（AA-C 2026-10-21）：白板（研討室 A、多功能教室）——當天有事件或課堂寫字的照事件的字，這一句是沒有字的時候用（現在還沒有寫白板的事件＝一律這一句）；
     202 的是黑板，不套。其他還沒有 AA 字的（書櫃、借用登記表、黑板、公告欄）照舊顯示名稱 */
  const BOARD='（白板上還留著上一堂課的字，擦了一半。）';
  const LOOK={ wancai_sema:{ board:BOARD }, wancai_multi:{ board:BOARD } };
  const lookText=(id,q)=>(LOOK[id]&&LOOK[id][q.id])||q.note||q.label;
  if(typeof Z3!=='undefined') Z3.roomGlbLook=lookText;   /* 測試、除錯用 */
  function zoneFor(id){ const L=ROOM_GLB_LAYOUTS[id], WIN=L.windows;
    return { id, name:L.name, indoor:true, camDist:L.cam_dist||4.2, build(E){ const Bd=L.bounds, H=L.h||3.2, W=Bd.x1-Bd.x0, D=Bd.z1-Bd.z0;
      const z=Z3.room(E,{w:W,d:D,h:H,cool:true,winWall:WIN.wall,winXs:WIN.xs.map(x=>WIN.wall==='front'?-x:x),winY:WIN.y,view:L.view||id,viewDepth:30,wallColor:'#ece7dc',floorTex:W3.stoneTex('#9c7a58'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; if(z.winParts&&z.winParts.some(p=>p.obj===o)) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      const nav=new E3.NavGrid(W,D,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W+3,d:D+3};
      plane(fb,W,D,M('#9c7a58'),0,0,0.005); const bm=M('#8e6a4a'); for(const b of L.blocks){ const h=/bookcase/.test(b.why)?2.0:0.75; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamps=[]; for(const [x,zz] of [[-2.8,0],[2.8,0]]){ const l=new THREE.PointLight(0xf6f8ff,3,12,2); l.position.set(x,H-0.4,zz); l.userData.on=5; l.userData.off=3.2; g0.add(l); lamps.push(l); }
      let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); };
      const IT=E.interactables; z.seats=[];
      z.glbRoom=true;   /* CLS.syncRooms 認得：上課時同學照課表坐進來（classes3d.js roomy）*/
      for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0,room:L.host_door.id,kind:s.kind||'class'}; if(s.ap) st.ap=s.ap; z.seats.push(st); IT.push({x:s.x,z:s.z,radius:0.7,lv:0,prio:0.3,seat:st,label:s.label||'坐下'}); }
      for(const q of L.interact) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,prio:-0.3,label:q.label,look:lookText(id,q)});
      for(const X of L.exits) IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:{to:L.host_door.zone,spawn:backSpawn(id)}});
      z.teacherSpot=L.teacherSpot||L.clerk||null; if(L.spawn) z.spawn=Object.assign({},L.spawn);   /* 直接進來（「直接去上課」GM.enter 沒給落點）：站在門口裡面 */
      z.formal=false; const key='bldg.'+id; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
        glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('萬才館房間正式模型載入失敗',id,e));
      return z; } }; }
  if(typeof ROOM_GLB_LAYOUTS!=='undefined') for(const id of Object.keys(ROOM_GLB_LAYOUTS)){ Z3.ZONES[id]=zoneFor(id);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.'+id]={url:'assets/models/env/second_ai/'+id+'.glb',type:'building',lazy:true,source:'LAWWW2-C '+(id==='wancai_sema'?'wancai_seminar.py':'flat_classroom.py'),license:'本作'};
    /* 那棟樓的門：接成出入口（測試用；正式改 linze_layout.js／wancai_layout.js 的 doors，門口上課的流程由 LAWWW-C 改）。霖澤館的門用 building3d.js 的 d.spawn、萬才館用 wancai3d.js 的 d.to */
    const r=hostDoor(id); if(r&&r.d){ delete r.d.closed; r.d.to=id; r.d.spawn=Object.assign({},ROOM_GLB_LAYOUTS[id].spawn); } }
})();
