"""黃金葛（prop_pothos.glb）在宿舍的遊戲內截圖（Playwright 手機模擬：iPhone 390×844 直向、844×390 橫向；不是 iPhone 實機）。
修改前＝現在的遊戲（宿舍正式模型、筆筒在書桌左前角、沒有盆栽）；
修改後＝新的 dorm_interior.glb（筆筒移到書堆和筆電中間）＋在頁面裡用 GLTFLoader 把 prop_pothos.glb 放在 (1.11, 0.77, −2.36)、ry 0；
src 沒有改（接法由 LAWWW 整合）；盆栽的材質照宿舍家具加 TK.bounce(0.3, 0.4)（和 dorm_wood 一樣，房間的燈光感）。
劇情狀態：只為了截圖把 flags.POTHOS 打開（互動點「黃金葛」才會出現）、關掉條件事件——[前置／捷徑]，不是劇情流程測試。
用法（伺服器開在 LAWWW 開發分支的工作目錄）：python3 tools/blender/env_second/shots/pothos_dorm_shots.py <網址> <輸出資料夾> <before|after> [S1,S2,S3,S4]
2026-10-16（LAWWW2-B，ART-04 四種大小）：after 時同一個頁面依序只顯示 POTHOS_S1～S4 其中一個，各拍一輪；檔名多一段大小。
2026-10-17（LAWWW2-C）：宿舍換成四人房（DORM-LOFT-L）——放在祐廷 L2 書桌 +z 那一端的前緣 (−2.39, 0.76, 0.145)、ry=π/2（prop_pothos.py 的 PLACE）；鏡頭跟著改。"""
import asyncio, json, os, sys
LAWWW = os.environ.get('LAWWW_WT', '/home/user/lawwwtip_wt')
sys.path.insert(0, os.path.join(LAWWW, 'tests'))
import playlib as PL   # noqa: E402
from playwright.async_api import async_playwright   # noqa: E402

URL, OUT, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
SIZES = (sys.argv[4] if len(sys.argv) > 4 else 'S1,S2,S3,S4').split(',') if MODE == 'after' else ['']
os.makedirs(OUT, exist_ok=True)
PLACE = [-2.39, 0.76, 0.145, 1.570796]   # x, y, z, ry（prop_pothos.py 的 PLACE）
WAIT_DORM = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&GAME.G.zone==='dorm'){ let ok=false; z.group.traverse(o=>{ if(o.isMesh&&o.material&&/^dorm_(wall|floor)/.test(o.material.name||'')) ok=true; }); if(ok) return i; } await new Promise(r=>setTimeout(r,250)); } return -1; })()"
INJECT = """(async(p)=>{ const Loader=THREE_JSM.GLTFLoader.GLTFLoader; const g=await new Promise((res,rej)=>new Loader().load('assets/models/env/second_ai/prop_pothos.glb',res,undefined,rej));
  const o=g.scene; o.name='prop_pothos_preview'; o.position.set(p[0],p[1],p[2]); o.rotation.y=p[3]||0; o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; if(typeof TK!=='undefined'&&TK.bounce) TK.bounce(m.material,0.3,0.4); } });
  GAME.E.zone.group.add(o); let tris=0; o.traverse(m=>{ if(m.isMesh) tris+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3; }); return tris; })"""
POTHOS_FLAG = "(async()=>{ GAME.G.flags.POTHOS=true; for(let i=0;i<40;i++){ if(GAME.E.interactables.some(it=>it.pothos)) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
SETTLE = "(async(n)=>{ const f0=GAME.E.frame; for(let i=0;i<400&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,100)); return GAME.E.frame-f0; })"
CINE = "((e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); return true; })"
VIEWS = [('desk_corner', [-1.15, 1.42, 1.05], [-2.38, 0.82, 0.10]),          # 書桌靠衣櫃那一端（站在走道、梯子前面看過去）
         ('desk_close', [-1.68, 1.02, 0.62], [-2.38, 0.74, 0.12]),           # 近一點：盆、葉子、垂到桌緣下的藤、衣櫃門前的空隙
         ('desk_along', [-1.75, 1.15, -0.85], [-2.40, 0.78, 0.20]),          # 從書桌另一端沿著桌面看（第 1 條藤在桌面上爬）
         ('room', [0.6, 2.2, 3.0], [-2.2, 0.8, 0.0])]                        # 從門口看整個房間（盆栽在房間裡有多大）


async def one(p, landscape, hour, tag):
    b, ctx, pg, cdp, errs = await PL.launch(p, landscape=landscape)
    await pg.goto(URL); ok = await PL.wait_loaded(pg)
    await PL.load_state(pg, {'zone': 'dorm', 'hour': hour, 'pos': {'x': -1.45, 'z': 0.6, 'yaw': -1.5708}}, quiet_events=True)
    class _R:
        def note(self, t): print('note', t)
    await PL.advance_dialogs(pg, cdp, _R(), lambda st: not st['dlg'] and not st['choices'], max_steps=40)   # 讀檔後的開場旁白（「開學第三週」）點掉
    w = await pg.evaluate(WAIT_DORM); flag = await pg.evaluate(POTHOS_FLAG)
    await pg.add_style_tag(content='#dlg{display:none!important}')   # 讀檔後的旁白（「開學第三週」）有時點不掉、蓋住畫面下半部（LAWWW2-C 2026-10-17）：截圖只看房間，藏起來
    tris = None
    if MODE == 'after': tris = await pg.evaluate(INJECT + '(%s)' % json.dumps(PLACE))
    await pg.evaluate(SETTLE + '(30)')
    o = 'land' if landscape else 'port'
    shots = []
    for sz in SIZES:
        if sz: await pg.evaluate("(k=>{ const o=GAME.E.zone.group.getObjectByName('prop_pothos_preview'); o.traverse(n=>{ if(/^POTHOS_S/.test(n.name)) n.visible=(n.name==='POTHOS_'+k); }); })(%s)" % json.dumps(sz))
        t = f'{tag}_{sz}' if sz else tag
        await pg.evaluate("GAME.E.endCinematic&&GAME.E.endCinematic()"); await pg.evaluate(SETTLE + '(8)')
        await pg.screenshot(path=f'{OUT}/pothos_{MODE}_{t}_{o}_play.png'); shots.append(f'{t}_{o}_play')
        if landscape:
            for name, eye, look in VIEWS:
                await pg.evaluate(CINE + '(%s,%s)' % (json.dumps(eye), json.dumps(look))); await pg.evaluate(SETTLE + '(8)')
                await pg.screenshot(path=f'{OUT}/pothos_{MODE}_{t}_{name}.png'); shots.append(f'{t}_{name}')
    await pg.evaluate('GAME.E.endCinematic()')
    print(json.dumps({'mode': MODE, 'tag': tag, 'orient': o, 'loaded': ok, 'dorm_glb_wait': w, 'pothos_flag': flag, 'pothos_tris': tris, 'shots': shots, 'errors': errs[:3]}, ensure_ascii=False), flush=True)
    await b.close()


async def main():
    async with async_playwright() as p:
        await one(p, False, 15.5, 'day')
        await one(p, True, 15.5, 'day')
        await one(p, True, 21.0, 'night')

asyncio.run(main())
