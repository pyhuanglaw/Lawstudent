"""CC（帳號 A）11-04：WZ_RENAME（BB 11-04 06:45；AA_655＋AA_658 溫州街改名，開發分支 e8c657891 以後）瀏覽器探針。
Node 單元（tests/aa655_wz_rename_unit.js）已經測邏輯、逐字對照稿；這支測「玩家看到的」和「真的走一遍」。
  U  店名：溫州街 10 間（2:30 AM、SUNNY SIDE、小路、林家、阿德、溫州書屋、帝大紅茶、阿忠鮮果、常在洗衣、夏日冰菓室）
     真的走到每一間門口（點地面走路）→ 截圖招牌、記互動字；每一站掃整頁 DOM 文字找舊名；開大地圖、手機每個分頁、選單筆記本也掃
  T  小路：週一 11:30（中午那句）、18:00（進得去）、01:59（進得去）、02:00（中午那句）、週二 19:00（公休）、颱風天 19:00（颱風那句）——門口三句逐字照 AA_655；
     18:00 進去點生啤酒：老闆招呼、扣 120、「（老闆看了你一眼：「學生？……喝慢一點。」）」
  B  溫州書屋櫥窗：週二 9:59（打烊句）、10:00（營業句）、20:30（打烊句）、週一 12:00（公休句）、颱風天（颱風句）——逐字照 AA_658（WZS.BOOKS_LOOK 也對照）
  C  帝大紅茶：六項各點一次（每次重新走到窗口），扣款＝價目
  X  學姊店內偶遇（AA_655 第 4 節：搬到林家）：平日中午、認識學姊、自己走進林家 → 出現「和溫書瑀打招呼」→ 按 → 演完、不卡；一天沒排到就換下一天（最多 8 天，每天是讀檔前置）
  MK 舊存檔（只在改名前的 SHA 跑）：真的走進兩點半、半熟、巷子裡定食、巷口茶飲點東西（茶飲點兩次珍珠奶茶＝老樣子），GAME.autosave() → out/oldsave.json
  OL 舊存檔（新版）：OLDSAVE=<oldsave.json> 放進 fatiao3d_auto → 標題「繼續」→ 筆記本「吃過的」是新店名、沒有舊名；次數和 MK 一樣；
     帝大紅茶「老樣子」＝奶茶（中）扣 45；小路 18:00「老樣子」（舊品項）記下行為（OBS）
  每一段最後做卡住檢查（cc_gg_int_probe.stuck_check）。
用法：LW_TESTS=<wt>/tests [CASES=U,T,B,C,X] [OLDSAVE=path] python3 cc_wz_rename_probe.py <url> <out>"""
import os, sys, json, re, math, time, types, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright


def load_mod(fn, name):
    path = os.path.join(HERE, fn); src = open(path, encoding='utf-8').read()
    k = src.rstrip().rfind('asyncio.run(main())')
    mod = types.ModuleType(name); mod.__file__ = path
    exec(compile(src[:k], path, 'exec'), mod.__dict__)
    return mod


GI = load_mod('cc_gg_int_probe.py', 'cc_gg_int')
URL, OUT = sys.argv[1], sys.argv[2]
GI.OUT = OUT
check, obs, J, ST = GI.check, GI.obs, GI.json.dumps, GI.ST
CASES = [c.strip() for c in (os.environ.get('CASES') or 'U,T,B,C,X').split(',') if c.strip()]
NEW = ['2:30 AM', 'SUNNY SIDE', '小路', '林家', '阿德', '溫州書屋', '帝大紅茶', '阿忠鮮果', '常在洗衣', '夏日冰菓室']
SHOPQ = {'2:30 AM': r'2:30 AM', 'SUNNY SIDE': r'SUNNY SIDE', '小路': r'小路', '林家': r'林家', '阿德': r'影印|阿德',
         '溫州書屋': r'書店的櫥窗|溫州書屋', '帝大紅茶': r'帝大紅茶|買一杯飲料', '阿忠鮮果': r'阿忠鮮果', '常在洗衣': r'常在洗衣', '夏日冰菓室': r'冰菓|買一碗冰'}
