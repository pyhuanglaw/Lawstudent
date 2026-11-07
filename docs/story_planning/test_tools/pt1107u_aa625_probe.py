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
            await P.phone_answer(pg, cdp, 'p:' + YT, '好。'); await L.close_panels(pg, cdp); await pg.wait_for_timeout(3000)
            ivs = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({day:v.day,h:v.h,state:v.state,place:v.place,cat:v.cat,yts:v.yts})))(%s)" % json.dumps(YT))
            print('[IVS]', J(ivs))
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
            lv['place'] = await wait_opts(pg); await choose(pg, cdp, '木曜日')
            lv['time'] = await wait_opts(pg); lv['picked'] = await choose(pg, cdp, '今天 17:30')
            await play_until(pg, cdp, 0, max_s=40)
            ivs = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({day:v.day,h:v.h,state:v.state,place:v.place,cat:v.cat})))(%s)" % json.dumps(AN))
            print('[INV]', J(lv, 1200), J(ivs))
            run.check('約以安「念書」→ 木曜日 → 今天 17:30＝約好', any(v['day'] == d['d'] and abs(v['h'] - 17.5) < 0.05 and v['state'] == 'accepted' for v in ivs), J([lv.get('picked'), ivs]))
            st0 = await pg.evaluate("(GAME.G.stats&&GAME.G.stats.study)||0")
            actn0 = await pg.evaluate("JSON.stringify((GAME.G.flags.ACTN||{}))")
            await P.jump(pg, cdp, run, '2025-11-03', 17.3, zone='wz_mokuyobi', pos=None, note='木曜日門口'); await P.init(pg)
            n0 = await P.say_hook(pg)
            seen = await play_until(pg, cdp, 19.0, max_s=700, prefer=('一起', '坐', '念', '讀'))
            lines = await P.said(pg, n0)
            st1 = await pg.evaluate("(GAME.G.stats&&GAME.G.stats.study)||0")
            actn1 = await pg.evaluate("JSON.stringify((GAME.G.flags.ACTN||{}))")
            await run.shot(pg, 'moku_after')
            print('[OPTS]', J(seen, 800)); print('[LINES]', J(lines, 3000)); print('[STUDY]', st0, st1); print('[ACTN]', actn0, '→', actn1)
            run.check('木曜日念書約整段演完（有她的台詞、沒卡在對話）', len(lines) >= 3 and any(n for n, _ in lines), J(lines, 1200))
            run.check('讀書時數有加（%s → %s）' % (st0, st1), st1 > st0, J([st0, st1]))
            run.check('一起念書第 N 場有記（ACTN 有變）', actn0 != actn1, J([actn0, actn1]))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
