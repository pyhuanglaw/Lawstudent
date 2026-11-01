// 日日便利室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// zones3d.js 的 cvs 用 attachRoomGLB 接 cvs_interior.glb，看到場景的 extras.lightmap 就接光照貼圖（Z3.roomLightmap）。這支檢查：
//   ①extras.lightmap 的白天、晚上兩張都在
//   ②地板、天花板、四面牆、貨架、櫃檯有第二套 UV（TEXCOORD_1）：沒有的話這些面吃不到光照貼圖
//   ③LED 燈條、飲料櫃背光、商品（四萬多個三角形）、分類牌、價格條不烘（--nolm）：沒有第二套 UV，照舊即時光
//   ④attachCvsInterior 的補光（CVS_BOUNCE：牆、地板、貨架、櫃檯一層均勻的自發光）在有光照貼圖時不加——
//     第一次試烘焙時這層自發光把貨架底下、櫃檯正面的影子洗掉，看起來和沒烘一樣（和宿舍四人房 DORM_BOUNCE 同一個做法）
// 用法：node tests/cvs_interior_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), REL='assets/models/env/second_ai/cvs_interior.glb';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap;
const files=lm?['day','night'].map(k=>lm[k]):[];
check('① 光照貼圖：extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
const uv1=nm=>{ const nd=j.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const want=['cvs_floor','cvs_ceiling','cvs_shelf','cvs_counter','WALL_back_wall','WALL_front_wall','WALL_left_wall','WALL_right_wall'], got=want.map(k=>[k,uv1(k)]);
check('② 地板、天花板、四面牆、貨架、櫃檯有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const live=['cvs_led','cvs_cooler_light','cvs_goods_items','cvs_goods','cvs_tag','SIGN_FACE_aisle0a'].map(k=>[k,uv1(k)]);
check('③ 燈條、飲料櫃背光、商品、價格條、分類牌沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), i=src.indexOf('function attachCvsInterior'), body=i>=0?src.slice(i,src.indexOf('\n  // ----------',i)):'';
check('④ attachCvsInterior：有光照貼圖的材質不加補光（CVS_BOUNCE）',/CVS_BOUNCE\[nm\];\s*if\(b&&!mt\.lightMap\)\s*TK\.bounce/.test(body),body?'':'找不到 attachCvsInterior');
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
