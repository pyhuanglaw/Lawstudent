"""BB：開局二選一（game3d.js 533 行）＋在家存檔。
A 標題畫面有兩個新遊戲按鈕；按「直接從法律系大一開始」→ 照玩家點對話、選第一個 → 看 stage law、日期 2025-08 宿營、沒有經濟系的東西（可昕、經濟系同學不在朋友列表）。
B [前置／捷徑] 讀檔到 2024-11-20 21:00 在臺北的家（經濟系退宿後）→ 選單存到欄位 2 → 重新整理 → 標題「讀取」欄位 2 → 看還在家、日期時間一樣、家的選單出現。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]
async def main():
    run = L.Run('start_save_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        btns = await pg.evaluate("[...document.querySelectorAll('#titleScreen button')].filter(b=>!b.classList.contains('hide')&&b.offsetParent).map(b=>b.textContent.trim().slice(0,20))")
        print('標題按鈕', btns); await run.shot(pg, 'A_title')
        run.check('A 標題有「從經濟系前傳開始」和「直接從法律系大一開始」', any('經濟系前傳' in x for x in btns) and any('直接從法律系' in x for x in btns), json.dumps(btns, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnNewLaw'); lines = []
        for i in range(260):
            if not await pg.evaluate("!!GAME.G&&GAME.running"): await pg.wait_for_timeout(800); continue
            s = await L.state(pg)
            if s['dlg']: lines.append(s['dtext'][:40]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(900); continue
            g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone})")
            if i > 30 and not s['busy']: break
            await pg.wait_for_timeout(700)
        g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,kx:!!(GAME.G.contacts&&GAME.G.contacts.kexin!=null),y0:!!GAME.G.flags.PLAYED_Y0})")
        print('A 法律系開局之後', json.dumps(g, ensure_ascii=False)); print('   前幾句：', lines[:8]); await run.shot(pg, 'A_after')
        run.check('A 直接法律系開局：stage law、2025-08', g['stage'] == 'law' and g['key'].startswith('2025-08'), json.dumps(g, ensure_ascii=False))
        run.check('A 沒有經濟系前傳的東西（可昕不在聯絡人、PLAYED_Y0 沒設）', not g['kx'] and not g['y0'], json.dumps(g, ensure_ascii=False))
        d = await pg.evaluate("STORY.dayOfKey('2024-11-20')")
        st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': 3, 'hour': 21, 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57}, 'home': {'at': True, 'base': True, 'day': d},
              'contacts': {'kexin': d - 60}, 'flags': {'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17', 'KX_FIRST_MSG': True, 'fundsV2': 1, 'Y0_STICKY': True},
              'events': {'done': {'ev_y0_e30': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1, 'ev_y0_e30_note': 1, 'ev_y0_e12': 1}, 'last': {}, 'count': 5}}
        run.setup('B 讀檔到 2024-11-20 21:00 在臺北的家'); await L.load_state(pg, st); await pg.wait_for_timeout(3500)
        for _ in range(20):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
            else: break
        before = await pg.evaluate("({key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),home:HOME.at(GAME.G),ch:[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,6))})")
        print('B 存檔前', json.dumps(before, ensure_ascii=False)); await run.shot(pg, 'B_before')
        await L.close_panels(pg, cdp)
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('button')].find(b=>/存檔/.test(b.textContent)&&b.offsetParent&&!/讀取/.test(b.textContent)); if(t) t.click(); })()"); await pg.wait_for_timeout(900)
        await run.shot(pg, 'B_menu')
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 2')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        run.check('B 選單裡有「欄位 2 存檔」的按鈕', bool(c), '')
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("!!localStorage.getItem('fatiao3d_slot_2')"); run.check('B 存到欄位 2', saved, '')
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 2')); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(5000)
        after = await pg.evaluate("({key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),home:HOME.at(GAME.G),stage:GAME.G.stage,ch:[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,6))})")
        print('B 讀檔後', json.dumps(after, ensure_ascii=False)); await run.shot(pg, 'B_after')
        run.check('B 讀回來還在家、同一天同一時間、看得到家裡的選單', after['home'] and after['key'] == before['key'] and abs(after['h'] - before['h']) < 0.2 and bool(after['ch']), json.dumps({'before': before, 'after': after}, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
