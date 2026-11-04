"""CC（帳號 A）11-04：溫州街新室內截圖＋一盞坐墊（BB 07:43；b53bfab72：小路 v1f、SUNNY SIDE v1d、一盞 v1d＋前院）。
  SHOP=komichi|sunny|yizhan。【前置／捷徑】讀檔進店（出生點）、14:00 和 22:00（條件事件關閉）→ 等正式模型（有 glb 材質）→
  隱藏 HUD、玩家，固定鏡頭（E.cinematic）拍 VIEWS（第一張＝參考圖角度）→ 結束運鏡、等鏡頭回到玩家後面、確認鏡頭在房間裡才拍玩家視角（r1 的灰牆：鏡頭沒回來）。
  一盞另外：從溫州街門外看前院（讀檔到溫州街 (−20.5, 1.0) 看冠木門）、從前院看玄關、從緣側看院子。
  FLOOR=1（一盞）：每個 kind floor 的坐墊——走過去（點地面走路）→ 按「坐下…」→ 記姿勢（pose、hips 高度）、鏡頭位置、頭到鏡頭之間有沒有東西（raycast）、截圖
                  → 按「起身」或推搖桿站起來 → 站得住（canStand）、推得動 ≥0.3 m。
  只截圖和量，不判美術（BB 判）；Playwright（PC GPU），不是手機實機。
用法：LW_TESTS=<wt>/tests SHOP=yizhan [HOURS=14,22] [FLOOR=1] python3 cc_wz_shop_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
SHOPS = {
    'komichi': {'enter': (-4.8, -4.6, -2.4, '進去小路'), 'zone': 'wz_teishoku', 'mat': r'^(km_|komichi|a2[0-9]_)', 'glb': 'komichi', 'spawn': (-2.0, 3.05), 'box': (-4.0, 4.0, -4.0, 4.0, 2.9),
                'views': [('ref_east_to_west', [3.3, 1.6, 1.0], [-4.0, 1.2, 0.0]), ('door_in', [-2.0, 1.6, 3.6], [-0.5, 1.2, -4.0]),
                          ('bar', [0.5, 1.6, 0.6], [-1.0, 1.1, -3.5]), ('booth_west', [-1.0, 1.5, 0.2], [-4.0, 1.0, 0.0]),
                          ('window_seats', [0.5, 1.6, -0.8], [1.5, 1.0, 4.0]), ('kitchen', [1.5, 1.7, -0.6], [1.5, 1.6, -4.0]),
                          ('table_mid', [2.5, 1.7, 2.5], [0.0, 0.8, 0.0])]},
    'sunny': {'enter': (42.0, -4.6, -2.4, '進去 SUNNY SIDE'), 'zone': 'wz_brunch', 'mat': r'^(ss_|sunny|a2[0-9]_)', 'glb': 'sunnyside', 'spawn': (0.4, 4.0), 'box': (-3.2, 3.2, -5.0, 5.0, 3.2),
              'views': [('ref_door_in', [0.4, 1.6, 4.4], [0.0, 1.3, -5.0]), ('menu_kitchen', [0.0, 1.6, 1.0], [0.0, 2.0, -4.8]),
                        ('booth_left', [1.5, 1.5, 0.0], [-3.2, 1.0, 0.0]), ('right_window', [-1.0, 1.6, 0.5], [3.2, 1.2, 1.0]),
                        ('tables', [2.4, 1.7, 3.6], [-2.0, 0.8, -1.0]), ('counter', [-0.8, 1.6, 0.6], [2.4, 1.1, -1.8]),
                        ('kitchen', [-1.0, 1.7, -1.5], [1.0, 1.5, -5.0])]},
    'yizhan': {'enter': (-20.5, 4.6, 2.4, '進去一盞'), 'zone': 'wz_teahouse', 'mat': r'^(yz_|yizhan|a2[0-9]_|wzt_)', 'glb': 'yizhan', 'spawn': (-3.0, 9.0), 'box': (-4.2, 4.2, -5.0, 9.6, 2.6),
               'views': [('ref_genkan_ne', [-3.0, 1.5, 4.2], [3.0, 1.0, -1.0]), ('tea_table', [0.0, 1.4, 3.6], [-1.6, 0.3, 1.7]),
                         ('washitsu_A_in', [-1.0, 1.3, -1.4], [-3.2, 0.6, -4.6]), ('washitsu_B_in', [1.0, 1.3, -1.4], [3.2, 0.6, -4.6]), ('mizuya_east', [-1.0, 1.5, 0.5], [4.2, 1.2, 0.5]),
                         ('engawa', [-1.5, 1.4, 5.6], [4.2, 0.8, 5.6]), ('yard_to_genkan', [-0.5, 1.3, 8.8], [-3.0, 0.8, 4.6]),
                         ('engawa_to_yard', [1.0, 1.3, 5.6], [1.0, 0.0, 9.4]), ('pillar_base', [-0.4, 0.7, 4.6], [0.2, 0.05, 6.15]), ('yard_fence_w', [-1.5, 1.5, 8.2], [-4.0, 1.4, 13.0]), ('yard_fence_e', [2.0, 1.5, 8.2], [5.0, 1.4, 13.0])],   # BB 07:55：和室要進去拍；竹籬外一片白 → 從院子往外多拍兩張
               'street': ('street_gate', [-20.5, 1.7, 0.8], [-20.5, 1.4, 8.0])},
}
SH = SHOPS[os.environ.get('SHOP') or 'yizhan']
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls,tris:ri.triangles}; })"""
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
CAM = """(()=>{ const E=GAME.E, c=E.camera.position, P=E.player, p=P.obj.position; const head=new THREE.Vector3(p.x,(p.y||0)+1.45,p.z);
  const d=c.clone().sub(head); const L=d.length(); const rc=new THREE.Raycaster(head,d.clone().normalize(),0.05,Math.max(0.06,L-0.05)); const list=[]; E.scene.traverseVisible(o=>{ if(o.isMesh&&!o.isSprite) list.push(o); });
  const hits=[]; for(const o of list){ if(o===P.obj) continue; let me=false; for(let q=o;q;q=q.parent) if(q===P.obj){ me=true; break; } if(me) continue; try{ o.raycast(rc,hits); }catch(e){} } hits.sort((a,b)=>a.distance-b.distance);
  let hips=null; try{ const v=P.obj.userData&&P.obj.userData.vrm; const h=v&&v.humanoid&&v.humanoid.getNormalizedBoneNode('hips'); if(h) hips=+h.getWorldPosition(new THREE.Vector3()).y.toFixed(2); }catch(e){}
  return {mode:E.cam.mode, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+p.x.toFixed(2),+(p.y||0).toFixed(2),+p.z.toFixed(2)], dist:+L.toFixed(2), pose:P.pose||null, seat:!!P.seat, hips,
    between:hits.slice(0,4).map(h=>({mesh:h.object.name||'(無名)', mat:(h.object.material&&h.object.material.name)||'', d:+h.distance.toFixed(2)}))}; })()"""