OLD_RX = r'兩點半 ?Café|巷子裡定食|巷口書房|巷口茶飲|阿忠水果|自助洗衣|半熟早午餐|溫州街・半熟|「半熟」|（半熟）|溫州街・定食|定食店'
# AA_655 第 4 節（tests/aa655_wz_rename_unit.js 第 7 項已逐字對照 a22e53016）
TEI = {'noon': '（小路的布簾收起來了。門上的木牌寫著「18:00～02:00」。）', 'rest': '（小路的門上掛著「本日公休」。）', 'typhoon': '（小路的紅燈籠沒有亮。門上貼著「颱風天休息」。）'}
ALC = '（老闆看了你一眼：「學生？……喝慢一點。」）'
# AA_658 第 5 節（單元第 8 項逐字對照）
BOOKS = {'open': '溫州書屋的櫥窗裡擺著一套舊版的《民法總則》，旁邊手寫的紙條：「學長姐留下來的，筆記很多」。', 'closed': '（溫州書屋的鐵門拉下一半。櫥窗裡還亮著一盞燈，那套《民法總則》還在原來的位置。）',
         'rest': '（溫州書屋的門上掛著「本日公休」。櫥窗裡那套《民法總則》還在。）', 'typhoon': '（溫州書屋的鐵門整個拉下來了，上面貼著「颱風天休息」。）'}
TEA = [('紅茶（中）', 30), ('紅茶（大）', 35), ('奶茶（中）', 45), ('奶茶（大）', 55), ('檸檬紅茶（中）', 45), ('檸檬紅茶（大）', 55)]
TYPHOON = '2025-10-13'
ERRS = []

LIST_JS = """(()=>GAME.E.interactables.filter(i=>!i.hidden).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.5,label:i.label||'',to:i.exit&&i.exit.to||null,wz:i.wzShop||null})))()"""
SCAN_JS = """(rx=>{ const R=new RegExp(rx,'g'); const t=document.body.innerText||''; const hits=[]; let m; while((m=R.exec(t))&&hits.length<8) hits.push(t.slice(Math.max(0,m.index-20),m.index+m[0].length+20).replace(/\\n/g,' ')); return hits; })(%s)"""
DAYOF_JS = """(k=>{ const d=STORY.dayOfKey(k); return {day:d, wd:CALENDAR.dateOf(d).wd%%7, typhoon:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d))}; })(%s)"""
NEXTWD_JS = """(([k,w])=>{ const d0=STORY.dayOfKey(k); for(let d=d0;d<d0+40;d++){ if(CALENDAR.dateOf(d).wd%%7===w&&!(CALENDAR.typhoon&&CALENDAR.typhoon(d))) return {day:d,wd:w}; } return null; })(%s)"""


async def dayof(pg, key): return await pg.evaluate(DAYOF_JS % J(key))
async def nextwd(pg, key, w): return await pg.evaluate(NEXTWD_JS % J([key, w]))


async def load_at(pg, cdp, zone, x, z, hour, dd, desc, extra=None, yaw=math.pi):
    GI.DAY, GI.WD = dd['day'], dd['wd']
    await GI.load(pg, cdp, zone, x, z, hour, desc + '（day %d 週%s）' % (dd['day'], '日一二三四五六'[dd['wd']]), extra=extra, yaw=yaw)


async def scan(pg, tag):
    hits = await pg.evaluate(SCAN_JS % J(OLD_RX))
    check('[%s] 畫面文字沒有舊店名' % tag, not hits, J(hits))
    return hits


async def find_shop(pg, name):
    its = await pg.evaluate(LIST_JS)
    rx = re.compile(SHOPQ[name])
    c = [i for i in its if rx.search(i['label'])]
    return c[0] if c else None


async def shot(pg, tag):
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))


