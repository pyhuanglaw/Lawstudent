"""CC（帳號 A）11-03：JOURNAL-CALENDAR-1103（LAWWW 4434215ce：日誌從筆記頁拆出來，選單多「日誌」分頁、月曆）的瀏覽器探針（BB 交辦）。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；雲端 SwiftShader 1～4 fps；使用者 PC 用 tools/cc_local/gpu_wrap.py 開視窗＋顯示卡）。
每個方向（直向 390×844、橫向 844×390，ORIENTS=port,land）各開一個新的瀏覽器。TURBO=1（預設）＝網址加 ?turbo（只加快對話等待；月曆是 DOM，不受影響）。

讀碼看到的實作（4434215ce，開發分支 4f3e04c8c 相同）：
  index.html:172 選單分頁列多 <button data-tab="journal">日誌</button>；:174 <div class="tab" id="tab-journal"><div id="journalBox">；:66-76 .jr* 樣式；:322 載入 src/journal3d.js
  src/game3d.js:447 openMenu 每次 JOURNAL.reset()＋JOURNAL.render($('journalBox'),G)（打開選單＝回到今天這個月）；:452 switchTab 標題「日誌」；:460 筆記頁拿掉日誌
  src/journal3d.js:16-18 資料＝G.memo 經 STORY.memoShown／memoText（不顯示 ev_ 代號）；:13-14 遊戲日↔日期＝CALENDAR.dateOf（第 1 天＝2025-09-17，舊存檔同一張表，存檔格式不變）
    :24-27 一個月的格子（一週從週一開始）；:35 標題列 .jrTop：‹ [data-jr=prev]、.jrTitle「Y 年 M 月」、› [data-jr=next]、「今天」[data-jr=today]；:36 搜尋框 .jrQ
    :37 搜尋結果 .jrRes > button.jrHit[data-jrday]（日期在前、由新到舊；有字時不畫月曆）；:38-40 月曆 .jrGrid：表頭 .jrWd 一…日，格子 button.jrCell[data-jrday]
    （.jrD 日、.jrIt 最多兩行、.jrMore「＋N」；class jrOut 別的月、jrNow 今天、jrSel 選的那天、jrHas 有紀錄）；:42 下面清單 .jrDay（<b>M/D</b>＋「· 內容」×N）
    :45-51 動作 prev／next／today／day（點格子或點搜尋結果：跳到那個月、選那天、清空搜尋）／q；:52-54 render（點擊委派、oninput 重畫並把游標放回搜尋框）

CASE（CASES=camp,old）：
  camp  法律系新局（網址 ?start1）：標題按 #btnNew → 回顧 → 8/22～24 宿營 12 段（點對話、選第一個選項）→ 8/29 搬進宿舍（真的玩，日誌是遊戲自己寫的）。
        第一個方向玩完存 GAME.snapshot() 到 <out>/camp_snapshot.json；之後的方向【前置】讀這份快照（同一份實際累積的日誌；CAMP_SNAP=<檔> 可指定、PLAY_ALL=1 每個方向都真的玩）。
        → 選單 ☰ →「日誌」：1a 分頁、1b 週一開始、1c 今天有框、1d 每格兩行＋N、1e 點 8/23 列全部、1f ‹ › 今天、1g 搜「8/23」、1h 搜關鍵字＋點結果跳到那天；3 筆記頁沒有日誌
  old   舊存檔（OLD_SAVES，預設 v9.7 時期使用者存檔 docs/history/user_saves/2026-10-15_v97_day7.json、10-27 的 wip_backup/saves/fatiao3d_save_day25_1027.json）：
        【前置】GAME.applySave（L.load_state，關條件事件）→ ☰ →「日誌」→ 抽三筆（最早、中間、最晚），照原本的日期（第 1 天＝2025-09-17，Python 自己算）用 ‹ › 翻到那個月、
        那天那一格（data-jrday、.jrD、所在星期欄）→ 點它 → 下面清單有這一筆；3 筆記頁沒有日誌
判斷：讀 DOM 的 data-* 屬性、class、textContent（startswith）與 GAME.G；不讀 JOURNAL 模組（修改前的版本沒有它，照樣跑得完、該 FAIL 的 FAIL）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=camp,old] [ORIENTS=port,land] [OLD_SAVES=相對 repo 的路徑,…] python3 cc_journal_cal_probe.py <URL index.html> <輸出資料夾>
等待上限（秒）：CAMP_MAX（宿營到 8/29 宿舍，預設 3000）。最後一行 ALL PASS 或 FAILED n；transcript_<tag>.json。"""
import os, sys, json, asyncio, time, traceback, datetime
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
if os.environ.get('TURBO', '1') == '1' and 'turbo' not in URL: URL = URL + ('&' if '?' in URL else '?') + 'turbo'
URL = L.law_url(URL) if hasattr(L, 'law_url') else URL + ('&' if '?' in URL else '?') + 'start1'
ROOT = os.path.abspath(os.path.join(os.environ['LW_TESTS'], '..'))
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
LST = lambda k, d: [c.strip() for c in os.environ.get(k, d).split(',') if c.strip()]
CASES = LST('CASES', 'camp,old')
ORIENTS = LST('ORIENTS', 'port,land')
OLD_SAVES = LST('OLD_SAVES', 'docs/history/user_saves/2026-10-15_v97_day7.json,wip_backup/saves/fatiao3d_save_day25_1027.json')
PLAY_ALL = os.environ.get('PLAY_ALL', '0') == '1'
DAY1 = datetime.date(2025, 9, 17)   # 第 1 天（src/data/calendar.js DAY1；舊存檔也是這張表）
WD = '一二三四五六日'

