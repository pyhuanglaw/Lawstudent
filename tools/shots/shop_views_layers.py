"""店內往外看的窗景：兩層（遠景＋近景）——ART-SHOP-VIEWS-1023（LAWWW2-B 2026-10-23；使用者：「店面外看出去的景也都很假」）。

原本（tools/shots/shop_views.py）：一張照片當成窗外 viewDepth 公尺的一面景（W3.windowMat 的視差）。
公館三家店從騎樓往外拍，畫面是一大片空地＋遠處的天際線；騎樓的柱子、人行道上的機車這些近的東西和遠景在同一個平面上，
走動時一起移動，看起來像貼在窗上的一張圖。
現在拍兩層：
  遠景＝鏡頭的 near 推到 D 公尺（比 D 近的都切掉），照片當成 far 公尺遠的一面景；
  地面（y ≤ 0.22 m：路面、人行道、騎樓地坪）不管遠近都畫在遠景（第一版 D 以內的地面切掉，遠景底下一條白）；
  近景＝鏡頭的 far 設成 D 公尺、只畫地面以上、天空和遠景剪影藏起來，黑底、白底各畫一次，從兩張的差算出透明度（alpha＝1－(白底－黑底)），
       照片當成 near 公尺遠的一面景，疊在遠景前面。
  遊戲裡（world3d.js 的 W3.windowMat）兩層各自照景深做視差：近的柱子、機車移動得比遠的街快。
三張都在同一個 JS 工作裡手動畫（遊戲迴圈先停畫：E.renderSkip），同一格畫面、沒有動畫的差別，去背才乾淨。
景深：從鏡頭打 32×16 條射線（只算看得到的物件），沿視線方向的距離；比 D 近的中位數＝近景景深、D 以外的中位數＝遠景景深。
存成 assets/models/env/views/<名稱>_<day|night>.webp（遠景，換掉原本的那張）、<名稱>_near_<day|night>.webp（近景，有透明度），
景深寫進 tools/shots/shop_views_layers.json，world3d.js 的 VIEW_LAYERS 照這份填。
拍的是遊戲畫面（Playwright＋SwiftShader），不是照片。1024×512、水平視角 90°（垂直 53.13°）；白天 11:00、晚上 20:30；路人、玩家藏起來。
用法（先開 http server）：python3 tools/shots/shop_views_layers.py http://127.0.0.1:8765/index.html [名稱...]"""
import base64, io, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ONLY = set(sys.argv[2:])
FOV = 53.13
OUTDIR = os.path.join(ROOT, 'assets', 'models', 'env', 'views')
# 名稱: (區域, 玩家站的位置（不入鏡）, 鏡頭位置, 看的點, D＝近景和遠景的分界（公尺）)。位置和 tools/shots/shop_views.py 相同（窗中心高、店面玻璃外側一點點）
VIEWS = {
    'noodle': ('gongguan', [-63, 14], [-63.0, 2.1, 21.7], [-63, 2.1, -40], 9.0),
    'bookstore': ('gongguan', [-41.6, 14], [-41.6, 2.1, 21.7], [-41.6, 2.1, -40], 9.0),
    'cvs': ('gongguan', [-29.4, 14], [-29.4, 2.1, 21.7], [-29.4, 2.1, -40], 9.0),
    'cafe': ('wenzhou', [50, 0], [55.1, 1.9, 0.0], [0, 1.9, 0.0], 7.0),
    'wz_lin': ('wenzhou', [36.4, 3.0], [36.45, 1.3, 4.6], [36.45, 1.3, -40], 6.0),
    'wz_teishoku': ('wenzhou', [-2.8, -3.0], [-2.8, 1.25, -4.6], [-2.8, 1.25, 40], 6.0),
}
TIMES = {'day': 11.0, 'night': 20.5}
WAIT_ASSETS = "for(let i=0;i<240;i++){ const st=ASSETS.status||{}; const pend=Object.keys(st).filter(k=>!ASSETS.cache[k]&&!(ASSETS.errors||[]).some(e=>e.startsWith(k+':'))); if(!pend.length) break; await new Promise(r=>setTimeout(r,250)); }"
# 拍完一般截圖以後（fast_shots 的 post）：景深兩組中位數＋三張畫面（遠景、近景黑底、近景白底）的 PNG data URL
LAYERS = """(()=>{ const E=GAME.E, R=E.renderer, S=E.scene, C=E.camera, D=%s, GY=0.22;
  const ray=new THREE.Raycaster(); ray.camera=C; ray.far=600; const fwd=new THREE.Vector3(); C.getWorldDirection(fwd);
  const vis=o=>{ if(o.isSprite||o.isLine||o.isPoints) return false; for(let p=o;p;p=p.parent) if(!p.visible) return false; const m=o.material; return Array.isArray(m)?m.some(x=>x&&x.visible!==false):!(m&&m.visible===false); };
  const isBack=o=>{ const m=o.material; return !!m&&!Array.isArray(m)&&m.side===THREE.BackSide; };
  const dn=[], df=[]; let sky=0;
  for(let j=0;j<16;j++) for(let i=0;i<32;i++){ ray.setFromCamera(new THREE.Vector2((i+0.5)/32*2-1,(j+0.5)/16*2-1),C);
    const h=ray.intersectObject(S,true).find(x=>vis(x.object)&&!isBack(x.object)); if(!h){ sky++; continue; } const d=h.point.clone().sub(C.position).dot(fwd); if(d<D){ if(h.point.y>GY&&d>0.8) dn.push(d); } else df.push(d); }   /* 近景的景深只算地面以上的東西（地面在遠景） */
  const med=a=>{ a.sort((x,y)=>x-y); return a.length?+a[Math.floor(a.length/2)].toFixed(2):null; };
  const skip0=E.renderSkip; E.renderSkip=()=>true; const n0=C.near, f0=C.far, bg0=S.background, ac=R.autoClear, cp0=R.clippingPlanes;
  const back=[]; S.traverse(o=>{ if(o.visible&&isBack(o)) back.push(o); });
  /* 地面（y ≤ GY：路面、人行道、騎樓地坪、路緣）一律畫在遠景：第一版只用鏡頭 near 切，D 以內的地面被切掉、遠景底下一條白，走動時近景一偏就露出來 */
  C.near=D; C.updateProjectionMatrix(); R.render(S,C);
  R.autoClear=false; R.clearDepth(); C.near=n0; C.far=D; C.updateProjectionMatrix(); back.forEach(o=>{ o.visible=false; }); R.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),GY)];
  R.render(S,C); const far=R.domElement.toDataURL('image/png'); R.autoClear=ac;
  /* 近景：D 以內、地面以上（柱子、機車、立牌、樹） */
  R.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),-GY)]; C.near=0.8; C.updateProjectionMatrix();   /* 店自己的門框、鐵捲門箱（鏡頭在店面玻璃外 0.3 m）不進近景：第一版窗上方多一條飄在空中的線 */
  S.background=new THREE.Color(0,0,0); R.render(S,C); const nb=R.domElement.toDataURL('image/png');
  S.background=new THREE.Color(1,1,1); R.render(S,C); const nw=R.domElement.toDataURL('image/png');
  R.clippingPlanes=cp0; back.forEach(o=>{ o.visible=true; }); S.background=bg0; C.near=n0; C.far=f0; C.updateProjectionMatrix(); E.renderSkip=skip0;
  return {D, near:med(dn), far:med(df), nNear:dn.length, nFar:df.length, sky:+(sky/512).toFixed(3), cam:[C.position.x,C.position.y,C.position.z].map(v=>+v.toFixed(2)), fov:C.fov, imgs:{far,nb,nw}}; })()"""


