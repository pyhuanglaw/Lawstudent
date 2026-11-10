"""CC（帳號 A）11-10：字幕第二句被上一句的計時器藏掉（BB 15:52 判 GAME_BUG P1；game3d.js caption() 內層 300 ms setTimeout 沒被下一句清掉）。修好以後新舊對照。
做法：【前置／捷徑】讀檔到校園（條件事件關掉）；直接呼叫 GAME.caption('小安','第一句',3000)，隔 gap 毫秒再呼叫 GAME.caption('小安','第二句',3000)，
之後每 200 ms 看 #caption 有沒有 hide、opacity（12 次＝2.4 秒）。gap＝3250／3300／3350／3500（playLines 每句等 3000＋300＝3300）。
另外照遊戲真正的路：STORY._day2.playLines(GAME, 兩句) 跑一次，記第二句顯示期間 #caption 看得到幾成。
判定：第二句出來以後的 2.4 秒內，看得到（沒有 hide、opacity>0.5）的比例要 ≥ 80%。舊版（有 bug）要 FAIL、新版要 PASS。Playwright ≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_caption_gap_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
R = L.Run('caption_gap_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
GAP = r"""(gap=>new Promise(res=>{ const el=document.getElementById('caption'); GAME.caption('小安','第一句',3000);
  setTimeout(()=>{ GAME.caption('小安','第二句',3000); const t0=performance.now(), seen=[]; const iv=setInterval(()=>{ const t=performance.now()-t0; if(t>2400){ clearInterval(iv); res({gap,text:el.innerText,seen}); return; } seen.push({t:Math.round(t),h:el.classList.contains('hide'),op:+getComputedStyle(el).opacity}); },200); }, gap); }))"""   # r2：只算第二句出來後 2.4 秒內的（雲端主執行緒慢，12 次取樣會拖過 3 秒、算到第二句自己正常消失）
PL = r"""(()=>new Promise(res=>{ const el=document.getElementById('caption'); const seen=[]; let t0=null;
  const iv=setInterval(()=>{ const txt=el.innerText||''; if(txt.includes('第二句')){ if(t0==null) t0=performance.now(); const t=performance.now()-t0; if(t>2400){ clearInterval(iv); res({seen}); return; } seen.push({t:Math.round(t),h:el.classList.contains('hide'),op:+getComputedStyle(el).opacity}); } },200);
  setTimeout(()=>{ clearInterval(iv); res({seen,timeout:true}); },12000);
  STORY._day2.playLines(GAME,[['小安','第一句'],['小安','第二句']]); }))()"""
vis = lambda seen: (sum(1 for q in seen if not q['h'] and q['op'] > 0.5) / len(seen)) if seen else 0.0


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 字幕 gap：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 campus 2025-09-20 16:00（條件事件關掉）；直接呼叫 GAME.caption')
        await D.load_zone(pg, cdp, 'campus', '2025-09-20', 16.0, wait=6000)
        for gap in (3250, 3300, 3350, 3500):
            r = await pg.evaluate(GAP, gap); v = vis(r['seen'])
            R.check('gap %d ms：第二句出來後 2.4 秒內看得到 %.0f%%（≥ 80%%）' % (gap, v * 100), v >= 0.8, J(r))
            await pg.wait_for_timeout(4000)
        r = await pg.evaluate(PL); v = vis(r['seen'])
        R.check('playLines（遊戲真正的路，兩句）：第二句看得到 %.0f%%（≥ 80%%）' % (v * 100), v >= 0.8 and not r.get('timeout'), J(r))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
