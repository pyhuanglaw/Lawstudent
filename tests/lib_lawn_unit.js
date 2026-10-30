/* X133 總圖前草皮（LIB-LAWN-1030，LAWWW2-B）：遊戲端（src/zones3d.js）放的樹、長椅、路燈，和正式模型（campus_lib_lawn.glb 旁邊的 .json，
   tools/blender/env_second/campus_lib_lawn.py 寫的 layout）一致；長椅、路燈在步道上（不在草皮、不在中軸上、不在總圖裡）；有模型時拿掉草皮上的兩棵舊樹。
   node tests/lib_lawn_unit.js */
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const J = JSON.parse(R('assets/models/env/second_ai/campus_lib_lawn.json')).layout;
const Z = R('src/zones3d.js'), A = R('src/assets3d.js');
ok(/'bldg\.campus_lib_lawn':\{url:'assets\/models\/env\/second_ai\/campus_lib_lawn\.glb'/.test(A), 'manifest 有 bldg.campus_lib_lawn');
ok(fs.existsSync(path.join(__dirname, '..', 'assets/models/env/second_ai/campus_lib_lawn.glb')), 'GLB 存在');
const near = (a, b) => Math.abs(a - b) < 1e-6;
// 樹
const ct = Z.match(/place\(g,ct,([-\d.]+),([-\d.]+),/), st = Z.match(/place\(g,st,([-\d.]+),([-\d.]+),/);
ok(ct && near(+ct[1], J.trees.camphor[0]) && near(+ct[2], J.trees.camphor[1]), '老樟樹的位置＝模型裡樹下那圈土的中心');
ok(st && near(+st[1], J.trees.south[0]) && near(+st[2], J.trees.south[1]), '南側的樹＝模型裡那圈土的中心');
// 長椅
const bm = Z.match(/for\(const s of \[-1,1\]\) for\(const x of \[([^\]]+)\]\)\{ const b=BENCH\(\); place\(g,b,x,s\*([\d.]+)/);
const benchesZ = bm ? [].concat(...[-1, 1].map(s => bm[1].split(',').map(x => [+x, s * +bm[2]]))) : [];
ok(benchesZ.length === J.benches.length && benchesZ.every(([x, z]) => J.benches.some(b => near(b[0], x) && near(b[1], z))), '六張長椅和模型的 layout 一樣');
// 路燈
const lm = Z.match(/for\(const \[x,z,ry\] of \[(\[70\.8[^;]+?)\]\)\{ const l=W3\.lampPost\(\)/);
const lamps = lm ? JSON.parse('[' + lm[1].replace(/Math\.PI/g, '3.141592653589793') + ']') : [];
ok(lamps.length === J.lamps.length && lamps.every(([x, z]) => J.lamps.some(l => near(l[0], x) && near(l[1], z))), '六盞路燈和模型的 layout 一樣');
// 在步道上：不在草皮（含路緣）、不在中軸、在廣場裡、不在總圖裡（|z|<12 時 x < 前庭西緣）
const inLawn = (x, z) => [J.lawn_main, J.lawn_wing].some(([x0, x1, a0, a1]) => x > x0 - 0.15 - 0.5 && x < x1 + 0.15 + 0.5 && Math.abs(z) > a0 - 0.15 - 0.35 && Math.abs(z) < a1 + 0.15 + 0.35);
const things = benchesZ.map(p => ['長椅', ...p]).concat(lamps.map(p => ['路燈', p[0], p[1]]));
for (const [k, x, z] of things) {
  ok(!inLawn(x, z) || k === '路燈' && Math.abs(z) > 17, `${k} (${x}, ${z}) 不在草皮上`);
  ok(Math.abs(z) >= J.axis_halfwidth + 0.3, `${k} (${x}, ${z}) 不擋中軸`);
  ok(x >= J.plaza[0] && x <= J.forecourt[0] && Math.abs(z) <= J.plaza[3], `${k} (${x}, ${z}) 在廣場裡、在前庭西邊`);
}
// 有模型時拿掉草皮上的舊樹
ok(/concat\(lawnGLB\?\[\]:\[\[74,-12\],\[78,14\]\]\)/.test(Z), '有草皮模型時拿掉 (74,−12)、(78,14) 兩棵舊樹');
ok(/libPlaza\.visible=false/.test(Z), '模型載入後藏起石板廣場（載入失敗照舊是石板）');
// 樹下的土整圈在草皮主塊裡
for (const [k, [x, z, r]] of Object.entries(J.trees)) {
  const L = J.lawn_main;   // 南北兩塊草皮對稱：用 |z| 比
  ok(x - r >= L[0] && x + r <= L[1] && Math.abs(z) - r >= L[2] && Math.abs(z) + r <= L[3], `${k} 樹下的土整圈在草皮主塊裡`);
}
console.log(fail ? `FAILED ${fail}` : 'ALL PASS');
process.exit(fail ? 1 : 0);