FAILS = []


class Run(L.Run):
    def check(self, name, ok, info=''):
        r = L.Run.check(self, name, ok, info)
        if not ok: FAILS.append(name)
        return r


def date_of(day):
    return DAY1 + datetime.timedelta(days=int(day) - 1)


def day_of(y, m, d):
    return (datetime.date(y, m, d) - DAY1).days + 1


def lab(day):
    x = date_of(day); return '%d/%d' % (x.month, x.day)


def dump(tag, **kw):
    kw.setdefault('sha', os.environ.get('SHA', '?')); kw['tag'] = tag; kw['url'] = URL
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


# 日誌資料（遊戲狀態）：G.memo → 顯示的文字（STORY.memoText；不顯示空白與 ev_ 代號——同 STORY.memoShown）
EXP_JS = r"""(()=>{ const G=GAME.G; const tx=m=>(typeof STORY!=='undefined'&&STORY.memoText)?STORY.memoText(G,m):(m&&m.t);
  return {day:G.day,raw:(G.memo||[]).length,list:(G.memo||[]).map(m=>({day:m.day|0,t:tx(m)})).filter(e=>typeof e.t==='string'&&e.t&&!/^ev_[A-Za-z0-9_]+$/.test(e.t))}; })()"""
# 日誌分頁的 DOM
JDOM = r"""(()=>{ const box=document.getElementById('journalBox'), tab=document.getElementById('tab-journal'), menu=document.getElementById('menu');
  const btn=document.querySelector('.tabs button[data-tab="journal"]'); const T=s=>(s&&s.textContent||'').trim();
  const out={hasBtn:!!btn,btnText:T(btn),menuOpen:!!menu&&!menu.classList.contains('hide'),tabOn:!!tab&&tab.classList.contains('on'),menuTitle:T(document.getElementById('menuTitle')),hasBox:!!box};
  if(!box) return out; const q=box.querySelector('.jrQ');
  out.title=T(box.querySelector('.jrTitle')); out.q=q?q.value:null; out.qFocus=!!q&&document.activeElement===q;
  out.nav={prev:!!box.querySelector('[data-jr="prev"]'),next:!!box.querySelector('[data-jr="next"]'),today:!!box.querySelector('[data-jr="today"]')};
  out.wd=[...box.querySelectorAll('.jrGrid .jrWd')].map(T);
  out.cells=[...box.querySelectorAll('.jrGrid .jrCell')].map((c,i)=>({i,day:+c.dataset.jrday,d:T(c.querySelector('.jrD')),it:[...c.querySelectorAll('.jrIt')].map(T),more:c.querySelector('.jrMore')?T(c.querySelector('.jrMore')):null,
    cls:[...c.classList].filter(x=>x!=='jrCell'),bc:getComputedStyle(c).borderTopColor,ol:getComputedStyle(c).outlineStyle+' '+getComputedStyle(c).outlineColor}));
  const dy=box.querySelector('.jrDay'); out.dayHead=dy?T(dy.querySelector('b')):null; out.dayItems=dy?[...dy.querySelectorAll(':scope > div')].map(T):null;
  out.hits=[...box.querySelectorAll('.jrRes .jrHit')].map(h=>({day:+h.dataset.jrday,t:T(h)})); out.noHit=!!box.querySelector('.jrRes .muted');
  return out; })()"""
