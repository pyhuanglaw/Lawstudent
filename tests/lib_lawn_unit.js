/* 總圖前草坪（第二版 LIB-FRONT-1102，LAWWW2 帳號 A 2026-11-02；第一版是 X133 LIB-LAWN-1030 LAWWW2-B）：遊戲端（src/zones3d.js）放的樹、長椅，
   擋的路燈、石墩、龍柏籬、大王椰子，和正式模型（campus_lib_lawn.glb 旁邊的 .json，tools/blender/env_second/campus_lib_lawn.py 寫的 layout）一致；
   長椅、路燈不在草坪上、不在龍柏籬上；大道的柏油在 layout 的 avenue_end 結束。實際走路（台階、平台、拱廊）在 tests/lib_front_unit.js。
   node tests/lib_lawn_unit.js */
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const J = JSON.parse(R('assets/models/env/second_ai/campus_lib_lawn.json')).layout;
const Z = R('src/zones3d.js'), A = R('src/assets3d.js');
ok(/'bldg\.campus_lib_lawn':\{url:'assets\/models\/env\/second_ai\/campus_lib_lawn\.glb'/.test(A), 'manifest 有 bldg.campus_lib_lawn');
ok(fs.existsSync(path.join(__dirname, '..', 'assets/models/env/second_ai/campus_lib_lawn.glb')), 'GLB 存在');
const near = (a, b) => Math.abs(a - b) < 1e-6;
const arr = re => { const m = Z.match(re); return m ? JSON.parse(m[1].replace(/Math\.PI/g, '3.141592653589793')) : null; };
// 樹
const ct = Z.match(/place\(g,ct,([-\d.]+),([-\d.]+),/), st = Z.match(/place\(g,st,([-\d.]+),([-\d.]+),/);
ok(ct && near(+ct[1], J.trees.camphor[0]) && near(+ct[2], J.trees.camphor[1]), '老樟樹的位置＝模型裡樹下那圈土的中心');
ok(st && near(+st[1], J.trees.south[0]) && near(+st[2], J.trees.south[1]), '南邊的大樹＝模型裡那圈土的中心');
// 長椅、路燈、石墩
const benches = arr(/for\(const \[x,z,ry\] of (\[\[[^;]+?\]\])\)\{ const b=BENCH\(\);/) || [];
ok(benches.length === J.benches.length && benches.every(([x, z, r]) => J.benches.some(b => near(b[0], x) && near(b[1], z) && Math.abs(b[2] - r) < 1e-5)), `${J.benches.length} 張長椅和模型的 layout 一樣`);
const lamps = arr(/for\(const \[x,z\] of (\[\[[^;]+?\]\])\) nav\.blockCircle\(x,z,0\.5\);   \/\* 白色球形路燈/) || [];
ok(lamps.length === J.lamps.length && lamps.every(([x, z]) => J.lamps.some(l => near(l[0], x) && near(l[1], z))), `${J.lamps.length} 盞白色球形路燈的導航阻擋和模型的 layout 一樣（r 0.5）`);
const cubes = arr(/for\(const \[x,z\] of (\[\[[^;]+?\]\])\) nav\.blockRect\(x,z,0\.9,0\.9/) || [];
ok(cubes.length === J.cubes.length && cubes.every(([x, z]) => J.cubes.some(c => near(c[0], x) && near(c[1], z))), '白色石墩和模型一樣');
const hm = Z.match(/for\(const s of \[-1,1\]\) nav\.blockRect\(([-\d.]+),s\*([-\d.]+),([-\d.]+),([-\d.]+),0,0\);   \/\* 龍柏籬/);
const [h0, h1, ha, hb] = J.hedges;
ok(hm && near(+hm[1], (h0 + h1) / 2) && near(+hm[2], (ha + hb) / 2) && near(+hm[3], h1 - h0) && near(+hm[4], hb - ha), `龍柏籬的導航阻擋＝模型（x ${h0}～${h1}、|z| ${ha}～${hb}）`);
// 不在草坪上、不在龍柏籬上
const [lx0, lx1, , lz] = J.lawn;
const onLawn = (x, z) => x > lx0 - 0.5 && x < lx1 + 0.3 && Math.abs(z) < lz + 0.3;
const onHedge = (x, z) => x > h0 - 0.5 && x < h1 + 0.5 && Math.abs(z) > ha - 0.5 && Math.abs(z) < hb + 0.5;
for (const [k, x, z] of benches.map(p => ['長椅', p[0], p[1]]).concat(lamps.map(p => ['路燈', p[0], p[1]])))
  ok(!onLawn(x, z) && !onHedge(x, z), `${k} (${x}, ${z}) 不在草坪、龍柏籬上`);
for (const [x, z] of benches) ok(x >= J.plaza[0] && x <= J.plaza[1] && Math.abs(z) <= J.plaza[3], `長椅 (${x}, ${z}) 在廣場上`);
// 樹下那圈土整圈在廣場上
for (const [k, [x, z, r]] of Object.entries(J.trees)) ok(x - r >= J.plaza[0] && x + r <= J.plaza[1] && Math.abs(z) + r <= J.plaza[3], `${k} 樹下的土整圈在廣場上`);
// 大道在 avenue_end 結束；草坪那一段的大王椰子在籬笆外（|z| 13.4）、廣場上沒有椰子
ok(new RegExp(`const AVE_X1=LIBF\\?${J.avenue_end}:72;`).test(Z), `大道（步道、柏油）在 x ${J.avenue_end} 結束（模型的 avenue_end）`);
ok(/if\(LIBF&&x>66\) continue; const pz=\(LIBF&&x>35\)\?13\.4:9\.5;/.test(Z) && J.palms.every(([x, z]) => Math.abs(Math.abs(z) - 13.4) < 1e-6 && x > 35 && x <= 66), '草坪那一段的大王椰子在龍柏籬外 |z| 13.4（layout 的 palms），x > 66（廣場）不種');
for (const [x, z] of J.palms) ok(!onHedge(x, z) && Math.abs(z) > hb + 0.5 && Math.abs(z) < J.paths[2], `椰子 (${x}, ${z}) 在籬笆和步道中間的草地上`);
// 有模型時拿掉第一版草皮上的兩棵舊樹；模型載入後藏起石板廣場
ok(/concat\(lawnGLB\?\[\]:\[\[74,-12\],\[78,14\]\]\)/.test(Z), '有草坪模型時拿掉 (74,−12)、(78,14) 兩棵舊樹');
ok(/libPlaza\.visible=false/.test(Z), '模型載入後藏起石板廣場（載入失敗照舊是石板）');
console.log(fail ? `FAILED ${fail}` : 'ALL PASS');
process.exit(fail ? 1 : 0);
