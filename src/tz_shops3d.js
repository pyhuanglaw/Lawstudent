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
  /* SHOP-INTERIOR-VIEW-1112（使用者 11-12 進泰米村食：「窗景呢」——兩扇大窗、門的玻璃外面是一片藍，這一批店從來沒有放窗景）：
     正面玻璃外 0.3 m 一片視差窗（Z3.shopViewPane＋W3.windowMat；新生南路各店同一套）。照片 assets/models/env/views/<區域>_{day,night}.webp＝
     Blender 用汀州路／公館的正式模型，站在這間店的玻璃中心往街上拍（docs/art-rebuild/second_ai/wip/shop_views_1112/render.sh）。
     公館三間（安泰、汀州鮮果、榮恩典）：Blender 拍不到遊戲程式畫的校門、圍牆、行道樹，先用同一條店面街在遊戲裡拍的照片（配置的 view：cvs／noodle／bookstore，兩層景深），位置差幾十公尺。
     景深 viewDepth（配置可以寫）：對面店面的距離。一間只放一片（蓋住整面正面牆：窗、門、敞開的店面都看得到同一面景）*/
  S.pane=function(L){ return {kind:L.view||L.zone,x:0,y:1.6,z:+(L.d/2+0.5).toFixed(2),w:+(L.w+1.2).toFixed(2),h:3.2,ry:Math.PI,depth:L.viewDepth||14}; };
  S.viewPane=function(z,g0,L){ if(z.viewPanes||typeof Z3==='undefined'||!Z3.shopViewPane) return null; return Z3.shopViewPane(z,g0,S.pane(L)); };
  S.studyOpen=function(L){ return false; };   /* LAWWW 接：書房解鎖了沒（存檔旗標 L.study.flag）；預設鎖著 */
  S.build=function(E,L){
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.2,windows:false,warm:!!L.warm,wallColor:L.wallColor||'#efe6d6',floorTex:W3.stoneTex(L.floor||'#d8d3c8'),spawn:Object.assign({},L.spawn)});
    const g0=z.group, nav=z.nav; z.tzShop=L.id;
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const c of g0.children.slice()){ if(c.isLight) continue; g0.remove(c); fb.add(c); } g0.add(fb);   /* 正式模型來了整組藏起來 */
    const bin=new TK.Bin(), wood=M('#8a6a48',{rough:0.6});
    for(const b of S.blocks(L)){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.04); bin.add(wood,TK.boxG(b[2],0.8,b[3],1.2),b[0],0.4,b[1]); }
    bin.build(fb); nav._cm=null;
    const IT=E.interactables, EX=L.exit;
    IT.push({x:EX.x,z:EX.z,radius:EX.r,label:EX.label,exit:{to:L.outZone,spawn:Object.assign({},L.out)}});
    for(const q of L.seats||[]){ const s={x:q.x,z:q.z,yaw:q.yaw,table:L.id+'_t'+q.table}; if(q.ap) s.ap=Array.isArray(q.ap)?q.ap.slice():[q.ap.x,q.ap.z]; const ip=q.ap?(Array.isArray(q.ap)?{x:q.ap[0],z:q.ap[1]}:q.ap):q;   /* seat.ap 一律陣列 [x,z]（game3d.js seatApproach、crowd3d.js 都讀 ap[0]／ap[1]）：配置寫 {x,z}，原本整個傳過去＝走近點讀到 NaN 被跳過，泰米點長椅 t1b 走到旁邊、坐到 1.4 m 外的 t1c（BB 11-13 P2，SHOP-STANDARD-BACKFILL-1112）*/ IT.push({x:ip.x,z:ip.z,radius:q.ap?0.6:0.7,label:q.label||'坐下',tzSeat:q.id,seat:s}); }   /* label：配置可以寫（洗樂的塑膠椅「坐著等」、印得好的電腦圓凳「用電腦」，AA_743；GG-SHOPS3 資料補五項，LAWWW2 11-11）*/   /* 卡座（bench）：走近點在兩張桌子中間（ap） */
    for(const p of L.points||[]) IT.push({x:p.x,z:p.z,radius:p.r,label:p.label,kind:p.kind,tzPoint:p.id,look:'（'+L.name+'）'});   /* 句子、選單：AA_742，LAWWW 接；沒接之前只有這一句 */
    // 鎖著的後間（禮貌生財的書房，X332）：平常導航擋住（隔牆後面整塊）、模型的 STUDY_* 不顯示、STUDY_LID 蓋著、STUDY_DOOR 關著；setStudy(true)＝開門：放行、擋家具、加互動點
    if(L.study){ const SD=L.study, P=L.partition, pts=[]; z.studyOpen=false;
      const doorIt={x:SD.door.x,z:SD.door.z,radius:SD.door.r,label:SD.door.label,kind:SD.door.kind,tzPoint:'study_door',look:'門關著。'}; IT.push(doorIt);   /* 句子 AA 寫；這一句暫定 */
      z.applyStudyModel=function(){ const root=g0.getObjectByName(L.zone+'_glb'); if(!root) return; root.traverse(o=>{ const n=o.name||''; if(n.indexOf('STUDY_LID')===0) o.visible=!z.studyOpen; else if(n.indexOf('STUDY_DOOR')===0) o.visible=!z.studyOpen&&!z.partCut; else if(n.indexOf('STUDY_')===0) o.visible=z.studyOpen; else if(n.indexOf('PART_')===0) o.visible=!z.partCut; }); };
      /* 隔牆的鏡頭（LM-PART-CAM-1111，BB 11-11 01:47；CC 圖 ART2_lmint_new/out/tz4int_limao_2000_game.jpg：玩家站在掛畫前、跟隨鏡頭退到隔牆後面鎖著的書房裡，整個畫面是隔牆背面的米色、看不到人）：
         隔牆不是外牆（不在淡出清單）。鏡頭和玩家在隔牆兩邊時，隔牆、門框、掛畫（模型的 PART_*）和關著的門（STUDY_DOOR*）整組藏起來；同一邊就照舊。書房鎖著時裡面的東西本來就不顯示，藏隔牆不會露出書房 */
      z.partCut=false; z.partCutOf=function(cam,pp){ if(!cam) return false; const cs=(cam.z-P.z)>0; return pp?cs!==((pp.z-P.z)>0):(!cs&&!z.studyOpen); };   /* 運鏡（沒有玩家位置）：書房鎖著時鏡頭跑到書房那一邊也藏 */
      { const f0=z.fadeWalls; z.fadeWalls=function(cam,pp){ if(f0) f0.call(this,cam,pp); const cut=z.partCutOf(cam&&cam.position,pp); if(cut!==z.partCut){ z.partCut=cut; z.applyStudyModel(); } }; }
      z.setStudy=function(on){ on=!!on; if(on===z.studyOpen){ z.applyStudyModel(); return; } z.studyOpen=on;
        if(on){ nav.freeRect(SD.x0+0.3,SD.z0+0.3,SD.x1-0.3,SD.z1-0.2); nav.freeRect(P.door[0]+0.06,SD.z1-0.4,P.door[1]-0.06,SD.z1+0.4); for(const b of SD.blocks) nav.blockRect(b[0],b[1],b[2],b[3],0,0.04);
          for(const p of SD.points){ const it={x:p.x,z:p.z,radius:p.r,label:p.label,kind:p.kind,tzPoint:p.id,look:'（'+L.name+'的書房）'}; IT.push(it); pts.push(it); }
          if(SD.seat){ const it={x:SD.seat.x,z:SD.seat.z,radius:0.7,label:'坐下',tzSeat:SD.seat.id,seat:{x:SD.seat.x,z:SD.seat.z,yaw:SD.seat.yaw,table:L.id+'_desk'}}; IT.push(it); pts.push(it); }
          doorIt.label='書房'; doorIt.look='門開著。'; }
        else{ nav.blockRect((SD.x0+SD.x1)/2,(SD.z0+SD.z1)/2,SD.x1-SD.x0,SD.z1-SD.z0+0.4,0,0); for(const it of pts.splice(0)){ const i=IT.indexOf(it); if(i>=0) IT.splice(i,1); } doorIt.label=SD.door.label; doorIt.look='門關著。'; }
        nav._cm=null; z.applyStudyModel(); };
      if(S.studyOpen(L)) z.setStudy(true); }
    z.shopClerk=L.clerk?Object.assign({},L.clerk):null; z.shopLayout=L;
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest[L.asset]) ASSETS.loadOne(L.asset).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); root.name=L.zone+'_glb'; g0.add(root); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true; S.viewPane(z,g0,L); if(z.applyStudyModel) z.applyStudyModel(); }).catch(e=>console.warn(L.name+' 室內正式模型載入失敗，用備用模型',e));
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
