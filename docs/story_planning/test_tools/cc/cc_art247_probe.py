# -*- coding: utf-8 -*-
"""CC（帳號 A）11-02：BB_247「美術積壓 47 項」裡 5 項要補的畫面證據（截圖探針，只拍證據、不判美術）。
不是 iPhone：雲端是 Playwright 手機模擬（SwiftShader，每秒幾格，閃爍看不出來，只驗證探針會跑）；正式拍要排到使用者的 PC（gpu_wrap.py：headed＋顯示卡，CC_HEADLESS=0）。
截圖一律橫向 844×390；每個 case 另外存幾張直向 390×844（同一個頁面 set_viewport_size，檔名 _port）。

用法：  [CASES=coplanar,lightband,nightrereg,uskitchen] [LW_TESTS=<工作樹>/tests] python3 cc_art247_probe.py <URL index.html> <輸出資料夾>
        python3 cc_art247_probe.py diff <資料夾> [前綴]      ＝只算連拍相鄰兩張的像素差異（PIL），寫 <資料夾>/diff_<前綴>.json
環境變數：CASES（預設四個都跑）、SETTLE（換鏡頭後等幾毫秒，預設 2500）、WARM（進區域後等幾毫秒讓正式模型載入，預設 6000）、
        BURST（連拍張數，預設 10）、BURST_MS（連拍間隔，預設 200）、YAW_STEP（繞圈每幾度，預設 30）、PORT（1＝存直向，預設 1）、
        CO_SPOTS（coplanar 的位置，預設 wancai_front,wzpark_pavilion；另有 wzpark_notice、linze_front）、DAY（讀檔的日子，預設 8）。

五項（BB_247 表格；開發分支 docs/handoff/tasks.json）：
 coplanar   BUG-COPLANAR-DEV（萬才館正面 GLB）、BACKLOG-A7-WZPARK-COPLANAR（溫州街小公園涼亭／土地公、公布欄）：
            【前置／捷徑】讀檔把玩家放到那一點、【捷徑】E.cam.yaw 對準建築；鏡頭不動，連拍 BURST 張（間隔 BURST_MS），記每張的實際時間戳。
            diff：相鄰兩張每個像素 RGB 最大差 > 24 算「變了」，記比例與 bbox（diff_<spot>.json），方便 BB 找閃的那幾格。人物待機呼吸、HUD 時鐘也會造成小差異。
 lightband  BUG-LIGHTBAND：總圖大廳一樓（library_hall）、舊路書房（bookstore）14:00，【前置／捷徑】讀檔把玩家放在靠門廳細牆段／門框那一側，
            【捷徑】改 E.cam.yaw 繞一圈（每 YAW_STEP 度一張，預設 12 張）——跟隨鏡頭照常淡出牆（fadeWalls／hideFaded 不動）。
 nightrereg BUG-NIGHT-REREG-1018：順序 A＝【前置／捷徑】讀檔 14:00 溫州街 Café 門口 → 按互動鈕「進入兩點半 Café」→ 按「離開咖啡廳」→【捷徑】GAME.advance(+5.5) 到 19:30
            → 拍溫州街（Café 正面、街屋）→ 再按互動鈕進 Café 拍窗；順序 B＝讀檔 19:30 → 進 Café → 出來 →【捷徑】GAME.advance(−5.5) 倒撥回 14:00（遊戲沒有倒撥的介面）→ 同上。
            每一步記 G.zone、G.hour、夜間材質（溫州街 WZ_NIGHT、Café CAFE_NIGHT 的材質名）的 emissiveIntensity，和照 zoneTime 算的應有值比（只記 INFO，不算 PASS/FAIL）。
 uskitchen  BUG-US-KITCHEN-1018：us_apartment 14:00，【前置／捷徑】讀檔站在冰箱、爐子的互動點（找離 layout 冰箱 (-4.2,1.8)、爐子 (-3.4,2.7) 最近的互動點），
            面向那個家具，鏡頭不動（自然跟隨），讀 #interactLabel（畫面上的互動字）和玩家位置。
每個 case 寫 <輸出>/<case>.json（每張圖：檔名、G.zone、E.zone.id、G.hour、玩家 x/y/z/lv、E.cam.yaw、時間戳 t0／t1、E.frame）。
PASS 只看「該拍的都拍到了（檔案存在、非空）、區域和時間都對」；最後一行 ALL PASS 或 FAILED n。"""
import os, sys, json, math, time, asyncio, datetime

