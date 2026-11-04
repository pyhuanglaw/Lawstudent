"""CC（帳號 A）11-04：GG_int——公館三間新室內（LAWWW 3159276dd／eb6d1c7b6：日和便利店 v2、青木茶室 aoki、頁間書屋 v2）＋溫州街日和的單車（cb1d84290）。測 cb1d84290。
  真實玩家流程（不用 ?turbo、不瞬移、不改劇情狀態）；只有前置讀檔，標【前置／捷徑】。每一段都卡住檢查、逐句印對話（transcript）、截圖。CASES 可以單獨跑：cvs,aoki,yejian,wzbike,art
  cvs（日和 v2）
    C1 【前置／捷徑】公館店門前 (−29.4, 15)、23:30 → 走到店門口「進入便利商店」→ 進店：窗景不是 cvs_wz；截圖 cvs_night.png → 走到出口出來回公館
    C2 【前置／捷徑】溫州街 A5 門前 (45.8, 0.4)、15:00 → 「進入日和便利店」→ 窗景是 cvs_wz（zone.wins[*].userData.pview＝cvs_wz、看得到）→ 出來回溫州街
    C3 8 個座位逐一（窗邊吧台四張「坐在窗邊吧台」、內用桌四張）：走過去、按座位的按鈕 → 坐下（P.seat、pose sit）→ 選單沒有讀書類（讀書／念書／看書／自習／慢慢讀）→「起身」
    C4 走到結帳 (1.5, 0.75)「結帳…」→ 點第一樣買得起的 → 扣的錢＝選項上的價格
  aoki（青木茶室）
    A1 【前置／捷徑】公館青木茶室門前 (−54.05, 15)、15:00 → 走到門口（x −54.05）「進入青木茶室」→ 進去、出來
    A2 吧台「點茶」(3.9, −1.2)：桂花烏龍奶茶 70、柚香綠茶 60、春摘白茶 65 各點一次：扣錢對；每一次之後存檔（GAME.autosave）→ 重新整理 → 繼續：錢和存檔前一樣
    A3 20 個玩家可坐的座位逐一坐下、起身：起身後腳下站得住（E.nav.free、canStand 0.3）
    A4 10:30、21:30 各一次：【前置／捷徑】讀檔到門前 → 走到門口按「進入青木茶室」→ 不能進 aoki、要有打烊的字（toast、對話、門口的字）；另印 PLACES.hours.aoki
    A5 手機「地點」→ 青木茶室：快速前往到得了（zone aoki）
  yejian（頁間 v2）
    Y1 16 個座位逐一（每一張先【前置／捷徑】讀檔到店裡進門的地方 14:00，時段次數才是新的）：坐下 → 選單有「讀書」（不是灰的）→ 按讀書 → 選第一個長度 → 讀書時 P.seat 有、pose 是 sit／read → 結束後起身；
       另記每一張坐下的位置和座位差多少（INFO）；沙發東邊那張（4.7, −3.65）：坐下滑多遠、路上有沒有穿過配置的阻擋、起身後卡不卡（OBS，不判 FAIL）
    Y2 「看看法律書與文具」(−4.0, −3.9)、「門上的告示」(−4.0, 3.6)：各按一次、有反應（對話／選單／toast）、不卡住
    Y3 「找書的女生」（pool_story.js pool_1，平日 13～17 在書牆前 (0.3, −3.95)）：場景裡有她、量她到書牆（z −4.78＋0.22）的距離（≤ 1.2 m）
  wzbike（cb1d84290）
    B1 【前置／捷徑】溫州街 (40, 0.4) 15:00，車停在溫州街一個合法停車處（先讀一次檔算 BIKE.parkSpots，再讀檔把車放那裡）→ 走到車旁上車 → 騎到 A5 門口 → 騎著按「進入日和便利店」
       → 店裡：G.bike.zone＝wenzhou、在 A5 附近（≤ BIKE.MAXD）；在店裡存檔 → 重新整理 → 繼續：G.bike.zone 還是 wenzhou、人還在店裡
       → 出來回溫州街：車在 A5 附近、BIKE.parkOK、不擋門（車身外框不碰任何門口 0.6 m）、不在騎樓（|z| < 3.0：溫州街兩側騎樓在 |z| ≥ 3.9 一帶，參考 WZ 機車排 z ±3.95）
    B2 再騎到 A5 門口、按「下車」停在門口 → 走進去、出來 → 同樣的停車檢查
  art：三間各拍門口 art_<店>_door.png（門前 6 m 面向店門，14:00）、店內 art_<店>_inside.png（進門站的地方、面向店裡 −z）
  卡住檢查：對話框關掉、GAME.D.busyDepth 0、搖桿推得動 ≥ 0.3 m（四個方向試）、GAME.walkFallbacks 沒有增加、沒有 JS 例外。
用法：LW_TESTS=<wt>/tests [CASES=cvs,aoki,yejian,wzbike,art] [SEATS=0,1,2] python3 cc_gg_int_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'cvs,aoki,yejian,wzbike,art').split(',') if c.strip()]
SEATSEL = [int(x) for x in (os.environ.get('SEATS') or '').split(',') if x.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'BIKE_TIP': True, 'BIKE_PARK_TIP': True}
DAY, WD = 7, 2          # 2025-09-23（二）
OUTDOOR = ['campus', 'gongguan', 'wenzhou', 'lane118', 'xinsheng']
STUDY_WORDS = ['讀書', '念書', '看書', '自習', '慢慢讀']
CLOSED_WORDS = ['打烊', '關門', '營業時間', '公休', '還沒開', '明天再來', '鐵捲門', '休息']
TEAS = [('桂花烏龍奶茶', 70), ('柚香綠茶', 60), ('春摘白茶', 65)]
DOORX = {'cvs': -29.4, 'aoki': -54.05, 'yejian': -36.4}
DOORLB = {'cvs': '進入便利商店', 'aoki': '進入青木茶室', 'yejian': '進入頁間書屋'}
ZONE = {'cvs': 'cvs', 'aoki': 'aoki', 'yejian': 'bookstore'}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def obs(name, info=''):
    print('OBS ' + name + (('  ' + info) if info else ''), flush=True)


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{}; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(4), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy, money:G.money|0, riding:!!P.riding,
    pose:P.pose||null, seat:P.seat?[+(+P.seat.x).toFixed(2),+(+P.seat.z).toFixed(2)]:null,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,160),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()),
    dims:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>b.classList.contains('dim')),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', fb:GAME.walkFallbacks||0,
    toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,80), cvsFrom:(G.flags||{}).CVS_FROM||null}; })()"""
