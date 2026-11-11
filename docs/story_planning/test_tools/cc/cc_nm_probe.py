"""CC（帳號 A）11-10：NM1 夜市十三攤第 1 版（模型＋各攤開收時間；BB 23:44，LAWWW 23:41；新 b810b809b 以後、舊 fd4dd9aef）。Playwright（PC GPU）≠ iPhone。
攤位、每攤 from／to、公館三攤全部從 TINGZHOU_LAYOUT.stalls（kinds、list、gongguan）讀，不寫死；遊戲裡的攤：汀州路 E.zone.tzStalls、公館 E.zone.ggStalls（{id,kind,x,z,yaw,isOpen,open,closed}）。
PARTS：
  TABLE  十三攤的 from／to 印成表（跨午夜 24 以上）；背景三攤（buy:false）的名字只寫賣的東西（套圈圈／手機殼／襪子，不能有店名）。
  SHOTS  每攤三個時間：營業中＝(from+to)/2、收攤前＝from−1、收攤後＝to+0.5。每個時間：正面（客人那一面 4.5 m）、招牌近拍（模型外框頂端往下 0.35 m、2.2 m）、
         招牌放大（同機位 fov 16）；open／closed 兩個模型的世界外框中心（差 >5 cm 記）；那個狀態看得到的模型裡有沒有燈（Light、自發光材質）；
         【前置／捷徑】讀檔站在攤子前面 1.9 m → 互動鍵寫什麼、按下去出什麼（逐句記；收攤後不能出現買的清單）。STALLS=id,… 只跑那幾攤。
  PANO   全景：巷 A（20:00、收攤後 25:00）、汀州路西側三攤（20:00）、水源市場前（20:00）、公館人行道三攤（14:00、20:00、25:00）。
  WALK   搖桿走巷 A 一趟（20:00、25:00 各一次，東→西→東）；公館騎樓（z 20）、人行道（z 13.5）各走一次（20:00）；卡住 3 秒改側推、記次數；walkFallbacks 0。
  OLDPOS 舊存檔站在現在有攤子的地方（公館三攤、巷 A 中間）讀檔：挪 ≤1 m、站得住、搖桿推得動；console 的 warning 全文。
  FPS    巷 A 20:00、公館人行道 20:00 各 8 秒（舊版同位置）。
  EDGE   最早開的那一攤：from 前後一分鐘；最晚收的那一攤：to 前後一分鐘——各拍正面、記 isOpen。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=TABLE,SHOTS,… [STALLS=…] python3 cc_nm_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'TABLE,SHOTS,PANO,WALK,OLDPOS,FPS,EDGE').split(',')
R = L.Run('nm', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = os.environ.get('NMDAY') or '2025-11-01'   # 週六：套圈圈（days 5,6,0）有擺
SHA = (os.environ.get('SHA') or '')[:9]
BG = {'ring': '套圈圈', 'phonecase': '手機殼', 'socks': '襪子'}
ME = "(()=>{ const E=GAME.E, P=E.player, p=P.obj.position, N=E.nav; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), free:N?!!N.free(p.x,p.z):null, stand:E.canStand?!!E.canStand(p.x,p.z,0.3):null, fb:GAME.walkFallbacks|0}; })()"
LAY = "(()=>{ const T=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null; const S=T&&T.stalls; if(!S) return null; return {kinds:S.kinds||null, list:S.list||[], gongguan:S.gongguan||[], from:S.from, to:S.to}; })()"
STALLS = r"""(()=>{ const z=GAME.E.zone||{}, A=(z.tzStalls||z.ggStalls||[]); const box=o=>{ if(!o) return null; o.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return null; const c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); return {c:[+c.x.toFixed(3),+c.y.toFixed(3),+c.z.toFixed(3)], s:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)], top:+b.max.y.toFixed(2)}; };
  const lit=o=>{ if(!o) return null; let L=0, em=0; o.traverse(q=>{ if(q.isLight&&q.visible&&q.intensity>0) L++; if(q.isMesh&&q.visible){ for(const m of [].concat(q.material||[])){ if(m&&m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b)>0.05&&(m.emissiveIntensity==null||m.emissiveIntensity>0)) em++; } } }); return {lights:L, emissive:em}; };
  const gh=+(+GAME.G.hour).toFixed(4), eh=GAME.E.hour!=null?+(+GAME.E.hour).toFixed(4):null, so=(typeof TZ3!=='undefined'&&TZ3.stallOpen)?(q=>TZ3.stallOpen(+GAME.G.hour,q)):(()=>null);
  const tr=o=>o?{p:[+o.position.x.toFixed(4),+o.position.y.toFixed(4),+o.position.z.toFixed(4)], r:[+o.rotation.x.toFixed(4),+o.rotation.y.toFixed(4),+o.rotation.z.toFixed(4)], s:[+o.scale.x.toFixed(4),+o.scale.y.toFixed(4),+o.scale.z.toFixed(4)]}:null;
  const off=(GAME.E.zone||{}).tzStallOff||{};
  return A.map(q=>({id:q.id, kind:q.kind, name:q.name, x:q.x, z:q.z, yaw:q.yaw, isOpen:!!q.isOpen, gh, eh, expect:so(q), off:!!off[q.id], to:tr(q.open), tc:tr(q.closed), openVis:q.open?!!q.open.visible:null, closedVis:q.closed?!!q.closed.visible:null, ob:box(q.open), cb:box(q.closed), litOpen:lit(q.open), litClosed:lit(q.closed)})); })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.1, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player&&E.player.obj, hid=[]; if(P){ hid.push([P,P.visible]); P.visible=false; }
  try{ r.render(E.scene,cam); return c.toDataURL('image/jpeg',0.88); } finally { for(const [o,v] of hid) o.visible=v; } })"""
FPS8 = "new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"


def save(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def hhmm(h):
    m = int(round(h * 60)); return '%02d%02d' % ((m // 60) % 24, m % 60) + ('+1' if m >= 24 * 60 else '')


async def at(pg, cdp, zone, h, x=None, z=None, why='', wait=8000):
    await D.load_zone(pg, cdp, zone, DAY, h, x, z, wait=wait)
    R.setup('【前置／捷徑】讀檔到 %s %s %s%s %s' % (zone, DAY, hhmm(h), '' if x is None else ' (%.2f,%.2f)' % (x, z), why))


async def lay(pg):
    return await pg.evaluate(LAY)


def all_stalls(Ly):
    out = [dict(q, zone='tingzhou') for q in Ly['list']] + [dict(q, zone='gongguan') for q in Ly['gongguan']]
    for q in out:
        K = (Ly['kinds'] or {}).get(q['kind']) or {}
        q['from'] = K.get('from', Ly['from']); q['to'] = K.get('to', Ly['to']); q['name'] = K.get('name'); q['buy'] = K.get('buy'); q['days'] = K.get('days')
    return out


async def talk(pg, cdp, tag):
    """互動鍵上的字、按下去出的東西（逐句、選項）。回傳 {btn, lines, opts}"""
    s = await L.state(pg); btn = s['interact']; lines, opts = [], []
    if not btn: return {'btn': '', 'lines': [], 'opts': []}
    await L.tap(pg, cdp, '#interact'); t0 = time.time()
    while time.time() - t0 < 25:
        q = await L.state(pg)
        if q['choices']:
            o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); opts.append(o)
            last = next((i for i, t in enumerate(o) if any(k in t for k in ('算了', '不用', '離開', '不買'))), len(o) - 1)
            await pg.evaluate("i=>{ const b=document.querySelectorAll('#choices button')[i]; b&&b.click(); }", last); await pg.wait_for_timeout(600); continue
        if q['dlg']:
            t = (await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")).strip()
            if t and (not lines or lines[-1] != t): lines.append(t[:120])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        cap = await pg.evaluate("(()=>{ const e=document.getElementById('toast')||document.querySelector('.toast'); return e&&getComputedStyle(e).display!=='none'?(e.textContent||'').trim():''; })()")
        if cap and cap not in lines: lines.append('（字幕）' + cap[:120])
        if lines or opts:
            await pg.wait_for_timeout(500); break
        await pg.wait_for_timeout(300)
    return {'btn': btn, 'lines': lines, 'opts': opts}


async def part_table(pg, cdp):
    await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）')
    Ly = await lay(pg)
    if not R.check('[TABLE] 有 TINGZHOU_LAYOUT.stalls（kinds、list、gongguan）', bool(Ly and Ly['kinds']), J(Ly)[:300]): return
    A = all_stalls(Ly)
    R.note('[TABLE] 攤數：汀州路 %d、公館 %d；合計 %d' % (len(Ly['list']), len(Ly['gongguan']), len(A)))
    rows = ['| id | 攤名 | 在哪 | from | to | 買 | 只開星期 |', '|---|---|---|---|---|---|---|']
    for q in sorted(A, key=lambda q: (q['from'], q['to'])):
        rows.append('| %s | %s | %s %s | %s（%s） | %s（%s） | %s | %s |' % (q['id'], q['name'], q['zone'], q.get('where', ''), q['from'], hhmm(q['from']), q['to'], hhmm(q['to']), q['buy'], q['days'] or ''))
    open(os.path.join(OUT, 'nm_hours_table.md'), 'w', encoding='utf-8').write('\n'.join(rows) + '\n')
    R.note('[TABLE] 各攤開收時間（nm_hours_table.md）：\n' + '\n'.join(rows))
    R.check('[TABLE] 每一攤的時間不一樣（from／to 組合不全相同）', len({(q['from'], q['to']) for q in A}) > 1, '')
    for k, nm in BG.items():
        K = (Ly['kinds'] or {}).get(k)
        if K is None: R.check('[TABLE] 背景攤 %s 在配置裡' % k, False, ''); continue
        R.check('[TABLE] 背景攤 %s 的名字只寫賣的東西「%s」（沒有店名）、不能買' % (k, nm), K.get('name') == nm and not K.get('buy'), J(K))


async def part_shots(pg, cdp):
    await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[SHOTS] 有 stalls 配置', False, ''); return
    A = all_stalls(Ly); only = [x for x in (os.environ.get('STALLS') or '').split(',') if x]
    if only: A = [q for q in A if q['id'] in only]
    for q in A:
        fx, fz = math.sin(q['yaw']), math.cos(q['yaw'])
        for st, h in (('營業中', (q['from'] + q['to']) / 2), ('開之前', q['from'] - 1), ('收攤後', q['to'] + 0.5)):
            tag = '[SHOTS %s %s %s %s]' % (q['id'], q['name'], st, hhmm(h))
            await at(pg, cdp, q['zone'], h, q['x'] + fx * 1.9, q['z'] + fz * 1.9, '（%s 前面 1.9 m）' % q['name'], wait=7000)
            await pg.wait_for_timeout(2500)
            ss = await pg.evaluate(STALLS); g = next((s for s in ss if s['id'] == q['id']), None)
            if not R.check('%s 遊戲裡有這一攤' % tag, bool(g), J([s['id'] for s in ss])): continue
            want = st == '營業中'
            R.note('%s 讀的那一刻 G.hour %s、E.hour %s；照 TZ3.stallOpen(G.hour) 應該 %s；遊戲 isOpen %s' % (tag, g['gh'], g['eh'], g['expect'], g['isOpen']))
            exp = g['expect'] if g['expect'] is not None else want
            R.check('%s 模型和時間同步：isOpen＝stallOpen(G.hour)＝%s（open visible %s、closed visible %s）' % (tag, exp, g['openVis'], g['closedVis']), g['isOpen'] == exp and g['openVis'] == exp and g['closedVis'] == (not exp), J({k: g[k] for k in ('gh', 'eh', 'expect', 'isOpen', 'openVis', 'closedVis')}))
            if exp != want: R.note('%s 讀的時候時間已經走過邊界（排的是 %s、讀到 %s）：照讀到的時間判' % (tag, hhmm(h), g['gh']))
            if st == '營業中':
                if g['ob'] and g['cb']:
                    d = math.hypot(g['ob']['c'][0] - g['cb']['c'][0], g['ob']['c'][2] - g['cb']['c'][2])
                    R.note('%s 外框中心 open %s、closed %s，水平差 %.3f m（open 大小 %s、closed 大小 %s）' % (tag, g['ob']['c'], g['cb']['c'], d, g['ob']['s'], g['cb']['s']))
                    R.check('%s 開、收兩個模型的 position／rotation／scale 完全一樣（BB 00:14：攤子不能跳位置）' % tag, g['to'] is not None and g['to'] == g['tc'], J({'open': g['to'], 'closed': g['tc']}))
                    if d > 0.05: R.note('%s ★ 開、收兩個模型外框中心水平差 %.3f m（>5 cm；兩個模型擺的 position 一樣，差的是外形：收攤的外框比較小、偏一邊——照片 nm_%s_收攤後_正面 對照）' % (tag, d, q['id']))
                    R.note('%s 外框中心離配置位置 (%.2f,%.2f)：open %.2f m' % (tag, q['x'], q['z'], math.hypot(g['ob']['c'][0] - q['x'], g['ob']['c'][2] - q['z'])))
                else: R.check('%s 有 open、closed 兩個模型' % tag, False, J({'ob': g['ob'], 'cb': g['cb']}))
            R.note('%s 燈：open %s、closed %s（看得到的是 %s）' % (tag, J(g['litOpen']), J(g['litClosed']), 'open' if g['openVis'] else 'closed'))
            if st == '收攤後' and g['litClosed']: R.check('%s 收攤後模型沒有亮著的燈（Light＝0）' % tag, g['litClosed']['lights'] == 0, J(g['litClosed']))
            b = (g['ob'] if want else g['cb']) or g['ob'] or {'c': [q['x'], 1.2, q['z']], 'top': 2.6}
            cx, cz, top = b['c'][0], b['c'][2], b['top']
            V = [('正面', (cx + fx * 4.5, 1.6, cz + fz * 4.5), (cx, 1.2, cz), 50),
                 ('招牌近拍', (cx + fx * 2.2, max(1.6, top - 0.5), cz + fz * 2.2), (cx, top - 0.35, cz), 38),
                 ('招牌放大', (cx + fx * 2.2, max(1.6, top - 0.5), cz + fz * 2.2), (cx, top - 0.35, cz), 16)]
            for lab, frm, to, fov in V:
                save(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(to), 'fov': fov}), 'nm_%s_%s_%s.jpg' % (q['id'], st, lab))
            b2 = await pg.screenshot(type='jpeg', quality=80); open(os.path.join(OUT, 'nm_%s_%s_game.jpg' % (q['id'], st)), 'wb').write(b2)
            g2 = next((s for s in await pg.evaluate(STALLS) if s['id'] == q['id']), None)
            t = await talk(pg, cdp, tag)
            R.note('%s 互動：鍵「%s」→ %s；選項 %s（按的時候 G.hour %s、模型 isOpen %s）' % (tag, t['btn'], J(t['lines']), J(t['opts']), g2 and g2['gh'], g2 and g2['isOpen']))
            if st != '營業中':
                flat = ' '.join(sum(t['opts'], []))
                R.check('%s 沒營業時不能出現買的清單（選項裡沒有價錢／元）' % tag, not any(k in flat for k in ('元', '$')), J(t['opts']))
        R.check('[SHOTS %s] walkFallbacks 0' % q['id'], (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def pano(pg, cdp, zone, h, x, z, frm, to, name, fov=58):
    await at(pg, cdp, zone, h, x, z, '（全景 %s）' % name, wait=7000); await pg.wait_for_timeout(2500)
    save(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(to), 'fov': fov}), 'nmpano_%s_%s.jpg' % (name, hhmm(h)))
    ss = await pg.evaluate(STALLS); R.note('[PANO %s %s] 攤：%s' % (name, hhmm(h), J([(s['id'], s['isOpen']) for s in ss])))


async def part_pano(pg, cdp):
    for h in (20.0, 25.0): await pano(pg, cdp, 'tingzhou', h, 25.0, 0.0, (26.5, 2.2, 0.0), (6.0, 1.0, 0.0), '巷A')
    await pano(pg, cdp, 'tingzhou', 20.0, 1.5, -6.0, (1.5, 2.6, -5.0), (-4.2, 1.0, -18.0), '汀州路西側三攤')
    await pano(pg, cdp, 'tingzhou', 20.0, -1.5, 24.0, (-2.5, 2.4, 22.5), (4.5, 1.2, 33.0), '水源市場前')
    for h in (14.0, 20.0, 25.0): await pano(pg, cdp, 'gongguan', h, 34.0, 14.5, (8.0, 2.4, 6.5), (40.0, 1.0, 12.0), '公館人行道三攤', 60)


async def joy_walk(pg, cdp, pts, tag, leg_s=60):
    stuck = 0; ok = True; P2 = []
    for tx, tz in pts:   # r2：每一段先問遊戲的找路（E.pathTo）中途點，每 2 m 取一點
        me = await pg.evaluate(ME); lastp = P2[-1] if P2 else (me['x'], me['z'])
        wp = await pg.evaluate("(a=>{ const E=GAME.E, P=E.player; const r=E.pathTo?E.pathTo(a[0],a[1],P.lv|0,a[2],a[3],P.lv|0):null; return r?r.map(p=>Array.isArray(p)?[p[0],p[1]]:[p.x,p.z]):null; })", [lastp[0], lastp[1], tx, tz])
        if not wp: R.note('%s 找路找不到 (%.1f,%.1f)→(%.1f,%.1f)' % (tag, lastp[0], lastp[1], tx, tz)); P2.append((tx, tz)); continue
        acc = None
        for x, z in wp:
            if acc is None or math.hypot(x - acc[0], z - acc[1]) >= 2.0: P2.append((x, z)); acc = (x, z)
        if not P2 or P2[-1] != (tx, tz): P2.append((tx, tz))
    R.note('%s 中途點（照 E.pathTo）%d 個：%s' % (tag, len(P2), J([[round(a, 1), round(b, 1)] for a, b in P2][:40])))
    for tx, tz in P2:
        t0 = time.time(); last = (time.time(), None); side = 1; reached = False
        while time.time() - t0 < leg_s:
            s = await L.state(pg); d = math.hypot(tx - s['x'], tz - s['z'])
            if d < 0.8: reached = True; break
            if last[1] is None or math.hypot(s['x'] - last[1][0], s['z'] - last[1][1]) > 0.3: last = (time.time(), (s['x'], s['z']))
            elif time.time() - last[0] > 3:
                stuck += 1; side = -side; R.note('%s 卡住 3 秒：%s → 側推' % (tag, J({k: s[k] for k in ('x', 'z')})))
                await L.joystick(pg, cdp, side * 45, 0, 700); last = (time.time(), None); continue
            yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
            vx, vz = (tx - s['x']) / d, (tz - s['z']) / d; sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); m = math.hypot(sx, sy) or 1
            await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, 700 if d > 3 else 300)
        s = await L.state(pg)
        if not reached: R.check('%s 搖桿走到中途點 (%.1f,%.1f)（%.0f 秒）' % (tag, tx, tz, time.time() - t0), False, J({k: s[k] for k in ('x', 'z', 'zone')}))
        ok = ok and reached
    R.check('%s 照找路的中途點都走到（%d 個）' % (tag, len(P2)), ok, '')
    R.check('%s 卡住改側推 0 次（沒有隱形牆）' % tag, stuck == 0, '%d 次' % stuck)
    R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
    return ok


async def part_walk(pg, cdp):
    for h in (20.0, 25.0):
        await at(pg, cdp, 'tingzhou', h, 26.0, 0.0, '（巷 A 東端）', wait=7000)
        await joy_walk(pg, cdp, [(16.5, 0.0), (6.5, 0.0), (16.5, 0.0), (26.0, 0.0)], '[WALK 巷A %s]' % hhmm(h))
    await at(pg, cdp, 'gongguan', 20.0, 8.0, 20.0, '（公館騎樓西邊）', wait=7000)
    await joy_walk(pg, cdp, [(34.0, 20.0), (58.0, 20.0)], '[WALK 公館騎樓 2000]')
    await at(pg, cdp, 'gongguan', 20.0, 8.0, 13.5, '（公館人行道西邊）', wait=7000)
    await joy_walk(pg, cdp, [(34.0, 13.5), (58.0, 13.5)], '[WALK 公館人行道 2000]')


CAMCHK = r"""(id=>{ const E=GAME.E, cam=E.camera, P=E.player.obj; const z=E.zone||{}; const q=(z.tzStalls||z.ggStalls||[]).find(s=>s.id===id); if(!q||!q.open) return null;
  P.updateMatrixWorld(true); const head=new THREE.Vector3(); new THREE.Box3().setFromObject(P).getCenter(head); head.y+=0.5;
  const o=cam.position.clone(), dir=head.clone().sub(o); const L=dir.length(); dir.normalize(); const rc=new THREE.Raycaster(o,dir,0.05,L-0.2);
  const hits=rc.intersectObject(q.open,true).filter(h=>h.object.visible); const b=new THREE.Box3().setFromObject(q.open); const camIn=b.containsPoint(o);
  const bulbs=[]; q.open.traverse(m=>{ if(m.isMesh&&m.visible){ for(const mt of [].concat(m.material||[])){ if(mt&&mt.emissive&&(mt.emissive.r+mt.emissive.g+mt.emissive.b)>0.05){ const c=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()); bulbs.push([+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2),m.name||'']); break; } } } });
  return {cam:[+o.x.toFixed(2),+o.y.toFixed(2),+o.z.toFixed(2)], camInStallBox:camIn, blockHits:hits.length, firstHit:hits[0]?(hits[0].object.name||hits[0].object.type):null, playerVisible:P.visible, bulbs:bulbs.slice(0,8), isOpen:!!q.isOpen}; })"""


async def part_nmcam(pg, cdp):
    """BB 02:33 ④：營業中、搖桿走到攤前（照找路），兩張遊戲畫面（1.9 m、1.2 m）：人看得到、棚子不擋（鏡頭→玩家頭的射線不碰攤子模型、鏡頭不在攤子外框裡）；燈泡近拍（攤子發光材質中心）"""
    await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[NMCAM] 有 stalls 配置', False, ''); return
    A = all_stalls(Ly); want = [x for x in (os.environ.get('STALLS') or 'st_ball,st_eggcake').split(',') if x]
    rest = [q for q in A if q['id'] not in want]; import random; rnd = random.Random(int(os.environ.get('NMSEED') or '1111'))
    pick = [q for q in A if q['id'] in want] + rnd.sample(rest, min(int(os.environ.get('RANDN') or '2'), len(rest)))
    R.note('[NMCAM] 這次拍：%s' % J([(q['id'], q['name'], q['zone']) for q in pick]))
    for q in pick:
        fx, fz = math.sin(q['yaw']), math.cos(q['yaw']); h = min(q['from'] + 2.0, (q['from'] + q['to']) / 2)
        tag = '[NMCAM %s %s %s]' % (q['id'], q['name'], hhmm(h))
        await at(pg, cdp, q['zone'], h, q['x'] + fx * 6.0, q['z'] + fz * 6.0, '（%s 前面 6 m）' % q['name'], wait=7000)
        for dist in (1.9, 1.2):
            await joy_walk(pg, cdp, [(q['x'] + fx * dist, q['z'] + fz * dist)], '%s 走到攤前 %.1f m' % (tag, dist))
            await pg.wait_for_timeout(2000)
            c = await pg.evaluate(CAMCHK, q['id'])
            b2 = await pg.screenshot(type='jpeg', quality=82); open(os.path.join(OUT, 'nmcam_%s_%s_%.1fm.jpg' % (q['id'], hhmm(h), dist)), 'wb').write(b2)
            if not R.check('%s %.1f m 遊戲裡有這一攤、營業中' % (tag, dist), bool(c) and c['isOpen'], J(c)): break
            R.note('%s %.1f m 鏡頭 %s；射線碰到攤子 %d 次（%s）；鏡頭在攤子外框裡 %s' % (tag, dist, c['cam'], c['blockHits'], c['firstHit'], c['camInStallBox']))
            R.check('%s %.1f m 人看得到、棚子不擋（鏡頭→玩家頭不碰攤子、鏡頭不在攤子外框裡）' % (tag, dist), c['playerVisible'] and c['blockHits'] == 0 and not c['camInStallBox'], J(c))
        c = await pg.evaluate(CAMCHK, q['id'])
        R.note('%s 發光的零件（燈泡）%d 個：%s' % (tag, len(c['bulbs']) if c else 0, J(c and c['bulbs'])))
        for k, bl in enumerate((c or {}).get('bulbs', [])[:2]):
            frm = [bl[0] + fx * 0.9, bl[1] - 0.15, bl[2] + fz * 0.9]
            save(await pg.evaluate(SNAP, {'from': frm, 'at': bl[:3], 'fov': 40}), 'nmcam_%s_%s_燈泡%d.jpg' % (q['id'], hhmm(h), k + 1))
        if c and not c['bulbs']: R.note('%s ★ 這一攤沒有發光材質的零件（燈泡近拍改拍招牌上方）' % tag); save(await pg.evaluate(SNAP, {'from': [q['x'] + fx * 1.0, 2.0, q['z'] + fz * 1.0], 'at': [q['x'], 2.2, q['z']], 'fov': 45}), 'nmcam_%s_%s_燈泡0.jpg' % (q['id'], hhmm(h)))
        R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_oldpos(pg, cdp):
    warns = []; pg.on('console', lambda m: warns.append(m.text[:200]) if m.type in ('warning', 'warn') else None)
    Ly = None
    try: await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）'); Ly = await lay(pg)
    except Exception: pass
    pts = [('公館 ' + q['id'], 'gongguan', q['x'], q['z']) for q in ((Ly or {}).get('gongguan') or [])] or [('公館 st_milk', 'gongguan', 29.0, 11.2), ('公館 st_wheelcake', 'gongguan', 53.6, 11.2), ('公館 st_phonecase', 'gongguan', 15.0, 11.2)]
    pts.append(('巷A 中間', 'tingzhou', 14.5, 0.0))
    for lab, zn, x, z in pts:
        tag = '[OLDPOS %s (%.1f,%.1f)]' % (lab, x, z); del warns[:]
        await at(pg, cdp, zn, 20.0, x, z, '（舊存檔的 pos：這裡改版前沒有攤子）', wait=7000)
        me = await pg.evaluate(ME); mv = math.hypot(me['x'] - x, me['z'] - z)
        side_ok = (8.0 <= me['z'] <= 17.0) if zn == 'gongguan' else (-2.5 <= me['z'] <= 2.5 and 5.0 <= me['x'] <= 29.5)   # 公館人行道 z 8～17；巷 A z ±2.5
        R.check('%s 挪到攤子外面最近的可站格（挪 %.2f m ≤2.5 m）、還在同一側的%s、站得住（BB 00:14）' % (tag, mv, '人行道' if zn == 'gongguan' else '巷子', ), me['zone'] == zn and mv <= 2.5 and side_ok and me['stand'] is not False, J(me))
        p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, 45, 1000); me2 = await pg.evaluate(ME)
        R.check('%s 搖桿推得動（>0.3 m）' % tag, math.hypot(me2['x'] - p0[0], me2['z'] - p0[1]) > 0.3, J(me2))
        R.note('%s console warning 全文：%s' % (tag, J(warns)))
        uw = [w for w in warns if 'blocked cell' in w or 'unstick' in w or 'relocat' in w]
        ev = len([w for w in uw if w.startswith('unstick')]) or len(uw)   # r3：同一次 unstick 會印兩行（「unstick → [x,z]」＋「spawn was inside a blocked cell」）＝一則
        R.check('%s console 只有那一次 unstick（有挪＝1 次、沒挪＝0 次，沒有別的警告）' % tag, (ev == (1 if mv > 0.05 else 0)) and len(warns) == len(uw), J(warns))


async def part_fps(pg, cdp):
    for zn, x, z, name in (('tingzhou', 20.0, 0.0, '巷A'), ('gongguan', 30.0, 14.0, '公館人行道')):
        await at(pg, cdp, zn, 20.0, x, z, '（幀率）', wait=8000); await pg.wait_for_timeout(3000)
        R.note('[FPS %s 20:00] 8 秒 %s fps（PC GPU；SHA %s）' % (name, await pg.evaluate(FPS8), SHA))


async def part_edge(pg, cdp):
    """r2（第一輪 TEST_BUG：讀檔後到檢查之間遊戲時間走了約 3 分鐘，14:59 讀到時已經過了 15:00）：讀檔到邊界前 3 分鐘，之後不動、每 0.3 秒記 G.hour／isOpen／open visible，
    等時間自己走過邊界＋2 分鐘：翻轉要發生在邊界 ±1 分鐘內、模型 visible 和 isOpen 同步；翻轉前最後一刻、翻轉後第一刻各拍一張"""
    await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）'); Ly = await lay(pg)
    if not Ly: R.check('[EDGE] 有 stalls 配置', False, ''); return
    A = all_stalls(Ly); e = min(A, key=lambda q: q['from']); l = max(A, key=lambda q: q['to'])
    for q, b, lab in ((e, e['from'], '最早開'), (l, l['to'], '最晚收')):
        fx, fz = math.sin(q['yaw']), math.cos(q['yaw']); tag = '[EDGE %s %s %s %s]' % (lab, q['id'], q['name'], hhmm(b))
        await at(pg, cdp, q['zone'], b - 3 / 60.0, q['x'] + fx * 2.5, q['z'] + fz * 2.5, '（%s 邊界前 3 分鐘，之後讓時間自己走）' % lab, wait=4000)
        log, prev, flip, t0 = [], None, None, time.time()
        while time.time() - t0 < 60:
            g = next((s for s in await pg.evaluate(STALLS) if s['id'] == q['id']), None)
            if not g: break
            log.append((g['gh'], g['isOpen'], g['openVis']))
            if prev is not None and g['isOpen'] != prev['isOpen'] and flip is None:
                flip = (prev, g); save(await pg.evaluate(SNAP, {'from': [q['x'] + fx * 4.5, 1.6, q['z'] + fz * 4.5], 'at': [q['x'], 1.2, q['z']], 'fov': 50}), 'nmedge_%s_%s_after.jpg' % (lab, q['id']))
            elif flip is None:
                save(await pg.evaluate(SNAP, {'from': [q['x'] + fx * 4.5, 1.6, q['z'] + fz * 4.5], 'at': [q['x'], 1.2, q['z']], 'fov': 50}), 'nmedge_%s_%s_before.jpg' % (lab, q['id']))
            prev = g
            gadj = g['gh'] + (24 if b >= 24 and g['gh'] < 20 else 0)   # 跨午夜：G.hour 可能回到 0 或繼續加到 24 以上，兩種都換成同一條時間軸
            if gadj > b + 2 / 60.0: break
            await pg.wait_for_timeout(300)
        R.note('%s 紀錄（G.hour, isOpen, open visible）：%s' % (tag, J(log[:6] + ['…'] + log[-6:] if len(log) > 12 else log)))
        if not R.check('%s 時間走過邊界時翻轉了（%s）' % (tag, '開' if lab == '最早開' else '收'), bool(flip), J(log[-3:])): continue
        hb = flip[1]['gh'] + (24 if b >= 24 and flip[1]['gh'] < 20 else 0)
        R.check('%s 翻轉在邊界 ±1 分鐘內（翻轉時 G.hour %s；邊界 %s）' % (tag, flip[1]['gh'], b), abs(hb - b) <= 1 / 60.0 + 0.002, J(flip))
        R.check('%s 翻轉後 open 模型 visible 和 isOpen 同步' % tag, flip[1]['openVis'] == flip[1]['isOpen'] and flip[1]['isOpen'] == (lab == '最早開'), J(flip[1]))


RING = r"""(id=>{ const z=GAME.E.zone||{}, q=(z.tzStalls||[]).find(s=>s.id===id); let cal=null; try{ const c=CALENDAR.dateOf(GAME.G.day); cal={key:c.key, dow:(c.dow!=null?c.dow:(c.wd!=null?c.wd:new Date(c.key+'T00:00:00').getDay()))}; }catch(e){}
  return {zone:GAME.G.zone, day:GAME.G.day, cal, h:+(+GAME.G.hour).toFixed(3), off:z.tzStallOff?Object.keys(z.tzStallOff).filter(k=>z.tzStallOff[k]):null, isOpen:q?!!q.isOpen:null, openVis:q&&q.open?!!q.open.visible:null, closedVis:q&&q.closed?!!q.closed.visible:null}; })"""


async def ring_press(pg, cdp, tag, rx, rz, yaw):
    fx, fz = math.sin(yaw), math.cos(yaw)
    await L.go_to(pg, cdp, R, rx + fx * 1.9, rz + fz * 1.9, 0.7, '%s 走到套圈圈前面' % tag, max_s=120); await pg.wait_for_timeout(800)
    st = await pg.evaluate(RING, 'st_ring'); t = await talk(pg, cdp, tag)
    save(await pg.evaluate(SNAP, {'from': [rx + fx * 4.5, 1.6, rz + fz * 4.5], 'at': [rx, 1.2, rz], 'fov': 50}), 'nmring_%s.jpg' % tag.strip('[]').replace(' ', '_'))
    R.note('%s 狀態 %s；按下去：鍵「%s」→ %s' % (tag, J(st), t['btn'], J(t['lines'])))
    closed_txt = any(('收' in x or '帆布' in x or '箱子' in x) for x in t['lines'])
    R.check('%s 模型和按下去的字一致（模型 %s、字 %s）' % (tag, '開' if st['openVis'] else '收', '收攤那一句' if closed_txt else '營業'), st['openVis'] is not None and (st['openVis'] != closed_txt), J({'st': st, 'lines': t['lines']}))
    return st


async def part_ringsync(pg, cdp):
    """BB 00:14 ③：套圈圈只開週五六日（night_market3d.js S.sync 設 zone.tzStallOff）。非週五六日的晚上兩條路各一次：
    ① 從公館搖桿走進汀州路（巷 A）再走到套圈圈；② 直接讀一個存在汀州路裡的檔。都印星期、tzStallOff、isOpen、open／closed 哪個 visible、按下去的字。
    再在汀州路裡等到換日（週四 23:57 → 週五 00:01+）看 tzStallOff 自己翻不翻。RDAY＝週四的日期（預設 2025-11-06）。"""
    global DAY
    d0 = DAY; DAY = os.environ.get('RDAY') or '2025-11-06'
    try:
        await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）'); Ly = await lay(pg)
        q = next((x for x in (Ly or {}).get('list', []) if x['id'] == 'st_ring'), None)
        if not R.check('[RING] 配置有 st_ring', bool(q), ''): return
        # ① 公館 → 汀州路
        await at(pg, cdp, 'gongguan', 20.0, 37.1, 17.5, '（%s 週四 20:00，公館 G10 巷子口前）' % DAY)
        gate = next((i for i in await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden&&i.exit&&i.exit.to==='tingzhou').map(i=>({x:i.x,z:i.z,label:i.label})))()")), None)
        if R.check('[RING ①] 公館有往汀州路的巷口', bool(gate), ''):
            await L.go_to(pg, cdp, R, gate['x'], gate['z'], 0.8, '[RING ①] 走到巷口', max_s=60); await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#interact')
            for _ in range(60):
                if (await pg.evaluate(ME))['zone'] == 'tingzhou': break
                await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(2500); s1 = await ring_press(pg, cdp, '[RING ① 走進來]', q['x'], q['z'], q['yaw'])
        # ② 直接讀汀州路的檔
        await at(pg, cdp, 'tingzhou', 20.0, q['x'] + math.sin(q['yaw']) * 3, q['z'] + math.cos(q['yaw']) * 3, '（%s 週四 20:00，存檔在汀州路、套圈圈附近）' % DAY)
        await pg.wait_for_timeout(1500); s2 = await ring_press(pg, cdp, '[RING ② 讀檔]', q['x'], q['z'], q['yaw'])
        # 換日
        await at(pg, cdp, 'tingzhou', 23.95, q['x'] + math.sin(q['yaw']) * 3, q['z'] + math.cos(q['yaw']) * 3, '（週四 23:57，等換日）', wait=3000)
        log, t0 = [], time.time()
        while time.time() - t0 < 90:
            st = await pg.evaluate(RING, 'st_ring'); log.append([st['cal'] and st['cal'].get('key'), st['cal'] and st['cal'].get('dow'), st['h'], 'st_ring' in (st['off'] or []), st['isOpen'], st['openVis']])
            if st['h'] < 20 and st['h'] > 0.06: break
            if st['h'] >= 24.06: break
            await pg.wait_for_timeout(1000)
        R.note('[RING 換日] （日期、星期、G.hour、st_ring 在 tzStallOff、isOpen、open visible）：%s' % J(log[:3] + ['…'] + log[-4:] if len(log) > 8 else log))
        # BB 00:43：遊戲的一天不在午夜換，同一個晚上照同一天的星期算才對 → 改成「過 24 點規則不變」
        R.check('[RING 換日] 過 24 點規則不變：G.day 還是週四、st_ring 照舊在 tzStallOff、模型收著', bool(log) and all(r[3] is True and r[5] is False for r in log) and log[-1][2] > 24.0, J([log[0], log[-1]] if log else []))
    finally:
        DAY = d0


LMS = r"""(()=>{ const z=GAME.E.zone||{}, lm=z.tzLimao; if(!lm) return null; return {open:!!lm.open, h:+(+GAME.G.hour).toFixed(3), eh:GAME.E.hour!=null?+(+GAME.E.hour).toFixed(3):null,
  door:lm.door?{label:lm.door.label, exit:!!lm.door.exit}:null, tableOpen:lm.nodes&&lm.nodes.LIMAO_TABLE_open?!!lm.nodes.LIMAO_TABLE_open.visible:null}; })()"""


async def sync_one(pg, cdp, day, h, what, q):
    """一個時間、一樣東西：讀檔站在前面 → 記模型（或門）、isOpen、互動鍵、按下去第一句（門開著＝進店）"""
    global DAY
    DAY = day; tag = '[SYNC %s %s %s]' % (day, hhmm(h), what)
    if what == '禮貌生財':
        await at(pg, cdp, 'tingzhou', h, q['x'], q['z'] - 0.6, '（%s 門前）' % what, wait=6000); await pg.wait_for_timeout(1200)
        st0 = await pg.evaluate(LMS)
        if not st0: R.note('%s 這一版沒有 zone.tzLimao' % tag); return None
        await L.go_to(pg, cdp, R, q['x'], q['z'] - 0.3, 0.6, '%s 走到門前' % tag, max_s=30); await pg.wait_for_timeout(600)
        st = await pg.evaluate(LMS); btn = (await L.state(pg))['interact']
        z0 = await pg.evaluate("GAME.G.zone"); t = await talk(pg, cdp, tag); await pg.wait_for_timeout(1500); z1 = await pg.evaluate("GAME.G.zone")
        first = '（進到 %s）' % z1 if z1 != z0 else (t['lines'][0] if t['lines'] else '')
        model_open = st['open']; text_open = (z1 != z0) or btn.startswith('進')
        R.note('%s G.hour %s E.hour %s；lm.open %s、桌子 open visible %s、門 %s；鍵「%s」；按下去：%s' % (tag, st['h'], st['eh'], st['open'], st['tableOpen'], J(st['door']), btn, first))
        R.check('%s 門／桌子／按下去三樣一致（模型 %s、鍵 %s、按了 %s）' % (tag, '開' if model_open else '收', btn, '進店' if z1 != z0 else '沒進'), model_open == text_open and (st['tableOpen'] is None or st['tableOpen'] == model_open), '')
        return model_open
    fx, fz = math.sin(q['yaw']), math.cos(q['yaw'])
    await at(pg, cdp, 'tingzhou', h, q['x'] + fx * 1.9, q['z'] + fz * 1.9, '（%s 攤前）' % what, wait=6000); await pg.wait_for_timeout(1200)
    g = next((x for x in await pg.evaluate(STALLS) if x['id'] == q['id']), None)
    if not g: R.note('%s 遊戲裡沒有這一攤' % tag); return None
    btn = (await L.state(pg))['interact']; t = await talk(pg, cdp, tag)
    first = t['lines'][0] if t['lines'] else ''; opts = sum(t['opts'], [])
    closed_txt = any(('收' in x or '帆布' in x or '箱子' in x or '還沒' in x) for x in t['lines']) and not any('元' in o for o in opts)
    R.note('%s G.hour %s E.hour %s；isOpen %s、open visible %s、off %s；鍵「%s」；按下去：%s；選項 %s' % (tag, g['gh'], g['eh'], g['isOpen'], g['openVis'], g['off'], btn, J(t['lines'][:3]), J(opts)))
    R.check('%s 模型、isOpen、按下去三樣一致（模型 %s、isOpen %s、字 %s）' % (tag, '開' if g['openVis'] else '收', g['isOpen'], '收攤' if closed_txt else '營業'), g['openVis'] == g['isOpen'] and g['isOpen'] != closed_txt, J({'lines': t['lines'][:3], 'opts': opts}))
    return g['isOpen']


async def part_sync(pg, cdp):
    """BB 00:21 一（LAWWW 9ecfe0fad：場景原本用光線時間判開收、買東西照時鐘，冬天日落早模型提早開；改成都照時鐘）：
    冬天週五 2025-12-12、夏天週五 2026-07-10 各 17:30、18:30、19:30：烤玉米（18:00 開）、套圈圈、禮貌生財（19:00 開）——模型（門）、isOpen、互動鍵、按下去第一句三樣一致；
    冬天週四 2025-12-11 整晚（18:30、20:00、21:30）：套圈圈都是收攤樣、按下去是收攤那一句。"""
    global DAY
    d0 = DAY
    try:
        await at(pg, cdp, 'tingzhou', 20.0, None, None, '（讀配置）'); Ly = await lay(pg)
        LMq = await pg.evaluate("(()=>typeof TINGZHOU_LAYOUT!=='undefined'&&TINGZHOU_LAYOUT.limao?TINGZHOU_LAYOUT.limao.door:null)()")
        S_ = {q['id']: q for q in (Ly or {}).get('list', [])}
        T = [('烤玉米', S_.get('st_corn')), ('套圈圈', S_.get('st_ring')), ('禮貌生財', LMq)]
        for day, season in (('2025-12-12', '冬天週五'), ('2026-07-10', '夏天週五')):
            for h in (17.5, 18.5, 19.5):
                for what, q in T:
                    if q: await sync_one(pg, cdp, day, h, what, q)
        if S_.get('st_ring'):
            for h in (18.5, 20.0, 21.5):
                o = await sync_one(pg, cdp, '2025-12-11', h, '套圈圈', S_['st_ring'])
                R.check('[SYNC 2025-12-11 冬天週四 %s] 套圈圈是收攤樣（週四不擺）' % hhmm(h), o is False, str(o))
    finally:
        DAY = d0


async def main():
    print('CC NM1 夜市：PARTS %s；SHA %s；Playwright ≠ iPhone' % (','.join(PARTS), SHA), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('TABLE', part_table), ('SHOTS', part_shots), ('PANO', part_pano), ('WALK', part_walk), ('OLDPOS', part_oldpos), ('FPS', part_fps), ('EDGE', part_edge), ('RING', part_ringsync), ('SYNC', part_sync), ('NMCAM', part_nmcam)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