MATS = "(rx=>{ const R=new RegExp(rx); let f=0; const names=new Set(); GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name){ names.add(o.material.name); if(R.test(o.material.name)) f++; } }); return {n:f, names:[...names].slice(0,60)}; })(%s)"


WATCH_JS = """(()=>{ const E=GAME.E, P=E.player, D=GAME.D||{}; const q=v=>{ try{ return typeof v==='function'?v():v; }catch(e){ return 'ERR'; } };
  return {seat:!!P.seat, busy:!!P.busy, pose:P.pose||(P.anim&&P.anim.pose)||null, busyDepth:q(D.busyDepth), lastTalkError:q(GAME.lastTalkError)||null,
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()).slice(0,6), dlg:!!document.querySelector('#dlg:not(.hide)'),
    interact:(document.querySelector('#interact')||{}).textContent||'', x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), entering:!!(GAME.isEntering&&GAME.isEntering()), zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(2)}; })()"""

def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, txt=''):
    print('INFO ' + name + (('  ' + txt) if txt else ''), flush=True)


def GI_hhmm(h): return '%02d:%02d' % (int(h) % 24, int(round((h % 1) * 60)))


def tag_of(h): return '%02d%02d' % (int(h), int(round((h % 1) * 60)))


def in_box(c):
    x0, x1, z0, z1, hh = SH['box']
    return x0 - 0.05 <= c[0] <= x1 + 0.05 and z0 - 0.05 <= c[2] <= z1 + 0.05 and c[1] <= hh + 0.05


