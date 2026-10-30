"""BB-C 10-28：v9.10.12 候選（562a5ead9）三件的瀏覽器驗收（BB_TEST_QUEUE_1027 5s、5t、5u 第 3 點），一支用 MODE 分。
框架借 us_life_probe.py（HOOK 記台詞／字卡／提示、SNAP），做法同 user_items_probe.py（只借框架、不跑它的 main）。
不是 iPhone：Playwright 手機模擬（SwiftShader，0.5–4 fps）。預設不用 ?turbo（turbo 把 GM.sleep 壓到 120 ms、一格最多 0.3 秒）；pending 可以在 URL 加 ?turbo 省時間。
預設關掉條件事件（QUIET＝1，【前置】；手機規則走 STORY.tick、貓那一場走 STORY.TICKS，都不受影響）；QUIET=0 照開。

MODE（環境變數）：
  quickgym  5s 手機「地點」快速前往新體育館：【前置】使用者存檔改到 14:00 校園（出生點）。
            手機 → 地點 → 點地圖上「宿舍・體育館」那一顆 → 下面列出「宿舍」「新體育館（大廳）」；
            圖釘的字（宿舍・體育館）有沒有超出畫面／地圖／手機面板、有沒有和別的地名疊在一起（橫向、直向各量一次、各截圖）；
            按「新體育館（大廳）」的前往 → 進 1F 大廳（出生點 0,17.6）、人面向球場（ry≈π）、鏡頭看向球場（−z）；橫向、直向各截圖；
            觸控走到大廳裡（閘門前）→ 走回門口 → 按「離開體育館」→ 回到校園的體育館門口（74,58）、站得住、不卡。
  pending   5t／X121（使用者 10-28 01:1x「爸爸訊息一直有待回復 也沒有回復的選項」）：
            【前置】法律系大一上、第 4 週以後的週四 19:50 宿舍、在家人群組（拿掉近一週的 home_ask、約定）；
            【捷徑】PHONE.postAt 排一則可昕「週末來政大？我當導遊。」（沒有期限的問句，前一天 18:00）當對照。
            遊戲時間照走 → 20:30 手機訊息：家人那一列「待回覆」、點進去有「會回去／這週不回」（不回）→
            照走到 22:10 以後（爸爸「？」）：家人那一列沒有「待回覆」、未讀還在（紅色數字）、點進去沒有選項；手機按鈕的紅點＝PHONE.unread（過期的問句不算）、
            看過以後家人那一串不再算進紅點；可昕那一列照舊「待回覆」、點進去有選項；
            【捷徑】撥到隔天 10:00：可昕照舊「待回覆」＋選項，家人那一列沒有「待回覆」。
            FASTCLOCK=1：【捷徑】20:30、22:10 之前用撥時鐘（只撥到前兩分鐘，最後一段照走）；預設不撥、全部照走。
  catlie    5u 第 3 點（AA_493 第 3 節；LAWWW2 WZCAT.hold／release ccc329672）：所長回來（大三上第 11 週以後、第一次走進公園、走失公告那一週沒找、餵過 3 次以上）。
            【前置】存檔改到大三上第 11 週（週六，沒有就週一）09:54 溫州街主巷、公園入口 A 外面（26,2.6）、晴天；
            旗標 EXCHANGE_ROUTE TW、WZ_CAT_LOST＝第 10 週週三、沒有 WZ_CAT_FOUND／WZ_CAT_BACK／WZ_CAT_SEARCH；G.daily.park.feedN≥3。
            觸控走進公園入口段 → 那一場「所長回來了，前腳纏著一圈繃帶，躺在樹下的圓椅上，和平常一樣不理人。」→
            演的時候：WZCAT.held()＝lie、圓椅上那一隻是趴著的（y≈0.47）、走路的貓藏起來；截圖（ADV 模糊背景那一張＋【捷徑】藏 ADV／HUD 那一張＋放大）；
            沒有「坐在樹下的圓椅前面」；演完：WZ_CAT_BACK 有記、held＝null、趴著那一隻拿掉、走路的貓出來，之後照常起來走（位置變了；最多等 CATWAIT 秒，預設 600）。
用法：LW_TESTS=<工作樹>/tests MODE=quickgym|pending|catlie python3 rc12_items_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]
  存檔預設 scratchpad bbtest/p0an/user_day14.json（法律系 day 14）。SHA=<sha> 只印在最後一行。"""
import os, sys, json, asyncio, time, copy, math, re
HERE = os.path.dirname(os.path.abspath(__file__))
SP = '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an'
MODE = os.environ.get('MODE', 'quickgym')
if len(sys.argv) < 4: sys.argv.append(os.path.join(SP, 'user_day14.json'))
src = open(os.path.join(HERE, 'us_life_probe.py'), encoding='utf-8').read()
src = src[:src.rindex('asyncio.run(main())')]   # 只借框架（不跑它的 main）
B = {'__name__': 'us_life_base', '__file__': os.path.join(HERE, 'us_life_probe.py')}
exec(compile(src, 'us_life_probe.py', 'exec'), B)
L, SNAP = B['L'], B['SNAP']
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE); SAVE.pop('_stuck', None); SAVE.pop('_busy', None)
QUIET = os.environ.get('QUIET', '1') == '1'
FASTCLOCK = os.environ.get('FASTCLOCK') == '1'
CATWAIT = int(os.environ.get('CATWAIT', '600'))
J = lambda o: json.dumps(o, ensure_ascii=False)
LAND, PORT = {'width': 844, 'height': 390}, {'width': 390, 'height': 844}

