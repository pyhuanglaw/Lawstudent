"""CC（帳號 A）11-02 BB 22:05：舊存檔 CG 補記（ADV.backfillCG，開發分支 62d98bfa5 的 1f13db45d）瀏覽器探針。
不是 iPhone：Playwright 手機橫向模擬（844×390、is_mobile、CDP 觸控；SwiftShader 1～4 fps）。

讀碼看到的規則（62d98bfa5）：
- src/adv3d.js:105 A.CG_SEEN_FLAGS＝{AN_VDAY_CG→cg_valentine_taichung_heroine01（以安台中情人節）, YT_CG20→cg_saved_seat_heroine03（語彤斜對面的位子）,
  PS_WHITE_CG→cg_last_page_peishan（沛珊白色情人節最後一頁）}；adv3d.js:106 A.backfillCG(s)：旗標＝true 才補、已經有的不重複加（includes）。
- src/game3d.js:353 migrate() 讀檔時呼叫 ADV.backfillCG(s)（每次讀檔都跑，靠 includes 不重複）；game3d.js:355 s.v=SAVE_VER——
  存檔版本號沒有變：SAVE_VER 仍是 2（game3d.js:4；ef63b1877 也是 2），補記不靠版本號。
- 相簿：手機「相簿」頁籤（index.html #phoneTabs data-ptab="album"）→ game3d.js:599 albumHTML：G.cg.unlocked 裡 CG_REGISTRY 有登錄的，
  每張一個 .alb（background-image＝CG_REGISTRY[id].file，.cap＝title）。三張在 ef63 的 CG_REGISTRY 就有登錄（只差沒補記）。
- 從標題讀檔：#btnLoadMenu → #saveSlots 欄位 N 的「讀取」→ loadFrom → applySave（validate＋migrate）。

流程（一個瀏覽器）：
  [前置] 讀檔（GAME.applySave，安靜模式）到 2026-03-20 21:00 宿舍，GAME.snapshot() 當「舊版存檔」的底（v＝2），cg.unlocked＝[]；
    A＝加上 AN_VDAY_CG、YT_CG20、PS_WHITE_CG＝true；B＝三個旗標都沒有。localStorage 寫進欄位 1（A）、欄位 2（B），清掉自動存檔，重新整理。
  ①（玩家）標題「讀取／匯入存檔」→ 欄位 1「讀取」→ G.cg.unlocked 有三張；手機 → 相簿 → DOM 有三張（標題、圖檔）。
  ③（玩家）選單 → 存檔 → 欄位 3「存檔」（新版存檔）→ localStorage 欄位 3 每張各一次；重新整理 → 標題讀欄位 3 → 每張還是各一次、張數不變（不重複補）。
  ②（玩家）重新整理 → 標題讀欄位 2（沒有旗標）→ G.cg.unlocked 沒有這三張；相簿 DOM 也沒有。
判斷讀遊戲狀態（GAME.G.cg.unlocked、localStorage 的存檔 JSON）；相簿 DOM 只確認玩家看得到。
用法：LW_TESTS=<受測工作樹>/tests SHA=<sha> python3 cc_backfillcg_probe.py <URL index.html> <輸出資料夾>
最後一行 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, asyncio, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
CG = {'AN_VDAY_CG': ('cg_valentine_taichung_heroine01', '台中的情人節', 'assets/cg/heroine_01/cg_valentine_taichung.webp'),
      'YT_CG20': ('cg_saved_seat_heroine03', '斜對面的位子', 'assets/cg/heroine_03/cg_saved_seat.webp'),
      'PS_WHITE_CG': ('cg_last_page_peishan', '最後一頁', 'assets/cg/classmate_peishan/cg_last_page.webp')}
IDS = [v[0] for v in CG.values()]
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
CGJS = "(()=>{ const G=GAME.G; return {cg:(G&&G.cg&&G.cg.unlocked)||null, v:G&&G.v, day:G&&G.day, key:G&&CALENDAR.dateOf(G.day).key, zone:G&&G.zone, flags:G?{AN_VDAY_CG:G.flags.AN_VDAY_CG||null,YT_CG20:G.flags.YT_CG20||null,PS_WHITE_CG:G.flags.PS_WHITE_CG||null}:null, hasBackfill:typeof ADV!=='undefined'&&typeof ADV.backfillCG==='function'}; })()"
ALBUMJS = "[...document.querySelectorAll('#phoneBody .alb')].map(e=>({cap:((e.querySelector('.cap')||{}).textContent||'').trim(), bg:e.style.backgroundImage||''}))"


async def title_load(pg, cdp, run, slot):
    """玩家：標題畫面「讀取／匯入存檔」→ 欄位 N 的「讀取」"""
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
    c = await pg.evaluate("""(n=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>(x.querySelector('b')||{}).textContent==='欄位 '+n); if(!it) return null;
      const b=[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)""" % slot)
    if not c:
        run.note('標題讀檔：找不到欄位 %d 的「讀取」' % slot); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(240):
        ok = await pg.evaluate("document.getElementById('titleScreen').classList.contains('hide')&&!!GAME.G&&!!GAME.E&&!!GAME.E.player")
        if ok: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(5000)
    run.note('標題 → 讀取欄位 %d（觸控）' % slot)
    return True


async def calm(pg, cdp, secs=20):
    """讀進來以後跳出來的對話、選單、手機：像玩家一樣點掉（選項點最後一個＝多半是「算了／晚一點」），最多 secs 秒"""
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s.get('choices'):
            c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[b.length-1]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800); continue
        if s.get('dlg'): await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await L.phone_away(pg, cdp)
        if not s.get('busy'): break
        await pg.wait_for_timeout(600)


async def album(pg, cdp, run, tag):
    """玩家：手機 → 相簿；回傳 .alb 清單"""
    await L.close_panels(pg, cdp)
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="album"]'); await pg.wait_for_timeout(1200)
    a = await pg.evaluate(ALBUMJS)
    await run.shot(pg, 'album_' + tag)
    await L.close_panels(pg, cdp)
    return a


def has3(a):
    return {cid: any(x['cap'] == t and f in x['bg'] for x in a) for _, (cid, t, f) in CG.items()}


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('cc_backfillcg', OUT)
    print('cc_backfillcg_probe  SHA=%s  URL=%s' % (SHA, URL), flush=True)
    t0 = time.time()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        try:
            await pg.goto(URL)
            if not run.check('遊戲載入', await L.wait_loaded(pg, 300)): raise SystemExit
            d = await pg.evaluate("(()=>{ const d=STORY.dayOfKey('2026-03-20'); const w=CALENDAR.dateOf(d).wd; return {d, wd:w===7?0:w}; })()")
            st = {'name': '祐廷', 'day': d['d'], 'weekday': d['wd'], 'hour': 21.0, 'zone': 'dorm', 'pos': None, 'stage': 'law', 'weather': 'clear', 'money': 30000, 'flags': dict(BASEF)}
            await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(4000)
            base = await pg.evaluate("(()=>{ const s=GAME.snapshot(); return JSON.parse(JSON.stringify(s)); })()")
            base['cg'] = {'unlocked': []}
            for k in CG: base['flags'].pop(k, None)
            A = copy.deepcopy(base); A['flags'].update({k: True for k in CG})
            B = copy.deepcopy(base)
            run.setup('[前置] 舊版存檔：2026-03-20 21:00 宿舍（GAME.snapshot，v=%s），cg.unlocked=[]；欄位 1＝有 AN_VDAY_CG、YT_CG20、PS_WHITE_CG；欄位 2＝三個旗標都沒有；寫進 localStorage、清掉自動存檔、重新整理' % base.get('v'))
            await pg.evaluate("([a,b])=>{ localStorage.removeItem('fatiao3d_auto'); localStorage.removeItem('fatiao3d_quick'); localStorage.removeItem('fatiao3d_slot_3'); localStorage.setItem('fatiao3d_slot_1',JSON.stringify(a)); localStorage.setItem('fatiao3d_slot_2',JSON.stringify(b)); }", [A, B])
            await pg.reload(); await L.wait_loaded(pg, 300)
            await L.no_phone_auto(pg)

            # ① 有旗標的舊存檔
            await title_load(pg, cdp, run, 1)
            g = await pg.evaluate(CGJS)
            run.note('欄位 1 讀進來：' + J(g))
            run.check('①-1 有旗標的舊存檔從標題讀進來：G.cg.unlocked 有三張（%s）' % '、'.join(IDS), bool(g['cg']) and all(i in g['cg'] for i in IDS), J(g))
            run.check('①-2 存檔版本號照舊（G.v＝2，沒有因補記改版本）', g['v'] == 2, J({'v': g['v']}))
            await calm(pg, cdp)
            a = await album(pg, cdp, run, 'slot1')
            h = has3(a)
            run.check('①-3 手機「相簿」看得到三張（標題＋圖檔）', all(h.values()), J({'有': h, '相簿': a}))

            # ③ 存成新版再讀：不重複
            await L.close_panels(pg, cdp)
            await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1000)
            await L.tap(pg, cdp, '#menu .tabs button[data-tab="save"]'); await pg.wait_for_timeout(1000)
            c = await pg.evaluate("""(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>(x.querySelector('b')||{}).textContent==='欄位 3'); if(!it) return null;
              const b=[...it.querySelectorAll('button')].find(x=>x.textContent==='存檔'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()""")
            if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
            s3 = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_slot_3')||'null'); return s?{v:s.v,cg:(s.cg||{}).unlocked||null}:null; }catch(e){ return 'ERR '+e; } })()")
            run.note('選單 → 存檔 → 欄位 3「存檔」（觸控%s）：%s' % ('' if c else '，找不到按鈕', J(s3)))
            cnt = lambda arr: {i: (arr or []).count(i) for i in IDS}
            run.check('③-1 用選單存到欄位 3 的新版存檔：三張各一次', isinstance(s3, dict) and all(v == 1 for v in cnt(s3['cg']).values()), J(s3))
            await L.close_panels(pg, cdp)
            await pg.reload(); await L.wait_loaded(pg, 300); await L.no_phone_auto(pg)
            await title_load(pg, cdp, run, 3)
            g3 = await pg.evaluate(CGJS)
            n_saved = len((s3 or {}).get('cg') or []) if isinstance(s3, dict) else -1
            run.check('③-2 新版存檔再讀一次：三張還是各一次、總張數不變（不重複補）', bool(g3['cg']) and all(v == 1 for v in cnt(g3['cg']).values()) and len(g3['cg']) == n_saved,
                      J({'讀進來': g3['cg'], '存檔裡': (s3 or {}).get('cg') if isinstance(s3, dict) else s3}))

            # ② 沒有旗標的舊存檔
            await pg.reload(); await L.wait_loaded(pg, 300); await L.no_phone_auto(pg)
            await title_load(pg, cdp, run, 2)
            g2 = await pg.evaluate(CGJS)
            run.note('欄位 2 讀進來：' + J(g2))
            run.check('②-1 沒有旗標的舊存檔：G.cg.unlocked 沒有這三張', g2['cg'] is not None and not any(i in g2['cg'] for i in IDS), J(g2))
            await calm(pg, cdp)
            a2 = await album(pg, cdp, run, 'slot2')
            h2 = has3(a2)
            run.check('②-2 相簿也沒有這三張', not any(h2.values()), J({'有': h2, '相簿': a2}))
            run.note('ADV.backfillCG 存在：%s' % g2['hasBackfill'])
        except SystemExit:
            pass
        except Exception:
            run.check('流程沒有例外', False, traceback.format_exc()[-1500:])
        run.check('沒有 JS 錯誤（pageerror）', not errs, '; '.join(errs[:5]))
        await b.close()
    n = len(run.fails)
    print('用時 %d 秒' % (time.time() - t0))
    print('ALL PASS' if n == 0 else 'FAILED %d' % n, flush=True)
    sys.exit(0 if n == 0 else 1)


asyncio.run(main())
