"""CC（帳號 A）11-10：FN_func——花序 Flower Notes（FLOWER-NOTES-1110／X325，BB_312 驗收計畫第 2 節 地圖 2、地圖 4、購物 1～5）。Playwright（PC GPU）≠ iPhone。
改之前（開發分支 632ef134e）和改之後都能跑：一律從遊戲裡偵測（kind gg_flower 的互動點、exit、場景物件 userData.ggShop＝'G11'、GIFTH／GIFT_HOLIDAY），不寫死新版座標或區域名。
共用函式在 cc_fn_lib.py（F），依據的程式行號也寫在那裡。
PARTS（逗號分隔；預設全部）：
  LIST     【前置】day46 公館 10:00。列出公館所有 kind gg_flower 的互動點（區域、座標、label）＋G11 那間店（有門就進去）裡的 gg_flower；另外抓遊戲載入的 src/*.js 裡寫到 gg_flower 的每一行。
           check：公館＋花序店裡加起來只有 1 個 gg_flower；(−47, 11.6) 4 m 內沒有 gg_flower。
  OLDSPOT  舊位置 (−47, 11.725) 寬 2.9 深 2.05（改之前花攤的阻擋 rect，src/zones3d.js 1073）：
           導航格每 0.5 m 站得住（E.canStand r 0.3）；那個範圍裡沒有攤子模型（場景物件 gg_flower_stall*、材質 ggf_*）；4 m 內沒有站著不動的 NPC（老闆）；
           搖桿直線（不繞路）北→南 (−47, 8.6)→(−47, 14.8)、西→東 (−50.2, 11.7)→(−44.6, 11.7) 走得過去；拍一張（騎樓那一邊看）。
  DOOR     G11 的店：gg_flower 在 G11 那一間（門＝exit 在 G11 寬度裡／label 有「花序」；或店面就在公館這一區、互動點在立面後面）。
           有門：搖桿從街上 (G11 中間, 立面−6 m) 走到門口 → 按門 → 進店（記站的位置）→ 搖桿走到店裡往公館的出口 → 按 → 回到公館：離門口 3 m 內、站得住、
           搖桿往街上推得動 ≥1 m、走路途中沒有跳（cc_fn_lib.joy_to：兩次取樣位移 > max(2.5, 6×秒) m）、walkFallbacks 沒有增加。
           改之前：G11 沒有門、gg_flower 在攤子上＝check「gg_flower 在 G11 那一間店」FAIL（預期，舊版本來就沒有）。
  BUY      走到 gg_flower（有門就觸控走進店）→ 按 → 買花清單：每一樣的名稱、價格和 GIFTH.sells(G,'gg_flower')＋GIFTH.item(id)（＝GIFT_HOLIDAY.items）逐項比；
           每一類（資料有 cat／category／kind／type／group 欄位就照它分，沒有就每一樣一類；BUY_ALL=1 全買）買一樣：買前買後 G.money 相減＝價格、包包多 1 樣；
           連點兩下（70 ms）只扣一次、只多 1 樣；錢不夠（【前置】錢改成最便宜的價格−1）按：不扣錢、不給東西（記 toast）；
           買完看包包：GIFTH.bag 有那一樣、shop＝gg_flower；選單「物品」頁看得到品名。
  HOURS    在 gg_flower 前面：【前置】時間改 08:54、09:03、20:54、21:01，再抽一個營業時間外的（SEED；06:00～08:50、21:05～23:30）各按一次：
           營業時間內出買花清單、外面不出，記實際顯示什麼（對話、toast、選項）。
全程：JS 例外 0。
環境變數：PARTS、START（街上起點 'x,z'，預設 −40,8 捷運口西邊人行道）、BUY_ALL、SEED、FN_G11（'x0,x1,立面z'）、FN_DOOR_LABEL（門的 label 開頭）、FN_SHOP（GIFTH 店代號，預設 gg_flower）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=LIST,OLDSPOT python3 cc_fn_func_probe.py <url> <out>"""
import os, sys, json, asyncio, math, random, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = [x.strip().upper() for x in (os.environ.get('PARTS') or 'LIST,OLDSPOT,DOOR,BUY,HOURS').split(',') if x.strip()]
R = L.Run('fn_func', OUT); F.setup(R, OUT)
J = F.J
START = [float(v) for v in (os.environ.get('START') or '-40,8').split(',')]
SEED = int(os.environ.get('SEED') or int(time.time()) % 100000)
OS = F.OLD_STALL
CTX = {}   # 各段之間共用：g11、door、flower 互動點在哪一區


