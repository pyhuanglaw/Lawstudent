# -*- coding: utf-8 -*-
"""CC（帳號 A）：體育館 B1（重訓室＋游泳池）截圖探針。
- rack：BUG-GYM-CROWD-STIFF-1103（55332d899；BB 2026-11-03 08:49）。使用者原話：「健身房新增了人 但是都不太會動 更詭異好嗎」。
    修正：深蹲架、啞鈴架前不再擺站著不動的人（CROWD.GYM_STAND_FIT=false）；8bc5b1207（GYM-USE-1103）起那裡的人回來但都在做深蹲／彎舉（開關拿掉），
    判斷改成 rack／dumbbell 的 pose 一定是 gym_squat／gym_curl。週三 17:00 讀檔進 gym_b1，記錄每個 NPC 15 秒內移動多少。
- pool：BUG-GYM-POOL-EMPTY-1103（5af1accd8）。使用者原話：「游泳池完全沒人？而且為什麼會出現去健身房的選項」。
    8/30（六）19:58 池邊：救生員（crowdRole lifeguard）一位、在高椅（GYM2_LIFEGUARD (14.2,-12)）西邊、面向池子（yaw≈-π/2）；
    池邊長椅（crowdRole pool_bench）坐 1～2 人、在 B.poolBenches 的座位上；位置在 B.pool（游泳池廳）內、不在 B.pool.basin（水裡）、
    y 和地面差 < 0.1 m、站著的人在導航可走的格子上。橫向、直向各截圖（看救生員一張、看長椅一張）。
- plate：同一個修正的名牌。人在游泳池那一側（z ≤ B.pool.z1）時 GUIDE 名牌「去健身房」不顯示；用玩家方式（點地面走、走不動才推搖桿，playlib.go_to）
    從池邊 (2.5,-1.5) 穿過泳池門（x -5～-3.2）走回走廊 (1.0,1.6)（z > B.pool.z1）以後才顯示。兩個位置各截一張圖、記錄名牌 sprite 的 visible 與螢幕座標。只跑橫向（CC_PLATE_PORT=1 加跑直向）。
- motion：GYM-USE-1103（3d8e7315a、合併 8bc5b1207；BB 09:44）健身中心的人用器材：深蹲 gym_squat（role rack）、彎舉 gym_curl（dumbbell）、
    坐姿肩推 gym_press（bench）、飛輪 gym_bike（bike）、划船 gym_row（rower）、拉筋 gym_stretch（mat）。名單在 src/crowd3d.js:186-192（fit），
    動作是 src/character3d.js:318-323（說明）、:343 gymIK、:363～:401 各動作、:327-332 C.GYM（座墊高度：肩推 0.46、飛輪 0.985、划船 0.40）。
    一次進場只挑 2～6 人（crowd3d.js:196 daySlots），所以照 MOTION_SLOTS 換幾個日子時段讀檔，直到六種都出現（沒出現＝FAIL，列出看到的）。
    每一種：讀檔把玩家放在那個人旁邊 2 m 左右（導航可走的格子），滑畫面把鏡頭轉過去，橫向、直向各截兩張（隔 1.2 秒，不同相位）；
    遊戲狀態：人物的 userData.gym.pose 是那個動作、3 秒內關節有動（≥ 5 cm）；坐著的（肩推、飛輪、划船）大腿根（＝臀部坐在座墊上的位置，同 tests/gym_pose_unit.js）
    和座墊高度差 < 0.1 m；站著的（深蹲、彎舉）和拉筋：人物網格（含蒙皮）最低點離地 < 0.05 m（不漂浮、不陷進地板）。手和器材穿模、自然不自然留給 BB 看圖。
- closed：反例。2025-09-22（一）＝每月第四個星期一休館（src/crowd3d.js:151 S.gymHours、src/gym3d.js:139 fourthMonday），19:58 游泳池不能有人。
用法：LW_TESTS=<wt>/tests SHA=<sha> CASES=rack,pool,plate,closed,motion python3 cc_gym_shot_probe.py <url> <out>   （PC 用 CC_HEADLESS=0 有視窗＋顯示卡）
【前置／捷徑】用遊戲自己的讀檔（playlib.load_state，條件事件關閉）把玩家放進 gym_b1 的指定時間與位置，不是玩家走過去；plate 的走路是玩家操作。
判斷只讀遊戲狀態（E.npcs 的 crowdRole、obj.position、obj.rotation.y、pose；GUIDE._st.markers）；文字比對用 startswith。
"""
import sys, os, json, math, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
CASES = [c.strip() for c in (os.environ.get('CASES') or 'rack,pool,plate,closed,motion').split(',') if c.strip()]
HEADLESS = os.environ.get('CC_HEADLESS', '1') != '0'
PLATE_PORT = os.environ.get('CC_PLATE_PORT') == '1'
ORIENTS = [o.strip() for o in (os.environ.get('CC_ORIENT') or 'land,port').split(',')]   # 只跑橫向：CC_ORIENT=land
DAY_0830, DAY_0922 = -17, 6          # 第 1 天＝2025-09-17（src/data/calendar.js:2）；8/30＝第 -17 天（週六）、9/22＝第 6 天（第四個星期一）
H1958 = 19 + 58 / 60.0

