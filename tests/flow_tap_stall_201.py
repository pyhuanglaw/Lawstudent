"""點地面點到人過不去的地方，不要一直原地走（v9.7 回歸 LAWWW2 回報，開發分支 7247f1a）——瀏覽器、真的用手指點畫面。
201 階梯教室：人站在第 4 排平台 (-2, 3.43)，點第 5 排長桌邊上 (-2.01, 3.83)（人的半徑 0.33 m 過不去）。
  修正前：路線一直留著、pose 一直是 walk、位置不動（候選 8、候選 14 停了 12～20 秒以上都沒停）。
  修正後：1.5 秒（遊戲時間）後放掉路線、站好。
另外點走道上走得到的地方，照常走到（不能因為這個修正走一半就停）。
[前置／捷徑] 讀檔到 201（週六上午沒有課），只用來把人放到那個位置；之後都是手指點畫面。
用法：python3 tests/flow_tap_stall_201.py URL [輸出資料夾]（Playwright 手機模擬＋SwiftShader，不是 iPhone 實機）"""
import asyncio, json, math, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_tap_stall_201'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}


async def watch(pg, secs_wall, until):
    """每 0.7 秒看一次狀態，最多 secs_wall 秒；until(s) 成立就停。回傳 (最後的狀態, 開始時的遊戲時間, 看到的紀錄)"""
    s0 = await L.state(pg); log = []; s = s0; t = 0.0
    while t < secs_wall:
        await pg.wait_for_timeout(700); t += 0.7; s = await L.state(pg)
        log.append((round((s['hour'] - s0['hour']) * 3600, 1), s['pose'], (s['path'] or 0), round(s['x'], 2), round(s['z'], 2)))
        if until(s): break
    return s, s0, log


async def main():
    run = L.Run('flow_tap_stall_201', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        run.setup('讀檔：201 階梯教室、週六 10:00、人站在第 4 排平台 (-2, 3.43)')
        sat = await pg.evaluate("(()=>{ for(let d=20;d<120;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&CALENDAR.dateOf(d).wd===6) return d; } return 27; })()")
        await L.load_state(pg, {'zone': 'classroom', 'day': sat, 'weekday': 6, 'hour': 10.0, 'weather': 'clear', 'flags': dict(FLAGS), 'pos': {'x': -2, 'z': 3.43, 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(9000)
        s = await L.state(pg); run.note(f"讀檔後：({s['x']:.2f},{s['z']:.2f}) pose {s['pose']}")
        await L.turn_camera_to(pg, cdp, -2.0, 4.6); await pg.wait_for_timeout(1500)
        await run.shot(pg, 'before_tap')
        # 1. 點長桌邊上（走不到）
        pt = None
        for zz in (3.83, 3.9, 3.78, 4.0):
            pt = await L.tap_ground(pg, cdp, -2.01, zz)
            if pt: break
        run.note('點長桌邊上：' + json.dumps(pt))
        if not run.check('點得到第 5 排長桌邊上那一點（畫面上看得到）', bool(pt)): await run.shot(pg, 'no_tap'); await b.close(); return run.finish()
        await pg.wait_for_timeout(600)
        s1 = await L.state(pg); run.note(f"點下去以後：path {(s1['path'] or 0)} 段、pose {s1['pose']}、落點 {pt.get('hit')}")
        s, s0, log = await watch(pg, 90, lambda q: not q['path'] and q['pose'] == 'idle')
        run.note('紀錄（遊戲秒數, pose, 路線段數, x, z）：' + json.dumps(log[-12:]))
        gsec = round((s['hour'] - s0['hour']) * 3600, 1)
        moved = math.hypot(s['x'] - (-2), s['z'] - 3.43)
        await run.shot(pg, 'after_stall')
        run.check('點到走不到的地方：放掉路線、站好（不會一直原地走）', not s['path'] and s['pose'] == 'idle', f"遊戲時間過了 {gsec} 秒；path {(s['path'] or 0)}、pose {s['pose']}")
        run.check('站好之前沒有原地走太久（遊戲時間 4 秒內；規則是 1.5 秒沒有前進）', gsec <= 4.0, f'{gsec} 秒')
        run.check('人還在原本的平台上（沒有被推到別的地方）', moved < 0.5, f"({s['x']:.2f},{s['z']:.2f})，離原地 {moved:.2f} m")
        # 2. 點走道上走得到的地方：照常走到
        dst = await pg.evaluate("(()=>{ const C=CLASSROOM_LAYOUT, E=GAME.E; const ax=(C.aisleX0+C.aisleX1)/2; for(const z of [1.0,0.5,1.5,0,2.0]) if(E.canStand(ax,z,0.36,0)) return [ax,z]; return null; })()")
        run.note('走道上的點：' + json.dumps(dst))
        pt2 = None
        if dst:
            await L.turn_camera_to(pg, cdp, dst[0], dst[1]); await pg.wait_for_timeout(1200)
            pt2 = await L.tap_ground(pg, cdp, dst[0], dst[1], verify=True)
        run.note('點走道：' + json.dumps(pt2))
        if pt2:
            s, s0, log = await watch(pg, 150, lambda q: not q['path'] and q['pose'] == 'idle')
            h = pt2.get('hit') or dst; d = math.hypot(s['x'] - h[0], s['z'] - h[1])
            await run.shot(pg, 'after_aisle')
            run.check('點走道上走得到的地方：照常走到（1 m 內、路線走完）', not s['path'] and d < 1.0, f"停在 ({s['x']:.2f},{s['z']:.2f})，離落點 {d:.2f} m；紀錄 {json.dumps(log[-4:])}")
        else:
            run.check('點得到走道上的點', False, json.dumps(dst))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
