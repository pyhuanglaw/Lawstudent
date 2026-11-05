"""CC-C（帳號 C）11-05：XSPHOTO（BB-C 05:39 第 3 點、LAWWW2-C 05:52）——新生南路一整條給使用者看的照片：
  南洋、山嵐、大口、大步、好拍、運動廣場，每一間「店門口一張、店裡一張」，白天 14:00、晚上 20:30 各一組（好拍 21:00 打烊、晚上那組照 20:30）。不判，只算黑畫面。
  店門口：讀檔新生南路、站在店門外的騎樓（店門互動點往馬路 3 m），鏡頭照遊戲自己的跟隨鏡頭、轉成面向店門；店裡：讀檔進店（出生點），遊戲自己的鏡頭。1280×720、藏 HUD。
用法：LW_TESTS=<wt>/tests [SHOPS=nanyang,shanlan,dakou,dabu,haopai,xsports] python3 cc_xs_photos_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
SHOPS = [x for x in (os.environ.get('SHOPS') or 'nanyang,shanlan,dakou,dabu,haopai,xsports').split(',') if x]
ZONE = {'nanyang': 'xs_nanyang', 'shanlan': 'xs_shanlan', 'dakou': 'xs_dakou', 'dabu': 'xs_dabu', 'haopai': 'xs_haopai', 'xsports': 'xs_xsports'}
R = L.Run('xs_photos', OUT); D.setup(R, OUT)
DAY = '2025-10-15'


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC XSPHOTO（新生南路六間店：店門口＋店裡，白天＋晚上）：SHA=%s（worktree 實際 %s）' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()"); await pg.set_viewport_size({'width': 1280, 'height': 720})
        for h, hn in ((14.0, 'day'), (20.5, 'night')):
            await D.load_zone(pg, cdp, 'xinsheng', DAY, h, -13.9, 0.0, math.pi / 2, wait=8000)
            doors = await pg.evaluate("(Z=>{ const o={}; for(const [k,z] of Object.entries(Z)){ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to===z); if(i) o[k]=[+i.x.toFixed(2),+i.z.toFixed(2)]; } return o; })", ZONE)
            R.note('[%s] 新生南路的店門：%s' % (hn, J(doors)))
            for k in SHOPS:
                zn = ZONE[k]
                if k not in doors: R.note('[%s %s] 新生南路上沒有店門：不拍' % (hn, k)); continue
                dx, dz = doors[k]
                await D.load_zone(pg, cdp, 'xinsheng', DAY, h, dx + 3.0, dz, -math.pi / 2, wait=6000)
                await pg.evaluate("(()=>{ GAME.E.cam.yaw=Math.PI/2; })()"); await pg.wait_for_timeout(1500)   # 鏡頭在人的 +x（馬路）那一側，往店門看
                await pg.evaluate(D.HUD + '(false)'); await D.shot(pg, '%s_door_%s' % (k, hn)); await pg.evaluate(D.HUD + '(true)')
                s = await D.load_zone(pg, cdp, zn, DAY, h, wait=9000)
                if s['zone'] != zn: R.note('[%s %s] 讀不進 %s（%s）' % (hn, k, zn, s['zone'])); continue
                await pg.wait_for_timeout(1500)
                await pg.evaluate(D.HUD + '(false)'); await D.shot(pg, '%s_inside_%s' % (k, hn)); await pg.evaluate(D.HUD + '(true)')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