# ---------- 共用 ----------
JUMP_JS = "(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key+' '+h.toFixed(2); })(%s)"
SETH_JS = "(h=>{ GAME.G.hour=h; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)"
LOGN = "(window.__LOG||[]).length"
LOGS = "(n=>(window.__LOG||[]).slice(n).map(x=>(x.n?x.n+'｜':'')+x.t))(%d)"
CHOICES = "[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>b.textContent.trim())"
# 頁面上看得到的提示（內部的 toast() 不經過 GAME.toast，HOOK 抓不到）：每 100 ms 看 #toast 的字有沒有換
TOASTW = "(()=>{ if(window.__bbToast) return; window.__bbToast=[]; let last=''; setInterval(()=>{ const e=document.getElementById('toast'); const t=e&&!e.classList.contains('hide')&&+getComputedStyle(e).opacity>0.05?(e.textContent||''):''; if(t&&t!==last) window.__bbToast.push({t, h:GAME.G?+GAME.G.hour.toFixed(2):null}); last=t; },100); })()"
# 截圖時藏起 HUD、ADV（只有 canvas）：on=true 藏、false 還原（同 user_items_probe 的 CLEAN）
CLEAN = """(on=>{ for(const el of document.body.children){ if(el.tagName==='CANVAS'||el.querySelector('canvas')) continue; if(on){ el.dataset.bbHide=el.style.visibility||'-'; el.style.visibility='hidden'; } else if(el.dataset.bbHide){ el.style.visibility=el.dataset.bbHide==='-'?'':el.dataset.bbHide; delete el.dataset.bbHide; } } })"""


def wrap(a): return math.atan2(math.sin(a), math.cos(a))


async def load(pg, st, run, desc, quiet=None):
    await L.load_state(pg, st, quiet_events=QUIET if quiet is None else quiet, quiet_phone=True); await pg.wait_for_timeout(4500)
    await pg.evaluate(B['HOOK']); await pg.evaluate(TOASTW)
    run.setup(desc)


async def pick(pg, cdp, text):
    c = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.trim().startsWith(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % J(text))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return True


async def settle(pg, cdp, secs=90, pref=None):
    """對話點完、選單照 pref 選（沒有就不選、停下來），直到沒有對話、不忙"""
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            ch = await pg.evaluate(CHOICES); w = next((p for p in (pref or []) if any(c.startswith(p) for c in ch)), None)
            if not w: return s
            await pick(pg, cdp, w); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not s['busy']: return s
        await pg.wait_for_timeout(600)
    return await L.state(pg)


def base(day=None, h=None, zone=None, pos=None):
    s = copy.deepcopy(SAVE)
    if day is not None: s['day'] = day
    if h is not None: s['hour'] = h
    if zone is not None: s['zone'] = zone
    s['pos'] = pos
    return s


async def tap_xy(pg, cdp, js):
    """js 回傳 [x,y,...]（已經 scrollIntoView）→ 用手指按那一點"""
    c = await pg.evaluate(js)
    if not c: return None
    await pg.wait_for_timeout(300); c = await pg.evaluate(js) or c   # 捲動以後再量一次
    await L.touch_tap(cdp, c[0], c[1]); return c


# ---------- 5s 手機地點：宿舍・體育館 → 新體育館（大廳） ----------
PIN_NAME = '宿舍・體育館'; GYM_PL = 'gym|新體育館（大廳）'
# 圖釘的字：捲到看得到，量字的框 vs 畫面、地圖（svg 會切掉 viewBox 外面的字）、手機面板（#phoneBody 會切掉）；和別的字疊在一起的列出來；字的中心點是不是被別的東西蓋住
PIN_JS = """(id=>{ const g=document.querySelector('#phoneBody [data-pmap="'+id+'"]'); if(!g) return null; const c=g.querySelector('circle'), t=g.querySelector('text'), sv=g.closest('svg'), body=document.getElementById('phoneBody');
  t.scrollIntoView({block:'center',inline:'nearest'});
  const R=e=>{ const r=e.getBoundingClientRect(); return {l:+r.left.toFixed(1),t:+r.top.toFixed(1),r:+r.right.toFixed(1),b:+r.bottom.toFixed(1)}; };
  const tr=R(t), cr=R(c), sr=R(sv), br=R(body), vw=innerWidth, vh=innerHeight;
  const ov=[...sv.querySelectorAll('text')].filter(x=>x!==t).map(x=>({s:x.textContent,r:R(x)})).filter(o=>Math.min(tr.r,o.r.r)-Math.max(tr.l,o.r.l)>1&&Math.min(tr.b,o.r.b)-Math.max(tr.t,o.r.t)>1).map(o=>o.s);
  const hit=document.elementFromPoint((tr.l+tr.r)/2,(tr.t+tr.b)/2);
  return {name:t.textContent, text:tr, pin:cr, svg:sr, body:br, vw, vh, inView:tr.l>=0&&tr.r<=vw&&tr.t>=0&&tr.b<=vh,
    inSvg:tr.l>=sr.l-0.5&&tr.r<=sr.r+0.5&&tr.t>=sr.t-0.5&&tr.b<=sr.b+0.5, inBody:tr.l>=br.l-0.5&&tr.r<=br.r+0.5&&tr.t>=br.t-0.5&&tr.b<=br.b+0.5,
    overlap:ov, hitOK:!!hit&&(hit===t||sv.contains(hit))}; })(%s)"""
