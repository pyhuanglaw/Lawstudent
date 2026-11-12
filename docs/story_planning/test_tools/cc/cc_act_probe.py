"""CC（帳號 A）11-11：ACT（BB 的「一起活動」驗收，對稿 AA_708@d30416e6b）＋STUDY（BB 07:37 補：一起念書，對稿 AA_707@1b8e247ec）瀏覽器探針。
判定歸 BB；Playwright 手機模擬（844×390 觸控）≠ iPhone。雲端沒有在瀏覽器跑過（只做 probe_lint＋node --check）。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓（第二版：長椅依距離一張一張試、有人坐的跳過——第一版寫 n/a 是錯的，be1e 雲端最近那張有路人坐） 4✓ 5✓ 6✓ 7✓ 8✓ 9n/a（約會截圖本來就要看到兩個人，不藏玩家） 10✓ 11✓ 12✓ 13✓（CC-C 11-12 改 SITFIRST：到了等互動鍵、再走近、按前看最上層、按完確認坐下）

受測：開發分支 7266e7a29351d4d186cae82d82042271a95a67d4（含 fea448637：一起活動 98 場 710d49638、一起念書 42 場 7266e7a29）。遊戲資料＝稿（頁面上的那一場和稿逐字比，另外一項）。
對照的程式（src/invites3d.js S.meet、src/studyn3d.js、src/movies3d.js、src/arcs3d.js、src/social3d.js applyFx）：
  入口  手機「朋友」→ 她的「約」→ 類別（念書／吃飯／喝咖啡、喝茶／看電影、逛書店）→ 地點（verb；念書類是 verbStudy）→「今天 HH:MM」→ 她答應
        →【捷徑】時間撥到約好的前 10 分鐘 → 手機「今天」按「現在過去」→ 走到／一起坐下（INV.startTogether）→ INV.meet
  哪一種活動  INV.actKind：南洋戲院＝movie；「看電影、逛書店」類的其他＝bookstore；吃飯＝eat；坐坐＝cafe。念書＝INV.isStudy（STUDYN）
  場次  G.flags.ACTN[kind][人物]＝{n,k,last,rot}（念書 G.flags.STUDYN）；第 k 場要 DATE.stageNum ≥ need，不夠＝一般句（次數照算、k 不動）；全部演完＝rot 輪換
  base／alt  S.resolve：alt.cond 成立就換 seat／mid／pack／bye／opts。datingOrReady＝交往中或 DATE.canConfess ok（芷若、語彤、可昕電影第 3 場）；
             anShopPage＝以安有記憶 AN_SHOP_PAGE（念書第 6 場）；day＝那一場 18:00 以前開始（可昕電影第 3 場的 bye）
  中途  故事線那一拍（ARCS.pick）會取代第 N 場的中途和選項——【前置】把 BEATS[她].last 設成今天（今天已經演過一拍），第 N 場的中途才演得到
  電影  放映中只演 mid 裡整句（…）的旁白；說出口的句子和選項挪到走出 1 廳以後（MOVIES.splitMid）；這部片有 with.mid 而且她沒看過＝第 N 場的旁白不演
        （【前置】挑「片單合這一場、沒有 with.mid」的日子；找不到才把那部片記成她看過，會印）
  數值  選項 fx＝SOCIAL.applyFx（fr→fam/trust/comf，love→npcRom，有上限）；舊的 rel＝SOCIAL.adjust。探針包住這兩個函式記「呼叫前／後」的關係值（只記不改）
PARTS（逗號分隔；每一段各自讀檔，彼此不相干）：
  A（ACT，對 AA_708）
  AN_MOVIE_A／AN_MOVIE_B   以安電影第 1 場（need 1；第 4 階）選第 1／第 2 個選項：選項逐字、回話逐字、fx 有加、不扣分
  AN_BOOK_A／AN_BOOK_B     以安書店第 1 場（頁間書屋或山嵐書店）選第 1／第 2 個
  ZR3_BASE／ZR3_ALT        芷若電影第 3 場：【捷徑】寫次數 n=2、k=3（第 1、2 場的 set 旗標補上）；第 4 階；BASE＝沒交往（canConfess 不 ok）、ALT＝交往中
  YT3_BASE／YT3_ALT        語彤（同上）；KX3_BASE／KX3_ALT 可昕（同上；可昕預設存檔就是交往中，BASE 拿掉 dating_kexin）
                           base 句：芷若「中間隔著一點點」、語彤「手臂貼著」、可昕「歪過來一點，又坐正」；alt 句：「沒有移開」／頭靠肩膀／頭靠過來。
                           base 那趟這一場的 mid（她自己主動的那一段）出現靠肩、手疊手（CONTACT_BASE）＝FAIL；玩家選的選項之後她的回應、片子那一段有接觸
                           只印【觀察】（BB 07:56：need 4、玩家先動，可以；學姊那場睡著靠過來也留）。
  ZR3_BASE_P0／_P1、YT3_BASE_P0／_P1、KX3_BASE_P0／_P1  base 兩個選項各一趟（BB 07:56 ②）；不加尾巴的 ZR3_BASE 等＝選 PICK3（預設 0）；ALT 照 PICK3
                           KX3_BASE*：沒交往約不到可昕，這一版正常玩家玩不到（BB：不是問題）→ 照舊 INV.accept【捷徑】，log 標【說明】
  PS1／PS2／PS3／PS4       沛珊吃飯第 1～4 場（【捷徑】寫次數 n=k-1）：整場逐字；畫面上不能有「早餐店」「存錢」「零用錢」；選第幾個 PS_PICK（預設 0）
  FALLBACK                 以安書店第 2 場（need 3）用第 2 階的關係去約＝一般句：逐字記、次數 +1、k 不動、不能出現第 2 場的句子
  ROTATE                   以安吃飯 4 場都演過（【捷徑】n=4、k=5）＝輪換第 1 則（rot[0]）：seat 逐字、中途是 rot[0] 的 mid 或她最近的事（ARCS.rotPick，記是哪一種）
  C（STUDY，對 AA_707；BB 07:37）
  ST_AN1_A／ST_AN1_B       以安一起念書第 1 場選第 1／第 2 個；ST_PS1_A／ST_PS1_B 沛珊（同上）
  ST_AN6_NOPAGE            以安第 6 場（【捷徑】n=5、k=6、第 5 階）沒有記憶 AN_SHOP_PAGE：「（她翻開手帳最後一頁，手壓著下半頁…）」＋選項「下面壓著的是什麼？」；
                           全場不能有「和你」「一家都還沒有打勾」
  ST_AN6_PAGE              同上、【捷徑】記憶 AN_SHOP_PAGE（期末飯看過那一頁）：「（她翻到你看過的那一頁。）」＋選項「最下面那一行，還在嗎？」
  ST_ZR6／ST_YT6／ST_PS6／ST_KX6  第 6 場各演一次：句子裡不能有 TIME_STRICT（週六、下週、九點四十、六點半，我在門口等你）；白名單 TIME_OK（課輔班是週三晚上、六點半開始）；
                           比較寬的「哪一天幾點」字樣（TIME_WIDE）印【觀察】不判
  ST_LOWNEED               以安第 3 場（need 3）用第 2 階去約＝一般句：逐字記、次數 +1、k 不動
  B（BB 08:07，開發分支 f8b6d1e82 起：電影（…）選項在暗的廳裡選；被取代的第 N 場＝不推進、下次再演）
  ZR3_SMOKE                芷若電影第 3 場（交往中、【捷徑】前兩場）：選項出現當下的 zone／放映中（探針包住 MOVIES.lights 記場燈）、前一句是不是小動作的最後一句；
                           回話當下的 zone／放映中；聊電影（MOVIES.talkFor 的選項）要在散場後。選項在廳裡、放映中＝PASS；散場後才出現＝FAIL（7266e7a29 的行為）
  ST_BEAT_DEFER            以安念書第 2 場（need 2），BEATS 從第 1 拍（今天會演一拍）：第 1 次＝故事線那一拍取代中途 → 總次數 +1、k 還是 2；
                           【捷徑】讀回存檔、只改到隔天（故事線當天不演）再約同一個地方 → 第 2 場整場逐字、k＝3（7266e7a29：第 1 次就推進到 3＝FAIL）
  MOVIE_WITHMID            芷若電影第 1 場遇到她有 with.mid 的片（片單 m2707b，2027-07；【捷徑】可能要用 INV.accept）：第 1 場的小動作、說出口的句子、選項都不演、散場不補，
                           總次數 +1、k 還是 1、set 不記（7266e7a29：k 推進＝FAIL）。暑假日子、找得到這部片才跑得成，best effort
  版本偵測：頁面上 String(INV.meet) 有沒有 actDefer（log 印）；有＝電影的逐字順序照「小動作 → 選項回話（廳裡）→ 說出口的句子（散場）」排
  第 6 場共通：G.flags.STUDY_UNLOCK 有記那一格；G.invites（這一次以外的）、G.trips、G.flags.ARC_INVITE 前後一樣（不會自動排約）；DATE.log 次數 +1（study6）
每一段：
  逐字：每一句（說話人＋全文）印 [說]；每一組選項逐字印 [選項]（→ 選了哪個）；第 N 場的句子照稿（AA_708／AA_707，讀不到稿才退回頁面上的遊戲資料，會印）的順序逐句比（中間可以夾別的句子）、
        說話人（（…）開頭＝旁白、其他＝她）；選項清單逐字＝稿；遊戲資料（頁面上的 ACTIVITY_SCENES／STUDY_SCENES）這一場＝稿（靜態，另外一項）
  數值：見面前後 SOCIAL.rel 全部數值 diff；選項那一次 applyFx（或 adjust）的回傳和前後值；fx／rel 沒有負的、見面前後 fam／trust／comf／npcRom／rom 都沒有變少
  其他：次數 n+1、k（下一場）、set 旗標；pageerror 有就 FAIL；畫面上沒有沒換掉的 {name}、undefined
截圖：每一組活動選項出現時（act_<part>_opts）、base／alt 那一句出現時（act_<part>_line）、見面結束（act_<part>_end）。
【前置／捷徑】（log 都會印）：讀檔（GAME.applySave、關條件事件和手機自動打開）到宿舍、日子照 CALENDAR 挑（不是假日、颱風假、考試週；週六優先）、晴天、錢 3000；
  她的聯絡方式；關係數值（SOCIAL.rel 直接設，照 DATE.stageNum 的門檻）；dating_* 只留這一段要的；ACTN／STUDYN 次數；前幾場的 set 旗標；記憶 AN_SHOP_PAGE；
  BEATS[她].last＝今天（故事線今天不演）；升階門檻台詞記成說過（SOCIAL.markUp，免得開場那一句的選項先吃掉 love 上限）；時間撥到約好的前 10 分鐘。
  可昕沒交往時手機沒有「約」（INV.canInvite：G 層，只有交往中 kxGF 才能約）→ KX3_BASE 退回 INV.accept 直接寫一筆約好的邀約【捷徑】（會印；CC 初判見回報）。
環境變數：PARTS、PICK3（0）、PS_PICK（0）、DRAFT708（sha:路徑，預設 d30416e6b:docs/story_planning/AA_708_activity_scenes.json）、DRAFT707（1b8e247ec:…AA_707_study_scenes.json）、
  DRAFT_TREE（另外找稿的 git 樹）、TAG。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=AN_MOVIE_A,AN_MOVIE_B python3 cc_act_probe.py <url> <out>（URL 不加 ?turbo）
D34（讀 git log 找的改之前版本；舊版跑法 LW_TESTS=<舊樹>/tests SHA=<舊> PARTS=… ；逐字一律比新稿 AA_708／AA_707，所以舊版的「逐字照稿」會 FAIL）：
  ACT 舊版 f70d5da4d3（＝710d49638^，一起活動重匯之前）：以安電影第 1 場沒有 opts → AN_MOVIE_* 的「兩個選項真的跳出來」FAIL；studyn3d.js 沒有 datingOrReady、
    芷若電影第 3 場只有一版 mid「…她沒有移開。」→ ZR3_BASE 的 base 句沒出現＋alt 句出現 FAIL（語彤、可昕同理）；沛珊吃飯 1～4 整塊是舊稿 → PS* 逐字 FAIL
    （禁字在舊版只在輪換：吃飯 rot3「零用錢」、咖啡 rot2／書店 rot2「存錢」，PS1～4 的禁字項舊版也 PASS——這一項守的是之後別再寫回來）。
  STUDY 舊版 0c478d5f6a（＝7266e7a29^，一起念書重匯之前）：沒有 anShopPage → ST_AN6_PAGE 的「（她翻到你看過的那一頁。）」FAIL；以安第 6 場舊 mid
    「…一家都還沒有打勾。」→ ST_AN6_NOPAGE 禁字 FAIL；以安、沛珊第 1 場沒有 opts → ST_*1 的選項 FAIL。"""
import os, sys, json, asyncio, time, re, subprocess
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT)
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or 'new'
ROOT = os.path.abspath(os.path.join(LWT, '..'))
PICK3 = int(os.environ.get('PICK3') or 0)
PS_PICK = int(os.environ.get('PS_PICK') or 0)
DRAFT708 = os.environ.get('DRAFT708') or 'd30416e6b:docs/story_planning/AA_708_activity_scenes.json'
DRAFT707 = os.environ.get('DRAFT707') or '1b8e247ec:docs/story_planning/AA_707_study_scenes.json'
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('act_' + TAG, OUT)
LOGF = open(os.path.join(OUT, 'act_lines.txt'), 'a', encoding='utf-8')

ALL_PARTS = ['AN_MOVIE_A', 'AN_MOVIE_B', 'AN_BOOK_A', 'AN_BOOK_B', 'ZR3_BASE_P0', 'ZR3_BASE_P1', 'ZR3_ALT', 'YT3_BASE_P0', 'YT3_BASE_P1', 'YT3_ALT', 'KX3_BASE_P0', 'KX3_BASE_P1', 'KX3_ALT',
             'PS1', 'PS2', 'PS3', 'PS4', 'FALLBACK', 'ROTATE',
             'ST_AN1_A', 'ST_AN1_B', 'ST_PS1_A', 'ST_PS1_B', 'ST_AN6_NOPAGE', 'ST_AN6_PAGE', 'ST_ZR6', 'ST_YT6', 'ST_PS6', 'ST_KX6', 'ST_LOWNEED',
             'ZR3_SMOKE', 'ST_BEAT_DEFER', 'MOVIE_WITHMID']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]

