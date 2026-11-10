"""瀏覽器：一鍵前往約會跳到約好的時間、一起過去的目標列、出席一門一行（INV-GO-JUMP-1110、INV-NOW-GOAL-1110、ATTEND-TIDY-1110；使用者 2026-11-10 X290、X286、X292）。不用 ?turbo。
[前置／捷徑] 讀檔（GAME.applySave）放到時間地點；約好的見面用 INV.accept 直接放進存檔（這支不測怎麼約，測約好以後按「前往」）；關掉條件事件。
A. 13:00 在宿舍、和阿哲約 15:00 2:30 AM：手機「今天」那一筆有「前往」、寫「按「前往」會先跳到 HH:MM 出發」→ 按「前往」→ 人到 2:30 AM、時間在 14:30～15:00 之間（不是 13:xx 就到）
B. 17:20 在校園、約 18:00 小路（18:00 才開門）：有「前往」、寫「（18:00 開門）」→ 按 → 人到小路、時間 18:00 以後、沒有跳「還沒開」
C. 10/16 在校園和阿哲「現在一起過去」公館燒臘：上方目標列寫「和阿哲一起去…」（10/23 讀檔會演感冒那一週的劇情，換一天）
D. 手機「課表」：出席一門課一行（.attRow），截圖
用法：python3 tests/flow_inv_go_jump.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_inv_go_jump'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
VISITED = {'dorm': True, 'noodle': True, 'campus': True, 'gongguan': True, 'wenzhou': True, 'cafe': True}


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(700)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def close_phone(pg, cdp):
    if not await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)


async def day_of(pg, key):
    return await pg.evaluate("(k=>{ const d=STORY.dayOfKey(k); return {day:d, wd:CALENDAR.dateOf(d).wd%%7}; })(%s)" % json.dumps(key))


async def wait_zone(pg, zone, secs=40):
    for _ in range(secs * 2):
        z = await pg.evaluate("GAME.G.zone")
        if z == zone: return True
        await pg.wait_for_timeout(500)
    return False


async def hook_toasts(pg):
    await pg.evaluate("(()=>{ if(window.__toasts) return; window.__toasts=[]; const el=document.getElementById('toast'); if(!el) return; new MutationObserver(()=>{ const t=el.textContent||''; if(t) window.__toasts.push(t); }).observe(el,{childList:true,characterData:true,subtree:true}); })()")


async def main():
    run = L.Run('flow_inv_go_jump', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A ----------
        d = await day_of(pg, '2025-10-23')
        run.setup('讀檔：10/23 13:00 宿舍房間；和阿哲約好 15:00 2:30 AM（INV.accept）；關掉條件事件')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 13.0, 'day': d['day'], 'weekday': d['wd'], 'weather': 'sunny', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}, 'flags': BASE_FLAGS, 'visited': VISITED}, quiet_events=True)
        await pg.wait_for_timeout(3000); await hook_toasts(pg)
        await pg.evaluate("(()=>{ const G=GAME.G; INV.rec(G); INV.accept(G,'zhe','cafe',G.day,15,{by:'player'}); })()")
        txt = await phone(pg, cdp, 'today')
        has = await pg.evaluate("!!document.querySelector('#phoneBody [data-invgo]')")
        run.check('A 手機「今天」：那一筆有「前往」、寫會先跳到幾點出發', has and '按「前往」會先跳到' in txt, txt[txt.find('今天約好的'):][:120])
        await run.shot(pg, 'A_phone_today')
        await L.tap(pg, cdp, '#phoneBody [data-invgo]')
        ok = await wait_zone(pg, 'cafe', 60)
        h = await pg.evaluate("GAME.G.hour%24")
        run.check('A 按「前往」：人到 2:30 AM、時間跳到 14:30～15:00（約好的時間前）', ok and 14.5 <= h <= 15.0, json.dumps({'zone': await pg.evaluate('GAME.G.zone'), 'hour': round(h, 3)}))
        await pg.wait_for_timeout(2500); await run.shot(pg, 'A_arrived_cafe')
        # ---------- B ----------
        run.setup('讀檔：10/23 17:20 校園；約好 18:00 小路（18:00 才開門）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 17 + 20 / 60, 'day': d['day'], 'weekday': d['wd'], 'weather': 'sunny', 'flags': BASE_FLAGS, 'visited': VISITED}, quiet_events=True)
        await pg.wait_for_timeout(3000); await pg.evaluate("window.__toasts=[]")
        await pg.evaluate("(()=>{ const G=GAME.G; INV.rec(G); INV.accept(G,'zhe','wz_teishoku',G.day,18,{by:'player'}); })()")
        txt = await phone(pg, cdp, 'today')
        has = await pg.evaluate("!!document.querySelector('#phoneBody [data-invgo]')")
        run.check('B 還沒開門：照樣有「前往」、寫「（18:00 開門）」', has and '18:00 開門' in txt, txt[txt.find('今天約好的'):][:140])
        await run.shot(pg, 'B_phone_today')
        zone = await pg.evaluate("(INV.place('wz_teishoku')||{}).zone")
        await L.tap(pg, cdp, '#phoneBody [data-invgo]')
        ok = await wait_zone(pg, zone, 60)
        h = await pg.evaluate("GAME.G.hour%24"); ts = await pg.evaluate("window.__toasts")
        run.check('B 按「前往」：人到小路、時間 18:00 以後（開門以後）、沒有「還沒開」', ok and 18.0 - 1e-3 <= h <= 18.3 and not any(('還沒' in t and '開' in t) or '休息' in t for t in ts), json.dumps({'zone': zone, 'hour': round(h, 3), 'toasts': ts[-4:]}, ensure_ascii=False))
        await pg.wait_for_timeout(2500); await run.shot(pg, 'B_arrived')
        # ---------- C ----------
        d2 = await day_of(pg, '2025-10-16')   # 10/23 是「感冒的那一週」開演的那天（STORY.coldWeekTick），讀檔就會演，這一段換一天
        run.setup('讀檔：10/16 16:00 校園；和阿哲「現在一起過去」公館燒臘（INV.accept now）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 16.0, 'day': d2['day'], 'weekday': d2['wd'], 'weather': 'sunny', 'flags': BASE_FLAGS, 'visited': VISITED}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        await pg.evaluate("(()=>{ const G=GAME.G; INV.rec(G); INV.accept(G,'zhe','noodle',G.day,G.hour%24,{now:true,by:'player'}); })()")
        # STORY.tick 每 30 格跑一次（game3d.js 主迴圈）：雲端 SwiftShader 一秒約 1 格，要等 30 秒以上；PC 很快
        await pg.evaluate("(async()=>{ const f0=GAME.E.frame; for(let i=0;i<240&&GAME.E.frame<f0+35;i++) await new Promise(r=>setTimeout(r,500)); })()")
        goal = await pg.evaluate("(document.getElementById('goal')||{}).textContent||''")
        run.check('C 一起過去的途中：上方目標列寫「和阿哲一起去…」', '和阿哲一起去' in goal, goal)
        await run.shot(pg, 'C_goal_going')
        # ---------- D ----------
        txt = await phone(pg, cdp, 'week')
        n = await pg.evaluate("document.querySelectorAll('#phoneBody .attRow').length")
        await pg.evaluate("(()=>{ const r=document.querySelector('#phoneBody .attRow'); if(r) r.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(500)
        run.check('D 手機「課表」：出席一門課一行（.attRow 5 行以上）', n >= 5, f'{n} 行')
        await run.shot(pg, 'D_attendance')
        await close_phone(pg, cdp)
        run.check('沒有 JS 錯誤', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    run.finish()


if __name__ == '__main__':
    asyncio.run(main())
