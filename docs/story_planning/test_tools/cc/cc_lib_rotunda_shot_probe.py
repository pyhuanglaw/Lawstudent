"""CC（帳號 A）11-03：總圖展演廳（圓廳）圓窗的截圖（BB 18:00：b267b0534 補了 library_view_trees_day／night 兩張圖；V19R_deploy 原本 404）。
  【前置／捷徑】讀檔到 library_hall 一樓、站在圓廳中間（L.rotunda 的圓心），白天 14:00、晚上 20:30 各一次——只為了截窗外，不是玩家流程。
  每一次：用手指滑畫面把鏡頭轉向每一扇圓窗（L.windowsV2.rotundaDeg），截一張。
  檢查：
    ① 圓窗外的景（zone.pOuts 裡 view＝trees 的平面）都有，數量＝圓窗數
    ② 那些平面的貼圖是 library_view_trees_day（白天）／_night（晚上），圖片載好了（寬高 > 0），不是 404
    ③ 沒有資源 404（只看 library_view_*）、沒有 JS 例外
  截圖給 BB 看窗外是不是樹（BB_244 照片 2）。
用法：LW_TESTS=<wt>/tests SHA=<sha> python3 cc_lib_rotunda_shot_probe.py <url> <out>"""
import os, sys, json, math, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


GEO = """(()=>{ const Lx=(typeof LIBRARY_LAYOUT!=='undefined')?LIBRARY_LAYOUT:((typeof LIB_LAYOUT!=='undefined')?LIB_LAYOUT:null); const z=GAME.E.zone||{}; const R=Lx&&Lx.rotunda, W=Lx&&Lx.windowsV2;
  const po=(z.pOuts||[]).filter(o=>o.userData&&o.userData.view==='trees').map(o=>{ const u=o.material&&o.material.uniforms, t=(u&&(u.map||u.tMap||u.uMap))?(u.map||u.tMap||u.uMap).value:(o.material&&o.material.map);
    const img=t&&t.image; const p=o.getWorldPosition(new THREE.Vector3()); return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), src:img&&(img.currentSrc||img.src||'')||null, w:img?(img.naturalWidth||img.width||0):0, h:img?(img.naturalHeight||img.height||0):0}; });
  const find=(o,k,d)=>{ if(!o||typeof o!=='object'||d>3) return null; if(o[k]) return o[k]; for(const v of Object.values(o)){ const r=find(v,k,d+1); if(r) return r; } return null; };
  const R2=R||find(Lx,'rotunda',0), W2=W||find(Lx,'windowsV2',0);
  return {R:R2?{cx:R2.cx,cz:R2.cz,r:R2.r}:null, deg:W2?W2.rotundaDeg:null, po, zone:GAME.G.zone}; })()"""


async def main():
    os.makedirs(OUT, exist_ok=True); bad404 = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('response', lambda r: bad404.append(r.url) if r.status >= 400 and 'library_view' in r.url else None)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        g0 = None
        for tag, hour, night in (('day', 14.0, False), ('night', 20.5, True)):
            pos = {'x': g0['R']['cx'], 'z': g0['R']['cz'], 'yaw': 0} if g0 and g0['R'] else None
            print('  [前置／捷徑] 讀檔 library_hall %s %.1f 時%s' % (tag, hour, ('，站在圓廳中間 %s' % J(pos)) if pos else ''), flush=True)
            st = {'zone': 'library_hall', 'hour': hour, 'day': 8, 'weekday': 4, 'weather': 'clear', 'flags': FLAGS}
            if pos: st['pos'] = pos
            await L.load_state(pg, st, quiet_events=True)
            await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            g = await pg.evaluate(GEO)
            if not pos and g['R']:   # 第一次不知道圓心：先讀出來，再讀一次檔站到中間
                g0 = g; pos = {'x': g['R']['cx'], 'z': g['R']['cz'], 'yaw': 0}; st['pos'] = pos
                print('  [前置／捷徑] 再讀一次，站在圓廳中間 %s' % J(pos), flush=True)
                await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
                g = await pg.evaluate(GEO)
            print('  %s：%s' % (tag, J(g)), flush=True)
            n = len(g['deg'] or [])
            check('① %s：圓窗外的景（view＝trees）有 %d 片＝圓窗數 %d' % (tag, len(g['po']), n), n > 0 and len(g['po']) >= n, '')
            want = 'library_view_trees_' + ('night' if night else 'day')
            okimg = [x for x in g['po'] if x['src'] and want in x['src'] and x['w'] > 0 and x['h'] > 0]
            check('② %s：貼圖是 %s、圖片載好了' % (tag, want), bool(g['po']) and len(okimg) == len(g['po']), J(g['po'][:3]))
            for k, deg in enumerate(g['deg'] or []):
                a = (90 - deg) * math.pi / 180; R = g['R']
                wx, wz = R['cx'] + math.cos(a) * R['r'], R['cz'] - math.sin(a) * R['r']
                await L.turn_camera_to(pg, cdp, wx, wz); await pg.wait_for_timeout(1200)
                await pg.screenshot(path=os.path.join(OUT, 'rotunda_%s_%d.png' % (tag, k)))
        check('③ 沒有 library_view_* 的 404', not bad404, J(bad404[:4]))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS[:6])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
