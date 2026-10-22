"""換區域時路人的記憶體有沒有越換越多（PERF-CROWD-LOD-1021，LAWWW 2026-10-21 20:55 要求：遠距離版本的網格、貼圖要跟著放掉）。
校園 15:00（路人最多）↔ 公館來回三趟，每一站停一下，記 renderer.info.memory（geometries、textures）、shader 程式數、
場景裡遠距離版本的網格數（name＝npc_far）、ASSETS 快取裡帶遠距離版本的底模數。路人底模池照遊戲原本的方式輪換（換區域會放掉舊的、載新的），
所以「放掉」的路徑會被走到。SwiftShader：只看數量，不看時間。
用法（先開 http server）：python3 tools/shots/crowd_mem_probe.py <URL（不含參數）> <輸出.json>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
INFO = """(()=>{ const E=GAME.E, i=E.renderer.info; let far=0, farVis=0; E.scene.traverse(o=>{ if(o.name==='npc_far'){ far++; if(o.visible) farVis++; } });
  const C=ASSETS.cache||{}; const ks=Object.keys(C); const lod=ks.filter(k=>C[k]&&C[k].lod).length, anon=ks.filter(k=>/^char\\.npc_|bl_npc/.test(k)).length;
  return {zone:E.zone&&E.zone.def&&E.zone.def.id, geo:i.memory.geometries, tex:i.memory.textures, prog:i.programs?i.programs.length:0, far, farVis, cacheLod:lod, cacheAnon:anon,
    pool:CHAR.anonPool&&CHAR.anonPool.cur?CHAR.anonPool.cur.slice():null, extras:E.npcs.filter(n=>n.isExtra).length}; })()"""

async def main():
    run = L.Run('crowd_mem_probe', os.path.dirname(os.path.abspath(OUT)) or '.'); res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'weather': 'clear', 'pos': None}, quiet_events=True)
        run.setup('[前置] 讀檔到校園 15:00（quiet_events）')
        for step, (zone, wait) in enumerate([('campus', 45), ('gongguan', 30), ('campus', 45), ('gongguan', 30), ('campus', 45), ('gongguan', 30), ('campus', 45)]):
            if step: await pg.evaluate("(async()=>{ await GAME.enter('%s'); })()" % zone)
            await pg.wait_for_timeout(wait * 1000)
            r = await pg.evaluate(INFO); r['step'] = step; res.append(r)
            print(json.dumps(r, ensure_ascii=False), flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return run.finish()

sys.exit(asyncio.run(main()))
