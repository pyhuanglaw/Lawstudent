"""寒暑假去她的縣市（AA_276 第 1-1、5、7 節；src/hometown3d.js）：可昕在高雄、沛珊在台中的時候，手機約她「我去高雄找妳？」／「我去台中找妳？」→ 選日子 → 那天出發 → 一整段 → 回臺北。
[前置／捷徑] 讀檔到 2026-07-10（五）20:00 宿舍（大一暑假）：有她的聯絡方式、見過面、熟悉 40；可昕交往中（經濟系那年開始，LIFE-LINE）、沛珊沒交往。
            約好以後，用同一份狀態讀檔到約好那天 08:40（跳過中間的日子，標 [捷徑]）。手機模擬橫向、不用 turbo；選項照第一個選。
檢查：約的清單有那一項；約好＝行事曆一筆、沒先扣錢；那天出發的提示「出發：去高雄找可昕」；演完扣高鐵來回（2980／1400）、HV_N 記一次、回到臺北；錢不夠時選項變灰「高鐵票錢不夠」；沒有 JS 例外。
用法：python3 tests/flow_vac_hometown.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_vac_hometown'
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1}


async def chosen(pg, cdp, words):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>w.some(t=>x.textContent.includes(t))); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent,e.disabled]; })(" + json.dumps(words) + ")")
    if c and not c[3]: await L.touch_tap(cdp, c[0], c[1])
    return c


async def drive(pg, cdp, until, max_s=600, log=None, prefer=()):
    log = log if log is not None else []; t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate(until): return True, log
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); if(!bs.length) return null; const e=bs.find(x=>w.some(t=>x.textContent.includes(t)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent]; })(" + json.dumps(list(prefer)) + ")")
            if c: log.append('▶' + c[2][:40]); await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            t = s['dtext'] or ''
            if not log or log[-1] != t[:60]: log.append(t[:60])
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    return False, log


async def one(pg, cdp, run, who, city, fare, dating):
    nm = '可昕' if who == 'kexin' else '沛珊'
    d = await pg.evaluate("STORY.dayOfKey('2026-07-10')")
    flags = dict(BASE); flags['dating_kexin'] = (who == 'kexin' and dating)
    social = {'rel': {who: {'fam': 40, 'trust': 30, 'aff': 20, 'resp': 10, 'comf': 30, 'rom': 35 if dating else 5, 'npcRom': 0, 'seen': 5, 'talked': 5}},
              'mem': {who: [{'tag': 'FIRST_MET', 'day': -300 if who == 'kexin' else 5, 'note': ''}]}, 'reveal': {}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}}
    run.setup('讀檔：2026-07-10（五）20:00 宿舍；%s的聯絡方式、熟悉 40%s' % (nm, '、交往中' if dating else ''))
    await L.load_state(pg, {'zone': 'dorm', 'hour': 20.0, 'day': d, 'weekday': 5, 'weather': 'sunny', 'stage': 'law', 'money': 8000, 'flags': flags, 'social': social, 'contacts': {who: 0, 'zhe': 0, 'kai': 0}, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}})
    await pg.wait_for_timeout(3000)
    await L.close_panels(pg, cdp)
    pres = await pg.evaluate("(w=>STORY.presence(w,GAME.G))(" + json.dumps(who) + ")")
    run.check(nm + '：7/10 不在臺北（' + city + '）', pres.get('here') is False and pres.get('kind') == 'home', json.dumps(pres, ensure_ascii=False))
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button, #phone [data-tab]')].find(x=>/朋友/.test(x.textContent)); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    b = await pg.evaluate("(w=>{ const e=document.querySelector('#phoneBody [data-inv=\"'+w+'\"]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; })(" + json.dumps(who) + ")")
    run.check(nm + '：手機「朋友」有「約」', bool(b))
    if not b: return
    await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent+((b.disabled||b.classList.contains('dim'))?'（灰）':''))")
    run.check(nm + '：約的清單有「我去' + city + '找妳？」', any(('我去' + city) in o for o in opts), json.dumps(opts, ensure_ascii=False))
    await run.shot(pg, who + '_menu')
    c = await chosen(pg, cdp, ['我去' + city])
    if not c: return
    log = []
    ok, log = await drive(pg, cdp, "(w=>!!OUT.rec(GAME.G).find(q=>q.hv&&q.hv.id===w&&q.state==='planned')&&!GAME.D.active&&!GAME.E.player.busy)(" + json.dumps(who) + ")", 180, log)
    q = await pg.evaluate("(w=>OUT.rec(GAME.G).find(q=>q.hv&&q.hv.id===w))(" + json.dumps(who) + ")")
    money0 = await pg.evaluate("GAME.G.money")
    run.check(nm + '：選日子、她答應、行事曆排一筆（還沒扣錢）', ok and q and money0 == 8000, json.dumps(q, ensure_ascii=False)[:200] + ' ' + json.dumps(log[-6:], ensure_ascii=False))
    if not q: return
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)   # 約好以後手機停在「訊息」頁（開著的時候遊戲時間暫停）：玩家會收起來
    run.setup('同一份狀態讀檔到約好那天、出發提示前 3 分鐘（OUT.due：約好的時間－車程－0.25；跳過中間的日子）')
    await pg.evaluate("(async(q)=>{ const s=JSON.parse(JSON.stringify(GAME.G)); s.day=q.day; s.hour=Math.max(6,q.h-Math.max(0.5,q.travelH||0)-0.3); s.weekday=CALENDAR.dateOf(q.day).wd%7; s.zone='dorm'; await GAME.applySave(s); })(" + json.dumps(q) + ")")
    await pg.wait_for_timeout(2500)
    log = []
    ok, log = await drive(pg, cdp, "(()=>{ const bs=[...document.querySelectorAll('#choices button')]; return bs.some(b=>/出發：/.test(b.textContent)); })()", 240, log, prefer=('不用了', '睡'))
    run.check(nm + '：那天早上問「出發：去' + city + '找' + nm + '」', ok, json.dumps(log[-6:], ensure_ascii=False))
    await run.shot(pg, who + '_depart')
    await chosen(pg, cdp, ['出發：'])
    log = []
    ok, log = await drive(pg, cdp, "(w=>{ const q=OUT.rec(GAME.G).find(q=>q.hv&&q.hv.id===w); return !!q&&q.state==='done'&&!GAME.D.active&&!GAME.E.player.busy; })(" + json.dumps(who) + ")", 600, log)
    st = await pg.evaluate("(w=>({money:GAME.G.money, n:(GAME.G.flags.HV_N||{})[w]||0, zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2), day:GAME.G.day}))(" + json.dumps(who) + ")")
    await run.shot(pg, who + '_back')
    run.check(nm + '：演完一整段、扣高鐵來回 ' + str(fare) + '、記一次、回到臺北', ok and st['money'] == 8000 - fare and st['n'] == 1, json.dumps(st, ensure_ascii=False) + ' ' + json.dumps(log[:4] + ['…'] + log[-6:], ensure_ascii=False))
    leak = [t for t in log if 'undefined' in t or '{name}' in t]
    run.check(nm + '：台詞沒有 undefined、沒有沒換掉的 {name}', not leak, json.dumps(leak[:3], ensure_ascii=False))
    return log


async def broke(pg, cdp, run):
    d = await pg.evaluate("STORY.dayOfKey('2026-07-10')")
    flags = dict(BASE); flags['dating_kexin'] = True
    social = {'rel': {'kexin': {'fam': 40, 'trust': 30, 'aff': 20, 'resp': 10, 'comf': 30, 'rom': 35, 'npcRom': 0, 'seen': 5, 'talked': 5}}, 'mem': {'kexin': [{'tag': 'FIRST_MET', 'day': -300, 'note': ''}]}, 'reveal': {}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}}
    run.setup('讀檔：同一天、錢只有 1000 元')
    await L.load_state(pg, {'zone': 'dorm', 'hour': 20.0, 'day': d, 'weekday': 5, 'weather': 'sunny', 'stage': 'law', 'money': 1000, 'flags': flags, 'social': social, 'contacts': {'kexin': 0, 'zhe': 0, 'kai': 0}, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}})
    await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button, #phone [data-tab]')].find(x=>/朋友/.test(x.textContent)); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    b = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-inv=\"kexin\"]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; })()")
    if b: await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent+((b.disabled||b.classList.contains('dim'))?'（灰）':''))")
    await run.shot(pg, 'broke_menu')
    run.check('錢不夠：「我去高雄找妳？」變灰、寫「高鐵票錢不夠」', any('我去高雄' in o and '高鐵票錢不夠' in o and '（灰）' in o for o in opts), json.dumps(opts, ensure_ascii=False))


async def main():
    run = L.Run('flow_vac_hometown', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        await one(pg, cdp, run, 'kexin', '高雄', 2980, True)
        await one(pg, cdp, run, 'classmate_peishan', '台中', 1400, False)
        await broke(pg, cdp, run)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
