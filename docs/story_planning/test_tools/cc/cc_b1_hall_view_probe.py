"""CC-B（帳號 B）11-08：B1 會議廳黑天花板——玩家站得到的地方看不看得到（BB-B 13:45）。判定＝BB。
【前置／捷徑】讀檔把玩家放在站得住的點（E.canStand 半徑 0.3、lv 0），朝會議廳；用遊戲自己的跟隨鏡頭（鏡頭在玩家背後）拍；
印：畫面整張、上半部「很暗（灰階 < 40）」的像素比例。
用法：LW_TESTS=<wt>/tests python3 cc_b1_hall_view_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
from PIL import Image
URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('b1_hall_view', OUT); D.setup(R, OUT)
SPOTS = [('studyA_side', 0.0, -3.2, 0.0), ('studyA_side_w', -6.0, -3.2, 0.0), ('s_corr_east', 10.0, 6.1, -math.pi / 2), ('hall_door', 0.0, 6.4, math.pi)]
def dark(p):
    im = Image.open(p).convert('L'); w, h = im.size; px = im.load()
    tot = top = 0; ntop = w * (h // 2)
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if px[x, y] < 40:
                tot += 1
                if y < h // 2: top += 1
    return round(100.0 * tot / ((w // 2) * (h // 2)), 1), round(100.0 * top / ((w // 2) * (h // 4)), 1)
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if R.check('遊戲載入', await L.wait_loaded(pg), ''):
            await pg.evaluate("localStorage.clear()")
            for nm, x, z, yaw in SPOTS:
                R.setup('[%s] 讀檔到 library_b1 2025-10-18 14:00，玩家 (%.1f, %.1f) yaw %.2f、跟隨鏡頭在背後' % (nm, x, z, yaw))
                s = await D.load_zone(pg, cdp, 'library_b1', '2025-10-18', 14.0, x=x, z=z, yaw=yaw, wait=9000)
                ok = await pg.evaluate("(a=>GAME.E.canStand(a[0],a[1],0.3))", [x, z])
                await pg.evaluate("(a=>{ const E=GAME.E; E.player.obj.rotation.y=a[0]; if(E.cam) E.cam.yaw=a[0]+Math.PI; })", [yaw])
                await pg.wait_for_timeout(3500)
                pos = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position, c=GAME.E.camera.position; return {p:[+o.x.toFixed(2),+o.z.toFixed(2)], lv:GAME.E.player.lv|0, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]}; })()")
                await pg.evaluate(D.HUD + '(false)'); f = os.path.join(OUT, 'hallview_%s.png' % nm); await pg.screenshot(path=f); await pg.evaluate(D.HUD + '(true)')
                d = dark(f)
                R.note('[%s] 站得住 %s；%s；很暗像素：整張 %s%%、上半部 %s%%' % (nm, ok, J(pos), d[0], d[1]))
                R.check('[%s] 站得住、在 lv 0' % nm, ok is True and pos['lv'] == 0, J(pos))
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
