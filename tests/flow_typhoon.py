"""颱風假（交付清單 B3，BB_110 第 2 節）的真實玩家流程（開發分支）。不用 ?turbo。
[前置／捷徑] 讀檔：大一上第 6 週週日（10/12，第 26 天）21:27、宿舍房間；麵店團群組第 20 天就加入了、見過方奕廷（黃金葛事件）；第一、二天的旗標照劇情。
A. 等到 21:33（遊戲時間）：手機「訊息」→「通知」：「新聞：明天停止上班上課。」、「張教授（信）：明日停課。……四十二頁……」（看得到是誰傳的）；
   「麵店團」：阿哲、Alison、柏翰、阿哲四則，最後一則有三個回覆按鈕 → 點「（貼一張颱風的貼圖）」→ Alison「這張貼圖比講義有用。」
B. 走到床邊睡覺 → 第 27 天（10/13 週一）早上：下雨；手機「今天」寫「今天放假（颱風假），沒有課」。
C. [前置／捷徑] 讀檔：第 27 天 17:57 宿舍房間（同樣的群組、見過方奕廷）→ 等到 18:00：泡麵之夜自己開始；方奕廷進來那一句起是 CG（正式檔、1920×1080）；
   選「看情況。」→ 阿凱「你們法律系每次都這樣。」；結束後可以走動、記了 SAID_DEPENDS。
截圖：A 的通知、群組；B 早上；C 的 CG（直向）。Playwright＋SwiftShader 手機模擬，不是 iPhone 實機。
用法：python3 tests/flow_typhoon.py URL [輸出資料夾]"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_typhoon'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True,
         'dating_kexin': True, 'KX_FIRST_MSG': True, 'FAM_GROUP_SENT': True, 'fundsV2': 1, 'allowanceMonth': 10}
# 後面五個：v9.7 新開的存檔第一天就有的旗標（2026-10-14 LAWWW2 回報：少了這些，存檔被當成舊存檔，睡醒時補演「經濟系的那一年」＋可昕的第一則訊息，
# 占住 B 段的早上；C 段讀檔時那一段還在演，接著演到新存檔裡）。舊存檔補演本身是設計（story3d.js 的 sleepNow），這個測試要測的是新玩家的颱風假
SETUP = "(()=>{ const G=GAME.G; PHONE.join(G,'noodle_team','麵店團'); PHONE.rec(G).groups.noodle_team.day=20; SOCIAL.remember('npc_fangyt','FIRST_MET','黃金葛'); return true; })()"
CG_JS = """(async()=>{ const a=document.getElementById('advCg'); const bg=a?a.style.backgroundImage:''; const m=/url\\(["']?([^"')]+)/.exec(bg||''); if(!m) return {bg:bg||'',w:0};
  const im=new Image(); im.src=m[1]; try{ await im.decode(); }catch(e){} return {bg:m[1],w:im.naturalWidth,h:im.naturalHeight,cls:document.getElementById('adv').className}; })()"""


PHONE_HIDDEN = "document.getElementById('phone').classList.contains('hide')"
WHO_AT_BTN = """(()=>{ const b=document.getElementById('btnPhone'); if(!b) return 'no btnPhone'; const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return (e?(e.id||e.className||e.tagName):'null')+' busy='+!!GAME.E.player.busy+' dlg='+!!(GAME.D&&GAME.D.active)+' titleIdle='+!!GAME.titleIdle; })()"""


async def phone(pg, cdp, tab, run=None):
    """打開手機、換到分頁（點了等它真的打開；SwiftShader 約 1 fps，沒開就再點，最多 3 次——玩家也會再點）。
    打不開時記下按鈕位置上是什麼東西（2026-10-14 LAWWW2 回報 A 段手機點了沒開，原因還在查）"""
    for _ in range(3):
        if not await pg.evaluate(PHONE_HIDDEN): break
        await L.tap(pg, cdp, '#btnPhone')
        for _ in range(16):
            await pg.wait_for_timeout(500)
            if not await pg.evaluate(PHONE_HIDDEN): break
    if await pg.evaluate(PHONE_HIDDEN) and run: run.note('手機打不開：按鈕上是 ' + await pg.evaluate(WHO_AT_BTN))
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def close_phone(pg, cdp):
    if not await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)


async def wait_hour(pg, h, max_s=600, cdp=None):
    t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate("GAME.G.hour") >= h: return True
        if cdp is not None and await L.phone_away(pg, cdp): print('  [玩家操作] 手機自己跳出來（沒回的訊息）→ 收起來')   # D103：手機開著＝遊戲暫停，時間不會走
        await pg.wait_for_timeout(2000)
    return False


async def main():
    run = L.Run('flow_typhoon', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.goto(URL); await L.wait_loaded(pg)
        # ---------- A：前一晚的手機 ----------
        run.setup('讀檔：第 26 天（10/12 週日）21:27 宿舍房間；麵店團第 20 天加入、見過方奕廷')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 21.45, 'day': 26, 'weekday': 0, 'weather': 'cloudy', 'flags': FLAGS})
        await pg.evaluate(SETUP); await pg.wait_for_timeout(4000)
        ok = await wait_hour(pg, 21.55, cdp=cdp)
        run.check('等到 21:33（遊戲時間走得動）', ok, str(await pg.evaluate("GAME.G.hour")))
        await phone(pg, cdp, 'msg', run)
        await tap_sel(pg, cdp, '#phoneBody [data-th="sys"]'); await pg.wait_for_timeout(900)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        await run.shot(pg, 'A_notice')
        run.check('「通知」：新聞「明天停止上班上課。」、張教授（信）「明日停課。……四十二頁……」，看得到是誰傳的', '新聞：明天停止上班上課。' in txt and '張教授（信）：明日停課。附件為明日進度的講義，共四十二頁，請自行閱讀。' in txt, txt[:300])
        await tap_sel(pg, cdp, '#phoneBody [data-thback="1"]'); await pg.wait_for_timeout(700)
        await tap_sel(pg, cdp, '#phoneBody [data-th="g:noodle_team"]'); await pg.wait_for_timeout(900)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        lines = ['四十二頁。颱風比較仁慈。', '我讀完第一頁了。第一頁是目錄。', '我讀到第十二頁。', '……你是颱風嗎？']
        pos = [txt.find(t) for t in lines]
        btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>b.textContent)")
        await run.shot(pg, 'A_group')
        run.check('「麵店團」：阿哲、Alison、柏翰、阿哲四則照順序；最後一則有三個回覆按鈕', all(x >= 0 for x in pos) and pos == sorted(pos) and btns == ['「我讀到第三頁。」', '「我在吃泡麵。」', '（貼一張颱風的貼圖）'], json.dumps({'pos': pos, 'btns': btns}, ensure_ascii=False))
        sel = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>x.textContent==='（貼一張颱風的貼圖）'); return b?'[data-ask=\"'+b.dataset.ask+'\"]':null; })()")
        if sel: await tap_sel(pg, cdp, '#phoneBody ' + sel); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('點「（貼一張颱風的貼圖）」→ 送出貼圖、Alison「這張貼圖比講義有用。」、按鈕不見', '🌀（颱風的貼圖）' in txt and '這張貼圖比講義有用。' in txt and not await pg.evaluate("!!document.querySelector('#phoneBody [data-ask]')"), txt[-200:])
        await close_phone(pg, cdp)
        # ---------- B：睡到颱風假早上 ----------
        bed = await L.find_it(pg, '睡覺')
        okb = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
        s = await L.state(pg)
        run.check('走到床邊、出現「睡覺」', okb and s['interact'].startswith('睡覺'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith('睡到明天早上')||x.textContent.startsWith('睡覺')); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        st = None
        for _ in range(300):   # 睡覺的過場（淡出、標題卡、換區域）在 1 fps 時要好幾分鐘：等到真的在第 27 天早上醒來、可以動（2026-10-14：原本只等 90 秒）
            st = await pg.evaluate("({day:GAME.G.day, zone:GAME.G.zone, hour:GAME.G.hour, weather:GAME.G.weather, busy:!!GAME.E.player.busy})")
            if st['day'] == 27 and st['zone'] == 'dorm' and st['hour'] < 9 and not st['busy']: break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(4000)
        await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40)
        run.check('睡覺 → 第 27 天（10/13 週一）早上在宿舍醒來、下雨', bool(st) and st['day'] == 27 and st['weather'] == 'rain', json.dumps(st, ensure_ascii=False))
        txt = await phone(pg, cdp, 'today', run)
        await run.shot(pg, 'B_morning_phone')
        run.check('手機「今天」：「今天放假（颱風假），沒有課」', '今天放假（颱風假），沒有課' in txt, txt[:200])
        await close_phone(pg, cdp)
        # ---------- C：泡麵之夜 ----------
        for _ in range(4):     # 讀檔前上一段不能還在演（2026-10-14：B 段的睡覺流程沒跑完就讀檔，接著演到 C 的存檔裡）；
            # 早上在宿舍醒來會有一次性的事件（例：ev_course_selection「選課結果」，宿舍 7–12 點），像玩家一樣點完（選第 2 個：不設旗標的那個）再讀檔
            await pg.wait_for_timeout(3000)
            q = await L.advance_dialogs(pg, cdp, run, lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=40, pick=1)
        run.setup('讀檔：第 27 天（10/13 週一，颱風假）17:57 宿舍房間；麵店團第 20 天加入、見過方奕廷')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 17.95, 'day': 27, 'weekday': 1, 'weather': 'rain', 'flags': FLAGS})
        await pg.evaluate(SETUP)
        t0 = time.time(); s = await L.state(pg)
        while time.time() - t0 < 420 and not (s['dlg'] or s['choices']):
            if await L.phone_away(pg, cdp): print('  [玩家操作] 手機自己跳出來（沒回的訊息）→ 收起來')   # D103：手機開著＝遊戲暫停，等不到 18:00
            await pg.wait_for_timeout(2000); s = await L.state(pg)
        run.check('18:00 泡麵之夜自己開始（阿凱「我囤了二十包。這是我人生最正確的決定。」）', '二十包' in (s.get('dtext') or ''), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(2500)
        cg = await pg.evaluate(CG_JS)
        s = await L.state(pg)
        await run.shot(pg, 'C_cg_portrait')
        run.check('方奕廷進來那一句起是 CG（正式檔 assets/cg/kai/event_typhoon_noodles.webp，1920×1080）', cg.get('bg', '').endswith('assets/cg/kai/event_typhoon_noodles.webp') and cg.get('w') == 1920, json.dumps({'cg': cg, 'dtext': s.get('dtext')}, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, lambda q: q['choices'] > 0, max_steps=30)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('三個選項照 BB_110', opts == ['「算。所以你要分我。」', '「不算。這是你自己囤的。」', '「看情況。」'], json.dumps(opts, ensure_ascii=False))
        cg2 = await pg.evaluate(CG_JS)
        run.check('選項出現時還是同一張 CG', cg2.get('bg', '').endswith('event_typhoon_noodles.webp'), json.dumps(cg2, ensure_ascii=False))
        await L.advance_dialogs(pg, cdp, run, lambda q: '每次都這樣' in (q.get('dtext') or ''), max_steps=6, pick=2)
        s = await L.state(pg)
        run.check('選「看情況。」→ 阿凱「你們法律系每次都這樣。」', '你們法律系每次都這樣。' in (s.get('dtext') or ''), json.dumps(s, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=20)
        mem = await pg.evaluate("SOCIAL.has('kai','SAID_DEPENDS')")
        run.check('結束後可以走動、記了 SAID_DEPENDS（阿凱）', not s['busy'] and not s['dlg'] and mem, json.dumps(s, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))
    sys.exit(1 if run.fails else 0)


asyncio.run(main())
