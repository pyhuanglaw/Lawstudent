"""CC-C（帳號 C）11-04：GG_REENTRY——公館窗卡「重複進區域」驗收探針（BB-C 12:53 規格；GG_night 真因＝第二次建公館時 ggShopLit 對共用材質再包一層 onBeforeCompile，
  shader 'uv1'／'vShopIdx'／'uShopLit' redefinition、LINK_STATUS false，整張窗卡不畫）。
  流程（同一頁）：每一輪 = [前置／捷徑] 讀檔到公館人行道（HOURS 的那個時間）→ 量 → GAME.enter('campus')（遊戲自己的換區域）→ GAME.enter('gongguan') 回人行道 → 量。
  預設兩輪：14:00、21:00（共 4 次進公館；第 1 次是讀檔建的，之後都是第 2～4 次建公館）。
  每一次進公館，14 個卡面框（座標同 cc_gg_cards_shot_probe.py）各拍三張：原樣、窗卡網格 m.visible=false（「藏」）、m.material color／emissive＝0（「黑」），量框內平均亮度（瀏覽器內解 PNG，不用 PIL）。
  判定（每一次進公館）：
    ① 窗卡網格 NOSHADOW_xs_fronts_lit 的 program LINK_STATUS＝true；
    ② 每張卡「有畫」：|原樣 − 藏| ≥ DRAWN_MIN（預設 4）——壞掉時網格沒畫，藏不藏都一樣；
    ③ 營業的店「亮」：原樣 − 黑 ≥ LIT_MIN（預設 8）；打烊的店「暗」：原樣 − 黑 < LIT_MIN（營業／打烊照 GAME.E.zone.ggLit.lit 和 xsShops 順序）；
    ④ 整支跑完 console 沒有 THREE.WebGLProgram／Shader Error／redefinition。
  修改前對照：060a1a093 必須 FAIL（第 2 次以後 ①②），修好的 SHA PASS（BB_229）。Playwright（PC 有 GPU、有視窗／雲端 SwiftShader）≠ iPhone 實機。
用法：LW_TESTS=<wt>/tests [HOURS=14,21] [CARDS=ggtea_int,ggdb_int] python3 cc_gg_reentry_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ALLC = {   # key: (棟, 店, x0, x1, y0, y1, 卡面 z)——同 cc_gg_cards_shot_probe.py（23eaaa7ae gongguan_shops.glb 讀出來的世界座標）
    'ggtea_int':    ('G01', '青木茶室', -53.47, -50.27, 0.79, 2.50, 22.8),
    'ggtea_take':   ('G01', '青木茶室', -56.44, -55.14, 1.20, 2.45, 22.4),
    'ggbook_int':   ('G02', '頁間書屋', -46.60, -42.00, 0.55, 2.85, 22.8),
    'ggbook_int2':  ('G02', '頁間書屋', -42.00, -37.40, 0.55, 2.85, 22.8),
    'ggcvs_int':    ('G03', '日和便利店', -31.73, -27.47, 0.08, 2.73, 22.8),
    'ggcvs_side':   ('G03', '日和便利店', -27.35, -23.50, 0.08, 2.73, 22.8),
    'ggyy_int':     ('G05', '洋洋鹹酥雞', -13.4, -5.4, 0.80, 2.60, 22.8),
    'ggbike_int2':  ('G06', '慢輪單車', -3.80, -1.45, 0.75, 2.55, 22.8),
    'ggbike_int':   ('G06', '慢輪單車', 0.90, 4.70, 0.85, 2.55, 22.8),
    'ggafar_int':   ('G07', 'Afar café', 8.75, 10.80, 0.73, 2.68, 22.8),
    'ggafar_win':   ('G07', 'Afar café', 10.80, 14.40, 0.73, 2.68, 22.8),
    'ggcorner_int': ('G12', '轉角唱片', 54.91, 57.60, 0.64, 2.81, 22.8),
    'ggcorner_win': ('G12', '轉角唱片', 57.60, 58.99, 0.64, 2.81, 22.8),
    'ggdb_int':     ('G14', 'Daybreak', 71.62, 76.41, 0.76, 2.53, 22.8),
}
SEL = [k for k in (os.environ.get('CARDS') or ','.join(ALLC)).split(',') if k in ALLC]
HOURS = [float(x) for x in (os.environ.get('HOURS') or '14,21').split(',') if x.strip()]
DRAWN_MIN = float(os.environ.get('DRAWN_MIN') or 4)
LIT_MIN = float(os.environ.get('LIT_MIN') or 8)
GLB = 'gongguan_shops_glb'
SPAWN = {'x': -30, 'z': 14, 'yaw': 1.5708}
EYE_Z, EYE_Y = 20.0, 1.6
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


def info(name, txt):
    print('INFO ' + name + '  ' + txt, flush=True)


TWO_FRAMES = "new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true))))"
GLBREADY = "(()=>{ const z=GAME.E.zone; if(!z||!z.group||GAME.G.zone!=='gongguan') return false; const g=z.group.children.find(o=>o.name==='%s'); if(!g) return false; let m=0; g.traverse(o=>{ if(o.isMesh) m++; }); return m>0; })()" % GLB
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
HUD = """(on=>{ const c=GAME.E.renderer.domElement; const keep=new Set(); for(let n=c;n;n=n.parentElement) keep.add(n);
  document.querySelectorAll('body *').forEach(el=>{ if(keep.has(el)||c.contains(el)) return; if(el.parentElement&&keep.has(el.parentElement)){ if(on){ if(el.dataset.ccVis!==undefined){ el.style.visibility=el.dataset.ccVis; delete el.dataset.ccVis; } } else { el.dataset.ccVis=el.style.visibility||''; el.style.visibility='hidden'; } } }); })"""
QUAD = """(c=>{ const E=GAME.E; E.camera.updateMatrixWorld(); const [x0,x1,y0,y1,zz]=c;
  return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>{ const v=new THREE.Vector3(x,y,zz).project(E.camera); return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z]; }); })"""
# 窗卡網格、program 狀態、營業表（ggLit.lit[i+1] 對 xsShops 第 i 間）
STATE_JS = r"""(()=>{ const E=GAME.E, z=E.zone, g=z&&z.group, o={zone:GAME.G.zone, hour:+GAME.G.hour, enterN:GAME.enterN|0};
  const m=g&&g.getObjectByName('NOSHADOW_xs_fronts_lit'); o.found=!!m;
  if(m){ const M=m.material, R=E.renderer, p=R.properties.get(M), pr=p&&p.currentProgram; o.mat=M.name; o.matUuid=M.uuid.slice(0,8); o.visible=m.visible;
    try{ const gl=R.getContext(); if(pr&&pr.program){ o.link=gl.getProgramParameter(pr.program,gl.LINK_STATUS); o.vlog=(gl.getShaderInfoLog(pr.vertexShader)||'').slice(0,240); o.flog=(gl.getShaderInfoLog(pr.fragmentShader)||'').slice(0,240);
      const fs=gl.getShaderSource(pr.fragmentShader)||''; o.uShopLitDecl=(fs.match(/uniform\s+float\s+uShopLit/g)||[]).length; } else o.link='no program'; }catch(e){ o.link='ERR '+String(e).slice(0,80); } }
  const L=z&&z.ggLit; o.lit=L&&L.lit?Array.from(L.lit):null;
  let ex=null; if(g) g.traverse(q=>{ if(!ex&&q.userData&&q.userData.xsShops) ex=q.userData.xsShops; }); o.ids=String(ex||'ggtea,ggbook,ggcvs,ggyy,ggbike,ggafar,ggcorner,ggdb').split(',');
  return o; })()"""
SET_JS = r"""(async(step,on)=>{ const g=GAME.E.zone.group, m=g&&g.getObjectByName('NOSHADOW_xs_fronts_lit'), W=window.__ccRe||(window.__ccRe={}); if(!m) return 0;
  if(step==='hide'){ if(on){ W.v=m.visible; m.visible=false; } else m.visible=W.v; }
  else { const M=m.material; if(on){ W.c=M.color.clone(); W.e=M.emissive.clone(); M.color.setScalar(0); M.emissive.setScalar(0); } else { M.color.copy(W.c); M.emissive.copy(W.e); } }
  await """ + TWO_FRAMES + """; return 1; })"""
# 截圖（PNG base64）在瀏覽器裡解、量框內平均亮度（Rec.601），不用 PIL（PC 沒有）
LUMA_JS = r"""(async(b64,box)=>{ const r=await fetch('data:image/png;base64,'+b64); const bmp=await createImageBitmap(await r.blob());
  const sx=bmp.width/innerWidth, sy=bmp.height/innerHeight; const xs=box.map(p=>p[0]*sx), ys=box.map(p=>p[1]*sy);
  const x0=Math.max(0,Math.floor(Math.min(...xs))), x1=Math.min(bmp.width,Math.ceil(Math.max(...xs))), y0=Math.max(0,Math.floor(Math.min(...ys))), y1=Math.min(bmp.height,Math.ceil(Math.max(...ys)));
  if(x1-x0<2||y1-y0<2) return null; const c=new OffscreenCanvas(x1-x0,y1-y0), cx=c.getContext('2d'); cx.drawImage(bmp,-x0,-y0); const d=cx.getImageData(0,0,x1-x0,y1-y0).data;
  let s=0; for(let i=0;i<d.length;i+=4) s+=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; return +(s/(d.length/4)).toFixed(1); })"""

# 兩張截圖框內逐像素的亮度差平均（CC-C 11-04：平均亮度會碰巧一樣——轉角唱片、書屋第二張的窗卡和後面的牆一樣亮；壞掉時兩張圖幾乎完全相同）
DIFF_JS = r"""(async(a64,b64,box)=>{ const ld=async b=>createImageBitmap(await (await fetch('data:image/png;base64,'+b)).blob()); const A=await ld(a64), B=await ld(b64);
  const sx=A.width/innerWidth, sy=A.height/innerHeight; const xs=box.map(p=>p[0]*sx), ys=box.map(p=>p[1]*sy);
  const x0=Math.max(0,Math.floor(Math.min(...xs))), x1=Math.min(A.width,Math.ceil(Math.max(...xs))), y0=Math.max(0,Math.floor(Math.min(...ys))), y1=Math.min(A.height,Math.ceil(Math.max(...ys)));
  if(x1-x0<2||y1-y0<2) return null; const W=x1-x0, H=y1-y0; const px=bm=>{ const c=new OffscreenCanvas(W,H), x=c.getContext('2d'); x.drawImage(bm,-x0,-y0); return x.getImageData(0,0,W,H).data; };
  const da=px(A), db=px(B); let s=0; for(let i=0;i<da.length;i+=4){ s+=Math.abs((0.299*da[i]+0.587*da[i+1]+0.114*da[i+2])-(0.299*db[i]+0.587*db[i+1]+0.114*db[i+2])); } return +(s/(da.length/4)).toFixed(2); })"""


async def shot_luma(pg, box, fn=None, keep=None):
    png = await pg.screenshot(path=fn) if fn else await pg.screenshot()
    b64 = base64.b64encode(png).decode()
    if keep is not None: keep.append(b64)
    return await pg.evaluate(LUMA_JS + '(%s,%s)' % (J(b64), J(box)))


async def wait_glb(pg, t1):
    for _ in range(480):
        if await pg.evaluate(GLBREADY): return round(time.time() - t1, 2)
        await pg.wait_for_timeout(250)
    return None


async def measure(pg, tag):
    """一次進公館：狀態＋14 框三種亮度＋判定"""
    await pg.wait_for_timeout(3000)
    st = await pg.evaluate(STATE_JS)
    info('[%s] 窗卡狀態' % tag, J(st))
    check('[%s] 窗卡網格找得到' % tag, st.get('found'), '')
    check('[%s] 窗卡 program LINK_STATUS＝true' % tag, st.get('link') is True, J({k: st.get(k) for k in ('link', 'vlog', 'flog', 'uShopLitDecl', 'matUuid')}))
    lit, ids = st.get('lit') or [], st.get('ids') or []
    await pg.evaluate(HUD + '(false)')
    rows = {}
    for k in SEL:
        G, shop, x0, x1, y0, y1, zz = ALLC[k]; cx = round((x0 + x1) / 2, 3); pre = k.split('_')[0]
        idx = ids.index(pre) + 1 if pre in ids else None
        open_ = (lit[idx] > 0.99) if (idx is not None and idx < len(lit)) else True
        await pg.evaluate(AIM + '(%s,%s)' % (J([cx, EYE_Y, EYE_Z]), J([cx, EYE_Y, zz])))
        await pg.wait_for_timeout(400)
        box = await pg.evaluate(QUAD + '(%s)' % J([x0, x1, y0, y1, zz]))
        kp = []
        base = await shot_luma(pg, box, os.path.join(OUT, 'card_%s_%s.png' % (tag, k)), kp)
        await pg.evaluate(SET_JS + "('hide',true)"); await pg.wait_for_timeout(200)
        hid = await shot_luma(pg, box, None, kp); await pg.evaluate(SET_JS + "('hide',false)")
        pxd = await pg.evaluate(DIFF_JS + '(%s,%s,%s)' % (J(kp[0]), J(kp[1]), J(box))) if len(kp) == 2 else None
        await pg.evaluate(SET_JS + "('black',true)"); await pg.wait_for_timeout(200)
        blk = await shot_luma(pg, box); await pg.evaluate(SET_JS + "('black',false)"); await pg.wait_for_timeout(200)
        r = {'shop': shop, 'idx': idx, 'open': open_, 'luma': base, 'hidden': hid, 'black': blk, 'pxdiff_hidden': pxd}
        rows[k] = r
        drawn = pxd is not None and pxd >= DRAWN_MIN   # 原樣和藏網格兩張圖，框內逐像素亮度差的平均（壞掉時 ≈0）
        check('[%s] %s %s 窗卡有畫（原樣 vs 藏網格 逐像素差 ≥%s）' % (tag, G, k, DRAWN_MIN), drawn, J(r))
        if None not in (base, blk):
            if open_: check('[%s] %s %s 營業→亮（原樣−黑≥%s）' % (tag, G, k, LIT_MIN), base - blk >= LIT_MIN, '%.1f−%.1f' % (base, blk))
            else: check('[%s] %s %s 打烊→暗（原樣−黑<%s）' % (tag, G, k, LIT_MIN), base - blk < LIT_MIN, '%.1f−%.1f' % (base, blk))
    await pg.evaluate(HUD + '(true)')
    return {'state': st, 'cards': rows}


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC GG_REENTRY 公館窗卡重複進區域；SHA=%s；HOURS=%s；CARDS=%s；Playwright，不是手機實機' % (os.environ.get('SHA', '?'), HOURS, ','.join(SEL)), flush=True)
    res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        shad, other = [], []
        def _con(m):
            t = m.text or ''
            if m.type in ('error', 'warning') and any(w in t for w in ('WebGLProgram', 'Shader Error', 'redefinition', 'VALIDATE_STATUS')):
                if len(shad) < 20: shad.append('%s: %s' % (m.type, t[:600]))
            elif m.type == 'error' and len(other) < 20:
                other.append(t[:200])
        pg.on('console', _con)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        n = 0
        for h in HOURS:
            n += 1; tag = 'R%d_%02d_1' % (n, int(h))
            print('== 第 %d 輪 %s:00：[前置／捷徑] 讀檔到公館人行道 (−30, 14)，條件事件關閉' % (n, int(h)), flush=True)
            t1 = time.time(); await L.load_state(pg, {'zone': 'gongguan', 'hour': h, 'pos': SPAWN}, quiet_events=True)
            tg = await wait_glb(pg, t1); check('[%s] 正式模型 %s 有載入' % (tag, GLB), tg is not None, '%s 秒' % tg)
            if tg is None: continue
            res.append({'tag': tag, **(await measure(pg, tag))})
            print('== 第 %d 輪：GAME.enter(campus) → GAME.enter(gongguan)（遊戲自己的換區域）' % n, flush=True)
            await pg.evaluate("void GAME.enter('campus')")
            okc = False
            for _ in range(240):
                if await pg.evaluate("GAME.G.zone==='campus'&&!(GAME.isEntering&&GAME.isEntering())"): okc = True; break
                await pg.wait_for_timeout(250)
            check('[R%d] 換到 campus' % n, okc, '')
            await pg.wait_for_timeout(1500)
            tag = 'R%d_%02d_2' % (n, int(h))
            t1 = time.time(); await pg.evaluate("void GAME.enter('gongguan',%s)" % J(SPAWN))
            tg = await wait_glb(pg, t1); check('[%s] 再進公館、正式模型有載入' % tag, tg is not None, '%s 秒' % tg)
            for _ in range(80):
                if not await pg.evaluate("!!(GAME.isEntering&&GAME.isEntering())"): break
                await pg.wait_for_timeout(250)
            if tg is None: continue
            res.append({'tag': tag, **(await measure(pg, tag))})
        check('沒有 JS 例外', not errs, J(errs[:3]))
        check('console 沒有著色器錯誤（THREE.WebGLProgram／Shader Error／redefinition）', not shad, '%d 則：%s' % (len(shad), J(shad[:3])))
        info('console 其他 error', '%d 則：%s' % (len(other), J(other[:5])))
        await b.close()
    json.dump({'sha': os.environ.get('SHA'), 'hours': HOURS, 'drawn_min': DRAWN_MIN, 'lit_min': LIT_MIN, 'entries': res, 'shader_console': shad},
              open(os.path.join(OUT, 'reentry.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:12]) + ('…' if len(FAILS) > 12 else '')), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
