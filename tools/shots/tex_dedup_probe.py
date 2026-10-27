"""PERF-TEX-DEDUP-1027：各棟 GLB 重複貼圖合併，改前改後量測（瀏覽器；LAWWW2-C 2026-10-27）。
校園（椰林大道）→ 溫州街 → 校園（A→B→A）；每一站等建築正式模型都載完，記：
  - GPU 上的貼圖數（renderer.info.memory.textures）、場景裡用到的不同貼圖（Texture 物件）張數與百萬像素；
  - 建築 GLB 每個從 loadOne 開始到完成的時間（總和、最長）、ASSETS.texDedup 的計數；
  - 同角度截圖（改前改後畫面要一樣；A→B→A 回到校園不能變黑）。
[捷徑] 讀檔、直接放玩家位置、路人藏起來。網址 ?nodedup＝改前（不合併）。
用法：python3 tex_dedup_probe.py 工作樹 URL（不含參數） 輸出資料夾 [--desktop] [--nodedup]"""
import asyncio, json, os, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
DESKTOP, NODEDUP = '--desktop' in sys.argv, '--nodedup' in sys.argv
HOOK = """(()=>{ if(window.__lt) return; window.__lt={}; const o=ASSETS.loadOne; ASSETS.loadOne=function(k){ const had=!!ASSETS.cache[k]||!!ASSETS.status[k]; const p=o.apply(this,arguments);
  if(!had&&String(k).startsWith('bldg.')){ const t0=performance.now(); p.then(()=>{ __lt[k]=Math.round(performance.now()-t0); },()=>{}); } return p; }; })()"""
STAT = """(()=>{ const E=GAME.E, R=E.renderer, seen=new Set(); let px=0;
  const add=v=>{ if(v&&v.isTexture&&!seen.has(v)){ seen.add(v); const im=v.image; if(im&&im.width) px+=im.width*im.height; } };
  E.scene.traverse(o=>{ for(const m of [].concat(o.material||[])){ if(!m) continue; for(const k in m) add(m[k]); if(m.uniforms) for(const k in m.uniforms){ const u=m.uniforms[k]; if(u) add(u.value); } } });
  const pend=Object.keys(ASSETS.status).filter(k=>k.startsWith('bldg.')&&!ASSETS.cache[k]);
  const lt=Object.values(window.__lt||{});
  return {zone:E.zone&&E.zone.def&&E.zone.def.id, gpuTextures:R.info.memory.textures, sceneTextures:seen.size, sceneMpix:+(px/1e6).toFixed(1), pending:pend.length,
    glbLoaded:lt.length, glbMsSum:lt.reduce((a,b)=>a+b,0), glbMsMax:lt.length?Math.max(...lt):0, dedup:ASSETS.texDedup||null, capped:ASSETS.capped|0, freed:ASSETS.freed|0}; })()"""
async def settle(pg, label, run):
    last = None; same = 0
    for _ in range(90):
        s = await pg.evaluate(STAT)
        key = (s['pending'], s['glbLoaded'], s['sceneTextures'])
        same = same + 1 if key == last and s['pending'] == 0 else 0; last = key
        if same >= 4: break
        await pg.wait_for_timeout(1000)
    await pg.evaluate("(()=>{ for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; })()")
    await pg.wait_for_timeout(2500)
    s = await pg.evaluate(STAT); s['label'] = label
    print(json.dumps(s, ensure_ascii=False), flush=True); return s
async def pose(pg, x, z, ry, yaw):
    await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={yaw}; GAME.E.cam.pitch=0.3; GAME.E.cam.distTarget=6; GAME.E.hour=11; }})()")
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('tex_dedup_probe', OUT); res = []
    async with async_playwright() as p:
        if DESKTOP:
            b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
            ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            run.setup('[環境] 電腦模擬：1280×720、沒有觸控、一般 UA（不縮貼圖）')
        else:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            run.setup('[環境] 手機模擬 844×390（貼圖上限 1024／512）')
        await pg.goto(URL + ('?nodedup' if NODEDUP else '')); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}"); await pg.evaluate(HOOK)
        run.setup('[量測] ' + ('?nodedup（改前：不合併）' if NODEDUP else '改後（合併）'))
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'weather': 'sunny', 'pos': {'x': -30, 'z': -7, 'lv': 0}}, quiet_events=True)
        await pose(pg, -30, -7, 1.5708, -1.5708)
        res.append(await settle(pg, '校園（第一次）', run)); await pose(pg, -30, -7, 1.5708, -1.5708); await pg.wait_for_timeout(2500); await run.shot(pg, 'campus1')
        await pg.evaluate("void GAME.enter('wenzhou')"); await pg.wait_for_timeout(4000)
        res.append(await settle(pg, '溫州街', run)); await run.shot(pg, 'wenzhou')
        await pg.evaluate("void GAME.enter('campus',{x:-30,z:-7,yaw:Math.PI/2})"); await pg.wait_for_timeout(4000)
        res.append(await settle(pg, '校園（回來）', run)); await pose(pg, -30, -7, 1.5708, -1.5708); await pg.wait_for_timeout(2500); await run.shot(pg, 'campus2')
        json.dump({'nodedup': NODEDUP, 'desktop': DESKTOP, 'res': res, 'errs': errs[:5]}, open(os.path.join(OUT, 'stats.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('三站都到了', [r['zone'] for r in res] == ['campus', 'wenzhou', 'campus'], json.dumps([r['zone'] for r in res]))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
