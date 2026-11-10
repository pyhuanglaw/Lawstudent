"""BB-B 2026-11-08：LAWWW-B c79414b00 兩項抽查。
  MODE=feedexp（UX-FEED-ASK-EXPIRE-1108，9c2b1f51a）：以安動態私訊 an_mom（Y1S1 W10 六 2025-11-08 10:12「我媽昨天看到我寫的『想去的店』。」）
      ① 10:20 收到、最後一則三個回覆鍵、訊息列表有「待回覆」
      ② 同一份進度放到 11/14（6 天）：鍵還在
      ③ 放到 11/16（8 天）：鍵收起來、列表沒有以安的「待回覆」、沒有記 AN_LIST（過期＝跟沒回一樣）
  MODE=anlater（AA720 第三輪 an1_later，1abc2830c）：沒有 AN-1 決定（預設＝later）→ 2027-03-19 21:00 桌遊團群組 Alison「以安要去日本交換了！她自己都不講！」、
      21:20 以安私訊「……你應該已經聽 Alison 說了。」＋三個鍵 → 點第二個她接著回（照稿兩句）
[前置／捷徑] 讀使用者存檔 day46，同一份進度跳到那幾天（P.jump 存快照再讀）；等時間用真的遊戲時間；看手機、回覆用真的介面。
用法：LW_TESTS=<測試樹>/tests MODE=feedexp|anlater python3 pt1108d_feedexp_anlater_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'feedexp')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
AN = 'heroine_01'
MOM = ['我媽昨天看到我寫的「想去的店」。', '七家。她說我一家都還沒去。']
MOM_OPTS = ['那妳寒假去。', '妳媽媽還說什麼？', '（不回）']
PEND = """(()=>{ const G=GAME.G; const ms=(G.msgs||[]).filter(m=>m.th==='p:heroine_01'&&m.text==='七家。她說我一家都還沒去。'); const m=ms[ms.length-1];
  return {has:!!m, ask:!!(m&&m.ask), open:!!(m&&PHONE.askOpen&&PHONE.askOpen(G,m)), until:m&&m.ask?m.ask.until:null, id:m&&m.ask?m.ask.id:null, AN_LIST:G.flags.AN_LIST||null, AN_MOM_DM:G.flags.AN_MOM_DM||null}; })()"""


def an_row(lst):
    rows = [r for r in (lst or '').split('\n') if r.strip()]
    i = next((k for k, r in enumerate(rows) if '沈以安' in r or r.strip() == '以安'), -1)
    return ' / '.join(rows[i:i + 3]) if i >= 0 else ''


async def main():
    run = L.Run('pt1108d_' + MODE, OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        if MODE == 'feedexp':
            s, d = await P.base(pg, save, '2025-11-08', 9.9, 'dorm')
            await P.load(pg, cdp, s, quiet=True); await P.init(pg)
            run.setup('[前置] day46 存檔改到 %s 09:54 宿舍' % d['key'])
            await P.wait_play(pg, cdp, 10.4, max_s=600, run=run, tag='等到 10:24')
            th = await P.phone_thread(pg, cdp, 'p:' + AN); asks = [a['t'] for a in th.get('asks', [])]
            st = await pg.evaluate(PEND); row = an_row(th.get('list'))
            print('[1]', J(asks), J(st), J(row))
            run.check('① 11/8 10:12 收到 an_mom 兩則、三個回覆鍵；列表以安那一列有「待回覆」', all(t in (th.get('text') or '') for t in MOM) and asks[-3:] == MOM_OPTS and '待回覆' in row, J([asks, row, st]))
            await L.close_panels(pg, cdp)
            for key, h, want, tag in (('2025-11-14', 10.5, True, '② 6 天後（11/14）鍵還在'), ('2025-11-16', 10.5, False, '③ 8 天後（11/16）鍵收起來、沒有「待回覆」、沒記 AN_LIST')):
                await P.jump(pg, cdp, run, key, h, zone='dorm', pos=None, note='同一份進度放著不回'); await P.init(pg)
                await pg.wait_for_timeout(3000)
                th = await P.phone_thread(pg, cdp, 'p:' + AN); asks = [a['t'] for a in th.get('asks', []) if not a['dis']]
                st = await pg.evaluate(PEND); row = an_row(th.get('list'))
                print('[%s]' % key, J(asks), J(st), J(row))
                if want: run.check(tag, all(o in asks for o in MOM_OPTS) and st['open'], J([asks, st]))
                else: run.check(tag, not any(o in asks for o in MOM_OPTS) and not st['open'] and '待回覆' not in row and not st['AN_LIST'], J([asks, row, st]))
                await run.shot(pg, 'thread_' + key)
                await L.close_panels(pg, cdp)
        else:
            d0 = (await P.day_of(pg, '2027-03-19'))['d']
            s, d = await P.base(pg, save, '2027-03-19', 20.8, 'gongguan', flags={'ROOM_Y2': d0 - 200})   # 大二搬宿舍拆箱演過（大一存檔跳到大二要補）
            s.setdefault('home', {})['at'] = False
            await P.load(pg, cdp, s, quiet=True); await P.init(pg)
            grp = await pg.evaluate("PHONE.inGroup?PHONE.inGroup(GAME.G,'noodle_team'):null")
            fam = await pg.evaluate("SOCIAL.stage?SOCIAL.stage('heroine_01'):null")
            run.setup('[前置] day46 存檔改到 %s 20:48 公館；在桌遊團群組＝%s；和以安＝%s；沒有 AN-1 決定（預設＝later）' % (d['key'], J(grp), J(fam)))
            data = await pg.evaluate("(()=>{ const B=AA720.data.an1_later; return {g:B.group.msgs.map(x=>Array.isArray(x)?x[1]:x), dm:B.dm.msgs, opts:B.dm.opts.map(o=>({t:o.t,say:o.say})), ng:AA720.cfg.quotes.anLaterNoGroup}; })()")
            await P.wait_play(pg, cdp, 21.45, max_s=900, run=run, tag='等到 21:27')
            hh = await pg.evaluate('+GAME.G.hour.toFixed(2)')
            run.check('[前置] 遊戲時間等到 21:25 以後', hh >= 21.4, J(hh))
            if grp:
                g = await P.phone_thread(pg, cdp, 'g:noodle_team'); print('[GROUP]', J((g.get('text') or '')[-300:]))
                run.check('21:00 桌遊團群組 Alison：%s' % data['g'][0], all(t in (g.get('text') or '') for t in data['g']), J((g.get('text') or '')[-200:]))
            th = await P.phone_thread(pg, cdp, 'p:' + AN); txt = th.get('text') or ''; asks = [a['t'] for a in th.get('asks', []) if not a['dis']]
            first = data['dm'][0] if grp else data['ng']
            print('[DM]', J(txt[-300:]), J(asks))
            run.check('21:20 以安私訊「%s」＋三個回覆鍵' % first, first in txt and asks[-3:] == [o['t'] for o in data['opts']], J([txt[-200:], asks]))
            o = data['opts'][1]
            r = await P.phone_answer(pg, cdp, 'p:' + AN, o['t']); await pg.wait_for_timeout(2000)
            t2 = (await P.phone_thread(pg, cdp, 'p:' + AN)).get('text') or ''
            run.check('點「%s」→ 她接著回（%s）' % (o['t'], '」「'.join(o['say'])), r is not None and all(x in t2 for x in o['say']), J(t2[-200:]))
            await run.shot(pg, 'anlater_after')
            await L.close_panels(pg, cdp)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
