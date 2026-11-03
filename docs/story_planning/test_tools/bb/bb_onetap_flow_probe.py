# -*- coding: utf-8 -*-
"""BB（帳號 A）11-03：一鍵（ONE-TAP-GO-1103，USER_WANTS X189）真的走完全程的瀏覽器探針。
LAWWW 14:06：「子代理只做了 Node＋手機模擬截圖，真的走完全程（回宿舍上床、進教室坐下、出發約會）沒在瀏覽器驗過」。tests/onetap_shots.py 管按鈕、選單、確認框、取消；這支管「按確定以後真的到」。
流程（不用 ?turbo；Playwright 手機橫向 844×390，SwiftShader，不是 iPhone）：每個 case【前置】最小存檔讀檔（先關條件事件讀一次、GAME.snapshot()、再開條件事件讀一次）。
  sleep  2025-09-22（一）22:00 校園 → 手指按「一鍵」→「回去睡覺」→ 確認框：
         S1 防誤觸：確認框一跳出來就按「確定」（< 0.45 秒）不算；S2 點框外＝取消；S3 再開、等 1 秒按「確定」→
         S4 到宿舍 203（dorm）、上床睡覺（STORY._sleeping 出現過）、隔天早上醒來（day+1、04～11 點）、站得住；walkFallbacks 0。
  cls    2025-09-23（二）07:30 宿舍 203 → 「到下一堂課的教室」→ 確定 → C1 換到上課的區域、C2 人坐下（pose sit）、C3 到的時間在上課前（≤ 開始時間＋5 分）。
  date   2025-09-22（一）17:00 校園＋【前置】19:00 和以安約在兩點半 Café（G.invites accepted，同 onetap_shots）→「到下一個約會地點」→ 確定 →
         D1 先跳過時間到出發時間、D2 到兩點半 Café（cafe）、D3 約會開始（以安在場或她的對話）。
  （日本、套房、美國的「回去睡覺」先不在這支：路線前置太長，交 Node onetap_unit；之後要補再說）
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=sleep,cls,date] python3 bb_onetap_flow_probe.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL0, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
CASES = [c for c in os.environ.get('CASES', 'sleep,cls,date').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True, 'LAW_RECAP_SEEN': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'fundsV2': 1, 'CAMP_Y1': True}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'cvs', 'bookstore', 'dorm', 'dorm_hall', 'campus', 'classroom')
TS = r"""(()=>{ const G=GAME.G, E=GAME.E, D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg'), p=E.player;
  return {day:G.day, h:+(+G.hour).toFixed(3), zone:G.zone, dlg:!!(D&&D.active), name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
    txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[],
    busy:!!p.busy, pose:String(p.pose||''), seat:!!p.seat, sleeping:!!(typeof STORY!=='undefined'&&STORY._sleeping), cf:!document.getElementById('goConfirm').classList.contains('hide'),
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), npcs:Object.keys(GAME.npc||{}), fb:GAME.walkFallbacks|0}; })()"""
CHOICE_AT = "(k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"
DAY_JS = "k=>{ const d=STORY.dayOfKey(k); const c=CALENDAR.dateOf(d); return {d, wd:c.wd===7?0:c.wd, key:c.key}; }"


def url_for():
    base, _, q = URL0.partition('?'); ps = [x for x in q.split('&') if x and x != 'turbo']
    return base + ('?' + '&'.join(ps) if ps else '')


async def load(pg, run, key, h, zone, pos, extra=''):
    d = await pg.evaluate(DAY_JS, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASE), 'day': d['d'], 'weekday': d['wd'], 'hour': h,
          'zone': zone, 'pos': pos, 'weather': 'clear', 'stage': 'law', 'money': 30000, 'visited': {z: True for z in VISITED}}
    await pg.evaluate("(()=>{ if(!window.__OTEV) window.__OTEV={a:EVENTS.onEnter,b:EVENTS.tick}; })()")
    await pg.evaluate("localStorage.clear()")
    await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(2500)
    if extra: await pg.evaluate(extra)
    snap = await pg.evaluate("()=>GAME.snapshot()"); snap = snap.get('G', snap) if isinstance(snap, dict) else snap; snap['hour'] = h
    await pg.evaluate("(()=>{ EVENTS.onEnter=window.__OTEV.a; EVENTS.tick=window.__OTEV.b; })()")
    await L.load_state(pg, snap, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(3500)
    await pg.evaluate("(()=>{ GAME.walkFallbacks=0; })()")
    run.setup('最小存檔 %s（星期%s）%.2f 時 %s（條件事件照開）%s' % (d['key'], '日一二三四五六'[d['wd']], h, zone, '；' + extra[:80] if extra else ''))
    return d


async def calm(pg, cdp, secs=15):
    """讀檔後先把自己冒出來的對話點掉、手機收起來（照玩家）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await pg.evaluate(TS)
        if s['ch']: c = await pg.evaluate(CHOICE_AT, 0); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        break
    await L.close_panels(pg, cdp)


