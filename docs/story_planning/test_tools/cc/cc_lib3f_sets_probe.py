"""CC-C（帳號 C）11-05：NPCTASK_lib3f（BB-C 06:18 第 3 點）——總圖三樓閱覽室（library）每個坐著的位子的 SEATACT 狀態：act、set（桌上配件組）、items、task、clip。
  起因：NPCTASK_r2（13700be8f）三樓坐著 10 人、在做事的 1（phone）；LAWWW-C 的 Node 測試說三樓 4/4 都有配件組——拿去問為什麼和 Node 不一樣。不判，只記＋拍。
  做法：讀檔 library 2025-10-15（三）14:00，等 10 秒、40 秒各記一次 SEATACT.state()＋每個坐著的 NPC（位置、CHAR.sitTaskOf(n.obj)、SEATACT.state().why）；B1（library_b1）同樣記一次對照。各拍一張。
用法：LW_TESTS=<wt>/tests python3 cc_lib3f_sets_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('lib3f_sets', OUT); D.setup(R, OUT)
DUMP = r"""(()=>{ const s=(typeof SEATACT!=='undefined'&&SEATACT.state)?SEATACT.state():null; const E=GAME.E;
  const sit=(E.npcs||[]).filter(n=>n&&n.seat).map(n=>({id:n.id||null, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), vis:n.obj.visible!==false, task:(typeof CHAR!=='undefined'&&CHAR.sitTaskOf)?CHAR.sitTaskOf(n.obj):null, why:(()=>{ const L=(s&&s.list)||[]; let b=null,bd=9; for(const r of L){ const d=Math.hypot(r.x-n.obj.position.x,r.z-n.obj.position.z); if(d<bd){ bd=d; b=r; } } return b&&bd<=0.8?b.why:null; })(), table:(n.seat&&n.seat.table)||null}));   /* BB-C 08:05：sitTaskOf 傳 n.obj；tb 改讀 SEATACT.state().why */
  return {zone:GAME.G.zone, seatact:s&&{zone:s.zone, n:s.n, loaded:s.loaded, list:s.list}, sitting:sit, sitTask:(typeof CHAR!=='undefined')?CHAR.sitTask:null, taskReady:(typeof CHAR!=='undefined'&&CHAR.sitTaskReady)?CHAR.sitTaskReady():null}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC NPCTASK_lib3f（三樓閱覽室每個位子的 set／act）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for zn in ('library', 'library_b1'):
            R.setup('讀檔 %s 2025-10-15（三）14:00' % zn)
            await D.load_zone(pg, cdp, zn, '2025-10-15', 14.0, wait=10000)
            for t in (10, 40):
                if t == 40: await pg.wait_for_timeout(30000)
                d = await pg.evaluate(DUMP)
                sa = d['seatact'] or {}
                lst = sa.get('list') or []
                R.note('[%s %d 秒] SEATACT zone=%s n=%s loaded=%s；CHAR.sitTask=%s、sitTaskReady=%s' % (zn, t, sa.get('zone'), sa.get('n'), sa.get('loaded'), d['sitTask'], d['taskReady']))
                for k, r in enumerate(lst):
                    R.note('[%s %d 秒] 位子 %d：act=%s set=%s items=%s task=%s clip=%s pose=%s at (%s, %s)' % (zn, t, k + 1, r.get('act'), J(r.get('set')), J(r.get('items')), J(r.get('task')), J(r.get('clip')), r.get('pose'), r.get('x'), r.get('z')))
                R.note('[%s %d 秒] 坐著的 NPC %d：%s' % (zn, t, len(d['sitting']), J(d['sitting'])))
                json.dump(d, open(os.path.join(OUT, '%s_%ds.json' % (zn, t)), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            await D.shot(pg, '%s_overview' % zn, judge_black=False)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
