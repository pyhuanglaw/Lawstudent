// 兩點半的客人（X71，BUG-CAFE-NPC-1020；使用者 2026-10-20：「咖啡店以前很常有NPC現在都沒有」）——不需要瀏覽器。
//   學姊改照作息（AA_284 1-2）以後，店裡常常只剩一位客人（座位 6）＋芷若有班時在吧檯。
//   1. 照時段 1～3 位：11–14 三位、14–18 兩位、18–22 三位、其他一位；
//   2. 只坐一般桌：不坐吧檯高腳椅、沙發、學姊的位子（5）；
//   3. 同一天同一時段進出是同一批（D55）；換一天換人；
//   4. story3d.js 的兩點半用 S.cafeCustomers，客人坐的位子記 seat（玩家不會坐到同一張椅子）。
// 修改前 1～4 都 FAIL。用法：node tests/cafe_customers_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 座位排法照 zones3d.js 的兩點半：雙人桌（成對）、中間那桌兩張、吧檯高腳椅四張（bar）、沙發三個（sofa）
const seats=[]; for(let t=0;t<5;t++) for(const s of [-1,1]) seats.push({x:t*2-4,z:s*0.8}); seats.push({x:-0.85,z:1.5},{x:0.85,z:1.5}); for(const x of [-4.5,-2.9,-1.3,0.3]) seats.push({x,z:-3.3,bar:true}); for(const z of [2.85,3.4,3.95]) seats.push({x:-5.95,z,sofa:true});
const cc=(day,hour)=>typeof STORY.cafeCustomers==='function'?STORY.cafeCustomers({day,hour},seats):null;
check('1. 照時段：12:00 三位、15:00 兩位、19:30 三位、23:00 一位', !!cc(8,12)&&cc(8,12).length===3&&cc(8,15).length===2&&cc(8,19.5).length===3&&cc(8,23).length===1, JSON.stringify([cc(8,12),cc(8,15),cc(8,19.5),cc(8,23)]));
{ let bad=[]; if(cc(1,12)) for(let d=1;d<=30;d++) for(const h of [9,12,15,19.5,23]) for(const i of cc(d,h)){ const q=seats[i]; if(!q||q.bar||q.sofa||i===5) bad.push(d+'/'+h+':'+i); }
  check('2. 只坐一般桌（不坐吧檯、沙發、學姊的 5 號）、不重複', !!cc(1,12)&&bad.length===0&&[1,5,9,20].every(d=>new Set(cc(d,12)).size===cc(d,12).length), bad.slice(0,5).join(' ')); }
check('3. 同一天同一時段同一批；換一天換人', !!cc(8,12)&&JSON.stringify(cc(8,12))===JSON.stringify(cc(8,12.5))&&JSON.stringify(cc(8,12))!==JSON.stringify(cc(9,12)));
{ const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  check('4. 兩點半用 S.cafeCustomers，客人記 seat', /for\(const i of S\.cafeCustomers\(G,seats\)\)\{ if\(quiet\) continue;[^\n]*isExtra:true,seat:\{x:s\.x,z:s\.z,yaw:s\.yaw,lv:0\}\}\)/.test(src)&&!/for\(const i of \[6\]\)\{ if\(quiet\) continue;/.test(src)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
