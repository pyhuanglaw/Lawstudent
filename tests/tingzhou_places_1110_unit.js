// 汀州路的地名、快速前往、地圖標記（TINGZHOU-SHOPS-MOVE-1110；使用者 2026-11-10 X321「同步更新地圖標記、店鋪位置、場景入口」、X319 快速前往列出每一家店）——不需要瀏覽器。
//   1  PLACES.names 有汀州路；快速前往有「汀州路」＋使用者指定名字的八間店（名字照配置 src/data/tingzhou_layout.js、一字不差），都在 tingzhou 這一區、沒有重複
//   2  在 Node 裡建出真正的汀州路：每個落點站得住；店的落點在那一間店門互動點的範圍裡、面對店面；從「汀州路」（巷子口）用引擎的移動走得到每一間、每一間走得到「往公館」
//   3  手機「地點」、大地圖：汀州路自己一區（公館後面）、九個地點都在那顆圖釘；人在汀州路＝那一區；圖釘和其他圖釘至少相隔 52
//   4  一開始就知道（known0）；tz_ 開頭的區域（以後的室內）算汀州路；路程：汀州路裡照距離（站在店門口＝0＝你在這裡）、從宿舍經公館算得出來；導航 公館 ⇄ 汀州路
//   5  大地圖的地名（PLACES.landmarks.tingzhou）：八間店都有、位置在店面那一側
//   6  舊存檔：站在公館店面街 G09～G11 門口（三間店原本的位置；店門前 z 21、人行道 z 18）照舊站得住；「往汀州路」是要按的互動點（不會一讀檔就被帶走）
//   7  原本的地點沒有少（公館、溫州街、新生南路的每一筆都在、彼此的順序不變）
// 修改前（b99dfd4dd）：1 FAIL（沒有汀州路）、3、4、5 FAIL。用法：node tests/tingzhou_places_1110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/data/lin_layout.js','src/zones3d.js',
  'src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/calendar.js','src/data/places.js','src/placemap3d.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const USER=['泰米村食','洗樂洗衣坊','印得好','越好吃小館','客居雲南','東南大聯商行','汀州聯通','溫特寶邸'];
const L=TINGZHOU_LAYOUT, Q=PLACES.quickList(), TZ=Q.filter(p=>p[0]==='tingzhou');
// 1
check('1. PLACES.names.tingzhou＝汀州路（和區域的名字一樣）',PLACES.names.tingzhou==='汀州路'&&Z3.ZONES.tingzhou.name==='汀州路',PLACES.names.tingzhou);
check('1. 快速前往：汀州那一區第一筆是「汀州路」、落點＝從公館的巷子進來站的地方',!!TZ[0]&&TZ[0][1]==='汀州路'&&TZ[0][2].x===L.fromGongguan.x&&TZ[0][2].z===L.fromGongguan.z,J(TZ[0]));
const miss=USER.filter(n=>!TZ.some(p=>p[1]===n));
check('1. 快速前往有使用者指定名字的八間店（一字不差）',!miss.length&&TZ.length===9,'沒有：'+J(miss)+'；共 '+TZ.length+' 筆');
check('1. 八間的名字都是配置裡的店名（不另外寫一份）',TZ.slice(1).every(p=>L.shops.some(q=>q.name===p[1]))&&PLACES.TZ_SHOPS.length===8&&PLACES.TZ_SHOPS.every(id=>L.shops.some(q=>q.id===id)));
{ const ql=Q.map(p=>p[0]+'|'+p[1]); check('1. 快速前往沒有重複的地點（zone|名字，手機的 data-place）',new Set(ql).size===ql.length); }
// 2
const z=loadZone('tingzhou'), its=E.interactables.slice();
const sp0=TZ[0]&&TZ[0][2], gg=its.find(i=>i.exit&&i.exit.to==='gongguan');
const walk=(a,b)=>{ const r=E.simWalk(a.x,a.z,b.x,b.z,{lv0:0,lv1:0,dt:0.1,speed:4.1}); return r&&r.ok?'':(r?r.reason:'沒有結果'); };
const near=(i)=>{ const R=(i.radius||1.5)-0.05; for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=i.x+Math.cos(a/24*Math.PI*2)*rr, tz=i.z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return {x:tx,z:tz}; } return null; };
check('2. 「汀州路」的落點站得住',!!sp0&&E.canStand(sp0.x,sp0.z,0.32,0),J(sp0));
for(const p of TZ.slice(1)){ const s=p[2], q=L.shops.find(x=>x.name===p[1]), it=q&&its.find(i=>i.tzShop===q.id); const ok=!!s&&E.canStand(s.x,s.z,0.32,0);
  check('2. '+p[1]+'：落點 ('+s.x+','+s.z+') 站得住',ok); if(!ok||!it) { if(!it) check('2. '+p[1]+'：找得到店門互動點',false); continue; }
  const d=Math.hypot(it.x-s.x,it.z-s.z), sx=q.side==='W'?-1:1, fx=Math.sin(s.yaw);   /* yaw 0＝面向 +z；面向店面＝西側的店朝 −x */
  check('2. '+p[1]+'：落在店門互動點的範圍裡（'+d.toFixed(2)+' m ＜ '+it.radius+'）、面對店面（'+(sx<0?'西':'東')+'）、是那一間的正前方（z '+q.z0+'～'+q.z1+'）',d<it.radius-0.1&&fx*sx>0.9&&s.z>q.z0&&s.z<q.z1);
  const w1=walk(sp0,s), ex=gg&&near(gg), w2=ex?walk(s,ex):'往公館站不住';
  check('2. '+p[1]+'：從巷子口走得到、從店門口走得到「往公館」',!w1&&!w2,[w1,w2].filter(Boolean).join('、')); }
