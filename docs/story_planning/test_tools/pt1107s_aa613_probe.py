"""BB-B 2026-11-07：AA613-OPENING-ACTS-1103（LAWWW-B 5becbf4e8，測 82c6d4771）第 1～3 項瀏覽器驗收（4～9 給 CC-B）。
  MODE=yes（第 1、2 項）：
    ① 9/5 21:00 阿哲私訊兩則＋回覆鍵「好。」／「我晚點自己去。」；21:10 第七小隊群組 芯慈、沛珊各一則
    ② 回「好。」→ 9/6 10:00 以後走到晨思鐘阿哲旁邊（4.5 m）→ 那一段（「（10:00，晨思鐘。……）」）→ 一起走到系籃攤位 →「我也寫。」→ 阿哲「好欸。」
       → CLUB_dept_basketball、AA613_BELL_MET；一起走過去不卡（GAME.walkFallbacks＝0）
  MODE=noshow（第 3 項）：回「好。」、9/6 一直待在宿舍 → 16:00 阿哲「你沒來喔？系籃我幫你填了。」（送到就算填了）→ 回「不要啦。」＝取消
[前置／捷徑] 讀使用者 10-18 實測存檔「9 月 1 日上完憲法」（宿營、轉系都走過），【前置】同一份進度跳到 9/5 20:50 宿舍、9/6 09:50 校園；
走到晨思鐘用真的移動（L.go_to：點地面、轉鏡頭），回覆用手機回覆鍵，選項照玩家點。
用法：LW_TESTS=<測試樹>/tests MODE=yes|noshow python3 pt1107s_aa613_probe.py URL 存檔.json 輸出資料夾"""
import asyncio, json, os, sys, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'yes')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
BELL = (-36.6, 13.4)
ZHE_DM = None   # 讀遊戲裡的台詞表（AA613.L）


