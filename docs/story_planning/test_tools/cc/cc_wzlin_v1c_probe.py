"""CC-C（帳號 C）11-05：WZLIN_v1c（BB-C 04:50／04:51 派工）——溫州街林家乾麵 v1c（BB〔帳號 A〕做的室內＝D132：結果交 LAWWW-C 判，副本 BB-C）。
  版本：LAWWW-C 整合 01b3e5ac7（LAWWW2-C ee917acd3＋GLB-WALLDIR-1105）。只測擋玩五項＋兩件：
  期望值的出處：src/data/lin_layout.js v2（exit、enterAt、tables、seats 12＝玩家 10＋左欄兩張紅凳 npcOnly、blocks、煮麵台到左欄紅凳那一條擋起來）、
    src/data/places.js wz_lin（11:00–14:00、17:00–21:00，週一公休）、src/zones3d.js wallDirOf（牆的淡出方向沿用上層節點）。
  一、進出：【前置】讀檔溫州街 2025-10-15（三）12:00、林家店門旁 → 走到「進去林家乾麵」按 → 店裡（站得住、推得動）→「離開林家乾麵」→ 溫州街（站得住、推得動）。
  二、座位：玩家能坐的 10 張都坐得下（seatApproach、0.15 m 內、起身推得動）；左欄兩張紅凳（x −1.45）沒有「坐下」按鈕（npcOnly）。
  三、縫和小孤島：①煮麵台到左欄紅凳那一條（x −2.45～−1.27、z −1.4～2.2）站不住 ②店裡站得住的格子（0.1 m）從出生點都連得到（沒有站得住、走不到的小孤島）。
  四、穿模／黑畫面：每一步站得住；每張截圖算亮度。
  五、牆淡出（GLB-WALLDIR-1105）：日和便利店（cvs）、林家乾麵各讀進店裡，鏡頭繞一圈（每 45°）：鏡頭到人頭的那條線打到的牆（WALL_）都要淡出（opacity ≤0.5）；各拍一張。
用法：LW_TESTS=<wt>/tests [PARTS=door,seats,gap,walls] python3 cc_wzlin_v1c_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
PARTS = [x for x in (os.environ.get('PARTS') or 'door,seats,gap,walls').split(',') if x]
R = L.Run('wzlin_v1c', OUT); D.setup(R, OUT)
DAY = '2025-10-15'
ZN = 'wz_lin'
WALLS = r"""(()=>{ const E=GAME.E, cam=E.camera, P=E.player.obj.position, V=THREE.Vector3; const head=new V(P.x,P.y+1.3,P.z), from=cam.position.clone(), dir=head.clone().sub(from), dist=dir.length(); dir.normalize();
  const rc=new THREE.Raycaster(from,dir,0.02,dist-0.2); const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const hits=rc.intersectObjects(E.scene.children,true).filter(h=>vis(h.object)&&/WALL_/.test(h.object.name||''));
  const op=o=>{ const m=Array.isArray(o.material)?o.material[0]:o.material; return m?+(m.opacity==null?1:m.opacity).toFixed(2):null; };
  return {yaw:+E.cam.yaw.toFixed(2), cam:[+from.x.toFixed(2),+from.y.toFixed(2),+from.z.toFixed(2)], hits:hits.slice(0,6).map(h=>({name:h.object.name, op:op(h.object), dir:h.object.userData.dir?[+h.object.userData.dir.x.toFixed(2),+h.object.userData.dir.y.toFixed(2),+h.object.userData.dir.z.toFixed(2)]:null, d:+h.distance.toFixed(2)}))}; })()"""


async def part_door(pg, cdp):
    ea = await pg.evaluate("WZ_SHOPS_LAYOUT.lin.enterAt"); ex = await pg.evaluate("WZ_SHOPS_LAYOUT.lin.exit")
    R.setup('[進出] 讀檔溫州街 %s（三）12:00、林家店門東邊 2 m（%s, %s）' % (DAY, ea['x'] + 2, ea['z']))
    await D.load_zone(pg, cdp, 'wenzhou', DAY, 12.0, ea['x'] + 2.0, ea['z'], -math.pi / 2)
    s = await D.use_exit(pg, cdp, '[進出 溫州街→林家]', '進去林家乾麵', ZN)
    if not s: return False
    sp = await pg.evaluate("WZ_SHOPS_LAYOUT.lin.spawn")
    R.check('[進出] 店裡：站在出生點（spawn (%s, %s) 0.6 m 內）、推得動 ≥0.3 m' % (sp['x'], sp['z']), math.hypot(s['x'] - sp['x'], s['z'] - sp['z']) < 0.6 and await D.pushable(pg, cdp) >= 0.3, J(s))
    await D.shot(pg, 'door_in')
    s = await D.use_exit(pg, cdp, '[進出 林家→溫州街]', '離開林家乾麵', 'wenzhou')
    if not s: return False
    o = ex['spawn']
    R.check('[進出] 回到溫州街店門外（exit.spawn (%s, %s) 0.6 m 內）、推得動' % (o['x'], o['z']), math.hypot(s['x'] - o['x'], s['z'] - o['z']) < 0.6 and await D.pushable(pg, cdp) >= 0.3, J(s))
    await D.shot(pg, 'door_out')
    return True


async def part_seats(pg, cdp):
    lay = await pg.evaluate("(()=>WZ_SHOPS_LAYOUT.lin.seats.map(q=>({x:q.x,z:q.z,table:q.table,stool:!!q.stool,npcOnly:!!q.npcOnly})))()")
    btns = await pg.evaluate(D.SEATS)
    npc = [q for q in lay if q['npcOnly']]
    leak = [b for b in btns if any(math.hypot(b['sx'] - q['x'], b['sz'] - q['z']) < 0.05 for q in npc)]
    R.note('[座位] 配置 %d 張（npcOnly %d：%s）；遊戲裡的「坐下」%d 個' % (len(lay), len(npc), J(npc), len(btns)))
    R.check('[座位] 左欄兩張紅凳（npcOnly）沒有「坐下」按鈕', len(npc) == 2 and not leak, J(leak))
    R.check('[座位] 玩家能坐的位子 10 張（配置 12 − npcOnly 2）', len(btns) == 10 and len(lay) - len(npc) == 10, J([[b['sx'], b['sz'], b['label']] for b in btns]))
    res = await D.sit_all(pg, cdp, '[座位]', 'lin')
    R.note('[座位] 每張：%s' % J(res))


async def part_gap(pg, cdp):
    g = await pg.evaluate("""(()=>{ const E=GAME.E, L=WZ_SHOPS_LAYOUT.lin, c=L.cookLine, st=L.staff, out={gap:[], n:0};
      for(let x=c.x1+0.1; x<=-1.27-0.1+1e-6; x+=0.1) for(let z=c.z0+0.1; z<=st.z0-0.1+1e-6; z+=0.2){ out.n++; if(E.canStand(x,z,0.3,0)) out.gap.push([+x.toFixed(2),+z.toFixed(2)]); }
      // 小孤島：0.1 m 格子、站得住（半徑 0.3）的格子，從出生點四方向連通；連不到的＝孤島
      const W=L.w, Dd=L.d, sp=L.spawn, cell=0.1, nx=Math.round(W/cell), nz=Math.round(Dd/cell), ok=new Uint8Array(nx*nz), seen=new Uint8Array(nx*nz);
      const X=i=>-W/2+(i+0.5)*cell, Z=j=>-Dd/2+(j+0.5)*cell; let total=0;
      for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) if(E.canStand(X(i),Z(j),0.3,0)){ ok[i*nz+j]=1; total++; }
      const si=Math.floor((sp.x+W/2)/cell), sj=Math.floor((sp.z+Dd/2)/cell); const q=[[si,sj]]; if(ok[si*nz+sj]) seen[si*nz+sj]=1; let reach=0;
      while(q.length){ const [i,j]=q.pop(); reach++; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di,b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const k=a*nz+b; if(ok[k]&&!seen[k]){ seen[k]=1; q.push([a,b]); } } }
      const isl=[]; for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const k=i*nz+j; if(ok[k]&&!seen[k]) isl.push([+X(i).toFixed(2),+Z(j).toFixed(2)]); }
      out.total=total; out.reach=reach; out.islands=isl.slice(0,20); out.nIsl=isl.length; out.spawnOk=!!ok[si*nz+sj]; return out; })()""")
    R.check('[縫] 煮麵台到左欄紅凳那一條（x −2.45～−1.27、z −1.4～2.2，%d 點）都站不住' % g['n'], not g['gap'], J(g['gap'][:10]))
    R.check('[孤島] 店裡站得住的格子（%d 格，0.1 m）從出生點都連得到（連得到 %d；孤島 %d 格）' % (g['total'], g['reach'], g['nIsl']), g['spawnOk'] and g['nIsl'] == 0, J(g['islands']))


async def walls_in(pg, cdp, zone, nm, x, z):
    R.setup('[牆淡出] 讀檔 %s（%s）%s 12:00、站在 %s' % (nm, zone, DAY, '(%s, %s)' % (x, z) if x is not None else '區域的出生點'))
    s = await D.load_zone(pg, cdp, zone, DAY, 12.0, x, z, math.pi, wait=9000) if x is not None else await D.load_zone(pg, cdp, zone, DAY, 12.0, wait=9000)
    if not R.check('[牆淡出] 讀到 %s' % zone, s['zone'] == zone, J(s)): return
    n_walls = await pg.evaluate("(()=>{ let n=0, d=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name||'')){ n++; if(o.userData.dir&&!(Math.abs(o.userData.dir.z-1)<1e-6&&Math.abs(o.userData.dir.x)<1e-6)) d++; } }); return [n,d]; })()")
    R.note('[牆淡出] %s：WALL_ 網格 %d 個，dir 不是預設 [0,0,1] 的 %d 個' % (nm, n_walls[0], n_walls[1]))
    bad = []; rows = []
    y0 = await pg.evaluate("GAME.E.cam.yaw")
    for k in range(8):
        await pg.evaluate("(a=>{ GAME.E.cam.yaw=a; })", y0 + k * math.pi / 4); await pg.wait_for_timeout(1200)
        w = await pg.evaluate(WALLS); rows.append(w)
        blk = [h for h in w['hits'] if h['op'] is not None and h['op'] > 0.5]
        if blk: bad.append({'yaw': w['yaw'], 'cam': w['cam'], 'blocking': blk})
        if k in (0, 2, 4, 6): await D.shot(pg, 'walls_%s_%d' % (zone, k * 45), judge_black=True)
    R.note('[牆淡出] %s 鏡頭一圈：%s' % (nm, J(rows)))
    R.check('[牆淡出] %s 鏡頭繞一圈（8 個方向）：擋在鏡頭和人中間的牆都淡出（opacity ≤0.5）' % nm, not bad, J(bad[:4]))
    await pg.evaluate("(a=>{ GAME.E.cam.yaw=a; })", y0)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC WZLIN_v1c（林家乾麵 v1c：擋玩五項＋牆淡出；D132 交 LAWWW-C 判）：PARTS=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        v = await pg.evaluate("(()=>typeof LIN_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT.lin===LIN_LAYOUT?LIN_LAYOUT.version:null)()")
        if not R.check('這一版的林家是 lin_layout.js v2（v1c 模型）', v == 2, J(v)): await b.close(); sys.exit(1)
        if 'door' in PARTS: await part_door(pg, cdp)
        if 'seats' in PARTS or 'gap' in PARTS:
            sp = await pg.evaluate("WZ_SHOPS_LAYOUT.lin.spawn")
            R.setup('[店裡] 讀檔林家乾麵 %s 12:00（出生點）' % DAY)
            await D.load_zone(pg, cdp, ZN, DAY, 12.0, sp['x'], sp['z'], math.pi, wait=9000)
            if 'gap' in PARTS: await part_gap(pg, cdp)
            if 'seats' in PARTS: await part_seats(pg, cdp)
        if 'walls' in PARTS:
            await walls_in(pg, cdp, ZN, '林家乾麵', 0.1, 0.0)
            await walls_in(pg, cdp, 'cvs', '日和便利店', None, None)   # 日和：讀檔用區域自己的出生點
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