NPCS = """(()=>{ const E=GAME.E, out=[]; for(const n of (E.npcs||[])){ const o=n.obj; if(!o||!o.position) continue; const p=o.position;
  const h=E.heightAt?E.heightAt(p.x,p.z,n.lv|0):0, nv=E.navOf?E.navOf(n.lv|0):E.nav;
  out.push({name:n.name||'', role:n.crowdRole||null, crowd:n.crowd||null, x:+p.x.toFixed(2), z:+p.z.toFixed(2), y:+p.y.toFixed(3), ground:+(+h).toFixed(3),
    yaw:+o.rotation.y.toFixed(3), pose:n.pose||null, vis:o.visible!==false&&!n.hidden, free:nv?nv.free(p.x,p.z):null, seat:!!n.seat}); } return out; })()"""
INFO = """(()=>{ const E=GAME.E, B=GYM_LAYOUT.b1, p=E.player.obj.position; return {zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(2),
  date:(typeof CALENDAR!=='undefined')?CALENDAR.dateOf(GAME.G.day).key:null, wd:(typeof CALENDAR!=='undefined')?CALENDAR.dateOf(GAME.G.day).wd:null,
  fit:(typeof CROWD!=='undefined'&&('GYM_STAND_FIT' in CROWD))?CROWD.GYM_STAND_FIT:'(沒有這個開關)', px:+p.x.toFixed(2), pz:+p.z.toFixed(2),
  pool:{x0:B.pool.x0,x1:B.pool.x1,z0:B.pool.z0,z1:B.pool.z1}, basin:B.pool.basin, benches:B.poolBenches,
  chair:((B.entryProps.find(e=>e.node==='GYM2_LIFEGUARD')||{}).at||[null])[0]}; })()"""
MARK = """(()=>{ const E=GAME.E, st=(typeof GUIDE!=='undefined'&&GUIDE._st)||null; if(!st) return {err:'沒有 GUIDE._st'};
  const m=(st.markers||[]).find(q=>q.it&&(q.it.label||'').startsWith('去健身房')); const p=E.player.obj.position;
  if(!m) return {found:false, n:(st.markers||[]).length, px:+p.x.toFixed(2), pz:+p.z.toFixed(2)};
  let scr=null; if(m.spr&&E.camera){ const v=new THREE.Vector3(); m.spr.getWorldPosition(v).project(E.camera); const sx=Math.round((v.x+1)/2*innerWidth), sy=Math.round((1-v.y)/2*innerHeight), inView=v.z<1&&sx>=0&&sy>=0&&sx<innerWidth&&sy<innerHeight, el=inView?document.elementFromPoint(sx,sy):null; scr={sx, sy, inView, onCanvas:!!el&&el.id==='c', cover:el&&el.id!=='c'?(el.id||el.className||el.tagName):null}; }
  return {found:true, visible:!!(m.spr&&m.spr.visible), txt:m.txt, hasVisIf:typeof m.it.visIf==='function', it:[m.it.x,m.it.z],
    d:+Math.hypot(m.it.x-p.x,m.it.z-p.z).toFixed(2), px:+p.x.toFixed(2), pz:+p.z.toFixed(2), scr}; })()"""
