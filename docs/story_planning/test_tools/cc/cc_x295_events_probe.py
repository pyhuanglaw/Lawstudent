"""CC X295 公告欄的特殊活動（BULLETIN-BOARD-1110；LAWWW 改後 8c050804c（08:49 第二版，前一版 3f6dba142），改前 10df264ed）——BB 要的四項：
  party：大一上第 2 週週五 19:00 前，新體育館一樓走到「學生會迎新派對」(0, 8.6) 按 → 選「去參加」→ 三句旁白 → 時間到 21:30。
  blood：2025-10-14（第 7 週週二）走到捐血車 (30, −8) 捐一次（兩句旁白）；【前置】把那一刻的存檔（保留 10/14 的出席紀錄）日期改 10/15 再讀 → 再走過去按 → 要寫「上次捐血還不到兩個月」。
  movie：2025-11-06（第 10 週週四）晚上，博思 101 坐下 → 座位選單有「參加：學生會電影夜」→ 選 → 兩句旁白 → 時間到 21:00。
  fair ：2025-11-15（第 11 週週六）走到晨思鐘旁「校慶園遊會」(−14.5, 10.5) 按 → 只有「去逛：校慶園遊會／先不要」，不能跳出社團博覽會的選單 → 選 → 三句旁白。
【前置／捷徑】讀使用者存檔（FIX，預設 tests/fixtures/user_save_day51b_1110.json），用遊戲自己的 GAME.applySave 改日期、時間、區域、站的位置（離互動點幾公尺）；
  關掉「要回覆的訊息自動打開手機」（L.no_phone_auto）；條件事件照開（QUIET=1 才關）。之後全部照玩家：L.go_to 點地面／搖桿走、看互動鍵、按 #interact、點對話框、點選項按鈕。
  不用 ?turbo、不瞬移、不改劇情狀態冒充結果。改前沒有這四個互動點＝預期 FAIL（重要檢查要在改前 FAIL、改後 PASS）。Playwright／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old [CASES=party,blood,movie,fair] [FIX=...] [QUIET=1] python3 cc_x295_events_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'; TAG = os.environ.get('TAG') or 'x'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'party,blood,movie,fair').split(',') if c.strip()]
QUIET = os.environ.get('QUIET') == '1'
R = L.Run('x295_events_' + TAG, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

# 期待的文字（照改後的 src/data/activities.js；AA_737 f02917295）
PARTY_NARR = ['（體育館的燈關了一半，熱舞社在台上跳。後面排隊領宵夜的人，比看表演的多。）', '（抽獎抽到三十幾號，你的號碼差兩號。旁邊的人比你還不甘心。）', '（學生會長上台講了五分鐘，前三分鐘在調麥克風。）']
BLOOD_NARR = ['（護理師問你今天有沒有吃早餐。你說有。她看了你一眼，又遞給你一杯水。）', '（捐完要在椅子上坐十分鐘。餅乾是蘇打餅，你吃了兩片。）']
MOVIE_NARR = ['（燈一關，前排還有人在找位子。片頭跑了五分鐘才安靜下來。）', '（片子放到一半，投影機閃了兩下。整間教室一起「喔——」，然後又好了。）']
FAIR_NARR0 = '（攤位從校門一路排到總圖前面。法律系的攤子在賣檸檬愛玉，學長在旁邊幫人看租屋契約。）'
CLUB_WORDS = ['吉他社', '辯論社', '登山社', '系籃', '法律服務社', '社團博覽會', '熱音', '攝影社']

UI = r"""(()=>{ const vis=e=>!!(e&&e.offsetParent!==null&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
  const E=GAME.E, P=E.player, o=P.obj.position, ib=document.getElementById('interact'), cap=document.getElementById('caption'), ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), d0=CALENDAR.dateOf(GAME.G.day);
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, seat:!!P.seat, busy:!!P.busy, path:P.path?P.path.length:0,
    interact:vis(ib)?(ib.textContent||'').trim():'', dlg:!!(GAME.D&&GAME.D.active)?((tx&&tx.textContent)||'').trim():'',
    choices:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||'').trim()):[],
    caption:(cap&&!cap.classList.contains('hide')&&+getComputedStyle(cap).opacity>0.05)?(cap.textContent||'').trim():'',
    hour:+GAME.G.hour.toFixed(3), day:GAME.G.day, date:d0.key, wd:d0.wd, fb:GAME.walkFallbacks|0, paused:!!E.paused}; })()"""
ACT = r"""(id=>{ if(typeof ACTIVITIES==='undefined') return null; const a=ACTIVITIES.list.find(q=>q.id===id); if(!a) return null; return {id:a.id,title:a.title,zone:a.zone,room:a.room||null,spot:a.spot||null,t0:a.t0,t1:a.t1,on:ACTIVITIES.on(a,GAME.G.day,GAME.G)}; })"""
ATT = r"""(id=>{ const A=(GAME.G.acts&&GAME.G.acts.att)||{}; const o={}; for(const k in A) if(k.startsWith(id+'@')) o[k]=A[k]; return o; })"""
DAY_OF = r"""(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey){ const d=STORY.dayOfKey(k); if(d!=null) return d; } for(let d=-500;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })"""
WEEK_DAY = r"""(([tid,wk,wd])=>{ for(let d=-500;d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===tid&&t.week===wk&&CALENDAR.dateOf(d).wd===wd) return {day:d,key:CALENDAR.dateOf(d).key}; } return null; })"""
NEAR_STAND = r"""((q)=>{ const E=GAME.E; const out=[]; for(const r of q.rs) for(let a=0;a<360;a+=20){ const t=(a+q.a0)*Math.PI/180, x=q.x+r*Math.sin(t), z=q.z+r*Math.cos(t); if(E.canStand(x,z,0.33,q.lv|0)) out.push([+x.toFixed(2),+z.toFixed(2)]); if(out.length) return out[0]; } return null; })"""
SEATS101 = r"""((room)=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden&&String(i.seat.room||'')===room).map(i=>{ const ap=GAME.seatApproach?GAME.seatApproach(i.seat):null; return {label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,sx:+i.seat.x.toFixed(3),sz:+i.seat.z.toFixed(3),slv:i.seat.lv|0,ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null,occ:(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-i.seat.x,n.seat.z-i.seat.z)<0.35)}; }))"""
HUD = r"""(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','toast','btnGo','btnQuick']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""

BASE = None   # 讀進來的使用者存檔（每一段都從它開始）


async def ui(pg):
    return await pg.evaluate(UI)


async def shot(pg, name):
    p = os.path.join(OUT, 'x295_%s_%s.png' % (TAG, name))
    try: await pg.screenshot(path=p)
    except Exception as e: R.note('截圖失敗 %s：%s' % (name, e))
    return p


async def tap_choice(pg, cdp, idx):
    await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % idx)
    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null); const e=b[i]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % idx)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def place(pg, cdp, tag, zone, day, hour, pos=None, base=None):
    """【前置】用遊戲自己的讀檔放到那一天、那個時間、那個區域（pos＝站的位置；None＝區域的預設出生點）"""
    sv = json.loads(json.dumps(base or BASE)); sv['zone'] = zone; sv['day'] = day; sv['hour'] = hour; sv['weather'] = 'clear'
    if pos: sv['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': pos[2] if len(pos) > 2 else 0.0, 'lv': 0}
    else: sv.pop('pos', None)
    await L.no_phone_auto(pg)
    js = "(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); " + \
         ("EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; " if QUIET else "") + "await GAME.applySave(s); })"
    await pg.evaluate(js, sv); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    seen = []
    for _ in range(20):   # 讀檔後跳出來的對話（照玩家點掉；記下來，條件事件照開時可能有人物劇情）
        u = await ui(pg)
        if u['dlg']: seen.append(u['dlg'][:60]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800); continue
        if u['choices']: seen.append('選項：' + J(u['choices'])); break
        break
    u = await ui(pg)
    R.note('%s 讀檔後：%s %s %.2f 時、(%s, %s)；讀檔後的對話 %s' % (tag, u['zone'], u['date'], u['hour'], u['x'], u['z'], J(seen)))
    return u


