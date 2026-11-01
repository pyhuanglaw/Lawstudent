// 舊路書房（二手書店）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// zones3d.js 的 bookstore 用 attachRoomGLB 接 bookstore_interior.glb，看到場景的 extras.lightmap 就接光照貼圖（Z3.roomLightmap）。這支檢查：
//   ①extras.lightmap 的白天、晚上兩張都在
//   ②地板、天花板、樑、四面牆、書架、櫃台桌有第二套 UV（TEXCOORD_1）：沒有的話這些面吃不到光照貼圖
//   ③書（一萬五千多個三角形）、燈罩、檯燈、吊燈電線、黃銅、手寫牌不烘（--nolm）：沒有第二套 UV，照舊即時光
//   ④attachBookstoreInterior 的補光（BK_BOUNCE：牆、地板、書架、桌子、天花板一層均勻的自發光）在有光照貼圖時不加——
//     和便利商店 CVS_BOUNCE 一樣：這層自發光會把書架底下、桌子底下的影子洗掉
// 用法：node tests/bookstore_interior_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), REL='assets/models/env/second_ai/bookstore_interior.glb';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap;
const files=lm?['day','night'].map(k=>lm[k]):[];
check('① 光照貼圖：extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
const uv1=nm=>{ const nd=j.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const want=['bk_floor','bk_ceiling','bk_beams','bk_shelf','bk_table','WALL_back_wall','WALL_front_wall','WALL_left_wall','WALL_right_wall'], got=want.map(k=>[k,uv1(k)]);
check('② 地板、天花板、樑、四面牆、書架、櫃台桌有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const live=['bk_books','bk_lampshade','bk_lamp_brass','bk_black','WALL_back_SIGN_FACE_note'].map(k=>[k,uv1(k)]);
check('③ 書、燈罩、黃銅、黑色小零件、手寫牌沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), i=src.indexOf('function attachBookstoreInterior'), body=i>=0?src.slice(i,src.indexOf('\n  // ----------',i)):'';
check('④ attachBookstoreInterior：有光照貼圖的材質不加補光（BK_BOUNCE）',/BK_BOUNCE\[nm\];\s*if\(b&&!mt\.lightMap\)\s*TK\.bounce/.test(body),body?'':'找不到 attachBookstoreInterior');
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
