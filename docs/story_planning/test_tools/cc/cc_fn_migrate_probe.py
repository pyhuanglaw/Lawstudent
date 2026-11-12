"""CC（帳號 A）11-10：FN_migrate——花序 Flower Notes（FLOWER-NOTES-1110／X325，BB_312 驗收計畫第 2 節 技術 2：舊存檔）。Playwright（PC GPU）≠ iPhone。
改之前的版本（開發分支 632ef134e）用真的玩法做存檔，改之後的版本從標題「繼續」讀進來（自動存檔那一格，game3d.js：有 fatiao3d_auto 才出 #btnContinue）。
存檔怎麼存：GAME.quickSave()（右上 💾「存檔」同一個函式）→ GAME.readSave('fatiao3d_quick')；劇情進行中存不了才退回 GAME.snapshot()（會寫在輸出）。
四種（CASES，預設 1,2,3,4）：
  1  站在舊花攤前面存的：【前置】day46 公館 10:00 → 觸控走到「看看花攤」（gg_flower）按鈕出現 → 存。
  2  包包有舊花攤買的花：【前置】day46 改 GIFT_DAY（預設 2025-12-24，聖誕＝GIFTH 送禮節日）11:00 公館、包包清空 → 走到花攤 → 買一束花 g_bouquet、一朵向日葵 g_sunflower → 存（人在花攤前面）。
  3  存在原 G11 店裡：先查改之前 G11 有沒有門（exit 在 G11 寬度裡）——632ef134e 的 G11＝泰米村食 type none（src/zones3d.js 937、939：沒有互動點、進不去；
     泰米村食進得去的是汀州路那一間 tingzhou_layout.js taimi，不是 G11）＝不做，改做 3b：站在 G11 騎樓（G11 中間、立面後 1.5 m）存的。
  4  節日送過花的：接 2 → 【捷徑】GAME.enter 到她那時候在的區域（STORY.whereIs；預設 GIFT_WHO＝heroine_05 溫書瑀，2025-12-24 10:00～17:00 在 library）
     → 觸控走到她旁邊 → 「和她說話」→「送她禮物…」→ 一束花（GIFTH.giveTalk／hand：given[她]、sent['她|xmas|2025']、fest['xmas|2025']、記憶 GIFT_GIVEN_／GIFT_LOVE_）→ 存。
新版讀檔以後（每一個都：重新整理 → 自動存檔放這一份 → 標題「繼續」）：
  共通：讀得進來（同一天、同一區）、沒有 JS 例外、站的格子可走（E.canStand r0.3）、搖桿推得動 ≥0.3 m（D.pushable 四個方向試）。
  1  另記：人在不在舊花攤的範圍裡、離最近的 gg_flower 多遠。
  2  包包還有兩樣、shop＝gg_flower、選單「物品」看得到；舊花送得出去：【捷徑】進她的區域 → 走過去說話 → 「送她禮物…」→ 一束花 → given／sent 記上、包包少一束。
  3b 搖桿往街上（−z）推得動 ≥1 m。
  4  送過的紀錄還在（given、sent、fest、記憶和存檔時一樣）；當天再和她說話不出「送她禮物…」（GIFTH.sentThis：一個節日一份）。
兩種跑法：
  A 一支跑完（PC 佇列 kind game，XARGS={url2} {url} {out}）：python3 cc_fn_migrate_probe.py <改之前網址> <改之後網址> <out>
  B 兩段：MODE=make python3 cc_fn_migrate_probe.py <改之前網址> <out>（存檔寫到 <out>/fn_saves/）；
         MODE=load SAVES_FROM=<上一段的 out 或 fn_saves 資料夾> python3 cc_fn_migrate_probe.py <改之後網址> <out>
進原 G11（CC-C 11-12，BB-C 驗收「三種舊存檔進原 G11 不壞」；MODE=load、both 的 1、2、4 都做，G11=0 不做）：
  讀進來以後（1、2 在公館：觸控點地板沿街走到 G11 門前〔F.walk_seg：途中有劇情就停下、照字處理、記下來〕；MIG_G11=jump 或存檔不在公館〔4 在總圖〕＝【捷徑】GAME.enter 公館 G11 門前）
  → 搖桿走到「進入花序」（互動鍵出現那個字就算到）→ 按 → 到 flower_notes、站得住、搖桿推得動 ≥0.3 m、walkFallbacks 沒增加；2：包包裡舊花攤的兩樣還在
  → 觸控走到「離開花序」→ 按 → 回公館、離「進入花序」≤3.5 m、站得住。按門的那一刻不在營業時間（FNS.open＝false）＝【前置】時間改營業中再按（寫明）。
  雲端預設的存檔：MODE=load 沒給 SAVES_FROM＝fixtures/fn_old_saves_fd4dd9aef/（PC FN_mig_a 739cbcae03 的 save_1、FN_mig_b 38fb99f182 的 save_2、save_4：
  fd4dd9aef6cb0d31b06d137636a25ab52eceedc4〔公館捷運口舊花攤還在的版本〕用 quickSave 存的＝BB_312 技術 2 的三種）。
CC_02 清單 2026-11-12：1✓ 2✓ 3n/a（存檔是固定的三份，沒有候選可挑） 4✓ 5✓ 6✓ 7✓ 8✓ 9n/a（截圖只當證據，判斷看狀態） 10✓ 11✓ 12✓ 13✓——這次改／審的是「進原 G11」那一段、MODE=load 的預設存檔、網址加 ?tapguard；MAKE、LOAD 原本的檢查是帳號 A 寫的，沒重審
環境變數：CASES、GIFT_DAY、GIFT_WHO、GIFT_ITEM（預設 g_bouquet）、START（'x,z'，預設 −40,8）、FN_G11、G11（0＝不做進原 G11）、MIG_G11（walk／jump）、MIG_WALK_S（沿街走的上限秒數，預設 420）、TAPGUARD。
用法：LW_TESTS=<wt>/tests SHA=<sha> MODE=make|load python3 cc_fn_migrate_probe.py ..."""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
TWO = len(sys.argv) >= 4
if TWO: URL_OLD, URL_NEW, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; MODE = 'both'
else:
    MODE = (os.environ.get('MODE') or 'make').lower(); OUT = sys.argv[2]
    URL_OLD = sys.argv[1] if MODE == 'make' else None; URL_NEW = sys.argv[1] if MODE == 'load' else None
