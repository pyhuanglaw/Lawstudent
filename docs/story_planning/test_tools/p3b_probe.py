"""BB（帳號 A）2026-10-21：BB218-P3-1021 的 ② ⑤（LAWWW 81acfd1f）——①③④⑥ 看 aa300 ff 的紀錄（日期卡、手機自己打開、床邊選單、右上角日期）。
  ② 手機、筆記本打開時，黃色通知條（#toast）改到畫面下面，不蓋住手機的分頁列（#phoneTabs）
  ⑤ 手機訊息列表的未讀只算最近 14 天：讀 qa_play 存的經濟系 11/30 狀態，9/1 媽媽、8/25 第三小隊那種一兩個月前的舊訊息不再掛紅點（要回的照舊算待回覆）
[前置] 讀 qa_play 在真的玩法裡存的經濟系狀態（11/30）；[捷徑] ② 的通知條用 GAME.toast 叫出來（真的訊息進來時也是同一個 #toast）。
Playwright 手機橫向／直向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 p3b_probe.py '<URL>/index.html?turbo' <輸出資料夾> <11-30 狀態.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SNAPF = sys.argv[1], sys.argv[2], sys.argv[3]
PH_OPEN = "(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"
RECT = """(()=>{ const r=e=>{ if(!e) return null; const b=e.getBoundingClientRect(); return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)]; };
  const t=document.getElementById('toast'), tabs=document.getElementById('phoneTabs'), menu=document.getElementById('menu');
  const tr=r(t), tb=r(tabs); const over=(a,b)=>!!a&&!!b&&a[2]>0&&b[2]>0&&a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3];
  const tabsHit=tabs?[...tabs.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>{ const q=b.getBoundingClientRect(); const e=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2); return e===b||b.contains(e); }):[];
  return {toast:tr, toastVis:!!t&&!t.classList.contains('hide'), tabs:tb, overlap:over(tr,tb), tabsClickable:tabsHit, menuOpen:!!menu&&!menu.classList.contains('hide'), vh:innerHeight}; })()"""


async def main():
    run = L.Run('p3b', OUT); G = json.load(open(SNAPF, encoding='utf-8')); G = G.get('G', G); out = {}
    async with async_playwright() as p:
        for orient in ('landscape', 'portrait'):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orient == 'landscape'))
            await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
            await L.load_state(pg, G); await pg.wait_for_timeout(6000); run.setup('[前置] %s：讀經濟系 11/30 狀態 %s' % (orient, os.path.basename(SNAPF)))
            # 10-21 第一輪：讀檔後遊戲自己往下走（在家快轉），馬上演 12/13 補習班那一段，手機打不開——先照玩家把劇情點完、等到可以開手機
            # 第三輪除錯（scratchpad dbg/p3b_dbg.py）：讀檔 3 秒多以後，經濟系在家快轉到 23:00 停下來，手機自己打開（訊息列表，關閉鈕寫「跳過」），遊戲暫停等玩家；
            # 前兩輪腳本把它當成「沒開」，收起來＝按了「跳過」→ 快轉到 12/13 補習班那一段，之後手機當然打不開。這一輪就用它自己打開的手機（玩家真的會看到的那一刻）
            for k in range(60):
                if await pg.evaluate(PH_OPEN): break
                s = await L.state(pg)
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(500)
            sn0 = await pg.evaluate("(()=>{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); })()"); print('%s 手機自己打開：%s（%s）' % (orient, await pg.evaluate(PH_OPEN), sn0), flush=True)
            if not await pg.evaluate(PH_OPEN):
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
            ph1 = await pg.evaluate(PH_OPEN); print('%s 手機打開了：%s' % (orient, ph1), flush=True)
            c = await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
            th = await pg.evaluate("""(()=>{ const G=GAME.G; const T=PHONE.threads(G,{sys:true}); const now=G.day*24+G.hour; return T.map(t=>{ const ms=(G.msgs||[]).filter(m=>PHONE.th(m)===t.th&&m.from!=='player'); const last=ms[ms.length-1];
              return {th:t.th, title:PHONE.title?PHONE.title(G,t.th):t.th, unread:t.unread|0, pending:t.pending|0, last:last?CALENDAR.dateOf(last.day).key:null, ageDays:last?+((now-(last.day*24+(last.h||0)))/24).toFixed(1):null}; }); })()""")
            listTxt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
            await run.shot(pg, '%s_msglist' % orient)
            old_unread = [t for t in th if t['unread'] > 0 and t['ageDays'] is not None and t['ageDays'] > 14]
            raw = await pg.evaluate("""(()=>{ const G=GAME.G, P=PHONE.rec(G), ab=(d,h)=>d*24+(h||0), out={}; for(const m of (G.msgs||[])){ const th=PHONE.th(m); if(m.from==='player'||m.pin) continue;
              if(ab(m.day,m.h)>(P.seen&&P.seen[th]!=null?P.seen[th]:-1e9)) out[th]=(out[th]||0)+1; } return out; })()""")
            raw_old = {k: v for k, v in raw.items() if any(t['th'] == k and (t['ageDays'] or 0) > 14 for t in th)}
            print('%s ⑤ 對照：照修正前的算法（不管幾天前）還沒看過的：%s；其中超過 14 天的對話串 %s' % (orient, json.dumps(raw, ensure_ascii=False), json.dumps(raw_old, ensure_ascii=False)), flush=True)
            print('%s 訊息列表：%s' % (orient, json.dumps(th[:14], ensure_ascii=False)), flush=True)
            # ② 通知條：手機開著時叫出一個通知
            await pg.evaluate("GAME.toast('手機｜經濟系 大一（全班）｜（BB 測試）通知條位置',6000)"); await pg.wait_for_timeout(1500)
            r1 = await pg.evaluate(RECT); await run.shot(pg, '%s_phone_toast' % orient)
            await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(1000)
            # 沒開手機的時候：通知條照舊在上面
            await pg.evaluate("GAME.toast('（BB 測試）沒開手機時的通知條',6000)"); await pg.wait_for_timeout(1500)
            r0 = await pg.evaluate(RECT); await run.shot(pg, '%s_noPhone_toast' % orient)
            # 筆記本（選單）打開時
            opened = False
            for sel in ('#btnMenu', '#btnNote', '#btnNotes'):
                if await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel)):
                    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200); opened = True; break
            r2 = None
            if opened:
                await pg.evaluate("GAME.toast('（BB 測試）筆記本打開時的通知條',6000)"); await pg.wait_for_timeout(1500); r2 = await pg.evaluate(RECT); await run.shot(pg, '%s_menu_toast' % orient)
            out[orient] = {'threads': th, 'old_unread': old_unread, 'phone': r1, 'noPhone': r0, 'menu': r2}
            print('%s ② 手機開著：%s｜沒開：%s｜筆記本：%s' % (orient, json.dumps(r1), json.dumps(r0), json.dumps(r2)), flush=True)
            run.check('%s ② 手機開著時通知條在下面、不蓋分頁列（分頁按鈕都點得到）' % orient, r1['toastVis'] and not r1['overlap'] and all(r1['tabsClickable']) and r1['toast'][1] > r1['vh'] / 2, json.dumps(r1))
            run.check('%s ② 沒開手機時通知條照舊在上面' % orient, r0['toastVis'] and r0['toast'][1] < r0['vh'] / 2, json.dumps(r0))
            if r2: run.check('%s ② 筆記本開著時通知條在下面' % orient, r2['menuOpen'] and r2['toast'][1] > r2['vh'] / 2, json.dumps(r2))
            run.check('%s ⑤ 超過 14 天的舊訊息不掛未讀（要回的另外算；對照：修正前的算法這些串有 %d 則未讀）' % (orient, sum(raw_old.values())), not old_unread, json.dumps(old_unread, ensure_ascii=False))
            run.check('%s ② 這一輪手機真的打開了（不然 ② 手機開著那一項不算數）' % orient, bool(ph1), '')
            if orient == 'landscape':   # CG-APPROVED-MISSING-1021（4df34170）：兩張補接的 CG 登記了、圖讀得到（I：整合檢查；真的在劇情裡出現看 us_life 的 USH_home、尾聲另外跑）
                cg = await pg.evaluate("""(async()=>{ const out={}; for(const k of ['cg_sf_bridge_fog_heroine05','cg_reunion_window_table']){ const r=(typeof CG_REGISTRY!=='undefined')&&CG_REGISTRY[k]; if(!r){ out[k]=null; continue; }
                  const ok=await new Promise(res=>{ const im=new Image(); im.onload=()=>res([im.naturalWidth,im.naturalHeight]); im.onerror=()=>res(null); im.src=r.file; }); out[k]={file:r.file,title:r.title,size:ok}; } return out; })()""")
                print('CG 登記：%s' % json.dumps(cg, ensure_ascii=False), flush=True)
                run.check('CG-APPROVED-MISSING：BCG-48 與尾聲共通圖都登記、圖讀得到（I）', all(v and v.get('size') for v in cg.values()), json.dumps(cg, ensure_ascii=False))
            run.check('%s 沒有 JS 例外' % orient, not errs, json.dumps(errs[:3], ensure_ascii=False))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    json.dump(out, open(os.path.join(OUT, 'p3b.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