MOTION_POSES = [('gym_squat', 'rack', '深蹲', 'stand'), ('gym_curl', 'dumbbell', '啞鈴彎舉', 'stand'), ('gym_press', 'bench', '坐姿肩推', 'seat'),
                ('gym_bike', 'bike', '飛輪', 'seat'), ('gym_row', 'rower', '划船', 'seat'), ('gym_stretch', 'mat', '拉筋', 'floor')]
# (第幾天, 週幾, 幾點)：第 1 天＝2025-09-17（三）。平日、週六、週日的早上／中午／傍晚（crowd3d.js daySlots 的人數：傍晚、週末多）
MOTION_SLOTS = [(11, 6, 19.0), (7, 2, 18.5), (11, 6, 10.0), (12, 0, 15.0), (8, 3, 17.0), (7, 2, 12.6), (14, 2, 19.5), (18, 6, 16.0), (19, 0, 10.5), (15, 3, 20.5), (25, 6, 19.0), (21, 2, 18.0)]
FIT_LIST = """(()=>{ const out=[]; for(const n of (GAME.E.npcs||[])){ if(!n.crowd||!String(n.crowd).startsWith('gym_b1')) continue; const o=n.obj, p=o.position;
  out.push({key:n.crowdKey||'', role:n.crowdRole||null, pose:n.pose||null, x:+p.x.toFixed(2), z:+p.z.toFixed(2), y:+p.y.toFixed(3), yaw:+o.rotation.y.toFixed(3)}); } return out; })()"""
SPOT_JS = """(([x,z,yaw])=>{ const E=GAME.E, nv=E.nav, ok=(a,b)=>[[0,0],[0.35,0],[-0.35,0],[0,0.35],[0,-0.35]].every(([dx,dz])=>nv.free(a+dx,b+dz));
  const others=(E.npcs||[]).map(n=>n.obj.position); let best=null;
  for(const r of [2.0,2.4,1.7,2.8,3.2]) for(let k=0;k<24;k++){ const a=k*Math.PI/12, px=x+r*Math.sin(a), pz=z+r*Math.cos(a); if(pz<3.4||pz>13.6||px<-23.6||px>9.6||!ok(px,pz)) continue;
    if(others.some(o=>Math.hypot(o.x-px,o.z-pz)<0.8)) continue; const f=[Math.sin(yaw),Math.cos(yaw)], d=[(px-x)/r,(pz-z)/r], ang=Math.acos(Math.max(-1,Math.min(1,f[0]*d[0]+f[1]*d[1])));
    const sc=Math.abs(ang-0.9)+0.15*Math.abs(r-2.0); if(!best||sc<best.sc) best={x:+px.toFixed(2),z:+pz.toFixed(2),sc,r}; }
  return best; })(%s)"""
