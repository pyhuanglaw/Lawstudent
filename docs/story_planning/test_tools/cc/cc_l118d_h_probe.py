"""CC（帳號 A）11-11：L118D_H——118 巷九間店改版（L118-SHOPS-REDO-1111／X338）之 H 節：慢讀咖啡的念書／常客／邀約搬到木曜日（wz_mokuyobi），
以及 AA_311 H1／H4／H5／H6 搬到新店、SQ04 搬到木曜日（BB_335 驗收清單 H 節＋BB 的要求原文）。Playwright（PC GPU）手機模擬 ≠ iPhone。
程式（受測 c19d8b763）：src/slowread3d.js（常客 REGULARS、招呼 greet、H3 h3Due／h3）、src/data/invites.js（地點 slowread：verb「去木曜日念書」、
  timesBy 平日 15:30／19:00、週末 14:00／15:30／19:00、off 週二；地點 mokuyobi「去木曜日坐坐」照舊）、src/invites3d.js（timeOptions／offWhy「木曜日週二休」／pickDay）、
  src/mokuyobi_sys3d.js（1-1 第一次進門、1-2 點東西、看看書櫃、1-6 meetScene 只掛在地點 mokuyobi、1-7 rainDue 只認 place==='mokuyobi'、點完叫 SIDEQ.atShop）、
  src/lane118.js（H1_SHOP='drink_a'、h1Due、H4 korea、H5 tea、H6 cafe2）、src/sideq3d.js（SQ04 shop key 慢讀咖啡＝木曜日、avail 大二下起、S.known 第 5 次、S.roll 35%）。
共通：【前置／捷徑】讀使用者存檔 day46（fixtures/user_saves_1107）改日子／時間／區域／位置／天氣（日子一律先查 CALENDAR：不是國定／校定假日、不是颱風假、
  不是考試週；印出來）、清掉原本的邀約、錢 3000、G.l118.mv772＝2（不讓讀檔的 L118.migrate772 搬動前置寫的次數）；關條件事件與手機自動打開。
  之後：移動一律搖桿（F.joy_to）、互動鍵／選項／對話一律觸控（點選項前等 ≥600 ms）；每一句對話、旁白字幕、每一組選項按鈕都逐字印（頁面上 40 ms 輪詢
  GAME.D.full＋#dlgName；同一句打字機長出來不算換句）。pageerror 有就 FAIL。
PARTS（逗號分隔；預設全部；每段在 PC ≤15 分鐘）：
  MENU     手機邀約選單（以安）「念書…」那一層：有「去木曜日念書」、沒有「慢讀」「大學食堂」；「喝咖啡、喝茶…」有「去木曜日坐坐」（木曜日原本的地點還在）、沒有「去木曜日念書」。
  SLOTS    選「去木曜日念書」的時間選項逐字：週一 2025-11-03（今天 15:30／19:00；明天＝週二灰掉「木曜日週二休」）、週六 2025-11-08（今天、明天各 14:00／15:30／19:00）、
           週二 2025-11-04（今天全灰「木曜日週二休」、點了說「木曜日週二休。」約不到；「其他日子…」下週二的時間也全灰）；最後 G.invites 沒有 slowread。
  REG_AN／REG_YT／REG_XC／REG_NW  常客：以安大一下起週六 14～17、語彤大二上起週一 14～16、芯慈大一上～大二下週四 15:30～17:30、乃文（pool_17）週五 14～16。
           【前置】日子：該學期裡照 CALENDAR＋STORY.schedEnt（那天那個時段她的作息是木曜日 slowread 那一筆）挑第一天；溫州街 B4 門口 → 搖桿「上二樓（木曜日）」→ 爬樓梯進店，
           看 E.npcs 有沒有她（二樓、坐著）＋截圖；語彤／芯慈／乃文再走過去說話，看招呼那一句（SLOWREAD.REGULARS[].hi）。以安的說話在 H3（說話會先演 H3）。
  H3       以安窗邊的位子：大一下週六下午、存檔本來就有 REPORT_PARTNER（day 9 民總）、G.l118.once.H3 沒有 → 進店走過去說話：老闆／旁白／以安三句（照順序、說話人）、
           記 once.H3＝今天；同一天再說一次：不再演 H3、改成招呼那一句。
  CAFE2    118 巷原址大學食堂（l118_cafe2 新室內，週一 12:00）：進店後每個互動鍵沒有念書類（念書／讀書／看書／書架／書櫃／自習／咖啡／慢讀）、
           每張座位都不是讀書座位；坐下的選項沒有「讀書」；點餐選單沒有咖啡。
  ORIG     木曜日原本的事件還在（mokuyobi_sys3d.js 有：1-1 第一次進門、1-2 點東西、1-3 讀完旁白、1-4 老位子／溫水／閒聊、1-5 考試週、打烊、1-6 兩個人來、1-7 雨天、看書櫃／唱片機／海報）：
           演三個：【前置】清掉 G.mokuyobi.first 走進去＝1-1 四句；吧檯「點東西」三樣＋什麼都不點、點焙茶拿鐵那一句；「看看書櫃」一句在 AA_645 的三句裡。
  NOSIT    約「去木曜日念書」（地點 slowread）赴約：不演「坐坐」的進門旁白（MOKS.meetLine「…坐在窗邊那桌，已經點好了。」）和 S.DATE 第一次那一句；
           【前置】下雨、交往中（存檔預設可昕交往中），見面完下樓按「離開木曜日」：不演雨天那一段（MOKS.L.rain）。
  NOSIT_REF 對照：同樣條件約「去木曜日坐坐」（地點 mokuyobi）＝進門旁白有、雨天那一段有（證明 NOSIT 的「沒有」不是條件沒湊齊）。
  H1       喝不喝咖啡（drink_a，外帶窗口）× 學姊：大一上平日 12:20～12:45 點飲料、學姊已經認識、飲料做好時 12:30 以後 → 店員兩句＋兩個選項、SIS_TEA_ORDER。
  H4       清州刀削麵（korea）× 阿哲：【前置】G.l118.w 阿哲在 korea、dian、tea、home 各一起吃過 1 次；週一 12:10 後阿哲在 korea 門口（常客）→ 一起進店點餐 → 排名那段、ZHE_118_RANK。
  H5       辛亥韓食（tea）× Alison：週二 12:10 後 Alison 在 tea 門口 → 一起進店點餐 → 老闆「Alison 又帶朋友來了。小菜多一盤。」
  H6       大學食堂（cafe2）× 柏翰：【前置】G.l118.w 柏翰在 cafe2 一起吃過 2 次（別天）；週一 12:10 後柏翰在 cafe2 門口 → 一起進店點餐（吃完 12:39 以後）→ 柏翰兩句代替「我先回總圖」。
  SQ04     木曜日點餐觸發「一台沒人拿的筆電」：【前置】2027-03-03（大二下，週三）13:30、G.eat 木曜日 4 次（這一次＝第 5 次＝認得你）、【捷徑】SIDEQ.roll＝0（原本 35%）→
           進店吧檯「點東西」點焙茶拿鐵 → 老闆放筆電三句、要我幫忙嗎？→「再等一下？」→ G.side.SQ04 open。
環境變數：PARTS、NOSIT_WHO（逗號分隔候選，預設 kexin,heroine_01,heroine_03：挑第一個「今天 14:00／15:30／19:00 有一個會答應」的人；不是交往中的人【捷徑】設 dating）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=MENU,SLOTS python3 cc_l118d_h_probe.py <url> <out>"""
import os, sys, json, time, math, asyncio, datetime
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
ALL_PARTS = ['MENU', 'SLOTS', 'REG_AN', 'REG_YT', 'REG_XC', 'REG_NW', 'H3', 'CAFE2', 'ORIG', 'NOSIT', 'NOSIT_REF', 'H1', 'H4', 'H5', 'H6', 'SQ04']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]
NOSIT_WHO = [x.strip() for x in (os.environ.get('NOSIT_WHO') or 'kexin,heroine_01,heroine_03').split(',') if x.strip()]
SHA = os.environ.get('SHA') or ''
R = L.Run('l118d_h', OUT); F.setup(R, OUT)
J = F.J
DAY1 = datetime.date(2025, 9, 17)
WZ_DOOR = (7.4, -4.55)          # 溫州街「上二樓（木曜日）」（src/mokuyobi3d.js DOOR_WZ）
WZ_START = (7.4, -1.4)          # 門口外 3 m 的巷子（面向門：yaw π）
MOK_IN_SHOP = (0.0, 0.9)        # 二樓店裡（地毯那一塊，table 5 南邊）
MOK_BAR = (-3.3, -4.95)         # 吧檯「點東西」（mokuyobi_layout interact order）
MOK_BOOK = (-3.6, -0.5)         # 「看看書櫃」
MOK_EXIT = (-3.75, 6.75)        # 一樓樓梯口「離開木曜日」（mokuyobi3d.js：x IN.x、z d/2−0.25）
L118_DOOR = {'drink_a': (4.3, -4.5), 'korea': (4.3, 15.5), 'tea': (-4.3, 11.5), 'cafe2': (-4.3, -12.5)}
L118_ORDER = {'korea': (-0.2, -2.2), 'tea': (-0.35, 0.15), 'cafe2': (0.1, -2.45)}
EXIT_WORDS = ('就這樣', '算了', '沒事', '先這樣', '下次', '不用了', '再見', '離開', '返回', '先不要', '起身')

# ---------------------------------------------------------------- 逐字紀錄（頁面裡輪詢；Python 這邊 drain 印出來）
LOG_JS = r"""(()=>{ if(window.__cc&&window.__cc.on) return 'already'; const C=window.__cc={on:1,log:[]};
  let lastRes=null, lastOpts='', lastCap='', lastToast='', lastZone=null;
  const vis=e=>!!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none';
  setInterval(()=>{ try{ const D=GAME.D, G=GAME.G;
    if(G&&G.zone!==lastZone){ lastZone=G.zone; C.log.push({k:'zone',zone:G.zone,h:+(+G.hour).toFixed(2)}); }
    if(D&&D.active&&D.resolve&&D.resolve!==lastRes){ lastRes=D.resolve; const n=document.getElementById('dlgName'); const who=(n&&n.style.display!=='none')?(n.textContent||'').trim():'';
      C.log.push({k:'say',who,text:String(D.full||''),zone:G.zone,h:+(+G.hour).toFixed(2)}); }
    if(D&&!D.active) lastRes=null;
    const ch=document.getElementById('choices');
    if(vis(ch)){ const bs=[...ch.querySelectorAll('button')].map(b=>({t:[...b.childNodes].filter(x=>!(x.classList&&x.classList.contains('hint'))).map(x=>x.textContent).join('').trim(), hint:((b.querySelector('.hint')||{}).textContent||'').trim(), dim:!!(b.disabled||b.classList.contains('dim'))}));
      const sig=JSON.stringify(bs); if(sig!==lastOpts){ lastOpts=sig; C.log.push({k:'opts',opts:bs,zone:G.zone,h:+(+G.hour).toFixed(2)}); } } else lastOpts='';
    const cp=document.getElementById('caption'); const ct=(cp&&vis(cp)&&+getComputedStyle(cp).opacity>0.05)?(cp.innerText||'').trim():'';
    if(ct&&ct!==lastCap){ C.log.push({k:'cap',text:ct,zone:G.zone}); } lastCap=ct;
    const tt=document.getElementById('toast'); const tx=tt?(tt.innerText||'').trim():''; if(tx&&tx!==lastToast) C.log.push({k:'toast',text:tx}); lastToast=tx;
  }catch(e){} },40); return 'ok'; })()"""
