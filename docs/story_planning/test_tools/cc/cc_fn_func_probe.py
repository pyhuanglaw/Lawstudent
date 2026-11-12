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
  BUY      （CC-C 11-12 改：fb55a19173 起十樣、花藝師；期望值＝AA_792 稿 8475a3b85〔F.fn_expect：有稿用稿，並查頁面上的資料＝稿；讀不到改比頁面〕）
           【前置】公館 G11 門前人行道 11:00、錢 10000、包包清空 → 搖桿走到「進入花序」→ 進店 → 觸控走到「買花」（kind gg_flower）→ 按：
           ① 第一句＝花藝師（說話的人＝稿 staff.who）說稿 staff.greet 三句之一；清單＝稿的十樣「名字　價錢 元」（名字、價錢、順序逐項比）＋「算了」，原本兩樣在（購物 1）；選算了不扣錢
           ② 連點兩下最便宜的（70 ms）：只扣一次、包包只多 1 樣（購物 5）；連點的第二下可能翻掉下一句，這一次不判句子——【前置】把它從包包拿掉，④ 再正常買一次判句子
           ③ 錢不夠（【前置】錢改成最便宜的價格−1）：不扣錢、不給東西、toast「錢不夠」（購物 5）
           ④ 十樣各正常買一次：greet → 稿 staff.buy[那一樣] 逐句（「（」開頭＝旁白、沒有說話的人，其他＝花藝師）→「你買了…，放進包包。」；
              買前買後錢相減＝價格（扣一次）、包包多 1 樣、shop＝gg_flower（購物 2～4）
           ⑤ 包包滿了（十樣）再按「買花」：不出清單、不扣錢（GIFTH.shopOpt 的提示 toast）
           ⑥ 選單「物品」看得到十樣的名字、每一樣的店名那一行＝FN_SHOP_NAME、GIFTH.bag 的 shop 都是 gg_flower。
  HOURS    （CC-C 11-12 重寫：營業時間＝稿 staff.hours 10:00～21:00〔PLACES.hours.flower_notes〕；沒開＝公館 G11 門口演 staff.closed、不進去）
           【前置】讀檔公館 G11 門前人行道，時間各一次：09:45、21:10、SEED 抽一個營業時間外（06:00～09:35、21:15～23:30）、10:20（開著的對照）→ 搖桿走到「進入花序」→ 按：
           按的那一刻遊戲時間在營業時間外＝沒進去（還在公館）、對話框一句＝稿 staff.closed（旁白、沒有說話的人）、toast 有店名＋稿的開門時間；營業時間內＝進到 flower_notes、站得住。
           按的那一刻離 10:00／21:00 不到 2 遊戲分鐘＝那一次不判（CC_02 乙 6）。
           CLOSE：【前置】讀檔店裡（買花前面）20:52 → 等遊戲時間過 21:00（上限 HOURS_WAIT 秒，預設 1500）：花藝師（稿 staff.who＝XSCLOSE.ZONES.flower_notes.who）說 XSCLOSE.LINE
           （AA_700「我們今天要打烊了。」）→ 人到公館、離「進入花序」≤3.5 m、站得住、搖桿推得動。
  LOOK     （CC-C 11-12 新：13 區的「看」）【前置】讀檔店裡門口 14:00。店裡每一個 fnLook 互動點（FNS.lookPoints：配置的五個＋櫃檯＋八個；大盆植物一、二樓各一＝14 點 13 種）：
           稿的 13 個 key 每一個都有互動點、按鈕的字不是空的、配置的「看中央展示台」（稿沒有句子）不在；
           每一點：挑站得住、而且離它比離別的互動點近的格子（F.look_cells，依序試最多 4 格）→ 搖桿走過去（互動鍵出現它的字就算到）→ 互動鍵最上層是它（elementFromPoint）→ 按 →
           旁白（#caption）整句＝稿 looks[那一種]、不是空的。二樓那幾點先搖桿走上樓梯到平台（lv 1）。LOOKS＝只跑這幾種（逗號分隔 kind；雲端跑一部分用）。
  GIFT     送禮選單上的店名：【前置】GIFT_DAY（預設 2025-12-24 聖誕）11:00 → 走到 gg_flower 買一束花 →【捷徑】GAME.enter 到 GIFT_WHO（預設 heroine_05 溫書瑀，那天 10～17 在 library）
           → 觸控走過去說話（讀書區第一次只點頭＝再按一次）→「送她禮物…」→ 那一層每一樣的店名 hint＝FN_SHOP_NAME → 送出（given 記上）。
