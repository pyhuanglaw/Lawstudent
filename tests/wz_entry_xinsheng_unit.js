/* WZ-ENTRY-XINSHENG-1103（使用者 X199，11-03 選擇題定案）：溫州街只從新生南路進出——
   「溫州街主要入口應該是新生南路側門 溫州街就在新生南路後面」「舊存檔不要管了」、公館往溫州街的巷口「拿掉」、溫州街的「回公館」換成回新生南路。
   檢查（不需要瀏覽器）：
     1～3 公館：沒有「往溫州街」互動點；巷口 x −74～−68、z 19～22 走不進去，而且看得到擋住的東西（盆栽，不是隱形牆，D36）；騎樓、校門、麵店照舊走得到
     4～6 溫州街：沒有「回公館」出口；有「往新生南路」出口；從 Café 門口、快速前往的落點、東端舊「回公館」那一帶（舊存檔站的地方）都走得到「往新生南路」
     7～8 新生南路有「往溫州街」、校園有「往新生南路（側門）」
     9 導覽（GUIDE.nextZone，用每一區真正的出口）：公館 → 校園 → 新生南路 → 溫州街 → 2:30 AM；溫州街回公館＝新生南路 → 校園 → 公館
     10 大地圖的地名：公館沒有「往溫州街」、溫州街的「往新生南路」和出口同一點
     11～12 路線（CLS.routeVia）：公館 → 2:30 AM 經校園、新生南路、溫州街；路程（travelMinutes，直線估算）公館 → Café 至少 20 分鐘（原本經巷口 10 分鐘）
     13 舊存檔站在公館巷口（現在擋住的那一塊）：引擎 unstick 找到的最近站得住的格子走得到校門
     14 第二天和以安一起去 Café：霖澤館 → 新生南路側門的路上接得到「報告」那段話
   修改前（開發分支 01fd4420c，2026-11-10 實際跑過）：1、2、4、9、10、11、12、14 FAIL（FAILED 8）。用法：node tests/wz_entry_xinsheng_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const stubEl=()=>({width:1,height:1,getContext:()=>ctx2d,style:{},addEventListener(){},classList:{add(){},remove(){},toggle(){}}});
global.document={ createElementNS:()=>stubEl(), createElement:()=>stubEl(), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航與互動點
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js',
  'src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/places.js','src/guide3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const build=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES[id].build(E); return {z,nav:z.nav,its:E.interactables.slice()}; };
const tools=nav=>{ const cellOf=(x,zz)=>[Math.floor((x-nav.ox)/nav.cell),Math.floor((zz-nav.oz)/nav.cell)];
  const free=(x,zz)=>{ const [c,r]=cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[nav.idx(c,r)]; };
  const reach=(a,b)=>{ const [sx,sz]=cellOf(...a), [tx,tz]=cellOf(...b); if(sx<0||sz<0||sx>=nav.cols||sz>=nav.rows||nav.b[nav.idx(sx,sz)]) return false; const seen=new Uint8Array(nav.cols*nav.rows), q=[[sx,sz]]; seen[nav.idx(sx,sz)]=1;
    while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=nav.cols||ny>=nav.rows) continue; const i=nav.idx(nx,ny); if(seen[i]||nav.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; };
  const nearestFree=(x,zz)=>{ for(let r=0;r<=8;r+=0.25) for(let a=0;a<16;a++){ const px=x+Math.cos(a*Math.PI/8)*r, pz=zz+Math.sin(a*Math.PI/8)*r; if(free(px,pz)) return [px,pz]; } return null; };
  return {free,reach,nearestFree}; };

/* ---------- 公館 ---------- */
const GG=build('gongguan'), gT=tools(GG.nav), FZ=19;
const ggWz=GG.its.filter(q=>q.exit&&q.exit.to==='wenzhou'||/往溫州街/.test(q.label||''));
check('1. 公館沒有「往溫州街」互動點（巷口拿掉）',ggWz.length===0,ggWz.map(q=>q.label+'@'+q.x+','+q.z).join(' ')||'0 個');
let laneFree=0; for(let x=-73.75;x<=-68.25;x+=0.5) for(let zz=FZ+0.25;zz<=FZ+2.75;zz+=0.5) if(gT.free(x,zz)) laneFree++;
const pots=GG.z.group.getObjectByName('gg_lane_closed_pots');
check('2. 公館巷口（x −74～−68、z 19～22）一格都走不進去，擋住的地方有盆栽（看得到，D36 不是隱形牆）',laneFree===0&&!!pots&&Math.abs(pots.position.z-(FZ+1.15))<0.01,'走得進去 '+laneFree+' 格；盆栽 '+(pots?'有（長 '+pots.userData.len.toFixed(1)+' m）':'沒有'));
const ggGate=GG.its.find(q=>q.exit&&q.exit.to==='campus'), ggSp=[-2.5,-29];
const arcBad=[]; for(let x=-67;x<=-60;x+=0.25) if(![[-0.3,-0.3],[0.3,-0.3],[-0.3,0.3],[0.3,0.3],[0,0]].every(([dx,dz])=>gT.free(x+dx,20.5+dz))) arcBad.push(x);   /* gongguan_layout_nav.py「騎樓整排連續（x −67 → 77、z 20.5）」：巷口擋的那一塊不能吃到騎樓西端 */
check('3. 公館照舊：商圈落點走得到校門（回校園）、麵店門口的騎樓（x −63）、巷口東邊的騎樓（x −66.5, z 20.5）；騎樓西端 x −67～−60 人站得住（半徑 0.3）',!!ggGate&&gT.reach(ggSp,[ggGate.x,ggGate.z])&&gT.reach(ggSp,[-63,21])&&gT.reach(ggSp,[-66.5,20.5])&&!arcBad.length,arcBad.length?'站不住 '+arcBad.join(','):'');

