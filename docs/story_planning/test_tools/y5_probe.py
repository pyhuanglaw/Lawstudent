"""BB（帳號 A）2026-10-21：BB-TEST-Y5-1021（`docs/handoff/bb_checklists/BB_Y5_1021.md` 八項；AA_357 大五上＝交換延畢，開發分支 dd578e81 起）。
【前置】讀使用者 9/25 存檔，改日期、時間、地點、旗標（清單第 0 行的共用旗標；延畢的加 EXCHANGE_ROUTE＋EXCH_RULE，美國再加 US_DEPARTED／US_ARRIVED／US_RETURNED）。
之後都照玩家：家裡的選單、手機（今天、地點、朋友→資料、訊息→回覆）、站著不動讓日子跳（大五上的跳日期：在 3D 裡空下來 2 秒就跳到下一件事）、出發。
  1 home     2029-07-02 10:00 在家：選單沒有「回宿舍」、「出門」三個地方；出門以後手機「地點」第一列回家、沒有宿舍；外面待到 02:30 會回家
  2 tag      2029-12-21：資料頁 以安「台大法研所・碩一」、可昕「律師（職前訓練）」
  3 makeup   美國、Y5_DAYS=work、2029-09-10 08:30 公館：今天頁「9/10 週一・大五上 第 2 週」＋補修那一堂＋「直接去上課」→ 字卡、蔡老師一句、12:10 下課
  4 jumpUS / jumpJP  9/2 晚上站著不動：9/3 三選一（旁白美國／日本不同）→ 之後跳日期的字卡句子（美國第一次「週一、週三補修兩門課……」）
  5 moonGo / moonNo  臺灣路線、麵店團、9/20 20:50：21:00 群組三則 → 回「去。」→ 9/22 18:00 河濱；回「這次不行。」→ 9/22 22:00 群組照片
  6 kx5TW / kx5JP  和可昕交往、10/10 20:50：21:00 兩則 → 選「河堤。」→ 10/17 出遊，第二句延畢和沒延畢不同
  7 regMiss  日本、2030-05-10 20:50 在家：一直「在家休息一下」到 5/12 以後（不回答）→ 8/3 不進考場；另外存檔、讀檔一次看 BAR_REG_2030 會不會被改成有報名（子代理讀碼懷疑 PG.migrate）
  8 gfDinner 日本、和以安交往、2029-12-19 20:00：20:15「你實習結束了吧。……今天我訂位子。」→「好。」→ 12/21 吃飯，飯桌是大五上那一句
不是 iPhone：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests python3 y5_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（SCEN=home,tag,... 只跑某幾個）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', '').split(',') if os.environ.get('SCEN') else None
bad = []; results = {}
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, home:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const k=()=>{ try{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push(k()+' '+(n?n+'：':'')+t); }catch(e){} return o.apply(this,arguments); };
  if(GAME.titleCard){ const tc=GAME.titleCard; GAME.titleCard=function(t,s){ try{ window.__LOG.push(k()+' CARD:'+t+(s?'｜'+s:'')); }catch(e){} return tc.apply(this,arguments); }; }
  if(GAME.caption){ const c=GAME.caption; GAME.caption=function(t){ try{ window.__LOG.push(k()+' CAPTION:'+t); }catch(e){} return c.apply(this,arguments); }; }
  if(GAME.say){ const s=GAME.say; GAME.say=function(n,t){ try{ window.__LOG.push(k()+' SAY:'+(typeof n==='string'?n:'')+'｜'+(typeof t==='string'?t:'')); }catch(e){} return s.apply(this,arguments); }; } })()"""
BASEF = {'GRADUATED': 1355, 'GRAD_DONE': True, 'MOVED_OUT': 1381, 'HOME_AFTER': 'home', 'Y4_PATH': 'other', 'PACKED_Y4': 1354,
         'ROOM_Y2': True, 'ROOM_Y3': True, 'ROOM_Y4': True, 'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None, 'PG': {'done': {'grad': 1}}}
JP = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1}
US = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_RETURNED': 1194}
TW = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}


async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")