# 日子：2025 大一上的週六優先、再週日（避開 10/06 中秋、10/10 國慶、10/13 颱風、考試週；開頭再用 CALENDAR 查一次）
DAY_KEYS = ['2025-10-18', '2025-10-25', '2025-11-01', '2025-11-08', '2025-11-15', '2025-11-22', '2025-11-29', '2025-10-04', '2025-10-19', '2025-10-26', '2025-11-02', '2025-11-09']
# DATE.stageNum 的門檻（date3d.js：fr 1～4＝fam 20／40＋trust 25／60＋trust 45＋comf 40；5＝fr≥3 且 npcRom≥30；6＝fr 4 且 npcRom≥55）
REL = {1: dict(fam=12, trust=8, comf=8, npcRom=0), 2: dict(fam=28, trust=12, comf=12, npcRom=4), 3: dict(fam=46, trust=30, comf=26, npcRom=8),
       4: dict(fam=66, trust=50, comf=45, npcRom=14), 5: dict(fam=66, trust=50, comf=45, npcRom=40), 6: dict(fam=76, trust=56, comf=50, npcRom=60)}
CAT_LABEL = {'eat': '吃飯', 'cafe': '喝咖啡', 'movie': '看電影', 'bookstore': '看電影', 'study': '念書'}
CONTACT_BASE = re.compile(r'靠在你肩|肩膀上|頭靠|靠過來|放了上來|放上來|手疊|疊在|握住|牽|勾住|十指')
PS_BAN = ('早餐店', '存錢', '零用錢')
AN6_BAN = ('和你', '一家都還沒有打勾')
TIME_STRICT = ('週六', '下週', '九點四十', '六點半，我在門口等你')
TIME_OK = ('課輔班是週三晚上', '六點半開始')
TIME_WIDE = re.compile(r'週[一二三四五六日末]|禮拜[一二三四五六天日]?|星期|下週|下禮拜|明天|後天|今晚|\d{1,2}[:：]\d{2}|[一二三四五六七八九十兩]+點(?:半|[一二三四五六七八九十]+分?)?')
EXIT_WORDS = ('算了', '返回', '下次再說', '換一天')


def log(s):
    print(s, flush=True); LOGF.write(s + '\n'); LOGF.flush()


# ---------------------------------------------------------------- 稿
def git_show(spec):
    sha, path = spec.split(':', 1)
    roots = [os.environ.get('DRAFT_TREE') or '', ROOT, HERE]
    for r in roots:
        if not r: continue
        try:
            return subprocess.check_output(['git', '-C', r, 'show', '%s:%s' % (sha, path)], stderr=subprocess.DEVNULL, text=True)   # gpu_wrap-ok（不開瀏覽器）
        except Exception:
            continue
    return None


def load_draft(spec):
    t = git_show(spec)
    if t is None: return None
    try:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import import_guard as IG
        t = IG.read_fix(t)
    except Exception:
        pass
    try: return json.loads(t)
    except Exception: return None


D708 = load_draft(DRAFT708)
D707 = load_draft(DRAFT707)


def draft_people(kind):
    if kind == 'study': return (D707 or {}) if D707 else None
    return (D708 or {}).get(kind) if D708 else None


def lst(x):
    if x is None: return []
    return [t for t in (x if isinstance(x, list) else [x]) if isinstance(t, str) and t.strip()]


def norm_opt(o):
    rep = o.get('reply')
    rep = lst(rep) if rep is not None else lst(o.get('re'))
    rel = o.get('rel') or None
    fx = o.get('fx') or None
    return {'t': o.get('t'), 'fx': fx, 'rel': rel, 'reply': rep}


def norm_sc(sc):
    """稿（choice.opts）和遊戲資料（opts）攤成同一個樣子"""
    if not sc: return None
    out = {'need': sc.get('need'), 'set': sc.get('set')}
    for k in ('seat', 'mid', 'pack', 'bye'): out[k] = lst(sc.get(k))
    ops = sc.get('opts') if sc.get('opts') is not None else (sc.get('choice') or {}).get('opts')
    out['opts'] = [norm_opt(o) for o in (ops or []) if o and isinstance(o.get('t'), str) and o['t'].strip()]
    A = sc.get('alt')
    if A:
        a = {}
        for k in ('seat', 'mid', 'pack', 'bye'):
            if A.get(k) is not None: a[k] = lst(A[k])
        if A.get('opts') is not None or (A.get('choice') or {}).get('opts') is not None:
            a['opts'] = [norm_opt(o) for o in (A.get('opts') if A.get('opts') is not None else A['choice']['opts']) if o and isinstance(o.get('t'), str)]
        out['alt'] = a
    if sc.get('day'):
        out['day'] = {k: lst(v) for k, v in sc['day'].items() if k in ('seat', 'mid', 'pack', 'bye')}
    return out


def draft_scene(kind, who, k):
    P = draft_people(kind)
    T = (P or {}).get(who) or {}
    if k == 'rot': return [norm_sc(x) for x in (T.get('rot') or [])]
    return norm_sc(T.get(str(k)))


def resolve(sc, alt_on, day_on):
    o = dict(sc)
    if alt_on and sc.get('alt'):
        for k, v in sc['alt'].items(): o[k] = v
    if day_on and sc.get('day'):
        for k, v in sc['day'].items(): o[k] = v
    return o


def narr_whole(t):
    """invites3d.js S.narrLine：整句是一對（…）"""
    if not isinstance(t, str) or not t.startswith('（'): return False
    d = 0
    for i, ch in enumerate(t):
        if ch == '（': d += 1
        elif ch == '）':
            d -= 1
            if d == 0: return i == len(t) - 1
    return False


def role(t):
    return 'narr' if t.startswith('（') else 'her'   # studyn3d.js S.play：（ 開頭＝旁白


def expected(sc, mode, pick, name, with_mid=False, opts_in_hall=False):
    """照 invites3d.js 的順序排這一場該出的句子：[(role, 字)]；mode＝cinema／act／study。
    opts_in_hall（f8b6d1e82 起）：電影的選項全是（…）開頭＝暗的廳裡、小動作後面就選、回話也在廳裡；說出口的句子照舊散場以後"""
    sub = lambda t: t.replace('{name}', name)
    seq = [(role(t), sub(t)) for t in sc.get('seat') or []]
    rep = []
    if sc.get('opts'):
        o = sc['opts'][min(pick, len(sc['opts']) - 1)]
        rep = [(role(t), sub(t)) for t in o['reply']]
    if mode == 'cinema':
        dark = [] if with_mid else [t for t in sc['mid'] if narr_whole(t)]
        after = [t for t in sc['mid'] if not narr_whole(t)]
        inhall = opts_in_hall and bool(sc['opts']) and all(o['t'].startswith('（') for o in sc['opts']) and not with_mid
        if inhall: seq += [(role(t), sub(t)) for t in dark] + rep + [(role(t), sub(t)) for t in after]
        else: seq += [(role(t), sub(t)) for t in dark + after] + rep
    else:
        seq += [(role(t), sub(t)) for t in sc['mid']] + rep
    seq += [(role(t), sub(t)) for t in sc['pack']]
    seq += [(role(t), sub(t)) for t in sc['bye']]
    return seq


# ---------------------------------------------------------------- 頁面上的 JS（只記不改的掛勾；設定前置；查詢）
HOOK_JS = r"""(()=>{ if(!window.__ACTH){ window.__ACTH=1; window.__AE=[];
  const n=()=>window.__AE.length, G=()=>GAME.G;
  const snap=id=>{ try{ const r=SOCIAL.rel(id)||{}, o={}; for(const k of Object.keys(r)) if(typeof r[k]==='number') o[k]=r[k]; return o; }catch(e){ return null; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__AE.push({k:'say',i:n(),who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t),h:+(+G().hour).toFixed(3),d:G().day,z:G().zone,dark:!!window.__dark}); }catch(e){} return s0.apply(this,arguments); };
  if(typeof MOVIES!=='undefined'&&MOVIES.lights){ const l0=MOVIES.lights; MOVIES.lights=function(on){ try{ window.__dark=!on; window.__AE.push({k:'lights',i:n(),on:!!on,z:G().zone}); }catch(e){} return l0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(a,b){ try{ window.__AE.push({k:'cap',i:n(),t:String(b==null?a:b)}); }catch(e){} return p0.apply(this,arguments); }; }
  const c0=GAME.choose; GAME.choose=function(o){ const rec={k:'ch',i:n(),opts:(o||[]).map(x=>typeof x==='string'?x:((x&&x.t)||'')),dim:(o||[]).map(x=>!!(x&&x.dim)),pick:null,z:G().zone,dark:!!window.__dark};
    try{ window.__AE.push(rec); }catch(e){} const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=k; }); }catch(e){} return p; };
  if(typeof SOCIAL!=='undefined'){
    const f0=SOCIAL.applyFx; if(f0) SOCIAL.applyFx=function(G_,id,fx,o){ const b=snap(id); const r=f0.apply(this,arguments); try{ window.__AE.push({k:'fx',i:n(),id,fx:fx?JSON.parse(JSON.stringify(fx)):null,cap:(o&&o.cap)||null,ret:r?JSON.parse(JSON.stringify(r)):null,before:b,after:snap(id)}); }catch(e){} return r; };
    const a0=SOCIAL.adjust; if(a0) SOCIAL.adjust=function(id,d){ const b=snap(id); const r=a0.apply(this,arguments); try{ window.__AE.push({k:'adj',i:n(),id,d:d?JSON.parse(JSON.stringify(d)):null,before:b,after:snap(id)}); }catch(e){} return r; }; }
 } window.__AE=[]; window.__dark=false; return true; })()"""

ST_JS = r"""(()=>{ const D=GAME.D||{}, ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), nm=document.getElementById('dlgName'), ph=document.getElementById('phone');
  const B=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null):[];
  const E=window.__AE||[]; let last=null; for(let i=E.length-1;i>=0;i--) if(E[i].k==='ch'){ last=E[i]; break; }
  const it=document.getElementById('interact'), P=GAME.E&&GAME.E.player;
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(b=>(b.textContent||'').trim()), ch:last&&last.pick==null?{i:last.i,opts:last.opts,dim:last.dim}:null,
    phone:!!(ph&&!ph.classList.contains('hide')), zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3), busy:!!(P&&P.busy), seat:!!(P&&P.seat),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):''}; })()"""

CAL_JS = r"""(k=>{ const d=STORY.dayOfKey(k); const x=CALENDAR.dateOf(d), t=CALENDAR.termOf?CALENDAR.termOf(d):null; return {k, d, wd:((x.wd%7)+7)%7, hol:!!(CALENDAR.holiday&&CALENDAR.holiday(d)), typh:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)), term:t?t.id:null, week:t?t.week:null, exam:!!(t&&t.exam)}; })"""

SETUP_JS = r"""(q=>{ const G=GAME.G, F=G.flags||(G.flags={}); const out={notes:[]};
  G.contacts=G.contacts||{}; if(G.contacts[q.who]==null) G.contacts[q.who]=1; G.money=Math.max(G.money|0,3000); G.invites=[]; G.weather='clear';
  for(const k of Object.keys(F)) if(k.indexOf('dating_')===0&&F[k]){ if(!(q.dating&&k==='dating_'+q.who)){ delete F[k]; out.notes.push('拿掉 '+k); } }
  if(q.dating) F['dating_'+q.who]=true;
  Object.assign(SOCIAL.rel(q.who), q.rel);
  for(const k of Object.keys(q.flags||{})) F[k]=q.flags[k]===true?G.day-7:q.flags[k];
  const M=G.social&&G.social.mem; if(M&&M[q.who]) for(const t of q.unmem||[]) M[q.who]=M[q.who].filter(m=>m.tag!==t);
  for(const t of q.mems||[]) SOCIAL.remember(q.who,t,'');
  if(q.kind==='study'){ const RS=STUDYN.rec(G); RS[q.who]={n:q.n,k:q.k,last:null,rot:q.rot==null?-1:q.rot}; }
  else { const A=F.ACTN&&typeof F.ACTN==='object'?F.ACTN:(F.ACTN={}); const RA=A[q.kind]&&typeof A[q.kind]==='object'?A[q.kind]:(A[q.kind]={}); RA[q.who]={n:q.n,k:q.k,last:null,rot:q.rot==null?-1:q.rot}; }
  if(typeof ARCS!=='undefined'&&ARCS.rec){ const r=ARCS.rec(G,q.who); if(q.arcLast!==false) r.last=G.day; else { r.last=null; if(q.arcK) { r.k=q.arcK; r.missed=[]; } } if(q.rotSrc) r.rotSrc=q.rotSrc; }
  out.arc=(()=>{ try{ const b=typeof ARCS!=='undefined'&&ARCS.pick?ARCS.pick(G,q.who,{kind:q.kind==='study'?'study':q.kind,quiet:false}):null; return b?{n:b.n,ask:b.ask||[],opts:(b.opts||[]).map(o=>o.t)}:null; }catch(e){ return {err:String(e)}; } })();
  let ups=0; if(SOCIAL.upLine&&SOCIAL.markUp){ for(let i=0;i<10;i++){ const U=SOCIAL.upLine(q.who,{place:q.pid||null,outing:true}); if(!U) break; SOCIAL.markUp(q.who,U.k); ups++; } }
  const r=SOCIAL.rel(q.who), rel={}; for(const k of Object.keys(r)) if(typeof r[k]==='number') rel[k]=r[k];
  let cc=null; try{ cc=DATE.canConfess(G,q.who); }catch(e){ cc={err:String(e)}; }
  out.stage=DATE.stageNum(q.who); out.sstage=SOCIAL.stage(q.who); out.rel=rel; out.dating=!!F['dating_'+q.who]; out.canConfess=cc; out.ups=ups;
  out.canInvite=INV.canInvite(G,q.who); out.whyNot=INV.whyNot?INV.whyNot(G,q.who):''; out.hasPage=!!(SOCIAL.has&&SOCIAL.has(q.who,'AN_SHOP_PAGE'));
  out.altOn=(()=>{ try{ return {datingOrReady:STUDYN.ALT.datingOrReady(G,q.who), anShopPage:STUDYN.ALT.anShopPage?STUDYN.ALT.anShopPage(G):null}; }catch(e){ return String(e); } })();
  out.name=G.name||'祐廷'; return out; })"""