async def walk_to_spot(pg, cdp, tag, x, z, label, near=0.5, max_s=300):
    """照玩家走到互動點附近，等互動鍵出現；回傳 (走到了嗎, 最後的 ui, 有沒有被放到目的地)"""
    u0 = await ui(pg); fb0 = u0['fb']; t0 = time.time(); ok = False; met = []
    while time.time() - t0 < max_s:   # 途中有人物劇情的對話、選單（條件事件照開）：停下來記下來，照玩家點過去（選第一個）再繼續走
        ok = await L.go_to(pg, cdp, R, x, z, near, '%s 走到「%s」(%s, %s)' % (tag, label, x, z), max_s=max(30, max_s - (time.time() - t0)), stop=lambda s: bool(s['dlg'] or s['choices']))
        v = await ui(pg)
        if not (v['dlg'] or v['choices']): break
        while v['dlg'] or v['choices']:
            met.append((v['zone'], round(v['hour'], 2), v['dlg'][:70] if v['dlg'] else '選項：' + J(v['choices'])))
            if v['dlg']: await L.tap(pg, cdp, '#dlg')
            else: await tap_choice(pg, cdp, 0)
            await pg.wait_for_timeout(800); v = await ui(pg)
            if len(met) > 60: break
        if v['zone'] != u0['zone']: break
    if met: R.note('%s 走路途中遇到的對話／選項（照玩家點過去）：%s' % (tag, J(met)))
    v = await ui(pg)
    if v['zone'] != u0['zone'] or v['day'] != u0['day']: R.note('%s 【注意】走路途中被帶走：%s %s %.2f → %s %s %.2f' % (tag, u0['zone'], u0['date'], u0['hour'], v['zone'], v['date'], v['hour']))
    await pg.wait_for_timeout(1200); u = await ui(pg)
    if not u['interact'].startswith(label):   # 停在互動範圍邊上：像玩家一樣往中心再走一點
        await L.go_to(pg, cdp, R, x, z, 0.25, '%s 再往「%s」中心走一點' % (tag, label), max_s=90); await pg.wait_for_timeout(1200); u = await ui(pg)
    for _ in range(6):
        if u['interact'].startswith(label): break
        await pg.wait_for_timeout(500); u = await ui(pg)
    return bool(ok), u, u['fb'] != fb0