# ------------------------------------------------------------------ U 店名
async def case_U(pg, cdp):
    print('== U 店名（招牌、互動字、大地圖、手機、筆記本）', flush=True)
    dd = await nextwd(pg, '2025-09-24', 3)
    await load_at(pg, cdp, 'wenzhou', -4.8, -4.1, 15.0, dd, '溫州街小路門口')
    its = await pg.evaluate(LIST_JS)
    print('  溫州街互動點：%s' % J([i['label'] for i in its]), flush=True)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
    for k, name in enumerate(NEW):
        it = await find_shop(pg, name)
        if not check('[U] %s：溫州街有它的互動點' % name, bool(it), J(it)): continue
        await L.go_to(pg, cdp, GI.Run(), it['x'], it['z'], max(0.4, it['r'] * 0.6), it['label'], max_s=600)
        await pg.wait_for_timeout(1200)
        s = await pg.evaluate(ST)
        check('[U] %s：走到旁邊，互動按鈕有新店名或對的動作（%s）' % (name, it['label']), bool(s['interact']) and s['interact'] == it['label'], J({'interact': s['interact'], 'x': s['x'], 'z': s['z']}))
        await L.turn_camera_to(pg, cdp, it['x'], it['z'] + (3 if it['z'] > 0 else -3))
        await pg.wait_for_timeout(1200); await shot(pg, 'U%02d_%s' % (k, re.sub(r'[^0-9A-Za-z]', '', name) or 'shop%d' % k))
        await scan(pg, 'U %s' % name)
    # 大地圖
    await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(2000)
    bm = await pg.evaluate("(()=>{ const e=document.getElementById('bigmap'); return !!e&&!e.classList.contains('hide'); })()")
    check('[U] 點小地圖打開大地圖', bm)
    await shot(pg, 'U20_bigmap'); await scan(pg, 'U 大地圖')
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
    # 手機每個分頁
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    tabs = await pg.evaluate("[...document.querySelectorAll('#phoneTabs button, #phoneTabs [data-tab]')].map(b=>(b.textContent||'').trim())")
    print('  手機分頁：%s' % J(tabs), flush=True)
    for i, t in enumerate(tabs):
        await L.tap(pg, cdp, '#phoneTabs > :nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(1200)
        body = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')")
        if any(n in body for n in NEW) or re.search(OLD_RX, body) or i == 0: await shot(pg, 'U3%d_phone_%d' % (i, i))
        await scan(pg, 'U 手機「%s」' % t)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
    # 選單（筆記本：吃過的、地點）
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1500)
    await shot(pg, 'U40_menu'); await scan(pg, 'U 選單')
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
    await GI.stuck_check(pg, cdp, 'U', fb0, e0, ERRS)


# ------------------------------------------------------------------ T 小路
async def tei_door(pg, cdp, tag, dd, hour, want):
    await load_at(pg, cdp, 'wenzhou', -4.8, -4.1, hour, dd, '小路門口 %s' % GI.hhmm(hour))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
    it = await find_shop(pg, '小路')
    if not check('[%s] 有「進去小路」' % tag, bool(it) and it['label'].startswith('進去小路'), J(it)): return
    await L.go_to(pg, cdp, GI.Run(), it['x'], it['z'], max(0.4, it['r'] * 0.5), it['label'], max_s=120)
    await pg.wait_for_timeout(800); s0 = await pg.evaluate(ST)
    print('  [%s] 按之前 %s（遊戲時間 %s）' % (tag, s0['interact'], GI.hhmm(s0['hour'])), flush=True)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    lines, menus, odd = await GI.converse(pg, cdp, tag, None, 60)
    await GI.wait_js(pg, "!GAME.E.player.busy", 30); await pg.wait_for_timeout(2000)
    s = await pg.evaluate(ST); await shot(pg, tag)
    if want == 'enter' and hour < 2 and s0['hour'] % 24 >= 2:
        obs('[%s] 走到門口時已經過 02:00（%s），不算' % (tag, GI.hhmm(s0['hour'])))
    elif want == 'enter':
        check('[%s] %s 進得去（zone＝wz_teishoku、沒有門口那一句）' % (tag, GI.hhmm(s0['hour'])), s['zone'] == 'wz_teishoku' and not any(re.sub(r'^.*?：', '', l) in TEI.values() for l in lines), J({'zone': s['zone'], 'lines': lines[:4]}))
    else:
        exp = TEI[want]
        check('[%s] %s 進不去、門口那一句逐字＝AA_655「%s」' % (tag, GI.hhmm(s0['hour']), exp), s['zone'] == 'wenzhou' and any(l == exp or l.endswith(exp) for l in lines), J({'zone': s['zone'], 'lines': lines[:4], 'toast': s['toast']}))
    await GI.stuck_check(pg, cdp, tag, fb0, e0, ERRS)
    return s


