"""CC-C 11-14：EXIT_PROMPT（BUG-EXIT-PROMPT-STALE-1112，LAWWW 15:50；BB-C 15:51 派）。判定歸 BB。
① 從店外照玩家走進店（門口互動鍵按下去）→ 進店對話點完 → 走到出口範圍裡站著不動：每 0.2 秒記互動鍵的字、E.paused、document.hidden，共 3 秒；
   要「立刻」變「離開…」（記第一次出現的時間）。
② 按「離開…」出店 → 出店以後同樣每 0.2 秒記 3 秒：互動鍵不能還寫「離開…」；再按一下互動鍵，記按了以後 2 秒內有沒有反應（換區域、對話、選單、toast、互動鍵的字變了）。
每一步截圖。ZONE＝店的區域 id（預設 flower_notes），HOUR 預設 14。
CC_02 清單 2026-11-13：1✓（營業中 14:00；店外位置從店裡出口的 spawn 讀） 2✓（門、出口都從遊戲互動點讀：exit.to、label、radius） 3n/a（只有一間） 4✓（按之前確認互動鍵的字） 5✓（走進出口範圍站得住的點，D.standable_near） 6✓（每段 3 秒每 0.2 秒取樣） 7✓（lint、node 驗 JS） 8n/a（只記，判定歸 BB） 9✓（截遊戲畫面原樣） 10✓（進店對話照字點完） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：真的進了店、真的出了店） 13✓（走到出口用 go_to 分段）
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONE=flower_notes HOUR=14] python3 cc_exit_prompt_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''; ZONE = os.environ.get('ZONE') or 'flower_notes'; HOUR = float(os.environ.get('HOUR') or 14); DAY = '2025-10-22'
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('exit_prompt', OUT); D.setup(R, OUT)
SAMPLE = r"""(()=>{ const it=document.getElementById('interact'), E=GAME.E; const t=it&&it.offsetParent?(it.textContent||'').trim():''; const ts=document.getElementById('toast');
  return {interact:t, paused:!!E.paused, hidden:!!document.hidden, zone:GAME.G.zone, busy:!!(E.player&&E.player.busy), toast:(ts&&ts.offsetParent)?(ts.textContent||'').trim().slice(0,40):'', t:+performance.now().toFixed(0)}; })()"""
EXIT_OF = "(z=>{ const i=GAME.E.interactables.find(i=>i.exit&&!i.hidden&&String(i.label||'').indexOf('離開')===0); return i?{label:i.label, to:i.exit.to, sp:i.exit.spawn||null, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||1, lv:i.lv|0}:null; })"


async def samples(pg, n=15):
    out = []
    for _ in range(n):
        out.append(await pg.evaluate(SAMPLE)); await pg.wait_for_timeout(200)
    return out


async def drain(pg, cdp, lines):
    for _ in range(60):
        q = await D.st(pg)
        if q['choices']: lines.append('▶' + q['choices'][0]); await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(700); continue
        if q['dlg']: lines.append(await pg.evaluate("((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,40)")); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not q.get('busy'): break
        await pg.wait_for_timeout(400)


async def main():
    print('CC 離開提示（EXIT_PROMPT）：SHA %s；%s %.1f；Playwright ≠ iPhone' % (SHA or '?', ZONE, HOUR), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        # 先讀檔進店，讀出口 → 用出口的 spawn 讀檔到店外（門口），照玩家走進去
        await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=6000)
        ex = await pg.evaluate(EXIT_OF, ZONE)
        if not R.check('FAIL_SETUP 檢查：店裡有「離開…」出口、有店外 spawn', bool(ex and ex.get('sp')), J(ex)): await b.close(); sys.exit(1)
        sp = ex['sp']
        await D.load_zone(pg, cdp, ex['to'], DAY, HOUR, x=sp['x'], z=sp['z'], yaw=sp.get('yaw', 0.0), wait=8000)
        R.setup('【前置／捷徑】讀檔到店外 %s (%s, %s) %s %.1f（條件事件關掉）' % (ex['to'], sp['x'], sp['z'], DAY, HOUR))
        door = await pg.evaluate("(z=>{ const i=GAME.E.interactables.find(i=>i.exit&&!i.hidden&&i.exit.to===z); return i?{label:i.label}:null; })", ZONE)
        if not R.check('FAIL_SETUP 檢查：店外有進 %s 的門' % ZONE, bool(door), ''): await b.close(); sys.exit(1)
        s_in = await D.use_exit(pg, cdp, '進店', door['label'], ZONE)
        if not R.check('FAIL_SETUP 檢查：照玩家走進店（%s）' % ZONE, bool(s_in) and s_in['zone'] == ZONE, J(s_in)): await b.close(); sys.exit(1)
        lines = []; await drain(pg, cdp, lines); R.note('進店對話 %s' % J(lines))
        await pg.screenshot(path=os.path.join(OUT, 'ep_1_in.png'))
        # ① 走到出口範圍站著不動
        ex = await pg.evaluate(EXIT_OF, ZONE)
        tgt = await D.standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, ex['lv'])
        await L.go_to(pg, cdp, R, (tgt or ex)['x'], (tgt or ex)['z'], 0.3, '走到出口範圍', max_s=60, lv=ex['lv'])
        t0 = time.time(); s1 = await samples(pg)
        await pg.screenshot(path=os.path.join(OUT, 'ep_2_at_exit.png'))
        first = next((k for k, x in enumerate(s1) if x['interact'].startswith('離開')), None)
        res['at_exit'] = s1
        R.note('① 站在出口範圍 3 秒（每 0.2 秒）：%s' % J([[x['interact'], x['paused'], x['hidden']] for x in s1]))
        R.check('① 站在出口範圍，互動鍵 0.4 秒內變「離開…」（第 %s 格）' % first, first is not None and first <= 2, J(s1[:4]))
        # ② 按離開、出店以後
        if s1[-1]['interact'].startswith('離開'):
            await L.tap(pg, cdp, '#interact'); s_out = await D.wait_zone(pg, cdp, ex['to'])
        else: s_out = await D.st(pg)
        if not R.check('FAIL_SETUP 檢查：按「離開」出了店（到 %s）' % ex['to'], s_out['zone'] == ex['to'], J(s_out)): await b.close(); sys.exit(1)
        s2 = await samples(pg); res['after_exit'] = s2
        await pg.screenshot(path=os.path.join(OUT, 'ep_3_outside.png'))
        stale = [x for x in s2 if x['interact'].startswith('離開') and ZONE != x['zone'] and x['interact'].find(ex['label'][2:]) >= 0]
        R.note('② 出店以後 3 秒：%s' % J([[x['interact'], x['paused'], x['hidden']] for x in s2]))
        R.check('② 出店以後互動鍵不再寫「%s」' % ex['label'], not stale, J(stale[:3]))
        before = await pg.evaluate(SAMPLE); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(300)
        after = await samples(pg, 10); q = await D.st(pg)
        react = q['dlg'] or q['choices'] or any(x['zone'] != before['zone'] or x['toast'] or x['interact'] != before['interact'] for x in after)
        await pg.screenshot(path=os.path.join(OUT, 'ep_4_press_outside.png'))
        res['press_outside'] = {'before': before, 'after': after, 'dlg': q['dlg'], 'choices': q['choices']}
        R.note('② 出店以後按互動鍵（按之前「%s」）：之後 2 秒 %s；對話=%s 選單=%s' % (before['interact'], J([[x['interact'], x['zone'], x['toast']] for x in after]), q['dlg'], q['choices']))
        R.check('② 出店以後按互動鍵有反應（換區域／對話／選單／toast／互動鍵的字變了）', bool(react) or not before['interact'], J(before))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'exit_prompt.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