PIN_TAP_JS = """(id=>{ const c=document.querySelector('#phoneBody [data-pmap="'+id+'"] circle'); if(!c) return null; c.scrollIntoView({block:'center'}); const r=c.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)"""
# 選中的圖釘下面那一塊（PLACEMAP.html：<div class="item"><b>圖釘名</b> 每一個地點一列 .phrow）
BLOCK_JS = """(name=>{ const it=[...document.querySelectorAll('#phoneBody .item')].find(x=>{ const b=x.querySelector(':scope > b'); return b&&b.textContent===name; }); if(!it) return null;
  return [...it.querySelectorAll('.phrow')].map(r=>{ const d=r.firstElementChild, btn=r.querySelector('button[data-place]'); return {name:d&&d.firstChild?d.firstChild.textContent:'', sub:((d&&d.querySelector('.muted'))||{}).textContent||'', place:btn?btn.dataset.place:null, btn:btn?btn.textContent:null}; }); })(%s)"""
BLOCK_BTN_JS = """(([name,place])=>{ const it=[...document.querySelectorAll('#phoneBody .item')].find(x=>{ const b=x.querySelector(':scope > b'); return b&&b.textContent===name; }); const e=it&&[...it.querySelectorAll('button[data-place]')].find(b=>b.dataset.place===place); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent]; })(%s)"""
PHONE_OPEN = "(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()"


async def open_tab(pg, cdp, tab):
    if not await pg.evaluate(PHONE_OPEN): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)


async def pin_view(pg, cdp, run, tag):
    """選中「宿舍・體育館」（還沒選才點，點兩次會取消）→ 量字、看下面列出的地點、截圖"""
    blk = await pg.evaluate(BLOCK_JS % J(PIN_NAME))
    if blk is None:
        c = await tap_xy(pg, cdp, PIN_TAP_JS % J('dorm')); await pg.wait_for_timeout(1200)
        run.note('%s：手指點地圖上的圖釘 %s' % (tag, J(c))); blk = await pg.evaluate(BLOCK_JS % J(PIN_NAME))
    m = await pg.evaluate(PIN_JS % J('dorm')); run.note('%s 圖釘的字：%s' % (tag, J(m)))
    await run.shot(pg, 'quickgym_%s_pin' % tag)
    ok = bool(m) and m['name'] == PIN_NAME and m['inView'] and m['inSvg'] and m['inBody'] and m['hitOK']
    run.check('%s：圖釘的字「%s」整個在畫面、地圖、手機面板裡面（沒有被切掉、沒有被蓋住）' % (tag, PIN_NAME), ok, J(m))
    run.check('%s：圖釘的字沒有和別的地名疊在一起' % tag, bool(m) and not m['overlap'], J(m and m['overlap']))
    if blk:   # 下面那一塊捲到看得到再截一張
        await pg.evaluate("(n=>{ const it=[...document.querySelectorAll('#phoneBody .item')].find(x=>{ const b=x.querySelector(':scope > b'); return b&&b.textContent===n; }); if(it) it.scrollIntoView({block:'center'}); })(%s)" % J(PIN_NAME))
        await pg.wait_for_timeout(500); await run.shot(pg, 'quickgym_%s_list' % tag)
    names = [r['name'] for r in (blk or [])]
    run.check('%s：點「%s」下面列出「宿舍」「新體育館（大廳）」' % (tag, PIN_NAME), '宿舍' in names and '新體育館（大廳）' in names, J(blk))
    gy = next((r for r in (blk or []) if r['place'] == GYM_PL), None)
    run.check('%s：新體育館（大廳）有「前往」按鈕（知道、開著）' % tag, bool(gy) and (gy['btn'] or '').startswith('前往'), J(gy))
    return blk


async def m_quickgym(pg, cdp, run, errs):
    await load(pg, base(None, 14.0, 'campus', None), run, '[前置] 使用者存檔改到 14:00 校園（出生點）')
    await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[])
    await open_tab(pg, cdp, 'places')
    await pin_view(pg, cdp, run, '橫向')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000); run.note('手機轉直向（390×844，手機面板開著）')
    if not await pg.evaluate(PHONE_OPEN): await open_tab(pg, cdp, 'places')
    await pin_view(pg, cdp, run, '直向')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000); run.note('轉回橫向')
    if not await pg.evaluate(PHONE_OPEN): await open_tab(pg, cdp, 'places')
    if await pg.evaluate(BLOCK_JS % J(PIN_NAME)) is None: await tap_xy(pg, cdp, PIN_TAP_JS % J('dorm')); await pg.wait_for_timeout(1200)
    h0 = await pg.evaluate("GAME.G.hour"); n = await pg.evaluate(LOGN)
    c = await tap_xy(pg, cdp, BLOCK_BTN_JS % J([PIN_NAME, GYM_PL])); run.note('按「宿舍・體育館」下面的 新體育館（大廳）：%s' % J(c))
    run.check('按得到新體育館（大廳）的前往', bool(c))
    if not c: return
    for _ in range(90):
        s = await L.state(pg)
        if s['zone'] == 'gym' and not s['busy']: break
        await pg.wait_for_timeout(1000)
    await settle(pg, cdp, 60, pref=[]); await pg.wait_for_timeout(5000)   # 正式模型載入
    s = await L.state(pg); h1 = await pg.evaluate("GAME.G.hour"); toasts = await pg.evaluate("(window.__bbToast||[]).map(x=>x.t)")
    run.note('到了：%s；時間 %.2f → %.2f；提示 %s' % (J(s), h0, h1, J(toasts[-3:])))
    fwd = (-math.sin(s['camYaw']), -math.cos(s['camYaw']))
    run.check('快速前往：進新體育館 1F 大廳（出生點 0,17.6 附近、站得住）', s['zone'] == 'gym' and math.hypot(s['x'], s['z'] - 17.6) < 1.0 and s['stand'], J(s))
    run.check('人面向球場（ry≈π，臉朝 −z）', abs(wrap(s['ry'] - math.pi)) < 0.5, str(s['ry']))
    run.check('鏡頭看向球場（畫面的前方朝 −z）', fwd[1] < -0.8, 'camYaw %.3f → 前方 (%.2f,%.2f)' % (s['camYaw'], fwd[0], fwd[1]))
    await run.shot(pg, 'quickgym_gym_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2500); await run.shot(pg, 'quickgym_gym_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2500)
    ok = await L.go_to(pg, cdp, run, 5.0, 15.0, 0.6, '大廳裡（閘門前）', max_s=300); s = await L.state(pg)
    run.check('大廳裡走得動（觸控走到閘門前 5,15）', ok and s['zone'] == 'gym' and s['stand'], J(s)); await run.shot(pg, 'quickgym_lobby')
    ok = await L.go_to(pg, cdp, run, 0.0, 18.3, 0.45, '體育館門口', max_s=300); lab = ''
    for _ in range(15):
        lab = (await L.state(pg))['interact']
        if '離開' in lab: break
        await pg.wait_for_timeout(700)
    run.check('走回門口：互動鍵「離開體育館」', '離開' in lab, '%s（go_to %s）' % (lab, ok))
    if '離開' not in lab: return
    await L.tap(pg, cdp, '#interact')
    for _ in range(90):
        s = await L.state(pg)
        if s['zone'] == 'campus' and not s['busy']: break
        await pg.wait_for_timeout(1000)
    await settle(pg, cdp, 60, pref=[]); await pg.wait_for_timeout(3000); s = await L.state(pg)
    run.check('出得去：回到校園的體育館門口（74,58 附近）、站得住、不忙', s['zone'] == 'campus' and math.hypot(s['x'] - 74, s['z'] - 58) < 2.5 and s['stand'] and not s['busy'], J(s))
    await run.shot(pg, 'quickgym_campus_door')
    run.note('台詞／提示：%s' % J((await pg.evaluate(LOGS % n))[-10:]))


