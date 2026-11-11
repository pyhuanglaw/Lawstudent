"""CC（帳號 A）11-11：POOL_swimmers（BB 04:39，ART-GYM-POOL-SWIMMERS-1103）——體育館 B1 泳池游泳的人，遊戲裡的樣子。Playwright（PC GPU）≠ iPhone。
角色美術的判定歸 LAWWW，BB 給意見；這支只記錄＋幾條硬性檢查（不在水外、不穿池邊、不互相穿過、關館沒有人）。
PARTS：
  OPEN   開館時段（預設 2025-11-05 週三 10:00；畫質 Q=high 才會有 4 個人）進 gym_b1：
         池邊全景兩個角度（東南角、西北角）、每個泳客近拍一張（側面、正上方各一）、挑一個自由式和一個蛙式各連拍 10 張（每 0.3 秒，鏡頭跟著人）；
         每個人逐格（3 秒、每 0.1 秒）記：位置、朝向、turn（池邊轉身）、外框最低／最高點、頭骨（Head）和臀骨（Hips）的高度、水面高度（場景裡名字有 water 的面）；
         檢查：外框不超出池子（basin x0..x1、z0..z1，留 0.1 m）、人和人外框不交疊、頭不低於池底、臀不高出水面 0.5 m；池邊轉身那一刻拍一張。
         模型（char.swim_*）、姿勢（swim_free／swim_breast）照實記；泳帽泳鏡顏色看圖（材質名稱和顏色也列出來）。
  FPS    池邊 8 秒 fps（Q 那個畫質）。
  CLOSED 閉館時段（預設 23:00）進 gym_b1：拍一張全景、CROWD.swimLive 要是空的。
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=OPEN,FPS,CLOSED] [POOLDAY=2025-11-05] [OPENH=10] [CLOSEH=23] [Q=high] python3 cc_pool_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'OPEN,FPS,CLOSED').split(',')
R = L.Run('pool', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = os.environ.get('POOLDAY') or '2025-11-05'
OPENH = float(os.environ.get('OPENH') or '10'); CLOSEH = float(os.environ.get('CLOSEH') or '23'); Q = os.environ.get('Q') or 'high'
SHA = (os.environ.get('SHA') or '')[:9]
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player&&E.player.obj, hid=[]; if(P){ hid.push([P,P.visible]); P.visible=false; }
  try{ r.render(E.scene,cam); return c.toDataURL('image/jpeg',0.88); } finally { for(const [o,v] of hid) o.visible=v; } })"""
INFO = r"""(()=>{ const E=GAME.E, C=typeof CROWD!=='undefined'?CROWD:null; const B=(typeof GYM_LAYOUT!=='undefined'&&GYM_LAYOUT.b1&&GYM_LAYOUT.b1.pool)?GYM_LAYOUT.b1.pool.basin:null;
  let water=null; E.scene.traverse(o=>{ if(o.isMesh&&o.visible&&/water/i.test(o.name||'')){ const b=new THREE.Box3().setFromObject(o); if(!water||b.max.y>water.y) water={name:o.name,y:+b.max.y.toFixed(3),minY:+b.min.y.toFixed(3)}; } });
  const live=C&&C.swimLive?C.swimLive:{}; const out=[];
  for(const k in live){ const Lv=live[k], o=Lv.n.obj; o.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(o); let head=null,hips=null; const mats={};
    o.traverse(q=>{ const nm=q.name||''; if(!head&&/(^|_)Head$|J_Bip_C_Head/i.test(nm)){ head=q.getWorldPosition(new THREE.Vector3()); } if(!hips&&/(^|_)Hips$|J_Bip_C_Hips/i.test(nm)){ hips=q.getWorldPosition(new THREE.Vector3()); }
      if(q.isMesh) for(const m of [].concat(q.material||[])){ if(m&&m.color&&/cap|goggle|hat|swim|glass|帽|鏡/i.test((m.name||'')+' '+(q.name||''))) mats[(m.name||q.name)]='#'+m.color.getHexString(); } });
    const a=C.swimAt?C.swimAt(Lv.p):null;
    out.push({key:k, model:Lv.p.model, pose:Lv.n.pose, lane:Lv.p.lane, v:Lv.p.v, x:+o.position.x.toFixed(2), y:+o.position.y.toFixed(3), z:+o.position.z.toFixed(2), yaw:+o.rotation.y.toFixed(2), turn:a?+a.turn.toFixed(2):null, visible:o.visible,
      box:[+b.min.x.toFixed(2),+b.min.y.toFixed(3),+b.min.z.toFixed(2),+b.max.x.toFixed(2),+b.max.y.toFixed(3),+b.max.z.toFixed(2)], headY:head?+head.y.toFixed(3):null, hipsY:hips?+hips.y.toFixed(3):null, head:head?[+head.x.toFixed(2),+head.z.toFixed(2)]:null, mats}); }
  const H=C&&C.gymHours?C.gymHours(GAME.G):null;
  return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), q:E.q&&E.q.level, open:C&&C.swimOpen?C.swimOpen(GAME.G):null, hours:H, basin:B, water, swimmers:out}; })()"""
