"""CC（帳號 A）11-12：CHOOSE 動態探針（BB 04:15 派、04:36 規格更新）——CC_CHOOSE_SCAN.md 第 5 節那十個選單，一個選單一個 PART。
規格（BB 04:36）：新版 73faa493f（game3d.js 新防連點：選單出現 350 ms 內按下的不算；另外「選單出現以前就開始的那一串連點」（每兩下 <400 ms）整串都不算，
  最多擋 4000 ms——TAP_GUARD／TAP_BURST_GAP／TAP_BURST_MAX）；舊版對照 779ddd650（線上，沒有防連點）。網址一律加 ?tapguard（自動化瀏覽器預設不擋）。
  73faa493f 的改法：下課選單「下一堂不去」→ 確認改成〔翹／還是去〕（最下面＝還是去；classes3d.js skipClass flip）；起床進來的確認照舊〔還是去／翹〕；
  打工櫃台非上班時間「找老闆」→〔（算了）／（辭職）〕（jobs3d.js:399，沒有確認）；床「快轉→過一週」、腳踏車「買這台→顏色」、約會「改時間→算了，今天不去了」沒改順序、只靠通用那條擋。
每個 PART 做三件事：
  1. 量位置（ORIENTS：直向 390×844、橫向 844×390 各量一次）：正常速度叫出第一層選單（L1），記第一項、倒數第 1、倒數第 2 項的框，互動鍵 #interact（叫出選單以前量）、
     留著的上一句對話框；選單接選單的，照文字選「上一層被點的那一項」叫出下一層（L2，起床鏈再到 L3），同樣記。重疊（點的位置那一項 vs 下一層每一項、互動鍵 vs 選單每一項、
     對話框 vs 選單每一項）有就標★、記重疊面積（px²）。量完不收尾，下一輪重讀檔。
  2. 連點（RUNS，見下）：每一輪都從同一份存檔讀起【前置／捷徑】，CDP 觸控（Input.dispatchTouchEvent，playlib.touch_tap）按在同一點；
     每一下記：落在哪個選單的哪一項（文字）或沒落在任何一項、離選單出現幾 ms、屬於第幾串（兩下間隔 <400 ms＝同一串）。
     前後比對不可逆的變化：錢、G.day／hour／zone、旗標、關係（G.social）、打工（G.jobs）、腳踏車（BIKE.state）、約會（G.trips）、出遊（G.outings）、邀約（G.invites）、CLS note／done。
  3. 會真的花錢、跳一週、辭職、告白的，每一輪都從同一份存檔讀起，log 標【前置／捷徑】（R.setup）。
判定（只有兩種用 R.check，其他都是 R.note，BB 判）：
  A. 新版（遊戲有 GAME.TAP_BURST_GAP）150 ms 節奏：被選到的選項，不能是「選單出現 350 ms 內按下的」，也不能是「選單出現以前就開始的那一串、離選單出現 <4000 ms」。
     舊版（779ddd650，或遊戲沒有 TAP_BURST_GAP）同一條只 R.note「D34 舊版對照」。
  B. 新版起床鏈（WAKE）：連點完 CLS note 不能有 plan_skip_<那一堂>。
  記錄（R.note）：保險到期（同一串、離選單出現 ≥4000 ms）還被點掉的、500 ms 節奏一路點下去的，點掉的是不可逆那一項就標★。
PARTS（逗號分隔；預設全部）：
  WAKE     起床選單（classes3d.js wakeMenu）→ 翹課確認 → 再睡一下。前置：最小存檔（cc_goclass_probe.mkstate）第 56 天 23:00 宿舍 → 真的上床「睡到明天早上」→ 第 57 天醒來。
           點的位置：L1「翹這堂課」中心。dlg＝「早安。今天的課…」那一句出現就開始點；menu＝起床選單出現才開始。
  AFTER    下課選單（classes3d.js afterMenu）「下一堂不去」（最下面）→ 翹課確認（新版〔翹／還是去〕）。【捷徑】同一天、第一堂下課後 0.02 時在那間教室的區域，void CLS.afterMenu(GAME,第一堂的 key)
           （遊戲本來是課後事件演完、站起來以後由 S.oneTick 叫）。點的位置：L1「下一堂不去」中心。
  JOB      打工櫃台（jobs3d.js:399）。【捷徑】G.jobs.cafe＝已經在做（班表是別的星期、已上過 3 班）、15:00 在兩點半 Café、站到「找＜老闆＞」那一格旁邊。
           點的位置：互動鍵（連按 2、3、20 下；150、500 ms）；另外 500 ms 從選單出現起點在「（辭職）」的位置（＠L1:（辭職））。
  BEDFF    床（story3d.js bedScene）→「快轉」→ 學期快轉〔到下一個有事的時候／過一週／不用了〕。前置：第 57 天 15:00 宿舍、站到床邊。點的位置：L1「快轉」中心。
           interact＝第一下按互動鍵、之後點「快轉」的位置。
           0792dac30 起（BUG-BEDFF-DOUBLETAP-1111）：選「過一週／到下一個有事的時候」以後先一句說明（SEMFF.confirmText：「快轉：…，最多到…，中間有事會先停。」
           ＋「沒有劇情的課會自動去上。」或「現在正在上的○○會記成沒去。」），再〔算了／快轉〕。量位置多一層（說明全文、確認每一項的框、和「過一週」重不重疊）；
           連點三種節奏（150×20、150×40、500×8）跑完都檢查：天數沒變、CLS note 沒有多出 skip_*／plan_skip_*——遊戲有 SEMFF.confirmText＝R.check，沒有（73faa493f）＝R.note。
  BEDFFC   （BB 05:06）一步一步照字選：床 →「快轉」→「過一週」（或「到下一個有事的時候」）→ 確認的「快轉」；前置第 57 天 BEDFFC_H（預設 9.5＝第一堂正在上）宿舍房間，每一個都從同一份存檔讀起。
           判定（有 SEMFF.confirmText＝R.check，沒有＝R.note）：說明裡「現在正在上的○○會記成沒去」的課都被記成沒去（note 多出 skip_／plan_skip_），說明沒寫的課沒有被記成沒去。
           cancel：〔算了〕以後記區域、位置、互動鍵的字，再按一次互動鍵出不出選單。BEDFFC_CASES（預設 week,next,cancel）。
  BIKE     慢輪單車：展示車「看這台車」→ 老闆介紹 →〔買這台 N 元／再看看〕→ 顏色（選了就扣款）。前置：第 57 天 14:00 在 bikeshop、站到第一台展示車旁邊、錢 30000。點的位置：L1「買這台」中心。
  DATE     約會出發時間到（date3d.js prompt）〔出發／改時間／今天不去了〕→「改時間」→〔晚一個小時／改到明天同一個時間／算了，今天不去了／選別的日期和時間〕。
           【捷徑】DATE.book（沈以安、D01、10:00 出發，找得到的第一天）→ 讀檔到出發時間後 0.02 時（宿舍）→ 等遊戲自己跳（40 秒沒跳才 void DATE.prompt）。點的位置：L1「改時間」中心。
  CONFESS  告白〔（告訴她）／（今天先不說）〕（confess723_3d.js retryOffer，經 DATE.confessOffer）。【捷徑】G.flags.CONF_FAIL.heroine_01＝失敗過、過了 20 天、約會次數夠 → 她先說 ready 那幾句 → 選單。
           點的位置：L1 倒數第 2 項（＝（告訴她））。告白會真的發生（第二次一定成功）。
  DECIDE   小心選擇 → 確認〔確定／再想想〕（decide3d.js）。【捷徑】合成的三個 key 選項（文字是「（探針）…」，前面一句「（探針）她問了一句。」），只測選單機制、不動劇情。點的位置：L1 倒數第 2 項。
  AUTOPOP  約好時間到「直接過去」（invites3d.js goPrompt，{menu}，自動跳出）。讀檔（宿舍 15:30）以後【捷徑】INV.accept（沈以安、2:30 AM、15:50）→ 遊戲自己跳。
           pre＝先在「直接過去」的位置點 2 下（點地＝走路）再加約，繼續點；menu＝選單出現才開始點。
  GYM      體育館 B1「去健身房」→ 第一次辦卡 →〔「單次。」50／「這個月的月票。」200〕（兩項都花錢，沒有取消）。前置：第 57 天 15:00 gym_b1、站到「去健身房」旁邊。點的位置：L1 倒數第 2 項（單次）。
  （classes3d.js:1308 開學第二天、closed2_3d.js:42 國際處交志願表這一版沒做——條件太長；GYM 是第 10 個的備案。）
RUNS：每一輪寫「節奏ms:下數:開始方式[@點]」，用 / 隔開（佇列的 ENV 用分號分欄，不能用分號）；開始方式 menu（L1 出現才開始）、dlg（L1 前面那一句出現就開始）、interact（第一下按互動鍵）、pre（先點 2 下再叫出選單，AUTOPOP）。
  不給＝照 PART 的預設（DEFRUNS）。150 ms 預設 20 下（N150）、另一輪 40 下（NLONG，超過 4 秒看保險到期）；500 ms 預設 8 下（N500）。
環境變數：LW_TESTS SHA PARTS ORIENTS（量位置的方向，預設 P,L）MASHO（連點的方向，預設 P；BEDFFC 也照這個）RUNS N150 N500 NLONG EVQUIET SETTLE（連點完等幾 ms 再比對，預設 2500）
  BEDFFC_CASES BEDFFC_H
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=BEDFF python3 cc_choose_probe.py <url> <out>
雲端 SwiftShader 只做自檢；Windows＋GPU（PC runner）≠ iPhone。不用 ?turbo、不瞬移玩家去做事（站到互動點旁邊＝【前置】）。"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import bbplay as P
import cc_goclass_probe as GC
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
ENV = os.environ.get
SHA = ENV('SHA') or ''
ALLP = ['WAKE', 'AFTER', 'JOB', 'BEDFF', 'BIKE', 'DATE', 'CONFESS', 'DECIDE', 'AUTOPOP', 'GYM', 'BEDFFC']
BEDFFC_CASES = [c.strip() for c in (ENV('BEDFFC_CASES') or 'week,next,cancel').split(',') if c.strip()]
BEDFFC_H = float(ENV('BEDFFC_H') or 9.5)
PARTS = [p.strip().upper() for p in (ENV('PARTS') or ','.join(ALLP)).split(',') if p.strip()]
ORIENTS = [o.strip().upper() for o in (ENV('ORIENTS') or 'P,L').split(',') if o.strip()]
MASHO = [o.strip().upper() for o in (ENV('MASHO') or 'P').split(',') if o.strip()]
N150, N500, NLONG = int(ENV('N150') or 20), int(ENV('N500') or 8), int(ENV('NLONG') or 40)
SETTLE = int(ENV('SETTLE') or 2500)
R = L.Run('choose', OUT)
GC.R, GC.OUT, GC.SHA = R, OUT, SHA[:9]
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
SUMMARY = {}
UNREACHED = []

DEFRUNS = {
    'WAKE': '150:%(n)d:dlg;500:%(m)d:dlg;150:%(n)d:menu;500:%(m)d:menu;150:%(l)d:dlg',
    'AFTER': '150:%(n)d:menu;500:%(m)d:menu;150:%(l)d:menu',
    'JOB': '150:2:interact;150:3:interact;500:2:interact;500:3:interact;150:%(n)d:interact;500:%(m)d:menu@L1:（辭職）',
    'BEDFF': '150:%(n)d:menu;500:%(m)d:menu;150:%(l)d:menu;150:%(n)d:interact;500:%(m)d:interact',
    'BIKE': '150:%(n)d:menu;500:%(m)d:menu;150:%(l)d:menu;150:%(n)d:dlg;500:%(m)d:dlg',
    'DATE': '150:%(n)d:menu;500:%(m)d:menu;150:%(l)d:menu;150:%(n)d:dlg;500:%(m)d:dlg',
    'CONFESS': '150:%(n)d:dlg;500:%(m)d:dlg;150:%(n)d:menu;500:%(m)d:menu',
    'DECIDE': '150:%(n)d:menu;500:%(m)d:menu;150:%(n)d:dlg',
    'AUTOPOP': '150:%(n)d:pre;500:%(m)d:pre;150:%(n)d:menu',
    'GYM': '150:%(n)d:interact;500:%(m)d:interact;150:%(n)d:menu;500:%(m)d:menu',
}

# ---------- 頁面裡的小工具 ----------
SNAP = r"""(()=>{ const G=GAME.G; const c=o=>{ try{ return JSON.parse(JSON.stringify(o===undefined?null:o)); }catch(e){ return 'ERR'; } };
  let bike=null; try{ bike=typeof BIKE!=='undefined'&&BIKE.state?c(BIKE.state(G)):null; }catch(e){}
  let cr=null; try{ const R=CLS.rec(G); cr={note:c(R.note),done:c(R.done)}; }catch(e){}
  return {money:G.money, day:G.day, hour:+(+G.hour).toFixed(3), zone:G.zone, flags:c(G.flags), social:c(G.social), jobs:c(G.jobs), bike,
    trips:c(G.trips||[]), outings:c((G.outings||[]).map(q=>({id:q.id,state:q.state,day:q.day,h:q.h}))), invites:c((G.invites||[]).map(q=>({id:q.id,state:q.state,day:q.day,h:q.h}))), cls:cr}; })()"""
IRECT = r"""(()=>{ const e=document.getElementById('interact'); if(!e||e.classList.contains('hide')||getComputedStyle(e).display==='none') return null; const r=e.getBoundingClientRect(); if(!r.width) return null;
  return {r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],t:(e.textContent||'').trim().slice(0,30)}; })()"""
FIND_IT = r"""(k=>{ const L=(GAME.E.interactables||[]).filter(i=>{ try{ return !i.hidden; }catch(e){ return true; } });
  const f={bed:i=>i.sleep, job:i=>i.wzJob, bike:i=>i.bikeLook, gym:i=>{ try{ return String(i.label||'').startsWith('去健身房'); }catch(e){ return false; } }}[k];
  const it=L.find(f); if(!it) return null; let lab=''; try{ lab=String(it.label||''); }catch(e){} return {x:it.x,z:it.z,lv:it.lv|0,r:it.radius||1,label:lab}; })"""
PLACE = r"""(([x,z,lv,rad])=>{ const E=GAME.E, P=E.player; for(const R2 of [Math.min(0.6,rad*0.6),rad*0.8,0.45,1.0]){ for(let i=0;i<16;i++){ const a=i*Math.PI/8, px=x+Math.sin(a)*R2, pz=z+Math.cos(a)*R2;
    if(E.canStand&&!E.canStand(px,pz,0.3,lv)) continue; E.placeAt(P,px,pz,lv); P.path=null; P.obj.rotation.y=Math.atan2(x-px,z-pz); return {x:+px.toFixed(2),z:+pz.toFixed(2),R:R2}; } } return null; })"""
GUARDV = "(()=>({TAP_GUARD:GAME.TAP_GUARD==null?null:GAME.TAP_GUARD,TAP_BURST_GAP:GAME.TAP_BURST_GAP==null?null:GAME.TAP_BURST_GAP,TAP_BURST_MAX:GAME.TAP_BURST_MAX==null?null:GAME.TAP_BURST_MAX,tapTooSoon:typeof GAME.tapTooSoon==='function',webdriver:!!navigator.webdriver,q:location.search}))()"
NOW = "performance.now()"


def guard_url(u):
    return u if 'tapguard' in u else u + ('&' if '?' in u else '?') + 'tapguard'


def area(a, b):
    if not a or not b: return 0
    w = min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0]); h = min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1])
    return w * h if w > 0 and h > 0 else 0


def ctr(r):
    return [r[0] + r[2] / 2.0, r[1] + r[3] / 2.0]


def ddiff(a, b, path='', out=None, lim=80):
    out = [] if out is None else out
    if len(out) >= lim: return out
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b), key=str):
            ddiff(a.get(k), b.get(k), path + '.' + str(k) if path else str(k), out, lim)
    elif isinstance(a, list) and isinstance(b, list) and len(a) == len(b) and len(a) < 200:
        for i, (x, y) in enumerate(zip(a, b)): ddiff(x, y, '%s[%d]' % (path, i), out, lim)
    elif a != b:
        s = lambda v: (json.dumps(v, ensure_ascii=False, default=str)[:120]) if not isinstance(v, (int, float, str, type(None), bool)) else v
        out.append([path, s(a), s(b)])
    return out


def new_skips(before, after):
    """CLS note 多出來的 skip_<key>／plan_skip_<key>（skipn_ 這種次數不算）"""
    a = ((before.get('cls') or {}).get('note') or {}); b = ((after.get('cls') or {}).get('note') or {})
    return sorted(k for k in b if k not in a and re.match(r'^(plan_)?skip_\d+:', k))


def startswith_any(t, ps):
    return any((t or '').startswith(p) for p in ps)


# ---------- 玩家操作 ----------
async def snap(pg):
    return await pg.evaluate(SNAP)


async def fresh(pg, tag):
    """每一輪重開頁面再讀檔：上一輪連點觸發的快轉、自動走去上課這些非同步劇情，只重讀存檔停不下來（自檢 r1 的快轉在 r2 讀檔以後還在跑，把人帶到 dorm_hall）"""
    await pg.reload()
    ok = await L.wait_loaded(pg)
    await pg.evaluate("localStorage.clear()"); await GC.hook(pg)
    if not ok: R.note('%s：重開頁面沒載入' % tag)
    return ok


async def menu_now(pg):
    """畫面上的選單（文字、框）；沒有＝[]"""
    return await pg.evaluate(GC.RECTS)


async def adv_until(pg, cdp, sig, tag, max_s=60, other='last', stop_other=False):
    """正常速度：對話出現 500 ms 後點對話框；選單 sig(文字串列) 成立就回傳那個選單；別的選單照 other 選（記下來）；stop_other＝出現別的選單就不選、回傳 None"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await GC.ms(pg)
        if s['ch']:
            await pg.wait_for_timeout(450); m = await menu_now(pg); txt = [b['t'] for b in m]
            if not txt: continue
            if sig(txt): return m
            if stop_other: R.note('%s：出現的是別的選單 %s（不選，停）' % (tag, J(txt))); return None
            R.note('%s：途中別的選單 %s → 選最後一個' % (tag, J(txt))); await P.tap_choice(pg, cdp, len(txt) - 1); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1)
        await pg.wait_for_timeout(200)
    R.note('%s：%d 秒內沒等到要的選單（畫面 %s）' % (tag, max_s, J(await GC.ms(pg)))); return None


