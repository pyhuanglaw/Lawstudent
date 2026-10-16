"""法律系的寒假：在家模式（AA_183，SYS-LBREAK）的瀏覽器流程：大一上最後一天（2026-01-04 週日）晚上在宿舍 → 走到床邊睡覺 →
1/5 早上起床（成績單）→ 旁白「宿舍的房間留著。……」→ 字卡「回臺北的家」→ 家裡的選單（過幾天、睡覺，沒有回宿舍）→ 一路「過幾天」：
1/20 → 2/5 →（交往中：2/14 可昕的情人節視訊）→ 2/16 除夕（主線 2 在家演）→ 2/17 → 2/22 17:00「明天開學。你回宿舍。」→ 宿舍房間。全程沒有 JS 例外、黑幕不擋對話。
[前置／捷徑]：用遊戲自己的讀檔（GAME.applySave）把玩家放到 1/4 22:00 宿舍房間；之後都用觸控（走路、點床、點對話、點選項）；用 ?turbo。
用法：python3 tests/flow_law_break.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_law_break'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'


async def pick(pg, cdp, prefer):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=bs.find(x=>w.some(s=>x.textContent.includes(s)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(prefer))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700)
    return c and c[2]


async def drive(pg, cdp, until_js, prefer, max_s=240):
    """點對話、照 prefer 點選項，直到 until_js 成立；回傳 (成功, 看過的選項)"""
    seen = []
    for _ in range(int(max_s * 2)):
        if await pg.evaluate(until_js): return True, seen
        s = await L.state(pg)
        fade = await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()")
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,24))")
            seen.append(opts); print('   選項', opts, flush=True)
            await pick(pg, cdp, prefer)
        elif s['dlg']:
            if fade: seen.append(['<黑幕下有對話>'])
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False, seen


async def main():
    run = L.Run('flow_law_break', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        d4 = await pg.evaluate("STORY.dayOfKey('2026-01-04')")
        st = {'stage': 'law', 'zone': 'dorm', 'day': d4, 'weekday': 0, 'hour': 22, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14},
              'flags': {'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 1, 'introDone': True, 'classDone': True, 'metAn': True},
              'events': {'done': {}, 'last': {}, 'count': 0}}
        run.setup('讀檔到大一上最後一天（2026-01-04 週日）22:00 宿舍房間')
        await L.load_state(pg, st)
        await pg.evaluate("(()=>{ if(window.__said) return; window.__said=[]; const o=GAME.say; GAME.say=function(w,t){ window.__said.push(String(t||'')); return o.apply(this,arguments); }; const c=GAME.titleCard; window.__cards=[]; GAME.titleCard=function(a,b){ window.__cards.push(String(a)+'｜'+String(b||'')); return c.apply(this,arguments); }; })()")
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
        s = await L.state(pg)
        run.check('走到床邊、出現「睡覺」', ok and s['interact'].startswith('睡覺'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        await pick(pg, cdp, ['睡到明天早上', '睡覺'])
        ok, seen = await drive(pg, cdp, "HOME.at(GAME.G)&&GAME.G.home.lbreak==='Y1W'&&!!document.querySelector('#choices button')", ['先看', '過幾天'], 300)
        said = await pg.evaluate("window.__said||[]"); cards = await pg.evaluate("window.__cards||[]")
        run.check('1/5 早上：成績單 → 旁白「宿舍的房間留著。你帶了一袋換洗衣服回家。」→ 字卡「回臺北的家」→ 在家（放假模式）', ok and any('成績出來了' in t for t in said) and '宿舍的房間留著。你帶了一袋換洗衣服回家。' in said and any(c.startswith('回臺北的家') for c in cards), json.dumps([said[-6:], cards[-3:]], ensure_ascii=False))
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
        run.check('家裡的選單：有「過幾天」「睡覺」，沒有「回宿舍」「去學校」', any(o.startswith('過幾天') for o in opts) and any(o.startswith('睡覺') for o in opts) and not any(('回宿舍' in o or '去學校' in o) for o in opts), json.dumps(opts, ensure_ascii=False))
        await run.shot(pg, 'home_0105')
        ok, seen = await drive(pg, cdp, "!HOME.at(GAME.G)&&GAME.G.zone==='dorm'&&GAME.G.day===STORY.dayOfKey('2026-02-22')", ['過幾天'], 900)
        said = await pg.evaluate("window.__said||[]"); cards = await pg.evaluate("window.__cards||[]")
        dates = [c.split('｜')[0] for c in cards if c.endswith('臺北的家')]
        dating = await pg.evaluate("!!GAME.G.flags.dating_kexin")
        exp = ['1/20（二）18:30', '2/5（四）18:30'] + (['2/14（六）19:45'] if dating else []) + ['2/16（一）12:00', '2/17（二）11:00', '2/22（日）17:00']   # 交往中：2/14 20:00 可昕的情人節視訊是要停的日子（AA_183：出遊變成停點；出遊系統提前 15 分鐘）
        run.check('一路「過幾天」：字卡 1/20 → 2/5 →（交往中 2/14 情人節視訊）→ 2/16 → 2/17 → 2/22（臺北的家）', dates[-len(exp):] == exp, json.dumps(dates, ensure_ascii=False))
        run.check('除夕在家演主線 2（FAMILY_LAND_Y1 有值）', await pg.evaluate("!!GAME.G.flags.FAMILY_LAND_Y1"))
        g = await pg.evaluate("({day:GAME.G.day,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,lb:GAME.G.home.lbreak||null})")
        run.check('2/22：「明天開學。你回宿舍。」→ 字卡「回宿舍」→ 宿舍房間、放假模式結束', ok and '明天開學。你回宿舍。' in said and any(c.startswith('回宿舍') for c in cards) and g['zone'] == 'dorm' and g['h'] >= 17.6 and not g['lb'], json.dumps([g, said[-3:], cards[-2:]], ensure_ascii=False))
        run.check('黑幕沒有擋住對話', not any(x == ['<黑幕下有對話>'] for x in seen))
        await run.shot(pg, 'dorm_0222')
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
