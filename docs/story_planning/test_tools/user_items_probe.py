"""BB-C 10-27：使用者回報過、在開發分支的幾件（BB_TEST_QUEUE_1027 5f、5j、5l、5m；開發分支 05069d928 起）瀏覽器驗收，一支用 MODE 分。
框架借 us_life_probe.py（HOOK 記台詞／字卡／提示、answer 照玩家回手機、SNAP），同 zrlast_probe.py 的做法（只借框架、不跑它的 main）。
不是 iPhone：Playwright 手機模擬（SwiftShader）。預設不用 ?turbo（turbo 把 GM.sleep 壓到 120 ms）；home_* 只看訊息和選單、不看動畫，可以在 URL 加 ?turbo 省時間。

MODE（環境變數）：
  closet       5l／X104 美國公寓 walk-in closet。【前置】存檔改成美國交換（US_DEPARTED／US_ARRIVED、EXCHANGE_ROUTE US）、2028-08-10 15:00 公寓。
               之後觸控走路：衣物間裡面 → 床邊 → 書桌（按「坐在書桌前」，坐下面向東牆）→ 洗手間門口（看得到浴缸）；15:00、21:00（【捷徑】撥時鐘）各截圖。
               舊存檔：【前置】存檔的位置放在書桌、浴缸、吊衣桿上（v2 存檔可能站在那裡）讀檔 → 站得住、走得到床邊。
  home_yes     5m 週四 20:00 家人群組回「會回去」→【捷徑】撥到提醒那天 07:05 宿舍 →「（這週末答應媽媽要回家。）」回家／晚一點／這次不回去 → 回家＝到家（kept）
  home_late    同上，選「晚一點」→ 12:00 不再問 →【捷徑】16:05 再問一次（回家／這次不回去）→ 這次不回去
  home_no      同上，選「這次不回去」→ 家人群組「這週回不去了」＋媽媽那一週「這週不回」那一句 → 下一個週四照平常
  home_ignore  回「會回去」以後整個週末在校園：週六 18:30「回來了沒」（現在回去／這週回不去了）不回 → 20:30 爸爸「？」→ 週日 21:30「菜冰起來了」→ 下一個週四媽媽那一句前面多「上禮拜煮多了 吃了三天」
  home_lateback  「回來了沒」19:30 回「現在回去」→ 空下來自己回家、過了 20:00 才到 → 晚餐「（媽媽把菜熱了一次。）」
  home_mother  母親節那一週（家人群組 k＝mom）回「會回去」、整個週末在校園 → 週日 21:00 姊姊「媽今天一直看手機」
  home_clash   使用者存檔 day 25（週末和可昕有約）：【前置】改回週四 day 23 19:54、拿掉 home_ask_23 和「可昕來台大」那一筆出遊 → 回「會回去」→
               【捷徑】把「可昕來台大」排回去（＝答應以後才接受可昕的週六邀約）→ 下一次空下來三選一（赴約，結束再回家／赴約，這週不回去／改天再約）→ 赴約，結束再回家 →
               【捷徑】提醒那天 07:05：提醒多一句「下午四點和可昕有約。」→ 赴約 → 出發、演完 → 約結束以後再問回家（回家／這次不回去）
  qsave        5f／X115 快速存檔、匯出：右上 💾 一按兩個按鈕（橫向、直向各截圖，看位置擋不擋東西）；快速存檔＝提示「已存檔：月/日 時:分」、自動存檔是那個時間、回標題「繼續」讀得回來；
               劇情對話中：💾 半透明還在、按 💾 不會翻下一句、快速存檔＝提示劇情進行中不存、匯出＝下載得到檔案而且有 _busy；匯出的檔用「匯入」讀回來正常（不卡、走得動）
  clip_lines   5j／X106 羽球短片的台詞與次數：PARTNER（heroine_03 語彤，預設／heroine_01 以安）、NTH＝1（第一次，預設）／2（第二次）、SKIP＝1（跳過）。
               手機「朋友 → 約 → 去新體育館打羽球 → 今天的時段」（答應那一句）→【捷徑】撥到約好前 12 分鐘 → 手機「地點」快速前往新體育館 → 見面 → 短片 →
               第一次：她那一句（語彤「……你說不笑的。」／以安「替補也是校隊。」）→「（你們打了一個小時……）」→ 時間往前 → 結束那一句；第二次：只有中段、沒有那一句；
               跳過：沒有那一句、對話框照常回來；播的時候不會出現「畫面好像停住了」。截圖：每個鏡頭、結尾她的臉。
  parkB        5j B08 小公園入口 B：【前置】溫州街 15:00、站在北巷入口 B 外面（WZ_PARK_LAYOUT.area.entranceB 西邊 2.2 m）→ 用搖桿（先把鏡頭轉向下一個點、往前推）走進入口 B、進主園區、到老茄苳旁邊。
               另外：週二 17:05 課輔班那一場照舊（孩子從入口 B 走到入口 A：看 CROWD 的路線起點在入口 B 那一側、整排有人在公園裡走）。
  texdedup     5j PERF-TEX-DEDUP-1027 貼圖去重複：校園 → 溫州街 → 兩點半 Café → 校園，來回兩次（手機「地點」快速前往；沒有那一項才【捷徑】GAME.enter）。
               每到一個區域：【捷徑】時鐘撥到 14:00（光線一樣才比得了）、藏 HUD 截一張圖；頁面內盤點場景裡每個材質的貼圖。判斷法見下面 TEX_JS 和 check 的說明。
用法：LW_TESTS=<工作樹>/tests MODE=<上面其中一個> python3 user_items_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]
  存檔預設 scratchpad bbtest/p0an/user_day14.json（法律系 day 14）；home_clash 預設 bbtest/p0an/user_day25.json（使用者 10-27 上傳，開發分支 wip_backup/saves/fatiao3d_save_day25_1027.json）。
  home_* 預設關掉條件事件（QUIET＝1；跳到幾週以後的日子，避免中間的劇情插進來；HPROM 走 STORY.PHONE_RULES／STORY.TICKS，不受影響）。QUIET=0 照開。"""
import os, sys, json, asyncio, time, copy, math
HERE = os.path.dirname(os.path.abspath(__file__))
SP = '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an'
MODE = os.environ.get('MODE', 'closet')
if len(sys.argv) < 4: sys.argv.append(os.path.join(SP, 'user_day25.json' if MODE == 'home_clash' else 'user_day14.json'))
src = open(os.path.join(HERE, 'us_life_probe.py'), encoding='utf-8').read()
src = src[:src.rindex('asyncio.run(main())')]   # 只借框架（不跑它的 main）
B = {'__name__': 'us_life_base', '__file__': os.path.join(HERE, 'us_life_probe.py')}
exec(compile(src, 'us_life_probe.py', 'exec'), B)
L, SNAP = B['L'], B['SNAP']
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE); SAVE.pop('_stuck', None); SAVE.pop('_busy', None)
QUIET = os.environ.get('QUIET', '1' if MODE.startswith('home_') else '0') == '1'
PARTNER = os.environ.get('PARTNER', 'heroine_03'); NTH = int(os.environ.get('NTH', '1')); SKIP = os.environ.get('SKIP') == '1'
J = lambda o: json.dumps(o, ensure_ascii=False)