FIND_JS = """(q=>{ const p=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>!i.hidden&&(q.exitTo?(i.exit&&i.exit.to===q.exitTo):(q.at?Math.hypot(i.x-q.at[0],i.z-q.at[1])<0.3:(i.label||'').startsWith(q.label))));
  its.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)); const it=its[0];
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label,to:it.exit?it.exit.to:null}:null; })(%s)"""
SEATS_JS = """(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),sx:+(+i.seat.x).toFixed(2),sz:+(+i.seat.z).toFixed(2),r:i.radius||0.8,label:i.label,study:!!i.study,ap:i.seat.ap||null})))()"""
NEAREST_JS = """(([x,z])=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return !!it&&!!it.seat&&Math.abs(it.x-x)<0.01&&Math.abs(it.z-z)<0.01; })(%s)"""
STAND_JS = """(()=>{ const E=GAME.E, p=E.player.obj.position; return {free:!!E.nav.free(p.x,p.z), stand:!!E.canStand(p.x,p.z,0.3,E.player.lv|0)}; })()"""
WINS_JS = """(()=>{ const z=GAME.E.zone; const w=(z&&z.wins)||[]; const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  return w.map(o=>({pview:o.userData&&o.userData.pview||null, visible:vis(o), map:!!(o.material&&o.material.map)})); })()"""
BK = """(()=>{ const E=GAME.E, G=GAME.G, P=E.player; const pk=E.zone&&E.zone.group.children.find(o=>o.name==='bike_ride');
  return {zone:G.zone, riding:!!P.riding, parked:pk?[+pk.position.x.toFixed(2),+pk.position.z.toFixed(2)]:null, bike:G.bike?JSON.parse(JSON.stringify(G.bike)):null}; })()"""
PCHK = """(()=>{ const E=GAME.E, G=GAME.G, s=G.bike||{}; const pk=E.zone.group.children.find(o=>o.name==='bike_ride'); let bb=null;
  if(pk){ pk.updateMatrixWorld(true); const B=new THREE.Box3().setFromObject(pk); bb={x0:B.min.x,x1:B.max.x,z0:B.min.z,z1:B.max.z}; }
  const doors=E.interactables.filter(i=>!i.bike&&((i.exit&&i.exit.to&&!['campus','gongguan','wenzhou','lane118','xinsheng'].includes(i.exit.to))||(i.wzShop&&i.kind==='enter')||(i.label||'').startsWith('進入')));
  const hit=bb?doors.filter(d=>Math.hypot(Math.max(bb.x0-d.x,0,d.x-bb.x1),Math.max(bb.z0-d.z,0,d.z-bb.z1))<0.6).map(d=>d.label):null;
  const a5=WZS.AA413.cvs.enter; return {zone:s.zone, x:s.x, z:s.z, yaw:s.yaw, ok:BIKE.parkOK(E,{x:s.x,z:s.z,yaw:s.yaw||0}), dA5:+Math.hypot(s.x-a5.x,s.z-a5.z).toFixed(2), maxd:BIKE.MAXD, hit, nDoors:doors.length, parked:!!pk}; })()"""
SPOTS_JS = """(()=>BIKE.parkSpots(GAME.E,'wenzhou').map(q=>({x:+q.x.toFixed(2),z:+q.z.toFixed(2),yaw:q.yaw||0})))()"""
FARSIDE_JS = """(([bx,bz])=>{ const E=GAME.E; const ds=E.interactables.filter(i=>(i.exit||i.wzShop)&&!i.bike).sort((a,b)=>Math.hypot(a.x-bx,a.z-bz)-Math.hypot(b.x-bx,b.z-bz)); const d=ds[0];
  const cand=[]; for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; for(const r of [0.7,0.95]){ const x=bx+Math.sin(a)*r, z=bz+Math.cos(a)*r; if(!E.canStand(x,z,0.3,0)) continue; cand.push({x:+x.toFixed(2),z:+z.toFixed(2),dd:d?Math.hypot(d.x-x,d.z-z)-(d.radius||1.5):99}); } }
  cand.sort((a,b)=>b.dd-a.dd); return cand.slice(0,4); })(%s)"""
