"""BB-B 2026-11-08：TEXT-QUOTE-UNIFY-1108 第六批（LAWWW-B 1951087cc；最後一批）瀏覽器抽查——沛珊第一次一起去法圖。
這一批改了 invites3d.js 的 S.narrLine（整句是一對（）才算旁白），最可能出事的就是這一場：
  ① 「（她在借書櫃台問了館員三個問題，館員都回答了。）」＝旁白（名字框空的）；
  ② 「（走出法圖）館員人好好。我以為法圖的人都很兇。」＝沛珊說的（名字框＝沛珊）、外面沒有「」、不加（小聲）（走出館外了，LIBQ.isOut）；
  ③ 其他有名字的句子外面都沒有「」；④ 沒有 JS 例外。
看「畫面上實際顯示的字」（對話框 #dlg 的名字和字，DLG_WATCH），不是只看程式傳進去的字串。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -12＝2025-10-20 週一）早上 10 點、清邀約、沛珊關係到朋友（fam 50／trust 35／comf 30）、
  拿掉「一起去過法圖」的記憶（LAWLIB_TOGETHER）讓這一次算第一次。之後全部觸控：手機「朋友」→ 沛珊「約」→ 念書 → 法律學院圖書館 → 今天的時間 →
  【捷徑】時間撥到約好的前 10 分鐘 → 手機「今天」按「現在過去」→ 跟她走、照實點。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests python3 pt1108l_quote6_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys, importlib.util
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import pt1108f_quote3_probe as Q   # DLG_WATCH、full_lines
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = 'classmate_peishan'; pe.WHO = WHO
SHIFT = int(os.environ.get('DAYSHIFT', '-12'))
J = lambda x, n=1200: json.dumps(x, ensure_ascii=False)[:n]


def base_state():
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s.get('G', s)); s['day'] = s['day'] + SHIFT; s['weekday'] = ((s.get('weekday') or 0) + SHIFT) % 7
    s['hour'] = 10.0; s['invites'] = []; s['money'] = max(s.get('money', 0), 1000); s.setdefault('home', {})['at'] = False
    soc = dict(s.get('social') or {}); rel = dict(soc.get('rel') or {}); r = dict(rel.get(WHO) or {})
    r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30)
    rel[WHO] = r; soc['rel'] = rel; s['social'] = soc
    return s


async def main():
    run = L.Run('pt1108l_quote6', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        s = base_state()
        await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 40)
        mem = await pg.evaluate("(w=>{ try{ const had=SOCIAL.has(w,'LAWLIB_TOGETHER'); if(had&&SOCIAL.forget) SOCIAL.forget(w,'LAWLIB_TOGETHER'); return {had, now:SOCIAL.has(w,'LAWLIB_TOGETHER')}; }catch(e){ return {err:String(e)}; } })(%s)" % json.dumps(WHO))
        run.setup('[前置] day46 %+d 天 10:00、清邀約、沛珊朋友關係；LAWLIB_TOGETHER %s' % (SHIFT, J(mem)))
        fa = await pg.evaluate("(()=>{ const P=(INVITE_PLACE_LINES.places||{}).lawlib||{}; const x=P.classmate_peishan||{}; return x.firstAt||null; })()")
        run.note('資料裡的 firstAt：%s' % J(fa))
        nl = await pg.evaluate("(a=>a.map(t=>[t, (typeof INV!=='undefined'&&INV._S&&INV._S.narrLine)?INV._S.narrLine(t):null]))(%s)" % J(fa or []))
        run.note('narrLine（拿得到才有）：%s' % J(nl))
        await pg.evaluate(Q.DLG_WATCH); await pg.evaluate("window.__DW.length=0")
        said, picked = await pe.meet_once(pg, cdp, run, '念書', '法律學院圖書館', 'lawlib')
        lines = Q.full_lines(await pg.evaluate("window.__DW.slice()"))
        hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.slice(-40).map(x=>[x.name||'',x.text]):[]")
        run.note('畫面上的句子（名字｜字）：%s' % J([[x['n'], x['t']] for x in lines], 3000))
        run.check('見面演完了', said is not None, J((said or [])[-8:]))
        a = [x for x in lines if '借書櫃台' in x['t']]
        run.check('① 櫃台那句是旁白（名字框空的）', bool(a) and all(not x['n'] for x in a), J({'got': a, 'hist': [h for h in hist if '借書櫃台' in h[1]]}))
        bx = [x for x in lines if '館員人好好' in x['t']]
        hb = [h for h in hist if '館員人好好' in h[1]]
        ok2 = bool(bx) and all(x['n'] == '沛珊' or '沛珊' in x['n'] for x in bx)
        run.check('② 「（走出法圖）館員人好好……」名字框＝沛珊', ok2, J({'got': bx, 'hist': hb}))
        run.check('② 這一句外面沒有「」、沒有加（小聲）', bool(bx) and all('「' not in x['t'] and '小聲' not in x['t'] for x in bx) and all('「' not in h[1] and '小聲' not in h[1] for h in hb), J({'got': bx, 'hist': hb}))
        named = [x for x in lines if x['n']]
        bad = [x for x in named if x['t'].startswith('「') and x['t'].endswith('」')]
        run.check('③ 有名字的句子外面都沒有「」（%d 句）' % len(named), named and not bad, J({'bad': bad}))
        await run.shot(pg, 'lawlib_after')
        run.check('④ 沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
