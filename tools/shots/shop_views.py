"""店家窗戶「窗外的景」（cafe、cvs、noodle、bookstore；2026-10-22 加溫州街林家乾麵、巷子裡定食）：在遊戲的戶外區域拍實際畫面，和 tools/shots/window_views.py 同一套規則
（2026-10-11 使用者實機回報「窗景都很假」；AI-1 07:30Z 分派給第二個 AI：只拍照片，room() 的 view 接線由 AI-1 做）。
存成 assets/models/env/views/<名稱>_<day|night>.webp（1024×512、水平視角 90°＝垂直 53.13°；白天 11:00、晚上 20:30；藏起路人與玩家）。
鏡頭：店窗在戶外區域的對應位置（窗中心高度、外牆外側一點點）往外看、水平。拍的是遊戲畫面（Playwright＋SwiftShader），不是照片。

景深：拍完在同一個畫面從鏡頭打 32×16 條射線（只算看得到的物件；打不到、或只打到天空球和遠景剪影＝天空），量「沿著視線方向的距離」——
W3.windowMat 把照片當成玻璃後面一面垂直於視線的平面，所以用的是這個距離；建議的景深＝中位數（印出來、也寫進 tools/shots/shop_views_depth.json）。

各店的位置（src/zones3d.js）：
- cvs、noodle、bookstore：公館南側店面街，立面 z=19、騎樓 3 m、店面玻璃 z=22，各店中心 x＝門口互動點的 x（麵店 −63、書房 −41.6、便利商店 −29.4）；
  室內的窗都在店面那一面（winWall 'front'），所以從玻璃外側往北（−z，羅斯福路、校門那一側）看；窗中心高 2.1 m（room() 預設）。
- cafe：兩點半 Café 在溫州街東端路口（套件建築 (55.4,0,0) 轉 −90°，店面玻璃在 x=55.4、朝西）。室內 room() 的窗在右牆（winWall 'right'），
  換到戶外是 Café 的 +z 側牆，但那一面緊貼著轉角公寓（隔不到 1 m，拍出來只有一面牆），所以照分派寫的「窗外溫州街」：
  從店面玻璃外側（門口正前方）往西看路口和溫州街的巷子；窗中心高 1.9 m（cafe 的 winY）。
用法（先開 http server）：python3 tools/shots/shop_views.py http://127.0.0.1:8765/index.html [名稱...]"""
import json, os, re, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ONLY = set(sys.argv[2:])
FOV = 53.13   # 垂直視角：2:1 畫面的水平視角剛好 90°（W3.windowMat 的視差用這個比例）
# 名稱: (區域, 玩家站的位置（不入鏡，只是讓區域載入那一帶、陰影範圍跟著它）, 鏡頭位置, 看的點)
VIEWS = {
    'cafe': ('wenzhou', [50, 0], [55.1, 1.9, 0.0], [0, 1.9, 0.0]),
    'noodle': ('gongguan', [-63, 14], [-63.0, 2.1, 21.7], [-63, 2.1, -40]),
    'bookstore': ('gongguan', [-41.6, 14], [-41.6, 2.1, 21.7], [-41.6, 2.1, -40]),
    'cvs': ('gongguan', [-29.4, 14], [-29.4, 2.1, 21.7], [-29.4, 2.1, -40]),
    # 溫州街林家乾麵（A4，A 側建築轉 π：室內 x＝−(世界 x − 36)）：整面開口的中心（室內 x −0.45）、窗景中心高 1.3 m（配置 front.viewY），從店門口往街上（−z）看
    'wz_lin': ('wenzhou', [36.4, 3.0], [36.45, 1.3, 4.6], [36.45, 1.3, -40]),
    # 巷子裡定食（B3，B 側：室內 x＝世界 x＋2.8）：店面中心（室內 x 0）、高 1.25 m，從店門口往街上（+z）看
    'wz_teishoku': ('wenzhou', [-2.8, -3.0], [-2.8, 1.25, -4.6], [-2.8, 1.25, 40]),
}
TIMES = {'day': 11.0, 'night': 20.5}
# 等這個區域開始下載的正式模型都載完（第一次進區域時店面、機車、Café 的 GLB 還在下載，拍到的會是套件外觀）
WAIT_ASSETS = "for(let i=0;i<240;i++){ const st=ASSETS.status||{}; const pend=Object.keys(st).filter(k=>!ASSETS.cache[k]&&!(ASSETS.errors||[]).some(e=>e.startsWith(k+':'))); if(!pend.length) break; await new Promise(r=>setTimeout(r,250)); }"
# 景深：32×16 條射線，第一個「看得到」的交點（物件和所有上層都 visible、材質沒有關掉；不算 Sprite／線／點）
DEPTH = """(()=>{ const E=GAME.E, cam=E.camera, R=new THREE.Raycaster(); R.camera=cam; R.far=600;
  const fwd=new THREE.Vector3(); cam.getWorldDirection(fwd);
  const vis=o=>{ if(o.isSprite||o.isLine||o.isPoints) return false; for(let p=o;p;p=p.parent) if(!p.visible) return false; const m=o.material; return Array.isArray(m)?m.some(x=>x&&x.visible!==false):!(m&&m.visible===false); };
  /* 天空球（半徑 120）、遠景剪影（圓柱）都是 BackSide、不寫深度、先畫：當成天空（無限遠），繼續找後面真的物件 */ const back=o=>{ const m=o.material; return !!m&&!Array.isArray(m)&&m.side===THREE.BackSide; };
  const NX=32, NY=16, d=[]; let sky=0;
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){ R.setFromCamera(new THREE.Vector2((i+0.5)/NX*2-1,(j+0.5)/NY*2-1),cam);
    const h=R.intersectObject(E.scene,true).find(x=>vis(x.object)&&!back(x.object)); if(!h){ sky++; continue; } d.push(h.point.clone().sub(cam.position).dot(fwd)); }
  d.sort((a,b)=>a-b); const q=f=>d.length?+d[Math.min(d.length-1,Math.floor(d.length*f))].toFixed(1):null;
  return {rays:NX*NY, sky:+(sky/(NX*NY)).toFixed(3), median:q(0.5), p25:q(0.25), p75:q(0.75), mean:d.length?+(d.reduce((a,b)=>a+b,0)/d.length).toFixed(1):null,
    cam:[cam.position.x,cam.position.y,cam.position.z].map(v=>+v.toFixed(2)), fov:cam.fov}; })()"""

