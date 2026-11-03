"""CC（帳號 A）11-03：宿營中途的舊存檔（AA_608 改段以前的存檔）讀進新版、接著玩到 8/24（第 3 級真實玩家探針）。
新版的換算：src/story3d.js S.campFrom（舊存檔沒有 campSeqV：照「最後演完那一段的時間」換算成新表 S.CAMP_SEQ 的下一段）。
兩段（CASES，可以分兩項排；load 讀 make 的輸出）：
  make  舊版（線上 v9.10.17 0f66c4215；雲端用 wt_7224 的 HEAD，見回報）：乾淨的瀏覽器 → 標題「從法律系開始」→ 照玩家點對話、選項一律第一個
        → 宿營第 2 天演完 MAKE_AFTER（預設 ev_camp_d2_bbq＝舊表第 8 段，營火前的最後一段）那一刻，遊戲自己寫的自動存檔（fatiao3d_auto）
        匯出成 <out>/oldsave_camp_d2.json，然後關掉瀏覽器（像玩家玩到一半關掉分頁）。不用 ?turbo、沒有捷徑。
  load  新版（6a8033f4e）：新的 browser context（乾淨）→ 標題「讀取／匯入存檔」→「匯入存檔」選 oldsave_camp_d2.json →「匯入」（玩家搬存檔的方式）
        → 遊戲自己接著演宿營（applySave → STORY.campY1 resume）→ 照玩家點到 8/24 演完、8/29 搬宿舍的字卡。
        SAVE=<檔案> 可以指定別的存檔（預設 <out>/oldsave_camp_d2.json）。
  一次跑兩段：CASES=make,load，OLD_URL=<舊版 index.html>（make 用），第一個參數是新版。
load 的檢查：
  a 匯入成功、讀進來是舊存檔（沒有 campSeqV、campStep＝存檔的值）
  b 接著演的第一段＝新版 STORY.campFrom(存檔的 flags) 算出來的那一段，之後照 CAMP_SEQ 的順序演完（不跳段）
  c 不重播：讀檔以後演的事件沒有一個在存檔的 events.done 裡
  d 不跳過沛珊的營火：ev_camp_d2_fire 有演、「這是沛珊。妳先坐這邊。」有出現
  e 不卡住：同一個畫面不超過 STUCK_S 秒、walkFallbacks 0、遊戲時鐘不倒退（每段開始的時間 ≥ 存檔的時間）、最後 CAMP_Y1 而且走到 8/29
  f 讀檔以後的宿營台詞，講話的人只有阿哲、芯慈、沛珊、玩家、背景、旁白
  g 沒有 JS 例外
用法：LW_TESTS=<工作樹>/tests CASES=make|load|make,load [SHA=…] [MAKE_AFTER=ev_camp_d2_bbq] [SAVE=…] [OLD_URL=…] python3 cc_camp_oldsave_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。不是 iPhone：Playwright 手機橫向模擬。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_camp608_common as C
L = C.L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
CASES = [c.strip() for c in os.environ.get('CASES', 'load').split(',') if c.strip()]
MAKE_AFTER = os.environ.get('MAKE_AFTER', 'ev_camp_d2_bbq')
OLD_URL = os.environ.get('OLD_URL', '')
SAVE = os.environ.get('SAVE') or os.path.join(OUT, 'oldsave_camp_d2.json')
MAX_S = int(os.environ.get('MAX_S', '3600'))
STUCK_S = int(os.environ.get('STUCK_S', '240'))
J = C.J
ALLOW_IDS = {'zhe', 'classmate_xinci', 'classmate_peishan'}
for u in (URL, OLD_URL):
    if '?turbo' in u or '&turbo' in u: raise SystemExit('真實流程不能用 ?turbo')


async def play(pg, cdp, run, until, tag, recs, picks):
    """照玩家點對話、選項（第一個），直到 until(s)；回傳 (結束原因, 最後的 s)"""
    t0 = time.time(); last = None; since = time.time(); s = None
    while time.time() - t0 < MAX_S:
        s = await C.ts(pg)
        if not s: await pg.wait_for_timeout(800); continue
        recs.extend(await pg.evaluate(C.TAKE))
        if until(s): return 'ok', s
        sig = (s['key'], s['h'], s['txt'][:40], len(s['ch']), s['ev'], s['busy'], s['phone'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > STUCK_S:
            await run.shot(pg, '%s_stuck' % tag); return 'stuck', s
        if await C.step(pg, cdp, s, picks): continue
        await pg.wait_for_timeout(700)
    return 'MAX_S', s


async def case_make(p, run, url):
    print('---- make（舊版）URL=%s ----' % url, flush=True)
    recs, picks = [], []
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    await pg.goto(url)
    run.check('make 遊戲載入', await L.wait_loaded(pg, 600))
    seq = await pg.evaluate("(STORY.CAMP_SEQ||[]).map(x=>x.slice())")
    d0 = await pg.evaluate("STORY.dayOfKey(STORY.CAMP_DAY||'2025-08-22')")
    ver = await pg.evaluate("(document.querySelector('#titleScreen')||{}).innerText.match(/v9[.0-9]+/)||null")
    run.note('make：版本字樣 %s；這一版的 CAMP_SEQ=%s' % (J(ver), J([x[0] for x in seq])))
    idx = next((i for i, x in enumerate(seq) if x[0] == MAKE_AFTER), None)
    run.check('make 這一版的宿營表有 %s' % MAKE_AFTER, idx is not None)
    if idx is None: await b.close(); return
    target = idx + 1
    run.check('make 標題畫面按「從法律系開始」', await C.new_game_law(pg, cdp, run))
    why, s = await play(pg, cdp, run, lambda q: q['campOn'] and q['campStep'] is not None and q['campStep'] >= target, 'make', recs, picks)
    sv = await C.save_auto(pg)
    await run.shot(pg, 'make_at_save')
    ok = why == 'ok' and sv and (sv.get('flags') or {}).get('campStep') == target and sv.get('day') == d0 + 1
    run.check('make 宿營第 2 天演完 %s 的自動存檔（campStep=%d、8/23）' % (MAKE_AFTER, target), bool(ok),
              J({'why': why, 'day': sv and sv.get('day'), 'hour': sv and sv.get('hour'), 'campStep': sv and (sv.get('flags') or {}).get('campStep')}))
    if sv:
        json.dump(sv, open(os.path.join(OUT, 'oldsave_camp_d2.json'), 'w', encoding='utf-8'), ensure_ascii=False)
        done = sorted((sv.get('events') or {}).get('done', {}).keys())
        met = {k: [m for m in v if m.get('tag') == 'FIRST_MET'] for k, v in ((sv.get('social') or {}).get('mem') or {}).items()}
        met = {k: v[0] for k, v in met.items() if v}
        run.note('make 匯出 oldsave_camp_d2.json：day=%s hour=%s campStep=%s campSeqV=%s；events.done=%s；FIRST_MET=%s' % (
            sv.get('day'), sv.get('hour'), sv['flags'].get('campStep'), sv['flags'].get('campSeqV'), J(done), J(met)))
    run.check('make 沒有 JS 例外', not errs, J(errs[:3]))
    json.dump({'records': recs, 'picks': picks}, open(os.path.join(OUT, 'make_log.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    await b.close()   # 像玩家玩到一半關掉分頁


async def case_load(p, run, url):
    print('---- load（新版）URL=%s SAVE=%s ----' % (url, SAVE), flush=True)
    if not os.path.exists(SAVE):
        run.check('load 有舊存檔檔案 %s（先跑 CASES=make）' % SAVE, False); return
    sv = json.load(open(SAVE, encoding='utf-8'))
    old_done = set(((sv.get('events') or {}).get('done') or {}).keys())
    recs, picks = [], []
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    await pg.goto(url)
    run.check('load 遊戲載入', await L.wait_loaded(pg, 600))
    seq = await pg.evaluate("(STORY.CAMP_SEQ||[]).map(x=>x.slice())")
    d0 = await pg.evaluate("STORY.dayOfKey(STORY.CAMP_DAY||'2025-08-22')")
    roster = (await pg.evaluate(C.ROSTER, sorted(ALLOW_IDS)))['ids']
    frm = await pg.evaluate("f=>STORY.campFrom(Object.assign({},f))", sv.get('flags') or {})
    exp = [x[0] for x in seq[frm:]]
    run.note('load：存檔 day=%s hour=%s campStep=%s campSeqV=%s；新版 campFrom＝%s → 應該接著演 %s' % (
        sv.get('day'), sv.get('hour'), (sv.get('flags') or {}).get('campStep'), (sv.get('flags') or {}).get('campSeqV'), frm, J(exp)))
    run.check('a 存檔是舊版的（沒有 campSeqV、CAMP_Y1_ON、還沒 CAMP_Y1）', (sv.get('flags') or {}).get('campSeqV') is None and (sv.get('flags') or {}).get('CAMP_Y1_ON') and not (sv.get('flags') or {}).get('CAMP_Y1'),
              J({k: (sv.get('flags') or {}).get(k) for k in ('campSeqV', 'CAMP_Y1_ON', 'CAMP_Y1', 'campStep')}))
    t_save = sv.get('day', 0) * 24 + float(sv.get('hour') or 0)
    run.check('a 標題「讀取／匯入存檔」→「匯入存檔」→「匯入」讀進來', await C.import_save(pg, cdp, run, SAVE))
    pname = await pg.evaluate("GAME.G.name")
    allow_names = {pname, '小隊輔', '系學會', ''}
    await run.shot(pg, 'load_after_import')
    why, s = await play(pg, cdp, run, lambda q: q['CAMP_Y1'] and not q['campOn'] and q['day'] > d0 + 2, 'load', recs, picks)
    recs.extend(await pg.evaluate(C.TAKE))
    await run.shot(pg, 'load_end')
    fin = await C.ts(pg)
    run.note('load 結束：%s；%s' % (why, J({k: fin[k] for k in ('key', 'h', 'zone', 'CAMP_Y1', 'campOn', 'campStep', 'fb', 'busy', 'depth')})))
    evs = [r for r in recs if r['k'] == 'ev']
    camp = [r['t'] for r in evs if r['t'].startswith('ev_camp_')]
    run.note('load 讀檔以後演的事件：%s' % J([[r['t'], r['d'], C.hm(r['h'])] for r in evs]))
    run.check('b 接著演的段落＝campFrom 以後的 CAMP_SEQ（不跳段、不多演）', camp == exp, '演的=%s 應為=%s' % (J(camp), J(exp)))
    rep = [r['t'] for r in evs if r['t'] in old_done]
    run.check('c 沒有重播存檔裡已經演過的事件', not rep, J(rep))
    run.check('d 沛珊的營火有演（ev_camp_d2_fire）', 'ev_camp_d2_fire' in camp or 'ev_camp_d2_fire' in old_done, J(camp))
    fire_line = next((r for r in recs if r['k'] == 'say' and r['t'].startswith('這是沛珊。妳先坐這邊')), None)
    run.check('d 「這是沛珊。妳先坐這邊。」有出現', bool(fire_line), J(fire_line))
    run.check('e 走到 8/24 演完、8/29 搬宿舍（沒有卡住）', why == 'ok', why)
    back = [[r['t'], r['d'], C.hm(r['h'])] for r in evs if r['day'] * 24 + r['h'] < t_save - 0.01]
    run.check('e 遊戲時鐘沒有倒退（讀檔以後每段開始的時間 ≥ 存檔的時間 %s）' % C.hm(sv.get('hour')), not back, J(back))
    tl = [r['day'] * 24 + r['h'] for r in evs if r['t'].startswith('ev_camp_')]
    run.check('e 宿營各段的時間照順序往前', all(b2 >= a2 for a2, b2 in zip(tl, tl[1:])), J(tl))
    run.check('e walkFallbacks 0', fin['fb'] == 0, str(fin['fb']))
    bad = []
    for r in recs:
        if r['k'] == 'say' and r.get('camp'):
            c = C.classify(r, roster, ALLOW_IDS, allow_names)
            if c: bad.append([r['d'], C.hm(r['h']), r.get('ev'), r.get('n'), r.get('cid'), r['t'][:30], '→' + c])
    run.check('f 讀檔以後的宿營台詞，講話的人在名單內', not bad, J(bad[:6]))
    run.check('g 沒有 JS 例外', not errs, J(errs[:3]))
    json.dump({'records': recs, 'picks': picks}, open(os.path.join(OUT, 'load_log.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    await b.close()


async def main():
    run = L.Run('cc_camp_oldsave', OUT); os.makedirs(OUT, exist_ok=True)
    print('cc_camp_oldsave_probe  SHA=%s  URL=%s  CASES=%s  MAKE_AFTER=%s' % (SHA, URL, ','.join(CASES), MAKE_AFTER), flush=True)
    async with async_playwright() as p:
        for c in CASES:
            try:
                if c == 'make':
                    u = OLD_URL if 'load' in CASES else URL
                    if not u: run.check('make 需要 OLD_URL（和 load 一起跑時）', False); continue
                    await case_make(p, run, u)
                elif c == 'load':
                    await case_load(p, run, URL)
                else:
                    run.check('CASES 只有 make、load（%s）' % c, False)
            except Exception as e:
                run.check('%s 執行' % c, False, '例外：%r' % e)
    print('ALL PASS' if not run.fails else 'FAILED %d' % len(run.fails), flush=True)
    return 1 if run.fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
