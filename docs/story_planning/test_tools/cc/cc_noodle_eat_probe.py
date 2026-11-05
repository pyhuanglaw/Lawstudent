"""CC-C（帳號 C）11-05 16:1x：NOODLE_EAT（BB-C 10:48／16:11 P0，v9.10.21 發布樹 aa0f3bcd3；NOODLE-AP-1105）——公館燒臘店（noodle）坐下吃飯那一場。
  照玩家：讀檔店裡 12:30 → 走到店裡的位子按（noodleScene）→ 選第一個（叉燒飯 100 元）→ 自動走到 seatApproach、坐下 → 截圖；記 GAME.walkFallbacks（期望 0：BB-C 10:27 舊寫法要等 4 秒 fallback）。
  第一次寫、還沒在雲端試過（CC-C 使用量快到）；失敗先看 run.log 是不是探針的問題。
用法：LW_TESTS=<wt>/tests python3 cc_noodle_eat_probe.py <url> <out>"""
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
R = L.Run('noodle_eat', OUT); D.setup(R, OUT)
ITS = r"""(()=>GAME.E.interactables.filter(i=>!i.hidden&&!i.exit).map(i=>({label:i.label||'', x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||0.9, lv:i.lv|0, seat:!!i.seat})))()"""


async def main():
    print('CC NOODLE_EAT（燒臘店坐下吃飯）：SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % os.environ.get('SHA', '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for day in ('2025-10-15', '2025-10-18'):
            R.setup('讀檔燒臘店 noodle %s 12:30（出生點）' % day)
            s = await D.load_zone(pg, cdp, 'noodle', day, 12.5, wait=6000)
            if not R.check('[%s] 讀到燒臘店' % day, s['zone'] == 'noodle', J(s)): continue
            for _ in range(10):
                q = await D.st(pg)
                if not q['dlg']: break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400)
            its = await pg.evaluate(ITS); R.note('[%s] 店裡的互動點：%s' % (day, J(its)))
            cand = [i for i in its if i['seat']] or [i for i in its if any(k in i['label'] for k in ('吃', '點', '坐'))]
            if not R.check('[%s] 有可以坐下吃飯的位子' % day, bool(cand), J(its)): continue
            it = cand[0]
            tgt = await D.standable_near(pg, it['x'], it['z'], it['r'] * 0.6, it['lv'])
            await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.3, '[%s] 位子「%s」' % (day, it['label']), max_s=120, lv=it['lv'])
            q = await D.settle(pg)
            if not R.check('[%s] 走到位子，按鈕是「%s」' % (day, it['label']), q['interact'].startswith(it['label'][:4]), J(q)): continue
            fb0 = await pg.evaluate("GAME.walkFallbacks||0")
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            sat = False; seen = []; t0 = time.time(); shot = False
            while time.time() - t0 < 60:
                q = await D.st(pg)
                if q['seat'] and not shot:
                    await pg.wait_for_timeout(1500); await D.shot(pg, 'noodle_eat_%s' % day.replace('-', '')); shot = True; sat = True
                if q['choices']:
                    seen.append(q['choices']); k = 0
                    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(1000); continue
                if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                if shot and not q['busy']: break
                await pg.wait_for_timeout(400)
            fb = await pg.evaluate("GAME.walkFallbacks||0")
            R.note('[%s] 選項：%s' % (day, J(seen)))
            R.check('[%s] 選叉燒飯以後坐下了（截圖 noodle_eat_%s.png）' % (day, day.replace('-', '')), sat, J(await D.st(pg)))
            R.check('[%s] 走到位子沒有用 fallback 放過去（GAME.walkFallbacks 多 %d）' % (day, fb - fb0), fb == fb0, J({'before': fb0, 'after': fb}))
            mv = await D.pushable(pg, cdp)
            R.check('[%s] 吃完推得動' % day, mv >= 0.3, J(mv))
            break
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
