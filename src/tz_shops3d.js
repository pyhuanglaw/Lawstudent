/* ===== 汀州路／公館六間店的室內（GG-SHOPS3-ART-1110，X320；LAWWW2 帳號 A 2026-11-10）：一間一個區域，照 src/data/tz_shops_layout.js =====
   使用者 2026-11-10 23:xx「六家的內部參考圖」（docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior/）。六間：泰米村食 tz_taimi、洗樂洗衣坊 tz_xile、印得好 tz_yindehao（汀州路）；安泰藥局 gg_antai、汀州鮮果 gg_xianguo、榮恩典文具社 gg_rongendian（公館）。
   區域：Z3.room（一層樓、四面牆淡出）＋配置的阻擋、座位、互動點；正式模型（tools/blender/env_second/tz_shops_interior.py → 每間一顆 GLB，資產這支自己登記）載入後由 Z3.attachRoomGLB 換掉備用模型。
   進出：汀州路的店門互動點（tingzhou3d.js：有 Z3.ZONES['tz_'+id] 就是「進＋店名」）→ 配置的 spawn；門口「離開」→ 配置的 out（外面區域的座標）。
   給 LAWWW 接的：互動點的 kind（配置 points：點餐、看菜單…，句子和選單是 AA_742 的，這裡只有一句暫時的「看」）、zone.shopClerk（店員站的位置）、座位（seat，table＝'<店>_t<桌號>'）。 */
'use strict';
const TZS3=(function(){
  const S={}; const ALL=()=>(typeof TZ_SHOPS_LAYOUT!=='undefined'?TZ_SHOPS_LAYOUT:{});
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  // 阻擋：配置算出來的（櫃台、廚房、隔牆、卡座、桌子）
  S.blocks=function(L){ const out=[], rect=o=>[(o.x0+o.x1)/2,(o.z0+o.z1)/2,o.x1-o.x0,o.z1-o.z0];
    for(const k of ['counter','kitchen','banquette','backroom']) if(L[k]) out.push(rect(L[k]));
    if(L.partition){ const P=L.partition, d=P.door||[P.x1,P.x1]; out.push([(P.x0+P.x1)/2,P.z-0.05,P.x1-P.x0,0.3]); out.push([(P.x0+P.x1)/2,(-L.d/2+P.z)/2,P.x1-P.x0,P.z+L.d/2]); }   /* 隔牆後面整塊不能進去 */
    for(const t of L.tables||[]) out.push([t.x,t.z,t.w,t.d]); for(const b of L.blocks||[]) out.push(b); for(const p of (L.decor&&L.decor.plants)||[]) out.push([p[0],p[1],0.5,0.5]);
    return out; };
  S.build=function(E,L){
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.2,windows:false,warm:!!L.warm,wallColor:L.wallColor||'#efe6d6',floorTex:W3.stoneTex(L.floor||'#d8d3c8'),spawn:Object.assign({},L.spawn)});
    const g0=z.group, nav=z.nav; z.tzShop=L.id;
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const c of g0.children.slice()){ if(c.isLight) continue; g0.remove(c); fb.add(c); } g0.add(fb);   /* 正式模型來了整組藏起來 */
    const bin=new TK.Bin(), wood=M('#8a6a48',{rough:0.6});
    for(const b of S.blocks(L)){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.04); bin.add(wood,TK.boxG(b[2],0.8,b[3],1.2),b[0],0.4,b[1]); }
    bin.build(fb); nav._cm=null;
    const IT=E.interactables, EX=L.exit;
    IT.push({x:EX.x,z:EX.z,radius:EX.r,label:EX.label,exit:{to:L.outZone,spawn:Object.assign({},L.out)}});
    for(const q of L.seats||[]){ const s={x:q.x,z:q.z,yaw:q.yaw,table:L.id+'_t'+q.table}; if(q.ap) s.ap=q.ap; const ip=q.ap||q; IT.push({x:ip.x,z:ip.z,radius:q.ap?0.6:0.7,label:'坐下',tzSeat:q.id,seat:s}); }   /* 卡座（bench）：走近點在兩張桌子中間（ap） */
    for(const p of L.points||[]) IT.push({x:p.x,z:p.z,radius:p.r,label:p.label,kind:p.kind,tzPoint:p.id,look:'（'+L.name+'）'});   /* 句子、選單：AA_742，LAWWW 接；沒接之前只有這一句 */
    z.shopClerk=L.clerk?Object.assign({},L.clerk):null; z.shopLayout=L;
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest[L.asset]) ASSETS.loadOne(L.asset).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); root.name=L.zone+'_glb'; g0.add(root); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true; }).catch(e=>console.warn(L.name+' 室內正式模型載入失敗，用備用模型',e));
    return z; };
  /* 公館的三間（配置有 gg＝棟號）：店門前（騎樓裡）多一個「進入＋店名」的互動點；出來站的 x 照實際的樓房位置更新。包住 gongguan 的 build（不改 zones3d.js；和花序 flower_notes3d.js 同一個做法） */
  S.hookOut=function(){ const byZone={}; for(const id of Object.keys(ALL())){ const L=ALL()[id]; if(L.gg&&L.door) (byZone[L.outZone]=byZone[L.outZone]||[]).push(L); }
    for(const zn of Object.keys(byZone)){ const zd=Z3.ZONES[zn]; if(!zd||zd._tzs) continue; const b0=zd.build;
      zd.build=function(E){ const z=b0.call(this,E); for(const L of byZone[zn]){ if(!Z3.ZONES[L.zone]) continue; const b=(z.buildings||[]).find(q=>q.userData&&q.userData.ggShop===L.gg); if(b){ L.out.x=+b.position.x.toFixed(2); L.door.x=L.out.x; }
          E.interactables.push({x:L.door.x,z:L.door.z,radius:L.door.r,prio:1,label:L.door.label,exit:{to:L.zone,spawn:Object.assign({},L.spawn)},tzsDoor:L.id}); } return z; };
      zd._tzs=true; } };
  if(typeof Z3!=='undefined'&&Z3.ZONES) for(const id of Object.keys(ALL())){ const L=ALL()[id];
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&!ASSETS.manifest[L.asset]) ASSETS.manifest[L.asset]={url:L.glb,type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/tz_shops_interior.py --shop '+id+'（'+L.name+' 室內；照使用者 2026-11-10 的室內參考圖；牆上的照片、菜單從參考圖裁；其他貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0；照片、菜單圖是使用者提供的參考圖'};
    Z3.ZONES[L.zone]={id:L.zone,name:L.name,indoor:true,camDist:4.2,build(E){ return S.build(E,L); }}; }
  if(typeof Z3!=='undefined'&&Z3.ZONES) S.hookOut();
  return S;
})();
