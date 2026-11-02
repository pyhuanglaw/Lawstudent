# -*- coding: utf-8 -*-
"""CC（帳號 A）：第 0 項顯示卡檢查。
用法：python tools/cc_local/gpu_check.py <遊戲網址 index.html> <輸出 gpu.txt>
用 headless=False＋--ignore-gpu-blocklist --use-angle=d3d11 開遊戲，讀 WebGL UNMASKED_RENDERER，
等遊戲載入後量 10 秒 requestAnimationFrame 的 fps，也記遊戲自己的 renderer 字串；另外用 SwiftShader 參數再量一次當對照。"""
import sys, asyncio, json, time
from playwright.async_api import async_playwright

RENDERER_JS = """(()=>{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');
if(!g) return 'no webgl'; const e=g.getExtension('WEBGL_debug_renderer_info');
return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER);})()"""
FPS_JS = """(ms)=>new Promise(r=>{let n=0;const t0=performance.now();function f(){n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else r(n*1000/(performance.now()-t0));} requestAnimationFrame(f);})"""
LOADED_JS = "typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"

async def one(p, url, args, headless, label):
    out = {'label': label, 'args': args, 'headless': headless}
    t0 = time.time()
    b = await p.chromium.launch(headless=headless, args=args)
    try:
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        ev = out.setdefault('events', [])
        pg.on('crash', lambda *_: ev.append('page crash %.1fs' % (time.time() - t0)))
        pg.on('close', lambda *_: ev.append('page close %.1fs' % (time.time() - t0)))
        pg.on('console', lambda m: ev.append('console.%s %s' % (m.type, m.text[:160])) if m.type in ('error',) and len(ev) < 30 else None)
        pg.on('pageerror', lambda e: ev.append('pageerror %s' % str(e)[:160]) if len(ev) < 30 else None)
        b.on('disconnected', lambda *_: ev.append('browser disconnected %.1fs' % (time.time() - t0)))
        await pg.goto(url)
        out['renderer_blank'] = await pg.evaluate(RENDERER_JS)
        ok = False
        for i in range(360):
            if await pg.evaluate(LOADED_JS): ok = True; break
            await pg.wait_for_timeout(500)
        out['loaded'] = ok; out['load_s'] = round(time.time() - t0, 1)
        try:
            out['game_renderer'] = await pg.evaluate("(()=>{try{const g=E3&&E3.renderer?E3.renderer.getContext():null; if(!g) return null; const e=g.getExtension('WEBGL_debug_renderer_info'); return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):null;}catch(e){return String(e)}})()")
        except Exception as e:
            out['game_renderer'] = repr(e)
        out['fps_10s'] = round(await pg.evaluate(FPS_JS, 10000), 2)
    except Exception as e:
        out['error'] = repr(e)
    finally:
        await b.close()
    return out

async def main(url, path):
    async with async_playwright() as p:
        GA = ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11', '--enable-gpu-rasterization']
        gpu = await one(p, url, GA, False, 'GPU（d3d11，有視窗）')
        gpu_hl = await one(p, url, GA, True, 'GPU（d3d11，無視窗）')
        gpu_def = await one(p, url, ['--ignore-gpu-blocklist'], False, 'GPU（Chromium 預設 ANGLE，有視窗）')
        soft = await one(p, url, ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'], True, '對照：SwiftShader（無視窗）')
    sw = 'swiftshader' in str(gpu.get('renderer_blank', '')).lower()
    lines = ['GPU 檢查（CC run_queue 第 0 項）', 'URL: ' + url,
             'GPU 結果: ' + json.dumps(gpu, ensure_ascii=False),
             'GPU 無視窗: ' + json.dumps(gpu_hl, ensure_ascii=False),
             'GPU 預設 ANGLE: ' + json.dumps(gpu_def, ensure_ascii=False),
             '對照結果: ' + json.dumps(soft, ensure_ascii=False),
             '判讀: ' + ('仍是 SwiftShader（沒有用到顯示卡）' if sw else '不是 SwiftShader')]
    open(path, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2]))
