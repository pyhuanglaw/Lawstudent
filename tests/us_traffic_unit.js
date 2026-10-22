// US-MARKET-CROWD-1021：美國超市街的車會動、街上有路人（src/us_traffic3d.js、story3d.js 的超市街路人）——不需要瀏覽器。
//   1 車道照配置 lane_c（往西 w1、w2 在北半邊；往東 e2、e1）；配置裡馬路上等紅燈的 6 台歸車流（us3d.js 不畫、不擋導航），停車場出口那台不是
//   2 台數照時間：白天每條 2 台、早晚 1 台、深夜只有兩條外側車道；一開始照配置等紅燈的位置停著（畫面和原本一樣），不夠往後排
//   3 號誌：一進來紅燈剩 5 秒；紅燈時沒有車越過停止線（往東 stop_e、往西 stop_w），綠燈開走；跑兩分鐘：同一條車道的車不會重疊
//   4 讓人：玩家站在車道上，車停在玩家前 4 m 以外；玩家走開車再開。開出邊界（±44）從另一頭回來
//   5 接線：us3d.js 三處（導航、備用方塊、正式模型）跳過歸車流的車；story3d.js 進超市街生成路人＋開車；index.html 在 us3d.js 後面載入
//   6 路人的路線（S.usStreetRoutes）：不碰配置的障礙物（0.3 m 餘裕）、不進馬路；美國版路人外型膚色、髮色有好幾種
// 修改前（開發分支 f2336295）：沒有 US_TRAFFIC（第 1 項起 FAIL）。用法：node tests/us_traffic_unit.js
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); let fails=0;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
global.window=global;
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return false; vm.runInThisContext(fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); return true; };
load('src/data/us_layouts.js'); const ok=load('src/us_traffic3d.js');
const J=JSON.stringify, L=globalThis.US_MARKET_STREET_LAYOUT, T=globalThis.US_TRAFFIC;
check('0. 有 US_TRAFFIC、超市街配置',ok&&!!T&&!!L);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
/* 1 */
const lanes=T.lanes(L);
check('1. 四條車道：往西 w1、w2（北半邊，z 小）、往東 e2、e1',J(lanes.map(l=>[l.id,l.z,l.dir]))===J([['w1',L.lane_c.w1,-1],['w2',L.lane_c.w2,-1],['e2',L.lane_c.e2,1],['e1',L.lane_c.e1,1]])&&L.lane_c.w2<L.road.lanes_w[1]&&L.lane_c.e2>L.road.lanes_e[0]);
const owned=L.cars.filter(c=>T.owns(L,c)), lot=L.cars.find(c=>c.waiting&&c.z<L.road.z0);
check('1. 馬路上等紅燈的 6 台歸車流；停車場出口等左轉那台、停著的車不歸',owned.length===6&&owned.every(c=>c.waiting)&&!!lot&&!T.owns(L,lot)&&!L.cars.filter(c=>!c.waiting).some(c=>T.owns(L,c))&&!T.owns({},owned[0]),J(owned.map(c=>[c.x,c.z])));
/* 2 */
const per=h=>lanes.map(l=>T.perLane(h,l)).join('');
check('2. 台數：10:00 每條 2、06:30 和 21:00 每條 1、23:00 和 03:00 只有外側（w1、e1）',per(10)==='2222'&&per(6.5)==='1111'&&per(21)==='1111'&&per(23)==='1001'&&per(3)==='1001',J([per(10),per(6.5),per(21),per(23),per(3)]));
const init=T.initial(L,10,5), byLane=id=>init.filter(q=>q.lane===id);
check('2. 白天一開始 8 台：配置等紅燈的 6 台照原位置、原車型；w2、e1 往後多排一台（間隔 6.5 m）',init.length===8&&owned.every(c=>init.some(q=>q.x===c.x&&Math.abs(q.z-T.laneOf(L,c.z).z)<1e-9&&q.kind===c.kind&&q.color===c.color))&&Math.abs(byLane('w2')[1].x-(byLane('w2')[0].x+6.5))<1e-9&&Math.abs(byLane('e1')[1].x-(byLane('e1')[0].x-6.5))<1e-9,J(init.map(q=>[q.lane,q.x])));
check('2. 深夜 23:00：只有 w1、e1 各 1 台（排頭那台）',J(T.initial(L,23,5).map(q=>q.lane))===J(['w1','e1']));
/* 3 */
check('3. 號誌：一進來紅燈（剩 5 秒）、5 秒後綠燈、24 秒後黃燈',T.light(T.S0||T.T0)==='red'&&T.light(T.T0+4.9)==='red'&&T.light(T.T0+5.1)==='green'&&T.light(T.T0+5+24.1)==='yellow'&&T.light(T.T0+5+27.1)==='red');
const sim=(secs,player,cars0)=>{ const cars=(cars0||T.initial(L,10,5)).map((q,i)=>({x:q.x,z:q.z,dir:q.dir,v:0,vmax:7+((i*7)%3),lane:q.lane})); let t=T.T0, bad=[], overlap=0, minGap=1e9; const dt=0.05;
  for(let s=0;s<secs/dt;s++){ const light=T.light(t); const before=cars.map(c=>(T.stopX(L,c.dir)-c.x)*c.dir);
    for(const c of cars) T.step(c,dt,{px:player?player.x:null,pz:player?player.z:null,cars,light,L});
    cars.forEach((c,i)=>{ const after=(T.stopX(L,c.dir)-c.x)*c.dir; if(light==='red'&&before[i]>-0.3&&after<=-0.3&&before[i]>6) bad.push([c.lane,+t.toFixed(1)]); });
    for(const a of cars) for(const b of cars){ if(a===b||a.lane!==b.lane) continue; const g=Math.abs(a.x-b.x); if(g<44) minGap=Math.min(minGap,g); if(g<4.9) overlap++; }
    t+=dt; if(player&&player.move) player.move(t,player); }
  return {cars,bad,overlap,minGap}; };
