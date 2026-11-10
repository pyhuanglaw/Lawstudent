/* 汀州路商圈（TINGZHOU-AREA-1110，X321／X322；LAWWW2 帳號 A 11-10 第 1 版）——不需要瀏覽器（D131）。區域建得起來、走得到、店名對。
   1 區域有登記；從公館進來的出生點站得住；「往公館」的互動點在出生點旁邊、走得到，回到公館店面街 G10 前面
   2 使用者指定的店都在、名字一字不差：泰米村食、洗樂洗衣坊、印得好（X321）；越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸（X322）；五間在同一側、照概念圖的順序連在一起
   3 每一間店門口有互動點（沒有室內的是「看」），從出生點都走得到；店面不重疊、同一側中間沒有空隙（巷口除外）
   4 汀州路是走得到的路（不是封閉的夜市）：路面兩個方向都走得到頭；兩側騎樓走得到；店面玻璃後面、樓房裡面站不住
   5 騎樓的柱子擋住；巷 A 兩側（樓房）站不住
   6 公館那一邊：店面街多一個「往汀州路」的互動點（包住 gongguan 的 build），進來站在巷 A 東端
   7 配置和正式模型一致：tingzhou_street.glb 的樓房數＝配置的店數＋巷 A 的三棟；五間的店面貼圖集在
   修改前（開發分支沒有這個區域）：0 就 FAIL。用法：node tests/tingzhou_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const need=['src/data/tingzhou_layout.js','src/tingzhou3d.js'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 汀州路的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const L=TINGZHOU_LAYOUT, F=L.facade;
check('0. Z3.ZONES.tingzhou 有登記；index.html 載入配置和區域',!!(Z3.ZONES&&Z3.ZONES.tingzhou)&&/src\/data\/tingzhou_layout\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'))&&/src\/tingzhou3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
const mk=()=>{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; return E; };
const E=mk(); const z=Z3.ZONES.tingzhou.build(E); const nav=z.nav;
const cellOf=(x,zz)=>[Math.floor((x-nav.ox)/nav.cell),Math.floor((zz-nav.oz)/nav.cell)];
const freeAt=(x,zz)=>{ const [c,r]=cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[nav.idx(c,r)]; };
function reach(a,b){ const [sx,sz]=cellOf(...a), [tx,tz]=cellOf(...b); const seen=new Uint8Array(nav.cols*nav.rows), q=[[sx,sz]]; if(!freeAt(...a)) return false; seen[nav.idx(sx,sz)]=1;
  while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=nav.cols||ny>=nav.rows) continue; const i=nav.idx(nx,ny); if(seen[i]||nav.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
const sp=[z.spawn.x,z.spawn.z];
const gg=E.interactables.find(q=>q.exit&&q.exit.to==='gongguan');
check('1. 從公館進來的出生點站得住（巷 A 東端）',freeAt(...sp)&&sp[0]>F.east+10,sp.join(','));
check('1. 「往公館」在出生點旁邊（≤ 3 m）、走得到；回到公館店面街前面（z 18）',!!gg&&Math.hypot(gg.x-sp[0],gg.z-sp[1])<=3&&reach(sp,[gg.x,gg.z])&&gg.exit.spawn.z===18&&Math.hypot(gg.x-sp[0],gg.z-sp[1])>gg.radius-1.0,gg?JSON.stringify(gg.exit.spawn):'沒有');
const names=L.shops.map(q=>q.name);
const USER=['泰米村食','洗樂洗衣坊','印得好','越好吃小館','客居雲南','東南大聯商行','汀州聯通','溫特寶邸'];
check('2. 使用者指定的八間店名一字不差',USER.every(n=>names.includes(n)),USER.filter(n=>!names.includes(n)).join(' '));
{ const five=['越好吃小館','客居雲南','東南大聯商行','汀州聯通','溫特寶邸'].map(n=>L.shops.find(q=>q.name===n)); const ok=five.every(Boolean)&&new Set(five.map(q=>q.side)).size===1;
  let adj=ok; if(ok) for(let i=0;i+1<five.length;i++) if(Math.abs(five[i].z0-five[i+1].z1)>1e-6) adj=false;   /* 概念圖從對面看左→右＝西側由南往北：越好吃的北端接客居雲南的南端… */
  check('2. 五間在同一側、照概念圖的順序（越好吃 → 客居雲南 → 東南大聯 → 汀州聯通 → 溫特寶邸）連在一起',ok&&adj,five.map(q=>q&&[q.side,q.z0,q.z1].join('/')).join(' ')); }
{ const no=L.shops.filter(q=>!E.interactables.some(it=>it.tzShop===q.id&&(it.look||it.exit))).map(q=>q.id);
  const far=L.shops.filter(q=>{ const it=E.interactables.find(i=>i.tzShop===q.id); return !it||!reach(sp,[it.x,it.z])||!freeAt(it.x,it.z); }).map(q=>q.id);
  check('3. 每一間店門口有互動點，站得住、從出生點走得到',!no.length&&!far.length,(no.concat(far)).join(' ')||(L.shops.length+' 間'));
  const bad=[]; for(const side of ['W','E']){ const A=L.shops.filter(q=>q.side===side).sort((a,b)=>a.z0-b.z0); for(let i=0;i+1<A.length;i++){ const gap=A[i+1].z0-A[i].z1; if(Math.abs(gap)>1e-6&&!L.alleys.some(a=>a.side===side&&Math.abs(a.z0-A[i].z1)<1e-6&&Math.abs(a.z1-A[i+1].z0)<1e-6)) bad.push(A[i].id+'→'+A[i+1].id+' '+gap); } }
  check('3. 店面不重疊、同一側沒有空隙（巷口除外）；寬度至少三種',!bad.length&&new Set(L.shops.map(q=>Math.round((q.z1-q.z0)*2))).size>=3&&new Set(L.shops.map(q=>q.floors)).size>=3,bad.join('；')); }
