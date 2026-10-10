"""小地圖方向（永久回歸案例：2026-10-10 線上回報「在霖澤館外面跑的方向跟地圖就相反了」）。
小地圖是「前方朝上」的旋轉地圖：鏡頭往前的方向一定在地圖上方。檢查方法是讀小地圖 canvas 的像素，
找出已知位置的出入口方塊（#7fc4c9），量它相對於地圖中心的方向，和「依鏡頭方向應該在哪」比較。
1. [前置] 讀檔到霖澤館門口南方 8 m（門口出入口在正北方）。
2. 鏡頭四個方向（[前置] 直接設鏡頭角度）：出入口方塊的方向要符合（容許 25°）。
3. 真實操作：手指在畫面上水平拖曳轉動鏡頭 → 地圖方向仍然正確。
4. 真實操作：鏡頭朝北、搖桿往前推 → 玩家往北走（往出入口），地圖上的出入口方塊在上方、離中心變近；玩家箭頭朝上。
用法：python3 tests/minimap_direction.py URL [輸出資料夾]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/minimap_direction'
EXIT = (34, -99.8)   # 霖澤館門口出入口（校園）

# 小地圖上出入口方塊的位置（相對中心，像素）＋玩家箭頭頂點方向
PROBE = """(()=>{ const c=document.getElementById('minimap'); if(!c||c.style.display==='none') return null; const x=c.getContext('2d'); const W=c.width, H=c.height; const d=x.getImageData(0,0,W,H).data;
  let sx=0, sy=0, n=0; for(let j=0;j<H;j++) for(let i=0;i<W;i++){ const k=(j*W+i)*4; if(Math.abs(d[k]-127)<14&&Math.abs(d[k+1]-196)<14&&Math.abs(d[k+2]-201)<14&&d[k+3]>200){ sx+=i; sy+=j; n++; } }
  const ar=GAME.minimapArrow?GAME.minimapArrow():null;
  return {W,H,n, cx:n?sx/n-W/2:null, cy:n?sy/n-H/2:null, arrow:ar}; })()"""


async def main():
    run = L.Run('minimap_direction', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：校園 11:00，霖澤館門口南方 8 m (34,-91.8)；門口出入口在正北方')
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 34, 'z': -91.8, 'yaw': 3.14},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(2500)

        async def frames(n=4):
            # 小地圖每 2 個畫面才重畫一次；SwiftShader 每秒只有 1–4 格，用畫面數等，不用固定毫秒
            f0 = await pg.evaluate("GAME.E.frame")
            for i in range(60):
                await pg.wait_for_timeout(250)
                if await pg.evaluate("GAME.E.frame") >= f0 + n: return

        async def check_dir(label, yaw_expect=None):
            await frames()
            s = await L.state(pg); pr = await pg.evaluate(PROBE)
            yaw = s['camYaw'] if yaw_expect is None else yaw_expect
            # 前方朝上的地圖：世界方向 (wx,wz) 在地圖上的方向＝把「鏡頭往前 (-sin yaw,-cos yaw)」轉到正上方
            wx, wz = EXIT[0] - s['x'], EXIT[1] - s['z']
            fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx   # 鏡頭的前方、右方（世界）
            fwd = wx * fx + wz * fz; right = wx * rx + wz * rz
            want = L.angle_deg(right, -fwd)
            if not pr or not pr['n']:
                run.check(f'{label}：小地圖上看得到出入口方塊', False, json.dumps(pr)); return
            got = L.angle_deg(pr['cx'], pr['cy'])
            run.check(f'{label}：出入口在地圖上的方向（應 {want:.0f}°，實際 {got:.0f}°）', L.ang_diff(want, got) <= 25, f"camYaw={yaw:.2f} 玩家=({s['x']},{s['z']}) 方塊偏移=({pr['cx']:.1f},{pr['cy']:.1f})")

        for k, (name, yaw) in enumerate([('鏡頭朝北', 0.0), ('鏡頭朝西', math.pi / 2), ('鏡頭朝南', math.pi), ('鏡頭朝東', -math.pi / 2)]):
            run.setup(f'鏡頭角度設成 {yaw:.2f}（{name}）')
            await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })(%f)" % yaw)
            await check_dir(name, yaw)
            if k in (0, 2): await run.shot(pg, f'minimap_{k}')
        # 真實操作：手指水平拖曳轉鏡頭
        y0 = (await L.state(pg))['camYaw']
        await L.drag(pg, cdp, 560, 200, 700, 200)
        y1 = (await L.state(pg))['camYaw']
        run.check('手指拖曳會轉動鏡頭', abs(y1 - y0) > 0.15, f'{y0:.2f} → {y1:.2f}')
        await check_dir('拖曳轉鏡頭之後')
        # 真實操作：鏡頭朝北、搖桿往前
        run.setup('鏡頭角度設成 0（朝北）')
        await pg.evaluate("GAME.E.cam.yaw=0")
        await frames()
        s0 = await L.state(pg); pr0 = await pg.evaluate(PROBE)
        await L.joystick(pg, cdp, 0, -40, 1400)
        await frames()
        s1 = await L.state(pg); pr1 = await pg.evaluate(PROBE)
        dz = s1['z'] - s0['z']; dx = s1['x'] - s0['x']
        run.check('搖桿往前：玩家往鏡頭前方（北）走', dz < -0.5 and abs(dx) < abs(dz), f'移動 ({dx:.2f},{dz:.2f})')
        if pr0 and pr1 and pr0['n'] and pr1['n']:
            d0 = math.hypot(pr0['cx'], pr0['cy']); d1 = math.hypot(pr1['cx'], pr1['cy'])
            run.check('往前走：地圖上前方的出入口在上方、離中心變近', pr1['cy'] < 0 and d1 < d0 - 1, f'距離 {d0:.1f} → {d1:.1f} px，y={pr1["cy"]:.1f}')
        ar = pr1.get('arrow') if pr1 else None
        run.check('玩家箭頭朝地圖上方（往前走時）', ar is not None and L.ang_diff(ar, 0) <= 30, f'arrow={ar}')
        await run.shot(pg, 'after_forward')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
