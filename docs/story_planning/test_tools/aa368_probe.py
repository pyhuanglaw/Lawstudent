"""BB（帳號 A）2026-10-21：AA368-Y0-FIX-1021（開發分支 eb2bc150 起）瀏覽器驗收——AA_368 第 6 節 BB 測試的其中三項（另外兩項看 aa300 ff 的日期卡、msgs.json）：
  W（H5、M4）：讀 qa_play 存的經濟系狀態（11/30）→ 在家照玩家的選單快轉到 12/12，之後一天一天睡 → 12/22、12/27、1/2 寒假（12/21～1/13）主動傳訊息給可昕
     （手機 → 訊息 → 可昕 →「傳訊息」→ 話題）→ 睡一晚看她回什麼：不能有「剛下課」「明天八點的課」「期末考」，要是「寒假在臺北」那幾句；
     1/8 公館吃麵（出發）：旁白「期末考考完快三個禮拜了」、可昕「……葉老師那封信，我又看了一次。」，沒有「國文那份報告，我記錯時間了。」
  S（H4、M7）：讀 qa_play 存的經濟系狀態（6/7）→ 快轉 → 7/10 晚上選「妳選一家。」→ 7/14 訊息「巷子那家我問過了。」→ 7/15～7/23 的日期卡在高雄（客運南下、巷子）
     → 7/24 可昕的訊息選「好。我搭早上的客運。」→ 7/25 凌晨兩點半夜班客運 → 7/26 凌晨回到家
[前置] 狀態檔是 qa_play.py 在真的玩法裡存的（G 整份）；之後全部照玩家：家裡的選單、手機介面、出發。Playwright 手機橫向模擬、?turbo，不是 iPhone。
  N（L9b、M6、H1）：新遊戲快轉到 10/25；W 加 M3 資料頁 2/14 以前；S 加 M3 2/14 以後、M8 8/30（S 延到 8/30）。AA_371 改字照新的比。
用法：LW_TESTS=<開發分支>/tests python3 aa368_probe.py '<URL>/index.html?turbo' <輸出資料夾> <11-30 狀態.json> <6-07 狀態.json>（ONLY=N、W 或 S）"""
import os, sys, json, asyncio, time, datetime
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SNAP_W, SNAP_S = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, stage:G.stage, home:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const k=()=>{ try{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({at:k(), n:n||'', t:String(t)}); }catch(e){} return o.apply(this,arguments); };
  if(GAME.titleCard&&!GAME.titleCard.__bb){ const tc=GAME.titleCard; const f=function(t,s){ try{ window.__LOG.push({at:k(), n:'CARD', t:'CARD:'+t+(s?'｜'+s:'')}); }catch(e){} return tc.apply(this,arguments); }; f.__bb=1; GAME.titleCard=f; } })()"""
MSGS = "(GAME.G.msgs||[]).map((m,i)=>({i, d:CALENDAR.dateOf(m.day).key, from:m.from||'', text:String(m.text||''), ask:!!m.ask}))"
res = {}; bad = []; RUN = None
async def run_shot(pg, name):
    if RUN: await RUN.shot(pg, name)
def say(*a): print(' '.join(str(x) for x in a), flush=True)


def verdict(item, ok, why):
    res[item] = {'ok': ok, 'why': why}; say('[%s] %s %s' % ('PASS' if ok else 'FAIL', item, why))
    if not ok: bad.append('%s：%s' % (item, why))


async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")


async def close_phone(pg, cdp):
    if await phone_open(pg): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def open_phone(pg, cdp):
    if await phone_open(pg): return True
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    if await phone_open(pg): return True
    t = await tap_js(pg, cdp, "[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith('看手機'))")   # 家裡的選單
    await pg.wait_for_timeout(1000); return await phone_open(pg)


async def answer_pending(pg, cdp, want):
    """要回的訊息：手機 → 訊息 → 那個對話串 → 選項（want 裡有的優先，不然第一個）"""
    pend = await pg.evaluate("(()=>typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:m.text, opts:m.ask.opts.map(o=>o.t)})):[])()")
    if not pend: return False
    if not await open_phone(pg, cdp): return False
    for m in pend:
        await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"msg\"]')")
        await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(m['th']))
        k = next((i for i, t in enumerate(m['opts']) if any(t.startswith(w) for w in want)), 0)
        t = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (m['id'], k)))
        say('   手機回覆 %s：「%s」（訊息「%s」，選項 %s）' % (m['id'], t, m['text'][:24], m['opts']))
    await close_phone(pg, cdp); return True


async def send_kexin(pg, cdp, topic, sub=None):
    """主動傳訊息給可昕（照玩家：手機 → 訊息 → 可昕的對話 →「傳訊息」→ 話題）；回傳 (送出的字, 送之前 G.msgs 的長度) 或 (None, 原因)"""
    if not await open_phone(pg, cdp): return None, '手機打不開'
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"msg\"]')")
    if not await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='p:kexin')"):
        await close_phone(pg, cdp); return None, '訊息裡沒有可昕的對話'
    head = await pg.evaluate("((document.querySelector('#phoneBody .thHead')||{}).innerText||'').replace(/\\n/g,'｜')")
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgto=\"kexin\"]')"):
        await close_phone(pg, cdp); return None, '沒有「傳訊息」按鈕（%s）' % head
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=\"kexin|%s\"]')" % topic):
        await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=\"kexin|cancel\"]')"); await close_phone(pg, cdp); return None, '沒有話題 %s（%s）' % (topic, tops)
    if sub: await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=\"kexin|share|%s\"]')" % sub)
    sent = await pg.evaluate("(()=>{ const m=(GAME.G.msgs||[]).filter(m=>m.from==='player').slice(-1)[0]; return m?m.text:''; })()")
    say('   傳給可昕（%s%s）：「%s」；話題 %s' % (topic, '/' + sub if sub else '', sent, tops))
    await close_phone(pg, cdp); return sent, n0


async def kexin_tag(pg, cdp):
    """M3：手機「朋友」→ 可昕那一列按「資料」→ 資料頁最上面的「科系・年級」
    （10-21 第一輪讀的是朋友列表那一列：那一列寫「現在大概在哪」（在台大），不是科系年級——是測試讀錯地方，不是遊戲的錯）"""
    if not await open_phone(pg, cdp): return None
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-person=\"kexin\"]')"):
        await close_phone(pg, cdp); return '（朋友裡沒有可昕的「資料」）'
    txt = await pg.evaluate("(()=>{ const s=document.querySelector('#phoneBody .item:not(.phrow) .muted'); return s?s.textContent.trim():''; })()")
    await run_shot(pg, 'kexin_profile')
    await close_phone(pg, cdp); return txt


def pick_opt(cs, mode, force):
    for w in force:
        x = next((c for c in cs if c.startswith(w)), None)
        if x: return x
    for w in ('照樣跳過', '出發：'):
        x = next((c for c in cs if c.startswith(w)), None)
        if x: return x
    pref = ['快轉', '到下一個有事的日子'] if mode == 'ff' else ['睡到明天早上', '隔天早上在家醒來', '睡覺']
    for w in pref + ['直接去', '好', '嗯']:
        x = next((c for c in cs if c.startswith(w)), None)
        if x: return x
    x = next((c for c in cs if not c.startswith(('存檔', '存到存檔欄位', '看手機', '讀書', '吃晚餐', '約可昕出門'))), None)
    return x or (cs[0] if cs else None)


async def step(pg, cdp, mode, force, answers):
    """處理畫面上的一件事（對話／選項／要回的訊息）；回傳 True＝做了事"""
    s = await L.state(pg)
    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); return True
    if s['choices']:
        cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled).map(b=>b.textContent.trim())")
        t = pick_opt(cs, mode, force)
        if t:
            await tap_js(pg, cdp, "[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim()===%s)" % json.dumps(t)); say('   ▶ %s ／ %s' % (t[:30], [c[:16] for c in cs]))
            return True
    if await answer_pending(pg, cdp, answers): return True
    if await phone_open(pg): await close_phone(pg, cdp); return True
    if s['busy']: await pg.wait_for_timeout(700); return True
    return False


async def drive(pg, cdp, until, mode_fn, force, answers, on_day=None, max_s=3600):
    """照玩家一路玩到 until（'YYYY-MM-DD HH'）；mode_fn(key)→'ff' 或 'day'；on_day(key) 每換一天叫一次（傳訊息）"""
    t0 = time.time(); last = None; idle = 0
    while time.time() - t0 < max_s:
        sn = await pg.evaluate(SNAP)
        if '%s %05.2f' % (sn['key'], sn['h']) >= until: return True
        if sn['key'] != last:
            last = sn['key']; say('  [%5.1f 分] %s' % ((time.time() - t0) / 60, json.dumps(sn, ensure_ascii=False)))
            if on_day: await on_day(sn)
        if await step(pg, cdp, mode_fn(sn['key']), force, answers): idle = 0; continue
        idle += 1
        if idle in (8, 20) and not sn['home']:   # 3D 場景裡空下來（宿舍或外面）：去睡覺（玩家會做的）
            bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
            if bed:
                run_ = L.Run('bed', OUT)
                if await L.go_to(pg, cdp, run_, bed[0], bed[1], 0.8, '床', max_s=90): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(900)
    say('   ⚠ %d 分鐘還沒到 %s（現在 %s）' % (max_s // 60, until, json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))); return False


async def load_snap(pg, path):
    st = json.load(open(path, encoding='utf-8')); G = st.get('G', st)
    await L.load_state(pg, G); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK); await pg.evaluate('window.__LOG=[]')
    say('   讀檔：%s' % json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))


WINTER_OK = ['在宿舍。品妤回家了，整間都是我的。', '在總圖。放假了還是很多人。……我不是在讀書，我只是不想待在宿舍。', '剛起床。……不要問我現在幾點。', '公館那家麵店放假也開。阿姨認得我了。', '晚安。明天不用早起。……好爽。']   # 「剛起床」那句照 AA_371 第 3 題改字
WINTER_BAD = ['剛下課', '明天八點的課', '期末考']


async def run_w(pg, cdp, run):
    await load_snap(pg, SNAP_W); run.setup('[前置] 讀 qa_play 存的經濟系狀態 %s' % os.path.basename(SNAP_W))
    plan = {'2024-12-22': ('chat', None), '2024-12-27': ('share', 'food'), '2025-01-02': ('chat', None)}; sent = []; tagw = []
    async def on_day(sn):
        p = plan.get(sn['key'])
        if p and not any(x['day'] == sn['key'] for x in sent):
            for k in range(30):   # 等對話講完：只點對話，不選選項（家裡的選單一直都在；10-21 第一輪在這裡選了「睡覺」，從 12/22 一路推到 1/27 才傳）
                s = await L.state(pg)
                if not s['dlg']: break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)
            k2 = (await pg.evaluate(SNAP))['key']
            if k2 != sn['key']: sent.append({'day': sn['key'], 'topic': p, 'sent': None, 'n0': '日子已經到 %s，沒傳' % k2}); return
            t, n0 = await send_kexin(pg, cdp, *p)
            at = await pg.evaluate("(()=>{ const m=(GAME.G.msgs||[]).filter(m=>m.from==='player').slice(-1)[0]; return m?CALENDAR.dateOf(m.day).key:''; })()")
            sent.append({'day': sn['key'], 'at': at, 'topic': p, 'sent': t, 'n0': n0})
            await run.shot(pg, 'w_send_%s' % sn['key'])
            if sn['key'] == '2024-12-22': tagw.append(await kexin_tag(pg, cdp)); say('   可昕資料頁（2/14 以前）：%s' % tagw[-1])
    await drive(pg, cdp, '2025-01-09 09.00', lambda k: 'ff' if k < '2024-12-12' else 'day', ['出發：'], [], on_day=on_day, max_s=4800)
    msgs = await pg.evaluate(MSGS); lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.at+' '+(x.n?x.n+'：':'')+x.t)")
    json.dump({'msgs': msgs, 'lines': lines, 'sent': sent}, open(os.path.join(OUT, 'w.json'), 'w'), ensure_ascii=False, indent=1)
    # H5：每一次傳了以後，可昕回的（G.msgs 在那之後、from kexin 的）
    probs = []; got = []
    for x in sent:
        if x['sent'] is None: probs.append('%s 沒傳成：%s' % (x['day'], x['n0'])); continue
        if x.get('at') and x['at'] != x['day']: probs.append('（測試）排在 %s 傳，實際 %s 才傳——這一次不算' % (x['day'], x['at'])); continue
        nxt = (datetime.date.fromisoformat(x['day']) + datetime.timedelta(days=1)).isoformat()
        rep = [m for m in msgs[x['n0']:] if m['from'] == 'kexin' and x['day'] <= m['d'] <= nxt][:3]; got.append((x['day'], [m['text'] for m in rep]))
        if not rep: probs.append('%s 傳了「%s」，可昕沒有回' % (x['day'], x['sent']))
        for m in rep:
            if any(b in m['text'] for b in WINTER_BAD): probs.append('%s 可昕回「%s」（寒假不該有）' % (x['day'], m['text']))
        if rep and not any(m['text'] in WINTER_OK for m in rep): probs.append('%s 可昕回的不是「寒假在臺北」那幾句：%s' % (x['day'], [m['text'] for m in rep]))
    say('   可昕的回覆：%s' % json.dumps(got, ensure_ascii=False))
    verdict('H5 寒假主動傳訊息給可昕', not probs, '；'.join(probs) or json.dumps(got, ensure_ascii=False)[:300])
    jan8 = [l for l in lines if l.startswith('2025-01-08')]
    ok_new = any('葉老師那封信，我又看了一次。' in l for l in jan8) and any('期末考考完快三個禮拜了' in l for l in jan8)
    old = [l for l in jan8 if '國文那份報告，我記錯時間了。' in l or '期末考考完兩個禮拜了' in l]
    say('   1/8 台詞（前 12）：%s' % json.dumps(jan8[:12], ensure_ascii=False))
    tw = (tagw or [''])[0] or ''
    verdict('M3 可昕資料頁 2/14 以前', '經濟系・一年級' in tw and '休學' not in tw, '12/22 手機「朋友」可昕那一列：%s' % tw)
    verdict('M4 1/8 公館吃麵', ok_new and not old, '新句 %s；舊句 %s；1/8 台詞 %d 句' % (ok_new, old[:2], len(jan8)))


async def run_s(pg, cdp, run):
    await load_snap(pg, SNAP_S); run.setup('[前置] 讀 qa_play 存的經濟系狀態 %s' % os.path.basename(SNAP_S))
    tag0 = await kexin_tag(pg, cdp); say('   可昕資料頁（2/14 以後）：%s' % tag0); await run.shot(pg, 's_kexin_tag')
    await drive(pg, cdp, '2025-08-30 23.50', lambda k: 'day' if '2025-07-24' <= k <= '2025-07-26' else 'ff', ['「妳選一家。」', '好。我搭', '出發：'], ['好。我搭'], max_s=7200)   # AA_371 第 4 題：選項改「好。我搭半夜的客運下去。」
    await run.shot(pg, 's_end')
    msgs = await pg.evaluate(MSGS); lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.at+' '+(x.n?x.n+'：':'')+x.t)")
    F = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {E35_PLAN:F.E35_PLAN, KH_GO:F.KH_GO}; })()")
    json.dump({'msgs': msgs, 'lines': lines, 'flags': F}, open(os.path.join(OUT, 's.json'), 'w'), ensure_ascii=False, indent=1)
    say('   旗標 %s' % F)
    e35 = any('我選？……那我家巷子裡那家。我從國中吃到現在，每次都在排隊。' in l for l in lines)
    m714 = [m['text'] for m in msgs if m['from'] == 'kexin' and m['d'] == '2025-07-14']
    cards = [l for l in lines if 'CARD:' in l and ('2025-07-1' in l or '2025-07-2' in l)]
    say('   7/14 可昕：%s' % m714); say('   7 月日期卡：%s' % json.dumps(cards, ensure_ascii=False))
    kh = any('巷子' in l and '客運南下' in l for l in cards); gg = any('公館巷子' in l for l in lines)
    verdict('H4 7/10「妳選一家」→ 高雄', F.get('E35_PLAN') == 'shop' and e35 and '巷子那家我問過了。' in m714 and kh and not gg,
            'E35_PLAN=%s；她說「我家巷子裡那家」=%s；7/14「巷子那家我問過了。」=%s；日期卡客運南下＋巷子=%s；還有「公館巷子」=%s' % (F.get('E35_PLAN'), e35, '巷子那家我問過了。' in m714, kh, gg))
    verdict('M3 可昕資料頁 2/14 以後', '休學中' in (tag0 or ''), '6/7 手機「朋友」可昕那一列：%s' % tag0)
    m8 = [l for l in lines if l.startswith('2025-08-30') and '你把車開回家，再搭捷運回宿舍。' in l]; e37 = [l for l in lines if l.startswith('2025-08-30')]
    say('   8/30 台詞（最後 6）：%s' % json.dumps(e37[-6:], ensure_ascii=False))
    verdict('M8 8/30 住宿舍的人：開車回家再搭捷運回宿舍', bool(m8), '8/30 台詞 %d 句；那一句 %s' % (len(e37), '有' if m8 else '沒有'))
    bus = [l for l in lines if '凌晨兩點半，你搭上南下的夜班客運。' in l]
    say('   夜班客運那句：%s' % bus[:2])
    home = [l for l in lines if l.startswith('2025-07-26')][:6]; say('   7/26 的台詞：%s' % json.dumps(home, ensure_ascii=False))
    ok_dep = bool(bus) and bus[0][:10] == '2025-07-25' and 2.0 <= float(bus[0][11:].split(' ')[0]) <= 3.5   # 小時沒有補零（'2.50'）：10-21 第一輪用字串比，02:30 被判成不對
    sn = await pg.evaluate(SNAP)
    verdict('M7 7/25 夜班客運', F.get('KH_GO') == 'bus' and ok_dep, 'KH_GO=%s；夜班客運那句在 %s；結束在 %s %.2f %s' % (F.get('KH_GO'), bus[0][:16] if bus else '（沒有）', sn['key'], sn['h'], sn['zone']))


async def run_n(pg, cdp, run):
    """N：新遊戲「從經濟系前傳開始」一路快轉到 10/25——L9b 品妤（大一上第 4 週）、M6 阿勳（10/23 起）、H1 9/24 的日期卡（開發分支最新）"""
    await L.tap(pg, cdp, '#btnNew'); run.setup('N：標題「從經濟系前傳開始」（新遊戲，不改狀態）')
    for k in range(60):
        if await pg.evaluate("!!(GAME.G&&GAME.running)"): break
        await pg.wait_for_timeout(1000)
    await pg.evaluate(HOOK); await pg.evaluate('window.__LOG=[]')
    await drive(pg, cdp, '2024-10-25 23.00', lambda k: 'ff', [], [], max_s=3000)
    msgs = await pg.evaluate(MSGS); lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.at+' '+(x.n?x.n+'：':'')+x.t)")
    json.dump({'msgs': msgs, 'lines': lines}, open(os.path.join(OUT, 'n.json'), 'w'), ensure_ascii=False, indent=1)
    rain = [m for m in msgs if '社科院門口等公車' in m['text']]; old = [m for m in msgs if '雨可以退貨' in m['text'] or '今天下大雨' in m['text']]
    verdict('L9b 品妤（大一上第 4 週）', bool(rain) and not old, '新句 %s；舊句 %s' % ([(m['d'], m['text'][:20]) for m in rain], [(m['d'], m['text'][:20]) for m in old]))
    seat = [m for m in msgs if '星期三的微積分' in m['text']]; oldseat = [m for m in msgs if m['text'].startswith('微積分老師今天看了一眼')]
    verdict('M6 阿勳「星期三的微積分」10/23 起', bool(seat) and all(m['d'] >= '2024-10-23' for m in seat) and not oldseat, '新句 %s；舊句 %s' % ([(m['d'], m['text'][:16]) for m in seat], [(m['d'], m['text'][:16]) for m in oldseat]))
    cards = [l for l in lines if 'CARD:' in l]
    typh = [l for l in cards if '颱風假' in l]; early = [l for l in typh if l[:10] < '2024-10-01']
    say('   日期卡：%s' % json.dumps(cards, ensure_ascii=False)[:1200])
    verdict('H1 颱風假那句 10/1 以後才出', bool(typh) and not early, '颱風那張 %s；10/1 以前 %d 張' % ([l[:16] for l in typh], len(early)))


async def run_s3(pg, cdp, run):
    """M3 2/14 以後（只讀 6/7 狀態、看資料頁；S 一開頭也做同一件事，S3 是重驗用的短版）"""
    await load_snap(pg, SNAP_S); run.setup('[前置] 讀 qa_play 存的經濟系狀態 %s' % os.path.basename(SNAP_S))
    tag0 = await kexin_tag(pg, cdp); say('   可昕資料頁（2/14 以後）：%s' % tag0)
    verdict('M3 可昕資料頁 2/14 以後', '休學中' in (tag0 or ''), '6/7 手機「朋友」→ 可昕「資料」：%s' % tag0)


async def run_s7(pg, cdp, run):
    """M7 回程（AA_368：九點的客運開了以後約五小時，7/26 02:10 到臺北的家）：S 那一輪 7/25 21:00 以後直接快轉到 8/13，沒看到回到家的時間——這裡從 6/7 狀態一路玩，
    7/24 起一天一天過，記下 7/25 那一場結束以後第一次停下來的時間和地點"""
    await load_snap(pg, SNAP_S); run.setup('[前置] 讀 qa_play 存的經濟系狀態 %s' % os.path.basename(SNAP_S))
    # 第一輪（3893c523）：7/25 那一場結束以後，遊戲自己一路快轉到 8/13 才停（玩家在 7/24 以前選過「快轉」），看不到 7/26 02:10——
    # 這裡只加記錄（不改遊戲）：每一次 GAME.advance 前後的日子、時間，和 HOME.go 被叫的時間
    await pg.evaluate("""(()=>{ if(window.__ADVH) return; window.__ADVH=1; window.__ADV=[]; const k=()=>CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2);
      const o=GAME.advance; GAME.advance=function(h){ const a=k(); const r=o.apply(this,arguments); try{ if(r&&r.then) r.then(()=>window.__ADV.push([a,+h,k(),'async'])); else window.__ADV.push([a,+h,k()]); }catch(e){} return r; };
      if(typeof HOME!=='undefined'&&HOME.go){ const g=HOME.go; HOME.go=function(){ try{ window.__ADV.push(['HOME.go',0,k()]); }catch(e){} return g.apply(this,arguments); }; } })()""")
    await drive(pg, cdp, '2025-07-26 00.00', lambda k: 'day' if k >= '2025-07-24' else 'ff', ['「妳選一家。」', '好。我搭', '出發：'], ['好。我搭'], max_s=2400)
    sn = await pg.evaluate(SNAP); await run.shot(pg, 's7_after_bus')
    lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.at+' '+(x.n?x.n+'：':'')+x.t)")
    dep = [l for l in lines if '凌晨兩點半，你搭上南下的夜班客運。' in l]; ret = [l for l in lines if '九點的客運開了。' in l]
    say('   7/25 那一場：出發 %s；回程 %s；之後第一次停下來 %s' % (dep[:1], ret[:1], json.dumps(sn, ensure_ascii=False)))
    adv = await pg.evaluate("window.__ADV||[]"); near = [x for x in adv if x[0][:10] in ('2025-07-25', '2025-07-26') or x[2][:10] in ('2025-07-25', '2025-07-26') or x[0] == 'HOME.go']
    say('   7/25～7/26 的 GAME.advance／HOME.go：%s' % json.dumps(near[:24], ensure_ascii=False))
    arr = [x for x in adv if x[0][:10] == '2025-07-25' and x[2][:13] in ('2025-07-26 2.', '2025-07-26 02')]
    ok = (sn['key'] == '2025-07-26' and 2.1 <= sn['h'] <= 2.4 and sn['home']) or (bool(arr) and any(abs(float(x[2][11:].split()[0]) - 2.17) < 0.05 for x in arr))
    verdict('M7 回程 7/26 02:10 到臺北的家', bool(dep) and bool(ret) and ok, '出發那句 %s；回程那句 %s；時間跳到 %s；之後第一次停下來 %s %.2f 在家=%s' % (dep[0][:16] if dep else '（沒有）', ret[0][:16] if ret else '（沒有）', [x[:3] for x in arr][:2] or '（沒看到）', sn['key'], sn['h'], sn['home']))


async def main():
    global RUN
    run = L.Run('aa368', OUT); RUN = run; allerrs = []
    async with async_playwright() as p:
        for name, fn in (('N', run_n), ('W', run_w), ('S', run_s), ('S3', run_s3), ('S7', run_s7)):
            if (ONLY and name not in ONLY) or (not ONLY and name in ('S3', 'S7')): continue
            say('== %s' % name); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await asyncio.wait_for(fn(pg, cdp, run), 7800)
            except asyncio.TimeoutError:
                verdict(name, False, "超過 130 分鐘沒做完"); await run.shot(pg, 'timeout_' + name)
            except Exception as e:
                verdict(name, False, '例外 %r' % e)
            allerrs += errs; say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        for k, v in res.items(): run.check('%s：%s' % (k, v['why'][:160]), v['ok'], '')
        run.check('沒有 JS 例外', not allerrs, json.dumps(allerrs[:3], ensure_ascii=False))
        json.dump({'res': res, 'bad': bad}, open(os.path.join(OUT, 'aa368.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