# ---------- 共用 ----------
JUMP_JS = "(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key+' '+h.toFixed(2); })(%s)"
HOME_MSGS = "(n=>(GAME.G.msgs||[]).slice(n).filter(m=>{ const t=PHONE.th(m); return t==='g:home'||t==='p:sister'; }).map(m=>(m.from==='player'?'祐廷':(m.name||m.from))+'：'+m.text))(%d)"
PROMISE = "(()=>{ const p=typeof HPROM!=='undefined'?HPROM.get(GAME.G):null; return p?{ask:p.ask,k:p.k,st:p.st,rd:p.rd,sat:p.sat,sun:p.sun,from:p.from,to:p.to,no:p.no,after:p.after||null,late:p.late==null?null:p.late,seen:p.seen||[]}:null; })()"
LOGN = "(window.__LOG||[]).length"
LOGS = "(n=>(window.__LOG||[]).slice(n).map(x=>(x.n?x.n+'｜':'')+x.t))(%d)"
CHOICES = "[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>b.textContent.trim())"
# 「畫面好像停住了」（game3d.js staleCheck 的 toast）、所有 toast：頁面內每 100 ms 看 #toast 的字有沒有換（內部的 toast() 不經過 GAME.toast，HOOK 抓不到）
TOASTW = "(()=>{ if(window.__bbToast) return; window.__bbToast=[]; let last=''; setInterval(()=>{ const e=document.getElementById('toast'); const t=e&&!e.classList.contains('hide')&&+getComputedStyle(e).opacity>0.05?(e.textContent||''):''; if(t&&t!==last) window.__bbToast.push({t, h:GAME.G?+GAME.G.hour.toFixed(2):null}); last=t; },100); })()"


async def load(pg, st, run, desc, quiet=None):
    await L.load_state(pg, st, quiet_events=QUIET if quiet is None else quiet, quiet_phone=True); await pg.wait_for_timeout(4500)
    await pg.evaluate(B['HOOK']); await pg.evaluate(TOASTW)
    run.setup(desc)


async def jump(pg, run, d, h, why):
    k = await pg.evaluate(JUMP_JS % J([d, h])); run.setup('[捷徑] 日子時間撥到 %s（%s）' % (k, why)); await pg.wait_for_timeout(2500); return k


async def wait_hour(pg, cdp, h, secs=600, stop_on_choices=True, tap_dlg=True):
    """遊戲時間照走到 h（對話照點；有選單就停下來交給呼叫的人；手機自己打開不關——要回的訊息由呼叫的人回）。回傳最後的 SNAP"""
    t0 = time.time()
    while time.time() - t0 < secs:
        sn = await pg.evaluate(SNAP); s = await L.state(pg)
        if s['choices'] and stop_on_choices: return sn
        if s['dlg'] and tap_dlg: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if sn['h'] >= h: return sn
        await pg.wait_for_timeout(1200)
    return await pg.evaluate(SNAP)


async def wait_choices(pg, cdp, secs=120):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']: return await pg.evaluate(CHOICES)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(700)
    return []


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


async def wd_of(pg, d): return await pg.evaluate("(d=>CALENDAR.dateOf(d).wd%%7)(%d)" % d)


# ---------- 5l 美國公寓 ----------
APT = """(()=>{ const L=US_APARTMENT_LAYOUT, R=id=>L.rooms.find(r=>r.id===id), F=t=>L.furniture.find(f=>f.type===t), D=id=>L.doors.find(d=>d.id===id);
  const cl=R('closet'), bt=R('bath'), bed=F('bed'), desk=F('desk'), tub=F('tub'), rods=L.furniture.find(f=>f.type==='closetRods'), bd=D('bath'), cd=D('closet');
  return {closet:[(Math.max(cl.x0,1.4)+cl.x1)/2,(cl.z0+cl.z1)/2-0.4], closetBox:[cl.x0,cl.x1,cl.z0,cl.z1], closetDoorOpen:!!(cd&&cd.openDoor), rods:!!(rods&&rods.west&&rods.south),
    bed:[bed.x,bed.z], desk:[desk.x,desk.z], tub:[(tub.x0+tub.x1)/2,(tub.z0+tub.z1)/2], bathDoor:[bd.x,bd.z+0.25], bathDoorOpen:!!bd.openDoor, rodPt:[cl.x0+0.15,(cl.z0+cl.z1)/2],
    spawn:[L.spawns.bedroom.x,L.spawns.bedroom.z]}; })()"""
USF = dict(B['USF'])


async def apt_shots(pg, cdp, run, A, tag):
    await L.go_to(pg, cdp, run, A['closet'][0], A['closet'][1], 0.5, '衣物間裡面', max_s=180)
    await L.turn_camera_to(pg, cdp, A['closet'][0] - 2, A['closet'][1] + 1); await run.shot(pg, '%s_closet' % tag)
    await L.go_to(pg, cdp, run, A['bathDoor'][0], A['bathDoor'][1], 0.4, '洗手間門口', max_s=180)
    await L.turn_camera_to(pg, cdp, A['tub'][0], A['tub'][1]); await run.shot(pg, '%s_bath' % tag)


async def m_closet(pg, cdp, run, errs):
    d = await pg.evaluate("STORY.dayOfKey('2028-08-10')")
    st = base(d, 15.0, 'us_apartment'); st['flags'] = dict(st.get('flags', {}), **USF); st['flags']['US_ARRIVED_DAY'] = await pg.evaluate("STORY.dayOfKey('2028-08-02')"); st['flags']['Y4_PATH_DAY'] = await pg.evaluate("STORY.dayOfKey('2028-06-08')")
    await load(pg, st, run, '[前置] 使用者存檔改成美國交換（%s）、2028-08-10 15:00 公寓' % J(USF))
    await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[])
    A = await pg.evaluate(APT); run.note('配置：%s' % J(A))
    run.check('衣物間的門開著、裡面有吊衣桿（配置）', A['closetDoorOpen'] and A['rods'], J([A['closetDoorOpen'], A['rods']]))
    ok = await L.go_to(pg, cdp, run, A['closet'][0], A['closet'][1], 0.5, '衣物間裡面', max_s=240); s = await L.state(pg)
    inside = A['closetBox'][0] - 0.05 <= s['x'] <= A['closetBox'][1] + 0.05 and A['closetBox'][2] - 0.05 <= s['z'] <= A['closetBox'][3] + 0.05
    run.check('觸控走得進衣物間（人在衣物間範圍裡、站得住）', ok and inside and s['stand'], J(s))
    await L.turn_camera_to(pg, cdp, A['closet'][0] - 2, A['closet'][1] + 1); await run.shot(pg, '15_closet')
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.label==='睡覺'); return it?[it.x,it.z]:null; })()")
    ok = bool(bed) and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.9, '床邊', max_s=240); s = await L.state(pg)
    run.check('走得到床邊（互動鍵「睡覺」）', ok and '睡覺' in s['interact'], J(s)); await run.shot(pg, '15_bed')
    dk = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.label==='坐在書桌前'); return it?[it.x,it.z]:null; })()")
    ok = bool(dk) and await L.go_to(pg, cdp, run, dk[0], dk[1], 0.9, '書桌', max_s=240)
    for _ in range(8):
        if '書桌' in (await L.state(pg))['interact']: break
        await pg.wait_for_timeout(700)
    SEAT = "(()=>{ const P=GAME.E.player; return {seat:!!P.seat, pose:P.pose, yaw:+P.obj.rotation.y.toFixed(2)}; })()"
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); seat = await pg.evaluate(SEAT)
    if not seat['seat']:   # 有選單：只選「坐」那一項（不選讀書，免得時間往前、讀完站起來）
        ch = await pg.evaluate(CHOICES); w = next((c for c in ch if '坐' in c), None)
        if w: await pick(pg, cdp, w[:4]); await pg.wait_for_timeout(2500)
        for _ in range(6):
            seat = await pg.evaluate(SEAT)
            if seat['seat']: break
            if (await L.state(pg))['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(800)
    run.note('按「坐在書桌前」以後：%s；選單 %s' % (J(seat), J(await pg.evaluate(CHOICES))))
    yaw = seat['yaw']; east = abs(math.atan2(math.sin(yaw - math.pi / 2), math.cos(yaw - math.pi / 2))) < 0.5
    run.check('書桌：坐下（pose sit／read）、面向東牆（yaw≈π/2）', ok and seat['seat'] and seat['pose'] in ('sit', 'read') and east, J(seat)); await run.shot(pg, '15_desk')
    await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=3)   # 起來（往後推搖桿）
    ok = await L.go_to(pg, cdp, run, A['bathDoor'][0], A['bathDoor'][1], 0.4, '洗手間門口', max_s=240); s = await L.state(pg)
    run.check('走得到洗手間門口（門開著、站得住）', ok and s['stand'] and A['bathDoorOpen'], J(s))
    await L.turn_camera_to(pg, cdp, A['tub'][0], A['tub'][1]); await run.shot(pg, '15_bath')
    vis = await pg.evaluate("(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&/tub|bath/i.test(o.name||'')&&o.visible) n++; }); return n; })()")
    run.note('場景裡名字有 tub／bath 的 mesh：%d 個（看截圖確認浴缸靠南牆）' % vis)
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(21.0)"); run.setup('[捷徑] 時鐘撥到 21:00'); await pg.wait_for_timeout(3000)
    await apt_shots(pg, cdp, run, A, '21')
    # 舊存檔：站在書桌、浴缸、吊衣桿上讀檔
    for nm, p in (('書桌', A['desk']), ('浴缸', A['tub']), ('吊衣桿', A['rodPt'])):
        st2 = base(d, 15.5, 'us_apartment', {'x': p[0], 'z': p[1], 'yaw': 0, 'lv': 0, 'y': 0}); st2['flags'] = st['flags']
        await load(pg, st2, run, '[前置] 舊存檔：位置在%s（%.2f,%.2f）讀檔' % (nm, p[0], p[1])); await L.close_panels(pg, cdp); await settle(pg, cdp, 40, pref=[])
        s = await L.state(pg); ok = bool(bed) and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.9, '床邊', max_s=180)
        run.check('舊存檔站在%s：讀檔以後站得住、走得到床邊' % nm, s['stand'] and ok, J(s))


