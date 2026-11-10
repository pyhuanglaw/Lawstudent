"""CC GG-DOOR-CAMS-1104 ③ 樹冠網點 r2（BB 10:43：r1 鏡頭只在人背後、沒進樹冠＝探針設計錯）：
【前置／捷徑】讀檔到 ZONE 的 (X, Z)、HOUR；騎著車就先按「下車」（#btnBike）。在玩家 R m 內找樹冠網格（材質 userData.seeThrough，或名字／材質名含 leaf／crown／canopy／foliage），挑最近的 N 棵：
每棵用另一台相機（同一個場景、同一個 shader，鏡頭位置不同）拍三張：
  under＝樹冠底下 0.6 m 往上看；inside＝樹冠正中間往水平方向看（鏡頭在葉子裡＝網點透空該出現的情況）；edge＝樹冠外緣 0.5 m 往樹幹看。
另外遊戲鏡頭本身：玩家走到那棵樹正下方、鏡頭 yaw 不動、距離 DIST（預設 3）截一張。記每棵的位置、樹冠範圍、材質有沒有 seeThrough。Playwright ≠ iPhone。
r3（CC 11:2x）：r2 在校園抓到的是大王椰子樹幹（trees_palm_a_bark），不是闊葉樹冠，遊戲鏡頭和人之間也沒有樹冠＝網點沒被觸發，新舊都看不出來＝沒測到。
  加 EXCL（名字排除的正規式，例 palm|bark）；DISTS（遊戲鏡頭距離，逗號分隔，例 3,7：距離拉長鏡頭會升高、穿進樹冠）；每個距離截一張 gamecam_d<距離>。
用法：LW_TESTS=<wt>/tests TAG=old|new [ZONE=campus] [X=-40] [Z=6.5] [R=40] [N=2] [HOUR=14] [EXCL=palm+bark] [LEAF=1] [DISTS=3,7] python3 cc_canopy_shot_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; ZONE = os.environ.get('ZONE') or 'campus'
X = float(os.environ.get('X') or -40); Z = float(os.environ.get('Z') or 6.5); RAD = float(os.environ.get('R') or 40); N = int(os.environ.get('N') or 2)
HOUR = float(os.environ.get('HOUR') or 14); DIST = float(os.environ.get('DIST') or 3)
DISTS = [float(v) for v in (os.environ.get('DISTS') or str(DIST)).split(',') if v]; EXCL = (os.environ.get('EXCL') or '').replace('+', '|'); LEAF = os.environ.get('LEAF') == '1'   # r4：佇列用「|」分欄，EXCL 寫 palm+bark（+ 換成 |）；LEAF=1＝只認名字／材質名是葉子、樹冠的（不算 seeThrough 的柱子、樹幹）
R = L.Run('canopy_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
FIND = r"""(a=>{ const E=GAME.E, P=E.player.obj.position, out=[]; const rx=/leaf|crown|canopy|foliage|palm_?fr|frond/i; const ex=a.ex?new RegExp(a.ex,'i'):null;
  E.scene.traverse(o=>{ if(!o.isMesh&&!o.isInstancedMesh) return; for(let q=o;q;q=q.parent) if(q.visible===false) return; const ms=[].concat(o.material);
    if(ex&&(ex.test(o.name||'')||ms.some(m=>m&&ex.test(m.name||'')))) return; const see=ms.some(m=>m&&m.userData&&m.userData.seeThrough), hit=(a.leaf?false:see)||rx.test(o.name||'')||ms.some(m=>m&&rx.test(m.name||'')); if(!hit) return;
    if(o.isInstancedMesh){ const M=new THREE.Matrix4(), b0=new THREE.Box3(); if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); o.updateMatrixWorld(true);
      for(let i=0;i<o.count;i++){ o.getMatrixAt(i,M); M.premultiply(o.matrixWorld); const b=b0.copy(o.geometry.boundingBox).applyMatrix4(M); const c=b.getCenter(new THREE.Vector3()); const d=Math.hypot(c.x-P.x,c.z-P.z); if(d<a.r) out.push({name:o.name+'#'+i, see, min:[b.min.x,b.min.y,b.min.z], max:[b.max.x,b.max.y,b.max.z], c:[c.x,c.y,c.z], d}); } }
    else { const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()); const d=Math.hypot(c.x-P.x,c.z-P.z); if(d<a.r&&b.max.y-b.min.y<40) out.push({name:o.name||'(無名)', see, min:[b.min.x,b.min.y,b.min.z], max:[b.max.x,b.max.y,b.max.z], c:[c.x,c.y,c.z], d}); } });
  out.sort((p,q)=>p.d-q.d); return out.slice(0,a.n*4).map(t=>({...t, min:t.min.map(v=>+v.toFixed(2)), max:t.max.map(v=>+v.toFixed(2)), c:t.c.map(v=>+v.toFixed(2)), d:+t.d.toFixed(1)})); })"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 500); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const keep=E.camera; E.camera=cam; try{ r.render(E.scene,cam); } finally { E.camera=keep; } return c.toDataURL('image/png'); })"""


