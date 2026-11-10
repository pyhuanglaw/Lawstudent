"""BB-B 2026-11-07：AA_611 第 1 節第 8 列（LAWWW-B 3cd6f2797，src/whois3d.js）瀏覽器抽查：
手機 → 朋友 → Alison「資料」：有 KNOWS_SIS_ALISON＝多一行「學姊的妹妹。」；沒有＝不出現。照玩家點手機看畫面上的字，截圖（直向）。
[前置／捷徑] 讀使用者存檔 day46（已認識 Alison）；【捷徑】旗標 KNOWS_SIS_ALISON 設成 true／拿掉（礁溪那天才會設，那一場 Node 驗過）。
用法：LW_TESTS=<測試樹>/tests python3 pt1107p_alison_page_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
J = lambda x, n=600: json.dumps(x, ensure_ascii=False)[:n]
PID = 'yu'


async def page(pg, cdp, run, tag):
    await P.phone_tab(pg, cdp, 'friends')
    has = await pg.evaluate("(id=>!!document.querySelector('#phoneBody [data-person=\"'+id+'\"]'))", PID)
    ui = None
    if has:
        await L.tap(pg, cdp, '#phoneBody [data-person="%s"]' % PID); await pg.wait_for_timeout(900)
        ui = await pg.evaluate("(()=>{ const w=document.querySelector('#phoneBody .whois'); return w?w.innerText.split('\\n').map(s=>s.trim()).filter(Boolean):[]; })()")
        await run.shot(pg, 'alison_' + tag)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody [data-personback]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
    await L.close_panels(pg, cdp)
    return has, ui


async def main():
    run = L.Run('pt1107p_alison_page', OUT)
    base = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        for tag, on in (('on', True), ('off', False)):
            s = json.loads(json.dumps(base)); f = dict(s.get('flags') or {})
            if on: f['KNOWS_SIS_ALISON'] = True
            else: f.pop('KNOWS_SIS_ALISON', None)
            s['flags'] = f; s['hour'] = 15.0
            await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3000)
            run.setup('[前置] 讀使用者存檔 day46；【捷徑】KNOWS_SIS_ALISON＝%s' % on)
            has, ui = await page(pg, cdp, run, tag)
            print('[%s]' % tag, has, J(ui))
            line = any('學姊的妹妹。' in x for x in (ui or []))
            run.check('%s：朋友清單有 Alison、資料頁%s「學姊的妹妹。」' % (tag, '有' if on else '沒有'), has and (line == on), J(ui))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