SAMPLE_JS = """(async(key)=>{ const E=GAME.E, n=(E.npcs||[]).find(q=>q.crowdKey===key); if(!n) return {err:'找不到 '+key};
  const o=n.obj; let vrm=o.userData.vrm; if(!vrm) o.traverse(c=>{ if(!vrm&&c.userData&&c.userData.vrm) vrm=c.userData.vrm; }); if(!vrm) return {err:'沒有 VRM（備用人物）', pose:n.pose};
  const hm=vrm.humanoid, V=()=>new THREE.Vector3(), B=b=>{ const nd=hm.getRawBoneNode(b); return nd?nd.getWorldPosition(V()):null; };
  const lowest=()=>{ let m=1e9; const v=V(); o.updateMatrixWorld(true); o.traverse(c=>{ if(!c.isSkinnedMesh||!c.visible||!c.geometry||!c.geometry.attributes.position) return; let vis=true; for(let q=c;q;q=q.parent) if(q.visible===false) vis=false; if(!vis) return;
      if(c.skeleton) c.skeleton.update(); const N=c.geometry.attributes.position.count; for(let i=0;i<N;i++){ c.getVertexPosition(i,v); c.localToWorld(v); if(v.y<m) m=v.y; } }); return m; };
  const S=[], J=['hips','leftUpperLeg','rightUpperLeg','leftFoot','rightFoot','leftHand','rightHand','head'];
  for(let i=0;i<10;i++){ const f={}; for(const j of J){ const p=B(j); f[j]=p?[p.x,p.y,p.z]:null; } f.low=(i%4===0)?lowest():null; S.push(f); await new Promise(r=>setTimeout(r,300)); }
  const y0=o.position.y, g=E.heightAt?E.heightAt(o.position.x,o.position.z,n.lv|0):0, ud=o.userData||{};
  let gp=ud.gym&&ud.gym.pose||null; if(!gp) o.traverse(c=>{ if(!gp&&c.userData&&c.userData.gym&&c.userData.gym.pose) gp=c.userData.gym.pose; });
  const thigh=S.filter(f=>f.leftUpperLeg&&f.rightUpperLeg).map(f=>(f.leftUpperLeg[1]+f.rightUpperLeg[1])/2-y0), hips=S.filter(f=>f.hips).map(f=>f.hips[1]-y0), lows=S.map(f=>f.low).filter(v=>v!=null);
  let mv=0; for(const j of J){ const ps=S.map(f=>f[j]).filter(Boolean); for(let a=0;a<ps.length;a++) for(let b=a+1;b<ps.length;b++){ const d=Math.hypot(ps[a][0]-ps[b][0],ps[a][1]-ps[b][1],ps[a][2]-ps[b][2]); if(d>mv) mv=d; } }
  const r3=a=>a.map(v=>+v.toFixed(3));
  return {pose:n.pose, gymPose:gp, x:+o.position.x.toFixed(2), z:+o.position.z.toFixed(2), y:+y0.toFixed(3), ground:+(+g).toFixed(3), yaw:+o.rotation.y.toFixed(3),
    thigh:r3(thigh), hips:r3(hips), low:r3(lows), moved:+mv.toFixed(3), isFar:!!ud.isFar}; })(%s)"""
SEAT_H = {'gym_press': 0.46, 'gym_bike': 0.985, 'gym_row': 0.40}
fails = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + (json.dumps(info, ensure_ascii=False) if not isinstance(info, str) else info) if info != '' else ''), flush=True)
    if not ok:
        fails.append(name)
    return ok


def wrap(a):
    return (a + math.pi) % (2 * math.pi) - math.pi


def in_rect(n, r):
    return r['x0'] <= n['x'] <= r['x1'] and r['z0'] <= n['z'] <= r['z1']


async def put(pg, day, wd, hour, pos, tag, what):
    print('  [前置／捷徑] %s：讀檔進 gym_b1 第 %d 天（週%d）%.2f 時，位置 %s（條件事件關閉）——%s' % (tag, day, wd, hour, pos, what), flush=True)
    await L.load_state(pg, {'zone': 'gym_b1', 'hour': hour, 'day': day, 'weekday': wd, 'weather': 'clear', 'pos': pos, 'flags': FLAGS}, quiet_events=True, quiet_phone=True)
    await pg.wait_for_timeout(8000)


async def shot(pg, od, name, rec):
    f = os.path.join(od, name + '.png')
    await pg.screenshot(path=f)
    rec['shots'].append(f)
    return f


