/* ===== 美國超市街的車流（US-MARKET-CROWD-1021；LAWWW2 交件時列的「還不到」：車停著不動、街上沒有人）=====
   車道照配置 US_MARKET_STREET_LAYOUT.lane_c（往西 w1、w2；往東 e2、e1；美國靠右走：往西在北半邊）；停止線 stop_e（往東）、stop_w（往西）；車的模型照停車場那一份 bldg.us_cars（同 us3d.js 停著的車，car_paint 上色）。
   配置裡馬路上那幾台 waiting（等紅燈）的車改由這裡開：us3d.js 看 S.owns 不畫、不擋導航；一進來是紅燈、照配置的位置停著（畫面和原本一樣），紅燈剩 5 秒，綠燈就開走。停車場出口等左轉那台照舊是 us3d.js 的。
   規則（S.step，沒有畫面也算得出來，tests/us_traffic_unit.js）：
   - 號誌：綠燈 24 秒、黃燈 3 秒、紅燈 16 秒；紅燈停在停止線前（車的中心在線前 2.5 m）；黃燈時離停止線 6 m 以內的照樣過；
   - 每條車道照時間有幾台（07～20 點 2 台、06～07 和 20～22 點 1 台、22～06 點只有兩條外側車道各 1 台），速度 7～9 m/s；開出邊界（x 超過 ±44）就從另一頭回來，±42.5 以外不畫；
   - 讓人：同一條車道前面 14 m 內有玩家（馬路上都走得到）→ 照距離慢下來、停在玩家前 4 m；跟車：前面那台 25 m 內就照距離減速，中心距停在 6 m，不會穿過去；開出邊界繞回來時入口有車就排在後面。
   路人在 story3d.js（超市街的 walkRoutes、美國版的路人外型 S.extraSpecUS）；路人只走人行道、超市門口，不過馬路（車只讓玩家）。 */
