"""CC-C（帳號 C）11-05：NANYANG_v1（BB-C 04:16 派工，D141 順序第 1 間）——南洋戲院第 1 版只測「擋玩」的五項（D141：走不到、坐不下、穿模、卡住、黑畫面）＋給使用者看的截圖。
  版本：LAWWW-C 整合 a3b18addc（LAWWW2-C 9eed89550＋接線 patch＋XS-ARCADE-NAV-1105）。判定歸 BB；PC＝Windows＋GPU，雲端 SwiftShader（顏色、亮度以電腦為準）。
  期望值的出處：src/data/nanyang_layout.js（LAWWW2／BB 的配置：enterAt、exit、hallOut、seats、hall.slope、hall.seats）、
    docs/art-rebuild/second_ai/wip/xs_arcade_nav_1105/README.md（9eed89550：沒有騎樓的兩段 z −68～−40、47.4～68，牆在 x −13.2；牆裡 x −13.6、−15.5 站不住、人行道 x −12.4 站得住）。
  一、進出（照玩家走）：【前置】讀檔新生南路 2025-10-15（三）14:00（營業 09:30–24:00）、站在戲院門口南邊騎樓 → 走到「進南洋戲院」按 → 大廳（站得住、推得動）
      → 走到「進 1 廳」→ 1 廳 → 走到「回大廳」→ 大廳 → 走到「出去（新生南路）」→ 新生南路（站得住、推得動）。
  二、座位：大廳四張長椅、1 廳九排靠右走道那一張，都走到 GAME.seatApproach 那一點按「坐下…」→ player.seat；坐下的位置離座位 0.15 m 內、高度＝那一排地板（1 廳）；起身、推得動 ≥0.3 m。
      有 NPC 坐著的位子遊戲不給坐＝記下跳過（不算 FAIL）。
  三、斜地板：1 廳從門口沿右邊走道走到第一排前面、再走回門口；每 0.3 秒記人的高度，和配置 floorY(z) 差 ≤0.06 m；兩段都要到。
  四、穿模／黑畫面：上面每一步人都站得住（E.canStand）、沒有被放到目的地（GAME.walkFallbacks 不增加）；每張截圖算平均亮度（<6/255 且幾乎沒有變化＝黑畫面）。
  五、新生南路騎樓（XS-ARCADE-NAV-1105）：①兩段（z −68～−40、47.4～68）每 1 m 看 x −13.6、−15.5 站不住、x −12.4 站得住；
      ②照玩家點地往牆裡走（騎樓南北兩端往公寓那邊點），一路記位置：在那兩段裡人的 x 都 ≥ −13.2（不在牆裡）。
  截圖（給使用者看，不判）：大廳 camRef（配置 lobby.camRef：eye、look、lens 24 mm）、1 廳（配置沒有 camRef：門口往銀幕，eye (3.5,1.6,7.4) look (0,1.4,−7.75) 24 mm），白天 14:00、晚上 21:00 各一張。
用法：LW_TESTS=<wt>/tests [PARTS=door,seats,slope,arcade,shots] python3 cc_nanyang_v1_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time, io
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
PARTS = [x for x in (os.environ.get('PARTS') or 'door,seats,slope,arcade,shots').split(',') if x]
R = L.Run('nanyang_v1', OUT)
DAY = '2025-10-15'
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


async def part_slope(pg, cdp):
    fy = await pg.evaluate("(()=>{ const H=NANYANG_LAYOUT.hall; return {s:H.slope, ax:H.aisleR}; })()")
    R.note('[斜地板] 配置 slope %s、右邊走道 %s' % (J(fy['s']), J(fy['ax'])))
    ax = round((fy['ax']['x0'] + fy['ax']['x1']) / 2, 2)
    legs = [(ax, -4.6, '門口 → 第一排前面（下坡）'), (3.5, 6.2, '第一排前面 → 門口（上坡）')]
    for tx, tz, nm in legs:
        fb0 = (await st(pg))['fb']
        ok, smp = await walk_logged(pg, cdp, tx, tz, 0.35, '[斜地板] ' + nm, max_s=240)
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
    # ① 導航取樣（README：牆在 x −13.2；牆裡 x −13.6、−15.5 站不住、人行道 x −12.4 站得住）
    grid = await pg.evaluate("""(()=>{ const E=GAME.E, out={wallIn:[], sideOut:[]};
      for(const [a,b] of [[-67.5,-40.5],[48,67.5]]) for(let z=a; z<=b+1e-6; z+=1){ for(const x of [-13.6,-15.5]) if(E.canStand(x,z,0.3,0)) out.wallIn.push([x,z]); if(!E.canStand(-12.4,z,0.3,0)) out.sideOut.push([-12.4,z]); }
      out.n=Math.round((67.5-40.5+1)+(67.5-48+1)); return out; })()""")
    R.check('[騎樓] 沒有騎樓的兩段（z −68～−40、47.4～68，每 1 m %d 處）：牆裡 x −13.6、−15.5 都站不住' % grid['n'], not grid['wallIn'], J(grid['wallIn'][:10]))
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


async def part_shots(pg, cdp):
    lay = await pg.evaluate("(()=>({lobby:NANYANG_LAYOUT.lobby.camRef, hall:NANYANG_LAYOUT.hall.camRef||null}))()")
    hall_cam = lay['hall'] or {'eye': [3.5, 1.6, 7.4], 'look': [0.0, 1.4, -7.75], 'lens': 24}
    if not lay['hall']: R.note('[截圖] 1 廳配置沒有 camRef：用門口往銀幕 %s' % J(hall_cam))
    d = await pg.evaluate("STORY.dayOfKey('%s')" % DAY)
    for zone, cam, nm in [('xs_nanyang', lay['lobby'], 'lobby'), ('xs_nanyang_hall', hall_cam, 'hall')]:
        for h, hn in [(14.0, 'day'), (21.0, 'night')]:
            R.setup('[截圖] 讀檔 %s %s %02d:00' % (zone, DAY, int(h)))
            await L.load_state(pg, {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}, quiet_events=True, quiet_phone=True)
            await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            z = (await st(pg))['zone']
            if not R.check('[截圖] 讀到 %s' % zone, z == zone, z): continue
            glb = await pg.evaluate("(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.visible) n++; }); return n; })()")
            await pg.evaluate(HUD + '(false)'); c = await pg.evaluate(CAM, cam); await pg.wait_for_timeout(600); await pg.evaluate("GAME.E.render()")
            m = await shot(pg, 'user_%s_%s' % (nm, hn))
            R.note('[截圖] %s %s：鏡頭 %s、看得到的網格 %d、亮度 %s' % (nm, hn, J(c), glb, J(m)))
            await pg.evaluate(UNCAM); await pg.evaluate(HUD + '(true)')


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC NANYANG_v1（南洋戲院第 1 版：只測擋玩五項＋給使用者的截圖）：PARTS=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        has = await pg.evaluate("typeof NY3!=='undefined'&&!!Z3.ZONES.xs_nanyang&&!!Z3.ZONES.xs_nanyang_hall")
        if not R.check('這一版有南洋戲院（NY3、Z3.ZONES.xs_nanyang／xs_nanyang_hall）', has, ''): await b.close(); sys.exit(1)
        if 'door' in PARTS or 'seats' in PARTS or 'slope' in PARTS:
            out = await pg.evaluate("NY3.streetOut()")
            R.setup('[進出] 讀檔新生南路 %s（三）14:00、戲院門口南邊騎樓 4 m（%s, %s）' % (DAY, out['x'], out['z'] - 4))
            await load_street(pg, cdp, out['x'], out['z'] - 4, yaw=0.0)
            okd = await part_door(pg, cdp)
            if ('seats' in PARTS or 'slope' in PARTS):
                if not okd:
                    R.setup('[座位] 進出沒走完：【捷徑】直接讀檔進大廳')
                    await L.load_state(pg, {'zone': 'xs_nanyang', 'hour': 14.0, 'day': await pg.evaluate("STORY.dayOfKey('%s')" % DAY), 'weather': 'clear'}, quiet_events=True, quiet_phone=True)
                    await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
                else:
                    await use_exit(pg, cdp, '[座位 新生南路→大廳]', '進南洋戲院', 'xs_nanyang')
                if 'seats' in PARTS: await sit_all(pg, cdp, '[大廳]')
                s = await use_exit(pg, cdp, '[座位 大廳→1 廳]', '進 1 廳', 'xs_nanyang_hall')
                if s:
                    if 'slope' in PARTS: await part_slope(pg, cdp)
                    if 'seats' in PARTS: await sit_all(pg, cdp, '[1 廳]')
        if 'arcade' in PARTS: await part_arcade(pg, cdp)
        if 'shots' in PARTS: await part_shots(pg, cdp)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