async def wait_dlg_or_menu(pg, max_s=40):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await GC.ms(pg)
        if s['dlg'] or s['ch']: return s
        await pg.wait_for_timeout(100)
    return None


async def pick_text(pg, cdp, prefix):
    m = await menu_now(pg)
    for k, b in enumerate(m):
        if b['t'].startswith(prefix): await P.tap_choice(pg, cdp, k); return b['t']
    return None


async def place_at(pg, cdp, kind, label_ok, tag):
    it = await pg.evaluate(FIND_IT, kind)
    if not it: R.note('%s：這一區找不到互動點（%s）' % (tag, kind)); return None
    p = await pg.evaluate(PLACE, [it['x'], it['z'], it['lv'], it['r']])
    R.setup('%s：站到互動點「%s」旁邊 %s' % (tag, it['label'], J(p)))
    for _ in range(12):
        await pg.wait_for_timeout(500); ir = await pg.evaluate(IRECT)
        if ir and label_ok(ir['t']): return ir
    ir = await pg.evaluate(IRECT)
    R.note('%s：互動鍵不是要的（%s），試著走過去' % (tag, J(ir)))
    try: await L.go_to(pg, cdp, R, it['x'], it['z'], 0.6, it['label'], max_s=90, lv=it['lv'])
    except Exception as e: R.note('%s：走過去失敗 %r' % (tag, e))
    await pg.wait_for_timeout(800); ir = await pg.evaluate(IRECT)
    return ir if ir and label_ok(ir['t']) else None