# ---------- 5m 答應媽媽回家 ----------
THU_JS = """(want=>{ for(let d=0; d<420; d++){ const t=CALENDAR.termOf(d); if(!t||CALENDAR.dateOf(d).wd!==4) continue;
    if(want==='mom'){ if(t.id!=='Y1S2') continue; const g=HOME.grpPick(GAME.G,d); if(g&&g.k==='mom') return {d,k:g.k,key:CALENDAR.dateOf(d).key,week:t.week}; continue; }
    if(t.id!=='Y1S1'||t.week<4||d<=GAME.G.day) continue; const g=HOME.grpPick(GAME.G,d), k=g&&g.k;
    if(/^(p1|p3|old)$/.test(k||'')&&!CALENDAR.holiday(d+1)&&!CALENDAR.holiday(d+4)) return {d,k,key:CALENDAR.dateOf(d).key,week:t.week}; } return null; })(%s)"""


async def thursday_yes(pg, cdp, run, want=None, day=None):
    """【前置】週四 19:54 宿舍、在家人群組 → 照走到 20:00 → 手機回第一個選項（會回去）→ 約定記下來"""
    if day is None:
        th = await pg.evaluate(THU_JS % J(want or 'plain')); run.note('週四：%s' % J(th))
        if not th: run.check('找得到合適的週四（家人群組有問）', False); return None, None
        day = th['d']
    st = base(day, 19.9, 'dorm'); st['msgs'] = [m for m in st.get('msgs', []) if not str((m.get('ask') or {}).get('id', '')).startswith('home_ask_') or m.get('day', 0) < day - 7]
    st.setdefault('home', {}).pop('promise', None); st['home']['at'] = False
    await load(pg, st, run, '[前置] 存檔改到週四 %d 19:54 宿舍（家人群組）' % day); await L.close_panels(pg, cdp)
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    await wait_hour(pg, cdp, 20.08, secs=420, stop_on_choices=False)
    for _ in range(10):
        q = await pg.evaluate("(d=>{ const m=(GAME.G.msgs||[]).find(x=>x.ask&&x.ask.id==='home_ask_'+d); return m?{text:m.text,k:m.ask.k,opts:m.ask.opts.map(o=>o.t),ans:m.ans}:null; })(%d)" % day)
        if q: break
        await pg.wait_for_timeout(1500)
    run.check('週四 20:00 家人群組有要回的那一則', bool(q), J(q))
    if not q: return day, None
    await B['answer'](pg, cdp, {'home_ask_%d' % day: q['opts'][0]}); await B['close_phone'](pg); await pg.wait_for_timeout(1500)
    p = await pg.evaluate(PROMISE)
    run.check('回「%s」→ 記下約定（open、那個週末）' % q['opts'][0], bool(p) and p['st'] == 'open' and p['ask'] == day, J(p))
    run.note('週四之後的家人群組：%s' % J(await pg.evaluate(HOME_MSGS % n0)))
    return day, p


async def remind(pg, cdp, run, p, h=7.08, zone='dorm'):
    await jump(pg, run, p['rd'], h, '提醒那天、人在宿舍')
    n = await pg.evaluate(LOGN); ch = await wait_choices(pg, cdp, 150); lines = await pg.evaluate(LOGS % n)
    return ch, lines