const US_TRAFFIC=(function(){
  const S={};
  const KINDS=['car_sedan','car_suv','car_hatch','car_minivan','car_pickup','car_sedan'];
  const PAINT=['#8d9196','#2b2d30','#c9ccd0','#7a2a2a','#3d4a3c','#e8e6e0','#2f4a6b','#5a5f66'];
  S.X1=44; S.SHOW=42.5; S.YIELD=14; S.STOP=4; S.GAP=25; S.MINGAP=6; S.CYCLE={green:24,yellow:3,red:16}; S.T0=38;   /* T0：一進來的號誌時間＝紅燈還剩 5 秒 */
  const MSL=()=>typeof US_MARKET_STREET_LAYOUT!=='undefined'?US_MARKET_STREET_LAYOUT:null;
  /* 車道：配置的 lane_c；沒有配置就 null（不開車） */
  S.lanes=function(L){ const c=L&&L.lane_c; if(!c) return null; return [{id:'w1',z:c.w1,dir:-1},{id:'w2',z:c.w2,dir:-1},{id:'e2',z:c.e2,dir:1},{id:'e1',z:c.e1,dir:1}]; };
  S.laneOf=function(L,z){ const ls=S.lanes(L)||[]; let best=null, bd=1.2; for(const l of ls){ const d=Math.abs(l.z-z); if(d<bd){ bd=d; best=l; } } return best; };
  /* 配置裡馬路上等紅燈的車歸這裡（us3d.js 不畫、不擋導航） */
  S.owns=function(L,c){ return !!(L&&L===MSL()&&c&&c.waiting&&L.road&&c.z>L.road.z0&&c.z<L.road.z1&&S.laneOf(L,c.z)); };
  /* 每條車道幾台 */
  S.perLane=function(hour,lane){ const h=((hour%24)+24)%24; if(h>=7&&h<20) return 2; if((h>=6&&h<7)||(h>=20&&h<22)) return 1; return (lane.id==='w1'||lane.id==='e1')?1:0; };
  /* 號誌：t＝秒 */
  S.light=function(t){ const C=S.CYCLE, T=C.green+C.yellow+C.red, x=((t%T)+T)%T; return x<C.green?'green':(x<C.green+C.yellow?'yellow':'red'); };
  /* 紅燈停的地方（車的中心）：往東停在 stop_e 前 2.5 m、往西停在 stop_w 前 2.5 m（配置等紅燈的車中心在線前 2.6～2.9 m，皮卡車頭稍微壓線） */
  S.stopX=function(L,dir){ return dir>0?(L.stop_e-2.5):(L.stop_w+2.5); };
  /* 一開始的車：先照配置馬路上等紅燈的車（同車道由前往後），不夠再往後排（間隔 6.5 m）；超過那個時間該有的台數就不放 */
  S.initial=function(L,hour,day){ const out=[]; let k=0; for(const lane of (S.lanes(L)||[])){ const n=S.perLane(hour,lane); if(!n) continue;
      const w=(L.cars||[]).filter(c=>S.owns(L,c)&&S.laneOf(L,c.z).id===lane.id).sort((a,b)=>(b.x-a.x)*lane.dir);
      for(let i=0;i<n;i++){ const src=w[i]; const x=src?src.x:(i?out[out.length-1].x-6.5*lane.dir:S.stopX(L,lane.dir)); out.push({lane:lane.id,dir:lane.dir,z:lane.z,x,kind:src?src.kind:KINDS[(k*5+(day|0))%KINDS.length],color:src?src.color:PAINT[(k*3+1)%PAINT.length]}); k++; } }
    return out; };
  /* 一台車往前一步：c={x,z,dir,v,vmax,lane}；ctx={px,pz,cars,light,L}。回傳新的 x（也寫回 c） */
  S.step=function(c,dt,ctx){ ctx=ctx||{}; let target=c.vmax;
    if(ctx.L&&ctx.light&&ctx.light!=='green'){ const d=(S.stopX(ctx.L,c.dir)-c.x)*c.dir; if(d>(c.v<0.5?-1:0)&&d<30&&(ctx.light==='red'||d>6)) target=Math.min(target,d<0.3?0:d*0.9); }   /* 紅燈停在線前（已經停著的多給 1 m：等紅燈的車照原位置）；黃燈 6 m 以內照樣過 */
    if(ctx.px!=null){ const ahead=(ctx.px-c.x)*c.dir; if(Math.abs(ctx.pz-c.z)<1.7&&ahead>0&&ahead<S.YIELD) target=Math.min(target,Math.max(0,(ahead-S.STOP)*0.8)); }   /* 讓人：照距離慢下來（減速度 7 m/s² 停得住） */
    if(ctx.cars) for(const o of ctx.cars){ if(o===c||o.lane!==c.lane) continue; const gap=(o.x-c.x)*c.dir; if(gap>0&&gap<S.GAP) target=Math.min(target,Math.max(0,o.v+(gap-S.MINGAP)*0.8)); }   /* 跟車：前車停著的話提早減速，中心距停在 6 m */
    const up=target>c.v; c.v=up?Math.min(target,c.v+3*dt):Math.max(target,c.v-7*dt); if(c.v<0.02&&target<0.02) c.v=0;
    c.x+=c.v*c.dir*dt; if(c.x*c.dir>S.X1){ let nx=-S.X1*c.dir; if(ctx.cars) for(const o of ctx.cars){ if(o!==c&&o.lane===c.lane&&(o.x-nx)*c.dir<S.MINGAP+0.5) nx=o.x-(S.MINGAP+0.5)*c.dir; } c.x=nx; }   /* 開出邊界：從另一頭回來（入口有車就排在它後面，邊界外看不到） */
    return c.x; };
  /* 進超市街時開始（story3d.js 生成路人那一段呼叫）：讀 bldg.us_cars，複製車子的節點、上色、車燈開著，放進 E.extras（每一格 update） */
  S.start=function(GM){ const E=GM&&GM.E, G=GM&&GM.G, L=MSL(); if(!E||!E.zone||E.zone.id!=='us_market_street'||!L||typeof ASSETS==='undefined'||!ASSETS.loadOne) return false;
    const zone=E.zone, init=S.initial(L,G?G.hour:12,G?G.day:0); if(!init.length) return false;
    const clock={t:S.T0,obj:new THREE.Group()}; clock.update=dt=>{ clock.t+=Math.min(dt,0.1); };
    ASSETS.loadOne('bldg.us_cars').then(src=>{ if(!src||!src.scene||E.zone!==zone) return; const cars=[], paint={}; let k=0;
      if(E.addExtra) E.addExtra(clock); else E.extras.push(clock);   /* 號誌的時鐘（obj 是空的群組：換區域時跟著車一起拿掉）*/
      for(const q of init){ const node=src.scene.getObjectByName(q.kind); if(!node) continue; const obj=node.clone(true);
        obj.traverse(r=>{ if(!r.isMesh) return; r.castShadow=true; const ms=[].concat(r.material).map(m=>m&&m.name==='car_paint'?(paint[q.color]||(paint[q.color]=Object.assign(m.clone(),{color:new THREE.Color(q.color)}))):m); r.material=Array.isArray(r.material)?ms:ms[0]; });
        obj.position.set(q.x,0,q.z); obj.rotation.set(0,q.dir>0?Math.PI/2:-Math.PI/2,0);   /* 車頭朝 +z（us_cars.json）：往東轉 +90 度、往西 −90 度（同配置的 yaw ±1.5708） */
        const vmax=7+((k*7)%3), c={x:q.x,z:q.z,dir:q.dir,v:0,vmax,lane:q.lane,obj,car:true};
        c.update=dt=>{ if(E.zone!==zone) return; const P=E.player&&E.player.obj&&E.player.obj.position; S.step(c,Math.min(dt,0.1),{px:P?P.x:null,pz:P?P.z:null,cars,light:S.light(clock.t),L}); obj.position.x=c.x; obj.visible=Math.abs(c.x)<=S.SHOW; };
        cars.push(c); if(E.addExtra) E.addExtra(c); else { E.scene.add(obj); E.extras.push(c); } k++; }
      S.cars=cars; S.clock=clock; }).catch(e=>console.warn('US_TRAFFIC',e));
    return true; };
  return S;
})();
