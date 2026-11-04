"""CC（帳號 A）11-04：麵店（公館燒臘，noodle 區域）出得去嗎（LAWWW 04:33：GG_ext_nav2「離開麵店回到公館」FAIL，測試把人瞬移到 (0,3.9) 站不住的格子）。
  A 【前置／捷徑】讀檔：noodle 出生點 (0,3.5) 15:00（條件事件關閉）→ 不移動，看互動按鈕 → 按 #interact → 記按鈕字、按下後 E.player.busy、console 錯誤、zone 有沒有變（等 30 秒）。
  B 真實流程：【前置／捷徑】讀檔：公館麵店門口南邊 → 走到「進入…」按門進麵店 → 走到「離開…」互動點 → 按 → 回到公館、站得住、搖桿推得動。
  FAIL＝出不去（zone 一直是 noodle）或 JS 例外或卡住。
用法：LW_TESTS=<wt>/tests [CASES=A,B] python3 cc_noodle_exit_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'A,B').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
FAILS = []; CONSOLE = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


class Run:
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, P=GAME.E.player, p=P.obj.position, nv=GAME.E.nav; const b=document.getElementById('interact');
  return {zone:G.zone, x:+p.x.toFixed(2), z:+p.z.toFixed(2), busy:!!P.busy, stand:nv?!!nv.free(p.x,p.z):null,
    interact:b&&!b.classList.contains('hide')?(b.textContent||'').trim():null, dlg:!!(GAME.D&&GAME.D.active), depth:(GAME.D&&GAME.D.busyDepth)||0}; })()"""


async def press_and_watch(pg, cdp, tag):
    s0 = await pg.evaluate(ST); n0 = len(CONSOLE)
    print('  %s 按之前：%s' % (tag, J(s0)), flush=True)
    await pg.screenshot(path=os.path.join(OUT, '%s_before.png' % tag))
    await L.tap(pg, cdp, '#interact')
    seen = []; t0 = time.time()
    while time.time() - t0 < 30:
        await pg.wait_for_timeout(500); s = await pg.evaluate(ST); seen.append((round(time.time() - t0, 1), s['zone'], s['busy']))
        if s['zone'] != s0['zone'] and not s['busy']: break
    s = await pg.evaluate(ST)
    await pg.screenshot(path=os.path.join(OUT, '%s_after.png' % tag))
    print('  %s 按之後 30 秒內（秒, zone, busy）：%s' % (tag, J(seen[:12])), flush=True)
    print('  %s console（按下以後）：%s' % (tag, J(CONSOLE[n0:n0 + 10])), flush=True)
    return s0, s


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('console', lambda m: CONSOLE.append(('%s %s' % (m.type, m.text))[:300]) if m.type in ('error', 'warning') else None)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        base = {'hour': 15.0, 'day': 8, 'weekday': 2, 'weather': 'clear', 'flags': FLAGS}
        if 'A' in CASES:
            print('== A 出生點 (0,3.5) 直接按', flush=True)
            print('  [前置／捷徑] 讀檔：noodle (0,3.5) 15:00、條件事件關閉', flush=True)
            await L.load_state(pg, dict(base, zone='noodle', pos={'x': 0, 'z': 3.5, 'yaw': 0}), quiet_events=True); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
            s0, s = await press_and_watch(pg, cdp, 'A')
            check('A 出生點站得住', bool(s0['stand']), J(s0))
            check('A 互動按鈕是「離開…」', (s0['interact'] or '').startswith('離開'), J(s0['interact']))
            check('A 按下去以後回到公館（zone 改變）', s['zone'] == 'gongguan', J(s))
            check('A 回到公館站得住、不 busy', s['zone'] == 'gongguan' and bool(s['stand']) and not s['busy'], J(s))
        if 'B' in CASES:
            print('== B 真實流程：公館走進麵店、走到出口按「離開」', flush=True)
            print('  [前置／捷徑] 讀檔：公館人行道 (−63,15) 15:00、條件事件關閉', flush=True)
            await L.load_state(pg, dict(base, zone='gongguan', pos={'x': -63, 'z': 15, 'yaw': 0}), quiet_events=True); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
            its = await pg.evaluate("GAME.E.interactables.filter(i=>/^進入/.test(i.label||'')&&i.exit&&i.exit.to==='noodle').map(i=>({x:i.x,z:i.z,r:i.radius,label:i.label}))")
            print('  往麵店的門：%s' % J(its), flush=True)
            if not check('B 有往 noodle 的門', bool(its), J(its)):
                await b.close(); print('FAILED'); sys.exit(1)
            d = its[0]
            check('B 走到門口', await L.go_to(pg, cdp, Run(), d['x'], d['z'], d['r'] * 0.7, d['label']))
            await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
            for _ in range(60):
                await pg.wait_for_timeout(500)
                s = await pg.evaluate(ST)
                if s['zone'] == 'noodle' and not s['busy']: break
            s = await pg.evaluate(ST)
            check('B 進到麵店', s['zone'] == 'noodle', J(s))
            ex = await pg.evaluate("GAME.E.interactables.filter(i=>/^離開/.test(i.label||'')).map(i=>({x:i.x,z:i.z,r:i.radius,label:i.label}))")
            print('  麵店出口：%s' % J(ex), flush=True)
            if check('B 麵店有「離開…」互動點', bool(ex), J(ex)):
                e = ex[0]
                check('B 走到出口旁', await L.go_to(pg, cdp, Run(), e['x'], e['z'] - 0.6, 0.5, e['label']))
                await pg.wait_for_timeout(800)
                s0, s = await press_and_watch(pg, cdp, 'B')
                check('B 互動按鈕是「離開…」', (s0['interact'] or '').startswith('離開'), J(s0['interact']))
                check('B 按下去以後回到公館', s['zone'] == 'gongguan', J(s))
                if s['zone'] == 'gongguan':
                    s1 = await pg.evaluate(ST)
                    await L.push_until(pg, cdp, 0, -40, 0.3)
                    s2 = await pg.evaluate(ST)
                    mv = ((s2['x'] - s1['x']) ** 2 + (s2['z'] - s1['z']) ** 2) ** 0.5
                    check('B 回到公館站得住、搖桿推得動（≥0.3 m）', bool(s1['stand']) and mv >= 0.3, J({'before': s1, 'after': s2, 'moved': round(mv, 2)}))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
