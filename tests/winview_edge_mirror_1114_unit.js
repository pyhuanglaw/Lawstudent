// WINVIEW-EDGE-STRIPE-1114（BB_379，LAWWW2-C 11-14）：視差窗景（W3.windowMat）看到照片外面時，不能把邊上那一排像素拉長成條紋。
// 原本 uv=clamp(...)：照片邊上有樹（GG-STREET-TREES 以後的公館窗景）時，鏡頭往上、往旁邊看就變成一條一條的直紋、橫紋。
// 改成鏡像（wvMirror）：照片外面照鏡像取樣。這支不開瀏覽器：讀 world3d.js 的 shader 字串，用 JS 照同一個公式算幾個點。
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src','world3d.js'),'utf8');
let fail=0; const check=(n,ok,msg)=>{ console.log((ok?'PASS ':'FAIL ')+n+'　'+(msg||'')); if(!ok) fail++; };
check('1 windowMat 的照片 uv 不再 clamp 到邊上', !/uv=clamp\(vec2\(h\.x\/\(2\.0\*depth\)/.test(src), '');
check('2 有 wvMirror、照片 uv 經過它', /vec2 wvMirror\(vec2 u\)\{ u=1\.0-abs\(1\.0-mod\(u,2\.0\)\);/.test(src) && /uv=wvMirror\(vec2\(h\.x\/\(2\.0\*depth\)\+0\.5,h\.y\/depth\+0\.5\)\)/.test(src));
// 同一個公式（GLSL mod＝x−y·floor(x/y)）
const mod=(x,y)=>x-y*Math.floor(x/y), clamp=(x,a,b)=>Math.min(b,Math.max(a,x)), m=u=>clamp(1-Math.abs(1-mod(u,2)),0.002,0.998);
const near=(a,b)=>Math.abs(a-b)<1e-9;
check('3 照片裡面（0～1）照舊', near(m(0.3),0.3)&&near(m(0.75),0.75));
check('4 超出上緣 1.1 → 0.9（鏡像，不是 0.998 那一排）', near(m(1.1),0.9), 'm(1.1)='+m(1.1));
check('5 超出左緣 −0.2 → 0.2', near(m(-0.2),0.2), 'm(-0.2)='+m(-0.2));
check('6 往外越多取樣點就跟著變（不會整片同一排像素）', m(1.05)!==m(1.2) && m(-0.05)!==m(-0.3));
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
