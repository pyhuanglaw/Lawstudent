"""CC 探針：GIFT-HOLIDAY-1110 第 1 項「13 家店的選單有『買禮物…』；錢不夠的灰掉；包包最多 10 樣，滿了要擋」（BB 11-10 派）。
遊戲：src/gifthol3d.js（GIFTH.shopOpt／GIFTH.pick／GIFTH.buy，S.MAX=10，S.LABEL='買禮物…'，afar＝'選物…'）、src/data/gift_holiday.js（shops 14 個 key；
  gg_flower 花攤還沒有店＝不在這 13 家）；各店接線：story3d.js counter（cafe／cvs）、bookshop（bookstore）、gg2shops3d.js（afar 點咖啡、corner_records 問店員／結帳）、
  ggshops_sys3d.js（aoki 點茶）、guitar3d.js（xs_tongxian 買東西）、nanyang_sys3d.js（xs_nanyang 買票）、xsshop_sys3d.js（xs_dabu／xs_haopai 買東西）、
  gifthol3d.js S.shanlan（xs_shanlan 結帳＝書架、看文具＝xs_shanlan_stationery）、bikeshop3d.js（bikeshop 車燈・車鈴・鎖）。
  灰掉＝GM.choose 的 option.dim → 按鈕 class "dim"（按得下去，但 GIFTH.buy 再擋：toast「錢不夠」／包包滿了 toast「包包已經放了 10 樣…」）。

每一家：【前置／捷徑】load_zone 讀檔到那家店（出生點＝門口）、DAY HOUR、條件事件關掉、G.money＝MONEY_OK
  → 真的玩：L.go_to 走到那家的櫃台互動點（walkFallbacks 不能加）→ 互動鍵是那個字 → 按 → 對話點過去 → 選單有「買禮物…」（afar「選物…」）
  → 按它 → 禮物清單（「名稱　價錢 元」幾樣＋「算了」）→ 截圖 → 按「算了」。
錢不夠（MONEY_SHOPS，預設 cvs、xs_shanlan_stationery）：【前置／捷徑】G.money＝MONEY_LOW → 再按一次櫃台 → 禮物清單裡價錢 > 錢的每一樣都有 class dim、
  ≤ 錢的沒有 → 按一樣灰的 → 錢不變、包包不變、toast 有「錢不夠」。
包包滿（BAG_SHOPS，預設 xs_haopai、afar）：【前置／捷徑】用遊戲自己的存檔結構 GIFTH.rec(G).bag 放到 10 樣（GIFTH 沒有對外的「加一樣」函式；
  GIFTH.buy 要走選單，unit test 也這樣放）、G.money＝MONEY_OK → 按櫃台 → 「買禮物…」那一項是 dim、hint 有 10 → 按 → 包包還是 10、錢不變、記下 toast 字。
預期：舊版（fda54d616，GIFTH 還沒有）每一家「選單有買禮物」FAIL；新版 PASS。Playwright／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=old|new python3 cc_gift_shops_probe.py <url> <out>
  選用：ONLY=cvs,afar（只測這幾家）、PORTRAIT=1（預設直向 390×844；0＝橫向）、DAY=2025-10-18、HOUR=14、MONEY_SHOPS=…、BAG_SHOPS=…"""
