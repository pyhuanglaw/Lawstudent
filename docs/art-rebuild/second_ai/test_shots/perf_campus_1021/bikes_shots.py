"""PERF-CAMPUS-SHADOW-1020：停著的腳踏車分區合併前後，同一個位置、同一個鏡頭的遊戲畫面（近的車要在、遠的不畫看不看得出來）。
[前置] 讀使用者 9/25 存檔；[捷徑] 15:00 GAME.enter('campus')、搬玩家、設鏡頭方向與距離。用法：python3 bikes_shots.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
SHOTS = [('avenue_racks_N', (-48, -11.5, 0.0), 0.0, None, None),          # 大道北側的停車架（玩家站在車前面，鏡頭在南）
         ('avenue_east_long', (-40, 0.0, math.pi / 2), -math.pi / 2, 9.0, 0.18),   # 沿大道往東看遠處（遠的停車架會不會突然不見）
         ('law_rack', (58, -98.5, math.pi), 0.0, None, None),             # 法學院前的停車架
         ('soc_bikes', (24, -61, 0.0), 0.0, None, None)]                   # 社科院附近的單台車
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('bikes_shots', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(async()=>{ GAME.G.hour=15; GAME.E.hour=15; await GAME.enter('campus'); })()"); await pg.wait_for_timeout(15000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        run.setup('[捷徑] campus 15:00')
        d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
        for name, (x, z, face), yaw, d, pi in SHOTS:
            await pg.evaluate("(([x,z,f,y,d,pp])=>{ const E=GAME.E, P=E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=f; const C=E.cam; C.yaw=y; C.distTarget=d; C.pitch=pp; C.manualT=60; })(%s)" % json.dumps([x, z, face, yaw, d or d0, pi or p0]))
            await pg.wait_for_timeout(4500)
            info = await pg.evaluate("(()=>{ const R=GAME.E.renderer; GAME.E.render(); return {calls:R.info.render.calls, tris:R.info.render.triangles, chunks:GAME.E.zone.parkedBikes?GAME.E.zone.parkedBikes.chunks.filter(c=>c.o.visible).length+'/'+GAME.E.zone.parkedBikes.chunks.length:'-'}; })()")
            print(name, json.dumps(info), flush=True); run.note('%s %s' % (name, json.dumps(info)))
            await run.shot(pg, name)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
