"""ART-GYM2-INT 第二輪：3F 主球場修改前後同角度（進場的鏡頭、入口通道盡頭、場地、走道扶手、坐在看台第 7 排、走道最上面、晚上的光暈）。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter、搬玩家、設鏡頭方向（之後不碰，讓遊戲自己跟、自己拉近）、坐下用 GAME.sitAt。
用法：python3 arena_check2.py <工作樹> <URL> <輸出>"""
import os, sys, json, asyncio, math
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
ST = "(()=>{ const E=GAME.E, c=E.camera.position, p=E.player.obj.position, z=E.zone; let gb=null; if(z&&z.group) z.group.traverse(o=>{ if(o.name==='gym_arena_glows'&&o.userData.glowBatch) gb=o.userData.glowBatch.items.length; }); return {zone:z&&z.def&&z.def.id, cam:[c.x,c.y,c.z].map(v=>+v.toFixed(2)), p:[p.x,p.y,p.z].map(v=>+v.toFixed(2)), formal:!!(z&&z.formal), camCols:z&&z.camCols&&z.camCols[0]?z.camCols[0].length:0, glows:gb}; })()"
async def put(pg, x, z, yaw, camyaw):
    await pg.evaluate("(([x,z,y,cy])=>{ const E=GAME.E, P=E.player; P.path=null; P.target=null; E.placeAt?E.placeAt(P,x,z,0):P.obj.position.set(x,0,z); P.obj.rotation.y=y; const C=E.cam; C.yaw=cy; C.manualT=0; })(%s)" % json.dumps([x, z, yaw, camyaw]))
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('arena_check2', OUT)
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
        async def shot(name, wait=6000):
            await pg.wait_for_timeout(wait); s = await pg.evaluate(ST); print(name, json.dumps(s), flush=True); await run.shot(pg, name); return s
        await enter('gym_arena', 15.0)
        s = await shot('01_spawn_default', 4000)
        run.check('進得了 3F 主球場、正式模型載入', s['zone'] == 'gym_arena' and s['formal'], json.dumps(s))
        zend = await pg.evaluate("(()=>{ let m=17; for(let z=17;z<29;z+=0.05) if(GAME.E.canStand(0,z,0.32,0)) m=z; return +m.toFixed(2); })()"); run.note('入口通道走得到 z %s' % zend)
        await put(pg, 0.0, zend - 0.8, 0.0, math.pi); s = await shot('02_trench_end_door')
        await put(pg, 0.0, 8.0, math.pi, 0.0); await shot('03_field_15')
        await put(pg, 26.0, 0.0, -math.pi / 2, math.pi / 2); s = await shot('04_aisle_east_15')
        run.check('東看台走道中段：人在台階上（高度 > 1.5 m）', s['p'][1] > 1.5, json.dumps(s))
        seat = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(q=>q.seat&&Math.abs(q.x-27.7)<0.6&&Math.abs(q.z)<0.6); return it?it.seat:null; })()")
        if seat:
            await pg.evaluate("(s=>{ const P=GAME.E.player; P.obj.position.set(s.ap[0],P.obj.position.y,s.ap[1]); GAME.sitAt(P,s); GAME.E.cam.yaw=Math.PI/2; GAME.E.cam.manualT=0; })(%s)" % json.dumps(seat))
            s2 = await shot('05_seated_east_row7')
            run.check('坐在看台第 7 排：高度＝那一排的平台', abs(s2['p'][1] - seat['y']) < 0.05, json.dumps([s2['p'], seat['y']]))
            await pg.evaluate("GAME.standUp&&GAME.standUp(GAME.E.player)"); await pg.wait_for_timeout(2000)
        else: run.check('找得到東看台第 7 排的座位', False)
        await put(pg, 31.4, 0.0, -math.pi / 2, math.pi / 2); await shot('06_aisle_top_east')
        await enter('gym_arena', 20.0); await put(pg, 0.0, 6.0, 0.0, 0.0); s = await shot('07_field_north_20')
        run.note('晚上全場光暈批：%s 個' % s['glows'])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
