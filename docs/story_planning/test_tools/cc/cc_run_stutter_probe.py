"""CC-C 11-12：BUG-RUN-STUTTER-1112（使用者在線上 v9.10.25 自己逛：跑步一頓一頓、每個場景都這樣；錄影＝反覆 2～5 格凍住再一大跳。BB-C 04:23 P0）。
判定歸 BB／LAWWW；這支只量數字。Playwright 手機橫向觸控，PC GPU 有視窗（headed）≠ iPhone；雲端 SwiftShader 只驗探針流程，數字不能用。
受測：v9.10.21 aa0f3bcd3、v9.10.25 dc3d33941（線上那版），同一支探針各跑一次。不用 turbo。
做法（每個場景）：
  【前置／捷徑】load_zone 讀檔到那一點 14:00（溫州街、校園椰林大道 (2, −100) 往北、公館）；溫州街、公館從出生點找「最長一條站得住的直線」（16 個方向每 0.5 m 看 E.canStand 0.3，最多 60 m）當跑的方向。
  ① 站著不動 5 秒（對照：沒有輸入、沒有移動時的幀間隔）
  ② 觸控按「跑」（#btnRun＝runHold）→ 搖桿固定往那個方向推 10 秒（playlib 的搖桿每 80 ms 送一次 touchMove）
  ③ 走路（不按跑）同一個方向 10 秒（對照：只有跑步才頓，還是走路也頓）
  每一段：探針自己掛一個 requestAnimationFrame 迴圈（和遊戲同一幀），記每一幀的時間差、玩家位置（obj.position）、E.player.speed、pose；
  算：幀數、平均 fps、時間差 >50 ms 的次數、最長一次、p50／p95／p99；每幀位移（m）：位移＝0 的幀連續 ≥2 格後面接一格位移 ≥3 倍中位數＝「凍住再一大跳」記次數與例子；
  另外記遊戲自己的 dt（GAME.E.lastDt／E.dt 有就記）、JS 長任務（PerformanceObserver longtask，有就記）。
輸出：stutter_<TAG>.json（每段每幀原始資料）＋run.log 總表。判定只有「探針有跑完、量到東西」；數字給 LAWWW 判。
（第二輪 LAWWW-C 04:42：VIEW／DSF／HOUR；跑步前後記 E.q、renderer 像素比、畫布、render.calls／triangles、programs；每幀記畫質有沒有變；跑不遠就記停的位置和附近 collider）
CC_02 清單 2026-11-12：1✓ 2✓（第五輪加 WINPOS、renderer.render 間隔、螢幕資訊；第四輪加 EXTRA_ARGS／CHANNEL：只改瀏覽器啟動，量法不變；座標：椰林大道從 zones3d.js 路面 x 0、z −242～−46；其他場景照出生點＋最長直線） 3n/a（BB 指定三個場景，不挑候選） 4✓ 5✓ 6✓ 7✓ 8✓（門檻 50 ms＝BB 04:23 給的） 9n/a（不截圖判畫面） 10✓ 11✓ 12✓（記「真的有在跑」：runHold、speed、位移） 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [ZONES=wenzhou,campus,gongguan] [RUN_S=10] [VIEW=2308x1064 DSF=1|1.25|1.5|2 HOUR=17.58] python3 cc_run_stutter_probe.py <url> <out>"""
import os, sys, json, asyncio, math, statistics
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
ZONES = [z for z in (os.environ.get('ZONES') or 'wenzhou,campus,gongguan').split(',') if z]
RUN_S = float(os.environ.get('RUN_S') or '10')
VIEW = os.environ.get('VIEW') or ''   # 第二輪（LAWWW-C 04:42：使用者是電腦 Chrome 大視窗 2308×1064＋觸控版面）：VIEW=2308x1064 用桌機視窗（is_mobile 關、has_touch 開）
DSF = float(os.environ.get('DSF') or '1')
HOUR = float(os.environ.get('HOUR') or '14')
R = L.Run('stutter_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'
PLACE = {'wenzhou': {'x': None, 'z': None, 'dir': None, 'name': '溫州街'},
         'campus': {'x': 2.0, 'z': -100.0, 'dir': (0.0, -1.0), 'name': '校園椰林大道（往北）'},
         'gongguan': {'x': None, 'z': None, 'dir': None, 'name': '公館'}}
REC_ON = r"""(()=>{ const E=GAME.E, P=E.player; window.__st={f:[], lt:[], r:[]}; window.__stOn=true;
  if(!window.__stRW&&E.renderer){ const r0=E.renderer.render; E.renderer.render=function(){ if(window.__stOn){ window.__st.r.push(performance.now()); window.__stRC=(window.__stRC|0)+1; } return r0.apply(this,arguments); }; window.__stRW=true; }   /* 第五輪（LAWWW-C 06:51）：真的有畫的幀（renderer.render 被叫的時間）；有幀率上限時 rAF 會空轉 */
  try{ if(!window.__stLT&&typeof PerformanceObserver!=='undefined'){ window.__stLT=new PerformanceObserver(l=>{ if(window.__stOn) for(const e of l.getEntries()) window.__st.lt.push([+e.startTime.toFixed(1), +e.duration.toFixed(1)]); }); window.__stLT.observe({entryTypes:['longtask']}); } }catch(e){}
  let last=null; const f=t=>{ if(!window.__stOn) return; const o=P.obj.position; const cv=E.renderer&&E.renderer.domElement, qq=E.q||{}; window.__st.f.push([+t.toFixed(2), last==null?null:+(t-last).toFixed(2), +o.x.toFixed(4), +o.z.toFixed(4), P.speed==null?null:+(+P.speed).toFixed(2), P.pose||null, E.lastDt!=null?+(+E.lastDt).toFixed(4):(E.dt!=null?+(+E.dt).toFixed(4):null), !!P.runHold, qq.level||null, qq.pr==null?null:+qq.pr, E.renderer?+E.renderer.getPixelRatio().toFixed(3):null, cv?cv.width+'x'+cv.height:null, !!qq.shadows, window.__stRC|0]); last=t; requestAnimationFrame(f); };
  requestAnimationFrame(f); return true; })()"""
REC_OFF = "(()=>{ window.__stOn=false; return window.__st; })()"
INFO_JS = r"""(()=>{ const E=GAME.E, r=E.renderer, i=r&&r.info, cv=r&&r.domElement; return {q:JSON.parse(JSON.stringify(E.q||{})), pr:r?r.getPixelRatio():null, canvas:cv?[cv.width,cv.height]:null, css:cv?[cv.clientWidth,cv.clientHeight]:null, dpr:window.devicePixelRatio,
  calls:i&&i.render?i.render.calls:null, tris:i&&i.render?i.render.triangles:null, programs:i&&i.programs?i.programs.length:null, geoms:i&&i.memory?i.memory.geometries:null, tex:i&&i.memory?i.memory.textures:null}; })()"""
BLOCK_JS = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, f=v=>+(+v).toFixed(2); const near=[];
  for(const c of (E.colliders||[])){ const b=c.box||c.b||c; const cx=b.min&&b.max?(b.min.x+b.max.x)/2:(c.x!=null?c.x:null), cz=b.min&&b.max?(b.min.z+b.max.z)/2:(c.z!=null?c.z:null); if(cx==null) continue; const d=Math.hypot(cx-o.x,cz-o.z); if(d<4) near.push({name:String(c.name||(c.obj&&c.obj.name)||c.kind||'').slice(0,40), cx:f(cx), cz:f(cz), d:f(d)}); }
  near.sort((a,b)=>a.d-b.d); const ahead=[]; for(let s=0.25;s<=2;s+=0.25) ahead.push([s, E.canStand(o.x,o.z-s,0.3,P.lv|0), E.nav&&E.nav.free?E.nav.free(o.x,o.z-s):null]);
  return {pos:[f(o.x),f(o.z)], lv:P.lv|0, blockedAt:P.blockedAt||null, stall:P._stall||null, colliders:near.slice(0,8), ahead}; })()"""
LINE_JS = r"""(()=>{ const E=GAME.E, o=E.player.obj.position; let best=null;
  for(let k=0;k<16;k++){ const a=k*Math.PI/8, dx=Math.sin(a), dz=Math.cos(a); let d=0; for(let s=0.5;s<=60;s+=0.5){ if(!E.canStand(o.x+dx*s,o.z+dz*s,0.3,E.player.lv|0)) break; d=s; } if(!best||d>best.d) best={d, dir:[+dx.toFixed(4),+dz.toFixed(4)], k}; }
  return best; })()"""


def stats(frames):
    dts = [f[1] for f in frames if f[1] is not None]
    if not dts: return {'frames': len(frames)}
    s = sorted(dts); n = len(s); q = lambda p: s[min(n - 1, int(p * n))]
    mv = []
    for i in range(1, len(frames)):
        mv.append(math.hypot(frames[i][2] - frames[i - 1][2], frames[i][3] - frames[i - 1][3]))
    med = statistics.median([m for m in mv if m > 1e-4] or [0])
    freeze_jump = []; i = 0
    while i < len(mv):
        if mv[i] < 1e-4:
            j = i
            while j < len(mv) and mv[j] < 1e-4: j += 1
            if j - i >= 2 and j < len(mv) and med > 0 and mv[j] >= 3 * med: freeze_jump.append({'at': i, 'frozen': j - i, 'jump': round(mv[j], 3), 'med': round(med, 3), 'dt_jump': frames[j + 1][1] if j + 1 < len(frames) else None})
            i = j
        else: i += 1
    tot = sum(dts) / 1000.0
    return {'frames': len(frames), 'secs': round(tot, 2), 'fps': round(len(dts) / tot, 1) if tot else None, 'gt50': sum(1 for d in dts if d > 50), 'gt33': sum(1 for d in dts if d > 33.4),
            'max_ms': round(s[-1], 1), 'p50': round(q(0.5), 1), 'p95': round(q(0.95), 1), 'p99': round(q(0.99), 1), 'dist_m': round(sum(mv), 2), 'move_med_m': round(med, 4),
            'zero_move_frames': sum(1 for m in mv if m < 1e-4), 'freeze_then_jump': len(freeze_jump), 'fj_examples': freeze_jump[:6]}


async def seg(pg, cdp, tag, name, fn):
    await pg.evaluate(REC_ON); await fn(); d = await pg.evaluate(REC_OFF)
    st = stats(d['f']); st['longtasks'] = len(d['lt']); st['longtask_max'] = max([x[1] for x in d['lt']] or [0])
    runs = sum(1 for f in d['f'] if f[7]); poses = {}
    for f in d['f']: poses[f[5]] = poses.get(f[5], 0) + 1
    st['runHold_frames'] = runs; st['poses'] = poses
    rr = d.get('r') or []; ri = [rr[i] - rr[i - 1] for i in range(1, len(rr))]
    fa = [f[1] for f in d['f'] if f[1] is not None]
    def dist(v):
        if not v: return None
        q = sorted(v); n = len(q); m = sum(q) / n
        return {'n': n, 'p10': round(q[int(0.1 * n)], 2), 'p50': round(q[n // 2], 2), 'p95': round(q[min(n - 1, int(0.95 * n))], 2), 'max': round(q[-1], 2), 'mean': round(m, 2), 'std': round((sum((x - m) ** 2 for x in q) / n) ** 0.5, 2)}
    st['raf_interval'] = dist(fa); st['render_interval'] = dist(ri)
    st['render_fps'] = round(len(ri) / (sum(ri) / 1000.0), 1) if ri and sum(ri) else None
    # 有幀率上限時，rAF 空轉的那幾幀人本來就不動：「凍住再一大跳」改用真的有畫的幀再算一次（第 13 欄＝renderer.render 次數）
    fr = [f for i, f in enumerate(d['f']) if len(f) > 13 and (i == 0 or f[13] != d['f'][i - 1][13])]
    if len(fr) > 3:
        fr2 = [list(fr[0][:2]) + list(fr[0][2:])]
        for i in range(1, len(fr)): x = list(fr[i]); x[1] = round(fr[i][0] - fr[i - 1][0], 2); fr2.append(x)
        sr = stats(fr2); st['rendered'] = {k: sr.get(k) for k in ('frames', 'fps', 'gt50', 'max_ms', 'p50', 'p95', 'freeze_then_jump', 'fj_examples')}
    R.note('%s %s：%s' % (tag, name, J(st)))
    return st, d


async def main():
    print('CC RUN-STUTTER：TAG %s；SHA %s；ZONES %s；跑 %.0f 秒；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(ZONES), RUN_S), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'zones': {}}
    async with async_playwright() as p:
        if VIEW:
            w, h = [int(v) for v in VIEW.lower().split('x')]
            kw = {'executable_path': '/opt/pw-browsers/chromium'} if os.path.exists('/opt/pw-browsers/chromium') else {}   # 雲端才用（電腦那台 gpu_wrap 處理瀏覽器和 GPU 參數）
            # 第四輪（LAWWW-C 06:23）：EXTRA_ARGS（+ 分隔，例 --force_low_power_gpu、--disable-gpu）、CHANNEL=chrome（本機裝的一般 Chrome，Playwright 開新的空白設定檔，不碰使用者的資料）
            xa = [x for x in (os.environ.get('EXTRA_ARGS') or '').split('+') if x]
            if os.environ.get('CHANNEL'): kw.pop('executable_path', None); kw['channel'] = os.environ['CHANNEL']
            # BB-C 06:47 選 B：只有 PROBE_HEADED=1 的那兩項自己開視窗（runner 的 config HEADLESS=1 不動；gpu_wrap 在 launch 當下讀 CC_HEADLESS）
            if os.environ.get('PROBE_HEADED') == '1': os.environ['CC_HEADLESS'] = '0'; kw['headless'] = False
            if os.environ.get('WINPOS'): xa = xa + ['--window-position=' + os.environ['WINPOS']]   # 第五輪：視窗放到哪個螢幕（使用者外接 300 Hz 在 [0,0]、內建 60 Hz 在 [-1098,0]）
            b = await p.chromium.launch(args=L.ARGS + xa, **kw)
            R.setup('【前置】瀏覽器：channel %s；加的參數 %s；CC_GPU=%s CC_HEADLESS=%s（gpu_wrap 在 CC_GPU=1 時另外加 d3d11 參數）' % (kw.get('channel') or 'Playwright Chromium', xa, os.environ.get('CC_GPU', '1'), os.environ.get('CC_HEADLESS')))
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=DSF, has_touch=True, is_mobile=False)
            pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            R.setup('【前置／捷徑】桌機視窗 %dx%d、deviceScaleFactor %s、has_touch 開、is_mobile 關（LAWWW-C 04:42：使用者是電腦 Chrome 大視窗＋觸控版面）' % (w, h, DSF))
        else:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        res['renderer'] = await pg.evaluate("(()=>{ try{ const g=GAME.E.renderer.getContext(); const x=g.getExtension('WEBGL_debug_renderer_info'); return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER); }catch(e){ return String(e); } })()")
        R.note('WebGL：%s' % res['renderer'])
        res['screen'] = await pg.evaluate("({screenX:window.screenX, screenY:window.screenY, sw:screen.width, sh:screen.height, availLeft:screen.availLeft, dpr:window.devicePixelRatio, fpsCap:(typeof GAME!=='undefined'&&GAME.fpsCap!=null)?GAME.fpsCap:null, url:location.search})")
        R.note('視窗在螢幕上的位置、螢幕大小、dpr、遊戲的 fpsCap：%s' % J(res['screen']))
        for zid in ZONES:
            P = PLACE.get(zid, {'x': None, 'z': None, 'dir': None, 'name': zid}); tag = '[%s]' % P['name']
            s = await D.load_zone(pg, cdp, zid, DAY, HOUR, x=P['x'], z=P['z'], yaw=0.0, wait=10000) if P['x'] is not None else await D.load_zone(pg, cdp, zid, DAY, HOUR, wait=10000)
            R.setup('%s 【前置／捷徑】讀檔到 %s %s %.2f 時%s' % (tag, zid, DAY, HOUR, '' if P['x'] is None else ' (%.1f, %.1f)' % (P['x'], P['z'])))
            if not R.check('%s 讀到 %s' % (tag, zid), s['zone'] == zid, J(s)): continue
            await pg.wait_for_timeout(3000)
            if P['dir']: dr = {'dir': list(P['dir']), 'd': None}
            else: dr = await pg.evaluate(LINE_JS)
            R.note('%s 跑的方向 %s（直線站得住 %s m）' % (tag, dr['dir'], dr['d']))
            wx, wz = dr['dir']

            async def push(ms):
                yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
                sx, sy = wx * rx + wz * rz, -(wx * fx + wz * fz); m = math.hypot(sx, sy) or 1
                await L.joystick(pg, cdp, sx / m * 50, sy / m * 50, ms)
            zres = {'dir': dr}
            zres['idle'], _ = await seg(pg, cdp, tag, '① 站著 5 秒', lambda: pg.wait_for_timeout(5000))
            on = await pg.evaluate("!!GAME.E.player.runHold")
            if not on: await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(500)
            run_on = await pg.evaluate("!!GAME.E.player.runHold")
            zres['info_before'] = await pg.evaluate(INFO_JS)
            zres['run'], raw_run = await seg(pg, cdp, tag, '② 跑步 %.0f 秒' % RUN_S, lambda: push(int(RUN_S * 1000)))
            zres['info_after'] = await pg.evaluate(INFO_JS)
            chg = []; prev = None
            for fr in raw_run['f']:
                key = tuple(fr[8:13]) if len(fr) > 12 else None
                if key is not None and key != prev: chg.append([fr[0]] + list(key)); prev = key
            zres['quality_changes'] = chg
            R.note('%s 跑步前 %s；跑步後 %s；畫質／像素比／畫布在 10 秒內的變化（時間、level、pr、renderer pr、畫布、陰影）%d 筆：%s' % (tag, J(zres['info_before']), J(zres['info_after']), len(chg), J(chg[:8])))
            R.note('%s 跑步中新編的 shader：programs %s → %s' % (tag, zres['info_before'].get('programs'), zres['info_after'].get('programs')))
            if (zres['run'].get('dist_m') or 0) < RUN_S * 3:
                zres['block'] = await pg.evaluate(BLOCK_JS); R.note('%s 跑不遠（%.1f m）：停的位置、附近的 collider、前方站不站得住 %s' % (tag, zres['run'].get('dist_m') or 0, J(zres['block'])))
            R.check('%s ② 真的在跑（按了「跑」runHold=%s、跑了 %.1f m）' % (tag, run_on, zres['run'].get('dist_m') or 0), run_on and (zres['run'].get('dist_m') or 0) > 3, J({k: zres['run'].get(k) for k in ('dist_m', 'runHold_frames', 'poses')}))
            if await pg.evaluate("!!GAME.E.player.runHold"): await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(500)
            wx, wz = -wx, -wz   # 走回來（同一條線、反方向）
            zres['walk'], _ = await seg(pg, cdp, tag, '③ 走路 %.0f 秒（反方向走回來）' % RUN_S, lambda: push(int(RUN_S * 1000)))
            res['zones'][zid] = zres
            open(os.path.join(OUT, 'stutter_%s_%s_run_frames.json' % (TAG, zid)), 'w', encoding='utf-8').write(J(raw_run))
            R.note('%s 【有畫的幀】跑步 rAF 間隔 %s；renderer.render 間隔 %s；有畫的 fps %s；只算有畫的幀 %s' % (tag, J(zres['run'].get('raf_interval')), J(zres['run'].get('render_interval')), zres['run'].get('render_fps'), J(zres['run'].get('rendered'))))
            R.note('%s 【總表】站著 fps %s／>50ms %s；跑步 fps %s／>50ms %s／最長 %s ms／凍住再一大跳 %s 次；走路 fps %s／>50ms %s／凍住再一大跳 %s 次' % (
                tag, zres['idle'].get('fps'), zres['idle'].get('gt50'), zres['run'].get('fps'), zres['run'].get('gt50'), zres['run'].get('max_ms'), zres['run'].get('freeze_then_jump'),
                zres['walk'].get('fps'), zres['walk'].get('gt50'), zres['walk'].get('freeze_then_jump')))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'stutter_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
