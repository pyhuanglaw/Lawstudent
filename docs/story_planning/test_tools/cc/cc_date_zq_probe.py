"""CC（帳號 A）11-11：DATE_ZQ（BB P2）子晴校外約會台詞（DLG-FULL-REVIEW-1110 子晴 33 個地點重寫，db5bbdf4ce，含在 bcea920be／bc407bfc5）瀏覽器探針。判定歸 BB；Playwright 手機模擬（844×390 觸控）≠ iPhone。
BB 原文：「抽五個地點真的約會走一遍（D01 華山、D03 遊戲展、D08 動物園、D26 臺中過夜、任一再訪）：記每一格逐字、階段（一般／交往）、再訪格有沒有出現、
  D26 晚上那句是不是「（晚上她回家。你住在車站附近的旅館。）」、牽手靠肩的句子只在交往時出現。」

對照的程式（src/date3d.js）：
  預約  手機「朋友」→ 子晴「約」→ 出去玩… → 類別 → 地點 →（交通）→ 今天 → HH:00 出發 → 就這樣約（DATE.menu → S.pickWhen → S.book）
  出發  前 60 分鐘提醒（S.tick → S.early「現在出發／到時間再說」）或出發時間到（S.prompt「出發」）→ OUT.go → DATE.scene／sceneOvernight
  台詞  抵達 S.arriveLine：第一次＝first；之後 交往中＝arrive.dating、否則 arrive.normal（S.pickSet：照階段 tier、排除最近 3 套＝這裡從空的開始，所以是池子裡第一個合階段的）
        互動點 S.spotLine：沒點過＝first；第二次（visits===1）或上一次點過＝remember（再訪格）；交往中＝dating；她不喜歡＝dislikeLine；其他＝normal
        收尾 S.closeLine：同抵達。第三個點之後 enough（lines.heroine_04.enough 輪流）。兩天一夜：晚上 S.NIGHT[S.nightKind]（D26＋子晴＝S.NIGHT_HOME → home）、早上「（第二天早上。）」＋S.MORNING.heroine_04
  所以「交往格」只在第二次以後才會出現：每個地點的兩個階段都用同一份【前置】記憶（第三次以上去、上一次點過第一個互動點），一般／交往只差 dating 旗標＝真正的 A／B 對照。

PARTS（逗號分隔；預設 D01,D03,D08,D26,REVISIT；WISH 另外加）：
  D01   華山1914文創園區（半天，15:00 出發）    一般（第 5 階）、交往      【前置】去過兩次、上一次點過「老倉庫裡的展覽」
  D03   參創生活園區（半天，15:00）              一般（第 5 階）、交往      【前置】同上（試玩區）＋心願已經完成（WISH_DONE、dateLog.wish：D03 是她的心願地點，沒完成＝整趟是心願事件）
  D08   臺北市立動物園（半天，15:00）            一般（第 5 階）、交往      【前置】同上（貓熊館）；遊園列車排第二個點（交往格是「靠著你的肩膀」）
  D26   臺中（兩天一夜，09:00 出發）             一般（第 6 階：兩天一夜要第 6 階或交往）、交往   【前置】同上（國美館）；草悟道排第二個（交往格是「牽住你的手」）；看晚上那一句
  REVISIT 華山（一般第 5 階）真的去兩次：第一次全新（first 格＋選項）→【前置】讀回同一份存檔、日期改到隔天 → 第二次（互動點全部應該是 remember＝再訪格）
  WISH  參創第一次（一般第 5 階）＝心願事件整場（date_wish.js events.heroine_04），逐字只驗「每一句都在稿裡」
STAGES＝friend,dating（預設兩個都跑；REVISIT、WISH 只跑 friend）；PICK＝互動點選項選第幾個（預設 0）。
（BB 07:06 加）SPOTS＝每趟點幾個互動點（預設 3）。SPOTS=4＝點滿四個（D01 紅磚牆、D03 樓上靠窗、D08 長頸鹿、D26 審計新村都走到；兩天一夜每天 2 個），
  引擎點滿以後不出「差不多了」選單、收尾句直接接上：探針照稿的格數把最後一個點和收尾切開各自比，另外印【觀察】（最後一個點那句→中間的事件／字幕／畫面（含底圖、時間）→收尾那句），
  截圖 zq_<D>_<friend|dating>_4th_close.png（收尾那一句出現時）；tag、json 加 _s4。
  3e／3f：點到的每個點的交往格逐字——交往那趟要出現（上一次點過的那一個是 remember 格，除外）、一般那趟不能出現。
  肢體字（牽、肩、靠著、塞進你手……）在稿裡非交往格本來就有的（例：以安 D10 remember「牽著比較穩」）不算 FAIL，另外印【觀察】。
  D26（兩天一夜，不管 SPOTS）：5a 晚上那句＝出發前照 date3d.js 算的 DATE.NIGHT[nightKind]；5b 子晴 D26 一般、交往都逐字＝「（晚上她回家。你住在車站附近的旅館。）」；
  5c 隔天早上那句＝DATE.morningLine（5d 再和 date3d.js 原始碼 S.MORNING 的字比）；離開那句＝收尾格逐字（close（回程前離開那一句））；5e 回程字幕＝行程的 back（「回到首都帝大。」）。
WHO＝換人（預設 heroine_04；之後以安＝heroine_01）：地點清單（date_lines.js 有這個人格子的地點）、源稿（同一份 Dxx.json 的 lines.<WHO>）、心願地點（date_locations wishOf）、
  不分地點的短句（lines.<WHO>＋頁面的 DATE.EXTRA_LINES）都照這個人；log 開頭印用的是誰。REVISIT_LOC＝REVISIT 用哪個地點（預設 D01；以安 D07 再訪＝PARTS=REVISIT;REVISIT_LOC=D07）。
  兩天一夜的地點清單在 OVERNIGHT（現在只有 D26），其他地點一律半天 15:00 出發。
（BB 07:33 加，DATE_AN／DATE_ZQ 共用）
  源稿＝受測樹自己的 tests/date_src_sha.js 的 ALLOW_SHA（7266e7a29／fea448637＝bd1ce5be0：以安重寫＋子晴再改 31 格），不寫死；讀不到只比資料檔。
  VISIT＝first／again（沒寫＝D06、D10、D13 預設 first（選項、請客、開發註記都在 first 格），其他 again）；STAGES 多一種 friend6＝第 6 階沒交往（D13 預設 friend,friend6,dating）。
  選項：每一段該出的選項照 date3d.js 擋「（第 N 階以上）」沒到的、去掉尾巴（DATE.optOk／optText），逐字比跳出來的選單；回話逐字（選法 PICKS：D13 飲料選第 2 個、拍照選「一起拍？」，其他照 PICK）。
    DATE.DEV_NOTE（整句不演）、DEV_STRIP（換字）從頁面讀，預期句子照樣拿掉；firstHigh（第 6 階或交往的第一次）、extra:合照（第 6 階或交往）、{sunset}（DATE.sunset）都算進預期；
    pickSet 照 recent 算（D13 以安 again 的【前置】recent＝飲料第 1 套，第 6 階才輪到「這杯我請。不要跟我搶。」）。
  8 畫面上的開發註記：每一步掃 document.body.innerText＋對話、選項、字幕，不能有「留給 Q12、C2、（第 6 階以上）、反引號、AA_113」、整行「你說了」。
  9 以安 D26 全程沒有「我媽、媽媽、傳訊息、叫我帶」（別的地點有就印【觀察】）；5f／5g 以安 D26 早上逐字「早。我買了以前上學路上那家的飯糰，兩個，一個是你的。」、晚上逐字「（晚上她回家。你住在車站附近的旅館。）」。
  10 子晴 D13 拍照選項「一起拍？」：第 5 階沒交往＝看不到；第 6 階（friend6）、交往＝看得到（選單逐字印）。
  錢：GAME.money 每一筆（金額、項目、前、後）、每一句當時的 G.money；說到／選到「我請、蛋糕我來、這杯我請、我付」的格印【觀察】（那一格扣了什麼、第一句和最後一句時祐廷有多少錢）；每一趟讀檔後和走完的錢。
  REVISIT_LOC 是她的心願地點（以安 D07）：第一趟自動走心願事件（逐句在 date_wish.js 裡、心願完成），第二趟看再訪格。
【前置／捷徑】（log 都會印）：讀檔（GAME.applySave，quiet_events：關條件事件與手機自動打開）、日期時間、晴天、錢；她的聯絡方式；關係數值（SOCIAL.rel 直接設）；
  交往＝flags.dating_heroine_04（不演告白）；dateLog／dateMemory（去過幾次、點過哪些）；REVISIT 第二次＝把第一次走完的存檔讀回來、只改日期。
  約會本身全部走畫面：手機按鈕、選單用觸控點、對話框用觸控翻頁、等出發用手機「今天」的「跳過時間」（沒有能跳的才等時間自己走）。手機「約」找不到才退回 INV.flow（【捷徑】，會印）。
記錄（只記不改）：GAME.say（說話人、原文、遊戲時間）、GAME.choose（選項、選了哪個）、畫面上打完字的對話框（名字＋全文，{name} 換好以後）。
判定（每項 PASS／FAIL）：
  1. 子晴說的每一句、約會裡的旁白都在遊戲資料（src/data/date_lines.js）裡一字不差；源稿讀得到（git show 白名單 SHA）就也和稿比（照匯入工具先過 import_guard.read_fix）
  2. 每一段（抵達、每個互動點、收尾）的句子＝照上面規則該出的那一格（逐句比），格種類寫在 log（first／remember／dating／normal／dislike）
  3. 一般：沒有任何牽手、靠肩、拉手這類句子，也沒有任何交往格的句子；交往：抵達、收尾是交往格（有交往格的地點）
  4. 再訪：REVISIT 第二次每個點過的互動點都是 remember 格；地點 part 第一個互動點是 remember 格
  5. D26：晚上那一句逐字＝「（晚上她回家。你住在車站附近的旅館。）」（一般、交往都是）；早上那一句＝S.MORNING.heroine_04
  6. 畫面上沒有沒換掉的 {name}、undefined；約會走完（行程 done、算一次）；沒有 JS 例外（pageerror）
最後一張表：地點×階段×第幾次×格數（她＋旁白）×交往格數×肢體句數×再訪格×晚上那句。
輸出：<out>/zq_lines.txt（逐句全文）、<out>/zq_<part>.json、截圖（每格一張以內：肢體句、晚上、再訪、抵達、結算）。
D34：舊版（線上 779ddd650）＝舊稿：每個地點有 17～34 格字不一樣（D01 31、D03 17、D08 33、D26 34 格）→ 第 1、2 項逐字比新稿會 FAIL；
  舊版沒有 S.NIGHT_HOME → D26 晚上是「（晚上住在車站附近的旅館。兩間房，隔著一道牆。）」（一般）／「（晚上住在一間小民宿。窗外很安靜。）」（交往）→ 第 5 項 FAIL；
  舊版 S.MORNING 子晴是「昨天我又弄到兩點。……今天你負責叫我。」→ 早上那一句比新字 FAIL（REF=game 時比的是遊戲自己的 DATE.MORNING，兩版都 PASS）。
  第 3 項（交往格只給交往）是引擎的閘門，這次沒有改，兩版都應該 PASS（舊稿 D03、D08、D26 也有牽手／靠肩，同樣只在交往格）。
  舊版對照：LW_TESTS=<舊版樹>/tests TAG=old SHA=779ddd650 PARTS=D26 python3 cc_date_zq_probe.py <url> <out>（逐字比的是「舊樹自己的 date_lines.js」→ 1、2 項兩版都 PASS；
  要看舊版對新稿 FAIL：加 REF_TREE=<新版樹>，拿新版的 date_lines.js 當標準）。
CC_02 清單 2026-11-12：1✓（日子照 DATE.check 從大一上週六挑、一整天地點 09:00） 2✓（地點、互動點、選項照 date_lines.js／date_locations.js 從受測樹讀） 3✓（每個地點、每個階段重新讀檔） 4✓（選項照序號或字） 5✓（照玩家從手機約、出發、選互動點） 6✓（一句一句點） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：約會畫面） 10✓（quiet_events 條件事件關掉） 11✓ 12✓（每格同樣欄位） 13✓（讀檔、關係值、交往旗標是捷徑，R.setup 標）
11-12 加：SHOT_ALL=1 每句截圖；ORDER=D24=D24.station+…（先點哪個互動點）；只有「一整天」的地點（date_locations kinds＝day）09:00 出發。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=D01,D03 [STAGES=friend,dating] [PICK=0] [REF_TREE=<樹>] python3 cc_date_zq_probe.py <url> <out>（URL 不加 ?turbo）"""
import os, sys, json, asyncio, time, re, subprocess
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT)
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or 'new'
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or 'D01,D03,D08,D26,REVISIT').split(',') if p.strip()]
STAGES_ENV = [s.strip() for s in (os.environ.get('STAGES') or '').split(',') if s.strip()]   # friend＝一般第 5 階、friend6＝一般第 6 階（沒交往）、dating＝交往；沒寫＝照地點的預設（D13＝三種、其他＝friend,dating）
VISIT_ENV = (os.environ.get('VISIT') or '').strip().lower()   # first＝第一次去（first 格、選項）；again＝第三次以上（再訪格、交往格）；沒寫＝照地點的預設（FIRST_LOCS＝first、其他＝again）
PICK = int(os.environ.get('PICK') or 0)
ROOT = os.path.abspath(os.path.join(LWT, '..'))
REF = os.path.abspath(os.environ.get('REF_TREE') or ROOT)
ZQ = (os.environ.get('WHO') or 'heroine_04').strip()   # 換人：WHO=heroine_01（以安）……；地點清單、源稿、心願都照這個人切換（變數名照舊叫 ZQ）
SPOTS = max(1, min(4, int(os.environ.get('SPOTS') or 3)))   # 每趟點幾個互動點；4＝點滿（收尾句直接接在最後一個點後面，記【觀察】）
REVISIT_LOC = (os.environ.get('REVISIT_LOC') or 'D01').strip().upper()   # REVISIT 用哪個地點（以安之後跑 D07）
SHOT_ALL = os.environ.get('SHOT_ALL') == '1'   # 11-12 DATE35：每一句都截圖（最多 60 張），不只第一句
ORDER_ENV = os.environ.get('ORDER') or ''   # 11-12 DATE35：例 D24=D24.station+D24.street；指定先點哪個互動點
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('date_zq_' + TAG, OUT)
LINES_TXT = os.path.join(OUT, 'zq_lines.txt')
NIGHT_WANT = '（晚上她回家。你住在車站附近的旅館。）'
CONTACT = re.compile(r'牽|肩|手給我|你的手|手塞進|塞進你手|勾著你|拉著你|抓.{0,3}手|手臂|靠著|靠在|借我靠|靠一下|撞到你')   # 牽手、靠肩、靠著、拉手、勾手臂這類
STOPS = ('差不多了，回去吧', '就這樣回去', '今天先到這裡')
SYS_NARR = re.compile(r'^（(今天去了|這兩天去了|第二天早上。|晚上)|^約好了：|^今天 \d|^手機｜|^和.+去.+：')

