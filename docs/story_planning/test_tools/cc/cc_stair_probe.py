"""CC（帳號 A）11-11：STAIR——木曜日（wz_mokuyobi）一樓樓梯 ⇄ 二樓店裡，樓梯頂卡在第 0 層（BB 07:46 判遊戲問題、擋發布；BB_343 A5）。
PC 重現三次：L118D_H_B REG_YT、H_C REG_XC、H_B_r2 REG_YT 都停在 (−3.35, 2.876) lv0 y≈2.8——人已在樓梯頂，第 0 層前面全擋、第 1 層站得住，沒換層；往下退 1 m 再走就上得去。
做法（Playwright 手機模擬（PC GPU）≠ iPhone）：
  【前置／捷徑】讀 day46 存檔（fixtures/user_saves_1107）直接放到木曜日一樓樓梯底 (x, 5.4) lv0（STAIR_DAY，預設 2025-11-05 週三 15:00；木曜日週二休）。
  三條線 X_LIST（預設 −4.3,−3.75,−3.35）：每條線 TRIPS 趟（預設 10），每趟：
    上：搖桿直線推向同一條線的樓梯頂平台 (x, TOP_Z) lv1（straight＝不繞路，看「這一條線走不走得上去」），再照找路走進店裡 (0, 0.9) lv1；
    下：搖桿走回同一條線的平台 (x, TOP_Z) lv1，再直線推回樓梯底 (x, 5.6) lv0。
    每一段記：成功（換到該層、到點）、秒數、推幾次、停下的座標／y／lv；20 秒沒前進 0.3 m＝卡住 → 截圖＋診斷（同 cc_l118d_h_probe 的 STUCK_JS：2.5 m 內 NPC、往北幾格第 0／1 層站不站得住與高度、找路、E.unstick 次數）
    → 脫困：往下退 1 m 再走一次（記上不上得去）；還是不行就【捷徑】放回樓梯底，下一趟。
  RUN＝1：觸控按「跑」（#btnRun 切成跑步）；FPSCAP＝10：包 requestAnimationFrame 限 10 fps（【前置／捷徑】只改幀率）。
判定：每一段 PASS／FAIL；結尾印每條線「上 n/TRIPS、下 n/TRIPS、卡住的座標」總表。舊版（線上 779ddd650）也照跑，分辨本來就有還是這一版才有。
PUSH（CC-C 11-12，BB-C 03:30）：straight 直線推／diag 稍微斜推（目標往樓梯中線偏 0.5 m；樓梯 x −4.5～−3、中線 −3.75＝be1e 雲端量 11-12）／tap 點樓梯面（每次點前面 2 m、快到才點目標）。
CC_02 清單 2026-11-12：1✓ 2✓ 3n/a（BB 指定固定三條線、每條線一趟，不挑候選） 4✓ 5✓ 6n/a（不測時刻，只測走路；讀檔 15:00 木曜日有開） 7✓ 8✓ 9n/a（卡住截圖本來就要看到人，不藏玩家） 10✓ 11✓ 12✓ 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> RUN=0|1 FPSCAP=0|10 [PUSH=straight|diag|tap] python3 cc_stair_probe.py <url> <out>"""
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
SHA = os.environ.get('SHA') or ''
RUN = os.environ.get('RUN') == '1'
FPSCAP = int(os.environ.get('FPSCAP') or '0')
TRIPS = int(os.environ.get('TRIPS') or '10')
X_LIST = [float(x) for x in (os.environ.get('X_LIST') or '-4.3,-3.75,-3.35').split(',') if x.strip()]
TOP_Z = float(os.environ.get('TOP_Z') or '1.9')
BOT_Z = float(os.environ.get('BOT_Z') or '5.4')
PUSH = os.environ.get('PUSH') or 'straight'   # BB-C 11-12 03:30：10 fps 樓梯照玩家三種推法——straight 直線推、diag 稍微斜推（目標往樓梯中線偏 0.5 m）、tap 點樓梯上面／下面的地面；上樓、下樓各一次，記卡不卡、卡多久
SHOP = (0.0, 0.9)
STAIR_DAY = os.environ.get('STAIR_DAY') or '2025-11-05'
STAIR_H = float(os.environ.get('STAIR_H') or '15.0')
R = L.Run('stair', OUT); F.setup(R, OUT)
J = F.J
DAY1 = datetime.date(2025, 9, 17)
TAG = '%s%s' % ('跑' if RUN else '走', ('、%d fps' % FPSCAP) if FPSCAP else '')

