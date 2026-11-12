"""CC-C 11-12：US-NAV-TRAPS-1111 瀏覽器驗收（判準 BB-C 03:53 核准；CC-C → BB-C 03:5x 草稿 A～D）。判定歸 BB；Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
受測：LAWWW 正式 SHA be1e5d7256（含 d7fe9c9ca0：src/us3d.js 超市街 navFix、src/us_clubhouse3d.js band(3.0,3.2,0.15,0.55)）；對照：修改前 fe347b5e8c（D34）。
根據：tests/us_nav_traps_1111_unit.js（Node 推 2 秒、16 個方向各推 3 秒、canStand 0.3）、LAWWW2 28dc66ce64 README（兩個縫的座標、「從北邊斜著」）。
兩個縫：① us_market_street 燈桿 (27,−3.5) 和兩台車車頭中間 x 27.8～27.9、z −4.0～−3.6；② us_clubhouse_in 櫃台東頭 x 3.0～3.2、z 0.15～0.55。
A 推得進去、出得來：每個縫 3 個起點（縫中心外 0.4～1.0 m、站得住；①第一個是最北邊那個），每個起點 走／跑 × 原速／10 fps 各 REPS（預設 5）次：
    【前置／捷徑】把人放到起點（直接設位置、清路線）→ 搖桿固定往縫中心推 2 秒 → 16 個方向（先試反方向）各推 3 秒，有一個離開 ≥0.5 m＝出得來；都不行＝卡住（記座標、截圖）。
    PASS：新版 0 次卡住、E.unstick 0 次（遊戲自己把人推出來不算過）、沒有 JS 例外。修改前也 0 次＝記「瀏覽器重現不了」（BB：新版 0 次卡住、0 次 unstick 就算 PASS）。
B 點地進縫：從第一個起點點縫中心 3 次；PASS＝人沒停在縫裡（外擴 0.1 m 判），之後搖桿推得走 ≥0.3 m。
C AA_814 兩個點：3-1 us_shared 廚房 (−3, 1.8) 2028-09-13 18:45、3-2 us_outside 社區門口 (−35, 0) 2028-12-16 07:16（日期照 src/r2y4a3d.js）：讀到那一區、站得住、四個方向至少一個推得走 ≥0.3 m。
D 截圖（只記錄）：兩個縫各一張同角度（另一台相機，看得到燈桿、車、牆；不藏玩家），新、舊各一張。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4n/a（只按搖桿、#btnRun，不點畫面上的選項；B 點地記遊戲落點） 5✓ 6✓ 7✓ 8✓ 9n/a（BB 核准：縫的截圖要看到燈桿、車、牆，不藏玩家） 10n/a（沒有選單；讀檔關條件事件） 11✓ 12✓ 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [PARTS=A,B,C,D] [SEAMS=1,2] [REPS=5] python3 cc_us_nav_traps_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
PARTS = [p.strip() for p in (os.environ.get('PARTS') or 'A,B,C,D').split(',') if p.strip()]
SEAMS = [s.strip() for s in (os.environ.get('SEAMS') or '1,2').split(',') if s.strip()]
REPS = int(os.environ.get('REPS') or '5')
R = L.Run('usnav_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2028-10-12'   # 交換那學期的一個週四（src/r2y4a3d.js：9/13 到、12/16 走）
SEAM = {'1': {'zone': 'us_market_street', 'name': '超市街燈桿和車頭中間', 'c': (27.85, -3.8), 'rect': (27.8, 27.9, -4.0, -3.6), 'north': True,
              'cam': ((23.5, 4.2, -9.5), (27.85, 0.6, -3.8))},
        '2': {'zone': 'us_clubhouse_in', 'name': '會所櫃台東頭牆裡', 'c': (3.1, 0.35), 'rect': (3.0, 3.2, 0.15, 0.55), 'north': False,
              'cam': ((0.6, 2.4, 2.8), (3.1, 0.8, 0.35))}}
UNSTICK_JS = r"""(()=>{ const E=GAME.E; if(!E||E.__ccUnw||!E.unstick) return window.__ccUnstick|0; const f=E.unstick; E.unstick=function(){ const r=f.apply(this,arguments); if(r) window.__ccUnstick=(window.__ccUnstick|0)+1; return r; }; E.__ccUnw=1; return window.__ccUnstick|0; })()"""   # 同 cc_stair_probe.py
FPSCAP_JS = r"""(cap=>{ const W=window; if(!W.__rafOrig) W.__rafOrig=W.requestAnimationFrame.bind(W); const orig=W.__rafOrig;
  if(!cap){ W.requestAnimationFrame=orig; W.__fpsCap=0; return 0; } const gap=1000/cap; W.__fpsCap=cap; let last=0;
  W.requestAnimationFrame=cb=>orig(function tick(t){ if(t===last||t-last>=gap-1){ last=t; cb(t); } else orig(tick); }); return cap; })"""   # 同 cc_stair_probe.py（【前置／捷徑】只改幀率）
POS_JS = "(()=>{ const P=GAME.E.player, o=P.obj.position, f=v=>+(+v).toFixed(3); return {x:f(o.x), z:f(o.z), y:f(o.y), lv:P.lv|0, run:!!P.runHold, zone:GAME.G.zone}; })()"
STARTS_JS = r"""(a=>{ const E=GAME.E, out=[]; for(const d of [0.4,0.6,0.8,1.0]) for(let k=0;k<24;k++){ const t=k*Math.PI/12, x=a.c[0]+Math.sin(t)*d, z=a.c[1]+Math.cos(t)*d;
    if(x>=a.r[0]-0.1&&x<=a.r[1]+0.1&&z>=a.r[2]-0.1&&z<=a.r[3]+0.1) continue; if(E.canStand(x,z,0.3,0)) out.push({x:+x.toFixed(3), z:+z.toFixed(3), d, ang:k*15}); }
  return out; })"""
PLACE_JS = "(a=>{ const P=GAME.E.player; P.path=null; P.onArrive=null; P.obj.position.x=a[0]; P.obj.position.z=a[1]; P.lv=0; return true; })"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||55, c.width/c.height, 0.05, 1000); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  r.render(E.scene,cam); return c.toDataURL('image/png'); })"""   # 同 cc_xs_gate_probe.py（這裡不藏玩家：BB 核准）


