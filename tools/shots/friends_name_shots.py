#!/usr/bin/env python3
"""AA_637 第 3 節名字卡截圖（直向、橫向各一張）→ shots/friends_name_1103/。
[前置／捷徑] 讀檔（GAME.applySave）放到大一上第 9 週週四 22:30 的 203（F2-01 阿凱「交了」那個時段），條件事件照常：
阿哲第一句「阿凱？」＝阿哲第一次在對話框說話，上方淡入名字卡。Playwright 的 iPhone 模擬（SwiftShader）≠ iPhone 實機。
用法：python3 tools/shots/friends_name_shots.py http://127.0.0.1:8765/index.html?turbo"""
import asyncio, os, sys, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html?turbo'
OUT = os.path.join(ROOT, 'shots', 'friends_name_1103'); os.makedirs(OUT, exist_ok=True)
async def one(p, landscape):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(L.law_url(URL)); ok = await L.wait_loaded(pg)
    day = await pg.evaluate("FRIENDS2.slotDay('F2_01')")
    st = {'day': day, 'weekday': 4, 'hour': 22.5, 'zone': 'dorm', 'stage': 'law',
          'flags': {'MAIN_D1': True, 'KAI_MOVEIN': True, 'MET_KAI': True, 'YT_JOB_V': 1, 'NAMECARD_V': 1}}
    print('[前置／捷徑] 讀檔到第 9 週週四 22:30 的 203（day', day, '）')
    await L.load_state(pg, st, quiet_phone=True)
    got = None
    for i in range(240):
        t = await pg.evaluate("(()=>{ const e=document.getElementById('nameCard'); return e&&e.classList.contains('nc-in')?e.textContent:null; })()")
        if t: got = t; break
        if await pg.evaluate("!document.getElementById('dlg').classList.contains('hide')"): await pg.click('#dlg')   # 點對話框往下（旁白 → 阿哲「阿凱？」）
        await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(650)   # 淡入 0.6 秒
    name = 'landscape' if landscape else 'portrait'
    f = os.path.join(OUT, f'namecard_{name}.png'); await pg.screenshot(path=f)
    box = await pg.evaluate("(()=>{ const r=e=>{ const x=e&&e.getBoundingClientRect(); return x?[x.left,x.top,x.right,x.bottom]:null; }; return {card:r(document.getElementById('nameCard')),dlg:r(document.getElementById('dlg')),cap:r(document.getElementById('caption')),toast:r(document.getElementById('toast')),btns:[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(r)}; })()")
    def hit(a, c): return a and c and not (a[2] <= c[0] or c[2] <= a[0] or a[3] <= c[1] or c[3] <= a[1])
    over = [x for x in [box['dlg'], box['cap'], box['toast']] + box['btns'] if hit(box['card'], x) and x[2] - x[0] > 0]
    dbg = await pg.evaluate("(()=>{ const e=document.getElementById('nameCard'); const r=e.getBoundingClientRect(); const t=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2); return [getComputedStyle(e).opacity, getComputedStyle(e).zIndex, t&&(t.id||t.className||t.tagName), e.parentElement.id, Math.round(r.top)]; })()")
    print('debug', dbg)
    print(name, '名字卡：', got, '截圖', f, '蓋到對話框／字幕／按鈕：', len(over), over[:3], 'JS 錯誤', errs[:3])
    await b.close(); return bool(got) and not over
async def main():
    async with async_playwright() as p:
        a = await one(p, False); c = await one(p, True)
    print('ALL PASS' if a and c else 'FAILED'); sys.exit(0 if a and c else 1)
asyncio.run(main())
