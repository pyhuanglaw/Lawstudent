/* ART-PARK3 遊戲內截圖（BB-B 2026-10-16）：照 fast_shots.py 的做法（讀檔進溫州街、改時段、電影鏡頭、藏路人），改寫成 Node 版——
   這個環境的 Python 沒有 playwright，Node 有（NODE_PATH=$(npm root -g)）。
   同一個遊戲、同一個鏡頭拍「之前／之後」：之前＝把 wz_park.glb 的下載換成原本那一份（page.route），之後＝伺服器上的新版（wz_park.py 匯入 park3_props.glb）。
   用法：NODE_PATH=$(npm root -g) node tools/blender/env_second/bb_support/park3_game_shots.js <URL> <輸出資料夾> <原本的 wz_park.glb>
   例：在 LAWWW2-B 分支的工作樹（套 park3_wz_park_integration.patch、重跑 wz_park.py）開 python3 -m http.server 8771，
       node …/park3_game_shots.js http://127.0.0.1:8771/index.html out/ wz_park_before.glb */
const { chromium } = require('playwright');
const [URL, OUT, BEFORE] = process.argv.slice(2);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const FLAGS = { introDone: true, campusIntro: true, classDone: true, metAn: true, met_an: true, afternoonDone: true, lawclub: true, wenzhouLine: true };
const HIDE_HUD = '#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}';
// 鏡頭（溫州街世界座標；涼亭 (14.6, 25.2)、直飲台 (29.9, 6.3)、車架 (31.0, 9.6)，src/data/wz_park_layout.js）
const VIEWS = process.env.VIEWS ? JSON.parse(process.env.VIEWS) : [   // only：只拍那一種畫面大小（直向的視角窄，直飲台和車架分開拍）
  { id: 'pav', player: [14.6, 23.15, 0], cam: { pos: [19.6, 2.3, 26.2], look: [14.6, 0.55, 25.2] } },            // 涼亭東邊，看石桌、四張石凳；玩家站在象棋的互動點
  { id: 'board', player: [17.6, 23.0, 0], cam: { pos: [15.9, 1.9, 23.9], look: [14.6, 0.6, 25.3] } },              // 涼亭裡，看棋盤
  { id: 'follow', player: [17.6, 25.2, -Math.PI / 2], cam: { yaw: Math.PI / 2, pitch: 0.42, dist: 5.5 } },         // 跟隨鏡頭（玩家平常看到的角度），朝涼亭
  { id: 'fr2', only: 'l', player: [27.4, 7.0, 1.2], cam: { pos: [26.9, 1.9, 11.4], look: [30.3, 0.55, 7.6] } },   // 公園裡往主巷看：直飲台＋車架（從主巷那一側被樹和花籬擋住）
  { id: 'fount', only: 'p', player: [26, 3, 0], cam: { pos: [28.6, 1.55, 4.7], look: [29.9, 0.8, 6.3] } },         // 主巷走進入口 A 時看到的直飲台
  { id: 'rack', only: 'p', player: [26, 3, 0], cam: { pos: [28.9, 1.5, 11.2], look: [31.0, 0.4, 9.6] } },          // 車架
];
const HOURS = [11, 17.5, 20.5];
const SIZES = [{ w: 390, h: 844, dpr: 2, tag: 'p' }, { w: 844, h: 390, dpr: 1, tag: 'l' }].filter(z => !process.env.ONLY || process.env.ONLY === z.tag);
const QUICK = !!process.env.QUICK;   // 先試鏡頭：只拍「之後」、11:00、兩種畫面大小

