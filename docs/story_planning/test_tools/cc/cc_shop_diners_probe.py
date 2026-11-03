"""CC（帳號 A）11-03：SHOP-DINERS-1103（X187，9950721c4）店裡的客人：BB 13:53 要的三樣證據。
① 每一間（CROWD.SHOPS，17 間）× 每個時段（12:30、15:00、18:30、22:45）：客人數、空位數（CROWD.shopFree）、
   留給玩家的兩人座（shopPlan.keep 那一組）有沒有空著、一間 ≤ 10 人（CROWD.SHOP_CAP）、打烊（不在 shopWindows）＝0 人。
   吃飯的店（kind 不是 stand）尖峰比例只記錄（四到六成交給 BB 判），不判 PASS／FAIL。
② 每一間尖峰時段一張截圖（鏡頭拉近）；坐著的客人離座位 ≤ 0.05 m、高度差 ≤ 0.05 m（沒浮空、沒穿進桌子）；
   書店、便利商店、影印店（站著的那幾組）的客人不是坐姿。
③ 同一時段讀檔兩次：出現的是同一批人（crowd 組＋模型 spec 的集合一樣）。
【前置／捷徑】每一間直接讀檔到店裡（照 tests/shop_diners_shots.py 的做法），不是從街上走進去；只為了看客人，不是玩家流程。
用法：LW_TESTS=<wt>/tests [SHOPS=cafe,noodle] [HOURS=12.5,15,18.5,22.75] python3 cc_shop_diners_probe.py '<URL>/index.html?turbo' <out>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
SHOPS = [s for s in os.environ.get('SHOPS', '').split(',') if s]
HOURS = [float(h) for h in os.environ.get('HOURS', '12.5,15,18.5,22.75').split(',')]
DATE = os.environ.get('DATE', '2025-10-15')   # 週三（開學後、不是假日）
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True}
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''), flush=True)
    if not ok: fails.append(name)

INFO = """(()=>{ const E=GAME.E, G=GAME.G, C=CROWD, def=C.SHOP_ZONES[G.zone]; if(!def) return {err:'no shop def '+G.zone};
  const h=G.hour, wins=C.shopWindows(def,G), open=wins.some(([a,b])=>h>=a&&h<b), plan=C.shopPlan(def,G);
  const keepU=plan.keep>=0?def.units[plan.keep]:null, seats=(E.zone&&E.zone.seats)||[];
  const cust=E.npcs.filter(n=>n&&n.obj&&typeof n.crowd==='string'&&n.crowd.indexOf('shop_'+G.zone+'_')===0&&!n.leaving);
  const near=(a,b)=>a&&b&&Math.hypot(a.x-b.x,a.z-b.z)<0.3;
  const keepBusy=keepU&&keepU.seats?keepU.seats.filter(s=>E.npcs.some(n=>n&&(near(n.seat,s)||near(n.seatTarget,s)))).length:0;
  const standUnits=def.units.map((u,i)=>u.stand?i:-1).filter(i=>i>=0);
  return {zone:G.zone, kind:def.kind, hour:h, open, wins, cap:C.SHOP_CAP, seats:seats.length, free:C.shopFree(E), need:C.shopNeed(E), count:C.shopCount(E,G.zone),
    keep:plan.keep, keepSeats:keepU&&keepU.seats?keepU.seats.length:0, keepBusy,
    cust:cust.map(n=>{ const o=n.obj.position, st=n.seat, ui=+String(n.crowd).split('_').pop();
      return {crowd:n.crowd, spec:n.spec!=null?n.spec:(n.char3d&&n.char3d.spec)||null, key:n.key||n.ckey||null, pose:n.pose, stand:standUnits.includes(ui),
        seatD:st?+Math.hypot(o.x-st.x,o.z-st.z).toFixed(3):null,
        dy:st?+(o.y-((st.y!=null?st.y:E.heightAt(st.x,st.z,n.lv|0))+(st.lift||0))).toFixed(3):null}; }) }; })()"""

async def load(pg, cdp, zone, d, wd, hour):
    sp = await pg.evaluate(f"(()=>{{ const z=Z3.ZONES['{zone}']; const s=z&&z.spawn; return s?{{x:s.x,z:s.z,yaw:s.yaw||0}}:null; }})()")
    st = {'zone': zone, 'hour': hour, 'day': d, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE}
    if sp: st['pos'] = {'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw']}
    await L.load_state(pg, st, quiet_events=True)
    for _ in range(30):
        if await pg.evaluate("GAME.G.zone===%s&&(!GAME.E.zone||GAME.E.zone.formal!==false)" % json.dumps(zone)): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    return await pg.evaluate(INFO)

async def main():
    os.makedirs(OUT, exist_ok=True); allinfo = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        zones = await pg.evaluate("CROWD.SHOPS.map(d=>d.zone)")
        print('店（CROWD.SHOPS）：', json.dumps(zones, ensure_ascii=False), flush=True)
        check('CROWD.SHOPS 有 17 間', len(zones) == 17, str(len(zones)))
        if SHOPS: zones = [z for z in zones if z in SHOPS]
        d = await pg.evaluate(f"STORY.dayOfKey('{DATE}')"); wd = await pg.evaluate(f"CALENDAR.dateOf({d}).wd%7")
        print(f'【前置／捷徑】每一間直接讀檔到店裡：{DATE}（day {d}、週{wd}），時段 {HOURS}', flush=True)
        for z in zones:
            peak = None
            for h in HOURS:
                i = await load(pg, cdp, z, d, wd, h)
                tag = f'{z} {int(h)}:{int(round(h % 1 * 60)):02d}'
                allinfo[tag] = i
                if 'err' in i: check(f'{tag}：讀得到店的資料', False, i['err']); continue
                n = i['count']; seated = [c for c in i['cust'] if c['seatD'] is not None]
                print(f'  {tag}：營業={i["open"]} 客人={n} 位子={i["seats"]} 空位={i["free"]} 留給玩家的兩人座={i["keep"]}（{i["keepBusy"]}/{i["keepSeats"]} 有人）'
                      + (f' 比例={len(seated) / i["seats"]:.0%}' if i['seats'] else ''), flush=True)
                if not i['open']:
                    check(f'{tag}：打烊＝沒有客人', n == 0, str(n)); continue
                check(f'{tag}：一間 ≤ {i["cap"]} 人', n <= i['cap'], str(n))
                if i['seats']:
                    check(f'{tag}：空位 ≥ {i["need"]}（玩家還沒坐：自己＋一起來的人）', i['free'] >= i['need'], f'free={i["free"]} need={i["need"]}')
                if i['keep'] >= 0:
                    check(f'{tag}：留給玩家的兩人座沒人坐', i['keepBusy'] == 0, f'{i["keepBusy"]}/{i["keepSeats"]}')
                bad = [c for c in seated if c['pose'] in ('sit', 'read', 'eat') and (c['seatD'] > 0.05 or abs(c['dy']) > 0.05)]
                check(f'{tag}：坐著的客人都在位子上（≤0.05 m，沒浮空、沒穿進桌子）', not bad, json.dumps(bad[:3], ensure_ascii=False))
                badst = [c for c in i['cust'] if c['stand'] and c['pose'] == 'sit']
                check(f'{tag}：站著的那幾組（書店、便利商店、影印店等）沒有坐姿', not badst, json.dumps(badst[:3], ensure_ascii=False))
                if peak is None or n > peak[1]: peak = (h, n)
            if peak and peak[1] > 0:
                h = peak[0]; tag = f'{z} {int(h)}:{int(round(h % 1 * 60)):02d}'
                a = await load(pg, cdp, z, d, wd, h)
                await pg.evaluate("(()=>{ const c=GAME.E.cam; if(c&&c.dist!=null) c.dist=Math.max(2.2,c.dist*0.6); })()"); await pg.wait_for_timeout(1500)
                await pg.screenshot(path=os.path.join(OUT, f'{z}_{int(h * 100)}.png'))
                bset = await load(pg, cdp, z, d, wd, h)
                sig = lambda i: sorted(f"{c['crowd']}#{c['spec']}" for c in i.get('cust', []))
                check(f'{tag}：同一時段讀檔兩次＝同一批人', sig(a) == sig(bset), json.dumps([sig(a), sig(bset)], ensure_ascii=False)[:300])
            else:
                print(f'  {z}：這幾個時段都沒有客人，沒有截圖', flush=True)
        with open(os.path.join(OUT, 'diners.json'), 'w', encoding='utf8') as f: json.dump(allinfo, f, ensure_ascii=False, indent=1)
        check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED %d: %s' % (len(fails), ', '.join(fails[:6])), flush=True)
    sys.exit(1 if fails else 0)
asyncio.run(main())