// 3
check('3. 手機「地點」：九筆都在汀州路那一區；地區的順序公館後面就是汀州路',TZ.every(p=>PLACEMAP.areaOf(p)==='tingzhou')&&PLACEMAP.GROUPS.indexOf('tingzhou')===PLACEMAP.GROUPS.indexOf('gongguan')+1,J(TZ.map(p=>PLACEMAP.areaOf(p))));
check('3. 地區的名字＝汀州路；人在汀州路（或以後 tz_ 的店裡）＝那一區',PLACEMAP.areaName('tingzhou')==='汀州路'&&PLACEMAP.hereArea({zone:'tingzhou'})==='tingzhou'&&PLACEMAP.hereArea({zone:'tz_taimi'})==='tingzhou'&&PLACEMAP.hereArea({zone:'gongguan'})==='gongguan');
{ const pin=PLACEMAP.PINS.find(p=>p.id==='tingzhou'), ds=pin?PLACEMAP.PINS.filter(p=>p!==pin).map(p=>Math.hypot(p.x-pin.x,p.y-pin.y)):[0], VB=PLACEMAP.VB;
  check('3. 大地圖有汀州路的圖釘：在圖裡、和其他圖釘至少相隔 52、九個地點都在這一顆',!!pin&&Math.min(...ds)>=52&&pin.x>10&&pin.x<VB[2]-10&&pin.y>10&&pin.y<VB[3]-10&&TZ.every(p=>PLACEMAP.pinOf(p)===pin)&&pin.m.length===TZ.length+1,   /* ＋1＝禮貌生財（區域 tz_limao，SHOP-STANDARD-BACKFILL-1112）*/ pin?Math.min(...ds).toFixed(1):'沒有');
  const st=()=>({known:true,open:true,here:false,mins:5,bike:false}), hx=PLACEMAP.listHTML(Q,st,'tingzhou',null,()=>'');
  check('3. 展開汀州路：每一間一列（data-place＝tingzhou|店名）',USER.concat(['汀州路']).every(n=>hx.includes('data-place="tingzhou|'+n+'"')),''); }
