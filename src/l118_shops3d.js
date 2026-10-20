/* 118 巷九間店的室內區域 l118_<id>（LANE118-SHOPS-1020，X66；使用者 2026-10-20「店裡可以進去 店員也在裡面 認真設計每個店面」）。
   模型與配置：LAWWW2-C（assets/models/env/second_ai/l118_<id>.glb／.layout.json → src/data/l118_shop_layouts.js，tools/lane118/gen_shop_layouts.py 產生）；
   接線照 LAWWW2-C 的測試接線（docs/art-rebuild/second_ai/patches/l118_shops_wire_test.diff），做法照 us3d.js 的 us_lawlib。店員在 story3d.js（layout 的 clerk）、點餐照舊 L118.order */
const L118S=(function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)){ if(m.userData.l118Base==null) m.userData.l118Base=m.emissiveIntensity!=null?m.emissiveIntensity:1; out.push(m); } } }); return out; }
  function setGlow(mats,k){ for(const m of mats) m.emissiveIntensity=m.userData.l118Base*k; }
  /* 門外的巷子（WALL_S_view：從 lane118_street.glb 拍的白天的圖）：晚上調暗，不用另外拍夜景（LAWWW-C 10-20 回 LAWWW2-C）*/
  function viewMats(root){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||out.includes(m)) continue; if(!/_view/i.test(o.name||'')&&!/_view$/i.test(m.name||'')) continue;
      if(!m.userData.l118View){ if(m.map&&m.emissive&&m.color){ m.emissive.setRGB(1,1,1); m.emissiveMap=m.map; m.color.setRGB(0,0,0); m.needsUpdate=true; m.userData.l118View={c:null,e:1}; }   /* 門外的照片改成自己發光、不受店裡的燈影響（BB-C 10-20：晚上 20:32 從一一八茶飲的玻璃門看出去還是白天的亮度——晚上店裡的燈開著，照亮了門外那張照片）*/
        else if(m.color) m.userData.l118View={c:m.color.clone(),e:m.emissiveIntensity!=null?m.emissiveIntensity:null}; }
      out.push(m); } }); return out; }
  const viewK=h=>{ const t=((h%24)+24)%24; if(t>=19||t<5.5) return 0.32; if(t>=17.5) return 1-0.68*(t-17.5)/1.5; if(t<6.5) return 0.32+0.68*(t-5.5); return 1; };
  function setView(mats,h){ const k=viewK(h); for(const m of mats){ const b=m.userData.l118View; if(!b) continue; if(b.c) m.color.copy(b.c).multiplyScalar(k); if(b.e!=null) m.emissiveIntensity=b.e*k; } }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  function zoneFor(id){ const L=L118_SHOP_LAYOUTS[id];
    return { id:'l118_'+id, name:L.name+'（118 巷）', indoor:true, camDist:L.cam_dist||4.2, build(E){ const Bd=L.bounds, H=L.h||3.2;
      const W=Math.max(-Bd.x0,Bd.x1)*2+3, D=Math.max(-Bd.z0,Bd.z1)*2+3;
      const z=Z3.room(E,{w:W,d:D,h:H,windows:false,warm:true,wallColor:'#efe8dc',floorTex:W3.stoneTex('#c8bba6'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
      plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,M('#c8bba6'),0,0,0.005); const bm=M('#b9a486'); for(const b of L.blocks){ const h=/fridge|bookshelf|kitchen/.test(b.why)?1.9:0.9; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamps=[]; const cx=(Bd.x0+Bd.x1)/2; for(const zz of [Bd.z0+2.2,(Bd.z0+Bd.z1)/2,Bd.z1-2.0]){ const l=new THREE.PointLight(0xfff1dc,3,12,2); l.position.set(cx,H-0.4,zz); l.userData.on=5; l.userData.off=3.2; g0.add(l); lamps.push(l); }
      let glow=[], views=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); setView(views,h); };
      const IT=E.interactables; z.seats=[];
      for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; if(s.ap) st.ap=s.ap; z.seats.push(st); IT.push({x:s.x,z:s.z,radius:0.7,lv:0,prio:0.3,seat:st,label:s.label||'坐下'}); }   /* prio：站在椅子旁邊要坐下時，「坐下」比旁邊的電視、自取的湯優先（BB-C 10-20 家常菜） */
      for(const q of L.interact) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,prio:-0.3,label:q.label,look:q.note||q.label});   /* 只是看的東西（電視、自取的湯）讓位給坐下、點餐、出口：家常菜的湯就在椅子後面（BB-C 10-20） */
      if(L.order) IT.push({x:L.order.x,z:L.order.z,radius:L.order.r,lv:0,label:L.order.label,shop118:id});
      for(const X of L.exits){ const so=L.street.spawn_out; IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:{to:'lane118',spawn:{x:so.x,z:so.z,yaw:so.yaw}}}); }
      z.formal=false; const key='bldg.l118_'+id; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
        glow=glowMats(root,/^GLOW_/); views=viewMats(root); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('118 巷店面正式模型載入失敗',id,e));
      return z; } }; }
  if(typeof L118_SHOP_LAYOUTS!=='undefined') for(const id of Object.keys(L118_SHOP_LAYOUTS)){ Z3.ZONES['l118_'+id]=zoneFor(id);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.l118_'+id]={url:'assets/models/env/second_ai/l118_'+id+'.glb',type:'building',lazy:true,source:'LAWWW2-C lane118_shops.py',license:'本作'}; }
  return {viewK,zoneFor,viewMats,setView};
})();