J = lambda o: json.dumps(o, ensure_ascii=False)


# ---------------------------------------------------------------- diff（PIL；沒有 PIL 就跳過並寫明）
def diff_series(files, thr=24):
    try:
        from PIL import Image, ImageChops
    except ImportError:
        return {'skipped': '沒有 PIL（pip 的 Pillow），沒算差異'}
    out = []
    prev = None
    for f in files:
        im = Image.open(f).convert('RGB')
        if prev is not None:
            a, b = prev[1], im
            if a.size != b.size:
                out.append({'a': os.path.basename(prev[0]), 'b': os.path.basename(f), 'err': 'size %s vs %s' % (a.size, b.size)})
            else:
                d = ImageChops.difference(a, b)
                r, g, bl = d.split()
                m = ImageChops.lighter(ImageChops.lighter(r, g), bl).point(lambda v: 255 if v > thr else 0)
                n = sum(m.histogram()[255:])
                tot = a.size[0] * a.size[1]
                out.append({'a': os.path.basename(prev[0]), 'b': os.path.basename(f), 'changedPx': n, 'ratio': round(n / tot, 5), 'bbox': m.getbbox()})
        prev = (f, im)
    return {'thr': thr, 'pairs': out, 'maxRatio': max([p.get('ratio', 0) for p in out] or [0])}


def diff_cli(folder, prefix=''):
    fs = sorted(os.path.join(folder, f) for f in os.listdir(folder) if f.endswith('.png') and f.startswith(prefix) and '_port' not in f)
    res = diff_series(fs)
    p = os.path.join(folder, 'diff_%s.json' % (prefix or 'all'))
    json.dump(res, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(p, J({k: v for k, v in res.items() if k != 'pairs'}))
    return 0


if len(sys.argv) >= 3 and sys.argv[1] == 'diff':
    sys.exit(diff_cli(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ''))

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL, OUT = sys.argv[1], sys.argv[2]
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
LST = lambda k, d: [c.strip() for c in os.environ.get(k, d).split(',') if c.strip()]
CASES = LST('CASES', 'coplanar,lightband,nightrereg,uskitchen')
SETTLE = ENVI('SETTLE', 2500); WARM = ENVI('WARM', 6000); BURST = ENVI('BURST', 10); BURST_MS = ENVI('BURST_MS', 200)
YAW_STEP = ENVI('YAW_STEP', 30); PORT = os.environ.get('PORT', '1') == '1'; DAY = ENVI('DAY', 8)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'zheNoodleDone': True,
         'lawclub': True, 'wenzhouLine': True, 'fundsV2': 1, 'KX_FIRST_MSG': True}

# 位置（BB_247 表格 → 程式座標；x 往東。溫州街 z 往北、校園／室內 z 往南——鏡頭一律用「看向目標點」算 yaw，不靠方向慣例）
#   名稱: (區域, 玩家 x, z, lv, 目標 x, z, 說明)
SPOTS = {
    'wancai_front': ('campus', 93.8, -90.0, 0, 93.8, -101.0, 'BUG-COPLANAR-DEV：萬才館正面（弧形大台階、陽台；BB-C 10-20 wancai_front_15 同一處）'),
    'linze_front': ('campus', 34.0, -96.0, 0, 34.0, -108.0, 'BUG-COPLANAR-DEV：霖澤館正面穿堂（可選）'),
    'wzpark_pavilion': ('wenzhou', 18.6, 22.2, 0, 13.6, 26.6, 'BACKLOG-A7：溫州街小公園涼亭＋土地公（cmp_pavilion_shrine 那一角）'),
    'wzpark_notice': ('wenzhou', 23.6, 2.6, 0, 22.0, 6.3, 'BACKLOG-A7：小公園入口公布欄（可選）'),
}
CO_SPOTS = LST('CO_SPOTS', 'wancai_front,wzpark_pavilion')
LB_ZONES = [  # (區域, 玩家 x, z, lv, 說明)
    ('library_hall', -4.5, 7.2, 0, '總圖大廳一樓：門廳西側（門廳牆 x −5.2、閘門柱 z 5.4 旁）'),
    ('bookstore', 4.2, 4.0, 0, '舊路書房：前牆（門、窗 x 3.5）東南角，靠書架端'),
]
# 夜間材質（b1b249873 src/zones3d.js：WZ_NIGHT 1042 行、CAFE_NIGHT 997 行）
WZ_NIGHT = ['wz_signs_lit', 'ext_glass_lit', 'wz_room_lit', 'wz_win_glass_lit', 'cafe_bulb', 'wz_tube', 'jp_lamp', 'jp_shoji', 'wz_lamp_lens', 'ck_glass_lit', 'ck_glass', 'ck_pav_dark', 'ck_bell_lens']
CAFE_NIGHT = ['cafe_bulb', 'cafe_lampglass', 'ext_glass_lit']
CAFE_DOOR = (52.6, 0.0)   # 溫州街「進入兩點半 Café」(54.2,0) r 2.3；從 Café 出來站 (51.7,0)

