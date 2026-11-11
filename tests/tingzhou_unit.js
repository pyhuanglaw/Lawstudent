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
  check('7. 正式模型：樓房數＝店數＋巷 A 四棟（北、南、盡頭＋禮貌生財那一段 TA_LIMAO，X332）；有五間的店面貼圖集（tz_fronts_atlas）',!!J&&J.buildings.length===L.shops.length+(L.limao?4:3)&&(!L.limao||J.buildings.includes('TA_LIMAO'))&&L.shops.every(q=>J.buildings.includes('T'+q.id))&&imgs.includes('tz_fronts_atlas'),J?J.buildings.length+' 棟':'沒有 json'); }
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
  const GG=ST.gongguan||[], ALL=ST.list.concat(GG), missG=Object.keys(ST.kinds||{}).filter(k=>!nodes.includes('STALL_'+k+'_open')||!nodes.includes('STALL_'+k+'_closed'));
  check('9. 十三攤（汀州路十攤＋公館那一側三攤）、種類不重複；每一種在模型裡有營業、收攤兩個節點；舊的刈包、算命節點不在',ST.list.length===10&&GG.length===3&&new Set(ALL.map(q=>q.kind)).size===13&&!miss.length&&!missG.length&&!nodes.some(n=>/guabao|fortune/.test(n)),miss.concat(missG).join(' ')||ALL.length+' 攤');
  { const K=ST.kinds||{}, o=(k,h)=>TZ3.stallOpen(h,{kind:k},L), ten=['milk','pepper','wheelcake','ball','scallion','stinky','corn','eggcake','cane','jelly'], names=['沈三盃黑糖鮮奶','皇家高端胡椒餅','二十元紅豆餅','一個地球','當蔥蔥油餅','紹興炸豆腐','玉皇大帝','陳家古早味雞蛋糕','節節高甘蔗汁','公館阿婆甜湯'];
    check('9. 十攤的正式店名（使用者定的，不能改）和背景三攤（不取名）；刈包、算命攤拿掉',ten.every((k,i)=>K[k]&&K[k].name===names[i])&&['ring','phonecase','socks'].every(k=>K[k]&&K[k].buy===false)&&!K.guabao&&!K.fortune&&!ST.list.some(q=>q.kind==='guabao'||q.kind==='fortune'),ten.filter((k,i)=>!K[k]||K[k].name!==names[i]).join(' '));
    check('9. 各攤時間不一樣（使用者 11-10；十攤照 AA_752 的 hours）：紅豆餅 15:00 開 22:00 收、雞蛋糕 21:30 收、胡椒餅 16:59 還沒開 17:00 開 23:00 收、炸豆腐 17:30 開、玉米 18:00 開、鮮奶和地瓜球開到 24:00；甜湯夏天 14:00（summerFrom）',o('wheelcake',15)&&!o('wheelcake',14.9)&&o('wheelcake',21.9)&&!o('wheelcake',22)&&o('eggcake',21.4)&&!o('eggcake',21.5)&&!o('pepper',16.98)&&o('pepper',17)&&!o('pepper',23)&&!o('stinky',17.4)&&o('stinky',17.5)&&!o('corn',17.9)&&o('corn',18)&&o('milk',23.9)&&!o('milk',0)&&o('ball',23.9)&&K.jelly.from===17&&K.jelly.summerFrom===14&&new Set(ten.map(k=>K[k].from+'-'+K[k].to)).size>=7);
    check('9. 有沒有任何一攤開著：中午沒有、15:00 有（雞蛋糕、紅豆餅）、23:54 有、00:00 以後沒有、清晨沒有',!TZ3.stallsOpen(12,L)&&TZ3.stallsOpen(15,L)&&TZ3.stallsOpen(23.9,L)&&!TZ3.stallsOpen(0.1,L)&&!TZ3.stallsOpen(6,L));
    z.applyTimeOutdoor(15.5,null); const a15=z.tzStalls.filter(q=>q.isOpen).map(q=>q.kind).sort().join(' '); z.tzStallOff={st_eggcake:true}; z.applyTimeOutdoor(15.5,null); const offOk=!z.tzStalls.find(q=>q.id==='st_eggcake').isOpen; z.tzStallOff=null; z.applyTimeOutdoor(19,null); const a19=z.tzStalls.filter(q=>q.isOpen).length;
    check('9. 區域照每一攤切換：15:30 汀州路只有雞蛋糕開著；單獨一攤可以不擺（tzStallOff）；19:00 十攤都開',a15==='eggcake'&&offOk&&a19===10,a15+' / '+a19);
    check('9. 四種尺寸（規格）：小推車、中型、中型寬、較大型都有；甜湯最大（含兩張折疊桌）',['S','M','MW','L'].every(sz=>ten.some(k=>K[k].size===sz))&&K.jelly.block.w>=5.5&&K.wheelcake.w<K.milk.w&&K.milk.w<K.corn.w&&K.corn.w<K.jelly.w);
    check('9. 圖上的價錢：紅豆餅 20、胡椒餅 60、玉米 70、粉圓冰 50、燒仙草 55、甘蔗汁 50／65、地瓜球 50／55／60',K.wheelcake.items.every(i=>i[1]===20)&&K.pepper.items[0][1]===60&&K.corn.items[0][1]===70&&K.jelly.items[0][1]===50&&K.jelly.items[1][1]===55&&K.cane.items.map(i=>i[1]).join()==='50,65'&&K.ball.items.map(i=>i[1]).join()==='50,55,60'&&K.wheelcake.items.map(i=>i[0]).join()==='紅豆,奶油,花生'); }
  check('9. 攤車站的地方擋住（不會穿過攤車）；區域有每一攤的資料給 LAWWW 接看、買',ST.list.every(q=>!freeAt(q.x,q.z))&&Array.isArray(z.tzStalls)&&z.tzStalls.length===ST.list.length,ST.list.filter(q=>freeAt(q.x,q.z)).map(q=>q.id).join(' '));
  const doors=E.interactables.filter(q=>q.tzShop), near=[]; for(const d of doors) for(const q of ST.list) if(Math.hypot(d.x-q.x,d.z-q.z)<1.6) near.push(q.id+'→'+d.tzShop);
  const cut=doors.filter(d=>!freeAt(d.x,d.z)||!reach(sp,[d.x,d.z])).map(d=>d.tzShop);
  check('9. 攤位不擋店門：每一間店門口照舊站得住、走得到；攤車離店門互動點 ≥ 1.6 m',!near.length&&!cut.length,near.concat(cut).join(' '));
  const A=L.alleys[0]; let narrow=[]; for(let x=F.east+1;x<F.east+A.len-2;x+=0.5){ let n=0; for(let zz=A.z0+0.25;zz<A.z1;zz+=0.5) if(freeAt(x,zz)) n++; if(n*0.5<2.0) narrow.push(x.toFixed(1)+':'+n*0.5); }
  check('9. 巷 A 擺了攤還留至少 2 m 寬可以走（不是整條堵住）；汀州路的車道沒有攤',!narrow.length&&ST.list.every(q=>q.where==='alleyA'||Math.abs(q.x)>=3.4),narrow.slice(0,5).join(' '));
  { const aa=ST.list.filter(q=>q.where==='alleyA'), face=[]; for(const p of aa) for(const q of aa) if(p!==q&&Math.sign(p.z)!==Math.sign(q.z)&&Math.abs(p.x-q.x)<(TZ3.stallBlock(p,L).w+TZ3.stallBlock(q,L).w)/2) face.push(p.id+'×'+q.id);
    const ov=[], side=q=>q.where==='alleyA'?'A'+Math.sign(q.z):'R'+Math.sign(q.x), along=q=>q.where==='alleyA'?q.x:q.z; for(const p of ST.list) for(const q of ST.list) if(p.id<q.id&&side(p)===side(q)&&Math.abs(along(p)-along(q))<(TZ3.stallBlock(p,L).w+TZ3.stallBlock(q,L).w)/2) ov.push(p.id+'×'+q.id);
    check('9. 巷 A 兩側的攤交錯、不面對面；同一側的攤不重疊',!face.length&&!ov.length,face.concat(ov).join(' ')); } }
