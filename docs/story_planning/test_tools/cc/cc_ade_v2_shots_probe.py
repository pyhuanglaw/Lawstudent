"""CC-C（帳號 C）11-04：ADE_v2_shots（BB-C 15:33；阿德影印 v2 外觀接進開發分支 ba038059e，不進 v9.10.20）。只截圖、不判（判定 BB；美術比對 LAWWW2）。
  溫州街 A1 阿德影印（店門互動點 (−8.0, 4.6)），14:00、20:30 各一輪：
    approach  玩家從巷子走近的視角（巷子東邊往西、斜看店面）
    front     店門口正面
    refcam    參考圖鏡頭（LAWWW2 docs/art-rebuild/second_ai/wip/ade_pilot_1104/README.md：從參考圖招牌四個角反推）：
              眼 (−3.0, 1.61, −2.97)、看 (−6.33, 1.61, 6.46)、再向右轉 3.6°（BB-C 15:33）、垂直 FOV 45.7°、上下移軸 shift_y 0.0733、1672×941（和參考圖一樣大，可以直接疊圖）
  WZ_COPY_SHOP='moved'（劇情選「搬到轉角」以後）：轉角店（北巷，玻璃門 x 3.1、z 6.0～6.95；互動點 (3.9, 6.5)）三張：front、street（從溫州街往巷子看）、oblique。
  做法（同 cc_baseline_probe 的 DET）：遊戲載入前固定種子（cc_det）、路人照 cc_det 藏、HUD 藏；每張停主迴圈、時刻和 shader 時間設回固定值、手動畫一幀再截圖。
  【前置／捷徑】讀檔指定地點、時間、旗標（條件事件關閉）、固定鏡頭——不是玩家看到的流程，只用來比畫面。Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
  參考圖的比對（same_angle_check --mode shop，對 story-planning 的 ref_images/shops/wz_ade_ext.webp）在雲端跑，不在這支。
用法：LW_TESTS=<wt>/tests [HOURS=14,20.5] [CC_SEED=...] python3 cc_ade_v2_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
HOURS = [float(x) for x in (os.environ.get('HOURS') or '14,20.5').split(',') if x.strip()]
FAILS = []
REF = {'eye': [-3.0, 1.61, -2.97], 'look': [-6.33, 1.61, 6.46], 'yaw_right_deg': 3.6, 'fov': 45.7, 'shift_y': 0.0733, 'w': 1672, 'h': 941}


def rot_look(eye, look, deg):
    """看的點繞眼睛的垂直軸轉（向右＝順時針，從上往下看；x 往東、z 往南）"""
    dx, dz = look[0] - eye[0], look[2] - eye[2]; a = -math.radians(deg)
    return [round(eye[0] + dx * math.cos(a) - dz * math.sin(a), 3), look[1], round(eye[2] + dx * math.sin(a) + dz * math.cos(a), 3)]


A1 = [('approach', [-1.5, 1.6, 0.8], [-8.0, 2.0, 5.2], 46, 0.0),
      ('front', [-8.0, 1.6, -1.6], [-8.0, 2.2, 5.5], 46, 0.0),
      ('refcam', REF['eye'], rot_look(REF['eye'], REF['look'], REF['yaw_right_deg']), REF['fov'], REF['shift_y'])]
CORNER = [('corner_front', [6.8, 1.6, 6.5], [2.8, 2.0, 6.5], 46, 0.0),
          ('corner_street', [5.8, 1.6, 0.6], [3.0, 2.0, 6.5], 46, 0.0),
          ('corner_oblique', [6.8, 1.6, 9.8], [3.0, 2.0, 6.2], 46, 0.0)]


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
# 停主迴圈、時刻和 shader 時間固定、手動走三格、畫一幀；fov＝垂直 FOV、shift＝上下移軸（投影矩陣第 9 格，同 Blender 的 shift_y：畫面往上移 shift×畫面高）
AIM = """(([e,l,h,seed,fov,shift])=>{ const E=GAME.E, G=GAME.G, cam=E.camera; E.paused=true; window.__ccSeed&&window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  cam.fov=fov; cam.updateProjectionMatrix(); if(shift){ cam.projectionMatrix.elements[9]+=2*shift; cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert(); }
  E._shT=0; E.render(); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, fov:cam.fov, aspect:+cam.aspect.toFixed(4)};
  cam.fov=fov0; cam.updateProjectionMatrix(); return out; })"""
COPY = """(()=>{ const z=GAME.E.zone, r={flag:(GAME.G.flags||{}).WZ_COPY_SHOP||'', nodes:{}}; if(z&&z.group) z.group.traverse(o=>{ if(/^COPY_/.test(o.name||'')){ let v=true; for(let p=o;p;p=p.parent) if(!p.visible){ v=false; break; } r.nodes[o.name]=v; } });
  const it=GAME.E.interactables.find(i=>/阿德影印/.test(i.label||'')); r.door=it?[+(+it.x).toFixed(2),+(+it.z).toFixed(2)]:null; return r; })()"""


async def stable(pg, cap=120):
    last = -1; st = 0; t1 = time.time()
    while time.time() - t1 < cap:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 5: break
    return last, time.time() - t1


async def main():
    os.makedirs(OUT, exist_ok=True)
    seed = int(os.environ.get('CC_SEED') or 20261104)
    print('CC ADE_v2_shots：HOURS=%s；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (HOURS, os.environ.get('SHA', '?')), flush=True)
    meta = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, seed)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for state, shots in (('', A1), ('moved', CORNER)):
            for h in HOURS:
                await pg.evaluate("GAME.E.paused=false")
                st = {'zone': 'wenzhou', 'hour': h, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': -8.0, 'z': 2.0, 'yaw': 0, 'lv': 0}}
                if state: st['flags'] = {'WZ_COPY_SHOP': state}
                print('  [前置／捷徑] 讀檔：溫州街、2025-09-23（二）%02d:%02d、晴、條件事件關閉%s' % (int(h), int(round(h % 1 * 60)), '、WZ_COPY_SHOP=%s' % state if state else ''), flush=True)
                await L.load_state(pg, st, quiet_events=True)
                n, sec = await stable(pg)
                await L.close_panels(pg, cdp)
                cp = await pg.evaluate(COPY)
                check('[%s %02d%02d] 讀檔進到溫州街（mesh %s、%.0f 秒穩定）；阿德影印狀態 %s' % (state or 'A1', int(h), int(round(h % 1 * 60)), n, sec, cp['flag'] or '（還沒決定）'), await pg.evaluate("GAME.G.zone==='wenzhou'"), J(cp))
                if state == 'moved':
                    check('[moved] 店門換到轉角（互動點 x>0）', bool(cp['door']) and cp['door'][0] > 0, J(cp['door']))
                await pg.evaluate(cc_det.HIDE_PEOPLE_JS); await pg.evaluate(HUD + '(false)')
                print('  藏起來的出口標籤：%d' % (await pg.evaluate(cc_det.HIDE_LABELS_JS)), flush=True)
                for k, (name, e, l, fov, shift) in enumerate(shots):
                    big = name == 'refcam'
                    if big: await pg.set_viewport_size({'width': REF['w'], 'height': REF['h']}); await pg.wait_for_timeout(800)
                    await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
                    ri = await pg.evaluate(AIM + '(%s)' % J([e, l, h, seed + k, fov, shift]))
                    fn = 'ade_%s_%02d%02d.png' % (name, int(h), int(round(h % 1 * 60)))
                    await pg.screenshot(path=os.path.join(OUT, fn))
                    meta[fn] = dict(ri, cam=e, look=l, state=state or 'A1', hour=h)
                    print('  %s：calls %s、tris %s、fov %s、aspect %s' % (fn, ri['calls'], ri['tris'], ri['fov'], ri['aspect']), flush=True)
                    if big: await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(800)
                await pg.evaluate("GAME.E.paused=false"); await pg.evaluate(HUD + '(true)')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'ade_v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