BLOCKS_JS = """(()=>(typeof YEJIAN_LAYOUT!=='undefined'?YEJIAN_LAYOUT.blocks:[]))()"""
GIRL_JS = """(()=>{ let at=null; try{ for(const k in POOL_STORY.PEOPLE){ const p=POOL_STORY.PEOPLE[k]; for(const w of (p&&p.where)||[]) if(w.zone==='bookstore'&&w.at) at={id:k,at:w.at}; } }catch(e){}
  const out={want:at, npcs:[]}; for(const n of GAME.E.npcs||[]){ if(!n.obj||n.obj.visible===false) continue; const p=n.obj.position; out.npcs.push({id:n.charId||n.id||n.poolId||null,clerk:!!n.clerk,x:+p.x.toFixed(2),z:+p.z.toFixed(2),ry:+n.obj.rotation.y.toFixed(2)}); }
  return out; })()"""


async def converse(pg, cdp, tag, plan=None, max_s=180, samples=None):
    """逐句印對話（transcript）、點到底；選單照 plan 的順序挑（字開頭；'' ＝第一個），對不上：選「不用了／起身／再看看」或最後一個。
    samples：list 的話，每一圈記一筆 (pose, seat)。回傳 (台詞, 選單, 對不上的選單)"""
    plan = list(plan or []); lines = []; menus = []; odd = []; last = None; t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if samples is not None: samples.append((s['pose'], s['seat'], s['x'], s['z']))
        if s['toast'] and (not lines or lines[-1] != '［toast］' + s['toast']): lines.append('［toast］' + s['toast'])
        if s['choices']:
            menus.append(s['choices']); k = None
            if plan:
                k = next((i for i, c in enumerate(s['choices']) if c.startswith(plan[0])), None)
                if k is not None: plan.pop(0)
            if k is None:
                odd.append(s['choices']); k = next((i for i, c in enumerate(s['choices']) if c.startswith(('不用了', '起身', '再看看', '算了'))), len(s['choices']) - 1)
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900); idle = None; last = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != last:
                last = (s['name'], s['text']); lines.append(((s['name'] + '：') if s['name'] else '') + s['text'])
                print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.5: break
        await pg.wait_for_timeout(400)
    if plan: print('  [%s] 選單計畫沒用完：%s' % (tag, J(plan)), flush=True)
    return lines, menus, odd


async def stuck_check(pg, cdp, tag, fb0, e0, errs, soft=False):
    """卡住檢查：對話框關掉、busyDepth 0、搖桿推得動 ≥ 0.3 m（前、後、右、左都試，前面是牆不算卡住）、walkFallbacks 沒增加、沒有新的 JS 例外。soft＝只記 OBS"""
    await converse(pg, cdp, tag, None, 15)
    moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s['dlg'] and not s['choices'] and s['depth'] == 0 and moved >= 0.3 and s['fb'] == fb0 and not new)
    info = J({'zone': s['zone'], 'dlg': s['dlg'], 'depth': s['depth'], 'moved': round(moved, 2), 'fb': [fb0, s['fb']], 'errs': new[:2]})
    if soft: obs('[%s] 卡住檢查%s' % (tag, '通過' if ok else '沒通過'), info)
    else: check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok, info)
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def wait_js(pg, js, secs):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): return True
        await pg.wait_for_timeout(800)
    return False


