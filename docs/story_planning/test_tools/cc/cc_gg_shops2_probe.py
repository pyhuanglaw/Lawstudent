"""CC（帳號 A）11-04：GG_shops2——公館 afar café（G07，區域 afar）、Daybreak（G14，區域 daybreak）兩間室內（LAWWW 816597841 GG-SHOPS2-1104；src/gg2shops3d.js；台詞 AA_652）。測 809163ee4（AA_652 89b4367ca：afar 打烊以後的木牌句、兩間颱風假的門口句；afar v1c、Daybreak 配置 v2）。
  真實玩家流程（不用 ?turbo、不瞬移、不改劇情狀態）；只有前置讀檔，標【前置／捷徑】。每一段都卡住檢查、逐句印對話（transcript）、截圖。
  CASES（afar_* 和 db_* 同一套）：<店>_door,<店>_hours,<店>_closein,<店>_order,<店>_seats,<店>_date,<店>_art（不給＝全部）
  共用函式：cc_gg_int_probe.py（converse／stuck_check／load／walk_tap／enter_via／go_out…）、約會照 cc_social_smoke_probe.py（Person：手機約、meet_go、date_report、check_free、her_after）——兩支都照原始碼載入（不執行它們的 main）。
  door    【前置】公館店門前 (門x, 15)（afar 15:00、Daybreak 10:00）→ 走到店門口「進入 afar café／進入 Daybreak」→ 進店：一天第一次的進門句（AA_652 三句之一，逐字）→ 截圖 → 卡住檢查 → 走到「離開…」出來（公館門口 SHOP_IN.out）→ 卡住檢查
  hours   邊界（afar 10:59、11:00、20:59、21:00；Daybreak 07:59、08:00、14:59、15:00）：【前置】讀檔到門口（騎樓、門前 1 m）比邊界早 3 分鐘 → 等遊戲時間真的跑到那一刻（10:59 那種要在下一分鐘以前按）→ 按門：
            開＝進得去；關＝進不去：開門以前（afar 10:59、Daybreak 07:59）＝toast 寫開放時間（PLACES.closedText）；打烊以後（afar 21:00 起、Daybreak 15:00 起）＝木牌那一句（AA_652 逐字）。按下去那一刻的 G.hour 印出來。
          颱風天（calendar.js TYPHOON 2025-10-13）：【前置】讀檔到那一天、平常開店的時間 → 按門：進不去、颱風那一句（AA_652 逐字，兩間各一句）
  closein 【前置】讀檔到店裡、打烊前 3 分鐘（afar 20:57、Daybreak 14:57）→ 站著等時間跑到打烊 → 店員一句＋旁白（逐字、照順序）→ 回公館店門口（SHOP_IN.out 1.5 m 內）→ 卡住檢查
  order   afar：「點咖啡」→ 店員「內用還是外帶？」→ 選單八樣、價錢照稿 → 點拿鐵 140：扣 140、時間 +9 分鐘、點完的一句（稿上三句之一、手沖那句不出）；錢不夠（【前置】money 50）＝店員那一句、不扣錢；
            「看甜點櫃」「看看書架」「看菜單」各按一次：稿上那幾句之一。
          Daybreak：「點餐」→ 店員「內用的話，點好我們送過去。」→ 點厚蛋三明治 160：扣 160、點完的一句、坐到最近的空位（吃的時候 P.seat 有）、時間 +40 分鐘、吃完的旁白（稿上兩句之一）、吃完起身；錢不夠＝那一句；「看甜點櫃」「看菜單」。
  seats   afar 24 張（配置 26）、Daybreak 22 張（配置 23；v2 長桌西側中間拿掉）（每一張先【前置】讀檔到店裡進門的地方，時段次數是新的）：走過去 → 按 → 坐下的那一句（照位子類型＝GG2.seatLine，逐字；稿上沒有的位子不說）→ 選單有「讀書」→ 讀書（P.seat、pose sit／read）→ 起身 → 腳下站得住（nav.free、canStand）→ 卡住檢查。
          配置裡玩家不能坐的（afar 卡座 (−4.65,−2.3)、(−4.65,−3.4)；Daybreak 卡座小桌一的卡座 (0.6,−3.5)；809163ee4 node 印出來的）：沒有「坐下」的互動點（選不到）。
  date    smoke probe 的 Person：【前置】讀檔到公館、設關係（afar＝認識 ACQUAINTANCE；Daybreak＝有點熟 FAMILIAR）、有聯絡方式 → 手機約 afar（喝咖啡）／Daybreak（吃飯，08:00～14:00 開始）→ 照 smoke 的 campus_date 演完一場：
            出發、到場、見面一路點得完；X207：開演那一刻兩個人都坐著、同一桌（≤ 2.3 m 或同一張桌子）、帶路時她離玩家 ≤ 3 m、道別那一刻她在旁邊（≤ 4 m）、結束後自由、她回自己的行程；
            AA_652：答應的一句（她自己的或一般句）、坐下以後的開場句（seatOpen 兩句之一）。另外：afar 在認識階段就約得到；Daybreak 在認識階段約不到（minStage）；14:30 約 Daybreak＝旁白「（Daybreak 下午三點就關了。）」、今天的時段一個都沒有。
  art     兩間各拍：門口 art_<afar|daybreak>_door.png（門前 6 m 面向店門、開店時間）、店內 art_<…>_inside.png（進門站的地方、面向 −z）
用法：LW_TESTS=<wt>/tests [CASES=afar_door,db_hours,...] [GG2_DATE_PID_AFAR=heroine_02] [GG2_DATE_PID_DB=heroine_03] [GG2_BRANCH=0] [SEATS=0,1] python3 cc_gg_shops2_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, re, types
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright


def load_mod(fn, name):
    """照原始碼載入另一支探針（拿它的函式；最後一行 asyncio.run(main()) 不執行）"""
    path = os.path.join(HERE, fn); src = open(path, encoding='utf-8').read()
    k = src.rstrip().rfind('asyncio.run(main())')
    if k < 0: raise SystemExit('%s 的結尾不是 asyncio.run(main())，不能照原始碼載入' % fn)
    mod = types.ModuleType(name); mod.__file__ = path
    exec(compile(src[:k], path, 'exec'), mod.__dict__)
    return mod


GI = load_mod('cc_gg_int_probe.py', 'cc_gg_int')
URL, OUT = sys.argv[1], sys.argv[2]
check, obs, J, hhmm = GI.check, GI.obs, GI.json.dumps, GI.hhmm
J = lambda o: json.dumps(o, ensure_ascii=False)
ALLC = ['door', 'hours', 'closein', 'order', 'seats', 'date', 'art']
CASES = [c.strip() for c in (os.environ.get('CASES') or ','.join(p + '_' + c for p in ('afar', 'db') for c in ALLC)).split(',') if c.strip()]
SEATSEL = [int(x) for x in (os.environ.get('SEATS') or '').split(',') if x.strip()]
NZ = lambda t: re.sub(r'[「」\s]', '', t or '')
TYPHOON_KEY = '2025-10-13'
# ---- AA_652 原文（企劃線 0109d6270 docs/story_planning/AA_652_afar與Daybreak店內台詞.md；店員的句子拿掉引號比對）----
AA = {
    'afar': {'door': ['（門上的小鈴響了一下。咖啡的味道比外面的騎樓還濃。）', '（窗邊長桌坐了一排打筆電的人，每個人面前都有一盞小燈。）', '（吧台後面的店員抬頭說了一聲「歡迎光臨」，又低頭繼續磨豆子。）'],
             'ask': '內用還是外帶？',
             'menu': [('濃縮咖啡', 100), ('美式', 110), ('拿鐵', 140), ('卡布奇諾', 140), ('摩卡', 160), ('手沖', 170), ('起司蛋糕', 120), ('布丁', 90)],
             'after': ['好了叫你。……可以先找位子。', '（店員在杯子上寫了一個字，看不出是你的名字還是飲料的名字。）'], 'after_only': {'手沖': '手沖要等五分鐘喔。'},
             'short': '……要不要看一下比較便宜的？美式一百一。',
             'look': {'pastry': ['（玻璃櫃裡三層甜點。最上面一層的起司蛋糕只剩兩塊。）', '（櫃子裡的燈很亮，布丁看起來比實際上大一點。）'],
                      'bookshelf': ['（書架上面是旅行的書，下面一層斜放著幾本雜誌。有一本的封面是一座你不知道名字的山。）', '（書架上夾著一張手寫的小卡：「歡迎借閱，請放回原位。」）', '（有人把一本《民法總則》放在旅行書中間。不知道是忘了帶走，還是故意的。）'],
                      'menu': ['（黑板上寫著 afar COFFEE MENU。手沖那一行旁邊畫了一片小葉子。）']},
             'seat': ['（你在窗邊坐下，把桌上的小燈打開。外面騎樓有人牽著腳踏車經過。）', '（你在方桌坐下。隔壁桌有人戴著耳機在寫報告。）', '（靠牆的位子很安靜。牆上那幅畫是一座霧裡的山。）', '（吧台後面那一塊比較暗，卡座很軟。坐下就不太想起來。）'],
             'close': ['我們九點打烊喔。……杯子放著就好。', '（你走出 afar。騎樓的燈已經暗了一半。）'],
             'sign': '（afar 的玻璃門後面，椅子都倒扣在桌上了。門上掛著小木牌：「本日營業結束 11:00～21:00」。）',
             'typhoon': '（afar 的門上貼著一張手寫的紙：「颱風天休息，大家注意安全。」）',
             'acc0': '「好啊。那間的手沖很好喝。」',
             'acc': {'heroine_01': '「好。我帶書去，你不要一直跟我講話。」', 'heroine_02': '「afar？好。……窗邊那一排的燈很好看。」', 'heroine_03': '「好。我想吃他們的布丁。」', 'heroine_04': '「可以。那裡插座很多。」',
                     'heroine_05': '「好。我也剛好要寫東西。」', 'classmate_peishan': '「好！我上次經過就想進去了。」', 'kexin': '「好啊。我到公館再跟你說。」'},
             'open': ['（你們在窗邊長桌坐下。她把桌上的小燈打開，又關掉，又打開。）', '（她把兩杯咖啡的杯墊對齊，一杯推給你。）']},
    'daybreak': {'door': ['（一進門就是烤吐司和咖啡的味道。窗外的陽光照到第一排桌子。）', '（店員：「早安！幾位？」……「一位的話，窗邊可以嗎？」）', '（牆上那個太陽畫得很大。旁邊的卡座已經坐了兩桌。）'],
                 'ask': '內用的話，點好我們送過去。',
                 'menu': [('日式早餐盤', 220), ('厚蛋三明治', 160), ('法式吐司', 180), ('拿鐵', 120)],
                 'after': ['大概十五分鐘。……飲料先上。'], 'after_only': {'法式吐司': '今天的法式吐司是最後兩份喔。'},
                 'eat': ['（蛋捲切開，裡面是軟的。你吃得比想的快。）', '（你把最後一片吐司沾了盤子上的蜂蜜。）'],
                 'short': '……要不要先點一杯拿鐵？',
                 'look': {'pastry': ['（玻璃櫃裡的麵包排得很整齊。可頌旁邊的牌子寫著「今天出爐」。）', '（最下面一層的肉桂捲只剩一個。）'],
                          'menu': ['（黑板上寫著 Brunch、Plates、Sandwiches……每一行後面都畫了一條線，沒有寫價錢。價錢在吧台的小菜單上。）']},
                 'seat': ['（窗邊的陽光很亮。桌上的小花瓶插了幾枝滿天星。）', '（四人桌的椅子有一張是綠色坐墊。你坐了那一張。）', '（最裡面那張長桌，牆上的層板放滿了罐子和小盆栽。）', '（你在卡座坐下，旁邊的黃色抱枕很軟。牆上的 Daybreak 字就在你頭上。）'],
                 'close': ['我們三點休息囉。……明天早上八點見。', '（你走出 Daybreak。午後的騎樓比早上熱很多。）'],
                 'sign': '（Daybreak 的門上掛著「今日營業結束」的木牌。）',
                 'typhoon': '（Daybreak 的遮雨棚收起來了。門上貼著：「颱風天暫停營業」。）',
                 'late': '（Daybreak 下午三點就關了。）',
                 'acc0': '「好啊。早上嗎？我爬得起來。」',
                 'acc': {'heroine_01': '「好。九點，不要遲到。」', 'heroine_02': '「好……我想坐窗邊。」', 'heroine_03': '「Daybreak？好。我想吃法式吐司。」', 'heroine_04': '「早上？……十點以後可以。」',
                         'heroine_05': '「好。週末早上我剛好有空。」', 'classmate_peishan': '「好啊！那家的卡座好可愛。」', 'kexin': '「好啊。我早一點從外校出發。」'},
                 'open': ['（你們在窗邊坐下。陽光剛好照到她那一邊，她把椅子往你這邊挪了一點。）', '（餐點送來的時候，她先拿手機拍了一張。）']}}
AA['aoki'] = {'acc0': '「好。那裡很安靜。」',
              'acc': {'heroine_01': '「好。可以讀書嗎？……可以就好。」', 'heroine_02': '「好。我想喝東方美人。」', 'heroine_03': '「青木？好。……我想看看別人家的茶怎麼泡。」', 'heroine_04': '「茶室？好啊，我沒去過。」',
                      'heroine_05': '「好。那裡的白茶不錯。」', 'classmate_peishan': '「好！他們的桂花糕很好吃。」', 'kexin': '「好啊。等我到台北。」'},
              'open': ['（店員把茶壺放下，她先幫你倒了第一杯。）']}
SH = {'aoki': {'zone': 'aoki', 'name': '青木茶室', 'door': '進入青木茶室', 'dx': -54.05, 'openH': 15.0, 'close': 21.0, 'stage': 'ACQUAINTANCE', 'pid': os.environ.get('GG2_DATE_PID_AOKI') or 'heroine_02'},
      'afar': {'zone': 'afar', 'name': 'afar café', 'door': '進入 afar café', 'dx': 7.93, 'openH': 15.0, 'close': 21.0,
               'bounds': [(10 + 59 / 60, False), (11.0, True), (20 + 59 / 60, True), (21.0, False)], 'items': {'order': '點咖啡', 'pastry': '看甜點櫃', 'bookshelf': '看看書架', 'menu': '看菜單'},
               'seats': 24, 'nosit': [(-4.65, -2.3), (-4.65, -3.4)], 'buy': ('拿鐵', 140), 'hrs': 0.15, 'stage': 'ACQUAINTANCE', 'pid': os.environ.get('GG2_DATE_PID_AFAR') or 'heroine_02', 'seatH': 12.0},
      'daybreak': {'zone': 'daybreak', 'name': 'Daybreak', 'door': '進入 Daybreak', 'dx': 70.93, 'openH': 10.0, 'close': 15.0,
                   'bounds': [(7 + 59 / 60, False), (8.0, True), (14 + 59 / 60, True), (15.0, False)], 'items': {'order': '點餐', 'pastry': '看甜點櫃', 'menu': '看菜單'},
                   'seats': 22, 'nosit': [(0.6, -3.5)], 'buy': ('厚蛋三明治', 160), 'hrs': 40 / 60, 'stage': 'FAMILIAR', 'pid': os.environ.get('GG2_DATE_PID_DB') or 'heroine_03', 'seatH': 9.0}}
KEY = {'afar': 'afar', 'db': 'daybreak', 'aoki': 'aoki'}

DOOR_JS = """(lb=>{ const it=GAME.E.interactables.find(i=>!i.hidden&&(i.label||'')===lb); return it?{x:+it.x.toFixed(3),z:+it.z.toFixed(3),r:it.radius||2.2,to:it.exit?it.exit.to:null}:null; })(%s)"""
GG2IT_JS = """(([k,kind])=>{ const it=GAME.E.interactables.find(i=>!i.hidden&&i.gg2===k&&i.kind===kind); return it?{x:it.x,z:it.z,r:it.radius||0.9,label:it.label}:null; })(%s)"""
SI_JS = """(k=>{ const q=Z3.SHOP_IN&&Z3.SHOP_IN[k]; return q?{x:q.x,z:q.z,out:q.out}:null; })(%s)"""
SEATLINE_JS = """(([k,x,z])=>(typeof GG2!=='undefined'&&GG2.seatLine)?GG2.seatLine(k,{x,z}):null)(%s)"""
NOSIT_JS = """(k=>{ const L=k==='afar'?AFAR_LAYOUT:DAYBREAK_LAYOUT; const its=GAME.E.interactables.filter(i=>i.seat); return L.seats.filter(s=>!its.some(q=>Math.abs(q.seat.x-s.x)<0.05&&Math.abs(q.seat.z-s.z)<0.05)).map(s=>({x:s.x,z:s.z,table:s.table,seatH:s.seatH||null, near:its.filter(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.6).map(q=>[q.label,+q.seat.x.toFixed(2),+q.seat.z.toFixed(2)])})); })(%s)"""
DOORDIAG_JS = """(k=>{ const G=GAME.G, D=GAME.D||{}, q=f=>{ try{ return f(); }catch(e){ return 'ERR '+String(e).slice(0,50); } }, dl=document.getElementById('dlg');
  return {t:+(performance.now()/1000).toFixed(1), zone:G.zone, hour:+(+G.hour).toFixed(3), doorDue:q(()=>GG2.doorDue(GAME)), sceneFree:q(()=>typeof INV!=='undefined'&&INV.sceneFree?INV.sceneFree(GAME):'no INV.sceneFree'),
    alone:q(()=>GG2.alone(G,k)), isOpen:q(()=>GG2.isOpen(k,G)), GG2_DOOR:q(()=>(G.flags||{}).GG2_DOOR||null), enterN:GAME.enterN|0, busyDepth:D.busyDepth|0, dActive:!!D.active, pbusy:!!(GAME.E.player&&GAME.E.player.busy),
    phone:q(()=>!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())), titleIdle:!!GAME.titleIdle, dlg:!!(dl&&!dl.classList.contains('hide')), dlgText:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60)}; })(%s)"""
HRS_JS = """(k=>({text:(PLACES.hours[k]||{}).text||null, typhoonShop:PLACES.typhoonShops.includes(k)}))(%s)"""


def ln_text(x):
    """transcript 一行（『名字：句子』）→ 句子"""
    return x.split('：', 1)[1] if ('：' in x and not x.startswith('（') and not x.startswith('［')) else x


def has_line(lines, t):
    return any(NZ(ln_text(x)) == NZ(t) for x in lines)


def any_line(lines, pool):
    return [t for t in pool if has_line(lines, t)]


async def press_door(pg, cdp, tag, k, h, d=None, extra_desc=''):
    """【前置】讀檔到門口（門前 1 m）比 h 早 3 分鐘 → 等到 h → 按門。回傳 (hour_at_press, lines, state, toasts)"""
    S = SH[k]; ex = {'weather': 'clear'}
    if d is not None: ex.update({'day': d['day'], 'weekday': d['wd']})
    for attempt in (0, 1):
        h0 = h - (3 if attempt == 0 else 1.5) / 60
        await GI.load(pg, cdp, 'gongguan', S['dx'], 20.0, h0, '%s 門口（騎樓、門前 1 m）%s' % (S['name'], extra_desc), extra=dict(ex))
        t0 = time.time()
        while time.time() - t0 < 300:
            s = await pg.evaluate(GI.ST)
            if (s['hour'] % 24) >= h - 1e-4: break
            await pg.wait_for_timeout(250)
        s = await pg.evaluate(GI.ST)
        if (s['hour'] % 24) < h + 0.9 / 60 or attempt == 1: break
        print('  [%s] 等到的時候已經 %s（超過 %s 一分鐘），重來一次' % (tag, hhmm(s['hour']), hhmm(h)), flush=True)
    hp = s['hour']; label = s['interact']
    await L.tap(pg, cdp, '#interact')
    toasts = []; t0 = time.time()
    while time.time() - t0 < 5:
        q = await pg.evaluate(GI.ST)
        if q['toast'] and q['toast'] not in toasts: toasts.append(q['toast'])
        if q['zone'] != 'gongguan': break
        await pg.wait_for_timeout(300)
    lines, menus, odd = await GI.converse(pg, cdp, tag, None, 40)
    await GI.wait_js(pg, "!GAME.E.player.busy", 20); await pg.wait_for_timeout(1500)
    s2 = await pg.evaluate(GI.ST)
    if s2['toast'] and s2['toast'] not in toasts: toasts.append(s2['toast'])
    print('  [%s] 按門那一刻 %s（G.hour %.4f）、按鈕「%s」→ zone %s；toast %s；對話 %s' % (tag, hhmm(hp), hp, label, s2['zone'], J(toasts), J(lines)), flush=True)
    return hp, label, lines, s2, toasts


async def case_door(pg, cdp, errs, k):
    S = SH[k]; tag = '%s_door' % k
    print('== %s：進出店門' % tag, flush=True)
    await GI.load(pg, cdp, 'gongguan', S['dx'], 15.0, S['openH'], '%s 店門前的人行道' % S['name'])
    fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
    d = await pg.evaluate(DOOR_JS % J(S['door']))
    check('[%s] 公館店門口有「%s」（x %.2f、z 21）' % (tag, S['door'], S['dx']), bool(d) and abs(d['x'] - S['dx']) < 0.02 and abs(d['z'] - 21) < 0.01 and d['to'] == S['zone'], J(d))
    if not d: return
    await L.go_to(pg, cdp, GI.Run(), d['x'], d['z'] - 0.6, 1.0, S['door'])
    await pg.wait_for_timeout(1000); s = await pg.evaluate(GI.ST)
    check('[%s] 走到店門口：按鈕是「%s」' % (tag, S['door']), s['interact'].startswith(S['door']), J({q: s[q] for q in ('x', 'z', 'interact')}))
    await L.tap(pg, cdp, '#interact')
    ok = await GI.wait_js(pg, "GAME.G.zone===%s" % J(S['zone']), 60)
    if os.environ.get('DOORDIAG') == '1':   # CC-C 11-04：進門句沒出來——進店後 10 秒內每 0.5 秒記 GG2 進門的條件（doorDue／sceneFree／alone／GG2_DOOR／enterN）
        for i in range(20):
            dg = await pg.evaluate(DOORDIAG_JS % J(S['zone']))
            print('  [%s] 進店 +%.1fs：%s' % (tag, i * 0.5, J(dg)), flush=True)
            if dg.get('dlg') or dg.get('GG2_DOOR'): break
            await pg.wait_for_timeout(500)
    lines, menus, odd = await GI.converse(pg, cdp, tag + '_in', None, 60)
    s = await pg.evaluate(GI.ST)
    check('[%s] 進店（zone %s）' % (tag, S['zone']), ok and s['zone'] == S['zone'], J({q: s[q] for q in ('zone', 'x', 'z')}))
    got = any_line(lines, AA[k]['door'])
    if not got:   # BB-C 11-04：第一次抓到的是可昕的 toast（手機訊息），不是進門句——等 toast 收掉以後再等 3 秒，再收一次對話
        tq = None
        for _ in range(40):
            tq = await pg.evaluate("(()=>{ const t=document.getElementById('toast'); return (t&&!t.classList.contains('hide')&&getComputedStyle(t).opacity!=='0'&&t.textContent.trim())?t.textContent.trim().slice(0,80):''; })()")   # textContent 收起來以後還在，要看 hide／opacity
            if not tq: break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(3000)
        more, _, _ = await GI.converse(pg, cdp, tag + '_in2', None, 30)
        print('  [%s] toast 收掉（%s）＋3 秒以後再收：%s' % (tag, '已收' if not tq else '20 秒還在：' + str(tq)[:60], J(more)), flush=True)
        lines = list(lines) + [x for x in more if x not in lines]
        got = any_line(lines, AA[k]['door'])
    check('[%s] 一天第一次進來：進門句（AA_652 三句之一，逐字）' % tag, len(got) == 1, J(lines))
    await pg.screenshot(path=os.path.join(OUT, '%s_inside.png' % tag))
    await GI.stuck_check(pg, cdp, tag + '_inside', fb0, e0, errs)
    if await GI.go_out(pg, cdp, tag + '_out', 'gongguan'):
        si = await pg.evaluate(SI_JS % J(S['zone'])); s = await pg.evaluate(GI.ST)
        check('[%s] 出來站在公館店門口（SHOP_IN.out %s 1.5 m 內）' % (tag, J(si and si['out'])), bool(si) and math.hypot(s['x'] - si['out']['x'], s['z'] - si['out']['z']) <= 1.5, J({q: s[q] for q in ('x', 'z')}))
        await GI.stuck_check(pg, cdp, tag + '_out', fb0, e0, errs)
        # 同一天再進去：不再說進門句
        await L.go_to(pg, cdp, GI.Run(), d['x'], d['z'] - 0.6, 1.0, S['door'])
        await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
        if await GI.wait_js(pg, "GAME.G.zone===%s" % J(S['zone']), 60):
            lines2, _, _ = await GI.converse(pg, cdp, tag + '_again', None, 30)
            check('[%s] 同一天再進來：不說進門句' % tag, not any_line(lines2, AA[k]['door']), J(lines2))
            await GI.go_out(pg, cdp, tag + '_out2', 'gongguan')


async def case_hours(pg, cdp, errs, k):
    S = SH[k]; tag0 = '%s_hours' % k
    print('== %s：營業時間邊界' % tag0, flush=True)
    hrs = await pg.evaluate(HRS_JS % J(S['zone']))
    print('  [%s] PLACES.hours.%s＝%s' % (tag0, S['zone'], J(hrs)), flush=True)
    for h, want in S['bounds']:
        tag = '%s_%s' % (tag0, hhmm(h).replace(':', ''))
        fb0 = None
        hp, label, lines, s, toasts = await press_door(pg, cdp, tag, k, h)
        fb0 = s['fb']; e0 = len(errs)
        hit = (hp % 24) >= h - 1e-4 and (hp % 24) < h + 1 / 60
        if not hit: obs('[%s] 按門那一刻 %s 不在 %s 那一分鐘裡（SwiftShader 太慢？），照那一刻的時間判' % (tag, hhmm(hp), hhmm(h)))
        exp_open = want if hit else ((hp % 24) >= (11 if k == 'afar' else 8) and (hp % 24) < S['close'])
        await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
        if exp_open:
            check('[%s] %s 開著：進得去（zone %s）' % (tag, hhmm(hp), S['zone']), s['zone'] == S['zone'], J({q: s[q] for q in ('zone', 'x', 'z')}))
            if s['zone'] == S['zone']:
                await GI.stuck_check(pg, cdp, tag + '_in', fb0, e0, errs)
                if await GI.wait_js(pg, "GAME.G.zone===%s" % J(S['zone']), 2): await GI.go_out(pg, cdp, tag + '_out', 'gongguan')
        else:
            check('[%s] %s 關著：進不去（zone 還是公館）' % (tag, hhmm(hp)), s['zone'] == 'gongguan', J({q: s[q] for q in ('zone', 'x', 'z')}))
            hh = hp % 24
            if hh >= S['close'] - 1e-6 or (k == 'afar' and hh < 6):
                check('[%s] %s 打烊以後到門口：木牌那一句（AA_652，逐字）' % (tag, S['name']), has_line(lines, AA[k]['sign']), J({'lines': lines, 'toasts': toasts}))
            else:
                check('[%s] 開門以前：toast 寫開放時間（%s；稿上沒有這一句）' % (tag, hrs['text']), any(hrs['text'] and (hrs['text'] in t or '11:00' in t or '08:00' in t) for t in toasts) and not has_line(lines, AA[k]['sign']), J({'toasts': toasts, 'lines': lines}))
            await GI.stuck_check(pg, cdp, tag, fb0, e0, errs)
    # 颱風天
    tag = '%s_typhoon' % tag0
    td = await pg.evaluate("(k=>{ const d=STORY.dayOfKey(k); return {day:d, wd:CALENDAR.dateOf(d).wd%%7, typhoon:!!CALENDAR.typhoon(d)}; })(%s)" % J(TYPHOON_KEY))
    check('[%s] 前置：%s 是颱風假（calendar.js TYPHOON）、%s 在 typhoonShops' % (tag, TYPHOON_KEY, S['zone']), td['typhoon'] and hrs['typhoonShop'], J([td, hrs]))
    hp, label, lines, s, toasts = await press_door(pg, cdp, tag, k, S['openH'], d=td, extra_desc='、%s 颱風假' % TYPHOON_KEY)
    check('[%s] 颱風天 %s 平常開的時間：進不去' % (tag, hhmm(hp)), s['zone'] == 'gongguan', J({q: s[q] for q in ('zone', 'x', 'z')}))
    check('[%s] 颱風天：颱風那一句（AA_652，逐字）、不是木牌那一句' % tag, has_line(lines, AA[k]['typhoon']) and not has_line(lines, AA[k]['sign']), J({'toasts': toasts, 'lines': lines}))
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
    await GI.stuck_check(pg, cdp, tag, s['fb'], len(errs), errs)


async def case_closein(pg, cdp, errs, k):
    S = SH[k]; tag = '%s_closein' % k
    print('== %s：打烊時人在店裡' % tag, flush=True)
    si = await pg.evaluate(SI_JS % J(S['zone']))
    if not check('[%s] 有 Z3.SHOP_IN.%s' % (tag, S['zone']), bool(si), J(si)): return
    await GI.load(pg, cdp, S['zone'], si['x'], si['z'], S['close'] - 3 / 60, '%s 店裡進門的地方、打烊前 3 分鐘' % S['name'])
    fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
    lines = []; t0 = time.time(); left = None
    while time.time() - t0 < 600:
        s = await pg.evaluate(GI.ST)
        if s['dlg'] or s['choices']: lines += (await GI.converse(pg, cdp, tag, None, 60))[0]
        s = await pg.evaluate(GI.ST)
        if s['zone'] != S['zone'] and not s['busy']: left = s; break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(1500); s = await pg.evaluate(GI.ST)
    print('  [%s] 打烊的 transcript：%s' % (tag, J(lines)), flush=True)
    check('[%s] 打烊（%s）：回公館（zone gongguan）' % (tag, hhmm(S['close'])), bool(left) and s['zone'] == 'gongguan', J({q: s[q] for q in ('zone', 'x', 'z', 'hour')}))
    idx = [next((i for i, x in enumerate(lines) if NZ(ln_text(x)) == NZ(t)), -1) for t in AA[k]['close']]
    check('[%s] 店員一句＋旁白（AA_652 逐字、照順序）' % tag, all(i >= 0 for i in idx) and idx[0] < idx[1], J({'want': AA[k]['close'], 'got': lines}))
    check('[%s] 停在店門口（SHOP_IN.out %s 1.5 m 內）' % (tag, J(si['out'])), math.hypot(s['x'] - si['out']['x'], s['z'] - si['out']['z']) <= 1.5, J({q: s[q] for q in ('x', 'z')}))
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
    await GI.stuck_check(pg, cdp, tag, fb0, e0, errs)


async def look_one(pg, cdp, tag, k, kind):
    it = await pg.evaluate(GG2IT_JS % J([k, kind]))
    if not check('[%s] 有「%s」' % (tag, SH[k]['items'][kind]), bool(it), J(it)): return
    if not await GI.walk_tap(pg, cdp, tag, {'at': [it['x'], it['z']]}, it['label']): return
    lines, menus, odd = await GI.converse(pg, cdp, tag, None, 40)
    got = any_line(lines, AA[k]['look'][kind])
    check('[%s] 「%s」有反應：AA_652 那幾句之一（逐字）' % (tag, it['label']), len(got) == 1, J(lines))


async def case_order(pg, cdp, errs, k):
    S = SH[k]; tag0 = '%s_order' % k
    print('== %s：點餐、看東西' % tag0, flush=True)
    si = await pg.evaluate(SI_JS % J(S['zone']))
    await GI.load(pg, cdp, S['zone'], si['x'], si['z'], S['openH'], '%s 店裡進門的地方' % S['name'], money=3000)
    fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
    nm, price = S['buy']; tag = tag0 + '_buy'
    it = await pg.evaluate(GG2IT_JS % J([k, 'order']))
    if check('[%s] 有「%s」' % (tag, S['items']['order']), bool(it), J(it)) and await GI.walk_tap(pg, cdp, tag, {'at': [it['x'], it['z']]}, it['label']):
        s0 = await pg.evaluate(GI.ST); smp = []
        lines, menus, odd = await GI.converse(pg, cdp, tag, [nm], 300, smp)
        s1 = await pg.evaluate(GI.ST)
        m0 = next((m for m in menus if any(c.startswith(nm) for c in m)), [])
        want = ['%s　%d 元' % (a, b) for a, b in AA[k]['menu']]
        check('[%s] 店員「%s」（逐字）' % (tag, AA[k]['ask']), has_line(lines, AA[k]['ask']), J(lines[:3]))
        check('[%s] 選單照稿（品項、價錢）' % tag, [c for c in m0 if c != '不用了'][:len(want)] == want, J(m0))
        check('[%s] 點%s：扣 %d' % (tag, nm, price), s0['money'] - s1['money'] == price, J([s0['money'], s1['money']]))
        dh = s1['hour'] - s0['hour']
        check('[%s] 時間 +%d 分鐘' % (tag, round(S['hrs'] * 60)), S['hrs'] - 0.01 <= dh <= S['hrs'] + 0.08, '%.3f h' % dh)
        check('[%s] 點完的一句（AA_652 之一；只在點特定品項才說的不出）' % tag, len(any_line(lines, AA[k]['after'])) == 1 and not any_line(lines, list(AA[k]['after_only'].values())), J(lines))
        if k == 'daybreak':
            seated = [q for q in smp if q[1]]
            check('[%s] 送到位子上：吃的時候坐在最近的空位（P.seat 有）' % tag, bool(seated), J(sorted(set(str(q[0]) for q in smp))))
            check('[%s] 吃完的旁白（AA_652 兩句之一）' % tag, len(any_line(lines, AA[k]['eat'])) == 1, J(lines[-3:]))
            check('[%s] 吃完起身（P.seat 沒了）' % tag, not s1['seat'], J({'seat': s1['seat']}))
        await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
        await GI.stuck_check(pg, cdp, tag, fb0, e0, errs)
    for kind in [q for q in ('pastry', 'bookshelf', 'menu') if q in S['items']]:
        await look_one(pg, cdp, '%s_%s' % (tag0, kind), k, kind)
        await GI.stuck_check(pg, cdp, '%s_%s' % (tag0, kind), fb0, e0, errs)
    # 錢不夠
    tag = tag0 + '_short'
    await GI.load(pg, cdp, S['zone'], si['x'], si['z'], S['openH'], '%s 店裡進門的地方、money 50' % S['name'], money=50)
    fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
    it = await pg.evaluate(GG2IT_JS % J([k, 'order']))
    if it and await GI.walk_tap(pg, cdp, tag, {'at': [it['x'], it['z']]}, it['label']):
        s0 = await pg.evaluate(GI.ST)
        lines, menus, odd = await GI.converse(pg, cdp, tag, [nm], 120)
        s1 = await pg.evaluate(GI.ST)
        check('[%s] 錢不夠點%s：店員「%s」（逐字）、不扣錢' % (tag, nm, AA[k]['short']), has_line(lines, AA[k]['short']) and s1['money'] == s0['money'], J({'money': [s0['money'], s1['money']], 'lines': lines}))
        await GI.stuck_check(pg, cdp, tag, fb0, e0, errs)


P3 = []   # BB-C 13:40：相鄰座位搶按鈕（P3，不擋發布）
SEAT_DONE = {}   # 座位 → 實際坐下測到了沒

OCC2_JS = r"""(([sx,sz])=>{ const E=GAME.E; const near=(E.npcs||[]).filter(n=>n&&(n.seat||n.seatTarget)).map(n=>{ const st=n.seat||null, tg=n.seatTarget||null;
    return {name:n.name||'(路人)', id:n.id||n.cid||null, dSeat:st?+Math.hypot((+st.x)-sx,(+st.z)-sz).toFixed(2):null, dTarget:tg?+Math.hypot((+tg.x)-sx,(+tg.z)-sz).toFixed(2):null}; }).filter(q=>(q.dSeat!=null&&q.dSeat<=0.5)||(q.dTarget!=null&&q.dTarget<=0.5));
  const it=E.interactables.find(i=>i.seat&&Math.abs((+i.seat.x)-sx)<0.12&&Math.abs((+i.seat.z)-sz)<0.12); return {near, taken:it&&it.seat.taken!==undefined?it.seat.taken:null, label:it?it.label:null}; })(%s)"""
FB_JS = "(GAME.walkFallbacks|0)"


async def sit_one(pg, cdp, tag, k, sv):
    """一張座位：走過去、確定最近的互動是它、按、坐下那一句、選單、讀書、起身。回傳 dict
    BB-C 11-04：①先走到遊戲自己的走近點（GAME.seatApproach）再判；最近的是同桌相鄰的另一張（字一樣、1.2 m 內）不算 FAIL，記 INFO 換下一張
    ②坐之前先印占用（0.5 m 內 seat／seatTarget 的 NPC），有人＝照設計（freeSeat），記 INFO 不判 ③每一步前後印 walkFallbacks（走近、坐下、讀書、起身）"""
    occ = await pg.evaluate(OCC2_JS % J([sv['sx'], sv['sz']]))
    print('  [%s] 座位占用：%s' % (tag, J(occ)), flush=True)
    if occ.get('near') or occ.get('taken'):
        print('INFO [%s] 有人坐著或正走過去（照設計：freeSeat 0.4 m）→ 先跳過，這一項最後回頭補測' % tag, flush=True); return 'OCCUPIED'
    ap = await pg.evaluate(GI.APPROACH_JS % J([sv['x'], sv['z']]))
    fb_a = await pg.evaluate(FB_JS)
    if ap:
        await L.go_to(pg, cdp, GI.Run(), ap[0], ap[1], 0.15, '座位 (%s,%s) 的走近點（GAME.seatApproach）%s' % (sv['sx'], sv['sz'], J(ap)), max_s=300)
        await pg.wait_for_timeout(800)
    near_ok = await pg.evaluate(GI.NEAREST_JS % J([sv['x'], sv['z']])); logged_p3 = False
    if not near_ok:
        nb = await pg.evaluate(GI.NEARSEAT_JS)
        if nb and nb.get('label') == sv['label'] and math.hypot(nb['sx'] - sv['sx'], nb['sz'] - sv['sz']) <= 1.2:
            # BB-C 13:40：站在這一張自己的走近點上，按鈕卻是同桌隔壁那張＝「P3 相鄰座位搶按鈕」（不擋發布，BB 整理給 LAWWW2）；再照舊找別的點
            s0 = await pg.evaluate(GI.ST)
            line = 'P3 [%s] 相鄰座位搶按鈕：站在 (%s,%s) 的走近點 %s（人在 %s, %s），最近的是同桌隔壁 (%s,%s)「%s」（%.2f m）' % (tag, sv['sx'], sv['sz'], J(ap), s0['x'], s0['z'], nb['sx'], nb['sz'], nb['label'], math.hypot(nb['sx'] - sv['sx'], nb['sz'] - sv['sz']))
            print(line, flush=True); P3.append(line); logged_p3 = True
        if not await GI.approach_seat(pg, cdp, tag, sv, p3=(None if logged_p3 else P3)):
            nb2 = await pg.evaluate(GI.NEARSEAT_JS)
            if nb2 and nb2.get('label') == sv['label'] and math.hypot(nb2['sx'] - sv['sx'], nb2['sz'] - sv['sz']) <= 1.2:
                print('INFO [%s] 走到桌子另一邊也被同桌隔壁那張搶走按鈕（%s,%s）' % (tag, nb2['sx'], nb2['sz']), flush=True)
            return None
    else:
        s0 = await pg.evaluate(GI.ST)
        check('[%s] 走到座位的走近點：最近的互動是這一張（%s,%s）「%s」' % (tag, sv['sx'], sv['sz'], sv['label']), s0['interact'].startswith(sv['label']), J({'at': [s0['x'], s0['z']], 'ap': ap, 'interact': s0['interact']}))
    fb_b = await pg.evaluate(FB_JS); print('  [%s] walkFallbacks 走近 %s→%s' % (tag, fb_a, fb_b), flush=True)
    want = await pg.evaluate(SEATLINE_JS % J([k, sv['sx'], sv['sz']]))
    await L.tap(pg, cdp, '#interact')
    lines = []; smp = []; t0 = time.time(); last = None; s = None
    while time.time() - t0 < 90:
        s = await pg.evaluate(GI.ST); smp.append((s['pose'], s['seat'], s['x'], s['z']))
        if s['choices']: break
        if s['dlg']:
            if (s['name'], s['text']) != last: last = (s['name'], s['text']); lines.append(((s['name'] + '：') if s['name'] else '') + s['text']); print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(400)
    check('[%s] 坐下（P.seat、pose sit）' % tag, bool(s and s['seat']) and s['pose'] in ('sit', 'read'), J({q: s[q] for q in ('pose', 'seat')}) if s else 'null')
    if s and s['seat']: SEAT_DONE[(sv['sx'], sv['sz'])] = True
    if want: check('[%s] 坐下那一句照位子類型（AA_652，逐字）' % tag, has_line(lines, want), J({'want': want, 'got': lines}))
    else: check('[%s] 這張位子稿上沒有句子：不說坐下句' % tag, not any_line(lines, AA[k]['seat']), J(lines))
    fb_c = await pg.evaluate(FB_JS); print('  [%s] walkFallbacks 坐下 %s→%s' % (tag, fb_b, fb_c), flush=True)
    menu = (s or {}).get('choices') or []
    check('[%s] 座位選單有「讀書」（不是灰的）' % tag, any(c.startswith('讀書') for c in menu) and not any(c.startswith('讀書') and d for c, d in zip(menu, (s or {}).get('dims') or [])), J(menu))
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
    ln2, menus, odd = await GI.converse(pg, cdp, tag, ['讀書', '', '起身'], 300, smp)
    fb_d = await pg.evaluate(FB_JS); print('  [%s] walkFallbacks 讀書 %s→%s' % (tag, fb_c, fb_d), flush=True)
    reading = [q for q in smp if q[1] and q[0] in ('sit', 'read')]
    check('[%s] 讀書時坐著（P.seat、pose sit／read）' % tag, len(reading) >= 2, J(sorted(set(str(q[0]) for q in smp))))
    s2 = await pg.evaluate(GI.ST)
    if s2['seat']:
        await GI.converse(pg, cdp, tag + '_stand', ['起身'], 60); s2 = await pg.evaluate(GI.ST)
    check('[%s] 起身（P.seat 沒了）' % tag, not s2['seat'], J({q: s2[q] for q in ('pose', 'seat', 'x', 'z')}))
    fb_e = await pg.evaluate(FB_JS); print('  [%s] walkFallbacks 起身 %s→%s（這一張共 +%d）' % (tag, fb_d, fb_e, fb_e - fb_a), flush=True)
    r = await pg.evaluate(GI.STAND_JS)
    check('[%s] 起身後腳下站得住（nav.free、canStand 0.3）' % tag, r['free'] and r['stand'], J(dict(r, x=s2['x'], z=s2['z'])))
    return {'lines': lines + ln2}


async def case_seats(pg, cdp, errs, k):
    S = SH[k]; tag0 = '%s_seats' % k
    print('== %s：座位' % tag0, flush=True)
    si = await pg.evaluate(SI_JS % J(S['zone']))
    await GI.load(pg, cdp, S['zone'], si['x'], si['z'], S['seatH'], '%s 店裡進門的地方' % S['name'])
    seats = await pg.evaluate(GI.SEATS_JS)
    check('[%s] 玩家可坐的座位 %d 個、都可以讀書' % (tag0, S['seats']), len(seats) == S['seats'] and all(q['study'] for q in seats), J([[q['sx'], q['sz'], q['label'], q['study']] for q in seats]))
    ns = await pg.evaluate(NOSIT_JS % J(S['zone']))
    want_ns = sorted(S['nosit']); got_ns = sorted((round(q['x'], 2), round(q['z'], 2)) for q in ns)
    check('[%s] 配置裡玩家不能坐的 %d 張＝%s，沒有「坐下」的互動點（選不到）' % (tag0, len(want_ns), J(want_ns)), got_ns == want_ns and all(not q['near'] for q in ns), J(ns))
    occ_later = []; t_budget = time.time() + float(os.environ.get('SEAT_BUDGET_S') or 1080)   # BB-C 13:55：一項超過 20 分鐘就停，報沒測完的張數（runner 20 分鐘會直接砍掉，所以探針 18 分鐘先停）
    over = []
    for i in range(len(seats)):
        if SEATSEL and i not in SEATSEL: continue
        if time.time() > t_budget: over.append(i); continue
        if i > 0: await GI.load(pg, cdp, S['zone'], si['x'], si['z'], S['seatH'], '%s 店裡進門的地方（每一張重讀：讀書的時段次數是新的）' % S['name'])
        fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
        SEAT_DONE.setdefault((seats[i]['sx'], seats[i]['sz']), False)
        r = await sit_one(pg, cdp, '%s%02d' % (tag0, i), k, seats[i])
        if r == 'OCCUPIED': occ_later.append(i); continue
        await GI.stuck_check(pg, cdp, '%s%02d' % (tag0, i), fb0, e0, errs)
    # BB-C 13:40：有人坐的那幾張回頭補測——先等 NPC 起身（重讀、等 60 秒），還是有人就換一個時段（+1.5 小時）
    for tries, dh in ((1, 0.0), (2, 1.5)):
        if not occ_later: break
        left = []
        for i in occ_later:
            if time.time() > t_budget: left.append(i); continue
            await GI.load(pg, cdp, S['zone'], si['x'], si['z'], S['seatH'] + dh, '%s 店裡進門的地方（補測第 %d 次%s）' % (S['name'], tries, '、晚 1.5 小時' if dh else '、等 60 秒讓 NPC 起身'))
            if not dh: await pg.wait_for_timeout(60000)
            fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
            r = await sit_one(pg, cdp, '%s%02d_retry%d' % (tag0, i, tries), k, seats[i])
            if r == 'OCCUPIED': left.append(i); continue
            await GI.stuck_check(pg, cdp, '%s%02d_retry%d' % (tag0, i, tries), fb0, e0, errs)
        occ_later = left
    tested = [i for i in range(len(seats)) if (not SEATSEL or i in SEATSEL)]
    n_ok = sum(1 for i in tested if SEAT_DONE.get((seats[i]['sx'], seats[i]['sz'])))
    print('INFO [%s] 實際坐下測到 %d／總共 %d 張%s%s' % (tag0, n_ok, len(tested), '（補測後還是有人坐：%s）' % J(occ_later) if occ_later else '', '；P3 相鄰座位搶按鈕 %d 筆' % len(P3) if P3 else ''), flush=True)
    if over: print('INFO [%s] 時間到（18 分鐘）沒測完 %d 張：%s' % (tag0, len(over), J(over)), flush=True)


async def case_art(pg, cdp, errs, k):
    S = SH[k]; tag = '%s_art' % k
    print('== %s：ART 截圖' % tag, flush=True)
    await GI.load(pg, cdp, 'gongguan', S['dx'], 15.0, S['openH'], '%s 門前' % S['name'])
    fb0 = (await pg.evaluate(GI.ST))['fb']; e0 = len(errs)
    await L.go_to(pg, cdp, GI.Run(), S['dx'], 15.0, 0.6, '%s 門前 6 m' % S['name'])
    await L.turn_camera_to(pg, cdp, S['dx'], 22.0); await pg.wait_for_timeout(2500)
    await pg.screenshot(path=os.path.join(OUT, 'art_%s_door.png' % S['zone'])); print('  [art] art_%s_door.png' % S['zone'], flush=True)
    if await GI.enter_via(pg, cdp, tag, {'label': S['door']}, S['door'], S['zone'], near=1.2):
        await GI.converse(pg, cdp, tag, None, 30)
        await GI.wait_js(pg, "!!(GAME.E.zone&&GAME.E.zone.formal!==false)", 30); await pg.wait_for_timeout(3000)
        s = await pg.evaluate(GI.ST)
        await L.turn_camera_to(pg, cdp, s['x'], s['z'] - 5.0); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'art_%s_inside.png' % S['zone'])); print('  [art] art_%s_inside.png（進門站的地方 (%s,%s)、面向 −z）' % (S['zone'], s['x'], s['z']), flush=True)
        await GI.stuck_check(pg, cdp, tag, fb0, e0, errs)


# ---------------------------------------------------------------- 約會（cc_social_smoke_probe.py 的 Person）
def date_cls(SM):
    class GG2Date(SM.Person):
        def __init__(self, pw, pid, k):
            super().__init__(pw, pid); self.k = k; self.gg2_log = []

        async def meet_go(self, tag, go_snap, iv, plan, walk=False, record=True, variant=None):
            pg = self.pg; samples = []; flag = {'stop': False}; say0 = await pg.evaluate("(window.__CCS||[]).length")
            async def poll():
                while not flag['stop']:
                    try:
                        st = await self.st(); smp = await pg.evaluate(SM.SEAT_JS, self.pid)
                        samples.append({'t': time.time(), 'dlg': bool(st['dlg'] or st['dlgVis']), 'zone': st['zone'], 'smp': smp})
                    except Exception: pass
                    await asyncio.sleep(1.0)
            task = asyncio.ensure_future(poll())
            try: menus = await super().meet_go(tag, go_snap, iv, plan, walk=walk, record=record, variant=variant)
            finally:
                flag['stop'] = True; await task
            say = await pg.evaluate("(n=>(window.__CCS||[]).slice(n))", say0)
            self.gg2_log.append({'tag': tag, 'seat': self.seat_sample, 'samples': samples, 'say': say, 'iv': iv})
            return menus

        async def step_gg2(self):
            R, pg, k = self.R, self.pg, self.k; S = SH[k]; A = AA[k]
            d = await pg.evaluate("(()=>{ for(let x=STORY.dayOfKey('2025-10-07');;x++){ const w=CALENDAR.dateOf(x).wd%7; if(w>=1&&w<=5&&!CALENDAR.typhoon(x)) return x; } })()")
            h0 = {'afar': 9.0, 'daybreak': 7.0, 'aoki': 11.5}[k]
            pos0 = {'x': S['dx'], 'z': 15.0, 'yaw': 0} if k == 'aoki' else {'x': -20, 'z': 12, 'yaw': 0}
            await self.load(self.base(d, h0, 'gongguan', pos0), why='%s：平日 %s 在公館（今天還有時段可以約）' % (k, hhmm(h0)))
            # 關係門檻：afar 認識就約得到；Daybreak 認識約不到、有點熟約得到
            await self.setup({'met': True, 'rel': SM.REL['ACQUAINTANCE'], 'relUp': 4, 'ladEnd': True, 'contact': True}, '前置：認識（ACQUAINTANCE）、有聯絡方式')
            await self.reload_same('套用關係以後重讀')
            why = await pg.evaluate("(([id,pid])=>{ const P=INV.place(pid); return P?(INV.placeWhy(GAME.G,id,P)||''):'沒有這個地點'; })", [self.pid, S['zone']])
            if k == 'afar': R.check('afar：認識（ACQUAINTANCE）就約得到（INV.placeWhy 空）', why == '', why)
            elif k == 'aoki':
                R.check('青木茶室：認識（ACQUAINTANCE）就約得到（INV.placeWhy 空）', why == '', why)
                pv = [p for p in await pg.evaluate(SM.PRED_JS, self.pid) if p['pid'] == 'aoki']
                R.check('青木茶室：還沒去過（G.visited.aoki 沒有）＝手機約的地點沒有青木（show）', not pv, J(pv[:3]))
                # 去過一次：真的走進青木茶室再出來
                await L.go_to(pg, self.cdp, SM.GoRun(R), S['dx'], 20.4, 1.0, '青木茶室門口', max_s=SM.WALK_S)
                await pg.wait_for_timeout(800)
                if (await self.st())['interact'].startswith(S['door']):
                    await L.tap(pg, self.cdp, '#interact'); await pg.wait_for_timeout(7000)
                    await self.drive(SM.Plan(), 'aoki 進門', max_s=60)
                vz = await pg.evaluate("!!(GAME.G.visited&&GAME.G.visited.aoki)")
                R.check('青木茶室：走進去一次以後 G.visited.aoki＝true', vz, '')
                ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='gongguan'); return it?[it.x,it.z]:null; })()")
                if ex and (await self.st())['zone'] == 'aoki':
                    await L.go_to(pg, self.cdp, SM.GoRun(R), ex[0], ex[1], 0.5, '離開青木茶室', max_s=SM.WALK_S); await pg.wait_for_timeout(800)
                    await L.tap(pg, self.cdp, '#interact'); await pg.wait_for_timeout(7000); await self.drive(SM.Plan(), 'aoki 出門', max_s=60)
            else: R.check('Daybreak：認識（ACQUAINTANCE）約不到（minStage FAMILIAR）', why != '', why)
            if S['stage'] != 'ACQUAINTANCE' and k != 'aoki':
                await self.setup({'met': True, 'rel': SM.REL[S['stage']], 'relUp': 4, 'ladEnd': True, 'contact': True}, '前置：有點熟（%s）、有聯絡方式' % S['stage'])
                await self.reload_same('套用關係以後重讀')
            if not await self.check_free('%s 約之前' % k): return
            if k == 'daybreak':
                late = await pg.evaluate("(()=>{ const G=GAME.G, P=INV.place('daybreak'); const h0=G.hour; G.hour=14.5; let T=[], ln=null; try{ T=INV.timeOptions(G,false,P).filter(q=>!q.now&&q.day===G.day).map(q=>q.t); ln=P.lateNote?P.lateNote(G):null; }catch(e){ ln='ERR '+e; } G.hour=h0; return {today:T, late:ln}; })()")
                R.check('Daybreak 14:30 約：今天的時段一個都沒有、旁白「%s」' % A['late'], not late['today'] and late['late'] == A['late'], J(late))
            pred = [p for p in await pg.evaluate(SM.PRED_JS, self.pid) if p['pid'] == S['zone']]
            R.note('%s：手機約得到的時段（預測她的回答）：%s' % (k, J([[p['t'], p['res'], p['h']] for p in pred])))
            acc = [p for p in pred if p['res'] == 'accept' and (k != 'daybreak' or 8 - 1e-6 <= p['h'] <= 14 + 1e-6)]
            if not R.check('%s：手機有 %s 會答應的時段%s' % (k, self.pid, '（08:00～14:00 開始）' if k == 'daybreak' else ''), bool(acc), J(pred[:8])): return
            if k == 'daybreak': R.check('Daybreak：列出來的時段都在 08:00～14:00 開始', all(8 - 1e-6 <= p['h'] <= 14.75 for p in pred), J([p['h'] for p in pred]))
            opt = sorted(acc, key=lambda p: (p['day'], p['h']))[0]
            s0 = await pg.evaluate(SM.SNAP_JS)
            n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
            await self.campus_date('%s 約會（%s %s）' % (k, opt['verb'], opt['t']), s0, opt, walk_variant=False)
            # AA_652 答應的一句（手機訊息或對話）
            msgs = await pg.evaluate(SM.MSGS_JS, {'n': 0, 'id': self.pid})
            want = A['acc'].get(self.pid, A['acc0'])
            inv_lines = list(getattr(self, 'last_invite_lines', None) or [])   # BB-C 11-04：照玩家從手機約——她的回覆泡泡在手機對話裡（PC 809163ee4 那次其實有，探針只查 msgs）
            alltxt = [m['text'] for m in msgs] + [x['t'] for L_ in self.gg2_log for x in L_['say']] + inv_lines
            R.check('%s：答應的一句（AA_652：%s；手機對話＋訊息＋見面）' % (k, want), any(NZ(want) in NZ(t) for t in alltxt), J({'phone': inv_lines[-4:], 'msgs': [m['text'] for m in msgs][-6:]}))
            if not self.gg2_log: return R.check('%s：見面那一場有演（meet_go）' % k, False, '沒有 meet_go 紀錄')
            g = self.gg2_log[0]; ss = g['seat'] or {}
            R.note('%s：開演那一刻 %s' % (k, J(ss)))
            R.check('%s：X207 坐下才開演、兩個人同一桌（玩家坐、她坐、≤ 2.3 m 或同一張桌子）' % k, bool(ss.get('pseat') and ss.get('nseat') and ((ss.get('seatD') is not None and ss['seatD'] <= 2.3) or ss.get('sameGroup'))), J(ss))
            pre = []
            for x in g['samples']:
                if x['zone'] == S['zone'] and x['smp'].get('pseat'): break
                if x['zone'] == S['zone'] and x['smp'].get('nD') is not None and not x['smp'].get('nseat'): pre.append(x['smp']['nD'])   # BB-B 06:53：她已經坐好的取樣不算帶路
            if len(pre) > 2: R.check('%s：X207 帶路時她離玩家 ≤ 3 m' % k, max(pre[2:]) <= 3.0, '取樣 %d 次，最遠 %.2f m' % (len(pre), max(pre[2:])))
            else: R.info('%s：X207 帶路的取樣不夠（一進門就坐下？）' % k, J(pre))
            dl = [x for x in g['samples'] if x['dlg']]
            if dl: R.check('%s：X207 道別那一刻她在旁邊（≤ 4 m）' % k, (dl[-1]['smp'].get('nD') or 99) <= 4, J(dl[-1]['smp']))
            else: R.check('%s：見面有對話（道別）' % k, False, '沒有取到對話中的位置')
            T = [x['t'] for x in g['say']]
            so = any(NZ(o) in [NZ(t) for t in T] for o in A['open'])
            if so: R.check('%s：坐下以後的開場句（AA_652 seatOpen 兩句之一，逐字）' % k, True, J(T[:12]))
            else:   # CC-B 11-07（BB-B 06:47）：invites3d.js 361：有「一起喝咖啡／吃飯第 N 場」（AA_708 STUDYN.act，AX）＝不說 seatOpen，照那一場；故事線那一拍（AA_712 ARCS）放中途——二選一
                R.check('%s：坐下以後有開場（seatOpen 或 AA_708 第 N 場／AA_712 故事線那一拍；坐下以後有她的台詞）' % k, any(x.get('n') for x in g['say'][:12]), J(T[:12]))
            R.note('%s：X207 帶路取樣（進這一區以後、玩家還沒坐下；每一筆＝她離玩家 m、她坐著沒）：%s' % (k, J([[x['smp'].get('nD'), x['smp'].get('nseat'), x['smp'].get('p')] for x in g['samples'] if x['zone'] == S['zone']][:8])))
            if k == 'afar':   # CC-B 11-07（BB-B 04:59）：afar 約會座位——①空桌（不和客人同桌）②窗邊長桌（table 6）坐得下 ③開場句照座位（seatOpen.afar 第一句 onlyAt table 6）
                same = [o for o in (ss.get('othersInfo') or []) if o.get('seat') and ss.get('ptable') is not None and o['seat'][2] == ss.get('ptable')]   # BB-B 08:27：只看同一張桌子（卡座小圓桌本來就挨著，隔壁桌 1.1 m 不算）
                R.check('afar：①她挑的是空桌（同一張桌子 table %s 沒有其他客人坐著）' % ss.get('ptable'), not same, J({'ptable': ss.get('ptable'), 'same': same, 'near': ss.get('othersInfo')}))
                lamp = NZ('（你們在窗邊長桌坐下。她把桌上的小燈打開，又關掉，又打開。）')
                said_lamp = any(lamp in NZ(t) for t in T)
                if ss.get('ptable') == 6:
                    R.check('afar：②窗邊長桌（table 6）坐得下，兩個人都坐著', bool(ss.get('pseat') and ss.get('nseat')), J(ss))
                    R.info('afar：③窗邊長桌：開場句可以是檯燈那句或杯墊那句（這次＝%s）' % ('檯燈' if said_lamp else '杯墊'))
                else:
                    R.info('afar：②這一趟坐的是 table %s（不是窗邊長桌 6）——窗邊長桌那一點這次沒碰到' % ss.get('ptable'))
                    R.check('afar：③不是窗邊長桌（table %s）不說檯燈那一句（seatOpen.afar onlyAt table 6）' % ss.get('ptable'), not said_lamp, J(T[:8]))
            for x in g['say'][:40]: print('    %s｜%s' % (x.get('n') or '（旁白）', x.get('t')), flush=True)
    return GG2Date


async def case_date(pw, k):
    print('== %s_date：約會（cc_social_smoke_probe.py 的 Person）' % k, flush=True)
    SM = load_mod('cc_social_smoke_probe.py', 'cc_social_smoke')
    SM.DATE_BRANCH_MAX = int(os.environ.get('GG2_BRANCH') or 0)
    SM.STEPS = ['gg2']
    P = date_cls(SM)(pw, SH[k]['pid'], k)
    R = await P.run()
    for f in R.fails: GI.FAILS.append('[date %s] %s' % (k, f))
    print('== %s_date 結果：%s' % (k, 'PASS' if not R.fails else 'FAIL %d：%s' % (len(R.fails), '；'.join(R.fails[:6]))), flush=True)


async def main():
    os.makedirs(OUT, exist_ok=True)
    todo = [(KEY[c.split('_', 1)[0]], c.split('_', 1)[1]) for c in CASES if '_' in c and c.split('_', 1)[0] in KEY and c.split('_', 1)[1] in ALLC]
    print('CASES=%s' % J([t[0] + '_' + t[1] for t in todo]), flush=True)
    FN = {'door': case_door, 'hours': case_hours, 'closein': case_closein, 'order': case_order, 'seats': case_seats, 'art': case_art}
    async with async_playwright() as p:
        need_pg = any(c != 'date' for _, c in todo)
        if need_pg:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
            await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
            ok = await pg.evaluate("typeof GG2!=='undefined'&&!!Z3.ZONES.afar&&!!Z3.ZONES.daybreak")
            check('這一版有 afar、daybreak 區域和 GG2（src/gg2shops3d.js）', ok)
        for k, c in todo:
            if c == 'date': continue
            try: await FN[c](pg, cdp, errs, k)
            except Exception as e: check('[%s_%s] 探針本身沒有例外' % (k, c), False, repr(e)[:300])
        if need_pg:
            check('沒有 JS 例外', not errs, J(errs[:3]))
            await b.close()
        for k, c in todo:
            if c != 'date': continue
            try: await case_date(p, k)
            except Exception as e: check('[%s_date] 探針本身沒有例外' % k, False, repr(e)[:300])
    F = GI.FAILS
    print('ALL PASS' if not F else 'FAILED %d: %s' % (len(F), '；'.join(F[:10])), flush=True)
    sys.exit(1 if F else 0)

asyncio.run(main())