async def m_home(pg, cdp, run, errs):
    await load(pg, base(), run, '[前置] 讀存檔（找週四用）'); await L.close_panels(pg, cdp)
    REM = '（這週末答應媽媽要回家。）'
    if MODE == 'home_clash':
        st0 = base(); day = 23
        st0['outings'] = [o for o in st0.get('outings', []) if o.get('id') != 'kx_ntu']; kx = next((o for o in SAVE.get('outings', []) if o.get('id') == 'kx_ntu'), None)
        SAVE['outings'] = st0['outings']   # thursday_yes 用 base()：先拿掉「可昕來台大」
        day, p = await thursday_yes(pg, cdp, run, day=day)
        if not p: return
        kx = dict(kx or {}, state='planned'); kx.pop('ask', None)
        await pg.evaluate("(o=>{ GAME.G.outings=(GAME.G.outings||[]).filter(x=>x.id!==o.id); GAME.G.outings.push(o); })(%s)" % J(kx))
        run.setup('[捷徑] 「可昕來台大：去社科院門口」（day 25 16:00）排回去＝答應以後才接受可昕的週六邀約')
        n = await pg.evaluate(LOGN); ch = await wait_choices(pg, cdp, 120); lines = await pg.evaluate(LOGS % n)
        run.check('答應以後多了一個約：下一次空下來問三選一（赴約，結束再回家／赴約，這週不回去／改天再約）', ch == ['赴約，結束再回家', '赴約，這週不回去', '改天再約'] and any(REM in t for t in lines), J([lines, ch]))
        m0 = await pg.evaluate("(GAME.G.msgs||[]).length"); await pick(pg, cdp, '赴約，結束再回家'); await settle(pg, cdp, 30)
        g = await pg.evaluate(HOME_MSGS % m0); run.check('赴約，結束再回家：群組「禮拜…有事 晚一點回去」＋媽媽「好 晚餐留給你」', any('有事 晚一點回去' in t for t in g) and '媽媽：好 晚餐留給你' in g, J(g))
        p = await pg.evaluate(PROMISE); ch, lines = await remind(pg, cdp, run, p)
        run.check('提醒那天早上：提醒多一句「下午四點和可昕有約。」、選項 赴約，結束再回家／這次不回去', any('下午四點和可昕有約。' in t for t in lines) and ch == ['赴約，結束再回家', '這次不回去'], J([lines, ch]))
        await pick(pg, cdp, '赴約，結束再回家'); await settle(pg, cdp, 30); p = await pg.evaluate(PROMISE)
        run.check('記下約結束的時間（after）', bool(p) and p['after'] is not None, J(p))
        await jump(pg, run, 25, 15.6, '可昕的約出發以前'); n = await pg.evaluate(LOGN)
        ch = await wait_choices(pg, cdp, 240); run.note('出發的選單：%s' % J(ch))
        if any(c.startswith('出發') for c in ch): await pick(pg, cdp, '出發')
        t0 = time.time(); asked = None
        while time.time() - t0 < 600:   # 赴約、演完；約結束以後第一次空下來＝再問
            s = await L.state(pg)
            if s['choices']:
                c = await pg.evaluate(CHOICES)
                if c == ['回家', '這次不回去']: asked = c; break
                await pick(pg, cdp, c[0]); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            await pg.wait_for_timeout(1000)
        lines = await pg.evaluate(LOGS % n); run.note('赴約：%s' % J(lines[-25:]))
        run.check('赴約演完；約結束以後再問「回家／這次不回去」', bool(asked), J(await pg.evaluate(SNAP)))
        if asked:
            await pick(pg, cdp, '回家'); await settle(pg, cdp, 60, pref=[]); p = await pg.evaluate(PROMISE)
            run.check('回家＝到家（kept）', bool(p) and p['st'] == 'kept' and await pg.evaluate("HOME.at(GAME.G)"), J(p))
        return
    day, p = await thursday_yes(pg, cdp, run, want='mom' if MODE == 'home_mother' else None)
    if not p: return
    if MODE in ('home_yes', 'home_late', 'home_no'):
        ch, lines = await remind(pg, cdp, run, p)
        run.check('提醒那天 07:05 在宿舍：「%s」、選項 回家／晚一點／這次不回去' % REM, any(REM in t for t in lines) and ch == ['回家', '晚一點', '這次不回去'], J([lines, ch]))
        m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
        if MODE == 'home_yes':
            await pick(pg, cdp, '回家'); await settle(pg, cdp, 120, pref=[]); p2 = await pg.evaluate(PROMISE)
            run.check('回家＝到家（HOME.at）、約定 kept', await pg.evaluate("HOME.at(GAME.G)") and p2 and p2['st'] == 'kept', J(p2)); await run.shot(pg, 'home_arrived')
        elif MODE == 'home_late':
            await pick(pg, cdp, '晚一點'); await settle(pg, cdp, 30)
            await jump(pg, run, p['rd'], 12.0, '中午，人在宿舍'); ch2 = await wait_choices(pg, cdp, 40)
            run.check('晚一點：中午不再問', not ch2, J(ch2))
            await jump(pg, run, p['rd'], 16.08, '16:00 以後，人在宿舍'); n = await pg.evaluate(LOGN); ch3 = await wait_choices(pg, cdp, 150)
            run.check('16:00 以後再問一次：只有 回家／這次不回去', ch3 == ['回家', '這次不回去'] and any(REM in t for t in await pg.evaluate(LOGS % n)), J(ch3))
            await pick(pg, cdp, '這次不回去'); await settle(pg, cdp, 30)
        else:
            await pick(pg, cdp, '這次不回去'); await settle(pg, cdp, 30)
        if MODE in ('home_late', 'home_no'):
            await pg.wait_for_timeout(2000); g = await pg.evaluate(HOME_MSGS % m0); p2 = await pg.evaluate(PROMISE)
            run.check('這次不回去：群組「祐廷：這週回不去了」＋媽媽那一週的「這週不回」那一句、told', '祐廷：這週回不去了' in g and all(('媽媽：' + t) in g for t in (p['no'] or [])) and p2['st'] == 'told', J([g, p['no'], p2]))
            await jump(pg, run, day + 7, 19.9, '下一個週四'); m1 = await pg.evaluate("(GAME.G.msgs||[]).length")
            await wait_hour(pg, cdp, 20.1, secs=300, stop_on_choices=False); await B['close_phone'](pg)
            g2 = await pg.evaluate(HOME_MSGS % m1); run.check('說了不回去：下一個週四照平常（沒有「上禮拜煮多了」）', g2 and not any('上禮拜煮多了' in t for t in g2), J(g2))
        return
    # home_ignore／home_lateback／home_mother：整個週末不在宿舍（校園）
    await jump(pg, run, p['sat'], 12.0, '週六中午'); await pg.evaluate("void GAME.enter('campus')"); run.setup('[捷徑] 人在校園（不在宿舍＝早上的提醒不出）'); await pg.wait_for_timeout(6000)
    await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[])
    m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    await jump(pg, run, p['sat'], 18.42, '週六 18:25 校園'); await wait_hour(pg, cdp, 18.6, secs=360, stop_on_choices=False)
    q = await pg.evaluate("(d=>{ const m=(GAME.G.msgs||[]).find(x=>x.ask&&x.ask.id==='home_ask_back_'+d); return m?{text:m.text,opts:m.ask.opts.map(o=>o.t)}:null; })(%d)" % p['sat'])
    if MODE == 'home_mother':
        await B['close_phone'](pg)
        await jump(pg, run, p['sun'], 20.9, '週日 20:54 校園'); await wait_hour(pg, cdp, 21.1, secs=360, stop_on_choices=False); await B['close_phone'](pg)
        g = await pg.evaluate(HOME_MSGS % m0); run.check('母親節那一週沒回去：週日 21:00 姊姊「媽今天一直看手機」', '姊姊：媽今天一直看手機' in g, J(g)); return
    run.check('週六 18:30 媽媽「回來了沒」、選項 現在回去／這週回不去了', bool(q) and q['text'] == '回來了沒' and q['opts'] == ['現在回去', '這週回不去了'], J(q))
    if MODE == 'home_lateback':
        await jump(pg, run, p['sat'], 19.45, '週六 19:27 校園'); await B['answer'](pg, cdp, {'home_ask_back_%d' % p['sat']: '現在回去'}); await B['close_phone'](pg)
        n = await pg.evaluate(LOGN); t0 = time.time()
        while time.time() - t0 < 240 and not await pg.evaluate("HOME.at(GAME.G)"):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(1000)
        sn = await pg.evaluate(SNAP); await settle(pg, cdp, 120, pref=[]); lines = await pg.evaluate(LOGS % n)
        run.check('回「現在回去」：空下來自己回家', await pg.evaluate("HOME.at(GAME.G)"), J(sn))
        run.check('過了 20:00 才到：晚餐「（媽媽把菜熱了一次。）」', any('（媽媽把菜熱了一次。）' in t for t in lines), J(lines[-15:])); return
    await B['close_phone'](pg)
    await jump(pg, run, p['sat'], 20.42, '週六 20:25（「回來了沒」兩小時沒回）'); await wait_hour(pg, cdp, 20.6, secs=360, stop_on_choices=False); await B['close_phone'](pg)
    g = await pg.evaluate(HOME_MSGS % m0); run.check('兩小時沒回：爸爸「？」', any(t.startswith('爸爸：？') for t in g), J(g))
    await jump(pg, run, p['sun'], 21.42, '週日 21:25'); await wait_hour(pg, cdp, 21.6, secs=360, stop_on_choices=False); await B['close_phone'](pg)
    g = await pg.evaluate(HOME_MSGS % m0); p2 = await pg.evaluate(PROMISE)
    run.check('週日 21:30 媽媽「菜冰起來了」、missed', '媽媽：菜冰起來了' in g and p2 and p2['st'] == 'missed', J([g, p2]))
    await jump(pg, run, day + 7, 19.9, '下一個週四'); m1 = await pg.evaluate("(GAME.G.msgs||[]).length")
    await wait_hour(pg, cdp, 20.1, secs=360, stop_on_choices=False); await B['close_phone'](pg)
    g2 = await pg.evaluate(HOME_MSGS % m1); i = g2.index('媽媽：上禮拜煮多了 吃了三天') if '媽媽：上禮拜煮多了 吃了三天' in g2 else -1
    run.check('下一個週四：媽媽那一句前面多「上禮拜煮多了 吃了三天」', i >= 0 and i + 1 < len(g2) and g2[i + 1].startswith('媽媽：'), J(g2))


