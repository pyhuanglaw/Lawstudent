"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 4 項）：AA_515 交往中約會後的手機動態——照玩家用手機約她、睡覺、跳過時間、出發、約會裡選互動點、回來，等到她平常貼的時間，打開手機「動態」看（不是 Node）。
約會的操作照 date_bugs_probe.py（FARE 那一段：淡水金色水岸 D13 明天 15:00，捷運；飲料攤 → 差不多了，回去吧），那個檔「情境」以前的工具直接拿來用（exec）。
MODE（環境變數）：
  an  【前置】使用者存檔 → 2026-03-27（五）20:00 宿舍；【捷徑】和以安交往中（第 6 階＋ROM.start），其他人都不是交往中 → 約以安 3/28 淡水 →
      當晚 21:30 動態頁有她一則：照片「河邊欄杆上兩杯飲料，旁邊是你的手肘」、她的一句是第 1 句「手帳上劃掉一個。」（AA_515 第 1～3 節、第 5 節第 1 項）
  zq  同上，和子晴交往中 → 回宿舍睡到明天，起床打開手機：動態頁有她隔天 00:30 一則（第 1 節的時間）、她的一句沒有句號（第 5 節最後一項）
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=an python3 aa515_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
H = {'__file__': os.path.join(HERE, 'date_bugs_probe.py'), '__name__': 'date_bugs_helpers'}
_src = open(os.path.join(HERE, 'date_bugs_probe.py'), encoding='utf-8').read()
exec(compile(_src.split('# ---------------------------------------------------------------- 情境')[0], 'date_bugs_probe.py', 'exec'), H)   # 工具的部分（launch、date_to_when、pick_day_time、sleep_night、skip、wait_for、drive…）
L = H['L']; import bbplay as P
from playwright.async_api import async_playwright
OUT, SAVEF = sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'an')
J = lambda o: json.dumps(o, ensure_ascii=False)
WHO = {'an': 'heroine_01', 'zq': 'heroine_04'}[MODE]
PHOTO = '河邊欄杆上兩杯飲料，旁邊是你的手肘'
REL = {'fam': 70, 'trust': 55, 'comf': 50, 'npcRom': 70, 'rom': 60}