NOTES = r"""(()=>{ const box=document.getElementById('notesList'); const tab=document.getElementById('tab-notes');
  if(!box) return {ok:false}; const bs=[...box.querySelectorAll('.item > b')].map(b=>(b.textContent||'').trim());
  const dots=[...box.querySelectorAll('.item > div')].map(d=>(d.textContent||'').trim()).filter(t=>t.startsWith('· '));
  return {ok:true,on:!!tab&&tab.classList.contains('on'),heads:bs,dots:dots.slice(0,12),nDots:dots.length}; })()"""


async def free_state(pg):
    return await pg.evaluate("(()=>({busy:!!GAME.E.player.busy,dlg:!!(GAME.D&&GAME.D.active),depth:(GAME.D&&GAME.D.busyDepth)|0,adv:!!(typeof ADV!=='undefined'&&ADV.active),phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),zone:GAME.G.zone,day:GAME.G.day,h:+(+GAME.G.hour).toFixed(3)}))()")


async def wait_free(pg, cdp, max_s=90):
    t0 = time.time(); s = None
    while time.time() - t0 < max_s:
        s = await free_state(pg)
        if s['phone']: await L.phone_away(pg, cdp, tries=2); continue
        if not s['busy'] and not s['dlg'] and not s['adv'] and s['depth'] == 0: return True, s
        st = await L.state(pg)
        if st['choices']: await tap_choice0(pg, cdp)
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    return False, s


