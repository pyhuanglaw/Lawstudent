"""CC-C（帳號 C）11-06：XSNE_shots（BB-C 11-05 10:48；開發線 abf4dbbd5：XS-NORTH-EXT-1105 望月台、體育館正式外觀、XS-WINCARD-1105 新生南路三間店的窗景）。
  白天 14:00、晚上 20:30 各一張（GPU headed）。BB 要看：黑畫面、地面閃爍（ground_zfight）、窗外照片有沒有對到外面、模型有沒有穿到路上。美術驗收 BB 標（D120），探針只擋黑畫面。
    1 新生南路：側門對面（店面那一側人行道）往校園看（望月台、體育館）
    2 校園：側門內小廣場看望月台；體育館門口往北
    3 大口一樓、二樓靠窗往外（窗景卡 z.wins）
    4 大步、好拍：店門內往外
    5 校園：北牆外路口；停車場（望月台旁邊）
  座標照遊戲執行時讀（Z3.XSG、XINSHENG_LAYOUT.sideGate、店的 z.wins、出口），不寫死；讀不到的那一張記下來跳過。
  【前置／捷徑】讀檔到那一區（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_xsne_shots_probe.py <url> <out>"""
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
R = L.Run('xsne_shots', OUT); D.setup(R, OUT)
DAY = '2025-10-18'
GEO = r"""(()=>{ const X=Z3.XSG||null, SG=(typeof XINSHENG_LAYOUT!=='undefined')?XINSHENG_LAYOUT.sideGate:null, E=GAME.E;
  const ex=E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label,to:i.exit.to,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}));
  const park=E.interactables.filter(i=>!i.hidden&&/開車|停車|車/.test(i.label||'')).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}));
  return {xsg:X?{x:X.x,gz:X.gz,moon:X.moon||null,gym:X.gym||null,a:X.a||null,b:X.b||null}:null, sg:SG, ex, park, zone:GAME.G.zone}; })()"""
WINS = r"""(()=>{ const z=GAME.E.zone, out=[]; const W=z&&(z.wins||[]); for(const w of W){ const o=w.mesh||w.obj||w; if(!o||!o.isObject3D) continue; o.updateWorldMatrix(true,false); const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3());
  out.push({name:o.name||'', c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}); } const sp=z.spawn||{x:0,z:0}; return {wins:out, spawn:[sp.x,sp.z], n:W.length}; })()"""
mid = lambda r: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]


async def shoot(pg, cdp, name, eye, look, lens=24):
    await D.user_shot(pg, cdp, name, {'eye': eye, 'look': look, 'lens': lens})


async def campus(pg, cdp, tn, h):
    R.setup('[%s] 讀檔校園 %s %05.2f（側門內）' % (tn, DAY, h))
    s = await D.load_zone(pg, cdp, 'campus', DAY, h, wait=8000)
    g = await pg.evaluate(GEO); R.note('[%s 校園] 幾何：%s' % (tn, J(g)))
    X = g['xsg']
    if not X: R.note('[%s 校園] 沒有 Z3.XSG，跳過校園那幾張' % tn); return
    cs = (g['sg'] or {}).get('campusSpawn') or {}
    gx = X['x']; gz = X['gz'] if X.get('gz') is not None else cs.get('z', -137.0)   # abf4dbbd5：側門在北牆（gz 空），小廣場＝從新生南路回來的落點 campusSpawn
    m = mid(X['moon']) if X.get('moon') else [gx - 12, gz]
    gy = mid(X['gym']) if X.get('gym') else [gx + 12, gz]
    eye = [cs.get('x', gx), 1.7, cs.get('z', gz) + 3.0]
    await shoot(pg, cdp, 'xsne_plaza_moon_%s' % tn, eye, [m[0], 3.0, m[1]])
    await shoot(pg, cdp, 'xsne_plaza_gym_%s' % tn, eye, [gy[0], 3.0, gy[1]])
    gd = next((e for e in g['ex'] if e['to'] == 'gym' or '體育館' in e['label']), None)
    if gd: await shoot(pg, cdp, 'xsne_gymdoor_north_%s' % tn, [gd['x'], 1.7, gd['z'] + 1.5], [gd['x'], 1.6, gd['z'] - 25])
    else: R.note('[%s 校園] 找不到體育館的門（出口 to=gym）：%s' % (tn, J(g['ex'])))
    await shoot(pg, cdp, 'xsne_northwall_out_%s' % tn, [gx - 8.0, 2.2, -150.0], [gx, 1.5, -138.0])   # 北牆外路口往側門看
    pk = g['park'][0] if g['park'] else None
    if pk: await shoot(pg, cdp, 'xsne_parking_%s' % tn, [pk['x'] + 4.0, 2.5, pk['z'] + 4.0], [pk['x'], 0.8, pk['z']])
    else: await shoot(pg, cdp, 'xsne_parking_%s' % tn, [m[0] + 6.0, 4.0, m[1] + 8.0], [m[0], 0.5, m[1]]); R.note('[%s 校園] 沒有「開車／停車」互動點：停車場那張改拍望月台旁邊' % tn)


