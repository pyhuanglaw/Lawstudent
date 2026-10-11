"""公館的機車換成正式模型（bldg.wz_scooter，溫州街已經在用的兩款）之前，先量三角形預算（LAWWW 23:26Z：先量、不夠就不換、交付時寫數字）。
做法（實際遊戲、Playwright 手機模擬）：進公館前把 TK.scooter 包一層——記下台數，並把套件機車標成 dyn（不參加整區靜態合併，才能單獨藏起來量）。
每個鏡頭量三次 renderer.info（藏起路人；含陰影那一輪、含玩家）：①平常（機車照舊合併時的數字，另一個分頁、不包 TK.scooter）②套件機車不合併 ③把套件機車藏起來
→ 套件機車的成本＝②−③；換成正式模型的估計＝①−（②−③）＋正式模型（每台的三角形 × 台數＋每台一片影子貼片 2 個三角形；InstancedMesh 不分台剔除，整組都畫）。
用法：python3 tools/blender/env_second/shots/gg_scooter_budget.py [網址]   → 印出 JSON（交付時寫進 VISUAL_REVIEW）"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
VIEWS = [('street_west', (-22, 1.7, 11), (-62, 4.5, 19)), ('from_gate', (2, 1.7, -36), (-4, 7, 19)), ('arcade', (-18, 1.6, 20.6), (-34, 2.2, 20.6)), ('lane', (-71, 1.7, 9), (-71, 5.5, 32))]
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
WRAP = """(()=>{ const orig=TK.scooter; window.__sc=[]; TK.scooter=function(c){ const s=orig.apply(this,arguments); s.userData.dyn=true; window.__sc.push(s); return s; }; })()"""


async def measure(p, wrap):
    b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
    await pg.goto(URL); await PL.wait_loaded(pg)
    if wrap: await pg.evaluate(WRAP)
    await PL.load_state(pg, {'zone': 'gongguan', 'hour': 17.5, 'pos': {'x': -30, 'z': 14, 'yaw': 1.5708}}, quiet_events=True)
    await pg.evaluate("(async()=>{ for(let i=0;i<240;i++){ if(GAME.E.zone.group.children.some(o=>o.name==='gongguan_shops_glb')) return; await new Promise(r=>setTimeout(r,250)); } })()")
    out = {'views': {}}
    for name, eye, look in VIEWS: out['views'][name] = {'on': await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))}
    if wrap:
        out['kit'] = await pg.evaluate("""(()=>{ const L=window.__sc.filter(s=>s.parent); let tris=0, shadowTris=0; const t=g=>g.index?g.index.count/3:g.attributes.position.count/3;
            L[0].traverse(o=>{ if(o.isMesh){ tris+=t(o.geometry); if(o.castShadow) shadowTris+=t(o.geometry); } }); return {count:L.length, trisEach:tris, shadowTrisEach:shadowTris}; })()""")
        await pg.evaluate("window.__sc.forEach(s=>s.visible=false)")
        for name, eye, look in VIEWS: out['views'][name]['off'] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        out['formal'] = await pg.evaluate("""(async()=>{ const c=await ASSETS.loadOne('bldg.wz_scooter'); const r={}; const t=g=>g.index?g.index.count/3:g.attributes.position.count/3;
            for(const v of ['scooter_a','scooter_b']){ let n=0, m=0; c.scene.getObjectByName(v).traverse(o=>{ if(o.isMesh){ n+=t(o.geometry); m++; } }); r[v]={tris:n, meshes:m}; } return r; })()""")
    out['errors'] = errs[:3]
    await b.close(); return out


async def main():
    async with async_playwright() as p:
        base = await measure(p, False); wrap = await measure(p, True)
    k, f = wrap['kit'], wrap['formal']; n = k['count']; nb = sum(1 for i in range(n) if i % 3 == 2); na = n - nb   # 和溫州街一樣：三台裡一台是復古款
    formal_tris = na * f['scooter_a']['tris'] + nb * f['scooter_b']['tris'] + 2 * n
    res = {'scooters': n, 'kit_each': k, 'formal_each': f, 'formal_total_tris': formal_tris, 'views': {}}
    for name, *_ in VIEWS:
        on, off, cur = wrap['views'][name]['on'], wrap['views'][name]['off'], base['views'][name]['on']
        kit_cost = on['tris'] - off['tris']
        res['views'][name] = {'now_tris': cur['tris'], 'now_calls': cur['calls'], 'kit_scooter_tris_in_view': kit_cost, 'estimate_tris_with_formal': cur['tris'] - kit_cost + formal_tris, 'limit': 420000}
    res['fits'] = all(v['estimate_tris_with_formal'] <= 420000 for v in res['views'].values())
    res['errors'] = base['errors'] + wrap['errors']
    print(json.dumps(res, ensure_ascii=False, indent=1))


asyncio.run(main())