/* 公館那一側的三攤（使用者 11-10「公館那一側也擺幾攤」）：建真正的公館區域 */
{ const E2=mk(), g=Z3.ZONES.gongguan.build(E2), GG=(L.stalls.gongguan||[]), gs=g.ggStalls||[]; E2.zone=g; E2.levels=g.levels||null; E2.nav=g.nav; E2.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
  const st=(x,zz)=>E2.canStand(x,zz,0.33,0), sp2=L.toGongguan.spawn, bad=[];
  for(const q of GG){ if(st(q.x,q.z)) bad.push(q.id+' 攤車沒擋'); if(!st(q.x,q.z+1.9)) bad.push(q.id+' 攤前站不住'); const r=E2.simWalk(sp2.x,sp2.z,q.x,q.z+1.9,{lv0:0,lv1:0,dt:0.1,speed:1.45}); if(!r||!r.ok) bad.push(q.id+' 走不到');
    for(const i of E2.interactables) if(Math.hypot(i.x-q.x,i.z-q.z)<2.2) bad.push(q.id+' 太靠近互動點 '+(i.label||'')); if(q.x>39&&q.x<52.6) bad.push(q.id+' 在花序門前'); if(Math.abs(q.x-sp2.x)<3) bad.push(q.id+' 擋巷口'); if(q.z>17) bad.push(q.id+' 進騎樓'); if(!st(q.x,q.z+1.15)) bad.push(q.id+' 客人那一面 1.15 m 站不住（LAWWW 的看／買互動點）'); }
  check('11. 公館三攤：鮮奶、紅豆餅、手機殼；攤車擋住、攤前站得住、從巷口走得到；不進騎樓、不擋花序門前和巷口、離互動點 ≥ 2.2 m',GG.map(q=>q.kind).sort().join()==='milk,phonecase,wheelcake'&&gs.length===3&&!bad.length,bad.join(' | '));
  g.applyTimeOutdoor(15.5,null); const m15=gs.filter(q=>q.isOpen).map(q=>q.kind).join(); g.applyTimeOutdoor(19,null); const m19=gs.filter(q=>q.isOpen).length; g.applyTimeOutdoor(0.2,null); const m23=gs.filter(q=>q.isOpen).length; g.tzStallsClosed=true; g.applyTimeOutdoor(19,null); const ty=gs.filter(q=>q.isOpen).length; g.tzStallsClosed=false;
  check('11. 公館三攤照各自的時間：15:30 只有紅豆餅開、19:00 三攤都開、00:12 都收了；颱風（tzStallsClosed）不擺',m15==='wheelcake'&&m19===3&&m23===0&&ty===0,[m15,m19,m23,ty].join(' / ')); }