# 這一種活動可以約的地點（照 invites3d.js S.flow 的清單：kxGF 的 kxPlaceOk、show、neverAt；活動要能演第 N 場：沒有 scene／ownMeal／sport／她自己的 scene）
PLACES_JS = r"""(q=>{ const G=GAME.G, out=[]; const PD=(INVITE_DATA.people||{})[q.who]||{};
  for(const P of INVITE_DATA.places){ const cats=INV.catsOf(P); let ok;
    if(q.kind==='study') ok=cats.includes('study'); else ok=INV.actKind({},P)===q.kind&&!P.scene&&!P.ownMeal&&!P.sport&&!((PD.scene||{})[P.id]&&(PD.scene||{})[P.id].length);
    if(!ok) continue;
    const why=INV.placeWhy?INV.placeWhy(G,q.who,P):''; const lib=/^library/.test(String(P.zone||''))||P.id==='lawlib'||P.id==='soclib';
    const row={id:P.id,name:P.name,verb:P.verb,verbStudy:P.verbStudy||null,zone:P.zone,cats,why,lib};
    if(INV.kxGF&&INV.kxGF(G,q.who)&&INV.kxPlaceOk&&!INV.kxPlaceOk(G,P)) row.skip='可昕交往中的手機清單沒有（kxPlaceOk）';
    else if(P.show&&!P.show(G,q.who)) row.skip='show';
    else if(INV.neverAt&&INV.neverAt(q.who,P)) row.skip='neverAt';
    out.push(row); }
  return out; })"""

TIMES_JS = r"""(q=>{ const G=GAME.G, P=INV.place(q.pid); if(!P) return {err:'沒有地點'}; const T=INV.timeOptions(G,false,P,q.who), out=[];
  for(const x of T){ if(x.day!==G.day||x.dim||x.now) { out.push({t:x.t,skip:x.dim?'灰':(x.now?'現在':'不是今天')}); continue; }
    let r=null; try{ r=INV.personal(G,q.who,P,x.day,x.h,INV.decide(G,q.who,P.id,x.day,x.h)); }catch(e){ r={res:'err',why:String(e)}; }
    let te=null; try{ te=typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,q.who,P,{day:x.day,h:x.h}):null; }catch(e){ te={err:String(e)}; }
    out.push({t:x.t,h:x.h,res:r&&r.res,why:r&&r.why||null,te:!!te}); }
  return out; })"""

FILM_JS = r"""(q=>{ const G=GAME.G; if(typeof MOVIES==='undefined') return null; const c=MOVIES.choose(G,q.who,G.day); if(!c) return null; const x=MOVIES.withOf?MOVIES.withOf(c.id,q.who):null;
  return {film:c.id, ok:!!c.ok, key:c.key, title:(MOVIES.film(c.id)||{}).title||null, withMid:!!(x&&x.kind==='mid'&&!MOVIES.seenWith(G,q.who,c.id)), withKind:x?x.kind:null}; })"""

IV_JS = r"""(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{id:v.id,st:v.state,ph:(v.lead&&v.lead.ph)||null,place:v.place,zone:v.zone,h:v.h,film:v.film||null,cat:v.cat||null,mid:!!v.mid,waitSeat:v.waitSeat||null,gz:GAME.G.zone}:null; })"""

NPC_JS = r"""(w=>{ const n=(GAME.npc&&GAME.npc[w])||(GAME.E.npcs||[]).find(q=>q.id===w||q.charId===w); return n&&n.obj?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0,seat:!!n.seat}:null; })"""

REC_JS = r"""(q=>{ const G=GAME.G, F=G.flags||{}; const rec=q.kind==='study'?((F.STUDYN||{})[q.who]||null):(((F.ACTN||{})[q.kind]||{})[q.who]||null);
  const r=SOCIAL.rel(q.who), rel={}; for(const k of Object.keys(r)) if(typeof r[k]==='number') rel[k]=r[k];
  const L=typeof DATE!=='undefined'&&DATE.log?DATE.log(G,q.who):null;
  return {rec:rec?JSON.parse(JSON.stringify(rec)):null, rel, day:G.day, hour:+(+G.hour).toFixed(2), zone:G.zone, set:q.set?(F[q.set]==null?null:F[q.set]):null,
    unlock:F.STUDY_UNLOCK?JSON.parse(JSON.stringify(F.STUDY_UNLOCK)):null, invites:JSON.parse(JSON.stringify(G.invites||[])), trips:JSON.parse(JSON.stringify(G.trips||[])),
    arcInv:F.ARC_INVITE?JSON.parse(JSON.stringify(F.ARC_INVITE)):null, dlog:L?{count:L.count|0,study6:L.study6==null?null:L.study6}:null, beats:F.BEATS&&F.BEATS[q.who]?JSON.parse(JSON.stringify(F.BEATS[q.who])):null}; })"""

PAGE_SCENE_JS = r"""(q=>{ let T=null; if(q.kind==='study') T=(typeof STUDY_SCENES!=='undefined'&&STUDY_SCENES.people||{})[q.who]; else T=(typeof ACTIVITY_SCENES!=='undefined'&&ACTIVITY_SCENES.kinds&&ACTIVITY_SCENES.kinds[q.kind]&&ACTIVITY_SCENES.kinds[q.kind].people||{})[q.who];
  if(!T) return null; return {scenes:T.scenes||{}, rot:T.rot||[], src:q.kind==='study'?(typeof STUDY_SCENES!=='undefined'?STUDY_SCENES.src:null):(typeof ACTIVITY_SCENES!=='undefined'?ACTIVITY_SCENES.src:null)}; })"""

MARK_SEEN_JS = r"""(q=>{ MOVIES.markSeen(GAME.G,q.who,q.film); const r=GAME.G.flags.MOVIE_SEEN[q.who]; r[q.film]=GAME.G.day-30; return true; })"""

ACCEPT_JS = r"""(q=>{ const iv=INV.accept(GAME.G,q.who,q.pid,GAME.G.day,q.h,{by:'player',cat:q.cat||null}); if(typeof MOVIES!=='undefined'&&MOVIES.onInvite) MOVIES.onInvite(GAME.G,iv); return iv?{id:iv.id,h:iv.h,film:iv.film||null}:null; })"""

ROT_OK_JS = r"""(q=>{ const r=((ACTIVITY_SCENES.kinds[q.kind]||{}).people||{})[q.who], F=GAME.G.flags||{}; return ((r&&r.rot)||[]).map((x,i)=>[x,i]).filter(([x])=>!x.if||(F[x.if]!=null&&F[x.if]!==false)).map(([,i])=>i); })"""

VER_JS = r"""(()=>({actDefer:String(INV.meet).includes('actDefer'), doneDefer:String(STUDYN.act('study').done).includes('defer')}))()"""

TALK_JS = r"""(q=>{ if(typeof MOVIES==='undefined'||!MOVIES.talkFor) return null; const T=MOVIES.talkFor(GAME.G,q.who,q.film); return T?(T.opts||[]).map(o=>o.t):null; })"""

TODAY_TXT_JS = r"""(()=>((document.getElementById('phoneBody')||{}).innerText||'').trim())()"""

ALL_JS = [HOOK_JS, ST_JS, CAL_JS, SETUP_JS, PLACES_JS, TIMES_JS, FILM_JS, IV_JS, NPC_JS, REC_JS, PAGE_SCENE_JS, MARK_SEEN_JS, ACCEPT_JS, ROT_OK_JS, VER_JS, TALK_JS, TODAY_TXT_JS]   # node --check 用（探針自己不用這個表）


# ---------------------------------------------------------------- 觸控
async def st(pg):
    return await pg.evaluate(ST_JS)


async def tap_btn(pg, cdp, i):
    """先確認手指底下是那顆鈕（被手機蓋住就先收起來），再按"""
    HIT = "(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const h=document.elementFromPoint(x,y); return {c:[x,y],hit:!!h&&(h===b||b.contains(h))}; })"
    q = await pg.evaluate(HIT, i)
    if not q: return False
    if not q['hit']:
        await close_phone(pg, cdp); await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
        q = await pg.evaluate(HIT, i)
        if not q: return False
    await L.touch_tap(cdp, q['c'][0], q['c'][1]); return True


