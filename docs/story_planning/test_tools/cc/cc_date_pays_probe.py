"""CC（帳號 A）11-11：AA_812（約會她請客／平分／祐廷請；c170218dd 整合）瀏覽器探針。判定歸 BB／AA；Playwright 手機模擬（844×390 觸控）≠ iPhone。
規格：企劃線 docs/story_planning/AA_812_date_pays_promises.json（she_pays.js 檔頭寫的那一版 633b7f7d6，另外和 origin/claude/story-planning 最新那一版比）＋受測樹 src/data/she_pays.js 檔頭。

誰付錢是怎麼決定的（c170218dd 讀碼，src/date3d.js）：
  不是玩家在選單上選「誰付」。每個互動點祐廷那一份＝S.pointCost（date_locations.js points 的 cost／costByMode），互動點演完當下扣（GAME.money(-c, 互動點名字)）。
  她請＝她在那個互動點說了 S.SHE_PAYS（date3d.js 以安三格＋she_pays.js pays，AA_782＋AA_812）裡的那一句 → 那一次祐廷那一份不扣（S.shePays → t.shePaid → S.takeShePaid）。
  平分＝她說了 S.SPLIT（she_pays.js split，AA_812 SPLIT）裡的那一句 → 那一次扣一半（S.splitMark → S.takeSplit → S.halfOf，Math.round）；同一個點兩種都說＝最後說的那一句算。
  祐廷請＝玩家選了「我請……」的對話選項（S.isTreat：含 我請／我買給妳／我付、不含 下次／飲料）→ 另外扣她那一份 extra（GAME.money(-extra, 名字＋'（請她）')），自己那一份照扣。
  她說哪一句由資料決定（第一次去＝first 格，選項的回話；再訪＝remember 格……），所以探針用「哪個人、哪個地點、第幾次去、選哪個選項」把情況做出來，選項照字點，像玩家一樣。
  錢不夠：預約時 DATE.check 只看 車資＋門票＋固定段（＋住宿）；互動點的錢不在預約檢查裡；GAME.money 是 G.money+=d（沒有下限）——所以要實際跑看會不會變負的、有沒有換她付或提示。

四趟（PARTS=ME,SHE,SPLIT,BROKE）：
  ME     子晴 heroine_04 D10 碧潭第一次（一般第 5 階，15:00 出發），點「河邊的小吃攤」，選「「我請客。」」→ 她回「謝謝。」（不在 SHE_PAYS／SPLIT）
         預期：小吃攤祐廷那一份全扣（60）＋請她的 extra（60）＝120
  SHE    子晴 D06 北美館第三次（【前置】dateLog 去過 2 次、上一次點過咖啡廳），點「館內的咖啡廳」→ remember「這家我來過兩次了。這次我請，你不要算。」（AA_812 SHE_PAYS_add）
         預期：咖啡廳那一份不扣（0；原價 160）；門票 30 照扣
  SPLIT  以安 heroine_01 D25 宜蘭外澳第一次（一日遊、火車，09:00 出發），點「海邊的咖啡館」，選「「我請。」」→ 她回「謝謝，那蛋糕我點，一人一半。」（AA_812 SPLIT）
         預期：咖啡館祐廷那一份扣一半＝Math.round(150/2)＝75，加上選了請客的 extra 150（date3d.js：請她的那一份照舊）＝225
         （規格裡不開車的 SPLIT 以安只有這一格和 D30（兩天一夜）；D22.fish「一人一半。」不用請客選項、比較乾淨，但開車要先走到望月台停車場按「開車出發」，這支不走路，所以沒選）
  BROKE  同 ME 的地點（子晴 D10 第一次），【前置】錢設成「預約檢查過得了（≥ 車資＋門票）、但小於小吃攤一份」，點小吃攤，選「「慢慢吃。」」（不請客，只看自己那一份）
         看：錢不夠時有沒有換成她付（這一份扣得比原價少）或出提示（#toast／對話裡有「錢」「不夠」）；錢在任何時候都不能變負的
【前置／捷徑】（log 都印 [前置／捷徑]）：讀檔（GAME.applySave、quiet_events）、日期（2025 學年大一上週六裡第一個 DATE.check 過的）、時間 13:18、晴天、錢（BROKE 以外 40000）；
  她的聯絡方式；關係數值（SOCIAL.rel）＝第 5 階、沒交往；dateLog／dateMemory（第一次＝清空；SHE＝去過 2 次、點過全部、上一次點過咖啡廳）。
  其餘全部走畫面：手機「朋友」→「約」→ 出去玩… → 類別 → 地點 →（交通）→ 今天 → 出發時間（半天 15:00、一日遊 09:00）→ 就這樣約；手機「今天」跳過時間到出發前 1 小時；「現在出發」／「出發」；
  開車的地點沒有選（出發要先走到望月台停車場按「開車出發」，carlot3d.js）；互動點選單只點目標那一個（SPOTS 預設 1），之後「差不多了，回去吧」；對話選項照字點（選不到就記下來、選第一個）。沒有走路（全程手機與選單）。
  等待中每 30 秒記狀態＋截圖；遊戲內部選單照按鈕字選安全的、記一行。
判定（每趟）：
  0  前置：情況真的做出來（第 5 階、第幾次去、BROKE 選互動點的當下錢 < 那一份）；走的路（預約、出發、選了哪個點、選了哪個選項）記在 log
  1  目標互動點畫面上的句子＝資料那一格（照 date3d.js 選句規則），逐句照順序；她說的「我請／平分」那一句＝she_pays.js（pays／split）裡的那一句，也在頁面 DATE.SHE_PAYS／DATE.SPLIT、也在規格 AA_812 裡
  2  扣的錢＝規格：那一份（她請 0、平分 Math.round(一份/2)、其他全額）＋請她的 extra（選了請客的選項才有）；一份、extra 的原價從 date_locations.js 讀，也和頁面 DATE.pointCost 對
  3  錢從頭到尾不會變負的（每一筆扣錢之後、每一句台詞當時、走完）
  4  （BROKE）錢不夠一份時換成她付或有提示
  5  約會走完（行程 done）；沒有 JS 例外
靜態（每次都跑，不開瀏覽器也印）：規格 SHE_PAYS_add ⊆ she_pays.js pays（以安另外看 date3d.js 手寫的）、規格 SPLIT＝she_pays.js split、每一句都在 date_lines.js 那個人那個互動點底下、
  path_rows 的新字在 date_lines.js 那個位置、changes 拿掉的「好。各付各的，最清楚。」不在 split；頁面上再比一次合併後的 DATE.SHE_PAYS／DATE.SPLIT、REMEMBER_IF 沒有 D06.cafe 那一列。
用法：LW_TESTS=<wt>/tests SHA=<40 碼> PARTS=ME,SHE,SPLIT,BROKE [SPOTS=1] [SPEC_REF=origin/claude/story-planning] python3 cc_date_pays_probe.py <url> <out>（URL 不加 ?turbo）"""
import os, sys, json, asyncio, time, re, subprocess
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT)
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
# 網址加 ?tapguard：遊戲在 webdriver 底下預設不擋「選單剛出來那一下的誤觸」（game3d.js tapGuardOn），真的手機會擋。不加的話，點對話框的那一下會在剛出來的選單上補發 click、
# 替玩家選掉選項（SPLIT r1、r2：出發前的「現在出發／到時間再說」被點掉、探針沒點過任何按鈕）。加了＝和手機一樣（乙 4）；NOGUARD=1 可以關掉
if os.environ.get('NOGUARD') != '1' and 'tapguard' not in URL: URL = URL + ('&' if '?' in URL else '?') + 'tapguard'
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or 'new'
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or 'ME,SHE,SPLIT,BROKE').split(',') if p.strip()]
PICK = 0
SPOTS = max(1, min(3, int(os.environ.get('SPOTS') or 1)))
SPEC_REF = os.environ.get('SPEC_REF') or 'origin/claude/story-planning'
SPEC_PATH = 'docs/story_planning/AA_812_date_pays_promises.json'
ROOT = os.path.abspath(os.path.join(LWT, '..'))
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('date_pays_' + TAG, OUT)
LOG = open(os.path.join(OUT, 'pays_lines.txt'), 'a', encoding='utf-8')
LOC = None   # 這支每一趟都明確給地點（zl(who, loc)）
STOPS = ('差不多了，回去吧', '就這樣回去', '今天先到這裡')
DAY_KEYS = ['2025-09-27', '2025-10-04', '2025-10-18', '2025-10-25', '2025-11-22', '2025-11-29', '2025-12-06']   # 大一上的週六（避開中秋、颱風、期中考週）
REL5 = dict(fam=50, trust=30, comf=30, npcRom=40)   # 第 5 階（cc_date_zq_probe.py 同一組）
SAFE_BTN = ['起身', '知道了', '好', '關閉', '繼續']
TREAT_RE = re.compile(r'我請|我買給妳|我付')   # date3d.js S.isTreat（去掉「」後含這些字、不含 下次／飲料）
NOTICE_RE = re.compile(r'錢不夠|不夠錢|沒錢|錢包|餘額|不夠付')
RUNS = {
    'ME': dict(who='heroine_04', loc='D10', visits=0, pid='D10.snack', pick='我請客', kind='me'),
    'SHE': dict(who='heroine_04', loc='D06', visits=2, pid='D06.cafe', pick=0, kind='she'),
    'SPLIT': dict(who='heroine_01', loc='D25', visits=0, pid='D25.cafe', pick='我請', kind='split'),   # D22.fish「一人一半。」要開車：出發要先走到望月台停車場（carlot3d.js），改用不開車的 D25
    'BROKE': dict(who='heroine_04', loc='D10', visits=0, pid='D10.snack', pick='慢慢吃', kind='broke'),
    # BB 19:09／LAWWW：同一趟第二次錢不夠只有旁白（回程車資也一樣）——【捷徑】第一次「錢不夠」旁白之後把錢設成 DROP_TO（小於回程車資），讓回程車資也不夠
    'BROKE2': dict(who='heroine_04', loc='D10', visits=0, pid='D10.snack', pick='慢慢吃', kind='broke', drop=10),
}
NARR = '（你的錢不夠。她先付了。）'   # LAWWW 19:09（AA_812 修正）：第一次旁白＋她一句（七位照 AA 原文），同一趟再不夠只有旁白
EGG_PID = 'D31.egg'   # LAWWW 19:09 ③：沛珊 D31.egg 不算她請客