// 4
check('4. 一開始就知道汀州路；tz_ 開頭的區域算汀州路',PLACES.known0.tingzhou===1&&PLACES.base('tz_taimi')==='tingzhou'&&PLACES.base('tingzhou')==='tingzhou');
{ const G={day:3,hour:10,zone:'tingzhou'}, far=TZ.find(p=>p[1]==='越好吃小館')[2], T=(a,b)=>CLS.travelMinutes(G,'tingzhou','tingzhou',a,b);
  const a=T(sp0,far), b=T({x:far.x+0.5,z:far.z+1},far), c=CLS.travelMinutes(G,'dorm','tingzhou',null,sp0), d=CLS.travelMinutes(G,'gongguan','tingzhou',null,sp0);
  check('4. 路程：巷子口到越好吃小館要幾分鐘、站在店門口＝0（你在這裡）；從宿舍 5～40 分鐘、從公館比從宿舍近',a>=5&&b===0&&c>=5&&c<=40&&d>=5&&d<=c,J([a,b,c,d])); }
{ const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
  check('4. game3d.js placeState：汀州路好幾個落點照距離算「你在這裡」',/z!=='wenzhou'&&z!=='tingzhou'\)\|\|mins===0/.test(g3));
  check('4. 導航 LINKS：公館 ⇄ 汀州路；公館真的有「往汀州路」的出口',/gongguan:\[[^\]]*'tingzhou'/.test(gd)&&/tingzhou:\['gongguan'\]/.test(gd)); }
// 5
{ const LM=PLACES.landmarks.tingzhou||[], F=L.facade, bad=USER.filter(n=>{ const m=LM.find(q=>q[0]===n), q=L.shops.find(s=>s.name===n); return !m||!q||(q.side==='W'?m[1]>=F.west:m[1]<=F.east)||m[2]<q.z0||m[2]>q.z1; });
  check('5. 大地圖的地名：八間店都有、寫在店面那一側、那一間的範圍裡',!bad.length&&LM.length>=8,J(bad)); }
// 6
{ loadZone('gongguan'); const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), m=zs.match(/const shops=\[([\s\S]*?)\];\n/);
  const ws=[...(m?m[1]:'').matchAll(/\{n:'([^']*)',c:'[^']+'(?:,sc:'[^']+')?,w:(\d+)/g)].map(x=>[x[1],+x[2]]);   /* 2026-11-11：G09、G10 拉下鐵門以後沒有店名（n:''，X335）——店名可以是空的，棟數和寬度照舊 */ let x=-68; const cx=ws.map((s,i)=>{ const X0=x, X1=x+s[1]+(i<8&&i!==ws.length-1?1.2:0); x=X1; return (X0+X1)/2; });
  const pts=[]; for(const i of [9,10,11]) for(const zz of [21,18]) pts.push([+cx[i].toFixed(2),zz]); const bad=pts.filter(p=>!E.canStand(p[0],p[1],0.32,0));
  check('6. 舊存檔：公館店面街 G09～G11 門口（店門前 z 21、人行道 z 18）照舊站得住',ws.length===15&&!bad.length,J(bad.length?bad:pts));
  const it=E.interactables.find(i=>i.exit&&i.exit.to==='tingzhou'), sp=L.toGongguan.spawn;
  check('6. 「往汀州路」是要按的互動點（有按鈕字、沒有自動觸發）；G10 巷口前的人行道站得住',!!it&&!!it.label&&!it.auto&&!it.onEnter&&E.canStand(sp.x,sp.z,0.32,0)&&Math.abs(cx[10]-it.x)<5,it?J([it.x,it.z,it.label,+cx[10].toFixed(2)]):'沒有'); }
// 7
{ const idx=n=>Q.findIndex(p=>p[1]===n), order=['公館商圈','捷運公館站','公館燒臘','日和便利店','頁間書屋','汀州路','溫州街','118 巷','2:30 AM','木曜日','日常失速','一盞','新生南路','宿舍'], ix=order.map(idx);
  check('7. 原本的地點都在、順序不變（汀州路接在公館的店後面、溫州街前面）',ix.every((v,k)=>v>=0&&(k===0||v>ix[k-1])),J(ix)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
