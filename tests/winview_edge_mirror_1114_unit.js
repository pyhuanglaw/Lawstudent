// 視差窗景（W3.windowMat）看到照片外面的時候怎麼畫——不開瀏覽器：讀 world3d.js 的 shader 字串，用 JS 照同一個公式算。
// 第一版 uv=clamp(...)：邊上那一排像素拉長成條紋（WINVIEW-EDGE-STRIPE-1114，BB_379，LAWWW2-C 11-14）。
// 第二版鏡像（wvMirror）：邊上有樹時變成左右／上下對稱的一團——公館安泰、鮮果半空一團沒有樹幹的對稱樹葉、榮恩典的樹像萬花筒
//   （WINVIEW-MIRROR-TREE-1114，BB-B 11-14 PC GPU WINVIEW_GG3_dev @c109767aae 判 FAIL P2）。
// 第三版（LAWWW2-B 11-14）：位置夾在邊上、改取很模糊的那一層（mipmap bias 7：1024×512 剩 8×4 格）——沒有細節可以拉成條紋，也沒有東西可以對稱。
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src','world3d.js'),'utf8');
let fail=0; const check=(n,ok,msg)=>{ console.log((ok?'PASS ':'FAIL ')+n+'　'+(msg||'')); if(!ok) fail++; };
const i0=src.indexOf('function windowMat('), sh=src.slice(i0,src.indexOf('toneMapped:false',i0)).split('\n').filter(l=>!/^\s*(\/\*|第|現在|wvOut＝)/.test(l)||/\'/.test(l)).join('\n');
const code=sh.replace(/\/\*[\s\S]*?\*\//g,'');
check('1 不鏡像：shader 裡沒有 wvMirror、沒有 mod(u,2.0)', !/wvMirror/.test(code) && !/mod\(u,2\.0\)/.test(code));
check('2 照片外面：位置夾在邊上（clamp 0.002～0.998）', /uv=clamp\(ur,vec2\(0\.002\),vec2\(0\.998\)\)/.test(code));
check('3 照片外面取模糊的那一層：兩張照片（白天、黃昏換的夜景）都帶 bias wb', /texture2D\(map,uv,wb\)/.test(code) && /texture2D\(map2,uv,wb\)/.test(code) && !/texture2D\(map,uv\)/.test(code) && !/texture2D\(map2,uv\)/.test(code));
check('4 wb 照超出多少算：wvOut×40 夾到 0～1 再 ×7', /wb=clamp\(wvOut\(ur\)\*40\.0,0\.0,1\.0\)\*7\.0/.test(code) && /float wvOut\(vec2 u\)\{ vec2 o=max\(-u,u-vec2\(1\.0\)\); return max\(0\.0,max\(o\.x,o\.y\)\); \}/.test(code));
// 同一個公式
const out=(x,y)=>Math.max(0,Math.max(Math.max(-x,x-1),Math.max(-y,y-1))), wb=(x,y)=>Math.min(1,Math.max(0,out(x,y)*40))*7, cl=u=>Math.min(0.998,Math.max(0.002,u));
check('5 照片裡面（0～1）：不模糊、位置照舊', wb(0.3,0.75)===0 && wb(0,1)===0 && cl(0.3)===0.3 && cl(0.75)===0.75);
check('6 超出上緣 10%：夾在上緣、取最模糊的一層（7）', cl(1.1)===0.998 && wb(0.5,1.1)===7, 'wb='+wb(0.5,1.1));
check('7 超出左緣 20%：夾在左緣、取最模糊的一層', cl(-0.2)===0.002 && wb(-0.2,0.5)===7);
check('8 剛超出一點點（1%）：只模糊一點，接縫不會突然變', wb(0.5,1.01)>2 && wb(0.5,1.01)<4, 'wb='+wb(0.5,1.01).toFixed(2));
check('9 超出上緣 10% 和 30% 取的是同一個位置（不鏡像：不會把照片裡面的樹再畫一次）', cl(1.1)===cl(1.3) && cl(-0.1)===cl(-0.3));
check('10 窗景照片有 mipmap 可以取（viewPhoto 沒有關掉 generateMipmaps、沒有把 minFilter 改成不用 mipmap）', (()=>{ const a=src.indexOf('function viewPhoto('), f=src.slice(a,src.indexOf('function releaseViews',a)); return !/generateMipmaps\s*=\s*false/.test(f)&&!/minFilter\s*=\s*THREE\.(Linear|Nearest)Filter/.test(f); })());
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