def is_treat(t):
    x = (t or '').replace('「', '').replace('」', '')
    return bool(TREAT_RE.search(x)) and not re.search(r'下次|飲料', x)


def log(s):
    print(s, flush=True); LOG.write(s + '\n'); LOG.flush()


# ---------- 遊戲資料（受測樹 src/data）----------
def js_json(path, marker):
    t = open(path, encoding='utf-8').read()
    i = t.index(marker) + len(marker)
    return json.loads(t[i:t.rindex(';')])


DL = js_json(os.path.join(ROOT, 'src', 'data', 'date_lines.js'), 'const DATE_LINES=')
DD = js_json(os.path.join(ROOT, 'src', 'data', 'date_locations.js'), 'const DATE_DATA=')
PAGE = {'DEV_NOTE': set(), 'DEV_STRIP': {}, 'optGate': False}


def zl(who, loc=LOC):
    return ((DL['loc'].get(loc) or {}).get('lines') or {}).get(who) or {}


def draft_of(who, loc=LOC):
    """源稿（白名單 SHA 的 Dxx.json，照匯入工具先過 import_guard.read_fix）；讀不到＝None（乙 7：有退路）"""
    try:
        m = re.search(r"ALLOW_SHA:'([0-9a-f]+)'", open(os.path.join(ROOT, 'tests', 'date_src_sha.js'), encoding='utf-8').read())
        if not m: return None
        t = subprocess.check_output(['git', '-C', ROOT, 'show', '%s:docs/story_planning/date_system/lines/%s.json' % (m.group(1), loc)], stderr=subprocess.DEVNULL, text=True)
        try:
            sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import import_guard as IG
            t = IG.read_fix(t)
        except Exception as e:
            log('  （import_guard 讀不到：%s；稿照原字比）' % e)
        return json.loads(t)
    except Exception:
        return None


def shown(ln):
    """一句稿在畫面上的樣子（date3d.js playSet：旁白不是括號開頭的補括號）"""
    tx = ln.get('text', '')
    if ln.get('who') == 'narr': return tx if tx.startswith('（') else '（' + tx + '）'
    return tx


def opt_need(t):
    m = re.search(r'（第 ?(\d+) ?階以上[^）]*）$', t or '')
    return int(m.group(1)) if m else 0


def opt_text(t):
    return re.sub(r'（第 ?\d+ ?階以上[^）]*）$', '', t or '')


def cell_opts(S, ctx):
    """一格的選項（照 date3d.js optOk 擋「（第 N 階以上）」沒到的，去尾巴）→ [(字, 選項物件)]"""
    ch = [c for c in (S or {}).get('choice') or [] if c and isinstance(c.get('t'), str) and c['t'].strip()]
    if PAGE.get('optGate'):
        ch = [c for c in ch if not opt_need(c['t']) or ctx.get('dating') or (ctx.get('stage') or 0) >= opt_need(c['t'])]
        return [(opt_text(c['t']), c) for c in ch]
    return [(c['t'], c) for c in ch]


def reply_of(who, c):
    rep = c.get('reply')
    if isinstance(rep, list): return rep
    rr = c.get('re'); rr = [] if rr is None else (rr if isinstance(rr, list) else [rr])
    return [{'who': 'narr', 'text': x} if re.match(r'^（.*）$', x) else {'who': who, 'text': x} for x in rr if isinstance(x, str) and x.strip()]


def set_lines(who, S, pick, ctx):
    """一套 {lines, choice} → 畫面上會出的句子（note、DEV_NOTE 不出；DEV_STRIP 換字）＋選項回話（pick＝實際選的第幾個，None＝不選）"""
    def ok(x): return x and x.get('who') != 'note' and x.get('text') not in PAGE['DEV_NOTE']
    def sh(x): return shown(dict(x, text=PAGE['DEV_STRIP'].get(x.get('text'), x.get('text'))))
    out = [sh(x) for x in (S or {}).get('lines') or [] if ok(x)]
    ops = cell_opts(S, ctx)
    if ops and pick is not None and 0 <= pick < len(ops):
        out += [sh(x) for x in reply_of(who, ops[pick][1]) if ok(x)]
    return out


def pick_set(pool, tier, key, recent):
    """date3d.js S.pickSet：照階段 tier → 最近 3 套以外的第一個（第一次去 recent＝空的）"""
    allp = [(x, '%s#%d' % (key, i)) for i, x in enumerate(pool or []) if isinstance(x, dict) and isinstance(x.get('lines'), list) and '{lastDrink}' not in json.dumps(x.get('lines'), ensure_ascii=False)]
    ok = [o for o in allp if not o[0].get('tier') or o[0].get('tier') in ('any', tier)] or allp
    if not ok: return None, None
    fresh = [o for o in ok if o[1] not in recent]
    return fresh[0] if fresh else sorted(ok, key=lambda o: recent.index(o[1]))[0]


def expect(who, seg, pid, ctx):
    """照 date3d.js 的選句順序算這一段該出的那一格：(格名, 那一套)。第一次去（visits 0）＝first 格；地點＝ctx['loc']（沒有＝LOC）"""
    Z = zl(who, ctx.get('loc') or LOC)
    if seg in ('arrive', 'close'):
        A = Z.get('arrive' if seg == 'arrive' else 'closing') or {}
        if not ctx['visits'] and A.get('first') and not A['first'].get('wishEvent'): return 'first', A['first']
        k0 = 'arrive' if seg == 'arrive' else 'close'
        if ctx['dating'] and A.get('dating'): return 'dating', pick_set(A['dating'], ctx['tier'], k0 + '.dating', ctx.get('recent') or [])[0]
        return 'normal', pick_set(A.get('normal'), ctx['tier'], k0 + '.normal', ctx.get('recent') or [])[0]
    H = (Z.get('hotspots') or {}).get(pid) or {}
    hi = ctx['dating'] or (ctx.get('stage') or 0) >= 6
    if pid not in ctx['picks'] and H.get('first') and not H['first'].get('wishEvent'):
        if hi and H.get('firstHigh'):
            fh = H['firstHigh']; return 'firstHigh', (fh[0] if isinstance(fh, list) and fh else fh)
        return 'first', H['first']
    if (ctx['visits'] == 1 or pid in ctx['last']) and H.get('remember'): return 'remember', H['remember']
    if ctx['dating'] and H.get('dating'): return 'dating', pick_set(H['dating'], ctx['tier'], pid + '.dating', ctx.get('recent') or [])[0]
    return 'normal', pick_set(H.get('normal'), ctx['tier'], pid + '.normal', ctx.get('recent') or [])[0]


def leaves(x, p, o):
    if isinstance(x, list):
        for i, v in enumerate(x): leaves(v, p + '/' + str(i), o)
    elif isinstance(x, dict):
        for k, v in x.items(): leaves(v, p + '/' + k, o)
    else: o[p] = x
    return o