FPS8 = "new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"


def save(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def setq(pg):
    await pg.evaluate("(q=>{ const s=document.getElementById('setQuality'); if(s){ s.value=q; s.dispatchEvent(new Event('change')); } })", Q)


async def enter_b1(pg, cdp, h, why):
    await D.load_zone(pg, cdp, 'gym_b1', DAY, h, -4.0, -1.2, wait=8000)
    R.setup('【前置／捷徑】讀檔到 gym_b1 %s %.2f 時（池邊 (-4,-1.2)）%s；畫質 %s' % (DAY, h, why, Q))
    await setq(pg)
    for _ in range(60):   # 泳客的 VRM 是進 B1 才下載（lazy）：等到人數穩定
        i = await pg.evaluate(INFO)
        if i['swimmers'] or not i['open']: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1500)
    return await pg.evaluate(INFO)


async def part_open(pg, cdp):
    i = await enter_b1(pg, cdp, OPENH, '（開館）')
    R.note('[OPEN] 開館 %s、%s；水面 %s；池子 %s；泳客 %d 人：%s' % (i['hours'], i['open'], J(i['water']), J(i['basin']), len(i['swimmers']), J([(s['model'], s['pose'], s['lane'], s['v']) for s in i['swimmers']])))
    if not R.check('[OPEN] 開館時段有人在游（2～4 人）', 2 <= len(i['swimmers']) <= 4, J(i)): return
    B = i['basin']; cx = (B['x0'] + B['x1']) / 2; cz = (B['z0'] + B['z1']) / 2
    for lab, frm, at in (('全景_東南角', (B['x1'] + 1.5, 2.6, B['z1'] + 2.0), (cx - 3, -0.3, cz)), ('全景_西北角', (B['x0'] - 1.5, 2.6, B['z0'] - 1.5), (cx + 3, -0.3, cz))):
        save(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at), 'fov': 60}), 'pool_%s.jpg' % lab)
    b0 = await pg.screenshot(type='jpeg', quality=82); open(os.path.join(OUT, 'pool_game.jpg'), 'wb').write(b0)
    # 逐格量（3 秒、每 0.1 秒）
    WY = (i['water'] or {}).get('y'); bad_out, bad_x, bad_y = [], [], []; turns = {}
    for k in range(30):
        q = await pg.evaluate(INFO)
        for s in q['swimmers']:
            bx = s['box']
            if bx[0] < B['x0'] - 0.1 or bx[3] > B['x1'] + 0.1 or bx[2] < B['z0'] - 0.1 or bx[5] > B['z1'] + 0.1: bad_out.append((k, s['key'], bx))
            if s['headY'] is not None and s['headY'] < -B.get('depth', 1.4): bad_y.append((k, s['key'], 'head 低於池底', s['headY']))
            ref = WY if WY is not None else 0.0
            if s['hipsY'] is not None and s['hipsY'] > ref + 0.5: bad_y.append((k, s['key'], 'hips 高出水面 0.5 m', s['hipsY'], ref))
            if (s['turn'] or 0) > 0.3 and s['key'] not in turns:
                turns[s['key']] = s
                save(await pg.evaluate(SNAP, {'from': [s['x'] + (1.8 if s['x'] < cx else -1.8), 1.6, s['z'] + 1.8], 'at': [s['x'], -0.2, s['z']], 'fov': 45}), 'pool_turn_%s.jpg' % s['key'].replace('|', '_'))
        sw = q['swimmers']
        for a in range(len(sw)):
            for b in range(a + 1, len(sw)):
                A_, B_ = sw[a]['box'], sw[b]['box']
                if A_[0] < B_[3] and B_[0] < A_[3] and A_[2] < B_[5] and B_[2] < A_[5] and A_[1] < B_[4] and B_[1] < A_[4]: bad_x.append((k, sw[a]['key'], sw[b]['key']))
        if k in (0, 15, 29): R.note('[OPEN] 第 %d 格：%s' % (k, J([{x: s[x] for x in ('key', 'x', 'z', 'yaw', 'turn', 'box', 'headY', 'hipsY')} for s in sw])))
        await pg.wait_for_timeout(100)
    R.check('[OPEN] 3 秒逐格：外框都在池子裡（留 0.1 m）', not bad_out, J(bad_out[:10]))
    R.check('[OPEN] 3 秒逐格：人和人外框不交疊', not bad_x, J(bad_x[:10]))
    R.check('[OPEN] 3 秒逐格：頭不低於池底、臀不高出水面 0.5 m（水面 %s）' % WY, not bad_y, J(bad_y[:10]))
    R.note('[OPEN] 池邊轉身拍到的：%s' % J(list(turns.keys())))
    # 每人近拍＋材質顏色
    q = await pg.evaluate(INFO)
    for s in q['swimmers']:
        nm = s['key'].replace('|', '_')
        save(await pg.evaluate(SNAP, {'from': [s['x'], 1.2, s['z'] + 2.2], 'at': [s['x'], -0.15, s['z']], 'fov': 40}), 'pool_close_%s_side.jpg' % nm)
        save(await pg.evaluate(SNAP, {'from': [s['x'] + 0.01, 3.2, s['z'] + 0.01], 'at': [s['x'], -0.2, s['z']], 'fov': 40}), 'pool_close_%s_top.jpg' % nm)
        R.note('[OPEN 近拍 %s] %s %s；泳帽／泳鏡相關材質顏色 %s' % (s['key'], s['model'], s['pose'], J(s['mats'])))
    # 連拍：自由式、蛙式各挑一個
    for pose in ('swim_free', 'swim_breast'):
        s0 = next((s for s in q['swimmers'] if s['pose'] == pose), None)
        if not s0: R.note('[OPEN 連拍] 這一天沒有 %s 的人' % pose); continue
        for k in range(10):
            s = next((x for x in (await pg.evaluate(INFO))['swimmers'] if x['key'] == s0['key']), None)
            if not s: break
            save(await pg.evaluate(SNAP, {'from': [s['x'], 1.0, s['z'] + 2.4], 'at': [s['x'], -0.15, s['z']], 'fov': 42}), 'pool_burst_%s_%02d.jpg' % (pose, k + 1))
            await pg.wait_for_timeout(300)
        R.note('[OPEN 連拍] %s：%s，10 張（每 0.3 秒）' % (pose, s0['key']))