async def snap(pg, fn, frm, at):
    u = await pg.evaluate(SNAP, {'from': frm, 'at': at}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 樹冠網點：worktree %s；TAG %s；%s (%s,%s)；Playwright ≠ iPhone' % (real or '?', TAG, ZONE, X, Z), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 %s (%s,%s) 2025-10-18 %.1f 時' % (ZONE, X, Z, HOUR))
        await D.load_zone(pg, cdp, ZONE, '2025-10-18', HOUR, x=X, z=Z, yaw=0.0, wait=9000)
        if await pg.evaluate("!!(GAME.E.player&&GAME.E.player.riding)"):
            await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(1500); R.note('騎著車：按「下車」')
        R.check('沒在騎車', not await pg.evaluate("!!(GAME.E.player&&GAME.E.player.riding)"), '')
        trees = await pg.evaluate(FIND, {'r': RAD, 'n': N, 'ex': EXCL, 'leaf': LEAF}); R.note('附近的樹冠網格（前 %d）：%s' % (len(trees), J(trees)))
        if not R.check('%s m 內找得到樹冠網格' % RAD, bool(trees), ''): await b.close(); return
        seen = []
        for t in trees:
            if len(seen) >= N: break
            if any(abs(t['c'][0] - s['c'][0]) < 2 and abs(t['c'][2] - s['c'][2]) < 2 for s in seen): continue
            seen.append(t); k = len(seen); cx, cy, cz = t['c']; y0, y1 = t['min'][1], t['max'][1]; rx = (t['max'][0] - t['min'][0]) / 2
            R.note('樹 %d：%s 中心 %s 高 %.1f～%.1f、seeThrough %s' % (k, t['name'], t['c'], y0, y1, t['see']))
            await pg.evaluate(D.HUD + '(false)')
            await snap(pg, 'canopy_%s_t%d_under.png' % (TAG, k), [cx + 0.3, y0 - 0.6, cz + 0.3], [cx, y1, cz])
            await snap(pg, 'canopy_%s_t%d_inside.png' % (TAG, k), [cx, cy, cz], [cx + 10, cy - 1, cz])
            await snap(pg, 'canopy_%s_t%d_edge.png' % (TAG, k), [cx + rx + 0.5, cy, cz], [cx, cy, cz])
            ok = await L.go_to(pg, cdp, R, cx, cz + 0.8, 0.8, '走到樹 %d 正下方' % k, max_s=90)
            for dd in DISTS:
                await pg.evaluate("d=>{ const C=GAME.E.cam; C.distTarget=d; C.dist=d; C.manualT=10; }", dd); await pg.wait_for_timeout(2500)
                await pg.screenshot(path=os.path.join(OUT, 'canopy_%s_t%d_gamecam%s.png' % (TAG, k, '' if len(DISTS) == 1 else '_d%g' % dd)))
                R.note('樹 %d 遊戲鏡頭（距離 %g）：%s' % (k, dd, J(await pg.evaluate("(()=>{ const c=GAME.E.camera.position; return [+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]; })()"))))
            await pg.evaluate(D.HUD + '(true)')
        R.check('拍到 %d 棵' % N, len(seen) >= 1, str(len(seen)))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
