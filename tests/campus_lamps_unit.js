// 椰林大道的路燈（ART-ECON-3D-GAP-1021，LAWWW2 2026-10-21）——不需要瀏覽器。
// 原本：大道兩排路燈的燈臂背對大道（朝兩側的樹牆），燈下的地面光圈只在燈桿旁邊一小圈，晚上 12 m 寬的路面整條是黑的（巡場景 P2；經濟系、法律系晚上都走這條）；
//       傅鐘那一側有一盞正好立在鐘亭正前方（巡場景 P3）。
// 做法（src/zones3d.js 校園）：路燈轉向、燈臂伸向路面；燈下加一圈暖色路面光圈（E.lampGlows，入夜才開）；傅鐘前那一盞改成鐘亭兩側各一盞。
// 檢查：燈臂朝大道；每一盞都有路面光圈（在路面上、白天藏著、登記在 E.lampGlows）；鐘亭正前方沒有路燈、站得住。
// 用法：node tests/campus_lamps_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const made=[]; const lp0=W3.lampPost; W3.lampPost=(...a)=>{ const l=lp0(...a); made.push(l); return l; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); W3.lampPost=lp0; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
z.group.updateMatrixWorld(true);
const v=new THREE.Vector3(), w=new THREE.Vector3();
/* 大道的路燈：燈桿在 z ±11、x −106～56（W3.lampPost 的燈頭在本地 (0, 3.95, 0.75)）*/
const av=made.filter(l=>l.parent&&(l.getWorldPosition(v),Math.abs(Math.abs(v.z)-11)<0.3&&v.x>-107&&v.x<57));
const post=l=>l.getWorldPosition(new THREE.Vector3()), head=l=>l.localToWorld(new THREE.Vector3(0,3.95,0.75));
const away=av.filter(l=>Math.abs(head(l).z)>=Math.abs(post(l).z)).map(l=>{ const p=post(l); return [+p.x.toFixed(2),+p.z.toFixed(2)]; });
check('1. 大道的路燈（'+av.length+' 盞）燈臂都朝大道（燈頭比燈桿靠近路中間）',av.length>=15&&!away.length,'背對大道的 '+away.length+' 盞 '+JSON.stringify(away.slice(0,4)));
/* 路面光圈：每一盞底下有一片貼地的光（y < 0.1）、中心往路中間 3 m 以上、在 E.lampGlows（入夜才開）、白天藏著 */
const glows=new Set(E.lampGlows), noPool=[];
for(const l of av){ const p=post(l); let ok=false; l.traverse(o=>{ if(!o.isMesh||!glows.has(o)) return; o.getWorldPosition(w); if(w.y<0.1&&Math.abs(w.z)<Math.abs(p.z)-3&&o.visible===false) ok=true; }); if(!ok) noPool.push([+p.x.toFixed(2),+p.z.toFixed(2)]); }
check('2. 每一盞都有路面光圈（貼地、往路中間 3 m 以上、登記在 E.lampGlows、白天藏著）',av.length>=15&&!noPool.length,'沒有的 '+noPool.length+' 盞 '+JSON.stringify(noPool.slice(0,4)));
/* 傅鐘（-38, 16.5）：鐘亭前廣場（x −52～−24、z 11～23）正前方 ±4 m 沒有路燈；原本那一盞的位置站得住 */
const front=made.filter(l=>l.parent&&(l.getWorldPosition(v),Math.abs(v.x+38)<4&&v.z>8&&v.z<14)).map(l=>{ const p=post(l); return [+p.x.toFixed(2),+p.z.toFixed(2)]; });
check('3. 傅鐘正前方（x −42～−34）沒有路燈；原本那一盞的位置 (−39, 11) 站得住',!front.length&&E.canStand(-39,11,0.32,0),JSON.stringify(front));
/* 燈柱擋不擋得住人在 tests/lamppost_nav_unit.js（BUG-NAV-LAMPPOST-1021，這份 patch 要接在 lamppost_nav.diff 後面套）*/
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