LOG = []
# r3：E.unstick 成功幾次（卡在阻擋格被拉出來；樓梯卡住的診斷用）
UNSTICK_JS = r"""(()=>{ const E=GAME.E; if(!E||E.__ccUnw||!E.unstick) return; const f=E.unstick; E.unstick=function(){ const r=f.apply(this,arguments); if(r) window.__ccUnstick=(window.__ccUnstick|0)+1; return r; }; E.__ccUnw=1; })()"""


async def drain(pg):
    try: xs = await pg.evaluate("(()=>{ const C=window.__cc; if(!C) return []; const a=C.log; C.log=[]; return a; })()")
    except Exception: return
    for x in xs:
        LOG.append(x)
        if x['k'] == 'say': print('    [說] %s：%s' % (x['who'] or '（旁白）', x['text']), flush=True)
        elif x['k'] == 'opts': print('    [選項] ' + '｜'.join(o['t'] + (('〔%s〕' % o['hint']) if o['hint'] else '') + ('（灰）' if o['dim'] else '') for o in x['opts']), flush=True)
        elif x['k'] == 'cap': print('    [字幕] ' + x['text'].replace('\n', ' '), flush=True)
        elif x['k'] == 'toast': print('    [toast] ' + x['text'].replace('\n', ' '), flush=True)
        elif x['k'] == 'zone': print('    [區域] %s（%s）' % (x['zone'], x['h']), flush=True)


def says(i0=0):
    return [x for x in LOG[i0:] if x['k'] == 'say']


def has_say(i0, text, who=None):
    return any(text in x['text'] and (who is None or who in x['who']) for x in says(i0))


def in_order(i0, seq):
    """seq＝[(說話人片段或 None＝旁白或不管, 句子)]：照順序都出現（中間可以夾別句）"""
    ss = says(i0); k = 0
    for x in ss:
        if k < len(seq):
            w, t = seq[k]
            if t in x['text'] and (w is None or w in x['who']): k += 1
    return k == len(seq), k


def day_of(key):
    return (datetime.date.fromisoformat(key) - DAY1).days + 1


def wd_of(key):
    return datetime.date.fromisoformat(key).isoweekday() % 7


