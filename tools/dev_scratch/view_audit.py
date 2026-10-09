"""360° 視角盤點：在實際遊戲裡，把玩家放到指定位置，用一般跟隨鏡頭轉一圈（預設 8 個方向）各拍一張，
每個位置拼成一張對照表（contact sheet），用來找「轉鏡頭看到大片空地／地圖邊界／孤立建築」的角度。
不是合成圖：每張都是遊戲引擎即時算圖（Playwright＋SwiftShader，不是手機實機）。

用法：python3 tools/dev_scratch/view_audit.py URL spec.json 輸出資料夾 [方向數=8] [寬=480] [高=270]
spec.json：[{"name":"椰林大道中段","zone":"campus","x":-38,"z":-4,"hour":11}, ...]（同一個 zone 連續排列，只載入一次）
輸出：每個位置一張 <name>.jpg（上排 0°–135°、下排 180°–315°；0° 是鏡頭在玩家南邊、往北看），以及 index.txt。"""
import asyncio, json, math, os, sys
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"


async def main():
    url = sys.argv[1] + ('&' if '?' in sys.argv[1] else '?') + 'turbo'
    spec = json.load(open(sys.argv[2]))
    out = sys.argv[3]; os.makedirs(out, exist_ok=True)
    nd = int(sys.argv[4]) if len(sys.argv) > 4 else 8
    W = int(sys.argv[5]) if len(sys.argv) > 5 else 480
    H = int(sys.argv[6]) if len(sys.argv) > 6 else 270
    try: font = ImageFont.truetype(FONT, 18)
    except Exception: font = ImageFont.load_default()
    index = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': W, 'height': H}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.add_style_tag(content=HIDE)
        cur = None
        for s in spec:
            if s['zone'] != cur or s.get('hour') is not None and s.get('hour') != (cur_hour if cur else None):
                st = {'zone': s['zone'], 'hour': s.get('hour', 11.0), 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': s['x'], 'z': s['z'], 'yaw': 0}, 'flags': FLAGS}
                await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
                await pg.wait_for_timeout(2500)
                cur = s['zone']; cur_hour = s.get('hour', 11.0)
            await pg.evaluate("(p=>{ const E=GAME.E, P=E.player; P.obj.position.set(p.x,0,p.z); E.unstick(P,8); P.path=null; P.target=null; })(%s)" % json.dumps({'x': s['x'], 'z': s['z']}))
            imgs = []
            for k in range(nd):
                yaw = k * 2 * math.pi / nd
                await pg.evaluate("(y=>{ const C=GAME.E.cam; C.mode='follow'; C.cine=null; C.yaw=y; C.pitch=0.22; C.distTarget=6; C.dist=6; C.manualT=999; })(%s)" % yaw)
                await pg.wait_for_timeout(1300)
                path = os.path.join(out, '_%s_%d.png' % (s['name'], k))
                await pg.screenshot(path=path)
                imgs.append(Image.open(path).convert('RGB'))
            pos = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(1),+o.z.toFixed(1)]; })()")
            cols = (nd + 1) // 2; pad = 6; bar = 26
            sheet = Image.new('RGB', (cols * W + (cols + 1) * pad, 2 * (H + bar) + 3 * pad), (245, 242, 236))
            d = ImageDraw.Draw(sheet)
            for k, im in enumerate(imgs):
                r, c = divmod(k, cols); x0 = pad + c * (W + pad); y0 = pad + r * (H + bar + pad)
                d.text((x0 + 4, y0 + 2), '%s  鏡頭 %d°' % (s['name'], round(k * 360 / nd)), fill=(40, 40, 40), font=font)
                sheet.paste(im, (x0, y0 + bar))
            fn = os.path.join(out, s['name'] + '.jpg'); sheet.save(fn, quality=85)
            for k in range(nd):
                try: os.remove(os.path.join(out, '_%s_%d.png' % (s['name'], k)))
                except OSError: pass
            index.append('%s\t%s\t要求 (%s,%s)\t實際 %s' % (s['name'], s['zone'], s['x'], s['z'], pos))
            print('sheet', fn, pos, 'errors:', errs[-3:], flush=True)
        await b.close()
    open(os.path.join(out, 'index.txt'), 'w').write('\n'.join(index) + '\n')
    print('errors:', errs[:5])

asyncio.run(main())
