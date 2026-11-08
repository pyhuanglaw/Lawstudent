"""CC-B（帳號 B）11-08：movreg A6「斜推沿牆滑動」重現（BB-B 11:12：兩個環境都錯，要查；判定＝BB）。
照 tests/movement_regression.py 的 Rig（讀檔、搖桿）和 A1～A5 的推法走到前牆，然後：
 (a) 斜推沿牆：照 A6 的方向（A5 停在 x<-0.3 推右前，否則左前；搖桿 (±45,-45)），用「遊戲時間」量——包住 GAME.E.update 累加 dt，推滿 2.0 秒遊戲時間；
     記沿牆（x）位移、垂直牆（z）位移、真實秒數、幀數。推之前、推完各拍一張。
 (b) 同一個搖桿向量在空地正著走 2.0 秒遊戲時間：【前置／捷徑】讀檔到椰影大道 (-40,-5)（Rig.load，同 movreg D 的位置），量走的距離。推之前、推完各拍一張。
 算 (a) 沿牆距離 ÷ (b) 距離（預期約 0.7）。另外也照原本 A6 的 1500 ms 真實時間推一次，對照。
用法：LW_TESTS=<wt>/tests [RUNS=1] python3 cc_a6_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
T = os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests')
sys.path.insert(0, T)
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
os.makedirs(OUT, exist_ok=True)
RUNS = int(os.environ.get('RUNS') or 1)
src = open(os.path.join(T, 'movement_regression.py'), encoding='utf-8').read()
ns = {}
exec(src[:src.index('results=[]')], ns)                                    # FLAGS、state()
exec(src[src.index('class Rig:'):src.index('async def test_A')], ns)        # Rig（load、pos、joy、forward、best、drive、use…）
J = lambda o: json.dumps(o, ensure_ascii=False)
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('   ' + info if info else ''), flush=True)
    if not ok: fails.append(name)

GT = "(()=>{ if(!window.__gtw){ window.__gtw=1; window.__gt=0; window.__gf=0; const o=GAME.E.update; GAME.E.update=function(dt){ window.__gt+=dt; window.__gf++; return o.apply(this,arguments); }; } return [window.__gt, window.__gf]; })()"


async def push_game(rig, dx, dy, gsec):
    """搖桿推住，直到遊戲時間（E.update 的 dt 累加）多 gsec 秒"""
    pg, cdp = rig.pg, rig.cdp
    g0, f0 = await pg.evaluate(GT); t0 = time.time()
    jx, jy = await pg.evaluate("(()=>{ const r=document.getElementById('joy').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    while True:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]}); await pg.wait_for_timeout(60)
        g, f = await pg.evaluate("[window.__gt, window.__gf]")
        if g - g0 >= gsec or time.time() - t0 > 120: break
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await pg.wait_for_timeout(150)
    g, f = await pg.evaluate("[window.__gt, window.__gf]")
    return {'game_s': round(g - g0, 3), 'frames': f - f0, 'real_s': round(time.time() - t0, 2), 'fps': round((f - f0) / max(0.01, time.time() - t0), 1)}


async def one(p, k, rec):
    tag = '[第 %d 次]' % k
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)   # 橫向：playlib 的直向會出「請轉橫向」蓋住搖桿（movreg 自己的 context 不會）；搖桿照鏡頭方向，量的東西一樣
    try:
        await pg.goto(URL)
        if not await L.wait_loaded(pg): check('%s 遊戲載入' % tag, False); return
        rig = ns['Rig'](pg, cdp); st = ns['state']
        await rig.load(st('dorm', {'x': 0, 'z': 2.8, 'yaw': 3.1416}))
        await pg.evaluate("STORY.phoneAuto=()=>{}")   # 【前置】同 aa363f62 的 Rig.load（讀檔不自動打開手機）
        await pg.evaluate(GT)
        print('  [前置] %s 照 movreg A1～A5 走到前牆' % tag, flush=True)
        await rig.forward(2600); await rig.joy(-60, 0, 700); await rig.joy(0, 40, 900); await rig.joy(0, 60, 900); await rig.joy(0, -60, 3200)
        f = await rig.pos(); sx = 45 if f['x'] < -0.3 else -45
        cam = await pg.evaluate("({camYaw:+GAME.E.cam.yaw.toFixed(3), fps:null})")
        print('  %s A5 停在 %s；鏡頭 %s；推的方向 %s' % (tag, J(f), J(cam), '右前' if sx > 0 else '左前'), flush=True)
        await pg.screenshot(path=os.path.join(OUT, 'a6_%d_a_before.png' % k))
        m = await push_game(rig, sx, -45, 2.0); g = await rig.pos()
        await pg.screenshot(path=os.path.join(OUT, 'a6_%d_a_after.png' % k))
        along, perp = abs(g['x'] - f['x']), abs(g['z'] - f['z'])
        print('  %s (a) 斜推沿牆 2.0 秒遊戲時間：%s → %s；沿牆 %.2f m、垂直 %.2f m；%s' % (tag, J(f), J(g), along, perp, J(m)), flush=True)
        # 原本 A6：真實 1500 ms（對照；從 (a) 結束的位置往回推一次再照原法推）
        await rig.joy(-sx, 45, 900); f2 = await rig.pos(); m0 = await pg.evaluate(GT)
        await rig.joy(sx, -45, 1500); g2 = await rig.pos(); m1 = await pg.evaluate(GT)
        print('  %s 原本 A6 推法（真實 1500 ms）：%s → %s；x 變 %.2f m；遊戲時間 %.3f 秒、%d 幀' % (tag, J(f2), J(g2), abs(g2['x'] - f2['x']), m1[0] - m0[0], m1[1] - m0[1]), flush=True)
        # (b) 空地
        print('  [前置／捷徑] %s 讀檔到椰影大道 (-40,-5)（Rig.load）' % tag, flush=True)
        await rig.load(st('campus', {'x': -40, 'z': -5, 'yaw': -1.5708}))
        await pg.evaluate("STORY.phoneAuto=()=>{}"); await pg.wait_for_timeout(2500)
        await pg.evaluate(GT)
        o = await rig.pos(); await pg.screenshot(path=os.path.join(OUT, 'a6_%d_b_before.png' % k))
        mb = await push_game(rig, sx, -45, 2.0); o2 = await rig.pos()
        await pg.screenshot(path=os.path.join(OUT, 'a6_%d_b_after.png' % k))
        free = math.hypot(o2['x'] - o['x'], o2['z'] - o['z'])
        print('  %s (b) 空地同一個搖桿 2.0 秒遊戲時間：%s → %s；走了 %.2f m；%s' % (tag, J(o), J(o2), free, J(mb)), flush=True)
        ratio = along / free if free > 0.05 else None
        print('  %s 沿牆 ÷ 空地 ＝ %s（預期約 0.7；≥0.5＝滑得正常）' % (tag, 'n/a' if ratio is None else '%.2f' % ratio), flush=True)
        check('%s (a)(b) 都推滿 2.0 秒遊戲時間' % tag, m['game_s'] >= 1.95 and mb['game_s'] >= 1.95, J([m, mb]))
        check('%s 沿牆 ÷ 空地 ≥ 0.5' % tag, ratio is not None and ratio >= 0.5, '%s（沿牆 %.2f／空地 %.2f）' % (ratio, along, free))
        check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3]))
        rec.append({'k': k, 'a5': f, 'dir': sx, 'a': {'from': f, 'to': g, 'along': along, 'perp': perp, **m}, 'orig': {'from': f2, 'to': g2, 'dx': abs(g2['x'] - f2['x']), 'game_s': m1[0] - m0[0], 'frames': m1[1] - m0[1]}, 'b': {'from': o, 'to': o2, 'dist': free, **mb}, 'ratio': ratio})
    except Exception as ex: check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
    finally: await b.close()


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(T, '..')).read().strip()
    print('CC A6 斜推沿牆重現：worktree %s；RUNS=%d；Playwright ≠ iPhone' % (real or '?', RUNS), flush=True)
    rec = []
    async with async_playwright() as p:
        for k in range(1, RUNS + 1): await one(p, k, rec)
    json.dump(rec, open(os.path.join(OUT, 'a6.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not fails else 'FAILED %d: %s' % (len(fails), '；'.join(fails)), flush=True)

asyncio.run(main())