os.makedirs(OUT, exist_ok=True)
_tg = lambda u: u if (not u or 'tapguard' in u or os.environ.get('TAPGUARD', '1') == '0') else u + ('&' if '?' in u else '?') + 'tapguard'   # CC_02 乙 4：和手機一樣擋選單剛出來那一下的誤點
URL_OLD, URL_NEW = _tg(URL_OLD), _tg(URL_NEW)
FIX_SAVES = os.path.join(HERE, 'fixtures', 'fn_old_saves_fd4dd9aef')
DO_G11 = os.environ.get('G11', '1') != '0'
MIG_G11 = (os.environ.get('MIG_G11') or 'walk').lower()
CASES = [c.strip().lower() for c in (os.environ.get('CASES') or '1,2,3,4').split(',') if c.strip()]
R = L.Run('fn_migrate_' + MODE, OUT); F.setup(R, OUT)
J = F.J
GIFT_DAY = os.environ.get('GIFT_DAY') or '2025-12-24'
GIFT_WHO = os.environ.get('GIFT_WHO') or 'heroine_05'
GIFT_ITEM = os.environ.get('GIFT_ITEM') or 'g_bouquet'
START = [float(v) for v in (os.environ.get('START') or '-40,8').split(',')]
SAVEDIR = os.path.join(OUT, 'fn_saves')
META_JS = r"""((pid)=>{ const G=GAME.G, P=GAME.E.player.obj.position; const R=((G.flags||{}).GIFTH)||{}; const M=(typeof SOCIAL!=='undefined'&&SOCIAL.memories)?(SOCIAL.memories(pid)||[]):[];
  return {zone:G.zone, day:G.day, hour:+(+G.hour).toFixed(2), x:+P.x.toFixed(2), z:+P.z.toFixed(2), lv:GAME.E.player.lv|0, money:G.money|0, ver:(document.body.textContent.match(/版本 v[0-9.]+/)||[''])[0],
    bag:(R.bag||[]).map(b=>({id:b.id,shop:b.shop,day:b.day})), given:R.given||{}, sent:R.sent||{}, fest:R.fest||{}, giftMem:M.filter(m=>m&&/^GIFT_/.test(m.tag||'')).map(m=>m.tag)}; })"""


