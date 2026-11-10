"""BB-B 2026-11-07：UX-QUICKGO-BEFORE-OPEN-1107 瀏覽器驗收（LAWWW-B 1e27f9d68，在 3957b071e）。
手機「今天約好的」：
  ① 約在小路 18:00，17:40 看手機＝那一列寫「18:00 開門」、沒有「前往」；
  ② 18:00 起才有「前往」；
  ③ 週二公休＝寫「現在沒有開」、沒有「前往」；
  ④ 一直開著的地方（總圖）照舊有「前往」。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天、清邀約、沒有交往對象、以安朋友；【捷徑】用 INV.accept 直接放一筆約好的（約的流程已經驗過）；【捷徑】撥時間。
用法：LW_TESTS=<測試樹>/tests python3 pt1107k_goopen_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
import playlib as L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = 'heroine_01'


def state(shift):
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + shift; s['weekday'] = ((s.get('weekday') or 0) + shift) % 7
    s['hour'] = 17.0; s['invites'] = []; s['money'] = 1000
    f = dict(s.get('flags') or {})
    for k in [k for k in f if k.startswith('dating_')]: f[k] = False
    rm = dict(f.get('romance') or {})
    for k, v in list(rm.items()): rm[k] = dict(v or {}, status='none', knows=[])
    f['romance'] = rm; s['flags'] = f
    soc = dict(s.get('social') or {}); rel = dict(soc.get('rel') or {}); r = dict(rel.get(WHO) or {})
    r['fam'] = max(r.get('fam', 0), 50); r['trust'] = max(r.get('trust', 0), 35); r['comf'] = max(r.get('comf', 0), 30)
    rel[WHO] = r; soc['rel'] = rel; s['social'] = soc
    return s


ROW = """(id=>{ const b=document.querySelector('#phoneBody [data-invgo="'+id+'"]');
  const items=[...document.querySelectorAll('#phoneBody .item')].filter(e=>/今天約好的/.test(e.textContent));
  return {go:!!b, text:items.map(e=>e.innerText).join(' / ').slice(0,400)}; })(%s)"""


async def check_row(pg, cdp, run, tag, iv, want_go, want_text):
    await pe.phone(pg, cdp, 'today'); await pg.wait_for_timeout(600)
    r = await pg.evaluate(ROW % json.dumps(str(iv)))
    ok = r['go'] == want_go and (want_text is None or want_text in r['text'])
    run.check(tag, ok, json.dumps(r, ensure_ascii=False))
    await run.shot(pg, tag[:2])
    await pe.close_phone(pg, cdp)
    return r


async def main():
    run = L.Run('pt1107k_goopen', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # 2025-10-20 是週一（DAYSHIFT -12）；找週三、週二
        s0 = state(-12)
        await L.load_state(pg, s0, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30)
        wd = await pg.evaluate("CALENDAR.dateOf(GAME.G.day).wd%7")
        wed = (3 - wd) % 7; tue = (2 - wd) % 7
        run.setup('讀使用者存檔 day46；【捷徑】撥到週三 17:00、清邀約、沒有交往對象（今天是週 %d，往後 %d 天）' % (wd, wed))
        s1 = state(-12 + wed)
        await L.load_state(pg, s1, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30)
        iv = await pg.evaluate("(()=>{ const G=GAME.G; const v=INV.accept(G,'heroine_01','wz_teishoku',G.day,18,{by:'player'}); G.hour=17+40/60; return v&&v.id; })()")
        run.setup('【捷徑】INV.accept 放一筆：以安、小路、今天 18:00；時間撥到 17:40')
        run.check('放進一筆約好的（小路 18:00）', iv is not None, json.dumps(iv))
        await check_row(pg, cdp, run, '① 17:40：寫「18:00 開門」、沒有「前往」', iv, False, '18:00 開門')
        await pg.evaluate("(()=>{ GAME.G.hour=18.0; })()"); await pg.wait_for_timeout(800)
        run.setup('【捷徑】時間撥到 18:00')
        await check_row(pg, cdp, run, '② 18:00：有「前往」', iv, True, None)
        # ④ 一直開著的地方：總圖（8～22）
        iv2 = await pg.evaluate("(()=>{ const G=GAME.G; G.invites=[]; G.hour=14.5; const v=INV.accept(G,'heroine_01','library',G.day,15,{by:'player'}); return v&&v.id; })()")
        run.setup('【捷徑】清掉，改放一筆：以安、總圖、今天 15:00；時間撥到 14:30')
        await check_row(pg, cdp, run, '④ 總圖（開著）：照舊有「前往」', iv2, True, None)
        # ③ 週二公休
        s2 = state(-12 + tue)
        await L.load_state(pg, s2, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30)
        iv3 = await pg.evaluate("(()=>{ const G=GAME.G; const v=INV.accept(G,'heroine_01','wz_teishoku',G.day,18,{by:'player'}); G.hour=18.2; return v&&v.id; })()")
        run.setup('【捷徑】撥到週二，INV.accept 放一筆：小路今天 18:00（週二公休；正常約不到，只看手機那一列怎麼寫）；時間 18:12')
        await check_row(pg, cdp, run, '③ 週二公休：寫「現在沒有開」、沒有「前往」', iv3, False, '現在沒有開')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
