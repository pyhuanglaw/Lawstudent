"""CC-C（帳號 C）11-05：D141（場景最多 3 版就進遊戲，只擋五種：走不到、坐不下、穿模、卡住、黑畫面）店家探針的共用函式。
  從 cc_nanyang_v1_probe.py 拆出來＋多樓層（lv）：SHANLAN_v1、WZLIN_v1c 用。判定歸 BB（D132：BB 自己做的室內交 LAWWW-C 判）。
  用法：import cc_d141_lib as D；D.setup(R, J) 之後 D.use_exit／D.sit_all／D.walk_logged／D.shot／D.closed_door／D.user_shot。"""
import os, io, json, math, time, asyncio
import playlib as L

R = None
J = lambda o: json.dumps(o, ensure_ascii=False)
OUT = '.'
ST = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position; const ch=document.getElementById('choices'), it=document.getElementById('interact');
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||'').trim()):[];
  return {zone:GAME.G.zone, x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), lv:P.lv|0, seat:!!P.seat, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active), choices,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,24):'',
    stand:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null, fb:GAME.walkFallbacks||0, hour:+(+GAME.G.hour).toFixed(2)}; })()"""
SEATS = r"""(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>{ const ap=GAME.seatApproach?GAME.seatApproach(i.seat):null, s=i.seat;
  return {label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:(i.lv|0), sx:+s.x.toFixed(3), sz:+s.z.toFixed(3), sy:s.y==null?null:+(+s.y).toFixed(3), slv:(s.lv|0), row:i.row||null, ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null}; }))()"""
EXITS = r"""(()=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||1, lv:(i.lv|0), to:i.exit.to})))()"""
CAM = r"""((C)=>{ const E=GAME.E, cam=E.camera, V=THREE.Vector3; const hf=2*Math.atan(18/(C.lens||24)), vf=2*Math.atan(Math.tan(hf/2)/(innerWidth/innerHeight));
  E.paused=true; E.cinematic&&E.cinematic(new V(...C.eye),new V(...C.look));
  for(let i=0;i<2;i++){ cam.position.set(...C.eye); E.cam.look=new V(...C.look); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); } cam.fov=vf*180/Math.PI; cam.updateProjectionMatrix(); E.render();
  return {eye:C.eye, look:C.look, lens:C.lens||24, vfov:+(vf*180/Math.PI).toFixed(2)}; })"""
UNCAM = r"""(()=>{ const E=GAME.E; E.paused=false; if(E.endCinematic) E.endCinematic(); return true; })()"""
HUD = r"""(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""


def setup(run, out):
    global R, OUT
    R = run; OUT = out


def lum(png_bytes):
    try:
        from PIL import Image, ImageStat
    except ImportError:
        return None
    im = Image.open(io.BytesIO(png_bytes)).convert('L'); s = ImageStat.Stat(im)
    return [round(s.mean[0], 1), round(s.stddev[0], 1)]


async def shot(pg, name, judge_black=True):
    b = await pg.screenshot(path=os.path.join(OUT, name + '.png')); m = lum(b)
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


async def settle(pg, ms=600, max_s=6):
    """等人停下來（PC 的 GPU 跑得快：go_to 說到了，人還在走——11-05 NANYANG_v1 PC：停在目標後面 1.4 m）"""
    t0 = time.time(); last = None; still = 0
    while time.time() - t0 < max_s:
        s = await st(pg); cur = (round(s['x'], 2), round(s['z'], 2))
        if cur == last: still += 150
        else: still = 0
        if still >= ms: return s
        last = cur; await pg.wait_for_timeout(150)
    return await st(pg)


NEAR_IT = r"""(()=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); if(!it) return null; return {label:it.label||'', seat:it.seat?[+it.seat.x.toFixed(3),+it.seat.z.toFixed(3)]:null, exit:it.exit?it.exit.to:null}; })()"""
WIN_CELL = r"""((q)=>{ const E=GAME.E, P=E.player.obj.position; const its=E.interactables.filter(i=>i.seat&&!i.hidden&&((i.lv|0)===q.lv)); const me=its.find(i=>Math.abs(i.seat.x-q.sx)<1e-3&&Math.abs(i.seat.z-q.sz)<1e-3); if(!me) return null; let best=null;
  for(let x=me.x-1.0;x<=me.x+1.0+1e-6;x+=0.1) for(let z=me.z-1.0;z<=me.z+1.0+1e-6;z+=0.1){ if(!E.canStand(x,z,0.3,q.lv)) continue; const inR=its.filter(i=>Math.hypot(i.x-x,i.z-z)<=(i.radius||0.8)-0.1); if(!inR.length) continue;
    inR.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)); if(inR[0]!==me) continue; const second=inR[1]?Math.hypot(inR[1].x-x,inR[1].z-z)-Math.hypot(me.x-x,me.z-z):9; const sc=second*2-Math.hypot(x-q.ap[0],z-q.ap[1]);
    if(!best||sc>best.sc) best={x:+x.toFixed(2),z:+z.toFixed(2),sc}; } return best; })"""


async def standable_near(pg, x, z, r, lv=0):
    """(x,z) 半徑 r 裡、離人最近、站得住的點（出口那一點本身常常在門框裡站不住）"""
    return await pg.evaluate("""((e)=>{ const E=GAME.E, P=E.player.obj.position; let best=null;
      for(let r=0; r<=e.r+1e-6; r+=0.1) for(let a=0; a<360; a+=15){ const x=e.x+r*Math.sin(a*Math.PI/180), z=e.z+r*Math.cos(a*Math.PI/180);
        if(!E.canStand(x,z,0.3,e.lv)) continue; const d=Math.hypot(x-P.x,z-P.z); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d}; }
      return best; })""", {'x': x, 'z': z, 'r': r, 'lv': lv})


async def use_exit(pg, cdp, tag, label0, to, pred=None):
    """走到出口（範圍裡站得住的點）、互動按鈕是它就按；回傳換到的區域狀態"""
    exs = await pg.evaluate(EXITS)
    ex = next((e for e in exs if e['label'].startswith(label0) and (pred is None or pred(e))), None)
    if not R.check('%s 有「%s」' % (tag, label0), bool(ex), J(exs)): return None
    fb0 = (await st(pg))['fb']
    tgt = await standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, ex['lv'])   # 範圍的六成以內（PC 11-05：停在 0.25 m 以外＝出了範圍、沒有按鈕）
    R.note('%s 「%s」在 (%s, %s) 半徑 %s；走到範圍裡站得住的 %s' % (tag, label0, ex['x'], ex['z'], ex['r'], J(tgt)))
    if not R.check('%s 「%s」範圍裡有站得住的地方' % (tag, label0), bool(tgt), J(ex)): return None
    await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.12, '%s %s' % (tag, label0), max_s=240, lv=ex['lv'])
    s = await settle(pg)
    for _ in range(8):
        if s['interact'].startswith(label0): break
        await pg.wait_for_timeout(500); s = await st(pg)
    if not R.check('%s 走到那裡，互動按鈕是「%s」' % (tag, label0), s['interact'].startswith(label0), J({k: s[k] for k in ('x', 'z', 'lv', 'interact')})): return None
    await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, to)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp); s = await st(pg)
    R.check('%s 按下去到了 %s（站得住、沒有被放到目的地）' % (tag, to), s['zone'] == to and s['stand'] and s['fb'] == fb0, J(s))
    return s


