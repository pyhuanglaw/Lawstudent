"""CC 牆淡出：站在指定的牆邊、鏡頭在牆外往裡看（BB 指定角度用）。Playwright／SwiftShader ≠ iPhone。
每個區域：【前置／捷徑】讀檔到出生點 → 讀導航格算出可走範圍 → 每面牆（L＝左牆 -x、R＝右牆 +x、B＝後牆 -z；「左右」是從門口往裡看）
找離那面牆中點最近、離牆 WIN 公尺內的可走格 →【捷徑】重新讀檔站到那格 → 關對話框 → 鏡頭放到牆外（yaw＝牆的方向，±OFF 度各一張）、距離 DIST。
用法：LW_TESTS=<wt>/tests ZONES=corner_records:LR,wz_print:RB [DIST=4.5] [OFF=30] [TAG=x] python3 cc_wallfade_walls_probe.py <url> <out>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ZONES = [z.split(':') for z in (os.environ.get('ZONES') or 'corner_records:LR,wz_print:RB').split(',') if z]
HOUR = float(os.environ.get('HOUR') or 14); DIST = float(os.environ.get('DIST') or 4.5); OFF = float(os.environ.get('OFF') or 30)
TAG = os.environ.get('TAG') or 'x'; DAY = os.environ.get('DAY') or '2025-10-18'; WIN = float(os.environ.get('WIN') or 1.6)
YAW = {'L': -math.pi / 2, 'R': math.pi / 2, 'B': math.pi}
PICK = """a=>{ const N=GAME.E.nav, w=a[0], win=a[1]; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; const free=[];
  for(let r=0;r<N.rows;r++) for(let c=0;c<N.cols;c++){ if(N.b[N.idx(c,r)]) continue; const [x,z]=N.toWorld(c,r); free.push([x,z]); x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); }
  const cx=(x0+x1)/2, cz=(z0+z1)/2; let best=null, bd=1e9;
  for(const [x,z] of free){ let dw, dm; if(w==='L'){dw=x-x0; dm=Math.abs(z-cz);} else if(w==='R'){dw=x1-x; dm=Math.abs(z-cz);} else {dw=z-z0; dm=Math.abs(x-cx);}
    if(dw>win) continue; const s=dm+dw*0.5; if(s<bd){bd=s; best=[+x.toFixed(2),+z.toFixed(2)];} }
  return {bbox:[x0,x1,z0,z1].map(v=>+v.toFixed(2)), pick:best}; }"""
CLOSE = "(()=>{ const d=document.querySelector('#dlg'); return !!(d && d.offsetParent!==null && getComputedStyle(d).display!=='none'); })()"
R = L.Run('wallwalls_' + TAG, OUT); D.setup(R, OUT)
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 牆外往裡拍：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for zw in ZONES:
            zone, walls = zw[0], (zw[1] if len(zw) > 1 else 'LRB'); tag = '[%s]' % zone
            R.setup('%s 【前置／捷徑】讀檔到 %s %s %s（出生點，先量可走範圍）' % (tag, zone, DAY, HOUR))
            await D.load_zone(pg, cdp, zone, DAY, HOUR, wait=9000)
            for w in walls:
                pk = await pg.evaluate(PICK, [w, WIN]); R.note('%s 牆 %s：%s' % (tag, w, json.dumps(pk)))
                if not pk['pick']: R.check('%s 牆 %s 找得到站的格子' % (tag, w), False, json.dumps(pk)); continue
                x, z = pk['pick']; R.setup('%s 【捷徑】讀檔站到 (%s, %s)' % (tag, x, z))
                await D.load_zone(pg, cdp, zone, DAY, HOUR, x=x, z=z, yaw=0.0, wait=9000)
                for _ in range(12):
                    if not await pg.evaluate(CLOSE): break
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600)
                if os.environ.get('PREJS'):   # 診斷用：例 GAME.E.scene.traverse(o=>{ if(/^WALL_/.test(o.name||'')) o.visible=false; })
                    R.setup('%s 【診斷】PREJS：%s → %s' % (tag, os.environ['PREJS'][:120], await pg.evaluate('(()=>{ ' + os.environ['PREJS'] + ' })()')))
                st = await D.st(pg)
                if not R.check('%s 牆 %s 在 %s' % (tag, w, zone), st['zone'] == zone, json.dumps(st, ensure_ascii=False)[:160]): continue
                for o in (-OFF, 0, OFF):
                    yaw = YAW[w] + math.radians(o)
                    await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; C.distTarget=a[1]; C.dist=a[1]; C.manualT=3; }", [yaw, DIST])
                    await pg.wait_for_timeout(3000)
                    for _ in range(12):   # 進門旁白會晚一點才出來：每張拍之前都再關一次
                        if not await pg.evaluate(CLOSE): break
                        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
                    await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; C.distTarget=a[1]; C.dist=a[1]; C.manualT=3; }", [yaw, DIST]); await pg.wait_for_timeout(1500)
                    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
                    await pg.screenshot(path=os.path.join(OUT, 'ww_%s_%s_%s%+d.png' % (TAG, zone, w, int(o))))
                    await pg.evaluate(D.HUD + '(true)')
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
