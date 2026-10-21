"""BB（帳號 A）2026-10-21：DONE-B01（AA 的 P0：課堂提問＋重新匯入；LAWWW 指定的瀏覽器實玩）。
不用 ?turbo；玩家操作走真的介面（互動按鈕、點地面／搖桿走到座位、坐下、點對話、點選項；手機自己打開就回第一個／收起來）。
[前置／捷徑]（會標示）：讀使用者 9/25 存檔，把日期時間地點改成那一堂課開始前（霖澤館二樓 201 門口）；等同學進教室時用 GAME.advance 推到上課前 8 分鐘（同 flow_classes）。
  第一段（橫向）：10/2（四）13:20 民法總則第 5 週——這學期第一次提問：黑板角落一題 → 題幹（題庫 CIVS_01 原文）→ 四個選項（原文、不洗牌）→
    「答案是（B）。考點：行為能力。」→ 教授「期末考，會考這樣的題目。」；選錯的（A）也一樣，不計分（出席照上課加一、成績不動），紀錄 ask['Y1S1:CIVS_01']='A'。
  第二段（直向）：10/15（三）09:10 刑法總則（一）第 7 週——同一學期第二次提問（前置：第一段的紀錄帶過去）：題幹很長（CRIM45_34）、直向排不排得下；
    「答案是（B）。考點：客觀歸責・風險實現。」；這次沒有「期末考，會考這樣的題目。」。
不是 iPhone：Playwright＋SwiftShader 手機模擬（is_mobile、觸控、iPhone UA）。
用法：LW_TESTS=<開發分支>/tests python3 done_b01_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, time, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
CASES = [   # 標籤、橫向？、課、題號、第幾天（第 1 天＝9/17）、星期、到門口的時間、上課前 8 分鐘、要不要「期末考」那句、選哪一個（故意選錯）
    ('civ_w5', True, 'civ_general', '民法總則', 'CIVS_01', 16, 4, 12.92, 13.2, True, 'A'),
    ('crim_w7', False, 'crim_gen1', '刑法總則（一）', 'CRIM45_34', 29, 3, 8.75, 9.03, False, 'C'),
]
REC = "(()=>{ const R=GAME.G.courses||{}; return {attend:R.attend||{}, grades:JSON.stringify(R.grades||{}), ask:R.ask||{}, hour:+GAME.G.hour.toFixed(2), day:GAME.G.day, zone:GAME.G.zone}; })()"
QJS = "(id=>{ const q=EXAM_BANK.questions.find(x=>x.id===id); return q?{q:q.q, options:q.options, answer:q.answer, core:q.core||'', expl:q.explanation||'', type:q.type}:null; })"
CHO = "[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"


async def phone(pg, cdp, run):
    """手機自己打開（要回的訊息）：玩家會回第一個選項、收起來"""
    if not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"): return False
    b = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-ask], #phoneBody [data-ans]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
    if b: await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(900); run.note('手機自己打開：回「%s」' % b[2])
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); return True


async def one(pg, cdp, run, case, prev_ask):
    tag, land, cid, cname, qid, day, wd, h_door, h_pre, want_final, pick = case
    base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base)
    G = dict(G); G.update({'zone': 'linze', 'day': day, 'weekday': wd, 'hour': h_door, 'weather': 'sunny', 'pos': {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 3.14}})
    if prev_ask:
        G['courses'] = dict(G.get('courses') or {}); G['courses']['ask'] = dict(prev_ask)
    await L.load_state(pg, G)
    run.setup('[前置／捷徑] 讀 9/25 存檔 → 改成第 %d 天 %.2f、霖澤館二樓 201 門口%s' % (day, h_door, '；課堂提問紀錄帶第一段的 %s' % json.dumps(prev_ask) if prev_ask else ''))
    await pg.wait_for_timeout(4000)
    want = await pg.evaluate(QJS + "(%s)" % json.dumps(qid)); run.check('%s：題庫有 %s' % (tag, qid), bool(want), json.dumps(want, ensure_ascii=False)[:200])
    r0 = await pg.evaluate(REC)
    for _ in range(40):   # 門口：先處理讀檔時的事件、手機（玩家會先點完）
        s = await L.state(pg)
        if await phone(pg, cdp, run): continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(900); continue
        if s['interact'].startswith('進入 201'): break
        await pg.wait_for_timeout(1500)
    s = await L.state(pg); run.check('%s：門口出現「進入 201」' % tag, s['interact'].startswith('進入 201'), json.dumps(s, ensure_ascii=False)[:200])
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
    for _ in range(40):
        s = await L.state(pg)
        if await phone(pg, cdp, run): continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(900); continue
        break
    s = await L.state(pg); run.check('%s：進到 201' % tag, s['zone'] == 'classroom', s['zone'])
    run.setup('[捷徑] GAME.advance 推到上課前 8 分鐘（%.2f），等同學進來（同 flow_classes）' % h_pre)
    await pg.evaluate("(h=>GAME.advance(h-GAME.G.hour))(%s)" % h_pre); await pg.wait_for_timeout(8000)
    seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.row===2&&q.col===3)||GAME.E.zone.seats.find(q=>!q.taken); return s?{x:s.x,z:s.z}:null; })()")
    ok = await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.45, '座位'); s = await L.state(pg)
    run.check('%s：走到座位、出現「坐下」' % tag, ok and s['interact'].startswith('坐下'), s['interact'])
    await L.tap(pg, cdp, '#interact')
    first = ''
    for _ in range(120):
        first = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
        if first: break
        await pg.wait_for_timeout(500)
    run.check('%s：坐下後第一個選項是「上課：%s」' % (tag, cname), first.startswith('上課：' + cname), first)
    await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(1500)
    seen, opts_seen, ask_i, t0 = [], None, -1, time.time()
    shots = set(); quiet = time.time()
    while time.time() - t0 < 1500:
        s = await L.state(pg)
        if s['dlg'] or s['choices'] or s['busy']: quiet = time.time()
        elif time.time() - quiet > 90: run.note('90 秒沒有對話、選項，人也沒被鎖住：當作下課'); break
        if await phone(pg, cdp, run): continue
        if s['choices']:
            cs = await pg.evaluate(CHO)
            if cs and cs[0].startswith('（A）') and opts_seen is None:
                opts_seen = cs; seen.append('選項：' + ' / '.join(cs)); await pg.wait_for_timeout(1500); await run.shot(pg, '%s_1_question_%s' % (tag, 'land' if land else 'port'))
                i = next((k for k, c in enumerate(cs) if c.startswith('（%s）' % pick)), 0)
                await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); run.note('提問：點了「%s」（故意選錯，看不計分）' % cs[i][:24]); await pg.wait_for_timeout(1500); continue
            seen.append('選項：' + ' / '.join(cs)); await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            full = (await pg.evaluate("(GAME.D&&GAME.D.full)||''")).strip(); nm = (await pg.evaluate("((document.getElementById('dlgName')||{}).textContent||'').trim()"))
            if not seen or seen[-1] != nm + '｜' + full: seen.append(nm + '｜' + full)
            if full.startswith('答案是') and 'ans' not in shots: shots.add('ans'); await pg.wait_for_timeout(2500); await run.shot(pg, '%s_2_answer_%s' % (tag, 'land' if land else 'port'))
            if '期末考，會考' in full and 'prof' not in shots: shots.add('prof'); await pg.wait_for_timeout(2500); await run.shot(pg, '%s_3_prof_%s' % (tag, 'land' if land else 'port'))
            if '（下課前，教授在黑板角落寫了一題。）' in full and 'board' not in shots: shots.add('board'); await pg.wait_for_timeout(1800); await run.shot(pg, '%s_0_board_%s' % (tag, 'land' if land else 'port'))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if not s['busy'] and s['zone'] == 'classroom' and opts_seen is not None: break
        await pg.wait_for_timeout(1000)
    await run.shot(pg, '%s_4_after_%s' % (tag, 'land' if land else 'port'))
    ov = await pg.evaluate(OVERLAP); print('   %s 下課那一刻的版面：%s' % (tag, json.dumps(ov, ensure_ascii=False)), flush=True)   # 2026-10-21 23:1x：LAWWW c30d7a79 修直向兩個重疊後重驗
    run.check('%s：下課字幕框沒有蓋到「坐下」等互動鈕、HUD 下一堂課那一列沒有被金額蓋住（%s）' % (tag, 'land' if land else 'port'), not ov.get('capVsInteract') and not ov.get('nextVsMoney'), json.dumps(ov, ensure_ascii=False)[:400])
    r1 = await pg.evaluate(REC)
    print('   %s 看到的句子：' % tag, json.dumps(seen[-14:], ensure_ascii=False), flush=True)
    lines = [x.split('｜', 1)[1] if '｜' in x else x for x in seen]
    ib = next((k for k, x in enumerate(lines) if x == '（下課前，教授在黑板角落寫了一題。）'), -1)
    run.check('%s：黑板角落一題 → 題幹（題庫原文）' % tag, ib >= 0 and ib + 1 < len(lines) and lines[ib + 1] == want['q'], json.dumps(lines[ib:ib + 3] if ib >= 0 else lines[-6:], ensure_ascii=False))
    wopts = ['（%s）%s' % (k, v) for k, v in want['options'].items()]
    run.check('%s：四個選項原文、不洗牌' % tag, opts_seen == wopts, json.dumps([opts_seen, wopts], ensure_ascii=False)[:500])
    wans = '答案是（%s）。' % want['answer'] + ('考點：' + want['core'] + ('' if want['core'][-1:] in '。！？' else '。') if want['core'] else '') + want['expl']
    ia = next((k for k, x in enumerate(lines) if x.startswith('答案是')), -1)
    run.check('%s：答案＋考點「%s」' % (tag, wans), ia >= 0 and lines[ia] == wans, lines[ia] if ia >= 0 else '沒有')
    fin = [x for x in seen if '期末考，會考這樣的題目。' in x]
    run.check('%s：%s「期末考，會考這樣的題目。」' % (tag, '這學期第一次提問有' if want_final else '同一學期第二次提問沒有'), bool(fin) == want_final, json.dumps(fin, ensure_ascii=False))
    key = 'Y1S1:' + qid
    run.check('%s：紀錄 ask[%s]＝%s（選的那一個）' % (tag, key, pick), r1['ask'].get(key) == pick, json.dumps(r1['ask'], ensure_ascii=False))
    run.check('%s：不計分——成績不動、出席照上課加一（%s %s → %s）' % (tag, cid, r0['attend'].get(cid), r1['attend'].get(cid)), r1['grades'] == r0['grades'] and (r1['attend'].get(cid) or 0) == (r0['attend'].get(cid) or 0) + 1, json.dumps([r0, r1], ensure_ascii=False)[:400])
    return r1['ask']


OVERLAP = """(()=>{ const R=id=>{ const e=document.getElementById(id); if(!e) return null; const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||e.classList.contains('hide')||+cs.opacity<0.05) return null; const r=e.getBoundingClientRect(); if(!r.width||!r.height) return null; return {l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),text:(e.textContent||'').trim().slice(0,30)}; };
  const X=(a,b)=>!!(a&&b)&&a.l<b.r&&b.l<a.r&&a.t<b.b&&b.t<a.b; const cap=R('caption'), it=R('interact'), nx=R('nextClass'), mo=R('money');
  return {vw:innerWidth, vh:innerHeight, caption:cap, interact:it, nextClass:nx, money:mo, capVsInteract:X(cap,it), nextVsMoney:X(nx,mo)}; })()"""


async def main():
    run = L.Run('done_b01', OUT); ask = None
    async with async_playwright() as p:
        for i, case in enumerate(CASES):
            if str(i + 1) not in os.environ.get('PARTS', '12'): continue   # PARTS=2：只跑第二段（直向）
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=case[1])
            await pg.goto(URL); run.check('%s：遊戲載入' % case[0], await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
            if case[0] != CASES[0][0] and not ask:
                ask = {'Y1S1:' + CASES[0][4]: CASES[0][10]}; run.setup('第一段沒有留下紀錄：第二段的課堂提問紀錄直接放 %s' % json.dumps(ask))
            try: ask = await one(pg, cdp, run, case, ask)
            except Exception as e: print('  ! %s 失敗：' % case[0], e, flush=True); run.check('%s 跑完' % case[0], False, str(e)[:300])
            run.check('%s：沒有 JS 例外' % case[0], not errs, json.dumps(errs[:3], ensure_ascii=False))
            await b.close()
    sys.exit(run.finish())
asyncio.run(main())
