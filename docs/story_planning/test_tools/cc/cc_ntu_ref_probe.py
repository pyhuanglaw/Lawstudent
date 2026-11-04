"""CC-C（帳號 C）11-04：NTU-REF-AUDIT 遊戲截圖（LAWWW-C 清單：開發分支 ea28fa410 的 docs/story_planning/ref_images/buildings/README.md
  「建議請 CC 在使用者電腦拍的遊戲截圖」那一節；BB-C 15:00 轉）。拍完交 LAWWW2 和官網照片比對，副本 BB。
  - 每處白天 11:00、晴；固定 CC_SEED；玩家、路人、騎車的路人照 cc_det.HIDE_PEOPLE_JS 藏起來；HUD 藏起來；1280×720 JPEG。
  - 戶外：清單的座標是子代理看程式估的 → 每處拍 3 張（清單的朝向、左右各偏 25°），眼睛 1.6 m（看鐘、看樓的拍 1.6 m、看 10 m 外）。
  - 室內：讀檔到那個區域的出生點，從出生點往房間中間看（區域的導航格範圍取中心；拿不到就往出生點朝向看 6 m）。
  - 只 commit 遊戲截圖；學校的照片照 list.json 用 tools/ref/fetch_ref_images.py 抓到本機比，不進 repo（CC_50 第 44 條）。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）、固定鏡頭（E.cinematic）。只截圖，不判 PASS／FAIL（比對 LAWWW2、判定 BB）。Windows＋GPU ≠ iPhone。
用法：LW_TESTS=<wt>/tests [ONLY=bell_s,admin_s,...] [HOUR=11] [CC_SEED=...] python3 cc_ntu_ref_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
HOUR = float(os.environ.get('HOUR') or 11)
ONLY = [s.strip() for s in (os.environ.get('ONLY') or '').split(',') if s.strip()]
FAILS = []
# 朝向（x 往東、−z 往北）：S＝+z、N＝−z、E＝+x、W＝−x；也可以直接給要看的點 (x, z)
DIRS = {'S': (0, 1), 'N': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
# (代號, 區域, (x, z), 朝向或看的點, 對照的照片)——清單原文照抄，座標沒改
OUTDOOR = [
    ('bell_s', 'campus', (-38, 4), 'S', '晨思鐘：大道上朝南看鐘｜bell_web_06、03'),
    ('bell_obl', 'campus', (-32, 14), (-38, 16.5), '晨思鐘：鐘旁斜看鐘＋台座｜bell_web_07'),
    ('admin_s', 'campus', (-38, 20), 'S', '行政大樓：鐘後面朝南看正面｜admin_web_11'),
    ('admin_obl', 'campus', (-20, 22), 'SW', '行政大樓：斜看門廊｜admin_web_10'),
    ('gym_door', 'campus', (74, 52), 'S', '體育館門口：朝南｜gym_web_06、05'),
    ('fwd_two', 'campus', (-93, 50), 'S', '大一女舍：舟山路上朝南看兩棟＋門口｜fwd_web_01、02'),
    ('fwd_a', 'campus', (-108, 57), 'S', '大一女舍：A 棟門口朝南｜fwd_web_02、03'),
    ('male1', 'campus', (20, 56), 'S', '男一舍：朝南看正面｜male1_web_03、01'),
    ('boya_n', 'campus', (-38, -66), 'N', '博思教學館：普通、博思之間朝北看入口｜boya_web_06、04'),
    ('boya_lake', 'campus', (-38, -98), 'S', '博思教學館：湖南岸步道朝南看北面｜boya_web_05'),
    ('putong', 'campus', (-38, -42), 'N', '普通教學館：朝北看正面｜putong_web_03'),
    ('ctb', 'campus', (2, 18), 'S', '共同教學館：朝南｜ctb_01、04'),
    ('lake_s', 'campus', (-36, -98), 'N', '映月湖：南岸朝北看湖心亭｜lake_web_02、06'),
    ('lake_e', 'campus', (-20, -112), 'W', '映月湖：東岸朝西｜lake_web_04'),
    ('linze', 'campus', (34, -88), 'N', '法律系館A（霖澤館）：前庭朝北看正面｜linze_web_02、04'),
    ('wancai', 'campus', (88, -84), 'N', '法律系館B（萬才館）：大樓梯前朝北看弧形量體＋樓梯｜wancai_web_01、02'),
    ('lib_far', 'campus', (40, 0), 'E', '總圖：大道上朝東看總圖｜library_web_02'),
    ('lib_near', 'campus', (70, 0), 'E', '總圖：前面平台下朝東看正面｜library_web_02、03'),
    ('hist', 'campus', (-77, -12), 'N', '校史館：朝北｜hist_web_14、12'),
    ('arts', 'campus', (-38, -12), 'N', '文學院：大道北側朝北｜arts_web_07、05'),
    ('guoqing', 'campus', (65, -100), 'N', '國際學苑：朝北（背景）｜guoqing_web_01'),
]
INDOOR = [
    ('male1_hall', 'dorm_hall', '男一舍：一樓門廳、交誼廳｜male1_web_05、06'),
    ('male1_203', 'dorm', '男一舍：203 房間，從門口看進去｜male1_web_07～09'),
    ('linze_hall', 'linze', '法律系館A：大廳（沒有官方照片，給使用者看）'),
    ('lib_hall', 'library_hall', '總圖：一樓大廳，朝裡面｜library_web_01'),
    ('gym_court', 'gym', '綜合體育館：球場｜gym_web_07～10'),
    ('gym_arena', 'gym_arena', '綜合體育館：主球場｜gym_web_07～10'),
    ('gym_b1', 'gym_b1', '綜合體育館：B1（游泳池）｜gym_web_07～10'),
]
DIRS['SW'] = (-0.7071, 0.7071)


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
AIM = """(async([e,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,150)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles}; })"""
# 室內：出生點、朝向、導航格範圍（拿得到就取中心）
ROOM = r"""(()=>{ const E=GAME.E, P=E.player.obj.position, n=E.nav; let c=null;
  if(n){ const cs=n.cell||n.cs||0.5, w=n.w||n.cols||n.W, h=n.h||n.rows||n.H, x0=(n.x0!=null?n.x0:(n.ox!=null?n.ox:null)), z0=(n.z0!=null?n.z0:(n.oz!=null?n.oz:null)); if(w&&h&&x0!=null&&z0!=null) c=[x0+w*cs/2, z0+h*cs/2]; }
  return {pos:[+P.x.toFixed(2), +P.z.toFixed(2)], yaw:E.player.obj.rotation.y, center:c?c.map(v=>+v.toFixed(2)):null, zone:GAME.G.zone, zones:Object.keys(Z3.ZONES)}; })()"""


async def stable(pg, cap=90):
    last = -1; st = 0; t1 = time.time()
    while time.time() - t1 < cap:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 4: break
    return last, time.time() - t1


async def load(pg, cdp, zone, pos=None):
    st = {'zone': zone, 'hour': HOUR, 'day': 7, 'weekday': 2, 'weather': 'clear'}
    if pos: st['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': 0, 'lv': 0}
    await L.load_state(pg, st, quiet_events=True)
    n, sec = await stable(pg)
    await L.close_panels(pg, cdp)
    return n, sec


async def shot(pg, name, e, l, meta, note):
    await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
    await pg.evaluate(cc_det.HIDE_LABELS_JS)   # 門上浮著的出口標籤（guide3d.js）會蓋在建築上
    ri = await pg.evaluate(AIM + '(%s)' % J([e, l]))
    await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, name + '.jpg'), type='jpeg', quality=88)
    meta[name] = dict(ri, cam=e, look=l, note=note)
    print('  %s：calls %s、tris %s｜%s' % (name, ri['calls'], ri['tris'], note), flush=True)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC NTU-REF-AUDIT 遊戲截圖：%02d:00、晴；SHA=%s；Windows＋GPU ≠ iPhone' % (int(HOUR), os.environ.get('SHA', '?')), flush=True)
    meta = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
        outs = [o for o in OUTDOOR if not ONLY or o[0] in ONLY]
        if outs:
            print('  [前置／捷徑] 讀檔：校園 (%s, %s)、2025-09-23（二）%02d:00、晴、條件事件關閉' % (outs[0][2][0], outs[0][2][1], int(HOUR)), flush=True)
            n, sec = await load(pg, cdp, 'campus', outs[0][2])
            check('讀檔進到校園（場景 mesh %s、%.0f 秒穩定）' % (n, sec), await pg.evaluate("GAME.G.zone==='campus'"), '')
            await pg.evaluate(HUD + '(false)')
            for key, zone, (x, z), d, note in outs:
                if isinstance(d, tuple): dx, dz = d[0] - x, d[1] - z; nn = math.hypot(dx, dz) or 1; dx, dz = dx / nn, dz / nn
                else: dx, dz = DIRS[d]
                a0 = math.atan2(dx, dz)
                for tag, da in (('c', 0.0), ('l', math.radians(25)), ('r', -math.radians(25))):
                    a = a0 + da; e = [x, 1.6, z]; l = [round(x + math.sin(a) * 10, 3), 1.6 + (0.6 if key.startswith('bell') else 1.2), round(z + math.cos(a) * 10, 3)]
                    await shot(pg, 'ref_%s_%s' % (key, tag), e, l, meta, note + ('' if tag == 'c' else '（偏 %s 25°）' % ('左' if tag == 'l' else '右')))
            await pg.evaluate(HUD + '(true)')
        ins = [o for o in INDOOR if not ONLY or o[0] in ONLY]
        zones = await pg.evaluate("Object.keys(Z3.ZONES)")
        for key, zone, note in ins:
            if zone not in zones:
                print('INFO %s：遊戲裡沒有區域 %s（%s）' % (key, zone, note), flush=True); continue
            print('  [前置／捷徑] 讀檔：%s 的出生點、%02d:00' % (zone, int(HOUR)), flush=True)
            n, sec = await load(pg, cdp, zone)
            if not check('讀檔進到 %s（場景 mesh %s、%.0f 秒穩定）' % (zone, n, sec), await pg.evaluate("GAME.G.zone===%s" % J(zone)), ''): continue
            await pg.evaluate(HUD + '(false)')
            r = await pg.evaluate(ROOM)
            x, z = r['pos']
            if r['center'] and math.hypot(r['center'][0] - x, r['center'][1] - z) > 1.0: lx, lz = r['center']; how = '往導航格中心 (%s, %s)' % (lx, lz)
            else: lx, lz = x - math.sin(r['yaw']) * 6, z - math.cos(r['yaw']) * 6; how = '往出生點朝向 6 m'
            await shot(pg, 'ref_%s' % key, [x, 1.6, z], [round(lx, 3), 1.4, round(lz, 3)], meta, note + '（出生點 (%s, %s)，%s）' % (x, z, how))
            await pg.evaluate(HUD + '(true)')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'ntu_ref.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('INFO 共 %d 張（只有遊戲截圖；學校照片用 tools/ref/fetch_ref_images.py 抓到本機比）' % len(meta), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
