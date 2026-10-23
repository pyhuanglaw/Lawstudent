"""BB-B 2026-10-23：LAWWW-B 清單 BB_SIS_B6_1023.md 第 47 項——店內窗景兩層（ART-SHOP-VIEWS-1023，LAWWW2 ecfe5a6a；開發分支 375e90903）。
  使用者「店面外看出去的景也都很假」。W3.VIEW_LAYERS 的四家（便利商店 cvs、阿鳳麵店 noodle、舊路書房 bookstore、兩點半 Café cafe）窗外是兩層：
  遠景照片＋近景（騎樓的柱子、機車、盆栽，有透明度），兩層各自視差——走動時近的東西移動得比遠的街快。
  每家店 × 中午 12:30／晚上 20:30：
    - 讀每一扇窗的材質（uniforms photo、near、nmap、depth、ndepth）：兩層都載進來了；
    - 【捷徑】把玩家放在窗前 2.2 m、鏡頭從室內對著窗（藏 HUD 和主角、鏡頭 2.6 m 平視），左、中、右各移 1.2 m 拍一張＝看視差；
    - 窗那一塊有沒有大片純黑（破圖）。
  對照（照舊一層）：林家乾麵 wz_lin、巷子裡定食 wz_teishoku、霖澤館 201 教室、宿舍——窗的 near＝0、沒有多載近景。
  判定照截圖（使用者看；建築場景的 ART_APPROVED 只有使用者能標）；腳本只記錄數字和自動檢查。
  不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向 844×390、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=cvs,noodle,...] [HOURS=12.5,20.5] python3 window47_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageStat
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
TWO = ['cvs', 'noodle', 'bookstore', 'cafe']
ONE = ['wz_lin', 'wz_teishoku', 'classroom', 'dorm']
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or TWO + ONE
HOURS = [float(h) for h in os.environ.get('HOURS', '12.5,20.5').split(',')]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
def J(x, n=600): return json.dumps(x, ensure_ascii=False, default=str)[:n]

WINQ = """(()=>{ const z=GAME.E.zone, out=[]; for(const w of (z&&z.wins)||[]){ const p=new THREE.Vector3(), q=new THREE.Quaternion(); w.getWorldPosition(p); w.getWorldQuaternion(q);
    const n=new THREE.Vector3(0,0,1).applyQuaternion(q); const u=(w.material&&w.material.uniforms)||{};
    out.push({x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), nx:+n.x.toFixed(3), nz:+n.z.toFixed(3), pview:w.userData.pview||null, shader:!!u.map,
      photo:u.photo?u.photo.value:null, near:u.near?u.near.value:null, nmap:!!(u.nmap&&u.nmap.value), depth:u.depth?+(+u.depth.value).toFixed(2):null, ndepth:u.ndepth?+(+u.ndepth.value).toFixed(2):null}); }
  return {zone:GAME.G.zone, layers:(W3.VIEW_LAYERS||{})[GAME.G.zone]||null, wins:out}; })()"""
HIDEUI = """(on=>{ const cv=GAME.E.renderer.domElement; for(const e of document.body.children){ if(e===cv||e.contains(cv)) continue; e.style.visibility=on?'hidden':''; }
  if(cv.parentElement&&cv.parentElement!==document.body) for(const e of cv.parentElement.children){ if(e!==cv) e.style.visibility=on?'hidden':''; }
  GAME.E.player.obj.visible=!on; })"""
# 玩家放在 (x,z)；鏡頭在玩家的 (sin yaw, cos yaw) 那一側（engine3d.js）→ yaw＝窗的法線方向（室內那一側），鏡頭從室內往窗看
PLACE = """(([x,z,yaw,dist,pitch])=>{ const E=GAME.E, P=E.player; const ok=!E.nav||E.nav.free(x,z); if(E.placeAt) E.placeAt(P,x,z); else P.obj.position.set(x,0,z);
  const c=E.cam; c.yaw=yaw; c.distTarget=dist; c.dist=dist; c.pitch=pitch; c.manualT=60; return ok; })"""

# 那一扇窗在畫面上的範圍（四個角投影到螢幕）→ 裁出來並排看視差
WINRECT = """(i=>{ const E=GAME.E, w=E.zone.wins[i], cam=E.camera||E.cam3||null; const C=cam||(E.renderer&&E.scene&&E.scene.userData.cam); if(!w||!C) return null;
  w.geometry.computeBoundingBox(); const b=w.geometry.boundingBox, cv=E.renderer.domElement, r=cv.getBoundingClientRect(); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const [x,y] of [[b.min.x,b.min.y],[b.max.x,b.min.y],[b.min.x,b.max.y],[b.max.x,b.max.y]]){ const v=new THREE.Vector3(x,y,0).applyMatrix4(w.matrixWorld).project(C); const px=r.left+(v.x+1)/2*r.width, py=r.top+(1-v.y)/2*r.height; x0=Math.min(x0,px); y0=Math.min(y0,py); x1=Math.max(x1,px); y1=Math.max(y1,py); }
  return [Math.round(x0),Math.round(y0),Math.round(x1),Math.round(y1)]; })"""

def dark_frac(path, box=(0.15, 0.1, 0.85, 0.8)):
    im = Image.open(path).convert('L'); w, h = im.size
    c = im.crop((int(w * box[0]), int(h * box[1]), int(w * box[2]), int(h * box[3])))
    px = list(c.getdata()); return round(sum(1 for v in px if v < 8) / len(px), 4), round(ImageStat.Stat(c).mean[0], 1)

async def main():
    run = L.Run('window47', OUT); base = json.load(open(SAVE, encoding='utf-8')); res = {}
    async with async_playwright() as p:
        for zone in SCEN:
            for h in HOURS:
                tag = '%s_%02d%02d' % (zone, int(h), int(round((h % 1) * 60)))
                say('== %s（%s）' % (tag, os.environ.get('SHA', '?')))
                b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
                r = res.setdefault(tag, {})
                try:
                    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                    st = json.loads(json.dumps(base)); G = st.get('G', st); d = await pg.evaluate("STORY.dayOfKey('2025-10-08')")
                    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weather': 'clear', 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
                    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(9000)
                    run.setup('[前置／捷徑] %s：使用者存檔改到 2025-10-08（三）%.2f %s、晴天；窗前的位置用 placeAt 放、鏡頭轉向窗' % (tag, h, zone))
                    q = None
                    for _ in range(20):   # 照片和近景是非同步載入（TextureLoader）：等到 photo／near 有值
                        q = await pg.evaluate(WINQ)
                        if q['zone'] != zone or not q['wins'] or zone not in TWO or all(w['photo'] and w['near'] for w in q['wins'] if w['pview']): break
                        await pg.wait_for_timeout(1500)
                    r['win'] = q; say('   窗：%s' % J(q, 900))
                    run.check('%s：進到 %s、有窗' % (tag, zone), q['zone'] == zone and len(q['wins']) > 0, J(q, 300))
                    pv = [w for w in q['wins'] if w['pview']]
                    if zone in TWO:
                        run.check('%s：VIEW_LAYERS 有這家（遠景 %s m、近景 %s m）' % (tag, (q['layers'] or {}).get('far'), (q['layers'] or {}).get('near')), bool(q['layers']), J(q['layers']))
                        run.check('%s：每扇照片窗的遠景＋近景都載進來（photo＝1、near＝1、近景貼圖有）' % tag, bool(pv) and all(w['photo'] == 1 and w['near'] == 1 and w['nmap'] for w in pv), J(pv, 600))
                    else:
                        run.check('%s：照舊一層（near 不是 1、沒有近景貼圖）' % tag, all(not w['near'] and not w['nmap'] for w in q['wins']), J(q['wins'], 600))
                    # 窗前左、中、右（只拍第一扇照片窗；沒有照片窗就拍第一扇）
                    w0 = (pv or q['wins'])[0]; nx, nz = w0['nx'], w0['nz']
                    # 法線要朝室內（往房間中心）：房間中心大約是原點
                    if (0 - w0['x']) * nx + (0 - w0['z']) * nz < 0: nx, nz = -nx, -nz
                    yaw = math.atan2(nx, nz); tx, tz = nz, -nx
                    shots = []; wi = q['wins'].index(w0)
                    for k, off in (('L', -1.0), ('C', 0.0), ('R', 1.0)):
                        x = w0['x'] + nx * 1.1 + tx * off; z = w0['z'] + nz * 1.1 + tz * off   # 窗前 1.1 m、鏡頭再往後 1.8 m（離窗約 2.9 m），平視
                        ok = await pg.evaluate(PLACE + "(%s)" % json.dumps([x, z, yaw, 1.8, 0.0])); await pg.evaluate(HIDEUI + "(true)"); await pg.wait_for_timeout(3000)
                        sp = await run.shot(pg, '%s_%s' % (tag, k)); df, lu = dark_frac(sp)
                        rect = await pg.evaluate("(%s)(%d)" % (WINRECT, wi))
                        shots.append({'k': k, 'x': round(x, 2), 'z': round(z, 2), 'free': ok, 'dark': df, 'lum': lu, 'rect': rect, 'path': sp})
                    try:   # 三張的窗那一塊並排（同一個範圍：三張的聯集）
                        R_ = [s_['rect'] for s_ in shots if s_.get('rect')]
                        if R_:
                            im0 = Image.open(shots[0]['path']); W_, H_ = im0.size; sc = W_ / 844.0
                            bx = (max(0, int(min(r_[0] for r_ in R_) * sc)), max(0, int(min(r_[1] for r_ in R_) * sc)), min(W_, int(max(r_[2] for r_ in R_) * sc)), min(H_, int(max(r_[3] for r_ in R_) * sc)))
                            if bx[2] - bx[0] > 20 and bx[3] - bx[1] > 20:
                                cr = [Image.open(s_['path']).convert('RGB').crop(bx) for s_ in shots]; cw, ch = cr[0].size
                                sh = Image.new('RGB', (cw * 3 + 8, ch), 'black')
                                for i_, c_ in enumerate(cr): sh.paste(c_, (i_ * (cw + 4), 0))
                                sh.save(os.path.join(OUT, 'crop_%s.png' % tag)); r['crop'] = bx
                    except Exception as e: say('   裁窗失敗：%r' % e)
                    await pg.evaluate(HIDEUI + "(false)")
                    r['shots'] = shots; say('   窗前三張：%s' % J(shots))
                    run.check('%s：窗前三張沒有大片純黑（純黑像素 ≤ 3%%）' % tag, all(s['dark'] <= 0.03 for s in shots), J(shots))
                    run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
                except Exception as e:
                    say('   例外：%r' % e); run.check('%s：跑完' % tag, False, repr(e)[:300])
                finally:
                    json.dump(res, open(os.path.join(OUT, 'window47.json'), 'w'), ensure_ascii=False, indent=1, default=str)
                    try: await asyncio.wait_for(b.close(), 30)
                    except Exception: pass
    run.finish()
asyncio.run(main())