# ---------- 5f 快速存檔、匯出 ----------
RECT = "(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(), cs=getComputedStyle(e); return {x:r.left,y:r.top,w:r.width,h:r.height,op:+cs.opacity,vis:cs.visibility!=='hidden'&&cs.display!=='none'&&!e.classList.contains('hide')}; })(%s)"
HUDS = ['#btnPhone', '#btnMenu', '#money', '#minimap', '#hud', '#interact', '#joy', '#ctlR', '#clockT']


async def layout_check(pg, cdp, run, tag):
    await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(700)
    vw = await pg.evaluate("[innerWidth,innerHeight]"); q = await pg.evaluate(RECT % J('#btnQuick')); pop = await pg.evaluate(RECT % J('#quickPop'))
    over = []
    for sel in HUDS:
        r = await pg.evaluate(RECT % J(sel))
        if not r or not r['vis'] or r['op'] < 0.05 or r['w'] == 0: continue
        for nm, a in (('💾', q), ('選單', pop)):
            if not a: continue
            ix = min(a['x'] + a['w'], r['x'] + r['w']) - max(a['x'], r['x']); iy = min(a['y'] + a['h'], r['y'] + r['h']) - max(a['y'], r['y'])
            if ix > 2 and iy > 2: over.append('%s 蓋到 %s（%.0f×%.0f）' % (nm, sel, ix, iy))
    inside = bool(pop) and pop['vis'] and pop['x'] >= 0 and pop['y'] >= 0 and pop['x'] + pop['w'] <= vw[0] + 1 and pop['y'] + pop['h'] <= vw[1] + 1
    await run.shot(pg, 'qsave_%s' % tag)
    run.check('%s：💾 一按出兩個按鈕（快速存檔、匯出存檔檔案），整個在畫面裡' % tag, inside and await pg.evaluate("!!document.getElementById('btnQuickSave')&&!!document.getElementById('btnQuickExport')"), J([vw, pop]))
    run.check('%s：💾 本身不擋別的按鈕（選單打開時蓋到的另外記）' % tag, not [o for o in over if o.startswith('💾')], '；'.join(over))
    run.note('%s 選單打開時蓋到：%s（看截圖判斷）' % (tag, '；'.join([o for o in over if o.startswith('選單')]) or '沒有'))
    await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(500)


async def m_qsave(pg, cdp, run, errs):
    await load(pg, base(), run, '[前置] 讀使用者存檔（day 14 麵店）', quiet=False); await L.close_panels(pg, cdp)
    await settle(pg, cdp, 60, pref=['不用了', '算了', '先不', '就這樣', '不了', '離開'])
    await layout_check(pg, cdp, run, '橫向')
    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2500)
    await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r) r.classList.remove('want'); })()")
    await layout_check(pg, cdp, run, '直向')
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(2500)
    # 平常：快速存檔
    await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(600); n0 = await pg.evaluate("window.__bbToast.length")
    await L.tap(pg, cdp, '#btnQuickSave'); await pg.wait_for_timeout(1500)
    toasts = await pg.evaluate("window.__bbToast.slice(%d).map(x=>x.t)" % n0)
    auto = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'); return s?{day:s.day,hour:s.hour,busy:!!s._busy}:null; }catch(e){ return String(e); } })()")
    want = await pg.evaluate("(a=>{ if(!a) return null; const d=CALENDAR.dateOf(a.day), h=((a.hour%24)+24)%24, p2=n=>String(n).padStart(2,'0'); return '已存檔：'+d.m+'/'+d.d+' '+p2(Math.floor(h))+':'+p2(Math.floor((h%1)*60)); })(%s)" % J(auto))
    run.check('快速存檔：提示「已存檔：月/日 時:分」＝自動存檔那一格的時間', bool(want) and want in toasts, J([toasts, auto, want]))
    # 回標題 → 繼續（自動存檔）
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#menu .tabs button[data-tab="settings"]'); await pg.wait_for_timeout(600)
    await L.tap(pg, cdp, '#btnTitle'); await pg.wait_for_timeout(2500)
    auto2 = await pg.evaluate("(()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'); return s?{day:s.day,hour:+s.hour.toFixed(3)}:null; })()")
    await L.tap(pg, cdp, '#btnContinue')
    for _ in range(60):
        if await pg.evaluate("document.getElementById('titleScreen').classList.contains('hide')&&!!GAME.G&&!!GAME.E.player"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
    g = await pg.evaluate("({day:GAME.G.day,hour:+GAME.G.hour.toFixed(3),zone:GAME.G.zone})")
    run.check('回標題「繼續（自動存檔）」讀得回來：日子一樣、時間不早於快速存檔那一刻（回標題時會再自動存一次）', g['day'] == auto['day'] and auto['hour'] - 0.01 <= g['hour'] <= auto['hour'] + 1.0, J([auto, auto2, g]))
    await pg.evaluate(B['HOOK']); await pg.evaluate(TOASTW)
    # 劇情對話中
    who = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const n=(GAME.E.npcs||[]).filter(m=>m&&m.obj&&m.talk&&!m.hidden).sort((a,b)=>a.obj.position.distanceTo(P)-b.obj.position.distanceTo(P))[0]; return n?[n.obj.position.x,n.obj.position.z,n.charId||n.id]:null; })()")
    started = False
    if who:
        await L.go_to(pg, cdp, run, who[0], who[1], 1.3, '最近的人（%s）' % who[2], max_s=120)
        for _ in range(10):
            if '說話' in (await L.state(pg))['interact']: break
            await pg.wait_for_timeout(700)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
        for _ in range(10):
            s = await L.state(pg)
            if s['dlg']: started = True; break
            if s['choices']: await pick(pg, cdp, (await pg.evaluate(CHOICES))[0])
            await pg.wait_for_timeout(700)
    if not started:
        run.setup('[捷徑] 附近找不到能說話的人：頁面內開一段兩句的對話（GAME.sceneBegin＋GAME.say）')
        await pg.evaluate("void (async()=>{ GAME.sceneBegin(); try{ await GAME.say(null,'（BB 測試：第一句。）'); await GAME.say(null,'（BB 測試：第二句。）'); } finally { GAME.sceneEnd(); } })()"); await pg.wait_for_timeout(1500)
    s = await L.state(pg); q = await pg.evaluate(RECT % J('#btnQuick'))
    run.check('劇情對話中：💾 半透明還在（opacity 約 0.55）', s['dlg'] and q and q['vis'] and 0.3 <= q['op'] <= 0.8, J([s['dtext'], q]))
    t0 = s['dtext']; await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(1200); s1 = await L.state(pg); pop = await pg.evaluate(RECT % J('#quickPop'))
    run.check('按 💾 不會順便翻下一句（對話還是同一句）、兩個按鈕出來', s1['dlg'] and s1['dtext'] == t0 and pop and pop['vis'], J([t0, s1['dtext'], pop]))
    auto_b = await pg.evaluate("localStorage.getItem('fatiao3d_auto')"); n0 = await pg.evaluate("window.__bbToast.length")
    await L.tap(pg, cdp, '#btnQuickSave'); await pg.wait_for_timeout(1500)
    toasts = await pg.evaluate("window.__bbToast.slice(%d).map(x=>x.t)" % n0); same = auto_b == await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
    run.check('劇情中按「快速存檔」＝提示劇情進行中、不存（自動存檔沒變）', any('劇情進行中' in t for t in toasts) and same, J(toasts))
    await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(800)
    dl_path = None
    try:
        async with pg.expect_download(timeout=20000) as dli:
            await L.tap(pg, cdp, '#btnQuickExport')
        dl = await dli.value; dl_path = os.path.join(OUT, 'export_busy.json'); await dl.save_as(dl_path)
    except Exception as e:
        run.note('匯出沒有下載事件：%s' % e)
    ex = json.load(open(dl_path, encoding='utf-8')) if dl_path and os.path.exists(dl_path) else None
    run.check('劇情中按「匯出存檔檔案」：下載得到檔案、裡面有 _busy（depth、by）', bool(ex) and isinstance(ex.get('_busy'), dict) and ex['_busy'].get('depth', 0) > 0, J((ex or {}).get('_busy')))
    s2 = await L.state(pg); run.check('匯出以後對話還在原本那一句（沒有被翻掉）', s2['dlg'] and s2['dtext'] == t0, J([t0, s2['dtext']]))
    await settle(pg, cdp, 120, pref=[]); await settle(pg, cdp, 30, pref=[(await pg.evaluate(CHOICES) or [''])[-1]])
    # 匯入讀回來
    if ex:
        await L.close_panels(pg, cdp); await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#menu .tabs button[data-tab="save"]'); await pg.wait_for_timeout(600)
        await L.tap(pg, cdp, '#btnImport'); await pg.wait_for_timeout(500); await pg.set_input_files('#importFile', dl_path); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#btnImportGo'); await pg.wait_for_timeout(8000)
        msg = await pg.evaluate("(document.getElementById('importMsg')||{}).textContent||''"); await L.close_panels(pg, cdp); await settle(pg, cdp, 120, pref=[])
        g = await pg.evaluate("({day:GAME.G.day,hour:+GAME.G.hour.toFixed(3),zone:GAME.G.zone,busy:GAME.D.busyDepth,stale:!!GAME.D.stale,hasBusy:'_busy' in GAME.G})")
        run.check('匯出的檔用「匯入」讀回來：匯入成功、日子區域一樣、沒有 _busy', '匯入成功' in msg and g['day'] == ex['day'] and g['zone'] == ex['zone'] and not g['hasBusy'], J([msg, g]))
        s = await L.state(pg); moved, k, _ = await L.push_until(pg, cdp, 0, -60, 0.4, max_pushes=3)
        bd = await pg.evaluate("GAME.D.busyDepth")
        run.check('讀回來不卡：busyDepth 0、走得動', bd == 0 and moved >= 0.4, '%s，busyDepth %s，走了 %.2f m' % (J(g), bd, moved))


