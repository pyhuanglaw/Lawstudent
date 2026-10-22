"""BB（帳號 A）2026-10-22：AA380-RENAME-ALISON-1021（LAWWW 07:49 列的 v9.10.5 第 1 項；開發分支 c617b2e0 起）——「小語」改名 Alison：新局和舊存檔各看一段，
畫面（對話框的名字和台詞、字幕、選項、提示）、手機（訊息列表、對話串、朋友＝人物頁、活動、相簿、今天）、選單（筆記）都沒有「小語」。
  NEWGAME  標題「從法律系開始」→ 照玩家演（對話點下去、選項點第一個、出發的提示按出發）到可以自由走動、或演到 2025-08-25；
           一路記下對話框的名字和台詞、字幕、選項、提示；最後打開手機各分頁、選單的筆記，記下看得到的字
  OLDSAVE  讀使用者存檔（舊局，存的是改名以前的資料）→ 不改日期；手機各分頁、每一個對話串、選單的筆記，記下看得到的字；
           另外記遊戲狀態（GAME.G）裡還有沒有「小語」（存檔資料，玩家看不到，只記錄）
不瞬移、不改劇情狀態（OLDSAVE 只讀檔）。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=NEWGAME,OLDSAVE python3 alison_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or ['NEWGAME', 'OLDSAVE']
OLD = '小語'
def say(*a): print(' '.join(str(x) for x in a), flush=True)
# 對話框、字幕、提示、選項：畫面上出現過的字都記（MutationObserver），同一段不重複記
INIT = r"""(()=>{ window.__seen=[]; const last={}; const rec=(k,t)=>{ t=String(t||'').replace(/\s+/g,' ').trim(); if(!t||last[k]===t) return; last[k]=t; let d=''; try{ d=CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){} window.__seen.push({k,t,d}); };
  const watch=(id,k)=>{ const e=document.getElementById(id); if(!e) return false; new MutationObserver(()=>{ rec(k, k==='dlg'?(((document.getElementById('dlgName')||{}).textContent||'')+'｜'+(e.textContent||'')):e.textContent); }).observe(e,{childList:true,subtree:true,characterData:true}); return true; };
  const arm=()=>{ watch('dlgText','dlg'); watch('caption','caption'); watch('toast','toast'); watch('choices','choices'); watch('title3','title3'); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',arm); else arm(); })()"""
STATE = """(()=>{ const G=GAME.G; if(!G) return null; const d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, stage:G.stage}; })()"""
PHONE_TABS = ['today', 'week', 'places', 'events', 'msg', 'friends', 'album']


async def phone_texts(pg, cdp, tag, run):
    """手機每一個分頁＋訊息裡每一個對話串看得到的字"""
    out = {}
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    for t in PHONE_TABS:
        await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(t)); await pg.wait_for_timeout(700)
        out[t] = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')")
        if t == 'msg':
            ths = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-th]')].map(b=>b.dataset.th)")
            for th in ths[:40]:
                await pg.evaluate("(th=>{ const b=[...document.querySelectorAll('#phoneBody [data-th]')].find(x=>x.dataset.th===th); if(b) b.click(); })(%s)" % json.dumps(th)); await pg.wait_for_timeout(500)
                out['msg:' + th] = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')")
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
        if t in ('msg', 'friends'): await run.shot(pg, '%s_phone_%s' % (tag, t))
    await L.phone_away(pg, cdp)
    # 選單（筆記、說明）
    if await pg.evaluate("!!document.getElementById('btnMenu')"):
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
        out['menu_notes'] = await pg.evaluate("((document.getElementById('tab-notes')||{}).innerText||'')")
        await run.shot(pg, '%s_menu_notes' % tag)
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(500)
    return out


def hits(d):
    return {k: [ln for ln in v.split('\n') if OLD in ln][:5] for k, v in d.items() if OLD in v}


async def newgame(p, run, out):
    res = out.setdefault('NEWGAME', {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.add_init_script(INIT); await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        if not await pg.evaluate("Array.isArray(window.__seen)"): await pg.evaluate(INIT)
        await L.tap(pg, cdp, '#btnNewLaw'); say('   NEWGAME：標題「從法律系開始」')
        t0 = time.time(); idle = 0; last = None; picks = 0
        while time.time() - t0 < 1500:
            if not await pg.evaluate("!!GAME.G&&GAME.running"): await pg.wait_for_timeout(800); continue
            st = await pg.evaluate(STATE)
            if st and st['key'] != last: last = st['key']; say('   [%5.1f 分] %s' % ((time.time() - t0) / 60, json.dumps(st, ensure_ascii=False))); await run.shot(pg, 'NEWGAME_%s' % st['key'])
            if st and st['key'] >= '2025-08-25': break
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
            s = await L.state(pg)
            if s['choices']:
                ops = await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled).map(b=>b.textContent.trim())")
                if ops:
                    k = next((i for i, o in enumerate(ops) if o.startswith(('出發', '直接去', '接起來'))), 0); picks += 1
                    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled)[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
                    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); idle = 0; continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); idle = 0; continue
            if s.get('busy'): await pg.wait_for_timeout(700); continue
            idle += 1
            if idle >= 12: break   # 沒有對話、選項：可以自由走動了
            await pg.wait_for_timeout(1000)
        st = await pg.evaluate(STATE); res['end'] = st; await run.shot(pg, 'NEWGAME_free')
        seen = await pg.evaluate("window.__seen||[]"); res['seen_n'] = len(seen)
        alison = [x for x in seen if 'Alison' in x['t']]; old = [x for x in seen if OLD in x['t']]
        res['alison'] = alison[:10]; res['old'] = old[:10]
        say('   NEWGAME 演到 %s；畫面上的字 %d 段，有 Alison 的 %d 段、有「小語」的 %d 段' % (json.dumps(st, ensure_ascii=False), len(seen), len(alison), len(old)))
        for x in alison[:6]: say('     Alison：%s %s' % (x['d'], x['t'][:80]))
        run.check('NEWGAME：從法律系開始演到可以自由走動（%s）' % (st or {}).get('key'), bool(st) and st['stage'] == 'law', json.dumps(st, ensure_ascii=False))
        run.check('NEWGAME：一路上對話框、字幕、提示、選項沒有「%s」（%d 段）' % (OLD, len(seen)), not old, json.dumps(old[:5], ensure_ascii=False))
        run.note('NEWGAME：這一段有 Alison 出現的地方 %d 處（第一處：%s）' % (len(alison), json.dumps(alison[:1], ensure_ascii=False)))
        ph = await phone_texts(pg, cdp, 'NEWGAME', run); res['phone'] = {k: v[:600] for k, v in ph.items()}
        hh = hits(ph); res['phone_hits'] = hh
        run.check('NEWGAME：手機各分頁、每一個對話串、選單的筆記沒有「%s」' % OLD, not hh, json.dumps(hh, ensure_ascii=False)[:400])
        gj = await pg.evaluate("JSON.stringify(GAME.G).split('%s').length-1" % OLD); res['g_hits'] = gj
        run.note('NEWGAME：遊戲狀態（GAME.G，玩家看不到）裡「%s」出現 %d 次' % (OLD, gj))
        res['errs'] = errs[:3]; run.check('NEWGAME：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('NEWGAME：測試跑完', False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def oldsave(p, run, out):
    res = out.setdefault('OLDSAVE', {})
    base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base)
    raw = json.dumps(G, ensure_ascii=False); res['save_hits'] = raw.count(OLD)
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.add_init_script(INIT); await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, G); await pg.wait_for_timeout(6000)
        st = await pg.evaluate(STATE); res['st'] = st
        run.setup('[前置] OLDSAVE：讀使用者存檔（舊局，日期、地點都不改；存檔裡「%s」出現 %d 次）→ %s' % (OLD, raw.count(OLD), json.dumps(st, ensure_ascii=False)))
        for _ in range(20):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if s['choices']:
                c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); const e=b.find(x=>/^(不去了|先不要|今天先不要|先不接|就這樣)/.test(x.textContent.trim()))||b[b.length-1]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800); continue
            break
        await run.shot(pg, 'OLDSAVE_load')
        ph = await phone_texts(pg, cdp, 'OLDSAVE', run); res['phone'] = {k: v[:600] for k, v in ph.items()}
        hh = hits(ph); res['phone_hits'] = hh
        run.check('OLDSAVE：手機各分頁（今天、課表、地點、活動、訊息、朋友＝人物頁、相簿）、每一個對話串、選單的筆記沒有「%s」' % OLD, not hh, json.dumps(hh, ensure_ascii=False)[:400])
        al = {k: [ln for ln in v.split('\n') if 'Alison' in ln][:3] for k, v in ph.items() if 'Alison' in v}; res['alison'] = al
        run.note('OLDSAVE：看得到 Alison 的地方：%s' % json.dumps(al, ensure_ascii=False)[:400])
        seen = await pg.evaluate("window.__seen||[]"); old = [x for x in seen if OLD in x['t']]; res['seen_old'] = old[:5]
        run.check('OLDSAVE：讀檔以後畫面上出現過的對話、字幕、提示、選項沒有「%s」' % OLD, not old, json.dumps(old[:5], ensure_ascii=False))
        gj = await pg.evaluate("JSON.stringify(GAME.G).split('%s').length-1" % OLD); res['g_hits'] = gj
        run.note('OLDSAVE：存檔裡「%s」%d 次 → 讀檔以後遊戲狀態（GAME.G，玩家看不到）%d 次' % (OLD, raw.count(OLD), gj))
        res['errs'] = errs[:3]; run.check('OLDSAVE：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('OLDSAVE：測試跑完', False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def main():
    run = L.Run('alison', OUT); out = {}
    async with async_playwright() as p:
        for sid in SCEN:
            say('== %s' % sid); t0 = time.time()
            await (newgame if sid == 'NEWGAME' else oldsave)(p, run, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'alison.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
