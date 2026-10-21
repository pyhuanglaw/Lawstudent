# LAWWW2-C 2026-10-21 量測工具（不是遊戲檔、不是正式測試）：放在 repo 根目錄的 tests/ 旁邊用；python3 這個檔 工作樹 URL 存檔 [小時]
"""溫州街晚上變重：照 BB 的 perf_probe 讀使用者 9/25 存檔、GAME.enter('wenzhou') 19:30，四個方向各量一次——
renderer.info（含陰影那一輪）＋分類（人物、各個模型），主畫面那一輪在視錐內、陰影那一輪在陰影相機內。用法：python3 wz_night_cats.py 工作樹 URL 存檔 [小時]"""
import os, sys, json, asyncio
sys.path.insert(0, sys.argv[1] + '/tests'); import playlib as L
from playwright.async_api import async_playwright
URL, SAVE = sys.argv[2], sys.argv[3]; H = float(sys.argv[4]) if len(sys.argv) > 4 else 19.5
Q = """(async()=>{ const E=GAME.E, R=E.renderer; const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).map(x=>[x.obj,x.obj&&x.obj.parent])).filter(a=>a[0]&&a[1]); hid.forEach(a=>a[1].remove(a[0]));
  const out=[]; const yaw0=E.cam.yaw; for(let k=0;k<4;k++){ E.cam.yaw=yaw0+k*Math.PI/2; await new Promise(r=>setTimeout(r,2500)); R.shadowMap.needsUpdate=true; const au=R.shadowMap.autoUpdate; E.render(); const a={calls:R.info.render.calls, tris:R.info.render.triangles}; R.shadowMap.autoUpdate=false; R.shadowMap.needsUpdate=false; E.render(); const b={calls:R.info.render.calls, tris:R.info.render.triangles}; R.shadowMap.autoUpdate=au; out.push({k, withShadow:a, noShadowPass:b}); }
  E.cam.yaw=yaw0; hid.forEach(a=>a[1].add(a[0])); return out; })()"""

async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(4000)
        for i in range(30):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(500); continue
            break
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % H); await pg.evaluate("void GAME.enter('wenzhou')")
        await pg.wait_for_timeout(8000)
        r = await pg.evaluate(Q); print(json.dumps(r, ensure_ascii=False))
        await b.close()
asyncio.run(main())
