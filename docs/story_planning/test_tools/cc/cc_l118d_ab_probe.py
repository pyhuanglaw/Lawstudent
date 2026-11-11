"""CC（帳號 A）11-11：L118D_A／L118D_B——118 巷九間店改名改菜單＋兩間外帶飲料店（L118-SHOPS-REDO-1111，USER_WANTS X338；
使用者規格 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md；BB_335 驗收清單 A、B 節）。Playwright 手機模擬（橫向 844×390）≠ iPhone 實機。

A 名稱（畫面上抽字，不是讀資料）：
  在畫面上真的顯示的 DOM 掛 MutationObserver（#dlgText＋#dlgName、#choices、#interactLabel、#clockZ（左上角的地點）、#toast、#caption、#phoneBody），
  每一段顯示過的字都記下來（打字效果的半句併成一句）；最後彙總「畫面上出現的店名、菜名」清單，對舊名表歸零（舊店名九個＋簡稱；舊菜名來自線上版 779ddd650 的
  src/data/lane118_shops.js，扣掉和新菜單撞名的：石鍋拌飯、青醬培根麵、美式咖啡、拿鐵、排骨飯、自助餐（三菜一肉））。
  每間店逐項：店門口互動鍵「進{新店名}（{類型}）」（飲料店＝「{新店名}（…）」）、左上角地點「{新店名}（118 巷）」、室內「點餐（{新店名}）」、「離開{新店名}」、
  點餐選單（按「不用了」不買）；手機「地點」頁（快速前往）在巷子裡、每間店裡各抽一次。
  邀約選單、熟客招呼（AA_311 第 2 節三段）、午餐邀約的 {店名}：本探針不觸發——交給 E 探針（X339 午餐邀約）。
B 菜單：
  每間店的每一樣點一次（點畫面上的選項，觸控）：選項上的標價＝規格表的價錢＝扣的錢（點前、點完那一句、整段演完各記 GAME.G.money 和右上角 #money）；
  錢不夠：【前置】把錢設成比最便宜那樣少 1 元 → 選項是灰的（.dim）、點了出「錢不夠」、錢不變、不會變負；大學食堂（cafe2）三個份量 100／130／160；
  喝不喝咖啡（drink_a）7 樣、果茶社（drink_b）6 樣在店門口點：記互動點位置、站在那裡時範圍內有幾個互動點（候選）、畫面上的互動鍵是哪一個、
  它是不是最上層（elementFromPoint）、點下去回話的是哪一間店（招呼那一句）。
  每點完一樣，遊戲時間會往前走（一餐 40 分鐘）：【前置／捷徑】把 GAME.G.hour 設回 HOUR，才點得到下一樣（營業時間內）。
走路：每間店【前置】讀檔到那間店門口附近的人行道（離店門互動點約 4 m）→ 搖桿（CDP 觸控按在 #joy）走進互動範圍；搖桿推不動才改點地面（playlib.go_to，也是觸控），會印出來。
讀檔、設時間、設錢＝【前置／捷徑】，輸出有標。不用 ?turbo、不瞬移。
環境變數：
  PARTS  A、B 或 A,B（預設 A,B；同一間店兩段都跑時只進店一次）
  SHOPS  逗號分隔（預設全部 11 間：dian,self,tea,home,cafe2,pasta,korea,omu,noodle2,drink_a,drink_b）
  DATE   日期（預設自動挑：學期中的週三、不是假日、不是颱風假，2025-09-24 起；九間店週三都有開——週二 118牛排休、週一義大麵屋和奈良咖哩休、週四披薩休）
  HOUR   預設 12.17（12:10）
  PHONE  1＝A 段抽手機「地點」頁（預設 1）
  QUIET  1＝讀檔時關條件事件和手機自動打開（預設 1；118 巷點餐不是條件事件，照演）
  PORTRAIT 1＝直向 390×844（預設橫向，和 tests/flow_l118_shops.py 一樣）
  ITEMS_MAX 只點每間的前 N 樣（預設 0＝全部；雲端自檢用，正式跑不要設）
用法：LW_TESTS=<worktree>/tests SHA=<sha> PARTS=A SHOPS=dian,self python3 cc_l118d_ab_probe.py <url> <out>"""
import os, sys, re, json, time, math, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out_l118d'
os.makedirs(OUT, exist_ok=True)
J = lambda o: json.dumps(o, ensure_ascii=False)
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or 'A,B').split(',') if p.strip()]
ALL = ['dian', 'self', 'tea', 'home', 'cafe2', 'pasta', 'korea', 'omu', 'noodle2', 'drink_a', 'drink_b']
SHOPS = [s.strip() for s in (os.environ.get('SHOPS') or ','.join(ALL)).split(',') if s.strip()]
HOUR = float(os.environ.get('HOUR') or 12.17)
PHONE = (os.environ.get('PHONE') or '1') == '1'
QUIET = (os.environ.get('QUIET') or '1') == '1'
PORTRAIT = (os.environ.get('PORTRAIT') or '0') == '1'
ITEMS_MAX = int(os.environ.get('ITEMS_MAX') or 0)   # 0＝每一樣都點（正式跑）；雲端自檢可以只點前幾樣
MONEY0 = 5000
DATES = [os.environ['DATE']] if os.environ.get('DATE') else ['2025-09-24', '2025-10-01', '2025-10-15', '2025-10-22', '2025-10-29', '2025-11-05']

