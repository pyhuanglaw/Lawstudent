"""CC-B（帳號 B）11-09：外牆腳黑線補光照（#204 後續，BB-B 21:15；LAWWW-B a5ec91a36 只換 11 張光照貼圖）。判定＝BB（D120）。
每個區域：【前置／捷徑】讀檔到 ZONES 的那一區 HOUR（玩家在讀檔的出生點；或 zone@x@z 指定站的點）→ 跟隨鏡頭轉四個方向（yaw 0、90°、180°、270°；鏡頭在玩家的 (sin yaw, cos yaw) 那一側）、距離 DIST
→ 每個方向等 3 秒讓擋住的牆淡出 → 藏 HUD 拍一張。四個方向裡，鏡頭在牆外、那面牆淡出的那幾張就是要看的（牆腳黑線、變太亮或發白、新的接縫）。
用法：LW_TESTS=<wt>/tests ZONES=dorm,wancai,xs_dakou,wz_teahouse [HOUR=14] [DIST=4.5] [TAG=x] python3 cc_wallfade_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ZONES = [z.split('@') for z in (os.environ.get('ZONES') or 'dorm,wancai,xs_dakou,wz_teahouse').split(',') if z]
HOUR = float(os.environ.get('HOUR') or 14); DIST = float(os.environ.get('DIST') or 4.5); TAG = os.environ.get('TAG') or 'x'; DAY = os.environ.get('DAY') or '2025-10-18'
R = L.Run('wallfade_' + TAG, OUT); D.setup(R, OUT)
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 牆淡出拍照：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for zz in ZONES:
            zone = zz[0]; tag = '[%s]' % zone
            if len(zz) >= 3:
                R.setup('%s 【前置／捷徑】讀檔到 %s %s %s，站 (%s, %s)' % (tag, zone, DAY, HOUR, zz[1], zz[2]))
                await D.load_zone(pg, cdp, zone, DAY, HOUR, x=float(zz[1]), z=float(zz[2]), yaw=0.0, wait=9000)
            else:
                R.setup('%s 【前置／捷徑】讀檔到 %s %s %s（出生點）' % (tag, zone, DAY, HOUR))
                await D.load_zone(pg, cdp, zone, DAY, HOUR, wait=9000)
            st = await D.st(pg); R.check('%s 在 %s' % (tag, zone), st['zone'] == zone, json.dumps(st, ensure_ascii=False)[:200])
            if st['zone'] != zone: continue
            for k, yaw in enumerate([0.0, 1.5708, 3.1416, -1.5708]):
                await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; C.distTarget=a[1]; C.dist=a[1]; C.manualT=3; }", [yaw, DIST])
                await pg.wait_for_timeout(3000)
                await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
                await pg.screenshot(path=os.path.join(OUT, 'wf_%s_%s_%d.png' % (TAG, zone, k * 90)))
                await pg.evaluate(D.HUD + '(true)')
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