# ---------------------------------------------------------------- 讀檔（前置）
def base(key, hour, zone, x, z, yaw=0.0, lv=0, weather='clear'):
    s = json.load(open(F.SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    s['day'] = day_of(key); s['weekday'] = wd_of(key); s['hour'] = hour; s['zone'] = zone; s['pos'] = {'x': x, 'z': z, 'yaw': yaw, 'lv': lv}
    s['weather'] = weather; s['invites'] = []; s['money'] = 3000
    l1 = dict(s.get('l118') or {}); l1['mv772'] = 2; s['l118'] = l1
    s['flags'] = dict(s.get('flags') or {})
    return s


CAL_JS = r"""(d=>{ const x=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); return {key:x.key, wd:x.wd%7, hol:CALENDAR.holiday(d), typh:CALENDAR.typhoon(d), term:t?t.id:null, week:t?t.week:null, exam:t?t.exam:null}; })"""


async def load(pg, cdp, why, s, exam_ok=False):
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(4500); await L.close_panels(pg, cdp)
    await pg.evaluate(LOG_JS); await pg.evaluate(UNSTICK_JS); await F.ready(pg, cdp, 30); await drain(pg)
    c = await pg.evaluate(CAL_JS, s['day'])
    R.setup('%s：day46 存檔 → %s（週%s）%05.2f、%s (%.2f, %.2f) lv%d、天氣 %s、清邀約、錢 3000、l118.mv772＝2、關條件事件／手機自動打開' % (why, c['key'], '日一二三四五六'[c['wd']], s['hour'], s['zone'], s['pos']['x'], s['pos']['z'], s['pos'].get('lv', 0), s['weather']))
    R.note('CALENDAR：%s' % J(c))
    R.check('[日子] %s 不是假日／颱風假%s（%s 第 %s 週）' % (c['key'], '' if exam_ok else '、不是考試週', c['term'], c['week']), not c['hol'] and not c['typh'] and (exam_ok or not c['exam']), J(c))
    g = await pg.evaluate("(()=>({zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(2), weather:GAME.G.weather, stage:GAME.G.stage}))()")
    R.note('讀進來：%s' % J(g))
    return g


# ---------------------------------------------------------------- 觸控、選單
OPTS_JS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return [];
  return [...ch.querySelectorAll('button')].map(b=>({t:[...b.childNodes].filter(x=>!(x.classList&&x.classList.contains('hint'))).map(x=>x.textContent).join('').trim(), hint:((b.querySelector('.hint')||{}).textContent||'').trim(), dim:!!(b.disabled||b.classList.contains('dim'))})); })()"""


async def opts(pg):
    return await pg.evaluate(OPTS_JS)


async def tap_opt(pg, cdp, k, why=''):
    await pg.wait_for_timeout(650)   # 選單剛出來 350 ms 內的點擊會被吃掉
    o = await opts(pg)
    HIT = "(i=>{ const b=document.querySelectorAll('#choices button')[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const h=document.elementFromPoint(x,y); return {c:[x,y], hit:!!h&&(h===b||b.contains(h)), top:h?((h.id||'')+'.'+String(h.className||'').slice(0,30)+'<'+((h.closest&&h.closest('[id]')||{}).id||'')):null}; })"
    q = await pg.evaluate(HIT, k)
    if not q: return False
    if not q['hit']:   # r3：被手機（或別的面板）蓋住——像玩家一樣先收起來
        R.note('選項「%s」被「%s」蓋住：先收起手機／面板' % (o[k]['t'] if k < len(o) else '#%d' % k, q['top']))
        await pe.close_phone(pg, cdp); await L.close_panels(pg, cdp); await pg.wait_for_timeout(700)
        q = await pg.evaluate(HIT, k)
        if not q: return False
        if not q['hit']: R.note('收起來以後還是被「%s」蓋住，照樣按' % q['top'])
    c = q['c']
    print('    [按] %s%s' % (o[k]['t'] if k < len(o) else '#%d' % k, ('（%s）' % why) if why else ''), flush=True)
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); await drain(pg)
    return True


async def tap_word(pg, cdp, word, start=True, why=''):
    for _ in range(10):
        o = await opts(pg)
        if o: break
        await pg.wait_for_timeout(400)
    k = next((i for i, x in enumerate(o) if (x['t'].startswith(word) if start else word in x['t'])), None)
    if k is None: R.note('選項裡找不到「%s」：%s' % (word, J([x['t'] for x in o]))); return None
    await tap_opt(pg, cdp, k, why); return o


async def wait_opts(pg, cdp, secs=15):
    """等選單（中間有對話就點掉）"""
    for _ in range(int(secs * 2)):
        await drain(pg); o = await opts(pg)
        if o: return o
        q = await L.state(pg)
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        await pg.wait_for_timeout(500)
    return []


def default_pick(o):
    k = next((i for i, x in enumerate(o) if any(w in x['t'] for w in EXIT_WORDS)), None)
    return len(o) - 1 if k is None else k


async def run_dialog(pg, cdp, pick=None, secs=60, until=None):
    """點完對話；選單用 pick(opts)→序號（None＝預設：離開／算了那一類，沒有就最後一個）。until(state)＝停下來的條件"""
    idle = 0; t0 = time.time()
    while time.time() - t0 < secs:
        await drain(pg); q = await L.state(pg)
        if until and until(q): return q
        if q['choices']:
            o = await opts(pg); k = pick(o) if pick else None
            if k is None: k = default_pick(o)
            await tap_opt(pg, cdp, k); idle = 0; continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
        if not q['busy']:
            idle += 1
            if idle >= 5 and not until: break
        else: idle = 0
        await pg.wait_for_timeout(500)
    await drain(pg); return await L.state(pg)


async def joy(pg, cdp, tag, x, z, near=0.6, lv=None, max_s=120):
    r = await F.joy_to(pg, cdp, tag, x, z, near=near, lv=lv, max_s=max_s); await drain(pg)
    R.note('%s 搖桿 → (%.2f, %.2f)%s：%s、%s 秒、推 %d 次、跳 %s、停在 %s' % (tag, x, z, '' if lv is None else ' lv%d' % lv, '到了' if r['ok'] else ('沒到：' + str(r.get('why'))), r['t'], r['pushes'], J(r['jumps']), J({k: r['end'][k] for k in ('zone', 'x', 'z', 'lv', 'interact')})))
    return r


async def press(pg, cdp, tag, prefix, secs=6):
    s = await F.wait_btn(pg, prefix, secs)
    if not R.check('%s 互動鍵是「%s…」' % (tag, prefix), s['interact'].startswith(prefix), J({k: s[k] for k in ('zone', 'x', 'z', 'lv', 'interact')})): return None
    print('    [按互動鍵] ' + s['interact'], flush=True)
    await drain(pg); s['i0'] = len(LOG)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(700); await drain(pg)
    return s


ITS_JS = r"""(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label||'', x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), lv:i.lv|0, r:i.radius||1})))()"""


SCORE_JS = r"""(()=>{ const E=GAME.E, P=E.player, px=P.obj.position.x, pz=P.obj.position.z, py=P.obj.position.y, plv=P.lv|0; const f2=v=>+(+v).toFixed(3);
  const occ=st=>E.npcs.some(n=>n.seat&&(n.seat.lv|0)===(st.lv|0)&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.4)||(!st.label&&E.npcs.some(n=>n.seatTarget&&Math.hypot(n.seatTarget.x-st.x,n.seatTarget.z-st.z)<0.4));
  const out=[]; let best=null, bd=1e9;
  for(const it of E.interactables){ const d=Math.hypot(it.x-px,it.z-pz), R=it.radius||1.8; if(d>3) continue; let skip=null;
    if(it.hidden) skip='hidden'; else if(it.seat&&(occ(it.seat)||it.seat.taken)) skip=it.seat.taken?('taken:'+it.seat.taken):'有人坐／正走過去'; else if(E.levels&&it.lv!==undefined&&(it.lv|0)!==plv) skip='別層'; else if(it.y!==undefined&&Math.abs(it.y-py)>1.4) skip='高度';
    const sc=d-(it.prio||0); out.push({k:'點',label:it.label||'',x:f2(it.x),z:f2(it.z),d:f2(d),R:f2(R),prio:it.prio||0,score:f2(sc),inR:d<R,skip,seat:it.seat?[f2(it.seat.x),f2(it.seat.z)]:null});
    if(!skip&&d<R&&sc<bd){ bd=sc; best=it; } }
  for(const n of E.npcs){ if(!n||!n.obj) continue; const q=n.obj.position, d=Math.hypot(q.x-px,q.z-pz); if(d>3) continue; let skip=null;
    if(!n.talk) skip='不能說話'; else if(n.hidden) skip='hidden'; else if(Math.abs(q.y-py)>1.4) skip='高度';
    const bias=n.yieldIt?null:(!best||best.seat?0.5:(n.staff&&best.counter?9:0)); out.push({k:'人',label:n.talkLabel||('和'+(n.name||'')+'說話'),id:n.charId||n.id||'',x:f2(q.x),z:f2(q.z),d:f2(d),R:2.2,bias,score:bias==null?null:f2(d-bias),inR:d<2.2,skip,yieldIt:!!n.yieldIt,extra:!!n.isExtra,seat:n.seat?[f2(n.seat.x),f2(n.seat.z)]:null}); }
  out.sort((a,b)=>((a.skip||!a.inR)?1:0)-((b.skip||!b.inR)?1:0)||((a.score==null?9e9:a.score)-(b.score==null?9e9:b.score)));
  const ni=E.nearestInteractable(); return {player:[f2(px),f2(pz),plv], nearest:ni?(ni.label||''):null, list:out}; })()"""
SEAT_DIAG_JS = r"""(q=>{ const E=GAME.E, f2=v=>+(+v).toFixed(3); const near=(a)=>a&&Math.hypot(a.x-q.x,a.z-q.z)<0.4;
  const crowdKeys=n=>Object.keys(n).filter(k=>/crowd/i.test(k)).concat(/crowd/i.test(String(n.id||'')+String(n.charId||'')+String(n.name||''))?['(id／名字)']:[]);
  const who=(E.npcs||[]).filter(n=>n&&(near(n.seat)||near(n.seatTarget))).map(n=>({id:n.charId||n.id||'', name:n.name||'', how:near(n.seat)?'seat':'seatTarget', crowd:crowdKeys(n), extra:!!n.isExtra, x:f2(n.obj.position.x), z:f2(n.obj.position.z)}));
  const zs=((E.zone&&E.zone.seats)||[]).filter(st=>near(st)).map(st=>({x:f2(st.x),z:f2(st.z),lv:st.lv|0,taken:st.taken||null,label:st.label||null}));
  const its=(E.interactables||[]).filter(i=>i.seat&&near(i.seat)).map(i=>({label:i.label,x:f2(i.x),z:f2(i.z),r:i.radius,hidden:!!i.hidden}));
  return {seat:[q.x,q.z], 佔的人:who, 'E.zone.seats':zs, '互動點':its}; })"""


async def scores(pg, tag, top=8):
    sc = await pg.evaluate(SCORE_JS)
    R.note('%s 【互動點分數】玩家 %s、遊戲選的「%s」；照 nearestInteractable 同一套（距離−prio；人＝距離−bias，座位贏的時候 bias 0.5；skip＝不算的原因）由小到大：%s' % (tag, J(sc['player']), sc['nearest'], J(sc['list'][:top])))
    return sc


async def go_btn(pg, cdp, tag, prefix, lv=0):
    """r3：走到店裡真的互動點（label 開頭是 prefix 的那一個，不用寫死座標）；中心看不到這個鍵（被座位、和人說話搶走）就在它的範圍裡換幾個點試。回傳最後的狀態"""
    its = await pg.evaluate(ITS_JS)
    it = next((x for x in its if x['label'].startswith(prefix) and (x['lv'] | 0) == lv), None)
    if not R.check('%s 店裡有「%s…」的互動點' % (tag, prefix), bool(it), J([x['label'] for x in its])): return await D.st(pg)
    R.note('%s 「%s」互動點在 (%.2f, %.2f) 半徑 %s' % (tag, it['label'], it['x'], it['z'], it['r']))
    pts = [(it['x'], it['z'])]
    for rr in (0.3, 0.5, 0.7):
        if rr > it['r'] * 0.9: break
        for a in range(0, 360, 45): pts.append((it['x'] + rr * math.sin(math.radians(a)), it['z'] + rr * math.cos(math.radians(a))))
    tried = []
    for x, z in pts:
        ok = await pg.evaluate("(q=>GAME.E.canStand(q[0],q[1],0.3,q[2]))", [x, z, lv])
        if not ok: continue
        await joy(pg, cdp, '%s 走到「%s」' % (tag, prefix), x, z, near=0.2, lv=lv, max_s=40)
        s = await F.wait_btn(pg, prefix, 2)
        tried.append([round(x, 2), round(z, 2), s['interact']])
        if s['interact'].startswith(prefix): break
    if len(tried) > 1: R.note('%s 找「%s」的鍵試過的點：%s' % (tag, prefix, J(tried)))
    return await D.st(pg)


async def shot(pg, name):
    await D.shot(pg, name, judge_black=False); R.note('[截圖] %s.png' % name)


async def errs_check(tag, errs, n0):
    new = errs[n0:]
    R.check('[%s] 沒有 JS 例外（pageerror）' % tag, not new, J(new[:5]))


# ---------------------------------------------------------------- 手機邀約
async def open_invite(pg, cdp, who):
    await pe.phone(pg, cdp, 'friends')
    ok = await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who)
    await pg.wait_for_timeout(1200); await drain(pg)
    o = await wait_opts(pg, cdp, 10)
    R.check('手機「朋友」→ %s「約」→ 出現選單' % who, ok and bool(o), J([x['t'] for x in o]))
    return o


async def back_out(pg, cdp):
    for _ in range(8):
        o = await opts(pg)
        if not o: break
        k = next((i for i, x in enumerate(o) if x['t'] in ('返回', '算了', '換一天', '下次再說')), None)
        if k is None: break
        await tap_opt(pg, cdp, k, '退出')
    await run_dialog(pg, cdp, secs=6); await pe.close_phone(pg, cdp); await drain(pg)


# ---------------------------------------------------------------- MENU
async def part_menu(pg, cdp):
    print('== MENU', flush=True)
    s = base('2025-11-03', 10.0, 'wenzhou', *WZ_START, yaw=math.pi)
    await load(pg, cdp, '【前置】MENU 週一上午、人在溫州街', s)
    vis = await pg.evaluate("(()=>({mok:!!(GAME.G.visited||{}).wz_mokuyobi, place:(()=>{ const P=INV.place('slowread'); return P?{zone:P.zone,name:P.name,verb:P.verb,cats:P.cats,timesBy:P.timesBy,off:P.off}:null; })(), mok2:(()=>{ const P=INV.place('mokuyobi'); return P?{verb:P.verb,verbStudy:P.verbStudy||null,cats:P.cats}:null; })()}))()")
    R.note('（參考，不判）G.visited.wz_mokuyobi＝%s；INV.place(slowread)＝%s；INV.place(mokuyobi)＝%s' % (vis['mok'], J(vis['place']), J(vis['mok2'])))
    top = await open_invite(pg, cdp, 'heroine_01')
    cat = next((x for x in top if x['t'].startswith('念書')), None)
    R.check('MENU 第一層有「念書…」', bool(cat), J(top))
    if not cat: await back_out(pg, cdp); return
    R.note('MENU 「念書…」的小字：%s' % cat['hint'])
    await tap_word(pg, cdp, '念書'); st = await wait_opts(pg, cdp)
    await shot(pg, 'menu_study')
    mains = [x['t'] for x in st]
    R.check('MENU 「念書…」裡有「去木曜日念書」（按鈕字逐字）', '去木曜日念書' in mains, J(st))
    it = next((x for x in st if x['t'] == '去木曜日念書'), None)
    if it: R.check('MENU 「去木曜日念書」不是灰的', not it['dim'], J(it))
    R.check('MENU 「念書…」裡沒有「慢讀」（舊店名、舊地點）', not any('慢讀' in x['t'] or '慢讀' in x['hint'] for x in st), J(st))
    R.check('MENU 「念書…」裡沒有「大學食堂」（118 巷原址不能約念書）', not any('大學食堂' in x['t'] or '大學食堂' in x['hint'] for x in st), J(st))
    R.check('MENU 「念書…」裡「木曜日」只有一個', sum(1 for x in st if '木曜日' in x['t']) == 1, J(mains))
    await tap_word(pg, cdp, '返回')
    o = await wait_opts(pg, cdp)
    if any(x['t'].startswith('喝咖啡') for x in o):
        await tap_word(pg, cdp, '喝咖啡'); sit = await wait_opts(pg, cdp)
        await shot(pg, 'menu_sit')
        sm = [x['t'] for x in sit]
        R.check('MENU 「喝咖啡、喝茶…」有「去木曜日坐坐」（木曜日原本的地點還在）', '去木曜日坐坐' in sm, J(sit))
        R.check('MENU 「喝咖啡、喝茶…」沒有「去木曜日念書」、沒有「慢讀」「大學食堂」', '去木曜日念書' not in sm and not any('慢讀' in t or '大學食堂' in t for t in sm), J(sm))
    else:
        R.check('MENU 第一層有「喝咖啡、喝茶…」', False, J(o))
    await back_out(pg, cdp)


# ---------------------------------------------------------------- SLOTS
async def time_menu(pg, cdp, who='heroine_01'):
    top = await open_invite(pg, cdp, who)
    if not any(x['t'].startswith('念書') for x in top): return None
    await tap_word(pg, cdp, '念書'); await wait_opts(pg, cdp)
    if not await tap_word(pg, cdp, '去木曜日念書'): return None
    return await wait_opts(pg, cdp)


def times_of(o):
    return [x for x in o if x['t'].startswith('今天') or x['t'].startswith('明天') or x['t'].startswith('現在')]


async def part_slots(pg, cdp):
    print('== SLOTS', flush=True)
    CASES = [('2025-11-03', '週一', ['今天 15:30', '今天 19:00', '明天 15:30', '明天 19:00'], ['明天']),
             ('2025-11-08', '週六', ['今天 14:00', '今天 15:30', '今天 19:00', '明天 14:00', '明天 15:30', '明天 19:00'], []),
             ('2025-11-04', '週二', ['今天 15:30', '今天 19:00', '明天 15:30', '明天 19:00'], ['今天'])]
    for key, wd, want, off in CASES:
        tag = 'SLOTS %s（%s）' % (key, wd)
        s = base(key, 10.0, 'wenzhou', *WZ_START, yaw=math.pi)
        await load(pg, cdp, '【前置】%s 上午 10:00' % tag, s)
        o = await time_menu(pg, cdp)
        if o is None: R.check('%s 打得開「去木曜日念書」的時間選單' % tag, False); await back_out(pg, cdp); continue
        T = times_of(o)
        R.note('%s 時間選項逐字：%s' % (tag, J(o)))
        await shot(pg, 'slots_%s' % key)
        R.check('%s 時間選項＝%s（逐字、照順序）' % (tag, J(want)), [x['t'] for x in T] == want, J([x['t'] for x in T]))
        R.check('%s 最後兩個是「其他日子…」「算了」' % tag, [x['t'] for x in o[-2:]] == ['其他日子…', '算了'], J([x['t'] for x in o]))
        for x in T:
            closed = any(x['t'].startswith(p) for p in off)
            if closed:
                R.check('%s 「%s」（週二）灰掉、小字「木曜日週二休」' % (tag, x['t']), x['dim'] and x['hint'] == '木曜日週二休', J(x))
            else:
                R.check('%s 「%s」不是因為公休灰掉（小字沒有「休」）' % (tag, x['t']), not (x['dim'] and '休' in x['hint']), J(x))
                if x['dim']: R.note('%s 「%s」灰掉但原因不是公休：%s（玩家自己的時段，不算這次的範圍）' % (tag, x['t'], x['hint']))
        if wd == '週二':
            k = next((i for i, x in enumerate(o) if x['t'].startswith('今天')), None)
            if k is not None:
                i0 = len(LOG); await tap_opt(pg, cdp, k, '點灰掉的今天')
                o2 = await wait_opts(pg, cdp)
                R.check('%s 點灰掉的「今天」：說「木曜日週二休。」、留在時間選單（約不到）' % tag, has_say(i0, '木曜日週二休。') and bool(times_of(o2)), J([x['text'] for x in says(i0)]))
            if await tap_word(pg, cdp, '其他日子'):
                dl = await wait_opts(pg, cdp)
                kd = next((i for i, x in enumerate(dl) if '（週二）' in x['t']), None)
                R.check('%s 「其他日子…」裡有下週二（%s）' % (tag, J([x['t'] for x in dl])), kd is not None, J(dl))
                if kd is not None:
                    await tap_opt(pg, cdp, kd, '下週二'); tl = await wait_opts(pg, cdp)
                    tt = [x for x in tl if ':' in x['t']]
                    await shot(pg, 'slots_next_tue')
                    R.check('%s 下週二的時間 %s 全部灰掉、小字「木曜日週二休」' % (tag, J([x['t'] for x in tt])), bool(tt) and all(x['dim'] and x['hint'] == '木曜日週二休' for x in tt), J(tl))
                    if tt:
                        i0 = len(LOG); await tap_opt(pg, cdp, 0, '點下週二灰掉的時間'); await wait_opts(pg, cdp)
                        R.check('%s 點下週二的時間：說「木曜日週二休。」' % tag, has_say(i0, '木曜日週二休。'), J([x['text'] for x in says(i0)]))
        await back_out(pg, cdp)
        iv = await pg.evaluate("(()=>(GAME.G.invites||[]).filter(v=>v.place==='slowread').map(v=>({who:v.who,day:v.day,h:v.h,state:v.state})))()")
        R.check('%s 退出以後沒有約成任何「去木曜日念書」（G.invites 沒有 slowread）' % tag, not iv, J(iv))


# ---------------------------------------------------------------- 木曜日：走進去
async def into_mokuyobi(pg, cdp, tag, target=MOK_IN_SHOP):
    r = await joy(pg, cdp, '%s 溫州街→B4 門口' % tag, WZ_DOOR[0], WZ_DOOR[1], near=0.8)
    if not await press(pg, cdp, tag, '上二樓'): return False
    s = await D.wait_zone(pg, cdp, 'wz_mokuyobi', 40); await pg.wait_for_timeout(2500); await drain(pg)
    if not R.check('%s 到了木曜日（wz_mokuyobi，一樓樓梯）' % tag, s['zone'] == 'wz_mokuyobi', J(s)): return False
    r = await joy(pg, cdp, '%s 爬樓梯進二樓店裡' % tag, target[0], target[1], near=0.7, lv=1, max_s=150)
    if not r['ok'] and (await D.st(pg))['lv'] == 0:
        r = await stair_stuck(pg, cdp, tag, target)
    await run_dialog(pg, cdp, secs=8)
    s = await D.st(pg)
    R.check('%s 搖桿走進二樓店裡（lv1、x>−2.85、站得住、沒有跳）' % tag, s['zone'] == 'wz_mokuyobi' and s['lv'] == 1 and s['x'] > -2.85 and s['stand'] and not r['jumps'], J({k: s[k] for k in ('x', 'z', 'lv', 'stand', 'fb')}))
    return s['lv'] == 1


STUCK_JS = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0; const f2=v=>v==null?null:+(+v).toFixed(2);
  const near=(E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z)<2.5).map(n=>{ const q=n.obj.position; return {id:n.charId||n.id||'', name:n.name||'', x:f2(q.x), z:f2(q.z), y:f2(q.y), lv:n.lv|0, r:n.radius, beh:n.beh||null, pose:n.pose||null,
    walking:!!(n.path&&n.path.length)||(+n.speed||0)>0.01, path:n.path?n.path.length:0, speed:f2(n.speed), seat:!!n.seat, seatTarget:!!n.seatTarget, frozen:!!n.frozen, extra:!!n.isExtra, leaving:!!n.leaving, until:n.until==null?null:n.until,
    goal:n.path&&n.path.length?(Array.isArray(n.path[n.path.length-1])?n.path[n.path.length-1].map(f2):n.path[n.path.length-1]):null, seatAt:n.seat?[f2(n.seat.x),f2(n.seat.z)]:(n.seatTarget?['→',f2(n.seatTarget.x),f2(n.seatTarget.z)]:null)}; });
  const stair=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.position.x>-4.6&&n.obj.position.x<-2.9&&n.obj.position.z>1.4&&n.obj.position.z<7.1).map(n=>({id:n.charId||n.id||'', name:n.name||'', x:f2(n.obj.position.x), z:f2(n.obj.position.z), lv:n.lv|0, beh:n.beh||null, walking:!!(n.path&&n.path.length)}));
  const L=E.levels||[]; const cells=[]; for(let dz=-0.7; dz<=0.31; dz+=0.1){ const z=o.z+dz; cells.push({z:f2(z), s0:E.canStand(o.x,z,0.3,0), s1:L.length>1?E.canStand(o.x,z,0.3,1):null, h0:L[0]&&L[0].heightAt?f2(L[0].heightAt(o.x,z)):null, h1:L[1]&&L[1].heightAt?f2(L[1].heightAt(o.x,z)):null}); }
  const row=[]; for(let dx=-0.5; dx<=0.51; dx+=0.1) row.push({x:f2(o.x+dx), s0:E.canStand(o.x+dx,o.z,0.3,0), s1:L.length>1?E.canStand(o.x+dx,o.z-0.4,0.3,1):null});
  let path=null; try{ const p=E.pathTo(o.x,o.z,lv,0,0.9,1); path=p?p.slice(0,8).map(q=>Array.isArray(q)?q.map(f2):[f2(q.x),f2(q.z),q.lv]):null; }catch(e){ path=String(e); }
  return {pos:{x:f2(o.x),z:f2(o.z),y:f2(o.y),lv}, near, stair, cells, row, path, unstick:window.__ccUnstick|0, fb:GAME.walkFallbacks||0, hour:f2(GAME.G.hour), npcN:(E.npcs||[]).length}; })()"""