# ---- 規格（使用者原文 L118_SHOPS_REDO_1111.md 第一、二節；飲料店名照最後的補充）：不讀遊戲資料，拿來對畫面 ----
SPEC = {
    'dian': ('118牛排', '夜市鐵板牛排', [('鐵板牛排', 190), ('雪花牛排', 230), ('雞排', 180), ('豬排', 170), ('雙拼', 280)]),
    'self': ('水上便當', '雞腿、雞排便當', [('炸雞腿飯', 145), ('雞排飯', 135), ('滷雞腿飯', 130), ('排骨飯', 125), ('雙拼', 165)]),
    'tea': ('辛亥韓食', '韓式鍋物、鐵板烤肉', [('泡菜鍋', 190), ('海鮮豆腐鍋', 210), ('鐵板豬肉', 200), ('鐵板牛肉', 230), ('石鍋拌飯', 180)]),
    'home': ('五湖四海', '水餃店', [('高麗菜水餃10顆', 80), ('韭菜水餃10顆', 85), ('酸辣湯', 45), ('玉米濃湯', 45)]),
    'cafe2': ('大學食堂', '秤重自助餐', None),   # 秤重：規格只寫一餐約 100–160；BB_335 第 6 條：三個份量 100／130／160
    'pasta': ('義大麵屋', '平價義大利麵', [('番茄肉醬麵', 170), ('奶油雞肉麵', 190), ('青醬培根麵', 190), ('蒜香蛤蜊麵', 210)]),
    'korea': ('清州刀削麵', '刀削麵館', [('牛肉刀削麵', 190), ('番茄刀削麵', 150), ('木須炒刀削麵', 170), ('炸醬刀削麵', 140)]),
    'omu': ('奈良咖哩', '日式咖哩飯', [('豬排咖哩', 190), ('雞肉咖哩', 180), ('牛肉咖哩', 210), ('可樂餅咖哩', 170)]),
    'noodle2': ('迪倫窯烤披薩', '個人窯烤披薩', [('瑪格麗特', 180), ('夏威夷', 200), ('燻雞蘑菇', 210), ('四種起司', 230)]),   # 規格「個人尺寸瑪格麗特」：品名不含「個人尺寸」也算對（印出來給 BB 判）
    'drink_a': ('喝不喝咖啡', None, None),   # 傳統台式手搖飲兼賣咖啡，約 $30–75
    'drink_b': ('果茶社', None, None),       # 水果茶與鮮果飲（多多系列），約 $50–95
}
CAFE2_PRICES = [100, 130, 160]
DRINK_RANGE = {'drink_a': (30, 75, 7, r'咖啡|拿鐵'), 'drink_b': (50, 95, 6, r'多多')}
OLD_SHOP_NAMES = ['滇香小館', '好家自助餐', '一一八茶飲', '巷口家常菜', '慢讀咖啡', 'Pasta 118', '韓食小廚', '蛋包飯研究所', '六張犁麵舖']
OLD_SHORT = ['滇香', '滇緬', '好家', '一一八', '家常菜', '慢讀', '韓食小廚', '蛋包飯', '六張犁']   # 簡稱（tests/l118_old_names_zero_unit.js 的 NAMES）
# 舊菜名：git show 779ddd650:src/data/lane118_shops.js 的九間 menu（扣掉新菜單也有的：石鍋拌飯、青醬培根麵、美式咖啡、拿鐵、排骨飯、自助餐（三菜一肉））
OLD_ITEMS = ['椒麻雞飯', '酸辣河粉', '打拋豬飯', '自助餐（兩菜一雞腿）', '加滷蛋', '紅茶拿鐵', '檸檬綠', '無糖綠茶', '雞腿便當', '番茄炒蛋（單點）', '今日蛋糕',
             '白醬雞肉麵', '番茄海鮮麵', '泡菜豆腐鍋', '海苔飯捲', '咖哩蛋包飯', '番茄醬蛋包飯', '牛肉麵', '乾麵＋滷蛋', '餛飩湯',
             '椒麻雞', '打拋豬', '兩菜一雞腿', '大碗加蛋', '番茄炒蛋']   # 後四個是 l118_old_names_zero_unit.js 的 ITEMS 裡的簡寫
SKIP = [('檸檬綠茶', '檸檬綠'), ('慢慢讀', '慢讀')]   # 撞字：果茶社的「檸檬綠茶」、「點杯咖啡慢慢讀」——遮掉再比
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}
R = L.Run('l118d_ab', OUT)