async def read_through(pg, cdp, tag, max_s=240, pick=None):
    """點對話框一路讀下去，記下所有對話、選項、字幕（caption），直到停下來（沒有對話、沒有選項、不忙）持續 6 秒。pick(choices)→要點第幾個（None＝不點、停下來回傳）"""
    lines, caps, menus = [], [], []; t0 = time.time(); idle = None; u = await ui(pg)
    while time.time() - t0 < max_s:
        u = await ui(pg)
        if u['caption'] and (not caps or caps[-1] != u['caption']): caps.append(u['caption'])
        if u['dlg']:
            idle = None
            if not lines or lines[-1] != u['dlg']: lines.append(u['dlg'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if u['choices']:
            idle = None; menus.append(u['choices'])
            k = pick(u['choices']) if pick else None
            if k is None: return lines, caps, menus, u
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if u['busy'] or u['paused']: idle = None; await pg.wait_for_timeout(400); continue
        if idle is None: idle = time.time()
        if time.time() - idle > 6: break
        await pg.wait_for_timeout(300)
    return lines, caps, menus, u


def pick_text(prefix):
    return lambda cs: next((i for i, c in enumerate(cs) if c.startswith(prefix)), None)


def has_seq(lines, expect):
    """expect 的每一句照順序出現在 lines（對話框的字可能還在打字中被記到半句，取最後完整的那一筆：用包含判斷）"""
    k = 0
    for ln in lines:
        if k < len(expect) and expect[k] in ln: k += 1
    return k == len(expect)


async def start_near(pg, x, z, rs, a0=0, lv=0):
    return await pg.evaluate(NEAR_STAND, {'x': x, 'z': z, 'rs': rs, 'a0': a0, 'lv': lv})


# ---------------- party ----------------
async def case_party(pg, cdp):
    t = '[迎新派對]'
    wd = await pg.evaluate(WEEK_DAY, ['Y1S1', 2, 5])
    if not R.check('%s 找得到大一上第 2 週週五' % t, bool(wd), ''): return
    R.setup('%s 讀檔到 %s（第 %s 天，大一上第 2 週週五）18:52、新體育館（預設出生點：大廳那一頭）' % (t, wd['key'], wd['day']))
    u = await place(pg, cdp, t, 'gym', wd['day'], 18.87)
    a = await pg.evaluate(ACT, 'su_welcome_party'); R.note('%s 活動資料：%s' % (t, J(a)))
    sp = (0.0, 8.6, '學生會迎新派對')
    ok, u, fb = await walk_to_spot(pg, cdp, t, sp[0], sp[1], sp[2])
    R.note('%s 走到後：%s' % (t, J(u)))
    await shot(pg, 'party_1_front')
    R.check('%s 真的走到互動點附近（沒有被放到目的地）' % t, ok and not fb, J({'x': u['x'], 'z': u['z'], 'fb': fb}))
    if not R.check('%s 一樓 (0, 8.6) 的互動鍵是「學生會迎新派對」' % t, u['interact'].startswith('學生會迎新派對'), J(u['interact'])): return
    await L.tap(pg, cdp, '#interact')
    lines, caps, menus, u = await read_through(pg, cdp, t, max_s=20)   # 停在選單
    await shot(pg, 'party_2_menu')
    R.note('%s 按下去：對話 %s；選單 %s；字幕 %s' % (t, J(lines), J(menus), J(caps)))
    k = pick_text('去參加')(u['choices']) if u['choices'] else None
    if not R.check('%s 選單有「去參加：學生會迎新派對」' % t, k is not None and '學生會迎新派對' in u['choices'][k], J(u['choices'])): return
    h0 = u['hour']; await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
    lines, caps, menus, u = await read_through(pg, cdp, t, max_s=300, pick=lambda cs: None)
    await shot(pg, 'party_3_after')
    R.note('%s 參加以後：對話 %s；字幕 %s；選單 %s；時間 %.3f→%.3f' % (t, J(lines), J(caps), J(menus), h0, u['hour']))
    R.check('%s 三句旁白照順序出現' % t, has_seq(lines, PARTY_NARR), J(lines))
    R.check('%s 只有那三句（沒有多出「你找了位子坐下」之類）' % t, len(lines) == 3, J(lines))
    R.check('%s 快轉到 21:30（21:30～21:45）' % t, 21.5 - 1e-3 <= u['hour'] < 21.75, '%.3f' % u['hour'])
    R.check('%s 結束字幕「活動結束了。」' % t, any('活動結束了' in c for c in caps), J(caps))


# ---------------- blood ----------------
async def case_blood(pg, cdp):
    t = '[捐血車]'
    d14 = await pg.evaluate(DAY_OF, '2025-10-14')
    st = (30.0, -8.0, '捐血車')
    R.setup('%s 讀檔到 2025-10-14（第 %s 天）10:30、校園，站在捐血車 (30, −8) 旁邊幾公尺（canStand 找的第一個點）' % (t, d14))
    await place(pg, cdp, t, 'campus', d14, 10.5, (30.0, -2.0, 0.0))
    p0 = await start_near(pg, st[0], st[1], [6, 7, 8, 5], a0=0)
    u = await ui(pg)
    if p0 and math.hypot(u['x'] - p0[0], u['z'] - p0[1]) > 0.6:
        R.setup('%s 起點改 %s（再讀一次檔）' % (t, p0)); await place(pg, cdp, t, 'campus', d14, 10.5, (p0[0], p0[1], 0.0))
    a = await pg.evaluate(ACT, 'blood_drive'); R.note('%s 活動資料：%s' % (t, J(a)))
    ok, u, fb = await walk_to_spot(pg, cdp, t + '10/14', st[0], st[1], st[2])
    await shot(pg, 'blood_1_front_1014')
    R.check('%s 10/14 真的走到捐血車旁（沒有被放到目的地）' % t, ok and not fb, J({'x': u['x'], 'z': u['z'], 'fb': fb}))
    donated = False
    if R.check('%s 10/14 互動鍵是「捐血車」' % t, u['interact'].startswith('捐血車'), J(u['interact'])):
        await L.tap(pg, cdp, '#interact')
        lines, caps, menus, u = await read_through(pg, cdp, t, max_s=20)
        await shot(pg, 'blood_2_menu_1014')
        R.note('%s 10/14 按下去：對話 %s；選單 %s；字幕 %s' % (t, J(lines), J(menus), J(caps)))
        k = pick_text('去捐血')(u['choices']) if u['choices'] else None
        if R.check('%s 10/14 選單有「去捐血：捐血車」' % t, k is not None, J(u['choices'])):
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
            lines, caps, menus, u = await read_through(pg, cdp, t, max_s=300, pick=lambda cs: None)
            await shot(pg, 'blood_3_after_1014')
            R.note('%s 10/14 捐完：對話 %s；字幕 %s；時間 %.3f；出席紀錄 %s' % (t, J(lines), J(caps), u['hour'], J(await pg.evaluate(ATT, 'blood_drive'))))
            donated = R.check('%s 10/14 捐血的兩句旁白照順序出現' % t, has_seq(lines, BLOOD_NARR), J(lines))
    # 10/15：保留 10/14 的狀態（出席紀錄）——用那一刻遊戲自己的存檔內容（GAME.snapshot），只改日期、時間、位置
    snap = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot()))")
    d15 = await pg.evaluate(DAY_OF, '2025-10-15')
    R.setup('%s 【前置／捷徑】取 10/14 捐完那一刻的存檔（GAME.snapshot，保留出席紀錄 %s），日期改 2025-10-15（第 %s 天）10:30、站回同一個起點再讀檔（改前、改後同一套前置）' % (t, J((snap.get('acts') or {}).get('att', {}).get('blood_drive@%s' % d14)), d15))
    await place(pg, cdp, t, 'campus', d15, 10.5, (p0[0], p0[1], 0.0) if p0 else (30.0, -2.0, 0.0), base=snap)
    ok, u, fb = await walk_to_spot(pg, cdp, t + '10/15', st[0], st[1], st[2])
    await shot(pg, 'blood_4_front_1015')
    R.check('%s 10/15 真的走到捐血車旁' % t, ok and not fb, J({'x': u['x'], 'z': u['z'], 'fb': fb}))
    if not R.check('%s 10/15 互動鍵是「捐血車」' % t, u['interact'].startswith('捐血車'), J(u['interact'])): return
    await L.tap(pg, cdp, '#interact'); caps, lines, menus = [], [], []
    for _ in range(16):
        await pg.wait_for_timeout(300); v = await ui(pg)
        if v['caption'] and v['caption'] not in caps: caps.append(v['caption'])
        if v['dlg'] and v['dlg'] not in lines: lines.append(v['dlg'])
        if v['choices']: menus.append(v['choices']); break
    await shot(pg, 'blood_5_tap_1015')
    R.note('%s 10/15 按下去：字幕 %s；對話 %s；選單 %s' % (t, J(caps), J(lines), J(menus)))
    R.check('%s 10/15 寫「上次捐血還不到兩個月」' % t, any('上次捐血還不到兩個月' in c for c in caps + lines), J(caps + lines))
    R.check('%s 10/15 沒有再給「去捐血」的選單' % t, not any(any(c.startswith('去捐血') for c in m) for m in menus), J(menus))
    if menus:   # 收掉選單（照玩家點「先不要」）
        k = pick_text('先不要')(menus[-1]); await tap_choice(pg, cdp, k if k is not None else len(menus[-1]) - 1)
    if not donated: R.note('%s 注意：10/14 沒有捐成，10/15 的結果不能當「兩個月規則」的證據' % t)


