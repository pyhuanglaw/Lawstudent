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
        if os.environ.get('EV'):   # r2（BB 16:04）：條件同 ggnav——事件開著、從公館按「進入公館燒臘」走進去
            R.setup('【前置／捷徑】讀檔到 gongguan 麵店門口前 (−63, 18) 2025-10-18 12:30，條件事件開著（quiet_events False、只關手機自己打開）')
            d = await pg.evaluate("STORY.dayOfKey('2025-10-18')")
            await L.load_state(pg, {'zone': 'gongguan', 'hour': 12.5, 'day': d, 'weather': 'clear', 'pos': {'x': -63, 'z': 18, 'yaw': 0, 'lv': 0}}, quiet_events=False, quiet_phone=True)
            await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
            for _ in range(20):
                s_ = await L.state(pg)
                if s_['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                break
            ent = next((i for i in await pg.evaluate(ITS) if i['to'] == 'noodle'), None)
            if not R.check('公館有「進入公館燒臘」', bool(ent), ''): await b.close(); return
            await L.go_to(pg, cdp, R, ent['x'], ent['z'], 0.8, '走到「進入公館燒臘」', max_s=120); await pg.wait_for_timeout(700)
            await L.tap(pg, cdp, '#interact')
            for _ in range(40):
                await pg.wait_for_timeout(500)
                if (await pg.evaluate(UI))['zone'] == 'noodle': break
            await pg.wait_for_timeout(2000)
        else:
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
        TR = r"""(()=>{ const ib=document.getElementById('interact'), dl=document.getElementById('dlg'), c=document.getElementById('caption');
          return {t:+(performance.now()/1000).toFixed(1), zone:GAME.G.zone, busy:!!GAME.E.player.busy, dlg:!!(dl&&!dl.classList.contains('hide')&&dl.offsetParent!==null), dtext:dl?(dl.innerText||'').trim().slice(0,40):'',
            cap:c&&!c.classList.contains('hide')?(c.innerText||'').trim().slice(0,60):'', btn:ib&&ib.offsetParent!==null?(ib.innerText||'').trim():'', ev:typeof EVENTS!=='undefined'&&!!EVENTS.running}; })()"""
        trace = [await pg.evaluate(TR)]
        await L.tap(pg, cdp, '#interact')
        for _ in range(150):   # r2：每 200 ms 記一次（對話框、字幕、busy、按鈕），到回到公館或 30 秒
            await pg.wait_for_timeout(200); q = await pg.evaluate(TR); trace.append(q)
            if q['zone'] != 'noodle': break
        R.note('按出口前後每 200 ms：%s' % J(trace)); json.dump(trace, open(os.path.join(OUT, 'noodle_exit_trace.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        u = await pg.evaluate(UI)
        await pg.wait_for_timeout(3000); u = await pg.evaluate(UI)
        await pg.screenshot(path=os.path.join(OUT, 'noodle_back_gongguan.png'))
        R.check('按下去回到公館、站得住、沒有卡住保險', u['zone'] == 'gongguan' and u['stand'] is not False and u['fb'] == 0, J(u))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
