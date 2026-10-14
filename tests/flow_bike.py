"""真實玩家流程：騎腳踏車（src/bike3d.js；使用者「我應該要可以騎腳踏車」、路上的騎士要真的踩踏板）。不用 ?turbo。
[前置／捷徑] 讀檔：第 7 天（9/23 週二）15:00，校園宿舍門口 (21,53)；存檔裡沒有 bike 欄位（＝舊存檔：車在宿舍門口 (25,57.9)）；關掉條件事件（只測騎車）。之後都走真的介面。
A. 走到車旁邊，出現「騎腳踏車」；按下去：上車（姿勢 ride、車掛在玩家底下、右下出現「下車」）。
B. 搖桿往前推：速度＝騎車（5.5 m/s 以上，跑步 4.8）、輪子和曲柄有轉；腳踝到踏板、手腕到把手都 ≤ 5 cm（瀏覽器裡的真實骨架＋車的節點）；截圖（後面、側面）。
C. 騎到校門、按「走出校門」：到了公館還在騎。
D. 騎到便利商店門口、按「進入便利商店」：先下車、車停在門口；出店：門口有車、走過去出現「騎腳踏車」。
E. 上車、往前騎一段、按「下車」：車停在下車的地方、人站在旁邊、「下車」按鈕收起來。
F. 存檔、重新整理、按「繼續」：車還在原地。
全程沒有 JS 例外。
用法：python3 tests/flow_bike.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_bike'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
BIKE_JS = """(()=>{ const P=GAME.E.player, G=GAME.G; const on=P.obj.children.some(o=>o.name==='bike_ride'); const pk=GAME.E.zone.group.children.find(o=>o.name==='bike_ride'); const b=document.getElementById('btnBike');
  return {zone:G.zone, riding:!!P.riding, pose:P.pose, on, parked:pk?[+pk.position.x.toFixed(2),+pk.position.z.toFixed(2)]:null, btn:!!b&&!b.classList.contains('hide'), bike:G.bike||null,
    dbg:(typeof BIKE!=='undefined'&&BIKE.debug())||null, t:GAME.E.time, x:P.obj.position.x, z:P.obj.position.z}; })()"""
FIT_JS = """(()=>{ const h=GAME.E.player.obj, vrm=h.userData.vrm, bk=h.children.find(o=>o.name==='bike_ride'), rd=GAME.E.player.ride; if(!vrm||!bk||!rd) return null; h.updateMatrixWorld(true);
  const R=n=>vrm.humanoid.getRawBoneNode(n), W=b=>b.getWorldPosition(new THREE.Vector3());
  const tl=bk.getObjectByName('pedal_l').localToWorld(new THREE.Vector3(0,0.07,-0.05)), tr=bk.getObjectByName('pedal_r').localToWorld(new THREE.Vector3(0,0.07,-0.05));
  const gl=h.localToWorld(new THREE.Vector3(...rd.grips[0])), gr=h.localToWorld(new THREE.Vector3(...rd.grips[1]));
  return {footL:+W(R('leftFoot')).distanceTo(tl).toFixed(3), footR:+W(R('rightFoot')).distanceTo(tr).toFixed(3), handL:+W(R('leftHand')).distanceTo(gl).toFixed(3), handR:+W(R('rightHand')).distanceTo(gr).toFixed(3)}; })()"""


# 從玩家的位置往 24 個方向看，哪一個方向能一直站得住最遠（導航格，人物半徑 0.35 m）：回傳那個方向 30 m 內最遠的點
OPEN_JS = """(()=>{ const E=GAME.E, P=E.player, x0=P.obj.position.x, z0=P.obj.position.z, lv=P.lv|0; let best=null;
  for(let k=0;k<24;k++){ const a=k/24*Math.PI*2, dx=Math.sin(a), dz=Math.cos(a); let d=0; while(d<30&&E.canStand(x0+dx*(d+0.5),z0+dz*(d+0.5),0.35,lv)) d+=0.5;
    if(!best||d>best.d) best={d,tx:x0+dx*d,tz:z0+dz*d}; } return best; })()"""


async def bike(pg):
    return await pg.evaluate(BIKE_JS)


async def wait_until(pg, js, secs):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): return True
        await pg.wait_for_timeout(1000)
    return False


async def ride_forward(pg, cdp, secs):
    """搖桿往前推 secs 秒（真人按住搖桿）；回傳 (距離, 遊戲裡經過的秒數)"""
    b0 = await bike(pg)
    t0 = time.time()
    while time.time() - t0 < secs:
        await L.joystick(pg, cdp, 0, -45, 1500)
    b1 = await bike(pg)
    return math.hypot(b1['x'] - b0['x'], b1['z'] - b0['z']), b1['t'] - b0['t']


async def main():
    run = L.Run('flow_bike', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 7 天 15:00，校園宿舍門口 (21,53)；存檔沒有 bike（＝舊存檔）；關掉條件事件')
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': 21, 'z': 53, 'yaw': 0, 'lv': 0}, 'flags': BASE_FLAGS}, quiet_events=True)
        ok = await wait_until(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 60)
        s0 = await bike(pg)
        run.check('A 車停在宿舍門口（舊存檔的預設位置 25, 57.9）', ok and s0['parked'] == [25, 57.9], json.dumps(s0['parked']))
        # ---------- A：上車 ----------
        await L.go_to(pg, cdp, run, 24.2, 57.9, 0.9, '腳踏車旁邊')
        s = await L.state(pg)
        run.check('A 走到車旁邊：出現「騎腳踏車」', s['interact'].startswith('騎腳踏車'), s['interact'])
        await L.tap(pg, cdp, '#interact')
        ok = await wait_until(pg, "!!GAME.E.player.riding", 40)
        k = await bike(pg)
        run.check('A 按「騎腳踏車」：上車（姿勢 ride、車掛在玩家底下、停著的車拿掉、出現「下車」）', ok and k['pose'] == 'ride' and k['on'] and not k['parked'] and k['btn'], json.dumps({x: k[x] for x in ('riding', 'pose', 'on', 'parked', 'btn')}))
        await run.shot(pg, 'A_mounted')
        # ---------- B：騎 ----------
        # 鏡頭先轉向最空的方向（像玩家一樣用手指滑鏡頭）：上車時鏡頭對著男一舍的牆，直接推搖桿「往前」會騎去撞牆、2.3 m 就停住（v9.7 回歸第一次跑：1.15 m/s）
        op = await pg.evaluate(OPEN_JS)
        await L.turn_camera_to(pg, cdp, op['tx'], op['tz'])
        d, dt = await ride_forward(pg, cdp, 9)
        k = await bike(pg)
        sp = d / dt if dt > 0 else 0
        run.check('B 搖桿往前：騎車速度（5.5 m/s 以上；跑步 4.8）、輪子和曲柄有轉', sp >= 5.5 and k['dbg'] and k['dbg']['wheel'] > 1 and k['dbg']['crank'] > 0.4, f'{d:.1f} m / {dt:.2f} s = {sp:.2f} m/s；{json.dumps(k["dbg"])}')
        fit = await pg.evaluate(FIT_JS)
        run.check('B 腳踝在踏板上、手腕在把手上（≤ 5 cm，瀏覽器裡的真實骨架和車的節點）', bool(fit) and max(fit.values()) <= 0.05, json.dumps(fit))
        await run.shot(pg, 'B_riding_back')
        await L.drag(pg, cdp, 200, 200, 420, 200, steps=12); await pg.wait_for_timeout(2500)
        await run.shot(pg, 'B_riding_side')
        # ---------- C：騎出校門 ----------
        # 校門的出口互動點照遊戲裡的位置（zones3d.js：(-126,0)、範圍 3 m）；原本寫死走到 (-122.5,0)，離出口 3.5 m，「走出校門」不會出現（v9.7 回歸第一次跑）
        gate = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='gongguan'); return i&&{x:i.x,z:i.z,r:i.radius||1.8}; })()")
        await L.go_to(pg, cdp, run, gate['x'], gate['z'], min(2.5, gate['r'] - 0.4), '校門')
        s = await L.state(pg)
        run.check('C 騎到校門：出現「走出校門」、還在騎', s['interact'].startswith('走出校門') and s['pose'] == 'ride', f"{s['interact']} {s['pose']}")
        await L.tap(pg, cdp, '#interact')
        ok = await wait_until(pg, "GAME.G.zone==='gongguan'", 60); await pg.wait_for_timeout(3000)
        k = await bike(pg)
        run.check('C 到了公館還在騎（車跟著過來、存檔的區域＝公館）', ok and k['riding'] and k['on'] and k['bike'] and k['bike']['zone'] == 'gongguan' and k['btn'], json.dumps({x: k[x] for x in ('zone', 'riding', 'on', 'btn')}))
        await run.shot(pg, 'C_gongguan')
        # ---------- D：騎到便利商店、進店 ----------
        door = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='cvs'); return i&&{x:i.x,z:i.z}; })()")
        await L.go_to(pg, cdp, run, door['x'], door['z'], 1.5, '便利商店門口')
        s = await L.state(pg)
        run.check('D 騎到便利商店門口：出現「進入便利商店」', s['interact'].startswith('進入便利商店'), s['interact'])
        await L.tap(pg, cdp, '#interact')
        ok = await wait_until(pg, "GAME.G.zone==='cvs'", 60); await pg.wait_for_timeout(2000)
        k = await bike(pg)
        bz = k['bike'] or {}
        run.check('D 進店：先下車（店裡沒有車）、車停在公館的門口（離門 3 m 內）', ok and not k['riding'] and not k['on'] and bz.get('zone') == 'gongguan' and math.hypot(bz.get('x', 99) - door['x'], bz.get('z', 99) - door['z']) < 3, json.dumps(bz))
        out = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='gongguan'); return i&&{x:i.x,z:i.z}; })()")
        await L.go_to(pg, cdp, run, out['x'], out['z'], 1.2, '店門')
        await L.tap(pg, cdp, '#interact')
        ok = await wait_until(pg, "GAME.G.zone==='gongguan'", 60)
        ok2 = await wait_until(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 30)
        k = await bike(pg)
        run.check('D 出店：車停在門口', ok and ok2 and k['parked'] and math.hypot(k['parked'][0] - bz['x'], k['parked'][1] - bz['z']) < 0.01, json.dumps(k['parked']))
        await L.go_to(pg, cdp, run, k['parked'][0] - 0.8, k['parked'][1], 0.9, '腳踏車旁邊')
        s = await L.state(pg)
        run.check('D 走到車旁邊：出現「騎腳踏車」', s['interact'].startswith('騎腳踏車'), s['interact'])
        await run.shot(pg, 'D_parked_at_shop')
        # ---------- E：上車、騎、下車 ----------
        await L.tap(pg, cdp, '#interact')
        ok = await wait_until(pg, "!!GAME.E.player.riding", 40)
        await ride_forward(pg, cdp, 4)
        k0 = await bike(pg)
        await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(1500)
        k = await bike(pg)
        stand = math.hypot(k['x'] - k0['x'], k['z'] - k0['z'])
        run.check('E 按「下車」：車停在下車的地方、人往旁邊讓開、「下車」按鈕收起來', ok and not k['riding'] and k['parked'] and math.hypot(k['parked'][0] - k0['x'], k['parked'][1] - k0['z']) < 0.3 and 0.3 < stand < 1.0 and not k['btn'] and k['pose'] != 'ride', json.dumps({'parked': k['parked'], 'stand': round(stand, 2), 'btn': k['btn'], 'pose': k['pose']}))
        await run.shot(pg, 'E_dismounted')
        # ---------- F：存檔、讀檔 ----------
        saved = k['bike']
        await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(800)
        await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(5000)
        ok = await wait_until(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 60)
        k = await bike(pg)
        run.check('F 存檔、重新整理、按「繼續」：車還在原地（公館、同一個位置）', ok and k['zone'] == 'gongguan' and k['bike'] and abs(k['bike']['x'] - saved['x']) < 0.01 and abs(k['bike']['z'] - saved['z']) < 0.01 and k['parked'], json.dumps(k['bike']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
