"""BB：X64（使用者 10-20：「體育館樓梯的方向反了吧」）。[前置] 讀存檔、[捷徑] GAME.enter('gym')，
站到 1F 往 3F、往 B1 兩個樓梯口前面截圖（鏡頭在玩家背後，看樓梯）；再照玩家按「下樓到 B1」→ 截到達的畫面 → 按「上樓回大廳」→ 截回到 1F 的畫面（朝哪邊）。"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
POS = "(()=>{ const E=GAME.E, P=E.player.obj.position; return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), y:+P.y.toFixed(2), lv:E.player.lv|0, ry:+E.player.obj.rotation.y.toFixed(2), camYaw:+E.cam.yaw.toFixed(2), near:(E.nearestInteractable&&E.nearestInteractable()||{}).label||null}; })()"
async def place(pg, x, z, ry, camyaw, pitch=None):
    await pg.evaluate("(a=>{ const E=GAME.E; E.player.obj.position.set(a[0],0,a[1]); E.player.obj.rotation.y=a[2]; E.cam.yaw=a[3]; if(a[4]!=null&&E.cam.pitch!=null) E.cam.pitch=a[4]; })(%s)" % json.dumps([x, z, ry, camyaw, pitch]))
    await pg.wait_for_timeout(2500)
async def main():
    run = L.Run('x64', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('讀存檔'); await pg.wait_for_timeout(4000)
        for i in range(30):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
            if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(600); continue
            break
        await pg.evaluate("(()=>{ GAME.G.hour=14; GAME.E.hour=14; })()")
        await pg.evaluate("void GAME.enter('gym')"); run.setup('[捷徑] 14:00 GAME.enter(gym)'); await pg.wait_for_timeout(8000)
        print('進門', json.dumps(await pg.evaluate(POS), ensure_ascii=False), flush=True); await run.shot(pg, '00_enter')
        # 往 3F 的樓梯（x -19.4..-16.6, z 12.2..18.4）：站在 (-18, 19.6) 面向 -z，鏡頭在後面（yaw 0）；再從側面看（站 -14.5,15.3，面向 -x，鏡頭 yaw π/2）
        await place(pg, -18.0, 19.6, math.pi, 0.0); print('3F 樓梯口', json.dumps(await pg.evaluate(POS), ensure_ascii=False), flush=True); await run.shot(pg, '01_stairs3F_front')
        await place(pg, -14.0, 15.3, -math.pi/2, math.pi/2); await run.shot(pg, '02_stairs3F_side')
        # 往 B1（x 16.6..19.4, z 12.6..17.6）
        await place(pg, 18.0, 19.4, math.pi, 0.0); print('B1 樓梯口', json.dumps(await pg.evaluate(POS), ensure_ascii=False), flush=True); await run.shot(pg, '03_stairsB1_front')
        await place(pg, 14.5, 15.0, math.pi/2, -math.pi/2); await run.shot(pg, '04_stairsB1_side')
        # 照玩家：走到「下樓到 B1」按
        await place(pg, 18.0, 18.6, math.pi, 0.0)
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&b.offsetParent?b.textContent:null; })()"); print('互動按鈕：', lab, flush=True)
        if lab: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(9000)
        print('到 B1', json.dumps(await pg.evaluate(POS), ensure_ascii=False), flush=True); await run.shot(pg, '05_arrive_B1')
        await pg.evaluate("(()=>{ GAME.E.cam.yaw=GAME.E.player.obj.rotation.y+Math.PI; })()"); await pg.wait_for_timeout(2000); await run.shot(pg, '06_B1_behind')
        await place(pg, 18.0, 4.5, 0.0, math.pi); await run.shot(pg, '07_B1_stairs_from_bottom')
        await place(pg, 18.0, 7.4, math.pi, 0.0)
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&b.offsetParent?b.textContent:null; })()"); print('互動按鈕：', lab, flush=True)
        if lab: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(9000)
        print('回 1F', json.dumps(await pg.evaluate(POS), ensure_ascii=False), flush=True); await run.shot(pg, '08_back_1F')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
