"""BB-B 11-01：v9.10.15 發布後合進開發分支的幾件（開發分支 80e82a439；後三項 81dd3258c）——照玩家在畫面上看、按、截圖。一支用 MODE 分（逗號隔開可以一次跑好幾個，每個 MODE 開一個新的瀏覽器）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，2～4 fps）。劇情、手機的 MODE 用 '<URL>/index.html?turbo'（跟 vac_probe、date_bugs_probe 一樣）。
存檔：預設用「最小存檔」（GAME.defaults＋過了開場的旗標，同 flow_vac_hometown／zrlast load_min 的做法；日子過了就補 ROOM_Y2／Y3／Y4）；
  給第三個參數（或環境變數 SAVE＝使用者存檔.json）＝法律系那幾個 MODE 改用使用者存檔改日期（經濟系、畢業後的照樣用最小存檔）。
每一個讀檔、補關係／旗標都印 [前置]；用遊戲 API 補的另外寫【捷徑】。之後照玩家：點對話、選選項、按床、手機「地點」「朋友」「訊息」、手機自己打開就按「收起來／跳過」（L.phone_away）。
台詞全部用 GAME.say 的原文（HOOK 記 [名字, 句子, 日期, 時間, 當時 ADV 舞台]），不看打字到一半的對話框。

MODE：
  vac_y3summer  AA_549 3-1（51a6eceba、6511d4c0e）：大三暑假三選一 → 九個小場景。[前置] 2028-06-19 20:36 宿舍、台灣路線、Y4_PATH other、沒有 SUMMER_Y3。
                21:00 手機系統訊息「這個暑假要做什麼？」照 Y3KIND（intern 預設｜work｜study，逗號可以多個）回 → 床「快轉」→「到下一個有事的日子」一路快轉到 8/21 18:30 以後。
                PASS：6/26、7/24、8/21 18:30 那一場的句子照順序、名字對（指導律師／主任／學生／學生的媽媽／隔壁的考生）；6/26 的兩個選項照稿；
                      intern 8/21 是「主任：明年考完，再來。」＋卡片旁白、沒有舊旁白「最後一天，主任說：『明年考完，再來。』」；study 8/21 照以安在不在（R2Y3B.anBackY3）挑以安三句或紙條。
  vac_homeout   AA_549 3-4（4547d78e5）：[前置] 2027-08-03 10:00 宿舍（大二暑假）。手機「地點」→「回家」→ 家裡的選單有「出門」；「出門」→ 校門口／公館商圈／溫州街／不用了；
                「不用了」回到家裡的選單；「出門」→「公館商圈」＝人在 3D 公館、不在家、放假模式照舊；手機「地點」→「回家」又回到家裡的選單。
                晚餐：[前置] 另一份讀檔在挑過的日子 18:20 宿舍（那天晚餐抽到 AA_549 那十二題之一，頁面裡先讀 HOME.dinnerPick 挑日子）→ 回家 →「吃晚餐」→ 媽媽問、兩個選項、選第二個 → 媽媽回那個選項自己的一句（照稿）。
  vac_y1winter  AA_549 3-5（4582473f7、b00961c32）：[前置] 大一上第 12 週週一 12:12 宿舍 → 手機「活動」有「托福補習（寒假班）」1/5～1/16、按「報名」→ 排好四天 1/5、1/7、1/12、1/16；
                「活動」沒有 C18W@Y1；[前置] 另一份讀檔大一上第 6 週週一 11:50（【捷徑】加進全班群組）等到 12:10：沒有寒假團的公告；
                [前置] 同一份進度跳到 1/5 出發提示前 → 按「出發：」→ 第一堂（Kevin 三句＋選項「學長在這裡打工？」→ 那一句）；床「快轉」→ 1/7 模擬考出發 → 兩句。Kevin 門口（讀狀態）報了＝null。
  vac_heroine   AA_549 3-6（76c6495e9、22a2ba6dd）：[前置] 2026-07-14 09:00 宿舍；以安「朋友」（熟 45／信任 30／自在 10、認識、有聯絡方式），沒有和可昕交往。
                床「快轉」一路快轉：她傳「暑假總圖開到九點。明天下午，我在三樓。」（快轉停在訊息上、手機打開）→ 在她的對話按「答應」→ 7/15 15:00「直接過去：和…約在總圖（15:30）」→ 到了、一起坐下 →
                PASS：見面她說的第一句＝「暑假的總圖，冷氣比較冷。你有帶外套嗎？」；那一筆 HASK sent 記 vs summer、邀約 done。
  zr_summer     AA_550 第 4 節（15d58e729）＋5d62ce2fa＋AA_551（e12097855）。ZR＝qixi,bath,shift,reunion,cup（預設全部）：
                qixi    [前置] 2026-08-18 10:00 宿舍、芷若第 6 階 → 手機「約」→「約她過節：七夕」→「開車去台中找她（一整天）」→ 快轉到 8/19 出發 → 台中：背景 tc_cafe、她說「我在家裡的廚房試做了一杯特調。很甜。……想給你喝。」、沒有店裡那句
                bath    [前置] 2026-08-01 23:15 宿舍、芷若朋友 → 每天 23:1x 手機傳「聊天」給她（最多 ZR_BATH_DAYS＝10 天，【前置】同一份進度跳到隔天 23:15）→ 抽到「洗完澡」那一則＝「剛洗完澡。台中的晚上比臺北安靜。」，
                        等它真的送到、打開對話截圖；對照 8/26 23:1x：回的那一則沒有「下班」「客人」（zrNoShift 8/26）
                shift   [前置] 2026-08-26 19:40、2026-08-27 19:40 兩點半 Café：8/26 她不在吧檯（作息不是 barista）、8/27 在
                reunion [前置] 交往中、首爾交流（C08@Y1）參加完：8/25 20:40 等到 21:15 不約；8/26 20:40 等到 21:15「明天我十點下班。」「……你來的話，我晚一點關燈。」、排 8/27 22:00；快轉到 8/27 出發 → 重逢三句
                cup     [前置] 畢業後最小存檔 2029-09-01 15:00 溫州街 Café 門口（zrlast ZL_AGAIN_KEEP 同一份）→ 走進 Café → 選「我一直收著。」→ 旁白「（她做了一杯熱可可……「不用還了。」）」接她「……那這杯，也是你的。」
                （大一下期末飯「暑假我回台中，八月二十六號回來。」、出國期間「我媽在旁邊一直問我在跟誰傳訊息。」沒做：見報告）
  date_away     BUG-DATE-AWAY-BUSY-1031（caabccf30）：[前置] 2026-07-05（日）10:30 宿舍、芷若第 6 階關係（她 7/1～8/25 在台中）→ 手機「約」→「出去玩…」→ 臺中草悟道（D26）→（高鐵）→「明天」→ 09:00：
                09:00 沒有灰、沒有「她那時候有事／要上班」→「預計花費」→「就這樣約」→ 她「你要來臺中？……好。我帶你走。」、排好 7/6 D26 → 床快轉到 7/6 → 按「出發：」→ 那一趟演完（trip 不是 booked）。
  visuals       VIS＝gymb1,bell,lamp,us,plates（預設全部）。只截圖＋記數字（美術好不好看截圖，READY_FOR_ART_REVIEW）；PASS 只看：區域載入、鏡頭放得到、沒有整張純黑（亮度 <12 超過 25%）、名牌字的方向（讀網格）：
                gymb1  體育館 B1（82107f8b5、1c380b649）：14:00、20:30 大廳、走廊、泳池、三塊門牌近拍（固定鏡頭）；光照貼圖網格數；三塊門牌畫了字、雙面
                bell   傅鐘（a45c719e1）：2025-10-15 14:00 行政大樓門廊往東、西 1.3 m（−36.7／−39.3, 23.5），從南邊走過去停下來＝自然的跟隨鏡頭；
                       量人看得到多少（藏人前後兩張圖的差，扣掉沒藏的雜訊）、鏡頭在不在鐘亭附近、seethru_bell_stone 有標透視
                lamp   118 巷慢讀咖啡、Pasta 118、溫州街店內吊燈（54a5a2527）20:30、14:00 固定鏡頭
                us     美國公寓、法圖、亞洲超市（5003d2dd9）14:00、20:30 出生點四個方向；光照貼圖網格數
                plates 校園側牆名牌（8b9ddfb88）女舍傳達室、男賓止步×2、共同側門、社科院系名牌：讀遊戲裡網格的 UV（從正面看 u 往右、v 往下＝字是正的）＋近拍
  kai_sheet     BUG-KAI-SHEET-Y0-1031（dbf8bec7d）：KAI＝econ,y2,old（預設全部）
                econ [前置] 經濟系最小存檔 2024-09-23 08:00 宿舍（事件模式）、阿凱「有點熟」→ 照玩家讓事件模式自己跳到 KAI_END（預設 2024-12-02）→ 沒有 dp_kai_sheet、沒有評鑑表的句子（期間要有別的手機小事 dp_ 才算數）
                y2   [前置] 2026-09-21 08:00 宿舍（大二上）、阿凱有點熟 → 床「快轉」（學期中）直到收到第一次 → 是第 1 種「表更新了」＋「📷（泡麵評鑑表）」
                old  [前置] 同上，【捷徑】假裝經濟系那年收過三次（dpN 3、三組 2024 的訊息）→ 第一次收到的是第 1 種、KAI_SHEET_Y0N＝3、KAI_SHEET_Y0FIX＝1
  adv_linger    BUG-ADV-LINGER-1018（c70058d99）：每一句台詞記 ADV 舞台（ADV.slots、ADV.want、左右框的 show）；ADV_CASES＝e26,bus_h,home_h,bus,home,e20（預設全部）
                e26     [前置] 經濟系 2024-10-17 15:18 宿舍、E30 演過 → 事件模式自己接 16:10 的 ev_y0_e26：「（你拿了車鑰匙出門。）」時舞台上沒有可昕；她開口以前都沒有；她開口以後才出來
                bus_h／home_h  [前置] 退宿後在家，2025-07-25 02:30（KH_GO bus）／07:30（KH_GO home）讀檔（快轉停在那一刻）→ 家裡那一輪演 ev_y0_kh_bus_h／_home_h
                bus／home      [前置] 同一刻人在公館（不在家）→ ev_y0_kh_bus／_home（auto）；被自動送回家而演成 _h 的照記
                e20     [前置] 退宿後在家 2024-12-25 18:35、【前置】ECON_FULL（30 分鐘版把 E20 剪了）→ 自動出發 → 火鍋店門口她說「欸。這個。」時左邊沒有阿勳殘留
  aa529_cards   AA529-ECON-FIX-1030（8a893df3f）：AA529＝cards,k7,k0b,s829（預設全部）
                cards [前置] 經濟系退宿後在家 2025-04-24 22:40 → 在家「事件接事件」自己跳（玩家看）→ 到 6/8：日期卡出「（每天早上，還是比誰先坐到桌子前面。……）」接「（五月，書桌旁邊多了一台電風扇。……）」
                      （一跳 4/24→6/8＝同一張卡兩行，DOM #title3 有 <br>）
                k7    [前置] 法律系 2025-10-20 21:00 宿舍、和可昕交往、K7 第一年去了 → 房間的「她的週年卡片」→「翻後面幾頁」→ 第 4 頁（第三段）「2025.2.2　蓮池潭。你說一起重考的時候，風把我的頭髮全吹到臉上。」、沒有「筷子掉了兩次」
                k0b   [前置] 經濟系退宿後在家 2025-02-15 09:00 → 事件模式跳到 3/16：期間和可昕見面的閒聊階梯 K0b-L1「國界」只在 2/15～3/15（沒見到面＝未驗證，只記）
                s829  [前置] 經濟系退宿後在家 2025-08-30 21:30 → 家裡「睡覺」→ 8/31 轉法律系的摘要第 2 句「這個暑假，你還是住在家裡。媽媽每天問你，新宿舍還缺什麼。」、沒有「整個暑假」
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<mode>[,<mode>...] python3 post91015_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]"""
import os, sys, json, asyncio, re, math, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
MODES = [m.strip() for m in os.environ.get('MODE', 'visuals').split(',') if m.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
PI = math.pi
ENV = lambda k, d: [x for x in os.environ.get(k, d).split(',') if x]

# ---------------------------------------------------------------- 存檔
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場（flow_vac_hometown BASE＋zrlast y1min）；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
TWROUTE = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'Y4_PATH': 'other'}
ECON0 = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'KX_FIRST_MSG': True,
         'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 經濟系事件模式（kx3d_probe／kxmap_probe 的 BASEF）
ECON_OUT = {'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17', 'Y0_DATING': True, 'KX_CAR': 'only_me', 'E12_ASKED': True, 'Y0_LEFT': True}
ECON_DONE_OUT = {'ev_y0_e30': 1, 'ev_y0_a3': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1, 'ev_y0_e30_note': 1}
ECON_FRIENDS = ('kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu')

JSENV = """(()=>{ const G=GAME.G, F=G.flags, D=k=>STORY.dayOfKey(k);
  const LV=(id,f,t,c,o)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t||0; r.comf=c||0; if(o) Object.assign(r,o); SOCIAL.remember(id,'FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
    return {fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom|0,rom:r.rom|0}; };
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  __BODY__ })()"""


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000):
    """法律系的存檔：最小存檔（或使用者存檔）改到那一天、那個時間、那一區"""
    d = await P.day_of(pg, key)
    if SAVE is not None:
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        F = st.setdefault('flags', {})
    else:
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
        F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law')
    st['money'] = max(st.get('money') or 0, money)
    return st, d


async def econ_state(pg, key, h, zone, moved, flags=None, home_at=None, done=None):
    """經濟系那一年的最小存檔（事件模式）；moved＝退宿以後住臺北的家"""
    d = await P.day_of(pg, key); e26 = (await P.day_of(pg, '2024-10-17'))['d']
    F = dict(ECON0)
    if moved: F.update(ECON_OUT); F['E26_DAY'] = e26
    F.update(flags or {})
    st = {'stage': 'econ', 'name': '祐廷', 'day': d['d'], 'weekday': d['wd'], 'hour': h, 'zone': zone, 'pos': None, 'weather': 'clear', 'energy': 100, 'money': 20000,
          'flags': F, 'contacts': {k: d['d'] - 40 for k in ECON_FRIENDS},
          'events': {'done': dict(done if done is not None else (ECON_DONE_OUT if moved else {'ev_y0_e02': 1})), 'last': {}, 'count': 0}}
    if moved: st['home'] = {'at': True if home_at is None else bool(home_at), 'base': True, 'day': d['d']}
    return st, d


