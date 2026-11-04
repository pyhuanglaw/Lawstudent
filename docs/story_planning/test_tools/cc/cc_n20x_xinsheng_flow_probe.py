"""CC（帳號 A）11-04：N20X 新生南路＋木曜日 真實流程探針（開發分支 aa8cb5beb；BB 00:29）。
不用 ?turbo、不瞬移；讀檔只當起點前置（印「[前置／捷徑]」）；走路用點地面（遊戲自己的找路）＋搖桿（playlib.go_to），互動一律按 #interact、選單按按鈕。
座標、標籤照 aa8cb5beb 的 src：
  src/mokuyobi3d.js：溫州街「上二樓（木曜日）」(7.4, −4.55) r1.4 → wz_mokuyobi 出生 IN (−3.75, 6.6, lv0)；
      樓梯 x −4.5～−3.0、z 2.54～7.0（16 階、往北爬到 3.2 m）、平台 z 1.54～2.54（lv1）、店門 (−3.0, 2.065)；「離開木曜日」(−3.75, 6.75, lv0) r1.0 → 溫州街 OUT (7.4, −4.15)
  src/data/mokuyobi_layout.js：24 席都 canStudy；窗邊「坐窗邊」(−1.45, 6.15)…；點餐／書櫃／唱片機／海報的 interact 還沒接（只記，不算 FAIL）
  src/zones3d.js：溫州街「往新生南路」(−33.4, −28.4) r2.2 → xinsheng (−29.4, −1.4)；校園「往新生南路（側門）」(−122.6, −84) r2.0 → xinsheng (15, 10)
  src/xinsheng3d.js＋xinsheng_layout.js：「回到首都帝大（新生南路側門）」(16.8, 10) r2.2 → campus (−122, −84)；「往溫州街」(−31, −1.4) r2.4 → wenzhou (−33.4, −27)
CASES：
  a 溫州街 B4 →「上二樓（木曜日）」→ 走樓梯上去（樓梯中段、上段截圖＋鏡頭射線）→ 進店 → 走到窗邊座位「坐窗邊」→「讀書」→ 讀完起身
     → 下樓（樓梯截圖＋射線）→「離開木曜日」→ 回到溫州街
  b 溫州街西段 →「往新生南路」→ 新生南路（截圖）→ 走過側門前的斑馬線 → 側門（截圖）→「回到首都帝大」→ 校園
  c 校園校門內側 (−110, 0) → 西側圍牆北段「往新生南路（側門）」（截圖）→ 新生南路 →「往溫州街」→ 溫州街
  shots 17:20（傍晚）另外讀檔：B4 外觀兩張、新生南路、木曜日店裡
  facade（BB 追加，d5138cd27 起有正式立面 74557a245）：側門往南、往北各一張；沿騎樓走到 layout 七家店門口（山嵐、南洋、大口漢堡、同弦、大步、好拍、新生運動廣場），
     跟隨鏡頭轉向店門截圖、記互動按鈕；再走「往溫州街」拍日常失速（W2 轉角，還沒有 3D）、木曜日（B4）。只拍紀錄，不判 FAIL（換區那一步照 go_exit 檢查）。
每一段記：區域換對沒（GAME.G.zone／E.zone）、出生點（E.lastSpawn 的 fixed 和要求的位置差多少、站得住、搖桿推一下有沒有位移）、
  GAME.walkFallbacks（要 0）、JS 例外（pageerror）。
只記狀態、不算 FAIL：新生南路是 BLOCKOUT（沒有正式立面）；木曜日點餐／書櫃／唱片機／海報還沒接；公館往溫州街的巷子還在；鏡頭射線（WARN）；出生點落在出口按鈕範圍內（WARN）。
Playwright 手機模擬（橫向 844×390），不是 iPhone 實機。
用法：LW_TESTS=<wt>/tests [CASES=a,b,c,shots,facade] [FACADE_WZ=0] [CC_HEADLESS=0] python3 cc_n20x_xinsheng_flow_probe.py <url> <out>"""
import os, sys, json, math, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/cc_n20x_xinsheng'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'a,b,c,shots').split(',') if c.strip()]
HEADLESS = os.environ.get('CC_HEADLESS', '1') != '0'
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
DAYKEY = '2025-09-27'   # 週六：沒有課、沒有系學會合照（09-19 15:40～16:00）那種會跳「出發：」的劇情選單
FAILS, WARNS, OBS = [], [], []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def warn(name, info=''):
    print('WARN ' + name + (('  ' + info) if info else ''), flush=True); WARNS.append(name)


def obs(name, info=''):
    print('OBS  ' + name + (('  ' + info) if info else ''), flush=True); OBS.append(name + ('：' + info if info else ''))


