// 手機貼圖縮小後，釋放全尺寸原圖（BUG-IOS-RELOAD ③；src/assets3d.js 的 capTextures）——不需要瀏覽器。
// iOS 17 以上 GLTFLoader 用 ImageBitmap 載貼圖：縮成 1024／512 換上以後，原圖如果沒有別的貼圖在用就 close()；還有貼圖在用（沒超過上限的那一張）不 close；換上的縮圖保留（context 掉了重傳用）。
// 修改前：原圖一直留著（capImg 是 Map、沒有 close）。用法：node tests/tex_cap_close_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:'?texcap'}; global.navigator={userAgent:'node',maxTouchPoints:0};
let drawn=0; global.document={ createElement:()=>({width:0,height:0,getContext:()=>({drawImage(){ drawn++; }})}), getElementById:()=>null, addEventListener(){} };
class ImageBitmap{ constructor(w,h){ this.width=w; this.height=h; this.closed=false; } close(){ this.closed=true; this.width=0; this.height=0; } }
global.ImageBitmap=ImageBitmap;
let src=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8').replace(/^const ASSETS\s*=/m,'globalThis.ASSETS=');
vm.runInThisContext(src,{filename:'assets3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const tex=img=>({isTexture:true,image:img,needsUpdate:false});
const mesh=mat=>({material:mat});
const root=list=>({traverse(f){ list.forEach(f); }});
check('0. ?texcap：手機上限 color 1024、data 512',!!ASSETS.texCap&&ASSETS.texCap.color===1024&&ASSETS.texCap.data===512);
// A：2048 的顏色貼圖（只有它在用）→ 縮、原圖 close
const big=new ImageBitmap(2048,2048), tA=tex(big);
let n=ASSETS.capTextures(root([mesh({map:tA})]));
check('A. 2048 的顏色貼圖：換成縮好的 1024、標 needsUpdate',n===1&&tA.image!==big&&tA.image.width===1024&&tA.needsUpdate===true,JSON.stringify({n,w:tA.image.width}));
check('A. 原圖沒有人用了：close()（ImageBitmap 的記憶體放掉），記在 ASSETS.freedBytes',big.closed===true&&ASSETS.freedBytes===2048*2048*4&&ASSETS.freed===1);
// B：同一張原圖，一個當顏色（1024 以內不縮）、一個當法線（超過 512 要縮）→ 顏色那張還在用原圖，不 close
const mid=new ImageBitmap(1024,1024), tC=tex(mid), tN=tex(mid);
ASSETS.capTextures(root([mesh({map:tC,normalMap:tN})]));
check('B. 同一張原圖，顏色貼圖（1024 不縮）還在用：法線縮成 512、原圖不 close',tC.image===mid&&tN.image!==mid&&tN.image.width===512&&mid.closed===false);
// C：兩個材質共用同一張 2048 原圖（兩個貼圖物件）→ 都換成同一張縮圖（只畫一次）、原圖 close
const big2=new ImageBitmap(2048,1024), t1=tex(big2), t2=tex(big2); const d0=drawn;
ASSETS.capTextures(root([mesh({map:t1}),mesh([{map:t2}])]));
check('C. 兩個貼圖共用同一張原圖：換成同一張縮圖（只縮一次）、原圖 close',t1.image===t2.image&&t1.image.width===1024&&t1.image.height===512&&drawn-d0===1&&big2.closed===true);
// D：不是 ImageBitmap（HTMLImageElement 那條路，iOS 16 以前）：換成縮圖，原圖不動（不能 close，交給瀏覽器）
const el={width:2048,height:2048}, tE=tex(el); ASSETS.capTextures(root([mesh({map:tE})]));
check('D. 原圖是一般圖片（不是 ImageBitmap）：照樣縮，不呼叫 close',tE.image!==el&&tE.image.width===1024&&!el.closed);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