def front_ok(c):
    """BB-C 11-04 SUNNY_seatfix 判定：和 [hhmm] 玩家視角同一套——鏡頭在房間裡，或在前牆外（門在 +z、前牆淡出的剖面視角，z ≤ z1＋5 m）都可以"""
    x0, x1, z0, z1, hh = SH['box']
    return x0 - 0.05 <= c[0] <= x1 + 0.05 and z0 - 0.05 <= c[2] <= z1 + 5.0


async def load(pg, cdp, zone, x, z, h, yaw=math.pi, keep=False):
    print('  [前置／捷徑] 讀檔：%s (%s, %s)、%s、%s' % (zone, x, z, tag_of(h), '條件事件照常（只關手機自動打開）、WZ_CAT_FOUND' if keep else '條件事件關閉'), flush=True)
    st = {'zone': zone, 'hour': h, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}}
    if keep: st['flags'] = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'WZ_CAT_FOUND': 3}
    if keep:   # 前院：冠木門的旁白是 STORY.onEnter 叫的，條件事件全關（quiet_events）會把它一起關掉 → 只關手機自動打開
        await L.load_state(pg, st, quiet_phone=True)
    else:
        await L.load_state(pg, st, quiet_events=True)
    last = -1; stable = 0; t0 = time.time()
    while time.time() - t0 < 90:
        await pg.wait_for_timeout(1000)
        n = await pg.evaluate("(()=>{ let n=0; if(GAME.E.zone&&GAME.E.zone.group) GAME.E.zone.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()")
        stable = stable + 1 if n == last else 0; last = n
        if stable >= 4: break
    await L.close_panels(pg, cdp)


async def player_view(pg, cdp, fn):
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    await pg.evaluate(HUD + '(true)')
    c = None
    for i in range(20):   # 鏡頭回到玩家後面：follow 模式、鏡頭在房間裡、離頭 1～6 m
        await pg.wait_for_timeout(500); c = await pg.evaluate(CAM)
        if c['mode'] != 'cinematic' and in_box(c['cam']) and 1.0 <= c['dist'] <= 6.5: break
    await pg.screenshot(path=os.path.join(OUT, fn))
    return c


