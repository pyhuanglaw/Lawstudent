"""BB-B 2026-11-08：AA720 補（LAWWW-B 775f8a3d0，head 34f9f5921）抽查——以安送機沒去 3/25 11:40 那則（AA_719 AN-2 after、src/aa720_3d.js AT_FIX y3_an_sendoff_miss）。
  MODE=alone：她的決定 grad＝alone（一個人去）→ 3/25 11:40 只有一則「我上飛機了。」，沒有原本的登機證三則
  MODE=nodec：沒有決定 → 照原本三則「（照片：登機證）」「要登機了。」「到了再傳。」，沒有「我上飛機了。」
[前置／捷徑] 讀使用者存檔 day46 改到 2028-03-25 10:40 公館（過了 10:30，不排送機那一趟＝沒去送機）；【前置】台灣路線、大二／大三搬宿舍拆箱演過；以安的聯絡方式；
【捷徑】G.flags.DECIDE.heroine_01.grad＝{v:'alone'}（決定拍本身 AA_719 另外測過）。等時間用真的遊戲時間，看手機用真的介面。
用法：LW_TESTS=<測試樹>/tests MODE=alone|nodec python3 pt1108c_aa720_anplane_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'alone')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
AN = 'heroine_01'
ORIG = ['（照片：登機證）', '要登機了。', '到了再傳。']
PLANE = '我上飛機了。'


async def main():
    run = L.Run('pt1108c_aa720_anplane_' + MODE, OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        d0 = (await P.day_of(pg, '2028-03-25'))['d']
        fl = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'ROOM_Y2': d0 - 400, 'ROOM_Y3': d0 - 60}
        if MODE == 'alone': fl['DECIDE'] = {AN: {'grad': {'v': 'alone', 'day': d0 - 30}}}
        s, d = await P.base(pg, save, '2028-03-25', 11.25, 'gongguan', flags=fl)
        s.setdefault('home', {})['at'] = False
        s.setdefault('contacts', {}); s['contacts'][AN] = min(s['contacts'].get(AN, d0 - 60), d0 - 60)
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        run.setup('[前置] day46 存檔改到 %s 11:15 公館（過了 10:30，沒排送機）；%s' % (d['key'], J(fl)))
        await P.wait_play(pg, cdp, 11.75, max_s=900, run=run, tag='等到 11:45')
        hh = await pg.evaluate('+GAME.G.hour.toFixed(2)')
        run.check('[前置] 遊戲時間等到 11:45 以後', hh >= 11.7, J(hh))
        th = await P.phone_thread(pg, cdp, 'p:' + AN); txt = th.get('text') or ''
        f = await pg.evaluate("GAME.G.flags.AN_SENDOFF")
        print('[THREAD]', J(txt[-400:])); print('[AN_SENDOFF]', J(f))
        await run.shot(pg, 'thread')
        run.check('記 AN_SENDOFF＝missed（沒去送機）', f == 'missed', J(f))
        if MODE == 'alone':
            run.check('grad＝alone：11:40 只有一則「%s」，沒有原本的「要登機了。」「到了再傳。」' % PLANE, PLANE in txt and not any(t in txt for t in ORIG[1:]), J(txt[-200:]))
        else:
            run.check('沒有決定：照原本三則、沒有「%s」' % PLANE, all(t in txt for t in ORIG) and PLANE not in txt, J(txt[-200:]))
        await L.close_panels(pg, cdp)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
