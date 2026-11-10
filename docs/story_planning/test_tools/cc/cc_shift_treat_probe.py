"""CC（帳號 A）11-10：SHIFT-TREAT-1110（X302）她打工的時候你走進店裡（BB 15:02；LAWWW 規則；src/shifttreat3d.js，台詞 AA_739 dc607dd90）。
新版 063cf14ab；舊版用 SHIFT-TREAT 合併前 8b31bbaa0（bbb0db1e0 的第一個 parent；aec7f851c^＝1e3c6ad6a 已經含合併 bbb0db1e0，不能當舊版）。
用語彤在一盞（wz_teahouse，週六 14:00 作息「一盞茶屋（打工）」）測；芷若（Café 吧檯）另一個 CASE。
真實流程：每個 case 讀檔在溫州街店門外 → 點地面走到「進入一盞」那個出口、按 → 進店等 8 秒（遊戲等兩秒）→ 記 GAME.say 的原文（只記不改）、點對話 → 點單（店裡的點單互動、選第一個買得起的）→ 量錢。
  A 陌生人：拿掉語彤的 FIRST_MET、熟悉 0 →（要）不演
  B 朋友＋T3 輪到：→（要）演 2～3 句、其中有「端了一壺」；點第一樣錢不扣、點第二樣照扣
  C 同一天（B 之後）出店再進店 →（要）不演
  D 玩家自己在一盞上班（存檔原本的 jobs.tea 週六班、現在在班的時段）→（要）不演
  E 點頭之交（認識、熟悉 10）→ 演也只能是 acq、不能招待：點第一樣照扣
  F 芷若（BB 15:06）：兩點半 Café 吧檯在班（作息 act barista，週二 20:00）、朋友＋T3 輪到 →（要）演 2～3 句、有「熱可可」；點第一樣不扣錢
【前置／捷徑】（標在每個 case）：存檔 tests/fixtures/user_save_day54_1110.json 改日子／時間／地點；語彤的熟悉／信任（SOCIAL rel）、FIRST_MET 記憶、
  G.flags.SHIFTT（nf 2、friend.treat 輪到第 3 組）、jobs.tea 的班表（A、B、C、E 拿掉玩家的週六班，D 保留）。舊版沒有 SHIFTT：同一份存檔，期待 B 不演、錢照扣＝FAIL。
quiet_phone（手機不自己打開），條件事件照開。Playwright 手機模擬 ≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old [CASES=A,B,C,D,E] python3 cc_shift_treat_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy, subprocess
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
CASES = (os.environ.get('CASES') or 'A,B,C,D,E,F').split(',')
R = L.Run('shift_treat_' + TAG, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
YT, ZONE = 'heroine_03', 'wz_teahouse'
FIX = 'tests/fixtures/user_save_day54_1110.json'
FIND = r"""(a=>{ const C=CHARACTERS[a.pid]; for(let d=a.from; d<a.from+60; d++){ const c=CALENDAR.dateOf(d); const wd=c.wd===7?0:c.wd; if(CALENDAR.holiday&&CALENDAR.holiday(d)) continue;
  const g=Object.assign({},GAME.G,{day:d,weekday:wd,hour:a.h,zone:a.zone}); let e=null; try{ e=STORY.schedEnt(C,g); }catch(err){}
  if(e&&e.zone===a.zone&&(!a.label||e.label===a.label)&&(!a.act||e.act===a.act)) return {d, wd, key:c.key}; } return null; })"""
ITS = "(()=>(GAME.E.interactables||[]).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,lv:i.lv|0,hidden:!!i.hidden,to:i.exit?i.exit.to:null,shop:i.wzShop||i.shop||null,kind:i.kind||null})))()"
ST = "(()=>({zone:GAME.G.zone, money:GAME.G.money, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(2), fb:GAME.walkFallbacks|0, sh:(GAME.G.flags||{}).SHIFTT||null, fam:(SOCIAL.rel('heroine_03')||{}).fam, lvl:SOCIAL.friendLevel?SOCIAL.friendLevel('heroine_03'):null, famZ:(SOCIAL.rel('heroine_02')||{}).fam, on:typeof SHIFTT!=='undefined'}))()"


DIAG = r"""(pid=>{ if(typeof SHIFTT==='undefined') return {on:false}; const S=SHIFTT, G=GAME.G; let e=null; try{ e=STORY.schedEnt(CHARACTERS[pid],G); }catch(err){ e=String(err); }
  const o=((G.flags.SHIFTT||{}).p||{})[pid]||{}; let oth=null; try{ oth=S.otherEv(G,pid,G.zone); }catch(err){ oth=String(err); }
  return {on:S.on(), stage:G.stage, zone:G.zone, shop:S.SHOP[pid], known:SOCIAL.has?SOCIAL.has(pid,'FIRST_MET'):null, sched:e&&{zone:e.zone,label:e.label,act:e.act}, onShift:S.onShift(G,pid), npc:!!(GAME.npc&&GAME.npc[pid]), leaving:!!(GAME.npc&&GAME.npc[pid]&&GAME.npc[pid].leaving),
    gapOk:o.day==null||G.day-o.day>=S.GAP, playerShift:S.playerShift(G,G.zone), upToday:S.upToday(G,pid), otherEv:oth, pick:S.pick(G,pid), due:S.due(GAME,pid), pending:S.pending&&S.pending(), enterN:GAME.enterN}; })"""   # 只讀：為什麼演／不演（SHIFTT 的每一個條件）


def load_fixture():
    for root in [os.environ.get('LW_TESTS') and os.path.join(os.environ['LW_TESTS'], '..'), '.']:
        if root and os.path.exists(os.path.join(root, FIX)): return json.load(open(os.path.join(root, FIX), encoding='utf-8'))
    r = subprocess.run(['git', 'show', '063cf14ab:' + FIX], capture_output=True)
    return json.loads(r.stdout.decode('utf-8')) if r.returncode == 0 else None


def mk(S, d, hour, case, pid=YT):
    s = copy.deepcopy(S); s = s.get('G', s); s.pop('_stuck', None); s.pop('_busy', None)
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone='wenzhou', pos=None, money=5000)
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') not in ('going', 'accepted')]
    so = s.setdefault('social', {}); rel = so.setdefault('rel', {}).setdefault(pid, {}); mem = so.setdefault('mem', {})
    so.setdefault('relUpDay', {})[pid] = d['d'] - 5
    f = s.setdefault('flags', {}); f.pop('SHIFTT', None)
    jobs = s.get('jobs') or {}
    if case != 'D' and 'tea' in jobs: jobs['tea']['day'] = []   # 玩家這週六沒有一盞的班
    if case == 'A':
        mem[pid] = [m for m in mem.get(pid, []) if m.get('tag') != 'FIRST_MET']; rel.update(fam=0, trust=0, comf=0)
    elif case == 'E':
        rel.update(fam=10, trust=0, comf=0)
    else:   # B、C、D：朋友、T3 輪到（nf 2→這次第 3 次、tn 0、沒招待過；friend.treat idx 2）
        rel.update(fam=45, trust=30, comf=20)
        f['SHIFTT'] = {'p': {pid: {'day': d['d'] - 10, 'n': 5, 'nf': 2, 'tn': 0, 'idx': {'friend.treat': 2, 'friend.happy': 0}}}, 'free': None}
    return s


async def drain(pg, cdp, t_s=10):
    """點對話（不選選項），t_s 秒內沒有對話就停"""
    t0 = time.time(); last = time.time()
    while time.time() - t0 < 120:
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); last = time.time()
        elif s['choices']: return 'choices'
        elif time.time() - last > t_s: return 'idle'
        await pg.wait_for_timeout(600)
    return 'timeout'


async def enter_shop(pg, cdp, tag, zone=ZONE):
    ex = [e for e in await pg.evaluate(ITS) if e['to'] == zone]
    if not R.check('%s 溫州街有進 %s 的入口' % (tag, zone), bool(ex), J(await pg.evaluate(ITS))[:400]): return False
    e = ex[0]
    ok = await L.go_to(pg, cdp, R, e['x'], e['z'], min(0.9, e['r'] * 0.8), '%s 走到「%s」' % (tag, e['label']), max_s=300, lv=e['lv'])
    await pg.wait_for_timeout(700); s = await L.state(pg)
    if not R.check('%s 走到門口、按鈕「%s」' % (tag, e['label']), bool(ok) and s['interact'].startswith(e['label'][:3]), J(s)): return False
    await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(500)
        if (await pg.evaluate(ST))['zone'] == zone: return True
    return False


async def buy_one(pg, cdp, tag):
    """店裡的點單：走到點單互動 → 按 → 選第一個買得起的（有「元」）→ 後面的選單選「不用／就這樣／外帶」或最後一個 → 點完對話。回傳 (錢的差, 選了什麼)"""
    its = await pg.evaluate(ITS); R.note('%s 店裡的互動點：%s' % (tag, J(its)))
    cand = [i for i in its if not i['to'] and not i['hidden'] and any(k in (i['label'] or '') for k in ('點', '飲料', '茶', '菜單', '買')) and not any(k in (i['label'] or '') for k in ('坐', '看'))]
    if not R.check('%s 找到點單的互動' % tag, bool(cand), ''): return None, None
    c = cand[0]; m0 = (await pg.evaluate(ST))['money']
    await L.go_to(pg, cdp, R, c['x'], c['z'], min(0.9, c['r'] * 0.8), '%s 走到「%s」' % (tag, c['label']), max_s=120, lv=c['lv'])
    await pg.wait_for_timeout(700); s = await L.state(pg)
    if not s['interact']: R.note('%s 沒有互動按鈕：%s' % (tag, J(s))); return None, None
    await L.tap(pg, cdp, '#interact'); picked = []; bought = False; t0 = time.time()
    while time.time() - t0 < 120:
        await pg.wait_for_timeout(700); s = await L.state(pg)
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(),dim:b.disabled||b.classList.contains('dim')}))")
            k = None
            if not bought: k = next((j for j, o in enumerate(opts) if '元' in o['t'] and not o['dim']), None); bought = k is not None
            if k is None: k = next((j for j, o in enumerate(opts) if any(w in o['t'] for w in ('不用', '就這樣', '外帶', '不了', '離開'))), len(opts) - 1)
            picked.append(opts[k]['t']); await P.tap_choice(pg, cdp, k); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if not s['busy'] and time.time() - t0 > 6: break
    m1 = (await pg.evaluate(ST))['money']
    return m1 - m0, picked


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC SHIFT-TREAT：worktree %s；TAG %s；CASES %s；Playwright ≠ iPhone' % (real or '?', TAG, CASES), flush=True)
    S = load_fixture()
    if not R.check('找到 day54 存檔', S is not None, FIX): print('FAILED', flush=True); return
    S = S.get('G', S); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, copy.deepcopy(S), quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(5000)   # 作息看存檔裡的旗標（標題畫面的空白 G 查不到語彤的班：雲端冒煙 r1）
        f = await pg.evaluate(FIND, {'pid': YT, 'from': S['day'] + 1, 'h': 14.0, 'zone': ZONE, 'label': '一盞茶屋（打工）'})
        if not R.check('找得到語彤在一盞打工的日子（週六 14:00）', bool(f), ''): await b.close(); return
        R.note('日子：%s' % J(f))
        fz = await pg.evaluate(FIND, {'pid': 'heroine_02', 'from': S['day'] + 1, 'h': 20.0, 'zone': 'cafe', 'label': None, 'act': 'barista'}); R.note('芷若在吧檯的日子：%s' % J(fz))
        if os.environ.get('IMM'):   # BB 15:52：01bab1823 新修——進店「馬上」按店裡的東西（點單、坐下）要先演完再做；出口不算。新舊對照：8a98ff1e0 扣錢（FAIL）、01bab1823 不扣（PASS）
            async def imm_load(pid, fd, hh, why):
                s_ = mk(S, fd, hh, 'B', pid=pid)
                await L.load_state(pg, s_, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp); await drain(pg, cdp, 4)
                R.setup('【前置／捷徑】day54 存檔 → %s %.1f 溫州街；%s（熟悉 45 信任 30＋SHIFTT nf 2、friend.treat idx 2＝T3 輪到）' % (fd['key'], hh, why))
                await P.say_hook(pg); return await pg.evaluate("window.__SAY.length")
            async def act(label_keys, tag):
                its = await pg.evaluate(ITS); c = next((i for i in its if not i['to'] and not i['hidden'] and any(k in (i['label'] or '') for k in label_keys) and not any(k in (i['label'] or '') for k in ('看',))), None)
                if not c: R.check('%s 找到「%s」' % (tag, '／'.join(label_keys)), False, J(its)); return None
                m0 = (await pg.evaluate(ST))['money']
                await L.go_to(pg, cdp, R, c['x'], c['z'], min(0.9, c['r'] * 0.8), '%s 馬上走到「%s」' % (tag, c['label']), max_s=120, lv=c['lv'])
                pend = await pg.evaluate("(()=>typeof SHIFTT==='undefined'?'none':(SHIFTT.pending()?'pending':'clear'))()"); R.note('%s 按下去之前 SHIFTT.pending：%s（pending＝還沒等滿兩秒）' % (tag, pend))
                await L.tap(pg, cdp, '#interact'); picked = []; t0 = time.time(); bought = False
                while time.time() - t0 < 150:
                    await pg.wait_for_timeout(700); s2 = await L.state(pg)
                    if s2['choices']:
                        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(),dim:b.disabled||b.classList.contains('dim')}))")
                        k = None
                        if not bought: k = next((j for j, o in enumerate(opts) if '元' in o['t'] and not o['dim']), None); bought = k is not None
                        if k is None: k = next((j for j, o in enumerate(opts) if any(w in o['t'] for w in ('不用', '就這樣', '外帶', '不了', '離開'))), len(opts) - 1)
                        picked.append(opts[k]['t']); await P.tap_choice(pg, cdp, k); continue
                    if s2['dlg']: await L.tap(pg, cdp, '#dlg'); continue
                    if not s2['busy'] and time.time() - t0 > 8: break
                return {'delta': (await pg.evaluate(ST))['money'] - m0, 'picked': picked, 'pend': pend, 'seat': await pg.evaluate("!!GAME.E.player.seat")}
            for case in CASES:
                tag = '[IMM %s]' % case
                if case == 'B':   # 語彤：進一盞馬上點單
                    n0 = await imm_load(YT, f, 14.0, '語彤朋友')
                    if not await enter_shop(pg, cdp, tag): R.check('%s 進了一盞' % tag, False, ''); continue
                    r = await act(('點', '喝茶', '飲料', '菜單'), tag); said = await P.said(pg, n0); R.note('%s 結果 %s；GAME.say %s' % (tag, J(r), J(said)))
                    i1 = next((i for i, x in enumerate(said) if '端了一壺' in x[1] or '算我的' in x[1]), None)
                    R.check('%s 馬上點單：先演「今天這壺，算我的」（台詞在點單之前出現）' % tag, i1 is not None, J(said))
                    R.check('%s 馬上點單：這一樣不扣錢' % tag, r is not None and r['delta'] == 0 and bool(r['picked']), J(r))
                    r2 = await act(('點', '喝茶', '飲料', '菜單'), tag + ' 第二樣'); R.check('%s 第二樣照扣' % tag, r2 is not None and r2['delta'] < 0, J(r2))
                if case == 'F':   # 芷若：進 Café 馬上坐下
                    n0 = await imm_load('heroine_02', fz, 20.0, '芷若朋友')
                    if not await enter_shop(pg, cdp, tag, 'cafe'): R.check('%s 進了 Café' % tag, False, ''); continue
                    r = await act(('坐',), tag); said = await P.said(pg, n0); R.note('%s 結果 %s；GAME.say %s' % (tag, J(r), J(said)))
                    R.check('%s 馬上坐下：先演芷若那一場（有「熱可可」）' % tag, any('熱可可' in x[1] for x in said), J(said))
                    st_ = await pg.evaluate(ST); R.check('%s 記下今天在 Café 點的下一樣免費' % tag, ((st_['sh'] or {}).get('free') or {}).get('zone') == 'cafe', J(st_['sh']))
                if case == 'X':   # 出口不算：進一盞馬上走出口
                    n0 = await imm_load(YT, f, 14.0, '語彤朋友')
                    if not await enter_shop(pg, cdp, tag): R.check('%s 進了一盞' % tag, False, ''); continue
                    ex = [e for e in await pg.evaluate(ITS) if e['to'] == 'wenzhou']
                    if ex:
                        await L.go_to(pg, cdp, R, ex[0]['x'], ex[0]['z'], 0.8, '%s 馬上走到出口' % tag, max_s=120, lv=ex[0]['lv']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(8000)
                    said = await P.said(pg, n0); st_ = await pg.evaluate(ST); rec = ((st_['sh'] or {}).get('p') or {}).get(YT) or {}
                    R.check('%s 走出口：不演（沒有她的台詞、SHIFTT 沒記今天）、回到溫州街' % tag, st_['zone'] == 'wenzhou' and rec.get('day') != st_['day'] and not [x for x in said if '語彤' in x[0]], J({'said': said, 'rec': rec, 'zone': st_['zone']}))
            R.check('沒有 JS 例外', not errs, J(errs[:3])); await b.close()
            print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True); return
        for case in CASES:
            tag = '[%s]' % case
            if case == 'F':
                if not R.check('找得到芷若在 Café 吧檯上班的日子（20:00）', bool(fz), ''): continue
                s = mk(S, fz, 20.0, 'B', pid='heroine_02')
                await L.load_state(pg, s, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp); await drain(pg, cdp, 4)
                R.setup('【前置／捷徑】day54 存檔 → %s 20:00 溫州街；芷若熟悉 45 信任 30（朋友）＋SHIFTT nf 2、friend.treat idx 2（T3 輪到）' % fz['key'])
                await P.say_hook(pg); n0 = await pg.evaluate("window.__SAY.length")
                if not await enter_shop(pg, cdp, tag, 'cafe'): R.check('F 進了 Café', False, J(await pg.evaluate(ST))); continue
                t0w = time.time()   # r3：STORY.tick 每 30 格才跑一次（game3d.js 600 行），「等兩秒」＝4 次 STORY.tick；雲端 SwiftShader 約 2 fps＝一次 15 秒——等到 SHIFTT.pending() 清掉（最多 150 秒），舊版沒有 SHIFTT 就等 10 秒
                while time.time() - t0w < 150:
                    pend = await pg.evaluate("(()=>typeof SHIFTT==='undefined'?'none':(SHIFTT.pending()?'pending':'clear'))()")
                    if pend == 'none' and time.time() - t0w > 10: break
                    if pend == 'clear': break
                    s_ = await L.state(pg)
                    if s_['dlg']: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(1000)
                await pg.wait_for_timeout(3000); await drain(pg, cdp, 5)
                said = await P.said(pg, n0); st1 = await pg.evaluate(ST); R.note('[F] SHIFTT 條件：%s' % J(await pg.evaluate(DIAG, 'heroine_02')))
                await pg.screenshot(path=os.path.join(OUT, 'shift_%s_F.png' % TAG))
                rec = ((st1['sh'] or {}).get('p') or {}).get('heroine_02') or {}
                R.note('[F] 進店以後 GAME.say：%s；狀態 %s' % (J(said), J(st1)))
                R.check('F 芷若朋友：進店兩秒後演 2～4 句、有「熱可可」', rec.get('day') == st1['day'] and 2 <= len(said) <= 4 and any('熱可可' in x[1] for x in said), J({'said': said, 'rec': rec}))
                R.check('F T3：記下今天在 Café 點的下一樣免費', ((st1['sh'] or {}).get('free') or {}).get('zone') == 'cafe', J(st1['sh']))
                d1, p1 = await buy_one(pg, cdp, '[F 第一樣]'); R.note('[F 第一樣] 錢 %s、選了 %s' % (d1, J(p1)))
                R.check('F T3：在 Café 點第一樣不扣錢', d1 == 0 and bool(p1), J({'delta': d1, 'picked': p1}))
                R.check('[F] walkFallbacks 0', st1['fb'] == 0, J(st1))
                continue
            if case == 'C':   # 接著 B：同一天出店再進來（不重讀）
                ex = [e for e in await pg.evaluate(ITS) if e['to'] == 'wenzhou']
                if ex:
                    await L.go_to(pg, cdp, R, ex[0]['x'], ex[0]['z'], 0.8, '[C] 走到一盞的出口', max_s=120, lv=ex[0]['lv']); await pg.wait_for_timeout(700)
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(6000); await drain(pg, cdp, 4)
                R.setup('【前置】C 接著 B 那一份（同一天、沒有重讀）：出店到溫州街再走進一盞')
            else:
                hh = 14.0 if case != 'D' else 14.5
                s = mk(S, f, hh, case)
                await L.load_state(pg, s, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp); await drain(pg, cdp, 4)
                R.setup('【前置／捷徑】day54 存檔 → %s %.1f 溫州街；%s' % (f['key'], hh, {'A': '拿掉語彤 FIRST_MET、熟悉 0（陌生人）', 'B': '語彤熟悉 45 信任 30（朋友）＋SHIFTT nf 2、friend.treat idx 2（T3 輪到）；玩家週六沒班',
                    'D': '同 B，但保留玩家 jobs.tea 的週六班（現在 14:30＝班上）', 'E': '語彤熟悉 10（點頭之交）；玩家週六沒班'}[case]))
            await P.say_hook(pg); n0 = await pg.evaluate("window.__SAY.length")
            st0 = await pg.evaluate(ST); R.note('%s 進店前：%s' % (tag, J(st0)))
            if not await enter_shop(pg, cdp, tag): R.check('%s 進了一盞' % tag, False, J(await pg.evaluate(ST))); continue
            t0w = time.time()   # r3：STORY.tick 每 30 格才跑一次（game3d.js 600 行），「等兩秒」＝4 次 STORY.tick；雲端 SwiftShader 約 2 fps＝一次 15 秒——等到 SHIFTT.pending() 清掉（最多 150 秒），舊版沒有 SHIFTT 就等 10 秒
            while time.time() - t0w < 150:
                pend = await pg.evaluate("(()=>typeof SHIFTT==='undefined'?'none':(SHIFTT.pending()?'pending':'clear'))()")
                if pend == 'none' and time.time() - t0w > 10: break
                if pend == 'clear': break
                s_ = await L.state(pg)
                if s_['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(1000)
            await pg.wait_for_timeout(3000); await drain(pg, cdp, 5)
            said = await P.said(pg, n0); st1 = await pg.evaluate(ST); R.note('%s SHIFTT 條件：%s' % (tag, J(await pg.evaluate(DIAG, YT))))
            await pg.screenshot(path=os.path.join(OUT, 'shift_%s_%s.png' % (TAG, case)))
            yt = [x for x in said if '語彤' in x[0] or x[0] == '' and x[1].startswith('（')]
            R.note('%s 進店以後 GAME.say：%s；狀態 %s' % (tag, J(said), J(st1)))
            rec = ((st1['sh'] or {}).get('p') or {}).get(YT) or {}
            played = rec.get('day') == st1['day'] and rec.get('n', 0) > (5 if case in ('B', 'C', 'D') else 0) if case != 'C' else rec.get('n') == res.get('B_n', -1) + 1
            if case == 'A': R.check('A 陌生人：不演（SHIFTT 沒有記這一次、沒有她的台詞）', not rec.get('day') and not [x for x in said if '語彤' in x[0]], J({'said': said, 'rec': rec}))
            if case == 'B':
                res['B_n'] = rec.get('n')
                R.check('B 朋友：進店兩秒後演 2～3 句（她說的＋旁白）', played and 2 <= len(said) <= 4, J(said))
                R.check('B T3：其中有「端了一壺」', any('端了一壺' in x[1] for x in said), J(said))
                R.check('B T3：記下今天在一盞點的下一樣免費（SHIFTT.free）', ((st1['sh'] or {}).get('free') or {}).get('zone') == ZONE, J(st1['sh']))
                d1, p1 = await buy_one(pg, cdp, '[B 第一樣]'); R.note('[B 第一樣] 錢 %s、選了 %s' % (d1, J(p1)))
                R.check('B T3：點第一樣不扣錢（錢前後一樣）', d1 == 0 and bool(p1), J({'delta': d1, 'picked': p1}))
                d2, p2 = await buy_one(pg, cdp, '[B 第二樣]'); R.note('[B 第二樣] 錢 %s、選了 %s' % (d2, J(p2)))
                R.check('B T3：點第二樣照常扣錢', d2 is not None and d2 < 0, J({'delta': d2, 'picked': p2}))
            if case == 'C': R.check('C 同一天第二次進店：不演（沒有新的台詞、n 沒有加）', not [x for x in said if '語彤' in x[0]] and rec.get('n') == res.get('B_n'), J({'said': said, 'rec': rec}))
            if case == 'D': R.check('D 玩家自己在一盞上班：不演', not rec.get('day') or rec.get('day') != st1['day'], J({'said': said, 'rec': rec}))
            if case == 'E':
                R.note('E 點頭之交：演了 %s（acq 一組，不招待）' % bool(rec.get('day') == st1['day']))
                R.check('E 點頭之交：沒有招待（tn／tday 沒記、沒有 free）', not rec.get('tday') and not (st1['sh'] or {}).get('free'), J(st1['sh']))
                d1, p1 = await buy_one(pg, cdp, '[E 第一樣]')
                R.check('E 點頭之交：點第一樣照常扣錢', d1 is not None and d1 < 0, J({'delta': d1, 'picked': p1}))
            R.check('%s walkFallbacks 0' % tag, st1['fb'] == 0, J(st1))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