async def survey(pg, cdp):
    """公館這一區：gg_flower 互動點、G11、門"""
    g = await F.g11(pg); fl = await pg.evaluate("(%s)(%s)" % (F.LIST_FLOWER_JS, J(F.FLOWER_KIND)))
    door, exs = await F.find_door(pg, g)
    CTX.update(g11=g, gg_flower=fl, door=door, exits=exs)
    return g, fl, door, exs


async def part_list(pg, cdp):
    tag = '[LIST]'
    await F.load(pg, cdp, '%s 公館街上' % tag, x=START[0], z=START[1], hour=10.0)
    g, fl, door, exs = await survey(pg, cdp)
    R.note('%s G11（%s）：%s' % (tag, g and g['src'], J(g)))
    R.note('%s 公館 kind gg_flower 的互動點 %d 個：%s' % (tag, len(fl), J(fl)))
    R.note('%s 公館所有店門（exit）：%s' % (tag, J([[e['label'], e['x'], e['z'], e['to']] for e in exs])))
    inside = []
    if door:
        R.note('%s G11 的門：%s' % (tag, J(door)))
        s = await F.enter_door(pg, cdp, tag, door)
        if s:
            inside = await pg.evaluate("(%s)(%s)" % (F.LIST_FLOWER_JS, J(F.FLOWER_KIND)))
            R.note('%s 店裡（%s）kind gg_flower 的互動點 %d 個：%s' % (tag, s['zone'], len(inside), J(inside)))
            CTX['shop_zone'] = s['zone']; CTX['shop_flower'] = inside
            CTX['shop_exits'] = await pg.evaluate(F.EXITS_JS)
    else:
        R.note('%s G11 沒有門（exit 在 G11 寬度 %s～%s 裡、或 label 有「花序」的都沒有）' % (tag, g and g['x0'], g and g['x1']))
    src = await pg.evaluate("(%s)(%s)" % (F.SRC_SCAN_JS, J(F.FLOWER_KIND)))
    R.note('%s 遊戲載入的 src 裡寫到 gg_flower 的行（%d 行）：%s' % (tag, len(src), J(src)))
    kinds = [x for x in src if ("kind:'gg_flower'" in x[2] or 'kind:"gg_flower"' in x[2]) and '.push(' in x[2]]
    R.note('%s 其中「…push({…kind:gg_flower…})」的（互動點）：%s' % (tag, J(kinds)))
    allf = [x for x in fl if not x['hidden']] + [x for x in inside if not x['hidden']]
    R.check('%s 公館（含花序店裡）只剩 1 個 kind gg_flower 的互動點（%d 個）' % (tag, len(allf)), len(allf) == 1, J(allf))
    near = [x for x in fl if math.hypot(x['x'] - OS['cx'], x['z'] - OS['cz']) < 4]
    R.check('%s 舊花攤位置 (−47, 11.6) 4 m 內沒有 gg_flower 互動點' % tag, not near, J(near))