async def save_now(pg, k, why):
    r = await pg.evaluate(F.SAVE_NOW_JS)
    meta = await pg.evaluate("(%s)(%s)" % (META_JS, J(GIFT_WHO)))
    os.makedirs(SAVEDIR, exist_ok=True)
    json.dump(r['s'], open(os.path.join(SAVEDIR, 'save_%s.json' % k), 'w', encoding='utf-8'), ensure_ascii=False)
    R.note('[MAKE %s] 存了（%s；%s）：%s' % (k, r['how'], why, J(meta)))
    R.check('[MAKE %s] 用遊戲的快速存檔存得起來（不是退回 snapshot）' % k, r['ok'], r['how'])
    return {'why': why, 'how': r['how'], 'meta': meta}


async def to_stall(pg, cdp, tag):
    fl = await pg.evaluate("(%s)(%s)" % (F.LIST_FLOWER_JS, J(F.FLOWER_KIND)))
    it = next((x for x in fl if not x['hidden']), None)
    if not R.check('%s 公館有 gg_flower（舊花攤）' % tag, bool(it), J(fl)): return None
    tgt = await D.standable_near(pg, it['x'], it['z'], (it['r'] or 1.2) * 0.6, it['lv'])
    await F.tap_near(pg, cdp, '%s 走到「%s」' % (tag, it['label']), (tgt or it)['x'], (tgt or it)['z'], 0.35)
    s = await F.wait_btn(pg, it['label'], 5)
    R.check('%s 走到「%s」，按鈕是它' % (tag, it['label']), s['interact'].startswith(it['label']), J({'at': [s['x'], s['z']], 'btn': s['interact']}))
    return it


go_her = F.go_her