async def case_rack(pg, od, tag, rec):
    await put(pg, 8, 3, 17.0, None, tag, '週三 17:00、有人在練的時段')
    info = await pg.evaluate(INFO)
    check('rack %s：人在 gym_b1' % tag, info.get('zone') == 'gym_b1', info.get('zone'))
    a = await pg.evaluate(NPCS)
    await shot(pg, od, 'rack_%s_1' % tag, rec)
    await pg.wait_for_timeout(5000)
    await shot(pg, od, 'rack_%s_2' % tag, rec)
    await pg.wait_for_timeout(10000)
    bb = await pg.evaluate(NPCS)
    moves = []
    for i, x in enumerate(bb):
        y = a[i] if i < len(a) and a[i]['name'] == x['name'] and a[i]['role'] == x['role'] else None
        if y:
            moves.append({'name': x['name'], 'role': x['role'], 'x': x['x'], 'z': x['z'], 'moved': round(math.hypot(x['x'] - y['x'], x['z'] - y['z']), 2), 'vis': x['vis'], 'pose': x['pose']})
    rec['rack_' + tag] = {'info': info, 'npcs': moves}
    # 55332d899：rack／dumbbell 站著不動的人拿掉（GYM_STAND_FIT=false）；8bc5b1207（GYM-USE-1103）起 rack／dumbbell 回來、但一定在做 gym_squat／gym_curl（開關也拿掉了）。
    #   所以判斷是「深蹲架、啞鈴架前沒有站著不動的人」：rack 的 pose 要 gym_squat、dumbbell 的要 gym_curl（沒有這兩種人也算過）
    WANT = {'rack': 'gym_squat', 'dumbbell': 'gym_curl'}
    stand = [m for m in moves if m['role'] in WANT and m['pose'] != WANT[m['role']]]
    if tag == 'land':
        check('rack：CROWD.GYM_STAND_FIT 不是 true（55332d899 設 false；8bc5b1207 起拿掉開關）', info.get('fit') is not True, str(info.get('fit')))
    check('rack %s：深蹲架、啞鈴架前沒有站著不動的人（crowdRole rack／dumbbell 的 pose 是 gym_squat／gym_curl）' % tag, not stand and len(moves) > 0,
          '%d 位、rack／dumbbell %s、站著不動的 %s' % (len(moves), [[m['role'], m['pose']] for m in moves if m['role'] in WANT], stand))
    print('  rack %s：NPC %d 位；15 秒內沒動（<0.05 m）的：%s' % (tag, len(moves), [m for m in moves if m['moved'] < 0.05 and m['vis']]), flush=True)


async def case_pool(pg, cdp, od, tag, rec):
    await put(pg, DAY_0830, 6, H1958, {'x': 8.0, 'z': -2.0, 'yaw': 0}, tag, '8/30（六）19:58 使用者截圖那一刻、站在池邊')
    info = await pg.evaluate(INFO)
    check('pool %s：人在 gym_b1、日期 2025-08-30 週六' % tag, info.get('zone') == 'gym_b1' and info.get('date') == '2025-08-30' and info.get('wd') == 6, '%s %s 週%s' % (info.get('zone'), info.get('date'), info.get('wd')))
    npcs = await pg.evaluate(NPCS)
    pool, basin, chair = info['pool'], info['basin'], info['chair'] or [14.2, -12.0]
    lg = [n for n in npcs if n['role'] == 'lifeguard']
    pb = [n for n in npcs if n['role'] == 'pool_bench']
    rec['pool_' + tag] = {'info': info, 'npcs': npcs}
    print('  pool %s：救生員 %s' % (tag, lg), flush=True)
    print('  pool %s：長椅 %s' % (tag, pb), flush=True)
    check('pool %s：救生員一位' % tag, len(lg) == 1, '%d 位' % len(lg))
    if lg:
        g = lg[0]
        check('pool %s：救生員在高椅旁（高椅 %s，1.2 m 內、在高椅西邊）' % (tag, chair), math.hypot(g['x'] - chair[0], g['z'] - chair[1]) < 1.2 and g['x'] < chair[0], '(%s,%s)' % (g['x'], g['z']))
        check('pool %s：救生員面向池子（yaw≈-π/2，±0.35）' % tag, abs(wrap(g['yaw'] + math.pi / 2)) < 0.35, 'yaw %s' % g['yaw'])
        check('pool %s：救生員站在導航可走的格子上（沒有穿牆、沒有在高椅裡）' % tag, g['free'] is True, str(g['free']))
    check('pool %s：池邊長椅坐 1～2 人' % tag, 1 <= len(pb) <= 2, '%d 人' % len(pb))
    for i, n in enumerate(pb):
        near = min((math.hypot(n['x'] - b[0], n['z'] - (b[1] - 0.1)) for b in info['benches']), default=99)
        check('pool %s：長椅 #%d 在長椅座位上、坐著（pose sit）' % (tag, i + 1), near < 0.3 and (n['pose'] or '').startswith('sit'), '(%s,%s) 離座位 %.2f m pose %s' % (n['x'], n['z'], near, n['pose']))
    for n in lg + pb:
        check('pool %s：%s 在游泳池廳內（B.pool）、不在水裡（B.pool.basin）' % (tag, n['role']), in_rect(n, pool) and not in_rect(n, basin), '(%s,%s)' % (n['x'], n['z']))
        check('pool %s：%s 沒有浮空（y 和地面差 < 0.1 m）' % (tag, n['role']), abs(n['y'] - n['ground']) < 0.1, 'y %s 地面 %s' % (n['y'], n['ground']))
    wet = [n for n in npcs if in_rect(n, basin)]
    check('pool %s：沒有任何人站在水裡（B.pool.basin）' % tag, not wet, wet)
    # 截圖：像玩家一樣滑畫面把鏡頭轉向救生員、再轉向坐著的人
    await L.turn_camera_to(pg, cdp, chair[0] - 1.0, chair[1])
    await pg.wait_for_timeout(1500)
    await shot(pg, od, 'pool_%s_lifeguard' % tag, rec)
    if pb:
        await L.turn_camera_to(pg, cdp, pb[0]['x'], pb[0]['z'])
        await pg.wait_for_timeout(1500)
        await shot(pg, od, 'pool_%s_bench' % tag, rec)


