"""BB-B 10-25（ART-HALL-WINDOW-DUSK-1025，LAWWW-B 17:11 第 10 項）：大廳窗景黃昏時白天照片慢慢疊成夜景——兩個版本各自用自己的程式量，同一份時刻、同一個鏡頭。
跟 LAWWW2 的 tools/blender/env_second/shots/window_dusk_ab.py 一樣的量法（載入、鏡頭、把窗景平面藏起來再拍一張找出窗的像素、線性 Y），另外多量：
  - 照「光線用的時刻」E.lightH 取樣（18.40～19.40，換夜景 19.2 前後各兩格），舊版、新版同一個光線比；
  - 冬天 12/10（臺北 17:06 日落，光線拉長）＋夏天 2026-06-20（18:47 日落）；冬天另外照 LAWWW-B 給的 17:00～17:40 每 10 分鐘；
  - 每一格記窗景 shader 的 tint、xf（夜景比例）、photo，和窗的亮度；屋外（拍窗景照片的那個位置、遊戲當下）只量冬天。
用法：python3 window_dusk_bb.py <URL> <輸出資料夾> [場景,...]   （同一台機器上同時只跑這一個瀏覽器工作；P.busy＝時間不走）"""
import asyncio, json, sys, os
import numpy as np
from playwright.async_api import async_playwright
from PIL import Image
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ONLY = sys.argv[3].split(',') if len(sys.argv) > 3 else None
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
PI = 3.14159265
LH = [18.4, 18.6, 18.75, 18.9, 19.05, 19.15, 19.19, 19.21, 19.25, 19.4]   # 光線用的時刻
WCLK = [17.0, 17 + 10 / 60, 17 + 20 / 60, 17.5, 17 + 40 / 60]            # 冬天另外照時鐘
DAYS = {'winter': '2025-12-10', 'summer': '2026-06-20'}
SCENES = [   # 同 window_dusk_ab.py（LAWWW2）
    {'name': 'linze', 'zone': 'linze', 'pos': [0, -1], 'yaw': PI, 'pitch': 0.1, 'out': {'pos': [30, -98], 'eye': [30.0, 2.3, -101.6], 'look': [30, 2.8, -60]}},
    {'name': 'wancai', 'zone': 'wancai', 'pos': [0, 1.5], 'yaw': PI, 'pitch': 0.1, 'out': {'pos': [88, -84], 'eye': [88.0, 2.6, -85.0], 'look': [88, 2.4, -40]}},
    {'name': 'library', 'zone': 'library_hall', 'pos': [0, 3.5], 'yaw': PI, 'pitch': 0.1, 'out': {'pos': [80, 3], 'eye': [77, 2.0, 0], 'look': [30, 2.0, 0]}},
]
if ONLY: SCENES = [s for s in SCENES if s['name'] in ONLY]
SEAS = [x for x in os.environ.get('WD_SEASONS', '').split(',') if x] or list(DAYS)   # BB-B 18:4x：只量某些季節／只量屋外（夏天屋外補量）
WHERE = [x for x in os.environ.get('WD_WHERE', '').split(',') if x] or None
def lin(a):
    a = a / 255.0
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
def Y(path, mask=None):
    a = lin(np.asarray(Image.open(path).convert('RGB'), dtype=float)); y = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722
    return float(y[mask].mean()) if mask is not None else float(y.mean())
async def load(pg, zone, hour, key):
    st = {'zone': zone, 'hour': hour, 'weather': 'sunny', 'flags': FLAGS}
    await pg.evaluate("((st,k)=>{ st.day=STORY.dayOfKey(k); const w=CALENDAR.dateOf(st.day).wd; st.weekday=w===7?0:w; window.__ST=st; })(%s,%s)" % (json.dumps(st), json.dumps(key)))
    await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,window.__ST); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()")
    await pg.wait_for_timeout(15000)
    await pg.evaluate("(()=>{ const E=GAME.E; E.npcs.forEach(n=>{ n.hidden=true; n.obj.visible=false; }); (E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); })()")
