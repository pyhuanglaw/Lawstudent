"""美國社區西邊出口：同一個鏡頭比較幾份 us_community.glb 的 fps（SwiftShader）——US-COMMUNITY-WEST-PERF-1025，LAWWW2-B 2026-10-25。
每一份重新載入遊戲，用 page.route 把 us_community.glb 換成指定的檔案；玩家站在出口 (−39, 0)，跟隨鏡頭往西、往東各量 5 次（每次 5 秒），印出 draw call、三角形、fps，存截圖。
用法（先在 repo 根目錄開 http server）：
  python3 tools/blender/env_second/shots/perf_us_community_west.py http://127.0.0.1:8765/index.html <截圖資料夾> 844x390 改前=<舊.glb> 改後=<新.glb>
同一台機器上同時只跑這一個瀏覽器工作，也不要同時跑 Blender（搶 CPU，數字會偏低）。"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
URL, OUT, WH = sys.argv[1], sys.argv[2], sys.argv[3]; W, H = map(int, WH.split('x'))
VARS = [a.split('=', 1) for a in sys.argv[4:]]
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
MODS = [('base', '')]
VIEWS = {'west': 1.5708, 'east': -1.5708}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for vname, glb in VARS:
          body = open(glb, 'rb').read()
          def mk(data):
              async def fulfil(route): await route.fulfill(status=200, body=data, headers={'Content-Type': 'model/gltf-binary'})
              return fulfil
          ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, has_touch=True, is_mobile=True)
          pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); await pg.route('**/us_community.glb', mk(body))
          await pg.goto(URL)
          for i in range(240):
              if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
              await pg.wait_for_timeout(500)
          st = {'zone': 'us_outside', 'hour': 14, 'day': 1095, 'weather': 'sunny', 'pos': {'x': -39, 'z': 0, 'yaw': -1.5708}, 'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}
          await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.weekday=6; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(st))
          await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); }catch(e){} GAME.phoneThread=()=>Promise.resolve(); setInterval(()=>{ try{ if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
          for i in range(120):
              if await pg.evaluate("(()=>{ let ok=false; GAME.E.zone.group.traverse(o=>{ if(o.name==='usc_tree_core') ok=true; }); return ok; })()"): break
              await pg.wait_for_timeout(500)
          await pg.evaluate("GAME.E.npcs.slice().forEach(n=>{ n.obj.visible=false; if(n.obj.parent) n.obj.parent.remove(n.obj); }); (GAME.E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); })")
          await pg.evaluate("(()=>{ const E=GAME.E, P=E.player; P.obj.position.set(-39,0,0); P.path=null; P.busy=true; GAME.G.hour=14; E.applyTime(14); const C=E.cam; C.mode='follow'; C.yaw=1.5708; C.pitch=0.3; C.distTarget=5; C.dist=5; C.manualT=1e9; })()")
          for (name, js), vn in [(m, v) for m in MODS for v in VIEWS]:
              await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=1e9; })(%s)" % VIEWS[vn])
              await pg.wait_for_timeout(5000)
              fps = []
              for k in range(5):
                  f0 = await pg.evaluate("GAME.E.frame"); await pg.wait_for_timeout(5000); f1 = await pg.evaluate("GAME.E.frame"); fps.append((f1 - f0) / 5)
              info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return {calls:r.calls, tris:r.triangles}; })()")
              await pg.screenshot(path=os.path.join(OUT, f'{vname}_{vn}_{W}x{H}.png'))
              print(vname, name, vn, info, 'fps', fps, 'errors', errs[:2], flush=True)
          await ctx.close()
        await b.close()
asyncio.run(main())
