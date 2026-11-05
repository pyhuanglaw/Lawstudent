# -*- coding: utf-8 -*-
"""LAWWW2-C（PERF-WZ-DAY-1103）：溫州街「白天」1% low 7 fps 是從哪裡來的——分項量測探針（給 cc-local 的 PC 跑，D131）。
用法：python perf_split_probe.py <遊戲網址 index.html> <輸出資料夾>
  （runner 的 probe：args <URL> <out>\\out；LW_TESTS 自動設成遊戲那一棵的 tests/。網址會自己加 ?perf＝PERFPANEL 的換區域紀錄）
環境變數：ZONES=wenzhou,campus,library_hall  COLD=12（進區域以後馬上量幾秒）  SECS=8（穩定以後每一項量幾秒）  WARM=4  LAND=1（844×390 橫向，和 F1／F2 一樣）

為什麼要量這個：CC 的 fps_zones.py（F1_fps_hl、F2_fps_hd，b1b249873）每一區照 day → night → rain 的順序量、每一格前等 4 秒，
day 永遠是「剛進這一區」的第一格。結果每一區的 day 都是最差的那一格，連室內的萬才館（F2 day 最慢 370 ms、night 33 ms）、
總圖大廳也一樣；溫州街 day 和 night 的平均 fps、中位數幾乎一樣（33.4／35.6、p50 都是 33.3 ms），差在少數幾格特別慢的尖峰。
所以先分清楚兩件事：
  ① 尖峰是「第一次進區域的成本」（編 shader、傳貼圖、路人 VRM 換上去、GC），還是「白天才有的成本」（太陽陰影每一格重畫）？
  ② 平常的 33 fps（每一格 2 個 vsync）是 CPU 的程式、還是畫的 draw call？

量什麼（每一區）：
  A 冷：第一次進這一區（11:00 晴）以後馬上量 COLD 秒
  B 再進一次同一區、同一個時段（快取都有了）：A 有、B 沒有的尖峰＝第一次才有的成本
  C 晚上 21:00 晴（第三次進）：和 CC 的 night 那一格對照
  D 白天、等 WARM 秒以後，每一項 SECS 秒：
      base；noshadow（太陽陰影貼圖不每格重畫：E.nightShadow 換成 autoUpdate＝false）；
      nonpc（NPC、騎士藏起來，每一格都藏）；norender（E.renderSkip：只跑程式、不畫）；base2（最後再量一次，看有沒有漂移）
  每一格記：間隔、E.update／E.render／STORY.tick／GAME.upgradeModels（＋裡面 CHAR.upgrade 幾次）的 CPU 時間、
  這一格新編的 shader（沒看過的 renderer.info.programs）、貼圖數、幾何數、draw call、三角形、JS heap（Chrome 才有）
輸出：<輸出資料夾>/perf_split.json（每一格的資料＋摘要）、perf_split.txt（一行一項＋最慢 8 格的分項）

注意：這不是玩家流程（讀檔直接放到區域，條件事件關掉；【前置／捷徑】和 fps_zones.py 一樣）。只量 CPU 時間：GPU 時間 Chrome 不給（timer query 預設關），
「間隔 − CPU 工作」大的那幾格是 GPU 或瀏覽器（合成、垃圾回收）。雲端跑只能驗證探針會不會跑（SwiftShader，數字沒意義）。
"""
import sys, os, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

ZONES = [z for z in os.environ.get('ZONES', 'wenzhou,campus,library_hall').split(',') if z]
COLD = float(os.environ.get('COLD', '12')); SECS = float(os.environ.get('SECS', '8')); WARM = float(os.environ.get('WARM', '4'))
LAND = os.environ.get('LAND', '1') != '0'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
COLS = ['dt', 'upd', 'rnd', 'story', 'upg', 'upgN', 'prog', 'tex', 'geo', 'calls', 'tris', 'heap']

