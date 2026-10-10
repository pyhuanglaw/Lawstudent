"""真實玩家流程：星期四進霖澤館上民法總則（永久回歸案例：2026-10-10 線上回報「才進入教室就卡住沒辦法找到地方坐下」）。
不用 ?turbo——上課劇情的自動走路要真的走過去（turbo 會瞬移，舊測試因此沒抓到這個 bug）。
前置（捷徑，會標示）：讀檔到星期四 12:55、霖澤館門口、已讀案例。
玩家操作（真的介面）：點互動按鈕進霖澤館 → 等劇情自己走到座位坐下（不能靠「卡住後傳送」的保險）→ 點對話、選選項上完課 →
下課後恢復控制 → 用搖桿走到教室後門 → 點「離開教室」→ 回到校園、站得住、走得動。
用法：python3 tests/flow_class_real.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_class_real'


async def main():
    run = L.Run('flow_class_real', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：星期四 12:55（第 2 天），霖澤館門口 (34,-98.6)，已讀案例（readCase=full）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 12.92, 'day': 2, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': 34, 'z': -98.6, 'yaw': 3.14},
                                'flags': {'introDone': True, 'campusIntro': True, 'readCase': 'full'}})
        await pg.wait_for_timeout(3000)
        s = await L.state(pg)
        run.check('門口出現「進入霖澤館」按鈕', s['interact'].startswith('進入霖澤館'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); run.note('點了互動按鈕')
        # 等進教室、劇情自己走到座位坐下、教授開口
        t0 = time.time(); last_xy = None; still_since = time.time(); stuck = False; reached = False; path_log = []
        while time.time() - t0 < 240:
            s = await L.state(pg)
            xy = (round(s['x'], 1), round(s['z'], 1))
            if xy != last_xy: last_xy = xy; still_since = time.time(); path_log.append(xy)
            if s['zone'] == 'classroom' and s['dlg']: reached = True; break
            if s['zone'] == 'classroom' and s['pose'] in ('walk', 'run') and time.time() - still_since > 25: stuck = True; break
            await pg.wait_for_timeout(1000)
        await run.shot(pg, 'class_seated_or_stuck')
        run.note('走過的位置：' + ' → '.join(f'({x},{z})' for x, z in path_log[-12:]))
        run.check('劇情自動走到座位、教授開始上課（沒有卡在走路）', reached and not stuck, json.dumps(s, ensure_ascii=False))
        run.check('自動走路沒有用到「卡住後傳送」的保險', s.get('fallbacks', 0) == 0, f"fallbacks={s.get('fallbacks', 0)}")
        if not reached:
            await b.close(); sys.exit(run.finish())
        sit = await pg.evaluate("GAME.E.player.pose")
        run.check('坐在座位上（姿勢 sit）', sit == 'sit', sit)
        # 上課：點對話、選第一個選項，直到下課、恢復控制
        s = await L.advance_dialogs(pg, cdp, run, until=lambda s: (not s['dlg']) and (not s['choices']) and (not s['busy']) and s['zone'] == 'classroom' and s['hour'] >= 15.0, max_steps=160)
        await run.shot(pg, 'after_class')
        fl = await pg.evaluate("({done:!!GAME.G.flags.classDone, ans:GAME.G.flags.classAnswer||null, now:!!GAME.G.flags.classNow})")
        run.check('下課：classDone、恢復控制（沒有對話、沒有鎖住）', fl['done'] and not fl['now'] and not s['busy'] and not s['dlg'], json.dumps(dict(s, **fl), ensure_ascii=False))
        # 下課後像玩家一樣走到後門：點地面（引擎的自動找路）優先，走不動才用搖桿
        ex = await L.find_it(pg, '離開教室')
        await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '教室後門') if ex else None
        await pg.wait_for_timeout(800)
        s = await L.state(pg)
        run.check('走到後門（點地面／搖桿），出現「離開教室」', s['interact'].startswith('離開教室'), json.dumps(s, ensure_ascii=False))
        if s['interact'].startswith('離開教室'):
            await L.tap(pg, cdp, '#interact')
            for i in range(30):
                s = await L.state(pg)
                if s['zone'] == 'campus' and not s['busy']: break
                if s['dlg'] or s['choices']: await L.advance_dialogs(pg, cdp, run, until=lambda s: not s['dlg'] and not s['choices'], max_steps=30)
                await pg.wait_for_timeout(700)
            await pg.wait_for_timeout(1500)
            s = await L.state(pg)
            before = (s['x'], s['z'])
            await L.joystick(pg, cdp, 0, -40, 1500)
            s2 = await L.state(pg)
            moved = math.hypot(s2['x'] - before[0], s2['z'] - before[1])
            await run.shot(pg, 'back_on_campus')
            run.check('回到校園、站得住、搖桿走得動', s2['zone'] == 'campus' and s2['stand'] and moved > 0.5, json.dumps(s2, ensure_ascii=False) + f' 走了 {moved:.2f} m')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