async def main():
    run = L.Run('pt1107s_aa613_' + MODE, OUT)
    save = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        await P.load(pg, cdp, save.get('G', save)); await P.init(pg)
        run.setup('[前置] 讀使用者 10-18 實測存檔（9/1 上完憲法，宿營、轉系都走過）')
        L6 = await pg.evaluate("(()=>{ const L=AA613.L||{}; return {zf:L.zheFair||L.zhe||null, squad:L.squad||null, bell:L.bell||null, noshow:L.noShow||null}; })()")
        info = await pg.evaluate("({hint:CLUBFAIR.hintOn(GAME.G), fair:CLUBFAIR.fairDay(GAME.G), key:CALENDAR.dateOf(CLUBFAIR.fairDay(GAME.G)).key, knowsZhe:STORY.knows('zhe',GAME.G), squad:PHONE.inGroup(GAME.G,'camp_squad_y1'), club:!!GAME.G.flags.CLUB_dept_basketball})")
        print('[INFO]', J(info)); print('[L]', J(L6, 2500))
        run.check('[前置] 社博在 9/6（六）、認識阿哲、在第七小隊群組、還沒填系籃', info['hint'] and info['key'] == '2025-09-06' and info['knowsZhe'] and info['squad'] and not info['club'], J(info))
        await P.jump(pg, cdp, run, '2025-09-05', 20.8, zone='dorm', pos=None); await P.init(pg)
        await P.wait_hour(pg, cdp, 21.3, max_s=600)
        th = await P.phone_thread(pg, cdp, 'p:zhe')
        asks = [a['t'] for a in th.get('asks', [])]
        print('[ZHE]', J(th.get('text', ''), 800), J(asks))
        zd = (L6.get('zf') or {}).get('dm') or []
        run.check('① 9/5 21:00 阿哲私訊兩則（%s）＋回覆鍵「好。」／「我晚點自己去。」' % '／'.join(zd), th['ok'] and len(zd) == 2 and all(t in th.get('text', '') for t in zd) and '好。' in asks and '我晚點自己去。' in asks, J([th.get('text', '')[-300:], asks]))
        g = await P.phone_thread(pg, cdp, 'g:camp_squad_y1')
        print('[SQUAD]', J(g.get('text', ''), 800))
        sq = (L6.get('squad') or [])
        run.check('① 21:10 第七小隊群組：芯慈、沛珊各一則（照台詞表）', g['ok'] and len(sq) >= 2 and all(t in g.get('text', '') for _, t in sq), J([g.get('text', '')[-400:], sq]))
        r = await P.phone_answer(pg, cdp, 'p:zhe', '好。')
        run.check('回「好。」', r is not None and await pg.evaluate("GAME.G.flags.AA613_ZHE_FAIR!=null"), J(await pg.evaluate("GAME.G.flags.AA613_ZHE_FAIR")))
        await L.close_panels(pg, cdp)
        if MODE == 'yes':
            await P.jump(pg, cdp, run, '2025-09-06', 9.85, zone='campus', pos={'x': BELL[0], 'z': BELL[1] - 22}, note='晨思鐘南邊 22 m'); await P.init(pg)
            n0 = await P.say_hook(pg)
            await P.wait_hour(pg, cdp, 10.02, max_s=600)
            wf0 = await pg.evaluate("GAME.walkFallbacks|0")
            zw = await P.who(pg, 'zhe'); print('[ZHE AT]', J(zw))
            run.check('9/6 10:00 阿哲在晨思鐘', bool(zw) and abs(zw['x'] - BELL[0]) < 2.5 and abs(zw['z'] - BELL[1]) < 2.5, J(zw))
            await L.go_to(pg, cdp, run, BELL[0], BELL[1] - 3.0, 1.2, '晨思鐘阿哲旁邊', max_s=420)
            dl = await P.dialog(pg, cdp, run, picks=('我也寫。',), max_s=600, start_s=40, idle_s=8, tag='bell')
            s2 = await P.said(pg, n0)
            lines = [t for _, t in (dl or {}).get('lines', [])] + [t for _, t in s2]
            await run.shot(pg, 'bell_after')
            st = await pg.evaluate("({club:!!GAME.G.flags.CLUB_dept_basketball, met:GAME.G.flags.AA613_BELL_MET, wf:GAME.walkFallbacks|0, h:+GAME.G.hour.toFixed(2), zone:GAME.G.zone})")
            me = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return {x:+o.x.toFixed(1),z:+o.z.toFixed(1)}; })()")
            print('[LINES]', J(lines, 3000)); print('[ST]', J(st), J(me), 'wf0', wf0)
            bell = [t for _, t in (L6.get('bell') or [])]
            run.check('② 晨思鐘那一段照台詞表（%d 句都有）' % len(bell), bell and all(any(t in x for x in lines) for t in bell), J([t for t in bell if not any(t in x for x in lines)]))
            run.check('② 選「我也寫。」→ 阿哲「好欸。」、加入系籃（CLUB_dept_basketball）、AA613_BELL_MET', any('好欸。' in x for x in lines) and st['club'] and st['met'] is not None, J(st))
            run.check('② 一起走到系籃攤位不卡（walkFallbacks 0）', st['wf'] - wf0 == 0, J([wf0, st['wf'], me]))
        else:
            await P.jump(pg, cdp, run, '2025-09-06', 12.1, zone='dorm', pos=None, note='一直在宿舍、沒去晨思鐘'); await P.init(pg)
            await P.wait_play(pg, cdp, 16.1, max_s=900, run=run, tag='noshow')
            th = await P.phone_thread(pg, cdp, 'p:zhe'); asks = [a['t'] for a in th.get('asks', [])]
            club = await pg.evaluate("!!GAME.G.flags.CLUB_dept_basketball")
            print('[ZHE16]', J(th.get('text', '')[-400:]), J(asks), club)
            run.check('③ 16:00「你沒來喔？系籃我幫你填了。」、送到就算填了（CLUB_dept_basketball）、回覆鍵有「不要啦。」', '你沒來喔？系籃我幫你填了。' in th.get('text', '') and club and any(a.startswith('不要啦') for a in asks), J([th.get('text', '')[-300:], asks, club]))
            r = await P.phone_answer(pg, cdp, 'p:zhe', '不要啦')
            await pg.wait_for_timeout(1500)
            club2 = await pg.evaluate("!!GAME.G.flags.CLUB_dept_basketball")
            print('[AFTER]', J((r or '')[-300:]), club2)
            run.check('③ 回「不要啦。」＝取消（CLUB_dept_basketball 拿掉）', r is not None and not club2, J([(r or '')[-200:], club2]))
            await L.close_panels(pg, cdp)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
