/* GG-LIT-12-1112（LAWWW2-C）：公館街景的亮窗 12 間都照營業時間暗；燒臘（G00 的立體店內）打烊變暗。
   node tests/gg_lit12_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8');
const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/gongguan_shops.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8'));
const ids=String((J.nodes.find(n=>n.name==='NOSHADOW_xs_fronts_lit').extras||{}).xsShops||'').split(',');
const real=(src.match(/mk\('G\d\d','([a-z_]+)','bldg\.[a-z_]+'/g)||[]).map(t=>/'G\d\d','([a-z_]+)'/.exec(t)[1]);   /* SHOP-REAL-INSIDE 公館第一批（11-12）：安泰、鮮果、榮恩典改成玻璃後面放室內模型（GG_SHOP_REAL），不再有亮窗卡——打烊由 Z3.shopInsideReal 調暗 */
ok(ids.length+real.length>=12,'① 街景模型的亮窗 '+ids.length+' 間（'+ids.join('、')+'）＋玻璃後面放室內模型的 '+real.length+' 間（'+real.join('、')+'）合計至少 12 間');
const m=/const GG_LIT_ZONE=(\{[^}]*\});/.exec(src); const MAP=vm.runInNewContext('('+m[1]+')'); const N=+(/const GG_LIT_N=(\d+);/.exec(src)||[])[1];
ok(N>=ids.length,'② 程式處理的間數 GG_LIT_N＝'+N+' ≥ '+ids.length+'（原本只處理前 8 間：第 9 間以後打烊不會暗）');
const c={Math}; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(R,'src/data/places.js'),'utf8').replace(/^const /mg,'var '),c); const P=c.PLACES;
const miss=ids.filter(k=>!MAP[k]); ok(miss.length===0,'③ 每一間都對到地點'+(miss.length?'；沒對到：'+miss.join('、'):''));
const RUNTIME={flower_notes:1};   /* 花序的營業時間是 flower_notes_sys3d.js 啟動時登記的（S.register） */
const noh=ids.filter(k=>MAP[k]&&!RUNTIME[MAP[k]]&&!(P.hours&&P.hours[MAP[k]])); ok(noh.length===0,'④ 對到的地點都有營業時間（places.js）'+(noh.length?'；沒有：'+noh.map(k=>MAP[k]).join('、'):''));
const a=src.indexOf('  function ggShopLit('), b=src.indexOf('  function attachWenzhouModel(',a), blk=src.slice(src.indexOf('  const GG_LIT_ZONE='),b);
ok(!/uShopLit\[9\]/.test(blk)&&(blk.match(/uniform float uShopLit\[17\]/g)||[]).length>=2,'⑤ 著色器的陣列長度 17（窗卡、光暈兩處）');
ok(!/i<9;i\+\+/.test(blk)&&/i<17;i\+\+/.test(blk),'⑥ 著色器裡找店編號的迴圈跑到 16');
ok(/i<ids\.length&&i<GG_LIT_N/.test(blk)&&/s<1\|\|s>GG_LIT_N/.test(blk),'⑦ 更新亮度、光暈分店都用 GG_LIT_N');
/* 燒臘 */
const g=/const GG_IN_PLACE=(\{[^}]*\});/.exec(src); const GI=g?vm.runInNewContext('('+g[1]+')'):{};
ok(GI.G00==='noodle'&&P.hours&&P.hours.noodle,'⑧ 燒臘：G00 → noodle，有營業時間');
ok(/mk\('G00','noodle','bldg\.shaola_interior'/.test(src),'⑨ 燒臘（G00）從街上看的是走進去的那一顆室內模型（GG_SHOP_REAL；第三批 11-12：原本街景模型裡簡化的 sk_in_G00 和店內不一樣），打烊由 Z3.shopInsideReal 調暗、拉鐵捲門');
ok(/attachWenzhouModel\(E,g,r,'ggShop','gongguan_shops_glb'\); shopInsideLit\(r,zone,GG_IN_PLACE\);/.test(src),'⑩ 公館接上街景模型以後呼叫 shopInsideLit');
ok(P.isOpen('noodle',12,3)===true&&P.isOpen('noodle',23.5,3)===false,'⑪ 燒臘 12:00 開、23:30 關');
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
