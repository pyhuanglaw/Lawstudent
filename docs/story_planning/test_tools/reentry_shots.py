"""BB-C 10-28：LOBBY-REENTRY-1028（LAWWW-C 10:17，rc2 da50fbdc1）——室內 GLB 第二次進去會不會壞（光照貼圖第二次接上時 onBeforeCompile 包兩層→shader 編不過→網格不畫）。
每一區：白天 13:00、晚上 20:30 各「進去 → 出去 → 再進去」，第一次、第二次各拍一張（同一個鏡頭）；算畫面中間很黑的比例、平均亮度；兩次差很多＝第二次壞了。
區域：linze（霖澤館一樓大廳，出去＝campus）、classroom（201 階梯教室，出去＝linze）、linze_202（202，出去＝linze）、wancai_multi（萬才館多功能教室，出去＝wancai）。
做法：【前置】使用者存檔；【捷徑】GAME.enter 換區域（同 artrev5_probe；只為了「同一個工作階段進出兩次」），每次等正式模型掛上（zone.formal）再拍。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<工作樹>/tests TAG=rc2 python3 reentry_shots.py '<URL>/index.html' <輸出資料夾> [存檔.json]；ZONES＝逗號分隔（預設四區）"""
import os, sys, json, asyncio, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image
URL, OUT = sys.argv[1], sys.argv[2]; TAG = os.environ.get('TAG', 'x')
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
OUTER = {'linze': 'campus', 'classroom': 'linze', 'linze_202': 'linze', 'wancai_multi': 'wancai'}
ZONES = [z for z in os.environ.get('ZONES', 'linze,classroom,linze_202,wancai_multi').split(',') if z]


def stats(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    c = im.crop((int(w * 0.2), int(h * 0.36), int(w * 0.82), int(h * 0.86))); px = list(c.getdata()); n = len(px)
    return round(sum(1 for p in px if max(p) < 14) / n, 4), round(sum(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in px) / n, 1)


async def enter(pg, z, h):
    await pg.evaluate("(async([z,h])=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })", [z, h])
    ok = False
    for _ in range(90):
        # 10-28 10:5x 修：原本比 GAME.E.zone.id（不是區域名稱）→ 一直 false、每次白等 90 秒；改看 GAME.G.zone
        ok = await pg.evaluate("(z=>!!(GAME.G.zone===z&&GAME.E.zone&&GAME.E.zone.formal))", z) if z in OUTER else await pg.evaluate("(z=>GAME.G.zone===z)", z)
        if ok: break
        await pg.wait_for_timeout(1000)
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })", h)
    if z == 'linze':
        await pg.evaluate("(()=>{ const E=GAME.E, P=E.player; E.placeAt(P,0.5,1.0,0); P.path=null; E.cam.yaw=1.5708; E.cam.pitch=0.3; E.cam.distTarget=6.5; E.cam.dist=6.5; })()")
    await pg.wait_for_timeout(5000)
    return ok


async def main():
    run = L.Run('reentry_' + TAG, OUT); os.makedirs(OUT, exist_ok=True); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        for hn, hh in (('day', 13.0), ('night', 20.5)):
            # 10-28 11:0x：白天、晚上各自重新載入頁面——不然晚上的「第 1 次」其實是這個工作階段第 3 次進去（rc1 晚上兩張都壞＝誤判 PASS）
            await pg.goto(URL); run.check('%s：遊戲載入（新的頁面＝這一組的第 1 次真的是第一次進去）' % hn, await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
            st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.update(zone='campus', pos=None, hour=hh)
            st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
            await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(5000)
            await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
            run.setup('[前置] 使用者存檔（校園，%.1f 時）；關掉條件事件；之後用 GAME.enter 進出' % hh)
            for z in ZONES:
                for k in (1, 2):
                    ok = await enter(pg, z, hh)
                    path = os.path.join(OUT, '%s_%s_%s_%d.png' % (TAG, z, hn, k)); await pg.screenshot(path=path)
                    dk, lum = stats(path); res['%s_%s_%d' % (z, hn, k)] = {'dark': dk, 'lum': lum, 'formal': ok}
                    run.note('%s %s 第 %d 次進去：formal %s、黑 %.2f%%、亮度 %s → %s' % (z, hn, k, ok, dk * 100, lum, path))
                    if k == 1:
                        await pg.evaluate("(async(z)=>{ await GAME.enter(z); })", OUTER[z]); await pg.wait_for_timeout(5000)
                a, c = res['%s_%s_1' % (z, hn)], res['%s_%s_2' % (z, hn)]
                same = abs(a['lum'] - c['lum']) <= max(8.0, a['lum'] * 0.12) and abs(a['dark'] - c['dark']) <= 0.03
                run.check('%s %s：第二次進去和第一次一樣（亮度 %s→%s、黑 %.2f%%→%.2f%%）、正式模型都掛上' % (z, hn, a['lum'], c['lum'], a['dark'] * 100, c['dark'] * 100), same and a['formal'] and c['formal'], J([a, c]))
                await pg.evaluate("(async(z)=>{ await GAME.enter(z); })", OUTER[z]); await pg.wait_for_timeout(3000)
        json.dump(res, open(os.path.join(OUT, '%s_reentry_stats.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'TAG', TAG)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
