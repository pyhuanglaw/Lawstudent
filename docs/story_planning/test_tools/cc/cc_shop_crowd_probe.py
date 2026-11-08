"""CC-C（帳號 C）11-05：SHOP_CROWD（BB-C 08:15 第 1 點；SHOP-CROWD-NEW-1105 c474bdbab）——新店有客人。V21R 最終 SHA 83d09d13b。
  店：日常失速 wz_offbeat、木曜日 wz_mokuyobi、同弦 xs_tongxian、南洋大廳 xs_nanyang、山嵐 xs_shanlan、大口 xs_dakou、大步 xs_dabu、好拍 xs_haopai、運動廣場 xs_xsports。
  每一間（營業中、PLACES.isOpen 挑兩個時間：開店後 2 小時、晚上）讀檔進店，等 6 秒：
    ① 客人坐得好好的：坐著的人在座位上（n.seat 和人的位置 0.15 m 內、高度＝那一層地板＋座位高度 ±0.15）；
    ② 沒有站在牆裡或桌上：站著／走路的人那一點站得住（E.canStand 0.2 m）、高度＝那一層地板 ±0.15；
    ③ 不擋玩家走路：從店門走得到每一張空的玩家座位的走近點（E.simWalk）、走得到店門；
    ④ 不搶玩家的座位：客人坐的位子＝那一張玩家座位的按鈕就藏起來（nearestInteractable 不給）；玩家點一張空椅子走過去的這幾秒，沒有客人搶先坐上去（照玩家點椅子＋起身，D.sit_all 抽 2 張）。
  只擋 D141 五種；截圖（全景、斜上方）給 BB 看。
  【前置／捷徑】讀檔指定時間（條件事件關閉）。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [ONLY=xs_dakou,wz_offbeat] python3 cc_shop_crowd_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
ONLY = [x for x in (os.environ.get('ONLY') or '').split(',') if x]
R = L.Run('shop_crowd', OUT); D.setup(R, OUT)
DAY = '2025-10-18'
SHOPS = ['wz_offbeat', 'wz_mokuyobi', 'xs_tongxian', 'xs_nanyang', 'xs_shanlan', 'xs_dakou', 'xs_dabu', 'xs_haopai', 'xs_xsports']
OPEN_AT = r"""((a)=>{ const [z,day,mode]=a; const ok=h=>{ try{ return typeof PLACES==='undefined'||!PLACES.isOpen||!!PLACES.isOpen(z,h,day); }catch(e){ return true; } };
  if(mode==='early'){ for(let h=7;h<24;h+=0.5) if(ok(h)&&ok(h+2)) return h+1; return null; } for(let h=23;h>=12;h-=0.5) if(ok(h)&&ok(h-0.5)) return h-0.5; return null; })"""
CROWD = r"""(()=>{ const E=GAME.E, P=E.player, out=[]; const lvY=lv=>{ const z=E.zone, Lg=z&&z.levelGroups; return Lg&&Lg[lv]?(Lg[lv].y||0):0; };
  for(const n of (E.npcs||[])){ if(!n||!n.obj||n.hidden) continue; const p=n.obj.position, lv=n.lv|0;
    out.push({id:n.charId||n.id||null, name:n.name||'', x:+p.x.toFixed(2), z:+p.z.toFixed(2), y:+p.y.toFixed(2), lv, floor:+lvY(lv).toFixed(2), pose:n.pose||null, beh:n.beh||null, vis:n.obj.visible!==false,
      seat:n.seat?{x:+n.seat.x.toFixed(2), z:+n.seat.z.toFixed(2), y:n.seat.y==null?null:+(+n.seat.y).toFixed(2), lift:n.seat.lift||0}:null, target:n.seatTarget?[+n.seatTarget.x.toFixed(2),+n.seatTarget.z.toFixed(2)]:null,
      stand:E.canStand?!!E.canStand(p.x,p.z,0.2,lv):null, staff:!!(n.staff||n.clerk), named:!!(n.charId&&typeof CHARACTERS!=='undefined'&&CHARACTERS[n.charId])}); }
  const seats=E.interactables.filter(i=>i.seat).map(i=>({x:+i.seat.x.toFixed(2), z:+i.seat.z.toFixed(2), lv:i.seat.lv|0, hidden:!!i.hidden, ap:GAME.seatApproach?GAME.seatApproach(i.seat):null, label:i.label}));
  const ex=E.interactables.find(i=>i.exit&&!i.hidden); return {npcs:out, seats, exit:ex?{x:ex.x,z:ex.z,r:ex.radius||1,lv:ex.lv|0,label:ex.label}:null, player:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)], hour:+GAME.G.hour.toFixed(2)}; })()"""
REACH = r"""((q)=>{ const E=GAME.E, P=E.player.obj.position, lv0=E.player.lv|0; const out=[]; for(const t of q.targets){ let ok=null; try{ const r=E.simWalk(P.x,P.z,t[0],t[1],{lv0,lv1:t[2]|0,dt:1/15}); ok=!!(r&&r.ok); }catch(e){ ok='ERR '+e; } out.push([t[0],t[1],t[2]|0,ok]); } return out; })"""
NEAR_FREE = r"""((s)=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return it&&it.seat?[+it.seat.x.toFixed(2),+it.seat.z.toFixed(2)]:null; })"""


async def check_shop(pg, cdp, zone, mode):
    day = await pg.evaluate("(k=>{ for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })('%s')" % DAY)
    h = await pg.evaluate(OPEN_AT, [zone, day, mode])
    tag = '[%s %s]' % (zone, '白天' if mode == 'early' else '晚上')
    if h is None: R.note('%s %s 沒有開的時間，不測' % (tag, DAY)); return
    R.setup('%s 讀檔店裡（出生點）%s %.2f' % (tag, DAY, h))
    s = await D.load_zone(pg, cdp, zone, DAY, h, wait=6000)
    if not R.check('%s 讀到店裡' % tag, s['zone'] == zone, J(s)): return
    for _ in range(12):
        q = await D.st(pg)
        if not q['dlg'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    c = await pg.evaluate(CROWD)
    cust = [n for n in c['npcs'] if not n['staff']]
    R.note('%s %.2f 店裡的人 %d（客人 %d）：%s' % (tag, c['hour'], len(c['npcs']), len(cust), J(c['npcs'])))
    R.check('%s 有客人' % tag, len(cust) > 0, J(len(cust)))
    bad_sit, bad_stand = [], []
    for n in c['npcs']:
        if n['seat']:
            fy = n['floor'] + (n['seat']['lift'] or 0) if n['seat']['y'] is None else n['seat']['y'] + (n['seat']['lift'] or 0)
            d = math.hypot(n['x'] - n['seat']['x'], n['z'] - n['seat']['z'])
            if d > 0.15 or abs(n['y'] - fy) > 0.15: bad_sit.append([n['name'] or n['id'], n['x'], n['z'], n['y'], n['seat'], round(d, 2), fy])
        else:
            if n.get('staff'): continue   # CC-B 11-07 14:2x：櫃檯後面的店員（clerk：南洋 S.ALT、大口 dakouClerk，SHOP-STAFF-1107）本來就站在櫃檯的阻擋格裡，不算客人（BB-B 14:10 SHOP_CROWD c／d＝TEST_BUG）
            if n['stand'] is False or abs(n['y'] - n['floor']) > 0.15: bad_stand.append([n['name'] or n['id'], n['x'], n['z'], n['y'], n['lv'], n['floor'], n['pose']])
    R.check('%s ① 坐著的人都在座位上（0.15 m、高度 ±0.15）' % tag, not bad_sit, J(bad_sit))
    R.check('%s ② 站著／走路的人站得住、在地板上（不在牆裡、桌上）' % tag, not bad_stand, J(bad_stand))
    # ③ 不擋路：從出生點（店門）走得到每一張空的玩家座位走近點、走得到店門
    occ = lambda st: any(n['seat'] and abs(n['seat']['x'] - st['x']) < 0.35 and abs(n['seat']['z'] - st['z']) < 0.35 for n in c['npcs'])
    free = [st for st in c['seats'] if not st['hidden'] and not occ(st) and st['ap']]
    targets = [[st['ap'][0], st['ap'][1], st['lv']] for st in free]
    if c['exit']:
        t = await D.standable_near(pg, c['exit']['x'], c['exit']['z'], c['exit']['r'] * 0.6, c['exit']['lv'])
        if t: targets.append([t['x'], t['z'], c['exit']['lv']])
    rr = await pg.evaluate(REACH, {'targets': targets})
    no = [x for x in rr if x[3] is not True]
    R.check('%s ③ 從店門走得到每一張空座位（%d 張）的走近點和店門（E.simWalk）' % (tag, len(free)), not no, J(no))
    # ④ 客人坐的位子：玩家那一張的按鈕不給（站在走近點，最近的「坐下」不是那一張）
    taken = [st for st in c['seats'] if occ(st) and st['ap']]
    steal = []
    for st in taken[:3]:
        await pg.evaluate("((a)=>{ GAME.E.placeAt(GAME.E.player,a[0],a[1],a[2]); })", [st['ap'][0], st['ap'][1], st['lv']]); await pg.wait_for_timeout(700)
        ni = await pg.evaluate(NEAR_FREE, None)
        if ni and abs(ni[0] - st['x']) < 0.01 and abs(ni[1] - st['z']) < 0.01: steal.append([st, ni])
    if taken: R.setup('%s ④ 【捷徑】站到客人坐的 %d 張的走近點（placeAt）看按鈕' % (tag, min(3, len(taken))))
    R.check('%s ④ 客人坐的位子，玩家那一張不給坐（按鈕藏起來）' % tag, not steal, J(steal))
    await D.user_shot(pg, cdp, 'crowd_%s_%s' % (zone, mode), {'eye': [c['player'][0], 5.5, c['player'][1] + 1.0], 'look': [0, 0.8, 0], 'lens': 18})
    if mode == 'early' and free:
        R.setup('%s ④ 讀檔回 %.2f，照玩家點 2 張空椅子坐下、起身（走過去的時候客人沒有搶先坐上去）' % (tag, h))
        await D.load_zone(pg, cdp, zone, DAY, h, wait=5000)
        pick = [(st['x'], st['z']) for st in free[:2]]
        res = await D.sit_all(pg, cdp, tag + ' 點椅子', 'crowd_sit_%s' % zone, max_walk=150, only=pick)
        R.note('%s 點椅子 2 張：%s' % (tag, J(res)))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC SHOP_CROWD（新店的客人）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        have = await pg.evaluate("Object.keys(Z3.ZONES)")
        for z in SHOPS:
            if ONLY and z not in ONLY: continue
            if not R.check('這一版有 %s' % z, z in have): continue
            for mode in ('early', 'late'):
                print('== %s %s' % (z, mode), flush=True)
                try: await check_shop(pg, cdp, z, mode)
                except Exception as ex: R.check('[%s %s] 探針沒有例外' % (z, mode), False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
