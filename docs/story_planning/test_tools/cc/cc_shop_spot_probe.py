"""CC 店裡某一區：走得到、互動鍵、按下去（11-10 BB 08:47 X276 山嵐文具區；通用：ZONE／TARGET／LABEL 換就能用在別的店）。
【前置／捷徑】load_zone 讀檔到 ZONE 的出生點（門口）、DAY、HOUR；條件事件關掉（只看店裡的互動）。
之後真的玩：① 門口站著、鏡頭轉向目標那一區（直接擺 yaw，只為截圖）截一張 ② L.go_to 點地面／搖桿走到 TARGET（walkFallbacks 不能加）③ 互動鍵含 LABEL ④ 按下去 4 秒內出現選單／對話 ⑤ 鏡頭轉向那一區近拍（距離 NEARDIST）。
Playwright／SwiftShader ≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=old|new ZONE=xs_shanlan TARGET=4.5,6.5 LABEL=看文具 python3 cc_shop_spot_probe.py <url> <out>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; ZONE = os.environ.get('ZONE') or 'xs_shanlan'; DAY = os.environ.get('DAY') or '2025-10-18'; HOUR = float(os.environ.get('HOUR') or 14)
TX, TZ = [float(v) for v in (os.environ.get('TARGET') or '4.5,6.5').split(',')]; LV = int(os.environ.get('LV') or 0)
LABEL = os.environ.get('LABEL') or '看文具'; LOOK = [float(v) for v in (os.environ.get('LOOK') or '6.8,6.35').split(',')]; NEARDIST = float(os.environ.get('NEARDIST') or 2.6)
START = [float(v) for v in os.environ['START'].split(',')] if os.environ.get('START') else None   # 起點（不給＝出生點）；例：花攤從騎樓 -47,20.5 走過去
EXPECT = os.environ.get('EXPECT') or ''   # menu＝要有 WANT 裡的選項（營業中）；nomenu＝不能有（打烊）；空＝只要有選單或對話
WANT = [w for w in (os.environ.get('WANT') or '').split('/') if w]
R = L.Run('shop_spot_%s_%s' % (ZONE, TAG), OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
UI = """(()=>{ const ib=document.getElementById('interact'), d=document.getElementById('dlg'), cp=document.getElementById('caption'); const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
  const P=GAME.E.player.obj.position; const ch=[...document.querySelectorAll('#choices button,.choice,#menu button,.menu button,.shopMenu button')].filter(vis).map(e=>(e.innerText||'').trim()).slice(0,12);
  return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), lv:GAME.E.player.lv|0, fb:GAME.walkFallbacks|0, interact:vis(ib)?(ib.innerText||'').trim():'', dlg:vis(d)&&GAME.D&&GAME.D.active?(d.innerText||'').replace('▼ 點一下繼續','').trim().slice(0,160):'', cap:cp&&vis(cp)&&!cp.classList.contains('hide')&&+getComputedStyle(cp).opacity>0.05?(cp.innerText||'').trim().slice(0,160):'', choices:ch}; })()"""
ITS = "((lb)=>(GAME.E.interactables||[]).filter(i=>(i.label||'').indexOf(lb)>=0).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,r:i.radius||null})))"


async def look_at(pg, x, z, dist=None):
    u = await pg.evaluate(UI); yaw = math.atan2(u['x'] - x, u['z'] - z)
    await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; if(a[1]){ C.distTarget=a[1]; C.dist=a[1]; } C.manualT=8; }", [yaw, dist]); await pg.wait_for_timeout(2500)
    return yaw


async def shot(pg, name):
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, 'spot_%s_%s_%s.png' % (ZONE, TAG, name))); await pg.evaluate(D.HUD + '(true)')


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 店裡定點：worktree %s；%s %s → (%s, %s)「%s」；Playwright ≠ iPhone' % (real or '?', ZONE, TAG, TX, TZ, LABEL), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 %s %s %.1f 時（出生點＝門口），條件事件關掉' % (ZONE, DAY, HOUR))
        if START:
            R.setup('【前置／捷徑】起點改成 (%s, %s)' % (START[0], START[1])); await D.load_zone(pg, cdp, ZONE, DAY, HOUR, x=START[0], z=START[1], yaw=0.0, wait=9000)
        else: await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=9000)
        u = await pg.evaluate(UI); R.note('出生點：%s' % J(u)); R.note('含「%s」的互動點：%s' % (LABEL, J(await pg.evaluate(ITS + '(%s)' % J(LABEL)))))
        if not R.check('在 %s' % ZONE, u['zone'] == ZONE, J(u)): await b.close(); return
        y = await look_at(pg, LOOK[0], LOOK[1]); R.note('門口看向 (%s, %s)：鏡頭直接擺 yaw %.2f（只為截圖）' % (LOOK[0], LOOK[1], y)); await shot(pg, '1_from_door')
        fb0 = u['fb']; ok = await L.go_to(pg, cdp, R, TX, TZ, 0.5, '走到 (%s, %s)' % (TX, TZ), max_s=180, lv=LV)
        await pg.wait_for_timeout(1500); u = await pg.evaluate(UI)
        R.check('真的走到 (%s, %s)（0.5 m 內、walkFallbacks 沒加）' % (TX, TZ), bool(ok) and u['fb'] == fb0, J(u))
        R.check('互動鍵是「%s」' % LABEL, LABEL in u['interact'], J(u))
        y = await look_at(pg, LOOK[0], LOOK[1], NEARDIST); await shot(pg, '2_near')
        if u['interact']:
            await L.tap(pg, cdp, '#interact'); got = None
            for _ in range(8):
                await pg.wait_for_timeout(500); v = await pg.evaluate(UI)
                if v['dlg'] or v['choices'] or v['cap']: got = v; break
            await pg.screenshot(path=os.path.join(OUT, 'spot_%s_%s_3_tap.png' % (ZONE, TAG)))
            R.check('按下去 4 秒內出現選單、對話或字幕', bool(got), J(got or v))
            R.note('按下去：%s' % J(got or v))
            chs = (got or v)['choices']; has = [w for w in WANT if any(w in c for c in chs)]
            if EXPECT == 'menu': R.check('%.2f 時（營業中）有買的清單 %s' % (HOUR, J(WANT)), len(has) == len(WANT) and len(WANT) > 0, J(chs))
            if EXPECT == 'nomenu': R.check('%.2f 時（沒開）沒有買的清單 %s' % (HOUR, J(WANT)), not has, J({'choices': chs, 'cap': (got or v)['cap'], 'dlg': (got or v)['dlg']}))
        else:
            R.check('按下去 4 秒內出現選單或對話', False, '沒有互動鍵可以按')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
