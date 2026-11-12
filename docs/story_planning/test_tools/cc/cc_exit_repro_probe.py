"""CC-C 11-12：店裡「離開」按了出不來的重現（BB-C 07:19 ①；X352B：山嵐 14:00／20:30、好拍 14:00 地點關卡 ⑦ 走出去後 zone 還在店裡，22:00 被請出去才出來）。判定歸 BB。
要分清楚：遊戲 bug（站在互動半徑裡、按鈕是「離開…」、按了不換區域），還是探針沒走進半徑（按鈕不是離開的字、或沒按到）。
做法（每一組 店,時間）：【前置／捷徑】讀檔到那間店（出生點，條件事件關掉）→ 讀出口互動點（exit、label、半徑）→
  第一次：照地點關卡同一個走法（go_to 停在 0.6 m 內）→ 記離出口幾 m、半徑、互動鍵的字、截圖「前」→ 按互動鍵 → 等 20 秒看 zone → 截圖「後」＋這段時間的 console；
  沒出去：第二次走到出口那一點 0.2 m 內再按一次（同樣記）。有視窗（PROBE_HEADED=1）讓使用者看得到。
CC_02 清單 2026-11-12：1✓（店開著的時間＝BB 給的 14:00、20:30） 2✓（出口從遊戲的互動點讀：exit、label、radius） 3✓（兩種距離依序試） 4✓（按之前記互動鍵的字） 5✓（go_to 分段；記到出口的距離） 6✓（按了等 20 秒、黑幕結束） 7✓ 8n/a（不判，記事實給 BB） 9✓（截圖不藏玩家：要看人站在門口哪裡） 10n/a（條件事件關掉；有選單就記字） 11✓ 12✓（記 zone 前後、距離、半徑） 13✓（兩次各記走法）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [CASES=xs_shanlan@14,xs_shanlan@20.5,xs_haopai@14] python3 cc_exit_repro_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
if os.environ.get('PROBE_HEADED') == '1': os.environ['CC_HEADLESS'] = '0'   # BB-C 07:19：有視窗（gpu_wrap 在 launch 當下讀 CC_HEADLESS；config 不動）
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; SHA = os.environ.get('SHA') or ''
CASES = [c.split('@') for c in (os.environ.get('CASES') or 'xs_shanlan@14,xs_shanlan@20.5,xs_haopai@14').split(',') if c]
R = L.Run('exit_repro_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'
EXIT_JS = r"""(()=>{ const P=GAME.E.player.obj.position; return GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, to:i.exit.to, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||1, lv:i.lv|0, d:+Math.hypot(P.x-i.x,P.z-i.z).toFixed(2)})); })()"""
NEAR_JS = "(()=>{ const E=GAME.E; const n=E.nearestInteractable?E.nearestInteractable():null; return n?{label:n.label, exit:!!n.exit}:null; })()"


async def attempt(pg, cdp, tag, zid, ex, near, cons):
    await L.go_to(pg, cdp, R, ex['x'], ex['z'], near, '%s 走到出口（停在 %.1f m 內）' % (tag, near), max_s=60, lv=ex['lv'])
    await pg.wait_for_timeout(800)
    q = await D.st(pg); e2 = next((e for e in await pg.evaluate(EXIT_JS) if e['label'] == ex['label']), ex)
    nr = await pg.evaluate(NEAR_JS)
    before = {'pos': [q['x'], q['z']], 'dist': e2['d'], 'radius': ex['r'], 'interact': q['interact'], 'nearest': nr}
    await D.shot(pg, 'exit_%s_%s_before' % (tag.replace(' ', '_'), near), judge_black=False)
    c0 = len(cons)
    if q['interact']: await L.tap(pg, cdp, '#interact')
    t0 = time.time(); z = q['zone']
    while time.time() - t0 < 20:
        z = (await D.st(pg))['zone']
        if z != zid: break
        await pg.wait_for_timeout(400)
    await pg.wait_for_timeout(1500)
    after = await D.st(pg)
    await D.shot(pg, 'exit_%s_%s_after' % (tag.replace(' ', '_'), near), judge_black=False)
    o = {'near': near, 'before': before, 'tapped': bool(q['interact']), 'zone_after': after['zone'], 'console': cons[c0:][:10]}
    R.note('%s 停在 %.1f m 內：離出口 %s m（半徑 %s）、互動鍵「%s」、按了=%s → zone %s；console %s' % (tag, near, e2['d'], ex['r'], q['interact'], o['tapped'], after['zone'], J(o['console'])))
    return o


async def main():
    print('CC 出不來重現：TAG %s；SHA %s；CASES %s；有視窗=%s' % (TAG, SHA or '?', CASES, os.environ.get('PROBE_HEADED')), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        cons = []
        pg.on('console', lambda m: cons.append('%s: %s' % (m.type, m.text[:200])) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: cons.append('pageerror: ' + str(e)[:200]))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for zid, h in CASES:
            h = float(h); tag = '[%s %.1f]' % (zid, h)
            s = await D.load_zone(pg, cdp, zid, DAY, h, wait=8000)
            R.setup('%s 【前置／捷徑】讀檔到 %s %s %.1f（出生點；條件事件關掉）' % (tag, zid, DAY, h))
            if not R.check('%s 讀到 %s' % (tag, zid), s['zone'] == zid, J(s)): continue
            exs = await pg.evaluate(EXIT_JS); ex = next((e for e in exs if e['label'].startswith('離開')), exs[0] if exs else None)
            if not R.check('%s 有出口互動點' % tag, bool(ex), J(exs)): continue
            R.note('%s 出口 %s' % (tag, J(ex)))
            c = {'zone': zid, 'h': h, 'exit': ex, 'tries': []}
            o1 = await attempt(pg, cdp, tag + ' 第一次', zid, ex, 0.6, cons); c['tries'].append(o1)
            if o1['zone_after'] == zid:
                o2 = await attempt(pg, cdp, tag + ' 第二次', zid, ex, 0.2, cons); c['tries'].append(o2)
            ok = any(t['zone_after'] != zid for t in c['tries'])
            first = c['tries'][0]
            why = '出得去' if ok else ('按鈕是「%s」也按了，還是沒出去＝像遊戲 bug' % first['before']['interact'] if first['before']['interact'].startswith('離開') else '按鈕不是離開的字（「%s」）＝沒走進互動範圍或被別的互動點蓋住' % first['before']['interact'])
            R.check('%s 走到門口按「離開」出得去（%s）' % (tag, why), ok, J(c['tries']))
            res['cases'].append(c)
        await b.close()
    open(os.path.join(OUT, 'exit_repro_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
