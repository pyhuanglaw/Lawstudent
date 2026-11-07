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


def proj(c, pt, W=1280, H=720):
    """針孔相機：c＝user_shot 回傳的 {eye, look, vfov}；pt 世界座標 → 截圖像素（在後面回傳 None）"""
    ex, ey, ez = c['eye']; lx, ly, lz = c['look']
    f = [lx - ex, ly - ey, lz - ez]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [f[2] * 0 - f[1] * 0, 0, 0]; r = [-f[2], 0.0, f[0]]; rn = math.hypot(r[0], r[2]) or 1; r = [r[0] / rn, 0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[0] - ex, pt[1] - ey, pt[2] - ez]
    zf = sum(a * b for a, b in zip(d, f))
    if zf <= 0.1: return None
    t = math.tan(math.radians(c['vfov']) / 2)
    x = sum(a * b for a, b in zip(d, r)) / (zf * t * W / H); y = sum(a * b for a, b in zip(d, u)) / (zf * t)
    return (W / 2 + x * W / 2, H / 2 - y * H / 2)


def patch_lum(path, xy, r=6):
    try:
        from PIL import Image
        im = Image.open(path).convert('L'); W, H = im.size
        if not xy or not (r <= xy[0] < W - r and r <= xy[1] < H - r): return None
        box = im.crop((int(xy[0]) - r, int(xy[1]) - r, int(xy[0]) + r, int(xy[1]) + r)); px = list(box.getdata())
        return round(sum(px) / len(px), 1)
    except Exception as ex: return repr(ex)[:60]


def pool_report(tag, name, c, pairs):
    """pairs：[(燈下地面點, 兩盞燈中間的地面點)]；印燈下、中間的平均亮度（BB-B 08:44：燈下地面有沒有光圈）"""
    path = os.path.join(OUT, name + '.png'); out = []
    for a, b in pairs:
        la, lb = patch_lum(path, proj(c, a)), patch_lum(path, proj(c, b))
        if la is not None and lb is not None and not isinstance(la, str) and not isinstance(lb, str): out.append({'lamp': [round(a[0], 1), round(a[2], 1)], 'under': la, 'between': lb, 'diff': round(la - lb, 1)})
    R.note('%s %s 燈下地面亮度 vs 兩盞中間（截圖 12×12 px 平均，灰階 0～255）：%s' % (tag, name, J(out)))
    return out


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
             ('high', [xh, 9.0, -150.0], [xh, 0.0, -225.0], 26)]   # high：北牆外、路口南邊抬高 9 m（雲端第一版放在牆內 z −131，被校園的樹擋住）]
    for nm, eye, look, lens in views:
        cam = await D.user_shot(pg, cdp, 'xsnorth_%s_%s' % (nm, tn), {'eye': eye, 'look': look, 'lens': lens})
        pr = None
        if nm == 'high':
            pairs = [((xh + sd * 7.85, 0.05, z), (xh + sd * 7.85, 0.05, z - 10.0)) for z in (-176.0, -196.0, -216.0) for sd in (-1, 1)]
            pr = pool_report(tag, 'xsnorth_%s_%s' % (nm, tn), cam, pairs)
        rec.setdefault('shots', []).append({'name': 'xsnorth_%s_%s' % (nm, tn), 'cam': cam, 'pool': pr})
    rec.setdefault('geo', {})[tn] = g


REF_GLOWS = r"""(()=>{ const out=[]; for(const g of (GAME.E.lampGlows||[])){ if(!g||!g.isSprite) continue; const p=new THREE.Vector3(); g.getWorldPosition(p); out.push([+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),g.visible!==false]); } return out; })()"""


async def ref_xinsheng(pg, cdp, tn, h, rec):
    """BB-B 08:44：對照——新生南路主段（xinsheng 區域，有路燈光暈的那一段）同時間一張，印燈下地面亮度"""
    tag = '[%s 對照 xinsheng]' % tn
    R.setup('%s 讀檔 xinsheng %s %.2f' % (tag, DAY, h))
    s = await D.load_zone(pg, cdp, 'xinsheng', DAY, h, wait=8000)
    if s['zone'] != 'xinsheng': R.note('%s 讀不進 xinsheng 區域：%s' % (tag, J(s))); return
    gl = await pg.evaluate(REF_GLOWS)
    sp = [s['x'], s['z']]; gl.sort(key=lambda g: math.hypot(g[0] - sp[0], g[2] - sp[1]))
    R.note('%s 路燈光暈 %d 個（看得到 %d 個）；最近幾個：%s' % (tag, len(gl), sum(1 for g in gl if g[3]), J(gl[:6])))
    if len(gl) < 2:   # xinsheng 區域的路燈（xinsheng3d.js：XINSHENG_LAYOUT.lamps）也沒有 E.lampGlows——照配置的燈位拍（燈頭往馬路 0.75 m）
        lp = await pg.evaluate("(()=>{ const L=(typeof XINSHENG_LAYOUT!=='undefined')?XINSHENG_LAYOUT.lamps:null; return L?L.map(q=>[q[0],0,q[1],null]):[]; })()")
        R.note('%s 這個區域沒有 E.lampGlows（光暈）；配置的路燈 %d 盞：%s' % (tag, len(lp), J(lp[:6])))
        if len(lp) < 2: return
        gl = sorted(lp, key=lambda g: math.hypot(g[0] - sp[0], g[2] - sp[1]))
    a = gl[0]; b = next((g for g in gl[1:] if 8 < math.hypot(g[0] - a[0], g[2] - a[2]) < 40), gl[1])
    mx, mz = (a[0] + b[0]) / 2, (a[2] + b[2]) / 2; dx, dz = b[0] - a[0], b[2] - a[2]; L_ = math.hypot(dx, dz) or 1
    nx, nz = -dz / L_, dx / L_
    if nx * (0 - a[0]) + nz * (0 - a[2]) < 0: nx, nz = -nx, -nz   # 往馬路那一側（xinsheng 的路燈在 x ±9、燈臂朝 x 0 的馬路）
    eye = [mx + nx * 9 - dx / L_ * 16, 6.0, mz + nz * 9 - dz / L_ * 16]   # 站在馬路上、往後退 16 m、高 6 m，往燈列看（雲端第一版退到店家屋頂上）
    cam = await D.user_shot(pg, cdp, 'xsnorth_ref_xinsheng_%s' % tn, {'eye': eye, 'look': [mx - nx * 1.0, 0.0, mz - nz * 1.0], 'lens': 26})
    pr = pool_report(tag, 'xsnorth_ref_xinsheng_%s' % tn, cam, [((a[0], 0.05, a[2]), (mx, 0.05, mz)), ((b[0], 0.05, b[2]), (mx, 0.05, mz))])
    rec.setdefault('ref', {})[tn] = {'glows': len(gl), 'cam': cam, 'pool': pr}


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
                try: await ref_xinsheng(pg, cdp, tn, h, rec)
                except Exception as ex: R.check('[%s 對照] 探針沒有例外' % tn, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'xs_north_road.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
