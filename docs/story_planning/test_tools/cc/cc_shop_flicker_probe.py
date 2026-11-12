"""CC-C 11-12：⑩ 店內牆閃爍（L118-DRINK-WALL-FLICKER-1112＋WZ-OFFBEAT-WINDOW-FLICKER-1112；LAWWW2 e6fdba625，BB-C 04:29）。判定歸 BB（看連拍）；Playwright 手機橫向（PC GPU 有視窗）≠ iPhone。
受測 bd8643003a（含 e6fdba625 挪頂點）；舊版 1cd2116ee1 同機位對照（D34：舊版應該閃）。
四處（座標照 LAWWW2 README docs/art-rebuild/second_ai/wip/shop_flicker_1112/README.md）：
  L118_A 118 巷 喝不喝咖啡 後牆 x 8.1（東側 z −7～−2）；L118_B 果茶社 後牆 x −8.15（西側 z −9～−6）；
  WZ_W 溫州街 日常失速 西牆 x −47.2；WZ_N 日常失速 北牆 z −8.0（店門 enterAt (−36.5, −9.6)，從街上往落地窗裡看）。
每一處：【前置／捷徑】load_zone 讀檔到街上那一點（目標前方、站得住的最近一點）14:00，鏡頭轉向牆（E.cam.yaw）。
  ① 走動 20 秒：搖桿左右橫移（垂直視線，每次 1 秒），每 0.25 秒用遊戲鏡頭畫一張（連拍，給 BB 看）；
  ② 轉鏡頭 20 秒：觸控在畫面空白處左右拖曳（玩家轉鏡頭的做法），每 0.25 秒一張；
  ③ 數字（可以新舊比）：另一台相機固定在那一點、眼高 1.6 m 看牆，轉 0.05° 前後兩張逐點比——疊面（z-fighting）那一塊會大片翻動，正常的牆幾乎不變；
     20 組，記中央區域「差很多（亮度差 >40）」的像素比例平均和最大。舊版應該高、新版低。
輸出：每處 <處>_walk_NN.jpg、<處>_rot_NN.jpg、拼一張 <處>_contact.jpg；flicker.json（③ 的數字）。只記錄，判定歸 BB。
CC_02 清單 2026-11-12：1✓ 2✓（座標全從 LAWWW2 README；站的點用 E.canStand 找） 3n/a（BB 指定四處） 4✓（拖曳在畫面中間偏上空白處，先確認最上層不是按鈕） 5✓ 6✓（讀檔等 8 秒＋ASSETS 載完） 7✓ 8✓（亮度差 40 是 CC 訂的參考值，只記不判，已註明） 9n/a（要看到真的畫面，不藏玩家；③ 的相機在玩家眼睛的位置） 10n/a（讀檔關條件事件） 11✓ 12✓（記讀到的區域、鏡頭有沒有對著牆：畫面中央的物件名） 13✓（橫移 1 秒一段，途中有對話就停）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [SPOTS=L118_A,L118_B,WZ_W,WZ_N] python3 cc_shop_flicker_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
SPOTS = [s for s in (os.environ.get('SPOTS') or 'L118_A,L118_B,WZ_W,WZ_N').split(',') if s]
R = L.Run('flicker_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'
SPOT = {'L118_A': {'zone': 'lane118', 'name': '118巷 喝不喝咖啡 後牆', 'near': (2.0, -4.5), 'at': (8.1, 1.4, -4.5)},
        'L118_B': {'zone': 'lane118', 'name': '118巷 果茶社 後牆', 'near': (-2.0, -7.5), 'at': (-8.15, 1.4, -7.5)},
        'WZ_W': {'zone': 'wenzhou', 'name': '溫州街 日常失速 西牆', 'near': (-36.0, -10.0), 'at': (-47.2, 1.5, -10.5)},
        'WZ_N': {'zone': 'wenzhou', 'name': '溫州街 日常失速 北牆', 'near': (-36.0, -12.0), 'at': (-43.0, 1.5, -8.0)}}
SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
NEAR_JS = r"""(a=>{ const E=GAME.E; let best=null; for(let r=0;r<=4;r+=0.25) for(let k=0;k<16;k++){ const x=a[0]+Math.sin(k*Math.PI/8)*r, z=a[1]+Math.cos(k*Math.PI/8)*r; if(E.canStand(x,z,0.33,0)){ best=[+x.toFixed(2),+z.toFixed(2)]; return best; } } return best; })"""
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/jpeg',0.8); })()"
AIM_JS = "(a=>{ const E=GAME.E, P=E.player.obj.position; const dx=a[0]-P.x, dz=a[1]-P.z; E.cam.yaw=Math.atan2(-dx,-dz); return +E.cam.yaw.toFixed(3); })"
CENTER_OBJ = r"""(()=>{ const E=GAME.E, rc=new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(0,0.1),E.camera); const h=rc.intersectObjects(E.scene.children,true).filter(x=>x.object.visible)[0];
  return h?{name:(h.object.name||h.object.parent&&h.object.parent.name||'').slice(0,40), mat:(h.object.material&&h.object.material.name||'').slice(0,30), d:+h.distance.toFixed(2), p:[+h.point.x.toFixed(2),+h.point.y.toFixed(2),+h.point.z.toFixed(2)]}:null; })()"""
ZF_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, W=200, H=Math.round(200*c.height/c.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d',{willReadFrequently:true});
  const cam=new THREE.PerspectiveCamera(55, c.width/c.height, 0.05, 400); const out=[];
  const shot=yaw=>{ cam.position.set(a.from[0],1.6,a.from[1]); cam.rotation.set(0,0,0); cam.lookAt(a.at[0],a.at[1],a.at[2]); cam.rotateY(yaw); cam.updateMatrixWorld(true); r.render(E.scene,cam); g.drawImage(c,0,0,W,H); return g.getImageData(0,0,W,H).data; };
  for(let i=0;i<20;i++){ const b=(i-10)*0.004; const A=shot(b), B=shot(b+0.05*Math.PI/180); let n=0,m=0;
    for(let y=Math.floor(H*0.2);y<Math.floor(H*0.8);y++) for(let x=Math.floor(W*0.2);x<Math.floor(W*0.8);x++){ const o=(y*W+x)*4; const la=0.299*A[o]+0.587*A[o+1]+0.114*A[o+2], lb=0.299*B[o]+0.587*B[o+1]+0.114*B[o+2]; m++; if(Math.abs(la-lb)>40) n++; }
    out.push(+(n*100/m).toFixed(3)); }
  r.render(E.scene,E.camera); const s=out.slice().sort((x,y)=>x-y); return {pct:out, mean:+(out.reduce((x,y)=>x+y,0)/out.length).toFixed(3), max:s[s.length-1], median:s[10]}; })"""


