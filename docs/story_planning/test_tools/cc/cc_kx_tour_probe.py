"""CC-C 11-12：W1R E1／E2——可昕 K1 導遊 ev_kexin_tour_nccu（法律系大一上第一次開車去木柵大學，出遊；BB-C 12:00 定情境，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
E1：【前置／捷徑】讀檔到宿舍、大一上 DAY（週四）20:00；和可昕交往、認識、聯絡人；G.flags.KX_TOUR_YES＝true（＝手機那一則回「好，週六下午過去。」）→ 等遊戲自己排出遊（story3d.js：OUT.plan kx_tour 週六 14:00）；
    沒排到＝【捷徑】照程式同樣的參數 OUT.plan →【捷徑】日子直接跳到那個週六 13:20（同一個存檔往後）→ 等遊戲跳「出發」→ 照玩家按「出發」→
    一句一句點：記每句（說話的人、字）、地點字幕、底（advBg 圖、透明度）、title card；演完記：回到哪、時間、NCCU_VISITED／K1_ORDER、events.done、出遊狀態；
    演完 20 秒內有沒有別的事件插進來（回程的校園偶遇：EVENTS.running 換成別的 id、對話有別人說話）。
E2：同上，演到小吃街（底是 nccu_food 或字幕含「小吃街」）那一刻停 →【捷徑】重新整理頁面、按標題「繼續（自動存檔）」→ 記讀回來在哪（區域、時間、位置）、出遊狀態、事件有沒有接著演或整段重演 → 一路點完。
CC_02 清單 2026-11-12：1✓（大一上第 3 週週四晚、週六 14:00 照程式） 2✓（出遊照 OUT.get／事件照 STORY_EVENTS 讀） 3✓（每種重新讀檔） 4✓（選項照字「出發」，其他選第 1 個並記下） 5n/a（出遊是 2D，不走路） 6✓（一句一句點、等 1 秒） 7✓ 8n/a（不判，給 BB） 9n/a（2D 出遊截圖，不藏東西） 10✓（條件事件關掉；讀檔回來照遊戲原樣） 11✓ 12✓（兩種同樣欄位） 13✓（讀檔、旗標、跳日子、OUT.plan 都標捷徑）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=E1,E2] [DAY=2025-09-25] python3 cc_kx_tour_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-09-25'
CASES = [c for c in (os.environ.get('CASES') or 'E1,E2').split(',') if c]
R = L.Run('kx_tour', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PREP = r"""(()=>{ const G=GAME.G, F=G.flags; Object.assign(F,{dating_kexin:true, met_kexin:true, KX_TOUR_YES:true}); if(!G.contacts) G.contacts={}; if(G.contacts.kexin==null) G.contacts.kexin=2; return true; })()"""
OUTQ = r"""(()=>{ const G=GAME.G, q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'kx_tour'):null; return q?{day:q.day, key:CALENDAR.dateOf(q.day).key, h:q.h, state:q.state, place:q.place, arrived:!!q.arrived}:null; })()"""
PLAN = r"""(()=>{ const G=GAME.G; let d=G.day; while(CALENDAR.dateOf(d).wd!==6||(d===G.day&&G.hour>13.5)) d++; OUT.plan(G,{id:'kx_tour',ev:'ev_kexin_tour_nccu',day:d,h:14,place:'木柵大學',title:'去木柵大學找可昕',travel:'開車約 30 分鐘',travelH:0.5}); return d; })()"""
STEP = r"""(()=>{ const d=document.getElementById('dlg'), bg=document.getElementById('advBg'), cs=bg?getComputedStyle(bg):null, tc=document.getElementById('titleCard')||document.querySelector('.titleCard');
  return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
    choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), ev:typeof EVENTS!=='undefined'&&EVENTS.running?(EVENTS.cur&&EVENTS.cur.id)||(EVENTS.current&&EVENTS.current.id)||true:false,
    cap:(document.getElementById('caption')||document.getElementById('sceneCap')||{}).textContent||'', bg:cs?{op:cs.opacity, img:cs.backgroundImage.slice(0,90)}:null, tc:tc&&tc.offsetParent?(tc.textContent||'').trim().slice(0,60):'',
    zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), key:CALENDAR.dateOf(GAME.G.day).key}; })()"""
AFTER = r"""(()=>{ const G=GAME.G, F=G.flags, P=GAME.E.player.obj.position; return {zone:G.zone, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), x:+P.x.toFixed(2), z:+P.z.toFixed(2), NCCU_VISITED:F.NCCU_VISITED, K1_ORDER:F.K1_ORDER,
  done:(G.events&&G.events.done||{}).ev_kexin_tour_nccu|0}; })()"""


async def drive(pg, cdp, tag, prefix, stop=None, max_s=240):
    lines = []; t0 = time.time()
    while time.time() - t0 < max_s:
        st = await pg.evaluate(STEP)
        if stop and stop(st): return lines, st
        if st['choices']:
            i = next((n for n, x in enumerate(st['choices']) if x.startswith('出發')), 0)
            lines.append({'menu': st['choices'], 'pick': st['choices'][i]}); await pg.screenshot(path=os.path.join(OUT, '%s_menu_%02d.png' % (prefix, len(lines))))
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(1000); continue
        if st['dlg']:
            if not lines or lines[-1].get('t') != st['t']:
                lines.append({k: st[k] for k in ('who', 't', 'cap', 'bg', 'tc', 'ev', 'zone', 'h')}); await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (prefix, len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if st['tc'] and (not lines or lines[-1].get('tc') != st['tc']): lines.append({'tc': st['tc'], 'zone': st['zone'], 'h': st['h']})
        if lines and not st['ev'] and time.time() - t0 > 8 and not st['tc']:
            await pg.wait_for_timeout(1500); st2 = await pg.evaluate(STEP)
            if not st2['dlg'] and not st2['choices'] and not st2['ev']: return lines, st2
        await pg.wait_for_timeout(500)
    return lines, await pg.evaluate(STEP)


async def one(pg, cdp, case, res):
    tag = '[%s]' % case
    await pg.goto(URL); await L.wait_loaded(pg)
    s = await D.load_zone(pg, cdp, 'dorm', DAY, 20.0, wait=5000)
    await pg.evaluate(PREP); await pg.wait_for_timeout(4000)
    q = await pg.evaluate(OUTQ); planned_by = 'game'
    if not q: d = await pg.evaluate(PLAN); q = await pg.evaluate(OUTQ); planned_by = 'probe OUT.plan（捷徑）'
    R.setup('%s 【前置／捷徑】讀檔到宿舍 %s 20:00；交往、KX_TOUR_YES → 出遊 %s（排的：%s）' % (tag, DAY, J(q), planned_by))
    if not R.check('%s 有排出遊 kx_tour' % tag, bool(q), ''): return
    await pg.evaluate("(d=>{ const G=GAME.G; G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=13.33; })", q['day']); await pg.wait_for_timeout(500)
    R.setup('%s 【捷徑】日子跳到 %s 13:20（同一個存檔往後）' % (tag, q['key']))
    # 等「出發」
    t0 = time.time(); got = None
    while time.time() - t0 < 120:
        st = await pg.evaluate(STEP)
        if st['choices'] and any(x.startswith('出發') for x in st['choices']): got = st; break
        if st['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(800)
    await pg.screenshot(path=os.path.join(OUT, 'kx_%s_go.png' % case))
    R.note('%s 跳出來的選單：%s（%s）' % (tag, J(got and got['choices']), J(await pg.evaluate(OUTQ))))
    if not R.check('%s 時間到跳「出發」' % tag, bool(got), ''): return
    stop = (lambda st: bool(st['dlg']) and ((st['bg'] and 'nccu_food' in (st['bg'].get('img') or '')) or '小吃街' in (st['cap'] or ''))) if case == 'E2' else None
    lines, st = await drive(pg, cdp, tag, 'kx_%s' % case, stop=stop)
    rec = {'lines': lines}
    if case == 'E2':
        R.note('%s 演到小吃街那一刻停：%s；到這裡的句子 %s' % (tag, J(st), J([(x.get('who', ''), x.get('t') or x.get('tc') or x.get('pick')) for x in lines])))
        rec['at_stop'] = st; rec['out_at_stop'] = await pg.evaluate(OUTQ)
        await pg.screenshot(path=os.path.join(OUT, 'kx_E2_stop.png'))
        await pg.goto(URL); await L.wait_loaded(pg)
        ok = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); if(!b||b.offsetParent===null) return false; b.click(); return true; })()")
        await pg.wait_for_timeout(6000)
        st2 = await pg.evaluate(STEP); af = await pg.evaluate(AFTER); oq = await pg.evaluate(OUTQ)
        await pg.screenshot(path=os.path.join(OUT, 'kx_E2_reloaded.png'))
        R.setup('%s 【捷徑】重新整理頁面、按標題「繼續（自動存檔）」（按到 %s）' % (tag, ok))
        R.note('%s 讀回來：%s；出遊 %s；畫面 %s' % (tag, J(af), J(oq), J({k: st2[k] for k in ('dlg', 't', 'who', 'ev', 'cap', 'bg', 'zone', 'h')})))
        rec['reloaded'] = {'after': af, 'out': oq, 'screen': st2}
        lines2, st = await drive(pg, cdp, tag, 'kx_E2b')
        rec['lines_after_reload'] = lines2
        R.note('%s 讀回來以後的句子：%s' % (tag, J([(x.get('who', ''), x.get('t') or x.get('tc') or x.get('pick')) for x in lines2])))
    af = await pg.evaluate(AFTER); oq = await pg.evaluate(OUTQ); await pg.screenshot(path=os.path.join(OUT, 'kx_%s_end.png' % case))
    R.note('%s 句子（說話的人｜字｜字幕｜底）：%s' % (tag, J([(x.get('who', ''), x.get('t') or x.get('tc') or x.get('pick'), x.get('cap'), (x.get('bg') or {}).get('img')) for x in lines])))
    R.note('%s 演完：%s；出遊 %s' % (tag, J(af), J(oq)))
    # 演完 20 秒內有沒有別的事件插進來
    extra = []; t1 = time.time()
    while time.time() - t1 < 20:
        st = await pg.evaluate(STEP)
        if st['dlg'] or st['ev']:
            extra.append({k: st[k] for k in ('who', 't', 'ev', 'zone', 'h')})
            if st['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    R.note('%s 演完 20 秒內插進來的：%s' % (tag, J(extra)))
    rec.update({'after': af, 'out': oq, 'extra': extra})
    R.check('%s 演完、記成去過（ev 演過、NCCU_VISITED）' % tag, af['done'] >= 1 and bool(af['NCCU_VISITED']), J(af))
    R.check('%s 回程沒有別的事件插進來' % tag, not extra, J(extra[:3]))
    res[case] = rec


async def main():
    print('CC 可昕導遊（木柵大學）：SHA %s；CASES %s；%s' % (SHA or '?', CASES, DAY), flush=True)
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
    open(os.path.join(OUT, 'kx_tour.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
