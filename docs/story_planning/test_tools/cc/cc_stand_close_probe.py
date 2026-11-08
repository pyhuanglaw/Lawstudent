"""CC-B（帳號 B）11-07：SHOP_CROWD c／d 補近照（BB-B 14:10）——無名客人站在 canStand=false 的點，畫面上多嚴重。
CASES：分號／加號分隔，每一筆「區域,日期,時,x,z,名字」。每一筆：
  【前置／捷徑】讀檔進店（條件事件關閉）等 4 秒 → 找最靠近 (x,z) 的 NPC → 在它周圍 1.6～1.9 m 找玩家站得住的點（8 個方向）→ 讀檔把玩家放在那裡、面向客人，
  遊戲自己的跟隨鏡頭擺在玩家背後（E.cam.yaw）→ 等 3 秒拍一張（不暫停、不搬鏡頭）。
  印：客人的 id、位置、姿勢、canStand（0／0.2／0.33 m）；那一點周圍 1.2 m 內的網格（名字、距離、包圍盒）；兩隻腳（raw foot／toes 骨頭）有沒有在哪個家具／牆的包圍盒裡（地板不算）。
判定＝BB。用法：LW_TESTS=<wt>/tests CASES=... python3 cc_stand_close_probe.py <url> <out>"""
import os, sys, json, asyncio, math, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('stand_close', OUT); D.setup(R, OUT)
CASES = [re.split(r',', x) for x in re.split(r'[;+]', os.environ.get('CASES') or 'xs_nanyang,2025-10-18,10.5,-4.1,-3.7,nanyang_day+xs_dakou,2025-10-18,8,-1.5,-4.9,dakou_day') if x.strip()]

FIND = r"""((p)=>{ const E=GAME.E; let best=null, bd=1e9; for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o) continue; const d=Math.hypot(o.position.x-p[0],o.position.z-p[1]); if(d<bd){ bd=d; best=n; } }
  if(!best) return null; const o=best.obj, lv=best.lv||0; const cs=r=>E.canStand?!!E.canStand(o.position.x,o.position.z,r,lv):null;
  const spots=[]; for(let k=0;k<8;k++){ const a=k*Math.PI/4; for(const d of [1.8,1.6,1.9]){ const x=o.position.x+Math.sin(a)*d, z=o.position.z+Math.cos(a)*d; if(E.canStand&&E.canStand(x,z,0.33,lv)){ spots.push({x:+x.toFixed(2),z:+z.toFixed(2),a:+a.toFixed(2)}); break; } } }
  return {name:best.name||best.id||null, pos:[+o.position.x.toFixed(2),+o.position.y.toFixed(2),+o.position.z.toFixed(2)], dist:+bd.toFixed(2), lv, pose:best.pose||null, stand:{r0:cs(0.01),r02:cs(0.2),r033:cs(0.33)}, spots}; })"""

NEAR = r"""((p)=>{ const E=GAME.E; let n=null, bd=1e9; for(const q of (E.npcs||[])){ const o=q&&q.obj; if(!o) continue; const d=Math.hypot(o.position.x-p[0],o.position.z-p[1]); if(d<bd){ bd=d; n=q; } }
  const o=n.obj, c=new THREE.Vector3(o.position.x,o.position.y+0.5,o.position.z); const box=new THREE.Box3(), near=[];
  E.zone.group.traverse(m=>{ if(!m.isMesh||!m.visible) return; box.setFromObject(m); if(box.isEmpty()) return; const sz=box.getSize(new THREE.Vector3()); if(sz.y<0.06&&box.max.y<o.position.y+0.08) return;   /* 地板、地毯 */
    const d=box.distanceToPoint(c); if(d<1.2){ let g=m, path=[]; while(g&&g!==E.zone.group&&path.length<4){ if(g.name) path.push(g.name); g=g.parent; } near.push({name:path.join('<')||m.type, d:+d.toFixed(2), min:box.min.toArray().map(v=>+v.toFixed(2)), max:box.max.toArray().map(v=>+v.toFixed(2)), _b:box.clone()}); } });
  near.sort((a,b)=>a.d-b.d);
  const u=o.userData||{}, hm=u.vrm&&u.vrm.humanoid, feet=[];
  if(hm) for(const b of ['leftFoot','rightFoot','leftToes','rightToes']){ const nd=hm.getRawBoneNode(b); if(!nd) continue; const w=nd.getWorldPosition(new THREE.Vector3()); const inside=near.filter(x=>x._b.containsPoint(w)).map(x=>x.name); feet.push({bone:b, p:w.toArray().map(v=>+v.toFixed(2)), inside}); }
  return {npc:n.name||n.id||null, pos:[+o.position.x.toFixed(2),+o.position.z.toFixed(2)], pose:n.pose, isFar:!!u.isFar, near:near.slice(0,10).map(({_b,...r})=>r), feet}; })"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 客人站位近照：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for zone, day, h, x, z, nm in CASES:
                tag = '[%s]' % nm; x, z = float(x), float(z)
                try:
                    R.setup('%s 讀檔 %s %s %s（條件事件關閉）等 4 秒找 (%.1f,%.1f) 的客人' % (tag, zone, day, h, x, z))
                    s = await D.load_zone(pg, cdp, zone, day, float(h), wait=4000)
                    if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): continue
                    f = await pg.evaluate(FIND, [x, z])
                    R.note('%s 最近的 NPC：%s' % (tag, J(f)))
                    if not f or f['dist'] > 0.6 or not f['spots']:
                        R.check('%s 那一點有客人、旁邊有玩家站得住的點' % tag, False, J(f)); continue
                    sp = f['spots'][0]; dx, dz = f['pos'][0] - sp['x'], f['pos'][2] - sp['z']; yaw = math.atan2(dx, dz)
                    R.setup('%s 讀檔把玩家放在 (%.2f,%.2f)、面向客人（離 %.1f m），跟隨鏡頭在玩家背後' % (tag, sp['x'], sp['z'], math.hypot(dx, dz)))
                    await D.load_zone(pg, cdp, zone, day, float(h), x=sp['x'], z=sp['z'], yaw=yaw, wait=1500)
                    await pg.evaluate("(y=>{ const E=GAME.E; if(E.cam){ E.cam.yaw=y; if(E.cam.pitch!=null) E.cam.pitch=Math.min(E.cam.pitch,0.45); } })", math.atan2(-dx, -dz))
                    await pg.wait_for_timeout(3000)
                    nr = await pg.evaluate(NEAR, [f['pos'][0], f['pos'][2]])
                    await pg.screenshot(path=os.path.join(OUT, 'stand_%s.png' % nm))
                    sunk = [ft for ft in nr['feet'] if ft['inside']]
                    R.note('%s 客人 %s 在 %s、pose %s、isFar %s；canStand 0／0.2／0.33 m＝%s' % (tag, nr['npc'], nr['pos'], nr['pose'], nr['isFar'], J(f['stand'])))
                    R.note('%s 周圍 1.2 m 內的東西（離腰高那一點的距離）：%s' % (tag, J(nr['near'])))
                    R.note('%s 腳：%s' % (tag, J(nr['feet'])))
                    R.check('%s 腳沒有在家具／牆的包圍盒裡' % tag, not sunk, J(sunk))
                    rec['cases'].append({'name': nm, 'find': f, 'near': nr})
                except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'stand_close.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
