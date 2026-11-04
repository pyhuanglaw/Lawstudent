// 溫州街、118 巷街景 GLB 的大面改單面（PERF-SINGLESIDE-GLB-1025 第三份，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB。
//   同一頁量：整條街全部改單面上限 +11%（溫州街）、+15%（118 巷）；但葉片、鐵窗、招牌這些開口的零件補反面以後好處就沒了（公館 ④ 試過）。
//   這一份只把「大面、背面看不到」的材質改單面（店內的貨、店內牆、牆面磁磚／馬賽克／粉刷、騎樓柱、地面的牆腳、亮著的房間），不補反面、幾何不動：
//   1. 這幾個材質單面（溫州街 9 個、118 巷 7 個）；
//   2. 其他材質照舊雙面（原本就單面的 wz_stain 除外）——葉片、鐵窗、招牌、遮雨棚、電線這些兩面都看得到；
//   3. 三角形數和改前一樣（93,881、63,826）：沒有補反面、沒有少東西；
//   4. 遊戲照名字找的 FACE 節點（招牌、店內的面）都在（4、45 個）；材質數一樣（44、33）。
// 修改前 FAIL。用法：node tests/singleside_streets_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function load(n){ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+n+'.glb')), jl=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+jl).toString('utf8')); }
const BIG=/^(wz_in_goods|wz_in_shop|wz_wall_|wz_in_tiles_|wz_room_lit|wz_pillar_|wz_ground_wall)/;
const W={wenzhou_street:{big:9,tris:93881,face:4,mats:44}, lane118_street:{big:7,tris:63826,face:45,mats:33}};
for(const [n,want] of Object.entries(W)){ const J=load(n), M=J.materials;
  const big=M.filter(m=>BIG.test(m.name)), bigDs=big.filter(m=>m.doubleSided).map(m=>m.name);
  check('1. '+n+'：大面的材質單面（'+want.big+' 個）', big.length===want.big&&!bigDs.length, bigDs.length?'還是雙面：'+bigDs.join(' '):big.map(m=>m.name).join(' '));
  const other=M.filter(m=>!BIG.test(m.name)&&m.name!=='wz_stain'), oneS=other.filter(m=>!m.doubleSided).map(m=>m.name);
  check('2. '+n+'：其他材質照舊雙面（'+other.length+' 個；葉片、鐵窗、招牌、遮雨棚…）', !oneS.length, oneS.length?'變單面：'+oneS.join(' '):'');
  let t=0; for(const m of J.meshes) for(const p of m.primitives) t+=(p.indices!=null?J.accessors[p.indices].count:J.accessors[p.attributes.POSITION].count)/3;
  check('3. '+n+'：三角形數和改前一樣（'+want.tris.toLocaleString('en')+'）', t===want.tris, t.toLocaleString('en'));
  const face=J.nodes.filter(x=>/FACE/.test(x.name||'')).length;
  check('4. '+n+'：FACE 節點 '+want.face+' 個、材質 '+want.mats+' 個', face===want.face&&M.length===want.mats, 'FACE '+face+'、材質 '+M.length); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
