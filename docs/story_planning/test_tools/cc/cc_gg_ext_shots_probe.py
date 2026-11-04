"""CC（帳號 A）11-04：GG_ext——公館兩批共八間店的外觀＋機車讓位（LAWWW b85e1afc1；相關 fb5d7f367、e0ac7c9c9、b85e1afc1）。
  第一批（fb5d7f367，AA_647）：青木茶室（門 −52.8）、頁間書屋（−36.4，e0ac7c9c9 機車讓位）、日和便利店（−29.4）、慢輪單車（−0.3）。
  第二批（b85e1afc1，AA_650）：洋洋鹹酥雞 G05（−10.6）、afar café G07（7.93）、轉角唱片 G12（53.97）、Daybreak G14（70.94）——店門互動點等室內，這一版沒有互動點：門口照 zones3d.js 機車的 DOORS（z＝21＝FZ+2）。
  每一間：
    A 白天：【前置／捷徑】讀檔到公館馬路上、店門正前方 (門x, 2)、2025-09-23（二）14:00、條件事件關閉。
       → 真的走到人行道上的拍照點（門前約 8.5 m）→ 用手指滑鏡頭面向店門 → 截圖 gg_<店>_day.png
       → 真的走到店門口（騎樓、門前 0.4 m）：①走得到 ②第一批互動按鈕是那家店的 → 卡住檢查 → 截圖 gg_<店>_door.png
    B 晚上：【前置／捷徑】讀檔到同一個拍照點、20:00 → 滑鏡頭面向店門 → 截圖 gg_<店>_night.png
  機車讓位（每一間，用遊戲裡的機車物件：正式模型 scooters_* LOD 的網格外框；沒有正式模型時用套件機車 userData.ggScooter）：
    ③ 門口互動點 1.5 m 內沒有機車 ④ 馬路 → 門口那條 1.2 m 寬的通道（門x±0.6、z 16.5～19.3）沒有機車
    ⑤ 門前騎樓走道（門x±2.5）被機車吃掉以後還有 ≥ 1.2 m（柱子內側 19.575 → 店玻璃 21.9）
    ⑥ 單車自動停車的位置（BIKE.parkSpots 公館）沒有停在門前通道上（車身 x±0.3）
  卡住檢查：對話框關掉、GAME.D.busyDepth 0、搖桿推得動 ≥ 0.3 m（四個方向試）、GAME.walkFallbacks 沒有增加、沒有 JS 例外。
用法：LW_TESTS=<wt>/tests [ONLY=afar,daybreak] [NIGHT=0] python3 cc_gg_ext_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
ONLY = [x.strip() for x in (os.environ.get('ONLY') or '').split(',') if x.strip()]
NIGHT = os.environ.get('NIGHT', '1') != '0'
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
DAY, WD = 7, 2          # 2025-09-23（二）：慢輪單車週一公休，選週二
FZ = 19.0               # 店面立面
DOOR_Z = 21.0           # 店門互動點 z（FZ+2）
PILLAR_IN = 19.575      # 騎樓柱子內側（柱子 z 19.3、0.55 見方）
GLASS_Z = 21.9          # 店玻璃前（門口雜物 21.5～21.9）
# slug, 店名, 第幾批, 門 x（zones3d.js 機車 DOORS）, 第一批互動按鈕的字（開頭）
SHOPS = [('aoki_tea', '青木茶室', 1, -52.8, ['買一杯飲料']),
         ('yejian_books', '頁間書屋', 1, -36.4, ['進入頁間書屋']),
         ('hiyori_cvs', '日和便利店', 1, -29.4, ['進入便利商店']),
         ('slowwheel_bike', '慢輪單車', 1, -0.3, ['進入慢輪單車', '慢輪單車']),
         ('yangyang', '洋洋鹹酥雞', 2, -10.6, []),
         ('afar', 'afar café', 2, 7.93, []),
         ('corner_records', '轉角唱片', 2, 53.97, []),
         ('daybreak', 'Daybreak', 2, 70.94, [])]
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{}; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,120),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', fb:GAME.walkFallbacks||0}; })()"""
# 門口互動點：第一批照遊戲的 interactables（字開頭）；第二批找有店名的互動點（室內做好以後），沒有就照 DOORS
DOOR_JS = """(([labels,name,x0])=>{ const its=GAME.E.interactables.filter(i=>!i.hidden&&Math.abs(i.z-21)<1.5&&Math.abs(i.x-x0)<3);
  let it=its.find(i=>labels.some(l=>(i.label||'').startsWith(l)))||its.find(i=>(i.label||'').includes(name));
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label,exit:it.exit?it.exit.to:null}:null; })(%s)"""
SCOOTERS_JS = """(()=>{ const g=GAME.E.zone.group; g.updateMatrixWorld(true); const out=[]; const B=new THREE.Box3();
  g.traverse(o=>{ if(o.isLOD&&/^scooters_/.test(o.name)){ const m=o.levels[0]&&o.levels[0].object; if(m){ B.setFromObject(m); if(!B.isEmpty()) out.push({src:'glb',name:o.name,x0:+B.min.x.toFixed(2),x1:+B.max.x.toFixed(2),z0:+B.min.z.toFixed(2),z1:+B.max.z.toFixed(2)}); } } });
  if(!out.length) g.traverse(o=>{ if(o.userData&&o.userData.ggScooter&&o.visible!==false){ B.setFromObject(o); if(!B.isEmpty()) out.push({src:'kit',name:String(o.userData.ggScooter),x0:+B.min.x.toFixed(2),x1:+B.max.x.toFixed(2),z0:+B.min.z.toFixed(2),z1:+B.max.z.toFixed(2)}); } });
  return out; })()"""