async def part_oldspot(pg, cdp):
    tag = '[OLDSPOT]'
    await F.load(pg, cdp, '%s 舊花攤北邊人行道' % tag, x=OS['cx'], z=8.6, yaw=0.0, hour=14.0)
    x0, x1, z0, z1 = OS['cx'] - OS['w'] / 2, OS['cx'] + OS['w'] / 2, OS['cz'] - OS['d'] / 2, OS['cz'] + OS['d'] / 2
    nv = await pg.evaluate("(%s)(%s)" % (F.NAV_RECT_JS, J({'x0': x0, 'x1': x1, 'z0': z0, 'z1': z1})))
    R.check('%s 舊花攤範圍 x %.2f～%.2f z %.3f～%.3f 每 0.5 m 站得住（E.canStand r0.3；%d 點，站不住 %d 點）' % (tag, x0, x1, z0, z1, nv['n'], len(nv['bad'])), not nv['bad'], J(nv['bad'][:30]))
    ob = await pg.evaluate("(%s)(%s)" % (F.OBJ_NEAR_JS, J({'x0': x0, 'x1': x1, 'z0': z0, 'z1': z1})))
    R.note('%s 舊花攤範圍裡看得到的物件 %d 個：%s' % (tag, ob['n'], J(ob['objs'])))
    R.check('%s 沒有攤子模型（場景物件 gg_flower_stall*、材質 ggf_* 都沒有）' % tag, not ob['stallObj'] and ob['ggf'] == 0, J({'stallObj': ob['stallObj'], 'ggf': ob['ggf']}))
    a = await pg.evaluate("(%s)(%s)" % (F.NPC_NEAR_JS, J({'x': OS['cx'], 'z': OS['cz'], 'r': 4})))
    await pg.wait_for_timeout(3000)
    b = await pg.evaluate("(%s)(%s)" % (F.NPC_NEAR_JS, J({'x': OS['cx'], 'z': OS['cz'], 'r': 4})))
    still = [n for n in b if any(m['id'] == n['id'] and math.hypot(m['x'] - n['x'], m['z'] - n['z']) < 0.05 for m in a)]
    R.note('%s 4 m 內的人：前 %s；3 秒後 %s' % (tag, J(a), J(b)))
    R.check('%s 4 m 內沒有站著不動的人（老闆）' % tag, not still, J(still))
    await F.shot(pg, cdp, 'fn_oldspot_south', {'eye': [OS['cx'], 2.2, 18.2], 'look': [OS['cx'], 0.9, OS['cz']], 'lens': 24})
    await F.shot(pg, cdp, 'fn_oldspot_north', {'eye': [OS['cx'] + 1.5, 2.2, 5.2], 'look': [OS['cx'], 0.9, OS['cz']], 'lens': 24})
    fb0 = (await D.st(pg))['fb']
    r1 = await F.joy_to(pg, cdp, tag, OS['cx'], 14.8, near=0.6, straight=True, max_s=60)
    R.note('%s 北→南：%s' % (tag, J({k: r1[k] for k in r1 if k != 'log'})))
    R.check('%s 搖桿直線北→南 (−47, 8.6)→(−47, 14.8) 走得過去（%s 秒、推 %d 次）' % (tag, r1['t'], r1['pushes']), r1['ok'] and not r1['jumps'], J({'why': r1.get('why'), 'end': [r1['end']['x'], r1['end']['z']], 'jumps': r1['jumps']}))
    await F.load(pg, cdp, '%s 舊花攤西邊' % tag, x=-50.2, z=11.7, yaw=-math.pi / 2, hour=14.0)
    r2 = await F.joy_to(pg, cdp, tag, -44.6, 11.7, near=0.6, straight=True, max_s=60)
    R.note('%s 西→東：%s' % (tag, J({k: r2[k] for k in r2 if k != 'log'})))
    R.check('%s 搖桿直線西→東 (−50.2, 11.7)→(−44.6, 11.7) 走得過去（%s 秒、推 %d 次）' % (tag, r2['t'], r2['pushes']), r2['ok'] and not r2['jumps'], J({'why': r2.get('why'), 'end': [r2['end']['x'], r2['end']['z']], 'jumps': r2['jumps']}))
    R.check('%s walkFallbacks 沒有增加' % tag, (await D.st(pg))['fb'] == fb0, '')


