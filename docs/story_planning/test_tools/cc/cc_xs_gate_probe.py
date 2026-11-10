"""CC（帳號 A）11-10：X246 XS-GATE-FORMAL-1110 新生南路側門正式門柱、鐵門、圍牆（LAWWW 14:21 ②、BB 14:23）。新版 99294fead，改前 e9af13061。
截圖（另一台相機、藏玩家和路人，桌機 1280×720）：側門正面（白天、20:30 晚上看燈籠）、北門柱石牌近照（z 6.8、面向馬路 −x）、圍牆往北、兩個停車架俯視。
量：遊戲場景裡每一個 xs_bike_rack（Z3.BIKE_RACKS.xinsheng）的外框，和 xs_planters_glb 的每一個網格外框的水平距離（重疊＝負的）；BIKE.parkSpots('xinsheng') 每個停車點站不站得住、離花台多遠。
BB：停車架和花台的距離要量、車有沒有停進花台裡也要看（停車點落在花台外框裡＝停進花台）。
【前置／捷徑】load_zone 讀檔到 xinsheng (12, 10)。Playwright（PC GPU）≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_xs_gate_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
R = L.Run('xs_gate_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||55, c.width/c.height, 0.05, 1000); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[[E.player.obj,E.player.obj.visible]]; E.player.obj.visible=false; for(const n of (E.npcs||[])) if(n.obj){ hid.push([n.obj,n.obj.visible]); n.obj.visible=false; }
  try{ r.render(E.scene,cam); } finally { for(const [o,v] of hid) o.visible=v; } return c.toDataURL('image/png'); })"""
MEASURE = r"""(()=>{ const E=GAME.E, g=E.zone.group; const racks=[], pls=[]; const bx=o=>{ const b=new THREE.Box3().setFromObject(o); return {x0:+b.min.x.toFixed(2),x1:+b.max.x.toFixed(2),z0:+b.min.z.toFixed(2),z1:+b.max.z.toFixed(2),y1:+b.max.y.toFixed(2)}; };
  g.traverse(o=>{ if(o.name==='xs_bike_rack') racks.push(bx(o)); });
  const pr=g.children.find(o=>o.name==='xs_planters_glb'); if(pr) pr.traverse(o=>{ if(o.isMesh){ const b=bx(o); if(b.y1<2) pls.push(Object.assign({name:o.name},b)); } });
  const gap=(a,b)=>{ const dx=Math.max(a.x0-b.x1,b.x0-a.x1,0), dz=Math.max(a.z0-b.z1,b.z0-a.z1,0); if(dx===0&&dz===0){ const ox=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0), oz=Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0); return -Math.min(ox,oz); } return Math.hypot(dx,dz); };
  const rows=racks.map(r=>{ let best=null; for(const p of pls){ const d=gap(r,p); if(!best||d<best.d) best={d:+d.toFixed(2),pl:p}; } return {rack:r, nearest:best}; });
  const B=typeof BIKE!=='undefined'?BIKE:null; const spots=B&&B.parkSpots?B.parkSpots(E,'xinsheng').map(q=>{ const inPl=pls.some(p=>q.x>=p.x0&&q.x<=p.x1&&q.z>=p.z0&&q.z<=p.z1); let dmin=null; for(const p of pls){ const dx=Math.max(p.x0-q.x,q.x-p.x1,0), dz=Math.max(p.z0-q.z,q.z-p.z1,0), d=Math.hypot(dx,dz); if(dmin==null||d<dmin) dmin=d; }
    return {x:+q.x.toFixed(2),z:+q.z.toFixed(2),src:q.src,stand:E.canStand?E.canStand(q.x,q.z,0.45,0):null,inPlanter:inPl,toPlanter:dmin==null?null:+dmin.toFixed(2)}; }):null;
  return {planters:pls.length, gateGlb:!!g.children.find(o=>/xs_gate/.test(o.name||'')), racks:rows, spots}; })()"""


async def snap(pg, fn, frm, at, fov=55):
    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at), 'fov': fov}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 新生南路側門：worktree %s；TAG %s；Playwright（PC GPU）≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for h in (14.0, 20.5):
            R.setup('【前置／捷徑】讀檔到 xinsheng (12, 10) 2025-10-18 %.1f 時' % h)
            await D.load_zone(pg, cdp, 'xinsheng', '2025-10-18', h, x=12, z=10, yaw=0.0, wait=12000)
            n = await pg.evaluate(SETTLED); await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(2000)
            tg = 'd' if h < 18 else 'n'
            await snap(pg, 'gate_%s_front_%s.png' % (TAG, tg), (7.5, 1.7, 10), (18.4, 2.2, 10))
            if h < 18:
                m = await pg.evaluate(MEASURE); R.note('量測：%s' % J(m))
                R.check('有正式門柱模型（xs_gate*）', m['gateGlb'], '')
                for r in m['racks']:
                    nb = r['nearest']
                    R.check('停車架 x %.2f～%.2f、z %.2f～%.2f 沒有疊進花台（離最近一段花台 %s m）' % (r['rack']['x0'], r['rack']['x1'], r['rack']['z0'], r['rack']['z1'], nb and nb['d']), not nb or nb['d'] >= 0, J(r))
                for q in (m['spots'] or []):
                    if abs(q['x'] - 15.5) < 3 and (q['z'] < 6 or q['z'] > 14 or True):
                        R.note('停車點 %s' % J(q))
                R.check('合法停車點都不在花台裡、站得住', all(not q['inPlanter'] and q['stand'] is not False for q in (m['spots'] or [])), J(m['spots']))
                await snap(pg, 'gate_%s_plaque_n.png' % TAG, (15.2, 1.7, 6.8), (18.4, 1.9, 6.8), 45)
                await snap(pg, 'gate_%s_wall_north.png' % TAG, (13.5, 1.7, 4.5), (18.4, 1.4, -30))
                for k, z in (('s', 18.5), ('n', 1.5)):
                    await snap(pg, 'gate_%s_rack_%s.png' % (TAG, k), (12.5, 5.5, z - 3.5 if k == 'n' else z + 3.5), (16.5, 0.3, z))
            else:
                await snap(pg, 'gate_%s_lantern_n.png' % TAG, (14.0, 2.4, 6.8), (18.4, 2.6, 6.8), 50)
            await pg.evaluate(D.HUD + '(true)')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