async def load(pg, cdp, zone, x, z, hour, desc, money=3000, extra=None, yaw=math.pi):
    st = {'zone': zone, 'hour': hour, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': dict(FLAGS), 'money': money, 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}}
    if extra:
        fl = extra.pop('flags', None)
        st.update(extra)
        if fl: st['flags'].update(fl)
    print('  [前置／捷徑] 讀檔：%s (%s, %s)、2025-09-23（二）%s、money %d、條件事件關閉%s' % (zone, x, z, hhmm(hour), money, ('、' + desc) if desc else ''), flush=True)
    await L.load_state(pg, st, quiet_events=True)
    await pg.wait_for_timeout(6500); await L.close_panels(pg, cdp); await converse(pg, cdp, 'load', None, 15)


def hhmm(h):
    h = h % 24; return '%02d:%02d' % (int(h + 1e-6), int(round((h % 1) * 60)) % 60)


async def walk_tap(pg, cdp, tag, q, label_prefix, near=None):
    """走到互動點 → 互動按鈕要是 label_prefix → 按下去。回傳互動點（dict）或 None"""
    it = await pg.evaluate(FIND_JS % J(q))
    if not check('[%s] 有「%s」互動點' % (tag, label_prefix or q), bool(it), J(it)): return None
    await L.go_to(pg, cdp, Run(), it['x'], it['z'], near if near is not None else max(0.4, it['r'] * 0.6), it['label'], max_s=600)
    await pg.wait_for_timeout(1000); s = await pg.evaluate(ST)
    if not check('[%s] 走到旁邊：互動按鈕是「%s…」' % (tag, label_prefix or it['label']), s['interact'].startswith(label_prefix or it['label']), J({k: s[k] for k in ('x', 'z', 'interact')})):
        await pg.screenshot(path=os.path.join(OUT, 'NOBTN_%s.png' % tag)); return None
    await L.tap(pg, cdp, '#interact'); return it


async def enter_via(pg, cdp, tag, q, label_prefix, want_zone, near=None):
    z0 = (await pg.evaluate(ST))['zone']
    it = await walk_tap(pg, cdp, tag, q, label_prefix, near)
    if not it: return False
    ok = await wait_js(pg, "GAME.G.zone===%s&&!GAME.E.player.busy" % J(want_zone), 60); await pg.wait_for_timeout(2500)
    s = await pg.evaluate(ST)
    check('[%s] 按「%s」：%s → %s' % (tag, it['label'], z0, want_zone), ok and s['zone'] == want_zone, J({k: s[k] for k in ('zone', 'x', 'z', 'toast')}))
    return ok


async def go_out(pg, cdp, tag, want_zone):
    return await enter_via(pg, cdp, tag, {'label': '離開'}, '離開', want_zone)


async def reload_continue(pg, cdp, tag):
    print('  [捷徑] 存檔：GAME.autosave()（和換區域時的自動存檔同一個）→ 重新整理 → 標題「繼續」', flush=True)
    await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(1000)
    await pg.reload(); await L.wait_loaded(pg); await L.no_phone_auto(pg); await pg.wait_for_timeout(1500)
    ok = await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    check('[%s] 標題有「繼續」、按下去回到遊戲' % tag, ok)
    return ok


async def sit_each(pg, cdp, tag, seats, idx, plan_extra, check_menu, after=None):
    """座位逐一：走過去、確定最近的互動是這一張、按下去、坐下、看選單、起身"""
    sv = seats[idx]; t = '%s_seat%02d' % (tag, idx)
    target = sv['ap'] or [sv['x'], sv['z']]
    await L.go_to(pg, cdp, Run(), target[0], target[1], 0.35, '座位 %d (%s,%s)' % (idx, sv['sx'], sv['sz']), max_s=300)
    await pg.wait_for_timeout(800)
    if not await pg.evaluate(NEAREST_JS % J([sv['x'], sv['z']])):
        await L.go_to(pg, cdp, Run(), sv['x'], sv['z'], 0.2, '座位 %d（再靠近）' % idx, max_s=120); await pg.wait_for_timeout(800)
    s = await pg.evaluate(ST)
    near_ok = await pg.evaluate(NEAREST_JS % J([sv['x'], sv['z']]))
    if not check('[%s] 走到座位旁：按鈕是這一張的「%s」' % (t, sv['label']), near_ok and s['interact'].startswith(sv['label']), J({k: s[k] for k in ('x', 'z', 'interact')})):
        return None
    p0 = (s['x'], s['z']); samples = []
    await L.tap(pg, cdp, '#interact')
    t0 = time.time(); s = None
    while time.time() - t0 < 60:
        s = await pg.evaluate(ST); samples.append((s['pose'], s['seat'], s['x'], s['z']))
        if s['choices']: break
        await pg.wait_for_timeout(400)
    seated = bool(s and s['seat']) and s['pose'] in ('sit', 'read')
    check('[%s] 坐下（P.seat 有、pose sit）' % t, seated, J({k: s[k] for k in ('pose', 'seat', 'x', 'z')}) if s else 'null')
    menu = (s or {}).get('choices') or []
    res = {'menu': menu, 'p0': p0, 'sit': (s['x'], s['z']) if s else None, 'seat': (sv['sx'], sv['sz']), 'samples': samples}
    if check_menu: check_menu(t, menu, s)
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % t))
    lines, menus, odd = await converse(pg, cdp, t, plan_extra + ['起身'], 300, samples)
    res['lines'] = lines
    s2 = await pg.evaluate(ST)
    check('[%s] 起身（P.seat 沒了）' % t, not s2['seat'], J({k: s2[k] for k in ('pose', 'seat', 'x', 'z')}))
    if after: await after(t, s2)
    return res


