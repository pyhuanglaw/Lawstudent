"""CC（帳號 A）11-04：CVS24——兩間日和便利店都是 24 小時（使用者 11-04 02:1x「所有便利商店都是24小時」；places.js cvs:{text:'24 小時'}）。測 c7fde4f3e（4e3f6ccef 溫州街 A5 招牌改日和便利店；招牌截圖另見 cc_wz_a5_shot_probe.py）。
  公館（店門 (−29.4, 21)「進入便利商店」）、溫州街 A5（店門 (45.8, 3.8)「進入日和便利店」，wzshops3d.js AA413；出來回溫州街）。
  E 進店（每間 × 03:00、07:00、15:00、23:30）：
     【前置／捷徑】讀檔：那一區、店門前的路上、2025-09-23（二）那個時間、條件事件關閉。
     → 真的走到店門口 → 按互動 → ①進得去（zone＝cvs）②沒有「打烊」之類的字（對話、toast）③卡住檢查 → 走到「離開…」（v2：離開日和便利店）→ ④回到原本那一區（溫州街那間要回溫州街）
     03:00 用 G.hour＝3（當天清晨）。另外印一個 INFO：G.hour＝27（＝前一天沒睡的 03:00）會怎樣（遊戲 02:30 以後強制回宿舍，不判 FAIL，只記錄；見回報）。
  M 跨午夜（公館那間；WZ=1 時溫州街那間也跑）：
     【前置／捷徑】讀檔：便利商店裡 (0, 1.5)、23:50（溫州街那間另設 flags.CVS_FROM＝'wenzhou'，和從溫州街門口進去一樣）、條件事件關閉。
     → 站著不動、讓遊戲時間真的跑：一路記 G.hour、E.time、zone、位置、對話；直到 G.hour ≥ 24+5/60（00:05）。
     ⑤沒有被請出去（zone 一直是 cvs）⑥沒有被傳送（站著不動，位置變化 < 0.5 m）⑦有跨日（G.hour 從 < 24 到 ≥ 24.083；畫面時鐘「9/24 週三 00:0x」，日期跟著換）⑧卡住檢查
  卡住檢查：對話框關掉、GAME.D.busyDepth 0、搖桿推得動 ≥ 0.3 m（四個方向試）、GAME.walkFallbacks 沒有增加、沒有 JS 例外。
用法：LW_TESTS=<wt>/tests [CASES=E,M] [SHOPS=gg,wz] [HOURS=2,6,7,15,23.5] [CASES=E,M,F] [WZ=1] [MID_TIMEOUT=1500] python3 cc_cvs24_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'E,M,F').split(',') if c.strip()]
SHOPSEL = [c.strip() for c in (os.environ.get('SHOPS') or 'gg,wz').split(',') if c.strip()]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '2,6,7,15,23.5').split(',') if h.strip()]
MID_WZ = os.environ.get('WZ', '1') != '0'
MID_TIMEOUT = float(os.environ.get('MID_TIMEOUT') or 1500)   # 秒（真實時間）：遊戲 1 小時＝150 秒（60 fps）；SwiftShader 每幀上限 0.1 秒會慢很多
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'BIKE_TIP': True}
DAY, WD = 7, 2
SHOPS = {'gg': {'zone': 'gongguan', 'name': '公館日和便利店', 'start': (-29.4, 15.0), 'label': '進入便利商店'},
         'wz': {'zone': 'wenzhou', 'name': '溫州街 A5 日和便利店', 'start': (45.8, 0.4), 'label': '進入日和便利店'}}
CLOSED_WORDS = ['打烊', '關門', '營業時間', '請離開', '明天再來', '鐵捲門']
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{}; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(4), day:G.day, t:+(+E.time||0).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,160),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', fb:GAME.walkFallbacks||0,
    toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,80), clock:((document.getElementById('clockT')||{}).textContent||'').trim(),
    cvsFrom:(G.flags||{}).CVS_FROM||null, paused:!!E.paused}; })()"""
FIND_JS = """(lb=>{ const p=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>!i.hidden&&(i.label||'').startsWith(lb)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
  const it=its[0]; return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label}:null; })(%s)"""


async def converse(pg, cdp, tag, max_s=60):
    """途中的對話：逐句印出來（transcript）、點到底、選單選第一個。回傳台詞清單"""
    lines = []; last = None; t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if s['choices']:
            lines.append('［選單］' + ' / '.join(s['choices']))
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][0]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); idle = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != last:
                last = (s['name'], s['text']); lines.append(((s['name'] + '：') if s['name'] else '') + s['text'])
                print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.0: break
        await pg.wait_for_timeout(500)
    return lines