# ---------- 5t 家人群組過期的問句不算「待回覆」 ----------
THU_JS = """(()=>{ const G=GAME.G; for(const want of ['Y1S1','Y1S2']) for(let d=G.day+1; d<G.day+420; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==want||CALENDAR.dateOf(d).wd!==4) continue;
    if(want==='Y1S1'&&t.week<4) continue; if((CALENDAR.holiday&&CALENDAR.holiday(d))||(CALENDAR.fest&&CALENDAR.fest(d))||(CALENDAR.typhoon&&(CALENDAR.typhoon(d)||CALENDAR.typhoon(d+1)))) continue;
    const g=HOME.grpPick(G,d); if(g&&!g.noAsk&&g.t) return {d,k:g.k,t:g.t,key:CALENDAR.dateOf(d).key,term:t.id,week:t.week}; } return null; })()"""
KX_JS = """(d=>{ const m=PHONE.postAt(GAME.G,{th:'p:kexin',from:'kexin',text:'週末來政大？我當導遊。',ask:{id:'bb_kx_test',opts:[{t:'好'},{t:'這週末不行'}]}},d-1,18); if(GAME.phoneBadge) GAME.phoneBadge(); return !!m; })(%d)"""
ROWS_JS = """(()=>[...document.querySelectorAll('#phoneBody button.chatRow[data-th]')].map(b=>({th:b.dataset.th, title:(b.querySelector('.chatMid b')||{}).textContent||'', last:(b.querySelector('.chatLast')||{}).textContent||'', ask:!!b.querySelector('.chatAsk'), badge:b.querySelector('.chatBadge')?+b.querySelector('.chatBadge').textContent:0})))()"""
ROW_TAP_JS = """(th=>{ const e=[...document.querySelectorAll('#phoneBody button.chatRow[data-th]')].find(b=>b.dataset.th===th); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)"""
ASKBTN_JS = """(p=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(b=>b.dataset.ask.startsWith(p+'|')).map(b=>({k:b.dataset.ask,t:b.textContent.trim(),dis:!!b.disabled})))(%s)"""
BADGE_JS = """(()=>{ const e=document.getElementById('phoneBadge'), G=GAME.G, T=PHONE.threads(G), r=th=>{ const x=T.find(q=>q.th===th); return x?{unread:x.unread,pending:x.pending,n:x.n}:null; };
  return {txt:e?e.textContent:'', shown:!!e&&!e.classList.contains('hide'), unread:PHONE.unread(G), pend:PHONE.pending(G).map(m=>m.ask.id), home:r('g:home'), kexin:r('p:kexin')}; })()"""
HOMEQ_JS = """(d=>{ const G=GAME.G, m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='home_ask_'+d), dad=(G.msgs||[]).filter(x=>PHONE.th(x)==='g:home'&&x.from==='dad'&&x.day===d);
  return {mom:m?{text:m.text,h:m.h,until:m.ask.until,opts:m.ask.opts.map(o=>o.t),ans:m.ans==null?null:m.ans,open:PHONE.askOpen(G,m)}:null, dad:dad.map(x=>({h:x.h,text:x.text,tag:x.tag||''})), now:G.day*24+G.hour}; })(%d)"""


def kx_ok(btns): return len(btns) == 2 and btns[0]['t'].startswith('好') and btns[1]['t'].startswith('這週末不行')


def badge_n(b): return int(b['txt']) if b['shown'] and b['txt'].isdigit() else (10 if b['shown'] and b['txt'] == '9+' else 0)