def png(du): return Image.open(io.BytesIO(base64.b64decode(du.split(',', 1)[1]))).convert('RGB')


def _blur(x, r):
    """方框模糊（積分圖；x 是 H×W 或 H×W×C）"""
    pad = [(r, r), (r, r)] + [(0, 0)] * (x.ndim - 2); c = np.pad(x, pad, mode='edge').cumsum(0).cumsum(1)
    c = np.pad(c, [(1, 0), (1, 0)] + [(0, 0)] * (x.ndim - 2)); k = 2 * r + 1; H, W = x.shape[:2]
    return (c[k:k + H, k:k + W] - c[:H, k:k + W] - c[k:k + H, :W] + c[:H, :W]) / (k * k)


def matte(b, w):
    """黑底、白底兩張 → 有透明度的近景（顏色＝黑底 ÷ alpha）。
    透明的地方填上旁邊的顏色（預乘的模糊 ÷ alpha 的模糊）：遊戲取樣時雙線性插值會混到透明像素的顏色，填黑的話邊緣一圈黑邊"""
    B = np.asarray(b).astype(np.float32) / 255; W = np.asarray(w).astype(np.float32) / 255
    a = np.clip(1.0 - (W - B).mean(axis=2), 0.0, 1.0)
    a = np.where(a < 0.02, 0.0, a)                                     # 雜訊當成全透明
    F = np.where(a[..., None] > 1e-3, np.clip(B / np.maximum(a[..., None], 1e-3), 0, 1), 0)
    fill = F.copy()
    for r in (2, 6, 18, 54):                                           # 由近到遠一圈一圈往外填
        pa = _blur(F * a[..., None], r); aa = _blur(a, r)[..., None]; est = pa / np.maximum(aa, 1e-6)
        hole = (a < 1e-3)[..., None] & (aa > 1e-4) & (fill.sum(axis=2, keepdims=True) == 0)
        fill = np.where(hole, est, fill)
    return Image.fromarray(np.dstack([np.clip(fill, 0, 1) * 255, a[..., None] * 255]).astype(np.uint8), 'RGBA'), float(a.mean())


