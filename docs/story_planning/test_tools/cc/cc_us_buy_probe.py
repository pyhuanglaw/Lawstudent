"""CC-C 11-14：SHOP_US_BUY（BB-C 11:26，BB_379，P1，D99 美國交換）——美國兩間超市「買得到東西」整段，照玩家走過去按互動鍵、照選單點。判定歸 BB。
遊戲的做法（src/us_markets3d.js USMKT）：貨架＝「看」旁白 → 選單「品名 $美金」／「不用了」→ 放進推車（不扣錢）；結帳＝（竹葉：月餅那一句＋要不要拿一顆）→ 招呼 →「結帳」／「不用了」→ 扣錢 → 草原多一個要不要袋子 → 結帳完那一句。
  own 的東西進「物品」（G.flags.GG3_OWN[區域][id]）；禮物（鳳梨酥、烏龍茶、月餅）進包包（G.flags.GIFTH.bag）；eat 的只扣錢。
每間店：
  ① 貨架拿一樣：草原「aisle_household」衛生紙（own）、竹葉「asia_sauce」醬油（own）——記貨架選單、拿完的推車（USMKT.cartGoods）。
  ② 結帳：記錢（前、後、差）、每一句對話（誰＋字）、選單；買完 GG3_OWN、GIFTH.bag 有沒有多。竹葉先遇到月餅那一句（④）→ 選拿一顆 → 一起結。草原的袋子選「不用了」。
  ③ 錢不夠：重新讀檔（新的一趟＝新推車）、錢設 MONEY_LOW（預設 10 元）、草原拿香蕉（48 元）、竹葉拿豆腐（64 元）→ 結帳 → 記那一句（草原 no_money、竹葉沒有水餃＝no_money_other）、錢有沒有動、推車清了沒。
  ④ 竹葉月餅：2028-09-16（9/15～中秋 10/3 之間）結帳時那一句＋「月餅 $5.00」選項——選了以後有沒有進推車、結帳後進包包。
CC_02 清單 2026-11-14：1✓（美國期間 2028-09-16 13:00＋美國路線旗標 EXCHANGE_ROUTE=US、US_DEPARTED、US_ARRIVED；竹葉週日公休，這天是週六） 2✓（互動點照 usMarket id 從 GAME.E.interactables 讀，貨品照 USMKT.goodsAt） 3✓（指定貨架、指定貨品，不挑第一個） 4✓（按 #interact、點 #choices 第 n 個，L.tap 觸控） 5✓（站位找互動點 0.5 m 內站得住的點，CC_02 乙5 SHOP_US_r4b） 6✓（對話一句一句點，每下等 450 ms） 7✓（lint） 8✓（錢、推車、GG3_OWN、GIFTH.bag 前後逐欄比） 9✓（每個選單、結帳完都截圖） 10✓（捷徑：讀檔、旗標、錢都寫【捷徑】） 11✓（佇列 probe、SHA 40 碼） 12✓（FAIL_SETUP：在店裡、inUS、互動點和貨品在、走到以後互動鍵是那個點） 13✓（走到互動點用 go_to，走完確認 nearestInteractable）
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONES=us_market,us_asian_market] [DAY=2028-09-16] [HOUR=13] [MONEY_LOW=10] python3 cc_us_buy_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ZONES = [z for z in (os.environ.get('ZONES') or 'us_market,us_asian_market').split(',') if z]
DAY = os.environ.get('DAY') or '2028-09-16'; HOUR = float(os.environ.get('HOUR') or 13)
MONEY_LOW = int(os.environ.get('MONEY_LOW') or 10)
R = L.Run('us_buy', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PLAN = {   # 區域：貨架、要拿的貨、結帳點、錢不夠那一次的貨架和貨
    'us_market': {'shelf': 'aisle_household', 'good': 'usm_tp', 'pay': 'checkout', 'low_shelf': 'produce', 'low_good': 'usm_banana'},
    'us_asian_market': {'shelf': 'asia_sauce', 'good': 'usa_soy', 'pay': 'asia_checkout', 'low_shelf': 'asia_produce', 'low_good': 'usa_tofu'},
}
US_FLAGS_JS = "(async()=>{ const F=GAME.G.flags||(GAME.G.flags={}); F.EXCHANGE_ROUTE='US'; F.US_DEPARTED=true; F.US_ARRIVED=true; const s=JSON.parse(JSON.stringify(GAME.snapshot())); await GAME.applySave(s); return true; })()"
STATE_JS = r"""(z=>{ const G=GAME.G, F=G.flags||{}, d=CALENDAR.dateOf(G.day); let cart=null; try{ cart=USMKT.cartGoods(GAME).map(g=>g.id); }catch(e){ cart='ERR '+e.message; }
  const own=(F.GG3_OWN&&F.GG3_OWN[z])?JSON.parse(JSON.stringify(F.GG3_OWN[z])):{}; const bag=(F.GIFTH&&Array.isArray(F.GIFTH.bag))?F.GIFTH.bag.map(b=>b&&b.id):[];
  return {zone:G.zone, key:d.key, wd:d.wd, hour:+(+G.hour).toFixed(2), money:G.money|0, cart, own, bag, inUS:typeof EXCH!=='undefined'&&EXCH.inUS?EXCH.inUS(G):null, last:USMKT.last||null}; })"""
IT_JS = r"""(id=>{ const lab=i=>String(typeof i.label==='function'?i.label():i.label||''); const it=(GAME.E.interactables||[]).find(i=>i.usMarket===id&&!i.hidden); return it?{x:+it.x.toFixed(2), z:+it.z.toFixed(2), r:it.radius||1.8, label:lab(it)}:null; })"""
GOODS_JS = r"""(a=>{ try{ return USMKT.goodsAt(GAME.G, a[0], a[1]).map(g=>({id:g.id, n:USMKT.nm(g), usd:g.usd, p:g.p, kind:g.kind})); }catch(e){ return 'ERR '+e.message; } })"""
NEAR_JS = "(()=>{ const it=GAME.E.nearestInteractable(); const b=document.getElementById('interact'); return {it:it?(it.usMarket||String(it.label||'')):null, shown:!!b&&!b.classList.contains('hide')}; })()"
UI_JS = r"""(()=>{ const D=GAME.D, vis=e=>!!e&&!!e.offsetParent&&!e.classList.contains('hide');
  const ch=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim());
  const cap=document.getElementById('caption'), t=document.getElementById('toast');
  return {dlg:!!(D&&D.active), who:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').trim(), choices:ch,
    caption:vis(cap)?(cap.textContent||'').trim():'', toast:vis(t)?(t.textContent||'').trim():'', busy:!!(GAME.E.player&&GAME.E.player.busy)}; })()"""


async def play(pg, cdp, tag, pick, shot):
    """對話一句一句點；出現選單就問 pick(選項文字串列) 要點第幾個（None＝停）。回傳 [(種類, 內容)]"""
    log = []; seen = set(); nmenu = 0; free = 0
    for _ in range(80):
        u = await pg.evaluate(UI_JS)
        if u['caption'] and ('cap', u['caption']) not in seen: seen.add(('cap', u['caption'])); log.append(['旁白字幕', u['caption']])
        if u['choices']:
            nmenu += 1; log.append(['選單', u['choices']])
            await pg.screenshot(path=os.path.join(OUT, '%s_menu%d.png' % (shot, nmenu)))
            k = pick(u['choices'])
            if k is None: break
            log.append(['點', u['choices'][k]])
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(700); free = 0; continue
        if u['dlg']:
            key = ('dlg', u['who'], u['text'])
            if key not in seen: seen.add(key); log.append(['對話', (u['who'] + '：' if u['who'] else '') + u['text']])
            await pg.evaluate("GAME.dlgAdvance()"); await pg.wait_for_timeout(450); free = 0; continue
        free = free + 1 if not u['busy'] else 0
        if free >= 4: break
        await pg.wait_for_timeout(400)
    for k_, v_ in log: R.note('%s    %s：%s' % (tag, k_, v_ if isinstance(v_, str) else J(v_)))
    return log


async def walk_to(pg, cdp, tag, uid):
    it = await pg.evaluate(IT_JS, uid)
    if not R.check('%s FAIL_SETUP 檢查：有互動點 %s' % (tag, uid), bool(it), ''): return None
    tg = await D.standable_near(pg, it['x'], it['z'], 0.5, 0) or await D.standable_near(pg, it['x'], it['z'], max(0.3, it['r'] - 0.2), 0)
    if tg: await L.go_to(pg, cdp, R, tg['x'], tg['z'], 0.25, '%s 走到「%s」' % (tag, it['label']), max_s=60, lv=0)
    await pg.wait_for_timeout(900); n = await pg.evaluate(NEAR_JS)
    ok = n['shown'] and n['it'] == uid
    R.check('%s FAIL_SETUP 檢查：走到以後互動鍵是「%s」（%s）' % (tag, it['label'], uid), ok, J(n))
    return it if ok else None


async def enter(pg, cdp, tag, z, money):
    s = await D.load_zone(pg, cdp, z, DAY, HOUR, wait=5000)
    await pg.evaluate(US_FLAGS_JS); await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    await pg.evaluate("(m=>{ GAME.G.money=m; })", money)
    st = await pg.evaluate(STATE_JS, z)
    R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f 時、美國路線旗標再讀一次、錢設 %d：%s' % (tag, z, DAY, HOUR, money, J(st)))
    return R.check('%s FAIL_SETUP 檢查：在店裡、人在美國（EXCH.inUS）' % tag, st['zone'] == z and st['inUS'] is True, J(st))


def pick_good(name_sub):
    def f(ch):
        k = next((i for i, t in enumerate(ch) if name_sub in t), None)
        return k if k is not None else next((i for i, t in enumerate(ch) if '不用了' in t), None)
    return f


async def shop_zone(pg, cdp, z):
    P = PLAN[z]; tag = '[%s]' % z; res = {}
    gs = await pg.evaluate(GOODS_JS, [z, P['shelf']]) if await enter(pg, cdp, tag, z, 5000) else None
    if gs is None: return res
    R.note('%s 貨架 %s 今天賣：%s' % (tag, P['shelf'], J(gs)))
    g = next((x for x in gs if isinstance(x, dict) and x['id'] == P['good']), None)
    if not R.check('%s FAIL_SETUP 檢查：貨架 %s 有 %s' % (tag, P['shelf'], P['good']), bool(g), J(gs)): return res
    # ① 貨架拿一樣
    if await walk_to(pg, cdp, tag + ' ①', P['shelf']):
        s0 = await pg.evaluate(STATE_JS, z)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        took = [0]
        def pk(ch):
            if took[0] == 0:
                k = next((i for i, t in enumerate(ch) if g['n'] in t), None)
                if k is not None: took[0] = 1; return k
            return next((i for i, t in enumerate(ch) if '不用了' in t), None)
        lg = await play(pg, cdp, tag + ' ①', pk, 'usbuy_%s_shelf' % z)
        s1 = await pg.evaluate(STATE_JS, z); res['shelf'] = {'log': lg, 'before': s0, 'after': s1}
        R.check('%s ① 貨架選單有「%s」、選了以後進推車（錢沒扣）' % (tag, g['n']), P['good'] in (s1['cart'] or []) and s1['money'] == s0['money'], J({'cart': s1['cart'], 'money': [s0['money'], s1['money']]}))
    # ② 結帳（竹葉先遇到月餅 ④）
    if await walk_to(pg, cdp, tag + ' ②', P['pay']):
        s0 = await pg.evaluate(STATE_JS, z); moon = {'offered': False}
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        def pk2(ch):
            if any('月餅' in t for t in ch) and not moon['offered']: moon['offered'] = True; return next(i for i, t in enumerate(ch) if '月餅' in t)
            if any(t.startswith('結帳') for t in ch): return next(i for i, t in enumerate(ch) if t.startswith('結帳'))
            if any(t.startswith('要') for t in ch): return next((i for i, t in enumerate(ch) if '不用了' in t), None)   # 袋子：不用了
            return next((i for i, t in enumerate(ch) if '不用了' in t), None)
        lg = await play(pg, cdp, tag + ' ②', pk2, 'usbuy_%s_pay' % z)
        await pg.screenshot(path=os.path.join(OUT, 'usbuy_%s_paid.png' % z))
        s1 = await pg.evaluate(STATE_JS, z); res['pay'] = {'log': lg, 'before': s0, 'after': s1, 'moon_offered': moon['offered']}
        R.note('%s ② 錢 %d → %d（扣 %d）；推車 %s → %s；物品 %s → %s；包包 %s → %s；USMKT.last %s' % (tag, s0['money'], s1['money'], s0['money'] - s1['money'], J(s0['cart']), J(s1['cart']), J(s0['own']), J(s1['own']), J(s0['bag']), J(s1['bag']), J(s1['last'])))
        R.check('%s ② 結帳扣了錢、推車清空' % tag, s1['money'] < s0['money'] and not s1['cart'], J([s0['money'], s1['money'], s1['cart']]))
        R.check('%s ② %s 進「物品」（G.flags.GG3_OWN.%s）' % (tag, P['good'], z), (s1['own'] or {}).get(P['good'], 0) > (s0['own'] or {}).get(P['good'], 0), J([s0['own'], s1['own']]))
        if z == 'us_asian_market':
            R.check('%s ④ 結帳櫃台有月餅那一句、問要不要拿一顆' % tag, moon['offered'], J(lg[:6]))
            R.check('%s ④ 月餅買到了、進包包（G.flags.GIFTH.bag）' % tag, s1['bag'].count('usa_mooncake') > s0['bag'].count('usa_mooncake'), J([s0['bag'], s1['bag'], s1['last']]))
    # ③ 錢不夠
    if await enter(pg, cdp, tag + ' ③', z, MONEY_LOW):
        gl = await pg.evaluate(GOODS_JS, [z, P['low_shelf']]); gg = next((x for x in gl if isinstance(x, dict) and x['id'] == P['low_good']), None) if isinstance(gl, list) else None
        if R.check('%s ③ FAIL_SETUP 檢查：貨架 %s 有 %s、價錢比 %d 元貴' % (tag, P['low_shelf'], P['low_good'], MONEY_LOW), bool(gg) and gg['p'] > MONEY_LOW, J(gl)) and await walk_to(pg, cdp, tag + ' ③', P['low_shelf']):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            t3 = [0]
            def pk3(ch):
                if t3[0] == 0:
                    k = next((i for i, t in enumerate(ch) if gg['n'] in t), None)
                    if k is not None: t3[0] = 1; return k
                return next((i for i, t in enumerate(ch) if '不用了' in t), None)
            await play(pg, cdp, tag + ' ③ 貨架', pk3, 'usbuy_%s_low_shelf' % z)
            if await walk_to(pg, cdp, tag + ' ③', P['pay']):
                s0 = await pg.evaluate(STATE_JS, z)
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
                def pk4(ch):
                    if any(t.startswith('結帳') for t in ch): return next(i for i, t in enumerate(ch) if t.startswith('結帳'))
                    return next((i for i, t in enumerate(ch) if '不用了' in t), None)   # 月餅：不用了
                lg = await play(pg, cdp, tag + ' ③ 結帳', pk4, 'usbuy_%s_low_pay' % z)
                await pg.screenshot(path=os.path.join(OUT, 'usbuy_%s_low_after.png' % z))
                s1 = await pg.evaluate(STATE_JS, z); res['low'] = {'log': lg, 'before': s0, 'after': s1}
                R.note('%s ③ 錢 %d → %d；推車 %s → %s' % (tag, s0['money'], s1['money'], J(s0['cart']), J(s1['cart'])))
                R.check('%s ③ 錢不夠：有說一句（對話）、錢沒有變成負的' % tag, any(k_ == '對話' for k_, _ in lg) and s1['money'] >= 0, J(lg))
    return res


async def main():
    print('CC SHOP_US_BUY：SHA %s；%s %s %.2f；Windows＋GPU ≠ iPhone' % (SHA or '?', ','.join(ZONES), DAY, HOUR), flush=True)
    out = {'sha': SHA, 'day': DAY, 'hour': HOUR, 'zones': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('FAIL_SETUP 檢查：遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(R.finish())
        for z in ZONES:
            try: out['zones'][z] = await shop_zone(pg, cdp, z)
            except Exception as e: R.check('[%s] 沒有中斷' % z, False, repr(e)[:300])
            open(os.path.join(OUT, 'us_buy.json'), 'w', encoding='utf-8').write(J(out))
        R.check('沒有 pageerror／JS 例外', not errs, J(errs[:5]))
        await b.close()
    sys.exit(R.finish())

asyncio.run(main())
