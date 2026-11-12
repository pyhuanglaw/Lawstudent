"""CC（帳號 A）11-10：舊序章同學自己的 3D 模型（US-LONG-3D-1110；BB 19:31 P0 第 3 項；候選 6ef185726）。Playwright（PC GPU）≠ iPhone。
對照的程式（6ef185726）：src/us_life3d.js S.longModel（manifest char.us_long lazy：第一次要用才下載，下載完以前備用人物藏起來、GM.upgradeModels 換上；
  下載失敗 S._longFail＝true、S.longReveal 把藏起來的人露出來、之後用路人樣子）、specOf（Legal Writing 'lw' 課他在教室：見過他坐你右邊）、
  clubSync（會所：S.longHere 平日 19～22、要 MET_LONG）；character3d.js C.MODEL_PROPS char.us_long＝圓框眼鏡、後背包、奶茶杯鑰匙圈。
CASES：
  CLASS  【前置／捷徑】讀檔到 us_campus 2028-08-25（週五）08:35＋交換旗標＋MET_LONG → 觸控走到「進教室」按 → 進 Room 120（Legal Writing 09:00）
         → 等他出現：在不在（E.npcs usWho='long'）、看得到（自己和子物件 visible）、用的是不是他的模型（ASSETS.has('char.us_long')、wantModel 清掉、有眼鏡）、
         站得住（6 秒內位置不跑、y 在地板／座位高度）；近看一張（拍照鏡頭對他的頭，不改遊戲鏡頭）。
  CLUB   【前置／捷徑】讀檔到 us_outside 2028-10-03（週二）19:30＋交換旗標＋MET_LONG → 觸控走到「會所」按 → 進 3D 會所 → 等他（usClub='long'）同上、近看一張。
  BLOCK=1：整個瀏覽器用 route 把 bl_us_long.vrm 擋掉（abort）→ 上面兩個再跑一次：USL._longFail＝true、他還是在、看得到（不是一直隱形）、
         wantModel 清掉、沒有卡住（玩家還能走、還有互動按鈕）、沒有 JS 例外。
用法：LW_TESTS=<wt>/tests [CASES=CLASS,CLUB] [BLOCK=1] python3 cc_uslong_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CASES = (os.environ.get('CASES') or 'CLASS,CLUB').split(',')
BLOCK = os.environ.get('BLOCK') == '1'
TAG = 'block' if BLOCK else 'ok'
R = L.Run('uslong_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
USF = "({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:STORY.dayOfKey('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:STORY.dayOfKey('2028-06-08'),MET_LONG:true})"
LONG = r"""(sel=>{ const E=GAME.E; const n=(E.npcs||[]).find(q=>q&&(sel==='club'?q.usClub==='long':q.usWho==='long')); if(!n) return {found:false, zone:GAME.G.zone, npcs:(E.npcs||[]).length};
  const o=n.obj, u=o.userData||{}; let vis=!!o.visible, kids=o.children.length, kidsVis=o.children.filter(c=>c.visible).length, glasses=false, vrm=false, head=null; const w=new THREE.Vector3();
  o.updateWorldMatrix(true,true); o.traverse(c=>{ if(/glasses/i.test(c.name||'')) glasses=true; if(c.userData&&c.userData.vrm) vrm=true; if(!head&&c.isBone&&/(^|_)head$/i.test(c.name||'')){ c.getWorldPosition(w); head=[+w.x.toFixed(2),+w.y.toFixed(2),+w.z.toFixed(2)]; } });
  return {found:true, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+o.position.x.toFixed(2), y:+o.position.y.toFixed(2), z:+o.position.z.toFixed(2), ry:+o.rotation.y.toFixed(2), seat:!!n.seat, pose:n.pose,
    vis, kids, kidsVis, wantModel:u.wantModel||null, key:u.key||null, driver:u.driver||null, degradedHidden:!!u.degradedHidden, glasses, head, has:!!(ASSETS.has&&ASSETS.has('char.us_long')), fail:!!(typeof USL!=='undefined'&&USL._longFail)}; })"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||40, c.width/c.height, 0.05, 200); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  r.render(E.scene,cam); return c.toDataURL('image/jpeg',0.85); })"""
