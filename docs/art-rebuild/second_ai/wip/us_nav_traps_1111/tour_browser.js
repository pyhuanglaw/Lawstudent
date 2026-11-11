// 美國交換區域巡一輪（雲端瀏覽器 SwiftShader）：每一區照出生點進去、等正式模型、拍一張、量畫面亮度、記 JS 例外
const { chromium } = require('playwright');
const [URL, OUT] = process.argv.slice(2);
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const STOPS = [
  ['us_outside', null, '2028-12-16', 7.0, 'AA_814 3-2 社區門口 07:00'],
  ['us_shared', 'us_shared_kitchen', '2028-09-13', 18.75, 'AA_814 3-1 C 棟 208 廚房 18:45'],
  ['us_apartment', null, '2028-09-20', 15, ''], ['us_apartment', 'us_apartment_bed', '2028-09-20', 23, '臥室'],
  ['us_shared', null, '2028-09-20', 15, ''], ['us_bed_c', null, '2028-09-20', 15, ''],
  ['us_clubhouse_in', null, '2028-09-20', 15, ''], ['us_campus', null, '2028-09-20', 10, ''], ['us_lawlib', null, '2028-09-20', 10, ''], ['us_lawlib_2f', null, '2028-09-20', 10, ''],
  ['us_classroom', null, '2028-09-20', 10, ''], ['us_market_street', null, '2028-09-20', 16, ''], ['us_market', null, '2028-09-20', 16, ''], ['us_asian_market', null, '2028-09-20', 16, ''],
  ['us_outside', null, '2028-12-10', 19, '晚上（冬）'],
];
(async () => {
  const b = await chromium.launch({ args: ARGS }); const pg = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await pg.goto(URL + '?turbo');
  for (let i = 0; i < 360; i++) { if (await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')")) break; await pg.waitForTimeout(500); }
  for (const [zone, spk, date, hour, note] of STOPS) {
    const e0 = errs.length;
    const info = await pg.evaluate(async ([zone, spk, date, hour]) => { const s = GAME.defaults('祐廷');
      const sp = (spk && US3.SPAWN[spk]) || US3.SPAWN[zone] || null; const day = (typeof CAL !== 'undefined' && CAL.dayOf) ? CAL.dayOf(date) : null;
      Object.assign(s, { zone, hour, flags: Object.assign({}, s.flags, { introDone: true }) }); if (day != null) s.day = day; if (sp) s.pos = { x: sp.x, z: sp.z, yaw: sp.yaw || 0, lv: sp.lv | 0 };
      document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter = () => false; EVENTS.tick = () => false; if (typeof STORY !== 'undefined') STORY.phoneAuto = () => {};
      try { await GAME.applySave(s); } catch (e) { return { err: String(e).slice(0, 120) }; } return { day: s.day, sp }; }, [zone, spk, date, hour]);
    for (let i = 0; i < 120; i++) { if (await pg.evaluate("!!(GAME.E.zone&&(GAME.E.zone.formal||GAME.E.zone.formalFailed))")) break; await pg.waitForTimeout(500); }
    await pg.waitForTimeout(2500);
    const st = await pg.evaluate(() => { const E = GAME.E, P = E.player, o = P.obj.position; return { zone: E.zone && E.zone.id, formal: !!E.zone.formal, pos: [+o.x.toFixed(2), +o.z.toFixed(2), P.lv | 0], stand: E.canStand(o.x, o.z, 0.3, P.lv | 0) }; });
    const fn = `${OUT}/${zone}${spk ? '_' + spk : ''}_${hour}.png`.replace(/\./g, (m, i, s) => i > s.length - 5 ? m : '_');
    await pg.screenshot({ path: fn });
    const lum = await pg.evaluate(async () => { const c = document.getElementById('c'); const w = 64, h = 32; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.drawImage(c, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data; let s = 0, dark = 0; for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; s += l; if (l < 12) dark++; } return { mean: +(s / (w * h)).toFixed(1), dark: +(dark / (w * h)).toFixed(2) }; });
    console.log(JSON.stringify({ zone, spk, hour, note, info, st, lum, newErrs: errs.slice(e0) }), fn.split('/').pop());
  }
  console.log('errs total', errs.length); await b.close();
})();