UNSTICK_JS = r"""(()=>{ const E=GAME.E; if(!E||E.__ccUnw||!E.unstick) return; const f=E.unstick; E.unstick=function(){ const r=f.apply(this,arguments); if(r) window.__ccUnstick=(window.__ccUnstick|0)+1; return r; }; E.__ccUnw=1; })()"""
FPSCAP_JS = r"""(cap=>{ const W=window; if(!W.__rafOrig) W.__rafOrig=W.requestAnimationFrame.bind(W); const orig=W.__rafOrig;
  if(!cap){ W.requestAnimationFrame=orig; W.__fpsCap=0; return 0; } const gap=1000/cap; W.__fpsCap=cap; let last=0;
  W.requestAnimationFrame=cb=>orig(function tick(t){ if(t===last||t-last>=gap-1){ last=t; cb(t); } else orig(tick); }); return cap; })"""   # CC 08:4x：同一幀放行的時間戳記其他回呼也放行（原本遊戲主迴圈永遠排第一、量幀率的回呼餓死，evaluate 卡到 20 分鐘逾時）
FPS_JS = "new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"
STUCK_JS = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0; const f2=v=>v==null?null:+(+v).toFixed(2);
  const near=(E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z)<2.5).map(n=>{ const q=n.obj.position; return {id:n.charId||n.id||'', name:n.name||'', x:f2(q.x), z:f2(q.z), y:f2(q.y), lv:n.lv|0, r:n.radius, beh:n.beh||null,
    walking:!!(n.path&&n.path.length), extra:!!n.isExtra, leaving:!!n.leaving}; });
  const Ls=E.levels||[]; const cells=[]; for(let dz=-0.7; dz<=0.31; dz+=0.1){ const z=o.z+dz; cells.push({z:f2(z), s0:E.canStand(o.x,z,0.3,0), s1:Ls.length>1?E.canStand(o.x,z,0.3,1):null, h0:Ls[0]&&Ls[0].heightAt?f2(Ls[0].heightAt(o.x,z)):null, h1:Ls[1]&&Ls[1].heightAt?f2(Ls[1].heightAt(o.x,z)):null}); }
  const south=[]; for(let z=5.2; z<=6.51; z+=0.1){ south.push({z:f2(z), s0:E.canStand(o.x,z,0.3,0), s1:Ls.length>1?E.canStand(o.x,z,0.3,1):null, h0:Ls[0]&&Ls[0].heightAt?f2(Ls[0].heightAt(o.x,z)):null, h1:Ls[1]&&Ls[1].heightAt?f2(Ls[1].heightAt(o.x,z)):null}); }
  let path=null; try{ const p=E.pathTo(o.x,o.z,lv,0,0.9,1); path=p?p.slice(0,8).map(q=>Array.isArray(q)?q.map(f2):[f2(q.x),f2(q.z),q.lv]):null; }catch(e){ path=String(e); }
  return {pos:{x:f2(o.x),z:f2(o.z),y:f2(o.y),lv}, near, cells, path, unstick:window.__ccUnstick|0, fb:GAME.walkFallbacks||0, run:!!P.runHold, south}; })()"""


def day_of(key):
    return (datetime.date.fromisoformat(key) - DAY1).days + 1


def base(x, z, lv=0):
    s = json.load(open(F.SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    d = datetime.date.fromisoformat(STAIR_DAY)
    s['day'] = day_of(STAIR_DAY); s['weekday'] = d.isoweekday() % 7; s['hour'] = STAIR_H; s['zone'] = 'wz_mokuyobi'
    s['pos'] = {'x': x, 'z': z, 'yaw': 0.0, 'lv': lv}; s['weather'] = 'clear'; s['invites'] = []
    return s


async def load_at(pg, cdp, x, why):
    s = base(x, BOT_Z, 0)
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp); await pg.evaluate(UNSTICK_JS); await F.ready(pg, cdp, 30)
    if FPSCAP: await pg.evaluate(FPSCAP_JS, FPSCAP)
    if RUN:
        on = await pg.evaluate("(()=>!!GAME.E.player.runHold)()")
        if not on: await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(400)
    st = await D.st(pg); c = await pg.evaluate("(d=>{ const x=CALENDAR.dateOf(d); return {key:x.key, wd:x.wd%7, hol:CALENDAR.holiday(d), typh:CALENDAR.typhoon(d)}; })", s['day'])
    run = await pg.evaluate("(()=>!!GAME.E.player.runHold)()")
    R.setup('%s：day46 存檔 → %s %05.2f 木曜日一樓樓梯底 (%.2f, %.2f) lv0%s%s（站在 (%.2f, %.2f) lv%d、跑步 %s）' % (why, c['key'], STAIR_H, x, BOT_Z, '、【捷徑】限 %d fps' % FPSCAP if FPSCAP else '', '、觸控按「跑」' if RUN else '', st['x'], st['z'], st['lv'], run))
    return st


async def stuck_diag(pg, tag):
    d = await pg.evaluate(STUCK_JS)
    nm = 'stair_stuck_%s' % ''.join(ch for ch in tag if ch.isalnum() and ord(ch) < 128)[:24].lower()
    try: await D.shot(pg, nm)
    except Exception: pass
    R.note('%s 【卡住診斷】樓梯底往南 z 5.2～6.5（同一個 x；BB 08:44：看第 1 層的格子是不是延伸到樓梯底下）%s' % (tag, J(d.get('south'))))
    R.note('%s 【卡住診斷】位置 %s；2.5 m 內 NPC %s；往北幾格（s0／s1＝第 0／1 層站不站得住、h0／h1＝高度）%s；找路 %s；E.unstick 成功 %s 次；walkFallbacks %s；跑步 %s；截圖 %s' % (tag, J(d['pos']), J(d['near']), J(d['cells']), J(d['path']), d['unstick'], d['fb'], d['run'], nm))
    return d


FRAMELOG = os.environ.get('FRAMELOG') == '1'   # BB 11:43：逐幀記位置、dt、位移／(速度×dt)；比值 >2 才算跳（記前後幀的 lv、y、blockedAt.slide＝stepEntity 走哪一條：x／z 沿牆滑、half 半步、none 不動；沒有 blockedAt＝整步或換層）
FRAME_ON = r"""(()=>{ const W=window; if(W.__ccFL) { W.__ccFL.buf=[]; W.__ccFL.n=0; W.__ccFL.maxR=0; return 1; } const st={buf:[],n:0,maxR:0,prev:null}; W.__ccFL=st;
  const raf=(f)=>W.requestAnimationFrame(f);   /* 用遊戲同一個（限幀後的）rAF，取樣和遊戲幀對齊；用原始 rAF 會在遊戲沒動的幀之間算出假比值 */
  const tick=(t)=>{ try{ const E=GAME.E, P=E&&E.player; if(P){ const o=P.obj.position, sp=(P.run||P.runHold)?E.SPD.run:E.SPD.walk, b=P.blockedAt;
      const cur={t:+t.toFixed(1), x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), lv:P.lv|0, slide:b?(b.slide||'?'):null, run:!!(P.run||P.runHold), path:!!(P.path&&P.path.length)};
      if(st.prev){ const dt=(cur.t-st.prev.t)/1000, d=Math.hypot(cur.x-st.prev.x,cur.z-st.prev.z); if(dt>0){ const ratio=d/(sp*dt); st.n++; if(ratio>st.maxR) st.maxR=+ratio.toFixed(2);
        if(ratio>2&&d>0.3&&st.buf.length<40) st.buf.push({before:st.prev, after:cur, dt:+dt.toFixed(3), d:+d.toFixed(3), sp, ratio:+ratio.toFixed(2), lvChange:st.prev.lv!==cur.lv}); } }
      st.prev=cur; } }catch(e){} raf(tick); };
  raf(tick); return 1; })()"""
FRAME_TAKE = "(()=>{ const s=window.__ccFL; if(!s) return null; const r={frames:s.n, maxRatio:s.maxR, jumps:s.buf.slice()}; s.buf=[]; s.n=0; s.maxR=0; return r; })()"


async def seg(pg, cdp, tag, tx, tz, lv, straight):
    if FRAMELOG: await pg.evaluate(FRAME_ON)
    r = await F.joy_to(pg, cdp, tag, tx, tz, near=0.5, lv=lv, max_s=45, straight=straight)
    if FRAMELOG:
        fl = await pg.evaluate(FRAME_TAKE)
        if fl: R.note('%s 【逐幀】%d 幀、位移／(速度×dt) 最大 %s；比值 >2 的幀（真的跳）%d 個：%s' % (tag, fl['frames'], fl['maxRatio'], len(fl['jumps']), J(fl['jumps'][:6])))
    e = r['end']
    R.note('%s → (%.2f, %.2f) lv%d：%s、%s 秒、推 %d 次、停在 (%.2f, %.2f) y=%s lv%d、跳 %s' % (tag, tx, tz, lv, '到了' if r['ok'] else '沒到：' + str(r.get('why')), r['t'], r['pushes'], e['x'], e['z'], e.get('y'), e['lv'], J(r['jumps'])))
    return r


async def down_escape(pg, cdp, t, x):
    """BB 08:44：下樓卡住時依序試脫困——往回推（往樓梯頂）1 m、往左 1 m、往右 1 m（各推完再直線推下樓）、點地走到樓梯底外 1 m（z=BOT_Z+1）。
    前一個已脫困（第 0 層、到樓梯底）就不再試後面的（同一次卡住只能看第一個有效的方法）。回傳 [(方法, 出得來, 秒)]"""
    out = []
    async def stuck():
        q = await D.st(pg); return not (q['lv'] == 0 and q['z'] >= BOT_Z - 0.1)
    for nm, dx, dz in (('往回推（往樓梯頂）1 m', 0.0, -1.0), ('往左 1 m', -1.0, 0.0), ('往右 1 m', 1.0, 0.0)):
        if not await stuck(): out.append([nm, None, None]); continue
        t0 = time.time(); q = await D.st(pg)
        await seg(pg, cdp, t + ' 【脫困】' + nm, q['x'] + dx, q['z'] + dz, q['lv'], True)
        r = await seg(pg, cdp, t + ' 【脫困】' + nm + '後再直線推下樓', q['x'] + dx, BOT_Z + 0.2, 0, True)
        ok = not await stuck(); out.append([nm, ok, round(time.time() - t0, 1)])
        R.note('%s 【脫困】%s：%s（%.1f 秒；停在 %s）' % (t, nm, '出來了' if ok else '還是出不來', time.time() - t0, J([r['end']['x'], r['end']['z'], r['end'].get('y'), r['end']['lv']])))
    if await stuck():
        t0 = time.time(); pt = await L.tap_ground(pg, cdp, x, BOT_Z + 1.0, lv=0)
        for _ in range(40):
            await pg.wait_for_timeout(500)
            if not await stuck(): break
        ok = not await stuck(); q = await D.st(pg); out.append(['點地走到樓梯底外 1 m', ok, round(time.time() - t0, 1)])
        R.note('%s 【脫困】點地走到樓梯底外 1 m (%.2f, %.2f)：%s（%.1f 秒；點到 %s；停在 (%.2f, %.2f) lv%d）' % (t, x, BOT_Z + 1.0, '出來了' if ok else '還是出不來', time.time() - t0, J(pt and pt.get('hit')), q['x'], q['z'], q['lv']))
    else: out.append(['點地走到樓梯底外 1 m', None, None])
    R.note('%s 【脫困】結果（None＝前面已脫困、沒試）%s' % (t, J(out)))
    return out


async def tap_seg(pg, cdp, tag, tx, tz, lv):
    """點地走：點目標那一點（那一層地板投影）；沒在動就每 6 秒再點一次（看不到就轉鏡頭）；記最長一次沒前進 0.3 m 的秒數＝卡多久"""
    t0 = time.time(); taps = 0; miss = 0; aim = None; last = None; still0 = time.time(); worst = 0.0; e = None
    while time.time() - t0 < 45:
        e = await D.st(pg)
        if math.hypot(e['x'] - tx, e['z'] - tz) <= 0.5 and e['lv'] == lv: break
        if e.get('dlg') or e.get('choices'):   # CC_02 乙 13：途中有對話／選單就停下來記，不盲點（讀檔時已關條件事件，照理不會有）
            R.note('%s 點地途中出現對話／選單：%s——停下來，不判' % (tag, J({k: e.get(k) for k in ('dlg', 'choices', 'interact')}))); break
        if last is None or math.hypot(e['x'] - last[0], e['z'] - last[1]) >= 0.3: last = (e['x'], e['z']); still0 = time.time()
        worst = max(worst, time.time() - still0)
        if taps == 0 or time.time() - still0 > 2.5 or (aim and math.hypot(e['x'] - aim[0], e['z'] - aim[1]) < 0.6):
            # 像玩家點樓梯：目標在別的樓層、從這裡看不到（雲端 be1e 第一次從一樓直接點二樓平台，人一步沒動＝CC_02 乙 5），就點前面 2 m 的樓梯面（這一層）；快到了才點目標那一點
            dd = math.hypot(tx - e['x'], tz - e['z'])
            if dd > 2.2: f = 2.0 / dd; ax, az, alv = e['x'] + (tx - e['x']) * f, e['z'] + (tz - e['z']) * f, e['lv']
            else: ax, az, alv = tx, tz, lv
            pt = await L.tap_ground(pg, cdp, ax, az, lv=alv)
            if not pt: await L.turn_camera_to(pg, cdp, ax, az); pt = await L.tap_ground(pg, cdp, ax, az, lv=alv)
            aim = (ax, az)
            if pt and await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):   # CC_02 乙 4：點下去打開了手機＝點到 HUD 旁邊，不算點到遊戲畫面，收起來
                R.note('%s 這一下打開了手機（點到 HUD 旁邊）：收起來，不算' % tag); await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(500); pt = None
            if pt: taps += 1; still0 = time.time()
            else: miss += 1
        await pg.wait_for_timeout(300)
    e = await D.st(pg); ok = math.hypot(e['x'] - tx, e['z'] - tz) <= 0.5 and e['lv'] == lv
    r = {'ok': ok, 't': round(time.time() - t0, 1), 'pushes': taps, 'jumps': [], 'end': {'x': e['x'], 'z': e['z'], 'y': e.get('y'), 'lv': e['lv']}, 'why': None if ok else ('45 秒沒到' + ('；點了 0 次＝探針沒點到（不是遊戲走不動）' if taps == 0 else '')), 'stuck_s': round(worst, 1), 'miss': miss}
    R.note('%s → (%.2f, %.2f) lv%d：%s、%s 秒、點到 %d 次（沒點到 %d 次）、最長停住 %.1f 秒、停在 (%.2f, %.2f) y=%s lv%d' % (tag, tx, tz, lv, '到了' if ok else '沒到', r['t'], taps, miss, worst, e['x'], e['z'], e.get('y'), e['lv']))
    return r


async def push_seg(pg, cdp, tag, x, tz, lv):
    """上樓／下樓那一段照 PUSH 的推法"""
    if PUSH == 'tap': return await tap_seg(pg, cdp, tag + '（點地）', x, tz, lv)
    if PUSH == 'diag':
        mid = -3.75; dx = 0.5 if x <= mid else -0.5   # 往樓梯中線那邊偏（樓梯 x −4.5～−3）
        return await seg(pg, cdp, tag + '（斜推，目標偏 %+.1f m）' % dx, x + dx, tz, lv, True)
    return await seg(pg, cdp, tag, x, tz, lv, True)


async def trip(pg, cdp, x, k, stats):
    t = '[%s x=%.2f 第 %d 趟]' % (TAG, x, k)
    # 上：同一條線直線推上樓梯頂平台，再照路走進店裡
    r1 = await push_seg(pg, cdp, t + ' 上樓梯（%s）' % PUSH, x, TOP_Z, 1)
    ok_up = r1['ok']
    if not ok_up:
        d = await stuck_diag(pg, t + ' 上')
        s0 = await D.st(pg)
        await seg(pg, cdp, t + ' 【脫困】往下退 1 m', s0['x'], s0['z'] + 1.0, 0, True)
        r1b = await seg(pg, cdp, t + ' 【脫困】再上一次', x, TOP_Z, 1, True)
        stats['up_stuck'].append({'trip': k, 'pos': d['pos'], 'retry_ok': r1b['ok']})
        if not r1b['ok']:
            R.check('%s 上樓梯：卡住、退 1 m 再走也上不去' % t, False, J(d['pos'])); return False
    R.check('%s 上樓梯（%s）上得去、換到第 1 層' % (t, PUSH), ok_up, J({'end': [r1['end']['x'], r1['end']['z'], r1['end'].get('y'), r1['end']['lv']], 't': r1['t']}))
    if ok_up: stats['up_ok'] += 1
    r2 = await seg(pg, cdp, t + ' 進店', SHOP[0], SHOP[1], 1, False)
    R.check('%s 從平台走進二樓店裡' % t, r2['ok'], J({'end': [r2['end']['x'], r2['end']['z'], r2['end']['lv']]}))
    # 下：回到同一條線的平台，直線推下樓梯
    await seg(pg, cdp, t + ' 回平台', x, TOP_Z, 1, False)
    r3 = await push_seg(pg, cdp, t + ' 下樓梯（%s）' % PUSH, x, BOT_Z + 0.2, 0)
    if not r3['ok']:
        d = await stuck_diag(pg, t + ' 下')
        esc = await down_escape(pg, cdp, t, x)
        stats['down_stuck'].append({'trip': k, 'pos': d['pos'], 'escape': esc})
    else: stats['down_ok'] += 1
    R.check('%s 下樓梯（%s）下得去、換回第 0 層' % (t, PUSH), r3['ok'], J({'end': [r3['end']['x'], r3['end']['z'], r3['end'].get('y'), r3['end']['lv']], 't': r3['t']}))
    return r3['ok']


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        R.note('CC STAIR：受測 SHA %s、%s；%s；三條線 %s、每條 %d 趟；平台 z %.2f、樓梯底 z %.2f；Playwright（PC GPU）≠ iPhone' % (SHA or '（沒給）', ver, TAG, J(X_LIST), TRIPS, TOP_Z, BOT_Z))
        table = []
        for x in X_LIST:
            print('== x %.2f' % x, flush=True)
            stats = {'x': x, 'up_ok': 0, 'down_ok': 0, 'up_stuck': [], 'down_stuck': []}
            n0 = len(errs); t0 = time.time()
            try:
                await load_at(pg, cdp, x, '【前置／捷徑】x=%.2f' % x)
                if FPSCAP: R.note('[%s x=%.2f] 實際幀率 %s fps' % (TAG, x, await pg.evaluate(FPS_JS)))
                for k in range(1, TRIPS + 1):
                    ok = await trip(pg, cdp, x, k, stats)
                    if not ok:
                        await load_at(pg, cdp, x, '【前置／捷徑】x=%.2f 第 %d 趟沒回到樓梯底，放回去' % (x, k))
            except Exception as e:
                R.check('[%s x=%.2f] 探針沒有例外' % (TAG, x), False, repr(e)[:300])
            R.check('[%s x=%.2f] 沒有 JS 例外' % (TAG, x), len(errs) == n0, J(errs[n0:n0 + 3]))
            R.note('[%s x=%.2f] 用了 %.0f 秒' % (TAG, x, time.time() - t0))
            table.append(stats)
        R.note('【總表 %s】%s' % (TAG, J([{'x': s['x'], '上': '%d/%d' % (s['up_ok'], TRIPS), '下': '%d/%d' % (s['down_ok'], TRIPS), '上卡住': s['up_stuck'], '下卡住': s['down_stuck']} for s in table])))
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
