// 社科院的位置（X75，SOCSCI-PLACE-1020；使用者 2026-10-20：「社科院位置其實不是在法律系出去左手邊 應該是朝西南 你實際查社科院位置」）——不需要瀏覽器。
//   真實（臺大官方交通資訊）：從辛亥路與復興南路口的校門進來，左邊第一棟是霖澤館；社科院在它西側、靠辛亥路（大樓靠北、圖書館在南）。
//   遊戲原本放在萬才館東南（x 95–125、z −92～−42）：從霖澤館出來是左手邊（東）。X75 整組搬到霖澤館西南、轉 180°（src/data/socsci_layout.js 的 place）：
//   1. 位置：社科院的中心在霖澤館西南（從霖澤館門口出來是右前方，不是左手邊）；大樓在北、圖書館在南；
//   2. 放得下：和校園其他建築的鏡頭碰撞不重疊、離博雅／普通、小椰林道的椰子樹、籃球場、椰林大道旁的系館都有距離（在 Node 裡建出遊戲真正的校園）；
//   3. socsci_layout.js＝LAWWW2 的 campus_socsci.json 照 place 換算（阻擋、樹穴、鏡頭碰撞、門、長椅的面向）；
//   4. zones3d.js 把正式模型照 place 放（three.js 實際算：模型裡的點 → layout 的點）；
//   5. 其他寫死的位置跟著搬：SK02 的系辦門口、休學以後第一次到社科院門口、經濟系那一年事件後回到中庭、大地圖的地名、路人的路線；
//   6. 社科院原本的位置是一棟沒有名字的系館（不掛「社會科學院」）、社科院新位置裡面原本的樹拿掉、路人和腳踏車的路線點都站得住。
// 修改前 1、3、4、5、6 FAIL。用法：node tests/socsci_place_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js',
  'src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/calendar.js','src/data/places.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|CALENDAR|PLACES|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SX=SOCSCI_LAYOUT, J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_socsci.json'),'utf8')).nav;
const box=c=>({x0:c[0],z0:c[2],x1:c[3],z1:c[5]});
const lib=box(SX.cams.find(c=>c[6]==='圖書館')), tower=box(SX.cams.find(c=>/懸挑以上/.test(c[6])));
const all={x0:Math.min(lib.x0,tower.x0),x1:Math.max(lib.x1,tower.x1),z0:Math.min(lib.z0,tower.z0),z1:Math.max(lib.z1,tower.z1)};
const cx=(all.x0+all.x1)/2, cz=(all.z0+all.z1)/2;
// 1. 位置
{ const LZ=[34,-112], door=[27.9,-107.5];   /* 霖澤館的中心、「進入霖澤館」的互動點（正面朝南） */
  check('1. 社科院的中心在霖澤館西南（西邊 ≥ 15 m、南邊 ≥ 15 m）', cx<=LZ[0]-15&&cz>=LZ[1]+15, `中心 (${cx.toFixed(1)},${cz.toFixed(1)})`);
  check('1. 從霖澤館門口出來（面向南）：社科院在右前方（西南），不是左手邊（東）', cx<door[0]&&cz>door[1], `相對門口 (${(cx-door[0]).toFixed(1)},${(cz-door[1]).toFixed(1)})`);
  check('1. 和真實一樣：大樓在北（靠辛亥路）、圖書館在南', tower.z1<=lib.z0, `大樓 z ${tower.z0}～${tower.z1}、圖書館 z ${lib.z0}～${lib.z1}`); }
