"""點地面移動的落點（有兩層導航的戶外區域：校園的萬才館大樓梯）——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
起因（2026-10-11，真實玩家流程 tests/flow_wancai_stairs.py）：從萬才館大樓梯頂端的平台（校園第 1 層、3.63 m）走下來，點地面 7 次、轉鏡頭 1 次、搖桿 1 次，363 秒。
原因：校園「點得到的地面」（zone.walkMeshes）只有萬才館樓梯、平台、陽台、霖澤館穿堂，沒有一般的地面；站在第 1 層點廣場時，遊戲用玩家那一層的基本高度（3.63 m）的平面算落點，
目的地算在離玩家很近、平台外面走不到的地方。
檢查（點擊是真的 CDP 觸控，落點是遊戲點地面移動自己算的，從 E.onTapGround 讀出來）：
  1. 站在平台上、面向廣場：點畫面上廣場地面的三個點（大樓梯正前方、偏東、偏西），落點＝那一點（水平 < 0.8 m）、第 0 層、高度 0。
  2. 只點一下就走得下去：點大樓梯正前方的廣場，人物沿著大樓梯走到那一點（第 0 層、高度 0、< 0.6 m），中間不再點、不推搖桿。
  3. 站在廣場上（第 0 層）：點廣場地面、點大樓梯中段，落點照舊（地面＝第 0 層 y 0；樓梯＝樓梯的高度）。
  4. 站在平台上：點陽台，落點在第 1 層、3.63 m。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到平台上／廣場上（存檔的 pos.lv、pos.y），關掉條件事件；鏡頭方向直接設 E.cam.yaw（等於玩家用手指滑動畫面轉鏡頭）；
檢查 1、3、4 每點一下讀完落點就取消那一次的走路（P.path＝null），讓下一個點從同一個位置點。
用法：python3 tests/tap_floor_levels.py http://127.0.0.1:8765/index.html [輸出資料夾]
"""
import asyncio, json, math, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/tap_floor_levels'
HOOK = "(()=>{ const E=GAME.E; if(E.__tapHook) return; const f=E.onTapGround; E.onTapGround=h=>{ window.__lastTap={x:h.x,z:h.z,y:h.y,lv:h.lv|0,t:performance.now()}; if(f) f(h); }; E.__tapHook=true; })()"
# 鏡頭轉向某一點（鏡頭在玩家的 (sin yaw, cos yaw) 那一側，畫面的「前」＝(-sin yaw,-cos yaw)），等幾格讓鏡頭跟上
FACE = """(async([tx,tz])=>{ const E=GAME.E, o=E.player.obj.position; E.cam.yaw=Math.atan2(-(tx-o.x),-(tz-o.z)); E.cam.manualT=2;
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+8;i++) await new Promise(r=>setTimeout(r,250)); })"""
# 世界座標 → 螢幕（那一層的高度）；要在畫面上、而且那裡是遊戲畫面（不是按鈕）
PROJ = """(([x,z,lv])=>{ const E=GAME.E; const y=E.heightAt?E.heightAt(x,z,lv):0; const v=new THREE.Vector3(x,y,z).project(E.camera); if(v.z>1) return null;
    const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight; if(sx<10||sy<10||sx>innerWidth-10||sy>innerHeight-10) return {off:true,sx,sy};
    const el=document.elementFromPoint(sx,sy); return {sx,sy,y,canvas:!!el&&el.id==='c'}; })"""
POS = "(()=>{ const P=GAME.E.player, o=P.obj.position; return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),y:+o.y.toFixed(2),lv:P.lv|0,path:!!P.path}; })()"


async def tap_point(pg, cdp, run, label, x, z, lv, want_lv, want_y=None, cancel=True):
    pr = await pg.evaluate(PROJ + '(%s)' % json.dumps([x, z, lv]))
    if not pr or pr.get('off') or not pr.get('canvas'):
        return run.check(label + '：那一點在畫面上', False, json.dumps(pr))
    await pg.evaluate("window.__lastTap=null")
    await PL.touch_tap(cdp, pr['sx'], pr['sy'])
    t = None
    for _ in range(40):
        t = await pg.evaluate("window.__lastTap")
        if t: break
        await pg.wait_for_timeout(250)
    if cancel: await pg.evaluate("(()=>{ const P=GAME.E.player; P.path=null; P.target=null; P.onArrive=null; })()")
    if not t: return run.check(label + '：點下去有反應（遊戲算出落點）', False)
    d = math.hypot(t['x'] - x, t['z'] - z)
    ok = d < 0.8 and t['lv'] == want_lv and (want_y is None or abs(t['y'] - want_y) < 0.35)
    return run.check(label, ok, '目標 (%.2f,%.2f,第%d層) 落點 (%.2f,%.2f,第%d層,y %.2f) 差 %.2f m' % (x, z, want_lv, t['x'], t['z'], t['lv'], t['y'], d))


