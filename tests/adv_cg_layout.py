"""Event CG 的版面（BB 2026-10-14 同意）：手機直向時整張 CG 縮小放進畫面（contain），人物不會被裁，上下用同一張 CG 的模糊放大版填滿；橫向照舊 cover。
[前置／捷徑] 現在還沒有正式 CG 檔（CG-1 第二版等使用者重傳）：測試用畫布畫一張 16:9 的圖（左右兩邊各一條白邊，裁掉就看不到），登錄成暫時的 CG 再演出。
檢查（直向 390×844、橫向 844×390 各一次）：
  1. 直向：CG 那一層是 contain、模糊層有 blur；圖只占畫面中間一條（上下是模糊填滿）。截圖存檔（cg_portrait），左右兩條白邊要看得到＝沒有被裁（人工看）。
  2. 橫向：cover（畫面填滿）。
  3. ADV 結束後 CG 那一層清掉，下一次一般 ADV 不會殘留。
用法：python3 tests/adv_cg_layout.py URL [輸出資料夾]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/adv_cg_layout'

MAKE = """(()=>{ const c=document.createElement('canvas'); c.width=1600; c.height=900; const g=c.getContext('2d'); g.fillStyle='#2f6a52'; g.fillRect(0,0,1600,900);
  g.fillStyle='#ffffff'; g.fillRect(0,0,60,900); g.fillRect(1540,0,60,900); g.fillStyle='#d23'; g.fillRect(760,300,80,300);
  CG_REGISTRY.__test_cg={file:c.toDataURL('image/png'),title:'測試'}; ADV.begin({background:'blur'}); return ADV.cg('__test_cg'); })()"""
STYLE = """(()=>{ const r=document.getElementById('adv'), a=document.getElementById('advCg'), b=document.getElementById('advBg'); if(!a) return null; const cs=getComputedStyle(a), bs=getComputedStyle(b);
  return {cls:r.className, disp:cs.display, size:cs.backgroundSize, img:!!a.style.backgroundImage, blur:bs.filter, w:innerWidth, h:innerHeight}; })()"""


async def main():
    run = L.Run('adv_cg_layout', OUT)
    async with async_playwright() as p:
        for land in (False, True):
            tag = '橫向' if land else '直向'
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
            await pg.goto(URL)
            run.check(tag + '：遊戲載入', await L.wait_loaded(pg))
            run.setup(tag + '：登錄一張測試用的 16:9 CG（左右各一條白邊）並演出')
            ok = await pg.evaluate(MAKE)
            await pg.wait_for_timeout(1500)
            st = await pg.evaluate(STYLE)
            run.check(tag + '：進入 CG（root 有 cg、CG 那一層顯示、有圖）', bool(ok) and st and 'cg' in st['cls'] and st['disp'] == 'block' and st['img'], json.dumps(st, ensure_ascii=False))
            if not land:
                run.check('直向：CG 那一層是 contain（整張放進畫面）、模糊層有 blur', st and st['size'] == 'contain' and 'blur' in (st['blur'] or ''), json.dumps(st, ensure_ascii=False))
                # 截圖量白邊：contain 的圖寬＝畫面寬，左右兩條白邊各約 60/1600 的寬度
                await run.shot(pg, 'cg_portrait')
                edge = await pg.evaluate("""(()=>{ const a=document.getElementById('advCg').getBoundingClientRect(); const ih=innerWidth*9/16, top=a.top+(a.height-ih)*0.4; return {top, bottom:top+ih}; })()""")
                run.note('直向 CG 的位置（依 contain＋40%）：' + json.dumps(edge))
                run.check('直向：CG 的上下有模糊填滿（圖只占畫面中間一條，上下不是黑色空白）', edge['top'] > 40 and edge['bottom'] < st['h'] - 40, json.dumps(edge))
            else:
                run.check('橫向：CG 那一層是 cover（畫面填滿）', st and st['size'] == 'cover', json.dumps(st, ensure_ascii=False))
                await run.shot(pg, 'cg_landscape')
            await pg.evaluate("ADV.end()"); await pg.wait_for_timeout(800)
            await pg.evaluate("ADV.begin({background:'blur'})"); await pg.wait_for_timeout(500)
            st2 = await pg.evaluate(STYLE)
            run.check(tag + '：ADV 結束後 CG 清掉，下一次一般 ADV 沒有殘留', st2 and 'cg' not in st2['cls'] and st2['disp'] == 'none' and not st2['img'], json.dumps(st2, ensure_ascii=False))
            await pg.evaluate("ADV.end()")
            run.check(tag + '：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
            await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
