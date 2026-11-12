/* GG-LIT-12-1112（LAWWW2-C）：公館街景的亮窗 12 間都照營業時間暗；燒臘（G00 的立體店內）打烊變暗。
   node tests/gg_lit12_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8');
const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/gongguan_shops.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8'));
const ids=String((J.nodes.find(n=>n.name==='NOSHADOW_xs_fronts_lit').extras||{}).xsShops||'').split(',');
ok(ids.length>=12,'① 街景模型的亮窗有 '+ids.length+' 間：'+ids.join('、'));
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
ok(J.nodes.some(n=>n.name==='sk_in_G00'),'⑨ 街景模型有 sk_in_G00（燒臘的立體店內）');
ok(/attachWenzhouModel\(E,g,r,'ggShop','gongguan_shops_glb'\); shopInsideLit\(r,zone,GG_IN_PLACE\);/.test(src),'⑩ 公館接上街景模型以後呼叫 shopInsideLit');
ok(P.isOpen('noodle',12,3)===true&&P.isOpen('noodle',23.5,3)===false,'⑪ 燒臘 12:00 開、23:30 關');
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
