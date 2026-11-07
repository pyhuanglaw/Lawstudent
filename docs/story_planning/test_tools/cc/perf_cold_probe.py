# 【CC-B 11-07 複製自 LAWWW2-B claude/funny-albattani-iawshm bc7e0ff5e docs/art-rebuild/second_ai/wip/perf_wz_day_1103/perf_cold_probe.py（換掉 8802cce88 那一版，LAWWW2-B 07:19），沒改內容；看過新增部分：沒有寫檔、沒有寫死路徑、沒有改遊戲檔】
# -*- coding: utf-8 -*-
"""LAWWW2-B（PERF-WZ-DAY-1103 第二支探針，2026-11-07）：第一次進區域、淡入以後那一格 4.6 秒是誰——給 cc-local 的 PC 跑（D131）。
用法：python perf_cold_probe.py <遊戲網址 index.html> <輸出資料夾>
  （runner 的 probe：args <URL> <out>\\out；LW_TESTS 自動設成遊戲那一棵的 tests/。網址會自己加 ?perf）
環境變數：ZONES=wenzhou,library_hall  VARIANTS=base,pre,prewarm  COLD=12（淡入以後量幾秒）  LAND=1

第一支（perf_split_probe.py，PC 11-05 PERF_WZ_SPLIT）量到的：
  溫州街第一次進（A_cold）淡入後第 2 格 4,600 ms：E.update 6 ms、E.render 84 ms、換模型 1 次（upgN 1）、傳了 23 張貼圖，其餘 4,509 ms 不在遊戲每一格的程式裡（gap）。
  總圖大廳一樣：7,266 ms，gap 6,816 ms，換模型 1 次。再進一次（B_again）就沒有這麼長的格子。
  探針的 rAF 排在遊戲的後面：gap 發生在「換模型那一格」的前面——比較像是兩格之間在載入、解析某個模型（ASSETS.loadOne／parseVRM），載好了下一格才換上；
  也可能是 GPU 那邊第一次畫新的東西（編 shader、傳貼圖）讓瀏覽器排不出下一格。這支分清楚是哪一個。

怎麼量（每一個「區域 × 做法」都開一個新的瀏覽器＝真的第一次進）：
  base：照遊戲原本的做法進區域。
  pre：進區域以前先把 base 那一次「進區域以後才開始載」的資產（ASSETS.loadOne 記下來的 key）全部載好，再進同一區。
       這一格消失＝是載入、解析；還在＝是 GPU 第一次畫。
  prewarm：pre＋黑畫面裡（Z3.prewarm 做完以後）把整個場景不剔除地畫一次到 256×128 的小畫布、讀一個像素（等 GPU 做完）。
       淡入以後的格子再少＝「第一次畫」的成本可以搬進黑畫面（這是之後可以做的修法，量的是值不值得）。
  三種都是在探針裡包 ASSETS、Z3 的函式做的，遊戲程式不用改。
每一格記：間隔、E.update／E.render／STORY.tick／GAME.upgradeModels 的時間、換模型、新 shader、貼圖、幾何、draw call；
另外記：Chrome 的 Long Animation Frames（LoAF，Chrome 123 以上）——每一個很長的格子裡跑了哪幾段 JS（呼叫方式、函式名、檔案:行、毫秒）；
  ASSETS.loadOne（開始載、載好）、ASSETS.parseVRM（同步那一段、全部做完）、CHAR.upgrade、Z3.prewarm／warmup 的時間點。
  一格很長、LoAF 裡沒有對應的 JS＝主執行緒閒著在等＝GPU 或瀏覽器那一邊。
另外 base 那一次量完以後：場景照模型分組、每一組單獨畫一次，記 draw call／三角形（含陰影那一輪）＝穩定以後 30 fps 要從哪一組省。
輸出：perf_cold.json（每一格、每一筆事件）、perf_cold.txt（每一種做法一段：最慢的格子、那段時間跑了什麼、分項）

【前置／捷徑】讀檔直接放到區域（和 perf_split_probe、fps_zones 一樣），不是玩家流程。雲端 SwiftShader 只能驗證會不會跑；D131：瀏覽器探針排使用者電腦。
"""
import sys, os, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
TESTS = os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', '..', 'tests')
sys.path.insert(0, TESTS)
GAME_ROOT = os.path.abspath(os.path.join(TESTS, '..'))
import playlib as L
from playwright.async_api import async_playwright

