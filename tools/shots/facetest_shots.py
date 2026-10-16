"""祐廷 3D 臉試做的遊戲內截圖（BB_131 第 11 節；LAWWW2-B 2026-10-16）。
同一個鏡頭拍兩次：預設模型（vroid_yuting.vrm）／網址加 ?facetest（vroid_yuting_facetest.vrm），之後並排成對照表（facetest_sheet.py）。
- 三種距離：
  - face：臉部特寫，鏡頭在臉前 1.2 m、和眼睛同高（戶外，椰林大道，char_review.py 的位置）；
  - indoor：室內最近的跟隨鏡頭，宿舍 203，距離 2.2 m、俯角 0.38（遊戲室內預設的俯角；兩指縮放的下限是 2.2 m）；
  - follow：戶外平常的跟隨鏡頭，距離 6 m、俯角 0.22（遊戲戶外預設）。
  - 三種都是鏡頭在人物正前方（人物面向鏡頭），平常玩的時候鏡頭在背後，轉身、走向鏡頭時才看得到臉。
- 時段：11:00、17:30、20:30。畫面：390×844、844×390（手機模擬、dpr 2）。
- 表情（--expr）：臉部特寫 11:00，600×600：neutral、blink（閉眼）、happy、sad、angry、surprised、aa、ih、ou、ee、oh。
  遊戲每一格會重設 blink、aa（自動眨眼、說話的嘴），截圖時把這兩個鎖在要拍的值。
用法：python3 tools/shots/facetest_shots.py <網址根> <輸出資料夾> [--variants def,ft] [--dists face,indoor,follow] [--hours 11,17.5,20.5] [--vps 390x844,844x390] [--expr]
輸出：<輸出資料夾>/<variant>_<dist>_<hour>_<WxH>.png、<variant>_expr_<表情>.png。不改任何遊戲檔案。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
ROOT, OUT = sys.argv[1].rstrip('/'), sys.argv[2]
OPT = {sys.argv[i]: sys.argv[i + 1] for i in range(3, len(sys.argv) - 1) if sys.argv[i].startswith('--') and not sys.argv[i + 1].startswith('--')}
VARS = OPT.get('--variants', 'def,ft').split(','); DISTS = OPT.get('--dists', 'face,indoor,follow').split(',')
HOURS = [float(h) for h in OPT.get('--hours', '11,17.5,20.5').split(',')]; VPS = [tuple(map(int, v.split('x'))) for v in OPT.get('--vps', '390x844,844x390').split(',')]
EXPR = '--expr' in sys.argv
os.makedirs(OUT, exist_ok=True)
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
HIDE = '#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#talkBtn{display:none!important}'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True}
SPOT = {'campus': (-30.0, -1.5, 0.0), 'dorm': (0.0, 0.2, 0.0)}           # 人物位置與朝向（yaw 0：面向 +z；鏡頭 yaw 0 在 +z 那一側＝人物正前方）
EXPRS = [('neutral', {}), ('blink', {'blink': 1}), ('happy', {'happy': 1}), ('sad', {'sad': 1}), ('angry', {'angry': 1}), ('surprised', {'surprised': 1}),
         ('aa', {'aa': 1}), ('ih', {'ih': 1}), ('ou', {'ou': 1}), ('ee', {'ee': 1}), ('oh', {'oh': 1})]


async def frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def load(pg, zone, hour):
    await pg.evaluate("(async(z,h,f)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,{zone:z,hour:h,day:8,weekday:2,weather:'sunny',flags:f}); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s,%s,%s)" % (json.dumps(zone), hour, json.dumps(FLAGS)))
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    for _ in range(160):                                                     # 等玩家的 VRM 載入
        ok = await pg.evaluate("(()=>{ const m=GAME.E.player.obj.userData&&GAME.E.player.obj.userData.model; return !!(m&&m.userData&&m.userData.driver==='vrm'); })()")
        if ok: break
        await pg.wait_for_timeout(500)
    await frames(pg, 8)
    await pg.evaluate("GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); (GAME.E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); for(const k in GAME.npc) delete GAME.npc[k];")
    x, z, yaw = SPOT[zone]
    # 鎖住眨眼和嘴（遊戲每一格會重設）：window.__lock 裡有的表情用鎖的值
    await pg.evaluate("""((x,z,yaw)=>{ const P=GAME.E.player; P.obj.visible=true; P.obj.position.set(x,0,z); P.obj.rotation.y=yaw; P.path=null; P.seat=null; P.frozen=true; P.busy=true; P.pose='idle'; P.idlePose='idle';
      const R=P.obj.userData, M=(R.model&&R.model.userData)||{}; const u=R.anim?R:M; u.anim.blink=1e9; u.anim.blinkT=0; const em=(R.vrm||M.vrm).expressionManager;
      if(!em.__orig){ em.__orig=em.setValue.bind(em); em.setValue=(k,v)=>em.__orig(k, (window.__lock&&k in window.__lock)?window.__lock[k]:v); }
      window.__lock={blink:0, aa:0}; })(%s,%s,%s)""" % (x, z, yaw))
    return True


async def set_time(pg, hour):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); GAME.updateHUD&&GAME.updateHUD(); })(%s)" % hour)


async def shoot(pg, dist, hour, out):
    # 臉的位置：臉部網格（VRoid 的 Face）在世界座標的範圍；眼睛約在下巴到額頭的 43%（vroid_yuting：下巴 1.496、額頭 1.741、眼白 1.59～1.61）
    face = await pg.evaluate("(()=>{ const P=GAME.E.player; P.obj.updateMatrixWorld(true); let fm=null; P.obj.traverse(o=>{ if(!fm&&o.isMesh&&/^Face/.test(o.name||'')) fm=o; }); const b=new THREE.Box3(); if(fm) b.setFromObject(fm); else b.setFromObject(P.obj); return [ (b.min.x+b.max.x)/2, b.min.y, b.max.y, (b.min.z+b.max.z)/2, !!fm ]; })()")
    if dist == 'face':
        hx, y0, y1, hz, ok = face; ey = y0 + 0.43 * (y1 - y0) if ok else y1 - 0.13
        await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps([hx, ey, hz + 1.2]), json.dumps([hx, ey - 0.02, hz])))
    else:
        d, pitch = (2.2, 0.38) if dist == 'indoor' else (6.0, 0.22)
        await pg.evaluate("((d,p)=>{ const E=GAME.E; E.endCinematic&&E.endCinematic(); const C=E.cam; C.mode='follow'; C.yaw=0; C.pitch=p; C.pitchAdd=0; C.distTarget=d; C.dist=d; C.manualT=999; })(%s,%s)" % (d, pitch))
    await set_time(pg, hour)
    await pg.wait_for_timeout(1500); await frames(pg, 6); await set_time(pg, hour); await frames(pg, 2)
    await pg.screenshot(path=out)


async def run(variant):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        jobs = [((600, 600), 1, False)] if EXPR else [((w, h), 2, True) for (w, h) in VPS]   # --expr：只拍表情
        for (w, h), dpr, mobile in jobs:
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, has_touch=mobile, is_mobile=mobile, user_agent=UA if mobile else None)
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(ROOT + '/index.html' + ('?facetest' if variant == 'ft' else ''))
            for _ in range(240):
                if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
                await pg.wait_for_timeout(500)
            await pg.add_style_tag(content=HIDE)
            url = await pg.evaluate("ASSETS.manifest['char.yuting'].url")
            if (w, h) == (600, 600):
                await load(pg, 'campus', 11)
                for name, lock in EXPRS:
                    await pg.evaluate("(l=>{ window.__lock=Object.assign({blink:0, aa:0}, l); const R=GAME.E.player.obj.userData, M=(R.model&&R.model.userData)||{}; const em=(R.vrm||M.vrm).expressionManager; for(const k of ['happy','sad','angry','surprised','relaxed','ih','ou','ee','oh']) em.setValue(k, (k in l)?l[k]:0); })(%s)" % json.dumps(lock))
                    out = os.path.join(OUT, f'{variant}_expr_{name}.png'); await shoot(pg, 'face', 11, out); print('shot', out, url, flush=True)
                await ctx.close(); continue
            for zone, dl in (('campus', [d for d in DISTS if d in ('face', 'follow')]), ('dorm', [d for d in DISTS if d == 'indoor'])):
                if not dl: continue
                await load(pg, zone, HOURS[0])
                for dist in dl:
                    for hour in HOURS:
                        out = os.path.join(OUT, f'{variant}_{dist}_{hour:g}_{w}x{h}.png'); await shoot(pg, dist, hour, out); print('shot', out, url, flush=True)
            print(variant, (w, h), 'errors', errs[:3], flush=True)
            await ctx.close()
        await b.close()


async def main():
    for v in VARS: await run(v)

asyncio.run(main())