async def close_phone(pg, cdp):
    if await phone_open(pg): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()||'(空)']; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def open_phone(pg, cdp, tab=None):
    for k in range(3):
        if await phone_open(pg): break
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    if not await phone_open(pg): return False
    if tab: await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"%s\"]')" % tab)
    return True


async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled).map(b=>b.textContent.trim())")


async def pick(pg, cdp, start):
    return await tap_js(pg, cdp, "[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled).find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(start))


async def answer_ask(pg, cdp, pred_js, want):
    """要回的訊息：手機 → 訊息 → 那個對話 → 按 want 開頭的選項（照玩家）。pred_js：(m)=>bool 選哪一則"""
    m = await pg.evaluate("(()=>{ const f=%s; const L=PHONE.pending(GAME.G).filter(f); const m=L[0]; return m?{id:m.ask.id, th:PHONE.th(m), text:m.text, opts:m.ask.opts.map(o=>o.t)}:null; })()" % pred_js)
    if not m: return None
    k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), None)
    if k is None: bad.append('「%s」沒有選項「%s」（%s）' % (m['text'], want, m['opts'])); return m
    await open_phone(pg, cdp, 'msg')
    await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(m['th']))
    t = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (m['id'], k)))
    say('   手機回覆「%s」→「%s」' % (m['text'][:20], t)); m['answered'] = t
    await close_phone(pg, cdp); return m


async def idle_until(pg, cdp, run, cond_js, secs=900, pref=(), asks=None, note=''):
    """照玩家過日子：有對話就點、有選項照 pref 選（沒有就選第一個，不選「不去了」「先不要」）、手機打開了就看有沒有要回的（asks：[(pred_js, 選項開頭)]），
    其他時候站著不動（大五上空下來 2 秒會自己跳到下一件事）。cond_js 成立就停。"""
    t0 = time.time(); last = None
    while time.time() - t0 < secs:
        if await pg.evaluate(cond_js): return True
        sn = await pg.evaluate(SNAP)
        if (sn['key'], sn['h']) != last and (last is None or sn['key'] != last[0]): say('  [%5.1f 分] %s' % ((time.time() - t0) / 60, json.dumps(sn, ensure_ascii=False)))
        last = (sn['key'], sn['h'])
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['choices']:
            cs = await choices(pg); t = next((c for w in pref for c in cs if c.startswith(w)), None)
            t = t or next((c for c in cs if not c.startswith(('不去了', '先不要', '存檔', '不用了', '再撐一下', '晚一點'))), None) or (cs[0] if cs else None)
            if t: await pick(pg, cdp, t); say('   ▶ %s ／ %s' % (t[:30], [c[:14] for c in cs]))
            continue
        if asks:
            done = False
            for pj, w in list(asks):
                m = await answer_ask(pg, cdp, pj, w)
                if m: asks.remove((pj, w)); done = True
            if done: continue
        if await phone_open(pg): await close_phone(pg, cdp); continue
        if s['busy']: await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(1500)
    say('   ⚠ 等不到（%s）：%s' % (note or cond_js[:60], json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))); return False


