"""BB-B 2026-11-08：AA720 第三輪（LAWWW-B 1abc2830c＋35dff9acc wiringAnswers3，head 5ae7b9059）抽查——芷若 9/28 生日電話，選信的玩家（AA_719 ZR-2 distance＝letters）。
  MODE=letters：沒有和別人交往 → 2027-09-28 21:55 開頭旁白「（台灣晚上十點，手機響了。）」（不是明信片版「（明信片背面寫著：台灣晚上十點。）」）
                → 選「打給她。」→ 22:00 視訊（ev_zhiruo_bday_video）→ ZR_BDAY_CALL[2027]＝true
  MODE=other：選信、但那時和以安交往中 → 21:55～22:30 都沒有這一通（AA-B wiringAnswers3 2）
[前置／捷徑] 讀使用者存檔 day46，同一份進度跳到 2027-09-28 21:40 校園；【前置】大二、大三搬宿舍拆箱演過；
【捷徑】G.flags.DECIDE.heroine_02.distance＝{v:'letters'}（決定拍本身 AA_719 另外測過）；MODE=other 另加 dating_heroine_01（存檔本來也和可昕交往中）；MODE=letters 【捷徑】清掉 dating_kexin、romance.kexin＝none（day46 存檔本來和可昕交往中）。
等時間用真的遊戲時間，選項照玩家點。
用法：LW_TESTS=<測試樹>/tests MODE=letters|other python3 pt1108e_aa720_zrbday_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'letters')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
NEW = '（台灣晚上十點，手機響了。）'
OLD = '（明信片背面寫著：台灣晚上十點。）'


async def main():
    run = L.Run('pt1108e_aa720_zrbday_' + MODE, OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        d0 = (await P.day_of(pg, '2027-09-28'))['d']
        fl = {'ROOM_Y2': d0 - 400, 'ROOM_Y3': d0 - 20, 'DECIDE': {'heroine_02': {'distance': {'v': 'letters', 'day': d0 - 200}}}}
        if MODE == 'other': fl['dating_heroine_01'] = True
        else: fl['dating_kexin'] = False   # day46 存檔本來和可昕交往中（舊序章的系那一年起）：選信、沒有和別人交往的版本要先清掉
        s, d = await P.base(pg, save, '2027-09-28', 21.67, 'campus', flags=fl)
        s.setdefault('home', {})['at'] = False
        if MODE == 'letters':
            R = s['flags'].get('romance') or {}
            if isinstance(R.get('kexin'), dict): R['kexin']['status'] = 'none'
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        info = await pg.evaluate("({ver:Y2B.pcVer?Y2B.pcVer(GAME.G):null, card:Y2B.bdayCard?Y2B.bdayCard(GAME.G):null, letters:AA720P.zrLetters?AA720P.zrLetters(GAME.G):null})")
        run.setup('[前置] day46 存檔改到 %s 21:40 校園；%s；pcVer＝%s、bdayCard＝%s、zrLetters＝%s' % (d['key'], J(fl), info['ver'], info['card'], info['letters']))
        n0 = await P.say_hook(pg)
        picks = ('打給她。', '接起來')
        await P.wait_play(pg, cdp, 22.55, max_s=1200, picks=picks, run=run, tag='21:40 到 22:33')
        hh = await pg.evaluate('+GAME.G.hour.toFixed(2)')
        lines = [t for _, t in await P.said(pg, n0)]
        st = await pg.evaluate("({call:GAME.G.flags.ZR_BDAY_CALL||null, out:(typeof OUT!=='undefined'&&OUT.get(GAME.G,'y3_zr_bday_call'))?OUT.get(GAME.G,'y3_zr_bday_call').state:null})")
        print('[LINES]', J(lines, 2500)); print('[ST]', J(st), hh)
        await run.shot(pg, 'after')
        run.check('[前置] 遊戲時間等到 22:30 以後', hh >= 22.5, J(hh))
        if MODE == 'letters':
            run.check('開頭旁白是選信版「%s」、沒有明信片版' % NEW, any(NEW in t for t in lines) and not any(OLD in t for t in lines), J(lines[:6]))
            run.check('選「打給她。」→ 記 ZR_BDAY_CALL[2027]＝true、22:00 視訊那一趟演過', (st['call'] or {}).get('2027') is True and st['out'] in ('done', None), J(st))
        else:
            run.check('選信但和以安交往中：21:55～22:30 沒有這一通（沒有兩種開頭旁白、沒記 ZR_BDAY_CALL）', not any(NEW in t or OLD in t for t in lines) and not st['call'], J([lines[:6], st]))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
