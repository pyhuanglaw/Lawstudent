"""吳芯慈 VRM 在遊戲渲染器裡的外觀檢視（LAWWW 的 test_charlook.html：遊戲本身的 ASSETS＋CHAR.build、白天的光線、走路動畫）。
這不是遊戲內截圖（D59：遊戲內截圖由 LAWWW 接進遊戲後拍給 BB）；用來確認 VRM 讀得進來、MToon 顏色、走路時衣服頭髮不爆。
不改任何檔案：Playwright 攔截 test_charlook.html，在 props3d.js 後面加一個 manifest 項目（照陳語彤的設定、換成芯慈的 VRM、身高 1.60、沒有配件）。
用法：python3 xinci_lookdev.py <網址根（LAWWW 工作目錄的伺服器）> <VRM 檔> <輸出資料夾> [tpose]"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright
ROOT, VRM, OUT = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
TPOSE = len(sys.argv) > 4 and sys.argv[4] == 'tpose'
os.makedirs(OUT, exist_ok=True)
INJ = ("<script src=\"src/props3d.js\"></script>\n<script>ASSETS.manifest['char.xinci_test']=Object.assign({},ASSETS.manifest['char.heroine_03'],"
       "{url:'assets/models/char/second_ai/bl_classmate_xinci.vrm',height:1.60});</script>")


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 480, 'height': 600}, device_scale_factor=1)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        async def page(route):
            r = await route.fetch(); body = (await r.text()).replace('<script src="src/props3d.js"></script>', INJ)
            await route.fulfill(response=r, body=body, headers={'content-type': 'text/html; charset=utf-8'})
        await pg.route(re.compile(r'.*/test_charlook\.html.*'), page)
        vb = open(VRM, 'rb').read()
        await pg.route(re.compile(r'.*/assets/models/char/second_ai/bl_classmate_xinci\.vrm.*'), lambda r: r.fulfill(status=200, body=vb, headers={'content-type': 'model/gltf-binary'}))
        await pg.goto(ROOT + '/test_charlook.html?id=char.xinci_test' + ('&tpose=1' if TPOSE else ''))
        for _ in range(360):
            if await pg.evaluate('!!window.__ready'): break
            await pg.wait_for_timeout(500)
        log = await pg.evaluate("document.getElementById('log').textContent")
        print('log', log.strip().replace('\n', ' | '))
        for v in ('face_front', 'face_q45', 'face_side', 'body_front', 'body_q45', 'body_back'):
            await pg.evaluate("window.__view(%r)" % v); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'{OUT}/xinci_look_{v}{"_tpose" if TPOSE else ""}.png')
        print('errors', errs[:5])
        await b.close()

asyncio.run(main())
