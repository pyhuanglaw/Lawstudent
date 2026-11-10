"""CC（帳號 A）11-10：X199 溫州街只從新生南路進出（WZ-ENTRY-XINSHENG-1103；LAWWW 14:21 ①、BB 14:23）。新版 99294fead，改前 e9af13061。
BB：原本的公館入口要真的走不過去、看得出為什麼不能走（不是隱形牆，D36）；實際走一次：從新生南路進溫州街、再走出來。
做法（像玩家：點地面走路、手指按互動鍵；【前置／捷徑】只有讀檔到起點）：
  A 公館巷口：讀檔到 gongguan (−71, 14) 14:00 → 鏡頭朝巷口截圖 → 點地面往巷子裡 (−71, 27) 走 40 秒 → 記走到哪裡、有沒有被擋在 z ≤ 19.5、有沒有換區域；巷口前截一張近的（看盆栽）。
     公館所有互動點裡有沒有通溫州街的出口（exit.to＝wenzhou）。
  B 新生南路 → 溫州街 → 新生南路：讀檔到 xinsheng 出生點 → 找 exit.to＝wenzhou 的互動點、走過去、按 → 到溫州街；
     列溫州街所有出口（exit.to）：要只有往新生南路（沒有 gongguan）→ 走到往新生南路的出口、按 → 回到新生南路。每一步截圖。
Playwright 手機模擬（844×390）≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_wz_entry_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
R = L.Run('wz_entry_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
UI = """(()=>{ const ib=document.getElementById('interact'); const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none');
  const P=GAME.E.player.obj.position; return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), fb:GAME.walkFallbacks|0, interact:vis(ib)?(ib.innerText||'').trim():''}; })()"""
EXITS = "(()=>(GAME.E.interactables||[]).filter(i=>i.exit).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,to:i.exit.to})))()"


async def shot(pg, name):
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, 'wzentry_%s_%s.png' % (TAG, name))); await pg.evaluate(D.HUD + '(true)')


async def look(pg, x, y, z, lx, ly, lz):
    await pg.evaluate("(a=>{ GAME.E.cinematic(new THREE.Vector3(a[0],a[1],a[2]),new THREE.Vector3(a[3],a[4],a[5])); })", [x, y, z, lx, ly, lz]); await pg.wait_for_timeout(1500)


async def unlook(pg):
    await pg.evaluate("(()=>{ if(GAME.E.endCinematic) GAME.E.endCinematic(); })()"); await pg.wait_for_timeout(1200)


async def use_exit(pg, cdp, tag, ex):
    ok = await L.go_to(pg, cdp, R, ex['x'], ex['z'], 0.8, '%s 走到「%s」(%s, %s)' % (tag, ex['label'], ex['x'], ex['z']), max_s=240, lv=ex['lv'])
    u = await pg.evaluate(UI)
    for _ in range(8):
        if u['interact']: break
        await pg.wait_for_timeout(500); u = await pg.evaluate(UI)
    R.check('%s 走到出口、按鈕是「%s」（walkFallbacks 沒加）' % (tag, ex['label']), bool(ok) and ex['label'] in (u['interact'] or ''), J(u))
    z0 = u['zone']
    await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(500); u = await pg.evaluate(UI)
        if u['zone'] != z0: break
    await pg.wait_for_timeout(3000); u = await pg.evaluate(UI)
    return u


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X199 溫州街入口：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        # A 公館巷口
        R.setup('【前置／捷徑】讀檔到 gongguan (−71, 14) 2025-10-18 14:00')
        await D.load_zone(pg, cdp, 'gongguan', '2025-10-18', 14.0, x=-71, z=14, yaw=0.0, wait=9000)
        ex = await pg.evaluate(EXITS); R.note('公館的出口：%s' % J(ex))
        R.check('公館沒有通溫州街的出口（exit.to＝wenzhou）', not [e for e in ex if e['to'] == 'wenzhou'], J(ex))
        await look(pg, -71, 3.0, 11, -71, 1.2, 22); await shot(pg, 'A1_lane_far'); await unlook(pg)
        u0 = await pg.evaluate(UI)
        ok = await L.go_to(pg, cdp, R, -71, 27, 0.6, '[A] 點地面往巷子裡 (−71, 27) 走', max_s=40)
        await pg.wait_for_timeout(1000); u = await pg.evaluate(UI)
        R.note('[A] 往巷子走以後：%s' % J(u))
        R.check('[A] 走不進巷子（z ≤ 19.5、還在公館）', u['zone'] == 'gongguan' and u['z'] <= 19.5, J(u))
        await look(pg, u['x'] + 1.2, 1.7, u['z'] - 2.2, -71, 0.7, 20.5); await shot(pg, 'A2_lane_near'); await unlook(pg)
        # B 新生南路 → 溫州街 → 新生南路
        R.setup('【前置／捷徑】讀檔到 xinsheng 出生點 2025-10-18 14:00')
        await D.load_zone(pg, cdp, 'xinsheng', '2025-10-18', 14.0, wait=9000)
        ex = await pg.evaluate(EXITS); R.note('新生南路的出口：%s' % J(ex))
        tw = [e for e in ex if e['to'] == 'wenzhou']
        if not R.check('新生南路有往溫州街的出口', bool(tw), J(ex)): await b.close(); return
        u = await use_exit(pg, cdp, '[B1 新生南路→溫州街]', tw[0]); await shot(pg, 'B1_in_wenzhou')
        R.check('[B1] 進了溫州街', u['zone'] == 'wenzhou', J(u))
        ex = await pg.evaluate(EXITS); R.note('溫州街的出口：%s' % J(ex))
        R.check('溫州街的出口只有往新生南路（沒有往公館）', bool(ex) and all(e['to'] != 'gongguan' for e in ex) and any(e['to'] == 'xinsheng' for e in ex), J(ex))
        bk = [e for e in ex if e['to'] == 'xinsheng']
        if bk:
            u = await use_exit(pg, cdp, '[B2 溫州街→新生南路]', bk[0]); await shot(pg, 'B2_back_xinsheng')
            R.check('[B2] 回到新生南路', u['zone'] == 'xinsheng', J(u))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
