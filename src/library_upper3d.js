/* 總圖研究小間（2F 東側）＋5F 書庫（CLOSED-SPACES-1023 第 3 項；AA_399 第 3 節，AA-B；使用者 2026-10-23「遊戲裡任何現在關起來的空間都可以開始開發」）：
   區域 library_carrels、library_stacks（LAWWW2-B 2026-10-23）。
   模型、配置：tools/blender/env_second/library_upper.py → assets/models/env/second_ai/library_{carrels,stacks}.glb＋src/data/library_upper_layouts.js（不要手改）。
   研究小間：總圖大廳二樓東牆那扇「研究小間」的門（library_layout.js doors 的 carrels：to／back）⇄ 研究小間西牆的門。
     十間（北 01～05、南 06～10）門都關著，從門上的小窗看得到裡面。08＝玩家預約的那一間：LUP.booked(G) 為真時門開著、可以進去坐下讀書
       （AA_399 3-1：大四起在 1F 服務台預約，一次三小時、一天一次；預約由 LAWWW 接：預約時寫 G.flags.carrelDay＝G.day|0，或換掉 LUP.booked）。
     學姊的 03（和 08 隔著走廊正對面）：LUP.sisPeriod(G)（她用 03 的時期：她的東西）、LUP.sisHere(G)（她在：檯燈亮）——預設照 AA_399 的時段，LAWWW 可以換掉（美國期間除外要 LAWWW 判斷）；
       便利貼：G.flags.carrelNoteDay===G.day|0 或 LUP.note(true) 時顯示（敲玻璃以後；字由對話框顯示）。站位在配置的 spots（sis_knock 門外、sis_seat 她的座位、sis_note 便利貼）。
   5F 書庫：搭電梯（大廳、3F 閱覽區、這裡的電梯都有 5F；4F、6F 照舊整理中：library_layout.js 的 stacks.elevator）。電梯照閱覽室（B3.buildElevator，只有一層）。
     「看那一排」：interact id row_300…row_380、row_j、row_ref（最裡面靠西牆的參考書，不外借；方奕廷在 spots.fang）。借書由 LAWWW 照 AA_399 3-2 接。
     背景的讀者（路人）：LUP.populate（坐南邊窗下的閱覽桌，開館時段一到三位；story3d.js 進來、待著的時候叫，同 LB1）。 */
