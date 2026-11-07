"""BB-B 2026-11-07：AA_667 第 7 節 7-1（LAWWW-B 0db863a84＋de9131f95，測 9c0120628）瀏覽器抽查——子晴 3/23「住家裡」版。
日本路線、和以安＋子晴同時交往、2/20 已退宿（住家裡）：
  ① 3/23 22:30 子晴三則「你在家嗎」「我在你家附近那間便利商店」「五分鐘」，回法「下去。」（22:27 還沒有）
  ② 回「下去。」→ 出發 → 地點字幕「家附近的便利商店門口」、2D 深色；開頭旁白「（她站在便利商店門口，手上拎著一個袋子。）」；
     「坐捷運過來的。……不是順路。」，沒有「剛從系館出來。順路。」；記 ZQ_JP_BYE
[前置／捷徑] 讀使用者存檔 day46（大一的進度）改到 2028-03-23 21:00 公館；【捷徑】旗標 EXCHANGE_ROUTE＝JP、EXCH_RULE、dating_heroine_01／04、X1_JP＝2/20；
條件事件關（只看這一場）。MODE=out：人留在公館；MODE=home：手機「地點」最上面的「回家」（真的介面）、在家選「睡覺」，回覆用手機訊息的回覆鍵，出發和對話選項照玩家點。
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
MODE = os.environ.get('MODE', 'out')   # out＝人留在公館走真實流程；home＝回家、在家選「睡覺」看會不會停在 22:30
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
        fl = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'dating_heroine_01': True, 'dating_heroine_04': True, 'X1_JP': x1, 'ROOM_Y2': x1 - 500, 'ROOM_Y3': x1 - 150}   # ROOM_Y2／Y3＝大二、大三搬宿舍拆箱已經演過（大一存檔跳到 2028 才要補；LAWWW-B 19:47）
        s, d = await P.base(pg, save, '2028-03-23', 21.0, 'gongguan', flags=fl)
        s.setdefault('home', {})['at'] = False
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        run.setup('[前置] day46 存檔改到 %s 21:00 公館；【捷徑】%s；條件事件關' % (d['key'], J(fl)))
        mo = await pg.evaluate("typeof JP!=='undefined'&&JP.movedOut?!!JP.movedOut(GAME.G):null")
        run.check('[前置] 日本路線 2/20 退宿＝住家裡（JP.movedOut）', mo is True, J(mo))
        if MODE == 'home':
            # 手機「回家」→ 在家選單 → 「睡覺」：7e7cbab9f 起 22:30 子晴的三則會把人叫醒（HOME.WAKE「手機響了。」），醒來先打開手機
            await P.phone_tab(pg, cdp, 'places')
            ok = await L.tap(pg, cdp, '#phoneBody [data-gohome]')
            for _ in range(60):
                if await pg.evaluate("!!(GAME.G.home&&GAME.G.home.at)"): break
                await pg.wait_for_timeout(500)
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(2500)
            st = await P.ts(pg); said_home = []
            for _ in range(30):   # 回家的旁白先點掉，選單才出來
                st = await P.ts(pg)
                if st['ch']: break
                if st['dlg']:
                    said_home.append(st['txt']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800); continue
                await pg.wait_for_timeout(800)
            menu = [c['t'] for c in st['ch']]
            print('[HOME SAY]', J(said_home)); print('[HOME MENU]', J(menu))
            run.check('手機「回家」→ 在家選單有「睡覺」（沒有補演大二拆箱）', bool(ok) and any(t.startswith('睡覺') for t in menu) and not any('床桌' in t for t in said_home), J([said_home, menu]))
            run.check('在家選單有「在家休息一下」（21:30 可以休息到 22:30）', any('休息' in t for t in menu), J(menu))
            await pg.evaluate(CAP); n0 = await P.say_hook(pg)
            k = next((i for i, c in enumerate(st['ch']) if c['t'].startswith('睡覺')), None)
            await P.tap_choice(pg, cdp, k if k is not None else 0)
            tl = []; woke = None
            for _ in range(120):
                c = await P.clock(pg); s1 = await P.ts(pg); tl.append([c['key'], c['h'], s1['phone'], s1['txt'][:20], [x['t'][:8] for x in s1['ch']][:4]])
                if s1['phone'] or (c['key'] != '2028-03-23'): woke = [c, s1]; break
                if s1['dlg']:
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                if s1['ch'] and c['h'] > 22.0: woke = [c, s1]; break
                await pg.wait_for_timeout(1000)
            print('[SLEEP TL]', J(tl, 3000))
            await run.shot(pg, 'zq_home_wake')
            wk = woke[0] if woke else None
            heard = any('手機響了' in (x[3] or '') for x in tl)
            run.check('在家睡覺：3/23 22:30 被手機叫醒（同一天、22:30～23:00；「手機響了。」）', bool(wk) and wk['key'] == '2028-03-23' and 22.45 <= wk['h'] < 23.0, J([wk, heard, tl[-4:]]))
            th = await P.phone_thread(pg, cdp, 'p:' + ZQ); txt = (th or {}).get('text') or ''
            print('[THREAD]', J(th))
            run.check('醒來：子晴三則、回覆鍵「下去。」還能按', all(m in txt for m in DM) and any('下去' in (a.get('t') if isinstance(a, dict) else a) for a in ((th or {}).get('asks') or [])), J(th))
            r = await P.phone_answer(pg, cdp, 'p:' + ZQ, '下去')
            run.check('回覆「下去。」', r is not None, J(r))
            await L.close_panels(pg, cdp)
        else:
            await pg.evaluate(CAP); n0 = await P.say_hook(pg)
            run.setup('人留在公館（不回家）：子晴的三則照日期時間來、和人在哪裡無關（aa667_3d.js:210）')
            await P.wait_hour(pg, cdp, 22.6, max_s=900)
            th = await P.phone_thread(pg, cdp, 'p:' + ZQ)
            txt = th.get('text') if th else ''
            print('[THREAD]', J(th))
            run.check('① 子晴三則「你在家嗎」「我在你家附近那間便利商店」「五分鐘」、回覆鍵「下去。」', bool(th) and all(m in (txt or '') for m in DM) and any('下去' in (a.get('t') if isinstance(a, dict) else a) for a in (th.get('asks') or [])), J(th))
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
        if os.environ.get('NEWBACK'):
            locs = W.get('loc', [])
            if MODE == 'home': run.check('③ 從家裡出發：演完不說「回到首都帝大。」（照舊不出字、回家選單接著）', '回到首都帝大。' not in locs, J(locs))
            else: run.check('③ 演完回程字幕「回到家。」、不是「回到首都帝大。」（日本路線住家裡）', '回到家。' in locs and '回到首都帝大。' not in locs, J(locs))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