async def make(pg, cdp):
    ip = os.path.join(SAVEDIR, 'index.json')   # 同一個 out 分幾次做（CASES 拆開）：接著上一次的 index
    idx = json.load(open(ip, encoding='utf-8')) if os.path.exists(ip) else {}
    ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]"); R.note('[MAKE] 改之前的版本：%s' % ver)
    if '1' in CASES:
        tag = '[MAKE 1]'
        await F.load(pg, cdp, '%s 公館街上' % tag, x=START[0], z=START[1], hour=10.0, quiet_events=False)
        if await to_stall(pg, cdp, tag): idx['1'] = await save_now(pg, '1', '站在舊花攤前面')
    if '2' in CASES or '4' in CASES:
        tag = '[MAKE 2]'
        await F.load(pg, cdp, '%s 公館街上（%s 聖誕）' % (tag, GIFT_DAY), x=START[0], z=START[1], hour=11.0, day_key=GIFT_DAY, quiet_events=False)
        it = await to_stall(pg, cdp, tag)
        if it:
            sells = (await F.expect(pg) or {}).get('sells') or []
            for gid in ('g_bouquet', 'g_sunflower'):
                itm = next((x for x in sells if x['id'] == gid), None)
                if not R.check('%s 花攤賣 %s' % (tag, gid), bool(itm), J(sells)): continue
                b0 = await pg.evaluate(F.BAG_JS)
                r = await F.open_shop(pg, cdp, tag, it['label'], [itm])
                if not r['opts']: R.check('%s 打開清單' % tag, False, J(r)); continue
                k = next((i for i, x in enumerate(r['opts']) if x['t'].startswith(itm['name'])), None)
                await F.choose_k(pg, cdp, k); await F.finish_dialog(pg, cdp); b1 = await pg.evaluate(F.BAG_JS)
                R.check('%s 買了「%s」（錢少 %d、包包 %d→%d）' % (tag, itm['name'], b0['money'] - b1['money'], len(b0['bag']), len(b1['bag'])), b0['money'] - b1['money'] == itm['price'] and len(b1['bag']) == len(b0['bag']) + 1, J(b1['bag']))
            await F.wait_btn(pg, it['label'], 3)
            idx['2'] = await save_now(pg, '2', '%s 包包有舊花攤的一束花、向日葵（人在花攤前面）' % GIFT_DAY)
            if '4' in CASES:
                tag = '[MAKE 4]'
                if await go_her(pg, cdp, tag, GIFT_WHO):
                    g = await F.give(pg, cdp, tag, GIFT_WHO, GIFT_ITEM)
                    rec = await pg.evaluate("(%s)(%s)" % (F.GIFTREC_JS, J(GIFT_WHO)))
                    R.note('%s 送花：%s；紀錄 %s' % (tag, J(g), J(rec)))
                    ok = g['offered'] and g['picked'] and GIFT_ITEM in rec['given']
                    if R.check('%s 「送她禮物…」→ %s 送出去了（given 有它）' % (tag, GIFT_ITEM), ok, J({'give': g, 'rec': rec})):
                        idx['4'] = await save_now(pg, '4', '%s 送了 %s 一束花（人在她旁邊）' % (GIFT_DAY, GIFT_WHO))
    if '3' in CASES:
        tag = '[MAKE 3]'
        await F.load(pg, cdp, '%s 公館街上' % tag, x=START[0], z=START[1], hour=14.0, quiet_events=False)
        g = await F.g11(pg); door, exs = await F.find_door(pg, g)
        R.note('%s G11：%s；G11 的門：%s' % (tag, J(g), J(door)))
        if door:
            s = await D.use_exit(pg, cdp, tag, door['label'], door['to'])
            if s: idx['3'] = await save_now(pg, '3', '存在原 G11 店裡（%s）' % door['to'])
        else:
            R.note('%s 改之前 G11 進不去（沒有門）：③ 不做；改做 3b＝站在 G11 騎樓存' % tag)
        if g:
            await F.tap_near(pg, cdp, '%s 走到 G11 騎樓' % tag, g['cx'], g['zf'] + 1.5, 0.6, max_s=300)
            idx['3b'] = await save_now(pg, '3b', '站在 G11 騎樓（G11 中間、立面後 1.5 m）')
    json.dump(idx, open(os.path.join(SAVEDIR, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    R.note('[MAKE] 存檔 %s 寫在 %s' % (J(sorted(idx)), SAVEDIR))
    return idx


async def cont(pg, cdp, url, save):
    """重新整理 → 自動存檔放這一份 → 標題「繼續」"""
    # 先關自動存檔（GM.titleIdle＝true，game3d.js autosave 第一行）：換頁時 visibilitychange→hidden 會 autosave()，把剛放進去的這一份蓋掉
    await pg.evaluate("(v=>{ try{ if(typeof GAME!=='undefined'&&GAME) GAME.titleIdle=true; }catch(e){} localStorage.setItem('fatiao3d_auto', v); })(%s)" % J(json.dumps(save, ensure_ascii=False)))
    await pg.goto(url)
    if not await L.wait_loaded(pg): return False
    await pg.wait_for_timeout(800)
    ok = await L.tap(pg, cdp, '#btnContinue')
    if not ok: ok = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); if(b&&b.offsetParent){ b.click(); return true; } return false; })()")
    for _ in range(40):
        await pg.wait_for_timeout(500)
        if await pg.evaluate("!!(GAME.G&&GAME.E&&GAME.E.player&&document.getElementById('titleScreen').classList.contains('hide'))"): break
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    log = []; await pe.settle(pg, cdp, log, 20)
    if log: R.note('讀進來以後先點完的對話／選項：%s' % J(log[-10:]))
    q, did = await F.ready(pg, cdp)
    R.note('讀進來以後等畫面可以玩：%s；做了 %s' % (J(q), J(did)))
    await pg.evaluate(F.TOAST_HOOK)
    return ok


