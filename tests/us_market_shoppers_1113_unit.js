// US-MARKET-SHOPPERS-1113（BB_379 GATE_NEW3：美國兩間超市「沒人看起來很空」；D99 ② 美國交換）：story3d.js populate 在草原超市（營業中）、竹葉亞洲超市放逛貨架的客人，
// 路線＝配置的互動點（不含結帳、推車、服務台）；店員照舊（收銀台後面，GATE_NEW3 的「人數 0」是探針只數鏡頭裡看得到的人——店員在入口背後）。用法：node tests/us_market_shoppers_1113_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
check('1. 兩間超市都有店員（收銀台／櫃台後面）',/zoneId==='us_market'&&sh831\('us_market'\)\)\{ clerk\(/.test(src)&&/zoneId==='us_asian_market'\) clerk\(/.test(src));
check('2. 客人：草原超市營業中、亞洲超市；路線用配置的互動點、去掉結帳／推車／服務台',/\(zoneId==='us_market'&&sh831\('us_market'\)\)\|\|zoneId==='us_asian_market'/.test(src)&&/filter\(q=>!\/checkout\|carts\|service\/\.test\(q\.id\)\)/.test(src)&&/usShopper:true/.test(src));
global.window=global; eval(fs.readFileSync(path.join(ROOT,'src/data/us_layouts.js'),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='));
for(const k of ['US_MARKET_LAYOUT','US_ASIAN_MARKET_LAYOUT']){ const L=globalThis[k]; const pts=(L&&L.interact||[]).filter(q=>!/checkout|carts|service/.test(q.id)); const B=L&&L.bounds;
  check('3. '+k+' 路線點 ≥3、都在店裡',pts.length>=3&&!!B&&pts.every(q=>q.x>B.x0&&q.x<B.x1&&q.z>B.z0&&q.z<B.z1),pts.length+' 點'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
