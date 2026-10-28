"""BB-C 10-28：霖澤館前的幀率對照（v9.10.12 p0 記錄版：事件中 1.3 fps、點地面比 f54 慢；LAWWW-C 要發布後拿 v9.10.11 和新版同一點比）。
【前置】最小存檔：法律系大一 2025-09-24（三）13:26、校園霖澤館前 (33.84,-84)，關掉條件事件、關掉要回覆訊息自動開手機；等 15 秒讓模型載完。
量兩段（各 20 秒真實時間）：① 站著不動 ② 搖桿往前推（走路）；記 E.frame 的差（＝格數）、renderer.info.render.calls、三角形數、看得到的 NPC。
SwiftShader（軟體算圖）：數字只能兩版互相比，不代表手機實機。用法：LW_TESTS=<工作樹>/tests python3 fps_compare.py '<URL>/index.html' <輸出資料夾> <標籤>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
SNAP = "(()=>{ const E=GAME.E, R=E.renderer&&E.renderer.info; return {frame:E.frame|0, calls:R?R.render.calls:-1, tris:R?R.render.triangles:-1, vis:E.npcs.filter(n=>n.obj.visible).length, npcs:E.npcs.length, x:+E.player.obj.position.x.toFixed(2), z:+E.player.obj.position.z.toFixed(2), q:E.q&&E.q.level}; })()"
async def main():
    run = L.Run('fps_' + TAG, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        dk = await pg.evaluate("({d:STORY.dayOfKey('2025-09-24'), law0:STORY.dayOfKey('2025-08-29'), m1:(STORY.MAIN_D1_NEW!=null?STORY.MAIN_D1_NEW:STORY.dayOfKey('2025-09-03'))})")
        F = {'LAW_START_DAY': dk['law0'], 'MAIN_D1': dk['m1'], 'met_zhe': True, 'met_an': True, 'campusIntro': True}
        st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk['d'], 'hour': 13.43, 'energy': 100, 'money': 22000, 'zone': 'campus', 'pos': {'x': 33.84, 'z': -84.0, 'yaw': 0, 'lv': 0, 'y': 0}, 'weather': 'clear', 'flags': F, 'events': {'done': {}, 'last': {}, 'count': 0}}
        st['weekday'] = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % dk['d'])
        await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
        run.setup('[前置] 最小存檔 2025-09-24 13:26 霖澤館前 (33.84,-84)；關掉條件事件、要回覆訊息自動開手機；畫質照預設')
        await pg.wait_for_timeout(15000)
        res = {}
        for name, joy in (('站著', None), ('走路', (0, -40))):
            a = await pg.evaluate(SNAP); t0 = time.time()
            if joy:
                await L.joystick(pg, cdp, joy[0], joy[1], 20000)
            else:
                await pg.wait_for_timeout(20000)
            b2 = await pg.evaluate(SNAP); dt = time.time() - t0
            res[name] = {'fps': round((b2['frame'] - a['frame']) / dt, 2), 'calls': b2['calls'], 'tris': b2['tris'], 'vis': b2['vis'], 'npcs': b2['npcs'], 'from': [a['x'], a['z']], 'to': [b2['x'], b2['z']], 'q': b2['q']}
            run.note('%s：%s' % (name, json.dumps(res[name], ensure_ascii=False)))
        await run.shot(pg, 'linze_front')
        json.dump(res, open(os.path.join(OUT, 'fps_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        run.check('量到兩段', all(res[k]['fps'] >= 0 for k in res))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