全程：JS 例外 0；網址自動加 ?tapguard（TAPGUARD=0 不加）。
CC-C 11-12 的期望值出處：AA_792 稿（企劃線 8475a3b85：docs/story_planning/AA_792_flower_notes.json；F.doc792 讀，讀不到改比頁面）＝fb55a19173 匯入的 src/data/flower_notes_text.js、gift_holiday.js；
  「你買了…，放進包包。」＝src/gifthol3d.js GIFTH.buy；打烊那一句＝XSCLOSE.LINE（AA_700）；營業時間外的 toast＝PLACES.closedText（店名＋下次開門時間）。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9n/a（截圖只當證據，判斷都看字、狀態，不用截圖判） 10✓ 11✓ 12✓ 13✓——這次改／審的是 BUY、HOURS、LOOK、GIFT 的前置（g11_street、counter_once）；LIST、OLDSPOT、DOOR 是帳號 A 寫的，沒重審（只跟著共用的 enter_door 改成「互動鍵出現門的字就算到」）
環境變數：PARTS、LOOKS（只跑這幾種「看」）、HOURS_WAIT（等打烊的上限秒數）、TAPGUARD、GIFT_DAY、GIFT_WHO、FN_SHOP_NAME、START（街上起點 'x,z'，預設 −40,8 捷運口西邊人行道）、BUY_ALL、SEED、FN_G11（'x0,x1,立面z'）、FN_DOOR_LABEL（門的 label 開頭）、FN_SHOP（GIFTH 店代號，預設 gg_flower）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=LIST,OLDSPOT python3 cc_fn_func_probe.py <url> <out>"""
import os, sys, json, asyncio, math, random, time, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
if os.environ.get('TAPGUARD', '1') != '0' and 'tapguard' not in URL: URL = URL + ('&' if '?' in URL else '?') + 'tapguard'   # CC_02 乙 4：和真的手機一樣擋選單剛出來那一下的誤點（TAPGUARD=0 不加）
PARTS = [x.strip().upper() for x in (os.environ.get('PARTS') or 'LIST,OLDSPOT,DOOR,BUY,HOURS,LOOK,GIFT').split(',') if x.strip()]
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


async def g11_street(pg, cdp, tag, hour, money=5000, day_key=None, quiet_events=True, dz=6.0):
    """【前置】讀檔到公館 G11 門前的人行道（FN3.GG：G11 店面中心 x、門口互動點 z；往街上退 dz m）——DOOR 那一段測從遠處走過來，這裡只是前置"""
    gg = await pg.evaluate("(typeof FN3!=='undefined'&&FN3.GG)?Object.assign({},FN3.GG):null") or {'cx': 46.6, 'doorZ': 21}
    return await F.load(pg, cdp, '%s G11 門前的人行道（FN3.GG %s）' % (tag, J(gg)), x=gg['cx'], z=gg['doorZ'] - dz, yaw=0.0, hour=hour, money=money, day_key=day_key, quiet_events=quiet_events)


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


def _is_narr(t):
    return t.startswith('（')


async def counter_once(pg, cdp, tag, it, pick_name=None, double=False):
    """按「買花」：一路記每一句（說話的人、整句）、清單；pick_name＝選開頭是它的那一樣（None＝選「算了」）、double＝連點兩下。
    回傳 {pre:[清單出來以前的句子], opts, post:[選了以後的句子], toast, b0, b1}"""
    b0 = await pg.evaluate(F.BAG_JS); await F.toasts(pg, clear=True)
    s = await F.wait_btn(pg, it['label'], 6)
    if not s['interact'].startswith(it['label']): return {'err': '互動鍵不是「%s」：%s' % (it['label'], s['interact']), 'b0': b0, 'b1': b0, 'pre': [], 'post': [], 'opts': None, 'toast': []}
    top = await F.cur_btn(pg)
    if not top['ok']: R.note('%s 互動鍵被蓋住（最上層 %s）：先收起來' % (tag, top.get('top'))); await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(700)
    pre, opts = await F.lines_until_idle(pg, cdp, 25)
    post = []
    if opts:
        if pick_name is None: k = next((i for i, x in enumerate(opts) if x['t'].startswith('算了')), len(opts) - 1)
        else: k = next((i for i, x in enumerate(opts) if x['t'].startswith(pick_name + '　')), None)
        if k is None: return {'err': '清單沒有「%s」' % pick_name, 'b0': b0, 'b1': await pg.evaluate(F.BAG_JS), 'pre': pre, 'post': [], 'opts': opts, 'toast': await F.toasts(pg)}
        await pg.wait_for_timeout(600)   # ?tapguard：選單出現 350 ms 內的點不收（game3d.js TAP_GUARD=350），像玩家看完清單再點
        await F.choose_k(pg, cdp, k, double=double)
        post, more = await F.lines_until_idle(pg, cdp, 30, pick=lambda ts: next((i for i, t in enumerate(ts) if t.startswith('算了')), None))
        if more: post.append({'who': '【沒處理的選單】', 't': '｜'.join(x['t'][:20] for x in more)})
    await pg.wait_for_timeout(800)
    return {'pre': pre, 'opts': opts, 'post': post, 'toast': await F.toasts(pg), 'b0': b0, 'b1': await pg.evaluate(F.BAG_JS)}


async def part_buy(pg, cdp):
    tag = '[BUY]'
    await g11_street(pg, cdp, tag, 11.0, money=10000)
    ex = await F.fn_expect(pg, tag); CTX['ex'] = ex
    it = await reach_flower(pg, cdp, tag)
    if not it: return
    if not R.check('%s 期望值有十樣（%s：%s）' % (tag, ex['src'], J(ex['ids'])), len(ex['ids']) == 10, ''): return
    items = [dict(id=g, **ex['items'][g]) for g in ex['ids']]
    want_opts = ['%s　%s 元' % (x['name'], x['price']) for x in items] + ['算了']
    # ① 打開、看清單、選算了
    r = await counter_once(pg, cdp, tag + ' ①', it, None)
    R.note('%s ① 按「%s」：清單前 %s；清單 %s；之後 %s' % (tag, it['label'], J(r['pre']), J([o['t'][:30] for o in (r['opts'] or [])]), J(r['post'])))
    if not R.check('%s ① 出買花清單' % tag, bool(r.get('opts')), J(r)[:400]): return
    await D.shot(pg, 'fn_buy_list', judge_black=False)
    g0 = r['pre'][0] if r['pre'] else {}
    R.check('%s ① 第一句是花藝師（說話的人「%s」）說稿 greet 三句之一：%s「%s」' % (tag, ex['who'], g0.get('who'), g0.get('t')), len(r['pre']) == 1 and g0.get('who') == ex['who'] and g0.get('t') in ex['greet'], J(r['pre']))
    shown = [o['t'] for o in r['opts']]
    heads = [(re.match(r'^(.+?　\d+ 元)', t) or re.match(r'^(.*)$', t)).group(1) for t in shown]   # 按鈕的 textContent 後面接 hint（那一樣的說明）：只取「名字　價錢 元」
    R.check('%s ① 清單＝稿的十樣「名字　價錢 元」（順序、名字、價錢）＋「算了」' % tag, heads[:10] == want_opts[:10] and shown[-1].startswith('算了') and len(shown) == 11, J({'畫面': heads, '稿': want_opts})[:700])
    for gid, price in (('g_bouquet', 450), ('g_sunflower', 120)):   # BB_312 購物 1：LAWWW 21:28 代號和價錢不改
        m = next((x for x in items if x['id'] == gid), None)
        R.check('%s ① 原有商品 %s 在清單、價錢照舊 %d（BB_312 購物 1）' % (tag, gid, price), bool(m) and m['price'] == price and any(t.startswith('%s　%d 元' % (m['name'], price)) for t in shown), J(m))
    R.check('%s ① 選「算了」不扣錢（%d→%d）、包包沒變' % (tag, r['b0']['money'], r['b1']['money']), r['b1']['money'] == r['b0']['money'] and len(r['b1']['bag']) == len(r['b0']['bag']), '')
    gseq = [g0.get('t')]

    def check_buy(tg, itm, r, once=True):
        pre, post = r['pre'], r['post']
        if pre: gseq.append(pre[0].get('t'))
        dm = r['b0']['money'] - r['b1']['money']; nb = len(r['b1']['bag']) - len(r['b0']['bag'])
        new = [b for b in r['b1']['bag'] if b['id'] == itm['id']]
        want = [{'who': '' if _is_narr(t) else ex['who'], 't': t} for t in (ex['buy'].get(itm['id']) or [])] + [{'who': '', 't': '你買了%s，放進包包。' % itm['name']}]   # 最後一句＝GIFTH.buy 原本的（gifthol3d.js 122）
        R.note('%s 句子：前 %s；後 %s；toast %s' % (tg, J(pre), J(post), J(r['toast'])))
        R.check('%s 先是花藝師說 greet 一句' % tg, len(pre) == 1 and pre[0].get('who') == ex['who'] and pre[0].get('t') in ex['greet'], J(pre))
        R.check('%s 選了以後的句子＝稿 buy[%s]（（）開頭＝旁白）＋「你買了%s，放進包包。」' % (tg, itm['id'], itm['name']), post == want, J({'畫面': post, '稿': want}))
        R.check('%s 錢 %d→%d 少 %d＝價格 %d（只扣一次）、包包多 %d 樣' % (tg, r['b0']['money'], r['b1']['money'], dm, itm['price'], nb), dm == itm['price'] and nb == 1, J(r['b1']['bag'])[:300])
        R.check('%s 「%s」進包包、shop＝%s' % (tg, itm['name'], F.SHOP_KEY), len(new) >= 1 and all(b['shop'] == F.SHOP_KEY for b in new), J(new))

    # ② 連點兩下最便宜的
    cheap = min(items, key=lambda x: x['price'])
    r = await counter_once(pg, cdp, tag + ' ②', it, cheap['name'], double=True)
    if r.get('pre'): gseq.append(r['pre'][0].get('t'))
    dm = r['b0']['money'] - r['b1']['money']; nb = len(r['b1']['bag']) - len(r['b0']['bag'])
    R.note('%s ② 連點兩下「%s」：%s' % (tag, cheap['name'], J({k: r.get(k) for k in ('pre', 'post', 'toast', 'err')})))
    R.check('%s ② 連點兩下「%s」（70 ms）：只扣一次（少 %d、價格 %d）、包包只多 %d 樣（購物 5）' % (tag, cheap['name'], dm, cheap['price'], nb), not r.get('err') and dm == cheap['price'] and nb == 1, J({'before': r['b0'], 'after': r['b1']})[:400])
    # 連點的第二下可能點到下一句對話（句子不在這裡判）；這一樣的句子在 ④ 正常買一次再判：【前置】把連點買到的那一樣從包包拿掉（包包上限 10＝十樣剛好放滿）
    n_rm = await pg.evaluate("(g=>{ const b=GIFTH.rec(GAME.G).bag; const i=b.findIndex(x=>x.id===g); if(i<0) return 0; b.splice(i,1); return 1; })(%s)" % J(cheap['id']))
    R.setup('%s ②【前置】把連點買到的「%s」從包包拿掉（%d 樣；④ 十樣各正常買一次、判句子）' % (tag, cheap['name'], n_rm))
    # ③ 錢不夠
    poor = cheap['price'] - 1
    await pg.evaluate("(m=>{ GAME.G.money=m; })(%d)" % poor); R.setup('%s ③【前置】錢改成 %d（最便宜的「%s」%d 元 − 1）' % (tag, poor, cheap['name'], cheap['price']))
    r = await counter_once(pg, cdp, tag + ' ③', it, cheap['name'])
    if r.get('pre'): gseq.append(r['pre'][0].get('t'))
    dim = next((o['dim'] for o in (r.get('opts') or []) if o['t'].startswith(cheap['name'] + '　')), None)
    R.note('%s ③ 錢不夠按「%s」（選項灰掉 %s）：%s' % (tag, cheap['name'], dim, J({k: r.get(k) for k in ('pre', 'post', 'toast', 'err')})))
    R.check('%s ③ 錢不夠：不扣錢（%d→%d）、不給東西（包包 %d→%d 樣）、toast「錢不夠」、不演 buy 句子' % (tag, r['b0']['money'], r['b1']['money'], len(r['b0']['bag']), len(r['b1']['bag'])),
            not r.get('err') and r['b1']['money'] == r['b0']['money'] and len(r['b1']['bag']) == len(r['b0']['bag']) and any('錢不夠' in t for t in r['toast']) and not any(x['t'] in (ex['buy'].get(cheap['id']) or []) for x in r['post']), J(r)[:400])
    await pg.evaluate("GAME.G.money=10000"); R.setup('%s【前置】錢改回 10000' % tag)
    # ④ 其他九樣
    for itm in items:
        r = await counter_once(pg, cdp, '%s ④ 買 %s' % (tag, itm['id']), it, itm['name'])
        if r.get('err'): R.check('%s ④ 買「%s」' % (tag, itm['name']), False, r['err']); continue
        check_buy('%s ④ 買「%s」：' % (tag, itm['name']), itm, r)
    R.note('%s greet 依序出現的句子：%s（稿：%s）' % (tag, J(gseq), J(ex['greet'])))
    # ⑤ 包包滿了
    bg = await pg.evaluate(F.BAG_JS)
    R.check('%s 十樣都買過：GIFTH.bag 有稿的十個 id' % tag, sorted(b['id'] for b in bg['bag']) == sorted(ex['ids']), J([b['id'] for b in bg['bag']]))
    if len(bg['bag']) >= 10:
        hint = await pg.evaluate("(()=>{ const o=GIFTH.shopOpt(GAME.G,'gg_flower'); return o?o.hint:null; })()")
        r = await counter_once(pg, cdp, tag + ' ⑤', it, None)
        R.note('%s ⑤ 包包滿了按「買花」：%s' % (tag, J({k: r.get(k) for k in ('pre', 'opts', 'post', 'toast')})))
        R.check('%s ⑤ 包包滿了（10 樣）：不出清單、不扣錢、提示「%s」' % (tag, hint), not r.get('opts') and r['b1']['money'] == r['b0']['money'] and bool(hint) and any(hint in t for t in r['toast']), J(r['toast']))
    # ⑥ 包包頁
    ui = await F.bag_ui(pg, cdp)
    R.note('%s 選單「物品」：%s' % (tag, J(ui[:600])))
    miss = [x['name'] for x in items if x['name'] not in ui]
    R.check('%s ⑥ 選單「物品」看得到十樣的名字' % tag, not miss, '沒看到：' + J(miss))
    await F.shop_names(pg, cdp, tag, ui=ui)
    R.check('%s ⑥ 包包裡每一樣的 shop 都是 %s' % (tag, F.SHOP_KEY), bool(bg['bag']) and all(b['shop'] == F.SHOP_KEY for b in bg['bag']), J(bg['bag'])[:300])
    CTX['buy_it'] = it


def _hm(h):
    return '%02d:%02d' % (int(h), int(round((h % 1) * 60)) % 60)


async def part_hours(pg, cdp):
    tag = '[HOURS]'
    await g11_street(pg, cdp, tag + ' 讀期望值', 14.0)
    ex = CTX.get('ex') or await F.fn_expect(pg, tag); w = ex['hours']
    R.note('%s 營業時間：稿 %s → %s；頁面 FNS.hours %s、PLACES.hours.flower_notes %s' % (tag, ex['hours_s'], J(w), J(ex['page'].get('hours')), J(ex['page'].get('place'))))
    if not R.check('%s 稿的營業時間讀得出來、PLACES.hours.flower_notes 每天＝它' % tag, bool(w) and bool(ex['page'].get('place')) and all(x == w for x in ex['page']['place']['rules']['week']), J(ex['page'].get('place'))): return
    rnd = random.Random(SEED); a = rnd.random()
    hr = round(6.0 + a * 2 * (w[0] - 0.42 - 6.0), 2) if a < 0.5 else round(w[1] + 0.25 + (a - 0.5) * 2 * (23.5 - w[1] - 0.25), 2)
    cases = [(w[0] - 0.25, 'before'), (w[1] + 1 / 6, 'after'), (hr, 'seed'), (w[0] + 1 / 3, 'open')]
    for h, why in cases:
        tg = '%s %s（%s）' % (tag, _hm(h), {'before': '開門前', 'after': '打烊後', 'seed': 'SEED %d 抽的營業時間外' % SEED, 'open': '營業中對照'}[why])
        await g11_street(pg, cdp, tg, h, dz=4.0)
        door, exs = await F.find_door(pg, await F.g11(pg))
        if not R.check('%s 公館有「進入花序」' % tg, bool(door), J(exs)): continue
        r = await F.joy_to(pg, cdp, tg, door['x'], door['z'], near=0.9, lv=0, max_s=90, btn=door['label'], stop_on_event=True)
        s = await D.st(pg)
        if not R.check('%s 搖桿走到門口，互動鍵是「%s」（%s 秒、路：搖桿照 pathTo）' % (tg, door['label'], r['t']), s['interact'].startswith(door['label']), J({'end': [s['x'], s['z']], 'btn': s['interact'], 'why': r.get('why'), 'event': r.get('event')})):
            await D.shot(pg, 'fn_hours_nobtn_%04d' % int(h * 100), judge_black=False); continue
        top = await F.cur_btn(pg)
        if not top['ok']: R.note('%s 互動鍵被蓋住（%s），先收起來' % (tg, top.get('top'))); await L.close_panels(pg, cdp)
        await F.toasts(pg, clear=True)
        h_at = await pg.evaluate("+GAME.G.hour")
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        lines, opts = await F.lines_until_idle(pg, cdp, 20)
        hh = ((h_at % 24) + 24) % 24; is_open = w[0] - 1e-6 <= hh < w[1] - 1e-6
        if is_open: await D.wait_zone(pg, cdp, 'flower_notes', 60)   # 營業中：等換區域（雲端慢）
        await pg.wait_for_timeout(2500); s = await D.st(pg); ts = await F.toasts(pg)
        edge = min(abs(hh - w[0]), abs(hh - w[1])) < 2 / 60
        R.note('%s 按的那一刻 %s（%.3f）：營業中 %s；之後 zone %s、句子 %s、選單 %s、toast %s' % (tg, _hm(hh), hh, is_open, s['zone'], J(lines), J([o['t'] for o in opts] if opts else None), J(ts)))
        if edge: R.note('%s ★按的那一刻離開門／打烊不到 2 分鐘，這一次不判（乙 6）' % tg); continue
        if (why == 'open') != is_open: R.note('%s ★按的那一刻和預定的不一樣（預定 %s），照按的那一刻判' % (tg, why))
        if is_open:
            R.check('%s 營業中：進到 flower_notes、站得住' % tg, s['zone'] == 'flower_notes' and s['stand'], J(s))
        else:
            await D.shot(pg, 'fn_hours_closed_%04d' % int(h * 100), judge_black=False)
            R.check('%s 營業時間外：沒進去（還在公館）' % tg, s['zone'] == 'gongguan', J(s))
            R.check('%s 營業時間外：只演一句＝稿 staff.closed（旁白、沒有說話的人）' % tg, lines == [{'who': '', 't': ex['closed']}], J({'畫面': lines, '稿': ex['closed']}))
            nm = ex.get('shop_name') or F.EXPECT_NAME
            R.check('%s 營業時間外：toast 寫店名「%s」和開門時間 %s' % (tg, nm, _hm(w[0])), any(nm in t and _hm(w[0]) in t for t in ts), J(ts))
    # CLOSE：人在店裡到了打烊
    tg = '%s CLOSE' % tag
    cs = await F.load(pg, cdp, '%s 店裡買花前面' % tg, zone='flower_notes', x=1.6, z=4.4, yaw=math.pi / 2, hour=w[1] - 8 / 60)
    xs = (await F.fn_data(pg)).get('xs') or {}
    R.note('%s XSCLOSE.ZONES.flower_notes：%s；讀進來 %s' % (tg, J(xs), J(cs)))
    R.check('%s 打烊的說話人＝稿 staff.who「%s」、出去到公館（XSCLOSE 登記）' % (tg, ex['who']), xs.get('who') == ex['who'] and xs.get('to') == 'gongguan', J(xs))
    t0 = time.time(); lines = []; lim = float(os.environ.get('HOURS_WAIT') or 1500); last_note = t0; seen = False
    while time.time() - t0 < lim:
        q = await L.state(pg)
        if q['dlg'] or q['choices']:
            got, more = await F.lines_until_idle(pg, cdp, 30, pick=lambda ts: next((i for i, t in enumerate(ts) if any(w in t for w in ('算了', '離開', '先這樣'))), None))
            lines += got
            if more: lines.append({'who': '【選單】', 't': '｜'.join(o['t'][:20] for o in more)}); break
            seen = True; continue
        if q['zone'] == 'gongguan' and not q['busy']: break
        if time.time() - last_note > 30:
            last_note = time.time(); R.note('%s 等打烊：%s（%d 秒）' % (tg, J({k: q[k] for k in ('zone', 'hour', 'x', 'z', 'busy')}), time.time() - t0))
            await D.shot(pg, 'fn_close_wait', judge_black=False)
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500); s = await D.st(pg)
    R.note('%s 等了 %d 秒：句子 %s；現在 %s' % (tg, time.time() - t0, J(lines), J(s)))
    R.check('%s 到了 %s 花藝師說「%s」（AA_700，XSCLOSE.LINE）' % (tg, _hm(w[1]), xs.get('line')), seen and any(x['who'] == ex['who'] and x['t'] == xs.get('line') for x in lines), J(lines))
    door, _ = await F.find_door(pg, await F.g11(pg)) if s['zone'] == 'gongguan' else (None, None)
    dd = math.hypot(s['x'] - door['x'], s['z'] - door['z']) if door else None
    R.check('%s 人到公館、離「進入花序」%s m（≤3.5）、站得住' % (tg, dd and round(dd, 2)), s['zone'] == 'gongguan' and dd is not None and dd <= 3.5 and s['stand'], J(s))
    if s['zone'] == 'gongguan':
        await F.ready(pg, cdp, 15); mv = await D.pushable(pg, cdp)
        R.check('%s 出來以後搖桿推得動 %.2f m（≥0.3）' % (tg, mv), mv >= 0.3, '')


CAPTION_FULL_JS = r"""(()=>{ const e=document.getElementById('caption'); if(!e) return {on:false,t:''}; const cs=getComputedStyle(e); const on=!(e.classList.contains('hide')||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05); return {on, t:(e.innerText||'').trim()}; })()"""


async def part_look(pg, cdp):
    tag = '[LOOK]'
    await F.load(pg, cdp, '%s 店裡門口' % tag, zone='flower_notes', x=0.0, z=5.6, yaw=math.pi, hour=14.0)
    ex = CTX.get('ex') or await F.fn_expect(pg, tag); pd = await F.fn_data(pg)
    its = [p for p in (pd.get('lookIts') or []) if not p['hidden']]
    keys = list(ex['looks'].keys())
    R.note('%s 店裡的「看」互動點 %d 個：%s' % (tag, len(its), J([[p['kind'], p['label'], p['x'], p['z'], p['lv']] for p in its])))
    R.note('%s 店裡所有「看…」的按鈕：%s' % (tag, J(pd.get('lookLabels'))))
    miss = [k for k in keys if not any(p['kind'] == k for p in its)]
    R.check('%s 稿的 %d 個 key 每一個都有「看」的互動點' % (tag, len(keys)), len(keys) == 13 and not miss, '沒有：' + J(miss))
    R.check('%s 每個「看」的按鈕字不是空的' % tag, all(p['label'].strip() for p in its), J([p['label'] for p in its]))
    R.check('%s 配置的「看中央展示台」（稿沒有句子）不在' % tag, '看中央展示台' not in (pd.get('lookLabels') or []), J(pd.get('lookLabels')))
    only = [x.strip() for x in (os.environ.get('LOOKS') or '').split(',') if x.strip()]
    todo = [p for p in its if not only or p['kind'] in only]
    if only: R.note('%s LOOKS＝%s：只跑 %d 點（其他沒跑，不算）' % (tag, J(only), len(todo)))
    todo.sort(key=lambda p: (p['lv'], -p['z']))   # 一樓從門口往裡，再上二樓
    done = {}
    for p in todo:
        tg = '%s %s（%s，lv %d (%.2f, %.2f)）' % (tag, p['kind'], p['label'], p['lv'], p['x'], p['z'])
        want = ex['looks'].get(p['kind'])
        s = await D.st(pg)
        if p['lv'] == 1 and s['lv'] != 1:
            r = await F.joy_to(pg, cdp, tag + ' 上樓', 4.15, -6.05, near=0.6, lv=1, max_s=180, stop_on_event=True)   # 樓梯頂平台（配置 landing x 3.4～4.9、z −6.8～−5.32）
            R.check('%s 搖桿走上樓梯到二樓平台（lv %s、%s 秒）' % (tag, r['end']['lv'], r['t']), r['ok'] and r['end']['lv'] == 1 and not r['jumps'], J({'end': r['end'], 'why': r.get('why'), 'event': r.get('event'), 'jumps': r['jumps']}))
            if not r['ok']: await D.shot(pg, 'fn_look_up_stuck', judge_black=False); break
        cl = await F.look_cells(pg, p)
        if not R.check('%s 範圍裡有站得住、互動鍵會是它的格子' % tg, bool(cl['cells']), J(cl)): continue
        res = None; tried = []
        for c in cl['cells'][:4]:
            r = await F.joy_to(pg, cdp, tg, c['x'], c['z'], near=0.3, lv=p['lv'], max_s=90, stop_on_event=True)
            s = await D.settle(pg)
            if r.get('event'): tried.append({'cell': c, 'why': r['why'], 'event': r['event']}); await F.lines_until_idle(pg, cdp, 20); continue
            if not s['interact'].startswith(p['label']):
                tried.append({'cell': c, 'why': '互動鍵是「%s」' % s['interact'], 'at': [s['x'], s['z']], 'walk': r.get('why')}); continue
            top = await F.cur_btn(pg)
            if not top['ok']: tried.append({'cell': c, 'why': '互動鍵被蓋住：%s' % top.get('top')}); await L.close_panels(pg, cdp); continue
            for _ in range(14):   # 上一句旁白還在就等它收起來（4.6 秒），才知道這一句是這一次按出來的
                if not (await pg.evaluate(CAPTION_FULL_JS))['on']: break
                await pg.wait_for_timeout(500)
            near = await pg.evaluate("(()=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return it?(it.fnLook||it.label||null):null; })()")
            await L.tap(pg, cdp, '#interact'); cap = None
            for _ in range(10):
                await pg.wait_for_timeout(300); c2 = await pg.evaluate(CAPTION_FULL_JS)
                if c2['on'] and c2['t']: cap = c2['t']; break
            q = await D.st(pg)
            if q['dlg'] or q['choices']: await F.lines_until_idle(pg, cdp, 20)
            if cap is not None and cap != want and cap in ex['looks'].values():
                tried.append({'cell': c, 'why': '旁白是別區的「看」：%s' % cap[:30], 'nearest(log)': near}); continue
            res = {'cap': cap, 'cell': c, 'at': [s['x'], s['z']], 'nearest(log)': near}; break
        R.note('%s 試過的格子：%s；結果 %s' % (tg, J(tried), J(res)))
        if not R.check('%s 走到互動鍵是「%s」的地方、按得到（試了 %d 格）' % (tg, p['label'], len(tried) + (1 if res else 0)), bool(res), J(tried)[:500]):
            await D.shot(pg, 'fn_look_fail_%s_%d' % (p['kind'], p['lv']), judge_black=False); continue
        R.check('%s 按下去的旁白不是空的、整句＝稿 looks.%s' % (tg, p['kind']), bool(res['cap']) and res['cap'] == want, J({'畫面': res['cap'], '稿': want}))
        done[p['kind']] = done.get(p['kind'], 0) + 1
        if len(done) == 1: await D.shot(pg, 'fn_look_first', judge_black=False)
    R.note('%s 跑到的 %d 種：%s' % (tag, len(done), J(done)))
    if not only: R.check('%s 13 種都按到、都有字（這一行證明真的每一區都走到了）' % tag, sorted(done) == sorted(keys), '沒按到：' + J([k for k in keys if k not in done]))


async def part_gift(pg, cdp):
    """送禮選單上的店名（LAWWW 23:16）：【前置】GIFT_DAY（預設 2025-12-24 聖誕）11:00、G11 門前、包包清空 → 進花序買一束花 →【捷徑】GAME.enter 到 GIFT_WHO（預設 heroine_05）那時候在的區域
    → 走過去說話 →「送她禮物…」→ 那一層每一樣的店名（hint）→ 送出一束花（GIFTH.hand：given 記上）"""
    tag = '[GIFT]'; who = os.environ.get('GIFT_WHO') or 'heroine_05'
    await g11_street(pg, cdp, tag, 11.0, day_key=os.environ.get('GIFT_DAY') or '2025-12-24', quiet_events=False)
    it = await reach_flower(pg, cdp, tag)
    if not it: return
    bq = await pg.evaluate("(()=>{ const i=GIFTH.item('g_bouquet'); return i?{id:'g_bouquet',name:i.name,price:i.price}:null; })()")
    if not R.check('%s 有一束花可以買' % tag, bool(bq), ''): return
    r = await counter_once(pg, cdp, tag, it, bq['name'])
    if not R.check('%s 買了一束花' % tag, not r.get('err') and len(r['b1']['bag']) == len(r['b0']['bag']) + 1, J(r)[:300]): return
    if not await F.go_her(pg, cdp, tag, who): return
    g = await F.give(pg, cdp, tag, who, 'g_bouquet')
    R.note('%s 送花：%s' % (tag, J(g)))
    await F.shop_names(pg, cdp, tag, gift_opts=F.gift_menu(g) or [])
    rec = await pg.evaluate("(%s)(%s)" % (F.GIFTREC_JS, J(who)))
    R.check('%s 一束花送出去了（given 有它）' % tag, g['picked'] and 'g_bouquet' in rec['given'], J(rec))


async def main():
    sha = os.environ.get('SHA', '')[:9]
    print('CC FN_func（FLOWER-NOTES-1110）：PARTS %s；SHA %s；SEED %d；Playwright ≠ iPhone' % (','.join(PARTS), sha, SEED), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('網址 %s（%s）' % (URL, '加 ?tapguard：選單剛出來那一下不收點擊，和手機一樣' if 'tapguard' in URL else '沒加 ?tapguard'))
        for part, fn in (('LIST', part_list), ('OLDSPOT', part_oldspot), ('DOOR', part_door), ('BUY', part_buy), ('HOURS', part_hours), ('LOOK', part_look), ('GIFT', part_gift)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e:
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:300]); await D.shot(pg, 'fn_func_exc_%s' % part.lower(), judge_black=False)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