ZONES = [z for z in os.environ.get('ZONES', 'wenzhou,library_hall').split(',') if z]
VARIANTS = [v for v in os.environ.get('VARIANTS', 'base,pre,prewarm').split(',') if v]
COLD = float(os.environ.get('COLD', '12')); LAND = os.environ.get('LAND', '1') != '0'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
COLS = ['dt', 'upd', 'rnd', 'story', 'upg', 'upgN', 'prog', 'tex', 'geo', 'calls', 'tris', 't']

HOOK_JS = r"""(()=>{ if(window.__PC) return 'already';
  const E=GAME.E, R=E.renderer, now=()=>performance.now(), f1=x=>+(+x).toFixed(1);
  const S=window.__PC={on:false, rows:[], acc:null, last:0, seen:new WeakSet(), made:0, ev:[], loaf:[], lt:[], warmRender:null};
  const zero=()=>({upd:0,rnd:0,story:0,upg:0,upgN:0});
  const wrap=(o,k,f)=>{ if(!o||typeof o[k]!=='function') return false; const g=o[k]; o[k]=function(){ const t=now(); try{ return g.apply(this,arguments); } finally { f(S.acc,now()-t,t); } }; return true; };
  const ok={ upd:wrap(E,'update',(a,d)=>{ if(a) a.upd+=d; }), rnd:wrap(E,'render',(a,d)=>{ if(a) a.rnd+=d; }),
    story:typeof STORY!=='undefined'&&wrap(STORY,'tick',(a,d)=>{ if(a) a.story+=d; }), upg:wrap(GAME,'upgradeModels',(a,d)=>{ if(a) a.upg+=d; }),
    cup:typeof CHAR!=='undefined'&&wrap(CHAR,'upgrade',(a,d,t)=>{ if(a) a.upgN++; S.ev.push(['upgrade',f1(t),f1(d)]); }) };
  /* 資產：只記「這次才開始載」的（已經在快取、已經在載的不記）*/
  if(typeof ASSETS!=='undefined'){
    const lo=ASSETS.loadOne; ok.load=!!lo; if(lo) ASSETS.loadOne=function(key){ const fresh=!ASSETS.cache[key]&&!ASSETS.status[key]; const p=lo.apply(this,arguments);
      if(fresh){ const t=now(), ty=(ASSETS.manifest[key]||{}).type||''; S.ev.push(['load',f1(t),key,ty]); Promise.resolve(p).then(()=>S.ev.push(['loaded',f1(now()),key,ty,f1(now()-t)]),()=>S.ev.push(['loadfail',f1(now()),key,ty])); } return p; };
    const pv=ASSETS.parseVRM; ok.parseVRM=!!pv; if(pv) ASSETS.parseVRM=function(buf){ const t=now(); const p=pv.apply(this,arguments); S.ev.push(['parseVRM',f1(t),f1(now()-t),(buf&&buf.byteLength)|0]);
      Promise.resolve(p).then(()=>S.ev.push(['parseVRMdone',f1(now()),f1(now()-t)]),()=>S.ev.push(['parseVRMfail',f1(now())])); return p; }; }
  /* 區域的黑畫面預熱、淡入以後的 warmup（GAME.enter 用 Z3.prewarm／Z3.warmup 這兩個屬性叫）*/
  if(typeof Z3!=='undefined'){
    const pw=Z3.prewarm; ok.prewarm=!!pw; if(pw) Z3.prewarm=async function(E_){ const t=now(); S.ev.push(['prewarm',f1(t)]); let r=null; try{ r=await pw.apply(this,arguments); } finally { S.ev.push(['prewarmed',f1(now()),f1(now()-t)]); }
      if(S.warmRender){ const t2=now(); let x=null; try{ x=S.warmRender(E_); }catch(e){ x=[0,0,0,String(e).slice(0,200)]; } S.ev.push(['warmrender',f1(t2)].concat(x)); } return r; };
    const wu=Z3.warmup; ok.warmup=!!wu; if(wu) Z3.warmup=function(){ S.ev.push(['warmup',f1(now())]); return wu.apply(this,arguments); }; }
  /* Long Animation Frames：每一個超過 50 ms 的格子、裡面超過 5 ms 的每一段 JS */
  try{ const types=PerformanceObserver.supportedEntryTypes||[]; S.loafOK=types.includes('long-animation-frame'); S.ltOK=types.includes('longtask');
    if(S.loafOK) new PerformanceObserver(l=>{ for(const e of l.getEntries()) S.loaf.push({t:f1(e.startTime),d:f1(e.duration),blk:f1(e.blockingDuration||0),rs:f1(e.renderStart||0),
      sc:(e.scripts||[]).map(s=>({inv:s.invoker||'',it:s.invokerType||'',url:s.sourceURL||'',fn:s.sourceFunctionName||'',pos:s.sourceCharPosition==null?-1:s.sourceCharPosition,t:f1(s.startTime),d:f1(s.duration),lay:f1(s.forcedStyleAndLayoutDuration||0)}))}); }).observe({type:'long-animation-frame',buffered:true});
    if(S.ltOK) new PerformanceObserver(l=>{ for(const e of l.getEntries()) S.lt.push([f1(e.startTime),f1(e.duration)]); }).observe({type:'longtask',buffered:true}); }
  catch(e){ S.loafErr=String(e).slice(0,200); }
  const progs=()=>{ const P=(R.info&&R.info.programs)||[]; for(const p of P) if(p&&typeof p==='object'&&!S.seen.has(p)){ S.seen.add(p); S.made++; } return S.made; };
  progs(); let p0=S.made;
  const tick=t=>{ requestAnimationFrame(tick); if(!S.on){ S.last=t; S.acc=zero(); p0=progs(); return; }
    const a=S.acc||zero(), pm=progs(), mi=R.info.memory||{}, ri=R.info.render||{};
    S.rows.push([f1(t-S.last), +a.upd.toFixed(2), +a.rnd.toFixed(2), +a.story.toFixed(2), +a.upg.toFixed(2), a.upgN, pm-p0, mi.textures|0, mi.geometries|0, ri.calls|0, ri.triangles|0, f1(t)]);
    S.last=t; S.acc=zero(); p0=pm; };
  requestAnimationFrame(tick);
  S.start=()=>{ S.rows=[]; S.on=false; S.acc=zero(); return new Promise(r=>requestAnimationFrame(t=>{ S.last=t; S.acc=zero(); p0=progs(); S.on=true; r(f1(t)); })); };
  S.stop=()=>{ S.on=false; const rows=S.rows; S.rows=[]; return rows; };
  return JSON.stringify(Object.assign(ok,{loaf:S.loafOK,longtask:S.ltOK,loafErr:S.loafErr||null})); })()"""

