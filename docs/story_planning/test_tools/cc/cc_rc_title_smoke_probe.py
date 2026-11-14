"""CC-C 11-14：X364 rc2e 煙霧測試（LAWWW-C 01:57，使用者選 rc2e 1404d5f2d4；BB 判）。rc2e 只改 index.html 一行：藏起來的舊開局按鈕 #btnNew 字拿掉、按鈕留著。
要確認：① 標題畫面正常（橫、直各截一張；看得到的按鈕列出來；#btnNew 藏著而且沒有字；#btnNewLaw「從法律系開始」看得到）
        ② 「從法律系開始」能開局：照玩家點 #btnNewLaw → 對話一句一句點、選項點第一個，直到能動（最多 300 下）→ 記 stage、區域、日期；搖桿推 1.2 秒有走動
        ③ 讀檔正常：GAME.autosave → 重新整理 →「繼續（自動存檔）」→ 日期、區域、名字和存的一樣、標題收掉；再重新整理 →「讀取／匯入存檔」選單打得開、有自動存檔那一列
        ④ 全程沒有 pageerror（兩次開瀏覽器都算）
只記證據＋機器檢查，判定歸 BB。Windows＋GPU ≠ iPhone。
CC_02 清單 2026-11-14：1✓（日期照遊戲自己的開局） 2✓（按鈕照 id 和字從頁面讀） 3n/a（不挑座位） 4✓（按標題鍵用 L.tap 觸控；搖桿照 #joy 的位置） 5n/a（不走到哪裡，只推搖桿看有沒有動） 6✓（對話每下等 400 ms；讀檔等 6 秒） 7✓（lint） 8✓（存檔逐欄比） 9✓（每一步截圖） 10✓（不墊旗標，照玩家開局） 11✓（佇列 probe、SHA 40 碼） 12✓（FAIL_SETUP：遊戲載入、標題看得到、開局後真的離開標題） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> python3 cc_rc_title_smoke_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
J = lambda o: json.dumps(o, ensure_ascii=False)
TITLE_JS = r"""(()=>{ const t=document.getElementById('titleScreen'); const vis=e=>!!e&&!!e.offsetParent&&getComputedStyle(e).visibility!=='hidden';
  const bn=document.getElementById('btnNew'), bl=document.getElementById('btnNewLaw');
  return {title:!!t&&!t.classList.contains('hide'), buttons:[...(t?t.querySelectorAll('button'):[])].filter(vis).map(b=>({id:b.id, t:(b.textContent||'').trim().slice(0,40)})),
    btnNew:bn?{visible:vis(bn), text:(bn.textContent||'').trim(), cls:bn.className}:null, btnNewLaw:bl?{visible:vis(bl), text:(bl.textContent||'').trim().slice(0,30)}:null,
    version:((t&&t.innerText)||'').split('\n').filter(x=>/v\d|版本/.test(x)).slice(0,2)}; })()"""
ADVANCE = """(()=>{ const D=GAME.D; if(D&&D.active){ GAME.dlgAdvance(); return 'dlg'; } const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')){ const b=[...ch.querySelectorAll('button')].find(x=>x.offsetParent); if(b){ b.click(); return 'choice'; } } return GAME.E&&GAME.E.player&&GAME.E.player.busy?'busy':'free'; })()"""
G_JS = "(()=>{ const G=typeof GAME!=='undefined'?GAME.G:null; if(!G) return null; const d=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:null; return {stage:G.stage||'', day:G.day, key:d, hour:+(+G.hour||0).toFixed(2), zone:G.zone, name:G.name, running:!!GAME.running}; })()"
POS_JS = "(()=>{ const o=GAME.E&&GAME.E.player&&GAME.E.player.obj; return o?{x:+o.position.x.toFixed(2), z:+o.position.z.toFixed(2)}:null; })()"
CLOSE_UI = "(()=>{ for(const id of ['btnPhoneClose','btnMapClose','btnMenuClose']){ const b=document.getElementById(id); if(b&&b.offsetParent) b.click(); } return true; })()"


async def joystick(pg, cdp, dx, dy, ms):
    j = await pg.evaluate("(()=>{ const e=document.getElementById('joy'); if(!e||!e.offsetParent) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
    if not j: return False
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': j[0], 'y': j[1]}]})
    for _ in range(max(4, ms // 80)):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': j[0] + dx, 'y': j[1] + dy}]}); await pg.wait_for_timeout(80)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    return True


async def main():
    run = L.Run('rc_title_smoke', OUT)
    print('CC X364 rc2e 煙霧：SHA %s；網址 %s；Windows＋GPU ≠ iPhone' % (SHA or '?', URL), flush=True)
    errs_all = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, e1 = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not run.check('FAIL_SETUP 檢查：遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(run.finish())
        await pg.wait_for_timeout(1500)
        # ① 標題
        t = await pg.evaluate(TITLE_JS); await pg.screenshot(path=os.path.join(OUT, 'rc_title_land.png'))
        run.note('標題（橫）：%s' % J(t))
        if not run.check('FAIL_SETUP 檢查：標題畫面看得到', t['title'], J(t)): await b.close(); sys.exit(run.finish())
        run.check('① #btnNew 藏著、沒有字（rc2e 的修改）', bool(t['btnNew']) and not t['btnNew']['visible'] and t['btnNew']['text'] == '', J(t['btnNew']))
        run.check('① 「從法律系開始」（#btnNewLaw）看得到', bool(t['btnNewLaw']) and t['btnNewLaw']['visible'] and '從法律系開始' in t['btnNewLaw']['text'], J(t['btnNewLaw']))
        run.check('① 看得到的標題按鈕裡沒有空白字的按鈕', all(x['t'] for x in t['buttons']), J(t['buttons']))
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(900)
        tp = await pg.evaluate(TITLE_JS); await pg.screenshot(path=os.path.join(OUT, 'rc_title_port.png'))
        run.note('標題（直 390×844）：%s' % J(tp['buttons']))
        run.check('① 直向標題：「從法律系開始」看得到、#btnNew 沒出現', bool(tp['btnNewLaw']) and tp['btnNewLaw']['visible'] and not (tp['btnNew'] or {}).get('visible'), J([tp['btnNewLaw'], tp['btnNew']]))
        await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(900)
        # ② 從法律系開始
        await pg.fill('#nameInput', '測試玩家')
        run.check('② 點「從法律系開始」', await L.tap(pg, cdp, '#btnNewLaw'))
        n = {'dlg': 0, 'choice': 0, 'busy': 0, 'free': 0}; free = 0; shots = 0
        for i in range(300):
            r = await pg.evaluate(ADVANCE); n[r] = n.get(r, 0) + 1
            if r == 'choice' and shots < 3: shots += 1; await pg.screenshot(path=os.path.join(OUT, 'rc_open_choice_%d.png' % shots))
            free = free + 1 if r == 'free' else 0
            if free >= 6 and await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.zone)"): break
            await pg.wait_for_timeout(400)
        await pg.evaluate(CLOSE_UI); await pg.wait_for_timeout(800)
        g1 = await pg.evaluate(G_JS); t1 = await pg.evaluate(TITLE_JS)
        await pg.screenshot(path=os.path.join(OUT, 'rc_open_free.png'))
        run.note('開局點了 %s；現在 %s' % (J(n), J(g1)))
        if not run.check('FAIL_SETUP 檢查：開局以後離開標題、遊戲在跑', bool(g1) and g1['running'] and not t1['title'], J([g1, t1['title']])): await b.close(); sys.exit(run.finish())
        run.check('② 開局的不是舊章節（stage 不是 econ）', g1['stage'] != 'econ', J(g1))
        run.check('② 對話點得完、玩家能動（連續 6 次 free）', free >= 6, J(n))
        p0 = await pg.evaluate(POS_JS); ok = await joystick(pg, cdp, 0, -60, 1200); await pg.wait_for_timeout(500); p1 = await pg.evaluate(POS_JS)
        mv = ((p1['x'] - p0['x']) ** 2 + (p1['z'] - p0['z']) ** 2) ** 0.5 if (p0 and p1) else 0
        await pg.screenshot(path=os.path.join(OUT, 'rc_open_moved.png'))
        run.check('② 搖桿推 1.2 秒有走動（>0.3 m）', ok and mv > 0.3, J({'joy': ok, 'from': p0, 'to': p1, 'm': round(mv, 2)}))
        # ③ 存讀檔
        await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(800)
        gs = await pg.evaluate(G_JS); auto = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        run.check('③ 自動存檔有寫出來', bool(auto), 'len=%d' % len(auto or ''))
        await pg.reload(); await L.wait_loaded(pg, 600); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, 'rc_reload_title.png'))
        run.check('③ 重新整理後點「繼續（自動存檔）」', await L.tap(pg, cdp, '#btnContinue')); await pg.wait_for_timeout(6000)
        g2 = await pg.evaluate(G_JS); t2 = await pg.evaluate(TITLE_JS); await pg.screenshot(path=os.path.join(OUT, 'rc_continue.png'))
        run.note('存檔前 %s；繼續以後 %s' % (J(gs), J(g2)))
        run.check('③ 繼續以後日期、區域、名字和存的一樣、標題收掉', bool(g2) and not t2['title'] and all(g2.get(k) == gs.get(k) for k in ('day', 'zone', 'name', 'stage')), J([gs, g2]))
        await pg.reload(); await L.wait_loaded(pg, 600); await pg.wait_for_timeout(1500)
        run.check('③ 點「讀取／匯入存檔」', await L.tap(pg, cdp, '#btnLoadMenu')); await pg.wait_for_timeout(1500)
        sl = await pg.evaluate("(()=>{ const s=document.getElementById('saveSlots'); return s?[...s.querySelectorAll('.item')].map(d=>(d.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60)):null; })()")
        await pg.screenshot(path=os.path.join(OUT, 'rc_loadmenu.png'))
        run.note('讀取選單：%s' % J(sl))
        run.check('③ 讀取選單打得開、有自動存檔那一列', bool(sl) and any('自動' in x for x in sl), J(sl))
        errs_all += e1
        await b.close()
    run.check('④ 全程沒有 pageerror／JS 例外', not errs_all, J(errs_all[:5]))
    sys.exit(run.finish())

asyncio.run(main())