tmp = tempfile.mkdtemp(prefix='shopviews_')
shots = []
for k, (zone, ppos, pos, look) in VIEWS.items():
    if ONLY and k not in ONLY: continue
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': h, 'pos': {'x': ppos[0], 'z': ppos[1], 'yaw': 0}}, 'cam': {'pos': pos, 'look': look},
                      'js': "(async()=>{ %s GAME.E.camera.fov=%s; GAME.E.camera.updateProjectionMatrix(); })()" % (WAIT_ASSETS, FOV), 'wait': 5000, 'post': DEPTH})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools/blender/env_second/shots/fast_shots.py'), URL, spec], check=True, capture_output=True, text=True)
print(r.stdout[-4000:])
depth = {}
for line in r.stdout.splitlines():
    m = re.match(r'post (\S+) (\{.*\})$', line)
    if m: depth[os.path.basename(m.group(1))[:-4]] = json.loads(m.group(2))
os.makedirs(os.path.join(ROOT, 'assets/models/env/views'), exist_ok=True)
for s in shots:
    name = os.path.basename(s['out'])[:-4]
    out = os.path.join(ROOT, 'assets/models/env/views', f'{name}.webp')
    Image.open(s['out']).convert('RGB').save(out, 'WEBP', quality=80, method=6)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes', '景深', depth.get(name))
dj = os.path.join(ROOT, 'tools/shots/shop_views_depth.json')
old = json.load(open(dj)) if os.path.exists(dj) else {}
old.update(depth); json.dump(old, open(dj, 'w'), ensure_ascii=False, indent=1)
print('depth ->', os.path.relpath(dj, ROOT))
