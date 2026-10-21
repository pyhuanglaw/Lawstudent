"""BUG-CAM-203-R2-1021：大一 203 站在 R2 書桌旁 (1.0, 0.25)，鏡頭在東／南（BB_218 artrev3 01、04）；另外坐在自己書桌前、鏡頭轉到北／南。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter('dorm')、搬玩家、設鏡頭方向（之後不碰，讓遊戲自己拉近／轉開）。用法：python3 dorm_check.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
CASES = [('r2_camE', 1.0, 0.25, math.pi / 2), ('r2_camS', 1.0, 0.25, 0.0)]
CAM = "(()=>{ const c=GAME.E.camera.position, p=GAME.E.player.obj.position, C=GAME.E.cam; return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(2)), horiz:+Math.hypot(c.x-p.x,c.z-p.z).toFixed(2), yaw:+C.yaw.toFixed(2), cols:!!(GAME.E.zone&&GAME.E.zone.camCols)}; })()"
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('dorm_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(async()=>{ GAME.G.hour=15; GAME.E.hour=15; await GAME.enter('dorm'); })()"); await pg.wait_for_timeout(15000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        run.setup('[捷徑] dorm 15:00')
        for tag, x, z, yaw in CASES:
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y+Math.PI; const C=GAME.E.cam; C.yaw=y; C.manualT=0; C.dragging=false; C.swing=0; })(%s)" % json.dumps([x, z, yaw]))
            await pg.wait_for_timeout(1000); s1 = await pg.evaluate(CAM); await run.shot(pg, tag + '_1s')
            await pg.wait_for_timeout(5000); s6 = await pg.evaluate(CAM); await run.shot(pg, tag + '_6s')
            print(tag, '1s', json.dumps(s1), '6s', json.dumps(s6), flush=True)
        # 坐在自己書桌前，鏡頭轉到北、南（坐著不會自動轉）
        it = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.label==='坐在書桌前'); return it?{x:it.x,z:it.z}:null; })()")
        if it:
            await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.label==='坐在書桌前'); const P=GAME.E.player; P.obj.position.set(it.seat.ap[0],P.obj.position.y,it.seat.ap[1]); GAME.sitAt(P,it.seat); })()")
            await pg.wait_for_timeout(4000)
            for tag, yaw in (('seated_camN', math.pi), ('seated_camS', 0.0)):
                await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=0; })(%s)" % yaw); await pg.wait_for_timeout(4000)
                s = await pg.evaluate(CAM); sit = await pg.evaluate("!!(GAME.E.player.seat)"); await run.shot(pg, tag); print(tag, json.dumps(s), 'seated', sit, flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
