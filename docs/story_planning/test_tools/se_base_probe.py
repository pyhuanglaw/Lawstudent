"""BB（帳號 A）2026-11-02：STUDY-EXAM-CAREER-1102 階段 0（修改前基準）B1 線——BB_222 第 2 節 SE-01、SE-07、FA-05、FA-01 的瀏覽器證據。
基準版本 a3b1bd647（修改前）。目的：錄下修改前的樣子（計畫寫的「修改前預期」），之後同一支探針在修改後的版本再跑一次。
  SE01：大一上第 15 週週日 2025-12-14 20:00 宿舍。宿舍書桌、手機「今天」、選單「法律」各看一次：有沒有「總複習」入口（修改前預期：沒有）。
  SE07：大一上第 10 週週三 2025-11-05 19:30 宿舍。先看「法律」頁 → 宿舍書桌自習 3 小時（第一個科目）→ 再看「法律」頁、「筆記」頁（修改前預期：筆記多了、法律頁沒變）。
  FA05：大一上 2025-09-24 15:00 系館B大廳（wancai），按公告欄「看公告」（修改前預期：lawclub 變 true、加入群組＝P0）。
  FA01：社員（lawclub、SIS_CLUB_EXPO、CLUB_lawclub_study）大二上 2026-10-24 08:10 宿舍，等到 08:35（修改前預期：出現「出發：法服值班」）。
【前置】讀使用者存檔改日期、時間、地點（quiet_events）；FA01 的社員旗標讀檔前寫進去。之後照玩家操作（走到書桌、按互動、點選項、開手機、開選單）。
Playwright 手機橫向模擬、?turbo（只縮短淡入淡出與走路），不是 iPhone。
用法：LW_TESTS=<工作樹>/tests SCEN=SE01,SE07,FA05,FA01 python3 se_base_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or ['SE01', 'SE07', 'FA05', 'FA01']
def say(*a): print(' '.join(str(x) for x in a), flush=True)
OPTS = "(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()"
INTER = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
LEGAL = "(()=>{ const b=document.getElementById('legalList'); return b?b.innerText:''; })()"
NOTES = "(()=>{ const b=document.getElementById('notesList'); return b?b.innerText:''; })()"
TODAY = "(()=>{ const b=document.getElementById('phone'); return b?b.innerText:''; })()"
STATE = "(()=>{ const G=GAME.G; return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, notes:(G.notes||[]).length, lawclub:G.flags.lawclub===undefined?null:G.flags.lawclub, groups:Object.keys((G.phone&&G.phone.groups)||{}).length}; })()"
OUTQ = "(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>q&&q.day>=GAME.G.day-1).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, h:q.h, state:q.state, title:q.title||''})))()"


async def launch(p, run, base, key, h, zone, flags=None, label=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    G['flags'].update(flags or {})
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(6000)
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events）；旗標 %s' % (label, key, h, zone, json.dumps(flags or {}, ensure_ascii=False)))
    return b, pg, cdp, errs


async def drain(pg, cdp, secs=60, prefer=None):
    """點掉對話；有選項就停下來回傳選項"""
    t0 = time.time()
    while time.time() - t0 < secs:
        o = await pg.evaluate(OPTS)
        if o: return o
        s = await L.state(pg)
        if s.get('dlg'): await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(700)
        if not s.get('busy'): return []
    return await pg.evaluate(OPTS)


async def tap_opt(pg, cdp, pred):
    c = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')'); const e=[...document.querySelectorAll('#choices button')].find(b=>f(b.textContent.trim())); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(pred))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return c[2]


async def to_inter(pg, cdp, run, pat, label):
    it = await pg.evaluate("(p=>{ const r=new RegExp(p); const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&r.test(String(i.label||''))); return it?[it.x,it.z,String(it.label)]:null; })(%s)" % json.dumps(pat))
    if not it: say('   ⚠ 找不到互動點 /%s/' % pat); return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, label, max_s=150)
    for k in range(6):
        lab = await pg.evaluate(INTER)
        if lab: break
        await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
    return it[2]


async def menu_tab(pg, cdp, run, tab, shot):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnMenu')||document.querySelector('[data-act=menu]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('[data-tab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(900)
    txt = await pg.evaluate(LEGAL if tab == 'legal' else NOTES)
    await run.shot(pg, shot)
    await pg.evaluate("(()=>{ const b=document.getElementById('btnClose'); if(b) b.click(); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'})); })()"); await pg.wait_for_timeout(700)
    return txt


async def phone_today(pg, cdp, run, shot):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ptab=today]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    txt = await pg.evaluate(TODAY); await run.shot(pg, shot)
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()"); await pg.wait_for_timeout(700)
    return txt


async def s_se01(p, run, base):
    b, pg, cdp, errs = await launch(p, run, base, '2025-12-14', 20.0, 'dorm', label='SE01 大一上第 15 週週日')
    seen = []
    t = await phone_today(pg, cdp, run, 'SE01_phone_today'); seen.append(('手機今天', t))
    lab = await to_inter(pg, cdp, run, '書桌', '宿舍書桌')
    o1 = await drain(pg, cdp, 40); seen.append(('書桌第一層', ' / '.join(o1)))
    await run.shot(pg, 'SE01_desk_menu')
    if o1:
        r = await tap_opt(pg, cdp, "/讀書|念書|唸書/.test(t)")
        o2 = await drain(pg, cdp, 30) if r else []; seen.append(('讀書第二層', ' / '.join(o2)))
        await run.shot(pg, 'SE01_desk_study_menu')
        if o2:
            r2 = await tap_opt(pg, cdp, "/小時/.test(t)")
            o3 = await drain(pg, cdp, 30) if r2 else []; seen.append(('讀書第三層', ' / '.join(o3)))
            await run.shot(pg, 'SE01_desk_subject_menu')
    lt = await menu_tab(pg, cdp, run, 'legal', 'SE01_menu_legal'); seen.append(('選單法律', lt))
    allt = '\n'.join(x[1] for x in seen)
    for k, v in seen: say('   [%s] %s' % (k, v[:300].replace('\n', '｜')))
    has = ('總複習' in allt) or ('一鍵' in allt and '複習' in allt)
    run.check('SE01 修改前預期：期末考前（第 15 週週日）找不到「總複習」入口（宿舍書桌、手機今天、選單法律）', not has, allt[:400])
    run.check('SE01 沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    await b.close()


async def s_se07(p, run, base):
    b, pg, cdp, errs = await launch(p, run, base, '2025-11-05', 19.5, 'dorm', label='SE07 大一上第 10 週週三')
    s0 = await pg.evaluate(STATE)
    l0 = await menu_tab(pg, cdp, run, 'legal', 'SE07_legal_before'); n0 = await menu_tab(pg, cdp, run, 'notes', 'SE07_notes_before')
    lab = await to_inter(pg, cdp, run, '書桌', '宿舍書桌')
    o1 = await drain(pg, cdp, 40); say('   書桌：%s' % ' / '.join(o1))
    picked = []
    if o1:
        r = await tap_opt(pg, cdp, "/讀書|念書|唸書/.test(t)"); picked.append(r)
        o2 = await drain(pg, cdp, 30); say('   讀書：%s' % ' / '.join(o2))
        r = await tap_opt(pg, cdp, "/3 ?小時/.test(t)") or await tap_opt(pg, cdp, "/小時/.test(t)"); picked.append(r)
        o3 = await drain(pg, cdp, 30); say('   科目：%s' % ' / '.join(o3))
        r = await tap_opt(pg, cdp, "!/整理|不讀|算了|取消/.test(t)"); picked.append(r)
        await drain(pg, cdp, 120)
    s1 = await pg.evaluate(STATE)
    l1 = await menu_tab(pg, cdp, run, 'legal', 'SE07_legal_after'); n1 = await menu_tab(pg, cdp, run, 'notes', 'SE07_notes_after')
    say('   選了：%s；前 %s；後 %s' % (picked, json.dumps(s0, ensure_ascii=False), json.dumps(s1, ensure_ascii=False)))
    say('   法律頁前：%s' % l0[:300].replace('\n', '｜')); say('   法律頁後：%s' % l1[:300].replace('\n', '｜'))
    run.check('SE07 自習真的做了（筆記數增加或時間前進 ≥1 小時）', s1['notes'] > s0['notes'] or (s1['h'] - s0['h']) >= 0.9, json.dumps([s0, s1], ensure_ascii=False))
    run.check('SE07 修改前預期：自習以後「法律」頁沒有反映（和自習前相同）', l0 == l1, 'before=%s｜after=%s' % (l0[:200], l1[:200]))
    run.check('SE07 沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    await b.close()


async def s_fa05(p, run, base):
    b, pg, cdp, errs = await launch(p, run, base, '2025-09-24', 15.0, 'wancai', flags={'lawclub': None, 'SIS_CLUB_EXPO': None}, label='FA05 大一上，沒去社博')
    s0 = await pg.evaluate(STATE)
    lab = await to_inter(pg, cdp, run, '公告', '公告欄')
    await drain(pg, cdp, 60); await run.shot(pg, 'FA05_after_notice')
    s1 = await pg.evaluate(STATE)
    say('   互動點：%s；前 %s；後 %s' % (lab, json.dumps(s0, ensure_ascii=False), json.dumps(s1, ensure_ascii=False)))
    run.check('FA05 找得到公告欄的互動', bool(lab), str(lab))
    run.check('FA05 修改前預期（P0）：只是看公告，lawclub 就變 true 或加入群組', bool(s1['lawclub']) or s1['groups'] > s0['groups'], json.dumps([s0, s1], ensure_ascii=False))
    run.check('FA05 沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    await b.close()


async def s_fa01(p, run, base):
    fl = {'lawclub': True, 'SIS_CLUB_EXPO': True, 'CLUB_lawclub_study': True}
    b, pg, cdp, errs = await launch(p, run, base, '2026-10-24', 8.17, 'dorm', flags=fl, label='FA01 社員，大二上值班週六')
    t0 = time.time(); seen = []
    while time.time() - t0 < 600:
        o = await pg.evaluate(OPTS); s = await pg.evaluate(STATE)
        if o:
            seen.append(' / '.join(o)); await run.shot(pg, 'FA01_prompt'); break
        st = await L.state(pg)
        if st.get('dlg'): await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if s['h'] >= 8.75: break
        await pg.wait_for_timeout(2000)
    q = await pg.evaluate(OUTQ); s = await pg.evaluate(STATE)
    say('   %s 選項：%s；OUT：%s' % (json.dumps(s, ensure_ascii=False), seen, json.dumps(q, ensure_ascii=False)[:600]))
    fafu = [x for x in q if str(x['id']).startswith('fafu')]
    run.check('FA01 修改前預期：值班週六排了法服出遊（OUT fafu_*）', bool(fafu), json.dumps(q, ensure_ascii=False)[:400])
    run.check('FA01 修改前預期：08:30 前後出現出發選單（出發：法服值班…）', any('法服' in x or '值班' in x for x in seen), json.dumps(seen, ensure_ascii=False))
    run.check('FA01 沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    await b.close()


async def s_se07s(p, run, base):
    """SE-07 ④：自習以後用選單「存檔」存到欄位 1 → 讀出那份存檔 → 開新的頁面讀進來 → 「法律」頁一樣（修改後才有意義）"""
    b, pg, cdp, errs = await launch(p, run, base, '2025-11-05', 19.5, 'dorm', label='SE07S 存讀檔後學習進度保留')
    lab = await to_inter(pg, cdp, run, '書桌', '宿舍書桌')
    if await drain(pg, cdp, 40):
        await tap_opt(pg, cdp, "/讀書|念書|唸書/.test(t)"); await drain(pg, cdp, 30)
        await tap_opt(pg, cdp, "/3 ?小時/.test(t)") or await tap_opt(pg, cdp, "/小時/.test(t)"); await drain(pg, cdp, 30)
        await tap_opt(pg, cdp, "!/整理|不讀|算了|取消/.test(t)"); await drain(pg, cdp, 120)
    l1 = await menu_tab(pg, cdp, run, 'legal', 'SE07S_legal_before_save')
    await pg.evaluate("(()=>{ const b=document.getElementById('btnMenu'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-tab=\"save\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    ok = await pg.evaluate("(()=>{ const btn=[...document.querySelectorAll('#saveSlots button')].find(x=>/存/.test(x.textContent)&&!/讀/.test(x.textContent)); if(!btn) return false; btn.click(); return true; })()")
    await pg.wait_for_timeout(1500); await run.shot(pg, 'SE07S_saved')
    snap = await pg.evaluate("(()=>{ try{ return localStorage.getItem('fatiao3d_slot_1'); }catch(e){ return null; } })()")
    await b.close()
    run.check('SE07S 用選單存到欄位 1（按得到「存」）', bool(ok) and bool(snap), str(ok))
    if not snap: return
    st = json.loads(snap); G = st.get('G', st)
    b2, ctx, pg2, cdp2, errs2 = await L.launch(p, landscape=True)
    await pg2.goto(URL); await L.wait_loaded(pg2); await pg2.evaluate("localStorage.clear()")
    await L.load_state(pg2, G, quiet_events=True); await pg2.wait_for_timeout(6000)
    run.setup('[前置] SE07S：把剛存的欄位 1 存檔讀進新的頁面（load_state）')
    l2 = await menu_tab(pg2, cdp2, run, 'legal', 'SE07S_legal_after_load')
    say('   存檔前：%s' % l1[:300].replace('\n', '｜')); say('   讀檔後：%s' % l2[:300].replace('\n', '｜'))
    run.check('SE07S 讀檔以後「法律」頁的學過／答對過和存檔前一樣', l1 == l2 and '學過' in l2, 'before=%s｜after=%s' % (l1[:200], l2[:200]))
    run.check('SE07S 沒有 JS 例外', not errs and not errs2, json.dumps((errs + errs2)[:3], ensure_ascii=False))
    await b2.close()


async def main():
    run = L.Run('se_base', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sc, fn in (('SE01', s_se01), ('SE07', s_se07), ('SE07S', s_se07s), ('FA05', s_fa05), ('FA01', s_fa01)):
            if sc not in SCEN: continue
            say('== %s' % sc)
            try: await fn(p, run, base)
            except Exception as e: run.check('%s 跑完（沒有探針例外）' % sc, False, repr(e)[:300])
    run.finish()

asyncio.run(main())
