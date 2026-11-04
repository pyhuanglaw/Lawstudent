/* 有 via 的運鏡（宿舍書桌「看看房間裡的東西」，liufa_camvia）：進去先經過 via、拉回之前也先退回 via（BB 11-03 22:43：拉回那一段穿過上舖床板 2.6 cm）。
   用真的 engine3d.js 的 updateCamera／E.cinematic／E.endCinematic（測試時把模組內的 camera 換成一個 PerspectiveCamera）。用法：node tests/cam_via_back_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={createElement:()=>({getContext:()=>null,style:{}}),getElementById:()=>null,addEventListener(){}}; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1=');
const k=src.lastIndexOf('return E;'); src=src.slice(0,k)+'E._t={setCam:c=>{camera=c;},upd:updateCamera};\n'+src.slice(k);
vm.runInThisContext(src,{filename:'engine3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3, cam=new THREE.PerspectiveCamera(46,1,0.1,200); E._t.setCam(cam);
E.cam=E.cam||{}; E.cam.mode='follow'; E.player={obj:{position:new THREE.Vector3(-1.5,0,1.5)},lv:0};
// 宿舍 203 的書桌那一格（dorm_desk_items.py：eye 在床板下面 y 1.25、via 在走道 x −0.6 同高同 z）；床板底面 y 1.5、x −2.0～−0.9
const eye=new THREE.Vector3(-1.4,1.25,0.9), via=new THREE.Vector3(-0.6,1.25,0.9), look=new THREE.Vector3(-1.8,0.8,0.4), BOARD={x0:-2.0,x1:-0.9,y:1.5};
cam.position.set(0.5,2.6,3.2);
E.cinematic(eye,look,via); let inBoard=0, minX=9; for(let i=0;i<400;i++){ E._t.upd(1/30); const p=cam.position; if(p.x>BOARD.x0&&p.x<BOARD.x1&&p.y>BOARD.y-0.05) inBoard++; }
check('1. 進去：鏡頭到了 eye（床板下面）',cam.position.distanceTo(eye)<0.05,cam.position.toArray().map(v=>v.toFixed(2)).join(','));
E.endCinematic(); check('2. endCinematic 以後還在運鏡（先退回 via）',E.cam.mode==='cinematic'&&!!E.cam.cine&&E.cam.cine.ending===true);
let trail=[]; for(let i=0;i<120&&E.cam.mode==='cinematic';i++){ E._t.upd(1/30); trail.push(cam.position.clone()); }
const hit=trail.filter(p=>p.x>BOARD.x0&&p.x<BOARD.x1&&p.y>BOARD.y-0.05).length;
check('3. 退回的路上沒有一格在床板的高度（x −2.0～−0.9、y > 1.45）',hit===0,hit+' 格');
check('4. 退回 via 以後切回跟隨鏡頭',E.cam.mode==='follow'&&trail.length>0&&trail[trail.length-1].distanceTo(via)<0.2,trail.length+' 格');
// 沒有 via 的運鏡照舊：endCinematic 馬上切回跟隨
E.cinematic(new THREE.Vector3(1,2,1),new THREE.Vector3(0,1,0)); for(let i=0;i<10;i++) E._t.upd(1/30); E.endCinematic();
check('5. 沒有 via 的運鏡：endCinematic 馬上回跟隨鏡頭（行為照舊）',E.cam.mode==='follow');
// 退回途中又開始下一件（連續看下一件東西）：直接去下一件的 via
E.cinematic(eye,look,via); for(let i=0;i<400;i++) E._t.upd(1/30); E.endCinematic(); for(let i=0;i<3;i++) E._t.upd(1/30);
const eye2=new THREE.Vector3(-1.2,1.25,0.4), via2=new THREE.Vector3(-0.6,1.25,0.4); E.cinematic(eye2,look,via2); let hit2=0; for(let i=0;i<400;i++){ E._t.upd(1/30); const p=cam.position; if(p.x>BOARD.x0&&p.x<BOARD.x1&&p.y>BOARD.y-0.05) hit2++; }
check('6. 退回途中接著看下一件：沒有穿床板、到得了下一件的 eye',hit2===0&&cam.position.distanceTo(eye2)<0.05,hit2+' 格');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
