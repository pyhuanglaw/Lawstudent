"""CC（帳號 A）11-04：溫州街新室內截圖＋一盞坐墊（BB 07:43；b53bfab72：小路 v1f、SUNNY SIDE v1d、一盞 v1d＋前院）。
  SHOP=komichi|sunny|yizhan。【前置／捷徑】讀檔進店（出生點）、14:00 和 22:00（條件事件關閉）→ 等正式模型（有 glb 材質）→
  隱藏 HUD、玩家，固定鏡頭（E.cinematic）拍 VIEWS（第一張＝參考圖角度）→ 結束運鏡、等鏡頭回到玩家後面、確認鏡頭在房間裡才拍玩家視角（r1 的灰牆：鏡頭沒回來）。
  一盞另外：從溫州街門外看前院（讀檔到溫州街 (−20.5, 1.0) 看冠木門）、從前院看玄關、從緣側看院子。
  FLOOR=1（一盞）：每個 kind floor 的坐墊——走過去（點地面走路）→ 按「坐下…」→ 記姿勢（pose、hips 高度）、鏡頭位置、頭到鏡頭之間有沒有東西（raycast）、截圖
                  → 按「起身」或推搖桿站起來 → 站得住（canStand）、推得動 ≥0.3 m。
  只截圖和量，不判美術（BB 判）；Playwright（PC GPU），不是手機實機。
用法：LW_TESTS=<wt>/tests SHOP=yizhan [HOURS=14,22] [FLOOR=1] python3 cc_wz_shop_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
SHOPS = {
    'komichi': {'enter': (-4.8, -4.6, -2.4, '進去小路'), 'zone': 'wz_teishoku', 'mat': r'^(km_|komichi|a2[0-9]_)', 'glb': 'komichi', 'spawn': (-2.0, 3.05), 'box': (-4.0, 4.0, -4.0, 4.0, 2.9),
                'views': [('ref_east_to_west', [3.3, 1.6, 1.0], [-4.0, 1.2, 0.0]), ('door_in', [-2.0, 1.6, 3.6], [-0.5, 1.2, -4.0]),
                          ('bar', [0.5, 1.6, 0.6], [-1.0, 1.1, -3.5]), ('booth_west', [-1.0, 1.5, 0.2], [-4.0, 1.0, 0.0]),
                          ('window_seats', [0.5, 1.6, -0.8], [1.5, 1.0, 4.0]), ('kitchen', [1.5, 1.7, -0.6], [1.5, 1.6, -4.0]),
                          ('table_mid', [2.5, 1.7, 2.5], [0.0, 0.8, 0.0])]},
    'sunny': {'enter': (42.0, -4.6, -2.4, '進去 SUNNY SIDE'), 'zone': 'wz_brunch', 'mat': r'^(ss_|sunny|a2[0-9]_)', 'glb': 'sunnyside', 'spawn': (0.4, 4.0), 'box': (-3.2, 3.2, -5.0, 5.0, 3.2),
              'views': [('ref_door_in', [0.4, 1.6, 4.4], [0.0, 1.3, -5.0]), ('menu_kitchen', [0.0, 1.6, 1.0], [0.0, 2.0, -4.8]),
                        ('booth_left', [1.5, 1.5, 0.0], [-3.2, 1.0, 0.0]), ('right_window', [-1.0, 1.6, 0.5], [3.2, 1.2, 1.0]),
                        ('tables', [2.4, 1.7, 3.6], [-2.0, 0.8, -1.0]), ('counter', [-0.8, 1.6, 0.6], [2.4, 1.1, -1.8]),
                        ('kitchen', [-1.0, 1.7, -1.5], [1.0, 1.5, -5.0])]},
    'yizhan': {'enter': (-20.5, 4.6, 2.4, '進去一盞'), 'zone': 'wz_teahouse', 'mat': r'^(yz_|yizhan|a2[0-9]_|wzt_)', 'glb': 'yizhan', 'spawn': (-3.0, 9.0), 'box': (-4.2, 4.2, -5.0, 9.6, 2.6),
               'views': [('ref_genkan_ne', [-3.0, 1.5, 4.2], [3.0, 1.0, -1.0]), ('tea_table', [0.0, 1.4, 3.6], [-1.6, 0.3, 1.7]),
                         ('washitsu_A_in', [-1.0, 1.3, -1.4], [-3.2, 0.6, -4.6]), ('washitsu_B_in', [1.0, 1.3, -1.4], [3.2, 0.6, -4.6]), ('mizuya_east', [-1.0, 1.5, 0.5], [4.2, 1.2, 0.5]),
                         ('engawa', [-1.5, 1.4, 5.6], [4.2, 0.8, 5.6]), ('yard_to_genkan', [-0.5, 1.3, 8.8], [-3.0, 0.8, 4.6]),
                         ('engawa_to_yard', [1.0, 1.3, 5.6], [1.0, 0.0, 9.4]), ('yard_fence_w', [-1.5, 1.5, 8.2], [-4.0, 1.4, 13.0]), ('yard_fence_e', [2.0, 1.5, 8.2], [5.0, 1.4, 13.0])],   # BB 07:55：和室要進去拍；竹籬外一片白 → 從院子往外多拍兩張
               'street': ('street_gate', [-20.5, 1.7, 0.8], [-20.5, 1.4, 8.0])},
}
SH = SHOPS[os.environ.get('SHOP') or 'yizhan']
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls,tris:ri.triangles}; })"""
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
CAM = """(()=>{ const E=GAME.E, c=E.camera.position, P=E.player, p=P.obj.position; const head=new THREE.Vector3(p.x,(p.y||0)+1.45,p.z);
  const d=c.clone().sub(head); const L=d.length(); const rc=new THREE.Raycaster(head,d.clone().normalize(),0.05,Math.max(0.06,L-0.05)); const list=[]; E.scene.traverseVisible(o=>{ if(o.isMesh&&!o.isSprite) list.push(o); });
  const hits=[]; for(const o of list){ if(o===P.obj) continue; let me=false; for(let q=o;q;q=q.parent) if(q===P.obj){ me=true; break; } if(me) continue; try{ o.raycast(rc,hits); }catch(e){} } hits.sort((a,b)=>a.distance-b.distance);
  let hips=null; try{ const v=P.obj.userData&&P.obj.userData.vrm; const h=v&&v.humanoid&&v.humanoid.getNormalizedBoneNode('hips'); if(h) hips=+h.getWorldPosition(new THREE.Vector3()).y.toFixed(2); }catch(e){}
  return {mode:E.cam.mode, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+p.x.toFixed(2),+(p.y||0).toFixed(2),+p.z.toFixed(2)], dist:+L.toFixed(2), pose:P.pose||null, seat:!!P.seat, hips,
    between:hits.slice(0,4).map(h=>({mesh:h.object.name||'(無名)', mat:(h.object.material&&h.object.material.name)||'', d:+h.distance.toFixed(2)}))}; })()"""