# ---------- 各 PART 的前置與觸發 ----------
class Part:
    name = ''; trig = 'call'; L1 = None; chain = []; point = 'L1:-2'; irr = (); dlgfirst = False

    async def prep(self, pg, cdp):
        """建一份存檔（回傳 dict）；同一頁之後每一輪都讀這一份"""
        raise NotImplementedError

    async def load(self, pg, cdp, tag):
        await GC.load(pg, cdp, self.st, '%s：讀同一份存檔（%s）' % (tag, self.desc))
        return await self.after_load(pg, cdp, tag)

    async def after_load(self, pg, cdp, tag):
        return True

    async def fire(self, pg, cdp, tag):
        """叫出 L1（不含互動鍵：interact 類由呼叫的人按）"""
        return True

    def is_irr(self, menu, txt):
        return startswith_any(txt, self.irr)


class Wake(Part):
    name = 'WAKE'; trig = 'wake'; L1 = staticmethod(lambda t: bool(t) and t[0].startswith('直接去'))
    chain = [('翹這堂課', lambda t: '翹' in t and '還是去' in t), ('翹', lambda t: any(x.startswith('再睡一下') for x in t))]
    point = 'L1:翹這堂課'; irr = ('翹', '再睡一下', '直接去上課'); desc = '第 56 天 23:00 宿舍 → 真的睡到第 57 天'

    async def prep(self, pg, cdp):
        self.T = await GC.target_day(pg); self.st = None; return True

    async def load(self, pg, cdp, tag):
        w = await GC.sleep_wake(pg, cdp, tag)
        if not w: return False
        return await GC.wait_wake_say(pg, cdp, tag)


