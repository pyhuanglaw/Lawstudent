"""CC-B（帳號 B）11-07：XS_FARVIEW（BB-B 09:05；LAWWW2-B XS-FARVIEW-1105／1107，c8b09bcf0：新生南路兩頭的遠景 xinsheng_far.glb、zone.noSkylineCity）。
  照 README 的清單拍（docs/art-rebuild/second_ai/wip/xs_farview_1107/README.md「遊戲內畫面（CC）」）：
    ①側門往北 ②側門往南 ③東側人行道往西（看店面後面那一排高樓）④校園那一側往東（還有沒有城市剪影方盒）——白天 14:00、晚上 21:00。
  【前置／捷徑】讀檔到 xinsheng 區域；截圖用 user_shot（指定鏡頭，CAM 已會重算 fadeWalls、搬天空球）；
  fps／draw call：同一點讓玩家站著、面向同一方向、遊戲照常跑 3 秒（跟隨鏡頭），WARM 秒先跑不記。
  記：遠景模型 bldg.xinsheng_far 有沒有載入、zone.noSkylineCity、E.skyline 看不看得到。好不好看＝BB 判（和 Blender 三張 farview_before_after.jpg 並排）。Playwright ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_xs_farview_probe.py <url> <out>"""
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
R = L.Run('xs_farview', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
TIMES = [('day', 14.0), ('night', 21.0)]
WARM = float(os.environ.get('WARM') or 2)

FPS = r"""(async (ms)=>{ const E=GAME.E; const t=[]; let last=performance.now(); const t0=last; await new Promise(res=>{ const f=now=>{ t.push(now-last); last=now; if(now-t0<ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  t.shift(); const avg=t.reduce((a,b)=>a+b,0)/Math.max(t.length,1), worst=Math.max(...t); const ri=E.renderer&&E.renderer.info&&E.renderer.info.render;
  return {frames:t.length, fpsAvg:+(1000/avg).toFixed(1), fpsMin:+(1000/worst).toFixed(1), msWorst:+worst.toFixed(1), calls:ri?ri.calls:null, tris:ri?ri.triangles:null}; })"""

STATE = r"""(()=>{ const E=GAME.E, z=E.zone; let far=null, n=0; if(z&&z.group) z.group.traverse(o=>{ if(/xinsheng_far/i.test(o.name||'')||(o.userData&&/xinsheng_far/.test(o.userData.asset||o.userData.key||''))) far=far||o.name||'(userData)'; if(o.isMesh) n++; });
  const A=typeof ASSETS!=='undefined'?ASSETS:null; const st=A&&A.status?(()=>{ try{ return A.status('bldg.xinsheng_far'); }catch(e){ return String(e); } })():null;
  return {zone:GAME.G.zone, noSkylineCity:!!(z&&z.noSkylineCity), skylineVis:E.skyline?!!E.skyline.visible:null, farNode:far, assetStatus:st, meshes:n, L:typeof XINSHENG_LAYOUT!=='undefined'?{gate:XINSHENG_LAYOUT.sideGate&&{x:XINSHENG_LAYOUT.sideGate.x,z:XINSHENG_LAYOUT.sideGate.z,spawn:XINSHENG_LAYOUT.sideGate.spawn}, walkE:XINSHENG_LAYOUT.walkEast, walkW:XINSHENG_LAYOUT.walkWest}:null}; })()"""


async def one(pg, cdp, tn, h, rec):
    tag = '[%s]' % tn
    R.setup('%s 讀檔 xinsheng %s %.2f（條件事件關閉）' % (tag, DAY, h))
    s = await D.load_zone(pg, cdp, 'xinsheng', DAY, h, wait=9000)
    if not R.check('%s 進得了 xinsheng' % tag, s['zone'] == 'xinsheng', J(s)): return
    await pg.wait_for_timeout(4000)   # 遠景 GLB 4.7 MB 載入
    st = await pg.evaluate(STATE); R.note('%s 區域狀態：%s' % (tag, J(st)))
    R.check('%s 接上遠景以後 zone.noSkylineCity（不畫城市剪影圓筒）' % tag, st['noSkylineCity'], J(st))
    sp = (st['L'] or {}).get('gate') or {}; sps = sp.get('spawn') or {'x': 14.3, 'z': 10.0}
    gx, gz = sps['x'], sps['z']
    # name, 玩家站點 (x, z), 鏡頭 eye, look
    views = [('gate_north', (gx - 4.0, gz), [gx - 4.0, 1.7, gz], [gx - 6.0, 4.0, gz - 120.0]),
             ('gate_south', (gx - 4.0, gz), [gx - 4.0, 1.7, gz], [gx - 6.0, 4.0, gz + 120.0]),
             ('east_walk_west', (12.0, gz - 20.0), [12.0, 1.7, gz - 20.0], [-45.0, 16.0, gz - 50.0]),
             ('campus_side_east', (-10.0, gz - 10.0), [-10.0, 1.7, gz - 10.0], [80.0, 12.0, gz - 30.0])]
    for nm, stand, eye, look in views:
        yaw = math.atan2(look[0] - stand[0], look[2] - stand[1])
        await D.load_zone(pg, cdp, 'xinsheng', DAY, h, x=stand[0], z=stand[1], yaw=yaw, wait=6000)
        await pg.wait_for_timeout(2500)
        if WARM: await pg.evaluate(FPS, int(WARM * 1000))
        f = await pg.evaluate(FPS, 3000)
        cam = await D.user_shot(pg, cdp, 'farview_%s_%s' % (nm, tn), {'eye': eye, 'look': look, 'lens': 24})
        R.note('%s %s：玩家站 (%.1f, %.1f) 跟隨鏡頭 fps／draw call：%s' % (tag, nm, stand[0], stand[1], J(f)))
        rec.setdefault(tn, []).append({'view': nm, 'stand': stand, 'cam': cam, 'perf': f})


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC XS_FARVIEW（新生南路兩頭的遠景）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
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
    json.dump(rec, open(os.path.join(OUT, 'xs_farview.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