async def stair_stuck(pg, cdp, tag, target):
    """r3（CC 06:5x：REG_YT、REG_XC 在 (−3.35, 2.875) lv0 卡住 20 秒）：卡住的當下截圖、列 2.5 m 內的 NPC、那幾格站不站得住、找路、E.unstick 次數；再試兩條路"""
    d = await pg.evaluate(STUCK_JS)
    await shot(pg, 'stuck_' + ''.join(ch for ch in tag if ch.isalnum() and ord(ch) < 128)[:20].lower())
    R.note('%s 【卡住診斷】樓梯間（x −4.6～−2.9、z 1.4～7.1）上的 NPC：%s' % (tag, J(d['stair'])))
    R.note('%s 【卡住診斷】位置 %s；2.5 m 內 NPC %s；往北那幾格（s0／s1＝第 0／1 層站不站得住、h0／h1＝高度）%s；同一列 %s；找路 %s；E.unstick 成功 %s 次；walkFallbacks %s；%s 點' % (tag, J(d['pos']), J(d['near']), J(d['cells']), J(d['row']), J(d['path']), d['unstick'], d['fb'], d['hour']))
    R.check('%s ⚠[P0 候選] 爬木曜日樓梯沒有卡住（搖桿推不動、停在第 0 層 (%s, %s)；旁邊 NPC %d 位）' % (tag, d['pos']['x'], d['pos']['z'], len(d['near'])), False, J({'near': d['near'], 'pos': d['pos']}))
    s0 = await D.st(pg)
    await joy(pg, cdp, '%s 【改走 A】先往樓梯下退 1 m' % tag, s0['x'], s0['z'] + 1.0, near=0.3, lv=0, max_s=20)
    ra = await joy(pg, cdp, '%s 【改走 A】再往上走' % tag, target[0], target[1], near=0.7, lv=1, max_s=60)
    R.note('%s 【改走 A：退 1 m 再走】%s' % (tag, '上得去' if ra['ok'] else '還是卡住'))
    if ra['ok']: return ra
    await pg.wait_for_timeout(10000); d2 = await pg.evaluate(STUCK_JS)
    R.note('%s 【改走 B】等 10 秒，2.5 m 內 NPC：%s' % (tag, J(d2['near'])))
    rb = await joy(pg, cdp, '%s 【改走 B】等 10 秒再走' % tag, target[0], target[1], near=0.7, lv=1, max_s=60)
    R.note('%s 【改走 B：等 10 秒再走】%s' % (tag, '上得去' if rb['ok'] else '還是卡住'))
    if rb['ok']: return rb
    rc = await F.joy_to(pg, cdp, tag + ' 【改走 C】直線推向平台', -3.75, 2.0, near=0.3, lv=1, max_s=40, straight=True); await drain(pg)
    R.note('%s 【改走 C：直線推向平台 (−3.75, 2.0)】%s，停在 %s' % (tag, '到了' if rc['ok'] else '沒到', J({k: rc['end'][k] for k in ('x', 'z', 'lv')})))
    if rc['ok']: return await joy(pg, cdp, '%s 【改走 C】進店' % tag, target[0], target[1], near=0.7, lv=1, max_s=60)
    await shot(pg, 'stuck_final_' + ''.join(ch for ch in tag if ch.isalnum() and ord(ch) < 128)[:20].lower())
    return rc


NPC_JS = r"""(pid=>{ const E=GAME.E, n=(GAME.npc&&GAME.npc[pid])||(E.npcs||[]).find(q=>q.charId===pid); if(!n||!n.obj) return null; const o=n.obj.position;
  let ent=null; try{ const c=CHARACTERS[pid]; const e=c&&STORY.schedEnt?STORY.schedEnt(c,GAME.G):null; ent=e?{zone:e.zone,label:e.label||null,slowread:!!e.slowread,from:e.from,to:e.to}:null; }catch(err){ ent={err:String(err)}; }
  return {x:+o.x.toFixed(2), y:+o.y.toFixed(2), z:+o.z.toFixed(2), lv:n.lv|0, seat:!!n.seat, pose:n.pose||null, name:n.name||null, vis:n.obj.visible!==false, ent}; })"""


async def npc(pg, pid):
    return await pg.evaluate(NPC_JS, pid)


async def look_at(pg, cdp, name, n):
    cam = {'eye': [n['x'] + 1.7, n['y'] + 1.8, n['z'] + 1.5], 'look': [n['x'], n['y'] + 0.9, n['z']], 'lens': 24}
    await F.shot(pg, cdp, name, cam); R.note('[截圖] %s.png（鏡頭對著她，只給人看）' % name)


