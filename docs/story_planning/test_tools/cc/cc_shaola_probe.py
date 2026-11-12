"""CC-C 11-12：公館燒臘點餐與記帳（GG-SHAOLA-FIX-1112，src/shaola_order3d.js＋src/data/yejian_shaola_buy.js；BB-C 13:41 SHAOLA_425 第 1 項，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
PARTS（逗號分隔；預設全部）：
  EAT  六樣各點一次：每一次【前置／捷徑】讀檔進 noodle（DAY HOUR，條件事件關掉，錢 2000）→ 照玩家走到「坐下吃飯」那一張（輪流換桌）按 → 選單選第 k 樣 →
       點飯的再問加滷蛋：第一次選「滷蛋」、其他「不用了」→ 一句一句點、每句截圖 → 記錢前後、時間前後、祐廷坐哪（seat 和按的那一張、對面那一張比）。
  OPP  有客人坐的那一張：找一張 NPC 坐著的「坐下吃飯」照玩家按 → 祐廷應該坐同一桌對面（it.pairSeat）；兩張都有人＝「有人坐了。」。
  TAB  記帳四點：①讀一個沒有 SHAOLA_TAB 的存檔（舊存檔）→ SHAOLA.tab＝0、點餐照常扣錢
       ②【捷徑】錢改 50 → 點叉燒飯 → 阿姨「先吃，下次一起算」那一句、錢不動、SHAOLA_TAB＝那一餐 → 【捷徑】錢改 1000、讀檔換一天再去 → 點叉燒飯 →「上次的一起算，總共 N」、錢扣兩份、欠帳清掉
       ③【捷徑】SHAOLA_TAB＝90、錢 50 → 按「坐下吃飯」→ 那一句（不點餐、不再欠）、只喝湯、錢不動、欠帳還是 90
       ④【捷徑】SHAOLA_TAB＝90 → GAME.autosave → 重新整理 → 標題「繼續」→ 欠帳還是 90
CC_02 清單 2026-11-12：1✓（晚餐 18:30） 2✓（座位、對面、菜單從遊戲讀：interactables、SHAOLA、YEJIAN_SHAOLA_BUY） 3✓（每一次重新讀檔） 4✓（選項照字：品名、滷蛋、不用了） 5✓（go_to 走過去按） 6✓（一句一句點、每句截圖） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看客人坐哪） 10✓（條件事件關掉） 11✓ 12✓（每一次同樣欄位） 13✓（讀檔、錢、欠帳是捷徑，R.setup 標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=EAT,OPP,TAB] [DAY=2025-10-15] [HOUR=18.5] python3 cc_shaola_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-10-15'; DAY2 = os.environ.get('DAY2') or '2025-10-16'
HOUR = float(os.environ.get('HOUR') or 18.5)
PARTS = [x.strip().upper() for x in (os.environ.get('PARTS') or 'EAT,OPP,TAB').split(',') if x.strip()]
R = L.Run('shaola', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZONE = 'noodle'
SEATS = r"""(()=>{ const E=GAME.E; const occ=s=>!!s&&(E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-s.x,n.seat.z-s.z)<0.35);
  return E.interactables.map((i,k)=>({k, i})).filter(o=>o.i.seat&&!o.i.hidden&&/吃飯/.test(String(typeof o.i.label==='function'?o.i.label():o.i.label||''))).map(o=>{ const i=o.i, ap=(GAME.seatApproach&&GAME.seatApproach(i.seat))||[i.x,i.z];
    return {ix:o.k, label:String(typeof i.label==='function'?i.label():i.label), x:+ap[0].toFixed(2), z:+ap[1].toFixed(2), lv:i.seat.lv|0, sx:+i.seat.x.toFixed(2), sz:+i.seat.z.toFixed(2), occ:occ(i.seat),
      pair:i.pairSeat?[+i.pairSeat.x.toFixed(2), +i.pairSeat.z.toFixed(2)]:null, pairOcc:occ(i.pairSeat)}; }); })()"""
STATE = r"""(()=>{ const G=GAME.G, P=GAME.E.player, o=P.obj.position; let tab=null; try{ tab=SHAOLA.tab(G); }catch(e){}
  return {money:G.money|0, h:+(+G.hour).toFixed(3), tab, tabRaw:(G.flags&&G.flags.SHAOLA_TAB!==undefined)?G.flags.SHAOLA_TAB:'(沒有)', egg:(G.eat&&G.eat.slEgg!==undefined)?G.eat.slEgg:null,
    seat:P.seat?[+P.seat.x.toFixed(2), +P.seat.z.toFixed(2)]:null, x:+o.x.toFixed(2), z:+o.z.toFixed(2)}; })()"""
MENU = r"""(()=>{ try{ const D=YEJIAN_SHAOLA_BUY.noodle; return {menu:D.menu.map(m=>[m.n,m.p]), addon:D.addon.map(m=>[m.n,m.p]), staff:D.staff}; }catch(e){ return null; } })()"""
DLG = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), toast:(document.getElementById('toast')||{}).textContent||'', interact:(document.getElementById('interact')||{}).textContent||''}; })()"""


