"""CC-C（帳號 C）11-05：NANYANG_v1（BB-C 04:16 派工，D141 順序第 1 間）——南洋戲院第 1 版只測「擋玩」的五項（D141：走不到、坐不下、穿模、卡住、黑畫面）＋給使用者看的截圖。
  版本：LAWWW-C 整合 a3b18addc（LAWWW2-C 9eed89550＋接線 patch＋XS-ARCADE-NAV-1105）。判定歸 BB；PC＝Windows＋GPU，雲端 SwiftShader（顏色、亮度以電腦為準）。
  期望值的出處：src/data/nanyang_layout.js（LAWWW2／BB 的配置：enterAt、exit、hallOut、seats、hall.slope、hall.seats）、
    docs/art-rebuild/second_ai/wip/xs_arcade_nav_1105/README.md（9eed89550：沒有騎樓的兩段 z −68～−40、47.4～68，牆在 x −13.2；牆裡 x −13.6、−15.5 站不住、人行道 x −12.4 站得住）。
  一、進出（照玩家走）：【前置】讀檔新生南路 2025-10-18（六）14:00（營業 09:30–24:00；11-05 起用週六，週三下午有課會被帶去上課）、站在戲院門口南邊騎樓 → 走到「進南洋戲院」按 → 大廳（站得住、推得動）
      → 走到「進 1 廳」→ 1 廳 → 走到「回大廳」→ 大廳 → 走到「出去（新生南路）」→ 新生南路（站得住、推得動）。
  二、座位：大廳四張長椅、1 廳九排靠右走道那一張，都走到 GAME.seatApproach 那一點按「坐下…」→ player.seat；坐下的位置離座位 0.15 m 內、高度＝那一排地板（1 廳）；起身、推得動 ≥0.3 m。
      有 NPC 坐著的位子遊戲不給坐＝記下跳過（不算 FAIL）。
  三、斜地板：1 廳從門口沿右邊走道走到第一排前面、再走回門口；每 0.3 秒記人的高度，和配置 floorY(z) 差 ≤0.06 m；兩段都要到。
  四、穿模／黑畫面：上面每一步人都站得住（E.canStand）、沒有被放到目的地（GAME.walkFallbacks 不增加）；每張截圖算平均亮度（<6/255 且幾乎沒有變化＝黑畫面）。
  五、新生南路騎樓（XS-ARCADE-NAV-1105）：①兩段（z −68～−40、47.4～68）每 1 m 看 x −13.6、−15.5 站不住、x −12.4 站得住；
      ②照玩家點地往牆裡走（騎樓南北兩端往公寓那邊點），一路記位置：在那兩段裡人的 x 都 ≥ −13.2（不在牆裡）。
  截圖（給使用者看，不判；藏 HUD、藏玩家）：大廳 camRef（配置 lobby.camRef：eye、look、lens 24 mm）、1 廳（配置沒有 camRef：門口往銀幕，eye (3.5,1.6,7.4) look (0,1.4,−7.75) 24 mm），白天 14:00、晚上 21:00 各一張。
  六、營業時間外（BB-C 04:31 加）：places.js xs_nanyang 每天 09:30–24:00（AA_615 第 3 節）——讀檔新生南路 08:00 走到店門按「進南洋戲院」：不換區域、跳 toast（PLACES.closedText）；09:30 以後照樣進得去（上面一）。
  ===== CC（帳號 A）11-10 NANYANG_v3（BB 10:23：開發分支 fe4d893ac，LAWWW2 指定；r1＝NANYANG_v2 63 PASS／5 FAIL）=====
  七、長椅走近點（fe4d893ac nanyang3d.js：長椅按鈕在座位上、範圍 1.0（NANYANG-BENCH-SIT-1105，原本 0.8）；GAME.seatApproach＝座位前 0.8 m＝(2.95, z)）：先核對這兩個數字，再照舊 D.sit_all。
  八、時間守門：r1 每段走路常常走滿 240～300 秒（遊戲時間一段 1.6～2 小時），大廳 #3、#4 時已經 23～24 點，24:00 打烊（XS_CLOSE）把人送回新生南路＝第 5 項「找不到進 1 廳」。
      現在每張座位之前、找「進 1 廳」之前看區域和時間：不在該在的區域、或 20:30 以後＝【前置／捷徑】讀檔回同一區域 14:00（印出當時在哪）。
  九、買票（SHOP-STAFF-1107，src/nanyang_sys3d.js）：大廳營業時間有店員（NYS.clerkAt：週五、週六 Alison 那兩天站爆米花機旁邊 (−4.1, −3.7)，其他天 NY3.CLERK (−4.1, −2.8)）；
      櫃檯前（配置 popcorn (−2.6, −2.8)，範圍 0.9）按「買票」→ 選單「買票　150 元」「不用了」→ 扣 150（toast「💸 150 元」）、G.flags.NY_TICKET＝今天、「買票」藏起來。
  十、看電影（src/aa614_3d.js S.watch，AA_615）：有今天的票、今天還沒看過，1 廳「坐下看電影」坐下＝NY3.houseLights(false)（場燈關）→ 黑幕 → 時間 +min(4, 24−現在)
      → 旁白三句隨機一句（AA614.L.watch）→ 場燈打開、G.flags.NY_WATCHED＝今天 → 座位選單（起身）。同一天再坐一次不再演；沒有票坐下也不演（座位那一段順便看）。
  十一、ART（D120）：大廳 camRef、1 廳門口往銀幕各一張乾淨截圖（14:00、藏 HUD（D.HUD）、藏玩家）：ART_nanyang_lobby.png、ART_nanyang_hall.png。
用法：LW_TESTS=<wt>/tests [PARTS=door,seats,slope,movie,arcade,closed,xsclose,art,shots] python3 cc_nanyang_v1_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time, io
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
PARTS = [x for x in (os.environ.get('PARTS') or 'door,seats,slope,movie,arcade,closed,xsclose,art,shots').split(',') if x]
R = L.Run('nanyang_v1', OUT); D.setup(R, OUT)
DAY = '2025-10-18'   # 週六（PC 11-05 NANYANG_v2：週三下午有課，坐大廳座位途中被上課流程帶到教室）
ST = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position; const ch=document.getElementById('choices'), it=document.getElementById('interact');
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||'').trim()):[];
  return {zone:GAME.G.zone, x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), lv:P.lv|0, seat:!!P.seat, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active), choices,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,24):'',
    stand:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null, fb:GAME.walkFallbacks||0, hour:+(+GAME.G.hour).toFixed(2)}; })()"""
SEATS = r"""(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>{ const ap=GAME.seatApproach?GAME.seatApproach(i.seat):null, s=i.seat;
  return {label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), sx:+s.x.toFixed(3), sz:+s.z.toFixed(3), sy:s.y==null?null:+(+s.y).toFixed(3), row:i.row||null, ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null}; }))()"""