INFO_JS = """(()=>{ const E=GAME.E, G=GAME.G, o=E.player.obj.position; const it=document.getElementById('interact'), lb=document.getElementById('interactLabel');
  return {gzone:G.zone, ezone:(E.zone&&E.zone.id)||null, hour:+(+G.hour).toFixed(3), day:G.day, x:+o.x.toFixed(2), y:+o.y.toFixed(2), z:+o.z.toFixed(2), lv:E.player.lv|0,
    ry:+E.player.obj.rotation.y.toFixed(3), camYaw:+E.cam.yaw.toFixed(3), frame:E.frame|0, paused:!!E.paused, weather:E.weather||G.weather,
    loading:!document.getElementById('loading').classList.contains('hide'), stand:E.canStand?E.canStand(o.x,o.z,0.3):null,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?((lb&&lb.textContent)||'').trim():null}; })()"""
MATS_JS = """(names=>{ const out={}, seen=new Set(); GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||!names.includes(m.name)||seen.has(m)) continue; seen.add(m);
    const r=out[m.name]=out[m.name]||{n:0,min:1e9,max:-1e9,nightI:null,dayI:null,visibleMesh:0}; r.n++; const v=+m.emissiveIntensity; r.min=Math.min(r.min,v); r.max=Math.max(r.max,v);
    if(m.userData.nightI!=null) r.nightI=m.userData.nightI; if(m.userData.dayI!=null) r.dayI=m.userData.dayI; if(o.visible) r.visibleMesh++; } });
  for(const k in out){ out[k].min=+out[k].min.toFixed(3); out[k].max=+out[k].max.toFixed(3); } return out; })"""


def night_k(h):
    """zones3d.js 的 zoneTime：19.2 以後、5.6 以前＝1；17.4～19.2 線性；白天 0"""
    h = h % 24
    k = 1 if (h >= 19.2 or h < 5.6) else ((h - 17.4) / 1.8 if h >= 17.4 else ((6.3 - h) / 0.7 if h < 6.3 else 0))
    return max(0.0, min(1.0, k))


def judge_mats(mats, hour):
    k = night_k(hour); res = {}
    for nm, r in mats.items():
        if r.get('nightI') is None:
            res[nm] = 'no_nightI'; continue
        want = (r.get('dayI') or 0) * (1 - k) + r['nightI'] * k
        res[nm] = 'ok' if abs(r['max'] - want) < 0.05 and abs(r['min'] - want) < 0.05 else 'MISMATCH want %.2f got %.2f..%.2f' % (want, r['min'], r['max'])
    return {'k': round(k, 3), 'per': res, 'mismatch': sorted(n for n, v in res.items() if v.startswith('MISMATCH'))}


def yaw_to(px, pz, tx, tz):
    """鏡頭在玩家的 (sin yaw, cos yaw) 那一側、看向前方 (−sin, −cos)：要看向目標點 → yaw＝atan2(px−tx, pz−tz)"""
    return math.atan2(px - tx, pz - tz)


