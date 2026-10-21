"""ART-GYM2-INT：3F 主球場在遊戲裡（樓梯口拿掉紅龍、上樓、場地、走道、看台的座位、晚上）。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter、搬玩家、設鏡頭方向（之後不碰，讓遊戲自己跟）、坐下用 GAME.sitAt。
用法：python3 arena_check.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
CAM = "(()=>{ const c=GAME.E.camera.position, p=GAME.E.player.obj.position; return {zone:GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id, cam:[c.x,c.y,c.z].map(v=>+v.toFixed(2)), p:[p.x,p.y,p.z].map(v=>+v.toFixed(2)), formal:!!(GAME.E.zone&&GAME.E.zone.formal)}; })()"
async def put(pg, x, z, yaw, camyaw):
    await pg.evaluate("(([x,z,y,cy])=>{ const E=GAME.E, P=E.player; P.path=null; P.target=null; P.obj.position.set(x,E.heightAt?E.heightAt(x,z,0):0,z); P.obj.rotation.y=y; const C=E.cam; C.yaw=cy; C.manualT=0; })(%s)" % json.dumps([x, z, yaw, camyaw]))
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('arena_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        async def enter(zone, hour):
            await pg.evaluate("(async()=>{ GAME.G.hour=%s; GAME.E.hour=%s; await GAME.enter('%s'); })()" % (hour, hour, zone)); await pg.wait_for_timeout(15000)
            for _ in range(3):
                n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
                if not (n or shut): break
                await pg.wait_for_timeout(1500)
            run.setup('[捷徑] %s %s' % (zone, hour))
        await enter('gym', 15.0)
        await put(pg, -15.1, 17.4, -math.pi / 2, math.pi / 2); await pg.wait_for_timeout(5000)
        up = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.exit&&q.exit.to==='gym_arena'); return i?{label:i.label,x:i.x,z:i.z}:null; })()"); print('1F up', up, flush=True)
        run.check('1F：樓梯口有「上樓到 3F 主球場」', bool(up), json.dumps(up, ensure_ascii=False)); await run.shot(pg, '01_1f_stairs')
        await enter('gym_arena', 15.0); s = await pg.evaluate(CAM); print('arena spawn', s, flush=True); await run.shot(pg, '02_arena_spawn_15')
        run.check('進得了 3F 主球場、正式模型載入', s['zone'] == 'gym_arena' and s['formal'], json.dumps(s))
        await put(pg, 0.0, 8.0, math.pi, 0.0); await pg.wait_for_timeout(5000); await run.shot(pg, '03_field_15')
        await put(pg, 26.0, 0.0, -math.pi / 2, math.pi / 2); await pg.wait_for_timeout(6000); s = await pg.evaluate(CAM); print('aisle east d4', s, flush=True); await run.shot(pg, '04_aisle_east_15')
        run.check('東看台走道中段：人在台階上（高度 > 1.5 m）', s['p'][1] > 1.5, json.dumps(s))
        seat = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(q=>q.seat&&Math.abs(q.x-27.7)<0.6&&Math.abs(q.z)<0.6); return it?it.seat:null; })()")
        if seat:
            await pg.evaluate("(s=>{ const P=GAME.E.player; P.obj.position.set(s.ap[0],P.obj.position.y,s.ap[1]); GAME.sitAt(P,s); })(%s)" % json.dumps(seat)); await pg.wait_for_timeout(5000)
            s2 = await pg.evaluate(CAM); print('seated', s2, flush=True); await run.shot(pg, '05_seated_east_15')
            run.check('坐在看台：高度＝那一排的平台', abs(s2['p'][1] - seat['y']) < 0.05, json.dumps([s2['p'], seat['y']]))
            await pg.evaluate("GAME.standUp&&GAME.standUp(GAME.E.player)"); await pg.wait_for_timeout(2000)
        else: run.check('找得到東看台第 7 排的座位', False)
        await enter('gym_arena', 20.0); await put(pg, 0.0, 8.0, math.pi, 0.0); await pg.wait_for_timeout(5000); await run.shot(pg, '06_field_20')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
