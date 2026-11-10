"""CC（帳號 A）11-10：X223 NTU-REF-AUDIT 遊戲畫面（BB 13:25 選 (c)：只拍遊戲畫面，同角度疊圖等 BB 問使用者；LAWWW 13:02 ⑥＋13:24 四項）。
改後 48aa47a5b（晨思鐘無頂金屬鐘架、行政大樓紅磚北棟 2 層、文學院／校史館土黃面磚、男一舍灰清水模＋樓梯塔圓窗、共同舊館紅磚＋西翼米色、映月湖綠琉璃亭＋紅欄杆＋垂柳、研三舍拿掉＝草地）；
改前 74da28ca9（X223 這幾項之前）。
【前置／捷徑】load_zone 讀檔到 campus（大道 (−20, 0.5)）2025-10-18 14:00 晴，等正式模型都載完（ASSETS 沒有在下載的）。
每個鏡頭用另一台相機（同一個場景、同一個 renderer；拍的時候藏玩家和路人），桌機大小 1280×720、fov 55：
  有現成鏡頭的照 tests/campus_glb_integration.py 的 VIEWS（bell_avenue、bell_close、admin_front、arts_front、hist_front、hist_porch、m1_front）；
  共同教學館、映月湖照正式模型的包圍盒自動擺（往大道那一側斜 30° 看、再一張高一點的全景）；研三舍原址 (63, −108) 從北、東各一張。
只拍、只記鏡頭和模型有沒有載到，不判美術（判定 BB；照片疊圖另外）。Playwright（PC GPU）≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_x223_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
R = L.Run('x223_shots_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
FIXED = [('bell', 'bell_avenue', (-38, 1.7, 4), (-38, 3.0, 16.5)), ('bell', 'bell_close', (-35.6, 1.6, 12.4), (-38, 2.8, 16.5)),
         ('admin', 'admin_front', (-30, 1.7, 14), (-38, 6, 28)), ('arts', 'arts_front', (-30, 1.7, -12), (-38, 6, -28)),
         ('hist', 'hist_front', (-69, 1.7, -8), (-77, 6, -24)), ('hist', 'hist_porch', (-74.5, 1.7, -14.2), (-77, 4.6, -19.4)),
         ('male1', 'm1_front', (14, 1.7, 50), (20, 6, 64)),
         ('r3site', 'r3_from_north', (63, 1.7, -93), (63, 3, -108)), ('r3site', 'r3_from_east', (78, 1.7, -108), (63, 3, -108))]
AUTO = [('gongtong', 'campus_gongtong_glb'), ('lake', 'campus_lake_glb')]
if os.environ.get('VIEWS'):   # e9af13061 套件五棟（LAWWW 13:44 ②）：VIEWS＝名稱:眼x:眼y:眼z:看x:看y:看z，用 + 分隔；給了就只拍這些（每個另加一張高空 _air），不拍上面那幾棟
    FIXED = []; AUTO = []
    for v in os.environ['VIEWS'].split('+'):
        nm, *f = v.split(':'); f = [float(x) for x in f]; FIXED.append((nm.split('_')[0], nm, tuple(f[:3]), tuple(f[3:6])))
        FIXED.append((nm.split('_')[0], nm + '_air', (f[3] + (f[0] - f[3]) * 1.3, 30.0, f[5] + (f[2] - f[5]) * 1.3), (f[3], 2.0, f[5])))
GLBS = ['campus_bell_glb', 'campus_admin_glb', 'campus_arts_glb', 'campus_hist_glb', 'campus_male1_glb', 'campus_gongtong_glb', 'campus_lake_glb']
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
BOXES = r"""((names)=>{ const out={}; const g=GAME.E.zone.group; for(const n of names){ const o=g.children.find(c=>c.name===n); if(!o){ out[n]=null; continue; } let m=0; o.traverse(q=>{ if(q.isMesh) m++; });
  const b=new THREE.Box3().setFromObject(o); out[n]={meshes:m, vis:o.visible, min:[b.min.x,b.min.y,b.min.z].map(v=>+v.toFixed(1)), max:[b.max.x,b.max.y,b.max.z].map(v=>+v.toFixed(1))}; } return out; })"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(55, c.width/c.height, 0.1, 2000); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[]; const P=E.player.obj; hid.push([P,P.visible]); P.visible=false; for(const n of (E.npcs||[])) if(n.obj){ hid.push([n.obj,n.obj.visible]); n.obj.visible=false; }
  try{ r.render(E.scene,cam); } finally { for(const [o,v] of hid) o.visible=v; } return c.toDataURL('image/png'); })"""


async def snap(pg, fn, frm, at):
    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at)}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X223 遊戲畫面：worktree %s；TAG %s；Playwright（PC GPU）≠ iPhone' % (real or '?', TAG), flush=True)
    shots = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 campus (−20, 0.5) 2025-10-18 14:00')
        await D.load_zone(pg, cdp, 'campus', '2025-10-18', 14.0, x=-20, z=0.5, yaw=0.0, wait=12000)
        n = await pg.evaluate(SETTLED); R.note('等模型載完：%s 次（-1＝逾時）' % n)
        await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(2000)
        bx = await pg.evaluate(BOXES, GLBS); R.note('正式模型：%s' % J(bx))
        for k, nm in ([] if os.environ.get('VIEWS') else (('bell', 'campus_bell_glb'), ('admin', 'campus_admin_glb'), ('arts', 'campus_arts_glb'), ('hist', 'campus_hist_glb'), ('male1', 'campus_male1_glb'), ('gongtong', 'campus_gongtong_glb'), ('lake', 'campus_lake_glb'))):
            R.check('%s 的正式模型 %s 有載入（有網格）' % (k, nm), bool(bx.get(nm) and bx[nm]['meshes'] > 0), J(bx.get(nm)))
        for k, name, frm, at in FIXED:
            fn = 'x223_%s_%s.png' % (TAG, name); await snap(pg, fn, frm, at); shots.append({'what': k, 'view': name, 'from': frm, 'at': at, 'file': fn})
        for k, nm in AUTO:
            q = bx.get(nm)
            if not q: R.note('%s 沒有 %s，不拍' % (k, nm)); continue
            c = [(q['min'][i] + q['max'][i]) / 2 for i in range(3)]; sx, sz = q['max'][0] - q['min'][0], q['max'][2] - q['min'][2]
            rad = max(sx, sz) * 0.75 + 6; dz = 1 if c[2] < 0 else -1   # 往大道（z≈0）那一側
            for i, (name, ang, h) in enumerate((('front', 0.52, 1.7), ('wide', 0.52, max(8, rad * 0.5)))):
                frm = (round(c[0] + math.sin(ang) * rad * (1.0 if i == 0 else 1.4), 2), h, round(c[2] + dz * math.cos(ang) * rad * (1.0 if i == 0 else 1.4), 2)); at = (round(c[0], 2), round(max(2.0, c[1] * 0.6), 2), round(c[2], 2))
                fn = 'x223_%s_%s_%s.png' % (TAG, k, name); await snap(pg, fn, frm, at); shots.append({'what': k, 'view': '%s_%s' % (k, name), 'from': frm, 'at': at, 'file': fn})
            frm = (round(c[0], 2), round(max(18, rad * 1.1), 2), round(c[2] + dz * rad * 0.9, 2)); at = (round(c[0], 2), 0.5, round(c[2], 2))   # r2：映月湖平視被大樓擋住＝加一張高空斜俯視
            fn = 'x223_%s_%s_air.png' % (TAG, k); await snap(pg, fn, frm, at); shots.append({'what': k, 'view': '%s_air' % k, 'from': frm, 'at': at, 'file': fn})
        json.dump({'boxes': bx, 'shots': shots}, open(os.path.join(OUT, 'x223_%s.json' % TAG), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        R.note('拍了 %d 張：%s' % (len(shots), J([s['file'] for s in shots])))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