# 地點設定：類別（手機選單第二層，照 date3d.js 的 S.GROUPS）、出發時間、點的順序（第一個＝記憶裡「上一次點過」的那一個＝remember 格）
GROUPS = {'臺北市：看展・電影': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D33'], '臺北市：戶外': ['D08', 'D09', 'D11', 'D12', 'D15'],
          '新北市、桃園：海邊': ['D13', 'D14', 'D16', 'D17', 'D23'], '新北市、桃園：老街・山・近郊': ['D07', 'D10', 'D18', 'D19', 'D20', 'D21', 'D22'],
          '一整天（宜蘭、中南部）': ['D24', 'D25', 'D26', 'D27']}
ORDER = {'D01': ['D01.expo', 'D01.lawn', 'D01.market', 'D01.wall'], 'D03': ['D03.demo', 'D03.arcade', 'D03.gacha', 'D03.window'],
         'D08': ['D08.panda', 'D08.train', 'D08.penguin', 'D08.giraffe'], 'D26': ['D26.museum', 'D26.path', 'D26.plaza', 'D26.village']}   # 子晴：第 2、3 個放有交往格肢體句／她不喜歡的點；SPOTS=4 才走到第 4 個
ORDER.update({'D06': ['D06.cafe', 'D06.gallery', 'D06.frame', 'D06.lawn'], 'D10': ['D10.snack', 'D10.bridge', 'D10.boat', 'D10.walk'],
              'D13': ['D13.drink', 'D13.rail', 'D13.photo', 'D13.bench']})   # 以安請客的那幾格（D06 咖啡廳、D10 小吃攤、D13 飲料）、子晴 D13 拍照排在前三個
LAST_DEF = {'D13': ['D13.rail']}   # again 時「上一次點過」的那一個（＝remember 格）；沒寫＝點的順序第一個。D13 讓飲料走 normal（以安「這杯我請」）
PRESET_RECENT = {('heroine_01', 'D13'): ['D13.drink.normal#0']}   # 【前置】again 時 dateMemory.recent：以安 D13 飲料 normal 第 6 階＝第 3 套「這杯我請。不要跟我搶。」（第 1 套 any 排前面，記成最近用過）
FIRST_LOCS = {'D06', 'D10', 'D13'}   # 預設第一次去：選項、請客、開發註記（D13 飲料「你說了」、拍照「一起拍？」（第 6 階以上）、欄杆 firstHigh「留給 Q12」）都在 first 格
STAGE_DEF = {'D13': ['friend', 'friend6', 'dating']}   # 子晴 D13「一起拍？」：第 5 階沒交往＝看不到、第 6 階或交往中＝看得到
PICKS = {'D13.drink': 1, 'D13.photo': '一起拍'}   # 互動點選項的選法（其他照 PICK）：數字＝第幾個；字＝選字含它的那一個（沒有就第一個）。D13 飲料選 2＝以安「你說了」那一格；拍照選「一起拍？」（有才選）
DEV_BAN = ['留給 Q12', 'C2', '（第 6 階以上）', '階以上）', '`', 'AA_113']   # 畫面上不能出現的開發註記（全畫面文字掃；BB 07:33 c）；「你說了」整行比（DEV_BAN_LINE）
DEV_BAN_LINE = {'你說了', '（你說了）'}
MOM_BAN = re.compile(r'我媽|媽媽|傳訊息|叫我帶')   # 以安 D26：全程不能出現（BB 07:33 b）；別的地點只記【觀察】
TREAT = re.compile(r'我請|蛋糕我來|這杯我請|我付|我買給妳')   # 請客的格：記那一格前後祐廷的錢（BB 07:33 e）
AN_D26_MORNING = '早。我買了以前上學路上那家的飯糰，兩個，一個是你的。'
OVERNIGHT = {'D26'}   # 這些地點跑兩天一夜（09:00 出發）；其他照半天 15:00（子晴 15:00 以後才約得到）
# 點的上限：SPOTS 個（預設 3）。點滿 4 個（兩天一夜每天 2 個）時引擎不再出「差不多了」選單，收尾句直接接在最後一個點後面——探針照稿的格數切開，另外印【觀察】
MAXP = SPOTS
for _o in [x for x in ORDER_ENV.split(';') if '=' in x]:
    ORDER[_o.split('=')[0].strip().upper()] = [p.strip() for p in _o.split('=', 1)[1].split('+') if p.strip()]
SUF = '' if SPOTS == 3 else '_s%d' % SPOTS   # tag／json 檔名的尾巴（SPOTS=4 的和預設的分開存）
# 日子：2025 學年大一上的週六（避開 10/06 中秋、10/13 颱風、期中考週；第一個 DATE.check 過的那一天）
DAY_KEYS = ['2025-09-27', '2025-10-04', '2025-10-18', '2025-10-25', '2025-11-22', '2025-11-29', '2025-12-06']
REL = {5: dict(fam=50, trust=30, comf=30, npcRom=40), 6: dict(fam=70, trust=50, comf=45, npcRom=56)}

LOG = open(LINES_TXT, 'a', encoding='utf-8')


def log(s):
    print(s, flush=True); LOG.write(s + '\n'); LOG.flush()


# ---------- 稿（遊戲資料檔 date_lines.js；源稿 date_system/lines/Dxx.json）----------
def js_json(path, marker):
    t = open(path, encoding='utf-8').read()
    i = t.index(marker) + len(marker)
    return json.loads(t[i:t.rindex(';')])


DL = js_json(os.path.join(REF, 'src', 'data', 'date_lines.js'), 'const DATE_LINES=')
try:
    DW = js_json(os.path.join(REF, 'src', 'data', 'date_wish.js'), 'const DATE_WISH=')
except Exception:
    DW = {'events': {}}


try:
    DD = js_json(os.path.join(REF, 'src', 'data', 'date_locations.js'), 'const DATE_DATA=')
except Exception:
    DD = {'locations': {}}


def loc_cfg(loc):
    """地點設定：類別、出發、種類、點的順序（沒有指定的照 date_lines.js 的 points 順序）"""
    ov = loc in OVERNIGHT
    kinds = (((DD.get('locations') or {}).get(loc) or {}).get('kinds') or [])
    day = (not ov) and 'day' in kinds and 'half' not in kinds   # 11-12：一整天（09:00～19:00）的地點 09:00 出發（D24 礁溪等）
    grp = '兩天一夜…' if ov else next((g for g, ids in GROUPS.items() if loc in ids), '其他')
    pts = list(((DL['loc'].get(loc) or {}).get('points') or {}).keys())
    order = [p for p in ORDER.get(loc, []) if p in pts] + [p for p in pts if p not in ORDER.get(loc, [])]
    return dict(group=grp, dep=9 if (ov or day) else 15, kind='overnight' if ov else ('day' if day else 'half'), order=order, wishOf=((DD.get('locations') or {}).get(loc) or {}).get('wishOf'))