# ---------- 5j 羽球短片的台詞 ----------
CLIPW = """(()=>{ if(window.__bbClip||typeof BADCLIP==='undefined') return; window.__bbClip=[]; const o=BADCLIP.play; BADCLIP.play=async function(GM,opts){ const L=window.__LOG||[]; L.push({n:'CLIP',t:'CLIP:start full='+!!(opts&&opts.full),h:+GAME.G.hour.toFixed(2)}); let r; try{ r=await o.apply(this,arguments); } finally { L.push({n:'CLIP',t:'CLIP:end ok='+r,h:+GAME.G.hour.toFixed(2)}); } return r; };
  let last=null; setInterval(()=>{ if(!BADCLIP.busy) return; const c=GAME.E.camera.position, p=[c.x,c.y,c.z]; if(!last||Math.hypot(p[0]-last[0],p[1]-last[1],p[2]-last[2])>1.5) window.__bbClip.push({t:performance.now()}); last=p; },150); })()"""


async def m_clip(pg, cdp, run, errs):
    st = base(None, 17.0, 'dorm', {'x': 0, 'z': 2.4, 'yaw': 3.14159, 'lv': 0, 'y': 0}); st.pop('_stuck', None)
    inv = [v for v in st.get('invites', []) if not (v.get('who') == PARTNER and v.get('place') == 'gym_badminton')]
    if NTH >= 2: inv.append({'id': 'ivbb0', 'who': PARTNER, 'place': 'gym_badminton', 'zone': 'gym', 'day': st['day'] - 3, 'h': 19.0, 'state': 'done', 'accepted': True, 'by': 'player', 'now': False, 'label': 'BB 前置：上次打過'})
    st['invites'] = inv; r = st.setdefault('social', {}).setdefault('rel', {}).setdefault(PARTNER, {}); r['fam'] = max(r.get('fam', 0), 30); r['trust'] = max(r.get('trust', 0), 15); r['comf'] = max(r.get('comf', 0), 15)
    st.setdefault('contacts', {})[PARTNER] = 1; st.setdefault('visited', {})['gym'] = True
    await load(pg, st, run, '[前置] 使用者存檔：宿舍 17:00；%s 有點熟（fam 30）、有聯絡方式、去過新體育館；%s' % (PARTNER, '之前沒一起打過羽球' if NTH < 2 else '之前打過一次'), quiet=False)
    await pg.evaluate(CLIPW); await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[])
    acc = await pg.evaluate("(id=>{ const a=((INVITE_DATA.people||{})[id]||{}).acc||{}, x=a.gym_badminton; return Array.isArray(x)?x:(x&&x.A)||null; })(%s)" % J(PARTNER))
    end = await pg.evaluate("(id=>{ const p=((INVITE_DATA.people||{})[id]||{}).sport, s=(INVITE_DATA.sport||{}).gym_badminton||{}; const o=p&&p.gym_badminton; return {during:o?o.during:s.during, end:o?o.end:s.end}; })(%s)" % J(PARTNER))
    LINE = await pg.evaluate("(id=>BADCLIP.LINES[id]||null)(%s)" % J(PARTNER)); run.note('預期：答應 %s；她那一句 %s；一起的時候／結束 %s' % (J(acc), J(LINE), J(end)))
    n0 = await pg.evaluate(LOGN); m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(800)
    has = await pg.evaluate("(id=>{ const e=document.querySelector('#phoneBody [data-inv=\"'+id+'\"]'); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % J(PARTNER))
    run.check('手機「朋友」有 %s 的「約」' % PARTNER, has)
    if has: await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#phoneBody [data-inv="%s"]' % PARTNER); await pg.wait_for_timeout(1500)
    run.check('選「去新體育館打羽球」', await pick(pg, cdp, '去新體育館打羽球'))
    ch = await pg.evaluate(CHOICES); t = next((c for c in ch if c.startswith('今天 19:00') or c.startswith('今天 20:00')), next((c for c in ch if c.startswith('今天')), None))
    run.check('選今天的時段', bool(t) and await pick(pg, cdp, t[:8]), J(ch))
    await settle(pg, cdp, 60, pref=[])
    said = await pg.evaluate(LOGS % n0) + await pg.evaluate("(n=>(GAME.G.msgs||[]).slice(n).map(m=>m.text))(%d)" % m0)
    run.check('答應那一句（她的 acc.gym_badminton）', bool(acc) and all(any(a in t for t in said) for a in acc), J([acc, said[-8:]]))
    iv = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id&&v.place==='gym_badminton').slice(-1)[0]||null)(%s)" % J(PARTNER))
    run.check('約好了（accepted）', bool(iv) and iv.get('state') == 'accepted', J(iv))
    if not iv: return
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % (iv['h'] - 0.2)); run.setup('[捷徑] 時間撥到約好的前 12 分鐘')
    await L.close_panels(pg, cdp)
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
    sel = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(x=>x.dataset.place.startsWith('gym|')); if(!e) return null; e.scrollIntoView({block:'center'}); return e.dataset.place; })()")
    if sel: await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#phoneBody [data-place="%s"]' % sel); await pg.wait_for_timeout(6000)
    run.check('手機「地點」快速前往新體育館', bool(sel) and await pg.evaluate("GAME.G.zone") == 'gym', str(sel))
    n1 = await pg.evaluate(LOGN); h0 = None; t0 = time.time(); shots = 0; skipped = False; face = False
    while time.time() - t0 < 480:
        s = await L.state(pg); busy = await pg.evaluate("!!BADCLIP.busy"); nc = await pg.evaluate("(window.__bbClip||[]).length")
        if h0 is None and busy: h0 = (await pg.evaluate(SNAP))['h']
        if busy:
            if nc > shots: shots = nc; await pg.wait_for_timeout(400); await run.shot(pg, 'cut%d' % shots)
            if SKIP and not skipped and shots >= 1: await pg.wait_for_timeout(1200); skipped = await L.tap(pg, cdp, '#badclipSkip')
            await pg.wait_for_timeout(150); continue
        if s['dlg']:
            if LINE and LINE in s['dtext'] and not face: face = True; await run.shot(pg, 'end_face')
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['choices']: await pick(pg, cdp, (await pg.evaluate(CHOICES))[0]); continue
        if await pg.evaluate("((GAME.G.invites||[]).find(v=>v.id===%s)||{}).state==='done'" % J(iv['id'])) and not s['busy']: break
        await pg.wait_for_timeout(500)
    lines = await pg.evaluate(LOGS % n1); run.note('見面以後：%s' % J(lines))
    toasts = await pg.evaluate("window.__bbToast.map(x=>x.t)"); h1 = (await pg.evaluate(SNAP))['h']
    i_s = next((k for k, x in enumerate(lines) if 'CLIP:start' in x), -1); i_e = next((k for k, x in enumerate(lines) if 'CLIP:end' in x), -1)
    i_l = next((k for k, x in enumerate(lines) if LINE and LINE in x), -1)
    i_d = next((k for k, x in enumerate(lines) if any(d in x for d in (end['during'] or []) if isinstance(d, str))), -1)
    i_n = next((k for k, x in enumerate(lines) if any(d in x for d in (end['end'] or []) if isinstance(d, str))), -1)
    full = NTH < 2
    run.check('短片有演（%s）' % ('完整版' if full else '只有中段'), i_s >= 0 and i_e > i_s and (('full=true' in lines[i_s]) == full), J(lines[i_s:i_e + 1]))
    nc = await pg.evaluate("(window.__bbClip||[]).length")
    if not SKIP: run.check('鏡頭數：完整版 ≥3／第二次 1', (nc >= 3) if full else (nc == 1), str(nc))
    if full and not SKIP: run.check('完整版：短片後面她那一句「%s」' % LINE, LINE is None or (i_l > i_e), J(lines[i_e:i_e + 3]))
    else: run.check('第二次／跳過：沒有她那一句', i_l < 0, J(LINE))
    run.check('接著「（你們打了一個小時……）」→ 結束那一句，順序對', i_d > i_e and i_n > i_d, J([i_e, i_d, i_n]))
    run.check('時間往前（約 1 小時）', h0 is not None and h1 - h0 >= 0.8, '%s→%s' % (h0, h1))
    run.check('播的時候沒有「畫面好像停住了」', not any('停住了' in t for t in toasts), J(toasts))
    s = await L.state(pg); run.check('演完對話框收掉、能動（busyDepth 0）', not s['dlg'] and await pg.evaluate("GAME.D.busyDepth") == 0, J(s))
    if SKIP: run.check('跳過：按得到「跳過」', bool(skipped))


