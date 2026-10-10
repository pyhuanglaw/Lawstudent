"""人物調整時的快速比較（開發用，不是驗收）：test_charlook.html 拍 臉正面｜臉 45 度｜臉側面｜全身正面｜全身 45 度｜全身側面，拼成一列。
可以一次比較好幾個 VRM 檔（例如原版和 tools/vroid_wip/ 的試作版），每個檔一列。
用法：python3 tools/shots/char_lookdev.py <伺服器根網址> <輸出.jpg> <角色 id> [標籤=VRM 檔路徑 ...]（不給檔案＝遊戲現在用的那個）
例：python3 tools/shots/char_lookdev.py http://127.0.0.1:8765 /tmp/x.jpg player 現在= 試作=tools/vroid_wip/vroid_yuting.vrm"""
import asyncio, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

BASE, OUT, CID = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
ROWS = [a.split('=', 1) for a in sys.argv[4:]] or [['現在', '']]
VIEWS = ['face_front', 'face_q45', 'face_side', 'body_front', 'body_q45', 'body_side']
LABEL = {'face_front': '臉 正面', 'face_q45': '臉 45 度', 'face_side': '臉 側面', 'body_front': '全身 正面', 'body_q45': '全身 45 度', 'body_side': '全身 側面'}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


async def main():
    rows = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for label, f in ROWS:
            pg = await (await b.new_context(viewport={'width': 480, 'height': 600}, device_scale_factor=1)).new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            url = f'{BASE}/test_charlook.html?id={CID}' + (f'&file={f}' if f else '')
            await pg.goto(url)
            for i in range(240):
                r = await pg.evaluate('window.__ready||null')
                if r: break
                await pg.wait_for_timeout(500)
            print(label, r, errs[:2], flush=True)
            shots = []
            for vw in VIEWS:
                await pg.evaluate(f"window.__view('{vw}')"); await pg.wait_for_timeout(1200)
                shots.append(Image.open(__import__('io').BytesIO(await pg.screenshot())).convert('RGB'))
            rows.append((label, shots)); await pg.close()
        await b.close()
    f = ImageFont.truetype(FONT, 20); w, h = rows[0][1][0].size; lw = 120
    c = Image.new('RGB', (lw + w * len(VIEWS), 30 + h * len(rows)), (245, 242, 236)); d = ImageDraw.Draw(c)
    for k, vw in enumerate(VIEWS): d.text((lw + k * w + 6, 4), LABEL[vw], fill=(30, 30, 30), font=f)
    for r, (label, shots) in enumerate(rows):
        d.text((6, 30 + r * h + 8), label, fill=(30, 30, 30), font=f)
        for k, im in enumerate(shots): c.paste(im, (lw + k * w, 30 + r * h))
    c.save(OUT, quality=86); print('saved', OUT)

asyncio.run(main())
