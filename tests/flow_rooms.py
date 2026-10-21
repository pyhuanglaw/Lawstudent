"""走得進去的房間（萬才館研討室 A、霖澤館 202、萬才館多功能教室；LAWWW2-C 臨時接線 src/rooms_glb3d.js）：真實玩家流程。
[前置／捷徑] 讀檔到 2025-09-09（二）12:20 那棟樓、那間房間的門前面（這個時段沒有課、沒有社課）。手機模擬橫向、不用 turbo。
  1. 「進入 ○○」→ 房間（正式模型）；站得住、不會一進來就在「離開…」上
  2. 走到一個座位「坐下」→ 坐下、站起來（研討室 A 另外坐一次靠牆的「坐旁聽席」）
  3. 「離開…」→ 回到那棟樓、門前面那一層，站得住
  4. 沒有 JS 例外；劇情自動走路沒有用到卡住保險
這是 Playwright 手機模擬，不是 iPhone 實機。用法：python3 tests/flow_rooms.py URL 區域 [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ROOM = sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '/tmp/flow_rooms_' + ROOM
CFG = {   # 區域: (那棟樓, 門前面 (x, z, lv), 門的按鈕, 要坐的座位, 離開的按鈕)
    'wancai_sema': ('wancai', (-3.0, -5.2, 1), '進入 研討室 A', ['坐下', '坐旁聽席'], '離開研討室'),
    'linze_202': ('linze', (3.0, -5.4, 1), '進入 202 教室', ['坐下'], '離開教室'),
    'wancai_multi': ('wancai', (2.0, -5.2, 0), '進入 多功能教室', ['坐下'], '離開教室'),
}
HOST, (SX, SZ, SLV), DOOR, SEATS, EXIT = CFG[ROOM]
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}


async def go_press(pg, cdp, run, label, zone, near=0.4, timeout=60):
    it = await L.find_it(pg, label)
    ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], near, label)
    s = await L.state(pg)
    if not (ok and s['interact'].startswith(label)): return False, s
    await L.tap(pg, cdp, '#interact')
    for _ in range(timeout):
        if await pg.evaluate(f"GAME.G.zone==={json.dumps(zone)}&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(1000)
    for _ in range(30):
        if await pg.evaluate("!!(GAME.E.zone&&(GAME.E.zone.formal!==false))"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500)
    return True, await L.state(pg)


async def sit_here(pg, cdp, run, label):
    # 走到遊戲自己算的走近點（GAME.seatApproach：玩家按「坐下」時也是走到這裡），座位按鈕出現就按
    seat = await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj.position; const it=GAME.E.interactables.filter(i=>i.seat&&(i.label||'').startsWith({json.dumps(label)})).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0]; if(!it) return null; const ap=GAME.seatApproach(it.seat); return {{x:it.x,z:it.z,ax:ap[0],az:ap[1]}}; }})()")
    ok = bool(seat) and await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.12, label)
    s = await L.state(pg)
    if not ok and s['interact'].startswith(label): run.note(f'沒走到走近點 0.12 m 以內，但「{label}」按鈕已經出現（玩家看到的就是這個按鈕）：照按')
    if not s['interact'].startswith(label): return False, None, s
    await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None; trace = []
    while time.time() - t0 < 40:
        s = await L.state(pg)
        trace.append((round(time.time() - t0, 1), s['pose'], s['busy'], round(s['x'], 2), round(s['z'], 2)))
        if s['pose'] == 'sit': sat = s; break   # 坐下以後的選單不按
        await pg.wait_for_timeout(500)
    if not sat: run.note('坐下的過程：' + json.dumps(trace[:12], ensure_ascii=False))
    await pg.wait_for_timeout(1500)
    return True, sat, s


async def stand_up(pg, cdp, run):
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=30)
    if s['pose'] == 'sit': await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
    return await L.state(pg)


async def main():
    run = L.Run('flow_rooms_' + ROOM, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        run.setup(f'讀檔：2025-09-09（二）12:20 {HOST} 第 {SLV} 層、{DOOR[3:]}的門前面 ({SX}, {SZ})')
        await L.load_state(pg, {'zone': HOST, 'hour': 12.33, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': SX, 'z': SZ, 'lv': SLV, 'yaw': 3.1416}})
        await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp); await run.shot(pg, '01_host')
        ok, s = await go_press(pg, cdp, run, DOOR, ROOM)
        await run.shot(pg, '02_arrive')
        run.check(f'1. 「{DOOR}」→ 房間（正式模型）、站得住、不在「{EXIT}」上', ok and s['zone'] == ROOM and s['stand'] and not s['interact'].startswith('離開') and await pg.evaluate("!!GAME.E.zone.formal"), json.dumps(s, ensure_ascii=False))
        for k, lab in enumerate(SEATS):
            ok, sat, s = await sit_here(pg, cdp, run, lab)
            await run.shot(pg, f'0{3 + k}_sit')
            run.check(f'2. 走到座位「{lab}」→ 坐下', ok and bool(sat), json.dumps(sat or s, ensure_ascii=False))
            s = await stand_up(pg, cdp, run)
            run.check('2. 站起來、站得住', s['pose'] != 'sit' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok, s = await go_press(pg, cdp, run, EXIT, HOST)
        await run.shot(pg, '09_back')
        lv = await pg.evaluate("GAME.E.player.lv|0")
        run.check(f'3. 「{EXIT}」→ {HOST} 第 {SLV} 層、站得住', ok and s['zone'] == HOST and lv == SLV and s['stand'], json.dumps(dict(s, lv=lv), ensure_ascii=False))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('4. 沒有 JS 例外', not errs, '；'.join(errs[:3]))
        run.check('4. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', fb == 0, str(fb))
        await b.close()
    run.finish()

asyncio.run(main())