async def part_door(pg, cdp):
    tag = '[DOOR]'
    await F.load(pg, cdp, '%s 公館街上' % tag, x=START[0], z=START[1], hour=14.0)
    g, fl, door, exs = await survey(pg, cdp)
    walkin = [x for x in fl if g and g['x0'] - 0.5 <= x['x'] <= g['x1'] + 0.5 and x['z'] > g['zf'] + 3]   # 店面就在公館這一區、互動點在立面後面（店裡）
    R.check('%s gg_flower 在 G11 那一間店（G11 有門，或 gg_flower 在 G11 立面後面）——改之前 FAIL＝預期（攤子在捷運口）' % tag, bool(door) or bool(walkin), J({'g11': g, 'door': door, 'gg_flower': fl}))
    if not g: return
    sx, sz = g['cx'], g['zf'] - 6.0
    if door or walkin:
        R.setup('%s【前置】觸控點地板走到 G11 前面的街上 (%.1f, %.1f)（不算在測的那一段）' % (tag, sx, sz))
        await F.tap_near(pg, cdp, '%s G11 前面的街上' % tag, sx, sz, 0.8, max_s=240)
    fb0 = (await D.st(pg))['fb']
    if door:
        r = await F.joy_to(pg, cdp, tag, door['x'], door['z'], near=min(0.9, door['r'] * 0.6), lv=door['lv'], max_s=90)
        R.note('%s 搖桿走到門口：%s' % (tag, J({k: r[k] for k in r if k != 'log'})))
        s = await F.wait_btn(pg, door['label'], 5)
        if not R.check('%s 搖桿從街上走到門口，按鈕是「%s」（%s 秒、推 %d 次、沒有跳）' % (tag, door['label'], r['t'], r['pushes']), s['interact'].startswith(door['label']) and not r['jumps'], J({'end': [s['x'], s['z']], 'btn': s['interact'], 'jumps': r['jumps'], 'why': r.get('why')})):
            await F.shot(pg, cdp, 'fn_door_nobtn'); return
        await F.shot(pg, cdp, 'fn_door_out_before')
        await L.tap(pg, cdp, '#interact'); s = await D.wait_zone(pg, cdp, door['to']); await pg.wait_for_timeout(2000); s = await D.st(pg)
        R.check('%s 按門進到 %s（站得住）' % (tag, door['to']), s['zone'] == door['to'] and s['stand'], J(s))
        await F.shot(pg, cdp, 'fn_door_in')
        ex = next((e for e in await pg.evaluate(F.EXITS_JS) if e['to'] == 'gongguan' and not e['hidden']), None)
        if not R.check('%s 店裡有回公館的出口' % tag, bool(ex), J(await pg.evaluate(F.EXITS_JS))): return
        tgt = await D.standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, ex['lv'])
        r = await F.joy_to(pg, cdp, tag, (tgt or ex)['x'], (tgt or ex)['z'], near=0.5, lv=ex['lv'], max_s=90)
        s = await F.wait_btn(pg, ex['label'], 5)
        R.check('%s 搖桿從店裡走到出口，按鈕是「%s」（%s 秒、沒有跳）' % (tag, ex['label'], r['t']), s['interact'].startswith(ex['label']) and not r['jumps'], J({'end': [s['x'], s['z']], 'btn': s['interact'], 'jumps': r['jumps'], 'why': r.get('why')}))
        if not s['interact'].startswith(ex['label']): return
        await L.tap(pg, cdp, '#interact'); await D.wait_zone(pg, cdp, 'gongguan'); await pg.wait_for_timeout(2000); s = await D.st(pg)
        dd = math.hypot(s['x'] - door['x'], s['z'] - door['z'])
        await F.shot(pg, cdp, 'fn_door_back')
        R.check('%s 出來回到公館、離門口 %.2f m（≤3）、站得住' % (tag, dd), s['zone'] == 'gongguan' and dd <= 3 and s['stand'], J(s))
        p0 = (s['x'], s['z']); r = await F.joy_to(pg, cdp, tag, s['x'], s['z'] - 3.0, near=0.5, max_s=30, straight=True)
        mv = math.hypot(r['end']['x'] - p0[0], r['end']['z'] - p0[1])
        R.check('%s 出來以後搖桿往街上推得動 %.2f m（≥1，不卡牆）' % (tag, mv), mv >= 1.0 and not r['jumps'], J({'end': [r['end']['x'], r['end']['z']], 'jumps': r['jumps']}))
    elif walkin:
        it = walkin[0]
        r = await F.joy_to(pg, cdp, tag, it['x'], it['z'], near=0.8, lv=it['lv'], max_s=90)
        R.check('%s 搖桿從街上走進店（同一區）到「%s」（%s 秒、沒有跳）' % (tag, it['label'], r['t']), r['ok'] and not r['jumps'], J({'end': [r['end']['x'], r['end']['z']], 'why': r.get('why'), 'jumps': r['jumps']}))
        r = await F.joy_to(pg, cdp, tag, sx, sz, near=0.8, max_s=90)
        R.check('%s 搖桿從店裡走回街上 (%.1f, %.1f)（%s 秒、沒有跳）' % (tag, sx, sz, r['t']), r['ok'] and not r['jumps'], J({'end': [r['end']['x'], r['end']['z']], 'why': r.get('why'), 'jumps': r['jumps']}))
    R.check('%s walkFallbacks 沒有增加' % tag, (await D.st(pg))['fb'] == fb0, '')