async def load_y5(pg, run, base, sc):
    G = json.loads(json.dumps(base)); G = G.get('G', G)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(sc['key']))
    G.update({'day': d, 'hour': sc['h'], 'zone': sc.get('zone', 'gongguan'), 'pos': sc.get('pos'), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    G['flags'].update(json.loads(json.dumps(BASEF))); G['flags'].update(sc.get('flags', {}))
    for k, v in sc.get('gset', {}).items(): G[k] = v
    if sc.get('home'): G['home'] = {'at': True, 'day': d}
    await L.load_state(pg, G); await pg.evaluate(HOOK)
    if sc.get('js'): await pg.evaluate("(()=>{ const G=GAME.G; %s })()" % sc['js'])
    run.setup('[前置] %s：使用者 9/25 存檔改到 %s %.2f %s；旗標 %s；%s' % (sc['id'], sc['key'], sc['h'], sc.get('zone', 'gongguan'), json.dumps(sc.get('flags', {}), ensure_ascii=False), sc.get('js', '')))


async def lines(pg):
    return await pg.evaluate("window.__LOG||[]")


def chk(sc, ok, what, detail=''):
    st = 'PASS' if ok else 'FAIL'; say('[%s] %s %s %s' % (st, sc, what, detail))
    results.setdefault(sc, []).append({'ok': ok, 'what': what, 'detail': detail})
    if not ok: bad.append('%s：%s %s' % (sc, what, detail))


# ---------- 1 退宿後的家 ----------
async def s_home(pg, cdp, run, base):
    sc = dict(id='home', key='2029-07-02', h=10.0, zone='dorm', home=True, flags={})
    await load_y5(pg, run, base, sc); await pg.wait_for_timeout(5000)
    cs = []
    for k in range(20):
        cs = await choices(pg)
        if cs: break
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(800)
    await run.shot(pg, 'home_menu'); say('   家裡的選單：%s' % cs)
    chk('home', not any('回宿舍' in c for c in cs) and any(c.startswith('出門') for c in cs), '選單沒有「回宿舍」、有「出門」', json.dumps(cs, ensure_ascii=False))
    await pick(pg, cdp, '出門'); await pg.wait_for_timeout(1200); cs2 = await choices(pg); await run.shot(pg, 'home_out_menu'); say('   出門：%s' % cs2)
    want = ['校門口', '公館商圈', '溫州街']
    chk('home', all(any(c.startswith(w) for c in cs2) for w in want), '「出門」有校門口、公館商圈、溫州街', json.dumps(cs2, ensure_ascii=False))
    await pick(pg, cdp, '公館商圈')
    await idle_until(pg, cdp, run, "(()=>{ const G=GAME.G; return G.zone==='gongguan'&&!(typeof HOME!=='undefined'&&HOME.at(G))&&!GAME.E.player.busy; })()", secs=120, note='到公館')
    await open_phone(pg, cdp, 'places'); await pg.wait_for_timeout(800)
    pl = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); const rows=[...b.querySelectorAll('.phrow')].map(r=>r.innerText.replace(/\\n/g,'｜')); return {rows:rows.slice(0,6), gohome:!!b.querySelector('[data-gohome]'), dorm:[...b.querySelectorAll('[data-place]')].map(x=>x.dataset.place).filter(x=>/dorm|宿舍/.test(x)), text:b.innerText.includes('宿舍')}; })()")
    await run.shot(pg, 'home_places'); await close_phone(pg, cdp); say('   地點：%s' % json.dumps(pl, ensure_ascii=False))
    chk('home', bool(pl['rows']) and '回臺北的家' in pl['rows'][0] and pl['gohome'], '手機「地點」第一列是回家（回臺北的家／回家）', pl['rows'][0] if pl['rows'] else '')
    chk('home', not pl['dorm'] and not pl['text'], '手機「地點」沒有宿舍', json.dumps(pl['dorm'], ensure_ascii=False))
    if pl['rows'] and '40 分鐘' in pl['rows'][0]: say('   （觀察）回家那一列寫「約 40 分鐘」，出門、回家的字卡是 30 分鐘')
    # 02:30 回家：[捷徑] 時鐘撥到 02:24（26.4），之後推著搖桿走（不能站著不動：會跳日期）
    await pg.evaluate("(()=>{ GAME.G.hour=26.4; GAME.E.hour=26.4; if(GAME.updateHUD) GAME.updateHUD(); })()"); run.setup('[捷徑] home：時鐘撥到 02:24（26.4）')
    t0 = time.time(); jx, jy = await L.center_of(pg, '#joy'); hit = False
    while time.time() - t0 < 120:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
        for k in range(10):
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + (30 if (k // 5) % 2 else -30), 'y': jy - 40}]}); await pg.wait_for_timeout(150)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        s = await L.state(pg)
        if s['dlg'] or s['busy'] or await pg.evaluate("typeof HOME!=='undefined'&&HOME.at(GAME.G)"): hit = True; break
    await run.shot(pg, 'home_0230')
    await idle_until(pg, cdp, run, "(()=>{ const G=GAME.G; return (typeof HOME!=='undefined'&&HOME.at(G))&&document.querySelectorAll('#choices button').length>0; })()", secs=120, note='回到家的選單')
    sn = await pg.evaluate(SNAP); lg = await lines(pg); tail = [l for l in lg if '已經凌晨' in l or '回臺北的家' in l or '臺北的家。' in l]
    say('   02:30 以後：%s；台詞 %s' % (json.dumps(sn, ensure_ascii=False), json.dumps(tail[-6:], ensure_ascii=False)))
    chk('home', sn['home'] and any('已經凌晨' in l for l in lg), '外面待到 02:30 會回家（「已經凌晨了。」→ 回臺北的家）', json.dumps(tail[-4:], ensure_ascii=False))


# ---------- 2 資料頁 ----------
async def s_tag(pg, cdp, run, base):
    sc = dict(id='tag', key='2029-12-21', h=14.0, zone='gongguan', pos={'x': 0, 'z': -30}, flags={'met_heroine_01': True})
    await load_y5(pg, run, base, sc); await pg.wait_for_timeout(2500)
    out = {}
    for pid, want in (('heroine_01', '台大法研所・碩一'), ('kexin', '律師（職前訓練）')):
        await open_phone(pg, cdp, 'friends')
        if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-person=\"%s\"]')" % pid): out[pid] = '（朋友裡沒有她）'
        else: out[pid] = await pg.evaluate("(()=>{ const s=document.querySelector('#phoneBody .item:not(.phrow) .muted'); return s?s.textContent.trim():''; })()")
        await run.shot(pg, 'tag_%s' % pid); await close_phone(pg, cdp)
        chk('tag', out[pid] == want, '%s 資料頁「%s」' % (pid, want), '實際「%s」' % out[pid])


# ---------- 3 美國補修 ----------
async def s_makeup(pg, cdp, run, base):
    sc = dict(id='makeup', key='2029-09-10', h=8.5, zone='gongguan', pos={'x': 0, 'z': -30}, flags=dict(US, Y5_DAYS='work'))
    await load_y5(pg, run, base, sc); await pg.wait_for_timeout(2000)
    await open_phone(pg, cdp, 'today'); await pg.wait_for_timeout(800)
    td = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); const it=[...b.querySelectorAll('.item')].map(r=>r.innerText.replace(/\\n/g,'｜')); const g=b.querySelector('[data-y5go]'); return {items:it.slice(0,8), go:g?{k:g.dataset.y5go,t:g.textContent.trim()}:null}; })()")
    await run.shot(pg, 'makeup_today'); say('   今天：%s' % json.dumps(td, ensure_ascii=False))
    chk('makeup', bool(td['items']) and '9/10 週一・大五上 第 2 週' in td['items'][0], '今天頁第一行「9/10 週一・大五上 第 2 週」', td['items'][0] if td['items'] else '')
    row = next((x for x in td['items'] if '補修：強制執行法' in x), '')
    chk('makeup', '09:10–12:10' in row and '蔡老師' in row and bool(td['go']) and td['go']['t'] == '直接去上課', '補修那一堂（09:10–12:10、蔡老師）＋「直接去上課」', row)
    if td['go']:
        await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-y5go]')")
        await idle_until(pg, cdp, run, "(()=>{ const L=window.__LOG||[]; return L.some(l=>/CAPTION:下課了/.test(l))||GAME.G.hour>=12.15&&!GAME.E.player.busy&&!document.querySelectorAll('#choices button').length; })()", secs=240, note='下課')
        sn = await pg.evaluate(SNAP); lg = await lines(pg); await run.shot(pg, 'makeup_after')
        cls = [l for l in lg if 'CARD:補修' in l or '蔡老師' in l or '下課了' in l]
        say('   上課：%s；之後 %s' % (json.dumps(cls, ensure_ascii=False), json.dumps(sn, ensure_ascii=False)))
        chk('makeup', any('CARD:補修：強制執行法' in l for l in lg), '字卡「補修：強制執行法」')
        chk('makeup', any('沒有執行名義，法院不會幫你拿錢。' in l for l in lg), '蔡老師「沒有執行名義，法院不會幫你拿錢。」')
        h_end = next((float(l.split()[1]) for l in lg if 'CAPTION:下課了' in l), sn['h'])
        chk('makeup', 12.1 <= h_end <= 12.3, '12:10 下課', '下課時 %.2f' % h_end)


