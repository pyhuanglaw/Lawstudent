"""CC（帳號 A）11-04：2:30 AM 室內 v1b（cafe230.glb，LAWWW d432de8ba）白天／22:00 截圖，給 BB 判 ART_APPROVED。
  【前置／捷徑】讀檔：cafe 區域、門口 (0, 4.4)、14:00 和 22:00（條件事件關閉）→ 等正式模型掛上（場景 mesh 數量增加後 4 秒不再變）→
  隱藏 HUD、玩家，固定鏡頭（E.cinematic）拍七個角度：參考圖角度（東邊往西）、門口往裡、拱門卡座、吧檯、蛋糕櫃、唱盤、窗邊吧台。
  再顯示 HUD 和玩家，從門口拍一張遊戲畫面（玩家視角）。也記 renderer.info（calls、tris）。
  這支只截圖、不判美術（BB 判）；Playwright（PC GPU），不是手機實機。
用法：LW_TESTS=<wt>/tests [HOURS=14,22] python3 cc_cafe230_shot_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
VIEWS = [  # (名稱, 鏡頭位置, 看的點)
    ('ref_east_to_west', [6.3, 1.6, 2.6], [-6.5, 1.2, 0.0]),
    ('door_in', [0.0, 1.6, 5.4], [0.0, 1.2, -5.5]),
    ('booth', [-3.0, 1.5, 0.6], [-7.0, 1.0, 0.0]),
    ('bar', [2.2, 1.6, -0.8], [-1.5, 1.1, -5.5]),
    ('pastry', [2.4, 1.5, -2.2], [0.4, 1.1, -4.4]),
    ('record', [2.6, 1.6, -2.8], [4.1, 1.3, -5.65]),
    ('window_bar', [0.0, 1.6, 1.2], [-2.0, 1.0, 6.0]),
]
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls,tris:ri.triangles}; })"""
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


async def run_hour(pg, cdp, h):
    tag = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
    print('== %s' % tag, flush=True)
    print('  [前置／捷徑] 讀檔：cafe 門口 (0, 4.4)、%s、條件事件關閉' % tag, flush=True)
    await L.load_state(pg, {'zone': 'cafe', 'hour': h, 'weather': 'clear', 'pos': {'x': 0, 'z': 4.4, 'yaw': 3.1416, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(2000)
    n0 = await pg.evaluate(MESHN); last = n0; stable = 0; t0 = time.time()
    while time.time() - t0 < 90:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
        if n != last: last = n; stable = 0
        else: stable += 1
        if stable >= 4: break
    has230 = await pg.evaluate("(()=>{ let f=false; GAME.E.zone.group.traverse(o=>{ if(o.isMesh&&o.material&&/^a23_/.test(o.material.name||'')) f=true; }); return f; })()")
    # 11-04 r1：讀檔時正式模型已經在快取、一開始就掛上，mesh 數不會增加 → 改看有沒有 a23_ 開頭的材質（cafe230.glb）
    check('[%s] 正式模型掛上（有 a23_ 材質；場景 mesh %d → %d）' % (tag, n0, last), has230, '%.0f 秒' % (time.time() - t0))
    await L.close_panels(pg, cdp)
    gl = await pg.evaluate("(()=>{ const z=GAME.E.zone; const names=new Set(); z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name) names.add(o.material.name); }); return [...names].slice(0,40); })()")
    print('  [%s] 材質名：%s' % (tag, J(gl)), flush=True)
    await pg.evaluate(HUD + '(false)')
    info = {}
    for name, e, l in VIEWS:
        ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l)))
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, 'cafe230_%s_%s.png' % (tag, name)))
        info[name] = ri
        print('  [%s] %s：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    await pg.evaluate(HUD + '(true)'); await pg.wait_for_timeout(2500)
    await pg.screenshot(path=os.path.join(OUT, 'cafe230_%s_game.png' % tag))
    return info


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        res = {}
        for h in [float(x) for x in (os.environ.get('HOURS') or '14,22').split(',')]:
            res[str(h)] = await run_hour(pg, cdp, h)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump(res, open(os.path.join(OUT, 'cafe230_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
