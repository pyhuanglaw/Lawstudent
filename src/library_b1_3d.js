/* 總圖 B1（CLOSED-SPACES-1023 第 2 項；AA_399 第 2 節，AA-B；使用者 D46「總圖 B1」、2026-10-23「遊戲裡任何現在關起來的空間都可以開始開發」）：區域 library_b1（LAWWW2-B 2026-10-23）。
   模型、配置：tools/blender/env_second/library_b1.py → assets/models/env/second_ai/library_b1.glb＋src/data/library_b1_layout.js（座標和總圖大廳同一套）。
   進出（LAWWW-B 10-23 選 A）：總圖大廳一樓西牆的樓梯間門（library_layout.js 的 b1Door，src/library3d.js）⇄ B1 西牆的樓梯間門。電梯這一版不停 B1（只有門和「看」）。
   北邊 24 小時自習室（靠北牆一排單面長桌、中間一排雙面長桌，每個位子都可以坐下自習）；南邊討論室 1、2（六人桌，可以坐）；東南影印中心；電梯前自助借還書機；西邊門廳（置物櫃、公告欄、飲水機、長椅）。
   劇情接線（柏翰的考古題小組→討論室 1、國考讀書會→討論室 2、期末前的 24 小時自習室、自助借還機）由 LAWWW-B 照 AA_399 第 2 節接：站位在配置的 spots，座位 seats（kind study），互動點 interact（id：selfcheck、disc1、disc2…）。
   背景的同學：LB1.populate（照時段坐在自習室；story3d.js 的 populate 叫，同霖澤館 3F、4F 的 LZUP.populate）。 */