async def reach_flower(pg, cdp, tag):
    """觸控走到 gg_flower 前面（有 G11 的門＝先走進店）；回傳那個互動點"""
    g, fl, door, exs = await survey(pg, cdp)
    if door:
        s = await F.enter_door(pg, cdp, tag, door)
        if not s: return None
        fl = await pg.evaluate("(%s)(%s)" % (F.LIST_FLOWER_JS, J(F.FLOWER_KIND)))
    fl = [x for x in fl if not x['hidden']]
    if not R.check('%s 這一區（%s）有 gg_flower 互動點' % (tag, await pg.evaluate("GAME.G.zone")), bool(fl), ''): return None
    it = fl[0]
    tgt = await D.standable_near(pg, it['x'], it['z'], (it['r'] or 1.2) * 0.6, it['lv'])
    await F.tap_near(pg, cdp, '%s 走到「%s」' % (tag, it['label']), (tgt or it)['x'], (tgt or it)['z'], 0.35, lv=it['lv'])
    s = await F.wait_btn(pg, it['label'], 5)
    R.check('%s 走到「%s」前面，互動按鈕是它' % (tag, it['label']), s['interact'].startswith(it['label']), J({'at': [s['x'], s['z']], 'btn': s['interact']}))
    return it


async def buy_one(pg, cdp, tag, it, item, double=False):
    """開清單、選 item（double＝連點兩下）；回傳 (前, 後, 對話)"""
    b0 = await pg.evaluate(F.BAG_JS); await F.toasts(pg, clear=True)
    r = await F.open_shop(pg, cdp, tag, it['label'], [item])
    if not r['opts']: R.check('%s 打開買花清單' % tag, False, J(r)); return b0, b0, r['trace']
    k = next((i for i, x in enumerate(r['opts']) if x['t'].startswith(item['name'])), None)
    await F.choose_k(pg, cdp, k, double=double)
    said = await F.finish_dialog(pg, cdp)
    await pg.wait_for_timeout(800); b1 = await pg.evaluate(F.BAG_JS)
    return b0, b1, said + ['toast：' + J(await F.toasts(pg))]


