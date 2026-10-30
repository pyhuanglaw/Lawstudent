"""X140 經濟系系外套：遊戲內截圖（LAWWW2-B 2026-10-30；SK02-LINE-JACKET-1030）。
patch（docs/art-rebuild/second_ai/patches/jacket_econ_1030.patch）＋新的 vroid_yuting.vrm、dorm_room4.glb 放進測試樹以後，在測試樹根目錄跑：
  python3 <這個檔> URL 輸出資料夾
iPhone 橫向模擬（playlib：is_mobile、CDP 觸控）；不是 iPhone 實機。
  [前置／捷徑] 讀檔把人放到指定位置；外套用 CHAR.setJacket(玩家, true) 打開、椅背外套用 z.setJacketChair(true)（劇情什麼時候穿由 LAWWW-B 接）。
  之後的走路、上樓梯、坐下都是玩家操作（搖桿、互動按鈕）。
檢查：①外套預設藏著（manifest hide）②setJacket 打開／關掉都有效 ③走路、上萬才館大樓梯、坐下都拍（看穿模）④宿舍椅背外套預設藏、打開看得到。"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8881/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/jacket_ingame'
ONLY = sys.argv[3] if len(sys.argv) > 3 else ''   # dorm＝只跑宿舍那兩段
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
VIS = "(()=>{ let n=0; GAME.E.player.obj.traverse(o=>{ if(o.name==='JACKET_ECON'&&o.visible) n++; }); return n; })()"
JK = "(on=>{ let h=null; GAME.E.player.obj.traverse(o=>{ if(!h&&o.userData&&o.userData.driver==='vrm') h=o; }); return h?CHAR.setJacket(h,on):'no vrm'; })(%s)"
CHAIR = "(()=>{ const z=GAME.E.zone; const o=z&&z.dormRoot&&z.dormRoot.getObjectByName('JACKET_CHAIR'); return {api:!!(z&&z.setJacketChair), loaded:!!(z&&z.dormRoot), found:!!o, visible:!!(o&&o.visible)}; })()"


async def walk_shot(pg, cdp, run, label, dx=0, dy=-40, ms=1600):
    t = asyncio.create_task(L.joystick(pg, cdp, dx, dy, ms))
    await asyncio.sleep(ms / 2000); await run.shot(pg, label); await t


async def main():
    run = L.Run('jacket_ingame', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        if ONLY != 'dorm': await campus(pg, cdp, run)
        await dorm(pg, cdp, run)
        run.check('沒有 JS 例外', not errs, '; '.join(map(str, errs[:5])))
        await b.close()
    sys.exit(run.finish())


async def campus(pg, cdp, run):
        # 1. 校園：法學院廣場（萬才館大樓梯前）
        run.setup('讀檔：第 8 天（星期六）10:00、法學院廣場 (87,-84) 面向萬才館大樓梯、晴天')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 87.0, 'z': -84.0, 'yaw': 3.1416}, 'flags': FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(4000)
        run.check('外套預設藏著（manifest 的 hide）', await pg.evaluate(VIS) == 0)
        await run.shot(pg, 'campus_off')
        r = await pg.evaluate(JK % 'true'); await pg.wait_for_timeout(1200)
        run.check('CHAR.setJacket(玩家, true) → 外套顯示', r is True and await pg.evaluate(VIS) == 1, f'回傳 {r}')
        await run.shot(pg, 'campus_on')
        r = await pg.evaluate(JK % 'false'); await pg.wait_for_timeout(600)
        run.check('CHAR.setJacket(玩家, false) → 外套藏起來', r is True and await pg.evaluate(VIS) == 0)
        await pg.evaluate(JK % 'true'); await pg.wait_for_timeout(600)
        # 2. 走路（往樓梯走，平地那一段）→ 3. 上大樓梯
        await walk_shot(pg, cdp, run, 'walk')
        t0 = time.time(); mid = False
        while time.time() - t0 < 300:
            await L.joystick(pg, cdp, 0, -40, 1500)
            s = await L.state(pg)
            if not mid and 1.2 < s['y'] < 2.6: await walk_shot(pg, cdp, run, 'stairs_mid', ms=1000); mid = True
            if s['lv'] == 1 and s['z'] < -99.0: break
            if s['busy'] or s['dlg']: await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['busy'], max_steps=20)
        s = await L.state(pg); await run.shot(pg, 'stairs_top')
        run.check('搖桿走上萬才館大樓梯（中段有拍、到平台）', mid and s['lv'] == 1, json.dumps(s, ensure_ascii=False))
        await walk_shot(pg, cdp, run, 'stairs_down_turn', dx=0, dy=40, ms=1400)


async def dorm(pg, cdp, run):
        # 4. 宿舍：坐在書桌前（L2 祐廷的椅子）
        run.setup('讀檔：第 8 天 20:30、宿舍 203、祐廷書桌前（L2 坐下的走近點），面向書桌')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 20.5, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': -1.45, 'z': -0.1, 'yaw': -1.5708}, 'flags': FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(6000)
        await pg.evaluate(JK % 'true'); await pg.wait_for_timeout(800)
        c = await pg.evaluate(CHAIR)
        run.check('宿舍的椅背外套：模型載入、有 JACKET_CHAIR、預設藏著', c['api'] and c['loaded'] and c['found'] and not c['visible'], json.dumps(c))
        await run.shot(pg, 'dorm_stand')
        s = await L.state(pg)
        if s['interact'].startswith('坐在書桌前'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4500)
            s = await L.state(pg)
            run.setup('截圖時暫時把坐下後的選單（讀書／整理筆記／起身）藏起來：選單蓋住坐著的人（第一次拍的圖）')
            await pg.evaluate("document.getElementById('choices').style.visibility='hidden'"); await pg.wait_for_timeout(300)
            await run.shot(pg, 'dorm_sit')
            await pg.evaluate("document.getElementById('choices').style.visibility=''")
            run.check('坐在書桌前（穿外套坐下）', s['pose'] in ('sit', 'read', 'study'), json.dumps(s, ensure_ascii=False))
        else:
            run.check('互動按鈕是「坐在書桌前」', False, s['interact'])
        # 5. 椅背外套：起來、脫外套、外套掛到椅背；從走道看
        run.setup('讀檔：同一天 20:35、宿舍走道 (-0.75, 0.55) 面向祐廷的書桌椅（椅背朝走道）；外套脫掉（掛到椅背）')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 20.6, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': -0.75, 'z': 0.55, 'yaw': -2.1}, 'flags': FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(6000)
        await pg.evaluate(JK % 'false'); await pg.wait_for_timeout(500)
        await run.shot(pg, 'chair_off')
        await pg.evaluate("GAME.E.zone.setJacketChair(true)"); await pg.wait_for_timeout(800)
        c = await pg.evaluate(CHAIR); run.check('z.setJacketChair(true) → 椅背外套顯示', c['visible'], json.dumps(c))
        await run.shot(pg, 'chair_on')

asyncio.run(main())