# 包住遊戲每一格會叫的幾個函式（都是物件的屬性，換掉就會叫到新的），自己的 rAF 每一格收一次「上一次收完以後做了多少」
HOOK_JS = r"""(()=>{ if(window.__PS) return 'already';
  const E=GAME.E, R=E.renderer, now=()=>performance.now(); const S=window.__PS={on:false, rows:[], acc:null, last:0, seen:new WeakSet(), made:0};
  const zero=()=>({upd:0,rnd:0,story:0,upg:0,upgN:0});
  const wrap=(o,k,f)=>{ if(!o||typeof o[k]!=='function') return false; const g=o[k]; o[k]=function(){ const t=now(); try{ return g.apply(this,arguments); } finally { if(S.acc) f(S.acc,now()-t); } }; return true; };
  const ok={ upd:wrap(E,'update',(a,d)=>a.upd+=d), rnd:wrap(E,'render',(a,d)=>a.rnd+=d),
    story:typeof STORY!=='undefined'&&wrap(STORY,'tick',(a,d)=>a.story+=d), upg:wrap(GAME,'upgradeModels',(a,d)=>a.upg+=d),
    cup:typeof CHAR!=='undefined'&&wrap(CHAR,'upgrade',(a,d)=>a.upgN++) };
  const progs=()=>{ const P=(R.info&&R.info.programs)||[]; for(const p of P) if(p&&typeof p==='object'&&!S.seen.has(p)){ S.seen.add(p); S.made++; } return S.made; };
  progs(); let p0=S.made;
  const tick=t=>{ requestAnimationFrame(tick); if(!S.on){ S.last=t; S.acc=zero(); p0=progs(); return; }
    const a=S.acc||zero(), pm=progs(), mi=R.info.memory||{}, ri=R.info.render||{}, hp=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):-1;
    S.rows.push([+(t-S.last).toFixed(2), +a.upd.toFixed(2), +a.rnd.toFixed(2), +a.story.toFixed(2), +a.upg.toFixed(2), a.upgN, pm-p0, mi.textures|0, mi.geometries|0, ri.calls|0, ri.triangles|0, hp]);
    S.last=t; S.acc=zero(); p0=pm; if(S.hold) S.hold(); };
  requestAnimationFrame(tick);
  S.start=()=>{ S.rows=[]; S.on=false; S.acc=zero(); return new Promise(r=>requestAnimationFrame(t=>{ S.last=t; S.acc=zero(); p0=progs(); S.on=true; r(true); })); };
  S.stop=()=>{ S.on=false; const rows=S.rows; S.rows=[]; return rows; };
  return JSON.stringify(ok); })()"""

INFO_JS = """(()=>{ const E=GAME.E, G=GAME.G; let rnd=''; try{ const gl=E.renderer.getContext(); const x=gl.getExtension('WEBGL_debug_renderer_info'); rnd=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):''; }catch(e){}
  const sh=E.renderer.shadowMap; let casters=0, meshes=0, vis=0; E.scene.traverse(o=>{ if(o.isMesh){ meshes++; if(o.visible) vis++; if(o.castShadow) casters++; } });
  return {zone:(E.zone&&E.zone.id)||G.zone, hour:+(+G.hour).toFixed(2), weather:E.weather||G.weather, renderer:rnd, dpr:devicePixelRatio, q:(E.q&&E.q.level)||null,
    shadow:{enabled:!!sh.enabled, auto:!!sh.autoUpdate, size:(E.sun&&E.sun.shadow&&E.sun.shadow.mapSize&&E.sun.shadow.mapSize.x)||0}, meshes, visible:vis, casters,
    npcs:(E.npcs||[]).length, extras:(GAME.extras||[]).length, programs:((E.renderer.info.programs)||[]).length, perf:(typeof PERFPANEL!=='undefined'&&PERFPANEL.log&&PERFPANEL.log[0])?PERFPANEL.line(PERFPANEL.log[0]):null }; })()"""