async def xinsheng(pg, cdp, tn, h):
    R.setup('[%s] 讀檔新生南路 %s %05.2f（出生點）' % (tn, DAY, h))
    s = await D.load_zone(pg, cdp, 'xinsheng', DAY, h, wait=8000)
    g = await pg.evaluate(GEO)
    gate = next((e for e in g['ex'] if e['to'] == 'campus'), None)
    if not gate: R.note('[%s 新生南路] 找不到回校園的側門：%s' % (tn, J(g['ex']))); return
    await shoot(pg, cdp, 'xsne_xs_gate_to_campus_%s' % tn, [gate['x'] - 26.0, 1.7, gate['z']], [gate['x'] + 20.0, 5.0, gate['z']], 22)


async def shop_windows(pg, cdp, tn, h, zone):
    R.setup('[%s] 讀檔 %s %s %05.2f（店裡出生點）' % (tn, zone, DAY, h))
    s = await D.load_zone(pg, cdp, zone, DAY, h, wait=7000)
    if s['zone'] != zone: R.note('[%s %s] 讀不進店裡（%s）' % (tn, zone, s['zone'])); return
    w = await pg.evaluate(WINS); R.note('[%s %s] 窗景卡 %s' % (tn, zone, J(w)))
    sp = w['spawn']
    for k, c in enumerate(w['wins'][:4]):
        cc, sz = c['c'], c['size']; thin = 'x' if sz[0] < sz[2] else 'z'
        if thin == 'x': d = 1 if sp[0] > cc[0] else -1; eye = [cc[0] + d * 3.5, cc[1], cc[2]]
        else: d = 1 if sp[1] > cc[2] else -1; eye = [cc[0], cc[1], cc[2] + d * 3.5]
        await shoot(pg, cdp, 'xsne_%s_win%d_%s' % (zone, k, tn), eye, cc)
    ex = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&!i.hidden); return i?[i.x,i.z]:null; })()")
    if ex: await shoot(pg, cdp, 'xsne_%s_doorout_%s' % (zone, tn), [ex[0] + (sp[0] - ex[0]) * 0.6, 1.6, ex[1] + (sp[1] - ex[1]) * 0.6], [ex[0] + (ex[0] - sp[0]) * 2, 1.4, ex[1] + (ex[1] - sp[1]) * 2])


async def main():
    print('CC XSNE_shots：SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % os.environ.get('SHA', '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261106)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for tn, h in (('day', 14.0), ('night', 20.5)):
            for nm, fn in (('xinsheng', xinsheng), ('campus', campus)):
                try: await fn(pg, cdp, tn, h)
                except Exception as ex: R.check('[%s %s] 探針沒有例外' % (tn, nm), False, repr(ex)[:300])
            for z in ('xs_dakou', 'xs_dabu', 'xs_haopai'):
                try: await shop_windows(pg, cdp, tn, h, z)
                except Exception as ex: R.check('[%s %s] 探針沒有例外' % (tn, z), False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