async def into_g11(pg, cdp, tag, k, bag0=None):
    """三種舊存檔「進原 G11 不壞」：走到公館 G11「進入花序」→ 進店（站得住、推得動、fb 沒增加）→ 出來回到門口"""
    tg = tag + ' 進原 G11'
    gg = await pg.evaluate("(typeof FN3!=='undefined'&&FN3.GG)?Object.assign({},FN3.GG):null") or {'cx': 46.6, 'doorZ': 21}
    s = await D.st(pg); sx, sz = gg['cx'], gg['doorZ'] - 4.0
    if s['zone'] != 'gongguan' or MIG_G11 == 'jump':
        await pg.evaluate("(p=>{ void GAME.enter('gongguan',{x:p[0],z:p[1],yaw:0}); })(%s)" % J([sx, sz]))
        await D.wait_zone(pg, cdp, 'gongguan'); await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp); await F.ready(pg, cdp, 15)
        R.setup('%s【捷徑】GAME.enter(gongguan, G11 門前 (%.1f, %.1f))（存檔在 %s、MIG_G11=%s；不測走過去的路）' % (tg, sx, sz, s['zone'], MIG_G11))
        path = '捷徑 GAME.enter'
    else:
        w = await F.walk_seg(pg, cdp, tg + ' 沿街走到 G11 門前', sx, sz, 1.2, lv=0, max_s=float(os.environ.get('MIG_WALK_S') or 420))
        path = '觸控點地板沿街走（從存檔的位置）'
        if not R.check('%s 從存檔的位置觸控走到 G11 門前 (%.1f, %.1f)（途中劇情 %d 段）' % (tg, sx, sz, len(w['events'])), w['ok'], J({k2: w.get(k2) for k2 in ('why', 'end', 'events')})[:500]):
            await F.shot(pg, cdp, 'fn_mig_%s_g11_walk' % k); return
    R.note('%s 走的路：%s' % (tg, path))
    if not await pg.evaluate("typeof FNS!=='undefined'&&FNS.open(GAME.G)"):
        h0 = await pg.evaluate("+GAME.G.hour"); await pg.evaluate("(()=>{ GAME.G.hour=14; GAME.E.hour=14; })()")
        R.setup('%s【前置】按門的時候 %.2f 不在營業時間：時間改 14:00（營業時間另外由 cc_fn_func_probe HOURS 測）' % (tg, h0))
    door, exs = await F.find_door(pg, await F.g11(pg))
    if not R.check('%s 公館有「進入花序」' % tg, bool(door) and door['to'] == 'flower_notes', J(exs)): return
    fb0 = (await D.st(pg))['fb']
    r = await F.joy_to(pg, cdp, tg, door['x'], door['z'], near=0.9, lv=0, max_s=120, btn=door['label'], stop_on_event=True)
    s = await D.st(pg)
    if not R.check('%s 搖桿走到門口，互動鍵是「%s」（%s 秒）' % (tg, door['label'], r['t']), s['interact'].startswith(door['label']), J({'end': [s['x'], s['z']], 'btn': s['interact'], 'why': r.get('why'), 'event': r.get('event'), 'diag': r.get('pathDiag')})):
        await F.shot(pg, cdp, 'fn_mig_%s_g11_nobtn' % k); return
    top = await F.cur_btn(pg)
    if not top['ok']: R.note('%s 互動鍵被蓋住（%s），先收起來' % (tg, top.get('top'))); await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#interact'); await D.wait_zone(pg, cdp, 'flower_notes'); await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    s = await D.st(pg)
    await F.shot(pg, cdp, 'fn_mig_%s_g11_in' % k)
    R.check('%s 按「%s」進到花序（flower_notes）、站得住、沒有被放到目的地（walkFallbacks %s→%s）' % (tg, door['label'], fb0, s['fb']), s['zone'] == 'flower_notes' and s['stand'] and s['fb'] == fb0, J(s))
    if s['zone'] != 'flower_notes': return
    await F.ready(pg, cdp, 15); mv = await D.pushable(pg, cdp)
    R.check('%s 店裡搖桿推得動 %.2f m（≥0.3）' % (tg, mv), mv >= 0.3, '')
    if bag0 is not None:
        bg = await pg.evaluate(F.BAG_JS)
        R.check('%s 進店以後包包裡舊花攤時期的東西還在（%s）' % (tg, J(bag0)), sorted((b['id'], b['shop']) for b in bg['bag']) == sorted((b['id'], b['shop']) for b in bag0), J(bg['bag']))
    s2 = await D.use_exit(pg, cdp, tg, '離開花序', 'gongguan')
    if s2:
        dd = math.hypot(s2['x'] - door['x'], s2['z'] - door['z'])
        R.check('%s 出來回到公館、離「進入花序」%.2f m（≤3.5）、站得住' % (tg, dd), s2['zone'] == 'gongguan' and dd <= 3.5 and s2['stand'], J(s2))