# ---------- 4 大五上跳日期 ----------
async def s_jump(pg, cdp, run, base, route):
    tag = 'jump' + route
    sc = dict(id=tag, key='2029-09-02', h=20.0, zone='gongguan', pos={'x': 0, 'z': -30}, flags=dict(US if route == 'US' else JP))
    await load_y5(pg, run, base, sc)
    got = await idle_until(pg, cdp, run, "(()=>[...document.querySelectorAll('#choices button')].some(b=>/去總圖讀書/.test(b.textContent)))()", secs=300, pref=['出發'], note='9/3 三選一')
    lg = await lines(pg); sn = await pg.evaluate(SNAP); await run.shot(pg, '%s_choice' % tag)
    narr = '（這學期，週二去實習，週一、週三補兩門課。其他的日子——）' if route == 'US' else '（這學期，只有週二要去實習。其他的日子——）'
    chk(tag, got and sn['key'] == '2029-09-03', '站著不動跳到 9/3，出現三選一', json.dumps(sn, ensure_ascii=False))
    chk(tag, any(narr in l for l in lg), '9/3 旁白「%s」' % narr[:18])
    await pick(pg, cdp, '「去總圖讀書。」'); await pg.wait_for_timeout(1200)
    # 之後再站著不動：看下一張日期卡的句子（PG.lines 也記）
    await idle_until(pg, cdp, run, "(()=>{ const P=(GAME.G.flags.PG||{}); return (P.lines||[]).length>0&&CALENDAR.dateOf(GAME.G.day).key>='2029-09-07'; })()", secs=400, pref=['出發'], note='9/3 以後的跳日期')
    pgl = await pg.evaluate("((GAME.G.flags.PG||{}).lines||[])"); lg = await lines(pg); cards = [l for l in lg if 'CARD:' in l]
    say('   PG.lines：%s；日期卡：%s' % (json.dumps(pgl[:6], ensure_ascii=False), json.dumps(cards[:8], ensure_ascii=False)))
    want = '（週一、週三補修兩門課。教室裡坐的，都是大三的。）' if route == 'US' else '（開學第一週。總圖三樓的位子，坐的大多是不認識的臉。）'
    allx = ' '.join(json.dumps(x, ensure_ascii=False) for x in pgl) + ' '.join(lg)
    chk(tag, want in allx, '跳日期的句子「%s」' % want[:16], json.dumps(pgl[:3], ensure_ascii=False))


