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
     nav、cx、cz、scale＝drawMinimap 那一套（玩家所在那一格、一格幾像素）；yaw＝E.cam.yaw（地圖轉的角度）。回傳畫了哪些（測試用）*/
  S.drawMini=function(x,nav,cx,cz,scale,yaw,W,H,G,zone,lv){ if(!x||!nav) return []; const L=S.labels(G,zone,lv); if(!L.length) return [];
    const c=Math.cos(yaw||0), s=Math.sin(yaw||0), px=W/2, py=H/2, M=4, fs=Math.max(15,Math.round(Math.min(W,H)*0.125)), boxes=[], drawn=[];
    const pos=q=>{ const u=((q.x-nav.ox)/nav.cell-cx-0.5)*scale, v=((q.z-nav.oz)/nav.cell-cz-0.5)*scale; return [px+u*c-v*s, py+u*s+v*c]; };
    const L2=L.map(q=>{ const [sx,sy]=pos(q); return {q,sx,sy,d:Math.hypot(sx-px,sy-py)}; }).sort((a,b)=>(b.q.today?1:0)-(a.q.today?1:0)||a.d-b.d);
    x.save(); x.textAlign='center'; x.textBaseline='middle'; x.lineJoin='round';
    for(const r of L2){ const t=(r.q.today?'★':'')+r.q.mini; x.font='bold '+fs+'px sans-serif'; const tw=x.measureText(t).width, th=fs;
      const b=[r.sx-tw/2-2,r.sy-th/2-1,r.sx+tw/2+2,r.sy+th/2+1]; if(b[0]<M||b[2]>W-M||b[1]<M||b[3]>H-M) continue; if(boxes.some(o=>overlap(b,o))) continue; boxes.push(b);
      x.lineWidth=3.5; x.strokeStyle=LINE; x.strokeText(t,r.sx,r.sy); x.fillStyle=r.q.today?GOLD:TXT; x.fillText(t,r.sx,r.sy); drawn.push({id:r.q.id,text:t,x:r.sx,y:r.sy,box:b,today:!!r.q.today}); }
    x.restore(); return drawn; };
  /* 大地圖：guide3d.js 的 drawMap 在畫入口以前呼叫（S＝世界座標轉畫面；free＝drawMap 那一套「這一塊還空著就佔用」）。
     字：配置的名字去掉館名；今天的那一間「★ 101（階梯教室）　13:20 憲法（上）」——太擠先拿掉課名、再只寫門號，還是擠就不寫（今天的那一間一定寫）*/
  S.drawBig=function(x,toS,G,zone,lv,free){ if(!x||!toS) return []; const L=S.labels(G,zone,lv); if(!L.length) return []; const drawn=[];
    const ord=L.slice().sort((a,b)=>(b.today?1:0)-(a.today?1:0));
    x.save(); x.textAlign='center'; x.textBaseline='middle'; x.lineJoin='round';
    for(const q of ord){ const [u,w]=toS(q.x,q.z); const star=q.today?'★ ':'';
      const tries=[star+q.text+(q.today?'　'+hhmm(q.today.t0)+' '+q.today.name:''), star+q.text, star+(q.num||q.mini)];
      let t=null; for(const c of tries){ x.font=(q.today?'700 ':'600 ')+'14px "Noto Sans TC","PingFang TC",sans-serif'; const tw=x.measureText(c).width; if(!free||free(u,w,tw,17)){ t=c; break; } }
      if(t==null&&q.today) t=tries[2]; if(t==null) continue;
      x.font=(q.today?'700 ':'600 ')+'14px "Noto Sans TC","PingFang TC",sans-serif'; x.lineWidth=3.5; x.strokeStyle=LINE; x.strokeText(t,u,w); x.fillStyle=q.today?GOLD:'#d9eef2'; x.fillText(t,u,w);
      drawn.push({id:q.id,text:t,x:u,y:w,today:!!q.today}); }
    x.restore(); return drawn; };
  return S;
})();