# prewarm 做法：黑畫面裡整個場景不剔除地畫一次（陰影那一輪也畫），讀一個像素等 GPU 做完
WARM_RENDER_JS = r"""()=>{ const S=window.__PC; S.warmRender=function(E_){ const R=E_.renderer, t=performance.now(), off=[];
    E_.scene.traverse(o=>{ if((o.isMesh||o.isSkinnedMesh||o.isPoints||o.isLine)&&o.frustumCulled){ off.push(o); o.frustumCulled=false; } });
    const rt=new THREE.WebGLRenderTarget(256,128), prev=R.getRenderTarget(), p0=((R.info.programs)||[]).length; let err=null;
    try{ R.shadowMap.needsUpdate=true; R.setRenderTarget(rt); R.render(E_.scene,E_.camera); const px=new Uint8Array(4); R.readRenderTargetPixels(rt,0,0,1,1,px); }
    catch(e){ err=String(e).slice(0,200); }
    finally{ R.setRenderTarget(prev); for(const o of off) o.frustumCulled=true; rt.dispose(); R.shadowMap.needsUpdate=true; }
    return [+(performance.now()-t).toFixed(1), ((R.info.programs)||[]).length-p0, off.length, err]; }; return true; }"""

# 穩定以後的分項（只在 base 那一次、量完以後）：場景照模型分組（大的群組往下拆一層），每一組單獨畫一次，記 draw call、三角形（含陰影那一輪）
BREAKDOWN_JS = r"""()=>{ const E=GAME.E, R=E.renderer, sc=E.scene, ar=R.info.autoReset;
  const nMesh=o=>{ let n=0; o.traverse(c=>{ if(c.isMesh||c.isPoints||c.isLine||c.isSprite) n++; }); return n; };
  let parts=[]; for(const o of sc.children){ if(!o.visible) continue; if(nMesh(o)>40&&o.children.length>1){ for(const c of o.children) if(c.visible&&nMesh(c)) parts.push(c); } else if(nMesh(o)) parts.push(o); }
  const keep=new Map(); sc.traverse(o=>keep.set(o,o.visible));
  const count=()=>{ R.info.reset(); R.shadowMap.needsUpdate=true; R.render(sc,E.camera); return [R.info.render.calls,R.info.render.triangles]; };
  R.info.autoReset=false; const out={all:null,parts:[]};
  try{ out.all=count();
    for(const p of parts){ sc.traverse(o=>{ if(o.isMesh||o.isPoints||o.isLine||o.isSprite) o.visible=false; }); p.traverse(o=>{ if(keep.has(o)) o.visible=keep.get(o); });
      for(let a=p.parent;a;a=a.parent) a.visible=true; const c=count(); out.parts.push([(p.name||p.type)+(p.parent&&p.parent!==sc?' < '+(p.parent.name||p.parent.type):''),c[0],c[1],nMesh(p)]);
      for(const [o,v] of keep) o.visible=v; } }
  finally{ for(const [o,v] of keep) o.visible=v; R.info.autoReset=ar; R.shadowMap.needsUpdate=true; }
  out.parts.sort((a,b)=>b[1]-a[1]); out.parts=out.parts.slice(0,40); return out; }"""