# ---------- 5 中秋 ----------
async def s_moon(pg, cdp, run, base, go):
    tag = 'moonGo' if go else 'moonNo'
    sc = dict(id=tag, key='2029-09-20', h=20.83, zone='gongguan', pos={'x': 0, 'z': -30}, flags=dict(TW), js="PHONE.join(G,'noodle_team','麵店團');")
    await load_y5(pg, run, base, sc)
    asks = [("m=>m.ask&&m.ask.id==='pg_moon29'", '去。' if go else '這次不行。')]
    await idle_until(pg, cdp, run, "(()=>!PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='pg_moon29')&&(GAME.G.msgs||[]).some(m=>m.tag==='pg_moon29'||(m.ask&&m.ask.id==='pg_moon29')))()", secs=300, asks=asks, note='中秋群組訊息、回覆')
    msgs = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.from==='zhe'&&CALENDAR.dateOf(m.day).key>='2029-09-20').map(m=>CALENDAR.dateOf(m.day).key+' '+(+m.h||0).toFixed(2)+' '+m.text)")
    say('   阿哲：%s' % json.dumps(msgs, ensure_ascii=False))
    chk(tag, all(any(w in m for m in msgs) for w in ('禮拜六中秋', '河濱 六點 一樣', '明軒那邊我開視訊 讓他看月亮')), '9/20 21:00 群組三則', '')
    if go:
        await idle_until(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).pg_moon29||(window.__LOG||[]).some(l=>/柚子皮後來被阿哲戴在頭上/.test(l))", secs=600, pref=['出發：中秋'], note='9/22 河濱')
        lg = await lines(pg); await run.shot(pg, 'moonGo_end')
        chk(tag, any('（河濱。烤肉架是阿哲借的，和大一那年同一個。）' in l for l in lg) and any('柚子皮後來被阿哲戴在頭上' in l for l in lg), '9/22 河濱那一場有演', json.dumps([l for l in lg if '河濱' in l][:3], ensure_ascii=False))
        st = next((l for l in lg if '河濱。烤肉架' in l), '')
        chk(tag, st.startswith('2029-09-22'), '在 9/22 演', st[:16])
    else:
        await idle_until(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='pg_moon29_photo')||CALENDAR.dateOf(GAME.G.day).key>='2029-09-24'", secs=600, note='9/22 22:00 照片')
        ph = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.tag==='pg_moon29_photo').map(m=>CALENDAR.dateOf(m.day).key+' '+(+m.h||0).toFixed(2)+' '+m.text)")
        say('   照片：%s' % ph)
        chk(tag, bool(ph) and '📷（河濱，烤肉架，螢幕裡的明軒在揮手）' in ph[0] and ph[0].startswith('2029-09-22'), '回「這次不行。」→ 9/22 22:00 群組照片', json.dumps(ph, ensure_ascii=False))