async def main():
    run = PL.Run('tap_floor_levels', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await PL.wait_loaded(pg))
        # ---- 站在平台上 ----
        run.setup('讀檔：法學院廣場、萬才館大樓梯頂端的平台 (87,-99.3)、第 1 層、3.63 m，10:00，關掉條件事件')
        await PL.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'pos': {'x': 87, 'z': -99.3, 'yaw': 0, 'lv': 1, 'y': 3.63}}, quiet_events=True)
        await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
        s = await pg.evaluate(POS); run.check('在平台上（第 1 層、3.63 m）', s['lv'] == 1 and abs(s['y'] - 3.63) < 0.05, json.dumps(s))
        run.setup('鏡頭轉向廣場（E.cam.yaw）')
        await pg.evaluate(FACE + '([87,-86])')
        await run.shot(pg, 'platform_facing_plaza')
        for lab, x, z in (('大樓梯正前方', 87, -86.5), ('偏東（弧形陽台前）', 93, -88), ('偏西（弧形量體前）', 81, -88)):
            await tap_point(pg, cdp, run, '站在平台上點廣場地面（%s）：落點是點到的地面、第 0 層' % lab, x, z, 0, 0, 0.0)
        run.setup('鏡頭轉向陽台')
        await pg.evaluate(FACE + '([93.5,-100.6])')
        await tap_point(pg, cdp, run, '站在平台上點陽台：落點在第 1 層、3.63 m', 93.5, -100.6, 1, 1, 3.63)
        # ---- 只點一下走下大樓梯 ----
        await pg.evaluate("(()=>{ const P=GAME.E.player; P.path=null; })()")
        await pg.evaluate(FACE + '([87,-86])')
        s0 = await pg.evaluate(POS); run.check('還在平台上', s0['lv'] == 1 and abs(s0['y'] - 3.63) < 0.05, json.dumps(s0))
        t0 = time.time()
        ok = await tap_point(pg, cdp, run, '點一下大樓梯正前方的廣場：落點在第 0 層', 87, -86.5, 0, 0, 0.0, cancel=False)
        mids = 0; last = None
        while ok and time.time() - t0 < 300:
            s = await pg.evaluate(POS)
            if 0.5 < s['y'] < 3.1: mids += 1
            if not s['path']: last = s; break
            await pg.wait_for_timeout(1000)
        last = last or await pg.evaluate(POS)
        await run.shot(pg, 'after_one_tap')
        d = math.hypot(last['x'] - 87, last['z'] + 86.5)
        run.check('只點一下就沿著大樓梯走到廣場（第 0 層、高度 0、< 0.6 m）', ok and last['lv'] == 0 and abs(last['y']) < 0.05 and d < 0.6 and mids > 0,
                  '%s；離目標 %.2f m；樓梯中段取樣 %d 次；%.0f 秒' % (json.dumps(last), d, mids, time.time() - t0))
        # ---- 站在廣場上 ----
        run.setup('讀檔：法學院廣場 (87,-84)、第 0 層，10:00')
        await PL.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 6, 'pos': {'x': 87, 'z': -84, 'yaw': 3.1416}}, quiet_events=True)
        await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
        await pg.evaluate(FACE + '([87,-95])')
        await run.shot(pg, 'plaza_facing_stairs')
        await tap_point(pg, cdp, run, '站在廣場上點廣場地面：落點照舊（第 0 層、高度 0）', 90.5, -87.5, 0, 0, 0.0)
        h = await pg.evaluate("GAME.E.heightAt(87,-93.5,0)")
        await tap_point(pg, cdp, run, '站在廣場上點大樓梯中段：落點在樓梯上（高度 %.2f m）' % h, 87, -93.5, 0, 0, h)
        run.check('沒有 JS 例外', not errs, '; '.join(errs[:3]))
        await b.close()
    sys.exit(run.finish())


asyncio.run(main())
