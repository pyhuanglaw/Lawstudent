"""法律系的寒假（AA_197 1-1～1-3，16 週制；HOLIDAY-SYS）的瀏覽器流程：寒假（16 週制 12/22 起）裡的 2026-01-04 週日晚上在宿舍 → 走到床邊睡覺 →
1/5 早上在宿舍醒來（成績單、系統字「寒假宿舍照常開放。……」，**不回家**）→ 床的「快轉」→「過一週」（字卡寫「宿舍」）→
宿舍房間的「收拾背包回臺北的家」→ 住家裡（選單：快轉／睡覺／回宿舍住）→ 一路「快轉 → 到下一個有事的日子」：1/20 → 2/5 →（交往中：2/14）→ 2/16 除夕（主線 2 在家演）→ 2/17 → 2/22 12:00
→ 選「回宿舍住」→ 宿舍房間（沒有「明天開學。你回宿舍。」字卡）。全程沒有 JS 例外、黑幕不擋對話。
[前置／捷徑]：用遊戲自己的讀檔（GAME.applySave）把玩家放到 1/4 22:00 宿舍房間；之後都用觸控（走路、點床、點對話、點選項）；用 ?turbo。
用法：python3 tests/flow_law_break.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
import screencheck as SC   # 看畫面的自動檢查（使用者 2026-10-17 23:3x）
SCK = None   # main() 建立；drive() 每組新選項、每段對話開頭檢查一次

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_law_break'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'


async def pick(pg, cdp, prefer):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=bs.find(x=>w.some(s=>x.textContent.includes(s)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(prefer))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700)
    return c and c[2]


async def drive(pg, cdp, until_js, prefer, max_s=240):
    """點對話、照 prefer 點選項，直到 until_js 成立；回傳 (成功, 看過的選項)"""
    seen = []; was_dlg = False
    for _ in range(int(max_s * 2)):
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())&&!document.querySelector('#choices button')"):
            n = await L.phone_away(pg, cdp, tries=1)   # 快轉途中停在要回的訊息（AA_340 6-1 H2）：手機自己打開、右上角「跳過」→ 接著跳；在家的選單前也會自動打開一次
            if n: seen.append(['<手機：跳過>']); await pg.wait_for_timeout(500); continue
        if await pg.evaluate(until_js): return True, seen
        s = await L.state(pg)
        fade = await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()")
        if SCK and s['dlg'] and not was_dlg: await SCK.check(pg, '對話 ' + s['dtext'][:12])
        was_dlg = bool(s['dlg'])
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,24))")
            if SCK and (not seen or seen[-1] != opts): await SCK.check(pg, '選項 ' + '|'.join(opts)[:16])
            seen.append(opts); print('   選項', opts, flush=True)
            await pick(pg, cdp, prefer)
        elif s['dlg']:
            if fade: seen.append(['<黑幕下有對話>'])
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False, seen


async def main():
    global SCK
    run = L.Run('flow_law_break', OUT); SCK = SC.Checker(run, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        d4 = await pg.evaluate("STORY.dayOfKey('2026-01-04')")
        st = {'stage': 'law', 'zone': 'dorm', 'day': d4, 'weekday': 0, 'hour': 22, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14},
              'flags': {'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 1, 'introDone': True, 'classDone': True, 'metAn': True},
              'events': {'done': {}, 'last': {}, 'count': 0}}
        run.setup('讀檔到寒假裡的 2026-01-04（日）22:00 宿舍房間（16 週制寒假 12/22 起；還沒在寒假裡醒來過，第一次醒來要有系統字）')
        await L.load_state(pg, st)
        await pg.evaluate("(()=>{ if(window.__said) return; window.__said=[]; const o=GAME.say; GAME.say=function(w,t){ window.__said.push(String(t||'')); return o.apply(this,arguments); }; const c=GAME.titleCard; window.__cards=[]; GAME.titleCard=function(a,b){ window.__cards.push(String(a)+'｜'+String(b||'')); return c.apply(this,arguments); }; })()")
        await pg.evaluate("(()=>{ window.__toasts=[]; const t=GAME.toast; GAME.toast=function(x){ window.__toasts.push(String(x||'')); return t.apply(this,arguments); }; window.__warn=[]; const w=console.warn; console.warn=function(){ window.__warn.push([...arguments].map(String).join(' ').slice(0,200)); return w.apply(this,arguments); }; })()")
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
        s = await L.state(pg)
        run.check('走到床邊、出現「睡覺」', ok and s['interact'].startswith('睡覺'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        await pick(pg, cdp, ['睡到明天早上', '睡覺'])
        ok, seen = await drive(pg, cdp, "GAME.G.day===STORY.dayOfKey('2026-01-05')&&!!GAME.E.zone&&!!GAME.E.zone.def&&GAME.E.zone.def.id==='dorm'&&(HOME.rec(GAME.G).bnote==='Y1W'||(window.__toasts||[]).length>1)&&!document.querySelector('#choices button')&&!(document.getElementById('dlg')&&getComputedStyle(document.getElementById('dlg')).display!=='none'&&document.getElementById('dlg').offsetParent)", ['先看'], 240)   # G.day 在起床字卡之前就是 1/5：要等成績單演完、系統字出來（2026-10-17 批次 19、20 在字卡那 2 秒就判定醒來了）
        said = await pg.evaluate("window.__said||[]"); toasts = await pg.evaluate("window.__toasts||[]"); cards = await pg.evaluate("window.__cards||[]")
        diag = await pg.evaluate("({bnote:(HOME.rec(GAME.G)||{}).bnote||null, brk:HOME.lawBreak(GAME.G), at:HOME.at(GAME.G), warn:(window.__warn||[]).slice(-5)})")
        run.check('1/5 早上在宿舍醒來：成績單、系統字「寒假宿舍照常開放。要回家的話，從選單選『回家』。」；沒有「回臺北的家」字卡（不強制回家）', any('成績出來了' in t for t in said) and any('寒假宿舍照常開放' in t for t in toasts) and not any(c.startswith('回臺北的家') for c in cards) and not await pg.evaluate("HOME.at(GAME.G)"), json.dumps([said[-4:], toasts[-3:], cards[-2:], diag], ensure_ascii=False))
        await run.shot(pg, 'dorm_0105')
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
        run.check('寒假的床：有「快轉」', any(o.startswith('快轉') for o in opts), json.dumps(opts, ensure_ascii=False))
        d0 = await pg.evaluate("GAME.G.day")
        await pick(pg, cdp, ['快轉']); await pick(pg, cdp, ['過一週'])
        ok, seen = await drive(pg, cdp, "GAME.G.day>%d&&!document.querySelector('#choices button')" % d0, ['先看'], 120)
        cards = await pg.evaluate("window.__cards||[]")
        run.check('過一週：字卡寫「宿舍」（中間有事會先停）', any(c.endswith('宿舍') for c in cards), json.dumps(cards[-3:], ensure_ascii=False))
        home = await L.find_it(pg, '收拾背包回臺北的家')   # 宿舍房間的那一個（校園的叫「回臺北的家」）
        ok = bool(home) and await L.go_to(pg, cdp, run, home['x'], home['z'], home['r'] * 0.7, '回家')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        ok, seen = await drive(pg, cdp, "HOME.at(GAME.G)&&GAME.G.home.lbreak==='Y1W'&&!!document.querySelector('#choices button')", ['先看'], 120)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
        run.check('放假中回家＝住家裡：選單有「快轉」「睡覺」「回宿舍住」，沒有「過幾天」', ok and any(o.startswith('快轉') for o in opts) and any(o.startswith('睡覺') for o in opts) and any(o.startswith('回宿舍住') for o in opts) and not any(o.startswith('過幾天') for o in opts), json.dumps(opts, ensure_ascii=False))
        await run.shot(pg, 'home_menu')
        ok, seen = await drive(pg, cdp, "HOME.at(GAME.G)&&GAME.G.day===STORY.dayOfKey('2026-02-22')&&!![...document.querySelectorAll('#choices button')].some(b=>b.textContent.startsWith('回宿舍住'))&&![...document.querySelectorAll('#choices button')].some(b=>b.textContent.startsWith('快轉'))", ['快轉', '到下一個有事的日子', '先看'], 900)
        cards = await pg.evaluate("window.__cards||[]")
        dates = [c.split('｜')[0] for c in cards if c.endswith('臺北的家')]
        dating = await pg.evaluate("!!GAME.G.flags.dating_kexin")
        exp = ['1/20（二）18:30', '2/5（四）18:30'] + (['2/14（六）19:45'] if dating else []) + ['2/16（一）12:00', '2/17（二）11:00', '2/22（日）12:00']
        run.check('一路「快轉 → 到下一個有事的日子」：字卡 1/20 → 2/5 →（交往中 2/14）→ 2/16 → 2/17 → 2/22 12:00（臺北的家）', ok and dates[-len(exp):] == exp, json.dumps(dates, ensure_ascii=False))
        run.check('除夕在家演主線 2（FAMILY_LAND_Y1 有值）', await pg.evaluate("!!GAME.G.flags.FAMILY_LAND_Y1"))
        await pick(pg, cdp, ['回宿舍住'])
        ok, seen2 = await drive(pg, cdp, "!HOME.at(GAME.G)&&GAME.G.zone==='dorm'", ['先看'], 120)
        said = await pg.evaluate("window.__said||[]"); g = await pg.evaluate("({day:GAME.G.day,zone:GAME.G.zone,lb:GAME.G.home.lbreak||null})")
        run.check('選「回宿舍住」→ 宿舍房間；沒有「明天開學。你回宿舍。」字卡', ok and g['zone'] == 'dorm' and not g['lb'] and '明天開學。你回宿舍。' not in said, json.dumps([g, said[-3:]], ensure_ascii=False))
        run.check('黑幕沒有擋住對話', not any(x == ['<黑幕下有對話>'] for x in seen + seen2))
        await run.shot(pg, 'dorm_0222')
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        SCK.finish()
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
