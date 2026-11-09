/* PERF-XS-NPC-1108 (A) 前後對照（LAWWW2-B 2026-11-09）：sitFeet 只更新兩條腿的矩陣（character3d.js 的 CHAR.sitFeetFast）。由 seat_off_probe.js 改的，欄位一樣。
   要先接上 sit_feet_fast_1109.patch（沒接的版本 CHAR.sitFeetFast 不存在，這支會直接說「沒有這個 patch」）。
   進到要量的區域、站好（鏡頭照平常玩的角度）以後，在 DevTools console 貼上整段（或 Playwright：await page.evaluate(PROBE)）。大約 70 秒，回傳一個物件、也印表格。
   同一個版本裡切換：slow＝CHAR.sitFeetFast=false（等於沒有 patch）／fast＝patch 預設／slow、fast 各量兩次（交錯，抵掉暖機、背景程式的影響）／noNPC＝參考（拿掉全部 NPC）。
   每一種：先等 2 秒，再量 8 秒。欄位：
     fps、worst（最慢一幀 ms）、renderMs（E.render 每幀）、animMs（CHAR.animate 每幀總共，玩家也算）、animN（每幀呼叫幾次）、
     seatOff（每幀平均有幾個人符合「坐著、在畫面外、離你 3 m 以上」）、npc（E.npcs 人數）、vis（畫面裡的 NPC 平均幾個）。 */
(async () => {
  const E = GAME.E, C = CHAR;
  if (typeof C.sitFeetFast !== 'boolean') { const m = '沒有這個 patch（CHAR.sitFeetFast 不存在）'; console.warn(m); return { error: m }; }
  const T = { r: 0, a: 0, an: 0 }, r0 = E.render, a0 = C.animate, keep0 = C.sitFeetFast;
  E.render = function () { const t = performance.now(); try { return r0.apply(this, arguments); } finally { T.r += performance.now() - t; } };
  C.animate = function () { const t = performance.now(); try { return a0.apply(this, arguments); } finally { T.a += performance.now() - t; T.an++; } };
  const raf = () => new Promise(r => requestAnimationFrame(r)), wait = ms => new Promise(r => setTimeout(r, ms));
  const pp = () => E.player && E.player.obj.position;
  const seatOffNow = () => { const p = pp(); let k = 0, v = 0; for (const n of (E.npcs || [])) { const o = n.obj; if (o.visible) v++; else if ((n.pose === 'sit' || n.pose === 'read') && !n.path && (!p || Math.hypot(p.x - o.position.x, p.z - o.position.z) >= (E.SEAT_OFF_NEAR || 3))) k++; } return [k, v]; };
  async function measure(sec) { let n = 0, worst = 0, so = 0, vv = 0; const t0 = performance.now(); let last = t0; T.r = T.a = T.an = 0;
    while (performance.now() - t0 < sec * 1000) { await raf(); const t = performance.now(); worst = Math.max(worst, t - last); last = t; n++; const [k, v] = seatOffNow(); so += k; vv += v; }
    return { fps: +(n / ((last - t0) / 1000)).toFixed(1), worst: Math.round(worst), renderMs: +(T.r / n).toFixed(2), animMs: +(T.a / n).toFixed(2), animN: +(T.an / n).toFixed(1), seatOff: +(so / n).toFixed(1), vis: +(vv / n).toFixed(1), npc: (E.npcs || []).length }; }
  const out = { zone: E.zone && E.zone.id, lv: E.player && E.player.lv, rows: [] };
  try {
    for (const ev of [false, true, false, true]) { C.sitFeetFast = ev; await wait(2000); out.rows.push(Object.assign({ cond: ev ? 'fast' : 'slow' }, await measure(8))); }
    C.sitFeetFast = keep0;
    { const keep = E.npcs || [], vis = keep.map(n => n.obj && n.obj.visible); keep.forEach(n => { if (n.obj) n.obj.visible = false; }); E.npcs = [];
      try { await wait(2000); out.rows.push(Object.assign({ cond: 'noNPC（參考）' }, await measure(8))); } finally { E.npcs = keep; keep.forEach((n, i) => { if (n.obj) n.obj.visible = vis[i]; }); } }
  } finally { E.render = r0; C.animate = a0; C.sitFeetFast = keep0; }
  console.table(out.rows); return out;
})()
