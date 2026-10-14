"""黃金葛（prop_pothos.glb）在宿舍的遊戲內截圖（Playwright 手機模擬：iPhone 390×844 直向、844×390 橫向；不是 iPhone 實機）。
修改前＝現在的遊戲（宿舍正式模型、筆筒在書桌左前角、沒有盆栽）；
修改後＝新的 dorm_interior.glb（筆筒移到書堆和筆電中間）＋在頁面裡用 GLTFLoader 把 prop_pothos.glb 放在 (1.11, 0.77, −2.36)、ry 0；
src 沒有改（接法由 LAWWW 整合）；盆栽的材質照宿舍家具加 TK.bounce(0.3, 0.4)（和 dorm_wood 一樣，房間的燈光感）。
劇情狀態：只為了截圖把 flags.POTHOS 打開（互動點「黃金葛」才會出現）、關掉條件事件——[前置／捷徑]，不是劇情流程測試。
用法（伺服器開在 LAWWW 開發分支的工作目錄）：python3 tools/blender/env_second/shots/pothos_dorm_shots.py <網址> <輸出資料夾> <before|after>"""
import asyncio, json, os, sys
LAWWW = os.environ.get('LAWWW_WT', '/home/user/lawwwtip_wt')
sys.path.insert(0, os.path.join(LAWWW, 'tests'))
import playlib as PL   # noqa: E402
from playwright.async_api import async_playwright   # noqa: E402

URL, OUT, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
PLACE = [1.11, 0.77, -2.36]
WAIT_DORM = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&GAME.G.zone==='dorm'){ let ok=false; z.group.traverse(o=>{ if(o.isMesh&&o.material&&/^dorm_(wall|floor)/.test(o.material.name||'')) ok=true; }); if(ok) return i; } await new Promise(r=>setTimeout(r,250)); } return -1; })()"
INJECT = """(async(p)=>{ const Loader=THREE_JSM.GLTFLoader.GLTFLoader; const g=await new Promise((res,rej)=>new Loader().load('assets/models/env/second_ai/prop_pothos.glb',res,undefined,rej));
  const o=g.scene; o.name='prop_pothos_preview'; o.position.set(p[0],p[1],p[2]); o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; if(typeof TK!=='undefined'&&TK.bounce) TK.bounce(m.material,0.3,0.4); } });
  GAME.E.zone.group.add(o); let tris=0; o.traverse(m=>{ if(m.isMesh) tris+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3; }); return tris; })"""
POTHOS_FLAG = "(async()=>{ GAME.G.flags.POTHOS=true; for(let i=0;i<40;i++){ if(GAME.E.interactables.some(it=>it.pothos)) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
SETTLE = "(async(n)=>{ const f0=GAME.E.frame; for(let i=0;i<400&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,100)); return GAME.E.frame-f0; })"
CINE = "((e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); return true; })"
VIEWS = [('desk_corner', [0.05, 1.42, -1.25], [1.12, 0.82, -2.42]),          # 書桌左前角（站在床尾和書桌之間看過去）
         ('desk_close', [0.55, 1.05, -1.75], [1.12, 0.78, -2.40]),           # 近一點：盆、葉子、垂到桌緣下的藤
         ('room', [-1.6, 2.35, 2.2], [1.0, 0.8, -2.2])]                      # 從門口看整個房間（盆栽在房間裡有多大）


async def one(p, landscape, hour, tag):
    b, ctx, pg, cdp, errs = await PL.launch(p, landscape=landscape)
    await pg.goto(URL); ok = await PL.wait_loaded(pg)
    await PL.load_state(pg, {'zone': 'dorm', 'hour': hour, 'pos': {'x': 0.45, 'z': -1.75, 'yaw': 2.507}}, quiet_events=True)
    class _R:
        def note(self, t): print('note', t)
    await PL.advance_dialogs(pg, cdp, _R(), lambda st: not st['dlg'] and not st['choices'], max_steps=40)   # 讀檔後的開場旁白（「開學第三週」）點掉
    w = await pg.evaluate(WAIT_DORM); flag = await pg.evaluate(POTHOS_FLAG)
    tris = None
    if MODE == 'after': tris = await pg.evaluate(INJECT + '(%s)' % json.dumps(PLACE))
    await pg.evaluate(SETTLE + '(30)')
    o = 'land' if landscape else 'port'
    await pg.screenshot(path=f'{OUT}/pothos_{MODE}_{tag}_{o}_play.png')
    btn = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('button,div')].find(e=>e.offsetParent&&/黃金葛/.test(e.textContent||'')&&e.children.length===0); return b?b.textContent.trim():null; })()")
    shots = []
    if landscape:
        for name, eye, look in VIEWS:
            await pg.evaluate(CINE + '(%s,%s)' % (json.dumps(eye), json.dumps(look))); await pg.evaluate(SETTLE + '(8)')
            await pg.screenshot(path=f'{OUT}/pothos_{MODE}_{tag}_{name}.png'); shots.append(name)
        await pg.evaluate('GAME.E.endCinematic()')
    print(json.dumps({'mode': MODE, 'tag': tag, 'orient': o, 'loaded': ok, 'dorm_glb_wait': w, 'pothos_flag': flag, 'button': btn, 'pothos_tris': tris, 'shots': shots, 'errors': errs[:3]}, ensure_ascii=False), flush=True)
    await b.close()


async def main():
    async with async_playwright() as p:
        await one(p, False, 15.5, 'day')
        await one(p, True, 15.5, 'day')
        await one(p, True, 21.0, 'night')

asyncio.run(main())
