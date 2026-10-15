"""共同教學館、大一女舍合併材質前後的遊戲截圖（同一個鏡頭、同一個時間）：讀檔到校園 15:00、凍結時鐘、藏起路人，直接設鏡頭。
用法：python3 gt_fd_shots.py <網址> <輸出資料夾> <標籤（before／after）> [tests 資料夾]"""
import asyncio, json, os, sys
sys.path.insert(0, sys.argv[4] if len(sys.argv) > 4 else os.path.join(os.getcwd(), 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
VIEWS = [('gongtong_front', (2, 1.7, 13.5), (2, 7.5, 33)), ('gongtong_corridor', (-22, 1.7, 21), (-13, 3.2, 32)), ('gongtong_palms', (10, 1.6, 16.5), (-2, 4.5, 20)),
         ('freshman_front', (-93, 1.7, 49), (-93, 8.5, 66)), ('freshman_bridge', (-88, 1.6, 58), (-97, 4.5, 68))]
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
SHOT = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""

async def main():
    os.makedirs(OUT, exist_ok=True); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); await PL.wait_loaded(pg); await pg.evaluate(SETTLED)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'pos': {'x': 2, 'z': 12, 'yaw': 3.1416}}, quiet_events=True)
        await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=15; E.hour=15; E.applyTime(15); })()")
        await pg.evaluate("(async()=>{ for(const k of ['bldg.campus_gongtong','bldg.campus_freshman']) if(ASSETS.manifest[k]) await ASSETS.loadOne(k).catch(()=>null); await new Promise(r=>setTimeout(r,2500)); })()")
        await pg.evaluate(SETTLED)
        for name, eye, look in VIEWS:
            res[name] = await pg.evaluate(SHOT + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
            await pg.screenshot(path=os.path.join(OUT, '%s_%s.png' % (name, TAG)))
        res['errors'] = errs[:5]
        await b.close()
    print(json.dumps(res)); json.dump(res, open(os.path.join(OUT, 'calls_%s.json' % TAG), 'w'))

asyncio.run(main())
