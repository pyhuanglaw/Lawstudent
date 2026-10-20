"""BB：X79 影子閃，修正前後比較（SwiftShader 看不到「閃」，改量「時間只走一點點時建築影子變了多少」）。
[前置] 讀存檔、[捷徑] GAME.enter 到 ZONE（預設校園）、玩家放在 POS、所有人物凍結、鏡頭不動。
時間設 h、h+1 分、h+2 分、h+4 分、h+8 分，各截一張；算相鄰兩張的像素差（不算畫面中間玩家那一塊、左上 HUD）。
舊版（每幀跟著太陽、沒對齊）：+1 分就變；新版（每 3 遊戲分鐘才換、對齊整格）：+1、+2 分應該幾乎不變，+4 分以上才變。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageChops
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SPOTS = json.loads(os.environ.get('SPOTS', '[["campus",15.5,[34,-92],0.6],["wenzhou",15.5,[30,0],1.2],["gongguan",15.5,[0,-28],2.0]]'))
async def main():
    run = L.Run('shadow', OUT); out = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(5000)
        for i in range(30):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(500); continue
            break
        for zn, h, pos, yaw in SPOTS:
            await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.G.weather='clear'; if(GAME.E.setWeather) GAME.E.setWeather('clear'); })(%s)" % h)
            await pg.evaluate("void GAME.enter(%s,{x:%s,z:%s,yaw:0})" % (json.dumps(zn), pos[0], pos[1])); run.setup('[捷徑] %s %.1f (%s,%s)' % (zn, h, pos[0], pos[1]))
            await pg.wait_for_timeout(12000)
            await pg.evaluate("(y=>{ const E=GAME.E; for(const n of E.npcs){ n.frozen=true; n.beh='idle'; n.path=null; n.waypoints=null; if(n.isExtra&&n.obj) n.obj.visible=false; } E.cam.yaw=y; window.__bbT=null; })(%s)" % yaw)
            await pg.wait_for_timeout(3000)
            shots = []
            for k, dm in enumerate([0, 1, 2, 4, 8]):
                hh = h + dm / 60
                await pg.evaluate("(h=>{ const G=GAME.G, E=GAME.E; G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); })(%s)" % hh)
                await pg.wait_for_timeout(1800)
                await pg.evaluate("(h=>{ const G=GAME.G, E=GAME.E; G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); })(%s)" % hh)
                await pg.wait_for_timeout(900)
                f = os.path.join(OUT, '%s_%02d_m%d.png' % (zn, int(h), dm)); await pg.screenshot(path=f); shots.append((dm, f))
            diffs = []
            for (d0, f0), (d1, f1) in zip(shots, shots[1:]):
                a = Image.open(f0).convert('L'); bb = Image.open(f1).convert('L'); W, H = a.size
                m = ImageChops.difference(a, bb)
                px = m.load(); n = 0; tot = 0
                for y in range(int(H * 0.28), H, 2):
                    for x in range(0, W, 2):
                        if abs(x - W / 2) < W * 0.08 and abs(y - H * 0.62) < H * 0.25: continue
                        tot += 1
                        if px[x, y] > 12: n += 1
                diffs.append({'from_min': d0, 'to_min': d1, 'changed_pct': round(100 * n / tot, 3)})
            out[zn] = diffs; print('  %s：%s' % (zn, json.dumps(diffs, ensure_ascii=False)), flush=True)
        json.dump(out, open(os.path.join(OUT, 'shadow_diff.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