class After(Part):
    name = 'AFTER'; L1 = staticmethod(lambda t: any(x.startswith('下一堂不去') for x in t))
    chain = [('下一堂不去', lambda t: '翹' in t and '還是去' in t)]; point = 'L1:下一堂不去'; irr = ('翹', '直接去下一堂', '先去吃飯', '在附近讀書')

    async def prep(self, pg, cdp):
        self.T = await GC.target_day(pg); c = self.T['crim']; d = self.T['day']
        self.key = c['key']; z = c.get('zone') or 'linze'
        self.st = GC.mkstate(d, round(c['t1'] + 0.02, 3), z); self.desc = '%s（第 %d 天）%.2f 時 %s，第一堂 %s 剛下課' % (d['key'], d['d'], c['t1'] + 0.02, z, c['name'])
        return True

    async def fire(self, pg, cdp, tag):
        R.setup('%s：【捷徑】void CLS.afterMenu(GAME,%s)（遊戲本來是課後事件演完、站起來以後由 S.oneTick 叫）' % (tag, self.key))
        await pg.evaluate("k=>{ void CLS.afterMenu(GAME,k); }", self.key); return True


class Job(Part):
    name = 'JOB'; trig = 'interact'; L1 = staticmethod(lambda t: any('辭職' in x for x in t)); chain = []; point = 'interact'; irr = ('（辭職）',)

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; wd = d['wd']; other = 1 if wd != 1 else 2
        job = {'since': d['d'] - 20, 'from': (d['d'] - 20) * 24, 'day': [other], 'shifts': 3, 'skill': 1, 'missedRun': 0, 'quit': None, 'gone': None, 'missPend': False, 'missN': 0,
               'worked': [], 'chk': d['d'] - 1, 'wk': {}, 'brk': {}, 'ot': {}, 'back': False, 'away': False}
        self.st = GC.mkstate(d, 15.0, 'cafe'); self.st['jobs'] = {'cafe': job, '_meta': {'n': {}, 'asked': {}}}
        self.desc = '%s 15:00 兩點半 Café；G.jobs.cafe 已經在做（班表星期 %d，今天星期 %d）【捷徑】' % (d['key'], other, wd); return True

    async def after_load(self, pg, cdp, tag):
        self.ir = await place_at(pg, cdp, 'job', lambda t: t.startswith('找') or '辭職' in t, tag)
        return bool(self.ir)


class BedFF(Part):
    name = 'BEDFF'; trig = 'interact'; L1 = staticmethod(lambda t: any(x.startswith('快轉') for x in t))
    chain = [('快轉', lambda t: any(x.startswith(('過一週', '到下一個', '過三天')) for x in t)),
             ('過一週', lambda t: '算了' in t and '快轉' in t, True)]   # 0792dac30 起：說明一句＋〔算了／快轉〕（73faa493f 沒有）
    point = 'L1:快轉'
    irr = ('過一週', '過三天', '到下一個', '睡', '小睡', '趴著睡', '再睡')

    def is_irr(self, menu, txt):
        if menu and '算了' in menu: return txt == '快轉'   # 確認選單的「快轉」＝真的跳
        if txt == '快轉': return False                      # 床的選單的「快轉」只是叫出快轉選單
        return startswith_any(txt, self.irr)

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; self.st = GC.mkstate(d, 15.0, 'dorm'); self.desc = '%s 15:00 宿舍房間' % d['key']; return True

    async def after_load(self, pg, cdp, tag):
        self.ir = await place_at(pg, cdp, 'bed', lambda t: t.startswith('睡'), tag); return bool(self.ir)


class Bike(Part):
    name = 'BIKE'; trig = 'interact'; L1 = staticmethod(lambda t: any(x.startswith('買這台') for x in t))
    chain = [('買這台', lambda t: bool(t) and t[-1].startswith('再看看') and not any(x.startswith('買這台') for x in t))]; point = 'L1:買這台'

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; self.st = GC.mkstate(d, 14.0, 'bikeshop'); self.desc = '%s 14:00 慢輪單車店裡、錢 30000' % d['key']; return True

    async def after_load(self, pg, cdp, tag):
        self.ir = await place_at(pg, cdp, 'bike', lambda t: t.startswith('看這台車'), tag); return bool(self.ir)

    def is_irr(self, menu, txt):   # 顏色選單：除了「再看看」都是付款
        if txt and txt.startswith('買這台'): return False
        return bool(menu) and (menu[-1] or '').startswith('再看看') and not (txt or '').startswith('再看看') and not any((m or '').startswith('買這台') for m in menu)


DATE_BOOK = r"""(d0=>{ for(let d=d0; d<d0+14; d++){ let r=null; try{ r=DATE.book(GAME.G,{who:'heroine_01',day:d,depart:10,locs:['D01']}); }catch(e){ r={ok:false,why:String(e)}; }
    if(r&&r.ok!==false){ const t=(GAME.G.trips||[]).slice(-1)[0]; return {ok:true,day:d,trip:t,q:'date_'+t.trip}; } if(d===d0+13) return {ok:false,r}; } return {ok:false}; })"""


class Date(Part):
    name = 'DATE'; L1 = staticmethod(lambda t: any(x.startswith('改時間') for x in t))
    chain = [('改時間', lambda t: any(x.startswith(('晚一個小時', '改到明天')) for x in t))]; point = 'L1:改時間'
    irr = ('出發', '今天不去了', '算了，今天不去了', '晚一個小時', '改到明天')

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']
        await GC.load(pg, cdp, GC.mkstate(d, 8.0, 'dorm'), 'DATE 建存檔：%s 08:00 宿舍' % d['key'])
        bk = await pg.evaluate(DATE_BOOK, d['d'])
        R.setup('DATE：【捷徑】DATE.book（沈以安、D01、10:00 出發）→ %s' % J(bk))
        if not bk.get('ok'): return False
        st = await P.snapshot(pg); t = bk['trip']; st['day'] = bk['day']
        st['weekday'] = await pg.evaluate("d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; }", bk['day'])
        st['hour'] = round(float(t['depart']) + 0.02, 3); st['zone'] = 'dorm'; st['pos'] = None
        self.st = st; self.q = bk['q']; self.desc = '第 %d 天 %.2f 時宿舍，約會 %s 出發時間剛到【捷徑】' % (bk['day'], st['hour'], bk['q']); return True

    async def fire(self, pg, cdp, tag):
        t0 = time.time()
        while time.time() - t0 < 40:
            s = await GC.ms(pg)
            if s['dlg'] or s['ch']: R.note('%s：遊戲自己跳了（%.1f 秒）' % (tag, time.time() - t0)); return True
            await pg.wait_for_timeout(200)
        R.setup('%s：【捷徑】40 秒沒跳，void DATE.prompt(GAME,OUT.get(GAME.G,%s))' % (tag, self.q))
        await pg.evaluate("q=>{ const o=OUT.get(GAME.G,q); if(o) void DATE.prompt(GAME,o); }", self.q); return True


