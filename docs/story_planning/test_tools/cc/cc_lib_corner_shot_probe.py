"""CC（帳號 A）11-03：總圖大廳東南角 (11.39, −2.8)（BB 22:29：N20_tour_joy2 玩家在這裡卡了 6 秒）的截圖＋那裡的導航格。
  【前置／捷徑】讀檔到 library_hall 第 0 層、站在 (11.39, −2.8)——只為了截圖，不是玩家流程。
  橫向截三張：鏡頭朝西（館員那一側）、朝東（牆）、朝南（擋住的東西）。記下 ±1.5 m 的導航格（# 擋住、. 可走）和附近的碰撞盒。
  另外：搖桿往四個方向各推 1 秒，記下走得出去的方向（量：至少一個方向走得出去＝沒有被困住）。
用法：LW_TESTS=<wt>/tests python3 cc_lib_corner_shot_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
P = (11.39, -2.8)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


GRID = """(([px,pz])=>{ const E=GAME.E, nv=(E.levels&&E.levels[0])||E.nav, rows=[]; for(let dz=-1.5;dz<=1.51;dz+=0.25){ let r=''; for(let dx=-1.5;dx<=1.51;dx+=0.25){ const x=px+dx, z=pz+dz; r+=(Math.abs(dx)<0.01&&Math.abs(dz)<0.01)?'@':(nv.free(x,z)?'.':'#'); } rows.push(r); } return rows; })(%s)"""
POS = "(()=>{ const p=GAME.E.player.obj.position; return [+p.x.toFixed(2), +p.z.toFixed(2), GAME.E.player.lv|0]; })()"


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        print('  [前置／捷徑] 讀檔 library_hall 第 0 層 (%s, %s)，2025-09-19 15:40' % P, flush=True)
        await L.load_state(pg, {'zone': 'library_hall', 'hour': 15.67, 'day': 3, 'weekday': 5, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': P[0], 'z': P[1], 'yaw': 0, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
        grid = await pg.evaluate(GRID % J(list(P)))
        print('  導航格（x %.2f→%.2f，z 由上往下 %.2f→%.2f）：' % (P[0] - 1.5, P[0] + 1.5, P[1] - 1.5, P[1] + 1.5), flush=True)
        for r in grid: print('    ' + r, flush=True)
        for nm, (tx, tz) in (('west', (P[0] - 6, P[1])), ('east', (P[0] + 3, P[1])), ('south', (P[0], P[1] + 3))):
            await L.turn_camera_to(pg, cdp, tx, tz); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(OUT, 'corner_%s.png' % nm))
        moved = {}
        for nm, (dx, dy) in (('前', (0, -60)), ('左', (-60, 0)), ('右', (60, 0)), ('後', (0, 60))):
            await L.load_state(pg, {'zone': 'library_hall', 'hour': 15.67, 'day': 3, 'weekday': 5, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': P[0], 'z': P[1], 'yaw': 0, 'lv': 0}}, quiet_events=True)
            await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
            a = await pg.evaluate(POS); await L.joystick(pg, cdp, dx, dy, 1000); c = await pg.evaluate(POS)
            moved[nm] = round(((c[0] - a[0]) ** 2 + (c[1] - a[1]) ** 2) ** 0.5, 2)
        print('  搖桿各推 1 秒走了幾公尺：' + J(moved), flush=True)
        check('至少一個方向走得出去（≥ 0.3 m）＝沒有被困住', any(v >= 0.3 for v in moved.values()), J(moved))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
