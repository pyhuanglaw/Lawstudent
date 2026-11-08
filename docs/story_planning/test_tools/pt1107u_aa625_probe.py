"""BB-B 2026-11-07：AA624-YT-BACKGROUND-1103（LAWWW-B 444e0f333，測 27768c5c5）＝AA_625 語彤約一起念書＋木曜日修正 瀏覽器抽查。
  MODE=first：大一下第 3 週週二（2026-03-10）21:40 語彤私訊三則＋「好。」／「這週不行。」→ 回「好。」＝週三 14:00 木曜日；
              到木曜日見面坐下 → 她多一句「我只是週末打工。平常其實很閒。」；坐下讀書以後四句輪流的其中一句；讀書時數有加（G.stats.study）
  MODE=moku：一般的「念書」約（以安，木曜日）——修正後先演木曜日那一段、再演一起念書第 N 場、讀書照算：整段演完、沒卡、時數有加
[前置／捷徑] 讀使用者存檔 day46（YT_MET_JOB＝在茶屋碰過語彤），同一份進度跳日期（大一上 → 大一下）記【前置】；回覆、約、坐下照玩家點。
用法：LW_TESTS=<測試樹>/tests MODE=first|moku python3 pt1107u_aa625_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'first')
PLACE = os.environ.get('PLACE', '木曜日')   # MODE=moku 的地點：木曜日（預設）或 總圖（4a17516d6：「（小聲）…」拿掉「」以後還是她說的話）
PZONE = {'木曜日': 'wz_mokuyobi', '總圖': 'library_hall'}.get(PLACE, 'wz_mokuyobi')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
YT, AN = 'heroine_03', 'heroine_01'
DECLINE = ('不去', '不了', '改天', '算了', '下次', '這週不行', '晚一點')


async def choose(pg, cdp, word):
    c = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(%s)" % json.dumps(word))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c[2]


async def wait_opts(pg, s=20):
    for _ in range(int(s / 0.5)):
        o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
        if o: return o
        await pg.wait_for_timeout(500)
    return []


async def play_until(pg, cdp, until_h, max_s=600, prefer=()):
    """照玩家：點對話、選項挑 prefer 開頭的、不然挑第一個不是婉拒的；直到 busy 結束而且時間過了 until_h"""
    opts_seen = []
    for _ in range(max_s):
        q = await P.ts(pg)
        if q['ch']:
            o = [x['t'] for x in q['ch']]; opts_seen.append(o)
            k = next((i for i, t in enumerate(o) for p in prefer if t.startswith(p)), None)
            if k is None: k = next((i for i, t in enumerate(o) if not any(w in t for w in DECLINE)), 0)
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if q['phone']: await L.close_panels(pg, cdp)
        if not q['busy'] and q['h'] >= until_h: break
        await pg.wait_for_timeout(1000)
    return opts_seen


async def main():
    run = L.Run('pt1107u_aa625_' + MODE, OUT)
    base = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        Lx = None
        if MODE == 'first':
            s, d = await P.base(pg, base, '2026-03-10', 21.2, 'dorm')
            s.setdefault('flags', {}).pop('YTSTUDY', None)
            await P.load(pg, cdp, s); await P.init(pg)
            run.setup('[前置] day46 存檔（YT_MET_JOB）改到 2026-03-10（二，大一下第 3 週）21:12 宿舍')
            Lx = await pg.evaluate("({first:AA625.L.first, extra:AA625.L.firstExtra, during:AA625.L.during})")
            await P.wait_hour(pg, cdp, 21.75, max_s=600)
            th = await P.phone_thread(pg, cdp, 'p:' + YT); asks = [a['t'] for a in th.get('asks', [])]
            print('[YT]', J(th.get('text', '')[-500:]), J(asks))
            run.check('① 3/10 21:40 語彤三則＋「好。」／「這週不行。」', th['ok'] and all(t in th.get('text', '') for t in Lx['first']) and '好。' in asks and '這週不行。' in asks, J([th.get('text', '')[-400:], asks]))
            # 21:30 以安（HASK）約 3/11 15:30 總圖、還沒回：照舊會讓「好。」排不進去（BUG-YTS-FIRST-CLASH-1107）。CLASH=keep＝留著重現；預設＝玩家先回以安「不了」
            off = await pg.evaluate("(()=>(GAME.G.invites||[]).filter(v=>v.state==='offered').map(v=>({id:v.id,who:v.who,day:v.day,h:v.h,place:v.place})))()")
            print('[OFFERED]', J(off))
            if os.environ.get('CLASH') != 'keep':
                for v in off:
                    await P.phone_thread(pg, cdp, 'p:' + v['who'], open_folds=False)
                    btn = await pg.evaluate("(id=>[...document.querySelectorAll('#phoneBody [data-ans]')].filter(b=>b.dataset.ans.startsWith(id+'|')).map(b=>[b.dataset.ans,b.textContent.trim()]))(%s)" % json.dumps(v['id']))
                    if os.environ.get('CLASH') == 'accept': pick = next((x for x in btn if x[0].endswith('|yes')), None)   # 真的撞到：先答應以安 15:30（1b54728e6：first＝busy、她回「嗯。下次。」）
                    else: pick = next((x for x in btn if x[0].endswith('|no')), None) or next((x for x in btn if '不' in x[1]), None)
                    print('[DECLINE]', J([v, btn, pick]))
                    if pick:
                        await L.tap(pg, cdp, '#phoneBody [data-ans="%s"]' % pick[0]); await pg.wait_for_timeout(1500)
                    st = await pg.evaluate("(id=>{ const v=INV.byId(GAME.G,id); return v?v.state:null; })(%s)" % json.dumps(v['id']))
                    run.check('玩家先回 %s 的邀約（%s，%s）→ 不是 offered 了' % (v['who'], pick and pick[1], v['place']), bool(pick) and st != 'offered', J([pick, st]))
            ra = await P.phone_answer(pg, cdp, 'p:' + YT, '好。'); await L.close_panels(pg, cdp); await pg.wait_for_timeout(3000)
            dg = await pg.evaluate("""(()=>{ const G=GAME.G, R=G.flags.YTSTUDY||{}, m=PHONE.byAsk?PHONE.byAsk(G,AA625.FIRST_TAG):null; const P=INV.place?INV.place('mokuyobi'):null;
              return {R, ans:m?m.ans:'nomsg', day:G.day, mine:(INV.mineAt&&P&&R.fday!=null)?!!INV.mineAt(G,R.fday,14,P.stay):null, free:(INV.freeAt&&P&&R.fday!=null)?INV.freeAt(G,'heroine_03',P,R.fday,14):null, place:!!P}; })()""")
            print('[ANS]', J((ra or '')[-200:]), J(dg, 1500))
            ivs = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({day:v.day,h:v.h,state:v.state,place:v.place,cat:v.cat,yts:v.yts})))(%s)" % json.dumps(YT))
            print('[IVS]', J(ivs))
            if os.environ.get('CLASH') == 'accept':
                th2 = await P.phone_thread(pg, cdp, 'p:' + YT); sysm = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>!m.who&&!m.th).slice(-3).map(m=>m.text)")
                tail = th2.get('text', '')[-200:]
                print('[BUSY]', J([dg, tail, sysm]))
                run.check('真的撞到（已答應以安 15:30）：first＝busy、語彤串「那天你有約了？」「……嗯。下次。」、系統字「那個時間你已經約了別人。」、沒排約', dg['R'].get('first') == 'busy' and '那天你有約了？' in tail and '……嗯。下次。' in tail and any('那個時間你已經約了別人' in t for t in sysm) and not any(v['day'] == d['d'] + 1 and abs(v['h'] - 14) < 0.05 for v in ivs), J([dg['R'], tail, sysm, ivs]))
                run.check('沒有 JS 例外', not errs, J(errs[:5])); await b.close(); return run.finish()
            run.check('回「好。」＝約好 3/11（三）14:00 木曜日（一起念書）', any(v['day'] == d['d'] + 1 and abs(v['h'] - 14) < 0.05 and v['state'] == 'accepted' for v in ivs), J(ivs))
            st0 = await pg.evaluate("(GAME.G.stats&&GAME.G.stats.study)||0")
            await P.jump(pg, cdp, run, '2026-03-11', 13.8, zone='wz_mokuyobi', pos=None, note='木曜日門口（約好的地方）'); await P.init(pg)
            n0 = await P.say_hook(pg)
            seen = await play_until(pg, cdp, 15.5, max_s=700, prefer=('一起', '坐', '念', '讀'))
            lines = [t for _, t in await P.said(pg, n0)]
            st1 = await pg.evaluate("(GAME.G.stats&&GAME.G.stats.study)||0")
            await run.shot(pg, 'yt_first_after')
            print('[OPTS]', J(seen, 800)); print('[LINES]', J(lines, 2500)); print('[STUDY]', st0, st1)
            dur = [t for blk in Lx['during'] for (_, t) in blk]
            run.check('② 見面坐下：她多一句「%s」' % Lx['extra'], any(Lx['extra'] in t for t in lines), J(lines, 1200))
            run.check('② 坐下讀書以後：四句輪流的其中一句', any(any(dl in t for t in lines) for dl in dur), J(lines, 1200))
            run.check('② 讀書時數有加（%s → %s）' % (st0, st1), st1 > st0, J([st0, st1]))
            if os.environ.get('NEWLINE'):   # 4ce5a0ba6：第 1 場開頭改「你先讀。我把這一章看完就好。」、木曜日「（小聲）…」外面不再有「」（AA-B 23:38）
                run.check('③ 第 1 場開頭「你先讀。我把這一章看完就好。」、沒有「我讀社會學。你讀什麼？」', any('你先讀。我把這一章看完就好。' in t for t in lines) and not any('你讀什麼' in t for t in lines), J(lines, 1200))
                run.check('③ 木曜日的「（小聲）…」外面沒有「」', any(t.startswith('（小聲）') for t in lines) and not any(t.startswith('「（小聲）') for t in lines), J([t for t in lines if '小聲' in t]))
        else:
            s, d = await P.base(pg, base, '2025-11-03', 14.8, 'campus')
            s['invites'] = [v for v in s.get('invites', []) if v.get('who') != AN]
            await P.load(pg, cdp, s); await P.init(pg)
            run.setup('[前置] day46 存檔改到 2025-11-03（一）14:48 校園')
            if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(800)
            sel = '#phoneBody [data-inv="%s"]' % AN
            await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })(%s)" % json.dumps(sel))
            await L.tap(pg, cdp, sel)
            lv = {'cat': await wait_opts(pg)}; await choose(pg, cdp, '念書')
            lv['place'] = await wait_opts(pg); await choose(pg, cdp, PLACE)
            lv['time'] = await wait_opts(pg); lv['picked'] = await choose(pg, cdp, '今天 17:30')
            await play_until(pg, cdp, 0, max_s=40)
            ivs = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({day:v.day,h:v.h,state:v.state,place:v.place,cat:v.cat})))(%s)" % json.dumps(AN))
            print('[INV]', J(lv, 1200), J(ivs))
            run.check('約以安「念書」→ %s → 今天 17:30＝約好' % PLACE, any(v['day'] == d['d'] and abs(v['h'] - 17.5) < 0.05 and v['state'] == 'accepted' for v in ivs), J([lv.get('picked'), ivs]))
            st0 = await pg.evaluate("(GAME.G.stats&&GAME.G.stats.study)||0")
            actn0 = await pg.evaluate("JSON.stringify(((GAME.G.flags.STUDYN||{})[\"heroine_01\"])||null)")
            await P.jump(pg, cdp, run, '2025-11-03', 17.3, zone=PZONE, pos=None, note=PLACE + '門口'); await P.init(pg)
            n0 = await P.say_hook(pg)
            seen = await play_until(pg, cdp, 19.0, max_s=700, prefer=('一起', '坐', '念', '讀'))
            lines = await P.said(pg, n0)
            st1 = await pg.evaluate("(GAME.G.stats&&GAME.G.stats.study)||0")
            actn1 = await pg.evaluate("JSON.stringify(((GAME.G.flags.STUDYN||{})[\"heroine_01\"])||null)")
            await run.shot(pg, 'moku_after')
            print('[OPTS]', J(seen, 800)); print('[LINES]', J(lines, 3000)); print('[STUDY]', st0, st1); print('[ACTN]', actn0, '→', actn1)
            run.check('木曜日念書約整段演完（有她的台詞、沒卡在對話）', len(lines) >= 3 and any(n for n, _ in lines), J(lines, 1200))
            run.check('讀書時數有加（%s → %s）' % (st0, st1), st1 > st0, J([st0, st1]))
            if PLACE == '總圖':
                wl = [(n, t) for n, t in lines if t.startswith('（小聲）')]
                nr = [(n, t) for n, t in lines if t.startswith('（') and not t.startswith('（小聲）')]
                run.check('總圖：「（小聲）…」是她說的（有名字）、外面沒有「」', bool(wl) and all(n for n, _ in wl) and not any(t.startswith('「（小聲）') for _, t in lines), J(wl))
                run.check('總圖：旁白「（…）」沒有名字', all(not n for n, _ in nr), J(nr))
                pt = await pg.evaluate("(()=>{ const P=document.querySelector('#portrait, .portrait, #adv img'); return P?{src:(P.src||P.style.backgroundImage||'').slice(-60),vis:getComputedStyle(P).display!=='none'}:null; })()")
                print('[PORT]', J(pt))
            run.check('一起念書第 N 場有記（G.flags.STUDYN 以安那一筆有變）', actn0 != actn1, J([actn0, actn1]))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