ME = "(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), busy:!!P.busy, fb:GAME.walkFallbacks|0}; })()"


async def base(pg, cdp, key, h, zone):
    await D.load_zone(pg, cdp, zone, key, h, wait=6000)
    await pg.evaluate("(f=>{ Object.assign(GAME.G.flags, f); })(%s)" % USF)
    snap = await pg.evaluate("()=>GAME.snapshot()"); await L.load_state(pg, snap, quiet_events=False, quiet_phone=True)
    await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp); await L.phone_away(pg, cdp)
    R.setup('【前置／捷徑】讀檔到 %s %s %.2f＋交換旗標＋MET_LONG（見過舊序章同學）' % (zone, key, h))


async def enter(pg, cdp, tag, pred, want_zone):
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>%s); return it?{label:it.label,x:it.x,z:it.z,r:it.radius||1.2,lv:it.lv|0}:null; })()" % pred)
    if not R.check('%s 有入口（%s）' % (tag, it and it['label']), bool(it), ''): return False
    await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.8), '%s 走到「%s」' % (tag, it['label']), max_s=180, lv=it['lv'])
    await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#interact')
    t0 = time.time()
    while time.time() - t0 < 60:
        s = await L.state(pg)
        if s['choices']:
            o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); R.note('%s 選單 %s → 第一個' % (tag, J(o)))
            await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(800); continue
        if (await pg.evaluate(ME))['zone'] == want_zone: break
        await pg.wait_for_timeout(500)
    me = await pg.evaluate(ME)
    return R.check('%s 進到 %s' % (tag, want_zone), me['zone'] == want_zone, J(me))