def inside(p, rect, pad=0.1):
    return rect[0] - pad <= p['x'] <= rect[1] + pad and rect[2] - pad <= p['z'] <= rect[3] + pad


async def push_world(pg, cdp, wx, wz, ms):
    """搖桿往世界方向 (wx, wz) 推 ms 毫秒（照當下鏡頭換算；同 cc_dlgfx_probe.py 追人的換算）"""
    yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
    sx, sy = wx * rx + wz * rz, -(wx * fx + wz * fz); m = math.hypot(sx, sy) or 1
    await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, ms)


async def set_mode(pg, cdp, run, fps):
    await pg.evaluate(FPSCAP_JS, fps)
    on = await pg.evaluate("!!GAME.E.player.runHold")
    if on != run: await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(400)
    return await pg.evaluate("!!GAME.E.player.runHold") == run


async def escape(pg, cdp, p0, push_dir):
    """16 個方向各推 3 秒（先試和剛才推進去相反的方向），有一個離開 p0 ≥0.5 m＝出得來"""
    a0 = math.atan2(-push_dir[0], -push_dir[1]); tried = 0
    for k in range(16):
        a = a0 + k * math.pi / 8   # 第 0 個＝反方向，之後每次轉 22.5°
        await push_world(pg, cdp, math.sin(a), math.cos(a), 3000); tried += 1
        q = await pg.evaluate(POS_JS)
        if math.hypot(q['x'] - p0['x'], q['z'] - p0['z']) >= 0.5: return True, tried, q
    return False, tried, await pg.evaluate(POS_JS)


async def load_seam(pg, cdp, key, x, z, why):
    S = SEAM[key]; s = await D.load_zone(pg, cdp, S['zone'], DAY, 14.0, x=x, z=z, yaw=0.0, wait=8000)
    await pg.evaluate(UNSTICK_JS); R.setup('[縫%s %s] 【前置／捷徑】讀檔到 %s %s 14:00 (%.2f, %.2f)；%s' % (key, S['name'], S['zone'], DAY, x, z, why))
    return s


