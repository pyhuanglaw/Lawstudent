"""BB-B 2026-10-23：BB119-Y4-1017（USER_WANTS D53）芷若「出國前的最後一場」（AA_387 定稿，企劃線 608b9adc；src/zr_last3d.js、src/data/zr_last_events.js）瀏覽器實玩。
框架借 us_life_probe.py（[前置] 使用者 9/25 存檔改日期、旗標、區域 → 遊戲時間照走 → 台詞、手機、旗標、記憶記下來 → 檢查）；這支只換情境和多兩種檢查。
[前置] 她的心意條件（ZRZQ.heartOk＝TERMEND.cond＋C8）：朋友（熟 45／信任 30）、她的戀愛 40、正式校外約會 4 次、去過她的心願地點——遊戲裡要一整年的約會，讀檔後在頁面裡直接寫
  （同 tests/aa387_zr_last_unit.js 的 heart()）；有她的聯絡方式；Y4_PATH other（6/8 已選）。臺灣路線＝EXCHANGE_ROUTE TW；日本路線＝JP（3/25 出發、8/5 回國）；美國路線＝US（8/2 出發）。
之後都是玩家的操作：8/24 20:45 宿舍站著 → 21:00 她私訊，打開手機 → 她的對話串 → 點回覆；宿舍的床「快轉 → 到下一個有事的日子」；停在出發前就按「出發：和芷若：公館二輪戲院」；
  散場的兩個選項照情境點；「晚一點」照情境按；收到訊息停下來就收起手機（快轉接著跳）。
AA_387 第 9 節 BB 測試：
  ZL_WAIT      臺灣路線：回「好。」→ 8/26 出發 → 第 3、4 節逐句 →「我等妳回來。」＝交往（ROM）、ZR_LAST wait、記憶 ZR_LAST_SCREENING、房間有票根 → 23:00 兩則（等妳版）→ 9/1（五）21:00 兩則
  ZL_KEEP      同上，「我先收著。」＝ZR_LAST keep、沒有交往、學期末「讓我想想」（TERMEND think）、房間有票根 → 23:00 兩則（收著版）→ 9/1 沒有飛機那兩則
  ZL_NO        回「那天不行。」→ 她「好。……那我一個人看完它。」、ZR_LAST no、沒有出遊、沒有房間物件、沒有 19:45／22:00 那兩則
  ZL_NOREPLY   不回 → 8/25（五）18:00 她傳「好。……那我一個人看完它。」、ZR_LAST no
  ZL_LATE      回「好。」→ 8/26 出發前「晚一點」一直按到不能出發（答應了沒到）→ 19:45「要開演了。……我先進去。」、22:00「散場了。票根我先收著。」、ZR_LAST missed、沒有房間物件、沒有演
  ZL_JP        日本路線（8/5 回國）：8/24 照樣有邀約 → 回「好。」→ 8/26 照演 →「我等妳回來。」
  ZL_US        美國路線（人在美國）：8/24 沒有邀約
  ZL_CUP       6/15 杯子選了「這杯我不能喝」（ZR_CUP declined）：8/24 沒有邀約
F3（6/19 方奕廷那一段）不在這支：單元測試 tests/aa387_zr_last_unit.js 第 8 節有；瀏覽器版要從 6/15 起玩，另外排。
【讀資料】的檢查（玩家看不到、只能讀狀態）：ZR_LAST／ZR_LAST_GO、出遊紀錄、ROM 交往、TERMEND think、房間物件清單（宿舍書桌「看看房間裡的東西」用的同一個 STORY.roomItemList）。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=ZL_WAIT,...] python3 zrlast_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'us_life_probe.py'), encoding='utf-8').read()
src = src[:src.rindex('asyncio.run(main())')]   # 只借框架（不跑它的 main）
B = {'__name__': 'us_life_base', '__file__': os.path.join(HERE, 'us_life_probe.py')}
exec(compile(src, 'us_life_probe.py', 'exec'), B)
L, say, bad, results, SNAP = B['L'], B['say'], B['bad'], B['results'], B['SNAP']
from playwright.async_api import async_playwright
URL, OUT, SAVE, SCEN = B['URL'], B['OUT'], B['SAVE'], B['SCEN']

# ---- AA_387 原文（企劃線 608b9adc；同 tests/aa387_zr_last_unit.js 抄的那一份）----
ASK = ['週六晚上七點半，二輪戲院。我出國前的最後一場。', '……票的事你不用管。']; YES = '嗯。……不要遲到。片頭很短。'; NO = '好。……那我一個人看完它。'
SEC3 = ['（二輪戲院的最後一場。觀眾不到十個人。她坐在第七排靠走道，旁邊的位子放著她的外套。）', '（把外套拿起來）……你的。', '（今天放的是一部很老的片子，《候鳥》。燈暗下來以前，她一直在看手上的兩張票根。）',
        '（片子演到最後一段，她小聲說了一句。）', '這一段，我看過四次。每次都在這裡哭。', '……今天不會。', '（燈亮的時候，她在擦眼睛。）', '……我說了今天不會。']
SEC4A = ['（散場了。騎樓下，她把兩張票根分開，一張放進自己的口袋，一張遞給你。）', '這張是你的。', '（票根背面有字。她的字，鉛筆寫的。）', '熱可可＋濃縮。', '先寄放在你這裡。']
ASKED_N = '（是她自己的點法。）'; NOASK_N = '（是她的點法。她在吧檯後面做給自己喝的那一杯。）'
SEC4B = ['（你抬頭的時候，她看著騎樓外面，沒有看你。）', '……一年。']
WAIT = ['（她轉過來，把口袋裡那一張票根拿出來，和你那張對在一起。）', '一年。……你說的喔。']; KEEP = ['好。……那就先收著。', '（她笑了一下，把自己那一張放回口袋。）']
CLOSE = '（她往捷運站走。走到路口，回頭揮了一下手。）'
N_WAIT = ['到家了。', '票根不要弄丟。……寄放的，要還。']; N_KEEP = ['到家了。', '今天謝謝你。……片子很好看。']; FLY = ['明天早上的飛機。', '……到了打給你。一年，從明天開始算。']
LATE = '要開演了。……我先進去。'; AFTER = '散場了。票根我先收著。'
ROOM = '她的票根'

TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'Y4_PATH': 'other'}
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'AN_SENDOFF': 'together'}
USF = dict(B['USF'], Y4_PATH='other')
Y4 = "G.flags.Y4_PATH_DAY=D('2028-06-08');"
JPJS = "G.flags.X1_JP=D('2028-02-20'); G.flags.JP_DEPARTED=D('2028-03-25'); G.flags.JP_RETURNED=D('2028-08-05');"
HEART = ("LV('heroine_02',45,30,0); SOCIAL.rel('heroine_02').npcRom=40; const Lg=DATE.log(G,'heroine_02'); Lg.count=4; Lg.wish=true;"
         " G.contacts=G.contacts||{}; if(G.contacts.heroine_02==null) G.contacts.heroine_02=D('2025-09-24');")
OUTQ = "(()=>{ const q=typeof OUT!=='undefined'?OUT.get(GAME.G,'zr_last_screening'):null; return q?{d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title||'',alarm:!!q.alarm}:null; })()"
DATING = "(()=>{ const F=GAME.G.flags, R=(F.romance||{}).heroine_02; return F.dating_heroine_02===true||!!(R&&R.status==='dating'); })()"
HASROOM = "STORY.roomItemList(GAME.G).some(r=>r&&r[0]==='她的票根')"
THINK = "(()=>{ try{ return !!((TERMEND.rec(GAME.G).think||{}).heroine_02); }catch(e){ return 'ERR '+e; } })()"
BGHOOK = """(()=>{ if(window.__BGH||typeof ADV==='undefined') return; window.__BGH=1; const s=b=>typeof b==='string'?b:JSON.stringify(b||null);
  if(ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ try{ window.__LOG.push({n:'BG',t:'BG:'+s(o&&o.background),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return b0.apply(this,arguments); }; }
  if(ADV.setBg){ const b1=ADV.setBg; ADV.setBg=function(b){ try{ window.__LOG.push({n:'BG',t:'BG:'+s(b),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return b1.apply(this,arguments); }; } })()"""

def played(pick):   # 去了＝第 3、4 節依序（pick：WAIT／KEEP）
    return SEC3 + SEC4A + [NOASK_N] + SEC4B + pick + [CLOSE]
GO_CHK = [('出遊 zr_last_screening：8/26 19:30、「和芷若：公館二輪戲院」、alarm、done', OUTQ, lambda q: bool(q) and q['d'] == '2028-08-26' and abs(q['h'] - 19.5) < 0.01 and q['title'] == '和芷若：公館二輪戲院' and q['alarm'] and q['state'] == 'done')]
SCENS = [
  dict(id='ZL_WAIT', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.0), ('until', 23.2), ('ffloop', '2028-09-01', 21.5)], pref=['出發：和芷若', '「我等妳回來。」'],
       want=played(WAIT) + ['BG:gongguan_cinema'], none=[ASKED_N] + KEEP, order=played(WAIT),
       msgAt={ASK[0]: ('2028-08-24', 21.0, 0.1), ASK[1]: ('2028-08-24', 21.0, 0.1), YES: ('2028-08-24', 21.2, 0.25), N_WAIT[0]: ('2028-08-26', 23.0, 0.1), N_WAIT[1]: ('2028-08-26', 23.0, 0.1), FLY[0]: ('2028-09-01', 21.0, 0.1), FLY[1]: ('2028-09-01', 21.0, 0.1)},
       noneMsg=[NO, LATE, AFTER] + N_KEEP, cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'wait', 'ZR_LAST_GO': True}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': '(空)'},
       jsok=GO_CHK + [('「我等妳回來。」＝和她交往（ROM／dating）', DATING, True), ('房間物件「她的票根」', HASROOM, True)]),
  dict(id='ZL_KEEP', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.0), ('until', 23.2), ('ffloop', '2028-09-01', 21.5)], pref=['出發：和芷若', '「我先收著。」'],
       want=played(KEEP) + ['BG:gongguan_cinema'], none=[ASKED_N] + WAIT, order=played(KEEP),
       msgAt={N_KEEP[0]: ('2028-08-26', 23.0, 0.1), N_KEEP[1]: ('2028-08-26', 23.0, 0.1)}, noneMsg=[NO, LATE, AFTER] + N_WAIT[1:] + FLY,
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'keep', 'ZR_LAST_GO': True}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': '(空)'},
       jsok=GO_CHK + [('「我先收著。」＝沒有交往', DATING, False), ('「我先收著。」＝學期末心意邀約的「讓我想想」（TERMEND think）', THINK, True), ('房間物件「她的票根」', HASROOM, True)]),
  dict(id='ZL_NO', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '那天不行'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 22.5)], pref=[],
       none=SEC3[:1] + SEC4A[:1], msgAt={NO: ('2028-08-24', 21.2, 0.25)}, noneMsg=[YES, LATE, AFTER] + N_WAIT[1:] + N_KEEP[1:],
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'no'}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': None},
       jsok=[('沒有排出遊', OUTQ, None), ('沒有房間物件', HASROOM, False)]),
  dict(id='ZL_NOREPLY', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART,
       steps=[('until', 21.2), ('ffloop', '2028-08-25', 18.5)], pref=[],
       none=SEC3[:1], msgAt={ASK[1]: ('2028-08-24', 21.0, 0.1), NO: ('2028-08-25', 18.0, 0.1)}, noneMsg=[YES, LATE, AFTER],
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'no'}, jsok=[('沒有排出遊', OUTQ, None), ('沒有房間物件', HASROOM, False)]),
  dict(id='ZL_LATE', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 22.2)], pref=['晚一點'],
       none=SEC3[:1] + SEC4A[:1], msgAt={YES: ('2028-08-24', 21.2, 0.25), LATE: ('2028-08-26', 19.75, 0.1), AFTER: ('2028-08-26', 22.0, 0.1)}, noneMsg=N_WAIT[1:] + N_KEEP[1:],
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'missed', 'ZR_LAST_GO': True}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': None},
       jsok=[('出遊沒有 done（答應了沒到）', OUTQ, lambda q: bool(q) and q['state'] != 'done'), ('沒有房間物件', HASROOM, False)]),
  dict(id='ZL_JP', key='2028-08-24', h=20.75, flags=JPF, js=Y4 + JPJS + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.0), ('until', 23.2)], pref=['出發：和芷若', '「我等妳回來。」'],
       want=played(WAIT), order=played(WAIT), msgAt={ASK[0]: ('2028-08-24', 21.0, 0.1), N_WAIT[1]: ('2028-08-26', 23.0, 0.1)},
       cflags=['ZR_LAST'], eqflags={'ZR_LAST': 'wait'}, jsok=GO_CHK + [('交往', DATING, True)]),
  dict(id='ZL_US', key='2028-08-24', h=20.75, zone='us_apartment', flags=USF, js=B['USJS'] + Y4 + HEART + B['BED'],
       steps=[('until', 21.4)], pref=[], noneMsg=ASK, cflags=['ZR_LAST'], eqflags={'ZR_LAST': '(undefined)'}, jsok=[('沒有排出遊', OUTQ, None)]),
  dict(id='ZL_CUP', key='2028-08-24', h=20.75, flags=dict(TWF, ZR_CUP='declined'), js=Y4 + HEART,
       steps=[('until', 21.4)], pref=[], noneMsg=ASK, cflags=['ZR_LAST'], eqflags={'ZR_LAST': '(undefined)'}),
]

def in_order(T, exp):
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None

async def main():
    run = L.Run('zrlast', OUT); base = json.load(open(SAVE, encoding='utf-8')); sha = os.environ.get('SHA', '?')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); B['cdp_g'][0] = cdp
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for sc in SCENS:
            if SCEN and sc['id'] not in SCEN: continue
            say('== %s（%s）' % (sc['id'], sha)); t0 = time.time(); n0 = len(bad)
            B['MID'].update({'n': 0, 'run': run, 'keys': [w[:8] for w in sc.get('want', [])], 'id': sc['id']})
            try:
                await B['load_at'](pg, base, sc, run); await pg.evaluate(BGHOOK)
                cond = await pg.evaluate("(()=>{ try{ return ZRLAST.cond(GAME.G,true); }catch(e){ return 'ERR '+e; } })()")
                say('   【讀資料】讀檔後 ZRLAST.cond：%s' % json.dumps(cond, ensure_ascii=False))
                for st in sc['steps']:
                    if st[0] == 'until': await B['play_until'](pg, cdp, run, st[1], sc)
                    elif st[0] == 'ffloop': await B['ffloop'](pg, cdp, run, sc, st[1], st[2])
                    sn = await pg.evaluate(SNAP); say('   %s → 現在 %s %.2f %s' % (st, sn['key'], sn['h'], sn['zone']))
                await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=120)
                await B['verify'](pg, run, sc)
                lines = (await pg.evaluate("(window.__LOG||[]).map(x=>x.t)"))
                if sc.get('order'):
                    miss = in_order(lines, sc['order'])
                    say('   依序（AA_387 第 3、4 節）：%s' % ('OK' if miss is None else '缺或順序不對：「%s」' % miss))
                    if miss is not None: bad.append('%s：第 3、4 節依序缺「%s」' % (sc['id'], miss))
                for lab, js, want in sc.get('jsok', []):
                    got = await pg.evaluate(js); ok = want(got) if callable(want) else got == want
                    say('   【讀資料】%s：%s → %s' % (lab, json.dumps(got, ensure_ascii=False), 'OK' if ok else 'NG'))
                    if not ok: bad.append('%s：%s（實際 %s）' % (sc['id'], lab, json.dumps(got, ensure_ascii=False)))
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('[%s] %s（這一段新增問題 %d 項，%.0f 秒）' % ('PASS' if len(bad) == n0 else 'FAIL', sc['id'], len(bad) - n0, time.time() - t0))
            json.dump({'results': results, 'bad': bad}, open(os.path.join(OUT, 'zrlast.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('ZRLAST：芷若出國前的最後一場（AA_387 第 9 節）', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