async def case_cvs(pg, cdp, errs):
    print('== cvs 日和便利店 v2', flush=True)
    # C1 公館 23:30
    await load(pg, cdp, 'gongguan', -29.4, 15.0, 23.5, '公館日和便利店門前')
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if await enter_via(pg, cdp, 'C1', {'label': DOORLB['cvs']}, DOORLB['cvs'], 'cvs', near=1.2):
        w = await pg.evaluate(WINS_JS)
        check('C1 從公館進：窗景不是 cvs_wz', not any(q['pview'] == 'cvs_wz' for q in w), J(w))
        await L.turn_camera_to(pg, cdp, 0.4, -2.0); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'cvs_night.png')); print('  [C1] 截圖 cvs_night.png（23:30）', flush=True)
        await stuck_check(pg, cdp, 'C1_inside', fb0, e0, errs)
        await go_out(pg, cdp, 'C1_out', 'gongguan')
    # C2 溫州街 A5 15:00
    await load(pg, cdp, 'wenzhou', 45.8, 0.4, 15.0, '溫州街 A5 日和便利店門前')
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if await enter_via(pg, cdp, 'C2', {'label': '進入日和便利店'}, '進入日和便利店', 'cvs', near=0.6):
        await wait_js(pg, "!!(GAME.E.zone&&GAME.E.zone.wins&&GAME.E.zone.wins.length)", 20)
        w = await pg.evaluate(WINS_JS)
        check('C2 從溫州街 A5 進：窗景是 cvs_wz、看得到', bool(w) and all(q['pview'] == 'cvs_wz' for q in w) and any(q['visible'] for q in w), J(w))
        await pg.screenshot(path=os.path.join(OUT, 'C2_cvs_from_wz.png'))
        await stuck_check(pg, cdp, 'C2_inside', fb0, e0, errs)
        # C3 8 個座位
        seats = await pg.evaluate(SEATS_JS)
        check('C3 座位 8 個', len(seats) == 8, J([[q['sx'], q['sz'], q['label']] for q in seats]))
        def cm(t, menu, s):
            bad = [c for c in menu if any(w in c for w in STUDY_WORDS)]
            check('[%s] 座位選單沒有讀書類選項' % t, bool(menu) and not bad, J(menu))
        for i in range(len(seats)):
            if SEATSEL and i not in SEATSEL: continue
            await sit_each(pg, cdp, 'C3', seats, i, [], cm)
        await stuck_check(pg, cdp, 'C3_end', fb0, e0, errs)
        # C4 結帳
        m0 = (await pg.evaluate(ST))['money']
        if await walk_tap(pg, cdp, 'C4', {'at': [1.5, 0.75]}, '結帳'):
            t0 = time.time(); s = None
            while time.time() - t0 < 30:
                s = await pg.evaluate(ST)
                if s['choices']: break
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(600)
            items = []
            for c, d in zip(s['choices'], s['dims']):
                if '元' in c and not d:
                    try: items.append((c, int(c.split('　')[-1].split('元')[0].strip().replace(',', ''))))
                    except ValueError: pass
            check('C4 結帳選單有買得起的品項（「品名　N 元」）', bool(items), J(s['choices']))
            if items:
                name, price = items[0]
                lines, menus, odd = await converse(pg, cdp, 'C4', [name], 120)
                m1 = (await pg.evaluate(ST))['money']
                check('C4 買「%s」：扣的錢＝價格 %d' % (name, price), m0 - m1 == price, J({'money': [m0, m1], 'lines': lines[-3:]}))
            await stuck_check(pg, cdp, 'C4_end', fb0, e0, errs)
        await go_out(pg, cdp, 'C2_out', 'wenzhou')
        s = await pg.evaluate(ST)
        check('C2 出來回溫州街 A5 門外', s['zone'] == 'wenzhou' and abs(s['x'] - 44) < 3, J({k: s[k] for k in ('zone', 'x', 'z')}))


