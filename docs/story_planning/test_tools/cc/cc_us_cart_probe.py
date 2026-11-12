"""CC-C 11-12：美國兩間超市推車結帳（US-MARKETS-BUY-1112，src/us_markets3d.js USMKT；BB-C 12:38 第 9 項，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
CASES：CLERK＝草原超市（us_market）貨架拿兩樣→「結帳」櫃台；SELF＝草原超市自助結帳；POOR＝草原超市錢不夠（【捷徑】結帳前錢改成 50 元）；ASIA＝竹葉亞洲超市（us_asian_market）貨架拿兩樣→結帳櫃台（DAY 在 9/15～中秋＝櫃台問月餅，選要）。
每一種：【前置／捷徑】讀檔進那一區 DAY 10:00（條件事件關掉）→ 照玩家走到有東西賣的貨架（USMKT.hasShelf）按 → 選單選第一樣（不是「不用了」）放進推車（最多 SHELVES 個貨架）→
  走到結帳的互動點按 → 選「結帳」→ 袋子選「要」→（月餅問要不要：選第一個）→ 記每一句、每個選單、錢前後、時間前後、推車（USMKT.cart）、G.flags.GG3_OWN、GIFTH 包包。
CC_02 清單 2026-11-12：1✓（DAY 預設 2027-09-14（二）大三上在美國、月餅季） 2✓（貨架、結帳點照 it.usMarket＋USMKT.hasShelf／PAY 從遊戲讀） 3✓（每一種重新讀檔） 4✓（選項照字：結帳、要） 5✓（go_to 走過去） 6✓（一句一句點） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人、照原樣） 10✓（條件事件關掉） 11✓ 12✓（每種同樣欄位） 13✓（讀檔、錢改少是捷徑，標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=CLERK,SELF,POOR,ASIA] [DAY=2027-09-14] [SHELVES=2] python3 cc_us_cart_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2027-09-14'; SHELVES = int(os.environ.get('SHELVES') or 2)
CASES = [c for c in (os.environ.get('CASES') or 'CLERK,SELF,POOR,ASIA').split(',') if c]
CFG = {'CLERK': ('us_market', 'checkout'), 'SELF': ('us_market', 'self_checkout'), 'POOR': ('us_market', 'checkout'), 'ASIA': ('us_asian_market', 'asia_checkout')}
R = L.Run('us_cart', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ITS = r"""(()=>{ const G=GAME.G, z=G.zone; return GAME.E.interactables.filter(i=>i.usMarket&&!i.hidden&&!i.exit).map((i,k)=>({ix:GAME.E.interactables.indexOf(i), at:i.usMarket, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:i.lv|0, label:String(typeof i.label==='function'?i.label():i.label||''),
  shelf:!!(USMKT.hasShelf&&USMKT.hasShelf(z,i.usMarket)), pay:!!((USMKT.PAY[z]||{})[i.usMarket])})); })()"""
STATE = r"""(()=>{ const G=GAME.G; let cart=null; try{ cart=USMKT.cart(GAME); }catch(e){} let bag=null; try{ bag=GIFTH.bag(G).map(b=>b.id); }catch(e){}
  return {money:G.money|0, h:+(+G.hour).toFixed(3), cart:cart?{ids:cart.ids||null, n:(cart.ids||[]).length}:null, own:(G.flags&&G.flags.GG3_OWN)?JSON.parse(JSON.stringify(G.flags.GG3_OWN[G.zone]||{})):null, bag}; })()"""
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||'', toast:(document.getElementById('toast')||{}).textContent||''}; })()"""


