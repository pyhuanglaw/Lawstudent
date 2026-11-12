"""CC-C 11-12：一間店不同時段的客人數＋每一張玩家座位按不按得到、坐不坐得下（第一個用途：公館燒臘 noodle 12:30／18:30／20:30；LAWWW-C 11:39，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
每個時段（HOURS）：【前置／捷徑】讀檔進 ZONE（區域出生點，條件事件關掉）→ 等 8 秒 → 記店裡的人（店員、客人：坐著幾個、站著幾個、坐哪一張）、全景截圖 →
  D.sit_all（地點關卡同一支）：每一張玩家能坐的位子照玩家走過去、點椅子、看按鈕是不是「坐下…」、按、坐下的位置高度、起身推得動；有客人坐的那一張記「有人坐」（不算 FAIL）。
  時間走掉超過 0.5 小時（坐下、起身會過時間）＝下一張之前讀檔回那個時段。
CC_02 清單 2026-11-12：1✓（時段照 LAWWW：午餐、晚餐、晚上） 2✓（座位、人從遊戲讀：zone.seats、E.npcs） 3✓（每個時段重新讀檔；時間走太多再讀） 4✓（按鈕照字「坐下」） 5✓（go_to＋點椅子，照玩家） 6✓（讀檔等 8 秒、每次等 settle） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看客人） 10✓（條件事件關掉） 11✓ 12✓（三個時段同樣欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONE=noodle] [DAY=2025-10-14] [HOURS=12.5,18.5,20.5] python3 cc_seat_hours_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; ZONE = os.environ.get('ZONE') or 'noodle'; DAY = os.environ.get('DAY') or '2025-10-14'
HOURS = [float(x) for x in (os.environ.get('HOURS') or '12.5,18.5,20.5').split(',') if x]
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
            rs = await D.sit_all(pg, cdp, tag, 'seathours_%s_%s' % (ZONE, ht), before_each=back)
            n_ok = sum(1 for x in rs if x[1] == 'ok'); n_occ = sum(1 for x in rs if x[1] == 'occupied'); n_bad = [x for x in rs if x[1] not in ('ok', 'occupied')]
            R.note('%s 座位 %d 張：坐得下 %d、有客人 %d、按不到／坐不下 %s' % (tag, len(rs), n_ok, n_occ, J(n_bad)))
            res['hours'][str(h)] = {'people': pp, 'seats': rs}
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'seat_hours_%s.json' % ZONE), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
