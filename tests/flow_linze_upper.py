"""霖澤館 3F、4F（LINZE-34F-TABLES-1020；LAWWW2-C 臨時接線 src/linze_upper3d.js）：真實玩家流程。
[前置／捷徑] 讀檔到 2025-09-09（二）12:20 霖澤館 2F 迴廊、樓梯間的門前面。手機模擬橫向、不用 turbo。
  1. 2F「進入 樓梯間（往 3F、4F）」→ 3F（linze_3f、正式模型）；站得住、不會一上來就在「走樓梯」上
  2. 走到野餐桌「坐長椅」→ 坐下（坐姿）、站起來
  3. 「走樓梯上樓（4F）」→ 4F；走到窗邊桌「坐窗邊（自習）」→ 坐下、站起來
  4. 「走樓梯下樓（3F）」→ 3F；「走樓梯下樓（2F）」→ 霖澤館 2F（第 1 層）、站得住
  5. 沒有 JS 例外；劇情自動走路沒有用到卡住保險
這是 Playwright 手機模擬，不是 iPhone 實機。用法：python3 tests/flow_linze_upper.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_linze_upper'
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
    # 長椅的座位在桌子的碰撞框裡面（一體的野餐桌）：走到遊戲自己算的走近點（GAME.seatApproach，玩家按「坐長椅」時也是走到這裡）
    seat = await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj.position; const it=GAME.E.interactables.filter(i=>i.seat&&(i.label||'').startsWith({json.dumps(label)})).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0]; if(!it) return null; const ap=GAME.seatApproach(it.seat); return {{x:it.x,z:it.z,ax:ap[0],az:ap[1]}}; }})()")
    ok = bool(seat) and await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.12, label)   # 座位按鈕的範圍 0.7 m：走近點離座位 0.6 m，要真的走到
    s = await L.state(pg)
    if not ok and s['interact'].startswith(label): run.note(f'沒走到走近點 0.12 m 以內，但「{label}」按鈕已經出現（玩家看到的就是這個按鈕）：照按')
    if not s['interact'].startswith(label): return False, None, s
    await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None; trace = []
    while time.time() - t0 < 40:
        s = await L.state(pg)
        toast = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e&&!e.classList.contains('hide')?e.textContent:''; })()")
        trace.append((round(time.time() - t0, 1), s['pose'], s['busy'], round(s['x'], 2), round(s['z'], 2), toast[:20]))
        if s['pose'] == 'sit': sat = s; break   # 坐下以後的選單（坐一下／起身）不按：按「坐一下」時間會一直往後跳
        await pg.wait_for_timeout(500)
    if not sat: run.note('坐下的過程：' + json.dumps(trace[:12], ensure_ascii=False))
    await pg.wait_for_timeout(1500)
    return True, sat, s


async def stand_up(pg, cdp, run):
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=30)
    if s['pose'] == 'sit': await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
    return await L.state(pg)


async def main():
    run = L.Run('flow_linze_upper', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        run.setup('讀檔：2025-09-09（二）12:20 霖澤館 2F 迴廊、樓梯間的門前面 (7.0, −5.4)')
        await L.load_state(pg, {'zone': 'linze', 'hour': 12.33, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': 7.0, 'z': -4.6, 'lv': 1, 'yaw': 3.1416}})
        await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp); await run.shot(pg, '01_linze_2f')
        ok, s = await go_press(pg, cdp, run, '進入 樓梯間', 'linze_3f')
        await run.shot(pg, '02_3f_arrive')
        run.check('1. 2F「進入 樓梯間（往 3F、4F）」→ 3F（正式模型）、站得住、不在「走樓梯」上', ok and s['zone'] == 'linze_3f' and s['stand'] and not s['interact'].startswith('走樓梯') and await pg.evaluate("!!GAME.E.zone.formal"), json.dumps(s, ensure_ascii=False))
        ok, sat, s = await sit_here(pg, cdp, run, '坐長椅')
        await run.shot(pg, '03_3f_sit')
        run.check('2. 走到野餐桌「坐長椅」→ 坐下', ok and bool(sat), json.dumps(sat or s, ensure_ascii=False))
        s = await stand_up(pg, cdp, run)
        run.check('2. 站起來、站得住', s['pose'] != 'sit' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok, s = await go_press(pg, cdp, run, '走樓梯上樓（4F）', 'linze_4f')
        await run.shot(pg, '04_4f_arrive')
        run.check('3. 「走樓梯上樓（4F）」→ 4F、站得住', ok and s['zone'] == 'linze_4f' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok, sat, s = await sit_here(pg, cdp, run, '坐窗邊')
        await run.shot(pg, '05_4f_sit')
        run.check('3. 走到窗邊桌「坐窗邊（自習）」→ 坐下', ok and bool(sat), json.dumps(sat or s, ensure_ascii=False))
        s = await stand_up(pg, cdp, run)
        run.check('3. 站起來、站得住', s['pose'] != 'sit' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok, s = await go_press(pg, cdp, run, '走樓梯下樓（3F）', 'linze_3f')
        run.check('4. 「走樓梯下樓（3F）」→ 3F、站得住', ok and s['zone'] == 'linze_3f' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok, s = await go_press(pg, cdp, run, '走樓梯下樓（2F）', 'linze')
        await run.shot(pg, '06_back_2f')
        lv = await pg.evaluate("GAME.E.player.lv|0")
        run.check('4. 「走樓梯下樓（2F）」→ 霖澤館 2F（第 1 層）、站得住', ok and s['zone'] == 'linze' and lv == 1 and s['stand'], json.dumps(dict(s, lv=lv), ensure_ascii=False))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('5. 沒有 JS 例外', not errs, '；'.join(errs[:3]))
        run.check('5. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', fb == 0, str(fb))
        await b.close()
    run.finish()

asyncio.run(main())
