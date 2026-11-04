"""CC-C（帳號 C）11-04：ADE_touchwz 診斷（BB-C 13:00）——tests/touch_flow_wenzhou.py 的「溫州街：搖桿往前走」1.6 秒沒動、還有一個路人 driver＝proc。
  照那支測試的前置做到同一步（[前置／捷徑] localStorage 放「2025-10-04（六）14:48、溫州街東口 (44, −1)」的自動存檔 → 重新整理 → 點「繼續」），
  在按「繼續」以後、推搖桿以前截圖並記：phoneIsOpen、GAME.D.busyDepth、GAME.charsAll、每個路人的 driver、player.busy／pose、isEntering、loading、#joy 看不看得到；
  推一次搖桿（0, −55, 1600 ms，和原測試一樣）以後再記一次；沒動的話 +3 s、+10 s、+20 s 各再推一次，分清楚「手機自動打開」「人物還在載入」「真的走不動」。
  只記錄＋CC 初判，不判 PASS／FAIL（判定 BB）；只有載入失敗算 FAIL。Playwright 手機模擬（直向 390×844）≠ iPhone 實機。
用法：LW_TESTS=<wt>/tests python3 cc_touchwz_diag_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

BASE, OUT = sys.argv[1], sys.argv[2]
URL = BASE + ('&' if '?' in BASE else '?') + 'turbo'   # 和 touch_flow_wenzhou.py 一樣
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


DIAG = r"""(()=>{ const E=GAME.E, P=E&&E.player, D=GAME.D||{}; const vis=id=>{ const e=document.getElementById(id); return !!(e&&!e.classList.contains('hide')); };
  const q=f=>{ try{ return f(); }catch(e){ return 'ERR '+String(e).slice(0,60); } };
  const joy=document.getElementById('joy'), jr=joy&&joy.getBoundingClientRect();
  return { t:+(performance.now()/1000).toFixed(1), zone:GAME.G&&GAME.G.zone, hour:GAME.G&&+(+GAME.G.hour).toFixed(2),
    x:P?+P.obj.position.x.toFixed(2):null, z:P?+P.obj.position.z.toFixed(2):null, busy:P?!!P.busy:null, pose:P?P.pose||null:null, seat:P?!!P.seat:null,
    phoneIsOpen:q(()=>!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())), busyDepth:q(()=>D.busyDepth), busyWho:q(()=>(D.busyWho||[]).slice(0,5)), dActive:q(()=>!!D.active),
    charsAll:q(()=>GAME.charsAll===undefined?'undefined':!!GAME.charsAll), charsAllP:q(()=>!!GAME.charsAllP), entering:q(()=>!!(GAME.isEntering&&GAME.isEntering())),
    loading:vis('loading'), title:q(()=>{ const t=document.getElementById('titleScreen'); return !!(t&&!t.classList.contains('hide')); }), dlg:vis('dlg'), choices:vis('choices'), menu:vis('menu'),
    fade:q(()=>document.getElementById('fade').classList.contains('on')), joy:jr?{w:Math.round(jr.width),h:Math.round(jr.height),vis:getComputedStyle(joy).visibility,pe:getComputedStyle(joy).pointerEvents}:null,
    lastTalkError:q(()=>GAME.lastTalkError||null),
    npcs:q(()=>(E.npcs||[]).map(n=>({name:n.name||'(路人)', id:n.id||n.cid||null, driver:n.obj&&n.obj.userData.driver, x:+n.obj.position.x.toFixed(1), z:+n.obj.position.z.toFixed(1)}))) }; })()"""


async def tap_el(pg, cdp, sel):
    r = await pg.evaluate("(sel=>{ const els=[...document.querySelectorAll(sel)].filter(e=>{ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'; }); const e=els[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })(%s)" % J(sel))
    if not r: return False
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': r[0], 'y': r[1]}]}); await pg.wait_for_timeout(70)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); return True


async def joy(pg, cdp, dx, dy, ms):
    jx, jy = await pg.evaluate("(()=>{ const r=document.getElementById('joy').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    for i in range(max(3, ms // 80)):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]}); await pg.wait_for_timeout(80)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def snap(pg, tag):
    d = await pg.evaluate(DIAG)
    await pg.screenshot(path=os.path.join(OUT, 'touchwz_%s.png' % tag))
    npcs = d.pop('npcs', []) if isinstance(d.get('npcs'), list) else d.pop('npcs', None)
    print('  [%s] %s' % (tag, J(d)), flush=True)
    if isinstance(npcs, list):
        drv = {}
        for n in npcs: drv[n['driver']] = drv.get(n['driver'], 0) + 1
        print('  [%s] 路人 %d 個，driver 統計 %s；不是 vrm 的：%s' % (tag, len(npcs), J(drv), J([n for n in npcs if n['driver'] != 'vrm'])), flush=True)
    else:
        print('  [%s] 路人：%s' % (tag, J(npcs)), flush=True)
    d['npcs'] = npcs
    return d


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC touchwz 診斷；SHA=%s；Playwright 手機模擬（直向），不是 iPhone 實機' % os.environ.get('SHA', '?'), flush=True)
    rec = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        cons = []
        pg.on('console', lambda m: cons.append('%s: %s' % (m.type, m.text[:200])) if m.type == 'error' and len(cons) < 30 else None)
        async def wait_boot():
            for i in range(240):
                if await pg.evaluate("document.getElementById('loading').classList.contains('hide')&&(typeof GAME==='undefined'||!GAME.charsAllP||!!GAME.charsAll)"): return True
                await pg.wait_for_timeout(500)
            return False
        await pg.goto(URL); ok = await wait_boot(); check('遊戲載入', ok, '')
        st0 = {'v': 2, 'name': '祐廷', 'day': 18, 'weekday': 6, 'hour': 14.8, 'energy': 80, 'money': 1500, 'zone': 'wenzhou', 'pos': {'x': 44, 'z': -1, 'yaw': -1.5708}, 'weather': 'clear',
               'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True},
               'visited': {'dorm': True, 'campus': True, 'gongguan': True, 'wenzhou': True, 'cafe': True}, 'savedAt': 1}
        print('  [前置／捷徑] localStorage 放自動存檔：2025-10-04（六）14:48、溫州街東口 (44, −1)（同 touch_flow_wenzhou.py）→ 重新整理 → 點「繼續」', flush=True)
        await pg.evaluate("s=>localStorage.setItem('fatiao3d_auto',JSON.stringify(s))", st0)
        await pg.reload(); t_boot = time.time(); await wait_boot()
        rec.append(await snap(pg, '00_title'))
        await tap_el(pg, cdp, '#rotate'); await pg.wait_for_timeout(400)
        okc = await tap_el(pg, cdp, '#btnContinue'); check('標題畫面：觸控點「繼續」', okc, '')
        await pg.wait_for_timeout(6000)   # 原測試在這裡等 6 秒
        rec.append(await snap(pg, '01_after_continue_6s'))
        p0 = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
        await joy(pg, cdp, 0, -55, 1600)
        p1 = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
        mv = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        print('  [02] 第一次推搖桿（0, −55, 1600 ms，同原測試）：移動 %.2f m' % mv, flush=True)
        rec.append(dict(await snap(pg, '02_after_joy1'), moved=round(mv, 2)))
        if mv <= 0.5:
            for k, wait in enumerate((3, 10, 20)):
                await pg.wait_for_timeout(wait * 1000)
                rec.append(await snap(pg, '%02d_wait%ds_before' % (3 + k * 2, wait)))
                p0 = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
                await joy(pg, cdp, 0, -55, 1600)
                p1 = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
                mv2 = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
                print('  [%02d] 再等 %d 秒後推搖桿：移動 %.2f m' % (4 + k * 2, wait, mv2), flush=True)
                rec.append(dict(await snap(pg, '%02d_wait%ds_after' % (4 + k * 2, wait)), moved=round(mv2, 2)))
                if mv2 > 0.5: break
        print('INFO 讀檔到第一次推搖桿：%.1f 秒（從重新整理算）' % (time.time() - t_boot), flush=True)
        print('INFO console error %d 則：%s' % (len(cons), J(cons[:8])), flush=True)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'touchwz_diag.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
