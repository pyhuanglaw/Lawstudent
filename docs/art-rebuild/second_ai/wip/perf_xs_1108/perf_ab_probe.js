/* 場景效能對照（LAWWW2-B 2026-11-08；BB-B PERF1108_9526：山嵐 32 fps／95 calls、大口 36／130，同一條街其他店 55 以上；同弦 617 ms、大口 433 ms 卡一下）。
   進到要量的區域、站好（鏡頭照平常玩的角度）以後，在 DevTools console 貼上整段（或 Playwright：await page.evaluate(PROBE)）。大約 60 秒，回傳一個物件、也印表格。
   1. 對照：每一種情況先等 2 秒（關燈、開關陰影要重編 shader），再量 5 秒的平均 fps、最慢一幀。一次只關一樣，量完復原。
      base 照舊／noGlow 關 GLOW 光暈（Z3.glowBatch 合成的加亮面片）／noBlend 關半透明（玻璃、招牌，material.transparent）／
      noPoint 關 PointLight（店裡的燈）／noL2 關二樓那一組（兩層的店）／noShadow 太陽不投影／halfRes 解析度減半（變快很多＝像素填充／fragment 太貴）／
      noNPC 暫時拿掉 NPC（E.npcs 清空＋藏起來，量完放回去：人物動畫、彈簧骨、找路都不算）
   第 2 版（11-08 19:5x）：每一幀另外記 E.render 花的時間（畫面）、E.pathTo（找路）次數與時間——第一次參考數據 halfRes 不變快、山嵐 2F 有 270 ms 卻沒有任何計數改變，
      懷疑是 CPU：兩層的店導航格 0.1 m、跨層找一次路 Node 量平均 14 ms、最慢 48 ms（好拍 0.6／9.5 ms），好幾個 NPC 同一幀找路就會疊起來。
   2. 卡頓：照舊站 20 秒，每一個 > 100 ms 的幀記下：當時 shader 程式數、貼圖數、幾何數、NPC 數有沒有變（變了＝那一下在編 shader／上傳貼圖／有人走進來）。 */
(async () => {
  const E = GAME.E, R = E.renderer, S = E.scene, T = { r: 0, p: 0, pn: 0 };
  const r0 = E.render, p0 = E.pathTo;   // 量時間用的外層（結束時一定換回去）
  E.render = function () { const t = performance.now(); try { return r0.apply(this, arguments); } finally { T.r += performance.now() - t; } };
  E.pathTo = function () { const t = performance.now(); try { return p0.apply(this, arguments); } finally { T.p += performance.now() - t; T.pn++; } };
  const raf = () => new Promise(r => requestAnimationFrame(r)), wait = ms => new Promise(r => setTimeout(r, ms));
  async function measure(sec) { let n = 0, worst = 0, t0 = performance.now(), last = t0; T.r = T.p = T.pn = 0; while (performance.now() - t0 < sec * 1000) { await raf(); const t = performance.now(); worst = Math.max(worst, t - last); last = t; n++; }
    return { fps: +(n / ((last - t0) / 1000)).toFixed(1), worst: Math.round(worst), renderMs: +(T.r / n).toFixed(1), pathMs: +(T.p / n).toFixed(2), paths: T.pn, npc: (E.npcs || []).length }; }
  const meshes = f => { const a = []; S.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && o.visible && f(o)) a.push(o); }); return a; };
  const mats = o => Array.isArray(o.material) ? o.material : [o.material];
  const conds = {
    noGlow: () => { const a = meshes(o => o.userData && o.userData.glowBatch); a.forEach(o => o.visible = false); return { n: a.length, undo: () => a.forEach(o => o.visible = true) }; },
    noBlend: () => { const a = meshes(o => mats(o).some(m => m && m.transparent)); a.forEach(o => o.visible = false); return { n: a.length, undo: () => a.forEach(o => o.visible = true) }; },
    noPoint: () => { const a = []; S.traverse(o => { if (o.isPointLight && o.visible) a.push(o); }); a.forEach(o => o.visible = false); return { n: a.length, undo: () => a.forEach(o => o.visible = true) }; },
    noL2: () => { const a = []; S.traverse(o => { if (o.name === 'L2' && o.visible) a.push(o); }); a.forEach(o => o.visible = false); return { n: a.length, undo: () => a.forEach(o => o.visible = true) }; },
    noShadow: () => { const s = E.sun, was = s && s.castShadow; if (s) s.castShadow = false; return { n: s ? 1 : 0, undo: () => { if (s) s.castShadow = was; } }; },
    noNPC: () => { const keep = E.npcs || [], vis = keep.map(n => n.obj && n.obj.visible); keep.forEach(n => { if (n.obj) n.obj.visible = false; }); E.npcs = []; return { n: keep.length, undo: () => { E.npcs = keep; keep.forEach((n, i) => { if (n.obj) n.obj.visible = vis[i]; }); } }; },
    halfRes: () => { const pr = R.getPixelRatio(); R.setPixelRatio(pr / 2); E.resize && E.resize(); return { n: pr, undo: () => { R.setPixelRatio(pr); E.resize && E.resize(); } }; },
  };
  const out = { zone: E.zone && E.zone.id, calls: R.info.render.calls, programs: (R.info.programs || []).length, rows: [] };
  await wait(2000); out.rows.push(Object.assign({ cond: 'base', n: '' }, await measure(5)));
  for (const [k, f] of Object.entries(conds)) { const c = f(); await wait(2000); const m = await measure(5); c.undo(); await wait(1000); out.rows.push(Object.assign({ cond: k, n: c.n }, m)); }
  await wait(2000); out.rows.push(Object.assign({ cond: 'base（再量一次）', n: '' }, await measure(5)));
  // 卡頓
  const snap = () => ({ prog: (R.info.programs || []).length, tex: R.info.memory.textures, geo: R.info.memory.geometries, npc: (E.npcs || []).length });
  const hitches = []; let prev = snap(), t0 = performance.now(), last = t0; T.r = T.p = T.pn = 0;
  while (performance.now() - t0 < 20000) { await raf(); const t = performance.now(), s = snap(); if (t - last > 100) hitches.push({ at_s: +((t - t0) / 1000).toFixed(1), ms: Math.round(t - last), renderMs: Math.round(T.r), pathMs: Math.round(T.p), paths: T.pn, dProg: s.prog - prev.prog, dTex: s.tex - prev.tex, dGeo: s.geo - prev.geo, npc: s.npc, dNpc: s.npc - prev.npc }); prev = s; last = t; T.r = T.p = T.pn = 0; }
  E.render = r0; E.pathTo = p0;
  out.hitches = hitches; console.table(out.rows); console.table(hitches); return out;
})()
