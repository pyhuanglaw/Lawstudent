"""CC-B（帳號 B）11-07：V21X_teishoku_front（BB-B 09:44）。小路（wz_teishoku，AA 的 komichi.glb）門口那一面（格子門＋兩扇窗，店裡往 +z 看）：
  模型有窗景卡的店 ggViewPanes 不另外加卡，V21X「店裡有窗景卡（名字有 VIEW）」views:[] 可能照設計——看圖判。
  【前置／捷徑】讀檔進 wz_teishoku（14:00、21:00）。
  ①user_shot（新 CAM）：店裡出生點、高 1.6 m，往門口那一面看 ②玩家視角：站在門口那面牆前 1.5 m、面向 +z、遊戲照常的跟隨鏡頭。
  另外印：場景裡名字含 VIEW／window／glass／win 的網格（名字、位置、材質、貼圖），看窗景是不是做在模型裡。Playwright ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_teishoku_front_probe.py <url> <out>"""
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
R = L.Run('teishoku_front', OUT); D.setup(R, OUT)
ZONE = os.environ.get('ZONE') or 'wz_teishoku'
DAY = os.environ.get('DAY') or '2025-10-15'
TIMES = [('dusk', 18.2), ('night', 21.0)]   # 小路營業 18:00～02:00（店裡牌子）；14:00 進不去（雲端第一版）

GEO = r"""(()=>{ const E=GAME.E, z=E.zone; const ex=(E.interactables||[]).filter(i=>i.exit||i.leave||/出去|離開|門/.test(i.label||'')).map(i=>({label:i.label,x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2)}));
  const box=new THREE.Box3(), c=new THREE.Vector3(), out=[]; if(z&&z.group){ z.group.updateMatrixWorld(true); z.group.traverse(o=>{ if(!o.isMesh) return; const m=[].concat(o.material)[0]||{}; const nm=(o.name||'')+' '+(m.name||'');
    if(!/view|window|glass|win|窗|shoji|lattice|格子/i.test(nm)) return; box.setFromObject(o); box.getCenter(c);
    out.push({n:(o.name||'').slice(0,40), mat:(m.name||'').slice(0,30), type:m.type, map:m.map&&m.map.image?((m.map.image.currentSrc||m.map.image.src)||'').slice(-50):null, vis:o.visible, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], size:[+(box.max.x-box.min.x).toFixed(2),+(box.max.y-box.min.y).toFixed(2),+(box.max.z-box.min.z).toFixed(2)]}); }); }
  let zmax=-1e9; if(z&&z.group){ const b=new THREE.Box3().setFromObject(z.group); zmax=b.max.z; }
  const P=E.player.obj.position; return {exits:ex, wins:out.slice(0,30), nWins:out.length, zmax:+zmax.toFixed(2), spawn:[+P.x.toFixed(2),+P.z.toFixed(2)], viewPanes:z&&z.viewPanes||0}; })()"""


async def one(pg, cdp, tn, h, rec):
    tag = '[%s]' % tn
    R.setup('%s 讀檔進 %s %s %.2f（條件事件關閉）' % (tag, ZONE, DAY, h))
    s = await D.load_zone(pg, cdp, ZONE, DAY, h, wait=9000)
    if not R.check('%s 進得了 %s' % (tag, ZONE), s['zone'] == ZONE, J(s)): return
    await pg.wait_for_timeout(2500)
    g = await pg.evaluate(GEO); R.note('%s 門口、窗、玻璃相關的網格：%s' % (tag, J(g)))
    sx, sz = g['spawn']
    ex = g['exits'][0] if g['exits'] else {'x': sx, 'z': sz + 4.0}
    fz = max(ex['z'], sz + 1.0)   # 門口那一面（店裡往 +z 看）
    cam = await D.user_shot(pg, cdp, 'teishoku_front_%s' % tn, {'eye': [sx, 1.6, sz - 0.5], 'look': [ex['x'], 1.4, fz + 1.0], 'lens': 20})
    rec.setdefault(tn, {})['cam'] = cam
    # 玩家視角：站在門口那一面前 1.5 m、面向 +z
    st = [ex['x'], fz - 1.5]
    ok_st = await pg.evaluate("((q)=>GAME.E.canStand?GAME.E.canStand(q[0],q[1],0.3,0):true)", st)
    if not ok_st: st = [ex['x'], fz - 2.2]
    R.setup('%s 玩家站在門口那一面前 (%.2f, %.2f) 面向 +z（跟隨鏡頭照遊戲自己的）' % (tag, st[0], st[1]))
    await D.load_zone(pg, cdp, ZONE, DAY, h, x=st[0], z=st[1], yaw=0.0, wait=7000)
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(1800)
    m = await D.shot(pg, 'teishoku_front_player_%s' % tn)
    vv = await pg.evaluate(r"""(()=>{ const z=GAME.E.zone, out=[]; z.group.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name||'')){ let v=true; for(let p=o;p;p=p.parent) if(p.visible===false) v=false; out.push({n:o.name, self:o.visible, eff:v}); } }); const c=GAME.E.camera.position; return {views:out, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]}; })()""")
    R.note('%s 玩家視角那一格：窗景卡顯示狀態 %s' % (tag, J(vv)))
    await pg.evaluate(D.HUD + '(true)')
    rec[tn].update({'geo': g, 'stand': st, 'playerLum': m, 'viewsAtPlayer': vv})


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC V21X_teishoku_front（小路門口那一面）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
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
    json.dump(rec, open(os.path.join(OUT, 'teishoku_front.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
