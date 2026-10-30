"""環境 GLB 改前改後（真的換 GLB 檔）同角度並排——PERF-SINGLESIDE-GLB-1025，LAWWW2-B 2026-10-25。
每一份重新載入遊戲，用 page.route 把指定的 GLB 換成另一份（其他檔案照舊），路人拿掉，照清單一個一個鏡頭拍；最後拼成一張「左＝改前、右＝改後」的對照圖。
清單（JSON）：{"zone": "gongguan", "state": {...讀檔用，可省略}, "views": [
   {"name": "arcade", "label": "騎樓往東", "hour": 15, "pos": [x, z], "yaw": 弧度, "pitch": 弧度}          ← 跟隨鏡頭（玩家站 pos，鏡頭在 (sin yaw, cos yaw) 那一側）
   {"name": "lane", "label": "巷子往東", "hour": 17.5, "eye": [x, y, z], "look": [x, y, z], "pos": [x, z]}  ← 固定鏡頭（E.cinematic；pos＝玩家站哪裡，載入附近的東西）
   每個鏡頭可以加 "js": "…"：拍之前在頁面跑（例：GAME.E.zone.lightsOff(1)）
 ]}
用法（repo 根目錄開 http server）：
  python3 tools/blender/env_second/shots/glb_ab_views.py <URL> <清單.json> <輸出資料夾> 改前=<網址路徑>:<本機 GLB>[,…] 改後=<網址路徑>:<本機 GLB>[,…]
同一台機器上同時只跑這一個瀏覽器工作。"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
URL, LIST, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
VARS = [a.split('=', 1) for a in sys.argv[4:]]
CFG = json.load(open(LIST)); VIEWS = CFG['views']
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 20)


CT = {'.js': 'application/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png'}   # 也可以換程式檔（RT-NIGHT-1028：改前改後是 zones3d.js 不一樣）


def mk(data, ct='model/gltf-binary'):   # page.route 的處理函式會收到 (route, request) 兩個參數：資料要用閉包帶進去，不能用預設參數
    async def fulfil(route): await route.fulfill(status=200, body=data, headers={'Content-Type': ct})
    return fulfil


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for vname, spec in VARS:
            ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True)
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if '失敗' in m.text or m.type == 'error' else None)   # 正式模型載入失敗時遊戲退回套件、只 console.warn（第一次試公館的時候整排店面不見了，截圖才看出來）
            for pair in [s for s in spec.split(',') if s]:
                url_path, local = pair.split(':', 1)
                await pg.route('**/' + url_path.lstrip('/') + '*', mk(open(local, 'rb').read(), CT.get(os.path.splitext(local)[1], 'application/octet-stream')))
            await pg.goto(URL)
            for i in range(240):
                if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
                await pg.wait_for_timeout(500)
            await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
            st = {'zone': CFG['zone'], 'day': -330, 'hour': VIEWS[0].get('hour', 15), 'stage': 'econ', 'weather': 'sunny'}; st.update(CFG.get('state', {}))
            fl = dict(FLAGS); fl.update(st.get('flags', {})); st['flags'] = fl
            await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.weekday=s.weekday||3; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
            await pg.wait_for_timeout(15000)
            await pg.evaluate("(()=>{ const E=GAME.E; E.npcs.forEach(n=>{ n.hidden=true; n.obj.visible=false; }); (E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); })()")
            for v in VIEWS:
                await pg.evaluate("""(v=>{ const E=GAME.E, P=E.player; if(v.pos){ P.obj.position.set(v.pos[0],0,v.pos[1]); P.path=null; if(E.setLv) E.setLv(P,v.lv|0); if(E.settleY) E.settleY(P); } P.busy=true;
                    const h=v.hour!=null?v.hour:15; GAME.G.hour=h; E.applyTime(h);
                    if(v.eye){ E.cinematic(new THREE.Vector3(...v.eye),new THREE.Vector3(...v.look)); E.camera.position.set(...v.eye); E.cam.look=new THREE.Vector3(...v.look); E.camera.lookAt(E.cam.look); }
                    else { E.endCinematic&&E.endCinematic(); const C=E.cam; C.mode='follow'; C.yaw=v.yaw; C.pitch=v.pitch!=null?v.pitch:0.25; C.manualT=1e9; } })(%s)""" % json.dumps(v))
                if v.get('js'): await pg.wait_for_timeout(3000); await pg.evaluate(v['js'])   # 拍之前在頁面跑一段（例：熄燈 GAME.E.zone.lightsOff(1)、藏起玩家；DORM-SLEEP-VISUAL-1030）
                await pg.wait_for_timeout(9000)
                await pg.screenshot(path=os.path.join(OUT, '%s_%s.png' % (vname, v['name'])))
                print(vname, v['name'], errs[-1:], flush=True)
            if errs: print('ERRORS', vname, json.dumps(errs, ensure_ascii=False)[:2000], flush=True)
            await ctx.close()
        await b.close()
    names = [x[0] for x in VARS]; ims = [[Image.open(os.path.join(OUT, '%s_%s.png' % (n, v['name']))) for n in names] for v in VIEWS]
    W, H = ims[0][0].size; s = 0.5; w, h = int(W * s), int(H * s)
    sheet = Image.new('RGB', (10 + len(names) * (w + 10), 40 + len(VIEWS) * (h + 34)), (245, 245, 242)); d = ImageDraw.Draw(sheet)
    d.text((10, 8), CFG.get('title', '左＝改前、右＝改後；路人拿掉、同一個鏡頭'), fill=(20, 20, 20), font=F)
    for r, v in enumerate(VIEWS):
        y = 40 + r * (h + 34); d.text((10, y), v.get('label', v['name']), fill=(20, 20, 20), font=F)
        for c, im in enumerate(ims[r]): sheet.paste(im.resize((w, h)), (10 + c * (w + 10), y + 26))
    sheet.save(os.path.join(OUT, 'sheet.jpg'), quality=86); print('sheet', os.path.join(OUT, 'sheet.jpg'), flush=True)
asyncio.run(main())
