"""CC 射線查像素（BB-B 11-10 00:05）：讀檔站到 (x, z)、鏡頭 yaw／距離照 cc_wallfade_walls_probe（直接擺鏡頭，和那批截圖同一個畫面），
對 PIX 列的畫面像素打射線（跳過不可見、淡出到看不見的、玩家），回報：網格名稱、世界座標、UV、UV2、材質有沒有光照貼圖、光照貼圖在 UV2 那一點的值（0–255）。
Playwright／SwiftShader ≠ iPhone。用法：LW_TESTS=<wt>/tests SPOTS='corner_records@-3.3@-0.05@270@100:335;250:335;290:290|wz_print@...' python3 cc_raypick_probe.py <url> <out>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SPOTS = [s for s in (os.environ.get('SPOTS') or '').replace('+', '|').split('|') if s]
DIST = float(os.environ.get('DIST') or 4.5); DAY = os.environ.get('DAY') or '2025-10-18'; HOUR = float(os.environ.get('HOUR') or 14); TAG = os.environ.get('TAG') or 'x'
R = L.Run('raypick_' + TAG, OUT); D.setup(R, OUT)
PICK_JS = r"""(px=>{ const E=GAME.E, cam=E.camera, c=E.renderer?E.renderer.domElement:document.getElementById('c'); const W=c.clientWidth, H=c.clientHeight; cam.updateMatrixWorld(true);
  const P=E.player.obj; const isP=o=>{ for(let q=o;q;q=q.parent) if(q===P) return true; return false; };
  const vis=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; const m=[].concat(o.material)[0]; return !(m&&(m.visible===false||(m.transparent&&m.opacity<0.15))); };
  const ms=[]; E.scene.traverse(o=>{ if(o.isMesh&&vis(o)&&!isP(o)) ms.push(o); });
  const rc=new THREE.Raycaster(); const out=[];
  const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d',{willReadFrequently:true}); const cache=new Map();
  const sample=(tex,uv)=>{ if(!tex||!uv) return null; const img=tex.image; if(!img||!img.width) return 'no-image'; let d=cache.get(img); if(!d){ cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0); d=ctx.getImageData(0,0,img.width,img.height); cache.set(img,d); }
    let u=uv.x, v=uv.y; if(tex.matrixAutoUpdate!==false&&tex.updateMatrix){ tex.updateMatrix(); const p=new THREE.Vector3(u,v,1).applyMatrix3(tex.matrix); u=p.x; v=p.y; }
    const x=Math.min(img.width-1,Math.max(0,Math.floor(u*img.width))), y=Math.min(img.height-1,Math.max(0,Math.floor((tex.flipY?1-v:v)*img.height))); const i=(y*img.width+x)*4; return [d.data[i],d.data[i+1],d.data[i+2]]; };
  for(const [sx,sy] of px){ const nx=sx/W*2-1, ny=-(sy/H)*2+1; rc.setFromCamera(new THREE.Vector2(nx,ny),cam); const h=rc.intersectObjects(ms,false).filter(x=>vis(x.object))[0];
    if(!h){ out.push({px:[sx,sy],hit:null}); continue; } const o=h.object, m=[].concat(o.material)[(h.face&&h.face.materialIndex)||0]||[].concat(o.material)[0];
    out.push({px:[sx,sy], mesh:o.name||'(無名)', parent:o.parent&&o.parent.name||'', mat:m&&m.name||'', dist:+h.distance.toFixed(2), x:+h.point.x.toFixed(2), y:+h.point.y.toFixed(2), z:+h.point.z.toFixed(2),
      uv:h.uv?[+h.uv.x.toFixed(4),+h.uv.y.toFixed(4)]:null, uv2:(h.uv1||h.uv2)?[+(h.uv1||h.uv2).x.toFixed(4),+(h.uv1||h.uv2).y.toFixed(4)]:null, lightMap:!!(m&&m.lightMap), lmIntensity:m&&m.lightMap?m.lightMapIntensity:null,
      lmValue:m&&m.lightMap?sample(m.lightMap,h.uv1||h.uv2||h.uv):null, lmName:m&&m.lightMap&&m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src||'').split('/').pop()||null}); }
  return {W,H,hits:out}; })"""
CLOSE = "(()=>{ const d=document.querySelector('#dlg'); return !!(d && d.offsetParent!==null && getComputedStyle(d).display!=='none'); })()"
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        allres = {}
        for sp in SPOTS:
            head, pix = sp.split('@', 4)[:4], sp.split('@', 4)[4]
            zone, x, z, yd = head[0], float(head[1]), float(head[2]), float(head[3])
            px = [[float(a) for a in q.split(':')] for q in pix.replace('/', ';').split(';')]
            R.setup('【捷徑】讀檔到 %s，站 (%s, %s)；鏡頭 yaw %s°、距離 %s（直接擺，和牆外截圖同一個畫面）' % (zone, x, z, yd, DIST))
            await D.load_zone(pg, cdp, zone, DAY, HOUR, x=x, z=z, yaw=0.0, wait=9000)
            for _ in range(12):
                if not await pg.evaluate(CLOSE): break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
            await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; C.distTarget=a[1]; C.dist=a[1]; C.manualT=30; }", [math.radians(yd), DIST]); await pg.wait_for_timeout(3500)
            await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
            fn = os.path.join(OUT, 'ray_%s_%s.png' % (TAG, zone)); await pg.screenshot(path=fn)
            r = await pg.evaluate(PICK_JS, px); await pg.evaluate(D.HUD + '(true)')
            from PIL import Image, ImageDraw
            im = Image.open(fn).convert('RGB'); dr = ImageDraw.Draw(im)
            for h in r['hits']:
                sx, sy = h['px']; dr.ellipse([sx - 5, sy - 5, sx + 5, sy + 5], outline=(255, 0, 0), width=2)
                h['screen'] = list(im.getpixel((int(sx), int(sy))))
                R.note('%s 像素 (%d,%d) 畫面 %s → %s' % (zone, sx, sy, h['screen'], json.dumps({k: h.get(k) for k in ('mesh', 'parent', 'mat', 'x', 'y', 'z', 'uv2', 'lightMap', 'lmValue', 'lmName', 'dist')}, ensure_ascii=False)))
            im.save(fn.replace('.png', '_marked.png')); allres[zone] = r
            R.check('%s 每個像素都打到東西' % zone, all(h.get('mesh') for h in r['hits']), '')
        json.dump(allres, open(os.path.join(OUT, 'raypick_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