# ---- 畫面上的字：MutationObserver（看得到的才記；打字效果的半句併成一句）----
OBS_JS = r"""(()=>{ if(window.__ccObs) return window.__ccTxt.length; const T=window.__ccTxt=[]; const last={};
  const ids=['dlgText','choices','interactLabel','clockZ','toast','caption','phoneBody'];
  const shown=e=>{ let x=e; while(x&&x!==document.body){ if(x.classList&&x.classList.contains('hide')) return false; const cs=getComputedStyle(x); if(cs.display==='none'||cs.visibility==='hidden') return false; x=x.parentElement; } return e.getClientRects().length>0; };
  const grab=(id,e)=>id==='choices'?[...e.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).join(' ｜ '):(e.innerText||e.textContent||'').replace(/[ \t]+\n/g,'\n').trim();
  for(const id of ids){ const e=document.getElementById(id); if(!e) continue;
    const rec=()=>{ if(!shown(e)) return; const t=grab(id,e); if(!t) return; const nm=id==='dlgText'?((document.getElementById('dlgName')||{}).textContent||'').trim():'';
      const L=last[id]; if(L&&L.nm===nm&&(t===L.t||t.startsWith(L.t))&&T.length-L.i<6){ L.t=t; T[L.i].t=t; return; }
      const G=typeof GAME!=='undefined'?GAME.G:null; T.push({id,nm,t,zone:G?G.zone:'',h:G?+(+G.hour).toFixed(2):null}); last[id]={i:T.length-1,t,nm}; };
    new MutationObserver(rec).observe(e,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']}); rec(); }
  window.__ccObs=true; return T.length; })()"""
TXT_FROM = "(n=>(window.__ccTxt||[]).slice(n))"
IT_JS = r"""(()=>{ const b=document.getElementById('interact'), lb=document.getElementById('interactLabel'); if(!b) return {shown:false,t:''};
  const cs=getComputedStyle(b), shown=!b.classList.contains('hide')&&cs.display!=='none'&&cs.visibility!=='hidden'&&b.getClientRects().length>0; let top=null;
  if(shown){ const r=b.getBoundingClientRect(), h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); top=h?(h===b||b.contains(h)?'interact':(h.id||h.className||h.tagName)):null; }
  const n=[...document.querySelectorAll('#interact')].filter(x=>!x.classList.contains('hide')&&x.getClientRects().length).length;
  return {shown, t:shown?((lb||b).textContent||'').trim():'', top, n}; })()"""
CHOICES_JS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].filter(b=>b.getClientRects().length).map((b,i)=>({i,t:(b.innerText||'').replace(/\s+/g,' ').trim(),dim:b.classList.contains('dim')})); })()"""
TAP_CHOICE_JS = r"""(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.getClientRects().length)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"""
MONEY_JS = r"""(()=>({g:GAME.G.money, hud:((document.getElementById('money')||{}).textContent||'').trim()}))()"""
CLOCKZ_JS = r"""(()=>((document.getElementById('clockZ')||{}).textContent||'').trim())()"""
NEAR_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position; return E.interactables.filter(i=>!i.hidden&&Math.hypot(i.x-P.x,i.z-P.z)<(i.radius||1.8)).map(i=>({label:i.label||'',d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2),r:i.radius||1.8,prio:i.prio||0,x:+i.x.toFixed(2),z:+i.z.toFixed(2)})); })()"""
DOOR_JS = r"""(id=>{ const its=GAME.E.interactables.filter(i=>i.shop118===id||(i.exit&&i.exit.to==='l118_'+id)); return its.map(i=>({x:i.x,z:i.z,r:i.radius||1.4,label:i.label,hidden:!!i.hidden,enter:!!i.exit})); })"""
INSIDE_JS = r"""(()=>{ const its=GAME.E.interactables; const o=its.find(i=>i.shop118); const x=its.find(i=>i.exit&&i.exit.to==='lane118'); return {order:o?{x:o.x,z:o.z,r:o.radius||0.8}:null, exit:x?{x:x.x,z:x.z,r:x.radius||0.7}:null}; })()"""
LAYOUT_JS = r"""(()=>{ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null; if(!L) return null; const fw=L.facade.west, fe=L.facade.east;
  return {fw,fe,shops:L.shops.map(s=>({id:s.id,side:s.side,x:s.side==='W'?fw+0.9:fe-0.9,z:(s.z0+s.z1)/2,z0:s.z0,z1:s.z1})), lamps:[-30,-10,10,28].map(z=>[fe-0.35,z])}; })()"""
DAYS_JS = r"""(ks=>ks.map(k=>{ const d=STORY.dayOfKey(k), x=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); return {k,d,wd:x.wd%7,hol:CALENDAR.holiday(d),ty:CALENDAR.typhoon(d),term:t?t.id:null,week:t?t.week:null}; }))"""
OPEN_JS = r"""(()=>{ const G=GAME.G; const sh=(typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS.shops:[]); return sh.map(s=>({id:s.id, open:typeof L118!=='undefined'&&L118.isOpen?!!L118.isOpen(s.id,G):null, note:typeof SIDEQ!=='undefined'&&SIDEQ.closedNote?SIDEQ.closedNote(G,s.id):null})); })()"""

SEEN = []          # 全部看得到的字（彙總用）
_mark = [0]        # 已經印到第幾筆
STAT = {}          # 每間店的摘要


def norm_spec(n):
    return n.replace('個人尺寸', '')


def old_hits(t):
    s = t
    for a, b in SKIP:
        s = s.replace(a, '〇' * len(a))
    out = []
    for w in OLD_SHOP_NAMES + OLD_SHORT + OLD_ITEMS:
        if w in s:
            out.append(w)
    return out


