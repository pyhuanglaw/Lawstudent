"""118 巷（D46；AA_280；src/lane118.js、zones3d.js buildLane118）：從霖澤館後面的小廣場（法學院後門）走出去 → 118 巷 → 走到六張犁麵舖門口、走進店裡點餐（和阿哲一起）→ 走回後門回到台大。
[前置／捷徑] 讀檔到 2025-09-08（一）12:05 霖澤館穿堂後面的小廣場（大一上第 2 週；見過阿哲、還沒進麵店團群組）。手機模擬橫向、不用 turbo；選項照第一個選。
檢查：校園有「從後門出去（118 巷）」；進到 118 巷（區域 lane118、正式街景模型載入）；阿哲站在麵舖門口；點餐：老闆「幾位？……那邊那張可以坐。」→ 點菜 → 阿哲那句、扣 150；
      沒開的店（巷口家常菜週一休）「鐵門拉下來一半」；走回後門回到校園；沒有卡住保險、沒有 JS 例外。
用法：python3 tests/flow_lane118.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_lane118'
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}


async def talk_through(pg, cdp, until, max_s=120, log=None):
    log = log if log is not None else []; t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate(until): return True, log
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; const e=bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent]; })()")
            if c: log.append('▶' + c[2][:30]); await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            t = (s['dtext'] or '')[:60]
            if log and t.startswith(log[-1]) and not log[-1].startswith('▶'): log[-1] = t   # 對話一個字一個字跑出來：記完整的那句
            elif not log or log[-1] != t: log.append(t)
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    return False, log


async def main():
    run = L.Run('flow_lane118', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-08')")
        social = {'rel': {'zhe': {'fam': 30, 'trust': 15, 'aff': 10, 'resp': 5, 'comf': 15, 'rom': 0, 'npcRom': 0, 'seen': 5, 'talked': 5}}, 'mem': {'zhe': [{'tag': 'FIRST_MET', 'day': -3, 'note': ''}]}, 'reveal': {}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}}
        run.setup('讀檔：2025-09-08（一）12:05 法律系館A穿堂後面的小廣場；見過阿哲（熟悉 30）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 12.08, 'day': d, 'weekday': 1, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'social': social, 'pos': {'x': 34, 'z': -124.6, 'yaw': 3.14}})
        await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
        ex = await L.find_it(pg, '從後門出去')
        run.check('校園：霖澤館後面的小廣場有「從後門出去（118 巷）」', bool(ex), str(ex))
        if ex:
            ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '後門')
            await pg.wait_for_timeout(800); s = await L.state(pg)
            run.check('走到後門、互動鍵「從後門出去（118 巷）」', ok and s['interact'].startswith('從後門出去'), s['interact'])
            await L.tap(pg, cdp, '#interact')
            for _ in range(60):
                if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
                await pg.wait_for_timeout(1000)
        st = await pg.evaluate("({zone:GAME.G.zone, x:+GAME.E.player.obj.position.x.toFixed(1), z:+GAME.E.player.obj.position.z.toFixed(1)})")
        run.check('進到 118 巷（區域 lane118，在後門那一端）', st['zone'] == 'lane118' and st['z'] > 40, json.dumps(st))
        for _ in range(40):
            glb = await pg.evaluate("(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(/lane118_street/.test(o.name||'')) n++; }); return n; })()")
            if glb: break
            await pg.wait_for_timeout(1000)
        await run.shot(pg, 'lane_entry')
        run.check('118 巷的正式街景模型載入了（lane118_street.glb）', glb > 0, str(glb))
        for _ in range(90):   # 12:10 起才站到店門口（進巷子的時候可能還沒到）：待在巷子裡，時段到了就來（遊戲時間一秒約 24 秒，SwiftShader 掉幀會更慢）
            zhe = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.zhe; return n?{x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1)}:null; })()")
            if zhe: break
            await pg.wait_for_timeout(1000)
        door = await pg.evaluate("Object.assign(L118.door('noodle2'),{hour:+GAME.G.hour.toFixed(3)})")
        run.check('阿哲站在六張犁麵舖門口（週一中午的常客）', bool(zhe) and abs(zhe['z'] - door['z']) < 2 and abs(zhe['x'] - door['x']) < 1.5, json.dumps([zhe, door]))
        # 沒開的店：巷口家常菜週一休
        hd = await pg.evaluate("L118.door('home')")
        ok = await L.go_to(pg, cdp, run, hd['x'] + (0.6 if hd['side'] == 'W' else -0.6), hd['z'], 1.0, '巷口家常菜')
        await pg.wait_for_timeout(800); s = await L.state(pg)
        if ok and '家常菜' in s['interact']:
            await L.tap(pg, cdp, '#interact'); okc, log = await talk_through(pg, cdp, "!GAME.D.active&&!GAME.E.player.busy", 60)
            run.check('巷口家常菜（週一休）：「（鐵門拉下來一半。門上貼著營業時間。）」', any('鐵門拉下來一半' in t for t in log), json.dumps(log, ensure_ascii=False))
        else: run.check('走到巷口家常菜門口', False, s['interact'])
        ok = await L.go_to(pg, cdp, run, door['x'] + (0.6 if door['side'] == 'W' else -0.6), door['z'] + 0.6, 1.0, '六張犁麵舖')
        await pg.wait_for_timeout(800); s = await L.state(pg)
        run.check('走到六張犁麵舖門口、互動鍵是店名', ok and '六張犁麵舖' in s['interact'], s['interact'])
        m0 = await pg.evaluate("GAME.G.money")
        # 記下遊戲送出的完整台詞（對話一個字一個字跑，點一下可能直接跳下一句，從畫面讀只拿得到半句）
        await pg.evaluate("(()=>{ if(window.__saidHook) return; window.__said=[]; const s0=GAME.say; GAME.say=function(who,t,o){ window.__said.push((who&&who.name?who.name+'：':'')+t); return s0.apply(this,arguments); }; window.__saidHook=true; })()")
        # 118 巷的店走得進去（LANE118-SHOPS-1020，X66）：店門口「進六張犁麵舖」→ 店裡（l118_noodle2），阿哲（在門口等的常客）跟著坐在店裡 → 走到櫃台前「點餐（六張犁麵舖）」
        await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            if await pg.evaluate("GAME.G.zone==='l118_noodle2'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        inside = await pg.evaluate("({zone:GAME.G.zone, zhe:!!GAME.npc.zhe, order:L118_SHOP_LAYOUTS.noodle2.order})")
        run.check('進到六張犁麵舖店裡（l118_noodle2）、阿哲跟著進來坐在店裡', inside['zone'] == 'l118_noodle2' and inside['zhe'], json.dumps(inside, ensure_ascii=False))
        od = inside['order']; ok = await L.go_to(pg, cdp, run, od['x'], od['z'], max(0.3, od['r'] * 0.6), '櫃台前面（點餐）')
        await pg.wait_for_timeout(800); s = await L.state(pg)
        run.check('走到櫃台前面，互動鍵「點餐（六張犁麵舖）」', ok and s['interact'].startswith('點餐'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await run.shot(pg, 'order_greet')
        okc, _ = await talk_through(pg, cdp, "!GAME.D.active&&!GAME.E.player.busy&&GAME.G.money<" + str(m0), 120)
        log = await pg.evaluate("window.__said||[]")
        m1 = await pg.evaluate("GAME.G.money"); await run.shot(pg, 'order_done')
        run.check('點餐和阿哲一起：「幾位？……那邊那張可以坐。」→「（你點了牛肉麵。）」→ 阿哲「這間我給八十分。上次那間七十。」、扣 150', okc and m0 - m1 == 150 and any('幾位？……那邊那張可以坐。' in t for t in log) and any('你點了牛肉麵' in t for t in log) and any('這間我給八十分' in t for t in log), json.dumps(log, ensure_ascii=False) + ' ' + str(m0 - m1))
        ex = await L.find_it(pg, '離開六張犁麵舖')
        ok = bool(ex) and await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '店門（離開）')
        await pg.wait_for_timeout(800); s = await L.state(pg)
        if ok and s['interact'].startswith('離開'): await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        run.check('「離開六張犁麵舖」→ 回到 118 巷', await pg.evaluate("GAME.G.zone==='lane118'"))
        gate = await L.find_it(pg, '回到首都帝大')
        ok = bool(gate) and await L.go_to(pg, cdp, run, gate['x'], gate['z'], gate['r'] * 0.7, '後門（回首都帝大）')
        await pg.wait_for_timeout(800); s = await L.state(pg)
        if ok and s['interact'].startswith('回到首都帝大'): await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone==='campus'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        st = await pg.evaluate("({zone:GAME.G.zone, x:+GAME.E.player.obj.position.x.toFixed(1), z:+GAME.E.player.obj.position.z.toFixed(1), fb:GAME.walkFallbacks||0})")
        await run.shot(pg, 'back_campus')
        run.check('走回後門 → 回到校園（法律系館A後面的小廣場）', st['zone'] == 'campus' and abs(st['x'] - 34) < 4 and st['z'] < -120, json.dumps(st))
        run.check('沒有用到卡住保險', st['fb'] == 0, str(st['fb']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
