"""CC-C（帳號 C）11-05：TONGXIAN_REFCAM（BB-C 03:21，P2；head 650fb8c1b＝同弦 v4e 整合 f71d2c545）。判定歸 BB；雲端 SwiftShader，不是 GPU（顏色、亮度以電腦為準）。
  【前置／捷徑】讀檔 xs_tongxian 2025-10-14（二）15:00（營業、白天、店裡燈開著）、藏 HUD；鏡頭照 src/data/tongxian_layout.js 的 shop.camRef（eye、look、lens 24 mm、36 mm 寬＝水平 73.7°）、16:9（1280×720）。
  量：吊燈（燈罩中心 (−1.65, 2.55, −4.15)）從 camRef 看有沒有被擋（眼睛到燈罩的射線，比燈近的地方打到的網格；名字／材質有 pothos／leaf／plant／黃金葛＝葉子）；燈在畫面的位置。
  之後另外跑：python tools/art/same_angle_check.py <參考圖 tongxian_int> <截圖> <前綴> --mode shop --fov <垂直視角>（紅框格子、分數）
用法：LW_TESTS=<wt>/tests python3 cc_tongxian_refcam.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('tongxian_refcam', OUT)
LAMP = [-1.65, 2.55, -4.15]
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
CAM = r"""(()=>{ const C=(typeof TONGXIAN_LAYOUT!=='undefined'&&TONGXIAN_LAYOUT.shop&&TONGXIAN_LAYOUT.shop.camRef)||null; if(!C) return null; const E=GAME.E, cam=E.camera, V=THREE.Vector3;
  const hf=2*Math.atan(18/(C.lens||24)), vf=2*Math.atan(Math.tan(hf/2)/(innerWidth/innerHeight)); E.paused=true; E.cinematic&&E.cinematic(new V(...C.eye),new V(...C.look));
  for(let i=0;i<2;i++){ cam.position.set(...C.eye); E.cam.look=new V(...C.look); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); } cam.fov=vf*180/Math.PI; cam.updateProjectionMatrix(); E.render();
  return {eye:C.eye, look:C.look, lens:C.lens, hfov:+(hf*180/Math.PI).toFixed(2), vfov:+(vf*180/Math.PI).toFixed(2), w:innerWidth, h:innerHeight}; })()"""
OCC = r"""((L)=>{ const E=GAME.E, cam=E.camera, V=THREE.Vector3; const eye=cam.position.clone(), tgt=new V(...L), dir=tgt.clone().sub(eye), dist=dir.length(); dir.normalize();
  const rc=new THREE.Raycaster(eye,dir,0.05,dist+0.6); const hits=rc.intersectObjects(E.scene.children,true).filter(h=>{ for(let o=h.object;o;o=o.parent) if(o.visible===false) return false; return true; });
  const nm=h=>{ const o=h.object, m=Array.isArray(o.material)?o.material[0]:o.material; const ps=[]; for(let p=o;p&&ps.length<4;p=p.parent) if(p.name) ps.push(p.name); return {obj:ps.join('<'), mat:(m&&m.name)||'', d:+h.distance.toFixed(3), p:[+h.point.x.toFixed(2),+h.point.y.toFixed(2),+h.point.z.toFixed(2)]}; };
  const H=hits.slice(0,8).map(nm), before=H.filter(h=>h.d<dist-0.12), leaf=before.filter(h=>/pothos|leaf|leaves|plant|vine|黃金葛|ivy/i.test(h.obj+'|'+h.mat));
  const p=tgt.clone().project(cam); return {dist:+dist.toFixed(3), screen:{x:Math.round((p.x+1)/2*innerWidth), y:Math.round((1-p.y)/2*innerHeight), inView:Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&p.z<1}, hits:H, before, leaf}; })"""


async def main():
    print('CC TONGXIAN_REFCAM：SHA=%s；SwiftShader ≠ GPU（顏色、亮度以電腦為準）' % os.environ.get('SHA', '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.set_viewport_size({'width': 1280, 'height': 720})
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-10-14')")
        R.setup('讀檔 xs_tongxian 2025-10-14（二）15:00（營業、白天）')
        await L.load_state(pg, {'zone': 'xs_tongxian', 'hour': 15.0, 'day': d, 'weather': 'clear'}, quiet_events=True)
        await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
        st = await pg.evaluate("(()=>({zone:GAME.G.zone, open:typeof GUITAR!=='undefined'?GUITAR.isOpen(GAME.G):null, hour:GAME.G.hour, lights:(()=>{ let n=0,on=0; GAME.E.scene.traverse(o=>{ if(o.isLight&&!o.isAmbientLight&&!o.isHemisphereLight){ n++; if(o.visible&&o.intensity>0) on++; } }); return [on,n]; })()}))()")
        R.note('店裡：%s' % J(st))
        R.check('在同弦（xs_tongxian）、營業中', st['zone'] == 'xs_tongxian' and st['open'] is True, J(st))
        await pg.evaluate(HUD + '(false)')
        cam = await pg.evaluate(CAM); R.note('camRef：%s' % J(cam))
        if not R.check('讀得到 TONGXIAN_LAYOUT.shop.camRef', bool(cam), ''): await b.close(); sys.exit(1)
        await pg.wait_for_timeout(500); await pg.evaluate("GAME.E.render()")
        shot = os.path.join(OUT, 'tongxian_refcam_game.png'); await pg.screenshot(path=shot)
        occ = await pg.evaluate(OCC, LAMP)
        R.note('吊燈 %s：畫面上 %s；射線打到（前 8 個）%s' % (J(LAMP), J(occ['screen']), J(occ['hits'])))
        R.note('吊燈前面擋住的：%s；其中是葉子的：%s' % (J(occ['before']), J(occ['leaf'])))
        json.dump({'cam': cam, 'state': st, 'lamp': LAMP, 'occ': occ, 'shot': shot}, open(os.path.join(OUT, 'refcam.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('VFOV=%s' % cam['vfov'], flush=True)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
