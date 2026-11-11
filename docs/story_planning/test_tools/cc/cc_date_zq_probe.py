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
STAGES = [s.strip() for s in (os.environ.get('STAGES') or 'friend,dating').split(',') if s.strip()]
PICK = int(os.environ.get('PICK') or 0)
ROOT = os.path.abspath(os.path.join(LWT, '..'))
REF = os.path.abspath(os.environ.get('REF_TREE') or ROOT)
ZQ = 'heroine_04'
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('date_zq_' + TAG, OUT)
LINES_TXT = os.path.join(OUT, 'zq_lines.txt')
NIGHT_WANT = '（晚上她回家。你住在車站附近的旅館。）'
CONTACT = re.compile(r'牽|肩|手給我|你的手|手塞進|勾著你|拉著你|抓.{0,3}手|手臂')
STOPS = ('差不多了，回去吧', '就這樣回去', '今天先到這裡')
SYS_NARR = re.compile(r'^（(今天去了|這兩天去了|第二天早上。|晚上)|^約好了：|^今天 \d|^手機｜|^和.+去.+：')

# 地點設定：類別（手機選單第二層）、出發時間、記憶的第一個點（remember 的那一格）、點的順序
LOCS = {
    'D01': dict(group='臺北市：看展・電影', dep=15, kind='half', order=['D01.expo', 'D01.lawn', 'D01.market', 'D01.wall']),
    'D03': dict(group='臺北市：看展・電影', dep=15, kind='half', order=['D03.demo', 'D03.arcade', 'D03.gacha', 'D03.window']),
    'D08': dict(group='臺北市：戶外', dep=15, kind='half', order=['D08.panda', 'D08.train', 'D08.penguin', 'D08.giraffe']),
    'D26': dict(group='兩天一夜…', dep=9, kind='overnight', order=['D26.museum', 'D26.path', 'D26.plaza', 'D26.village']),
}
# 每趟只點 3 個點：點滿 4 個（兩天一夜每天 2 個）時引擎不再出選單，收尾句會直接接在最後一個點後面、分不出段落——留一個不點，收尾前一定有「差不多了」那個選單
MAXP = 3
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


def set_lines(st, pick=None):
    """一套 {lines, choice} → 畫面上會出的句子（note 不出）；pick＝選了第幾個選項（回話接在後面）"""
    out = [(x.get('who'), shown(x)) for x in (st or {}).get('lines') or [] if x and x.get('who') != 'note']
    ch = [c for c in (st or {}).get('choice') or [] if c and isinstance(c.get('t'), str) and c['t'].strip()]
    if ch and pick is not None:
        c = ch[min(pick, len(ch) - 1)]
        rep = c.get('reply')
        if not isinstance(rep, list):
            rr = c.get('re'); rr = [] if rr is None else (rr if isinstance(rr, list) else [rr])
            rep = [{'who': 'narr', 'text': x} if re.match(r'^（.*）$', x) else {'who': ZQ, 'text': x} for x in rr if isinstance(x, str) and x.strip()]
        out += [(x.get('who'), shown(x)) for x in rep if x and x.get('who') != 'note']
    return out


def first_tier(pool, tier):
    ok = [x for x in (pool or []) if not x.get('tier') or x.get('tier') in ('any', tier)]
    if not ok: ok = list(pool or [])
    return ok[0] if ok else None


def expect(loc, seg, pid, ctx):
    """照 date3d.js 的選句順序算這一段該出的那一格：回傳 (格名, 那一套)。ctx：visits、dating、tier、picks、last"""
    Z = zl(loc)
    if seg in ('arrive', 'close'):
        A = Z.get('arrive' if seg == 'arrive' else 'closing') or {}
        if not ctx['visits'] and A.get('first') and not A['first'].get('wishEvent'): return 'first', A['first']
        if ctx['dating'] and A.get('dating'): return 'dating', first_tier(A['dating'], ctx['tier'])
        return 'normal', first_tier(A.get('normal'), ctx['tier'])
    H = (Z.get('hotspots') or {}).get(pid) or {}
    before = pid in ctx['picks']
    if not before and H.get('first') and not H['first'].get('wishEvent'): return 'first', H['first']
    if (ctx['visits'] == 1 or pid in ctx['last']) and H.get('remember'): return 'remember', H['remember']
    if ctx['dating'] and H.get('dating'): return 'dating', first_tier(H['dating'], ctx['tier'])
    likes = ((DL['loc'][loc].get('likes') or {}).get(ZQ) or {})
    if likes.get(pid) == 'dislike':
        dl = ((DL['loc'][loc].get('dislikeLine') or {}).get(ZQ) or {}).get(pid)
        if dl: return 'dislike', {'lines': [{'who': ZQ, 'text': dl}]}
    return 'normal', first_tier(H.get('normal'), ctx['tier'])


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


