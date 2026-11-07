"""CC-B（帳號 B）11-07：BB-B 08:01 派兩項夜景遊戲內截圖（fa05ed8c5；場景美術 D120 BB 判）。
  PARTS=shops,dome（預設兩個都跑）；每一個都 21:00 一組、14:00 一組對照。
  shops  XS_NIGHT：新生南路四家店從店裡往外看——大口漢堡一樓、二樓（lv 1）、大步球鞋、好拍運動。
         鏡頭：窗景卡（zone.wins）往店裡退 3.5 m（二樓同樣，站在二樓那一層）、對著窗景卡拍＝站在窗前往對街看。
         看圖：近處路面暗灰、只在燈下亮；對街紅磚牆、樹、望月台和體育館的亮窗；窗景不是一片黑（平均亮度、變化記下來）。
  dome   GYM_DOME：體育館薄膜圓頂（campus_gymext.glb 的材質 ck_glass_lit，LAWWW2-B 72099725f）。
         校園：新生南路側門（北牆 Z3.XSG）往南看體育館、小廣場（從新生南路回來的落點）看體育館。
         另外讀材質：ck_glass_lit 的 emissive 顏色、emissiveIntensity、有沒有發光貼圖——晚上要亮（>0）、白天不發光（0）；
         其他材質（桁架、直條）晚上有沒有跟著亮（emissive 不是 0 的列出來）。
  【前置／捷徑】讀檔到店裡出生點／校園落點（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [PARTS=shops,dome] python3 cc_fa05_night_probe.py <url> <out>"""
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
R = L.Run('fa05_night', OUT); D.setup(R, OUT)
DAY = '2025-10-18'
PARTS = [x for x in (os.environ.get('PARTS') or 'shops,dome').split(',') if x]   # BB-B 08:27 再加 player（玩家跟隨鏡頭站窗前 1.5 m）
DOME_FAR = os.environ.get('DOME_FAR') == '1'   # 圓頂退到 50～70 m、鏡頭高 6～10 m（看得到整個圓頂和天空）
TIMES = (('night', 21.0), ('day', 14.0))
WINS = r"""((lvMin)=>{ const z=GAME.E.zone, out=[]; const W=z&&(z.wins||[]); for(const w of W){ const o=w.mesh||w.obj||w; if(!o||!o.isObject3D) continue; o.updateWorldMatrix(true,false); const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3());
  if(lvMin!=null&&c.y<lvMin) continue; out.push({name:o.name||'', c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}); } const sp=z.spawn||{x:0,z:0}; return {wins:out, spawn:[sp.x,sp.z], n:W.length}; })"""
STAND2 = r"""((lv)=>{ const E=GAME.E; let best=null; for(let x=-6;x<=6;x+=0.5) for(let z=-6;z<=8;z+=0.5){ if(!E.canStand(x,z,0.3,lv)) continue; const d=Math.hypot(x,z-2); if(!best||d<best.d) best={x,z,d}; } return best; })"""
DOME = r"""(()=>{ const z=GAME.E.zone, lit=[], other=[]; z.group.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m) continue; const e=m.emissive?m.emissive.getHexString():null, ei=m.emissiveIntensity!=null?+(+m.emissiveIntensity).toFixed(3):null;
    const rec={mesh:o.name||'', mat:m.name||'', emissive:e, ei, emap:!!m.emissiveMap, vis:o.visible!==false};
    if(/ck_glass_lit/.test(m.name||'')) lit.push(rec); else if(/gym|GYM|truss|TRUSS|dome|DOME/.test((o.name||'')+(m.name||''))&&e&&e!=='000000'&&ei>0) other.push(rec); } });
  return {lit:lit.slice(0,8), nLit:lit.length, otherLit:other.slice(0,12), nOther:other.length}; })()"""
GEO = r"""(()=>{ const X=Z3.XSG||null, SG=(typeof XINSHENG_LAYOUT!=='undefined')?XINSHENG_LAYOUT.sideGate:null; return {xsg:X?{x:X.x,gz:X.gz,gym:X.gym||null}:null, sg:SG}; })()"""
mid = lambda r: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]


def inward(card, sp, dist):
    c, s = card['c'], card['size']
    if s[0] < s[2]: d = 1 if sp[0] > c[0] else -1; return [c[0] + d * dist, c[1], c[2]]
    d = 1 if sp[1] > c[2] else -1; return [c[0], c[1], c[2] + d * dist]