// 2. 放得下（遊戲真正的校園）
{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
  const own=new Set(SX.cams.map(c=>[(c[0]+c[3])/2,(c[2]+c[5])/2].map(v=>v.toFixed(2)).join(',')));
  const bb=new THREE.Box3(), hits=[];
  for(const m of E.colliders){ m.updateMatrixWorld(true); if(!m.geometry) continue; m.geometry.computeBoundingBox(); bb.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    const key=[(bb.min.x+bb.max.x)/2,(bb.min.z+bb.max.z)/2].map(v=>v.toFixed(2)).join(','); if(own.has(key)) continue;
    const ox=Math.min(bb.max.x,all.x1)-Math.max(bb.min.x,all.x0), oz=Math.min(bb.max.z,all.z1)-Math.max(bb.min.z,all.z0); if(ox>0.05&&oz>0.05) hits.push(`(${bb.min.x.toFixed(1)}～${bb.max.x.toFixed(1)}, ${bb.min.z.toFixed(1)}～${bb.max.z.toFixed(1)})`); }
  check('2. 社科院的範圍和校園其他建築的鏡頭碰撞不重疊', !hits.length, hits.slice(0,4).join(' '));
  /* 鄰居：博雅、普通的東牆 x −20.5；小椰林道西側的椰子樹 x 24.2；系籃球場 x −11.5～3.5、z −120～−106；椰林大道北側、文學院東邊的系館 x −6～20、z −35～−21 */
  check('2. 離博雅／普通（東牆 x −20.5）≥ 5 m、離小椰林道的椰子樹（x 24.2）≥ 5 m', all.x0>=-20.5+5&&all.x1<=24.2-5, `x ${all.x0}～${all.x1}`);
  check('2. 離系籃球場（z −106）≥ 5 m、離椰林大道旁的系館（z −35）≥ 5 m', all.z0>=-106+5&&all.z1<=-35-5, `z ${all.z0}～${all.z1}`);
  const stand=(x,z)=>E.canStand(x,z,0.32,0);
  const inner=[[cx,(lib.z0+lib.z1)/2,'圖書館中間'],[cx,(tower.z0+tower.z1)/2,'大樓中間'],[112,-62,'原本的位置：系館中間']].filter(([x,z])=>stand(x,z));
  check('2. 圖書館、大樓、原本位置的系館站不住（導航跟著搬）', !inner.length, JSON.stringify(inner));
  const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const pick=nm=>{ const m=src.match(new RegExp('const '+nm+'=\\{campus:(\\[[\\s\\S]*?\\]\\]\\]),(?:lane118|gongguan):')); return m?JSON.parse(m[1]):null; };
  const W=pick('walkRoutes'), Bk=pick('bikeRoutes'), bad=[];
  for(const [nm,R] of [['路人',W],['腳踏車',Bk]]) if(!R) bad.push(nm+'：story3d.js 找不到路線'); else R.forEach((rt,i)=>rt.forEach(p=>{ if((p[2]||0)===0&&!stand(p[0],p[1])) bad.push(`${nm}第 ${i+1} 條 (${p[0]},${p[1]}) 站不住`); }));
  check('6. 校園路人、腳踏車的路線點（地面那一層）都站得住（沒有點落在搬過去的社科院或原本位置的系館裡面）', !bad.length, bad.slice(0,4).join(' | '));
  check('5. 路人有一條走進社科院的中庭', !!W&&W.some(rt=>rt.some(p=>p[0]>all.x0&&p[0]<all.x1&&p[1]>tower.z1&&p[1]<lib.z0)));
  const mod=z.group.children.filter(o=>o.userData&&o.userData.ck&&Math.abs(o.position.x-112)<0.01&&Math.abs(o.position.z+62)<0.01);
  check('6. 社科院原本的位置有一棟系館（校園套件，ckPlace 在 (112,−62)）', mod.length===1, mod.length+' 棟');
  const zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('6. 社科院新位置裡面原本的三棵樹（(8,−70)、(8,−50)、(0,−56)）有新模型時不種', /\.\.\.\(SOCX\?\[\]:\[\[8,-70\],\[8,-50\],\[0,-56\]\]\)/.test(zsrc));
  check('6. 原本位置的系館不掛「社會科學院」', /const hall=CK\.modern\(\{w:44,d:20,floors:4,gfh:4\.4,fh:3\.85\}\); ckPlace\(hall,112,-62,-Math\.PI\/2\)/.test(zsrc)); }