# ---------- 5j 小公園入口 B ----------
PARKP = """(()=>{ const A=WZ_PARK_LAYOUT.area, eb=A.entranceB, t=WZ_PARK_LAYOUT.items.find(i=>i.id==='oldtree'); return {out:[+(eb.x-2.2).toFixed(2),(eb.z0+eb.z1)/2], gate:[eb.x,(eb.z0+eb.z1)/2], inn:[+(eb.x+0.8).toFixed(2),(eb.z0+eb.z1)/2], tree:[t.x,t.z], eb}; })()"""


async def joy_to(pg, cdp, run, tx, tz, near, label, max_push=24):
    """用搖桿：鏡頭轉向目標、往前推；每推一次重新轉。回傳到了沒有"""
    for k in range(max_push):
        s = await L.state(pg)
        if math.hypot(tx - s['x'], tz - s['z']) <= near: run.note('搖桿到「%s」（推 %d 次）' % (label, k)); return True
        await L.turn_camera_to(pg, cdp, tx, tz, tries=2); await L.joystick(pg, cdp, 0, -60, 1200)
    s = await L.state(pg); run.note('搖桿到不了「%s」：%s' % (label, J(s))); return False


async def m_parkB(pg, cdp, run, errs):
    await load(pg, base(None, 15.0, 'wenzhou'), run, '[前置] 溫州街 15:00', quiet=False); await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[])
    P = await pg.evaluate(PARKP); run.note('入口 B：%s' % J(P))
    await pg.evaluate("(([x,z])=>{ GAME.E.placeAt(GAME.E.player,x,z); })(%s)" % J(P['out'])); run.setup('[前置] 站在北巷、入口 B 外面 %s' % J(P['out'])); await pg.wait_for_timeout(2000)
    ok1 = await joy_to(pg, cdp, run, P['inn'][0], P['inn'][1], 0.6, '入口 B 裡面')
    s = await L.state(pg); run.check('用搖桿從北巷走進入口 B（到入口裡面）', ok1 and s['x'] > P['eb']['x'], J(s)); await run.shot(pg, 'parkB_gate')
    ok2 = await joy_to(pg, cdp, run, P['tree'][0] - 1.6, P['tree'][1], 1.0, '老茄苳旁邊', max_push=40)
    s = await L.state(pg); run.check('進主園區、走到老茄苳旁邊', ok2 and s['stand'], J(s)); await run.shot(pg, 'parkB_tree')
    # 課輔班：週二 17:00～17:20
    d = await pg.evaluate("(d0=>{ for(let d=d0+1; d<d0+15; d++){ if(CALENDAR.dateOf(d).wd===2&&CALENDAR.termOf(d)) return d; } return null; })(GAME.G.day)")
    await load(pg, base(d, 17.08, 'wenzhou', {'x': P['tree'][0] - 2, 'z': P['tree'][1] - 3, 'yaw': 3.14159, 'lv': 0, 'y': 0}), run, '[前置] 週二 17:05 溫州街、小公園老樹旁', quiet=False)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(8000)
    P2 = await pg.evaluate(PARKP); mx = 0; near_b = False; samples = []
    for _ in range(30):   # 課輔班（crowd3d.js：n.passing＝正在走 S.passRoute、role tutor／tutor_kid）
        ks = await pg.evaluate("(()=>(GAME.E.npcs||[]).filter(n=>n&&n.obj&&!n.hidden&&(n.passing||/tutor/.test(n.role||''))).map(n=>[+n.obj.position.x.toFixed(1),+n.obj.position.z.toFixed(1)]))()")
        mx = max(mx, len(ks)); near_b = near_b or any(abs(k[0] - P2['gate'][0]) < 3.5 and abs(k[1] - P2['gate'][1]) < 3.5 for k in ks)
        if ks and len(samples) < 6: samples.append(ks)
        await pg.wait_for_timeout(2000)
    route = await pg.evaluate("(()=>{ try{ const sp=(CROWD.SPOTS||[]).find(s=>s.passPts); if(!sp) return null; const r=CROWD.passRoute(GAME.E,sp); return {pts:sp.passPts, route:r?Object.keys(r):null, len:r&&r.len}; }catch(e){ return String(e); } })()")
    run.note('課輔班：最多同時 %d 人在走；經過入口 B 附近：%s；取樣 %s；路線 %s' % (mx, near_b, J(samples), J(route)))
    await run.shot(pg, 'parkB_class')
    kids = [0] * mx
    run.check('課輔班那一場照舊：17:05 起公園裡有一排人在走（≥3 人），而且有人經過入口 B 附近', len(kids) >= 3 and near_b, '%d 人、入口 B %s' % (len(kids), near_b))