async def flush(pg, tag):
    """把新出現在畫面上的字逐字印出來（BB 要逐字 log）"""
    new = await pg.evaluate("(%s)(%d)" % (TXT_FROM, _mark[0]))
    for e in new:
        SEEN.append(dict(e, tag=tag))
        t = e['t'] if e['id'] != 'phoneBody' else re.sub(r'\s+', ' ', e['t'])[:500] + ('…（全文存檔）' if len(e['t']) > 500 else '')
        print('  逐字｜%s｜%s｜%s%s｜%s' % (tag, e['zone'], e['id'], ('｜' + e['nm']) if e['nm'] else '', t.replace('\n', ' ⏎ ')), flush=True)
    _mark[0] += len(new)


async def st(pg):
    return await L.state(pg)


async def money(pg):
    return await pg.evaluate(MONEY_JS)


async def it_label(pg, want=None, wait_s=4.0):
    t0 = time.time(); r = await pg.evaluate(IT_JS)
    while want and not r['t'].startswith(want) and time.time() - t0 < wait_s:
        await pg.wait_for_timeout(300); r = await pg.evaluate(IT_JS)
    return r


async def talk_idle(pg, cdp, tag, max_s=60):
    """路上跳出來的對話（不是點餐）：照第一個選項點完"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['choices']:
            await pg.wait_for_timeout(600); c = await pg.evaluate("(%s)(0)" % TAP_CHOICE_JS)
            if c: await L.touch_tap(cdp, c[0], c[1])
            await pg.wait_for_timeout(800); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if not s['busy']: break
        await pg.wait_for_timeout(400)
    await flush(pg, tag)


async def joy_to(pg, cdp, tx, tz, near, label, max_s=150):
    """搖桿（CDP 觸控按 #joy，往鏡頭座標換算的方向推）走到 (tx,tz) near 公尺內；連續 6 次沒有更近就改點地面（L.go_to）。回傳 (到了沒, 方法)"""
    t0 = time.time(); best = 1e9; stall = 0; pushes = 0
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['dlg'] or s['choices']:
            await talk_idle(pg, cdp, label); continue
        if s.get('paused'):
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(500); continue
        d = math.hypot(tx - s['x'], tz - s['z'])
        if d <= near:
            R.note('搖桿走到「%s」（%.2f m，推 %d 次，%.0f 秒）' % (label, d, pushes, time.time() - t0)); return True, '搖桿'
        if d < best - 0.12: best = d; stall = 0
        else: stall += 1
        if stall >= 6: break
        yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        ux, uz = (tx - s['x']) / d, (tz - s['z']) / d
        ms = int(min(1100, max(330, d * 420)))
        await L.joystick(pg, cdp, int(38 * (ux * rx + uz * rz)), int(-38 * (ux * fx + uz * fz)), ms); pushes += 1
        await pg.wait_for_timeout(250)
    R.note('「%s」搖桿推不到（推 %d 次、最近 %.2f m），改點地面（L.go_to，也是觸控）' % (label, pushes, best))
    ok = await L.go_to(pg, cdp, R, tx, tz, near, label, max_s=240)
    return ok, '點地面'


async def scene(pg, cdp, tag, pick, max_s=110):
    """點下互動鍵以後的整段：對話點過去；出現選單（兩個以上「… N 元」）時由 pick(選項) 決定點哪一個（回傳索引）；其他選項點第一個。
    回傳 {menu:[{t,dim,name,price}], picked, m_pick（點選單前）, m_line（「你點了」那一句出來時）, m_end, toast:[…]}"""
    res = {'menu': None, 'picked': None, 'm_pick': None, 'm_line': None, 'm_end': None, 'other': []}
    t0 = time.time(); idle = None; mk = (await pg.evaluate("(window.__ccTxt||[]).length"))
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['choices']:
            idle = None; await pg.wait_for_timeout(650)   # 選項剛出來太快點會被吃掉（game3d.js tapTooSoon）
            opts = await pg.evaluate(CHOICES_JS)
            for o in opts:
                m = re.match(r'^(.+?)\s+(\d+)\s*元', o['t']); o['name'], o['price'] = (m.group(1), int(m.group(2))) if m else (None, None)
            k = 0
            if sum(1 for o in opts if o['price'] is not None) >= 2:
                res['menu'] = opts; res['m_pick'] = await money(pg)
                k = pick(opts)
                res['picked'] = opts[k]['t'] if k is not None and k < len(opts) else None
                if k is None: k = len(opts) - 1
            else:
                res['other'].append([o['t'] for o in opts])
            c = await pg.evaluate("(%s)(%d)" % (TAP_CHOICE_JS, k))
            if c: await L.touch_tap(cdp, c[0], c[1])
            before = [o['t'] for o in opts]
            for _ in range(8):   # 等選項收起來（沒收＝再點一次）
                await pg.wait_for_timeout(300)
                if [o['t'] for o in (await pg.evaluate(CHOICES_JS))] != before: break
            else:
                if c: await L.touch_tap(cdp, c[0], c[1])
            continue
        if s['dlg']:
            idle = None
            if res['picked'] and res['m_line'] is None and '你點了' in (s['dtext'] or ''): res['m_line'] = await money(pg)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if not s['busy']:
            idle = idle or time.time()
            if time.time() - idle > 1.6: break
        else: idle = None
        await pg.wait_for_timeout(350)
    res['m_end'] = await money(pg)
    tx = await pg.evaluate("(n=>(window.__ccTxt||[]).slice(n).filter(e=>e.id==='toast').map(e=>e.t))(%d)" % mk)
    res['toast'] = tx
    await flush(pg, tag)
    return res


