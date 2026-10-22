"""BB（帳號 A）2026-10-22：ART-TONE-NEUTRAL-1022（LAWWW 07:49 列的 v9.10.5 第 8 項；開發分支 154c639e 起：色調映射預設 ACES→Neutral，?tone=aces 回到舊的）——
白天、黃昏、晚上各看一個場景，沒有過亮或過暗。同一個地方、同一個鏡頭，新的（預設 Neutral）和舊的（?tone=aces）各拍一張對照，算亮度：
  平均亮度、5%／95% 分位、亮到發白（≥250）和暗到全黑（≤8）的比例（只算畫面中間 80%，避開手機按鈕）。
場景（【前置】讀使用者存檔改日期、時間、地點，晴天，讀檔後不動，等 8 秒讓光影和人物到位）：
  DAY    2025-10-01（三）12:00 校園（讀檔的預設位置）
  DUSK   2025-10-01（三）17:40 溫州街
  NIGHT  2025-10-01（三）20:30 公館
Playwright 手機橫向模擬、?turbo，不是 iPhone（SwiftShader 的顏色和手機 GPU 可能有一點差）。
用法：LW_TESTS=<開發分支>/tests python3 tone_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SCENES = [('DAY', '2025-10-01', 12.0, 'campus'), ('DUSK', '2025-10-01', 17.67, 'wenzhou'), ('NIGHT', '2025-10-01', 20.5, 'gongguan')]
TONES = [('neutral', ''), ('aces', '&tone=aces')]


def stats(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    im = im.crop((int(w * 0.1), int(h * 0.1), int(w * 0.9), int(h * 0.9)))
    px = list(im.getdata()); n = len(px)
    lum = sorted(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in px)
    return {'mean': round(sum(lum) / n, 1), 'p5': round(lum[int(n * 0.05)], 1), 'p95': round(lum[int(n * 0.95)], 1),
            'hi': round(100.0 * sum(1 for v in lum if v >= 250) / n, 2), 'lo': round(100.0 * sum(1 for v in lum if v <= 8) / n, 2)}


async def main():
    run = L.Run('tone', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for tname, q in TONES:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL + q); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                for sid, key, h, zone in SCENES:
                    G = json.loads(json.dumps(base)); G = G.get('G', G)
                    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
                    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weather': 'clear', 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
                    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(8000); await L.phone_away(pg, cdp)
                    info = await pg.evaluate("(()=>{ const r=GAME.E&&GAME.E.renderer; let tm=null; try{ tm=r?r.toneMapping:null; }catch(e){} return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), tm, exp:r?r.toneMappingExposure:null, q:location.search}; })()")
                    path = os.path.join(OUT, 'tone_%s_%s.png' % (sid, tname)); await pg.screenshot(path=path)
                    s = stats(path); s.update(info); out.setdefault(sid, {})[tname] = s
                    say('   %s %-7s %s' % (sid, tname, json.dumps(s, ensure_ascii=False)))
                run.check('%s：沒有 JS 例外' % tname, not errs, json.dumps(errs[:3], ensure_ascii=False))
            finally:
                try: await asyncio.wait_for(b.close(), 30)
                except Exception: pass
    run.setup('[前置] 使用者存檔改到 2025-10-01（三）12:00 校園／17:40 溫州街／20:30 公館，晴天；讀檔後不動，等 8 秒')
    for sid, key, h, zone in SCENES:
        n, a = out.get(sid, {}).get('neutral'), out.get(sid, {}).get('aces')
        if not n: run.check('%s：拍到畫面' % sid, False, ''); continue
        run.check('%s（%s %.2f %s）：新色調（Neutral）沒有大片亮到發白（≥250 的 %.2f%%）' % (sid, key, h, zone, n['hi']), n['hi'] < 3, json.dumps({'neutral': n, 'aces': a}, ensure_ascii=False))
        run.check('%s：新色調沒有大片暗到全黑（≤8 的 %.2f%%）' % (sid, n['lo']), n['lo'] < 15, json.dumps({'neutral': n, 'aces': a}, ensure_ascii=False))
        run.note('%s：平均亮度 Neutral %.1f／ACES %s；5%%～95%% 分位 %s～%s／%s～%s' % (sid, n['mean'], a and a['mean'], n['p5'], n['p95'], a and a['p5'], a and a['p95']))
    json.dump(out, open(os.path.join(OUT, 'tone.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
