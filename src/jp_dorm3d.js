/* 日本交換那一學期：國際學生宿舍的 3D 區域（LAWWW2-C 2026-10-21；AA_341 第 5 節「給 LAWWW2 的日本場景清單」優先 1）。
   配置 src/data/jp_dorm_layouts.js（從 tools/blender/env_second/jp_dorm.py 匯出的 <id>.layout.json 產生：tools/blender/env_second/gen_jp_layouts.py）；正式模型 bldg.<id>。
   jp_room：你的房間（hub：睡覺、讀書、看手機）。照 2D 背景 jp_room.webp：書桌靠窗、書櫃、床頭靠窗的單人床、掛勾上的外套、玄關、拉門衣櫃、小冰箱。
     窗外的景 assets/models/env/views/jp_room_{day,night}.webp（jp_view.py：田、遠一點的一座山、電線、瓦屋頂）。
   出口「走出房間」→ jp_dorm（下一階段：走廊、共用廚房、大廳）；還沒有那個區域的時候回到 2D 的據點 jp_hub。
   和 jp3d.js 的據點怎麼接（選單「在房間休息一下」「睡覺」走進這裡、床的「睡覺」、書桌「坐下」讀書）由 LAWWW-C 決定；這裡只提供區域＋互動點（look 的 id：window、bed、fridge、suitcase）。
   「看」的字：窗外、小冰箱、行李箱照 AA_341 檔尾附加（JP.roomLook，src/jp3d.js；窗外 4/30 以前、5/1 以後兩句）。
   試玩（開發用）：網址加 ?jpdemo，左上角多一顆「日本宿舍（測試）」按鈕。 */
(function(){
  if(typeof JP_DORM_LAYOUTS==='undefined'||typeof Z3==='undefined') return;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)){ if(m.userData.jpBase==null) m.userData.jpBase=m.emissiveIntensity!=null?m.emissiveIntensity:1; out.push(m); } } }); return out; }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  const night=h=>{ h=((h%24)+24)%24; return h<6.3||h>=18.2; };
  function exitTo(X){ return (typeof Z3.ZONES[X.to]!=='undefined')?{to:X.to,spawn:X.spawn||null}:{to:'jp_hub',spawn:null}; }   /* 下一階段的區域還沒有：回 2D 的據點 */
  function zoneFor(id){ const L=JP_DORM_LAYOUTS[id], WIN=L.windows;
    return { id, name:L.name, indoor:true, camDist:L.cam_dist||3.2, build(E){ const Bd=L.bounds, H=L.h||2.5, W=Bd.x1-Bd.x0, D=Bd.z1-Bd.z0;
      const z=Z3.room(E,{w:W,d:D,h:H,winWall:WIN.wall,winXs:WIN.xs.map(x=>WIN.wall==='front'?-x:x),winY:WIN.y,view:L.view||id,viewDepth:30,wallColor:'#e6e0d4',floorTex:W3.stoneTex('#d3bf9c'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; if(z.winParts&&z.winParts.some(p=>p.obj===o)) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      /* 導航格往西偏 0.2 m（多一欄）：書桌（離牆 0.61）和床（寬 1.0）中間的走道 1.19 m，格子照房間邊界排的話，走道正中間沒有一欄格子，
         兩側的格子都貼著家具，「站得住」（離擋住的格子 0.33 m）的一格都沒有，窗前走不到（reachability_all 2026-10-21 FAIL）*/
      const nav=new E3.NavGrid(W+0.4,D,0.4,Bd.x0-0.2,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W+3,d:D+3};
      /* 備用模型（D38 ③）：正式模型載入前、失敗時——地板＋家具的方塊（不是看不見的牆）*/
      plane(fb,W,D,M('#8f6442'),0,0,0.005); const bm=M('#b8916a'); for(const b of L.blocks){ const h=/bookshelf|closet/.test(b.why)?1.8:(/bed/.test(b.why)?0.5:0.75); const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamp=new THREE.PointLight(0xfff2e0,2.2,8,2); lamp.position.set(0,H-0.35,-0.4); g0.add(lamp);   /* 小房間：一盞吸頂燈 */
      let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); lamp.intensity=on?3.2:2.2; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); const k=night(h)?1.0:0.35; for(const m of glow) m.emissiveIntensity=m.userData.jpBase*k; };   /* 檯燈、吸頂燈、筆電螢幕：白天暗一點 */
      const IT=E.interactables; z.seats=[];
      for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0,kind:s.kind||'study'}; if(s.ap) st.ap=s.ap; z.seats.push(st); IT.push({x:s.x,z:s.z,radius:0.7,lv:0,prio:0.3,seat:st,label:s.label||'坐下'}); }
      for(const q of L.interact){ if(q.id==='bed'&&typeof JP!=='undefined'&&JP.bedFromRoom){ IT.push({x:q.x,z:q.z,radius:q.r,lv:0,prio:-0.3,label:'睡覺',jpLook:q.id,onInteract:()=>{ if(typeof GAME!=='undefined') JP.bedFromRoom(GAME); }}); continue; }   /* 床＝回據點睡覺（LAWWW-C 接，jp3d.js S.bedFromRoom）*/
        const lookOf=()=>(typeof JP!=='undefined'&&JP.roomLook?JP.roomLook(q.id,G_()):null)||q.note;   /* 看的字：AA_341 檔尾附加（JP.roomLook，窗外照日子換）；配置檔的 note 有字也可以 */
        if(lookOf()){ const it={x:q.x,z:q.z,radius:q.r,lv:0,prio:-0.3,label:q.label,jpLook:q.id}; Object.defineProperty(it,'look',{enumerable:true,get:lookOf}); IT.push(it); } }   /* 沒有字的不開（不要顯示標籤當內容）；look 每次按的時候才讀（同一個房間跨過 5/1，窗外就換）*/
      for(const X of L.exits) IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:exitTo(X)});
      if(L.spawn) z.spawn=Object.assign({},L.spawn);
      z.formal=false; const key='bldg.'+id; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
        glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('日本宿舍正式模型載入失敗',id,e));
      return z; } }; }
  for(const id of Object.keys(JP_DORM_LAYOUTS)){ Z3.ZONES[id]=zoneFor(id);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.'+id]={url:'assets/models/env/second_ai/'+id+'.glb',type:'building',lazy:true,source:'LAWWW2-C tools/blender/env_second/jp_dorm.py',license:'本作（貼圖 Poly Haven CC0）'}; }
  (function demoButton(){ if(typeof location==='undefined'||!/[?&]jpdemo\b/.test(location.search)) return; const t=setInterval(()=>{ if(typeof GAME==='undefined'||!GAME.G||!GAME.G.zone) return; clearInterval(t);
    const b=document.createElement('button'); b.textContent='日本宿舍（測試）'; b.id='jpDemoBtn';
    Object.assign(b.style,{position:'fixed',left:'calc(env(safe-area-inset-left) + 8px)',top:'calc(env(safe-area-inset-top) + 116px)',zIndex:60,minHeight:'44px',padding:'0 12px',borderRadius:'10px',border:'1px solid #fff8',background:'#3a2f50cc',color:'#fff',font:'15px sans-serif'});
    b.onclick=()=>{ if(GAME.G.zone==='jp_room') return; GAME.enter('jp_room',Object.assign({},JP_DORM_LAYOUTS.jp_room.spawn)); }; document.body.appendChild(b); },500); })();
})();
