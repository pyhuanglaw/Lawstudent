"""BB：BG-3DSHOT-1021——遊戲裡已經有 3D 的地方，拍構圖參考給使用者圖生圖（使用者 10-21：3D 場景的背景要附遊戲截圖）。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter、設時間、設旗標、放玩家位置、轉鏡頭；截圖前關手機、藏 HUD 和玩家。不是 iPhone：只當構圖參考。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
# (tag, zone, hour, 玩家位置或 None, 旗標)
SHOTS = [('cafe_window', 'cafe', 15.0, (3.2, -2.5), {}), ('cafe_closed', 'cafe', 22.5, (0.0, 0.0), {}),
         ('us_shared_kitchen', 'us_shared', 18.0, None, {'US_DEPARTED': True, 'US_ARRIVED': True}),
         ('us_club_lawn', 'us_outside', 17.5, (-28.0, 10.6), {'US_DEPARTED': True, 'US_ARRIVED': True}),
         ('wenzhou', 'wenzhou', 16.0, None, {}), ('gym_court', 'gym', 19.5, None, {}), ('wancai_lobby', 'wancai', 15.0, None, {})]
CLEAN = """(on=>{ for(const el of document.body.children){ if(el.tagName==='CANVAS'||el.querySelector('canvas')) continue; if(on){ el.dataset.bbHide=el.style.visibility||'-'; el.style.visibility='hidden'; } else if(el.dataset.bbHide){ el.style.visibility=el.dataset.bbHide==='-'?'':el.dataset.bbHide; delete el.dataset.bbHide; } } const p=GAME.E.player&&GAME.E.player.obj; if(p) p.visible=!on; })"""
async def closephone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()"); await pg.wait_for_timeout(600)
async def main():
    run = L.Run('bg3d', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.set_viewport_size({'width': 1280, 'height': 720})
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        for tag, z, h, pos, fl in SHOTS:
            await pg.evaluate("(fl=>Object.assign(GAME.G.flags,fl))(%s)" % json.dumps(fl))
            await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
            await pg.wait_for_timeout(15000); await closephone(pg)
            if pos: await pg.evaluate("(([x,z])=>{ const o=GAME.E.player.obj; o.position.x=x; o.position.z=z; })(%s)" % json.dumps(pos))
            await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(4000)
            zz = await pg.evaluate("GAME.G.zone"); run.setup('[捷徑] %s → zone %s %.1f' % (tag, zz, h)); print('  ', tag, zz, flush=True)
            y0 = await pg.evaluate("GAME.E.cam.yaw")
            for k in range(4):
                await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })(%s)" % (y0 + k * 3.14159 / 2)); await pg.wait_for_timeout(2500); await closephone(pg)
                await pg.evaluate(CLEAN + "(true)"); await pg.wait_for_timeout(600); await run.shot(pg, '%s_y%d' % (tag, k)); await pg.evaluate(CLEAN + "(false)")
            run.check('%s 進得去' % tag, zz == z, zz)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
