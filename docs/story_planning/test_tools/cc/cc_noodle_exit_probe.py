"""CC（帳號 A）11-10：公館燒臘出得去嗎（BB 14:47；gongguan_layout_nav 在 noodle (0, 3.5) 量到 hidden 的「進入公館燒臘」、reach false）。
真的走：【前置／捷徑】讀檔到 noodle（區域出生點，2025-10-18 12:30 營業中）→ 列 noodle 所有互動點 → 找 exit.to＝gongguan 的出口 → 點地面走過去 → 按鈕要是那個出口的字 → 按 → 回到公館、記站在哪、站得住。
出得去＝測試座標過期；出不去＝P1 GAME_BUG。Playwright 手機模擬 ≠ iPhone。用法：LW_TESTS=<wt>/tests python3 cc_noodle_exit_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
R = L.Run('noodle_exit', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ITS = "(()=>(GAME.E.interactables||[]).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,lv:i.lv|0,hidden:!!i.hidden,to:i.exit?i.exit.to:null})))()"
UI = """(()=>{ const ib=document.getElementById('interact'); const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none');
  const P=GAME.E.player.obj.position; return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), fb:GAME.walkFallbacks|0, busy:!!GAME.E.player.busy, interact:vis(ib)?(ib.innerText||'').trim():'', stand:GAME.E.canStand?GAME.E.canStand(P.x,P.z,0.33,GAME.E.player.lv|0):null}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 公館燒臘出口：worktree %s；Playwright ≠ iPhone' % (real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 noodle 出生點 2025-10-18 12:30')
        await D.load_zone(pg, cdp, 'noodle', '2025-10-18', 12.5, wait=9000)
        u = await pg.evaluate(UI); its = await pg.evaluate(ITS)
        R.note('出生：%s' % J(u)); R.note('noodle 的互動點：%s' % J(its))
        await pg.screenshot(path=os.path.join(OUT, 'noodle_spawn.png'))
        ex = [i for i in its if i['to'] == 'gongguan' and not i['hidden']]
        if not R.check('公館燒臘有看得到的出口（exit.to＝gongguan、沒有 hidden）', bool(ex), J(its)): await b.close(); print('FAILED', flush=True); return
        e = ex[0]
        ok = await L.go_to(pg, cdp, R, e['x'], e['z'], min(0.9, e['r'] * 0.8), '走到「%s」(%s, %s)' % (e['label'], e['x'], e['z']), max_s=120, lv=e['lv'])
        for _ in range(8):
            u = await pg.evaluate(UI)
            if u['interact']: break
            await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, 'noodle_at_exit.png'))
        R.check('走到出口、按鈕是「%s」' % e['label'], bool(ok) and e['label'] in u['interact'], J(u))
        await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            await pg.wait_for_timeout(500); u = await pg.evaluate(UI)
            if u['zone'] != 'noodle': break
        await pg.wait_for_timeout(3000); u = await pg.evaluate(UI)
        await pg.screenshot(path=os.path.join(OUT, 'noodle_back_gongguan.png'))
        R.check('按下去回到公館、站得住、沒有卡住保險', u['zone'] == 'gongguan' and u['stand'] is not False and u['fb'] == 0, J(u))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