LOCS = {k: loc_cfg(k) for k in sorted((DL.get('loc') or {}).keys())}
WISH_LOC = next((k for k, v in (DD.get('locations') or {}).items() if (v or {}).get('wishOf') == ZQ), None) or (((DW.get('events') or {}).get(ZQ) or {}).get('loc'))


def draft_of(loc):
    """源稿（白名單 SHA 的 Dxx.json，照匯入工具先過 import_guard.read_fix）；讀不到＝None"""
    try:
        m = re.search(r"ALLOW_SHA:'([0-9a-f]+)'", open(os.path.join(REF, 'tests', 'date_src_sha.js'), encoding='utf-8').read())
        if not m: return None
        t = subprocess.check_output(['git', '-C', REF, 'show', '%s:docs/story_planning/date_system/lines/%s.json' % (m.group(1), loc)], stderr=subprocess.DEVNULL, text=True)
        try:
            sys.path.insert(0, os.path.join(REF, 'tools', 'story')); import import_guard as IG
            t = IG.read_fix(t)
        except Exception as e:
            log('  （import_guard 讀不到：%s；稿照原字比）' % e)
        return json.loads(t)
    except Exception:
        return None


def zl(loc):
    return ((DL['loc'].get(loc) or {}).get('lines') or {}).get(ZQ) or {}


def shown(ln):
    """一句稿在畫面上的樣子（date3d.js playSet：旁白不是括號開頭的補括號）"""
    tx = ln.get('text', '')
    if ln.get('who') == 'narr': return tx if tx.startswith('（') else '（' + tx + '）'
    return tx


PAGE = {'DEV_NOTE': set(), 'DEV_STRIP': {}}   # 頁面上的 DATE.DEV_NOTE／DEV_STRIP（顯示層拿掉的開發註記；舊版沒有＝空的），main 裡讀


def opt_need(t):
    m = re.search(r'（第 ?(\d+) ?階以上[^）]*）$', t or '')
    return int(m.group(1)) if m else 0


def opt_text(t):
    return re.sub(r'（第 ?\d+ ?階以上[^）]*）$', '', t or '')


def resolve_pick(rule, texts):
    """選項選法 → 第幾個（rule：數字或字）"""
    if not texts: return None
    if isinstance(rule, str):
        return next((i for i, t in enumerate(texts) if rule in t), 0)
    return min(int(rule), len(texts) - 1)


def set_lines(st, pick=None, ctx=None):
    """一套 {lines, choice} → 畫面上會出的句子（note、DEV_NOTE 不出；DEV_STRIP 換字）；選項照 date3d.js 的 optOk 擋「（第 N 階以上）」、optText 去尾巴；
    pick＝選法（數字／字；None＝不選）。回傳 [(who, 字)…]；選項清單記在 st['_opts']（給 log）"""
    def ok(x): return x and x.get('who') != 'note' and x.get('text') not in PAGE['DEV_NOTE']
    def sh(x): return shown(dict(x, text=PAGE['DEV_STRIP'].get(x.get('text'), x.get('text'))))
    out = [(x.get('who'), sh(x)) for x in (st or {}).get('lines') or [] if ok(x)]
    def opt_ok(t):
        n = opt_need(t) if PAGE.get('optGate') else 0
        return not n or bool(ctx and (ctx.get('dating') or (ctx.get('stage') or 0) >= n))
    ch = [c for c in (st or {}).get('choice') or [] if c and isinstance(c.get('t'), str) and c['t'].strip() and opt_ok(c['t'])]
    if ch and pick is not None:
        texts = [opt_text(c['t']) if PAGE.get('optGate') else c['t'] for c in ch]
        c = ch[resolve_pick(pick, texts)]
        rep = c.get('reply')
        if not isinstance(rep, list):
            rr = c.get('re'); rr = [] if rr is None else (rr if isinstance(rr, list) else [rr])
            rep = [{'who': 'narr', 'text': x} if re.match(r'^（.*）$', x) else {'who': ZQ, 'text': x} for x in rr if isinstance(x, str) and x.strip()]
        out += [(x.get('who'), sh(x)) for x in rep if ok(x)]
    return out


def pick_set(pool, tier, key, recent):
    """date3d.js S.pickSet：能用的套（{lastDrink} 的套 TASTE_WORD 還沒有＝跳過）→ 照階段 tier → 最近 3 套（m.recent）以外的第一個；都用過＝最久以前用的。回傳 (那一套, key#i)"""
    allp = [(x, '%s#%d' % (key, i)) for i, x in enumerate(pool or []) if isinstance(x, dict) and isinstance(x.get('lines'), list) and '{lastDrink}' not in json.dumps(x.get('lines'), ensure_ascii=False)]
    ok = [o for o in allp if not o[0].get('tier') or o[0].get('tier') in ('any', tier)] or allp
    if not ok: return None, None
    fresh = [o for o in ok if o[1] not in recent]
    c = fresh[0] if fresh else sorted(ok, key=lambda o: recent.index(o[1]))[0]
    return c


def first_tier(pool, tier):
    ok = [x for x in (pool or []) if not x.get('tier') or x.get('tier') in ('any', tier)]
    if not ok: ok = list(pool or [])
    return ok[0] if ok else None


def exp_opts(loc, seg, pid, ctx):
    """這一段該出的選項（擋掉「（第 N 階以上）」沒到的、去掉尾巴）；沒有＝[]"""
    _, S = expect(loc, seg, pid, ctx)
    ch = [c for c in (S or {}).get('choice') or [] if c and isinstance(c.get('t'), str) and c['t'].strip()]
    if PAGE.get('optGate'):
        ch = [c for c in ch if not opt_need(c['t']) or ctx.get('dating') or (ctx.get('stage') or 0) >= opt_need(c['t'])]
        return [opt_text(c['t']) for c in ch]
    return [c['t'] for c in ch]


def want_of(loc, seg, pid, ctx):
    """這一段畫面上該出的句子：(格名, [字…])。互動點：那一格（含選項回話，選法 PICKS／PICK）＋第 6 階或交往中的「extra:合照」（noPair 是不分地點的短句，另外算）"""
    slot, S = expect(loc, seg, pid, ctx)
    rule = PICKS.get(pid, PICK) if pid else PICK
    w = [t for _, t in set_lines(S, rule, ctx)]
    if seg == 'spot' and pid and (ctx.get('dating') or (ctx.get('stage') or 0) >= 6):
        H = (zl(loc).get('hotspots') or {}).get(pid) or {}
        xk = next((k for k in H if k.startswith('extra:合照')), None)
        if xk:
            x = H[xk]; x = pick_set(x, ctx['tier'], pid + '.extra', ctx.get('recent') or [])[0] if isinstance(x, list) else x
            w += [t for _, t in set_lines(x, PICK, ctx)]
    return slot, w


def used_key(loc, seg, pid, ctx):
    """這一段用掉的 pickSet key（judge 之後推進 recent，照 date3d.js：拿掉再放最後、最多 3 個）"""
    slot, S = expect(loc, seg, pid, ctx)
    if slot not in ('dating', 'normal'): return None
    if seg in ('arrive', 'close'):
        A = zl(loc).get('arrive' if seg == 'arrive' else 'closing') or {}; pool, key = A.get(slot), ('arrive' if seg == 'arrive' else 'close') + '.' + slot
    else:
        H = (zl(loc).get('hotspots') or {}).get(pid) or {}; pool, key = H.get(slot), pid + '.' + slot
    return pick_set(pool, ctx['tier'], key, ctx.get('recent') or [])[1]


def push_recent(ctx, k):
    if not k: return
    r = [x for x in (ctx.get('recent') or []) if x != k] + [k]
    ctx['recent'] = r[-3:]


def expect(loc, seg, pid, ctx):
    """照 date3d.js 的選句順序算這一段該出的那一格：回傳 (格名, 那一套)。ctx：visits、dating、stage、tier、picks、last"""
    Z = zl(loc)
    if seg in ('arrive', 'close'):
        A = Z.get('arrive' if seg == 'arrive' else 'closing') or {}
        if not ctx['visits'] and A.get('first') and not A['first'].get('wishEvent'): return 'first', A['first']
        k0 = 'arrive' if seg == 'arrive' else 'close'
        if ctx['dating'] and A.get('dating'): return 'dating', pick_set(A['dating'], ctx['tier'], k0 + '.dating', ctx.get('recent') or [])[0]
        return 'normal', pick_set(A.get('normal'), ctx['tier'], k0 + '.normal', ctx.get('recent') or [])[0]
    H = (Z.get('hotspots') or {}).get(pid) or {}
    before = pid in ctx['picks']
    hi = ctx['dating'] or (ctx.get('stage') or 0) >= 6
    if not before and H.get('first') and not H['first'].get('wishEvent'):
        if hi and H.get('firstHigh'):
            fh = H['firstHigh']; return 'firstHigh', (fh[0] if isinstance(fh, list) and fh else fh)
        return 'first', H['first']
    if (ctx['visits'] == 1 or pid in ctx['last']) and H.get('remember'): return 'remember', H['remember']
    if ctx['dating'] and H.get('dating'): return 'dating', pick_set(H['dating'], ctx['tier'], pid + '.dating', ctx.get('recent') or [])[0]
    likes = ((DL['loc'][loc].get('likes') or {}).get(ZQ) or {})
    if likes.get(pid) == 'dislike':
        dl = ((DL['loc'][loc].get('dislikeLine') or {}).get(ZQ) or {}).get(pid)
        if dl: return 'dislike', {'lines': [{'who': ZQ, 'text': dl}]}
    return 'normal', pick_set(H.get('normal'), ctx['tier'], pid + '.normal', ctx.get('recent') or [])[0]


def leaves(x, p, o):
    if isinstance(x, list):
        for i, v in enumerate(x): leaves(v, p + '/' + str(i), o)
    elif isinstance(x, dict):
        for k, v in x.items(): leaves(v, p + '/' + k, o)
    else: o[p] = x
    return o


def text_index(obj, pre):
    """{畫面上的字: [稿裡的位置…]}（旁白補括號後的樣子也收）"""
    idx = {}
    for k, v in leaves(obj, pre, {}).items():
        if not isinstance(v, str) or not (k.endswith('/text') or k.endswith('/t') or '/re' in k or '/dislikeLine/' in k): continue
        for s in {v, v if v.startswith('（') else '（' + v + '）'}:
            idx.setdefault(s, []).append(k)
    return idx