class Confess(Part):
    name = 'CONFESS'; L1 = staticmethod(lambda t: '（告訴她）' in t); chain = []; point = 'L1:-2'; irr = ('（告訴她）',)

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']
        await GC.load(pg, cdp, GC.mkstate(d, 17.0, 'gongguan'), 'CONFESS 建存檔：%s 17:00 公館' % d['key'])
        bk = await pg.evaluate(DATE_BOOK, d['d'] + 1)
        has = await pg.evaluate("typeof CF723!=='undefined'&&!!CF723.retryOffer&&CF723.has('heroine_01')")
        R.setup('CONFESS：【捷徑】DATE.book 一筆給告白場面用 %s；CF723 有沒有：%s' % (J(bk), has))
        if not bk.get('ok') or not has: return False
        await pg.evaluate("d=>{ const f=GAME.G.flags; f.CONF_FAIL={heroine_01:{day:d-20,cnt:-5}}; }", d['d'])
        self.st = await P.snapshot(pg); self.trip = bk['trip']['trip']
        self.desc = '%s 17:00 公館；CONF_FAIL.heroine_01 失敗過 20 天、約會次數夠【捷徑】' % d['key']; return True

    async def fire(self, pg, cdp, tag):
        R.setup('%s：【捷徑】void DATE.confessOffer(GAME,那一筆約會)（遊戲本來是正式約會的結尾）' % tag)
        await pg.evaluate("id=>{ const t=(GAME.G.trips||[]).find(x=>x.trip===id); void DATE.confessOffer(GAME,t); }", self.trip); return True


DEC_JS = r"""(()=>{ if(typeof DECIDE==='undefined'||!DECIDE.choose) return false; (async()=>{ GAME.sceneBegin(); try{ await GAME.say(null,'（探針）她問了一句。');
  window.__DECK=await DECIDE.choose(GAME,[{t:'（探針）第一項',key:true},{t:'（探針）第二項',key:true},{t:'（探針）第三項',key:true}],{}); } finally { GAME.sceneEnd(); } })(); return true; })()"""


class Decide(Part):
    name = 'DECIDE'; L1 = staticmethod(lambda t: any(x.startswith('（探針）第') for x in t)); chain = [('（探針）第二項', lambda t: '確定' in t)]; point = 'L1:-2'; irr = ('確定',)

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; self.st = GC.mkstate(d, 16.0, 'cafe'); self.desc = '%s 16:00 Café（合成的小心選擇，只測選單機制）' % d['key']
        return await pg.evaluate("typeof DECIDE!=='undefined'&&!!DECIDE.choose")

    async def fire(self, pg, cdp, tag):
        R.setup('%s：【捷徑】合成的 DECIDE.choose（三個 key 選項）' % tag); return await pg.evaluate(DEC_JS)


class Autopop(Part):
    name = 'AUTOPOP'; L1 = staticmethod(lambda t: any(x.startswith('直接過去') for x in t)); chain = []; point = 'L1:-2'; irr = ('直接過去',)

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; self.d = d['d']; self.st = GC.mkstate(d, 15.5, 'dorm'); self.desc = '%s 15:30 宿舍' % d['key']; return True

    async def fire(self, pg, cdp, tag):
        R.setup('%s：【捷徑】INV.accept（沈以安、2:30 AM、15:50）→ 等遊戲自己跳「直接過去」' % tag)
        r = await pg.evaluate("d=>{ const iv=INV.accept(GAME.G,'heroine_01','cafe',d,(+GAME.G.hour)+0.33); return iv?{id:iv.id,h:iv.h}:null; }", self.d)
        R.note('%s：加的約 %s' % (tag, J(r))); return bool(r)


class Gym(Part):
    name = 'GYM'; trig = 'interact'; L1 = staticmethod(lambda t: any(x.startswith('「單次。」') for x in t)); chain = []; point = 'L1:-2'; irr = ('「單次。」', '「這個月的月票。」')

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; self.st = GC.mkstate(d, 15.0, 'gym_b1'); self.desc = '%s 15:00 體育館 B1（第一次辦卡）' % d['key']; return True

    async def after_load(self, pg, cdp, tag):
        self.ir = await place_at(pg, cdp, 'gym', lambda t: t.startswith('去健身房'), tag); return bool(self.ir)


class BedFFC(BedFF):
    name = 'BEDFFC'

    async def prep(self, pg, cdp):
        T = await GC.target_day(pg); d = T['day']; self.T = T
        self.st = GC.mkstate(d, BEDFFC_H, 'dorm'); self.desc = '%s（第 %d 天）%.2f 時宿舍房間（第一堂 %s %.2f–%.2f）' % (d['key'], d['d'], BEDFFC_H, T['crim']['name'], T['crim']['t0'], T['crim']['t1'])
        return True


KEYNAMES = r"""(keys=>keys.map(k=>{ const m=k.replace(/^(plan_)?skip_/,'').split(':'); let c=null; try{ c=CLS.byId?CLS.byId(m[1]):null; }catch(e){} return {key:k,day:+m[0],id:m[1],name:c?c.name:null}; }))"""


async def ff_wait(pg, cdp, tag, max_s=240, idle_s=6.0):
    """快轉跑完：途中的對話照正常速度點、選單選最後一個（多半是「先停在這裡」）並記下來；人空下來 idle_s 秒＝跑完"""
    t0 = time.time(); idle = None; seen = []
    while time.time() - t0 < max_s:
        s = await GC.ms(pg)
        if s['ch']:
            idle = None; await pg.wait_for_timeout(600); m = await menu_now(pg); txt = [b['t'] for b in m]
            if txt: seen.append(txt); R.note('%s：快轉途中的選單 %s → 選最後一個' % (tag, J(txt))); await P.tap_choice(pg, cdp, len(txt) - 1); await pg.wait_for_timeout(900)
            continue
        if s['dlg']: idle = None; await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['fade'] or s['path']: idle = None; await pg.wait_for_timeout(300); continue
        idle = idle or time.time()
        if time.time() - idle >= idle_s: return seen
        await pg.wait_for_timeout(300)
    R.note('%s：快轉 %d 秒還沒跑完（%s）' % (tag, max_s, J(await GC.ms(pg)))); return seen


