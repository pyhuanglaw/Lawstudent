"""公館機車（⑧）換成正式模型分組 InstancedMesh：同一個鏡頭修改前／後的 draw call 與三角形（Playwright 手機模擬，renderer.info）。
修改前＝上一版的遊戲（機車是套件、併進整區靜態合併）：另一個 server（沒有這次修改的工作目錄）；修改後＝這一版。兩邊都在建公館之前等資產全部載完（SETTLED）、藏起路人與騎腳踏車的路人、17:30。
用法：python3 tools/blender/env_second/shots/ggsc_perf.py <修改後的網址> [修改前的網址（預設 http://127.0.0.1:8765/index.html：主工作目錄，沒有這次的修改）] → 印出 JSON"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
from playwright.async_api import async_playwright
import playlib as PL

AFTER = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8778/index.html'
BEFORE = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:8765/index.html'   # 主工作目錄（分支 claude/second-ai-env-art，沒有這次的修改）
VIEWS = [('street_west', (-22, 1.7, 11), (-62, 4.5, 19)), ('from_gate', (2, 1.7, -36), (-4, 7, 19)), ('arcade', (-18, 1.6, 20.6), (-34, 2.2, 20.6)), ('lane', (-71, 1.7, 9), (-71, 5.5, 32)),
         ('north_row', (-35.5, 1.6, -28.6), (-42, 0.7, -32.2)), ('south_row', (-53, 1.6, 10.6), (-59.5, 0.7, 6.8))]
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""


async def measure(p, url, formal):
    b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
    await pg.goto(url); await PL.wait_loaded(pg); await pg.evaluate(SETTLED)
    await PL.load_state(pg, {'zone': 'gongguan', 'hour': 17.5, 'pos': {'x': -30, 'z': 14, 'yaw': 1.5708}}, quiet_events=True)
    names = ['gongguan_shops_glb'] + (['gg_scooters_glb'] if formal else [])
    ok = await pg.evaluate("(async(ns)=>{ for(let i=0;i<240;i++){ if(ns.every(n=>GAME.E.zone.group.children.some(o=>o.name===n))) return true; await new Promise(r=>setTimeout(r,250)); } return false; })(%s)" % json.dumps(names))
    await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
    street = await pg.evaluate("(()=>{ let n=0; GAME.E.zone.group.traverse(o=>{ if(o.userData&&o.userData.formal==='prop.street') n++; }); return n; })()")
    out = {'loaded': ok, 'streetProps': street, 'views': {}}
    for name, eye, look in VIEWS: out['views'][name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
    out['errors'] = errs[:3]; await b.close(); return out


async def main():
    async with async_playwright() as p:
        bef = await measure(p, BEFORE, False); aft = await measure(p, AFTER, True)
    res = {'before_url': BEFORE, 'after_url': AFTER, 'loaded': [bef['loaded'], aft['loaded']], 'streetProps': [bef['streetProps'], aft['streetProps']], 'views': {}, 'errors': bef['errors'] + aft['errors']}
    for name, *_ in VIEWS:
        a, f = bef['views'][name], aft['views'][name]
        res['views'][name] = {'calls': [a['calls'], f['calls'], round(f['calls'] / a['calls'], 3)], 'tris': [a['tris'], f['tris'], round(f['tris'] / a['tris'], 3)]}
    res['tris_le_420k'] = all(v['tris'][1] <= 420000 for v in res['views'].values())
    print(json.dumps(res, ensure_ascii=False, indent=1))
    ok = res['tris_le_420k'] and all(res['loaded']) and res['streetProps'][0] == res['streetProps'][1] and not res['errors']
    print('ALL PASS' if ok else 'FAILED')


asyncio.run(main())