async def part_a(pg, cdp, key, errs):
    S = SEAM[key]; t = '[A 縫%s %s]' % (key, S['name'])
    s = await load_seam(pg, cdp, key, S['c'][0], S['c'][1] + 1.5, '先讀進區域，找起點')
    if not R.check('%s 讀到 %s' % (t, S['zone']), s['zone'] == S['zone'], J(s)): return
    c = await pg.evaluate(STARTS_JS, {'c': list(S['c']), 'r': list(S['rect'])})
    if not R.check('%s 縫中心外 0.4～1.0 m 有站得住的起點' % t, bool(c), ''): return
    starts = []
    if S['north']: starts.append(min(c, key=lambda q: q['z']))   # README：①「從北邊斜著走得進去」（−z＝北）
    for q in sorted(c, key=lambda q: q['ang']):
        if len(starts) >= 3: break
        if all(abs(((q['ang'] - s2['ang'] + 180) % 360) - 180) >= 90 for s2 in starts): starts.append(q)
    for q in c:
        if len(starts) >= 3: break
        if q not in starts: starts.append(q)
    R.note('%s 站得住的候選 %d 個；用的起點 %s' % (t, len(c), J(starts)))
    u0 = await pg.evaluate(UNSTICK_JS); e0 = len(errs); stuck = []; ins = 0; n = 0; rows = []
    for si, sp in enumerate(starts):
        for run in (False, True):
            for fps in (0, 10):
                ok = await set_mode(pg, cdp, run, fps)
                if not ok: R.note('%s 切換跑步 %s 沒成功' % (t, run))
                for rep in range(REPS):
                    q0 = await pg.evaluate(POS_JS)
                    if q0['zone'] != S['zone']: R.note('%s 區域變成 %s（走出去了？）：重讀' % (t, q0['zone'])); await load_seam(pg, cdp, key, sp['x'], sp['z'], '重讀'); await set_mode(pg, cdp, run, fps)
                    await pg.evaluate(PLACE_JS, [sp['x'], sp['z']]); await pg.wait_for_timeout(500)
                    dx, dz = S['c'][0] - sp['x'], S['c'][1] - sp['z']; m = math.hypot(dx, dz) or 1
                    await push_world(pg, cdp, dx / m, dz / m, 2000); p1 = await pg.evaluate(POS_JS); n += 1
                    inn = inside(p1, S['rect']); ins += inn
                    out, tried, p2 = await escape(pg, cdp, p1, (dx / m, dz / m))
                    rows.append({'start': si, 'run': run, 'fps': fps, 'rep': rep, 'after_push': p1, 'inside': inn, 'out': out, 'tried': tried})
                    if not out:
                        stuck.append(rows[-1]); await D.shot(pg, 'usnav_%s_seam%s_stuck%d' % (TAG, key, len(stuck)))
                        R.note('%s 卡住：起點 %d %s%s 第 %d 次，推完在 %s，16 個方向都出不來' % (t, si + 1, '跑' if run else '走', '、10 fps' if fps else '', rep + 1, J(p1)))
    await set_mode(pg, cdp, False, 0)
    u1 = await pg.evaluate(UNSTICK_JS)
    R.note('%s 推了 %d 次；推完在縫裡（外擴 0.1 m）%d 次；卡住 %d 次；E.unstick %d 次' % (t, n, ins, len(stuck), u1 - u0))
    open(os.path.join(OUT, 'usnav_%s_A%s.json' % (TAG, key)), 'w', encoding='utf-8').write(J({'starts': starts, 'rows': rows}))
    R.check('%s 0 次卡住（推進去以後 16 個方向都出不來）' % t, not stuck, J(stuck[:3]))
    R.check('%s E.unstick 0 次（遊戲自己把人推出來不算過）' % t, u1 == u0, J([u0, u1]))
    R.check('%s 沒有 JS 例外' % t, len(errs) == e0, J(errs[e0:e0 + 3]))
    if TAG == 'old' and not stuck: R.note('%s 【修改前】瀏覽器 0 次卡住＝瀏覽器重現不了（BB 03:53：新版 0 次卡住、0 次 unstick 就算 PASS）' % t)
    return starts