import os, sys, json, asyncio, math, re, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; DAY = os.environ.get('DAY') or '2025-10-18'; HOUR = float(os.environ.get('HOUR') or 14)
PORTRAIT = (os.environ.get('PORTRAIT') or '1') != '0'
MONEY_OK, MONEY_LOW = 20000, 50
MONEY_SHOPS = (os.environ.get('MONEY_SHOPS') or 'cvs,xs_shanlan_stationery').split(',')
BAG_SHOPS = (os.environ.get('BAG_SHOPS') or 'xs_haopai,afar').split(',')
R = L.Run('gift_shops_%s' % TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

# key, 區域, 櫃台互動點的條件（JS，i＝interactable）, 互動鍵的字
SHOPS = [
    ('cafe', 'cafe', "i.counter==='cafe'", '到吧檯點餐'),
    ('cvs', 'cvs', "i.shop==='cvs'", '結帳'),
    ('aoki', 'aoki', "i.ggs==='order'", '點茶'),
    ('bookstore', 'bookstore', "i.shop==='book'", '看看法律書'),
    ('afar', 'afar', "i.gg2==='afar'&&i.kind==='order'", '點咖啡'),
    ('corner_records', 'corner_records', "i.kind==='corner_shop'", '問店員'),
    ('bikeshop', 'bikeshop', "(i.label||'').indexOf('車燈')===0", '車燈'),
    ('xs_tongxian', 'xs_tongxian', "i.guitar==='shop'", '買東西'),
    ('xs_nanyang', 'xs_nanyang', "!!i.nyTicket", '買票'),
    ('xs_shanlan', 'xs_shanlan', "i.label==='結帳'&&!!i.shlLook", '結帳'),
    ('xs_shanlan_stationery', 'xs_shanlan', "i.label==='看文具'&&!!i.shlLook", '看文具'),
    ('xs_dabu', 'xs_dabu', "i.xssa&&i.xssa.act==='shop'", '買東西'),
    ('xs_haopai', 'xs_haopai', "i.xssa&&i.xssa.act==='shop'", '買東西'),
]
ONLY = [s for s in (os.environ.get('ONLY') or '').split(',') if s]

UI = """(()=>{ const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
  const ib=document.getElementById('interact'), d=document.getElementById('dlg'), ch=document.getElementById('choices'); const P=GAME.E.player.obj.position;
  const btns=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(vis):[];
  return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), lv:GAME.E.player.lv|0, fb:GAME.walkFallbacks|0, busy:!!GAME.E.player.busy, money:GAME.G.money|0,
    bag:typeof GIFTH!=='undefined'&&GIFTH.bag?GIFTH.bag(GAME.G).length:null, hour:+(+GAME.G.hour).toFixed(2),
    interact:vis(ib)?(ib.innerText||'').trim():'', dlg:!!(GAME.D&&GAME.D.active), dtext:vis(d)?(d.innerText||'').replace('▼ 點一下繼續','').trim().slice(0,120):'',
    choices:btns.map(b=>({t:((b.childNodes[0]&&b.childNodes[0].textContent)||b.innerText||'').trim(), hint:((b.querySelector('.hint')||{}).textContent||'').trim(), dim:b.classList.contains('dim')||b.disabled}))}; })()"""
TOAST_HOOK = """(()=>{ if(window.__ccToastHooked) return true; window.__ccToastHooked=true; window.__ccToast=[]; const t=document.getElementById('toast'); if(!t) return false;
  new MutationObserver(()=>{ const x=(t.textContent||'').trim(); if(x&&window.__ccToast[window.__ccToast.length-1]!==x) window.__ccToast.push(x); }).observe(t,{childList:true,subtree:true,characterData:true});
  return true; })()"""
IS_GIFT = lambda t: t.startswith('買禮物') or t.startswith('選物')
PRICE = re.compile(r'(\d+)\s*元')


async def ui(pg): return await pg.evaluate(UI)


async def tap_choice(pg, cdp, idx):
    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (idx + 1))


async def wait_menu(pg, cdp, want, max_s=25):
    """點掉對話，直到出現選單、want(choices) 成立（或 max_s 秒）；回傳最後的 UI"""
    t0 = time.time(); u = await ui(pg)
    while time.time() - t0 < max_s:
        u = await ui(pg)
        if u['choices'] and want(u['choices']): return u
        if u['dlg'] and not u['choices']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(400)
    return u