async def phone_scan(pg, cdp, tag):
    """手機「地點」頁（快速前往）：抽畫面上的字、存全文"""
    if not await L.tap(pg, cdp, '#btnPhone'):
        R.check('%s 手機按鈕按得到' % tag, False); return None
    await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1200)
    txt = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')")
    open(os.path.join(OUT, 'phone_%s.txt' % re.sub(r'\W+', '_', tag)), 'w', encoding='utf-8').write(txt)
    await R.shot(pg, '%s_phone_places' % tag)
    rows = [ln for ln in txt.split('\n') if '118' in ln]
    R.note('%s 手機「地點」有 118 的那幾行：%s' % (tag, J(rows[:8])))
    hits = old_hits(txt)
    R.check('A %s 手機「地點」（快速前往）頁沒有舊店名、舊菜名' % tag, not hits, '命中 %s' % J(hits) if hits else '%d 字' % len(txt))
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
    await L.close_panels(pg, cdp)
    await flush(pg, tag)
    return txt


def spawn_for(lay, sid):
    """店門口附近的人行道：同一側、離門口 4～5.5 m、離別間店門 2.4 m 以上、離路燈 1.2 m 以上"""
    me = next((s for s in lay['shops'] if s['id'] == sid), None)
    if not me: return None
    x = -3.9 if me['side'] == 'W' else 3.9
    for dz in (4.0, -4.0, 5.0, -5.0, 3.4, -3.4):
        z = me['z'] + dz
        if any(math.hypot(o['x'] - x, o['z'] - z) < 2.4 for o in lay['shops'] if o['id'] != sid): continue
        if any(math.hypot(a - x, b - z) < 1.2 for a, b in lay['lamps']): continue
        yaw = math.atan2(me['x'] - x, me['z'] - z)
        return {'x': x, 'z': z, 'yaw': yaw, 'door': [me['x'], me['z']]}
    return {'x': x, 'z': me['z'] + 4.0, 'yaw': 0.0, 'door': [me['x'], me['z']]}


async def load_at(pg, day, wd, pos, why):
    R.setup('讀檔：%s %s 118 巷 (%.2f, %.2f)，%.2f 點、錢 %d、QUIET=%s（%s）' % (DAY['k'], '週' + '日一二三四五六'[wd % 7], pos['x'], pos['z'], HOUR, MONEY0, QUIET, why))
    await L.load_state(pg, {'zone': 'lane118', 'hour': HOUR, 'day': day, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': MONEY0, 'flags': BASE,
                            'pos': {'x': pos['x'], 'z': pos['z'], 'yaw': pos['yaw']}}, quiet_events=QUIET, quiet_phone=True)
    for _ in range(30):
        if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp_g[0])
    await pg.evaluate(OBS_JS)


cdp_g = [None]
DAY = {}


def menu_check(sid, opts, tag):
    """選單上的品名、價錢對規格（B 第 5、6 條）"""
    name, _, spec = SPEC[sid]
    items = [(o['name'], o['price']) for o in opts if o['price'] is not None]
    R.note('%s 選單（畫面）：%s' % (tag, J([o['t'] + ('［灰］' if o['dim'] else '') for o in opts])))
    if sid == 'cafe2':
        R.check('B %s 大學食堂三個份量 100／130／160' % tag, sorted(p for _, p in items) == CAFE2_PRICES, J(items))
    elif sid in DRINK_RANGE:
        lo, hi, n, must = DRINK_RANGE[sid]
        R.check('B %s %s %d 樣、價錢都在 %d～%d' % (tag, name, n, lo, hi), len(items) == n and all(lo <= p <= hi for _, p in items), J(items))
        R.check('B %s %s 菜單有「%s」' % (tag, name, must), any(re.search(must, nm or '') for nm, _ in items), J([nm for nm, _ in items]))
    else:
        want = [(norm_spec(a), b) for a, b in spec]
        R.check('B %s %s 選單＝規格表（品名、價錢、項數）' % (tag, name), sorted(items) == sorted(want), '預期 %s；實際 %s' % (J(want), J(items)))
    return items