check('4. 汀州路走得到頭（南北兩端）、過得了馬路（不是封閉的）',reach(sp,[0,L.walk.z0+1.5])&&reach(sp,[0,L.walk.z1-1.5])&&reach(sp,[F.west-1.5,10])&&reach(sp,[F.east+1.5,-20]));
check('4. 店面玻璃後面、樓房裡面站不住',!freeAt(F.west-F.arcade-0.5,10)&&!freeAt(F.east+F.arcade+0.5,-20)&&!freeAt(F.east+8,20)&&!freeAt(F.west-8,-10));
{ const P=TZ3.pillars(L), open=P.filter(p=>freeAt(p.x,p.z)).map(p=>p.id);
  check('5. 騎樓的柱子都擋住；巷 A 兩側的樓房站不住、巷子中間站得住',!open.length&&!freeAt(F.east+12,L.alleys[0].z0-2)&&!freeAt(F.east+12,L.alleys[0].z1+2)&&freeAt(F.east+12,0),open.join(' ')); }
{ const E2=mk(); let it=null; try{ Z3.ZONES.gongguan.build(E2); it=E2.interactables.find(q=>q.exit&&q.exit.to==='tingzhou'); }catch(e){ console.log('   公館建不起來：'+String(e.message).slice(0,120)); }
  check('6. 公館店面街有「往汀州路」的互動點，進來站在巷 A 東端',!!it&&it.exit.spawn.x===L.fromGongguan.x&&it.exit.spawn.z===L.fromGongguan.z&&Math.abs(it.x-L.toGongguan.spawn.x)<0.01,it?JSON.stringify([it.x,it.z,it.label]):'沒有'); }
{ const p=path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.json'); let J=null; try{ J=JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){}
  const glb=path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.glb'); let imgs=[]; try{ const d=fs.readFileSync(glb), jl=d.readUInt32LE(12); imgs=(JSON.parse(d.slice(20,20+jl).toString('utf8')).images||[]).map(i=>i.name); }catch(e){}
  check('7. 正式模型：樓房數＝店數＋巷 A 三棟；有五間的店面貼圖集（tz_fronts_atlas）',!!J&&J.buildings.length===L.shops.length+3&&L.shops.every(q=>J.buildings.includes('T'+q.id))&&imgs.includes('tz_fronts_atlas'),J?J.buildings.length+' 棟':'沒有 json'); }
