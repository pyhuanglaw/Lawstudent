// PERF-COLD-1107（LAWWW2-B 11-07；LAWWW-B 08:41 選 (A)）：換區域淡入以前，NPC 的 VRM、動作檔也要等載好——不需要瀏覽器。用法：node tests/zone_wait_npc_unit.js
//   PC 冷快取量（CC-B PERF_COLD b987cb1cf）：原本只等 building、最多 6 s——溫州街淡入以後才 parseVRM（兩次共 3.7 s）、主模型第 18.5 s 才到、接上那一格 5.1 s（avg 8.8 fps）；
//   總圖大廳淡入後還有 12 個在載（3.1 fps）。先載好再淡入：溫州街 27.5 fps、總圖大廳 19.2 fps，黑畫面多 2～4 s。
//   ① ASSETS.waitLoaded 也等 vrm、clips（還在載的才等；別的類型照舊不等）
//   ② GAME.enter：STORY.populate（放 NPC、載他們的 VRM）在 reqTake 之前——NPC 的 VRM 才會進要等的清單；reqTake 在 waitLoaded 之前
//   ③ 等待上限：這次開遊戲第一次進這一區 12 s，再來 6 s（GM.zoneWaitCap；不用存檔的 G.visited）
// 修改前（開發分支 79214e4e1）：① ② ③ FAIL
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.document={ createElementNS:()=>({getContext:()=>null,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>null,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const A=ASSETS, later=(ms,v)=>new Promise(r=>setTimeout(()=>r(v),ms));
(async()=>{
  // ①
  A.manifest['char.w_npc']={url:'x',type:'vrm'}; A.manifest['char.w_clips']={url:'x',type:'clips'}; A.manifest['bldg.w_room']={url:'x',type:'building'}; A.manifest['misc.w_other']={url:'x',type:'character'};
  A.status['char.w_npc']=later(300,{vrm:1}).then(v=>{ A.cache['char.w_npc']=v; return v; });
  A.status['char.w_clips']=later(250,{clips:1}).then(v=>{ A.cache['char.w_clips']=v; return v; });
  A.status['bldg.w_room']=later(50,{scene:1}).then(v=>{ A.cache['bldg.w_room']=v; return v; });
  A.status['misc.w_other']=new Promise(()=>{});
  const t0=Date.now(); const r=await A.waitLoaded(['char.w_npc','char.w_clips','bldg.w_room','misc.w_other'],3000); const dt=Date.now()-t0;
  check('① waitLoaded 也等 NPC 的 VRM（0.3 s）、動作檔（0.25 s）；不在名單的類型照舊不等', r.pending===3&&!r.timedOut&&dt>=280&&dt<2000&&!!A.cache['char.w_npc']&&!!A.cache['char.w_clips'], JSON.stringify(r)+' '+dt+' ms');
  // ②
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const i=g.indexOf('async function enter(zoneId,spawn,opts)'), body=g.slice(i,g.indexOf('return z; }',i));
  const iP=body.indexOf('STORY.populate('), iT=body.indexOf('ASSETS.reqTake()'), iW=body.indexOf('ASSETS.waitLoaded(');
  check('② GAME.enter：STORY.populate（NPC 的 VRM）在 reqTake 之前，reqTake 在 waitLoaded 之前', iP>=0&&iP<iT&&iT<iW, JSON.stringify({iP,iT,iW}));
  // ③
  const m=/GM\.zoneWaitCap=function\(zoneId\)\{[^\n]*?\};/.exec(g), mc=/GM\.ZONE_LOAD_WAIT_FIRST_MS=(\d+)/.exec(g), md=/GM\.ZONE_LOAD_WAIT_MS=(\d+)/.exec(g);
  let caps=null; if(m&&mc&&md){ const GM={ZONE_LOAD_WAIT_FIRST_MS:+mc[1],ZONE_LOAD_WAIT_MS:+md[1]}; new Function('GM',m[0])(GM); caps=[GM.zoneWaitCap('wenzhou'),GM.zoneWaitCap('wenzhou'),GM.zoneWaitCap('library_hall'),GM.zoneWaitCap('wenzhou')]; }
  check('③ 等待上限：這次第一次進這一區 12 s、再來 6 s；換一區又是第一次', !!caps&&caps.join()==='12000,6000,12000,6000'&&body.includes('GM.zoneWaitCap(zoneId)'), JSON.stringify(caps));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
