"""CC-B 11-08：一盞（wz_teahouse）21:00 進得去嗎（f440 讀檔兩次沒正常進店）。【前置】讀檔溫州街 2025-10-18 HOUR 點、站在一盞門口；照玩家按「進去一盞」→ 看 G.zone、E.zone 網格數、有沒有 GLB、光照貼圖。
用法：LW_TESTS=<wt>/tests [HOURS=21,14] python3 cc_yizhan_night_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS')); sys.path.insert(0, HERE)
import playlib as L, cc_det, cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; J = D.J
R = L.Run('yizhan_night', OUT); D.setup(R, OUT)
INFO = "(()=>{ const z=GAME.E.zone; let m=0, lm=0; z.group.traverse(o=>{ if(o.isMesh){ m++; for(const q of [].concat(o.material)) if(q&&q.lightMap) lm++; } }); return {G:GAME.G.zone, E:z.id||z.name||null, meshes:m, lm, glb:z.formal||null, hour:+(+GAME.G.hour).toFixed(2), interact:(()=>{ const b=document.querySelector('#interact'); return b&&!b.classList.contains('hide')?b.innerText:null; })()}; })()"
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261108); await pg.goto(URL)
        if R.check('遊戲載入', await L.wait_loaded(pg), ''):
            await pg.evaluate("localStorage.clear()")
            for h in [float(x) for x in (os.environ.get('HOURS') or '21,14').split(',')]:
                tag = '[%02d:00]' % h
                for k in range(3):
                    R.setup('%s 第 %d 次【前置】讀檔溫州街 %.1f、站在一盞門口 (-20.5,4.1)' % (tag, k + 1, h))
                    await D.load_zone(pg, cdp, 'wenzhou', '2025-10-18', h, x=-20.5, z=4.1, yaw=0, wait=8000)
                    i0 = await pg.evaluate(INFO); R.note('%s 門口：%s' % (tag, J(i0)))
                    lab = await pg.evaluate("GAME.E.focus&&GAME.E.focus.label||null")
                    R.note('%s 互動：%s' % (tag, lab))
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(12000)
                    i1 = await pg.evaluate(INFO); R.note('%s 按進去 12 秒後：%s' % (tag, J(i1)))
                    await R.shot(pg, 'yz_%02d_%d' % (h, k + 1))
                    R.check('%s 第 %d 次：進到一盞（G.zone＝wz_teahouse 而且場景是店內：有 GLB、網格 < 200）' % (tag, k + 1), i1['G'] == 'wz_teahouse' and bool(i1['glb']) and i1['meshes'] < 200, J(i1))
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
