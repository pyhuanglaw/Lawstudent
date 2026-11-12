"""CC-C 11-12：一間店不同時段的客人數＋每一張玩家座位按不按得到、坐不坐得下（第一個用途：公館燒臘 noodle 12:30／18:30／20:30；LAWWW-C 11:39，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
每個時段（HOURS）：【前置／捷徑】讀檔進 ZONE（區域出生點，條件事件關掉）→ 等 8 秒 → 記店裡的人（店員、客人：坐著幾個、站著幾個、坐哪一張）、全景截圖 →
  D.sit_all（地點關卡同一支）：每一張玩家能坐的位子照玩家走過去、點椅子、看按鈕是不是「坐下…」、按、坐下的位置高度、起身推得動；有客人坐的那一張記「有人坐」（不算 FAIL）。
  時間走掉超過 0.5 小時（坐下、起身會過時間）＝下一張之前讀檔回那個時段。
CC_02 清單 2026-11-12：1✓（時段照 LAWWW：午餐、晚餐、晚上） 2✓（座位、人從遊戲讀：zone.seats、E.npcs） 3✓（每個時段重新讀檔；時間走太多再讀） 4✓（按鈕照字「坐下」） 5✓（go_to＋點椅子，照玩家） 6✓（讀檔等 8 秒、每次等 settle） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看客人） 10✓（條件事件關掉） 11✓ 12✓（三個時段同樣欄位） 13✓（讀檔捷徑標）
EAT=1（BB-C 11:42）：每一張坐下以後照玩家點餐（選單選第一個不是「起身／算了」的、一路點到回到坐著或站起來）→ 記每句、錢前後、時間前後、每桌一張截圖。
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONE=noodle] [DAY=2025-10-14] [HOURS=12.5,18.5,20.5] [EAT=1] python3 cc_seat_hours_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; ZONE = os.environ.get('ZONE') or 'noodle'; DAY = os.environ.get('DAY') or '2025-10-14'
HOURS = [float(x) for x in (os.environ.get('HOURS') or '12.5,18.5,20.5').split(',') if x]
EAT = (os.environ.get('EAT') or '0') == '1'
STAND = ('起身', '站起', '算了', '不用', '離開')
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), seat:!!GAME.E.player.seat, money:GAME.G.money|0, h:+(+GAME.G.hour).toFixed(3), interact:(document.getElementById('interact')||{}).textContent||''}; })()"""
EATS = []


async def eat(pg, cdp, k, s, t):
    """坐下以後點餐：選第一個不是起身／算了的選項，一路點；選單第二次出現同樣的菜單（點完了）＝選起身那一類收尾"""
    c0 = await pg.evaluate(ST); lines = []; menus = []; picked = 0
    for j in range(60):
        c = await pg.evaluate(ST)
        if c['choices']:
            menus.append(c['choices'])
            food = [i for i, x in enumerate(c['choices']) if not any(x.startswith(w) for w in STAND)]
            if food and picked < 2: i = food[0]; picked += 1
            else: i = next((i for i, x in enumerate(c['choices']) if any(x.startswith(w) for w in STAND)), len(c['choices']) - 1)
            lines.append('▶ ' + c['choices'][i]); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(900)
            if any(c['choices'][i].startswith(w) for w in ('起身', '站起')): break
            continue
        if c['dlg']:
            ln = c['who'] + '｜' + c['t']
            if not lines or lines[-1] != ln: lines.append(ln)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not c['seat']: break
        if j == 0 and c['interact'] and not any(c['interact'].startswith(w) for w in ('起身', '站起')):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(900); continue
        if picked and j > 3: break
        await pg.wait_for_timeout(600)
    c1 = await pg.evaluate(ST)
    await D.shot(pg, 'seathours_eat_%s_%d' % (ZONE, k + 1), judge_black=False)
    EATS.append({'seat': [s['sx'], s['sz']], 'money': [c0['money'], c1['money']], 'h': [c0['h'], c1['h']], 'lines': lines, 'menus': menus})
    R.note('%s 吃：錢 %s → %s（%+d）；時間 %.3f → %.3f；%s；選單 %s' % (t, c0['money'], c1['money'], c1['money'] - c0['money'], c0['h'], c1['h'], json.dumps(lines, ensure_ascii=False), json.dumps(menus, ensure_ascii=False)))
    R.check('%s 點得到東西（錢有扣）' % t, c1['money'] < c0['money'], '')
