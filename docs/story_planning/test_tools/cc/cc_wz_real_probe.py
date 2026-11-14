"""CC-C 11-12：溫州街三間店外＝店內（SHOP-REAL-INSIDE-1112 溫州街：日常失速 wz_offbeat、SUNNY SIDE wz_brunch、小路 wz_teishoku；LAWWW-C 11:28 72fc1ffc88 交排，範圍照 BB）。結果給 BB 判。Playwright（PC GPU）≠ iPhone。
每個時間（HOURS，預設 14、22）：
  ① 【前置／捷徑】讀檔到 wenzhou，等 10 秒（預載）→ 記 zone.shopReal（lite、每間 built／ready／on、位置、朝向）。
  ② 每一間：【捷徑】把祐廷放到那間店面前 3 m（讓「走近才顯示」打開）等 3 秒 → 另一台相機拍：全景（店面前 16 m、高 5 m）、從街上往裡看（店面前 5 m、高 1.6 m、看室內中間）；遊戲鏡頭 E.cam.yaw 也轉向店面（r2：r1 的 street_game 拍到的是街）；記那間 on／built。
  ③ 每一間：【前置／捷徑】讀檔進那間（區域出生點）→ 遊戲鏡頭截圖＋另一台相機從門口往裡看（門口互動點往室內 1 m、和②同一個方向）＝「走進去同方向」。
  ④ SUNNY SIDE 的門：街上的門（wenzhou 裡 exit.to＝wz_brunch 的互動點）前 4 m 拍一張；店內的門（wz_brunch 裡 exit.to＝wenzhou）往門看 4 m 拍一張（BB-C 11:28：這版的不一致先記）。
CC-B 11-14：STAND／GLASS_FACE／WAIT_S／MID（WZ_REAL_r5，BB-B 12:36）。
CC_02 清單 2026-11-12：1✓（14:00 開、22:00 照 LAWWW） 2✓（店的位置、朝向從 zone.shopReal 讀，門從出口互動點讀） 3✓（每個時間、每一間重新讀檔） 4n/a（不按按鈕） 5n/a（拍照：祐廷放到店前是捷徑，走路的效能另一支 cc_xs_inside_perf_probe） 6✓（預載等 10 秒、每間等 3 秒） 7✓ 8n/a（不判，給 BB） 9✓（全景、往裡看那幾張藏路人和祐廷：要看店） 10✓（條件事件關掉） 11✓ 12✓（三間同樣欄位） 13✓（讀檔、放位置捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [DAY=2025-10-14] [HOURS=14,22] [SHOPS=wz_offbeat,wz_brunch,wz_teishoku] python3 cc_wz_real_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-10-14'
HOURS = [float(x) for x in (os.environ.get('HOURS') or '14,22').split(',') if x]
SHOPS = [x for x in (os.environ.get('SHOPS') or 'wz_offbeat,wz_brunch,wz_teishoku').split(',') if x]
STAND = float(os.environ.get('STAND') or 3)   # 祐廷站在玻璃面外幾公尺
GLASS_FACE = (os.environ.get('GLASS_FACE') or '0') == '1'   # 1＝cx／cz 當玻璃面（r5 起）
WAIT_S = float(os.environ.get('WAIT_S') or 3)
STAND_XZ = [float(v) for v in (os.environ.get('STAND_XZ') or '').split(',') if v.strip()]   # 直接指定祐廷站的位置（x,z），r5＝44,-3.5（BB-B 12:36「門口 1～2 m」）
MID = (os.environ.get('MID') or '0') == '1'   # BB-B 12:36：站路中間 (MID_X, MID_Z) 用主鏡頭、不藏人，各看一次兩邊（南＝SUNNY SIDE、北＝林家乾麵）
MID_X = float(os.environ.get('MID_X') or 44); MID_Z = float(os.environ.get('MID_Z') or 0)
R = L.Run('wz_real', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
REAL = r"""(()=>{ const z=GAME.E.zone, S=z&&z.shopReal; if(!S) return {none:true, keys:z?Object.keys(z).filter(k=>/shop/i.test(k)):[]}; const r2=v=>v==null?null:+(+v).toFixed(2);
  return {lite:S.lite, warmQ:Array.isArray(S.warmQ)?S.warmQ.length:S.warmQ, shops:(S.shops||[]).map(s=>({id:s.id, place:s.place||null, x:r2(s.x), z:r2(s.z), cx:r2(s.cx), cz:r2(s.cz), ry:r2(s.ry), w:r2(s.w), d:r2(s.d), built:!!s.built, ready:!!s.ready, on:!!s.on, loading:!!s.loading,
    meshes:typeof s.meshes==='number'?s.meshes:(Array.isArray(s.meshes)?s.meshes.length:null), grpVis:s.grp?s.grp.visible:null, shutter:s.shutter?s.shutter.visible:null}))}; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||55, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[]; const hide=o=>{ if(o&&o.visible){ o.visible=false; hid.push(o); } }; if(E.player&&E.player.obj) hide(E.player.obj); if(a.hidePeople) for(const n of (E.npcs||[])){ if(n&&n.obj){ hide(n.obj); } }
  let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { for(const o of hid) o.visible=true; } return url; })"""
EXIT = r"""(to=>{ const i=GAME.E.interactables.find(q=>q.exit&&q.exit.to===to); return i?{x:+i.x.toFixed(2), z:+i.z.toFixed(2), label:i.label, lv:i.lv|0}:null; })"""


async def snap(pg, name, frm, at, people=True):
    u = await pg.evaluate(SNAP, {'from': frm, 'at': at, 'hidePeople': people})
    if u: open(os.path.join(OUT, name), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def front(s):
    cx = s['cx'] if s.get('cx') is not None else s['x']; cz = s['cz'] if s.get('cz') is not None else s['z']
    nx, nz = math.sin(s['ry'] or 0), math.cos(s['ry'] or 0); hd = (s['d'] or 8) / 2
    if s.get('cx') is not None and s.get('cz') is not None and GLASS_FACE: return cx, cz, nx, nz, cx, cz   # CC-B 11-14（WZ_REAL_r4 TEST_SETUP）：cx／cz 已經是玻璃面（zones3d.js wzShopReal），不要再往外加半個深度——r4 的「前 3 m」其實離玻璃 8 m、比對街的林家還遠
    return cx, cz, nx, nz, cx + nx * hd, cz + nz * hd


async def main():
    print('CC 溫州街三間店外＝店內：SHA %s；%s；HOURS %s；SHOPS %s' % (SHA or '?', DAY, HOURS, SHOPS), flush=True)
    res = {'sha': SHA, 'hours': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for h in HOURS:
            ht = ('%05.2f' % h).replace('.', ''); tag = '[%s %s]' % (DAY, h); rec = {'shops': {}}
            await pg.goto(URL); await L.wait_loaded(pg)
            s = await D.load_zone(pg, cdp, 'wenzhou', DAY, h, wait=10000)
            R.setup('%s 【前置／捷徑】讀檔到 wenzhou %s %.1f、等 10 秒（條件事件關掉）' % (tag, DAY, h))
            if not R.check('%s 讀到 wenzhou' % tag, s['zone'] == 'wenzhou', J(s)): continue
            real = await pg.evaluate(REAL); rec['real0'] = real
            R.note('%s 進區域 10 秒 zone.shopReal：%s' % (tag, J(real)))
            if not R.check('%s 有 zone.shopReal' % tag, not real.get('none'), J(real)): continue
            for sh in real['shops']:
                if sh.get('place') not in SHOPS: continue
                cx, cz, nx, nz, fx, fz = front(sh); pid = sh['place']
                await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); P.rotation.y=a.yaw; if(GAME.E.cam) GAME.E.cam.yaw=a.cy; })", {'x': STAND_XZ[0] if STAND_XZ else fx + nx * STAND, 'z': STAND_XZ[1] if STAND_XZ else fz + nz * STAND, 'yaw': math.atan2(-nx, -nz), 'cy': math.atan2(nx, nz)})
                await pg.wait_for_timeout(int(WAIT_S * 1000))
                st = next((q for q in (await pg.evaluate(REAL))['shops'] if q['id'] == sh['id']), {})
                await pg.screenshot(path=os.path.join(OUT, 'wz_%s_%s_street_game.png' % (ht, pid)))
                await snap(pg, 'wz_%s_%s_pano.jpg' % (ht, pid), [fx + nx * 16, 5.0, fz + nz * 16], [fx, 2.0, fz])
                await snap(pg, 'wz_%s_%s_lookin.jpg' % (ht, pid), [fx + nx * 5, 1.6, fz + nz * 5], [cx, 1.3, cz])
                rec['shops'][pid] = {'shop': sh, 'near': st}
                R.note('%s %s：【捷徑】祐廷放到玻璃面外 %.1f m（%.2f,%.2f）等 %.0f 秒 → %s；拍了全景、從街上往裡看（相機 %.2f,1.6,%.2f → 室內中心 %.2f,%.2f）' % (tag, pid, STAND, STAND_XZ[0] if STAND_XZ else fx + nx * STAND, STAND_XZ[1] if STAND_XZ else fz + nz * STAND, WAIT_S, J(st), fx + nx * 5, fz + nz * 5, cx, cz))
                R.check('%s %s 走近以後室內有顯示（on、built）' % (tag, pid), bool(st.get('on')) and bool(st.get('built')), J(st))
            if MID:   # BB-B 12:36：路中間主鏡頭兩邊各一張（不藏人）
                for side_, cy_ in (('south_sunnyside', 0.0), ('north_lin', math.pi)):
                    await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); P.rotation.y=a.cy+Math.PI; const C=GAME.E.cam; C.yaw=a.cy; C.manualT=30; })", {'x': MID_X, 'z': MID_Z, 'cy': cy_})
                    await pg.wait_for_timeout(int(WAIT_S * 1000))
                    st_ = await pg.evaluate(REAL)
                    await pg.screenshot(path=os.path.join(OUT, 'wz_%s_mid_%s.png' % (ht, side_)))
                    R.note('%s 路中間 (%.1f, %.1f) 主鏡頭看%s：wz_%s_mid_%s.png；那時 shopReal %s' % (tag, MID_X, MID_Z, '南（SUNNY SIDE）' if cy_ == 0 else '北（林家乾麵）', ht, side_, J([{k: q.get(k) for k in ('id', 'built', 'on')} for q in st_.get('shops', [])])))
            if 'wz_brunch' in SHOPS:
                ex = await pg.evaluate(EXIT, 'wz_brunch'); bs = rec['shops'].get('wz_brunch', {}).get('shop')
                if ex and bs:
                    _, _, nx, nz, _, _ = front(bs)
                    await snap(pg, 'wz_%s_sunny_door_street.jpg' % ht, [ex['x'] + nx * 4, 1.6, ex['z'] + nz * 4], [ex['x'], 1.2, ex['z']])
                R.note('%s SUNNY SIDE 街上的門（exit.to＝wz_brunch）：%s' % (tag, J(ex))); rec['sunnyDoorStreet'] = ex
            for pid in SHOPS:
                sh = rec['shops'].get(pid, {}).get('shop')
                await pg.goto(URL); await L.wait_loaded(pg)
                s2 = await D.load_zone(pg, cdp, pid, DAY, h, wait=7000)
                R.setup('%s %s【前置／捷徑】讀檔進店（區域出生點）' % (tag, pid))
                if s2['zone'] != pid: R.note('%s %s 讀不進去（%s）——可能沒開，跳過' % (tag, pid, J(s2))); continue
                await pg.screenshot(path=os.path.join(OUT, 'wz_%s_%s_inside_game.png' % (ht, pid)))
                ex = await pg.evaluate(EXIT, 'wenzhou')
                cam = await pg.evaluate("(()=>{ const c=GAME.E.camera, p=new THREE.Vector3(), d=new THREE.Vector3(); c.getWorldPosition(p); c.getWorldDirection(d); return {x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),dir:[+d.x.toFixed(2),+d.y.toFixed(2),+d.z.toFixed(2)]}; })()")
                R.note('%s %s 進門：遊戲鏡頭 %s；門（exit.to＝wenzhou）%s' % (tag, pid, J(cam), J(ex)))
                if ex:
                    # 「走進去同方向」：店內座標不一定和街上一樣，方向用「門 → 遊戲鏡頭看的方向」：站在門口往裡 1 m、照遊戲鏡頭的水平方向看
                    dx, dz = cam['dir'][0], cam['dir'][2]; n = math.hypot(dx, dz) or 1; dx, dz = dx / n, dz / n
                    await snap(pg, 'wz_%s_%s_inside_samedir.jpg' % (ht, pid), [ex['x'] + dx * 1.0, 1.6, ex['z'] + dz * 1.0], [ex['x'] + dx * 6, 1.3, ex['z'] + dz * 6])
                    if pid == 'wz_brunch':
                        await snap(pg, 'wz_%s_sunny_door_inside.jpg' % ht, [ex['x'] + dx * 4, 1.6, ex['z'] + dz * 4], [ex['x'], 1.2, ex['z']]); rec['sunnyDoorInside'] = ex
                rec['shops'].setdefault(pid, {})['inside'] = {'cam': cam, 'door': ex}
            res['hours'][str(h)] = rec
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'wz_real.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