GLB_READY_JS = """(()=>{ const g=GAME.E.zone&&GAME.E.zone.group; if(!g) return {shops:false,scooters:false}; let sc=false; g.traverse(o=>{ if(o.isLOD&&/^scooters_A/.test(o.name)) sc=true; });
  return {shops:!!g.getObjectByName('gongguan_shops_glb'), scooters:sc, manShops:!!ASSETS.manifest['bldg.gongguan_shops'], manSc:!!ASSETS.manifest['bldg.wz_scooter']}; })()"""
PARK_JS = """(()=>{ if(typeof BIKE==='undefined'||!BIKE.parkSpots) return null; return BIKE.parkSpots(GAME.E,'gongguan').map(q=>({x:+q.x.toFixed(2),z:+q.z.toFixed(2),yaw:+(q.yaw||0).toFixed(2),src:q.src})); })()"""
NAVW_JS = """(x=>{ const E=GAME.E; let best=0, run=0; for(let z=18.9;z<=22.6;z+=0.1){ if(E.canStand(x,z,0.3,0)) { run+=0.1; best=Math.max(best,run); } else run=0; } return +(best+0.6).toFixed(2); })(%s)"""
PHOTO_JS = """(([x,z])=>{ const E=GAME.E; for(let r=0;r<=3.01;r+=0.25) for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(E.canStand(px,pz,0.35,0)) return [+px.toFixed(2),+pz.toFixed(2)]; } return null; })(%s)"""


def rect_dist(b, x, z):
    dx = max(b['x0'] - x, 0, x - b['x1']); dz = max(b['z0'] - z, 0, z - b['z1'])
    return math.hypot(dx, dz)


def overlap(b, x0, x1, z0, z1):
    return b['x0'] < x1 and b['x1'] > x0 and b['z0'] < z1 and b['z1'] > z0


async def wait_glb(pg, secs=90):
    t0 = time.time(); r = None
    while time.time() - t0 < secs:
        r = await pg.evaluate(GLB_READY_JS)
        if (r['shops'] or not r['manShops']) and (r['scooters'] or not r['manSc']): break
        await pg.wait_for_timeout(1500)
    return r