# ---------------- movie ----------------
async def case_movie(pg, cdp):
    t = '[電影夜]'
    d = await pg.evaluate(DAY_OF, '2025-11-06')
    R.setup('%s 讀檔到 2025-11-06（第 %s 天，第 10 週週四）18:50、博思（預設出生點）' % (t, d))
    await place(pg, cdp, t, 'boya', d, 18.83)
    a = await pg.evaluate(ACT, 'su_movie_night'); R.note('%s 活動資料：%s' % (t, J(a)))
    seats = await pg.evaluate(SEATS101, '101')
    u = await ui(pg)
    seats = [s for s in seats if not s['occ']]
    seats.sort(key=lambda s: math.hypot((s['ap'] or [s['x'], s['z']])[0] - u['x'], (s['ap'] or [s['x'], s['z']])[1] - u['z']))
    R.note('%s 博思 101 的空位 %d 張（最近的 3 張：%s）' % (t, len(seats), J(seats[:3])))
    if not R.check('%s 博思有 101 的座位' % t, bool(seats), ''): return
    sat = False
    for s in seats[:3]:
        tgt = s['ap'] or [s['x'], s['z']]; fb0 = u['fb']
        await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.3, '%s 走到 101 的座位 (%s, %s) 旁' % (t, s['sx'], s['sz']), max_s=360, lv=s['slv'])
        await pg.wait_for_timeout(1500); v = await ui(pg)
        if not v['interact'].startswith(s['label']):
            await L.tap_ground(pg, cdp, s['sx'], s['sz'], lv=s['slv']); await pg.wait_for_timeout(4000); v = await ui(pg)
        R.note('%s 座位旁：%s' % (t, J(v)))
        if not v['interact'].startswith(s['label']): continue
        R.check('%s 真的走到座位旁（沒有被放到目的地）' % t, v['fb'] == fb0, J(v))
        await L.tap(pg, cdp, '#interact')
        for _ in range(30):
            await pg.wait_for_timeout(500); v = await ui(pg)
            if v['seat'] and (v['choices'] or v['dlg']): break
        sat = v['seat']; break
    if not R.check('%s 在博思 101 坐下了' % t, sat, J(v)): return
    lines, caps, menus, u = await read_through(pg, cdp, t, max_s=30)
    await shot(pg, 'movie_1_menu')
    R.note('%s 坐下後：對話 %s；選單 %s；時間 %.3f' % (t, J(lines), J(menus), u['hour']))
    k = pick_text('參加：學生會電影夜')(u['choices']) if u['choices'] else None
    if not R.check('%s 座位選單有「參加：學生會電影夜」' % t, k is not None, J(u['choices'])):
        if u['choices']:
            j = next((i for i, c in enumerate(u['choices']) if c.startswith('起身') or c.startswith('站起')), None)
            if j is not None: await tap_choice(pg, cdp, j)
        return
    await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
    lines, caps, menus, u = await read_through(pg, cdp, t, max_s=300, pick=lambda cs: None)
    await shot(pg, 'movie_2_after')
    R.note('%s 參加以後：對話 %s；字幕 %s；選單 %s；時間 %.3f；出席紀錄 %s' % (t, J(lines), J(caps), J(menus), u['hour'], J(await pg.evaluate(ATT, 'su_movie_night'))))
    R.check('%s 兩句旁白照順序出現' % t, has_seq(lines, MOVIE_NARR), J(lines))
    R.check('%s 時間到 21:00（21:00～21:15）' % t, 21.0 - 1e-3 <= u['hour'] < 21.25, '%.3f' % u['hour'])
    R.check('%s 出席紀錄是聽完（full）' % t, any((r or {}).get('end', 'full') == 'full' for r in (await pg.evaluate(ATT, 'su_movie_night')).values()), '')


