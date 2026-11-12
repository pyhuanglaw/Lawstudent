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
  /* 兩層窗景（ART-SHOP-VIEWS-1023 第二批，LAWWW2-B 10-23；使用者「店面外看出去的景也都很假」）：W3.VIEW_LAYERS 有 'l118_<id>' 時，門外那張平面圖（WALL_S_view）換成 W3.windowMat——
     遠景（巷子對面的店）＋去背的近景（巷子裡的機車、電線桿、招牌），兩層各自照景深視差，走動時近的東西移動得比對面的店快；照片在遊戲的 118 巷裡拍（tools/shots/shop_views_layers.py），晚上換夜景照片。
     新的平面照原本那一片的位置和大小；原本那一片還在牆的淡出清單裡（鏡頭退到店外時一起淡出），只是不畫，新的平面跟著它的 visible。照片還沒載好時畫原本那張圖（photo 0） */
  /* 九間店的景深（tools/shots/shop_views_layers.py 量的中位數：遠景＝巷子對面的店、近景＝巷子裡 5.5 m 以內；寫進 tools/shots/shop_views_layers.json）。放在這裡、不改 world3d.js 的表。
     2026-11-11 L118-STREET-FIX-1111（BB_341 第 2 項：店裡往外看還是舊街景、看得到舊店名）：九間的照片在換過店、移過路燈和機車的 118 巷重拍，景深照這次量的（五湖四海的近景這次什麼都沒拍到、量不到，留原本的 5.45）*/
  if(typeof W3!=='undefined'&&W3.VIEW_LAYERS) Object.assign(W3.VIEW_LAYERS,{l118_dian:{far:8,near:5.43},l118_self:{far:8,near:5.44},l118_tea:{far:8.13,near:5.42},l118_home:{far:8,near:5.45},l118_cafe2:{far:8,near:5.46},l118_pasta:{far:8,near:5.45},l118_korea:{far:8,near:5.45},l118_omu:{far:8.13,near:5.42},l118_noodle2:{far:8,near:5.42}});
  function photoView(g0,root,id){ const key='l118_'+id; if(typeof W3==='undefined'||!W3.VIEW_LAYERS||!W3.VIEW_LAYERS[key]||!W3.windowMat) return null; let src=null; root.traverse(o=>{ if(!src&&o.isMesh&&o.name==='WALL_S_view') src=o; }); if(!src) return null;   /* 只換店門外那一片（兩側的鄰居店面卡 WALL_E_nb_view、WALL_W_nb_view 照舊）*/
    root.updateMatrixWorld(true); g0.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(src), sz=b.getSize(new THREE.Vector3()), c=g0.worldToLocal(b.getCenter(new THREE.Vector3()));
    const sm=[].concat(src.material)[0], fb=sm&&(sm.emissiveMap||sm.map)||null, m=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(sz.x,sz.z),sz.y),W3.windowMat(W3.VIEW_LAYERS[key].far));
    m.position.copy(c); m.rotation.y=sz.x>=sz.z?Math.PI:(c.x>0?-Math.PI/2:Math.PI/2); m.name='l118_window_view'; m.userData.dyn=true; m.renderOrder=-1;   /* 門外那一片在店面（+z）那一面、朝店裡（−z）*/
    Object.defineProperty(m,'visible',{configurable:true,get(){ return src.visible; },set(){}});
    for(const x of [].concat(src.material)) if(x){ x.colorWrite=false; x.depthWrite=false; }   /* 原本那一片不畫（還留在淡出清單：鏡頭在店外時它的 visible 變 false，新的平面跟著）*/
    g0.add(m); return {mesh:m,key,fb}; }
  function setPhotoView(pv,h,weather){ if(!pv) return; const night=(h<5.5||h>=19.2), rain=weather==='rain'||weather==='storm', ph=W3.viewPhoto(pv.key,night);   /* 19.4 → 19.2（LAWWW2-B 10-24 路線巡查④）：和引擎的夜晚係數 nk＝1、屋外完全天黑同一刻換夜景；原本晚 0.2 小時，冬天傍晚光線拉長後，12 月 17:35～17:58 屋外全黑、窗外還是調暗的白天照片 */
    W3.setWindowView(pv.mesh.material,pv.key,night,pv.fb,ph?W3.photoTint(h,rain):new THREE.Color(1,1,1).multiplyScalar(viewK(h)).getHex(),ph&&W3.photoFade?W3.photoFade(h):0); }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  /* 看東西的字：配置檔的 note 有字就用（例：家常菜的電視，AA_280 原句）；dev 那一欄是 LAWWW2 給開發組的話（產生的檔，不改；不會出現在遊戲裡）。
     AA_355 1-3（AA-C 2026-10-21）給了滇香小館牆上的織布；5-1（2f1aaa22）給了自取的湯（第一間＝好家自助餐、第二間＝巷口家常菜）、書架（慢讀咖啡）、
     小菜櫃（第一間＝韓食小廚、第二間＝六張犁麵舖）——「第一間、第二間」照配置檔的順序對。台詞照抄 */
  const LOOK={ dian:{ tapestry:'（牆上掛著一塊條紋織布，紅色和深藍色，顏色洗得有點淡了。）' },
    self:{ soup:'（自取的湯，今天是蘿蔔湯。鍋邊貼著「請自取，不要浪費」。）' }, home:{ soup:'（湯桶上寫著「紫菜蛋花」。湯勺掛在桶邊。）' },
    cafe2:{ books:'（書架上大多是舊漫畫，有幾套缺了第一集。）' },
    korea:{ banchan:'（小菜櫃裡有海帶、豆干、滷蛋。豆干只剩兩塊。）' }, noodle2:{ sides:'（小菜櫃的玻璃起霧了，看得到裡面的燙青菜。）' } };
  const lookText=(id,q)=>(LOOK[id]&&LOOK[id][q.id])||q.note||q.label;
  /* 互動鍵覆寫表（L118-IT-REACH-1111；BB 11-11 在使用者電腦用搖桿逐張走到每張椅子的「坐下前站的位置」按互動鍵：好幾張按出來是別張椅子、點餐或看的東西）。
     配置檔（LAWWW2 的 Blender 腳本產生，不手改）照舊；遊戲端在這裡改「按鈕在哪裡出現」，之後交給做模型的人搬回腳本，搬好以後這裡的那一格刪掉。
     遊戲怎麼選按鈕：engine3d.js E.nearestInteractable——在半徑內、「距離－prio」最小的贏（椅子 prio 0.3、點餐 0、看的東西 −0.3）。
     座位用配置的座標「x,z」對（不用序號：腳本重新產生、順序換了也對得上；座標改了這一格就不套用，tests/l118_interact_reach_1111_unit.js 會抓到）：
       i：按鈕的位置（座位本身不動，坐下照樣坐在配置的位置）；ap：坐下前站的位置（GAME.seatApproach、NPC 走過去坐也用）；r：按鈕半徑；sit：坐的位置（只有要挪座位時才寫）。
     點餐 order、看的東西 interact（照配置的 id）：x、z、r、prio。
     同一種毛病的通則：兩張並排、只能從同一頭走近的椅子（靠牆那張＋外側那張，配置給同一個走近點），原本按鈕都在椅子上——靠牆那張永遠比外側那張遠，搖桿走到哪裡都是外側那張。
       改成每張的按鈕在它自己的站位上：卡座沿著走道排開（外側那張在它那一排、靠牆那張往桌子中間 1/3：辛亥韓食、義大麵屋、奈良咖哩、迪倫）、走進桌子和櫃台之間的縫（118牛排）、
       一前一後（五湖四海：外側那張貼桌邊、靠牆那張退一步）。按鈕不在椅子上，點椅子走過去照「離點的位置最近的椅子」挑（engine3d.js tapPref 的 tq，同一張單一起改）。
     測試：node tests/l118_interact_reach_1111_unit.js（九間店每張椅子在至少一個站位上是它、點餐和看的東西各有站得到的位置、點椅子走過去按鈕是那一張）*/
  const IT_DEF={seatR:0.8};   /* 座位按鈕的預設半徑 0.7 → 0.8（BB 11-11 第 3 項：118牛排兩張、五湖四海一張，搖桿停在走近點旁邊 0.709 m，差 1 cm 出界，按鈕變成旁邊客人的「聽一句」）*/
  /* 「#n」＝BB 用的編號（配置的順序，從 1 開始）。內＝靠牆那張、外＝外側那張 */
  /* L118-IT-REACH-1111 收尾（LAWWW2-C 11-12）：這張覆寫表的值（六間 56 張椅子、兩個點餐／看的東西）已經搬回配置——tools/lane118/it_fix.py（各店為什麼這樣排的說明也在那裡），
     lane118_shops.py 匯出時套用；配置的 seats[].i（按鈕位置）、ap（走近點）、r（半徑）、order.prio、interact[].prio 遊戲直接讀。表留著空的：以後 BB 驗到要臨時挪，先寫這裡、再搬回 it_fix.py */
  const L118_IT_FIX={};
  const fixOf=id=>L118_IT_FIX[id]||{};
  /* 店名照店家資料（src/data/lane118_shops.js；L118-SHOPS-REDO-1111，使用者 2026-11-11 九間店換店名）：室內配置檔（LAWWW2 產生，不手改）裡寫的還是配置當時的店名——
     區域名稱、「點餐（○○）」「離開○○」這些按鈕上的店名換成資料的；配置重新產生以後兩邊一樣，這裡就什麼都不換 */
  const shopName=id=>{ const s=typeof LANE118_SHOPS!=='undefined'&&Array.isArray(LANE118_SHOPS.shops)?LANE118_SHOPS.shops.find(q=>q.id===id):null; return (s&&s.name)||L118_SHOP_LAYOUTS[id].name; };
  const reName=(id,t)=>{ const a=L118_SHOP_LAYOUTS[id].name, b=shopName(id); return typeof t==='string'&&a&&a!==b?t.split(a).join(b):t; };
  function zoneFor(id){ const L=L118_SHOP_LAYOUTS[id];
    return { id:'l118_'+id, get name(){ return shopName(id)+'（118 巷）'; }, indoor:true, camDist:L.cam_dist||4.2, build(E){ const Bd=L.bounds, H=L.h||3.2;
      const W=Math.max(-Bd.x0,Bd.x1)*2+3, D=Math.max(-Bd.z0,Bd.z1)*2+3;
      const z=Z3.room(E,{w:W,d:D,h:H,windows:false,warm:true,wallColor:'#efe8dc',floorTex:W3.stoneTex('#c8bba6'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
      plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,M('#c8bba6'),0,0,0.005); const bm=M('#b9a486'); for(const b of L.blocks){ const h=/fridge|bookshelf|kitchen/.test(b.why)?1.9:0.9; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamps=[]; const cx=(Bd.x0+Bd.x1)/2; for(const zz of [Bd.z0+2.2,(Bd.z0+Bd.z1)/2,Bd.z1-2.0]){ const l=new THREE.PointLight(0xfff1dc,3,12,2); l.position.set(cx,H-0.4,zz); l.userData.on=5; l.userData.off=3.2; g0.add(l); lamps.push(l); }
      let glow=[], views=[], pview=null; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); setView(views,h); setPhotoView(pview,h,weather); };
      const IT=E.interactables; z.seats=[]; const FX=fixOf(id), FS=FX.seats||{}, FI=FX.interact||{};
      for(const s of L.seats){ const f=FS[s.x+','+s.z]||{}, at=f.sit||[s.x,s.z], ip=f.i||s.i||at; const st={x:at[0],z:at[1],yaw:s.yaw,lv:0}; if(f.ap||s.ap) st.ap=(f.ap||s.ap).slice(); if(s.lift) st.lift=s.lift;   /* f：覆寫表那一格（L118-IT-REACH-1111）*/   /* lift：吧檯高腳椅（座面 0.76 m，坐姿抬高 0.29＝座面－CHAR.SIT_TOP 0.47，SIT-HEIGHT-1104；原本 0.31＝照 0.45 算；GAME.sitAt 的 seat.lift，和 Café、定食店的吧台一樣）*/ z.seats.push(st); const study=false;   /* AA_772（L118-SHOPS-REDO-1111）：cafe2 現在是大學食堂，桌位不能讀書（原本 L118-CAFE2-STUDY-1030：慢讀咖啡的桌位可以自習；念書搬到木曜日）*/ IT.push({x:ip[0],z:ip[1],radius:f.r||s.r||IT_DEF.seatR,lv:0,prio:0.3,seat:st,label:s.label||(study?'坐下讀書':'坐下'),study}); }   /* study：慢讀咖啡（cafe2）的桌位可以自習（使用者 2026-10-30「慢讀咖啡為什麼不能念書」，L118-CAFE2-STUDY-1030；吧檯高腳椅不算）*/   /* prio：站在椅子旁邊要坐下時，「坐下」比旁邊的電視、自取的湯優先（BB-C 10-20 家常菜） */
      for(const q of L.interact){ const f=FI[q.id]||{}; IT.push({x:f.x!=null?f.x:q.x,z:f.z!=null?f.z:q.z,radius:f.r||q.r,lv:0,prio:f.prio!=null?f.prio:(q.prio!=null?q.prio:-0.3),label:q.label,look:lookText(id,q)}); }   /* 只是看的東西（電視、自取的湯）讓位給坐下、點餐、出口：家常菜的湯就在椅子後面（BB-C 10-20） */
      if(L.order){ const O=Object.assign({},L.order,FX.order||{}); IT.push(Object.assign({x:O.x,z:O.z,radius:O.r,lv:0,label:reName(id,L.order.label),shop118:id},O.prio!=null?{prio:O.prio}:{})); }
      for(const X of L.exits){ const so=L.street.spawn_out; IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:reName(id,X.label),exit:{to:'lane118',spawn:{x:so.x,z:so.z,yaw:so.yaw}}}); }
      z.formal=false; const key='bldg.l118_'+id; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
        glow=glowMats(root,/^GLOW_/); views=viewMats(root); pview=photoView(g0,root,id); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('118 巷店面正式模型載入失敗',id,e));
      return z; } }; }
  if(typeof L118_SHOP_LAYOUTS!=='undefined') for(const id of Object.keys(L118_SHOP_LAYOUTS)){ Z3.ZONES['l118_'+id]=zoneFor(id);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.l118_'+id]={url:'assets/models/env/second_ai/l118_'+id+'.glb',type:'building',lazy:true,source:'LAWWW2-C lane118_shops.py',license:'本作'}; }
  return {viewK,zoneFor,viewMats,setView,lookText,IT_FIX:L118_IT_FIX,IT_DEF};
})();