async def part_buy(pg, cdp):
    tag = '[BUY]'
    await F.load(pg, cdp, '%s 公館街上' % tag, x=START[0], z=START[1], hour=11.0, money=5000)
    it = await reach_flower(pg, cdp, tag)
    if not it: return
    ex = await F.expect(pg)
    R.note('%s 資料（GIFT_HOLIDAY.shops.%s＋GIFTH.sells）：%s' % (tag, F.SHOP_KEY, J(ex)))
    if not R.check('%s 資料裡有這家店、賣東西' % tag, bool(ex and ex['shop'] and ex['sells']), J(ex)): return
    sells = ex['sells']
    r = await F.open_shop(pg, cdp, tag, it['label'], sells)
    R.note('%s 打開：%s' % (tag, J(r['trace'])))
    if not R.check('%s 按「%s」出買花清單' % (tag, it['label']), bool(r['opts']), J(r)): return
    await D.shot(pg, 'fn_buy_list', judge_black=False)
    got, extra = F.match_opts(r['opts'], sells)
    R.note('%s 清單（畫面）：%s' % (tag, J([o['t'][:50] for o in r['opts']])))
    for itm in sells:
        g = got.get(itm['id'])
        R.check('%s 清單有「%s」、顯示 %s 元＝資料 %s 元' % (tag, itm['name'], g and g['price_shown'], itm['price']), bool(g) and g['price_shown'] == itm['price'], J(g))
    R.check('%s 清單沒有資料以外的品項' % tag, not extra, J(extra))
    for gid in ('g_bouquet', 'g_sunflower'):
        R.check('%s 原有商品 %s 還在清單（BB_312 購物 1）' % (tag, gid), gid in got, J(list(got)))
    await F.finish_dialog(pg, cdp)   # 選「算了」收掉
    # 每一類買一樣
    cats = {}
    for itm in sells: cats.setdefault(itm['cat'] or itm['id'], []).append(itm)
    picks = sells if os.environ.get('BUY_ALL') else [v[0] for v in cats.values()]
    R.note('%s 分類（%s）：%s；要買：%s' % (tag, sells[0]['catKey'] or '資料沒有分類欄位＝每一樣一類', J({k: [x['id'] for x in v] for k, v in cats.items()}), J([x['id'] for x in picks])))
    for itm in picks:
        b0, b1, said = await buy_one(pg, cdp, '%s 買 %s' % (tag, itm['id']), it, itm)
        dm = b0['money'] - b1['money']; nb = len(b1['bag']) - len(b0['bag'])
        new = [b for b in b1['bag'] if b['id'] == itm['id']]
        R.note('%s 買 %s：%s' % (tag, itm['id'], J(said)))
        R.check('%s 買「%s」：錢 %d→%d 少 %d＝價格 %d、包包多 %d 樣' % (tag, itm['name'], b0['money'], b1['money'], dm, itm['price'], nb), dm == itm['price'] and nb == 1, J(b1['bag']))
        R.check('%s 「%s」進包包、shop＝%s' % (tag, itm['name'], F.SHOP_KEY), bool(new) and all(b['shop'] == F.SHOP_KEY for b in new), J(new))
    # 連點兩下
    cheap = min(sells, key=lambda x: x['price'])
    b0, b1, said = await buy_one(pg, cdp, '%s 連點兩下 %s' % (tag, cheap['id']), it, cheap, double=True)
    dm = b0['money'] - b1['money']; nb = len(b1['bag']) - len(b0['bag'])
    R.note('%s 連點兩下：%s' % (tag, J(said)))
    R.check('%s 連點兩下「%s」：只扣一次（少 %d、價格 %d）、包包只多 %d 樣' % (tag, cheap['name'], dm, cheap['price'], nb), dm == cheap['price'] and nb == 1, J({'before': b0, 'after': b1}))
    # 錢不夠
    poor = cheap['price'] - 1
    await pg.evaluate("(m=>{ GAME.G.money=m; })(%d)" % poor)
    R.setup('%s【前置】錢改成 %d（最便宜的「%s」%d 元 − 1）' % (tag, poor, cheap['name'], cheap['price']))
    b0 = await pg.evaluate(F.BAG_JS); await F.toasts(pg, clear=True)
    r = await F.open_shop(pg, cdp, tag, it['label'], sells)
    if R.check('%s 錢不夠時也打得開清單' % tag, bool(r['opts']), J(r)):
        k = next((i for i, x in enumerate(r['opts']) if x['t'].startswith(cheap['name'])), None)
        dim = r['opts'][k]['dim'] if k is not None else None
        await D.shot(pg, 'fn_buy_poor_list', judge_black=False)
        await F.choose_k(pg, cdp, k)
        said = await F.finish_dialog(pg, cdp); b1 = await pg.evaluate(F.BAG_JS); ts = await F.toasts(pg)
        R.note('%s 錢不夠按「%s」（選項灰掉 %s）：對話 %s、toast %s' % (tag, cheap['name'], dim, J(said), J(ts)))
        R.check('%s 錢不夠按：不扣錢（%d→%d）、不給東西（包包 %d→%d 樣）' % (tag, b0['money'], b1['money'], len(b0['bag']), len(b1['bag'])), b1['money'] == b0['money'] and len(b1['bag']) == len(b0['bag']), J({'toast': ts, 'said': said}))
    await pg.evaluate("GAME.G.money=5000"); R.setup('%s【前置】錢改回 5000' % tag)
    # 包包
    bg = await pg.evaluate(F.BAG_JS); ui = await F.bag_ui(pg, cdp)
    R.note('%s 包包（GIFTH.bag）：%s；選單「物品」：%s' % (tag, J(bg['bag']), J(ui[:400])))
    for itm in picks:
        R.check('%s 選單「物品」看得到「%s」' % (tag, itm['name']), itm['name'] in ui, '')
    R.check('%s 包包裡每一樣的 shop 都是 %s' % (tag, F.SHOP_KEY), bool(bg['bag']) and all(b['shop'] == F.SHOP_KEY for b in bg['bag']), J(bg['bag']))
    CTX['buy_it'] = it