MATS = "(rx=>{ const R=new RegExp(rx); let f=0; const names=new Set(); GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name){ names.add(o.material.name); if(R.test(o.material.name)) f++; } }); return {n:f, names:[...names].slice(0,60)}; })(%s)"


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, txt=''):
    print('INFO ' + name + (('  ' + txt) if txt else ''), flush=True)


def tag_of(h): return '%02d%02d' % (int(h), int(round((h % 1) * 60)))


def in_box(c):
    x0, x1, z0, z1, hh = SH['box']
    return x0 - 0.05 <= c[0] <= x1 + 0.05 and z0 - 0.05 <= c[2] <= z1 + 0.05 and c[1] <= hh + 0.05


async def load(pg, cdp, zone, x, z, h, yaw=math.pi):
    print('  [前置／捷徑] 讀檔：%s (%s, %s)、%s、條件事件關閉' % (zone, x, z, tag_of(h)), flush=True)
    await L.load_state(pg, {'zone': zone, 'hour': h, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}}, quiet_events=True)
    last = -1; stable = 0; t0 = time.time()
    while time.time() - t0 < 90:
        await pg.wait_for_timeout(1000)
        n = await pg.evaluate("(()=>{ let n=0; if(GAME.E.zone&&GAME.E.zone.group) GAME.E.zone.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()")
        stable = stable + 1 if n == last else 0; last = n
        if stable >= 4: break
    await L.close_panels(pg, cdp)


async def player_view(pg, cdp, fn):
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    await pg.evaluate(HUD + '(true)')
    c = None
    for i in range(20):   # 鏡頭回到玩家後面：follow 模式、鏡頭在房間裡、離頭 1～6 m
        await pg.wait_for_timeout(500); c = await pg.evaluate(CAM)
        if c['mode'] != 'cinematic' and in_box(c['cam']) and 1.0 <= c['dist'] <= 6.5: break
    await pg.screenshot(path=os.path.join(OUT, fn))
    return c