async def close_all(pg, cdp, max_s=20):
    """把選單、對話收掉：選單按「算了／不用了／就這樣／先不用／只是看看」（沒有就最後一項）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        u = await ui(pg)
        if u['choices']:
            ts = [c['t'] for c in u['choices']]
            k = next((i for i, t in enumerate(ts) if t.startswith(('算了', '不用了', '就這樣', '先不用', '只是看看'))), len(ts) - 1)
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(700); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not u['busy']: return u
        await pg.wait_for_timeout(400)
    return await ui(pg)


async def open_counter(pg, cdp, tag, label):
    """按互動鍵 → 對話點掉 → 店的選單（有買禮物那一項就停）；回傳 (UI, 買禮物在第幾項 or None)"""
    u = await ui(pg)
    if not u['interact'].startswith(label):
        for _ in range(6):
            await pg.wait_for_timeout(500); u = await ui(pg)
            if u['interact'].startswith(label): break
    if not u['interact'].startswith(label): return u, None
    await L.tap(pg, cdp, '#interact')
    u = await wait_menu(pg, cdp, lambda cs: any(IS_GIFT(c['t']) for c in cs), max_s=20)
    gi = next((i for i, c in enumerate(u['choices']) if IS_GIFT(c['t'])), None)
    return u, gi


async def toasts_since(pg, n0):
    return (await pg.evaluate("window.__ccToast||[]"))[n0:]


async def shop_one(pg, cdp, key, zone, pred, label):
    tag = '[%s]' % key
    R.setup('%s 讀檔到 %s %s %.1f 時（出生點＝門口）、條件事件關掉、G.money=%d、包包清空' % (tag, zone, DAY, HOUR, MONEY_OK))
    await D.load_zone(pg, cdp, zone, DAY, HOUR, wait=7000)
    await pg.evaluate("((m)=>{ GAME.G.money=m; if(typeof GIFTH!=='undefined'&&GIFTH.rec) GIFTH.rec(GAME.G).bag.length=0; })(%d)" % MONEY_OK)
    await pg.evaluate(TOAST_HOOK)
    u = await ui(pg)
    if not R.check('%s 在 %s' % (tag, zone), u['zone'] == zone, J(u)): return
    it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(i=>!i.hidden&&(%s)); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,r:i.radius||0.9}:null; })()" % pred)
    if not R.check('%s 有櫃台互動點「%s」' % (tag, label), bool(it) and it['label'].startswith(label), J(it)): return
    tgt = await D.standable_near(pg, it['x'], it['z'], it['r'] * 0.6, it['lv']) or {'x': it['x'], 'z': it['z']}
    fb0 = u['fb']
    ok = await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.3, '%s 走到「%s」' % (tag, label), max_s=150, lv=it['lv'])
    await D.settle(pg); u = await ui(pg)
    if not u['interact'].startswith(label):   # 停在範圍邊上：往互動點中心再走一點
        await L.go_to(pg, cdp, R, it['x'], it['z'], 0.4, '%s 往「%s」中心' % (tag, label), max_s=60, lv=it['lv']); await D.settle(pg); u = await ui(pg)
    R.check('%s 真的走到「%s」（互動鍵是它、walkFallbacks 沒加）' % (tag, label), u['interact'].startswith(label) and u['fb'] == fb0, J({k: u[k] for k in ('x', 'z', 'interact', 'fb')}))
    # ① 選單有買禮物
    u, gi = await open_counter(pg, cdp, tag, label)
    R.note('%s 按下去的選單：%s' % (tag, J([c['t'] + ('（灰）' if c['dim'] else '') for c in u['choices']])))
    want = '選物…' if key == 'afar' else '買禮物…'
    if not R.check('%s 選單有「%s」（不是灰的）' % (tag, want), gi is not None and u['choices'][gi]['t'] == want and not u['choices'][gi]['dim'], J(u['choices'])):
        await R.shot(pg, '%s_%s_nogift' % (TAG, key)); await close_all(pg, cdp); return
    R.note('%s 「%s」的提示：%s' % (tag, want, u['choices'][gi]['hint']))
    # ② 打開：禮物清單
    await tap_choice(pg, cdp, gi)
    u = await wait_menu(pg, cdp, lambda cs: any(PRICE.search(c['t']) for c in cs) and any(c['t'].startswith('算了') for c in cs), max_s=12)
    items = [c for c in u['choices'] if PRICE.search(c['t'])]
    exp = await pg.evaluate("((k)=>typeof GIFTH!=='undefined'&&GIFTH.sells?GIFTH.sells(GAME.G,k).map(g=>GIFTH.item(g).name+'　'+GIFTH.item(g).price+' 元'):null)(%s)" % J(key))
    R.check('%s 禮物清單出來了（%d 樣＋「算了」；和 GIFTH.sells(%s) 一樣）' % (tag, len(items), key), bool(items) and [c['t'] for c in items] == exp, J({'shown': [c['t'] for c in items], 'sells': exp}))
    await D.shot(pg, 'gift_%s_%s_list' % (TAG, key))
    await close_all(pg, cdp)
    u = await ui(pg)
    R.check('%s 按「算了」：沒買、錢不變（%d）' % (tag, MONEY_OK), u['bag'] == 0 and u['money'] == MONEY_OK, J({k: u[k] for k in ('bag', 'money')}))
    # ③ 錢不夠
    if key in MONEY_SHOPS:
        R.setup('%s G.money=%d（錢不夠）' % (tag, MONEY_LOW))
        await pg.evaluate("GAME.G.money=%d" % MONEY_LOW)
        u, gi = await open_counter(pg, cdp, tag, label)
        if R.check('%s 錢不夠：選單還是有「%s」' % (tag, want), gi is not None, J(u['choices'])):
            await tap_choice(pg, cdp, gi)
            u = await wait_menu(pg, cdp, lambda cs: any(PRICE.search(c['t']) for c in cs), max_s=12)
            rows = [(i, c, int(PRICE.search(c['t']).group(1))) for i, c in enumerate(u['choices']) if PRICE.search(c['t'])]
            bad = [c['t'] for i, c, p in rows if (p > MONEY_LOW) != c['dim']]
            R.check('%s 錢 %d：價錢 > %d 的都灰（class dim）、買得起的不灰' % (tag, MONEY_LOW, MONEY_LOW), bool(rows) and not bad and any(p > MONEY_LOW for _, _, p in rows), J({'rows': [[c['t'], c['dim']] for _, c, _ in rows], 'bad': bad}))
            await D.shot(pg, 'gift_%s_%s_poor' % (TAG, key))
            dimk = next((i for i, c, p in rows if c['dim']), None)
            if dimk is not None:
                n0 = len(await pg.evaluate("window.__ccToast||[]"))
                await tap_choice(pg, cdp, dimk); await pg.wait_for_timeout(1500)
                u2 = await ui(pg); ts = await toasts_since(pg, n0)
                R.note('%s 按灰的那一樣（%s）：toast %s' % (tag, u['choices'][dimk]['t'], J(ts)))
                R.check('%s 按灰的那一樣：沒買（錢 %d 不變、包包 0）、toast 有「錢不夠」' % (tag, MONEY_LOW), u2['money'] == MONEY_LOW and u2['bag'] == 0 and any('錢不夠' in t for t in ts), J({'money': u2['money'], 'bag': u2['bag'], 'toast': ts}))
            await close_all(pg, cdp)
        await pg.evaluate("GAME.G.money=%d" % MONEY_OK)
    # ④ 包包滿
    if key in BAG_SHOPS:
        R.setup('%s 用 GIFTH.rec(G).bag 放到 10 樣（遊戲自己的存檔結構；沒有對外的加一樣函式）、G.money=%d' % (tag, MONEY_OK))
        nfill = await pg.evaluate("""(()=>{ if(typeof GIFTH==='undefined'||!GIFTH.rec||typeof GIFT_HOLIDAY==='undefined') return null; const G=GAME.G, b=GIFTH.rec(G).bag; b.length=0;
          const ids=Object.keys(GIFT_HOLIDAY.items).filter(g=>GIFT_HOLIDAY.items[g].shop!=='special'); for(let i=0;i<10;i++) b.push({id:ids[i%ids.length],day:G.day,shop:GIFT_HOLIDAY.items[ids[i%ids.length]].shop});
          return GIFTH.bag(G).length; })()""")
        R.check('%s 包包放到 10 樣' % tag, nfill == 10, J(nfill))
        u, gi = await open_counter(pg, cdp, tag, label)
        o = u['choices'][gi] if gi is not None else None
        R.note('%s 包包滿的選單：%s' % (tag, J(u['choices'])))
        R.check('%s 包包滿：「%s」灰掉、提示寫 10 樣' % (tag, want), bool(o) and o['dim'] and '10' in o['hint'], J(o))
        await D.shot(pg, 'gift_%s_%s_bagfull' % (TAG, key))
        if o:
            n0 = len(await pg.evaluate("window.__ccToast||[]"))
            await tap_choice(pg, cdp, gi); await pg.wait_for_timeout(1500)
            u2 = await ui(pg); ts = await toasts_since(pg, n0)
            R.note('%s 包包滿按「%s」：toast %s；之後的畫面 %s' % (tag, want, J(ts), J({k: u2[k] for k in ('choices', 'dtext')})))
            more = [c for c in u2['choices'] if PRICE.search(c['t'])]
            if more:   # 擋不住：清單還是打開了 → 試著買一樣看會不會放進去（GAME_BUG 證據）
                await tap_choice(pg, cdp, u2['choices'].index(more[0])); await pg.wait_for_timeout(1500); u2 = await ui(pg); ts = await toasts_since(pg, n0)
            R.check('%s 包包滿按下去：被擋（包包還是 10、錢 %d 不變、有提示字）' % (tag, MONEY_OK), u2['bag'] == 10 and u2['money'] == MONEY_OK and bool(ts), J({'bag': u2['bag'], 'money': u2['money'], 'toast': ts}))
        await close_all(pg, cdp)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    shops = [s for s in SHOPS if not ONLY or s[0] in ONLY]
    print('CC 買禮物 13 家：worktree %s；%s；%s；這次 %d 家：%s；Playwright ≠ iPhone' % (real or '?', TAG, '直向' if PORTRAIT else '橫向', len(shops), ','.join(s[0] for s in shops)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return R.finish()
        has = await pg.evaluate("typeof GIFTH!=='undefined'&&!!GIFTH.shopOpt")
        R.note('GIFTH.shopOpt 存在：%s（舊版沒有）' % has)
        for key, zone, pred, label in shops:
            t0 = time.time()
            try: await shop_one(pg, cdp, key, zone, pred, label)
            except Exception as e:
                R.check('[%s] 跑完沒有探針例外' % key, False, repr(e)[:300]); await R.shot(pg, '%s_%s_exc' % (TAG, key))
                try: await close_all(pg, cdp, max_s=8)
                except Exception: pass
            R.note('[%s] 用了 %.0f 秒' % (key, time.time() - t0))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    return R.finish()
sys.exit(asyncio.run(main()))