def common_lines():
    s = set()
    for k, v in ((DL.get('lines') or {}).get(ZQ) or {}).items():
        for x in (v if isinstance(v, list) else [v]):
            if isinstance(x, str): s.add(x)
            elif isinstance(x, list): s.update(y for y in x if isinstance(y, str))
    return s


COMMON = common_lines()   # 頁面上 DATE.EXTRA_LINES（date3d.js 寫死的短句：以安、語彤的 depart／enough……）在 main 裡補進來
WISH_IDX = text_index((DW.get('events') or {}).get(ZQ) or {}, '/wish')


# ---------- 頁面上的掛勾（只記不改）----------
HOOK = r"""(()=>{ if(!window.__ZQH){ window.__ZQH=1; window.__ZE=[]; const n=()=>window.__ZE.length;
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__ZE.push({k:'say',i:n(),who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day,m:GAME.G.money|0}); }catch(e){} return s0.apply(this,arguments); };
  if(GAME.money){ const m0=GAME.money; GAME.money=function(d,lab){ const b=GAME.G.money|0; const r=m0.apply(this,arguments); try{ window.__ZE.push({k:'money',i:n(),amt:d,label:String(lab==null?'':lab),before:b,after:GAME.G.money|0,h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day}); }catch(e){} return r; }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(a,b){ try{ window.__ZE.push({k:'cap',i:n(),t:String(b==null?a:b),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day}); }catch(e){} return p0.apply(this,arguments); }; }
  const c0=GAME.choose; GAME.choose=function(o){ const rec={k:'ch',i:n(),opts:(o||[]).map(x=>typeof x==='string'?x:((x&&x.t)||'')),dim:(o||[]).map(x=>!!(x&&x.dim)),h:+(+GAME.G.hour).toFixed(3),pick:null};
    try{ window.__ZE.push(rec); }catch(e){} const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=k; }); }catch(e){} return p; }; }
  window.__ZE=[]; return true; })()"""

ST = r"""(()=>{ const D=GAME.D||{}, ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), nm=document.getElementById('dlgName');
  const B=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null):[];
  const E=window.__ZE||[]; let last=null; for(let i=E.length-1;i>=0;i--) if(E[i].k==='ch'){ last=E[i]; break; }
  const T=(GAME.G.trips||[]).slice(-1)[0]||null;
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(b=>(b.textContent||'').trim().slice(0,40)), ch:last&&last.pick==null?{i:last.i,opts:last.opts,dim:last.dim}:null,
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), adv:!!(typeof ADV!=='undefined'&&ADV.active), zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3),
    trip:T?{id:T.trip,status:T.status,locs:T.locs,depart:T.depart,kind:T.kind,night:T.night||null,spots:T.spots||[]}:null, busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy),
    bg:(typeof ADV!=='undefined'&&ADV.active&&ADV.bg)?String(ADV.bg.style.backgroundImage||'').replace(/^.*\//,'').replace(/["')]+$/,''):''}; })()"""


async def st(pg):
    return await pg.evaluate(ST)


async def tap_btn(pg, cdp, i):
    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", i)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); return True


class Menu:
    """選單剛出來 350 ms 內的點擊會被吃掉：同一組選項看到 ≥ 550 ms 才點；點了 2.5 秒還在＝再點一次"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.55


SEEN = set()   # 這一趟畫面上看過的每一行字（document.body.innerText，看得到的才有）：開發註記、媽媽那類字用


async def scan(pg):
    try:
        t = await pg.evaluate("(document.body&&document.body.innerText)||''")
        for x in t.split('\n'):
            x = x.strip()
            if x: SEEN.add(x)
    except Exception:
        pass


async def tap_dlg(pg, cdp, s, screen):
    """打字機：同一句長出來不算換句；打完才記、才翻頁（2 秒還沒打完就點一下＝補完）"""
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(300); s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']:
            await pg.wait_for_timeout(1700); s2 = await st(pg)
            if s2['typing'] and s2['shown'] != s2['full']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); s2 = await st(pg)
        s = s2
    if s['dlg'] and s['full'] and (not screen or screen[-1][:2] != [s['name'], s['full']]):
        screen.append([s['name'], s['full'], s.get('bg') or '', s['hour']])
        await scan(pg)
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)
    return s


async def pick_word(pg, cdp, menu, words, max_s=60, screen=None):
    """等選單，點第一個「字含 words 裡某一個」的選項（照 words 的順序優先）；回傳點到的字"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['phone'] and s['nb']: await L.phone_away(pg, cdp); continue
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            for w in words:
                k = next((i for i, o in enumerate(s['ch']['opts']) if (w(o) if callable(w) else w in o)), None)
                if k is not None:
                    await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(700); return s['ch']['opts'][k]
            return None
        if s['dlg']: await tap_dlg(pg, cdp, s, screen if screen is not None else []); continue
        await pg.wait_for_timeout(400)
    return None


