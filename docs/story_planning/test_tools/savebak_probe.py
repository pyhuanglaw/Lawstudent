"""BB-B 10-30（BUG-SAVE-NEWGAME-1030；v9.10.14 新候選 dda717bdd，修正前 92e9bca92）：開新遊戲前先備份、存檔頁「備份」一區、💾 存到自己的「快速存檔」——照玩家按按鈕（不用 turbo）。
使用者 10-30 04:0x 實測：💾 存在自動存檔那一格 → 重開遊戲按開新遊戲 → 第一天立刻自動存檔蓋掉、完全讀不到。
MODE（環境變數）：
  new     BTN＝btnNew（從經濟系開始，序章）／btnNewLaw（從法律系開始）／btnNewEcon（從經濟系大一開始，開發中：只在網址 ?y0 出現）各一次：
          【前置】使用者存檔讀進來、遊戲自己的 GAME.autosave 存一次（＝有進度的玩家）；照玩家按 💾 →「快速存檔」；
          重新整理 → 標題按那個開新遊戲 → 照玩家點對話、選第一個，玩到自動存檔被新遊戲寫過 → 重新整理 → 標題「讀取／匯入存檔」→
          存檔頁 #saveBackups 有「備份：自動存檔（開新遊戲前）」（和「備份：快速存檔（開新遊戲前）」）→ 按那一筆「讀取」＝回到原本的日子、地點、時間
  quick   💾 →「快速存檔」：提示「已快速存檔：…（選單 → 存檔 →「快速存檔」讀取）」、寫在 fatiao3d_quick、自動存檔那一格不變；
          重新整理 → 讀取 →「快速存檔（右上 💾）」那一格（只有讀取鈕）讀得回來；欄位 1 存檔／讀取照舊；標題「繼續（自動存檔）」照舊
  cap     ④ 有進度 → 連按開新遊戲 4 次（每次玩到自動存檔、重新整理）→ fatiao3d_backup_new_* 最多 3 份，原本那一份（進度最多）還在
  pre     ⑤ 修正前（92e9bca92）照 new（btnNewLaw）做一次＝原本進度讀不到（照預期 FAIL）
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=… [BTN=…] python3 savebak_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
MODE = os.environ.get('MODE', 'new'); BTN = os.environ.get('BTN', 'btnNewLaw')
J = lambda o: json.dumps(o, ensure_ascii=False)
KEYS = """(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(!/^fatiao3d_/.test(k)||k==='fatiao3d_settings') continue; let s=null; try{ s=JSON.parse(localStorage.getItem(k)); }catch(e){} o[k]=s&&typeof s==='object'?{day:s.day,hour:s.hour==null?null:+(+s.hour).toFixed(2),zone:s.zone,savedAt:s.savedAt,label:s.backupLabel||null}:null; } return o; })()"""
STATE = "(()=>({day:GAME.G.day,hour:+(+GAME.G.hour).toFixed(2),zone:GAME.G.zone,stage:GAME.G.stage||null}))()"
ITEMS = """(sel=>[...document.querySelectorAll(sel+' .item')].map((it,i)=>({i, b:((it.querySelector('b')||{}).textContent||'').trim(), t:(it.innerText||'').replace(/\\n/g,'｜').slice(0,160), btns:[...it.querySelectorAll('button')].map(x=>x.textContent.trim())})))"""
BTNXY = """(([sel,i,txt])=>{ const it=document.querySelectorAll(sel+' .item')[i]; if(!it) return null; const b=[...it.querySelectorAll('button')].find(x=>x.textContent.trim()===txt); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"""


async def boot(pg):
    await pg.goto(URL); ok = await L.wait_loaded(pg)
    await pg.wait_for_timeout(1500); return ok


async def make_progress(pg, run):
    """【前置】使用者存檔讀進來，用遊戲自己的 GAME.autosave 存進自動存檔那一格"""
    await L.load_state(pg, json.loads(json.dumps(SAVE)), quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(5000)
    await pg.evaluate("(()=>{ GAME.titleIdle=false; GAME.autosave(true); })()"); await pg.wait_for_timeout(800)
    k = await pg.evaluate(KEYS); st = await pg.evaluate(STATE)
    run.setup('[前置] 使用者存檔讀進來、GAME.autosave 存一次（有進度的玩家）：%s；localStorage %s' % (J(st), J(k)))
    return st, k


async def quick_save(pg, cdp, run):
    n0 = await pg.evaluate("document.querySelectorAll('.toast,#toast').length")
    await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(900)
    vis = await pg.evaluate("(()=>{ const b=document.getElementById('btnQuickSave'); return !!b&&!!b.offsetParent; })()")
    if vis: await L.tap(pg, cdp, '#btnQuickSave'); await pg.wait_for_timeout(1200)
    toast = await pg.evaluate("(()=>{ const t=document.getElementById('toast'); return t?(t.textContent||'').trim():''; })()")
    run.note('💾 →「快速存檔」（按鈕看得到 %s）：提示「%s」' % (vis, toast))
    return toast


async def play_until_autosave(pg, cdp, run, saved0, max_s=420):
    """開新遊戲以後照玩家點對話、選第一個，直到自動存檔那一格被新遊戲寫過（savedAt 變了）"""
    t0 = time.time(); n = 0
    while time.time() - t0 < max_s:
        k = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'); return s?{savedAt:s.savedAt,day:s.day,zone:s.zone}:null; }catch(e){ return null; } })()")
        if k and k.get('savedAt') != saved0 and await pg.evaluate("!!(GAME.G&&GAME.running)"):
            run.note('新遊戲寫了自動存檔：%s（點了 %d 下）' % (J(k), n)); return k
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); n += 1; await pg.wait_for_timeout(500); continue
        if s['choices']: await L.tap(pg, cdp, '#choices button'); n += 1; await pg.wait_for_timeout(900); continue
        await pg.wait_for_timeout(800)
    run.note('%d 秒內自動存檔沒有被新遊戲寫過' % max_s); return None


async def open_load_menu(pg, cdp):
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1800)
    return await pg.evaluate(ITEMS + "('#saveSlots')"), await pg.evaluate(ITEMS + "('#saveBackups')")


async def tap_item(pg, cdp, sel, i, txt='讀取'):
    xy = await pg.evaluate(BTNXY, [sel, i, txt])
    if not xy: return False
    await L.touch_tap(cdp, xy[0], xy[1]); return True


async def wait_game(pg, max_s=90):
    t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate("!!(GAME.G&&GAME.running&&document.getElementById('titleScreen').classList.contains('hide'))"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(4000); return await pg.evaluate(STATE)


def same(a, b): return bool(a) and bool(b) and a['day'] == b['day'] and a['zone'] == b['zone'] and abs((a['hour'] or 0) - (b['hour'] or 0)) < 0.2


async def new_game_once(pg, cdp, run, btn, tag):
    """重新整理 → 標題按開新遊戲 → 玩到自動存檔 → 重新整理。回傳 (localStorage 前、後)"""
    await boot(pg); k0 = await pg.evaluate(KEYS); a0 = (k0.get('fatiao3d_auto') or {}).get('savedAt')
    lab = await pg.evaluate("(id=>{ const b=document.getElementById(id); return b?{t:b.textContent.trim(),vis:!!b.offsetParent}:null; })(%s)" % J(btn))
    run.note('%s 標題按鈕 #%s：%s' % (tag, btn, J(lab)))
    await L.tap(pg, cdp, '#' + btn); await pg.wait_for_timeout(1500)
    k1 = await play_until_autosave(pg, cdp, run, a0)
    await run.shot(pg, '%s_newgame' % tag)
    await boot(pg); k2 = await pg.evaluate(KEYS)
    run.note('%s 開新遊戲以後的 localStorage：%s' % (tag, J(k2)))
    return k0, k2, k1


async def main():
    run = L.Run('savebak_%s%s' % (MODE, ('_' + BTN) if MODE == 'new' else ''), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        dlgs = []
        async def on_dialog(d):   # 瀏覽器的 confirm／alert：照玩家按「確定」（記下來；正常情況開新遊戲不會跳）
            dlgs.append(d.message); await d.accept()
        pg.on('dialog', lambda d: asyncio.ensure_future(on_dialog(d)))
        run.check('遊戲載入', await boot(pg)); await pg.evaluate("localStorage.clear()"); await boot(pg)
        orig, k_init = await make_progress(pg, run)

        if MODE in ('new', 'pre'):
            btn = BTN if MODE == 'new' else 'btnNewLaw'
            toast = await quick_save(pg, cdp, run)
            k_q = await pg.evaluate(KEYS); run.note('💾 以後的 localStorage：%s' % J(k_q))
            k0, k2, k1 = await new_game_once(pg, cdp, run, btn, MODE)
            run.check('前置：新遊戲寫了自動存檔（第一天）', bool(k1), J(k1))
            bk = {k: v for k, v in k2.items() if k.startswith('fatiao3d_backup_new_')}
            run.check('①-1 開新遊戲前把原本的自動存檔備份到 fatiao3d_backup_new_*（日子 %s）' % orig['day'], any(v and v['day'] == orig['day'] for v in bk.values()), J(bk))
            slots, backs = await open_load_menu(pg, cdp); await run.shot(pg, '%s_loadmenu' % MODE)
            run.note('存檔頁 #saveSlots：%s；#saveBackups：%s' % (J(slots), J(backs)))
            want = [x for x in backs if x['b'] == '備份：自動存檔（開新遊戲前）']
            run.check('② 存檔頁「備份」一區有「備份：自動存檔（開新遊戲前）」、有「讀取」', bool(want) and '讀取' in want[0]['btns'], J(backs))
            if MODE == 'new': run.check('② 也有「備份：快速存檔（開新遊戲前）」（開新遊戲前按過 💾）', any(x['b'] == '備份：快速存檔（開新遊戲前）' for x in backs), J(backs))
            got = None
            if want and await tap_item(pg, cdp, '#saveBackups', want[0]['i']): got = await wait_game(pg)
            run.note('讀那一筆備份以後：%s（原本 %s）' % (J(got), J(orig))); await run.shot(pg, '%s_restored' % MODE)
            run.check('①② 讀「備份：自動存檔（開新遊戲前）」＝回到原本的進度（日子、地點、時間一樣）', same(got, orig), J({'got': got, 'orig': orig}))

        elif MODE == 'quick':
            toast = await quick_save(pg, cdp, run)
            k_q = await pg.evaluate(KEYS)
            run.check('③ 💾 的提示「已快速存檔：…（選單 → 存檔 →「快速存檔」讀取）」', toast.startswith('已快速存檔') and '快速存檔」讀取' in toast, toast)
            run.check('③ 存在 fatiao3d_quick（日子 %s）' % orig['day'], (k_q.get('fatiao3d_quick') or {}).get('day') == orig['day'], J(k_q))
            run.check('③ 自動存檔那一格沒有被 💾 改寫（savedAt 一樣）', (k_q.get('fatiao3d_auto') or {}).get('savedAt') == (k_init.get('fatiao3d_auto') or {}).get('savedAt'), J({'前': k_init.get('fatiao3d_auto'), '後': k_q.get('fatiao3d_auto')}))
            # 欄位 1：遊戲裡打開選單 → 存檔 → 欄位 1「存檔」
            await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
            await L.tap(pg, cdp, '#menu [data-tab="save"]'); await pg.wait_for_timeout(900)
            slots = await pg.evaluate(ITEMS + "('#saveSlots')"); run.note('遊戲裡的存檔頁：%s' % J(slots))
            s1 = [x for x in slots if x['b'].startswith('欄位 1')]
            if s1: await tap_item(pg, cdp, '#saveSlots', s1[0]['i'], '存檔'); await pg.wait_for_timeout(1500)
            k_s = await pg.evaluate(KEYS)
            run.check('③ 欄位 1「存檔」照舊（fatiao3d_slot_1）', (k_s.get('fatiao3d_slot_1') or {}).get('day') == orig['day'], J(k_s.get('fatiao3d_slot_1')))
            qs = [x for x in slots if x['b'].startswith('快速存檔')]
            run.check('③ 存檔頁有「快速存檔（右上 💾）」那一格、只有「讀取」（沒有「存檔」）', bool(qs) and qs[0]['btns'] == ['讀取'], J(qs))
            for which, pick in (('快速存檔', lambda x: x['b'].startswith('快速存檔')), ('欄位 1', lambda x: x['b'].startswith('欄位 1')), ('自動存檔', lambda x: x['b'].startswith('自動存檔'))):
                await boot(pg); slots, backs = await open_load_menu(pg, cdp)
                it = [x for x in slots if pick(x)]; got = None
                if it and await tap_item(pg, cdp, '#saveSlots', it[0]['i']): got = await wait_game(pg)
                run.check('③ 重新整理 → 讀取「%s」＝原本的進度' % which, same(got, orig), J({'got': got, 'orig': orig, 'item': it[:1]}))
            await boot(pg); cont = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); return b?{t:b.textContent.trim(),vis:!!b.offsetParent}:null; })()")
            got = None
            if cont and cont['vis']: await L.tap(pg, cdp, '#btnContinue'); got = await wait_game(pg)
            run.check('③ 標題「繼續（自動存檔）」照舊＝原本的進度', same(got, orig), J({'btn': cont, 'got': got}))

        elif MODE == 'cap':
            hist = []
            for n, btn in enumerate(['btnNewLaw', 'btnNew', 'btnNewLaw', 'btnNew'], 1):   # btnNewEcon 只在網址 ?y0 才看得到（開發中），cap 用玩家看得到的兩個
                k0, k2, k1 = await new_game_once(pg, cdp, run, btn, 'cap%d' % n)
                bk = {k: v for k, v in k2.items() if k.startswith('fatiao3d_backup_new_')}; hist.append(bk)
                run.note('第 %d 次開新遊戲以後的備份：%s' % (n, J(bk)))
            last = hist[-1]
            run.check('④ 連按開新遊戲 4 次：fatiao3d_backup_new_* 最多 3 份', 0 < len(last) <= 3, J(last))
            run.check('④ 原本的進度（日子 %s，進度最多）那一份還在（刪的是進度最少的）' % orig['day'], any(v and v['day'] == orig['day'] for v in last.values()), J(last))
            slots, backs = await open_load_menu(pg, cdp)
            run.note('存檔頁 #saveBackups：%s' % J(backs)); await run.shot(pg, 'cap_loadmenu')

        run.note('瀏覽器跳出的 confirm／alert：%s' % J(dlgs))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE, BTN)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