// 3. layout＝LAWWW2 的 json 照 place 換算
{ const P=SX.place||{}, T=(x,z)=>[+(P.x-x).toFixed(2),+(P.z-z).toFixed(2)], near=(a,b)=>Math.abs(a[0]-b[0])<0.011&&Math.abs(a[1]-b[1])<0.011;
  check('3. place：轉 180°（ry＝π）、平移 (112, −135)', P.ry===Math.PI&&P.x===112&&P.z===-135, JSON.stringify(P));
  const badR=J.rects.filter((r,i)=>{ const q=SX.rects[i]; return !q||!near(T(r.x,r.z),[q[0],q[1]])||Math.abs(q[2]-r.w)>0.011||Math.abs(q[3]-r.d)>0.011; });
  const badC=J.circles.filter((c,i)=>{ const q=SX.circles[i]; return !q||!near(T(c.x,c.z),[q[0],q[1]])||Math.abs(q[2]-c.r)>0.011; });
  const badK=J.cam.filter((c,i)=>{ const q=SX.cams[i], b=c.box; return !q||!near(T(b[3],b[5]),[q[0],q[2]])||!near(T(b[0],b[2]),[q[3],q[5]])||q[1]!==b[1]||q[4]!==b[4]; });
  check('3. 阻擋、樹穴、鏡頭碰撞都是 json 換算過來的（轉 180°：寬、深不變）', !badR.length&&!badC.length&&!badK.length&&SX.rects.length===J.rects.length&&SX.cams.length===J.cam.length, `rects ${badR.length} circles ${badC.length} cams ${badK.length}`);
  const D={}; for(const d of J.doors) D[d.what]=d; const dl=Object.values(D).find(d=>/圖書館/.test(d.what)), dm=Object.values(D).find(d=>/西面/.test(d.what)), dc=Object.values(D).find(d=>/北面/.test(d.what));
  check('3. 門：圖書館的門、大樓正門（模型的西面主入口）、中庭門（模型的北面入口）都換算過來', near(T(dl.x,dl.z),[SX.libDoor.x,SX.libDoor.z])&&near(T(dm.x,dm.z),[SX.mainDoor.x,SX.mainDoor.z])&&near(T(dc.x,dc.z),[SX.courtDoor.x,SX.courtDoor.z]), JSON.stringify([SX.libDoor,SX.mainDoor,SX.courtDoor]));
  check('3. 從圖書館出來：面向中庭（北，yaw π）', Math.abs(Math.cos(SX.libOut.yaw)+1)<1e-9&&SX.libOut.z<SX.libDoor.z, JSON.stringify(SX.libOut));
  const bz=SX.benches.map(b=>{ const fx=Math.sin(b[4]), fz=Math.cos(b[4]); const tx=(all.x0+all.x1)/2-b[0], tz=(tower.z1+lib.z0)/2-b[1]; return fx*tx+fz*tz>0; });
  check('3. 中庭四張長椅都朝中庭坐（面向中庭的中心）', SX.benches.length===4&&bz.every(Boolean), JSON.stringify(SX.benches.map(b=>[b[0],b[1],+(b[4]||0).toFixed(2)])));
  check('3. 大樓正門在大樓東面、朝小椰林道（x 比大樓東牆多不到 1 m）；中庭門在大樓南面', SX.mainDoor.x>tower.x1-3&&SX.mainDoor.z>tower.z0&&SX.mainDoor.z<tower.z1&&Math.abs(SX.courtDoor.z-tower.z1)<2.5); }
