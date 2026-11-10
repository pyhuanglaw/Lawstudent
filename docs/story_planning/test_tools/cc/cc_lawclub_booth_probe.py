"""CC X294 法服攤位搬到法學院廣場（LAWCLUB-BOOTH-MOVE-1110；LAWWW 9202e2fab，改前 dcc9276f8）——BB 08:28：截圖＋「真的走得到」。
【前置／捷徑】讀使用者存檔（FIX，預設遊戲 repo tests/fixtures/user_save_day51b_1110.json），時間改 14:00（白天）、校園、站在小椰林道上（START，預設在 (30,−70)～(30,−82) 之間挑第一個站得住的點）；條件事件照開（要看按下去會不會開始說話）。
真實玩家操作（沒有 turbo、沒有瞬移）：L.go_to 點地面／搖桿走到攤位互動點 (34.5,−89.2) 附近 → 互動鍵的字 → 按 #interact → 3 秒內對話框（或公告面板）有沒有出來、內容是什麼。
截圖：①小椰林道起點往攤位看（遊戲鏡頭直接擺：玩家後方、看向攤位）②走到攤位前 ③按下去之後。
判斷：改後＝互動鍵是「…法律服務社的招生攤位…」、按下去有對話／公告；改前＝那裡沒有攤位（互動鍵不是攤位）＝預期 FAIL。Playwright／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=old|new python3 cc_lawclub_booth_probe.py <url> <out>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'; TAG = os.environ.get('TAG') or 'x'
HOUR = float(os.environ.get('HOUR') or 14); BOOTH = (34.5, -90.2); IT = (34.5, -89.2)
STARTS = [tuple(float(a) for a in s.split(',')) for s in (os.environ.get('START') or '30,-70;30,-72;30,-75;31,-75;30,-78;30,-82').split(';')]
R = L.Run('lawclub_booth_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>/法律服務社|lawclub/.test((i.label||'')+(i.notice||''))).map(i=>({label:i.label,notice:i.notice||null,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||null})))()"
UI = """(()=>{ const ib=document.getElementById('interact'), d=document.getElementById('dlg'); const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
  const P=GAME.E.player.obj.position; const panels=[...document.querySelectorAll('[id*=notice],[class*=notice],#board,#panel,.panel')].filter(vis).map(e=>(e.id||e.className)+':'+(e.innerText||'').trim().slice(0,80));
  return {x:+P.x.toFixed(2), z:+P.z.toFixed(2), interact:vis(ib)?(ib.innerText||'').trim():'', dlg:vis(d)&&GAME.D&&GAME.D.active?(d.innerText||'').replace('▼ 點一下繼續','').trim().slice(0,160):'', panels, hour:+GAME.G.hour.toFixed(2), zone:GAME.G.zone}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X294 法服攤位：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        sv = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('讀得到存檔 %s' % FIX, bool(sv), ''): await b.close(); return
        R.setup('【前置／捷徑】讀使用者存檔 %s（day %s），改校園 %.1f 時、站在小椰林道（先放到 %s，進校園後挑第一個站得住的起點）；條件事件照開' % (FIX, sv.get('day'), HOUR, STARTS[0]))
        sv['zone'] = 'campus'; sv['hour'] = HOUR; sv['weather'] = 'clear'; sv['pos'] = {'x': STARTS[0][0], 'z': STARTS[0][1], 'yaw': 0.0, 'lv': 0}
        await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); await GAME.applySave(s); })", sv)
        await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
        for _ in range(15):   # 讀檔後跳出來的對話先點掉（照玩家）
            u = await pg.evaluate(UI)
            if not u['dlg']: break
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800)
        its = await pg.evaluate(ITS); R.note('校園裡跟法服有關的互動點：%s' % J(its))
        st = None
        for s in STARTS:
            if await pg.evaluate("(([x,z])=>GAME.E.canStand(x,z,0.32,0))", list(s)): st = s; break
        if not R.check('小椰林道上找得到站得住的起點', bool(st), J(STARTS)): await b.close(); return
        u = await pg.evaluate(UI)
        if math.hypot(u['x'] - st[0], u['z'] - st[1]) > 0.6:
            R.setup('【前置／捷徑】起點 %s 站不住的話換到 %s（再讀一次檔）' % (STARTS[0], st)); sv['pos'] = {'x': st[0], 'z': st[1], 'yaw': 0.0, 'lv': 0}
            await pg.evaluate("(async(s)=>{ await GAME.applySave(s); })", sv); await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
        # ① 起點往攤位看：鏡頭在玩家背後（攤位的反方向）
        u = await pg.evaluate(UI); yaw = math.atan2(u['x'] - BOOTH[0], u['z'] - BOOTH[1])
        await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a; C.manualT=6; }", yaw); await pg.wait_for_timeout(2500)
        R.note('起點 %s，離攤位 %.1f m；鏡頭直接擺 yaw %.2f（玩家背後看向攤位，只為截圖）' % ([u['x'], u['z']], math.hypot(u['x'] - BOOTH[0], u['z'] - BOOTH[1]), yaw))
        await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, 'booth_%s_1_start.png' % TAG)); await pg.evaluate(D.HUD + '(true)')
        # ② 真的走過去（點地面／搖桿；L.go_to）
        fb0 = await pg.evaluate("GAME.walkFallbacks|0")
        ok = await L.go_to(pg, cdp, R, IT[0], IT[1], 0.6, '從小椰林道走到攤位互動點 (34.5, −89.2)', max_s=240)
        await pg.wait_for_timeout(1500); u = await pg.evaluate(UI); fb1 = await pg.evaluate("GAME.walkFallbacks|0")
        R.check('真的走到攤位前（0.6 m 內、沒有被放到目的地）', bool(ok) and fb1 == fb0, J(u))
        R.check('攤位前的互動鍵是法律服務社的招生攤位', '法律服務社' in u['interact'], J(u))
        await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, 'booth_%s_2_front.png' % TAG)); await pg.evaluate(D.HUD + '(true)')
        # ③ 按下去
        if u['interact']:
            await L.tap(pg, cdp, '#interact'); got = None
            for _ in range(8):
                await pg.wait_for_timeout(500); v = await pg.evaluate(UI)
                if v['dlg'] or v['panels']: got = v; break
            await pg.screenshot(path=os.path.join(OUT, 'booth_%s_3_tap.png' % TAG))
            R.check('按下去 4 秒內開始說話（對話框）或出現公告', bool(got), J(got or v))
            lines = []
            for _ in range(12):
                v = await pg.evaluate(UI)
                if not v['dlg']: break
                if not lines or lines[-1] != v['dlg']: lines.append(v['dlg'])
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
            R.note('對話（最多 12 句）：%s' % J(lines))
        else:
            R.check('按下去 4 秒內開始說話（對話框）或出現公告', False, '沒有互動鍵可以按')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
