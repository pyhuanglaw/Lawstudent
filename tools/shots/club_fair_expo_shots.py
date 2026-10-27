"""CLUBFAIR-REAL-1027：社團博覽會 36 頂帳篷＋舞台，改前（九頂）改後同角度（玩家跟隨鏡頭；[捷徑] 讀檔到社博那天、直接放玩家位置、路人藏起來）。
用法：python3 club_fair_expo_shots.py 工作樹 URL 輸出資料夾 [日子 2025-09-30]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; DAY = sys.argv[4] if len(sys.argv) > 4 else '2025-09-30'
PI = math.pi
# (名字, x, z, 玩家 rotation.y, 鏡頭 yaw, 俯角, 距離)
SPOTS = [('avenue_w', 14.0, 0.0, -PI / 2, PI / 2, 0.28, 9.0),          # 從東邊往西看整條大道
         ('avenue_e', -92.0, 0.0, PI / 2, -PI / 2, 0.28, 9.0),         # 從西邊（校門那頭）往東看
         ('booth_guitar', -84.4, -1.6, PI, 0.0, 0.32, 4.2),            # 吉他社攤位前（北側）
         ('booth_dance', -80.8, 1.6, 0.0, PI, 0.32, 4.2),              # 熱舞社攤位前（南側）
         ('stage', -25.25, 2.2, PI, 0.0, 0.25, 6.5),                   # 舞台前
         ('bell', -38.0, 6.0, 0.0, PI, 0.35, 7.5),                     # 傅鐘廣場：法服、系籃
         ('top_mid', -45.0, 0.0, PI, 0.0, 1.45, 30.0)]                  # 從上面看中段
async def main():
    run = L.Run('club_fair_expo', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate(f"STORY.dayOfKey('{DAY}')")
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': day, 'weather': 'sunny', 'pos': {'x': 14, 'z': 0, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(30000); await L.close_panels(pg, cdp)
        st = await pg.evaluate("(()=>({expo:!!(Z3.isExpoDay&&Z3.isExpoDay()), fb:!!GAME.E.zone.group.getObjectByName('fair_expo_fallback'), fbVis:!!(GAME.E.zone.group.getObjectByName('fair_expo_fallback')||{}).visible, glb:!!ASSETS.cache['bldg.club_fair_expo'], old:!!GAME.E.zone.group.getObjectByName('fair_fallback')}))()")
        print('state', json.dumps(st))
        for (nm, x, z, ry, cy, pitch, dist) in SPOTS:
            await pg.evaluate(f"(()=>{{ GAME.E.hour=11; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; GAME.E.cam.pitch={pitch}; GAME.E.cam.distTarget={dist}; for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; }})()")
            await pg.wait_for_timeout(4000)
            info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return {calls:r.calls, tris:r.triangles}; })()")
            await run.shot(pg, nm); print(nm, json.dumps(info))
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
