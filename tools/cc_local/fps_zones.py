# -*- coding: utf-8 -*-
"""CC（帳號 A）：各區 fps 量測（BB 2026-11-02 13:31、使用者同意的第 2 類工作）。
用法：python tools/cc_local/fps_zones.py <遊戲網址 index.html> <輸出資料夾>
環境變數：
  ZONES=campus,wenzhou,gongguan,library_hall,wancai,linze
  SLOTS=day,night,rain      day＝11:00 晴、night＝21:00 晴、rain＝15:00 雨
  SECS=15                   每一格量幾秒
  WARM=4                    進區域、換時間後先等幾秒（載入、陰影）
  LAND=1                    1＝844×390 橫向，0＝390×844 直向
headed／headless 由 gpu_wrap.py 的 CC_HEADLESS 決定（cc-local 的 queue 用 ENV 傳 CC_HEADLESS=0／1）。
在雲端直接跑（不經 gpu_wrap）時用 playlib 的手機模擬（SwiftShader，只能驗證工具會不會跑，數字沒意義）。

【前置／捷徑】用遊戲自己的讀檔（playlib.load_state，條件事件關閉）把玩家放到各區域，不是玩家走過去。
量法：requestAnimationFrame 的每一幀間隔，記錄平均 fps、1% low（最慢 1% 幀的平均間隔換算的 fps）、最慢一幀（ms）、幀數；
     同時記 E.zone.id、G.hour、E.weather、renderer 字串、devicePixelRatio、畫質設定（E.q.level）。
輸出：<輸出資料夾>/fps.json、fps.txt（一行一格）。
"""
import sys, os, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

ZONES = [z for z in os.environ.get('ZONES', 'campus,wenzhou,gongguan,library_hall,wancai,linze').split(',') if z]
SLOTS = {'day': (11.0, 'sunny'), 'night': (21.0, 'sunny'), 'rain': (15.0, 'rain')}
SLOT_IDS = [s for s in os.environ.get('SLOTS', 'day,night,rain').split(',') if s in SLOTS]
SECS = float(os.environ.get('SECS', '15')); WARM = float(os.environ.get('WARM', '4'))
LAND = os.environ.get('LAND', '1') != '0'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}

FRAMES_JS = """(ms)=>new Promise(r=>{ const dt=[]; let last=performance.now(); const t0=last;
  function f(t){ dt.push(t-last); last=t; if(t-t0<ms) requestAnimationFrame(f); else r(dt); } requestAnimationFrame(f); })"""
INFO_JS = """(()=>{ const E=GAME.E, G=GAME.G; let rnd=''; try{ const gl=E.renderer.getContext(); const x=gl.getExtension('WEBGL_debug_renderer_info'); rnd=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER); }catch(e){ rnd=String(e); }
  return {zone:(E.zone&&E.zone.id)||G.zone, hour:+(+G.hour).toFixed(2), weather:E.weather||G.weather, renderer:rnd, dpr:devicePixelRatio, q:(E.q&&E.q.level)||null, draw:(E.renderer&&E.renderer.info&&E.renderer.info.render)?E.renderer.info.render.calls:null, tris:(E.renderer&&E.renderer.info&&E.renderer.info.render)?E.renderer.info.render.triangles:null}; })()"""


def stats(dt):
    dt = [x for x in dt[1:] if x > 0]   # 第一個間隔包含等待，丟掉
    if not dt: return {'n': 0}
    s = sorted(dt); n = len(s); k = max(1, n // 100)
    avg = sum(s) / n; low1 = sum(s[-k:]) / k
    return {'n': n, 'avg_fps': round(1000 / avg, 2), 'low1_fps': round(1000 / low1, 2), 'worst_ms': round(s[-1], 1), 'p50_ms': round(s[n // 2], 1)}


async def main(url, od):
    os.makedirs(od, exist_ok=True); rows = []; errs_all = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
        await pg.goto(url)
        if not await L.wait_loaded(pg):
            print('FAIL 遊戲載入'); await b.close(); return 1
        for z in ZONES:
            for sid in SLOT_IDS:
                h, w = SLOTS[sid]
                rec = {'zone': z, 'slot': sid}
                try:
                    await L.load_state(pg, {'zone': z, 'hour': h, 'day': 8, 'weekday': 6, 'weather': w, 'pos': None, 'flags': FLAGS}, quiet_events=True, quiet_phone=True)
                    await pg.evaluate("w=>{ try{ GAME.G.weather=w; GAME.E.setWeather&&GAME.E.setWeather(w); }catch(e){} }", w)
                    await pg.wait_for_timeout(int(WARM * 1000))
                    rec.update(await pg.evaluate(INFO_JS))
                    rec.update(stats(await pg.evaluate(FRAMES_JS, int(SECS * 1000))))
                    rec['ok'] = rec.get('zone') == z and rec.get('n', 0) > 0
                except Exception as e:
                    rec['ok'] = False; rec['err'] = repr(e)[:300]
                rows.append(rec)
                print(('OK   ' if rec.get('ok') else 'FAIL ') + '%-13s %-5s avg %s fps  1%%low %s fps  worst %s ms  n=%s  zone=%s h=%s w=%s q=%s draw=%s %s' % (
                    z, sid, rec.get('avg_fps'), rec.get('low1_fps'), rec.get('worst_ms'), rec.get('n'), rec.get('zone'), rec.get('hour'), rec.get('weather'), rec.get('q'), rec.get('draw'), rec.get('err', '')), flush=True)
        errs_all = list(errs)
        await b.close()
    out = {'url': url, 'land': LAND, 'headless_env': os.environ.get('CC_HEADLESS'), 'secs': SECS, 'rows': rows, 'js_errors': errs_all[:20]}
    json.dump(out, open(os.path.join(od, 'fps.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    bad = [r for r in rows if not r.get('ok')]
    print('JS 例外 %d 個' % len(errs_all))
    print('ALL PASS（量測完成 %d 格）' % len(rows) if not bad else 'FAILED: %d 格量不到：%s' % (len(bad), ', '.join(r['zone'] + '/' + r['slot'] for r in bad)))
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1], sys.argv[2])))