async def talk(pg, cdp, tag, pid):
    """搖桿走到她旁邊 → 「和…說話」→ 點完；選單選離開那一類。回傳這次的 LOG 起點"""
    n = await npc(pg, pid)
    if not n: R.check('%s 這一區有 %s' % (tag, pid), False); return None
    # r3（CC 06:5x：H3、REG_NW 走過去互動鍵是「坐下」——她坐著，同一桌對面的空位比她近）：從她周圍 8 個方向（0.9 m，站不住就 1.1 m）各試一次，記哪個方向出「和…說話」
    res = []; good = None
    for a in range(0, 360, 45):
        pt = None
        for rr in (0.9, 1.1):
            x, z = n['x'] + rr * math.sin(math.radians(a)), n['z'] + rr * math.cos(math.radians(a))
            if await pg.evaluate("(q=>GAME.E.canStand(q[0],q[1],0.3,q[2]))", [x, z, n['lv']]): pt = (x, z, rr); break
        if not pt: res.append({'方向': a, '結果': '0.9／1.1 m 都站不住'}); continue
        await joy(pg, cdp, '%s 走到 %s 的 %d° 方向 %.1f m' % (tag, pid, a, pt[2]), pt[0], pt[1], near=0.15, lv=n['lv'], max_s=40)
        s = await F.wait_btn(pg, '和', 2)
        res.append({'方向': a, 'at': [s['x'], s['z']], '互動鍵': s['interact']})
        if not s['interact'].startswith('和'):   # BB 07:13：坐著的人旁邊是「坐下」——那張空椅子、她的座位、兩者距離、玩家位置、分數
            ws = await pg.evaluate("(pid=>{ const it=GAME.E.nearestInteractable(); const n=(GAME.npc&&GAME.npc[pid])||(GAME.E.npcs||[]).find(q=>q.charId===pid); const s=n&&n.seat; const f2=v=>+(+v).toFixed(3); return {win:it?{label:it.label||'', seat:it.seat?[f2(it.seat.x),f2(it.seat.z)]:null, at:[f2(it.x),f2(it.z)]}:null, herSeat:s?[f2(s.x),f2(s.z)]:null, gap:(it&&it.seat&&s)?f2(Math.hypot(it.seat.x-s.x,it.seat.z-s.z)):null}; })", pid)
            R.note('%s %d°：贏的是 %s；她的座位 %s；兩張椅子相距 %s m；玩家站在 %s' % (tag, a, J(ws['win']), J(ws['herSeat']), ws['gap'], J([s['x'], s['z'], s['lv']])))
            await scores(pg, '%s %d°' % (tag, a), top=6)
        if s['interact'].startswith('和') and good is None: good = (pt, a)
    R.note('%s 她在 (%.2f, %.2f)；8 個方向的互動鍵：%s' % (tag, n['x'], n['z'], J(res)))
    if not good:
        await shot(pg, 'notalk_' + pid)
        R.check('%s ⚠玩家可能找不到跟她說話的位置（8 個方向都不是「和…說話」，交 BB 判）' % tag, False, J(res)); return None
    R.note('%s 「和…說話」出現的方向：%s' % (tag, J([x['方向'] for x in res if str(x.get('互動鍵', '')).startswith('和')])))
    await joy(pg, cdp, '%s 回到 %d° 方向' % (tag, good[1]), good[0][0], good[0][1], near=0.15, lv=n['lv'], max_s=40)
    s = await F.wait_btn(pg, '和', 5)
    if not R.check('%s 走到她旁邊，互動鍵是「和…說話」' % tag, s['interact'].startswith('和'), J({k: s[k] for k in ('x', 'z', 'lv', 'interact')})): return None
    i0 = len(LOG); print('    [按互動鍵] ' + s['interact'], flush=True)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
    await run_dialog(pg, cdp, secs=40)
    return i0


# ---------------------------------------------------------------- 常客
REG = {'REG_AN': ('heroine_01', 'Y1S2', 6, 14.0, '「（小聲）你也來木曜日？窗邊那桌我先坐了。」'),
       'REG_YT': ('heroine_03', 'Y2S1', 1, 14.0, '「（小聲）我在寫報告。……這裡坐一下午，老闆不會趕人。」'),
       'REG_XC': ('classmate_xinci', 'Y1S1', 4, 15.5, '「（小聲）這裡每一盞桌燈都能調亮度。我試過了。」'),
       'REG_NW': ('pool_17', 'Y1S1', 5, 14.0, '「（小聲）這裡安靜。筆記一攤開，就不想收了。」')}
SCAN_JS = r"""(q=>{ const c=CHARACTERS[q.id]; if(!c) return {err:'沒有 CHARACTERS.'+q.id}; const T=CALENDAR.termDays(q.term); const out=[];
  for(let d=Math.max(T.from,q.min||-1e9); d<=T.to&&out.length<q.n; d++){ const x=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); if(x.wd%7!==q.wd) continue; if(!t||t.exam||t.week<2||t.week>15) continue; if(CALENDAR.holiday(d)||CALENDAR.typhoon(d)) continue;
    const G2=Object.assign({},GAME.G,{day:d,hour:q.h,weekday:q.wd}); let e=null; try{ e=STORY.schedEnt(c,G2); }catch(err){ e={err:String(err)}; }
    out.push({day:d,key:x.key,week:t.week,ent:e?{zone:e.zone||null,label:e.label||null,slowread:!!e.slowread,err:e.err||null}:null}); }
  return {list:out}; })"""


async def pick_reg_day(pg, cdp, tag, pid, term, wd, h):
    s = base('2025-11-03', 10.0, 'wenzhou', *WZ_START, yaw=math.pi)
    await load(pg, cdp, '【前置】%s 先讀一份（只為了在頁面裡查 CALENDAR＋作息）' % tag, s)
    r = await pg.evaluate(SCAN_JS, {'id': pid, 'term': term, 'wd': wd, 'h': h + 0.6, 'n': 14, 'min': 47})   # r3：不挑存檔那天（第 46 天）以前
    R.note('%s %s 學期 週%s %.2f 的候選日（CALENDAR：非假日／颱風／考試週，第 2～15 週）與她的作息：%s' % (tag, term, '日一二三四五六'[wd], h + 0.6, J(r)))
    c = next((x for x in (r.get('list') or []) if x['ent'] and x['ent']['slowread']), None)
    R.check('%s 找得到一天她那時候照作息在木曜日（slowread 那一筆）' % tag, bool(c), J(r))
    return c


async def reg_setup(pg, cdp, tag, part):
    pid, term, wd, h, hi = REG[part]
    c = await pick_reg_day(pg, cdp, tag, pid, term, wd, h)
    if not c: return None
    s = base(c['key'], h + 0.35, 'wenzhou', *WZ_START, yaw=math.pi)
    await load(pg, cdp, '【前置】%s %s（%s 第 %d 週）%05.2f 溫州街木曜日門口外' % (tag, c['key'], term, c['week'], h + 0.35), s)
    if not await into_mokuyobi(pg, cdp, tag): return None
    await pg.wait_for_timeout(2500); await drain(pg)
    n = None
    for _ in range(8):
        n = await npc(pg, pid)
        if n: break
        await pg.wait_for_timeout(1000)
    hr = await pg.evaluate("+(+GAME.G.hour).toFixed(2)")
    R.check('%s %05.2f 木曜日裡有 %s（E.npcs）、在二樓、坐著（作息那一筆是 slowread）' % (tag, hr, pid), bool(n) and n['lv'] == 1 and n['seat'] and bool(n['ent']) and n['ent'].get('slowread'), J(n))
    await shot(pg, '%s_game' % part.lower())
    if n: await look_at(pg, cdp, '%s_her' % part.lower(), n)
    return n


async def part_reg(pg, cdp, part):
    print('== ' + part, flush=True)
    pid, term, wd, h, hi = REG[part]
    tag = '%s（%s）' % (part, pid)
    n = await reg_setup(pg, cdp, tag, part)
    if not n or pid == 'heroine_01': return
    i0 = await talk(pg, cdp, tag, pid)
    if i0 is None: return
    R.check('%s 當面招呼那一句：%s' % (tag, hi), has_say(i0, hi.strip('「」')), J([[x['who'], x['text']] for x in says(i0)]))
    hk = await pg.evaluate("(p=>((GAME.G.flags||{}).SLOWREAD_HI||{})[p]||null)", pid)
    R.check('%s 記 G.flags.SLOWREAD_HI[%s]＝這學期（%s）' % (tag, pid, hk), hk == term, J(hk))


# ---------------------------------------------------------------- H3
H3_LINES = [('老闆', '（小聲）窗邊那桌，她幫你留了。'), (None, '（以安把她的包從旁邊的椅子拿起來。）'), ('以安', '（小聲）這裡沒有插座。報告的資料，我幫你印了一份。')]


async def part_h3(pg, cdp):
    print('== H3', flush=True)
    tag = 'H3（以安窗邊的位子）'
    n = await reg_setup(pg, cdp, tag, 'REG_AN')
    if not n: return
    pre = await pg.evaluate("(()=>({rp:SOCIAL.has('heroine_01','REPORT_PARTNER'), once:((GAME.G.l118||{}).once||{}).H3==null?null:GAME.G.l118.once.H3, due:SLOWREAD.h3Due(GAME.G,'heroine_01'), term:CALENDAR.termOf(GAME.G.day), wd:CALENDAR.dateOf(GAME.G.day).wd%7, h:+(+GAME.G.hour).toFixed(2)}))()")
    R.note('%s 條件（存檔本來的 REPORT_PARTNER；不判，給人看）：%s' % (tag, J(pre)))
    R.check('%s 前置：有 REPORT_PARTNER、還沒演過（once.H3 沒有）、大一下以後、週六下午' % tag, pre['rp'] and pre['once'] is None and pre['wd'] == 6 and 14 <= pre['h'] < 17, J(pre))
    i0 = await talk(pg, cdp, tag + ' 第一次說話', 'heroine_01')
    if i0 is None: return
    ok, k = in_order(i0, H3_LINES)
    R.check('%s 第一次說話：三句照順序（老闆／旁白／以安）：%s' % (tag, J([t for _, t in H3_LINES])), ok, J({'到第幾句': k, 'said': [[x['who'], x['text']] for x in says(i0)]}))
    sp = next((x for x in says(i0) if H3_LINES[1][1] in x['text']), None)
    if sp: R.check('%s 「（以安把她的包…）」是旁白（沒有名字）' % tag, sp['who'] == '', J(sp))
    day = await pg.evaluate("GAME.G.day"); once = await pg.evaluate("(((GAME.G.l118||{}).once)||{}).H3")
    R.check('%s 記 G.l118.once.H3＝今天（%s）' % (tag, day), once == day, J(once))
    await shot(pg, 'h3_after')
    i1 = await talk(pg, cdp, tag + ' 同一天第二次說話', 'heroine_01')
    if i1 is None: return
    R.check('%s 第二次說話：不再演 H3（三句都沒有）' % tag, not any(has_say(i1, t) for _, t in H3_LINES), J([[x['who'], x['text']] for x in says(i1)]))
    R.check('%s 第二次說話：招呼那一句「（小聲）你也來木曜日？窗邊那桌我先坐了。」' % tag, has_say(i1, '（小聲）你也來木曜日？窗邊那桌我先坐了。'), J([[x['who'], x['text']] for x in says(i1)]))