async def load_zone(pg, cdp, zone, day_key, h=14.0, x=None, z=None, yaw=None, lv=0, wait=6000):
    d = await pg.evaluate("STORY.dayOfKey('%s')" % day_key)
    st0 = {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}
    if x is not None: st0['pos'] = {'x': x, 'z': z, 'yaw': yaw if yaw is not None else 0.0, 'lv': lv}
    await L.load_state(pg, st0, quiet_events=True, quiet_phone=True)
    await pg.wait_for_timeout(wait); await L.close_panels(pg, cdp)
    return await st(pg)


async def sit_all(pg, cdp, tag, shot_prefix, max_walk=300):
    """每一張玩家能坐的位子：走到 GAME.seatApproach（那一層）→ 按 → player.seat、位置 0.15 m 內、高度＝座位 y（沒有＝那一層地板）→ 起身、推得動。回傳 [每張的結果]"""
    seats = await pg.evaluate(SEATS); R.note('%s 座位 %d 張：%s' % (tag, len(seats), J(seats))); res = []
    for k, s in enumerate(seats):
        t = '%s #%d（%s, %s%s）' % (tag, k + 1, s['sx'], s['sz'], (' 二樓' if s['slv'] == 1 else '') + ((' 第 %d 排' % s['row']) if s['row'] else ''))
        occ = await pg.evaluate("(([x,z])=>(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.35))", [s['sx'], s['sz']])
        if occ: R.note('%s 有人坐：遊戲不給坐，跳過（不算 FAIL）' % t); res.append([k + 1, 'occupied']); continue
        tgt = s['ap'] or [s['x'], s['z']]; fb0 = (await st(pg))['fb']
        await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.12, '%s（seatApproach）' % t, max_s=max_walk, lv=s['slv'])
        b = await settle(pg)
        if math.hypot(b['x'] - tgt[0], b['z'] - tgt[1]) > 0.2:   # 走過頭（PC）：再走一次
            await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.12, '%s（seatApproach 再一次）' % t, max_s=120, lv=s['slv']); b = await settle(pg)
        ni = await pg.evaluate(NEAR_IT)
        mine = bool(ni and ni['seat'] and abs(ni['seat'][0] - s['sx']) < 0.01 and abs(ni['seat'][1] - s['sz']) < 0.01)
        R.check('%s 站在 GAME.seatApproach（點椅子 tapToSeat 走到的那一點；離它 %.2f m）：最近的「坐下」是這一張' % (t, math.hypot(b['x'] - tgt[0], b['z'] - tgt[1])), mine, J({'at': [b['x'], b['z']], 'nearest': ni}))
        if not mine:   # 那一點的按鈕是別張：照玩家改走到這一張的按鈕範圍裡（離別張比較遠的地方），看這一張坐不坐得下
            wc = await pg.evaluate(WIN_CELL, {'sx': s['sx'], 'sz': s['sz'], 'lv': s['slv'], 'ap': tgt})
            R.note('%s 改走到這一張按鈕範圍裡、最近的就是它的一點：%s' % (t, J(wc)))
            if wc:
                await L.go_to(pg, cdp, R, wc['x'], wc['z'], 0.08, '%s（這一張的按鈕範圍）' % t, max_s=120, lv=s['slv']); b = await settle(pg)
        for _ in range(6):
            if b['interact'].startswith(s['label']): break
            await pg.wait_for_timeout(500); b = await st(pg)
        if not R.check('%s 走到旁邊，互動按鈕是「%s」' % (t, s['label']), b['interact'].startswith(s['label']), J({k_: b[k_] for k_ in ('x', 'z', 'lv', 'interact', 'stand')})):
            await shot(pg, '%s_nobtn_%d' % (shot_prefix, k + 1), judge_black=False); res.append([k + 1, 'nobtn']); continue
        await L.tap(pg, cdp, '#interact'); ok = False
        for _ in range(30):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("!!GAME.E.player.seat"): ok = True; break
        await pg.wait_for_timeout(1500)
        p = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position, s=P.seat; return {x:+o.x.toFixed(3),z:+o.z.toFixed(3),y:+o.y.toFixed(3),lv:P.lv|0, sx:s?+s.x.toFixed(3):null, sz:s?+s.z.toFixed(3):null, sy:s&&s.y!=null?+(+s.y).toFixed(3):null}; })()")
        R.check('%s 坐下了（player.seat）' % t, ok, J(p))
        if ok:
            d = math.hypot(p['x'] - s['sx'], p['z'] - s['sz'])
            fy = s['sy'] if s['sy'] is not None else await pg.evaluate("((lv)=>{ const z=GAME.E.zone, L=z&&z.levelGroups; return L&&L[lv]?L[lv].y:0; })", s['slv'])
            R.check('%s 坐下的位置離座位 %.3f m（≤0.15）、人的高度 %.3f＝座位那一層 %.3f（±0.06）' % (t, d, p['y'], fy), d <= 0.15 and abs(p['y'] - fy) <= 0.06, J(p))
            await shot(pg, '%s_seat_%d' % (shot_prefix, k + 1))
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
        R.check('%s 起身：不是坐著、站得住、推得動 ≥0.3 m、沒有被放到目的地' % t, not c['seat'] and c['stand'] and mv >= 0.3 and c['fb'] == fb0, J({'moved': mv, 'x': c['x'], 'z': c['z'], 'lv': c['lv'], 'stand': c['stand'], 'fb': c['fb'] - fb0}))
        res.append([k + 1, 'ok' if ok else 'nosit'])
    return res


