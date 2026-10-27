"""X14（PERF-ZONE-ENTER-1018，LAWWW2-C 2026-10-27）：第二次回溫州街淡入那一格的 texSubImage2D 是哪張貼圖。電腦模式；公館 → 溫州街 → 咖啡廳 → 溫州街（第二次），第二次的時候包住 gl.texSubImage2D／texImage2D，記超過 30 ms 的。
用法：python3 tools/shots/x14_tex.py 工作樹 URL 輸出.json"""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]
HOOK = """(()=>{ const R=GAME.E.renderer, gl=R.getContext(); window.__tx=[]; const find=wt=>{ let hit=null; GAME.E.scene.traverse(o=>{ if(hit||!o.material) return; for(const m of [].concat(o.material)){ if(!m) continue; const vals=[]; for(const k in m) vals.push([k,m[k]]); if(m.uniforms) for(const k in m.uniforms) vals.push(['u.'+k,m.uniforms[k]&&m.uniforms[k].value]);
    for(const [k,v] of vals){ if(v&&v.isTexture&&R.properties.get(v).__webglTexture===wt){ hit={tex:v.name||'?',key:k,mat:m.name||'?',obj:o.name||'?',parent:(o.parent&&o.parent.name)||'?',w:v.image&&v.image.width,h:v.image&&v.image.height,isCanvas:!!(v.image&&v.image.getContext),ver:v.version}; return; } } } }); return hit; };
  for(const fn of ['texSubImage2D','texImage2D']){ const orig=gl[fn].bind(gl); gl[fn]=function(...a){ const t=performance.now(); const r=orig(...a); const dt=performance.now()-t; if(dt>30){ const wt=gl.getParameter(gl.TEXTURE_BINDING_2D); const src=a[a.length-1]; window.__tx.push({fn,ms:Math.round(dt),srcW:src&&src.width,srcH:src&&src.height,who:find(wt)}); } return r; }; } })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 15.0, 'weather': 'clear', 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(20000)
        for z in ('wenzhou', 'cafe'):
            await pg.evaluate("(async()=>{ await GAME.enter('%s'); })()" % z); await pg.wait_for_timeout(15000)
        await pg.evaluate(HOOK)
        await pg.evaluate("(async()=>{ await GAME.enter('wenzhou'); })()"); await pg.wait_for_timeout(15000)
        tx = await pg.evaluate("window.__tx"); json.dump(tx, open(sys.argv[3], "w"), ensure_ascii=False); print("n", len(tx)); print('errs', errs[:3]); await b.close()
asyncio.run(main())