async def tap_choice0(pg, cdp):
    c = await pg.evaluate("(()=>{ const e=document.querySelectorAll('#choices button')[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
    if c: await L.touch_tap(cdp, c[0], c[1])


async def jd(pg):
    return await pg.evaluate(JDOM)


async def tapw(pg, cdp, sel, ms=700):
    ok = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(ms); return ok


async def open_journal(pg, cdp, run, tag):
    """玩家的方式：☰ → 分頁「日誌」"""
    await L.close_panels(pg, cdp); await L.phone_away(pg, cdp)
    okm = await tapw(pg, cdp, '#btnMenu', 1200)
    j = await jd(pg)
    if not j['menuOpen']:   # 第一次可能被別的東西吃掉：再按一次
        okm = await tapw(pg, cdp, '#btnMenu', 1500); j = await jd(pg)
    okt = j['hasBtn'] and await tapw(pg, cdp, '.tabs button[data-tab="journal"]', 900)
    j = await jd(pg)
    ok = bool(okm) and j['menuOpen'] and bool(okt) and j['tabOn'] and j['btnText'].startswith('日誌') and bool(j.get('cells'))
    run.check('%s 1a 選單 ☰ 有「日誌」分頁，點了打開月曆（標題「日誌」、%d 格）' % (tag, len(j.get('cells') or [])), ok,
              J({k: j.get(k) for k in ('hasBtn', 'btnText', 'menuOpen', 'tabOn', 'menuTitle', 'title')}))
    return ok, j


def by_day(exp):
    M = {}
    for e in exp['list']: M.setdefault(e['day'], []).append(e['t'])
    return M


def ym_title(y, m):
    return '%d 年 %d 月' % (y, m)


async def goto_month(pg, cdp, y, m, max_taps=30):
    """用 ‹ › 翻到 y 年 m 月"""
    for _ in range(max_taps):
        j = await jd(pg)
        if (j.get('title') or '').startswith(ym_title(y, m)): return True, j
        try: cy, cm = [int(x) for x in j['title'].replace(' 月', '').split(' 年 ')]
        except Exception: return False, j
        await tapw(pg, cdp, '[data-jr="prev"]' if (y, m) < (cy, cm) else '[data-jr="next"]', 600)
    j = await jd(pg); return (j.get('title') or '').startswith(ym_title(y, m)), j


def grid_checks(j, M, today, need_big=True):
    """回傳 (週一開始 ok, 說明, 每格內容 ok, 說明, 今天框 ok, 說明)"""
    cells = j['cells']; bad_wd = []
    for c in cells:
        if c['i'] % 7 != date_of(c['day']).weekday() or c['d'] != str(date_of(c['day']).day): bad_wd.append([c['i'], c['day'], c['d']])
    try:
        y, m = [int(x) for x in j['title'].replace(' 月', '').split(' 年 ')]
        first = day_of(y, m, 1); ci = next((c['i'] for c in cells if c['day'] == first), None)
        inm = [c for c in cells if date_of(c['day']).month == m]
        out_ok = all(('jrOut' in c['cls']) == (date_of(c['day']).month != m) for c in cells)
    except Exception:
        y = m = first = ci = None; inm = []; out_ok = False
    wd_ok = j['wd'] == list(WD) and not bad_wd and ci is not None and ci == date_of(first).weekday() and len(cells) % 7 == 0 and out_ok and len(inm) >= 28
    wd_info = J({'header': j['wd'], 'first': first, 'firstIdx': ci, 'bad': bad_wd[:5], 'n': len(cells), 'outCls': out_ok})
    bad = []
    for c in cells:
        L_ = M.get(c['day'], []); n = len(L_)
        okc = len(c['it']) == min(2, n) and all(c['it'][k].startswith(L_[k]) for k in range(len(c['it']))) and (c['more'] == ('＋%d' % (n - 2)) if n > 2 else c['more'] is None) and (('jrHas' in c['cls']) == (n > 0))
        if not okc: bad.append({'day': lab(c['day']), 'it': c['it'], 'more': c['more'], 'exp': L_[:3], 'n': n})
    big = [lab(c['day']) for c in cells if len(M.get(c['day'], [])) > 2]
    cont_ok = not bad and (bool(big) or not need_big)
    cont_info = J({'bad': bad[:4], 'cells_more_than_2': big, 'cells_with_items': sum(1 for c in cells if M.get(c['day']))})
    now = [c for c in cells if 'jrNow' in c['cls']]; other = next((c for c in cells if 'jrNow' not in c['cls'] and 'jrSel' not in c['cls']), None)
    now_ok = len(now) == 1 and now[0]['day'] == today and other is not None and now[0]['bc'] != other['bc']
    now_info = J({'now': [(lab(c['day']), c['bc']) for c in now], 'today': lab(today), 'other_bc': other and other['bc']})
    return wd_ok, wd_info, cont_ok, cont_info, now_ok, now_info


async def tap_cell(pg, cdp, day):
    return await tapw(pg, cdp, '.jrGrid .jrCell[data-jrday="%d"]' % day, 800)


async def type_q(pg, cdp, run, tag, text):
    """點搜尋框、用鍵盤打字（每打一個字月曆重畫、游標放回搜尋框）"""
    await tapw(pg, cdp, '.jrQ', 500)
    j = await jd(pg)
    if not j.get('qFocus'):
        run.note('%s：點搜尋框以後沒有拿到焦點，改用 focus()（只影響打字的方式）' % tag); await pg.focus('#journalBox .jrQ')
    cur = j.get('q') or ''
    for _ in range(len(cur)): await pg.keyboard.press('Backspace')
    await pg.keyboard.type(text, delay=120); await pg.wait_for_timeout(900)
    return await jd(pg)


async def clear_q(pg):
    await pg.fill('#journalBox .jrQ', ''); await pg.wait_for_timeout(700)


async def notes_check(pg, cdp, run, tag, exp):
    await tapw(pg, cdp, '.tabs button[data-tab="notes"]', 800)
    n = await pg.evaluate(NOTES)
    memo_t = set(e['t'] for e in exp['list'])
    leaked = [d for d in n.get('dots', []) if any(d.endswith('：' + t) for t in memo_t)]
    ok = n.get('ok') and n.get('on') and not any(h.startswith('日誌') for h in n.get('heads', [])) and not leaked
    run.check('%s 3 筆記頁沒有日誌（沒有「日誌」那一項、沒有「· 日期：日誌內容」）' % tag, ok, J({'heads': n.get('heads'), 'leaked': leaked[:3]}))
    return n


# ---------------------------------------------------------------- camp
async def play_camp(pg, cdp, run, tag, rec):
    """標題 #btnNew（?start1）→ 回顧 → 宿營 12 段 → 8/29 搬進宿舍；像玩家一樣點對話、選第一個選項"""
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); return !!r&&r.classList.contains('want'); })()"):
        await tapw(pg, cdp, '#rotate', 600); run.note('%s：直向提示「請把手機轉成橫向」→ 點掉（玩家的方式）' % tag)
    okn = await tapw(pg, cdp, '#btnNew', 1500)
    run.setup('%s：網址 %s（?start1＝法律系開局；?turbo 只加快對話等待）、清空 localStorage、標題按 #btnNew' % (tag, URL))
    t0 = time.time(); shots = set(); steps = 0; last = None; lastc = time.time()
    while time.time() - t0 < ENVI('CAMP_MAX', 3000):
        done = await pg.evaluate("!!(GAME.G&&GAME.G.flags&&GAME.G.flags.CAMP_Y1&&GAME.G.flags.KAI_MOVEIN)&&GAME.G.zone==='dorm'&&!GAME.D.active&&!(GAME.E.player||{}).busy")
        if done: break
        s = await L.state(pg); steps += 1
        k = (s['dtext'], s['choices'], s['zone'], s['hour'])
        if k != last: last = k; lastc = time.time()
        elif time.time() - lastc > 120:
            run.note('%s：120 秒沒有進展 %s' % (tag, J(s))); await run.shot(pg, tag + '_stall'); lastc = time.time()
            await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        if s['choices']: await tap_choice0(pg, cdp)
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        elif await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp)
        if s['dtext'].startswith('（早上八點半') and 'bus' not in shots: shots.add('bus'); await run.shot(pg, tag + '_camp_bus')
        await pg.wait_for_timeout(450)
    okf, fs = await wait_free(pg, cdp, 120)
    st = await pg.evaluate("(()=>{ const G=GAME.G, F=G.flags; return {day:G.day,h:+(+G.hour).toFixed(2),zone:G.zone,camp:!!F.CAMP_Y1,kai:!!F.KAI_MOVEIN,memo:(G.memo||[]).length}; })()")
    rec['play'] = {'secs': round(time.time() - t0), 'steps': steps, 'btnNew': okn, 'state': st, 'free': fs}
    run.note('%s：真的玩宿營 %d 秒、%d 步；%s' % (tag, time.time() - t0, steps, J(st)))
    return st['camp'] and st['kai'] and st['zone'] == 'dorm' and okf


