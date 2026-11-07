"""CC-B（帳號 B）11-07：XS_NORTH_ROAD（BB-B 08:33；LAWWW2-B XS-NORTH-ROAD-1107，fa79dd7bc）。
  校園北牆外、新生南路往北那一段（z −167 → −262、x＝Z3.XSG.xh）：16 m 車道、白虛線＋實線、2 m 分隔島（緣石、草、9 棵行道樹）、兩側人行道和路燈、兩側房子、路口斑馬線。走不到、導航不動。
  【前置／捷徑】讀檔到校園 2025-10-18（14:00、21:00），玩家放在側門內；鏡頭用 user_shot 指定位置（不是玩家的跟隨鏡頭）。
  拍：①側門（人眼 1.7 m）往北 ②體育館門口一帶（人眼）往北 ③側門往後退、抬高 8 m 往北（看整段接起來）——14:00、21:00 各一組。
  記：場景裡有沒有 xs_north_branch_road／_walk／_median／_lines、zebra_xs_branch；那一段的路燈數（燈頭位置 (0,3.95,0.75) 換算）、晚上 E.lampGlows 在那一段有幾個、
      行道樹數；房子（不能蓋到車道：|x−xh| < 8 的 city 量體＝穿到馬路上）。斷掉、浮空、穿模、接得順不順：看圖（BB 判）。Playwright ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_xs_north_road_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('xs_north_road', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
TIMES = [('day', 14.0), ('night', 21.0)]

GEO = r"""(()=>{ const X=Z3.XSG||{}; const z=GAME.E.zone; const names={}; const box=new THREE.Box3(), c=new THREE.Vector3();
  const want=['xs_north_branch_road','xs_north_branch_walk','xs_north_branch_median','xs_north_branch_lines','zebra_xs_branch','zebra_xs_north'];
  let intrude=[]; z.group.traverse(o=>{ if(want.includes(o.name)) names[o.name]=(names[o.name]||0)+1; });
  /* 往北那一段的範圍：x xh±12、z −165～−265；量那一段裡的量體（房子不能伸進 16 m 車道） */
  z.group.updateMatrixWorld(true);
  z.group.traverse(o=>{ if(!o.isMesh||!o.visible) return; if(/xs_north|zebra|lamp|tree|leaf|trunk/i.test(o.name||'')) return; box.setFromObject(o); if(box.isEmpty()) return;
    if(box.max.y<1.2) return; if(box.max.z<-265||box.min.z>-170) return; if(box.max.x<X.xh-7.8||box.min.x>X.xh+7.8) return;
    const sx=box.max.x-box.min.x, sz=box.max.z-box.min.z; if(sx>60||sz>60) return;   // 合併過的大網格（整排房子）另外看圖
    intrude.push({n:(o.name||o.parent&&o.parent.name||'?').slice(0,30), x:[+box.min.x.toFixed(1),+box.max.x.toFixed(1)], z:[+box.min.z.toFixed(1),+box.max.z.toFixed(1)], y:+box.max.y.toFixed(1)}); });
  const glows=(GAME.E.lampGlows||[]).map(g=>{ const o=g.obj||g.mesh||g; const p=new THREE.Vector3(); if(o&&o.getWorldPosition) o.getWorldPosition(p); return [p.x,p.z,o&&o.visible!==false]; }).filter(p=>Math.abs(p[0]-X.xh)<12&&p[1]<-170&&p[1]>-262);
  return {xsg:{x:X.x,xh:X.xh,gz:X.gz,gym:X.gym||null}, names, intrude:intrude.slice(0,20), nIntrude:intrude.length, glows:glows.length, glowsOn:glows.filter(g=>g[2]).length, lampGlowsAll:(GAME.E.lampGlows||[]).length, windowsLit:!!GAME.E.windowsLit}; })()"""


async def one(pg, cdp, tn, h, rec):
    tag = '[%s]' % tn
    R.setup('%s 讀檔校園 %s %.2f（條件事件關閉）；鏡頭 user_shot 指定位置' % (tag, DAY, h))
    s = await D.load_zone(pg, cdp, 'campus', DAY, h, wait=8000)
    g = await pg.evaluate(GEO)
    X = g['xsg']; R.note('%s 場景資料：%s' % (tag, J(g)))
    if not R.check('%s 校園有 Z3.XSG（xh＝新生南路往北那一段的中線）' % tag, X.get('xh') is not None, J(X)): return
    for k in ('xs_north_branch_road', 'xs_north_branch_walk', 'xs_north_branch_median', 'xs_north_branch_lines', 'zebra_xs_branch'):
        R.check('%s 場景裡有 %s' % (tag, k), bool(g['names'].get(k)), J(g['names']))
    R.check('%s 往北那一段 16 m 車道（xh±7.8）裡沒有高於 1.2 m 的單獨量體（房子沒伸到路上）' % tag, g['nIntrude'] == 0, J(g['intrude'][:6]))
    if tn == 'night': R.note('%s 那一段的路燈光暈（E.lampGlows 在 xh±12、z −170～−262）：%s——遠景的路燈（props 合併，北牆那一排、新生南路西側那一排也一樣）本來就沒有 lampGlows，晚上亮不亮看圖' % (tag, J({'glows': g['glows'], 'on': g['glowsOn'], 'all': g['lampGlowsAll']})))
    xh, gx = X['xh'], X.get('x') if X.get('x') is not None else X['xh']
    gz = X.get('gz') if X.get('gz') is not None else -143.0
    gym = X.get('gym')
    gymx = (gym[0] + gym[2]) / 2 if gym else gx; gymz = (gym[1] if gym else -140.0) - 1.5
    views = [('gate', [gx, 1.7, gz + 1.0], [xh, 2.0, -230.0], 30),
             ('gym', [gymx, 1.7, gymz], [xh, 2.0, -230.0], 30),
             ('high', [xh, 9.0, -150.0], [xh, 0.0, -225.0], 26)   # 北牆外、路口南邊抬高 9 m（雲端第一版放在牆內 z −131，被校園的樹擋住）]
    for nm, eye, look, lens in views:
        cam = await D.user_shot(pg, cdp, 'xsnorth_%s_%s' % (nm, tn), {'eye': eye, 'look': look, 'lens': lens})
        rec.setdefault('shots', []).append({'name': 'xsnorth_%s_%s' % (nm, tn), 'cam': cam})
    rec.setdefault('geo', {})[tn] = g


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC XS_NORTH_ROAD（新生南路往北那一段）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for tn, h in TIMES:
                print('== %s' % tn, flush=True)
                try: await one(pg, cdp, tn, h, rec)
                except Exception as ex: R.check('[%s] 探針沒有例外' % tn, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'xs_north_road.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