async def order_all(pg, cdp, sid, tag, reenter):
    """B：每一樣點一次＋錢不夠"""
    if not await reenter():
        R.check('B %s 按得到點餐' % tag, False); return None
    first = await scene(pg, cdp, tag + '_menu', lambda o: len(o) - 1)   # 先開一次選單看有哪些（按最後一個「不用了」）
    if not R.check('B %s 點餐有選單' % tag, bool(first['menu']), J(first)):
        return first
    items = menu_check(sid, first['menu'], tag)
    STAT.setdefault(sid, {})['menu'] = items
    if ITEMS_MAX:
        R.note('ITEMS_MAX=%d：只點前 %d 樣（自檢用，不是完整驗收）' % (ITEMS_MAX, ITEMS_MAX))
    for nm, pr in (items[:ITEMS_MAX] if ITEMS_MAX else items):
        await R_hour(pg, '下一樣（%s）' % nm)
        ok = await reenter()
        if not ok:
            R.check('B %s 「%s」：互動鍵還在、按得到' % (tag, nm), False); continue
        res = await scene(pg, cdp, '%s_%s' % (tag, nm), lambda o, nm=nm: next((i for i, x in enumerate(o) if x['name'] == nm), None))
        mp, ml, me = res['m_pick'], res['m_line'], res['m_end']
        if not res['menu'] or not res['picked'] or not res['picked'].startswith(nm):
            R.check('B %s 「%s」點得到（選單上點了它）' % (tag, nm), False, J(res)); continue
        d_line = (mp['g'] - ml['g']) if (mp and ml) else None
        d_end = (mp['g'] - me['g']) if (mp and me) else None
        R.check('B %s 「%s」標價 %d＝扣的錢（點完那一句時）' % (tag, nm, pr), d_line == pr, '點前 %s → 你點了 %s → 演完 %s' % (J(mp), J(ml), J(me)))
        R.check('B %s 「%s」整段演完只扣自己的 %d（玩家只付自己的餐費）' % (tag, nm, pr), d_end == pr, '扣 %s；其他選項 %s' % (d_end, J(res['other'])))
        R.check('B %s 「%s」右上角錢數跟著變（#money＝$%d）' % (tag, nm, me['g']), str(me['g']) in me['hud'].replace(',', ''), me['hud'])
    # 錢不夠
    cheapest = min(p for _, p in items)
    await R_hour(pg, '錢不夠那一次')
    R.setup('把錢設成 %d（比最便宜的 %d 少 1 元）' % (cheapest - 1, cheapest))
    await pg.evaluate("GAME.G.money=%d" % (cheapest - 1)); await pg.wait_for_timeout(600)
    ok = await reenter()
    cn = next(nm for nm, p in items if p == cheapest)
    res = await scene(pg, cdp, '%s_錢不夠' % tag, lambda o: next((i for i, x in enumerate(o) if x['name'] == cn), None))
    await R.shot(pg, '%s_no_money' % sid)
    dims = [o['dim'] for o in (res['menu'] or []) if o['price'] is not None]
    R.check('B %s 錢不夠（$%d）：選單每一樣都是灰的（.dim）' % (tag, cheapest - 1), ok and bool(dims) and all(dims), J(res['menu']))
    R.check('B %s 錢不夠：點「%s」出「錢不夠」、錢不變（%d）、不會變負' % (tag, cn, cheapest - 1),
            ok and res['m_end'] and res['m_end']['g'] == cheapest - 1 and res['m_end']['g'] >= 0 and any('錢不夠' in t for t in res['toast']),
            '演完 %s；toast %s' % (J(res['m_end']), J(res['toast'])))
    R.setup('錢設回 %d' % MONEY0)
    await pg.evaluate("GAME.G.money=%d" % MONEY0)
    return first


async def R_hour(pg, why):
    h = await pg.evaluate("GAME.G.hour")
    if abs(h - HOUR) > 0.01:
        R.setup('遊戲時間 %.2f → 設回 %.2f（%s；一餐 40 分鐘、飲料 5 分鐘，不設回會過營業時間）' % (h, HOUR, why))
        await pg.evaluate("GAME.G.hour=%f" % HOUR); await pg.wait_for_timeout(500)


