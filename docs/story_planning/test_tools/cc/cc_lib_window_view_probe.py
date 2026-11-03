"""CC（帳號 A）11-03：總圖大廳二樓的窗外是哪一張圖（BB 22:43：「從總圖二樓窗邊往辛亥路方向看」）。
  總圖大廳的窗外不是即時 3D，是貼上去的照片（src/library3d.js:59 VIEW_URL、library_hall_v2.js outPlane）；這支記下每一片窗外平面的 view 名稱、位置、貼圖，
  然後每一種 view 挑一片：站到二樓離它最近、站得住的格子（【前置／捷徑】讀檔到 library_hall 第 1 層那一格），鏡頭轉向它，截一張。
  檢查（只是記錄用）：① 有窗外平面 ② 截到的每一片貼圖都載好了（寬高 > 0） ③ 沒有 JS 例外
用法：LW_TESTS=<wt>/tests python3 cc_lib_window_view_probe.py <url> <out>"""
import os, sys, json, asyncio
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


PLANES = """(()=>{ const z=GAME.E.zone||{}; return (z.pOuts||[]).filter(o=>o.userData&&o.userData.view).map(o=>{ const m=o.material||{}, u=m.uniforms, t=(u&&(u.map||u.tMap||u.uMap))?(u.map||u.tMap||u.uMap).value:m.map, img=t&&t.image;
  const p=o.getWorldPosition(new THREE.Vector3()); return {view:o.userData.view, x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), src:img?String(img.currentSrc||img.src||'').split('/').pop():null, w:img?(img.naturalWidth||img.width||0):0}; }); })()"""
NEAR = """(([x,z])=>{ const E=GAME.E, nv=(E.levels&&E.levels[1])||E.nav; let best=null;
  for(let r=0.5;r<=4.01&&!best;r+=0.25) for(let a=0;a<360;a+=10){ const px=x+Math.cos(a*Math.PI/180)*r, pz=z+Math.sin(a*Math.PI/180)*r; if(nv.free(px,pz)){ best=[+px.toFixed(2),+pz.toFixed(2)]; break; } }
  return best; })(%s)"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        st = {'zone': 'library_hall', 'hour': 14.0, 'day': 8, 'weekday': 4, 'weather': 'clear', 'flags': FLAGS}
        print('  [前置／捷徑] 讀檔 library_hall 14:00', flush=True)
        await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
        planes = await pg.evaluate(PLANES)
        with open(os.path.join(OUT, 'planes.json'), 'w', encoding='utf-8') as f: json.dump(planes, f, ensure_ascii=False, indent=1)
        print('  窗外平面 %d 片：%s' % (len(planes), J(sorted({(q['view'], q['src']) for q in planes}))), flush=True)
        check('① 有窗外平面', bool(planes))
        up = [q for q in planes if q['y'] > 3.0] or planes   # 二樓的窗（y > 3 m）；沒有就全部
        done = {}
        for q in sorted(up, key=lambda q: q['view']):
            if q['view'] in done: continue
            at = await pg.evaluate(NEAR % J([q['x'], q['z']]))
            if not at: print('  %s：二樓附近 4 m 內沒有站得住的格子' % q['view'], flush=True); continue
            print('  [前置／捷徑] 讀檔站到二樓 %s，看 %s (%s,%s,%s)' % (at, q['view'], q['x'], q['y'], q['z']), flush=True)
            await L.load_state(pg, dict(st, pos={'x': at[0], 'z': at[1], 'yaw': 0, 'lv': 1}), quiet_events=True); await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
            await L.turn_camera_to(pg, cdp, q['x'], q['z'])
            await pg.evaluate("(()=>{ const c=GAME.E.cam; c.pitch=0.02; c.dist=c.distTarget=2.2; })()"); await pg.wait_for_timeout(1500)   # 【捷徑】鏡頭放低，只為了截窗
            fn = 'window_%s.png' % q['view']; await pg.screenshot(path=os.path.join(OUT, fn)); done[q['view']] = dict(q, stand=at, shot=fn)
        print('  截到：' + J(done), flush=True)
        check('② 截到的窗外貼圖都載好了', bool(done) and all(v['w'] > 0 for v in done.values()), J({k: v['src'] for k, v in done.items()}))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