async def check_long(pg, cdp, tag, sel):
    t0 = time.time(); st = None; first = None; seen = []
    while time.time() - t0 < 60:
        st = await pg.evaluate("(%s)(%s)" % (LONG, J(sel)))
        if st['found'] and first is None: first = round(time.time() - t0, 1)
        seen.append({k: st.get(k) for k in ('found', 'vis', 'kidsVis', 'wantModel', 'has', 'fail')})
        done = st['found'] and st['kidsVis'] > 0 and (st['fail'] if BLOCK else (st['key'] == 'char.us_long' and st['driver'] == 'vrm'))
        if done: break
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    R.note('%s 舊序章同學（%.1f 秒內）：%s；過程（最後 6 筆）：%s' % (tag, time.time() - t0, J(st), J(seen[-6:])))
    if not R.check('%s 舊序章同學在場（%s 秒找到）' % (tag, first), bool(st and st['found']), J(st)): return None
    if not st['vis']:   # r2：obj.visible＝false 多半是畫面外剔除（engine 每格照遊戲鏡頭設回來；r1 會所他在鏡頭外）→ 走近一點讓他進遊戲鏡頭再看
        me = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; return [P.x,P.z]; })()")
        import math
        dx, dz = me[0] - st['x'], me[1] - st['z']; d = math.hypot(dx, dz) or 1
        await L.go_to(pg, cdp, R, st['x'] + dx / d * 1.8, st['z'] + dz / d * 1.8, 0.6, '%s 走近舊序章同學（讓他進遊戲鏡頭）' % tag, max_s=90)
        await pg.wait_for_timeout(1500); st = await pg.evaluate("(%s)(%s)" % (LONG, J(sel))); R.note('%s 走近以後：%s' % (tag, J(st)))
    R.check('%s 看得到（obj.visible、子物件有露出來，不是一直隱形）' % tag, st['vis'] and st['kidsVis'] > 0 and not st['degradedHidden'], J(st))
    if BLOCK:
        R.check('%s 模型擋掉：USL._longFail＝true、wantModel 清掉、用的不是 char.us_long（退回路人樣子）' % tag, st['fail'] and not st['wantModel'] and st['key'] != 'char.us_long', J(st))
    else:
        R.check('%s 換上他自己的模型（userData.key＝char.us_long、driver vrm；r2：wantModel 是「想要的模型」，換上以後照樣留著，r1 誤當成要清掉）' % tag, st['key'] == 'char.us_long' and st['driver'] == 'vrm', J(st))
        R.note('%s 眼鏡（名字有 glasses 的子物件）：%s' % (tag, st['glasses']))
    ps = []
    for _ in range(6):
        q = await pg.evaluate("(%s)(%s)" % (LONG, J(sel))); ps.append([q.get('x'), q.get('y'), q.get('z')]); await pg.wait_for_timeout(1000)
    dx = max(abs(a[0] - ps[0][0]) + abs(a[2] - ps[0][2]) for a in ps); ys = [a[1] for a in ps]
    R.check('%s 站得住（6 秒位置變化 %.2f m、y %s～%s）' % (tag, dx, min(ys), max(ys)), dx < 0.3 and -0.1 <= min(ys) and max(ys) <= 1.2, J(ps))
    hd = st.get('head')
    if hd:
        import math
        ry = st['ry']; fx, fz = math.sin(ry), math.cos(ry)
        u = await pg.evaluate(SNAP, {'from': [hd[0] + fx * 1.1, hd[1] + 0.05, hd[2] + fz * 1.1], 'at': [hd[0], hd[1] - 0.25, hd[2]], 'fov': 40})
        open(os.path.join(OUT, 'uslong_%s_%s_near.jpg' % (TAG, sel)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
        u = await pg.evaluate(SNAP, {'from': [hd[0] + fx * 2.6, hd[1] + 0.3, hd[2] + fz * 2.6], 'at': [hd[0], hd[1] - 0.6, hd[2]], 'fov': 45})
        open(os.path.join(OUT, 'uslong_%s_%s_body.jpg' % (TAG, sel)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
        R.note('%s 近看 uslong_%s_%s_near.jpg、半身 _body.jpg（正面 1.1／2.6 m，拍照鏡頭）' % (tag, TAG, sel))
    await pg.screenshot(path=os.path.join(OUT, 'uslong_%s_%s_game.jpg' % (TAG, sel)), type='jpeg', quality=75)
    s = await L.state(pg); me = await pg.evaluate(ME)
    R.check('%s 沒有卡住（玩家沒有 busy、沒有對話擋著）' % tag, not me['busy'] and not s['dlg'], J({'me': me, 'dlg': s['dlg']}))
    return st


async def main():
    print('CC 舊序章同學 3D：CASES %s；BLOCK %s；Playwright ≠ iPhone' % (','.join(CASES), BLOCK), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        blocked = []
        if BLOCK:
            async def ab(route):
                blocked.append(route.request.url); await route.abort()
            await ctx.route('**/bl_us_long.vrm*', ab)
            R.setup('【前置／捷徑】route 擋掉 bl_us_long.vrm（模擬下載失敗）')
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for case in CASES:
            tag = '[%s]' % case
            try:
                if case == 'CLASS':
                    await base(pg, cdp, '2028-08-25', 8.58, 'us_campus')
                    if await enter(pg, cdp, tag, 'i.usClass', 'us_classroom'):
                        await pg.wait_for_timeout(3000); await check_long(pg, cdp, tag, 'class')
                if case == 'CLUB':
                    await base(pg, cdp, '2028-10-03', 19.5, 'us_outside')
                    if await enter(pg, cdp, tag, "/會所/.test(i.label||'')", 'us_clubhouse_in'):
                        await pg.wait_for_timeout(3000); await check_long(pg, cdp, tag, 'club')
            except Exception as e:
                R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
        if BLOCK: R.note('擋掉的請求：%s' % J(blocked[:4])); R.check('真的擋到 bl_us_long.vrm', bool(blocked), '')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