# ---------------------------------------------------------------- CAFE2
IT_JS = r"""(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label||'', x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), lv:i.lv|0, seat:!!i.seat, study:!!(i.study||i.deskStudy||(i.seat&&(i.seat.study||i.seat.canStudy))), look:i.look?String(i.look).slice(0,80):null, shop118:i.shop118||null, exit:i.exit?i.exit.to:null})))()"""


async def part_cafe2(pg, cdp):
    print('== CAFE2', flush=True)
    tag = 'CAFE2（118 巷原址大學食堂）'
    dx, dz = L118_DOOR['cafe2']
    s = base('2025-11-03', 11.9, 'lane118', -2.4, dz + 2.6, yaw=-math.pi / 2)
    await load(pg, cdp, '【前置】%s 週一 11:54、118 巷大學食堂門口旁' % tag, s)
    await joy(pg, cdp, tag + ' 走到店門', dx, dz, near=0.8)
    if not await press(pg, cdp, tag, '進大學食堂'): return
    s1 = await D.wait_zone(pg, cdp, 'l118_cafe2', 30); await pg.wait_for_timeout(2500); await drain(pg)
    if not R.check('%s 進到 l118_cafe2' % tag, s1['zone'] == 'l118_cafe2', J(s1)): return
    its = await pg.evaluate(IT_JS)
    R.note('%s 店裡的互動鍵：%s' % (tag, J([x['label'] for x in its])))
    BADW = ('念書', '讀書', '看書', '書架', '書櫃', '自習', '咖啡', '慢讀')
    bad = [x for x in its if any(w in x['label'] for w in BADW)]
    R.check('%s 店裡每個互動鍵（%d 個，新室內）都沒有念書類（%s）' % (tag, len(its), '／'.join(BADW)), not bad, J(bad))
    R.check('%s 座位（%d 張）都不是讀書座位（interactable／seat 的 study、canStudy 都沒有）' % (tag, sum(1 for x in its if x['seat'])), not any(x['seat'] and x['study'] for x in its), J([x for x in its if x['seat'] and x['study']][:4]))
    lk = [x for x in its if x['look'] and any(w in x['look'] for w in ('念書', '讀書', '咖啡'))]
    R.note('%s （參考）「看」的旁白提到念書／讀書／咖啡的：%s' % (tag, J(lk)))
    await shot(pg, 'cafe2_inside')
    seats = [x for x in its if x['seat']]
    for q in seats[:4]:   # r2（CC 06:4x）：第一張的 seatApproach 上互動鍵是「點餐」（被櫃台搶走）——記下來，換下一張，最多試 4 張
        ap = await pg.evaluate("(q=>{ const it=GAME.E.interactables.find(i=>i.seat&&Math.abs(i.x-q.x)<0.01&&Math.abs(i.z-q.z)<0.01); const a=it&&GAME.seatApproach?GAME.seatApproach(it.seat):null; return a?[a[0],a[1]]:[q.x,q.z]; })", q)
        await joy(pg, cdp, tag + ' 走到座位「%s」(%.2f,%.2f)' % (q['label'], q['x'], q['z']), ap[0], ap[1], near=0.35)
        stq = await D.st(pg)
        if not stq['interact'].startswith(q['label'][:2]):
            sd = await pg.evaluate(SEAT_DIAG_JS, {'x': q['x'], 'z': q['z']})   # BB 07:13：佔的人（有 crowd 字串？）、E.zone.seats 那一張的 taken、那個位置的座位互動點（有沒有、hidden）
            R.note('%s 【座位被搶診斷】%s（有人佔＝不是 bug；互動點不見、或空椅子也被搶＝bug）' % (tag, J(sd))); await scores(pg, tag)
            await shot(pg, 'cafe2_seat_stolen_%d' % seats.index(q))
            R.note('%s ⚠座位 (%.2f,%.2f) 的走近點 %s 上，互動鍵是「%s」不是「%s」（交 BB／L118A SEATS 對照）' % (tag, q['x'], q['z'], J(ap), stq['interact'], q['label'])); continue
        if await press(pg, cdp, tag, q['label'][:2]):
            i0 = len(LOG); await pg.wait_for_timeout(2500); await drain(pg)
            o = await opts(pg); st1 = await D.st(pg)
            allo = [x['t'] for e in LOG[i0:] if e['k'] == 'opts' for x in e['opts']] + [x['t'] for x in o]
            R.note('%s 坐下以後的選項：%s；互動鍵：%s' % (tag, J(allo), st1['interact']))
            R.check('%s 坐下以後沒有「讀書／念書」' % tag, not any('讀書' in t or '念書' in t for t in allo + [st1['interact']]), J(allo))
            await run_dialog(pg, cdp, pick=lambda o: next((i for i, x in enumerate(o) if x['t'].startswith('起身')), None), secs=12)
            st2 = await D.st(pg)
            if st2['seat'] and st2['interact'].startswith('起身'): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        break
    await go_btn(pg, cdp, tag, '點餐')   # r2／r3：照店裡真的互動點（新室內），範圍裡換點找鍵
    s0 = await press(pg, cdp, tag, '點餐')
    if s0:
        i0 = s0['i0']
        await run_dialog(pg, cdp, pick=lambda o: next((i for i, x in enumerate(o) if x['t'].startswith('不用了')), None), secs=30)
        menus = [e['opts'] for e in LOG[i0:] if e['k'] == 'opts' and any('元' in x['t'] for x in e['opts'])]
        R.note('%s 點餐選單：%s' % (tag, J(menus)))
        R.check('%s 點餐選單是秤重自助餐、沒有咖啡／拿鐵／蛋糕' % tag, bool(menus) and not any(w in x['t'] for m in menus for x in m for w in ('咖啡', '拿鐵', '蛋糕')), J(menus))


# ---------------------------------------------------------------- ORIG
async def part_orig(pg, cdp):
    print('== ORIG', flush=True)
    R.note('ORIG 木曜日原本的事件（src/mokuyobi_sys3d.js）：1-1 第一次進門（S.L.first）、1-2 點東西（S.order，坐下或吧檯）、1-3 讀完旁白（S.narr）、1-4 老位子／21:40 溫水／閒聊、'
           '1-5 考試週進門那一句＋柏翰／明軒／芯慈、22:00 打烊、1-6 兩個人來（S.meetScene，地點 mokuyobi）、1-7 雨天（S.rainScene）、看看書櫃／看唱片機／看海報（S.look）。這段演 1-1、1-2、看書櫃；1-6、1-7 在 NOSIT_REF')
    tag = 'ORIG'
    s = base('2025-11-08', 14.5, 'wenzhou', *WZ_START, yaw=math.pi)
    mk = dict(s.get('mokuyobi') or {}); mk.pop('first', None); mk['n'] = 0; mk['seats'] = {}; mk.pop('last', None); s['mokuyobi'] = mk
    await load(pg, cdp, '【前置】ORIG 週六 14:30、清掉 G.mokuyobi.first／n／seats（當作第一次來）', s)
    i0 = len(LOG)
    if not await into_mokuyobi(pg, cdp, tag): return
    FIRST = [(None, '（窄樓梯走上二樓。門上的鈴響了一下。）'), (None, '（店裡很安靜。六七個人各坐一桌，大部分在看書、寫筆記。黑膠唱片機在放鋼琴。）'),
             ('老闆', '（小聲）一位？窗邊那桌剛好空。'), ('老闆', '（小聲）我們沒有插座，要充電的話樓下便利商店有。')]
    ok, k = in_order(i0, FIRST)
    R.check('ORIG 1-1 第一次進門四句照順序（旁白兩句、老闆兩句）', ok, J({'到第幾句': k, 'said': [[x['who'], x['text']] for x in says(i0)]}))
    f = await pg.evaluate("((GAME.G.mokuyobi||{}).first)"); d = await pg.evaluate("GAME.G.day")
    R.check('ORIG 1-1 記 G.mokuyobi.first＝今天', f == d, J(f))
    await joy(pg, cdp, tag + ' 走到吧檯', MOK_BAR[0], MOK_BAR[1], near=0.5, lv=1)
    s0 = await press(pg, cdp, tag, '點東西')
    if s0:
        i1 = s0['i0']; o = await wait_opts(pg, cdp)
        R.check('ORIG 1-2 吧檯「點東西」三樣＋什麼都不點（逐字）', [x['t'] for x in o] == ['焙茶拿鐵　150 元', '焦糖布丁　120 元', '巴斯克乳酪蛋糕　140 元', '什麼都不點'], J(o))
        await shot(pg, 'orig_order')
        if o: await tap_opt(pg, cdp, 0, '焙茶拿鐵')
        await run_dialog(pg, cdp, secs=20)
        R.check('ORIG 1-2 點焙茶拿鐵：「（焙茶拿鐵上面有一層很細的奶泡。）」', has_say(i1, '（焙茶拿鐵上面有一層很細的奶泡。）'), J([x['text'] for x in says(i1)]))
    await joy(pg, cdp, tag + ' 走到書櫃', MOK_BOOK[0], MOK_BOOK[1], near=0.5, lv=1)
    s0 = await press(pg, cdp, tag, '看看書櫃')
    if s0:
        i2 = s0['i0']; await run_dialog(pg, cdp, secs=15)   # r3：從按之前算（那一句在按下去 700 ms 內就出來）
        BOOK = ['（書櫃上的書都很舊，書背褪成差不多的顏色。有一本詩集夾著別人留下的書籤。）', '（最下面一層貼著一張紙：「可以拿下來看，看完請放回原位。」）', '（你抽出一本小說，翻了兩頁，又放回去。旁邊那個人抬頭看了你一眼，又低頭讀書。）']
        R.check('ORIG 看看書櫃：AA_645 的三句之一', any(has_say(i2, t) for t in BOOK), J([x['text'] for x in says(i2)]))


# ---------------------------------------------------------------- NOSIT／NOSIT_REF
PICK_JS = r"""(q=>{ const out=[]; for(const who of q.whos){ const P=INV.place(q.pid); if(!P){ out.push({who,err:'沒有地點 '+q.pid}); continue; }
    for(const h of q.hs){ let r=null; try{ const d=INV.decide(GAME.G,who,P.id,GAME.G.day,h); r=INV.personal(GAME.G,who,P,GAME.G.day,h,d); }catch(e){ r={res:'err',why:String(e)}; }
      out.push({who,h,res:r&&r.res,why:r&&r.why||null,lines:r&&r.lines||null,dating:!!((GAME.G.flags||{})['dating_'+who])}); } }
  return out; })"""