async def case_plate(pg, cdp, od, tag, rec):
    await put(pg, DAY_0830, 6, H1958, {'x': 2.5, 'z': -1.5, 'yaw': 0}, tag, '池邊、隔著牆就是走廊的「去健身房」（離名牌約 4.2 m，在名牌顯示距離 12 m 內；近一點名牌才在畫面中間，不被左上角的時間列蓋住）')
    info = await pg.evaluate(INFO)
    z1 = info['pool']['z1']
    run = L.Run('gym_plate_' + tag, od)
    await L.turn_camera_to(pg, cdp, 4.1, 2.4)
    await pg.wait_for_timeout(2500)
    m1 = await pg.evaluate(MARK)
    await shot(pg, od, 'plate_%s_pool' % tag, rec)
    print('  plate %s 池邊：%s' % (tag, m1), flush=True)
    check('plate %s：玩家在游泳池那一側（z ≤ %s）' % (tag, z1), m1.get('pz', 9) <= z1, 'z %s' % m1.get('pz'))
    check('plate %s：找得到「去健身房」名牌' % tag, m1.get('found') is True, m1)
    check('plate %s：池邊看不到「去健身房」名牌（sprite.visible false）' % tag, m1.get('found') is True and m1.get('visible') is False, 'visible %s d %s' % (m1.get('visible'), m1.get('d')))
    ok = await L.go_to(pg, cdp, run, -4.1, -1.0, 0.6, '泳池門內', max_s=300)
    ok = ok and await L.go_to(pg, cdp, run, 1.0, 1.6, 0.7, '走廊（名牌西邊約 3 m）', max_s=300)
    s = await L.state(pg)
    check('plate %s：用點地面／搖桿走回走廊（z > %s）' % (tag, z1), ok and s['z'] > z1, '(%s,%s) 走路改放到目的地 %s 次' % (s['x'], s['z'], s.get('fallbacks')))
    await L.turn_camera_to(pg, cdp, 4.1, 2.4)
    await pg.wait_for_timeout(2500)
    m2 = await pg.evaluate(MARK)
    await shot(pg, od, 'plate_%s_corridor' % tag, rec)
    print('  plate %s 走廊：%s' % (tag, m2), flush=True)
    check('plate %s：走廊看得到「去健身房」名牌（sprite.visible true）' % tag, m2.get('found') is True and m2.get('visible') is True, 'visible %s d %s scr %s' % (m2.get('visible'), m2.get('d'), m2.get('scr')))
    sc = m2.get('scr') or {}
    print('  記錄 plate %s：走廊截圖裡名牌的螢幕位置 (%s,%s)、在畫面內 %s、沒被介面蓋住 %s（蓋住的元素 %s）——只記錄，不算 PASS／FAIL' % (tag, sc.get('sx'), sc.get('sy'), sc.get('inView'), sc.get('onCanvas'), sc.get('cover')), flush=True)
    rec['plate_' + tag] = {'pool': m1, 'corridor': m2}


