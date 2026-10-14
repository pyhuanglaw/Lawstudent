"""醉月湖（⑩ campus_lake.glb）接在 LAWWW 最新開發分支之前的實測：導航、穿模、腳和地板、鏡頭被亭子屋頂擋住（LAWWW2；使用者 2026-10-14 把「醉月湖、湖心亭的導航及穿模」排在第一）。
不改任何工作目錄的 src：Playwright 攔截 src/zones3d.js（換成 scratchpad 裡套了建議改法的版本）和 campus_lake.glb（從 LAWWW2 的分支讀）。
  proc＝現在的遊戲（程序化的湖、現在的導航）
  glb ＝正式模型（lake_fallback 藏起來）＋建議的導航（亭子 2.0 m＋柱子的格子擋起來）＋木棧道、亭子的地板高度 0.05（腳不沉進木板）
  glb_st＝glb＋亭子屋頂、橫梁的材質加「樹幹透視」（擋住鏡頭和人的時候網點透空）
真實操作：點地移動（PL.go_to：和玩家一樣點畫面，走不動才用搖桿），不瞬移、不用 ?turbo；讀檔到湖南岸步道是 [前置]，關掉條件事件。
Playwright＋SwiftShader 手機模擬（iPhone 844×390 橫向、390×844 直向），不是 iPhone 實機。
用法：python3 lake_integration_check.py <網址> <輸出資料夾> <proc|glb|glb_st> [patched zones3d.js] [campus_lake.glb]"""
import asyncio, json, math, os, sys, time
LAWWW = os.environ.get('LAWWW_WT', '/home/user/lawwwtip_wt')
sys.path.insert(0, os.path.join(LAWWW, 'tests'))
import playlib as PL   # noqa: E402
from playwright.async_api import async_playwright   # noqa: E402

URL, OUT, VAR = sys.argv[1], sys.argv[2], sys.argv[3]
ZJS = sys.argv[4] if len(sys.argv) > 4 else None
GLBF = sys.argv[5] if len(sys.argv) > 5 else None
os.makedirs(OUT, exist_ok=True)
CX, CZ = -36.0, -112.0                       # 方案 A 的湖中心（zones3d.js lake(g,nav,-36,-112,…)）
PX, PZ, PR = CX - 3, CZ + 0.6, 2.7
BWZ0, BWZ1 = PZ + PR - 0.4, CZ + 13.4
COLS = [(PX + math.cos(k * math.pi / 3) * 2.3, PZ + math.sin(k * math.pi / 3) * 2.3) for k in range(6)]   # 正式模型的柱子（程序化的在半徑 2.4）
COLS_PROC = [(PX + math.cos(k * math.pi / 3) * 2.4, PZ + math.sin(k * math.pi / 3) * 2.4) for k in range(6)]
BODY, COL_RAD, APO = 0.33, 0.105, 2.7 * math.cos(math.pi / 6)
RAIL_IN = 1.055 if VAR != 'proc' else 0.77   # 木棧道欄杆內側離中線（正式模型 ±1.055；程序化 ±(1.7/2−0.04)−0.03）

INJECT = """(async()=>{ const L=new THREE_JSM.GLTFLoader.GLTFLoader(); const g=await new Promise((res,rej)=>L.load('assets/models/env/second_ai/campus_lake.glb',res,undefined,rej));
  const z=GAME.E.zone, o=g.scene; o.name='campus_lake_glb'; o.position.set(%f,0,%f); z.group.add(o);
  let hid=0; z.group.traverse(m=>{ if(m.name==='lake_fallback'){ m.visible=false; hid=m.children.length; } });
  o.traverse(m=>{ if(m.isMesh){ m.castShadow=!/rock|rim/.test(m.material.name||''); m.receiveShadow=true; } });
  if(%s){ let n=0; o.traverse(m=>{ if(m.isMesh&&/lake_pavilion_(tile|soffit|gold|teal|red)/.test(m.material.name||'')&&GAME.E.patchSeeThrough){ m.material.userData.seeThrough=true; GAME.E.patchSeeThrough(m.material); n++; } }); window.__st=n; }
  return {hid, meshes:(()=>{ let n=0; o.traverse(m=>{ if(m.isMesh) n++; }); return n; })()}; })()""" % (CX, CZ, 'true' if VAR == 'glb_st' else 'false')
TRACK = """(()=>{ window.__trk=[]; const E=GAME.E; E.addExtra({obj:new THREE.Group(), update(){ const p=E.player.obj.position; window.__trk.push([+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)]); }}); return true; })()"""
# 鏡頭到人（頭、胸）之間被湖的網格擋住嗎（正式模型：campus_lake_glb；程序化：lake_fallback 以外的湖心亭網格合併在區域裡，用顏色找）
OCC = """(()=>{ const E=GAME.E, cam=E.camera, p=E.player.obj.position; const tg=[]; const o=E.zone.group.getObjectByName('campus_lake_glb');
  if(o&&o.visible) o.traverse(m=>{ if(m.isMesh) tg.push(m); }); else E.zone.group.traverse(m=>{ if(m.isMesh&&m.material&&m.material.color&&[0x3f4a46,0x8e3a2c].includes(m.material.color.getHex())) tg.push(m); });
  const rc=new THREE.Raycaster(); const out={};
  for(const [nm,h] of [['head',1.55],['chest',1.15]]){ const t=new THREE.Vector3(p.x,p.y+h,p.z); const d=t.clone().sub(cam.position); const L=d.length(); rc.set(cam.position,d.normalize()); rc.far=L-0.05;
    const hit=rc.intersectObjects(tg,false)[0]; out[nm]=hit?{by:hit.object.material.name||('#'+hit.object.material.color.getHexString()),at:+hit.distance.toFixed(2),of:+L.toFixed(2),st:!!hit.object.material.userData.seeThrough}:null; }
  out.cam=[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)]; out.player=[+p.x.toFixed(2),+p.y.toFixed(3),+p.z.toFixed(2)]; return out; })()"""


