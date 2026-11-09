"""CC-B（帳號 B）11-09：坐著的人進畫面時姿勢會不會跳（BB-B 16:41；PERF-XS-NPC-1108，LAWWW-B 88c83d1be：坐著、畫面外、離玩家 3 m 以上的 NPC 每 4 幀才更新）。判定＝BB。
【前置／捷徑】讀檔到 ZONE（預設 xs_shanlan）14:00 晴；FLOOR=2 時讀檔把玩家放到 2F（lv1，2F 座位旁）。玩家站定 8 秒。
鏡頭（E.cam.yaw，鏡頭在玩家的 (sin yaw, cos yaw) 那一側）先轉到「背對」坐著的人（他們的重心在鏡頭背後）5 秒 → 一次轉 180° 讓他們進畫面；
轉過去那一刻起，在 E.render 之後直接讀畫布（每 2 幀一張、共 6 張；不是 page.screenshot，那太慢會錯過）；同時記每一張時坐著的人的 pose、坐著的人數、hips 高度。
同一套在不同版本各跑一次（佇列兩項），截圖並排比。用法：LW_TESTS=<wt>/tests [ZONE=xs_shanlan] [FLOOR=2] [TAG=x] python3 cc_seat_pop_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
VISN = """(()=>{ const E=GAME.E, cam=E.camera||GAME.E.cam.camera||(typeof camera!=='undefined'?camera:null); const c=cam||E.renderer&&E.scene&&E.scene.getObjectByProperty('isCamera',true);
  const C=c; C.updateMatrixWorld(); const F=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse));
  const L=(E.npcs||[]).filter(n=>/sit|read/.test(n.pose||'')&&((n.lv|0)===(E.player.lv|0))); let v=0; L.forEach(n=>{ const s=new THREE.Sphere(new THREE.Vector3(n.obj.position.x,n.obj.position.y+0.9,n.obj.position.z),0.6); if(F.intersectsSphere(s)) v++; }); return {seated:L.length, visible:v}; })()"""
ZONE = os.environ.get('ZONE') or 'xs_shanlan'; FLOOR = os.environ.get('FLOOR') or '2'; TAG = os.environ.get('TAG') or 'x'
R = L.Run('seat_pop_' + TAG, OUT); D.setup(R, OUT)
SEATED = """(()=>{ const E=GAME.E, P=E.player.obj.position; const L=(E.npcs||[]).filter(n=>/sit|read/.test(n.pose||'')&&((n.lv|0)===(E.player.lv|0)));
  if(!L.length) return null; let cx=0,cz=0; L.forEach(n=>{cx+=n.obj.position.x; cz+=n.obj.position.z;}); cx/=L.length; cz/=L.length;
  return {n:L.length, c:[+cx.toFixed(2),+cz.toFixed(2)], p:[+P.x.toFixed(2),+P.z.toFixed(2)], far3:L.filter(n=>Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)>=3).length,
    every:E.SEAT_OFF_EVERY===undefined?'沒有這個 patch':E.SEAT_OFF_EVERY}; })()"""
CAP = """(k=>new Promise(res=>{ const E=GAME.E, cv=E.renderer.domElement, out=[]; let f=0; const o=E.render;
  const sn=()=>{ const L=(E.npcs||[]).filter(n=>/sit|read/.test(n.pose||'')&&((n.lv|0)===(E.player.lv|0))); return L.map(n=>{ let hy=null; try{ const v=n.obj.userData&&n.obj.userData.vrm; const h=v&&v.humanoid&&v.humanoid.getNormalizedBoneNode('hips'); if(h){ const w=new THREE.Vector3(); h.getWorldPosition(w); hy=+(w.y-n.obj.position.y).toFixed(3); } }catch(e){} return {id:n.id||n.charId||n.name||'?',pose:n.pose,hipsY:hy}; }); };
  E.render=function(){ const r=o.apply(this,arguments); f++; if(f%2===0&&out.length<k){ out.push({f, img:cv.toDataURL('image/jpeg',0.85), npc:sn(), cy:+E.cam.yaw.toFixed(3)}); } if(out.length>=k){ E.render=o; res(out); } return r; };
  const C=E.cam; C.yaw=FACE; C.manualT=3; }))"""
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 坐著的人進畫面：worktree %s；%s %sF；TAG %s；Playwright ≠ iPhone' % (real or '?', ZONE, FLOOR, TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 %s 2025-10-18 14:00（條件事件、手機關）' % ZONE)
        await D.load_zone(pg, cdp, ZONE, '2025-10-18', 14.0, wait=9000)
        if FLOOR == '2':
            p2 = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(i=>i.seat&&((i.seat.lv|0)>=1||(i.lv|0)>=1)); return q?{x:q.x,z:q.z}:null; })()")
            R.setup('【前置／捷徑】讀檔把玩家放到 2F（lv1，2F 座位旁 %s）' % json.dumps(p2))
            if p2: await D.load_zone(pg, cdp, ZONE, '2025-10-18', 14.0, x=p2['x'], z=p2['z'] + 0.6, yaw=0.0, lv=1, wait=9000)
        await pg.wait_for_timeout(8000)
        s = await pg.evaluate(SEATED); R.note('坐著的人：%s' % json.dumps(s, ensure_ascii=False))
        if not R.check('同一層有坐著的人', bool(s), ''): await b.close(); return
        yaw_face = await pg.evaluate("(c=>{ const P=GAME.E.player.obj.position; return Math.atan2(-(c[0]-P.x), -(c[1]-P.z)); })(%s)" % json.dumps(s['c']))
        back = None   # BB-B 17:15：背對那張畫面裡一個坐著的人都不能有——每 30° 試，等鏡頭停好，用視錐算看得到幾個
        for k in range(12):
            y = yaw_face + 3.14159 + (k // 2 + (k % 2)) * (0.5236 if k % 2 else -0.5236)
            await pg.evaluate("y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=3; }", y); await pg.wait_for_timeout(2500)
            vn = await pg.evaluate(VISN); R.note('試 yaw %.2f：%s' % (y, json.dumps(vn)))
            if vn['visible'] == 0: back = y; break
        if not R.check('找得到一個「坐著的人一個都不在畫面裡」的鏡頭方向', back is not None, ''): await b.close(); return
        R.note('鏡頭背對（yaw %.2f），等 5 秒' % back); await pg.wait_for_timeout(5000)
        vn0 = await pg.evaluate(VISN); R.check('背對 5 秒後畫面裡坐著的人 0 個', vn0['visible'] == 0, json.dumps(vn0))
        await pg.screenshot(path=os.path.join(OUT, 'pop_%s_0_back.png' % TAG))
        caps = await pg.evaluate(CAP.replace('FACE', '%.4f' % yaw_face).replace('const k=', 'const k='), 12)
        for i, c in enumerate(caps):
            open(os.path.join(OUT, 'pop_%s_%d_f%d.jpg' % (TAG, i + 1, c['f'])), 'wb').write(base64.b64decode(c['img'].split(',', 1)[1]))
            R.note('第 %d 張（轉過去後第 %d 幀，鏡頭 yaw %s）：%s' % (i + 1, c['f'], c.get('cy'), json.dumps(c['npc'], ensure_ascii=False)))
        await pg.wait_for_timeout(1500); await pg.screenshot(path=os.path.join(OUT, 'pop_%s_7_after.png' % TAG))
        bad = [(i + 1, q) for i, c in enumerate(caps) for q in c['npc'] if q['hipsY'] is not None and q['hipsY'] > 0.75]
        R.note('hips 高於 0.75 m（像站著）的：%s' % json.dumps(bad[:10], ensure_ascii=False))
        R.check('拍到 6 張', len(caps) == 6, str(len(caps)))
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        json.dump({'seated': s, 'caps': [{'f': c['f'], 'npc': c['npc']} for c in caps]}, open(os.path.join(OUT, 'seat_pop_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