async def burst(pg, tag, key, kind, act, secs=20):
    frames = []; t0 = time.time(); k = 0; task = asyncio.ensure_future(act())
    while time.time() - t0 < secs:
        u = await pg.evaluate(GAMECAM); k += 1
        if k % 2 == 1:   # 每 0.5 秒存一張（0.25 秒取樣，一半存檔，避免太多檔）
            fn = '%s_%s_%s_%02d.jpg' % (TAG, key, kind, len(frames)); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1])); frames.append(fn)
        await pg.wait_for_timeout(250)
    try: await asyncio.wait_for(task, 5)
    except Exception: task.cancel()
    return frames


async def main():
    print('CC SHOP-FLICKER：TAG %s；SHA %s；SPOTS %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(SPOTS)), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'spots': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for key in SPOTS:
            S = SPOT[key]; tag = '[%s %s]' % (key, S['name'])
            s = await D.load_zone(pg, cdp, S['zone'], DAY, 14.0, x=S['near'][0], z=S['near'][1], yaw=0.0, wait=8000)
            if not R.check('%s 讀到 %s' % (tag, S['zone']), s['zone'] == S['zone'], J(s)): continue
            await pg.evaluate(SETTLED)
            pt = await pg.evaluate(NEAR_JS, list(S['near']))
            if pt and (abs(pt[0] - s['x']) > 0.3 or abs(pt[1] - s['z']) > 0.3):
                s = await D.load_zone(pg, cdp, S['zone'], DAY, 14.0, x=pt[0], z=pt[1], yaw=0.0, wait=6000); await pg.evaluate(SETTLED)
            R.setup('%s 【前置／捷徑】讀檔到 %s %s 14:00 站在 (%s, %s)（目標前方站得住的最近一點）' % (tag, S['zone'], DAY, s['x'], s['z']))
            yaw = await pg.evaluate(AIM_JS, [S['at'][0], S['at'][2]]); await pg.wait_for_timeout(1500)
            co = await pg.evaluate(CENTER_OBJ); R.note('%s 鏡頭 yaw %s；畫面中央打到 %s' % (tag, yaw, J(co)))
            dx, dz = S['at'][0] - s['x'], S['at'][2] - s['z']; m = math.hypot(dx, dz) or 1; px, pz = -dz / m, dx / m   # 垂直視線的橫移方向

            async def strafe():
                for i in range(18):
                    q = await D.st(pg)
                    if q['dlg'] or q['choices']: R.note('%s 橫移途中有對話／選單，停下來' % tag); return
                    sg = 1 if i % 2 == 0 else -1; await pg.evaluate(AIM_JS, [S['at'][0], S['at'][2]])
                    cy = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(cy), -math.cos(cy); rx, rz = math.cos(cy), -math.sin(cy)
                    wx, wz = px * sg, pz * sg; sx, sy = wx * rx + wz * rz, -(wx * fx + wz * fz); mm = math.hypot(sx, sy) or 1
                    await L.joystick(pg, cdp, sx / mm * 40, sy / mm * 40, 1000)

            async def rotate():
                vw = await pg.evaluate("[innerWidth, innerHeight]"); cx, cy0 = vw[0] * 0.55, vw[1] * 0.3
                top = await pg.evaluate("(a=>{ const e=document.elementFromPoint(a[0],a[1]); return e?(e.id||e.tagName):null; })", [cx, cy0])
                R.note('%s 拖曳的那一點最上層是 %s' % (tag, top))
                for i in range(10):
                    sg = 1 if i % 2 == 0 else -1
                    await L.drag(pg, cdp, cx, cy0, cx + sg * 120, cy0, steps=16)
            fw = await burst(pg, tag, key, 'walk', strafe)
            await pg.evaluate(AIM_JS, [S['at'][0], S['at'][2]]); await pg.wait_for_timeout(800)
            fr = await burst(pg, tag, key, 'rot', rotate)
            z = await pg.evaluate(ZF_JS, {'from': [s['x'], s['z']], 'at': list(S['at'])})
            R.note('%s ③ 轉 0.05° 前後亮度差 >40 的像素比例（%%）：平均 %s、中位 %s、最大 %s；走動連拍 %d 張、轉鏡頭 %d 張' % (tag, z['mean'], z['median'], z['max'], len(fw), len(fr)))
            R.check('%s 連拍有拍到（走動 %d、轉鏡頭 %d 張）' % (tag, len(fw), len(fr)), len(fw) >= 10 and len(fr) >= 10, '')
            res['spots'][key] = {'name': S['name'], 'stand': [s['x'], s['z']], 'center': co, 'zfight': z, 'walk': fw, 'rot': fr}
            open(os.path.join(OUT, 'flicker_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
