"""教學館室內：鏡頭穿牆的固定案例，在遊戲裡（引擎真的跟隨鏡頭）拍照、記錄鏡頭位置、判斷鏡頭和頭之間有沒有隔間牆。
修改前、修改後各跑一次（同一份案例），給 LAWWW 當回歸基準、給使用者看前後對照。
步驟：
  1. 第一次（--pick N）：從 cam_cases_pick.js 的候選（每層十幾個）裡，在遊戲裡挑「站得住」（導航格的中心＋四周 0.33 m 都能走）的前 N 個，存成固定案例 JSON。
  2. 之後（--cases 檔案）：照固定案例拍。
  每個案例：讀檔把玩家放到那個位置與樓層（[前置／捷徑]）→ 跟隨鏡頭轉到指定方向（C.yaw）→ 等畫面穩定 → 手機橫向 844×390（有 HUD）截圖。
  另外每棟拍一張剛進門（出生點、預設鏡頭）的畫面（黑色門框）。
用法：python3 tools/blender/env_second/shots/cam_cases_shots.py <URL> <輸出資料夾> (--pick N --cands 候選.json | --cases 案例.json)"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
URL, OUT = sys.argv[1], sys.argv[2]
A = sys.argv[3:]
PICK = int(A[A.index('--pick') + 1]) if '--pick' in A else 0
CANDS = A[A.index('--cands') + 1] if '--cands' in A else None
CASES = A[A.index('--cases') + 1] if '--cases' in A else None
os.makedirs(OUT, exist_ok=True)

STAND = """((x,z,lv)=>{ const E=GAME.E, nav=(E.zone.levels&&E.zone.levels[lv])||E.zone.nav; if(!nav) return false; const r=0.33;
  return [[0,0],[r,0],[-r,0],[0,r],[0,-r]].every(([dx,dz])=>nav.free(x+dx,z+dz)); })"""
# 鏡頭和頭（target）之間有沒有那一層的隔間牆（照配置的牆、扣掉門洞；2D）
CHECK = """(()=>{ const E=GAME.E, L=E.zone.layout, P=E.player, c=E.camera.position, t=E.cam.target||P.obj.position; const lv=P.lv|0;
  const segs=w=>{ const horiz=Math.abs(w.z1-w.z0)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1);
    const gaps=(w.gaps||[]).map(g=>[Math.min(g[0],g[1]),Math.max(g[0],g[1])]).sort((p,q)=>p[0]-q[0]); const out=[]; let a=a0; for(const [g0,g1] of gaps){ if(g0>a) out.push([a,g0]); a=Math.max(a,g1); } if(a<a1) out.push([a,a1]);
    return out.map(([p,q])=>horiz?[p,w.z0,q,w.z0]:[w.x0,p,w.x0,q]); };
  const cross=(ax,az,bx,bz,s)=>{ const [cx,cz,dx,dz]=s; const r=[bx-ax,bz-az], q=[dx-cx,dz-cz]; const den=r[0]*q[1]-r[1]*q[0]; if(Math.abs(den)<1e-9) return false; const tt=((cx-ax)*q[1]-(cz-az)*q[0])/den, u=((cx-ax)*r[1]-(cz-az)*r[0])/den; return tt>0&&tt<1&&u>-0.02&&u<1.02; };
  let hit=null; for(const w of L.walls){ if((w.lv|0)!==lv) continue; for(const s of segs(w)) if(cross(t.x,t.z,c.x,c.z,s)){ hit=s; break; } if(hit) break; }
  const d=Math.hypot(c.x-t.x,c.z-t.z);
  return {cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], head:[+t.x.toFixed(2),+t.y.toFixed(2),+t.z.toFixed(2)], player:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)], lv, horizDist:+d.toFixed(2), behindWall:!!hit, wall:hit, yaw:+E.cam.yaw.toFixed(3)}; })()"""
INFO = "(()=>{ const r=GAME.E.renderer.info.render; return {calls:r.calls,tris:r.triangles}; })()"


async def frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def load(pg, zone, x, z, lv, yaw=3.1416):
    st = {'zone': zone, 'hour': 10.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'lv': lv, 'yaw': yaw}, 'flags': FLAGS}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(" + json.dumps(st) + ")")
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    for i in range(80):
        ok = await pg.evaluate("(()=>{ const m=GAME.E.player.obj.userData&&GAME.E.player.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })()")
        if ok: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1500); await frames(pg, 4)


async def main():
    log = open(f'{OUT}/cases.log', 'a', encoding='utf8')
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        if PICK:
            cands = json.load(open(CANDS)); cases = []; byKey = {}
            for c in cands: byKey.setdefault((c['zone'], c['lv']), []).append(c)
            for (zone, lv), L_ in byKey.items():
                await load(pg, zone, L_[0]['x'], L_[0]['z'], lv)
                n = 0
                for c in L_:
                    if n >= PICK: break
                    if await pg.evaluate(STAND + "(%f,%f,%d)" % (c['x'], c['z'], lv)): cases.append(c); n += 1
                print(zone, lv, 'picked', n, flush=True)
            for i, c in enumerate(cases): c['id'] = f"{c['zone']}_{'2F' if c['lv'] else '1F'}_{sum(1 for d in cases[:i + 1] if d['zone'] == c['zone'] and d['lv'] == c['lv'])}"
            json.dump(cases, open(f'{OUT}/cases.json', 'w'), ensure_ascii=False, indent=1)
        else:
            cases = json.load(open(CASES))
        # 剛進門（出生點、預設鏡頭）
        for zone in ('boya', 'putong', 'gongtong'):
            sp = await pg.evaluate("(z=>{ const L={boya:typeof BOYA_LAYOUT!=='undefined'?BOYA_LAYOUT:null,putong:typeof PUTONG_LAYOUT!=='undefined'?PUTONG_LAYOUT:null,gongtong:typeof GONGTONG_LAYOUT!=='undefined'?GONGTONG_LAYOUT:null}[z]; return L&&L.entrance.spawn; })(%s)" % json.dumps(zone))
            if not sp: continue
            await load(pg, zone, sp['x'], sp['z'], sp.get('lv', 0), sp.get('yaw', 3.1416))
            await pg.wait_for_timeout(1500); await frames(pg, 6)
            r = await pg.evaluate(CHECK); r.update(await pg.evaluate(INFO)); r['id'] = f'{zone}_spawn'
            await pg.screenshot(path=f'{OUT}/{zone}_spawn.png'); log.write('case ' + json.dumps(r, ensure_ascii=False) + '\n'); log.flush(); print(r['id'], r['behindWall'], flush=True)
        for c in cases:
            await load(pg, c['zone'], c['x'], c['z'], c['lv'], c['yaw'] + 3.1416)   # 玩家面向鏡頭的反方向（背對鏡頭，像走路時）
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=y; C.manualT=999; })(%f)" % c['yaw'])
            await pg.wait_for_timeout(2500); await frames(pg, 8)
            r = await pg.evaluate(CHECK); r.update(await pg.evaluate(INFO)); r['id'] = c['id']; r['area'] = c.get('area')
            await pg.screenshot(path=f"{OUT}/{c['id']}.png"); log.write('case ' + json.dumps(r, ensure_ascii=False) + '\n'); log.flush(); print(r['id'], r['behindWall'], r['horizDist'], flush=True)
        log.write('errors ' + json.dumps(errs[:5], ensure_ascii=False) + '\n')
        await b.close()
    log.close()


asyncio.run(main())
