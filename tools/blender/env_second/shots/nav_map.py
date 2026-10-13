"""把遊戲一個區域的導航格（哪裡能走、哪裡被擋）匯出成平面圖（找空地放東西用；PROPOSAL 的根據）。
用法：python3 tools/blender/env_second/shots/nav_map.py <URL> <區域> <輸出.png> [--box x0,z0,x1,z1,名稱]... [--px 每格像素] [--crop x0,z0,x1,z1]
畫法：白＝能走、深灰＝擋住；北在上（遊戲 −z）；--box 是要檢查的長方形（印出裡面被擋的格子比例）。"""
import asyncio, json, sys, base64
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
URL, ZONE, OUT = sys.argv[1:4]
A = sys.argv[4:]
BOXES = [a.split(',') for i, a in enumerate(A) if i > 0 and A[i - 1] == '--box']
PX = int(A[A.index('--px') + 1]) if '--px' in A else 2
CROP = [float(v) for v in A[A.index('--crop') + 1].split(',')] if '--crop' in A else None
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 640, 'height': 400})).new_page()
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,{zone:%s,hour:12,pos:{x:0,z:0,lv:0}}); s.day=8; s.weekday=6; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(ZONE))
        await pg.wait_for_timeout(3000)
        data = await pg.evaluate("""(()=>{ const n=GAME.E.nav; let s=''; const B=n.b; const CH=0x8000; for(let i=0;i<B.length;i+=CH) s+=String.fromCharCode.apply(null,B.subarray(i,i+CH)); return {cols:n.cols,rows:n.rows,cell:n.cell,ox:n.ox,oz:n.oz,b:btoa(s)}; })()""")
        await b.close()
    cols, rows, cell, ox, oz = data['cols'], data['rows'], data['cell'], data['ox'], data['oz']
    bl = base64.b64decode(data['b'])
    im = Image.new('RGB', (cols * PX, rows * PX), (255, 255, 255)); px = im.load()
    for cz in range(rows):
        for cx in range(cols):
            if bl[cz * cols + cx] == 1:
                for dy in range(PX):
                    for dx in range(PX): px[cx * PX + dx, cz * PX + dy] = (70, 72, 78)
    d = ImageDraw.Draw(im); f = ImageFont.truetype(FONT, 14)
    W2P = lambda x, z: ((x - ox) / cell * PX, (z - oz) / cell * PX)
    res = []
    for x0, z0, x1, z1, name in BOXES:
        x0, z0, x1, z1 = map(float, (x0, z0, x1, z1)); tot = blk = 0
        for cz in range(max(0, int((z0 - oz) / cell)), min(rows, int((z1 - oz) / cell) + 1)):
            for cx in range(max(0, int((x0 - ox) / cell)), min(cols, int((x1 - ox) / cell) + 1)):
                tot += 1; blk += bl[cz * cols + cx] == 1
        res.append({'box': name, 'rect': [x0, z0, x1, z1], 'blocked_frac': round(blk / max(1, tot), 3)})
        d.rectangle([W2P(x0, z0), W2P(x1, z1)], outline=(220, 40, 40), width=3); d.text(W2P(x0, z0 - 3), name, font=f, fill=(200, 30, 30))
    for gx in range(int(ox // 20) * 20, int(ox + cols * cell) + 1, 20):   # 20 m 的格線與座標
        d.line([W2P(gx, oz), W2P(gx, oz + rows * cell)], fill=(170, 200, 230), width=1); d.text(W2P(gx + 0.5, oz + 1), str(gx), font=f, fill=(60, 100, 160))
    for gz in range(int(oz // 20) * 20, int(oz + rows * cell) + 1, 20):
        d.line([W2P(ox, gz), W2P(ox + cols * cell, gz)], fill=(170, 200, 230), width=1); d.text(W2P(ox + 1, gz + 0.5), str(gz), font=f, fill=(60, 100, 160))
    if CROP:
        a, b2 = W2P(CROP[0], CROP[1]), W2P(CROP[2], CROP[3]); im = im.crop((int(a[0]), int(a[1]), int(b2[0]), int(b2[1])))
    im.save(OUT)
    print(json.dumps({'cols': cols, 'rows': rows, 'cell': cell, 'ox': ox, 'oz': oz, 'boxes': res}, ensure_ascii=False))


asyncio.run(main())
