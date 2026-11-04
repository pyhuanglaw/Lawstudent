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


# BB 07:47：22:00 吊燈、檯燈下面的桌面 vs 旁邊沒有燈的桌面——瀏覽器只給螢幕座標，亮度在雲端從截圖算（PC 沒有 PIL）
LAMP_JS = r"""(()=>{ const E=GAME.E, V=THREE.Vector3, cam=E.camera; cam.updateMatrixWorld(); const co=cam.getWorldPosition(new V());
  const all=[]; E.scene.traverseVisible(o=>{ if(o.isMesh&&!o.isSprite) all.push(o); });
  const down=(x,y,z,skip)=>{ const rc=new THREE.Raycaster(new V(x,y,z),new V(0,-1,0),0,2.5); const h=[]; for(const o of all){ if(skip&&skip.has(o)) continue; try{ o.raycast(rc,h); }catch(e){} } h.sort((a,b)=>a.distance-b.distance); return h.find(q=>q.face&&Math.abs(q.face.normal.clone().transformDirection(q.object.matrixWorld).y)>0.8)||null; };
  const LRX=/lamp|pendant|bulb|shade|brass|light|燈/i; const lamps=[]; const skip=new Set();
  for(const o of all){ const nm=(o.name||'')+' '+((o.material&&o.material.name)||''); if(!LRX.test(nm)) continue; const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) continue; const c=b.getCenter(new V()); if(c.y<0.6) continue; skip.add(o); lamps.push({c,nm:nm.trim().slice(0,40)}); }
  const lit=[]; for(const L of lamps){ const h=down(L.c.x,L.c.y-0.05,L.c.z,skip); if(h&&h.point.y>0.4&&h.point.y<1.25&&L.c.y-h.point.y<2.2) lit.push({p:h.point,lamp:L.nm,surf:h.object.name||'(無名)'}); }
  const unlit=[]; for(const st of (E.zone.seats||[])){ const yaw=st.yaw||0, x=st.x+Math.sin(yaw)*0.45, z=st.z+Math.cos(yaw)*0.45; const h=down(x,1.6,z,skip); if(!h||h.point.y<0.4||h.point.y>1.25) continue; if(lit.some(q=>Math.hypot(q.p.x-x,q.p.z-z)<1.2)) continue; if(unlit.some(q=>Math.hypot(q.p.x-x,q.p.z-z)<0.5)) continue; unlit.push({p:h.point,surf:h.object.name||'(無名)'}); }
  const scr=q=>{ const v=q.p.clone().project(cam); const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight; const on=v.z<1&&sx>=0&&sx<=innerWidth&&sy>=0&&sy<=innerHeight;
    let vis=false; if(on){ const d=q.p.clone().sub(co); const L=d.length(); const rc=new THREE.Raycaster(co,d.normalize(),0.05,L+0.1); const h=[]; for(const o of all){ try{ o.raycast(rc,h); }catch(e){} } h.sort((a,b)=>a.distance-b.distance); vis=!!h[0]&&Math.abs(h[0].distance-L)<0.06; }
    return {x:+q.p.x.toFixed(2),y:+q.p.y.toFixed(2),z:+q.p.z.toFixed(2),sx:+sx.toFixed(1),sy:+sy.toFixed(1),on,vis,lamp:q.lamp||null,surf:q.surf}; };
  return {vw:innerWidth,vh:innerHeight,lamps:lamps.length,lit:lit.map(scr),unlit:unlit.map(scr)}; })()"""


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
        try: ri['lamp'] = await pg.evaluate(LAMP_JS)
        except Exception as e: ri['lamp'] = 'ERR ' + str(e)[:200]
        info[name] = ri
        print('  [%s] %s：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    await pg.evaluate(HUD + '(true)')
    # r3（BB 07:5x）：讀檔只設人的方向、不設鏡頭，鏡頭會在人前面 → 玩家視角改成真的從溫州街走進「進入 2:30 AM」
    print('  [前置／捷徑] 讀檔：溫州街 2:30 AM 門口西邊 (52.0, 0)、%s → 點地面走到門口、按「進入 2:30 AM」' % tag, flush=True)
    await L.load_state(pg, {'zone': 'wenzhou', 'hour': h, 'weather': 'clear', 'pos': {'x': 52.0, 'z': 0, 'yaw': 1.5708, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>(i.label||'').startsWith('進入 2:30 AM')); return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label}:null; })()")
    if check('[%s] 溫州街有「進入 2:30 AM」' % tag, bool(it), J(it)):
        await L.go_to(pg, cdp, L.Run('enter', OUT), it['x'], it['z'], max(0.4, it['r'] * 0.6), it['label'], max_s=120)
        await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("GAME.G.zone==='cafe'&&!GAME.E.player.busy"): break
    await pg.wait_for_timeout(6000)   # r1：2.5 秒拍到一整面灰牆 → 等久一點，並記鏡頭位置（灰牆還在＝看鏡頭是不是在牆裡）
    cam = await pg.evaluate("(()=>{ const E=GAME.E, c=E.camera.position, p=E.player.obj.position; return {mode:E.cam.mode, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+p.x.toFixed(2),+p.z.toFixed(2)], yaw:+E.cam.yaw.toFixed(2)}; })()")
    print('  [%s] 玩家視角的鏡頭：%s' % (tag, J(cam)), flush=True)
    await pg.screenshot(path=os.path.join(OUT, 'cafe230_%s_game.png' % tag))
    return info