VARIANT_JS = {
    'base': "()=>{}",
    'base2': "()=>{}",
    'noshadow': "()=>{ const E=GAME.E, R=E.renderer; window.__PS.ns0=E.nightShadow; E.nightShadow=function(){ R.shadowMap.autoUpdate=false; }; }",
    'nonpc': "()=>{ const E=GAME.E; window.__PS.hold=()=>{ for(const n of (E.npcs||[])) if(n.obj) n.obj.visible=false; for(const x of (GAME.extras||[])){ if(x.rider) x.rider.visible=false; if(x.obj) x.obj.visible=false; } }; window.__PS.hold(); }",
    'norender': "()=>{ const E=GAME.E; window.__PS.rs0=E.renderSkip; E.renderSkip=()=>true; }",
}
UNDO_JS = """()=>{ const E=GAME.E, S=window.__PS; if(S.ns0){ E.nightShadow=S.ns0; S.ns0=null; } if(S.rs0!==undefined){ E.renderSkip=S.rs0; delete S.rs0; }
  if(S.hold){ S.hold=null; for(const n of (E.npcs||[])) if(n.obj) n.obj.visible=true; for(const x of (GAME.extras||[])){ if(x.rider) x.rider.visible=true; if(x.obj) x.obj.visible=true; } } }"""


