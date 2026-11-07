// 走到出口附近先下載那一區的正式模型（PERF-COLD-1107 (B)，LAWWW2-B 2026-11-07；LAWWW-B 08:41／09:04 排在 (A) 之後）——不需要瀏覽器。
//   (A) 讓第一次進一個區域時黑畫面等模型載好再淡入（PC 冷快取：溫州街黑 18 s、總圖大廳 12 s）；(B) 讓下載那一段在玩家走過去的路上先做完：
//   只下載進瀏覽器快取，不解析、不留在記憶體；進去時 loadOne 的 fetch 讀快取。
//   1. src/data/zone_assets.js 是最新的（tools/gen_zone_assets.js --check：照 index.html 載入全部 script、建每一個區域、記下要的正式模型）；過期只印 WARN、不算 FAIL（LAWWW-B 11-07），發布前重跑；
//   2. 一次只下載一個，照排隊的順序；讀 body 邊讀邊丟（有 getReader 就不呼叫 arrayBuffer）；記下每個的大小；
//   3. 已經載好（cache）、正在載（status）、下載過、正在下載、排隊中的不重複下載；
//   4. 下載失敗記 −1、不重試；
//   5. 省流量模式、2G／3G 不下載；
//   6. prefetchStop（換區域）清掉排隊的，正在下載的那一個照常下載完；
//   7. 這次開遊戲下載超過上限就停；
//   8. prefetchNear：30 m 內最近、模型還沒下載的出口那一區；太遠、全部載好、正在下載時不排；不排現在這一區；
//      還有正式模型在載（loadOne 還沒有結果）時不排，載完（成功或失敗）才排；
//   9. game3d.js：frame 每 1 秒（真實時間）呼叫 prefetchNear（不在標題畫面、不在換區域）；enter 在 reqStart 後面呼叫 prefetchStop；
//  10. index.html 在 game3d.js 前面載入 zone_assets.js。
// 修改前 FAIL（沒有 A.prefetch、zone_assets.js）。用法：node tests/zone_prefetch_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={createElement:()=>({getContext:()=>null,style:{}}),createElementNS:()=>({style:{}}),getElementById:()=>null,addEventListener(){}};
global.navigator={userAgent:'node'}; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{}); console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 1. 資料是最新的
{ const r=cp.spawnSync(process.execPath,[path.join(ROOT,'tools/gen_zone_assets.js'),'--check'],{cwd:ROOT,encoding:'utf8',timeout:600000});
  /* LAWWW-B 11-07 10:0x 定：過期不擋（別的職位換 GLB 以後全套會整片紅，後果只是少預先下載幾個）＝印 WARN；發布前清單（docs/TESTING.md 第五節）重跑 node tools/gen_zone_assets.js */
  if(r.status===0) check('1. src/data/zone_assets.js 是最新的（tools/gen_zone_assets.js --check）', true, ((r.stdout||'')+(r.stderr||'')).trim().slice(0,200));
  else console.log('WARN 1. src/data/zone_assets.js 過期（換了區域的 GLB）：發布前重跑 node tools/gen_zone_assets.js　'+((r.stdout||'')+(r.stderr||'')).trim().slice(0,200)); }
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/assets3d.js','src/data/zone_assets.js']){ const p=path.join(ROOT,f); if(!fs.existsSync(p)) continue; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const A=ASSETS, tick=()=>new Promise(r=>setTimeout(r,0)), settle=async(n)=>{ for(let i=0;i<(n||20);i++) await tick(); };
if(typeof A.prefetch!=='function'){ check('2～8. ASSETS.prefetch 存在',false); finish(); }
else (async()=>{
  // 假的 fetch：每個網址回幾塊資料；hold 為真時停在那裡，等測試放行；記下同時有幾個在下載
  let calls=[], live=0, maxLive=0, arrayBufferCalls=0, hold=false; const waiting=[];
  global.fetch=(url,opt)=>{ calls.push(url); live++; maxLive=Math.max(maxLive,live); const bad=/bad/.test(url);
    const go=()=>{ const chunks=bad?[]:[new Uint8Array(1000),new Uint8Array(234)]; let i=0;
      return {ok:!bad,status:bad?404:200,arrayBuffer:()=>{ arrayBufferCalls++; return Promise.resolve(new ArrayBuffer(1234)); },
        body:{getReader:()=>({read:()=>Promise.resolve(i<chunks.length?{done:false,value:chunks[i++]}:(live--,{done:true}))})}}; };
    if(bad){ live--; return Promise.resolve(go()); }
    return hold?new Promise(res=>waiting.push(()=>res(go()))):Promise.resolve(go()); };
  const M={}; for(const k of ['t.a','t.b','t.c','t.d','t.e','t.bad','t.big1','t.big2','t.big3']) M[k]={url:'u/'+k+'.glb',type:'building',lazy:true};
  Object.assign(A.manifest,M);
  // 2. 一次一個、照順序、邊讀邊丟
  hold=true; const n2=A.prefetch(['t.a','t.b','t.c']); await settle();
  const one=calls.length===1&&calls[0]==='u/t.a.glb';
  hold=false; while(waiting.length) waiting.shift()(); await settle(60);
  check('2. 一次只下載一個、照順序；邊讀邊丟（不呼叫 arrayBuffer）；記下大小', n2===3&&one&&maxLive===1&&calls.join()==='u/t.a.glb,u/t.b.glb,u/t.c.glb'&&arrayBufferCalls===0&&A.prefetched['t.a']===1234&&A.prefetchBytes===3*1234,
    JSON.stringify({n2,one,maxLive,calls,arrayBufferCalls,pre:A.prefetched,bytes:A.prefetchBytes}));
  // 3. 不重複
  calls=[]; A.cache['t.d']={}; A.status['t.e']=Promise.resolve(); const n3=A.prefetch(['t.a','t.a','t.d','t.e']); await settle();
  check('3. 已經載好、正在載、下載過的不重複下載', n3===0&&calls.length===0, JSON.stringify({n3,calls}));
  delete A.cache['t.d']; delete A.status['t.e'];
  // 4. 失敗不重試
  calls=[]; A.prefetch(['t.bad']); await settle(); const first=calls.length; A.prefetch(['t.bad']); await settle();
  check('4. 下載失敗記 −1、不重試', first===1&&calls.length===1&&A.prefetched['t.bad']===-1, JSON.stringify({calls,v:A.prefetched['t.bad']}));
  // 5. 省流量、慢網路
  calls=[]; global.navigator.connection={saveData:true}; const n5a=A.prefetch(['t.d']); global.navigator.connection={effectiveType:'3g'}; const n5b=A.prefetch(['t.d']);
  global.navigator.connection={effectiveType:'slow-2g'}; const n5c=A.prefetch(['t.d']); global.navigator.connection={effectiveType:'4g'}; await settle();
  check('5. 省流量模式、2G／3G 不下載（4G 才下載）', n5a===0&&n5b===0&&n5c===0&&calls.length===0&&A.prefetchOK()===true, JSON.stringify({n5a,n5b,n5c,calls}));
  // 6. 換區域：清掉排隊的，正在下載的下載完
  calls=[]; hold=true; A.prefetch(['t.d','t.e']); await settle(); const inflight=calls.slice(); A.prefetchStop(); hold=false; while(waiting.length) waiting.shift()(); await settle(60);
  check('6. prefetchStop 清掉排隊的，正在下載的那一個照常下載完', inflight.join()==='u/t.d.glb'&&calls.join()==='u/t.d.glb'&&A.prefetched['t.d']===1234&&A.prefetched['t.e']===undefined, JSON.stringify({inflight,calls,pre:A.prefetched}));
  // 7. 上限
  calls=[]; const keep=A.PREFETCH_MAX_BYTES; A.PREFETCH_MAX_BYTES=A.prefetchBytes+1500; A.prefetch(['t.big1','t.big2','t.big3']); await settle(80);
  check('7. 這次開遊戲下載超過上限（PREFETCH_MAX_BYTES）就停', calls.join()==='u/t.big1.glb,u/t.big2.glb'&&A.prefetched['t.big3']===undefined&&A._pf.q.length===0, JSON.stringify({calls}));
  A.PREFETCH_MAX_BYTES=keep;
  // 8. prefetchNear
  calls=[]; const ZA=global.ZONE_ASSETS; global.ZONE_ASSETS={here:['t.e'],far:['n.far'],near:['n.near1','n.near2'],loaded:['n.loaded'],mid:['n.mid']};
  for(const k of ['n.far','n.near1','n.near2','n.loaded','n.mid']) A.manifest[k]={url:'u/'+k+'.glb',type:'building',lazy:true}; A.cache['n.loaded']={};
  const E={player:{obj:{position:{x:0,y:0,z:0}}},interactables:[{x:40,z:0,exit:{to:'far'}},{x:0,z:12,exit:{to:'mid'}},{x:3,z:4,exit:{to:'loaded'}},{x:0,z:2,exit:{to:'here'}},{x:-8,z:0,exit:{to:'near'}},{x:1,z:1,label:'書架'}]};
  hold=true; const b1=A.prefetchNear(E,'here'); await settle(); const b2=A.prefetchNear(E,'here');   // 正在下載：不排新的
  hold=false; while(waiting.length) waiting.shift()(); await settle(80); const c1=calls.slice();
  const b3=A.prefetchNear(E,'here'); await settle(80); const b4=A.prefetchNear(E,'here'); await settle(40);
  E.player.obj.position.x=100; const b5=A.prefetchNear(E,'here');
  // 還有模型在載：不排；載完（這裡用失敗）才排
  E.player.obj.position.x=0; A.manifest['n.late']={url:'u/n.late.glb',type:'building',lazy:true}; global.ZONE_ASSETS.late=['n.late']; E.interactables.push({x:0,z:6,exit:{to:'late'}});
  let rejLoad; A.status['x.loading']=new Promise((r,j)=>{ rejLoad=j; }); A.status['x.loading'].catch(()=>{});
  const b6=A.prefetchNear(E,'here'); rejLoad(new Error('x')); await settle(); const b7=A.prefetchNear(E,'here'); await settle(40);
  global.ZONE_ASSETS=ZA;
  check('8. prefetchNear：30 m 內最近、還沒下載的出口那一區（全部載好的、現在這一區、太遠的不排；正在下載、還有模型在載時不排）',
    b1==='near'&&b2===null&&c1.join()==='u/n.near1.glb,u/n.near2.glb'&&b3==='mid'&&b4===null&&b5===null&&b6===null&&b7==='late'&&calls.join()==='u/n.near1.glb,u/n.near2.glb,u/n.mid.glb,u/n.late.glb'&&A.prefetched['n.far']===undefined,
    JSON.stringify({b1,b2,b3,b4,b5,b6,b7,calls}));
  finish();
})();
function finish(){
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  const fr=(g.match(/function frame\(now\)\{[\s\S]*?\n    \/\/ 腳步聲/)||[''])[0];
  check('9a. game3d.js frame：每 1 秒（真實時間）呼叫 ASSETS.prefetchNear，不在標題畫面、不在換區域', /!GM\.titleIdle&&!entering&&typeof ASSETS!=='undefined'&&ASSETS\.prefetchNear&&\(GM\._pfT=\(GM\._pfT\|\|0\)-realDt\)<0\)\{ GM\._pfT=1; try\{ ASSETS\.prefetchNear\(E,G\.zone\);/.test(fr));
  const en=(g.match(/async function enter\(zoneId,spawn,opts\)\{[\s\S]*?GM\.enter=enter;/)||[''])[0];
  check('9b. game3d.js enter：reqStart 後面呼叫 prefetchStop（排隊的不下載了）', /ASSETS\.reqStart\(\); if\(typeof ASSETS!=='undefined'&&ASSETS\.prefetchStop\) ASSETS\.prefetchStop\(\);/.test(en));
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), iz=h.indexOf('src="src/data/zone_assets.js'), ig=h.indexOf('src="src/game3d.js');
  check('10. index.html 在 game3d.js 前面載入 zone_assets.js', iz>0&&ig>iz);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}