async def converse(pg, cdp, tag, max_s=60):
    """途中跳出來的對話：逐句印出來（transcript）、點到底、選第一個"""
    last = None; t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if s['choices']:
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][0]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); idle = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != last: last = (s['name'], s['text']); print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.0: return True
        await pg.wait_for_timeout(500)
    return False


async def stuck_check(pg, cdp, tag, fb0, e0, errs):
    """卡住檢查：對話框關掉、busyDepth 0、搖桿推得動 ≥ 0.3 m（前、後、右、左都試，前面是牆不算卡住）、walkFallbacks 沒增加、沒有新的 JS 例外"""
    await converse(pg, cdp, tag, 15)
    s = await pg.evaluate(ST); moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s2 = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s2['dlg'] and not s2['choices'] and s2['depth'] == 0 and moved >= 0.3 and s2['fb'] == fb0 and not new)
    check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok,
          J({'dlg': s2['dlg'], 'depth': s2['depth'], 'moved': round(moved, 2), 'fb': [fb0, s2['fb']], 'errs': new[:2]}))
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def shot_facing(pg, cdp, tag, tx, tz, fn):
    turned = await L.turn_camera_to(pg, cdp, tx, tz)
    await pg.wait_for_timeout(2500)
    await pg.screenshot(path=os.path.join(OUT, fn))
    s = await pg.evaluate(ST)
    print('  [%s] 截圖 %s（鏡頭轉到店門方向：%s；人在 (%s,%s)、%s 時）' % (tag, fn, turned, s['x'], s['z'], s['hour']), flush=True)
    return turned


def scooter_checks(tag, name, dx, door, scs, parks, navw):
    dz = door['z'] if door else DOOR_Z
    near = [b for b in scs if rect_dist(b, dx, dz) < 1.5]
    check('[%s] ③ %s 門口互動點 (%.2f,%.2f) 1.5 m 內沒有機車' % (tag, name, dx, dz), not near, J(near[:3]))
    lane = [b for b in scs if overlap(b, dx - 0.6, dx + 0.6, 16.5, FZ + 0.3)]
    check('[%s] ④ 馬路 → %s 門口 1.2 m 寬通道（x %.2f～%.2f、z 16.5～19.3）沒有機車' % (tag, name, dx - 0.6, dx + 0.6), not lane, J(lane[:3]))
    arc = [b for b in scs if overlap(b, dx - 2.5, dx + 2.5, PILLAR_IN, GLASS_Z)]
    mz = max([PILLAR_IN] + [b['z1'] for b in arc]); free = round(GLASS_Z - mz, 2)
    check('[%s] ⑤ %s 門前騎樓走道被機車吃掉以後還有 ≥ 1.2 m' % (tag, name), free >= 1.2, '機車造成的剩餘 %.2f m（侵入騎樓的機車 %s）；導航格量的門口走道寬約 %s m（含柱子、雜物，參考）' % (free, J(arc[:2]), navw))
    if parks is None:
        check('[%s] ⑥ 單車停車位（BIKE.parkSpots）：遊戲有這個 API' % tag, False, 'BIKE.parkSpots 不存在')
    else:
        bad = [q for q in parks if abs(q['x'] - dx) < 0.6 + 0.3 and 16.0 < q['z'] < FZ + 0.3]
        check('[%s] ⑥ 單車自動停車的位置沒有停在 %s 門前通道上' % (tag, name), not bad, J(bad[:3]))
    near_list = sorted(scs, key=lambda b: rect_dist(b, dx, dz))[:2]
    print('  [%s] 離門最近的機車組：%s' % (tag, J([dict(b, d=round(rect_dist(b, dx, dz), 2)) for b in near_list])), flush=True)


