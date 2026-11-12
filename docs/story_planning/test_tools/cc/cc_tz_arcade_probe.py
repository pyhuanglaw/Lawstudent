"""CC-C 11-12：汀州路走騎樓（TZ_ARCADE_WALK；BB-C 12:32 P1：SHUT_TZ_door_14_r2 有四間站在門前 4.5 m 四周都是店內，懷疑室內長到騎樓上）。結果給 BB 判。Playwright（PC GPU）≠ iPhone。
做法：【前置／捷徑】讀檔到汀州路 DAY 14:00（條件事件關掉）、站在第一間門口 → 照 SHOPS 順序（預設泰米→聯通→東南大聯→客居→越好吃）真的走（go_to）到每一間門口外 1.5 m（騎樓上）→
  停 2 秒 → 遊戲鏡頭截一張＋正上方俯視一張（另一台相機、以門為中心、高 10 m）→ 記：那一間 zone.shopReal 的 built／on、室內中心、ry、寬深、世界座標四角；
  門（出口互動點）的位置；室內正面（玻璃面）比門多往外凸幾 m（沿朝街方向）；門外 0～6 m 每 0.5 m 站不站得住；附近名字像柱子的 mesh 的位置（騎樓外緣的參考）。
CC_02 清單 2026-11-12：1✓（14:00 營業） 2✓（店、門、柱子全從遊戲讀：zone.shopReal、exit 互動點、mesh 名字） 3✓（一次讀檔照順序走） 4n/a（不按） 5✓（go_to 走過去，照玩家） 6✓（每間停 2 秒） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：照玩家看到的） 10✓（條件事件關掉） 11✓ 12✓（每間同樣欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [DAY=2025-10-14] [HOUR=14] [SHOPS=tz_taimi,tz_liantong,tz_dongnan,tz_keju,tz_yuehaochi] python3 cc_tz_arcade_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 14)
SHOPS = [x for x in (os.environ.get('SHOPS') or 'tz_taimi,tz_liantong,tz_dongnan,tz_keju,tz_yuehaochi').split(',') if x]
R = L.Run('tz_arcade', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
INFO = r"""(z=>{ const E=GAME.E, r2=v=>+(+v).toFixed(2); const it=E.interactables.find(i=>i.exit&&i.exit.to===z&&!i.hidden); const S=E.zone&&E.zone.shopReal, s=S&&(S.shops||[]).find(q=>q.place===z);
  let shop=null, n=null; if(s){ const cx=s.cx===undefined?s.x:s.cx, cz=s.cz===undefined?s.z:s.cz, ry=s.ry||0, c=Math.cos(ry), sn=Math.sin(ry), hw=(s.w||6)/2, hd=(s.d||8)/2; n=[sn,c];
    const pt=(u,v)=>[r2(cx+u*c+v*sn), r2(cz-u*sn+v*c)]; shop={built:!!s.built, on:!!s.on, cx:r2(cx), cz:r2(cz), ry:r2(ry), w:s.w, d:s.d, corners:[pt(-hw,-hd),pt(hw,-hd),pt(hw,hd),pt(-hw,hd)], front:pt(0,hd)}; }
  const door=it?{x:r2(it.x), z:r2(it.z), label:it.label}:null; if(!n&&door) n=[1,0];
  let bulge=null; if(shop&&door) bulge=r2((shop.front[0]-door.x)*n[0]+(shop.front[1]-door.z)*n[1]);   /* 室內正面比門多往外（朝街）凸幾 m：正數＝室內伸到門外 */
  const stand=[]; if(door) for(let k=0;k<=12;k++){ const d=k*0.5; stand.push([d, !!E.canStand(door.x+n[0]*d, door.z+n[1]*d, 0.25, 0)]); }
  const cols=[]; if(door) E.scene.traverse(o=>{ if(!o.isMesh||!/pillar|column|col_|colum|arcade|qilou|post/i.test((o.name||'')+(o.parent&&o.parent.name||''))) return; const p=new THREE.Vector3(); o.getWorldPosition(p); if(Math.hypot(p.x-door.x,p.z-door.z)<7) cols.push([String(o.name||o.parent.name).slice(0,24), r2(p.x), r2(p.z)]); });
  return {zone:z, door, n:n&&n.map(r2), shop, bulge, stand, cols:cols.slice(0,10)}; })"""
TOP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 300); cam.position.set(a.x, 10, a.z+0.01); cam.up.set(0,0,-1); cam.lookAt(a.x, 0, a.z); cam.updateMatrixWorld(true);
  const hid=[]; E.scene.traverse(o=>{ if(o.isMesh&&o.visible){ const b=new THREE.Box3().setFromObject(o); if(b.min.y>3.2&&Math.hypot((b.min.x+b.max.x)/2-a.x,(b.min.z+b.max.z)/2-a.z)<14){ hid.push(o); o.visible=false; } } });   /* 藏騎樓頂、樓上（看得到地面上的店內和騎樓）*/
  let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { for(const o of hid) o.visible=true; } return url; })"""


async def main():
    print('CC 汀州路走騎樓：SHA %s；%s %.1f；SHOPS %s' % (SHA or '?', DAY, HOUR, SHOPS), flush=True)
    res = {'sha': SHA, 'shops': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        s = await D.load_zone(pg, cdp, 'tingzhou', DAY, HOUR, wait=9000)
        if not R.check('讀到汀州路', s['zone'] == 'tingzhou', J(s)): await b.close(); sys.exit(1)
        first = await pg.evaluate(INFO, SHOPS[0])
        if first.get('door'):
            await pg.evaluate("(a=>{ GAME.E.player.obj.position.set(a.x,0,a.z); })", {'x': first['door']['x'] + first['n'][0] * 1.5, 'z': first['door']['z'] + first['n'][1] * 1.5}); await pg.wait_for_timeout(3000)
        R.setup('【前置／捷徑】讀檔到汀州路 %s %.1f（條件事件關掉）、站到 %s 門外 1.5 m' % (DAY, HOUR, SHOPS[0]))
        for k, z in enumerate(SHOPS):
            inf = await pg.evaluate(INFO, z)
            if not R.check('[%s] 找得到門' % z, bool(inf.get('door')), J(inf)): continue
            tx, tz = inf['door']['x'] + inf['n'][0] * 1.5, inf['door']['z'] + inf['n'][1] * 1.5
            await L.go_to(pg, cdp, R, tx, tz, 0.4, '%s 門外 1.5 m' % z, max_s=60); await pg.wait_for_timeout(2000)
            inf = await pg.evaluate(INFO, z); pos = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [+p.x.toFixed(2), +p.z.toFixed(2)]; })()")
            await pg.screenshot(path=os.path.join(OUT, 'arcade_%02d_%s_game.png' % (k, z)))
            u = await pg.evaluate(TOP, {'x': inf['door']['x'], 'z': inf['door']['z']})
            if u: open(os.path.join(OUT, 'arcade_%02d_%s_top.jpg' % (k, z)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
            R.note('[%s] 祐廷在 %s；門 %s 朝外 %s；室內 %s；室內正面比門往外凸 %s m；門外每 0.5 m 站得住 %s；柱子 %s' % (z, pos, J(inf['door']), inf['n'], J(inf['shop']), inf['bulge'], J(inf['stand']), J(inf['cols'])))
            res['shops'].append(dict(inf, player=pos))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'tz_arcade.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