async def part_nosit(pg, cdp, ref):
    part = 'NOSIT_REF' if ref else 'NOSIT'
    print('== ' + part, flush=True)
    pid, cat, verb = ('mokuyobi', '喝咖啡', '去木曜日坐坐') if ref else ('slowread', '念書', '去木曜日念書')
    tag = '%s（地點 %s「%s」）' % (part, pid, verb)
    s = base('2025-11-08', 10.0, 'wenzhou', *WZ_START, yaw=math.pi, weather='rain')
    await load(pg, cdp, '【前置】%s 週六 10:00、下雨' % tag, s)
    cand = await pg.evaluate(PICK_JS, {'whos': NOSIT_WHO, 'pid': pid, 'hs': [15.5, 19.0, 14.0]})   # r2（CC 06:4x）：「坐坐」週末沒有 14:00（12:10／15:30／17:30／19:00／21:00），念書和坐坐共有的 15:30、19:00 排前面
    R.note('%s 誰今天哪個時間會答應（INV.decide＋INV.personal，照玩家會按的選項先查）：%s' % (tag, J(cand)))
    c = next((x for x in cand if x.get('res') == 'accept'), None)
    if not R.check('%s 候選 %s 裡有人今天 14:00／15:30／19:00 會答應' % (tag, J(NOSIT_WHO)), bool(c), J(cand)): return
    who, h = c['who'], c['h']
    if not c['dating']:
        await pg.evaluate("(w=>{ const F=GAME.G.flags; F['dating_'+w]=true; const R=F.romance||(F.romance={}); R[w]=Object.assign({},R[w]||{},{status:'dating'}); })", who)
        R.setup('%s【捷徑】%s 設成交往中（雨天那一段要交往中）' % (tag, who))
    hh = '%02d:%02d' % (int(h), round((h % 1) * 60))
    top = await open_invite(pg, cdp, who)
    if not any(x['t'].startswith(cat) for x in top): R.check('%s 第一層有「%s…」' % (tag, cat), False, J(top)); await back_out(pg, cdp); return
    await tap_word(pg, cdp, cat); await wait_opts(pg, cdp)
    if not await tap_word(pg, cdp, verb): R.check('%s 有「%s」' % (tag, verb), False); await back_out(pg, cdp); return
    await wait_opts(pg, cdp)
    i_acc = len(LOG)
    if not await tap_word(pg, cdp, '今天 ' + hh): R.check('%s 有「今天 %s」' % (tag, hh), False); await back_out(pg, cdp); return
    await run_dialog(pg, cdp, pick=lambda o: next((i for i, x in enumerate(o) if x['t'].startswith('好，就')), None), secs=20)
    await pe.close_phone(pg, cdp)
    iv = await pg.evaluate("(q=>(GAME.G.invites||[]).filter(v=>v.who===q.w&&v.place===q.p&&v.day===GAME.G.day).map(v=>({id:v.id,h:v.h,zone:v.zone,state:v.state})).pop()||null)", {'w': who, 'p': pid})
    if not R.check('%s 約成了：%s %s（%s）' % (tag, who, hh, pid), bool(iv) and iv['zone'] == 'wz_mokuyobi', J({'iv': iv, 'said': [x['text'] for x in says(i_acc)]})): return
    await pg.evaluate("(h=>{ GAME.G.hour=h; })", iv['h'] - 0.17); await pg.wait_for_timeout(1200)
    R.setup('%s【捷徑】時間撥到約好的前 10 分鐘（%.2f）' % (tag, iv['h'] - 0.17))
    await pe.phone(pg, cdp, 'today')
    i0 = len(LOG)
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id']):
        R.check('%s 手機「今天」有「現在過去」' % tag, False); await pe.close_phone(pg, cdp); return
    print('    [按] 手機「今天」現在過去', flush=True)
    await pg.wait_for_timeout(1500); await drain(pg)
    if await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"):   # r3：手機還開著（遊戲暫停、蓋住「直接過去」選單）＝像玩家一樣收起來
        await pe.close_phone(pg, cdp); R.note('%s 按了「現在過去」手機還開著：收起來' % tag)
    t0 = time.time(); sat = False; reopen = 0; same = [None, 0]
    while time.time() - t0 < 600:
        await drain(pg); q = await L.state(pg)
        if not q['dlg'] and not q['choices'] and await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"):
            reopen += 1; await pe.close_phone(pg, cdp)
            if reopen > 6: break
            continue
        v = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{st:v.state, ph:v.lead&&v.lead.ph||null}:null; })", iv['id'])
        if await pg.evaluate("!!GAME.E.player.seat"): sat = True
        if v and v['st'] in ('done', 'met', 'over') and not q['dlg'] and not q['busy'] and not q['choices']: break
        if q['choices']:
            o = await opts(pg); k = next((i for i, x in enumerate(o) if x['t'].startswith('直接過去')), None)
            if k is None: k = next((i for i, x in enumerate(o) if not x['dim'] and not any(w in x['t'] for w in EXIT_WORDS)), 0)
            sig = (o[k]['t'], q['zone'], q['hour'])
            same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6:   # r3：同一個選項按了 6 次、時間和區域都沒變＝按不到（r2 按了 500 多次）——記下來、停
                cov = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); if(!b) return null; const r=b.getBoundingClientRect(); const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {hit:!!h&&(h===b||b.contains(h)), top:h?(h.id||h.className||h.tagName):null, phone:!document.getElementById('phone').classList.contains('hide'), paused:!!GAME.E.paused}; })()")
                await shot(pg, '%s_stuckopt' % part.lower())
                R.check('%s 「%s」按得下去（同一個選項按了 6 次沒有反應）' % (tag, o[k]['t']), False, J(cov)); break
            await tap_opt(pg, cdp, k, '赴約中'); continue
        if v and (v['ph'] == 'wait' or (v['st'] == 'accepted' and not v['ph'])) and not q['busy']:
            n = await npc(pg, who)
            if n: await joy(pg, cdp, '%s 走到 %s 旁邊' % (tag, who), n['x'], n['z'], near=1.6, lv=n['lv'], max_s=60); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        await pg.wait_for_timeout(500)
    await drain(pg)
    v = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{st:v.state,zone:GAME.G.zone,h:+(+GAME.G.hour).toFixed(2)}:null; })", iv['id'])
    R.check('%s 赴約演完（邀約 done、在木曜日、坐下過）' % tag, bool(v) and v['st'] == 'done' and v['zone'] == 'wz_mokuyobi' and sat, J({'v': v, 'sat': sat}))
    await shot(pg, '%s_meet' % part.lower())
    meet = says(i0)
    R.note('%s 見面這一段逐字：%s' % (tag, J([[x['who'], x['text']] for x in meet])))
    first = await pg.evaluate("(w=>{ const D=(MOKS.DATE||{})[w]; return {first:D?D.first:null, line:D?D.line:null, fr:(MOKS.FRIEND||{})[w]||null, call:MOKS.callName(w)}; })", who)
    seated = [t for t in ('坐在窗邊那桌，已經點好了。', '坐在靠書櫃那桌，已經點好了。') if any(t in x['text'] for x in meet)]
    dl = [t for t in (first['first'], first['line'], first['fr']) if t and any(t in x['text'] for x in meet)]
    if ref:
        R.check('%s 對照：「坐坐」的進門旁白有出現（「（%s坐在…那桌，已經點好了。）」）' % (tag, first['call']), bool(seated), J(seated))
        R.note('%s 對照：MOKS.DATE 那一句（第一次／之後隨機）出現了 %s' % (tag, J(dl)))
    else:
        R.check('%s 不演「坐坐」的進門旁白（「…坐在窗邊那桌／靠書櫃那桌，已經點好了。」都沒有）' % tag, not seated, J(seated))
        R.check('%s 不演「坐坐」見面那一句（MOKS.DATE／FRIEND：%s）' % (tag, J([first['first'], first['line'], first['fr']])), not dl, J(dl))
        R.check('%s 也沒有「在木曜日坐坐。」那句一般旁白' % tag, not any('在木曜日坐坐' in x['text'] for x in meet), J([x['text'] for x in meet]))
    # 下樓離開（雨天）
    await run_dialog(pg, cdp, pick=lambda o: next((i for i, x in enumerate(o) if x['t'].startswith('起身')), None), secs=10)
    st1 = await D.st(pg)
    if st1['seat'] and st1['interact'].startswith('起身'): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    w = await pg.evaluate("GAME.G.weather")
    if w != 'rain':
        await pg.evaluate("(()=>{ GAME.G.weather='rain'; })()"); R.setup('%s【捷徑】天氣變成 %s，改回下雨' % (tag, w))
    due = await pg.evaluate("(()=>{ const iv=MOKS.rainDue(GAME.G); return iv?{place:iv.place,who:iv.who}:null; })()")
    R.note('%s 離開前 MOKS.rainDue＝%s（參考）' % (tag, J(due)))
    await joy(pg, cdp, tag + ' 下樓到樓梯口', MOK_EXIT[0], MOK_EXIT[1], near=0.6, lv=0, max_s=150)
    i3 = len(LOG)
    if not await press(pg, cdp, tag, '離開木曜日'): return
    await run_dialog(pg, cdp, pick=lambda o: 0, secs=40)
    await D.wait_zone(pg, cdp, 'wenzhou', 30); await drain(pg)
    rain = any('（下樓的時候，外面的雨變大了。兩個人站在樓梯口的鐵門裡面。）' in x['text'] for x in says(i3))
    z = await pg.evaluate("GAME.G.zone")
    if ref: R.check('%s 對照：下雨、交往中按「離開木曜日」＝雨天那一段有演' % tag, rain, J([x['text'] for x in says(i3)]))
    else: R.check('%s 下雨、交往中按「離開木曜日」：不演雨天那一段' % tag, not rain, J([x['text'] for x in says(i3)]))
    R.check('%s 走出去到溫州街' % tag, z == 'wenzhou', J(z))


# ---------------------------------------------------------------- H1／H4／H5／H6
SHOPS = {
    'H1': {'shop': 'drink_a', 'key': '2025-11-03', 'h': 12.43, 'comp': None, 'name': '喝不喝咖啡', 'inside': False,
           'lines': [('店員', '剛剛那個學姊，你認識喔？'), ('店員', '她每天這個時間來。無糖綠茶，去冰。從來沒換過。')], 'after': [('店員', '對啊。我都在她走到窗口以前就做好了。')]},
    'H4': {'shop': 'korea', 'key': '2025-11-03', 'h': 12.25, 'comp': 'zhe', 'name': '清州刀削麵', 'inside': True,
           'lines': [('阿哲', '欸，118 巷四間都吃過了。'), ('阿哲', '我的排名：這間第一。……你的呢？')], 'after': [('阿哲', '英雄所見略同。老闆，他也是大碗。')]},
    'H5': {'shop': 'tea', 'key': '2025-11-04', 'h': 12.25, 'comp': 'yu', 'name': '辛亥韓食', 'inside': True,
           'lines': [('老闆', 'Alison 又帶朋友來了。小菜多一盤。')], 'after': []},
    'H6': {'shop': 'cafe2', 'key': '2025-11-03', 'h': 12.22, 'comp': 'classmate_bohan', 'name': '大學食堂', 'inside': True,
           'lines': [('柏翰', '十二點四十了。'), ('柏翰', '……今天等你五分鐘。')], 'after': []},
}


