"""CC-C 11-12：通用「照玩家走一條路線」探針（第一個用途：W1R＝QA-W1-VISUAL BB_398 的 A2／A3／B3～B6，BB-C 11:27 交排，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
【前置／捷徑】讀檔到 ZONE（DAY HOUR；有 X、Z 就站那裡，條件事件關掉）→ 照 ROUTE 一步一步做（+ 分隔），每一步完記：區域、層、位置、高度、站不站得住、坐著沒、
  鏡頭到祐廷頭部的射線被什麼擋（名字、距離）、互動鍵的字，截圖一張（route_<TAG>_<步>_<種類>.png）。
  ROUTE 的步驟：
    exit:<區域 id>          走到 exit.to＝那一區的出口（d141 use_exit：範圍裡站得住的點、按鈕對了才按）→ 等換區域
    go:<字>[><選項字>]       走到標籤含那個字的互動點（先找同一層）→ 按 → 對話一句一句點；選單選含<選項字>的（沒給＝第 1 個）→ 等 3 秒
    press:<字>[><選項字>]    同 go，但按下去以後先每 0.5 秒截一張、共 4 秒（看演出當下：躺上床、搭電梯），再點對話
    sit:<字>                 走到標籤含那個字的座位（D.sit_all only＝那一張：點椅子、看按鈕、坐下、位置高度、起身推得動）
    walk:<x>,<z>[,<lv>]      go_to 那一點
    sitat:<x>,<z>[,<lv>]     坐指定的那一張（座標 0.35 m 內、同一層；找不到＝FAIL_SETUP，不換別張）
    tapto:<x>,<z>[,<lv>]     只用點地走到那一點（一直點那一點的地面，點不到就轉鏡頭，最多 45 次）
    joyto:<x>,<z>[,<lv>]     只用搖桿走到那一點（cc_fn_lib.joy_to）
    look:<yaw>               鏡頭轉到那個方向（E.cam.yaw）再截一張（看牆、天花板）
    wait:<秒>
    burst:<名字>             站著不動每 0.25 秒截一張、共 2 秒（看閃）
    study:<字>,<次數>        W1R D5：走到標籤含那個字的座位（例：坐下讀書）按 → 坐下以後選單選「讀書…」那一個，重複 <次數> 次；每次記時間前後、#caption／#toast 的字、目標列，截圖（看時段用完跳下一時段、字幕）
11-12 r2：射線要設 rc.camera（場景裡有 Sprite，r1 SUNNY_DOOR_walk 在 STATE 噴 null.matrixWorld、沒有結論行）。
11-12 BB-C 15:18：walk、exit 兩種步驟每 0.5 秒記位置，連續 ≥5 秒沒位移（<0.15 m）記成卡住：座標、從第幾秒、卡多久（最後停在終點那一段不算）。
CC_02 清單 2026-11-13：1✓（日子時間照佇列：平日白天或晚上） 2✓（出口、互動點、座位照 exit.to／標籤從遊戲找） 3✓（每一支一次讀檔、照順序走） 4✓（選項照字） 5✓（go_to／use_exit 走過去，照玩家） 6✓（每一步 settle、換區等 2.5 秒） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：照原樣） 10✓（條件事件關掉） 11✓ 12✓（每一步同樣欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> ZONE=dorm [X= Z= LV=] [DAY=2025-10-14] [HOUR=14] ROUTE=exit:dorm_hall+go:樓梯+... python3 cc_route_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'x'
ZONE = os.environ.get('ZONE') or 'dorm'; DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 14)
X = os.environ.get('X'); Z = os.environ.get('Z'); LV = int(os.environ.get('LV') or 0)
ROUTE = [s for s in (os.environ.get('ROUTE') or '').split('+') if s]
R = L.Run('route_' + TAG, OUT); D.setup(R, OUT); F.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
STATE = r"""(()=>{ const E=GAME.E, G=GAME.G, P=E.player, o=P.obj, r2=v=>+(+v).toFixed(2); const cam=E.camera, cp=new THREE.Vector3(); cam.getWorldPosition(cp);
  const B=new THREE.Box3().setFromObject(o), head=new THREE.Vector3((B.min.x+B.max.x)/2, B.max.y-0.12, (B.min.z+B.max.z)/2), dir=head.clone().sub(cp), dist=dir.length(); dir.normalize();
  const rc=new THREE.Raycaster(cp,dir,0.02,Math.max(0.05,dist-0.2)); rc.camera=cam; const own=new Set(); o.traverse(x=>own.add(x));
  const hit=rc.intersectObjects(E.scene.children,true).filter(h=>h.object.isMesh&&h.object.visible!==false&&!own.has(h.object)&&!(h.object.material&&h.object.material.transparent&&h.object.material.opacity<0.3)).slice(0,3).map(h=>({name:String(h.object.name||'')+'<'+String((h.object.parent&&h.object.parent.name)||'')+'>', d:r2(h.distance)}));
  let stand=null; try{ stand=E.canStand?E.canStand(o.position.x,o.position.z,0.25,P.lv|0):null; }catch(e){}
  return {zone:G.zone, lv:P.lv|0, x:r2(o.position.x), z:r2(o.position.z), y:r2(o.position.y), yaw:r2(o.rotation.y), seat:!!P.seat, pose:P.pose||null, stand, h:r2(G.hour),
    cam:[r2(cp.x),r2(cp.y),r2(cp.z)], camToHead:r2(dist), blocked:hit, interact:(document.getElementById('interact')||{}).textContent||''}; })()"""
FIND = r"""(a=>{ const E=GAME.E, lv=E.player.lv|0; const L=E.interactables.map((i,ix)=>({i,ix})).filter(({i})=>!i.hidden&&(i.label||'').indexOf(a.t)>=0&&(!a.seat||i.seat));
  L.sort((p,q)=>((p.i.lv|0)!==lv)-((q.i.lv|0)!==lv)||Math.hypot(p.i.x-E.player.obj.position.x,p.i.z-E.player.obj.position.z)-Math.hypot(q.i.x-E.player.obj.position.x,q.i.z-E.player.obj.position.z));
  const f=L[0]; return f?{ix:f.ix, x:+f.i.x.toFixed(2), z:+f.i.z.toFixed(2), lv:f.i.lv|0, label:f.i.label, r:f.i.radius||null, seat:f.i.seat?[f.i.seat.x,f.i.seat.z]:null}:null; })"""
DLG = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy)}; })()"""