async def case_T(pg, cdp):
    print('== T 小路營業時間、門口三句、點酒', flush=True)
    MON = await nextwd(pg, '2025-09-24', 1); TUE = await nextwd(pg, '2025-09-24', 2); TY = await dayof(pg, TYPHOON)
    check('[T] 颱風假那天（%s）在行事曆上是颱風' % TYPHOON, TY['typhoon'], J(TY))
    await tei_door(pg, cdp, 'T1_mon1130', MON, 11.5, 'noon')
    await tei_door(pg, cdp, 'T2_mon0200', MON, 2.0, 'noon')
    await tei_door(pg, cdp, 'T3_tue1900', TUE, 19.0, 'rest')
    await tei_door(pg, cdp, 'T4_typhoon1900', TY, 19.0, 'typhoon')
    s = await tei_door(pg, cdp, 'T5_mon0159', MON, 1.0 + 59 / 60, 'enter')
    s = await tei_door(pg, cdp, 'T6_mon1800', MON, 18.0, 'enter')
    if s and s['zone'] == 'wz_teishoku':
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
        its = await pg.evaluate(LIST_JS); od = next((i for i in its if i['wz'] == 'teishoku'), None)
        print('  小路店內互動點：%s' % J([(i['label'], i['wz']) for i in its]), flush=True)
        if check('[T7] 小路店內有點餐的互動點（wzShop teishoku）', bool(od), J(od)):
            r = await GI.buy_menu(pg, cdp, 'T7_beer', None, '生啤酒', 120, at=(od['x'], od['z']), label=od['label'])
            if r:
                lines = r[0]
                check('[T7] 點生啤酒：老闆講一句（有「老闆：」）、點酒那一句逐字', any(l.startswith('老闆：') for l in lines) and any(l.endswith(ALC) for l in lines), J(lines))
            await shot(pg, 'T7_beer')
        await GI.stuck_check(pg, cdp, 'T7', fb0, e0, ERRS)


# ------------------------------------------------------------------ B 溫州書屋
async def case_B(pg, cdp):
    print('== B 溫州書屋櫥窗四句', flush=True)
    TUE = await nextwd(pg, '2025-09-24', 2); MON = await nextwd(pg, '2025-09-24', 1); TY = await dayof(pg, TYPHOON)
    look = await pg.evaluate("(typeof WZS!=='undefined'&&WZS.BOOKS_LOOK)||null")
    check('[B] WZS.BOOKS_LOOK 四句＝AA_658', look == BOOKS, J(look))
    for tag, dd, h, want in (('B1_tue0959', TUE, 9 + 59 / 60, 'closed'), ('B2_tue1000', TUE, 10.0, 'open'), ('B3_tue2030', TUE, 20.5, 'closed'), ('B4_mon1200', MON, 12.0, 'rest'), ('B5_typhoon1200', TY, 12.0, 'typhoon')):
        await load_at(pg, cdp, 'wenzhou', 14.2, 1.6, h, dd, '溫州書屋櫥窗前 %s' % GI.hhmm(h), yaw=0)
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
        it = await GI.walk_tap(pg, cdp, tag, {'label': '看書店的櫥窗'}, '看書店的櫥窗')
        if not it: continue
        s0h = (await pg.evaluate(ST))['hour']
        lines, menus, odd = await GI.converse(pg, cdp, tag, None, 40)
        await shot(pg, tag)
        exp = BOOKS[want]
        ok = any(l == exp or l.endswith(exp) for l in lines)
        if not ok and want == 'closed' and h < 10 and s0h >= 10: obs('[%s] 走到櫥窗時已經過 10:00（%s），不算' % (tag, GI.hhmm(s0h)))
        else: check('[%s] %s 櫥窗那一句逐字＝「%s」' % (tag, GI.hhmm(s0h), exp[:18] + '…'), ok, J(lines[:3]))
        await GI.stuck_check(pg, cdp, tag, fb0, e0, ERRS)