async def postgrad_state(pg, key, h, zone, pos, flags):
    """畢業以後的最小存檔（zrlast_probe.py load_min 的做法）"""
    ks = ['2026-09-06', '2027-09-05', '2028-09-03', '2029-06-01', '2029-06-02', '2029-06-28', key]
    dk = {k: (await P.day_of(pg, k))['d'] for k in ks}; d = await P.day_of(pg, key)
    F = {'KX_DEC3_MIGRATED': True, 'Y4_PATH': 'other', 'BAR_REG': False, 'PACKED_Y4': dk['2029-06-01'], 'ROOM_Y2': dk['2026-09-06'], 'ROOM_Y3': dk['2027-09-05'], 'ROOM_Y4': dk['2028-09-03'],
         'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True,
         'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'PG': {'done': {'grad': 1}}}
    F.update(flags)
    st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': d['d'], 'weekday': d['wd'], 'hour': h, 'energy': 100, 'money': 22000, 'zone': zone, 'pos': pos, 'weather': 'clear', 'flags': F,
          'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1, 'ev_sis_w1': 1}, 'last': {}, 'count': 0}}
    return st, d


async def load(pg, cdp, run, st, label, js=None, quiet=False):
    """[前置] 讀檔（遊戲自己的 GAME.applySave）；js＝讀檔後用遊戲 API 補的【捷徑】，補完 GAME.snapshot() 再讀一次（區域照新狀態重建）。手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=False)
    await pg.wait_for_timeout(3500); r = None
    if js:
        r = await pg.evaluate(JSENV.replace('__BODY__', js))
        snap = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, snap, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s%s%s' % (label, '（quiet_events）' if quiet else '', ('；【捷徑】讀檔後用遊戲 API 補：%s → %s' % (js.strip()[:260], J(r)[:300])) if js else ''))
    return r


async def snap(pg):
    return await pg.evaluate("()=>GAME.snapshot()")


async def jump(pg, cdp, run, s0, key, h, zone=None, pos='keep', quiet=False, note=''):
    """[前置] 同一份進度（s0＝GAME.snapshot()）跳到另一天、另一個時間再讀"""
    s = copy.deepcopy(s0); d = await P.day_of(pg, key)
    s.update(day=d['d'], weekday=d['wd'], hour=h)
    if zone: s['zone'] = zone
    if pos != 'keep': s['pos'] = pos
    await L.load_state(pg, s, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500); await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] 同一份進度跳到 %s %.2f %s%s' % (d['key'], h, s['zone'], ('；' + note) if note else ''))
    return d


# ---------------------------------------------------------------- 記錄（GAME.say、選項、ADV 背景、日期卡、提示、ADV 舞台）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), z:GAME.G.zone}; }catch(e){ return {}; } };
  const adv=()=>{ try{ const A=ADV; if(!A||!A.active) return {active:false}; const f=s=>{ const box=s==='left'?A.L:A.R, sl=A.slots&&A.slots[s], w=A.want&&A.want[s];
      return {show:!!(box&&box.classList.contains('show')), off:!!(box&&box.classList.contains('off')), id:sl?(sl.charId||null):null, compact:!!(sl&&sl.compact), want:w?(w.charId||null):null}; };
    return {active:true, L:f('left'), R:f('right')}; }catch(e){ return {err:String(e)}; } };
  window.__ADVST=adv;
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>6000) window.__PL.splice(0,1500); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ const r=push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t),pre:adv()}); let ret;
    try{ ret=s0.apply(this,arguments); } finally { try{ r.post=adv(); setTimeout(()=>{ try{ r.late=adv(); }catch(e){} },600); }catch(e){} } return ret; };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).map(x=>x&&(x.t||x.text)||'').join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ const bg=o&&o.background; push({k:'bg',n:'',t:typeof bg==='string'?bg:JSON.stringify(bg||null)}); return b0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  const el=document.getElementById('title3'); if(el){ let last=''; new MutationObserver(()=>{ const h=el.innerHTML||''; if(h&&h!==last){ last=h; push({k:'t3',n:'',t:h}); } }).observe(el,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""
NAMES = """(id=>{ const s=new Set(); try{ s.add(SOCIAL.displayName(id)); }catch(e){} try{ s.add(SOCIAL.npcName(id)); }catch(e){} const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.name) s.add(c.name); if(c.nickname) s.add(c.nickname); return [...s].filter(Boolean); })"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = (await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0))
    return [r for r in R if k is None or r['k'] == k]


def said(R):
    return [[r['n'], r['t']] for r in R if r['k'] == 'say']


async def names_of(pg, cid, extra=()):
    return set(await pg.evaluate(NAMES, cid)) | set(extra)


def name_ok(want, n):
    if want is None: return True
    if isinstance(want, (set, frozenset, list, tuple)): return n in want
    return n == want


def seq_in(lines, want):
    """want（[(名字或 None／名字的集合, 句子)]）照順序出現在 lines（[[名字, 句子]]）；回傳對到幾句"""
    i = 0
    for n, t in lines:
        if i < len(want) and t == want[i][1] and name_ok(want[i][0], n): i += 1
    return i


# ---------------------------------------------------------------- 照玩家操作
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
FF_OPTS = ('到下一個有事的日子', '到下一個有事的時候')


