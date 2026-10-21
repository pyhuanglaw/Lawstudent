"""BUG-CAM-C208-1021：C 棟 208 的跟隨鏡頭卡在牆後面（BB_218 artrev2 57、58、62、77、78 的五個位置與方向）。
[前置] 讀使用者 9/25 存檔；[捷徑] 旗標 US_DEPARTED、US_ARRIVED、GAME.enter('us_shared')、搬玩家、設鏡頭方向（之後不碰鏡頭，讓遊戲自己拉近／轉開）。
每個位置拍兩張：設好方向 1 秒後、6 秒後（自動轉開要一點時間）。用法：python3 c208cam_check.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
CASES = [('57_corridor_camN', 0.4, 4.0, math.pi), ('58_corridor_camW', 0.4, 4.0, -math.pi / 2), ('62_door_camE', -1.0, 2.2, math.pi / 2),
         ('77_kitchen_camS', -2.6, 1.9, 0.0), ('78_kitchen_camE', -2.6, 1.9, math.pi / 2)]
CAM = "(()=>{ const c=GAME.E.camera.position, p=GAME.E.player.obj.position, C=GAME.E.cam; return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(2)), horiz:+Math.hypot(c.x-p.x,c.z-p.z).toFixed(2), yaw:+C.yaw.toFixed(2), cols:!!(GAME.E.zone&&GAME.E.zone.camCols)}; })()"
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('c208cam_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(()=>{ Object.assign(GAME.G.flags,{US_DEPARTED:true,US_ARRIVED:true}); })()")
        await pg.evaluate("(async()=>{ GAME.G.hour=17.75; GAME.E.hour=17.75; await GAME.enter('us_shared'); })()"); await pg.wait_for_timeout(15000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        run.setup('[捷徑] us_shared 17:45')
        for tag, x, z, yaw in CASES:
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y+Math.PI; const C=GAME.E.cam; C.yaw=y; C.manualT=0; C.dragging=false; C.swing=0; })(%s)" % json.dumps([x, z, yaw]))
            await pg.wait_for_timeout(1000); s1 = await pg.evaluate(CAM); await run.shot(pg, tag + '_1s')
            await pg.wait_for_timeout(5000); s4 = await pg.evaluate(CAM); await run.shot(pg, tag + '_6s')
            print(tag, '1s', json.dumps(s1), '4s', json.dumps(s4), flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
