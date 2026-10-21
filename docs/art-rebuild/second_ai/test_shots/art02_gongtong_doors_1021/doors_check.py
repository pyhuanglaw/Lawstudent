"""ART-02：共同教學館關著的門（1F 洗手間、2F 203）——門模組（門框、門片、門牌）修改前後同角度。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter('gongtong') 15:00、E.placeAt 搬玩家（含樓層）、設鏡頭方向與距離。
用法：python3 doors_check.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
SPOTS = [  # 名稱, 玩家 (x, z, lv), 鏡頭 yaw 清單（鏡頭在玩家的 (sin yaw, cos yaw) 那一側）
    ('wc_1f', (2.0, 1.1, 0), [('front', 0.0, None, None), ('oblique', 0.75, None, None), ('close', 0.35, 2.6, 0.22)]),
    ('r203_2f', (7.2, 1.2, 1), [('front', math.pi, None, None), ('oblique', math.pi - 0.75, None, None), ('close', math.pi + 0.35, 2.6, 0.22)])]
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('doors_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(async()=>{ GAME.G.hour=15; GAME.E.hour=15; await GAME.enter('gongtong'); })()"); await pg.wait_for_timeout(15000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        run.setup('[捷徑] gongtong 15:00')
        st = await pg.evaluate("(()=>{ const z=GAME.E.zone; return {zone:z&&z.def&&z.def.id, doorsGLB:!!(z&&z.doorsGLB)}; })()"); print('zone', st, flush=True)
        run.note('門模組：%s' % st)
        d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
        for name, (x, z, lv), cams in SPOTS:
            await pg.evaluate("(([x,z,lv])=>{ const E=GAME.E, P=E.player; P.path=null; P.target=null; E.placeAt(P,x,z,lv); })(%s)" % json.dumps([x, z, lv]))
            await pg.wait_for_timeout(2500)
            for cn, yaw, d, pi in cams:
                await pg.evaluate("(([y,d,pp])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=pp; C.manualT=60; })(%s)" % json.dumps([yaw, d if d else d0, pi if pi else p0]))
                await pg.wait_for_timeout(3500); await run.shot(pg, '%s_%s' % (name, cn))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
