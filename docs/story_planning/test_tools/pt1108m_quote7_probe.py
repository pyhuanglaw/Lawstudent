"""BB-B 2026-11-08：TEXT-QUOTE-UNIFY-1108 第七批（最後一批；LAWWW-B b4fb80798，push c1f229e34）瀏覽器抽查——課堂出題 LEGAL.ask 程式包的「」拿掉。
看「畫面上實際顯示的字」（對話框 #dlg 的名字和字，DLG_WATCH）：
  ① 教授出題那幾句（是非題「……——這句話對不對？祐廷，你說。」、選擇題題目、「A、…；…D、…。祐廷，你選哪個？」）有名字、外面沒有「」；
  ② 玩家的選項照舊有「」（選項按鈕）；③ 同學小聲那一句（chorus）有名字、外面沒有「」（第六批）；④ 沒有 JS 例外。
課堂開場「我們看一個實務上常見的情況。」那類 CLASS_INTRO 句還有「」（AA-B 還沒定，LAWWW-B 說這批不算錯）＝只記下來，不判。
【捷徑】現在的課表課堂沒有走 LEGAL.ask 'class'；唯一用 context:'class' 的是退役的 ev_class_crimpro（v7 舊課堂，AA_376 停用）。
  這支直接 EVENTS.run 那一場（同一個 LEGAL.ask 程式路徑）；觸發條件不看。之後點對話、選選項照觸控（選第一個）。
[前置] 讀使用者存檔 day46，讀檔到 classroom。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests python3 pt1108m_quote7_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, copy, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
import pt1108f_quote3_probe as Q   # DLG_WATCH、full_lines
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
J = lambda x, n=1500: json.dumps(x, ensure_ascii=False)[:n]
wrapped = lambda t: t.startswith('「') and t.endswith('」')


async def main():
    run = L.Run('pt1108m_quote7', OUT)
    raw = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    G0 = raw.get('G', raw)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        s = copy.deepcopy(G0); s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']; s.setdefault('home', {})['at'] = False
        s.update(zone='classroom', pos=None, hour=9.95)
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        run.setup('[前置] day46 存檔讀到 classroom 09:57')
        await pg.evaluate(Q.DLG_WATCH); await pg.evaluate("window.__DW.length=0")
        ok = await pg.evaluate("(()=>{ try{ const ev=(STORY_EVENTS||[]).find(e=>e.id==='ev_class_crimpro'); if(!ev) return 'no event'; if(EVENTS.running) return 'busy '+EVENTS.running; void EVENTS.run(ev); return 'started';   /* EVENTS.run 要傳事件物件（不是 id）*/ }catch(e){ return 'err '+e; } })()")
        run.setup('【捷徑】EVENTS.run(ev_class_crimpro)（退役課堂，唯一 context:class 的出題）：%s' % ok)
        r = await P.dialog(pg, cdp, run, picks=(), max_s=240, start_s=12, idle_s=5, tag='class')
        lines = Q.full_lines(await pg.evaluate("window.__DW.slice()"))
        hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.slice(-60).map(x=>[x.name||'',x.text]):[]")
        run.note('畫面上的句子（名字｜字）：%s' % J([[x['n'], x['t']] for x in lines], 4000))
        run.note('ADV 紀錄：%s' % J(hist, 4000))
        allL = [{'n': x['n'], 't': x['t']} for x in lines] + [{'n': h[0], 't': h[1]} for h in hist]
        ask = [x for x in allL if ('這句話對不對' in x['t'] or '你選哪個' in x['t'] or ('A、' in x['t'] and 'D、' in x['t']))]
        run.check('① 有出題（是非題「這句話對不對」或選擇題「你選哪個」）', bool(ask), J(ask))
        run.check('① 出題那幾句有名字、外面沒有「」', bool(ask) and all(x['n'] and not wrapped(x['t']) and not x['t'].startswith('「') for x in ask), J(ask))
        qline = [x for x in allL if x['n'] and x not in ask and '林' in x['n'] and x['t'] and not x['t'].startswith('「') and len(x['t']) > 8]
        run.note('其他林教授沒有「」的句子（選擇題題目可能在這裡）：%s' % J(qline[:8]))
        opts = [o for grp in r['opts'] for o in grp]
        run.note('選項：%s' % J(r['opts']))
        quiz_opts = [o for grp in r['opts'] if len(grp) >= 2 for o in grp]
        run.check('② 選項按鈕有東西（照舊有「」的那幾個列在後面）', bool(quiz_opts), J({'opts': r['opts'], 'with_quote': [o for o in quiz_opts if '「' in o]}))
        ch = [x for x in allL if x['t'].startswith('（小聲）')]
        if ch:
            run.check('③ 同學小聲那一句有名字、外面沒有「」', all(x['n'] and '「' not in x['t'] for x in ch), J(ch))
        else:
            run.note('③ 這一輪沒出現同學小聲那一句（chorus 要 classmate_bohan 在場）')
        intro = [x for x in allL if wrapped(x['t'])]
        run.note('還有「」的整句（CLASS_INTRO 那類，這批不判）：%s' % J(intro[:10]))
        await run.shot(pg, 'class_after')
        run.check('④ 沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