async def run_hour(pg, cdp, h):
    tag = tag_of(h)
    print('== %s %s' % (os.environ.get('SHOP') or 'yizhan', tag), flush=True)
    sx, sz = SH['spawn']
    await load(pg, cdp, SH['zone'], sx, sz, h)
    m = await pg.evaluate(MATS % J(SH['mat']))
    print('  [%s] 材質（前 60）：%s' % (tag, J(m['names'])), flush=True)
    info('[%s] 符合 %s 的材質 mesh 數 %d（0＝材質名稱和我猜的不一樣，看上面的清單）' % (tag, SH['mat'], m['n']))
    await pg.evaluate(HUD + '(false)')
    res = {}
    for name, e, l in SH['views']:
        ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l))); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_%s.png' % (SH['glb'], tag, name)))
        res[name] = ri; print('  [%s] %s：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
    # r2（BB 07:5x）：讀檔只設人的方向、不設鏡頭 → 鏡頭在人前面（一盞塞在簷下）。玩家視角改成真的從溫州街走進店門
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"); await pg.evaluate(HUD + '(true)')
    ex, ez, sz2, lab = SH['enter']
    await load(pg, cdp, 'wenzhou', ex, sz2, h, yaw=(0 if ez > sz2 else math.pi))
    it = await pg.evaluate("(lb=>{ const i=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label}:null; })(%s)" % J(lab))
    if check('[%s] 溫州街有「%s」' % (tag, lab), bool(it), J(it)):
        await L.go_to(pg, cdp, L.Run('enter', OUT), it['x'], it['z'], max(0.4, it['r'] * 0.6), it['label'], max_s=120)
        await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % J(SH['zone'])): break
        await pg.wait_for_timeout(4000)
    c = await player_view(pg, cdp, '%s_%s_game.png' % (SH['glb'], tag))
    print('  [%s] 玩家視角鏡頭：%s' % (tag, J(c)), flush=True)
    zin = await pg.evaluate("GAME.G.zone===%s" % J(SH['zone']))
    x0, x1, z0, z1, hh = SH['box']
    front_ok = c and x0 - 0.05 <= c['cam'][0] <= x1 + 0.05 and z0 - 0.05 <= c['cam'][2] <= z1 + 5.0   # r3：門在 +z，跟隨鏡頭在前牆外（前牆淡出的剖面視角）是正常的
    if not zin: info('[%s] 玩家視角：沒有進到店裡（%s 這個時間可能沒開），只截了門口' % (tag, GI_hhmm(h)), J(c))
    else: check('[%s] 玩家視角：鏡頭回到玩家後面（房間裡或前牆外的剖面視角）' % tag, c and c['mode'] != 'cinematic' and front_ok and c['dist'] >= 1.0, J(c))
    if 'street' in SH:
        name, e, l = SH['street']
        await load(pg, cdp, 'wenzhou', -20.5, 1.0, h, yaw=0)
        await pg.evaluate(HUD + '(false)')
        ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l))); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_%s.png' % (SH['glb'], tag, name)))
        print('  [%s] %s（溫州街）：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
        await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"); await pg.evaluate(HUD + '(true)')
    return res


async def floor_seats(pg, cdp, allseats=False):
    print('== %s' % ('SEATS 全部座位' if allseats else 'FLOOR 一盞的坐墊'), flush=True)
    sx, sz = SH['spawn']
    await load(pg, cdp, SH['zone'], sx, sz, 14.0)
    seats = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,kind:i.seat.kind||null,sx:+(+i.seat.x).toFixed(2),sz:+(+i.seat.z).toFixed(2)})))()")
    print('  座位：%s' % J(seats), flush=True)
    fl = seats if allseats else [s for s in seats if s['kind'] == 'floor' or '坐墊' in s['label'] or '緣側' in s['label'] or '和室' in s['label'] or '喝茶' in s['label']]
    if allseats:   # BB 08:17：小路 v4 座位 18 張可坐、4 張 npcOnly 選不到
        lay = await pg.evaluate("(z=>{ const L=Object.values(WZ_SHOPS_LAYOUT).find(q=>q&&q.id===z); return L?(L.seats||[]).map(q=>({x:q.x,z:q.z,npc:!!q.npcOnly,label:q.label})):null; })(%s)" % J(SH['zone']))
        ok_n = [q for q in (lay or []) if not q['npc']]; npc = [q for q in (lay or []) if q['npc']]
        hit = [q for q in npc if any(abs(s['sx'] - q['x']) < 0.12 and abs(s['sz'] - q['z']) < 0.12 for s in seats)]
        want = int(os.environ.get('SEATS_N') or 0)
        if want: check('[SEATS] 配置裡玩家可坐的座位 %d 張（預期 %d）、互動點 %d 個' % (len(ok_n), want, len(seats)), len(ok_n) == want and len(seats) == want, J({'layout': len(ok_n), 'its': len(seats)}))
        check('[SEATS] npcOnly 的 %d 張沒有「坐下」按鈕' % len(npc), not hit, J(hit))
    check('[FLOOR] 有座位' if allseats else '[FLOOR] 有坐墊（kind floor）的座位', bool(fl), str(len(fl)))
    only = [t.strip() for t in (os.environ.get('SEAT_ONLY') or '').split(',') if t.strip()]   # BB-C 11-04：只重跑 F09,F12,F13
    sit_wait = float(os.environ.get('SIT_WAIT') or 2.5)   # BB-C 11-04：「坐下了」等待放寬到 6 秒
    watch = [t.strip() for t in (os.environ.get('STAND_WATCH') or '').split(',') if t.strip()]
    for k, s in enumerate(fl):
        tag = 'F%02d' % k
        if only and tag not in only: continue
        await L.go_to(pg, cdp, L.Run('cc', OUT) if hasattr(L, 'Run') else None, s['x'], s['z'], 0.35, s['label'], max_s=180)
        await pg.wait_for_timeout(800)
        st = await L.state(pg)
        if not check('[%s] 走到「%s」(%s, %s)：按鈕出現' % (tag, s['label'], s['sx'], s['sz']), st['interact'].startswith(s['label'][:2]), J({'interact': st['interact'], 'x': st['x'], 'z': st['z']})):
            continue
        await L.tap(pg, cdp, '#interact')
        for _ in range(30):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("!!GAME.E.player.seat&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(int(sit_wait * 1000))
        if sit_wait > 2.5 and not await pg.evaluate("!!GAME.E.player.seat"):
            print('  [%s] %s 秒還沒坐下：%s' % (tag, sit_wait, J(await pg.evaluate(WATCH_JS))), flush=True)
        c = await pg.evaluate(CAM)
        await pg.screenshot(path=os.path.join(OUT, '%s_seat_%s.png' % (SH['glb'], tag)))
        print('  [%s] 坐下：%s' % (tag, J(c)), flush=True)
        check('[%s] 坐下了（seat、pose）' % tag, c['seat'], J({'pose': c['pose'], 'hips': c['hips']}))
        info('[%s] 姿勢 pose＝%s、hips 高度 %s m（跪坐約 0.45～0.6；站著約 0.9～1.0；坐椅子約 0.55～0.7）' % (tag, c['pose'], c['hips']))
        check('[%s] 鏡頭在房間裡或前牆外的剖面視角、頭到鏡頭之間沒有東西' % tag, front_ok(c['cam']) and not c['between'], J({'cam': c['cam'], 'inRoom': in_box(c['cam']), 'between': c['between']}))
        _ch = await pg.evaluate("[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim())")
        if _ch:   # 11-04 CAFE230v3：坐下以後跳出選單（坐一下／點咖啡／起身），r1 沒選「起身」就推搖桿＝探針卡住
            _k = next((i for i, t in enumerate(_ch) if t.startswith('起身') or t.startswith('站起')), len(_ch) - 1)
            print('  坐下的選單：%s → %s' % (J(_ch), _ch[_k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (_k + 1)); await pg.wait_for_timeout(1500)
        async def _stand():
            lab = (await L.state(pg))['interact']
            print('  [%s] 起身前：互動鈕「%s」、%s' % (tag, lab, J(await pg.evaluate(WATCH_JS))), flush=True)
            if lab.startswith('起身') or lab.startswith('站起'):
                await L.tap(pg, cdp, '#interact')
            else:
                await L.joystick(pg, cdp, 0, 60, 800)
            await pg.wait_for_timeout(2000)
            moved, _, _ = await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=3)
            if moved < 0.3:
                for dx, dy in ((60, 0), (-60, 0), (0, -60)):
                    moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
                    if moved >= 0.3: break
            return moved
        if tag in watch:   # BB-C 11-04：F13 起身以後 40 分鐘沒有輸出——每 10 秒截圖＋記狀態，最多 3 分鐘
            async def _watch():
                for i in range(18):
                    await asyncio.sleep(10)
                    try:
                        w = await pg.evaluate(WATCH_JS)
                        await pg.screenshot(path=os.path.join(OUT, '%s_stand_%s_%03ds.png' % (SH['glb'], tag, (i + 1) * 10)))
                        print('  [%s] 起身 +%ds：%s' % (tag, (i + 1) * 10, J(w)), flush=True)
                    except Exception as e:
                        print('  [%s] 起身 +%ds 讀不到狀態：%r' % (tag, (i + 1) * 10, e), flush=True)
            wt = asyncio.ensure_future(_watch())
            try:
                moved = await asyncio.wait_for(_stand(), timeout=180)
            except asyncio.TimeoutError:
                moved = 0.0; check('[%s] 起身在 3 分鐘內完成（探針這一步沒有卡住）' % tag, False, J(await pg.evaluate(WATCH_JS)))
            wt.cancel()
        else:
            moved = await _stand()
        st = await L.state(pg)
        check('[%s] 站起來：不是坐著、站得住、推得動 ≥0.3 m' % tag, not await pg.evaluate("!!GAME.E.player.seat") and st['stand'] and moved >= 0.3, J({'moved': round(moved, 2), 'stand': st['stand'], 'x': st['x'], 'z': st['z'], 'pose': st.get('pose')}))


YARD_EXP = {'lantern': '（石燈籠的小窗口裡積了一點落葉。笠上長了一圈青苔。）',   # 14:00（18:00 前）；AA_659 第 3 節 bc021c7e1（雲端已逐字對照）
            'camphor': '（老樟樹的樹幹比你兩隻手合抱還粗。樹皮一條一條裂開，摸起來是乾的。）',
            'catbowl': '（樟樹下放著一個小碗，裡面的水是新換的。旁邊的石頭上黏著一小撮橘白色的毛。）',
            'gatesign': '（門柱上掛著一塊木牌，寫著「一盞」。字被太陽曬得有點淡了。）',
            'garden': ['踏石一塊一塊排到緣側前面。石縫裡的苔很綠，像是有人每天澆水。', '杜鵑、小楓樹、一棵老樟樹。院子不大，每一棵都站得剛剛好。']}
INTRO = '（推開冠木門，溫州街的聲音一下子小了。踏石一塊一塊排到玄關前面。）'
CAPTION = "(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')&&getComputedStyle(e).opacity!=='0'?(e.textContent||'').trim():''; })()"


async def talk_lines(pg, cdp, secs=40):
    lines = []; last = None; import time as _t; t0 = _t.time(); idle = None
    while _t.time() - t0 < secs:
        s = await pg.evaluate("(()=>{ const D=GAME.D||{}; return {dlg:!!D.active, depth:D.busyDepth|0, busy:!!GAME.E.player.busy, text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').trim(), ch:document.querySelectorAll('#choices:not(.hide) button').length}; })()")
        if s['ch']:
            await L.tap(pg, cdp, '#choices button:last-child'); await pg.wait_for_timeout(800); continue
        if s['dlg']:
            if s['text'] != last: last = s['text']; lines.append(s['text'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if not s['busy'] and s['depth'] == 0:
            idle = idle or _t.time()
            if _t.time() - idle > 2.0: break
        await pg.wait_for_timeout(300)
    return lines


async def enter_gate(pg, cdp, tag):
    ex, ez, sz2, lab = SH['enter']
    await load(pg, cdp, 'wenzhou', ex, sz2, 14.0, yaw=0, keep=True)
    it = await pg.evaluate("(lb=>{ const i=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label}:null; })(%s)" % J(lab))
    if not check('[%s] 溫州街有「%s」' % (tag, lab), bool(it), J(it)): return None
    await L.go_to(pg, cdp, L.Run('gate', OUT), it['x'], it['z'], max(0.4, it['r'] * 0.6), it['label'], max_s=120)
    await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact')
    cap = ''
    for _ in range(40):
        await pg.wait_for_timeout(250)
        c = await pg.evaluate(CAPTION)
        if c: cap = c
        if cap and await pg.evaluate("GAME.G.zone===%s" % J(SH['zone'])): break
    for _ in range(24):   # 旁白在進門後 0.7 秒才出來
        await pg.wait_for_timeout(250); c = await pg.evaluate(CAPTION)
        if c: cap = c
    return cap


async def yard(pg, cdp):
    print('== YARD 一盞前院（冠木門旁白、五個互動點）', flush=True)
    print('  [前置／捷徑] 讀檔時設 WZ_CAT_FOUND（找到貓了、還沒收養）＝貓碗看得到；WZ_TEA_YARD_IN 不設（第一次進前院）', flush=True)
    cap1 = await enter_gate(pg, cdp, 'YARD1')
    check('[YARD] 第一次從冠木門進來：旁白逐字＝AA_659', cap1 == INTRO, J(cap1))
    await pg.screenshot(path=os.path.join(OUT, 'yizhan_yard_first_in.png'))
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>!i.hidden&&['garden','lantern','camphor','catbowl','gatesign'].includes(i.kind)).map(i=>({x:i.x,z:i.z,r:i.radius||1,label:i.label,kind:i.kind})))()")
    print('  前院互動點：%s' % J(its), flush=True)
    check('[YARD] 五個互動點都在（看院子、石燈籠、樟樹、貓碗、木牌）', sorted(i['kind'] for i in its) == sorted(['garden', 'lantern', 'camphor', 'catbowl', 'gatesign']), J([i['kind'] for i in its]))
    for i in its:
        tag = 'YARD_' + i['kind']
        await L.go_to(pg, cdp, L.Run('yard', OUT), i['x'], i['z'], 0.35, i['label'], max_s=120); await pg.wait_for_timeout(700)
        st = await L.state(pg)
        if not check('[%s] 走到旁邊：按鈕「%s」' % (tag, i['label']), st['interact'] == i['label'], J({'interact': st['interact'], 'x': st['x'], 'z': st['z']})): continue
        await L.tap(pg, cdp, '#interact'); lines = await talk_lines(pg, cdp)
        exp = YARD_EXP[i['kind']]
        ok = any(l in exp for l in lines) if isinstance(exp, list) else (exp in lines)
        check('[%s] 台詞逐字＝AA_659' % tag, ok, J(lines))
        await pg.screenshot(path=os.path.join(OUT, 'yizhan_%s.png' % tag))
    # 第二次進門：先出到溫州街（走出冠木門）
    ex = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou'); return i?{x:i.x,z:i.z,r:i.radius||1,label:i.label}:null; })()")
    if ex:
        await L.go_to(pg, cdp, L.Run('yard', OUT), ex['x'], ex['z'], 0.4, ex['label'], max_s=120); await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("GAME.G.zone==='wenzhou'&&!GAME.E.player.busy"): break
    flag = await pg.evaluate("!!(GAME.G.flags||{}).WZ_TEA_YARD_IN")
    check('[YARD] 出來以後 WZ_TEA_YARD_IN 已經記下', flag)
    cap2 = await enter_gate2(pg, cdp)
    check('[YARD] 第二次進冠木門：沒有旁白', cap2 != INTRO, J(cap2))


async def enter_gate2(pg, cdp):
    ex, ez, sz2, lab = SH['enter']
    it = await pg.evaluate("(lb=>{ const i=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label}:null; })(%s)" % J(lab))
    if not it: return None
    await L.go_to(pg, cdp, L.Run('gate2', OUT), it['x'], it['z'], max(0.4, it['r'] * 0.6), it['label'], max_s=120)
    await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); cap = ''
    for _ in range(40):
        await pg.wait_for_timeout(250); c = await pg.evaluate(CAPTION)
        if c: cap = c
    return cap


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        res = {}
        for h in [float(x) for x in (os.environ.get('HOURS') or '14,22').split(',') if x.strip()]:
            res[str(h)] = await run_hour(pg, cdp, h)
        if os.environ.get('FLOOR') == '1':
            await floor_seats(pg, cdp)
        if os.environ.get('SEATS') == '1':
            await floor_seats(pg, cdp, allseats=True)
        if os.environ.get('YARD') == '1':
            await yard(pg, cdp)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump(res, open(os.path.join(OUT, 'shots_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
