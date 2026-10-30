"""交換的最小可玩流程（使用者 2026-10-17 21:3x，D99 第三優先）的瀏覽器流程：
A. 大三上第 3 週在宿舍房間 → 走到「交換申請（志願表）」→ 選「美國（印第安納）」→ EXCHANGE_ROUTE＝US。
B. [前置／捷徑] 讀檔到 2028-08-02（出發日）05:50 校園 → 06:00 自己演出發（字卡）→ 桃園機場出境大廳 → 走到「登機：飛往美國」→ 字卡（飛行、抵達）→ 公寓社區
   → 走到「回公寓」→ 公寓 → 走到床「睡覺」→ 睡到隔天早上，在美國的公寓醒來 → 走到「出門」→ 社區。
   手機「地點」只有公寓和社區；在美國沒有台灣的課。全程沒有 JS 例外。
[前置／捷徑]：用遊戲自己的讀檔（GAME.applySave）放到 A、B 的開頭；之後都用觸控（走路、點互動、點對話、點選項）；用 ?turbo。
用法：python3 tests/flow_exch_min.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
import screencheck as SC   # 看畫面的自動檢查（使用者 2026-10-17 23:3x）
SCK = None   # main() 建立；drive() 每組新選項、每段對話開頭檢查一次

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_exch_min'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'
BASE_FLAGS = {'KX_FIRST_MSG': True, 'fundsV2': 1, 'introDone': True, 'classDone': True, 'metAn': True, 'ROOM_Y2': True, 'ROOM_Y2_ITEMS': True}


async def pick(pg, cdp, prefer):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=bs.find(x=>w.some(s=>x.textContent.includes(s)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(prefer))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700)
    return c and c[2]


async def drive(pg, cdp, until_js, prefer, max_s=240):
    """點對話、照 prefer 點選項，直到 until_js 成立；手機、筆記本蓋住選項時先關掉。回傳 (成功, 看過的選項)"""
    seen = []; was_dlg = False
    for _ in range(int(max_s * 2)):
        if await pg.evaluate(until_js): return True, seen
        s = await L.state(pg)
        if s['choices'] and s.get('paused') and await L.close_panels(pg, cdp): continue
        if SCK and s['dlg'] and not was_dlg: await SCK.check(pg, '對話 ' + s['dtext'][:12])
        was_dlg = bool(s['dlg'])
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,24))")
            if SCK and (not seen or seen[-1] != opts): await SCK.check(pg, '選項 ' + '|'.join(opts)[:16])
            seen.append(opts); print('   選項', opts, flush=True)
            await pick(pg, cdp, prefer)
        elif s['dlg']:
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False, seen


async def walk_use(pg, cdp, run, label, wait_s=20):
    """等互動點出現 → 走過去 → 點互動鍵。回傳有沒有點到"""
    it = None
    for _ in range(wait_s * 2):
        it = await L.find_it(pg, label)
        if it: break
        await pg.wait_for_timeout(500)
    if not it:
        run.check('找到互動點「%s」' % label, False, json.dumps(await pg.evaluate("GAME.E.interactables.map(i=>i.label)"), ensure_ascii=False)); return False
    ok = await L.go_to(pg, cdp, run, it['x'], it['z'], max(0.5, it['r'] * 0.7), label)
    s = await L.state(pg)
    for _ in range(12):   # 互動鍵在下一幀才更新：到了以後等一下再判（v4 一到就判，按鈕還沒出來）
        if (s['interact'] or '').startswith(label): break
        await pg.wait_for_timeout(500); s = await L.state(pg)
    ok = ok and (s['interact'] or '').startswith(label)
    run.check('走到「%s」、互動鍵出現' % label, ok, json.dumps({k: s[k] for k in ('zone', 'x', 'z', 'interact')}, ensure_ascii=False))
    if ok and SCK: await SCK.check(pg, '走到「%s」' % label)
    if ok: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    return ok


ZONE = "(GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id)"


async def main():
    global SCK
    run = L.Run('flow_exch_min', OUT); SCK = SC.Checker(run, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：申請 ----------
        dA = await pg.evaluate("STORY.termDay('Y3S1',3,2)")
        run.setup('讀檔到大三上第 3 週週二 15:00 宿舍房間（法律系、大二起的房間）')
        await L.load_state(pg, {'stage': 'law', 'zone': 'dorm', 'day': dA, 'weekday': 2, 'hour': 15, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14}, 'flags': dict(BASE_FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}})
        await pg.wait_for_timeout(2500)
        # 讀檔後可能先演劇情（EXCH.tick 要等玩家不忙才放志願表）：先把對話演完、等互動點出現再走
        await drive(pg, cdp, "!GAME.D.active&&!(GAME.E.player&&GAME.E.player.busy)&&!document.querySelector('#choices button')&&GAME.E.interactables.some(i=>(i.label||'').startsWith('交換申請'))", ['好'], 60)
        if await walk_use(pg, cdp, run, '交換申請'):
            await pick(pg, cdp, ['美國'])
            ok, _ = await drive(pg, cdp, "GAME.G.flags.EXCHANGE_ROUTE==='US'&&!document.querySelector('#choices button')", ['美國'], 30)
            run.check('A. 志願表選「美國（印第安納）」：EXCHANGE_ROUTE＝US', ok, json.dumps(await pg.evaluate("GAME.G.flags.EXCHANGE_ROUTE")))
        await run.shot(pg, 'a_applied')
        # ---------- B：出發 → 抵達 → 公寓 → 睡覺 → 隔天 → 出門 ----------
        dep = await pg.evaluate("STORY.dayOfKey('2028-08-02')")
        wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % dep)
        fl = dict(BASE_FLAGS); fl['EXCHANGE_ROUTE'] = 'US'
        run.setup('讀檔到 2028-08-02（美國路線出發日）05:50 校園（椰影大道），已經選了美國')
        await L.load_state(pg, {'stage': 'law', 'zone': 'campus', 'day': dep, 'weekday': wd, 'hour': 5.83, 'pos': {'x': -20, 'z': -12, 'yaw': 0}, 'flags': fl, 'events': {'done': {}, 'last': {}, 'count': 0}})
        ok, _ = await drive(pg, cdp, ZONE + "==='airport_dep'&&!GAME.D.active&&!document.querySelector('#choices button')", ['好'], 120)
        h = await pg.evaluate("GAME.G.hour")
        run.check('B. 06:00 以後自己出發：字卡 → 桃園機場出境大廳（US_DEPARTED）', ok and await pg.evaluate("GAME.G.flags.US_DEPARTED===true"), json.dumps({'h': h}))
        await run.shot(pg, 'b_airport')
        if await walk_use(pg, cdp, run, '登機'):
            ok, _ = await drive(pg, cdp, ZONE + "==='us_outside'&&!GAME.D.active", ['好'], 120)
            info = await pg.evaluate("({h:GAME.G.hour,day:GAME.G.day,arr:GAME.G.flags.US_ARRIVED})")
            run.check('B. 登機：字卡（飛行、抵達）→ 公寓社區、US_ARRIVED、同一天傍晚', ok and info['arr'] is True and info['day'] == dep, json.dumps(info))
        await run.shot(pg, 'b_outside')
        places = await pg.evaluate("(()=>{ try{ return EXCH.places().map(p=>p[1]); }catch(e){ return String(e); } })()")
        cls = await pg.evaluate("CLS.dayItems(GAME.G,GAME.G.day).length")
        run.check('B. 在美國：手機地點只有公寓和社區、沒有台灣的課', places == ['公寓', '公寓社區'] and cls == 0, json.dumps({'places': places, 'cls': cls}, ensure_ascii=False))
        if await walk_use(pg, cdp, run, '回公寓'):
            ok, _ = await drive(pg, cdp, ZONE + "==='us_apartment'&&!GAME.D.active", ['好'], 60)
            run.check('B. 回公寓：進到公寓', ok)
        await run.shot(pg, 'b_apartment')
        d0 = await pg.evaluate("GAME.G.day")
        # 抵達約 17:06；床的「睡到明天早上」18:00 以後才有，之前先「睡到傍晚」再睡一次（真實玩家也會這樣）
        ok = False
        for _ in range(2):
            if not await walk_use(pg, cdp, run, '睡覺'): break
            got = await pick(pg, cdp, ['睡到明天早上', '睡到傍晚'])
            print('   床：選了', got, flush=True)
            done_js = "(GAME.G.day===%d&&%s==='us_apartment'&&!GAME.D.active&&!document.querySelector('#choices button'))" % (d0 + 1, ZONE)
            idle_js = "(GAME.G.hour>=18&&!GAME.D.active&&!document.querySelector('#choices button')&&!(GAME.E.player&&GAME.E.player.busy))"
            await pg.wait_for_timeout(1500)
            ok, seen = await drive(pg, cdp, done_js + '||(GAME.G.day===%d&&' % d0 + idle_js + ')', ['睡到明天早上', '先起床', '好'], 120)
            # 醒來那一刻可能接著跳成績通知等對話：日子和地點對了就算醒來（對話留給後面的步驟點掉）
            if await pg.evaluate("GAME.G.day===%d&&%s==='us_apartment'" % (d0 + 1, ZONE)):
                await drive(pg, cdp, done_js, ['好'], 60); ok = True; break
            ok = False
        info = await pg.evaluate("({day:GAME.G.day,h:GAME.G.hour,z:%s})" % ZONE)
        run.check('B. 睡覺：隔天早上在美國的公寓醒來（不是台灣的宿舍）', ok, json.dumps(info, ensure_ascii=False))
        await run.shot(pg, 'b_next_morning')
        if await walk_use(pg, cdp, run, '出門'):
            ok, _ = await drive(pg, cdp, ZONE + "==='us_outside'&&!GAME.D.active", ['好'], 60)
            run.check('B. 隔天出門：公寓社區', ok)
        await run.shot(pg, 'b_out_again')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        SCK.finish()
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