class Case:
    def __init__(self, name):
        self.name = name; self.dir = os.path.join(OUT, name); os.makedirs(self.dir, exist_ok=True)
        self.shots = []; self.steps = []; self.fails = []; self.notes = []; self.extra = {}

    def check(self, label, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + '%s：%s%s' % (self.name, label, ('  ' + info) if info else ''), flush=True)
        if not ok: self.fails.append(label)
        return ok

    def setup(self, s):
        print('  [前置／捷徑] %s：%s' % (self.name, s), flush=True); self.notes.append('[前置／捷徑] ' + s)

    def note(self, s):
        print('  %s：%s' % (self.name, s), flush=True); self.notes.append(s)

    async def shot(self, pg, label, **kw):
        fn = '%03d_%s.png' % (len(self.shots) + 1, label); p = os.path.join(self.dir, fn)
        t0 = time.time()
        try:
            await pg.screenshot(path=p)
        except Exception as e:
            self.note('截圖失敗 %s %r' % (fn, e))
        t1 = time.time()
        info = await pg.evaluate(INFO_JS)
        rec = dict(file=os.path.relpath(p, OUT), label=label, t0=round(t0, 3), t1=round(t1, 3), iso=datetime.datetime.fromtimestamp(t0, datetime.timezone.utc).isoformat(timespec='milliseconds'),
                   size=os.path.getsize(p) if os.path.exists(p) else 0, vp=pg.viewport_size, **info)
        rec.update(kw); self.shots.append(rec)
        return rec

    def dump(self, errs):
        o = dict(case=self.name, url=URL, sha=os.environ.get('SHA', '?'), headless_env=os.environ.get('CC_HEADLESS'), notes=self.notes, steps=self.steps,
                 shots=self.shots, fails=self.fails, js_errors=list(errs)[:20], **self.extra)
        json.dump(o, open(os.path.join(OUT, self.name + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


async def open_game(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL)
    ok = await L.wait_loaded(pg)
    return b, pg, cdp, errs, ok


async def load_at(pg, cdp, zone, x, z, lv, yaw, hour):
    st = {'name': '祐廷', 'stage': 'law', 'zone': zone, 'hour': hour, 'day': DAY, 'weekday': 6, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'lv': lv, 'yaw': yaw},
          'flags': dict(FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}}
    await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    await wait_zone(pg, zone, 120)
    await pg.wait_for_timeout(WARM)
    await free(pg, cdp)


async def free(pg, cdp):
    """讀檔後的對話、手機、面板：像玩家一樣按掉（條件事件已關）"""
    for _ in range(12):
        try: await L.phone_away(pg, cdp, tries=2)
        except Exception: pass
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if await L.close_panels(pg, cdp): continue
        break


async def wait_zone(pg, zid, max_s):
    t0 = time.time()
    while time.time() - t0 < max_s:
        i = await pg.evaluate(INFO_JS)
        if i['gzone'] == zid and i['ezone'] == zid and not i['loading']: return True
        await pg.wait_for_timeout(500)
    return False


async def set_yaw(pg, yaw):
    await pg.evaluate("y=>{ GAME.E.cam.yaw=y; }", yaw)


async def face(pg, tx, tz):
    """玩家面向目標（人物朝向；只動 rotation，不動位置）"""
    await pg.evaluate("([tx,tz])=>{ const o=GAME.E.player.obj; o.rotation.y=Math.atan2(tx-o.position.x,tz-o.position.z); }", [tx, tz])


async def port_shot(cs, pg, label, **kw):
    if not PORT: return None
    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(max(1500, SETTLE // 2))
    r = await cs.shot(pg, label + '_port', **kw)
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(max(1500, SETTLE // 2))
    return r


def hour_ok(h, want, tol=1.0):
    return want - 0.05 <= h <= want + tol


# ---------------------------------------------------------------- 1. coplanar
async def case_coplanar(p):
    cs = Case('coplanar'); b, pg, cdp, errs, ok = await open_game(p)
    try:
        if not cs.check('遊戲載入', ok): return cs, errs
        for sp in CO_SPOTS:
            zone, x, z, lv, tx, tz, desc = SPOTS[sp]; yaw = yaw_to(x, z, tx, tz)
            cs.setup('%s：讀檔到 %s (%.1f, %.1f) 14:00、玩家面向 (%.1f, %.1f)；E.cam.yaw=%.3f（鏡頭固定）— %s' % (sp, zone, x, z, tx, tz, yaw, desc))
            await load_at(pg, cdp, zone, x, z, lv, math.atan2(tx - x, tz - z), 14.0)
            await face(pg, tx, tz); await set_yaw(pg, yaw); await pg.wait_for_timeout(SETTLE)
            await set_yaw(pg, yaw); await pg.wait_for_timeout(SETTLE)
            i0 = await pg.evaluate(INFO_JS); cs.steps.append(dict(spot=sp, before=i0, wantYaw=round(yaw, 3)))
            files = []; t_start = time.time()
            for k in range(BURST):
                due = t_start + k * BURST_MS / 1000.0
                if time.time() < due: await asyncio.sleep(due - time.time())
                r = await cs.shot(pg, '%s_b%02d' % (sp, k), spot=sp, k=k)
                files.append(os.path.join(OUT, r['file']))
            mine = [s for s in cs.shots if s.get('spot') == sp and not s['label'].endswith('_port')]
            span = mine[-1]['t0'] - mine[0]['t0'] if mine else 0
            cs.note('%s 連拍 %d 張，實際 %.2f 秒（第一張到最後一張的開始時間）；E.frame %s → %s' % (sp, len(mine), span, mine[0]['frame'] if mine else '?', mine[-1]['frame'] if mine else '?'))
            d = diff_series(files); json.dump(d, open(os.path.join(cs.dir, 'diff_%s.json' % sp), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            cs.extra.setdefault('diff', {})[sp] = {k: v for k, v in d.items() if k != 'pairs'} if 'pairs' in d else d
            cs.note('%s diff：%s' % (sp, J(cs.extra['diff'][sp])))
            await port_shot(cs, pg, sp, spot=sp)
            cs.check('%s：連拍 %d 張都存了' % (sp, BURST), len(mine) == BURST and all(s['size'] > 0 for s in mine), 'n=%d' % len(mine))
            cs.check('%s：區域 %s、時間 14:00' % (sp, zone), all(s['gzone'] == zone and s['ezone'] == zone and hour_ok(s['hour'], 14.0) for s in mine),
                     J([(s['gzone'], s['ezone'], s['hour']) for s in mine[:1] + mine[-1:]]))
            dy = max([abs((s['camYaw'] - yaw + math.pi) % (2 * math.pi) - math.pi) for s in mine] or [9])
            cs.check('%s：鏡頭方向固定（和設定的 yaw 差 ≤ 0.2 rad）' % sp, dy <= 0.2, '最大差 %.3f rad' % dy)
        cs.check('沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        cs.check('探針執行', False, repr(e)[:300])
    finally:
        cs.dump(errs); await b.close()
    return cs, errs


# ---------------------------------------------------------------- 2. lightband
async def case_lightband(p):
    cs = Case('lightband'); b, pg, cdp, errs, ok = await open_game(p)
    try:
        if not cs.check('遊戲載入', ok): return cs, errs
        n = max(1, 360 // YAW_STEP)
        for zone, x, z, lv, desc in LB_ZONES:
            cs.setup('讀檔到 %s (%.1f, %.1f) 14:00 — %s；之後只改 E.cam.yaw 繞玩家一圈（每 %d 度）' % (zone, x, z, desc, YAW_STEP))
            await load_at(pg, cdp, zone, x, z, lv, 0.0, 14.0)
            i0 = await pg.evaluate(INFO_JS); cs.steps.append(dict(zone=zone, after_load=i0))
            if not i0['stand'] or abs(i0['x'] - x) > 0.6 or abs(i0['z'] - z) > 0.6:
                cs.note('%s：讀檔的位置站不住或被移開（%.2f, %.2f）→ 照遊戲放的位置拍' % (zone, i0['x'], i0['z']))
            mine = []
            for k in range(n):
                yaw = math.radians(k * YAW_STEP); await set_yaw(pg, yaw); await pg.wait_for_timeout(SETTLE)
                r = await cs.shot(pg, '%s_y%03d' % (zone, k * YAW_STEP), zone_case=zone, wantYaw=round(yaw, 3)); mine.append(r)
                if k == 0: await port_shot(cs, pg, '%s_y000' % zone, zone_case=zone, wantYaw=0.0)
            dys = [abs((s['camYaw'] - s['wantYaw'] + math.pi) % (2 * math.pi) - math.pi) for s in mine]
            cs.note('%s：鏡頭實際 yaw 和設定的最大差 %.3f rad（跟隨鏡頭自己轉的話會變大）' % (zone, max(dys)))
            cs.check('%s：%d 張都存了' % (zone, n), len(mine) == n and all(s['size'] > 0 for s in mine))
            cs.check('%s：區域對、時間 14:00' % zone, all(s['gzone'] == zone and s['ezone'] == zone and hour_ok(s['hour'], 14.0) for s in mine),
                     J([(s['gzone'], s['ezone'], s['hour']) for s in mine[:1] + mine[-1:]]))
            cs.check('%s：每一張的鏡頭方向都是設定的（差 ≤ 0.25 rad）' % zone, max(dys) <= 0.25, '最大差 %.3f' % max(dys))
        cs.check('沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        cs.check('探針執行', False, repr(e)[:300])
    finally:
        cs.dump(errs); await b.close()
    return cs, errs


# ---------------------------------------------------------------- 3. nightrereg
async def tap_door(cs, pg, cdp, label, to, max_s=150):
    """互動鈕：等 #interactLabel 以 label 開頭，再用手指按 #interact；等區域換好"""
    t0 = time.time(); lab = None
    while time.time() - t0 < 30:
        lab = (await pg.evaluate(INFO_JS))['interact']
        if lab and lab.startswith(label): break
        await pg.wait_for_timeout(500)
    if not (lab and lab.startswith(label)):
        cs.note('互動鈕不是「%s」（現在：%r）' % (label, lab)); return False
    await L.tap(pg, cdp, '#interact')
    ok = await wait_zone(pg, to, max_s)
    if ok: await pg.wait_for_timeout(WARM); await free(pg, cdp)
    return ok


async def nr_step(cs, pg, seq, step, names):
    i = await pg.evaluate(INFO_JS); m = await pg.evaluate(MATS_JS, names); jd = judge_mats(m, i['hour'])
    rec = dict(seq=seq, step=step, gzone=i['gzone'], ezone=i['ezone'], hour=i['hour'], x=i['x'], z=i['z'], mats=m, judge=jd); cs.steps.append(rec)
    cs.note('%s %-22s zone=%s/%s hour=%.2f 夜間係數 %.2f 材質 %d 種、不符 %s' % (seq, step, i['gzone'], i['ezone'], i['hour'], jd['k'], len(m), jd['mismatch'] or '無'))
    return rec


async def nr_shoot(cs, pg, seq, tag):
    """溫州街：Café 正面、街屋（往西）各一張；鏡頭位置用 yaw 指定"""
    i = await pg.evaluate(INFO_JS); out = []
    for nm, (tx, tz) in (('cafe_front', (58.0, 0.0)), ('street_west', (i['x'] - 20.0, i['z']))):
        await set_yaw(pg, yaw_to(i['x'], i['z'], tx, tz)); await pg.wait_for_timeout(SETTLE)
        out.append(await cs.shot(pg, '%s_%s_%s' % (seq, tag, nm), seq=seq, step=tag))
    return out


async def nr_seq(cs, pg, cdp, seq, h0, dh):
    h1 = h0 + dh; ok_all = True
    cs.setup('%s：讀檔到溫州街 Café 門口 (%.1f, %.1f) %.2f 時（第一次進溫州街）' % (seq, CAFE_DOOR[0], CAFE_DOOR[1], h0))
    await load_at(pg, cdp, 'wenzhou', CAFE_DOOR[0], CAFE_DOOR[1], 0, math.pi / 2, h0)
    await nr_step(cs, pg, seq, '1_wenzhou_first', WZ_NIGHT)
    ok = await tap_door(cs, pg, cdp, '進入兩點半 Café', 'cafe'); ok_all &= cs.check('%s：按互動鈕進 Café' % seq, ok)
    if not ok: return False
    await nr_step(cs, pg, seq, '2_cafe_first', CAFE_NIGHT)
    ok = await tap_door(cs, pg, cdp, '離開咖啡廳', 'wenzhou'); ok_all &= cs.check('%s：按互動鈕離開 Café 回溫州街（第二次進溫州街）' % seq, ok)
    if not ok: return False
    await nr_step(cs, pg, seq, '3_wenzhou_again', WZ_NIGHT)
    cs.setup('%s：GAME.advance(%+.2f) 把時間撥到 %.2f%s' % (seq, dh, h1, '（倒撥：遊戲沒有這個介面）' if dh < 0 else '（遊戲裡沒有找到「跳過時間」的通用介面）'))
    await pg.evaluate("h=>GAME.advance(h)", dh); await pg.wait_for_timeout(SETTLE)
    r = await nr_step(cs, pg, seq, '4_wenzhou_after_time', WZ_NIGHT)
    shots = await nr_shoot(cs, pg, seq, 'wz')
    if seq == 'A': await port_shot(cs, pg, '%s_wz_street_west' % seq, seq=seq, step='wz')
    ok_all &= cs.check('%s：溫州街撥時間後 區域 wenzhou、時間 %.2f' % (seq, h1), r['gzone'] == 'wenzhou' and hour_ok(r['hour'], h1, 0.5) and all(s['gzone'] == 'wenzhou' and s['size'] > 0 for s in shots), J([r['gzone'], r['hour']]))
    # 從 Café 出來站在 (51.7, 0)，離門 2.5 m（互動半徑 2.3）：鏡頭轉回 Café，像玩家一樣點地面／推搖桿走到門口（playlib.go_to）
    await set_yaw(pg, yaw_to(r['x'], r['z'], 54.2, 0.0)); await pg.wait_for_timeout(SETTLE)
    okw = await L.go_to(pg, cdp, cs, CAFE_DOOR[0], CAFE_DOOR[1], 0.6, 'Café 門口', max_s=180)
    cs.note('%s：走到 Café 門口 %s' % (seq, 'OK' if okw else '沒走到'))
    ok = await tap_door(cs, pg, cdp, '進入兩點半 Café', 'cafe'); ok_all &= cs.check('%s：撥時間後再按互動鈕進 Café（第二次進 Café）' % seq, ok)
    if not ok: return False
    r = await nr_step(cs, pg, seq, '5_cafe_after_time', CAFE_NIGHT)
    i = await pg.evaluate(INFO_JS); out = []
    for nm, (tx, tz) in (('window_front', (i['x'], i['z'] + 6)), ('room_back', (i['x'], i['z'] - 6))):
        await set_yaw(pg, yaw_to(i['x'], i['z'], tx, tz)); await pg.wait_for_timeout(SETTLE)
        out.append(await cs.shot(pg, '%s_cafe_%s' % (seq, nm), seq=seq, step='cafe'))
    await port_shot(cs, pg, '%s_cafe_room_back' % seq, seq=seq, step='cafe')
    ok_all &= cs.check('%s：Café 區域 cafe、時間 %.2f、截圖都存了' % (seq, h1), r['gzone'] == 'cafe' and hour_ok(r['hour'], h1, 0.5) and all(s['gzone'] == 'cafe' and s['size'] > 0 for s in out), J([r['gzone'], r['hour']]))
    return ok_all


async def case_nightrereg(p):
    cs = Case('nightrereg')
    errs_all = []
    for seq, h0, dh in (('A', 14.0, 5.5), ('B', 19.5, -5.5)):
        if seq not in LST('NR_SEQ', 'A,B'): continue
        b, pg, cdp, errs, ok = await open_game(p)
        try:
            if cs.check('%s：遊戲載入' % seq, ok): await nr_seq(cs, pg, cdp, seq, h0, dh)
            cs.check('%s：沒有 JS 例外' % seq, not errs, J(errs[:3]))
        except Exception as e:
            cs.check('%s：探針執行' % seq, False, repr(e)[:300])
        finally:
            errs_all += list(errs); await b.close()
    mm = [(s['seq'], s['step'], s['judge']['mismatch']) for s in cs.steps if s['judge']['mismatch']]
    cs.extra['mat_mismatch'] = mm
    print('  INFO nightrereg：夜間材質和應有值不符的步驟（只記錄，不算 FAIL）：%s' % (J(mm) if mm else '無'), flush=True)
    cs.dump(errs_all)
    return cs, errs_all


# ---------------------------------------------------------------- 4. uskitchen
FURN = {'fridge': (-4.2, 1.8), 'stove': (-3.4, 2.7)}   # src/data/us_apartment_layout.js（use:'fridge'、use:'cook'）
NEAR_IT_JS = """(([fx,fz])=>{ const its=GAME.E.interactables.filter(i=>!i.hidden); let best=null, bd=1e9; for(const i of its){ const d=Math.hypot(i.x-fx,i.z-fz); if(d<bd){ bd=d; best=i; } }
  return best?{label:best.label||'',x:best.x,z:best.z,r:best.radius||1.5,lv:best.lv==null?0:best.lv,d:+bd.toFixed(2),all:its.map(i=>[i.label,+(+i.x).toFixed(2),+(+i.z).toFixed(2)])}:null; })"""


async def case_uskitchen(p):
    cs = Case('uskitchen'); b, pg, cdp, errs, ok = await open_game(p)
    try:
        if not cs.check('遊戲載入', ok): return cs, errs
        cs.setup('讀檔到 us_apartment 14:00（找互動點）')
        await load_at(pg, cdp, 'us_apartment', -3.0, 1.8, 0, -math.pi / 2, 14.0)
        for key, (fx, fz) in FURN.items():
            it = await pg.evaluate(NEAR_IT_JS, [fx, fz]); cs.extra.setdefault('interactables', {})[key] = it
            if not cs.check('%s：找到離家具最近的互動點' % key, bool(it) and it['d'] < 1.5, J(it and {k: it[k] for k in ('label', 'x', 'z', 'd')})): continue
            cs.setup('%s：讀檔站在互動點「%s」(%.2f, %.2f)、面向家具 (%.1f, %.1f)；鏡頭照遊戲自然跟隨' % (key, it['label'], it['x'], it['z'], fx, fz))
            await load_at(pg, cdp, 'us_apartment', it['x'], it['z'], it['lv'], math.atan2(fx - it['x'], fz - it['z']), 14.0)
            await face(pg, fx, fz); await pg.wait_for_timeout(SETTLE)
            r = await cs.shot(pg, 'kitchen_%s' % key, furn=key, want_label=it['label'])
            cs.note('%s：互動字 %r，玩家 (%.2f, %.2f)，鏡頭 yaw %.3f' % (key, r['interact'], r['x'], r['z'], r['camYaw']))
            await port_shot(cs, pg, 'kitchen_%s' % key, furn=key, want_label=it['label'])
            cs.check('%s：截圖存了、區域 us_apartment、時間 14:00' % key, r['size'] > 0 and r['gzone'] == 'us_apartment' and r['ezone'] == 'us_apartment' and hour_ok(r['hour'], 14.0), J([r['gzone'], r['hour']]))
            cs.check('%s：畫面上的互動鈕出現，字以「%s」開頭' % (key, it['label']), bool(r['interact']) and r['interact'].startswith(it['label']), J(r['interact']))
        cs.check('沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        cs.check('探針執行', False, repr(e)[:300])
    finally:
        cs.dump(errs); await b.close()
    return cs, errs


async def main():
    os.makedirs(OUT, exist_ok=True); fails = []
    fn = {'coplanar': case_coplanar, 'lightband': case_lightband, 'nightrereg': case_nightrereg, 'uskitchen': case_uskitchen}
    async with async_playwright() as p:
        for c in CASES:
            if c not in fn: print('FAIL 不認得的 case %s' % c); fails.append(c); continue
            t0 = time.time(); cs, _ = await fn[c](p)
            print('=== %s %s（%d 張、%.0f 秒）' % (c, 'PASS' if not cs.fails else 'FAIL', len(cs.shots), time.time() - t0), flush=True)
            fails += ['%s：%s' % (c, f) for f in cs.fails]
    print('ALL PASS' if not fails else 'FAILED %d：%s' % (len(fails), '；'.join(fails)), flush=True)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