def stats(rows):
    rows = rows[1:] if len(rows) > 1 else rows   # 第一格包含開始前的等待
    if not rows: return {'n': 0}
    dt = sorted(r[0] for r in rows); n = len(dt); k = max(1, n // 100)
    avg = sum(dt) / n; low1 = sum(dt[-k:]) / k
    mean = lambda i: round(sum(r[i] for r in rows) / n, 2)
    work = [r[1] + r[2] for r in rows]   # E.update＋E.render（STORY.tick、upgradeModels 在兩個中間，另外記；不重複加）
    def row(i):   # 慢的一格：這一格的值＋和上一格比多了幾張貼圖、幾個幾何、heap 變多少；gap＝間隔－（update＋render）：GPU、合成、GC、HUD 之類
        r = dict(zip(COLS, rows[i])); q = rows[i - 1] if i > 0 else rows[i]
        r.update({'dtex': rows[i][7] - q[7], 'dgeo': rows[i][8] - q[8], 'dheap': (rows[i][11] - q[11]) if rows[i][11] >= 0 else None, 'gap': round(rows[i][0] - work[i], 1), 'i': i}); return r
    slow = [row(i) for i in sorted(range(n), key=lambda i: -rows[i][0])[:8]]
    return {'n': n, 'avg_fps': round(1000 / avg, 2), 'low1_fps': round(1000 / low1, 2), 'worst_ms': round(dt[-1], 1), 'p50_ms': round(dt[n // 2], 1),
            'over50': sum(1 for x in dt if x > 50), 'over100': sum(1 for x in dt if x > 100),
            'upd_ms': mean(1), 'rnd_ms': mean(2), 'story_ms': mean(3), 'upg_ms': mean(4), 'work_ms': round(sum(work) / n, 2),
            'new_prog': sum(r[6] for r in rows), 'upgN': sum(r[5] for r in rows), 'calls': mean(9), 'tris': int(mean(10)),
            'tex_end': rows[-1][7], 'geo_end': rows[-1][8], 'heap_mb': [rows[0][11], rows[-1][11]],
            'slow': slow}


async def measure(pg, secs):
    await pg.evaluate("window.__PS.start()")
    await pg.wait_for_timeout(int(secs * 1000))
    return await pg.evaluate("window.__PS.stop()")


async def enter(pg, z, h, w):
    await L.load_state(pg, {'zone': z, 'hour': h, 'day': 8, 'weekday': 6, 'weather': w, 'pos': None, 'flags': FLAGS}, quiet_events=True, quiet_phone=True)
    await pg.evaluate("w=>{ try{ GAME.G.weather=w; GAME.E.setWeather&&GAME.E.setWeather(w); }catch(e){} }", w)


def line(z, k, s, info=None):
    if not s.get('n'): return '%-13s %-9s n=0' % (z, k)
    t = '%-13s %-9s avg %6.2f fps  1%%low %6.2f  worst %6.1f ms  p50 %5.1f  >50ms %3d  >100ms %3d | CPU upd %5.2f rnd %5.2f story %5.2f upg %5.2f (換模型 %d) | 新 shader %d | calls %s tris %s' % (
        z, k, s['avg_fps'], s['low1_fps'], s['worst_ms'], s['p50_ms'], s['over50'], s['over100'], s['upd_ms'], s['rnd_ms'], s['story_ms'], s['upg_ms'], s['upgN'], s['new_prog'], s['calls'], s['tris'])
    if info: t += ' | meshes %s vis %s casters %s npcs %s extras %s shadow %s' % (info.get('meshes'), info.get('visible'), info.get('casters'), info.get('npcs'), info.get('extras'), info.get('shadow'))
    return t


async def main(url, od):
    os.makedirs(od, exist_ok=True)
    if '?perf' not in url and '&perf' not in url: url += ('&' if '?' in url else '?') + 'perf'
    out = {'url': url, 'land': LAND, 'cold': COLD, 'secs': SECS, 'warm': WARM, 'cols': COLS, 'zones': {}}; txt = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
        await pg.goto(url)
        if not await L.wait_loaded(pg):
            print('FAIL 遊戲載入'); await b.close(); return 1
        out['hooks'] = json.loads(await pg.evaluate(HOOK_JS))
        for z in ZONES:
            Z = out['zones'][z] = {}
            try:
                for k, (h, w) in (('A_cold', (11.0, 'sunny')), ('B_again', (11.0, 'sunny')), ('C_night', (21.0, 'sunny'))):
                    await enter(pg, z, h, w)
                    rows = await measure(pg, COLD); info = await pg.evaluate(INFO_JS)
                    Z[k] = {'info': info, 'stats': stats(rows), 'rows': rows}; txt.append(line(z, k, Z[k]['stats'], info)); print(txt[-1], flush=True)
                    if info.get('perf'): txt.append('    PERFPANEL：' + info['perf'])
                await enter(pg, z, 11.0, 'sunny'); await pg.wait_for_timeout(int(WARM * 1000))
                for k in ('base', 'noshadow', 'nonpc', 'norender', 'base2'):
                    await pg.evaluate(VARIANT_JS[k]); await pg.wait_for_timeout(500)
                    rows = await measure(pg, SECS); info = await pg.evaluate(INFO_JS); await pg.evaluate(UNDO_JS)
                    Z['D_' + k] = {'info': info, 'stats': stats(rows), 'rows': rows}; txt.append(line(z, 'D_' + k, Z['D_' + k]['stats'], info if k == 'base' else None)); print(txt[-1], flush=True)
                    await pg.wait_for_timeout(500)
            except Exception as e:
                Z['err'] = repr(e)[:400]; txt.append('%-13s ERROR %s' % (z, Z['err'])); print(txt[-1], flush=True)
            for k in ('A_cold', 'B_again', 'C_night'):
                s = (Z.get(k) or {}).get('stats') or {}
                for r in s.get('slow', [])[:5]:
                    txt.append('    %s 慢的一格 #%s：%s' % (k, r['i'], ' '.join('%s=%s' % (c, r[c]) for c in COLS + ['dtex', 'dgeo', 'dheap', 'gap'])))
        out['js_errors'] = list(errs)[:30]
        await b.close()
    json.dump(out, open(os.path.join(od, 'perf_split.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    open(os.path.join(od, 'perf_split.txt'), 'w', encoding='utf-8').write('\n'.join(txt) + '\n')
    bad = [z for z, Z in out['zones'].items() if Z.get('err') or not all((Z.get(k) or {}).get('stats', {}).get('n') for k in ('A_cold', 'D_base'))]
    print('JS 例外 %d 個' % len(out['js_errors']))
    print('ALL PASS（量完 %d 區）' % len(out['zones']) if not bad else 'FAILED: %s' % ', '.join(bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1], sys.argv[2])))
