// 宿舍房間：溫州街打工、故事線留下來的六件東西（ART-WZ6；AA_420 第 9 節，DL-11；dorm_wz_items.glb，LAWWW2-B 2026-10-24）——不需要瀏覽器。
// ①JOBS.roomKeys（jobs3d.js）照旗標列出現在有哪幾件（一小罐茶送出去以後 WZ_TEA_GIVEN 就沒有），S.room 的文字也照它；
// ②模型的節點 ITEM_wz_<key> 和 WZ_JOBS_DATA.room 的六個 key 一一對應；牆上那兩件的網格叫 WALL_left_*（跟左牆淡出）；
// ③位置（dorm_wz_items.json 的 pos）放在桌面（0.76）、層架頂（1.42）、牆面（x −2.90）上，不和大三、大四拆出來的東西（dorm_y3_items.json）、黃金葛（prop_pothos.json）疊在一起；
// ④zones3d.js 的 dorm 區域有接上（loadWzItems：搬家、收拾的那幾天收起來）。
// 修改前：jobs3d.js 沒有 roomKeys、沒有模型（第 1 項就失敗）。用法：node tests/dorm_wz_items_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/wz_jobs.js'),'utf8').replace(/^const WZ_JOBS_DATA\s*=/m,'globalThis.WZ_JOBS_DATA='));
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/jobs3d.js'),'utf8').replace(/^const JOBS\s*=/m,'globalThis.JOBS='));
check('1. JOBS.roomKeys 存在',typeof JOBS!=='undefined'&&typeof JOBS.roomKeys==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const K=f=>JOBS.roomKeys({flags:f}).join(',');
check('1. 沒有旗標＝沒有東西',K({})==='');
check('1. 六件都有',K({WZ_ITEM_TIMER:300,WZ_ITEM_NOTEBOOK:300,WZ_ITEM_TEA:300,WZ_CARD:true,WZ_YE_DONE:true,WZ_POSTER_ITEM:true})==='timer,notebook,tea,card,board,poster');
check('1. 茶送出去以後（WZ_TEA_GIVEN）就沒有那罐茶',K({WZ_ITEM_TEA:300,WZ_TEA_GIVEN:'heroine_02'})==='');
{ const L=[]; JOBS.room({flags:{WZ_ITEM_TIMER:1,WZ_CARD:true}},L); check('1. S.room 的文字照 roomKeys（計時器、卡片）',L.length===2&&L[0][0]===WZ_JOBS_DATA.room.timer[0]&&L[1][0]===WZ_JOBS_DATA.room.card[0]); }
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)); const l=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+l).toString('utf8')); };
const J=glb('assets/models/env/second_ai/dorm_wz_items.glb'), N=J.nodes;
const keys=Object.keys(WZ_JOBS_DATA.room); const names=N.map(n=>n.name);
check('2. 模型的節點 ITEM_wz_<key> 和 WZ_JOBS_DATA.room 一一對應（'+keys.join('、')+'）',keys.every(k=>names.includes('ITEM_wz_'+k))&&names.filter(n=>/^ITEM_wz_/.test(n)).length===keys.length);
{ const wallKid=k=>{ const i=names.indexOf('ITEM_wz_'+k); return (N[i].children||[]).map(c=>N[c]).find(c=>/^WALL_left_/.test(c.name)); };
  const ok=['board','poster'].every(k=>{ const m=wallKid(k); return !!m&&m.extras&&Array.isArray(m.extras.dir)&&m.extras.dir[0]===1; });
  check('2. 牆上那兩件（白板照片、海報）的網格叫 WALL_left_*、dir [1,0,0]',ok); }
const P=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_wz_items.json'),'utf8')).pos;
const Y3=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_y3_items.json'),'utf8')).pos;
const pot=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/prop_pothos.json'),'utf8'));
const box=k=>P['ITEM_wz_'+k];
check('3. 計時器、卡片在書桌上（底 0.760～0.765）',['timer','card'].every(k=>box(k).min[1]>=0.759&&box(k).min[1]<=0.765));
check('3. 筆記本、茶罐在層架頂（底 1.42）、不碰到上舖床板（1.56）',['notebook','tea'].every(k=>Math.abs(box(k).min[1]-1.42)<0.002&&box(k).max[1]<1.555));
check('3. 照片、海報貼在左牆上（x −2.90～−2.897）',['board','poster'].every(k=>box(k).min[0]>=-2.9&&box(k).max[0]<=-2.896));
check('3. 書桌、層架的範圍裡（z −0.96～0.34；層架頂 z −0.51～0.19）',box('timer').max[2]<0.34&&box('card').min[2]>-0.96&&['notebook','tea'].every(k=>box(k).min[2]>=-0.51&&box(k).max[2]<=0.19));
const ov=(a,b,e)=>a.min.every((v,i)=>v<b.max[i]-e)&&a.max.every((v,i)=>v>b.min[i]+e);
{ const bad=[]; for(const k of keys) for(const [n,b] of Object.entries(Y3)) if(ov(box(k),b,0.0005)) bad.push(k+'×'+n); check('3. 不和大三、大四的東西疊在一起（卡片放在前緣那一疊紙「上面」：紙最上面 0.7629、卡片底 0.7635）',!bad.length,bad.join('、')); }
{ const pl=pot.place, r=pot.size_m.saucer_d/2+0.03, pb={min:[pl.x-r,pl.y,pl.z-r],max:[pl.x+r,pl.y+0.25,pl.z+r]}; const bad=keys.filter(k=>ov(box(k),pb,0)); check('3. 不碰到黃金葛（盆＋盤子外面 3 cm）',!bad.length,bad.join('、')); }
{ const z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'); check('4. zones3d.js 的 dorm 有接上（loadWzItems、bldg.dorm_wz_items、搬家收拾時收起來）',/function loadWzItems\(/.test(z)&&/bldg\.dorm_wz_items/.test(z)&&/ROOM_Y2_MOVING\|\|F\.ROOM_Y3_MOVING\|\|F\.ROOM_Y4_MOVING\|\|F\.PACKED_Y4/.test(z)&&/loadWzItems\(z,g0,E\)/.test(z));
  const a=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8'); check('4. 資產清單有 bldg.dorm_wz_items',/'bldg\.dorm_wz_items':\{url:'assets\/models\/env\/second_ai\/dorm_wz_items\.glb'/.test(a)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
