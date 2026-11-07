"""CC-B（帳號 B）11-07：CORNER-IN-1107 轉角唱片功能流程（BB-B 16:38；f186ad035；台詞 AA_725＝src/gg2shops3d.js 的 S.L.corner_records，一字對照）。
照玩家：點地面走過去（L.go_to）→ 互動按鈕要剛好是那一個（洋洋那邊 0.8 m 會按到旁邊座位）→ 點互動 → 點對話、照順序點選項。每一句對話都記下來。
【前置／捷徑】：讀檔進公館 G12 店門口外（2025-10-18 週六 12:30，條件事件關閉，錢設 600）；打烊那幾段把時間撥到 20:58／20:50（GAME.G.hour），21:30 門口也是撥時間。
STEPS（逗號分隔，預設全部）：
  enter   ① 進門：門口按「轉角唱片」→ 進店 → 一句進門句（S.L.door 三句之一）；出去再進來＝同一天不說
  browse  ② 七類（indie folk electronic jazz citypop ost wall）各翻一次：句子在 browse[那一類]、選項三個（拿去試聽／買這張／放回去）→ 放回去
  listen  ③ 站著按「拿去試聽」＝坐上空的高腳椅、開始句＝listen.start、那一類那一句、時間 +15 分、結束句、聽完站起來；同一天第二次＝listen.again
  buy     ④ 爵士（250）、搖滾（150）各買一張：ask250／ask150、扣錢、G.records 多一筆、買完一句；錢設 100 再買＝short、不扣錢
  misc    ⑤ 櫃台（第一次 asking → 先不用）、看音響（look.corner_view 之一）、坐高腳椅（seat.stool）、坐沙發（seat.sofa）
  close   ⑥ 20:58 在店裡＝21:00 店員「我們今天要打烊了。」、人到公館；20:50 開始試聽＝聽完（結束句）才說那一句；21:30 按門＝sign 那一句、進不去
⑦ 約去另外一支（邀約系統）。判定＝BB。用法：LW_TESTS=<wt>/tests [STEPS=...] python3 cc_corner_flow_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
STEPS = [s_ for s_ in (os.environ.get('STEPS') or 'enter,browse,listen,buy,misc,close').split(',') if s_]
R = L.Run('corner_flow', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
GENRES = ['indie', 'folk', 'electronic', 'jazz', 'citypop', 'ost', 'wall']

ITS = r"""(()=>GAME.E.interactables.filter(i=>!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||null, kind:i.kind||null, genre:i.genre||null, gg2:i.gg2||null, seat:!!i.seat, sx:i.seat?+i.seat.x.toFixed(2):null, sz:i.seat?+i.seat.z.toFixed(2):null, exit:!!i.exit, shopIn:i.shopIn||i.shop||i.to||null})))()"""
ST = r"""(()=>{ const G=GAME.G, P=GAME.E.player; return {zone:G.zone, h:+(+G.hour).toFixed(3), day:G.day, money:G.money, records:(G.records||[]).length, seat:P.seat?{x:+P.seat.x.toFixed(2),z:+P.seat.z.toFixed(2)}:null, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), crl:(G.flags||{}).CR_LISTEN||null, door:(G.flags||{}).GG2_DOOR||null}; })()"""
LINES = None


async def st(pg): return await pg.evaluate(ST)


async def interact_label(pg):
    return await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")


async def scene(pg, cdp, tag, prefs, max_s=150, idle_end=2.5):
    """點對話、照 prefs 的順序選選項（每遇到一次選項用掉一個；字串＝文字含有它的那一個）；回傳 {lines:[[說話的人,句子]], choices:[[選項…]], picked:[…]}"""
    out = {'lines': [], 'choices': [], 'picked': []}; t0 = time.time(); quiet = None; pi = 0
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            quiet = None
            want = prefs[pi] if pi < len(prefs) else None; pi += 1
            bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.innerText.trim())")
            out['choices'].append(bs)
            k = next((i for i, t in enumerate(bs) if want and want in t), len(bs) - 1)
            await pg.evaluate("(i=>{ document.querySelectorAll('#choices button')[i].scrollIntoView({block:'center'}); })(%d)" % k)
            c = await pg.evaluate("(i=>{ const r=document.querySelectorAll('#choices button')[i].getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1]); out['picked'].append(bs[k] if k < len(bs) else None); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            quiet = None
            for _w in range(20):   # 對話框打字效果：等這一句打完（0.35 秒內沒有變）才記、才點（不然記到半句，點一下又跳過）
                _a = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText'); return e?e.innerText.trim():''; })()")
                await pg.wait_for_timeout(350)
                _b = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText'); return e?e.innerText.trim():''; })()")
                if _a == _b: break
            who = await pg.evaluate("(()=>{ const e=document.getElementById('dlgName')||document.querySelector('#dlg .name'); return e?e.innerText.trim():''; })()")
            full = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText')||document.querySelector('#dlg .text'); return e?e.innerText.trim():''; })()")
            t = full or s['dtext']
            if t and (not out['lines'] or out['lines'][-1][1] != t): out['lines'].append([who, t])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(400)
    # 對話框打字效果：同一句會先記到一半；只留每一句最後完整的版本
    clean = []
    for w, t in out['lines']:
        if clean and t.startswith(clean[-1][1]) and w == clean[-1][0]: clean[-1] = [w, t]
        else: clean.append([w, t])
    out['lines'] = clean
    R.note('%s 對話 %d 句：%s；選項 %s → 點 %s' % (tag, len(clean), J(clean), J(out['choices']), J(out['picked'])))
    return out


async def use(pg, cdp, tag, pred, desc):
    """找第一個符合的互動點 → 走過去 → 互動按鈕要是它（不是就在旁邊 0.25 m 試）→ 點；回傳那個互動點（找不到／按鈕不對＝None）"""
    its = await pg.evaluate(ITS); it = next((i for i in its if pred(i)), None)
    if not R.check('%s 找得到「%s」' % (tag, desc), bool(it), J([[i['label'], i['kind'], i['genre']] for i in its])): return None
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, '%s 走到「%s」(%.2f,%.2f)' % (tag, it['label'], it['x'], it['z']), max_s=150)
    await pg.wait_for_timeout(900); lab = await interact_label(pg)
    for dx, dz in ((0, 0), (0.25, 0), (-0.25, 0), (0, 0.25), (0, -0.25)):
        if lab and it['label'] in lab: break
        await L.go_to(pg, cdp, R, it['x'] + dx, it['z'] + dz, 0.15, '%s 站到「%s」上' % (tag, it['label']), max_s=40)
        await pg.wait_for_timeout(900); lab = await interact_label(pg)
    if not R.check('%s 互動按鈕是「%s」' % (tag, it['label']), bool(lab and it['label'] in lab), str(lab)): return None
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    return it


def has(lines, cand):
    """lines（[[誰,句子]]）裡有沒有 cand（字串或字串清單）其中一句（一字照抄）"""
    cs = cand if isinstance(cand, list) else [cand]
    return any(t == c for _, t in lines for c in cs)


async def to_shop(pg, cdp, tag, h, money=600):
    R.setup('%s 【前置／捷徑】讀檔進公館 G12 轉角唱片門外 %s %.2f（條件事件關閉；錢 %d）' % (tag, DAY, h, money))
    out = await pg.evaluate("(()=>{ const s=Z3.SHOP_IN&&Z3.SHOP_IN.corner_records; return s&&s.out?s.out:null; })()")
    s = await D.load_zone(pg, cdp, 'gongguan', DAY, h, x=out['x'], z=out['z'] - 0.6 if out else None, yaw=math.pi if out else None, wait=5000)
    await pg.evaluate("(m=>{ GAME.G.money=m; })", money)
    return s


async def enter_shop(pg, cdp, tag):
    it = await use(pg, cdp, tag, lambda i: '轉角' in (i['label'] or '') and not i['seat'], '轉角唱片的店門')
    if not it: return None
    await D.wait_zone(pg, cdp, 'corner_records', max_s=40)
    t0 = time.time()   # 進門句等店的模型載好、場景空下來才出（雲端 SwiftShader 實測進店後 11～12 秒）：等 G.flags.GG2_DOOR 記下今天或對話出來，最多 25 秒
    while time.time() - t0 < 25:
        f = await pg.evaluate("(()=>{ const r=(GAME.G.flags||{}).GG2_DOOR; const d=document.getElementById('dlg'); return {door:r&&r.corner_records===GAME.G.day, dlg:!!d&&!d.classList.contains('hide')}; })()")
        if f['door'] or f['dlg']: break
        await pg.wait_for_timeout(500)
    R.note('%s 進店後 %.1f 秒：%s' % (tag, time.time() - t0, J(f)))
    return await scene(pg, cdp, tag + ' 進門', [], max_s=40, idle_end=4)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 轉角唱片功能流程：SHA=%s（worktree 實際 %s）；STEPS=%s；Playwright 手機模擬 ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', STEPS), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if not R.check('遊戲載入', ok, ''): await b.close(); return
        await pg.evaluate("localStorage.clear()")
        CR = await pg.evaluate("(()=>GG2&&GG2.L&&GG2.L.corner_records)()") if await pg.evaluate("typeof GG2!=='undefined'") else None
        if not CR: CR = await pg.evaluate("(()=>{ for(const k of Object.keys(window)){ try{ const v=window[k]; if(v&&v.L&&v.L.corner_records) return v.L.corner_records; }catch(e){} } return null; })()")
        R.check('拿得到 AA_725 的稿（S.L.corner_records）', bool(CR), '')
        if not CR: await b.close(); return
        try:
            # ① 進門
            await to_shop(pg, cdp, '[①]', 12.5)
            sc = await enter_shop(pg, cdp, '[①第一次]')
            s1 = await st(pg)
            R.check('[①] 進得了 corner_records', s1['zone'] == 'corner_records', J(s1))
            if sc is not None: R.check('[①] 第一次進門說一句進門句（door 三句之一，一字照抄）', has(sc['lines'], CR['door']), J(sc['lines']))
            await R.shot(pg, 'enter_first')
            rec['enter1'] = sc
            if 'enter' in STEPS and s1['zone'] == 'corner_records':
                it = await use(pg, cdp, '[①出去]', lambda i: i['exit'], '出口')
                if it:
                    await scene(pg, cdp, '[①出去]', [], max_s=20)
                    await D.wait_zone(pg, cdp, 'gongguan', max_s=30)
                sc2 = await enter_shop(pg, cdp, '[①同一天第二次]')
                R.check('[①] 同一天再進去不說進門句', sc2 is not None and not has(sc2['lines'], CR['door']), J(sc2 and sc2['lines']))
                rec['enter2'] = sc2
            # ② 翻唱片
            if 'browse' in STEPS:
                rec['browse'] = {}
                for g in GENRES:
                    tag = '[②%s]' % g
                    it = await use(pg, cdp, tag, (lambda gg: lambda i: i['kind'] == 'corner_browse' and (i['genre'] or 'wall') == gg)(g), '翻唱片：%s' % g)
                    if not it: continue
                    sc = await scene(pg, cdp, tag, ['放回去'])
                    R.check('%s 句子在 browse.%s（一字照抄）' % (tag, g), has(sc['lines'], CR['browse'][g]), J(sc['lines']))
                    R.check('%s 選項是「拿去試聽／買這張／放回去」' % tag, bool(sc['choices']) and [c.split('\n')[0] for c in sc['choices'][0]] == CR['browseOpts'], J(sc['choices'][:1]))
                    rec['browse'][g] = sc
                await R.shot(pg, 'browse_done')
            # ③ 試聽
            if 'listen' in STEPS:
                for n, g in enumerate(['indie', 'folk']):
                    tag = '[③第%d次 %s]' % (n + 1, g)
                    b4 = await st(pg)
                    it = await use(pg, cdp, tag, (lambda gg: lambda i: i['kind'] == 'corner_browse' and i['genre'] == gg)(g), '翻唱片：%s' % g)
                    if not it: continue
                    seats_seen = []
                    task = asyncio.ensure_future(scene(pg, cdp, tag, ['拿去試聽'], max_s=120, idle_end=3))
                    for _ in range(60):
                        if task.done(): break
                        s_ = await st(pg); seats_seen.append(s_['seat'])
                        await asyncio.sleep(1.0)
                    sc = await task; af = await st(pg)
                    dh = round((af['h'] - b4['h']) * 60)
                    on_stool = any(x for x in seats_seen)
                    if n == 0: R.check('%s 站著按「拿去試聽」＝坐上高腳椅（試聽中 player.seat）、開始句＝listen.start' % tag, on_stool and has(sc['lines'], CR['listen']['start']), J({'seats': [x for x in seats_seen if x][:2], 'lines': sc['lines']}))
                    else: R.check('%s 同一天第二次＝listen.again' % tag, has(sc['lines'], CR['listen']['again']), J(sc['lines']))
                    R.check('%s 那一類那一句（listen.g.%s）、結束句' % (tag, g), has(sc['lines'], CR['listen']['g'][g]) and has(sc['lines'], CR['listen']['end']), J(sc['lines']))
                    R.check('%s 時間 +15 分鐘（實際 %d 分；含翻唱片、走路）' % (tag, dh), 15 <= dh <= 25, J([b4['h'], af['h']]))
                    R.check('%s 聽完站起來' % tag, not af['seat'], J(af))
                    R.note('%s CR_LISTEN＝%s' % (tag, J(af['crl'])))
                    if n == 0: await R.shot(pg, 'listen_after')
                    rec.setdefault('listen', []).append({'g': g, 'scene': sc, 'dmin': dh, 'onStool': on_stool})
            # ④ 買唱片
            if 'buy' in STEPS:
                for g, price in (('jazz', 250), ('indie', 150)):
                    tag = '[④買 %s]' % g; b4 = await st(pg)
                    it = await use(pg, cdp, tag, (lambda gg: lambda i: i['kind'] == 'corner_browse' and i['genre'] == gg)(g), '翻唱片：%s' % g)
                    if not it: continue
                    sc = await scene(pg, cdp, tag, ['買這張']); af = await st(pg)
                    ask = CR['ask250'] if price == 250 else CR['ask150']
                    R.check('%s 店員：「%s」' % (tag, ask), has(sc['lines'], ask), J(sc['lines']))
                    R.check('%s 扣 %d 元（%s → %s）、G.records 多一筆（%s → %s）' % (tag, price, b4['money'], af['money'], b4['records'], af['records']), b4['money'] - af['money'] == price and af['records'] == b4['records'] + 1, '')
                    R.check('%s 買完一句（bought 之一）' % tag, has(sc['lines'], [x[1] for x in CR['bought']]), J(sc['lines']))
                    rec.setdefault('buy', []).append({'g': g, 'scene': sc, 'before': b4, 'after': af})
                tag = '[④錢不夠]'
                R.setup('%s 【捷徑】錢設 100 元' % tag); await pg.evaluate("GAME.G.money=100")
                b4 = await st(pg)
                it = await use(pg, cdp, tag, lambda i: i['kind'] == 'corner_browse' and i['genre'] == 'folk', '翻唱片：folk')
                if it:
                    sc = await scene(pg, cdp, tag, ['買這張']); af = await st(pg)
                    R.check('%s 店員 ask150＋short、不扣錢、不記唱片' % tag, has(sc['lines'], CR['ask150']) and has(sc['lines'], CR['short']) and af['money'] == b4['money'] and af['records'] == b4['records'], J({'lines': sc['lines'], 'money': [b4['money'], af['money']], 'rec': [b4['records'], af['records']]}))
                    await R.shot(pg, 'buy_short')
                    rec['buy_short'] = sc
                await pg.evaluate("GAME.G.money=600")
            # ⑤ 櫃台、音響、高腳椅、沙發
            if 'misc' in STEPS:
                it = await use(pg, cdp, '[⑤櫃台]', lambda i: i['kind'] == 'corner_shop', '櫃台')
                if it:
                    sc = await scene(pg, cdp, '[⑤櫃台]', ['先不用'])
                    R.check('[⑤櫃台] 那一天第一次：asking 那一句、選單最後是「先不用」', has(sc['lines'], CR['asking']) and bool(sc['choices']) and '先不用' in sc['choices'][0][-1], J(sc))
                it = await use(pg, cdp, '[⑤看音響]', lambda i: i['kind'] == 'corner_view', '看音響')
                if it:
                    sc = await scene(pg, cdp, '[⑤看音響]', [])
                    R.check('[⑤看音響] look.corner_view 之一', has(sc['lines'], CR['look']['corner_view']), J(sc['lines']))
                for nm, sx, sz, key in (('高腳椅', 2.95, 3.2, 'stool'), ('沙發', -2.9, 3.05, 'sofa')):
                    tag = '[⑤坐%s]' % nm
                    it = await use(pg, cdp, tag, (lambda a, b_: lambda i: i['seat'] and abs((i['sx'] or 0) - a) < 0.1 and abs((i['sz'] or 0) - b_) < 0.1)(sx, sz), nm)
                    if not it: continue
                    sc = await scene(pg, cdp, tag, ['坐'])
                    R.check('%s seat.%s 那一句' % (tag, key), has(sc['lines'], CR['seat'][key]), J(sc['lines']))
                    await R.shot(pg, 'sit_' + key)
                    s_ = await st(pg)
                    if s_['seat']:
                        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
                        await scene(pg, cdp, tag + ' 起身', ['起身'], max_s=15)
            # ⑥ 打烊
            if 'close' in STEPS:
                tag = '[⑥20:58 在店裡]'
                R.setup('%s 【捷徑】時間撥到 20:58（GAME.G.hour）' % tag)
                await pg.evaluate("GAME.G.hour=20+58/60")
                t0 = time.time(); lines = []
                while time.time() - t0 < 120:
                    s_ = await st(pg)
                    if s_['zone'] != 'corner_records' and s_['zone']: break
                    sc = await scene(pg, cdp, tag, [], max_s=20, idle_end=1.5); lines += sc['lines']
                af = await st(pg)
                R.check('%s 21:00 店員「我們今天要打烊了。」' % tag, any(t == '我們今天要打烊了。' and w == '店員' for w, t in lines), J(lines))
                R.check('%s 人到公館' % tag, af['zone'] == 'gongguan', J(af))
                await R.shot(pg, 'close_out')
                # 正在試聽的時候到 21:00
                tag = '[⑥20:50 開始試聽]'
                await to_shop(pg, cdp, tag, 20.0)
                await enter_shop(pg, cdp, tag)
                it = await use(pg, cdp, tag, lambda i: i['kind'] == 'corner_browse' and i['genre'] == 'jazz', '翻唱片：jazz')
                if it:
                    R.setup('%s 【捷徑】翻開唱片那一刻把時間撥到 20:50（聽 15 分鐘會過 21:00）' % tag)
                    await pg.evaluate("GAME.G.hour=20+50/60")
                    lines = []; t0 = time.time()
                    while time.time() - t0 < 150:
                        sc = await scene(pg, cdp, tag, ['拿去試聽'] if not lines else [], max_s=30, idle_end=2); lines += sc['lines']
                        s_ = await st(pg)
                        if s_['zone'] == 'gongguan': break
                    ie = next((i for i, (w, t) in enumerate(lines) if t == CR['listen']['end']), None)
                    ic = next((i for i, (w, t) in enumerate(lines) if t == '我們今天要打烊了。'), None)
                    R.check('%s 等聽完（結束句）才說打烊那一句' % tag, ie is not None and ic is not None and ie < ic, J(lines))
                # 21:30 按門
                tag = '[⑥21:30 按門]'
                await to_shop(pg, cdp, tag, 21.5)
                it = await use(pg, cdp, tag, lambda i: '轉角' in (i['label'] or '') and not i['seat'], '轉角唱片的店門')
                if it:
                    sc = await scene(pg, cdp, tag, [], max_s=20)
                    s_ = await st(pg)
                    R.check('%s sign 那一句、進不去' % tag, has(sc['lines'], CR['sign']) and s_['zone'] == 'gongguan', J({'lines': sc['lines'], 'zone': s_['zone']}))
                    await R.shot(pg, 'door_2130')
        except Exception as ex: R.check('探針沒有例外', False, repr(ex)[:400])
        R.check('⑧ 沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'corner_flow.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