async def shop(pg, cdp, tn, h, zone, lv, rec):
    tag = '[%s %s lv%d]' % (tn, zone, lv)
    R.setup('%s 讀檔 %s %s %05.2f（店裡%s）' % (tag, zone, DAY, h, '出生點' if lv == 0 else '二樓站得住的點'))
    s = await D.load_zone(pg, cdp, zone, DAY, h, wait=7000)
    if s['zone'] != zone: R.note('%s 讀不進店裡（%s）' % (tag, J(s))); return
    if lv == 1:
        p2 = await pg.evaluate(STAND2, 1)
        if not R.check('%s 二樓有站得住的地方' % tag, bool(p2), J(p2)): return
        s = await D.load_zone(pg, cdp, zone, DAY, h, x=p2['x'], z=p2['z'], lv=1, wait=7000)
    w = await pg.evaluate(WINS, 3.0 if lv == 1 else None)
    R.note('%s 窗景卡 %s' % (tag, J(w)))
    sp = [s['x'], s['z']]
    cards = [c for c in w['wins'] if (lv == 0 and c['c'][1] < 3.6) or lv == 1][:3]
    if not R.check('%s 找得到窗景卡' % tag, bool(cards), J(w)): return
    for k, c in enumerate(cards):
        eye = inward(c, sp, 3.5); eye[1] = (s.get('y') or 0) + 1.5 if lv == 0 else 3.6 + 1.5
        nm = 'xsnight_%s_lv%d_win%d_%s' % (zone, lv, k, tn)
        cam = await D.user_shot(pg, cdp, nm, {'eye': eye, 'look': c['c'], 'lens': 24})
        rec.setdefault('shops', []).append({'name': nm + '.png', 'zone': zone, 'lv': lv, 'card': c, 'cam': cam})


async def dome(pg, cdp, tn, h, rec):
    tag = '[%s dome]' % tn
    R.setup('%s 讀檔校園（新生南路側門內）%s %05.2f' % (tag, DAY, h))
    s = await D.load_zone(pg, cdp, 'campus', DAY, h, wait=8000)
    g = await pg.evaluate(GEO); X = g['xsg']
    if not R.check('%s 校園有 Z3.XSG（新生南路側門、體育館）' % tag, bool(X and X.get('gym')), J(g)): return
    gy = mid(X['gym']); cs = (g['sg'] or {}).get('campusSpawn') or {}
    gx = X['x']; gz = X['gz'] if X.get('gz') is not None else cs.get('z', -137.0)
    d = await pg.evaluate(DOME); R.note('%s 圓頂材質 ck_glass_lit %d 個：%s；其他看起來會亮的體育館材質 %d 個：%s' % (tag, d['nLit'], J(d['lit']), d['nOther'], J(d['otherLit'])))
    rec.setdefault('dome', {})[tn] = d
    if d['nLit']:
        on = any((x['ei'] or 0) > 0 and x['emissive'] not in (None, '000000') for x in d['lit'])
        if tn == 'night': R.check('%s 晚上圓頂（ck_glass_lit）會發光（emissive 不是黑、intensity > 0）' % tag, on, J(d['lit']))
        else: R.check('%s 白天圓頂（ck_glass_lit）不發光（emissive 黑或 intensity 0）' % tag, not on, J(d['lit']))
    else: R.check('%s 這一版有圓頂材質 ck_glass_lit' % tag, False, J(d))
    for nm, eye in (('sidegate', [gx, 1.7, gz + 1.5]), ('plaza', [cs.get('x', gx), 1.7, cs.get('z', gz) + 3.0])):
        if DOME_FAR:   # 從原本那一點的方向往外退，離體育館中心 60 m、高 8 m
            dx, dz = eye[0] - gy[0], eye[2] - gy[1]; L_ = math.hypot(dx, dz) or 1.0
            eye = [gy[0] + dx / L_ * 60.0, 8.0, gy[1] + dz / L_ * 60.0]
        cam = await D.user_shot(pg, cdp, 'gymdome_%s%s_%s' % (nm, '_far' if DOME_FAR else '', tn), {'eye': eye, 'look': [gy[0], 6.0, gy[1]], 'lens': 30 if DOME_FAR else 24})
        rec['dome'][tn + '_' + nm] = cam