async def bedffc_case(pg, cdp, part, case, newc):
    target, confirm = {'week': ('過一週', '快轉'), 'next': ('到下一個', '快轉'), 'cancel': ('過一週', '算了')}[case]
    tag = 'BEDFFC_%s' % case
    if not await fresh(pg, tag): return
    if not await part.load(pg, cdp, tag): R.note('【到不了】%s：前置失敗' % tag); UNREACHED.append(tag); return
    before = await snap(pg); n0 = await GC.logn(pg)
    m1 = await bring_l1(pg, cdp, part, tag)
    if not m1: R.note('【到不了】%s：床的選單沒有「快轉」' % tag); UNREACHED.append(tag); return
    await pg.wait_for_timeout(500); R.note('%s：床的選單 %s → 照字選「快轉」' % (tag, J([b['t'] for b in m1])))
    await pick_text(pg, cdp, '快轉')
    m2 = await adv_until(pg, cdp, lambda t: any(x.startswith(target) for x in t), tag, max_s=30)
    if not m2: R.note('【到不了】%s：快轉選單沒有「%s」' % (tag, target)); UNREACHED.append(tag); return
    await pg.wait_for_timeout(500); got2 = await pick_text(pg, cdp, target); R.note('%s：快轉選單 %s → 照字選「%s」' % (tag, J([b['t'] for b in m2]), got2))
    m3 = await adv_until(pg, cdp, lambda t: '算了' in t and '快轉' in t, tag, max_s=25, stop_other=True)
    says = [e.get('text') for e in await GC.logs(pg, n0) if e.get('k') == 'say']
    ctext = next((x for x in says if str(x or '').startswith('快轉：')), None)
    R.note('%s：說明（全文）%s；確認選單 %s' % (tag, J(ctext), J([[b['t'], b['r']] for b in m3]) if m3 else '沒有出現'))
    if m3:
        await pg.wait_for_timeout(600); got3 = await pick_text(pg, cdp, confirm); R.note('%s：照字選確認的「%s」' % (tag, got3))
    elif newc: R.check('%s：選「%s」以後有確認〔算了／快轉〕' % (tag, got2), False, J(says))
    if confirm == '算了':
        await pg.wait_for_timeout(2000); st = await L.state(pg); ir = await pg.evaluate(IRECT); after = await snap(pg)
        R.note('%s：選「算了」以後：區域 %s、位置 (%s, %s) 第 %s 層、G.hour %s、對話 %s、選單 %s、互動鍵 %s' % (tag, st['zone'], st['x'], st['z'], st['lv'], st['hour'], st['dlg'], st['choices'], J(ir)))
        dd = ddiff(before, after); R.note('%s：選「算了」以後的變化 %s' % (tag, J(dd) if dd else '沒有'))
        if ir:
            await L.tap(pg, cdp, '#interact'); m = None
            for _ in range(30):
                await pg.wait_for_timeout(500)
                if (await GC.ms(pg))['ch']: await pg.wait_for_timeout(400); m = await menu_now(pg); break
            R.note('%s：再按一次互動鍵「%s」→ %s' % (tag, ir['t'], J([b['t'] for b in m]) if m else '沒有出選單'))
        else: R.note('%s：選「算了」以後沒有互動鍵（床按不到）' % tag)
        await R.shot(pg, tag + '_after_cancel'); return
    seen = await ff_wait(pg, cdp, tag)
    after = await snap(pg); sk = new_skips(before, after)
    names = await pg.evaluate(KEYNAMES, sk) if sk else []
    m = re.search(r'現在正在上的(.+?)會記成沒去', ctext or '')
    said = [x for x in (m.group(1).split('、') if m else []) if x]
    got_names = [x['name'] or x['id'] for x in names]
    R.note('%s：快轉完 第 %s→%s 天 %s 時 %s；途中選單 %s；note 多出的 %s；說明寫的「會記成沒去」%s' % (tag, before['day'], after['day'], after['hour'], after['zone'], J(seen), J(names), J(said)))
    await R.shot(pg, tag + '_after')
    for msg, ok, info in (('%s：說明裡寫的課都被記成沒去' % tag, all(x in got_names for x in said), J([said, got_names])),
                          ('%s：說明沒寫的課沒有被記成沒去' % tag, all(x in said for x in got_names), J([said, got_names]))):
        if newc: R.check(msg, ok, info)
        else: R.note('（D34 舊版對照，只記；這一版沒有說明）%s → %s %s' % (msg, '是' if ok else '否', info))


async def run_bedffc(p):
    part = BedFFC()
    for ori in MASHO:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=(ori == 'L'))
        try:
            await pg.goto(guard_url(URL))
            if not await L.wait_loaded(pg): R.note('BEDFFC：遊戲沒載入'); return
            await pg.evaluate("localStorage.clear()"); await GC.hook(pg)
            newc = await pg.evaluate("typeof SEMFF!=='undefined'&&typeof SEMFF.confirmText==='function'")
            R.note('BEDFFC_%s：這一版%s快轉確認（SEMFF.confirmText）' % (ori, '有' if newc else '沒有'))
            await part.prep(pg, cdp)
            for c in BEDFFC_CASES:
                try: await bedffc_case(pg, cdp, part, c, newc)
                except Exception as e: R.note('BEDFFC %s 例外：%r' % (c, e))
            R.note('BEDFFC_%s：JS 例外 %s' % (ori, J(errs[:5]) if errs else '沒有'))
        finally:
            await b.close()


CLASSES = {'WAKE': Wake, 'AFTER': After, 'JOB': Job, 'BEDFF': BedFF, 'BIKE': Bike, 'DATE': Date, 'CONFESS': Confess, 'DECIDE': Decide, 'AUTOPOP': Autopop, 'GYM': Gym, 'BEDFFC': BedFFC}


async def bring_l1(pg, cdp, part, tag):
    """正常速度叫出 L1：interact 類按一下互動鍵；call 類照 PART 觸發；wake 類讀檔已經在「早安」那一句"""
    if part.trig == 'interact':
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(300)
    elif part.trig != 'wake':
        if not await part.fire(pg, cdp, tag): return None
    return await adv_until(pg, cdp, part.L1, tag)


# ---------- 1. 量位置 ----------
def ov_list(name_a, ra, menu, tagb):
    out = []
    for k, b in enumerate(menu):
        a = area(ra, b['r'])
        if a: out.append({'a': name_a, 'b': '%s[%d]「%s」' % (tagb, k, b['t']), 'area': a, 'star': '★'})
    return out


def pick3(menu):
    if not menu: return {}
    return {'first': menu[0], 'last': menu[-1], 'last2': menu[-2] if len(menu) >= 2 else None, 'n': len(menu)}


async def measure(pg, cdp, part, ori):
    tag = '%s_%s_cal' % (part.name, ori)
    if not await part.load(pg, cdp, tag): return None
    ir0 = await pg.evaluate(IRECT)
    m1 = await bring_l1(pg, cdp, part, tag)
    if not m1: return None
    await pg.wait_for_timeout(500); m1 = await menu_now(pg); cv1 = await pg.evaluate(GC.COVER); shot1 = await R.shot(pg, tag + '_L1')
    lay = {'ori': ori, 'interact': ir0, 'L1': m1, 'L1cover': cv1, 'L1pick3': pick3(m1), 'levels': [], 'overlaps': []}
    ov = lay['overlaps']
    if ir0: ov += ov_list('互動鍵「%s」' % ir0['t'], ir0['r'], m1, 'L1')
    if cv1 and cv1.get('dlgShown') and cv1.get('dlgRect'): ov += ov_list('留著的對話框', cv1['dlgRect'], m1, 'L1')
    prev = m1; lvl = 1
    for step in part.chain:
        want, sig = step[0], step[1]; opt = len(step) > 2 and step[2]
        src = next((b for b in prev if b['t'].startswith(want)), None)
        nsay = await GC.logn(pg)
        got = await pick_text(pg, cdp, want)
        if not got: R.note('%s：L%d 找不到「%s」' % (tag, lvl, want)); break
        m2 = await adv_until(pg, cdp, sig, tag, max_s=25 if opt else 60, stop_other=bool(opt))
        if not m2:
            if opt: R.note('%s：選「%s」以後沒有下一層（這一版沒有這一步——舊版對照時是預期）' % (tag, got))
            break
        says = [e.get('text') for e in await GC.logs(pg, nsay) if e.get('k') == 'say']
        await pg.wait_for_timeout(500); m2 = await menu_now(pg); cv2 = await pg.evaluate(GC.COVER); lvl += 1
        await R.shot(pg, '%s_L%d' % (tag, lvl))
        if says: R.note('%s：選「%s」到下一層之間的對話（全文）%s' % (tag, got, J(says)))
        lay['levels'].append({'from': got, 'fromRect': src['r'] if src else None, 'menu': m2, 'pick3': pick3(m2), 'cover': cv2, 'says': says})
        if src: ov += ov_list('L%d 被點的「%s」' % (lvl - 1, src['t']), src['r'], m2, 'L%d' % lvl)
        if ir0: ov += ov_list('互動鍵「%s」' % ir0['t'], ir0['r'], m2, 'L%d' % lvl)
        if cv2 and cv2.get('dlgShown') and cv2.get('dlgRect'): ov += ov_list('留著的對話框', cv2['dlgRect'], m2, 'L%d' % lvl)
        prev = m2
    R.note('%s：互動鍵 %s；L1 %s（第一項／倒數第 1／倒數第 2：%s）；對話框 %s' % (tag, J(ir0), J([[b['t'], b['r']] for b in m1]), J(lay['L1pick3']), J((cv1 or {}).get('dlgRect') if (cv1 or {}).get('dlgShown') else None)))
    for lv in lay['levels']: R.note('%s：選「%s」（框 %s）→ 下一層 %s' % (tag, lv['from'], lv['fromRect'], J([[b['t'], b['r']] for b in lv['menu']])))
    R.note('%s：重疊 %s' % (tag, J(ov) if ov else '沒有'))
    lay['shot'] = os.path.basename(shot1)
    json.dump(lay, open(os.path.join(OUT, 'choose_%s_layout_%s.json' % (part.name, ori)), 'w'), ensure_ascii=False, indent=1)
    return lay