async def record(pg, k, kind, note=''):
    s = await pg.evaluate(STATE); name = 'route_%s_%02d_%s' % (TAG, k, kind)
    await pg.screenshot(path=os.path.join(OUT, name + '.png'))
    R.note('[%02d %s] %s 區域 %s lv%s (%s, %s) y=%s 站得住=%s 坐著=%s pose=%s；鏡頭 %s 到頭 %s m、被 %s 擋；互動鍵「%s」' % (k, kind, note, s['zone'], s['lv'], s['x'], s['z'], s['y'], s['stand'], s['seat'], s['pose'], s['cam'], s['camToHead'], J(s['blocked']), s['interact']))
    return s


async def talk(pg, cdp, want):
    lines = []
    for j in range(60):
        st = await pg.evaluate(DLG)
        if st['choices']:
            i = next((n for n, t in enumerate(st['choices']) if want and want in t), 0)
            lines.append('▶ ' + st['choices'][i] + '（' + ' / '.join(st['choices']) + '）')
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln: lines.append(ln)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 2: break
        await pg.wait_for_timeout(500)
    return lines


PATHSCAN = [float(v) for v in os.environ.get('PATHSCAN').split(',')] if os.environ.get('PATHSCAN') else None   # x0,z0,x1,z1,step
SEG_PICK = r"""((a)=>{ const E=GAME.E, cam=E.camera, P=E.player.obj.position, W=innerWidth, H=innerHeight; const L=E.zone&&E.zone.levelGroups; const fy=(L&&L[a.lv|0])?L[a.lv|0].y:0;
  const pr=(x,z)=>{ const v=new THREE.Vector3(x,fy,z).project(cam); return {sx:(v.x+1)/2*W, sy:(1-v.y)/2*H, z:v.z}; };
  const ok=q=>q.z<1&&q.sx>40&&q.sx<W-40&&q.sy>=120&&q.sy<H-40;
  const t=pr(a.tx,a.tz); if(ok(t)) return {x:a.tx, z:a.tz, seg:false, sy:Math.round(t.sy)};
  const dx=a.tx-P.x, dz=a.tz-P.z, D=Math.hypot(dx,dz)||1;
  for(const d of [12,9,7,5,3.5,2.5]){ if(d>=D) continue; const x=P.x+dx/D*d, z=P.z+dz/D*d, q=pr(x,z); if(ok(q)&&(!E.canStand||E.canStand(x,z,0.3,a.lv|0))) return {x:+x.toFixed(2), z:+z.toFixed(2), seg:true, sy:Math.round(q.sy)}; }
  return {x:null, seg:false, sy:Math.round(t.sy)}; })"""
