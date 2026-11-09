"""CC-B（帳號 B）11-09：美國公寓門板拆節點（#204，BB-B 18:49，D120）。判定＝BB。
每個機位：【前置／捷徑】讀檔把玩家放在 (px,pz)（us_apartment，HOUR）→ 跟隨鏡頭 yaw／距離（E.cam.yaw、distTarget；鏡頭在玩家的 (sin yaw, cos yaw) 那一側）
→ 等 3 秒（牆淡出照遊戲自己的規則）→ 藏 HUD 拍一張（玩家照樣在畫面裡）；記哪些牆在淡出（zone 的 fade 群組 visible／opacity）。
VIEWS＝name:px:pz:yaw:dist（逗號分）；預設：closet＝玩家在臥室衣物間門口、鏡頭在北邊臥室牆外；bath＝玩家在衛浴門口、鏡頭在南邊外牆外；normal＝玩家在臥室門口的一般鏡頭。
用法：LW_TESTS=<wt>/tests [HOURS=14,21] [TAG=x] python3 cc_usapt_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
VIEWS = [v.split(':') for v in (os.environ.get('VIEWS') or 'closet:2.0:0.3:3.1416:5,bath:4.2:2.2:0:4,normal:2.4:-0.6:-1.5708:4').split(',') if v]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,21').split(',')]; TAG = os.environ.get('TAG') or 'x'
R = L.Run('usapt_' + TAG, OUT); D.setup(R, OUT)
FADE = """(()=>{ const z=GAME.E.zone, out=[]; if(!z||!z.group) return out; z.group.traverse(o=>{ if(o.isMesh&&/wall|WALL|door|DOOR|Door/.test(o.name||'')){ const m=[].concat(o.material)[0]; out.push({n:o.name, vis:o.visible, op:m&&m.opacity!=null?+m.opacity.toFixed(2):null}); } }); return out.filter(q=>!q.vis||(q.op!=null&&q.op<0.99)).slice(0,30); })()"""
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 美國公寓門板：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for h in HOURS:
            for name, px, pz, yaw, dist in VIEWS:
                tag = '[%s %s]' % (name, h)
                R.setup('%s 【前置／捷徑】讀檔把玩家放在 us_apartment (%s, %s)、%s 點' % (tag, px, pz, h))
                await D.load_zone(pg, cdp, 'us_apartment', '2025-10-18', h, x=float(px), z=float(pz), yaw=float(yaw), wait=9000)
                await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; C.distTarget=a[1]; C.dist=a[1]; C.manualT=3; }", [float(yaw), float(dist)])
                await pg.wait_for_timeout(3000)
                f = await pg.evaluate(FADE); R.note('%s 淡出中的牆／門：%s' % (tag, json.dumps(f, ensure_ascii=False)))
                await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
                await pg.screenshot(path=os.path.join(OUT, 'usapt_%s_%s_%02d.png' % (TAG, name, int(h))))
                await pg.evaluate(D.HUD + '(true)')
                st = await D.st(pg); R.check('%s 在 us_apartment' % tag, st['zone'] == 'us_apartment', json.dumps(st, ensure_ascii=False)[:200])
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
