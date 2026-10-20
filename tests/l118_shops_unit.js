// 118 巷的店走得進去（X66，LANE118-SHOPS-1020；使用者 2026-10-20：「118巷店員為什麼都站在店外 我要的是店裡可以進去 店員也在裡面阿」）——不需要瀏覽器。
//   LAWWW2-C 交了九間店的室內模型＋配置（43cf956a、d269942b），LAWWW-C 照它的測試接線接進遊戲：
//   1. src/data/l118_shop_layouts.js 和 LAWWW2 匯出的 l118_<id>.layout.json 一樣（tools/lane118/gen_shop_layouts.py --check）；九間都有；
//   2. 每間：出生點在店裡、不在「離開」的範圍上；離開回到 118 巷人行道（street.spawn_out）；有店員位置（clerk）、點餐（order）、座位；
//   3. src/l118_shops3d.js 註冊九個區域 l118_<id>，正式模型的檔案都在；
//   4. 巷子的店門口：營業時間「進○○」（exit 到 l118_<id>），沒開的時候照舊是店門口那個按鈕（L118.order 說鐵門拉下來一半）；
//   5. 店員在店裡（story3d.js 照 layout 的 clerk）；有室內配置的店，巷子裡不再站店員；
//   6. 門外的巷子（白天拍的圖）晚上調暗。
// 修改前 1～6 都 FAIL。用法：node tests/l118_shops_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const IDS=['dian','self','tea','home','cafe2','pasta','korea','omu','noodle2'];
// 1
let gen=null; try{ gen=cp.execFileSync('python3',[path.join(ROOT,'tools/lane118/gen_shop_layouts.py'),'--check'],{encoding:'utf8'}); }catch(e){ gen='FAIL '+(e.stdout||e.message); }
check('1. l118_shop_layouts.js 和 LAWWW2 的 layout.json 一樣（gen_shop_layouts.py --check）', /^OK /.test(gen||''), (gen||'').trim());
global.window=global;
const lf=path.join(ROOT,'src/data/l118_shop_layouts.js'); if(fs.existsSync(lf)) vm.runInThisContext(fs.readFileSync(lf,'utf8').replace(/^const L118_SHOP_LAYOUTS\s*=/m,'globalThis.L118_SHOP_LAYOUTS='),{filename:'l118_shop_layouts.js'});
const LS=global.L118_SHOP_LAYOUTS||{};
check('1. 九間都有室內配置', IDS.every(i=>LS[i]), Object.keys(LS).join(' '));
// 2
{ const bad=[]; for(const i of IDS){ const L=LS[i]; if(!L){ bad.push(i+':沒有'); continue; } const B=L.bounds, s=L.spawn, inB=q=>q&&q.x>B.x0&&q.x<B.x1&&q.z>B.z0&&q.z<B.z1;
    if(!inB(s)) bad.push(i+':出生點在店外'); if(!(L.exits||[]).length) bad.push(i+':沒有離開'); for(const X of L.exits||[]) if(Math.hypot(X.x-s.x,X.z-s.z)<=X.r) bad.push(i+':一進來就在離開上');
    if(!L.street||!L.street.spawn_out) bad.push(i+':沒有出店門的位置'); if(!L.clerk||!inB(L.clerk)) bad.push(i+':店員位置'); if(!L.order) bad.push(i+':沒有點餐'); if(!(L.seats||[]).length) bad.push(i+':沒有座位'); }
  check('2. 每間：出生點在店裡、不在離開上；回 118 巷人行道；有店員、點餐、座位', bad.length===0, bad.join(' ')); }
// 3
{ global.Z3={ZONES:{}}; global.ASSETS={manifest:{}}; global.P3={M:()=>({})};
  const sf=path.join(ROOT,'src/l118_shops3d.js'); let ok=false; if(fs.existsSync(sf)){ vm.runInThisContext(fs.readFileSync(sf,'utf8').replace(/^const L118S\s*=/m,'globalThis.L118S='),{filename:'l118_shops3d.js'}); ok=true; }
  const missing=IDS.filter(i=>!Z3.ZONES['l118_'+i]||!ASSETS.manifest['bldg.l118_'+i]||!fs.existsSync(path.join(ROOT,ASSETS.manifest['bldg.l118_'+i].url)));
  check('3. 九個區域 l118_<id> 註冊、正式模型的檔案都在', ok&&missing.length===0, missing.join(' '));
  check('3. index.html 載入 l118_shop_layouts.js、l118_shops3d.js（在 lane118.js 後面）', (()=>{ const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const a=h.indexOf('src/lane118.js'), b=h.indexOf('src/data/l118_shop_layouts.js'), c=h.indexOf('src/l118_shops3d.js'); return a>0&&b>a&&c>b; })());
  // 6
  const K=global.L118S&&global.L118S.viewK; check('6. 門外的巷子晚上調暗（22:00 0.32、12:00 1、18:15 中間）', !!K&&K(22)===0.32&&K(12)===1&&K(18.25)>0.32&&K(18.25)<1&&K(26)===0.32, K?[K(22),K(12),K(18.25).toFixed(2)].join():'沒有'); }
// 4
{ const z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('4. 店門口：營業時間「進○○」exit 到 l118_<id>（沒開藏起來）；沒開的時候是 L118.order 的按鈕；門口的按鈕比站在門口的常客優先（prio）', /prio:1,label:'進'\+nm\+'（'\+sh\.type\+'）',exit:\{to:'l118_'\+sh\.id,[^}]*\}\},get hidden\(\)\{ return !open118\(\); \}\}\)/.test(z)&&/prio:1,label:nm\+'（'\+sh\.type\+'）',shop118:sh\.id,get hidden\(\)\{ return open118\(\); \}\}\)/.test(z)); }
// 5
{ const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  check('5. 店員在店裡（l118_<id> 照 layout 的 clerk）；有室內配置時巷子裡不站店員', /if\(\/\^l118_\/\.test\(zoneId\)&&typeof L118_SHOP_LAYOUTS!=='undefined'\)\{[^\n]*clerk\(LL\.clerk\.x,LL\.clerk\.z,LL\.clerk\.yaw/.test(s)&&/if\(zoneId==='lane118'&&typeof L118_SHOP_LAYOUTS==='undefined'&&/.test(s)); }
// 7. 站在店門口的常客不擋「進○○」（BB-C 10-20：好家自助餐門口江明軒站著，按鈕變「和江明軒說話」）——用 engine3d.js 的 nearestInteractable 實際比
{ const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); const m=eng.match(/E\.nearestInteractable=function\(\)\{[\s\S]*?return best; \};/);
  if(m){ const mk=prio=>{ const E={levels:null,player:{lv:0,obj:{position:{x:0.3,y:0,z:0.5}}},interactables:[{x:0,z:0,radius:1.4,prio,label:'進好家自助餐（自助餐）',exit:{to:'l118_self'}}],npcs:[{talk(){},name:'江明軒',obj:{position:{x:0.6,y:0,z:0.6}}}]}; vm.runInNewContext(m[0],{E,Math}); return E.nearestInteractable(); };
    const withP=mk(1), noP=mk(undefined);
    check('7. 常客站在店門口旁邊：按鈕是「進好家自助餐」（門口 prio:1）；沒有 prio 的話會被「和江明軒說話」蓋掉', withP&&withP.label==='進好家自助餐（自助餐）'&&noP&&!!noP.npc, JSON.stringify([withP&&withP.label,noP&&noP.label])); }
  else check('7. engine3d.js 找得到 nearestInteractable', false); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
