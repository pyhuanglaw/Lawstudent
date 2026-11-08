"""BB-B 2026-11-08：AA720-DECIDE-OPENED-1108（LAWWW-B 43c4030cd，head 6146b9b16）抽查——語彤「自己跟媽媽說」（ev_yt_tell_mom，AA_720 企劃線 4f37a68bb）。
  MODE=live：她的決定拍記了 mom=tell → 2026-04-25（六）14:52 人在溫州街一盞門口，自己點「進去一盞」→ 15:00 那一段照稿（媽媽、兩杯茶）→ 三個選項選一個、她接著回
             → YT_PARENTS_KNOW＝told；同一天 21:30 手機三則（「我媽剛剛打來。」…「……她沒有說不准。」）
  MODE=phone：同一個決定，那天一直在宿舍 → 15:00～16:00 沒有那一段；4/25 21:30 三則照樣來；4/26 21:00 四則（「我跟我媽說了。」…）最後一則有三個回覆鍵、點了她接著回
  MODE=nodec：沒有決定（DECIDE 空）→ 4/25 14:52 進一盞一樣，15:00 以後不演這一段（舊存檔、沒演到決定拍＝照原本）
[前置／捷徑] 讀使用者存檔 day46（已經在一盞認識語彤 YT_MET_JOB；玩家在一盞打工，好幾個月沒排班，進店老闆先問「還要做嗎？」→ 選「（繼續做）」）；【捷徑】G.flags.DECIDE.heroine_03.mom＝{v:'tell'}（決定拍本身 AA_719 另外測過）；
【前置】同一份進度跳到那一天。進店用真的互動鍵，對話選項照玩家點，回覆用手機回覆鍵。
用法：LW_TESTS=<測試樹>/tests MODE=live|phone|nodec python3 pt1108b_aa720_yt_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'live')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
YT = 'heroine_03'
EV = """(()=>{ const E=AA720.data.events.ev_yt_tell_mom; return {scene:E.live.scene.map(t=>Array.isArray(t)?t[1]:t), opts:E.live.opts, night:E.night.msgs, phone:E.phone.msgs, popts:E.phone.opts}; })()"""
ST = """(()=>{ const G=GAME.G, f=G.flags; return {zone:G.zone, h:+G.hour.toFixed(2), day:G.day, told:f.YT_PARENTS_KNOW, rec:(f.AA720||{}).ev_yt_tell_mom||null, dec:((f.DECIDE||{}).heroine_03||{}).mom||null}; })()"""


async def main():
    run = L.Run('pt1108b_aa720_yt_' + MODE, OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        E = await pg.evaluate(EV)
        d0 = (await P.day_of(pg, '2026-04-25'))['d']
        fl = {} if MODE == 'nodec' else {'DECIDE': {YT: {'mom': {'v': 'tell', 'day': d0 - 21}}}}
        zone, pos, h0 = ('dorm', None, 14.85) if MODE == 'phone' else ('wenzhou', {'x': -20.5, 'z': 5.2}, 14.87)
        s, d = await P.base(pg, save, '2026-04-25', h0, zone, pos=pos, flags=fl)
        s.setdefault('home', {})['at'] = False
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        run.setup('[前置] day46 存檔改到 %s %.2f 時 %s；【捷徑】%s' % (d['key'], h0, zone, J(fl) if fl else '沒有決定（DECIDE 空）'))
        n0 = await P.say_hook(pg)
        if MODE in ('live', 'nodec'):
            it = await L.find_it(pg, '進去一盞'); print('[DOOR]', J(it))
            if it: await L.go_to(pg, cdp, run, it['x'], it['z'], 1.0, '一盞門口', max_s=240)
            st = await L.state(pg); print('[AT]', J(st))
            ok = await L.tap(pg, cdp, '#interact')
            for _ in range(60):
                if await pg.evaluate("GAME.G.zone==='wz_teahouse'"): break
                await pg.wait_for_timeout(500)
            run.check('點「進去一盞」進到一盞茶屋（wz_teahouse）', await pg.evaluate("GAME.G.zone==='wz_teahouse'"), J(await pg.evaluate(ST)))
            # day46 存檔的玩家在一盞打工、好幾個月沒排班：一進店老闆先問「還要做嗎？」（jobs3d.js ask3）——選「（繼續做）」，等到 15:00 以後
            await P.wait_play(pg, cdp, 15.05, max_s=480, picks=('（繼續做）',), run=run, tag='進店到 15:00')
            pick = (E['opts'][0]['t'], '（繼續做）') if MODE == 'live' else ('（繼續做）',)
            dl = await P.dialog(pg, cdp, run, picks=pick, max_s=480, start_s=150, idle_s=10, tag='yt_live')
            await run.shot(pg, 'after')
            lines = [t for _, t in (dl or {}).get('lines', [])] + [t for _, t in await P.said(pg, n0)]
            st = await pg.evaluate(ST); print('[LINES]', J(lines, 3000)); print('[ST]', J(st))
            if MODE == 'live':
                miss = [t for t in E['scene'] if not any(t in x for x in lines)]
                run.check('15:00 那一段照稿（%d 句都有：媽媽來、兩杯茶、「她喝了兩杯。」）' % len(E['scene']), not miss, J(miss))
                say = E['opts'][0]['say']
                run.check('選「%s」→ 她接著回（%s）' % (E['opts'][0]['t'], '」「'.join(say)), all(any(t in x for x in lines) for t in say), J(lines[-6:]))
                run.check('記 YT_PARENTS_KNOW＝told、AA720.ev_yt_tell_mom.live＝那一天', st['told'] == 'told' and (st['rec'] or {}).get('live') == d0, J(st))
                await P.jump(pg, cdp, run, '2026-04-25', 21.2, zone='dorm', pos=None, note='同一天晚上回宿舍'); await P.init(pg)
            else:
                run.check('沒有決定：15:00 以後不演這一段（沒有「媽。這邊。」、沒有 AA720 紀錄）', not any('媽。這邊。' in x for x in lines) and not st['rec'], J([lines[:4], st]))
                run.check('沒有 JS 例外', not errs, J(errs[:5])); await b.close(); return run.finish()
        else:
            await P.wait_hour(pg, cdp, 15.4, max_s=420)
            lines = [t for _, t in await P.said(pg, n0)]
            run.check('人在宿舍：15:00 以後沒有那一段', not any('媽。這邊。' in x for x in lines), J(lines[:5]))
            await P.jump(pg, cdp, run, '2026-04-25', 21.2, zone='dorm', pos=None, note='同一天晚上'); await P.init(pg)
        await P.wait_hour(pg, cdp, 21.6, max_s=600)
        th = await P.phone_thread(pg, cdp, 'p:' + YT); txt = th.get('text') or ''
        print('[NIGHT]', J(txt[-400:]))
        run.check('4/25 21:30 手機三則：%s' % '／'.join(E['night']), all(m in txt for m in E['night']), J(txt[-300:]))
        await L.close_panels(pg, cdp)
        if MODE == 'phone':
            await P.jump(pg, cdp, run, '2026-04-26', 20.75, zone='dorm', pos=None, note='隔天晚上'); await P.init(pg)
            await P.wait_hour(pg, cdp, 21.15, max_s=600)
            th = await P.phone_thread(pg, cdp, 'p:' + YT); txt = th.get('text') or ''; asks = [a['t'] for a in th.get('asks', [])]
            print('[PHONE]', J(txt[-400:]), J(asks))
            run.check('4/26 21:00 四則：%s' % '／'.join(E['phone']), all(m in txt for m in E['phone']), J(txt[-300:]))
            want = [o['t'] for o in E['popts']]
            run.check('最後一則三個回覆鍵：%s' % '／'.join(want), asks == want, J(asks))
            r0 = await pg.evaluate("id=>Object.assign({},SOCIAL.rel(id))", YT)
            r = await P.phone_answer(pg, cdp, 'p:' + YT, want[2]); await pg.wait_for_timeout(2000)
            th2 = await P.phone_thread(pg, cdp, 'p:' + YT); t2 = th2.get('text') or ''
            r1 = await pg.evaluate("id=>Object.assign({},SOCIAL.rel(id))", YT)
            say = E['popts'][2]['say']; rel = E['popts'][2]['rel']
            run.check('點「%s」→ 她接著回（%s）' % (want[2], '」「'.join(say)), r is not None and all(x in t2 for x in say), J(t2[-300:]))
            run.check('好感照選項加（%s）' % J(rel), all((r1.get(k, 0) - r0.get(k, 0)) == v for k, v in rel.items()), J({k: r1.get(k, 0) - r0.get(k, 0) for k in rel}))
            await L.close_panels(pg, cdp)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