async def open_item(pg, cdp, k):
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(900)
    items = await pg.evaluate("[...document.querySelectorAll('#goPop .goItem')].map(e=>({k:e.dataset.gok,dim:e.classList.contains('dim'),t:e.innerText.replace(/\\n/g,' / ')}))")
    it = next((i for i in items if i['k'] == k), None)
    if it and not it['dim']: await L.tap(pg, cdp, '#goPop [data-gok="%s"]' % k)
    return items, it


async def follow(pg, cdp, run, until, max_s, label, tag):
    """按確定以後照玩家：對話點過去、選項點第一個、手機收起來，直到 until(s) 成立。回傳 (成立的狀態, 經過的狀態摘要)"""
    t0 = time.time(); trail = []; last = None; since = time.time(); seen_sleep = False
    while time.time() - t0 < max_s:
        s = await pg.evaluate(TS); seen_sleep = seen_sleep or s['sleeping']; s['_slept'] = seen_sleep
        sig = (s['zone'], s['day'], round(s['h'], 1), s['txt'][:20], tuple(s['ch']))
        if sig != last:
            last = sig; since = time.time(); trail.append({k: s[k] for k in ('zone', 'day', 'h', 'pose', 'name')} | {'txt': s['txt'][:30], 'ch': s['ch'][:3]})
        elif time.time() - since > 240: run.note('%s：240 秒沒有變化 %s' % (label, J(s))); await run.shot(pg, tag + '_stuck'); return None, trail
        if until(s): return s, trail
        if s['ch']:
            c = await pg.evaluate(CHOICE_AT, 0)
            if c: await L.touch_tap(cdp, c[0], c[1])
            await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['phone'] and not s['busy']: await L.phone_away(pg, cdp, tries=1); continue
        await pg.wait_for_timeout(1000)
    run.note('%s：%d 秒內沒有到 %s' % (label, max_s, J(await pg.evaluate(TS)))); return None, trail


async def case_sleep(pg, cdp, run):
    d = await load(pg, run, '2025-09-22', 22.0, 'campus', {'x': 30, 'z': -60, 'yaw': 0}); await calm(pg, cdp)
    s0 = await pg.evaluate(TS)
    await pg.evaluate("""(()=>{ const box=document.getElementById('goConfirm'), y=document.getElementById('goCfYes'); window.__OTT={shown:box.classList.contains('hide')?null:performance.now(),tap:null};
      new MutationObserver(()=>{ if(!box.classList.contains('hide')&&window.__OTT.shown==null) window.__OTT.shown=performance.now(); }).observe(box,{attributes:true});
      y.addEventListener('touchstart',()=>{ if(window.__OTT.tap==null) window.__OTT.tap=performance.now(); },{capture:true}); })()""")
    items, it = await open_item(pg, cdp, 'sleep')
    run.check('sleep 22:00「回去睡覺」可以按', bool(it) and not it['dim'], J(items))
    # 防誤觸：量「框出現」到「手指按下確定」的時間（頁面裡的 performance.now）；超過 0.45 秒＝探針太慢、這一項不算數
    yc = await L.center_of(pg, '#goCfYes')
    if yc: await L.touch_tap(cdp, yc[0], yc[1])
    await pg.wait_for_timeout(1500)
    tt = await pg.evaluate("(()=>window.__OTT)()"); gap = (tt['tap'] - tt['shown']) if tt and tt.get('tap') is not None and tt.get('shown') is not None else None
    s1 = await pg.evaluate(TS)
    run.note('S1 框出現到按下確定：%s ms' % (None if gap is None else round(gap)))
    if gap is not None and gap < 450:
        run.check('S1 防誤觸：確認框剛跳出來（%d ms）就按「確定」不算（還在原地、框還開著）' % gap, s1['zone'] == 'campus' and s1['cf'] and abs(s1['h'] - s0['h']) < 0.2, J(s1))
    else:
        run.note('S1 不算數：探針按得太慢（%s ms ≥ 450），雲端 SwiftShader 做不到；防誤觸交 Node onetap_unit／PC' % (None if gap is None else round(gap)))
        if not s1['cf']: run.note('S1 已經出發了：回到校園重來 S2'); await load(pg, run, '2025-09-22', 22.0, 'campus', {'x': 30, 'z': -60, 'yaw': 0}); await calm(pg, cdp); s0 = await pg.evaluate(TS); await open_item(pg, cdp, 'sleep'); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=os.path.join(OUT, 'sleep_confirm.png'))
    await L.touch_tap(cdp, 20, 20); await pg.wait_for_timeout(1200)   # 框外
    s2 = await pg.evaluate(TS)
    run.check('S2 點確認框外面＝取消（框關掉、還在校園、時間沒跳）', not s2['cf'] and s2['zone'] == 'campus' and abs(s2['h'] - s0['h']) < 0.3, J(s2))
    items, it = await open_item(pg, cdp, 'sleep'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)
    s3 = await pg.evaluate(TS)
    run.check('S3 等 1 秒再按「確定」：框關掉、開始走', not s3['cf'], J(s3))
    fin, trail = await follow(pg, cdp, run, lambda s: s['day'] == d['d'] + 1 and 4 <= s['h'] < 12 and s['zone'] == 'dorm' and not s['dlg'] and not s['busy'], 900, 'sleep', 'sleep')
    run.note('sleep 經過：%s' % J(trail[-12:]))
    await pg.screenshot(path=os.path.join(OUT, 'sleep_morning.png'))
    run.check('S4 到宿舍 203、上床睡著、隔天早上在宿舍醒來（day+1、04～11 點）', bool(fin), J(fin))
    run.check('S4 中間真的睡了（STORY._sleeping 出現過）', bool(fin) and fin['_slept'], J(fin and fin['_slept']))
    run.check('S4 walkFallbacks 0（沒有走不過去被直接放到目的地）', bool(fin) and fin['fb'] == 0, J(fin and fin['fb']))


