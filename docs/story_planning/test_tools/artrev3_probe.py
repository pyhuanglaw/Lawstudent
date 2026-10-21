"""BB（帳號 A）2026-10-21：artrev2 的補拍（體育館）。
  ① 往上看：artrev2 的劇情鏡頭放在玩家頭的高度、玩家的位置上，拍到自己的頭髮（腳本的錯，不是遊戲）——這次先把玩家藏起來。
     1F：從中間 (0,0) 往最近的燈、往正上方；B1：大廳、健身中心、泳池三處的中間往上看。白天 13:00、晚上 20:30。
     燈和天花板有沒有閃（z-fighting）：同一個角度鏡頭偏 4 cm 再拍一張，兩張比對。
  ② 1F 預設鏡頭（玩家在中間、進場時的鏡頭方向）畫面左邊那道白霧是哪一個光暈：把光暈網格（userData.glowBatch.items）的每一個投影到畫面，
     列出在畫面裡的（離鏡頭多遠、在畫面上多大、現在的亮度）。
  ③ 203 膠帶中間寫字的那段：玩家站在旁邊（不是紙箱互動點：紙箱在房間西邊、膠帶在東邊 R2 床桌組，站在紙箱旁邊鏡頭朝紙箱時膠帶在鏡頭後面），
     預設鏡頭／拉到最近／最大俯角，看字認不認得出（腳本 dorm_y1_items.py：字是「法律系可以無條件入境」）。
  ④ 壓平的紙箱：artrev2 的近拍被書桌擋住，這次低角度＋玩家站在書桌前的預設／最近鏡頭。
[捷徑] GAME.enter、設時間、搬玩家、藏玩家、劇情鏡頭。不是 iPhone：只看畫面。
用法：LW_TESTS=<開發分支>/tests python3 artrev3_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
GLOWS = """(n=>{ const E=GAME.E, cam=E.camera; let m=null; E.scene.traverse(o=>{ if(o.name===n&&o.userData&&o.userData.glowBatch) m=o; }); if(!m) return null;
  cam.updateMatrixWorld(); m.updateMatrixWorld(true); const k=m.material.emissiveIntensity, f=1/Math.tan(cam.fov*Math.PI/360), out=[], v=new THREE.Vector3();
  for(const it of m.userData.glowBatch.items){ v.set(it.x,it.y,it.z).applyMatrix4(m.matrixWorld); const d=v.distanceTo(cam.position), q=v.clone().applyMatrix4(cam.matrixWorldInverse);
    if(q.z>-0.1) continue; const p=v.clone().project(cam), r=(it.size*0.5)/(-q.z)*f, op=it.day*(1-k)+it.night*k;
    if(op<=0.02||p.x-r/cam.aspect>1||p.x+r/cam.aspect<-1||p.y-r>1||p.y+r<-1) continue;
    out.push({at:[it.x,it.y,it.z], d:+d.toFixed(1), ndc:[+p.x.toFixed(2),+p.y.toFixed(2)], r:+r.toFixed(2), op:+op.toFixed(2), size:it.size}); }
  return {k, n:m.userData.glowBatch.items.length, inView:out.sort((a,b)=>b.r*b.op-a.r*a.op).slice(0,8)}; })"""
NEAREST = """(([n,x,y,z])=>{ let m=null; GAME.E.scene.traverse(o=>{ if(o.name===n&&o.userData&&o.userData.glowBatch) m=o; }); if(!m) return null; m.updateMatrixWorld(true);
  const v=new THREE.Vector3(); let best=null, bd=1e9; for(const it of m.userData.glowBatch.items){ v.set(it.x,it.y,it.z).applyMatrix4(m.matrixWorld); const d=Math.hypot(v.x-x,v.z-z); if(d<bd&&v.y>y+0.8){ bd=d; best=[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]; } } return best; })"""


async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(15000); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(5000)


async def closephone(pg):
    await pg.evaluate("(()=>{ try{ if(typeof PHONE!=='undefined'&&PHONE.pending) for(const k of (PHONE.pending()||[])){ try{ PHONE.answer&&PHONE.answer(k,0); }catch(e){} } }catch(e){} const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
    await pg.wait_for_timeout(800)


async def cine(pg, run, tag, pos, look):
    await closephone(pg)
    await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, look]))
    await pg.wait_for_timeout(2500); await run.shot(pg, tag); await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(800)


async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); try{ GAME.E.unstick&&GAME.E.unstick(P,8); }catch(e){} return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))


async def hide(pg, on):
    await pg.evaluate("(v=>{ GAME.E.player.obj.visible=v; })(%s)" % ('false' if on else 'true'))


async def look_up(pg, run, tag, glow, c):
    """c＝鏡頭位置（x, y, z）：往最近的燈一張、偏 4 cm 再一張、往正上方一張"""
    v = await pg.evaluate(NEAREST + "(%s)" % json.dumps([glow] + c)); print('   ', tag, '最近的燈', v, flush=True)
    if v:
        await cine(pg, run, tag + '_lamp', c, v)
        await cine(pg, run, tag + '_lamp_b', [c[0] + 0.04, c[1] + 0.04, c[2] + 0.03], v)
    await cine(pg, run, tag + '_top', c, [c[0] + 0.3, c[1] + 9, c[2] - 1.2])


async def gym(pg, run):
    for h in (13, 20.5):
        await enter(pg, 'gym', h); run.setup('[捷徑] gym %.1f' % h)
        at = await put(pg, 0, 0); run.setup('[捷徑] 玩家搬到 1F 中間 %s' % at); await closephone(pg)
        await pg.wait_for_timeout(2500); await run.shot(pg, 'gym_%02d_default' % int(h))
        g = await pg.evaluate(GLOWS + "('gym_glows')"); print('   1F 預設鏡頭', h, '畫面裡的光暈', json.dumps(g, ensure_ascii=False), flush=True)
        cam = await pg.evaluate("(()=>{ const c=GAME.E.camera.position; return [+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2), +GAME.E.cam.yaw.toFixed(3), +GAME.E.cam.pitch.toFixed(3)]; })()")
        print('   鏡頭位置／yaw／pitch', cam, flush=True)
        await hide(pg, True); run.setup('[捷徑] 玩家藏起來（只為了往上看的鏡頭）')
        await look_up(pg, run, 'gym_%02d_mid' % int(h), 'gym_glows', [0, 1.6, 0])
        await hide(pg, False)
    for h in (13, 20.5):
        await enter(pg, 'gym_b1', h); run.setup('[捷徑] gym_b1 %.1f' % h); await closephone(pg)
        await hide(pg, True); run.setup('[捷徑] 玩家藏起來')
        for nm, c in (('lobby', [15.0, 1.6, 5.0]), ('fitness', [-7.0, 1.6, 8.5]), ('pool', [0.0, 1.6, -12.0])):
            await look_up(pg, run, 'b1_%02d_%s' % (int(h), nm), 'gym_b1_glows', c)
        await hide(pg, False)


async def dorm(pg, run):
    """③ 203 膠帶中間寫了字的那段（Y1_KAI_TAPE_TEXT，約 (1.52, 0, 0~0.53)，沿 z）：玩家站在旁邊的走道，
    預設鏡頭（進區域時的距離、俯角）四個方向、拉到最近（2.2 m）四個方向、最近＋玩家能調到的最大俯角（1.05）兩個方向——字認不認得出"""
    await pg.evaluate("(()=>{ const G=GAME.G; for(const k of ['KAI_TAPE','BOX_WINTER_OPEN','KAI_TAPE_GONE']) delete G.flags[k]; G.events=G.events||{}; G.events.done=G.events.done||{}; G.flags.KAI_TAPE=true; G.events.done.ev_kai_tape2=true; })()")
    await enter(pg, 'dorm', 15); run.setup('[捷徑] dorm 15:00，KAI_TAPE＋ev_kai_tape2 演過（膠帶中間有字）')
    d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
    for x, z in ((1.0, 0.25), (0.9, 0.9)):
        at = await put(pg, x, z); print('   玩家放到膠帶字旁邊', (x, z), '→', at, flush=True); await closephone(pg)
        for tag, d, pt in (('default', d0, p0), ('closest', 2.2, p0), ('top', 2.2, 1.05)):
            for k in range(4 if tag != 'top' else 2):
                y = 1.5708 + k * 1.5708
                await pg.evaluate("(([y,d,p])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=p; C.manualT=60; })(%s)" % json.dumps([y, d, pt]))
                await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, 'tape_%s_%s_%.1f_%d' % (tag, 'a' if x == 1.0 else 'b', d, k))
    # ④ 壓平的紙箱（Y1_BOX_FOLDED，約 (-2.83, 0.3, -0.1)，0.08×0.6×0.78，靠在書桌底下的牆邊）：artrev2 的近拍被書桌擋住——這次從房間這邊低低地看、玩家站在書桌前的預設鏡頭
    await pg.evaluate("(()=>{ const G=GAME.G; G.flags.BOX_WINTER_OPEN=true; })()")
    await enter(pg, 'dorm', 15); run.setup('[捷徑] dorm 15:00，BOX_WINTER_OPEN（紙箱拆了、壓平）')
    box = await pg.evaluate("(()=>{ let m=null; GAME.E.scene.traverse(o=>{ if(o.name==='Y1_BOX_FOLDED') m=o; }); if(!m) return null; const b=new THREE.Box3().setFromObject(m), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); return {vis:m.visible, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], s:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}; })()")
    print('   壓平的紙箱', box, flush=True)
    if box:
        c = box['c']
        await cine(pg, run, 'folded_low', [c[0] + 1.1, 0.45, c[2]], [c[0], c[1], c[2]])
        await cine(pg, run, 'folded_low_side', [c[0] + 1.0, 0.55, c[2] + 0.7], [c[0], c[1], c[2]])
        await cine(pg, run, 'folded_high', [c[0] + 1.2, 1.5, c[2] + 0.4], [c[0], c[1], c[2]])
        at = await put(pg, c[0] + 1.3, c[2]); print('   玩家放到書桌前', at, flush=True); await closephone(pg)
        for tag, d, pt in (('default', d0, p0), ('closest', 2.2, p0)):
            await pg.evaluate("(([y,d,p])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=p; C.manualT=60; })(%s)" % json.dumps([1.5708, d, pt]))
            await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, 'folded_player_%s' % tag)


async def main():
    run = L.Run('artrev3', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        ONLY = os.environ.get('ONLY', '')   # 2026-10-21：ONLY=dorm 只重拍 203（LAWWW2 膠帶字＋壓平紙箱 6437fcf6）；ONLY=gym 只拍體育館
        for nm, f in (('膠帶', dorm), ('體育館', gym)):
            if ONLY and (('dorm' if f is dorm else 'gym') not in ONLY): continue
            try: await f(pg, run)
            except Exception as e: print('  ! 失敗：', e, flush=True); run.check('%s跑完' % nm, False, str(e)[:200])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