async def run_hour(pg, cdp, h):
    tag = tag_of(h)
    print('== %s %s' % (os.environ.get('SHOP') or 'yizhan', tag), flush=True)
    sx, sz = SH['spawn']
    await load(pg, cdp, SH['zone'], sx, sz, h)
    m = await pg.evaluate(MATS % J(SH['mat']))
    print('  [%s] 材質（前 60）：%s' % (tag, J(m['names'])), flush=True)
    info('[%s] 符合 %s 的材質 mesh 數 %d（0＝材質名稱和我猜的不一樣，看上面的清單）' % (tag, SH['mat'], m['n']))
    await pg.evaluate(HUD + '(false)')
    res = {}
    for name, e, l in SH['views']:
        ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l))); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_%s.png' % (SH['glb'], tag, name)))
        res[name] = ri; print('  [%s] %s：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
    # r2（BB 07:5x）：讀檔只設人的方向、不設鏡頭 → 鏡頭在人前面（一盞塞在簷下）。玩家視角改成真的從溫州街走進店門
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"); await pg.evaluate(HUD + '(true)')
    ex, ez, sz2, lab = SH['enter']
    await load(pg, cdp, 'wenzhou', ex, sz2, h, yaw=(0 if ez > sz2 else math.pi))
    it = await pg.evaluate("(lb=>{ const i=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label}:null; })(%s)" % J(lab))
    if check('[%s] 溫州街有「%s」' % (tag, lab), bool(it), J(it)):
        await L.go_to(pg, cdp, L.Run('enter', OUT), it['x'], it['z'], max(0.4, it['r'] * 0.6), it['label'], max_s=120)
        await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % J(SH['zone'])): break
        await pg.wait_for_timeout(4000)
    c = await player_view(pg, cdp, '%s_%s_game.png' % (SH['glb'], tag))
    print('  [%s] 玩家視角鏡頭：%s' % (tag, J(c)), flush=True)
    check('[%s] 玩家視角：鏡頭回到玩家後面、在房間裡（不是牆裡）' % tag, c and c['mode'] != 'cinematic' and in_box(c['cam']) and c['dist'] >= 1.0, J(c))
    if 'street' in SH:
        name, e, l = SH['street']
        await load(pg, cdp, 'wenzhou', -20.5, 1.0, h, yaw=0)
        await pg.evaluate(HUD + '(false)')
        ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l))); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_%s.png' % (SH['glb'], tag, name)))
        print('  [%s] %s（溫州街）：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
        await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"); await pg.evaluate(HUD + '(true)')
    return res


async def floor_seats(pg, cdp):
    print('== FLOOR 一盞的坐墊', flush=True)
    sx, sz = SH['spawn']
    await load(pg, cdp, SH['zone'], sx, sz, 14.0)
    seats = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,kind:i.seat.kind||null,sx:+(+i.seat.x).toFixed(2),sz:+(+i.seat.z).toFixed(2)})))()")
    print('  座位：%s' % J(seats), flush=True)
    fl = [s for s in seats if s['kind'] == 'floor' or '坐墊' in s['label'] or '緣側' in s['label'] or '和室' in s['label'] or '喝茶' in s['label']]
    check('[FLOOR] 有坐墊（kind floor）的座位', bool(fl), str(len(fl)))
    for k, s in enumerate(fl):
        tag = 'F%02d' % k
        await L.go_to(pg, cdp, L.Run('cc', OUT) if hasattr(L, 'Run') else None, s['x'], s['z'], 0.35, s['label'], max_s=180)
        await pg.wait_for_timeout(800)
        st = await L.state(pg)
        if not check('[%s] 走到「%s」(%s, %s)：按鈕出現' % (tag, s['label'], s['sx'], s['sz']), st['interact'].startswith(s['label'][:2]), J({'interact': st['interact'], 'x': st['x'], 'z': st['z']})):
            continue
        await L.tap(pg, cdp, '#interact')
        for _ in range(30):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("!!GAME.E.player.seat&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(2500)
        c = await pg.evaluate(CAM)
        await pg.screenshot(path=os.path.join(OUT, 'yizhan_floor_%s.png' % tag))
        print('  [%s] 坐下：%s' % (tag, J(c)), flush=True)
        check('[%s] 坐下了（seat、pose）' % tag, c['seat'], J({'pose': c['pose'], 'hips': c['hips']}))
        info('[%s] 姿勢 pose＝%s、hips 高度 %s m（跪坐約 0.45～0.6；站著約 0.9～1.0；坐椅子約 0.55～0.7）' % (tag, c['pose'], c['hips']))
        check('[%s] 鏡頭不在牆裡、頭到鏡頭之間沒有東西' % tag, in_box(c['cam']) and not c['between'], J({'cam': c['cam'], 'between': c['between']}))
        lab = (await L.state(pg))['interact']
        if lab.startswith('起身') or lab.startswith('站起'):
            await L.tap(pg, cdp, '#interact')
        else:
            await L.joystick(pg, cdp, 0, 60, 800)
        await pg.wait_for_timeout(2000)
        moved, _, _ = await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=3)
        if moved < 0.3:
            for dx, dy in ((60, 0), (-60, 0), (0, -60)):
                moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
                if moved >= 0.3: break
        st = await L.state(pg)
        check('[%s] 站起來：不是坐著、站得住、推得動 ≥0.3 m' % tag, not await pg.evaluate("!!GAME.E.player.seat") and st['stand'] and moved >= 0.3, J({'moved': round(moved, 2), 'stand': st['stand'], 'x': st['x'], 'z': st['z'], 'pose': st.get('pose')}))


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        res = {}
        for h in [float(x) for x in (os.environ.get('HOURS') or '14,22').split(',') if x.strip()]:
            res[str(h)] = await run_hour(pg, cdp, h)
        if os.environ.get('FLOOR') == '1':
            await floor_seats(pg, cdp)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump(res, open(os.path.join(OUT, 'shots_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
