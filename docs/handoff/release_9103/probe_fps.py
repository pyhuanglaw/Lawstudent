"""搖桿只走 0.3 m 的原因：幀率太低（遊戲每格最多 0.1 秒、turbo 0.3 秒）還是前面真的被擋住。
新遊戲（舊開局 ?start0＋turbo，同 smoke_release）開場演完、收手機 → 量 5 秒幾格 → 前方 1 m 用 E.simWalk 走不走得到 → 推搖桿 4×1.5 秒，記走了多遠、這段時間過了幾格。
用法：python3 probe_fps.py URL 標籤"""
import asyncio, json, sys, time
sys.path.insert(0, '/home/user/Lawstudent/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, TAG = sys.argv[1], sys.argv[2]
class _R:
    def note(self, *a): pass
    def check(self, *a): pass
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(L.legacy_url(URL + '?turbo'))
        await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNew'); t0 = time.time()
        while time.time() - t0 < 300:
            s = await L.advance_dialogs(pg, cdp, _R(), until=lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=120)
            if await pg.evaluate("!!(GAME.G&&GAME.G.flags&&GAME.G.flags.introDone)&&!GAME.E.player.busy&&!GAME.D.active"): break
            await pg.wait_for_timeout(800)
        await L.phone_away(pg, cdp)
        f0 = await pg.evaluate("GAME.E.frame"); await pg.wait_for_timeout(5000); f1 = await pg.evaluate("GAME.E.frame")
        fw = await pg.evaluate("(()=>{ const E=GAME.E, p=E.player.obj.position, y=E.cam.yaw, fx=-Math.sin(y), fz=-Math.cos(y); return {x:+p.x.toFixed(2),z:+p.z.toFixed(2),camYaw:+y.toFixed(2),ahead1m:E.simWalk(p.x,p.z,p.x+fx,p.z+fz,{}),busy:!!E.player.busy,paused:!!E.paused,seat:!!E.player.seat,phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()")
        g0 = await pg.evaluate("GAME.E.frame"); moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5); g1 = await pg.evaluate("GAME.E.frame")
        print(json.dumps({'tag': TAG, 'fps_idle': round((f1 - f0) / 5, 2), 'pos': fw, 'moved': round(moved, 2), 'pushes': pushes, 'frames_during_push': g1 - g0, 'errs': errs[:2]}, ensure_ascii=False))
        await b.close()
asyncio.run(main())
