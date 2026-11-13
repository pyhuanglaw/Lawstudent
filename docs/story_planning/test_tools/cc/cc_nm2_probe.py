"""CC（帳號 A）11-11：NM2 夜市第二批「能看能買」（BB 23:52；新 11161c101（BB 00:07；含 ecd4fdd61 夜市互動，夜市檔和 bd3f67410 一樣）、舊 b810b809b 只有模型＝預期 FAIL）。Playwright（PC GPU）≠ iPhone。
判定 BB 下；探針只照實 R.check／R.note。對稿的稿＝DRAFT_DIR/AA_752_night_market.json（預設＝探針資料夾/fixtures/nm2；企劃線 b76a518af，見 SOURCE.txt）——
店名、look、closed、greet、品名、價錢、buy、hours、seasonNote 全部從稿讀，不寫死；攤位、位置、模型開收從遊戲讀（TINGZHOU_LAYOUT.stalls、zone.tzStalls／ggStalls）。
配置 kind → 稿的攤號（KIND）照遊戲 src/night_market3d.js 的 S.KIND（店名另外對）。
做法：【前置／捷徑】讀檔站在攤子客人那一面 1.9 m（方向 (sin yaw, cos yaw)）；互動鍵上的字不是「看＋店名」就照玩家走到那一攤的互動點（L.go_to）。
之後按互動鍵、點對話框、點選項全部是 CDP 觸控（L.tap／touch_tap）；畫面讀：#dlgName、GAME.D.full（整句）、#choices 的按鈕（字、.dim）；另外包一層 GAME.say／choose／toast 只記錄（照原樣呼叫）。
PARTS（預設全部）：
  OPEN    十攤（預設；STALLS=id,… 篩）20:00 營業中：①第一次按：鍵上的字、look 逐句、老闆一句在 greet 清單、選單逐項（品名＋價錢）＋「算了」；買第一樣（連點兩下）：扣錢＝價錢、只扣一次、
          時間過 5 分鐘、buy 逐句 ②同一天再按：不念 look；01／07／08 買最後一樣，其他按「算了」（不扣） ③01／07／08 再按一次「算了」 ④【捷徑】錢設成最便宜的 −1 元：品項全灰、點最便宜的不扣不演。
  CLOSED  十攤收攤後（稿的收攤時間 +30 分鐘）各按一次：只有 closed 一句、沒有選單、畫面上（對話框、選單、字幕、提示）沒有「元」。
  EDGE    稿的開收時間表（稿 hours、遊戲 NIGHT_MARKET open、配置 kinds 同步後）；每攤開、收各一次（BB 00:07）：讀檔到邊界前 2.5 分鐘、之後不動讓時間自己走，
          讀進來馬上按一次（翻轉前）＋拍；每 0.3 秒記 G.hour／isOpen／open visible／TZ3.stallOpen(G.hour)；翻轉的那一刻拍、再按一次（翻轉後）。
          翻轉在邊界 ±1 分鐘內、每筆模型＝isOpen、按的那一刻模型＝isOpen＝出來的東西＝稿。胡椒餅「賣完提早收」照實記。
  （所有按鍵都記「按的那一刻」＝第一句或選單出來時的 G.hour、每一攤 isOpen／open visible（記錄層），判開收一律用這個，不用排的時間）
  BG      背景三攤：套圈圈週四（2025-11-06）、週五（11-07）20:00 各按一次；襪子、手機殼 營業中＋收攤後各一次：只能看、沒有選單、不扣錢。
  SEASON  阿婆甜湯：7 月（2026-07-15）13:59／14:01；12 月（2025-12-10）16:59／17:01；4 月（2026-04-15）14:01／17:01。開著的那一次連按 4 次收集 greet。
  GG      公館人行道三攤（鮮奶、紅豆餅、手機殼）：營業中按＋買一樣（手機殼只能看）、收攤後按。
  SAVE    週五 20:00 地瓜球買一樣 → 選單存到欄位 1 → ①遊戲中選單讀欄位 1 ②重新整理 → 標題讀欄位 1：錢對、再按不重念 look（照 BB 的要求判）。
  OLD     舊存檔（OLDSAVE＝預設 fixtures/user_saves_1107/fatiao3d_save_day46.json，2026-11-06 00:47 UTC 線上版存的）：【捷徑】只改 zone／pos／hour 到公館鮮奶攤前 20:00，
          寫進欄位 1 → 重新整理 → 標題讀：買得到一樣、沒有 JS 例外。
每次跑完都檢查：整個過程畫面上的字沒有「整條巷子都聞得到」「書忘在這裡」「粉筆畫的框」。這版沒有的（攤主人物、坐下吃、吃了的數值）只記不判。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=OPEN,… [STALLS=st_milk,…] [DRAFT_DIR=…] [OLDSAVE=…] python3 cc_nm2_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math, re, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'OPEN,CLOSED,EDGE,BG,SEASON,GG,SAVE,OLD').split(',')
ONLY = [x for x in (os.environ.get('STALLS') or '').split(',') if x]
SHA = (os.environ.get('SHA') or '')[:9]
DRAFT_DIR = os.environ.get('DRAFT_DIR') or os.path.join(HERE, 'fixtures', 'nm2')
OLDSAVE = os.environ.get('OLDSAVE') or os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
R = L.Run('nm2', OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DR = json.load(open(os.path.join(DRAFT_DIR, 'AA_752_night_market.json'), encoding='utf-8'))
KIND = {'milk': 's01', 'pepper': 's02', 'wheelcake': 's03', 'ball': 's04', 'scallion': 's05', 'stinky': 's06', 'corn': 's07', 'eggcake': 's08', 'cane': 's09', 'jelly': 's10',
        'ring': 'b12', 'phonecase': 'b13', 'socks': 'b14'}   # 照 src/night_market3d.js S.KIND
OWNER = {'s10': '阿婆'}   # 其他＝「老闆」（night_market3d.js S.OWNER／OWNER_X）
TWO = {'s01', 's07', 's08'}   # BB：這三攤買兩樣
BAD = ['整條巷子都聞得到', '書忘在這裡', '粉筆畫的框']
DAYS = {'OPEN': '2025-11-04', 'CLOSED': '2025-11-05', 'EDGE': '2025-11-12', 'BG_THU': '2025-11-06', 'BG_FRI': '2025-11-07', 'GG': '2025-11-13', 'SAVE': '2025-11-14',
        'JUL': '2026-07-15', 'DEC': '2025-12-10', 'APR': '2026-04-15'}
SEEN = set()   # 整個過程畫面上出現過的字（第 9 項）
HOOK_CNT = [0]

# ---------------------------------------------------------------- 稿
def _hm(a, b): return int(a) + int(b) / 60.0


def parse_hours(s):
    """'17:00～24:00'、'17:00～23:00（賣完提早收）'、'夏天 14:00～23:00；其他月份 17:00～23:00' → {'normal':(f,t), 'summer':(f,t)|None}"""
    rr = [(_hm(a, b), _hm(c, d)) for a, b, c, d in re.findall(r'(\d{1,2}):(\d{2})\s*～\s*(\d{1,2}):(\d{2})', s or '')]
    if not rr: return None
    if '夏天' in s and len(rr) >= 2: return {'normal': rr[1], 'summer': rr[0]}
    return {'normal': rr[0], 'summer': None}


def parse_season(note):
    def rng(k):
        m = re.search(k + r'＝(\d+)～(\d+)\s*月', note or '')
        if not m: return []
        a, b = int(m.group(1)), int(m.group(2))
        return list(range(a, b + 1)) if a <= b else list(range(a, 13)) + list(range(1, b + 1))
    return {'summer': rng('夏天'), 'winter': rng('冬天')}


SEASON = parse_season(DR.get('seasonNote', ''))


def season(m): return 'summer' if m in SEASON['summer'] else ('winter' if m in SEASON['winter'] else None)


def exp_of(kind, m):
    """這一攤在 m 月的預期：名字、鍵上的字、開收、look、greet 清單、品項、closed"""
    key = KIND.get(kind)
    if key in DR['stalls']:
        st = DR['stalls'][key]; sn = season(m); hh = parse_hours(st.get('hours')) or {'normal': None, 'summer': None}
        look = list(st['look']) + ([st['lookSummer']] if sn == 'summer' and st.get('lookSummer') else []) + ([st['lookWinter']] if sn == 'winter' and st.get('lookWinter') else [])
        greet = list(st['greet']) + (list(st.get('greetSummer') or []) if sn == 'summer' else []) + (list(st.get('greetWinter') or []) if sn == 'winter' else [])
        return {'key': key, 'bg': False, 'name': st['name'], 'label': '看' + st['name'], 'hours': hh['summer'] if (sn == 'summer' and hh['summer']) else hh['normal'],
                'hours_txt': st.get('hours'), 'look': look, 'greet': greet, 'items': st['items'], 'closed': st['closed'], 'owner': OWNER.get(key, '老闆'), 'season': sn}
    if key in DR['background']:
        b = DR['background'][key]
        return {'key': key, 'bg': True, 'name': b['sign'], 'label': '看' + b['sign'], 'hours': None, 'look': [b['look']], 'greet': [], 'items': [], 'closed': b['closed'], 'owner': None, 'season': None}
    return None


def hhmm(h):
    m = int(round(h * 60)); return '%02d:%02d' % ((m // 60) % 24, m % 60) + ('（隔天）' if m >= 24 * 60 else '')


def month_of(day_key): return int(day_key.split('-')[1])


def is_narr(t):
    if not t or t[0] != '（': return False
    dep = 0
    for i, c in enumerate(t):
        if c == '（': dep += 1
        elif c == '）':
            dep -= 1
            if dep == 0: return i == len(t) - 1
    return False


# ---------------------------------------------------------------- 頁面
HOOK = r"""(()=>{ if(window.__nmHook) return 'again'; window.__nmHook=1; window.__nm=[]; const g=()=>GAME.G||{};
  const os=()=>{ try{ const z=GAME.E.zone||{}; return (z.tzStalls||[]).concat(z.ggStalls||[]).map(q=>[q.id, q.isOpen?1:0, q.open&&q.open.visible?1:0]); }catch(e){ return null; } };   /* 那一刻每一攤的 isOpen、open 模型 visible */
  const o=GAME.say; GAME.say=function(who,text){ try{ __nm.push({k:'say', who:who?String(who.name||who):'', t:String(text), h:+g().hour, m:g().money, os:os()}); }catch(e){} return o.apply(this,arguments); };
  const c=GAME.choose; GAME.choose=function(options){ try{ __nm.push({k:'choose', opts:(options||[]).map(x=>({t:String(x.t), dim:!!x.dim})), h:+g().hour, m:g().money, os:os()}); }catch(e){} return c.apply(this,arguments); };
  const t=GAME.toast; if(t) GAME.toast=function(s){ try{ __nm.push({k:'toast', t:String(s), h:+g().hour, m:g().money}); }catch(e){} return t.apply(this,arguments); };
  return 'ok'; })()"""
SCR = r"""(()=>{ const D=GAME.D, P=GAME.E&&GAME.E.player, ch=document.getElementById('choices'), dn=document.getElementById('dlgName');
  const vis=e=>!!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'&&+getComputedStyle(e).opacity!==0;
  const btns=ch&&!ch.classList.contains('hide')?[...ch.querySelectorAll('button')].map(b=>{ const c=b.cloneNode(true); c.querySelectorAll('.hint').forEach(e=>e.remove()); return {t:(c.textContent||'').trim(), dim:b.classList.contains('dim')}; }):null;
  const T=document.getElementById('toast'), C=document.getElementById('caption');
  return {dlg:!!(D&&D.active), who:dn&&dn.style.display!=='none'?(dn.textContent||'').trim():'', full:D&&D.active?String(D.full||''):'', shown:((document.getElementById('dlgText')||{}).textContent||'').trim(),
    ch:btns&&btns.length?btns:null, busy:!!(P&&P.busy), money:GAME.G?GAME.G.money:null, hour:GAME.G?+GAME.G.hour:null, depth:GAME.sceneDepth?GAME.sceneDepth():null,
    toast:vis(T)?(T.textContent||'').trim():'', caption:vis(C)?(C.textContent||'').trim():''}; })()"""
STALLS = r"""(()=>{ const z=GAME.E.zone||{}, A=(z.tzStalls||[]).concat(z.ggStalls||[]);
  return A.map(q=>({id:q.id, kind:q.kind, x:q.x, z:q.z, yaw:q.yaw, isOpen:!!q.isOpen, openVis:q.open?!!q.open.visible:null, closedVis:q.closed?!!q.closed.visible:null, off:!!(z.tzStallOff&&z.tzStallOff[q.id]), allClosed:!!z.tzStallsClosed})); })()"""
LAY = r"""(()=>{ const T=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null, S=T&&T.stalls; if(!S) return null;
  const nm=typeof NIGHT_MARKET!=='undefined'?NIGHT_MARKET:null, k3=typeof NM3!=='undefined'?NM3:null;
  return {kinds:JSON.parse(JSON.stringify(S.kinds||{})), list:S.list||[], gongguan:S.gongguan||[], hasNM:!!nm, hasNM3:!!k3,
    nmOpen:nm?Object.fromEntries(Object.entries(nm.stalls).map(([k,v])=>[k,{open:v.open,openSummer:v.openSummer||null,hours:v.hours}])):null,
    nm3Keys:k3?Object.keys(k3):[], s02Keys:nm&&nm.stalls.s02?Object.keys(nm.stalls.s02):[]}; })()"""
NMPT = r"""(id=>{ const it=(GAME.E.interactables||[]).find(i=>i.nmStall===id); return it?{x:+it.x.toFixed(2), z:+it.z.toFixed(2), r:it.radius||1, label:it.label}:null; })"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.1, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player&&E.player.obj, hid=[]; if(P){ hid.push([P,P.visible]); P.visible=false; }
  try{ r.render(E.scene,cam); return c.toDataURL('image/jpeg',0.86); } finally { for(const [o,v] of hid) o.visible=v; } })"""
GSUM = r"""(()=>{ const G=GAME.G; const o={}; for(const k of Object.keys(G)){ const v=G[k]; if(v==null||typeof v!=='object') o[k]=v; else { try{ o[k]=JSON.stringify(v).length; }catch(e){ o[k]='?'; } } } return o; })()"""
NEAR_NPC = r"""(([x,z])=>(GAME.E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<2.6).map(n=>n.charId||n.name||(n.isExtra?'路人':'?')))"""
SEAT_NEAR = r"""(([x,z])=>(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden&&Math.hypot(i.x-x,i.z-z)<4.5).length)"""


async def hook(pg):
    r = await pg.evaluate(HOOK); HOOK_CNT[0] += 1; return r


async def log_since(pg, n):
    return await pg.evaluate("n=>(window.__nm||[]).slice(n)", n)


async def log_len(pg):
    return await pg.evaluate("(window.__nm||[]).length")


def save_img(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def day_of(pg, key):
    return await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })(%s)" % J(key))


async def load(pg, cdp, zone, day_key, h, x=None, z=None, money=3000, why='', wait=6000):
    d = await day_of(pg, day_key)
    st0 = {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear', 'money': money}
    if x is not None: st0['pos'] = {'x': x, 'z': z, 'yaw': 0.0, 'lv': 0}
    try: await L.load_state(pg, st0, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, st0, quiet_events=True)
    await pg.wait_for_timeout(wait); await L.close_panels(pg, cdp)
    R.setup('讀檔到 %s %s %s%s 錢 %d 元 %s' % (zone, day_key, hhmm(h), '' if x is None else ' (%.2f,%.2f)' % (x, z), money, why))


async def lay(pg):
    return await pg.evaluate(LAY)


def stalls_of(Ly, which):
    out = [dict(q, zone='tingzhou') for q in Ly['list']] + [dict(q, zone='gongguan') for q in Ly['gongguan']]
    if which == 'buy': out = [q for q in out if KIND.get(q['kind'], '').startswith('s')]
    elif which == 'bg': out = [q for q in out if KIND.get(q['kind'], '').startswith('b')]
    elif which == 'gg': out = [q for q in out if q['zone'] == 'gongguan']
    return sorted(out, key=lambda q: KIND.get(q['kind'], 'z'))


async def stall_now(pg, sid):
    return next((s for s in await pg.evaluate(STALLS) if s['id'] == sid), None)


async def go_stall(pg, cdp, q, day_key, h, money=3000, why='', wait=6000):
    """讀檔站到攤前 1.9 m；鍵上的字不是「看＋店名」就照玩家走到互動點。回傳鍵上的字"""
    E = exp_of(q['kind'], month_of(day_key)); fx, fz = math.sin(q['yaw']), math.cos(q['yaw'])
    await load(pg, cdp, q['zone'], day_key, h, q['x'] + fx * 1.9, q['z'] + fz * 1.9, money, '（%s %s 客人那一面 1.9 m）%s' % (q['id'], E and E['name'], why), wait=wait)
    s = await L.state(pg)
    if E and s['interact'] != E['label']:
        pt = await pg.evaluate(NMPT, q['id'])
        R.note('[%s] 站在 1.9 m 鍵上是「%s」（要「%s」）；互動點 %s → 照玩家走過去' % (q['id'], s['interact'], E['label'], J(pt)))
        if pt:
            try: await L.go_to(pg, cdp, R, pt['x'], pt['z'], 0.35, '%s 互動點' % q['id'], max_s=45)
            except Exception as e: R.note('[%s] go_to 例外 %r' % (q['id'], e))
            await pg.wait_for_timeout(600); s = await L.state(pg)
    return s['interact']


async def tap_choice(pg, cdp, i, double=False):
    c = await pg.evaluate("i=>{ const b=document.querySelectorAll('#choices button')[i]; if(!b) return null; b.scrollIntoView({block:'nearest'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; }", i)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1])
    if double: await pg.wait_for_timeout(70); await L.touch_tap(cdp, c[0], c[1])
    return True


def seen(t):
    if t: SEEN.add(t)


async def press(pg, cdp, tag, pick=None, double=False, max_s=45):
    """按互動鍵：逐句讀畫面（名字＋整句）、選單（字＋灰不灰），選單照 pick(menu)→index 點（None＝點「算了」／最後一個）。
    回傳 {btn, lines:[[who,t]], pre:[句]（選單前）, post:[句]（選單後）, menus, picked, m0, m1, h0, h1, log, toasts}"""
    s0 = await pg.evaluate(SCR); st = await L.state(pg); btn = st['interact']; n0 = await log_len(pg)
    res = {'btn': btn, 'lines': [], 'pre': [], 'post': [], 'menus': [], 'picked': [], 'm0': s0['money'], 'h0': s0['hour'], 'toasts': []}
    if not btn: res.update(m1=s0['money'], h1=s0['hour'], log=[]); return res
    res['os0'] = {x['id']: (x['isOpen'], x['openVis']) for x in await pg.evaluate(STALLS)}; res['h00'] = (await pg.evaluate(SCR))['hour']   # 按之前玩家看到的模型
    await L.tap(pg, cdp, '#interact'); t0 = time.time(); last = None; idle = 0; after_menu = False; started = False
    while time.time() - t0 < max_s:
        q = await pg.evaluate(SCR)
        for k in ('toast', 'caption'):
            if q[k]: seen(q[k]); (q[k] not in res['toasts']) and res['toasts'].append(q[k])
        if q['ch']:
            started = True; idle = 0; menu = q['ch']; res['menus'].append(menu); [seen(b['t']) for b in menu]
            if q['shown']: seen(q['shown'])
            i = pick(menu) if pick else None
            if i is None: i = next((k for k, b in enumerate(menu) if b['t'] == '算了'), len(menu) - 1)
            res['picked'].append([i, menu[i]['t'] if 0 <= i < len(menu) else None]); after_menu = True
            await tap_choice(pg, cdp, i, double=double); double = False; last = None; await pg.wait_for_timeout(700); continue
        if q['dlg']:
            started = True; idle = 0; cur = [q['who'], q['full']]
            if cur != last:
                res['lines'].append(cur); (res['post'] if after_menu else res['pre']).append(cur); seen(q['full']); last = cur
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(380); continue
        if started or not q['busy']:
            idle += 1
            if idle >= (4 if started else 8): break
        await pg.wait_for_timeout(300)
    s1 = await pg.evaluate(SCR); res['m1'] = s1['money']; res['h1'] = s1['hour']; res['log'] = await log_since(pg, n0)
    e0 = next((e for e in res['log'] if e['k'] in ('say', 'choose')), None)   # 第一句／選單＝按下去那一刻（對話中遊戲不走時間）
    res['hp'] = e0['h'] if e0 else None; res['osp'] = {x[0]: (bool(x[1]), bool(x[2])) for x in ((e0 or {}).get('os') or [])}
    for e in res['log']:
        seen(e.get('t'))
        for o in e.get('opts') or []: seen(o['t'])
    return res


def menu_items(menu):
    """選單按鈕 → [(品名, 價錢|None, dim)]"""
    out = []
    for b in menu or []:
        m = re.match(r'^(.*?)[\s　]*(\d+)\s*元$', b['t'])
        out.append((m.group(1).strip(), int(m.group(2)), b['dim']) if m else (b['t'], None, b['dim']))
    return out


def buy_hour_delta(log):
    """記錄層：選單出來時的鐘點 → 選完以後第一句的鐘點（遊戲在對話中不走時間）"""
    hc = next((e['h'] for e in log if e['k'] == 'choose'), None); i = next((k for k, e in enumerate(log) if e['k'] == 'choose'), None)
    if hc is None: return None
    nxt = next((e['h'] for e in log[i + 1:] if e['k'] == 'say'), None)
    return None if nxt is None else nxt - hc


def has_yuan(r):
    txt = ' '.join([t for _, t in r['lines']] + [b['t'] for mm in r['menus'] for b in mm] + r['toasts'])
    return '元' in txt, txt[:200]


# ---------------------------------------------------------------- 檢查
def press_sync(tag, r, sid, E):
    """按之前玩家看到的模型（open visible）、按的那一刻（第一句的 G.hour；NM3.openNow 先照 G.hour 重切一次）的 isOpen、出來的東西（有選單／look＝開；closed 那一句＝收）三個一致；也和稿的時間一致"""
    st = r.get('osp', {}).get(sid); b0 = r.get('os0', {}).get(sid); hp = r.get('hp'); lines = [t for _, t in r['lines']]
    got = 'open' if (r['menus'] or (lines and lines[0] == (E['look'] or [None])[0])) else ('closed' if lines == [E['closed']] else '?')
    R.note('%s 按之前 %s 模型 open visible %s；按的那一刻 G.hour %s（%s）isOpen %s → 出來的是 %s' % (tag, hhmm(r['h00']) if r.get('h00') is not None else '?', b0 and b0[1], None if hp is None else round(hp, 4), hhmm(hp) if hp is not None else '?', st and st[0], got))
    if st is None or hp is None or b0 is None: R.check('%s 記到按之前的模型、按的那一刻（G.hour、isOpen）' % tag, False, J({'hp': hp, 'osp': r.get('osp'), 'os0': r.get('os0')})); return
    R.check('%s 按之前看到的模型（%s）＝按下去出來的東西（%s）' % (tag, '開' if b0[1] else '收', got), got == ('open' if b0[1] else 'closed'), '')
    R.check('%s 按的那一刻 isOpen（%s）＝出來的東西（%s）' % (tag, st[0], got), got == ('open' if st[0] else 'closed'), '')
    if E.get('hours'):
        hm = hp % 24; want = (E['hours'][0] <= hm < E['hours'][1]) or (E['hours'][0] <= hm + 24 < E['hours'][1])
        R.check('%s 按的那一刻 %s 照稿 %s～%s 應該%s' % (tag, hhmm(hp), hhmm(E['hours'][0]), hhmm(E['hours'][1]), '開' if want else '收'), st[0] == want and got == ('open' if want else 'closed'), '')


def check_greet(tag, line, E):
    if not line: R.check('%s 老闆那一句（look 之後、選單之前）' % tag, False, '沒有'); return
    R.check('%s 老闆一句「%s」在這一攤的 greet 清單（%d 句）' % (tag, line[1], len(E['greet'])), line[1] in E['greet'], J(E['greet']))
    R.check('%s 說話的人寫「%s」' % (tag, E['owner']), line[0] == E['owner'], '畫面：「%s」' % line[0])


def check_menu(tag, menu, E, money):
    got = menu_items(menu); want = [(it['name'], it['price']) for it in E['items']]
    items = [g for g in got if g[1] is not None]
    rows = ['%s %s 元%s' % (n, p, '（灰）' if d else '') for n, p, d in items]
    R.note('%s 選單：%s' % (tag, ' / '.join(rows + [g[0] for g in got if g[1] is None])))
    R.check('%s 選單品名＋價錢逐項對稿（%d 樣）' % (tag, len(want)), [(n, p) for n, p, _ in items] == want, '畫面 %s；稿 %s' % (J([(n, p) for n, p, _ in items]), J(want)))
    R.check('%s 選單最後有「算了」' % tag, bool(got) and got[-1][0] == '算了', J([g[0] for g in got[-2:]]))
    R.check('%s 錢 %d 元：灰的＝買不起的（價錢 > 錢）' % (tag, money), all(d == (p > money) for n, p, d in items), J([(n, p, d) for n, p, d in items]))


def check_buy(tag, r, it, E):
    dm = (r['m1'] or 0) - (r['m0'] or 0)
    R.check('%s 買「%s」扣 %d 元（錢 %s → %s，差 %d）' % (tag, it['name'], it['price'], r['m0'], r['m1'], dm), dm == -it['price'], '')
    spend = [e for e in r['log'] if e['k'] == 'say']
    dh = buy_hour_delta(r['log'])
    R.check('%s 時間過 5 分鐘（選完到第一句 %s 分鐘；按之前 %s → 結束 %s）' % (tag, None if dh is None else round(dh * 60, 2), hhmm(r['h0']), hhmm(r['h1'])), dh is not None and abs(dh - 5 / 60) < 0.2 / 60, '')
    got = [t for _, t in r['post']]
    R.check('%s buy 逐句對稿（%d 句）' % (tag, len(it['buy'])), got == it['buy'], '畫面 %s；稿 %s' % (J(got), J(it['buy'])))
    whos = [[w, t] for w, t in r['post']]
    bad = [x for x in whos if (x[0] != '') != (not is_narr(x[1])) or (x[0] and x[0] != E['owner'])]
    R.check('%s buy 的（…）整句沒有名字、其他寫「%s」' % (tag, E['owner']), not bad, J(bad))
    return dm, len(spend)


# ---------------------------------------------------------------- PARTS
async def stall_full(pg, cdp, q, day_key, h, part, two=None, poor=True):
    E = exp_of(q['kind'], month_of(day_key)); tag = '[%s %s %s %s]' % (part, q['id'], E['name'], hhmm(h)); summ = {'id': q['id'], 'name': E['name']}
    btn = await go_stall(pg, cdp, q, day_key, h)
    summ['btn'] = btn
    if not R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], '畫面「%s」' % btn): summ['err'] = '沒有看的鍵'; return summ
    g0 = await pg.evaluate(GSUM); g = await stall_now(pg, q['id'])
    R.note('%s 模型 %s；攤位 2.6 m 內的人 %s；4.5 m 內能坐的位子 %d（這版沒有攤主、坐下吃：只記）' % (tag, J(g and {k: g[k] for k in ('isOpen', 'openVis', 'closedVis')}), J(await pg.evaluate(NEAR_NPC, [q['x'], q['z']])), await pg.evaluate(SEAT_NEAR, [q['x'], q['z']])))
    items = E['items']; A = items[0]; B = items[-1]
    # ① 第一次
    r1 = await press(pg, cdp, tag + '①', pick=lambda m: 0, double=True)
    press_sync(tag + '①', r1, q['id'], E)
    pre = r1['pre']; nl = len(E['look'])
    R.check('%s① 當天第一次按：先念 look %d 句，逐句對稿（旁白沒有名字）' % (tag, nl), [t for _, t in pre[:nl]] == E['look'] and all(w == '' for w, _ in pre[:nl]), '畫面 %s；稿 %s' % (J(pre[:nl]), J(E['look'])))
    check_greet(tag + '①', pre[nl] if len(pre) > nl else None, E)
    R.check('%s① 選單前沒有別的句子（look＋1 句招呼）' % tag, len(pre) == nl + 1, J(pre))
    if not R.check('%s① 有品項選單' % tag, bool(r1['menus']), J(r1['lines'])): summ['err'] = '沒有選單'; return summ
    check_menu(tag + '①', r1['menus'][0], E, r1['m0'])
    dm, nsay = check_buy(tag + '①（連點兩下）', r1, A, E)
    R.check('%s① 連點兩下只扣一次（只有一次 buy）' % tag, dm == -A['price'] and len([e for e in r1['log'] if e['k'] == 'choose']) == 1, '扣 %d；選單 %d 次' % (-dm, len(r1['menus'])))
    summ['look'] = '%d/%d' % (sum(1 for a, b in zip([t for _, t in pre[:nl]], E['look']) if a == b), nl); summ['buy'] = ['%s −%d' % (A['name'], -dm)]
    g1 = await pg.evaluate(GSUM)
    diff = {k: [g0.get(k), g1.get(k)] for k in set(g0) | set(g1) if g0.get(k) != g1.get(k) and k not in ('hour', 'money', 'savedAt')}
    R.note('%s① 買完 G 有變的欄位（錢、鐘點以外；物件＝JSON 長度）：%s（這版沒有吃了的數值效果：只記）' % (tag, J(diff)))
    # ② 同一天再按
    want2 = (two if two is not None else (E['key'] in TWO)) and len(items) > 1
    r2 = await press(pg, cdp, tag + '②', pick=(lambda m: len(items) - 1) if want2 else None)
    lk = [t for _, t in r2['pre'] if t in E['look']]
    R.check('%s② 同一天再按：不再念 look' % tag, not lk, J(r2['pre']))
    check_greet(tag + '②', r2['pre'][0] if r2['pre'] else None, E)
    if want2:
        dm2, _ = check_buy(tag + '②', r2, B, E); summ['buy'].append('%s −%d' % (B['name'], -dm2))
        r3 = await press(pg, cdp, tag + '③')
        R.check('%s③ 按「算了」不扣錢、沒有 buy、時間沒有跳' % tag, r3['m1'] == r3['m0'] and not r3['post'] and r3['picked'] and r3['picked'][0][1] == '算了' and abs((r3['h1'] or 0) - (r3['h0'] or 0)) < 0.02, J({k: r3[k] for k in ('m0', 'm1', 'h0', 'h1', 'picked', 'post')}))
    else:
        R.check('%s② 按「算了」不扣錢、沒有 buy、時間沒有跳' % tag, r2['m1'] == r2['m0'] and not r2['post'] and r2['picked'] and r2['picked'][0][1] == '算了' and abs((r2['h1'] or 0) - (r2['h0'] or 0)) < 0.02, J({k: r2[k] for k in ('m0', 'm1', 'h0', 'h1', 'picked', 'post')}))
    if poor:
        mn = min(it['price'] for it in items); ci = min(range(len(items)), key=lambda k: items[k]['price'])
        await pg.evaluate("v=>{ GAME.G.money=v; if(GAME.money) GAME.money(0); }", mn - 1)
        R.setup('%s④ 【捷徑】錢設成 %d 元（最便宜 %d 元 −1）' % (tag, mn - 1, mn))
        r4 = await press(pg, cdp, tag + '④', pick=lambda m: ci)
        if r4['menus']:
            it4 = menu_items(r4['menus'][0])
            R.check('%s④ 錢不夠：每一樣都變灰' % tag, all(d for n, p, d in it4 if p is not None) and any(p is not None for n, p, d in it4), J(it4))
        else: R.check('%s④ 錢不夠：還是有選單（變灰）' % tag, False, J(r4['lines']))
        R.check('%s④ 點最便宜的「%s」（灰）：不扣錢、不演 buy' % (tag, items[ci]['name']), r4['m1'] == r4['m0'] and not r4['post'], J({k: r4[k] for k in ('m0', 'm1', 'post', 'toasts')}))
        R.note('%s④ 點灰的以後的提示：%s' % (tag, J(r4['toasts'] + [e['t'] for e in r4['log'] if e['k'] == 'toast'])))
        summ['poor'] = 'OK' if (r4['m1'] == r4['m0'] and not r4['post']) else 'NG'
    b = await pg.screenshot(type='jpeg', quality=80); open(os.path.join(OUT, 'nm2_%s_%s.jpg' % (part, q['id'])), 'wb').write(b)
    return summ


async def part_open(pg, cdp):
    await load(pg, cdp, 'tingzhou', DAYS['OPEN'], 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not R.check('[OPEN] 有夜市資料（NIGHT_MARKET、NM3）', bool(Ly and Ly['hasNM'] and Ly['hasNM3']), J(Ly and {k: Ly[k] for k in ('hasNM', 'hasNM3')})):
        if not Ly: return
    A = stalls_of(Ly, 'buy')
    if ONLY: A = [q for q in A if q['id'] in ONLY]
    R.note('[OPEN] 跑 %d 攤：%s；日期 %s（%d 月）' % (len(A), J([q['id'] for q in A]), DAYS['OPEN'], month_of(DAYS['OPEN'])))
    tot = sum(len(exp_of(q['kind'], 11)['items']) for q in stalls_of(Ly, 'buy')); R.note('[OPEN] 稿十攤共 %d 樣（遊戲配置裡的十攤）' % tot)
    SUM = []
    for q in A:
        try: SUM.append(await stall_full(pg, cdp, q, DAYS['OPEN'], 20.0, 'OPEN'))
        except Exception as e: R.check('[OPEN %s] 沒有中斷' % q['id'], False, repr(e)[:300])
    for s in SUM: R.note('[OPEN 摘要] %s %s｜鍵「%s」｜look %s｜買 %s｜錢不夠 %s%s' % (s['id'], s['name'], s.get('btn'), s.get('look'), J(s.get('buy')), s.get('poor'), ('｜' + s['err']) if s.get('err') else ''))


async def part_closed(pg, cdp):
    await load(pg, cdp, 'tingzhou', DAYS['CLOSED'], 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[CLOSED] 有配置', False); return
    A = stalls_of(Ly, 'buy')
    if ONLY: A = [q for q in A if q['id'] in ONLY]
    for q in A:
        E = exp_of(q['kind'], month_of(DAYS['CLOSED'])); h = (E['hours'] or (17, 23))[1] + 0.5; tag = '[CLOSED %s %s %s]' % (q['id'], E['name'], hhmm(h))
        try:
            btn = await go_stall(pg, cdp, q, DAYS['CLOSED'], h, wait=5000)
            g = await stall_now(pg, q['id'])
            if not R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], '畫面「%s」' % btn): continue
            r = await press(pg, cdp, tag)
            press_sync(tag, r, q['id'], E)
            yu, txt = has_yuan(r)
            R.check('%s 只有 closed 一句（逐句對稿、旁白）' % tag, [t for _, t in r['lines']] == [E['closed']] and all(w == '' for w, _ in r['lines']), '畫面 %s；稿 %s' % (J(r['lines']), J(E['closed'])))
            R.check('%s 沒有品項選單' % tag, not r['menus'], J(r['menus']))
            R.check('%s 畫面上（對話框、選單、字幕、提示）沒有「元」' % tag, not yu, txt)
            R.check('%s 錢沒變' % tag, r['m1'] == r['m0'], J([r['m0'], r['m1']]))
            R.note('[CLOSED 摘要] %s %s｜模型 %s｜鍵「%s」｜%s' % (q['id'], E['name'], J(g and [g['isOpen'], g['openVis'], g['closedVis']]), btn, J([t for _, t in r['lines']])))
        except Exception as e: R.check('%s 沒有中斷' % tag, False, repr(e)[:300])


async def hours_table(pg, Ly, m):
    rows = ['| 攤 | 店名 | 稿 hours | 稿解析（%d 月） | 遊戲 NIGHT_MARKET open | 配置 kinds（同步後） | 一樣？ |' % m, '|---|---|---|---|---|---|---|']
    for q in stalls_of(Ly, 'buy'):
        E = exp_of(q['kind'], m); K = (Ly['kinds'] or {}).get(q['kind']) or {}; nm = (Ly['nmOpen'] or {}).get(E['key']) or {}
        o = nm.get('openSummer') if (E['season'] == 'summer' and nm.get('openSummer')) else nm.get('open')
        same = E['hours'] and abs(K.get('from', -1) - E['hours'][0]) < 1e-6 and abs(K.get('to', -1) - E['hours'][1]) < 1e-6
        rows.append('| %s | %s | %s | %s～%s | %s | %s～%s | %s |' % (q['id'], E['name'], E['hours_txt'], hhmm(E['hours'][0]), hhmm(E['hours'][1]), J(o), K.get('from'), K.get('to'), '是' if same else '**不一樣**'))
        R.check('[EDGE 時間表] %s %s：配置（模型開收用的）＝稿 %s～%s' % (q['id'], E['name'], hhmm(E['hours'][0]), hhmm(E['hours'][1])), bool(same), J({'from': K.get('from'), 'to': K.get('to')}))
    open(os.path.join(OUT, 'nm2_hours_table.md'), 'w', encoding='utf-8').write('\n'.join(rows) + '\n')
    R.note('[EDGE] 十攤開收時間（nm2_hours_table.md）：\n' + '\n'.join(rows))


EDGE_JS = r"""(id=>{ const E=GAME.E, z=E.zone||{}, q=(z.tzStalls||[]).concat(z.ggStalls||[]).find(s=>s.id===id); if(!q) return null; const so=(h)=>typeof TZ3!=='undefined'&&TZ3.stallOpen?TZ3.stallOpen(h,q):null;
  const gh=+GAME.G.hour; return {gh:gh, lh:E.lightH==null?null:+(+E.lightH).toFixed(4), isOpen:!!q.isOpen, openVis:q.open?!!q.open.visible:null, closedVis:q.closed?!!q.closed.visible:null,
    tz:so(((gh%24)+24)%24), tzL:E.lightH==null?null:so(E.lightH), off:!!(z.tzStallOff&&z.tzStallOff[id])}; })"""
# 模型如果照「光線用的時刻」E.lightH 切（engine3d.js applyTime 把 lightHour(h) 傳給 zone.applyTimeOutdoor），在邊界附近找鐘點幾點的時候模型會翻：
FLIP_SCAN = r"""(([id,b,dir])=>{ const E=GAME.E, z=E.zone||{}, q=(z.tzStalls||[]).concat(z.ggStalls||[]).find(s=>s.id===id); if(!q||!E.lightHour||typeof TZ3==='undefined') return null; const ss=E.sunsetNow?E.sunsetNow():null;
  for(let m=-180;m<=180;m++){ const h=b+m/60, o=TZ3.stallOpen(E.lightHour(((h%24)+24)%24,ss),q); if(o===dir) return {clock:+h.toFixed(4), minutesFromEdge:m, sunset:ss==null?null:+ss.toFixed(3)}; } return {clock:null, sunset:ss}; })"""


async def edge_shot(pg, q, fn):
    fx, fz = math.sin(q['yaw']), math.cos(q['yaw'])
    save_img(await pg.evaluate(SNAP, {'from': [q['x'] + fx * 4.5, 1.6, q['z'] + fz * 4.5], 'at': [q['x'], 1.2, q['z']], 'fov': 50}), fn + '.jpg')
    b = await pg.screenshot(type='jpeg', quality=78); open(os.path.join(OUT, fn + '_game.jpg'), 'wb').write(b)


async def edge_one(pg, cdp, q, E, day, b, lab):
    """BB 00:07（NM1 r2 的坑）：讀檔到邊界前 2.5 分鐘，之後不動、讓時間自己走過邊界；每 0.3 秒記 G.hour／isOpen／open visible／TZ3.stallOpen(G.hour)；
    翻轉前按一次（讀進來馬上按）、翻轉後按一次；各拍一張。判定一律用那一刻的 G.hour，不用排的時間"""
    tag = '[EDGE %s %s %s %s]' % (q['id'], E['name'], lab, hhmm(b)); want_after = lab == '開'
    btn = await go_stall(pg, cdp, q, day, b - 2.5 / 60.0, why='（%s 邊界前 2.5 分鐘，之後讓時間自己走）' % lab, wait=1200)
    if btn != E['label']: R.check('%s 互動鍵寫「%s」' % (tag, E['label']), False, '畫面「%s」' % btn); return '鍵?'
    g = await pg.evaluate(EDGE_JS, q['id']); fn = 'nm2edge_%s_%s_%s' % (q['id'], '開' if want_after else '收', hhmm(b).replace(':', '').replace('（隔天）', 'p1'))
    await edge_shot(pg, q, fn + '_before')
    r0 = await press(pg, cdp, tag + ' 翻轉前'); press_sync(tag + ' 翻轉前', r0, q['id'], E)
    R.check('%s 翻轉前那一次真的在邊界前（按的那一刻 %s）' % (tag, hhmm(r0['hp']) if r0.get('hp') is not None else '?'), r0.get('hp') is not None and (r0['hp'] % 24 if b < 24 else r0['hp']) < b, J({'hp': r0.get('hp'), 'before': g}))
    log, prev, flip, t0, first = [], None, None, time.time(), None
    while time.time() - t0 < 90:
        g = await pg.evaluate(EDGE_JS, q['id'])
        if not g: break
        if first is None: first = g
        log.append((round(g['gh'], 4), g['lh'], g['isOpen'], g['openVis'], g['tz']))
        if prev is not None and g['isOpen'] != prev['isOpen'] and flip is None:
            flip = (prev, g); await edge_shot(pg, q, fn + '_after')
        prev = g
        gadj = g['gh'] + (24 if b >= 24 and g['gh'] < 20 else 0)
        if gadj > b + 1.5 / 60.0 and (flip or gadj > b + 2 / 60.0): break
        await pg.wait_for_timeout(300)
    R.note('%s 紀錄（G.hour, 光線用的時刻 E.lightH, isOpen, open visible, TZ3.stallOpen(G.hour)）%d 筆：%s' % (tag, len(log), J(log[:4] + ['…'] + log[-6:] if len(log) > 10 else log)))
    R.check('%s 每一筆 open 模型 visible＝isOpen' % tag, all(x[2] == x[3] for x in log), J([x for x in log if x[2] != x[3]][:4]))
    lag = 0.5 / 60.0   # 引擎每 5 幀才重算一次時間（engine3d.js E.frame%5）：邊界後半分鐘內還沒翻不算
    def _off(x):
        ga = x[0] + (24 if b >= 24 and x[0] < 20 else 0)
        return x[4] is not None and x[2] != x[4] and not (b <= ga < b + lag)
    ns = [x for x in log if _off(x)]
    sc = await pg.evaluate(FLIP_SCAN, [q['id'], b, want_after])
    R.check('%s 每一筆模型（isOpen）＝照那一刻 G.hour 算的 TZ3.stallOpen（邊界後 %.1f 分鐘內的刷新延遲不算）' % (tag, lag * 60), not ns, J(ns[:4]))
    if ns or (first and first['isOpen'] == want_after):
        R.note('%s 【診斷】模型照光線用的時刻 E.lightH 切的話，鐘點 %s 就會%s（離邊界 %s 分鐘；當天日落 %s）——讀進來第一筆 %s' % (tag, sc and sc.get('clock') and hhmm(sc['clock']), lab, sc and sc.get('minutesFromEdge'), sc and sc.get('sunset'), J(first)))
    if not R.check('%s 時間走過邊界時翻轉（%s）' % (tag, lab), bool(flip) and flip[1]['isOpen'] == want_after, '讀進來（邊界前 2.5 分鐘）第一筆已經是%s' % ('開' if first and first['isOpen'] else '收') if first and first['isOpen'] == want_after else J(log[-3:])):
        flip = None
    else:
        hb = flip[1]['gh'] + (24 if b >= 24 and flip[1]['gh'] < 20 else 0)
        R.check('%s 翻轉在邊界 ±1 分鐘內（翻轉前 %s、翻轉後 %s；邊界 %s）' % (tag, hhmm(flip[0]['gh']), hhmm(flip[1]['gh']), hhmm(b)), abs(hb - b) <= 1 / 60.0 + 0.002, J(flip))
    if not flip: await edge_shot(pg, q, fn + '_after')
    r1 = await press(pg, cdp, tag + ' 翻轉後'); press_sync(tag + ' 翻轉後（邊界後）', r1, q['id'], E)
    got = lambda r: '買得到' if r['menus'] else ('closed' if [t for _, t in r['lines']] == [E['closed']] else J([t for _, t in r['lines']])[:40])
    fl = ('翻 %s→%s' % (hhmm(flip[0]['gh']), hhmm(flip[1]['gh']))) if flip else ('沒在邊界翻（讀進來就是%s）' % ('開' if first and first['isOpen'] else '收'))
    return '前 %s 模型%s %s｜%s｜後 %s %s' % (hhmm(r0['hp']) if r0.get('hp') is not None else '?', '開' if (r0.get('os0', {}).get(q['id']) or (None, None))[1] else '收', got(r0), fl, hhmm(r1['hp']) if r1.get('hp') is not None else '?', got(r1))


async def part_edge(pg, cdp):
    day = DAYS['EDGE']; m = month_of(day)
    await load(pg, cdp, 'tingzhou', day, 20.0, None, None, why='（讀配置、時間表）'); await pg.wait_for_timeout(1500); Ly = await lay(pg)
    if not Ly: R.check('[EDGE] 有配置', False); return
    await hours_table(pg, Ly, m)
    sold = [k for k in (Ly['nm3Keys'] or []) if re.search(r'sold|stock|out|left|remain', k, re.I)]
    R.note('[EDGE] 胡椒餅「%s」：NM3 有沒有賣完的狀態 → %s；稿 s02 的欄位 %s（只記，BB 判）' % (DR['stalls']['s02'].get('hours'), J(sold) if sold else '沒有（NM3 沒有 sold／stock 之類的欄位；收攤照 23:00）', J(Ly['s02Keys'])))
    A = stalls_of(Ly, 'buy')
    if ONLY: A = [q for q in A if q['id'] in ONLY]
    SUM = []
    for q in A:
        E = exp_of(q['kind'], m)
        for b, lab in ((E['hours'][0], '開'), (E['hours'][1], '收')):
            try: SUM.append('%s %s %s %s：%s' % (q['id'], E['name'], lab, hhmm(b), await edge_one(pg, cdp, q, E, day, b, lab)))
            except Exception as e: R.check('[EDGE %s %s] 沒有中斷' % (q['id'], lab), False, repr(e)[:300]); SUM.append('%s %s ERR' % (q['id'], lab))
    for r in SUM: R.note('[EDGE 摘要] ' + r)


async def look_only(pg, cdp, q, day_key, h, tag, want_open):
    E = exp_of(q['kind'], month_of(day_key))
    btn = await go_stall(pg, cdp, q, day_key, h, wait=5000); g = await stall_now(pg, q['id'])
    if not R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], '畫面「%s」' % btn): return None
    r = await press(pg, cdp, tag); yu, txt = has_yuan(r); press_sync(tag, r, q['id'], E)
    want = E['look'] if want_open else [E['closed']]
    R.check('%s %s：只有那一句（逐句對稿）' % (tag, '營業中＝look' if want_open else '收攤＝closed'), [t for _, t in r['lines']] == want, '畫面 %s；稿 %s' % (J(r['lines']), J(want)))
    R.check('%s 沒有買的清單、畫面上沒有「元」、錢沒變' % tag, not r['menus'] and not yu and r['m1'] == r['m0'], J({'menus': r['menus'], 'txt': txt if yu else '', 'm': [r['m0'], r['m1']]}))
    R.check('%s 模型 open visible＝%s' % (tag, want_open), bool(g) and g['openVis'] == want_open, J(g))
    b = await pg.screenshot(type='jpeg', quality=78); open(os.path.join(OUT, 'nm2_%s.jpg' % re.sub(r'[^0-9A-Za-z_]+', '_', tag)), 'wb').write(b)
    return r


async def part_bg(pg, cdp):
    await load(pg, cdp, 'tingzhou', DAYS['BG_FRI'], 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[BG] 有配置', False); return
    B = {q['kind']: q for q in stalls_of(Ly, 'bg')}
    for k in ('ring', 'phonecase', 'socks'):
        R.check('[BG] 配置有 %s，kinds.buy＝false' % k, k in B and not (Ly['kinds'].get(k) or {}).get('buy'), J(Ly['kinds'].get(k)))
    R.note('[BG] 背景三攤配置時間：%s' % J({k: [(Ly['kinds'].get(k) or {}).get(x) for x in ('from', 'to', 'days')] for k in B}))
    if 'ring' in B:
        await look_only(pg, cdp, B['ring'], DAYS['BG_THU'], 20.0, '[BG 套圈圈 週四 %s 20:00]' % DAYS['BG_THU'], False)
        await look_only(pg, cdp, B['ring'], DAYS['BG_FRI'], 20.0, '[BG 套圈圈 週五 %s 20:00]' % DAYS['BG_FRI'], True)
    for k in ('socks', 'phonecase'):
        if k not in B: continue
        K = Ly['kinds'].get(k) or {}; q = B[k]
        await look_only(pg, cdp, q, DAYS['BG_FRI'], 20.0, '[BG %s 20:00]' % k, True)
        await look_only(pg, cdp, q, DAYS['BG_FRI'], (K.get('to') or 22) + 0.5, '[BG %s %s]' % (k, hhmm((K.get('to') or 22) + 0.5)), False)


async def part_season(pg, cdp):
    await load(pg, cdp, 'tingzhou', DAYS['APR'], 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[SEASON] 有配置', False); return
    q = next((x for x in stalls_of(Ly, 'buy') if KIND[x['kind']] == 's10'), None)
    if not R.check('[SEASON] 配置有阿婆甜湯（s10）', bool(q)): return
    # r2（CC 01:2x）：「還沒開」那一次改在邊界前 5 分鐘按——PC 上讀檔到按下去時間走了約 1 分鐘，13:59 按到的是 14:00（已開），look 被那一次念掉、後面「第一次按念 look」連帶 FAIL（TEST_BUG）
    for dk, closed_h, open_h in ((DAYS['JUL'], 13 + 55 / 60, 14 + 1 / 60), (DAYS['DEC'], 16 + 55 / 60, 17 + 1 / 60), (DAYS['APR'], 14 + 1 / 60, 17 + 1 / 60)):
        m = month_of(dk); E = exp_of(q['kind'], m); tg = '[SEASON %d 月 %s]' % (m, dk)
        R.note('%s 稿：季節 %s；開 %s～%s；look %d 句；greet 清單 %s' % (tg, E['season'] or '一般', hhmm(E['hours'][0]), hhmm(E['hours'][1]), len(E['look']), J(E['greet'])))
        try:
            await look_only_closed(pg, cdp, q, dk, closed_h, '%s %s' % (tg, hhmm(closed_h)))
            btn = await go_stall(pg, cdp, q, dk, open_h, wait=1500)
            if not R.check('%s %s 互動鍵寫「%s」' % (tg, hhmm(open_h), E['label']), btn == E['label'], btn): continue
            gp = await pg.evaluate("(([k,m])=>typeof NM3!=='undefined'&&NM3.greetPool?NM3.greetPool(k,m):null)", [E['key'], m])
            R.check('%s 【程式內部】NM3.greetPool(s10,%d)＝稿的 greet%s' % (tg, m, {'summer': '＋greetSummer', 'winter': '＋greetWinter'}.get(E['season'], '（只有一般的）')), gp == E['greet'], J(gp))
            greets = []
            for k in range(4):
                r = await press(pg, cdp, '%s %s 第 %d 次' % (tg, hhmm(open_h), k + 1))
                if k == 0:
                    press_sync('%s 第 1 次' % tg, r, q['id'], E)
                    nl = len(E['look'])
                    R.check('%s %s 開著、第一次按：look %d 句逐句對稿（%s）' % (tg, hhmm(r['h0'] or open_h), nl, {'summer': '多 lookSummer', 'winter': '多 lookWinter'}.get(E['season'], '只有一般的')), [t for _, t in r['pre'][:nl]] == E['look'], '畫面 %s；稿 %s' % (J(r['pre'][:nl]), J(E['look'])))
                    R.check('%s 有品項選單（買得到）' % tg, bool(r['menus']), J(r['lines']))
                    line = r['pre'][nl] if len(r['pre']) > nl else None
                else:
                    R.check('%s 第 %d 次不再念 look' % (tg, k + 1), not [t for _, t in r['pre'] if t in E['look']], J(r['pre']))
                    line = r['pre'][0] if r['pre'] else None
                check_greet('%s 第 %d 次' % (tg, k + 1), line, E)
                if line: greets.append(line[1])
            extra = [t for t in greets if t not in DR['stalls']['s10']['greet']]
            R.note('%s 4 次招呼：%s；其中季節句 %s' % (tg, J(greets), J(extra)))
        except Exception as e: R.check('%s 沒有中斷' % tg, False, repr(e)[:300])


async def look_only_closed(pg, cdp, q, dk, h, tag):
    E = exp_of(q['kind'], month_of(dk))
    btn = await go_stall(pg, cdp, q, dk, h, wait=1500); g = await stall_now(pg, q['id'])
    if not R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], btn): return
    r = await press(pg, cdp, tag); press_sync(tag, r, q['id'], E)
    R.check('%s 還沒開（按的時候 %s）：只有 closed 一句、沒有選單；模型收著' % (tag, hhmm(r['h0'] or h)), [t for _, t in r['lines']] == [E['closed']] and not r['menus'] and bool(g) and g['openVis'] is False, J({'lines': r['lines'], 'menus': r['menus'], 'model': g}))


async def part_gg(pg, cdp):
    await load(pg, cdp, 'gongguan', DAYS['GG'], 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[GG] 有配置', False); return
    G3 = stalls_of(Ly, 'gg'); R.note('[GG] 公館三攤：%s' % J([(q['id'], q['kind'], q['x'], q['z']) for q in G3]))
    R.check('[GG] 公館有三攤（鮮奶、紅豆餅、手機殼）', sorted(q['kind'] for q in G3) == ['milk', 'phonecase', 'wheelcake'], J([q['kind'] for q in G3]))
    for q in G3:
        E = exp_of(q['kind'], month_of(DAYS['GG']))
        try:
            if E['bg']:
                await look_only(pg, cdp, q, DAYS['GG'], 20.0, '[GG %s 20:00]' % q['id'], True)
                to = (Ly['kinds'].get(q['kind']) or {}).get('to') or 22
                await look_only(pg, cdp, q, DAYS['GG'], to + 0.5, '[GG %s %s]' % (q['id'], hhmm(to + 0.5)), False)
            else:
                s = await stall_full(pg, cdp, q, DAYS['GG'], 20.0, 'GG', two=False, poor=False)
                R.note('[GG 摘要] %s' % J(s))
                h = E['hours'][1] + 0.5; tag = '[GG %s %s %s]' % (q['id'], E['name'], hhmm(h))
                btn = await go_stall(pg, cdp, q, DAYS['GG'], h, wait=5000)
                if R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], btn):
                    r = await press(pg, cdp, tag); yu, txt = has_yuan(r)
                    R.check('%s 收攤：只有 closed 一句、沒有選單、沒有「元」' % tag, [t for _, t in r['lines']] == [E['closed']] and not r['menus'] and not yu, J(r['lines']))
        except Exception as e: R.check('[GG %s] 沒有中斷' % q['id'], False, repr(e)[:300])


# ---------------------------------------------------------------- 存讀檔
SLOT_BTN = r"""(([i,label])=>{ const box=document.getElementById('saveSlots'); if(!box) return null; const it=[...box.querySelectorAll('.item')].find(x=>{ const b=x.querySelector('b'); return b&&(b.textContent||'').trim()==='欄位 '+i; });
  if(!it) return null; const btn=[...it.querySelectorAll('button')].find(b=>(b.textContent||'').trim()===label); if(!btn) return null; document.querySelectorAll('#__nm2btn').forEach(e=>e.removeAttribute('id')); btn.id='__nm2btn'; return (it.innerText||'').replace(/\s+/g,' ').slice(0,140); })"""
SLOT_SUM = r"""(i=>{ try{ const s=GAME.readSave?GAME.readSave('fatiao3d_slot_'+i):(GAME.readSave?GAME.readSave('fatiao3d_slot_'+i):JSON.parse(localStorage.getItem('fatiao3d_slot_'+i)||'null')); return s?{day:s.day, key:CALENDAR.dateOf(s.day).key, h:+(+s.hour).toFixed(3), money:s.money, zone:s.zone, pos:s.pos, keys:Object.keys(s).length}:null; }catch(e){ return 'ERR '+e; } })"""


async def ui_save(pg, cdp, tag, i):
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu [data-tab="save"]'); await pg.wait_for_timeout(900)
    row = await pg.evaluate(SLOT_BTN, [i, '存檔'])
    if row is None: R.check('%s 存檔頁有欄位 %d 的「存檔」' % (tag, i), False); await L.close_panels(pg, cdp); return None
    await L.tap(pg, cdp, '#__nm2btn'); await pg.wait_for_timeout(1500)
    await L.close_panels(pg, cdp)
    sm = await pg.evaluate(SLOT_SUM, i); R.note('%s ☰ → 存檔 → 欄位 %d「存檔」（觸控）→ %s' % (tag, i, J(sm))); return sm


async def ui_load_ingame(pg, cdp, tag, i):
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu [data-tab="save"]'); await pg.wait_for_timeout(900)
    row = await pg.evaluate(SLOT_BTN, [i, '讀取'])
    if row is None: R.check('%s 遊戲中存檔頁有欄位 %d 的「讀取」' % (tag, i), False); await L.close_panels(pg, cdp); return False
    await L.tap(pg, cdp, '#__nm2btn'); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    R.note('%s ☰ → 存檔 → 欄位 %d「讀取」（觸控；%s）' % (tag, i, row)); return True


async def title_load(pg, cdp, tag, i):
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1300)
    row = await pg.evaluate(SLOT_BTN, [i, '讀取'])
    if row is None: R.check('%s 標題「讀取」有欄位 %d' % (tag, i), False); return False
    await L.tap(pg, cdp, '#__nm2btn')
    for _ in range(240):
        if await pg.evaluate("document.getElementById('titleScreen').classList.contains('hide')&&!!GAME.G&&!!GAME.E&&!!GAME.E.player"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    R.note('%s 標題「讀取／匯入存檔」→ 欄位 %d「讀取」（觸控；%s）' % (tag, i, row)); return True


async def reload_page(pg, tag):
    await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('%s 重新整理後遊戲載入' % tag, ok, '')
    await hook(pg)
    await pg.evaluate("(()=>{ if(typeof EVENTS!=='undefined'){ EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; } if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; })()")
    R.setup('%s 重新整理後關掉條件事件、手機自動打開（同 load_state quiet_events；只測夜市）' % tag)
    return ok


async def part_save(pg, cdp, errs):
    day = DAYS['SAVE']; await load(pg, cdp, 'tingzhou', day, 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[SAVE] 有配置', False); return
    q = next((x for x in stalls_of(Ly, 'buy') if x['kind'] == 'ball'), None) or stalls_of(Ly, 'buy')[0]
    E = exp_of(q['kind'], month_of(day)); tag = '[SAVE %s %s]' % (q['id'], E['name'])
    btn = await go_stall(pg, cdp, q, day, 20.0)
    if not R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], btn): return
    r1 = await press(pg, cdp, tag + ' 第一次', pick=lambda m: 0)
    R.check('%s 第一次按念 look' % tag, [t for _, t in r1['pre'][:len(E['look'])]] == E['look'], J(r1['pre']))
    m_after = r1['m1']; R.check('%s 買「%s」扣 %d' % (tag, E['items'][0]['name'], E['items'][0]['price']), (r1['m0'] or 0) - (m_after or 0) == E['items'][0]['price'], J([r1['m0'], m_after]))
    sm = await ui_save(pg, cdp, tag, 1)
    R.check('%s 欄位 1 的錢＝買完的錢 %s' % (tag, m_after), isinstance(sm, dict) and sm.get('money') == m_after, J(sm))
    # ① 遊戲中讀
    await pg.evaluate("v=>{ GAME.G.money=v; if(GAME.money) GAME.money(0); }", 1234); R.setup('%s 【捷徑】讀檔前把錢改成 1234（看讀進來的是存檔的錢）' % tag)
    if await ui_load_ingame(pg, cdp, tag + '①', 1):
        g = await pg.evaluate("({money:GAME.G.money, zone:GAME.G.zone, h:+GAME.G.hour})")
        R.check('%s① 遊戲中讀欄位 1：錢＝%s' % (tag, m_after), g['money'] == m_after, J(g))
        btn = (await L.state(pg))['interact']
        if btn != E['label']: btn = await go_stall(pg, cdp, q, day, g['h'], money=g['money'], why='（讀檔後鍵不是這一攤：重站；錢照讀進來的）')
        r = await press(pg, cdp, tag + '① 再按')
        R.note('%s① 讀檔後再按：%s念 look（BB 00:45：讀檔後再念一次只記不判）' % (tag, '又' if [t for _, t in r['pre'] if t in E['look']] else '不'))
    # ② 重新整理 → 標題讀
    await reload_page(pg, tag + '②')
    if await title_load(pg, cdp, tag + '②', 1):
        g = await pg.evaluate("({money:GAME.G.money, zone:GAME.G.zone, h:+GAME.G.hour, key:CALENDAR.dateOf(GAME.G.day).key})")
        R.check('%s② 重新整理 → 標題讀欄位 1：錢＝%s、同一天、汀州路' % (tag, m_after), g['money'] == m_after and g['key'] == day and g['zone'] == 'tingzhou', J(g))
        btn = (await L.state(pg))['interact']
        if btn != E['label']:
            pt = await pg.evaluate(NMPT, q['id'])
            if pt: await L.go_to(pg, cdp, R, pt['x'], pt['z'], 0.35, '%s② 走回攤前' % tag, max_s=45)
        r = await press(pg, cdp, tag + '② 再按')
        R.note('%s② 重新整理再讀、同一天再按：%s念 look（BB 00:45：只記不判；「今天看過」只在記憶體）' % (tag, '又' if [t for _, t in r['pre'] if t in E['look']] else '不'))


async def part_old(pg, cdp, errs):
    tag = '[OLD]'
    if not os.path.exists(OLDSAVE): R.check('%s 有舊存檔 %s' % (tag, OLDSAVE), False); return
    raw = json.load(open(OLDSAVE, encoding='utf-8'))
    await load(pg, cdp, 'gongguan', '2025-11-01', 20.0, None, None, why='（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('%s 有配置' % tag, False); return
    q = next((x for x in stalls_of(Ly, 'gg') if x['kind'] == 'milk'), None)
    if not R.check('%s 公館有鮮奶攤' % tag, bool(q)): return
    E = exp_of(q['kind'], month_of(await pg.evaluate("(d=>CALENDAR.dateOf(d).key)(%d)" % raw['day']))); fx, fz = math.sin(q['yaw']), math.cos(q['yaw'])
    st = copy.deepcopy(raw); st['zone'] = 'gongguan'; st['hour'] = 20.0; st['pos'] = {'x': q['x'] + fx * 1.9, 'z': q['z'] + fz * 1.9, 'yaw': 0, 'lv': 0, 'y': 0}
    R.setup('%s 舊存檔 %s（v=%s、存的時間 %s、day %s、原本 %s %s、錢 %s）；【捷徑】只改 zone→gongguan、hour→20:00、pos→鮮奶攤前 1.9 m；寫進欄位 1、清自動存檔；重新整理 → 標題讀'
            % (tag, os.path.relpath(OLDSAVE, HERE), raw.get('v'), time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime((raw.get('savedAt') or 0) / 1000)), raw.get('day'), raw.get('zone'), hhmm(raw.get('hour') or 0), raw.get('money')))
    await pg.evaluate("s=>{ localStorage.removeItem('fatiao3d_auto'); localStorage.removeItem('fatiao3d_quick'); localStorage.setItem('fatiao3d_slot_1', s); }", json.dumps(st, ensure_ascii=False))
    n_err = len(errs)
    await reload_page(pg, tag)
    if not await title_load(pg, cdp, tag, 1): return
    g = await pg.evaluate("({money:GAME.G.money, zone:GAME.G.zone, h:+GAME.G.hour, key:CALENDAR.dateOf(GAME.G.day).key, v:GAME.G.v})")
    R.check('%s 讀進來：公館、錢＝存檔的 %s' % (tag, raw.get('money')), g['zone'] == 'gongguan' and g['money'] == raw.get('money'), J(g))
    btn = (await L.state(pg))['interact']
    if btn != E['label']:
        pt = await pg.evaluate(NMPT, q['id'])
        if pt: await L.go_to(pg, cdp, R, pt['x'], pt['z'], 0.35, '%s 走到鮮奶攤' % tag, max_s=45)
        btn = (await L.state(pg))['interact']
    if not R.check('%s 互動鍵寫「%s」' % (tag, E['label']), btn == E['label'], btn): return
    r = await press(pg, cdp, tag, pick=lambda m: 0)
    R.check('%s 買得到「%s」扣 %d' % (tag, E['items'][0]['name'], E['items'][0]['price']), bool(r['menus']) and (r['m0'] or 0) - (r['m1'] or 0) == E['items'][0]['price'], J({k: r[k] for k in ('m0', 'm1', 'picked')}))
    R.check('%s 讀舊存檔、買東西：沒有 JS 例外' % tag, len(errs) == n_err, J(errs[n_err:n_err + 3]))


async def main():
    print('CC NM2 夜市能看能買：PARTS %s；STALLS %s；SHA %s；稿 %s；Playwright ≠ iPhone' % (','.join(PARTS), ','.join(ONLY) or '全部', SHA, os.path.relpath(DRAFT_DIR, HERE)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.note('記錄層：%s（包 GAME.say／choose／toast 只記錄，照原樣呼叫）' % await hook(pg))
        for part, fn in (('OPEN', part_open), ('CLOSED', part_closed), ('EDGE', part_edge), ('BG', part_bg), ('SEASON', part_season), ('GG', part_gg), ('SAVE', part_save), ('OLD', part_old)):
            if part not in PARTS: continue
            try:
                if part in ('SAVE', 'OLD'): await fn(pg, cdp, errs)
                else: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        hit = {k: [t[:80] for t in SEEN if k in t] for k in BAD}
        R.check('畫面上沒有出現「%s」（整個過程收到 %d 段字）' % ('」「'.join(BAD), len(SEEN)), not any(hit.values()), J(hit))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