async def at(pg, v, hour, wait):
    await pg.evaluate("""(v=>{ const E=GAME.E, P=E.player; if(v.pos){ P.obj.position.set(v.pos[0],0,v.pos[1]); P.path=null; if(E.setLv) E.setLv(P,0); if(E.settleY) E.settleY(P); } P.busy=true;
        GAME.G.hour=v.hour; E.hour=v.hour; E.applyTime(v.hour);
        if(v.eye){ E.cinematic(new THREE.Vector3(...v.eye),new THREE.Vector3(...v.look)); E.camera.position.set(...v.eye); E.cam.look=new THREE.Vector3(...v.look); E.camera.lookAt(E.cam.look); }
        else { E.endCinematic&&E.endCinematic(); const C=E.cam; C.mode='follow'; C.yaw=v.yaw; C.pitch=v.pitch; C.manualT=1e9; } })(%s)""" % json.dumps(dict(v, hour=hour)))
    await pg.wait_for_timeout(wait)
WINS = "(on=>{ GAME.E.zone.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.photo&&o.material.uniforms.tint) o.visible=on; }); })"
UNI = """(()=>{ const r=[]; GAME.E.zone.group.traverse(o=>{ const u=o.isMesh&&o.material&&o.material.uniforms; if(!u||!u.photo||!u.tint) return; r.push({photo:u.photo.value, tint:'#'+u.tint.value.getHexString(), xf:u.xf?+u.xf.value.toFixed(3):null}); });
  const k={}; for(const x of r){ const s=JSON.stringify(x); k[s]=(k[s]||0)+1; } return {n:r.length, kinds:k, lightH:+GAME.E.lightH.toFixed(3), hour:+GAME.G.hour.toFixed(3)}; })()"""
CLK = "((lh,ss)=>{ let a=15, b=24; for(let i=0;i<60;i++){ const m=(a+b)/2; if(GAME.E.lightHour(m,ss)<lh) a=m; else b=m; } return (a+b)/2; })"   # 光線 lh 那一刻的時鐘（二分）
async def main():
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
        print('photoFade', await pg.evaluate("typeof W3!=='undefined'&&!!W3.photoFade"), flush=True)
        for season, key in DAYS.items():
            if season not in SEAS: continue
            for s in SCENES:
                for where in (WHERE or (['out', 'in'] if season == 'winter' else ['in'])):
                    await load(pg, 'campus' if where == 'out' else s['zone'], 18.0, key)
                    ss = await pg.evaluate("GAME.E.sunsetNow()")
                    clocks = [(await pg.evaluate(CLK + "(%s,%s)" % (lh, ss)), 'L%.2f' % lh) for lh in LH] + ([(c, 'C%02d%02d' % (int(c), round(c % 1 * 60))) for c in WCLK] if season == 'winter' else [])
                    first = True
                    for clk, tag in clocks:
                        v = s['out'] if where == 'out' else s
                        await at(pg, v, clk, 9000 if first else 3500); first = False
                        f = os.path.join(OUT, '%s_%s_%s_%s.png' % (season, s['name'], where, tag)); await pg.screenshot(path=f)
                        u = await pg.evaluate(UNI); row = dict(season=season, scene=s['name'], where=where, tag=tag, clock=round(clk, 3), sunset=round(ss, 3), **u)
                        if where == 'in':
                            await pg.evaluate(WINS + "(false)"); await pg.wait_for_timeout(2000); fm = f.replace('.png', '_mask.png'); await pg.screenshot(path=fm); await pg.evaluate(WINS + "(true)")
                            a = np.asarray(Image.open(f).convert('RGB'), dtype=int); m = np.asarray(Image.open(fm).convert('RGB'), dtype=int); mask = np.abs(a - m).max(axis=2) > 6
                            row.update(px=int(mask.sum()), Y=round(Y(f, mask), 5) if mask.sum() > 200 else None, Yall=round(Y(f), 5)); os.remove(fm)
                        else: row.update(Y=round(Y(f), 5))
                        res.append(row); print(json.dumps(row, ensure_ascii=False), flush=True)
        print('JS 例外', errs[:5], flush=True)
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'readings.json'), 'w'), ensure_ascii=False, indent=1)
    print('PASS 量完' if not errs else 'FAIL 有 JS 例外')
asyncio.run(main())