async def drive(pg, cdp, tag, prefix, picks):
    """一句一句點、每句截圖；picks＝每一層選單要選的字（照順序；找不到選第一個）"""
    lines, menus, k, toasts = [], [], 0, []
    for j in range(90):
        st = await pg.evaluate(DLG)
        if st['toast'] and st['toast'] not in toasts: toasts.append(st['toast'])
        if st['choices']:
            if any(c.startswith('起身') for c in st['choices']) and k >= len(picks):   # 吃完坐著的選單：起身
                menus.append(st['choices']); lines.append('▶ ' + next(c for c in st['choices'] if c.startswith('起身')))
                await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); const e=b.find(x=>x.textContent.trim().startsWith('起身')); (e||b[0]).click(); })()"); await pg.wait_for_timeout(900); break
            want = picks[k] if k < len(picks) else None
            i = next((q for q, t in enumerate(st['choices']) if want and t.startswith(want)), None)
            if i is None: i = next((q for q, t in enumerate(st['choices']) if want and want in t), None)
            if i is None: i = 0
            else: k += 1
            menus.append(st['choices']); lines.append('▶ ' + st['choices'][i]); await pg.screenshot(path=os.path.join(OUT, '%s_menu_%02d.png' % (prefix, len(menus))))
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln: lines.append(ln); await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (prefix, len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 3: break
        await pg.wait_for_timeout(500)
    R.note('%s 選單 %s' % (tag, J(menus))); R.note('%s 整段 %s；提示 %s' % (tag, J(lines), J(toasts)))
    return lines, menus, toasts


async def load(pg, cdp, day, h, money=2000, tab=None):
    await pg.goto(URL); await L.wait_loaded(pg)
    s = await D.load_zone(pg, cdp, ZONE, day, h, wait=8000)
    await pg.evaluate("(a=>{ const G=GAME.G; G.money=a.m; G.flags=G.flags||{}; if(a.t===null) delete G.flags.SHAOLA_TAB; else G.flags.SHAOLA_TAB=a.t; })", {'m': money, 't': tab})
    return s


async def press_seat(pg, cdp, tag, prefix, seat, picks):
    await L.go_to(pg, cdp, R, seat['x'], seat['z'], 0.25, seat['label'], max_s=60, lv=seat['lv']); await D.settle(pg)
    st = await pg.evaluate(DLG); R.note('%s 走到「%s」(%s, %s) 旁邊，互動鍵「%s」' % (tag, seat['label'], seat['sx'], seat['sz'], st['interact']))
    s0 = await pg.evaluate(STATE)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    lines, menus, toasts = await drive(pg, cdp, tag, prefix, picks)
    s1 = await pg.evaluate(STATE)
    R.note('%s 錢 %s → %s；時間 %s → %s；欠帳 %s → %s；祐廷坐 %s（按的 [%s, %s]、對面 %s）' % (tag, s0['money'], s1['money'], s0['h'], s1['h'], s0['tabRaw'], s1['tabRaw'], s1['seat'], seat['sx'], seat['sz'], seat['pair']))
    return {'seat': seat, 'lines': lines, 'menus': menus, 'toasts': toasts, 'before': s0, 'after': s1}


async def part_eat(pg, cdp, res, menu):
    items = [m[0] for m in menu['menu']]; out = []
    for k, item in enumerate(items):
        tag = '[EAT %d %s]' % (k + 1, item)
        s = await load(pg, cdp, DAY, HOUR)
        if not R.check('%s 讀到 noodle' % tag, s['zone'] == ZONE, J(s)): continue
        seats = [q for q in await pg.evaluate(SEATS) if not q['occ']]
        R.setup('%s 【前置／捷徑】讀檔進公館燒臘 %s %.2f（條件事件關掉）、錢 2000、沒有欠帳；沒人坐的「坐下吃飯」%d 張' % (tag, DAY, HOUR, len(seats)))
        if not R.check('%s 有沒人坐的「坐下吃飯」' % tag, bool(seats), ''): continue
        seat = seats[k % len(seats)]
        r = await press_seat(pg, cdp, tag, 'sl_eat%d' % (k + 1), seat, [item, '滷蛋' if k == 0 else '不用了'])
        price = menu['menu'][k][1] + (menu['addon'][0][1] if k == 0 and item != menu['menu'][-1][0] and menu['addon'] else 0)
        R.check('%s 點得到、錢扣 %d' % (tag, price), r['before']['money'] - r['after']['money'] == price, J([r['before']['money'], r['after']['money']]))
        out.append(r)
    res['eat'] = out


async def part_opp(pg, cdp, res):
    tag = '[OPP]'
    for h in (HOUR, 12.5, 19.5):
        s = await load(pg, cdp, DAY, h)
        seats = await pg.evaluate(SEATS); occ = [q for q in seats if q['occ'] and q['pair'] and not q['pairOcc']]
        both = [q for q in seats if q['occ'] and q['pairOcc']]
        R.note('%s %.2f 座位：%s' % (tag, h, J(seats)))
        if occ: break
    R.setup('%s 【前置／捷徑】讀檔進公館燒臘 %s %.2f；有客人坐、對面空著的「坐下吃飯」%d 張；兩張都有人 %d 張' % (tag, DAY, h, len(occ), len(both)))
    if not R.check('%s 找得到有客人坐、對面空著的那一張' % tag, bool(occ), ''): return
    r = await press_seat(pg, cdp, tag, 'sl_opp', occ[0], ['叉燒飯', '不用了'])
    sat = r['after']['seat']
    R.check('%s 按有客人的那一張 → 坐同一桌對面' % tag, bool(sat) and abs(sat[0] - occ[0]['pair'][0]) < 0.2 and abs(sat[1] - occ[0]['pair'][1]) < 0.2, J([sat, occ[0]]))
    res['opp'] = r
    if both:
        r2 = await press_seat(pg, cdp, '[OPP 兩張都有人]', 'sl_opp_both', both[0], [])
        R.check('[OPP 兩張都有人] 提示「有人坐了。」、沒點餐', any('有人坐了' in t for t in r2['toasts']) and r2['before']['money'] == r2['after']['money'], J([r2['toasts'], r2['lines'][:3]]))
        res['opp_both'] = r2


async def part_tab(pg, cdp, res, menu):
    T = menu['staff']; out = {}
    # ① 舊存檔：沒有 SHAOLA_TAB
    s = await load(pg, cdp, DAY, HOUR, money=2000, tab=None); seat = next((q for q in await pg.evaluate(SEATS) if not q['occ']), None)
    R.setup('[TAB①] 【前置／捷徑】讀檔（存檔裡沒有 SHAOLA_TAB＝舊存檔）、錢 2000')
    r = await press_seat(pg, cdp, '[TAB①]', 'sl_tab1', seat, ['叉燒飯', '不用了'])
    R.check('[TAB①] 舊存檔沒欠（SHAOLA.tab＝0）、照常扣 90、沒有記帳那一句', r['before']['tab'] == 0 and r['before']['money'] - r['after']['money'] == 90 and not any(T['no_money'] in x or T['tab_pay'].split('{')[0] in x for x in r['lines']), J([r['before'], r['after']]))
    out['1'] = r
    # ② 錢不夠 → 記帳 → 下次一起付
    s = await load(pg, cdp, DAY, HOUR, money=50, tab=None); seat = next((q for q in await pg.evaluate(SEATS) if not q['occ']), None)
    R.setup('[TAB②a] 【捷徑】錢改 50、沒有欠帳')
    r = await press_seat(pg, cdp, '[TAB②a]', 'sl_tab2a', seat, ['叉燒飯', '不用了'])
    R.check('[TAB②a] 錢不夠：阿姨「%s」、錢不動、欠帳＝90' % T['no_money'], any(T['no_money'] in x for x in r['lines']) and r['after']['money'] == 50 and r['after']['tab'] == 90, J([r['lines'], r['after']]))
    out['2a'] = r
    tab = r['after']['tab'] or 90
    s = await load(pg, cdp, DAY2, HOUR, money=1000, tab=tab); seat = next((q for q in await pg.evaluate(SEATS) if not q['occ']), None)
    R.setup('[TAB②b] 【捷徑】讀檔換一天 %s、錢 1000、欠帳 %s（＝②a 留下的）' % (DAY2, tab))
    r = await press_seat(pg, cdp, '[TAB②b]', 'sl_tab2b', seat, ['叉燒飯', '不用了'])
    want = T['tab_pay'].replace('{n}', str(tab + 90))
    R.check('[TAB②b] 「%s」、錢扣 %d（兩份）、欠帳清掉' % (want, tab + 90), any(want in x for x in r['lines']) and 1000 - r['after']['money'] == tab + 90 and r['after']['tab'] == 0, J([r['lines'], r['after']]))
    out['2b'] = r
    # ③ 欠著又不夠
    s = await load(pg, cdp, DAY2, HOUR, money=50, tab=90); seat = next((q for q in await pg.evaluate(SEATS) if not q['occ']), None)
    R.setup('[TAB③] 【捷徑】欠帳 90、錢 50')
    r = await press_seat(pg, cdp, '[TAB③]', 'sl_tab3', seat, ['叉燒飯', '不用了'])
    R.check('[TAB③] 「%s」、不點餐（沒有菜單）、錢不動、欠帳還是 90' % T['tab_refuse'], any(T['tab_refuse'] in x for x in r['lines']) and r['after']['money'] == 50 and r['after']['tab'] == 90, J([r['lines'], r['after']]))
    out['3'] = r
    # ④ 欠著存檔重開
    s = await load(pg, cdp, DAY2, HOUR, money=50, tab=90)
    R.setup('[TAB④] 【捷徑】欠帳 90 → GAME.autosave → 重新整理 → 標題「繼續」')
    await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(1500)
    await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
    ok = await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(8000)
    st = await pg.evaluate(STATE); z = await pg.evaluate("GAME.G.zone")
    R.check('[TAB④] 標題「繼續」讀回來欠帳還是 90（%s）' % z, ok and st['tab'] == 90, J([ok, z, st]))
    out['4'] = {'continue': ok, 'zone': z, 'state': st}
    res['tab'] = out


async def main():
    print('CC 公館燒臘點餐與記帳：SHA %s；PARTS %s；%s %.2f' % (SHA or '?', PARTS, DAY, HOUR), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        menu = await pg.evaluate(MENU); res['menu'] = menu; R.note('菜單（YEJIAN_SHAOLA_BUY.noodle）：%s' % J(menu))
        if not R.check('有燒臘的資料', bool(menu and menu.get('menu')), ''): await b.close(); sys.exit(1)
        for part, fn in (('EAT', lambda: part_eat(pg, cdp, res, menu)), ('OPP', lambda: part_opp(pg, cdp, res)), ('TAB', lambda: part_tab(pg, cdp, res, menu))):
            if part not in PARTS: continue
            try: await fn()
            except Exception as e: R.check('[%s] 沒有探針例外' % part, False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'shaola.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