async def main():
    os.makedirs(OUT, exist_ok=True)
    todo = [s for s in SHOPS if not ONLY or s[0] in ONLY]
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for slug, name, batch, dx, labels in todo:
            tag = slug
            print('== %s（第 %d 批，門 x %.2f）' % (name, batch, dx), flush=True)
            # ---------- A 白天 ----------
            print('  [前置／捷徑] 讀檔：公館馬路上、%s 正前方 (%.2f, 2)、2025-09-23（二）14:00、條件事件關閉' % (name, dx), flush=True)
            await L.load_state(pg, {'zone': 'gongguan', 'hour': 14.0, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': FLAGS, 'money': 3000, 'pos': {'x': dx, 'z': 2.0, 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
            await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
            g = await wait_glb(pg)
            check('[%s] 公館店面正式模型、機車正式模型載入' % tag, (g['shops'] or not g['manShops']) and (g['scooters'] or not g['manSc']), J(g))
            fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
            door = await pg.evaluate(DOOR_JS % J([labels, name, dx]))
            if batch == 1:
                check('[%s] 第一批：門口有互動點（%s）' % (tag, '／'.join(labels)), bool(door), J(door))
            else:
                print('  [%s] 第二批：%s（店門互動點等室內；沒有就照 DOORS 的門 (%.2f, %.1f)）' % (tag, ('有互動點 ' + J(door)) if door else '還沒有互動點', dx, DOOR_Z), flush=True)
            scs = await pg.evaluate(SCOOTERS_JS)
            check('[%s] 取得公館的機車物件（%s）' % (tag, scs[0]['src'] if scs else '無'), bool(scs), '共 %d 組' % len(scs))
            parks = await pg.evaluate(PARK_JS)
            navw = await pg.evaluate(NAVW_JS % J(dx))
            scooter_checks(tag, name, dx, door, scs, parks, navw)
            ph = await pg.evaluate(PHOTO_JS % J([dx, 12.5]))
            ok = bool(ph) and await L.go_to(pg, cdp, Run(), ph[0], ph[1], 0.8, '%s 對面的人行道（拍照點）' % name)
            check('[%s] 從馬路走到人行道拍照點 %s' % (tag, J(ph)), ok)
            await shot_facing(pg, cdp, tag, dx, 22.0, 'gg_%s_day.png' % slug)
            tx, tz = (door['x'], door['z'] - 0.4) if door else (dx, DOOR_Z - 0.4)
            reached = await L.go_to(pg, cdp, Run(), tx, tz, 1.0, '%s 店門口' % name)
            await pg.wait_for_timeout(1200); s = await pg.evaluate(ST)
            check('[%s] ② 從馬路真的走到 %s 店門口 (%.2f,%.2f)' % (tag, name, tx, tz), reached and math.hypot(s['x'] - tx, s['z'] - tz) <= 1.2, J({k: s[k] for k in ('x', 'z', 'interact')}))
            if batch == 1:
                check('[%s] 店門口的互動按鈕是「%s」' % (tag, '／'.join(labels)), any(s['interact'].startswith(l) for l in labels), s['interact'])
            else:
                print('  [%s] 店門口的互動按鈕：%s' % (tag, s['interact'] or '（沒有）'), flush=True)
            await L.turn_camera_to(pg, cdp, tx, 23.0); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(OUT, 'gg_%s_door.png' % slug))
            await stuck_check(pg, cdp, tag + '_door', fb0, e0, errs)
            # ---------- B 晚上 ----------
            if NIGHT and ph:
                print('  [前置／捷徑] 讀檔：%s 對面的人行道 %s、20:00、條件事件關閉' % (name, J(ph)), flush=True)
                await L.load_state(pg, {'zone': 'gongguan', 'hour': 20.0, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': FLAGS, 'money': 3000, 'pos': {'x': ph[0], 'z': ph[1], 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
                await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp); await wait_glb(pg)
                fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
                await shot_facing(pg, cdp, tag, dx, 22.0, 'gg_%s_night.png' % slug)
                await stuck_check(pg, cdp, tag + '_night', fb0, e0, errs)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