const r1=sim(4.5);
check('3. 紅燈那 5 秒：所有車停在原地（等紅燈的位置），沒有越過停止線',r1.cars.every((c,i)=>Math.abs(c.x-init[i].x)<0.6)&&!r1.bad.length,J(r1.cars.map(c=>+c.x.toFixed(2))));
const r2=sim(14);
check('3. 綠燈以後開走（排頭的車越過停止線）',r2.cars.filter(c=>(T.stopX(L,c.dir)-c.x)*c.dir<-3).length>=4,J(r2.cars.map(c=>[c.lane,+c.x.toFixed(1)])));
const r3=sim(130);
check('3. 跑 130 秒（三個紅綠燈）：紅燈時沒有車越過停止線（黃燈 6 m 以內的除外）；同一條車道的車不重疊（中心距 ≥ 4.9 m）',!r3.bad.length&&r3.overlap===0&&r3.minGap>=4.9,J({bad:r3.bad.slice(0,5),overlap:r3.overlap,minGap:+r3.minGap.toFixed(2)}));
/* 4 */
const P={x:-20,z:L.lane_c.e1};
const r4=sim(40,P,[{lane:'e1',z:L.lane_c.e1,dir:1,x:-40}]);
check('4. 玩家站在往東外側車道 x=-20：車停在玩家前 4 m 以外（x ≤ -24）',r4.cars[0].x<=-24+0.05&&r4.cars[0].x>-30,J(r4.cars[0]));
const P2={x:-20,z:L.lane_c.e1,move:(t,p)=>{ if(t>T.T0+20) p.z=L.walk_n.z0+0.5; }};
const r5=sim(40,P2,[{lane:'e1',z:L.lane_c.e1,dir:1,x:-40}]);
check('4. 玩家走回人行道：車再開走（越過玩家原本站的地方）',r5.cars[0].x>-18||r5.cars[0].x<-40,J(r5.cars[0]));
const P3={x:-20,z:L.lane_c.w2};
const r6=sim(6,P3,[{lane:'e1',z:L.lane_c.e1,dir:1,x:-40}]);
check('4. 玩家在別條車道（往西內側）：往東外側的車照開',r6.cars[0].x>-40+25,J(r6.cars[0]));
const c9={x:43.95,z:L.lane_c.e1,dir:1,v:8,vmax:8,lane:'e1'}; T.step(c9,0.1,{}); const c10={x:-43.95,z:L.lane_c.w1,dir:-1,v:8,vmax:8,lane:'w1'}; T.step(c10,0.1,{});
check('4. 開出邊界從另一頭回來（往東 → −44、往西 → +44）；±42.5 以外不畫',c9.x===-44&&c10.x===44&&T.SHOW===42.5,J([c9.x,c10.x]));
/* 5 */
const us3d=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8'), st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
check('5. us3d.js 三處跳過歸車流的車（導航、備用方塊、正式模型）',(us3d.match(/if\(OWN\((c|car)\)\) continue;/g)||[]).length===3&&/const OWN=c=>typeof US_TRAFFIC!=='undefined'&&US_TRAFFIC\.owns/.test(us3d));
check('5. story3d.js 進超市街：生成路人（美國版外型）＋US_TRAFFIC.start；index.html 在 us3d.js 後面載入',/zoneId==='us_market_street'&&typeof US_MARKET_STREET_LAYOUT/.test(st)&&/extraSpecUS\(xi\+\+\)/.test(st)&&/US_TRAFFIC\.start\(GM\)/.test(st)&&html.indexOf('src/us_traffic3d.js')>html.indexOf('src/us3d.js')&&html.indexOf('src/us_traffic3d.js')>0);
/* 6 */
{ const m=st.match(/S\.usStreetRoutes=function\(L\)\{[\s\S]*?\n    return [\s\S]*?; \};/), mx=st.match(/function extraSpec\(i\)\{[^\n]*\n/), mu=st.match(/function extraSpecUS\(i\)\{[^\n]*\n/);
  let routes=null, specs=null; try{ const S={}; vm.runInThisContext('(function(S){ '+mx[0]+mu[0]+m[0]+' globalThis.__R=S.usStreetRoutes; globalThis.__U=extraSpecUS; })')(S); routes=globalThis.__R(L); specs=[0,1,2,3,4,5,6].map(i=>globalThis.__U(i)); }catch(e){ routes=null; console.log('  （抽不出 S.usStreetRoutes：'+e.message+'）'); }
  const inBlock=(x,z)=>L.blocks.some(b=>x>b.x0-0.3&&x<b.x1+0.3&&z>b.z0-0.3&&z<b.z1+0.3), onRoad=z=>z>L.road.z0-0.3&&z<L.road.z1+0.3; const bad=[];
  for(const r of (routes||[])) for(let i=0;i<r.length;i++){ const a=r[i], b=r[(i+1)%r.length]; for(let k=0;k<=20;k++){ const x=a[0]+(b[0]-a[0])*k/20, z=a[1]+(b[1]-a[1])*k/20; if(inBlock(x,z)||onRoad(z)) { bad.push([+x.toFixed(1),+z.toFixed(1)]); break; } } }
  check('6. 路人路線 5 條（北側人行道兩條、超市門口、南側人行道、亞洲超市門口）：不碰障礙物、不進馬路',!!routes&&routes.length===5&&!bad.length,J({n:routes&&routes.length,bad:bad.slice(0,5)}));
  check('6. 美國版路人：7 個人膚色 7 種、髮色至少 5 種',!!specs&&new Set(specs.map(s=>s.skin)).size===7&&new Set(specs.map(s=>s.hair.color)).size>=5,J(specs&&specs.map(s=>[s.skin,s.hair.color]))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
