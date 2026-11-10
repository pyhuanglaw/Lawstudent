"""頭髮近景：每個 VRM × 每種設定 × 每個角度截一張，拼成一張圖。用法：python3 shoot_hair.py <輸出.jpg> <vrm 路徑（相對 server 根目錄）>..."""
import asyncio, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1]; VRMS = sys.argv[2:]
VARS = ['game', 'toon', 'toon_sphere', 'toon_sphere_rim']; VIEWS = [0, 1, 2, 3, 4]
F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 18)
NAMES = {'game': '目前遊戲', 'toon': '①兩階明暗', 'toon_sphere': '①＋②法線轉移', 'toon_sphere_rim': '①②＋③輪廓光'}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 512, 'height': 512})
        tiles = {}
        for v in VRMS:
            for var in VARS:
                for vi in VIEWS:
                    await pg.goto(f'http://127.0.0.1:8799/hairview.html?vrm={v}&variant={var}&view={vi}')
                    await pg.wait_for_function('window.done===true', timeout=120000)
                    t = await pg.title()
                    if t.startswith('ERR'): print(v, t); continue
                    fn = OUT + f'.{os.path.basename(v)}.{var}.{vi}.png'; await pg.screenshot(path=fn); tiles[(v, var, vi)] = fn
                    print('ok', fn, flush=True)
        await b.close()
    T = 300
    for v in VRMS:
        o = Image.new('RGB', (130 + T * len(VIEWS), 30 + T * len(VARS)), 'white'); d = ImageDraw.Draw(o)
        d.text((4, 4), os.path.basename(v) + '　（正面、45°、側面、背面斜後、跟隨鏡頭距離 3.2 m）', fill=(0, 0, 0), font=F)
        for r, var in enumerate(VARS):
            d.text((4, 30 + r * T + T // 2 - 10), NAMES[var], fill=(0, 0, 0), font=F)
            for c, vi in enumerate(VIEWS):
                fn = tiles.get((v, var, vi))
                if fn: o.paste(Image.open(fn).resize((T, T), Image.LANCZOS), (130 + c * T, 30 + r * T))
        o.save(OUT.replace('.jpg', f'_{os.path.basename(v).split(".")[0]}.jpg'), quality=85)
asyncio.run(main())