class Run:   # playlib.go_to 要的最小介面
    def __init__(self): self.t0 = time.time()
    def note(self, s): print('  [%6.1fs] %s' % (time.time() - self.t0, s), flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


RUN = Run()
SHOT_N = [0]


async def shot(pg, label):
    SHOT_N[0] += 1; p = os.path.join(OUT, '%02d_%s.png' % (SHOT_N[0], label))
    try: await pg.screenshot(path=p)
    except Exception as e: print('  截圖失敗', e)
    print('  截圖 ' + p, flush=True); return p


FIND_EX = """(([lb,x,z])=>{ const its=GAME.E.interactables.filter(i=>(i.label||'').startsWith(lb)); if(!its.length) return null;
  its.sort((a,b)=>((x===null)?0:Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)));
  const it=its[0]; return {x:it.x,z:it.z,r:it.radius||1.5,label:it.label,lv:it.lv===undefined?null:it.lv,n:its.length,
    to:it.exit?it.exit.to:null, spawn:it.exit&&it.exit.spawn?it.exit.spawn:null, seat:!!it.seat, study:!!it.study}; })(%s)"""

ZST = """(()=>{ const E=GAME.E, G=GAME.G, P=E.player, o=P.obj.position; const ld=document.getElementById('loading');
  return {zone:G.zone, ezone:E.zone&&E.zone.id||null, x:+o.x.toFixed(2), z:+o.z.toFixed(2), y:+o.y.toFixed(2), lv:P.lv|0,
    loading:!!(ld&&!ld.classList.contains('hide')), last:E.lastSpawn||null, stand:E.canStand?E.canStand(o.x,o.z,0.3):null,
    fb:GAME.walkFallbacks||0, hour:+G.hour.toFixed(2), study:(G.stats&&G.stats.study)||0, pose:P.pose||null}; })()"""

# 鏡頭射線：從鏡頭打到玩家頭部（腳底 +1.55 m），記前幾個打到的網格；反方向從頭部打回鏡頭（鏡頭是不是在牆後面／牆裡面）
CAMRAY = """(()=>{ const E=GAME.E, cam=E.camera, P=E.player, o=P.obj.position; const head=new THREE.Vector3(o.x,o.y+1.55,o.z);
  const mine=x=>{ for(let p=x;p;p=p.parent) if(p===P.obj) return true; return false; };
  const vis=x=>{ for(let p=x;p;p=p.parent) if(p.visible===false) return false; return true; };
  const nm=x=>{ const a=[]; for(let p=x;p&&a.length<3;p=p.parent) if(p.name) a.push(p.name); return a.join('<')||x.type; };
  const cast=(from,to)=>{ const d=to.clone().sub(from), L=d.length(); d.normalize(); const rc=new THREE.Raycaster(from,d,0.02,L); rc.camera=cam; let hs=[];
    try{ hs=rc.intersectObjects(E.scene.children,true); }catch(e){ return {err:String(e).slice(0,120),L}; }
    const out=[]; for(const h of hs){ const m=h.object; if(!(m.isMesh||m.isSkinnedMesh||m.isInstancedMesh)) continue;
      const mat=Array.isArray(m.material)?m.material[(h.face&&h.face.materialIndex)|0]:m.material;
      out.push({name:nm(m), d:+h.distance.toFixed(2), player:mine(m), vis:vis(m)&&!!mat&&mat.visible!==false, op:mat?+(mat.transparent?mat.opacity:1).toFixed(2):null});
      if(out.length>=6) break; }
    return {L:+L.toFixed(2), hits:out}; };
  const fwd=cast(cam.position.clone(),head), back=cast(head,cam.position.clone());
  const block=(fwd.hits||[]).find(h=>h.vis&&!h.player&&h.op>0.3&&h.d<fwd.L-0.05)||null;
  const backBlock=(back.hits||[]).find(h=>h.vis&&!h.player&&h.op>0.3&&h.d<back.L-0.05)||null;
  return {zone:GAME.G.zone, lv:P.lv|0, player:[+o.x.toFixed(2),+o.y.toFixed(2),+o.z.toFixed(2)], cam:[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)],
    yaw:+E.cam.yaw.toFixed(2), pitch:+(E.cam.pitch||0).toFixed(2), dist:fwd.L, first:(fwd.hits||[])[0]||null, block, backBlock, fwd:fwd.hits||fwd.err, back:back.hits||back.err}; })()"""


async def cam_ray(pg, tag):
    r = await pg.evaluate(CAMRAY)
    print('  鏡頭射線 %s：%s' % (tag, J(r)), flush=True)
    if r.get('block'):
        warn('%s：鏡頭到玩家頭部之間先打到不透明的「%s」（%.2f m／全長 %.2f m）——看不到人或鏡頭穿牆' % (tag, r['block']['name'], r['block']['d'], r['dist']))
    elif r.get('backBlock'):
        warn('%s：從頭部打回鏡頭先打到「%s」（%.2f m）——鏡頭可能在牆後面／牆裡面' % (tag, r['backBlock']['name'], r['backBlock']['d']))
    else:
        obs('%s：鏡頭到頭部之間沒有不透明的東西' % tag, '第一個打到：%s' % J(r.get('first')))
    return r


async def zst(pg):
    return await pg.evaluate(ZST)


async def wait_zone(pg, zone, max_s=90):
    t0 = time.time(); s = None
    while time.time() - t0 < max_s:
        s = await zst(pg)
        if s['zone'] == zone and s['ezone'] == zone and not s['loading'] and s['last'] and s['last'].get('zone') == zone:
            await pg.wait_for_timeout(2500); return await zst(pg)
        await pg.wait_for_timeout(500)
    return s


async def btns(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>({t:(b.textContent||'').trim(), dim:b.classList.contains('dim')}))")


async def tap_choice(pg, cdp, prefix):
    bs = await btns(pg)
    i = next((k for k, b in enumerate(bs) if b['t'].startswith(prefix)), None)
    if i is None: return None
    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); return bs[i]['t']


