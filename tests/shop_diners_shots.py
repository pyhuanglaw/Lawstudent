"""店裡的客人（SHOP-DINERS-1103）遊戲內截圖。[前置／捷徑] 每一間直接讀檔到店門口（只為了截圖；店裡的客人怎麼排、同一批、空位、上限在 tests/shop_diners_unit.js）。
用法：python3 tests/shop_diners_shots.py http://127.0.0.1:8765/index.html?turbo shots/shop_diners_1103
「修改前」那一張：把 CROWD 店裡客人的地點（spot.shop）先拿掉再讀檔＝修改前的樣子（修改前 crowd3d.js 沒有這些地點）。
每一張記：客人幾位、坐著／站著、姿勢、坐著的人離座位多遠（浮空、沒坐上去）、方向和座位差多少。手機模擬橫向。"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True}
# (標籤, 區域, 日期, 時刻, 修改前?, 鏡頭轉多少（弧度，0＝進門的方向）)
CASES = [
    ('teishoku_1018_1822_before', 'wz_teishoku', '2025-10-18', 18 + 22 / 60, True, 0),
    ('teishoku_1018_1822_after', 'wz_teishoku', '2025-10-18', 18 + 22 / 60, False, 0),
    ('teishoku_1018_1822_after_side', 'wz_teishoku', '2025-10-18', 18 + 22 / 60, False, 0.9),
    ('cafe_1016_1500', 'cafe', '2025-10-16', 15.0, False, 0),
    ('noodle_1015_1230', 'noodle', '2025-10-15', 12.5, False, 0),
    ('cvs_1016_1830', 'cvs', '2025-10-16', 18.5, False, 0),
    ('bookstore_1016_1830', 'bookstore', '2025-10-16', 18.5, False, 0),
    ('l118_korea_1016_1830', 'l118_korea', '2025-10-16', 18.5, False, 0),
    ('l118_cafe2_1016_1500', 'l118_cafe2', '2025-10-16', 15.0, False, 0),
]
INFO = """(()=>{ const E=GAME.E, P=E.player.obj.position; const ns=E.npcs.filter(n=>n.obj&&(n.isExtra||n.crowd)&&!n.clerk);
  return {zone:GAME.G.zone, formal:!!(E.zone&&E.zone.formal), n:ns.length, shop:ns.filter(n=>typeof n.crowd==='string'&&/^shop_/.test(n.crowd)).length,
    cafe:ns.filter(n=>n.cafeCust!=null).length,
    list:ns.map(n=>{ const o=n.obj.position, st=n.seat; return {pose:n.pose, crowd:n.crowd||'', x:+o.x.toFixed(2), y:+o.y.toFixed(3), z:+o.z.toFixed(2),
      seatD:st?+Math.hypot(o.x-st.x,o.z-st.z).toFixed(3):null, seatY:st?+((st.y!=null?st.y:E.heightAt(st.x,st.z,n.lv|0))+(st.lift||0)).toFixed(3):null,
      dyaw:st?+Math.abs(Math.atan2(Math.sin(n.obj.rotation.y-(st.yaw||0)),Math.cos(n.obj.rotation.y-(st.yaw||0)))).toFixed(3):null}; }),
    player:[+P.x.toFixed(2),+P.z.toFixed(2)] }; })()"""
async def main():
    run = L.Run('shop_diners_shots', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}; window.__SHOPSPOTS=CROWD.SPOTS.slice()")
        allinfo = {}
        for label, zone, date, hour, before, turn in CASES:
            d = await pg.evaluate(f"STORY.dayOfKey('{date}')")
            wd = await pg.evaluate(f"CALENDAR.dateOf({d}).wd%7")
            if before: await pg.evaluate("CROWD.SPOTS.splice(0,CROWD.SPOTS.length,...window.__SHOPSPOTS.filter(s=>!s.shop))")
            else: await pg.evaluate("CROWD.SPOTS.splice(0,CROWD.SPOTS.length,...window.__SHOPSPOTS)")
            sp = await pg.evaluate(f"(()=>{{ const z=Z3.ZONES['{zone}']; const s=z.spawn||(z.build&&null); return s?{{x:s.x,z:s.z,yaw:s.yaw||0}}:null; }})()")
            run.setup(f'{label}：讀檔到 {zone}（{date} {int(hour)}:{int(round((hour % 1) * 60)):02d}）' + ('［修改前：拿掉店裡客人的地點］' if before else ''))
            st = {'zone': zone, 'hour': hour, 'day': d, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE}
            if sp: st['pos'] = {'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw']}
            await L.load_state(pg, st, quiet_events=True)
            for _ in range(30):
                if await pg.evaluate("GAME.G.zone===%s&&(!GAME.E.zone||GAME.E.zone.formal!==false)" % json.dumps(zone)): break
                await pg.wait_for_timeout(1000)
            await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
            if turn: await pg.evaluate(f"GAME.E.cam.yaw+={turn}"); await pg.wait_for_timeout(1500)
            info = await pg.evaluate(INFO)
            allinfo[label] = info
            bad = [q for q in info['list'] if q['seatD'] is not None and (q['seatD'] > 0.05 or abs(q['y'] - q['seatY']) > 0.05 or q['dyaw'] > 0.05) and q['pose'] in ('sit', 'read')]
            run.check(f'{label}：客人 {info["shop"]} 位（店的客人）＋Café 客人 {info["cafe"]}；坐著的都在位子上、方向照座位', (info['shop'] + info['cafe'] == 0) if before else (not bad and info['shop'] + info['cafe'] > 0),
                      json.dumps(bad[:3], ensure_ascii=False))
            await run.shot(pg, label)
        await pg.evaluate("CROWD.SPOTS.splice(0,CROWD.SPOTS.length,...window.__SHOPSPOTS)")
        with open(os.path.join(OUT, 'info.json'), 'w', encoding='utf8') as f: json.dump(allinfo, f, ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