def point_of(lay, key):
    if key == 'interact':
        return ctr(lay['interact']['r']) if lay.get('interact') else None
    if key.startswith('L1:'):
        w = key[3:]; m = lay['L1']
        if w.lstrip('-').isdigit():
            k = int(w); return ctr(m[k]['r']) if -len(m) <= k < len(m) else None
        b = next((b for b in m if b['t'].startswith(w)), None); return ctr(b['r']) if b else None
    return None


# ---------- 2. 連點 ----------
def bursts(downs):
    out = []; cur = None
    for d in downs:
        if cur is None or d['t'] - cur[-1]['t'] >= 400: cur = [d]; out.append(cur)
        else: cur.append(d)
    return out


def analyse(lg, part, t_start):
    downs = [e for e in lg if e['k'] == 'down']; picks = [e for e in lg if e['k'] == 'pick']; menus = [e for e in lg if e['k'] == 'choose']
    pre = [d for d in downs if d['t'] < t_start - 1]; downs = [d for d in downs if d['t'] >= t_start - 1]
    bs = bursts(downs); bid = {}
    for i, b in enumerate(bs):
        for d in b: bid[id(d)] = (i, b[0]['t'])
    taps = [{'n': k + 1, 'ms': round(d['t'] - t_start), 'burst': bid[id(d)][0] + 1, 'menu': (d.get('menu') or [None])[0], 'menuAll': d.get('menu'), 'hit': d.get('btn') or ('（沒有落在任何一項）' if d.get('menu') else '（畫面上沒有選單：%s）' % d.get('tgt')),
             'sinceMenu': d.get('sinceMenu')} for k, d in enumerate(downs)]
    gaps = sorted(downs[i + 1]['t'] - downs[i]['t'] for i in range(len(downs) - 1))
    pace = round(gaps[len(gaps) // 2]) if gaps else None
    res = []
    for p in picks:
        ref = p.get('ref'); dn = [d for d in pre + downs if d['t'] <= p['t'] + 1]; d = dn[-1] if dn else None
        bi, bst = bid.get(id(d), (None, None)) if d else (None, None)
        down_dt = (d['t'] - ref) if (d and ref is not None) else None
        menu = next((m for m in menus if m.get('t0') == ref or m.get('t') == ref), None); mopts = (menu or {}).get('opts') or []
        v350 = down_dt is not None and down_dt < 350
        vburst = bst is not None and ref is not None and bst <= ref and down_dt is not None and down_dt < 4000
        expired = bst is not None and ref is not None and bst <= ref and down_dt is not None and down_dt >= 4000
        res.append({'picked': p.get('txt'), 'menu': mopts, 'downDt': None if down_dt is None else round(down_dt), 'burst': None if bi is None else bi + 1, 'burstBeforeMenu': bool(bst is not None and ref is not None and bst <= ref),
                    'v350': v350, 'vburst': vburst, 'expired': expired, 'irr': part.is_irr(mopts, p.get('txt')), 'ours': d is not None and d in downs})
    pre_s = [{'ms': round(d['t'] - t_start), 'menu': (d.get('menu') or [None])[0], 'hit': d.get('btn') or d.get('tgt')} for d in pre]
    return taps, res, [len(b) for b in bs], [m.get('opts') for m in menus], pace, pre_s


async def mash(pg, cdp, pt, rate, n, first_at=None, mid=None):
    """同一點連點 n 下（每 rate ms）；first_at＝第一下改按這裡（互動鍵）；mid＝(第幾下之後, async 函式) 叫出選單"""
    for i in range(n):
        xy = first_at if (i == 0 and first_at) else pt
        await L.touch_tap(cdp, xy[0], xy[1])
        if mid and i + 1 == mid[0]: await mid[1]()
        await pg.wait_for_timeout(rate)


async def one_run(pg, cdp, part, lay, spec, ori, idx, newv):
    rate, n, start, pkey = spec
    tag = '%s_%s_r%d_%dms_%dx_%s' % (part.name, ori, idx, rate, n, start)
    pt = point_of(lay, pkey); ia = point_of(lay, 'interact')
    if not pt: R.note('%s：點的位置 %s 量不到，跳過' % (tag, pkey)); return None
    if not await fresh(pg, tag): return None
    if not await part.load(pg, cdp, tag): R.note('%s：前置失敗，跳過' % tag); return None
    await pg.evaluate("(()=>{ if(window.__GC) window.__GC.cur=null; })()")
    before = await snap(pg); n0 = await GC.logn(pg)
    t_start = None; mid = None; first = None
    if start == 'menu':
        m = await bring_l1(pg, cdp, part, tag)
        if not m: R.note('%s：L1 沒出來' % tag); return None
    elif start == 'dlg':
        if part.trig == 'interact': await L.tap(pg, cdp, '#interact')
        elif part.trig != 'wake' and not await part.fire(pg, cdp, tag): return None
        if not await wait_dlg_or_menu(pg): R.note('%s：沒有對話也沒有選單' % tag); return None
    elif start == 'interact':
        if not ia: R.note('%s：量不到互動鍵' % tag); return None
        first = ia
    elif start == 'pre':
        async def go(): await part.fire(pg, cdp, tag)
        mid = (2, go)
    t_start = await pg.evaluate(NOW)
    await mash(pg, cdp, pt, rate, n, first_at=first, mid=mid)
    await pg.wait_for_timeout(SETTLE)
    after = await snap(pg); lg = await GC.logs(pg, n0); ms_ = await GC.ms(pg)
    taps, picks, bl, mseq, pace, pre_s = analyse(lg, part, t_start)
    diff = ddiff(before, after)
    shot = await R.shot(pg, tag + '_end')
    res = {'tag': tag, 'spec': {'rate': rate, 'n': n, 'start': start, 'point': pkey, 'xy': pt, 'firstAt': first}, 'pace': pace, 'preTaps': pre_s, 'taps': taps, 'picks': picks, 'bursts': bl, 'menus': mseq, 'diff': diff,
           'end': ms_, 'shot': os.path.basename(shot)}
    json.dump(res, open(os.path.join(OUT, 'choose_%s.json' % tag), 'w'), ensure_ascii=False, indent=1)
    R.note('%s：點 %s（%s），%d 下每 %d ms，開始方式 %s；串 %s' % (tag, [round(x) for x in pt], pkey, n, rate, start, bl))
    if pre_s: R.note('%s：開始連點以前（叫出選單用）的觸控 %s' % (tag, J(pre_s)))
    if pace is not None and pace > rate * 1.5: R.note('%s：節奏沒達到（兩下間隔中位數 %d ms，要 %d ms）——瀏覽器太慢（雲端 SwiftShader），這一輪的「串」不準，以 PC 為準' % (tag, pace, rate))
    R.note('%s：每一下［第幾下, 離開始 ms, 第幾串, 當下的選單（第一項）, 落在, 離選單出現 ms］%s' % (tag, J([[t['n'], t['ms'], t['burst'], t['menu'], t['hit'], t['sinceMenu']] for t in taps])))
    R.note('%s：被選到的 %s' % (tag, J([[p['picked'], (p['menu'] or [None])[0], p['downDt'], p['burst'], p['burstBeforeMenu'], ('★' if p['irr'] else '')] for p in picks])))
    R.note('%s：不可逆的變化 %s' % (tag, J(diff) if diff else '沒有'))
    R.note('%s：停下來時 %s' % (tag, J(ms_)))
    bad = [p for p in picks if p['ours'] and (p['v350'] or p['vburst'])]
    exp = [p for p in picks if p['expired']]
    if rate <= 200:
        msg = '%s：150 ms 節奏，選單出現 350 ms 內、或選單出現以前就開始的那一串（<4000 ms）沒有點掉任何一項' % tag
        if newv: R.check(msg, not bad, J(bad))
        else: R.note('（D34 舊版對照，只記）%s → %s' % (msg, '沒有' if not bad else J(bad)))
    for p in exp:
        R.note('%s：%s保險到期（同一串、離選單出現 %s ms）還被點掉：「%s」（選單 %s）' % (tag, '★' if p['irr'] else '', p['downDt'], p['picked'], J(p['menu'])))
    if rate > 200:
        irr = [p for p in picks if p['irr']]
        R.note('%s：500 ms 節奏一路點下去，點掉的不可逆項 %s' % (tag, ('★ ' + J([[p['picked'], p['downDt']] for p in irr])) if irr else '沒有'))
    if part.name == 'BEDFF':
        cf = [e.get('text') for e in lg if e.get('k') == 'say' and str(e.get('text') or '').startswith('快轉：')]
        R.note('%s：確認前的說明（全文）%s' % (tag, J(cf) if cf else '沒有出現'))
        if (rate, n) in ((150, 20), (150, 40), (500, 8)):
            hasc = await pg.evaluate("typeof SEMFF!=='undefined'&&typeof SEMFF.confirmText==='function'")
            sk = new_skips(before, after)
            for msg, ok, info in (('%s：連點以後天數沒變（%s → %s）' % (tag, before.get('day'), after.get('day')), before.get('day') == after.get('day'), ''),
                                  ('%s：連點以後 CLS note 沒有多出 skip_*' % tag, not sk, J(sk))):
                if hasc: R.check(msg, ok, info)
                else: R.note('（D34 舊版對照，只記；這一版沒有快轉確認）%s → %s %s' % (msg, '是' if ok else '否', info))
    if part.name == 'WAKE':
        ck = part.T['crim']['key']; ps = 'plan_skip_' + ck in ((after.get('cls') or {}).get('note') or {})
        msg = '%s：起床鏈連點以後沒有翹課（CLS note 沒有 plan_skip_%s）' % (tag, ck)
        if newv: R.check(msg, not ps, J([d for d in diff if 'note' in d[0]]))
        else: R.note('（D34 舊版對照，只記）%s → %s' % (msg, '翹了' if ps else '沒翹'))
    SUMMARY.setdefault(part.name, []).append({'tag': tag, 'picked': [[p['picked'], p['downDt'], '★' if p['irr'] else ''] for p in picks], 'diffN': len(diff)})
    return res


def parse_runs(part):
    s = ENV('RUNS') or (DEFRUNS[part.name] % {'n': N150, 'm': N500, 'l': NLONG})
    out = []
    for x in s.replace('/', ';').split(';'):
        x = x.strip()
        if not x: continue
        pk = part.point
        if '@' in x: x, pk = x.split('@', 1)
        a = x.split(':'); out.append((int(a[0]), int(a[1]), a[2] if len(a) > 2 else 'menu', pk))
    return out


async def run_part(p, name):
    if name == 'BEDFFC': return await run_bedffc(p)
    part = CLASSES[name]()
    lays = {}
    for ori in sorted(set(ORIENTS) | set(MASHO), key=lambda o: o != 'P'):
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=(ori == 'L'))
        try:
            await pg.goto(guard_url(URL))
            if not await L.wait_loaded(pg): R.note('%s_%s：遊戲沒載入' % (name, ori)); continue
            await pg.evaluate("localStorage.clear()"); await GC.hook(pg)
            gv = await pg.evaluate(GUARDV); newv = bool(gv.get('TAP_BURST_GAP')) and not SHA.startswith('779ddd65')
            R.note('%s_%s：防連點 %s → %s' % (name, ori, J(gv), '新版規則' if newv else '舊版（沒有串的保險）'))
            ok = await part.prep(pg, cdp)
            if not ok: R.note('【到不了】%s_%s：前置建不起來' % (name, ori)); UNREACHED.append('%s（前置）' % name); return
            lay = await measure(pg, cdp, part, ori)
            if not lay: R.note('【到不了】%s_%s：量位置時 L1 沒出來' % (name, ori)); UNREACHED.append('%s_%s（L1）' % (name, ori)); continue
            lays[ori] = lay
            if ori in MASHO:
                for i, spec in enumerate(parse_runs(part)):
                    try: await one_run(pg, cdp, part, lay, spec, ori, i + 1, newv)
                    except Exception as e: R.note('%s_%s 第 %d 輪例外：%r' % (name, ori, i + 1, e))
            R.note('%s_%s：JS 例外 %s' % (name, ori, J(errs[:5]) if errs else '沒有'))
        finally:
            await b.close()


async def main():
    R.note('CHOOSE 探針：SHA=%s PARTS=%s ORIENTS=%s MASHO=%s；網址加 ?tapguard' % (SHA[:9] or '（沒給）', PARTS, ORIENTS, MASHO))
    async with async_playwright() as p:
        for name in PARTS:
            if name not in CLASSES: R.note('不認得的 PART %s' % name); continue
            t0 = time.time()
            try: await run_part(p, name)
            except Exception as e: R.note('%s 例外：%r' % (name, e))
            R.note('%s 花了 %.0f 秒' % (name, time.time() - t0))
    json.dump({'summary': SUMMARY, 'unreached': UNREACHED}, open(os.path.join(OUT, 'choose_summary.json'), 'w'), ensure_ascii=False, indent=1)
    R.note('總結：%s；到不了：%s' % (J(SUMMARY), J(UNREACHED) if UNREACHED else '沒有'))
    sys.exit(R.finish())


asyncio.run(main())