def text_index(obj, pre):
    idx = {}
    for k, v in leaves(obj, pre, {}).items():
        if not isinstance(v, str) or not (k.endswith('/text') or k.endswith('/t') or '/re' in k or '/dislikeLine/' in k): continue
        for s in {v, v if v.startswith('（') else '（' + v + '）'}:
            idx.setdefault(s, []).append(k)
    return idx


def common_lines(who):
    s = set()
    for k, v in ((DL.get('lines') or {}).get(who) or {}).items():
        for x in (v if isinstance(v, list) else [v]):
            if isinstance(x, str): s.add(x)
            elif isinstance(x, list): s.update(y for y in x if isinstance(y, str))
    return s


# ---------- 頁面上的掛勾（只記不改）----------
HOOK = r"""(()=>{ if(!window.__XH){ window.__XH=1; window.__ZE=[]; const n=()=>window.__ZE.length;
  const relOf=id=>{ try{ if(!id||typeof SOCIAL==='undefined'||!SOCIAL.rel) return null; const r=SOCIAL.rel(id), f=v=>+(+v||0).toFixed(2); return {fam:f(r.fam),trust:f(r.trust),comf:f(r.comf),npcRom:f(r.npcRom)}; }catch(e){ return null; } };
  window.__relOf=relOf;
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__ZE.push({k:'say',i:n(),who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day,m:GAME.G.money|0}); window.__ccLastSay=String(t==null?'':t).slice(0,60); }catch(e){} const rv=s0.apply(this,arguments); try{ const tx=String(t==null?'':t); if(window.__ccDropTo!=null&&!window.__ccDropped&&tx.indexOf('錢不夠')>=0){ window.__ccDropped=1; const b=GAME.G.money|0; GAME.G.money=window.__ccDropTo; window.__ZE.push({k:'drop',i:n(),before:b,after:GAME.G.money|0}); } }catch(e){} return rv; };
  if(GAME.money){ const m0=GAME.money; GAME.money=function(d,lab){ const b=GAME.G.money|0; const r=m0.apply(this,arguments); try{ window.__ZE.push({k:'money',i:n(),amt:d,label:String(lab==null?'':lab),before:b,after:GAME.G.money|0,h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day}); }catch(e){} return r; }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(a,b){ try{ window.__ZE.push({k:'cap',i:n(),t:String(b==null?a:b),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day}); }catch(e){} return p0.apply(this,arguments); }; }
  const c0=GAME.choose; GAME.choose=function(o){ const rec={k:'ch',i:n(),opts:(o||[]).map(x=>typeof x==='string'?x:((x&&x.t)||'')),dim:(o||[]).map(x=>!!(x&&x.dim)),h:+(+GAME.G.hour).toFixed(3),rel:relOf(window.__XW),m:GAME.G.money|0,pick:null};
    try{ window.__ZE.push(rec); }catch(e){} const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=k; }); }catch(e){} return p; };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx){ const f0=SOCIAL.applyFx; SOCIAL.applyFx=function(G_,id,fx,o){ const rb=relOf(id); window.__inFx=(window.__inFx|0)+1; let r=null; try{ r=f0.apply(this,arguments); } finally { window.__inFx--; }
    try{ window.__ZE.push({k:'fx',i:n(),id:id,fx:fx||null,cap:o&&o.cap||null,ret:r||null,rb:rb,ra:relOf(id)}); }catch(e){} return r; }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ const rb=relOf(id); const r=a0.apply(this,arguments);
    try{ window.__ZE.push({k:'adj',i:n(),id:id,d:d||null,nested:!!window.__inFx,rb:rb,ra:relOf(id)}); }catch(e){} return r; }; }
  const T=document.getElementById('toast'); if(T){ new MutationObserver(()=>{ const x=(T.innerText||'').trim(); const E=window.__ZE; if(x&&!(E.length&&E[E.length-1].k==='toast'&&E[E.length-1].t===x)) E.push({k:'toast',i:n(),t:x,m:GAME.G.money|0}); }).observe(T,{childList:true,subtree:true,characterData:true}); }
  }
  window.__ZE=[]; return true; })()"""

ST = r"""(()=>{ const D=GAME.D||{}, ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), nm=document.getElementById('dlgName');
  const B=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null):[];
  const E=window.__ZE||[]; let last=null; for(let i=E.length-1;i>=0;i--) if(E[i].k==='ch'){ last=E[i]; break; }
  const T=(GAME.G.trips||[]).slice(-1)[0]||null;
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(b=>(b.textContent||'').trim().slice(0,40)), ch:last&&last.pick==null?{i:last.i,opts:last.opts,dim:last.dim}:null,
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), adv:!!(typeof ADV!=='undefined'&&ADV.active), zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3), money:GAME.G.money|0,
    trip:T?{id:T.trip,status:T.status,locs:T.locs,depart:T.depart,kind:T.kind,spots:T.spots||[]}:null, busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy)}; })()"""

DLG_TOP_JS = r"""(()=>{ const d=document.getElementById('dlg'), ch=document.getElementById('choices'); if(!d) return {ok:false,why:'沒有 #dlg'};
  const nb=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).length:0; if(nb) return {ok:false,why:'選單在畫面上',nb:nb};
  const r=d.getBoundingClientRect(); const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {ok:!!e&&(e===d||d.contains(e)), top:e?(e.id||String(e.className).slice(0,40)||e.tagName):null}; })()"""

IDLE_JS = r"""(()=>{ const D=GAME.D||{}, E=GAME.E||{}, P=E.player||{}; const f2=v=>v==null?null:+(+v).toFixed(2);
  const ch=document.getElementById('choices'); const B=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.textContent||'').trim().slice(0,30)):[];
  const T=(GAME.G.trips||[]).slice(-1)[0]||null;
  return {zone:GAME.G.zone, day:GAME.G.day, hour:f2(GAME.G.hour), busy:!!P.busy, depth:D.busyDepth|0, by:(D.busyWho||[]).slice(-3), dlg:!!D.active, line:String(D.full||'').slice(0,60), lastSay:window.__ccLastSay||null,
    btn:B, phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), adv:typeof ADV!=='undefined'&&!!ADV.active, paused:!!E.paused, money:GAME.G.money|0,
    trip:T?{id:T.trip,status:T.status,depart:T.depart,day:T.day,spots:T.spots||[],reminded:!!T.reminded}:null, chCls:ch?ch.className:null, cover:D.coverWho||null,
    pend:(()=>{ const E=window.__ZE||[]; for(let i=E.length-1;i>=0;i--) if(E[i].k==='ch') return E[i].pick==null?E[i].opts:null; return null; })(),
    top:(()=>{ const e=document.elementFromPoint(innerWidth/2, innerHeight*0.8); return e?(e.id||String(e.className).slice(0,40)||e.tagName):null; })()}; })()"""


async def st(pg):
    return await pg.evaluate(ST)


class Idle:
    """沒進展每 30 秒記一次狀態＋截圖（前兩次）；進展＝狀態簽名變了（新的一句、新的選單、時間走了）"""
    def __init__(self, tag, where): self.tag = tag; self.where = where; self.sig = None; self.t = time.time(); self.n = 0

    async def tick(self, pg, s):
        sig = (s.get('full'), s.get('nb'), tuple(s.get('btn') or []), round(s.get('hour') or 0, 1), (s.get('trip') or {}).get('status'), s.get('phone'))
        if sig != self.sig: self.sig = sig; self.t = time.time(); return
        if time.time() - self.t < 30: return
        self.t = time.time(); self.n += 1
        try: dg = await pg.evaluate(IDLE_JS)
        except Exception as e: dg = {'err': str(e)[:120]}
        log('    [等待 %d｜%s｜%s] %s' % (self.n, self.tag, self.where, J(dg)))
        if self.n <= 2:
            try: await R.shot(pg, '%s_%s_idle%d' % (self.tag, self.where, self.n))
            except Exception: pass


async def tap_btn(pg, cdp, i):
    """點第 i 個看得到的選項；點之前確認最上面的就是那個按鈕（乙 4），不是就記下被誰蓋住"""
    c = await pg.evaluate("""(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2;
      const t=document.elementFromPoint(x,y); return [x,y,!!t&&(t===b||b.contains(t)), t?(t.id||String(t.className).slice(0,40)||t.tagName):null]; })""", i)
    if not c: return False
    if not c[2]: log('    ！選項 %d 上面蓋著 %s（照樣點，記下來）' % (i, c[3]))
    await L.touch_tap(cdp, c[0], c[1]); return True