async def load_one(pg, cdp, url, k, ent, save):
    tag = '[LOAD %s]' % k; m0 = ent['meta']
    R.note('%s 存檔（改之前）：%s' % (tag, J(m0)))
    ok = await cont(pg, cdp, url, save)
    m1 = await pg.evaluate("(%s)(%s)" % (META_JS, J(GIFT_WHO)))
    R.note('%s 讀進來（改之後）：%s' % (tag, J(m1)))
    R.check('%s 標題「繼續」讀得進來（同一天 %s、同一區 %s）' % (tag, m0['day'], m0['zone']), ok and m1['day'] == m0['day'] and m1['zone'] == m0['zone'], J({'ok': ok, 'day': m1['day'], 'zone': m1['zone']}))
    s = await D.st(pg)
    R.check('%s 站的格子可走（canStand r0.3；(%s, %s) lv %s）' % (tag, s['x'], s['z'], s['lv']), bool(s['stand']), J(s))
    await F.shot(pg, cdp, 'fn_mig_%s_loaded' % k)
    await F.ready(pg, cdp, 15)
    mv = await D.pushable(pg, cdp)
    R.check('%s 搖桿推得動 %.2f m（≥0.3，人不卡牆）' % (tag, mv), mv >= 0.3, '')
    if k == '1':
        fl = await pg.evaluate("(%s)(%s)" % (F.LIST_FLOWER_JS, J(F.FLOWER_KIND)))
        inr = abs(m1['x'] - F.OLD_STALL['cx']) <= F.OLD_STALL['w'] / 2 + 0.3 and abs(m1['z'] - F.OLD_STALL['cz']) <= F.OLD_STALL['d'] / 2 + 0.3
        R.note('%s 人在舊花攤範圍裡：%s；這一區的 gg_flower：%s' % (tag, inr, J([[x['label'], x['x'], x['z'], round(math.hypot(x['x'] - m1['x'], x['z'] - m1['z']), 1)] for x in fl])))
        if DO_G11: await into_g11(pg, cdp, tag, k)
    if k == '2':
        bg = await pg.evaluate(F.BAG_JS)
        have = {b['id']: b['shop'] for b in bg['bag']}
        R.check('%s 包包還有一束花、向日葵，shop＝gg_flower（GIFTH.bag；舊版 %s）' % (tag, J(m0['bag'])), have.get('g_bouquet') == 'gg_flower' and have.get('g_sunflower') == 'gg_flower', J(bg))
        await F.ready(pg, cdp, 15); ui = await F.bag_ui(pg, cdp)
        R.note('%s 選單「物品」：%s' % (tag, J(ui[:300])))
        R.check('%s 選單「物品」看得到一束花、一朵向日葵' % tag, '一束花' in ui and '一朵向日葵' in ui, '')
        await F.shop_names(pg, cdp, tag + '（舊花攤時期買的花）', ui=ui)
        if DO_G11: await into_g11(pg, cdp, tag, k, bag0=bg['bag']); bg = await pg.evaluate(F.BAG_JS)
        if await go_her(pg, cdp, tag, GIFT_WHO):
            g = await F.give(pg, cdp, tag, GIFT_WHO, GIFT_ITEM)
            rec = await pg.evaluate("(%s)(%s)" % (F.GIFTREC_JS, J(GIFT_WHO))); bg2 = await pg.evaluate(F.BAG_JS)
            R.note('%s 送花：%s；紀錄 %s；包包 %s' % (tag, J(g), J(rec), J(bg2['bag'])))
            gm = F.gift_menu(g)
            if gm is not None or g['offered']: await F.shop_names(pg, cdp, tag + '（舊花攤時期買的花）', gift_opts=gm or [])
            R.check('%s 舊花送得出去：「送她禮物…」→ %s（given 有它、包包少一樣）' % (tag, GIFT_ITEM), g['offered'] and g['picked'] and GIFT_ITEM in rec['given'] and len(bg2['bag']) == len(bg['bag']) - 1, J({'give': g, 'rec': rec}))
    if k == '3b':
        p0 = (s['x'], s['z']); r = await F.joy_to(pg, cdp, tag, s['x'], s['z'] - 3.0, near=0.5, max_s=30, straight=True)
        mv = math.hypot(r['end']['x'] - p0[0], r['end']['z'] - p0[1])
        R.check('%s 搖桿往街上推得動 %.2f m（≥1）' % (tag, mv), mv >= 1.0, J({'end': [r['end']['x'], r['end']['z']], 'why': r.get('why')}))
    if k == '4':
        rec = await pg.evaluate("(%s)(%s)" % (F.GIFTREC_JS, J(GIFT_WHO)))
        R.note('%s 送過的紀錄（改之後）：%s' % (tag, J(rec)))
        sk = [kk for kk in m0['sent'] if kk.startswith(GIFT_WHO + '|')]
        fk = [kk for kk, v in m0['fest'].items() if GIFT_WHO in (v or [])]
        R.check('%s given[%s] 還是 %s' % (tag, GIFT_WHO, J(m0['given'].get(GIFT_WHO))), rec['given'] == m0['given'].get(GIFT_WHO), J(rec['given']))
        R.check('%s sent %s、fest %s 還在' % (tag, J(sk), J(fk)), all(rec['sent'].get(kk) == m0['sent'][kk] for kk in sk) and all(GIFT_WHO in (rec['fest'].get(kk) or []) for kk in fk) and bool(sk), J({'sent': rec['sent'], 'fest': rec['fest']}))
        R.check('%s 記憶 GIFT_GIVEN_／GIFT_LOVE_ 還在（%s）' % (tag, J([t for t in m0['giftMem'] if GIFT_WHO in t])), all(t in [x['tag'] for x in rec['mem']] for t in m0['giftMem'] if GIFT_WHO in t), J(rec['mem']))
        st = await pg.evaluate("(pid=>{ const s=GIFTH.state(GAME.G,pid); return s?{items:s.items.map(b=>b.id),capped:s.capped}:null; })(%s)" % J(GIFT_WHO))
        R.check('%s 今天不能再送她（GIFTH.state＝null：一個節日一份）' % tag, st is None, J(st))
        g = await F.give(pg, cdp, tag, GIFT_WHO, GIFT_ITEM, select=False)
        R.note('%s 再和她說話：%s' % (tag, J(g)))
        R.check('%s 再和她說話不出「送她禮物…」' % tag, g.get('label') is not None and not g['offered'], J(g))
        if DO_G11: await into_g11(pg, cdp, tag, k)


