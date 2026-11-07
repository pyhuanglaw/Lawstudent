"""CC-B（帳號 B）11-07：GYM-FIT-1107（LAWWW-B 04:07 追加⑥，9cff7a00b；使用者 11-07「健身房都是玻璃門 門不夠明顯」）。
  新體育館 B1（gym_b1）健身中心的門（gym_layout b1.fitness.door：x 3.2～5.0、z 3.0，走廊在北邊 z −0.2～3.0）：
    ① 走廊往健身中心看（從東邊閘門那頭斜看過去）、② 門口正面，白天 14:00、晚上 20:00 各一張——BB 看「一看就是門」（深色門框、亮的招牌、地墊）；
    ③ 走得進去：從走廊照玩家點地走進健身中心裡面（門內 2 m），沒有被放到目的地、站得住。
  【前置／捷徑】讀檔到 B1 走廊（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_gymfit_1107_probe.py <url> <out>"""
import os, sys, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('gymfit_1107', OUT); D.setup(R, OUT)
DAY = '2025-10-18'   # 星期六（不是第四個週一＝沒休館）
DOOR = r"""(()=>{ const B=(typeof GYM_LAYOUT!=='undefined'&&GYM_LAYOUT.b1)||null; const d=B&&B.fitness&&B.fitness.door; return d?{x0:d.x0,x1:d.x1,z:d.z, cor:B.corridor, fit:{x0:B.fitness.x0,x1:B.fitness.x1,z0:B.fitness.z0,z1:B.fitness.z1}}:null; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC GYMFIT_1107（體育館 B1 健身中心的門）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        if not R.check('這一版有 gym_b1（Z3.ZONES）', await pg.evaluate("!!Z3.ZONES.gym_b1")): await b.close(); sys.exit(1)
        d = await pg.evaluate(DOOR)
        if not R.check('GYM_LAYOUT.b1.fitness.door 讀得到', bool(d), J(d)): await b.close(); sys.exit(1)
        cx = (d['x0'] + d['x1']) / 2; dz = d['z']; czc = (d['cor']['z0'] + d['cor']['z1']) / 2
        R.note('健身中心門 x %s～%s、z %s；走廊 z %s～%s（中線 %.2f）' % (d['x0'], d['x1'], dz, d['cor']['z0'], d['cor']['z1'], czc))
        for tn, h in (('day', 14.0), ('night', 20.0)):
            tag = '[%s]' % tn
            R.setup('%s 讀檔 B1 走廊 (%.1f, %.2f) %s %05.2f（條件事件關閉）' % (tag, cx + 6.0, czc, DAY, h))
            s = await D.load_zone(pg, cdp, 'gym_b1', DAY, h, x=cx + 6.0, z=czc, yaw=-1.5708, wait=8000)
            if not R.check('%s 讀到 gym_b1、站得住' % tag, s['zone'] == 'gym_b1' and s['stand'], J(s)): continue
            await D.user_shot(pg, cdp, 'gymfit_corridor_%s' % tn, {'eye': [cx + 7.5, 1.6, d['cor']['z0'] + 0.5], 'look': [cx, 1.3, dz], 'lens': 22})
            await D.user_shot(pg, cdp, 'gymfit_front_%s' % tn, {'eye': [cx, 1.6, d['cor']['z0'] + 0.4], 'look': [cx, 1.5, dz + 2.0], 'lens': 22})
            if tn == 'day':   # 走得進去（白天一次就好）
                fb0 = s['fb']; tx, tz = cx, dz + 2.0
                ok_w = await L.go_to(pg, cdp, R, tx, tz, 0.5, '%s 從走廊走進健身中心（門內 2 m）' % tag, max_s=90)
                q = await D.st(pg)
                inside = d['fit']['x0'] < q['x'] < d['fit']['x1'] and q['z'] > dz + 0.5
                R.check('%s 走進健身中心：人在門內（z > %.1f）、站得住、沒有被放到目的地' % (tag, dz + 0.5), inside and q['stand'] and q['fb'] == fb0, J({'x': q['x'], 'z': q['z'], 'stand': q['stand'], 'fb': q['fb'] - fb0, 'go_to': ok_w}))
                await D.user_shot(pg, cdp, 'gymfit_inside_back_%s' % tn, {'eye': [cx, 1.6, dz + 5.0], 'look': [cx, 1.4, dz - 0.5], 'lens': 22})
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