class Menu:
    """選單剛出來 350 ms 內的點擊會被吃掉：同一組選項看到 ≥ 550 ms 才點；點了 2.5 秒還在＝再點一次"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.55


SEEN = set()


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
        screen.append([s['name'], s['full'], s['hour'], s['money']])
        await scan(pg)
    chk = await pg.evaluate(DLG_TOP_JS)   # 乙 4：點對話框之前確認最上面是對話框、沒有選單（選單一出來，點對話框中間會點到選項：SPLIT r1 出發前的「到時間再說」疑似這樣被點掉）
    if not chk.get('ok'):
        log('    ！不點對話框：%s' % J(chk))
        if chk.get('top') == 'phone': await L.phone_away(pg, cdp); log('    手機蓋在對話框上：先收手機')
        await pg.wait_for_timeout(300); return s
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)
    return s


async def internal_menu(pg, cdp, s, menu, where):
    """#choices 有按鈕、HOOK 沒抓到（遊戲內部選單）：照按鈕文字選安全的那一個；沒有安全的就只記（乙 4、13）"""
    if not await menu.ready(s): return False
    k = next((i for i, b in enumerate(s['btn']) for w in SAFE_BTN if b.startswith(w)), None)
    log('    [遊戲內部選單｜%s] 按鈕 %s → %s' % (where, J(s['btn']), s['btn'][k] if k is not None else '沒有安全的選項，不點（記狀態）'))
    if k is None: return False
    await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(700); return True


async def pick_word(pg, cdp, menu, words, screen, tag, max_s=90):
    """等選單，點第一個「字含 words 裡某一個」的選項（照 words 的順序優先）；回傳點到的字"""
    t0 = time.time(); idle = Idle(tag, 'pick'); nb_only = None
    while time.time() - t0 < max_s:
        s = await st(pg); await idle.tick(pg, s)
        if s['phone'] and s['nb']: await L.phone_away(pg, cdp); continue
        if s['nb'] and s['ch']:
            nb_only = None
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            for w in words:
                k = next((i for i, o in enumerate(s['ch']['opts']) if (w(o) if callable(w) else w in o)), None)
                if k is not None:
                    await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(700); return s['ch']['opts'][k]
            log('    ！選單裡沒有要的字：%s' % J(s['ch']['opts'])); return None
        if s['nb'] and not s['ch']:
            nb_only = nb_only or time.time()
            if time.time() - nb_only > 2 and await internal_menu(pg, cdp, s, menu, 'pick'): nb_only = None
            await pg.wait_for_timeout(300); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        await pg.wait_for_timeout(400)
    return None


async def idle_dlg(pg, cdp, screen, max_s=40):
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
cdp_of = {}


async def base(pg, who, day, hour, money=40000):
    flags = {'introDone': True, 'campusIntro': True, 'classDone': True}
    wd = await pg.evaluate("(d=>{ const x=CALENDAR.dateOf(d); return x?((x.wd%7)+7)%7:0; })", day)
    stt = {'zone': 'dorm', 'day': day, 'weekday': wd, 'hour': hour, 'weather': 'sunny', 'money': money, 'flags': flags}
    await L.load_state(pg, stt, quiet_events=True)
    await pg.wait_for_timeout(2500)
    await L.phone_away(pg, cdp_of[pg])
    r = await pg.evaluate("""(([id,rel])=>{ const G=GAME.G; G.contacts=G.contacts||{}; G.contacts[id]=1; const r=SOCIAL.rel(id); Object.assign(r,rel); delete G.flags['dating_'+id];
      return {stage:DATE.stageNum(id), r:{fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom}, dating:!!G.flags['dating_'+id], date:(CALENDAR.dateOf(G.day)||{}), hour:G.hour, weather:G.weather, money:G.money|0, can:DATE.canAsk(G,id)}; })""", [who, REL5])
    return r


async def choose_day(pg, who, loc, dep, kind):
    """DAY_KEYS 裡第一個 DATE.check 過、不是考試週的日子（只讀；臨時的 G 複本）；每一天被擋的原因都列（乙 2、3）"""
    return await pg.evaluate("""(([id,loc,dep,kind,keys,rel])=>{ const r=SOCIAL.rel(id); Object.assign(r,rel); const res=[];
      for(const k of keys){ const d=STORY.dayOfKey(k); const T=CALENDAR.termOf?CALENDAR.termOf(d):null; const G2=Object.assign({},GAME.G,{day:d,hour:dep-2,weather:'sunny',money:40000});
        const tr=((DATE.loc(loc)||{}).transport||[])[0]; const c=DATE.check(G2,{who:id,locs:[loc],day:d,depart:dep,kind:kind==='overnight'?'overnight':undefined,transport:tr&&tr.mode});
        res.push({k,d,ok:!!c.ok,why:c.why||'',warns:c.warns||[],exam:!!(T&&T.exam),cost:c.cost==null?null:c.cost}); if(c.ok&&!(T&&T.exam)) return {pick:{k,d,cost:c.cost},res}; }
      return {pick:null,res}; })""", [who, loc, dep, kind, DAY_KEYS, REL5])


# ---------- 預約、出發、約會 ----------
async def book(pg, cdp, who, loc, group, dep, screen, tag):
    menu = Menu(); how = '手機「朋友」→ 她的「約」'
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(900)
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % who
    if await pg.evaluate("s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; }", sel):
        await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    else:
        body = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        R.setup('[%s] 手機「朋友」沒有她的「約」（%s）→ 退回 INV.flow 開同一個選單【捷徑】' % (tag, body[:120].replace('\n', ' ')))
        await L.close_panels(pg, cdp); await pg.evaluate("(id=>{ void INV.flow(GAME,id,null,false); })", who); how = 'INV.flow【捷徑】'
    s = await st(pg)
    if s['phone'] and s['nb']: await L.phone_away(pg, cdp)
    name = await pg.evaluate("(l=>DATE.loc(l).name)", loc)
    steps = [await pick_word(pg, cdp, menu, ['出去玩'], screen, tag)]
    for _ in range(4):   # 類別 → 地點
        s = await st(pg); opts = (s['ch'] or {}).get('opts') or []
        if any(o.startswith('今天') for o in opts) or any('單程約' in o or '高鐵' in o for o in opts): break
        got = await pick_word(pg, cdp, menu, [name, group], screen, tag); steps.append(got)
        if got == name or got is None: break
    s = await st(pg); opts = (s['ch'] or {}).get('opts') or []
    if opts and not any(o.startswith('今天') for o in opts) and not any(o.startswith('算了') for o in opts[:1]):
        got = await pick_word(pg, cdp, menu, [lambda o: True], screen, tag); steps.append('交通：' + str(got))
    steps.append(await pick_word(pg, cdp, menu, [lambda o: o.startswith('今天')], screen, tag))
    hh = ('%02d:00' % dep, '%d:00' % dep)
    steps.append(await pick_word(pg, cdp, menu, [lambda o: o.startswith(hh)], screen, tag))
    steps.append(await pick_word(pg, cdp, menu, ['就這樣約'], screen, tag))
    await idle_dlg(pg, cdp, screen, 30)
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


async def depart(pg, cdp, dep, screen, tag, max_s=1800):
    """等出發：手機的跳過時間跳到出發前 1 小時，之後點「現在出發」或「出發」；回傳（點了哪個, 跳過紀錄）。
    雲端 SwiftShader 遊戲時間很慢（約 0.035 小時／30 秒），提早出發的選單沒出來時要等到出發時間的「出發」，所以上限 30 分鐘。
    HOOK 記到 GAME.choose 還沒選、畫面上卻沒有按鈕（選單沒顯示）超過 10 秒：記狀態＋截圖，照玩家會做的試一次（點對話框、開關手機），結果記下來（乙 4、甲 6）"""
    menu = Menu(); t0 = time.time(); skipped = []; said = None; idle = Idle(tag, 'depart'); nb_only = None; hid = None; hid_tries = 0
    while time.time() - t0 < max_s:
        s = await st(pg); await idle.tick(pg, s)
        if s['trip'] and s['trip']['status'] in ('going', 'done'): return said or 'going（自己出發）', skipped
        if s['ch'] and not s['nb'] and not s['dlg']:
            hid = hid or time.time()
            if time.time() - hid > 10 and hid_tries < 2:
                hid_tries += 1; hid = time.time()
                dg = await pg.evaluate(IDLE_JS)
                log('    ！[%s] 選單沒顯示：HOOK 記到 GAME.choose %s 還沒選，畫面上沒有按鈕（第 %d 次）：%s' % (tag, J(s['ch']['opts']), hid_tries, J(dg)))
                await R.shot(pg, '%s_hidden_menu%d' % (tag, hid_tries))
                if hid_tries == 1: await L.tap(pg, cdp, '#dlg'); log('    試：點一下對話框')
                else:
                    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900); await L.phone_away(pg, cdp); log('    試：打開手機再收起來')
                await pg.wait_for_timeout(1500); s2 = await st(pg)
                log('    試完：按鈕 %s、HOOK 還沒選的選單 %s' % (J(s2['btn']), J((s2['ch'] or {}).get('opts'))))
                skipped.append({'hidden_menu': s['ch']['opts'], 'try': hid_tries, 'after_btn': s2['btn']})
        else:
            hid = None
        if s['phone'] and not s['nb']: await L.phone_away(pg, cdp); continue
        if s['nb'] and s['ch']:
            nb_only = None
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['ch']['opts']
            k = next((i for i, o in enumerate(opts) if o == '現在出發'), None)
            if k is None: k = next((i for i, o in enumerate(opts) if o == '出發'), None)
            if k is None:
                log('  ！等出發時出現別的選單：%s → 不認得，選第一個（記下來）' % J(opts)); k = 0
            said = opts[k]; await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['nb'] and not s['ch']:
            nb_only = nb_only or time.time()
            if time.time() - nb_only > 2 and await internal_menu(pg, cdp, s, menu, 'depart'): nb_only = None
            await pg.wait_for_timeout(300); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        tgt = dep - 1
        if s['hour'] < tgt - 0.25 and len(skipped) < 3 and not any(x.get('wait') for x in skipped):
            t, bs = await skip_to(pg, cdp, tgt); skipped.append({'from': s['hour'], 'tap': t, 'buttons': [b['t'] for b in bs]})
            log('  手機「今天」跳過時間：%s（可以點的 %s）' % (t, J([b['t'] for b in bs])))
            if t is None: skipped[-1]['wait'] = True; log('  沒有不超過出發前 1 小時的跳過鍵：等遊戲時間自己走（%.2f → %.2f）' % (s['hour'], tgt))
            continue
        await pg.wait_for_timeout(1000)
    tail = await pg.evaluate("(window.__ZE||[]).slice(-8).map(e=>[e.k,e.t||e.opts||e.label,e.pick==null?null:e.pick])")
    log('    ！[%s] 等出發逾時：最後的 HOOK 事件 %s' % (tag, J(tail)))
    return None, skipped


