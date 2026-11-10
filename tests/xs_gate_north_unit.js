/* 新生南路側門開在北牆、望月台（新月台）在西北角、體育館搬到望月台和法學院中間（XS-GATE-NORTH-1105，LAWWW2-C 11-05）
   使用者 09:0x「新月台…要很靠新生南路那門 就不要往左邊開了 直接往上面開 跟公館不同側／新月台也貼著上方的最左邊」、09:1x「好」（北牆外西段叫新生南路）、
   09:2x「體育館實際上是在新生南路辛亥路交接口 遊戲中就改到新月台法學院中間」。取代 XS-GATE-MOVE-1105（門在 x −66 往西開）。
   ① 側門出口在北牆（z −141）、靠西北角；從新生南路回來的落點站得住、面向南；落點走得到側門出口、映月湖和博思中間、校門內側、校園出生點、體育館門口
   ② 側門不在西牆：西牆 x −124（z −141～−80）牆外一格都走不到；北牆外（z < −141）一格都走不到；北牆的門洞只有側門那 5.2 m
   ③ 望月台在西北角、貼北牆和西牆（本體走不到）；體育館在望月台東邊、法學院西邊、貼北牆，門朝南；兩棟都有招牌
   ④ 體育館的門口（classes3d 的 DOORS.gym、gym_layout 的 enterAt）在體育館南面；從體育館出來（gym_layout.exit.spawn、gym3d 的 CAMPUS）站得住、面向南；舊的 (74, 59.4) 不再是體育館門口
   ⑤ 停車場：在望月台南邊、走得到；有停著的車、空著一格給開車出發（XSG.carSpot 站得住、走得到）
   ⑥ 北牆外的路名：側門前是新生南路、路口以東是辛亥路（路名牌）；新生南路往北那一段對面沒有房子
   ⑦ 手機地圖：體育館自己一顆圖釘（在校園北邊、法律系館A 西邊），新生南路在校園北邊
   ⑧ 舊存檔在舊側門那一帶 (−120, −83)：照舊站得住或 unstick 一次就好、走得到校園出生點
   修改前（開發分支 93d4d94df＝XS-GATE-MOVE 那一版）：①②③④⑤⑥⑦ FAIL。用法：node tests/xs_gate_north_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 校園的正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=eval(T.match(/const files=(\[[^\]]+\])/)[1]);
for(const f of ['src/townkit3d.js','src/campuskit3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const warn=console.warn; console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=XINSHENG_LAYOUT, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const cz=Z3.ZONES.campus.build(E), cn=cz.nav;
const cOf=(x,zz)=>[Math.floor((x-cn.ox)/cn.cell),Math.floor((zz-cn.oz)/cn.cell)];
const free=(x,zz)=>{ const [c,r]=cOf(x,zz); return c>=0&&r>=0&&c<cn.cols&&r<cn.rows&&!cn.b[cn.idx(c,r)]; };
function reach(a,b){ const [sx,sz]=cOf(...a), [tx,tz]=cOf(...b); const seen=new Uint8Array(cn.cols*cn.rows), q=[[sx,sz]]; seen[cn.idx(sx,sz)]=1;
  while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=cn.cols||ny>=cn.rows) continue; const i=cn.idx(nx,ny); if(seen[i]||cn.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
for(const f of ['src/data/gym_layout.js','src/classes3d.js','src/placemap3d.js']) if(fs.existsSync(path.join(ROOT,f))&&!files.includes(f)){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
const near=(a,b,t)=>Math.abs(a-b)<=(t||0.01);
// ①
const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng'), cs=L.sideGate.campusSpawn;
check('①a 側門出口在北牆邊（z −141 往內 ≤ 2 m）、靠西北角（x −110～−90）',!!ex&&ex.z>-141&&ex.z<-139&&ex.x>-110&&ex.x<-90,ex?ex.x+','+ex.z:'沒有出口');
check('①b 從新生南路回來的落點站得住、不在出口範圍裡、面向南（yaw 0）',free(cs.x,cs.z)&&!!ex&&Math.hypot(cs.x-ex.x,cs.z-ex.z)>ex.radius&&near(cs.yaw,0),cs.x+','+cs.z+' yaw '+cs.yaw);
const goals={'側門出口':ex&&[ex.x,ex.z],'映月湖和博思中間 (−50, −98)':[-50,-98],'校門內側 (−110, 0)':[-110,0],'校園出生點':[cz.spawn.x,cz.spawn.z],'體育館門口 (−75, −124)':[-75,-124]};
const miss=Object.entries(goals).filter(([k,p])=>!p||!reach([cs.x,cs.z],p)).map(([k])=>k);
check('①c 落點走得到側門出口、映月湖和博思中間、校門、校園出生點、體育館門口',!miss.length,miss.join(' ')||Object.keys(goals).length+' 處');
// ②
let outW=0, outN=0; for(let zz=-140.75;zz<-80;zz+=0.5) for(let x=-129.75;x<-124.4;x+=0.5) if(free(x,zz)) outW++;
for(let x=-123.75;x<20;x+=0.5) for(let zz=-141.75;zz<-141.2;zz+=0.5) if(free(x,zz)) outN++;
check('②a 西牆外、北牆外一格都走不到',outW===0&&outN===0,'西 '+outW+' 北 '+outN);
check('②b 西牆舊側門 (−122.6, −84) 沒有出口了',!E.interactables.some(q=>q.exit&&q.exit.to==='xinsheng'&&q.x<-118));
const xsg=Z3.XSG||null;
check('②c 北牆的門洞＝側門 5.2 m（XSG.gw）、門洞外就是北牆外',!!xsg&&near(xsg.gw,5.2)&&near(xsg.z,-141)&&!!ex&&Math.abs(ex.x-xsg.x)<0.5,xsg?xsg.x+','+xsg.z:'沒有 Z3.XSG');
// ③
const bl=cz.group.children.concat([]).length; const bs=[]; cz.group.traverse(o=>{ if(o.userData&&o.userData.ckTag&&o.userData.ck) bs.push(o); });
const moon=bs.find(o=>o.userData.ckTag==='moon'), gym=bs.find(o=>o.userData.ckTag==='gym_ext');
const box=o=>new THREE.Box3().setFromObject(o);
const mb=moon&&box(moon), gb=gym&&box(gym);
check('③a 望月台在西北角：貼西牆（x ≤ −122）、貼北牆（z ≤ −139.5）；本體中間走不到',!!mb&&mb.min.x<=-122&&mb.min.z<=-139.5&&!free((mb.min.x+mb.max.x)/2,(mb.min.z+mb.max.z)/2),mb?mb.min.x.toFixed(1)+'～'+mb.max.x.toFixed(1)+' z '+mb.min.z.toFixed(1)+'～'+mb.max.z.toFixed(1):'沒有');
check('③b 體育館在望月台東邊、法學院（x 5）西邊、貼北牆；本體中間走不到',!!gb&&!!mb&&gb.min.x>mb.max.x&&gb.max.x<5&&gb.min.z<=-139.5&&!free((gb.min.x+gb.max.x)/2,(gb.min.z+gb.max.z)/2),gb?gb.min.x.toFixed(1)+'～'+gb.max.x.toFixed(1)+' z '+gb.min.z.toFixed(1)+'～'+gb.max.z.toFixed(1):'沒有');
// ④
const dg=typeof GYM_LAYOUT!=='undefined'?GYM_LAYOUT:null, ea=dg&&dg.enterAt, sp=dg&&dg.exit&&dg.exit.spawn;
const GF=xsg&&xsg.gym; check('④a 進體育館的地方在體育館南面中間（本體南牆外 ≤ 2 m；雨遮底下）、站得住',!!ea&&!!GF&&ea.z>GF[3]&&ea.z<GF[3]+2&&ea.x>GF[0]&&ea.x<GF[2]&&free(ea.x,ea.z),ea?ea.x+','+ea.z:'沒有');
check('④b 從體育館出來站得住、面向南、走得到校園出生點',!!sp&&free(sp.x,sp.z)&&near(sp.yaw,0)&&reach([sp.x,sp.z],[cz.spawn.x,cz.spawn.z]),sp?sp.x+','+sp.z:'');
const srcs=['src/classes3d.js','src/gym3d.js','src/data/gym_layout.js','src/data/sis_b13_events.js'].map(f=>[f,fs.readFileSync(path.join(ROOT,f),'utf8')]);
const old=srcs.filter(([f,s])=>/x:\s?74,\s?z:\s?5[89]/.test(s)).map(([f])=>f);
check('④c 舊的體育館門口 (74, 58～59.4) 不在 classes3d／gym3d／gym_layout／學姊游泳那一段事件裡',!old.length,old.join(' '));
// ⑤
const P=xsg&&xsg.park, cars=(xsg&&xsg.cars)||[], spot=xsg&&xsg.carSpot;
check('⑤a 停車場在望月台南邊、走得到',!!P&&!!mb&&P[1]>=mb.max.z-0.5&&reach([cs.x,cs.z],[(P[0]+P[2])/2,(P[1]+P[3])/2]),P?P.join(','):'');
check('⑤b 停著 ≥ 6 台車、空一格（XSG.carSpot）；那一格和旁邊站的地方站得住、走得到',cars.length>=6&&!!spot&&free(spot.x,spot.z)&&free(spot.stand.x,spot.stand.z)&&reach([cs.x,cs.z],[spot.stand.x,spot.stand.z])&&!cars.some(c=>Math.hypot(c.x-spot.x,c.z-spot.z)<1),cars.length+' 台');
// ⑥
const signs=[]; cz.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.map&&o.material.map.name) signs.push(o); });
const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
check('⑥a 北牆外有「新生南路」「辛亥路」路名牌（pole(…) 在 z −143 那一排人行道）',/pole\(XSG\.x\+3\.8,-143\.2,\[\['新生南路'/.test(zs)&&/\['辛亥路',Math\.PI\/2\],\['新生南路',0\]/.test(zs));
check('⑥b 新生南路往北那一段（x XSG.xh ± 6）對面兩排沒有房子',/c\.z===-171\|\|c\.z===-194\)&&Math\.abs\(c\.x-XSG\.xh\)/.test(zs)&&!!xsg&&xsg.xh>(gb?gb.max.x:0)&&xsg.xh<5);
// ⑦
const PM=typeof PLACEMAP!=='undefined'?PLACEMAP:null, pg=PM&&PM.PINS.find(p=>p.id==='gym'), pl=PM&&PM.PINS.find(p=>p.id==='linze'), ps=PM&&PM.PINS.find(p=>p.id==='xinsheng');
check('⑦ 手機地圖：體育館自己一顆圖釘（法律系館A 西邊、上半部）；新生南路圖釘在校園北邊（比法律系館A 高）',!!pg&&!!pl&&pg.x<pl.x&&pg.y<pl.y+10&&!!ps&&ps.y<pl.y&&!PM.PINS.find(p=>p.id==='dorm').m.some(m=>m[0]==='gym'),pg?pg.x+','+pg.y:'沒有');
// ⑧
E.player={lv:0,obj:new THREE.Object3D()}; E.nav=cn; E.levels=cz.levels; E.zone=cz;
E.player.obj.position.set(-120,0,-83); const ok0=free(-120,-83); const moved=ok0||E.unstick(E.player,16), p=E.player.obj.position;
check('⑧ 舊存檔 (−120, −83)：站得住或 unstick 放到 3.5 m 內，走得到校園出生點',moved&&Math.hypot(p.x+120,p.z+83)<=3.5&&reach([p.x,p.z],[cz.spawn.x,cz.spawn.z]),p.x.toFixed(2)+','+p.z.toFixed(2));
{ const bad=[[-66,-99],[-61.6,-99]].filter(([x,zz])=>{ E.player.obj.position.set(x,0,zz); const ok=free(x,zz)||E.unstick(E.player,16); const q=E.player.obj.position; return !(ok&&reach([q.x,q.z],[cz.spawn.x,cz.spawn.z])&&Math.hypot(q.x-x,q.z-zz)<=3.5); }).map(p=>p.join(','));
  check('⑧b 舊存檔在早上那一版的側門 (−66, −99)、落點 (−61.6, −99)：站得住或 unstick 一次，走得到校園出生點',!bad.length,bad.join(' ')); }
console.warn=warn;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