async def part_b(pg, cdp, key, starts):
    S = SEAM[key]; t = '[B 縫%s %s]' % (key, S['name'])
    sp = (starts or [{'x': S['c'][0], 'z': S['c'][1] - 1.0}])[0]
    for k in range(3):
        await load_seam(pg, cdp, key, sp['x'], sp['z'], '點地第 %d 次的起點' % (k + 1))
        pt = await L.tap_ground(pg, cdp, S['c'][0], S['c'][1], lv=0)
        if not pt: await L.turn_camera_to(pg, cdp, S['c'][0], S['c'][1]); pt = await L.tap_ground(pg, cdp, S['c'][0], S['c'][1], lv=0)
        await pg.wait_for_timeout(5000); p = await pg.evaluate(POS_JS)
        mv = await D.pushable(pg, cdp)
        R.note('%s 第 %d 次點縫中心：點到 %s；停在 %s；之後搖桿推 %s m' % (t, k + 1, J(pt), J(p), mv))
        R.check('%s 第 %d 次：點到畫面（不是沒點到）' % (t, k + 1), bool(pt), '')
        R.check('%s 第 %d 次：人沒停在縫裡、之後推得走 ≥0.3 m' % (t, k + 1), (not inside(p, S['rect'])) and mv >= 0.3, J({'pos': p, 'moved': mv}))


async def part_c(pg, cdp):
    for nm, zone, day, h, x, z in (('3-1 C 棟廚房', 'us_shared', '2028-09-13', 18.75, -3.0, 1.8), ('3-2 社區門口', 'us_outside', '2028-12-16', 7.27, -35.0, 0.0)):
        t = '[C AA_814 %s]' % nm
        s = await D.load_zone(pg, cdp, zone, day, h, x=x, z=z, yaw=0.0, wait=8000)
        R.setup('%s 【前置／捷徑】讀檔到 %s %s %.2f 時 (%.1f, %.1f)（src/r2y4a3d.js 的出生點）' % (t, zone, day, h, x, z))
        p = await pg.evaluate(POS_JS); sd = await pg.evaluate("(a=>GAME.E.canStand(a[0],a[1],0.3,a[2]))", [p['x'], p['z'], p['lv']])
        await D.shot(pg, 'usnav_%s_C_%s' % (TAG, zone))
        R.check('%s 讀到 %s、站得住' % (t, zone), s['zone'] == zone and bool(sd), J({'st': s, 'pos': p, 'stand': sd}))
        mv = await D.pushable(pg, cdp)
        R.check('%s 四個方向至少一個推得走 ≥0.3 m' % t, mv >= 0.3, J(mv))


async def part_d(pg, cdp, key):
    S = SEAM[key]; await load_seam(pg, cdp, key, S['c'][0] - 1.5, S['c'][1] - 1.5, '截圖')
    await pg.wait_for_timeout(3000)
    u = await pg.evaluate(SNAP, {'from': list(S['cam'][0]), 'at': list(S['cam'][1]), 'fov': 55})
    fn = 'usnav_%s_D_seam%s.png' % (TAG, key); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    R.note('[D 縫%s] 截圖 %s（新、舊同一台相機：%s → %s）' % (key, fn, S['cam'][0], S['cam'][1]))


async def main():
    print('CC US-NAV-TRAPS 瀏覽器：TAG %s；SHA %s；PARTS %s；SEAMS %s；REPS %d；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(PARTS), ','.join(SEAMS), REPS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for key in SEAMS:
            starts = None
            if 'A' in PARTS:
                try: starts = await part_a(pg, cdp, key, errs)
                except Exception as e: R.check('[A 縫%s] 沒有中斷' % key, False, repr(e)[:300])
            if 'B' in PARTS:
                try: await part_b(pg, cdp, key, starts)
                except Exception as e: R.check('[B 縫%s] 沒有中斷' % key, False, repr(e)[:300])
            if 'D' in PARTS:
                try: await part_d(pg, cdp, key)
                except Exception as e: R.note('[D 縫%s] 截圖失敗 %r' % (key, e))
        if 'C' in PARTS:
            try: await part_c(pg, cdp)
            except Exception as e: R.check('[C] 沒有中斷', False, repr(e)[:300])
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