/* 第 2 版（使用者 11-10「混合」）：五間照概念圖沒有騎樓、直接臨人行道；其他老公寓保留騎樓 */
{ const FIVE=['yuehaochi','keju','dongnan','liantong','wente'], P=TZ3.pillars(L), na=L.shops.filter(q=>q.arcade===false).map(q=>q.id).sort();
  check('8. 沒有騎樓的正好是使用者指定的五間；其他店都有騎樓柱',na.join()===FIVE.slice().sort().join()&&!P.some(p=>FIVE.includes(p.id))&&L.shops.filter(q=>q.arcade!==false).every(q=>P.some(p=>p.id===q.id)),na.join(' '));
  const blocked=[]; for(const id of FIVE){ const q=L.shops.find(s=>s.id===id); if(!q) continue; for(let z=q.z0+0.75;z<q.z1-0.5;z+=0.5)   /* 兩端 0.5 m 不算：隔壁有騎樓的樓，柱子在交界上 */ for(let x=F.west-F.arcade+0.75;x<F.west;x+=0.5) if(!freeAt(x,z)) blocked.push(id+'@'+x.toFixed(1)+','+z.toFixed(1)); }
  check('8. 五間門前的人行道整片走得了（沒有柱子、沒有擋住店門）',!blocked.length,blocked.slice(0,6).join(' '));
  const p=path.join(ROOT,'assets/models/env/second_ai/tingzhou_street.json'); let J=null; try{ J=JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){}
  const NA=J&&J.noArcade||{}, bad=FIVE.filter(id=>{ const v=NA['T'+id]; return !v||Math.abs(v[0]-(F.west-F.arcade))>0.01||Math.abs(v[1]-(F.depth-F.arcade))>0.01; });
  check('8. 正式模型：五間的樓整棟退到店面線（x '+(F.west-F.arcade)+'），其他樓沒有退',!bad.length&&Object.keys(NA).length===5,bad.join(' ')||JSON.stringify(NA)); }
/* 第 2 版：夜市攤（使用者 11-10：照時間出現、營業、收攤的模組；種類不一樣；不擋固定店家的門口；不是整條封閉的夜市） */
{ const ST=L.stalls||{list:[]}, glb=path.join(ROOT,'assets/models/env/second_ai/tingzhou_stalls.glb'); let nodes=[]; try{ const d=fs.readFileSync(glb), jl=d.readUInt32LE(12); nodes=(JSON.parse(d.slice(20,20+jl).toString('utf8')).nodes||[]).map(n=>n.name); }catch(e){}
  const miss=ST.list.filter(q=>!nodes.includes('STALL_'+q.kind+'_open')||!nodes.includes('STALL_'+q.kind+'_closed')).map(q=>q.kind);
  check('9. 攤位至少十種、種類不重複；每一種在模型裡有營業、收攤兩個節點',ST.list.length>=10&&new Set(ST.list.map(q=>q.kind)).size===ST.list.length&&!miss.length,miss.join(' ')||ST.list.length+' 攤');
  check('9. 幾點擺：16:59 收著、17:00 營業、23:59 營業、00:00 收',!TZ3.stallsOpen(16.98,L)&&TZ3.stallsOpen(17,L)&&TZ3.stallsOpen(23.98,L)&&!TZ3.stallsOpen(0,L)&&!TZ3.stallsOpen(12,L));
  check('9. 攤車站的地方擋住（不會穿過攤車）；區域有每一攤的資料給 LAWWW 接看、買',ST.list.every(q=>!freeAt(q.x,q.z))&&Array.isArray(z.tzStalls)&&z.tzStalls.length===ST.list.length,ST.list.filter(q=>freeAt(q.x,q.z)).map(q=>q.id).join(' '));
  const doors=E.interactables.filter(q=>q.tzShop), near=[]; for(const d of doors) for(const q of ST.list) if(Math.hypot(d.x-q.x,d.z-q.z)<1.6) near.push(q.id+'→'+d.tzShop);
  const cut=doors.filter(d=>!freeAt(d.x,d.z)||!reach(sp,[d.x,d.z])).map(d=>d.tzShop);
  check('9. 攤位不擋店門：每一間店門口照舊站得住、走得到；攤車離店門互動點 ≥ 1.6 m',!near.length&&!cut.length,near.concat(cut).join(' '));
  const A=L.alleys[0]; let narrow=[]; for(let x=F.east+1;x<F.east+A.len-2;x+=0.5){ let n=0; for(let zz=A.z0+0.25;zz<A.z1;zz+=0.5) if(freeAt(x,zz)) n++; if(n*0.5<2.0) narrow.push(x.toFixed(1)+':'+n*0.5); }
  check('9. 巷 A 擺了攤還留至少 2 m 寬可以走（不是整條堵住）；汀州路的車道沒有攤',!narrow.length&&ST.list.every(q=>q.where==='alleyA'||Math.abs(q.x)>=3.4),narrow.slice(0,5).join(' ')); }
check('10. 路邊有機車（BB 第 1 版：街上是空的）：至少 60 台、巷 A 口和斑馬線前不停；Z3 有匯出機車模型的函式',z.tzScooters>=60&&typeof Z3.attachWzScooters==='function'&&reach(sp,[F.west-1.5,0])&&freeAt(F.east-0.8,0),String(z.tzScooters));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
