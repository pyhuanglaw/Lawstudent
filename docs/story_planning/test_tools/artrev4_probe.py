"""BB（帳號 A）2026-10-21：artrev2／artrev3 留下的兩個疑點。
  ① 體育館 1F 白霧：artrev2 進場後第一張（01_gym_13_y0、09_gym_20_y0）畫面左邊一大片白霧；artrev3 同位置（26_gym_13_default）沒有，
     而且光暈投影顯示畫面裡沒有任何光暈 → 白霧可能不是光暈。照 artrev2 的步驟重拍（讀檔 → 直接進體育館 → 玩家搬到中間 → 讀鏡頭 yaw → 鎖住 → 拍），
     記下鏡頭位置／距離／俯角，並從鏡頭對畫面左半邊一格一格打射線（含半透明），列出打到的物件名稱、材質名稱、透明度。
  ② 203 壓平的紙箱（Y1_BOX_FOLDED）在書桌底下看不到、只看到一塊深藍色的東西：同一個鏡頭拍兩張（紙箱顯示／藏起來）比對，
     並對那塊深藍色的位置打射線，列出物件名稱。鏡頭也放到書桌底下、正對牆面再拍一張。
[捷徑] GAME.enter、設時間、搬玩家、劇情鏡頭、暫時藏物件（只為了比對）。不是 iPhone：只看畫面。
用法：LW_TESTS=<開發分支>/tests python3 artrev4_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
# 從鏡頭對畫面上的點打射線（NDC），列出前幾個打到的物件（看得到的；含半透明）
PICK = """(pts=>{ const E=GAME.E, cam=E.camera, rc=new THREE.Raycaster(), out=[]; cam.updateMatrixWorld();
  const vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  for(const [x,y] of pts){ rc.setFromCamera(new THREE.Vector2(x,y), cam); const hs=rc.intersectObjects(E.scene.children,true).filter(h=>vis(h.object)).slice(0,4);
    out.push({at:[x,y], hits:hs.map(h=>{ const m=[].concat(h.object.material)[0]||{}; return {n:h.object.name||'(無名)', p:(h.object.parent&&h.object.parent.name)||'', d:+h.distance.toFixed(2), mat:m.name||'', tr:!!m.transparent, op:m.opacity, blend:m.blending}; })}); }
  return out; })"""
CAMSTATE = "(()=>{ const c=GAME.E.camera.position, C=GAME.E.cam; return {pos:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], yaw:+C.yaw.toFixed(3), pitch:+C.pitch.toFixed(3), dist:+(C.dist||0).toFixed(2), distTarget:C.distTarget, manualT:C.manualT}; })()"


async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(15000); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(5000)


async def closephone(pg):
    await pg.evaluate("(()=>{ try{ if(typeof PHONE!=='undefined'&&PHONE.pending) for(const k of (PHONE.pending()||[])){ try{ PHONE.answer&&PHONE.answer(k,0); }catch(e){} } }catch(e){} const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
    await pg.wait_for_timeout(800)


async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); try{ GAME.E.unstick&&GAME.E.unstick(P,8); }catch(e){} return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))


async def gym(pg, run):
    grid = [[x / 10, y / 10] for x in range(-9, 0, 2) for y in range(-7, 9, 3)]   # 畫面左半邊
    for h in (13, 20.5):
        await enter(pg, 'gym', h); run.setup('[捷徑] gym %.1f（讀檔後直接進，和 artrev2 同順序）' % h)
        print('   進場鏡頭', await pg.evaluate(CAMSTATE), flush=True)
        at = await put(pg, 0, 0); run.setup('[捷徑] 玩家搬到 1F 中間 %s' % at); await closephone(pg)
        y0 = await pg.evaluate("GAME.E.cam.yaw"); print('   搬完以後 yaw', y0, await pg.evaluate(CAMSTATE), flush=True)
        await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=60; })(%s)" % json.dumps(y0))
        await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, 'gym_%02d_like_artrev2' % int(h))
        print('   拍的時候鏡頭', await pg.evaluate(CAMSTATE), flush=True)
        print('   射線（畫面左半邊）', json.dumps(await pg.evaluate(PICK + "(%s)" % json.dumps(grid)), ensure_ascii=False), flush=True)
        for k, (d, p) in enumerate(((3.6, 0.38), (4.4, 0.3), (5.2, 0.22))):   # 換幾個距離、俯角看白霧在不在
            await pg.evaluate("(([y,d,p])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=p; C.manualT=60; })(%s)" % json.dumps([y0, d, p]))
            await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, 'gym_%02d_d%.1f_p%.2f' % (int(h), d, p))
        if h == 13:   # 搬到別的位置（往西、往北）再看
            for x, z in ((-6, 0), (0, -8)):
                at = await put(pg, x, z); await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=5.2; C.pitch=0.38; C.manualT=60; })(%s)" % json.dumps(y0))
                await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, 'gym_13_at_%g_%g' % (x, z)); print('   位置', at, await pg.evaluate(CAMSTATE), flush=True)


async def folded(pg, run):
    await pg.evaluate("(()=>{ const G=GAME.G; G.flags.BOX_WINTER_OPEN=true; })()")
    await enter(pg, 'dorm', 15); run.setup('[捷徑] dorm 15:00，BOX_WINTER_OPEN')
    info = await pg.evaluate("(()=>{ let m=null; GAME.E.scene.traverse(o=>{ if(o.name==='Y1_BOX_FOLDED') m=o; }); if(!m) return null; const out=[]; m.traverse(o=>{ if(o.isMesh){ const mt=[].concat(o.material)[0]; out.push({n:o.name, vis:o.visible, mat:mt&&mt.name, map:!!(mt&&mt.map), col:mt&&mt.color&&mt.color.getHexString()}); } }); const b=new THREE.Box3().setFromObject(m); return {group:m.visible, meshes:out, min:b.min.toArray().map(v=>+v.toFixed(2)), max:b.max.toArray().map(v=>+v.toFixed(2))}; })()")
    print('   壓平的紙箱', json.dumps(info, ensure_ascii=False), flush=True)
    if not info: return
    c = [(info['min'][i] + info['max'][i]) / 2 for i in range(3)]
    views = (('high', [c[0] + 1.2, 1.5, c[2] + 0.4]), ('under', [c[0] + 0.55, 0.35, c[2] + 0.05]), ('side', [c[0] + 0.5, 0.45, c[2] + 0.9]))
    for nm, pos in views:
        for show in (True, False):
            await pg.evaluate("(v=>{ GAME.E.scene.traverse(o=>{ if(o.name==='Y1_BOX_FOLDED') o.visible=v; }); })(%s)" % ('true' if show else 'false'))
            await closephone(pg)
            await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, c]))
            await pg.wait_for_timeout(2500); await run.shot(pg, 'folded_%s_%s' % (nm, 'on' if show else 'off'))
            if show and nm == 'high':
                print('   射線（畫面中間一圈）', json.dumps(await pg.evaluate(PICK + "(%s)" % json.dumps([[0, 0], [0, -0.2], [0, -0.4], [-0.2, -0.2], [0.2, -0.2]])), ensure_ascii=False), flush=True)
            await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ GAME.E.scene.traverse(o=>{ if(o.name==='Y1_BOX_FOLDED') o.visible=true; }); })()")


async def main():
    run = L.Run('artrev4', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        for nm, f in (('體育館白霧', gym), ('壓平的紙箱', folded)):
            try: await f(pg, run)
            except Exception as e: print('  ! 失敗：', e, flush=True); run.check('%s跑完' % nm, False, str(e)[:200])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