async def do_shop(pg, cdp, sid, lay, first_shop):
    t_shop = time.time(); name, typ, _ = SPEC[sid]; tag = sid
    print('\n===== %s %s（PARTS=%s）=====' % (sid, name, ','.join(PARTS)), flush=True)
    sp = spawn_for(lay, sid) if lay else None
    if not R.check('%s 118 巷配置有這間店（LANE118_LAYOUT）' % tag, bool(sp)):
        return
    await load_at(pg, DAY['d'], DAY['wd'], sp, '%s 店門口附近的人行道' % name)
    s = await st(pg)
    R.check('%s 讀檔後站在 118 巷人行道、站得住' % tag, s['zone'] == 'lane118' and s['stand'], J(s))
    await flush(pg, tag + '_load')
    if first_shop and 'A' in PARTS and PHONE:
        await phone_scan(pg, cdp, 'lane118')
    doors = await pg.evaluate("(%s)(%s)" % (DOOR_JS, J(sid)))
    vis = [d for d in doors if not d['hidden']]
    if not R.check('%s 巷子裡有這間店的店門口互動點' % tag, bool(vis), J(doors)):
        return
    dx, dz = vis[0]['x'], vis[0]['z']
    ok, how = await joy_to(pg, cdp, dx, dz, 0.85, '%s 店門口' % name)
    r = await it_label(pg, ('進' + name) if sid not in DRINK_RANGE else name)
    near = await pg.evaluate(NEAR_JS)
    await R.shot(pg, '%s_door' % sid)
    await flush(pg, tag + '_door')
    STAT.setdefault(sid, {})['door'] = {'at': [round(dx, 2), round(dz, 2)], 'label': r['t'], 'near': near, 'how': how}
    if sid in DRINK_RANGE:
        R.check('A %s 店門口互動鍵（畫面）是「%s（…）」' % (tag, name), ok and r['t'].startswith(name + '（'), '畫面：「%s」；%s' % (r['t'], how))
        R.note('%s 互動點 (%.2f, %.2f)；站的位置範圍內的互動點 %d 個：%s；畫面上的互動鍵 %d 個、最上層＝%s' % (tag, dx, dz, len(near), J(near), r['n'], r['top']))
        R.check('B %s 站在店門口：畫面上的互動鍵就是它、在最上層（沒被別的蓋住）' % tag, r['shown'] and r['t'].startswith(name) and r['top'] == 'interact' and r['n'] == 1, J(r))
        others = [n for n in near if not n['label'].startswith(name)]
        R.check('B %s 站在店門口：範圍內沒有別的互動點跟它搶' % tag, not others, J(others))
        mk = await pg.evaluate("(window.__ccTxt||[]).length")
        async def reenter():
            q = await it_label(pg, name, 3)
            if not q['t'].startswith(name):
                await joy_to(pg, cdp, dx, dz, 0.85, '%s 店門口（再走一次）' % name); q = await it_label(pg, name, 3)
            if not q['t'].startswith(name): return False
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(700); return True
        if 'B' in PARTS:
            res0 = await order_all(pg, cdp, sid, tag, reenter)
            said = await pg.evaluate("(n=>(window.__ccTxt||[]).slice(n).filter(e=>e.id==='dlgText').map(e=>(e.nm?e.nm+'：':'')+e.t))(%d)" % mk)
            R.check('B %s 點下互動鍵：回話的是這一間（招呼、選單上是這間的菜：%s）' % (tag, name), bool(res0 and res0['menu']) and all((o['name'] or '') in [a for a, _ in STAT[sid].get('menu', [])] for o in res0['menu'] if o['price'] is not None),
                    J({'said': said[:3], 'menu': [o['t'] for o in ((res0 or {}).get('menu') or [])]}))
        else:
            if await reenter():
                res = await scene(pg, cdp, tag + '_menuA', lambda o: len(o) - 1)
                if res['menu']: menu_check(sid, res['menu'], tag)
        await R.shot(pg, '%s_after' % sid)
        await flush(pg, tag + '_end')
        R.note('%s 這一間花了 %.0f 秒' % (tag, time.time() - t_shop)); return
    # ---- 走得進去的九間 ----
    want = '進%s（%s）' % (name, typ)
    R.check('A %s 店門口互動鍵（畫面）「%s」' % (tag, want), ok and r['t'] == want, '畫面：「%s」；%s；範圍內 %s' % (r['t'], how, J([n['label'] for n in near])))
    if not r['t'].startswith('進'):
        R.check('%s 進得去（營業中，互動鍵是「進…」）' % tag, False, r['t']); return
    await L.tap(pg, cdp, '#interact')
    for _ in range(60):
        if await pg.evaluate("GAME.G.zone==='l118_%s'&&!GAME.E.player.busy" % sid): break
        await pg.wait_for_timeout(1000)
    for _ in range(30):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(1500)
    s = await st(pg); cz = await pg.evaluate(CLOCKZ_JS)
    await R.shot(pg, '%s_inside' % sid)
    await flush(pg, tag + '_inside')
    R.check('%s 進到店裡（l118_%s）、站得住' % (tag, sid), s['zone'] == 'l118_' + sid and s['stand'], J(s))
    R.check('A %s 左上角地點（畫面 #clockZ）是「%s（118 巷）」' % (tag, name), cz == name + '（118 巷）', '畫面：「%s」' % cz)
    if 'A' in PARTS and PHONE:
        await phone_scan(pg, cdp, sid)
    ins = await pg.evaluate(INSIDE_JS)
    if not R.check('%s 店裡有點餐、出口的互動點' % tag, bool(ins['order'] and ins['exit']), J(ins)):
        return
    o = ins['order']
    ok, how = await joy_to(pg, cdp, o['x'], o['z'], 0.45, '%s 櫃台' % name)
    r = await it_label(pg, '點餐（')
    await R.shot(pg, '%s_counter' % sid)
    R.check('A %s 櫃台前面互動鍵（畫面）「點餐（%s）」' % (tag, name), ok and r['t'] == '點餐（%s）' % name, '畫面：「%s」；%s' % (r['t'], how))

    async def reenter():
        q = await it_label(pg, '點餐（', 3)
        if not q['t'].startswith('點餐（'):
            await joy_to(pg, cdp, o['x'], o['z'], 0.45, '%s 櫃台（再走一次）' % name); q = await it_label(pg, '點餐（', 3)
        if not q['t'].startswith('點餐（'): return False
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(700); return True
    if 'B' in PARTS:
        await order_all(pg, cdp, sid, tag, reenter)
    elif await reenter():
        res = await scene(pg, cdp, tag + '_menuA', lambda o: len(o) - 1)
        if R.check('A %s 點餐有選單（按「不用了」不買）' % tag, bool(res['menu']), J(res)):
            menu_check(sid, res['menu'], tag)
    await R_hour(pg, '出店前')
    x = ins['exit']
    ok, how = await joy_to(pg, cdp, x['x'], x['z'], 0.4, '%s 出口' % name)
    r = await it_label(pg, '離開')
    await R.shot(pg, '%s_exit' % sid)
    R.check('A %s 出口互動鍵（畫面）「離開%s」' % (tag, name), ok and r['t'] == '離開' + name, '畫面：「%s」；%s' % (r['t'], how))
    if r['t'].startswith('離開'):
        await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2000)
        s = await st(pg); r2 = await pg.evaluate(IT_JS); cz = await pg.evaluate(CLOCKZ_JS)
        await R.shot(pg, '%s_back_lane' % sid)
        R.check('%s 出來回到 118 巷、站得住、互動鍵不是「進%s」' % (tag, name), s['zone'] == 'lane118' and s['stand'] and not r2['t'].startswith('進' + name), J(dict(s, it=r2['t'], clockZ=cz)))
    await flush(pg, tag + '_end')
    R.note('%s 這一間花了 %.0f 秒' % (tag, time.time() - t_shop))


