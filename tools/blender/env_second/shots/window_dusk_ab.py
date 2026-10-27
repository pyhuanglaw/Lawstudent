"""黃昏大廳窗外和屋外比亮度（ART-HALL-WINDOW-DUSK-1025，LAWWW2-B 2026-10-25；BB-B RELEASE-91010-TEST 附註④）。
12/10（大一上，臺北 17:06 日落）同一個時刻拍三組：
  屋外＝校園上拍窗景照片的那個位置、那個方向（tools/shots/window_views.py、library_views.py 的鏡頭），遊戲當下的畫面；
  大廳＝霖澤館、萬才館、總圖大廳裡面看南面的玻璃，改前（page.route 換回 改前資料夾 的 JS）、改後（測試樹本身）。
窗的亮度：把窗景平面藏起來再拍一張，兩張不一樣的像素＝看得到窗外的地方，算那些像素的平均亮度（線性 Y）；屋外算整張。
用法（測試樹開 http server）：
  python3 tools/blender/env_second/shots/window_dusk_ab.py <URL> <輸出資料夾> <改前 JS 資料夾（world3d.js 等）>
同一台機器上同時只跑這一個瀏覽器工作。"""
import asyncio, json, sys, os, glob
import numpy as np
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
URL, OUT, BEFORE = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 18)
PI = 3.14159265
T1720 = 17 + 20 / 60
STRIP = [17.0, 17 + 10 / 60, T1720, 17.5, 17 + 40 / 60]
SCENES = [
    {'name': 'linze', 'label': '霖澤館大廳（南面玻璃）', 'zone': 'linze', 'pos': [0, -1], 'yaw': PI, 'pitch': 0.1, 'times': STRIP,
     'out': {'pos': [30, -98], 'eye': [30.0, 2.3, -101.6], 'look': [30, 2.8, -60]}},
    {'name': 'wancai', 'label': '萬才館大廳（南面玻璃）', 'zone': 'wancai', 'pos': [0, 1.5], 'yaw': PI, 'pitch': 0.1, 'times': [T1720],
     'out': {'pos': [88, -84], 'eye': [88.0, 2.6, -85.0], 'look': [88, 2.4, -40]}},
    {'name': 'library', 'label': '總圖大廳（正面玻璃帷幕）', 'zone': 'library_hall', 'pos': [0, 3.5], 'yaw': PI, 'pitch': 0.1, 'times': [T1720],
     'out': {'pos': [80, 3], 'eye': [77, 2.0, 0], 'look': [30, 2.0, 0]}},
]
BEFORE_JS = {os.path.basename(f): open(f, 'rb').read() for f in glob.glob(os.path.join(BEFORE, '*.js'))}


def mk(data):
    async def fulfil(route): await route.fulfill(status=200, body=data, headers={'Content-Type': 'application/javascript; charset=utf-8'})
    return fulfil


def hm(h): return '%d:%02d' % (int(h), round((h % 1) * 60))


def lin(a):
    a = a / 255.0
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)


def Y(path, mask=None):
    a = lin(np.asarray(Image.open(path).convert('RGB'), dtype=float)); y = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722
    return float(y[mask].mean()) if mask is not None else float(y.mean())


async def load(pg, zone, hour, day):
    st = {'zone': zone, 'day': day, 'hour': hour, 'weather': 'sunny', 'flags': FLAGS, 'weekday': 3}
    await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
    await pg.wait_for_timeout(15000)
    await pg.evaluate("(()=>{ const E=GAME.E; E.npcs.forEach(n=>{ n.hidden=true; n.obj.visible=false; }); (E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); })()")


async def at(pg, v, hour):
    await pg.evaluate("""(v=>{ const E=GAME.E, P=E.player; if(v.pos){ P.obj.position.set(v.pos[0],0,v.pos[1]); P.path=null; if(E.setLv) E.setLv(P,0); if(E.settleY) E.settleY(P); } P.busy=true;
        GAME.G.hour=v.hour; E.applyTime(v.hour);
        if(v.eye){ E.cinematic(new THREE.Vector3(...v.eye),new THREE.Vector3(...v.look)); E.camera.position.set(...v.eye); E.cam.look=new THREE.Vector3(...v.look); E.camera.lookAt(E.cam.look); }
        else { E.endCinematic&&E.endCinematic(); const C=E.cam; C.mode='follow'; C.yaw=v.yaw; C.pitch=v.pitch; C.manualT=1e9; } })(%s)""" % json.dumps(dict(v, hour=hour)))
    await pg.wait_for_timeout(7000)


WINS = "(on=>{ GAME.E.zone.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.photo&&o.material.uniforms.tint) o.visible=on; }); })"


