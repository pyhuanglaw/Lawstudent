"""CC-B（帳號 B）11-08：只記 WebGL renderer（BB-B 12:34）。照 runner 跑 probe 的同一條路（gpu_wrap、同一個 HEADLESS 設定）開遊戲，
等載入，印 UNMASKED_RENDERER／VENDOR，寫 renderer.json。AMD Radeon＝GPU；SwiftShader＝那一輪不能判美術。
用法：python cc_renderer_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or '.')
import playlib as L
from playwright.async_api import async_playwright
JS = "(()=>{ const c=document.createElement('canvas'); const gl=c.getContext('webgl2')||c.getContext('webgl'); if(!gl) return {r:'no webgl'}; const e=gl.getExtension('WEBGL_debug_renderer_info'); return {r:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER), v:e?gl.getParameter(e.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR), game:(typeof GAME!=='undefined'&&GAME.E&&GAME.E.renderer&&GAME.E.renderer.getContext)?(()=>{ const g=GAME.E.renderer.getContext(); const x=g.getExtension('WEBGL_debug_renderer_info'); return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):null; })():null}; })()"
async def main():
    url, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(url); ok = await L.wait_loaded(pg)
        r = await pg.evaluate(JS); r['loaded'] = ok; r['headless_env'] = os.environ.get('CC_HEADLESS')
        print('RENDERER %s' % json.dumps(r, ensure_ascii=False), flush=True)
        json.dump(r, open(os.path.join(out, 'renderer.json'), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if r.get('r') and 'no webgl' not in r['r'] else 'FAILED 1: no webgl', flush=True)
asyncio.run(main())