STUCKSHOT = (os.environ.get('STUCKSHOT') or '0') == '1'   # 11-13 BB-C：卡住 4 秒當下截圖（遊戲鏡頭＋正上方往下看）＋列 1.2 m 內的網格，看是什麼擋住
NEAR_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position, mine=new Set(); E.player.obj.traverse(o=>mine.add(o)); const out=[]; const b=new THREE.Box3(), v=new THREE.Vector3();
  E.scene.traverse(o=>{ if(!o.isMesh||mine.has(o)||o.visible===false) return; try{ b.setFromObject(o); }catch(e){ return; } if(b.isEmpty()) return;
    const dx=Math.max(b.min.x-P.x,0,P.x-b.max.x), dz=Math.max(b.min.z-P.z,0,P.z-b.max.z); if(Math.hypot(dx,dz)>1.2||b.max.y<P.y+0.05||b.min.y>P.y+1.6) return;
    const sz=b.getSize(v); if(sz.x>40||sz.z>40) return; out.push({name:o.name||(o.parent&&o.parent.name)||'?', d:+Math.hypot(dx,dz).toFixed(2), box:[+b.min.x.toFixed(2),+b.max.x.toFixed(2),+b.min.z.toFixed(2),+b.max.z.toFixed(2),+b.min.y.toFixed(2),+b.max.y.toFixed(2)]}); });
  out.sort((a,b)=>a.d-b.d); const r2=v=>+(+v).toFixed(2), pl=E.player;
  const ppl=[].concat((E.npcs||[]).map(n=>['npc',n]),(E.extras||[]).map(n=>['extra',n])).map(([k,n])=>{ const o=n&&(n.obj||n.mesh||n.group); const p=o&&o.position; return p?{k, id:n.id||n.charId||n.name||'', x:r2(p.x), z:r2(p.z), d:r2(Math.hypot(p.x-P.x,p.z-P.z))}:null; }).filter(q=>q&&q.d<=3);
  return {at:[r2(P.x),r2(P.z)], lv:pl.lv|0, path:Array.isArray(pl.path)?pl.path.slice(0,12).map(q=>Array.isArray(q)?q.map(r2):[r2(q.x),r2(q.z)]):(pl.path??null), pathIdx:pl.pathIdx??pl.pi??null, target:pl.target?(pl.target.isVector3?[r2(pl.target.x),r2(pl.target.z)]:pl.target):null,
    lastS2F:window.__ccS2F||null, tapNoPath:(E.tapNoPath!==undefined?E.tapNoPath:null), people3m:ppl, near:out.slice(0,15)}; })()"""
# 11-13 LAWWW-C：記每一次點地 E.screenToFloor 的回傳（卡住那一刻給 LAWWW2）
S2F_HOOK = r"""(()=>{ const E=GAME.E; if(!E.__ccS2Fw&&E.screenToFloor){ const f0=E.screenToFloor; E.__ccS2Fw=true; E.screenToFloor=function(x,y){ const r=f0.apply(this,arguments); try{ window.__ccS2F={x:+(+x).toFixed(0), y:+(+y).toFixed(0), t:+performance.now().toFixed(0), r:r?(r.isVector3?[+r.x.toFixed(2),+r.y.toFixed(2),+r.z.toFixed(2)]:JSON.parse(JSON.stringify(r,(k,v)=>(v&&v.isVector3)?[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]:(v&&v.isObject3D)?(v.name||'obj'):v))):r}; }catch(e){} return r; }; } return !!E.__ccS2Fw; })()"""


async def stuck_shot(pg, tag, n):
    nm = 'stuck_%s_%d' % (TAG, n)
    await pg.screenshot(path=os.path.join(OUT, nm + '_game.png'))
    near = await pg.evaluate(NEAR_JS)
    p = near['at']
    try:
        await pg.evaluate(D.CAM, {'eye': [p[0], 10, p[1] + 0.01], 'look': [p[0], 0, p[1]], 'lens': 24}); await pg.wait_for_timeout(300); await pg.evaluate("GAME.E.render()")
        await pg.screenshot(path=os.path.join(OUT, nm + '_top.png'))
    finally:
        await pg.evaluate(D.UNCAM)
    R.note('%s 【卡住截圖】%s_game.png／_top.png；1.2 m 內的網格 %s' % (tag, nm, J(near)))


async def watched(pg, coro, tag):
    """11-12 BB-C 15:18：走路／走出口的同時每 0.5 秒記位置；連續 ≥5 秒位移 <0.15 m＝卡住（記座標、卡多久）。回傳 (coro 的結果, 卡住清單)"""
    pts = []; stop = [False]; shots = [0]
    async def loop():
        t0 = asyncio.get_event_loop().time(); still = None
        while not stop[0]:
            try:
                p = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(2), +o.z.toFixed(2), GAME.E.player.lv|0, GAME.G.zone]; })()")
                now = round(asyncio.get_event_loop().time() - t0, 1); pts.append([now] + p)
                if STUCKSHOT:
                    if still is None or ((p[0] - still[1]) ** 2 + (p[1] - still[2]) ** 2) ** 0.5 >= 0.15: still = [now, p[0], p[1], False]
                    elif now - still[0] >= 4 and not still[3] and shots[0] < 3: still[3] = True; shots[0] += 1; await stuck_shot(pg, tag, shots[0])
            except Exception:
                pass
            await asyncio.sleep(0.5)
    task = asyncio.ensure_future(loop())
    try: r = await coro
    finally:
        stop[0] = True; await task
    stuck = []; i = 0
    while i < len(pts):
        j = i
        while j + 1 < len(pts) and pts[j + 1][4] == pts[i][4] and ((pts[j + 1][1] - pts[i][1]) ** 2 + (pts[j + 1][2] - pts[i][2]) ** 2) ** 0.5 < 0.15: j += 1
        if pts[j][0] - pts[i][0] >= 5 and j < len(pts) - 1: stuck.append({'at': pts[i][1:4], 'zone': pts[i][4], 'from_s': pts[i][0], 'secs': round(pts[j][0] - pts[i][0], 1)})
        i = j + 1
    R.note('%s 【卡住偵測】取樣 %d 筆（每 0.5 秒）；連續 ≥5 秒沒位移 %d 次 %s' % (tag, len(pts), len(stuck), J(stuck)))
    if STUCKSHOT:   # 11-13 LAWWW-C：E.tapNoPath 計數（找不到路改走最近可達點）＋最後停的位置
        R.note('%s 走完：E.tapNoPath=%s；最後停在 %s' % (tag, await pg.evaluate("(GAME.E.tapNoPath!==undefined?GAME.E.tapNoPath:null)"), J(pts[-1] if pts else None)))
    return r, stuck



async def main():
    print('CC 照玩家走路線：TAG %s；SHA %s；%s %s %.1f；ROUTE %s' % (TAG, SHA or '?', ZONE, DAY, HOUR, ROUTE), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'steps': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        if X is not None: s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, x=float(X), z=float(Z), lv=LV, wait=7000)
        else: s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=7000)
        R.setup('【前置／捷徑】讀檔到 %s %s %.1f%s（條件事件關掉）' % (ZONE, DAY, HOUR, (' (%s, %s) lv%d' % (X, Z, LV)) if X is not None else '（出生點）'))
        if not R.check('讀到 %s' % ZONE, s['zone'] == ZONE, J(s)): await b.close(); sys.exit(1)
        if STUCKSHOT: R.note('screenToFloor 記錄：%s' % (await pg.evaluate(S2F_HOOK)))
        if PATHSCAN:   # 11-13 LAWWW-C：E.pathTo 起點到終點的回傳；再從起點往終點每 STEP m 試一次，記第一個回 null 的點（nav 格子斷在哪）
            ps = await pg.evaluate("""((a)=>{ const E=GAME.E, [x0,z0,x1,z1,st]=a, lv=E.player.lv|0, out={full:null, steps:[], firstNull:null};
              const pp=r=>r?{n:r.length, head:r.slice(0,3), tail:r.slice(-3)}:null;
              try{ out.full=pp(E.pathTo(x0,z0,lv,x1,z1,lv)); }catch(e){ out.full='ERR '+String(e).slice(0,80); }
              const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.ceil(L/st));
              for(let i=1;i<=n;i++){ const t=Math.min(1,i*st/L), x=x0+(x1-x0)*t, z=z0+(z1-z0)*t; let r=null; try{ r=E.pathTo(x0,z0,lv,x,z,lv); }catch(e){}
                const free=E.nav&&E.nav.free?!!E.nav.free(x,z):null, stand=E.canStand?!!E.canStand(x,z,0.3,lv):null;
                out.steps.push([+x.toFixed(2),+z.toFixed(2),r?r.length:null,free,stand]); if(!r&&out.firstNull===null) out.firstNull=[+x.toFixed(2),+z.toFixed(2)]; }
              return out; })""", PATHSCAN)
            R.note('E.pathTo 掃描 %s：%s' % (PATHSCAN, J(ps)))
        res['steps'].append({'k': 0, 'kind': 'start', 's': await record(pg, 0, 'start')})
        for k, step in enumerate(ROUTE, 1):
            kind, _, arg = step.partition(':'); t = '[%02d %s]' % (k, step); out = {'k': k, 'step': step}
            try:
                if kind == 'exit':
                    exs = await pg.evaluate("(to=>{ const P=GAME.E.player.obj.position; return GAME.E.interactables.filter(i=>i.exit&&String(i.exit.to||'').indexOf(to)===0&&!i.hidden).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)).map(i=>i.label); })", arg)   # 11-12 BB-C 16:33：最近的排第一（exit: 空字串＝最近的出口）
                    if not R.check('%s 找得到往 %s 的出口' % (t, arg), bool(exs), J(await pg.evaluate("GAME.E.interactables.filter(i=>i.exit).map(i=>[i.label,i.exit.to])"))): res['steps'].append(out); break
                    to = await pg.evaluate("(a=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.label===a.l&&!i.hidden); return i.exit.to; })", {'l': exs[0]})
                    s2, out['stuck'] = await watched(pg, D.use_exit(pg, cdp, t, exs[0], to), t)
                    out['s'] = await record(pg, k, 'exit', '出口「%s」→ %s' % (exs[0], to))
                    if not s2 or s2.get('zone') != to: res['steps'].append(out); break
                elif kind in ('go', 'sit', 'press'):
                    txt, _, want = arg.partition('>')
                    f = await pg.evaluate(FIND, {'t': txt, 'seat': kind == 'sit'})
                    if not R.check('%s 找得到標籤含「%s」的%s' % (t, txt, '座位' if kind == 'sit' else '互動點'), bool(f), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>[i.label,i.lv|0])"))): res['steps'].append(out); break
                    if kind == 'sit':
                        rs = await D.sit_all(pg, cdp, t, 'route_%s_%02d' % (TAG, k), only=[tuple(f['seat'])]); out['sit'] = rs
                        out['s'] = await record(pg, k, 'sit', '坐「%s」結果 %s' % (f['label'], J(rs)))
                    else:
                        await L.go_to(pg, cdp, R, f['x'], f['z'], 0.6, f['label'], max_s=120, lv=f['lv']); await D.settle(pg)
                        out['before'] = await record(pg, k, 'at', '走到「%s」(%s, %s) lv%s' % (f['label'], f['x'], f['z'], f['lv']))
                        await L.tap(pg, cdp, '#interact')
                        if kind == 'press':
                            mid = []
                            for j in range(8):
                                await pg.wait_for_timeout(500); mid.append(await record(pg, k, 'press%d' % j))
                            out['mid'] = mid
                        else: await pg.wait_for_timeout(1200)
                        out['lines'] = await talk(pg, cdp, want); await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
                        out['s'] = await record(pg, k, 'after', '按了「%s」：%s' % (f['label'], J(out['lines'])))
                elif kind == 'walk':
                    a = [float(v) for v in arg.split(',')]
                    _, out['stuck'] = await watched(pg, L.go_to(pg, cdp, R, a[0], a[1], 0.5, step, max_s=120, lv=int(a[2]) if len(a) > 2 else None), t); await D.settle(pg)
                    out['s'] = await record(pg, k, 'walk')
                elif kind == 'sitat':   # 11-12 BB-C 15:29：指定那一張（座標＋層）；0.35 m 內找不到＝FAIL_SETUP，不換別張
                    a = [float(v) for v in arg.split(',')]; lv_ = int(a[2]) if len(a) > 2 else 0
                    st_ = await pg.evaluate("(a=>{ const L=GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>({x:i.seat.x,z:i.seat.z,lv:(i.seat.lv!==undefined?i.seat.lv:i.lv)|0,label:String(typeof i.label==='function'?i.label():i.label||'')})); const m=L.filter(q=>q.lv===a.lv).map(q=>Object.assign(q,{d:Math.hypot(q.x-a.x,q.z-a.z)})).sort((p,q)=>p.d-q.d); return {best:m[0]||null, n:L.length}; })", {'x': a[0], 'z': a[1], 'lv': lv_})
                    b_ = st_.get('best')
                    if not R.check('%s FAIL_SETUP 檢查：找得到 (%s, %s) lv%d 那一張座位（0.35 m 內）' % (t, a[0], a[1], lv_), bool(b_) and b_['d'] <= 0.35, J(st_)): res['steps'].append(out); break
                    rs = await D.sit_all(pg, cdp, t, 'route_%s_%02d' % (TAG, k), only=[(b_['x'], b_['z'])]); out['sit'] = rs
                    out['s'] = await record(pg, k, 'sit', '坐指定那一張「%s」(%.2f, %.2f) lv%d 結果 %s' % (b_['label'], b_['x'], b_['z'], lv_, J(rs)))
                elif kind in ('tapto', 'joyto'):   # 11-12 BB-C 15:28：只用點地／只用搖桿走到那一點（tapto：一直點那一點的地面，點不到就轉鏡頭；joyto：fn_lib.joy_to 搖桿）
                    a = [float(v) for v in arg.split(',')]; lv_ = int(a[2]) if len(a) > 2 else None
                    if kind == 'joyto':
                        r_, out['stuck'] = await watched(pg, F.joy_to(pg, cdp, t, a[0], a[1], near=0.6, lv=lv_, max_s=90), t)
                        out['joy'] = {k: r_.get(k) for k in ('ok', 'why', 't', 'pushes')} if isinstance(r_, dict) else r_
                    else:
                        async def _taps():
                            # 11-13 BB-C（WZ_TAP_28＝TEST_BUG）：遠的目標投影到地平線、點到最上面 HUD 列（y 49）＝人不動。
                            # 目標在螢幕上 y<120 或出畫面：沿玩家→目標那條線找比較近、在畫面裡（y≥120）、站得住的點先點那裡（分段點），每次點的螢幕座標都記
                            n_ = 0; log_ = []
                            for _ in range(45):
                                p = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z,GAME.E.player.lv|0]; })()")
                                if ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) ** 0.5 < 0.6 and (lv_ is None or p[2] == lv_): return {'ok': True, 'taps': n_, 'log': log_[-12:]}
                                pick = await pg.evaluate(SEG_PICK, {'tx': a[0], 'tz': a[1], 'lv': lv_ if lv_ is not None else p[2]})
                                gx, gz = (pick['x'], pick['z']) if pick and pick.get('x') is not None else (a[0], a[1])
                                hit = await L.tap_ground(pg, cdp, gx, gz, lv=lv_); n_ += 1
                                log_.append({'n': n_, 'pl': [round(p[0], 2), round(p[1], 2)], 'goal': [round(gx, 2), round(gz, 2)], 'seg': bool(pick and pick.get('seg')), 'screen': hit and [round(hit.get('sx', -1)), round(hit.get('sy', -1))], 'proj': pick and pick.get('sy')})
                                await pg.wait_for_timeout(600)   # 11-13 LAWWW-C：點地找不到路的提示（「那邊過不去。」）有沒有跳
                                log_[-1]['toast'] = await pg.evaluate("(()=>{ const t=document.getElementById('toast'); return t&&t.offsetParent?(t.textContent||'').trim().slice(0,40):''; })()")
                                if log_[-1]['toast'] and n_ <= 3: await pg.screenshot(path=os.path.join(OUT, 'tap_toast_%s_%d.png' % (TAG, n_)))
                                if not hit: await L.turn_camera_to(pg, cdp, gx, gz)
                                await pg.wait_for_timeout(1400)
                            return {'ok': False, 'taps': n_, 'log': log_[-12:]}
                        out['tap'], out['stuck'] = await watched(pg, _taps(), t)
                    await D.settle(pg); out['s'] = await record(pg, k, kind, J(out.get('joy') or out.get('tap')))
                elif kind == 'look':
                    await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })", float(arg)); await pg.wait_for_timeout(700)
                    out['s'] = await record(pg, k, 'look', 'yaw=%s' % arg)
                elif kind == 'wait':
                    await pg.wait_for_timeout(int(float(arg) * 1000)); out['s'] = await record(pg, k, 'wait')
                elif kind == 'study':
                    txt, _, nn = arg.partition(','); nn = int(nn or 4)
                    f = await pg.evaluate(FIND, {'t': txt, 'seat': False})
                    if not R.check('%s 找得到「%s」' % (t, txt), bool(f), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>[i.label,i.lv|0])"))): res['steps'].append(out); break
                    await L.go_to(pg, cdp, R, f['x'], f['z'], 0.5, f['label'], max_s=120, lv=f['lv']); await D.settle(pg)
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                    rounds = []
                    for r_ in range(nn):
                        h0 = await pg.evaluate("+GAME.G.hour"); picked = None; seen = []
                        for j in range(40):
                            st = await pg.evaluate(DLG)
                            if st['choices']:
                                i = next((n_ for n_, x in enumerate(st['choices']) if x.startswith('讀書') or '讀書' in x), None)
                                if i is None or picked: i = next((n_ for n_, x in enumerate(st['choices']) if any(w in x for w in ('繼續', '好', '讀'))), 0) if not picked else next((n_ for n_, x in enumerate(st['choices']) if any(w in x for w in ('繼續', '好'))), 0)
                                picked = picked or st['choices'][i]; seen.append(st['choices'])
                                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(1200)
                                if picked and j > 0: break
                                continue
                            if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                            if picked: break
                            await pg.wait_for_timeout(500)
                        await pg.wait_for_timeout(1500)
                        cap = await pg.evaluate("(()=>({h:+(+GAME.G.hour).toFixed(2), day:GAME.G.day, cap:(document.getElementById('caption')||{}).textContent||'', toast:(document.getElementById('toast')||{}).textContent||'', goal:(document.getElementById('goal')||document.querySelector('.goal')||{}).textContent||'', seat:!!GAME.E.player.seat, study:(GAME.G.stats||{}).study}))()")
                        await pg.screenshot(path=os.path.join(OUT, 'route_%s_%02d_study_%d.png' % (TAG, k, r_ + 1)))
                        rounds.append({'h0': h0, 'picked': picked, 'menus': seen, 'after': cap})
                        R.note('%s 第 %d 次：選「%s」；時間 %.2f → %s；字幕「%s」；toast「%s」；目標列「%s」；還坐著 %s；stats.study %s' % (t, r_ + 1, picked, h0, cap['h'], cap['cap'], cap['toast'], cap['goal'][:80], cap['seat'], cap['study']))
                    out['study'] = rounds; out['s'] = await record(pg, k, 'study')
                elif kind == 'burst':
                    for j in range(8):
                        await pg.screenshot(path=os.path.join(OUT, 'route_%s_%02d_burst_%s_%d.png' % (TAG, k, arg, j))); await pg.wait_for_timeout(250)
                    out['s'] = await record(pg, k, 'burst')
                else:
                    R.note('%s 不認得的步驟' % t)
            except Exception as e:
                R.check('%s 沒有探針例外' % t, False, str(e)[:200]); res['steps'].append(out); break
            res['steps'].append(out)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'route_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