def summary():
    print('\n===== 畫面上抽到的字：彙總（A）=====', flush=True)
    names_new = [SPEC[k][0] for k in ALL]
    items_new = sorted({a for k in ALL if SPEC[k][2] for a, _ in SPEC[k][2]} | {nm for k in STAT for nm, _ in STAT[k].get('menu', [])})
    where = {}
    for e in SEEN:
        for w in names_new + items_new:
            if w in e['t']: where.setdefault(w, set()).add(e['id'])
    print('  新店名（出現在哪些畫面元素）：' + J({w: sorted(where.get(w, [])) for w in names_new}), flush=True)
    print('  菜名（出現在哪些畫面元素）：' + J({w: sorted(where.get(w, [])) for w in items_new}), flush=True)
    hits = []
    for e in SEEN:
        for w in old_hits(e['t']):
            k = e['t'].find(w); hits.append('%s｜%s｜%s｜「%s」…%s…' % (e['tag'], e['zone'], e['id'], w, e['t'][max(0, k - 20):k + len(w) + 20].replace('\n', ' ')))
    for h in hits[:80]: print('  舊名命中｜' + h, flush=True)
    R.check('A 畫面上抽到的字（%d 段）裡舊店名、舊菜名命中數＝0' % len(SEEN), not hits, '命中 %d 筆' % len(hits))
    json.dump({'seen': SEEN, 'stat': STAT}, open(os.path.join(OUT, 'l118d_seen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=list)


async def main():
    print('受測 SHA=%s；PARTS=%s；SHOPS=%s；URL=%s' % (os.environ.get('SHA', '（沒給）'), ','.join(PARTS), ','.join(SHOPS), URL), flush=True)
    print('Playwright 手機模擬（%s）≠ iPhone 實機' % ('直向 390×844' if PORTRAIT else '橫向 844×390'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
        cdp_g[0] = cdp
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+[^\\n]*/)||[''])[0]")
        R.note('畫面上的版本字樣：%s' % ver)
        await pg.evaluate("localStorage.clear()")
        days = await pg.evaluate("(%s)(%s)" % (DAYS_JS, J(DATES)))
        ok_days = [d for d in days if not d['hol'] and not d['ty'] and d['term'] and d['week'] and d['week'] < 16 and (d['wd'] == 3 or os.environ.get('DATE'))]
        R.note('候選日期：%s' % J(days))
        DAY.update(ok_days[0] if ok_days else days[0])
        R.check('日期 %s：學期中（%s 第 %s 週）、不是假日、不是颱風假' % (DAY['k'], DAY['term'], DAY['week']), bool(ok_days), J(DAY))
        lay = await pg.evaluate(LAYOUT_JS)
        # 營業：先讀檔一次看九間＋兩間在這個時間開不開
        await load_at(pg, DAY['d'], DAY['wd'], {'x': 0, 'z': 31, 'yaw': math.pi}, '查營業時間（巷口）')
        op = await pg.evaluate(OPEN_JS)
        R.note('營業（L118.isOpen，%s %.2f）：%s' % (DAY['k'], HOUR, J(op)))
        for sid in SHOPS:
            q = next((x for x in op if x['id'] == sid), None)
            R.check('%s 這個時間有開（沒有公休紙）' % sid, bool(q and q['open'] and not q['note']), J(q))
        await flush(pg, 'start')
        for i, sid in enumerate(SHOPS):
            if sid not in SPEC:
                R.check('SHOPS 裡的「%s」是認得的店 id' % sid, False); continue
            try:
                await do_shop(pg, cdp, sid, lay, i == 0)
            except Exception as e:
                R.check('%s 探針沒有中途出錯' % sid, False, repr(e)[:300])
                try: await R.shot(pg, '%s_exception' % sid)
                except Exception: pass
        summary()
        for e in errs: print('  pageerror｜' + e[:400], flush=True)
        R.check('沒有 JS 例外（pageerror）', not errs, '%d 個' % len(errs))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        R.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', fb == 0, str(fb))
        await b.close()
    print('總結：%d 項 FAIL%s' % (len(R.fails), ('：' + '、'.join(R.fails[:40])) if R.fails else ''), flush=True)
    sys.exit(R.finish())

asyncio.run(main())