const LUP=(function(){
  const S_={};
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  const LAY=k=>typeof LIBRARY_UPPER_LAYOUTS!=='undefined'?LIBRARY_UPPER_LAYOUTS[k]:null;
  const LL=()=>typeof LIBRARY_LAYOUT!=='undefined'?LIBRARY_LAYOUT:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)) out.push(m); } }); return out; }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  const lookText=q=>String(q.note||'').trim()||q.label;
  S_.lookText=lookText;
  /* ---- 研究小間的狀態（LAWWW 可以換掉這幾個函式）---- */
  const ymd=G=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return null; const d=CALENDAR.dateOf(G.day|0); return d.y*10000+d.m*100+d.d; };
  S_.booked=G=>!!(G&&G.flags&&G.flags.carrelDay!=null&&G.flags.carrelDay===(G.day|0));
  S_.sisPeriod=G=>{ const k=G&&ymd(G); return k!=null&&k>=20280201&&k<=20290531; };   /* AA_399 3-1：2028-02～2029-05（美國期間除外：LAWWW 判斷）*/
  S_.sisHere=G=>{ if(!S_.sisPeriod(G)) return false; const h=G.hour%24, d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day|0):null; return !!d&&d.wd<=5&&!(CALENDAR.holiday&&CALENDAR.holiday(G.day|0))&&h>=14&&h<17; };
  let noteOn=false; const nodes={shut:[],open:[],sis:[],lamp:[],note:[],sky:[]};
  function applyCarrel(){ const G=G_(); if(!G) return; const bk=S_.booked(G), sp=S_.sisPeriod(G), here=sp&&S_.sisHere(G), nt=sp&&(noteOn||(G.flags&&G.flags.carrelNoteDay===(G.day|0)));
    for(const o of nodes.shut) o.visible=!bk; for(const o of nodes.open) o.visible=bk; for(const o of nodes.sis) o.visible=sp; for(const o of nodes.lamp) o.visible=here; for(const o of nodes.note) o.visible=!!nt; }
  S_.note=function(on){ noteOn=!!on; applyCarrel(); };
  S_.refresh=applyCarrel;
  /* 外牆高窗（霧面玻璃）：白天亮、黃昏暖、晚上暗藍 */
  function skyTint(h,rain){ h=h%24; if(h<5.5||h>=19.2) return [0x1a2236,0.15]; if(h<6.6) return [0x6a7898,0.45]; if(h<16.5) return [rain?0xb8c0c8:0xe8eef4,rain?0.7:1.0]; if(h<18.4) return [0xf0d2a8,0.85]; return [0x8a7a90,0.4]; }   /* 19.4 → 19.2（LAWWW2-B 10-24 路線巡查④）：和引擎的夜晚係數 nk＝1、屋外完全天黑同一刻換夜景；原本晚 0.2 小時，冬天傍晚光線拉長後，12 月 17:35～17:58 屋外全黑、窗外還是調暗的白天照片 */
  /* ---- 共用：room()（窗、窗外的景）＋配置的導航格、座位、互動點＋正式模型 ---- */
  function baseRoom(E,L,o){ const Bd=L.bounds, H=L.h, W=Bd.x1-Bd.x0, D=Bd.z1-Bd.z0, WIN=L.windows;
    const z=Z3.room(E,{w:W,d:D,h:H,cool:true,winWall:WIN.wall,winXs:WIN.xs.map(x=>WIN.wall==='front'?-x:x),winY:WIN.y,winW:WIN.w,winH:WIN.h,view:o.view,viewDepth:o.viewDepth,wallColor:'#ecebe6',floorTex:W3.stoneTex(o.floor),spawn:Object.assign({},o.spawn||L.spawn)});   /* room() 的 front 牆 x 是反的 */
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const c of g0.children.slice()){ if(c.isLight) continue; if(z.winParts&&z.winParts.some(p=>p.obj===c)) continue; g0.remove(c); fb.add(c); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;
    const nav=new E3.NavGrid(W,D,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
    for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
    nav._cm=null; z.nav=nav; z.bounds={w:W+3,d:D+3};
    /* 程序化備用（正式模型載入失敗、?nobldg）：地板＋擋路的東西畫成方塊 */
    plane(fb,W,D,M(o.floor),0,0,0.005); const bm=M('#b9a486'); for(const b of L.blocks){ const tall=/stack_range|carrel_|coat|flat_shelf/.test(b.why), h=tall?2.1:0.75; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
    return {z,g0,fb,nav,H}; }
  function seatsOf(E,z,L,skip){ const IT=E.interactables; z.seats=[];
    for(const s of L.seats){ if(skip&&skip(s)) continue; const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; if(s.ap) st.ap=s.ap; if(s.kind==='study') st.study=true; z.seats.push(st); IT.push(Object.assign({x:s.x,z:s.z,radius:0.7,lv:0,seat:st,label:s.label||'坐下'},s.kind==='study'?{study:true}:{})); } }
  function formal(E,z,g0,fb,key,onRoot){ z.formal=false; if(!has(key)) return; ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
    root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true; if(onRoot) onRoot(root); const G=G_(); if(G&&z.applyTime) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('總圖 '+key+' 正式模型載入失敗，用程序化備用',e)); }

  /* ================= 研究小間 ================= */
  const carrels={ id:'library_carrels', name:'總圖 2F 研究小間', indoor:true, camDist:4.2, build(E){ const L=LAY('carrels'), G=G_();
    const {z,g0,fb,nav,H}=baseRoom(E,L,{view:'library_carrels',viewDepth:S_.viewDepth.library_carrels,floor:'#a3a8ab'});
    const bk=S_.booked(G);
    for(const [id,r] of Object.entries(L.door_block||{})) if(!(bk&&id==='08')) nav.blockRect((r.x0+r.x1)/2,(r.z0+r.z1)/2,Math.max(r.x1-r.x0,0.4),Math.max(r.z1-r.z0,0.4),0,0);   /* 08 的門：沒有預約就關著 */
    nav._cm=null;
    const lamps=[]; for(const [x,zz] of [[-7.2,0],[-3.6,0],[0,0],[3.6,0],[7.2,0],[0,-2.5],[0,2.5]]){ const l=new THREE.PointLight(0xf4f6fb,3,9,2); l.position.set(x,H-0.35,zz); l.userData.on=4.2; l.userData.off=3; g0.add(l); lamps.push(l); }
    const sisL=new THREE.PointLight(0xffc27a,0,3.0,2); { const sp=L.spots.sis_seat; sisL.position.set(sp.x-0.85,1.15,sp.z-0.75); } g0.add(sisL);   /* 學姊的檯燈（她在的時候）*/
    const onLamps0=z.onLamps; z.onLamps=function(on){ if(onLamps0) onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    let glow=[]; const applyTime0=z.applyTime; z.applyTime=function(h,weather){ if(applyTime0) applyTime0.call(z,h,weather); const [c,k]=skyTint(h,weather==='rain'); for(const m of nodes.sky.map(o=>o.material)) if(m){ if(m.emissive) m.emissive.setHex(c); m.emissiveIntensity=k; m.color&&m.color.setHex(c); }
      applyCarrel(); const G2=G_(); sisL.intensity=G2&&S_.sisPeriod(G2)&&S_.sisHere(G2)?2.4:0; };
    seatsOf(E,z,L,s=>!bk);   /* 座位只有 08：有預約才能坐 */
    const IT=E.interactables, back=(LL().doors.find(d=>d.id==='carrels')||{}).back;
    for(const q of L.interact){ if(q.id==='hall'){ IT.push({x:q.x,z:q.z,radius:q.r,lv:0,id:q.id,label:q.label,exit:{to:'library_hall',spawn:Object.assign({},back||{x:9.6,z:5.6,lv:1,yaw:-Math.PI/2})}}); continue; }
      if(q.id==='door08'&&bk) continue;   /* 有預約：門開著，直接進去 */
      IT.push({x:q.x,z:q.z,radius:q.r,lv:0,id:q.id,label:q.label,look:lookText(q)}); }
    for(const k of Object.keys(nodes)) nodes[k]=[]; noteOn=false;
    formal(E,z,g0,fb,'bldg.library_carrels',root=>{ root.traverse(o=>{ if(!o.isMesh) return; const n=o.name||'';
      if(/^CARREL08_DOOR_SHUT/.test(n)) nodes.shut.push(o); else if(/^CARREL08_DOOR_OPEN/.test(n)) nodes.open.push(o); else if(/^SIS_CARREL_LAMP/.test(n)) nodes.lamp.push(o); else if(/^SIS_CARREL_/.test(n)) nodes.sis.push(o); else if(/^STICKY_SIS/.test(n)) nodes.note.push(o);
      if(o.material&&/^CARREL_SKY/.test(o.material.name||'')){ o.material=o.material.clone(); nodes.sky.push(o); } }); glow=glowMats(root,/^GLOW_/); applyCarrel(); });
    return z; } };

  /* ================= 5F 書庫 ================= */
  const elevSpawn=(EL,lv)=>({x:(EL.x0+EL.x1)/2,z:(EL.z0+EL.z1)/2-0.15,yaw:Math.PI,lv:lv|0,elev:true});
  S_.stacksFloors=function(){ const L=LL(), SE=L.stacks.elevator; return SE.floors.map((f,i)=>Object.assign({num:i+1},f,f.zone?{spawn:elevSpawn(f.zone==='library'?L.reading.elevator:L.elevator,f.zone==='library'?0:f.lv)}:{})); };
  const stacks={ id:'library_stacks', name:'總圖 5F 書庫', indoor:true, camDist:4.2, build(E){ const L=LAY('stacks'), SE=LL().stacks.elevator;
    const {z,g0,fb,nav,H}=baseRoom(E,L,{view:'library_stacks',viewDepth:S_.viewDepth.library_stacks,floor:'#d3cdbf'});
    nav.blockRect(SE.x0-0.1,(SE.z0+SE.z1)/2,0.24,SE.z1-SE.z0+0.2,0); nav.blockRect(SE.x1+0.1,(SE.z0+SE.z1)/2,0.24,SE.z1-SE.z0+0.2,0); nav.blockRect((SE.x0+SE.x1)/2,SE.z1+0.1,SE.x1-SE.x0+0.44,0.24,0); nav._cm=null;   /* 井道玻璃（東、西、南）*/
    const RL={floors:[{lv:0,y:0}],roofY:H,elevator:Object.assign({},SE,{floors:S_.stacksFloors()})};
    z.elev=B3.buildElevator(RL,z.group,nav,null,z);
    { const sh=E.spawnHint; if(sh&&sh.elev) z.elev.placeAt(0,true); }   /* 搭電梯來：車廂停在這一層、人在車廂裡（門之後才打開）*/
    const up=z.update; z.update=function(dt){ if(up) up(dt); z.elev.update(dt); };
    const lamps=[]; for(const [x,zz] of [[-9,-4.4],[-4,-4.4],[1,-4.4],[-9,2.6],[-4,2.6],[1,2.6],[-4,7.4],[3,7.4],[8.8,-5.2],[9.2,4]]){ const l=new THREE.PointLight(0xf2f6ff,2.6,10,2); l.position.set(x,H-0.4,zz); l.userData.on=3.6; l.userData.off=2.6; g0.add(l); lamps.push(l); }
    const onLamps0=z.onLamps; z.onLamps=function(on){ if(onLamps0) onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    seatsOf(E,z,L);
    const IT=E.interactables;
    for(const q of L.interact){ if(q.id==='elevator') continue; IT.push({x:q.x,z:q.z,radius:q.r,lv:0,id:q.id,label:q.label,look:lookText(q)}); }
    IT.push({x:z.elev.cx,z:SE.callZ,radius:1.0,lv:0,label:'搭電梯',elevator:true});
    formal(E,z,g0,fb,'bldg.library_stacks');
    return z; } };

  /* 背景的讀者（路人，沒有名字、沒有台詞）：南邊窗下的閱覽桌。開館時段（8～22）一到三位，日期當種子；考試週多一位 */
  S_.want=function(G,seats){ const h=G.hour%24; if(h<8||h>=22) return []; let n=h<12?1:(h<18?3:2); if(typeof CALENDAR!=='undefined'&&CALENDAR.examSoon&&CALENDAR.examSoon(G.day)) n++;
    const ok=seats.map((q,i)=>i).filter(i=>seats[i]&&seats[i].study); if(!ok.length) return []; const out=[]; let sd=((G.day|0)*6007+29)%2147483646+1;
    const pool=ok.slice(); for(let k=pool.length-1;k>0;k--){ sd=(sd*16807)%2147483647; const j=sd%(k+1); [pool[k],pool[j]]=[pool[j],pool[k]]; } for(const i of pool){ if(out.length>=n) break; out.push(i); } return out; };
  S_.populate=function(GM,entering){ const E=GM.E, G=GM.G; if(G.zone!=='library_stacks'||!E.zone||!E.zone.seats||!E.player||typeof CHAR==='undefined'||typeof STORY==='undefined') return 0;
    const seats=E.zone.seats, h=G.hour%24, want=S_.want(G,seats), mine=E.npcs.filter(n=>n&&n.stSeat!=null&&!n.leaving); let k=0;
    for(const n of mine) if(!want.includes(n.stSeat)&&(n.until==null||n.until>h)){ n.until=h; n.seatTarget=null; k++; }
    const near=(q,st)=>!!q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35, busy=st=>(E.player&&near(E.player.seat,st))||E.npcs.some(q=>q&&(near(q.seat,st)||near(q.seatTarget,st)));
    const dr=LAY('stacks').spawn;
    for(const i of want){ if(mine.some(n=>n.stSeat===i)) continue; const st=seats[i]; if(!st||busy(st)) continue; const o=CHAR.build(STORY.extraSpec(820+(((G.day|0)*17+i)%60)));
      if(entering){ o.position.set(st.x,0,st.z); o.rotation.y=st.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,stSeat:i,seat:{x:st.x,z:st.z,yaw:st.yaw,lv:0}}); k++; continue; }
      o.position.set(dr.x,0,dr.z); o.rotation.y=dr.yaw||0; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,stSeat:i,lv:0}); if(!n) continue; n.seatTarget=st; k++;
      const sit=()=>{ n.seatTarget=null; if(n.leaving) return; if(busy(st)){ n.until=G.hour%24; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='read'; };
      const ap=(GM.seatApproach&&GM.seatApproach(st))||st.ap||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,0))) sit(); }
    return k; };

  /* 窗外的景深（tools/shots/shop_views_layers.json：遊戲裡拍的照片，景在幾公尺外）*/
  S_.viewDepth={library_carrels:30.8,library_stacks:35.6};
  S_.carrels=carrels; S_.stacks=stacks;
  if(typeof Z3!=='undefined'&&Z3.ZONES){ Z3.ZONES.library_carrels=carrels; Z3.ZONES.library_stacks=stacks; }
  if(typeof ASSETS!=='undefined'){
    ASSETS.manifest['bldg.library_carrels']={url:'assets/models/env/second_ai/library_carrels.glb',type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/library_upper.py（總圖 2F 研究小間：十間、玻璃門上的小窗；配置同一支腳本輸出；遊戲化設計，不是實測；貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0'};
    ASSETS.manifest['bldg.library_stacks']={url:'assets/models/env/second_ai/library_stacks.glb',type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/library_upper.py（總圖 5F 書庫：十排雙面書架、參考書、閱覽桌；書背圖集 lib5f_atlas.py 程式畫的；遊戲化設計；貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0'}; }
  return S_;
})();
if(typeof window!=='undefined') window.LUP=LUP;