/* ---------- 溫州街 ---------- */
const WZ=build('wenzhou'), wT=tools(WZ.nav);
const wzGg=WZ.its.filter(q=>q.exit&&q.exit.to==='gongguan'&&/公館/.test(q.label||''));
check('4. 溫州街沒有「回公館」出口',wzGg.length===0,wzGg.map(q=>q.label+'@'+q.x+','+q.z).join(' ')||'0 個');
const wzXs=WZ.its.find(q=>q.exit&&q.exit.to==='xinsheng');
check('5. 溫州街有「往新生南路」出口（西側橫巷北口），出去落在新生南路的溫州街巷口',!!wzXs&&wzXs.label==='往新生南路'&&Math.abs(wzXs.exit.spawn.x-(XINSHENG_LAYOUT.wenzhouLane.exit.x+2.8))<0.01,wzXs?wzXs.label+'@'+wzXs.x+','+wzXs.z:'沒有');
const wzFrom=[['Café 門口',51.7,0],['快速前往「溫州街」的落點',20,0],['東端（舊「回公館」(51.3, −13.4)，舊存檔可能站在這裡）',51.3,-13.4],['公館來的舊落點 (51.3, −9.8)',51.3,-9.8]];
const wzBad=wzFrom.filter(([n,x,zz])=>{ const p=wT.free(x,zz)?[x,zz]:wT.nearestFree(x,zz); return !p||!wzXs||!wT.reach(p,[wzXs.x,wzXs.z]); }).map(q=>q[0]);
check('6. 溫州街各處都走得到「往新生南路」（舊存檔讀檔站在哪裡都出得去）',!wzBad.length,wzBad.join('、')||wzFrom.length+' 處');

/* ---------- 新生南路、校園 ---------- */
const XS=build('xinsheng');
const xsWz=XS.its.find(q=>q.exit&&q.exit.to==='wenzhou');
check('7. 新生南路有「往溫州街」入口',!!xsWz&&/溫州街/.test(xsWz.label),xsWz?xsWz.label:'沒有');
const CA=build('campus');
const caXs=CA.its.find(q=>q.exit&&q.exit.to==='xinsheng'), caWz=CA.its.filter(q=>q.exit&&q.exit.to==='wenzhou');
check('8. 校園有「往新生南路（側門）」出口、沒有直接往溫州街的出口',!!caXs&&caWz.length===0,caXs?caXs.label:'沒有');

/* ---------- 導覽（GUIDE.nextZone：第一步用當下區域真正的出口）---------- */
const EXITS={gongguan:GG.its,wenzhou:WZ.its,xinsheng:XS.its,campus:CA.its};
global.document.getElementById=()=>stubEl(); const gE={interactables:[]}; GUIDE.init({E:gE,G:{},S:{}});
const chain=(from,to)=>{ const out=[from]; let z=from; for(let n=0;n<8&&z!==to;n++){ gE.interactables=EXITS[z]||[{exit:{to:'?'}}]; const nz=GUIDE.nextZone(z,to); if(!nz) { out.push('（找不到）'); break; } out.push(nz); z=nz; if(!EXITS[z]&&z!==to){ out.push('（'+z+' 沒有建）'); break; } } return out; };
const c1=chain('gongguan','cafe'), c2=chain('wenzhou','gongguan');
check('9. 導覽：公館 → 2:30 AM 走 校園 → 新生南路 → 溫州街；溫州街 → 公館 走 新生南路 → 校園',JSON.stringify(c1)===JSON.stringify(['gongguan','campus','xinsheng','wenzhou','cafe'])&&JSON.stringify(c2)===JSON.stringify(['wenzhou','xinsheng','campus','gongguan']),c1.join('→')+'；'+c2.join('→'));