def shop_pre(part, s):
    d = s['day']; l1 = s['l118']
    for k in ('n', 'd', 'last', 'w', 'once'): l1[k] = dict(l1.get(k) or {})
    l1['once'].pop(part, None)
    if part == 'H1':
        s['flags'].pop('SIS_TEA_ORDER', None)
    if part == 'H4':
        for sh in ('korea', 'dian', 'tea', 'home'): l1['w']['zhe@' + sh] = {'n': 1, 'd0': d - 14, 'd': d - 7}
        s['flags'].pop('ZHE_118_RANK', None)
    if part == 'H6':
        l1['w']['classmate_bohan@cafe2'] = {'n': 2, 'd0': d - 14, 'd': d - 7}
    return {'H1': '刪 SIS_TEA_ORDER', 'H4': 'G.l118.w 阿哲 korea／dian／tea／home 各 1 次（上週）、刪 ZHE_118_RANK', 'H5': '（沒有別的）', 'H6': 'G.l118.w 柏翰 cafe2 2 次（上週）'}[part]


def menu_pick(o):
    if any('要我幫忙' in x['t'] for x in o):   # 順手的事（SIDEQ）店員偶爾開口：這段不測它，選「……加油。」
        return next((i for i, x in enumerate(o) if '加油' in x['t']), len(o) - 1)
    k = next((i for i, x in enumerate(o) if '元' in x['t'] and not x['dim']), None)
    if k is not None: return k
    return 0 if o and o[0]['t'].startswith('「') else None   # H1／H4 的選項（「她很固定。」／「這間第一。」）選第一個


async def part_shop(pg, cdp, part):
    print('== ' + part, flush=True)
    c = SHOPS[part]; shop = c['shop']; dx, dz = L118_DOOR[shop]
    tag = '%s（%s %s）' % (part, shop, c['name'])
    sx = 2.4 if dx > 0 else -2.4
    s = base(c['key'], c['h'], 'lane118', sx, dz + 2.6, yaw=(math.pi / 2 if dx > 0 else -math.pi / 2))
    why = shop_pre(part, s)
    g = await load(pg, cdp, '【前置】%s %s %05.2f、118 巷店門口旁；%s' % (tag, c['key'], c['h'], why), s)
    pre = await pg.evaluate("(q=>({h1:q.p==='H1'?L118.H1_SHOP:null, met5:SOCIAL.metD?SOCIAL.metD('heroine_05'):null, comp:q.c?{met:SOCIAL.has(q.c,'FIRST_MET'), reg:L118.regularsAt(GAME.G,q.s).map(r=>r.id)}:null, open:L118.isOpen(q.s,GAME.G)}))", {'p': part, 'c': c['comp'], 's': shop})
    R.note('%s 條件（參考）：%s' % (tag, J(pre)))
    if c['comp']:
        n = None
        for _ in range(15):
            n = await npc(pg, c['comp'])
            if n: break
            await pg.wait_for_timeout(1000)
        R.check('%s %s 是常客、站在店門口（L118.populate）' % (tag, c['comp']), bool(n), J(n))
    await joy(pg, cdp, tag + ' 走到店門', dx, dz, near=0.8)
    if c['inside']:
        if not await press(pg, cdp, tag, '進' + c['name']): return
        s1 = await D.wait_zone(pg, cdp, 'l118_' + shop, 30); await pg.wait_for_timeout(2500); await drain(pg)
        if not R.check('%s 進到 l118_%s' % (tag, shop), s1['zone'] == 'l118_' + shop, J(s1)): return
        if c['comp']:
            n = await npc(pg, c['comp'])
            R.check('%s %s 跟進店裡坐下（L118.populateShop）' % (tag, c['comp']), bool(n) and n['seat'], J(n))
        await go_btn(pg, cdp, tag, '點餐')   # r3：新室內的櫃台位置照店裡真的互動點（r2 寫死的舊座標停在「坐下」「和Alison說話」「聽一句」上）
        lab = '點餐（' + c['name']
    else:
        lab = c['name']
    s2 = await F.wait_btn(pg, lab, 6)
    h0 = s2['hour']; zone0 = s2['zone']
    s0 = await press(pg, cdp, tag, lab)
    if not s0: return
    i0 = s0['i0']
    await run_dialog(pg, cdp, pick=menu_pick, secs=60)
    seq = c['lines'] + c['after']
    ok, k = in_order(i0, seq)
    R.note('%s 點餐那一刻 %05.2f、在 %s（互動鍵「%s」）' % (tag, h0, zone0, s2['interact']))
    R.check('%s 在新店（%s）演了：%s' % (tag, c['name'], J([t for _, t in seq])), ok and c['name'] in s2['interact'], J({'到第幾句': k, 'said': [[x['who'], x['text']] for x in says(i0)]}))
    await shot(pg, '%s_after' % part.lower())
    st = await pg.evaluate("(()=>({once:((GAME.G.l118||{}).once)||{}, sis:!!(GAME.G.flags||{}).SIS_TEA_ORDER, rank:(GAME.G.flags||{}).ZHE_118_RANK||null, w:((GAME.G.l118||{}).w)||{}}))()")
    day = await pg.evaluate("GAME.G.day")
    if part == 'H1':
        R.check('%s 記 SIS_TEA_ORDER' % tag, st['sis'], J(st))
        if not ok and not (12 + 20 / 60 <= h0 <= 12.75): R.note('%s 【注意】點的那一刻 %05.2f 不在 12:20～12:45（前置時間沒對準，不是遊戲問題）' % (tag, h0))
    if part == 'H4':
        R.check('%s 記 once.H4＝今天、ZHE_118_RANK＝korea（選「這間第一。」）' % tag, st['once'].get('H4') == day and st['rank'] == 'korea', J(st))
    if part == 'H6':
        R.check('%s 記 once.H6＝今天；柏翰原本那句「十二點四十了。我先回總圖。」沒說' % tag, st['once'].get('H6') == day and not has_say(i0, '十二點四十了。我先回總圖。'), J(st['once']))


# ---------------------------------------------------------------- SQ04
SQ04_OPEN = [(None, '（老闆把一台筆電放在吧檯上。）'), ('店長', '這台放在窗邊那一桌三個禮拜了。'), ('店長', '……要怎麼辦。')]


async def part_sq04(pg, cdp):
    print('== SQ04', flush=True)
    tag = 'SQ04（木曜日點餐）'
    s = base('2027-03-03', 13.5, 'wenzhou', *WZ_START, yaw=math.pi)
    e = dict(s.get('eat') or {}); e['n'] = dict(e.get('n') or {}); e['n']['木曜日'] = 4; s['eat'] = e
    sd = dict(s.get('side') or {}); sd.pop('SQ04', None); s['side'] = sd; s['flags'].pop('SIDEQ_DAY', None)
    await load(pg, cdp, '【前置】%s 2027-03-03（大二下）13:30、G.eat 木曜日 4 次、清 G.side.SQ04／SIDEQ_DAY' % tag, s)
    try:   # BB 06:37：機率設 0 是捷徑——先記原本的機率和條件（判定要寫進去）
        orig = await pg.evaluate("(()=>{ const q=(SIDEQ.DEFS||SIDEQ.Q||{}).SQ04||null; return {ROLL:SIDEQ.ROLL, MAX:SIDEQ.MAX, roll:String(SIDEQ.roll).slice(0,80), sq04:q?{shop:q.shop,title:q.title,avail:String(q.avail).slice(0,120)}:null, state:((GAME.G.side||{}).SQ04)||null}; })()")
        R.note('%s 原本的機率和條件（改之前）：%s；程式（sideq3d.js）：點完餐才判、S.ROLL＝0.35、S.MAX＝2（同時進行中的上限）、SQ04 avail＝大二下起（ti(G)>=3）、要那間店第 5 次（S.known）' % (tag, J(orig)))
    except Exception as e: R.note('%s 讀原本的機率失敗 %r' % (tag, e))
    await pg.evaluate("(()=>{ SIDEQ.roll=()=>0; })()")
    R.setup('%s【捷徑】SIDEQ.roll＝()=>0（原本 Math.random，35%% 才開口）' % tag)
    pre = await pg.evaluate("(()=>({key:SIDEQ.keyOfName('木曜日'), eatKey:SIDEQ.eatKey('慢讀咖啡'), can:SIDEQ.canOffer(GAME.G,'SQ04'), cnt:EAT.count(GAME.G,'木曜日'), term:CALENDAR.termOf(GAME.G.day)}))()")
    R.note('%s 條件（參考；canOffer 在點完那一刻次數 +1 才成立）：%s' % (tag, J(pre)))
    if not await into_mokuyobi(pg, cdp, tag): return
    await joy(pg, cdp, tag + ' 走到吧檯', MOK_BAR[0], MOK_BAR[1], near=0.5, lv=1)
    s0 = await press(pg, cdp, tag, '點東西')
    if not s0: return
    i0 = s0['i0']

    def pk(o):
        if any('元' in x['t'] for x in o): return 0
        k = next((i for i, x in enumerate(o) if '要我幫忙' in x['t']), None)
        if k is not None: return k
        return next((i for i, x in enumerate(o) if '再等一下' in x['t']), None)
    await run_dialog(pg, cdp, pick=pk, secs=60)
    ok, k = in_order(i0, SQ04_OPEN)
    R.check('%s 在木曜日點完焙茶拿鐵：老闆放筆電那三句照順序' % tag, ok, J({'到第幾句': k, 'said': [[x['who'], x['text']] for x in says(i0)]}))
    R.check('%s 「再等一下？」→「……已經三個禮拜了。」「好，再一個禮拜。」' % tag, has_say(i0, '……已經三個禮拜了。') and has_say(i0, '好，再一個禮拜。'), J([x['text'] for x in says(i0)]))
    r = await pg.evaluate("(()=>({sq:(GAME.G.side||{}).SQ04||null, zone:GAME.G.zone}))()")
    R.check('%s G.side.SQ04 open（在 wz_mokuyobi）' % tag, bool(r['sq']) and r['sq'].get('state') == 'open' and r['zone'] == 'wz_mokuyobi', J(r))
    await shot(pg, 'sq04_after')


# ---------------------------------------------------------------- main
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        R.note('受測 SHA %s、%s；PARTS %s' % (SHA or '（沒給）', ver, ','.join(PARTS)))
        for part in PARTS:
            n0 = len(errs); t0 = time.time()
            try:
                if part == 'MENU': await part_menu(pg, cdp)
                elif part == 'SLOTS': await part_slots(pg, cdp)
                elif part in REG: await part_reg(pg, cdp, part)
                elif part == 'H3': await part_h3(pg, cdp)
                elif part == 'CAFE2': await part_cafe2(pg, cdp)
                elif part == 'ORIG': await part_orig(pg, cdp)
                elif part == 'NOSIT': await part_nosit(pg, cdp, False)
                elif part == 'NOSIT_REF': await part_nosit(pg, cdp, True)
                elif part in SHOPS: await part_shop(pg, cdp, part)
                elif part == 'SQ04': await part_sq04(pg, cdp)
                else: R.check('認得 PARTS「%s」' % part, False)
            except Exception as e:
                R.check('[%s] 探針沒有例外' % part, False, repr(e)[:400])
                try: await shot(pg, 'exc_%s' % part.lower())
                except Exception: pass
            await drain(pg)
            await errs_check(part, errs, n0)
            R.note('[%s] 用了 %.0f 秒' % (part, time.time() - t0))
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
