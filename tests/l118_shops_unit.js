// 118 巷的店走得進去（X66，LANE118-SHOPS-1020；使用者 2026-10-20：「118巷店員為什麼都站在店外 我要的是店裡可以進去 店員也在裡面阿」）——不需要瀏覽器。
//   LAWWW2-C 交了九間店的室內模型＋配置（43cf956a、d269942b），LAWWW-C 照它的測試接線接進遊戲：
//   1. src/data/l118_shop_layouts.js 和 LAWWW2 匯出的 l118_<id>.layout.json 一樣（tools/lane118/gen_shop_layouts.py --check）；九間都有；
//   2. 每間：出生點在店裡、不在「離開」的範圍上；離開回到 118 巷人行道（street.spawn_out）；有店員位置（clerk）、點餐（order）、座位；
//   3. src/l118_shops3d.js 註冊九個區域 l118_<id>，正式模型的檔案都在；
//   4. 巷子的店門口：營業時間「進○○」（exit 到 l118_<id>），沒開的時候照舊是店門口那個按鈕（L118.order 說鐵門拉下來一半）；
//   5. 店員在店裡（story3d.js 照 layout 的 clerk）；有室內配置的店，巷子裡不再站店員；
//   6. 門外的巷子（白天拍的圖）晚上調暗。
//   9. AA_355 1-3：滇香小館牆上的織布點了有字（修改前 FAIL：只顯示「牆上的織布」）
//   9b. AA_355 5-1：自取的湯（兩間）、書架、小菜櫃（兩間）點了有字（修改前 FAIL：只顯示名稱）
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
  const K=global.L118S&&global.L118S.viewK; check('6. 門外的巷子晚上調暗（22:00 0.32、12:00 1、18:15 中間）', !!K&&K(22)===0.32&&K(12)===1&&K(18.25)>0.32&&K(18.25)<1&&K(26)===0.32, K?[K(22),K(12),K(18.25).toFixed(2)].join():'沒有');
  /* 6b. 門外的照片不受店裡的燈影響（BB-C 10-20：晚上從玻璃門看出去是白天的亮度——店裡的燈照亮了照片）：改成自己發光（color 黑、emissiveMap＝照片），晚上 emissiveIntensity 0.32 */
  { const S=global.L118S; const c=()=>({r:1,g:1,b:1,setRGB(r,g,b){ this.r=r; this.g=g; this.b=b; return this; },copy(o){ this.r=o.r; this.g=o.g; this.b=o.b; return this; },clone(){ return c().copy(this); },multiplyScalar(k){ this.r*=k; this.g*=k; this.b*=k; return this; }});
    const tex={}, m={name:'l118_tea_view',map:tex,color:c(),emissive:c().setRGB(0,0,0),emissiveIntensity:1,userData:{}}, mesh={isMesh:true,name:'WALL_S_view',material:m};
    const ok=!!S&&!!S.viewMats&&!!S.setView; let v=[]; if(ok){ v=S.viewMats({traverse(f){ f(mesh); }}); S.setView(v,20.5); }
    check('6b. 門外的照片：自己發光（顏色黑、emissiveMap＝照片），20:30 亮度 0.32（店裡的燈照不亮它）', ok&&v.length===1&&m.color.r===0&&m.emissiveMap===tex&&m.emissive.r===1&&Math.abs(m.emissiveIntensity-0.32)<1e-9, ok?JSON.stringify({c:m.color.r,e:m.emissiveIntensity}):'沒有 viewMats／setView');
    if(ok){ S.setView(v,12); check('6b. 中午亮度 1', m.emissiveIntensity===1); } }
  /* 9. AA_355 1-3（AA-C 2026-10-21）：滇香小館牆上的織布點了有字（配置檔的 note 是空的，原本只顯示「牆上的織布」）*/
  { const S=global.L118S, q=(LS.dian&&LS.dian.interact||[]).find(x=>x.id==='tapestry'), t=S&&S.lookText&&q?S.lookText('dian',q):null;
    check('9. AA_355 1-3 牆上的織布：「（牆上掛著一塊條紋織布，紅色和深藍色，顏色洗得有點淡了。）」', t==='（牆上掛著一塊條紋織布，紅色和深藍色，顏色洗得有點淡了。）', String(t)); }
  /* 9b. AA_355 5-1（AA-C 2026-10-21 2f1aaa22）：還沒有字的物件——自取的湯（第一間＝好家自助餐、第二間＝巷口家常菜）、書架（慢讀咖啡）、小菜櫃（第一間＝韓食小廚、第二間＝六張犁麵舖）；
     「第一間、第二間」照配置檔的順序。電視照配置檔的 note（AA_280）、餐盤回收台照舊顯示名稱（修改前 FAIL：五個都只顯示名稱）*/
  { const S=global.L118S, it=(sh,k)=>(LS[sh]&&LS[sh].interact||[]).find(x=>x.id===k), lk=(sh,k)=>S&&S.lookText&&it(sh,k)?S.lookText(sh,it(sh,k)):null;
    const want=[['self','soup','（自取的湯，今天是蘿蔔湯。鍋邊貼著「請自取，不要浪費」。）'],['home','soup','（湯桶上寫著「紫菜蛋花」。湯勺掛在桶邊。）'],['cafe2','books','（書架上大多是舊漫畫，有幾套缺了第一集。）'],
      ['korea','banchan','（小菜櫃裡有海帶、豆干、滷蛋。豆干只剩兩塊。）'],['noodle2','sides','（小菜櫃的玻璃起霧了，看得到裡面的燙青菜。）']];
    const bad=want.filter(([sh,k,t])=>lk(sh,k)!==t);
    check('9b. AA_355 5-1：118 巷五個物件點了有字（湯兩間、書架、小菜櫃兩間）；電視照舊是 AA_280 那句、餐盤回收台照舊顯示名稱', !bad.length&&lk('home','tv')==='電視在播午間新聞，沒有人在看。'&&lk('self','return')==='餐盤回收台', bad.map(x=>x[0]+'/'+x[1]+'='+lk(x[0],x[1])).join('｜')); } }
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
// 8. 店裡的椅子：「坐下」比只是看的東西（電視、自取的湯）優先（BB-C 10-20 家常菜：(-2.6,-2.94) 那張椅子，站在椅子後面要坐下，按鈕變「自取的湯」）——
//    椅子 prio 0.3、看的東西 prio −0.3（l118_shops3d.js）；用 engine3d.js 的 nearestInteractable 實際比：
//    站在那張椅子後面 0.6 m（前面是桌子，GAME.seatApproach 的第二個位置）＝「坐下」；站在湯的前面＝「自取的湯」；兩邊都沒有 prio 的話椅子後面是「自取的湯」
{ const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'), sh=fs.readFileSync(path.join(ROOT,'src/l118_shops3d.js'),'utf8'); const m=eng.match(/E\.nearestInteractable=function\(\)\{[\s\S]*?return best; \};/);
  const ps=sh.match(/IT\.push\(\{x:s\.x,z:s\.z,radius:0\.7,lv:0,(?:prio:(-?[\d.]+),)?seat:st,/), pl=sh.match(/for\(const q of L\.interact\) IT\.push\(\{x:q\.x,z:q\.z,radius:q\.r,lv:0,(?:prio:(-?[\d.]+),)?label:q\.label/);
  const pS=ps&&ps[1]?+ps[1]:0, pL=pl&&pl[1]?+pl[1]:0, H=LS.home;
  if(m&&H){ const at=(x,z,a,b)=>{ const its=H.seats.map(q=>({x:q.x,z:q.z,radius:0.7,lv:0,prio:a,seat:{x:q.x,z:q.z,yaw:q.yaw},label:'坐下'})).concat(H.interact.map(q=>({x:q.x,z:q.z,radius:q.r,lv:0,prio:b,label:q.label})));
      const E={levels:null,player:{lv:0,obj:{position:{x,y:0,z}}},interactables:its,npcs:[]}; vm.runInNewContext(m[0],{E,Math}); const r=E.nearestInteractable(); return r&&r.label; };
    const back=at(-2.6,-3.54,pS,pL), soup=at(-2.7,-3.75,pS,pL), old=at(-2.6,-3.54,0,0);
    check('8. 巷口家常菜 (-2.6,-2.94) 的椅子：站在椅子後面＝「坐下」、站在湯前面＝「自取的湯」；（兩邊都沒有 prio 的話椅子後面是「自取的湯」）', back==='坐下'&&soup==='自取的湯'&&old==='自取的湯', JSON.stringify({pS,pL,back,soup,old})); }
  else check('8. 找得到 nearestInteractable、巷口家常菜的配置', false); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