async def load(pg, cdp, url, idx):
    for k in ['1', '2', '3', '3b', '4']:
        if k not in idx or k.rstrip('b') not in CASES: continue
        if not isinstance(idx[k], dict): continue
        p = os.path.join(SAVEDIR if MODE == 'both' else SRC_DIR, 'save_%s.json' % k)
        try: await load_one(pg, cdp, url, k, idx[k], json.load(open(p, encoding='utf-8')))
        except Exception as e:
            R.check('[LOAD %s] 沒有中斷' % k, False, repr(e)[:300]); await D.shot(pg, 'fn_mig_exc_%s' % k, judge_black=False)


SRC_DIR = None


async def main():
    global SRC_DIR
    sha = os.environ.get('SHA', '')[:9]
    print('CC FN_migrate（FLOWER-NOTES-1110）：MODE %s；CASES %s；SHA %s；送 %s %s（%s）；Playwright ≠ iPhone' % (MODE, ','.join(CASES), sha, GIFT_WHO, GIFT_ITEM, GIFT_DAY), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        idx = {}
        if MODE in ('make', 'both'):
            await pg.goto(URL_OLD)
            if not R.check('改之前的版本載入', await L.wait_loaded(pg), ''): await b.close(); return
            try: idx = await make(pg, cdp)
            except Exception as e:
                R.check('[MAKE] 沒有中斷', False, repr(e)[:300]); await D.shot(pg, 'fn_mig_make_exc', judge_black=False)
            R.check('[MAKE] 沒有 JS 例外', not errs, J(errs[:3]))
        if MODE in ('load', 'both'):
            if MODE == 'load':
                sf = os.environ.get('SAVES_FROM') or FIX_SAVES
                if not os.environ.get('SAVES_FROM'): R.setup('沒給 SAVES_FROM：用 %s（fd4dd9aef 舊花攤時期的 quickSave 存檔）' % sf)
                SRC_DIR = sf if os.path.exists(os.path.join(sf, 'index.json')) else os.path.join(sf, 'fn_saves')
                if not R.check('SAVES_FROM 有 index.json（%s）' % SRC_DIR, os.path.exists(os.path.join(SRC_DIR, 'index.json')), ''): await b.close(); return
                idx = json.load(open(os.path.join(SRC_DIR, 'index.json'), encoding='utf-8'))
            if MODE == 'both': await pg.close(); pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs.clear(); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(URL_NEW)
            if not R.check('改之後的版本載入', await L.wait_loaded(pg), ''): await b.close(); return
            await load(pg, cdp, URL_NEW, idx)
            R.check('[LOAD] 沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