async def camp_pass(p, run, orient, snapbox):
    tag = 'camp_%s' % orient; land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient, 'shots': {}}
    try:
        await pg.goto(URL); run.check('%s：遊戲載入' % tag, await L.wait_loaded(pg))
        snapf = os.environ.get('CAMP_SNAP') or snapbox.get('file')
        if snapf and not PLAY_ALL:
            snap = json.load(open(snapf, encoding='utf-8'))
            await L.load_state(pg, snap, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(4000)
            run.setup('[前置] %s：讀 %s（同一次跑法、%s 真的玩完宿營後的 GAME.snapshot()，日誌是遊戲自己寫的；關條件事件、手機自動打開）' % (tag, snapf, snapbox.get('by', '先前')))
            okp = (await wait_free(pg, cdp, 60))[0]; rec['src'] = 'snapshot'
        else:
            await pg.evaluate("localStorage.clear()")
            okp = await play_camp(pg, cdp, run, tag, rec); rec['src'] = 'play'
            if okp:
                f = os.path.join(OUT, 'camp_snapshot.json'); json.dump(await pg.evaluate("()=>GAME.snapshot()"), open(f, 'w', encoding='utf-8'), ensure_ascii=False)
                snapbox['file'] = f; snapbox['by'] = tag; run.note('%s：快照存到 %s（之後的方向讀它）' % (tag, f))
        await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        exp = await pg.evaluate(EXP_JS); M = by_day(exp); today = exp['day']; rec['exp'] = exp
        d822, d823 = day_of(2025, 8, 22), day_of(2025, 8, 23)
        run.check('%s 前置：宿營演完、在 8/29 宿舍、日誌有實際紀錄（%d 筆；8/22 %d 筆、8/23 %d 筆）' % (tag, len(exp['list']), len(M.get(d822, [])), len(M.get(d823, []))),
                  okp and lab(today) == '8/29' and len(M.get(d822, [])) >= 3 and len(M.get(d823, [])) >= 1,
                  J({'today': lab(today), 'days': {lab(d): v for d, v in sorted(M.items())}}))
        ok, j = await open_journal(pg, cdp, run, tag)
        rec['j0'] = j
        if not ok:
            for nm in ('1b 月曆從週一開始', '1c 今天那一格有框', '1d 每格最多兩行＋N', '1e 點 8/23 列出那天全部', '1f ‹ › 換月、「今天」回本月', '1g 搜尋「8/23」', '1h 搜尋關鍵字、點結果跳到那天'):
                run.check('%s %s' % (tag, nm), False, '沒有日誌月曆（1a FAIL）')
            rec['shots']['menu'] = await run.shot(pg, tag + '_no_journal')
        else:
            rec['shots']['cal'] = await run.shot(pg, tag + '_cal')
            wd_ok, wd_info, cont_ok, cont_info, now_ok, now_info = grid_checks(j, M, today)
            run.check('%s 1b 月曆從週一開始（表頭 一…日、每一格在對的星期欄、%s 標題）' % (tag, j['title']), wd_ok and j['title'].startswith(ym_title(2025, 8)), wd_info)
            run.check('%s 1c 今天（%s）那一格有框（jrNow 只有那一格、框線顏色和別格不同）' % (tag, lab(today)), now_ok, now_info)
            run.check('%s 1d 每一格寫當天的事：最多兩行、多的「＋N」（和 G.memo 一致）' % tag, cont_ok, cont_info)
            # 1e 點 8/23
            await tap_cell(pg, cdp, d823); j = await jd(pg)
            want = ['· ' + t for t in M.get(d823, [])]
            sel = [c['day'] for c in j['cells'] if 'jrSel' in c['cls']]
            run.check('%s 1e 點 8/23：下面列出那一天全部 %d 筆（標題 8/23、格子選起來）' % (tag, len(want)),
                      (j['dayHead'] or '').startswith('8/23') and len(j['dayItems'] or []) == len(want) and all(a.startswith(w) for a, w in zip(j['dayItems'], want)) and sel == [d823],
                      J({'head': j['dayHead'], 'items': j['dayItems'], 'want': want, 'sel': [lab(x) for x in sel]}))
            rec['shots']['day823'] = await run.shot(pg, tag + '_day823')
            # 1f ‹ › 今天
            steps = []
            await tapw(pg, cdp, '[data-jr="prev"]'); j = await jd(pg); steps.append(j['title'])
            jul = j['title'].startswith(ym_title(2025, 7)) and any(c['day'] == day_of(2025, 7, 1) and 'jrOut' not in c['cls'] for c in j['cells'])
            await tapw(pg, cdp, '[data-jr="next"]'); await tapw(pg, cdp, '[data-jr="next"]'); j = await jd(pg); steps.append(j['title'])
            sep = j['title'].startswith(ym_title(2025, 9)) and any(c['day'] == day_of(2025, 9, 1) and 'jrOut' not in c['cls'] for c in j['cells'])
            rec['shots']['sep'] = await run.shot(pg, tag + '_sep')
            await tapw(pg, cdp, '[data-jr="today"]'); j = await jd(pg); steps.append(j['title'])
            back = j['title'].startswith(ym_title(2025, 8)) and [c['day'] for c in j['cells'] if 'jrNow' in c['cls']] == [today] and (j['dayHead'] or '').startswith(lab(today))
            run.check('%s 1f 「‹」到 2025 年 7 月、「›」兩次到 9 月、「今天」回到 8 月（選今天）' % tag, jul and sep and back, J({'titles': steps, 'jul': jul, 'sep': sep, 'today': back, 'head': j['dayHead']}))
            # 1g 搜尋 8/23
            j = await type_q(pg, cdp, run, tag, '8/23')
            hits = j['hits']; n823 = len(M.get(d823, []))
            run.check('%s 1g 搜尋「8/23」：列出那天 %d 筆、都是 8/23（data-jrday）、每筆以「8/23」開頭' % (tag, n823),
                      j['q'] == '8/23' and len(hits) == n823 and n823 > 0 and all(h['day'] == d823 and h['t'].startswith('8/23') for h in hits) and not j['cells'],
                      J({'q': j['q'], 'hits': hits[:8]}))
            rec['shots']['search_date'] = await run.shot(pg, tag + '_search_823')
            # 1h 關鍵字（從日誌資料挑：今天以外、≥3 筆那天的最後一筆，取「：」後面的字）
            await clear_q(pg)
            pick = None
            for d in sorted(M, key=lambda x: (-len(M[x]), x)):
                if d == today: continue
                t = M[d][-1]; kw = t.split('：')[-1].strip()[:6]
                if len(kw) >= 2: pick = (d, t, kw); break
            if not pick:
                run.check('%s 1h 搜尋關鍵字、點結果跳到那天' % tag, False, '日誌資料挑不到關鍵字 %s' % J(M))
            else:
                d, t, kw = pick
                wantd = [e['day'] for e in exp['list'] if kw.lower() in e['t'].lower() or kw in lab(e['day'])][::-1]
                j = await type_q(pg, cdp, run, tag, kw); hits = j['hits']; rec['kw'] = {'kw': kw, 'from': [lab(d), t], 'hits': hits}
                rec['shots']['search_kw'] = await run.shot(pg, tag + '_search_kw')
                ok1 = [h['day'] for h in hits] == wantd and any(h['day'] == d and h['t'].startswith(lab(d)) for h in hits)
                okt = await tapw(pg, cdp, '.jrRes .jrHit[data-jrday="%d"]' % d, 900); j = await jd(pg)
                x = date_of(d); sel = [c['day'] for c in j['cells'] if 'jrSel' in c['cls']]
                ok2 = okt and j['q'] == '' and j['title'].startswith(ym_title(x.year, x.month)) and sel == [d] and (j['dayHead'] or '').startswith(lab(d)) and any(a.startswith('· ' + t) for a in (j['dayItems'] or []))
                run.check('%s 1h 搜尋關鍵字「%s」（取自 %s「%s」）：%d 筆和日誌資料一致；點 %s 那筆→跳到那個月、選那天、清空搜尋框' % (tag, kw, lab(d), t, len(wantd), lab(d)), ok1 and ok2,
                          J({'hits': [[lab(h['day']), h['t'][:24]] for h in hits[:8]], 'want': [lab(x) for x in wantd], 'after': {'title': j['title'], 'q': j['q'], 'sel': [lab(s) for s in sel], 'head': j['dayHead']}}))
                rec['shots']['search_jump'] = await run.shot(pg, tag + '_search_jump')
        rec['notes'] = await notes_check(pg, cdp, run, tag, exp)
        rec['shots']['notes'] = await run.shot(pg, tag + '_notes')
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ---------------------------------------------------------------- old saves
async def old_pass(p, run, orient, path):
    name = os.path.splitext(os.path.basename(path))[0]; tag = 'old_%s_%s' % (name, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient, 'save': path, 'shots': {}}
    try:
        await pg.goto(URL); run.check('%s：遊戲載入' % tag, await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        sv = json.load(open(os.path.join(ROOT, path), encoding='utf-8')); sv = sv.get('G', sv)
        raw = [m for m in sv.get('memo', []) if isinstance(m, dict)]
        await L.load_state(pg, sv, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(5000)
        okf, fs = await wait_free(pg, cdp, 60)
        run.setup('[前置] %s：GAME.applySave(%s)（存檔原樣，day %s、%s、日誌 %d 筆；關條件事件、手機自動打開）' % (tag, path, sv.get('day'), sv.get('zone'), len(raw)))
        exp = await pg.evaluate(EXP_JS); M = by_day(exp); today = exp['day']; rec['exp'] = exp
        run.check('%s 2 讀檔後日誌資料原封不動（G.memo %d 筆＝存檔 %d 筆、day 一樣）' % (tag, exp['raw'], len(raw)), exp['raw'] == len(raw) and exp['day'] == sv.get('day'),
                  J({'raw': len(raw), 'G': exp['raw'], 'shown': len(exp['list']), 'free': fs}))
        L_ = exp['list']; picks = []
        if L_:
            for idx in (0, len(L_) // 2, len(L_) - 1):
                if L_[idx] not in picks: picks.append(L_[idx])
        ok, j = await open_journal(pg, cdp, run, tag)
        rec['picks'] = picks
        if ok:
            rec['shots']['cal'] = await run.shot(pg, tag + '_cal')
            wd_ok, wd_info, cont_ok, cont_info, now_ok, now_info = grid_checks(j, M, today, need_big=False)
            run.check('%s 2 打開是今天（%s）這個月、今天有框、每格最多兩行＋N' % (tag, lab(today)), j['title'].startswith(ym_title(date_of(today).year, date_of(today).month)) and wd_ok and now_ok and cont_ok,
                      J({'title': j['title'], 'wd': wd_ok, 'now': now_info, 'content': cont_info}))
        for k, e in enumerate(picks, 1):
            x = date_of(e['day']); nm = '%s 2 舊存檔第 %d 筆「%s」（day %d＝原本 %d/%d 週%s）排在 %d/%d 那一格' % (tag, k, e['t'][:16], e['day'], x.month, x.day, WD[x.weekday()], x.month, x.day)
            if not ok: run.check(nm, False, '沒有日誌月曆'); continue
            okm, j = await goto_month(pg, cdp, x.year, x.month)
            c = next((c for c in j['cells'] if c['day'] == e['day']), None)
            Ld = M.get(e['day'], []); pos = Ld.index(e['t']) if e['t'] in Ld else -1
            in_cell = bool(c) and c['d'] == str(x.day) and c['i'] % 7 == x.weekday() and 'jrOut' not in c['cls'] and \
                ((pos < 2 and pos < len(c['it']) and c['it'][pos].startswith(e['t'])) or (pos >= 2 and c['more'] == '＋%d' % (len(Ld) - 2)))
            await tap_cell(pg, cdp, e['day']); j2 = await jd(pg)
            in_list = (j2['dayHead'] or '').startswith('%d/%d' % (x.month, x.day)) and any(a.startswith('· ' + e['t']) for a in (j2['dayItems'] or []))
            run.check(nm, okm and in_cell and in_list, J({'title': j['title'], 'cell': c and {'d': c['d'], 'col': WD[c['i'] % 7], 'it': c['it'], 'more': c['more']}, 'pos': pos, 'head': j2['dayHead'], 'items': (j2['dayItems'] or [])[:6]}))
            rec['shots']['pick%d' % k] = await run.shot(pg, tag + '_pick%d' % k)
        if not picks: run.check('%s 2 舊存檔抽三筆' % tag, False, '存檔沒有日誌')
        rec['notes'] = await notes_check(pg, cdp, run, tag, exp)
        rec['shots']['notes'] = await run.shot(pg, tag + '_notes')
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = Run('journal_cal_' + '+'.join(CASES), OUT)
    snapbox = {}
    async with async_playwright() as p:
        for cs in CASES:
            print('==== CASE %s（SHA %s，ORIENTS %s）====' % (cs, os.environ.get('SHA', '?'), ','.join(ORIENTS)), flush=True)
            for o in ORIENTS:
                if cs == 'camp': await camp_pass(p, run, o, snapbox)
                elif cs == 'old':
                    for sp in OLD_SAVES: await old_pass(p, run, o, sp)
                else: run.check('CASE %s 認得' % cs, False, '可以用：camp,old')
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), 'ORIENTS', ','.join(ORIENTS), flush=True)
    if FAILS:
        for f in FAILS: print('  FAILED ' + f)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    sys.exit(1 if FAILS else 0)

if __name__ == '__main__':
    asyncio.run(main())