async def case_aoki(pg, cdp, errs):
    print('== aoki 青木茶室', flush=True)
    await load(pg, cdp, 'gongguan', DOORX['aoki'], 15.0, 15.0, '青木茶室門前', money=2000)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if not await enter_via(pg, cdp, 'A1', {'label': DOORLB['aoki']}, DOORLB['aoki'], 'aoki', near=1.2): return
    await stuck_check(pg, cdp, 'A1_inside', fb0, e0, errs)
    await go_out(pg, cdp, 'A1_out', 'gongguan')
    s = await pg.evaluate(ST)
    check('A1 出來回公館青木茶室門口（x ≈ −54.05）', s['zone'] == 'gongguan' and abs(s['x'] - DOORX['aoki']) < 2, J({k: s[k] for k in ('zone', 'x', 'z')}))
    if not await enter_via(pg, cdp, 'A1b', {'label': DOORLB['aoki']}, DOORLB['aoki'], 'aoki', near=1.2): return
    # A2 點茶 ×3＋存檔讀檔
    for nm, price in TEAS:
        m0 = (await pg.evaluate(ST))['money']
        if not await walk_tap(pg, cdp, 'A2_' + nm, {'at': [3.9, -1.2]}, '點茶'): continue
        lines, menus, odd = await converse(pg, cdp, 'A2_' + nm, [nm], 120)
        m1 = (await pg.evaluate(ST))['money']
        opt = next((c for m in menus for c in m if c.startswith(nm)), '')
        check('A2 點「%s」：扣 %d（選項 %s）' % (nm, price, opt), m0 - m1 == price and (str(price) in opt), J({'money': [m0, m1], 'lines': lines[-3:]}))
        if await reload_continue(pg, cdp, 'A2_' + nm):
            s = await pg.evaluate(ST)
            check('A2 「%s」之後存檔 → 重新整理 → 繼續：錢一樣（%d）、人在青木茶室' % (nm, m1), s['money'] == m1 and s['zone'] == 'aoki', J({k: s[k] for k in ('money', 'zone', 'x', 'z')}))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await stuck_check(pg, cdp, 'A2_end', fb0, e0, errs)
    # A3 20 個座位
    seats = await pg.evaluate(SEATS_JS)
    check('A3 玩家可坐的座位 20 個', len(seats) == 20, J([[q['sx'], q['sz']] for q in seats]))
    def cm(t, menu, s):
        print('  [%s] 座位選單：%s' % (t, J(menu)), flush=True)
    async def after(t, s2):
        r = await pg.evaluate(STAND_JS)
        check('[%s] 起身後腳下站得住（nav.free、canStand 0.3）' % t, r['free'] and r['stand'], J(dict(r, x=s2['x'], z=s2['z'])))
    for i in range(len(seats)):
        if SEATSEL and i not in SEATSEL: continue
        await sit_each(pg, cdp, 'A3', seats, i, [], cm, after)
    await stuck_check(pg, cdp, 'A3_end', fb0, e0, errs)
    await pg.screenshot(path=os.path.join(OUT, 'A3_end.png'))
    # A4 營業時間
    hrs = await pg.evaluate("(()=>({hours:(PLACES.hours||{}).aoki||null, open1030:PLACES.isOpen('aoki',10.5,%d), open2130:PLACES.isOpen('aoki',21.5,%d)}))()" % (DAY, DAY))
    print('  [A4] PLACES.hours.aoki＝%s' % J(hrs), flush=True)
    for h in (10.5, 21.5):
        tag = 'A4_' + hhmm(h).replace(':', '')
        await load(pg, cdp, 'gongguan', DOORX['aoki'], 15.0, h, '青木茶室門前')
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        it = await pg.evaluate(FIND_JS % J({'at': [DOORX['aoki'], 21.0]}))
        if not it:
            check('[%s] 門口有互動點（進入或打烊的字）' % tag, False, 'null'); continue
        await L.go_to(pg, cdp, Run(), it['x'], it['z'], 1.2, '青木茶室門口')
        await pg.wait_for_timeout(1000); s = await pg.evaluate(ST); label = s['interact']
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
        lines, menus, odd = await converse(pg, cdp, tag, None, 30)
        s = await pg.evaluate(ST); txt = [label] + lines + [s['toast']]
        await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
        check('[%s] %s：不能進青木茶室（zone 還是公館）' % (tag, hhmm(h)), s['zone'] == 'gongguan', J({k: s[k] for k in ('zone', 'x', 'z')}))
        check('[%s] %s：有打烊的字（門口的字、對話或 toast）' % (tag, hhmm(h)), any(any(w in t for w in CLOSED_WORDS) for t in txt if t), J(txt))
        await stuck_check(pg, cdp, tag, fb0, e0, errs)
    # A5 手機快速前往
    await load(pg, cdp, 'gongguan', -40.0, 12.0, 15.0, '公館人行道（之前已經進過青木茶室：這一次讀檔的存檔是新的，地點清單照遊戲的規則）')
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(900)
    keys = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-place]')].map(e=>e.getAttribute('data-place'))")
    sel = '#phoneBody [data-place^="aoki|"]'
    has = any(k.startswith('aoki|') for k in keys)
    check('A5 手機「地點」有青木茶室', has, J(keys))
    if has:
        await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })(%s)" % J(sel)); await pg.wait_for_timeout(600)
        await L.tap(pg, cdp, sel)
        ok = await wait_js(pg, "GAME.G.zone==='aoki'&&!GAME.E.player.busy", 60); await converse(pg, cdp, 'A5', None, 20)
        s = await pg.evaluate(ST)
        check('A5 快速前往到青木茶室（zone aoki）', ok and s['zone'] == 'aoki', J({k: s[k] for k in ('zone', 'x', 'z', 'hour')}))
        await pg.screenshot(path=os.path.join(OUT, 'A5_quick.png'))
    else:
        await L.close_panels(pg, cdp)
    await stuck_check(pg, cdp, 'A5', fb0, e0, errs)