class Menu:
    """選單剛出來 350 ms 內的點擊會被吃掉：同一組選項看到 ≥ 650 ms 才點；點了 2.5 秒還在＝再點一次"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.65


async def tap_dlg(pg, cdp, s, screen):
    """打字機：同一句長出來不算換句；打完才記、才翻頁"""
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(300); s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']:
            await pg.wait_for_timeout(1700); s2 = await st(pg)
            if s2['typing'] and s2['shown'] != s2['full']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); s2 = await st(pg)
        s = s2
    if s['dlg'] and s['full'] and (not screen or screen[-1][:2] != [s['name'], s['full']]):
        screen.append([s['name'], s['full'], s['zone'], s['hour']])
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)
    return s


async def phone(pg, cdp, tab):
    if not (await st(pg))['phone']:
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)


async def close_phone(pg, cdp):
    for _ in range(3):
        if not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"): return True
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.textContent.trim()==='收起來'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        else: await L.tap(pg, cdp, '#btnPhoneClose')
        await pg.wait_for_timeout(700)
    return not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })", sel)
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def wait_menu(pg, cdp, screen, secs=20):
    """等選單（中間的對話點掉）；回傳選項字"""
    menu = Menu(); t0 = time.time()
    while time.time() - t0 < secs:
        s = await st(pg)
        if s['nb'] and s['ch']:
            if await menu.ready(s): return s['ch']['opts'], menu
            await pg.wait_for_timeout(150); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        await pg.wait_for_timeout(300)
    return None, menu


async def tap_text(pg, cdp, screen, pred, why):
    opts, menu = await wait_menu(pg, cdp, screen)
    if not opts: return None, None
    k = next((i for i, o in enumerate(opts) if pred(o)), None)
    if k is None: return None, opts
    log('    [選項] %s → %s（%s）' % ('｜'.join(opts), opts[k], why))
    await tap_btn(pg, cdp, k); await pg.wait_for_timeout(900)
    return opts[k], opts


# ---------------------------------------------------------------- 前置
async def load_day(pg, cdp, key, hour=10.0):
    c = await pg.evaluate(CAL_JS, key)
    stt = {'zone': 'dorm', 'day': c['d'], 'weekday': c['wd'], 'hour': hour, 'weather': 'clear', 'money': 3000,
           'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'dating_kexin': True, 'KX_DEC3_MIGRATED': True, 'YT_JOB_V': 1, 'NAMECARD_V': 1, 'FAFU_PURE': 1, 'FAFU_STORY_SEEN': 0}}
    try: await L.load_state(pg, stt, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, stt, quiet_events=True)
    await pg.wait_for_timeout(3500)
    await close_phone(pg, cdp); await L.close_panels(pg, cdp)
    await pg.evaluate(HOOK_JS)
    return c


def scene_flags(kind, who, k):
    """前幾場（1～k-1）的 set 旗標：之後的輪換、閒聊可能看（照遊戲資料：記那一天；這裡記一週前）"""
    fl = {}
    for j in range(1, k):
        sc = draft_scene(kind, who, j)
        if sc and sc.get('set'): fl[sc['set']] = True
    return fl


async def setup_part(pg, cdp, cfg, key):
    c = await load_day(pg, cdp, key, cfg.get('h0', 10.0))
    q = {'who': cfg['who'], 'kind': cfg['kind'], 'k': cfg['k'], 'n': cfg['n'], 'rot': cfg.get('rot'), 'rel': REL[cfg['stage']], 'dating': cfg.get('dating', False),
         'flags': cfg.get('flags') or {}, 'mems': cfg.get('mems') or [], 'unmem': cfg.get('unmem') or [], 'rotSrc': cfg.get('rotSrc'), 'pid': None,
         'arcLast': not cfg.get('arc'), 'arcK': cfg.get('arcK')}
    s = await pg.evaluate(SETUP_JS, q)
    return c, s


async def choose_day_place(pg, cdp, tag, cfg, force=False):
    """日子（CALENDAR）× 地點（PLACES_JS）× 時間（TIMES_JS：她會答應、不是期末的飯）；電影另外要片單合這一場（FILM_JS）。
    force（只給 accept_fallback 的段：可昕）：手機清單沒有的地點、她不答應的時間也收，之後用 INV.accept 直接寫邀約【捷徑】"""
    tried = []
    for key in (cfg.get('days') or DAY_KEYS):
        c = await pg.evaluate(CAL_JS, key)
        if c['hol'] or c['typh'] or c['exam'] or (not c['term'] and not cfg.get('any_term')):
            tried.append([key, '假日／颱風／考試週／沒有學期']); continue
        c, s = await setup_part(pg, cdp, cfg, key)
        if cfg['kind'] == 'movie':   # CC 14:5x（ACT_smoke_anmovie／ACT_SMOKE_ZR3 TEST_BUG）：南洋戲院要自己去過才列（invites.js show:V('xs_nanyang')，779／f312c／f8b6 都一樣）；探針沒設＝每一天都「show」略過
            v0 = await pg.evaluate("(()=>{ const V=(GAME.G.visited=GAME.G.visited||{}); const b=!!V.xs_nanyang; V.xs_nanyang=true; return b; })()")
            if not v0: R.setup('[%s]【前置／捷徑】G.visited.xs_nanyang＝true（去過南洋戲院，約看電影的清單才列；%s）' % (cfg.get('tag') or cfg['who'], key))
        pl = await pg.evaluate(PLACES_JS, {'who': cfg['who'], 'kind': cfg['kind']})
        cand = [p for p in pl if force or (not p.get('skip') and not p.get('why'))]
        if not force: tried.append([key, '地點（略過的）', [[p['id'], p.get('skip') or p.get('why')] for p in pl if p.get('skip') or p.get('why')]])
        if cfg['kind'] == 'study': cand.sort(key=lambda p: (p['lib'], p['id']))   # 不在圖書館優先（圖書館要帶路、會自動加（小聲））
        if cfg.get('pids'): cand.sort(key=lambda p: (cfg['pids'].index(p['id']) if p['id'] in cfg['pids'] else 99))
        for p in cand:
            tm = await pg.evaluate(TIMES_JS, {'who': cfg['who'], 'pid': p['id']})
            if isinstance(tm, dict): tried.append([key, p['id'], tm]); continue
            hs = [x for x in tm if x.get('res') == 'accept' and not x.get('te')]
            if force and not hs: hs = [x for x in tm if x.get('h') is not None and not x.get('te')]
            if cfg.get('h_pref'): hs.sort(key=lambda x: abs(x['h'] - cfg['h_pref']))
            if not hs:
                tried.append([key, p['id'], [[x['t'], x.get('res') or x.get('skip'), x.get('why')] for x in tm][:8]]); continue
            film = None
            if cfg['kind'] == 'movie':
                film = await pg.evaluate(FILM_JS, {'who': cfg['who']})
                if cfg.get('want_withmid'):
                    if not film or not film['withMid']: tried.append([key, p['id'], '要 with.mid 的片：%s' % J(film)]); continue
                elif not film or not film['ok'] or (film['withMid'] and not cfg.get('_allow_withmid')):
                    tried.append([key, p['id'], '片單：%s' % J(film)]); continue
            log('  選日子／地點／時間（只讀的查詢）：試過 %s' % J(tried[-12:]))
            fz = bool(force and (p.get('skip') or p.get('why') or hs[0].get('res') != 'accept'))
            return {'key': key, 'cal': c, 'setup': s, 'place': p, 'time': hs[0], 'film': film, 'force': fz}
    if cfg['kind'] == 'movie' and not cfg.get('_allow_withmid') and not cfg.get('want_withmid'):
        log('  每一天的片都有她的 with.mid 或片單不合：改成允許 with.mid（之後把那部片記成她看過【前置】）')
        cfg['_allow_withmid'] = True
        return await choose_day_place(pg, cdp, tag, cfg, force)
    log('  試過 %s' % J(tried))
    if cfg.get('accept_fallback') and not force:
        log('  照手機的清單、她會答應的時間都找不到：改用 INV.accept 直接寫邀約【捷徑】（可昕）')
        return await choose_day_place(pg, cdp, tag, cfg, True)
    return None


# ---------------------------------------------------------------- 約、赴約、見面
async def invite(pg, cdp, tag, cfg, pick, screen):
    """手機「朋友」→ 她的「約」→ 類別 → 地點 → 今天 HH:MM；回傳 iv（約不到＝None）"""
    who = cfg['who']; P = pick['place']; t = pick['time']['t']
    verb = (P.get('verbStudy') or P['verb']) if cfg['kind'] == 'study' else P['verb']
    if pick.get('force'):
        iv = await pg.evaluate(ACCEPT_JS, {'who': who, 'pid': P['id'], 'h': pick['time']['h'], 'cat': 'study' if cfg['kind'] == 'study' else None})
        R.setup('[%s]【捷徑】INV.accept 直接寫一筆約好的邀約（手機清單沒有這個地點或她不答應：%s；%s %s）：%s' % (tag, P.get('skip') or P.get('why') or pick['time'].get('res'), P['id'], t, J(iv)))
        return iv, 'INV.accept【捷徑】'
    await phone(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    how = '手機「朋友」→「約」'
    if not await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who):
        body = await pg.evaluate(TODAY_TXT_JS)
        R.setup('[%s] 手機「朋友」沒有 %s 的「約」（%s）' % (tag, who, body[:160].replace('\n', ' ')))
        await close_phone(pg, cdp)
        if cfg.get('accept_fallback'):
            iv = await pg.evaluate(ACCEPT_JS, {'who': who, 'pid': P['id'], 'h': pick['time']['h'], 'cat': 'study' if cfg['kind'] == 'study' else None})
            R.setup('[%s]【捷徑】INV.accept 直接寫一筆約好的邀約：%s %s %s%s' % (tag, P['id'], t, J(iv), '（沒交往約不到她，這一版正常玩家玩不到；BB：不是問題）' if cfg.get('kx_note') else ''))
            return iv, 'INV.accept【捷徑】'
        R.check('[%s] 手機「朋友」有 %s 的「約」' % (tag, who), False, body[:300]); return None, None
    await pg.wait_for_timeout(1200)
    lab = CAT_LABEL[cfg['kind']]
    got = None
    for _ in range(4):
        got, opts = await tap_text(pg, cdp, screen, lambda o: o == verb or o.startswith(lab), '類別／地點')
        if got is None: break
        if got == verb: break
    if got != verb:
        R.check('[%s] 邀約選單選到「%s」' % (tag, verb), False, J(opts)); return None, how
    got, opts = await tap_text(pg, cdp, screen, lambda o: o == t, '時間')
    if got is None:
        R.check('[%s] 時間選單有「%s」' % (tag, t), False, J(opts)); return None, how
    # 她的回答（resched 的「好，就…」照按；其他對話點掉）
    t0 = time.time(); menu = Menu()
    while time.time() - t0 < 25:
        s = await st(pg)
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            k = next((i for i, o in enumerate(s['ch']['opts']) if o.startswith('好，就')), 0)
            log('    [選項] %s → %s（她的回答）' % ('｜'.join(s['ch']['opts']), s['ch']['opts'][k]))
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        if time.time() - t0 > 3: break
        await pg.wait_for_timeout(400)
    await close_phone(pg, cdp)
    iv = await pg.evaluate("(q=>{ const L=(GAME.G.invites||[]).filter(v=>v.who===q.w&&v.place===q.p&&v.day===GAME.G.day&&v.state==='accepted'); const v=L[L.length-1]; return v?{id:v.id,h:v.h,film:v.film||null,cat:v.cat||null}:null; })", {'w': who, 'p': P['id']})
    return iv, how


SITPATH = os.environ.get('SITPATH') == '1'
SITFIRST = os.environ.get('SITFIRST') == '1'   # CC 15:2x（LAWWW 15:20）：她出現以前（iv.h−0.25 以前）先進大廳坐長椅等她，看約會會不會開始   # CC 15:1x（BB 15:07）：一到就走去按「坐下等開演」，不等 5 秒自動開始
PATH_SEEN = []


IDLE_JS = r"""(w=>{ const E=GAME.E, P=E.player, D=GAME.D||{}, f2=v=>v==null?null:+(+v).toFixed(2); const n=(GAME.npc&&GAME.npc[w])||(E.npcs||[]).find(q=>q.charId===w);
  return {me:{x:f2(P.obj.position.x), z:f2(P.obj.position.z), busy:!!P.busy, pose:P.pose||null, seat:!!P.seat, frozen:!!P.frozen}, cam:E.cam&&E.cam.mode, depth:D.busyDepth|0, by:(D.busyWho||[]).slice(-3), dlg:!!D.active,
    ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, adv:typeof ADV!=='undefined'&&!!ADV.active, paused:!!E.paused, fade:!!(document.getElementById('fade')&&document.getElementById('fade').classList.contains('on')),
    her:n&&n.obj?{x:f2(n.obj.position.x), z:f2(n.obj.position.z), seat:!!n.seat, pose:n.pose||null, vis:n.obj.visible!==false}:null, dark:window.__dark==null?null:!!window.__dark,
    zone:GAME.G.zone, hour:f2(GAME.G.hour), seatAt:P.seat?[f2(P.seat.x),f2(P.seat.z)]:null,
    layers:['fade','dlg','choices','adv','letterbox','cine','dark','hallDark'].map(id=>{ const e=document.getElementById(id); if(!e) return null; const c=getComputedStyle(e); return {id, cls:e.className, op:c.opacity, z:c.zIndex, disp:c.display, vis:c.visibility, txt:(e.textContent||'').trim().slice(0,80)}; }).filter(Boolean),
    top:(()=>{ const e=document.elementFromPoint(innerWidth/2, innerHeight*0.8); return e?(e.id||String(e.className).slice(0,40)||e.tagName):null; })(),
    say:window.__ccLastSay||null, ivs:(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day).map(v=>({id:v.id,st:v.state,ph:v.lead&&v.lead.ph,zone:v.zone,waitSeat:v.waitSeat||null,film:v.film||null})),
    cons:(window.__ccCons||[]).slice(-6)}; })"""


HOOK_SAY_JS = r"""(()=>{ if(window.__ccHookSay) return; window.__ccHookSay=1; window.__ccCons=[];
  for(const k of ['warn','error']){ const o=console[k].bind(console); console[k]=(...a)=>{ try{ window.__ccCons.push(k+': '+a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,200)); }catch(e){} return o(...a); }; }
  window.addEventListener('error',e=>{ window.__ccCons.push('onerror: '+String(e.message).slice(0,200)); });
  window.addEventListener('unhandledrejection',e=>{ window.__ccCons.push('reject: '+String(e.reason&&e.reason.stack||e.reason).slice(0,200)); });
  const GM=GAME; if(GM&&GM.say&&!GM.say.__cc){ const o=GM.say; const f=function(...a){ try{ window.__ccLastSay={t:String(a[1]!=null?a[1]:a[0]).slice(0,80), who:typeof a[0]==='string'?a[0].slice(0,20):null, at:+(+GAME.G.hour).toFixed(2)}; }catch(e){} return o.apply(this,a); }; f.__cc=1; GM.say=f; } })()"""


async def go_meet(pg, cdp, tag, cfg, iv, screen, shots, max_s=900):
    """【捷徑】撥到約好的前 10 分鐘 → 手機「今天」現在過去 → 走到她旁邊／坐下 → 見面整段（選項：活動那一組照 pick，其他選第一個）"""
    who = cfg['who']
    if SITFIRST:   # CC 15:2x（LAWWW 15:20）：真的測「先到、坐下等她」：她出現（iv.h−0.25）以前就坐在大廳長椅上
        z = iv.get('zone') or 'xs_nanyang'
        await pg.evaluate("(([h,z])=>{ GAME.G.hour=h; return GAME.enter(z); })", [iv['h'] - 1.0, 'xs_nanyang']); await pg.wait_for_timeout(4000); await close_phone(pg, cdp)
        R.setup('[%s]【前置／捷徑】時間撥到約好的前 60 分鐘（%.2f）、GAME.enter 直接進南洋戲院大廳（她 iv.h−0.25 才出現；PC 每秒約 0.45 遊戲分鐘，留 45 分鐘走到長椅）' % (tag, iv['h'] - 1.0))
        await pg.evaluate(HOOK_SAY_JS)
        # CC-C 11-12 第二版（be1e 雲端：到長椅 0.82 m、互動鍵一直空的——那一張有路人坐著，遊戲 nearestInteractable 的 occupied 不出按鈕＝照設計；
        #   PC rel_r3 30 秒後才出現也是路人起身了）：照 CC_02 乙 3，長椅依距離一張一張試、有人坐（E.npcs 的 seat 0.4 m 內）的跳過；每張分段走、到了等互動鍵 8 秒；
        #   按之前確認畫面最上面是互動鍵；按完確認真的坐下、她還不在。全部都沒有就等到她出現前（iv.h−0.3）再從頭試一輪
        BENCH_JS = "(()=>{ const E=GAME.E, P=E.player.obj.position; const L=(E.interactables||[]).filter(i=>String(typeof i.label==='function'?i.label():i.label||'').startsWith('坐下等開演')).map(i=>({x:i.x,z:i.z,sx:i.seat?i.seat.x:i.x,sz:i.seat?i.seat.z:i.z,d:Math.hypot(i.x-P.x,i.z-P.z),occ:(E.npcs||[]).some(n=>n.seat&&Math.hypot(n.seat.x-(i.seat?i.seat.x:i.x),n.seat.z-(i.seat?i.seat.z:i.z))<0.4)})); L.sort((a,b)=>a.d-b.d); return L; })()"
        benches = await pg.evaluate(BENCH_JS)
        if not R.check('[%s] SITFIRST：大廳有「坐下等開演」長椅' % tag, bool(benches), J(benches)): return False
        log('    [長椅] %s' % J(benches))
        s0 = await st(pg); tried = []; got = False; stop = False
        for rnd in range(2):
            for bi in range(len(benches)):
                bl = await pg.evaluate(BENCH_JS); b = bl[bi] if bi < len(bl) else None
                if not b: continue
                if b['occ']: tried.append([round(b['sx'], 2), round(b['sz'], 2), '有人坐']); continue
                tw = time.time()
                while time.time() - tw < 40:   # 分段走（每段 6 秒、每段前看 busy／dlg／nb；CC_02 乙 13）
                    s0 = await st(pg)
                    if s0['busy'] or s0['dlg'] or s0['nb']: log('    [走路中斷] busy=%s dlg=%s nb=%s（%.2f）' % (s0['busy'], s0['dlg'], s0['nb'], s0['hour'])); stop = True; break
                    if s0['interact'].startswith('坐下等開演'): break
                    if await L.go_to(pg, cdp, R, b['x'], b['z'], 0.7, '走到長椅 (%.2f, %.2f)' % (b['sx'], b['sz']), max_s=6): break
                if stop: break
                t8 = time.time()
                while time.time() - t8 < 8 and not s0['interact'].startswith('坐下等開演'):
                    await pg.wait_for_timeout(700); s0 = await st(pg)
                if s0['interact'].startswith('坐下等開演'): got = True; break
                tried.append([round(b['sx'], 2), round(b['sz'], 2), '互動鍵「%s」' % s0['interact']])
            if got or stop: break
            h_now = await pg.evaluate("+(+GAME.G.hour).toFixed(2)")
            if rnd == 0 and h_now < iv['h'] - 0.4:
                log('    [長椅都不行] %s；等到 %.2f 前再試一輪' % (J(tried), iv['h'] - 0.4))
                tw2 = time.time()
                while time.time() - tw2 < 120 and await pg.evaluate("+GAME.G.hour") < iv['h'] - 0.4: await pg.wait_for_timeout(2000)
        h0 = await pg.evaluate("+(+GAME.G.hour).toFixed(2)"); her0 = await pg.evaluate(NPC_JS, who)
        if not got:
            dg = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position, f=v=>+(+v).toFixed(2); return {me:[f(P.x),f(P.z)], near:(GAME.E.interactables||[]).map(i=>({l:String(typeof i.label==='function'?i.label():i.label||'').slice(0,12), d:f(Math.hypot(i.x-P.x,i.z-P.z)), r:i.radius||0})).sort((a,b)=>a.d-b.d).slice(0,4)}; })()")
            log('    [診斷] 每張長椅都按不到「坐下等開演」：試過 %s；現在 %s' % (J(tried), J(dg)))
        else:
            top = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); if(!b) return null; const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return e?(b.contains(e)?'interact':(e.id||String(e.className).slice(0,40)||e.tagName)):null; })()")
            if top != 'interact': log('    [注意] 互動鍵中心最上面是 %s，不是互動鍵' % top)
            log('    [按互動鍵] %s（%.2f，她%s；之前跳過 %s）' % (s0['interact'], h0, '已經在' if her0 else '還沒出現', J(tried))); PATH_SEEN.append(s0['interact']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        sat0 = await pg.evaluate("(()=>{ const P=GAME.E.player; return {seat:!!P.seat, pose:P.pose||null}; })()"); her1 = await pg.evaluate(NPC_JS, who)
        log('    [坐下後] %s；她 %s' % (J(sat0), J(her1)))
        R.check('[%s] SITFIRST：她出現以前就坐下了（按的時候 %.2f＜%.2f、她還不在；按完人在座位上）' % (tag, h0, iv['h'] - 0.25), bool(PATH_SEEN) and h0 < iv['h'] - 0.25 and not her0 and sat0['seat'], J({'h': h0, 'her': her0, 'btn': s0['interact'], 'sat': sat0, 'tried': tried}))
    else:
        await pg.evaluate("(h=>{ GAME.G.hour=h; })", iv['h'] - 0.17); await pg.wait_for_timeout(1200)
        R.setup('[%s]【捷徑】時間撥到約好的前 10 分鐘（%.2f）' % (tag, iv['h'] - 0.17))
    if not SITFIRST:
        await phone(pg, cdp, 'today')
        if not await tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id']):
            R.check('[%s] 手機「今天」有「現在過去」' % tag, False, (await pg.evaluate(TODAY_TXT_JS))[:300]); await close_phone(pg, cdp); return False
        log('    [按] 手機「今天」現在過去')
    await pg.wait_for_timeout(1500)
    await pg.evaluate(HOOK_SAY_JS)   # CC 15:0x（LAWWW 要的 ④⑤：console 的 warn／error、最後一句 GM.say）
    menu = Menu(); t0 = time.time(); walked = 0; reopen = 0; same = [None, 0]; done_t = None; zt = [None, 0]; idle_t = time.time(); idle_n = 0
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['zone'] != zt[0]: zt = [s['zone'], time.time()]; log('    [區域] %s（%.2f）' % (s['zone'], s['hour']))
        v = await pg.evaluate(IV_JS, iv['id'])
        if v and v['st'] in ('done', 'missed', 'cancelled') and not v['mid'] and not s['dlg'] and not s['nb'] and not s['busy']:
            if done_t is None: done_t = time.time()
            if time.time() - done_t > 2.5: break
            await pg.wait_for_timeout(500); continue
        done_t = None
        if s['phone'] and not s['nb']:
            reopen += 1; await close_phone(pg, cdp)
            if reopen > 8: break
            continue
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['ch']['opts']
            k = cfg['_pickfn'](opts)
            if k is None:
                k = next((i for i, o in enumerate(opts) if o.startswith('直接過去')), None)
            if k is None:
                k = next((i for i, o in enumerate(opts) if not s['ch']['dim'][i] and not any(w in o for w in EXIT_WORDS)), 0)
                log('    [選項] %s → %s（不是活動那一組：選第一個能選的）' % ('｜'.join(opts), opts[k]))
            else:
                log('    [選項] %s → %s' % ('｜'.join(opts), opts[k]))
                if cfg['_is_act'](opts) and 'opts' not in shots:
                    shots.add('opts'); await R.shot(pg, 'act_%s_opts' % tag)
            sig = (opts[k], s['zone'], s['hour'])
            same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6:
                await R.shot(pg, 'act_%s_stuckopt' % tag); R.check('[%s] 選項「%s」按得下去' % (tag, opts[k]), False); return False
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['nb'] and not s['ch']:   # CC 15:2x（LAWWW 15:20 盲點②）：game3d 內部的 choose（長椅 seatMenu 等）不經 GAME.choose，HOOK 抓不到——照按鈕文字選，記 log
            bt = s['btn']; v0 = v or {}
            want = ('坐一下',) if (SITFIRST and v0.get('st') == 'accepted') else ('起身', '算了', '返回')
            k = next((i for i, t in enumerate(bt) if any(t.startswith(w) for w in want)), None)
            if k is None: k = next((i for i, t in enumerate(bt) if any(w in t for w in EXIT_WORDS)), 0)
            log('    [選項（遊戲內部選單）] %s → %s' % ('｜'.join(bt), bt[k] if bt else None))
            sig = (('int',) + tuple(bt), s['zone'], s['hour']); same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6: await R.shot(pg, 'act_%s_stuckopt' % tag); R.check('[%s] 遊戲內部選單「%s」按得下去' % (tag, bt[k] if bt else ''), False); return False
            await tap_btn(pg, cdp, k); await pg.wait_for_timeout(1500); continue
        if s['dlg']:
            n0 = len(screen); s2 = await tap_dlg(pg, cdp, s, screen)
            if len(screen) > n0 and 'line' not in shots and any(w in s2['full'] for w in cfg.get('shot_on', [])):
                shots.add('line'); await R.shot(pg, 'act_%s_line' % tag)
            continue
        if v and v['st'] == 'accepted' and not s['busy'] and (v['ph'] == 'wait' or v['zone'] == s['zone']) and walked < 6 and time.time() - zt[1] > (0 if SITPATH else 5):   # 進那個區域 5 秒還沒開始（她坐著等、帶路）才走過去；SITPATH＝一到就去按「坐下等開演」（BB 15:07：測坐下路徑）
            n = await pg.evaluate(NPC_JS, who)
            if n:
                walked += 1
                tw = time.time(); s3 = s
                while time.time() - tw < 90:   # CC 15:2x（LAWWW 15:20 盲點①）：L.go_to 途中會盲點對話／選單——改成 6 秒一段，每段前先看 busy／dlg／nb，出現就回主迴圈處理
                    s3 = await st(pg)
                    if s3['busy'] or s3['dlg'] or s3['nb']: log('    [走路中斷] busy=%s dlg=%s nb=%s（%.2f）' % (s3['busy'], s3['dlg'], s3['nb'], s3['hour'])); break
                    n = await pg.evaluate(NPC_JS, who) or n
                    if await L.go_to(pg, cdp, R, n['x'], n['z'], 1.6, '走到她旁邊', lv=n['lv'], max_s=6): s3 = await st(pg); break
                if s3['busy'] or s3['dlg'] or s3['nb']: continue
                s3 = await st(pg)
                if s3['interact'] and (s3['interact'].startswith('坐') or '說話' in s3['interact']) and not s3['dlg']:
                    log('    [按互動鍵] %s' % s3['interact']); PATH_SEEN.append(s3['interact']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
                continue
        if time.time() - idle_t > 30:   # CC 15:0x（ACT_SMOKE_ZR3_r2 f8b6：坐下等開演以後 6 分鐘沒有任何紀錄就逾時）：沒進展每 30 秒記一次狀態，前兩次截圖
            idle_t = time.time(); idle_n += 1
            dg = await pg.evaluate(IDLE_JS, who)
            log('    [等待 %d] 狀態 %s；邀約 %s；%s' % (idle_n, J({k: s.get(k) for k in ('zone', 'hour', 'busy', 'dlg', 'nb', 'phone', 'interact')}), J(v), J(dg)))
            if idle_n <= 2: await R.shot(pg, 'act_%s_idle%d' % (tag, idle_n))
        await pg.wait_for_timeout(500)
    v = await pg.evaluate(IV_JS, iv['id'])
    sat = [x for x in PATH_SEEN if x.startswith('坐下')]
    R.note('[%s] 走的路：%s（按過的互動鍵 %s）' % (tag, '坐下路徑（玩家先按「%s」）' % sat[0] if sat else '自動開始（沒有按坐下）', J(PATH_SEEN)))
    if SITPATH: R.check('[%s] 前置：這一趟走的是「先到、按坐下等開演」路徑（SITPATH）' % tag, bool(sat), J(PATH_SEEN))
    return bool(v and v['st'] == 'done')


# ---------------------------------------------------------------- 判定
def seq_match(says, exp, who):
    """exp＝[(role, 字)] 照順序在 says 裡找（可以夾別的句子）；回傳 (缺的, 說話人錯的)"""
    miss, badrole = [], []; j = 0
    for r, t in exp:
        k = None
        for i in range(j, len(says)):
            x = says[i]; tx = x['t']
            if tx.startswith('（小聲）') and not t.startswith('（小聲）'): tx = tx[len('（小聲）'):]
            if tx == t: k = i; break
        if k is None: miss.append(t); continue
        x = says[k]; j = k + 1
        ok = (x['cid'] == '' and not x['who']) if r == 'narr' else (x['cid'] == who)
        if not ok: badrole.append([t, x['who'], x['cid']])
    return miss, badrole


def rel_diff(a, b):
    out = {}
    for k in sorted(set((a or {}).keys()) | set((b or {}).keys())):
        x, y = (a or {}).get(k), (b or {}).get(k)
        if x != y: out[k] = [x, y]
    return out


def fx_ok(fx):
    return all((v or 0) >= 0 for v in (fx or {}).values() if isinstance(v, (int, float)))


def dict_eq(a, b):
    na = {k: v for k, v in (a or {}).items() if v}
    nb = {k: v for k, v in (b or {}).items() if v}
    return na == nb


def static_cmp(tag, pg_sc, dr_sc):
    """遊戲資料（頁面）這一場＝稿（不比 unlock、alt 的條件寫法）"""
    if dr_sc is None or pg_sc is None:
        R.note('[%s] 靜態比對略過（稿 %s、頁面 %s）' % (tag, '有' if dr_sc else '沒有', '有' if pg_sc else '沒有')); return
    a, b = norm_sc(pg_sc), dr_sc
    diff = []
    for k in ('need', 'set', 'seat', 'mid', 'pack', 'bye', 'day'):
        if (a.get(k) or None) != (b.get(k) or None): diff.append([k, a.get(k), b.get(k)])
    if len(a['opts']) != len(b['opts']): diff.append(['opts 數', len(a['opts']), len(b['opts'])])
    for x, y in zip(a['opts'], b['opts']):
        if x['t'] != y['t'] or x['reply'] != y['reply'] or not dict_eq(x['fx'], y['fx']) or not dict_eq(x['rel'], y['rel']): diff.append(['opt', x, y])
    aa, ba = a.get('alt') or {}, b.get('alt') or {}
    for k in ('seat', 'mid', 'pack', 'bye'):
        if aa.get(k) != ba.get(k): diff.append(['alt.' + k, aa.get(k), ba.get(k)])
    if [o['t'] for o in aa.get('opts') or []] != [o['t'] for o in ba.get('opts') or []]: diff.append(['alt.opts', aa.get('opts'), ba.get('opts')])
    R.check('[%s] 遊戲資料（頁面上的這一場）＝稿逐字（seat／mid／選項／回話／fx／pack／bye／alt）' % tag, not diff, J(diff[:6]))


def draft_rules(tag, sc, k):
    """BB 定的稿規則（11-11，AA_708 _meta）：每場兩個選項、都不扣分；need 1、2 不給 love；只有第 4 場可以 love 2（舊 rel 的不管）——印【觀察】，不判"""
    if not sc: return
    obs = []
    if sc['opts'] and len(sc['opts']) != 2: obs.append('選項 %d 個' % len(sc['opts']))
    for o in sc['opts'] + ((sc.get('alt') or {}).get('opts') or []):
        if not fx_ok(o['fx']) or not fx_ok(o['rel']): obs.append('有負的：%s %s' % (o['t'], J(o['fx'] or o['rel'])))
        if (sc.get('need') or 0) <= 2 and (o['fx'] or {}).get('love'): obs.append('need %s 給了 love：%s' % (sc.get('need'), o['t']))
        if ((o['fx'] or {}).get('love') or 0) >= 2 and str(k) != '4': obs.append('第 %s 場 love %s：%s' % (k, o['fx']['love'], o['t']))
        if CONTACT_BASE.search(' '.join(o['reply'])) and sc.get('alt') and o in sc['opts']: obs.append('base 版的選項回話有肢體字（BB 07:56：玩家先動，可以）：%s → %s' % (o['t'], o['reply']))
    if obs: log('  【觀察】%s 稿規則：%s' % (tag, J(obs)))


# ---------------------------------------------------------------- 一段
PART_CFG = {}


def act_part(name, who, kind, k, stage, pick, **kw):
    d = dict(who=who, kind=kind, k=k, n=k - 1, stage=stage, pick=pick); d.update(kw); PART_CFG[name] = d


act_part('AN_MOVIE_A', 'heroine_01', 'movie', 1, 4, 0, h_pref=14)
act_part('AN_MOVIE_B', 'heroine_01', 'movie', 1, 4, 1, h_pref=14)
act_part('AN_BOOK_A', 'heroine_01', 'bookstore', 1, 4, 0, h_pref=14, pids=['bookstore', 'xs_shanlan'])
act_part('AN_BOOK_B', 'heroine_01', 'bookstore', 1, 4, 1, h_pref=14, pids=['bookstore', 'xs_shanlan'])
for nm, w, base_w, alt_w in (('ZR3', 'heroine_02', '中間隔著一點點', '沒有移開'), ('YT3', 'heroine_03', '手臂貼著', '肩膀上'), ('KX3', 'kexin', '又坐正', '頭靠過來')):
    for sfx, pk_ in (('', PICK3), ('_P0', 0), ('_P1', 1)):   # BB 07:56 ②：base 兩個選項都要跑（_P0＝第 1 個、_P1＝第 2 個；不加尾巴＝PICK3）
        act_part(nm + '_BASE' + sfx, w, 'movie', 3, 4, pk_, dating=False, base=True, shot_on=[base_w, alt_w], base_word=base_w, alt_word=alt_w, h_pref=14, accept_fallback=(w == 'kexin'),
                 kx_note=(w == 'kexin'))
    act_part(nm + '_ALT', w, 'movie', 3, 4, PICK3, dating=True, alt=True, shot_on=[base_w, alt_w], base_word=base_w, alt_word=alt_w, h_pref=14, accept_fallback=(w == 'kexin'))
for i in range(1, 5):
    act_part('PS%d' % i, 'classmate_peishan', 'eat', i, max(2, i), PS_PICK, ban=PS_BAN, h_pref=12.2)
act_part('FALLBACK', 'heroine_01', 'bookstore', 2, 2, 0, generic=True, h_pref=14, pids=['bookstore', 'xs_shanlan'])
act_part('ROTATE', 'heroine_01', 'eat', 5, 4, 0, rot=-1, rotate=True, h_pref=12.2)
act_part('ST_AN1_A', 'heroine_01', 'study', 1, 2, 0, h_pref=15.5)
act_part('ST_AN1_B', 'heroine_01', 'study', 1, 2, 1, h_pref=15.5)
act_part('ST_PS1_A', 'classmate_peishan', 'study', 1, 2, 0, h_pref=15.5, ban=PS_BAN)
act_part('ST_PS1_B', 'classmate_peishan', 'study', 1, 2, 1, h_pref=15.5, ban=PS_BAN)
act_part('ST_AN6_NOPAGE', 'heroine_01', 'study', 6, 5, 0, unmem=['AN_SHOP_PAGE'], six=True, an6='nopage', h_pref=15.5,
         shot_on=['手壓著下半頁', '她翻到你看過的那一頁'])
act_part('ST_AN6_PAGE', 'heroine_01', 'study', 6, 5, 0, mems=['AN_SHOP_PAGE'], alt=True, six=True, an6='page', h_pref=15.5,
         shot_on=['手壓著下半頁', '她翻到你看過的那一頁'])
for nm, w in (('ST_ZR6', 'heroine_02'), ('ST_YT6', 'heroine_03'), ('ST_PS6', 'classmate_peishan'), ('ST_KX6', 'kexin')):
    act_part(nm, w, 'study', 6, 5, 0, six=True, h_pref=15.5, dating=(w == 'kexin'), accept_fallback=(w == 'kexin'))
act_part('ST_LOWNEED', 'heroine_01', 'study', 3, 2, 0, generic=True, h_pref=15.5)
# BB 08:07（f8b6d1e82）
act_part('ZR3_SMOKE', 'heroine_02', 'movie', 3, 4, 0, dating=True, alt=True, smoke=True, shot_on=['中間隔著一點點', '沒有移開'], base_word='中間隔著一點點', alt_word='沒有移開', h_pref=14)
act_part('ST_BEAT_DEFER', 'heroine_01', 'study', 2, 2, 0, arc=True, beat_defer=True, h_pref=15.5)
act_part('MOVIE_WITHMID', 'heroine_02', 'movie', 1, 4, 0, withmid=True, want_withmid=True, any_term=True, accept_fallback=True, h_pref=14,
         days=['2027-07-03', '2027-07-10', '2027-07-17', '2027-07-24', '2027-07-31', '2027-07-04', '2027-07-11', '2027-07-18', '2027-07-25'])


async def smoke_checks(tag, ev, i_meet, act_opts, rs, pick, name, who, ver, pk):
    """ZR3_SMOKE（BB 08:07）：電影第 N 場的選項（全是（…）開頭）在暗的廳裡、小動作後面選，回話也在廳裡；聊電影（MOVIES.after 的選項）在散場以後。
    廳＝zone xs_nanyang_hall；放映中＝MOVIES.lights(false) 以後、lights(true) 以前（探針包住 MOVIES.lights 記的 __dark）"""
    E2 = ev[i_meet:]
    log('== %s 冒煙：選項、回話、聊電影出現的位置' % tag)
    mi = next((i for i, e in enumerate(E2) if e['k'] == 'ch' and e['opts'] == act_opts), None)
    if not R.check('[%s] 第 N 場的選項有出現：%s' % (tag, '｜'.join(act_opts)), mi is not None, J([e['opts'] for e in E2 if e['k'] == 'ch'])): return
    m = E2[mi]
    prev = next((e for e in reversed(E2[:mi]) if e['k'] == 'say'), None)
    lights = [[e['on'], e['z']] for e in E2 if e['k'] == 'lights']
    log('  選項出現當下：zone %s、放映中 %s；前一句「%s」（%s）；場燈紀錄 %s' % (m.get('z'), m.get('dark'), (prev or {}).get('t'), (prev or {}).get('z'), J(lights)))
    darkmid = [t.replace('{name}', name) for t in rs['mid'] if narr_whole(t)]
    R.check('[%s] 選項在廳裡（zone xs_nanyang_hall）、放映中（場燈關著）' % tag, m.get('z') == 'xs_nanyang_hall' and bool(m.get('dark')),
            J({'zone': m.get('z'), 'dark': m.get('dark'), '修改前': '7266e7a29 選項在走出 1 廳以後（zone xs_nanyang、場燈開）＝FAIL'}))
    R.check('[%s] 選項接在小動作後面（前一句是這一場 mid 的最後一句旁白）' % tag, bool(prev) and bool(darkmid) and prev['t'] == darkmid[-1], J({'前一句': (prev or {}).get('t'), '小動作': darkmid}))
    o = rs['opts'][min(pick, len(rs['opts']) - 1)]
    reply = [t.replace('{name}', name) for t in o['reply']]
    rs_ev = [e for e in E2[mi + 1:] if e['k'] == 'say' and e['t'] in reply]
    log('  回話出現當下：%s' % J([[e['t'], e.get('z'), e.get('dark')] for e in rs_ev]))
    R.check('[%s] 回話在廳裡、放映中' % tag, len(rs_ev) == len(reply) and all(e.get('z') == 'xs_nanyang_hall' and e.get('dark') for e in rs_ev), J([[e['t'], e.get('z'), e.get('dark')] for e in rs_ev]))
    talk = await PG[0].evaluate(TALK_JS, {'who': who, 'film': (pk.get('film') or {}).get('film')}) if pk.get('film') else None
    tm = [e for e in E2 if e['k'] == 'ch' and talk and e['opts'] and any(x in talk for x in e['opts'])]
    log('  聊電影的選項（MOVIES.talkFor）%s；出現當下 %s' % (J(talk), J([[e['opts'], e.get('z'), e.get('dark')] for e in tm])))
    if talk: R.check('[%s] 聊電影那段在散場以後（不在廳裡、場燈開）' % tag, bool(tm) and all(e.get('z') != 'xs_nanyang_hall' and not e.get('dark') for e in tm), J([[e['opts'], e.get('z'), e.get('dark')] for e in tm]))
    else: log('  【觀察】%s 這部片沒有給她的聊電影選項（talkFor 空的），這一項不判' % tag)
    if not ver.get('actDefer'): log('  【觀察】%s 頁面沒有 actDefer（修改前的版本）：上面「選項在廳裡」預期 FAIL（D34）' % tag)


PG = [None]


async def beat_defer_part(pg, cdp, errs, tag):
    """ST_BEAT_DEFER（BB 08:07 (b)）：以安一起念書第 2 場（need 2），當天有故事線那一拍（ARCS.pick＝第 1 拍）取代第 2 場的中途
    → 總次數照算、第 2 場不推進；【捷徑】隔天（讀回同一份存檔、只改日子，故事線當天不演）再約同一個地方 → 演到第 2 場（中途、選項）、推進到第 3 場"""
    cfg = dict(PART_CFG[tag]); who, kind, k = cfg['who'], cfg['kind'], cfg['k']
    e0 = len(errs)
    cfg['flags'] = dict(scene_flags(kind, who, k))
    pk = await choose_day_place(pg, cdp, tag, cfg)
    if not R.check('[%s] 找得到能約的日子、地點、她會答應的時間' % tag, bool(pk)): return
    s = pk['setup']; name = s['name']; ver = await pg.evaluate(VER_JS)
    R.setup('[%s] 讀檔：%s（第 %d 天）10:00、%s 第 %s 階、STUDYN n %d k %d、BEATS 從第 1 拍（last＝null：今天會演一拍）；地點 %s %s；ARCS.pick＝%s；版本 %s' % (
        tag, pk['key'], pk['cal']['d'], who, s['stage'], cfg['n'], k, pk['place']['id'], pk['time']['t'], J(s.get('arc')), J(ver)))
    if not R.check('[%s] 前置：今天有故事線那一拍（ARCS.pick 不是 null）' % tag, bool(s.get('arc')) and not s['arc'].get('err'), J(s.get('arc'))): return
    sc = draft_scene(kind, who, k)
    if not sc:   # CC 14:5x（ACT_SMOKE_BEAT KeyError 'seat'：PC 讀不到 AA_707／708 稿）：和一般段一樣，改比頁面上的遊戲資料
        pgs = await pg.evaluate(PAGE_SCENE_JS, {'who': who, 'kind': kind})
        sc = norm_sc(((pgs or {}).get('scenes') or {}).get(str(k))) or {}
        R.note('[%s] 讀不到稿（%s）：逐字改比頁面上的遊戲資料（第 %s 場：%s）' % (tag, DRAFT707 if kind == 'study' else DRAFT708, k, '有' if sc else '也沒有'))
    rs = resolve(sc, False, True); act_opts = [o['t'].replace('{name}', name) for o in rs.get('opts', [])]
    arc_opts = s['arc']['opts']
    cfg['_is_act'] = lambda opts: opts == act_opts
    cfg['_pickfn'] = lambda opts: 0 if (opts == act_opts or opts == arc_opts) else None
    rows = []
    for rnd in (1, 2):
        b0 = await pg.evaluate(REC_JS, {'who': who, 'kind': kind, 'set': sc.get('set')})
        await pg.evaluate(HOOK_JS); screen = []; shots = set()
        iv, how = await invite(pg, cdp, '%s_%d' % (tag, rnd), cfg, pk, screen)
        if not R.check('[%s] 第 %d 次約成了（%s）' % (tag, rnd, how), bool(iv), J(iv)): return
        ok = await go_meet(pg, cdp, '%s_%d' % (tag, rnd), cfg, iv, screen, shots)
        await R.shot(pg, 'act_%s_%d_end' % (tag, rnd))
        ev = await pg.evaluate("window.__AE||[]"); a0 = await pg.evaluate(REC_JS, {'who': who, 'kind': kind, 'set': sc.get('set')})
        R.check('[%s] 第 %d 次赴約演完' % (tag, rnd), ok, '')
        says = [e for e in ev if e['k'] == 'say']; menus = [e for e in ev if e['k'] == 'ch']
        log('== %s 第 %d 次逐字' % (tag, rnd))
        for e in ev:
            if e['k'] == 'say': log('  [說] %s｜%s' % (e['who'] or '（旁白）', e['t']))
            elif e['k'] == 'ch': log('  [選項] %s → %s' % ('｜'.join(e['opts']), e.get('pick')))
        joined = [e['t'].replace('（小聲）', '', 1) for e in says]
        mid = [t.replace('{name}', name) for t in rs.get('mid', [])]
        rb, ra = b0['rec'] or {}, a0['rec'] or {}
        rows.append([rnd, rb, ra])
        if rnd == 1:
            R.check('[%s] 第 1 次：故事線那一拍有演（她問「%s」、拍的選項出現）' % (tag, ''.join(s['arc']['ask'])), any(t in joined for t in s['arc']['ask']) and any(m['opts'] == arc_opts for m in menus), '')
            R.check('[%s] 第 1 次：第 %d 場的中途、選項被取代（沒演）' % (tag, k), not any(t in joined for t in mid) and not any(m['opts'] == act_opts for m in menus), J([t for t in mid if t in joined]))
            R.check('[%s] 第 1 次：總次數 +1、第 %d 場不推進（%s → %s）' % (tag, k, J(rb), J(ra)), ra.get('n') == (rb.get('n') or 0) + 1 and ra.get('k') == k,
                    '修改前（7266e7a29）會推進到 k+1＝第 %d 場的中途、選項永遠看不到' % k)
            G2 = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G))")
            nx = None
            for dd in range(1, 8):
                c2 = await pg.evaluate("(d=>{ const x=CALENDAR.dateOf(d), t=CALENDAR.termOf?CALENDAR.termOf(d):null; return {d, wd:((x.wd%7)+7)%7, k:x.y+'-'+x.m+'-'+x.d, hol:!!(CALENDAR.holiday&&CALENDAR.holiday(d)), typh:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)), exam:!!(t&&t.exam)}; })", G2['day'] + dd)
                if not (c2['hol'] or c2['typh'] or c2['exam']): nx = c2; break
            G2['day'] = nx['d']; G2['weekday'] = nx['wd']; G2['hour'] = 10.0; G2['zone'] = 'dorm'; G2.pop('pos', None); G2['invites'] = []
            try: await L.load_state(pg, G2, quiet_events=True, quiet_phone=True)
            except TypeError: await L.load_state(pg, G2, quiet_events=True)
            await pg.wait_for_timeout(3500); await close_phone(pg, cdp); await L.close_panels(pg, cdp)
            q2 = await pg.evaluate("(w=>{ const r=ARCS.rec(GAME.G,w); r.last=GAME.G.day; const S=STUDYN.rec(GAME.G)[w]; return {beats:JSON.parse(JSON.stringify(r)), studyn:S}; })", who)
            tm = await pg.evaluate(TIMES_JS, {'who': who, 'pid': pk['place']['id']})
            hs = [x for x in (tm if isinstance(tm, list) else []) if x.get('res') == 'accept' and not x.get('te')]
            hs.sort(key=lambda x: abs(x['h'] - (cfg.get('h_pref') or 15)))
            R.setup('[%s]【捷徑】讀回第 1 次演完的存檔、日子改成 %s（第 %d 天）10:00、清邀約；BEATS.last＝今天（故事線今天不演）：%s' % (tag, nx['k'], nx['d'], J(q2)))
            if not R.check('[%s] 隔天同一個地方有她會答應的時間' % tag, bool(hs), J(tm)): return
            pk = dict(pk, time=hs[0])
        else:
            m2, br = seq_match(says, expected(rs, 'study', 0, name), who)
            R.check('[%s] 第 2 次：演到原本那一場（第 %d 場整場逐字照稿）' % (tag, k), not m2 and not br, J({'缺': m2, '說話人': br}))
            R.check('[%s] 第 2 次：第 %d 場的選項出現' % (tag, k), any(m['opts'] == act_opts for m in menus), J([m['opts'] for m in menus]))
            R.check('[%s] 第 2 次：總次數 +1、推進到第 %d 場（%s → %s）' % (tag, k + 1, J(rb), J(ra)), ra.get('n') == (rb.get('n') or 0) + 1 and ra.get('k') == k + 1, '')
            if sc.get('set'): R.check('[%s] 第 2 次：set 旗標 %s＝今天' % (tag, sc['set']), a0['set'] == a0['day'], J(a0['set']))
    log('  [%s] 兩次的 STUDYN：%s' % (tag, J(rows)))
    R.check('[%s] 沒有 JS 例外（pageerror）' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))


async def run_part(pg, cdp, errs, tag):
    cfg = dict(PART_CFG[tag]); who, kind, k = cfg['who'], cfg['kind'], cfg['k']
    e0 = len(errs)
    if cfg.get('k', 1) > 1 and not cfg.get('generic') and not cfg.get('rotate'):
        cfg['flags'] = dict(scene_flags(kind, who, k), **(cfg.get('flags') or {}))
    if cfg.get('rotate'):
        cfg['flags'] = dict(scene_flags(kind, who, 5), **(cfg.get('flags') or {}))
    if cfg.get('kx_note'):
        log('  【說明】%s：可昕沒交往時約不到她（INV.canInvite：G 層，只有交往中 kxGF 才能用手機約；當面約也要 canInvite），這一版正常玩家玩不到（BB 07:56：不是問題）。'
            '這一段用【捷徑】INV.accept 直接寫一筆約好的邀約來演，看的是台詞和 base／alt 的切換' % tag)
    pk = await choose_day_place(pg, cdp, tag, cfg)
    if not R.check('[%s] 找得到能約的日子、地點、她會答應的時間' % tag, bool(pk)): return
    s = pk['setup']
    R.setup('[%s] 讀檔（applySave、關條件事件／手機自動打開）：宿舍、%s（第 %d 天，週%s）%.2f、晴天、錢 3000；%s 的聯絡方式；關係 %s → 第 %s 階（SOCIAL %s）；%s；canConfess %s；升階門檻台詞記成說過 %d 則；BEATS.last＝今天' % (
        tag, pk['key'], pk['cal']['d'], '日一二三四五六'[pk['cal']['wd']], cfg.get('h0', 10.0), who, J(REL[cfg['stage']]), s['stage'], s['sstage'],
        ('交往中（dating_%s）' % who) if s['dating'] else '沒有交往', J(s['canConfess']), s['ups']))
    R.setup('[%s] 次數：%s[%s]＝n %d、k %d%s；旗標 %s；記憶 +%s −%s；%s' % (tag, 'STUDYN' if kind == 'study' else 'ACTN.' + kind, who, cfg['n'], k, '' if cfg.get('rot') is None else '、rot %d' % cfg['rot'],
        J(cfg.get('flags') or {}), J(cfg.get('mems') or []), J(cfg.get('unmem') or []), '；'.join(s['notes']) or '沒有別的 dating_'))
    R.note('[%s] 地點 %s（%s）、時間 %s、片 %s；alt 條件 %s；AN_SHOP_PAGE %s' % (tag, pk['place']['id'], pk['place']['verb'], pk['time']['t'], J(pk.get('film')), J(s['altOn']), s['hasPage']))
    R.check('[%s] 前置：DATE.stageNum＝%d' % (tag, cfg['stage']), s['stage'] == cfg['stage'], J(s['rel']))
    if cfg.get('base'): R.check('[%s] 前置：沒交往、告白條件沒到（datingOrReady false）' % tag, s['altOn'] and s['altOn'].get('datingOrReady') is False, J(s['altOn']))
    if cfg.get('alt') and kind != 'study': R.check('[%s] 前置：datingOrReady true（交往中）' % tag, s['altOn'] and s['altOn'].get('datingOrReady') is True, J(s['altOn']))
    if cfg.get('an6') == 'page': R.check('[%s] 前置：記憶 AN_SHOP_PAGE 有（anShopPage true）' % tag, s['hasPage'] and s['altOn'].get('anShopPage') is True, J(s['altOn']))
    if cfg.get('an6') == 'nopage': R.check('[%s] 前置：沒有記憶 AN_SHOP_PAGE（anShopPage false）' % tag, not s['hasPage'] and s['altOn'].get('anShopPage') is False, J(s['altOn']))
    name = s['name']
    ver = await pg.evaluate(VER_JS)
    R.note('[%s] 版本偵測：%s（actDefer＝f8b6d1e82 起：電影（…）選項在廳裡、被取代的第 N 場下次再演）' % (tag, J(ver)))
    # 稿、頁面上的遊戲資料
    pgs = await pg.evaluate(PAGE_SCENE_JS, {'who': who, 'kind': kind})
    R.note('[%s] 頁面上的遊戲資料 src：%s；稿 %s' % (tag, (pgs or {}).get('src'), DRAFT707 if kind == 'study' else DRAFT708))
    if cfg.get('rotate'):
        drs = draft_scene(kind, who, 'rot'); src_rot = drs if drs else [norm_sc(x) for x in (pgs or {}).get('rot', [])]
        sc = None
    else:
        drs = draft_scene(kind, who, k)
        if drs is None: R.note('[%s] 讀不到稿（%s）：逐字改比頁面上的遊戲資料' % (tag, DRAFT707 if kind == 'study' else DRAFT708))
        static_cmp(tag, ((pgs or {}).get('scenes') or {}).get(str(k)), drs)
        sc = drs or norm_sc(((pgs or {}).get('scenes') or {}).get(str(k)))
        draft_rules(tag, sc, k)
    alt_on = bool(s['altOn'] and ((cfg.get('alt') and kind != 'study' and s['altOn'].get('datingOrReady')) or (cfg.get('an6') == 'page' and s['altOn'].get('anShopPage'))))
    day_on = pk['time']['h'] < 18
    rs = resolve(sc, alt_on, day_on) if sc else None
    act_opts = [o['t'].replace('{name}', name) for o in (rs or {}).get('opts', [])]
    pick = cfg['pick']
    cfg['_is_act'] = lambda opts: bool(act_opts) and opts == act_opts
    cfg['_pickfn'] = lambda opts: (min(pick, len(opts) - 1) if (act_opts and opts == act_opts) else None)
    # 電影：with.mid（這部片和她的那一幕）＝第 N 場的旁白不演 → 【前置】記成她看過
    with_mid = False
    if kind == 'movie' and pk.get('film') and pk['film'].get('withMid') and not cfg.get('withmid'):
        await pg.evaluate(MARK_SEEN_JS, {'who': who, 'film': pk['film']['film']})
        R.setup('[%s]【前置】這一段的片《%s》有她的 with.mid（會取代第 %d 場的旁白）：記成她 30 天前看過（MOVIE_SEEN）' % (tag, pk['film']['title'], k))
    before = await pg.evaluate(REC_JS, {'who': who, 'kind': kind, 'set': (sc or {}).get('set')})
    today0 = ''
    if cfg.get('six'):
        await phone(pg, cdp, 'today'); today0 = await pg.evaluate(TODAY_TXT_JS); await close_phone(pg, cdp)
    await pg.evaluate(HOOK_JS)
    screen = []; shots = set()
    iv, how = await invite(pg, cdp, tag, cfg, pk, screen)
    if not R.check('[%s] 約成了（%s）：%s %s' % (tag, how, pk['place']['id'], pk['time']['t']), bool(iv), J(iv)): await R.shot(pg, 'act_%s_invite_fail' % tag); return
    if kind == 'movie':
        fm = await pg.evaluate("(q=>{ const iv=(GAME.G.invites||[]).find(v=>v.id===q.id); if(!iv||typeof MOVIES==='undefined') return null; const AX=STUDYN.act('movie').pick(GAME.G,q.who); const F=MOVIES.fitScene(GAME.G,iv,AX); const M=MOVIES.midLines(GAME.G,iv,F); return {film:iv.film, fit:!!F&&!F.generic, k:F&&F.k, withMid:!!(M&&M.withMid), scene:M&&!M.withMid?M:null}; })", {'id': iv['id'], 'who': who})
        R.note('[%s] 約好的片：%s' % (tag, J(fm)))
        with_mid = bool(fm and fm['withMid'])
        if cfg.get('withmid'): R.check('[%s] 前置：約好的片有她的 with.mid（會取代第 %d 場的小動作）' % (tag, k), bool(fm and fm['withMid']), J(fm))
        elif not cfg.get('generic'): R.check('[%s] 約好的片合第 %d 場（MOVIES.fitScene 不是一般句）、沒有 with.mid' % (tag, k), bool(fm and fm['fit'] and not fm['withMid']), J(fm))
    i_meet = len(await pg.evaluate("window.__AE||[]"))
    ok = await go_meet(pg, cdp, tag, cfg, iv, screen, shots)
    await R.shot(pg, 'act_%s_end' % tag)
    ev = await pg.evaluate("window.__AE||[]")
    after = await pg.evaluate(REC_JS, {'who': who, 'kind': kind, 'set': (sc or {}).get('set')})
    R.check('[%s] 赴約演完（邀約 done）' % tag, ok, J({'zone': after['zone'], 'hour': after['hour']}))
    # 逐字
    log('== %s 逐字（說話人｜全文）' % tag)
    says = []
    for e in ev[i_meet:]:
        if e['k'] == 'say':
            says.append(e); log('  [說] %s｜%s' % (e['who'] or '（旁白）', e['t']))
        elif e['k'] == 'ch': log('  [選項] %s → %s' % ('｜'.join(e['opts']), e['opts'][e['pick']] if isinstance(e.get('pick'), int) and 0 <= e['pick'] < len(e['opts']) else e.get('pick')))
        elif e['k'] == 'cap': log('  [字幕] %s' % e['t'])
        elif e['k'] == 'fx': log('  [fx] %s fx=%s cap=%s → 加了 %s（%s）' % (e['id'], J(e['fx']), J(e['cap']), J(e['ret']), J(rel_diff(e['before'], e['after']))))
        elif e['k'] == 'adj': log('  [adjust] %s %s（%s）' % (e['id'], J(e['d']), J(rel_diff(e['before'], e['after']))))
    alltext = [e['t'] for e in says] + [o for e in ev[i_meet:] if e['k'] == 'ch' for o in e['opts']] + [x[1] for x in screen]
    R.check('[%s] 畫面上沒有沒換掉的 {name}、undefined' % tag, not any('{name}' in t or 'undefined' in t for t in alltext), J([t for t in alltext if '{name}' in t or 'undefined' in t][:4]))
    menus = [e for e in ev[i_meet:] if e['k'] == 'ch']
    # 次數
    b, a = before['rec'] or {}, after['rec'] or {}
    if cfg.get('generic'):
        R.check('[%s] 一般句：次數 +1、k 不動（%s → %s）' % (tag, J(b), J(a)), a.get('n') == (b.get('n') or 0) + 1 and a.get('k') == b.get('k') and a.get('last') == after['day'], '')
        own = draft_scene(kind, who, k) or norm_sc(((pgs or {}).get('scenes') or {}).get(str(k)))
        lines = [t.replace('{name}', name) for f in ('seat', 'mid', 'pack', 'bye') for t in (own or {}).get(f, [])] + [t.replace('{name}', name) for t in ((own or {}).get('alt') or {}).get('mid', [])]
        hit = [e['t'] for e in says if e['t'] in lines or e['t'].replace('（小聲）', '', 1) in lines]
        R.check('[%s] 一般句：第 %d 場（need %s）的句子都沒出現' % (tag, k, (own or {}).get('need')), not hit, J(hit))
        R.check('[%s] 一般句：這一次沒有第 %d 場的選項' % (tag, k), not any(m['opts'] == [o['t'] for o in (own or {}).get('opts', [])] for m in menus), '')
        log('  【一般句逐字】%s' % J([[e['who'] or '（旁白）', e['t']] for e in says]))
    elif cfg.get('rotate'):
        ok_i = await pg.evaluate(ROT_OK_JS, {'kind': kind, 'who': who})
        exp_i = ok_i[0] if ok_i else None
        R.note('[%s] 輪換：旗標過得了的 %s、預期第 %s 則（STUDYN pick：rot＝-1 以後第一個）' % (tag, J(ok_i), exp_i))
        x = src_rot[exp_i] if exp_i is not None else None
        seat = [t.replace('{name}', name) for t in (x or {}).get('seat', [])]
        mid = [t.replace('{name}', name) for t in (x or {}).get('mid', [])]
        m1, br1 = seq_match(says, [(role(t), t) for t in seat], who)
        R.check('[%s] 輪換第 %s 則的 seat 逐字出現（說話人對）' % (tag, exp_i), x is not None and not m1 and not br1, J({'缺': m1, '說話人': br1}))
        m2, _ = seq_match(says, [(role(t), t) for t in mid], who)
        bts = after.get('beats') or {}
        R.note('[%s] 中途：%s（rot[%s].mid 缺 %s；BEATS rotSrc %s、rot %s）' % (tag, '活動自己的輪換句' if not m2 else '不是活動自己的輪換句（ARCS.rotPick：她最近的事）', exp_i, J(m2), bts.get('rotSrc'), J(bts.get('rot'))))
        R.check('[%s] 輪換：次數 +1、rec.rot＝%s（%s → %s）' % (tag, exp_i, J(b), J(a)), a.get('n') == (b.get('n') or 0) + 1 and a.get('rot') == exp_i, '')
    elif cfg.get('withmid'):
        # f8b6d1e82：這部片的 with.mid 取代了第 N 場的小動作＝那一場（含選項、說出口的句子）整場留到下次（actDefer），總次數照算、第 N 場不推進
        joined = [e['t'].replace('（小聲）', '', 1) for e in says]
        own = [t.replace('{name}', name) for f in ('mid',) for t in rs.get(f, [])]
        R.check('[%s] with.mid 取代：第 %d 場自己的小動作／說出口的句子都沒演' % (tag, k), not any(t in joined for t in own), J([t for t in own if t in joined]))
        R.check('[%s] with.mid 取代：第 %d 場的選項沒出（散場後也沒補）' % (tag, k), not any(m['opts'] == act_opts for m in menus), J([m['opts'] for m in menus]))
        R.check('[%s] with.mid 取代＝不推進、下次再演：總次數 +1、k 還是 %d（%s → %s）' % (tag, k, J(b), J(a)), a.get('n') == (b.get('n') or 0) + 1 and a.get('k') == k and a.get('last') == after['day'],
                '修改前（7266e7a29）會推進到 k+1＝第 %d 場永遠看不到' % k)
        if sc.get('set'): R.check('[%s] with.mid 取代：set 旗標 %s 沒記' % (tag, sc['set']), after['set'] is None, J(after['set']))
    else:
        R.check('[%s] 次數 +1、下一場 k=%d（%s → %s）' % (tag, k + 1, J(b), J(a)), a.get('n') == (b.get('n') or 0) + 1 and a.get('k') == k + 1 and a.get('last') == after['day'], '')
        if sc.get('set'): R.check('[%s] set 旗標 %s＝今天' % (tag, sc['set']), after['set'] == after['day'], J(after['set']))
        mode = 'cinema' if kind == 'movie' else ('study' if kind == 'study' else 'act')
        exp = expected(rs, mode, pick, name, with_mid, ver.get('actDefer'))
        miss, badrole = seq_match(says, exp, who)
        R.check('[%s] 第 %d 場%s逐字照稿、照順序（%d 句；她／旁白分對）' % (tag, k, '（alt）' if alt_on else ('（base）' if cfg.get('base') else ''), len(exp)), not miss and not badrole, J({'缺': miss, '說話人': badrole}))
        if act_opts:
            got = [m for m in menus if m['opts'] == act_opts]
            R.check('[%s] 兩個選項真的跳出來、逐字＝稿：%s' % (tag, '｜'.join(act_opts)), bool(got), J([m['opts'] for m in menus]))
            if got: R.check('[%s] 選了第 %d 個「%s」' % (tag, pick + 1, act_opts[min(pick, len(act_opts) - 1)]), got[0].get('pick') == min(pick, len(act_opts) - 1), J(got[0].get('pick')))
            o = rs['opts'][min(pick, len(rs['opts']) - 1)]
            reply = [t.replace('{name}', name) for t in o['reply']]
            m3, _ = seq_match(says, [(role(t), t) for t in reply], who)
            R.check('[%s] 選了以後的回話逐字（%s）' % (tag, J(reply)), not m3, J(m3))
            R.check('[%s] 這個選項不扣分（fx %s、rel %s 沒有負的）' % (tag, J(o['fx']), J(o['rel'])), fx_ok(o['fx']) and fx_ok(o['rel']), '')
            idx = next((i for i, e in enumerate(ev) if i >= i_meet and e['k'] == 'ch' and e['opts'] == act_opts), None)
            if o['fx']:
                fe = next((e for e in ev[(idx or i_meet):] if e['k'] == 'fx' and e['id'] == who and dict_eq(e['fx'], o['fx'])), None)
                dd = rel_diff(fe['before'], fe['after']) if fe else {}
                want = {}
                if (o['fx'] or {}).get('fr'): want.update({'fam': o['fx']['fr'], 'trust': o['fx']['fr'], 'comf': o['fx']['fr']})
                if (o['fx'] or {}).get('love'): want['npcRom'] = o['fx']['love']
                got_d = {k2: (v[1] or 0) - (v[0] or 0) for k2, v in dd.items()}
                R.check('[%s] fx 有加：SOCIAL.applyFx(%s) 回傳 %s、前後 %s（稿 %s）' % (tag, J(o['fx']), J(fe and fe['ret']), J(dd), J(want)),
                        bool(fe and fe['ret']) and all(got_d.get(k2, 0) > 0 for k2 in want) and all(v >= 0 for v in got_d.values()), J({'cap': fe and fe['cap']}))
                if fe and want.get('npcRom') and got_d.get('npcRom', 0) < want['npcRom']: log('  【觀察】%s love 被上限截掉：要 %s、加了 %s（cap %s）' % (tag, want['npcRom'], got_d.get('npcRom', 0), J(fe['cap'])))
            if o['rel']:
                ae = next((e for e in ev[(idx or i_meet):] if e['k'] == 'adj' and e['id'] == who and dict_eq(e['d'], o['rel'])), None)
                dd = rel_diff(ae['before'], ae['after']) if ae else {}
                R.check('[%s] rel 有加：SOCIAL.adjust(%s) 前後 %s' % (tag, J(o['rel']), J(dd)), bool(ae) and all((v[1] or 0) >= (v[0] or 0) for v in dd.values()) and bool(dd), '')
        # base／alt
        if cfg.get('base_word'):
            joined = '\n'.join(e['t'] for e in says)
            if cfg.get('base'):
                R.check('[%s] base 句「%s」出現' % (tag, cfg['base_word']), cfg['base_word'] in joined, '')
                R.check('[%s] base：alt 句「%s」沒有出現' % (tag, cfg['alt_word']), cfg['alt_word'] not in joined, '')
                mids = set(t.replace('{name}', name) for t in (sc.get('mid') or []) + ((sc.get('alt') or {}).get('mid') or []))   # 這一場的 mid（base 和 alt 兩版）：她自己主動的那一段
                ct_mid = [e['t'] for e in says if (e['t'] in mids or e['t'].replace('（小聲）', '', 1) in mids) and CONTACT_BASE.search(e['t'])]
                R.check('[%s] base 那趟 mid（她自己主動的那一段）沒有靠肩、手疊手（%s）' % (tag, CONTACT_BASE.pattern), not ct_mid, J(ct_mid))
                ct_oth = [e['t'] for e in says if CONTACT_BASE.search(e['t']) and e['t'] not in ct_mid]
                if ct_oth: log('  【觀察】%s base 那趟 mid 以外有接觸字（玩家選的選項之後她的回應、片子那一段等；BB 07:56：need 4、玩家先動，可以，不判）：%s' % (tag, J(ct_oth)))
            else:
                R.check('[%s] alt 句「%s」出現' % (tag, cfg['alt_word']), cfg['alt_word'] in joined, '')
                R.check('[%s] alt：base 句「%s」沒有出現' % (tag, cfg['base_word']), cfg['base_word'] not in joined, '')
        if cfg.get('an6'):
            joined = '\n'.join(e['t'] for e in says) + '\n' + '\n'.join(o for m in menus for o in m['opts'])
            if cfg['an6'] == 'nopage':
                R.check('[%s] 「（她翻開手帳最後一頁，手壓著下半頁…）」出現' % tag, '手壓著下半頁' in joined, '')
                R.check('[%s] 選項有「下面壓著的是什麼？」' % tag, any('下面壓著的是什麼？' in o for m in menus for o in m['opts']), '')
                bad = [w for w in AN6_BAN if w in joined]
                R.check('[%s] 全場沒有「和你」「一家都還沒有打勾」' % tag, not bad, J([e['t'] for e in says if any(w in e['t'] for w in AN6_BAN)]))
            else:
                R.check('[%s] 「（她翻到你看過的那一頁。）」出現' % tag, '（她翻到你看過的那一頁。）' in [e['t'].replace('（小聲）', '', 1) for e in says], '')
                R.check('[%s] 選項有「最下面那一行，還在嗎？」' % tag, any('最下面那一行，還在嗎？' in o for m in menus for o in m['opts']), '')
                R.check('[%s] 沒有手壓著下半頁那一版' % tag, '手壓著下半頁' not in joined, '')
        if cfg.get('six'):
            sl = set(t.replace('{name}', name) for f in ('seat', 'mid', 'pack', 'bye') for t in rs.get(f, [])) | set(t.replace('{name}', name) for o in rs.get('opts', []) for t in o['reply'] + [o['t']])
            mine = [e['t'] for e in says if e['t'] in sl or e['t'].replace('（小聲）', '', 1) in sl] + [o for m in menus if m['opts'] == act_opts for o in m['opts']]
            strict = [t for t in mine if any(w in strip_ok(t) for w in TIME_STRICT)]
            R.check('[%s] 第 6 場的句子沒有 %s（白名單 %s）' % (tag, '、'.join(TIME_STRICT), '、'.join(TIME_OK)), not strict, J(strict))
            wide = [[t, TIME_WIDE.findall(strip_ok(t))] for t in mine if TIME_WIDE.search(strip_ok(t))]
            if wide: log('  【觀察】%s 第 6 場比較寬的「哪一天幾點」字樣（不判）：%s' % (tag, J(wide)))
            un = (sc.get('unlock') if isinstance(sc.get('unlock'), str) else None)
            pun = ((((pgs or {}).get('scenes') or {}).get('6') or {}).get('unlock'))
            R.check('[%s] G.flags.STUDY_UNLOCK 有記「%s」＝今天' % (tag, pun), bool(pun) and (after['unlock'] or {}).get(pun) == after['day'] and (before['unlock'] or {}).get(pun) is None, J({'前': before['unlock'], '後': after['unlock'], '稿': un}))
            oth0 = [x for x in before['invites'] if x.get('id') != iv['id']]
            oth1 = [x for x in after['invites'] if x.get('id') != iv['id']]
            R.check('[%s] 演完沒有自動排約：G.invites（這一次以外）前後一樣' % tag, oth0 == oth1, J({'前': oth0, '後': oth1}))
            R.check('[%s] G.trips、G.flags.ARC_INVITE 前後一樣' % tag, before['trips'] == after['trips'] and before['arcInv'] == after['arcInv'], J({'trips': [len(before['trips']), len(after['trips'])], 'arc': [before['arcInv'], after['arcInv']]}))
            R.check('[%s] 第 6 場＝正式約會一次：DATE.log 次數 +1、study6＝今天' % tag, (after['dlog'] or {}).get('count') == ((before['dlog'] or {}).get('count') or 0) + 1 and (after['dlog'] or {}).get('study6') == after['day'], J([before['dlog'], after['dlog']]))
            await phone(pg, cdp, 'today'); today1 = await pg.evaluate(TODAY_TXT_JS); await close_phone(pg, cdp)
            R.note('[%s] 手機「今天」前後（參考，不判）：前 %s ／ 後 %s' % (tag, J(today0[:200]), J(today1[:200])))
    if cfg.get('smoke'):
        await smoke_checks(tag, ev, i_meet, act_opts, rs, pick, name, who, ver, pk)
    # 禁字（沛珊）
    if cfg.get('ban'):
        bad = [t for t in alltext if any(w in t for w in cfg['ban'])]
        R.check('[%s] 畫面上沒有「%s」' % (tag, '」「'.join(cfg['ban'])), not bad, J(bad))
    # 關係數值
    dd = rel_diff(before['rel'], after['rel'])
    log('  [關係] %s 見面前 %s' % (who, J(before['rel'])))
    log('  [關係] %s 見面後 %s' % (who, J(after['rel'])))
    log('  [關係] diff %s' % J(dd))
    dec = {k2: v for k2, v in dd.items() if k2 in ('fam', 'trust', 'comf', 'npcRom', 'rom') and (v[1] or 0) < (v[0] or 0)}
    R.check('[%s] 見面前後 fam／trust／comf／npcRom／rom 都沒有變少' % tag, not dec, J(dec))
    R.check('[%s] 沒有 JS 例外（pageerror）' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'tag': tag, 'cfg': {k2: v for k2, v in cfg.items() if not k2.startswith('_')}, 'pick': pk, 'ev': ev[i_meet:], 'screen': screen, 'before': before, 'after': after},
              open(os.path.join(OUT, 'act_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def strip_ok(t):
    for w in TIME_OK: t = t.replace(w, '')
    return t


async def main():
    log('# ACT %s SHA=%s TAG=%s PARTS=%s PICK3=%d PS_PICK=%d' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA, TAG, ','.join(PARTS), PICK3, PS_PICK))
    log('  稿：AA_708 %s（%s）、AA_707 %s（%s）' % (DRAFT708, '讀到' if D708 else '讀不到', DRAFT707, '讀到' if D707 else '讀不到'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        PG[0] = pg
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        log('  版本字樣：%s' % ver)
        for part in PARTS:
            log('== %s' % part)
            t0 = time.time()
            if part not in PART_CFG:
                R.check('認得 PARTS「%s」' % part, False); continue
            try:
                if PART_CFG[part].get('beat_defer'): await beat_defer_part(pg, cdp, errs, part)
                else: await run_part(pg, cdp, errs, part)
            except Exception:
                import traceback
                R.check('[%s] 探針沒有例外' % part, False, traceback.format_exc()[-900:])
                try: await R.shot(pg, 'act_%s_exception' % part)
                except Exception: pass
            log('  [%s] 用了 %.0f 秒' % (part, time.time() - t0))
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