async def play(pg, cdp, names, order, maxp, picks_rule, screen, tag, max_s=1200):
    """約會本身：互動點選單照 order 選（最多 maxp 個，之後選停），對話選項照 picks_rule（pid→字或數字；沒有＝PICK），快速約會選「自己選」"""
    menu = Menu(); t0 = time.time(); picked = []; idle = Idle(tag, 'play'); done_t = None; nb_only = None; path = []
    while time.time() - t0 < max_s:
        s = await st(pg); await idle.tick(pg, s)
        tr = s['trip'] or {}
        if tr.get('status') in ('done', 'cancelled') and not s['dlg'] and not s['nb'] and not s['adv']:
            if done_t is None: done_t = time.time()
            if time.time() - done_t > 3: break
            await pg.wait_for_timeout(500); continue
        done_t = None
        if s['phone']: await L.phone_away(pg, cdp); continue
        if s['nb'] and s['ch']:
            nb_only = None
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts, dim = s['ch']['opts'], s['ch']['dim']
            if opts and opts[-1] in STOPS:
                left = opts[:-1]; k = None
                if len(picked) < maxp:
                    for pid in order:
                        nm = names.get(pid)
                        if nm in left and not dim[left.index(nm)] and pid not in picked: k = left.index(nm); picked.append(pid); break
                if k is None: k = len(opts) - 1
                log('  [選互動點] %s → %s' % (J(opts), opts[k])); path.append('互動點：' + opts[k])
            elif opts and opts[0] == '自己選':
                k = 0; log('  [快速約會] %s → 自己選' % J(opts)); path.append('快速約會→自己選')
            elif '現在出發' in opts or '出發' in opts:
                k = opts.index('現在出發') if '現在出發' in opts else opts.index('出發')
            elif any('告訴她' in o for o in opts):
                k = next(i for i, o in enumerate(opts) if '告訴她' not in o); log('  ！出現告白選項 %s → 不說' % J(opts))
            else:
                rule = picks_rule.get(picked[-1], PICK) if picked else PICK
                if isinstance(rule, str):
                    k = next((i for i, o in enumerate(opts) if rule in o), None)
                    if k is None: log('  ！選項裡沒有「%s」：%s → 選第一個' % (rule, J(opts))); k = 0
                else:
                    k = min(int(rule), len(opts) - 1)
                log('  [對話選項] %s → %s（選法 %s）' % (J(opts), opts[k], rule)); path.append('對話選項：' + opts[k])
            await scan(pg)
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(800); continue
        if s['nb'] and not s['ch']:
            nb_only = nb_only or time.time()
            if time.time() - nb_only > 2 and await internal_menu(pg, cdp, s, menu, 'play'): nb_only = None; path.append('遊戲內部選單')
            await pg.wait_for_timeout(300); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        await pg.wait_for_timeout(500)
    return picked, path


# ---------- 分析 ----------
def segments(ev, locname):
    """事件 → 段落：arrive（地點那一行到第一個互動點選單）、spot:<名字>、close（停的選項以後到結算）、settle"""
    segs = []; cur = ('pre', None); buf = []
    def flush():
        if buf or cur[0] != 'pre': segs.append((cur[0], cur[1], list(buf)))
    for e in ev:
        if e['k'] == 'say':
            t = e['t']
            if t == '（' + locname + '。）': flush(); buf = []; cur = ('arrive', None); continue
            if t.startswith('（今天去了') or t.startswith('（這兩天去了'): flush(); buf = [e]; cur = ('settle', None); continue
            buf.append(e)
        elif e['k'] == 'ch':
            opts = e['opts']; k = e.get('pick')
            if opts and opts[-1] in STOPS and k is not None:
                flush(); buf = []
                cur = ('close', None) if k >= len(opts) - 1 else ('spot', opts[k])
            else:
                buf.append(e)
        else:
            buf.append(e)
    flush()
    return segs




# ---------- 規格、she_pays.js ----------
SP = js_json(os.path.join(ROOT, 'src', 'data', 'she_pays.js'), 'const SHE_PAYS_DATA=')
PTS = (DD.get('points') or {}).get('points') or {}


def load_specs():
    """規格：she_pays.js 檔頭寫的那一版（匯入用的）＋SPEC_REF 最新那一版；讀不到的記下來（乙 7）"""
    out = {}
    try:
        hdr = open(os.path.join(ROOT, 'src', 'data', 'she_pays.js'), encoding='utf-8').read(3000)
        m = re.search(r'AA_812_date_pays_promises\.json@([0-9a-f]{7,40})', hdr)
    except Exception:
        m = None
    for ref in ([m.group(1)] if m else []) + [SPEC_REF]:
        try:
            t = subprocess.check_output(['git', '-C', ROOT, 'show', '%s:%s' % (ref, SPEC_PATH)], stderr=subprocess.DEVNULL, text=True)
            out[ref] = json.loads(t)
        except Exception as e:
            log('  規格讀不到（%s:%s）：%s' % (ref, SPEC_PATH, str(e)[:120]))
    return out, (m.group(1) if m else None)


def as_sets(d):
    return {(w, p): set(v or []) for w, x in (d or {}).items() for p, v in (x or {}).items()}


def path_get(root, path):
    """「loc.D06.lines.heroine_04.hotspots['D06.cafe'].first.choice[1].reply[0]」→ 那個值；找不到＝None"""
    cur = root
    for a, b, c in re.findall(r"\['([^']+)'\]|\[(\d+)\]|\.?([^.\[\]]+)", path):
        k = a or c
        try:
            cur = cur[int(b)] if b else cur[k]
        except Exception:
            return None
    return cur


