// PERF-ZONE-POPIN-1103（使用者 11-03：「進入新場景的時候 都會先出現畫質很爛的版本 卡一下才出現完整的 例如剛進去教室可能只有方塊 之後才會看出是椅子
//   溫州街地圖還沒讀取完畢 只是從咖啡廳出來 也會看到腳踏車自己在動」）——不需要瀏覽器。用法：node tests/zone_popin_wait_unit.js
//   ① 換區域時記下區域建立當下要的正式模型（ASSETS.reqStart／reqTake：loadOne 記 key）
//   ② ASSETS.waitLoaded：等那幾個還在載的 building 載好才回來（載好以後區域的 .then 先跑完）；超過 cap 就不等了（timedOut）；角色（vrm）、已經載好的不等
//   ③ game3d.js 的 GAME.enter：建區域前 reqStart、建完 reqTake；淡入（fade(false)）以前先 waitLoaded（不然第一次去的地方先看到方塊，GLB 到了才換）
// 修改前：ASSETS 沒有 reqStart／waitLoaded、enter 不等＝FAIL
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
  check('0. ASSETS 有 reqStart、reqTake、waitLoaded',typeof A.reqStart==='function'&&typeof A.reqTake==='function'&&typeof A.waitLoaded==='function');
  if(typeof A.reqStart!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  A.manifest['bldg.t_slow']={url:'x',type:'building'}; A.manifest['bldg.t_fast']={url:'x',type:'building'}; A.manifest['char.t_vrm']={url:'x',type:'vrm'}; A.manifest['bldg.t_hang']={url:'x',type:'building'};
  let attached=false;
  A.status['bldg.t_slow']=later(300,{scene:1}).then(v=>{ A.cache['bldg.t_slow']=v; return v; }); A.status['bldg.t_fast']=later(10,{scene:2}).then(v=>{ A.cache['bldg.t_fast']=v; return v; });
  A.status['char.t_vrm']=new Promise(()=>{}); A.status['bldg.t_hang']=new Promise(()=>{});
  A.reqStart(); A.loadOne('bldg.t_slow').then(()=>{ attached=true; }); A.loadOne('bldg.t_fast'); A.loadOne('char.t_vrm'); const keys=A.reqTake();
  check('① 區域建立當下要的模型都記下來了',['bldg.t_slow','bldg.t_fast','char.t_vrm'].every(k=>keys.includes(k))&&A._req===null,JSON.stringify(keys));
  const t0=Date.now(); const r=await A.waitLoaded(keys,5000);
  check('② 等到正式模型載好（約 0.3 秒），而且接上模型的 .then 已經跑完；角色 VRM 不等',!r.timedOut&&Date.now()-t0>=250&&Date.now()-t0<3000&&attached,JSON.stringify(r)+' attached='+attached);
  const r2=await A.waitLoaded(['bldg.t_hang'],200);
  check('② 載不好（網路卡住）：等到 cap 就不等了',r2.timedOut===true&&r2.waited>=180&&r2.waited<1500,JSON.stringify(r2));
  const r3=await A.waitLoaded(['bldg.t_slow','bldg.t_fast'],5000);
  check('② 已經載好的不等',r3.pending===0,JSON.stringify(r3));
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const i=g.indexOf('async function enter(zoneId,spawn,opts)'), body=g.slice(i,g.indexOf('return z; }',i));
  const iS=body.indexOf('ASSETS.reqStart()'), iL=body.indexOf('E.loadZone('), iT=body.indexOf('ASSETS.reqTake()'), iW=body.indexOf('ASSETS.waitLoaded('), iF=body.indexOf('await fade(false)');
  check('③ GAME.enter：建區域前 reqStart、建完 reqTake、淡入以前 waitLoaded',iS>=0&&iS<iL&&iL<iT&&iW>iT&&iW<iF,JSON.stringify({iS,iL,iT,iW,iF}));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