# ------------------------------------------------------------------ C 帝大紅茶
async def case_C(pg, cdp):
    print('== C 帝大紅茶六項', flush=True)
    WED = await nextwd(pg, '2025-09-24', 3)
    await load_at(pg, cdp, 'wenzhou', 22.0, -3.6, 15.0, WED, '帝大紅茶窗口旁', yaw=0)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
    for i, (n, p) in enumerate(TEA):
        it = await find_shop(pg, '帝大紅茶')
        if not check('[C%d] 有帝大紅茶的窗口' % i, bool(it), J(it)): break
        r = await GI.buy_menu(pg, cdp, 'C%d_%s' % (i, n), None, n, p, at=(it['x'], it['z']), label=it['label'])
        if i == 0 and r: await shot(pg, 'C0_tea')
        await L.push_until(pg, cdp, 0, 60, 0.6, max_pushes=2)   # 退開一步，下一次重新走過去
    await GI.stuck_check(pg, cdp, 'C', fb0, e0, ERRS)


# ------------------------------------------------------------------ X 學姊在林家
async def case_X(pg, cdp):
    print('== X 學姊的店內偶遇（林家）', flush=True)
    SM = load_mod('cc_social_smoke_probe.py', 'cc_social_smoke')
    d0 = await nextwd(pg, '2025-09-24', 3)
    done = False
    for k in range(8):
        dd = {'day': d0['day'] + k, 'wd': (d0['wd'] + k) % 7}
        if dd['wd'] in (0, 6, 1): continue   # 週末不排、林家週一休
        ty = await pg.evaluate("(d=>!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)))(%d)" % dd['day'])
        if ty: continue
        await load_at(pg, cdp, 'wenzhou', 35.0, 1.6, 12.2, dd, '林家門口南邊、12:12', yaw=0)
        r = await pg.evaluate(SM.SETUP_JS, {'id': 'heroine_05', 'met': True, 'rel': SM.REL['ACQUAINTANCE'], 'contact': True})
        print('  [前置／捷徑] 學姊：認識（ACQUAINTANCE）%s' % J({x: r.get(x) for x in ('stage', 'name')}), flush=True)
        why = await pg.evaluate("(()=>{ const w=[]; const c=SHOPENC.candidates(GAME.G,'wz_lin',w); return {c:c.map(x=>x.row.who), why:w.slice(0,8)}; })()")
        print('  day %d：林家的候選 %s' % (dd['day'], J(why)), flush=True)
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
        it = await find_shop(pg, '林家')
        if not it or not await GI.enter_via(pg, cdp, 'X_day%d' % dd['day'], {'at': [it['x'], it['z']]}, it['label'], 'wz_lin'): continue
        await pg.wait_for_timeout(2500)
        n = await pg.evaluate("(()=>{ const n=(GAME.E.npcs||[]).find(n=>n&&n.shopEnc&&n.talkLabel); return n?{label:n.talkLabel,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2)}:null; })()")
        print('  店內偶遇的人：%s' % J(n), flush=True)
        if not n or '溫' not in n['label'] and '學姊' not in n['label']:
            await GI.go_out(pg, cdp, 'X_out%d' % dd['day'], 'wenzhou'); continue
        await shot(pg, 'X1_sis_in_lin')
        await L.go_to(pg, cdp, GI.Run(), n['x'], n['z'], 1.1, n['label'], max_s=120); await pg.wait_for_timeout(1000)
        s = await pg.evaluate(ST)
        check('[X] 走到學姊旁邊：互動按鈕「%s」' % n['label'], s['interact'] == n['label'], J(s['interact']))
        await L.tap(pg, cdp, '#interact')
        lines, menus, odd = await GI.converse(pg, cdp, 'X', None, 180)
        check('[X] 演完：有學姊的台詞（「學弟。……你也吃這家。」或 friend 以上的句子）', any('學弟。……你也吃這家。' in l or '坐。我剛好讀到一段' in l for l in lines), J(lines[:8]))
        await shot(pg, 'X2_after')
        await GI.stuck_check(pg, cdp, 'X', fb0, e0, ERRS)
        done = True; break
    check('[X] 8 天內有一天在林家遇到學姊', done)


