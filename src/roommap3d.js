/* ===== 教學館室內地圖的教室名牌（ROOM-MAP-LABELS-1030；使用者 2026-10-30「教室 應該在地圖顯示 例如普通 101 要能從地圖看的出來 往哪邊是哪間教室 其他教學樓也依樣」）=====
   小地圖（game3d.js 的 drawMinimap：前方朝上旋轉）和大地圖（guide3d.js 的 drawMap：點小地圖打開，北朝上）在教學館室內標出每間教室的位置與門號，
   玩家所在那一層才畫（多樓層照 E.player.lv／大地圖的那一層）；今天還要上的課的那一間（CLS.dayItems 的 room、還沒下課）金色＋星號，大地圖另外寫幾點、哪一門課。
   哪些區域、哪些房間（名稱一律從配置讀，不寫死——之後教室更名改配置就好）：
   - 普通、博雅、共同教學館（PUTONG_LAYOUT／BOYA_LAYOUT／GONGTONG_LAYOUT 的 rooms）：教室（classroom）、階梯教室（lecture），和門號是數字的關著的教室（例：博雅 103「之後開放」、普通 203「借用中」）；
     洗手間、器材室、往空橋不標。名牌在房間正中間。
   - 霖澤館 1F、2F（LINZE_LAYOUT.doors）、萬才館（WANCAI_LAYOUT.doors）、霖澤館 3F、4F（LINZE_UPPER_LAYOUTS 的 doors）：教室在牆的另一邊（走進去是另一個區域），
     名牌在門口（和門的互動點同一點）；門號是數字的（101、201、202、301…）和名字裡有教室、研討室、演講廳的（多功能教室、研討室 A）才標，樓梯間、辦公室不標。
     霖澤館 5F 是研究室（不是教室）、社科院沒有教室的室內：不標。
   - 小地圖只寫門號（沒有門號的寫配置上的名字）；大地圖寫配置的名字去掉館名（「101（階梯教室）」），太擠就只寫門號，還是擠就不寫（今天的那一間一定寫）。
   測試：node tests/room_map_labels_unit.js */
