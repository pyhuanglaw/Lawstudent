"""期末考（v9.10 第一項：遊戲裡的題目全部放進去，483 題）：大一上、大二上、大三上各考一科，從手機「直接去上課」走進考場、五題、交卷。
[前置／捷徑] 讀檔到那一科期末考那天 07:40 宿舍（GAME.applySave；旗標只放開場已經演過的那幾個，不改考試、題庫）。
手機模擬橫向、不用 ?turbo；選項照第一個選（只測流程，不測答對幾題）。
檢查：真的開考、題目 1／5～5／5 都出現、交卷有答對幾題和分數、紀錄 status done＋score；題目和選項上沒有「來源」「AI_」「Q0xx」之類的內部字；沒有 JS 例外。
用法：python3 tests/flow_exam_terms.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_exam_terms'
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1}
TERMS = [('Y1S1', '憲法'), ('Y2S1', None), ('Y3S1', None)]
FIND = """((a)=>{ const [tid,want]=a; const r=CALENDAR.termDays(tid); for(let d=r.from; d<=r.to+14; d++){ const its=CLS.dayItems({day:d,hour:8,flags:{},stage:'law'}).filter(it=>it.exam==='final'&&CLS.isExamCourse(it.c)&&(!want||it.c.name.includes(want))); if(its.length){ const it=its[0]; return {day:d,key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,wd:CALENDAR.dateOf(d).wd%7,date:CALENDAR.dateOf(d).key}; } } return null; })"""


async def run_term(pg, cdp, run, tid, want):
    f = await pg.evaluate(FIND + '(' + json.dumps([tid, want]) + ')')
    run.check(tid + '：找得到考五題的期末考', bool(f), json.dumps(f, ensure_ascii=False))
    if not f: return
    run.setup('%s 讀檔到 %s 07:40 宿舍（%s 期末考那天）' % (tid, f['date'], f['name']))
    flags = dict(BASE)
    if tid != 'Y1S1': flags.update({'ROOM_Y2': True})
    if tid == 'Y3S1': flags.update({'ROOM_Y3': True})
    await L.load_state(pg, {'zone': 'dorm', 'hour': 7.67, 'day': f['day'], 'weekday': f['wd'], 'weather': 'sunny', 'stage': 'law', 'flags': flags})
    await pg.wait_for_timeout(2500)
    # 起床選單或開場對話：選「直接去上課」那一類，沒有就把對話點掉
    texts = []; t0 = time.time(); went = False
    while time.time() - t0 < 900:
        rec = await pg.evaluate("(k=>{ const R=CLS.rec(GAME.G); const e=R.exam||{}; const hit=Object.keys(e).find(x=>x.includes(k)); return hit?e[hit]:null; })(" + json.dumps(f['cid']) + ")")
        if rec and rec.get('status') in ('done', 'insufficient') and not await pg.evaluate("GAME.D.active||GAME.E.player.busy"): break
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; const e=bs.find(x=>/直接去上課|去上課|期末考/.test(x.textContent))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent]; })()")
            if c:
                texts.append('▶' + c[2][:40])
                if len([t for t in texts if t.startswith('▶')]) == 1 or '1／5' in ''.join(texts[-3:]): await run.shot(pg, tid + '_choice')
                await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            t = s['dtext'] or ''
            if not texts or texts[-1] != t[:60]:
                texts.append(t[:60])
                if '1／5' in t: await run.shot(pg, tid + '_q1')
            await L.tap(pg, cdp, '#dlg')
        elif s.get('paused') and await L.phone_away(pg, cdp):
            texts.append('［手機自己跳出來 → 收起來／跳過］')   # D103：要回的訊息到了手機自己打開、遊戲暫停（2026-10-21 v9.10.3 發布前：這支卡在大二上的期末考那天）
        elif not went:
            # 沒有劇情的時候：打開手機「今天」，按那一科的「直接去上課」
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
            b = await pg.evaluate("(k=>{ const e=document.querySelector('[data-go=\"'+k+'\"]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent]; })(" + json.dumps(f['key']) + ")")
            if b: texts.append('📱' + b[2]); await L.touch_tap(cdp, b[0], b[1]); went = True
            else: await L.close_panels(pg, cdp)
        await pg.wait_for_timeout(600)
    rec = await pg.evaluate("(k=>{ const R=CLS.rec(GAME.G); const e=R.exam||{}; const hit=Object.keys(e).find(x=>x.includes(k)); return hit?Object.assign({key:hit},e[hit]):null; })(" + json.dumps(f['cid']) + ")")
    await run.shot(pg, tid + '_after')
    qs = [t for t in texts if '／5' in t and '題目' not in t]
    run.check(tid + ' ' + f['name'] + '：真的開考（不是題庫不足）、五題都出現', bool(rec) and rec.get('status') == 'done' and all(('%d／5' % i) in ''.join(texts) for i in range(1, 6)), json.dumps(rec, ensure_ascii=False)[:300] + ' ' + json.dumps(texts[-14:], ensure_ascii=False))
    run.check(tid + '：交卷有答對幾題、紀錄有分數', any('交卷。答對' in t for t in texts) and rec and isinstance(rec.get('score'), (int, float)), str(rec and rec.get('score')))
    leak = [t for t in texts if any(w in t for w in ('來源', 'AI_', 'CROSS_REVIEW', 'Q0', 'exam_ai', 'undefined'))]
    run.check(tid + '：題目、選項、對話沒有內部字（來源、AI_、Q0xx、undefined）', not leak, json.dumps(leak[:3], ensure_ascii=False))


async def main():
    run = L.Run('flow_exam_terms', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        for tid, want in TERMS:
            await run_term(pg, cdp, run, tid, want)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