# ------------------------------------------------------------------ MK／OL 舊存檔
EAT_JS = "(()=>{ const e=GAME.G.eat||{}; return {n:e.n||{}, last:e.last||{}, ate:(e.ate||[]).map(a=>a.shop+'／'+a.item)}; })()"


async def case_MK(pg, cdp):
    print('== MK 舊存檔（改名前的版本）：真的走進去點東西', flush=True)
    WED = await nextwd(pg, '2025-09-24', 3)
    await load_at(pg, cdp, 'wenzhou', 0.0, 1.6, 12.5, WED, '溫州街中間 12:30')
    its = await pg.evaluate(LIST_JS)
    print('  溫州街互動點（舊版）：%s' % J([(i['label'], i['to'], i['wz']) for i in its]), flush=True)
    for zid in ('wz_teishoku', 'wz_brunch', 'cafe'):
        door = next((i for i in its if i['to'] == zid), None)
        if not check('[MK] 有往 %s 的門' % zid, bool(door), J(door)): continue
        if not await GI.enter_via(pg, cdp, 'MK_' + zid, {'exitTo': zid}, door['label'][:2], zid): continue
        inside = await pg.evaluate(LIST_JS)
        od = next((i for i in inside if i['wz'] or re.match(r'^(點|買|櫃|結帳)', i['label'])), None)
        print('  %s 店內：%s → %s' % (zid, J([(i['label'], i['wz']) for i in inside]), J(od)), flush=True)
        if od:
            await GI.walk_tap(pg, cdp, 'MK_' + zid + '_order', {'at': [od['x'], od['z']]}, od['label'])
            await GI.converse(pg, cdp, 'MK_' + zid, ['', ''], 120)
        await GI.go_out(pg, cdp, 'MK_' + zid + '_out', 'wenzhou')
        its = await pg.evaluate(LIST_JS)
    for t in range(2):
        tw = next((i for i in await pg.evaluate(LIST_JS) if i['wz'] == 'tea' or re.search(r'買一杯飲料', i['label'])), None)
        if not check('[MK] 有茶飲的窗口', bool(tw), J(tw)): break
        await GI.walk_tap(pg, cdp, 'MK_tea%d' % t, {'at': [tw['x'], tw['z']]}, tw['label'])
        await GI.converse(pg, cdp, 'MK_tea%d' % t, ['珍珠奶茶'] if t == 0 else ['老樣子', '珍珠奶茶'], 120)
        await L.push_until(pg, cdp, 0, 60, 0.6, max_pushes=2)
    e = await pg.evaluate(EAT_JS); print('  舊版吃過的：%s' % J(e), flush=True)
    check('[MK] 舊存檔有兩點半／半熟／定食／茶飲的紀錄', all(any(k in x for x in e['ate']) or k in e['n'] for k in ('兩點半', '半熟', '定食', '巷口茶飲')), J(e))
    await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(1500)
    raw = await pg.evaluate("((k)=>{ try{ const v=(GAME.readSave?GAME.readSave(k):(GAME.readSave?GAME.readSave(k):JSON.parse(localStorage.getItem(k)||'null'))); return v==null?null:JSON.stringify(v); }catch(e){ return null; } })('fatiao3d_auto')")
    json.dump({'save': raw, 'eat': e, 'url': URL}, open(os.path.join(OUT, 'oldsave.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    check('[MK] 寫出 out/oldsave.json', bool(raw), str(len(raw or '')))


async def case_OL(pg, cdp):
    print('== OL 舊存檔讀進新版', flush=True)
    p = os.environ.get('OLDSAVE') or os.path.join(HERE, 'fixtures', 'wz_rename_oldsave.json')
    if not check('[OL] 有舊存檔檔案（%s）' % p, os.path.exists(p)): return
    d = json.load(open(p, encoding='utf-8'))
    print('  [前置] 舊版（%s）存下來的吃過的：%s' % (d.get('url'), J(d.get('eat'))), flush=True)
    await pg.evaluate("(s=>{ localStorage.clear(); localStorage.setItem('fatiao3d_auto', s); })(%s)" % J(d['save']))
    await pg.reload(); await L.wait_loaded(pg); await L.no_phone_auto(pg); await pg.wait_for_timeout(1500)
    ok = await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp); await GI.converse(pg, cdp, 'OL_load', None, 20)
    check('[OL] 標題「繼續」讀進舊存檔', ok)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
    e = await pg.evaluate(EAT_JS); old = d.get('eat') or {}
    check('[OL] 吃過的次數和舊版一樣（沒有歸零）', all(e['n'].get(k) == v for k, v in (old.get('n') or {}).items()), J({'old': old.get('n'), 'new': e['n']}))
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1500)
    txt = await pg.evaluate("document.body.innerText")
    await shot(pg, 'OL1_menu')
    check('[OL] 選單的「吃過的」顯示新店名（2:30 AM／SUNNY SIDE／小路／帝大紅茶 至少一個）', any(n in txt for n in ('2:30 AM', 'SUNNY SIDE', '小路', '帝大紅茶')), '')
    await scan(pg, 'OL 選單')
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
    # 帝大紅茶的老樣子
    WED = await nextwd(pg, '2025-09-24', 3)
    snap = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())"))
    snap.update({'zone': 'wenzhou', 'hour': 15.0, 'day': WED['day'], 'weekday': WED['wd'], 'pos': {'x': 22.0, 'z': -3.6, 'yaw': 0, 'lv': 0}})
    print('  [前置／捷徑] 同一份存檔，只改時間地點：溫州街帝大紅茶窗口旁 15:00（吃過的、關係都不動）', flush=True)
    await L.load_state(pg, snap, quiet_events=True); await pg.wait_for_timeout(6500); await L.close_panels(pg, cdp)
    it = await find_shop(pg, '帝大紅茶')
    if it and await GI.walk_tap(pg, cdp, 'OL_tea', {'at': [it['x'], it['z']]}, it['label']):
        s0 = await pg.evaluate(ST)
        lines, menus, odd = await GI.converse(pg, cdp, 'OL_tea', ['老樣子'], 120)
        s1 = await pg.evaluate(ST)
        check('[OL] 帝大紅茶有「老樣子」、選了＝奶茶（中）扣 45（舊存檔上次點珍珠奶茶）', any('老樣子' in c for m in menus for c in m) and s0['money'] - s1['money'] == 45 and any('奶茶（中）' in l for l in lines), J({'menus': menus[:1], 'money': [s0['money'], s1['money']], 'lines': lines[-3:]}))
    kx = await pg.evaluate("(()=>{ try{ return WZS.AA364.tea.oldItems; }catch(e){ return null; } })()")
    obs('[OL] 可昕那一杯：舊品項對照表（瀏覽器裡）%s；真的帶一杯給可昕的流程這支沒測（要期末約會前一小時）' % J(kx))
    await GI.stuck_check(pg, cdp, 'OL', fb0, e0, ERRS)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('pageerror', lambda e: ERRS.append(str(e)[:200]))
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for c in CASES:
            try: await globals()['case_' + c](pg, cdp)
            except Exception as e:
                check('[%s] 沒有例外（探針）' % c, False, repr(e)[:300]); await shot(pg, 'EXC_' + c)
        check('沒有 JS 例外', not ERRS and not errs, J((ERRS + list(errs))[:3]))
        await b.close()
    print('ALL PASS' if not GI.FAILS else 'FAILED %d: %s' % (len(GI.FAILS), '；'.join(GI.FAILS)), flush=True)
    sys.exit(1 if GI.FAILS else 0)

asyncio.run(main())
