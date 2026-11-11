"""CC（帳號 A）11-11：X324（BB 規格）約會台詞覆蓋層版（AA_7xx～8xx 逐行改稿，c170218dd 整合）瀏覽器探針：以安 D01、芷若 D01 各約一次。判定歸 BB；Playwright 手機模擬（844×390 觸控）≠ iPhone。
BB 原文（轉述）：「以安、芷若各一次約會，用新遊戲資料裡 AA_7xx～8xx 覆蓋後的版本：畫面上每一句都要和遊戲資料逐句一樣（照順序）；沒有 {name}／undefined；
  每一次約會至少有一個可以選的對話選項；選了以後友情或愛情有變（記選之前、之後的關係數值）。」

覆蓋層在遊戲裡的位置（c170218dd 讀碼）：
  地點的格子（抵達、互動點、收尾）＝src/data/date_lines.js（tools/date/import_date_lines.py 產生；source 欄寫 D01.json@248c8e390＋AA_773_zr_date_common.json@e8a33995c＋AA_777_an_date_common.json@1f88da7cc＋AA_780＋AA_812……）
  不分地點的短句（答應、出發、差不多了）＝date_lines.js 的 lines.<她>＋date3d.js 寫死的 DATE.EXTRA_LINES（AA_773／AA_777／AA_780 換過字）
  源稿白名單＝受測樹 tests/date_src_sha.js 的 ALLOW_SHA（讀得到就也和源稿 Dxx.json 比；讀不到只比資料檔）
  選項的效果：date3d.js S.playSet → S.optFx → SOCIAL.applyFx（選項要有 fx＝{fr, love} 才有效果；沒寫＝沒有效果，DLG-FX-MECH-1110）
  互動點本身的喜好（S.LIKE：like＝npcRom+1、comf+1；normal＝comf+1）在互動點演完以後另外加——那不是「選項」的效果，另外記【觀察】。

怎麼跑（每一趟一樣；PARTS=AN,ZR）：
  【前置／捷徑】讀檔（GAME.applySave、quiet_events）：宿舍、2025 學年大一上的週六（DATE.check 過的第一天）13:18、晴天、錢 40000、flags 開場做完；
    她的聯絡方式；關係數值（SOCIAL.rel 直接設）＝第 5 階（約得到校外）、沒有交往；dateLog／dateMemory 清空＝第一次去 D01（first 格、選項都在 first 格）。
  約會本身全部走畫面：手機「朋友」→ 她的「約」→ 出去玩… → 類別 → 華山 → 今天 → 15:00 出發 → 就這樣約；手機「今天」的「跳過時間」跳到出發前 1 小時；
    提醒「現在出發」或「出發」→ 抵達 → 互動點選單（照順序點 展覽、草地、市集 三個）→ 每段的對話選項照 PICK（預設第 0 個，用選項的字點）→「差不多了，回去吧」→ 結算。
  手機「約」找不到才退回 INV.flow（【捷徑】，會印）。沒有走路（全程手機與選單），所以沒有 go_to。
  等待中每 30 秒記一次狀態（zone、時間、busy、busyDepth／busyWho、對話、選項按鈕、最後一句、行程狀態、最上層元素）＋截圖（前兩次）。
  遊戲內部選單（不經過 GAME.choose，#choices 有按鈕而 HOOK 沒抓到）：照按鈕文字選安全的那一個（起身、知道了、好、關閉），記一行「遊戲內部選單」。
記錄（只記不改）：GAME.say（說話人、原文、時間、當時的錢）、GAME.choose（選項、選了哪個、選的當下的關係數值）、SOCIAL.applyFx（fx、前、後）、SOCIAL.adjust（差值、是不是 applyFx 裡面叫的、前、後）、
  畫面上打完字的對話框（名字＋全文）、提示（#toast）、document.body.innerText。
判定（每項 PASS／FAIL）：
  1a 每一段（抵達、每個互動點、收尾）畫面上的句子＝照 date3d.js 選句規則（第一次去＝first 格；選項回話照實際選的那一個）算出來的那一格，逐句、照順序
  1b 整趟（地點那一行到結算那一行）GAME.say 的句子＝各段預期接起來（第三個點之後的「差不多了」短句照實際出現的位置插入，那一句要在不分地點的短句裡），逐句、照順序
  1c 整趟畫面上的對話框（玩家真的看到的字）＝同一串預期，逐句、照順序
  1d 她說的每一句、約會旁白都在 date_lines.js（D01 她的格子）裡一字不差；源稿讀得到時也在源稿裡
  1e 約會以外她說的（答應、出發、差不多了）都在不分地點的短句（lines.<她>／DATE.EXTRA_LINES）裡
  2  畫面上的對話框、全畫面文字沒有 {name}、undefined
  3  這一趟至少有一個可以選的對話選項（不算互動點選單、快速約會），而且真的選了
  4  選了以後友情或愛情有變：選項本身的效果（SOCIAL.applyFx 送出非 0 的差值）——至少一個對話選項有；每個選項的「選之前／選之後（下一個選單之前，含互動點喜好）」數值都印出來
  5  約會走完（行程 done、算一次）；沒有 JS 例外
另外印：資料檔裡 D01 這個人的選項有幾個寫了 fx（靜態，給 4 的判讀用）；整趟關係數值 前→後。
用法：LW_TESTS=<wt>/tests SHA=<40 碼> PARTS=AN,ZR [PICK=0] [SPOTS=3] python3 cc_x324_date_probe.py <url> <out>（URL 不加 ?turbo）"""
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
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or 'AN,ZR').split(',') if p.strip()]
PICK = int(os.environ.get('PICK') or 0)
SPOTS = max(1, min(3, int(os.environ.get('SPOTS') or 3)))
ROOT = os.path.abspath(os.path.join(LWT, '..'))
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('x324_date_' + TAG, OUT)
LOG = open(os.path.join(OUT, 'x324_lines.txt'), 'a', encoding='utf-8')
WHO_OF = {'AN': 'heroine_01', 'ZR': 'heroine_02'}
LOC = 'D01'
ORDER = ['D01.expo', 'D01.lawn', 'D01.market', 'D01.wall']   # 前三個都有選項（first 格）
STOPS = ('差不多了，回去吧', '就這樣回去', '今天先到這裡')
SYS_NARR = re.compile(r'^（(今天去了|這兩天去了|第二天早上。|晚上)|^約好了：|^今天 \d|^手機｜|^和.+去.+：')
DAY_KEYS = ['2025-09-27', '2025-10-04', '2025-10-18', '2025-10-25', '2025-11-22', '2025-11-29', '2025-12-06']   # 大一上的週六（避開中秋、颱風、期中考週）
REL5 = dict(fam=50, trust=30, comf=30, npcRom=40)   # 第 5 階（DATE.stageNum；cc_date_zq_probe.py 同一組，DATE_AN_D01 用過）
SAFE_BTN = ['起身', '知道了', '好', '關閉', '繼續']   # 遊戲內部選單（不經過 GAME.choose）照字選的安全選項
BAD_TXT = re.compile(r'\{name\}|undefined|\{sunset\}|\{lastDrink\}')


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


