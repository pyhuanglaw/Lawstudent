"""霖澤館室內、201 階梯教室：固定鏡頭的遊戲內截圖（新舊比較、Blender 渲染對照、腳步貼合開關比較）。
用法：python3 tools/dev_scratch/linze_interior_shots.py URL 輸出資料夾 標籤 [寬x高] [--feet]
  URL 加 ?nobldg＝只看程序化備用模型（不載入 Blender GLB）。--feet：另外拍玩家在樓梯中段的近景，footIK 開／關各一張。
鏡頭用 GAME.E.cinematic（遊戲自己的運鏡）；HUD 照常顯示。"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright

URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
args = [a for a in sys.argv[4:] if not a.startswith('--')]
W, H = (int(v) for v in (args[0] if args else '844x390').split('x'))
FEET = '--feet' in sys.argv
os.makedirs(OUT, exist_ok=True)
# (區域, 名稱, 鏡頭, 看的點, 玩家站的位置 (x,z,lv))
VIEWS = [
    ('linze', 'lobby', (6.0, 2.0, 6.2), (-5.0, 2.6, -3.0), (5.0, 5.0, 0)),
    ('linze', 'stairs', (-1.6, 1.9, 3.6), (-6.6, 1.7, 0.8), (-6.6, 3.0, 0)),
    ('linze', 'gallery', (2.0, 5.9, -4.9), (-3.0, 2.6, 4.0), (1.0, -5.2, 1)),
    ('linze', 'elevator', (0.8, 2.3, 3.2), (4.6, 3.0, -2.0), (1.5, 2.5, 0)),
    ('classroom', 'from_door', (0.0, 3.7, 8.1), (-1.5, 1.2, -6.5), (1.0, 7.4, 0)),
    ('classroom', 'from_lectern', (2.5, 2.1, -7.6), (-0.5, 1.6, 4.0), (-1.5, -6.0, 0)),
    ('classroom', 'side', (7.0, 2.9, 0.6), (-2.0, 1.0, -1.5), (6.9, 3.0, 0)),
]


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for _ in range(360):   # 等開機載入完成（人物模型分批下載，2026-10-10 起可能超過 6 秒；太早讀檔，開機結束時會把 HUD 藏起來）
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        cur = None
        for zone, name, pos, look, stand in VIEWS:
            if not await pg.evaluate("(z=>!!Z3.ZONES[z])(%s)" % json.dumps(zone)): print('skip', zone, '（這個版本沒有這個區域）'); continue   # 舊版（線上 v9.3）沒有 linze
            if zone != cur:
                st = {'day': 8, 'weekday': 6, 'hour': 11.0, 'zone': zone, 'pos': {'x': stand[0], 'z': stand[1], 'yaw': 0, 'lv': stand[2]}, 'weather': 'sunny',
                      'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}, 'visited': {'dorm': True, 'campus': True}}
                js = "(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s," + json.dumps(st, ensure_ascii=False) + "); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
                await pg.evaluate(js); await pg.wait_for_timeout(2500); cur = zone
                t0 = time.time()
                while time.time() - t0 < 60:   # 正式模型（有的話）載入完成
                    ok = await pg.evaluate("(()=>{ const z=GAME.E.zone, k=z.id==='linze'?'bldg.linze_interior':'bldg.classroom_201'; return !ASSETS.manifest[k]||!!z.formal; })()")
                    if ok: break
                    await pg.wait_for_timeout(1000)
            await pg.evaluate("(([p,l,s])=>{ const E=GAME.E; if(E.placeAt) E.placeAt(E.player,s[0],s[1],s[2]); else E.player.obj.position.set(s[0],0,s[1]); E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.camera.lookAt(...l); })(%s)" % json.dumps([pos, look, stand]))
            await pg.wait_for_timeout(3500)
            formal = await pg.evaluate("!!GAME.E.zone.formal")
            f = os.path.join(OUT, f'{TAG}_{zone}_{name}.png'); await pg.screenshot(path=f); print('shot', f, 'formal' if formal else 'fallback')
        if FEET:   # 玩家在樓梯中段往上走（近景）：footIK 開／關
            st = {'day': 8, 'weekday': 6, 'hour': 11.0, 'zone': 'linze', 'pos': {'x': -6.6, 'z': 4.6, 'yaw': 0, 'lv': 0}, 'weather': 'sunny', 'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}
            js = "(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s," + json.dumps(st, ensure_ascii=False) + "); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
            await pg.evaluate(js); await pg.wait_for_timeout(3000)
            for ik in (True, False):
                await pg.evaluate("CHAR.footIK=%s; (()=>{ const E=GAME.E; E.placeAt(E.player,-6.6,4.6,0); E.moveTo(E.player,-6.6,1.9,null,0); })()" % ('true' if ik else 'false'))
                for k in range(3):
                    await pg.wait_for_timeout(1500)
                    await pg.evaluate("(()=>{ const E=GAME.E, o=E.player.obj.position; const p=new THREE.Vector3(o.x+2.2,o.y+0.9,o.z+0.6), l=new THREE.Vector3(o.x,o.y+0.45,o.z); E.cinematic(p,l); E.camera.position.copy(p); E.camera.lookAt(l); })()")
                    await pg.wait_for_timeout(600)
                    f = os.path.join(OUT, f'{TAG}_feet_{"ik" if ik else "noik"}_{k}.png'); await pg.screenshot(path=f); print('shot', f)
            await pg.evaluate("CHAR.footIK=true")
        info = await pg.evaluate("(()=>{ const r=GAME.E.renderer; return {calls:r.info.render.calls, tris:r.info.render.triangles, geoms:r.info.memory.geometries, tex:r.info.memory.textures}; })()")
        print('renderer', json.dumps(info), 'errors', errs[:5])
        await b.close()

asyncio.run(main())
