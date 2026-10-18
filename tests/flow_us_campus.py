"""真實玩家流程：美國校園、法學院圖書館接成區域（LAWWW2-C 2026-10-18，US-CAMPUS-WIRE-1018；src/us3d.js 的 us_campus、us_lawlib）

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：搖桿、點地面（遊戲的自動找路）、點互動按鈕、選單。
  [前置／捷徑] 一個：讀檔到大四上 2028/9/15（交換已經抵達）10:00、公寓社區入口。
  1. 社區入口旁「搭公車（去學校）」→ 美國校園的公車站；站得住、不會一到就在「搭公車（回社區）」上；沒有遠景剪影（台北的山、城市大樓）
  2. 從公車站走人行道、走道到法學院台階下：「進教室」有說明（沒有交換系統的課堂時）
  3. 「進圖書館」→ 法學院圖書館；門口站得住、不會一進來就在「離開圖書館」上
  4. 走到中庭的長桌「坐下來讀書」：坐下（坐姿），站起來
  5. 「離開圖書館」→ 回到台階下（spawn_library_out）
  6. 走回公車站「搭公車（回社區）」→ 社區入口
  7. 沒有 JS 例外；劇情自動走路沒有用到卡住保險（walkFallbacks＝0）
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_us_campus.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_us_campus'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}


async def caption(pg):
    return await pg.evaluate("(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')?e.textContent:''; })()")


async def look(pg, cdp, label):
    s = await L.state(pg)
    if not s['interact'].startswith(label): return ''
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); cap = await caption(pg)
    if not cap:
        cap = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText')||document.querySelector('#dialog .text'); return e?e.textContent:''; })()")
    await pg.wait_for_timeout(3500); return cap


async def press(pg, cdp, run, label, wait_zone, timeout=60):
    s = await L.state(pg)
    if not s['interact'].startswith(label):
        run.note(f'互動按鈕是「{s["interact"]}」，不是「{label}」'); return False
    await L.tap(pg, cdp, '#interact')
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: q['zone'] == wait_zone and not q['busy'] and not q['dlg'], max_steps=int(timeout))
    return s['zone'] == wait_zone and not s['busy']


async def walk_to_it(pg, cdp, run, label, near=0.6, dz=0.0, dx=0.0):
    await L.close_panels(pg, cdp)   # 手機自己打開（有要回的訊息，D103）：像玩家一樣收起來
    it = await L.find_it(pg, label)
    if not it: run.note(f'找不到互動點「{label}」'); return False
    ok = await L.go_to(pg, cdp, run, it['x'] + dx, it['z'] + dz, near, label)
    s = await L.state(pg)
    return ok and s['interact'].startswith(label)


async def main():
    run = L.Run('flow_us_campus', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        day = await pg.evaluate("(()=>{ for(let d=0; d<2400; d++){ const t=CALENDAR.dateOf(d); if(t.y===2028&&t.m===9&&t.d===15) return d; } return null; })()")
        link = await pg.evaluate("US3.US_LINK")
        run.setup(f'讀檔：大四上 2028/9/15（第 {day} 天）10:00、美國公寓社區入口 ({link["x"]},{link["z"]})、晴天、交換已經抵達')
        await L.load_state(pg, {'zone': 'us_outside', 'hour': 10.0, 'day': day or 900, 'weather': 'sunny', 'pos': {'x': link['x'], 'z': link['z'], 'yaw': link['yaw']},
                                'flags': dict(FLAGS, EXCHANGE_ROUTE='US', US_DEPARTED=True, US_ARRIVED=True)})
        await pg.wait_for_timeout(6000); await run.shot(pg, '01_community_entrance')
        # 1. 搭公車去學校
        ok = await walk_to_it(pg, cdp, run, '搭公車（去學校）', 0.6)
        await run.shot(pg, '02_community_bus')
        run.check('1. 社區入口旁出現「搭公車（去學校）」', ok)
        run.check('1. 「搭公車（去學校）」→ 美國校園', ok and await press(pg, cdp, run, '搭公車（去學校）', 'us_campus', timeout=90))
        await pg.wait_for_timeout(8000); s = await L.state(pg); await run.shot(pg, '03_campus_bus_stop')
        run.check('1. 在公車站、站得住；不會一到就跳出「搭公車（回社區）」', s['zone'] == 'us_campus' and s['stand'] and not s['interact'].startswith('搭公車'), json.dumps(s, ensure_ascii=False))
        info = await pg.evaluate("(()=>{ const E=GAME.E; let formal=false; E.zone.group.traverse(o=>{ if(o.name==='us_campus') formal=true; }); return {skyline:!!E.skyline&&E.skyline.visible, formal}; })()")
        run.check('1. 正式模型載入、沒有遠景剪影（台北的山、城市大樓）', info['formal'] and not info['skyline'], json.dumps(info))
        # 2. 走到台階下
        ok = await walk_to_it(pg, cdp, run, '進教室', 0.6, dz=0.3)
        cap = await look(pg, cdp, '進教室') if ok else ''
        await run.shot(pg, '04_campus_steps_class')
        has_exch_class = await pg.evaluate("typeof EXCH!=='undefined'&&!!EXCH.classAt")
        run.check('2. 從公車站走人行道、走道到台階下，「進教室」' + ('（交換系統的課堂）' if has_exch_class else '有說明'), ok and (has_exch_class or '教室' in cap), f'「{cap[:40]}」')
        # 3. 進圖書館
        ok = await walk_to_it(pg, cdp, run, '進圖書館', 0.5, dz=0.3)
        run.check('3. 台階下出現「進圖書館」', ok)
        run.check('3. 「進圖書館」→ 法學院圖書館', ok and await press(pg, cdp, run, '進圖書館', 'us_lawlib'))
        await pg.wait_for_timeout(6000); s = await L.state(pg); await run.shot(pg, '05_lawlib_door')
        run.check('3. 在圖書館門口、站得住；不會一進來就跳出「離開圖書館」', s['zone'] == 'us_lawlib' and s['stand'] and not s['interact'].startswith('離開'), json.dumps(s, ensure_ascii=False))
        # 4. 坐下
        seat = await pg.evaluate("(()=>{ const it=GAME.E.interactables.filter(i=>i.seat&&i.study).sort((a,b)=>Math.hypot(a.x-1.5,a.z-1)-Math.hypot(b.x-1.5,b.z-1))[0]; return it?{x:it.x,z:it.z,label:it.label}:null; })()")
        ok = bool(seat) and await L.go_to(pg, cdp, run, seat['x'], seat['z'], 0.45, '中庭的長桌')
        run.check('4. 走到中庭的長桌、出現「坐下來讀書」', ok and (await L.state(pg))['interact'].startswith('坐下來讀書'))
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None
        while time.time() - t0 < 40:
            s = await L.state(pg)
            if s['pose'] == 'sit': sat = s; break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500); await run.shot(pg, '06_lawlib_sit')
        run.check('4. 坐在長桌（坐姿）', bool(sat), json.dumps(sat, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=30)
        if s['pose'] == 'sit':
            await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
        s = await L.state(pg)
        run.check('4. 站起來、站得住', s['pose'] != 'sit' and s['stand'], json.dumps(s, ensure_ascii=False))
        # 5. 離開圖書館
        ok = await walk_to_it(pg, cdp, run, '離開圖書館', 0.4)
        run.check('5. 走回門口、出現「離開圖書館」', ok)
        run.check('5. 「離開圖書館」→ 美國校園', ok and await press(pg, cdp, run, '離開圖書館', 'us_campus'))
        await pg.wait_for_timeout(6000); s = await L.state(pg); await run.shot(pg, '07_campus_library_out')
        lo = await pg.evaluate("US_CAMPUS_LAYOUT.spawn_library_out")
        run.check('5. 回到台階下（spawn_library_out）、站得住、不會一出來就在「進圖書館」上', s['zone'] == 'us_campus' and s['stand'] and math.hypot(s['x'] - lo['x'], s['z'] - lo['z']) < 1.0 and not s['interact'].startswith('進圖書館'), json.dumps(s, ensure_ascii=False))
        # 6. 搭公車回社區
        ok = await walk_to_it(pg, cdp, run, '搭公車（回社區）', 0.6)
        await run.shot(pg, '08_campus_bus_back')
        run.check('6. 走回公車站、出現「搭公車（回社區）」', ok)
        run.check('6. 「搭公車（回社區）」→ 公寓社區', ok and await press(pg, cdp, run, '搭公車（回社區）', 'us_outside', timeout=90))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '09_community_back')
        run.check('6. 在社區入口、站得住', s['zone'] == 'us_outside' and s['stand'] and math.hypot(s['x'] - link['x'], s['z'] - link['z']) < 1.5, json.dumps(s, ensure_ascii=False))
        # 7.
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('7. 沒有 JS 例外', not errs, '；'.join(errs[:3]))
        run.check('7. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', fb == 0, str(fb))
        await b.close()
    run.finish()

asyncio.run(main())
