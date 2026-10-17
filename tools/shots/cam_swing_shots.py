"""教學館室內：貼牆時鏡頭自動轉開（engine3d.js 的 autoSwing）——在遊戲裡拍 LAWWW2 CAMERA_WALLS §1 的 10 個「鏡頭貼到頭頂上方」案例。
每個案例拍兩張（手機橫向 844×390，有 HUD；Playwright＋SwiftShader 模擬，不是 iPhone 實機）：
  held：鏡頭停在那個方向（manualT 一直 > 0＝玩家剛拖過鏡頭，不自動轉）——和 LAWWW2 的「修改後」同一個狀況，看抬高變少、往前看之後的畫面
  swing：放開 3 秒（遊戲時間）——鏡頭自動轉開之後的畫面
讀檔把玩家放到那個位置與樓層（[前置／捷徑]：位置與鏡頭方向是設定的，之後的鏡頭是引擎自己算的）。
用法：python3 tools/shots/cam_swing_shots.py <URL> <輸出資料夾>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
CASES = [('boya', 1, 16.1, 1.6, 0.7854, 'boya_2F_1'), ('boya', 1, -5.4, -1.4, 3.927, 'boya_2F_2'), ('boya', 1, 5.1, 8.1, 0.7854, 'boya_2F_4'),
         ('gongtong', 1, 11.1, 1.6, 0.0, 'gongtong_2F_2'), ('gongtong', 1, 4.1, 0.1, 3.927, 'gongtong_2F_3'), ('gongtong', 1, -4.4, 0.1, 3.927, 'gongtong_2F_4'),
         ('putong', 0, 16.1, 1.1, 0.7854, 'putong_1F_1'), ('putong', 0, -3.4, 7.1, 3.927, 'putong_1F_2'), ('putong', 1, -3.4, 7.1, 3.927, 'putong_2F_1'), ('putong', 1, 3.1, 7.1, 1.5708, 'putong_2F_4')]
# 鏡頭和頭之間有沒有那一層的隔間牆（照配置的牆、扣掉門洞；和 LAWWW2 的 cam_cases_shots.py 同一個判斷）
CHECK = """(()=>{ const E=GAME.E, L=E.zone.layout, P=E.player, c=E.camera.position, t=E.cam.target; const lv=P.lv|0;
  const segs=w=>{ const horiz=Math.abs(w.z1-w.z0)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1);
    const gaps=(w.gaps||[]).map(g=>[Math.min(g[0],g[1]),Math.max(g[0],g[1])]).sort((p,q)=>p[0]-q[0]); const out=[]; let a=a0; for(const [g0,g1] of gaps){ if(g0>a) out.push([a,g0]); a=Math.max(a,g1); } if(a<a1) out.push([a,a1]);
    return out.map(([p,q])=>horiz?[p,w.z0,q,w.z0]:[w.x0,p,w.x0,q]); };
  const cross=(ax,az,bx,bz,s)=>{ const [cx,cz,dx,dz]=s; const r=[bx-ax,bz-az], q=[dx-cx,dz-cz]; const den=r[0]*q[1]-r[1]*q[0]; if(Math.abs(den)<1e-9) return false; const tt=((cx-ax)*q[1]-(cz-az)*q[0])/den, u=((cx-ax)*r[1]-(cz-az)*r[0])/den; return tt>0&&tt<1&&u>-0.02&&u<1.02; };
  let hit=false; for(const w of L.walls){ if((w.lv|0)!==lv) continue; for(const s of segs(w)) if(cross(t.x,t.z,c.x,c.z,s)){ hit=true; break; } if(hit) break; }
  const r=E.renderer.info.render;
  return {horiz:+Math.hypot(c.x-t.x,c.z-t.z).toFixed(2), up:+(c.y-t.y).toFixed(2), behindWall:hit, yaw:+E.cam.yaw.toFixed(3), calls:r.calls, tris:r.triangles}; })()"""


async def game_time(pg, t):
    await pg.evaluate("(async t=>{ const t0=GAME.E.time; for(let i=0;i<900&&GAME.E.time<t0+t;i++) await new Promise(r=>setTimeout(r,200)); })(%f)" % t)


async def load(pg, zone, x, z, lv, yaw):
    st = {'zone': zone, 'hour': 10.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'lv': lv, 'yaw': yaw}, 'flags': FLAGS}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(" + json.dumps(st) + ")")
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    for i in range(80):
        if await pg.evaluate("(()=>{ const m=GAME.E.player.obj.userData&&GAME.E.player.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })()"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1000)


async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')&&(typeof GAME==='undefined'||!GAME.charsAllP||!!GAME.charsAll)"): break
            await pg.wait_for_timeout(500)
        has_swing = await pg.evaluate("typeof GAME.E.autoSwing==='function'")
        for zone, lv, x, z, yaw, name in CASES:
            await load(pg, zone, x, z, lv, yaw + 3.1416)   # 玩家背對鏡頭（像走路時）
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=y; C.manualT=999; C.dragging=false; C.swing=0; })(%f)" % yaw)
            await game_time(pg, 2.5)
            held = await pg.evaluate(CHECK); await pg.screenshot(path=f'{OUT}/{name}_held.png')
            await pg.evaluate("(()=>{ GAME.E.cam.manualT=0; })()")   # 放開
            await game_time(pg, 3.0)
            sw = await pg.evaluate(CHECK); await pg.screenshot(path=f'{OUT}/{name}_swing.png')
            sw['turnedDeg'] = round((sw['yaw'] - yaw) * 57.2958)
            res[name] = {'held': held, 'swing': sw}
            ok = sw['horiz'] >= 1.2 and not sw['behindWall']
            print(('PASS ' if ok else 'FAIL ') + name, 'held', held['horiz'], held['up'], '→ swing', sw['horiz'], sw['up'], f"{sw['turnedDeg']}°", 'calls', sw['calls'], flush=True)
        await b.close()
    json.dump({'autoSwing': has_swing, 'cases': res, 'errors': errs[:5]}, open(f'{OUT}/cam_swing.json', 'w'), ensure_ascii=False, indent=1)
    bad = [k for k, v in res.items() if not (v['swing']['horiz'] >= 1.2 and not v['swing']['behindWall'])]
    print('errors', errs[:3])
    print('ALL PASS' if not bad and not errs else 'FAILED ' + ','.join(bad) + (' errors' if errs else ''))


asyncio.run(main())
