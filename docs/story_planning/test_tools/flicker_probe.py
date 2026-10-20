"""BB：BUG-COPLANAR-DEV——霖澤館穿堂、玻璃大廳、萬才館正面有沒有閃爍或破面。
[前置／捷徑] 讀檔到校園 2025-09-10 15:00、站在各個位置（只改站的位置）；鏡頭固定，每個角度連拍兩張（隔 0.6 秒），算兩張的差：鏡頭沒動、畫面有一塊在變＝閃爍。
另外截一張晚上 20:30。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageChops
URL = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SPOTS = [('linze_front', 34, -96, 0.0), ('linze_portal', 34, -108, 0.0), ('linze_portal_back', 34, -118, 3.14), ('wancai_front', 93.8, -92, 0.0), ('wancai_side', 84, -95, 0.6)]
async def main():
    run = L.Run('flicker_probe', OUT); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for hour in (15.0, 20.5):
            d = await pg.evaluate("STORY.dayOfKey('2025-09-10')")
            st = {'stage': 'law', 'zone': 'campus', 'day': d, 'weekday': 3, 'hour': hour, 'pos': {'x': 34, 'z': -96, 'yaw': 0}, 'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'afternoonDone': True, 'zheNoodleDone': True, 'fundsV2': 1, 'KX_FIRST_MSG': True}, 'events': {'done': {}, 'last': {}, 'count': 0}}
            run.setup('讀檔到校園 2025-09-10 %.1f' % hour); await L.load_state(pg, st); await pg.wait_for_timeout(5000)
            for _ in range(10):
                s = await L.state(pg)
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400)
                else: break
            await L.close_panels(pg, cdp)
            await pg.evaluate("document.querySelectorAll('#hud,#hudR,#joy,#interact,#btnPhone,#btnMenu,#btnBigMap,#minimap,.toast').forEach(e=>e.style.visibility='hidden')")
            for name, x, z, yaw in SPOTS:
                if hour > 16 and not name.endswith('front'): continue
                await pg.evaluate("((x,z,yaw)=>{ const P=GAME.E.player.obj; P.position.x=x; P.position.z=z; P.rotation.y=yaw; GAME.E.cam.yaw=yaw+Math.PI; })(%s,%s,%s)" % (x, z, yaw))
                await pg.wait_for_timeout(3500)
                tag = '%s_%02d' % (name, int(hour))
                a = os.path.join(OUT, tag + '_a.png'); bb = os.path.join(OUT, tag + '_b.png')
                await pg.screenshot(path=a); await pg.wait_for_timeout(600); await pg.screenshot(path=bb)
                im1, im2 = Image.open(a).convert('L'), Image.open(bb).convert('L')
                diff = ImageChops.difference(im1, im2).point(lambda v: 255 if v > 40 else 0)
                n = sum(1 for v in diff.getdata() if v); bbox = diff.getbbox()
                res[tag] = {'diffPx': n, 'bbox': bbox}; print(tag, json.dumps(res[tag]), flush=True)
                if n > 50: diff.save(os.path.join(OUT, tag + '_diff.png'))
        run.check('鏡頭不動時連拍兩張，畫面變化 ≤ 50 像素（沒有閃爍）', all(v['diffPx'] <= 50 for v in res.values()), json.dumps(res))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