tmp = tempfile.mkdtemp(prefix='shopviews2_'); RAW = os.environ.get('VIEWS_RAW', tmp)
shots = []
for k, (zone, ppos, pos, look, D) in VIEWS.items():
    if ONLY and k not in ONLY: continue
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': h, 'pos': {'x': ppos[0], 'z': ppos[1], 'yaw': 0}}, 'cam': {'pos': pos, 'look': look},
                      'js': "(async()=>{ %s GAME.E.camera.fov=%s; GAME.E.camera.updateProjectionMatrix(); })()" % (WAIT_ASSETS, FOV), 'wait': 5000, 'post': LAYERS % D})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools/blender/env_second/shots/fast_shots.py'), URL, spec], capture_output=True, text=True)
jpath = os.path.join(ROOT, 'tools', 'shots', 'shop_views_layers.json')
depth = json.load(open(jpath)) if os.path.exists(jpath) else {}
done = 0
for line in r.stdout.splitlines():
    if line.startswith('shotfail'): print(line[:300]); continue
    if not line.startswith('post '): continue
    _, out, js = line.split(' ', 2); d = json.loads(js); name = os.path.basename(out)[:-4]; k, t = name.rsplit('_', 1)
    imgs = d.pop('imgs'); far = png(imgs['far']); nb, nw = png(imgs['nb']), png(imgs['nw']); near, cover = matte(nb, nw)
    for kk, im in (('far', far), ('nb', nb), ('nw', nw)): im.save(os.path.join(RAW, f'{name}_{kk}.png'))   # 原始的三張（重新去背用）
    far.save(os.path.join(OUTDIR, f'{k}_{t}.webp'), quality=86); near.save(os.path.join(OUTDIR, f'{k}_near_{t}.webp'), quality=88)
    d['cover'] = round(cover, 3); depth[name] = d; done += 1
    print(name, json.dumps(d, ensure_ascii=False))
json.dump(depth, open(jpath, 'w'), indent=1, ensure_ascii=False)
print('done', done, 'of', len(shots)); print(r.stderr[-1500:] if done < len(shots) else '')