COMMON = common_lines()
WISH_IDX = text_index((DW.get('events') or {}).get(ZQ) or {}, '/wish')


# ---------- 頁面上的掛勾（只記不改）----------
HOOK = r"""(()=>{ if(!window.__ZQH){ window.__ZQH=1; window.__ZE=[]; const n=()=>window.__ZE.length;
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__ZE.push({k:'say',i:n(),who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day}); }catch(e){} return s0.apply(this,arguments); };
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
    trip:T?{id:T.trip,status:T.status,locs:T.locs,depart:T.depart,kind:T.kind,night:T.night||null,spots:T.spots||[]}:null, busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy)}; })()"""


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


async def tap_dlg(pg, cdp, s, screen):
    """打字機：同一句長出來不算換句；打完才記、才翻頁（2 秒還沒打完就點一下＝補完）"""
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(300); s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']:
            await pg.wait_for_timeout(1700); s2 = await st(pg)
            if s2['typing'] and s2['shown'] != s2['full']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); s2 = await st(pg)
        s = s2
    if s['dlg'] and s['full'] and (not screen or screen[-1] != [s['name'], s['full']]):
        screen.append([s['name'], s['full']])
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


async def set_memory(pg, loc, count, byloc, picks, last, wish_done):
    return await pg.evaluate("""(([id,loc,count,byloc,picks,last,wd])=>{ const G=GAME.G; DATE.rec(G); const L=DATE.log(G,id); L.count=count; L.byLoc[loc]=byloc;
      if(wd){ L.wish=true; L.wishKnown=true; G.flags['WISH_DONE_'+id]=true; }
      const m=DATE.mem(G,id,loc); m.picks=picks.slice(); m.last=last.slice(); m.recent=[]; m.optN={};
      return {count:L.count, byLoc:L.byLoc, wish:L.wish, mem:{picks:m.picks,last:m.last}, tier:DATE.tierOf(G,id)}; })""", [ZQ, loc, count, byloc, picks, last, wish_done])


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


async def play(pg, cdp, cfg, screen, shots_tag, max_s=900):
    """約會本身：選單照 cfg['order'] 選互動點，互動點的選項選 PICK，快速約會選「自己選」；回傳選過的"""
    menu = Menu(); t0 = time.time(); picked = []; nshot = [0]; stopped = False; want = [None]
    async def maybe_shot(full):
        # 每格一張以內：選了互動點以後的第一句（再訪格、交往格都在這裡）、肢體句、晚上那句
        if nshot[0] >= 12: return
        tag = want[0] or ('contact' if CONTACT.search(full) else ('night' if full.startswith('（晚上') else None))
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
                k = min(PICK, len(opts) - 1); log('  [選項] %s → %s' % (J(opts), opts[k]))
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(800); continue
        if s['dlg']:
            n0 = len(screen); s2 = await tap_dlg(pg, cdp, s, screen)
            if len(screen) > n0: await maybe_shot(s2['full'])
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
        elif e['k'] == 'ch':
            opts = e['opts']; k = e.get('pick')
            if opts and opts[-1] in STOPS and k is not None:
                flush(); buf = []
                cur = ('close', None) if k >= len(opts) - 1 else ('spot', opts[k])
    flush()
    return segs


