"""CC-C（帳號 C）11-05：DORM_WALL（BB-C 06:26 第 2 點；LAWWW2-C 4eada314b DORM1-WALL-SEAM：男一舍門廳牆縫 T 形接頭）——判定歸 BB。
  照 docs/art-rebuild/second_ai/test_shots/dorm_hall_lm_1028 的角度重拍（白天 14:00 三張、晚上 20:30 三張；那份 README 沒寫座標，照它的說明＋src/data/dorm_layout.js 取）：
    1 門口、交誼廳：人在大門出生點 (0, 5.6) 面向裡面、遊戲鏡頭
    2 交誼廳西邊、一樓走廊往西：人在 (2.0, 1.0) 面向西
    3 樓梯口、二樓走廊：人在樓梯口 (0, −1.0) 面向北；二樓走廊 (−6, 0) 面向西
  加兩張近看（接縫那一份 seam_fix 的兩處）：門框上方（一樓走廊北牆）、樓梯間開口（鏡頭 50 mm）。修改前 9ea82730f、修改後 4eada314b，同一支探針各跑一次對照。
  只看：牆縫還有沒有透光、看不看得到外面（截圖給 BB 看；另外每張算黑畫面）；那一段走過去不穿牆：沿一樓走廊北牆走一趟、上樓梯到二樓再下來，每一點都站得住、沒有被放到目的地。
用法：LW_TESTS=<wt>/tests [TAG=before|after] python3 cc_dorm_wall_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
TAG = os.environ.get('TAG') or os.environ.get('SHA', 'x')[:9]
R = L.Run('dorm_wall', OUT); D.setup(R, OUT)
DAY = '2025-10-15'
ZN = 'dorm_hall'
VIEWS = [('1_entrance', 0.0, 5.6, 0, math.pi), ('2_lounge_west', 2.0, 1.0, 0, -math.pi / 2), ('3a_stairs', 0.0, -1.0, 0, math.pi), ('3b_2f_corridor', -6.0, 0.0, 1, -math.pi / 2)]
CLOSE = [('seam_doorframe', {'eye': [-6.0, 1.6, 1.0], 'look': [-6.0, 2.3, -1.4], 'lens': 50}), ('seam_stairwell', {'eye': [0.0, 1.6, 1.2], 'look': [0.0, 2.8, -1.4], 'lens': 50})]


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC DORM_WALL（男一舍牆縫，%s）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for h, hn in ((14.0, 'day'), (20.5, 'night')):
            for nm, x, z, lv, yaw in VIEWS:
                R.setup('[%s %s] 讀檔男生宿舍 %s %05.2f、人在 (%s, %s) 第 %d 層' % (hn, nm, DAY, h, x, z, lv))
                s = await D.load_zone(pg, cdp, ZN, DAY, h, x, z, yaw, lv=lv, wait=9000)
                if not R.check('[%s %s] 讀到男生宿舍、站得住' % (hn, nm), s['zone'] == ZN and s['stand'], J(s)): continue
                await pg.evaluate("(y=>{ GAME.E.cam.yaw=y+Math.PI; })", yaw); await pg.wait_for_timeout(1500)   # 鏡頭在人的背後
                await pg.evaluate(D.HUD + '(false)'); await D.shot(pg, '%s_%s_%s' % (TAG, hn, nm)); await pg.evaluate(D.HUD + '(true)')
            s = await D.load_zone(pg, cdp, ZN, DAY, h, 0.0, 0.0, math.pi, wait=6000)
            for nm, cam in CLOSE:
                await D.user_shot(pg, cdp, '%s_%s_%s' % (TAG, hn, nm), cam)
            await pg.set_viewport_size({'width': 844, 'height': 390})
        # 走一趟：一樓走廊北牆、上樓梯到二樓、下來
        R.setup('[走一趟] 讀檔男生宿舍 %s 14:00、一樓走廊東端 (12.5, −0.9)' % DAY)
        await D.load_zone(pg, cdp, ZN, DAY, 14.0, 12.5, -0.9, -math.pi / 2, wait=8000)
        legs = [(-12.5, -0.9, 0, '沿一樓走廊北牆往西'), (0.0, -1.0, 0, '回到樓梯口'), (5.5, 0.4, 1, '上樓梯到二樓（203 門口，dorm_layout home.spawn）'), (-6.0, 0.0, 1, '二樓走廊往西'), (2.0, 1.0, 0, '下樓回一樓')]
        for tx, tz, lv, nm in legs:
            fb0 = (await D.st(pg))['fb']
            okw, smp = await D.walk_logged(pg, cdp, tx, tz, 0.4, '[走一趟] ' + nm, max_s=240, lv=lv)
            e = await D.settle(pg)
            bad = [[q['x'], q['z'], q['lv'], q['y']] for q in smp if q['zone'] == ZN and q['stand'] is False]
            R.check('[走一趟] %s：走到了（%.2f, %.2f 第 %d 層）、一路站得住、沒有被放到目的地' % (nm, e['x'], e['z'], e['lv']), okw and e['lv'] == lv and not bad and e['fb'] == fb0, J({'notStand': bad[:6], 'end': e}))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