const LB1=(function(){
  const S_={};
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  const LAY=()=>typeof LIBRARY_B1_LAYOUT!=='undefined'?LIBRARY_B1_LAYOUT:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)) out.push(m); } }); return out; }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  /* 「看」的字：配置的 note（暫定的字，AA 可以改）；沒有 note 用 label */
  const lookText=q=>String(q.note||'').trim()||q.label;
  S_.lookText=lookText;
  /* 回到大廳：一樓西牆的樓梯間門前（library_layout.js 的 b1Door.spawn）*/
  const hallSpawn=()=>{ const D=typeof LIBRARY_LAYOUT!=='undefined'&&LIBRARY_LAYOUT.b1Door; return D?Object.assign({},D.spawn):{x:-10.1,z:-2.4,lv:0,yaw:Math.PI/2}; };
  /* 背景的同學（路人，沒有名字、沒有台詞；有名字的人照各自的作息，AA 排）：24 小時自習室，期末考前兩週加倍。
     人數：8:00–12:00 四位、12:00–18:00 六位、18:00–23:00 八位、23:00–2:00 三位、其他一位；放假日減半。坐哪幾號：日期當種子（出去再進來是同一批人坐同樣的位子）*/
  S_.want=function(G,seats){ const h=G.hour%24, term=typeof CALENDAR==='undefined'||CALENDAR.kind(G.day)==='term';
    let n=h>=8&&h<12?4:(h>=12&&h<18?6:(h>=18&&h<23?8:(h>=23||h<2?3:1))); if(typeof CALENDAR!=='undefined'&&CALENDAR.examSoon&&CALENDAR.examSoon(G.day)) n*=2; if(!term) n=Math.floor(n/2);
    const ok=seats.map((q,i)=>i).filter(i=>seats[i]&&seats[i].study&&seats[i].room==='study24'); if(!ok.length||!n) return []; const out=[]; let sd=((G.day|0)*7919+41)%2147483646+1;
    const pool=ok.slice(); for(let k=pool.length-1;k>0;k--){ sd=(sd*16807)%2147483647; const j=sd%(k+1); [pool[k],pool[j]]=[pool[j],pool[k]]; } for(const i of pool){ if(out.length>=n) break; out.push(i); } return out; };
  S_.populate=function(GM,entering){ const E=GM.E, G=GM.G; if(G.zone!=='library_b1'||!E.zone||!E.zone.seats||!E.player||typeof CHAR==='undefined'||typeof STORY==='undefined') return 0;
    const seats=E.zone.seats, h=G.hour%24, want=S_.want(G,seats), mine=E.npcs.filter(n=>n&&n.b1Seat!=null&&!n.leaving); let k=0;
    for(const n of mine) if(!want.includes(n.b1Seat)&&(n.until==null||n.until>h)){ n.until=h; n.seatTarget=null; k++; }
    const near=(q,st)=>!!q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35, busy=st=>(E.player&&near(E.player.seat,st))||E.npcs.some(q=>q&&(near(q.seat,st)||near(q.seatTarget,st)));
    const dr=LAY().stairs.spawn;
    for(const i of want){ if(mine.some(n=>n.b1Seat===i)) continue; const st=seats[i]; if(!st||busy(st)) continue; const o=CHAR.build(STORY.extraSpec(760+(((G.day|0)*13+i)%60)));
      if(entering){ o.position.set(st.x,0,st.z); o.rotation.y=st.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,b1Seat:i,seat:{x:st.x,z:st.z,yaw:st.yaw,lv:0}}); k++; continue; }
      o.position.set(dr.x,0,dr.z); o.rotation.y=dr.yaw||0; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,b1Seat:i,lv:0}); if(!n) continue; n.seatTarget=st; k++;
      const sit=()=>{ n.seatTarget=null; if(n.leaving) return; if(busy(st)){ n.until=G.hour%24; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='read'; };
      const ap=(GM.seatApproach&&GM.seatApproach(st))||st.ap||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,0))) sit(); }
    return k; };
  const inRoom=(s,rooms)=>{ for(const r of rooms||[]) if(s.x>r.x0&&s.x<r.x1&&s.z>r.z0&&s.z<r.z1) return r.id; return null; };
  const zone={ id:'library_b1', name:'總圖書館 B1', indoor:true, camDist:4.6, build(E){ const L=LAY(), Bd=L.bounds, H=L.h||3.2, W=Bd.x1-Bd.x0, D=Bd.z1-Bd.z0;
    const z=Z3.room(E,{w:W,d:D,h:H,cool:true,windows:false,wallColor:'#ecebe6',floorTex:W3.stoneTex('#d2d0ca'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});   /* 地下室：沒有窗 */
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;
    const nav=new E3.NavGrid(W,D,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
    for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
    nav._cm=null; z.nav=nav; z.bounds={w:W+3,d:D+3};
    /* 程序化備用（正式模型載入失敗、?nobldg）：地板＋擋路的東西畫成方塊 */
    plane(fb,W,D,M('#d2d0ca'),0,0,0.005); const bm=M('#b9a486'), gm=M('#cfd8dc',{rough:0.2}); for(const b of L.blocks){ const tall=/elevator|lockers|partition|kiosk/.test(b.why), h=b.why==='glass_partition'?2.6:(tall?1.9:0.75); const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),b.why==='glass_partition'?gm:bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
    /* 燈：日光燈（地下室，白天晚上一樣亮）*/
    const lamps=[]; for(const [x,zz] of [[-9.5,-4],[-9.5,4],[-3.5,-5.5],[3.5,-5.5],[-4.5,4.5],[0.5,4.5],[7.5,4.5],[9.5,-5.5]]){ const l=new THREE.PointLight(0xf2f6ff,4,11,2); l.position.set(x,H-0.4,zz); g0.add(l); lamps.push(l); }
    let glow=[]; z.onLamps=function(){ for(const l of lamps) l.intensity=4; if(z.ceilLight) z.ceilLight.intensity=14; };
    /* 地下室沒有日光：環境光固定、太陽只留一點當主光（引擎室內分支設完以後叫 zone.applyTime）*/
    z.applyTime=function(h){ if(E.hemi){ E.hemi.intensity=1.15; E.hemi.color.set(0xeef2f8); E.hemi.groundColor.set(0x9a9a92); } if(E.sun) E.sun.intensity=0.45; for(const m of glow) if(m.emissiveIntensity!=null) m.emissiveIntensity=m.userData.b1Base!=null?m.userData.b1Base:(m.userData.b1Base=m.emissiveIntensity); };
    const IT=E.interactables; z.seats=[];
    for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; if(s.ap) st.ap=s.ap; if(s.kind==='study') st.study=true; const rm=inRoom(s,L.rooms); if(rm) st.room=rm; z.seats.push(st); IT.push(Object.assign({x:s.x,z:s.z,radius:0.7,lv:0,seat:st,label:s.label||'坐下'},s.kind==='study'?{study:true}:{})); }
    for(const q of L.interact){ if(q.id==='stairs') continue; IT.push({x:q.x,z:q.z,radius:q.r,lv:0,id:q.id,label:q.label,look:lookText(q)}); }
    { const st=L.stairs; IT.push({x:st.door.x+0.6,z:st.door.z,radius:0.8,lv:0,label:st.up.label,exit:{to:st.up.to,spawn:hallSpawn()}}); }
    z.formal=false; const key='bldg.library_b1'; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
      glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('總圖 B1 正式模型載入失敗，用程序化備用',e));
    return z; } };
  S_.zone=zone;
  if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.library_b1=zone;
  if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.library_b1']={url:'assets/models/env/second_ai/library_b1.glb',type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/library_b1.py（總圖 B1：24 小時自習室、討論室、影印中心；配置同一支腳本輸出；遊戲化設計，不是實測；貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0'};
  return S_;
})();
if(typeof window!=='undefined') window.LB1=LB1;