SAMPLES = []


async def _sampler(pg, stop):
    while not stop.is_set():
        try: SAMPLES.append(await st(pg))
        except Exception: pass
        await asyncio.sleep(0.3)


async def walk_logged(pg, cdp, tx, tz, near, label, max_s=180, lv=None):
    SAMPLES.clear(); ev = asyncio.Event(); task = asyncio.create_task(_sampler(pg, ev))
    try: ok = await L.go_to(pg, cdp, R, tx, tz, near, label, max_s=max_s, lv=lv)
    finally:
        ev.set(); await task
    return ok, list(SAMPLES)


async def closed_door(pg, cdp, tag, street, door_to, door_label, place_id, x, z, h, day_key):
    """營業時間外：讀檔街上 h 點、走到店門按 → 不換區域、toast＝PLACES.closedText"""
    R.setup('%s 讀檔 %s %s %05.2f（營業時間外）、店門旁邊 (%s, %s)' % (tag, street, day_key, h, x, z))
    await load_zone(pg, cdp, street, day_key, h, x, z, 0.0)
    door = await pg.evaluate("((to)=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}:null; })", door_to)
    if not R.check('%s 店門還在（「%s」）' % (tag, door_label), bool(door) and door['label'].startswith(door_label), J(door)): return
    exp = await pg.evaluate("((p)=>PLACES.closedText(p,GAME.G.hour,GAME.G.day))", place_id)
    await L.go_to(pg, cdp, R, door['x'], door['z'], 0.4, '%s 店門' % tag, max_s=120)
    await pg.wait_for_timeout(600); s = await st(pg)
    if not R.check('%s 走到店門，互動按鈕是「%s」' % (tag, door_label), s['interact'].startswith(door_label), J(s)): return
    await pg.evaluate("(()=>{ window.__ccToast=[]; const t=document.getElementById('toast'); if(t){ new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x) window.__ccToast.push(x); }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); } })()")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    s = await st(pg); toasts = await pg.evaluate("window.__ccToast||[]")
    R.note('%s 按下去：%s；toast %s；PLACES.closedText＝%s' % (tag, J({k: s[k] for k in ('zone', 'hour')}), J(toasts), J(exp)))
    R.check('%s %05.2f 按店門：沒有進去（還在 %s）' % (tag, h, street), s['zone'] == street, J(s))
    R.check('%s 跳出「%s」（PLACES.closedText）' % (tag, exp), bool(exp) and any(exp in t or t in exp for t in toasts), J(toasts))
    await shot(pg, '%s_closed' % place_id)


async def user_shot(pg, cdp, name, cam, hide_player=True):
    """給使用者看（不判，只算黑畫面）：1280×720、藏 HUD（和玩家）、照 cam 的 eye／look／lens"""
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
    if hide_player: await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
    await pg.evaluate(HUD + '(false)'); c = await pg.evaluate(CAM, cam); await pg.wait_for_timeout(600); await pg.evaluate("GAME.E.render()")
    m = await shot(pg, name)
    await pg.evaluate(UNCAM); await pg.evaluate(HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    R.note('[截圖] %s：鏡頭 %s、亮度 %s' % (name, J(c), J(m)))
    return c