# ---------- 6 可昕第五年 ----------
async def s_kx5(pg, cdp, run, base, route):
    tag = 'kx5' + route
    sc = dict(id=tag, key='2029-10-10', h=20.83, zone='gongguan', pos={'x': 0, 'z': -30}, flags=dict(JP if route == 'JP' else TW, dating_kexin=True))
    await load_y5(pg, run, base, sc)
    asks = [("m=>m.tag==='kx_anniv_ask5'||(m.from==='kexin'&&/地點你選/.test(m.text))", '河堤。')]
    await idle_until(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.from==='kexin'&&/河堤晚上風大/.test(m.text))", secs=300, asks=asks, note='10/10 兩則、選河堤')
    km = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.from==='kexin'&&CALENDAR.dateOf(m.day).key>='2029-10-10').map(m=>CALENDAR.dateOf(m.day).key+' '+(+m.h||0).toFixed(2)+' '+m.text)")
    say('   可昕：%s' % json.dumps(km, ensure_ascii=False))
    chk(tag, any('下禮拜三。第五年。' in m for m in km) and any('……地點你選。我那天下午有空。' in m for m in km), '10/10 21:00 兩則')
    chk(tag, any('好。河堤晚上風大，穿外套。' in m for m in km), '選「河堤。」她回「好。河堤晚上風大，穿外套。」')
    await idle_until(pg, cdp, run, "(window.__LOG||[]).some(l=>/同一年開始/.test(l))||CALENDAR.dateOf(GAME.G.day).key>='2029-10-19'", secs=900, pref=['出發：週年', '出發'], note='10/17 週年')
    lg = await lines(pg); await run.shot(pg, '%s_end' % tag)
    second = '……你一月拿證書。我們兩個，同一年開始。' if route == 'JP' else '我十二月放榜。你八月考。……我們兩個，同一年開始。'
    other = '我十二月放榜。你八月考。……我們兩個，同一年開始。' if route == 'JP' else '……你一月拿證書。我們兩個，同一年開始。'
    sc_l = [l for l in lg if '同一年開始' in l or '五年。我們認識的時候' in l]
    say('   週年那一場：%s' % json.dumps(sc_l, ensure_ascii=False))
    chk(tag, any('五年。我們認識的時候，你還在經濟系。' in l for l in lg) and any(second in l for l in lg) and not any(other in l for l in lg), '10/17 週年：第二句是%s那一句' % ('延畢' if route == 'JP' else '沒延畢'), json.dumps(sc_l, ensure_ascii=False))


