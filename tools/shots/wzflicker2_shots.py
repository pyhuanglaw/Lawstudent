"""BUG-WZFLICKER-2 遊戲內前後截圖（LAWWW2-C 2026-10-20）：溫州街、公館、118 巷修過疊面的地方，同一個鏡頭拍。
[前置／捷徑] 讀檔到那一區（11:00、晴、關掉條件事件），直接設鏡頭位置（E.cinematic）；藏起路人。
用法（先開 http server；換 GLB 前後各跑一次）：python3 tools/shots/wzflicker2_shots.py URL 輸出資料夾"""
import asyncio, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tests'))
import playlib as PL
URL, OUT = sys.argv[1], sys.argv[2]
SPOTS = [  # 名稱、區域、玩家站的位置、鏡頭、看的點
    ('wz_cvs', 'wenzhou', (44.0, 2.0), (43.6, 1.6, 2.2), (45.6, 1.1, 7.2)),       # 日日便利（A5）：冰箱、貨架
    ('wz_b4', 'wenzhou', (10.4, -1.5), (9.2, 1.7, -1.6), (10.4, 2.0, -5.4)),      # B4 玻璃上的割字貼紙
    ('wz_alu', 'wenzhou', (-4.3, -1.6), (-3.2, 1.6, -1.8), (-4.4, 1.6, -5.6)),     # 鋁框店面（x −4.3）
    ('gg_door', 'gongguan', (-45.2, 20.2), (-44.6, 1.7, 19.6), (-45.2, 2.9, 22.0)),  # 公館木框門的上框
    ('l118_shutter', 'lane118', (-2.0, 29.0), (-1.6, 1.5, 28.4), (-5.3, 0.8, 30.6)),  # 118 巷鐵捲門
]
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0])); const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
async def main():
    run = PL.Run('wzflicker2_shots', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await PL.wait_loaded(pg))
        await pg.evaluate("STORY.phoneAuto=()=>{}")
        for (nm, zone, pos, eye, look) in SPOTS:
            run.setup(f'{nm}：讀檔到 {zone} ({pos[0]}, {pos[1]}) 11:00')
            await PL.load_state(pg, {'zone': zone, 'hour': 11.0, 'weather': 'sunny', 'pos': {'x': pos[0], 'z': pos[1], 'yaw': 0}}, quiet_events=True)
            await pg.wait_for_timeout(8000); await PL.close_panels(pg, cdp)
            await pg.evaluate(f"{DRAW}({list(eye)},{list(look)})"); await pg.wait_for_timeout(1500)
            await run.shot(pg, nm)
        run.check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
