// TAP-RAY-SEAT 總圖、宿舍：照 CC cc_tapseat_reg_probe.py 的起點（讀檔位置、面向、鏡頭在背後）在雲端瀏覽器重現「點椅面」那一刻：畫面上那一點射線第一個打到什麼
const { chromium } = require('playwright');
const [URL, OUT] = process.argv.slice(2);
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const CASES = [
  ['library_hall', [-4.0, 0.0, -0.785, 1], [[-10.175, 2.2], [-7.025, 3.8], [-8.075, 5.8], [-9.125, 3.8]]],
  ['dorm_hall', [0.0, 5.6, 1.5708, 0], [[6.0, 3.42], [9.0, 5.85], [6.0, 4.98], [4.8, 3.42]]],
];
(async () => {
  const b = await chromium.launch({ args: ARGS }); const pg = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(URL + '?turbo');
  for (let i = 0; i < 360; i++) { if (await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')")) break; await pg.waitForTimeout(500); }
  for (const [zone, st, seats] of CASES) {
    await pg.evaluate(async ([zone, st]) => { const s = GAME.defaults('祐廷'); Object.assign(s, { zone, day: 8, hour: 15, flags: { introDone: true, campusIntro: true, readCase: 'full', classDone: true, afternoonDone: true, metAn: true, zheNoodleDone: true }, pos: { x: st[0], z: st[1], yaw: st[2], lv: st[3] } });
      document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter = () => false; EVENTS.tick = () => false; if (typeof STORY !== 'undefined') STORY.phoneAuto = () => {}; await GAME.applySave(s); }, [zone, st]);
    for (let i = 0; i < 200; i++) { if (await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)")) break; await pg.waitForTimeout(500); }
    await pg.evaluate((yaw) => { const E = GAME.E; E.cam.yaw = yaw + Math.PI; E.cam.manualT = 0; }, st[2]); await pg.waitForTimeout(2500);
    for (const [x, z] of seats) {
      const r = await pg.evaluate(([x, z, lv]) => { const E = GAME.E; const it = E.interactables.find(i => i.seat && !i.hidden && Math.abs(i.seat.x - x) < 0.02 && Math.abs(i.seat.z - z) < 0.02 && ((i.seat.lv | 0) === lv)); if (!it) return { err: 'no seat' };
        const s = it.seat, fy = s.y != null ? s.y : E.heightAt(x, z, lv), y = fy + 0.45 + (s.lift || 0); const v = new THREE.Vector3(x, y, z).project(E.camera); const sx = (v.x + 1) / 2 * innerWidth, sy = (1 - v.y) / 2 * innerHeight;
        const h = E.screenToFloor(sx, sy); if (!h) return { sx, sy, err: 'no floor' }; const R = E.ray.ray.clone(); const tF = Math.hypot(h.x - R.origin.x, h.y - R.origin.y, h.z - R.origin.z);
        const first = E.rayFirstHit(R, tF - 0.03); const nm = o => { const a = []; for (let p = o; p && a.length < 4; p = p.parent) a.push(p.name || p.type); return a.join('<'); };
        const rFull = E.tapRedirect(h.x, h.z, h.lv == null ? (E.player.lv | 0) : h.lv, { ray: R, fy: h.y, hit: { x: h.x, y: h.y, z: h.z } }); const rProbe = E.tapRedirect(h.x, h.z, h.lv == null ? (E.player.lv | 0) : h.lv, { ray: R, fy: h.y });
        const cam = E.camera.position; const allHits = new THREE.Raycaster(R.origin.clone(), R.direction.clone(), 0, tF + 0.5).intersectObject(E.zone.group, true).slice(0, 6).map(q => { let vis = true; for (let p = q.object; p; p = p.parent) if (!p.visible) vis = false; const m = [].concat(q.object.material)[0]; return [nm(q.object).slice(0, 36), +q.distance.toFixed(2), q.point.toArray().map(t => +t.toFixed(2)), vis, m && m.visible, m && m.transparent && +m.opacity.toFixed(2)]; });
        return { seat: [x, z], sx: +sx.toFixed(1), sy: +sy.toFixed(1), el: (document.elementFromPoint(sx, sy) || {}).id, cam: cam.toArray().map(t => +t.toFixed(2)), dist: +cam.distanceTo(new THREE.Vector3(x, y, z)).toFixed(2), floor: [+h.x.toFixed(2), +h.z.toFixed(2), h.lv, +h.y.toFixed(2)],
          first: first && [nm(first.object).slice(0, 40), first.point.toArray().map(t => +t.toFixed(2))], rFull: rFull && rFull[3], rProbe: rProbe && rProbe[3], allHits }; }, [x, z, st[3]]);
      console.log(zone, JSON.stringify(r));
      if (r.sx) await pg.screenshot({ path: `${OUT}/${zone}_${x}_${z}_tap96.png`, clip: { x: Math.max(0, r.sx - 48), y: Math.max(0, r.sy - 48), width: 96, height: 96 } });
    }
    await pg.screenshot({ path: `${OUT}/${zone}_view.png` });
  }
  console.log('errs', errs.slice(0, 3)); await b.close();
})();