async function frames(pg, n) {
  await pg.evaluate(async n => { const f0 = GAME.E.frame; for (let i = 0; i < 480 && GAME.E.frame < f0 + n; i++) await new Promise(r => setTimeout(r, 250)); }, n);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const ver of (process.env.VER ? [process.env.VER] : QUICK ? ['after'] : ['before', 'after'])) {
    for (const sz of SIZES) {
      const ctx = await b.newContext({ viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: sz.dpr, hasTouch: true, isMobile: true, userAgent: UA });
      const pg = await ctx.newPage(); const errs = [];
      pg.on('pageerror', e => errs.push(String(e)));
      if (ver === 'before') await pg.route('**/second_ai/wz_park.glb', r => r.fulfill({ path: BEFORE, contentType: 'model/gltf-binary' }));
      await pg.goto(URL);
      for (let i = 0; i < 240; i++) { if (await pg.evaluate(() => !!(window.GAME && document.getElementById('loading') && document.getElementById('loading').classList.contains('hide')))) break; await pg.waitForTimeout(500); }
      const st = { zone: 'wenzhou', hour: 11, pos: { x: 26, z: 8 }, flags: FLAGS };
      await pg.evaluate(async st => { const s = GAME.defaults('祐廷'); Object.assign(s, st); s.day = 8; s.weekday = 6; s.weather = 'sunny'; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter = () => false; EVENTS.tick = () => false; await GAME.applySave(s); }, st);
      await pg.evaluate(() => { const r = document.getElementById('rotate'); r && r.classList.remove('want'); });
      // 等小公園的正式模型（lazy）掛上來
      let park = null;
      for (let i = 0; i < 240; i++) {
        park = await pg.evaluate(() => { let o = null, mats = new Set(); GAME.E.scene.traverse(n => { if (n.name === 'wz_park_glb') o = n; }); if (!o) return null; o.traverse(n => { if (n.isMesh) [].concat(n.material).forEach(m => mats.add(m.name)); }); return { park3: mats.has('park3'), mats: mats.size }; });
        if (park) break; await pg.waitForTimeout(500);
      }
      console.log(ver, sz.tag, 'park', JSON.stringify(park));
      await pg.evaluate(() => { GAME.E.npcs.slice().forEach(n => { n.obj.visible = false; if (n.obj.parent) n.obj.parent.remove(n.obj); }); (GAME.E.extras || []).forEach(x => { if (x.rider && x.obj.parent) x.obj.parent.remove(x.obj); }); });
      await pg.evaluate(css => { let el = document.getElementById('fastShotsCss'); if (!el) { el = document.createElement('style'); el.id = 'fastShotsCss'; document.head.appendChild(el); } el.textContent = css; }, HIDE_HUD);
      for (const v of VIEWS.filter(v => !v.only || v.only === sz.tag)) for (const h of (QUICK ? [11] : HOURS)) {
        await pg.evaluate(([v, h]) => { const E = GAME.E, P = E.player; E.endCinematic && E.endCinematic(); P.obj.position.set(v.player[0], 0, v.player[1]); P.obj.rotation.y = v.player[2]; P.path = null; GAME.G.hour = h; E.applyTime(h); }, [v, h]);
        await pg.evaluate(() => [GAME.E.player].forEach(n => { const u = n.obj && n.obj.userData; if (u && u.anim) { u.anim.blink = 1e9; u.anim.blinkT = 0; } }));
        if (v.cam.pos) await pg.evaluate(([p, l]) => { const E = GAME.E; E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look = new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); }, [v.cam.pos, v.cam.look]);
        else await pg.evaluate(c => { const C = GAME.E.cam; C.mode = 'follow'; C.yaw = c.yaw; C.pitch = c.pitch; C.distTarget = c.dist; C.dist = c.dist; C.manualT = 999; }, v.cam);
        await pg.waitForTimeout(2500); await frames(pg, 6);
        await pg.evaluate(h => { GAME.E.player.busy = true; GAME.G.hour = h; GAME.E.hour = h; GAME.E.applyTime(h); GAME.updateHUD && GAME.updateHUD(); }, h);
        await frames(pg, 2);
        const out = `${OUT}/${ver}_${v.id}_${String(h).replace('.', '')}_${sz.tag}.png`;
        await pg.screenshot({ path: out });
        const info = await pg.evaluate(() => { const E = GAME.E, P = E.player.obj.position, C = E.camera.position; return { zone: GAME.G.zone, hour: +GAME.G.hour.toFixed(2), player: [+P.x.toFixed(2), +P.z.toFixed(2)], cam: [+C.x.toFixed(2), +C.y.toFixed(2), +C.z.toFixed(2)], fps: E.fps }; });
        console.log('shot', out, JSON.stringify(info), 'errors:', errs.slice(0, 3).join(' | '));
        await pg.evaluate(() => { GAME.E.player.busy = false; });
      }
      if (process.env.POST) console.log('post', ver, sz.tag, JSON.stringify(await pg.evaluate(process.env.POST)));   // 拍完之後在同一個場景量東西（例：車架旁邊的路燈位置）
      await ctx.close();
    }
  }
  await b.close();
})();
