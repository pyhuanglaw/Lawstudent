/* 教學館室內（src/teach3d.js 的模板：共同、博雅、普通）跟隨鏡頭穿過隔間牆的比例——不開瀏覽器，用版面資料算。
   鏡頭位置照引擎的跟隨鏡頭（2026-10-13 在博雅量到：dist 4.6、pitch 0.38；鏡頭＝玩家＋(sin yaw, cos yaw)×dist×cos(pitch)，高度＝1.65＋dist×sin(pitch)；
   室內沒有鏡頭碰撞，隔間牆只做「玩家附近網點透空」，所以鏡頭在牆後面時整個畫面是那面牆）。
   取樣：每一層 0.5 m 一格、離牆 0.4 m 以上、不在關著的房間裡；8 個方向。算「玩家 → 鏡頭」的線段有沒有穿過同一層的隔間牆（門洞不算）。
   用法：node tools/blender/env_second/shots/cam_wall_scan.js <repo 根目錄> [layout 名稱…] */
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || '.';
const NAMES = process.argv.slice(3).length ? process.argv.slice(3) : ['boya_layout', 'putong_layout', 'gongtong_layout'];
const DIST = 4.6, PITCH = 0.38, H = DIST * Math.cos(PITCH);
function load(n) { const s = fs.readFileSync(path.join(ROOT, 'src/data', n + '.js'), 'utf8'); const m = s.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/m); return eval('(' + m[1] + ')'); }
function segs(w) {   /* 牆扣掉門洞 → 線段 */
  const horiz = Math.abs(w.z1 - w.z0) < 1e-6, a0 = horiz ? Math.min(w.x0, w.x1) : Math.min(w.z0, w.z1), a1 = horiz ? Math.max(w.x0, w.x1) : Math.max(w.z0, w.z1);
  const gaps = (w.gaps || []).map(g => [Math.min(g[0], g[1]), Math.max(g[0], g[1])]).sort((p, q) => p[0] - q[0]); const out = []; let a = a0;
  for (const [g0, g1] of gaps) { if (g0 > a) out.push([a, g0]); a = Math.max(a, g1); } if (a < a1) out.push([a, a1]);
  return out.map(([p, q]) => horiz ? [p, w.z0, q, w.z0] : [w.x0, p, w.x0, q]);
}
function cross(ax, az, bx, bz, s) {   /* 線段 AB 和牆線段 s 相交（含端點附近 5 cm）*/
  const [cx, cz, dx, dz] = s; const r = [bx - ax, bz - az], q = [dx - cx, dz - cz]; const den = r[0] * q[1] - r[1] * q[0]; if (Math.abs(den) < 1e-9) return false;
  const t = ((cx - ax) * q[1] - (cz - az) * q[0]) / den, u = ((cx - ax) * r[1] - (cz - az) * r[0]) / den; return t > 0 && t < 1 && u > -0.05 && u < 1.05;
}
function distSeg(px, pz, s) { const [ax, az, bx, bz] = s; const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz; let t = L2 ? ((px - ax) * vx + (pz - az) * vz) / L2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * vx, pz - az - t * vz); }
const report = {};
for (const n of NAMES) {
  const L = load(n), W = L.W, D = L.D; const byLv = {};
  for (const w of L.walls) (byLv[w.lv] = byLv[w.lv] || []).push(...segs(w));
  const closed = (L.rooms || []).filter(r => r.kind === 'closed');
  const res = {};
  for (const fl of L.floors) {
    const lv = fl.lv, S = byLv[lv] || []; let tot = 0, bad = 0, pts = 0, ptsBad = 0; const where = {};
    for (let x = -W / 2 + 0.6; x <= W / 2 - 0.6; x += 0.5) for (let z = -D / 2 + 0.6; z <= D / 2 - 0.6; z += 0.5) {
      if (closed.some(r => r.lv === lv && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1)) continue;
      if (S.some(s => distSeg(x, z, s) < 0.4)) continue;
      pts++; let pb = 0;
      for (let k = 0; k < 8; k++) { const yaw = k * Math.PI / 4, cx = x + Math.sin(yaw) * H, cz = z + Math.cos(yaw) * H; tot++;
        if (S.some(s => cross(x, z, cx, cz, s))) { bad++; pb++; } }
      if (pb) { ptsBad++; const room = (L.rooms || []).find(r => r.lv === lv && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1); const key = room ? room.id : ((L.areas || []).find(a => a.lv === lv && x > a.x0 && x < a.x1 && z > a.z0 && z < a.z1) || {}).label || '走廊／大廳'; where[key] = (where[key] || 0) + 1; }
    }
    res[fl.name] = { samples: pts, pointsWithBadDir: ptsBad, pctPoints: +(100 * ptsBad / Math.max(1, pts)).toFixed(1), pctDirs: +(100 * bad / Math.max(1, tot)).toFixed(1), where };
  }
  report[n] = res;
}
console.log(JSON.stringify(report, null, 1));
