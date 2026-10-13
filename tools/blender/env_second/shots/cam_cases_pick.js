/* 從 cam_wall_scan.js 同一套算法挑出「鏡頭會跑到隔間牆後面」的代表位置（每棟每層 6 個，彼此距離盡量遠；優先大廳、走廊、自習區、教室門口），
   給 LAWWW 當鏡頭碰撞的回歸基準，也給 cam_cases_shots.py 在修改前後的同一個位置拍照。
   用法：node tools/blender/env_second/shots/cam_cases_pick.js <repo 根目錄> [每層幾個，預設 6] > cases.json（cam_cases_shots.py 會在遊戲裡再挑站得住的） */
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || '.';
const DIST = 4.6, PITCH = 0.38, H = DIST * Math.cos(PITCH), PER = +(process.argv[3] || 6);
function load(n) { const s = fs.readFileSync(path.join(ROOT, 'src/data', n + '.js'), 'utf8'); const m = s.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/m); return eval('(' + m[1] + ')'); }
function segs(w) { const horiz = Math.abs(w.z1 - w.z0) < 1e-6, a0 = horiz ? Math.min(w.x0, w.x1) : Math.min(w.z0, w.z1), a1 = horiz ? Math.max(w.x0, w.x1) : Math.max(w.z0, w.z1);
  const gaps = (w.gaps || []).map(g => [Math.min(g[0], g[1]), Math.max(g[0], g[1])]).sort((p, q) => p[0] - q[0]); const out = []; let a = a0;
  for (const [g0, g1] of gaps) { if (g0 > a) out.push([a, g0]); a = Math.max(a, g1); } if (a < a1) out.push([a, a1]);
  return out.map(([p, q]) => horiz ? [p, w.z0, q, w.z0] : [w.x0, p, w.x0, q]); }
function cross(ax, az, bx, bz, s) { const [cx, cz, dx, dz] = s; const r = [bx - ax, bz - az], q = [dx - cx, dz - cz]; const den = r[0] * q[1] - r[1] * q[0]; if (Math.abs(den) < 1e-9) return false;
  const t = ((cx - ax) * q[1] - (cz - az) * q[0]) / den, u = ((cx - ax) * r[1] - (cz - az) * r[0]) / den; return t > 0 && t < 1 && u > -0.05 && u < 1.05; }
function distSeg(px, pz, s) { const [ax, az, bx, bz] = s; const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz; let t = L2 ? ((px - ax) * vx + (pz - az) * vz) / L2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * vx, pz - az - t * vz); }
const out = [];
for (const [zone, file] of [['boya', 'boya_layout'], ['putong', 'putong_layout'], ['gongtong', 'gongtong_layout']]) {
  const L = load(file), W = L.W, D = L.D; const byLv = {};
  for (const w of L.walls) (byLv[w.lv] = byLv[w.lv] || []).push(...segs(w));
  const closed = (L.rooms || []).filter(r => r.kind === 'closed');
  const blocked = [];   /* 家具、座位大概的位置（不站在桌子上）*/
  for (const r of (L.rooms || [])) for (const s of (r.seats || [])) blocked.push([r.lv, s.x, s.z, 0.45]);
  for (const g of (L.groups || [])) for (const t of (g.tables || [])) { blocked.push([g.lv, t.x, t.z, Math.max(t.w || 0, t.d || 0, (t.r || 0) * 2) / 2 + 0.35]); for (const s of t.seats) blocked.push([g.lv, s.x, s.z, 0.45]); }
  for (const r of (L.rooms || [])) if (r.kind === 'lecture') for (const q of r.rowsData) for (let x = r.seatX0; x <= r.seatX1; x += 0.7) blocked.push([r.lv, x, q.deskZ, 0.5]);
  for (const fl of L.floors) {
    const lv = fl.lv, S = byLv[lv] || []; const cand = [];
    for (let x = -W / 2 + 0.6; x <= W / 2 - 0.6; x += 0.5) for (let z = -D / 2 + 0.6; z <= D / 2 - 0.6; z += 0.5) {
      if (closed.some(r => r.lv === lv && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1)) continue;
      if (S.some(s => distSeg(x, z, s) < 0.5)) continue;
      if (blocked.some(([l, bx, bz, r]) => l === lv && Math.hypot(x - bx, z - bz) < r)) continue;
      for (let k = 0; k < 8; k++) { const yaw = k * Math.PI / 4, cx = x + Math.sin(yaw) * H, cz = z + Math.cos(yaw) * H;
        if (S.some(s => cross(x, z, cx, cz, s))) { const room = (L.rooms || []).find(r => r.lv === lv && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);
          const area = room ? room.id : (((L.areas || []).find(a => a.lv === lv && x > a.x0 && x < a.x1 && z > a.z0 && z < a.z1) || {}).label || '大廳／走廊');
          cand.push({ zone, lv, x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(4), area, pub: room ? 0 : 1 }); } }
    }
    /* 挑 PER 個：先挑公共空間，再用最遠點取樣（位置分散）*/
    const pick = []; const pool = cand.slice().sort((a, b) => b.pub - a.pub);
    if (pool.length) pick.push(pool[0]);
    while (pick.length < PER && pick.length < pool.length) { let best = null, bd = -1;
      for (const c of pool) { if (pick.includes(c)) continue; const d = Math.min(...pick.map(p => Math.hypot(p.x - c.x, p.z - c.z) + (p.yaw === c.yaw ? 0 : 0.8))) + c.pub * 2.5; if (d > bd) { bd = d; best = c; } }
      if (!best) break; pick.push(best); }
    out.push(...pick.map((c, i) => Object.assign({ id: `${zone}_${fl.name}_${i + 1}` }, c)));
  }
}
console.log(JSON.stringify(out, null, 1));