async def main():
    run = L.Run('aa515_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, pg, cdp, errs, r = await H['launch'](p, run, SAVE, '2026-03-27', 20.0, 'dorm', {WHO: REL}, label=MODE)
        rs = await pg.evaluate("""(id=>{ const G=GAME.G; try{ ROM.start(G,id); }catch(e){} G.flags['dating_'+id]=true; return {partners:ROM.partners?ROM.partners(G):null, dating:!!G.flags['dating_'+id], feed:(FEED.rec(G).items||[]).filter(i=>String(i.id||'').startsWith('dt_')).length}; })(%s)""" % J(WHO))
        run.setup('【捷徑】和 %s 交往中（ROM.start）：%s' % (WHO, J(rs)))
        run.check('前置：和她交往中、還沒有約會動態', bool(rs['dating']) and rs['feed'] == 0, J(rs))
        await P.init(pg)
        await H['drive'](pg, cdp, run, max_s=30, label=MODE)
        rr = await H['date_to_when'](pg, cdp, WHO, 'D13', label=MODE)
        run.check('手機約她 → 去校外… → 淡水金色水岸', bool(rr.get('ok')), J(rr)[:400])
        if rr.get('ok'):
            times, pk, o = await H['pick_day_time'](pg, cdp, '明天', '15:00', MODE)
            sm = await H['wait_dlg'](pg, '預計花費', 20)
            if sm: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
            await H['pick'](pg, cdp, '就這樣約', MODE); await H['close_flow'](pg, cdp, MODE)
            T = await pg.evaluate(H['TRIPS']); t = next((x for x in T if x['locs'] == ['D13'] and x['status'] == 'booked'), None)
            run.check('約好了：3/28 15:00 淡水', bool(t), J(T))
            o, slept = await H['sleep_night'](pg, cdp, run, MODE)
            await H['skip'](pg, cdp, '等到傍晚', MODE)
            ok, ch = await H['wait_for'](pg, cdp, run, "(()=>{ const ch=document.getElementById('choices'); return !!ch&&!ch.classList.contains('hide')&&[...ch.querySelectorAll('button')].some(b=>/^(現在)?出發/.test(b.textContent.trim())); })()", max_s=300, label=MODE)   # 跳過時間跳到出發前一點，遊戲問「現在出發／到時間再說」（BB-B 10-30：舊版只認「出發」，wait_for 自己選了「現在出發」把整趟約會走掉）
            run.check('時間到了有「出發」', ok, J(await pg.evaluate(H['STATE'])))
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            go = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(b=>/^(現在)?出發/.test(b.textContent.trim())); return b?b.textContent.trim():null; })()")
            await H['pick'](pg, cdp, (go or '出發')[:4], MODE)
            ok2, ch2 = await H['wait_for'](pg, cdp, run, "(()=>{ const t=(GAME.G.trips||[]).find(x=>(x.locs||[])[0]==='D13'); return !!t&&t.status==='done'&&(window.__LOG||[]).slice(%d).some(x=>x.n==='［字幕］'&&x.t.indexOf('回到台大')>=0); })()" % n0,
                                           max_s=600, picks=['飲料攤', '差不多了，回去吧', '（今天先不說）'], label=MODE)
            await H['drive'](pg, cdp, run, picks=['（今天先不說）'], max_s=60, label=MODE)
            run.check('淡水走完、回到台大', ok2, J(await pg.evaluate(H['STATE'])))
            await run.shot(pg, 'back')
            q = await pg.evaluate("(id=>(FEED.rec(GAME.G).items||[]).filter(i=>String(i.id||'').startsWith('dt_')).map(i=>({id:i.id,who:i.who,day:CALENDAR.dateOf(i.day).key,h:i.h,pic:i.pic||i.photo||null,text:i.text==null?null:i.text})))(%s)" % J(WHO))
            run.note('回來時排好的約會動態：%s' % J(q))
            target_h = 21.55 if MODE == 'an' else 24.6
            if target_h < 24:   # 以安 21:30（BB-B 10-30 10:30）：站著等 900 秒只走到 19:10（工具）。照玩家：手機「跳過時間」→ 等到晚上（20:00），再等到 21:33
                await H['skip'](pg, cdp, '等到晚上', MODE); run.note('跳過時間「等到晚上」→ %s' % J(await pg.evaluate(H['STATE'])))
                got = await P.wait_play(pg, cdp, target_h, max_s=1800)
                run.check('前置：等到 21:33（她貼的時間以後）', got, J(await pg.evaluate(H['STATE'])))
            else:   # 子晴 00:30（BB-B 10-30 10:13）：站著等，沙盒 25 分鐘只走到 20:13（工具）。照玩家：回宿舍睡到明天，起床打開手機看動態
                await P.wait_play(pg, cdp, 17.55, max_s=400)   # 17:30 以前床只有小睡、睡到傍晚（story3d.js bedOptions 的 night＝17:30 起）
                o, slept = await H['sleep_night'](pg, cdp, run, MODE)
                run.note('睡到明天：%s；現在 %s' % (J(o and [x['t'] for x in o]), J(await pg.evaluate(H['STATE']))))
                run.check('前置：回宿舍睡到明天（00:30 那一則在睡覺的時候）', bool(slept), J(o and [x['t'] for x in o]))
            body = await P.phone_tab(pg, cdp, 'feed'); await run.shot(pg, 'feed')
            await L.phone_away(pg, cdp)
            q2 = await pg.evaluate("(id=>(FEED.visible(GAME.G)||[]).filter(i=>String(i.id||'').startsWith('dt_')).map(i=>({id:i.id,who:i.who,day:CALENDAR.dateOf(i.day).key,h:i.h,pic:i.pic||i.photo||null,text:i.text==null?null:i.text})))(%s)" % J(WHO))
            run.note('%s 動態頁：%s；看得到的約會動態 %s' % (J(await pg.evaluate(H['STATE'])), J(body[:600]), J(q2)))
            mine = [x for x in q2 if x['who'] == WHO]
            run.check('第 1 節：約會那一晚她貼了一則約會動態（%s）' % ('21:30' if MODE == 'an' else '隔天 00:30'), len(mine) == 1, J(q2))
            run.check('第 2 節：照片照 D13 那一列「%s」（動態頁看得到）' % PHOTO, PHOTO in body, J(body[:600]))
            if mine:
                x = mine[0]
                run.check('第 1 節：貼的時間＝%s' % ('21:30' if MODE == 'an' else '00:30'), abs((x['h'] or 0) - (21.5 if MODE == 'an' else 0.5)) < 0.02 or abs((x['h'] or 0) - 24.5) < 0.02, J(x))
                if MODE == 'an': run.check('第 3-1 節：以安的一句是第 1 句「手帳上劃掉一個。」', '手帳上劃掉一個。' in body, J(body[:600]))
                else: run.check('第 3-4 節：子晴的一句沒有句號', bool(x['text']) and '。' not in x['text'], J(x))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await H['close'](b)
    sys.exit(run.finish())
asyncio.run(main())