async def clock_to(pg, cdp, run, h, secs, why):
    """遊戲時間照走到 h（對話照點；中途的選單記下來、選「不／晚一點／之後」那一類，沒有就最後一個；手機自己打開就關）。FASTCLOCK＝先撥到 h 前兩分鐘"""
    if FASTCLOCK:
        cur = await pg.evaluate("GAME.G.hour")
        if cur < h - 0.04: await pg.evaluate(SETH_JS % (h - 0.034)); run.setup('[捷徑] 時鐘撥到 %.2f（%s；最後兩分鐘照走）' % (h - 0.034, why))
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(PHONE_OPEN): run.note('手機自己打開了（quiet_phone 應該關掉）→ 按收起來'); await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); continue
        s = await L.state(pg)
        if s['choices']:
            ch = await pg.evaluate(CHOICES); w = next((c for c in ch if re.search('不|晚一點|之後|算了|先不', c)), ch[-1] if ch else None)
            run.note('途中出現選單 %s → 選「%s」' % (J(ch), w))
            if w: await pick(pg, cdp, w[:6])
            continue
        if s['dlg']: run.note('途中的對話：%s' % s['dtext']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if s['hour'] >= h: run.note('遊戲時間到 %.2f（%s，花了 %d 秒）' % (s['hour'], why, time.time() - t0)); return True
        await pg.wait_for_timeout(1500)
    run.note('等不到 %.2f（%s）：現在 %s' % (h, why, J(await pg.evaluate(SNAP)))); return False


async def phone_list(pg, cdp, run, tag):
    await open_tab(pg, cdp, 'msg'); rows = await pg.evaluate(ROWS_JS); await run.shot(pg, 'pending_%s_list' % tag)
    R = {r['th']: r for r in rows}; run.note('%s 訊息列表：家人 %s；可昕 %s；全部 %d 列' % (tag, J(R.get('g:home')), J(R.get('p:kexin')), len(rows)))
    return R


async def open_thread(pg, cdp, run, th, prefix, tag):
    c = await tap_xy(pg, cdp, ROW_TAP_JS % J(th)); await pg.wait_for_timeout(1200)
    btns = await pg.evaluate(ASKBTN_JS % J(prefix)); body = await pg.evaluate("(document.getElementById('phoneBody').innerText||'').replace(/\\s+/g,' ').slice(-220)")
    await run.shot(pg, 'pending_%s_thread' % tag); run.note('%s 點進 %s（%s）：選項 %s；內容（最後）%s' % (tag, th, J(c), J(btns), body))
    return c, btns


async def close_phone(pg, cdp):
    if await pg.evaluate(PHONE_OPEN): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(900)


async def m_pending(pg, cdp, run, errs):
    await load(pg, base(), run, '[前置] 讀存檔（找週四用）'); await L.close_panels(pg, cdp)
    th = await pg.evaluate(THU_JS); run.note('週四：%s' % J(th))
    run.check('找得到法律系大一的週四（家人群組 20:00 會問、不是連假／颱風）', bool(th), J(th))
    if not th: return
    d = th['d']
    st = base(d, 19.83, 'dorm'); st['weekday'] = 4
    st['msgs'] = [m for m in st.get('msgs', []) if not (str((m.get('ask') or {}).get('id', '')).startswith('home_ask_') and m.get('day', 0) >= d - 7)]
    st.setdefault('home', {}).pop('promise', None); st['home']['at'] = False
    await load(pg, st, run, '[前置] 存檔改到 %s（週四 day %d，%s 第 %d 週）19:50 宿舍；拿掉近一週的家人群組問句、回家約定' % (th['key'], d, th['term'], th['week']))
    await L.close_panels(pg, cdp); await settle(pg, cdp, 40, pref=[])
    ok = await pg.evaluate(KX_JS % d); run.setup('[捷徑] PHONE.postAt：可昕「週末來政大？我當導遊。」（沒有期限的問句，day %d 18:00，ask id bb_kx_test）＝對照組' % (d - 1))
    run.check('對照組的可昕那一則排進去了', ok)
    # ---- 20:30 ----
    await clock_to(pg, cdp, run, 20.55, 1500, '週四 20:33')
    q = await pg.evaluate(HOMEQ_JS % d); b = await pg.evaluate(BADGE_JS); run.note('20:33 家人群組：%s；紅點 %s' % (J(q), J(b)))
    run.check('20:00 媽媽問「%s」（home_ask_%d，until 22:00、選項 會回去／這週不回、還回得了）' % (th['t'], d),
              bool(q['mom']) and q['mom']['opts'] == ['會回去', '這週不回'] and q['mom']['open'] and q['mom']['ans'] is None, J(q['mom']))
    R = await phone_list(pg, cdp, run, '2033')
    hm = R.get('g:home') or {}
    run.check('20:30 訊息列表：家人那一列標「待回覆」', hm.get('ask') is True, J(hm))
    run.check('20:30 訊息列表：可昕那一列標「待回覆」（對照）', (R.get('p:kexin') or {}).get('ask') is True, J(R.get('p:kexin')))
    c, btns = await open_thread(pg, cdp, run, 'g:home', 'home_ask_%d' % d, '2033_home')
    run.check('20:30 點進家人群組：有「會回去」「這週不回」（不回）', len(btns) == 2 and btns[0]['t'].startswith('會回去') and btns[1]['t'].startswith('這週不回') and not any(x['dis'] for x in btns), J(btns))
    await close_phone(pg, cdp)
    # ---- 22:10 以後（爸爸「？」）----
    await clock_to(pg, cdp, run, 22.17, 2400, '週四 22:10（爸爸「？」以後）')
    q = await pg.evaluate(HOMEQ_JS % d); b0 = await pg.evaluate(BADGE_JS); run.note('22:10 家人群組：%s；紅點（還沒打開手機）%s' % (J(q), J(b0)))
    run.check('22:00 沒回＝爸爸「？」那一則來了', bool(q['dad']) and any(x['h'] >= 21.99 for x in q['dad']), J(q['dad']))
    run.check('過了 22:00：媽媽那一則沒回、回不了（askOpen false）、不在 PHONE.pending', bool(q['mom']) and q['mom']['ans'] is None and not q['mom']['open'] and 'home_ask_%d' % d not in b0['pend'], J([q['mom'], b0['pend']]))
    run.check('手機按鈕的紅點＝PHONE.unread（過期的問句不另外算）；家人那一串 pending 0', badge_n(b0) == min(b0['unread'], 10) and (b0['home'] or {}).get('pending') == 0, J(b0))
    R = await phone_list(pg, cdp, run, '2210')
    hm = R.get('g:home') or {}
    run.check('22:10 訊息列表：家人那一列沒有「待回覆」', hm and hm.get('ask') is False, J(hm))
    run.check('22:10 訊息列表：家人那一列的未讀還在（爸爸「？」沒看過，紅色數字 ≥1）', (hm.get('badge') or 0) >= 1, J(hm))
    run.check('22:10 訊息列表：可昕那一列照舊「待回覆」（沒有期限的問句不受影響）', (R.get('p:kexin') or {}).get('ask') is True, J(R.get('p:kexin')))
    c, btns = await open_thread(pg, cdp, run, 'g:home', 'home_ask_%d' % d, '2210_home')
    run.check('22:10 點進家人群組：沒有選項按鈕（「會回去／這週不回」不再出現）', bool(c) and not btns, J(btns))
    await close_phone(pg, cdp); b1 = await pg.evaluate(BADGE_JS)
    run.check('看過家人群組以後：那一串未讀 0、紅點＝PHONE.unread（不再算這一則）', (b1['home'] or {}).get('unread') == 0 and badge_n(b1) == min(b1['unread'], 10), J([b0, b1]))
    R = await phone_list(pg, cdp, run, '2210b')
    run.check('看過以後：家人那一列沒有「待回覆」、沒有紅色數字', (R.get('g:home') or {}).get('ask') is False and not (R.get('g:home') or {}).get('badge'), J(R.get('g:home')))
    c, btns = await open_thread(pg, cdp, run, 'p:kexin', 'bb_kx_test', '2210_kexin')
    run.check('22:10 點進可昕：有「好」「這週末不行」（對照組照舊回得了）', kx_ok(btns), J(btns))
    await close_phone(pg, cdp)
    # ---- 隔天 ----
    await pg.evaluate(JUMP_JS % J([d + 1, 10.0])); run.setup('[捷徑] 撥到隔天 day %d 10:00（人還在宿舍）' % (d + 1)); await pg.wait_for_timeout(3000)
    await clock_to(pg, cdp, run, 10.05, 600, '隔天 10:03')
    b2 = await pg.evaluate(BADGE_JS); R = await phone_list(pg, cdp, run, 'next')
    run.check('隔天：可昕那一列照舊「待回覆」、家人那一列沒有', (R.get('p:kexin') or {}).get('ask') is True and (R.get('g:home') or {}).get('ask') is False, J([R.get('p:kexin'), R.get('g:home'), b2]))
    c, btns = await open_thread(pg, cdp, run, 'p:kexin', 'bb_kx_test', 'next_kexin')
    run.check('隔天點進可昕：選項還在（好／這週末不行）', kx_ok(btns), J(btns))
    await close_phone(pg, cdp)
    run.note('提示：%s' % J(await pg.evaluate("(window.__bbToast||[]).map(x=>x.h+' '+x.t)")))


# ---------- 5u-3 所長回來：躺在圓椅上 ----------
CAT_DAYS_JS = """(()=>{ const T=STORY.termDay; let d11=T('Y3S1',11,6); const sat=d11!=null; if(d11==null) d11=T('Y3S1',11,1); const d10=T('Y3S1',10,1);
  return {d11, d10, sat, key:d11!=null?CALENDAR.dateOf(d11).key:null, wd:d11!=null?CALENDAR.dateOf(d11).wd:null}; })()"""
CAT_PRE_JS = """(()=>{ const G=GAME.G, P=GAME.E.player.obj.position; return {backDue:WZL.backDue(G), feedN:WZL.feedN(G), awake:WZCAT.awake(G), held:WZCAT.held(), st:WZCAT.state(), inPark:PARK.inPark(P.x,P.z),
  lost:PARK.catLost?PARK.catLost(G):null, rainy:PARK.rainy?PARK.rainy(G):null, term:(CALENDAR.termOf(G.day)||{}).id+' w'+(CALENDAR.termOf(G.day)||{}).week, wz:{lost:G.flags.WZ_CAT_LOST,found:G.flags.WZ_CAT_FOUND,back:G.flags.WZ_CAT_BACK}}; })()"""
# 頁面裡每 200 ms 記貓的狀態（有變才記）：held、走路那一隻的狀態／位置、'wz_cat' 群組底下每一個物件（看得到嗎、高度：趴在圓椅上的 y≈0.47、走路的 y≈0）、對話
CAT_REC_JS = """(()=>{ if(window.__bbCat) return; window.__bbCat=[]; let last=''; const t0=performance.now(); setInterval(()=>{ try{
  const g=GAME.E.scene.getObjectByName('wz_cat'); const kids=g?g.children.map(o=>({v:!!o.visible,y:+o.position.y.toFixed(2),x:+o.position.x.toFixed(2),z:+o.position.z.toFixed(2),n:o.name||''})):null;
  const st=WZCAT.state(), r={held:WZCAT.held(), st:st&&{state:st.state,x:st.x,z:st.z,t:st.t}, dlg:!!(GAME.D&&GAME.D.active), txt:((document.getElementById('dlgText')||{}).textContent||'').slice(0,40), kids, gv:g?!!g.visible:null, h:+GAME.G.hour.toFixed(3)};
  const k=JSON.stringify([r.held,r.st&&r.st.state,r.st&&Math.round(r.st.x*2),r.st&&Math.round(r.st.z*2),r.dlg,r.txt,kids,r.gv]); if(k!==last){ last=k; r.ms=Math.round(performance.now()-t0); window.__bbCat.push(r); if(window.__bbCat.length>400) window.__bbCat.splice(0,100); } }catch(e){} },200); })()"""
CAT_NOW_JS = """(()=>{ const g=GAME.E.scene.getObjectByName('wz_cat'); const kids=g?g.children.map(o=>({v:!!o.visible,y:+o.position.y.toFixed(2),x:+o.position.x.toFixed(2),z:+o.position.z.toFixed(2),n:o.name||''})):null;
  const P=GAME.E.player.obj.position; return {held:WZCAT.held(), st:WZCAT.state(), kids, gv:g?!!g.visible:null, back:GAME.G.flags.WZ_CAT_BACK, playing:!!WZL.playing, p:[+P.x.toFixed(2),+P.z.toFixed(2)], h:+GAME.G.hour.toFixed(3)}; })()"""
# 趴著那一隻（看得到、y>0.3）在畫面上的位置：給放大截圖用
LIE_POS_JS = """(()=>{ const g=GAME.E.scene.getObjectByName('wz_cat'); if(!g) return null; const k=g.children.find(o=>o.visible&&o.position.y>0.3); if(!k) return null; const v=new THREE.Vector3(); k.getWorldPosition(v);
  const w=[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]; v.project(GAME.E.camera); return {world:w, sx:Math.round((v.x+1)/2*innerWidth), sy:Math.round((1-v.y)/2*innerHeight), on:v.z<1&&Math.abs(v.x)<=1&&Math.abs(v.y)<=1}; })()"""
BACK_LINE = '所長回來了，前腳纏著一圈繃帶，躺在樹下的圓椅上，和平常一樣不理人。'
OLD_LINE = '坐在樹下的圓椅前面'


def lie_kids(k): return [o for o in (k or []) if o['v'] and o['y'] > 0.3]
def walk_kids(k): return [o for o in (k or []) if o['v'] and o['y'] <= 0.3]


def zoom(path, x, y, out):
    try:
        from PIL import Image
        im = Image.open(path); W, H = im.size; x0, y0 = max(0, x - 130), max(0, y - 80); x1, y1 = min(W, x0 + 260), min(H, y0 + 160)
        im.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 3, (y1 - y0) * 3)).save(out); return out
    except Exception as e:
        return 'zoom failed %r' % e


