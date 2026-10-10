"""校園俯視圖（實際遊戲引擎算圖，不是地圖貼圖）：用來和台大校總區平面圖對照配置。
用法：python3 tools/shots/campus_overview.py <URL> <輸出.png> [地圖.png]
  給第三個參數時，另外輸出「<輸出>_vs_map.jpg」：左邊遊戲俯視、右邊平面圖（只在本機比較，平面圖不進 repo）。
鏡頭在校園中心上空、窄視角（接近正投影），畫面上方＝北（遊戲的 -z）；暫時關掉霧、天空球與遠景，其他都是遊戲本身的場景。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

URL = sys.argv[1]; OUT = sys.argv[2]; MAP = sys.argv[3] if len(sys.argv) > 3 else None
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 1300, 'height': 1050}, device_scale_factor=1)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'campus', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 0, 'z': -20, 'yaw': 0}, 'flags': FLAGS}
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
        await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}")
        await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(11.0); E.scene.remove(E.sky); E.scene.remove(E.skyline); E.scene.background=new THREE.Color(0xdfe3e6);
          E.q.far=6000; E.scene.fog.near=5000; E.scene.fog.far=6000;   // applyTime 每次都把 fog.far 設回 E.q.far，所以改品質設定本身
          E.player.obj.visible=false; E.camera.fov=21; E.camera.far=3000; E.camera.near=5; E.camera.updateProjectionMatrix();
          const p=new THREE.Vector3(-3,640,-17), l=new THREE.Vector3(-3,0,-19.5); E.cinematic(p,l); E.camera.position.copy(p); E.cam.look=l.clone(); E.camera.lookAt(l); })()""")
        await pg.wait_for_timeout(6000)
        await pg.screenshot(path=OUT); print('overview', OUT, 'errors:', errs[:3])
        await b.close()
    if MAP:
        a = Image.open(OUT).convert('RGB'); m = Image.open(MAP).convert('RGB')
        H = 760; a = a.resize((int(a.width * H / a.height), H)); m = m.resize((int(m.width * H / m.height), H))
        c = Image.new('RGB', (a.width + m.width + 24, H + 48), (245, 242, 236)); d = ImageDraw.Draw(c); f = ImageFont.truetype(FONT, 24)
        c.paste(a, (8, 40)); c.paste(m, (a.width + 16, 40))
        d.text((12, 8), '遊戲內俯視（v9.3，上＝北）', fill=(40, 34, 30), font=f); d.text((a.width + 20, 8), '臺大校總區平面圖（參考）', fill=(40, 34, 30), font=f)
        c.save(OUT.rsplit('.', 1)[0] + '_vs_map.jpg', quality=88); print('compare', OUT.rsplit('.', 1)[0] + '_vs_map.jpg')

asyncio.run(main())
