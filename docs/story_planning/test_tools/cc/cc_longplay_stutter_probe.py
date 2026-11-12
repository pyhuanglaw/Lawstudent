"""CC-C 11-12：BUG-RUN-STUTTER-1112 第三輪「玩久了」（LAWWW-C 05:29）。判定歸 LAWWW／BB；這支只量數字。
前兩輪（站 5 秒／跑 10 秒／走 10 秒、四種 DSF）在 PC GPU 上都沒有「凍住再一大跳」，所以這輪量「換很多次區域以後」是不是變慢、東西有沒有越積越多。
【前置／捷徑】讀使用者存檔 tests/fixtures/user_save_day51_1110.json（遊戲工作樹裡的檔，fetch 讀），只改區域＝溫州街、時間＝HOUR；條件事件、手機自動打開關掉（STORY.TICKS 照跑）。
桌機視窗 VIEW（預設 2308x1064、DSF 1、has_touch 開、is_mobile 關＝使用者電腦 Chrome 大視窗＋觸控版面）。PC GPU 有視窗 ≠ 使用者那台；雲端 SwiftShader 數字不能用。
做法：
  ① 基準：溫州街，按「跑」，搖桿往最長的直線推 10 秒，記每一幀（同 cc_run_stutter_probe 的算法：>50 ms 次數、p95、凍住再一大跳）；記一次「量表」（下面）＋強制 GC 後的 heap。
  ② 照使用者的路線換區域（ROUTE，預設 18 站）：新生南路 → 大口進出 → 山嵐進出 → 溫州街 → 日常失速進出 → 林家進出 → 公館 → 汀州路 → 泰米進出 → 118 巷 → 一家飲料店進出 → 溫州街。
     每一站：有門（目前區域的出口 to＝下一站）就走過去按門（真的玩家做法）；沒有門（兩條街之間）用遊戲自己換區域的 GAME.enter（和門同一個函式，只是不用走路）＝標【捷徑】。
     這個版本沒有那個區域（例 dc3d 沒有泰米室內）＝記「跳過」不判。到了以後按「跑」推 5 秒，再記量表。
  ③ 回到溫州街：同 ① 再跑 10 秒，最後這 10 秒同時開 CDP Profiler（取樣 1 ms），回 self time 前 20 名（函式＋檔案:行）；原始 profile 存 .cpuprofile.json.gz。
  ④ 椰影大道 (2, −123.66)（LAWWW-C：nav.free 是 true、canStand 0.25 m 是 false）：讀檔到那一點，遊戲鏡頭拍一張＋另一台相機從 3 m 外往那一點拍一張，
     列半徑 3 m 內的場景物件（mesh.name、parent 名字、型別、材質名、水平距離、高度範圍），和那一點附近 0.25 m 格的 nav.free／canStand。
量表（每一站都記）：renderer.info.memory（geometries、textures）、programs 數、scene 物件總數（traverse）、E.npcs、E.extras、E.colliders、E.interactables 長度、
  performance.memory.usedJSHeapSize、每幀會跑的掛鉤（STORY.TICKS、E.lampGlows、E.ticks／GM.ticks／E.onTick 有就記）、ASSETS 的 clone 數（有就記）、GM.enterN。
輸出：longplay_<TAG>.json（每站量表、兩次 10 秒的統計、profiler 前 20）＋ run.log 總表＋ avenue_<TAG>_*.png。
CC_02 清單 2026-11-12：1✓（存檔、區域、時間都照 LAWWW-C 給的；條件事件關掉有寫） 2✓（區域代號從遊戲讀：出口的 to、GAME.enter 後讀 GAME.G.zone；飲料店從 118 巷出口名字有「茶／飲」的挑） 3✓（飲料店照出口順序試第一個；沒有就記跳過） 4✓（按門前看互動鍵的字＝D.use_exit） 5✓（走路用 D.use_exit：範圍裡站得住的點、分段、走不到附診斷） 6✓（換區域後等 2.5 秒、跑前看 runHold） 7✓（probe_lint、讀不到就 .get()） 8n/a（不判快慢：數字交 LAWWW；50 ms 門檻沿用 BB 04:23） 9✓（椰影大道兩張：遊戲鏡頭照原樣、另一台相機藏玩家） 10n/a（條件事件關掉、不走劇情選單） 11✓（SHA 40 碼由佇列給） 12✓（每站記「真的到了」zone、跑了幾 m） 13✓（每一站記走門還是捷徑、跳過的原因）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [VIEW=2308x1064 DSF=1 HOUR=17.58 RUN_S=10 HOP_S=5 ROUTE=a,b,…] python3 cc_longplay_stutter_probe.py <url> <out>"""
import os, sys, json, asyncio, math, statistics, gzip, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51_1110.json'
VIEW = os.environ.get('VIEW') or '2308x1064'
DSF = float(os.environ.get('DSF') or '1')
HOUR = float(os.environ.get('HOUR') or '17.58')
RUN_S = float(os.environ.get('RUN_S') or '10')
HOP_S = float(os.environ.get('HOP_S') or '5')
# 站名：區域代號；'@drink'＝118 巷出口名字有茶／飲的第一家
ROUTE = [z for z in (os.environ.get('ROUTE') or 'xinsheng,xs_dakou,xinsheng,xs_shanlan,xinsheng,wenzhou,wz_offbeat,wenzhou,wz_lin,wenzhou,gongguan,tingzhou,tz_taimi,tingzhou,lane118,@drink,lane118,wenzhou').split(',') if z]
AVE = [float(v) for v in (os.environ.get('AVE') or '2,-123.66').split(',')]
R = L.Run('longplay_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

REC_ON = r"""(()=>{ const E=GAME.E, P=E.player; window.__st={f:[], lt:[]}; window.__stOn=true;
  try{ if(!window.__stLT&&typeof PerformanceObserver!=='undefined'){ window.__stLT=new PerformanceObserver(l=>{ if(window.__stOn) for(const e of l.getEntries()) window.__st.lt.push([+e.startTime.toFixed(1), +e.duration.toFixed(1)]); }); window.__stLT.observe({entryTypes:['longtask']}); } }catch(e){}
  let last=null; const f=t=>{ if(!window.__stOn) return; const o=P.obj.position; window.__st.f.push([+t.toFixed(2), last==null?null:+(t-last).toFixed(2), +o.x.toFixed(4), +o.z.toFixed(4), !!P.runHold]); last=t; requestAnimationFrame(f); };
  requestAnimationFrame(f); return true; })()"""
REC_OFF = "(()=>{ window.__stOn=false; return window.__st; })()"
LINE_JS = r"""(()=>{ const E=GAME.E, o=E.player.obj.position; let best=null;
  for(let k=0;k<16;k++){ const a=k*Math.PI/8, dx=Math.sin(a), dz=Math.cos(a); let d=0; for(let s=0.5;s<=60;s+=0.5){ if(!E.canStand(o.x+dx*s,o.z+dz*s,0.3,E.player.lv|0)) break; d=s; } if(!best||d>best.d) best={d, dir:[+dx.toFixed(4),+dz.toFixed(4)], k}; }
  return best; })()"""
METRICS_JS = r"""(()=>{ const E=GAME.E, r=E.renderer, i=r&&r.info; let objs=0, meshes=0; E.scene.traverse(o=>{ objs++; if(o.isMesh) meshes++; });
  const len=a=>Array.isArray(a)?a.length:(a&&typeof a==='object'&&typeof a.size==='number'?a.size:null);
  const hooks={}; const cand={'STORY.TICKS':typeof STORY!=='undefined'?STORY.TICKS:null, 'E.ticks':E.ticks, 'E.onTick':E.onTick, 'E.lampGlows':E.lampGlows, 'E.seats':E.seats, 'GAME.ticks':GAME.ticks, 'GAME.extras':GAME.extras, 'E.exits':E.exits};
  for(const k in cand){ const n=len(cand[k]); if(n!=null) hooks[k]=n; }
  let clones=null; try{ if(typeof ASSETS!=='undefined'){ const c=ASSETS.clones||ASSETS._clones||ASSETS.pool; clones=len(c); if(clones==null&&c&&typeof c==='object') clones=Object.keys(c).length; } }catch(e){}
  const pm=performance.memory;
  return {zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(2), enterN:GAME.enterN|0, geoms:i&&i.memory?i.memory.geometries:null, tex:i&&i.memory?i.memory.textures:null, programs:i&&i.programs?i.programs.length:null,
    objs, meshes, npcs:len(E.npcs), extras:len(E.extras), colliders:len(E.colliders), inter:len(E.interactables), hooks, clones, heapMB:pm?+(pm.usedJSHeapSize/1048576).toFixed(1):null, heapTotMB:pm?+(pm.totalJSHeapSize/1048576).toFixed(1):null,
    calls:i&&i.render?i.render.calls:null, tris:i&&i.render?i.render.triangles:null}; })()"""
EXITS = r"""(()=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, to:i.exit.to, x:+i.x.toFixed(2), z:+i.z.toFixed(2)})))()"""
AVE_JS = r"""(a=>{ const E=GAME.E, V=new THREE.Vector3(), B=new THREE.Box3(), out=[]; const px=a[0], pz=a[1], f=v=>+(+v).toFixed(2);
  E.scene.traverse(o=>{ if(!o.isMesh&&!o.isInstancedMesh&&!o.isLine&&!o.isPoints) return; try{ B.setFromObject(o); }catch(e){ return; } if(B.isEmpty()) return;
    const dx=Math.max(B.min.x-px,0,px-B.max.x), dz=Math.max(B.min.z-pz,0,pz-B.max.z), d=Math.hypot(dx,dz); if(d>3) return;
    const big=(B.max.x-B.min.x)>40||(B.max.z-B.min.z)>40; const m=Array.isArray(o.material)?o.material[0]:o.material;
    out.push({name:String(o.name||'').slice(0,40), parent:String(o.parent&&o.parent.name||'').slice(0,40), gp:String(o.parent&&o.parent.parent&&o.parent.parent.name||'').slice(0,30), type:o.type, mat:String(m&&m.name||'').slice(0,30), d:f(d), y:[f(B.min.y),f(B.max.y)], size:[f(B.max.x-B.min.x),f(B.max.z-B.min.z)], big, visible:o.visible}); });
  out.sort((p,q)=>p.d-q.d); const grid=[]; const lv=E.player.lv|0;
  for(let ix=-2;ix<=2;ix++) for(let iz=-2;iz<=2;iz++){ const x=px+ix*0.25, z=pz+iz*0.25; grid.push([f(x),f(z), E.nav&&E.nav.free?!!E.nav.free(x,z):null, !!E.canStand(x,z,0.25,lv), !!E.canStand(x,z,0.3,lv)]); }
  const cols=[]; for(const c of (E.colliders||[])){ const b=c.box||c.b||c; const cx=b.min&&b.max?(b.min.x+b.max.x)/2:(c.x!=null?c.x:null), cz=b.min&&b.max?(b.min.z+b.max.z)/2:(c.z!=null?c.z:null); if(cx==null) continue; const d=Math.hypot(cx-px,cz-pz); if(d<4) cols.push({name:String(c.name||(c.obj&&c.obj.name)||c.kind||'').slice(0,40), cx:f(cx), cz:f(cz), d:f(d)}); }
  return {n:out.length, objs:out.slice(0,60), grid_x_z_navfree_can025_can03:grid, colliders:cols.slice(0,10), colliders_total:(E.colliders||[]).length}; })"""
SNAP_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 600); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const pv=E.player.obj.visible; E.player.obj.visible=false; try{ r.render(E.scene,cam); } finally { E.player.obj.visible=pv; } return c.toDataURL('image/png'); })"""
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"


def stats(frames):
    dts = [f[1] for f in frames if f[1] is not None]
    if not dts: return {'frames': len(frames)}
    s = sorted(dts); n = len(s); q = lambda p: s[min(n - 1, int(p * n))]
    mv = [math.hypot(frames[i][2] - frames[i - 1][2], frames[i][3] - frames[i - 1][3]) for i in range(1, len(frames))]
    med = statistics.median([m for m in mv if m > 1e-4] or [0])
    fj = 0; i = 0
    while i < len(mv):
        if mv[i] < 1e-4:
            j = i
            while j < len(mv) and mv[j] < 1e-4: j += 1
            if j - i >= 2 and j < len(mv) and med > 0 and mv[j] >= 3 * med: fj += 1
            i = j
        else: i += 1
    tot = sum(dts) / 1000.0
    return {'frames': len(frames), 'secs': round(tot, 2), 'fps': round(len(dts) / tot, 1) if tot else None, 'gt50': sum(1 for d in dts if d > 50), 'gt33': sum(1 for d in dts if d > 33.4),
            'max_ms': round(s[-1], 1), 'p50': round(q(0.5), 1), 'p95': round(q(0.95), 1), 'p99': round(q(0.99), 1), 'dist_m': round(sum(mv), 2), 'freeze_then_jump': fj,
            'runHold_frames': sum(1 for f in frames if f[4])}


def top_self(prof, n=20):
    """CDP Profiler.stop 的 profile → self time 前 n 名（函式、檔案:行）"""
    nodes = {nd['id']: nd for nd in prof.get('nodes', [])}
    samples, deltas = prof.get('samples', []), prof.get('timeDeltas', [])
    acc = {}
    for k, sid in enumerate(samples):
        dt = deltas[k + 1] if k + 1 < len(deltas) else (deltas[k] if k < len(deltas) else 0)
        acc[sid] = acc.get(sid, 0) + max(dt, 0)
    agg = {}; total = sum(acc.values()) or 1
    for sid, us in acc.items():
        cf = nodes.get(sid, {}).get('callFrame', {})
        url = cf.get('url', '') or ''
        key = (cf.get('functionName') or '(anonymous)', url.split('/')[-1].split('?')[0], (cf.get('lineNumber', -1) or 0) + 1)
        agg[key] = agg.get(key, 0) + us
    rows = sorted(agg.items(), key=lambda kv: -kv[1])[:n]
    return {'total_ms': round(total / 1000, 1), 'top': [{'fn': k[0], 'file': k[1], 'line': k[2], 'self_ms': round(v / 1000, 1), 'pct': round(v * 100 / total, 1)} for k, v in rows]}


async def main():
    print('CC LONGPLAY-STUTTER：TAG %s；SHA %s；VIEW %s DSF %s；%d 站；Playwright ≠ 使用者那台' % (TAG, SHA or '?', VIEW, DSF, len(ROUTE)), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'view': VIEW, 'dsf': DSF, 'route': ROUTE, 'hops': []}
    async with async_playwright() as p:
        w, h = [int(v) for v in VIEW.lower().split('x')]
        kw = {'executable_path': '/opt/pw-browsers/chromium'} if os.path.exists('/opt/pw-browsers/chromium') else {}   # 雲端才用（電腦那台 gpu_wrap 處理瀏覽器和 GPU 參數）
        b = await p.chromium.launch(args=L.ARGS + ['--enable-precise-memory-info'], **kw)
        ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=DSF, has_touch=True, is_mobile=False)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        R.setup('【前置／捷徑】桌機視窗 %dx%d、DSF %s、has_touch 開、is_mobile 關（使用者是電腦 Chrome 大視窗＋觸控版面）' % (w, h, DSF))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        res['renderer'] = await pg.evaluate("(()=>{ try{ const g=GAME.E.renderer.getContext(); const x=g.getExtension('WEBGL_debug_renderer_info'); return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER); }catch(e){ return String(e); } })()")
        R.note('WebGL：%s' % res['renderer'])
        sv0 = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('讀得到使用者存檔 %s' % FIX, bool(sv0), ''): await b.close(); sys.exit(1)

        async def apply(zone, hour, pos=None):
            sv = json.loads(json.dumps(sv0)); sv['zone'] = zone; sv['hour'] = hour; sv['weather'] = 'clear'
            if pos: sv['pos'] = pos
            else: sv.pop('pos', None)
            await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })", sv)
            await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
            return await D.st(pg)

        async def metrics():
            try: return await pg.evaluate(METRICS_JS)
            except Exception as e: return {'error': repr(e)[:200]}

        async def gc_heap():
            try:
                await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage'); await pg.wait_for_timeout(500)
                return await pg.evaluate("performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null")
            except Exception as e: return 'ERR %r' % e

        async def run_for(secs, label, profile=False):
            dr = await pg.evaluate(LINE_JS)
            if not await pg.evaluate("!!GAME.E.player.runHold"): await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(400)
            wx, wz = dr['dir']
            yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
            sx, sy = wx * rx + wz * rz, -(wx * fx + wz * fz); m = math.hypot(sx, sy) or 1
            prof = None
            if profile:
                await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 1000}); await cdp.send('Profiler.start')
            await pg.evaluate(REC_ON)
            await L.joystick(pg, cdp, sx / m * 50, sy / m * 50, int(secs * 1000))
            d = await pg.evaluate(REC_OFF)
            if profile:
                prof = (await cdp.send('Profiler.stop')).get('profile', {})
            st = stats(d['f']); st['longtasks'] = len(d['lt']); st['longtask_max'] = max([x[1] for x in d['lt']] or [0]); st['line_m'] = dr.get('d')
            R.note('%s 跑 %.0f 秒：%s' % (label, secs, J(st)))
            return st, prof

        # ① 基準
        s = await apply('wenzhou', HOUR)
        R.setup('【前置／捷徑】讀使用者存檔 %s（day %s），只改區域 wenzhou、%.2f 時；條件事件、手機自動打開關掉（STORY.TICKS 照跑）' % (FIX, sv0.get('day'), HOUR))
        if not R.check('① 讀到溫州街', s['zone'] == 'wenzhou', J(s)): await b.close(); sys.exit(1)
        await pg.wait_for_timeout(2000)
        res['base_metrics'] = await metrics(); res['base_heap_gc'] = await gc_heap()
        res['base_run'], _ = await run_for(RUN_S, '① 基準 溫州街')
        res['base_metrics_after'] = await metrics()
        R.note('① 基準量表 %s；GC 後 heap %s MB' % (J(res['base_metrics']), res['base_heap_gc']))

        # ② 路線
        for k, want in enumerate(ROUTE):
            cur = (await D.st(pg))['zone']; tag = '② 第 %d 站 %s→%s' % (k + 1, cur, want)
            exs = await pg.evaluate(EXITS)
            if want == '@drink':
                ex = next((e for e in exs if any(c in e['label'] for c in ('茶', '飲'))), None)
                if not ex:
                    R.note('%s 118 巷出口裡沒有名字有「茶／飲」的店：跳過（出口 %s）' % (tag, J([e['label'] for e in exs][:20]))); res['hops'].append({'k': k + 1, 'want': want, 'skip': 'no drink exit'}); continue
                want = ex['to']
            else:
                ex = next((e for e in exs if e['to'] == want), None)
            how = None
            if ex:
                s2 = await D.use_exit(pg, cdp, tag, ex['label'][:4], want)
                how = 'door'
                if not s2 or s2.get('zone') != want: how = 'door_failed'
            if how != 'door':
                ok = await pg.evaluate("(async z=>{ if(!GAME.enter) return 'no GAME.enter'; try{ await GAME.enter(z); return GAME.G.zone; }catch(e){ return 'ERR '+String(e).slice(0,120); } })", want)
                await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
                how = (how + '+' if how else '') + 'shortcut'
                if ok != want:
                    R.note('%s 這個版本換不到 %s（%s）：跳過不判' % (tag, want, ok)); res['hops'].append({'k': k + 1, 'want': want, 'skip': str(ok)})
                    continue
                R.setup('%s 【捷徑】沒有直接的門：用 GAME.enter(%s)（門用的同一個函式，只是不走路）' % (tag, want))
            await pg.wait_for_timeout(2500)
            st, _ = await run_for(HOP_S, tag)
            m = await metrics()
            res['hops'].append({'k': k + 1, 'want': want, 'how': how, 'run': st, 'm': m})
            R.note('%s（%s）量表 %s' % (tag, how, J(m)))

        # ③ 回到溫州街
        cur = (await D.st(pg))['zone']
        if cur != 'wenzhou':
            await pg.evaluate("(async z=>{ try{ await GAME.enter(z); }catch(e){} })", 'wenzhou'); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
            R.setup('③ 【捷徑】最後一站不是溫州街，用 GAME.enter 回溫州街')
        R.check('③ 回到溫州街', (await D.st(pg))['zone'] == 'wenzhou', '')
        await pg.wait_for_timeout(2000)
        res['end_metrics'] = await metrics(); res['end_heap_gc'] = await gc_heap()
        res['end_run'], prof = await run_for(RUN_S, '③ 換 %d 次區域以後 溫州街' % len(res['hops']), profile=True)
        res['end_metrics_after'] = await metrics()
        if prof:
            res['profile_top'] = top_self(prof)
            with gzip.open(os.path.join(OUT, 'longplay_%s.cpuprofile.json.gz' % TAG), 'wt', encoding='utf-8') as f: f.write(json.dumps(prof))
            R.note('③ 最後 10 秒 self time 前 20 名（共 %s ms）：\n%s' % (res['profile_top']['total_ms'], '\n'.join('  %5.1f%%  %7.1f ms  %s  %s:%s' % (r['pct'], r['self_ms'], r['fn'], r['file'], r['line']) for r in res['profile_top']['top'])))
        b0, b1 = res['base_run'], res['end_run']
        R.note('【總表】基準 fps %s／>50ms %s／p95 %s／凍住再一大跳 %s → 換區以後 fps %s／>50ms %s／p95 %s／凍住再一大跳 %s；GC 後 heap %s → %s MB；量表 %s → %s' % (
            b0.get('fps'), b0.get('gt50'), b0.get('p95'), b0.get('freeze_then_jump'), b1.get('fps'), b1.get('gt50'), b1.get('p95'), b1.get('freeze_then_jump'),
            res['base_heap_gc'], res['end_heap_gc'], J(res['base_metrics']), J(res['end_metrics'])))
        R.check('②③ 真的換了區域、真的在跑（站數 %d、最後跑 %.1f m）' % (len([x for x in res['hops'] if 'm' in x]), b1.get('dist_m') or 0),
                len([x for x in res['hops'] if 'm' in x]) >= 12 and (b1.get('dist_m') or 0) > 3, J([[x['k'], x['want'], x.get('how') or x.get('skip')] for x in res['hops']]))

        # ④ 椰影大道
        try:
            s = await apply('campus', 14.0, {'x': AVE[0], 'z': AVE[1] + 1.5, 'yaw': 0.0, 'lv': 0})
            R.setup('④ 【前置／捷徑】讀檔到校園 (%.2f, %.2f) 南邊 1.5 m、14:00' % (AVE[0], AVE[1] + 1.5))
            await pg.wait_for_timeout(3000)
            u1 = await pg.evaluate(GAMECAM)
            u2 = await pg.evaluate(SNAP_JS, {'from': [AVE[0] + 2.1, 1.6, AVE[1] + 2.1], 'at': [AVE[0], 0.6, AVE[1]]})
            for nm, u in (('game', u1), ('look', u2)):
                open(os.path.join(OUT, 'avenue_%s_%s.png' % (TAG, nm)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
            av = await pg.evaluate(AVE_JS, AVE); res['avenue'] = av
            R.note('④ 椰影大道 (%s, %s) 半徑 3 m 內的場景物件 %d 個：%s' % (AVE[0], AVE[1], av['n'], J(av['objs'][:30])))
            R.note('④ 那一點附近 0.25 m 格（x, z, nav.free, canStand 0.25, canStand 0.3）：%s；附近 collider %s（全部 %s）' % (J(av['grid_x_z_navfree_can025_can03']), J(av['colliders']), av['colliders_total']))
        except Exception as e:
            R.check('④ 椰影大道沒有中斷', False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'longplay_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