/* 公館 G10 是真的巷口（GG-G10-LANE-MOUTH-1111；使用者 11-11 選擇題「改成真的巷口」）：正式模型的 G10 一樓是通道、不是鐵捲門；騎樓中間沒有柱子；「往汀州路」的互動點在通道口前面 */
{ const py=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_street.py'),'utf8'), kit=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_shopkit.py'),'utf8'), zj=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('13. 公館 G10：街道模型的設定是巷口（lane）、G09 照舊鐵捲門（shut）；樓房本體的牆在通道範圍打開',/'G10': dict\([^\n]*lane=True/.test(py)&&/'G09': dict\([^\n]*shut=True/.test(py)&&/get\('lane'\):   # 巷口（GG-G10-LANE-MOUTH-1111）/.test(py)&&/if c\.get\('lane'\):/.test(kit));
  check('13. G10 騎樓中間的柱子拿掉：模型腳本和 zones3d.js 的例外清單都有 10',/_i not in \(4, 5, 7, 8, 10, 11, 12, 13, 14\)/.test(py)&&/!\[4,5,7,8,10,11,12,13,14\]\.includes\(i\)/.test(zj));
  const E3b=mk(), g=Z3.ZONES.gongguan.build(E3b), gate=E3b.interactables.find(i=>i.tzGate); E3b.zone=g; E3b.levels=g.levels||null; E3b.nav=g.nav; E3b.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
  const J2=(()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.json'),'utf8')); }catch(e){ return null; } })();
  check('13. 「往汀州路（巷子）」的互動點在 G10 通道口正前方（x 37.1，通道 x 34.8～39.4）、站得住；通道口前面那一格沒有柱子擋著',!!gate&&Math.abs(gate.x-37.1)<0.01&&E3b.canStand(gate.x,gate.z-0.6,0.33,0)&&E3b.canStand(37.1,19.6,0.33,0),gate?gate.x+','+gate.z:'沒有'); }
/* 禮貌生財（LIMAO-SHOP-1110，X332）：巷 A 後段南側靠公館那一端，一樓退成騎樓；算命桌在騎樓下、門前留通道；照時間開 */
{ const LM=L.limao, lm=z.tzLimao, T=LM&&LM.table, sp0=[L.fromGongguan.x,L.fromGongguan.z];
  check('12. 禮貌生財：店名一字不差；在巷 A 南側、靠公館那一端（不在汀州路主街、不在攤販排裡）；區域有 zone.tzLimao',!!LM&&LM.name==='禮貌生財'&&LM.z===L.alleys[0].z1&&LM.x0>=F.east+F.depth&&LM.x1>L.fromGongguan.x&&!!lm&&!L.stalls.list.some(q=>q.where==='alleyA'&&q.z>0&&q.x+TZ3.stallBlock(q,L).w/2>LM.x0-0.5));
  if(LM&&lm){ const door=lm.door;
    check('12. 騎樓裡走得進去：門前站得住、從巷子走得到；兩根柱子、算命桌擋住；桌前（配置 at）站得住',!!door&&freeAt(door.x,door.z-0.3)&&reach(sp0,[door.x,door.z-0.3])&&LM.pillars.every(p=>!freeAt(p[0],p[1]))&&!freeAt(T.x,T.z)&&freeAt(T.at.x,T.at.z)&&reach(sp0,[T.at.x,T.at.z]));
    { let w=0; for(let x=LM.x0+0.5;x<T.x-T.w/2-0.1;x+=0.25) if(freeAt(x,LM.door.z-0.3)) w+=0.25; check('12. 算命桌旁邊到店門的通道至少 1.5 m 寬（規格：保留合理通道）',w>=1.5,w.toFixed(2)+' m'); }
    z.applyTimeOutdoor(18,null); const c18=lm.open, l18=door.label, e18=!!door.exit; z.applyTimeOutdoor(20,null); const c20=lm.open, l20=door.label, e20=door.exit&&door.exit.to; z.tzLimaoAway=true; z.applyTimeOutdoor(20,null); const aw=lm.masterAway&&lm.open; z.tzLimaoAway=false; z.tzLimaoOff=true; z.applyTimeOutdoor(20,null); const off=lm.open; z.tzLimaoOff=false; z.applyTimeOutdoor(23.6,null); const c23=lm.open;
    check('12. 照時間：18:00 關著（門只能看）、20:00 開（有室內時可以進 tz_limao）、23:36 關；店開著上師不在（tzLimaoAway）、今天不開（tzLimaoOff）',!c18&&/^看/.test(l18)&&!e18&&c20&&(!Z3.ZONES.tz_limao||(/^進/.test(l20)&&e20==='tz_limao'))&&aw&&!off&&!c23,[c18,l18,c20,l20,aw,off,c23].join(' '));
    const nodes2=(()=>{ try{ const d=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/tingzhou_stalls.glb')), jl=d.readUInt32LE(12); return (JSON.parse(d.slice(20,20+jl).toString('utf8')).nodes||[]).map(n=>n.name); }catch(e){ return []; } })();
    check('12. 模型：算命桌營業／收攤兩個節點＋店面的燈（LIMAO_TABLE_open／_closed／LIMAO_SHOPLIGHT）；招牌從使用者的圖裁（limao_sign 在貼圖集）',['LIMAO_TABLE_open','LIMAO_TABLE_closed','LIMAO_SHOPLIGHT'].every(n=>nodes2.includes(n))&&/limao_sign/.test(fs.readFileSync(path.join(ROOT,'tools/blender/env_second/textures/gen/tz_fronts_atlas.json'),'utf8'))); } }
check('10. 路邊的機車是一小群一小群停、有空位（使用者 11-10：不要兩側排滿、長得一樣）：40～80 台、至少 12 個空檔、有腳踏車；巷 A 口和斑馬線前不停；Z3 有匯出機車模型的函式',z.tzScooters>=40&&z.tzScooters<=80&&z.tzParkGaps>=12&&z.tzBikes>=4&&typeof Z3.attachWzScooters==='function'&&reach(sp,[F.west-1.5,0])&&freeAt(F.east-0.8,0),`機車 ${z.tzScooters}、腳踏車 ${z.tzBikes}、群 ${z.tzParkGroups}、空檔 ${z.tzParkGaps}`);
/* 機車第 3 版（BB_255，11-10 23:07／23:10）：擺放規則——色系相鄰不重複、黑與深藍 ≤ 1/4、S1A＋S1B＋S2（同一種車尾）合計 ≤ 四成且不連三台、款式和配色表和模型一致 */
{ const st=z.tzScStat||{}, SL=z.tzScList||[], glb=path.join(ROOT,'assets/models/env/second_ai/scooter.glb'); let ex={}; try{ const d=fs.readFileSync(glb), jl=d.readUInt32LE(12); for(const n of JSON.parse(d.slice(20,20+jl).toString('utf8')).nodes||[]){ const m=/^scooter_(S\w+)$/.exec(n.name); if(m&&!/_lod1$/.test(n.name)&&n.extras) ex[m[1]]=JSON.parse(n.extras.palette||'[]'); } }catch(e){}
  const badPal=Object.keys(TZ3.SC).filter(c=>!ex[c]||ex[c].join()!==TZ3.SC[c].pal.join());
  check('10b. 款式表的十二款都在機車模型裡、配色表和模型的一樣（Z3.attachWzScooters 照 code、pcol 用）',Object.keys(TZ3.SC).length===12&&!badPal.length&&/s\.code/.test(fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'))&&/s\.pcol/.test(fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8')),badPal.join(' '));
  let adj=0, run=0, dark=0, tA=0; for(let i=0;i<SL.length;i++){ const f=TZ3.colorFam(SL[i].col), t=TZ3.SC[SL[i].code].tail; if(f==='dark') dark++; if(t==='A') tA++; if(i&&TZ3.colorFam(SL[i-1].col)===f) adj++; if(i>1&&TZ3.SC[SL[i-1].code].tail===t&&TZ3.SC[SL[i-2].code].tail===t) run++; }
  check('10b. 相鄰兩台不同色系；車尾形狀一樣的不連三台',SL.length===z.tzScooters&&adj===0&&run===0,`相鄰同色系 ${adj}、連三台同車尾 ${run}`);
  check('10b. 黑與深藍全街不超過四分之一；S1A＋S1B＋S2 合計四成以下；其他款（S3、S4、S5、S7、S9）每一款至少 3 台',dark<=SL.length*0.25&&tA<=SL.length*0.4&&['S3','S4','S5','S7','S9'].every(c=>(st.codes[c]||0)+(c==='S5'?(st.codes.S5_H||0):0)>=3),`黑深藍 ${dark}/${SL.length}、同車尾 ${tA}/${SL.length}、${JSON.stringify(st.codes)}`);
  check('10b. 色系分得出來：白、米、銀灰、黑／深藍、紅、藍、綠、黃',TZ3.colorFam('#f1f1ee')==='white'&&TZ3.colorFam('#d9cdb6')==='beige'&&TZ3.colorFam('#a9adb2')==='grey'&&TZ3.colorFam('#141517')==='dark'&&TZ3.colorFam('#22344f')==='dark'&&TZ3.colorFam('#8f1f24')==='red'&&TZ3.colorFam('#9fc4d2')==='blue'&&TZ3.colorFam('#2f5a3c')==='green'&&TZ3.colorFam('#e3c22b')==='yellow'&&new Set(SL.map(q=>TZ3.colorFam(q.col))).size>=6,[...new Set(SL.map(q=>TZ3.colorFam(q.col)))].join(' ')); }
{ const PW=L.road.parkW||1.6; let worst=0; for(const sx of [-1,1]){ const x=sx*(L.road.x1-PW/2); let run=0; for(let zz=L.walk.z0+1;zz<L.walk.z1-1;zz+=0.25){ if(!freeAt(x,zz)){ run+=0.25; worst=Math.max(worst,run); } else run=0; } }
  check('10. 沒有連續超過 7 m 的一整排車（路邊每隔一小段就有空位可以穿過去）',worst<=7,worst.toFixed(2)+' m'); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
