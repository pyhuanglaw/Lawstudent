"""看畫面的冒煙測試（使用者 2026-10-17 23:3x：「很多我一打開遊戲就會發現的錯誤你好像也測不出來」）：幾分鐘看一輪玩家一打開就會看到的畫面。
每一步用 tests/screencheck.py 檢查（黑畫面、對話／選項被蓋住、文字超框、按鈕出界、自由走動時人物不在畫面），結束時出縮圖總表給人逐張看。
A. 標題畫面 → 開新遊戲（經濟系那一年）→ 一路點對話約 90 秒：每個新的對話、選項都檢查。
B. [前置／捷徑] 讀檔到各個主要區域（法律系大一上第 3 週週二 12:30；只看畫面，條件事件關掉）：校園、宿舍走廊、宿舍房間、共同教學館、博雅、總圖大廳、
   霖澤館、萬才館、公館、溫州街、兩點半 Café；每一區空下來檢查一次。
C. 校園：打開手機 → 收起來、打開大地圖 → 關掉、打開選單 → 關掉，每次關掉以後檢查 3D 畫面還在（BUG-MAPBLACK：iPhone 按地圖以後變黑）。
D. 晚上 21:00 的校園；經濟系休學後臺北的家（2D 選單）。
E. 直向（390×844）：校園、手機。
用法：python3 tests/screen_smoke.py URL [輸出資料夾]；看 OUT/screens_sheet_*.png（縮圖總表）、screen_problem_*.png（有問題的原圖）"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
import screencheck as SC

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/screen_smoke'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'
ZONES = ['campus', 'dorm_hall', 'dorm', 'gongtong', 'boya', 'library_hall', 'linze', 'wancai', 'gongguan', 'wenzhou', 'cafe']
FLAGS = {'KX_FIRST_MSG': True, 'fundsV2': 1, 'introDone': True, 'classDone': True, 'metAn': True, 'afternoonDone': True}


async def wait_zone(pg, zone, s=40):
    for _ in range(s * 2):
        if await pg.evaluate("(z=>!!GAME.E.zone&&!!GAME.E.zone.def&&GAME.E.zone.def.id===z&&!document.querySelector('#fade.on'))(%s)" % json.dumps(zone)): return True
        await pg.wait_for_timeout(500)
    return False


async def settle(pg, cdp, ms=2500):
    """讀檔後可能跳出起床選單、對話：點掉（照第一個選項），再等畫面穩定"""
    for _ in range(12):
        s = await L.state(pg)
        if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(700); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        break
    await pg.wait_for_timeout(ms)


async def main():
    run = L.Run('screen_smoke', OUT); sc = SC.Checker(run, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：標題 → 新遊戲的前幾分鐘 ----------
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await L.wait_loaded(pg)
        await sc.check(pg, '標題畫面')
        await L.tap(pg, cdp, '#btnNew'); t0 = time.time(); was = False; last = None
        while time.time() - t0 < 90:
            s = await L.state(pg)
            if s['choices']:
                o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,10)).join('|')")
                if o != last: last = o; await sc.check(pg, '新遊戲 選項 ' + o[:12])
                await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(800); continue
            if s['dlg']:
                if not was: await sc.check(pg, '新遊戲 對話 ' + s['dtext'][:10])
                was = True; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            was = False; await pg.wait_for_timeout(800)
        await sc.check(pg, '新遊戲 90 秒後')
        # ---------- B：各區域 ----------
        d = await pg.evaluate("STORY.termDay('Y1S1',3,2)")
        for z in ZONES:
            st = {'stage': 'law', 'zone': z, 'day': d, 'weekday': 2, 'hour': 12.5, 'flags': dict(FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}}
            await L.load_state(pg, st, quiet_events=True)
            ok = await wait_zone(pg, z)
            if not ok: run.check('讀檔進到「%s」' % z, False); continue
            await settle(pg, cdp); await sc.check(pg, '區域 ' + z)
        # ---------- C：校園的手機、大地圖、選單 ----------
        await L.load_state(pg, {'stage': 'law', 'zone': 'campus', 'day': d, 'weekday': 2, 'hour': 12.5, 'flags': dict(FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}}, quiet_events=True)
        await wait_zone(pg, 'campus'); await settle(pg, cdp)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200); await sc.check(pg, '校園 手機打開')
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(1200); await sc.check(pg, '校園 手機收起來以後')
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(2000); await sc.check(pg, '校園 大地圖打開')
        await L.tap(pg, cdp, '#bmClose'); await pg.wait_for_timeout(2000); await sc.check(pg, '校園 大地圖關掉以後（BUG-MAPBLACK）')
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200); await sc.check(pg, '校園 選單打開')
        await L.tap(pg, cdp, '#btnClose'); await pg.wait_for_timeout(1200); await sc.check(pg, '校園 選單關掉以後')
        # ---------- D：晚上、經濟系臺北的家 ----------
        await L.load_state(pg, {'stage': 'law', 'zone': 'campus', 'day': d, 'weekday': 2, 'hour': 21, 'flags': dict(FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}}, quiet_events=True)
        await wait_zone(pg, 'campus'); await settle(pg, cdp); await sc.check(pg, '校園 21:00')
        de = await pg.evaluate("STORY.dayOfKey('2024-11-04')")
        await L.load_state(pg, {'stage': 'econ', 'zone': 'campus', 'day': de, 'weekday': 1, 'hour': 10, 'home': {'at': True, 'base': True, 'day': de},
                                'flags': dict(FLAGS, Y0_MOVED_OUT=True, ECON_CAMP_OPEN=True, dating_kexin=True, LEAVE_WEEK=6), 'events': {'done': {'ev_y0_a3': 1, 'ev_y0_e26': 1}, 'last': {}, 'count': 2}})
        for _ in range(30):
            s = await L.state(pg)
            if s['choices']: break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        await sc.check(pg, '經濟系 臺北的家（選單）')
        # ---------- E：直向 ----------
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(500)
        await L.load_state(pg, {'stage': 'law', 'zone': 'campus', 'day': d, 'weekday': 2, 'hour': 12.5, 'flags': dict(FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}}, quiet_events=True)
        await wait_zone(pg, 'campus'); await settle(pg, cdp); await sc.check(pg, '直向 校園')
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200); await sc.check(pg, '直向 手機')
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
        sc.finish()
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
