"""C208 門上的外套／門牌跟著牆淡出（BB_218 補拍不通過那幾張的角度）。[前置] 讀使用者 9/25 存檔；[捷徑] 旗標 US_DEPARTED、US_ARRIVED、GAME.enter('us_shared')、搬玩家、設鏡頭。
用法：python3 c208_check.py <開發分支工作樹> <URL> <輸出資料夾>"""
import os, sys, json, asyncio
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
VIS = """(()=>{ const out={}; GAME.E.scene.traverse(o=>{ if(/deco|coat|PLATE_FACE_door_bed/.test(o.name||'')&&o.isMesh){ let v=true; for(let p=o;p;p=p.parent) if(!p.visible) v=false; out[o.name]={vis:v, op:o.material&&o.material.opacity}; } }); return out; })()"""
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('c208_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(()=>{ Object.assign(GAME.G.flags,{US_DEPARTED:true,US_ARRIVED:true}); })()")
        await pg.evaluate("(async()=>{ GAME.G.hour=17.75; GAME.E.hour=17.75; await GAME.enter('us_shared'); })()"); await pg.wait_for_timeout(15000)
        run.setup('[捷徑] us_shared 17:45')
        for tag, (x, z), yaw in (('bedside_camEast', (0.9, -0.6), 1.5708), ('bedside_camEast_A', (0.9, -2.2), 1.5708), ('living_camWest', (0.0, -0.6), -1.5708), ('cdoor', (-1.2, 1.4), -1.5708)):
            await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); })(%s)" % json.dumps([x, z]))
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=60; })(%s)" % yaw)
            await pg.wait_for_timeout(3000)
            v = await pg.evaluate(VIS); print(tag, json.dumps(v, ensure_ascii=False), flush=True)
            await run.shot(pg, tag)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