def static_checks(specs, pin):
    SPEC = specs.get(pin) or specs.get(SPEC_REF)
    if not SPEC:
        R.check('靜態 0 規格 AA_812 讀得到（git show）', False, J(list(specs.keys()))); return None
    log('  規格用的版本：%s（she_pays.js 檔頭寫的 %s）' % (pin if specs.get(pin) else SPEC_REF, pin))
    if pin and specs.get(pin) and specs.get(SPEC_REF):
        same = J(specs[pin].get('SHE_PAYS_add')) == J(specs[SPEC_REF].get('SHE_PAYS_add')) and J(specs[pin].get('SPLIT')) == J(specs[SPEC_REF].get('SPLIT')) and J(specs[pin].get('path_rows')) == J(specs[SPEC_REF].get('path_rows'))
        R.check('靜態 0 匯入用的那一版（%s）和 %s 最新的規格內容一樣（SHE_PAYS_add、SPLIT、path_rows）' % (pin, SPEC_REF), same, '' if same else '不一樣：遊戲匯入的是舊版')
    sp_p, sp_s = as_sets(SP.get('pays')), as_sets(SP.get('split'))
    miss = [[w, p, t] for (w, p), v in as_sets(SPEC.get('SHE_PAYS_add')).items() for t in v if t not in sp_p.get((w, p), set())]
    R.check('靜態 1 規格 SHE_PAYS_add 每一句都在 she_pays.js pays（%d 句）' % sum(len(v) for v in as_sets(SPEC.get('SHE_PAYS_add')).values()), not miss, J(miss))
    extra = [[w, p, sorted(v - as_sets(SPEC.get('SHE_PAYS_add')).get((w, p), set()))] for (w, p), v in sp_p.items() if v - as_sets(SPEC.get('SHE_PAYS_add')).get((w, p), set())]
    if extra: log('  【觀察】she_pays.js pays 有、AA_812 SHE_PAYS_add 沒列的（AA_782 的格子，不算 FAIL）：%s' % J(extra))
    ss = as_sets(SPEC.get('SPLIT'))
    d1 = [[w, p, sorted(v ^ sp_s.get((w, p), set()))] for (w, p), v in ss.items() if v != sp_s.get((w, p), set())] + [[w, p, sorted(v)] for (w, p), v in sp_s.items() if (w, p) not in ss]
    R.check('靜態 2 規格 SPLIT＝she_pays.js split（%d 句）' % sum(len(v) for v in ss.values()), not d1, J(d1))
    bad = []
    for (w, p), v in list(as_sets(SPEC.get('SHE_PAYS_add')).items()) + list(ss.items()):
        loc = p.split('.')[0]
        H = (((((DL.get('loc') or {}).get(loc) or {}).get('lines') or {}).get(w) or {}).get('hotspots') or {}).get(p)
        for t in v:
            n = sum(1 for k, x in leaves(H or {}, '', {}).items() if x == t)
            if n != 1: bad.append([w, p, t, n])
    R.check('靜態 3 規格的每一句在 date_lines.js 那個人那個互動點底下剛好一處', not bad, J(bad))
    pr = []
    for r in SPEC.get('path_rows') or []:
        v = path_get(DL, r.get('path') or '')
        got = v.get('text') if isinstance(v, dict) else v
        pr.append([r.get('path'), r.get('new'), got, got == r.get('new')])
    R.check('靜態 4 規格 path_rows 的新字在 date_lines.js 那個位置（%d 列）' % len(pr), all(x[3] for x in pr), J(pr))
    gone = [m for c in (SPEC.get('_meta') or {}).get('changes') or [] for m in re.findall(r'「([^」]+)」拿掉', c)]
    left = [t for t in gone for v in sp_s.values() if t in v]
    R.check('靜態 5 規格 changes 說拿掉的句子不在 she_pays.js split：%s' % J(gone), not left, J(left))
    return SPEC


def half(c):
    """JS Math.round(c/2)（.5 往上）"""
    return int((c / 2.0) + 0.5) if c >= 0 else -int((-c / 2.0) + 0.5)


async def set_memory(pg, who, loc, visits, picks, last):
    """約會紀錄：第一次＝清空；再訪＝dateLog 次數 visits、這個地點 visits 次、點過 picks、上一次 last"""
    return await pg.evaluate("""(([id,loc,v,picks,last])=>{ const G=GAME.G; DATE.rec(G); const L=DATE.log(G,id); L.count=v; L.byLoc[loc]=v; const m=DATE.mem(G,id,loc); m.picks=picks.slice(); m.last=last.slice(); m.recent=[]; m.optN={};
      return {count:L.count, byLoc:L.byLoc[loc], mem:{picks:m.picks,last:m.last,recent:m.recent}, tier:DATE.tierOf(G,id)}; })""", [who, loc, visits, picks, last])


PAGE_PAYS_JS = r"""(()=>({pays:DATE.SHE_PAYS||null, split:DATE.SPLIT||null, rem:(DATE.REMEMBER_IF||[]).map(r=>({loc:r.loc,who:r.who,pid:r.pid,flag:r.flag})),
  fn:{shePays:typeof DATE.shePays, splitMark:typeof DATE.splitMark, halfOf:typeof DATE.halfOf, pointCost:typeof DATE.pointCost}}))()"""


def page_checks(SPEC, pg_p):
    if not SPEC or not pg_p: return
    pp, ps = as_sets(pg_p.get('pays')), as_sets(pg_p.get('split'))
    miss = [[w, p, t] for (w, p), v in as_sets(SPEC.get('SHE_PAYS_add')).items() for t in v if t not in pp.get((w, p), set())]
    R.check('頁面 1 合併後的 DATE.SHE_PAYS 有規格 SHE_PAYS_add 的每一句', not miss, J(miss))
    egg = [[w, p, sorted(v)] for (w, p), v in pp.items() if p == EGG_PID]
    R.check('頁面 1b 沛珊 %s 不算她請客（DATE.SHE_PAYS 沒有這一格；LAWWW 19:09 ③）' % EGG_PID, not egg, J(egg))
    ss = as_sets(SPEC.get('SPLIT'))
    d1 = [[w, p, sorted(v ^ ps.get((w, p), set()))] for (w, p), v in ss.items() if v != ps.get((w, p), set())] + [[w, p, sorted(v)] for (w, p), v in ps.items() if (w, p) not in ss]
    R.check('頁面 2 DATE.SPLIT＝規格 SPLIT', not d1, J(d1))
    rem = [r for r in pg_p.get('rem') or [] if r.get('loc') == 'D06' and r.get('who') == 'heroine_04' and r.get('pid') == 'D06.cafe']
    R.check('頁面 3 DATE.REMEMBER_IF 沒有子晴 D06.cafe 那一列（AA_812 changes：再訪不綁 ZQ_D06_TREAT）', not rem, J(rem))
    log('  頁面函式：%s' % J(pg_p.get('fn')))


