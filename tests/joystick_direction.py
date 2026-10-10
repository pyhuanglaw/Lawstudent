"""搖桿方向（永久回歸案例，2026-10-10 線上回報「在霖澤館外面跑的方向跟地圖就相反了」）。
引擎原本把搖桿方向依鏡頭角度旋轉時方向寫反：鏡頭朝正北／正南時對，轉 45° 偏 90°、轉到側面（90°／270°）時整個相反（往鏡頭這邊跑）。
舊測試只在鏡頭朝正北／正南推搖桿，所以沒抓到。

測法（手機模擬：iPhone 橫向、CDP 觸控按在 #joy）：
  1. [前置／捷徑] 讀檔到校園空地；每一組之前把玩家放回同一點、把鏡頭角度直接設成 0°、45°…315°（8 個角度）
  2. 推搖桿往上／右／下／左（4 個方向）各 2 秒：玩家實際移動的方向要和「畫面上推的方向」一致（鏡頭的前／右／後／左，誤差 ≤ 25°）
  3. 真的用手指拖曳轉鏡頭（不直接設角度）轉到側面，再推搖桿往上：要往畫面前方走
在第二十五批修正前的版本（92acd48）：45°、90°、270° 失敗（實測 90°、180°、180°）。
用法：python3 tests/joystick_direction.py URL [輸出資料夾]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/joystick_direction'
X0, Z0 = 0.0, 30.0   # 校園南側的空地（四周 6 m 內沒有障礙物）


async def push_and_measure(pg, cdp, jx, jy, ms=2000):
    s0 = await L.state(pg)
    await L.joystick(pg, cdp, jx, jy, ms)
    s1 = await L.state(pg)
    return s1['x'] - s0['x'], s1['z'] - s0['z'], s0['camYaw']


async def main():
    run = L.Run('joystick_direction', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup(f'讀檔：校園 ({X0},{Z0}) 11:00，條件事件關閉')
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': X0, 'z': Z0, 'yaw': 0},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(2500)
        dirs = [('上（前）', 0, -40), ('右', 40, 0), ('下（後）', 0, 40), ('左', -40, 0)]
        worst = 0
        for k in range(8):
            yaw = k * math.pi / 4
            for name, jx, jy in dirs:
                run.setup(f'玩家放回 ({X0},{Z0})、鏡頭角度設成 {k*45}°')
                await pg.evaluate("(([x,z,y])=>{ const E=GAME.E, P=E.player; P.path=null; P.obj.position.set(x,0,z); E.cam.yaw=y; E.cam.manualT=0; })(%s)" % json.dumps([X0, Z0, yaw]))
                await pg.wait_for_timeout(500)
                dx, dz, cy = await push_and_measure(pg, cdp, jx, jy)
                d = math.hypot(dx, dz)
                # 畫面方向 → 世界：前＝(-sin,-cos)、右＝(cos,-sin)；推 (jx,jy) 的期望方向＝jx·右 − jy·前
                fx, fz = -math.sin(cy), -math.cos(cy); rx, rz = math.cos(cy), -math.sin(cy)
                ex, ez = (jx * rx - jy * fx) / 40, (jx * rz - jy * fz) / 40
                ang = math.degrees(math.acos(max(-1, min(1, (dx * ex + dz * ez) / max(d, 1e-6)))))
                worst = max(worst, ang)
                run.check(f'鏡頭 {k*45:3d}°、搖桿往{name}：走的方向和畫面方向差 {ang:5.1f}°', d > 0.3 and ang <= 25, f'移動 ({dx:.2f},{dz:.2f})')
        run.note(f'最大偏差 {worst:.1f}°')
        # 真的用手指拖曳轉鏡頭（不直接設角度），轉到大約側面，再推搖桿往上
        await pg.evaluate("(([x,z])=>{ const E=GAME.E, P=E.player; P.path=null; P.obj.position.set(x,0,z); E.cam.yaw=0; })(%s)" % json.dumps([X0, Z0]))
        await pg.wait_for_timeout(500)
        W = await pg.evaluate("innerWidth"); H = await pg.evaluate("innerHeight")
        y_before = (await L.state(pg))['camYaw']
        for i in range(3):
            await L.drag(pg, cdp, W * 0.62, H * 0.42, W * 0.62 - 70, H * 0.42, steps=10); await pg.wait_for_timeout(300)
        y_after = (await L.state(pg))['camYaw']
        run.check('手指拖曳畫面轉鏡頭（轉了 45° 以上）', abs(y_after - y_before) > math.pi / 4, f'{y_before:.2f} → {y_after:.2f}')
        dx, dz, cy = await push_and_measure(pg, cdp, 0, -40, 2200)
        d = math.hypot(dx, dz); fx, fz = -math.sin(cy), -math.cos(cy)
        ang = math.degrees(math.acos(max(-1, min(1, (dx * fx + dz * fz) / max(d, 1e-6)))))
        await run.shot(pg, 'after_drag_push_up')
        run.check(f'拖曳轉鏡頭後推搖桿往上：往畫面前方走（差 {ang:.0f}°）', d > 0.3 and ang <= 25, f'鏡頭 {math.degrees(cy):.0f}°，移動 ({dx:.2f},{dz:.2f})')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
