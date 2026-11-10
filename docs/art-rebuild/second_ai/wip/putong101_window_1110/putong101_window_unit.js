// 普通 101 北窗白天整片深藍黑（PUTONG101-WINDOW-1102；BB-B n28；LAWWW2-B 10-31 判斷：窗景沒缺，黑的是窗外博思一樓的玻璃大廳）——不需要瀏覽器（D131）。
// 博思（campus_boya.glb，tools/blender/env_second/campus_teach.py --set boya）一樓南面的玻璃大廳往內退 0.6 m、上面有樓板，遊戲裡照不到光；
// 玻璃照 archkit 的顏色（頂點色，線性：上 0.26、下 0.06）幾乎是黑的，普通北面教室的窗景照片拍到的就是一整片黑。
// 修法：這一片帷幕換亮一點、偏灰藍的漸層（上 0.48／0.55／0.62、下 0.20／0.24／0.28：像反射對面普通的白牆和天空）；其他樓層、其他棟的 ck_glass 不動。
// 檢查（讀 GLB 的 by_glass 頂點色；GLB 是校園座標）：
//   1 一樓南面帷幕（y < 4.3、z > −76，面向普通）的玻璃最亮的頂點 ≥ 0.45
//   2 其他玻璃（二樓以上、其他面）照舊（最亮 ≤ 0.27）
// 修改前（開發分支 9d4c54c16 之後）：1 FAIL。窗景照片 assets/models/env/views/putong_north_{day,night}.webp 要在遊戲裡重拍（D131：CC 跑 tools/blender/env_second/shots/teach_views.py <網址> putong_north）。
// 用法：node tests/putong101_window_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_boya.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0); const T={5126:Float32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  const arr=new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); const k=a.normalized?(a.componentType===5123?65535:255):1; return {n,get:(i,j)=>arr[i*n+j]/k,count:a.count}; };
const nd=J.nodes.find(q=>q.name==='by_glass'); const t=(nd&&nd.translation)||[0,0,0];
let lowMax=0, lowN=0, highMax=0;
if(nd) for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION), C=acc(pr.attributes.COLOR_0);
  for(let i=0;i<P.count;i++){ const y=P.get(i,1)+t[1], z=P.get(i,2)+t[2], r=C.get(i,0); if(y<4.3&&z>-76){ lowN++; lowMax=Math.max(lowMax,r); } else highMax=Math.max(highMax,r); } }
check('0 讀得到博思的玻璃（by_glass）', !!nd&&lowN>0, `一樓南面帷幕的頂點 ${lowN}`);
check('1 一樓南面玻璃大廳（面向普通）亮一點：最亮的頂點 ≥ 0.45', lowMax>=0.45, `最亮 ${lowMax.toFixed(3)}`);
check('2 其他玻璃照舊：最亮 ≤ 0.27', highMax<=0.27, `最亮 ${highMax.toFixed(3)}`);
console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
