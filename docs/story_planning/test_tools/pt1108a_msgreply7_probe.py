"""BB-B 2026-11-08：AA_709 第七批（LAWWW-B df95b5042，企劃線 5c8664179）瀏覽器抽查——大三下臺灣路線的「分享生活」訊息有沒有掛回覆選項、按得下去。
  MODE=xc：2028-05-23（大三下第 14 週）21:10 芯慈「併購的期末報告，我做了十二張表。」「全部對起來了。」→ 三個回覆鍵 → 點第一個 → 她接著回、好感照選項加
  MODE=an：2028-04-04（大三下第 7 週）21:40 以安「📷（便利商店一整排飯糰）」「三十種。……我已經重複了。」→ 同上
  MODE=an_early：2028-03-14（大三下第 4 週，以安 3/25 才出國）：以安的飯糰、Alison 代主持都不會來（改第 6 週起）
[前置／捷徑] 讀使用者存檔 day46 改到那一天 20:30 公館；【前置】旗標 EXCHANGE_ROUTE＝TW、ROOM_Y2／ROOM_Y3（大二、大三拆箱已演過）、
那個人的聯絡方式（contacts）前一天以前就有；【捷徑】每天手機小事的輪替位置（flags.dpLast）設在那一則的前一則，讓今天輪到它（輪替本身 Node 測過：aa555_walk_unit）。
等時間用真的遊戲時間，回覆用手機訊息的回覆鍵（真的介面）。
以安 21:40 才傳：從 21:15 開始等（20:30 開始，雲端 SwiftShader 等 10 分鐘只走到 21:20，第一次跑就是這樣 FAIL 的）。
用法：LW_TESTS=<測試樹>/tests MODE=xc|an|an_early python3 pt1108a_msgreply7_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'xc')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
CASES = {
    'xc': dict(who='classmate_xinci', dp='a118_y3s2_xc_tables', date='2028-05-23', h0=20.5, wait=21.5,
               msgs=['併購的期末報告，我做了十二張表。', '全部對起來了。'], opts=['十二張都對起來，很爽吧。', '哪一張最難？', '恭喜。']),
    'an': dict(who='heroine_01', dp='a118_y3s2_an_onigiri', date='2028-04-04', h0=21.25, wait=21.9,
               msgs=['📷（便利商店一整排飯糰）', '三十種。我說每天吃一種，一個月不重複。……我已經重複了。'], opts=['今天吃哪一種？', '鮭魚對吧。', '拍妳最喜歡的那個給我看。']),
}
CASES['an_early'] = dict(CASES['an'], date='2028-03-14')


async def main():
    c = CASES[MODE]
    run = L.Run('pt1108a_msgreply7_' + MODE, OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        d0 = (await P.day_of(pg, c['date']))['d']
        fl = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'ROOM_Y2': d0 - 400, 'ROOM_Y3': d0 - 60}
        s, d = await P.base(pg, save, c['date'], c['h0'], 'gongguan', flags=fl)
        s.setdefault('home', {})['at'] = False
        s.setdefault('contacts', {}); s['contacts'][c['who']] = min(s['contacts'].get(c['who'], d0 - 30), d0 - 30)
        F = s['flags']
        for k in ('dpPick', 'dpDay'): F.pop(k, None)
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        ids = await pg.evaluate("(STORY.DAILY_PHONE||[]).map(x=>x.id)")
        pre = [c['dp'], 'a118_y3s2_an_group'] if MODE == 'an_early' else [c['dp']]
        k = ids.index(c['dp']) if c['dp'] in ids else -1
        run.check('[前置] 這一則在每天手機小事的池裡（%s）' % c['dp'], k >= 0, J([k, len(ids)]))
        r = await pg.evaluate("""([prev,ids])=>{ const F=GAME.G.flags; F.dpLast=prev; F.dpPick=null; F.dpDay=null; const N=F.dpN||(F.dpN={}), L=F.dpDayOf||(F.dpDayOf={}); for(const id of ids){ delete N[id]; delete L[id]; } return {dpLast:F.dpLast, day:GAME.G.day, h:GAME.G.hour}; }""", [ids[k - 1] if k > 0 else ids[-1], pre])
        run.setup('[前置] day46 存檔改到 %s %.2f 時公館；%s；%s 的聯絡方式在前一天以前' % (d['key'], c['h0'], J(fl), c['who']))
        run.setup('【捷徑】手機小事輪替位置 dpLast＝前一則（%s），今天輪到 %s' % (r['dpLast'], c['dp']))
        await P.wait_hour(pg, cdp, c['wait'], max_s=900)
        hh = await pg.evaluate('+GAME.G.hour.toFixed(2)')
        run.check('[前置] 遊戲時間等到 %.2f 以後（她傳訊息的時間之後）' % c['wait'], hh >= c['wait'] - 0.05, hh)
        th = await P.phone_thread(pg, cdp, 'p:' + c['who'])
        txt = th.get('text') or ''; asks = [a['t'] for a in th.get('asks', [])]
        print('[THREAD]', J(txt[-500:], 700)); print('[ASKS]', J(asks))
        await run.shot(pg, 'thread_before')
        if MODE == 'an_early':
            got = await pg.evaluate("(()=>{ const q=PHONE.rec(GAME.G); const all=JSON.stringify(q); return {oni:all.includes('一整排飯糰'), grp:all.includes('Alison 今天主持讀書會')}; })()")
            run.check('3/14（大三下第 4 週）以安的飯糰、Alison 代主持都沒有來（她 3/25 才出國）', not got['oni'] and not got['grp'] and '一整排飯糰' not in txt, J(got))
        else:
            run.check('%s 收到「%s」' % (d['key'], '」「'.join(c['msgs'])), th['ok'] and all(m in txt for m in c['msgs']), J(txt[-300:]))
            run.check('最後一則掛三個回覆鍵（AA_709）：%s' % '／'.join(c['opts']), asks == c['opts'], J(asks))
            rel0 = await pg.evaluate("id=>Object.assign({},SOCIAL.rel(id))", c['who'])
            o0 = await pg.evaluate("([id,t])=>{ const L=(MSG_REPLIES.people||{})[id]||[]; const e=L.find(x=>x.text===t); return e?e.opts[0]:null; }", [c['who'], c['msgs'][-1]])
            r2 = await P.phone_answer(pg, cdp, 'p:' + c['who'], c['opts'][0])
            await pg.wait_for_timeout(2500)
            th2 = await P.phone_thread(pg, cdp, 'p:' + c['who'])
            t2 = th2.get('text') or ''; asks2 = [a['t'] for a in th2.get('asks', []) if not a['dis']]
            rel1 = await pg.evaluate("id=>Object.assign({},SOCIAL.rel(id))", c['who'])
            print('[AFTER]', J(t2[-500:], 700)); print('[REL]', J(rel0), J(rel1)); print('[OPT]', J(o0))
            await run.shot(pg, 'thread_after')
            say = (o0 or {}).get('say') or []
            run.check('點「%s」：祐廷那一句貼上去、她接著回（%s）' % (c['opts'][0], '」「'.join(say)), r2 is not None and c['opts'][0] in t2 and say and all(x in t2 for x in say), J(t2[-300:]))
            rd = {k: rel1.get(k, 0) - rel0.get(k, 0) for k in (o0 or {}).get('rel', {})}
            run.check('好感照選項加（%s）' % J((o0 or {}).get('rel')), o0 and all(rd[k] == v for k, v in o0['rel'].items()), J(rd))
            run.check('回過以後回覆鍵收起來', not any(a in c['opts'] for a in asks2), J(asks2))
        await L.close_panels(pg, cdp)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