CARDINFO = r"""((nm)=>{ const z=GAME.E.zone; let o=null; z.group.traverse(q=>{ if(!o&&q.isMesh&&q.name===nm) o=q; }); if(!o) return null; const m=[].concat(o.material)[0], t=m&&m.map, g=o.geometry, uv=g&&g.attributes.uv;
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9; if(uv) for(let i=0;i<uv.count;i++){ const u=uv.getX(i), v=uv.getY(i); u0=Math.min(u0,u); u1=Math.max(u1,u); v0=Math.min(v0,v); v1=Math.max(v1,v); }
  const U=m&&m.uniforms, tx=q=>q&&q.image?{src:((q.image.currentSrc||q.image.src)||'').slice(-60), w:q.image.width, h:q.image.height}:null;
  const un=U?{map:tx(U.map&&U.map.value), map2:tx(U.map2&&U.map2.value), nmap:tx(U.nmap&&U.nmap.value), depth:U.depth&&U.depth.value, photo:U.photo&&U.photo.value, sxy:U.sxy&&U.sxy.value?[+U.sxy.value.x.toFixed(3),+U.sxy.value.y.toFixed(3)]:null, near:U.near&&U.near.value, xf:U.xf&&U.xf.value}:null;
  const pr=g&&g.parameters||{}, wp=new THREE.Vector3(); o.getWorldPosition(wp);
  return {type:m&&m.type, uniforms:un, plane:[pr.width,pr.height], worldPos:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], mat:m&&m.name, map:t?{src:((t.image&&(t.image.currentSrc||t.image.src))||'').slice(-60), w:t.image&&t.image.width, h:t.image&&t.image.height, repeat:[t.repeat.x,t.repeat.y], offset:[+t.offset.x.toFixed(3),+t.offset.y.toFixed(3)], flipY:t.flipY}:null,
    uv:uv?[+u0.toFixed(3),+u1.toFixed(3),+v0.toFixed(3),+v1.toFixed(3)]:null, verts:g&&g.attributes.position.count}; })"""


async def player_view(pg, cdp, tn, h, zone, rec):
    """BB-B 08:27 XS_NIGHT_player：玩家正常的跟隨鏡頭，站到窗前 1.5 m 面向窗景卡拍一張（確認玩家看到的是不是也只有天空）；印窗景卡的 UV／貼圖範圍"""
    tag = '[%s %s player]' % (tn, zone)
    s = await D.load_zone(pg, cdp, zone, DAY, h, wait=7000)
    if s['zone'] != zone: R.note('%s 讀不進店裡' % tag); return
    w = await pg.evaluate(WINS, None); cards = [c for c in w['wins'] if c['c'][1] < 3.6]
    if not R.check('%s 找得到一樓的窗景卡' % tag, bool(cards), J(w)): return
    c = cards[0]; sp = [s['x'], s['z']]
    stand = inward(c, sp, 1.5); yaw = math.atan2(c['c'][0] - stand[0], c['c'][2] - stand[2])
    ok_st = await pg.evaluate("((q)=>GAME.E.canStand(q[0],q[1],0.3,0))", [stand[0], stand[2]])
    if not ok_st: stand = inward(c, sp, 2.0); yaw = math.atan2(c['c'][0] - stand[0], c['c'][2] - stand[2])
    R.setup('%s 讀檔站在窗前 (%.2f, %.2f) 面向窗景卡（跟隨鏡頭照遊戲自己的）' % (tag, stand[0], stand[2]))
    s = await D.load_zone(pg, cdp, zone, DAY, h, x=stand[0], z=stand[2], yaw=yaw, wait=7000)
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(1500)
    m = await D.shot(pg, 'xsplayer_%s_%s' % (zone, tn))
    await pg.evaluate(D.HUD + '(true)')
    info = await pg.evaluate(CARDINFO, c['name'])
    R.note('%s 跟隨鏡頭截圖亮度 %s；窗景卡 %s 的 UV／貼圖：%s' % (tag, J(m), c['name'], J(info)))
    rec.setdefault('player', []).append({'zone': zone, 't': tn, 'stand': [round(stand[0], 2), round(stand[2], 2)], 'lum': m, 'card': c, 'cardInfo': info})


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC FA05_NIGHT（新生南路四家店窗外夜景、體育館圓頂）：SHA=%s（worktree 實際 %s）；PARTS=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', PARTS), flush=True)
    rec = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for tn, h in TIMES:
            if 'shops' in PARTS:
                for zone, lv in (('xs_dakou', 0), ('xs_dakou', 1), ('xs_dabu', 0), ('xs_haopai', 0)):
                    print('== %s %s lv%d' % (tn, zone, lv), flush=True)
                    try: await shop(pg, cdp, tn, h, zone, lv, rec)
                    except Exception as ex: R.check('[%s %s lv%d] 探針沒有例外' % (tn, zone, lv), False, repr(ex)[:300])
            if 'player' in PARTS:
                for zone in ('xs_dakou', 'xs_dabu', 'xs_haopai'):
                    print('== %s %s player' % (tn, zone), flush=True)
                    try: await player_view(pg, cdp, tn, h, zone, rec)
                    except Exception as ex: R.check('[%s %s player] 探針沒有例外' % (tn, zone), False, repr(ex)[:300])
            if 'dome' in PARTS:
                print('== %s dome' % tn, flush=True)
                try: await dome(pg, cdp, tn, h, rec)
                except Exception as ex: R.check('[%s dome] 探針沒有例外' % tn, False, repr(ex)[:300])
        with open(os.path.join(OUT, 'fa05_night.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
