// 研三舍那一棟拿掉（NTU-REF-1110 ③-4，LAWWW2 帳號 A 11-10；X223／D136）——不需要瀏覽器（D131）。
// 事實（docs/story_planning/ref_images/buildings/README.md 國際學苑一列；住宿組）：研三舍位於國青大樓，同一棟（男 5～7 樓、女 2、8～11 樓）。
// 遊戲原本在國青南邊 (63,−108) 另外蓋了一棟 4 層的「研三舍」（CK.modern），是多的。AA 11-10：劇情沒用到研三舍。LAWWW 11-10 12:52：拿掉、留國青。
// 檢查：
//   1 程式：zones3d.js 沒有另外蓋「研三舍」（sign:'研三舍'），大地圖的地名也拿掉（PLACES.landmarks.campus）
//   2 校園：原址 (63,−108) 上面沒有建築（樓高 3 m 以上、範圍小於 60 m 的網格；整片合併的遠景、地面不算），也沒有鏡頭碰撞
//   3 導航：原址那一塊（x 56～70、z −112～−104，外加 2 m）站得住的地方都和霖澤館前 (34,−98) 連在一起，沒有小孤島；國青大樓照舊走不到
// 修改前（開發分支 74da28ca9）：1、2 FAIL（3 的原址站不住，也算 FAIL）。用法：node tests/ntu_ref_r3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','src/data/blackforest_layout.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(BLACKFOREST_LAYOUT|THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};

const ZS=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const lm=(PLACES.landmarks&&PLACES.landmarks.campus||[]).filter(l=>l[0]==='研三舍');
check('1 沒有另外蓋「研三舍」那一棟、大地圖沒有「研三舍」地名（國青大樓照舊）', !/sign:'研三舍'/.test(ZS)&&lm.length===0&&(PLACES.landmarks.campus||[]).some(l=>l[0]==='國青大樓'), `程式 ${/sign:'研三舍'/.test(ZS)?'還有':'沒有'}；地名 ${lm.length}`);

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
global.GAME={G:{hour:14,weather:'clear',flags:{},zone:'campus'}};
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
z.group.updateMatrixWorld(true);
const X=63, Z=-108, P=new THREE.Vector3(X,5,Z), hits=[];
z.group.traverse(o=>{ if(!o.isMesh||!o.geometry) return; o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if(b.max.y>=3&&b.max.x-b.min.x<60&&b.max.z-b.min.z<60&&b.containsPoint(P)) hits.push(o.name||o.parent&&o.parent.name||'(無名)'); });
const cols=(E.colliders||[]).filter(c=>{ const b=c.isBox3?c:(c.box||(c.geometry?(c.geometry.computeBoundingBox(),c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld)):null)); return b&&b.containsPoint(P); });
check('2 原址 (63, −108) 上面沒有建築、沒有鏡頭碰撞', hits.length===0&&cols.length===0, `網格 ${hits.length}${hits.length?'（'+hits.slice(0,4).join('、')+'）':''}；鏡頭碰撞 ${cols.length}`);

const stand=(x,zz)=>E.canStand(x,zz,0.3,0), H=0.25, BX=[30,100], BZ=[-132,-86];
const key=(i,j)=>i+','+j, I=x=>Math.round((x-BX[0])/H), J=zz=>Math.round((zz-BZ[0])/H), wx=i=>BX[0]+i*H, wz=j=>BZ[0]+j*H;
const seen=new Set(), q=[[I(34),J(-98)]]; let ok0=stand(34,-98); if(ok0) seen.add(key(...q[0]));
while(q.length){ const [i,j]=q.pop(); for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di, b=j+dj, k=key(a,b); if(seen.has(k)) continue; const x=wx(a), zz=wz(b); if(x<BX[0]||x>BX[1]||zz<BZ[0]||zz>BZ[1]||!stand(x,zz)) continue; seen.add(k); q.push([a,b]); } }
let n=0; const isl=[];
for(let x=54;x<=72;x+=H) for(let zz=-114;zz<=-102;zz+=H){ if(!stand(x,zz)) continue; n++; if(!seen.has(key(I(x),J(zz)))) isl.push([+x.toFixed(2),+zz.toFixed(2)]); }
check('3 原址站得住、和霖澤館前 (34, −98) 連在一起，附近沒有小孤島；國青大樓 (65, −119) 照舊走不到', ok0&&stand(X,Z)&&seen.has(key(I(X),J(Z)))&&isl.length===0&&!stand(65,-119), `原址 ${stand(X,Z)?'站得住':'站不住'}；附近 ${n} 格站得住、${isl.length} 格不相連${isl.length?' '+JSON.stringify(isl.slice(0,5)):''}`);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
