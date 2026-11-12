"""CC（帳號 A）11-10：US_CLASS_STORY（BB 15:52；US-CLASSROOM-3D-1110 劇情接線 b1d9457ed，開發分支 01bab1823）。美國的三門課在 3D Room 120 上。
真實流程（點地面走路、按互動鍵、點對話與選項；不用 ?turbo）。【前置／捷徑】：讀檔到那一天那個時間那一區（存檔＝GAME.defaults＋交換旗標
  EXCHANGE_ROUTE US、US_DEPARTED、US_ARRIVED…，照 tests/us_classroom_story_unit.js 的 US()），之後全部像玩家一樣操作。
CASES（逗號分隔）：
  GATE    2028-08-21 週一 09:30（Introduction 10:00）在美國校園走到「進教室」按 → 要進 Room 120；同一天 14:00 → 不進 3D（還在 us_campus）
  WALK    2028-08-22 週二 12:30（Comparative 13:00）走進教室 → 自己的座位是「坐下（你常坐的位置）」、在 comp [0,4] → 點過去坐下 → 選「上課：…」
          → 字幕（GAME.caption 原文＋顯示幾毫秒）、坐著上課截圖、教授在講桌和白板之間來回（每秒記位置，看會不會卡住）、下課大家走兩側走道（每 0.5 秒記，最近兩人距離）
  ONE     2028-08-23 週三 08:30 在公寓按「去上課」（一鍵上課）→ 淡入那一刻：玩家坐在 intro [2,7]？方塊備用模型（fallback 群組）看得到嗎？正式模型載完了嗎？截圖
  MID     2028-10-26 週四 12:30 公寓一鍵上課 → 期中報告在 3D 演（玩家、德國同學站講桌兩邊、教授坐第 1 排最右邊）；對話框每一頁截圖
  EXAM    2028-12-06 週三 08:30 → 期末考（教授站講桌後面）
  FINAL   2028-12-07 週四 12:30 → 期末報告，選「只講」那一個（b），每秒記教授位置（要經過玩家走到門口）
  LAST    2028-12-08 週五 08:00 → 最後一堂（舊序章同學念句子那一拍站起來）
  PERF    WALK 的坐著上課那段量 10 秒幀率（E.frame）、路人數；畫質照遊戲設定（PC 的 medium）
判斷是 BB 的；這裡記資料、截圖、CC 初判。Playwright（PC GPU）≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=GATE,WALK,ONE,MID,EXAM,FINAL,LAST] [Q=medium] python3 cc_us_class_story_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CASES = (os.environ.get('CASES') or 'GATE,WALK,ONE,MID,EXAM,FINAL,LAST').split(',')
R = L.Run('us_class_story', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
USF = "(k=>({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:STORY.dayOfKey('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:STORY.dayOfKey('2028-06-08')}))()"
HOOK = r"""(()=>{ if(window.__UC) return; window.__UC={cap:[],say:[]}; const c0=GAME.caption; GAME.caption=function(w,t,ms){ try{ window.__UC.cap.push({w:String(w||''),t:String(t||''),ms:ms||0,z:GAME.G.zone,h:+(+GAME.G.hour).toFixed(3),rt:Date.now()}); }catch(e){} return c0.apply(this,arguments); };
  const s0=GAME.say; GAME.say=function(w,t){ try{ let pd=null; try{ const E=GAME.E, pp=E.player.obj.position, q=(E.npcs||[]).find(n=>n.usWho==='prof'); if(q) pd=+Math.hypot(q.obj.position.x-pp.x,q.obj.position.z-pp.z).toFixed(2); }catch(e){} window.__UC.say.push({n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t||''),z:GAME.G.zone,rt:Date.now(),pd}); }catch(e){} return s0.apply(this,arguments); }; })()"""
CAST = r"""(()=>{ const E=GAME.E; return (E.npcs||[]).filter(n=>n.usCls||n.leaving).map(n=>{ const p=n.obj.position; return {who:n.usWho||'?',x:+p.x.toFixed(2),z:+p.z.toFixed(2),seat:!!n.seat,leaving:!!n.leaving,beh:n.beh}; }); })()"""
ME = r"""(()=>{ const E=GAME.E, P=E.player, s=P.seat, z=E.zone||{}; let fb=null, formal=!!z.formal; if(z.group){ const g=z.group.children.find(o=>o.name==='fallback'); fb=g?g.visible:null; }
  let rc=null; if(s&&z.seats){ const q=z.seats.find(t=>Math.abs(t.x-s.x)<0.01&&Math.abs(t.z-s.z)<0.01); if(q) rc=[q.row,q.col]; }
  return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), seat:rc, pose:P.pose, busy:!!P.busy, fallbackVisible:fb, formal, fade:document.getElementById('fade')?(document.getElementById('fade').classList.contains('on')?1:0):null, fps:E.frame, fb:GAME.walkFallbacks|0}; })()"""


async def base(pg, cdp, key, h, zone, why):
    await D.load_zone(pg, cdp, zone, key, h, wait=6000)
    await pg.evaluate("(f=>{ Object.assign(GAME.G.flags, f); })(%s)" % USF)
    snap = await pg.evaluate("()=>GAME.snapshot()"); await L.load_state(pg, snap, quiet_events=False, quiet_phone=True)
    await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp); await L.phone_away(pg, cdp)
    await pg.evaluate(HOOK)
    R.setup('【前置／捷徑】讀檔到 %s %.2f %s＋交換旗標（EXCHANGE_ROUTE US、US_ARRIVED…，同 us_classroom_story_unit.js）；%s' % (key, h, zone, why))
    return await pg.evaluate(ME)


async def find_it(pg, js_pred):
    return await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>%s); return it?{label:i_label(it),x:it.x,z:it.z,r:it.radius||1.2,lv:it.lv|0}:null; function i_label(i){ return i.label; } })()" % js_pred)


async def use(pg, cdp, it, tag, max_s=240):
    ok = await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.8), '%s 走到「%s」' % (tag, it['label']), max_s=max_s, lv=it['lv'])
    await pg.wait_for_timeout(800); s = await L.state(pg)
    R.check('%s 走到「%s」、互動按鈕出現' % (tag, it['label']), bool(ok) and bool(s['interact']), J({k: s[k] for k in ('x', 'z', 'interact', 'fallbacks')}))
    await L.tap(pg, cdp, '#interact'); return s


async def play_through(pg, cdp, tag, pick=None, shots=0, max_s=600, watch=None, until=None):
    """點對話、照 pick(opts)→index 選；shots＝對話框前幾頁截圖；watch(t)＝每秒呼叫一次（記位置）；until(me)→True 就停"""
    t0 = time.time(); n = 0; last = 0; picked = []; slow = 'FINAL' in tag   # r2：FINAL 每頁對話停 2.5 秒（教授起身走到門口要時間；r1 點太快，演完時她剛走到走道）
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if watch and time.time() - last >= 1.0: last = time.time(); await watch(time.time() - t0)
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            k = pick(opts) if pick else 0; picked.append(opts[k] if k < len(opts) else None); R.note('%s 選單 %s → 選 %s' % (tag, J(opts), J(opts[k] if k < len(opts) else k)))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            if n < shots: n += 1; await pg.screenshot(path=os.path.join(OUT, 'usc_%s_dlg%02d.png' % (tag.strip('[]').replace(' ', '_'), n)))
            if slow:
                for _ in range(5):
                    await pg.wait_for_timeout(500)
                    if watch and time.time() - last >= 0.5: last = time.time(); await watch(time.time() - t0)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        me = await pg.evaluate(ME)
        if until and until(me): return me, picked
        await pg.wait_for_timeout(700)
    return await pg.evaluate(ME), picked


async def one_click(pg, cdp, tag):
    """公寓「去上課」：淡入那一刻記 ME（每 100 ms 看，從淡出到淡入）"""
    it = await find_it(pg, "i.uslClass")
    if not R.check('%s 公寓有「去上課」' % tag, bool(it), ''): return None
    await use(pg, cdp, it, tag)
    seen = []; t0 = time.time(); fadeIn = None
    while time.time() - t0 < 90:
        s = await L.state(pg)
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            k = next((i for i, o in enumerate(opts) if '上課' in o), 0); R.note('%s 選單 %s → %s' % (tag, J(opts), opts[k])); await P.tap_choice(pg, cdp, k); continue
        me = await pg.evaluate(ME); seen.append(me)
        if me['zone'] == 'us_classroom' and me['fade'] is not None and float(me['fade']) < 0.6:
            fadeIn = me; await pg.screenshot(path=os.path.join(OUT, 'usc_%s_fadein.png' % tag.strip('[]'))); break
        await pg.wait_for_timeout(100)
    R.note('%s 淡入前後 %d 筆：%s' % (tag, len(seen), J([q for q in seen if q['zone'] == 'us_classroom'][:6])))
    return fadeIn


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC US_CLASS_STORY：worktree %s；CASES %s；Playwright（PC GPU）≠ iPhone' % (real or '?', CASES), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        if os.environ.get('Q'): await pg.evaluate("(q=>{ try{ GAME.setQuality?GAME.setQuality(q):(GAME.E.q.level=q); }catch(e){} })('%s')" % os.environ['Q'])
        for case in CASES:
            tag = '[%s]' % case
            try:
                if case == 'GATE':
                    await base(pg, cdp, '2028-08-21', 9.5, 'us_campus', '週一 09:30，Introduction 10:00')
                    it = await find_it(pg, "i.usClass")
                    if R.check('%s 美國校園有「進教室」' % tag, bool(it), ''):
                        await use(pg, cdp, it, tag); await pg.wait_for_timeout(6000); me = await pg.evaluate(ME)
                        await pg.screenshot(path=os.path.join(OUT, 'usc_GATE_in.png'))
                        R.check('%s 有課時段（開始前 30 分）按「進教室」：進 Room 120' % tag, me['zone'] == 'us_classroom', J(me))
                    await base(pg, cdp, '2028-08-21', 14.0, 'us_campus', '週一 14:00 沒課')
                    it = await find_it(pg, "i.usClass")
                    if it:
                        await use(pg, cdp, it, tag + ' 沒課'); await pg.wait_for_timeout(5000); me = await pg.evaluate(ME); cap = await pg.evaluate("window.__UC.cap.slice(-2)")
                        await pg.screenshot(path=os.path.join(OUT, 'usc_GATE_closed.png'))
                        R.check('%s 沒課時段按「進教室」：不進 3D（還在 us_campus）' % tag, me['zone'] == 'us_campus', J({'me': me, 'cap': cap}))
                if case in ('WALK', 'PERF'):
                    await base(pg, cdp, '2028-08-22', 12.5, 'us_campus', '週二 12:30，Comparative 13:00')
                    it = await find_it(pg, "i.usClass")
                    if not R.check('%s 美國校園有「進教室」' % tag, bool(it), ''): continue
                    await use(pg, cdp, it, tag); await pg.wait_for_timeout(8000)
                    mine = await pg.evaluate("(()=>{ const z=GAME.E.zone; const it=(GAME.E.interactables||[]).find(i=>i.seat&&/常坐/.test(i.label||'')); if(!it) return null; const q=z.seats.find(t=>t===it.seat||(Math.abs(t.x-it.seat.x)<0.01&&Math.abs(t.z-it.seat.z)<0.01)); return {label:it.label,x:it.x,z:it.z,r:it.radius,lv:0,rc:q?[q.row,q.col]:null,sx:it.seat.x,sz:it.seat.z}; })()")
                    cast0 = await pg.evaluate(CAST); await pg.screenshot(path=os.path.join(OUT, 'usc_WALK_enter.png'))
                    R.note('%s 進來時坐著的人 %d 個：%s' % (tag, len(cast0), J(cast0)))
                    R.check('%s 自己的座位顯示「坐下（你常坐的位置）」、在 comp [0,4]' % tag, bool(mine) and mine['rc'] == [0, 4], J(mine))
                    if not mine: continue
                    await L.go_to(pg, cdp, R, mine['x'], mine['z'], 0.3, '%s 走到自己的座位' % tag, max_s=240)
                    await pg.wait_for_timeout(800); s_ = await L.state(pg)
                    R.check('%s 走到座位旁、按鈕「坐下（你常坐的位置）」' % tag, '常坐' in (s_['interact'] or ''), J({k: s_[k] for k in ('x', 'z', 'interact')}))
                    # 坐下以後的選單：上課
                    prof = []
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)   # 按「坐下」→ 座位選單（上課：課名）
                    c0 = len(await pg.evaluate("window.__UC.cap"))
                    fr0 = await pg.evaluate("[GAME.E.frame, performance.now()]"); await pg.wait_for_timeout(100)
                    sat = []; fwin = []
                    async def watch(t):
                        q = await pg.evaluate(CAST); pr = [c for c in q if c['who'] == 'prof']
                        if pr: prof.append([round(t, 1), pr[0]['x'], pr[0]['z']])
                        m_ = await pg.evaluate(ME)
                        if m_['seat'] and t >= 5 and len(sat) < 2 and (not sat or t - sat[-1]['_t'] >= 4):   # r2：字卡（黑底課名）過了再拍
                            m_['_t'] = t; sat.append(m_); await pg.screenshot(path=os.path.join(OUT, 'usc_WALK_seated%d.png' % len(sat)))
                        if m_['seat'] and t >= 3 and not fwin: fwin.append([m_['fps'], time.time()])
                        if m_['seat'] and fwin and len(fwin) == 1 and time.time() - fwin[0][1] >= 8: fwin.append([m_['fps'], time.time()]); R.note('%s 坐著 8 秒幀率（只有每秒一次讀狀態）：%.1f fps' % (tag, (fwin[1][0] - fwin[0][0]) / (fwin[1][1] - fwin[0][1])))
                    me, picked = await play_through(pg, cdp, tag, pick=lambda o: next((i for i, x in enumerate(o) if '上課' in x), 0), max_s=600, watch=watch,
                                                    until=lambda m: m['zone'] == 'us_classroom' and not m['busy'] and m['h'] >= 14.25)
                    fr1 = await pg.evaluate("[GAME.E.frame, performance.now()]"); n_ = len(await pg.evaluate(CAST))
                    R.note('%s 坐著上課那段幀率：%.1f fps（%d 格／%.1f 秒）；教室裡的人 %d' % (tag, (fr1[0] - fr0[0]) / max(0.001, (fr1[1] - fr0[1]) / 1000), fr1[0] - fr0[0], (fr1[1] - fr0[1]) / 1000, n_))
                    R.note('%s 坐著的狀態：%s' % (tag, J(sat)))
                    caps = (await pg.evaluate("window.__UC.cap"))[c0:]
                    R.note('%s 上課字幕（GAME.caption 原文，ms＝顯示多久）：%s' % (tag, J(caps)))
                    R.check('%s 選了「上課：…」、有上課的字幕（蓋在 3D 上，不切 2D 背景）' % tag, any('上課' in (x or '') for x in picked) and bool(caps), J({'picked': picked, 'caps': caps[:4]}))
                    short = [c for c in caps if len(c['t']) > 0 and c['ms'] and c['ms'] / max(1, len(c['t'])) < 120]
                    R.note('%s 字幕長度／秒數（每字少於 120 ms 的：%s）' % (tag, J([[len(c['t']), c['ms']] for c in caps])))
                    moved = 0; stuck = 0
                    for a, b2 in zip(prof, prof[1:]):
                        d = math.hypot(b2[1] - a[1], b2[2] - a[2]); moved += d
                    R.note('%s 教授位置（每秒）%d 筆，總共走了 %.1f m：%s' % (tag, len(prof), moved, J(prof[:40])))
                    xs = [q[1] for q in prof]; R.check('%s 教授有在講桌和白板之間來回（x 範圍 ≥ 2 m）' % tag, bool(xs) and max(xs) - min(xs) >= 2.0, J({'xmin': min(xs) if xs else None, 'xmax': max(xs) if xs else None}))
                    # 下課：大家起身往門口走
                    traj = []; t0 = time.time()
                    while time.time() - t0 < 25:
                        q = await pg.evaluate(CAST); lv = [c for c in q if c['leaving']]
                        dmin = min((math.hypot(a['x'] - b3['x'], a['z'] - b3['z']) for i, a in enumerate(lv) for b3 in lv[i + 1:]), default=None)
                        traj.append({'t': round(time.time() - t0, 1), 'n': len(q), 'leaving': len(lv), 'dmin': dmin and round(dmin, 2)})
                        if len(traj) in (3, 8): await pg.screenshot(path=os.path.join(OUT, 'usc_WALK_leave%d.png' % len(traj)))
                        if not q: break
                        await pg.wait_for_timeout(500)
                    R.note('%s 下課離開（每 0.5 秒：人數、正在走的、最近兩人距離）：%s' % (tag, J(traj)))
                    close = [t for t in traj if t['dmin'] is not None and t['dmin'] < 0.3]
                    R.check('%s 下課大家走出去（25 秒內走完）' % tag, not traj or traj[-1]['n'] == 0, J(traj[-3:]))
                    R.note('%s 最近兩人距離 < 0.3 m 的時間點 %d 個（疊在一起的候選，看截圖判）：%s' % (tag, len(close), J(close[:10])))
                    me = await pg.evaluate(ME); R.check('%s 下課玩家留在教室、可以自己走' % tag, me['zone'] == 'us_classroom', J(me))
                if case == 'ONE':
                    await base(pg, cdp, '2028-08-23', 9.25, 'us_apartment', '週三 09:15，Introduction 10:00（r2：08:30 還沒到開始前 1 小時，公寓沒有「去上課」＝r1 TEST_BUG）')
                    fi = await one_click(pg, cdp, tag)
                    R.note('%s 淡入那一刻：%s' % (tag, J(fi)))
                    R.check('%s 一鍵上課：淡入時已坐在 intro [2,7]' % tag, bool(fi) and fi['seat'] == [2, 7], J(fi))
                    R.check('%s 一鍵上課：淡入時沒有露出方塊備用模型（fallback 群組藏著＝正式模型已載完）' % tag, bool(fi) and fi['fallbackVisible'] is not True, J(fi))
                    me, picked = await play_through(pg, cdp, tag, max_s=600, until=lambda m: m['zone'] == 'us_campus')
                    R.check('%s 下課回到法學院台階下（us_campus）' % tag, me['zone'] == 'us_campus', J(me))
                spec = {'MID': ('2028-10-26', 12.5, '期中報告（10/26 週四）', None, 'present'), 'EXAM': ('2028-12-06', 9.25, '期末考（12/6 週三 09:15；r1 08:30 太早）', None, 'exam'),
                        'FINAL': ('2028-12-07', 12.5, '期末報告（12/7 週四，選 b）', lambda o: next((i for i, x in enumerate(o) if '只講' in x), min(1, len(o) - 1)), 'present'),
                        'LAST': ('2028-12-08', 8.0, '最後一堂（12/8 週五）', None, 'class')}
                if case in spec:
                    key, h, why, pick, mode = spec[case]
                    await base(pg, cdp, key, h, 'us_apartment', why)
                    fi = await one_click(pg, cdp, tag); R.note('%s 淡入那一刻：%s' % (tag, J(fi)))
                    prof = []
                    async def watch2(t):
                        q = await pg.evaluate(CAST); pr = [c for c in q if c['who'] == 'prof']
                        if pr: prof.append([round(t, 1), pr[0]['x'], pr[0]['z'], pr[0]['seat']])
                    s0 = len(await pg.evaluate("window.__UC.say"))
                    cast = await pg.evaluate(CAST); R.note('%s 教室裡的人：%s' % (tag, J(cast)))
                    me, picked = await play_through(pg, cdp, tag, pick=pick, shots=4, max_s=900, watch=watch2, until=lambda m: m['zone'] == 'us_campus')
                    said = (await pg.evaluate("window.__UC.say"))[s0:]
                    R.note('%s GAME.say 原文 %d 句：%s' % (tag, len(said), J([[x['n'], x['t'], x['z']] for x in said])))
                    R.check('%s 事件在 3D 演（說話時區域是 us_classroom）' % tag, bool(said) and all(x['z'] == 'us_classroom' for x in said), J([x['z'] for x in said][:10]))
                    R.note('%s 教授位置（每秒）：%s' % (tag, J(prof[:60])))
                    if case == 'FINAL':
                        R.check('%s 選了 b（只講…）' % tag, any('只講' in (x or '') for x in picked), J(picked))
                        gc = [x for x in said if 'Good choice' in x['t']]   # r3（BB 21:41，US-FINAL-PROF-PASS-1110；8f1374ba0：旁白前先等教授走到玩家 1.4 m 內，最多 7 秒）：稿是「教授經過你旁邊」
                        R.note('%s 「Good choice.」那一句：%s；教授離玩家（說每一句時）%s' % (tag, J(gc), J([[x['t'][:12], x.get('pd')] for x in said])))
                        R.check('%s 選 b：「Good choice.」那一句出來時教授離玩家 1.5 m 以內' % tag, bool(gc) and gc[0].get('pd') is not None and gc[0]['pd'] <= 1.5, J(gc))
                    R.check('%s 演完回到 us_campus' % tag, me['zone'] == 'us_campus', J(me))
            except Exception as e:
                R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
