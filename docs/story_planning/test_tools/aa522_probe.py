"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 2 項）：AA_522 教授的研究室——照玩家走到萬才館的教授旁邊、按「和他說話」、點對話、選選項（不是 Node）。
MODE（環境變數）：
  zhou  第 9 節第 1 點＋1-2：民總第一堂那一週（STORY.civ1Week）的週四 15:24 萬才館——研究室不演，周教授先說 talkProf 第一週那兩句之一（答得好／沒讀；存檔沒有 classAnswer＝【捷徑】設 none）；
        同一份進度往後每週四同一時間：研究室開始演（招呼一句、大一上三題：越權代理、無過失、推薦書），每題問一次、問過的不再出；三題問完的那個週四＝研究室不再觸發（周教授照 1-1「週四下課以後我都在」）
  xu1   第 8 節第 1 點＋第 2 節：大一上第 4 週週一 14:30 萬才館——許教授在（研究室時間）；【捷徑】沒見過＝大一的自我介紹「一年級的？我是許志遠……」；同一份進度下週一＝「又是你。有問題？」
  xu3   第 2 節：大三上（2027-09-13 週一）14:30 萬才館，【捷徑】沒見過許教授＝大三的自我介紹「許志遠。教公法的。你們這屆我教過。」；下週一＝「大三了，民訴、刑訴都很重。還來？」
選選項：每次選第一個還沒問過的題目（不選「沒事。」），記下每一次的選項。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 aa522_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'zhou')
J = lambda o: json.dumps(o, ensure_ascii=False)
Z_W1 = ('今天回答得不錯。下週', '案例要讀。下週我還會點人。')
Z_OPEN = '有問題可以來研究室。週四下課以後我都在。'
Z_Q = {'agency': '「老師，代理人自己越權簽約，本人要負責嗎？」', 'q88': '「老師，錯誤的『無過失』要怎麼判斷？」', 'book': '「老師推薦一本書？」'}
Z_A = {'agency': '看本人自己做了什麼。他有沒有讓別人以為那個人有代理權？', 'q88': '好問題。看他有沒有『合理注意的可能』。', 'book': '一年級不用讀太多。一本，讀三遍。'}
XU_INTRO = {'xu1': '一年級的？我是許志遠，教行政法，你們大二會遇到我。', 'xu3': '許志遠。教公法的。你們這屆我教過。'}
XU_AGAIN = {'xu1': '又是你。有問題？', 'xu3': '大三了，民訴、刑訴都很重。還來？'}


def lines(r): return [t for _, t in (r or {}).get('lines', [])]
def flat(r): return [o for os_ in (r or {}).get('opts', []) for o in os_]