async def approach(pg, cdp, tag, label, near_xz=None, lv=None, near=None):
    """走到互動點、等按鈕出現；回傳互動點資料（含出口要去的區域、出生點）或 None"""
    it = await pg.evaluate(FIND_EX % J([label, near_xz[0] if near_xz else None, near_xz[1] if near_xz else None]))
    if not check('%s：有「%s」互動點' % (tag, label), bool(it), J(it)): return None
    nr = near if near is not None else min(1.2, it['r'] * 0.6)
    ok = await L.go_to(pg, cdp, RUN, it['x'], it['z'], nr, label, lv=lv if lv is not None else it['lv'])
    check('%s：走到「%s」' % (tag, label), ok)
    for k in range(3):
        await pg.wait_for_timeout(900)
        s = await L.state(pg)
        if (s.get('interact') or '').startswith(label[:6]): break
        RUN.note('按鈕是「%s」不是「%s」，再往互動點靠近一點（第 %d 次）' % (s.get('interact'), label, k + 1))
        await L.go_to(pg, cdp, RUN, it['x'], it['z'], max(0.3, nr * 0.5), label, max_s=90, lv=lv if lv is not None else it['lv'])
    s = await L.state(pg)
    check('%s：互動按鈕是「%s」' % (tag, label), (s.get('interact') or '').startswith(label[:6]), s.get('interact'))
    return it