async def part_hours(pg, cdp):
    tag = '[HOURS]'
    await F.load(pg, cdp, '%s 公館街上' % tag, x=START[0], z=START[1], hour=11.0, money=5000)
    it = await reach_flower(pg, cdp, tag)
    if not it: return
    rnd = random.Random(SEED); a = rnd.random()
    hr = round(6.0 + a * 2.83, 2) if a < 0.5 else round(21.08 + (a - 0.5) * 4.8, 2)
    sells = (await F.expect(pg) or {}).get('sells') or []
    for h, want in ((8.9, False), (9.05, True), (20.9, True), (21.02, False), (hr, False)):
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%f)" % h)
        R.setup('%s【前置】時間改 %05.2f%s' % (tag, h, '（SEED %d 抽的營業時間外）' % SEED if h == hr else ''))
        await pg.wait_for_timeout(1200); await F.toasts(pg, clear=True)
        ex = await F.expect(pg)
        r = await F.open_shop(pg, cdp, '%s %05.2f' % (tag, h), it['label'], sells, max_steps=12)
        got = bool(r['opts']); ts = await F.toasts(pg)
        if got: await D.shot(pg, 'fn_hours_%04d' % int(h * 100), judge_black=False)
        said = await F.finish_dialog(pg, cdp)
        R.note('%s %05.2f（GIFTH.flowerOpen＝%s）：出清單 %s；顯示 %s；toast %s；收尾 %s' % (tag, h, ex and ex['open'], got, J(r['trace']), J(ts), J(said)))
        if not got and not r['trace']: await D.shot(pg, 'fn_hours_%04d' % int(h * 100), judge_black=False)
        R.check('%s %05.2f %s買花清單' % (tag, h, '有' if want else '沒有'), got == want, J({'trace': r['trace'], 'toast': ts}))


async def main():
    sha = os.environ.get('SHA', '')[:9]
    print('CC FN_func（FLOWER-NOTES-1110）：PARTS %s；SHA %s；SEED %d；Playwright ≠ iPhone' % (','.join(PARTS), sha, SEED), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('LIST', part_list), ('OLDSPOT', part_oldspot), ('DOOR', part_door), ('BUY', part_buy), ('HOURS', part_hours)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e:
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:300]); await D.shot(pg, 'fn_func_exc_%s' % part.lower(), judge_black=False)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
