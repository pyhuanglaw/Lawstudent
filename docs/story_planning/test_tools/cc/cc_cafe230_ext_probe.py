"""CC-C（帳號 C）11-04：CAFE230_ext 的 refcam 截圖（BB-C 20:15 選 ③：先用 Blender 的 street 鏡頭換成遊戲座標，數字標「近似角度、只當參考」；正式等 LAWWW2 給 refcam）。只截圖，不判。
  鏡頭：tools/blender/env_second/cafe_exterior.py 的 render_views 'street'（建築自己的座標：正面朝 +z、原點在正面中央地面，和 TK.apartment 一樣）
        眼 (−5.5, 1.7, 9.5) → 看 (0.5, 2.6, −0.5)、22 mm（36 mm 寬感光元件＝水平 FOV 78.6°）。
  換成遊戲座標：2:30 AM 正式模型接在套件建築 cafeB 底下（zones3d.js attachCafeExterior）——在場景裡找 GLB 的 SIGN_FACE，往上找到 cafeB，用 cafeB.localToWorld。
  畫面 1672×941（和參考圖 wz_230am_ext 一樣大，可以直接疊圖）；水平 FOV 照 22 mm＝78.6° → 垂直 FOV 換算。另外記 1280×800（Blender 算圖的大小）那一張。
  HOURS（預設 14、21）各一張；人、玩家、HUD 藏起來（cc_det）；停主迴圈、手動畫一幀（同 cc_ade_v2_shots_probe 的 AIM）。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）、固定鏡頭——不是玩家看到的流程。Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
  之後：參考圖先左右翻（參考圖轉角在左、遊戲在右），再跑 tools/art/same_angle_check.py --mode shop（數字只當參考）。
用法：LW_TESTS=<wt>/tests [HOURS=14,21] python3 cc_cafe230_ext_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
HOURS = [float(x) for x in (os.environ.get('HOURS') or '14,21').split(',') if x.strip()]
FAILS = []
EYE_L, LOOK_L, LENS = [-5.5, 1.7, 9.5], [0.5, 2.6, -0.5], 22.0
HFOV = 2 * math.degrees(math.atan(18.0 / LENS))
SIZES = [(1672, 941), (1280, 800)]


def vfov(w, h):
    return 2 * math.degrees(math.atan(math.tan(math.radians(HFOV / 2)) * h / w))


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
FIND = r"""(([el,ll])=>{ const z=GAME.E.zone; if(!z||!z.group) return null; let sign=null; z.group.traverse(o=>{ if(!sign&&o.name==='SIGN_FACE') sign=o; }); if(!sign) return {sign:false};
  let b=sign; while(b.parent&&b.parent!==z.group) b=b.parent; b.updateMatrixWorld(true); const V=THREE.Vector3; const e=b.localToWorld(new V(...el)), l=b.localToWorld(new V(...ll)), p=b.getWorldPosition(new V());
  const r=+(Math.atan2(b.matrixWorld.elements[8],b.matrixWorld.elements[10])).toFixed(3);
  return {sign:true, cafeB:b.name||b.type, pos:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)], yaw:r, eye:[+e.x.toFixed(3),+e.y.toFixed(3),+e.z.toFixed(3)], look:[+l.x.toFixed(3),+l.y.toFixed(3),+l.z.toFixed(3)]}; })"""
AIM = """(([e,l,h,seed,fov])=>{ const E=GAME.E, G=GAME.G, cam=E.camera; E.paused=true; window.__ccSeed&&window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  if(E.player&&E.player.obj) E.player.obj.visible=false; const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  cam.fov=fov; cam.updateProjectionMatrix(); E._shT=0; E.render(); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, fov:+cam.fov.toFixed(2), aspect:+cam.aspect.toFixed(4)};
  cam.fov=fov0; cam.updateProjectionMatrix(); return out; })"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    seed = int(os.environ.get('CC_SEED') or 20261104)
    print('CC CAFE230_ext refcam（③ 近似角度）：HOURS=%s；水平 FOV %.2f°；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (HOURS, HFOV, os.environ.get('SHA', '?')), flush=True)
    meta = {'lens_mm': LENS, 'hfov': HFOV, 'eye_local': EYE_L, 'look_local': LOOK_L, 'note': '③ 近似角度（Blender street 鏡頭），數字只當參考（BB-C 20:15）', 'shots': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, seed)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for h in HOURS:
            await pg.evaluate("GAME.E.paused=false")
            print('  [前置／捷徑] 讀檔：溫州街 2:30 AM 門口西邊 (52, 0)、2025-09-23（二）%02d:00、晴、條件事件關閉' % int(h), flush=True)
            await L.load_state(pg, {'zone': 'wenzhou', 'hour': h, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': 52.0, 'z': 0, 'yaw': 1.5708, 'lv': 0}}, quiet_events=True)
            f = None
            for _ in range(120):
                f = await pg.evaluate(FIND, [EYE_L, LOOK_L])
                if f and f.get('sign'): break
                await pg.wait_for_timeout(1000)
            if not check('[%02d00] 2:30 AM 正式模型接上了（找得到 SIGN_FACE）' % int(h), bool(f and f.get('sign')), J(f)): continue
            await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
            f = await pg.evaluate(FIND, [EYE_L, LOOK_L])
            print('  [%02d00] cafeB %s、位置 %s、朝向 %s → 鏡頭 %s → %s' % (int(h), f['cafeB'], f['pos'], f['yaw'], f['eye'], f['look']), flush=True)
            await pg.evaluate(cc_det.HIDE_PEOPLE_JS); await pg.evaluate(HUD + '(false)'); await pg.evaluate(cc_det.HIDE_LABELS_JS)
            for (w, hh) in SIZES:
                await pg.set_viewport_size({'width': w, 'height': hh}); await pg.wait_for_timeout(800)
                await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
                ri = await pg.evaluate(AIM + '(%s)' % J([f['eye'], f['look'], h, seed, vfov(w, hh)]))
                fn = 'cafe230_ext_refcam_%dx%d_%02d00.png' % (w, hh, int(h))
                await pg.screenshot(path=os.path.join(OUT, fn))
                meta['shots'][fn] = dict(ri, cam=f['eye'], look=f['look'], hour=h, size=[w, hh], cafeB=f)
                print('  %s：calls %s、tris %s、垂直 FOV %s、aspect %s' % (fn, ri['calls'], ri['tris'], ri['fov'], ri['aspect']), flush=True)
            await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(600)
            await pg.evaluate("GAME.E.paused=false"); await pg.evaluate(HUD + '(true)')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'cafe230_ext.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
