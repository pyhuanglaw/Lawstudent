"""林芷若的眼鏡在遊戲渲染器裡的樣子（LAWWW 的 test_charlook.html：遊戲本身的 ASSETS＋CHAR.build＋PROPS、白天的光線、待機動畫）。
這不是遊戲內截圖（D59：遊戲內截圖由 LAWWW 接進遊戲後拍給 BB）；用來確認 GLB 讀得進來、戴的位置（鏡片對著眼睛、鏡腳往耳朵、不穿進臉或瀏海）、顏色。
修改前＝LAWWW 原本的程式產生的眼鏡（沒有套 patch 的工作目錄）；修改後＝套了 patches/glasses_zhiruo_97f4abc.patch＋GLB 的工作目錄。
用法：python3 glasses_lookdev.py <網址根> <輸出資料夾> <標籤> [blchar]
  blchar：用 Blender 版的芷若（manifest 的 blUrl；網址 ?blchar）"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
ROOT, OUT, TAG = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
BL = len(sys.argv) > 4 and sys.argv[4] == 'blchar'
os.makedirs(OUT, exist_ok=True)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 480, 'height': 600}, device_scale_factor=1)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        await pg.goto(ROOT + '/test_charlook.html?id=heroine_02' + ('&blchar' if BL else ''))
        for _ in range(360):
            if await pg.evaluate('!!window.__ready'): break
            await pg.wait_for_timeout(500)
        info = {'ready': await pg.evaluate('window.__ready'), 'log': (await pg.evaluate("document.getElementById('log').textContent")).strip()}
        # 正式模型是非同步載入的：等它掛上去（沒有套 patch 的版本不會有，等 6 秒就算了）
        for _ in range(40):
            if await pg.evaluate("!!(window.__h&&window.__h.getObjectByName('glasses_glb'))"): break
            await pg.wait_for_timeout(500)
        info['glb'] = await pg.evaluate("""(()=>{ const h=window.__h; if(!h) return null; const o=h.getObjectByName('prop:glasses'); if(!o) return {prop:false};
          const gl=h.getObjectByName('glasses_glb'); const out={prop:true, glb:!!gl, procVisible:o.children[0]&&o.children[0].visible, scale:o.scale.x, pos:o.position.toArray().map(v=>+v.toFixed(4))};
          if(gl){ let t=0, mats=[]; gl.traverse(m=>{ if(m.isMesh){ t+=m.geometry.index?m.geometry.index.count/3:m.geometry.attributes.position.count/3; mats.push(m.material.type+':'+('#'+m.material.color.getHexString())+(m.material.transparent?' a'+m.material.opacity.toFixed(2):'')); } }); out.tris=t; out.mats=mats; }
          return out; })()""")
        for v in ('face_front', 'face_q45', 'face_side', 'mouth_front', 'mouth_q45'):
            await pg.evaluate("window.__view(%r)" % v); await pg.wait_for_timeout(1800)
            await pg.screenshot(path=f'{OUT}/glasses_{TAG}{"_bl" if BL else ""}_{v}.png')
        info['errors'] = errs[:6]
        print(json.dumps(info, ensure_ascii=False))
        json.dump(info, open(f'{OUT}/glasses_{TAG}{"_bl" if BL else ""}.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()

asyncio.run(main())
