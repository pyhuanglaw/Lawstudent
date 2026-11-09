"""CC CAM-TEAYARD（BB-B 11-09 23:18 P3）：一盞前院出生點 (-3, 9)，用真的手指拖曳（CDP 觸控、跟遊戲平常一樣，不直接擺鏡頭、不設距離）
把跟隨鏡頭轉到 YAWS（預設 180、270 度；鏡頭在玩家的 (sin yaw, cos yaw) 那一側），停 3 秒後記：鏡頭和頭（腳底 +1.45 m）的距離、E.cam.dist、
畫面亮度標準差（整片牆＝很小）→ 截圖。Playwright／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [TAG=new] [YAWS=180,270] [X=-3] [Z=9] python3 cc_teayard_cam_probe.py <url> <out>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ZONE = os.environ.get('ZONE') or 'wz_teahouse'
# SPOTS（有給就用這個，不用 X/Z/YAWS）：逗號分隔；s@yaw＝出生點、x@z@yaw＝指定站位、L@ / R@ / B@＝走到那一面牆邊（導航格邊界，離牆 0.6 m 內），鏡頭轉到牆外
SPOTS = [v for v in (os.environ.get('SPOTS') or '').split(',') if v]
TAG = os.environ.get('TAG') or 'x'; YAWS = [float(v) for v in (os.environ.get('YAWS') or '180,270').split(',')]
X = float(os.environ.get('X') or -3); Z = float(os.environ.get('Z') or 9); DAY = os.environ.get('DAY') or '2025-10-18'; HOUR = float(os.environ.get('HOUR') or 14)
R = L.Run('camdrag_%s_%s' % (ZONE, TAG), OUT); D.setup(R, OUT)
CAM = """(()=>{ const C=GAME.E.cam, P=GAME.E.player.obj.position, c=GAME.E.camera.position; const hx=P.x, hy=P.y+1.45, hz=P.z;
  return {yawDeg:+(((C.yaw*180/Math.PI)%360+360)%360).toFixed(1), dist:+C.dist.toFixed(2), distTarget:+C.distTarget.toFixed(2), camHead:+Math.hypot(c.x-hx,c.y-hy,c.z-hz).toFixed(2),
          cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2)], zone:GAME.G.zone}; })()"""
CLOSE = "(()=>{ const d=document.querySelector('#dlg'); return !!(d && d.offsetParent!==null && getComputedStyle(d).display!=='none'); })()"
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 一盞前院鏡頭：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        plan = []
        if not SPOTS: plan = [('xy', X, Z, y) for y in YAWS]
        for sp in SPOTS:
            q = sp.split('@')
            if q[0] == 's': plan.append(('spawn', None, None, float(q[1])))
            elif q[0] in ('L', 'R', 'B'): plan.append(('wall', q[0], None, {'L': 270.0, 'R': 90.0, 'B': 180.0}[q[0]]))
            else: plan.append(('xy', float(q[0]), float(q[1]), float(q[2])))
        res = {}; cur = None
        for kind, a, bb, yd in plan:
            if kind == 'spawn': want = ('spawn',)
            elif kind == 'wall':
                if cur is None:
                    R.setup('【前置／捷徑】讀檔到 %s %s %s（出生點，先量可走範圍）' % (ZONE, DAY, HOUR)); await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=9000); cur = ('spawn',)
                pk = await pg.evaluate("""w=>{ const N=GAME.E.nav; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; const f=[]; for(let r=0;r<N.rows;r++) for(let c=0;c<N.cols;c++){ if(N.b[N.idx(c,r)]) continue; const [x,z]=N.toWorld(c,r); f.push([x,z]); x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); }
                  const cx=(x0+x1)/2, cz=(z0+z1)/2; let best=null,bd=1e9; for(const [x,z] of f){ const dw=w==='L'?x-x0:(w==='R'?x1-x:z-z0), dm=w==='B'?Math.abs(x-cx):Math.abs(z-cz); if(dw>0.6) continue; if(dm<bd){bd=dm; best=[+x.toFixed(2),+z.toFixed(2)];} } return {bbox:[x0,x1,z0,z1], pick:best}; }""", a)
                R.note('%s 牆 %s：%s' % (ZONE, a, json.dumps(pk))); want = ('xy', pk['pick'][0], pk['pick'][1]) if pk['pick'] else None
                if not want: R.check('%s 牆 %s 找得到站位' % (ZONE, a), False, ''); continue
            else: want = ('xy', a, bb)
            if want != cur:
                if want[0] == 'spawn':
                    R.setup('【前置／捷徑】讀檔到 %s %s %s（出生點）' % (ZONE, DAY, HOUR)); await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=9000)
                else:
                    R.setup('【前置／捷徑】讀檔到 %s %s %s，站 (%s, %s)' % (ZONE, DAY, HOUR, want[1], want[2])); await D.load_zone(pg, cdp, ZONE, DAY, HOUR, x=want[1], z=want[2], yaw=0.0, wait=9000)
                cur = want
            label = '%s%s' % ('' if kind != 'wall' else a, int(yd))
            for _ in range(10):
                if not await pg.evaluate(CLOSE): break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
            for it in range(8):   # 真的拖曳：一次最多 300 px（0.0075 rad/px），直到差 <4°
                s = await pg.evaluate(CAM); d = (yd - s['yawDeg'] + 540) % 360 - 180
                if abs(d) < 4: break
                px = max(-300, min(300, -math.radians(d) / 0.0075))
                await L.drag(pg, cdp, 422 - px / 2, 120, 422 + px / 2, 120, steps=12); await pg.wait_for_timeout(400)
            await pg.wait_for_timeout(3000)
            s = await pg.evaluate(CAM); R.note('轉到 %s°：%s' % (yd, json.dumps(s)))
            await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
            fn = os.path.join(OUT, 'camdrag_%s_%s_%s.png' % (ZONE, TAG, label)); await pg.screenshot(path=fn)
            await pg.evaluate(D.HUD + '(true)')
            from PIL import Image, ImageStat
            sd = ImageStat.Stat(Image.open(fn).convert('L')).stddev[0]; s['lumaStd'] = round(sd, 1); res[label] = s
            R.check('%s° 鏡頭轉到了（差 <6°）' % yd, abs((yd - s['yawDeg'] + 540) % 360 - 180) < 6, str(s['yawDeg']))
            R.note('%s° 畫面亮度標準差 %.1f（整片牆通常 <15）' % (yd, sd))
        json.dump(res, open(os.path.join(OUT, 'teayard_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