async def press(pg, cdp, tag, prefix, prefs, first_item=False):
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    lines, menus = [], []
    for j in range(60):
        st = await pg.evaluate(ST)
        if st['choices']:
            ch = st['choices']; i = None
            if first_item and not menus: i = next((n for n, t in enumerate(ch) if not t.startswith('不用了')), 0)
            if i is None: i = next((n for p_ in prefs for n, t in enumerate(ch) if t.startswith(p_)), 0)
            menus.append(ch); lines.append('▶ ' + ch[i]); await pg.screenshot(path=os.path.join(OUT, '%s_menu_%02d.png' % (prefix, len(menus))))
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln: lines.append(ln); await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (prefix, len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 3: break
        await pg.wait_for_timeout(500)
    R.note('%s 選單 %s；整段 %s' % (tag, J(menus), J(lines)))
    return lines, menus


async def one(pg, cdp, case, res):
    zone, pay_at = CFG[case]; tag = '[%s %s]' % (case, zone)
    await pg.goto(URL); await L.wait_loaded(pg)
    s = await D.load_zone(pg, cdp, zone, DAY, 10.0, wait=7000)
    R.setup('%s 【前置／捷徑】讀檔進 %s %s 10:00（條件事件關掉）' % (tag, zone, DAY))
    if not R.check('%s 進得去' % tag, s['zone'] == zone, J(s)): return
    its = await pg.evaluate(ITS); R.note('%s 互動點 %s' % (tag, J(its)))
    shelves = [i for i in its if i['shelf']][:SHELVES]; pay = next((i for i in its if i['at'] == pay_at), None)
    if not R.check('%s 有貨架（%d）和結帳點「%s」' % (tag, len(shelves), pay_at), bool(shelves) and bool(pay), J(its)): return
    s0 = await pg.evaluate(STATE); rec = {'its': its, 'start': s0, 'shelves': []}
    for k, sh in enumerate(shelves):
        await L.go_to(pg, cdp, R, sh['x'], sh['z'], 0.6, sh['label'], max_s=60, lv=sh['lv']); await D.settle(pg)
        st = await pg.evaluate(ST); R.note('%s 貨架 %d「%s」互動鍵「%s」' % (tag, k + 1, sh['label'], st['interact']))
        l_, m_ = await press(pg, cdp, '%s 貨架 %d' % (tag, k + 1), 'us_%s_shelf%d' % (case, k + 1), ['不用了'], first_item=True)
        rec['shelves'].append({'it': sh, 'lines': l_, 'menus': m_, 'state': await pg.evaluate(STATE)})
    s1 = await pg.evaluate(STATE); R.note('%s 拿完：%s（還沒扣錢）' % (tag, J(s1)))
    R.check('%s 拿了東西進推車、還沒扣錢' % tag, (s1['cart'] or {}).get('n', 0) > 0 and s1['money'] == s0['money'], J([s0, s1]))
    if case == 'POOR': await pg.evaluate("(()=>{ GAME.G.money=50; })()"); R.setup('%s 【捷徑】結帳前錢改成 50 元（看錢不夠）' % tag)
    await L.go_to(pg, cdp, R, pay['x'], pay['z'], 0.6, pay['label'], max_s=60, lv=pay['lv']); await D.settle(pg)
    m0 = await pg.evaluate(STATE)
    l2, mm2 = await press(pg, cdp, '%s 結帳' % tag, 'us_%s_pay' % case, ['結帳', '要', '拿', '好'])
    s2 = await pg.evaluate(STATE)
    R.note('%s 結帳：錢 %s → %s；時間 %s → %s；推車 %s；物品 %s；包包 %s' % (tag, m0['money'], s2['money'], m0['h'], s2['h'], J(s2['cart']), J(s2['own']), J(s2['bag'])))
    if case == 'POOR': R.check('%s 錢不夠：有那一句、推車少一樣或沒付' % tag, len(l2) > 0, J(l2))
    else: R.check('%s 結帳扣錢、推車清空' % tag, s2['money'] < m0['money'] and (s2['cart'] or {}).get('n', 0) == 0, J([m0, s2]))
    rec.update({'pay': {'it': pay, 'lines': l2, 'menus': mm2, 'before': m0, 'after': s2}})
    res[case] = rec


async def main():
    print('CC 美國超市推車結帳：SHA %s；CASES %s；%s' % (SHA or '?', CASES, DAY), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for c in CASES:
            try: await one(pg, cdp, c, res)
            except Exception as e: R.check('[%s] 沒有探針例外' % c, False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'us_cart.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
