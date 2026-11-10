"""CC X295 公告欄的特殊活動（BULLETIN-BOARD-1110；LAWWW 改後 8c050804c（08:49 第二版，前一版 3f6dba142），改前 10df264ed）——BB 要的四項：
  party：迎新派對那一天 19:00 前（日期照受測版本 src/data/activities.js 的 su_welcome_party 規則在遊戲裡算：大一上第 weeks[0] 週、星期 weekday——
         f3b47894b 起是第 2 週週四＝2025-09-11（AA_737）；8c050804c 是第 2 週週五＝2025-09-12），新體育館一樓走到「學生會迎新派對」(0, 8.6) 按 → 選「去參加」→ 三句旁白 → 時間到 t1（21:30）。
  party_fri（BB 11-10 10:59）：大一上第 2 週週五（2025-09-12）18:52 讀檔、新體育館 → 家聚（9/12 19:00，story3d.js 的 OUT 出遊 y1_fam_dinner）照舊出現（讀檔一進來、或走路途中的「出發：家聚…」選單／家聚的對話）
         → 走到 (0, 8.6) → 那裡不再有「學生會迎新派對」互動點、整段沒有迎新派對的選單、ACTIVITIES.on 是 false。派對在週五的舊版（8c050804c）＝預期 FAIL。
  blood：2025-10-14（第 7 週週二）走到捐血車 (30, −8) 捐一次（兩句旁白）；【前置】把那一刻的存檔（保留 10/14 的出席紀錄）日期改 10/15 再讀 → 再走過去按 → 要寫「上次捐血還不到兩個月」。
  movie：2025-11-06（第 10 週週四）晚上，博思 101 坐下 → 座位選單有「參加：學生會電影夜」→ 選 → 兩句旁白 → 時間到 21:00。
  fair ：2025-11-15（第 11 週週六）走到晨思鐘旁「校慶園遊會」(−14.5, 10.5) 按 → 只有「去逛：校慶園遊會／先不要」，不能跳出社團博覽會的選單 → 選 → 三句旁白。
【前置／捷徑】讀使用者存檔（FIX，預設 tests/fixtures/user_save_day51b_1110.json），用遊戲自己的 GAME.applySave 改日期、時間、區域、站的位置（離互動點幾公尺）；
  關掉「要回覆的訊息自動打開手機」（L.no_phone_auto）；條件事件照開（QUIET=1 才關）。之後全部照玩家：L.go_to 點地面／搖桿走、看互動鍵、按 #interact、點對話框、點選項按鈕。
  不用 ?turbo、不瞬移、不改劇情狀態冒充結果。改前沒有這四個互動點＝預期 FAIL（重要檢查要在改前 FAIL、改後 PASS）。Playwright／SwiftShader ≠ iPhone。
r3（CC 11:4x）：走路途中台詞框和選項同時在時先選選項（舊版先點台詞框＝校慶阿嬤那題點了 190 次）；fair 記錄車的狀態、玩家 3 m 內的互動點距離；BIKE=off＝起點先下車（存檔是騎著車的）。
用法：LW_TESTS=<wt>/tests TAG=new|old [BIKE=keep|off] [CASES=party,party_fri,blood,movie,fair] [FIX=...] [QUIET=1] python3 cc_x295_events_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'; TAG = os.environ.get('TAG') or 'x'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'party,party_fri,blood,movie,fair').split(',') if c.strip()]
QUIET = os.environ.get('QUIET') == '1'
R = L.Run('x295_events_' + TAG, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

# 期待的文字（照改後的 src/data/activities.js；AA_737 f02917295）
PARTY_NARR = ['（體育館的燈關了一半，熱舞社在台上跳。後面排隊領宵夜的人，比看表演的多。）', '（抽獎抽到三十幾號，你的號碼差兩號。旁邊的人比你還不甘心。）', '（學生會長上台講了五分鐘，前三分鐘在調麥克風。）']
BLOOD_NARR = ['（護理師問你今天有沒有吃早餐。你說有。她看了你一眼，又遞給你一杯水。）', '（捐完要在椅子上坐十分鐘。餅乾是蘇打餅，你吃了兩片。）']
MOVIE_NARR = ['（燈一關，前排還有人在找位子。片頭跑了五分鐘才安靜下來。）', '（片子放到一半，投影機閃了兩下。整間教室一起「喔——」，然後又好了。）']
FAIR_NARR0 = '（攤位從校門一路排到總圖前面。法律系的攤子在賣檸檬愛玉，學長在旁邊幫人看租屋契約。）'
CLUB_WORDS = ['吉他社', '辯論社', '登山社', '社團博覽會', '熱音', '攝影社', '服務台']   # 社博選單（CLUBFAIR.menu）會列的攤位；「法律服務社」「系籃」不列（溫學姊的法服攤劇情會提到）

UI = r"""(()=>{ const vis=e=>!!(e&&e.offsetParent!==null&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
  const E=GAME.E, P=E.player, o=P.obj.position, ib=document.getElementById('interact'), cap=document.getElementById('caption'), ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), d0=CALENDAR.dateOf(GAME.G.day);
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, seat:!!P.seat, busy:!!P.busy, path:P.path?P.path.length:0,
    interact:vis(ib)?(ib.textContent||'').trim():'', dlg:(!!(GAME.D&&GAME.D.active)||vis(document.getElementById('dlg')))?(((tx&&tx.textContent)||'').trim()||'…'):'',
    choices:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||'').trim()):[],
    caption:(cap&&!cap.classList.contains('hide')&&+getComputedStyle(cap).opacity>0.05)?(cap.textContent||'').trim():'',
    hour:+GAME.G.hour.toFixed(3), day:GAME.G.day, date:d0.key, wd:d0.wd, fb:GAME.walkFallbacks|0, paused:!!E.paused}; })()"""
ACT = r"""(id=>{ if(typeof ACTIVITIES==='undefined') return null; const a=ACTIVITIES.list.find(q=>q.id===id); if(!a) return null; return {id:a.id,title:a.title,zone:a.zone,room:a.room||null,spot:a.spot||null,t0:a.t0,t1:a.t1,on:ACTIVITIES.on(a,GAME.G.day,GAME.G)}; })"""
ATT = r"""(id=>{ const A=(GAME.G.acts&&GAME.G.acts.att)||{}; const o={}; for(const k in A) if(k.startsWith(id+'@')) o[k]=A[k]; return o; })"""
DAY_OF = r"""(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey){ const d=STORY.dayOfKey(k); if(d!=null) return d; } for(let d=-500;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })"""
WEEK_DAY = r"""(([tid,wk,wd])=>{ for(let d=-500;d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===tid&&t.week===wk&&CALENDAR.dateOf(d).wd===wd) return {day:d,key:CALENDAR.dateOf(d).key}; } return null; })"""
NEAR_STAND = r"""((q)=>{ const E=GAME.E; const out=[]; for(const r of q.rs) for(let a=0;a<360;a+=20){ const t=(a+q.a0)*Math.PI/180, x=q.x+r*Math.sin(t), z=q.z+r*Math.cos(t); if(E.canStand(x,z,0.33,q.lv|0)) out.push([+x.toFixed(2),+z.toFixed(2)]); if(out.length) return out[0]; } return null; })"""
SEATS101 = r"""((room)=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden&&String(i.seat.room||'')===room).map(i=>{ const ap=GAME.seatApproach?GAME.seatApproach(i.seat):null; return {label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,sx:+i.seat.x.toFixed(3),sz:+i.seat.z.toFixed(3),slv:i.seat.lv|0,ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null,occ:(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-i.seat.x,n.seat.z-i.seat.z)<0.35)}; }))"""
PARTY_RULE = r"""(()=>{ if(typeof ACTIVITIES==='undefined') return null; const a=ACTIVITIES.list.find(q=>q.id==='su_welcome_party'); if(!a) return null;
  return {weeks:a.weeks||null, weekday:a.weekday||null, weekdays:a.weekdays||null, term:a.term||null, t0:a.t0, t1:a.t1, spot:a.spot||null}; })()"""
PARTY_ITS = r"""(()=>(GAME.E.interactables||[]).filter(i=>/迎新派對/.test(String(i.label||''))).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),hidden:!!i.hidden})))()"""
OUT_REC = r"""(id=>{ const L=(GAME.G&&GAME.G.outings)||[]; const q=L.find(o=>o&&o.id===id); return q?{state:q.state,day:q.day,h:q.h,ask:q.ask==null?null:q.ask,title:q.title||''}:null; })"""
HUD = r"""(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','toast','btnGo','btnQuick']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""

BASE = None   # 讀進來的使用者存檔（每一段都從它開始）
LAST_MET = []   # walk_to_spot 最近一次走路途中遇到的對話／選項（party_fri 看家聚的出發選單有沒有在走路途中跳出來）
SPOT = {'學生會迎新派對': (0.0, 8.6), '捐血車': (30.0, -8.0), '校慶園遊會': (-14.5, 10.5)}


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


def dodge(cs):
    """途中插進來的劇情選項：玩家要去參加活動，選不離開這裡的那一個（「不去」優先、再來「晚一點」「先不要」），都沒有才選第一個。
    （2025-09-12 19:00 的「出發：家聚」和迎新派對同一個時段：選第一個「出發」會被帶去家聚、隔天早上在宿舍醒來——第一次試跑就是這樣）"""
    for pre in ('不去', '晚一點', '先不要', '下次'):
        k = next((i for i, c in enumerate(cs) if c.startswith(pre)), None)
        if k is not None: return k
    return 0


async def walk_to_spot(pg, cdp, tag, x, z, label, near=0.5, max_s=300):
    """照玩家走到互動點附近，等互動鍵出現；回傳 (走到了嗎, 最後的 ui, 有沒有被放到目的地)"""
    u0 = await ui(pg); fb0 = u0['fb']; t0 = time.time(); ok = False; met = []
    while time.time() - t0 < max_s:   # 途中有人物劇情的對話、選單（條件事件照開）：停下來記下來，照玩家點過去（選不離開的那一個：dodge）再繼續走
        ok = await L.go_to(pg, cdp, R, x, z, near, '%s 走到「%s」(%s, %s)' % (tag, label, x, z), max_s=max(30, max_s - (time.time() - t0)), stop=lambda s: bool(s['dlg'] or s['choices']))
        v = await ui(pg)
        if not (v['dlg'] or v['choices']): break
        while v['dlg'] or v['choices']:
            met.append((v['zone'], round(v['hour'], 2), v['dlg'][:70] if v['dlg'] else '選項：' + J(v['choices'])))
            if v['choices']: await tap_choice(pg, cdp, dodge(v['choices']))   # r3（11:4x）：台詞框和選項同時在＝要選選項；舊版先點台詞框，校慶阿嬤那一題點了 190 次（TEST_BUG）
            else: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(800); v = await ui(pg)
            if len(met) > 60: break
        if v['zone'] != u0['zone']: break
    global LAST_MET
    LAST_MET = list(met)
    if met: R.note('%s 走路途中遇到的對話／選項（照玩家點過去；選項選 dodge 的那一個）：%s' % (tag, J(met)))
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
    """點對話框一路讀下去，記下所有對話、選項、字幕（caption），直到停下來（沒有對話、沒有選項、不忙）持續 12 秒。pick(choices)→要點第幾個（None＝不點、停下來回傳）"""
    lines, caps, menus = [], [], []; t0 = time.time(); idle = None; u = await ui(pg)
    while time.time() - t0 < max_s:
        u = await ui(pg)
        if u['caption'] and (not caps or caps[-1] != u['caption']): caps.append(u['caption'])
        if u['dlg']:
            idle = None
            if u['dlg'] != '…':
                if lines and u['dlg'].startswith(lines[-1]): lines[-1] = u['dlg']   # 打字到一半先記到的半句：換成完整的
                elif not lines or lines[-1] != u['dlg']: lines.append(u['dlg'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if u['choices']:
            idle = None; menus.append(u['choices'])
            k = pick(u['choices']) if pick else None
            if k is None: return lines, caps, menus, u
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if u['busy'] or u['paused']: idle = None; await pg.wait_for_timeout(400); continue
        if idle is None: idle = time.time()
        if time.time() - idle > 12: break   # 劇情事件開始前會先轉場幾秒（第二次試跑：6 秒就收，溫學姊的「學弟。有空嗎？」才出來）
        await pg.wait_for_timeout(300)
    return lines, caps, menus, u


async def open_menu(pg, cdp, tag, label, want):
    """按互動鍵，讀到活動的選單為止。途中插進來的人物劇情（條件事件）照玩家點過去：對話點掉、劇情的選項選不離開的那一個（dodge；記下來）。
    want(choices)→True＝這是要看的選單（停下來）。按下去以後沒有選單、互動鍵還是 label＝再按一次（最多 3 次）。回傳 (lines, caps, menus, u, story)"""
    lines, caps, menus, story = [], [], [], []
    for k in range(3):
        u = await ui(pg)
        if u['dlg'] or u['choices'] or u['busy']:   # 走到這裡停下來時，附近的劇情（auto 事件）先開始了：照玩家先看完（例：11/15 10–12 點溫學姊的法律問答攤 ev_sis_festival_booth，near 4.5 m）
            l, c, m, u = await read_through(pg, cdp, tag, max_s=300, pick=lambda cs: None if want(cs) else dodge(cs))
            lines += l; caps += c; menus += m; story += [x for x in m if not want(x)]
            R.note('%s 按之前先演了劇情：對話 %s；選項 %s' % (tag, J(l), J(m)))
            if u['choices'] and want(u['choices']): break
        if not u['interact'].startswith(label) and SPOT.get(label):   # 劇情演完被移開了：照玩家走回去
            ok, u, fb = await walk_to_spot(pg, cdp, tag + '（走回去）', SPOT[label][0], SPOT[label][1], label)
        if not u['interact'].startswith(label): break
        await L.tap(pg, cdp, '#interact')
        l, c, m, u = await read_through(pg, cdp, tag, max_s=120, pick=lambda cs: None if want(cs) else dodge(cs))
        lines += l; caps += c; menus += m
        story += [x for x in m if not want(x)]
        if u['choices'] and want(u['choices']): break
    return lines, caps, menus, u, story


def pick_text(prefix):
    return lambda cs: next((i for i, c in enumerate(cs) if c.startswith(prefix)), None)


def has_seq(lines, expect):
    """expect 的每一句照順序出現在 lines（對話框的字可能還在打字中被記到半句，取最後完整的那一筆：用包含判斷）"""
    k = 0
    for ln in lines:
        # PC r1（11:0x）：最後一句在打字中途被點掉，只記到前半句（例「（學生會長上台講了五分鐘，前三分鐘在調麥克風。」少了後半）＝TEST_BUG；
        # 記到的字是那一句的開頭、而且至少 10 個字，也算出現（內容一字不差，只是沒打完）
        if k < len(expect) and (expect[k] in ln or (len(ln.strip()) >= 10 and expect[k].startswith(ln.strip()))): k += 1
    return k == len(expect)


async def start_near(pg, x, z, rs, a0=0, lv=0):
    return await pg.evaluate(NEAR_STAND, {'x': x, 'z': z, 'rs': rs, 'a0': a0, 'lv': lv})


# ---------------- party ----------------
WDN = '日一二三四五六日'


async def party_rule(pg, t):
    """受測版本的迎新派對規則（activities.js su_welcome_party）：大一上（Y1S1）第 weeks[0] 週、星期 weekday（沒有 weekday 就用 weekdays[0]）。不寫死日期：新版第 2 週週四、舊版週五都能跑"""
    rule = await pg.evaluate(PARTY_RULE)
    R.note('%s 受測版本 su_welcome_party 的規則：%s' % (t, J(rule)))
    if not rule or not rule.get('weeks') or not (rule.get('weekday') or rule.get('weekdays')): return rule, None
    wk = rule['weeks'][0]; wd = rule.get('weekday') or rule['weekdays'][0]
    day = await pg.evaluate(WEEK_DAY, ['Y1S1', wk, wd])
    if day: R.note('%s 照規則算出來的派對日：%s（第 %s 天，大一上第 %s 週星期%s）' % (t, day['key'], day['day'], wk, WDN[wd % 7]))
    return rule, day


async def case_party(pg, cdp):
    t = '[迎新派對]'
    rule, wd = await party_rule(pg, t)
    if not R.check('%s 找得到受測版本的派對日（大一上第 weeks[0] 週、星期 weekday）' % t, bool(wd), J(rule)): return
    t0 = rule.get('t0') if rule.get('t0') is not None else 19; t1 = rule.get('t1') if rule.get('t1') is not None else 21.5
    R.setup('%s 讀檔到 %s（第 %s 天）%.2f 時（開始前 8 分鐘）、新體育館（預設出生點：大廳那一頭）' % (t, wd['key'], wd['day'], t0 - 0.13))
    u = await place(pg, cdp, t, 'gym', wd['day'], t0 - 0.13)
    a = await pg.evaluate(ACT, 'su_welcome_party'); R.note('%s 活動資料：%s' % (t, J(a)))
    sp = (0.0, 8.6, '學生會迎新派對')
    ok, u, fb = await walk_to_spot(pg, cdp, t, sp[0], sp[1], sp[2])
    R.note('%s 走到後：%s' % (t, J(u)))
    await shot(pg, 'party_1_front')
    R.check('%s 真的走到互動點附近（沒有被放到目的地）' % t, ok and not fb, J({'x': u['x'], 'z': u['z'], 'fb': fb}))
    if not R.check('%s 一樓 (0, 8.6) 的互動鍵是「學生會迎新派對」' % t, u['interact'].startswith('學生會迎新派對'), J(u['interact'])): return
    lines, caps, menus, u, story = await open_menu(pg, cdp, t, '學生會迎新派對', lambda cs: any(c.startswith('去參加') or c.startswith('先不要') for c in cs))
    await shot(pg, 'party_2_menu')
    R.note('%s 按下去：對話 %s；選單 %s；字幕 %s；插進來的劇情選項（照 dodge 選）%s' % (t, J(lines), J(menus), J(caps), J(story)))
    k = pick_text('去參加')(u['choices']) if u['choices'] else None
    if not R.check('%s 選單有「去參加：學生會迎新派對」' % t, k is not None and '學生會迎新派對' in u['choices'][k], J(u['choices'])): return
    h0 = u['hour']; await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
    lines, caps, menus, u = await read_through(pg, cdp, t, max_s=300, pick=lambda cs: None)
    await shot(pg, 'party_3_after')
    R.note('%s 參加以後：對話 %s；字幕 %s；選單 %s；時間 %.3f→%.3f' % (t, J(lines), J(caps), J(menus), h0, u['hour']))
    R.check('%s 三句旁白照順序出現' % t, has_seq(lines, PARTY_NARR), J(lines))
    R.check('%s 只有那三句（沒有多出「你找了位子坐下」之類）' % t, len(lines) == 3, J(lines))
    R.check('%s 快轉到結束時間 t1＝%.2f（t1～t1＋15 分鐘）' % (t, t1), t1 - 1e-3 <= u['hour'] < t1 + 0.25, '%.3f' % u['hour'])
    R.check('%s 結束字幕「活動結束了。」' % t, any('活動結束了' in c for c in caps), J(caps))


# ---------------- party_fri ----------------
async def case_party_fri(pg, cdp):
    t = '[週五家聚]'
    rule, pday = await party_rule(pg, t)
    wk = (rule or {}).get('weeks', [2])[0] if rule else 2
    fri = await pg.evaluate(WEEK_DAY, ['Y1S1', wk, 5])
    if not R.check('%s 找得到大一上第 %s 週週五' % (t, wk), bool(fri), ''): return
    if pday and pday['day'] == fri['day']: R.note('%s 注意：受測版本的派對就在這個週五（%s）——派對還在週五的舊版，下面「不再有派對」預期 FAIL' % (t, fri['key']))
    fam0 = next((q for q in (BASE.get('outings') or []) if isinstance(q, dict) and q.get('id') == 'y1_fam_dinner'), None)
    R.note('%s 使用者存檔裡的家聚出遊（outings y1_fam_dinner）：%s' % (t, J(fam0)))
    R.setup('%s 讀檔到 %s（第 %s 天，大一上第 %s 週週五）18:52、新體育館（預設出生點），跟 party 段同一套前置；不改家聚的狀態' % (t, fri['key'], fri['day'], wk))
    sv = json.loads(json.dumps(BASE)); sv['zone'] = 'gym'; sv['day'] = fri['day']; sv['hour'] = 18.87; sv['weather'] = 'clear'; sv.pop('pos', None)
    await L.no_phone_auto(pg)
    await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); " +
                      ("EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; " if QUIET else "") + "await GAME.applySave(s); })", sv)
    await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    # BB 11:09：存檔裡沒有家聚那筆、或狀態不是 planned＝【前置／捷徑】照 story3d.js 第 1924 行同一個 OUT.plan 設成 planned（標清楚；不改其他劇情）
    rec = await pg.evaluate(OUT_REC, 'y1_fam_dinner')
    if not rec or rec.get('state') != 'planned':
        R.setup('%s 【前置／捷徑】存檔裡家聚出遊是 %s（不是 planned）→ 照 story3d.js 9/8 21:00 邀請的同一個 OUT.plan 排成 planned：{id:y1_fam_dinner, ev:ev_sis_fam_dinner, day:%s, h:19}' % (t, J(rec), fri['day']))
        await pg.evaluate("(d=>{ const G=GAME.G; if(!G.outings) G.outings=[]; G.outings=(G.outings||[]).filter(q=>!(q&&q.id==='y1_fam_dinner')); OUT.plan(G,{id:'y1_fam_dinner',ev:'ev_sis_fam_dinner',day:d,h:19,late:0.25,place:'公館巷子裡的簡餐店',title:'家聚 19:00（公館巷子裡的簡餐店）',travel:'走過去約 15 分鐘',travelH:0.25}); })", fri['day'])
        R.note('%s 設完：%s' % (t, J(await pg.evaluate(OUT_REC, 'y1_fam_dinner'))))
    # 讀檔一進來：等最多 30 秒看出發選單／對話（照玩家：對話點掉；出發選單記下來、選「晚一點」——不出發也不放棄，家聚還排著）
    seen, fam_menu, party_menu = [], None, []
    t_end = time.time() + 30
    while time.time() < t_end:
        u = await ui(pg)
        if u['dlg']: seen.append(u['dlg'][:80]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800); continue
        if u['choices']:
            seen.append('選項：' + J(u['choices']))
            if any('迎新派對' in c for c in u['choices']): party_menu.append(u['choices'])
            if any('家聚' in c for c in u['choices']) and fam_menu is None:
                fam_menu = u['choices']; await shot(pg, 'partyfri_1_fam_menu')
                k = next((i for i, c in enumerate(u['choices']) if c.startswith('晚一點')), None)
                await tap_choice(pg, cdp, k if k is not None else dodge(u['choices'])); await pg.wait_for_timeout(1200); continue
            await tap_choice(pg, cdp, dodge(u['choices'])); await pg.wait_for_timeout(1200); continue
        if fam_menu is not None: break
        await pg.wait_for_timeout(700)
    u = await ui(pg)
    R.note('%s 讀檔後 30 秒內：%s %s %.2f 時、(%s, %s)；對話／選項 %s；家聚出遊現在 %s' % (t, u['zone'], u['date'], u['hour'], u['x'], u['z'], J(seen), J(await pg.evaluate(OUT_REC, 'y1_fam_dinner'))))
    its0 = await pg.evaluate(PARTY_ITS)
    a = await pg.evaluate(ACT, 'su_welcome_party'); R.note('%s 活動資料（今天）：%s；體育館裡名字有「迎新派對」的互動點：%s' % (t, J(a), J(its0)))
    ok, u, fb = await walk_to_spot(pg, cdp, t, 0.0, 8.6, '學生會迎新派對')
    met = LAST_MET
    fam_walk = [m for m in met if '家聚' in m[2]]
    party_menu += [m[2] for m in met if '迎新派對' in m[2]]
    await shot(pg, 'partyfri_2_spot')
    its = await pg.evaluate(PARTY_ITS)
    R.note('%s 走到 (0, 8.6) 後：%s；迎新派對的互動點 %s' % (t, J(u), J(its)))
    R.check('%s 真的走到 (0, 8.6) 附近（沒有被放到目的地、沒有被帶走）' % t, ok and not fb and u['zone'] == 'gym' and math.hypot(u['x'], u['z'] - 8.6) < 1.6, J({'x': u['x'], 'z': u['z'], 'fb': fb, 'zone': u['zone']}))
    R.check('%s 家聚照舊出現（讀檔後或走路途中有「…家聚…」的出發選單或對話）' % t,
            bool(fam_menu) or bool(fam_walk) or any('家聚' in x for x in seen), J({'fam_menu': fam_menu, 'walk': fam_walk, 'seen': seen[:8]}))
    R.check('%s (0, 8.6) 的互動鍵不是「學生會迎新派對」' % t, not u['interact'].startswith('學生會迎新派對'), J(u['interact']))
    R.check('%s 體育館沒有看得到的「迎新派對」互動點' % t, not [i for i in its0 + its if not i['hidden']], J(its0 + its))
    R.check('%s 整段沒有迎新派對的選單' % t, not party_menu, J(party_menu))
    R.check('%s 今天 ACTIVITIES.on(su_welcome_party) 是 false' % t, bool(a) and not a.get('on'), J(a))


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
        lines, caps, menus, u, story = await open_menu(pg, cdp, t, '捐血車', lambda cs: any(c.startswith('去捐血') or c.startswith('先不要') for c in cs))
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
    BK = "(()=>{ const b=GAME.G.bike||{}; return {riding:!!b.riding, zone:b.zone, x:b.x!=null?+(+b.x).toFixed(2):null, z:b.z!=null?+(+b.z).toFixed(2):null}; })()"
    R.note('%s 存檔的車：%s' % (t, J(await pg.evaluate(BK))))
    if (os.environ.get('BIKE') or 'keep') == 'off' and await pg.evaluate("!!(GAME.G.bike&&GAME.G.bike.riding)"):
        await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(1500); R.note('%s BIKE=off：起點先按「下車」（玩家動作），車停在起點' % t)
    ok, u, fb = await walk_to_spot(pg, cdp, t, sp[0], sp[1], sp[2])
    for _ in range(3):   # r5（CC 12:4x）：fair_off2 走到時學姊的法律問答攤剛好開演（對話框蓋住、互動鍵空的）＝TEST_BUG；走到以後等 6 秒，有劇情就照玩家演完再走回去
        late = []
        for _ in range(12):
            await pg.wait_for_timeout(500); v = await ui(pg)
            if v['dlg'] or v['choices']: break
        while v['dlg'] or v['choices']:
            late.append((v['zone'], round(v['hour'], 2), v['dlg'][:70] if v['dlg'] else '選項：' + J(v['choices'])))
            if v['choices']: await tap_choice(pg, cdp, dodge(v['choices']))
            else: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(800); v = await ui(pg)
            if len(late) > 60: break
        if not late: break
        R.note('%s 走到以後才開演的劇情（照玩家演完）：%s' % (t, J(late)))
        ok, u, fb2 = await walk_to_spot(pg, cdp, t, sp[0], sp[1], sp[2]); fb = fb or fb2
    NEAR = "(()=>{ const P=GAME.E.player.obj.position; return GAME.E.interactables.filter(i=>!i.hidden&&Math.hypot(i.x-P.x,i.z-P.z)<3).map(i=>({label:i.label,d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2),r:i.radius||null,bike:!!i.bike})); })()"
    R.note('%s 走到以後：車 %s；玩家 3 m 內的互動點（距離）%s' % (t, J(await pg.evaluate(BK)), J(await pg.evaluate(NEAR))))
    PK = "(()=>{ const b=GAME.E.interactables.find(i=>i.bike&&!i.hidden); if(!b) return null; return {bike:[+b.x.toFixed(2),+b.z.toFixed(2)], within2m:GAME.E.interactables.filter(i=>i!==b&&!i.hidden&&Math.hypot(i.x-b.x,i.z-b.z)<=2).map(i=>({label:i.label,d:+Math.hypot(i.x-b.x,i.z-b.z).toFixed(2)}))}; })()"
    R.note('%s 停著的車（騎腳踏車互動點）和它 2 m 內的其他互動點（BB 11:46：店門、攤位都算）：%s' % (t, J(await pg.evaluate(PK))))
    if (os.environ.get('BIKE') or 'keep') == 'keep':   # BUG-FAIR-BIKE-BLOCK 驗收（BB 13:03）：車停合法停車位、人不動、按鈕是園遊會、車沒停進花台或路中間
        BKQ = r"""(()=>{ const E=GAME.E, b=GAME.G.bike||{}, B=typeof BIKE!=='undefined'?BIKE:(typeof BK!=='undefined'?BK:null); const P=E.player.obj.position;
          const zone=GAME.G.zone, spots=B&&B.parkSpots?B.parkSpots(E,zone):null, near=spots?spots.map(q=>({x:+q.x.toFixed(2),z:+q.z.toFixed(2),src:q.src,d:+Math.hypot(q.x-b.x,q.z-b.z).toFixed(2)})).sort((a,c)=>a.d-c.d).slice(0,3):null;
          const yaw=(E.interactables.find(i=>i.bike)||{}).yaw; const ok=B&&B.parkOK?B.parkOK(E,{x:b.x,z:b.z,yaw:+(b.yaw||0)}):null;
          return {bike:[+(+b.x).toFixed(2),+(+b.z).toFixed(2)], player:[+P.x.toFixed(2),+P.z.toFixed(2)], parkOK:ok, stand:E.canStand?E.canStand(b.x,b.z,0.45,0):null, nearestLegal:near, hasAPI:!!(B&&B.parkSpots)}; })()"""
        bq = await pg.evaluate(BKQ); R.note('%s 車停的位置：%s' % (t, J(bq)))
        nl = (bq.get('nearestLegal') or [{}])[0]
        R.check('%s 車停在合法停車位（BIKE.parkSpots 的一個，0.3 m 內；或 parkOK 成立）' % t, bool(bq.get('parkOK')) or (nl.get('d') is not None and nl['d'] <= 0.3), J(bq))
        R.check('%s 車停的地方站得住（不是花台、牆裡）' % t, bq.get('stand') is not False, J(bq))
        fx, fz = sp[0], sp[1]
        R.check('%s 車離「校慶園遊會」互動點 ≥ 1.3 m（不擋按鈕）' % t, math.hypot(bq['bike'][0] - fx, bq['bike'][1] - fz) >= 1.3, J(bq))
        await pg.evaluate("""(([x,z])=>{ GAME.E.cinematic(new THREE.Vector3(x+3.2,2.6,z+3.2),new THREE.Vector3(x,0.5,z)); })""", bq['bike'])
        await pg.wait_for_timeout(1500); await shot(pg, 'fair_bike_parked')
        await pg.evaluate("""(([x,z])=>{ GAME.E.cinematic(new THREE.Vector3(x,14,z+9),new THREE.Vector3(x,0,z)); })""", [(bq['bike'][0] + fx) / 2, (bq['bike'][1] + fz) / 2])
        await pg.wait_for_timeout(1500); await shot(pg, 'fair_bike_top')
        await pg.evaluate("(()=>{ if(GAME.E.endCinematic) GAME.E.endCinematic(); })()"); await pg.wait_for_timeout(1500)
        u = await ui(pg); R.note('%s 截完車的圖、鏡頭回來：%s' % (t, J({'x': u['x'], 'z': u['z'], 'interact': u['interact']})))
    await shot(pg, 'fair_1_front')
    R.check('%s 真的走到晨思鐘旁（沒有被放到目的地）' % t, ok and not fb, J({'x': u['x'], 'z': u['z'], 'fb': fb}))
    if not R.check('%s 互動鍵是「校慶園遊會」' % t, u['interact'].startswith('校慶園遊會'), J(u['interact'])): return
    want = lambda cs: any(c.startswith('去逛') or c.startswith('先不要') or any(w in c for w in CLUB_WORDS) for c in cs) or len(cs) > 4
    lines, caps, menus, u, story = await open_menu(pg, cdp, t, '校慶園遊會', want)
    await shot(pg, 'fair_2_menu')
    R.note('%s 按下去：對話 %s；選單 %s；字幕 %s；插進來的劇情選項（照 dodge 選）%s' % (t, J(lines), J(menus), J(caps), J(story)))
    allm = [c for m in menus if want(m) for c in m]
    R.check('%s 選單是「去逛：校慶園遊會／先不要」' % t, len(u['choices']) == 2 and u['choices'][0].startswith('去逛：校慶園遊會') and u['choices'][1].startswith('先不要'), J(u['choices']))
    clubby = [c for c in allm + caps if any(w in c for w in CLUB_WORDS)] + [x for x in lines if '社團博覽會' in x]
    R.check('%s 沒有跳出社團博覽會的選單（選項、對話、字幕都沒有社團名、沒有「社團博覽會」）' % t, bool(allm) and not clubby, J(clubby or allm))
    k = pick_text('去逛')(u['choices']) if u['choices'] else None
    if k is None: return
    await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
    lines, caps, menus2, u = await read_through(pg, cdp, t, max_s=300, pick=lambda cs: None)
    await shot(pg, 'fair_3_after')
    R.note('%s 參加以後：對話 %s；字幕 %s；選單 %s；時間 %.3f' % (t, J(lines), J(caps), J(menus2), u['hour']))
    R.check('%s 參加以後也沒有社博的選單' % t, not menus2 and not any(any(w in c for w in CLUB_WORDS) for c in caps), J(menus2))
    R.check('%s 園遊會的旁白（第 1 句）出現、共三句' % t, bool(lines) and FAIR_NARR0 in lines[0] and len(lines) == 3, J(lines))


CASE_FN = {'party': case_party, 'party_fri': case_party_fri, 'blood': case_blood, 'movie': case_movie, 'fair': case_fair}


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