class Run:
    def __init__(self): self.notes = []
    def note(self, t): self.notes.append(t); print('note', t, flush=True)


async def route(pg):
    if ZJS:
        body = open(ZJS, 'rb').read()
        await pg.route('**/src/zones3d.js', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript; charset=utf-8'}))
    if GLBF:
        gb = open(GLBF, 'rb').read()
        await pg.route('**/assets/models/env/second_ai/campus_lake.glb', lambda r: r.fulfill(status=200, body=gb, headers={'content-type': 'model/gltf-binary'}))


def stats(trk, cols):
    s = {'samples': len(trk)}
    pav = [(x, y, z) for x, y, z in trk if math.hypot(x - PX, z - PZ) < 2.75 and z < PZ + APO]
    brd = [(x, y, z) for x, y, z in trk if BWZ0 <= z <= BWZ1 and abs(x - PX) < 1.6]
    if pav:
        g = min(math.hypot(x - cx, z - cz) - BODY - COL_RAD for x, y, z in pav for cx, cz in cols)
        e = -99.0
        for x, y, z in pav:
            for k in range(6):
                a = (k + 0.5) * math.pi / 3
                if abs(math.sin(a) - 1) < 1e-6: continue          # 南邊接木棧道
                e = max(e, (x - PX) * math.cos(a) + (z - PZ) * math.sin(a) + BODY - APO)
        s['pavilion'] = {'n': len(pav), 'col_gap_min_m': round(g, 3), 'edge_overhang_max_m': round(e, 3), 'feet_y': [round(min(y for _, y, _ in pav), 3), round(max(y for _, y, _ in pav), 3)]}
    if brd:
        s['boardwalk'] = {'n': len(brd), 'body_from_center_max_m': round(max(abs(x - PX) for x, _, _ in brd) + BODY, 3), 'rail_inner_m': RAIL_IN,
                          'feet_y': [round(min(y for _, y, _ in brd), 3), round(max(y for _, y, _ in brd), 3)]}
    return s


async def main():
    run = Run(); res = {'variant': VAR, 'waypoints': [], 'occlusion': {}, 'shots': []}
    WPS = [('boardwalk_mid', PX, (BWZ0 + BWZ1) / 2), ('boardwalk_end', PX, BWZ0 + 0.6), ('pav_center', PX, PZ)]
    for k in range(6):   # 往六根柱子走（擋柱子的格子），再往六個邊（平台邊緣）
        a = k * math.pi / 3; WPS.append(('to_col%d' % k, PX + math.cos(a) * 2.0, PZ + math.sin(a) * 2.0))
        b = (k + 0.5) * math.pi / 3
        if abs(math.sin(b) - 1) > 1e-6: WPS.append(('to_edge%d' % k, PX + math.cos(b) * 2.05, PZ + math.sin(b) * 2.05))
    WPS += [('pav_center2', PX, PZ), ('shore', PX, CZ + 14.6)]
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await route(pg)
        await pg.goto(URL); res['loaded'] = await PL.wait_loaded(pg)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 13.0, 'pos': {'x': PX, 'z': CZ + 14.6, 'lv': 0, 'yaw': 0.0}}, quiet_events=True)
        await PL.advance_dialogs(pg, cdp, run, lambda st: not st['dlg'] and not st['choices'], max_steps=30)
        if VAR != 'proc': res['inject'] = await pg.evaluate(INJECT)
        await pg.evaluate(TRACK); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'{OUT}/lake_{VAR}_start.png')
        for nm, x, z in WPS:
            t0 = time.time(); ok = await PL.go_to(pg, cdp, run, x, z, 0.45, nm, max_s=240)
            st = await PL.state(pg); res['waypoints'].append({'name': nm, 'target': [round(x, 2), round(z, 2)], 'reached': ok, 'at': [round(st['x'], 2), round(st['z'], 2)], 's': round(time.time() - t0)})
            print(json.dumps(res['waypoints'][-1], ensure_ascii=False), flush=True)
            if nm in ('boardwalk_mid', 'pav_center', 'to_col1', 'to_edge3', 'pav_center2'):
                await pg.wait_for_timeout(1200); res['occlusion'][nm] = await pg.evaluate(OCC)
                await pg.screenshot(path=f'{OUT}/lake_{VAR}_{nm}.png'); res['shots'].append(nm)
        trk = await pg.evaluate('window.__trk')
        res['stats'] = stats(trk, COLS if VAR != 'proc' else COLS_PROC)
        res['errors'] = errs[:5]
        await b.close()
        # 直向：亭子中間（讀檔到亭子中間是 [前置]）
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=False)
        await route(pg); await pg.goto(URL); await PL.wait_loaded(pg)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 13.0, 'pos': {'x': PX, 'z': PZ + 0.8, 'lv': 0, 'yaw': 0.0}}, quiet_events=True)
        await PL.advance_dialogs(pg, cdp, run, lambda st: not st['dlg'] and not st['choices'], max_steps=30)
        if VAR != 'proc': await pg.evaluate(INJECT)
        await pg.wait_for_timeout(2500); res['occlusion']['portrait_pav'] = await pg.evaluate(OCC)
        await pg.screenshot(path=f'{OUT}/lake_{VAR}_portrait_pav.png')
        res['errors_portrait'] = errs[:5]
        await b.close()
    res['notes'] = run.notes
    json.dump(res, open(f'{OUT}/lake_{VAR}.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({k: res[k] for k in ('stats', 'occlusion', 'errors')}, ensure_ascii=False))

asyncio.run(main())