def fx_static(who):
    """資料檔 D01 這個人每一格的選項，寫了 fx 的有幾個（靜態）"""
    n = 0; nfx = 0; rows = []
    def walk(x, p):
        nonlocal n, nfx
        if isinstance(x, dict):
            if isinstance(x.get('choice'), list):
                for i, c in enumerate(x['choice']):
                    if isinstance(c, dict) and isinstance(c.get('t'), str):
                        n += 1
                        if c.get('fx'): nfx += 1; rows.append([p + '/choice/' + str(i), c.get('t'), c.get('fx')])
            for k2, v2 in x.items(): walk(v2, p + '/' + k2)
        elif isinstance(x, list):
            for i, v2 in enumerate(x): walk(v2, p + '/' + str(i))
    walk(zl(who), '')
    has_opts = [k for k in leaves(zl(who), '', {}).keys() if '/opts/' in k]
    return n, nfx, rows, len(has_opts)


# ---------- 頁面上的掛勾（只記不改）----------
HOOK = r"""(()=>{ if(!window.__XH){ window.__XH=1; window.__ZE=[]; const n=()=>window.__ZE.length;
  const relOf=id=>{ try{ if(!id||typeof SOCIAL==='undefined'||!SOCIAL.rel) return null; const r=SOCIAL.rel(id), f=v=>+(+v||0).toFixed(2); return {fam:f(r.fam),trust:f(r.trust),comf:f(r.comf),npcRom:f(r.npcRom)}; }catch(e){ return null; } };
  window.__relOf=relOf;
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__ZE.push({k:'say',i:n(),who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day,m:GAME.G.money|0}); window.__ccLastSay=String(t==null?'':t).slice(0,60); }catch(e){} return s0.apply(this,arguments); };
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


async def set_memory(pg, who, loc):
    """第一次去：dateLog 次數 0、這個地點 0 次、dateMemory 空的"""
    return await pg.evaluate("""(([id,loc])=>{ const G=GAME.G; DATE.rec(G); const L=DATE.log(G,id); L.count=0; L.byLoc[loc]=0; const m=DATE.mem(G,id,loc); m.picks=[]; m.last=[]; m.recent=[]; m.optN={};
      return {count:L.count, byLoc:L.byLoc[loc], mem:{picks:m.picks,last:m.last,recent:m.recent}, tier:DATE.tierOf(G,id)}; })""", [who, loc])


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


def rel_diff(a, b):
    if not a or not b: return None
    return {k: round((b.get(k) or 0) - (a.get(k) or 0), 2) for k in ('fam', 'trust', 'comf', 'npcRom') if round((b.get(k) or 0) - (a.get(k) or 0), 2)}


async def analyze(pg, tag, who, ctx, ev, screen, names, rel0, rel1):
    who_names = set(await pg.evaluate("(id=>[SOCIAL.displayName(id),(CHARACTERS[id]||{}).name].filter(Boolean))", who))
    locname = await pg.evaluate("(l=>DATE.loc(l).name)", LOC)
    Z = zl(who)
    IDX = text_index({'lines': Z, 'dislikeLine': ((DL['loc'][LOC].get('dislikeLine') or {}).get(who) or {})}, '/' + LOC)
    dr = draft_of(who); DIDX = None
    if dr is not None: DIDX = text_index({'lines': ((dr.get('lines') or {}).get(who) or {}), 'dislikeLine': ((dr.get('dislikeLine') or {}).get(who) or {})}, '/' + LOC)
    else: log('  （源稿讀不到＝只和遊戲資料檔 date_lines.js 比）')
    COMMON = common_lines(who) | set(PAGE.get('extra') or [])
    rev = {v: k for k, v in names.items()}
    def mine(e): return e.get('cid') == who or any((e.get('who') or '').startswith(n) for n in who_names if n)
    log('== %s 逐句（說話人｜遊戲時間｜原文）' % tag)
    for e in ev:
        k = e['k']
        if k == 'say': log('  %s｜第%s天 %05.2f｜%s' % (e['who'] or '（旁白）', e['d'], e['h'], e['t']))
        elif k == 'cap': log('  ［字幕］%s' % e['t'])
        elif k == 'money': log('  ［錢］%+d（%s）%d → %d' % (e['amt'], e['label'], e['before'], e['after']))
        elif k == 'ch': log('  ［選單］%s → %s｜選的當下 %s' % (J(e['opts']), e['opts'][e['pick']] if e.get('pick') is not None and e['pick'] < len(e['opts']) else e.get('pick'), J(e.get('rel'))))
        elif k == 'fx': log('  ［選項效果 applyFx］fx %s → 送出 %s｜%s → %s' % (J(e.get('fx')), J(e.get('ret')), J(e.get('rb')), J(e.get('ra'))))
        elif k == 'adj': log('  ［關係 adjust%s］%s｜%s → %s' % ('（applyFx 裡面）' if e.get('nested') else '', J(e.get('d')), J(e.get('rb')), J(e.get('ra'))))
        elif k == 'toast': log('  ［提示］%s' % e['t'])
    segs = segments(ev, locname)
    vis = dict(ctx); vis['picks'] = list(ctx['picks'])
    want_all = []; got_all = []; bad_data = []; bad_draft = []; dlg_choices = []; slot_rows = []
    for kind, arg, buf in segs:
        if kind in ('pre', 'settle'): continue
        says = [e for e in buf if e['k'] == 'say' and not SYS_NARR.search(e['t'])]
        chs = [e for e in buf if e['k'] == 'ch' and not (e['opts'] and e['opts'][0] == '自己選')]
        pid = rev.get(arg) if kind == 'spot' else None
        if kind == 'spot' and pid is None:
            log('  [%s] 互動點「%s」不在 names：跳過' % (tag, arg)); continue
        seg = 'spot' if kind == 'spot' else kind
        slot, S = expect(who, seg, pid, vis)
        ops = cell_opts(S, vis)
        pk = chs[0].get('pick') if chs else None
        want = set_lines(who, S, pk, vis)
        if (S or {}).get('opts') or (kind == 'spot' and ((Z.get('hotspots') or {}).get(pid) or {}).get('opts')):
            log('  [%s] 【觀察】%s 這一格有 opts（探針沒算進預期）' % (tag, kind))
        en = []
        if kind == 'spot':   # 第三個點之後她說一句「差不多了」（不分地點的短句）：照實際位置收進預期
            body = [e for e in says]
            tail = body[len(want):]
            en = [e for e in tail if e['t'] in COMMON and mine(e)]
            if en: log('  [%s] spot:%s 後面多一句 enough（不分地點的短句）：%s' % (tag, pid, J([e['t'] for e in en])))
        got = [e['t'] for e in says]
        want_seg = want + [e['t'] for e in en]
        nm = '%s%s' % (seg, (':' + pid) if pid else '')
        R.check('[%s] 1a %s＝%s 格，逐句照順序（%d 句）' % (tag, nm, slot, len(want_seg)), got == want_seg, J({'want': want_seg, 'got': got}))
        if ops or chs:
            R.check('[%s] %s 選項跳出來、字＝資料（%d 個）' % (tag, nm, len(ops)), bool(chs) and chs[0]['opts'] == [o for o, _ in ops], J({'want': [o for o, _ in ops], 'got': chs[0]['opts'] if chs else None}))
        for c in chs:
            if c.get('pick') is not None: dlg_choices.append({'seg': nm, 'opts': c['opts'], 'pick': c['pick'], 'i': c['i'], 'rel': c.get('rel')})
        want_all += want_seg; got_all += got
        slot_rows.append([nm, slot, got])
        if kind == 'spot' and pid not in vis['picks']: vis['picks'].append(pid)
        for e in says:
            if e in en: continue
            if not (mine(e) or (not e['who'] and e['t'].startswith('（'))): continue
            if e['t'] not in IDX: bad_data.append([nm, e['t']])
            elif DIDX is not None and e['t'] not in DIDX: bad_draft.append([nm, e['t']])
    R.check('[%s] 1b 整趟 GAME.say 的句子＝各段預期接起來，逐句照順序（%d 句）' % (tag, len(want_all)), bool(want_all) and got_all == want_all,
            J({'want': want_all, 'got': got_all}))
    # 1c 畫面上的對話框（玩家看到的字）：地點那一行之後、結算那一行之前
    a = next((i for i, x in enumerate(screen) if x[1] == '（' + locname + '。）'), None)
    b = next((i for i, x in enumerate(screen) if x[1].startswith('（今天去了')), None)
    scr = [x[1] for x in screen[a + 1:b]] if a is not None and b is not None else None
    if scr is not None: scr = [t for t in scr if not SYS_NARR.search(t)]
    R.check('[%s] 1c 畫面上的對話框（打完字的全文）＝同一串預期，逐句照順序（%s 句）' % (tag, len(scr) if scr is not None else '找不到地點那一行或結算那一行'),
            scr is not None and scr == want_all, J({'want': want_all, 'screen': scr, 'idx': [a, b]}))
    R.check('[%s] 1d %s 說的、約會旁白都在 date_lines.js（%s 的格子）裡一字不差' % (tag, who, LOC), not bad_data, J(bad_data))
    if DIDX is not None: R.check('[%s] 1d 也都在源稿 %s.json（白名單版）裡' % (tag, LOC), not bad_draft, J(bad_draft))
    other = [e['t'] for e in ev if e['k'] == 'say' and mine(e) and e['t'] not in IDX and e['t'] not in COMMON]
    R.check('[%s] 1e 約會以外她說的（答應、出發、差不多了）都在不分地點的短句（lines.%s／DATE.EXTRA_LINES）裡' % (tag, who), not other, J(other))
    alltxt = set(SEEN) | {x[1] for x in screen} | {e['t'] for e in ev if e['k'] in ('say', 'cap', 'toast')} | {o for e in ev if e['k'] == 'ch' for o in e['opts']}
    bad = sorted(t for t in alltxt if BAD_TXT.search(t))
    R.check('[%s] 2 畫面（對話框 %d 句、全畫面文字 %d 行）沒有 {name}、undefined' % (tag, len(screen), len(alltxt)), not bad, J(bad))
    R.check('[%s] 3 至少一個可以選的對話選項，而且選了（%d 個）' % (tag, len(dlg_choices)), len(dlg_choices) >= 1, J([[c['seg'], c['opts'], c['pick']] for c in dlg_choices]))
    # 4 選項的效果
    rows = []
    chi = [e for e in ev if e['k'] == 'ch']
    for c in dlg_choices:
        nxt = next((e['i'] for e in chi if e['i'] > c['i']), 10 ** 9)
        fxs = [e for e in ev if e['k'] == 'fx' and c['i'] < e['i'] < nxt]
        adj = [e for e in ev if e['k'] == 'adj' and not e.get('nested') and c['i'] < e['i'] < nxt]
        nx = next((e for e in chi if e['i'] > c['i']), None)
        after = (nx or {}).get('rel') or rel1
        fxd = [rel_diff(e.get('rb'), e.get('ra')) for e in fxs]
        rows.append({'seg': c['seg'], 'chose': c['opts'][c['pick']] if c['pick'] < len(c['opts']) else c['pick'], 'before': c.get('rel'), 'fx': [e.get('fx') for e in fxs], 'fx_diff': fxd,
                     'after_next_menu': after, 'diff_to_next_menu': rel_diff(c.get('rel'), after), 'other_adjust': [e.get('d') for e in adj]})
    for r in rows:
        log('  [%s] 選項「%s」（%s）：選之前 %s；選項效果 fx %s 差 %s；到下一個選單 %s（差 %s，其中互動點喜好等 adjust %s）' % (
            tag, r['chose'], r['seg'], J(r['before']), J(r['fx']), J(r['fx_diff']), J(r['after_next_menu']), J(r['diff_to_next_menu']), J(r['other_adjust'])))
    eff = [r for r in rows if any(d for d in r['fx_diff'])]
    R.check('[%s] 4 選了以後友情或愛情有變（選項本身的效果 SOCIAL.applyFx 送出非 0）：%d／%d 個選項有' % (tag, len(eff), len(rows)), bool(eff), J(rows))
    log('  [%s] 【觀察】整趟關係數值 %s → %s（差 %s；含互動點喜好 S.LIKE、選項效果）' % (tag, J(rel0), J(rel1), J(rel_diff(rel0, rel1))))
    return {'tag': tag, 'slots': slot_rows, 'choices': rows, 'n_lines': len(want_all)}


async def one(pg, cdp, errs, part):
    who = WHO_OF[part]; tag = '%s_%s_first' % (part, LOC)
    names = dict(DL['loc'][LOC]['points'])
    grp = await pg.evaluate("(l=>((DATE.GROUPS||[]).find(g=>g.ids.includes(l))||{}).t||'')", LOC)
    n, nfx, fxrows, nopts = fx_static(who)
    log('== %s（%s，%s，第一次去，一般第 5 階）' % (tag, who, LOC))
    log('  [靜態] date_lines.js %s %s：選項 %d 個，寫了 fx 的 %d 個 %s；opts 格 %d 個' % (LOC, who, n, nfx, J(fxrows), nopts))
    e0 = len(errs)
    await base(pg, who, 20, 10.0)
    ch = await choose_day(pg, who, LOC, 15, 'half')
    log('  選日子（DATE.check，只讀；每一天的原因）：%s' % J(ch['res']))
    if not ch['pick']: R.check('[%s] 前置：找得到能約的日子' % tag, False, J(ch['res'])); return None
    day = ch['pick']['d']; dkey = ch['pick']['k']
    rb = await base(pg, who, day, 13.3)
    R.setup('[%s] 讀檔（applySave、quiet_events）：宿舍、%s（第 %d 天）13:18、晴天、錢 40000、開場做完；聯絡方式 G.contacts.%s；關係 %s → 第 %s 階；沒有交往；canAsk %s' % (
        tag, dkey, day, who, J(rb['r']), rb['stage'], J(rb.get('can'))))
    mem = await set_memory(pg, who, LOC)
    R.setup('[%s] 約會紀錄清空＝第一次去 %s：%s' % (tag, LOC, J(mem)))
    R.check('[%s] 前置：第 5 階、沒交往、canAsk 過' % tag, rb['stage'] == 5 and not rb['dating'] and bool((rb.get('can') or {}).get('ok')), J(rb))
    SEEN.clear()
    await pg.evaluate("(w=>{ window.__XW=w; })", who)
    await pg.evaluate(HOOK)
    rel0 = await pg.evaluate("(w=>window.__relOf(w))", who)
    ctx = {'visits': 0, 'dating': False, 'stage': 5, 'tier': mem['tier'], 'picks': [], 'last': [], 'recent': []}
    screen = []
    how, steps, trip = await book(pg, cdp, who, LOC, grp, 15, screen, tag)
    R.check('[%s] 預約（%s）：%s；行程 booked、今天 15:00 出發' % (tag, how, J(steps)),
            bool(trip and trip.get('status') == 'booked' and trip.get('locs') == [LOC] and abs(trip.get('depart', 0) - 15) < 1e-6 and trip.get('day') == day), J(trip))
    if not (trip and trip.get('status') == 'booked'):
        await R.shot(pg, tag + '_book_fail'); return None
    said, skipped = await depart(pg, cdp, 15, screen, tag)
    R.check('[%s] 出發（%s）' % (tag, said), said is not None, J(skipped))
    if said is None: await R.shot(pg, tag + '_depart_fail'); return None
    picked, path = await play(pg, cdp, names, ORDER, SPOTS, {}, screen, tag)
    s = await st(pg)
    ev = await pg.evaluate("window.__ZE||[]")
    trip = await pg.evaluate("(id=>(GAME.G.trips||[]).find(t=>t.trip===id)||null)", s['trip']['id'] if s['trip'] else '')
    lg = await pg.evaluate("(id=>DATE.log(GAME.G,id))", who)
    rel1 = await pg.evaluate("(w=>window.__relOf(w))", who)
    R.note('[%s] 走的路：預約 %s；出發 %s（跳過時間 %s）；約會 %s' % (tag, how, said, J([x.get('tap') for x in skipped]), J(path)))
    R.check('[%s] 5 約會走完：行程 done、算一次（次數 %s）、點了 %s' % (tag, lg.get('count'), J(picked)),
            bool(trip and trip.get('status') == 'done' and trip.get('counted')) and len(picked) == SPOTS, J({'trip': trip and {k: trip.get(k) for k in ('status', 'counted', 'spots')}}))
    await R.shot(pg, tag + '_end')
    row = await analyze(pg, tag, who, ctx, ev, screen, names, rel0, rel1)
    R.check('[%s] 5 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))
    json.dump({'tag': tag, 'row': row, 'ev': ev, 'screen': screen, 'trip': trip, 'log': lg, 'steps': steps, 'skipped': skipped, 'path': path},
              open(os.path.join(OUT, 'x324_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return row


async def main():
    log('# X324 約會台詞 %s SHA=%s TAG=%s PARTS=%s PICK=%d SPOTS=%d ROOT=%s' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA, TAG, PARTS, PICK, SPOTS, ROOT))
    R.setup('網址 %s（%s）' % (URL, '加了 ?tapguard：和真的手機一樣擋選單剛出來那一下的誤觸' if 'tapguard' in URL else '沒加 ?tapguard（NOGUARD=1）'))
    src = (DL.get('source') or '')
    log('  date_lines.js source（覆蓋層版本）：%s' % ' ＋ '.join(x for x in src.split('＋') if re.search(r'AA_7|AA_8|D01\.json', x)))
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        cdp_of[pg] = cdp
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        pg_dev = await pg.evaluate("(()=>({note:DATE.DEV_NOTE?[...DATE.DEV_NOTE]:[], strip:DATE.DEV_STRIP||{}, gate:typeof DATE.optOk==='function', ver:(document.getElementById('ver')||{}).textContent||''}))()")
        PAGE['DEV_NOTE'] = set(pg_dev.get('note') or []); PAGE['DEV_STRIP'] = pg_dev.get('strip') or {}; PAGE['optGate'] = bool(pg_dev.get('gate'))
        log('  頁面：DEV_NOTE／DEV_STRIP／optOk／版本字樣 %s' % J(pg_dev))
        for part in PARTS:
            if part not in WHO_OF: log('  不認得的 PART：%s（只有 AN、ZR）' % part); continue
            who = WHO_OF[part]
            ex = await pg.evaluate("(id=>(DATE.EXTRA_LINES||{})[id]||null)", who)
            PAGE['extra'] = [x for v in (ex or {}).values() for x in (v if isinstance(v, list) else [v]) if isinstance(x, str)]
            if not zl(who): log('  %s 在 %s 沒有台詞：跳過' % (who, LOC)); continue
            try:
                r = await one(pg, cdp, errs, part)
                if r: rows.append(r)
            except Exception:
                import traceback
                R.check('[%s] 沒有丟出例外（探針）' % part, False, traceback.format_exc()[-900:])
                try: await R.shot(pg, part + '_exception')
                except Exception: pass
        await b.close()
    log('== 表')
    for r in rows:
        log('  %s：%d 句；選項 %d 個（有效果的 %d）' % (r['tag'], r['n_lines'], len(r['choices']), sum(1 for c in r['choices'] if any(d for d in c['fx_diff']))))
        for x in r['slots']: log('      %-18s %-7s %s' % (x[0], x[1], ' ／ '.join(x[2])))
    sys.exit(R.finish())


asyncio.run(main())
