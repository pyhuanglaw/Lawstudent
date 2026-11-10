"""CC（帳號 A）11-10：v9.10.24 新功能各玩一次（BB 17:18 P0 第 3 項；候選 ecc3e12a7）。看有沒有卡住、例外、黑畫面；每項截 2～3 張；全部觸控、點地面走路。
CASES：
  YEJIAN  X269 頁間書屋（公館）：【前置／捷徑】讀檔到 bookstore 出生點 14:00 → 列互動點 → 依序按「書牆／新書／咖啡」那幾個（標籤照遊戲）：記 player 走到哪、面向、坐下沒（E.player.seat、pose）、對話原文；
          每個做完起身（座位選單選「起身」或最後一個）→ 最後走到出口出去、回到公館。
  MOKU    X270 木曜日考試週：【前置／捷徑】day46 存檔（fixtures/user_saves_1107）改 day 47 13:40（使用者回報那一天）在溫州街 → 走到「上二樓（木曜日）」按 → 進門那一句、
          數桌子有人的（NPC 坐著）、按鈕是「有人了」的座位數、「坐吧檯旁邊」坐得下（E.player.seat）→ 起身 → 走出口。
  CLUB    美國會所 3D：【前置／捷徑】讀檔到 us_outside 2028-10-03（週二）19:30＋交換旗標（同 US()）→ 走到會所門口（標籤有「會所」的互動）按 → 進 3D（區域換了、不是 2D 選單）
          → 列互動點、走到自習室一個座位坐下（選單選讀書那一個）→ 起身 → 出去。
每項：walkFallbacks、JS 例外、黑畫面（截圖平均亮度 < 12 就算黑）。Playwright（PC GPU）≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=YEJIAN,MOKU,CLUB] python3 cc_newfeat_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CASES = (os.environ.get('CASES') or 'YEJIAN,MOKU,CLUB').split(',')
R = L.Run('newfeat', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,lv:i.lv|0,to:i.exit?i.exit.to:null,seat:!!i.seat,ggs:i.ggs||null,study:!!(i.study||(i.seat&&i.seat.study))})))()"   # r2：頁間書屋的互動點用 ggs 認（標籤不一定有「書」字）、會所自習室座位用 study 認
ME = "(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), ry:+P.obj.rotation.y.toFixed(2), seat:!!P.seat, pose:P.pose, busy:!!P.busy, fb:GAME.walkFallbacks|0}; })()"
SAYH = "(()=>{ if(window.__NF) return window.__NF.length; window.__NF=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ window.__NF.push(((w&&w.name)||'')+'｜'+String(t||'')); }catch(e){} return s0.apply(this,arguments); }; return 0; })()"
LUM = "(()=>{ const c=GAME.E.renderer.domElement, k=document.createElement('canvas'); k.width=64; k.height=36; const g=k.getContext('2d'); g.drawImage(c,0,0,64,36); const d=g.getImageData(0,0,64,36).data; let s=0; for(let i=0;i<d.length;i+=4) s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]; return +(s/(d.length/4)).toFixed(1); })()"
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
USF = "({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:STORY.dayOfKey('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:STORY.dayOfKey('2028-06-08')})"


async def shot(pg, name):
    await pg.screenshot(path=os.path.join(OUT, 'nf_%s.png' % name)); lum = await pg.evaluate(LUM)
    R.check('[黑畫面] %s 不是黑畫面（平均亮度 %.1f）' % (name, lum), lum >= 12, str(lum))


async def play(pg, cdp, tag, pick=None, max_s=60):
    """點對話；選單照 pick(opts)→index（預設第一個）；回傳選過的"""
    t0 = time.time(); picked = []
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            o = await pe.opts(pg); k = pick(o) if pick else 0; picked.append(o[k]['t'] if k < len(o) else None)
            await pe.choose(pg, cdp, o[k]['t'], True); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if not s['busy'] and time.time() - t0 > 3: break
        await pg.wait_for_timeout(500)
    return picked


async def use(pg, cdp, it, tag, pick=None):
    await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.8), '%s 走到「%s」' % (tag, it['label']), max_s=120, lv=it['lv'])
    await pg.wait_for_timeout(600); s = await L.state(pg)
    if not s['interact']: R.note('%s「%s」旁邊沒有按鈕：%s' % (tag, it['label'], J(s))); return None
    n0 = await pg.evaluate(SAYH); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
    picked = await play(pg, cdp, tag, pick); me = await pg.evaluate(ME); said = (await pg.evaluate("window.__NF||[]"))[n0:]
    R.note('%s「%s」：選了 %s；之後 %s；說了 %s' % (tag, it['label'], J(picked), J(me), J(said[:6])))
    return {'picked': picked, 'me': me, 'said': said}


async def stand(pg, cdp, tag):
    if not await pg.evaluate("!!GAME.E.player.seat"): return
    s = await L.state(pg)
    if s['interact']: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
    await play(pg, cdp, tag, pick=lambda o: next((i for i, x in enumerate(o) if '起身' in x['t']), len(o) - 1))
    if await pg.evaluate("!!GAME.E.player.seat"): await L.push_until(pg, cdp, 0, -40, 0.5)


async def leave(pg, cdp, tag, to=None):
    ex = [i for i in await pg.evaluate(ITS) if i['to'] and (to is None or i['to'] == to)]
    if not R.check('%s 有出口' % tag, bool(ex), ''): return
    z0 = (await pg.evaluate(ME))['zone']; await use(pg, cdp, ex[0], tag)
    for _ in range(30):
        if (await pg.evaluate(ME))['zone'] != z0: break
        await pg.wait_for_timeout(500)
    me = await pg.evaluate(ME); R.check('%s 走出口出得去（%s → %s）、walkFallbacks 0' % (tag, z0, me['zone']), me['zone'] != z0 and me['fb'] == 0, J(me))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 新功能各玩一次：worktree %s；CASES %s；Playwright ≠ iPhone' % (real or '?', CASES), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for case in CASES:
            tag = '[%s]' % case
            try:
                if case == 'YEJIAN':
                    R.setup('【前置／捷徑】讀檔到 bookstore（頁間書屋）出生點 2025-10-18 14:00')
                    await D.load_zone(pg, cdp, 'bookstore', '2025-10-18', 14.0, wait=8000)
                    its = await pg.evaluate(ITS); R.note('%s 互動點：%s' % (tag, J(its))); await shot(pg, 'yejian_1_enter')
                    acts = [i for i in its if i['ggs']]
                    R.check('%s 有書牆／新書／咖啡的互動' % tag, bool(acts), J(its))
                    for k, it in enumerate(acts[:3]):
                        r = await use(pg, cdp, it, tag, pick=lambda o: next((i for i, x in enumerate(o) if '拿鐵' in x['t']), 0))
                        R.note('%s ggs=%s 做完：%s' % (tag, it['ggs'], J(r and r['me'])))
                        if r and r['me']['seat']: await shot(pg, 'yejian_%d_sit_%s' % (k + 2, it['label'][:4]))
                        await stand(pg, cdp, tag)
                    await leave(pg, cdp, tag)
                if case == 'MOKU':
                    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s)); s['day'] = s['day'] + 1; s['weekday'] = ((s.get('weekday') or 0) + 1) % 7; s['hour'] = 13.67; s['zone'] = 'wenzhou'; s['pos'] = None; s['invites'] = []
                    await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(6000); await pe.settle(pg, cdp, [], 20)
                    R.setup('【前置／捷徑】day46 存檔改 day 47 13:40、溫州街出生點（使用者回報那一天）')
                    it = next((i for i in await pg.evaluate(ITS) if i['to'] == 'wz_mokuyobi' or '木曜日' in (i['label'] or '')), None)
                    if not R.check('%s 溫州街有「上二樓（木曜日）」' % tag, bool(it), ''): continue
                    n0 = await pg.evaluate(SAYH); await use(pg, cdp, it, tag)
                    for _ in range(30):
                        if (await pg.evaluate(ME))['zone'] == 'wz_mokuyobi': break
                        await pg.wait_for_timeout(500)
                    await pg.wait_for_timeout(4000); await play(pg, cdp, tag)
                    said = (await pg.evaluate("window.__NF||[]"))[n0:]
                    cnt = await pg.evaluate("(()=>{ const E=GAME.E; const seats=(E.interactables||[]).filter(i=>i.seat); const occ=n=>(E.npcs||[]).some(q=>q.seat&&Math.hypot(q.seat.x-n.seat.x,q.seat.z-n.seat.z)<0.35); return {seats:seats.length, taken:seats.filter(i=>/有人了/.test(i.label)).length, occupied:seats.filter(occ).length, labels:[...new Set(seats.map(i=>i.label))], npcSeated:(E.npcs||[]).filter(q=>q.seat).length}; })()")
                    R.note('%s 進門那一句 %s；座位 %s' % (tag, J(said[:3]), J(cnt))); await shot(pg, 'moku_1_enter')
                    R.check('%s 考試週：每一桌都有人（座位有人坐或「有人了」）、只剩吧檯旁邊' % tag, cnt['seats'] > 0 and cnt['seats'] - cnt['occupied'] - cnt['taken'] <= 1, J(cnt))
                    bar = next((i for i in await pg.evaluate(ITS) if i['seat'] and '吧檯旁邊' in (i['label'] or '')), None)
                    if R.check('%s 有「坐吧檯旁邊」' % tag, bool(bar), J(cnt['labels'])):
                        await use(pg, cdp, bar, tag, pick=lambda o: next((i for i, x in enumerate(o) if '起身' not in x['t']), 0))
                        me = await pg.evaluate(ME); await shot(pg, 'moku_2_bar')
                        R.check('%s 坐得下吧檯旁邊' % tag, me['seat'], J(me))
                        await stand(pg, cdp, tag)
                    await leave(pg, cdp, tag)
                if case == 'CLUB':
                    await D.load_zone(pg, cdp, 'us_outside', '2028-10-03', 19.5, wait=6000)
                    await pg.evaluate("(f=>{ Object.assign(GAME.G.flags, f); })(%s)" % USF)
                    snap = await pg.evaluate("()=>GAME.snapshot()"); await L.load_state(pg, snap, quiet_phone=True); await pg.wait_for_timeout(9000); await pe.settle(pg, cdp, [], 20)
                    R.setup('【前置／捷徑】讀檔到 us_outside 2028-10-03（週二）19:30＋交換旗標')
                    it = next((i for i in await pg.evaluate(ITS) if '會所' in (i['label'] or '')), None)
                    if not R.check('%s 社區有會所的門' % tag, bool(it), J(await pg.evaluate(ITS))[:500]): continue
                    z0 = (await pg.evaluate(ME))['zone']; r = await use(pg, cdp, it, tag)
                    for _ in range(30):
                        if (await pg.evaluate(ME))['zone'] != z0: break
                        await pg.wait_for_timeout(500)
                    me = await pg.evaluate(ME); await shot(pg, 'club_1_enter')
                    R.check('%s 按門走進 3D 會所（區域換了）' % tag, me['zone'] != z0, J({'me': me, 'r': r}))
                    its = await pg.evaluate(ITS); R.note('%s 會所互動點：%s' % (tag, J(its)))
                    st = next((i for i in its if i['study']), None) or next((i for i in its if i['seat']), None)
                    R.note('%s 坐哪一個：%s（study＝自習室）' % (tag, J(st)))
                    if st:
                        await use(pg, cdp, st, tag, pick=lambda o: next((i for i, x in enumerate(o) if '讀書' in x['t']), 0))
                        await shot(pg, 'club_2_sit'); await stand(pg, cdp, tag)
                    await leave(pg, cdp, tag)
            except Exception as e:
                R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