# ---------- 5j 貼圖去重複 ----------
# 判斷法：①場景裡每個 mesh 的材質（map、normalMap、roughnessMap、metalnessMap、aoMap、emissiveMap）逐一看貼圖：
#   image 是 ImageBitmap 而 width＝0＝已經 close 還在用（畫出來會是黑／白）＝壞；image 是 null 而 texture 不是 Data／Canvas／Compressed＝缺圖。
#   ②ASSETS.texDedup（看了幾個、共用幾個、close 幾張）記下來。③每次到那一區同一個角度截圖（時鐘撥到 14:00、藏 HUD），算畫面平均亮度、
#   近黑（<12）、近白（>243）的比例；同一區第二次和第一次比，平均差 >25 或黑／白比例差 >5% 算可疑（標出來看圖）。
TEX_JS = """(()=>{ const K=['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap','alphaMap'], seen=new Set(); let n=0, closed=0, nullImg=0; const bad=[];
  GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material||[])){ if(!m) continue; for(const k of K){ const t=m[k]; if(!t||!t.isTexture||seen.has(t)) continue; seen.add(t); n++;
    const im=t.image; if(t.isDataTexture||t.isCanvasTexture||t.isCompressedTexture||t.isVideoTexture) continue;
    if(!im){ nullImg++; if(bad.length<12) bad.push('null:'+(o.name||'')+'.'+k); continue; }
    if(typeof ImageBitmap!=='undefined'&&im instanceof ImageBitmap&&(im.width===0||im.height===0)){ closed++; if(bad.length<12) bad.push('closed:'+(o.name||'')+'.'+k); } } } });
  return {zone:GAME.G.zone, textures:n, closed, nullImg, bad, dedup:Object.assign({},(typeof ASSETS!=='undefined'&&ASSETS.texDedup)||{}), share:(typeof ASSETS!=='undefined'&&ASSETS.texShare)?ASSETS.texShare.size:null}; })()"""
CLEAN = """(on=>{ for(const el of document.body.children){ if(el.tagName==='CANVAS'||el.querySelector('canvas')) continue; if(on){ el.dataset.bbHide=el.style.visibility||'-'; el.style.visibility='hidden'; } else if(el.dataset.bbHide){ el.style.visibility=el.dataset.bbHide==='-'?'':el.dataset.bbHide; delete el.dataset.bbHide; } } })"""


def img_stats(path):
    from PIL import Image
    im = Image.open(path).convert('L'); px = list(im.getdata()); n = len(px) or 1
    return {'mean': round(sum(px) / n, 1), 'black': round(sum(1 for v in px if v < 12) / n, 4), 'white': round(sum(1 for v in px if v > 243) / n, 4)}


async def travel(pg, cdp, run, zone):
    await L.close_panels(pg, cdp)
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
    sel = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(x=>x.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); return e.dataset.place; })(%s)" % J(zone))
    if sel: await pg.wait_for_timeout(400); await L.tap(pg, cdp, '#phoneBody [data-place="%s"]' % sel)
    else:
        await L.close_panels(pg, cdp); await pg.evaluate("void GAME.enter(%s)" % J(zone)); run.setup('[捷徑] 手機「地點」沒有 %s：GAME.enter' % zone)
    for _ in range(40):
        if await pg.evaluate("GAME.G.zone") == zone and not (await L.state(pg))['busy']: break
        await pg.wait_for_timeout(1000)
    await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[]); await pg.wait_for_timeout(5000)   # 正式模型載入
    return bool(sel)


async def m_tex(pg, cdp, run, errs):
    await load(pg, base(None, 14.0, 'campus', None), run, '[前置] 使用者存檔改到 14:00 校園（出生點）', quiet=False); await L.close_panels(pg, cdp); await settle(pg, cdp, 60, pref=[])
    route = ['campus', 'wenzhou', 'cafe', 'campus', 'wenzhou', 'cafe', 'campus']; stats = {}; rows = []
    for i, z in enumerate(route):
        ok = True if i == 0 else await travel(pg, cdp, run, z)
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(14.0)"); await pg.wait_for_timeout(2500)
        await pg.evaluate("GAME.E.cam.yaw=0"); await pg.wait_for_timeout(1500)
        await pg.evaluate(CLEAN + "(true)"); await pg.evaluate("GAME.E.player.obj.visible=false"); await pg.wait_for_timeout(700)
        nm = 'tex_%d_%s' % (i, z); shot = await run.shot(pg, nm); await pg.evaluate(CLEAN + "(false)"); await pg.evaluate("GAME.E.player.obj.visible=true")
        shot = shot if shot and os.path.exists(shot) else None
        st = img_stats(shot) if shot else None; tx = await pg.evaluate(TEX_JS)
        rows.append({'i': i, 'zone': z, 'phone': ok, 'img': st, 'tex': tx}); run.note('%s：%s' % (nm, J(rows[-1])))
        run.check('%d %s：場景裡沒有已經 close 還在用的貼圖、沒有缺圖' % (i, z), tx['closed'] == 0 and tx['nullImg'] == 0, J(tx['bad']))
        if z in stats and st and stats[z]:
            a = stats[z]; dm = abs(st['mean'] - a['mean']); db = abs(st['black'] - a['black']); dw = abs(st['white'] - a['white'])
            run.check('%d %s：和第一次同一區比，畫面沒有變黑變白（平均差 %.1f、黑 %.3f、白 %.3f）' % (i, z, dm, db, dw), dm <= 25 and db <= 0.05 and dw <= 0.05, J([a, st]))
        elif st: stats[z] = st
    json.dump(rows, open(os.path.join(OUT, 'texdedup_rows.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    d = rows[-1]['tex']['dedup']; run.note('ASSETS.texDedup：%s；texShare %s' % (J(d), rows[-1]['tex']['share']))
    run.check('有在合併（texDedup.shared > 0；沒有就是 ?nodedup 或沒有 crypto.subtle）', (d.get('shared') or 0) > 0, J(d))


async def main():
    run = L.Run('user_items_%s%s' % (MODE, ('_' + PARTNER + ('_2nd' if NTH >= 2 else '') + ('_skip' if SKIP else '')) if MODE == 'clip_lines' else ''), OUT); os.makedirs(OUT, exist_ok=True)
    fn = {'closet': m_closet, 'qsave': m_qsave, 'clip_lines': m_clip, 'parkB': m_parkB, 'texdedup': m_tex}.get(MODE) or (m_home if MODE.startswith('home_') else None)
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
    sys.exit(run.finish())
asyncio.run(main())