async def go_exit(pg, cdp, errs, tag, label, want_zone, near_xz=None, lv=None):
    """走到出口、按互動、等換區；檢查區域、出生點、能不能走、walkFallbacks、JS 例外。回傳換區後的狀態或 None"""
    s0 = await zst(pg); e0 = len(errs)
    it = await approach(pg, cdp, tag, label, near_xz, lv)
    if not it: return None
    check('%s：「%s」通往 %s' % (tag, label, want_zone), it['to'] == want_zone, J({'to': it['to'], 'spawn': it['spawn']}))
    await L.tap(pg, cdp, '#interact')
    s = await wait_zone(pg, want_zone)
    check('%s：換到 %s（G.zone＝%s、E.zone＝%s）' % (tag, want_zone, s and s['zone'], s and s['ezone']), bool(s) and s['zone'] == want_zone and s['ezone'] == want_zone, J(s))
    if not s or s['zone'] != want_zone: return None
    await spawn_checks(pg, cdp, tag, it['spawn'], s)
    check('%s：這一段 walkFallbacks 沒有增加（%d → %d）' % (tag, s0['fb'], s['fb']), s['fb'] == s0['fb'])
    check('%s：這一段沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    return s


async def spawn_checks(pg, cdp, tag, want, s):
    ls = s['last'] or {}; fx = ls.get('fixed') or [None, None]
    print('  出生點 %s：要求 %s；E.lastSpawn %s；現在 %s' % (tag, J(want), J(ls), J({k: s[k] for k in ('x', 'z', 'y', 'lv', 'stand')})), flush=True)
    if want and fx[0] is not None:
        d = math.hypot(fx[0] - want['x'], fx[1] - want['z'])
        if d > 0.05: warn('%s：出生點被引擎挪了 %.2f m（要求 (%s, %s) → fixed %s；unstick 或舊配置搬位置）' % (tag, d, want['x'], want['z'], J(fx)))
        else: obs('%s：出生點沒被挪（fixed＝要求的位置）' % tag)
        if want.get('lv') is not None: check('%s：出生在第 %s 層' % (tag, want.get('lv')), (ls.get('lv') or 0) == (want.get('lv') or 0), J(ls))
    check('%s：出生點站得住（E.canStand）' % tag, s['stand'] is not False, J(s['stand']))
    # 出生點落在「回去」那個出口的按鈕範圍內：一到就看到回頭的按鈕（WARN；校園 campus 的萬才館寫「出生點離互動點 2.2 m，不會一出來就跳出按鈕」）
    await pg.wait_for_timeout(800); st = await L.state(pg)
    if st.get('interact'): obs('%s：一到就有互動按鈕「%s」' % (tag, st['interact']))
    moved, n, s2 = await L.push_until(pg, cdp, 0, -40, 0.3, max_pushes=3, ms=1200)
    check('%s：換區後搖桿往前推有位移（%.2f m，推 %d 次）' % (tag, moved, n), moved >= 0.3, J({k: s2[k] for k in ('x', 'z', 'lv', 'y')}))


async def setup(pg, cdp, zone, x, z, yaw, hour, lv=None, why='', daykey=None, weather='clear', extra=None):
    dk = daykey or DAYKEY
    day = await pg.evaluate("STORY.dayOfKey(%s)" % J(dk))
    wd = await pg.evaluate("new Date(%s+'T12:00:00').getDay()" % J(dk))
    pos = {'x': x, 'z': z, 'yaw': yaw}
    if lv is not None: pos['lv'] = lv
    st = {'zone': zone, 'hour': hour, 'day': day, 'weekday': wd, 'weather': weather, 'flags': FLAGS, 'pos': pos}
    if extra: st.update(extra)
    print('  [前置／捷徑] 讀檔：%s（day %s、weekday %s）%02d:%02d %s %s 天氣 %s%s；條件事件關閉、手機自動訊息關閉。%s' % (dk, day, wd, int(hour), round(hour % 1 * 60), zone, J(pos), weather, ('；另外 ' + J(extra)) if extra else '', why), flush=True)
    await pg.evaluate("STORY.phoneAuto=()=>{}")
    await L.load_state(pg, st, quiet_events=True)
    s = await wait_zone(pg, zone)
    await pg.evaluate("STORY.phoneAuto=()=>{}")
    await pg.wait_for_timeout(4000)
    if hasattr(L, 'close_panels'): await L.close_panels(pg, cdp)   # aa8cb5beb 的 tests/playlib.py 有；舊版沒有就跳過
    s = await zst(pg)
    print('  讀檔後：%s' % J(s), flush=True)
    return s


async def study_here(pg, cdp, tag):
    s0 = await zst(pg)
    await L.tap(pg, cdp, '#interact')
    picked = None; t0 = time.time()
    while time.time() - t0 < 40 and not picked:
        await pg.wait_for_timeout(700)
        bs = await btns(pg)
        if bs:
            print('  選單：%s' % J(bs), flush=True)
            if any(b['t'].startswith('什麼都不點') for b in bs):   # a8c485729 起（AA_618 1-2）：這一趟第一次坐下先點東西，再出座位選單
                await shot(pg, tag + '_order_menu'); await tap_choice(pg, cdp, '什麼都不點'); continue
            await shot(pg, tag + '_seat_menu')
            picked = await tap_choice(pg, cdp, '讀書')
            if not picked: break
            continue
        if (await L.state(pg))['dlg']: await L.tap(pg, cdp, '#dlg')
    if not check('%s：座位選單有「讀書」並選了它' % tag, bool(picked), str(picked)): return
    t0 = time.time(); seen = []; last = None
    while time.time() - t0 < 240:
        await pg.wait_for_timeout(800)
        bs = await btns(pg); s = await L.state(pg)
        if bs:
            seen.append([b['t'][:24] for b in bs])
            i = next((k for k, b in enumerate(bs) if not b['dim'] and not b['t'].startswith(('算了', '起身'))), None)
            if i is None: print('  選單只剩 %s' % J(bs), flush=True); break
            print('  選：%s' % bs[i]['t'][:40], flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); continue
        if s['dlg']:
            sig = s['dtext']
            if sig != last: print('  對話：%s' % sig, flush=True); last = sig
            await L.tap(pg, cdp, '#dlg'); continue
        z = await zst(pg)
        if z['study'] > s0['study'] and not s['busy']: break
    await pg.wait_for_timeout(1500)
    s1 = await zst(pg)
    print('  讀書前 %s；讀書後 %s；看到的選單 %s' % (J({k: s0[k] for k in ('hour', 'study')}), J({k: s1[k] for k in ('hour', 'study', 'pose')}), J(seen[:4])), flush=True)
    check('%s：讀了書（G.stats.study %d → %d、時間 %.2f → %.2f）' % (tag, s0['study'], s1['study'], s0['hour'], s1['hour']), s1['study'] > s0['study'] and s1['hour'] > s0['hour'])
    await shot(pg, tag + '_after_study')


async def case_a(pg, cdp, errs):
    print('== a 溫州街 B4 → 木曜日（上樓、坐下讀書、下樓）→ 溫州街', flush=True)
    await setup(pg, cdp, 'wenzhou', 9.5, 0.5, math.pi, 14.0, why='B4 鐵門 (7.4, −4.55) 東南邊 4.6 m 的巷子中間，面向北；14:00＝a8c485729 起木曜日營業 13–22（週六）')
    s = await go_exit(pg, cdp, errs, 'a1 溫州街→木曜日', '上二樓（木曜日）', 'wz_mokuyobi', (7.4, -4.55))
    if not s: return
    await shot(pg, 'a_mok_stair_bottom'); await cam_ray(pg, 'a 樓梯底（剛進來）')
    fb0 = (await zst(pg))['fb']; e0 = len(errs)
    ok = await L.go_to(pg, cdp, RUN, -3.75, 5.3, 0.6, '樓梯中段（往上）', lv=0)
    check('a2 走到樓梯中段（第 0 層）', ok, J(await zst(pg)))
    await shot(pg, 'a_mok_stair_mid_up'); await cam_ray(pg, 'a 樓梯中段（往上）')
    ok = await L.go_to(pg, cdp, RUN, -3.75, 3.2, 0.6, '樓梯上段（往上）', lv=1)
    check('a2 走到樓梯上段（第 1 層）', ok, J(await zst(pg)))
    await shot(pg, 'a_mok_stair_top_up'); await cam_ray(pg, 'a 樓梯上段（往上）')
    ok = await L.go_to(pg, cdp, RUN, -3.75, 2.04, 0.5, '樓梯頂的平台', lv=1)
    z = await zst(pg)
    check('a2 爬到二樓平台（第 1 層、y≈3.2）', ok and z['lv'] == 1 and abs(z['y'] - 3.2) < 0.25, J(z))
    await cam_ray(pg, 'a 平台')
    ok = await L.go_to(pg, cdp, RUN, -1.8, 2.065, 0.5, '店門內', lv=1)
    check('a2 穿過店門進到店裡', ok, J(await zst(pg)))
    await L.turn_camera_to(pg, cdp, 1.5, 0.0)
    await shot(pg, 'a_mok_shop_inside'); await cam_ray(pg, 'a 店裡（進門）')
    it = await approach(pg, cdp, 'a3 找位子', '坐窗邊', (-1.45, 6.15), lv=1)
    if it:
        check('a3 窗邊座位能讀書（study）', it['study'], J(it))
        await study_here(pg, cdp, 'a3')
    # 還沒接的互動點（只記）
    for lb in ('點東西', '看看書櫃', '看唱片機', '看海報'):
        f = await pg.evaluate(FIND_EX % J([lb, None, None]))
        obs('a 木曜日「%s」互動點%s' % (lb, '有' if f else '還沒接（照 BB：只記狀態）'), J(f) if f else '')
    z = await zst(pg)
    check('a3 這一段（上樓、讀書）walkFallbacks 沒有增加（%d → %d）' % (fb0, z['fb']), z['fb'] == fb0)
    check('a3 這一段沒有 JS 例外', len(errs) == e0, J(errs[e0:e0 + 3]))
    fb0 = z['fb']; e0 = len(errs)
    ok = await L.go_to(pg, cdp, RUN, -3.75, 2.04, 0.5, '回到平台', lv=1)
    check('a4 走回樓梯頂平台', ok, J(await zst(pg)))
    ok = await L.go_to(pg, cdp, RUN, -3.75, 3.8, 0.6, '樓梯上段（往下）', lv=1)
    check('a4 下到樓梯上段', ok, J(await zst(pg)))
    await shot(pg, 'a_mok_stair_top_down'); await cam_ray(pg, 'a 樓梯上段（往下）')
    ok = await L.go_to(pg, cdp, RUN, -3.75, 5.6, 0.6, '樓梯中段（往下）', lv=0)
    check('a4 下到樓梯中段（換回第 0 層）', ok, J(await zst(pg)))
    await shot(pg, 'a_mok_stair_mid_down'); await cam_ray(pg, 'a 樓梯中段（往下）')
    z = await zst(pg)
    check('a4 下樓這一段 walkFallbacks 沒有增加（%d → %d）' % (fb0, z['fb']), z['fb'] == fb0)
    check('a4 下樓這一段沒有 JS 例外', len(errs) == e0, J(errs[e0:e0 + 3]))
    s = await go_exit(pg, cdp, errs, 'a5 木曜日→溫州街', '離開木曜日', 'wenzhou', (-3.75, 6.75), lv=0)
    if s: await shot(pg, 'a_back_wenzhou')


async def case_b(pg, cdp, errs):
    print('== b 溫州街西側橫巷北口 → 新生南路 → 側門 → 校園', flush=True)
    await setup(pg, cdp, 'wenzhou', -26.0, 0.5, math.pi / 2, 10.0, why='主巷西段，橫巷口東邊 7 m')
    s = await go_exit(pg, cdp, errs, 'b1 溫州街→新生南路', '往新生南路', 'xinsheng', (-33.4, -28.4))
    if not s: return
    await L.turn_camera_to(pg, cdp, 0.0, -1.4)
    await shot(pg, 'b_xinsheng_arrive'); await cam_ray(pg, 'b 新生南路（從溫州街到）')
    fb0 = (await zst(pg))['fb']; e0 = len(errs)
    ok = await L.go_to(pg, cdp, RUN, 0.0, 10.0, 1.0, '側門前斑馬線中間（分隔島）')
    check('b2 走到側門前的斑馬線（分隔島）', ok, J(await zst(pg)))
    await L.turn_camera_to(pg, cdp, 18.4, 10.0); await shot(pg, 'b_xinsheng_crossing')
    ok = await L.go_to(pg, cdp, RUN, 12.0, 10.0, 1.0, '側門前人行道')
    check('b2 過斑馬線到校園那一側的人行道', ok, J(await zst(pg)))
    await L.turn_camera_to(pg, cdp, 18.4, 10.0); await shot(pg, 'b_sidegate_xinsheng_side'); await cam_ray(pg, 'b 側門前（新生南路側）')
    z = await zst(pg)
    check('b2 這一段 walkFallbacks 沒有增加（%d → %d）' % (fb0, z['fb']), z['fb'] == fb0)
    check('b2 這一段沒有 JS 例外', len(errs) == e0, J(errs[e0:e0 + 3]))
    s = await go_exit(pg, cdp, errs, 'b3 新生南路→校園', '回到首都帝大', 'campus', (16.8, 10.0))
    if s:
        await L.turn_camera_to(pg, cdp, -124.0, -84.0); await shot(pg, 'b_campus_sidegate_inside')


async def case_c(pg, cdp, errs):
    print('== c 校園 → 西側圍牆北段側門 → 新生南路 → 溫州街', flush=True)
    await setup(pg, cdp, 'campus', -110.0, 0.0, math.pi, 10.0, why='校門內側（xinsheng_unit 第 11 項：側門出生點走得到這裡），面向北')
    it = await pg.evaluate(FIND_EX % J(['往新生南路', -122.6, -84.0]))
    if it:
        fb0 = (await zst(pg))['fb']
        ok = await L.go_to(pg, cdp, RUN, -116.0, -84.0, 1.5, '側門內側（往新生南路之前）', lv=0)
        check('c1 從校門內側走到西側圍牆北段（側門內側）', ok, J(await zst(pg)))
        await L.turn_camera_to(pg, cdp, -124.0, -84.0); await shot(pg, 'c_campus_sidegate'); await cam_ray(pg, 'c 側門內側（校園）')
        check('c1 這一段 walkFallbacks 沒有增加', (await zst(pg))['fb'] == fb0)
    s = await go_exit(pg, cdp, errs, 'c2 校園→新生南路', '往新生南路', 'xinsheng', (-122.6, -84.0), lv=0)
    if not s: return
    await L.turn_camera_to(pg, cdp, -16.5, 10.0); await shot(pg, 'c_xinsheng_from_gate')
    s = await go_exit(pg, cdp, errs, 'c3 新生南路→溫州街', '往溫州街', 'wenzhou', (-31.0, -1.4))
    if s: await shot(pg, 'c_wenzhou_arrive'); await cam_ray(pg, 'c 溫州街（從新生南路到）')


async def case_shots(pg, cdp, errs):
    print('== shots 17:20 傍晚', flush=True)
    await setup(pg, cdp, 'wenzhou', 7.4, 1.0, math.pi, 17 + 20 / 60, why='B4 鐵門正南 5.5 m，面向北（鏡頭在背後）')
    await L.turn_camera_to(pg, cdp, 7.4, -8.0); await shot(pg, 'shots_B4_1720_front')
    it = await pg.evaluate(FIND_EX % J(['上二樓（木曜日）', 7.4, -4.55]))
    obs('shots B4 互動點', J(it))
    ok = await L.go_to(pg, cdp, RUN, 3.5, 2.5, 0.8, 'B4 斜前方')
    if ok:
        await L.turn_camera_to(pg, cdp, 8.5, -7.0); await shot(pg, 'shots_B4_1720_oblique')
    await setup(pg, cdp, 'xinsheng', 15.0, 10.0, -math.pi / 2, 17 + 20 / 60, why='側門內出生點，面向西（店面那一側）')
    await shot(pg, 'shots_xinsheng_1720_shops')
    await L.turn_camera_to(pg, cdp, 15.0, -30.0); await shot(pg, 'shots_xinsheng_1720_north')
    await setup(pg, cdp, 'wz_mokuyobi', -2.35, 2.065, math.pi / 2, 17 + 20 / 60, lv=1, why='木曜日店門內（layout 的 spawn），面向東')
    z = await zst(pg)
    check('shots 讀檔進木曜日二樓（第 1 層）', z['zone'] == 'wz_mokuyobi' and z['lv'] == 1, J(z))
    await L.turn_camera_to(pg, cdp, 2.0, 1.0); await shot(pg, 'shots_mok_1720_inside_east')
    await L.turn_camera_to(pg, cdp, 0.0, 6.5); await shot(pg, 'shots_mok_1720_window')
    await cam_ray(pg, 'shots 木曜日店裡')


# facade（BB 追加；正式立面 74557a245 起，d5138cd27 也有）：d5138cd27 的 src/data/xinsheng_layout.js 的 shops 是七家——
#   山嵐書店 z 10.2、南洋戲院 25.3、大口漢堡 40.4（側門以南）；同弦樂器 −7.2、大步球鞋 −16.7、好拍運動 −23.2、新生運動廣場 −33.0（以北）。
#   門口互動點在 (facade.x＋0.9＝−15.6, door.z)（xinsheng3d.js）；騎樓 x −16.5～−13（店面玻璃在 x −16.5）。
#   BB 名單裡的木曜日（溫州街 B4，37 號鐵門 (7.4, −4.55)）、日常失速（溫州街西側橫巷的轉角 W2，(−37.2, −13) 那棟；還沒有 3D、沒有互動點）不在新生南路 layout 裡：
#   從新生南路走「往溫州街」過去再拍（FACADE_WZ=0 可以不拍）。截圖只做紀錄，不判 FAIL（走不到、按鈕不對都只記 OBS）。
FACADE_SHOPS = [('shanlan', '山嵐書店', 10.2), ('nanyang', '南洋戲院', 25.3), ('dakou', '大口漢堡', 40.4),
                ('tongxian', '同弦樂器', -7.2), ('dabu', '大步球鞋', -16.7), ('haopai', '好拍運動', -23.2), ('xsports', '新生運動廣場', -33.0)]
FACADE_WZ = os.environ.get('FACADE_WZ', '1') != '0'
SHOPS_JS = """(()=>{ const L=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null; if(!L) return null; return L.shops.map(q=>({id:q.id,name:q.name,z:q.door.z})); })()"""
GLB_JS = """(()=>{ let n=0, fb=0, fbVis=0; GAME.E.scene.traverse(o=>{ if(/xinsheng_street_glb/.test(o.name||'')) n++; if(o.userData&&o.userData.xsfb){ fb++; let v=true; for(let p=o;p;p=p.parent) if(p.visible===false) v=false; if(v) fbVis++; } }); return {glbNodes:n, fallbackBoxes:fb, fallbackVisible:fbVis}; })()"""


async def facade_door(pg, cdp, tag, name, dz):
    ok = await L.go_to(pg, cdp, RUN, -15.0, dz, 0.9, name + '門口（騎樓）')
    await pg.wait_for_timeout(1200)
    await L.turn_camera_to(pg, cdp, -18.0, dz)
    st = await L.state(pg)
    it = await pg.evaluate(FIND_EX % J([name, -15.6, dz]))
    obs('%s %s 門口：%s；互動按鈕「%s」；互動點 %s' % (tag, name, '走到了' if ok else '沒走到', st.get('interact') or '（沒有）', J(it)), J({k: st[k] for k in ('x', 'z')}))
    await shot(pg, 'facade_%s' % tag)
    await cam_ray(pg, 'facade %s 門口' % name)


async def case_facade(pg, cdp, errs):
    print('== facade 新生南路正式立面（只拍紀錄，不判 FAIL）', flush=True)
    await setup(pg, cdp, 'xinsheng', 15.0, 10.0, -math.pi / 2, 10.0, why='側門內出生點（從校園進來的位置），面向西')
    await pg.wait_for_timeout(6000)   # 等 bldg.xinsheng_street（lazy）載完
    lay = await pg.evaluate(SHOPS_JS); g = await pg.evaluate(GLB_JS)
    obs('facade 這一版 layout 的店', J(lay))
    obs('facade 正式立面', J(g) + ('（方塊立面全藏起來了＝正式模型有接上）' if g['fallbackBoxes'] and not g['fallbackVisible'] else '（還看得到方塊立面 xsfb：正式模型可能還在載、或沒接上）'))
    if lay:
        names = {q['name'] for q in lay}
        miss = [n for _, n, _ in FACADE_SHOPS if n not in names]
        if miss: obs('facade 探針寫的店有幾家不在這一版 layout', J(miss))
    await L.turn_camera_to(pg, cdp, 15.0, 50.0); await shot(pg, 'facade_gate_look_south'); await cam_ray(pg, 'facade 側門往南')
    await L.turn_camera_to(pg, cdp, 15.0, -30.0); await shot(pg, 'facade_gate_look_north'); await cam_ray(pg, 'facade 側門往北')
    fb0 = (await zst(pg))['fb']; e0 = len(errs)
    ok = await L.go_to(pg, cdp, RUN, -14.8, 10.0, 1.0, '過側門前斑馬線到騎樓')
    obs('facade 過斑馬線到騎樓', '到了' if ok else '沒走到')
    shops = FACADE_SHOPS
    if lay:   # 以遊戲裡的 layout 為準（門口 z 照 layout；探針名單沒有的店也拍）
        zs = {q['name']: q['z'] for q in lay}
        shops = [(i, n, zs.get(n, z)) for i, n, z in FACADE_SHOPS if n in zs] + [(q['id'], q['name'], q['z']) for q in lay if q['name'] not in {n for _, n, _ in FACADE_SHOPS}]
    south = sorted([q for q in shops if q[2] >= 10.0 - 0.01], key=lambda q: q[2])
    north = sorted([q for q in shops if q[2] < 10.0 - 0.01], key=lambda q: -q[2])
    for sid, name, dz in south + north:   # 先往南（山嵐→南洋→大口），再沿騎樓往北走回來（同弦→大步→好拍→運動廣場）
        await facade_door(pg, cdp, sid, name, dz)
    z = await zst(pg)
    obs('facade 新生南路這一段 walkFallbacks %d → %d、JS 例外 %d 個' % (fb0, z['fb'], len(errs) - e0), J(errs[e0:e0 + 3]))
    if not FACADE_WZ: return
    s = await go_exit(pg, cdp, errs, 'facade 新生南路→溫州街', '往溫州街', 'wenzhou', (-31.0, -1.4))
    if not s: return
    ok = await L.go_to(pg, cdp, RUN, -33.2, -13.0, 1.5, '日常失速（W2 轉角）前')
    await pg.wait_for_timeout(1000); await L.turn_camera_to(pg, cdp, -38.0, -13.0)
    st = await L.state(pg)
    obs('facade 日常失速（溫州街 W2，還沒有 3D）：%s；互動按鈕「%s」' % ('走到了' if ok else '沒走到', st.get('interact') or '（沒有）'), J({k: st[k] for k in ('x', 'z')}))
    await shot(pg, 'facade_wz_richangshisu')
    ok = await L.go_to(pg, cdp, RUN, 7.4, -3.4, 0.8, '木曜日（B4 鐵門）前')
    await pg.wait_for_timeout(1000); await L.turn_camera_to(pg, cdp, 7.4, -8.0)
    st = await L.state(pg)
    obs('facade 木曜日（溫州街 B4）：%s；互動按鈕「%s」' % ('走到了' if ok else '沒走到', st.get('interact') or '（沒有）'), J({k: st[k] for k in ('x', 'z')}))
    await shot(pg, 'facade_wz_mokuyobi')
    z = await zst(pg)
    obs('facade 整段 walkFallbacks %d → %d' % (fb0, z['fb']))


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC N20X 新生南路＋木曜日 真實流程探針；CASES=%s；不用 ?turbo；Playwright 手機模擬（橫向），不是實機' % ','.join(CASES), flush=True)
    async with async_playwright() as p:
        if HEADLESS:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        else:
            b = await p.chromium.launch(headless=False)   # PC（CC_HEADLESS=0）：有視窗＋顯示卡（同 cc_art_v20_shots_probe 的 launch_headed）
            ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=L.UA)
            pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        if not check('遊戲載入', await L.wait_loaded(pg)):
            await b.close(); print('FAILED'); sys.exit(1)
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        have = await pg.evaluate("({xs:typeof XS3!=='undefined', mok:typeof MOK3!=='undefined', zx:!!Z3.ZONES.xinsheng, zm:!!Z3.ZONES.wz_mokuyobi, v:(document.getElementById('ver')||{}).textContent||null})")
        check('前置：這一版有 xinsheng、wz_mokuyobi 區域（XS3、MOK3 載入）', have['xs'] and have['mok'] and have['zx'] and have['zm'], J(have))
        obs('新生南路現在是 BLOCKOUT（套件方塊立面／正式立面 bldg.xinsheng_street 如果有載到會換掉）；公館往溫州街的巷子還在——照 BB 只記')
        for c, fn in (('a', case_a), ('b', case_b), ('c', case_c), ('shots', case_shots), ('facade', case_facade)):
            if c not in CASES: continue
            try:
                await fn(pg, cdp, errs)
            except Exception as e:
                check('CASE %s 跑完（探針本身沒有例外）' % c, False, repr(e)[:300])
                await shot(pg, 'case_%s_exception' % c)
        check('整段沒有 JS 例外', not errs, J(errs[:5]))
        nb = await pg.evaluate("GAME.walkFallbacks||0")
        check('整段 GAME.walkFallbacks＝0', nb == 0, str(nb))
        await b.close()
    print('---- 摘要', flush=True)
    for w in WARNS: print('WARN ' + w, flush=True)
    print('WARN %d 項、OBS %d 項（只記狀態，不算 FAIL）' % (len(WARNS), len(OBS)), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
