"""任何一個 LAWWW2 做的人物 VRM 在遊戲渲染器裡的外觀檢視（LAWWW 的 test_charlook.html：遊戲本身的 ASSETS＋CHAR.build＋PROPS、白天的光線、
待機／走路動畫、坐姿）。這不是遊戲內截圖（D59：遊戲內截圖由 LAWWW 接進遊戲後拍給 BB）。不改任何檔案：Playwright 攔截 test_charlook.html，
在 props3d.js 後面加一個 manifest 項目（照 --base 那個人物的設定、換成這個 VRM、身高 --height），VRM 從本機檔案送出。
用法：python3 char_lookdev.py <網址根> <VRM 檔> <輸出資料夾> [idle|walk|sit|tpose] --base char.zhe --height 1.78 --tag zhe [--props backpack]
  --props 也可以是 JSON（配件有參數時），例如 '[{"name":"glasses","glb":"prop.glasses_bohan"},"backpack"]'；
  --blchar：網址加 &blchar（開發分支：沒有它時 blOnly 的人物不在 manifest 裡，--base 用它們會失敗）
  --asset key=網址：多加一個 lazy 的配件 GLB（例如 prop.glasses_bohan=assets/models/char/second_ai/glasses_bohan.glb；伺服器要有這個檔案，或在目前目錄下有同一個相對路徑的檔案（直接從本機送出））
（芯慈用 xinci_lookdev.py；這支是一般化的版本）"""
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
ROOT, VRM, OUT = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
MODE = sys.argv[4] if len(sys.argv) > 4 and not sys.argv[4].startswith('--') else 'idle'
OPT = {sys.argv[i]: sys.argv[i + 1] for i in range(1, len(sys.argv) - 1) if sys.argv[i].startswith('--') and sys.argv[i] != '--blchar'}
BASE, HEIGHT, TAG = OPT.get('--base', 'char.zhe'), float(OPT.get('--height', '1.70')), OPT.get('--tag', 'char')
PROPS = json.loads(OPT['--props']) if OPT.get('--props', '').startswith('[') else [p for p in OPT.get('--props', '').split(',') if p]
EXTRA = dict(a.split('=', 1) for a in [sys.argv[i + 1] for i in range(1, len(sys.argv) - 1) if sys.argv[i] == '--asset'])
QS = {'tpose': '&tpose=1', 'walk': '&pose=walk&speed=1.4', 'sit': '&pose=sit'}.get(MODE, '') + ('&blchar' if '--blchar' in sys.argv else '')   # --blchar：開發分支（2026-10-14 起）沒有 ?blchar 時會把 blOnly 的人物（芯慈等）從 manifest 拿掉
VIEWS = {'walk': ('body_front', 'body_q45', 'body_side'), 'sit': ('body_front', 'body_q45', 'body_side', 'hips_side')}.get(MODE, ('face_front', 'face_q45', 'face_side', 'body_front', 'body_q45', 'body_back'))
URL = 'assets/models/char/second_ai/_lookdev_%s.vrm' % TAG
os.makedirs(OUT, exist_ok=True)
INJ = ("<script src=\"src/props3d.js\"></script>\n<script>ASSETS.manifest['char.lookdev_test']=Object.assign({},ASSETS.manifest[%s],{url:%s,height:%s});"
       "CHAR.MODEL_PROPS['char.lookdev_test']=%s;%s</script>") % (json.dumps(BASE), json.dumps(URL), HEIGHT, json.dumps(PROPS),
       ''.join("ASSETS.manifest[%s]={url:%s,type:'building',lazy:true};" % (json.dumps(k), json.dumps(v)) for k, v in EXTRA.items()))


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
        await pg.route(re.compile(r'.*/' + re.escape(URL) + r'.*'), lambda r: r.fulfill(status=200, body=vb, headers={'content-type': 'model/gltf-binary'}))
        for v in EXTRA.values():      # --asset 的檔案在本機（這個 repo）就直接送出：伺服器（別人的工作目錄）還沒有這個檔案也能看
            if os.path.isfile(v):
                def serve(ab):      # playwright 會把 request 當第二個參數傳進來，不能用 lambda 的預設參數綁檔案內容
                    return lambda r: r.fulfill(status=200, body=ab, headers={'content-type': 'model/gltf-binary'})
                await pg.route(re.compile(r'.*/' + re.escape(v) + r'.*'), serve(open(v, 'rb').read()))
        await pg.goto(ROOT + '/test_charlook.html?id=char.lookdev_test' + QS)
        for _ in range(360):
            if await pg.evaluate('!!window.__ready'): break
            await pg.wait_for_timeout(500)
        print('log', (await pg.evaluate("document.getElementById('log').textContent")).strip().replace('\n', ' | '))
        for v in VIEWS:
            await pg.evaluate("window.__view(%r)" % v); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'{OUT}/{TAG}_look_{v}{"" if MODE == "idle" else "_" + MODE}.png')
        print('errors', errs[:5])
        await b.close()

asyncio.run(main())
