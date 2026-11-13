"""CC-C 11-14：REL76_save_econ（BB-C 21:04／21:10，取代 REL76_save_v7_ctl 的用途）——舊序章年（stage econ）的存檔，新版讀不了、也不能被蓋掉或刪掉。判定歸 BB。Windows＋GPU ≠ iPhone。
1. 舊版（OLD_URL，f312 發布樹）照預設開局：標題按「新遊戲」（#btnNew），對話點下去直到能動（最多 300 下），GAME.autosave()；
   FAIL_SETUP 檢查：那份自動存檔的 stage＝econ（不是就停）。同一份也放進欄位 1（fatiao3d_slot_1）。
2. 新版（NEW_URL，76f8）：頁面載入前把那兩份放進 localStorage。
   ① 按「繼續」（#btnContinue）：跳出 toast「這個存檔停在已經拿掉的舊章節，讀不了。請開新遊戲。」，GAME.G 沒有換成那份（不是 econ、不是那一天）；
   ② 標題停 8 秒以後、按繼續以後，fatiao3d_auto 都和原本那份一模一樣；
   ③ 重新整理 → 標題「讀取」選單 → 欄位 1「讀取」：一樣跳那一句、GAME.G 沒換、欄位 1 也還在。
   toast 用 MutationObserver 記（不靠輪詢）。
CC_02 清單 2026-11-14：1✓（日期照舊版自己的預設開局） 2✓（字照 76f8 src/game3d.js loadFrom 那一句） 3✓（欄位找「欄位 1」那一列的「讀取」鍵，不點第一個） 4n/a（只按標題的鍵） 5n/a（不走路） 6✓（標題停 8 秒；按完等 6 秒收 toast） 7✓（lint、JS node --check） 8✓（toast 用 observer；存檔逐字比） 9✓（每一步截圖） 10n/a（舊版開局照遊戲自己的流程點） 11✓（佇列用 game＋SCRIPT_FROM=cc、XARGS={url2} {url} {out}） 12✓（FAIL_SETUP：舊版存檔有寫出來、stage＝econ） 13n/a（不走路）
用法：python3 cc_save_econ_probe.py OLD_URL NEW_URL [OUT]（cwd＝受測版本工作樹，tests/playlib.py 從那裡 import）"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.abspath('tests'))
import playlib as L
from playwright.async_api import async_playwright

OLD, NEW = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '/tmp/save_econ'
os.makedirs(OUT, exist_ok=True)
LINE = '這個存檔停在已經拿掉的舊章節，讀不了。請開新遊戲。'
J = lambda o: json.dumps(o, ensure_ascii=False)
ADVANCE = """(()=>{ const D=GAME.D; if(D&&D.active){ GAME.dlgAdvance(); return 'dlg'; } const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')){ const b=ch.querySelector('button'); if(b){ b.click(); return 'choice'; } } return GAME.E&&GAME.E.player&&GAME.E.player.busy?'busy':'free'; })()"""
TOAST_OBS = """(()=>{ if(window.__ccToast) return 'already'; window.__ccToast=[]; const t=document.getElementById('toast'); if(!t) return 'no #toast'; let last='';
  new MutationObserver(()=>{ const x=(t.textContent||'').trim(); if(x&&x!==last){ last=x; window.__ccToast.push({ms:Math.round(performance.now()), t:x}); } }).observe(t,{childList:true,characterData:true,subtree:true,attributes:true}); return 'on'; })()"""
G_JS = "(()=>{ const G=typeof GAME!=='undefined'?GAME.G:null; return G?{stage:G.stage||'',day:G.day,hour:+(+G.hour||0).toFixed(2),zone:G.zone,name:G.name}:null; })()"
TITLE_JS = "(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide'); })()"


async def main():
    run = L.Run('save_econ', OUT)
    print('CC REL76_save_econ：舊版 %s → 新版 %s' % (OLD, NEW), flush=True)
    async with async_playwright() as p:
        # ---- 1. 舊版照預設開局 ----
        b, ctx, pg, cdp, e0 = await L.launch(p, landscape=True)
        await pg.goto(OLD); run.check('舊版載入', await L.wait_loaded(pg))
        await pg.fill('#nameInput', '舊版玩家'); await pg.click('#btnNew')
        n = {'dlg': 0, 'choice': 0, 'busy': 0, 'free': 0}; free = 0
        for i in range(300):
            r = await pg.evaluate(ADVANCE); n[r] = n.get(r, 0) + 1
            free = free + 1 if r == 'free' else 0
            if free >= 6 and await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.G.zone)"): break
            await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, 'econ_old_after_open.png'))
        await pg.evaluate("GAME.autosave()")
        auto = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        a0 = json.loads(auto) if auto else None
        run.setup('舊版照預設開局（#btnNew），對話點 %s，自動存檔' % J(n))
        if not run.check('FAIL_SETUP 檢查：舊版寫出自動存檔', bool(a0), ''): await b.close(); sys.exit(run.finish())
        info = {k: a0.get(k) for k in ['v', 'stage', 'name', 'day', 'hour', 'zone']}
        if not run.check('FAIL_SETUP 檢查：舊版預設開局的存檔 stage＝econ（舊序章年）', a0.get('stage') == 'econ', J(info)): await b.close(); sys.exit(run.finish())
        run.note('舊版存檔：%s；長度 %d' % (J(info), len(auto)))
        run.check('舊版沒有 JS 例外', not e0, J(e0[:3]))
        await b.close()
        # ---- 2. 新版 ----
        b, ctx, pg, cdp, en = await L.launch(p, landscape=True)
        seed = {'fatiao3d_auto': auto, 'fatiao3d_slot_1': auto}
        await ctx.add_init_script("(s=>{ try{ if(!localStorage.getItem('__cc_econ_seeded')){ for(const k in s) localStorage.setItem(k,s[k]); localStorage.setItem('__cc_econ_seeded','1'); } }catch(e){} })(%s)" % J(seed))
        await pg.goto(NEW); run.check('新版載入', await L.wait_loaded(pg))
        await pg.evaluate(TOAST_OBS)
        t0 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        await pg.wait_for_timeout(8000)
        t1 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        run.check('② 標題停 8 秒：fatiao3d_auto 和原本那份一模一樣', t0 == auto and t1 == auto, 'seeded=%s after8s=%s' % (t0 == auto, t1 == auto if t1 else None))
        await pg.screenshot(path=os.path.join(OUT, 'econ_new_title.png'))
        g0 = await pg.evaluate(G_JS)
        ms = await pg.evaluate("Math.round(performance.now())")
        await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, 'econ_new_continue.png'))
        await pg.wait_for_timeout(4500)
        ts = await pg.evaluate("(m=>(window.__ccToast||[]).filter(x=>x.ms>=m))", ms)
        g1 = await pg.evaluate(G_JS); t2 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
        run.note('按「繼續」前 GAME.G=%s；按完 GAME.G=%s；標題還在=%s；toast=%s' % (J(g0), J(g1), await pg.evaluate(TITLE_JS), J(ts)))
        run.check('① 按「繼續」跳出「%s」' % LINE, any(LINE in x['t'] for x in ts), J(ts))
        run.check('① 按「繼續」以後 GAME.G 沒有換成那份存檔（不是 econ、不是那一天那一區）', not (g1 and (g1.get('stage') == 'econ' or (g1.get('day') == a0.get('day') and g1.get('zone') == a0.get('zone') and g1.get('name') == a0.get('name')))), J(g1))
        run.check('② 按「繼續」以後 fatiao3d_auto 還是原本那份', t2 == auto, 'same=%s exists=%s' % (t2 == auto, t2 is not None))
        # ③ 欄位 1
        await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500); await pg.evaluate(TOAST_OBS)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(d=>(d.querySelector('b')||{}).textContent==='欄位 1'); if(!it) return null; const b=[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
        await pg.screenshot(path=os.path.join(OUT, 'econ_new_loadmenu.png'))
        if run.check('③ 標題「讀取」選單有欄位 1 那一列的「讀取」鍵', bool(c), ''):
            ms = await pg.evaluate("Math.round(performance.now())")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(OUT, 'econ_new_slot1.png'))
            await pg.wait_for_timeout(4500)
            ts = await pg.evaluate("(m=>(window.__ccToast||[]).filter(x=>x.ms>=m))", ms); g2 = await pg.evaluate(G_JS)
            s1 = await pg.evaluate("localStorage.getItem('fatiao3d_slot_1')"); t3 = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
            run.note('欄位 1 讀完 GAME.G=%s；toast=%s' % (J(g2), J(ts)))
            run.check('③ 欄位 1（econ）讀的時候一樣跳那一句', any(LINE in x['t'] for x in ts), J(ts))
            run.check('③ 欄位 1 讀完 GAME.G 沒有換成那份', not (g2 and g2.get('stage') == 'econ'), J(g2))
            run.check('③ 欄位 1、自動存檔都還在、沒被改', s1 == auto and t3 == auto, 'slot1 same=%s auto same=%s' % (s1 == auto, t3 == auto))
        run.check('新版沒有 JS 例外', not en, J(en[:3]))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