async def analyze(pg, tag, loc, stage, dating, ctx, ev, screen, picked, names):
    """逐句比稿、算格、肢體句、再訪；回傳表格的一列"""
    who_names = set(await pg.evaluate("(id=>[SOCIAL.displayName(id),(CHARACTERS[id]||{}).name].filter(Boolean))", ZQ))
    page = await pg.evaluate("(()=>({NIGHT:DATE.NIGHT, MORNING:(DATE.MORNING||{}).heroine_04||null, MN:DATE.MORNING_NARR}))()")
    locname = await pg.evaluate("(l=>DATE.loc(l).name)", loc)
    Z = zl(loc); IDX = text_index({'lines': Z, 'dislikeLine': ((DL['loc'][loc].get('dislikeLine') or {}).get(ZQ) or {})}, '/' + loc); DIDX = None
    dr = draft_of(loc)
    if dr is not None: DIDX = text_index({'lines': ((dr.get('lines') or {}).get(ZQ) or {}), 'dislikeLine': ((dr.get('dislikeLine') or {}).get(ZQ) or {})}, '/' + loc)
    else: log('  （源稿讀不到＝只和遊戲資料檔 date_lines.js 比）')
    rev_name = {v: k for k, v in names.items()}
    def mine(e): return e['cid'] == ZQ or any(e['who'].startswith(n) for n in who_names)
    log('== %s 逐句（說話人｜遊戲時間｜原文）' % tag)
    for e in ev:
        if e['k'] == 'say': log('  %s｜第%s天 %05.2f｜%s' % (e['who'] or '（旁白）', e['d'], e['h'], e['t']))
        else: log('  ［選單］%s → %s' % (J(e['opts']), e['opts'][e['pick']] if e.get('pick') is not None and e['pick'] < len(e['opts']) else e.get('pick')))
    segs = segments(ev, locname)
    n_her = 0; n_dating = 0; contact = []; remember = []; night = None; bad_draft = []; bad_data = []; slot_rows = []
    vis = {'visits': ctx['visits'], 'dating': dating, 'tier': ctx['tier'], 'picks': ctx['picks'], 'last': ctx['last']}
    for kind, arg, buf in segs:
        lines = [e for e in buf if not SYS_NARR.search(e['t']) and (mine(e) or (not e['who'] and e['t'].startswith('（')))]
        if kind in ('pre', 'settle', 'other'): continue
        if kind == 'night':
            night = buf[0]['t'] if buf else None; continue
        if kind == 'morning':
            ml = [e['t'] for e in lines if mine(e)]
            R.check('[%s] 早上：「（第二天早上。）」之後她那一句＝DATE.MORNING.heroine_04（%s）' % (tag, page['MORNING']), ml[:1] == [page['MORNING']], J(ml))
            continue
        if kind == 'spot':
            pid = rev_name.get(arg)
            if pid is None: continue
            seg, pidv = 'spot', pid
        else:
            seg, pidv = kind, None
        en = [e for e in lines if e['t'] in COMMON and kind == 'spot']   # 第三個點之後的 enough（不分地點）
        body = [e for e in lines if e not in en]
        slot, S = expect(loc, 'arrive' if seg == 'arrive' else ('close' if seg == 'close' else 'spot'), pidv, vis)
        want = set_lines(S, PICK)
        got = [(('narr' if not e['who'] else ZQ), e['t']) for e in body]
        wt = [t for _, t in want]; gt = [t for _, t in got]
        ok = gt == wt
        nm = '%s%s' % (seg, (':' + pidv) if pidv else '')
        R.check('[%s] %s＝%s 格（逐句 %d 句）' % (tag, nm, slot, len(wt)), ok, J({'want': wt, 'got': gt}))
        slot_rows.append({'seg': nm, 'slot': slot, 'n': len(gt), 'got': gt})
        if en: log('  [%s] %s 後面多一句 enough（不分地點的短句）：%s' % (tag, nm, J([e['t'] for e in en])))
        if seg == 'spot' and pidv:
            vis['picks'] = vis['picks'] if pidv in vis['picks'] else vis['picks'] + [pidv]
        if slot == 'dating': n_dating += len(gt)
        if slot == 'remember': remember.append(nm)
        for e in body:
            n_her += 1
            if CONTACT.search(e['t']): contact.append([nm, slot, e['t']])
            if e['t'] not in IDX: bad_data.append([nm, e['t']])
            elif DIDX is not None and e['t'] not in DIDX: bad_draft.append([nm, e['t']])
    # 1. 逐字在資料、稿裡
    R.check('[%s] 1a 子晴的句子、約會旁白都在遊戲資料 date_lines.js（%s 的格子）裡一字不差' % (tag, loc), not bad_data, J(bad_data))
    if DIDX is not None: R.check('[%s] 1b 也都在源稿 %s.json（白名單版）裡' % (tag, loc), not bad_draft, J(bad_draft))
    # 約會以外的她的句子（預約的回話、出發的訊息、enough）：不分地點的短句
    other = [e['t'] for e in ev if e['k'] == 'say' and mine(e) and e['t'] not in IDX and e['t'] not in COMMON and e['t'] != page['MORNING'] and e['t'] not in WISH_IDX]
    R.check('[%s] 1c 約會以外她說的（答應、出發訊息、差不多了）都在不分地點的短句 lines.heroine_04 裡' % tag, not other, J(other))
    # 3. 肢體句
    if not dating:
        R.check('[%s] 3a 一般（沒有交往）：沒有牽手／靠肩／拉手這類句子' % tag, not contact, J(contact))
        R.check('[%s] 3b 一般：沒有任何交往格的句子' % tag, n_dating == 0, str(n_dating))
        dating_texts = {v for k, v in leaves(Z, '', {}).items() if '/dating/' in k and isinstance(v, str)}
        dating_texts |= {'（' + v + '）' for v in list(dating_texts) if not v.startswith('（')}
        leak = [e['t'] for e in ev if e['k'] == 'say' and e['t'] in dating_texts]
        R.check('[%s] 3c 一般：畫面上沒有出現任何交往格的字（整個 %s 的交往格逐字比）' % (tag, loc), not leak, J(leak))
    else:
        arr = next((r for r in slot_rows if r['seg'] == 'arrive'), None); cl = next((r for r in slot_rows if r['seg'] == 'close'), None)
        if ctx['visits']:
            R.check('[%s] 3d 交往：抵達、收尾是交往格' % tag, bool(arr and arr['slot'] == 'dating' and cl and cl['slot'] == 'dating'), J([arr and arr['slot'], cl and cl['slot']]))
        log('  [%s] 交往的肢體句（只記）：%s' % (tag, J(contact)))
    # 5. 晚上
    if loc == 'D26' and ctx.get('overnight'):
        R.check('[%s] 5 D26 晚上那一句＝「%s」' % (tag, NIGHT_WANT), night == NIGHT_WANT, J(night))
    # 6. 畫面
    badscr = [x for x in screen if '{name}' in x[1] or 'undefined' in x[1] or '{sunset}' in x[1]]
    R.check('[%s] 6a 畫面上的對話框沒有 {name}、undefined（%d 句）' % (tag, len(screen)), not badscr, J(badscr))
    return {'tag': tag, 'loc': loc, 'stage': ('交往' if dating else '一般（第%d階）' % stage), 'visit': ctx['visits'] + 1, 'n': n_her, 'dating': n_dating,
            'contact': len(contact), 'remember': len(remember), 'night': night, 'slots': slot_rows}


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
    h0 = 7.6 if cfg['kind'] == 'overnight' else 13.3
    rb = await base(pg, day, h0, dating, stage, keepG)
    R.setup('[%s] 讀檔（applySave、quiet_events）：宿舍、%s（第 %d 天）%.2f 點、晴天、錢 40000；聯絡方式；關係 %s → 第 %s 階；%s' % (
        tag, dkey, day, h0, J(rb['r']), rb['stage'], '交往中（flags.dating_heroine_04）' if dating else '沒有交往'))
    if keepG is None:
        count = 2 if visits else 0
        mem = await set_memory(pg, loc, count, visits, picks, last, wish_done)
        R.setup('[%s] 約會紀錄：dateLog 次數 %s、這個地點去過 %s 次、心願 %s；dateMemory 點過 %s、上一次 %s（tier %s）' % (tag, mem['count'], visits, mem['wish'], J(picks), J(last), mem['tier']))
    else:
        mem = await pg.evaluate("(([id,loc])=>{ const L=DATE.log(GAME.G,id), m=DATE.mem(GAME.G,id,loc); return {count:L.count, byLoc:L.byLoc, mem:{picks:m.picks,last:m.last}, tier:DATE.tierOf(GAME.G,id)}; })", [ZQ, loc])
        R.setup('[%s] 沿用第一次走完的紀錄（沒改）：%s' % (tag, J(mem)))
    ok_stage = (rb['stage'] >= 6) if (dating or cfg['kind'] == 'overnight') else (rb['stage'] == 5)
    R.check('[%s] 前置：階段對（一般 D01/D03/D08＝第 5 階、D26＝第 6 階；交往＝flags）' % tag, ok_stage and rb['dating'] == dating, J(rb))
    ctx = {'visits': visits, 'tier': mem['tier'], 'picks': list(mem['mem']['picks']), 'last': list(mem['mem']['last']), 'overnight': cfg['kind'] == 'overnight'}
    await pg.evaluate(HOOK)
    screen = []
    how, steps, trip = await book(pg, cdp, loc, cfg, screen)
    R.check('[%s] 預約（%s）：%s；行程 booked、今天 %02d:00 出發' % (tag, how, J(steps), cfg['dep']),
            bool(trip and trip.get('status') == 'booked' and trip.get('locs') == [loc] and abs(trip.get('depart', 0) - cfg['dep']) < 1e-6 and trip.get('day') == day), J(trip))
    if not (trip and trip.get('status') == 'booked'):
        await R.shot(pg, tag + '_book_fail'); return None
    said, skipped = await depart(pg, cdp, cfg, screen)
    R.check('[%s] 出發（%s）' % (tag, said), said is not None, J(skipped))
    if said is None: await R.shot(pg, tag + '_depart_fail'); return None
    picked, stopped = await play(pg, cdp, cfg, screen, tag)
    s = await st(pg)
    ev = await pg.evaluate("window.__ZE||[]")
    trip = await pg.evaluate("(id=>(GAME.G.trips||[]).find(t=>t.trip===id)||null)", s['trip']['id'] if s['trip'] else '')
    lg = await pg.evaluate("(id=>DATE.log(GAME.G,id))", ZQ)
    R.check('[%s] 約會走完：行程 done、算一次（次數 %s）、點了 %s' % (tag, lg.get('count'), J(picked)), bool(trip and trip.get('status') == 'done' and trip.get('counted')), J({'trip': trip and {k: trip.get(k) for k in ('status', 'counted', 'spots', 'night')}}))
    await R.shot(pg, tag + '_end')
    row = await analyze(pg, tag, loc, stage, dating, ctx, ev, screen, picked, cfg['names'])
    R.check('[%s] 6b 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'tag': tag, 'row': row, 'ev': ev, 'screen': screen, 'trip': trip, 'log': lg, 'steps': steps, 'skipped': skipped}, open(os.path.join(OUT, 'zq_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return row


async def wish_part(pg, cdp, errs):
    """WISH：參創第一次（一般第 5 階）＝心願事件整場；每一句都要在 date_wish.js events.heroine_04 或 D03 的格子／不分地點的短句裡"""
    tag = 'WISH_friend'; loc = 'D03'
    cfg = dict(LOCS[loc]); cfg['names'] = {k: v['name'] for k, v in (((DW.get('events') or {}).get(ZQ) or {}).get('hotspots') or {}).items()}
    cfg['order'] = list(cfg['names'].keys())
    e0 = len(errs)
    await base(pg, 20, 10.0, False, 5)
    ch = await choose_day(pg, loc, cfg, 5, False)
    if not ch['pick']: R.check('[%s] 找得到能約的日子' % tag, False, J(ch['res'])); return None
    day = ch['pick']['d']
    rb = await base(pg, day, 13.3, False, 5)
    R.setup('[%s] 讀檔：%s 13:18、第 %s 階、沒去過參創（心願還沒完成）' % (tag, ch['pick']['k'], rb['stage']))
    await pg.evaluate(HOOK); screen = []
    how, steps, trip = await book(pg, cdp, loc, cfg, screen)
    R.check('[%s] 預約（%s）：%s' % (tag, how, J(steps)), bool(trip and trip.get('status') == 'booked'), J(trip))
    if not trip: return None
    said, skipped = await depart(pg, cdp, cfg, screen)
    if said is None: R.check('[%s] 出發' % tag, False, J(skipped)); return None
    await play(pg, cdp, cfg, screen, tag)
    ev = await pg.evaluate("window.__ZE||[]")
    who_names = set(await pg.evaluate("(id=>[SOCIAL.displayName(id),(CHARACTERS[id]||{}).name].filter(Boolean))", ZQ))
    IDX = text_index(zl(loc), '/D03')
    log('== %s 逐句' % tag)
    bad = []; n = 0
    for e in ev:
        if e['k'] != 'say': log('  ［選單］%s → %s' % (J(e['opts']), e.get('pick'))); continue
        log('  %s｜第%s天 %05.2f｜%s' % (e['who'] or '（旁白）', e['d'], e['h'], e['t']))
        her = e['cid'] == ZQ or any(e['who'].startswith(x) for x in who_names)
        if her:
            n += 1
            if e['t'] not in WISH_IDX and e['t'] not in IDX and e['t'] not in COMMON: bad.append(e['t'])
    R.check('[%s] 心願事件她說的 %d 句都在 date_wish.js（events.heroine_04）／D03 格子／短句裡' % (tag, n), n > 0 and not bad, J(bad))
    R.check('[%s] 心願完成（WISH_DONE_heroine_04）' % tag, await pg.evaluate("!!GAME.G.flags.WISH_DONE_heroine_04"), '')
    R.check('[%s] 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'ev': ev, 'screen': screen}, open(os.path.join(OUT, 'zq_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return {'tag': tag, 'loc': loc, 'stage': '一般（第5階）', 'visit': 1, 'n': n, 'dating': 0, 'contact': 0, 'remember': 0, 'night': None, 'slots': []}


async def main():
    log('# DATE_ZQ %s SHA=%s TAG=%s PARTS=%s STAGES=%s PICK=%d REF=%s' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA, TAG, PARTS, STAGES, PICK, REF))
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        cdp_of[pg] = cdp
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        head = await pg.evaluate("(()=>({v:(document.getElementById('ver')||document.querySelector('.ver')||{}).textContent||'', night:DATE.NIGHT_HOME, morning:(DATE.MORNING||{}).heroine_04}))()")
        log('  版本字樣／NIGHT_HOME／MORNING：%s' % J(head))
        for part in PARTS:
            log('== %s' % part)
            try:
                if part in LOCS:
                    order = LOCS[part]['order']
                    for sg in STAGES:
                        dating = sg == 'dating'; stage = 6 if (dating or part == 'D26') else 5
                        row = await one_date(pg, cdp, errs, '%s_%s' % (part, sg), part, stage, dating, 2, order, order[:1], wish_done=(part == 'D03'))
                        if row: rows.append(row)
                elif part == 'REVISIT':
                    order = LOCS['D01']['order']
                    r1 = await one_date(pg, cdp, errs, 'REVISIT_1st', 'D01', 5, False, 0, [], [])
                    if r1: rows.append(r1)
                    G = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G))")
                    nx = await pg.evaluate("""(([id,d0])=>{ for(let d=d0+1;d<d0+15;d++){ const G2=Object.assign({},GAME.G,{day:d,hour:13,weather:'sunny'}); const c=DATE.check(G2,{who:id,locs:['D01'],day:d,depart:15,transport:'mrt'});
                        const T=CALENDAR.termOf?CALENDAR.termOf(d):null; if(c.ok&&!(T&&T.exam)){ const x=CALENDAR.dateOf(d); return {d,k:x.y+'-'+x.m+'-'+x.d}; } } return null; })""", [ZQ, G['day']])
                    if not nx: raise RuntimeError('第一次之後兩週內找不到能再約華山的日子')
                    d2, k2 = nx['d'], nx['k']
                    r2 = await one_date(pg, cdp, errs, 'REVISIT_2nd', 'D01', 5, False, 1, [], [], keepG={'G': G}, day_override=(d2, k2))
                    if r2:
                        rows.append(r2)
                        sp = [r for r in r2['slots'] if r['seg'].startswith('spot')]
                        R.check('[REVISIT_2nd] 4 第二次去：每個互動點都是再訪格（remember）', bool(sp) and all(r['slot'] == 'remember' for r in sp), J([[r['seg'], r['slot'], r['got']] for r in sp]))
                elif part == 'WISH':
                    row = await wish_part(pg, cdp, errs)
                    if row: rows.append(row)
                else:
                    log('  不認得的 PART：%s' % part)
            except Exception as e:
                import traceback
                R.check('[%s] 沒有丟出例外（探針）' % part, False, traceback.format_exc()[-800:])
                try: await R.shot(pg, part + '_exception')
                except Exception: pass
        for r in rows:
            if r['loc'] in LOCS and r['visit'] == 3 and r['slots']:
                first = next((x for x in r['slots'] if x['seg'].startswith('spot')), None)
                R.check('[%s] 4 第一個點（上一次點過）是再訪格 remember' % r['tag'], bool(first and first['slot'] == 'remember'), J(first and [first['seg'], first['slot']]))
        await b.close()
    log('== 表（地點×階段×第幾次×格數）')
    log('  %-14s %-4s %-10s %-4s %-6s %-6s %-6s %-6s %s' % ('tag', '地點', '階段', '次', '她＋旁白', '交往格', '肢體句', '再訪格', '晚上那句'))
    for r in rows:
        log('  %-14s %-4s %-10s %-4s %-6s %-6s %-6s %-6s %s' % (r['tag'], r['loc'], r['stage'], r['visit'], r['n'], r['dating'], r['contact'], r['remember'], r['night'] or '-'))
        for x in r['slots']: log('      %-22s %-9s %s' % (x['seg'], x['slot'], ' ／ '.join(x['got'])))
    sys.exit(R.finish())


asyncio.run(main())