# ---------- 7 2030 報名：不回答 ----------
async def s_reg(pg, cdp, run, base):
    sc = dict(id='regMiss', key='2030-05-10', h=20.83, zone='dorm', home=True, flags=dict(JP))
    await load_y5(pg, run, base, sc); await pg.wait_for_timeout(4000)
    n = 0; seen_modal = False
    while n < 60:
        sn = await pg.evaluate(SNAP)
        if sn['key'] >= '2030-05-12' and sn['h'] >= 1: break
        cs = await choices(pg)
        if any('報名' == c or c.startswith('報名') for c in cs) and any('不報名' in c for c in cs): seen_modal = True; say('   ⚠ 在家也跳出報名的選擇：%s' % cs); break
        if any(c.startswith('在家休息一下') for c in cs): await pick(pg, cdp, '在家休息一下'); n += 1; await pg.wait_for_timeout(600); continue
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if await phone_open(pg): await close_phone(pg, cdp); continue
        if cs: say('   選單沒有「在家休息一下」：%s' % cs); break
        await pg.wait_for_timeout(1000)
    sn = await pg.evaluate(SNAP); F = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {BAR_REG_2030:F.BAR_REG_2030===undefined?'(undefined)':F.BAR_REG_2030, done:((F.PG||{}).done||{}).reg_2030||null}; })()")
    say('   在家休息 %d 次到 %s；%s' % (n, json.dumps(sn, ensure_ascii=False), json.dumps(F, ensure_ascii=False)))
    chk('regMiss', not seen_modal and sn['key'] >= '2030-05-12', '一直在家，5/12 以前沒有被問報名（＝不回答）', json.dumps(F, ensure_ascii=False))
    # 存檔、讀檔（玩家會做的事：存到欄位 1，再從標題「讀取」）——看 BAR_REG_2030 有沒有被改
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot?GAME.snapshot():null)")
    if snap and snap != 'null':
        st = json.loads(snap); await L.load_state(pg, st.get('G', st)); await pg.evaluate(HOOK); await pg.wait_for_timeout(3000)
        F2 = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {BAR_REG_2030:F.BAR_REG_2030===undefined?'(undefined)':F.BAR_REG_2030, done:((F.PG||{}).done||{}).reg_2030||null}; })()")
        say('   讀檔以後：%s' % json.dumps(F2, ensure_ascii=False)); run.setup('[前置] regMiss：用 GAME.snapshot 的整份狀態重新讀檔一次（等於存檔再讀檔）')
        chk('regMiss', F2['BAR_REG_2030'] in ('(undefined)', False), '沒回答的人讀檔以後還是沒報名（BAR_REG_2030 不能變成 true）', json.dumps(F2, ensure_ascii=False))
    # 出門、站著不動一路跳到 8/3 以後
    cs = await choices(pg)
    if any(c.startswith('出門') for c in cs): await pick(pg, cdp, '出門'); await pg.wait_for_timeout(1000); await pick(pg, cdp, '公館商圈')
    await idle_until(pg, cdp, run, "CALENDAR.dateOf(GAME.G.day).key>='2030-08-04'", secs=1500, pref=['出發', '不報名'], note='跳到 8/4')
    lg = await lines(pg); F3 = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {BAR_SIT_2030:F.BAR_SIT_2030===undefined?'(undefined)':F.BAR_SIT_2030, BAR_REG_2030:F.BAR_REG_2030===undefined?'(undefined)':F.BAR_REG_2030}; })()")
    exam = [l for l in lg if 'CARD:考場' in l or '交卷' in l]
    say('   8/3：%s；%s' % (json.dumps(exam, ensure_ascii=False), json.dumps(F3, ensure_ascii=False)))
    chk('regMiss', not exam and F3['BAR_SIT_2030'] == '(undefined)', '沒報名：8/3 不進考場（沒有「考場」字卡、BAR_SIT_2030 沒有）', json.dumps(F3, ensure_ascii=False))