async def run_one(pg, cdp, errs, part, SPEC, pg_p):
    c = RUNS[part]; who, loc, pid, visits = c['who'], c['loc'], c['pid'], c['visits']
    tag = '%s_%s_%s' % (part, who, loc)
    names = dict(DL['loc'][loc]['points']); P = PTS.get(pid) or {}
    pname = P.get('name') or names.get(pid)
    grp = await pg.evaluate("(l=>((DATE.GROUPS||[]).find(g=>g.ids.includes(l))||{}).t||'')", loc)
    kind = await pg.evaluate("(l=>DATE.kindAt(l,15))", loc)
    dep = 9 if kind == 'day' else 15   # date3d.js S.TIMES：一日遊 8、9 點出發；半天 15:00
    h0 = dep - 1.7   # 讀檔時間：出發前 1 小時 40 分（預約要早於出發 15 分鐘；跳過時間到出發前 1 小時）
    log('== %s（%s %s，第 %d 次去，點「%s」，選項「%s」；%s）' % (tag, who, loc, visits + 1, pname, c['pick'], c['kind']))
    log('  互動點資料（date_locations.js）：%s' % J(P))
    e0 = len(errs)
    await base(pg, who, 20, 10.0)
    ch = await choose_day(pg, who, loc, dep, kind)
    log('  選日子（DATE.check，只讀；每一天的原因）：%s' % J(ch['res']))
    if not ch['pick']: R.check('[%s] 0 前置：找得到能約的日子' % tag, False, J(ch['res'])); return None
    day, dkey, cost_chk = ch['pick']['d'], ch['pick']['k'], ch['pick'].get('cost') or 0
    tr0 = await pg.evaluate("(l=>{ const L=DATE.loc(l); const m=L.needsCar?'car':((L.transport||[])[0]||{}).mode; return m||null; })", loc)
    share_py = int(((P.get('costByMode') or {}).get(tr0)) if (P.get('costByMode') or {}).get(tr0) is not None else (P.get('cost') or 0))
    money0 = 40000
    if c['kind'] == 'broke':
        if share_py <= cost_chk:
            R.check('[%s] 0 前置：做得出「預約過得了、但小於一份」的錢（預約檢查 %d、一份 %d）' % (tag, cost_chk, share_py), False, ''); return None
        money0 = cost_chk + (share_py - cost_chk) // 2
    rb = await base(pg, who, day, h0, money=money0)
    R.setup('[%s] 讀檔（applySave、quiet_events）：宿舍、%s（第 %d 天）%05.2f 點、晴天、錢 %d%s；聯絡方式 G.contacts.%s；關係 %s → 第 %s 階；沒交往；canAsk %s' % (
        tag, dkey, day, h0, money0, '（＝預約檢查要的 %d 和「%s」一份 %d 中間：預約過得了、到那個點時不夠一份）' % (cost_chk, pname, share_py) if c['kind'] == 'broke' else '',
        who, J(rb['r']), rb['stage'], J(rb.get('can'))))
    allp = list(names.keys())
    picks, last = (allp, [pid]) if visits else ([], [])
    mem = await set_memory(pg, who, loc, visits, picks, last)
    R.setup('[%s] 約會紀錄：%s' % (tag, J(mem)))
    R.check('[%s] 0 前置：第 5 階、沒交往、canAsk 過、錢 %d' % (tag, money0), rb['stage'] == 5 and not rb['dating'] and bool((rb.get('can') or {}).get('ok')) and rb.get('money') == money0, J(rb))
    SEEN.clear()
    await pg.evaluate("(w=>{ window.__XW=w; })", who)
    await pg.evaluate(HOOK)
    await pg.evaluate("(v=>{ window.__ccDropTo=v; window.__ccDropped=0; })", c.get('drop'))
    if c.get('drop') is not None: R.setup('[%s] 【捷徑】第一次「錢不夠」旁白之後把錢設成 %d（小於回程車資），做出「同一趟第二次不夠」' % (tag, c['drop']))
    ctx = {'loc': loc, 'visits': visits, 'dating': False, 'stage': 5, 'tier': mem['tier'], 'picks': list(picks), 'last': list(last), 'recent': []}   # loc：SPLIT r3 沒帶地點，expect() 拿到空的格子（探針錯，已修）
    screen = []
    how, steps, trip = await book(pg, cdp, who, loc, grp, dep, screen, tag)
    R.check('[%s] 預約（%s）：%s；行程 booked、今天 %02d:00 出發' % (tag, how, J(steps), dep),
            bool(trip and trip.get('status') == 'booked' and trip.get('locs') == [loc] and trip.get('day') == day and abs((trip.get('depart') or 0) - dep) < 1e-6), J(trip))
    if not (trip and trip.get('status') == 'booked'):
        await R.shot(pg, tag + '_book_fail'); return None
    share_pg = await pg.evaluate("(([l,pid,tid])=>{ const t=DATE.trip(GAME.G,tid), p=DATE.points(l).find(x=>x.id===pid); return p&&t?DATE.pointCost(p,t):null; })", [loc, pid, trip['trip']])
    R.check('[%s] 一份的原價：date_locations.js %d（交通 %s）＝頁面 DATE.pointCost %s' % (tag, share_py, trip.get('transport'), share_pg), share_pg == share_py, '')
    said, skipped = await depart(pg, cdp, dep, screen, tag)
    R.check('[%s] 出發（%s）' % (tag, said), said is not None, J(skipped))
    if said is None: await R.shot(pg, tag + '_depart_fail'); return None
    picked, path = await play(pg, cdp, names, [pid], SPOTS, {pid: c['pick']}, screen, tag)
    s = await st(pg)
    ev = await pg.evaluate("window.__ZE||[]")
    trip = await pg.evaluate("(id=>(GAME.G.trips||[]).find(t=>t.trip===id)||null)", s['trip']['id'] if s['trip'] else '')
    m_end = await pg.evaluate("GAME.G.money|0")
    R.note('[%s] 走的路：預約 %s；出發 %s（跳過時間 %s）；約會 %s' % (tag, how, said, J([x.get('tap') for x in skipped]), J(path)))
    R.check('[%s] 5 約會走完（行程 done）、點到「%s」' % (tag, pname), bool(trip and trip.get('status') == 'done') and pid in picked, J({'trip': trip and {k: trip.get(k) for k in ('status', 'counted', 'spots', 'transport', 'fare')}, 'picked': picked}))
    await R.shot(pg, tag + '_end')
    row = analyze(tag, c, who, loc, pid, pname, ctx, ev, screen, share_py, P, SPEC, pg_p, m_end, money0)
    R.check('[%s] 5 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'tag': tag, 'row': row, 'ev': ev, 'screen': screen, 'trip': trip, 'steps': steps, 'skipped': skipped, 'path': path},
              open(os.path.join(OUT, 'pays_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return row


def analyze(tag, c, who, loc, pid, pname, ctx, ev, screen, share, P, SPEC, pg_p, m_end, money0):
    log('== %s 逐句（說話人｜遊戲時間｜當時的錢｜原文）' % tag)
    for e in ev:
        k = e['k']
        if k == 'say': log('  %s｜第%s天 %05.2f｜%s 元｜%s' % (e['who'] or '（旁白）', e['d'], e['h'], e['m'], e['t']))
        elif k == 'money': log('  ［錢］%+d（%s）%d → %d' % (e['amt'], e['label'], e['before'], e['after']))
        elif k == 'ch': log('  ［選單］%s → %s｜選的當下 %s 元' % (J(e['opts']), e['opts'][e['pick']] if e.get('pick') is not None and e['pick'] < len(e['opts']) else e.get('pick'), e.get('m')))
        elif k == 'toast': log('  ［提示］%s（%s 元）' % (e['t'], e.get('m')))
        elif k == 'cap': log('  ［字幕］%s' % e['t'])
    locname = (DD.get('locations') or {}).get(loc, {}).get('name') or ''
    segs = segments(ev, locname)
    seg = next((b for k, a, b in segs if k == 'spot' and a == pname), None)
    if seg is None:
        R.check('[%s] 1 找得到「%s」那一段（前一步沒成功，後面的錢、台詞檢查跳過）' % (tag, pname), False, J([[k, a] for k, a, _ in segs])); return None
    says = [e for e in seg if e['k'] == 'say']
    chs = [e for e in seg if e['k'] == 'ch' and not (e['opts'] and e['opts'][0] == '自己選')]
    pk = chs[0].get('pick') if chs else None
    chosen = chs[0]['opts'][pk] if chs and pk is not None and pk < len(chs[0]['opts']) else None
    slot, S = expect(who, 'spot', pid, ctx)
    want = set_lines(who, S, pk, ctx)
    if c['kind'] == 'broke':   # 錢不夠的旁白＋她那一句是遊戲另外加的（不在這一格資料裡）：1a 比對時拿掉，4b／4c 另外判
        rm = []; k2 = 0
        while k2 < len(says):
            t = says[k2]['t']
            if '錢不夠' in t and '她先付' in t:
                rm.append(t); says = says[:k2] + says[k2 + 1:]
                if k2 < len(says) and says[k2].get('cid') == who: rm.append(says[k2]['t']); says = says[:k2] + says[k2 + 1:]
                continue
            k2 += 1
        if rm: log('  [%s] 1a 比對時拿掉錢不夠的旁白＋她那一句：%s' % (tag, J(rm)))
    got = [e['t'] for e in says]
    if not want: log('  ！[%s] 照資料算出來的預期是空的（%s 格）：探針可能讀錯格子，1a 的 FAIL 先當探針問題查' % (tag, slot))
    R.check('[%s] 1a 「%s」畫面上的句子＝資料 %s 格（%s 選「%s」），逐句照順序' % (tag, pname, slot, pid, chosen), got == want, J({'want': want, 'got': got}))
    scr_ok = all(any(x[1] == t for x in screen) for t in want)
    R.check('[%s] 1a 這幾句都真的出現在畫面上的對話框' % tag, scr_ok, J([t for t in want if not any(x[1] == t for x in screen)]))
    her = [e['t'] for e in says if e.get('cid') == who]
    sp_p = set(((SP.get('pays') or {}).get(who) or {}).get(pid) or []); sp_s = set(((SP.get('split') or {}).get(who) or {}).get(pid) or [])
    pg_pl = set((((pg_p or {}).get('pays') or {}).get(who) or {}).get(pid) or []); pg_sl = set((((pg_p or {}).get('split') or {}).get(who) or {}).get(pid) or [])
    spec_p = set(((SPEC.get('SHE_PAYS_add') or {}).get(who) or {}).get(pid) or []) if SPEC else set()
    spec_s = set(((SPEC.get('SPLIT') or {}).get(who) or {}).get(pid) or []) if SPEC else set()
    hand = pg_pl - sp_p   # date3d.js 手寫的（以安三格，AA_780）
    state = None; line = None
    for t in her:   # S.splitMark：最後說的那一句算
        if t in spec_p or t in hand: state, line = 'pays', t
        elif t in spec_s: state, line = 'split', t
    gstate = None; gline = None
    for t in her:
        if t in pg_pl: gstate, gline = 'pays', t
        elif t in pg_sl: gstate, gline = 'split', t
    log('  [%s] 她在這個點說的：%s；照規格＝%s（%s）；照頁面 DATE.SHE_PAYS／SPLIT＝%s（%s）' % (tag, J(her), state, line, gstate, gline))
    want_state = {'she': 'pays', 'split': 'split'}.get(c['kind'])
    if want_state == 'split' and chosen and is_treat(chosen):
        log('  [%s] 選了請客「%s」：照 LAWWW 19:09 這個點不套平分（她說了平分那一句：%s），應扣自己一份全額＋請她' % (tag, chosen, line))
    elif want_state:
        R.check('[%s] 0 情況做出來了：她說了%s的那一句' % (tag, '請客' if want_state == 'pays' else '平分'), state == want_state, J(her))
        R.check('[%s] 1b 那一句「%s」在 she_pays.js（%s）、頁面合併後的表、規格 AA_812 裡都一字不差' % (tag, line, 'pays' if want_state == 'pays' else 'split'),
                bool(line) and line in (sp_p if want_state == 'pays' else sp_s) and line in (pg_pl if want_state == 'pays' else pg_sl) and line in (spec_p if want_state == 'pays' else spec_s),
                J({'she_pays.js': sorted(sp_p | sp_s), 'page': sorted(pg_pl | pg_sl), 'spec': sorted(spec_p | spec_s)}))
    else:
        R.check('[%s] 1b 這個點她沒有說 SHE_PAYS／SPLIT 的句子（she_pays.js、頁面、規格都沒有）' % tag, state is None and gstate is None and not ((sp_p | sp_s | spec_p | spec_s) & set(her)), J(her))
        if c['kind'] == 'me':
            R.check('[%s] 0 情況做出來了：選的是請客的選項（S.isTreat）「%s」' % (tag, chosen), bool(chosen) and is_treat(chosen), '')
    treat = bool(chosen and is_treat(chosen))
    # LAWWW 19:09 ②：選「我請」的那個互動點不套平分（他付兩份：自己一份＋「（請她）」）
    share_due = 0 if state == 'pays' else (half(share) if (state == 'split' and not treat) else share)
    if c['kind'] == 'broke': share_due = 0   # LAWWW 19:09 ①：錢不夠＝那一筆她付、不扣
    extra_due = (P.get('extra') or 0) if (chosen and is_treat(chosen) and (P.get('extra') or 0) > 0) else 0
    mon = [e for e in seg if e['k'] == 'money']
    share_act = -sum(e['amt'] for e in mon if e['label'] == pname)
    extra_act = -sum(e['amt'] for e in mon if e['label'] == pname + '（請她）')
    R.check('[%s] 2 扣的錢＝規格：一份 %d → 應扣 %d（%s）＋請她 %d ＝ %d；實扣 一份 %d ＋請她 %d ＝ %d' % (
        tag, share, share_due, {'pays': '她請', 'split': '平分 Math.round(一份/2)'}.get(state, '祐廷自己那一份全額'), extra_due, share_due + extra_due, share_act, extra_act, share_act + extra_act),
        share_act == share_due and extra_act == extra_due, J([[e['amt'], e['label'], e['before'], e['after']] for e in mon]))
    allm = [[e['amt'], e['label'], e['before'], e['after']] for e in ev if e['k'] == 'money']
    log('  [%s] 這一趟所有扣錢：%s；讀檔 %d → 走完 %d' % (tag, J(allm), money0, m_end))
    lows = [('扣錢後', e['label'], e['after']) for e in ev if e['k'] == 'money' and e['after'] < 0] + [('台詞當時', e['t'][:20], e['m']) for e in ev if e['k'] == 'say' and e['m'] < 0]
    if m_end < 0: lows.append(('走完', '', m_end))
    mn = min([money0, m_end] + [e['after'] for e in ev if e['k'] == 'money'] + [e['m'] for e in ev if e['k'] == 'say'])
    R.check('[%s] 3 錢從頭到尾不會變負的（最低 %d）' % (tag, mn), not lows, J(lows[:8]))
    if c['kind'] == 'broke':
        m_at = next((e.get('m') for e in ev if e['k'] == 'ch' and e['opts'] and e['opts'][-1] in STOPS and e.get('pick') is not None and e['pick'] < len(e['opts']) and e['opts'][e['pick']] == pname), None)
        R.check('[%s] 0 前置：選「%s」的當下錢 %s < 一份 %d' % (tag, pname, m_at, share), m_at is not None and m_at < share, '')
        nar = [k for k, e in enumerate(ev) if e['k'] in ('say', 'cap') and '錢不夠' in (e.get('t') or '') and '她先付' in (e.get('t') or '')]
        nar_t = [ev[k]['t'] for k in nar]
        def nxt(k):
            for e in ev[k + 1:]:
                if e['k'] in ('say', 'cap'): return e
            return None
        after = [nxt(k) for k in nar]
        log('  [%s] 錢不夠的旁白 %d 次：%s；每一次後面那一句：%s' % (tag, len(nar), J(nar_t), J([[a.get('who'), a.get('cid'), a.get('t')] if a else None for a in after])))
        R.check('[%s] 4a 錢不夠的那一筆她付、不扣（實扣 %d）' % (tag, share_act), share_act == 0, J([[e['amt'], e['label'], e['before'], e['after']] for e in mon]))
        R.check('[%s] 4b 第一次不夠：旁白「%s」一字不差' % (tag, NARR), bool(nar) and nar_t[0] == NARR, J(nar_t))
        R.check('[%s] 4c 第一次旁白後面接她一句（說話的是 %s）' % (tag, who), bool(after) and bool(after[0]) and after[0].get('k') == 'say' and after[0].get('cid') == who, J(after[:1]))
        drops = [e for e in ev if e['k'] == 'drop']
        if c.get('drop') is not None:
            k0 = next((k for k, e in enumerate(ev) if e['k'] == 'drop'), None)
            fare = [e for e in ev[k0 + 1:] if e['k'] == 'money'] if k0 is not None else []
            R.check('[%s] 0 前置：第一次旁白後錢設成 %d（【捷徑】）' % (tag, c['drop']), bool(drops), J(drops))
            R.check('[%s] 4d 第二次不夠（回程車資）：旁白再出現一次（共 %d 次）' % (tag, len(nar)), len(nar) >= 2 and all(t == NARR for t in nar_t), J(nar_t))
            R.check('[%s] 4e 第二次旁白後面沒有她那一句（只有旁白）' % tag, len(after) >= 2 and not (after[1] and after[1].get('k') == 'say' and after[1].get('cid') == who), J(after[1:2]))
            R.check('[%s] 4f 回程車資不夠也不扣（之後扣錢 %s）' % (tag, J([[e['amt'], e['label']] for e in fare])), not any(e['amt'] < 0 and e['after'] < 0 for e in fare) and sum(e['amt'] for e in fare) == 0, J([[e['amt'], e['label'], e['before'], e['after']] for e in fare]))
        else:
            R.check('[%s] 4d 這一趟只不夠一次：旁白 1 次、她那一句 1 次' % tag, len(nar) == 1, J(nar_t))
    return {'tag': tag, 'state': state, 'chosen': chosen, 'share': share, 'share_due': share_due, 'extra_due': extra_due, 'share_act': share_act, 'extra_act': extra_act, 'min_money': mn}


async def main():
    log('# AA_812 約會付錢 %s SHA=%s TAG=%s PARTS=%s SPOTS=%d ROOT=%s' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA, TAG, PARTS, SPOTS, ROOT))
    R.setup('網址 %s（%s）' % (URL, '加了 ?tapguard：和真的手機一樣擋選單剛出來那一下的誤觸' if 'tapguard' in URL else '沒加 ?tapguard（NOGUARD=1）'))
    specs, pin = load_specs()
    SPEC = static_checks(specs, pin)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        cdp_of[pg] = cdp
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        pg_dev = await pg.evaluate("(()=>({note:DATE.DEV_NOTE?[...DATE.DEV_NOTE]:[], strip:DATE.DEV_STRIP||{}, gate:typeof DATE.optOk==='function', ver:(document.getElementById('ver')||{}).textContent||''}))()")
        PAGE['DEV_NOTE'] = set(pg_dev.get('note') or []); PAGE['DEV_STRIP'] = pg_dev.get('strip') or {}; PAGE['optGate'] = bool(pg_dev.get('gate'))
        pg_p = await pg.evaluate(PAGE_PAYS_JS)
        page_checks(SPEC, pg_p)
        for part in PARTS:
            if part not in RUNS: log('  不認得的 PART：%s（ME、SHE、SPLIT、BROKE、BROKE2）' % part); continue
            try:
                r = await run_one(pg, cdp, errs, part, SPEC, pg_p)
                if r: rows.append(r)
            except Exception:
                import traceback
                R.check('[%s] 沒有丟出例外（探針）' % part, False, traceback.format_exc()[-900:])
                try: await R.shot(pg, part + '_exception')
                except Exception: pass
        await b.close()
    log('== 表（趟｜誰付（照規格）｜選項｜一份｜應扣＋請她｜實扣＋請她｜最低的錢）')
    for r in rows:
        log('  %-28s %-6s %-10s %5d %5d+%-4d %5d+%-4d %d' % (r['tag'], r['state'] or '祐廷', r['chosen'] or '-', r['share'], r['share_due'], r['extra_due'], r['share_act'], r['extra_act'], r['min_money']))
    sys.exit(R.finish())


asyncio.run(main())