/* ---------- 大地圖的地名 ---------- */
const lmG=PLACES.landmarks.gongguan, lmW=PLACES.landmarks.wenzhou, lmX=lmW.find(q=>q[0]==='往新生南路');
check('10. 大地圖：公館沒有「往溫州街」、溫州街沒有「往公館」、溫州街的「往新生南路」在出口那一點',!lmG.some(q=>/溫州街/.test(q[0]))&&!lmW.some(q=>/公館/.test(q[0]))&&!!lmX&&!!wzXs&&Math.hypot(lmX[1]-wzXs.x,lmX[2]-wzXs.z)<0.5,JSON.stringify(lmW));

/* ---------- 路線、路程（classes3d.js；另一個 vm context，照 dl04b_class_stops_unit 的載入方式）---------- */
{ const ctx={console,setTimeout,clearTimeout,setInterval,clearInterval,Promise,Math,JSON,Date}; ctx.window=ctx; ctx.self=ctx; ctx.globalThis=ctx; ctx.P3={CAST:{}};
  ctx.document={getElementById:()=>null,addEventListener(){}}; ctx.navigator={userAgent:'node'}; ctx.addEventListener=()=>{}; ctx.location={search:''};
  ctx.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }}; vm.createContext(ctx);
  for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']){
    if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInContext(src,ctx,{filename:f}); }
  const CLS=ctx.CLS, r1=CLS.routeVia('gongguan','cafe'), r2=CLS.routeVia('cafe','gongguan');
  check('11. 路線：公館 → 2:30 AM 經 校園、新生南路、溫州街；2:30 AM → 公館 經 溫州街、新生南路、校園',JSON.stringify(r1)===JSON.stringify(['campus','xinsheng','wenzhou'])&&JSON.stringify(r2)===JSON.stringify(['wenzhou','xinsheng','campus']),JSON.stringify(r1)+' '+JSON.stringify(r2));
  const G={day:1,hour:12}, mGC=CLS.travelMinutes(G,'gongguan','cafe'), mCC=CLS.travelMinutes(G,'campus','cafe',{x:-38,z:6}), mLC=CLS.travelMinutes(G,'linze','cafe'), mXW=CLS.travelMinutes(G,'xinsheng','wenzhou');
  /* 14：第二天和以安一起去 Café，路上「報告」那段話（WHY_LAW_WALK，key road）在新的路線（霖澤館 → 新生南路側門）上接得到——沿 A* 路線每 0.5 m 取一點，有一點落在某個 road 觸發點的半徑裡 */
  { const cks=(ctx.STORY&&ctx.STORY._day2&&ctx.STORY._day2.walkChecks('cafe'))||[], roads=cks.filter(c=>c.k==='road');
    const pth=CA.nav.path(34,-97.6,caXs?caXs.x:-101.4,caXs?caXs.z:-139.4)||[]; let hit=null, prev=[34,-97.6];
    for(const q of pth){ const L=Math.hypot(q[0]-prev[0],q[1]-prev[1]); for(let t=0;t<=L&&!hit;t+=0.5){ const x=prev[0]+(q[0]-prev[0])*t/(L||1), zz=prev[1]+(q[1]-prev[1])*t/(L||1); const c=roads.find(c=>Math.hypot(x-c.x,zz-c.z)<c.r); if(c) hit=[c.x,c.z]; } prev=q; }
    check('14. 第二天一起去 Café：霖澤館 → 新生南路側門的路上接得到「報告」那段話（walkChecks road）',!!hit&&pth.length>0,hit?'觸發點 '+hit.join(','):'路線 '+pth.length+' 點都沒經過 '+JSON.stringify(roads.map(c=>[c.x,c.z]))); }
  check('12. 路程：公館 → Café 至少 20 分鐘、不比校園（椰影大道）→ Café 近（要繞回校園走側門；原本經巷口 10 分鐘）；霖澤館 → Café 約 20 分鐘；新生南路 → 溫州街比公館 → 溫州街近',mGC>=20&&mGC>=mCC&&mLC>=15&&mLC<=25&&mXW<CLS.travelMinutes(G,'gongguan','wenzhou'),'公館→Café '+mGC+'、校園→Café '+mCC+'、霖澤館→Café '+mLC+'、新生南路→溫州街 '+mXW+' 分鐘'); }

/* ---------- 舊存檔站在公館巷口 ---------- */
{ const p=gT.nearestFree(-71,20.5);
  check('13. 舊存檔站在公館巷口 (−71, 20.5)：最近站得住的格子走得到校門；巷口前面的人行道 (−71, 17.6) 站得住、走得到（gongguan_layout_nav.py 讀檔的位置）',!!p&&!!ggGate&&gT.reach(p,[ggGate.x,ggGate.z])&&gT.free(-71,17.6)&&gT.reach(ggSp,[-71,17.6]),p?p.map(v=>v.toFixed(2)).join(','):'找不到'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