# ---------------- fair ----------------
async def case_fair(pg, cdp):
    t = '[園遊會]'
    d = await pg.evaluate(DAY_OF, '2025-11-15')
    sp = (-14.5, 10.5, '校慶園遊會')
    R.setup('%s 讀檔到 2025-11-15（第 %s 天，第 11 週週六）10:30、校園，站在晨思鐘旁的互動點 (−14.5, 10.5) 幾公尺外（從社博服務台 (−13.5, 13.6) 的另一邊）' % (t, d))
    await place(pg, cdp, t, 'campus', d, 10.5, (-14.5, 4.0, 0.0))
    p0 = await start_near(pg, sp[0], sp[1], [6, 7, 5, 8], a0=180)
    u = await ui(pg)
    if p0 and math.hypot(u['x'] - p0[0], u['z'] - p0[1]) > 0.6:
        R.setup('%s 起點改 %s（再讀一次檔）' % (t, p0)); await place(pg, cdp, t, 'campus', d, 10.5, (p0[0], p0[1], 0.0))
    a = await pg.evaluate(ACT, 'school_fair'); R.note('%s 活動資料：%s；社博今天：%s' % (t, J(a), J(await pg.evaluate(ACT, 'club_expo_y1s1'))))
    near = await pg.evaluate("(([x,z])=>GAME.E.interactables.filter(i=>!i.hidden&&Math.hypot(i.x-x,i.z-z)<6).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||null})))", [sp[0], sp[1]])
    R.note('%s 互動點 6 m 內的東西：%s' % (t, J(near)))
    ok, u, fb = await walk_to_spot(pg, cdp, t, sp[0], sp[1], sp[2])
    await shot(pg, 'fair_1_front')
    R.check('%s 真的走到晨思鐘旁（沒有被放到目的地）' % t, ok and not fb, J({'x': u['x'], 'z': u['z'], 'fb': fb}))
    if not R.check('%s 互動鍵是「校慶園遊會」' % t, u['interact'].startswith('校慶園遊會'), J(u['interact'])): return
    await L.tap(pg, cdp, '#interact')
    lines, caps, menus, u = await read_through(pg, cdp, t, max_s=20)
    await shot(pg, 'fair_2_menu')
    R.note('%s 按下去：對話 %s；選單 %s；字幕 %s' % (t, J(lines), J(menus), J(caps)))
    allm = [c for m in menus for c in m]
    R.check('%s 選單是「去逛：校慶園遊會／先不要」' % t, u['choices'][:1] == ['去逛：校慶園遊會'] and len(u['choices']) == 2 if u['choices'] else False, J(u['choices']))
    clubby = [c for c in allm + lines + caps if any(w in c for w in CLUB_WORDS)]
    R.check('%s 沒有跳出社團博覽會的選單（選項、對話、字幕都沒有社團名、沒有「社團博覽會」）' % t, bool(menus) and not clubby, J(clubby or allm))
    k = pick_text('去逛')(u['choices']) if u['choices'] else None
    if k is None: return
    await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
    lines, caps, menus2, u = await read_through(pg, cdp, t, max_s=300, pick=lambda cs: None)
    await shot(pg, 'fair_3_after')
    R.note('%s 參加以後：對話 %s；字幕 %s；選單 %s；時間 %.3f' % (t, J(lines), J(caps), J(menus2), u['hour']))
    R.check('%s 參加以後也沒有社博的選單' % t, not menus2 and not any(any(w in c for w in CLUB_WORDS[:4] + ['社團博覽會']) for c in caps), J(menus2))
    R.check('%s 園遊會的旁白（第 1 句）出現、共三句' % t, bool(lines) and FAIR_NARR0 in lines[0] and len(lines) == 3, J(lines))


CASE_FN = {'party': case_party, 'blood': case_blood, 'movie': case_movie, 'fair': case_fair}


async def main():
    global BASE
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X295 公告欄特殊活動：worktree %s；TAG %s；段 %s；條件事件%s；Playwright ≠ iPhone' % (real or '?', TAG, CASES, '關' if QUIET else '開'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        BASE = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('讀得到存檔 %s' % FIX, bool(BASE), ''): await b.close(); return
        R.setup('使用者存檔 %s（day %s）當底；每一段從它改日期、時間、區域、位置（GAME.applySave）' % (FIX, BASE.get('day')))
        for c in CASES:
            fn = CASE_FN.get(c)
            if not fn: R.note('不認得的段 %s' % c); continue
            print('==== %s ====' % c, flush=True)
            try: await fn(pg, cdp)
            except Exception as e:
                R.check('[%s] 探針沒有例外' % c, False, repr(e)[:300]); await shot(pg, c + '_exception')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