async def part_fps(pg, cdp):
    i = await pg.evaluate(INFO)
    if i['zone'] != 'gym_b1': i = await enter_b1(pg, cdp, OPENH, '（量 fps）')
    R.note('[FPS] gym_b1 池邊 %s 畫質、泳客 %d 人：%s fps（SHA %s；Windows GPU ≠ iPhone）' % (i['q'], len(i['swimmers']), await pg.evaluate(FPS8), SHA))


async def part_closed(pg, cdp):
    i = await enter_b1(pg, cdp, CLOSEH, '（閉館）')
    B = i['basin'] or {'x0': -12.5, 'x1': 12.5, 'z0': -21, 'z1': -3.5}; cx = (B['x0'] + B['x1']) / 2; cz = (B['z0'] + B['z1']) / 2
    save(await pg.evaluate(SNAP, {'from': [B['x1'] + 1.5, 2.6, B['z1'] + 2.0], 'at': [cx - 3, -0.3, cz], 'fov': 60}), 'pool_closed_全景.jpg')
    R.check('[CLOSED] 閉館（%s 時，開館 %s）水裡沒有人' % (i['h'], i['hours']), not i['swimmers'] and not i['open'], J({k: i[k] for k in ('h', 'open', 'hours')}) + ' ' + J([s['key'] for s in i['swimmers']]))


async def main():
    print('CC POOL_swimmers：PARTS %s；SHA %s；%s；Playwright ≠ iPhone' % (','.join(PARTS), SHA, DAY), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('OPEN', part_open), ('FPS', part_fps), ('CLOSED', part_closed)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