EXITS = r"""(()=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||1, to:i.exit.to})))()"""
CAM = r"""((C)=>{ const E=GAME.E, cam=E.camera, V=THREE.Vector3; const hf=2*Math.atan(18/(C.lens||24)), vf=2*Math.atan(Math.tan(hf/2)/(innerWidth/innerHeight));
  E.paused=true; E.cinematic&&E.cinematic(new V(...C.eye),new V(...C.look));
  for(let i=0;i<2;i++){ cam.position.set(...C.eye); E.cam.look=new V(...C.look); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); } cam.fov=vf*180/Math.PI; cam.updateProjectionMatrix(); E.render();
  return {eye:C.eye, look:C.look, lens:C.lens||24, vfov:+(vf*180/Math.PI).toFixed(2)}; })"""
UNCAM = r"""(()=>{ const E=GAME.E; E.paused=false; if(E.endCinematic) E.endCinematic(); return true; })()"""
HUD = r"""(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
SAMPLES = []


def lum(png_bytes):
    """截圖的平均亮度、標準差（0～255）；沒有 PIL 就回 None"""
    try:
        from PIL import Image, ImageStat
    except ImportError:
        return None
    im = Image.open(io.BytesIO(png_bytes)).convert('L'); s = ImageStat.Stat(im)
    return [round(s.mean[0], 1), round(s.stddev[0], 1)]


async def shot(pg, name, judge_black=True):
    path = os.path.join(OUT, name + '.png'); b = await pg.screenshot(path=path); m = lum(b)
    if m is None: m = await D.lum_browser(pg, b)   # PC 沒有 PIL
    if judge_black and m is not None:
        R.check('[黑畫面] %s 不是黑畫面（平均亮度 %s、變化 %s）' % (name, m[0], m[1]), not (m[0] < 6 and m[1] < 4), J(m))
    elif m is None: R.note('[黑畫面] %s：沒有 PIL，沒算亮度（看截圖）' % name)
    return m


async def st(pg):
    return await pg.evaluate(ST)


async def wait_zone(pg, cdp, zone, max_s=40):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['zone'] == zone and not s['busy'] and not s['dlg']: return s
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return await st(pg)


async def pushable(pg, cdp):
    for dx, dy in ((0, 60), (60, 0), (-60, 0), (0, -60)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
        if moved >= 0.3: return round(moved, 2)
    return 0.0


async def use_exit(pg, cdp, tag, label0, to):
    """走到出口那一點、互動按鈕是它就按；回傳換到的區域狀態"""
    ex = next((e for e in await pg.evaluate(EXITS) if e['label'].startswith(label0)), None)
    if not R.check('%s 有「%s」' % (tag, label0), bool(ex), J(await pg.evaluate(EXITS))): return None
    fb0 = (await st(pg))['fb']
    # 出口那一點本身常常站不住（玻璃門、門框；雲端 11-05 冒煙：大廳出口 (0, 6.55) canStand＝false → 點地走不過去）：走到出口範圍裡、離人最近、站得住的那一點
    tgt = await pg.evaluate("""((e)=>{ const E=GAME.E, P=E.player.obj.position; let best=null;
      for(let r=0; r<=e.r*0.85+1e-6; r+=0.1) for(let a=0; a<360; a+=15){ const x=e.x+r*Math.sin(a*Math.PI/180), z=e.z+r*Math.cos(a*Math.PI/180);
        if(!E.canStand(x,z,0.3,E.player.lv|0)) continue; const d=Math.hypot(x-P.x,z-P.z); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d}; }
      return best; })""", ex)
    R.note('%s 「%s」在 (%s, %s) 半徑 %s；走到範圍裡站得住的 %s' % (tag, label0, ex['x'], ex['z'], ex['r'], J(tgt)))
    if not R.check('%s 「%s」範圍裡有站得住的地方' % (tag, label0), bool(tgt), J(ex)): return None
    await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.25, '%s %s' % (tag, label0), max_s=240)
    await pg.wait_for_timeout(800); s = await st(pg)
    if not s['interact'].startswith(label0):
        for _ in range(8):
            await pg.wait_for_timeout(500); s = await st(pg)
            if s['interact'].startswith(label0): break
    if not R.check('%s 走到那裡，互動按鈕是「%s」' % (tag, label0), s['interact'].startswith(label0), J({k: s[k] for k in ('x', 'z', 'interact')})): return None
    await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, to)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp); s = await st(pg)
    R.check('%s 按下去到了 %s（站得住、沒有被放到目的地）' % (tag, to), s['zone'] == to and s['stand'] and s['fb'] == fb0, J(s))
    return s


async def load_street(pg, cdp, x, z, h=14.0, yaw=None):
    d = await pg.evaluate("STORY.dayOfKey('%s')" % DAY)
    st0 = {'zone': 'xinsheng', 'hour': h, 'day': d, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': yaw if yaw is not None else math.pi / 2, 'lv': 0}}
    await L.load_state(pg, st0, quiet_events=True, quiet_phone=True)
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    return await st(pg)


async def part_door(pg, cdp):
    door = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='xs_nanyang'); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}:null; })()")
    R.note('[進出] 新生南路的戲院店門：%s' % J(door))
    if not R.check('[進出] 新生南路有「進南洋戲院」（exit.to＝xs_nanyang）', bool(door) and door['label'].startswith('進南洋戲院'), J(door)): return False
    s = await use_exit(pg, cdp, '[進出 新生南路→大廳]', '進南洋戲院', 'xs_nanyang')
    if not s: return False
    R.note('[進出] 進到大廳的位置 %s（配置 enterAt (0, 5.2)）' % J([s['x'], s['z']]))
    R.check('[進出] 大廳：站在入口裡面（enterAt 0.6 m 內）、推得動 ≥0.3 m', math.hypot(s['x'] - 0, s['z'] - 5.2) < 0.6 and await pushable(pg, cdp) >= 0.3, J(s))
    await shot(pg, 'door_01_lobby_in')
    s = await use_exit(pg, cdp, '[進出 大廳→1 廳]', '進 1 廳', 'xs_nanyang_hall')
    if not s: return False
    R.check('[進出] 1 廳：站在門口裡面（enterAt (3.5, 6.4) 0.6 m 內）、推得動', math.hypot(s['x'] - 3.5, s['z'] - 6.4) < 0.6 and await pushable(pg, cdp) >= 0.3, J(s))
    await shot(pg, 'door_02_hall_in')
    s = await use_exit(pg, cdp, '[進出 1 廳→大廳]', '回大廳', 'xs_nanyang')
    if not s: return False
    R.check('[進出] 回到大廳那組門前面（hallOut (2.2, −5.2) 0.6 m 內）、推得動', math.hypot(s['x'] - 2.2, s['z'] + 5.2) < 0.6 and await pushable(pg, cdp) >= 0.3, J(s))
    s = await use_exit(pg, cdp, '[進出 大廳→新生南路]', '出去', 'xinsheng')
    if not s: return False
    out = await pg.evaluate("NY3.streetOut()")
    R.check('[進出] 回到新生南路戲院門口外面（NY3.streetOut %s 0.6 m 內）、推得動' % J(out), math.hypot(s['x'] - out['x'], s['z'] - out['z']) < 0.6 and await pushable(pg, cdp) >= 0.3, J(s))
    await shot(pg, 'door_03_street_out')
    return True


async def sit_all(pg, cdp, tag, floor_js=None):
    seats = await pg.evaluate(SEATS); R.note('%s 座位：%s' % (tag, J(seats)))
    for k, s in enumerate(seats):
        t = '%s #%d%s' % (tag, k + 1, (' 第 %d 排' % s['row']) if s['row'] else '')
        occ = await pg.evaluate("(([x,z])=>(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.35))", [s['sx'], s['sz']])
        if occ: R.note('%s 有人坐：遊戲不給坐，跳過（不算 FAIL）' % t); continue
        tgt = s['ap'] or [s['x'], s['z']]; fb0 = (await st(pg))['fb']
        await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.3, '%s（seatApproach）' % t, max_s=300)
        await pg.wait_for_timeout(800); b = await st(pg)
        if not b['interact'].startswith(s['label']):
            for _ in range(6):
                await pg.wait_for_timeout(500); b = await st(pg)
                if b['interact'].startswith(s['label']): break
        if not R.check('%s 走到旁邊，互動按鈕是「%s」' % (t, s['label']), b['interact'].startswith(s['label']), J({k_: b[k_] for k_ in ('x', 'z', 'interact', 'stand')})):
            await shot(pg, 'seat_nobtn_%s_%d' % (tag.strip('[]').replace(' ', '_'), k + 1), judge_black=False); continue
        await L.tap(pg, cdp, '#interact'); ok = False
        for _ in range(30):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("!!GAME.E.player.seat"): ok = True; break
        await pg.wait_for_timeout(1500)
        p = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position, s=P.seat; return {x:+o.x.toFixed(3),z:+o.z.toFixed(3),y:+o.y.toFixed(3), sx:s?+s.x.toFixed(3):null, sz:s?+s.z.toFixed(3):null, sy:s&&s.y!=null?+(+s.y).toFixed(3):null}; })()")
        d = math.hypot(p['x'] - s['sx'], p['z'] - s['sz'])
        R.check('%s 坐下了（player.seat）' % t, ok, J(p))
        if ok:
            fy = s['sy'] if s['sy'] is not None else 0.0
            R.check('%s 坐下的位置離座位 %.3f m（≤0.15）、人的高度 %.3f＝那一排地板 %.3f（±0.06）' % (t, d, p['y'], fy), d <= 0.15 and abs(p['y'] - fy) <= 0.06, J(p))
            await shot(pg, 'seat_%s_%d' % (tag.strip('[]').replace(' ', '_'), k + 1))
        c = await st(pg)
        if c['choices']:
            kk = next((i for i, x in enumerate(c['choices']) if x.startswith('起身') or x.startswith('站起')), len(c['choices']) - 1)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (kk + 1)); await pg.wait_for_timeout(1500)
        lab = (await st(pg))['interact']
        if lab.startswith('起身') or lab.startswith('站起'): await L.tap(pg, cdp, '#interact')
        await pg.wait_for_timeout(1500)
        for _ in range(10):
            c = await st(pg)
            if not c['seat'] and not c['busy']: break
            if c['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        mv = await pushable(pg, cdp); c = await st(pg)
        R.check('%s 起身：不是坐著、站得住、推得動 ≥0.3 m、沒有被放到目的地' % t, not c['seat'] and c['stand'] and mv >= 0.3 and c['fb'] == fb0, J({'moved': mv, 'x': c['x'], 'z': c['z'], 'stand': c['stand'], 'fb': c['fb'] - fb0}))


async def sampler(pg, stop):
    while not stop.is_set():
        try:
            s = await st(pg); SAMPLES.append(s)
        except Exception: pass
        await asyncio.sleep(0.3)


async def walk_logged(pg, cdp, tx, tz, near, label, max_s=180):
    SAMPLES.clear(); ev = asyncio.Event(); task = asyncio.create_task(sampler(pg, ev))
    try: ok = await L.go_to(pg, cdp, R, tx, tz, near, label, max_s=max_s)
    finally:
        ev.set(); await task
    return ok, list(SAMPLES)


# PC 11-05（NANYANG_v1 r1）：走過頭、停在範圍外、坐到隔壁排——改用共用的（等人停下來、先看最近的按鈕是不是這一張）
use_exit = D.use_exit


async def sit_all(pg, cdp, tag, before_each=None):
    return await D.sit_all(pg, cdp, tag, tag.strip('[]').replace(' ', '_'), before_each=before_each)


# ---------------- NANYANG_v3（11-10）新增 ----------------
LOBBY_AT = (0.0, 5.2, math.pi)    # 配置 lobby.enterAt
HALL_AT = (3.5, 6.4, math.pi)     # 配置 hall.enterAt


async def time_guard(pg, cdp, zone, at, tag, limit=20.5):
    """人要在 zone、時間在營業中而且還早（09:36～limit）；不是＝印出當時在哪，【前置／捷徑】讀檔回 zone 14:00（r1 第 5 項：走路太久到 24:00 被打烊送出去）"""
    s = await st(pg); h = s['hour'] % 24
    if s['zone'] == zone and 9.6 <= h < limit: return s, False
    R.note('%s 人在 %s (%s, %s) 第 %s 層、%s 點、坐著＝%s、對話＝%s（要在 %s、%s 點以前）' % (tag, s['zone'], s['x'], s['z'], s['lv'], s['hour'], s['seat'], s['dlg'], zone, limit))
    R.setup('%s 時間走太多／不在 %s：讀檔回 %s %s 14:00 (%s, %s)' % (tag, zone, zone, DAY, at[0], at[1]))
    s = await D.load_zone(pg, cdp, zone, DAY, 14.0, at[0], at[1], at[2], wait=8000)
    return s, True


def guard_each(zone, at, tag):
    async def f(k, seat):
        await time_guard(pg_ref[0], pg_ref[1], zone, at, '%s #%d 之前' % (tag, k + 1))
    return f


pg_ref = [None, None]


async def bench_precheck(pg):
    """七：大廳四張長椅＝按鈕範圍 1.0、seatApproach (2.95, z)（fe4d893ac nanyang3d.js、game3d.js seatApproach 前 0.8 m）"""
    b = await pg.evaluate("""(()=>GAME.E.interactables.filter(i=>i.seat&&i.nanyang==='bench').map(i=>{ const ap=GAME.seatApproach(i.seat);
      return {x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius, ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null}; }))()""")
    R.note('[大廳 長椅] 按鈕＋走近點：%s' % J(b))
    R.check('[大廳 長椅] 四張都在（nanyang:\'bench\'）', len(b) == 4, J(b))
    for k, q in enumerate(b):
        R.check('[大廳 長椅] #%d（%s, %s）按鈕範圍 1.0、GAME.seatApproach＝(2.95, %s)（±0.06）' % (k + 1, q['x'], q['z'], q['z']),
                abs((q['r'] or 0) - 1.0) < 0.01 and bool(q['ap']) and abs(q['ap'][0] - 2.95) <= 0.06 and abs(q['ap'][1] - q['z']) <= 0.06, J(q))


TOAST_HOOK = "(()=>{ window.__ccToast=[]; const t=document.getElementById('toast'); if(t&&!window.__ccToastObs){ window.__ccToastObs=new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x) window.__ccToast.push(x); }); window.__ccToastObs.observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); } return true; })()"
MV_HOOK = r"""(()=>{ window.__ccMvSay=[]; window.__ccMvHL=[];
  if(!window.__ccMvHook){ const s0=GAME.say; GAME.say=function(w,t){ try{ window.__ccMvSay.push({t:String(t),h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return s0.apply(this,arguments); };
    if(typeof NY3!=='undefined'&&NY3.houseLights){ const h0=NY3.houseLights; NY3.houseLights=function(on){ const r=h0.apply(this,arguments); try{ window.__ccMvHL.push({on:!!on,r:!!r,h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return r; }; }
    window.__ccMvHook=true; } return {ny3:typeof NY3!=='undefined'&&!!NY3.houseLights, aa614:typeof AA614!=='undefined'&&!!AA614.watch}; })()"""
MV_INFO = r"""(()=>{ const G=GAME.G, F=G.flags||{}, z=GAME.E.zone; const t=document.getElementById('dlgText'), f=document.getElementById('fade');
  return {day:G.day|0, hour:+(+G.hour).toFixed(3), money:G.money, ticket:F.NY_TICKET===undefined?null:F.NY_TICKET, watched:F.NY_WATCHED===undefined?null:F.NY_WATCHED,
    has:typeof NYS!=='undefined'?NYS.hasTicket(G):null, dlgText:(GAME.D&&GAME.D.active)?String(GAME.D.full||(t&&t.textContent)||'').trim():'', fade:!!(f&&f.classList.contains('on')),
    house:(z&&z.house)?z.house.map(l=>+l.intensity.toFixed(2)):null, seatKind:GAME.E.player.seat?(GAME.E.player.seat.kind||null):null,
    say:(window.__ccMvSay||[]).slice(), hl:(window.__ccMvHL||[]).slice()}; })()"""


async def tap_choice(pg, cdp, prefix):
    """點選單上文字開頭是 prefix 的那一顆（#choices 裡也可能有說明的 div：用它在 children 裡的位置）"""
    n = await pg.evaluate("""(p=>{ const box=document.getElementById('choices'); if(!box||box.classList.contains('hide')) return -1; const ch=[...box.children];
      for(let i=0;i<ch.length;i++){ const e=ch[i]; if(e.tagName==='BUTTON'&&e.offsetParent!==null&&(e.innerText||'').trim().startsWith(p)) return i+1; } return 0; })""", prefix)
    if n > 0: await L.tap(pg, cdp, '#choices > :nth-child(%d)' % n)
    return n


async def no_movie_check(pg, tag):
    i = await pg.evaluate(MV_INFO); wl = await pg.evaluate("(typeof AA614!=='undefined'&&AA614.L&&AA614.L.watch)||[]")
    played = [q for q in i['say'] if q['t'] in wl]; off = [q for q in i['hl'] if not q['on']]
    R.check('%s 沒有票：坐下不演電影（沒有 AA614 旁白、場燈沒關、NY_WATCHED 不是今天）' % tag, not played and not off and i['watched'] != i['day'], J({'played': played, 'lightsOff': off, 'watched': i['watched'], 'day': i['day']}))


async def part_movie(pg, cdp):
    """九、十：買票（大廳櫃檯、店員）→ 1 廳坐下看電影"""
    R.setup('[買票] 讀檔南洋戲院大廳 %s（六）14:00、入口裡面 (%s, %s)' % (DAY, LOBBY_AT[0], LOBBY_AT[1]))
    s = await D.load_zone(pg, cdp, 'xs_nanyang', DAY, 14.0, LOBBY_AT[0], LOBBY_AT[1], LOBBY_AT[2], wait=8000)
    if not R.check('[買票] 讀到大廳（xs_nanyang）', s['zone'] == 'xs_nanyang', J(s)): return
    hk = await pg.evaluate(MV_HOOK); R.note('[看電影] 掛勾：%s' % J(hk))
    # 店員
    ck = await pg.evaluate("""(()=>{ const G=GAME.G, E=GAME.E; const at=typeof NYS!=='undefined'&&NYS.clerkAt?NYS.clerkAt(G):null; const c=(E.npcs||[]).filter(n=>n&&n.nyClerk);
      const pop=NANYANG_LAYOUT.lobby.interact.find(q=>q.kind==='popcorn');
      return {exp:at, open:typeof NYS!=='undefined'?NYS.isOpen(G):null, alisonDay:typeof NYS!=='undefined'?NYS.alisonDay(G):null, n:c.length,
        at:c.map(n=>[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]), inScene:c.map(n=>!!n.obj.parent), behind:at?!E.canStand(at.x,at.z,0.3,0):null, pop:pop?[pop.x,pop.z]:null,
        btn:E.interactables.filter(i=>i.nyTicket).map(i=>({label:i.label,x:i.x,z:i.z,r:i.radius,hidden:!!i.hidden,where:i.nyTicket}))}; })()""")
    R.note('[買票] 店員、按鈕：%s' % J(ck))
    if not R.check('[買票] 這一版有 NYS（src/nanyang_sys3d.js）', ck['open'] is not None, J(ck)): return
    R.check('[買票] 營業時間大廳櫃檯後面有一個店員（NYS.clerkAt %s；Alison 那兩天＝%s）、在場景裡、玩家站不到她的位置（櫃檯後面）' % (J(ck['exp']), ck['alisonDay']),
            ck['n'] == 1 and bool(ck['exp']) and math.hypot(ck['at'][0][0] - ck['exp']['x'], ck['at'][0][1] - ck['exp']['z']) < 0.05 and all(ck['inScene']) and ck['behind'] is True, J(ck))
    btn = next((b for b in ck['btn'] if b['where'] == 'lobby'), None)
    if not R.check('[買票] 大廳有「買票」（櫃檯前 popcorn %s）、還沒藏起來' % J(ck['pop']), bool(btn) and btn['label'] == '買票' and not btn['hidden'], J(ck['btn'])): return
    # 走到櫃檯前
    await L.go_to(pg, cdp, R, btn['x'], btn['z'], 0.35, '[買票] 櫃檯前', max_s=180); b = await D.settle(pg)
    if not b['interact'].startswith('買票'):
        await L.go_to(pg, cdp, R, btn['x'], btn['z'], 0.2, '[買票] 櫃檯前（再靠近）', max_s=60); b = await D.settle(pg)
    if not R.check('[買票] 走到櫃檯前，互動按鈕是「買票」', b['interact'].startswith('買票'), J({k: b[k] for k in ('x', 'z', 'interact', 'stand', 'hour')})):
        await shot(pg, 'ticket_nobtn', judge_black=False); return
    i0 = await pg.evaluate(MV_INFO); await pg.evaluate(TOAST_HOOK)
    await L.tap(pg, cdp, '#interact')
    c = None
    for _ in range(20):
        await pg.wait_for_timeout(400); c = await st(pg)
        if c['choices']: break
    R.note('[買票] 按下去的選單：%s（買之前 %s 元、票 %s）' % (J(c and c['choices']), i0['money'], i0['ticket']))
    if not R.check('[買票] 跳出選單，有「買票　150 元」和「不用了」', bool(c and c['choices']) and any(x.startswith('買票') and '150' in x for x in c['choices']) and any(x.startswith('不用了') for x in c['choices']), J(c)):
        await shot(pg, 'ticket_nomenu', judge_black=False); return
    await shot(pg, 'ticket_menu', judge_black=False)
    await tap_choice(pg, cdp, '買票'); await pg.wait_for_timeout(2000)
    for _ in range(10):
        c = await st(pg)
        if not c['busy'] and not c['dlg'] and not c['choices']: break
        if c['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    i1 = await pg.evaluate(MV_INFO); toasts = await pg.evaluate("window.__ccToast||[]")
    R.note('[買票] 買了以後：%s 元、票 %s、hasTicket %s、toast %s、按鈕 %s' % (i1['money'], i1['ticket'], i1['has'], J(toasts), J(c['interact'])))
    R.check('[買票] 扣了 150 元（%s → %s）、toast「💸 150 元」' % (i0['money'], i1['money']), i0['money'] - i1['money'] == 150 and any('150' in t for t in toasts), J({'before': i0['money'], 'after': i1['money'], 'toasts': toasts}))
    R.check('[買票] 手上有今天的票（G.flags.NY_TICKET＝今天 %s、NYS.hasTicket）' % i1['day'], i1['ticket'] == i1['day'] and i1['has'] is True, J(i1))
    R.check('[買票] 買過以後「買票」藏起來（站在原地，按鈕不是「買票」）', not c['interact'].startswith('買票'), J(c['interact']))
    R.check('[買票] 買票沒有出台詞（稿裡沒有；GM.say 沒被叫到）', not i1['say'], J(i1['say']))
    # 進 1 廳
    s = await D.use_exit(pg, cdp, '[看電影 大廳→1 廳]', '進 1 廳', 'xs_nanyang_hall')
    if not s:
        R.note('[看電影] 找不到／進不去 1 廳時人在：%s' % J(await st(pg))); return
    seats = sorted(await pg.evaluate(SEATS), key=lambda q: q['row'] or 99)
    free = None
    for q in seats:
        occ = await pg.evaluate("(([x,z])=>(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.35))", [q['sx'], q['sz']])
        if not occ: free = q; break
    if not R.check('[看電影] 1 廳有空的「坐下看電影」', bool(free) and free['label'].startswith('坐下看電影'), J(seats)): return
    t = '[看電影] 第 %s 排（%s, %s）' % (free['row'], free['sx'], free['sz'])
    ap = free['ap'] or [free['x'], free['z']]
    await L.go_to(pg, cdp, R, ap[0], ap[1], 0.3, '%s 走近點' % t, max_s=180); b = await D.settle(pg)
    if not b['interact'].startswith('坐下看電影'):
        await L.tap_ground(pg, cdp, free['sx'], free['sz']); b = await D.settle(pg, ms=800, max_s=15)
    ni = await pg.evaluate(D.NEAR_IT)
    if not R.check('%s 走到旁邊，互動按鈕是「坐下看電影」' % t, b['interact'].startswith('坐下看電影'), J({'at': [b['x'], b['z']], 'interact': b['interact'], 'nearest': ni})):
        await shot(pg, 'movie_nobtn', judge_black=False); return
    i2 = await pg.evaluate(MV_INFO); h0 = i2['hour'] % 24; dur = max(0.5, min(4.0, 24 - h0))
    wl = await pg.evaluate("(typeof AA614!=='undefined'&&AA614.L&&AA614.L.watch)||[]")
    await pg.evaluate("(()=>{ window.__ccMvSay=[]; window.__ccMvHL=[]; })()")
    R.note('%s 坐下前：%s 點、票 %s、看過 %s、場燈 %s；照 AA614.watchHours 應該過 %.2f 小時' % (t, i2['hour'], i2['ticket'], i2['watched'], J(i2['house']), dur))
    await L.tap(pg, cdp, '#interact')
    sat = False; dark = None; line = None; menu = None; seen = []; t0 = time.time(); shot_done = False
    while time.time() - t0 < 120:
        c = await st(pg); i = await pg.evaluate(MV_INFO)
        if c['seat']: sat = True
        if i['dlgText']:
            seen.append(i['dlgText'])
            if i['dlgText'] in wl and line is None:
                line = i['dlgText']; dark = i['house']
                if not shot_done:
                    await pg.wait_for_timeout(600); await shot(pg, 'movie_watch_line', judge_black=False); shot_done = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if c['choices'] and c['seat']: menu = c['choices']; break
        if not c['seat'] and sat and not c['busy']: break
        await pg.wait_for_timeout(400)
    i3 = await pg.evaluate(MV_INFO)
    R.note('%s 看電影：對話 %s；GAME.say %s；houseLights %s；選單 %s；看完 %s' % (t, J(seen), J(i3['say']), J(i3['hl']), J(menu), J({k: i3[k] for k in ('hour', 'ticket', 'watched', 'house', 'seatKind')})))
    R.check('%s 坐下了（player.seat、kind cinema）' % t, sat and i3['seatKind'] == 'cinema', J({'sat': sat, 'kind': i3['seatKind']}))
    R.check('%s 演出 AA614.L.watch 三句裡的一句（AA_615）' % t, bool(line), J({'seen': seen, 'watch': wl}))
    hl = i3['hl']
    R.check('%s 開演關場燈、演完再開（NY3.houseLights false → true，都有作用）' % t, len(hl) >= 2 and hl[0]['on'] is False and hl[0]['r'] and hl[-1]['on'] is True and hl[-1]['r'], J(hl))
    R.check('%s 旁白那時候場燈全關（1 廳 z.house 強度 0）' % t, bool(dark) and all(v == 0 for v in dark), J(dark))
    sl = next((q for q in i3['say'] if q['t'] in wl), None)
    adv = (sl['h'] - i2['hour']) if sl else None
    R.check('%s 時間過去 %.2f 小時（AA614.watchHours＝min(4, 24−%.2f)；實際 %s，±0.3）' % (t, dur, h0, adv if adv is None else round(adv, 2)), adv is not None and abs(adv - dur) <= 0.3, J({'h0': i2['hour'], 'line': sl}))
    R.check('%s 看完：G.flags.NY_WATCHED＝今天、場燈亮回來、還坐著出座位選單' % t, i3['watched'] == i3['day'] and bool(i3['house']) and all(v > 0 for v in i3['house']) and bool(menu), J({'watched': i3['watched'], 'day': i3['day'], 'house': i3['house'], 'menu': menu}))
    # 起身
    if menu:
        n = await tap_choice(pg, cdp, '起身')
        if n <= 0: R.note('%s 選單沒有「起身」：%s' % (t, J(menu)))
        for _ in range(20):
            c = await st(pg)
            if not c['seat'] and not c['busy']: break
            if c['dlg']: await L.tap(pg, cdp, '#dlg')
            elif c['choices']: await tap_choice(pg, cdp, '起身')
            await pg.wait_for_timeout(500)
    mv = await pushable(pg, cdp); c = await st(pg)
    R.check('%s 起身：不是坐著、站得住、推得動 ≥0.3 m' % t, not c['seat'] and c['stand'] and mv >= 0.3, J({'moved': mv, 'x': c['x'], 'z': c['z'], 'stand': c['stand']}))
    # 同一天再坐一次：一張票看一場
    await L.go_to(pg, cdp, R, ap[0], ap[1], 0.3, '%s 再走回來' % t, max_s=120); b = await D.settle(pg)
    if not b['interact'].startswith('坐下看電影'):
        R.note('%s 再坐一次：按鈕不是「坐下看電影」（%s），不測' % (t, J(b['interact']))); return
    h1 = (await pg.evaluate(MV_INFO))['hour']; await pg.evaluate("(()=>{ window.__ccMvSay=[]; window.__ccMvHL=[]; })()")
    await L.tap(pg, cdp, '#interact'); menu2 = None; t0 = time.time()
    while time.time() - t0 < 40:
        c = await st(pg)
        if c['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if c['choices'] and c['seat']: menu2 = c['choices']; break
        await pg.wait_for_timeout(400)
    i4 = await pg.evaluate(MV_INFO); played = [q for q in i4['say'] if q['t'] in wl]
    R.check('%s 同一天再坐一次：不再演（沒有旁白、場燈沒關、時間沒有跳 >0.5 小時）' % t, bool(menu2) and not played and not [q for q in i4['hl'] if not q['on']] and i4['hour'] - h1 < 0.5,
            J({'menu': menu2, 'played': played, 'hl': i4['hl'], 'h': [h1, i4['hour']]}))
    if menu2:
        await tap_choice(pg, cdp, '起身'); await pg.wait_for_timeout(1500)


async def part_art(pg, cdp):
    """十一：給使用者看（ART，D120）：大廳、1 廳各一張乾淨截圖（14:00、藏 HUD、藏玩家）"""
    lay = await pg.evaluate("(()=>({lobby:NANYANG_LAYOUT.lobby.camRef, hall:NANYANG_LAYOUT.hall.camRef||null}))()")
    hall_cam = lay['hall'] or {'eye': [3.5, 1.6, 7.4], 'look': [0.0, 1.4, -7.75], 'lens': 24}
    for zone, at, cam, nm in [('xs_nanyang', LOBBY_AT, lay['lobby'], 'lobby'), ('xs_nanyang_hall', HALL_AT, hall_cam, 'hall')]:
        R.setup('[ART] 讀檔 %s %s 14:00' % (zone, DAY))
        s = await D.load_zone(pg, cdp, zone, DAY, 14.0, at[0], at[1], at[2], wait=10000)
        for _ in range(10):
            if not s['dlg'] and not s['choices']: break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500); s = await st(pg)
        fade = await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!(f&&f.classList.contains('on')); })()")
        if not R.check('[ART] 讀到 %s、畫面乾淨（沒有對話框、選單、黑幕）' % zone, s['zone'] == zone and not s['dlg'] and not s['choices'] and not fade, J({'s': s, 'fade': fade})): continue
        await D.user_shot(pg, cdp, 'ART_nanyang_%s' % nm, cam)


async def slope_tap(pg, cdp):
    """點斜地板：螢幕上那一點的地板（照 floorY 投影）點下去，遊戲會走到哪裡（E.screenToFloor；1 廳沒有 walkMeshes＝打 y 0 的平面）"""
    r = await pg.evaluate("""(()=>{ const E=GAME.E, H=NANYANG_LAYOUT.hall, ax=(H.aisleR.x0+H.aisleR.x1)/2; const out={walkMeshes:(E.zone.walkMeshes||[]).length, rows:[]};
      for(const z of [4.3, 2.0, 0.0, -2.0, -3.5, -4.6]){ const y=H.floorY(z); const v=new THREE.Vector3(ax,y,z).project(E.camera); if(v.z>1) continue; const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight; const h=E.screenToFloor(sx,sy);
        out.rows.push({tap:[+ax.toFixed(2),z,+y.toFixed(2)], lands:h?[+h.x.toFixed(2),+h.z.toFixed(2),+h.y.toFixed(2)]:null, off:h?+Math.hypot(h.x-ax,h.z-z).toFixed(2):null}); }
      return out; })()""")
    bad = [x for x in r['rows'] if x['off'] is None or x['off'] > 0.5]
    R.note('[斜地板 點地面] zone.walkMeshes＝%d；點斜地板（右邊走道，鏡頭在門口）：%s' % (r['walkMeshes'], J(r['rows'])))
    R.check('[斜地板 點地面] 點斜地板上的一點，遊戲走過去的地方差 ≤0.5 m（E.screenToFloor）', not bad, J(bad))


async def part_slope(pg, cdp):
    await slope_tap(pg, cdp)
    fy = await pg.evaluate("(()=>{ const H=NANYANG_LAYOUT.hall; return {s:H.slope, ax:H.aisleR}; })()")
    R.note('[斜地板] 配置 slope %s、右邊走道 %s' % (J(fy['s']), J(fy['ax'])))
    ax = round((fy['ax']['x0'] + fy['ax']['x1']) / 2, 2)
    legs = [(ax, -4.6, '門口 → 第一排前面（下坡）'), (3.5, 6.2, '第一排前面 → 門口（上坡）')]
    for tx, tz, nm in legs:
        fb0 = (await st(pg))['fb']
        ok, smp = await walk_logged(pg, cdp, tx, tz, 0.35, '[斜地板] ' + nm, max_s=240); await D.settle(pg)
        on = [s for s in smp if s['zone'] == 'xs_nanyang_hall']
        errs = await pg.evaluate("(S=>S.map(s=>{ const f=NANYANG_LAYOUT.hall.floorY(s.z); return [s.z, s.y, +f.toFixed(3), +(s.y-f).toFixed(3), s.stand]; }))", [{'z': s['z'], 'y': s['y'], 'stand': s['stand']} for s in on])
        worst = max(errs, key=lambda e: abs(e[3])) if errs else None
        notstand = [e for e in errs if e[4] is False]
        e = await st(pg)
        R.note('[斜地板] %s：%d 點；高度和 floorY 差最大 %s；z 範圍 %s～%s' % (nm, len(errs), J(worst), min((x[0] for x in errs), default=None), max((x[0] for x in errs), default=None)))
        R.check('[斜地板] %s：走到了（%.2f, %.2f）、沒有被放到目的地' % (nm, e['x'], e['z']), ok and e['fb'] == fb0, J(e))
        R.check('[斜地板] %s：一路的高度和配置 floorY(z) 差 ≤0.06 m、每一點都站得住' % nm, bool(errs) and abs(worst[3]) <= 0.06 and not notstand, J({'worst': worst, 'notStand': notstand[:5]}))
        await shot(pg, 'slope_%d' % (legs.index((tx, tz, nm)) + 1))


async def part_arcade(pg, cdp):
    # ① 導航取樣（README：牆在 x −13.2；牆裡 x −13.6、−15.5 站不住、人行道 x −12.4 站得住）——先讀檔到新生南路（雲端 11-05 冒煙：原本在 1 廳取樣＝取錯區域）
    R.setup('[騎樓] 讀檔新生南路 %s 14:00（導航取樣）' % DAY)
    s0 = await load_street(pg, cdp, -12.7, 0.0)
    if not R.check('[騎樓] 讀到新生南路（xinsheng）', s0['zone'] == 'xinsheng', J(s0)): return
    # 街的兩頭（z ±68）是區域的邊：和 tests/xinsheng_unit.js 18 一樣不取最後 1.5 m（−66.5～−40.6、48～66.5）
    grid = await pg.evaluate("""(()=>{ const E=GAME.E, out={wallIn:[], sideOut:[], zone:GAME.G.zone};
      for(const [a,b] of [[-66.5,-40.6],[48,66.5]]) for(let z=a; z<=b+1e-6; z+=1){ for(const x of [-13.6,-15.5]) if(E.canStand(x,z,0.3,0)) out.wallIn.push([x,z]); if(!E.canStand(-12.4,z,0.3,0)) out.sideOut.push([-12.4,z]); }
      out.n=Math.floor(66.5-40.6)+1+Math.floor(66.5-48)+1; return out; })()""")
    R.check('[騎樓] 沒有騎樓的兩段（z −66.5～−40.6、48～66.5，每 1 m %d 處；%s）：牆裡 x −13.6、−15.5 都站不住' % (grid['n'], grid['zone']), not grid['wallIn'], J(grid['wallIn'][:10]))
    R.check('[騎樓] 同兩段牆外的人行道 x −12.4 都站得住', not grid['sideOut'], J(grid['sideOut'][:10]))
    # ② 照玩家：騎樓兩端往公寓那邊點地走
    for (sx, sz, tx, tz, nm) in [(-14.6, 45.5, -14.6, 56.0, '北端（往 z 47.4～68）'), (-14.6, -38.5, -14.6, -50.0, '南端（往 z −68～−40）')]:
        R.setup('[騎樓] 讀檔新生南路騎樓 (%s, %s)（%s）' % (sx, sz, nm))
        s = await load_street(pg, cdp, sx, sz, yaw=0.0 if tz > sz else math.pi)
        R.note('[騎樓] 起點 %s' % J(s))
        ok, smp = await walk_logged(pg, cdp, tx, tz, 0.4, '[騎樓] %s 點牆裡 (%s, %s)' % (nm, tx, tz), max_s=60)
        seg = [s_ for s_ in smp if s_['zone'] == 'xinsheng' and ((47.4 + 0.3 < s_['z'] < 68) or (-68 < s_['z'] < -40 - 0.3))]
        bad = [[s_['x'], s_['z']] for s_ in seg if s_['x'] < -13.2 - 0.05]
        e = await st(pg)
        R.note('[騎樓] %s：%d 點、在那一段裡 %d 點；最後在 (%.2f, %.2f)；到了目標＝%s' % (nm, len(smp), len(seg), e['x'], e['z'], ok))
        R.check('[騎樓] %s：照玩家往公寓點地走，人沒有進到牆裡（那一段裡 x 都 ≥ −13.2）' % nm, not bad and not ok, J({'inWall': bad[:8], 'end': [e['x'], e['z']], 'reached': ok}))
        await shot(pg, 'arcade_%s' % ('north' if tz > sz else 'south'))


async def part_closed(pg, cdp):
    out = await pg.evaluate("NY3.streetOut()")
    R.setup('[營業時間外] 讀檔新生南路 %s 08:00（開門 09:30 以前）、戲院門口南邊騎樓 4 m' % DAY)
    await load_street(pg, cdp, out['x'], out['z'] - 4, h=8.0, yaw=0.0)
    door = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='xs_nanyang'); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}:null; })()")
    if not R.check('[營業時間外] 店門還在（「進南洋戲院」）', bool(door), J(door)): return
    exp = await pg.evaluate("(()=>PLACES.closedText('xs_nanyang',GAME.G.hour,GAME.G.day))()")
    await L.go_to(pg, cdp, R, door['x'], door['z'], 0.4, '[營業時間外] 店門', max_s=120)
    await pg.wait_for_timeout(600); s = await st(pg)
    if not R.check('[營業時間外] 走到店門，互動按鈕是「進南洋戲院」', s['interact'].startswith('進南洋戲院'), J(s)): return
    await pg.evaluate("(()=>{ window.__ccToast=[]; const t=document.getElementById('toast'); if(t){ new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x) window.__ccToast.push(x); }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); } })()")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    s = await st(pg); toasts = await pg.evaluate("window.__ccToast||[]")
    R.note('[營業時間外] 按下去：%s；toast %s；PLACES.closedText＝%s' % (J({k: s[k] for k in ('zone', 'hour', 'x', 'z')}), J(toasts), J(exp)))
    R.check('[營業時間外] 08:00 按店門：沒有進去（還在 xinsheng）', s['zone'] == 'xinsheng', J(s))
    R.check('[營業時間外] 跳出「%s」（PLACES.closedText）' % exp, bool(exp) and any(exp in t or t in exp for t in toasts), J(toasts))
    await shot(pg, 'closed_0800')


NY_CLOSE = '（大廳的燈全亮了。工作人員站在門口說：「今天的場次都結束了，謝謝光臨。」你走了出去。）'   # AA_695 第 4 節（claude/magical-albattani-bk7b4n 491357209）
if os.environ.get('CLOSE') == 'aa700': NY_CLOSE = '我們今天要打烊了。'   # AA_700（4f60052c8，CLOSE-UNIFY-1105）取代 AA_695 第 4 節：店員一句、走出店門


async def part_xsclose(pg, cdp):
    """XS_CLOSE（BB-C 05:09，2378a8957 起）：1 廳、大廳待到 24:00 營業時間外＝AA_695 第 4 節那一句、人到新生南路戲院門口外"""
    out = await pg.evaluate("NY3.streetOut()")
    for zone, x, z in (('xs_nanyang_hall', 3.5, 6.0), ('xs_nanyang', 0.0, 4.0)):
        R.setup('[散場] 讀檔 %s %s 23:58（營業到 24:00）' % (zone, DAY))
        d = await pg.evaluate("STORY.dayOfKey('%s')" % DAY)
        await L.load_state(pg, {'zone': zone, 'hour': 23.97, 'day': d, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': math.pi, 'lv': 0}}, quiet_events=True, quiet_phone=True)
        await pg.evaluate("(()=>{ window.__ccSay=[]; if(!window.__ccSayHook){ const s0=GAME.say; GAME.say=function(w,t){ try{ window.__ccSay.push(String(t)); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayHook=true; } })()")
        t0 = time.time(); e = None
        while time.time() - t0 < 150:
            s0 = await st(pg)
            if s0['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            if s0['zone'] == 'xinsheng' and not s0['busy']: e = s0; break
            await pg.wait_for_timeout(500)
        Ls = await pg.evaluate("window.__ccSay||[]")
        R.note('[散場 %s] 台詞 %s；最後 %s' % (zone, J(Ls), J(e)))
        R.check('[散場 %s] 24:00 出「%s」（AA_695 第 4 節）、到新生南路戲院門口外（NY3.streetOut 0.6 m 內）、站得住' % (zone, NY_CLOSE), NY_CLOSE in Ls and bool(e) and math.hypot(e['x'] - out['x'], e['z'] - out['z']) < 0.6 and e['stand'], J({'lines': Ls, 'end': e}))
        if e: R.check('[散場 %s] 出來以後推得動' % zone, await pushable(pg, cdp) >= 0.3, '')
        await shot(pg, 'xsclose_%s' % zone)


async def part_shots(pg, cdp):
    lay = await pg.evaluate("(()=>({lobby:NANYANG_LAYOUT.lobby.camRef, hall:NANYANG_LAYOUT.hall.camRef||null}))()")
    hall_cam = lay['hall'] or {'eye': [3.5, 1.6, 7.4], 'look': [0.0, 1.4, -7.75], 'lens': 24}
    if not lay['hall']: R.note('[截圖] 1 廳配置沒有 camRef：用門口往銀幕 %s' % J(hall_cam))
    d = await pg.evaluate("STORY.dayOfKey('%s')" % DAY)
    await pg.set_viewport_size({'width': 1280, 'height': 720})   # 給使用者看：16:9（24 mm＝水平 73.7°），和同弦 refcam 一樣
    for zone, cam, nm in [('xs_nanyang', lay['lobby'], 'lobby'), ('xs_nanyang_hall', hall_cam, 'hall')]:
        for h, hn in [(14.0, 'day'), (21.0, 'night')]:
            R.setup('[截圖] 讀檔 %s %s %02d:00' % (zone, DAY, int(h)))
            await L.load_state(pg, {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}, quiet_events=True, quiet_phone=True)
            await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            z = (await st(pg))['zone']
            if not R.check('[截圖] 讀到 %s' % zone, z == zone, z): continue
            glb = await pg.evaluate("(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.visible) n++; }); return n; })()")
            await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")   # 給使用者看的是房間：人站在門口會擋住鏡頭（雲端 11-05 1 廳那張）
            await pg.evaluate(HUD + '(false)'); c = await pg.evaluate(CAM, cam); await pg.wait_for_timeout(600); await pg.evaluate("GAME.E.render()")
            m = await shot(pg, 'user_%s_%s' % (nm, hn))
            R.note('[截圖] %s %s：鏡頭 %s、看得到的網格 %d、亮度 %s' % (nm, hn, J(c), glb, J(m)))
            await pg.evaluate(UNCAM); await pg.evaluate(HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC NANYANG_v1／v3（南洋戲院：擋玩五項＋買票、看電影＋給使用者的截圖）：PARTS=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg_ref[0], pg_ref[1] = pg, cdp
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        has = await pg.evaluate("typeof NY3!=='undefined'&&!!Z3.ZONES.xs_nanyang&&!!Z3.ZONES.xs_nanyang_hall")
        if not R.check('這一版有南洋戲院（NY3、Z3.ZONES.xs_nanyang／xs_nanyang_hall）', has, ''): await b.close(); sys.exit(1)
        if 'door' in PARTS or 'seats' in PARTS or 'slope' in PARTS:
            out = await pg.evaluate("NY3.streetOut()")
            R.setup('[進出] 讀檔新生南路 %s（六）14:00、戲院門口南邊騎樓 4 m（%s, %s）' % (DAY, out['x'], out['z'] - 4))
            await load_street(pg, cdp, out['x'], out['z'] - 4, yaw=0.0)
            okd = await part_door(pg, cdp) if 'door' in PARTS else False
            if ('seats' in PARTS or 'slope' in PARTS):
                if not okd:
                    R.setup('[座位] 進出沒走完／沒跑：【捷徑】直接讀檔進大廳 14:00 入口裡面')
                    await D.load_zone(pg, cdp, 'xs_nanyang', DAY, 14.0, LOBBY_AT[0], LOBBY_AT[1], LOBBY_AT[2], wait=8000)
                else:
                    s0 = await st(pg)
                    if s0['zone'] != 'xinsheng' or not (9.6 <= s0['hour'] % 24 < 17.0):   # r1：進出走完已經 19:00，座位走到一半就 24:00 打烊
                        R.note('[座位] 進出走完：人在 %s (%s, %s)、%s 點' % (s0['zone'], s0['x'], s0['z'], s0['hour']))
                        R.setup('[座位] 時間走太多：讀檔回新生南路 %s 14:00、戲院門口南邊騎樓 4 m' % DAY)
                        out = await pg.evaluate("NY3.streetOut()"); await load_street(pg, cdp, out['x'], out['z'] - 4, yaw=0.0)
                    await use_exit(pg, cdp, '[座位 新生南路→大廳]', '進南洋戲院', 'xs_nanyang')
                if 'seats' in PARTS:
                    await time_guard(pg, cdp, 'xs_nanyang', LOBBY_AT, '[大廳 座位前]')
                    await bench_precheck(pg)
                    await sit_all(pg, cdp, '[大廳]', before_each=guard_each('xs_nanyang', LOBBY_AT, '[大廳]'))
                # r1 第 5 項：這裡人已經不在大廳（24:00 打烊送回新生南路）。先印出人在哪，不在大廳／太晚就讀檔回大廳再找
                s0 = await st(pg)
                R.note('[座位 大廳→1 廳] 找「進 1 廳」前：人在 %s (%s, %s) 第 %s 層、%s 點、坐著＝%s、busy＝%s' % (s0['zone'], s0['x'], s0['z'], s0['lv'], s0['hour'], s0['seat'], s0['busy']))
                await time_guard(pg, cdp, 'xs_nanyang', LOBBY_AT, '[座位 大廳→1 廳]')
                s = await use_exit(pg, cdp, '[座位 大廳→1 廳]', '進 1 廳', 'xs_nanyang_hall')
                if not s: R.note('[座位 大廳→1 廳] 沒進到 1 廳，人在：%s' % J(await st(pg)))
                if s:
                    if 'slope' in PARTS: await part_slope(pg, cdp)
                    if 'seats' in PARTS:
                        await time_guard(pg, cdp, 'xs_nanyang_hall', HALL_AT, '[1 廳 座位前]')
                        await pg.evaluate(MV_HOOK)   # 沒有票坐下＝不演電影（十）
                        await sit_all(pg, cdp, '[1 廳]', before_each=guard_each('xs_nanyang_hall', HALL_AT, '[1 廳]'))
                        await no_movie_check(pg, '[1 廳 座位]')
        if 'movie' in PARTS: await part_movie(pg, cdp)
        if 'arcade' in PARTS: await part_arcade(pg, cdp)
        if 'closed' in PARTS: await part_closed(pg, cdp)
        if 'xsclose' in PARTS:
            if await pg.evaluate("typeof XSCLOSE!=='undefined'"): await part_xsclose(pg, cdp)
            else: R.note('[散場] 這一版沒有 XSCLOSE（2378a8957 以前）：不測')
        if 'art' in PARTS: await part_art(pg, cdp)
        if 'shots' in PARTS: await part_shots(pg, cdp)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
