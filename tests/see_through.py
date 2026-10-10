"""樹幹透視（v9.3 #35）：鏡頭和玩家之間有大王椰子樹幹時，畫面上要看得到玩家。
做法：在椰林大道把玩家放在樹幹前、跟隨鏡頭在樹幹後面（實際遊戲、iPhone 直向模擬），在同一幀算三張圖：
  A＝正常畫面、B＝拿掉樹幹／電線桿的畫面、M＝只畫玩家的白色剪影（找出玩家在畫面上的範圍）。
在玩家範圍內，A 和 B 顏色一樣的像素比例＝「看得到玩家」的比例。
判定（跑之前就定好，不依結果調整）：
  - 情境有效：關掉透視時（uSeeR=0）看得到的比例 < 40%（代表樹幹真的擋住了玩家）
  - 透視有效：打開時 ≥ 60%
  - 演出鏡頭、室內不開透視；樹幹以外的材質沒有被改
用法：python3 tests/see_through.py [URL]   （預設 http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True}
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
# 椰林大道南側那排大王椰子（x=-50, z=-9.5）。玩家站在樹北邊、面向北；跟隨鏡頭在玩家正後方 → 樹幹在鏡頭和玩家之間
# 鏡頭在玩家後方水平 5.85 m（距離 6、俯角 0.22）：玩家 z＝-3.65－（樹幹到鏡頭的距離）
CASES = [('樹幹在鏡頭前約 1.0 m', -50.0, -4.65), ('樹幹在鏡頭前約 1.5 m', -50.0, -5.15), ('樹幹在鏡頭前約 2.6 m', -50.0, -6.25)]
MEASURE = """(()=>{ const E=GAME.E, R=E.renderer, scene=E.scene; const gl=R.getContext(); const W=gl.drawingBufferWidth, H=gl.drawingBufferHeight;
  const read=()=>{ const px=new Uint8Array(W*H*4); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px); return px; };
  E.render(); const A=read();
  const hid=[]; scene.traverse(o=>{ if(o.isMesh&&o.visible){ const ms=Array.isArray(o.material)?o.material:[o.material]; if(ms.some(m=>m&&m.userData&&m.userData.seeThrough)){ o.visible=false; hid.push(o); } } });
  E.render(); const B=read(); hid.forEach(o=>o.visible=true);
  const P=E.player.obj, saved=[]; scene.traverse(o=>{ if(o.isMesh||o.isLine||o.isPoints||o.isSprite){ let q=o, inP=false; while(q){ if(q===P){ inP=true; break; } q=q.parent; } if(!inP&&o.visible){ o.visible=false; saved.push(o); } } });
  const bg=scene.background, fog=scene.fog; scene.background=new THREE.Color(0,0,0); scene.fog=null; scene.overrideMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
  E.render(); const Mk=read(); scene.overrideMaterial=null; scene.background=bg; scene.fog=fog; saved.forEach(o=>o.visible=true);
  let n=0, same=0; for(let i=0;i<W*H;i++){ if(Mk[i*4]>128){ n++; const d=Math.abs(A[i*4]-B[i*4])+Math.abs(A[i*4+1]-B[i*4+1])+Math.abs(A[i*4+2]-B[i*4+2]); if(d<36) same++; } }
  E.render(); return {n, same, frac:n?+(same/n).toFixed(3):0, trunkMeshes:hid.length}; })()"""

async def main():
    fails = []
    def check(name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''))
        if not ok: fails.append(name)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(typeof GAME!=='undefined'&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        has = await pg.evaluate("!!(GAME.E.seeThrough)")
        check('引擎有樹幹透視', has)
        async def load(zone, x, z, yaw):
            st = {'zone': zone, 'hour': 10.5, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': FLAGS}
            await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
            for i in range(120):
                ok = await pg.evaluate("(()=>{ const m=GAME.E.player.obj.userData&&GAME.E.player.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })()")
                if ok: break
                await pg.wait_for_timeout(500)
        await load('campus', -50.0, -5.0, 0)
        # 路人不要走進畫面（只影響這個測試的量測）
        await pg.evaluate("GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; (GAME.E.extras||[]).forEach(x=>{ const o=x.obj; if(o) o.visible=false; });")
        patched = await pg.evaluate("(()=>{ let st=0, other=0; GAME.E.scene.traverse(o=>{ if(o.isMesh){ for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m||!m.userData) continue; if(m.userData._st){ if(m.userData.seeThrough) st++; else other++; } } } }); return {st,other}; })()")
        check('樹幹材質有套用透視、其他材質沒有被改', patched['st'] > 0 and patched['other'] == 0, json.dumps(patched))
        for name, x, z in CASES:
            await pg.evaluate("(a=>{ const E=GAME.E, P=E.player; P.obj.position.set(a[0],0,a[1]); P.obj.rotation.y=0; P.path=null; P.target=null; const C=E.cam; C.mode='follow'; C.cine=null; C.yaw=Math.PI; C.pitch=0.22; C.dist=C.distTarget=6.0; C.manualT=999; C.target.set(a[0],1.45,a[1]); })(%s)" % json.dumps([x, z]))
            await pg.wait_for_timeout(2500)
            info = await pg.evaluate("(()=>{ const E=GAME.E, c=E.camera.position, p=E.player.obj.position; return {cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+p.x.toFixed(2),+p.z.toFixed(2)], R:+E.seeThrough.uSeeR.value.toFixed(1)}; })()")
            on = await pg.evaluate(MEASURE)
            # 關掉透視（只在這一次量測），比較擋住的程度
            off = await pg.evaluate("(()=>{ const ST=GAME.E.seeThrough; const r=ST.uSeeR.value; ST.uSeeR.value=0; const res=(%s); ST.uSeeR.value=r; return res; })()" % MEASURE.replace('E.render(); return', 'return'))
            await pg.screenshot(path=f'screenshots/ST_{CASES.index((name, x, z))}_on.png')
            print('   ', name, info, 'off', off, 'on', on)
            check(f'{name}：情境有效（關掉透視時玩家被擋住，看得到 < 40%）', off['n'] > 500 and off['frac'] < 0.4, f"off={off['frac']} n={off['n']}")
            check(f'{name}：打開透視看得到玩家 ≥ 60%', on['frac'] >= 0.6, f"on={on['frac']}")
        # 演出鏡頭時不開
        r = await pg.evaluate("(async()=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(-50,1.6,-11),new THREE.Vector3(-50,1.2,-5)); await new Promise(r=>setTimeout(r,1500)); const v=E.seeThrough.uSeeR.value; E.endCinematic(); return v; })()")
        check('演出鏡頭時不開透視', r == 0, str(r))
        await load('dorm', 0, 2.5, 3.1416)
        await pg.wait_for_timeout(2000)
        r = await pg.evaluate("GAME.E.seeThrough.uSeeR.value")
        check('室內不開透視', r == 0, str(r))
        check('沒有 JS 例外', not errs, str(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