PRELOAD_JS = r"""async keys=>{ const t=performance.now(), out={ok:[],fail:[]};
  await Promise.all(keys.map(k=>ASSETS.manifest[k]?ASSETS.loadOne(k).then(()=>out.ok.push(k),e=>out.fail.push(k+': '+((e&&e.message)||e))):Promise.resolve(out.fail.push(k+': 不在 manifest'))));
  out.ms=Math.round(performance.now()-t); return out; }"""

INFO_JS = r"""(()=>{ const E=GAME.E; let rnd=''; try{ const gl=E.renderer.getContext(); const x=gl.getExtension('WEBGL_debug_renderer_info'); rnd=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):''; }catch(e){}
  let par=false; try{ par=!!E.renderer.extensions.get('KHR_parallel_shader_compile'); }catch(e){}
  const pick=o=>{ if(!o) return null; const r={}; for(const k in o){ const v=o[k]; if(v==null||typeof v==='number'||typeof v==='boolean'||typeof v==='string') r[k]=v; } return r; };
  return {zone:(E.zone&&E.zone.def&&E.zone.def.id)||GAME.G.zone, renderer:rnd, parallel:par, programs:((E.renderer.info.programs)||[]).length, npcs:(E.npcs||[]).length,
    prewarm:pick(E.lastPrewarm), warmup:pick(E.lastWarmup), zoneWait:pick(GAME.lastZoneWait),
    perf:(typeof PERFPANEL!=='undefined'&&PERFPANEL.log&&PERFPANEL.log[0])?PERFPANEL.line(PERFPANEL.log[0]):null }; })()"""


_src = {}
def src_line(url, pos):
    """LoAF 的 sourceCharPosition（第幾個字）換成檔案的第幾行（遊戲那一棵的檔案）"""
    if not url or pos is None or pos < 0: return None
    path = url.split('://', 1)[-1].split('/', 1)[-1].split('?')[0]
    if path not in _src:
        f = os.path.join(GAME_ROOT, path)
        try: _src[path] = open(f, encoding='utf-8').read()
        except Exception: _src[path] = None
    s = _src[path]
    if s is None: return path
    return '%s:%d' % (path, s.count('\n', 0, min(pos, len(s))) + 1)


def label(sc):
    where = src_line(sc['url'], sc['pos']) or sc['url'] or '?'
    return '%s %s @ %s' % (sc['inv'] or sc['it'] or '?', sc['fn'] or '(匿名)', where)


