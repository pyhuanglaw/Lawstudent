"""CC-C 11-12：⑫ 越好吃小館點餐（TINGZHOU-SHOPS5-1110；LAWWW f51a9823a6＝AA_821 接進 tz_yuehaochi；BB-C 04:29「六樣、錢扣對、錢不夠那句、打烊句」）。判定歸 BB；Playwright 手機橫向（PC GPU）≠ iPhone。
受測 bd8643003a；舊版（修改前 9dedfa2088）沒有點餐＝FAIL 預期（D34）。期望值全部從頁面的 TZ_MEAL_LINES[區域]（＝AA_821@65e38a5de 匯入，tools/shops/import_tz_meals.py --check 一字照稿）讀。
對照的程式：src/gg3shops3d.js S.mealOrder——老闆娘「要吃什麼？」→ 選單每樣「名字　價錢 元」（一樣最多一份）＋「點好了」「不用了」→ 錢不夠＝旁白 short、不扣錢；
  夠＝GAME.money(−總價)、說 after 其中一句（只點咖啡＝afterOnly）→ 吃的兩句 eat → 坐下；打烊 S.closeOut：人在店裡到了關門時間＝老闆娘 close 那一句、請到門外。
CASES：
  ITEMS  六樣各一次：【前置／捷徑】讀檔進店 13:00、錢 2000 → 搖桿走到「點餐」（互動鍵是那個字才算到）→ 按 → 照字選那一樣 →「點好了」→ 演完。
         判：扣的錢＝那一樣的價錢；老闆娘那一句在 after（咖啡單點＝afterOnly.line）；那一樣的 eat 兩句都出現；沒有卡住、最後沒有對話框／選單。
  SHORT  錢 10（【前置／捷徑】）→ 點牛肉河粉 →「點好了」：旁白＝short、錢沒動。
  CLOSE  【前置／捷徑】讀檔進店 20:55 → 等遊戲時間到 21:00（等不到 90 秒就把時間撥到 20:59）→ 老闆娘 close 那一句、人被請到汀州路。
CC_02 清單 2026-11-12：1✓（營業 11～21、錢夠／不夠都設） 2✓（字、價錢、點的位置全從 TZ_MEAL_LINES／TZ_SHOPS_LAYOUT 讀） 3n/a（BB 要六樣全點，不挑） 4✓（選單照字選、按互動鍵前看字） 5✓ 6✓ 7✓ 8✓（判準＝稿的字和價錢） 9n/a（只存最後一張畫面） 10✓ 11✓ 12✓（記選單真的出現六樣） 13✓（搖桿分段走、看互動鍵的字）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [ZONE=tz_yuehaochi] [CASES=ITEMS,SHORT,CLOSE] python3 cc_tz_meal_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
ZONE = os.environ.get('ZONE') or 'tz_yuehaochi'
CASES = [c for c in (os.environ.get('CASES') or 'ITEMS,SHORT,CLOSE').split(',') if c]
R = L.Run('tzmeal_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'
HOOK_JS = r"""(()=>{ window.__SAY=window.__SAY||[]; if(GAME.__tzh) return 1; GAME.__tzh=1; const s0=GAME.say; GAME.say=function(a,b){ try{ window.__SAY.push([((a&&a.name)||(typeof a==='string'?a:'')), String(b==null?'':b)]); }catch(e){} return s0.apply(this,arguments); };
  const m0=GAME.money; if(typeof m0==='function') GAME.money=function(d,w){ try{ (window.__MON=window.__MON||[]).push([d,w||null]); }catch(e){} return m0.apply(this,arguments); }; return 1; })()"""
DATA_JS = r"""(z=>{ const T=(typeof TZ_MEAL_LINES!=='undefined')&&TZ_MEAL_LINES[z]; if(!T) return null; const Ly=TZ_SHOPS_LAYOUT[T.layout]; const pt=(Ly.points||[]).find(p=>p.kind===T.meal.point);
  return {name:T.name, who:T.who, close:T.close, meal:JSON.parse(JSON.stringify(T.meal)), pt, spawn:Ly.spawn, sys:(typeof GG3!=='undefined'&&GG3.SYS)||null}; })"""
ST_JS = r"""(()=>{ const ch=document.getElementById('choices'), P=GAME.E.player.obj.position; return {zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(3), money:GAME.G.money|0, x:+P.x.toFixed(2), z:+P.z.toFixed(2),
  dlg:!!(GAME.D&&GAME.D.active), choices:ch&&!ch.classList.contains('hide')?[...ch.querySelectorAll('button')].map(b=>b.textContent.trim()):[], busy:!!GAME.E.player.busy}; })()"""


async def tap_choice(pg, cdp, text):
    c = await pg.evaluate("(t=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.trim()===t||x.textContent.trim().startsWith(t)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {xy:[r.left+r.width/2,r.top+r.height/2], top:!!e&&(e===b||b.contains(e))}; })", text)
    if not c: return False
    if not c['top']: R.note('選項「%s」中心最上層不是那顆鈕（照按）' % text)
    await L.touch_tap(cdp, c['xy'][0], c['xy'][1]); await pg.wait_for_timeout(900); return True


async def load_in(pg, cdp, d, h, money, why):
    s = await D.load_zone(pg, cdp, ZONE, DAY, h, x=d['spawn']['x'], z=d['spawn']['z'], yaw=d['spawn'].get('yaw', 0.0), wait=7000)
    await pg.evaluate("(m=>{ GAME.G.money=m; })", money); await pg.evaluate(HOOK_JS); await pg.evaluate("(()=>{ window.__SAY=[]; window.__MON=[]; })()")
    for _ in range(12):   # 進門那一句先點掉（不算）
        q = await pg.evaluate(ST_JS)
        if not q['dlg']: break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
    await pg.evaluate("(()=>{ window.__SAY=[]; window.__MON=[]; })()")
    R.setup('【前置／捷徑】讀檔進 %s %s %.2f 時、錢 %d（%s）' % (ZONE, DAY, h, money, why))
    return s


async def walk_order(pg, cdp, d, tag):
    for k in range(3):
        if (await D.st(pg))['interact'].startswith('點餐'): return True
        await L.go_to(pg, cdp, R, d['pt']['x'], d['pt']['z'], 0.6 if k == 0 else 0.4, '%s 走到「點餐」（第 %d 段）' % (tag, k + 1), max_s=40)
        await pg.wait_for_timeout(700)
        q = await pg.evaluate(ST_JS)
        if q['dlg'] or q['choices']: R.note('%s 走路途中有對話／選單：%s' % (tag, J(q))); return False
        if (await D.st(pg))['interact'].startswith('點餐'): return True
    return False


async def order(pg, cdp, d, tag, names):
    q0 = await pg.evaluate(ST_JS)
    if not R.check('%s 走到點餐、互動鍵是「點餐」' % tag, await walk_order(pg, cdp, d, tag), J(await D.st(pg))): return None
    await L.tap(pg, cdp, '#interact'); t0 = time.time(); picked = []; menus = []; done_sent = False
    while time.time() - t0 < 120:
        q = await pg.evaluate(ST_JS)
        if q['choices']:
            menus.append(q['choices'])
            nxt = next((n for n in names if n not in picked), None)
            if nxt and any(c.startswith(nxt) for c in q['choices']): await tap_choice(pg, cdp, nxt); picked.append(nxt); continue
            sysd = (d['sys'] or {}).get('done') or '點好了'
            if not done_sent and any(c == sysd for c in q['choices']): await tap_choice(pg, cdp, sysd); done_sent = True; continue
            R.note('%s 沒預期的選單 %s：選第一個' % (tag, J(q['choices']))); await tap_choice(pg, cdp, q['choices'][0]); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if done_sent and not q['busy']:
            await pg.wait_for_timeout(1200); q = await pg.evaluate(ST_JS)
            if not q['dlg'] and not q['choices']: break
        await pg.wait_for_timeout(400)
    q1 = await pg.evaluate(ST_JS); say = await pg.evaluate("window.__SAY||[]"); mon = await pg.evaluate("window.__MON||[]")
    return {'before': q0, 'after': q1, 'say': say, 'money_calls': mon, 'menus': menus[:2], 'picked': picked}


async def main():
    print('CC TZ 點餐：TAG %s；SHA %s；ZONE %s；CASES %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ZONE, ','.join(CASES)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        d = await pg.evaluate(DATA_JS, ZONE)
        if not R.check('頁面上有 TZ_MEAL_LINES.%s（點餐的稿）' % ZONE, bool(d), ''): await b.close(); sys.exit(1)
        M = d['meal']; R.note('稿：%s 樣 %s；after %s；afterOnly %s；short %s；close %s' % (len(M['menu']), J([[i['n'], i['p']] for i in M['menu']]), J(M['after']), J(M.get('afterOnly')), M['short'], d['close']))
        if 'ITEMS' in CASES:
            for it in M['menu']:
                tag = '[ITEMS %s]' % it['n']; e0 = len(errs)
                await load_in(pg, cdp, d, 13.0, 2000, '點一樣')
                r = await order(pg, cdp, d, tag, [it['n']])
                if not r: continue
                lines = [s[1] for s in r['say']]
                R.note('%s 選單（前兩次）%s；說的 %s；錢的呼叫 %s' % (tag, J(r['menus']), J(r['say'][-8:]), J(r['money_calls'])))
                R.check('%s 選單裡有六樣「名字　價錢 元」' % tag, bool(r['menus']) and all(any(c == '%s　%d 元' % (x['n'], x['p']) for c in r['menus'][0]) for x in M['menu']), J(r['menus'][:1]))
                R.check('%s 扣錢＝%d（錢 %d → %d）' % (tag, it['p'], r['before']['money'], r['after']['money']), r['before']['money'] - r['after']['money'] == it['p'], J(r['money_calls']))
                only = M.get('afterOnly') and it['id'] == M['afterOnly']['id']
                want_after = [M['afterOnly']['line']] if only else M['after']
                R.check('%s 老闆娘點完那一句照稿（%s）' % (tag, '只點咖啡＝afterOnly' if only else 'after 其中一句'), any(l in want_after for l in lines), J(lines[-8:]))
                R.check('%s 吃的兩句都出現（照稿）' % tag, all(e in lines for e in it['eat']), J({'want': it['eat'], 'got': lines[-8:]}))
                R.check('%s 最後沒有對話框、選單開著；沒有 JS 例外' % tag, not r['after']['dlg'] and not r['after']['choices'] and len(errs) == e0, J(r['after']))
        if 'SHORT' in CASES:
            tag = '[SHORT]'; it = M['menu'][0]
            await load_in(pg, cdp, d, 13.0, 10, '錢不夠')
            r = await order(pg, cdp, d, tag, [it['n']])
            if r:
                lines = [s[1] for s in r['say']]
                R.check('%s 錢不夠＝稿那一句旁白「%s」' % (tag, M['short']), M['short'] in lines, J(lines[-6:]))
                R.check('%s 錢沒動（%d → %d）' % (tag, r['before']['money'], r['after']['money']), r['before']['money'] == r['after']['money'], J(r['money_calls']))
        if 'CLOSE' in CASES:
            tag = '[CLOSE]'
            await load_in(pg, cdp, d, 20.92, 2000, '快打烊')
            t0 = time.time(); shortcut = False
            while time.time() - t0 < 150:
                q = await pg.evaluate(ST_JS)
                if q['zone'] != ZONE and not q['dlg']: break
                if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                if not shortcut and time.time() - t0 > 90 and q['hour'] < 20.98:
                    await pg.evaluate("(()=>{ GAME.G.hour=20.99; })()"); shortcut = True; R.setup('%s 【捷徑】90 秒還沒到 21:00，時間撥到 20:59' % tag)
                await pg.wait_for_timeout(500)
            q = await pg.evaluate(ST_JS); say = await pg.evaluate("window.__SAY||[]")
            R.note('%s 結束：%s；說的 %s' % (tag, J(q), J(say[-6:])))
            R.check('%s 老闆娘說「%s」' % (tag, d['close']), any(s[1] == d['close'] for s in say), J(say[-6:]))
            R.check('%s 被請到汀州路（區域 %s）' % (tag, q['zone']), q['zone'] == 'tingzhou', J(q))
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        try: await pg.screenshot(path=os.path.join(OUT, 'tzmeal_%s_end.jpg' % TAG), type='jpeg', quality=70)
        except Exception: pass
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