async def case_yejian(pg, cdp, errs):
    print('== yejian 頁間書屋 v2', flush=True)
    sp = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN&&Z3.SHOP_IN.bookstore; return q?{x:q.x,z:q.z}:null; })()")
    check('Y 有 Z3.SHOP_IN.bookstore（頁間書屋 v2 進門站的地方）', bool(sp), J(sp))
    if not sp: return
    blocks = await pg.evaluate(BLOCKS_JS)
    await load(pg, cdp, 'bookstore', sp['x'], sp['z'], 14.0, '頁間書屋進門的地方')
    seats = await pg.evaluate(SEATS_JS)
    check('Y1 座位 16 個、都標可以讀書', len(seats) == 16 and all(q['study'] for q in seats), J([[q['sx'], q['sz'], q['study']] for q in seats]))
    def cm(t, menu, s):
        st = [c for c in menu if c.startswith('讀書')]
        check('[%s] 座位選單有「讀書」' % t, bool(st), J(menu))
    for i in range(len(seats)):
        if SEATSEL and i not in SEATSEL: continue
        if i > 0: await load(pg, cdp, 'bookstore', sp['x'], sp['z'], 14.0, '頁間書屋進門的地方（每一張重讀：讀書的時段次數是新的）')
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        res = await sit_each(pg, cdp, 'Y1', seats, i, ['讀書', ''], cm)
        if not res: continue
        sm = res['samples']
        reading = [q for q in sm if q[1] and q[0] in ('sit', 'read')]
        check('[Y1_seat%02d] 按讀書以後：讀書時 P.seat 有、pose sit／read' % i, len(reading) >= 2, J(sorted(set(q[0] or '' for q in sm))))
        lines = res['lines']
        print('  [Y1_seat%02d] 讀書的台詞：%s' % (i, J(lines[-4:])), flush=True)
        if res['sit']:
            slide = math.hypot(res['sit'][0] - res['p0'][0], res['sit'][1] - res['p0'][1]); off = math.hypot(res['sit'][0] - res['seat'][0], res['sit'][1] - res['seat'][1])
            print('INFO [Y1_seat%02d] 座位 %s：按下去的位置 %s → 坐好 %s（移動 %.2f m、離座位 %.2f m）' % (i, J(res['seat']), J(res['p0']), J(res['sit']), slide, off), flush=True)
            if abs(res['seat'][0] - 4.7) < 0.05 and abs(res['seat'][1] + 3.65) < 0.05:
                thru = [q for q in sm if any(abs(q[2] - b[0]) < b[2] / 2 - 0.05 and abs(q[3] - b[1]) < b[3] / 2 - 0.05 for b in blocks) and not q[1]]
                obs('[Y1_seat%02d] 沙發東邊那張：坐下前後移動 %.2f m（BB：約 1.3 m）、離座位 %.2f m；走路途中（還沒坐下）踩進配置阻擋的取樣 %d 筆' % (i, slide, off, len(thru)), J(thru[:4]))
                await stuck_check(pg, cdp, 'Y1_sofa_east', fb0, e0, errs, soft=True)
                continue
        await stuck_check(pg, cdp, 'Y1_seat%02d' % i, fb0, e0, errs)
    # Y2 買書、打工告示
    await load(pg, cdp, 'bookstore', sp['x'], sp['z'], 14.0, '頁間書屋進門的地方')
    for tag, at, lb in (('Y2_book', [-4.0, -3.9], '看看法律書與文具'), ('Y2_job', [-4.0, 3.6], '')):
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        it = await pg.evaluate(FIND_JS % J({'at': at}))
        if not check('[%s] (%s,%s) 有互動點' % (tag, at[0], at[1]), bool(it), J(it)): continue
        if not await walk_tap(pg, cdp, tag, {'at': at}, lb or it['label']): continue
        await pg.wait_for_timeout(1500)
        s = await pg.evaluate(ST); first = {k: s[k] for k in ('dlg', 'choices', 'toast')}
        lines, menus, odd = await converse(pg, cdp, tag, None, 120)
        check('[%s] 按「%s」有反應（對話、選單或 toast）' % (tag, it['label']), bool(first['dlg'] or first['choices'] or first['toast'] or lines or menus), J({'first': first, 'lines': lines[:4], 'menus': menus[:2]}))
        await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
        await stuck_check(pg, cdp, tag, fb0, e0, errs)
    # Y3 找書的女生
    await pg.wait_for_timeout(3000)
    g = await pg.evaluate(GIRL_JS)
    print('  [Y3] 找書的女生：%s' % J(g), flush=True)
    if g['want']:
        wx, wz = g['want']['at'][0], g['want']['at'][1]
        cand = sorted([n for n in g['npcs'] if not n['clerk']], key=lambda n: math.hypot(n['x'] - wx, n['z'] - wz))
        n = cand[0] if cand else None
        ok = bool(n) and math.hypot(n['x'] - wx, n['z'] - wz) < 1.0
        check('Y3 場景裡有找書的女生（在配置的 (%.2f, %.2f) 1 m 內）' % (wx, wz), ok, J(n))
        if ok:
            wall = -4.78 + 0.22
            d = round(n['z'] - wall, 2)
            check('Y3 她在書牆前（到書牆正面 z %.2f 的距離 %.2f m ≤ 1.2）' % (wall, d), 0 <= d <= 1.2, J(n))
    else:
        check('Y3 pool_story.js 有頁間書屋的位置', False, J(g))
    await pg.screenshot(path=os.path.join(OUT, 'Y3_girl.png'))


async def park_check(pg, cdp, tag, errs):
    await wait_js(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 30)
    c = await pg.evaluate(PCHK)
    print('  [%s] 車：%s' % (tag, J(c)), flush=True)
    check('[%s] 車在溫州街、場景裡看得到' % tag, c['zone'] == 'wenzhou' and c['parked'], J(c))
    check('[%s] 車在 A5 附近（%.2f m ≤ BIKE.MAXD %s）' % (tag, c['dA5'], c['maxd']), c['dA5'] <= c['maxd'], J(c))
    check('[%s] 停車位置合法（BIKE.parkOK：站得住、不擋出入口）' % tag, c['ok'], J(c))
    check('[%s] 車身不碰任何門口（0.6 m）' % tag, c['hit'] is not None and not c['hit'] and c['nDoors'] > 0, J(c['hit']))
    check('[%s] 不在騎樓（|z| < 3.0）' % tag, abs(c['z']) < 3.0, str(c['z']))
    await pg.screenshot(path=os.path.join(OUT, '%s_parked.png' % tag))


async def mount_bike(pg, cdp, tag):
    k = await pg.evaluate(BK)
    if not k['parked']: check('[%s] 場景裡有停著的車' % tag, False, J(k)); return False
    for cand in await pg.evaluate(FARSIDE_JS % J(k['parked'])):
        await L.go_to(pg, cdp, Run(), cand['x'], cand['z'], 0.3, '車旁邊')
        await pg.wait_for_timeout(900)
        if (await pg.evaluate(ST))['interact'].startswith('騎腳踏車'): break
    s = await pg.evaluate(ST)
    if not check('[%s] 車旁邊出現「騎腳踏車」' % tag, s['interact'].startswith('騎腳踏車'), s['interact']): return False
    await L.tap(pg, cdp, '#interact')
    return check('[%s] 上車' % tag, await wait_js(pg, "!!GAME.E.player.riding", 30))