def analyse(run):
    rows, ev, loaf, t_enter = run['rows'], run['ev'], run['loaf'], run['t_enter']
    after = [r for r in rows if r[11] >= t_enter]
    ws = [e[1] for e in ev if e[0] == 'warmup' and e[1] >= t_enter]; shown = ws[-1] if ws else None   # GAME.enter 淡入以後才叫 warmup＝淡入的時間點（讀檔可能換兩次區域：取最後一次）
    post = [r for r in after if shown is None or r[11] >= shown]
    dts = sorted(r[0] for r in post); n = len(dts); k = max(1, n // 100)
    out = {'n_after_fade': n, 't_enter': t_enter, 't_fade': shown,
           'black_ms': round(shown - t_enter, 1) if shown else None,
           'avg_fps': round(1000 * n / sum(dts), 2) if n else 0, 'low1_fps': round(1000 / (sum(dts[-k:]) / k), 2) if n else 0,
           'worst_ms': dts[-1] if n else 0, 'over100': sum(1 for x in dts if x > 100), 'over500': sum(1 for x in dts if x > 500)}
    # 進區域以後才開始載的資產（pre 做法要先載的就是這些）
    out['late_assets'] = [e[2] for e in ev if e[0] == 'load' and e[1] >= t_enter]
    out['loaded'] = [[e[2], e[3], e[4], round(e[1] - t_enter)] for e in ev if e[0] == 'loaded' and e[1] >= t_enter]
    out['parseVRM'] = [[round(e[1] - t_enter), e[2], e[3]] for e in ev if e[0] == 'parseVRM' and e[1] >= t_enter]
    out['parseVRMdone'] = [[round(e[1] - t_enter), e[2]] for e in ev if e[0] == 'parseVRMdone' and e[1] >= t_enter]
    out['warmrender'] = next((e[2:] for e in ev if e[0] == 'warmrender'), None)
    out['prewarm_ms'] = next((e[2] for e in ev if e[0] == 'prewarmed'), None)
    # 淡入以後最慢的格子：那段時間（上一格到這一格）跑了哪些 JS、有什麼事件
    slow = []
    for r in sorted(post, key=lambda r: -r[0])[:6]:
        if r[0] < 100: break
        t1, t0 = r[11], r[11] - r[0]
        scr = []
        for f in loaf:
            for s in f['sc']:
                if s['t'] < t1 and s['t'] + s['d'] > t0: scr.append(s)
        scr.sort(key=lambda s: -s['d'])
        js = round(sum(min(s['t'] + s['d'], t1) - max(s['t'], t0) for s in scr), 1)
        evs = [[e[0], round(e[1] - t0)] + [x for x in e[2:4]] for e in ev if t0 <= e[1] <= t1 and e[0] != 'upgrade']
        slow.append({'at_ms_after_fade': round(t1 - (shown or t_enter)), 'dt': r[0], 'upd': r[1], 'rnd': r[2], 'upg': r[4], 'upgN': r[5], 'prog': r[6],
                     'js_in_gap_ms': js, 'not_js_ms': round(r[0] - js, 1),
                     'scripts': [[label(s), s['d']] for s in scr[:8]], 'events': evs[:12]})
    out['slow'] = slow
    # 淡入以後 LoAF 的 JS 依函式加總（前 12 名）
    agg = {}
    for f in loaf:
        if shown is not None and f['t'] + f['d'] < shown: continue
        for s in f['sc']:
            key = label(s); agg[key] = agg.get(key, 0) + s['d']
    out['top_js_after_fade'] = sorted([[k_, round(v, 1)] for k_, v in agg.items()], key=lambda x: -x[1])[:12]
    return out


async def one_run(p, url, zone, variant, preload_keys):
    run = {'zone': zone, 'variant': variant}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
    try:
        await pg.goto(url)
        if not await L.wait_loaded(pg):
            run['err'] = '遊戲載入逾時'; return run
        run['hooks'] = json.loads(await pg.evaluate(HOOK_JS))
        if variant in ('pre', 'prewarm') and preload_keys:
            run['preload'] = await pg.evaluate(PRELOAD_JS, preload_keys); await pg.wait_for_timeout(1500)
        if variant == 'prewarm':
            await pg.evaluate(WARM_RENDER_JS)
        await pg.evaluate("window.__PC.start()")
        run['t_enter'] = await pg.evaluate("performance.now()")
        await L.load_state(pg, {'zone': zone, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS}, quiet_events=True, quiet_phone=True)
        # 等淡入（warmup 被叫＝淡入了），再量 COLD 秒
        for _ in range(240):
            if await pg.evaluate("z=>{ const E=GAME.E, id=E.zone&&E.zone.def&&E.zone.def.id; return id===z&&window.__PC.ev.some(e=>e[0]==='warmup'); }", zone): break
            await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(int(COLD * 1000))
        run['rows'] = await pg.evaluate("window.__PC.stop()")
        run['ev'] = await pg.evaluate("window.__PC.ev")
        run['loaf'] = await pg.evaluate("window.__PC.loaf")
        run['longtask'] = await pg.evaluate("window.__PC.lt")
        run['info'] = await pg.evaluate(INFO_JS)
        if variant == 'base':
            try: run['breakdown'] = await pg.evaluate(BREAKDOWN_JS)
            except Exception as e: run['breakdown'] = {'err': repr(e)[:200]}
        run['js_errors'] = list(errs)[:20]
        run['res'] = analyse(run)
    except Exception as e:
        run['err'] = repr(e)[:400]
    finally:
        await b.close()
    return run


def text(run):
    z, v = run['zone'], run['variant']
    if run.get('err'): return ['%-13s %-8s ERROR %s' % (z, v, run['err'])]
    r, info = run['res'], run.get('info') or {}
    t = ['%-13s %-8s 黑畫面 %s ms（預熱 %s）｜淡入後 %d 格 avg %.1f fps 1%%low %.2f 最慢 %.0f ms、>100 ms %d 格、>500 ms %d 格｜進區域以後才載 %d 個%s' % (
        z, v, r['black_ms'], r['prewarm_ms'], r['n_after_fade'], r['avg_fps'], r['low1_fps'], r['worst_ms'], r['over100'], r['over500'], len(r['late_assets']),
        '｜黑畫面多畫一次 %s' % (r['warmrender'],) if r['warmrender'] else '')]
    if run.get('preload'): t.append('    先載好：%d 個、%s ms，失敗 %s' % (len(run['preload']['ok']), run['preload']['ms'], run['preload']['fail'][:5]))
    if r['late_assets']: t.append('    進區域以後才載：' + '、'.join(r['late_assets'][:20]))
    for x in r['loaded'][:12]: t.append('      載好 %s（%s）%s ms，進區域後 %s ms' % tuple(x))
    for x in r['parseVRM'][:8]: t.append('      parseVRM 進區域後 %s ms：同步 %s ms、%s bytes' % tuple(x))
    for x in r['parseVRMdone'][:8]: t.append('      parseVRM 做完 進區域後 %s ms：共 %s ms' % tuple(x))
    for s in r['slow']:
        t.append('    慢格：淡入後 %s ms，%s ms（update %s、render %s、換模型 %s 次 %s ms、新 shader %s）；這段時間 JS %s ms、不是 JS %s ms' % (
            s['at_ms_after_fade'], s['dt'], s['upd'], s['rnd'], s['upgN'], s['upg'], s['prog'], s['js_in_gap_ms'], s['not_js_ms']))
        for lab, d in s['scripts']: t.append('        %7.1f ms  %s' % (d, lab))
        if s['events']: t.append('        事件：' + '；'.join(' '.join(str(x) for x in e) for e in s['events']))
    if r['top_js_after_fade']:
        t.append('    淡入後 JS 加總前幾名：')
        for lab, d in r['top_js_after_fade']: t.append('        %7.1f ms  %s' % (d, lab))
    bd = run.get('breakdown')
    if bd and bd.get('parts'):
        t.append('    穩定以後的分項（整個場景 %s draw call／%s 三角形，含陰影那一輪；每一組單獨畫）：' % tuple(bd['all'] or ('?', '?')))
        for nm, c, tr, nm_ in bd['parts'][:25]: t.append('        %4d calls %9d tris  %4d 個網格  %s' % (c, tr, nm_, nm))
    elif bd: t.append('    分項：%s' % bd.get('err'))
    t.append('    PERFPANEL：%s｜prewarm %s｜warmup %s｜平行編譯 %s｜%s' % (info.get('perf'), info.get('prewarm'), info.get('warmup'), info.get('parallel'), info.get('renderer')))
    if run.get('js_errors'): t.append('    JS 例外 %d：%s' % (len(run['js_errors']), run['js_errors'][:3]))
    return t


async def main(url, od):
    os.makedirs(od, exist_ok=True)
    if '?perf' not in url and '&perf' not in url: url += ('&' if '?' in url else '?') + 'perf'
    out = {'url': url, 'land': LAND, 'cold': COLD, 'cols': COLS, 'runs': []}; txt = []
    async with async_playwright() as p:
        for z in ZONES:
            keys = None
            for v in VARIANTS:
                run = await one_run(p, url, z, v, keys)
                if v == 'base' and run.get('res'): keys = run['res']['late_assets']
                out['runs'].append(run); lines = text(run); txt += lines; print('\n'.join(lines), flush=True)
    for run in out['runs']:   # json 不放 LoAF 原始資料以外的大東西
        run.pop('longtask', None)
    json.dump(out, open(os.path.join(od, 'perf_cold.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    open(os.path.join(od, 'perf_cold.txt'), 'w', encoding='utf-8').write('\n'.join(txt) + '\n')
    bad = [r['zone'] + ':' + r['variant'] for r in out['runs'] if r.get('err') or not (r.get('res') or {}).get('n_after_fade')]
    print('ALL PASS（%d 次）' % len(out['runs']) if not bad else 'FAILED: %s' % ', '.join(bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1], sys.argv[2])))