async def stuck_check(pg, cdp, tag, fb0, e0, errs):
    """卡住檢查：對話框關掉、busyDepth 0、搖桿推得動 ≥ 0.3 m（前、後、右、左都試，前面是牆不算卡住）、walkFallbacks 沒增加、沒有新的 JS 例外"""
    await converse(pg, cdp, tag, 15)
    moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s['dlg'] and not s['choices'] and s['depth'] == 0 and moved >= 0.3 and s['fb'] == fb0 and not new)
    check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok,
          J({'zone': s['zone'], 'dlg': s['dlg'], 'depth': s['depth'], 'moved': round(moved, 2), 'fb': [fb0, s['fb']], 'errs': new[:2]}))
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def wait_js(pg, js, secs):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): return True
        await pg.wait_for_timeout(800)
    return False


def hhmm(h):
    h = h % 24; return '%02d:%02d' % (int(h + 1e-6), int(round((h % 1) * 60)) % 60)


async def watch_toasts(pg, secs, bag):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await pg.evaluate(ST)
        if s['toast'] and s['toast'] not in bag: bag.append(s['toast'])
        await pg.wait_for_timeout(400)


async def enter_case(pg, cdp, key, hour, errs, info27=False):
    sh = SHOPS[key]; tag = '%s_%s' % (key, hhmm(hour).replace(':', ''))
    if info27: tag = key + '_h27'
    print('== %s %s%s' % (sh['name'], hhmm(hour), '（G.hour＝%.1f，INFO）' % hour if info27 else ''), flush=True)
    print('  [前置／捷徑] 讀檔：%s 店門前的路上 %s、2025-09-23（二）G.hour＝%.2f、條件事件關閉' % (sh['zone'], J(sh['start']), hour), flush=True)
    await L.load_state(pg, {'zone': sh['zone'], 'hour': hour, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': FLAGS, 'money': 3000, 'pos': {'x': sh['start'][0], 'z': sh['start'][1], 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    pre = await converse(pg, cdp, tag + '_pre', 20)
    it = await pg.evaluate(FIND_JS % J(sh['label']))
    if info27:
        s = await pg.evaluate(ST)
        print('INFO [%s] G.hour 27（前一天沒睡的 03:00）：讀檔後 zone=%s、時鐘 %s、對話 %s、店門互動點 %s' % (tag, s['zone'], s['clock'], J(pre), J(it)), flush=True)
        await pg.screenshot(path=os.path.join(OUT, 'cvs_%s.png' % tag)); return
    if not check('[%s] 店門有「%s」互動點（沒有被換成打烊的字）' % (tag, sh['label']), bool(it), J(it)):
        await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_nodoor.png' % tag)); return
    await L.go_to(pg, cdp, Run(), it['x'], it['z'], max(0.5, it['r'] * 0.6), sh['label'])
    await pg.wait_for_timeout(1000); s = await pg.evaluate(ST)
    check('[%s] 走到店門口：互動按鈕是「%s」' % (tag, sh['label']), s['interact'].startswith(sh['label']), J({k: s[k] for k in ('x', 'z', 'interact', 'clock')}))
    toasts = []
    await L.tap(pg, cdp, '#interact')
    ok = await wait_js(pg, "GAME.G.zone==='cvs'&&!GAME.E.player.busy", 45)
    await watch_toasts(pg, 3, toasts)
    lines = await converse(pg, cdp, tag + '_in', 30)
    s = await pg.evaluate(ST)
    check('[%s] ① %s 進得去（zone＝cvs）' % (tag, hhmm(hour)), ok and s['zone'] == 'cvs', J({k: s[k] for k in ('zone', 'x', 'z', 'clock')}))
    bad = [t for t in toasts + lines + pre if any(w in t for w in CLOSED_WORDS)]
    check('[%s] ② 沒有「打烊／關門」之類的字（對話、toast）' % tag, not bad, J({'bad': bad, 'toasts': toasts, 'lines': lines}))
    await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_inside.png' % tag))
    if s['zone'] != 'cvs': return
    await stuck_check(pg, cdp, tag + '_inside', fb0, e0, errs)
    ex = await pg.evaluate(FIND_JS % J('離開'))
    if not check('[%s] 店裡有「離開…」（日和 v2 是「離開日和便利店」）' % tag, bool(ex), J(ex)): return
    await L.go_to(pg, cdp, Run(), ex['x'], ex['z'], max(0.5, ex['r'] * 0.6), ex['label'])
    await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
    ok = await wait_js(pg, "GAME.G.zone!=='cvs'&&!GAME.E.player.busy", 45); await pg.wait_for_timeout(1500)
    s = await pg.evaluate(ST)
    check('[%s] ④ 出店回到%s' % (tag, sh['zone']), ok and s['zone'] == sh['zone'], J({k: s[k] for k in ('zone', 'x', 'z', 'cvsFrom')}))


async def midnight_case(pg, cdp, key, errs):
    sh = SHOPS[key]; tag = 'mid_' + key; h0 = 23 + 50 / 60
    print('== 跨午夜：%s（23:50 → 00:05）' % sh['name'], flush=True)
    fl = dict(FLAGS); extra = ''
    if key == 'wz': fl['CVS_FROM'] = 'wenzhou'; extra = '、flags.CVS_FROM＝wenzhou（和從溫州街門口進去一樣）'
    print('  [前置／捷徑] 讀檔：便利商店裡 (0, 1.5)、2025-09-23（二）23:50%s、條件事件關閉' % extra, flush=True)
    await L.load_state(pg, {'zone': 'cvs', 'hour': h0, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': fl, 'money': 3000, 'pos': {'x': 0, 'z': 1.5, 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    s0 = await pg.evaluate(ST)
    check('[%s] 前置：在便利商店裡、還沒過 00:00' % tag, s0['zone'] == 'cvs' and s0['hour'] < 24, J(s0))
    await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_2350.png' % tag))
    t0 = time.time(); last = s0; zones = set([s0['zone']]); maxjump = 0.0; lines = []; toasts = []; crossed_at = None; samples = []
    while time.time() - t0 < MID_TIMEOUT:
        await pg.wait_for_timeout(2000)
        s = await pg.evaluate(ST)
        zones.add(s['zone']); maxjump = max(maxjump, math.hypot(s['x'] - s0['x'], s['z'] - s0['z']))
        if s['toast'] and s['toast'] not in toasts: toasts.append(s['toast']); print('  [%s] toast：%s' % (tag, s['toast']), flush=True)
        if s['dlg'] or s['choices']:
            lines += await converse(pg, cdp, tag, 30)   # 不該出現；出現就逐句記下來、點掉
        if crossed_at is None and last['hour'] < 24 <= s['hour']:
            crossed_at = s; print('  [%s] 跨過 00:00：%s' % (tag, J({k: s[k] for k in ('hour', 'day', 't', 'clock', 'zone')})), flush=True)
            await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_0000.png' % tag))
        if len(samples) < 400 and (not samples or s['hour'] - samples[-1]['hour'] >= 0.02): samples.append({k: s[k] for k in ('hour', 't', 'zone', 'x', 'z', 'clock')})
        if s['zone'] != 'cvs': print('  [%s] 被帶離便利商店：%s' % (tag, J(s)), flush=True); last = s; break
        last = s
        if s['hour'] >= 24 + 5 / 60: break
    print('  [%s] 時間紀錄（每約 1 分鐘遊戲時間一筆）：%s' % (tag, J(samples[::3])), flush=True)
    s = await pg.evaluate(ST)
    check('[%s] ⑤ 一直在店裡、沒有被請出去（zone 只有 cvs）' % tag, zones == {'cvs'}, J(sorted(zones)))
    check('[%s] ⑥ 沒有被傳送（站著不動，位置變化 < 0.5 m）' % tag, maxjump < 0.5, '%.2f m' % maxjump)
    check('[%s] ⑦ 有跨日：G.hour %.3f → %.3f（≥ 24.083）、時鐘 %s' % (tag, s0['hour'], s['hour'], s['clock']), s0['hour'] < 24 and s['hour'] >= 24 + 5 / 60 - 1e-6 and crossed_at is not None and (' 00:' in s['clock'] or s['clock'].startswith('00:')),
          J({'E.time': [s0['t'], s['t']], 'day': [s0['day'], s['day']], 'real_s': round(time.time() - t0)}))
    bad = [t for t in toasts + lines if any(w in t for w in CLOSED_WORDS)]
    check('[%s] 跨午夜沒有「打烊／請離開」的對話或 toast' % tag, not bad and not lines, J({'lines': lines, 'toasts': toasts}))
    await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_0005.png' % tag))
    await stuck_check(pg, cdp, tag + '_0005', fb0, e0, errs)


async def force_case(pg, cdp, key, errs):
    """BB 11-04 02:45：02:30 以後 forceHome＝「回家睡」不算 FAIL，但字幕不能寫成「打烊」"""
    sh = SHOPS[key]; tag = 'force_' + key; h0 = 26.4
    print('== 02:30 forceHome：%s（02:24 在店裡等過 02:30）' % sh['name'], flush=True)
    fl = dict(FLAGS)
    if key == 'wz': fl['CVS_FROM'] = 'wenzhou'
    # BB-C 11-04：睡醒以後自動去上課是照設計（舊版 day 7＝週二晚上，隔天週三早上有課，卡住檢查時人在 classroom、busyDepth 2）→ 改挑「隔天沒課」的週五晚上（隔天週六）
    fd = await pg.evaluate("(d0=>{ try{ for(let d=d0; d<d0+40; d++){ const w=CALENDAR.dateOf(d).wd%7; if(w===5&&!(CALENDAR.typhoon&&(CALENDAR.typhoon(d)||CALENDAR.typhoon(d+1)))) return [d,w,CALENDAR.dateOf(d).key]; } }catch(e){} return null; })(%d)" % DAY)
    fday, fwd = (fd[0], fd[1]) if fd else (DAY, WD)
    print('  [前置／捷徑] 讀檔：便利商店裡 (0, 1.5)、%s（週五，隔天週六沒課）G.hour＝26.4（凌晨 02:24）、條件事件關閉' % (fd[2] if fd else '（找不到週五，照舊 day %d）' % DAY), flush=True)
    await L.load_state(pg, {'zone': 'cvs', 'hour': h0, 'day': fday, 'weekday': fwd, 'weather': 'clear', 'flags': fl, 'money': 3000, 'pos': {'x': 0, 'z': 1.5, 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    t0 = time.time(); lines = []; toasts = []; caps = []; left = None
    while time.time() - t0 < MID_TIMEOUT:
        await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')?(e.textContent||'').trim():''; })()")
        if c and c not in caps: caps.append(c); print('  [%s] 字幕：%s' % (tag, c), flush=True)
        s = await pg.evaluate(ST)
        if s['toast'] and s['toast'] not in toasts: toasts.append(s['toast']); print('  [%s] toast：%s' % (tag, s['toast']), flush=True)
        if s['dlg'] or s['choices']: lines += await converse(pg, cdp, tag, 60)
        if s['zone'] != 'cvs' and left is None: left = s; print('  [%s] 離開便利商店：%s' % (tag, J(s)), flush=True); await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_after.png' % tag))
        if left is not None and not s['busy'] and not s['dlg']: break
        if left is None and s['hour'] >= 26.75: break
    print('  [%s] 對話：%s' % (tag, J(lines)), flush=True)
    obs = 'forceHome 有發生（到 %s）' % left['zone'] if left else '02:45 前沒有被帶走'
    print('INFO [%s] %s' % (tag, obs), flush=True)
    texts = lines + toasts + caps
    bad = [t for t in texts if any(w in t for w in ('打烊', '關門', '請離開', '鐵捲門', '營業時間'))]
    check('[%s] 02:30 以後的字幕／對話／toast 沒有「打烊」類的字（回家睡可以）' % tag, not bad, J({'bad': bad, 'texts': texts}))
    more = []; t1 = time.time(); q = None
    # 事件一個接一個（起床選單約 4 秒後才出；選第一個＝「直接去上課」→ 坐好等上課 → 上課 → 下課，PC 11-04 CVS24_r2 停在 classroom depth 2＝等上課）：
    # 一直點，直到 busyDepth 0、玩家不忙、沒有條件事件在跑，連續 5 秒；上限 600 秒（BB 04:2x）
    while time.time() - t1 < 600:
        more += await converse(pg, cdp, tag + '_after', max(5, 600 - (time.time() - t1)))
        await pg.wait_for_timeout(5000); q = await pg.evaluate(ST)
        ev = await pg.evaluate("(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null")
        if not q['dlg'] and not q['choices'] and q['depth'] == 0 and not q['busy'] and not ev: break
    print('  [%s] 睡醒以後：%.0f 秒、最後 zone %s、depth %s（上課的話是一路演到下課）' % (tag, time.time() - t1, q and q['zone'], q and q['depth']), flush=True)
    await pg.screenshot(path=os.path.join(OUT, 'cvs_%s_after_done.png' % tag))   # 睡醒以後早上的條件事件（手機訊息、旁白、選單）先點完，再做卡住檢查（PC 11-04：對話還開著就檢查，dlg true、depth 1）
    print('  [%s] 睡醒以後的對話（%d 句）點完' % (tag, len(more)), flush=True)
    await stuck_check(pg, cdp, tag + '_after', fb0, e0, errs)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        if 'E' in CASES:
            for key in SHOPSEL:
                for h in HOURS: await enter_case(pg, cdp, key, h, errs)
            await enter_case(pg, cdp, SHOPSEL[0] if SHOPSEL else 'gg', 27.0, errs, info27=True)
        if 'F' in CASES:
            for key in SHOPSEL: await force_case(pg, cdp, key, errs)
        if 'M' in CASES:
            await midnight_case(pg, cdp, 'gg', errs)
            if MID_WZ: await midnight_case(pg, cdp, 'wz', errs)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
