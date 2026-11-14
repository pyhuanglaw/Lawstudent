/* SHOP-INTERIOR-VIEW-1112 第二批：九間店「店內往窗外看」的遊戲內截圖（白天 13:00、晚上 21:00）。
   做法照 tools/blender/env_second/bb_support/park3_game_shots.js（讀檔進區域、藏路人和 HUD、電影鏡頭）。
   鏡頭：等正式模型掛上來以後，找這一區的窗景卡（網格名字有 VIEW／VIEWPANE）或玻璃，從卡的中心往房間裡退 DIST m、眼高 1.5 m 往卡看。
   用法（repo 根目錄）：python3 -m http.server 8793 --bind 127.0.0.1 &
     node docs/art-rebuild/second_ai/wip/shop_views_1113/shots.js http://127.0.0.1:8793/index.html <輸出資料夾> [區域,區域...] */
const { chromium } = require('playwright');
const [URL, OUT, ONLY] = process.argv.slice(2);
const fs = require('fs'); fs.mkdirSync(OUT, { recursive: true });
const ZONES = (ONLY || 'afar,daybreak,yangyang,corner_records,aoki,wz_brunch,wz_teahouse,wz_mokuyobi,wz_offbeat').split(',');
const HOURS = [13, 21];
const DIST = +(process.env.DIST || 3.2);
const HIDE_HUD = '#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}';
const FLAGS = { introDone: true, campusIntro: true, classDone: true, metAn: true, met_an: true, afternoonDone: true, lawclub: true, wenzhouLine: true };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const zone of ZONES) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    await pg.goto(URL + '?dev');
    for (let i = 0; i < 240; i++) { if (await pg.evaluate(() => !!(window.GAME && document.getElementById('loading') && document.getElementById('loading').classList.contains('hide')))) break; await pg.waitForTimeout(500); }
    await pg.evaluate(async ([zone, flags]) => { const s = GAME.defaults('祐廷'); s.zone = zone; s.hour = 13; s.flags = Object.assign(s.flags || {}, flags); s.day = 9; s.weekday = 3; s.weather = 'sunny'; s.pos = null;
      document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter = () => false; EVENTS.tick = () => false; await GAME.applySave(s); }, [zone, FLAGS]);
    // 等正式模型（窗景卡）
    let found = null;
    for (let i = 0; i < 160; i++) {
      found = await pg.evaluate(zone => { const E = GAME.E; if (!E.zone || GAME.G.zone !== zone) return null; const out = [];
        E.scene.traverse(o => { if (!o.isMesh || !o.visible) return; let vis = true; for (let p = o.parent; p; p = p.parent) if (!p.visible) vis = false; if (!vis) return;
          const n = o.name || ''; if (/VIEW/.test(n) || (zone === 'wz_teahouse' && /engawa.*glass/.test(n))) out.push(n); });
        return out.length ? out : null; }, zone);
      if (found) break; await pg.waitForTimeout(500);
    }
    console.log(zone, 'cards', JSON.stringify(found));
    await pg.waitForTimeout(2000);
    await pg.evaluate(() => { GAME.E.npcs.slice().forEach(n => { n.obj.visible = false; }); });
    await pg.evaluate(css => { const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el); }, HIDE_HUD);
    // 每一張卡（同名只拍一次）
    const targets = await pg.evaluate(([zone, DIST]) => { const E = GAME.E, seen = new Set(), res = [], sp = E.player.obj.position.clone();
      E.scene.traverse(o => { if (!o.isMesh) return; let vis = o.visible; for (let p = o.parent; p; p = p.parent) if (!p.visible) vis = false; if (!vis) return;
        const n = o.name || ''; if (!(/VIEW/.test(n) || (zone === 'wz_teahouse' && /engawa.*glass/.test(n)))) return; const key = n.replace(/_\d+$/, ''); if (seen.has(key)) return; seen.add(key);
        const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
        const ax = s.x < s.z ? 'x' : 'z'; const sign = Math.sign(sp[ax] - c[ax]) || 1; const cam = c.clone(); cam[ax] += sign * DIST; cam.y = (bb.min.y + 1.5 > 1.5 ? bb.min.y : 0) + 1.5;
        const look = c.clone(); look.y = cam.y;
        res.push({ name: key, cam: [cam.x, cam.y, cam.z], look: [look.x, look.y, look.z], size: [+s.x.toFixed(2), +s.y.toFixed(2), +s.z.toFixed(2)], center: [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)] }); });
      return res; }, [zone, DIST]);
    for (const t of targets) for (const h of HOURS) {
      await pg.evaluate(([t, h]) => { const E = GAME.E; GAME.G.hour = h; E.hour = h; E.applyTime(h); E.cinematic(new THREE.Vector3(...t.cam), new THREE.Vector3(...t.look)); E.camera.position.set(...t.cam); E.cam.look = new THREE.Vector3(...t.look); E.camera.lookAt(E.cam.look); }, [t, h]);
      await pg.waitForTimeout(2500);
      await pg.evaluate(h => { GAME.E.player.busy = true; GAME.G.hour = h; GAME.E.hour = h; GAME.E.applyTime(h); }, h);
      await pg.waitForTimeout(800);
      const f = `${OUT}/${zone}__${t.name.replace(/[^\w]/g, '_')}_${h}.png`;
      await pg.screenshot({ path: f });
      console.log('shot', f, JSON.stringify(t), 'errors:', errs.slice(0, 2).join(' | '));
    }
    await ctx.close();
  }
  await b.close();
})();