async def case_motion(pg, cdp, od, tag, rec):
    found = rec.setdefault('motion_found', {})
    want = [m[0] for m in MOTION_POSES]
    seen = {}
    if not all(p in found for p in want):
        for (day, wd, hour) in MOTION_SLOTS:
            await put(pg, day, wd, hour, {'x': -6.0, 'z': 6.0, 'yaw': 0}, tag, '找健身中心裡有哪些動作（一次進場只挑 2～6 人）')
            lst = await pg.evaluate(FIT_LIST)
            ps = sorted(set(n['pose'] for n in lst if n['pose']))
            print('  motion %s 第 %d 天 %.1f 時：%d 人，動作 %s' % (tag, day, hour, len(lst), ps), flush=True)
            for n in lst:
                seen[n['pose']] = seen.get(n['pose'], 0) + 1
                if n['pose'] in want and n['pose'] not in found:
                    found[n['pose']] = {'day': day, 'wd': wd, 'hour': hour, 'npc': n}
            if all(p in found for p in want):
                break
    rec['motion_seen_' + tag] = seen
    for pose, role, zh, kind in MOTION_POSES:
        f = found.get(pose)
        if not check('motion %s：%s（%s）在健身中心出現' % (tag, zh, pose), f is not None, '' if f else '試過 %d 個時段都沒出現；看到的動作 %s' % (len(MOTION_SLOTS), seen)):
            continue
        n0 = f['npc']
        check('motion %s：%s 的 crowdRole 是 %s' % (tag, zh, role), n0['role'] == role, str(n0['role']))
        spot = await pg.evaluate(SPOT_JS.replace('%s', json.dumps([n0['x'], n0['z'], n0['yaw']])))
        if not spot:
            check('motion %s：%s 旁邊找得到玩家站的位置' % (tag, zh), False, n0); continue
        await put(pg, f['day'], f['wd'], f['hour'], {'x': spot['x'], 'z': spot['z'], 'yaw': 0}, tag, '站在%s的人旁邊 %.1f m（同一天同一時段進場是同一批人）' % (zh, spot['r']))
        lst = await pg.evaluate(FIT_LIST)
        n = next((q for q in lst if q['key'] == n0['key']), None)
        if not check('motion %s：重新進場以後還是同一個人在%s' % (tag, zh), n is not None and n['pose'] == pose, str(n)):
            continue
        # 鏡頭看向那個人、往旁邊偏 22°（玩家站在畫面中間，不要擋住那個人）
        s0 = await L.state(pg); dx, dz = n['x'] - s0['x'], n['z'] - s0['z']; c, si = math.cos(0.38), math.sin(0.38)
        await L.turn_camera_to(pg, cdp, s0['x'] + dx * c - dz * si, s0['z'] + dx * si + dz * c)
        await pg.wait_for_timeout(1500)
        m = await pg.evaluate(SAMPLE_JS.replace('%s', json.dumps(n['key'])))
        f1 = await shot(pg, od, 'motion_%s_%s_1' % (tag, pose[4:]), rec)
        await pg.wait_for_timeout(1200)
        f2 = await shot(pg, od, 'motion_%s_%s_2' % (tag, pose[4:]), rec)
        rec.setdefault('motion_' + tag, {})[pose] = {'slot': [f['day'], f['hour']], 'player': spot, 'm': m, 'shots': [f1, f2]}
        print('  motion %s %s：位置 (%s,%s) yaw %s；大腿根 %s；臀部 %s；網格最低點 %s；地面 %s；3 秒內最大移動 %s m' % (tag, zh, m.get('x'), m.get('z'), m.get('yaw'), m.get('thigh'), m.get('hips'), m.get('low'), m.get('ground'), m.get('moved')), flush=True)
        print('  截圖（留給 BB 判穿模、自然不自然）：%s 動作 %s → %s、%s' % (zh, pose, f1, f2), flush=True)
        if not check('motion %s：%s 有 VRM 骨架可量' % (tag, zh), 'err' not in m, m.get('err', '')):
            continue
        check('motion %s：%s 人物真的在做 %s（userData.gym.pose）' % (tag, zh, pose), m.get('gymPose') == pose, str(m.get('gymPose')))
        check('motion %s：%s 3 秒內關節有動（≥ 5 cm）' % (tag, zh), m.get('moved', 0) >= 0.05, '%s m' % m.get('moved'))
        if kind == 'seat':
            h = SEAT_H[pose]; ds = [round(t - h, 3) for t in m['thigh']]
            check('motion %s：%s 臀部（大腿根）和座墊（%.3f m）高度差 < 0.1 m' % (tag, zh, h), bool(ds) and all(abs(d) < 0.1 for d in ds), '差 %s～%s m' % (min(ds) if ds else None, max(ds) if ds else None))
        else:
            g = m['ground']; ds = [round(v - g, 3) for v in m['low']]
            check('motion %s：%s 身體最低點（%s）離地 < 0.05 m（不漂浮、不陷進地板）' % (tag, zh, '腳底' if kind == 'stand' else '坐在墊子上'), bool(ds) and all(abs(d) < 0.05 for d in ds), '最低點 − 地面 %s m' % ds)


