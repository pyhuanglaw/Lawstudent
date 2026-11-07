"""BB-B 2026-11-07：AA_667 第 7 節 7-1（LAWWW-B 0db863a84＋de9131f95，測 9c0120628）瀏覽器抽查——子晴 3/23「住家裡」版。
日本路線、和以安＋子晴同時交往、2/20 已退宿（住家裡）：
  ① 3/23 22:30 子晴三則「你在家嗎」「我在你家附近那間便利商店」「五分鐘」，回法「下去。」（22:27 還沒有）
  ② 回「下去。」→ 出發 → 地點字幕「家附近的便利商店門口」、2D 深色；開頭旁白「（她站在便利商店門口，手上拎著一個袋子。）」；
     「坐捷運過來的。……不是順路。」，沒有「剛從系館出來。順路。」；記 ZQ_JP_BYE
[前置／捷徑] 讀使用者存檔 day46（大一的進度）改到 2028-03-23 21:00 公館；【捷徑】旗標 EXCHANGE_ROUTE＝JP、EXCH_RULE、dating_heroine_01／04、X1_JP＝2/20；
條件事件關（只看這一場）。回家用手機「地點」最上面的「回家」（真的介面），回覆用手機訊息的回覆鍵，出發和對話選項照玩家點。
用法：LW_TESTS=<測試樹>/tests python3 pt1107r_zq_home_bye_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
ZQ = 'heroine_04'
DM = ['你在家嗎', '我在你家附近那間便利商店', '五分鐘']
OPEN = '（她站在便利商店門口，手上拎著一個袋子。）'
SWAP = ('坐捷運過來的。……不是順路。', '剛從系館出來。順路。')
CAP = """(()=>{ const W=window.__ZQC=window.__ZQC||{loc:[],bg:[]}; const el=document.getElementById('caption'); if(el&&!W.ob){ W.ob=new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&W.loc[W.loc.length-1]!==t) W.loc.push(t); }); W.ob.observe(el,{childList:true,subtree:true,characterData:true}); }
  if(!W.t){ W.t=setInterval(()=>{ try{ const b=typeof ADV!=='undefined'?ADV.bgMode:null; if(b&&W.bg[W.bg.length-1]!==b) W.bg.push(b); }catch(e){} },300); } return true; })()"""


async def main():
    run = L.Run('pt1107r_zq_home_bye', OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        x1 = (await P.day_of(pg, '2028-02-20'))['d']
        fl = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'dating_heroine_01': True, 'dating_heroine_04': True, 'X1_JP': x1}
        s, d = await P.base(pg, save, '2028-03-23', 21.0, 'gongguan', flags=fl)
        s.setdefault('home', {})['at'] = False
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        run.setup('[前置] day46 存檔改到 %s 21:00 公館；【捷徑】%s；條件事件關' % (d['key'], J(fl)))
        mo = await pg.evaluate("typeof JP!=='undefined'&&JP.movedOut?!!JP.movedOut(GAME.G):null")
        run.check('[前置] 日本路線 2/20 退宿＝住家裡（JP.movedOut）', mo is True, J(mo))
        # 回家（手機「地點」最上面）
        await P.phone_tab(pg, cdp, 'places')
        ok = await L.tap(pg, cdp, '#phoneBody [data-gohome]')
        for _ in range(60):
            if await pg.evaluate("!!(GAME.G.home&&GAME.G.home.at)"): break
            await pg.wait_for_timeout(500)
        await L.close_panels(pg, cdp)
        at = await pg.evaluate("({at:!!(GAME.G.home&&GAME.G.home.at),h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone})")
        run.check('手機「回家」→ 在家', bool(ok) and at['at'], J(at))
        await pg.evaluate(CAP); n0 = await P.say_hook(pg)
        # ① 22:27 還沒有、22:30 三則
        await P.wait_hour(pg, cdp, 22.6, max_s=900)
        th = await P.phone_thread(pg, cdp, 'p:' + ZQ)
        txt = th.get('text') if th else ''
        print('[THREAD]', J(th))
        run.check('① 子晴三則「你在家嗎」「我在你家附近那間便利商店」「五分鐘」、回覆鍵「下去。」', bool(th) and all(m in (txt or '') for m in DM) and any('下去' in a for a in (th.get('asks') or [])), J(th))
        r = await P.phone_answer(pg, cdp, 'p:' + ZQ, '下去')
        run.check('回覆「下去。」', r is not None, J(r))
        await L.close_panels(pg, cdp)
        # ② 出發 → 那一場
        dl = await P.dialog(pg, cdp, run, picks=('出發', '「行李箱塞不下吧。」'), max_s=420, start_s=60, idle_s=6, tag='zq_home')
        await run.shot(pg, 'zq_home_after')
        s2 = await P.said(pg, n0)
        lines = [t for _, t in (dl or {}).get('lines', [])] + [t for _, t in s2]
        W = await pg.evaluate("window.__ZQC||{}")
        flg = await pg.evaluate("GAME.G.flags.ZQ_JP_BYE")
        print('[LINES]', J(lines, 3000)); print('[CAP]', J(W)); print('[FLAG]', flg, 'day', d['d'])
        run.check('② 地點字幕「家附近的便利商店門口」', any('家附近的便利商店門口' in c for c in W.get('loc', [])), J(W.get('loc')))
        run.check('② 2D 深色（ADV.bgMode 出現 dark）', 'dark' in (W.get('bg') or []), J(W.get('bg')))
        run.check('② 開頭旁白「%s」' % OPEN, any(OPEN in t for t in lines), J(lines[:6]))
        run.check('② 有「%s」、沒有「%s」' % SWAP, any(SWAP[0] in t for t in lines) and not any(SWAP[1] in t for t in lines), J(lines, 1500))
        run.check('② 記 ZQ_JP_BYE＝3/23', flg == d['d'], J(flg))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
