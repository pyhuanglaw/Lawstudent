"""診斷：霖澤館後面的小廣場 → 點大廳門口，人物走到後台階一半就停住（建築組交接 #2，瀏覽器才有、E.simWalk 走得到）。
做法：讀檔到後面的小廣場 (34,-125.39)、鏡頭 yaw≈2.75，用手指點大廳門口 (28.34,-107.6)，之後每 0.5 秒記錄
位置、高度、層、P.path（剩幾點、下一點）、pose、busy、blockedAt、E.canStand、目前位置到下一點的直線能不能走（losR）。
停住超過 4 秒就再點一次門口；再停住就推一次搖桿。
用法：python3 tools/dev_scratch/back_steps_diag.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/back_steps_diag'
DOOR = tuple(float(v) for v in (sys.argv[3].split(',') if len(sys.argv) > 3 else ('28.34', '-107.6')))
MODE = sys.argv[4] if len(sys.argv) > 4 else 'tap'   # mouse＝滑鼠點門口； tap＝點地面；joy＝一直推搖桿往大廳那一側（南、+z），到 z 超過目標為止；retap＝點門口，人物在台階上（高度 0.05–0.8）時每秒再點一次門口
PROBE = """(()=>{ const E=GAME.E, P=E.player, o=P.obj.position; const n=E.nav; const nx=P.path&&P.path[0];
  return {x:+o.x.toFixed(2), z:+o.z.toFixed(2), y:+o.y.toFixed(3), lv:P.lv|0, pose:P.pose, busy:!!P.busy, path:P.path?P.path.length:0, next:nx?[+nx[0].toFixed(2),+nx[1].toFixed(2),nx[2]]:null,
    blocked:P.blockedAt||null, stand:E.canStand(o.x,o.z,P.radius||0.32), h:+(n.heightAt(o.x,o.z)).toFixed(3), vh:+(n.visualHeightAt?n.visualHeightAt(o.x,o.z):0).toFixed(3),
    los:nx?n.losR(o.x,o.z,nx[0],nx[1],0.33):null, cam:+E.cam.yaw.toFixed(2), mode:E.cam.mode }; })()"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        if MODE == 'mouse':   # 桌機視窗（沒有觸控、不是手機），滑鼠點
            await ctx.close(); ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
            pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 34, 'z': -125.39, 'yaw': 0.4},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        await pg.evaluate("GAME.E.cam.yaw=2.75; GAME.E.cam.manualT=2;")
        await pg.wait_for_timeout(1500)
        if MODE in ('tap', 'retap'):
            r = await L.tap_ground(pg, cdp, DOOR[0], DOOR[1]); print('tap door', r, flush=True)
        elif MODE == 'mouse':   # 桌機：滑鼠點門口在畫面上的位置（不是觸控）
            pt = await pg.evaluate("(([x,z])=>{ const E=GAME.E; const v=new THREE.Vector3(x,E.heightAt(x,z,0),z).project(E.camera); return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]; })(%s)" % json.dumps(list(DOOR)))
            await pg.mouse.click(pt[0], pt[1]); print('mouse click', pt, flush=True)
        else:
            await pg.evaluate("GAME.E.cam.yaw=Math.PI; GAME.E.cam.manualT=2;"); await pg.wait_for_timeout(800)   # 鏡頭在北邊、看向南（大廳那一側）：搖桿往上＝往南（+z）
        t0 = time.time(); last = None; still = time.time(); retaps = 0; joys = 0; log = []
        while time.time() - t0 < 150:
            s = await pg.evaluate(PROBE); log.append(s)
            print(f'{time.time()-t0:6.1f}s', json.dumps(s, ensure_ascii=False), flush=True)
            if math.hypot(s['x'] - DOOR[0], s['z'] - DOOR[1]) < 1.0 or (MODE == 'joy' and s['z'] > DOOR[1]): print('ARRIVED'); break
            if MODE == 'joy': await L.joystick(pg, cdp, 0, -40, 500); joys += 1; continue
            if MODE == 'retap' and 0.05 < s['y'] < 0.8:
                r = await L.tap_ground(pg, cdp, DOOR[0], DOOR[1]); print('RETAP-ON-STEPS', r, flush=True)
            xy = (s['x'], s['z'])
            if last is None or math.hypot(xy[0] - last[0], xy[1] - last[1]) > 0.05: last = xy; still = time.time()
            if time.time() - still > 4:
                await pg.screenshot(path=f'{OUT}/stuck_{retaps}_{joys}.png')
                if retaps < 2:
                    retaps += 1; r = await L.tap_ground(pg, cdp, DOOR[0], DOOR[1]); print('RETAP', r, flush=True)
                else:
                    joys += 1; await L.joystick(pg, cdp, 0, -40, 900); print('JOYSTICK', flush=True)
                still = time.time()
            await pg.wait_for_timeout(500)
        json.dump(log, open(f'{OUT}/log.json', 'w'), ensure_ascii=False, indent=0)
        print('errors', errs[:3])
        await b.close()

asyncio.run(main())
