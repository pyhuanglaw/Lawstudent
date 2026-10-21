# 效能：每一格的 JavaScript 花在哪裡（X69，PERF-WENZHOU-1020）——用 Chrome DevTools 的 CPU profiler 取樣遊戲主迴圈幾秒，
# 照「函式＋檔案:行」加總 self time，列出最花時間的前 30 個，也照檔案加總。perf_scenes.py 量到 E.render()（含 gl.finish）只要幾毫秒、
# 遊戲卻只有 1 fps 左右：大部分時間不在畫圖，在每一格的更新（人物、動畫、找路、劇情）。這支工具找出是哪幾個。
# 用法（先開 http server）：python3 tests/perf_profile.py http://127.0.0.1:8765/index.html [場景名 ...]（場景名同 perf_scenes.py）
import asyncio, json, sys, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import playlib as L
from perf_scenes import SCENES
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ONLY = sys.argv[2:] or ['wenzhou_mid', 'campus_avenue']
SECS = 8

def summarize(prof):
    nodes = {n['id']: n for n in prof['nodes']}
    self_us = collections.Counter()
    # 取樣：samples（node id）＋ timeDeltas（微秒）
    for nid, dt in zip(prof['samples'], prof['timeDeltas']):
        self_us[nid] += max(dt, 0)
    by_fn, by_file = collections.Counter(), collections.Counter()
    total = sum(self_us.values()) or 1
    for nid, us in self_us.items():
        cf = nodes[nid]['callFrame']; url = cf.get('url', '').rsplit('/', 1)[-1] or '(native)'
        fn = cf.get('functionName') or '(anonymous)'
        by_fn[f"{fn} {url}:{cf.get('lineNumber', -1) + 1}"] += us
        by_file[url] += us
    return total, by_fn.most_common(30), by_file.most_common(12)

async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for nm in ONLY:
            zone, (x, z, yaw) = SCENES[nm]
            await L.load_state(pg, {'zone': zone, 'hour': 15.0, 'day': 9, 'weekday': 4, 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': {'introDone': True, 'afternoonDone': True}}, quiet_events=True)
            await pg.wait_for_timeout(15000)
            f0 = await pg.evaluate('GAME.E.frame||0')
            await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 1000}); await cdp.send('Profiler.start')
            await pg.wait_for_timeout(SECS * 1000)
            prof = (await cdp.send('Profiler.stop'))['profile']
            f1 = await pg.evaluate('GAME.E.frame||0')
            total, fns, files = summarize(prof)
            print(f'=== {nm}：{SECS} 秒 {f1 - f0} 格（{(f1 - f0) / SECS:.2f} fps）；取樣總計 {total / 1e6:.2f} 秒')
            print('  檔案：' + '、'.join(f'{f} {us / total * 100:.1f}%' for f, us in files))
            for fn, us in fns:
                print(f'  {us / total * 100:5.1f}%  {fn}')
        await b.close()

asyncio.run(main())
