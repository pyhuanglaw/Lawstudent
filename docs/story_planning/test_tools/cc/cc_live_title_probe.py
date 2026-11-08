"""CC-B（帳號 B）11-08：線上版標題畫面（BB-B 16:31 LIVE_V91023）。開 LIVE_URL（預設 GitHub Pages），等標題畫面，
截一張、印版本字樣（#titleScreen 裡含「版本」的那一行）、?v= 的數目、WebGL renderer；EXPECT 有給就比對。
用法：python cc_live_title_probe.py <url（忽略，用 LIVE_URL）> <out>"""
import os, sys, json, asyncio, re
sys.path.insert(0, os.environ.get('LW_TESTS') or '.')
import playlib as L
from playwright.async_api import async_playwright
URL = os.environ.get('LIVE_URL') or 'https://pyhuanglaw.github.io/Lawstudent/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'; os.makedirs(OUT, exist_ok=True)
EXP = os.environ.get('EXPECT') or ''
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'nocache=%d' % int(__import__('time').time()), wait_until='load')
        for _ in range(60):
            if await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide')&&getComputedStyle(t).display!=='none'; })()"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2000)
        info = await pg.evaluate("""(()=>{ const t=document.getElementById('titleScreen'); const txt=t?t.innerText:''; const ver=(txt.split('\\n').find(s=>/版本|v9\\./.test(s))||'').trim();
          const n=[...document.querySelectorAll('script[src],link[href]')].filter(e=>/\\?v=/.test(e.getAttribute('src')||e.getAttribute('href')||'')).length;
          const vs=[...new Set([...document.querySelectorAll('script[src]')].map(e=>((e.getAttribute('src')||'').match(/\\?v=([^&]+)/)||[])[1]).filter(Boolean))];
          const c=document.createElement('canvas'), gl=c.getContext('webgl2')||c.getContext('webgl'); const e=gl&&gl.getExtension('WEBGL_debug_renderer_info');
          return {ver, nV:n, vValues:vs, renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):null, url:location.href}; })()""")
        await pg.screenshot(path=os.path.join(OUT, 'live_title.png'))
        try:   # 版本字樣在橫向 844×390 會被裁掉（11-09 第一次）：捲到那一行、整頁、另外直向各一張
            await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); const el=[...(t?t.querySelectorAll('*'):[])].reverse().find(e=>/版本|v9\\./.test(e.textContent||'')&&e.children.length===0); if(el) el.scrollIntoView({block:'center'}); })()")
            await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, 'live_title_ver.png'), full_page=True)
            await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1500); await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r&&getComputedStyle(r).display!=='none') r.click(); })()"); await pg.wait_for_timeout(1000); await pg.screenshot(path=os.path.join(OUT, 'live_title_portrait.png'), full_page=True)
        except Exception as e: print('extra shot failed', e, flush=True)
        print('LIVE TITLE %s' % json.dumps(info, ensure_ascii=False), flush=True)
        json.dump(info, open(os.path.join(OUT, 'live_title.json'), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    ok = (not EXP) or (EXP in info['ver'])
    print('ALL PASS' if ok else 'FAILED 1: 標題字樣不是 %s（%s）' % (EXP, info['ver']), flush=True)
asyncio.run(main())