// 4. 正式模型照 place 放
{ const zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('4. zones3d.js：正式模型 root.rotation.y＝place.ry、root.position＝(place.x, 0, place.z)，再接上', /const root=c\.scene\.clone\(true\); if\(SOCX&&SOCX\.place\)\{ root\.rotation\.y=SOCX\.place\.ry; root\.position\.set\(SOCX\.place\.x,0,SOCX\.place\.z\); \}[\s\S]{0,200}attachWenzhouModel\(E,g,root,'ckTag'/.test(zsrc));
  const o=new THREE.Object3D(); o.rotation.y=SX.place.ry; o.position.set(SX.place.x,0,SX.place.z); o.updateMatrixWorld(true);
  const v=new THREE.Vector3(), worst=[]; for(const [i,r] of J.rects.entries()){ v.set(r.x,0,r.z).applyMatrix4(o.matrixWorld); const q=SX.rects[i]; worst.push(Math.hypot(v.x-q[0],v.z-q[1])); }
  check('4. three.js 實際算：模型裡每一個阻擋的中心放好以後就在 layout 的位置（誤差 < 1 cm）', Math.max(...worst)<0.01, 'max '+Math.max(...worst).toFixed(4));
  check('4. 備用量體用 layout 的鏡頭碰撞盒子（跟著搬）', /SOCX\.cams\.forEach\(\(\[x0,y0,z0,x1,y1,z1\],i\)=>fb\(x0,y0,z0,x1,y1,z1,/.test(zsrc)&&!/fb\(95,0,-92,125,6\.15,-70/.test(zsrc)); }
// 5. 其他寫死的位置
{ const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'), inC=(x,z)=>x>all.x0&&x<all.x1&&z>tower.z1&&z<lib.z0;
  const sk=ev.match(/id:'ev_sk02_jacket'[^\n]*?near:\{x:(-?[\d.]+),z:(-?[\d.]+),r:([\d.]+)\}/), sd=ev.match(/id:'ev_y0_soc_door'[^\n]*?near:\{x:(-?[\d.]+),z:(-?[\d.]+),r:([\d.]+)\}/);
  check('5. SK02 系外套：在大樓正門的柱廊（離 mainDoor ≤ 1 m）', !!sk&&Math.hypot(+sk[1]-SX.mainDoor.x,+sk[2]-SX.mainDoor.z)<=1, sk?sk.slice(1).join(','):'找不到');
  check('5. 休學以後第一次到社科院門口：範圍包含圖書館的門、中心在中庭', !!sd&&Math.hypot(+sd[1]-SX.libDoor.x,+sd[2]-SX.libDoor.z)<+sd[3]&&inC(+sd[1],+sd[2]), sd?sd.slice(1).join(','):'找不到');
  const en=[...ev.matchAll(/GM\.enter\('campus',\{x:(-?[\d.]+),z:(-?[\d.]+),yaw:([^}]+)\}\)/g)].filter(m=>Math.hypot(+m[1]-cx,+m[2]-cz)<40||Math.hypot(+m[1]-110,+m[2]+67)<40);
  check('5. 經濟系那一年事件後回到社科院中庭（兩處）：位置在新的中庭裡、面向小椰林道（東）', en.length===2&&en.every(m=>inC(+m[1],+m[2])&&m[3]==='Math.PI/2'), en.map(m=>m.slice(1).join(',')).join(' | '));
  const lm=PLACES.landmarks.campus, ls=lm.find(q=>q[0]==='社會科學院'), ll=lm.find(q=>q[0]==='社科院圖書館');
  check('5. 大地圖的地名：「社會科學院」在大樓、「社科院圖書館」在圖書館', !!ls&&!!ll&&ls[1]>tower.x0&&ls[1]<tower.x1&&ls[2]>tower.z0&&ls[2]<tower.z1&&ll[1]>lib.x0&&ll[1]<lib.x1&&ll[2]>lib.z0&&ll[2]<lib.z1, JSON.stringify([ls,ll]));
  check('5. 社科院圖書館的門（soclib3d.js 的 DOOR、出來的位置 CAMPUS）照 layout', SL3.DOOR.x===SX.libDoor.x&&SL3.DOOR.z===SX.libDoor.z&&SL3.CAMPUS.x===SX.libOut.x&&SL3.CAMPUS.z===SX.libOut.z); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
