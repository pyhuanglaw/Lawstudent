"""真實玩家流程：美國交換篇的場景接進遊戲（LAWWW2-C 2026-10-17；使用者「先做1，把美國場景接進遊戲」；src/us3d.js）

不用 ?turbo、不瞬移；手機模擬（iPhone 橫向、is_mobile、CDP 觸控）。玩家的操作只用：搖桿、點地面（遊戲的自動找路）、點互動按鈕、選單。
  [前置／捷徑] 兩個：①讀檔到大四上 2028/8/2（BB_215 出發那天）13:00、桃園機場出境層的下車處；②（第 7 步）讀檔到入境大廳的出關門口。
  1. 下車處（出境層外的人行道）站得住；走進出境大廳 → 報到櫃台 A：「看」有說明
  2. 服務台（大廳中間）：走得到
  3. 安檢入口「登機：飛往美國」（LAWWW-C 的交換系統：字卡、時差）→ 美國公寓社區；沒有交換系統時是測試用的「出境（前往美國）」
  4. 社區：從入口走過停車場到 B 棟東邊的樓梯間 →「回公寓」→ 公寓門外的樓梯平台；一到社區不會就跳出「出門」
  5. 公寓：從平台走進大門 → 走道 → 客廳：沙發坐下、站起來 → 臥室：床尾出現「睡覺」→ 書桌「坐在書桌前」→ 廚房：冰箱
  6. 走回平台東端（樓梯）「出門」→ 社區、樓梯間門口；不會一出來就跳出「回公寓」
  6b.（LAWWW-C 的最小可玩流程：外出 → 回公寓）社區入口「出門（去超市）」→ 超市：乳製品冷藏櫃、零食走道 →「過馬路」→ 對面的亞洲超市：泡麵 →「過馬路（回大超市）」→「離開超市」→ 社區入口
  6c. C 棟「上樓（C 棟 208）」→ 學姊她們那一戶的共用廚房（冰箱上的輪值表、窗口吧台）→「出門」→ C 棟樓梯口
  6d. 從 C 棟走過停車場到會所門口（門廊下）：「會所」有說明
  7. 入境大廳：走到接機處 →「出口（搭車回台北）」→ 公館
  8. 沒有 JS 例外；劇情自動走路沒有用到卡住保險（walkFallbacks＝0）
這是 Playwright 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_us_exchange.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_us_exchange'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}


async def caption(pg):
    return await pg.evaluate("(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')?e.textContent:''; })()")


async def look(pg, cdp, label):
    s = await L.state(pg)
    if not s['interact'].startswith(label): return ''
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); cap = await caption(pg)
    if not cap:   # 說明也可能用對話框（GM.say）顯示
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
    it = await L.find_it(pg, label)
    if not it: run.note(f'找不到互動點「{label}」'); return False
    ok = await L.go_to(pg, cdp, run, it['x'] + dx, it['z'] + dz, near, label)
    s = await L.state(pg)
    return ok and s['interact'].startswith(label)


async def main():
    run = L.Run('flow_us_exchange', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        day = await pg.evaluate("(()=>{ for(let d=0; d<2400; d++){ const t=CALENDAR.dateOf(d); if(t.y===2028&&t.m===8&&t.d===2) return d; } return null; })()")
        run.setup(f'讀檔：大四上 2028/8/2（第 {day} 天）13:00、桃園機場出境層的下車處 (4,17.8)、晴天、交換已經出發（US_DEPARTED）')
        dep = await pg.evaluate("AIRPORT_T2_LAYOUT.dep.spawn_curb")
        await L.load_state(pg, {'zone': 'airport_dep', 'hour': 13.0, 'day': day or 900, 'weather': 'sunny', 'pos': {'x': dep['x'], 'z': dep['z'], 'yaw': dep['yaw']}, 'flags': dict(FLAGS, EXCHANGE_ROUTE='US', US_DEPARTED=True)})   # 交換出發那一趟（交換系統出發時設的旗標）：機場的「登機」才是飛往美國；寒暑假出國是通用的「登機」
        await pg.wait_for_timeout(6000)
        s = await L.state(pg); await run.shot(pg, '01_airport_curb')
        run.check('1. 機場出境層的下車處：站得住', s['zone'] == 'airport_dep' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok = await walk_to_it(pg, cdp, run, '報到櫃台 A', 0.8)
        cap = await look(pg, cdp, '報到櫃台 A') if ok else ''
        await run.shot(pg, '02_airport_checkin')
        run.check('1. 走進出境大廳、到報到櫃台 A，「看」有說明', ok and '報到' in cap, f'「{cap[:40]}」')
        ok = await walk_to_it(pg, cdp, run, '服務台', 0.7)
        run.check('2. 走到大廳中間的服務台', ok)
        board = '登機：飛往美國' if await pg.evaluate("typeof EXCH!=='undefined'") else '出境（前往美國）'   # 有交換系統（LAWWW-C 的 src/exchange3d.js）＝它的登機流程（字卡、時差）
        ok = await walk_to_it(pg, cdp, run, board, 1.0)
        await run.shot(pg, '03_airport_security')
        run.check(f'3. 走到安檢入口、出現「{board}」', ok)
        run.check(f'3. 「{board}」→ 美國公寓社區', ok and await press(pg, cdp, run, board, 'us_outside', timeout=90))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '04_us_entrance')
        run.check('3. 在社區入口、站得住；不會一到就跳出「出門」', s['zone'] == 'us_outside' and s['stand'] and not s['interact'].startswith('出門'), json.dumps(s, ensure_ascii=False))
        # 4. 社區 → 上樓
        ok = await walk_to_it(pg, cdp, run, '回公寓', 0.7)
        await run.shot(pg, '05_us_breezeway_foot')
        run.check('4. 走過停車場到 B 棟東邊的樓梯間、出現「回公寓」', ok)
        run.check('4. 「回公寓」→ 公寓', ok and await press(pg, cdp, run, '回公寓', 'us_apartment'))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '06_apt_landing')
        run.check('4. 在公寓門外的樓梯平台、站得住；不會一進來就跳出「下樓」', s['zone'] == 'us_apartment' and s['stand'] and not s['interact'].startswith('下樓'), json.dumps(s, ensure_ascii=False))
        # 5. 公寓裡
        sofa = await L.find_it(pg, '坐在沙發上')
        ok = bool(sofa) and await L.go_to(pg, cdp, run, sofa['x'], sofa['z'], 0.5, '客廳的沙發')
        run.check('5. 走進大門、經過走道到客廳的沙發（出現「坐在沙發上」）', ok and (await L.state(pg))['interact'].startswith('坐在沙發上'))
        await run.shot(pg, '07_apt_living')
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None
        while time.time() - t0 < 40:
            s = await L.state(pg)
            if s['pose'] == 'sit': sat = s; break
            if s['choices']: await L.advance_dialogs(pg, cdp, run, until=lambda q: q['pose'] == 'sit' or not q['choices'], max_steps=4)
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500); await run.shot(pg, '08_apt_sofa_sit')
        run.check('5. 坐在沙發上（坐姿）', bool(sat), json.dumps(sat, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=30)
        if s['pose'] == 'sit':
            await L.joystick(pg, cdp, 40, 0, 900); await pg.wait_for_timeout(1500)
        s = await L.state(pg)
        run.check('5. 站起來、站得住', s['pose'] != 'sit' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok = await walk_to_it(pg, cdp, run, '睡覺', 0.6)
        await run.shot(pg, '09_apt_bedroom')
        run.check('5. 走進臥室，床尾出現「睡覺」', ok)
        ok = await walk_to_it(pg, cdp, run, '坐在書桌前', 0.7, dx=-0.6, dz=0.15)
        run.check('5. 書桌出現「坐在書桌前」', ok)
        ok = await walk_to_it(pg, cdp, run, '打開冰箱', 0.6)
        cap = await look(pg, cdp, '打開冰箱') if ok else ''
        await run.shot(pg, '10_apt_kitchen')
        run.check('5. 走進廚房、冰箱有說明', ok and '冰箱' in cap, f'「{cap[:40]}」')
        # 6. 下樓
        ok = await walk_to_it(pg, cdp, run, '出門', 0.6)
        run.check('6. 走回平台東端、出現「出門」', ok)
        run.check('6. 「出門」→ 社區', ok and await press(pg, cdp, run, '出門', 'us_outside'))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '11_us_lot')
        run.check('6. 在 B 棟東邊樓梯間門口、站得住；不會一出來就跳出「回公寓」', s['zone'] == 'us_outside' and s['stand'] and not s['interact'].startswith('上樓'), json.dumps(s, ensure_ascii=False))
        # 6b. 出門 → 超市 → 回社區（BB_215：超市一定要；US1「看蛋的日期」）
        ok = await walk_to_it(pg, cdp, run, '出門（去超市）', 0.8)
        run.check('6b. 走到社區入口、出現「出門（去超市）」', ok)
        run.check('6b. 「出門（去超市）」→ 超市', ok and await press(pg, cdp, run, '出門（去超市）', 'us_market'))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '11b_us_market')
        run.check('6b. 在超市入口、站得住', s['zone'] == 'us_market' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok = await walk_to_it(pg, cdp, run, '牛奶、蛋', 0.8)
        cap = await look(pg, cdp, '牛奶、蛋') if ok else ''
        await run.shot(pg, '11c_us_market_dairy')
        run.check('6b. 走到最裡面的乳製品冷藏櫃（「牛奶、蛋」有說明）', ok and len(cap) > 0, f'「{cap[:40]}」')
        ok = await walk_to_it(pg, cdp, run, '第 2 走道：零食', 0.8)
        await run.shot(pg, '11d_us_market_aisle')
        run.check('6b. 走進零食走道', ok)
        # 6b'. 對面的小亞洲超市（使用者 2026-10-17 23:0x；BB-C：US1 的台灣泡麵在這裡買）
        ok = await walk_to_it(pg, cdp, run, '過馬路（對面的亞洲超市）', 0.6)
        run.check("6b'. 走到大超市出口旁、出現「過馬路（對面的亞洲超市）」", ok)
        run.check("6b'. 「過馬路」→ 亞洲超市", ok and await press(pg, cdp, run, '過馬路（對面的亞洲超市）', 'us_asian_market'))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '11d2_asian_market')
        run.check("6b'. 在亞洲超市門口、站得住；不會一到就跳出出口", s['zone'] == 'us_asian_market' and s['stand'] and not s['interact'].startswith(('過馬路', '回社區')), json.dumps(s, ensure_ascii=False))
        ok = await walk_to_it(pg, cdp, run, '泡麵', 0.6)
        cap = await look(pg, cdp, '泡麵') if ok else ''
        await run.shot(pg, '11d3_asian_noodles')
        run.check("6b'. 走到泡麵那一排（US1 的台灣泡麵），有說明", ok and len(cap) > 0, f'「{cap[:40]}」')
        ok = await walk_to_it(pg, cdp, run, '過馬路（回大超市）', 0.6)
        run.check("6b'. 「過馬路（回大超市）」→ 大超市", ok and await press(pg, cdp, run, '過馬路（回大超市）', 'us_market'))
        await pg.wait_for_timeout(4000)
        ok = await walk_to_it(pg, cdp, run, '離開超市', 0.8)
        run.check('6b. 「離開超市」→ 社區入口', ok and await press(pg, cdp, run, '離開超市', 'us_outside'))
        await pg.wait_for_timeout(4000); s = await L.state(pg)
        run.check('6b. 回到社區入口、站得住；不會一到就跳出「出門」', s['zone'] == 'us_outside' and s['stand'] and not s['interact'].startswith('出門'), json.dumps(s, ensure_ascii=False))
        # 6c. C 棟 208（學姊她們那一戶，US2 的共用廚房）
        ok = await walk_to_it(pg, cdp, run, '上樓（C 棟 208）', 0.8)
        run.check('6c. 走過停車場到 C 棟的樓梯口、出現「上樓（C 棟 208）」', ok)
        run.check('6c. 「上樓（C 棟 208）」→ 合租戶', ok and await press(pg, cdp, run, '上樓（C 棟 208）', 'us_shared'))
        await pg.wait_for_timeout(5000); s = await L.state(pg); await run.shot(pg, '11e_shared_landing')
        run.check('6c. 在合租戶門外的平台、站得住', s['zone'] == 'us_shared' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok = await walk_to_it(pg, cdp, run, '看冰箱上的輪值表', 0.6)
        cap = await look(pg, cdp, '看冰箱上的輪值表') if ok else ''
        await run.shot(pg, '11f_shared_kitchen')
        run.check('6c. 走進共用廚房、冰箱上的輪值表有說明', ok and '輪值' in cap, f'「{cap[:40]}」')
        ok = await walk_to_it(pg, cdp, run, '坐在吧台', 0.6)
        await run.shot(pg, '11g_shared_bar')
        run.check('6c. 窗口吧台的高腳椅出現「坐在吧台」', ok)
        ok = await walk_to_it(pg, cdp, run, '出門', 0.6)
        run.check('6c. 「出門」→ 社區、C 棟樓梯口', ok and await press(pg, cdp, run, '出門', 'us_outside'))
        await pg.wait_for_timeout(4000); s = await L.state(pg)
        run.check('6c. 在 C 棟樓梯口、站得住；不會一出來就跳出「上樓」', s['zone'] == 'us_outside' and s['stand'] and not s['interact'].startswith('上樓'), json.dumps(s, ensure_ascii=False))
        # 6d. 會所門口（BB_215「社區走到 C 棟和會所門口」；會所裡面是 2D）
        ok = await walk_to_it(pg, cdp, run, '會所', 0.8)
        cap = await look(pg, cdp, '會所') if ok else ''
        await run.shot(pg, '11h_clubhouse_door')
        run.check('6d. 從 C 棟走過停車場到會所門廊下、「會所」有說明', ok and len(cap) > 0, f'「{cap[:40]}」')
        # 7. 入境大廳
        arr = await pg.evaluate("AIRPORT_T2_LAYOUT.arr.spawn_customs")
        run.setup('讀檔：同一天 15:00、桃園機場入境大廳的出關門口')
        await L.load_state(pg, {'zone': 'airport_arr', 'hour': 15.0, 'day': day or 900, 'weather': 'sunny', 'pos': {'x': arr['x'], 'z': arr['z'], 'yaw': arr['yaw']}, 'flags': FLAGS})
        await pg.wait_for_timeout(6000); await run.shot(pg, '12_airport_arrival')
        ok = await walk_to_it(pg, cdp, run, '接機處', 0.8)
        run.check('7. 從出關門走到接機處', ok)
        ok = await walk_to_it(pg, cdp, run, '出口（搭車回台北）', 0.8)
        run.check('7. 走到入境大廳的出口', ok)
        run.check('7. 「出口（搭車回台北）」→ 公館', ok and await press(pg, cdp, run, '出口（搭車回台北）', 'gongguan'))
        await pg.wait_for_timeout(4000); s = await L.state(pg)
        run.check('7. 在公館、站得住', s['zone'] == 'gongguan' and s['stand'], json.dumps(s, ensure_ascii=False))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('8. 劇情自動走路沒有用到卡住保險', fb == 0, f'walkFallbacks={fb}')
        run.check('8. 沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())


asyncio.run(main())