# ---------- 8 女朋友期末約會 ----------
async def s_gf(pg, cdp, run, base):
    sc = dict(id='gfDinner', key='2029-12-19', h=20.0, zone='gongguan', pos={'x': 0, 'z': -30}, flags=dict(JP, dating_heroine_01=True, dating_kexin=False, met_heroine_01=True, PG={'done': {'grad': 1, 'y5_intern4': 1}}))
    await load_y5(pg, run, base, sc)
    asks = [("m=>m.ask&&m.ask.id==='te_gf_Y5S1_heroine_01'", '好。')]
    await idle_until(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>/你實習結束了吧/.test(m.text))&&!PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='te_gf_Y5S1_heroine_01')", secs=300, asks=asks, note='以安 20:15')
    am = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>/你實習結束了吧/.test(m.text)).map(m=>CALENDAR.dateOf(m.day).key+' '+(+m.h||0).toFixed(2)+' '+m.text)")
    chk('gfDinner', bool(am) and am[0].startswith('2029-12-19') and '你實習結束了吧。……今天我訂位子。' in am[0], '12/19 20:15 以安「你實習結束了吧。……今天我訂位子。」', json.dumps(am, ensure_ascii=False))
    await idle_until(pg, cdp, run, "(window.__LOG||[]).some(l=>/餐盤疊好，拿去回收/.test(l))||CALENDAR.dateOf(GAME.G.day).key>='2029-12-23'", secs=900, pref=['出發：學期末的飯', '出發'], note='12/21 吃飯')
    lg = await lines(pg); await run.shot(pg, 'gf_end')
    din = [l for l in lg if '碩一的課' in l or '只是睡得少' in l or '手帳' in l or '靠窗的兩人座' in l]
    say('   吃飯那一場：%s' % json.dumps(din, ensure_ascii=False))
    chk('gfDinner', any('碩一的課，每一堂都要先讀一整本。' in l for l in lg) and any('……我讀得完。只是睡得少。' in l for l in lg) and not any('這學期的手帳，很多頁都寫到你' in l for l in lg), '12/21 飯桌是大五上那一句（不是一般版的手帳）', json.dumps(din[:3], ensure_ascii=False))
    st = next((l for l in lg if '碩一的課' in l), '')
    chk('gfDinner', st.startswith('2029-12-21'), '在 12/21 吃', st[:16])


SCENS = [('home', s_home), ('tag', s_tag), ('makeup', s_makeup), ('jumpUS', lambda *a: s_jump(*a, 'US')), ('jumpJP', lambda *a: s_jump(*a, 'JP')),
         ('moonGo', lambda *a: s_moon(*a, True)), ('moonNo', lambda *a: s_moon(*a, False)), ('kx5TW', lambda *a: s_kx5(*a, 'TW')), ('kx5JP', lambda *a: s_kx5(*a, 'JP')),
         ('regMiss', s_reg), ('gfDinner', s_gf)]


async def main():
    run = L.Run('y5', OUT); base = json.load(open(SAVE, encoding='utf-8')); allerrs = []
    async with async_playwright() as p:
        for name, fn in SCENS:
            if SCEN and name not in SCEN: continue
            say('== %s' % name); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await asyncio.wait_for(fn(pg, cdp, run, base), 2400)
            except asyncio.TimeoutError: chk(name, False, '超過 40 分鐘沒做完'); await run.shot(pg, 'timeout_' + name)
            except Exception as e: chk(name, False, '例外 %r' % e)
            if errs: chk(name, False, 'JS 例外', json.dumps(errs[:2], ensure_ascii=False)[:200])
            allerrs += errs
            try:
                lg = await lines(pg); json.dump(lg, open(os.path.join(OUT, '%s_lines.json' % name), 'w'), ensure_ascii=False, indent=0)
            except Exception: pass
            say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        json.dump({'results': results, 'bad': bad}, open(os.path.join(OUT, 'y5.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        for k, v in results.items(): run.check('%s：%d／%d 項' % (k, sum(1 for x in v if x['ok']), len(v)), all(x['ok'] for x in v), '；'.join(x['what'] for x in v if not x['ok'])[:200])
    run.finish()
asyncio.run(main())