async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for var in ['out', 'before', 'after']:
            ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True)
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
            if var == 'before':
                for n, data in BEFORE_JS.items(): await pg.route('**/src/' + n + '*', mk(data))
            await pg.goto(URL)
            for i in range(240):
                if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
                await pg.wait_for_timeout(500)
            await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
            day = await pg.evaluate("Math.round((Date.UTC(2025,11,10)-CALENDAR.tOf(1))/864e5)+1")
            chk = await pg.evaluate("(d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; })(%d)" % day)
            print(var, 'day', day, chk, 'photoFade' + (' 有' if await pg.evaluate("!!W3.photoFade") else ' 沒有'), flush=True)
            if var == 'out':
                await load(pg, 'campus', T1720, day)
                for s in SCENES:
                    for t in s['times']:
                        await at(pg, s['out'], t); f = os.path.join(OUT, 'out_%s_%s.png' % (s['name'], hm(t).replace(':', '')))
                        await pg.screenshot(path=f); lh = await pg.evaluate("GAME.E.lightH"); res[('out', s['name'], t)] = {'Y': Y(f), 'lightH': lh}
                        print(var, s['name'], hm(t), 'lightH %.2f' % lh, 'Y %.4f' % res[('out', s['name'], t)]['Y'], errs[-1:], flush=True)
            else:
                for s in SCENES:
                    await load(pg, s['zone'], s['times'][0], day)
                    for t in s['times']:
                        await at(pg, s, t); f = os.path.join(OUT, '%s_%s_%s.png' % (var, s['name'], hm(t).replace(':', '')))
                        await pg.screenshot(path=f)
                        await pg.evaluate(WINS + "(false)"); await pg.wait_for_timeout(2500); fm = f.replace('.png', '_mask.png'); await pg.screenshot(path=fm); await pg.evaluate(WINS + "(true)")
                        a = np.asarray(Image.open(f).convert('RGB'), dtype=int); m = np.asarray(Image.open(fm).convert('RGB'), dtype=int); mask = np.abs(a - m).max(axis=2) > 6
                        xf = await pg.evaluate("(()=>{ let x=null; GAME.E.zone.group.traverse(o=>{ if(x==null&&o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.photo&&o.material.uniforms.photo.value>0.5) x=o.material.uniforms.xf?o.material.uniforms.xf.value:-1; }); return x; })()")
                        res[(var, s['name'], t)] = {'Y': Y(f, mask) if mask.sum() > 200 else None, 'px': int(mask.sum()), 'xf': xf}
                        print(var, s['name'], hm(t), json.dumps(res[(var, s['name'], t)]), errs[-1:], flush=True)
            if errs: print('ERRORS', var, json.dumps(errs, ensure_ascii=False)[:2000], flush=True)
            await ctx.close()
        await b.close()
    json.dump({'|'.join(map(str, k)): v for k, v in res.items()}, open(os.path.join(OUT, 'readings.json'), 'w'), ensure_ascii=False, indent=1)
    # 對照圖：每一列＝屋外｜改前大廳｜改後大廳（12/10 17:20）；最後一段＝霖澤館大廳 17:00～17:40 三排
    s0 = 0.5; W, H = 844, 390; w, h = int(W * s0), int(H * s0)
    def tile(d, f, txt, x, y):
        d.text((x, y), txt, fill=(20, 20, 20), font=F); sheet.paste(Image.open(f).resize((w, h)), (x, y + 24))
    rows = len(SCENES) + 3
    sheet = Image.new('RGB', (10 + 5 * (w + 10), 40 + rows * (h + 34)), (245, 245, 242)); d = ImageDraw.Draw(sheet)
    d.text((10, 8), '12/10（臺北 17:06 日落）：屋外＝拍窗景照片的位置、遊戲當下；窗＝看得到窗外的像素平均亮度（線性 Y）', fill=(20, 20, 20), font=F)
    for r, s in enumerate(SCENES):
        y = 40 + r * (h + 34); ro, rb, ra = res[('out', s['name'], T1720)], res[('before', s['name'], T1720)], res[('after', s['name'], T1720)]
        fmt = lambda v: '—' if v is None else '%.3f' % v
        tile(d, os.path.join(OUT, 'out_%s_1720.png' % s['name']), '%s 屋外 17:20（光線 %.2f）Y %s' % (s['label'][:3], ro['lightH'], fmt(ro['Y'])), 10, y)
        tile(d, os.path.join(OUT, 'before_%s_1720.png' % s['name']), '改前 大廳 17:20 窗 Y %s' % fmt(rb['Y']), 10 + (w + 10), y)
        tile(d, os.path.join(OUT, 'after_%s_1720.png' % s['name']), '改後 大廳 17:20 窗 Y %s（夜景 %d%%）' % (fmt(ra['Y']), round((ra['xf'] or 0) * 100)), 10 + 2 * (w + 10), y)
    s = SCENES[0]
    for r, var in enumerate(['out', 'before', 'after']):
        y = 40 + (len(SCENES) + r) * (h + 34)
        for c, t in enumerate(STRIP):
            q = res[(var, s['name'], t)]; f = os.path.join(OUT, ('out_%s_%s.png' if var == 'out' else var + '_%s_%s.png') % (s['name'], hm(t).replace(':', '')))
            lab = {'out': '霖澤館前屋外', 'before': '改前 大廳', 'after': '改後 大廳'}[var]
            tile(d, f, '%s %s Y %s' % (lab, hm(t), '—' if q['Y'] is None else '%.3f' % q['Y']), 10 + c * (w + 10), y)
    sheet.save(os.path.join(OUT, 'sheet.jpg'), quality=86); print('sheet', os.path.join(OUT, 'sheet.jpg'), flush=True)
asyncio.run(main())