'use strict';
const ROOMMAP=(function(){
  const S={};
  /* 配置（const，每次用到才讀：載入順序不限）*/
  const ROOM_ZONES={ putong:()=>typeof PUTONG_LAYOUT!=='undefined'?PUTONG_LAYOUT:null, boya:()=>typeof BOYA_LAYOUT!=='undefined'?BOYA_LAYOUT:null, gongtong:()=>typeof GONGTONG_LAYOUT!=='undefined'?GONGTONG_LAYOUT:null };
  const UP=f=>typeof LINZE_UPPER_LAYOUTS!=='undefined'&&LINZE_UPPER_LAYOUTS?LINZE_UPPER_LAYOUTS[f]:null;
  const DOOR_ZONES={ linze:()=>{ const L=typeof LINZE_LAYOUT!=='undefined'?LINZE_LAYOUT:null; return L&&{doors:L.doors,z:d=>-L.D/2+0.75}; },
                     wancai:()=>{ const L=typeof WANCAI_LAYOUT!=='undefined'?WANCAI_LAYOUT:null; return L&&{doors:L.doors,z:d=>-L.D/2+0.75}; },   /* 門的互動點：building3d.js、wancai3d.js 的 z=-D/2+0.75 */
                     linze_3f:()=>{ const L=UP('3f'); return L&&{doors:L.doors,z:d=>d.z+0.75}; },
                     linze_4f:()=>{ const L=UP('4f'); return L&&{doors:L.doors,z:d=>d.z+0.75}; } };   /* linze_upper3d.js 的門：z+0.75 */
  const GLB=()=>typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS:null;
  S.ZONES=Object.keys(ROOM_ZONES).concat(Object.keys(DOOR_ZONES));
  const numOf=(id,label)=>/^\d+$/.test(String(id))?String(id):((String(label||'').match(/\d{3}/)||[])[0]||null);
  const bigText=label=>String(label||'').replace(/^\S+\s+(?=\d)/,'');   /* 「普通 101」→「101」、「博雅 101（階梯教室）」→「101（階梯教室）」；霖澤館的「201 階梯教室」、萬才館的「研討室 A」照原樣 */
  const ROOM_OK=r=>r&&(r.kind==='classroom'||r.kind==='lecture'||(r.kind==='closed'&&/^\d+$/.test(String(r.id))));
  const DOOR_OK=d=>d&&d.kind!=='stair'&&!/^stair/.test(String(d.id||''))&&(/^\d{3}/.test(String(d.label||''))||/教室|研討室|演講廳/.test(String(d.label||'')));
  /* 這一區的教室（不看時間）：{id, num, mini（小地圖的字）, text（大地圖的字）, label（配置上的名字）, x, z, lv, door（門的資料，門口那一型）} */
  S.rooms=function(zone){ const out=[];
    if(ROOM_ZONES[zone]){ const L=ROOM_ZONES[zone](); if(!L||!Array.isArray(L.rooms)) return out;
      for(const r of L.rooms){ if(!ROOM_OK(r)) continue; const num=numOf(r.id,r.label); out.push({id:String(r.id),num,mini:num||bigText(r.label),text:bigText(r.label),label:r.label,x:+((r.x0+r.x1)/2).toFixed(2),z:+((r.z0+r.z1)/2).toFixed(2),lv:r.lv|0,room:r}); }
      return out; }
    if(DOOR_ZONES[zone]){ const D=DOOR_ZONES[zone](); if(!D||!Array.isArray(D.doors)) return out;
      for(const d of D.doors){ if(!DOOR_OK(d)) continue; const num=numOf(null,d.label); out.push({id:String(d.id),num,mini:num||String(d.label),text:String(d.label),label:d.label,x:d.x,z:+D.z(d).toFixed(2),lv:d.lv|0,door:d}); }
      return out; }
    return out; };
  /* 課表的一堂（CLS.dayItems）在不在這一間：教學館（同一區、同一個房號）；門口那一型（走進去是另一區：霖澤館 201＝classroom 區、202＝linze_202、萬才館多功能教室＝wancai_multi；萬才館研討室 A 是門口上課，照名字）*/
  S.matches=function(zone,q,it){ const R=it&&it.room; if(!R||!q) return false;
    if(q.room) return R.zone===zone&&String(R.room)===q.id;
    const d=q.door; if(!d) return false;
    if(R.room&&String(R.room)===String(d.id)&&(R.via===zone||R.zone===zone)) return true;
    if(d.to&&R.zone===d.to) return true;
    if(R.zone===zone&&R.label&&R.label===d.label) return true;
    const GL=GLB(), h=GL&&R.zone&&GL[R.zone]&&GL[R.zone].host_door; return !!(h&&h.zone===zone&&String(h.id)===String(d.id)); };
  /* 今天還要上的課（還沒下課；過了午夜不算）*/
  S.todayItems=function(G){ if(!G||typeof CLS==='undefined'||!CLS.dayItems) return []; if(G.hour>=24) return []; const h=G.hour%24; let L=[]; try{ L=CLS.dayItems(G)||[]; }catch(e){ return []; } return L.filter(it=>h<it.t1); };
  /* 名牌（玩家那一層；lv==null＝全部）：rooms 再加 today（今天的那一堂：{t0, name}）*/
  S.labels=function(G,zone,lv){ const R=S.rooms(zone); if(!R.length) return []; const T=S.todayItems(G);
    return R.filter(q=>lv==null||(q.lv|0)===(lv|0)).map(q=>{ const it=T.find(t=>S.matches(zone,q,t)); return Object.assign({},q,{today:it?{t0:it.t0,t1:it.t1,name:it.c&&it.c.name||''}:null}); }); };
  const hhmm=x=>{ x=((x%24)+24)%24; return String(Math.floor(x+1e-6)).padStart(2,'0')+':'+String(Math.round((x%1)*60)%60).padStart(2,'0'); };
  S.hhmm=hhmm;
  const GOLD='#ffd88a', TXT='#eaf3f6', LINE='rgba(16,18,22,0.92)';
  const overlap=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
  /* 小地圖：game3d.js 的 drawMinimap 在 x.restore() 以後呼叫（字不跟著地圖轉：位置照旋轉算、字正著寫）。
     nav、cx、cz、scale＝drawMinimap 那一套（玩家所在那一格、一格幾像素）；yaw＝E.cam.yaw（地圖轉的角度）。回傳畫了哪些（測試用）。
     名牌的位置：房間正中間在小地圖裡＝寫在正中間；不在（小地圖只看得到附近幾公尺）＝寫在那一間離玩家最近、看得到的那一角（往裡 1.2 m）——走廊上看得出兩邊各是哪一間。
     門口那一型（霖澤館、萬才館）寫在門口。不蓋住玩家的箭頭、互相不重疊、超出小地圖就不寫；今天的那一間先排 */
  S.drawMini=function(x,nav,cx,cz,scale,yaw,W,H,G,zone,lv){ if(!x||!nav) return []; const L=S.labels(G,zone,lv); if(!L.length) return [];
    const c=Math.cos(yaw||0), s=Math.sin(yaw||0), px=W/2, py=H/2, M=4, fs=Math.max(15,Math.round(Math.min(W,H)*0.125)), drawn=[];
    const boxes=[[px-11,py-11,px+11,py+11]];   /* 玩家的箭頭 */
    const pos=(wx,wz)=>{ const u=((wx-nav.ox)/nav.cell-cx-0.5)*scale, v=((wz-nav.oz)/nav.cell-cz-0.5)*scale; return [px+u*c-v*s, py+u*s+v*c]; };
    const pw=[nav.ox+(cx+0.5)*nav.cell, nav.oz+(cz+0.5)*nav.cell];   /* 玩家（所在那一格的中心）*/
    const clamp=(v,a,b)=>a>b?(a+b)/2:Math.max(a,Math.min(b,v));
    const cands=q=>{ const out=[[q.x,q.z]]; const r=q.room; if(r){ const ix=Math.min(1.2,(r.x1-r.x0)/2), iz=Math.min(1.2,(r.z1-r.z0)/2); out.push([clamp(pw[0],r.x0+ix,r.x1-ix),clamp(pw[1],r.z0+iz,r.z1-iz)]); } return out; };
    const L2=L.map(q=>{ const [sx,sy]=pos(q.x,q.z); return {q,d:Math.hypot(sx-px,sy-py)}; }).sort((a,b)=>(b.q.today?1:0)-(a.q.today?1:0)||a.d-b.d);
    x.save(); x.textAlign='center'; x.textBaseline='middle'; x.lineJoin='round'; x.font='bold '+fs+'px sans-serif';
    for(const r of L2){ const t=(r.q.today?'★':'')+r.q.mini, tw=x.measureText(t).width, th=fs; let hit=null;
      for(const [wx,wz] of cands(r.q)){ const [sx,sy]=pos(wx,wz), b=[sx-tw/2-2,sy-th/2-1,sx+tw/2+2,sy+th/2+1]; if(b[0]<M||b[2]>W-M||b[1]<M||b[3]>H-M) continue; if(boxes.some(o=>overlap(b,o))) continue; hit={sx,sy,b}; break; }
      if(!hit) continue; boxes.push(hit.b);
      x.lineWidth=3.5; x.strokeStyle=LINE; x.strokeText(t,hit.sx,hit.sy); x.fillStyle=r.q.today?GOLD:TXT; x.fillText(t,hit.sx,hit.sy); drawn.push({id:r.q.id,text:t,x:hit.sx,y:hit.sy,box:hit.b,today:!!r.q.today}); }
    x.restore(); return drawn; };
  /* 大地圖：guide3d.js 的 drawMap 在畫入口以前呼叫（toS＝世界座標轉畫面；free＝drawMap 那一套「這一塊還空著就佔用」）。
     字：配置的名字去掉館名（「101（階梯教室）」）；今天的那一間金色「★ 101」、下面一行小字「13:20 憲法（上）」。
     放不下（比那一間在畫面上窄、或和旁邊的名牌太近）就先拿掉第二行、再只寫門號；還是和別的字重疊就不寫（今天的那一間一定寫門號）*/
  const F1=b=>(b?'700 ':'600 ')+'14px "Noto Sans TC","PingFang TC",sans-serif', F2='12px "Noto Sans TC","PingFang TC",sans-serif';
  S.drawBig=function(x,toS,G,zone,lv,free){ if(!x||!toS) return []; const L=S.labels(G,zone,lv); if(!L.length) return []; const drawn=[];
    const P=L.map(q=>{ const [u,w]=toS(q.x,q.z); let avail=Infinity; const r=q.room;
      if(r){ const xs=[[r.x0,r.z0],[r.x1,r.z0],[r.x0,r.z1],[r.x1,r.z1]].map(c=>toS(c[0],c[1])[0]); avail=Math.max(...xs)-Math.min(...xs)-6; }   /* 那一間在畫面上的寬 */
      return {q,u,w,avail}; });
    for(const p of P){ for(const o of P){ if(o===p) continue; if(Math.abs(o.w-p.w)<20) p.avail=Math.min(p.avail,2*Math.abs(o.u-p.u)-8); } }   /* 同一列旁邊的名牌：一半的距離 */
    const ord=P.slice().sort((a,b)=>(b.q.today?1:0)-(a.q.today?1:0));
    x.save(); x.textAlign='center'; x.textBaseline='middle'; x.lineJoin='round';
    const meas=(f,t)=>{ x.font=f; return x.measureText(t).width; };
    for(const p of ord){ const q=p.q, star=q.today?'★ ':'';
      const tries=q.today?[{l1:star+q.text,l2:hhmm(q.today.t0)+' '+q.today.name},{l1:star+q.text},{l1:star+(q.num||q.mini)}]:[{l1:q.text},{l1:q.num||q.mini}];
      for(const t of tries) t.w=Math.max(meas(F1(q.today),t.l1),t.l2?meas(F2,t.l2):0);
      let pick=tries.find(t=>t.w<=p.avail)||tries[tries.length-1];
      const ok=t=>!free||free(p.u,p.w+(t.l2?8:0),t.w,t.l2?34:17);
      if(!ok(pick)){ const i=tries.indexOf(pick); pick=tries.slice(i+1).find(ok)||null; }
      if(!pick&&q.today) pick=tries[tries.length-1]; if(!pick) continue;
      const y1=pick.l2?p.w-1:p.w; x.font=F1(q.today); x.lineWidth=3.5; x.strokeStyle=LINE; x.strokeText(pick.l1,p.u,y1); x.fillStyle=q.today?GOLD:'#d9eef2'; x.fillText(pick.l1,p.u,y1);
      if(pick.l2){ x.font=F2; x.lineWidth=3; x.strokeText(pick.l2,p.u,p.w+16); x.fillStyle='#f4e2bb'; x.fillText(pick.l2,p.u,p.w+16); }
      drawn.push({id:q.id,text:pick.l1+(pick.l2?'｜'+pick.l2:''),l1:pick.l1,l2:pick.l2||'',x:p.u,y:p.w,today:!!q.today}); }
    x.restore(); return drawn; };
  return S;
})();
