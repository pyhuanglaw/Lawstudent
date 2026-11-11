"""CC（帳號 A）11-11：LIVE_main（BB 07:46）——LAWWW 把 README 單獨合進 main（PR #35 → 12555291d），說遊戲檔＝779ddd650、Pages 重新部署中。開**線上網址**（LIVE_URL，預設 GitHub Pages）：
① 標題版本字樣（EXPECT，預設 v9.10.24）② network 收所有非 200（含 requestfailed；要 0）③ 標題「從法律系開始」開新遊戲 → 對話一路點完到可以動（宿舍）→ 搖桿推得動 ≥0.3 m →
右上 💾 存一格（GAME.quickSave，玩家同一個按鈕的函式）→ 重新整理 → 標題「繼續」讀回來（同一天、同一區）。
部署還沒好（index 不是 200、或版本字樣不對）＝隔 RETRY_MIN（預設 5）分鐘再跑一次，最多 RETRIES（預設 2）次，log 記時間。
④ git 比對在雲端做（CC 07:5x：`git diff --stat 779ddd650 12555291d -- src assets lib index.html` 是空的）；這支只在 log 印 PC 上 `git rev-parse origin/main`（抓得到就印）。
Playwright（PC GPU）≠ iPhone。用法：python cc_live_main_probe.py <url（忽略）> <out>"""
import os, sys, json, asyncio, time, subprocess, datetime
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L
from playwright.async_api import async_playwright
URL = os.environ.get('LIVE_URL') or 'https://pyhuanglaw.github.io/Lawstudent/index.html'
if os.environ.get('LOCAL') == '1' and len(sys.argv) > 1 and sys.argv[1].startswith('http'): URL = sys.argv[1]   # CC 15:5x（BB 15:48）：本機對照（f312c／779 的 worktree），用 runner 給的網址
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'; os.makedirs(OUT, exist_ok=True)
EXP = os.environ.get('EXPECT') or 'v9.10.24'
RETRY_MIN = float(os.environ.get('RETRY_MIN') or '5'); RETRIES = int(os.environ.get('RETRIES') or '2')
R = L.Run('live_main', OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
now = lambda: datetime.datetime.utcnow().strftime('%H:%M:%S UTC')
ST = r"""(()=>{ const G=GAME.G, E=GAME.E, t=document.getElementById('titleScreen'); return {title:!!t&&!t.classList.contains('hide'), zone:G&&G.zone, day:G&&G.day, hour:G?+(+G.hour).toFixed(2):null,
  x:E&&E.player?+E.player.obj.position.x.toFixed(2):null, z:E&&E.player?+E.player.obj.position.z.toFixed(2):null, dlg:!!(GAME.D&&GAME.D.active), busy:!!(E&&E.player&&E.player.busy),
  ch:(()=>{ const c=document.getElementById('choices'); return !!c&&!c.classList.contains('hide')&&!!c.querySelector('button'); })(), phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()"""


async def one(p, attempt):
    print('== attempt %d（%s）' % (attempt, now()), flush=True)
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    bad = []; nreq = [0]
    def on_resp(r):
        nreq[0] += 1
        if r.status != 200 and r.status != 304 and not r.url.startswith('data:'): bad.append([r.status, r.url[:160]])
    pg.on('response', on_resp)
    pg.on('requestfailed', lambda r: bad.append(['failed:' + str(r.failure), r.url[:160]]) if not r.url.startswith('data:') else None)
    try:
        resp = await pg.goto(URL + ('&' if '?' in URL else '?') + 'nocache=%d' % int(time.time()), wait_until='load')
        st0 = resp.status if resp else None
        for _ in range(90):
            if await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide'); })()"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2500)
        ver = await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); const s=(t?t.innerText:'').split('\\n').find(x=>/版本|v9\\./.test(x))||''; return s.trim(); })()")
        vs = await pg.evaluate("[...new Set([...document.querySelectorAll('script[src]')].map(e=>((e.getAttribute('src')||'').match(/\\?v=([^&]+)/)||[])[1]).filter(Boolean))]")
        await pg.screenshot(path=os.path.join(OUT, 'live_title_a%d.png' % attempt))
        R.note('[%s] index HTTP %s；標題版本字樣「%s」；?v= 值 %s' % (now(), st0, ver, J(vs)))
        deployed = st0 == 200 and EXP in ver
        if not deployed:
            R.note('部署看起來還沒好（HTTP %s、版本「%s」，要含 %s）' % (st0, ver, EXP)); await b.close(); return None
        R.check('① 標題版本字樣含 %s' % EXP, EXP in ver, ver)
        R.check('① ?v= 都是同一個版號、而且就是 %s' % EXP, len(vs) == 1 and EXP.lstrip('v') in vs[0], J(vs))
        # ③ 開新遊戲
        await L.tap(pg, cdp, '#btnNewLaw')
        t0 = time.time(); free_since = None
        while time.time() - t0 < 600:
            s = await pg.evaluate(ST)
            if s['title']: await pg.wait_for_timeout(800); continue
            if s['ch']:
                await pg.wait_for_timeout(700)
                await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')][0]; if(b) b.scrollIntoView({block:'center'}); })()")
                c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')][0]; if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(b.textContent||'').trim().slice(0,30)]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1]); print('   ▶', c[2], flush=True)
                free_since = None; await pg.wait_for_timeout(800); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); free_since = None; await pg.wait_for_timeout(500); continue
            if s['phone']: await L.close_panels(pg, cdp); await pg.wait_for_timeout(500); continue
            if s['busy']: free_since = None; await pg.wait_for_timeout(600); continue
            free_since = free_since or time.time()
            if time.time() - free_since > 4: break
            await pg.wait_for_timeout(500)
        s1 = await pg.evaluate(ST); await pg.screenshot(path=os.path.join(OUT, 'live_newgame_a%d.png' % attempt))
        R.note('[%s] 新遊戲走到可以動：%s（%.0f 秒）' % (now(), J(s1), time.time() - t0))
        moved = 0.0
        for dx, dy in ((0, -45), (45, 0), (0, 45), (-45, 0)):
            a = await pg.evaluate(ST); await L.joystick(pg, cdp, dx, dy, 900); await pg.wait_for_timeout(500); b2 = await pg.evaluate(ST)
            moved = max(moved, ((b2['x'] - a['x']) ** 2 + (b2['z'] - a['z']) ** 2) ** 0.5)
        R.check('③ 新遊戲走到可以動（%s）、搖桿推得動 ≥0.3 m' % s1['zone'], not s1['title'] and moved >= 0.3, J({'s': s1, 'moved': round(moved, 2)}))
        sv = await pg.evaluate("(()=>{ try{ GAME.quickSave(); return {ok:true, slot:!!localStorage.getItem('fatiao3d_quick')||!!localStorage.getItem('fatiao3d_auto')}; }catch(e){ return {ok:false, e:String(e)}; } })()")
        s2 = await pg.evaluate(ST)
        R.note('③ 存一格（GAME.quickSave，右上 💾 同一個函式）：%s；存的時候 %s' % (J(sv), J(s2)))
        await pg.reload(wait_until='load')
        for _ in range(90):
            if await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide'); })()"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2000)
        hasC = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); return !!b&&getComputedStyle(b).display!=='none'; })()")
        BTN_JS = "(()=>{ const b=document.getElementById('btnContinue'); if(!b) return null; const r=b.getBoundingClientRect(), c=getComputedStyle(b); const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {dis:!!b.disabled, pe:c.pointerEvents, op:c.opacity, top:e?(e.id||String(e.className).slice(0,40)||e.tagName):null, onBtn:!!(e&&(e===b||b.contains(e))), titleIdle:!!(typeof GAME!=='undefined'&&GAME.titleIdle), running:!!(typeof GAME!=='undefined'&&GAME.running), fade:!!(document.getElementById('fade')&&document.getElementById('fade').classList.contains('on'))}; })()"
        taps = []
        if hasC: taps.append(['按', round(time.time() - t0, 1), await pg.evaluate(BTN_JS)]); await L.tap(pg, cdp, '#btnContinue')
        for k in range(120):
            s3 = await pg.evaluate(ST)
            if not s3['title'] and s3['zone']: break
            if hasC and k in (30, 60):   # CC 15:5x（LIVE25_main_r2：按「繼續」60 秒還在標題）：15 秒還在標題＝記按鈕狀態、截圖、再按一次（分「按太早」和「按了沒反應」）
                b = await pg.evaluate(BTN_JS); await pg.screenshot(path=os.path.join(OUT, 'live_cont_stuck_a%d_%d.png' % (attempt, k)))
                R.note('③ 按「繼續」%d 秒還在標題：按鈕 %s → 再按一次' % (k // 2, J(b))); taps.append(['再按', round(time.time() - t0, 1), b]); await L.tap(pg, cdp, '#btnContinue')
            await pg.wait_for_timeout(500)
        R.note('③ 按「繼續」的紀錄：%s' % J(taps))
        if len(taps) > 1: R.check('③ 第一次按「繼續」就讀進遊戲（不用按第二次）', False, J(taps))
        await pg.wait_for_timeout(2500); s3 = await pg.evaluate(ST); await pg.screenshot(path=os.path.join(OUT, 'live_reload_a%d.png' % attempt))
        R.check('③ 重新整理 → 標題「繼續」讀回來（同一天、同一區）', hasC and s3['day'] == s2['day'] and s3['zone'] == s2['zone'], J({'continue': hasC, 'before': s2, 'after': s3}))
        R.note('② 一共 %d 個回應；非 200（含 304 以外、requestfailed）%d 筆：%s' % (nreq[0], len(bad), J(bad[:40])))
        R.check('② network 非 200＝0', not bad, J(bad[:10]))
        R.check('沒有 JS 例外（pageerror）', not errs, J(errs[:3]))
        return True
    finally:
        try: await b.close()
        except Exception: pass


async def main():
    try:
        h = subprocess.run(['git', 'rev-parse', 'origin/main'], capture_output=True, text=True, timeout=30).stdout.strip()
        R.note('④ PC 上 origin/main＝%s（沒有 fetch，只是 runner 抓過的那一個）' % (h or '（讀不到）'))
    except Exception as e: R.note('④ PC 上讀 origin/main 失敗 %r' % e)
    async with async_playwright() as p:
        for k in range(1, RETRIES + 2):
            r = await one(p, k)
            if r is not None: break
            if k <= RETRIES: R.note('[%s] 隔 %.0f 分鐘再試' % (now(), RETRY_MIN)); await asyncio.sleep(RETRY_MIN * 60)
        else:
            R.check('線上版部署完成（index 200、版本 %s）' % EXP, False, '試了 %d 次都還沒好' % (RETRIES + 1))
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
