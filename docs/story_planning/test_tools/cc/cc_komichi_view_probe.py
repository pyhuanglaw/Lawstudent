"""CC-C（帳號 C）11-04：KOMICHI_VIEW_r2——小路（wz_teishoku）窗邊座位往外看（BB-C 21:5x 派工；LAWWW2-C 3182a6040 第二版窗景，LAWWW-C 3666310f8 接進開發分支）。只截圖、量數字，不判美術（BB 判 ART_APPROVED）。
  BB-C 原文：「坐小路窗邊的位子往外看，拍三組：14:00；22:00；18:36～19:12 白天換夜景的過渡，每 6 分鐘一張。要看的：窗外和走出去看到的一不一樣：電線桿在 −16.0，阿德是 v2.1 的外觀；
             晚上窗外不是一片黑，看得到窗戶、招牌、阿德店裡的燈；過渡的時候有沒有突然跳一下。」
  座位（src/data/komichi_layout.js v4）：窗邊第一桌（門那一側）玩家位 (−0.15, 2.9) yaw π/2、對面 (1.1, 2.9) yaw −π/2；窗在 +z 牆（z 4），玻璃 x −3.7～−3.1、−0.6～3.4。
  鏡頭（坐著的眼睛高 1.15 m、垂直 FOV 50°、1280×720）：
    door_out：玩家位往窗外正看（+z）；door_east：玩家位往窗外偏東；opp_ade：對面位往阿德的方向（阿德門口 溫州街 (−8.0, 4.6) ＝室內 (−5.2, 13.2)：室內 x＝溫州街 x＋2.8、室內 z＝溫州街 z＋17.8）。
    game：GAME.sitAt 坐在玩家位以後遊戲自己的鏡頭（玩家看得到的畫面，HUD 藏起來）。
  時間：DATE（預設 2026-06-20＝KOMICHI_STAGE 那一天）。zone.applyTime 收的是「光線用的時刻」E.lightH（engine3d.js lightHour：6/20 臺北日落約 18:47，時鐘 18:36＝光線約 18.76）；
    窗景：光線 18.6～19.2 白天照片疊成夜景照片（W3.photoFade）、19.2 換夜景圖（nightView）、白天照片 18.4～19.2 的色調 0x8a8aa8。
    T 組＝時鐘 18:36～19:12 每 6 分鐘（BB 原文，照 6/20 真的日落）；L 組＝E.sunsetFix＝18.95（光線＝時鐘），同樣 7 個時刻＝光線 18.6～19.2 整段淡入；
    scan＝時鐘 17:30～19:30 每 3 分鐘（opp_ade 一個鏡頭，只量亮度）：窗的區域（窗藏起來／不藏兩張的差）和窗以外分開算，前後兩張差多少。
  走出去對照（wenzhou）：photo＝窗景照片的鏡頭（tools/blender/env_second/wz_window_view.py：眼 (−2.8,1.25,−4.6) → (−2.8,1.25,40)、水平 90°、1024×512）和照片檔本身並排；
    ade＝同一個眼往阿德門口；exit＝從小路出來的落點 (−4.8,−4.1) 朝 +z、遊戲自己的鏡頭。店門前 x −18.5～−5 高過 4 m 的桿子列出來（同 ADE_v2 探針）並投影到 photo 鏡頭。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）、GAME.sitAt 直接坐、停主迴圈手動畫一幀、藏路人——不是玩家看到的流程。SwiftShader（雲端）≠ iPhone；顏色以電腦重拍為準。
用法：LW_TESTS=<wt>/tests [DATE=2026-06-20] [SCAN=1] [LCLOCK=1] python3 cc_komichi_view_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
DATE = os.environ.get('DATE') or '2026-06-20'
SCAN = (os.environ.get('SCAN') or '1') == '1'
LCLOCK = (os.environ.get('LCLOCK') or '1') == '1'
FAILS = []
T_TIMES = [18.6 + 0.1 * i for i in range(7)]                 # 18:36、18:42 … 19:12
SCAN_TIMES = [17.5 + 0.05 * i for i in range(41)]           # 17:30 … 19:30 每 3 分鐘
SEAT_P, SEAT_O = (-0.15, 2.9), (1.1, 2.9)
EY = 1.15
ADE_R = (-5.2, 1.5, 13.2)
CAMS = {'door_out': ([SEAT_P[0], EY, SEAT_P[1]], [SEAT_P[0], 1.2, 9.0]),
        'door_east': ([SEAT_P[0], EY, SEAT_P[1]], [2.6, 1.2, 9.0]),
        'opp_ade': ([SEAT_O[0], EY, SEAT_O[1]], list(ADE_R))}
VW, VH, VFOV = 1280, 720, 50.0
PHOTO_EYE, PHOTO_LOOK = [-2.8, 1.25, -4.6], [-2.8, 1.25, 40.0]
ADE_W = [-8.0, 1.5, 4.6]


def hh(h):
    m = int(round(h * 60)); return '%02d%02d' % (m // 60, m % 60)


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def note(s): print('  ' + s, flush=True)


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','seatMenu','choices']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
READY = """(()=>{ const z=GAME.E.zone; if(!z||!z.def||z.def.id!=='wz_teishoku') return {zone:z&&z.def&&z.def.id}; const ws=(z.wins||[]).filter(w=>w.userData&&w.userData.pview);
  const d=W3.viewPhoto('wz_teishoku',false), n=W3.viewPhoto('wz_teishoku',true); let glb=false; z.group.traverse(o=>{ if(o.userData&&o.userData.glb) glb=true; });
  return {zone:'wz_teishoku', wins:ws.length, pview:ws.map(w=>w.userData.pview), day:!!d, night:!!n, dayUrl:d&&d.image&&d.image.src?d.image.src.split('/').slice(-1)[0]:null, nightUrl:n&&n.image&&n.image.src?n.image.src.split('/').slice(-1)[0]:null}; })()"""
# 窗景材質的狀態＋窗在畫面上的範圍（四個角投影）
WININFO = """(()=>{ const E=GAME.E, z=E.zone, cam=E.camera, V=THREE.Vector3; const n=W3.viewPhoto('wz_teishoku',true), d=W3.viewPhoto('wz_teishoku',false);
  const ws=(z.wins||[]).filter(w=>w.userData&&w.userData.pview); const out=[];
  for(const w of ws){ const u=w.material.uniforms||{}; w.updateMatrixWorld(true); const g=w.geometry; g.computeBoundingBox(); const b=g.boundingBox; const pts=[[b.min.x,b.min.y],[b.max.x,b.min.y],[b.min.x,b.max.y],[b.max.x,b.max.y]].map(([x,y])=>{ const p=w.localToWorld(new V(x,y,0)).project(cam); return [+(((p.x+1)/2)*innerWidth).toFixed(0),+(((1-p.y)/2)*innerHeight).toFixed(0),+p.z.toFixed(3)]; });
    const wp=w.getWorldPosition(new V());
    out.push({pos:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], size:[+(b.max.x-b.min.x).toFixed(2),+(b.max.y-b.min.y).toFixed(2)], map:u.map?(u.map.value===n?'night':(u.map.value===d?'day':(u.map.value?'other':'none'))):null, photo:u.photo?u.photo.value:null, xf:u.xf?+u.xf.value.toFixed(3):null, map2:u.map2?(u.map2.value===n?'night':(u.map2.value?'other':'none')):null, tint:u.tint?'#'+u.tint.value.getHexString():null, depth:u.depth?u.depth.value:null, scr:pts}); }
  return {hour:+(E.hour).toFixed(4), lightH:E.lightH!=null?+E.lightH.toFixed(4):null, sunset:E.sunsetNow?+(E.sunsetNow()||0).toFixed(3):null, hemi:E.hemi?+E.hemi.intensity.toFixed(3):null, lampsOn:!!E.lampsOn, wins:out}; })()"""
AIM = """(([e,l,h,seed,fov])=>{ const E=GAME.E, G=GAME.G, cam=E.camera; E.paused=true; window.__ccSeed&&window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  if(E.applyTime) E.applyTime(h); cam.fov=fov; cam.updateProjectionMatrix(); E._shT=0; E.render(); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, fov:+cam.fov.toFixed(2), aspect:+cam.aspect.toFixed(4)};
  window.__ccFov0=fov0; return out; })"""
UNAIM = "(()=>{ const E=GAME.E, cam=E.camera; if(window.__ccFov0){ cam.fov=window.__ccFov0; cam.updateProjectionMatrix(); } if(E.endCinematic) E.endCinematic(); E.paused=false; })()"
WINVIS = """(on=>{ const z=GAME.E.zone; for(const w of (z.wins||[])) if(w.userData&&w.userData.pview) w.visible=on; GAME.E._shT=0; GAME.E.render(); return true; })"""
SIT = """(([x,z])=>{ const E=GAME.E, s=(E.zone.seats||[]).find(q=>Math.hypot(q.x-x,q.z-z)<0.1); if(!s) return {seat:null, seats:(E.zone.seats||[]).map(q=>[q.x,q.z])}; GAME.sitAt(E.player,s); const p=E.player.obj.position; return {seat:[s.x,s.z,+s.yaw.toFixed(3)], pos:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)], pose:E.player.pose||null}; })"""
POLES = r"""(()=>{ const z=GAME.E.zone, V=THREE.Vector3, out=[]; if(!z||!z.group) return out; z.group.updateMatrixWorld(true);
  z.group.traverse(o=>{ if(!o.isMesh||!o.visible) return; let nm='', hid=false; for(let p=o;p&&p!==z.group;p=p.parent){ if(!p.visible) hid=true; if(!nm&&/pole|電線桿|utility|lamp_arm|streetlight/i.test(p.name||'')) nm=p.name; } if(!nm||hid) return;
    const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new V()), sz=b.getSize(new V()); if(c.x<-18.5||c.x>-5||c.z<2.5||c.z>7) return; if(sz.y<4) return;
    out.push({name:nm, x:+c.x.toFixed(2), z:+c.z.toFixed(2), h:+sz.y.toFixed(2)}); });
  const seen={}; return out.filter(q=>{ const k=q.name+'@'+q.x.toFixed(1); if(seen[k]) return false; seen[k]=1; return true; }); })()"""
PROJ = """((pts)=>{ const cam=GAME.E.camera, V=THREE.Vector3; return pts.map(([x,y,z])=>{ const p=new V(x,y,z).project(cam); return {x:+(((p.x+1)/2)*innerWidth).toFixed(0), y:+(((1-p.y)/2)*innerHeight).toFixed(0), inFront:p.z<1, inView:p.z<1&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1}; }); })"""


def luma_stats(path, mask=None):
    """mask：同尺寸的 0/1 bytes（窗的區域）。回傳 窗、窗外 兩區的平均亮度（0～255 的 Rec.709 luma）、p95、亮像素比例（>140）"""
    from PIL import Image
    im = Image.open(path).convert('RGB'); w, h = im.size; px = im.load()
    A = {'win': [], 'rest': []}
    step = 2
    for y in range(0, h, step):
        for x in range(0, w, step):
            r, g, b = px[x, y]; l = 0.2126 * r + 0.7152 * g + 0.0722 * b
            k = 'win' if (mask is not None and mask[y * w + x]) else 'rest'
            A[k].append(l)
    out = {}
    for k, v in A.items():
        if not v: out[k] = None; continue
        v.sort(); n = len(v)
        out[k] = {'mean': round(sum(v) / n, 1), 'p95': round(v[int(n * 0.95)], 1), 'bright': round(sum(1 for q in v if q > 140) / n, 3), 'n': n}
    return out


def diff_mask(a, b, thr=10):
    from PIL import Image, ImageChops
    A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
    d = ImageChops.difference(A, B).convert('L'); w, h = d.size; px = d.load()
    m = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            if px[x, y] > thr: m[y * w + x] = 1
    return m, sum(m) / (w * h)


async def main():
    os.makedirs(OUT, exist_ok=True)
    seed = int(os.environ.get('CC_SEED') or 20261104)
    print('CC KOMICHI_VIEW_r2：DATE=%s；SCAN=%s；LCLOCK=%s；SHA=%s；SwiftShader ≠ iPhone（顏色以電腦重拍為準）' % (DATE, SCAN, LCLOCK, os.environ.get('SHA', '?')), flush=True)
    meta = {'date': DATE, 'cams': CAMS, 'vfov': VFOV, 'view': [VW, VH], 'shots': {}, 'series': {}, 'outside': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, seed)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey(%s)" % J(DATE))
        dk = await pg.evaluate("(d=>{ const c=CALENDAR.dateOf(d); return {key:c.key, wd:c.wd!=null?c.wd:c.weekday}; })(%d)" % day)
        note('[前置／捷徑] 讀檔：小路（wz_teishoku）窗邊、%s（day %s，%s）14:00、晴、條件事件關閉' % (DATE, day, J(dk)))
        await L.load_state(pg, {'zone': 'wz_teishoku', 'hour': 14.0, 'day': day, 'weather': 'clear', 'pos': {'x': -0.6, 'z': 2.3, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        r = None
        for _ in range(90):
            r = await pg.evaluate(READY)
            if r and r.get('day') and r.get('night'): break
            await pg.wait_for_timeout(1000)
        check('小路的窗景照片白天、晚上都載入了（W3.viewPhoto wz_teishoku）', bool(r and r.get('day') and r.get('night')), J(r))
        await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
        s = await pg.evaluate(SIT + '(%s)' % J(list(SEAT_P)))
        note('[捷徑] GAME.sitAt 直接坐窗邊第一桌門那一側 (−0.15, 2.9)：%s' % J(s))
        check('坐到窗邊第一桌（門那一側）', bool(s and s.get('seat')), J(s))
        await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
        await pg.set_viewport_size({'width': VW, 'height': VH}); await pg.wait_for_timeout(800)
        ss = await pg.evaluate("GAME.E.sunsetNow()")
        note('%s 臺北日落（engine3d.js sunsetAt）%.3f＝%s' % (DATE, ss, hh(ss)))
        meta['sunset'] = ss

        async def shoot(cam, h, tag, people_hidden=True):
            if people_hidden: await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
            await pg.evaluate(HUD + '(false)'); await pg.evaluate(cc_det.HIDE_LABELS_JS)
            e, l = CAMS[cam]
            ri = await pg.evaluate(AIM + '(%s)' % J([e, l, h, seed, VFOV]))
            wi = await pg.evaluate(WININFO)
            fn = 'komichi_%s_%s_%s.png' % (tag, cam, hh(h))
            await pg.screenshot(path=os.path.join(OUT, fn))
            meta['shots'][fn] = dict(ri, cam=cam, eye=e, look=l, hour=h, win=wi)
            return fn, wi

        # 窗的區域（每個鏡頭一張遮罩）：14:00、22:00 窗藏起來／不藏的差，兩張聯集
        masks = {}
        for cam in CAMS:
            mm = None
            for h in (14.0, 22.0):
                await pg.evaluate(cc_det.HIDE_PEOPLE_JS); await pg.evaluate(HUD + '(false)')
                e, l = CAMS[cam]
                await pg.evaluate(AIM + '(%s)' % J([e, l, h, seed, VFOV]))
                a = os.path.join(OUT, '_m_%s_%s_on.png' % (cam, hh(h))); c = os.path.join(OUT, '_m_%s_%s_off.png' % (cam, hh(h)))
                await pg.evaluate(WINVIS + '(true)'); await pg.screenshot(path=a)
                await pg.evaluate(WINVIS + '(false)'); await pg.screenshot(path=c)
                await pg.evaluate(WINVIS + '(true)')
                m, frac = diff_mask(a, c)
                mm = m if mm is None else bytearray(x | y for x, y in zip(mm, m))
                os.remove(a); os.remove(c)
            masks[cam] = mm
            note('%s：窗的區域占畫面 %.1f%%' % (cam, 100 * sum(mm) / len(mm)))
            meta.setdefault('maskFrac', {})[cam] = round(sum(mm) / len(mm), 4)

        # A：14:00、22:00 三個鏡頭＋遊戲自己的鏡頭
        for h in (14.0, 22.0):
            for cam in CAMS:
                fn, wi = await shoot(cam, h, 'A')
                st = luma_stats(os.path.join(OUT, fn), masks[cam]); meta['shots'][fn]['luma'] = st
                w0 = wi['wins'][0] if wi['wins'] else {}
                note('%s：光線 %.3f、窗景 %s（photo %s、xf %s、tint %s）、窗區亮度 %s、窗外 %s' % (fn, wi['lightH'], w0.get('map'), w0.get('photo'), w0.get('xf'), w0.get('tint'), J(st['win']), J(st['rest'])))
                if h == 22.0 and st['win']:
                    note('  （22:00 夜景不黑的參考數字：窗區平均 %.1f、p95 %.1f、亮像素（>140）%.1f%%——只記錄，BB 判）' % (st['win']['mean'], st['win']['p95'], 100 * st['win']['bright']))
                check('[%s %s] 窗景用照片（photo=1），%s的那一張' % (cam, hh(h), '晚上' if h >= 19.2 else '白天'), bool(w0) and w0.get('photo') == 1 and w0.get('map') == ('night' if h >= 19.2 else 'day'), J(w0))
            await pg.evaluate(UNAIM); await pg.evaluate(cc_det.SHOW_PEOPLE_JS); await pg.evaluate(HUD + '(false)')
            await pg.evaluate("(h=>{ const G=GAME.G,E=GAME.E; G.hour=h; E.hour=h; E.applyTime(h); })(%s)" % h)
            await pg.wait_for_timeout(2500)
            await pg.evaluate("(h=>{ const G=GAME.G,E=GAME.E; G.hour=h; E.hour=h; E.applyTime(h); })(%s)" % h)
            fn = 'komichi_A_game_%s.png' % hh(h)
            await pg.screenshot(path=os.path.join(OUT, fn))
            cm = await pg.evaluate("(()=>{ const c=GAME.E.camera.position, P=GAME.E.player; return {cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], seat:P.seat?[P.seat.x,P.seat.z]:null, pose:P.pose||null, hour:+GAME.G.hour.toFixed(3)}; })()")
            meta['shots'][fn] = {'cam': 'game', 'state': cm}
            note('%s：遊戲自己的鏡頭（坐著）%s' % (fn, J(cm)))

        # T：時鐘 18:36～19:12 每 6 分鐘（6/20 真的日落）
        def series_note(name, rows):
            prev = None
            for rw in rows:
                if prev and rw['luma']['win'] and prev['luma']['win']:
                    rw['dWin'] = round(rw['luma']['win']['mean'] - prev['luma']['win']['mean'], 1)
                    rw['dRest'] = round(rw['luma']['rest']['mean'] - prev['luma']['rest']['mean'], 1)
                prev = rw
            for rw in rows:
                note('  %s %s：光線 %.3f、窗景 %s xf %s tint %s、窗區平均 %s（前一張差 %s）、窗外平均 %s（差 %s）、hemi %s' % (name, hh(rw['hour']), rw['lightH'], rw['map'], rw['xf'], rw['tint'], rw['luma']['win']['mean'] if rw['luma']['win'] else None, rw.get('dWin'), rw['luma']['rest']['mean'], rw.get('dRest'), rw['hemi']))
            ds = [abs(rw['dWin']) for rw in rows if rw.get('dWin') is not None]
            if ds:
                note('  %s：窗區前後兩張的差，最大 %.1f、中位數 %.1f（最大／中位數 %.1f 倍；只記錄，BB 判有沒有跳）' % (name, max(ds), sorted(ds)[len(ds) // 2], max(ds) / max(0.1, sorted(ds)[len(ds) // 2])))

        async def series(name, times, cams, keep=True, fmt='png'):
            rows = []
            for h in times:
                for cam in cams:
                    await pg.evaluate(cc_det.HIDE_PEOPLE_JS); await pg.evaluate(HUD + '(false)')
                    e, l = CAMS[cam]
                    await pg.evaluate(AIM + '(%s)' % J([e, l, h, seed, VFOV]))
                    wi = await pg.evaluate(WININFO)
                    fn = 'komichi_%s_%s_%s.%s' % (name, cam, hh(h), fmt)
                    pth = os.path.join(OUT, fn)
                    if fmt == 'jpg': await pg.screenshot(path=pth, type='jpeg', quality=70)
                    else: await pg.screenshot(path=pth)
                    st = luma_stats(pth, masks[cam])
                    w0 = wi['wins'][0] if wi['wins'] else {}
                    rw = {'file': fn if keep else None, 'cam': cam, 'hour': h, 'lightH': wi['lightH'], 'map': w0.get('map'), 'xf': w0.get('xf'), 'tint': w0.get('tint'), 'map2': w0.get('map2'), 'hemi': wi['hemi'], 'luma': st}
                    rows.append(rw)
                    if not keep: os.remove(pth)
            return rows

        T = {}
        for cam in CAMS:
            T[cam] = await series('T', T_TIMES, [cam])
            series_note('T/' + cam, T[cam])
        meta['series']['T'] = T
        if LCLOCK:
            await pg.evaluate("GAME.E.sunsetFix=18.95")
            note('[捷徑] L 組：E.sunsetFix＝18.95（engine3d.js 測試用：光線＝時鐘），時鐘 18:36～19:12＝光線 18.6～19.2（W3.photoFade 整段）')
            Lr = {}
            for cam in ('door_out', 'opp_ade'):
                Lr[cam] = await series('L', T_TIMES, [cam])
                series_note('L/' + cam, Lr[cam])
            meta['series']['L'] = Lr
            await pg.evaluate("GAME.E.sunsetFix=null")
        if SCAN:
            sc = await series('scan', SCAN_TIMES, ['opp_ade'], keep=False, fmt='jpg')
            series_note('scan/opp_ade', sc)
            meta['series']['scan'] = sc
            # 光線跨過 18.4（白天照片色調換 0x8a8aa8）、18.6（開始疊夜景）、19.2（換夜景圖）的前後兩張
            for edge in (18.0, 18.4, 18.6, 19.2):
                for i in range(1, len(sc)):
                    if sc[i - 1]['lightH'] < edge <= sc[i]['lightH']:
                        note('  光線跨過 %.1f：%s（光線 %.3f）→ %s（光線 %.3f）窗區 %s → %s、窗外 %s → %s' % (edge, hh(sc[i - 1]['hour']), sc[i - 1]['lightH'], hh(sc[i]['hour']), sc[i]['lightH'], sc[i - 1]['luma']['win']['mean'], sc[i]['luma']['win']['mean'], sc[i - 1]['luma']['rest']['mean'], sc[i]['luma']['rest']['mean']))
        await pg.evaluate(UNAIM)

        # 走出去對照（溫州街）
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(500)
        for h in (14.0, 22.0):
            await pg.evaluate("GAME.E.paused=false")
            note('[前置／捷徑] 讀檔：溫州街 小路門口出來的落點 (−4.8, −4.1) 朝 +z、%s %s' % (DATE, hh(h)))
            await L.load_state(pg, {'zone': 'wenzhou', 'hour': h, 'day': day, 'weather': 'clear', 'pos': {'x': -4.8, 'z': -4.1, 'yaw': 0, 'lv': 0}}, quiet_events=True)
            await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            await pg.set_viewport_size({'width': VW, 'height': VH}); await pg.wait_for_timeout(1500)
            await pg.evaluate("(h=>{ const G=GAME.G,E=GAME.E; G.hour=h; E.hour=h; E.applyTime(h); })(%s)" % h)
            await pg.evaluate(HUD + '(false)'); await pg.evaluate(cc_det.HIDE_LABELS_JS)
            fn = 'outside_exit_game_%s.png' % hh(h)
            await pg.screenshot(path=os.path.join(OUT, fn)); meta['outside'][fn] = {'cam': 'game', 'hour': h}
            note('%s：從小路出來、遊戲自己的鏡頭（玩家看得到）' % fn)
            poles = await pg.evaluate(POLES)
            meta['outside']['poles_%s' % hh(h)] = poles
            note('店門前 x −18.5～−5、高過 4 m 的桿子：%s' % J(poles))
            if h == 14.0:
                check('溫州街 x −9.2、−12.7 沒有桿子，x −16.0 有一支（使用者 11-04 21:4x；同 ADE_v2）', not any(abs(q['x'] + 9.2) < 0.6 or abs(q['x'] + 12.7) < 0.6 for q in poles) and any(abs(q['x'] + 16.0) < 0.6 for q in poles), J(poles))
            await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
            # photo：窗景照片的鏡頭（水平 90°、1024×512）
            await pg.set_viewport_size({'width': 1024, 'height': 512}); await pg.wait_for_timeout(800)
            await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
            ri = await pg.evaluate(AIM + '(%s)' % J([PHOTO_EYE, PHOTO_LOOK, h, seed, 2 * math.degrees(math.atan(0.5))]))
            pj = await pg.evaluate(PROJ + '(%s)' % J([[q['x'], 4.0, q['z']] for q in poles] + [ADE_W]))
            fn = 'outside_photo_%s.png' % hh(h)
            await pg.screenshot(path=os.path.join(OUT, fn)); meta['outside'][fn] = dict(ri, eye=PHOTO_EYE, look=PHOTO_LOOK, hour=h, proj=pj)
            note('%s：窗景照片的鏡頭（眼 %s → %s、水平 90°）；桿子／阿德門口在這個畫面的位置 %s' % (fn, PHOTO_EYE, PHOTO_LOOK, J(list(zip([q['x'] for q in poles] + ['ADE門口'], pj)))))
            await pg.evaluate(UNAIM)
            await pg.set_viewport_size({'width': VW, 'height': VH}); await pg.wait_for_timeout(800)
            await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
            ri = await pg.evaluate(AIM + '(%s)' % J([PHOTO_EYE, ADE_W, h, seed, VFOV]))
            fn = 'outside_ade_%s.png' % hh(h)
            await pg.screenshot(path=os.path.join(OUT, fn)); meta['outside'][fn] = dict(ri, eye=PHOTO_EYE, look=ADE_W, hour=h)
            note('%s：同一個眼往阿德門口 (−8.0, 4.6)（對應室內 opp_ade）' % fn)
            await pg.evaluate(UNAIM)
            await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(500)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'komichi_view.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
