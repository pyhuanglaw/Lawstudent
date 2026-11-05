"""CC-C（帳號 C）11-05：V21R 加的店（BB-C 08:30／08:40，最終 SHA 83d09d13b）——只擋 D141 五種（走不到、坐不下、穿模、卡住、黑畫面）＋流程卡住。
  PARTS（預設全部）：
    seats    林家（wz_lin）、日和（cvs）、日常失速（wz_offbeat）、Daybreak（daybreak）：每一張玩家能坐的位子照玩家「點椅子」走過去坐下、起身走開（D.sit_all）；
             Daybreak 那 4 張（BB-C 08:40：窗邊 (−1.5, 3.45)、長桌 (−4.2, 0.3)、(−4.2, 1.5)、卡座 (2.05, −3.5)）另外列一行；長桌西側兩張擦桌角約 0.1 m＝已知，不算 FAIL（這支也不量穿模）。
    acts     同四間：每一個互動點（不是座位、不是出口）走到範圍裡、按鈕是它（不按，避免花錢、跳時間）。
    windows  換窗景的五間（青木 aoki、頁間 bookstore、Daybreak daybreak、小路 wz_teishoku、日常失速 wz_offbeat）：從街上照玩家走進店門 → 店裡截圖（白天、晚上；照營業時間挑時間）→ 照玩家走出來回到街上。
             窗景卡（名字有 VIEW 的面）記用的照片；截圖從店裡往窗景卡看。
  營業時間照 PLACES.isOpen；那一段沒開就往後找有開的時間（記下來）。
  【前置／捷徑】讀檔到店門外 2 m 或店裡出生點（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [PARTS=seats,acts,windows] [ONLY=daybreak,aoki] python3 cc_v21x_shops_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
PARTS = [x for x in (os.environ.get('PARTS') or 'seats,acts,windows').split(',') if x]
ONLY = [x for x in (os.environ.get('ONLY') or '').split(',') if x]
R = L.Run('v21x_shops', OUT); D.setup(R, OUT)
DAY = '2025-10-18'   # 星期六
STREET = {'wz_lin': 'wenzhou', 'wz_offbeat': 'wenzhou', 'wz_teishoku': 'wenzhou', 'cvs': 'gongguan', 'daybreak': 'gongguan', 'aoki': 'gongguan', 'bookstore': 'gongguan'}
SEAT_SHOPS = ['wz_lin', 'cvs', 'wz_offbeat', 'daybreak']
ACT_SHOPS = ['wz_lin', 'cvs', 'wz_offbeat', 'daybreak']
WIN_SHOPS = ['aoki', 'bookstore', 'daybreak', 'wz_teishoku', 'wz_offbeat']
DB4 = [(-1.5, 3.45, '窗邊'), (-4.2, 0.3, '長桌（西側，擦桌角已知）'), (-4.2, 1.5, '長桌（西側，擦桌角已知）'), (2.05, -3.5, '卡座')]
OPEN_AT = r"""((a)=>{ const [z,day,prefs]=a; const ok=h=>{ try{ return typeof PLACES==='undefined'||!PLACES.isOpen||!!PLACES.isOpen(z,h,day); }catch(e){ return true; } };
  for(const h of prefs) if(ok(h)) return h; for(let h=8;h<26;h+=0.5) if(ok(h%24)) return h%24; return null; })"""
ACTS = r"""(()=>GAME.E.interactables.filter(i=>!i.hidden&&!i.seat&&!i.exit&&i.label).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||0.9, lv:i.lv|0})))()"""
VIEWS = r"""(()=>{ const E=GAME.E, z=E.zone, out=[]; z.group.traverse(o=>{ if(o.isMesh&&/VIEW/i.test(o.name)&&o.visible!==false){ o.updateWorldMatrix(true,false); const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); const m=[].concat(o.material)[0];
  out.push({name:o.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)], url:(m&&m.map&&m.map.userData&&m.map.userData.url)||(m&&m.map&&m.map.image&&m.map.image.src||'').slice(-60)}); } }); const sp=z.spawn||{x:0,z:0}; return {views:out, spawn:[sp.x,sp.z]}; })()"""


async def day_of(pg):
    return await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })('%s')" % DAY)


async def open_hour(pg, zone, prefs):
    return await pg.evaluate(OPEN_AT, [zone, await day_of(pg), prefs])


async def clear_ui(pg, cdp, n=24):
    for _ in range(n):
        q = await D.st(pg)
        if not q['dlg'] and not q['busy'] and not q['choices']: return q
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        elif q['choices']: await L.tap(pg, cdp, '#choices button:last-child')
        await pg.wait_for_timeout(500)
    return await D.st(pg)


async def part_seats(pg, cdp, zone):
    h = await open_hour(pg, zone, [14.0, 12.25, 15.0, 19.0, 21.0])
    R.setup('[seats %s] 讀檔店裡（出生點）%s %s（PLACES.isOpen 挑有開的時間）' % (zone, DAY, h))
    s = await D.load_zone(pg, cdp, zone, DAY, h if h is not None else 14.0, wait=6000)
    if not R.check('[seats %s] 讀到店裡' % zone, s['zone'] == zone, J(s)): return
    await clear_ui(pg, cdp)
    res = await D.sit_all(pg, cdp, '[seats %s]' % zone, 'seat_%s' % zone, max_walk=240)
    R.note('[seats %s] 每一張：%s' % (zone, J(res)))
    if zone == 'daybreak':
        seats = await pg.evaluate(D.SEATS)
        for x, z, nm in DB4:
            k = next((i for i, q in enumerate(seats) if abs(q['sx'] - x) < 0.06 and abs(q['sz'] - z) < 0.06), None)
            r = res[k] if k is not None and k < len(res) else None
            R.check('[seats daybreak] BB-C 08:40 那 4 張之一：%s (%s, %s) 點椅子坐下、起身走開（擦桌角不判）' % (nm, x, z), bool(r) and r[1] == 'ok', J({'k': k, 'res': r}))


async def part_acts(pg, cdp, zone):
    h = await open_hour(pg, zone, [14.0, 12.25, 15.0, 19.0, 21.0])
    R.setup('[acts %s] 讀檔店裡 %s %s' % (zone, DAY, h))
    s = await D.load_zone(pg, cdp, zone, DAY, h if h is not None else 14.0, wait=6000)
    if not R.check('[acts %s] 讀到店裡' % zone, s['zone'] == zone, J(s)): return
    await clear_ui(pg, cdp)
    acts = await pg.evaluate(ACTS)
    R.note('[acts %s] 互動點 %d 個：%s' % (zone, len(acts), J(acts)))
    for a in acts:
        tgt = await D.standable_near(pg, a['x'], a['z'], a['r'] * 0.6, a['lv'])
        if not R.check('[acts %s] 「%s」(%s, %s) 範圍裡有站得住的地方' % (zone, a['label'], a['x'], a['z']), bool(tgt), J(a)): continue
        fb0 = (await D.st(pg))['fb']
        await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.12, '[acts %s] %s' % (zone, a['label']), max_s=180, lv=a['lv'])
        q = await D.settle(pg)
        for _ in range(6):
            if q['interact'].startswith(a['label'][:6]): break
            await pg.wait_for_timeout(500); q = await D.st(pg)
        R.check('[acts %s] 照玩家走到「%s」，按鈕是它（自動放過去 0 次）' % (zone, a['label']), q['interact'].startswith(a['label'][:6]) and q['fb'] == fb0, J({k: q[k] for k in ('x', 'z', 'lv', 'interact', 'stand', 'fb')}))


async def part_windows(pg, cdp, zone):
    street = STREET[zone]
    for tn, prefs in (('day', [14.0, 15.0, 13.0, 18.5]), ('night', [21.0, 20.5, 22.0, 23.0, 0.5])):
        h = await open_hour(pg, zone, prefs)
        if h is None: R.note('[windows %s %s] 這一天找不到有開的時間，不拍' % (zone, tn)); continue
        # 先在街上找店門
        R.setup('[windows %s %s] 讀檔 %s %s %05.2f（出生點），找「進店」的門' % (zone, tn, street, DAY, h))
        s = await D.load_zone(pg, cdp, street, DAY, h, wait=6000)
        door = await pg.evaluate("((to)=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to&&!i.hidden); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:i.lv|0}:null; })", zone)
        if not R.check('[windows %s %s] %s 有進 %s 的門' % (zone, tn, street, zone), bool(door), J(door)): continue
        near = await D.standable_near(pg, door['x'], door['z'], 3.0)
        R.setup('[windows %s %s] 讀檔到店門外 (%s, %s)（門 %s）' % (zone, tn, near and near['x'], near and near['z'], J(door)))
        if near: s = await D.load_zone(pg, cdp, street, DAY, h, near['x'], near['z'], 0.0, wait=5000)
        await clear_ui(pg, cdp)
        s = await D.use_exit(pg, cdp, '[windows %s %s]' % (zone, tn), door['label'][:4], zone, pred=lambda e: e['to'] == zone)
        if not s: continue
        await clear_ui(pg, cdp)
        v = None
        for _ in range(20):
            v = await pg.evaluate(VIEWS)
            if v['views'] and all(x['url'] for x in v['views']): break
            await pg.wait_for_timeout(500)
        R.note('[windows %s %s] 窗景卡：%s' % (zone, tn, J(v)))
        R.check('[windows %s %s] 店裡有窗景卡（名字有 VIEW）' % (zone, tn), bool(v['views']), J(v))
        sp = v['spawn']
        for k, w in enumerate(v['views'][:2]):
            c = w['c']; thin = 'x' if w['size'][0] < w['size'][2] else 'z'
            if thin == 'x': d = 1 if sp[0] > c[0] else -1; eye = [c[0] + d * 4.5, 1.5, c[2]]
            else: d = 1 if sp[1] > c[2] else -1; eye = [c[0], 1.5, c[2] + d * 4.5]
            await D.user_shot(pg, cdp, 'win_%s_%s_%d' % (zone, tn, k), {'eye': eye, 'look': [c[0], max(1.3, c[1]), c[2]], 'lens': 24})
        await D.user_shot(pg, cdp, 'win_%s_%s_spawn' % (zone, tn), {'eye': [sp[0], 1.6, sp[1]], 'look': (v['views'][0]['c'] if v['views'] else [0, 1.5, 0]), 'lens': 22})
        out = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&!i.hidden); return i?{label:i.label,to:i.exit.to}:null; })()")
        if out: await D.use_exit(pg, cdp, '[windows %s %s] 出店' % (zone, tn), out['label'][:4], out['to'])


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC V21X_SHOPS（林家、日和、日常失速、Daybreak 座位／互動點；五間換窗景的店）：SHA=%s（worktree 實際 %s）；PARTS=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        have = await pg.evaluate("Object.keys(Z3.ZONES)")
        for part, shops, fn in (('seats', SEAT_SHOPS, part_seats), ('acts', ACT_SHOPS, part_acts), ('windows', WIN_SHOPS, part_windows)):
            if part not in PARTS: continue
            for z in shops:
                if ONLY and z not in ONLY: continue
                if not R.check('[%s] 這一版有 %s（Z3.ZONES）' % (part, z), z in have): continue
                print('== %s %s' % (part, z), flush=True)
                try: await fn(pg, cdp, z)
                except Exception as ex: R.check('[%s %s] 探針沒有例外' % (part, z), False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