async def idle(pg, cdp, screen, max_s=40):
    """點掉對話直到沒有對話、沒有選單"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['phone']: await L.phone_away(pg, cdp); continue
        if s['nb']: return s
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        await pg.wait_for_timeout(500)
        s = await st(pg)
        if not s['dlg'] and not s['nb']: return s
    return await st(pg)


# ---------- 前置 ----------
async def base(pg, day, hour, dating, stage, extra=None):
    flags = {'introDone': True, 'campusIntro': True, 'classDone': True}
    if dating: flags['dating_' + ZQ] = True
    wd = await pg.evaluate("(d=>{ const x=CALENDAR.dateOf(d); return x?((x.wd%7)+7)%7:0; })", day)
    stt = {'zone': 'dorm', 'day': day, 'weekday': wd, 'hour': hour, 'weather': 'sunny', 'money': 40000, 'flags': flags}
    if extra and extra.get('G'):
        stt = extra['G']; stt['day'] = day; stt['weekday'] = wd; stt['hour'] = hour; stt['zone'] = 'dorm'; stt['weather'] = 'sunny'; stt.pop('pos', None); stt.pop('trip', None)
    await L.load_state(pg, stt, quiet_events=True)
    await pg.wait_for_timeout(2500)
    await L.phone_away(pg, cdp_of[pg])
    rel = REL[stage]
    r = await pg.evaluate("""(([id,rel,dating])=>{ const G=GAME.G; G.contacts=G.contacts||{}; G.contacts[id]=1; const r=SOCIAL.rel(id); Object.assign(r,rel);
      if(dating) G.flags['dating_'+id]=true; else delete G.flags['dating_'+id];
      return {stage:DATE.stageNum(id), r:{fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom}, dating:!!G.flags['dating_'+id], date:(CALENDAR.dateOf(G.day)||{}), hour:G.hour, weather:G.weather}; })""", [ZQ, rel, dating])
    return r


cdp_of = {}


async def choose_day(pg, loc, cfg, stage, dating):
    """DAY_KEYS 裡第一個 DATE.check 過的日子（只讀；臨時的 G 複本）"""
    out = await pg.evaluate("""(([id,loc,dep,kind,keys,rel,dating])=>{ const r=SOCIAL.rel(id); Object.assign(r,rel); const res=[];
      for(const k of keys){ const d=STORY.dayOfKey(k); const T=CALENDAR.termOf?CALENDAR.termOf(d):null; const G2=Object.assign({},GAME.G,{day:d,hour:dep-2,weather:'sunny',money:40000,flags:Object.assign({},GAME.G.flags,dating?{['dating_'+id]:true}:{})});
        const tr=((DATE.loc(loc)||{}).transport||[])[0]; const c=DATE.check(G2,{who:id,locs:[loc],day:d,depart:dep,kind:kind==='overnight'?'overnight':undefined,transport:tr&&tr.mode});
        res.push({k,d,ok:!!c.ok,why:c.why||'',warns:c.warns||[],exam:!!(T&&T.exam),week:T&&T.week}); if(c.ok&&!(T&&T.exam)) return {pick:{k,d},res}; }
      return {pick:null,res}; })""", [ZQ, loc, cfg['dep'], cfg['kind'], DAY_KEYS, REL[stage], dating])
    return out


async def set_memory(pg, loc, count, byloc, picks, last, wish_done, recent=None):
    return await pg.evaluate("""(([id,loc,count,byloc,picks,last,wd,rc])=>{ const G=GAME.G; DATE.rec(G); const L=DATE.log(G,id); L.count=count; L.byLoc[loc]=byloc;
      if(wd){ L.wish=true; L.wishKnown=true; G.flags['WISH_DONE_'+id]=true; }
      const m=DATE.mem(G,id,loc); m.picks=picks.slice(); m.last=last.slice(); m.recent=(rc||[]).slice(); m.optN={};
      return {count:L.count, byLoc:L.byLoc, wish:L.wish, mem:{picks:m.picks,last:m.last,recent:m.recent}, tier:DATE.tierOf(G,id)}; })""", [ZQ, loc, count, byloc, picks, last, wish_done, recent or []])


# ---------- 預約、出發、約會 ----------
async def book(pg, cdp, loc, cfg, screen):
    menu = Menu(); how = '手機「朋友」→ 子晴「約」'
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(900)
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % ZQ
    if await pg.evaluate("s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; }", sel):
        await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    else:
        body = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        R.setup('手機「朋友」沒有子晴的「約」（%s）→ 退回 INV.flow 開同一個選單【捷徑】' % body[:120].replace('\n', ' '))
        await L.close_panels(pg, cdp); await pg.evaluate("void INV.flow(GAME,%s,null,false)" % J(ZQ)); how = 'INV.flow【捷徑】'
    if (await st(pg))['phone'] and (await st(pg))['nb']: await L.phone_away(pg, cdp)
    name = await pg.evaluate("(l=>DATE.loc(l).name)", loc)
    steps = []
    got = await pick_word(pg, cdp, menu, ['出去玩'], screen=screen); steps.append(got)
    for _ in range(4):   # 類別 → 地點（她說過想去的、一類只有一個＝直接列地點）
        s = await st(pg)
        opts = (s['ch'] or {}).get('opts') or []
        if any(o.startswith('今天') for o in opts) or any('單程約' in o or '高鐵' in o for o in opts): break
        got = await pick_word(pg, cdp, menu, [name, cfg['group']], screen=screen); steps.append(got)
        if got == name or got is None: break
    s = await st(pg); opts = (s['ch'] or {}).get('opts') or []
    if opts and not any(o.startswith('今天') for o in opts) and not any(o.startswith('算了') for o in opts[:1]):
        got = await pick_word(pg, cdp, menu, [lambda o: True], screen=screen); steps.append('交通：' + str(got))   # 交通（她想這樣去的排第一＝預設；D26 高鐵）
    steps.append(await pick_word(pg, cdp, menu, [lambda o: o.startswith('今天')], screen=screen))
    hh = ('%02d:00' % cfg['dep'], '%d:00' % cfg['dep'])
    steps.append(await pick_word(pg, cdp, menu, [lambda o: o.startswith(hh)], screen=screen))
    steps.append(await pick_word(pg, cdp, menu, ['就這樣約'], screen=screen))
    await idle(pg, cdp, screen, 30)
    trip = await pg.evaluate("((GAME.G.trips||[]).slice(-1)[0])||null")
    return how, steps, trip


async def skip_to(pg, cdp, target):
    """手機「今天」→「跳過時間」裡不超過 target 的最後一個；回傳點了哪個（None＝沒有能點的）"""
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(900)
    bs = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>({v:+b.dataset.skip,t:(b.textContent||'').trim()}))")
    ok = [b for b in bs if b['v'] <= target + 1e-3]
    if not ok: await L.close_panels(pg, cdp); return None, bs
    b = max(ok, key=lambda x: x['v'])
    await L.tap(pg, cdp, '#phoneBody [data-skip="%s"]' % ('%.3f' % b['v'])); await pg.wait_for_timeout(1500)
    return b['t'], bs


async def depart(pg, cdp, cfg, screen, max_s=420):
    """等出發：能跳就用手機的跳過時間跳到出發前 1 小時（提醒＝「現在出發」），之後點「現在出發」或「出發」"""
    menu = Menu(); t0 = time.time(); skipped = []; said = None
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['trip'] and s['trip']['status'] in ('going', 'done') : return said or 'going', skipped
        if s['phone'] and not s['nb']: await L.phone_away(pg, cdp); continue
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['ch']['opts']
            k = next((i for i, o in enumerate(opts) if o == '現在出發'), None)
            if k is None: k = next((i for i, o in enumerate(opts) if o == '出發'), None)
            if k is None:
                log('  ！等出發時出現別的選單：%s → 選第一個' % J(opts)); k = 0
            said = opts[k]; await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        tgt = cfg['dep'] - 1
        if s['hour'] < tgt - 0.25 and len(skipped) < 3 and not any(x.get('wait') for x in skipped):
            t, bs = await skip_to(pg, cdp, tgt); skipped.append({'from': s['hour'], 'tap': t, 'buttons': [b['t'] for b in bs]})
            log('  手機「今天」跳過時間：%s（可以點的 %s）' % (t, J([b['t'] for b in bs])))
            if t is None: skipped[-1]['wait'] = True; log('  沒有不超過出發前 1 小時的跳過鍵：等遊戲時間自己走（%.2f → %.2f）' % (s['hour'], tgt))
            continue
        await pg.wait_for_timeout(1000)
    return None, skipped


async def play(pg, cdp, cfg, screen, shots_tag, max_s=900, close_first=None, s4name=None):
    """約會本身：選單照 cfg['order'] 選互動點，互動點的選項選 PICK，快速約會選「自己選」；回傳選過的"""
    menu = Menu(); t0 = time.time(); picked = []; nshot = [0]; stopped = False; want = [None]
    async def maybe_shot(full):
        # 每格一張以內：選了互動點以後的第一句（再訪格、交往格都在這裡）、肢體句、晚上那句
        if nshot[0] >= (60 if SHOT_ALL else 12): return
        tag = want[0] or ('contact' if CONTACT.search(full) else ('night' if full.startswith('（晚上') else None)) or ('L%02d' % (nshot[0] + 1) if SHOT_ALL else None)
        if not tag: return
        want[0] = None; nshot[0] += 1; await R.shot(pg, '%s_%s' % (shots_tag, tag))
    done_t = None
    while time.time() - t0 < max_s:
        s = await st(pg)
        tr = s['trip'] or {}
        if tr.get('status') in ('done', 'cancelled') and not s['dlg'] and not s['nb'] and not s['adv']:
            if done_t is None: done_t = time.time()
            if time.time() - done_t > 3: break
            await pg.wait_for_timeout(500); continue
        done_t = None
        if s['phone']: await L.phone_away(pg, cdp); continue
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts, dim = s['ch']['opts'], s['ch']['dim']
            if opts and opts[-1] in STOPS:
                left = opts[:-1]; k = None
                if len(picked) < MAXP:
                    for pid in cfg['order']:
                        nm = cfg['names'][pid]
                        if nm in left and not dim[left.index(nm)] and pid not in picked: k = left.index(nm); picked.append(pid); want[0] = pid.split('.')[-1]; break
                if k is None: k = len(opts) - 1; stopped = True
                log('  [選互動點] %s → %s' % (J(opts), opts[k]))
            elif opts and opts[0] == '自己選':
                k = 0; log('  [快速約會] %s → 自己選' % J(opts))
            elif '現在出發' in opts or '出發' in opts:
                k = opts.index('現在出發') if '現在出發' in opts else opts.index('出發')
            elif any('告訴她' in o for o in opts):
                k = next(i for i, o in enumerate(opts) if '告訴她' not in o); log('  ！出現告白選項 %s → 不說' % J(opts))
            else:
                rule = PICKS.get(picked[-1], PICK) if picked else PICK
                k = resolve_pick(rule, opts); log('  [選項] %s → %s（選法 %s）' % (J(opts), opts[k], rule))
            await scan(pg)
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(800); continue
        if s['dlg']:
            n0 = len(screen); s2 = await tap_dlg(pg, cdp, s, screen)
            if len(screen) > n0 and s4name and close_first and len(picked) >= 4 and s2['full'] in close_first:
                await pg.screenshot(path=os.path.join(OUT, s4name + '.png')); log('  截圖 %s.png（點滿四個以後收尾那一句）' % s4name); s4name = None
            elif len(screen) > n0: await maybe_shot(s2['full'])
            continue
        await pg.wait_for_timeout(500)
    return picked, stopped


# ---------- 分析 ----------
def segments(ev, locname):
    """事件 → 段落：arrive（地點那一行到第一個互動點選單）、spot:<pid>（選了以後到下一個選單）、close（停的選項以後到結算）、night、morning、other"""
    segs = []; cur = ('pre', None); buf = []
    def flush():
        if buf or cur[0] != 'pre': segs.append((cur[0], cur[1], list(buf)))
    for e in ev:
        if e['k'] == 'say':
            t = e['t']
            if t == '（' + locname + '。）': flush(); buf = []; cur = ('arrive', None); continue
            if t.startswith('（晚上'): flush(); buf = [e]; cur = ('night', None); continue
            if t == '（第二天早上。）': flush(); buf = []; cur = ('morning', None); continue
            if t.startswith('（今天去了') or t.startswith('（這兩天去了'): flush(); buf = []; cur = ('settle', None); continue
            buf.append(e)
        elif e['k'] in ('cap', 'money'):
            buf.append(e)
        elif e['k'] == 'ch':
            opts = e['opts']; k = e.get('pick')
            if opts and opts[-1] in STOPS and k is not None:
                flush(); buf = []
                cur = ('close', None) if k >= len(opts) - 1 else ('spot', opts[k])
            else:
                buf.append(e)
    flush()
    return segs


def src_morning(who):
    """date3d.js 原始碼裡 S.MORNING 這個人那一句（照程式算預期，不看頁面）"""
    try:
        t = open(os.path.join(REF, 'src', 'date3d.js'), encoding='utf-8').read()
        m = re.search(r"S\.MORNING=\{(.*?)\};", t, re.S)
        x = m and re.search(who + r":'([^']*)'", m.group(1))
        return x.group(1) if x else None
    except Exception:
        return None


async def analyze(pg, tag, loc, stage, dating, ctx, ev, screen, picked, names, exp):
    """逐句比稿、算格、肢體句、再訪、晚上／早上／回程；回傳表格的一列。exp＝出發前照 date3d.js 算的預期（晚上、早上、回程字幕）"""
    who_names = set(await pg.evaluate("(id=>[SOCIAL.displayName(id),(CHARACTERS[id]||{}).name].filter(Boolean))", ZQ))
    locname = await pg.evaluate("(l=>DATE.loc(l).name)", loc)
    Z = zl(loc); IDX = text_index({'lines': Z, 'dislikeLine': ((DL['loc'][loc].get('dislikeLine') or {}).get(ZQ) or {})}, '/' + loc); DIDX = None
    nondating = {t for t, ks in IDX.items() if any('/dating/' not in k for k in ks)}
    # 11-14 BB-C（BB_379 027fc1a3b4，DATE35_PS_ARR TEST_BUG）：D04／D05 看電影是 date3d.js 的固定段落（S.fixedOf），旁白「（看電影。）」不在 date_lines.js 格子裡——放行
    FIXED = set(await pg.evaluate("""(l=>{ const out=[]; const f=(typeof DATE!=='undefined'&&DATE.fixedOf)?DATE.fixedOf(l):null; const walk=v=>{ if(typeof v==='string'){ if(v.startsWith('（')) out.push(v); } else if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v==='object') Object.values(v).forEach(walk); }; walk(f); if(f) out.push('（看電影。）'); return out; })""", loc) or [])
    if FIXED: log('  固定段落（不算格子、放行）：%s' % J(sorted(FIXED)))
    dr = draft_of(loc)
    if dr is not None: DIDX = text_index({'lines': ((dr.get('lines') or {}).get(ZQ) or {}), 'dislikeLine': ((dr.get('dislikeLine') or {}).get(ZQ) or {})}, '/' + loc)
    else: log('  （源稿讀不到＝只和遊戲資料檔 date_lines.js 比）')
    rev_name = {v: k for k, v in names.items()}
    def mine(e): return e.get('cid') == ZQ or any((e.get('who') or '').startswith(n) for n in who_names)
    log('== %s 逐句（%s｜說話人｜遊戲時間｜原文）' % (tag, ZQ))
    for e in ev:
        if e['k'] == 'say': log('  %s｜第%s天 %05.2f｜%s' % (e['who'] or '（旁白）', e['d'], e['h'], e['t']))
        elif e['k'] == 'cap': log('  ［字幕］第%s天 %05.2f｜%s' % (e['d'], e['h'], e['t']))
        elif e['k'] == 'money': log('  ［錢］第%s天 %05.2f｜%+d（%s）%d → %d' % (e['d'], e['h'], e['amt'], e['label'], e['before'], e['after']))
        else: log('  ［選單］%s → %s' % (J(e['opts']), e['opts'][e['pick']] if e.get('pick') is not None and e['pick'] < len(e['opts']) else e.get('pick')))
    segs = segments(ev, locname)
    has_close = any(k == 'close' for k, _, _ in segs)
    last_spot = max([i for i, (k, a, _) in enumerate(segs) if k == 'spot' and rev_name.get(a)] or [-1])
    n_her = 0; n_dating = 0; contact = []; nd_contact = []; remember = []; night = None; morning = None; bad_draft = []; bad_data = []; slot_rows = []; joined = None
    vis = {'visits': ctx['visits'], 'dating': dating, 'stage': stage, 'tier': ctx['tier'], 'picks': list(ctx['picks']), 'last': list(ctx['last']), 'recent': list(ctx.get('recent') or [])}
    SUN = await pg.evaluate("(d=>DATE.sunset?DATE.sunset(d):'')", ctx.get('day') or 0) or '\u0000'   # {sunset}（淡水日落）在 GM.say 以前就換掉了
    treat_rows = []; nch = [0]

    def judge(seg, pidv, body, label=None, buf=None):
        nonlocal n_her, n_dating
        eo = exp_opts(loc, seg, pidv, vis)
        slot, wt = want_of(loc, seg, pidv, vis); gt = [e['t'] for e in body]
        uk = used_key(loc, seg, pidv, vis)
        wt = [t.replace('{sunset}', SUN) for t in wt]
        nm = label or '%s%s' % (seg, (':' + pidv) if pidv else '')
        R.check('[%s] %s＝%s 格（逐句 %d 句）' % (tag, nm, slot, len(wt)), gt == wt, J({'want': wt, 'got': gt}))
        chs = [e for e in (buf or []) if e['k'] == 'ch' and not (e['opts'] and e['opts'][0] == '自己選')]
        if eo or chs:
            nch[0] += 1
            R.check('[%s] %s 選項有跳出來、字＝稿（擋掉沒到階段的、去掉「（第 N 階以上）」）' % (tag, nm), bool(chs) and chs[0]['opts'] == eo,
                    J({'want': eo, 'got': chs[0]['opts'] if chs else None, 'picked': (chs[0]['opts'][chs[0]['pick']] if chs and chs[0].get('pick') is not None else None)}))
        if buf is not None:
            txt = [e['t'] for e in buf if e['k'] == 'say'] + [e['opts'][e['pick']] for e in chs if e.get('pick') is not None and e['pick'] < len(e['opts'])]
            if any(TREAT.search(t) for t in txt):
                says = [e for e in buf if e['k'] == 'say']
                mon = [[e['amt'], e['label'], e['before'], e['after']] for e in buf if e['k'] == 'money']
                row = {'seg': nm, 'treat': [t for t in txt if TREAT.search(t)], 'money_events': mon, 'money_first_line': says[0]['m'] if says else None, 'money_last_line': says[-1]['m'] if says else None}
                treat_rows.append(row)
        slot_rows.append({'seg': nm, 'slot': slot, 'n': len(gt), 'got': gt, 'ok': gt == wt})
        if seg == 'spot' and pidv and pidv not in vis['picks']: vis['picks'].append(pidv)
        push_recent(vis, uk)
        if slot == 'dating': n_dating += len(gt)
        if slot == 'remember' and gt == wt: remember.append(nm)
        for e in body:
            n_her += 1
            if CONTACT.search(e['t']): (nd_contact if e['t'] in nondating else contact).append([nm, slot, e['t']])
            tk = e['t'].replace(SUN, '{sunset}') if SUN and SUN in e['t'] else e['t']
            if tk not in IDX: bad_data.append([nm, e['t']])
            elif DIDX is not None and tk not in DIDX: bad_draft.append([nm, e['t']])
        return wt

    for i, (kind, arg, buf) in enumerate(segs):
        lines = [e for e in buf if e['k'] == 'say' and not SYS_NARR.search(e['t']) and e['t'] not in FIXED and (mine(e) or (not e['who'] and e['t'].startswith('（')))]
        if kind in ('pre', 'settle', 'other'): continue
        if kind == 'night':
            night = buf[0]['t'] if buf else None; continue
        if kind == 'morning':
            morning = [e['t'] for e in lines if mine(e)]; continue
        if kind == 'spot':
            pid = rev_name.get(arg)
            if pid is None: continue
            en = [e for e in lines if e['t'] in COMMON]   # 第三個點之後的 enough（不分地點）
            body = [e for e in lines if e not in en]
            if en: log('  [%s] spot:%s 後面多一句 enough（不分地點的短句）：%s' % (tag, pid, J([e['t'] for e in en])))
            if i == last_spot and not has_close:   # 點滿：收尾句直接接在最後一個點後面——照稿的格數切開
                n = len(want_of(loc, 'spot', pid, vis)[1])
                judge('spot', pid, body[:n], None, buf)
                rest = body[n:]
                judge('close', None, rest, 'close（接在最後一個點後面）')
                joined = {'spot': pid, 'last_spot_line': body[n - 1] if n and len(body) >= n else None, 'close_first': rest[0] if rest else None}
            else:
                judge('spot', pid, body, None, buf)
        else:
            judge(kind, None, lines, 'close（回程前離開那一句）' if kind == 'close' and ctx.get('overnight') else None, buf)
    # 1. 逐字在資料、稿裡
    R.check('[%s] 1a %s的句子、約會旁白都在遊戲資料 date_lines.js（%s 的格子）裡一字不差' % (tag, ZQ, loc), not bad_data, J(bad_data))
    if DIDX is not None: R.check('[%s] 1b 也都在源稿 %s.json（白名單版）裡' % (tag, loc), not bad_draft, J(bad_draft))
    other = [e['t'] for e in ev if e['k'] == 'say' and mine(e) and e['t'].replace(SUN, '{sunset}') not in IDX and e['t'] not in COMMON and e['t'] not in (morning or []) and e['t'] not in WISH_IDX]
    R.check('[%s] 1c 約會以外她說的（答應、出發訊息、差不多了）都在不分地點的短句（lines.%s／DATE.EXTRA_LINES）裡' % (tag, ZQ), not other, J(other))
    # 3. 肢體句、交往格
    vis_pids = [r['seg'].split(':', 1)[1] for r in slot_rows if r['seg'].startswith('spot:')]
    dcells = []
    for pid in vis_pids:
        H = (Z.get('hotspots') or {}).get(pid) or {}
        d = first_tier(H.get('dating'), ctx['tier'] if dating else 'high')
        if d: dcells.append([pid, [t for _, t in set_lines(d, None, vis)]])
    shown_all = {e['t'] for e in ev if e['k'] == 'say'}
    if not dating:
        R.check('[%s] 3a 一般（沒有交往）：沒有牽手／靠肩／拉手這類句子（稿裡非交往格本來就有的另外記）' % tag, not contact, J(contact))
        if nd_contact: log('  [%s] 【觀察】非交往格本來就有的肢體字（不算 FAIL，給 BB 看）：%s' % (tag, J(nd_contact)))
        R.check('[%s] 3b 一般：沒有任何交往格的句子' % tag, n_dating == 0, str(n_dating))
        dating_texts = {v for k, v in leaves(Z, '', {}).items() if '/dating/' in k and isinstance(v, str)}
        dating_texts |= {'（' + v + '）' for v in list(dating_texts) if not v.startswith('（')}
        leak = [t for t in shown_all if t in dating_texts and t not in nondating]
        R.check('[%s] 3c 一般：畫面上沒有出現任何交往格的字（整個 %s 的交往格逐字比）' % (tag, loc), not leak, J(leak))
        R.check('[%s] 3e 一般：點到的 %d 個點的交往格逐字都沒出現' % (tag, len(dcells)), not any(t in shown_all for _, ts in dcells for t in ts), J(dcells))
    else:
        arr = next((r for r in slot_rows if r['seg'] == 'arrive'), None); cl = next((r for r in slot_rows if r['seg'].startswith('close')), None)
        if ctx['visits']:
            R.check('[%s] 3d 交往：抵達、收尾是交往格' % tag, bool(arr and arr['slot'] == 'dating' and cl and cl['slot'] == 'dating'), J([arr and arr['slot'], cl and cl['slot']]))
        want_d = [[p, ts] for p, ts in dcells if p not in ctx['last']]   # 上一次點過的那一個是 remember 格（不出交往格）
        miss = [[p, t] for p, ts in want_d for t in ts if t not in shown_all]
        if ctx['visits']: R.check('[%s] 3f 交往：點到的點（上一次點過的除外）交往格逐字都出現（%d 個點）' % (tag, len(want_d)), not miss, J({'want': want_d, 'miss': miss}))
        log('  [%s] 交往的肢體句（只記）：%s' % (tag, J(contact + nd_contact)))
    # 5. 兩天一夜：晚上、早上、回程
    if ctx.get('overnight'):
        R.check('[%s] 5a 晚上那一句＝照 date3d.js 算的（DATE.NIGHT[nightKind]）：%s' % (tag, exp.get('night')), night == exp.get('night'), J(night))
        if ZQ == 'heroine_04' and loc == 'D26':
            R.check('[%s] 5b 子晴 D26 晚上那一句逐字＝「%s」（一般、交往都是）' % (tag, NIGHT_WANT), night == NIGHT_WANT, J(night))
        sm = src_morning(ZQ)
        R.check('[%s] 5c 早上：「（第二天早上。）」之後她那一句＝照 date3d.js 算的（morningLine）：%s' % (tag, exp.get('morning')), (morning or [])[:1] == [exp.get('morning')], J(morning))
        if exp.get('own') is None and exp.get('mown') is None and sm is not None:
            R.check('[%s] 5d 早上那一句＝date3d.js 原始碼 S.MORNING.%s 的字' % (tag, ZQ), (morning or [])[:1] == [sm], J({'src': sm, 'got': morning}))
        if ZQ == 'heroine_01' and loc == 'D26':
            R.check('[%s] 5f 以安 D26 隔天早上逐字＝「%s」' % (tag, AN_D26_MORNING), (morning or [])[:1] == [AN_D26_MORNING], J(morning))
            R.check('[%s] 5g 以安 D26 晚上那一句逐字＝「%s」' % (tag, NIGHT_WANT), night == NIGHT_WANT, J(night))
        caps = [e['t'] for e in ev if e['k'] == 'cap']
        R.check('[%s] 5e 回程字幕＝行程的 back（%s）' % (tag, exp.get('back')), bool(exp.get('back')) and exp.get('back') in caps, J(caps))
    # 點滿四個：收尾直接接上（【觀察】）
    if joined:
        a = next((k for k, e in enumerate(ev) if e is joined['last_spot_line']), None) if joined['last_spot_line'] else None
        b = next((k for k, e in enumerate(ev) if e is joined['close_first']), None) if joined['close_first'] else None
        mid = ev[a + 1:b] if a is not None and b is not None else []
        sa = next((k for k, x in enumerate(screen) if joined['last_spot_line'] and x[1] == joined['last_spot_line']['t']), None)
        sb = next((k for k, x in enumerate(screen) if joined['close_first'] and x[1] == joined['close_first']['t']), None)
        log('  [%s] 【觀察】點滿 %d 個以後沒有「差不多了」選單，收尾句直接接上（給 BB 判怪不怪）：' % (tag, len(vis_pids)))
        log('      最後一個點（%s）那一句：%s' % (joined['spot'], joined['last_spot_line'] and joined['last_spot_line']['t']))
        log('      中間的事件（say／選單／字幕）：%s' % (J([[x['k'], x.get('who'), x.get('t') or x.get('opts')] for x in mid]) if mid else '沒有'))
        log('      畫面（名字｜全文｜底圖｜時間）：%s' % (J(screen[sa:sb + 1]) if sa is not None and sb is not None else J(screen[-6:])))
        log('      收尾那一句：%s' % (joined['close_first'] and joined['close_first']['t']))
    elif SPOTS >= 4:
        log('  [%s] 【觀察】SPOTS=4 但收尾前出現了選單（點不滿、時間不夠或其他）：點到 %s' % (tag, J(vis_pids)))
    # 7. 請客的格：那一格前後祐廷的錢（BB 07:33 e；只記，判定歸 BB）
    for r in treat_rows:
        log('  [%s] 【觀察】請客的格 %s：說到／選到 %s；這一格扣錢 %s（[金額, 項目, 前, 後]）；那一格第一句時 %s 元、最後一句時 %s 元' % (
            tag, r['seg'], J(r['treat']), J(r['money_events']) if r['money_events'] else '沒有', r['money_first_line'], r['money_last_line']))
    allm = [[e['amt'], e['label']] for e in ev if e['k'] == 'money']
    log('  [%s] 這一趟所有扣錢：%s' % (tag, J(allm)))
    # 8. 畫面上的開發註記（全畫面文字：document.body.innerText 每一步掃＋對話、選項、字幕）
    alltxt = set(SEEN) | {x[1] for x in screen} | {e['t'] for e in ev if e['k'] in ('say', 'cap')} | {o for e in ev if e['k'] == 'ch' for o in e['opts']}
    dev = sorted(t for t in alltxt if t in DEV_BAN_LINE or any(b in t for b in DEV_BAN))
    R.check('[%s] 8 畫面上沒有開發註記（%s、整行「你說了」；掃了 %d 行）' % (tag, '、'.join(DEV_BAN), len(alltxt)), not dev, J(dev))
    mom = sorted(t for t in alltxt if MOM_BAN.search(t))
    if ZQ == 'heroine_01' and loc == 'D26':
        R.check('[%s] 9 以安 D26 全程沒有「我媽、媽媽、傳訊息、叫我帶」' % tag, not mom, J(mom))
    elif mom:
        log('  [%s] 【觀察】畫面上有「我媽／媽媽／傳訊息／叫我帶」（這個地點不判）：%s' % (tag, J(mom)))
    # 10. 子晴 D13「一起拍？」
    if ZQ == 'heroine_04' and loc == 'D13':
        pm = [e['opts'] for e in ev if e['k'] == 'ch' and any('十張' in o for o in e['opts'])]
        hi = dating or stage >= 6
        has = any('一起拍' in o for ops in pm for o in ops)
        R.check('[%s] 10 子晴 D13 拍照選項「一起拍？」%s（第 %d 階、%s交往）' % (tag, '看得到' if hi else '看不到', stage, '' if dating else '沒'), bool(pm) and has == hi, J(pm))
    if nch[0]: log('  [%s] 選項：%d 段有選項' % (tag, nch[0]))
    # 6. 畫面
    badscr = [x for x in screen if '{name}' in x[1] or 'undefined' in x[1] or '{sunset}' in x[1]]
    R.check('[%s] 6a 畫面上的對話框沒有 {name}、undefined（%d 句）' % (tag, len(screen)), not badscr, J(badscr))
    return {'tag': tag, 'loc': loc, 'stage': ('交往' if dating else '一般（第%d階）' % stage), 'visit': ctx['visits'] + 1, 'n': n_her, 'dating': n_dating,
            'contact': len(contact), 'remember': len(remember), 'night': night, 'slots': slot_rows, 'last': list(ctx['last'])}


async def one_date(pg, cdp, errs, tag, loc, stage, dating, visits, picks, last, wish_done=False, keepG=None, day_override=None):
    cfg = dict(LOCS[loc]); cfg['names'] = {k: v for k, v in DL['loc'][loc]['points'].items()}
    log('== %s（%s，%s，第 %d 次去）' % (tag, loc, '交往' if dating else '一般', visits + 1))
    e0 = len(errs)
    if day_override is None:
        await base(pg, 20, 10.0, dating, stage)
        ch = await choose_day(pg, loc, cfg, stage, dating)
        log('  選日子（DATE.check，只讀）：%s' % J(ch['res']))
        if not ch['pick']: R.check('[%s] 找得到能約的日子' % tag, False, J(ch['res'])); return None
        day = ch['pick']['d']; dkey = ch['pick']['k']
    else:
        day, dkey = day_override
    h0 = 7.6 if cfg['kind'] in ('overnight', 'day') else 13.3
    rb = await base(pg, day, h0, dating, stage, keepG)
    R.setup('[%s] 讀檔（applySave、quiet_events）：宿舍、%s（第 %d 天）%.2f 點、晴天、錢 40000；聯絡方式；關係 %s → 第 %s 階；%s' % (
        tag, dkey, day, h0, J(rb['r']), rb['stage'], ('交往中（flags.dating_%s）' % ZQ) if dating else '沒有交往'))
    if keepG is None:
        count = 2 if visits else 0
        rc = PRESET_RECENT.get((ZQ, loc)) if visits else None
        mem = await set_memory(pg, loc, count, visits, picks, last, wish_done, rc)
        R.setup('[%s] 約會紀錄：dateLog 次數 %s、這個地點去過 %s 次、心願 %s；dateMemory 點過 %s、上一次 %s、最近用過 %s（tier %s）' % (tag, mem['count'], visits, mem['wish'], J(picks), J(last), J(mem['mem'].get('recent')), mem['tier']))
    else:
        mem = await pg.evaluate("(([id,loc])=>{ const L=DATE.log(GAME.G,id), m=DATE.mem(GAME.G,id,loc); return {count:L.count, byLoc:L.byLoc, mem:{picks:m.picks,last:m.last,recent:m.recent||[]}, tier:DATE.tierOf(GAME.G,id)}; })", [ZQ, loc])
        R.setup('[%s] 沿用第一次走完的紀錄（沒改）：%s' % (tag, J(mem)))
    ok_stage = (rb['stage'] >= 6) if stage >= 6 else (rb['stage'] == 5)
    R.check('[%s] 前置：階段對（一般＝第 5 階、friend6／兩天一夜＝第 6 階；交往＝flags）' % tag, ok_stage and rb['dating'] == dating, J(rb))
    SEEN.clear()
    m_start = await pg.evaluate("GAME.G.money|0")
    ctx = {'visits': visits, 'stage': stage, 'day': day, 'recent': list(mem['mem'].get('recent') or []), 'tier': mem['tier'], 'picks': list(mem['mem']['picks']), 'last': list(mem['mem']['last']), 'overnight': cfg['kind'] == 'overnight'}
    await pg.evaluate(HOOK)
    screen = []
    how, steps, trip = await book(pg, cdp, loc, cfg, screen)
    R.check('[%s] 預約（%s）：%s；行程 booked、今天 %02d:00 出發' % (tag, how, J(steps), cfg['dep']),
            bool(trip and trip.get('status') == 'booked' and trip.get('locs') == [loc] and abs(trip.get('depart', 0) - cfg['dep']) < 1e-6 and trip.get('day') == day), J(trip))
    if not (trip and trip.get('status') == 'booked'):
        await R.shot(pg, tag + '_book_fail'); return None
    exp = await pg.evaluate("""(([id,tid])=>{ const G=GAME.G, t=DATE.trip(G,tid); if(!t) return {}; const q=OUT.get?OUT.get(G,'date_'+tid):null;
      const own=t.kind==='overnight'?((DATE.overnightWhere(G,id,t.day,t.locs)||{}).own||null):null;
      const nk=t.kind==='overnight'?DATE.nightKind(G,t,own):null, mown=DATE.morningOwn?DATE.morningOwn(own,nk):own;   /* fea448637 起：前一晚回自己家（NIGHT_HOME）＝早上照 MORNING_OWN（S.morningOwn）*/
      return {own, nk, mown:mown||null, night:nk?DATE.NIGHT[nk]:null, morning:nk?DATE.morningLine(id,mown):null, back:q&&q.back||null}; })""", [ZQ, trip['trip']])
    log('  [%s] 出發前照 date3d.js 算的預期（只讀）：%s' % (tag, J(exp)))
    said, skipped = await depart(pg, cdp, cfg, screen)
    R.check('[%s] 出發（%s）' % (tag, said), said is not None, J(skipped))
    if said is None: await R.shot(pg, tag + '_depart_fail'); return None
    cf = None   # 點滿四個時收尾那一句：分析時才知道 recent 推進到哪；這裡用「收尾格的池子裡任何一句」認
    _cz = zl(loc).get('closing') or {}
    close_set = {shown(x) for k, v in leaves(_cz, '', {}).items() if k.endswith('/text') for x in [{'text': v}]}
    sl = 'dating' if dating else ('friend6' if stage >= 6 and cfg['kind'] != 'overnight' else 'friend')
    picked, stopped = await play(pg, cdp, cfg, screen, tag, close_first=close_set or cf, s4name=('zq_%s_%s_4th_close' % (loc, sl)) if SPOTS >= 4 else None)
    s = await st(pg)
    ev = await pg.evaluate("window.__ZE||[]")
    trip = await pg.evaluate("(id=>(GAME.G.trips||[]).find(t=>t.trip===id)||null)", s['trip']['id'] if s['trip'] else '')
    lg = await pg.evaluate("(id=>DATE.log(GAME.G,id))", ZQ)
    R.check('[%s] 約會走完：行程 done、算一次（次數 %s）、點了 %s' % (tag, lg.get('count'), J(picked)), bool(trip and trip.get('status') == 'done' and trip.get('counted')), J({'trip': trip and {k: trip.get(k) for k in ('status', 'counted', 'spots', 'night')}}))
    await R.shot(pg, tag + '_end')
    m_end = await pg.evaluate("GAME.G.money|0")
    log('  [%s] 祐廷的錢：讀檔後 %d → 走完 %d（差 %d；含來回車資、門票、互動點）' % (tag, m_start, m_end, m_end - m_start))
    row = await analyze(pg, tag, loc, stage, dating, ctx, ev, screen, picked, cfg['names'], exp)
    R.check('[%s] 6b 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'tag': tag, 'row': row, 'ev': ev, 'screen': screen, 'trip': trip, 'log': lg, 'steps': steps, 'skipped': skipped}, open(os.path.join(OUT, 'zq_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return row


async def wish_part(pg, cdp, errs, tag='WISH_friend'):
    """WISH：她的心願地點第一次（一般第 5 階；子晴＝D03 參創）＝心願事件整場；每一句都要在 date_wish.js events.<WHO> 或那個地點的格子／不分地點的短句裡"""
    loc = WISH_LOC
    if not loc: log('  %s 沒有心願地點：跳過' % ZQ); return None
    cfg = dict(LOCS[loc]); cfg['names'] = {k: v['name'] for k, v in (((DW.get('events') or {}).get(ZQ) or {}).get('hotspots') or {}).items()}
    cfg['order'] = list(cfg['names'].keys())
    e0 = len(errs)
    await base(pg, 20, 10.0, False, 5)
    ch = await choose_day(pg, loc, cfg, 5, False)
    if not ch['pick']: R.check('[%s] 找得到能約的日子' % tag, False, J(ch['res'])); return None
    day = ch['pick']['d']
    rb = await base(pg, day, 13.3, False, 5)
    R.setup('[%s] 讀檔：%s 13:18、第 %s 階、沒去過 %s（心願還沒完成）' % (tag, ch['pick']['k'], rb['stage'], loc))
    await pg.evaluate(HOOK); screen = []; SEEN.clear()
    how, steps, trip = await book(pg, cdp, loc, cfg, screen)
    R.check('[%s] 預約（%s）：%s' % (tag, how, J(steps)), bool(trip and trip.get('status') == 'booked'), J(trip))
    if not trip: return None
    said, skipped = await depart(pg, cdp, cfg, screen)
    if said is None: R.check('[%s] 出發' % tag, False, J(skipped)); return None
    await play(pg, cdp, cfg, screen, tag)
    ev = await pg.evaluate("window.__ZE||[]")
    who_names = set(await pg.evaluate("(id=>[SOCIAL.displayName(id),(CHARACTERS[id]||{}).name].filter(Boolean))", ZQ))
    IDX = text_index(zl(loc), '/' + loc)
    log('== %s 逐句' % tag)
    bad = []; n = 0
    for e in ev:
        if e['k'] == 'ch': log('  ［選單］%s → %s' % (J(e['opts']), e.get('pick'))); continue
        if e['k'] == 'cap': log('  ［字幕］%s' % e['t']); continue
        if e['k'] == 'money': log('  ［錢］%+d（%s）%d → %d' % (e['amt'], e['label'], e['before'], e['after'])); continue
        log('  %s｜第%s天 %05.2f｜%s' % (e['who'] or '（旁白）', e['d'], e['h'], e['t']))
        her = e['cid'] == ZQ or any(e['who'].startswith(x) for x in who_names)
        if her:
            n += 1
            if e['t'] not in WISH_IDX and e['t'] not in IDX and e['t'] not in COMMON: bad.append(e['t'])
    R.check('[%s] 心願事件她說的 %d 句都在 date_wish.js（events.%s）／%s 格子／短句裡' % (tag, n, ZQ, loc), n > 0 and not bad, J(bad))
    R.check('[%s] 心願完成（WISH_DONE_%s）' % (tag, ZQ), await pg.evaluate("(id=>!!GAME.G.flags['WISH_DONE_'+id])", ZQ), '')
    alltxt = set(SEEN) | {x[1] for x in screen} | {e['t'] for e in ev if e['k'] in ('say', 'cap')} | {o for e in ev if e['k'] == 'ch' for o in e['opts']}
    dev = sorted(t for t in alltxt if t in DEV_BAN_LINE or any(b in t for b in DEV_BAN))
    R.check('[%s] 畫面上沒有開發註記（掃了 %d 行）' % (tag, len(alltxt)), not dev, J(dev))
    mom = sorted(t for t in alltxt if MOM_BAN.search(t))
    if mom: log('  [%s] 【觀察】畫面上有「我媽／媽媽／傳訊息／叫我帶」：%s' % (tag, J(mom)))
    log('  [%s] 這一趟所有扣錢：%s' % (tag, J([[e['amt'], e['label']] for e in ev if e['k'] == 'money'])))
    R.check('[%s] 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'ev': ev, 'screen': screen}, open(os.path.join(OUT, 'zq_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return {'tag': tag, 'loc': loc, 'stage': '一般（第5階）', 'visit': 1, 'n': n, 'dating': 0, 'contact': 0, 'remember': 0, 'night': None, 'slots': []}


async def main():
    log('# DATE_ZQ %s SHA=%s TAG=%s WHO=%s SPOTS=%d PARTS=%s STAGES=%s VISIT=%s PICK=%d PICKS=%s REVISIT_LOC=%s REF=%s' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA, TAG, ZQ, SPOTS, PARTS, STAGES_ENV or '（照地點預設）', VISIT_ENV or '（照地點預設）', PICK, J(PICKS), REVISIT_LOC, REF))
    log('  這一次測的人：%s（WHO）；心願地點 %s' % (ZQ, WISH_LOC))
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        cdp_of[pg] = cdp
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        head = await pg.evaluate("(id=>({v:(document.getElementById('ver')||document.querySelector('.ver')||{}).textContent||'', name:SOCIAL.displayName(id), night:DATE.NIGHT_HOME, morning:(DATE.MORNING||{})[id]||null, extra:(DATE.EXTRA_LINES||{})[id]||null}))", ZQ)
        log('  人物／版本字樣／NIGHT_HOME／MORNING／EXTRA_LINES：%s' % J(head))
        for v in (head.get('extra') or {}).values():   # date3d.js 寫死的不分地點短句（以安、語彤的 depart、enough……）也算「稿裡有的」
            COMMON.update(x for x in (v if isinstance(v, list) else [v]) if isinstance(x, str))
        pg_dev = await pg.evaluate("(()=>({note:DATE.DEV_NOTE?[...DATE.DEV_NOTE]:[], strip:DATE.DEV_STRIP||{}, gate:typeof DATE.optOk==='function'}))()")
        PAGE['DEV_NOTE'] = set(pg_dev['note']); PAGE['DEV_STRIP'] = pg_dev['strip']; PAGE['optGate'] = pg_dev['gate']
        log('  顯示層的開發註記規則（DATE.DEV_NOTE／DEV_STRIP／optOk；舊版沒有＝空）：%s' % J(pg_dev))
        for part in PARTS:
            log('== %s' % part)
            try:
                if part in LOCS:
                    if not zl(part): log('  %s 在 %s 沒有台詞（date_lines.js 沒有這個人的格子）：跳過' % (ZQ, part)); continue
                    order = LOCS[part]['order']
                    visit = VISIT_ENV or ('first' if part in FIRST_LOCS else 'again')
                    if visit == 'first' and LOCS[part]['wishOf'] == ZQ:
                        log('  %s 是 %s 的心願地點：第一次去＝心願事件（用 PARTS=WISH 或 REVISIT），這裡改成 again' % (part, ZQ)); visit = 'again'
                    for sg in (STAGES_ENV or STAGE_DEF.get(part) or ['friend', 'dating']):
                        dating = sg == 'dating'; stage = 6 if (dating or sg == 'friend6' or LOCS[part]['kind'] == 'overnight') else 5
                        vtag = '' if visit == ('first' if part in FIRST_LOCS else 'again') else '_' + visit
                        if visit == 'first':
                            row = await one_date(pg, cdp, errs, '%s_%s%s%s' % (part, sg, vtag, SUF), part, stage, dating, 0, [], [])
                        else:
                            row = await one_date(pg, cdp, errs, '%s_%s%s%s' % (part, sg, vtag, SUF), part, stage, dating, 2, order, LAST_DEF.get(part) or order[:1], wish_done=(LOCS[part]['wishOf'] == ZQ))
                        if row: rows.append(row)
                elif part == 'REVISIT':
                    RL = REVISIT_LOC
                    if LOCS[RL]['wishOf'] == ZQ:   # 她的心願地點：第一次去＝心願事件整場（wish3d.js），第二次才是一般約會的再訪格
                        log('  %s 是 %s 的心願地點：第一次走心願事件（WISH），第二次看再訪格' % (RL, ZQ))
                        r1 = await wish_part(pg, cdp, errs, 'REVISIT_%s_1st_wish%s' % (RL, SUF))
                    else:
                        r1 = await one_date(pg, cdp, errs, 'REVISIT_%s_1st%s' % (RL, SUF), RL, 5, False, 0, [], [])
                    if r1: rows.append(r1)
                    G = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G))")
                    nx = await pg.evaluate("""(([id,d0,loc])=>{ for(let d=d0+1;d<d0+15;d++){ const G2=Object.assign({},GAME.G,{day:d,hour:13,weather:'sunny'}); const tr=((DATE.loc(loc)||{}).transport||[])[0]; const c=DATE.check(G2,{who:id,locs:[loc],day:d,depart:15,transport:tr&&tr.mode});
                        const T=CALENDAR.termOf?CALENDAR.termOf(d):null; if(c.ok&&!(T&&T.exam)){ const x=CALENDAR.dateOf(d); return {d,k:x.y+'-'+x.m+'-'+x.d}; } } return null; })""", [ZQ, G['day'], RL])
                    if not nx: raise RuntimeError('第一次之後兩週內找不到能再約 %s 的日子' % RL)
                    d2, k2 = nx['d'], nx['k']
                    t2 = 'REVISIT_%s_2nd%s' % (RL, SUF)
                    r2 = await one_date(pg, cdp, errs, t2, RL, 5, False, 1, [], [], keepG={'G': G}, day_override=(d2, k2))
                    if r2:
                        rows.append(r2)
                        sp = [r for r in r2['slots'] if r['seg'].startswith('spot')]
                        R.check('[%s] 4 第二次去：每個互動點都是再訪格（remember）' % t2, bool(sp) and all(r['slot'] == 'remember' for r in sp), J([[r['seg'], r['slot'], r['got']] for r in sp]))
                elif part == 'WISH':
                    row = await wish_part(pg, cdp, errs)
                    if row: rows.append(row)
                else:
                    log('  不認得的 PART：%s' % part)
            except Exception:
                import traceback
                R.check('[%s] 沒有丟出例外（探針）' % part, False, traceback.format_exc()[-800:])
                try: await R.shot(pg, part + '_exception')
                except Exception: pass
        for r in rows:
            if r['loc'] in LOCS and r['visit'] == 3 and r['slots'] and not r['tag'].startswith('WISH') and r.get('last'):
                first = next((x for x in r['slots'] if x['seg'] == 'spot:' + r['last'][0]), None)
                R.check('[%s] 4 上一次點過的那個點（%s）是再訪格 remember' % (r['tag'], r['last'][0]), bool(first and first['slot'] == 'remember'), J(first and [first['seg'], first['slot']]))
        await b.close()
    log('== 表（地點×階段×第幾次×格數）')
    log('  %-14s %-4s %-10s %-4s %-6s %-6s %-6s %-6s %s' % ('tag', '地點', '階段', '次', '她＋旁白', '交往格', '肢體句', '再訪格', '晚上那句'))
    for r in rows:
        log('  %-14s %-4s %-10s %-4s %-6s %-6s %-6s %-6s %s' % (r['tag'], r['loc'], r['stage'], r['visit'], r['n'], r['dating'], r['contact'], r['remember'], r['night'] or '-'))
        for x in r['slots']: log('      %-22s %-9s %s' % (x['seg'], x['slot'], ' ／ '.join(x['got'])))
    sys.exit(R.finish())


asyncio.run(main())
