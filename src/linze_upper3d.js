/* 霖澤館 3F 學生討論區、4F 自習討論區（LINZE-34F-TABLES-1020；使用者 2026-10-20「霖澤3.4樓要有長條桌子附椅子像野餐椅子讓大家可以在那邊討論事情功課或者吃飯啊」
   「霖澤館3-8樓為什麼永遠都在蓋」）：區域 linze_3f、linze_4f（LAWWW2-C 5566a0c5 的模型、配置、接線，照 118 巷店面的做法；LAWWW-C 正式接線）。
   樓梯：2F 樓梯間的門（linze_layout.js 的 stairs3f）→ 3F；3F ⇄ 4F；4F 往上（研究室）關著。
   電梯：霖澤館的電梯（building3d.js，B3 車廂）到 3F、4F＝換區域（linze_layout.js 的 floors：zone、num、spawn，同總圖）；
   3F、4F 這兩層沒有車廂模型：按「搭電梯」選樓層，淡出換到那一層的電梯門口（1F、2F＝霖澤館電梯前）。5F–8F 研究室按不亮。 */
(function(){
  const S_={};
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)){ if(m.userData.lzBase==null) m.userData.lzBase=m.emissiveIntensity!=null?m.emissiveIntensity:1; out.push(m); } } }); return out; }
  function setGlow(mats,k){ for(const m of mats) m.emissiveIntensity=m.userData.lzBase*k; }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  const L2SPAWN=Object.assign({},LINZE_UPPER_LAYOUTS['3f'].stairs.down.spawn);   /* 回到 2F：迴廊、樓梯間的門前面 1.5 m */
  /* 3F、4F 的電梯：選樓層 → 換到那一層的電梯門口（霖澤館 1F、2F 站在電梯前、面向走廊）。樓層號：霖澤館第 0 層＝1F、第 1 層＝2F */
  const FLOOR_NO=q=>q.zone==='linze'?(q.lv|0)+1:(q.zone?+q.zone.slice(6,7):9);
  async function ride(f,floors){ const GM=typeof GAME!=='undefined'?GAME:null; if(!GM||!GM.choose) return; const here='linze_'+f; let i=-1;
    GM.sceneBegin(); try{ const opts=floors.map(q=>({t:q.label,hint:!q.open?(q.closed||'按鈕按不亮'):(q.zone===here?'現在在這一層':''),dim:!q.open||q.zone===here})); opts.push({t:'不搭了'});
      for(;;){ i=await GM.choose(opts); if(i>=floors.length){ i=-1; break; } const q=floors[i]; if(!q.open){ GM.toast(q.closed||'按鈕按不亮',3200); continue; } if(q.zone===here){ GM.toast('你已經在這一層了',2400); continue; } break; } } finally { GM.sceneEnd(); }
    if(i<0) return; const q=floors[i], up=FLOOR_NO(q)>+f.slice(0,1); const sp=q.zone==='linze'?{x:4.6,z:-4.9,lv:q.lv|0,yaw:Math.PI}:Object.assign({},LINZE_UPPER_LAYOUTS[q.zone.slice(6)].spawn);
    if(GM.caption) GM.caption('','電梯往'+(up?'上':'下')+'……',1800); await GM.enter(q.zone,sp); }
  S_.ride=ride;
  /* 看微波爐、販賣機、公告欄、白板的字：配置檔的 note 是 LAWWW2 寫給開發組的（「說明文字由 AA 寫」），那幾個字不能出現在遊戲裡；正式的字 AA 寫好再換 */
  /* 看微波爐、販賣機、垃圾桶、公告欄、白板：AA_320 5-2（AA-C e48d8e09）；期末週沿用。沒有的才用配置檔的 note（去掉給開發組的話）*/
  const LOOK={ '3f':{ microwave:'微波爐前面貼著一張紙：「一次一個便當，三分鐘以內。」中午排隊的人排到樓梯口。', vending:'自動販賣機：茶、咖啡、能量飲料。咖啡那一排比別排空得快。', bins:'三個垃圾桶：一般垃圾、資源回收、廚餘。廚餘那桶的蓋子用膠帶補過。',
      notice:'公告欄：讀書會招人、二手書轉讓、系學會的考古題借閱。最下面一張寫著：「三樓請降低音量。」', whiteboard:'白板上寫著期中考的範圍，旁邊畫了一張表，三格打勾，兩格還空著。' },
    '4f':{ microwave:'這台比三樓那台新，門上貼著：「熱完請把門打開一下，讓味道散掉。」', vending:'自動販賣機只剩礦泉水和兩種咖啡。有一格貼著「補貨中」，紙已經有點黃了。', bins:'三個垃圾桶：一般垃圾、資源回收、廚餘。廚餘那桶的蓋子用膠帶補過。',
      notice:'公告欄上大多是講座的海報。角落有一張手寫的紙條：「撿到一支黑色螢光筆，放在白板下面。」', whiteboard:'白板上留著一題寫到一半的申論題，只寫到「本題爭點在於」就停了。' } };
  const lookText=(q,f)=>(f&&LOOK[f]&&LOOK[f][q.id])||String(q.note||q.label||'').replace(/；?說明文字由 AA 寫|（說明文字由 AA 寫）/g,'').replace(/（?LAWWW[^）]*）?/g,'').trim()||q.label;
  S_.lookText=lookText;
  /* 樓上的人（使用者 10-20「讓大家可以在那邊討論事情功課或者吃飯」）：一般同學（路人，沒有名字、沒有台詞；有名字的人照各自的作息，AA 排）。
     人數照時段：上課日 3F 午餐 11:30–13:30 八位、傍晚 17:30–19:00 六位、其他 8:00–21:00 四位、21:00–22:30 兩位；4F 自習 8:00–22:30 四位、午餐三位；
     週末、放假減半；22:30～8:00 沒有人。坐哪幾號：同一天同一串的前 n 個（日期當種子：出去再進來是同一批人坐同樣的位子，人數變了只多幾個或少幾個）。
     進來的時候已經坐著；待在樓上時段到了：從樓梯間走進來坐下、該走的起身走到樓梯間才離開（until，story3d.js refreshSchedule 下面路人離開的那一段）*/
  S_.want=function(f,G,seats){ const h=G.hour%24, wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:1, term=typeof CALENDAR==='undefined'||(CALENDAR.kind(G.day)==='term'&&wd!==0&&wd!==6);
    let n=0; if(h>=8&&h<22.5){ if(f==='3f') n=(h>=11.5&&h<13.5)?8:((h>=17.5&&h<19)?6:(h>=21?2:4)); else n=(h>=11.5&&h<13.5)?3:4; } if(!term) n=Math.floor(n/2);
    const ok=seats.map((q,i)=>i).filter(i=>seats[i]&&seats[i].study); if(!ok.length||!n) return []; const out=[]; let sd=((G.day|0)*7919+(f==='3f'?13:29))%2147483646+1;
    const pool=ok.slice(); for(let k=pool.length-1;k>0;k--){ sd=(sd*16807)%2147483647; const j=sd%(k+1); [pool[k],pool[j]]=[pool[j],pool[k]]; } for(const i of pool){ if(out.length>=n) break; out.push(i); } return out; };
  S_.populate=function(GM,entering){ const E=GM.E, G=GM.G; const m=/^linze_([34]f)$/.exec(G.zone||''); if(!m||!E.zone||!E.zone.seats||!E.player||typeof CHAR==='undefined'||typeof STORY==='undefined') return 0;
    const f=m[1], seats=E.zone.seats, h=G.hour%24, want=S_.want(f,G,seats), mine=E.npcs.filter(n=>n&&n.lzSeat!=null&&!n.leaving); let k=0;
    for(const n of mine) if(!want.includes(n.lzSeat)&&(n.until==null||n.until>h)){ n.until=h; n.seatTarget=null; k++; }
    const near=(q,st)=>!!q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35, busy=st=>(E.player&&near(E.player.seat,st))||E.npcs.some(q=>q&&(near(q.seat,st)||near(q.seatTarget,st)));
    const dr=LINZE_UPPER_LAYOUTS[f].stairs.spawn;
    for(const i of want){ if(mine.some(n=>n.lzSeat===i)) continue; const st=seats[i]; if(!st||busy(st)) continue; const o=CHAR.build(STORY.extraSpec(700+(((G.day|0)*11+i)%60))); const pose=f==='4f'?'read':'sit';
      if(entering){ o.position.set(st.x,0,st.z); o.rotation.y=st.yaw; E.addNPC({obj:o,name:'',beh:'idle',pose,idlePose:pose,frozen:true,isExtra:true,lzSeat:i,seat:{x:st.x,z:st.z,yaw:st.yaw,lv:0}}); k++; continue; }
      o.position.set(dr.x,0,dr.z); o.rotation.y=dr.yaw||0; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,lzSeat:i,lv:0}); if(!n) continue; n.seatTarget=st; k++;
      const sit=()=>{ n.seatTarget=null; if(n.leaving) return; if(busy(st)){ n.until=G.hour%24; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pose; };
      const ap=(GM.seatApproach&&GM.seatApproach(st))||st.ap||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,0))) sit(); }
    return k; };
  function zoneFor(f){ const L=LINZE_UPPER_LAYOUTS[f], WIN=L.windows;
    return { id:'linze_'+f, name:L.name, indoor:true, camDist:L.cam_dist||4.4, build(E){ const Bd=L.bounds, H=L.h||3.4, W=Bd.x1-Bd.x0, D=Bd.z1-Bd.z0;
      const z=Z3.room(E,{w:W,d:D,h:H,cool:true,winWall:WIN.wall,winXs:WIN.xs.map(x=>WIN.wall==='front'?-x:x),winY:WIN.y,view:'linze_'+f,viewDepth:30,wallColor:'#ece8df',floorTex:W3.stoneTex('#c9c4ba'),spawn:{x:L.stairs.spawn.x,z:L.stairs.spawn.z,yaw:L.stairs.spawn.yaw}});   /* room() 的 front 牆 x 是反的 */
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; if(z.winParts&&z.winParts.some(p=>p.obj===o)) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      const nav=new E3.NavGrid(W,D,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W+3,d:D+3};
      plane(fb,W,D,M('#c9c4ba'),0,0,0.005); const bm=M('#b9a486'); for(const b of L.blocks){ const h=/vending|elevator|column/.test(b.why)?1.9:0.75; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamps=[]; for(const [x,zz] of [[-4,-5],[4,-5],[-4,2.5],[2,2.5],[-4,5.5],[4,5.5]]){ const l=new THREE.PointLight(0xf6f8ff,3,12,2); l.position.set(x,H-0.4,zz); l.userData.on=5; l.userData.off=3.2; g0.add(l); lamps.push(l); }
      let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); };
      const IT=E.interactables; z.seats=[];
      for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; if(s.ap) st.ap=s.ap; if(s.kind==='study') st.study=true; z.seats.push(st); IT.push(Object.assign({x:s.x,z:s.z,radius:0.7,lv:0,seat:st,label:s.label||'坐下'},s.kind==='study'?{study:true}:{})); }
      for(const q of L.interact){ if(q.id==='elevator'||q.id==='stairs') continue; IT.push({x:q.x,z:q.z,radius:q.r,lv:0,label:q.label,look:lookText(q,f)}); }
      for(const d of L.doors){ if(d.kind==='stair') continue; IT.push({x:d.x,z:d.z+0.75,radius:1.0,lv:0,label:d.label,look:d.label+'。這個時段有課，門關著。'}); }
      const st=L.stairs, sx=st.door.x, sz=st.door.z+0.55;
      { const dn=st.down; IT.push({x:sx-0.45,z:sz,radius:0.6,lv:0,label:dn.label,exit:{to:dn.to,spawn:dn.to==='linze'?Object.assign({},L2SPAWN):Object.assign({},LINZE_UPPER_LAYOUTS[dn.to.slice(6)].stairs.spawn)}}); }
      { const up=st.up; if(up.to) IT.push({x:sx+0.45,z:sz,radius:0.6,lv:0,label:up.label,exit:{to:up.to,spawn:Object.assign({},LINZE_UPPER_LAYOUTS[up.to.slice(6)].stairs.spawn)}}); else IT.push({x:sx+0.45,z:sz,radius:0.6,lv:0,label:up.label,look:up.closed}); }
      { const el=L.elevator; IT.push({x:(el.doorX0+el.doorX1)/2,z:el.z0-0.7,radius:0.8,lv:0,label:'搭電梯',elevator:true,onInteract:()=>ride(f,el.floors)}); }
      z.formal=false; const key='bldg.linze_'+f; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
        glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('霖澤館樓上正式模型載入失敗',f,e));
      return z; } }; }
  if(typeof LINZE_UPPER_LAYOUTS!=='undefined') for(const f of Object.keys(LINZE_UPPER_LAYOUTS)){ Z3.ZONES['linze_'+f]=zoneFor(f);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.linze_'+f]={url:'assets/models/env/second_ai/linze_'+f+'.glb',type:'building',lazy:true,source:'LAWWW2-C linze_upper.py',license:'本作'}; }
  if(typeof window!=='undefined') window.LZUP=S_;   /* 測試用（tests/linze_upper_unit.js）*/
})();
