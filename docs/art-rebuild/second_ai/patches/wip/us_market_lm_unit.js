// 美國草原超市（us_market）正式模型的光照貼圖＋窗景照時段變暗（INTERIOR-AAA-REVIEW-1028，LAWWW2 帳號 A 2026-11-02）——不需要瀏覽器。
// us3d.js 的 us_market 區域沒有走 attachRoomGLB（正式模型沒有會淡出的牆），光照貼圖另外用 Z3.roomLightmap 接。這支檢查：
//   ①extras.lightmap 的白天、晚上兩張都在
//   ②地板、天花板（鋼承板）、牆有第二套 UV（TEXCOORD_1）：沒有的話吃不到光照貼圖
//   ③商品、價格條、層板、水果、桁架、風管、發光面不烘（--nolm／--hide）：沒有第二套 UV，照舊即時光
//   ④us3d.js 載入正式模型以後有接光照貼圖（Z3.roomLightmap）
//   ⑤窗景（usm_outside_view，材質 GLOW_usm_outside）不算在整天都亮的燈裡、照時段變暗（viewTint）——原本晚上 20:30 窗外停車場還是白天
// 用法：node tests/us_market_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), REL='assets/models/env/second_ai/us_market.glb';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap;
const files=lm?['day','night'].map(k=>lm[k]):[];
check('① 光照貼圖：extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
const uv1=nm=>{ const nd=j.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const want=['usm_floor','usm_deck','WALL_usm_walls'], got=want.map(k=>[k,uv1(k)]);
check('② 地板、天花板、牆有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const live=['usm_products','usm_price','usm_shelves','usm_fruit_apple','usm_joists','usm_ducts','GLOW_usm_leds'].map(k=>[k,uv1(k)]);
check('③ 商品、價格條、層板、水果、桁架、風管、LED 發光面沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8');
const i0=src.indexOf("const us_market={"), i1=src.indexOf('const us_asian_market'), seg=i0>=0?src.slice(i0,i1>i0?i1:undefined):'';
check('④ us3d.js 的 us_market 載入正式模型後接光照貼圖（Z3.roomLightmap）',/Z3\.roomLightmap\(z,root,/.test(seg));
check('⑤ 窗景 usm_outside_view 照時段變暗（viewTint）、不算在整天都亮的燈裡',/usm_outside_view/.test(seg)&&/viewTint\(views,h\)/.test(seg)&&/glow=glow\.filter/.test(seg));
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