async def sofa_seats(pg, cdp):
    """BB 07:47：兩張「坐沙發椅」（v1c 窗邊單人沙發）：點地面走過去 → 按 → 坐下 → 截圖、鏡頭 → 起身（按「起身」或推搖桿）→ 站得住、推得動 ≥ 0.3 m"""
    print('== SOFA 坐沙發椅', flush=True)
    print('  [前置／捷徑] 讀檔：cafe 門口 (0, 4.4)、14:00、條件事件關閉', flush=True)
    await L.load_state(pg, {'zone': 'cafe', 'hour': 14.0, 'weather': 'clear', 'pos': {'x': 0, 'z': 4.4, 'yaw': 3.1416, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden&&/沙發椅/.test(i.label||'')).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,sx:+(+i.seat.x).toFixed(2),sz:+(+i.seat.z).toFixed(2)})))()")
    check('[SOFA] 有兩張「坐沙發椅」', len(its) == 2, J(its))
    run = L.Run('sofa', OUT)
    for k, it in enumerate(its):
        tag = 'S%d' % k
        await L.go_to(pg, cdp, run, it['x'], it['z'], 0.35, it['label'], max_s=180)
        await pg.wait_for_timeout(800); st = await L.state(pg)
        if not check('[%s] 走到旁邊：按鈕「坐沙發椅」' % tag, st['interact'].startswith('坐沙發椅'), J({'interact': st['interact'], 'x': st['x'], 'z': st['z']})):
            await pg.screenshot(path=os.path.join(OUT, 'sofa_%s_nobtn.png' % tag)); continue
        await L.tap(pg, cdp, '#interact')
        for _ in range(30):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("!!GAME.E.player.seat&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(2500)
        c = await pg.evaluate("(()=>{ const E=GAME.E, P=E.player, p=P.obj.position, c=E.camera.position; return {seat:!!P.seat, pose:P.pose||null, x:+p.x.toFixed(2), y:+(p.y||0).toFixed(2), z:+p.z.toFixed(2), cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]}; })()")
        await pg.screenshot(path=os.path.join(OUT, 'sofa_%s_seated.png' % tag))
        check('[%s] 坐下了（seat）' % tag, c['seat'], J(c))
        check('[%s] 鏡頭在店裡（x −7～7、z −6～6、y ≤ 3.4）' % tag, -7.05 <= c['cam'][0] <= 7.05 and -6.05 <= c['cam'][2] <= 6.05 and c['cam'][1] <= 3.45, J(c['cam']))
        _ch = await pg.evaluate("[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim())")
        if _ch:   # 11-04 CAFE230v3：坐下以後跳出選單（坐一下／點咖啡／起身），r1 沒選「起身」就推搖桿＝探針卡住
            _k = next((i for i, t in enumerate(_ch) if t.startswith('起身') or t.startswith('站起')), len(_ch) - 1)
            print('  坐下的選單：%s → %s' % (J(_ch), _ch[_k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (_k + 1)); await pg.wait_for_timeout(1500)
        lab = (await L.state(pg))['interact']
        if lab.startswith('起身') or lab.startswith('站起'): await L.tap(pg, cdp, '#interact')
        else: await L.joystick(pg, cdp, -60, 0, 800)
        await pg.wait_for_timeout(2000)
        moved = 0.0
        for dx, dy in ((-60, 0), (0, 60), (0, -60), (60, 0)):
            moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
            if moved >= 0.3: break
        st = await L.state(pg); seated = await pg.evaluate("!!GAME.E.player.seat")
        check('[%s] 起身：不是坐著、站得住、推得動 ≥ 0.3 m（不卡住）' % tag, not seated and st['stand'] and moved >= 0.3, J({'moved': round(moved, 2), 'stand': st['stand'], 'x': st['x'], 'z': st['z']}))
        await pg.screenshot(path=os.path.join(OUT, 'sofa_%s_stood.png' % tag))


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        res = {}
        for h in [float(x) for x in (os.environ.get('HOURS') or '14,22').split(',') if x.strip()]:
            res[str(h)] = await run_hour(pg, cdp, h)
        if os.environ.get('SOFA') == '1':
            await sofa_seats(pg, cdp)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump(res, open(os.path.join(OUT, 'cafe230_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