async def case_wzbike(pg, cdp, errs):
    print('== wzbike 溫州街日和的單車', flush=True)
    await load(pg, cdp, 'wenzhou', 40.0, 0.4, 15.0, '算停車位用（下一次讀檔才把車放進去）')
    spots = await pg.evaluate(SPOTS_JS)
    a5 = (45.8, 3.8)
    spots = sorted([q for q in spots if 8 < math.hypot(q['x'] - a5[0], q['z'] - a5[1]) < 40], key=lambda q: math.hypot(q['x'] - 40, q['z']))
    if not check('B 溫州街有離 A5 8～40 m 的合法停車處', bool(spots), J(spots[:3])): return
    sp = spots[0]
    bike = {'zone': 'wenzhou', 'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw'], 'riding': False, 'kind': 'city', 'color': None, 'owned': [{'kind': 'city', 'color': None}]}
    await load(pg, cdp, 'wenzhou', 40.0, 0.4, 15.0, '車停在溫州街 %s' % J([sp['x'], sp['z']]), extra={'bike': bike})
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if not await mount_bike(pg, cdp, 'B1'): return
    # B1 騎著進門
    if not await enter_via(pg, cdp, 'B1_in', {'label': '進入日和便利店'}, '進入日和便利店', 'cvs', near=0.6): return
    k = await pg.evaluate(BK); c = await pg.evaluate("(()=>{ const s=GAME.G.bike||{}, a=WZS.AA413.cvs.enter; return {zone:s.zone, d:+Math.hypot(s.x-a.x,s.z-a.z).toFixed(2), maxd:BIKE.MAXD, from:GAME.G.flags.CVS_FROM||null}; })()")
    check('B1 騎著進 A5 日和：先下車、G.bike.zone＝wenzhou、在 A5 附近（cb1d84290）', not k['riding'] and c['zone'] == 'wenzhou' and c['d'] <= c['maxd'], J(c))
    await stuck_check(pg, cdp, 'B1_inside', fb0, e0, errs)
    if await reload_continue(pg, cdp, 'B1_save_in_shop'):
        c2 = await pg.evaluate("(()=>({zone:GAME.G.zone, bike:(GAME.G.bike||{}).zone, from:GAME.G.flags.CVS_FROM||null}))()")
        check('B1 在店裡存檔 → 重新整理 → 繼續：人在店裡、G.bike.zone 還是 wenzhou', c2['zone'] == 'cvs' and c2['bike'] == 'wenzhou', J(c2))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if not await go_out(pg, cdp, 'B1_out', 'wenzhou'): return
    await park_check(pg, cdp, 'B1', errs)
    await stuck_check(pg, cdp, 'B1_out', fb0, e0, errs)
    # B2 騎到門口按下車、走進去
    if not await mount_bike(pg, cdp, 'B2'): return
    await L.go_to(pg, cdp, Run(), 45.8, 1.6, 1.0, 'A5 門口（騎車）')
    await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(2000)
    k = await pg.evaluate(BK)
    check('B2 在 A5 門口按「下車」', not k['riding'] and bool(k['parked']), J(k))
    await pg.screenshot(path=os.path.join(OUT, 'B2_dismount_at_door.png'))
    if not await enter_via(pg, cdp, 'B2_in', {'label': '進入日和便利店'}, '進入日和便利店', 'cvs', near=0.6): return
    if not await go_out(pg, cdp, 'B2_out', 'wenzhou'): return
    await park_check(pg, cdp, 'B2', errs)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await stuck_check(pg, cdp, 'B2_out', fb0, e0, errs)


async def case_art(pg, cdp, errs):
    print('== art 截圖', flush=True)
    for key in ('cvs', 'aoki', 'yejian'):
        dx = DOORX[key]
        await load(pg, cdp, 'gongguan', dx, 15.0, 14.0, '%s 門前' % key)
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        await L.go_to(pg, cdp, Run(), dx, 15.0, 0.6, '%s 門前 6 m' % key)
        await L.turn_camera_to(pg, cdp, dx, 22.0); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'art_%s_door.png' % key)); print('  [art] art_%s_door.png' % key, flush=True)
        if await enter_via(pg, cdp, 'art_' + key, {'label': DOORLB[key]}, DOORLB[key], ZONE[key], near=1.2):
            await wait_js(pg, "!!(GAME.E.zone&&GAME.E.zone.formal!==false)", 30); await pg.wait_for_timeout(3000)
            s = await pg.evaluate(ST)
            await L.turn_camera_to(pg, cdp, s['x'], s['z'] - 5.0); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=os.path.join(OUT, 'art_%s_inside.png' % key)); print('  [art] art_%s_inside.png（進門站的地方 (%s,%s)、面向 −z）' % (key, s['x'], s['z']), flush=True)
            await stuck_check(pg, cdp, 'art_' + key, fb0, e0, errs)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for name, fn in (('cvs', case_cvs), ('aoki', case_aoki), ('yejian', case_yejian), ('wzbike', case_wzbike), ('art', case_art)):
            if name in CASES:
                try: await fn(pg, cdp, errs)
                except Exception as e: check('[%s] 探針本身沒有例外' % name, False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