async def m_catlie(pg, cdp, run, errs):
    await load(pg, base(), run, '[前置] 讀存檔（算日期用）'); await L.close_panels(pg, cdp)
    dd = await pg.evaluate(CAT_DAYS_JS); run.note('大三上第 11 週：%s' % J(dd))
    if dd['d11'] is None or dd['d10'] is None: run.check('算得出大三上第 10、11 週', False, J(dd)); return
    st = base(dd['d11'], 9.9, 'wenzhou', {'x': 26.0, 'z': 2.6, 'yaw': 0, 'lv': 0, 'y': 0}); st['weekday'] = dd['wd'] % 7; st['weather'] = 'clear'
    F = st.setdefault('flags', {}); F.update(B['TW']); F['WZ_CAT_LOST'] = dd['d10'] + 2
    for k in [k for k in list(F) if k in ('WZ_CAT_FOUND', 'WZ_CAT_BACK', 'WZ_CAT_SEARCH', 'WZ_CAT_WITH') or 'ADOPT' in k or k.startswith('ZQ_CAT')]: F.pop(k, None)
    pk = st.setdefault('daily', {}).setdefault('park', {}); pk['feedN'] = max(3, int(pk.get('feedN') or 0))
    await load(pg, st, run, '[前置] 存檔改到大三上第 11 週 %s（%s）09:54 溫州街主巷、公園入口 A 外面 (26,2.6)、晴天；EXCHANGE_ROUTE TW、WZ_CAT_LOST＝day %d、沒有 FOUND／BACK／SEARCH、feedN %d'
               % (dd['key'], '週六' if dd['sat'] else '週一', dd['d10'] + 2, pk['feedN']))
    await L.close_panels(pg, cdp); await settle(pg, cdp, 40, pref=[])
    pre = None
    for _ in range(30):   # 貓的正式模型載入、WZCAT.attach（白天醒著才接手）
        pre = await pg.evaluate(CAT_PRE_JS)
        if pre['st']: break
        await pg.wait_for_timeout(2000)
    run.note('走進公園以前：%s' % J(pre))
    run.check('前置成立：WZL.backDue、貓醒著（WZCAT.state 有東西）、還沒 hold、人在公園外面', pre['backDue'] and pre['awake'] and bool(pre['st']) and pre['held'] is None and not pre['inPark'], J(pre))
    await pg.evaluate(CAT_REC_JS); n = await pg.evaluate(LOGN)
    await L.turn_camera_to(pg, cdp, 26.0, 21.2)   # 先把鏡頭轉向圓椅（像玩家一樣用手指滑）
    ok = await L.go_to(pg, cdp, run, 26.0, 10.5, 0.6, '公園入口段（往圓椅那邊）', max_s=420, stop=lambda s: s['dlg'])
    s = await L.state(pg); t0 = time.time()
    while not s['dlg'] and time.time() - t0 < 120: await pg.wait_for_timeout(800); s = await L.state(pg)   # STORY.tick 每 30 格才看一次
    run.note('對話開始時：%s' % J(s))
    if not s['dlg']: run.check('走進公園：所長回來那一場開始', False, J(await pg.evaluate(CAT_NOW_JS))); return
    await pg.wait_for_timeout(2500)   # 字打完
    now = await pg.evaluate(CAT_NOW_JS); lines = await pg.evaluate(LOGS % n); s = await L.state(pg)
    run.note('演的時候：%s；台詞 %s' % (J(now), J(lines)))
    run.check('走進公園就開始（台詞「%s」）' % BACK_LINE, any(BACK_LINE in t for t in lines) or BACK_LINE[:20] in s['dtext'], J([lines, s['dtext']]))
    run.check('演的時候：WZCAT.held()＝lie', now['held'] == 'lie', J(now['held']))
    lk, wk = lie_kids(now['kids']), walk_kids(now['kids'])
    run.check('演的時候：圓椅上有一隻趴著的貓（看得到、y≈0.47）、走路的那一隻藏起來', len(lk) == 1 and abs(lk[0]['y'] - 0.47) < 0.06 and not wk and now['gv'] is True, J(now['kids']))
    await run.shot(pg, 'catlie_scene')
    lp = await pg.evaluate(LIE_POS_JS); run.note('趴著那一隻：%s' % J(lp))
    if lp and not lp['on']:
        await pg.evaluate("(([x,z])=>{ const P=GAME.E.player.obj.position; GAME.E.cam.yaw=Math.atan2(P.x-x,P.z-z); })(%s)" % J(lp['world'][::2]))
        run.setup('[捷徑] 趴著那一隻不在畫面裡：鏡頭 yaw 轉向圓椅（只為了截圖）'); await pg.wait_for_timeout(2500); lp = await pg.evaluate(LIE_POS_JS)
    await pg.evaluate(CLEAN + "(true)"); await pg.wait_for_timeout(900); run.setup('[捷徑] 藏起 ADV（模糊背景）與 HUD 截一張（只為了看清楚圓椅上的貓）')
    shot = await run.shot(pg, 'catlie_scene_clean'); await pg.evaluate(CLEAN + "(false)")
    if lp and lp['on'] and shot and os.path.exists(shot): run.note('放大：%s' % zoom(shot, lp['sx'], lp['sy'], shot.replace('.png', '_zoom.png')))
    # 點完對話
    t0 = time.time()
    while time.time() - t0 < 120:
        s = await L.state(pg)
        if s['choices']: ch = await pg.evaluate(CHOICES); run.note('選單 %s → 第一個' % J(ch)); await pick(pg, cdp, ch[0][:6]); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        nw = await pg.evaluate(CAT_NOW_JS)
        if not s['busy'] and not nw['playing']: break
        await pg.wait_for_timeout(600)
    await pg.wait_for_timeout(1500)
    aft = await pg.evaluate(CAT_NOW_JS); lines = await pg.evaluate(LOGS % n); run.note('演完：%s' % J(aft))
    run.check('沒有「%s」（舊的那一版）' % OLD_LINE, not any(OLD_LINE in t for t in lines), J(lines))
    run.check('演完：WZ_CAT_BACK 有記', aft['back'] is not None, J(aft['back']))
    lk, wk = lie_kids(aft['kids']), walk_kids(aft['kids'])
    run.check('演完：放開（held＝null）、趴著那一隻拿掉、走路的貓出來', aft['held'] is None and not lk and len(wk) >= 1 and bool(aft['st']), J(aft['kids']))
    await run.shot(pg, 'catlie_after_release')
    s0 = aft['st']; t0 = time.time(); moved = None; trace = []
    while s0 and time.time() - t0 < CATWAIT:
        await pg.wait_for_timeout(3000); s1 = await pg.evaluate("WZCAT.state()"); s = await L.state(pg)
        if s['dlg'] or s['choices']: run.note('等貓的時候有對話／選單：%s' % s['dtext']); await settle(pg, cdp, 60, pref=[]); continue
        if not s1: break
        trace.append([int(time.time() - t0), s1['state'], s1['x'], s1['z'], s1['t']])
        dmv = math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z'])
        if moved is None and dmv > 0.3: moved = (int(time.time() - t0), dmv, s1)
        if moved and time.time() - t0 > moved[0] + 9: break
    run.note('放開時 %s；之後 %s' % (J(s0), J(trace[-12:])))
    run.check('放開以後貓照常起來走（%d 秒內位置變了 0.3 m 以上）' % CATWAIT, bool(moved), J(moved) if moved else '放開時 state %s、t %s（t＝還要坐幾秒遊戲時間；update 每格最多 0.25 秒）' % (s0 and s0['state'], s0 and s0['t']))
    await run.shot(pg, 'catlie_after_walk')
    rec = await pg.evaluate("window.__bbCat||[]"); json.dump(rec, open(os.path.join(OUT, 'catlie_rec.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    run.note('貓的紀錄 %d 筆（catlie_rec.json）；held 的變化：%s' % (len(rec), J([[r['ms'], r['held'], r['dlg']] for r in rec if r.get('held') is not None or r.get('dlg')][:6])))


async def main():
    run = L.Run('rc12_items_%s' % MODE, OUT); os.makedirs(OUT, exist_ok=True)
    fn = {'quickgym': m_quickgym, 'pending': m_pending, 'catlie': m_catlie}.get(MODE)
    if not fn: print('不認得的 MODE：%s' % MODE); sys.exit(2)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); B['cdp_g'][0] = cdp
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        try:
            await fn(pg, cdp, run, errs)
        except Exception as e:
            run.check('工具沒有例外', False, repr(e)); await run.shot(pg, 'exception')
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE, 'URL', URL)
    sys.exit(run.finish())
asyncio.run(main())