R = L.Run('seat_hours_' + ZONE, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PEOPLE = r"""(()=>{ const E=GAME.E, r2=v=>+(+v).toFixed(2); const L=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false&&!n.hidden);
  const staff=n=>!!(n.clerk||n.staff||n.vendor||n.stallKeeper||n.shopStaff||(n.beh==='clerk'));
  const C=L.filter(n=>!staff(n)); return {h:r2(GAME.G.hour), all:L.length, staff:L.filter(staff).map(n=>({name:n.name||'', x:r2(n.obj.position.x), z:r2(n.obj.position.z)})),
    customers:C.length, seated:C.filter(n=>n.seat).length, standing:C.filter(n=>!n.seat).length,
    who:C.map(n=>({name:n.name||'', id:n.charId||'', x:r2(n.obj.position.x), z:r2(n.obj.position.z), seat:n.seat?[r2(n.seat.x),r2(n.seat.z)]:null, pose:n.pose||null, crowd:n.crowd||null}))}; })()"""


async def main():
    print('CC 各時段客人＋座位：SHA %s；%s %s；HOURS %s' % (SHA or '?', ZONE, DAY, HOURS), flush=True)
    res = {'sha': SHA, 'zone': ZONE, 'hours': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for h in HOURS:
            ht = ('%05.2f' % h).replace('.', ''); tag = '[%s %s]' % (ZONE, h)
            s = await D.load_zone(pg, cdp, ZONE, DAY, h, wait=8000)
            R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f（出生點、條件事件關掉）、等 8 秒' % (tag, ZONE, DAY, h))
            if not R.check('%s 進得去 %s' % (tag, ZONE), s['zone'] == ZONE, J(s)): continue
            pp = await pg.evaluate(PEOPLE); await D.shot(pg, 'seathours_%s_%s_enter' % (ZONE, ht), judge_black=False)
            R.note('%s 店裡：客人 %d（坐 %d、站 %d）；店員 %s；客人 %s' % (tag, pp['customers'], pp['seated'], pp['standing'], J(pp['staff']), J(pp['who'])))

            async def back(k, st_, h=h, tag=tag):
                hh = await pg.evaluate("+GAME.G.hour")
                if hh - h > 0.5:
                    R.setup('%s 時間走到 %.2f（坐下／起身過的時間）→【前置／捷徑】讀檔回 %.2f' % (tag, hh, h)); await D.load_zone(pg, cdp, ZONE, DAY, h, wait=5000)
            if EAT: await pg.evaluate("(()=>{ if((GAME.G.money|0)<3000) GAME.G.money=3000; })()"); R.setup('%s 【捷徑】錢補到 3000（每桌點一次）' % tag)
            EATS.clear()
            rs = await D.sit_all(pg, cdp, tag, 'seathours_%s_%s' % (ZONE, ht), before_each=back, on_seated=(lambda k, s_, t_: eat(pg, cdp, k, s_, t_)) if EAT else None)
            n_ok = sum(1 for x in rs if x[1] == 'ok'); n_occ = sum(1 for x in rs if x[1] == 'occupied'); n_bad = [x for x in rs if x[1] not in ('ok', 'occupied')]
            R.note('%s 座位 %d 張：坐得下 %d、有客人 %d、按不到／坐不下 %s' % (tag, len(rs), n_ok, n_occ, J(n_bad)))
            res['hours'][str(h)] = {'people': pp, 'seats': rs, 'eats': list(EATS)}
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'seat_hours_%s.json' % ZONE), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
