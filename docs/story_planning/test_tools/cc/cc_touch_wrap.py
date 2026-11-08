"""CC-B（帳號 B）11-08：包住 tests/touch_flow_wenzhou.py（不改原檔）——頁面載入前掛監看：手機自己打開時記 PHONE.pending 的 tag／人／內容；
每 2 秒記 driver＝proc 的路人（id、位置、從頁面載入算起幾秒）。結束時印出來。判定＝BB。
用法：LW_TESTS=<wt>/tests python3 cc_touch_wrap.py <url>"""
import os, sys, runpy, asyncio
T = os.environ['LW_TESTS']; sys.path.insert(0, T)
WATCH = r"""(()=>{ window.__phLog=[]; window.__procLog={}; let open=false;
  setInterval(()=>{ try{ const ph=document.getElementById('phone'); const o=!!ph&&!ph.classList.contains('hide');
    if(o&&!open&&typeof PHONE!=='undefined'&&typeof GAME!=='undefined'&&GAME.G){ window.__phLog.push(window.__l={t:Math.round(performance.now()/1000), day:GAME.G.day, h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone, pending:(PHONE.pending(GAME.G)||[]).map(m=>({tag:m.tag||null, from:m.from||null, th:m.th||null, text:String(m.text||'').slice(0,40), day:m.day, until:m.until!=null?m.until:(m.ask&&m.ask.until!=null?m.ask.until:null)}))}); console.log('CCW phone '+JSON.stringify(window.__l)); }
    open=o;
    if(typeof GAME!=='undefined'&&GAME.E&&GAME.E.npcs){ for(const n of GAME.E.npcs){ const d=n.obj&&n.obj.userData&&n.obj.userData.driver; const k=(n.id||n.name||'?')+'@'+(GAME.G&&GAME.G.zone); if(d==='proc'){ const r=window.__procLog[k]||(window.__procLog[k]={first:Math.round(performance.now()/1000), pos:[+n.obj.position.x.toFixed(1),+n.obj.position.z.toFixed(1)], spec:(n.spec&&(n.spec.model||n.spec.id))||null}); r.last=Math.round(performance.now()/1000); if(!r.logged){ r.logged=1; console.log('CCW proc '+k+' '+JSON.stringify(r)); } } } }
  }catch(e){} },500); })()"""
from playwright.async_api import Browser, BrowserContext
_nc = Browser.new_context
_ctxs = []
async def new_context(self, *a, **k):
    c = await _nc(self, *a, **k); await c.add_init_script(WATCH); c.on('console', lambda m: print('  '+m.text, flush=True) if m.text.startswith('CCW') else None); _ctxs.append(c); return c
Browser.new_context = new_context
_bclose = Browser.close
async def bclose(self, *a, **k):
    for c in _ctxs:
        for pg in c.pages:
            try: print('CC 監看 手機自己打開：', await pg.evaluate("JSON.stringify(window.__phLog||[])"), flush=True); print('CC 監看 proc 路人：', await pg.evaluate("JSON.stringify(window.__procLog||{})"), flush=True)
            except Exception as e: print('CC 監看 讀不到：', e, flush=True)
    return await _bclose(self, *a, **k)
Browser.close = bclose
sys.argv = [os.path.join(T, 'touch_flow_wenzhou.py')] + sys.argv[1:]
runpy.run_path(sys.argv[0], run_name='__main__')
