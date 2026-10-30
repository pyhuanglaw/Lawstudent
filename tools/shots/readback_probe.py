"""換區域時主執行緒讀像素（getImageData）花多久（PERF-ZONE-ENTER-1018 第三輪；LAWWW2-B 2026-10-30）。
x14_prof.py 量到溫州街、Café、麵店、社科圖、宿舍進場時有 1.4～4.7 秒卡在 getImageData：第一次讀像素要等 GPU 把排在前面的工作都做完。
這一支在每一站記：讀了幾次、總共多久、畫布多大、誰呼叫（前兩層）。電腦模擬（1280×720），從公館 15:00 出發。
用法（先開 http server；一次只跑這一支）：python3 tools/shots/readback_probe.py <URL> <區域,區域,…>"""
import os, sys, json, asyncio
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, ROUTE = sys.argv[1], sys.argv[2].split(',')
HOOK = """(()=>{ const P=window.__gid=[]; const C=CanvasRenderingContext2D.prototype, g=C.getImageData;
 C.getImageData=function(...a){ const t=performance.now(); const r=g.apply(this,a); const st=(new Error().stack||'').split('\\n').slice(2,4).map(s=>s.trim().replace(/^at /,'').replace(/https?:\\/\\/[^/]+\\//,'')).join(' < ');
  P.push({ms:+(performance.now()-t).toFixed(1),w:this.canvas.width,h:this.canvas.height,st}); return r; }; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        pg = await ctx.new_page()
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 15.0, 'weather': 'clear', 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(20000)
        await pg.evaluate(HOOK)
        for z in ROUTE:
            await pg.evaluate("window.__gid.length=0")
            ms = await pg.evaluate("(async()=>{ const t=performance.now(); await GAME.enter('%s'); return performance.now()-t; })()" % z)
            await pg.wait_for_timeout(12000)
            r = await pg.evaluate("window.__gid")
            tot = sum(x['ms'] for x in r)
            print('==', z, 'enter', round(ms), 'getImageData', len(r), '次', round(tot), 'ms', flush=True)
            agg = {}
            for x in r:
                k = x['st'][:110]; a = agg.setdefault(k, [0, 0.0, set()]); a[0] += 1; a[1] += x['ms']; a[2].add('%dx%d' % (x['w'], x['h']))
            for k, a in sorted(agg.items(), key=lambda kv: -kv[1][1])[:6]:
                print('   %4d 次 %7.0f ms  %s  %s' % (a[0], a[1], ','.join(sorted(a[2]))[:40], k), flush=True)
            print('   最慢：', sorted([x['ms'] for x in r], reverse=True)[:8], flush=True)
        await b.close()
asyncio.run(main())