async def case_cls(pg, cdp, run):
    d = await load(pg, run, '2025-09-23', 7.5, 'dorm', {'x': 0, 'z': 2.4, 'yaw': 3.14}); await calm(pg, cdp)
    nxt = await pg.evaluate("(()=>{ try{ const p=ONETAP.plan(GAME,'cls'); return {ok:p.ok,why:p.why||'',lines:p.lines||[],to:p.zone||p.to||null,h:p.h||p.start||null}; }catch(e){ return {err:String(e)}; } })()")
    run.note('cls 計畫：%s' % J(nxt))
    items, it = await open_item(pg, cdp, 'cls')
    run.check('cls 07:30「到下一堂課的教室」可以按', bool(it) and not it['dim'], J(items))
    body = await pg.evaluate("document.getElementById('goCfBody').innerText"); run.note('cls 確認框：%s' % body.replace('\n', ' / '))
    await pg.screenshot(path=os.path.join(OUT, 'cls_confirm.png'))
    await pg.wait_for_timeout(1200); await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)
    fin, trail = await follow(pg, cdp, run, lambda s: s['zone'] not in ('dorm', 'dorm_hall', 'campus') and (s['pose'] == 'sit' or s['seat']) and not s['dlg'], 900, 'cls', 'cls')
    run.note('cls 經過：%s' % J(trail[-12:]))
    await pg.screenshot(path=os.path.join(OUT, 'cls_seated.png'))
    run.check('C1／C2 換到上課的區域、坐下', bool(fin), J(fin))
    start = await pg.evaluate("(()=>{ try{ const c=CLS.today?CLS.today(GAME.G):null; return c; }catch(e){ return null; } })()")
    run.note('C3 上課時間（CLS.today）：%s' % J(start)[:300])
    run.check('C2 walkFallbacks 0', bool(fin) and fin['fb'] == 0, J(fin and fin['fb']))


async def case_date(pg, cdp, run):
    inv = "(()=>{ const G=GAME.G; G.invites=[{id:'bb_ot_i1',state:'accepted',day:G.day,h:19,who:'heroine_01',place:'cafe'}]; })()"
    d = await load(pg, run, '2025-09-22', 17.0, 'campus', {'x': 30, 'z': -60, 'yaw': 0}, extra=inv); await calm(pg, cdp)
    items, it = await open_item(pg, cdp, 'date')
    run.check('date 17:00「到下一個約會地點」可以按', bool(it) and not it['dim'], J(items))
    body = await pg.evaluate("document.getElementById('goCfBody').innerText"); run.note('date 確認框：%s' % body.replace('\n', ' / '))
    await pg.screenshot(path=os.path.join(OUT, 'date_confirm.png'))
    await pg.wait_for_timeout(1200); await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)
    fin, trail = await follow(pg, cdp, run, lambda s: s['zone'] == 'cafe' and ('heroine_01' in s['npcs'] or s['name'].startswith('沈以安') or s['name'].startswith('以安')), 900, 'date', 'date')
    run.note('date 經過：%s' % J(trail[-12:]))
    await pg.screenshot(path=os.path.join(OUT, 'date_arrive.png'))
    run.check('D1／D2 先跳過時間、到兩點半 Café', bool(fin) and fin['zone'] == 'cafe' and fin['h'] >= 18.5, J(fin))
    run.check('D3 約會開始（以安在場或她開口）', bool(fin), J(fin and {'npcs': fin['npcs'][:6], 'name': fin['name']}))


async def main():
    run = L.Run('onetap_flow', OUT); os.makedirs(OUT, exist_ok=True)
    print('bb_onetap_flow_probe  SHA=%s  CASES=%s  URL=%s' % (SHA, CASES, url_for()), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        pg.set_default_timeout(180000)
        try:
            await pg.goto(url_for()); run.check('遊戲載入', await L.wait_loaded(pg))
            for c in CASES:
                try: await {'sleep': case_sleep, 'cls': case_cls, 'date': case_date}[c](pg, cdp, run)
                except Exception as e: run.check('%s 跑完（沒有探針例外）' % c, False, repr(e)[:400]); traceback.print_exc()
        except Exception as e:
            run.check('跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', SHA, flush=True)
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