async def main():
    run = L.Run('aa522_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)

        if MODE == 'zhou':
            st, d = await P.base(pg, SAVE, ['Y1S1', 4, 4], 15.4, 'wancai'); await P.load(pg, cdp, st)
            wk = await pg.evaluate("""(()=>{ const G=GAME.G, d0=STORY.mainD1(G)+1, c=CALENDAR.dateOf(d0), wd=c.wd===7?7:c.wd, thu=d0-(wd-1)+3; return {d0, key0:c.key, thu, thuKey:CALENDAR.dateOf(thu).key, ca:G.flags.classAnswer==null?null:G.flags.classAnswer}; })()""")
            run.note('民總第一堂（STORY.mainD1+1）＝%s；那一週的週四＝%s；classAnswer＝%s' % (wk['key0'], wk['thuKey'], J(wk['ca'])))
            CA = os.environ.get('ZHOU_CA') or (None if wk['ca'] else 'none')   # BB-B 10-30：使用者存檔是 bold（第 9 節只寫了 good、none 兩句）；ZHOU_CA＝【捷徑】指定
            st, d = await P.base(pg, SAVE, wk['thuKey'], 15.4, 'wancai', flags=({'classAnswer': CA} if CA else None)); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（民總第一堂那一週的週四，大一上第 %s 週）15:24 萬才館%s' % (d['key'], d['week'], ('；【捷徑】classAnswer＝%s' % CA) if CA else ''))
            civ = await pg.evaluate("!!STORY.civ1Week(GAME.G)"); run.check('前置：這一天在民總第一堂那一週（STORY.civ1Week）', civ, J(civ))
            zw = await P.wait_present(pg, 'prof_zhou', 60); run.note('周教授：%s' % J(zw))
            r = await P.talk_full(pg, cdp, run, 'prof_zhou', 'zhou_w1', max_s=300); await run.shot(pg, 'zhou_w1')
            run.check('第 9 節第 1 點：那一週研究室不演（沒有研究室的選項）', bool(r) and not any(o in Z_Q.values() for o in flat(r)), J(r and r.get('opts')))
            run.check('第 9 節第 1 點：先說 talkProf 第一週那兩句之一（答得好「今天回答得不錯。下週……」／沒讀「案例要讀。下週我還會點人。」）', any(any(w in t for w in Z_W1) for t in lines(r)), J(r and r['lines']))
            asked = []; day = d['d']
            for k in range(1, 5):
                day += 7; dd = await P.jump(pg, cdp, run, await pg.evaluate("CALENDAR.dateOf(%d).key" % day), 15.4, zone='wancai', pos=None, note='下一個週四（第 %d 次去）' % k)
                await P.wait_present(pg, 'prof_zhou', 60)
                left = [q for q in Z_Q if q not in asked]
                r = await P.talk_full(pg, cdp, run, 'prof_zhou', 'zhou_%d' % k, picks=[Z_Q[q] for q in left], max_s=300); await run.shot(pg, 'zhou_%d' % k)
                op = flat(r); pk = (r or {}).get('picked', [])
                if left:
                    run.check('1-2 第 %d 次：研究室演了（有選項），還沒問的 %s 都在、問過的 %s 不在' % (k, J(left), J(asked)),
                              bool(op) and all(Z_Q[q] in op for q in left) and not any(Z_Q[q] in op for q in asked), J(r and r.get('opts')))
                    got = [q for q in left if Z_Q[q] in pk]
                    if got:
                        q = got[0]; asked.append(q)
                        run.check('1-2 第 %d 次：問 %s 的回答（%s…）' % (k, q, Z_A[q][:12]), any(Z_A[q] in t for t in lines(r)), J(r and r['lines']))
                    else: run.note('第 %d 次沒有選到題目：%s' % (k, J(pk)))
                else:
                    run.check('1-2 三題都問過了：研究室不再觸發（沒有研究室的選項，周教授照 1-1 說「%s」）' % Z_OPEN, bool(r) and not any(o in Z_Q.values() for o in op) and any(Z_OPEN in t for t in lines(r)), J(r and {'opts': r.get('opts'), 'lines': r['lines']}))
            notes = await pg.evaluate("(()=>{ const N=(GAME.G.notes||GAME.G.flags.notes||[]); return Array.isArray(N)?N.map(n=>n&&(n.id||n.title)).filter(Boolean):Object.keys(N||{}); })()")
            run.note('筆記：%s' % J(notes))
            run.check('1-2 越權代理那一題記了筆記 zhou_169', any('zhou_169' == x or '越權代理' in str(x) for x in notes) or 'agency' not in asked, J(notes))

        else:
            key = ['Y1S1', 4, 1] if MODE == 'xu1' else '2027-09-13'
            fl = None
            if MODE == 'xu3': fl = {'ROOM_Y2': await pg.evaluate("STORY.dayOfKey('2026-09-06')"), 'ROOM_Y3': await pg.evaluate("STORY.dayOfKey('2027-09-05')"), 'ROOM_Y3_ITEMS': [], 'ROOM_Y3_DISCARD': None}
            st, d = await P.base(pg, SAVE, key, 14.5, 'wancai', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（%s 第 %s 週週一）14:30 萬才館' % (d['key'], d['term'], d['week']))
            pre = await P.prep(pg, cdp, run, """(()=>{ const G=GAME.G, so=G.social||{}; const had=SOCIAL.has('prof_xu','FIRST_MET'); if(had&&so.mem&&so.mem.prof_xu) so.mem.prof_xu=so.mem.prof_xu.filter(m=>m.tag!=='FIRST_MET'); return {had, now:SOCIAL.has('prof_xu','FIRST_MET'), office:!!STORY.profOffice('prof_xu',G)}; })()""", label='還沒見過許教授（有 FIRST_MET 就拿掉）')
            run.check('第 8 節第 1 點：週一 14:00～16:00 是許教授的研究室時間（STORY.profOffice）', bool(pre) and pre.get('office'), J(pre))
            xw = await P.wait_present(pg, 'prof_xu', 60); run.note('許教授：%s' % J(xw))
            run.check('第 8 節第 1 點：許教授在萬才館', bool(xw) and not xw['hidden'], J(xw))
            r1 = await P.talk_full(pg, cdp, run, 'prof_xu', MODE + '_1', max_s=300); await run.shot(pg, MODE + '_1')
            run.check('第 2 節：第一次見面＝%s的自我介紹「%s」' % ('大一' if MODE == 'xu1' else '大三', XU_INTRO[MODE]), any(XU_INTRO[MODE] in t for t in lines(r1)), J(r1 and r1['lines']))
            run.check('第 2 節：別的年級的自我介紹不出', not any(w in t for t in lines(r1) for k, w in XU_INTRO.items() if k != MODE), J(r1 and r1['lines']))
            nk = await pg.evaluate("(d=>{ let x=d+7; for(let i=0;i<6&&CALENDAR.holiday(x);i++) x+=7; return {key:CALENDAR.dateOf(x).key, skipped:(x-d)/7-1}; })(%d)" % d['d'])   # BB-B 10-30：2025-09-29 是教師節補假（國定假日許教授不在研究室），跳過假日的週一
            await P.jump(pg, cdp, run, nk['key'], 14.5, zone='wancai', pos=None, note='下一個不是假日的週一（冷卻 3 天已過；跳過 %d 個假日週一）' % nk['skipped'])
            await P.wait_present(pg, 'prof_xu', 60)
            r2 = await P.talk_full(pg, cdp, run, 'prof_xu', MODE + '_2', max_s=300); await run.shot(pg, MODE + '_2')
            run.check('第 2 節：之後的招呼＝「%s」' % XU_AGAIN[MODE], any(XU_AGAIN[MODE] in t for t in lines(r2)), J(r2 and r2['lines']))
            run.note('兩次的選項：%s ／ %s' % (J(r1 and r1.get('opts')), J(r2 and r2.get('opts'))))

        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