def pick_opt(ch, picks=(), ff=True):
    """選哪一個：picks（開頭符合、或包含；照順序）→ 快轉（到下一個有事的日子／時候）→ 床的選單（快轉，不快轉就睡）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    if ff:
        for i in live:
            if T[i].startswith(FF_OPTS): return i, 'ff'
    if any(t.startswith(('再撐一下', '先不睡')) for t in T) or (any(t.startswith('睡覺') for t in T) and any(t.startswith('快轉') for t in T)):   # 床、家裡的選單
        if ff:
            for i in live:
                if T[i].startswith('快轉'): return i, 'ff'
        for w in ('睡到明天', '睡覺', '睡一下', '睡到傍晚', '小睡 2 小時', '小睡'):
            for i in live:
                if T[i].startswith(w): return i, 'sleep'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(('出發：', '直接過去：', '接起來：')) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


DUE_SOON = """(()=>{ const G=GAME.G, now=G.day*24+G.hour; let best=null; const c=(t,lab)=>{ if(best==null||t<best.t) best={t,lab}; };
  for(const iv of (G.invites||[])) if(iv.state==='accepted'&&now<iv.day*24+iv.h+0.6) c(iv.day*24+iv.h-0.5,'約：'+iv.who+' '+iv.h);
  try{ for(const q of OUT.rec(G)) if(q.state==='planned'&&now<q.day*24+q.h+0.75){ const tr=OUT.trip?OUT.trip(G,q,true):{}; c(q.day*24+q.h-((tr&&tr.travelH)||q.travelH||0)-0.25,'出遊：'+(q.title||q.id)); } }catch(e){}
  return best?{gap:+(best.t-now).toFixed(2),lab:best.lab}:null; })()"""
DLGFULL = "((GAME.D&&GAME.D.full)||(document.getElementById('dlgText')||{}).textContent||'')"
CARD_ON = "(s=>{ const e=document.getElementById('title3'); return !!e&&+getComputedStyle(e).opacity>0.5&&(e.innerHTML||'').indexOf(s)>=0; })"


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=150, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


async def to_dorm(pg, cdp, run):
    """手機「地點」→ 宿舍「前往」"""
    await P.phone_tab(pg, cdp, 'places')
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-place^=\"dorm|\"]')"):
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp); return False
    await L.tap(pg, cdp, '#phoneBody [data-place^="dorm|"]')
    for _ in range(60):
        await pg.wait_for_timeout(1000); s = await P.ts(pg)
        if s['ch']:
            k, _ = pick_opt(s['ch'], ('前往', '直接'), False); await P.tap_choice(pg, cdp, k); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if s['zone'] == 'dorm' and not s['busy']: return True
    return (await P.ts(pg))['zone'] == 'dorm'


async def play(pg, cdp, run, until_js=None, max_s=1800, picks=(), tag='', ff=True, on_phone=None, shots_at=(), shots_first=0, card_watch=None):
    """照玩家過日子：對話點過去、選項照 pick_opt、手機自己打開（D103）就收起來（on_phone 先看要不要回）、空下來就去床「快轉」（ff）；
    約好的事、該出發的出遊 1.5 小時內就站著等（不快轉跳過）。shots_at＝對話框出現這幾句（包含）就截圖；shots_first＝最先出現的幾句截圖；card_watch＝(字, 標籤) 日期卡出現就截圖。
    回傳 until_js 是否成立"""
    t0 = time.time(); idle = 0; last = None; same = 0; waited = None; pend = list(shots_at); nfirst = 0; card_done = False
    while time.time() - t0 < max_s:
        if card_watch and not card_done and await pg.evaluate(CARD_ON, card_watch[0]):
            await run.shot(pg, card_watch[1]); card_done = True
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0
        if until_js and free and await pg.evaluate(until_js):
            await pg.wait_for_timeout(1500); s2 = await P.ts(pg)
            if not s2['dlg'] and not s2['ch'] and not s2['busy'] and await pg.evaluate(until_js): return True
            continue
        if s['phone'] and not s['ch'] and not s['dlg']:
            if on_phone and await on_phone(): idle = 0; continue
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); idle = 0; continue
        if s['ch']:
            sig = (s['day'], s['h'], tuple(o['t'] for o in s['ch'])); same = same + 1 if sig == last else 0; last = sig
            if same > 25:
                run.note('%s：同一個選單點了 25 次沒有反應：%s' % (tag, J(s['ch'])[:400])); await run.shot(pg, tag + '_stuck'); return False
            k, why = pick_opt(s['ch'], picks, ff)
            if why not in ('ff', 'sleep'): run.note('%s %s %.2f 選項 %s → %s' % (tag, (await P.clock(pg))['key'], s['h'], J([o['t'][:22] for o in s['ch']]), s['ch'][k]['t'][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); idle = 0; continue
        if s['dlg']:
            if pend or nfirst < shots_first:
                full = await pg.evaluate(DLGFULL)
                hit = next((x for x in pend if x and x in full), None)
                if hit or nfirst < shots_first:
                    await pg.wait_for_timeout(1000); nfirst += 1
                    await run.shot(pg, '%s_line%02d' % (tag, nfirst))
                    if hit: pend.remove(hit)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); idle = 0; continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(700); continue
        idle += 1
        if idle < 3 or not ff: await pg.wait_for_timeout(1500); continue
        if await pg.evaluate("!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(GAME.G))"): await pg.wait_for_timeout(1500); continue   # 在家：選單會自己出來
        due = await pg.evaluate(DUE_SOON)
        if due and due['gap'] <= 1.5:
            if waited is None or waited[0] != due['lab']: waited = (due['lab'], time.time())
            if time.time() - waited[1] < 420: await pg.wait_for_timeout(2000); continue
            run.note('%s：等「%s」超過 7 分鐘沒有出發提示，照樣快轉' % (tag, due['lab']))
        if s['zone'] != 'dorm' and not await to_dorm(pg, cdp, run):
            run.note('%s：回不了宿舍（%s）' % (tag, s['zone'])); await pg.wait_for_timeout(3000); continue
        if not await press_bed(pg, cdp, run):
            run.note('%s：按不到床（%s）' % (tag, J(await P.clock(pg)))); await run.shot(pg, tag + '_nobed'); return False
        idle = 0
    return False


async def wait_menu(pg, cdp, pred, max_s=90):
    """等選單：對話點過去、手機收起來；pred(選項文字) 成立就回傳選單。別的選單（起床、確認）照婉拒那一類選；家裡的選單不亂選（回傳給呼叫的人看）"""
    t0 = time.time(); ch = None
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if pred(T): return s['ch']
            if any(t.startswith(('先起床', '不用了', '晚一點', '算了')) for t in T):
                k, _ = pick_opt(s['ch'], (), False); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
            ch = s['ch']; await pg.wait_for_timeout(800)
            if time.time() - t0 > 20: return ch
            continue
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(800)
    return ch


async def tap_prefix(pg, cdp, ch, prefix):
    k = next((i for i, o in enumerate(ch or []) if o['t'].startswith(prefix) and not o['dim']), None)
    if k is None: return False
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); return True


async def answer_ask(pg, cdp, run, ask_id, label, tag):
    """手機：那一則有選項的訊息 → 點開頭是 label 的回覆鍵（像玩家打開那個對話再點）"""
    th = await pg.evaluate("(id=>{ const m=(GAME.G.msgs||[]).find(x=>x&&x.ask&&x.ask.id===id); return m?(PHONE.th?PHONE.th(m):m.th):null; })", ask_id)
    if not th: return None
    await P.phone_thread(pg, cdp, th, open_folds=False); await run.shot(pg, tag + '_ask')
    opts = await pg.evaluate("id=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(x=>(x.dataset.ask||'').startsWith(id+'|')).map(x=>(x.textContent||'').trim())", ask_id)
    b = await pg.evaluate("([id,lab])=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>(x.dataset.ask||'').startsWith(id+'|')&&(x.textContent||'').trim().startsWith(lab)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; }", [ask_id, label])
    if b:
        await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1500); await run.shot(pg, tag + '_answered')
    await L.close_panels(pg, cdp)
    return {'th': th, 'opts': opts, 'tapped': b[2] if b else None}


async def go_home(pg, cdp, run, tag):
    """手機「地點」→「回臺北的家」的「回家」；回傳有沒有那個鍵"""
    await P.phone_tab(pg, cdp, 'places')
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-gohome]')"):
        await run.shot(pg, tag + '_nogohome'); await L.close_panels(pg, cdp); return False
    await run.shot(pg, tag + '_places'); await L.tap(pg, cdp, '#phoneBody [data-gohome]'); await pg.wait_for_timeout(1500)
    return True


async def send_chat(pg, cdp, run, pid, topic='chat'):
    """手機「訊息」→ 她的對話（沒有就從「朋友」）→「傳訊息」→ 話題（topic 沒有就第一個）"""
    r = await P.phone_thread(pg, cdp, 'p:' + pid, open_folds=False)
    if not r['ok']:
        await P.phone_tab(pg, cdp, 'friends')
        if await pg.evaluate("id=>!!document.querySelector('#phoneBody [data-msg=\"'+id+'\"]')", pid): await L.tap(pg, cdp, '#phoneBody [data-msg="%s"]' % pid); await pg.wait_for_timeout(900)
    if not await pg.evaluate("id=>!!document.querySelector('#phoneBody [data-msgto=\"'+id+'\"]')", pid):
        why = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await L.close_panels(pg, cdp); return {'ok': False, 'why': why[-160:]}
    await L.tap(pg, cdp, '#phoneBody [data-msgto="%s"]' % pid); await pg.wait_for_timeout(900)
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>[b.dataset.msgt,(b.textContent||'').trim()])")
    key = next((t[0] for t in tops if t[0] == pid + '|' + topic), None) or next((t[0] for t in tops if not t[0].endswith('|cancel') and not t[0].endswith('|share')), None)
    if not key: await L.close_panels(pg, cdp); return {'ok': False, 'topics': tops}
    await L.tap(pg, cdp, '#phoneBody [data-msgt="%s"]' % key); await pg.wait_for_timeout(1500)
    await L.close_panels(pg, cdp)
    return {'ok': True, 'topic': key, 'topics': tops}


# ---------------------------------------------------------------- 畫面
def lum_stats(path):
    try:
        from PIL import Image
        im = Image.open(path).convert('L'); im = im.resize((max(1, im.width // 4), max(1, im.height // 4))); px = list(im.getdata()); n = len(px)
        return {'dark': round(sum(1 for v in px if v < 12) / n, 3), 'white': round(sum(1 for v in px if v > 248) / n, 3), 'mean': round(sum(px) / n, 1)}
    except Exception as e:
        return {'err': str(e)}


def diff_frac(a, b, box, thr=28):
    """兩張圖在 box（x0,y0,x1,y1）裡不一樣的像素比例"""
    try:
        from PIL import Image, ImageChops
        A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
        x0, y0, x1, y1 = [int(round(v)) for v in box]; x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(A.width, x1), min(A.height, y1)
        if x1 - x0 < 4 or y1 - y0 < 4: return None
        dd = ImageChops.difference(A.crop((x0, y0, x1, y1)), B.crop((x0, y0, x1, y1))).convert('L'); px = list(dd.getdata())
        return round(sum(1 for v in px if v > thr) / len(px), 3)
    except Exception as e:
        return None


CAMSET = """(([p,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); return true; })"""
CAMAT = "(()=>{ const c=GAME.E.camera.position; return [+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]; })()"
CAMEND = "(()=>{ const E=GAME.E; E.player.obj.visible=true; if(E.endCinematic) E.endCinematic(); })()"
ZCHK = """(()=>{ const E=GAME.E, Z=E.zone; let lm=0, mesh=0; const black=[]; E.scene.traverse(o=>{ if(!o.isMesh||!o.visible) return; mesh++; const ms=Array.isArray(o.material)?o.material:[o.material];
    if(ms.some(m=>m&&m.lightMap)) lm++; for(const m of ms){ if(m&&m.color&&m.color.getHex()===0&&!m.map) black.push(o.name||m.name); } });
  return {zone:GAME.G.zone, formal:!!(Z&&(Z.formal||Z.formalInfo)), lm, mesh, black:[...new Set(black)].slice(0,6), key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)}; })()"""


async def fixed_shot(pg, run, tag, p, l, wait=3500):
    """固定鏡頭（只給光照、近拍字用）：放好、等、截圖、量黑／死白比例、鏡頭有沒有放到"""
    await pg.evaluate(CAMSET, [list(p), list(l)]); await pg.wait_for_timeout(wait)
    at = await pg.evaluate(CAMAT); f = await run.shot(pg, tag); st = lum_stats(f)
    return {'tag': tag, 'cam': at, 'placed': math.dist(at, list(p)) < 0.6, 'lum': st}


async def wait_zone(pg, zone, js_ok=None, max_s=60):
    t0 = time.time(); ck = None
    while time.time() - t0 < max_s:
        ck = await pg.evaluate(ZCHK)
        if ck['zone'] == zone and (js_ok is None or await pg.evaluate(js_ok)): return ck
        await pg.wait_for_timeout(1000)
    return ck


# ================================================================ 1. 大三暑假九個小場景
Y3_FIRST8 = '姊姊回家，看到你的筆記：『這是你寫的？字變小了。』'
Y3 = {
    'intern': dict(ans='法律服務中心的暑期實習', picks=['「一半。」'], opts=['「一半。」', '「看懂了。」'],
                   days={'2028-06-26': [(None, '實習第一天，你負責影印。影印機比你還資深。'), ('指導律師', '影印完，順便看一下你印的是什麼。'), ('指導律師', '……看懂了嗎？'), ('指導律師', '一半很好。我第一年只看懂三分之一。')],
                         '2028-07-24': [(None, '你第一次自己寫完一份初談紀錄。律師只改了兩個字。'), ('指導律師', '這兩個字很重要。「可能」跟「應該」，不一樣。')],
                         '2028-08-21': [('主任', '明年考完，再來。'), (None, '（你的桌上多了一張卡片，事務所五個人的字。最下面那個字最醜，是主任寫的。）')]},
                   never={'2028-08-21': ['最後一天，主任說：『明年考完，再來。』']}, shots=['影印完，順便看一下', '這兩個字很重要', '明年考完，再來。']),
    'work': dict(ans='打工', picks=['「上完帶你去吃冰。」'], opts=['「暑假才要上。」', '「上完帶你去吃冰。」'],
                 days={'2028-06-26': [(None, '暑假學生的課排得比學期中多。宿舍沒什麼人，你每次都是第一個出門。'), ('學生', '老師，暑假也要上喔？'), ('學生', '說好的喔。')],
                       '2028-07-24': [(None, '學生問你，法律系是不是都在背。你說：『背完以後才開始。』'), ('學生', '那我不要念法律。……我要念背完就結束的。')],
                       '2028-08-21': [(None, '最後一堂課，學生的媽媽塞了一盒水果給你。'), ('學生的媽媽', '這一盒是我們家自己種的芒果。拿回去。'), (None, '（學生在門口揮手，揮到電梯門關起來。）')]},
                 never={}, shots=['老師，暑假也要上喔？', '那我不要念法律', '這一盒是我們家自己種的芒果']),
    'study': dict(ans='在家開始讀國考的書', picks=['「對。」'], opts=['「對。」', '「還沒決定。」'],
                  days={'2028-06-26': [(None, '你把大一的《民法》從紙箱裡拿出來。書角都翻捲了。'), (None, '（總圖 B1 的位子，八點以前就被書包佔滿。你搶到靠插座的那一個。）'), ('隔壁的考生', '同學，你也是明年考？'), ('隔壁的考生', '加油。我第三年了。……今年會上。')],
                        '2028-07-24': [(None, '七月。冷氣開著，你讀完第一本。'), (None, '（七月最熱的那個禮拜，B1 的冷氣開到最強。你帶了一件外套。）'), (None, '（隔壁的考生把一包餅乾推過來。）'), ('隔壁的考生', '多買的。')],
                        '2028-08-21': None},   # 照以安在不在挑（下面）
                  never={}, shots=['同學，你也是明年考？', '多買的。', '姊姊回家']),
}
Y3_STUDY_AN = ['你暑假都在這裡？', '……我在京都的圖書館，也是坐最角落。', '明天開始，我也來。']
Y3_STUDY_NOTE = '（隔壁的考生今天沒有來。他的位子上放了一張紙條：「我上了。這個位子給你。」）'


async def m_vac_y3summer(pg, cdp, run):
    for kind in ENV('Y3KIND', 'intern'):
        X = Y3.get(kind)
        if not X: run.check('Y3KIND＝%s 認得' % kind, False, '只有 intern、work、study'); continue
        d608 = (await P.day_of(pg, '2028-06-08'))['d']
        st, d = await state_at(pg, '2028-06-19', 20.6, 'dorm', flags=dict(TWROUTE, Y4_PATH_DAY=d608))
        await load(pg, cdp, run, st, '%s：最小存檔 2028-06-19（%s，大三暑假）20:36 宿舍；台灣路線、Y4_PATH other（6/8 選過）；沒有 SUMMER_Y3' % (kind, d['term']))
        n0 = await pl_len(pg)
        ok = await play(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m&&m.ask&&m.ask.id==='y3_summer_plan')", max_s=600, ff=False, tag='y3_%s_wait21' % kind)
        a = await answer_ask(pg, cdp, run, 'y3_summer_plan', X['ans'], 'y3_%s' % kind) if ok else None
        f = await pg.evaluate("GAME.G.flags.SUMMER_Y3||null")
        run.check('%s：6/19 21:00 手機「這個暑假要做什麼？」三個選項，點「%s」＝SUMMER_Y3 %s' % (kind, X['ans'], kind),
                  bool(a) and a['opts'] == ['法律服務中心的暑期實習', '打工', '在家開始讀國考的書'] and f == kind, J({'ask': a, 'flag': f}))
        if f != kind:
            await load(pg, cdp, run, await snap(pg), '%s：同一份進度' % kind, js="F.SUMMER_Y3=%s; return F.SUMMER_Y3;" % J(kind))
        until = "(()=>{ const G=GAME.G, k=CALENDAR.dateOf(G.day).key; return k>'2028-08-21'||(k==='2028-08-21'&&G.hour>=18.5&&(window.__PL||[]).some(r=>r.k==='say'&&r.d==='2028-08-21'&&r.h>=18.49)); })()"
        done = await play(pg, cdp, run, until, max_s=int(os.environ.get('Y3_MAX', '3600')), picks=X['picks'], tag='y3_%s' % kind, ff=True, shots_at=X['shots'])
        R = await rows(pg, n0); now = await P.clock(pg); await run.shot(pg, 'y3_%s_end' % kind)
        run.check('%s：照玩家快轉到 2028-08-21 18:30 以後（現在 %s %.2f）' % (kind, now['key'], now['h']), done, J(now))
        for day, want in X['days'].items():
            L_ = [[r['n'], r['t']] for r in R if r['k'] == 'say' and r['d'] == day and r['h'] >= 18.4]
            if want is None:   # 讀書 8/21：以安回來了沒
                anb = await pg.evaluate("(()=>{ try{ return !!R2Y3B.anBackY3(GAME.G); }catch(e){ return 'ERR '+e.message; } })()")
                an = await names_of(pg, 'heroine_01')
                want = [(None, Y3_FIRST8)] + ([(an, t) for t in Y3_STUDY_AN] if anb is True else [(None, Y3_STUDY_NOTE)])
                run.note('%s 8/21：R2Y3B.anBackY3＝%s（%s那一版）' % (kind, anb, '以安三句' if anb is True else '紙條'))
            got = seq_in(L_, want)
            run.check('%s %s 18:30：%s' % (kind, day, '→'.join(('%s：' % (w[0] if isinstance(w[0], str) else '以安') if w[0] else '') + w[1][:18] for w in want)), got == len(want), J({'對到': got, '說了': L_[:12]}))
            for bad in X['never'].get(day, []):
                run.check('%s %s：不再說舊的那一句「%s」' % (kind, day, bad), not any(t == bad for _, t in L_), J(L_[:8]))
        ch = [r['t'] for r in R if r['k'] == 'choose' and r['d'] == '2028-06-26']
        run.check('%s 6/26：小場景的選項照稿 %s' % (kind, '／'.join(X['opts'])), '｜'.join(X['opts']) in ch, J(ch))


# ================================================================ 2. 回家住：出門、晚餐
DINNER549 = {'aa549_1': ('宿舍的床，比家裡的硬嗎？', [('差不多。', '那就好。'), ('硬很多。', '我寄一個床墊過去。……不要跟你爸說，他會說我寵你。')]),
             'aa549_2': ('你們系上有沒有很會煮飯的？', [('沒有。', '那你們都吃什麼。'), ('阿哲很會找店。', '會找店也是一種本事。')]),
             'aa549_3': ('你姊說你上次打給她，講了一個小時。', [('問她工作的事。', '她很高興。她不會說，可是她很高興。'), ('她講比較多。', '她講話像你爸。')]),
             'aa549_4': ('今天的魚是市場那個阿伯的。他問你念什麼。', [('法律。', '他說他有一塊地的事要問你。我說你還沒畢業。'), ('妳怎麼說？', '我說念書的。他說喔。')]),
             'aa549_5': ('你房間的燈管該換了。', [('我明天換。', '好。你爸上次換，換到一半去接電話。'), ('還看得到。', '看得到跟看清楚不一樣。')]),
             'aa549_6': ('你們老師凶嗎？', [('還好。', '還好就好。'), ('有一個會點名問問題。', '那你要坐後面一點。……不對，坐前面。')]),
             'aa549_7': ('暑假有沒有要出去玩？', [('有，跟同學。', '錢夠嗎？不夠跟我說。'), ('還沒想。', '不要整天在家。在家我也會叫你做事。')]),
             'aa549_8': ('你爸昨天視訊，問你瘦了沒有。', [('沒有。', '我也是這樣跟他說。'), ('好像有。', '那今天多吃一碗。')]),
             'aa549_9': ('我們家樓下開了一家新的早餐店。', [('好吃嗎？', '蛋餅很薄。我還是喜歡舊的那家。'), ('明天去吃。', '幫我買一杯豆漿。無糖。')]),
             'aa549_10': ('你小時候說要當警察。', [('現在也差不多。', '差很多。……可是我知道你的意思。'), ('我不記得了。', '你那時候五歲。我記得就好。')]),
             'aa549_11': ('記帳的那家公司，今年要我多做兩家。', [('會很累嗎？', '還好。數字對起來的時候，我很開心。'), ('妳可以教我。', '你先把你自己的帳記好。')]),
             'aa549_12': ('這幾天睡得好嗎？', [('好。', '家裡的床還是比較好吧。'), ('還好。', '那今天早點睡。我不會叫你起床。……大概不會。')])}
HOME_MENU = lambda T: any(t.startswith('睡覺') for t in T) and any(t.startswith(('回宿舍住', '快轉', '存檔')) for t in T)
DINNER_DAYS = """(()=>{ const out=[]; const base=JSON.parse(JSON.stringify(GAME.G)); const a=STORY.dayOfKey('2027-07-01'), b=STORY.dayOfKey('2027-08-24');
  for(let d=a; d<=b; d++){ const g=JSON.parse(JSON.stringify(base)); g.day=d; g.hour=19.05; g.weekday=CALENDAR.dateOf(d).wd%7; const B=HOME.lawBreak(g); if(!B) continue;
    g.home=Object.assign({},g.home||{},{at:true,lbreak:B.key,brk:B.key,ate:{},used:{}}); let x=null; try{ x=HOME.dinnerPick(g); }catch(e){ continue; }
    if(x&&/^aa549_/.test(String(x.n))) out.push({key:CALENDAR.dateOf(d).key, n:x.n}); } return out.slice(0,10); })()"""


async def m_vac_homeout(pg, cdp, run):
    st, d = await state_at(pg, '2027-08-03', 10.0, 'dorm')
    await load(pg, cdp, run, st, '最小存檔 2027-08-03（大二暑假，%s）10:00 宿舍' % d['term'])
    cand = await pg.evaluate(DINNER_DAYS); run.note('晚餐會抽到 AA_549 那十二題的日子（頁面裡讀 HOME.dinnerPick，只讀不改）：%s' % J(cand))
    await play(pg, cdp, run, None, max_s=20, ff=False, tag='homeout_settle')
    n0 = await pl_len(pg)
    has = await go_home(pg, cdp, run, 'homeout_1')
    run.check('暑假人在宿舍：手機「地點」最上面有「回臺北的家」的「回家」', has)
    if not has: return
    menu = await wait_menu(pg, cdp, HOME_MENU, 120); T = [o['t'] for o in (menu or [])]; await run.shot(pg, 'homeout_menu')
    hm = await pg.evaluate("(()=>({at:HOME.at(GAME.G), breakMode:HOME.breakMode(GAME.G), lbreak:(GAME.G.home||{}).lbreak||null}))()")
    run.check('回到家：家裡的選單有「出門」（校門口、公館、溫州街）', any(t.startswith('出門') for t in T), J({'menu': T, 'home': hm}))
    run.note('回家說的：%s' % J(said(await rows(pg, n0))[:6]))
    if not await tap_prefix(pg, cdp, menu, '出門'): return
    sub = await wait_menu(pg, cdp, lambda T: any(t.startswith('公館商圈') for t in T), 30); S_ = [o['t'] for o in (sub or [])]; await run.shot(pg, 'homeout_sub')
    run.check('「出門」→ 校門口、公館商圈、溫州街、不用了', [t.split(' ')[0] for t in S_][:4] == ['校門口', '公館商圈', '溫州街', '不用了'] or all(any(t.startswith(w) for t in S_) for w in ('校門口', '公館商圈', '溫州街', '不用了')), J(S_))
    await tap_prefix(pg, cdp, sub, '不用了')
    menu2 = await wait_menu(pg, cdp, HOME_MENU, 60); T2 = [o['t'] for o in (menu2 or [])]
    z = await pg.evaluate("(()=>({zone:GAME.G.zone, at:HOME.at(GAME.G)}))()")
    run.check('「不用了」＝回到家裡的選單（還在家、沒有出門）', any(t.startswith('出門') for t in T2) and z['at'], J({'menu': T2, **z}))
    n1 = await pl_len(pg)
    await tap_prefix(pg, cdp, menu2, '出門'); sub = await wait_menu(pg, cdp, lambda T: any(t.startswith('公館商圈') for t in T), 30)
    await tap_prefix(pg, cdp, sub, '公館商圈')
    for _ in range(90):
        await pg.wait_for_timeout(1000); s = await P.ts(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if s['phone'] and not s['ch']: await L.phone_away(pg, cdp, tries=1); continue
        if s['zone'] == 'gongguan' and not s['busy'] and not s['ch']: break
    await pg.wait_for_timeout(2500); await run.shot(pg, 'homeout_gongguan')
    g = await pg.evaluate("(()=>({zone:GAME.G.zone, at:HOME.at(GAME.G), breakMode:HOME.breakMode(GAME.G), h:+(+GAME.G.hour).toFixed(2)}))()")
    toasts = [r['t'] for r in await rows(pg, n1, 'toast')]; cards = [[r['n'], r['t']] for r in await rows(pg, n1, 'card')]
    run.check('「出門」→「公館商圈」：進 3D 公館、人不在家、放假模式照舊（晚上回家睡）', g['zone'] == 'gongguan' and g['at'] is False and g['breakMode'] is True, J({**g, 'cards': cards}))
    run.check('出門以後提示「要回家：手機「地點」→ 回臺北的家（或走到校門口）。」', '要回家：手機「地點」→ 回臺北的家（或走到校門口）。' in toasts, J(toasts))
    n2 = await pl_len(pg)
    has2 = await go_home(pg, cdp, run, 'homeout_2')
    menu3 = await wait_menu(pg, cdp, HOME_MENU, 120) if has2 else None; T3 = [o['t'] for o in (menu3 or [])]
    L2 = said(await rows(pg, n2)); g2 = await pg.evaluate("(()=>({zone:GAME.G.zone, at:HOME.at(GAME.G), breakMode:HOME.breakMode(GAME.G)}))()"); await run.shot(pg, 'homeout_back')
    run.check('從公館用手機「地點」→「回家」：回到家（「（臺北的家。…）」）、家裡的選單又出來（有「出門」）',
              has2 and g2['at'] is True and any(t.startswith('（臺北的家。') for _, t in L2) and any(t.startswith('出門') for t in T3), J({'home': g2, 'said': L2[:4], 'menu': T3}))
    # ---- 晚餐 ----
    dkey = (cand[0]['key'] if cand else '2027-08-03')
    st2, d2 = await state_at(pg, dkey, 18.33, 'dorm')
    await load(pg, cdp, run, st2, '晚餐：最小存檔 %s 18:20 宿舍（那一天晚餐會抽到 AA_549 的題目：%s）' % (dkey, J(cand[:1])))
    await play(pg, cdp, run, None, max_s=15, ff=False, tag='dinner_settle')
    if not await go_home(pg, cdp, run, 'dinner'): run.check('晚餐：手機「回家」', False); return
    menu = await wait_menu(pg, cdp, lambda T: any(t.startswith('吃晚餐') for t in T) or HOME_MENU(T), 120); T = [o['t'] for o in (menu or [])]
    exp = await pg.evaluate("(()=>{ try{ const d=HOME.dinnerPick(GAME.G); return d?{n:d.n, mom:HOME.momOf?HOME.momOf(GAME.G,d):d.mom, opts:d.opts.map(o=>o.t)}:null; }catch(e){ return 'ERR '+e.message; } })()")
    run.note('到家 %s：選單 %s；這一餐（HOME.dinnerPick，只讀）%s' % (J(await P.clock(pg)), J(T), J(exp)))
    run.check('晚餐：18:30～20:00 在家的選單有「吃晚餐」', any(t.startswith('吃晚餐') for t in T), J(T))
    if not any(t.startswith('吃晚餐') for t in T): return
    n3 = await pl_len(pg); await tap_prefix(pg, cdp, menu, '吃晚餐')
    o2 = await wait_menu(pg, cdp, lambda T: len(T) == 2 and all(t.startswith('「') for t in T), 60); await run.shot(pg, 'dinner_choice')
    await P.tap_choice(pg, cdp, 1); await pg.wait_for_timeout(1200)
    await play(pg, cdp, run, None, max_s=25, ff=False, tag='dinner_after')
    L3 = said(await rows(pg, n3)); await run.shot(pg, 'dinner_after')
    mom = [t for n, t in L3 if n == '媽媽']
    run.note('晚餐說的：%s' % J(L3[:8]))
    if isinstance(exp, dict) and exp['n'] in DINNER549:
        q, opts = DINNER549[exp['n']]
        run.check('晚餐（%s）：媽媽「%s」→ 選項「%s」「%s」→ 選第二個 → 媽媽「%s」（沒有共用的收尾）' % (exp['n'], q, opts[0][0], opts[1][0], opts[1][1]),
                  q in mom and [o['t'] for o in (o2 or [])] == ['「%s」' % opts[0][0], '「%s」' % opts[1][0]] and opts[1][1] in mom and len(mom) == 2, J({'mom': mom, 'opts': [o['t'] for o in (o2 or [])]}))
    else:
        run.check('晚餐有一題問答（媽媽問、兩個選項、媽媽回）；這一天沒有抽到 AA_549 的十二題（只看流程）', len(mom) >= 2 and bool(o2) and len(o2) == 2, J({'exp': exp, 'mom': mom}))


# ================================================================ 3. 大一寒假 C04W
C04_K0 = [(None, '（發講義的助教抬起頭，是 Kevin。）'), ('@kv', '欸，學弟？你也來這裡補？'), ('@kv', '坐前面，後面聽不清楚。講義多給你一份，上一期的。'), ('@kv', '寒假班的助教。時薪還可以，順便練聽力。')]
C04_K1 = [(None, '第一次模擬考。聽力的速度比你想的快很多。'), ('@kv', '聽力不要一邊聽一邊翻成中文。來不及的。')]
VACROWS = "(()=>[...document.querySelectorAll('#phoneBody .item.phrow')].map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,160), vac:(e.querySelector('[data-vac]')||{dataset:{}}).dataset.vac||null})))()"


async def m_vac_y1winter(pg, cdp, run):
    w12 = await P.day_of(pg, ['Y1S1', 12, 1]); w6 = await P.day_of(pg, ['Y1S1', 6, 1])
    st, d = await state_at(pg, w12['key'], 12.2, 'dorm')
    await load(pg, cdp, run, st, '最小存檔 %s（大一上第 12 週週一）12:12 宿舍' % w12['key'])
    await play(pg, cdp, run, None, max_s=15, ff=False, tag='c04_settle')
    await P.phone_tab(pg, cdp, 'events'); R0 = await pg.evaluate(VACROWS); await run.shot(pg, 'c04_events')
    row = next((r for r in R0 if r['vac'] == 'C04W@Y1'), None)
    run.check('手機「活動」假期行事曆：「托福補習（寒假班）」1/5～1/16（每週一、三）、有「報名」', bool(row) and '托福補習（寒假班）' in row['t'] and '1/5' in row['t'] and '1/16' in row['t'], J(R0))
    run.check('手機「活動」：沒有 C18W@Y1（寒假團大一照舊不開）', not any((r['vac'] or '').startswith('C18W@Y1') for r in R0), J(R0))
    if not row: await L.close_panels(pg, cdp); return
    n0 = await pl_len(pg); await L.tap(pg, cdp, '#phoneBody [data-vac="C04W@Y1"]'); await pg.wait_for_timeout(1800); await run.shot(pg, 'c04_signed')
    await L.close_panels(pg, cdp)
    reg = await pg.evaluate("""(()=>{ const G=GAME.G, q=[0,1,2,3].map(i=>OUT.get(G,'vac_C04W@Y1_'+i)); return {state:VAC.state(G,'C04W@Y1'), keys:q.map(x=>x?CALENDAR.dateOf(x.day).key:null), h:q.map(x=>x?x.h:null), title:q.map(x=>x?x.title:null)}; })()""")
    toasts = [r['t'] for r in await rows(pg, n0, 'toast')]
    run.check('按「報名」＝報名了（提示「報名了：已經排進行事曆」）、排四個關鍵日 1/5、1/7、1/12、1/16', reg['state'] == 'yes' and reg['keys'] == ['2026-01-05', '2026-01-07', '2026-01-12', '2026-01-16'] and any('報名了' in t for t in toasts), J({**reg, 'toast': toasts}))
    s_sign = await snap(pg)
    # ---- C18W 公告（大一不開）----
    st6, _ = await state_at(pg, w6['key'], 11.83, 'dorm')
    await load(pg, cdp, run, st6, '最小存檔 %s（大一上第 6 週週一）11:50 宿舍' % w6['key'], js="PHONE.join(G,'law_class','法律系一年級'); return PHONE.inGroup(G,'law_class');")
    await play(pg, cdp, run, "GAME.G.hour>=12.17", max_s=420, ff=False, tag='c18w_wait')
    m18 = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&((m.tag||'').indexOf('C18W')>=0||(m.ask&&/C18W/.test(m.ask.id||'')))).map(m=>[m.tag,m.text]))()")
    run.check('大一上第 6 週週一 12:00 以後：全班群組沒有寒假團（C18W）的公告、報名選項', not m18, J({'msgs': m18, 'now': await P.clock(pg)}))
    # ---- 1/5 第一堂 ----
    q0 = await pg.evaluate("(s=>{ const q=(s.outings||[]).find(x=>x.id==='vac_C04W@Y1_0'); return q?{day:q.day,h:q.h,travelH:q.travelH||0}:null; })", s_sign)
    ws = (q0['h'] - (q0['travelH'] or 0.5) - 0.25) if q0 else 18.2
    await jump(pg, cdp, run, s_sign, '2026-01-05', round(ws - 0.08, 2), zone='dorm', pos=None, note='報名以後的進度；第一堂出發提示前 5 分鐘')
    kv = await names_of(pg, 'kevin', ('Kevin',))
    n1 = await pl_len(pg)
    await play(pg, cdp, run, "(()=>{ const q=OUT.get(GAME.G,'vac_C04W@Y1_0'); return !!q&&q.state!=='planned'; })()", max_s=900, picks=['出發：', '「學長在這裡打工？」'], ff=False, tag='c04_k0', shots_at=['是 Kevin', '欸，學弟？'])
    R1 = await rows(pg, n1); L1 = said(R1); W = [(kv if n == '@kv' else n, t) for n, t in C04_K0]
    ch = [r['t'] for r in R1 if r['k'] == 'choose']
    run.check('1/5 出發提示「出發：…」按了 → 第一堂：Kevin 三句、選項「學長在這裡打工？」「謝謝學長。」→「寒假班的助教。時薪還可以，順便練聽力。」',
              seq_in(L1, W) == len(W) and '「學長在這裡打工？」｜「謝謝學長。」' in ch, J({'說了': L1[:10], '選項': ch, '出發': [c for c in ch if '出發' in c]}))
    run.check('第一堂演完：KEVIN_TA_MET', await pg.evaluate("!!GAME.G.flags.KEVIN_TA_MET"))
    # ---- 1/7 模擬考（床快轉）----
    n2 = await pl_len(pg)
    await play(pg, cdp, run, "(()=>{ const q=OUT.get(GAME.G,'vac_C04W@Y1_1'); return !!q&&q.state!=='planned'; })()", max_s=1500, picks=['出發：'], ff=True, tag='c04_k1', shots_at=['第一次模擬考'])
    L2 = said(await rows(pg, n2)); W2 = [(kv if n == '@kv' else n, t) for n, t in C04_K1]
    run.check('床「快轉」→ 1/7 出發 → 模擬考：「第一次模擬考。…」、Kevin「聽力不要一邊聽一邊翻成中文。來不及的。」', seq_in(L2, W2) == len(W2), J(L2[:8]))
    kd = await pg.evaluate("(()=>{ try{ return VAC.kevinDoor(Object.assign({},GAME.G,{day:STORY.dayOfKey('2026-01-12'),hour:18.1})); }catch(e){ return 'ERR '+e.message; } })()")
    run.check('（讀狀態）報了大一寒假班：1/12 公館補習班門口 Kevin 不招呼（VAC.kevinDoor＝null）', kd is None, J(kd))


# ================================================================ 4. 女主角假期版邀約（以安暑假）
AN_LINE, AN_FIRST = '暑假總圖開到九點。明天下午，我在三樓。', '暑假的總圖，冷氣比較冷。你有帶外套嗎？'


async def m_vac_heroine(pg, cdp, run):
    st, d = await state_at(pg, '2026-07-14', 9.0, 'dorm')
    await load(pg, cdp, run, st, '最小存檔 2026-07-14（大一暑假）09:00 宿舍', js="NOKX(); return LV('heroine_01',45,30,10,{npcRom:0,rom:0});")
    an = await names_of(pg, 'heroine_01')
    n0 = await pl_len(pg); seen = {}

    async def on_phone():
        iv = await pg.evaluate("(()=>{ const iv=(GAME.G.invites||[]).find(x=>x.who==='heroine_01'&&x.by==='npc'&&x.state==='offered'); return iv?{id:iv.id,day:CALENDAR.dateOf(iv.day).key,h:iv.h,place:iv.place,hask:iv.hask||null}:null; })()")
        if not iv or iv['id'] in seen: return False
        seen[iv['id']] = iv
        t = await P.phone_thread(pg, cdp, 'p:heroine_01', open_folds=False); await run.shot(pg, 'heroine_msg')
        seen[iv['id']]['thread'] = t['text'][-300:]
        sel = '#phoneBody [data-ans="%s|yes"]' % iv['id']
        seen[iv['id']]['btn'] = await pg.evaluate("s=>!!document.querySelector(s)", sel)
        if seen[iv['id']]['btn']: await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500); await run.shot(pg, 'heroine_yes')
        await L.close_panels(pg, cdp); return True
    until = "(()=>{ const G=GAME.G; if(CALENDAR.dateOf(G.day).key>'2026-07-25') return true; return (G.invites||[]).some(iv=>iv.who==='heroine_01'&&iv.hask&&iv.state==='done'); })()"
    ok = await play(pg, cdp, run, until, max_s=int(os.environ.get('HEROINE_MAX', '2400')), picks=['直接過去：'], ff=True, on_phone=on_phone, tag='heroine', shots_at=[AN_FIRST])
    R = await rows(pg, n0)
    rec = await pg.evaluate("(()=>{ const R=HASK.rec(GAME.G); return R.sent.filter(x=>x.id==='heroine_01').map(x=>({sid:x.sid,vs:x.vs||null,place:x.place,state:x.state,ans:x.ans||null,day:CALENDAR.dateOf(x.day).key,h:x.h,send:x.send&&[CALENDAR.dateOf(x.send.day).key,x.send.h],firstSaid:!!x.firstSaid,iv:x.iv||null})); })()")
    ivs = await pg.evaluate("(()=>(GAME.G.invites||[]).filter(x=>x.who==='heroine_01').map(x=>({id:x.id,state:x.state,day:CALENDAR.dateOf(x.day).key,h:x.h,place:x.place,hask:x.hask||null})))()")
    msg = await pg.evaluate("(t=>(GAME.G.msgs||[]).filter(m=>m&&m.th==='p:heroine_01'&&m.text===t).map(m=>[CALENDAR.dateOf(m.day).key,m.h]))", AN_LINE)
    run.note('HASK 傳的：%s；邀約：%s；她的訊息：%s；手機上看到：%s' % (J(rec), J(ivs), J(msg), J(seen)))
    run.check('她傳「%s」（手機收到；HASK sent 記 vs summer、地點總圖）' % AN_LINE, bool(msg) and any(r['vs'] == 'summer' and r['place'] == 'library' for r in rec), J({'msg': msg, 'rec': rec}))
    run.check('在她的對話按「答應」（手機上有答應／改天／不了）', any(v.get('btn') for v in seen.values()), J(seen))
    gos = [r['t'] for r in R if r['k'] == 'choose' and '直接過去：' in r['t']]
    run.check('隔天見面前跳「直接過去：和%s約在總圖…」' % '／'.join(sorted(an)), bool(gos), J(gos))
    her = [[r['n'], r['t'], r['d'], r['h']] for r in R if r['k'] == 'say' and r['n'] in an]
    first = next((x for x in her if x[2] >= '2026-07-15' and x[3] >= 14.5), None)
    run.check('見面：她說的第一句＝「%s」；邀約 done' % AN_FIRST, ok and bool(first) and first[1] == AN_FIRST and any(v['state'] == 'done' and v['hask'] for v in ivs), J({'first': first, 'her': her[:6], 'ivs': ivs}))
    await run.shot(pg, 'heroine_end')


# ================================================================ 5. 芷若大一暑假五處＋AA_551
QIXI_TC, QIXI_TP = '我在家裡的廚房試做了一杯特調。很甜。……想給你喝。', '七夕我們店有一款特調。很甜。我不喝，可是想做給你。'
BATH_TC, BATH_TP = '剛洗完澡。台中的晚上比臺北安靜。', '剛洗完澡。下班回來都這個時間。'
KEEPN_NEW, KEEPN_OLD, KEEP = '（她做了一杯熱可可，加了一份濃縮，推到你面前。杯子上用麥克筆寫著：「熱可可＋濃縮」。下面一行小字：「不用還了。」）', '（她做了一杯熱可可，加了一份濃縮，推到你面前。）', '……那這杯，也是你的。'
AG = {'n0': '（她在吧檯後面。看到你，停了一下。）', 'ask': '票根，還在嗎？', 'take': '寄放的，要拿回來了。……還是，你要一直收著？'}
REUNION = ['（她把最後一張椅子倒扣在桌上。）', '回來了。', '……第一杯，我還是做給你。坐。']
ZR6 = "NOKX(); return LV('heroine_02',65,50,45,{npcRom:60,rom:35});"
CAFE_OUT = {'x': 51.8, 'z': 0.6, 'yaw': 1.5708, 'lv': 0}   # 溫州街 Café 門口（互動點 54.2, 0）往西 2.4 m（zrlast_probe）
QUEUED = """(id=>{ const G=GAME.G, th='p:'+id, out=[]; for(const q of (PHONE.rec(G).q||[])) for(const m of (q.items||[])) if(m.th===th&&m.from===id) out.push({text:m.text,day:CALENDAR.dateOf(q.day).key,h:q.h,queued:true});
  for(const m of (G.msgs||[])) if(m&&m.th===th&&m.from===id) out.push({text:m.text,day:CALENDAR.dateOf(m.day).key,h:m.h,queued:false}); return out; })"""


async def open_invite(pg, cdp, who):
    await P.phone_tab(pg, cdp, 'friends')
    sel = '#phoneBody [data-inv="%s"]' % who
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel): return None
    await L.tap(pg, cdp, sel)
    for _ in range(25):
        await pg.wait_for_timeout(800); s = await P.ts(pg)
        if s['ch']: return s['ch']
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
    return None


async def menu_to(pg, cdp, ch, targets, via, max_depth=3):
    """選單往下找：有 targets 開頭的就選；沒有就選 via 開頭的那一類（照順序）再看下一層。回傳選到的那一項（文字）"""
    for _ in range(max_depth):
        T = [o['t'] for o in (ch or [])]
        hit = next((t for t in T for w in targets if t.startswith(w)), None)
        if hit: await tap_prefix(pg, cdp, ch, hit); return hit
        v = next((t for w in via for t in T if t.startswith(w)), None)
        if not v: return None
        await tap_prefix(pg, cdp, ch, v)
        ch = await wait_menu(pg, cdp, lambda T: True, 20)
    return None


async def zr_qixi(pg, cdp, run, zr):
    st, d = await state_at(pg, '2026-08-18', 10.0, 'dorm')
    await load(pg, cdp, run, st, '七夕：最小存檔 2026-08-18 10:00 宿舍（芷若 7/1～8/25 在台中）；芷若第 6 階', js=ZR6)
    await play(pg, cdp, run, None, max_s=15, ff=False, tag='qixi_settle')
    ch = await open_invite(pg, cdp, 'heroine_02'); await run.shot(pg, 'qixi_menu')
    run.note('約芷若的第一層：%s' % J([o['t'] for o in (ch or [])]))
    got = await menu_to(pg, cdp, ch, ['約她過節'], ['這個時候才有'])
    sub = await wait_menu(pg, cdp, lambda T: any('台中' in t for t in T), 25); Ts = [o['t'] for o in (sub or [])]; await run.shot(pg, 'qixi_opts')
    run.check('手機約芷若：「約她過節：七夕」→ 有「開車去台中找她（一整天）」', bool(got) and any(t.startswith('開車去台中找她（一整天）') for t in Ts), J({'got': got, 'opts': Ts}))
    n0 = await pl_len(pg)
    if sub: await tap_prefix(pg, cdp, sub, '開車去台中找她')
    await play(pg, cdp, run, None, max_s=30, ff=False, tag='qixi_book')
    q = await pg.evaluate("(()=>{ const q=OUT.rec(GAME.G).find(x=>x.fest||/七夕/.test(x.title||'')); return q?{id:q.id,day:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title}:null; })()")
    run.check('約好 8/19 開車去台中（排一筆出遊）', bool(q) and q['day'] == '2026-08-19', J({'q': q, 'said': said(await rows(pg, n0))[-4:]}))
    if not q: return
    until = "(()=>{ const q=OUT.get(GAME.G,%s); return !q||q.state!=='planned'||CALENDAR.dateOf(GAME.G.day).key>'2026-08-19'; })()" % J(q['id'])
    await play(pg, cdp, run, until, max_s=1500, picks=['出發：'], ff=True, tag='qixi', shots_at=[QIXI_TC[:10], QIXI_TP[:10]])
    R = [r for r in await rows(pg, n0) if r.get('d') == '2026-08-19']
    her = [[r['n'], r['t']] for r in R if r['k'] == 'say' and r['n'] in zr]; bgs = [r['t'] for r in R if r['k'] == 'bg']
    run.check('8/19 到台中：背景 tc_cafe、她說「%s」、沒有「%s」' % (QIXI_TC, QIXI_TP), any(t == QIXI_TC for _, t in her) and not any(t == QIXI_TP for _, t in her) and any('tc_cafe' in b for b in bgs), J({'her': her[:6], 'bg': bgs}))


async def zr_bath(pg, cdp, run, zr):
    st, d = await state_at(pg, '2026-08-01', 23.25, 'dorm')
    await load(pg, cdp, run, st, '回覆池：最小存檔 2026-08-01 23:15 宿舍；芷若朋友（熟 45／信任 30）', js="NOKX(); return LV('heroine_02',45,30,0);")
    s0 = await snap(pg); found = None; log = []
    for i in range(int(os.environ.get('ZR_BATH_DAYS', '10'))):
        key = await pg.evaluate("(([k,i])=>CALENDAR.dateOf(STORY.dayOfKey(k)+i).key)", ['2026-08-01', i])
        if i: await jump(pg, cdp, run, await snap(pg), key, 23.25, zone='dorm', pos=None, note='第 %d 天，23:15 傳訊息' % (i + 1))
        n_before = await pg.evaluate("(GAME.G.msgs||[]).length")
        r = await send_chat(pg, cdp, run, 'heroine_02', 'chat')
        rep = [x for x in await pg.evaluate(QUEUED, 'heroine_02') if x['day'] >= key]
        log.append({'day': key, 'send': r.get('topic') or r, 'reply': rep[-2:]})
        b = next((x for x in rep if '洗完澡' in x['text']), None)
        if b: found = (key, b); break
    run.note('每天 23:1x 傳「聊天」，她回的（排隊中＋收到的）：%s' % J(log)[:2500])
    run.check('2026-08-01 起每天傳：抽到「洗完澡」那一則＝「%s」（不是「%s」）' % (BATH_TC, BATH_TP), bool(found) and found[1]['text'] == BATH_TC, J(found))
    if found and found[1]['queued']:   # 等它真的送到：照玩家站著等（或睡到那個時間）
        await play(pg, cdp, run, "(t=>(GAME.G.msgs||[]).some(m=>m&&m.th==='p:heroine_02'&&m.text===t))(%s)" % J(found[1]['text']), max_s=600, ff=False, tag='bath_wait')
    if found:
        t = await P.phone_thread(pg, cdp, 'p:heroine_02', open_folds=False); await run.shot(pg, 'bath_thread'); await L.close_panels(pg, cdp)
        run.check('送到手機、對話裡看得到「%s」' % BATH_TC, BATH_TC in (t['text'] or ''), (t['text'] or '')[-200:])
    await jump(pg, cdp, run, s0, '2026-08-26', 23.25, zone='dorm', pos=None, note='對照：8/26（她回臺北那天、不上班）23:15 傳訊息')
    r = await send_chat(pg, cdp, run, 'heroine_02', 'chat')
    rep = [x for x in await pg.evaluate(QUEUED, 'heroine_02') if x['day'] >= '2026-08-26']
    run.check('8/26 23:1x 傳「聊天」：她回的沒有「下班」「客人」（STORY.zrNoShift 8/26）、不是「%s」' % BATH_TP, bool(rep) and not any(('下班' in x['text'] or '客人' in x['text']) for x in rep), J({'send': r, 'reply': rep}))


async def zr_shift(pg, cdp, run, zr):
    for key, want in (('2026-08-26', False), ('2026-08-27', True)):
        st, d = await state_at(pg, key, 19.67, 'cafe')
        await load(pg, cdp, run, st, '%s 19:40 兩點半 Café（出生點）' % key, quiet=True)
        await pg.wait_for_timeout(8000); w = await P.who(pg, 'heroine_02')
        se = await pg.evaluate("(()=>{ const e=STORY.schedEnt(CHARACTERS.heroine_02,GAME.G); return e?{zone:e.zone,act:e.act||null}:null; })()")
        await run.shot(pg, 'shift_%s' % key)
        on = bool(w) and not w['hidden'] and bool(se) and se['zone'] == 'cafe' and se['act'] == 'barista'
        run.check('%s 19:40 Café：芷若%s（作息 %s；3D %s）' % (key, '在吧檯上班' if want else '不上班（8/26 從台中回來那天）', J(se), J(w and {k: w[k] for k in ('x', 'z', 'hidden', 'pose')})), on == want, J({'sched': se, 'who': w}))


async def zr_reunion(pg, cdp, run, zr):
    js = "NOKX(); const r=LV('heroine_02',65,50,45,{npcRom:60,rom:35}); F.dating_heroine_02=true; try{ ROM.get(G,'heroine_02').status='dating'; }catch(e){} VAC.rec(G).reg['C08@Y1']='done'; return {r, reg:VAC.rec(G).reg};"
    for key, want in (('2026-08-25', False), ('2026-08-26', True)):
        st, d = await state_at(pg, key, 20.67, 'dorm')
        await load(pg, cdp, run, st, '重逢：最小存檔 %s 20:40 宿舍；和芷若交往中、首爾交流（C08@Y1 7/13～7/24）參加完' % key, js=js)
        await play(pg, cdp, run, "GAME.G.hour>=21.25", max_s=420, ff=False, tag='reunion_%s' % key)
        th = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&m.th==='p:heroine_02').map(m=>[CALENDAR.dateOf(m.day).key,m.h,m.text]))()")
        q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'vac_C08@Y1_re_heroine_02'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,state:q.state}:null; })()")
        txt = [x[2] for x in th]
        if not want:
            run.check('8/25 21:00：她還在台中＝不約（沒有「明天我十點下班。」、沒有排重逢）', '明天我十點下班。' not in txt and not q, J({'thread': th[-4:], 'q': q}))
            continue
        await P.phone_thread(pg, cdp, 'p:heroine_02', open_folds=False); await run.shot(pg, 'reunion_invite'); await L.close_panels(pg, cdp)
        run.check('8/26 21:00：「明天我十點下班。」「……你來的話，我晚一點關燈。」→ 排 8/27 22:00 兩點半 Café', '明天我十點下班。' in txt and '……你來的話，我晚一點關燈。' in txt and bool(q) and q['day'] == '2026-08-27' and q['h'] == 22 and q['place'] == '兩點半 Café', J({'thread': th[-5:], 'q': q}))
        if not q: return
        n0 = await pl_len(pg)
        await play(pg, cdp, run, "(()=>{ const q=OUT.get(GAME.G,'vac_C08@Y1_re_heroine_02'); return !q||q.state!=='planned'||CALENDAR.dateOf(GAME.G.day).key>'2026-08-27'; })()", max_s=1500, picks=['出發：'], ff=True, tag='reunion', shots_at=['倒扣在桌上'])
        L_ = said([r for r in await rows(pg, n0) if r.get('d') == '2026-08-27'])
        run.check('8/27 22:00 重逢：' + '→'.join(REUNION), seq_in(L_, [(None, REUNION[0]), (zr, REUNION[1]), (zr, REUNION[2])]) == 3, J(L_[:8]))


async def zr_cup(pg, cdp, run, zr):
    st, d = await postgrad_state(pg, '2029-09-01', 15.0, 'wenzhou', CAFE_OUT, {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'ZR_LAST': 'keep', 'ZR_LAST_GO': True})
    js = ("NOKX(); LV('heroine_02',45,30,0); SOCIAL.rel('heroine_02').npcRom=40; const Lg=DATE.log(G,'heroine_02'); Lg.count=4; Lg.wish=true;"
          " try{ TERMEND.rec(G).think.heroine_02='Y3S2'; }catch(e){} SOCIAL.remember('heroine_02','ZR_LAST_SCREENING',''); return {zr:F.ZR_LAST, again:(typeof ZRLAST!=='undefined'&&ZRLAST.againDue)?ZRLAST.againDue(G):null};")
    await load(pg, cdp, run, st, 'AA_551：畢業後最小存檔 2029-09-01（六）15:00 溫州街 Café 門口（zrlast ZL_AGAIN_KEEP）；ZR_LAST keep', js=js)
    it = await L.find_it(pg, '進入兩點半 Café')
    run.check('Café 門口有「進入兩點半 Café」', bool(it), J(it))
    if not it: return
    n0 = await pl_len(pg)
    await L.go_to(pg, cdp, run, it['x'], it['z'], 0.9, it['label'], max_s=200); await L.tap(pg, cdp, '#interact')
    await play(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_zhiruo_ticket_again", max_s=600, picks=['「我一直收著。」'], ff=False, tag='cup', shots_at=['杯子上用麥克筆', '那這杯，也是你的'])
    L_ = said(await rows(pg, n0)); await run.shot(pg, 'cup_end')
    W = [(None, AG['n0']), (zr, AG['ask']), (zr, AG['take']), (None, KEEPN_NEW), (zr, KEEP)]
    run.check('走進 Café →「票根，還在嗎？」→ 選「我一直收著。」→ 旁白「%s」接她「%s」' % (KEEPN_NEW[:22] + '…', KEEP), seq_in(L_, W) == len(W), J(L_[:14]))
    run.check('舊的旁白（沒有杯子上的字）不再出現', not any(t == KEEPN_OLD for _, t in L_), J(L_[:14]))


async def m_zr_summer(pg, cdp, run):
    zr = await names_of(pg, 'heroine_02')
    for sub in ENV('ZR', 'qixi,bath,shift,reunion,cup'):
        fn = {'qixi': zr_qixi, 'bath': zr_bath, 'shift': zr_shift, 'reunion': zr_reunion, 'cup': zr_cup}.get(sub)
        if not fn: run.check('ZR＝%s 認得' % sub, False); continue
        run.note('---- zr_summer：%s ----' % sub)
        try: await fn(pg, cdp, run, zr)
        except Exception as e: run.check('zr_summer %s：跑完（沒有探針例外）' % sub, False, repr(e)[:400]); traceback.print_exc()
    run.note('沒做（瀏覽器）：大一下期末飯「暑假我回台中，八月二十六號回來。」（要先走到期末飯的條件）、出國期間「我媽在旁邊一直問我在跟誰傳訊息。」（要交往＋整趟首爾交流）——只有 Node 測試')


# ================================================================ 6. 她回老家那幾天的校外約會
D26 = '臺中草悟道與國立臺灣美術館'; ZY_YES = '你要來臺中？……好。我帶你走。'
S6 = "NOKX(); return LV('heroine_02',60,45,40,{npcRom:55,rom:30});"


async def m_date_away(pg, cdp, run):
    st, d = await state_at(pg, '2026-07-05', 10.5, 'dorm', money=30000)
    await load(pg, cdp, run, st, '最小存檔 2026-07-05（日）10:30 宿舍；芷若第 6 階（熟 60／信任 45／自在 40／她的戀愛 55），錢 30,000', js=S6)
    pres = await pg.evaluate("(()=>{ const p=STORY.presence('heroine_02',Object.assign({},GAME.G,{day:STORY.dayOfKey('2026-07-06')})); const e=STORY.schedEnt(CHARACTERS.heroine_02,Object.assign({},GAME.G,{day:STORY.dayOfKey('2026-07-06'),weekday:1,hour:11.5})); return {presence:p, sched0706_1130:e?{zone:e.zone,act:e.act}:null}; })()")
    run.note('7/6（一）她在哪（讀狀態）：%s' % J(pres))
    await play(pg, cdp, run, None, max_s=15, ff=False, tag='away_settle')
    n0 = await pl_len(pg)
    ch = await open_invite(pg, cdp, 'heroine_02'); await run.shot(pg, 'away_menu')
    run.note('約芷若的第一層：%s' % J([o['t'] for o in (ch or [])]))
    got = await menu_to(pg, cdp, ch, [D26], ['出去玩', '去校外', '臺中', '台中', '中部'])
    o = await wait_menu(pg, cdp, lambda T: True, 25)
    if o and not any(x['t'].startswith(('今天', '明天')) for x in o):   # 交通（有兩種以上才出現）
        run.note('交通：%s' % J([x['t'] for x in o])); await tap_prefix(pg, cdp, o, '高鐵') or await P.tap_choice(pg, cdp, 0); o = await wait_menu(pg, cdp, lambda T: True, 25)
    days = [x['t'] for x in (o or [])]
    k = next((i for i, x in enumerate(o or []) if '明天' in x['t']), None)
    run.check('手機約她（她在台中）：「出去玩…」→「%s」→ 有「明天」可以選' % D26, bool(got) and k is not None, J({'got': got, 'days': days}))
    if k is None: await L.close_panels(pg, cdp); return
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200)
    tm = await wait_menu(pg, cdp, lambda T: any(t.startswith('09:00') for t in T), 25); await run.shot(pg, 'away_times')
    T9 = next((x for x in (tm or []) if x['t'].startswith('09:00')), None)
    run.check('7/6（一，她 Café 的班表那天）09:00：沒有灰、小字沒有「她那時候有事／要上班」', bool(T9) and not T9['dim'] and '她那時候' not in T9['t'], J([x for x in (tm or [])][:8]))
    if not T9: await L.close_panels(pg, cdp); return
    await tap_prefix(pg, cdp, tm, '09:00')
    cf = await wait_menu(pg, cdp, lambda T: any(t.startswith('就這樣約') for t in T), 40)
    pre = said(await rows(pg, n0))
    run.check('「預計花費…」那一句出來、選單「就這樣約」', bool(cf) and any('預計花費' in t for _, t in pre), J({'said': pre[-3:], 'menu': [x['t'] for x in (cf or [])]}))
    if cf: await tap_prefix(pg, cdp, cf, '就這樣約')
    await play(pg, cdp, run, None, max_s=40, ff=False, tag='away_after_book')
    R = await rows(pg, n0); L_ = said(R); toasts = [r['t'] for r in R if r['k'] == 'toast']
    th = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&m.th==='p:heroine_02').slice(-3).map(m=>String(m.text||'')))()")
    trips = await pg.evaluate("(()=>(GAME.G.trips||[]).map(t=>({trip:t.trip,who:t.who,locs:t.locs,d:CALENDAR.dateOf(t.day).key,depart:t.depart,status:t.status})))()")
    busy = [t for t in [x[1] for x in L_] + toasts + th if '她那時候' in t or '隔天她' in t]
    run.check('她答應「%s」（不是「她那時候有事」）、排好 7/6 D26' % ZY_YES, (any(t == ZY_YES for _, t in L_) or ZY_YES in th) and not busy and any(t['locs'] == ['D26'] and t['d'] == '2026-07-06' and t['status'] == 'booked' for t in trips), J({'said': L_[-4:], 'thread': th, 'busy': busy, 'trips': trips}))
    tr = next((t for t in trips if t['locs'] == ['D26'] and t['d'] == '2026-07-06'), None)
    if not tr: return
    n1 = await pl_len(pg)
    until = "(id=>{ const t=(GAME.G.trips||[]).find(x=>x.trip===id); return !t||t.status!=='booked'||CALENDAR.dateOf(GAME.G.day).key>'2026-07-06'; })(%s)" % J(tr['trip'])
    await play(pg, cdp, run, until, max_s=1800, picks=['出發：'], ff=True, tag='away_go', shots_first=2)
    R1 = await rows(pg, n1); deps = [r['t'] for r in R1 if r['k'] == 'choose' and '出發：' in r['t']]
    t2 = await pg.evaluate("(id=>{ const t=(GAME.G.trips||[]).find(x=>x.trip===id); return t?{status:t.status}:null; })", tr['trip'])
    zr = await names_of(pg, 'heroine_02'); her = [[r['n'], r['t']] for r in R1 if r['k'] == 'say' and r.get('d') == '2026-07-06' and r['n'] in zr]
    await run.shot(pg, 'away_end')
    run.check('7/6 早上出發提示「出發：…」、按了、那一趟演完（trip 不是 booked；她說了話）', bool(deps) and bool(t2) and t2['status'] in ('done', 'going') and len(her) >= 1, J({'出發': deps[:3], 'trip': t2, 'her': her[:5]}))


# ================================================================ 7. 畫面
B1_CAMS = [('b1_lobby', (18.0, 1.7, 6.0), (18.0, 1.3, -0.5)), ('b1_corridor_w', (10.0, 1.7, 1.4), (-20.0, 1.4, 1.4)), ('b1_pool', (0.0, 1.7, -1.5), (0.0, 0.4, -14.0)), ('b1_fitness', (6.0, 1.7, 2.2), (-14.0, 1.2, 9.0))]
B1_PLATES = """(()=>{ const out=[], F={south:[0,1],north:[0,-1],east:[1,0],west:[-1,0]}, doors=((typeof GYM_LAYOUT!=='undefined'&&GYM_LAYOUT.b1&&GYM_LAYOUT.b1.closedDoors)||[]);
  GAME.E.scene.traverse(o=>{ if(!o.isMesh||!(o.userData&&o.userData.plateText)) return; const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()); const dr=doors.find(q=>q.label===o.userData.plateText);
    const m=o.material; out.push({text:o.userData.plateText, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], face:dr?dr.face:null, dir:dr?F[dr.face]:null, map:!!(m&&m.map), double:!!(m&&m.side===THREE.DoubleSide)}); });
  return out; })()"""


async def vis_gymb1(pg, cdp, run):
    rows_ = []
    for hh, tg in ((14.0, '1400'), (20.5, '2030')):
        st, d = await state_at(pg, '2025-10-15', hh, 'gym_b1')
        await load(pg, cdp, run, st, '體育館 B1：最小存檔 2025-10-15 %s（出生點）' % tg, quiet=True)
        ck = await wait_zone(pg, 'gym_b1', "(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.lightMap) n++; }); return n>0; })()", 60)
        await pg.wait_for_timeout(2500); ck = await pg.evaluate(ZCHK); run.note('%s B1：%s' % (tg, J(ck)))
        run.check('%s 體育館 B1：區域載入、有光照貼圖（lightMap 網格 > 0）' % tg, ck['zone'] == 'gym_b1' and ck['lm'] > 0, J(ck))
        pl = await pg.evaluate(B1_PLATES); run.note('%s B1 門牌：%s' % (tg, J(pl)))
        run.check('%s B1 三塊門牌（男更衣室、女更衣室、壁球室・桌球室）都畫了字、雙面' % tg, sorted(p['text'] for p in pl) == sorted(['男更衣室', '女更衣室', '壁球室・桌球室']) and all(p['map'] and p['double'] for p in pl), J(pl))
        await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
        run.setup('【捷徑】藏起玩家、固定鏡頭（光照、近拍字才用）')
        for key, p, l in B1_CAMS:
            rows_.append(await fixed_shot(pg, run, 'gymb1_%s_%s' % (tg, key), p, l))
        for i, p in enumerate(pl):
            if not p['dir']: continue
            c = p['c']; cam = (c[0] + p['dir'][0] * 2.3, c[1] - 0.05, c[2] + p['dir'][1] * 2.3)
            rows_.append(await fixed_shot(pg, run, 'gymb1_%s_plate%d' % (tg, i), cam, tuple(c)))
        await pg.evaluate(CAMEND)
    run.note('B1 固定鏡頭：%s' % J(rows_)[:2500])
    run.check('體育館 B1 固定鏡頭都放得到、沒有整張純黑（黑 <12 不超過 25%%）（%d 張）' % len(rows_), all(r['placed'] and r['lum'].get('dark', 1) <= 0.25 for r in rows_), J([r for r in rows_ if not (r['placed'] and r['lum'].get('dark', 1) <= 0.25)]))


PBOX = """(()=>{ const E=GAME.E, P=E.player.obj.position, cam=E.camera, W=innerWidth, H=innerHeight; const pr=y=>{ const v=new THREE.Vector3(P.x,P.y+y,P.z).project(cam); return [(v.x*0.5+0.5)*W,(1-(v.y*0.5+0.5))*H,v.z]; };
  const t=pr(1.75), b=pr(0.02), h=Math.abs(b[1]-t[1]), cx=(t[0]+b[0])/2;
  return {box:[cx-h*0.25,Math.min(t[1],b[1]),cx+h*0.25,Math.max(t[1],b[1])], p:[+P.x.toFixed(2),+P.z.toFixed(2)], cam:[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)],
    camToBell:+Math.hypot(cam.position.x+38,cam.position.z-16.5).toFixed(2), camD:+Math.hypot(cam.position.x-P.x,cam.position.z-P.z).toFixed(2), uSeeR:E.seeThrough?+E.seeThrough.uSeeR.value.toFixed(1):null, mode:E.cam.mode, yaw:+E.cam.yaw.toFixed(2)}; })()"""
BELLMAT = """(()=>{ let n=0, st=0, patched=0; GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&/^seethru_bell/.test(m.name||'')){ n++; if(m.userData&&m.userData.seeThrough) st++; if(m.userData&&m.userData._st) patched++; } } }); return {n,st,patched}; })()"""


async def vis_bell(pg, cdp, run):
    for x, tag, want in ((-36.7, 'east13', True), (-39.3, 'west13', True), (-38.0, 'center', None)):
        st, d = await state_at(pg, '2025-10-15', 14.0, 'campus', pos={'x': x, 'z': 21.3, 'yaw': 0, 'lv': 0, 'y': 0})
        await load(pg, cdp, run, st, '傅鐘：最小存檔 2025-10-15 14:00 校園 (%.1f, 21.3) 面向北（行政大樓）' % x, quiet=True)
        mat = None
        for _ in range(60):
            mat = await pg.evaluate(BELLMAT)
            if mat['n']: break
            await pg.wait_for_timeout(1000)
        ok = await L.go_to(pg, cdp, run, x, 23.5, 0.35, '行政大樓門廊 (%.1f, 23.5)' % x, max_s=150)
        await pg.wait_for_timeout(4000)
        info = await pg.evaluate(PBOX); a = await run.shot(pg, 'bell_%s_A' % tag)
        await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.wait_for_timeout(900); b = await run.shot(pg, 'bell_%s_B_noplayer' % tag)
        await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()"); await pg.wait_for_timeout(900); c = await run.shot(pg, 'bell_%s_C' % tag)
        vis = diff_frac(a, b, info['box']); noise = diff_frac(a, c, info['box']); lum = lum_stats(a)
        run.note('傅鐘 %s：走到了 %s；%s；人看得到（藏人前後差）%s、雜訊 %s；亮度 %s；材質 %s' % (tag, ok, J(info), vis, noise, J(lum), J(mat)))
        if want is None: continue
        run.check('傅鐘 %s：seethru_bell_stone 在、標了樹幹透視（patchSeeThrough）' % tag, bool(mat) and mat['n'] > 0 and mat['st'] == mat['n'] and mat['patched'] == mat['n'], J(mat))
        run.check('傅鐘 %s：走到 (%.1f, 23.5)、自然的跟隨鏡頭落在鐘亭附近（離 (−38,16.5) < 3.5 m）、透視有開（uSeeR > 0）' % (tag, x), ok and info['mode'] == 'follow' and info['camToBell'] < 3.5 and (info['uSeeR'] or 0) > 0, J(info))
        run.check('傅鐘 %s：人看得到（藏人前後不一樣的比例扣掉雜訊 ≥ 0.12；改前 0%%）、整張沒有純黑' % tag, vis is not None and noise is not None and vis - noise >= 0.12 and lum.get('dark', 1) <= 0.25, J({'vis': vis, 'noise': noise, 'lum': lum}))


LAMP_FIND = """(re=>{ const R=new RegExp(re,'i'), out=[]; GAME.E.scene.traverse(o=>{ if(!o.isMesh||!R.test(o.name||'')) return; const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3());
  out.push({name:o.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], s:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}); }); return out.slice(0,8); })"""
PPOS = "(()=>{ const p=GAME.E.player.obj.position; return [+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)]; })()"
STAND = "(([x,z])=>!GAME.E.canStand||GAME.E.canStand(x,z,0.3,0))"


async def vis_lamp(pg, cdp, run):
    res = []
    for zone, nm, rx in (('l118_cafe2', '慢讀咖啡', 'lampshade|^l118_cafe2_metal$'), ('l118_pasta', 'Pasta 118', 'lampshade'), ('wenzhou', '溫州街店內', '^wz_in_shop$')):
        for hh, tg in ((20.5, '2030'), (14.0, '1400')):
            st, d = await state_at(pg, '2025-10-15', hh, zone)
            await load(pg, cdp, run, st, '吊燈：最小存檔 2025-10-15 %s %s（出生點）' % (tg, nm), quiet=True)
            await pg.wait_for_timeout(8000); ck = await pg.evaluate(ZCHK); lamps = await pg.evaluate(LAMP_FIND, rx); pp = await pg.evaluate(PPOS)
            run.note('%s %s：%s；燈罩網格 %s；玩家 %s' % (tg, nm, J(ck), J(lamps), J(pp)))
            if ck['zone'] != zone: run.check('%s %s：讀檔進得去（%s）' % (tg, nm, zone), False, J(ck)); continue
            await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
            if zone == 'wenzhou' and lamps:
                c = lamps[0]['c']; cam = None
                for dz in (4.5, -4.5, 6.0, -6.0):
                    if await pg.evaluate(STAND, [c[0], c[2] + dz]): cam = (c[0], 1.6, c[2] + dz); break
                cam = cam or (c[0], 1.6, c[2] + 4.5); r = await fixed_shot(pg, run, 'lamp_%s_%s' % (zone, tg), cam, (c[0], max(1.6, c[1]), c[2]))
            else:
                look = tuple(lamps[0]['c']) if lamps else (pp[0], pp[1] + 2.6, pp[2] - 3.0)
                r = await fixed_shot(pg, run, 'lamp_%s_%s' % (zone, tg), (pp[0], pp[1] + 1.55, pp[2]), look)
            await pg.evaluate(CAMEND); r['zone'] = zone; r['lamps'] = len(lamps); res.append(r)
    run.note('吊燈固定鏡頭：%s' % J(res))
    run.check('吊燈：三處白天、晚上都拍到、找得到燈罩網格、鏡頭放得到、沒有整張純黑（%d 張）' % len(res), len(res) == 6 and all(r['placed'] and r['lamps'] > 0 and r['lum'].get('dark', 1) <= 0.25 for r in res), J([r for r in res if not (r['placed'] and r['lamps'] > 0 and r['lum'].get('dark', 1) <= 0.25)]))


async def vis_us(pg, cdp, run):
    da = (await P.day_of(pg, '2028-08-02'))['d']; dp = (await P.day_of(pg, '2028-06-08'))['d']
    USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': da, 'Y4_PATH': 'bar', 'Y4_PATH_DAY': dp, 'USL_JETLAG': True}
    res = []
    for zone, nm in (('us_apartment', '美國公寓'), ('us_lawlib', '美國法學院圖書館'), ('us_asian_market', '亞洲超市')):
        for hh, tg in ((14.0, '1400'), (20.5, '2030')):
            st, d = await state_at(pg, '2028-09-20', hh, zone, flags=USF)
            await load(pg, cdp, run, st, '美國室內：最小存檔 2028-09-20（美國路線、已抵達）%s %s（出生點）' % (tg, nm), quiet=True)
            ck = await wait_zone(pg, zone, "(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.lightMap) n++; }); return n>0; })()", 60)
            run.note('%s %s：%s' % (tg, nm, J(ck)))
            run.check('%s %s：區域載入、有光照貼圖（lightMap 網格 > 0）' % (tg, nm), ck['zone'] == zone and ck['lm'] > 0, J(ck))
            if ck['zone'] != zone: continue
            pp = await pg.evaluate(PPOS); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
            for k, a in enumerate((0, PI / 2, PI, -PI / 2)):
                p = (pp[0], pp[1] + 1.6, pp[2]); l = (pp[0] + 4 * math.sin(a), pp[1] + 1.3, pp[2] + 4 * math.cos(a))
                r = await fixed_shot(pg, run, 'us_%s_%s_y%d' % (zone, tg, k), p, l); r['zone'] = zone; res.append(r)
            await pg.evaluate(CAMEND)
    run.note('美國室內固定鏡頭：%s' % J(res)[:3000])
    run.check('美國三間室內：每張鏡頭放得到、沒有整張純黑（%d 張）' % len(res), bool(res) and all(r['placed'] and r['lum'].get('dark', 1) <= 0.25 for r in res), J([r for r in res if not (r['placed'] and r['lum'].get('dark', 1) <= 0.25)]))


PLATES = """(texts=>{ const out=[]; const a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3();
  GAME.E.scene.traverse(o=>{ if(!o.isMesh||!/^PLATE_FACE_/.test(o.name||'')) return; const t=String((o.userData&&o.userData.text)||''); const hit=texts.find(w=>t.indexOf(w)>=0); if(!hit) return;
    const g=o.geometry, P=g.attributes.position, U=g.attributes.uv; o.updateWorldMatrix(true,false); const M=o.matrixWorld; const bx=new THREE.Box3().setFromObject(o), ctr=bx.getCenter(new THREE.Vector3());
    let bad=0, tri=0; const N=new THREE.Vector3();
    if(P&&U){ const idx=g.index?g.index.array:null, n=idx?idx.length:P.count;
      for(let k=0;k+2<n;k+=3){ const ia=idx?idx[k]:k, ib=idx?idx[k+1]:k+1, ic=idx?idx[k+2]:k+2; a.fromBufferAttribute(P,ia).applyMatrix4(M); b.fromBufferAttribute(P,ib).applyMatrix4(M); c.fromBufferAttribute(P,ic).applyMatrix4(M);
        const e1=b.clone().sub(a), e2=c.clone().sub(a), du1=U.getX(ib)-U.getX(ia), dv1=U.getY(ib)-U.getY(ia), du2=U.getX(ic)-U.getX(ia), dv2=U.getY(ic)-U.getY(ia), r=du1*dv2-du2*dv1; if(Math.abs(r)<1e-12) continue;
        const T=e1.clone().multiplyScalar(dv2).sub(e2.clone().multiplyScalar(dv1)).divideScalar(r), B=e2.clone().multiplyScalar(du1).sub(e1.clone().multiplyScalar(du2)).divideScalar(r);
        const nn=e1.clone().cross(e2), Ln=nn.length(); if(Ln<1e-12) continue; nn.divideScalar(Ln); if(Math.abs(nn.y)>0.9) continue;
        tri++; N.add(nn); if(!((nn.z*T.x-nn.x*T.z)>0&&B.y<0)) bad++; } }
    if(N.lengthSq()>0) N.normalize();
    out.push({text:t, hit, name:o.name, c:[+ctr.x.toFixed(2),+ctr.y.toFixed(2),+ctr.z.toFixed(2)], n:[+N.x.toFixed(3),+N.y.toFixed(3),+N.z.toFixed(3)], tri, bad, map:!!(o.material&&o.material.map)}); });
  return out; })"""
PLATE_TEXTS = ['傳達室', '男賓止步', '側門', '經濟系']


async def vis_plates(pg, cdp, run):
    st, d = await state_at(pg, '2025-10-15', 11.0, 'campus')
    await load(pg, cdp, run, st, '名牌：最小存檔 2025-10-15 11:00 校園', quiet=True)
    pl = []
    for _ in range(90):
        pl = await pg.evaluate(PLATES, PLATE_TEXTS)
        if len(pl) >= 5 and all(p['tri'] for p in pl): break
        await pg.wait_for_timeout(1000)
    run.note('校園側牆名牌（遊戲裡的網格）：%s' % J(pl))
    cnt = {w: sum(1 for p in pl if p['hit'] == w) for w in PLATE_TEXTS}
    run.check('找得到五塊：傳達室×1、男賓止步×2、共同側門×1、社科院系名牌×1（GLB 載完、畫了字）', cnt == {'傳達室': 1, '男賓止步': 2, '側門': 1, '經濟系': 1} and all(p['map'] for p in pl), J(cnt))
    run.check('五塊名牌從正面看字是正的（u 往右、v 往下；改前 u、v 一起反＝轉 180°）', bool(pl) and all(p['tri'] > 0 and p['bad'] == 0 for p in pl), J([(p['text'], p['tri'], p['bad']) for p in pl]))
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); run.setup('【捷徑】藏起玩家、固定鏡頭近拍名牌（看字）')
    res = []
    for i, p in enumerate(pl):
        c, n = p['c'], p['n']; cam = (c[0] + n[0] * 2.4, c[1] + 0.05, c[2] + n[2] * 2.4)
        r = await fixed_shot(pg, run, 'plate_%d_%s' % (i, p['hit']), cam, tuple(c)); r['text'] = p['text']; res.append(r)
    await pg.evaluate(CAMEND)
    run.note('名牌近拍：%s（社科院那一塊在大廳裡、一樓玻璃不透明，從外面看不到：照拍，看截圖）' % J(res))
    run.check('名牌近拍都放得到鏡頭、沒有整張純黑（字看截圖）', bool(res) and all(r['placed'] and r['lum'].get('dark', 1) <= 0.25 for r in res if '經濟系' not in r['text']), J(res))


async def m_visuals(pg, cdp, run):
    for v in ENV('VIS', 'gymb1,bell,lamp,us,plates'):
        fn = {'gymb1': vis_gymb1, 'bell': vis_bell, 'lamp': vis_lamp, 'us': vis_us, 'plates': vis_plates}.get(v)
        if not fn: run.check('VIS＝%s 認得' % v, False); continue
        run.note('---- visuals：%s ----' % v)
        try: await fn(pg, cdp, run)
        except Exception as e: run.check('visuals %s：跑完（沒有探針例外）' % v, False, repr(e)[:400]); traceback.print_exc()
        try: await pg.evaluate(CAMEND)
        except Exception: pass


# ================================================================ 8. 阿凱的泡麵評鑑表
KAI_SHEET = [['表更新了', '📷（泡麵評鑑表）'], ['第一名換了', '📷（泡麵評鑑表，第一名那一格塗掉重寫）'], ['所以我加了一欄 凌晨三點吃的另外算', '📷（泡麵評鑑表，最右邊多了一欄）'], ['這款我給負分 你不要買', '📷（泡麵評鑑表，最下面一格畫了一個叉）']]
DPMSG = """(()=>(GAME.G.msgs||[]).filter(m=>m&&/^dp_/.test(m.tag||'')).map(m=>[CALENDAR.dateOf(m.day).key,m.tag,m.from||'',String(m.text||'').slice(0,40)]))()"""
KAIQ = """(()=>{ const G=GAME.G, F=G.flags, flat=[].concat(...%s); return {sheet:(G.msgs||[]).filter(m=>m&&(/^dp_kai_sheet/.test(m.tag||'')||(m.from==='kai'&&flat.includes(m.text)))).map(m=>[CALENDAR.dateOf(m.day).key,m.tag||null,m.text]),
  dpN:(F.dpN||{}).kai_sheet==null?null:F.dpN.kai_sheet, y0n:F.KAI_SHEET_Y0N==null?null:F.KAI_SHEET_Y0N, fix:F.KAI_SHEET_Y0FIX==null?null:F.KAI_SHEET_Y0FIX, now:CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2), stage:G.stage}; })()""" % J(KAI_SHEET)


async def m_kai_sheet(pg, cdp, run):
    parts = ENV('KAI', 'econ,y2,old'); mx = int(os.environ.get('KAI_MAX', '2400'))
    if 'econ' in parts:
        end = os.environ.get('KAI_END', '2024-12-02')
        st, d = await econ_state(pg, '2024-09-23', 8.0, 'dorm', False)
        await load(pg, cdp, run, st, '經濟系最小存檔 2024-09-23 08:00 宿舍（事件模式，E01_MORNING）', js="return LV('kai',25,0,0);")
        ok = await play(pg, cdp, run, "CALENDAR.dateOf(GAME.G.day).key>=%s" % J(end), max_s=mx, ff=False, tag='kai_econ')
        k = await pg.evaluate(KAIQ); dp = await pg.evaluate(DPMSG); await run.shot(pg, 'kai_econ_end')
        run.note('經濟系那一年（到 %s）手機小事 dp_：%s' % (k['now'], J(dp)[:2000]))
        run.check('經濟系那一年：照玩家讓事件模式跳到 %s（現在 %s）、期間有別的手機小事（dp_ %d 則，＝每天的小事有在跑）' % (end, k['now'], len(dp)), ok and len(dp) > 0, J(k))
        run.check('經濟系那一年：沒有收到阿凱的泡麵評鑑表（沒有 dp_kai_sheet、沒有那四種句子）', not k['sheet'], J(k))
    for part in ('y2', 'old'):
        if part not in parts: continue
        js = "return LV('kai',25,0,0);"
        if part == 'old':
            js = ("LV('kai',25,0,0); F.dpN=Object.assign({},F.dpN||{},{kai_sheet:3}); F.dpDayOf=Object.assign({},F.dpDayOf||{},{kai_sheet:D('2024-11-19')}); G.msgs=G.msgs||[];"
                  " const T=%s; [['2024-09-24',0],['2024-10-22',1],['2024-11-19',2]].forEach(([k,n])=>T[n].forEach((t,j)=>G.msgs.push({th:'p:kai',from:'kai',text:t,day:D(k),h:21.8,tag:'dp_kai_sheet_'+n+'_'+j})));"
                  " return {dpN:F.dpN.kai_sheet, n:G.msgs.filter(m=>/^dp_kai_sheet/.test(m.tag||'')).length};") % J(KAI_SHEET)
        st, d = await state_at(pg, '2026-09-21', 8.0, 'dorm')
        await load(pg, cdp, run, st, '%s：最小存檔 2026-09-21（大二上 %s）08:00 宿舍；阿凱有點熟%s' % (part, d['term'], '；舊存檔：經濟系那年收過三次（dpN 3、三組 2024 的訊息）' if part == 'old' else ''), js=js)
        d0 = d['key']
        until = "(()=>{ const G=GAME.G; return (G.msgs||[]).some(m=>m&&/^dp_kai_sheet/.test(m.tag||'')&&CALENDAR.dateOf(m.day).key>=%s)||CALENDAR.dateOf(G.day).key>='2026-12-01'; })()" % J(d0)
        ok = await play(pg, cdp, run, until, max_s=mx, ff=True, tag='kai_' + part)
        k = await pg.evaluate(KAIQ); new = [x for x in k['sheet'] if x[0] >= d0]; await run.shot(pg, 'kai_%s_end' % part)
        if new:
            await P.phone_thread(pg, cdp, 'p:kai', open_folds=False); await run.shot(pg, 'kai_%s_thread' % part); await L.close_panels(pg, cdp)
        texts = [x[2] for x in new][:2]
        if part == 'y2':
            run.check('大二上（照玩家床「快轉」）：收得到阿凱的泡麵評鑑表，第一次是第 1 種「表更新了」「📷（泡麵評鑑表）」', texts == KAI_SHEET[0], J(k))
        else:
            run.check('舊存檔（經濟系那年收過三次）：大二上第一次收到的是第 1 種「表更新了」、KAI_SHEET_Y0N＝3、KAI_SHEET_Y0FIX＝1、tag 從 dp_kai_sheet_3_ 開始（不撞 2024 那幾則）',
                      texts == KAI_SHEET[0] and k['y0n'] == 3 and k['fix'] == 1 and bool(new) and (new[0][1] or '').startswith('dp_kai_sheet_3_'), J(k))


# ================================================================ 9. ADV 開場不先擺可昕
def on_stage(st, cid):
    if not st or not st.get('active'): return False
    return any(st.get(s) and (st[s].get('id') == cid or st[s].get('want') == cid) and not st[s].get('compact') for s in ('L', 'R'))


def stage_ids(st):
    if not st or not st.get('active'): return []
    return [(s, st[s].get('id') or st[s].get('want'), st[s].get('show')) for s in ('L', 'R') if st.get(s) and (st[s].get('id') or st[s].get('want'))]


ADV_CASES = {
    'e26': dict(ids=['ev_y0_e26'], first='（你拿了車鑰匙出門。）', inperson=True),
    'bus_h': dict(ids=['ev_y0_kh_bus_h', 'ev_y0_kh_bus'], first='（凌晨兩點半，你搭上南下的夜班客運。）', inperson=True),
    'home_h': dict(ids=['ev_y0_kh_home_h', 'ev_y0_kh_home'], first='（早上七點半。成績的簡訊提早到了。）', inperson=False),
    'bus': dict(ids=['ev_y0_kh_bus', 'ev_y0_kh_bus_h'], first='（凌晨兩點半，你搭上南下的夜班客運。）', inperson=True),
    'home': dict(ids=['ev_y0_kh_home', 'ev_y0_kh_home_h'], first='（早上七點半。成績的簡訊提早到了。）', inperson=False),
}


async def adv_case(pg, cdp, run, case, kx):
    C = ADV_CASES[case]
    if case == 'e26':
        st, d = await econ_state(pg, '2024-10-17', 15.3, 'dorm', False, done={'ev_y0_e02': 1, 'ev_y0_e30': 1})
        await load(pg, cdp, run, st, 'e26：經濟系最小存檔 2024-10-17 15:18 宿舍（事件模式；E30 辦休學演過）', js="return LV('kexin',45,30,20,{npcRom:30});")
    else:
        bus = case.startswith('bus'); home = case.endswith('_h')
        st, d = await econ_state(pg, '2025-07-25', 2.5 if bus else 7.5, 'dorm' if home else 'gongguan', True, flags={'KH_GO': 'bus' if bus else 'home'}, home_at=home)
        await load(pg, cdp, run, st, '%s：經濟系退宿後最小存檔 2025-07-25 %s %s（和可昕交往中、KH_GO %s；快轉停在那一刻）' % (case, '02:30' if bus else '07:30', '在家' if home else '人在公館（不在家）', 'bus' if bus else 'home'))
    n0 = await pl_len(pg)
    until = "(ids=>ids.some(id=>!!((GAME.G.events||{}).done||{})[id]))(%s)" % J(C['ids'])
    ok = await play(pg, cdp, run, until, max_s=900, picks=['出發', '「（傳截圖給她。）」'], ff=False, tag='adv_' + case, shots_first=2)
    R = [r for r in await rows(pg, n0, 'say')]
    ran = await pg.evaluate("(ids=>ids.filter(id=>!!((GAME.G.events||{}).done||{})[id]))(%s)" % J(C['ids']))
    i0 = next((i for i, r in enumerate(R) if r['t'] == C['first']), None)
    log = [[r['n'], r['t'][:24], stage_ids(r.get('post')), stage_ids(r.get('late'))] for r in R[(i0 or 0):(i0 or 0) + 14]]
    run.note('%s 演的事件 %s；每一句的舞台（說完的當下、0.6 秒後）：%s' % (case, J(ran), J(log)[:2500]))
    run.check('%s：演了 %s（現在 %s）' % (case, '／'.join(C['ids']), J(await P.clock(pg))), ok and bool(ran) and i0 is not None, J({'ran': ran, 'first': i0}))
    if i0 is None: return
    seg = R[i0:]
    ik = next((i for i, r in enumerate(seg) if r['n'] in kx), None)
    before = seg[:ik] if ik is not None else seg[:6]
    lead = [r['t'][:20] for r in before if on_stage(r.get('post'), 'kexin') or on_stage(r.get('late'), 'kexin')]
    run.check('%s：第一句「%s」時舞台上沒有可昕；她開口以前都沒有' % (case, C['first']), not on_stage(seg[0].get('post'), 'kexin') and not on_stage(seg[0].get('late'), 'kexin') and not lead, J({'有她的句子': lead, '第一句': [stage_ids(seg[0].get('post')), stage_ids(seg[0].get('late'))]}))
    if C['inperson']:
        after = seg[ik:ik + 2] if ik is not None else []
        run.check('%s：她開口那一句（或下一句）可昕才出來' % case, ik is not None and any(on_stage(r.get('post'), 'kexin') or on_stage(r.get('late'), 'kexin') for r in after), J([[r['n'], r['t'][:20], stage_ids(r.get('post')), stage_ids(r.get('late'))] for r in after]))


async def adv_e20(pg, cdp, run, kx):
    st, d = await econ_state(pg, '2024-12-25', 18.58, 'dorm', True, flags={'ECON_FULL': True})
    await load(pg, cdp, run, st, 'e20：經濟系退宿後最小存檔 2024-12-25（三）18:35 在家、和可昕交往；【前置】ECON_FULL（30 分鐘版把 E20 剪了，照完整版演）')
    n0 = await pl_len(pg); xun = await names_of(pg, 'econ_zhengxun', ('阿勳',))
    ok = await play(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_y0_e20", max_s=900, picks=['出發', '「扁扁的、方方的那個。」'], ff=False, tag='adv_e20', shots_at=['欸。這個。', '她把一隻一模一樣的長頸鹿'])
    R = [r for r in await rows(pg, n0, 'say')]
    i0 = next((i for i, r in enumerate(R) if r['t'] == '欸。這個。'), None)
    seg = R[i0:i0 + 4] if i0 is not None else []
    log = [[r['n'], r['t'][:20], stage_ids(r.get('post')), stage_ids(r.get('late'))] for r in seg]
    run.note('E20 火鍋店門口那一段的舞台：%s' % J(log))
    run.check('E20 有演（自動出發 → 火鍋店）', ok and i0 is not None, J({'now': await P.clock(pg), 'n': len(R)}))
    run.check('E20 火鍋店門口：可昕「欸。這個。」起四句，舞台上沒有阿勳殘留（左邊）', bool(seg) and not any(on_stage(r.get('post'), 'econ_zhengxun') or on_stage(r.get('late'), 'econ_zhengxun') for r in seg), J(log))


async def m_adv_linger(pg, cdp, run):
    kx = await names_of(pg, 'kexin')
    for case in ENV('ADV_CASES', 'e26,bus_h,home_h,bus,home,e20'):
        run.note('---- adv_linger：%s ----' % case)
        try:
            if case == 'e20': await adv_e20(pg, cdp, run, kx)
            elif case in ADV_CASES: await adv_case(pg, cdp, run, case, kx)
            else: run.check('ADV_CASES＝%s 認得' % case, False)
        except Exception as e: run.check('adv_linger %s：跑完（沒有探針例外）' % case, False, repr(e)[:400]); traceback.print_exc()


# ================================================================ 10. 經濟系日期卡、K7 第 4 頁、K0b-L1、8/29
NEW65 = '（每天早上，還是比誰先坐到桌子前面。這個月的早餐，大部分是你請的。）'
FAN65 = '（五月，書桌旁邊多了一台電風扇。考前一個月，兩個人說好，去報一個衝刺班。）'
K7P4 = '2025.2.2　蓮池潭。你說一起重考的時候，風把我的頭髮全吹到臉上。'
K0B = ['你房間那張書桌，你坐左邊，我坐右邊。', '中間這一條線，是我們的國界。……橡皮擦可以出口。']
Y0S2 = '這個暑假，你還是住在家裡。媽媽每天問你，新宿舍還缺什麼。'


async def aa529_cards(pg, cdp, run, kx):
    st, d = await econ_state(pg, '2025-04-24', 22.67, 'dorm', True)
    await load(pg, cdp, run, st, 'cards：經濟系退宿後最小存檔 2025-04-24 22:40 在家（和可昕交往中；30 分鐘版）')
    n0 = await pl_len(pg)
    await play(pg, cdp, run, "CALENDAR.dateOf(GAME.G.day).key>='2025-06-08'", max_s=900, ff=False, tag='cards', card_watch=('電風扇', 'cards_fan_card'))
    R = await rows(pg, n0); cards = [[r['n'], r['t'], r['d']] for r in R if r['k'] == 'card']; t3 = [r['t'] for r in R if r['k'] == 't3']
    run.note('4/24 以後的日期卡（GAME.titleCard）：%s；#title3：%s' % (J(cards)[:1500], J(t3)[:1500]))
    allsub = '\n'.join(c[1] for c in cards)
    i1, i2 = allsub.find(NEW65), allsub.find(FAN65)
    run.check('照玩家在家（事件接事件）跳到 6/8 以後：日期卡出「%s」接著「%s」' % (NEW65[:16] + '…', FAN65[:16] + '…'), i1 >= 0 and i2 > i1, J(cards))
    one = next((c for c in cards if NEW65 in c[1] and FAN65 in c[1]), None)
    if one: run.check('一跳 4/24→6/8：同一張卡兩行（「…<br>…」、新句在前）；#title3 畫面上也是兩行', one[1].find(NEW65) < one[1].find(FAN65) and '<br>' in one[1] and any(NEW65 in h and FAN65 in h and '<br>' in h for h in t3), J({'card': one, 'dom': [h for h in t3 if '電風扇' in h]}))
    else: run.note('沒有一跳 4/24→6/8（中間停過），兩句分在不同的卡：%s' % J([c for c in cards if NEW65 in c[1] or FAN65 in c[1]]))


async def aa529_k7(pg, cdp, run, kx):
    st, d = await state_at(pg, '2025-10-20', 21.0, 'dorm', flags={'dating_kexin': True, 'KX_ANNIV': {'1': 'went'}, 'PLAYED_Y0': True, 'KH_GO': 'home', 'Y0_DATING': True, 'KX_DATING_SINCE': '2024-10-17'})
    await load(pg, cdp, run, st, 'k7：最小存檔 2025-10-20 21:00 宿舍（法律系大一上；和可昕交往、K7 第一年週年去了＝KX_ANNIV 1 went、KH_GO home）', js="F.KX_ANNIV={1:'went'}; return LV('kexin',65,50,45,{npcRom:60,rom:40});")
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>/週年卡片/.test(i.label||'')); return it?{x:it.x,z:it.z,label:it.label}:null; })()")
    labs = await pg.evaluate("(()=>(GAME.E.interactables||[]).map(i=>i.label).filter(Boolean).slice(0,40))()")
    run.check('k7：宿舍房間有「她的週年卡片」', bool(it), J(labs))
    if not it: return
    n0 = await pl_len(pg)
    await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, it['label'], max_s=150); await L.tap(pg, cdp, '#interact')
    await play(pg, cdp, run, "!!GAME.G.flags.KX_CARD_READ", max_s=300, picks=['翻後面幾頁'], ff=False, tag='k7', shots_at=['蓮池潭'])
    L_ = said(await rows(pg, n0)); await run.shot(pg, 'k7_end')
    run.check('k7：「翻後面幾頁」→ 第 4 頁「%s」、沒有「筷子掉了兩次」' % K7P4, any(t == K7P4 for _, t in L_) and not any('筷子掉了兩次' in t for _, t in L_), J(L_[:10]))


async def aa529_k0b(pg, cdp, run, kx):
    st, d = await econ_state(pg, '2025-02-15', 9.0, 'dorm', True)
    await load(pg, cdp, run, st, 'k0b：經濟系退宿後最小存檔 2025-02-15 09:00 在家（和可昕交往中）')
    n0 = await pl_len(pg)
    await play(pg, cdp, run, "CALENDAR.dateOf(GAME.G.day).key>='2025-03-16'", max_s=int(os.environ.get('K0B_MAX', '1500')), ff=False, tag='k0b', shots_at=[K0B[1][:10]])
    R = [r for r in await rows(pg, n0, 'say')]
    her = [[r['d'], r['t'][:24]] for r in R if r['n'] in kx]; hit = [[r['d'], r['t']] for r in R if r['t'] in K0B]
    run.note('k0b：2/15～3/16 可昕說的（%d 句）：%s；K0b-L1：%s' % (len(her), J(her[:20]), J(hit)))
    if hit: run.check('k0b：K0b-L1「國界」在 2/15～3/15 出', all('2025-02-15' <= h[0] <= '2025-03-15' for h in hit) and len({h[1] for h in hit}) == 2, J(hit))
    elif her: run.check('k0b：2/15～3/15 有和可昕見面（她說了 %d 句）＝K0b-L1「國界」應該出' % len(her), False, J(her[:10]))
    else: run.note('k0b：2/15～3/16 沒有和可昕見面的機會＝未驗證（只記；Node aa529_econ_unit 6-1 有）')


async def aa529_s829(pg, cdp, run, kx):
    st, d = await econ_state(pg, '2025-08-30', 21.5, 'dorm', True)
    await load(pg, cdp, run, st, 's829：經濟系退宿後最小存檔 2025-08-30 21:30 在家')
    n0 = await pl_len(pg)
    await play(pg, cdp, run, "(window.__PL||[]).some(r=>r.k==='say'&&r.t==='書桌上，經濟學原理還沒收起來。')||GAME.G.stage==='law'", max_s=600, picks=['睡覺'], ff=False, tag='s829', shots_at=[Y0S2[:10]])
    L_ = said(await rows(pg, n0))
    run.check('s829：家裡「睡覺」→ 轉法律系的摘要第 2 句「%s」、沒有「整個暑假」' % Y0S2, any(t == Y0S2 for _, t in L_) and not any('整個暑假' in t for _, t in L_), J(L_[:8]))


async def m_aa529_cards(pg, cdp, run):
    kx = await names_of(pg, 'kexin')
    for sub in ENV('AA529', 'cards,k7,k0b,s829'):
        fn = {'cards': aa529_cards, 'k7': aa529_k7, 'k0b': aa529_k0b, 's829': aa529_s829}.get(sub)
        if not fn: run.check('AA529＝%s 認得' % sub, False); continue
        run.note('---- aa529_cards：%s ----' % sub)
        try: await fn(pg, cdp, run, kx)
        except Exception as e: run.check('aa529 %s：跑完（沒有探針例外）' % sub, False, repr(e)[:400]); traceback.print_exc()


# ================================================================ main
MODEFN = {'vac_y3summer': m_vac_y3summer, 'vac_homeout': m_vac_homeout, 'vac_y1winter': m_vac_y1winter, 'vac_heroine': m_vac_heroine, 'zr_summer': m_zr_summer,
          'date_away': m_date_away, 'visuals': m_visuals, 'kai_sheet': m_kai_sheet, 'adv_linger': m_adv_linger, 'aa529_cards': m_aa529_cards}


async def main():
    run = L.Run('post91015_' + '+'.join(MODES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for m in MODES:
            fn = MODEFN.get(m)
            if not fn: run.check('MODE %s 認得' % m, False, '可以用：' + ','.join(MODEFN)); continue
            print('==== MODE %s（SHA %s）====' % (m, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % m, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % m, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, m + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % m, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'MODE', ','.join(MODES), flush=True)
    sys.exit(run.finish())

asyncio.run(main())