async def case_closed(pg, cdp, od, tag, rec):
    await put(pg, DAY_0922, 1, H1958, {'x': 8.0, 'z': -2.0, 'yaw': 0}, tag, '2025-09-22（一）第四個星期一休館（crowd3d.js:151、gym3d.js:139）')
    info = await pg.evaluate(INFO)
    check('closed %s：日期 2025-09-22 週一' % tag, info.get('date') == '2025-09-22' and info.get('wd') == 1, '%s 週%s' % (info.get('date'), info.get('wd')))
    npcs = await pg.evaluate(NPCS)
    side = [n for n in npcs if in_rect(n, info['pool']) or (n['role'] or '').startswith('lifeguard') or (n['role'] or '').startswith('pool')]
    rec['closed_' + tag] = {'info': info, 'npcs': npcs}
    check('closed %s：休館日游泳池沒有人（沒有救生員、長椅、池邊的人）' % tag, not side, side)
    await L.turn_camera_to(pg, cdp, 13.2, -12.0)
    await pg.wait_for_timeout(1500)
    await shot(pg, od, 'closed_%s_pool' % tag, rec)


async def main(url, od):
    os.makedirs(od, exist_ok=True)
    rec = {'sha': os.environ.get('SHA'), 'cases': CASES, 'shots': []}
    print('CASES=%s  headless=%s  SHA=%s' % (','.join(CASES), HEADLESS, rec['sha']), flush=True)
    async with async_playwright() as p:
        for land in (True, False):
            tag = 'land' if land else 'port'
            todo = [c for c in CASES if not (c == 'plate' and not land and not PLATE_PORT)]
            if tag not in ORIENTS:
                continue
            if not todo:
                continue
            if HEADLESS:
                b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
            else:
                b = await p.chromium.launch(headless=False)
                vp = {'width': 844, 'height': 390} if land else {'width': 390, 'height': 844}
                ctx = await b.new_context(viewport=vp, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=L.UA)
                pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(url)
            check('%s：遊戲載入' % tag, await L.wait_loaded(pg))
            for c in todo:
                try:
                    if c == 'rack':
                        await case_rack(pg, od, tag, rec)
                    elif c == 'pool':
                        await case_pool(pg, cdp, od, tag, rec)
                    elif c == 'plate':
                        await case_plate(pg, cdp, od, tag, rec)
                    elif c == 'motion':
                        await case_motion(pg, cdp, od, tag, rec)
                    elif c == 'closed':
                        await case_closed(pg, cdp, od, tag, rec)
                    else:
                        check('未知的情境 %s' % c, False)
                except Exception as e:
                    check('%s %s：探針例外' % (c, tag), False, repr(e)[:300])
            check('%s：沒有 JS 例外' % tag, not errs, errs[:3])
            await b.close()
    json.dump(rec, open(os.path.join(od, 'gym.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('截圖：' + ', '.join(rec['shots']), flush=True)
    print('ALL PASS' if not fails else 'FAILED %d' % len(fails))
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1], sys.argv[2])))
