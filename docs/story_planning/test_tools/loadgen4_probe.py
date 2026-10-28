"""BB-C 10-28：v9.10.13 發布門檻 ①②（LAWWW-C 09:32）——LOADGEN-LOCKS 第 4 點、newGameAbort（b727fb570）。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
  MODE=home ：【前置】存檔欄位 1＝另一份（宿舍 21:00）；使用者存檔改成「在臺北的家」（HOME.rec(G).at＝true，週六 19:30）→ 家裡的選單出來
              ① 照玩家：選「存檔」→ 存檔分頁按欄位 1「讀取」→ 記下發生什麼（劇情中讀不了＝toast「劇情還在進行…」；讀得了＝看舊的家裡選單會不會跳回來）
              ② 【捷徑】存檔分頁開著時直接 GAME.applySave(欄位 1)（＝卡住 stale 以後、或從這裡讀得了的時候走的那一條）→ 關選單 → 20 秒內舊的家裡選單不能再跳出來、人在宿舍、走得動
  MODE=phone：同上，家裡選單選「看手機」（GM.phoneThread 等手機收起來）→ 手機開著時 ① 照玩家按 ☰ → 存檔分頁 →「讀取」② 【捷徑】直接 applySave → 收起手機 → 舊的家裡選單不能回來
  MODE=newgame：【前置】使用者存檔；【捷徑】做一段凍住的舊流程（GAME.sceneBegin 之後停在 GAME.sleep(很久)、醒來會記 __OLD_WOKE）＝劇情鎖住
              → 等到 stale（toast「畫面好像停住了…」）→ 照玩家 ☰ → 設定 →「回到標題」→「從法律系開始」→ 新的一局開場照演（busyDepth 從 0 開始、loadGen 加一）、
              舊流程永遠不醒（__OLD_WOKE 沒記、舊的 sceneEnd 沒把新的一局的鎖減掉）、開場演完走得動
用法：LW_TESTS=<工作樹>/tests MODE=home python3 loadgen4_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; MODE = os.environ.get('MODE', 'home')
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
ST = """(()=>{ const D=GAME.D, E=GAME.E, ch=document.getElementById('choices'), menu=document.getElementById('menu'), ph=document.getElementById('phone'), t=document.getElementById('toast');
  return {zone:GAME.G&&GAME.G.zone, day:GAME.G&&GAME.G.day, h:GAME.G?+(+GAME.G.hour).toFixed(2):null, home:!!(GAME.G&&GAME.G.home&&GAME.G.home.at), depth:D.busyDepth|0, dlg:!!D.active, stale:!!D.stale,
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,16)):[], menu:!!(menu&&!menu.classList.contains('hide')), phone:!!(ph&&!ph.classList.contains('hide')),
    toast:(t&&!t.classList.contains('hide'))?(t.textContent||'').trim().slice(0,40):'', busy:!!(E.player&&E.player.busy), loadGen:GAME.loadGen|0, adv:typeof ADV!=='undefined'&&!!ADV.active,
    title:!document.getElementById('titleScreen').classList.contains('hide')}; })()"""
TOASTS = """(()=>{ window.__TO=[]; const el=document.getElementById('toast'); if(!el) return; let last=''; new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&t!==last){ last=t; window.__TO.push(t.slice(0,50)); } }).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); })()"""


async def click_choice(pg, text):
    return await pg.evaluate("(t=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.trim().startsWith(t)); if(!b) return false; b.click(); return true; })(%s)" % J(text))


async def wait_for(pg, cond, secs):
    t0 = time.time(); s = None
    while time.time() - t0 < secs:
        s = await pg.evaluate(ST)
        if cond(s): return s
        await pg.wait_for_timeout(500)
    return s


async def slot_load_ui(pg, run, tag):
    """存檔分頁：欄位 1 的「讀取」"""
    await pg.evaluate("(()=>{ const b=document.querySelector('#menu .tabs button[data-tab=\"save\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
    await run.shot(pg, tag + '_savetab')
    ok = await pg.evaluate("(()=>{ const items=[...document.querySelectorAll('#saveSlots .item')]; const it=items.find(x=>/欄位 ?1|存檔 ?1|^1/.test((x.querySelector('b')||{}).textContent||'')); const bs=[...((it||document).querySelectorAll('button'))].filter(b=>b.textContent.trim()==='讀取'); const b=it?bs[0]:null; if(!b) return [...document.querySelectorAll('#saveSlots .item b')].map(x=>x.textContent); b.click(); return true; })()")
    await pg.wait_for_timeout(2500)
    return ok


async def main():
    run = L.Run('loadgen4_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await pg.evaluate(TOASTS)
        other = copy.deepcopy(SAVE); other.pop('_stuck', None); other.update(zone='dorm', pos=None, hour=21.0)
        if MODE in ('home', 'phone'):
            await L.load_state(pg, other, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(4000)
            await pg.evaluate("(()=>{ const s=GAME.snapshot(); s.savedAt=Date.now(); localStorage.setItem('fatiao3d_slot_1',JSON.stringify(s)); })()")
            run.setup('[前置] 存檔欄位 1＝同一份使用者存檔改到宿舍 21:00')
            st = copy.deepcopy(SAVE); st.pop('_stuck', None)
            d = await pg.evaluate("(()=>{ let d=GAME.G.day; while(CALENDAR.dateOf(d).wd!==6) d++; return {d, wd:6}; })()")
            st.update(day=d['d'], weekday=6, hour=19.5, zone='dorm', pos=None); st['home'] = {'at': True, 'day': d['d']}
            await L.load_state(pg, st, quiet_events=False, quiet_phone=True)
            run.setup('[前置] 使用者存檔改成週六 19:30 在臺北的家（home.at）')
            s = await wait_for(pg, lambda s: any(c.startswith('存檔') for c in s['ch']), 60)
            run.note('家裡的選單：%s' % J(s)); await run.shot(pg, 'home_menu')
            run.check('前置：家裡的選單出來（有「存檔」）', any(c.startswith('存檔') for c in s['ch']), J(s))
            g0 = s['loadGen']
            if MODE == 'home':
                await click_choice(pg, '存檔'); await pg.wait_for_timeout(1200)
            else:
                await click_choice(pg, '看手機'); await pg.wait_for_timeout(1500)
                s1 = await pg.evaluate(ST); run.check('前置：選「看手機」手機開著', s1['phone'], J(s1))
                await pg.evaluate("(()=>{ const b=document.getElementById('btnMenu'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
            s1 = await pg.evaluate(ST); run.note('存檔選單：%s' % J(s1))
            run.check('前置：選單（存檔分頁）打得開', s1['menu'], J(s1))
            ok = await slot_load_ui(pg, run, 'ui')
            s2 = await pg.evaluate(ST); to = await pg.evaluate("window.__TO")
            run.note('① 照玩家按「讀取」：%s；%s；toast %s' % (J(ok), J(s2), J(to[-3:])))
            loaded_ui = s2['loadGen'] > g0
            if not loaded_ui:
                run.check('① 劇情中按「讀取」被擋（toast「劇情還在進行，結束後再讀檔」）、還在家', any('劇情還在進行' in t for t in to) and s2['home'], J([s2, to[-3:]]))
                run.note('① 正常玩家在家的選單、手機開著時讀不了檔＝不會發生「舊的家裡選單跳回來」；② 用捷徑走讀得了的那一條')
                await run.shot(pg, 'ui_blocked')
                await pg.evaluate("(()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_slot_1')); window.__bbLoad=GAME.applySave(s); })()")
                run.setup('[捷徑] 選單開著時直接 GAME.applySave(欄位 1)（卡住 stale 以後讀檔走的同一條）')
                await pg.wait_for_timeout(3000)
            s3 = await pg.evaluate(ST); run.note('讀檔後：%s' % J(s3))
            run.check('讀進來的是欄位 1（宿舍、不在家、loadGen 加一）', s3['zone'] == 'dorm' and not s3['home'] and s3['loadGen'] > g0, J(s3))
            await pg.evaluate("(()=>{ for(const id of ['btnClose','btnPhoneClose']){ const b=document.getElementById(id); if(b&&b.offsetParent) b.click(); } })()"); await pg.wait_for_timeout(1000)
            await L.close_panels(pg, cdp)
            run.setup('照玩家關掉選單、收起手機')
            seen = []; t0 = time.time()
            while time.time() - t0 < 20:
                s = await pg.evaluate(ST)
                if s['ch'] or s['dlg'] or s['adv'] or s['home']: seen.append(s)
                await pg.wait_for_timeout(1000)
            await run.shot(pg, 'after_close')
            run.check('關掉以後 20 秒內舊的家裡選單沒有跳回來（沒有選項、對話、家裡的 2D、home.at）', not seen, J(seen[:2]))
            s4 = await pg.evaluate(ST)
            run.check('不忙、鎖 0 層', not s4['busy'] and s4['depth'] == 0, J(s4))
        elif MODE == 'newgame':
            st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.update(zone='dorm', pos=None, hour=21.0)
            await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(4000)
            await pg.evaluate("(()=>{ window.__oldWoke=false; void (async()=>{ GAME.sceneBegin(); await GAME.sleep(900000); window.__oldWoke=true; GAME.G.flags.__OLD_WOKE=true; GAME.sceneEnd(); })(); })()")
            run.setup('[捷徑] 一段凍住的舊流程：sceneBegin 之後停在 GAME.sleep(900 秒)，醒來記 __OLD_WOKE、sceneEnd')
            s = await wait_for(pg, lambda s: s['stale'], 120)
            to = await pg.evaluate("window.__TO"); run.note('等 stale：%s；toast %s' % (J(s), J(to[-3:])))
            run.check('前置：劇情鎖住以後變成 stale（「畫面好像停住了…」）', s['stale'] and s['depth'] >= 1, J([s, to[-3:]]))
            await pg.evaluate("(()=>{ const b=document.getElementById('btnMenu'); if(b) b.click(); })()"); await pg.wait_for_timeout(1000)
            await pg.evaluate("(()=>{ const b=document.querySelector('#menu .tabs button[data-tab=\"settings\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
            await pg.evaluate("(()=>{ const b=document.getElementById('btnTitle'); if(b) b.click(); })()"); await pg.wait_for_timeout(2500)
            s = await pg.evaluate(ST); run.note('回到標題：%s' % J(s)); await run.shot(pg, 'title')
            run.check('照玩家 ☰ → 設定 →「回到標題」：到標題畫面', s['title'], J(s))
            g0 = s['loadGen']
            await pg.evaluate("(()=>{ const b=document.getElementById('btnNewLaw'); if(b) b.click(); })()")
            run.setup('照玩家按「從法律系開始」')
            s = await wait_for(pg, lambda s: s['dlg'] or s['ch'], 120); run.note('新的一局開場：%s' % J(s)); await run.shot(pg, 'newgame_open')
            run.check('新的一局：loadGen 加一（newGameAbort）', s['loadGen'] > g0, J(s))
            run.check('新的一局開場照演（對話框／選項出來）', bool(s['dlg'] or s['ch']), J(s))
            # 照玩家把開場點下去一段
            t0 = time.time(); n = 0
            while time.time() - t0 < 240 and n < 60:
                s = await pg.evaluate(ST)
                if s['ch']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>!x.classList.contains('dim'))||bs[0]; if(b) b.click(); })()"); n += 1; await pg.wait_for_timeout(800); continue
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); n += 1; await pg.wait_for_timeout(600); continue
                if not s['busy'] and not s['depth']: break
                await pg.wait_for_timeout(600)
            s = await pg.evaluate(ST); woke = await pg.evaluate("({w:window.__oldWoke, f:!!(GAME.G.flags&&GAME.G.flags.__OLD_WOKE)})")
            run.note('開場點了 %d 下以後：%s；舊流程 %s' % (n, J(s), J(woke)))
            run.check('舊的凍住流程沒有醒來（__OLD_WOKE 沒記在新的一局）', not woke['w'] and not woke['f'], J(woke))
            await run.shot(pg, 'newgame_after')
            if not s['busy'] and not s['depth']:
                moved, k, sx = await L.push_until(pg, cdp, 0, -60, 0.3, max_pushes=3, ms=1200)
                if moved < 0.3: moved, k, sx = await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=2, ms=1200)
                run.check('開場演完（或到可以走的地方）走得動', moved >= 0.3, '%.2f m' % moved)
            else:
                run.note('開場 %d 下還沒演完（仍在劇情中：depth %s）——只記錄，不判走路' % (n, s['depth']))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
