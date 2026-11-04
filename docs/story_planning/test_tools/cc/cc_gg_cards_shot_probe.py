"""CC（帳號 A）11-04：GG_cards_shot——公館店面 13 張窗卡從騎樓看（LAWWW2 GG-CARDS-1104 99e412ad6 → 開發分支 23eaaa7ae；BB 已決定用新的窗卡①＋③）。
  窗卡不是獨立物件：13 張都合併在 gongguan_shops.glb 的 NOSHADOW_xs_fronts_lit（材質 wz_xs_fronts，atlas gg_fronts_atlas.jpg，GLB 裡 emissiveFactor 0.85＋emissiveTexture）。
  下面的世界座標是 CC 從 23eaaa7ae 的 GLB 讀出來的：用 atlas json（99e412ad6:tools/blender/env_second/textures/gen/gg_fronts_atlas.json）的 UV 範圍找每張卡的三角形、取外框；
  寬度和 wz_street.py GG_XS 的 cards（本地 x 左→右＝世界 −x）一致。卡面在 z 22.8（青木外帶窗口 22.4），店面玻璃在卡前 0.8 m（z 22.0），騎樓外緣 z 19。
  每張：鏡頭 (卡中心 x, 1.6, 20.0)（離玻璃 2 m）→ 看 (卡中心 x, 1.6, 卡面 z)，正對店窗；白天 11:00、晚上 20:30 各一張 card_<key>_day/night.png，再拼成 cards_day.png、cards_night.png（每格 420×236）。
  判定（INFO）：每張卡在 NOSHADOW_xs_fronts_lit 裡找得到頂點（世界座標落在卡的外框裡）；卡材質白天／晚上的 emissive、emissiveIntensity、color；截圖裡卡面那一塊的平均亮度（白天／晚上）。
  只記錄，不判 PASS／FAIL（判定 BB）；只有載入失敗、正式模型沒出現、JS 例外算 FAIL。
用法：LW_TESTS=<wt>/tests [CARDS=ggtea_int,ggdb_int] python3 cc_gg_cards_shot_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
# key: (棟, 店, x0, x1, y0, y1, 卡面 z)——23eaaa7ae gongguan_shops.glb 讀出來的世界座標
ALLC = {
    'ggtea_int':    ('G01', '青木茶室', -53.47, -50.27, 0.79, 2.50, 22.8),
    'ggtea_take':   ('G01', '青木茶室', -56.44, -55.14, 1.20, 2.45, 22.4),
    'ggbook_int':   ('G02', '頁間書屋', -46.60, -42.00, 0.55, 2.85, 22.8),
    'ggbook_int2':  ('G02', '頁間書屋', -42.00, -37.40, 0.55, 2.85, 22.8),
    'ggcvs_int':    ('G03', '日和便利店', -31.73, -27.47, 0.08, 2.73, 22.8),
    'ggcvs_side':   ('G03', '日和便利店', -27.35, -23.50, 0.08, 2.73, 22.8),
    'ggyy_int':     ('G05', '洋洋鹹酥雞', -13.4, -5.4, 0.80, 2.60, 22.8),   # BB 11-04：加 G05。座標是從 zones3d 店面寬度推的整面（x −14.0～−4.8 內縮），不是 GLB 讀的；AA_647 沒列它、沒換 v2 卡的話結果只記 INFO
    'ggbike_int2':  ('G06', '慢輪單車', -3.80, -1.45, 0.75, 2.55, 22.8),
    'ggbike_int':   ('G06', '慢輪單車', 0.90, 4.70, 0.85, 2.55, 22.8),
    'ggafar_int':   ('G07', 'Afar café', 8.75, 10.80, 0.73, 2.68, 22.8),
    'ggafar_win':   ('G07', 'Afar café', 10.80, 14.40, 0.73, 2.68, 22.8),
    'ggcorner_int': ('G12', '轉角唱片', 54.91, 57.60, 0.64, 2.81, 22.8),
    'ggcorner_win': ('G12', '轉角唱片', 57.60, 58.99, 0.64, 2.81, 22.8),
    'ggdb_int':     ('G14', 'Daybreak', 71.62, 76.41, 0.76, 2.53, 22.8),
}
SEL = [k for k in (os.environ.get('CARDS') or ','.join(ALLC)).split(',') if k in ALLC]
GLB = 'gongguan_shops_glb'
EYE_Z, EYE_Y = 20.0, 1.6
TW, TH = 420, 236
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


def info(name, txt):
    print('INFO ' + name + '  ' + txt, flush=True)


GLBREADY = "(()=>{ const z=GAME.E.zone; if(!z||!z.group) return false; const g=z.group.children.find(o=>o.name==='%s'); if(!g) return false; let m=0; g.traverse(o=>{ if(o.isMesh) m++; }); return m>0; })()" % GLB
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
HUD = """(on=>{ const c=GAME.E.renderer.domElement; const keep=new Set(); for(let n=c;n;n=n.parentElement) keep.add(n);
  document.querySelectorAll('body *').forEach(el=>{ if(keep.has(el)||c.contains(el)) return; if(el.parentElement&&keep.has(el.parentElement)){ if(on){ if(el.dataset.ccVis!==undefined){ el.style.visibility=el.dataset.ccVis; delete el.dataset.ccVis; } } else { el.dataset.ccVis=el.style.visibility||''; el.style.visibility='hidden'; } } }); })"""
# 卡的四個角投影到螢幕（CSS 像素）→ 截圖裡量亮度用；同時給這張卡在 NOSHADOW_xs_fronts_lit 裡有幾個頂點
CARDINFO = """(c=>{ const E=GAME.E, z=E.zone, g=z&&z.group&&z.group.children.find(o=>o.name==='%s'); E.camera.updateMatrixWorld();
  const [x0,x1,y0,y1,zz]=c; const pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>{ const v=new THREE.Vector3(x,y,zz).project(E.camera); return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z]; });
  const out={screen:pts.map(p=>p.map(v=>+v.toFixed(1)))}; if(!g){ out.mesh=null; return out; }
  const meshes=[]; g.traverse(o=>{ if(o.isMesh&&/xs_fronts/.test(o.name)) meshes.push(o); });
  out.mesh_names=[...new Set(meshes.map(m=>m.name))]; let n=0, nm=null; const v=new THREE.Vector3(), e=0.06;
  for(const m of meshes){ m.updateMatrixWorld(); const pa=m.geometry.attributes.position; let k0=0; for(let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i).applyMatrix4(m.matrixWorld);
    if(v.x>=Math.min(x0,x1)-e&&v.x<=Math.max(x0,x1)+e&&v.y>=y0-e&&v.y<=y1+e&&Math.abs(v.z-zz)<=0.12) k0++; } if(k0){ n+=k0; nm=m; } }
  out.verts_in_rect=n; out.mesh=nm&&nm.name; const mt=nm&&nm.material;
  if(mt) out.mat={name:mt.name, color:'#'+mt.color.getHexString(), emissive:mt.emissive&&('#'+mt.emissive.getHexString()), emissiveIntensity:+(mt.emissiveIntensity||0).toFixed(3), emissiveMap:!!mt.emissiveMap, map:!!mt.map, transparent:!!mt.transparent, toneMapped:mt.toneMapped};
  return out; })""" % GLB


# GG_night_r3（LAWWW／BB 11-04 06:57）：ggLit 傾印（LAWWW 給的那一段）＋從鏡頭打每張卡中心的 raycast
GGLIT_JS = """(()=>{const L=GAME.E.zone.ggLit; if(!L) return 'no ggLit'; const m=GAME.E.scene.getObjectByName(L.name); let r={}; try{ r={name:L.name,mat:L.mat,uv1:L.uv1,inScene:L.inScene(),compiled:L.compiled(),rewrap:L.rewrap(),lit:L.lit,glow:(()=>{ const G=L.glow; if(G==null) return null; try{ if(Array.isArray(G)) return G.map(q=>q&&typeof q==='object'?Object.fromEntries(Object.entries(q).filter(([k,v])=>typeof v!=='object'||Array.isArray(v)).slice(0,8)):q).slice(0,40); if(typeof G==='object') return Object.fromEntries(Object.entries(G).map(([k,v])=>[k,Array.isArray(v)?v.length:(typeof v==='object'&&v?Object.keys(v).length:v)])); return G; }catch(e){ return 'ERR '+e; } })(),hour:GAME.G.hour,found:!!m,matSame:m&&m.material&&m.material.name}; }catch(e){ r={err:String(e)}; } return JSON.stringify(r);})()"""
RAY_JS = """(p=>{ const E=GAME.E, cam=E.camera; cam.updateMatrixWorld(); const o=cam.getWorldPosition(new THREE.Vector3()); const d=new THREE.Vector3(...p).sub(o).normalize();
  const rc=new THREE.Raycaster(o,d,0.05,60); rc.camera=cam; const list=[]; E.scene.traverseVisible(o=>{ if(o.isMesh&&!o.isSprite&&!o.isInstancedMesh&&!(o.material&&o.material.visible===false)) list.push(o); });   /* r6：碰撞用的隱形方塊（material.visible false）不算 */ const hits=[]; for(const o of list){ try{ o.raycast(rc,hits); }catch(e){} } hits.sort((a,b)=>a.distance-b.distance);
  return hits.slice(0,3).map(h=>{ const g=h.object.geometry, a=g&&g.attributes; const u1=a&&(a.uv1||a.uv2); let u=null; if(u1&&h.face){ u=[u1.getX(h.face.a),u1.getX(h.face.b),u1.getX(h.face.c)].map(v=>+v.toFixed(3)); }
    const mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material;
    const par=[]; for(let q=h.object.parent;q&&par.length<10;q=q.parent) par.push(q.name||('('+q.type+')'));
    let bb=null; try{ const B=new THREE.Box3().setFromObject(h.object); bb=[B.min.x,B.min.y,B.min.z,B.max.x,B.max.y,B.max.z].map(v=>+v.toFixed(2)); }catch(e){}
    return {mesh:h.object.name, mat:mt&&mt.name, dist:+h.distance.toFixed(2), uv1:!!u1, uv1name:a&&(a.uv1?'uv1':(a.uv2?'uv2':null)), uv1x:u, attrs:a?Object.keys(a):[],
      detail:(h.object.name?null:(()=>{ try{ const o=h.object,ch=[]; for(let p=o;p;p=p.parent) ch.push((p.name||'('+p.type+')')+(p===E.zone.group?'【zone.group】':'')+(p.userData&&Object.keys(p.userData).length?JSON.stringify(Object.keys(p.userData)):''));
      o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox, m=Array.isArray(o.material)?o.material[0]:o.material;
      return {chain:ch,type:o.type,geo:o.geometry.type,verts:o.geometry.attributes.position.count,bbox:[b.min.toArray().map(v=>+v.toFixed(2)),b.max.toArray().map(v=>+v.toFixed(2))],world:o.getWorldPosition(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2)),
        mat:m&&{name:m.name,type:m.type,map:m.map&&String(m.map.name||(m.map.image&&(m.map.image.src||m.map.image.width+'x'+m.map.image.height))||'').slice(0,160),emissive:m.emissive&&m.emissive.getHexString(),emissiveIntensity:m.emissiveIntensity,transparent:m.transparent,opacity:m.opacity},
        ud:JSON.parse(JSON.stringify(o.userData,(k,v)=>typeof v==='object'&&v&&v.isObject3D?'[Object3D]':v))}; }catch(e){ return 'ERR '+e; } })()),
      parents:par, map:!!(mt&&mt.map), emissiveMap:!!(mt&&mt.emissiveMap), transparent:!!(mt&&mt.transparent), opacity:mt&&mt.opacity, verts:a&&a.position?a.position.count:null, bbox:bb, uuid:h.object.uuid.slice(0,8), ud:Object.keys(h.object.userData||{}).slice(0,8)}; }); })"""


# GG_night_r7（LAWWW2 07:51）：① 編好的著色器裡有沒有 uShopLit ② 全部打烊（lit.fill(0,1)）再拍 ③ 藏玻璃再拍——DIAG2=1、晚上那一輪才做
SHADER_JS = r"""(()=>{const E=GAME.E,z=E.zone,L=z.ggLit;if(!L)return 'no ggLit';let mesh=null;E.scene.traverse(o=>{if(!mesh&&o.isMesh&&o.name===L.name)mesh=o;});const m=mesh&&mesh.material,p=m&&E.renderer.properties.get(m),pr=p&&p.currentProgram;let src='';try{const gl=E.renderer.getContext();const sh=gl.getAttachedShaders(pr.program);src=sh.map(s=>gl.getShaderSource(s)).join('\n');}catch(e){src='ERR '+e.message;}return JSON.stringify({name:L.name,mat:L.mat,uv1:L.uv1,inScene:L.inScene(),compiled:L.compiled(),rewrap:L.rewrap(),lit:L.lit,sameMat:m&&m.name,cacheKey:m&&m.customProgramCacheKey&&m.customProgramCacheKey(),hasUShopLit:src.includes('uShopLit'),hasVShop:src.includes('vShopIdx'),emissiveChunkReplaced:src.includes('totalEmissiveRadiance*=k'),progCount:E.renderer.info.programs.length,glow:L.glow,srcErr:src.startsWith('ERR')?src:null});})()"""
TWO_FRAMES = "new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true))))"
ALLOFF_JS = "(async()=>{ const L=GAME.E.zone.ggLit; if(!L||!L.lit) return 'no ggLit'; L.lit.fill(0.0,1); await " + TWO_FRAMES + "; return JSON.stringify(L.lit); })()"
GLASS_JS = "(async(on)=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='cafe_glass'){ o.visible=on; n++; } }); await " + TWO_FRAMES + "; return n; })"


# GG_night_r8（LAWWW／LAWWW2 08:45）：「底」——窗卡 mesh 的 color、emissive 設 (0,0,0) 再量同一個框（路燈、環境光、玻璃照在那一塊的亮度）；BASE=1、晚上那一輪才做
MATLIST_JS = "(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; const ms=Array.isArray(o.material)?o.material:[o.material]; for(const m of ms){ if(m&&/xs_fronts|wz_xs/.test(m.name||'')){ let vis=true; for(let q=o;q;q=q.parent) if(q.visible===false){ vis=false; break; } out.push({mesh:o.name||'(無名)', type:o.type, mat:m.name, matUuid:m.uuid.slice(0,8), vis, verts:o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count:null, uv1:!!(o.geometry&&o.geometry.attributes.uv1), parent:o.parent&&(o.parent.name||o.parent.type)}); } } }); return JSON.stringify(out.slice(0,40)); })()"
BLACK_JS = "(async(on)=>{ const W=window.__ccBlk||(window.__ccBlk=new Map()); GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; const ms=Array.isArray(o.material)?o.material:[o.material]; if(!ms.some(m=>m&&/xs_fronts|wz_xs/.test(m.name||''))) return; for(const m of ms){ if(!m||!/xs_fronts|wz_xs/.test(m.name||'')) continue; if(on){ if(!W.has(m)) W.set(m,{c:m.color.clone(),e:m.emissive?m.emissive.clone():null}); m.color.setRGB(0,0,0); if(m.emissive) m.emissive.setRGB(0,0,0); } else { const b=W.get(m); if(b){ m.color.copy(b.c); if(b.e&&m.emissive) m.emissive.copy(b.e); } } } }); if(!on) W.clear(); await " + TWO_FRAMES + "; return true; })"


def luma_of(png, quad, iw, ih):
    from PIL import Image, ImageStat
    im = Image.open(png).convert('L'); W, H = im.size; sx, sy = W / iw, H / ih
    if any(p[2] >= 1 for p in quad): return None
    x0 = max(0, min(p[0] for p in quad) * sx); x1 = min(W, max(p[0] for p in quad) * sx)
    y0 = max(0, min(p[1] for p in quad) * sy); y1 = min(H, max(p[1] for p in quad) * sy)
    # 內縮 10%：避開窗框
    dx, dy = (x1 - x0) * 0.1, (y1 - y0) * 0.1
    box = (int(x0 + dx), int(y0 + dy), int(x1 - dx), int(y1 - dy))
    if box[2] - box[0] < 4 or box[3] - box[1] < 4: return None
    return round(ImageStat.Stat(im.crop(box)).mean[0], 1)


def tile(png, label):
    from PIL import Image, ImageDraw
    im = Image.open(png).convert('RGB'); W, H = im.size
    r = TW / TH
    if W / H > r:
        nw = int(H * r); im = im.crop(((W - nw) // 2, 0, (W - nw) // 2 + nw, H))
    else:
        nh = int(W / r); im = im.crop((0, (H - nh) // 2, W, (H - nh) // 2 + nh))
    im = im.resize((TW, TH))
    d = ImageDraw.Draw(im); d.rectangle((0, 0, TW, 18), fill=(0, 0, 0)); d.text((4, 3), label, fill=(255, 255, 255))
    return im


def montage(keys, when):
    from PIL import Image
    cols = 5; rows = (len(keys) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * TW, rows * TH), (40, 40, 40))
    for i, k in enumerate(keys):
        fn = os.path.join(OUT, 'card_%s_%s.png' % (k, when))
        if not os.path.exists(fn): continue
        sheet.paste(tile(fn, '%s %s (%s)' % (ALLC[k][0], k, when)), ((i % cols) * TW, (i // cols) * TH))
    out = os.path.join(OUT, 'cards_%s.png' % when); sheet.save(out); return out


async def run_time(pg, hour, when):
    print('  [前置／捷徑] 讀檔到公館人行道 %s (−30, 14)，條件事件關閉' % when, flush=True)
    t1 = time.time()
    st = {'zone': 'gongguan', 'hour': hour, 'pos': {'x': -30, 'z': 14, 'yaw': 1.5708}}
    dk = os.environ.get('DATEKEY', '').strip()   # BB 05:17 GG_night：颱風假（例 2025-10-13）
    if dk:
        dn = await pg.evaluate("(k=>{ try{ return STORY.dayOfKey(k); }catch(e){ return null; } })(%s)" % J(dk))
        print('  [前置／捷徑] 日期 %s → day %s' % (dk, dn), flush=True)
        if dn is not None: st['day'] = dn
    await L.load_state(pg, st, quiet_events=True)
    t_glb = None
    for _ in range(480):
        if await pg.evaluate(GLBREADY): t_glb = round(time.time() - t1, 2); break
        await pg.wait_for_timeout(250)
    check('%s：正式模型 %s 有載入' % (when, GLB), t_glb is not None, '讀檔後 %s 秒' % t_glb)
    if t_glb is None: return {}
    await pg.wait_for_timeout(3000)
    iw, ih = await pg.evaluate("[innerWidth, innerHeight]")
    res = {}
    try: gl = await pg.evaluate(GGLIT_JS)
    except Exception as e: gl = 'ERR ' + str(e)[:200]
    print('  %s ggLit：%s' % (when, gl), flush=True)
    if os.environ.get('BASE') == '1':
        try: print('  %s 用到 xs_fronts 材質的網格：%s' % (when, await pg.evaluate(MATLIST_JS)), flush=True)
        except Exception as e: print('  %s 網格清單失敗：%r' % (when, e), flush=True)
    diag2 = os.environ.get('DIAG2') == '1' and when == 'night'
    if diag2:
        try: sh = await pg.evaluate(SHADER_JS)
        except Exception as e: sh = 'ERR ' + str(e)[:300]
        print('  %s ①著色器：%s' % (when, sh), flush=True)
    await pg.evaluate(HUD + '(false)')
    for k in SEL:
        G, shop, x0, x1, y0, y1, zz = ALLC[k]; cx = round((x0 + x1) / 2, 3)
        await pg.evaluate(AIM + '(%s,%s)' % (J([cx, EYE_Y, EYE_Z]), J([cx, EYE_Y, zz])))
        await pg.wait_for_timeout(500)
        fn = os.path.join(OUT, 'card_%s_%s.png' % (k, when))
        await pg.screenshot(path=fn)
        ci = await pg.evaluate(CARDINFO + '(%s)' % J([x0, x1, y0, y1, zz]))
        try:
            ci['luma'] = luma_of(fn, ci['screen'], iw, ih)
        except Exception as e:
            ci['luma'] = None; ci['luma_err'] = str(e)[:120]
        if diag2:
            try:
                ci['alloff'] = await pg.evaluate(ALLOFF_JS)
                await pg.screenshot(path=os.path.join(OUT, 'card_%s_%s_alloff.png' % (k, when)))
                ci['glass_n'] = await pg.evaluate(GLASS_JS + '(false)')
                await pg.screenshot(path=os.path.join(OUT, 'card_%s_%s_noglass.png' % (k, when)))
                await pg.evaluate(GLASS_JS + '(true)')
                print('  %s %s ②全部打烊 lit=%s、③藏玻璃 %s 個（截圖 _alloff、_noglass）' % (when, k, ci['alloff'], ci['glass_n']), flush=True)
            except Exception as e:
                print('  %s %s ②③ 失敗：%r' % (when, k, e), flush=True)
            await pg.wait_for_timeout(1200)   # ggShopLit 每 30 幀照營業時間寫回 lit
        if os.environ.get('BASE') == '1' and when == 'night':
            try:
                await pg.evaluate(BLACK_JS + '(true)'); await pg.wait_for_timeout(200)
                await pg.screenshot(path=os.path.join(OUT, 'card_%s_%s_black.png' % (k, when)))
                await pg.evaluate(BLACK_JS + '(false)')
                print('  %s %s 「底」：窗卡 color／emissive＝0 的截圖 _black' % (when, k), flush=True)
            except Exception as e:
                print('  %s %s 「底」失敗：%r' % (when, k, e), flush=True)
        try: ci['ray'] = await pg.evaluate(RAY_JS + '(%s)' % J([cx, (y0 + y1) / 2, zz]))
        except Exception as e: ci['ray'] = 'ERR ' + str(e)[:200]
        print('  %s %s raycast：%s' % (when, k, J(ci['ray'])), flush=True)
        res[k] = ci
        print('  %s %s %s %s：卡的頂點 %s（%s）；材質 %s；卡面平均亮度 %s' % (when, G, shop, k, ci.get('verts_in_rect'), ci.get('mesh'), J(ci.get('mat')), ci.get('luma')), flush=True)
    await pg.evaluate(HUD + '(true)')
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    return {'hour': hour, 'glb_s': t_glb, 'viewport': [iw, ih], 'cards': res, 'ggLit': gl}


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC GG_cards_shot 公館 13 張窗卡從騎樓看；SHA=%s；CARDS=%s；Playwright（PC 有 GPU、有視窗），不是手機實機' % (os.environ.get('SHA', '?'), ','.join(SEL)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); boot = time.time() - t0
        check('遊戲載入', ok, '%.1f 秒' % boot)
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        hrs = [float(x) for x in (os.environ.get('HOURS') or '11,20.5').split(',')]   # BB 05:17 GG_night：HOURS=14,22
        day = await run_time(pg, hrs[0], 'day')
        night = await run_time(pg, hrs[1], 'night') if len(hrs) > 1 else day
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    rows = {}
    for k in SEL:
        dc = (day.get('cards') or {}).get(k) or {}; nc = (night.get('cards') or {}).get(k) or {}
        dm, nm = dc.get('mat') or {}, nc.get('mat') or {}
        changed = (dm.get('emissive'), dm.get('emissiveIntensity'), dm.get('color')) != (nm.get('emissive'), nm.get('emissiveIntensity'), nm.get('color'))
        rows[k] = {'shop': ALLC[k][0] + ' ' + ALLC[k][1], 'found_day': (dc.get('verts_in_rect') or 0) > 0, 'found_night': (nc.get('verts_in_rect') or 0) > 0,
                   'mat_day': dm, 'mat_night': nm, 'mat_changed_at_night': changed, 'luma_day': dc.get('luma'), 'luma_night': nc.get('luma')}
        info('%s %s' % (ALLC[k][0], k), '找得到：白天 %s／晚上 %s；晚上材質有變：%s（白天 emissive %s×%s、晚上 %s×%s）；卡面亮度 白天 %s→晚上 %s' % (
            rows[k]['found_day'], rows[k]['found_night'], changed, dm.get('emissive'), dm.get('emissiveIntensity'), nm.get('emissive'), nm.get('emissiveIntensity'), rows[k]['luma_day'], rows[k]['luma_night']))
    try:
        info('總覽圖', '%s、%s' % (montage(SEL, 'day'), montage(SEL, 'night')))
    except Exception as e:
        info('總覽圖', '做不出來：%s' % str(e)[:160])
    json.dump({'sha': os.environ.get('SHA'), 'boot_s': round(boot, 1), 'day': day, 'night': night, 'table': rows},
              open(os.path.join(OUT, 'cards.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
