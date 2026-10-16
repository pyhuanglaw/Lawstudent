"""發布前的快速冒煙測試（使用者 2026-10-16：v9.8 起「快速安全檢查 → 正式發布 → 使用者試玩＋完整自動化回歸 → 修復版」）。
不取代 docs/TESTING.md 第五節的完整回歸（發布後照樣跑完）；只確認會讓使用者玩不下去的事：
  1. 標題 →「開始新的一天」→ 宿舍開場演完、恢復控制、搖桿走得動（對話與選項用觸控點）。
  2. 手機：每一個分頁都打得開、有內容；關得掉。
  3. 上課：第 9 天（週四）12:55 在霖澤館 201 門口 → 進 201 → 坐下「上課：民法總則」→ 上完、記出席；
     課後以安的報告分工（ev_an_report_split）有演——BUG-15（座位上課的課前／課後事件）的代表事件。
  4. 存讀檔：選單存到欄位 1 → 重新整理 → 標題「讀取」欄位 1 → 天數、地點、課表紀錄一樣；走得動。
  5. 全程沒有 JS 例外。
舊存檔（v7、v9.7）另外用 tests/save_compat_v7.py 對舊版的伺服器跑。
用 ?turbo（瞬間走位）——這是冒煙測試，不是真實玩家流程（真實流程在完整回歸）。
用法：python3 tests/smoke_release.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/smoke_release'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'
DAY1_THU = 9
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
REC_JS = "(()=>{ const R=(GAME.G.courses||{}); return {done:Object.keys(R.done||{}), attend:R.attend||{}, hour:+GAME.G.hour.toFixed(2), day:GAME.G.day, zone:GAME.G.zone}; })()"


async def first_choice(pg, max_s=60):
    for _ in range(int(max_s * 2)):
        t = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
        if t: return t
        await pg.wait_for_timeout(500)
    return ''


async def main():
    run = L.Run('smoke_release', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO)
        run.check('遊戲載入（標題畫面）', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        await run.shot(pg, 'title')
        # ---------- 1. 新遊戲 ----------
        run.check('標題畫面有「開始新的一天」', await L.tap(pg, cdp, '#btnNew'))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0, max_steps=120)
        intro = await pg.evaluate("!!GAME.G.flags.introDone")
        await run.shot(pg, 'new_game_dorm')
        run.check('新遊戲：宿舍開場演完、恢復控制', intro and s['zone'] == 'dorm' and not s['busy'], json.dumps(s, ensure_ascii=False))
        moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5)
        run.check('新遊戲：搖桿走得動', moved > 0.5, f'走了 {moved:.2f} m（推 {pushes} 次）')
        # ---------- 2. 手機 ----------
        run.check('打開手機', await L.tap(pg, cdp, '#btnPhone'))
        await pg.wait_for_timeout(1200)
        tabs = await pg.evaluate("[...document.querySelectorAll('#phoneTabs button')].map(b=>b.dataset.ptab)")
        bad = []
        for t in tabs:
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % t)
            txt = ''
            for _ in range(12):
                await pg.wait_for_timeout(500)
                on = await pg.evaluate("(document.querySelector('#phoneTabs button.on')||{dataset:{}}).dataset.ptab||''")
                txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
                if on == t and txt.strip(): break
            if not txt.strip(): bad.append(t)
        await run.shot(pg, 'phone')
        run.check('手機每個分頁都打得開、有內容（%s）' % '、'.join(tabs), len(tabs) >= 4 and not bad, '空的：' + '、'.join(bad))
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
        closed = await pg.evaluate("(()=>{ const e=document.getElementById('phone'); return !e||e.classList.contains('hide')||getComputedStyle(e).display==='none'; })()")
        run.check('手機關得掉', closed)
        # ---------- 3. 上課（BUG-15）----------
        run.setup('讀檔：第 9 天（9/25 週四）12:55，霖澤館二樓 201 門口；第一、二天主線已過')
        await L.load_state(pg, {'zone': 'linze', 'hour': 12.92, 'day': DAY1_THU, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        for _ in range(20):
            s = await L.state(pg)
            if s['interact'].startswith('進入 201'): break
            await pg.wait_for_timeout(1000)
        await run.shot(pg, 'linze_201_door')
        run.check('門口出現「進入 201」', s['interact'].startswith('進入 201'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            await pg.wait_for_timeout(1000)
            s = await L.state(pg)
            if s['zone'] == 'classroom' and not s['busy']: break
        run.check('進到 201', s['zone'] == 'classroom', json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'classroom')
        seat = await pg.evaluate("(()=>{ const ss=GAME.E.zone&&GAME.E.zone.seats; const s=ss&&ss.find(q=>q.row===2&&q.col===3); return s?{x:s.x,z:s.z}:null; })()")
        ok = bool(seat) and await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.45, '座位')
        run.check('走到座位旁邊', ok)
        s = await L.state(pg)
        run.check('出現「坐下」', s['interact'].startswith('坐下'), s['interact'])
        await L.tap(pg, cdp, '#interact')
        first = await first_choice(pg)
        run.check('坐下後第一個選項是「上課：民法總則」', first.startswith('上課：民法總則'), first)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
        rec = await pg.evaluate(REC_JS)
        run.check('上完課：記出席（民法總則 1 次）、時間到下課', any(':civ_general:' in k for k in rec['done']) and rec['attend'].get('civ_general') == 1 and rec['hour'] >= 15.15, json.dumps(rec, ensure_ascii=False))
        split = await pg.evaluate("!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_an_report_split)")
        run.check('BUG-15：坐在座位上課，課後以安的報告分工有演（ev_an_report_split）', split)
        await run.shot(pg, 'after_class')
        # ---------- 4. 存讀檔 ----------
        before = await pg.evaluate(REC_JS)
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔')[0]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        run.check('選單存到欄位 1', bool(await pg.evaluate("localStorage.getItem('fatiao3d_slot_1')")))
        await pg.reload()
        run.check('重新整理後載入', await L.wait_loaded(pg))
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[1]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(6000)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0, max_steps=40)
        after = await pg.evaluate(REC_JS)
        run.check('讀取欄位 1：天數、地點、課表紀錄一樣', after['day'] == before['day'] and after['zone'] == before['zone'] and sorted(after['done']) == sorted(before['done']) and after['attend'] == before['attend'], f'{before} → {after}')
        moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5)
        run.check('讀檔後搖桿走得動', moved > 0.5, f'走了 {moved:.2f} m')
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

sys.exit(asyncio.run(main()))
