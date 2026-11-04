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
  （a8c485729 起，木曜日 AA_618 第 1 節 b04191041；a 的讀檔改 14:00：木曜日營業 13–22）
  closed 週二公休（09-30）、22:18、颱風假（10-13）、12:30 按「上二樓」被擋（記 toast、人不進 wz_mokuyobi）；21:56 人在二樓、22:00 打烊被請出來
  order 第一次上樓（1-1 旁白）→ 坐下先點東西（焙茶拿鐵：扣 150、奶泡那句）→ 吧檯「點東西」：什麼都不點（只要水／（小聲）好。不扣錢）、巴斯克（扣錢、旁白）
  date_zr 手機約芷若「去木曜日坐坐」→ 答應 → 跳過時間 →「出發」或自己走進 B4 → 上樓見面（《挪威的森林》那句）→ 下樓回溫州街；每一步：對話框關了、D.active false、搖桿推得動、walkFallbacks 不變
  rain 晴天／雨天的二樓窗前（窗景、雨、聲音，只記）；names 大地圖、手機、HUD 沒有 wz_mokuyobi／xinsheng 的 id
  二樓有名字的台詞都要有「（小聲）」（order、date_zr 裡檢查）
  nichijo_*（日常失速 wz_offbeat，27970f958 起；AA_618 第 2 節＋AA_648）：enter ① 走進店門（第一次的旁白）／order ② 五個選項各讀檔一次（扣錢、旁白）／
     cat ③ 看看兩次、摸摸兩次／game ④ 照作息挑朋友在的時段（[前置／捷徑]）→ 玩桌遊 → 回到自由移動／close ⑤ 00:56 在店裡跨過 01:00、01:24 和 11:00 在店外按入口／
     final ⑥（_y2／_y3／_y4 換年級）期末最後一科考完那晚（CLS.lastExamEnd(G,'Y?S1')；條件事件照開）走進店裡 → 驗收照 AA_648 §6：①長桌坐得下 ②揪的人在 ③玩家坐揪的人旁邊
       ④有名字最多 6、空位的不認識同學不講話 ⑤演完都起身、自由移動（27970f958 還沒接＝對照組預期 FAIL）。每一段都做卡住檢查、印 transcript
  facade（BB 追加，d5138cd27 起有正式立面 74557a245）：側門往南、往北各一張；沿騎樓走到 layout 七家店門口（山嵐、南洋、大口漢堡、同弦、大步、好拍、新生運動廣場），
     跟隨鏡頭轉向店門截圖、記互動按鈕；再走「往溫州街」拍日常失速（W2 轉角，還沒有 3D）、木曜日（B4）。只拍紀錄，不判 FAIL（換區那一步照 go_exit 檢查）。
每一段記：區域換對沒（GAME.G.zone／E.zone）、出生點（E.lastSpawn 的 fixed 和要求的位置差多少、站得住、搖桿推一下有沒有位移）、
  GAME.walkFallbacks（要 0）、JS 例外（pageerror）。
只記狀態、不算 FAIL：新生南路是 BLOCKOUT（沒有正式立面）；木曜日點餐／書櫃／唱片機／海報還沒接；公館往溫州街的巷子還在；鏡頭射線（WARN）；出生點落在出口按鈕範圍內（WARN）。
Playwright 手機模擬（橫向 844×390），不是 iPhone 實機。
用法：LW_TESTS=<wt>/tests [CASES=a,b,c,shots,facade,closed,order,date_zr,rain,names,nichijo_enter,nichijo_order,nichijo_cat,nichijo_game,nichijo_close,nichijo_final,nichijo_final_y2,nichijo_final_y1s2,nichijo_final_y2s2,nichijo_final_y3,nichijo_final_y4] [FACADE_WZ=0] [CC_HEADLESS=0] python3 cc_n20x_xinsheng_flow_probe.py <url> <out>"""
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
  return {zone:G.zone, ezone:(E.zone&&((E.zone.def&&E.zone.def.id)||E.zone.id))||null, x:+o.x.toFixed(2), z:+o.z.toFixed(2), y:+o.y.toFixed(2), lv:P.lv|0,
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


async def push_any(pg, cdp, tag):
    """搖桿推得動：先往前推；前面被東西擋住（例：站在吧檯前、鏡頭在背後，往前＝往吧檯）就再試後、右、左。
    四個方向都推不動才算卡住。回傳 (走了幾公尺, 推了幾次, 最後的 state, 方向)"""
    tot = 0; moved, n, s2 = 0.0, 0, None
    for dx, dy, nm in ((0, -40, '前'), (0, 40, '後'), (40, 0, '右'), (-40, 0, '左')):
        moved, n, s2 = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=3 if nm == '前' else 2, ms=1200); tot += n
        if moved >= 0.3:
            if nm != '前': obs('%s：搖桿往前推不動（前面有東西擋住），往%s推走得動' % (tag, nm))
            return moved, tot, s2, nm
    return moved, tot, s2, '四個方向都'


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
    if st.get('dlg') or st.get('choices') or st.get('busy'):   # 一進門就演（第一次進去的旁白、偶遇）：演的時候搖桿本來就不動，留給演完以後的 stuck_check
        obs('%s：一到就在演（對話框／選單／busy），搖桿留到演完再推' % tag, J({k: st.get(k) for k in ('dlg', 'choices', 'busy', 'dtext')})); return
    moved, n, s2, dn = await push_any(pg, cdp, tag)
    check('%s：換區後搖桿推得動（往%s %.2f m，推 %d 次）' % (tag, dn, moved, n), moved >= 0.3, J({k: s2[k] for k in ('x', 'z', 'lv', 'y')}))


async def setup(pg, cdp, zone, x, z, yaw, hour, lv=None, why='', daykey=None, weather='clear', extra=None, dayn=None, quiet=True):
    if dayn is not None:   # 直接給遊戲的第幾天（例：CLS.lastExamEnd 算出來的那天）
        day = dayn; dk = await pg.evaluate("(d=>{ const x=CALENDAR.dateOf(d); return x.key||(x.y+'-'+String(x.m).padStart(2,'0')+'-'+String(x.d).padStart(2,'0')); })(%d)" % dayn)
        wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % dayn)
    else:
        dk = daykey or DAYKEY
        day = await pg.evaluate("STORY.dayOfKey(%s)" % J(dk))
        wd = await pg.evaluate("new Date(%s+'T12:00:00').getDay()" % J(dk))
    pos = {'x': x, 'z': z, 'yaw': yaw}
    if lv is not None: pos['lv'] = lv
    st = {'zone': zone, 'hour': hour, 'day': day, 'weekday': wd, 'weather': weather, 'flags': FLAGS, 'pos': pos}
    if extra: st.update(extra)
    print('  [前置／捷徑] 讀檔：%s（day %s、weekday %s）%02d:%02d %s %s 天氣 %s%s；%s。%s' % (dk, day, wd, int(hour), round(hour % 1 * 60), zone, J(pos), weather, ('；另外 ' + J(extra)) if extra else '', '條件事件關閉、手機自動訊息關閉' if quiet else '條件事件照開、手機自動打開關閉', why), flush=True)
    await pg.evaluate("STORY.phoneAuto=()=>{}")
    if quiet:
        await L.load_state(pg, st, quiet_events=True)
    else:   # 要測條件事件（期末聚餐）：條件事件照開，只關手機自動打開（playlib 的 quiet_phone；舊版 playlib 沒有這個參數）
        print('  [前置／捷徑] 這一次讀檔條件事件照開（要測事件本身）', flush=True)
        try: await L.load_state(pg, st, quiet_phone=True)
        except TypeError: await L.load_state(pg, st)
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


# ================= a8c485729 起（b04191041：木曜日 AA_618 第 1 節，src/mokuyobi_sys3d.js）=================
# 營業 13:00～22:00、週二公休（places.js wz_mokuyobi）、颱風天關（typhoonShops；calendar.js 颱風假 2025-10-13）；擋門在 story3d.js 的 interact：GM.toast(PLACES.closedText(...))。
# 打烊時人還在店裡：MOKS.closeOut 請你出來（站到 B4 門口）＋toast。點東西：第一次坐下（STORY.onSeat）＋吧檯「點東西」(−3.3, −4.95)；
#   焙茶拿鐵 150／焦糖布丁 120／巴斯克乳酪蛋糕 140／什麼都不點（「只要水。」→ 老闆「（小聲）好。」），點完一句旁白。
# 二樓店裡有名字的台詞一律「（小聲）」（MOKS.whisper 包 LIBQ.whisper）。約會：invites.js 地點 mokuyobi（ACQUAINTANCE 以上、自己去過一次、週二不行、13–22）。
DLGOBS = """(()=>{ if(window.__dlObs) return; window.__dl=[]; const T=document.getElementById('dlgText'), N=document.getElementById('dlgName'); if(!T) return;
  const rec=()=>{ const t=(T.textContent||'').trim(); if(!t) return; const n=((N&&N.textContent)||'').trim(); const E=GAME.E, G=GAME.G; const L=window.__dl, last=L[L.length-1];
    const o={n, t, z:G.zone, lv:E.player?(E.player.lv|0):0, h:+G.hour.toFixed(2)};
    if(last&&last.n===n&&(t.startsWith(last.t)||last.t.startsWith(t))){ if(t.length>last.t.length) last.t=t; return; } L.push(o); };
  window.__dlObs=new MutationObserver(rec); window.__dlObs.observe(T,{childList:true,characterData:true,subtree:true}); })()"""
TOASTOBS = """(()=>{ if(window.__tsObs) return; window.__ts=[]; const el=document.getElementById('toast'); if(!el) return;
  window.__tsObs=new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&window.__ts[window.__ts.length-1]!==t) window.__ts.push(t); }); window.__tsObs.observe(el,{childList:true,characterData:true,subtree:true}); })()"""


async def observers(pg):
    await pg.evaluate(DLGOBS); await pg.evaluate(TOASTOBS)


async def dl_since(pg, k):
    return await pg.evaluate("(window.__dl||[]).slice(%d)" % k)


def whisper_check(tag, lines):
    """二樓店裡（wz_mokuyobi、第 1 層）有名字、不是手機的台詞都要有「小聲」"""
    up = [l for l in lines if l['z'] == 'wz_mokuyobi' and l['lv'] == 1 and l['n'] and '手機' not in l['n']]
    bad = [l for l in up if '小聲' not in l['t']]
    if not up: obs('%s：這一段二樓沒有有名字的台詞（小聲沒得檢查）' % tag); return
    check('%s：二樓有名字的台詞都有「（小聲）」（%d 句）' % (tag, len(up)), not bad, J(bad[:4]))


async def toast_since(pg, k):
    return await pg.evaluate("(window.__ts||[]).slice(%d)" % k)


async def stuck_check(pg, cdp, tag, fb0):
    """沒有卡住：對話框關了、GAME.D.active false、沒有選單、沒有 busy、搖桿推得動、walkFallbacks 沒有增加"""
    for _ in range(20):
        st = await L.state(pg)
        if not st['dlg'] and not st['choices'] and not st['busy']: break
        if st['choices']: break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
    st = await L.state(pg); da = await pg.evaluate("!!(GAME.D&&GAME.D.active)")
    check('%s：對話框關了、D.active false、沒有選單、不 busy' % tag, not st['dlg'] and not da and not st['choices'] and not st['busy'], J({k: st[k] for k in ('dlg', 'choices', 'busy', 'pose', 'zone', 'dtext')}))
    seated = await pg.evaluate("!!GAME.E.player.seat")
    if seated: obs('%s：人還坐著（搖桿推之前）' % tag)
    moved, n, s2, dn = await push_any(pg, cdp, tag)
    check('%s：搖桿推得動（往%s %.2f m，推 %d 次）' % (tag, dn, moved, n), moved >= 0.3, J({k: s2[k] for k in ('x', 'z', 'lv', 'pose')}))
    fb = await pg.evaluate("GAME.walkFallbacks||0")
    check('%s：walkFallbacks 沒有增加（%d → %d）' % (tag, fb0, fb), fb == fb0)
    return fb


async def try_enter_closed(pg, cdp, errs, tag, daykey, hour, weather='clear'):
    await setup(pg, cdp, 'wenzhou', 9.5, 0.5, math.pi, hour, daykey=daykey, weather=weather, why='B4 東南邊；' + tag)
    await observers(pg)
    op = await pg.evaluate("({open:PLACES.isOpen('wz_mokuyobi',GAME.G.hour,GAME.G.day), typhoon:PLACES.typhoonClosed('wz_mokuyobi',GAME.G.day), text:PLACES.closedText('wz_mokuyobi',GAME.G.hour,GAME.G.day)})")
    print('  遊戲判斷：%s' % J(op), flush=True)
    check('%s：遊戲判斷木曜日現在沒開（PLACES.isOpen＝false）' % tag, not op['open'], J(op))
    it = await approach(pg, cdp, tag, '上二樓（木曜日）', (7.4, -4.55))
    if not it: return
    k = len(await pg.evaluate("window.__ts||[]")); e0 = len(errs)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4500)
    ts = await toast_since(pg, k); z = await zst(pg)
    cap = await pg.evaluate("((document.getElementById('caption')||{}).textContent||'').trim()")
    print('  擋下來的字：toast %s；caption %s' % (J(ts), J(cap)), flush=True)
    await shot(pg, 'closed_' + tag)
    check('%s：按「上二樓」沒有進 wz_mokuyobi（還在 %s）' % (tag, z['zone']), z['zone'] == 'wenzhou', J(z))
    check('%s：有擋下來的字（toast）' % tag, bool(ts), J(ts))
    obs('%s 擋的字' % tag, J(ts or cap))
    check('%s：沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))


async def case_closed(pg, cdp, errs):
    print('== closed 木曜日沒開的時候按「上二樓」', flush=True)
    await try_enter_closed(pg, cdp, errs, '週二公休', '2025-09-30', 15.0)
    await try_enter_closed(pg, cdp, errs, '22點以後', DAYKEY, 22.3)   # 22:18
    await try_enter_closed(pg, cdp, errs, '颱風天', '2025-10-13', 15.0, weather='rain')
    await try_enter_closed(pg, cdp, errs, '還沒開（12點半）', DAYKEY, 12.5)
    # 打烊那一刻人還在店裡：MOKS.closeOut 請你出來
    print('-- 打烊（22:00）時人在二樓店裡', flush=True)
    await setup(pg, cdp, 'wz_mokuyobi', -1.0, 0.6, math.pi / 2, 21.93, lv=1, why='二樓店裡中間；等到 22:00 打烊',
                extra={'visited': {'wenzhou': True, 'wz_mokuyobi': True}, 'mokuyobi': {'n': 3, 'seats': {}, 'first': 1}})
    await observers(pg); k = len(await pg.evaluate("window.__ts||[]")); t0 = time.time(); z = None
    while time.time() - t0 < 180:
        await pg.wait_for_timeout(1500); z = await zst(pg)
        st = await L.state(pg)
        if st['dlg']: await L.tap(pg, cdp, '#dlg')
        if z['zone'] == 'wenzhou' and not z['loading']: break
    ts = await toast_since(pg, k)
    print('  打烊：%s；toast %s' % (J(z), J(ts)), flush=True)
    check('打烊：22:00 以後被請到溫州街（B4 門口）', z and z['zone'] == 'wenzhou' and z['hour'] >= 22 - 0.02, J(z))
    obs('打烊的字', J(ts))
    if z and z['zone'] == 'wenzhou':
        await shot(pg, 'closed_kicked_out'); await stuck_check(pg, cdp, '打烊出來以後', z['fb'])


async def order_one(pg, cdp, tag, pick):
    """選單出現時選 pick 開頭的那一項；回傳 (選到的字, 前後的錢, 這一段的台詞)"""
    m0 = await pg.evaluate("GAME.G.money|0"); k = len(await pg.evaluate("window.__dl||[]")); picked = None; t0 = time.time()
    while time.time() - t0 < 30 and not picked:
        await pg.wait_for_timeout(700); bs = await btns(pg)
        if bs:
            print('  %s 選單：%s' % (tag, J(bs)), flush=True); await shot(pg, tag + '_menu')
            picked = await tap_choice(pg, cdp, pick)
            if not picked: break
        elif (await L.state(pg))['dlg']: await L.tap(pg, cdp, '#dlg')
    for _ in range(25):   # 點完的旁白、老闆的話
        await pg.wait_for_timeout(900); st = await L.state(pg)
        if st['choices']: break
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if not st['busy']: break
    m1 = await pg.evaluate("GAME.G.money|0"); lines = await dl_since(pg, k)
    print('  %s：選了 %s；錢 %d → %d；台詞 %s' % (tag, J(picked), m0, m1, J(lines)), flush=True)
    return picked, m0, m1, lines


async def case_order(pg, cdp, errs):
    print('== order 木曜日坐下點東西、吧檯點東西', flush=True)
    await setup(pg, cdp, 'wz_mokuyobi', -3.75, 6.6, math.pi, 14.0, lv=0, why='木曜日一樓樓梯口（第一次來：visited 只有溫州街）',
                extra={'visited': {'wenzhou': True}})
    await observers(pg); fb0 = (await zst(pg))['fb']; e0 = len(errs)
    ok = await L.go_to(pg, cdp, RUN, -1.8, 2.065, 0.5, '上樓進店門', lv=1)
    check('order：走樓梯上去、進店門', ok, J(await zst(pg)))
    for _ in range(20):   # 1-1 第一次進去（兩句旁白＋老闆兩句）
        await pg.wait_for_timeout(900); st = await L.state(pg)
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if not st['busy'] and not st['choices']: break
    first = await dl_since(pg, 0)
    obs('order 第一次進去的台詞', J(first))
    check('order：第一次進去有旁白（「窄樓梯走上二樓」）', any('窄樓梯' in l['t'] for l in first), J(first[:3]))
    whisper_check('order 進門', first)
    it = await approach(pg, cdp, 'order 坐下', '坐下', (-0.05, 2.6), lv=1)
    if it:
        await L.tap(pg, cdp, '#interact')
        picked, m0, m1, lines = await order_one(pg, cdp, 'order_seat', '焙茶拿鐵')
        check('order：第一次坐下先出點東西的選單、選了焙茶拿鐵', bool(picked) and picked.startswith('焙茶拿鐵'), J(picked))
        check('order：扣了錢（%d → %d，焙茶拿鐵 150）' % (m0, m1), m1 < m0, str(m0 - m1))
        check('order：點完有旁白（「奶泡」）', any(not l['n'] and '奶泡' in l['t'] for l in lines), J(lines))
        whisper_check('order 坐下點東西', lines)
        bs = await btns(pg)
        obs('order 點完以後的座位選單', J(bs))
        if any(b['t'].startswith('起身') for b in bs): await tap_choice(pg, cdp, '起身'); await pg.wait_for_timeout(1500)
        fb0 = await stuck_check(pg, cdp, 'order 坐下點完起身', fb0)
    it = await approach(pg, cdp, 'order 吧檯', '點東西', (-3.3, -4.95), lv=1)
    if it:
        await L.tap(pg, cdp, '#interact')
        picked, m0, m1, lines = await order_one(pg, cdp, 'order_bar_water', '什麼都不點')
        check('order 吧檯：「什麼都不點」不扣錢', bool(picked) and m1 == m0, '%d → %d' % (m0, m1))
        check('order 吧檯：祐廷「只要水。」、老闆「（小聲）好。」', any('只要水' in l['t'] for l in lines) and any(l['n'] == '老闆' and '好。' in l['t'] for l in lines), J(lines))
        whisper_check('order 吧檯（只要水）', lines)
        await L.tap(pg, cdp, '#interact')
        picked, m0, m1, lines = await order_one(pg, cdp, 'order_bar_cake', '巴斯克')
        check('order 吧檯：巴斯克乳酪蛋糕扣錢（%d → %d）、有旁白' % (m0, m1), bool(picked) and m1 < m0 and any(not l['n'] and '蛋糕' in l['t'] for l in lines), J(lines))
        await stuck_check(pg, cdp, 'order 吧檯點完', fb0)
    for lb in ('看看書櫃', '看唱片機', '看海報'):
        f = await pg.evaluate(FIND_EX % J([lb, None, None]))
        obs('order「%s」互動點%s' % (lb, '有' if f else '沒有（mokuyobi_sys3d.js：AA_618 沒有台詞，不放按鈕）'))
    check('order 這一段沒有 JS 例外', len(errs) == e0, J(errs[e0:e0 + 3]))


async def case_rain(pg, cdp, errs):
    print('== rain 雨天的木曜日（只記錄）', flush=True)
    for w in ('clear', 'rain'):
        await setup(pg, cdp, 'wz_mokuyobi', -0.45, 4.3, 0, 15.0, lv=1, weather=w, why='二樓窗前（天氣 %s）' % w,
                    extra={'visited': {'wenzhou': True, 'wz_mokuyobi': True}, 'mokuyobi': {'n': 3, 'seats': {}, 'first': 1}})
        await pg.wait_for_timeout(3000)
        info = await pg.evaluate("""(()=>{ const E=GAME.E, G=GAME.G; let view=null; E.scene.traverse(o=>{ if(!view&&o.isMesh&&/VIEW/.test(o.name||'')&&o.material) view={name:o.name, color:o.material.color?o.material.color.getHexString():null, em:o.material.emissiveIntensity}; });
          return {weather:G.weather, rain:!!(E.rain&&E.rain.visible), view, audio:(typeof A3!=='undefined'&&A3.state)?A3.state():null}; })()""")
        obs('rain 天氣 %s：%s' % (w, J(info)))
        await L.turn_camera_to(pg, cdp, -0.45, 9.0); await shot(pg, 'rain_mok_window_%s' % w)


async def case_names(pg, cdp, errs):
    print('== names 大地圖、手機上的「木曜日」「新生南路」', flush=True)
    HOOK = """(()=>{ if(window.__ftHook) return; window.__ftHook=1; window.__ft=[]; const f=CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText=function(t){ try{ if(this.canvas&&this.canvas.id==='bmCanvas') window.__ft.push(String(t)); }catch(e){} return f.apply(this,arguments); }; })()"""
    RAW = ['wz_mokuyobi', 'xinsheng']
    for zone, x, z, lv in (('wz_mokuyobi', -1.0, 0.6, 1), ('xinsheng', 15.0, 10.0, None)):
        await setup(pg, cdp, zone, x, z, 0, 15.0, lv=lv, why='在 %s 開大地圖、手機' % zone,
                    extra={'visited': {'wenzhou': True, 'wz_mokuyobi': True, 'xinsheng': True, 'campus': True}, 'mokuyobi': {'n': 3, 'seats': {}, 'first': 1}})
        await pg.evaluate(HOOK); await pg.evaluate("window.__ft=[]")
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(2500)
        bm = await pg.evaluate("""(()=>{ const e=document.getElementById('bigmap'); const open=!!e&&!e.classList.contains('hide'); const t=id=>((document.getElementById(id)||{}).textContent||'').trim();
          return {open, title:t('bmTitle'), sub:t('bmSub'), info:t('bmInfo').slice(0,200), people:t('bmPeople').slice(0,200), canvas:(window.__ft||[]).slice(0,80)}; })()""")
        print('  大地圖（%s）：%s' % (zone, J(bm)), flush=True)
        await shot(pg, 'names_bigmap_%s' % zone)
        allt = ' '.join([bm['title'], bm['sub'], bm['info'], bm['people']] + bm['canvas'])
        check('names 大地圖（在 %s）有打開' % zone, bm['open'], J(bm['title']))
        check('names 大地圖（在 %s）沒有出現區域 id（%s）' % (zone, '、'.join(RAW)), not any(r in allt for r in RAW), allt[:200])
        want = '木曜日' if zone == 'wz_mokuyobi' else '新生南路'
        if want in allt: obs('names 大地圖（在 %s）寫了「%s」' % (zone, want))
        else: warn('names 大地圖（在 %s）沒看到「%s」（placemap3d.js 只把木曜日加進溫州街圖釘；新生南路沒有圖釘）' % (zone, want), allt[:160])
        if bm['open']: await L.tap(pg, cdp, '#bmClose'); await pg.wait_for_timeout(800)
        txt = {}
        for tab in ('places', 'today', 'friends'):
            if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)
            txt[tab] = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
            await shot(pg, 'names_phone_%s_%s' % (tab, zone))
        hud = await pg.evaluate("[...document.querySelectorAll('#hud, #hudPlace, #placeName, #topbar')].map(e=>(e.textContent||'').trim()).join(' | ')")
        print('  手機（%s）：%s；HUD %s' % (zone, J({k: v[:240] for k, v in txt.items()}), J(hud[:200])), flush=True)
        allp = ' '.join(txt.values()) + ' ' + hud
        check('names 手機、HUD（在 %s）沒有出現區域 id' % zone, not any(r in allp for r in RAW), allp[:200])
        if zone == 'wz_mokuyobi':
            check('names 手機「地點」有「木曜日」', '木曜日' in txt['places'], txt['places'][:200])
        else:
            obs('names 手機（在新生南路）有沒有寫「新生南路」', '有' if '新生南路' in allp else '沒有')
        (await L.close_panels(pg, cdp)) if hasattr(L, 'close_panels') else None


ZR = 'heroine_02'


async def phone_tab(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % J(sel))
    if not ok: return False
    await pg.wait_for_timeout(500); return await L.tap(pg, cdp, sel)


IVJS = "(id=>(GAME.G.invites||[]).filter(v=>v.who===id).slice(-1)[0]||null)(%s)" % J(ZR)
ZRNPC = "(id=>{ const n=(GAME.npc&&GAME.npc[id])||(GAME.E.npcs||[]).find(q=>q.id===id||q.charId===id); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),lv:n.lv|0,pose:n.pose||null,seat:!!n.seat}:null; })(%s)" % J(ZR)


async def case_date_zr(pg, cdp, errs):
    print('== date_zr 約芷若（heroine_02）去木曜日', flush=True)
    social = {'rel': {ZR: {'fam': 45, 'trust': 32, 'aff': 30, 'resp': 25, 'comf': 30, 'rom': 0, 'npcRom': 0, 'seen': 6, 'talked': 6}}, 'mem': {}, 'reveal': {}, 'prof': {},
              'grad': {'interest': 'NONE', 'field': None, 'prep': 0}, 'fm120': True}
    extra = {'social': social, 'contacts': {ZR: 1}, 'visited': {'wenzhou': True, 'wz_mokuyobi': True, 'campus': True, 'gongguan': True, 'cafe': True},
             'mokuyobi': {'n': 1, 'seats': {}, 'first': 1}}
    await setup(pg, cdp, 'wenzhou', 9.5, 0.5, math.pi, 13.25, why='溫州街 B4 東南邊；芷若 FRIEND（fam 45／trust 32）、有聯絡方式、自己去過木曜日一次（invites.js show 條件）', extra=extra)
    await observers(pg)
    pre = await pg.evaluate("(id=>({stage:SOCIAL.stage(id), can:INV.canInvite(GAME.G,id), why:INV.whyNot?INV.whyNot(GAME.G,id):null, contact:INV.hasContact(GAME.G,id), present:STORY.present?STORY.present(id,GAME.G):null}))(%s)" % J(ZR))
    print('  前置檢查：%s' % J(pre), flush=True)
    check('date_zr 前置：芷若可以約（INV.canInvite）', pre['can'], J(pre))
    fb0 = (await zst(pg))['fb']
    # ---- 邀約：手機「朋友」→ 芷若「約」（沒有按鈕就記下來，改當面）----
    txt = await phone_tab(pg, cdp, 'friends')
    has = await pg.evaluate("!!document.querySelector('#phoneBody [data-inv=\"%s\"]')" % ZR)
    print('  手機朋友：%s' % txt[:300], flush=True); await shot(pg, 'date_zr_phone_friends')
    if not check('date_zr 邀約：手機「朋友」有芷若的「約」', has, txt[:200]):
        (await L.close_panels(pg, cdp)) if hasattr(L, 'close_panels') else None; return
    await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % ZR); await pg.wait_for_timeout(1500)
    path = []
    for lvl in range(5):
        bs = await btns(pg)
        if not bs: break
        path.append([b['t'][:30] for b in bs])
        i = next((k for k, b in enumerate(bs) if b['t'].startswith('去木曜日')), None)
        if i is None: i = next((k for k, b in enumerate(bs) if '木曜日' in b['t']), None)
        if i is None: break
        await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(1500)
        if bs[i]['t'].startswith('去木曜日'): break
    print('  地點選單：%s' % J(path), flush=True)
    check('date_zr 邀約：地點選單找得到「去木曜日坐坐」', any(any(t.startswith('去木曜日') for t in lv) for lv in path), J(path))
    bs = await btns(pg); print('  時間選單：%s' % J(bs), flush=True); await shot(pg, 'date_zr_time_menu')
    i = next((k for k, b in enumerate(bs) if b['t'].startswith('今天') and not b['dim']), None)
    if i is None: i = next((k for k, b in enumerate(bs) if not b['dim'] and not b['t'].startswith('算了')), None)
    if i is None:
        check('date_zr 邀約：時間選單有可以選的時間', False, J(bs)); return
    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(1500)
    for _ in range(20):   # 她的回覆；「改天」附時間就答應那個時間
        st = await L.state(pg)
        if st['choices']:
            bs = await btns(pg); print('  回覆後的選單：%s' % J(bs), flush=True)
            j = next((k for k, b in enumerate(bs) if not b['dim'] and not b['t'].startswith(('算了', '不', '改天再說'))), 0)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (j + 1)); await pg.wait_for_timeout(1300); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1000); continue
        if not st['busy']: break
        await pg.wait_for_timeout(800)
    iv = await pg.evaluate(IVJS); lines = await dl_since(pg, 0)
    print('  邀約結果：%s；台詞 %s' % (J(iv), J(lines[-6:])), flush=True)
    if not check('date_zr 邀約：芷若答應了（accepted、木曜日）', bool(iv) and iv['state'] == 'accepted' and iv['place'] == 'mokuyobi', J(iv)): return
    fb0 = await stuck_check(pg, cdp, 'date_zr 邀約之後', fb0)
    # ---- 等到約好的時間：手機「今天」的「跳過時間」（約好的時間前 10 分鐘停下來）----
    if iv['day'] == (await pg.evaluate("GAME.G.day")) and iv['h'] - (await pg.evaluate("GAME.G.hour")) > 0.5:
        await phone_tab(pg, cdp, 'today')
        sk = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>+b.dataset.skip)")
        tgt = min([v for v in sk if v > iv['h'] - 0.2] or [max(sk or [0])])
        print('  跳過時間的按鈕 %s → 按 %s（約 %.2f）' % (J(sk), tgt, iv['h']), flush=True)
        if sk: await tap_sel(pg, cdp, '#phoneBody [data-skip="%.3f"]' % tgt); await pg.wait_for_timeout(5000)
        (await L.close_panels(pg, cdp)) if hasattr(L, 'close_panels') else None
    elif iv['day'] != (await pg.evaluate("GAME.G.day")):
        obs('date_zr 約在別天（day %s），探針不跨日（只記狀態）' % iv['day']); return
    # ---- 出發：「出發：」選單（INV.goPrompt）或自己走進 B4 ----
    went = None; t0 = time.time()
    while time.time() - t0 < 120:
        st = await L.state(pg); z = await zst(pg)
        if z['zone'] == 'wz_mokuyobi': went = went or 'walked'; break
        if st['choices']:
            bs = await btns(pg); print('  選單：%s' % J(bs), flush=True)
            j = next((k for k, b in enumerate(bs) if '出發' in b['t'] or '過去' in b['t']), None)
            if j is not None:
                await shot(pg, 'date_zr_go_menu'); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (j + 1)); went = 'go_menu:' + bs[j]['t'][:20]
                await wait_zone(pg, 'wz_mokuyobi', 60); continue
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(1000); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900); continue
        if (await pg.evaluate("GAME.G.hour")) >= iv['h'] - 0.35 or time.time() - t0 > 30:
            s = await go_exit(pg, cdp, errs, 'date_zr 出發（自己走進 B4）', '上二樓（木曜日）', 'wz_mokuyobi', (7.4, -4.55))
            went = 'walked'; fb0 = (await zst(pg))['fb']
            if not s: break
        await pg.wait_for_timeout(1500)
    z = await zst(pg); iv = await pg.evaluate(IVJS)
    print('  出發：%s；%s；邀約 %s' % (went, J(z), J(iv)), flush=True)
    if not check('date_zr 出發：到了木曜日（wz_mokuyobi）', z['zone'] == 'wz_mokuyobi', J(z)): return
    obs('date_zr 出發的方式', str(went))
    fb0 = await stuck_check(pg, cdp, 'date_zr 到場（一樓樓梯口）', fb0)
    # ---- 到場：上樓、找到芷若、見面 ----
    ok = await L.go_to(pg, cdp, RUN, -1.8, 2.065, 0.5, '上樓進店門', lv=1)
    check('date_zr 到場：上樓進店門', ok, J(await zst(pg)))
    t0 = time.time(); k0 = len(await pg.evaluate("window.__dl||[]")); met = False
    while time.time() - t0 < 300:
        iv = await pg.evaluate(IVJS)
        if iv and iv['state'] == 'done': met = True; break
        st = await L.state(pg)
        if st['choices']:
            bs = await btns(pg); print('  見面選單：%s' % J(bs), flush=True); await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(1200); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900); continue
        if st['busy']: await pg.wait_for_timeout(1000); continue
        if '芷若' in (st.get('interact') or ''):
            await shot(pg, 'date_zr_before_talk'); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); continue
        n = await pg.evaluate(ZRNPC)
        if not n: RUN.note('還沒看到芷若的 NPC'); await pg.wait_for_timeout(3000); continue
        await L.go_to(pg, cdp, RUN, n['x'], n['z'], 1.0, '芷若旁邊', max_s=120, lv=n['lv'])
    lines = await dl_since(pg, k0); iv = await pg.evaluate(IVJS)
    print('  見面：%s；台詞 %s' % (J(iv), J(lines)), flush=True)
    await shot(pg, 'date_zr_meet')
    check('date_zr 演完：邀約變成見到了（done）', met, J(iv))
    check('date_zr 演完：有她第一次來木曜日那一句（《挪威的森林》）', any('挪威' in l['t'] for l in lines), J(lines[-6:]))
    whisper_check('date_zr 見面', lines)
    fb0 = await stuck_check(pg, cdp, 'date_zr 演完', fb0)
    # ---- 回去：下樓、離開木曜日 ----
    s = await go_exit(pg, cdp, errs, 'date_zr 回去', '離開木曜日', 'wenzhou', (-3.75, 6.75), lv=0)
    if s:
        await shot(pg, 'date_zr_back_wenzhou'); await stuck_check(pg, cdp, 'date_zr 回到溫州街', (await zst(pg))['fb'])


# ================= 日常失速（wz_offbeat；AA_618 第 2 節＋AA_648；開發分支 27970f958 起，c2232eb6c 之後）=================
# 讀程式確認（27970f958）：
#   溫州街「進去日常失速」(−36.5, −9.6) r1.2（zones3d.js）→ wz_offbeat 出生 (−3.9, 3.0)；「離開日常失速」(−3.9, 4.55) → 溫州街 (−34.8, −9.6)
#   營業 13:00～01:00 每天（places.js wz_offbeat {open:13, close:25}）、颱風天關；過午夜 G.hour 是 24 以上（同一天）
#   src/offbeat_sys3d.js：「點東西吃」(−1.2, −2.55)：冰拿鐵 120／檸檬氣泡美式 130／肉桂捲 110／明太子厚片 140／不用了（點完各一句旁白）
#     「看看店長／摸摸店長」(2.95, 0.15)：看看＝每天第一次「睜開一隻眼睛」、之後「在睡覺」；摸摸＝三句隨機
#     「玩桌遊（長桌；有朋友在的時候）」(−1.85, 0.15)：店裡有認識的朋友 NPC（OFFB.friendsHere）才玩，四款輪流、時間 +1 小時、結束一句；沒有＝「長桌上沒有人」
#     偶遇作息：Alison（yu）週日 14–17、阿哲＋明軒 大一上週五 19:15（系籃練完）、沛珊 週三 21:30（外帶）
#     01:00～01:30 人在店裡＝店員「我們一點打烊喔……」＋旁白、走到溫州街（不出 toast）；其他關門時間＝toast（OFFB.closedText）；店外按「進去日常失速」關門＝toast
#   events.js ev_term_last_meal（大一上）：trigger enter、location ['noodle','wz_offbeat']、time 17–22、once、participants []；
#     條件：flags.noodleTableDay 有值、CLS.lastExamEnd(G,'Y1S1','final') 之後、G.zone＝OFFB.finalZone（沒收過舊的燒臘店訊息＝wz_offbeat）
OB_DOOR = (-36.5, -9.6)
OB_MENU = [('冰拿鐵', 120, '奶泡'), ('檸檬氣泡美式', 130, '檸檬氣泡美式'), ('肉桂捲', 110, '肉桂捲'), ('明太子厚片', 140, '明太子厚片'), ('不用了', 0, None)]
OB_KNOWN = {'zhe': {'fam': 40, 'trust': 30, 'aff': 30, 'resp': 20, 'comf': 30, 'rom': 0, 'npcRom': 0, 'seen': 8, 'talked': 8},
            'yu': {'fam': 35, 'trust': 26, 'aff': 25, 'resp': 15, 'comf': 25, 'rom': 0, 'npcRom': 0, 'seen': 6, 'talked': 6},
            'classmate_mingxuan': {'fam': 30, 'trust': 25, 'aff': 20, 'resp': 15, 'comf': 20, 'rom': 0, 'npcRom': 0, 'seen': 6, 'talked': 6},
            'classmate_bohan': {'fam': 30, 'trust': 25, 'aff': 20, 'resp': 15, 'comf': 20, 'rom': 0, 'npcRom': 0, 'seen': 6, 'talked': 6},
            'classmate_peishan': {'fam': 30, 'trust': 25, 'aff': 20, 'resp': 15, 'comf': 20, 'rom': 0, 'npcRom': 0, 'seen': 6, 'talked': 6}}


def ob_extra(first=True, social=False, more=None):
    e = {'visited': {'wenzhou': True, 'wz_offbeat': True}}
    if not first: e['offbeat'] = {'n': 2, 'first': 1}   # 來過了（不演 2-1 第一次進去）
    if social:   # 認識＝有 FIRST_MET 記憶（STORY.knows／OFFB.friendsHere 看這個，不看 rel 數字）；阿哲另外看 MET_ZHE
        e['social'] = {'rel': dict(OB_KNOWN), 'mem': {i: [{'tag': 'FIRST_MET', 'day': 1, 'note': ''}] for i in OB_KNOWN},
                       'reveal': {i: 'ACQUAINTANCE' for i in OB_KNOWN}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}, 'fm120': True}
        e['flags'] = dict(FLAGS, MET_ZHE=True, **{'met_' + i: True for i in OB_KNOWN})
    if more: e.update(more)
    return e


def transcript(tag, lines):
    print('  ---- transcript %s（%d 句）' % (tag, len(lines)), flush=True)
    for l in lines: print('    [%s %s 第%s層 %.2f] %s：%s' % (tag, l['z'], l['lv'], l['h'], l['n'] or '（旁白）', l['t']), flush=True)


async def drain(pg, cdp, max_s=60, pick=0):
    """點對話、選第 pick 個選項，直到沒有對話、選單、busy；回傳點過的選單"""
    t0 = time.time(); menus = []
    while time.time() - t0 < max_s:
        await pg.wait_for_timeout(800); st = await L.state(pg)
        if st['choices']:
            bs = await btns(pg); menus.append([b['t'][:30] for b in bs]); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (pick + 1)); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if not st['busy']:
            await pg.wait_for_timeout(1200); st = await L.state(pg)
            if not st['dlg'] and not st['choices'] and not st['busy']: break
    return menus


async def ob_inside(pg, cdp, hour, why, daykey=None, extra=None):
    await setup(pg, cdp, 'wz_offbeat', -3.9, 3.0, math.pi, hour, daykey=daykey, why=why, extra=extra or ob_extra(first=False))
    await observers(pg); await drain(pg, cdp, 20)


async def case_nichijo_enter(pg, cdp, errs):
    print('== nichijo_enter ① 溫州街 → 走進日常失速（第一次）→ 離開', flush=True)
    await setup(pg, cdp, 'wenzhou', -30.0, 0.5, math.pi / 2, 15.0, why='溫州街主巷西段（日常失速店門東邊）；第一次來', extra={'visited': {'wenzhou': True}})
    await observers(pg); k = len(await pg.evaluate("window.__dl||[]"))
    await shot(pg, 'ob_enter_outside_before')
    s = await go_exit(pg, cdp, errs, 'nichijo① 溫州街→日常失速', '進去日常失速', 'wz_offbeat', OB_DOOR)
    if not s: return
    menus = await drain(pg, cdp, 40)
    lines = await dl_since(pg, k); transcript('nichijo①', lines)
    await shot(pg, 'ob_enter_inside')
    check('nichijo① 第一次進去的旁白（「玻璃門一推開」）＋店員一句', any('玻璃門一推開' in l['t'] for l in lines) and any(l['n'] == '店員' for l in lines), J(lines[:3]))
    if menus: obs('nichijo① 進門途中的選單', J(menus))
    await stuck_check(pg, cdp, 'nichijo① 進門以後', (await zst(pg))['fb'])
    s = await go_exit(pg, cdp, errs, 'nichijo① 日常失速→溫州街', '離開日常失速', 'wenzhou', (-3.9, 4.55))
    if s: await shot(pg, 'ob_enter_back_outside')


async def case_nichijo_order(pg, cdp, errs):
    print('== nichijo_order ② 吧檯「點東西吃」：每一個選項各讀檔一次', flush=True)
    for name, price, key in OB_MENU:
        await ob_inside(pg, cdp, 15.0, '店裡出生點（來過了）；這一次點「%s」' % name)
        it = await approach(pg, cdp, 'nichijo② ' + name, '點東西吃', (-1.2, -2.55))
        if not it: continue
        await L.tap(pg, cdp, '#interact')
        picked, m0, m1, lines = await order_one(pg, cdp, 'ob_order_' + name, name)
        transcript('nichijo② ' + name, lines)
        check('nichijo② 選單有「%s」並選了它' % name, bool(picked) and picked.startswith(name), J(picked))
        if price:
            check('nichijo② %s：扣 %d 元（%d → %d）' % (name, price, m0, m1), m0 - m1 == price, str(m0 - m1))
            check('nichijo② %s：點完有旁白（含「%s」）' % (name, key), any(not l['n'] and key in l['t'] for l in lines), J(lines))
        else:
            check('nichijo② 不用了：不扣錢（%d → %d）' % (m0, m1), m1 == m0)
        await stuck_check(pg, cdp, 'nichijo② %s 之後' % name, (await zst(pg))['fb'])


async def case_nichijo_cat(pg, cdp, errs):
    print('== nichijo_cat ③ 看看店長／摸摸店長', flush=True)
    await ob_inside(pg, cdp, 15.0, '店裡出生點（來過了；今天還沒看過店長）')
    k = len(await pg.evaluate("window.__dl||[]"))
    for i, pick in enumerate(('看看', '看看', '摸摸', '摸摸')):
        it = await approach(pg, cdp, 'nichijo③ 第 %d 次' % (i + 1), '看看店長', (2.95, 0.15))
        if not it: return
        await L.tap(pg, cdp, '#interact')
        picked, m0, m1, lines = await order_one(pg, cdp, 'ob_cat_%d_%s' % (i + 1, pick), pick)
        check('nichijo③ 第 %d 次選「%s」、有一句旁白' % (i + 1, pick), bool(picked) and any(not l['n'] and ('店長' in l['t'] or '摸' in l['t']) for l in lines), J(lines))
    lines = await dl_since(pg, k); transcript('nichijo③', lines)
    check('nichijo③ 看看：第一次「睜開一隻眼睛」、第二次「在睡覺」', any('睜開一隻眼睛' in l['t'] for l in lines) and any('在睡覺' in l['t'] for l in lines), J([l['t'] for l in lines]))
    await stuck_check(pg, cdp, 'nichijo③ 看完店長', (await zst(pg))['fb'])


async def case_nichijo_game(pg, cdp, errs):
    print('== nichijo_game ④ 有朋友在的時候玩桌遊', flush=True)
    cands = [('2025-09-28', 15.0, 'yu'), ('2025-10-05', 15.0, 'yu'), ('2025-10-19', 15.5, 'yu'), ('2025-09-26', 19.4, 'zhe'), ('2025-10-03', 19.4, 'zhe')]
    pick = None
    for dk, h, who in cands:   # [前置／捷徑] 照遊戲的作息挑時段：OFFB.slotNow 說那個人那時候在日常失速
        await setup(pg, cdp, 'wenzhou', -33.0, -9.6, -math.pi / 2, h, daykey=dk, why='挑時段：%s 的作息在不在日常失速' % who, extra=ob_extra(first=False, social=True))
        sl = await pg.evaluate("(id=>{ const e=OFFB.slotNow(GAME.G,id); return e?{label:e.label,from:e.from,to:e.to}:null; })(%s)" % J(who))
        print('  OFFB.slotNow(%s) %s %.2f：%s' % (who, dk, h, J(sl)), flush=True)
        if sl: pick = (dk, h, who); break
    if not check('nichijo④ 前置：找得到朋友作息在日常失速的時段', bool(pick), J(cands)): return
    k = len(await pg.evaluate("window.__dl||[]"))
    s = await go_exit(pg, cdp, errs, 'nichijo④ 進店（%s 在）' % pick[2], '進去日常失速', 'wz_offbeat', OB_DOOR)
    if not s: return
    await drain(pg, cdp, 60)   # 偶遇那一段（Alison「欸！坐這邊」、阿哲「練完好餓」）
    fr = await pg.evaluate("OFFB.friendsHere(GAME)")
    npc = await pg.evaluate("(GAME.E.npcs||[]).filter(n=>n&&n.charId).map(n=>({id:n.charId,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),seat:!!n.seat,pose:n.pose}))")
    print('  店裡的人：%s；friendsHere %s' % (J(npc), J(fr)), flush=True)
    check('nichijo④ 店裡有認識的朋友（OFFB.friendsHere 有 %s）' % pick[2], pick[2] in (fr or []), J(fr))
    it = await approach(pg, cdp, 'nichijo④', '玩桌遊', (-1.85, 0.15))
    if not it: return
    h0 = (await zst(pg))['hour']
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await shot(pg, 'ob_game_start')
    await drain(pg, cdp, 90)
    h1 = (await zst(pg))['hour']; lines = await dl_since(pg, k); transcript('nichijo④', lines)
    await shot(pg, 'ob_game_end')
    check('nichijo④ 開始玩：「你們把「…」攤開在長桌上」', any('攤開在長桌上' in l['t'] for l in lines), J(lines[-4:]))
    check('nichijo④ 不是「長桌上沒有人」', not any('長桌上沒有人' in l['t'] for l in lines))
    check('nichijo④ 玩了大約一小時（%.2f → %.2f）' % (h0, h1), h1 - h0 >= 0.9)
    await stuck_check(pg, cdp, 'nichijo④ 桌遊演完', (await zst(pg))['fb'])


async def case_nichijo_close(pg, cdp, errs):
    print('== nichijo_close ⑤ 01:00 打烊', flush=True)
    # 不先 drain、k 在讀檔之前取：00:56 讀檔，遊戲時間走到 01:00 只要幾秒，打烊那兩句（店員「一點打烊」＋旁白）可能在 setup 等區域的時候就開始
    # （N20X_nichijo 27970f958：舊寫法 k 取在 ob_inside 的 drain 之後，兩句被 drain 點掉、沒記到）。observers 不換頁，讀檔前裝好照樣記
    await observers(pg); k = len(await pg.evaluate("window.__dl||[]")); kt = len(await pg.evaluate("window.__ts||[]"))
    await setup(pg, cdp, 'wz_offbeat', -3.9, 3.0, math.pi, 24.93, why='店裡出生點、00:56（週六晚上過午夜：G.hour 24.93）', extra=ob_extra(first=False))
    await observers(pg); t0 = time.time(); z = None; shot_done = False
    while time.time() - t0 < 240:
        await pg.wait_for_timeout(1500); z = await zst(pg); st = await L.state(pg)
        if st['dlg']:
            if not shot_done: await shot(pg, 'ob_close_line'); shot_done = True
            await L.tap(pg, cdp, '#dlg')
        if z['zone'] == 'wenzhou' and not z['loading']: break
    lines = await dl_since(pg, k); ts = await toast_since(pg, kt); transcript('nichijo⑤ 打烊', lines)
    print('  打烊：%s；toast %s' % (J(z), J(ts)), flush=True)
    check('nichijo⑤ 跨過 01:00 被請到店外（溫州街）', bool(z) and z['zone'] == 'wenzhou' and z['hour'] >= 25 - 0.02, J(z))
    check('nichijo⑤ 有打烊的字（店員「一點打烊」或 toast）', any('打烊' in l['t'] for l in lines) or bool(ts), J({'lines': [l['t'] for l in lines], 'toast': ts}))
    if z and z['zone'] == 'wenzhou':
        await shot(pg, 'ob_close_outside'); await stuck_check(pg, cdp, 'nichijo⑤ 打烊出來', z['fb'])
    for h, tag in ((25.4, '01:24 打烊後'), (11.0, '11:00 還沒開')):
        await setup(pg, cdp, 'wenzhou', -33.0, -9.6, -math.pi / 2, h, why='店門東邊 3.5 m；' + tag, extra=ob_extra(first=False))
        await observers(pg)
        it = await approach(pg, cdp, 'nichijo⑤ ' + tag, '進去日常失速', OB_DOOR)
        if not it: continue
        kt = len(await pg.evaluate("window.__ts||[]")); e0 = len(errs)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4500)
        ts = await toast_since(pg, kt); z = await zst(pg)
        print('  %s 擋的字：%s' % (tag, J(ts)), flush=True); await shot(pg, 'ob_closed_%s' % ('late' if h > 24 else 'early'))
        check('nichijo⑤ %s：按「進去日常失速」沒有進去（還在 %s）' % (tag, z['zone']), z['zone'] == 'wenzhou', J(z))
        check('nichijo⑤ %s：有擋下來的字（toast）' % tag, bool(ts), J(ts))
        check('nichijo⑤ %s：沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))


# ⑥ 期末聚餐：驗收照 AA_648 §6（企劃線 adf1c2f78，BB 11-04）——「照期中那場接 OFFB.stage／S.cast」：
#   長桌七個人；當年揪的人一定在（大一阿哲、大二 Alison、大三芯慈、大四阿哲）；其他是玩家認識的人照認識程度，加起來最多六個（含揪的人）；
#   坐不滿＝不認識的同學坐空位（不說話）；揪的人坐一端、玩家坐揪的人旁邊。27970f958 還沒接（participants []、沒有 stage）＝對照組，預期 FAIL。
FINAL_YEARS = {1: ('Y1S1', 'zhe'), 2: ('Y2S1', 'yu'), 3: ('Y3S1', 'classmate_xinci'), 4: ('Y4S1', 'zhe'), 12: ('Y1S2', 'zhe'), 22: ('Y2S2', 'yu')}   # 12＝大一下、22＝大二下（BB 11-04：548676a3a 驗 Y1S1、Y1S2、Y2S1、Y2S2）
FINAL_KNOWN = ['zhe', 'yu', 'classmate_xinci', 'classmate_bohan', 'classmate_mingxuan', 'classmate_peishan', 'kai', 'heroine_01', 'heroine_03']
SEATSNAP = """(()=>{ const E=GAME.E, P=E.player, L=DAILY_OFFBEAT_LAYOUT, LT=L.seats.filter(q=>q.table===1);
  const onLong=s=>!!s&&LT.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.3), idx=s=>s?LT.findIndex(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.3):-1;
  const known=id=>{ try{ return typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id)!=='STRANGER':true; }catch(e){ return null; } };
  const nm=n=>{ try{ return n.charId&&typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(n.charId):(n.name||''); }catch(e){ return n.name||''; } };
  const ps=P.seat?{x:+P.seat.x.toFixed(2),z:+P.seat.z.toFixed(2)}:null;
  const npcs=(E.npcs||[]).filter(n=>n&&!n.clerk&&!n.offClerk).map(n=>({id:n.charId||null, name:nm(n), extra:!!n.isExtra, known:n.charId?known(n.charId):false,
    seat:n.seat?{x:+n.seat.x.toFixed(2),z:+n.seat.z.toFixed(2)}:null, long:onLong(n.seat), i:idx(n.seat), pose:n.pose||null}));
  return {player:{seat:ps, long:onLong(P.seat), i:idx(P.seat), pose:P.pose}, npcs, longSeats:LT.map(q=>[q.x,q.z]), running:(typeof EVENTS!=='undefined'&&EVENTS.running&&EVENTS.running.id)||null}; })()"""


async def final_case(pg, cdp, errs, year):
    term, host = FINAL_YEARS[year]; tag = 'nichijo⑥ %s' % term
    print('== nichijo_final ⑥ %s 期末最後一科考完那晚：日常失速長桌（AA_648 §6；揪的人 %s）' % (term, host), flush=True)
    await setup(pg, cdp, 'wenzhou', -33.0, -9.6, -math.pi / 2, 15.0, why='先讀一次檔，讓遊戲算 %s 期末最後一科考完的時間' % term)
    info = await pg.evaluate("""(t=>{ let e=null; try{ e=CLS.lastExamEnd(GAME.G,t,'final'); }catch(err){ e={err:String(err)}; }
      const evs=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).filter(x=>/^ev_term_last_meal/.test(x.id)&&(x.term||[]).includes(t)&&!x.retired).map(x=>({id:x.id, loc:x.location, time:x.time, participants:x.participants}));
      return {e, evs, cast:(typeof OFFB!=='undefined'&&OFFB.cast)?Object.keys(OFFB.cast):null}; })(%s)""" % J(term))
    print('  CLS.lastExamEnd(%s, final)＋這學期的期末聚餐事件：%s' % (term, J(info)), flush=True)
    e = info['e']
    if not check('%s 前置：算得出 %s 期末最後一科考完的時間' % (tag, term), bool(e) and 'day' in e, J(e)): return
    if not info['evs']: obs('%s：%s 沒有 ev_term_last_meal* 事件（offbeat_sys3d.js：「大三、大四原本沒有這一場，照不另外加不加」；AA_648 §6 列了大三芯慈、大四阿哲）' % (tag, term))
    evid = info['evs'][0]['id'] if info['evs'] else None
    h = max(17.1, (e.get('h') or 0) + 0.1)
    social = {'rel': {i: {'fam': 45 - 3 * k, 'trust': 30, 'aff': 28, 'resp': 20, 'comf': 28, 'rom': 0, 'npcRom': 0, 'seen': 10, 'talked': 10} for k, i in enumerate(FINAL_KNOWN)},
              'mem': {i: [{'tag': 'FIRST_MET', 'day': 1, 'note': ''}] for i in FINAL_KNOWN}, 'reveal': {i: 'ACQUAINTANCE' for i in FINAL_KNOWN},
              'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}, 'fm120': True}   # 認識＝FIRST_MET（STORY.knows）；語彤另外要 YT_MET_JOB、阿哲 MET_ZHE
    more = {'flags': dict(FLAGS, noodleTableDay=5, MET_ZHE=True, YT_MET_JOB=True, **{'met_' + i: True for i in FINAL_KNOWN}), 'social': social, 'contacts': {i: 1 for i in FINAL_KNOWN}}
    await setup(pg, cdp, 'wenzhou', -33.0, -9.6, -math.pi / 2, h, dayn=e['day'], quiet=False,
                why='%s 最後一科考完那天 %.2f；flags.noodleTableDay＝5；認識 %s（認識程度依序遞減）' % (term, h, '、'.join(FINAL_KNOWN)), extra=dict(ob_extra(first=False), **more))
    await observers(pg); await drain(pg, cdp, 60)
    pre = await pg.evaluate("""(([t,id])=>{ const G=GAME.G, ev=id&&STORY_EVENTS.find(x=>x.id===id); let ok=null; try{ ok=ev?ev.prereq.custom(Object.assign({},G,{zone:'wz_offbeat'})):null; }catch(e){ ok=String(e); }
      return {finalZone:OFFB.finalZone(G,t), prereqInOffbeat:ok, done:!!(id&&G.events&&G.events.done&&G.events.done[id]), msgs:(G.msgs||[]).slice(-4).map(m=>m.text)}; })(%s)""" % J([term, evid]))
    print('  前置檢查：%s' % J(pre), flush=True)
    check('%s 前置：聚餐地點是日常失速（OFFB.finalZone）、條件在店裡會成立' % tag, pre['finalZone'] == 'wz_offbeat' and pre['prereqInOffbeat'] is True, J(pre))
    k = len(await pg.evaluate("window.__dl||[]")); fb0 = (await zst(pg))['fb']
    s = await go_exit(pg, cdp, errs, '%s 走進日常失速' % tag, '進去日常失速', 'wz_offbeat', OB_DOOR)
    if not s: return
    snap = None; started = False; t0 = time.time()
    while time.time() - t0 < 240:
        await pg.wait_for_timeout(700)
        ru = await pg.evaluate("(id=>({running:!!(typeof EVENTS!=='undefined'&&EVENTS.running), cur:(typeof EVENTS!=='undefined'&&EVENTS.running&&EVENTS.running.id)||null, done:!!(id&&GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id])}))(%s)" % J(evid))
        st = await L.state(pg)
        if (ru['running'] or st['dlg']) and not started:
            started = True; snap = await pg.evaluate(SEATSNAP); await shot(pg, 'ob_final_y%d_start' % year)
            print('  開演那一刻：%s；坐位 %s' % (J(ru), J(snap)), flush=True)
        if st['choices']: await L.tap(pg, cdp, '#choices button:nth-child(1)'); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if started and not st['busy'] and not ru['running'] and (ru['done'] or time.time() - t0 > 60): break
    lines = await dl_since(pg, k); transcript(tag, lines)
    await shot(pg, 'ob_final_y%d_end' % year)
    done = await pg.evaluate("(id=>!!(id&&GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id]))(%s)" % J(evid))
    check('%s：聚餐有觸發（有開始演）' % tag, started, J(lines[:2]))
    check('%s：演完（G.events.done.%s）' % (tag, evid), done)
    snap = snap or {'player': {}, 'npcs': []}
    pl = snap['player']; named = [n for n in snap['npcs'] if n['id'] and not n['extra']]; seated = [n for n in snap['npcs'] if n['seat']]
    # ① 長桌坐得下：在場的有名字 NPC 和玩家都有 seat、都在長桌那一組
    check('%s ①：開演時玩家和有名字的 NPC 都坐在長桌（玩家 seat＝%s；有名字 %d 位）' % (tag, J(pl.get('seat')), len(named)),
          bool(pl.get('long')) and bool(named) and all(n['long'] for n in named), J({'player': pl, 'named': named}))
    # ② 當年揪的人在
    hn = next((n for n in named if n['id'] == host), None)
    check('%s ②：揪的人 %s 在長桌' % (tag, host), bool(hn) and hn['long'], J(hn))
    # ③ 玩家坐在揪的人旁邊
    adj = False
    if hn and hn['seat'] and pl.get('seat'):
        d = math.hypot(hn['seat']['x'] - pl['seat']['x'], hn['seat']['z'] - pl['seat']['z'])
        same_side = hn['i'] >= 0 and pl.get('i', -1) >= 0 and (hn['i'] // 4 == pl['i'] // 4) and abs(hn['i'] - pl['i']) == 1
        adj = d <= 0.9 or same_side
        print('  玩家與揪的人：距離 %.2f m；layout 座位 %s／%s' % (d, pl.get('i'), hn['i']), flush=True)
    check('%s ③：玩家坐在揪的人旁邊（≤ 0.9 m 或相鄰座位）' % tag, adj)
    # ③b（BB 11-04 (d)）：揪的人坐長桌一端＝沿長邊離桌子中心最遠的座位（layout 0、3、4、7；兩側各兩端）
    ls = snap.get('longSeats') or []
    end_ok = False
    if hn and hn['seat'] and ls:
        cx = sum(q[0] for q in ls) / len(ls); far = max(abs(q[0] - cx) for q in ls)
        end_ok = abs(abs(hn['seat']['x'] - cx) - far) <= 0.15
        print('  揪的人座位 x=%.2f；長桌中心 x=%.2f，一端離中心 %.2f m' % (hn['seat']['x'], cx, far), flush=True)
    check('%s ③b：揪的人坐長桌一端（離中心最遠的座位）' % tag, end_ok, J(hn and hn['seat']))
    # ④ 有名字的最多 6 個；空位是不認識的同學，不講話
    strangers = [n for n in seated if n['long'] and (n['extra'] or not n['known'])]
    snames = {n['name'] for n in strangers if n['name']}
    talk = [l for l in lines if l['n'] and l['n'] in snames]
    check('%s ④：有名字的（含揪的人）最多 6 個（%d）' % (tag, len(named)), 0 < len(named) <= 6, J([n['id'] for n in named]))
    check('%s ④：坐空位的不認識同學沒有台詞（%d 位：%s）' % (tag, len(strangers), J(sorted(snames))), not talk, J(talk[:3]))
    obs('%s 長桌坐了 %d 人（玩家＋%d）；七人長桌（layout 的 table 1 有 %d 個座位）' % (tag, int(bool(pl.get('long'))) + len([n for n in seated if n['long']]), len([n for n in seated if n['long']]), len(snap.get('longSeats') or [])))
    # ⑤ 演完：自由走動、大家都起身
    after = await pg.evaluate(SEATSNAP)
    left = [n for n in after['npcs'] if n['seat'] and n['long'] and n['id'] in {m['id'] for m in named}]
    check('%s ⑤：演完以後玩家和有名字的 NPC 都起身（seat 清掉）' % tag, not after['player'].get('seat') and not left, J({'player': after['player'], 'still': left}))
    await stuck_check(pg, cdp, '%s ⑤ 演完' % tag, fb0)


async def case_nichijo_final(pg, cdp, errs): await final_case(pg, cdp, errs, 1)
async def case_nichijo_final_y2(pg, cdp, errs): await final_case(pg, cdp, errs, 2)
async def case_nichijo_final_y1s2(pg, cdp, errs): await final_case(pg, cdp, errs, 12)
async def case_nichijo_final_y2s2(pg, cdp, errs): await final_case(pg, cdp, errs, 22)


async def final_none(pg, cdp, errs, year):
    """BB 11-04 更正：AA_648 §5（8ede8603f）大三、大四「不加」——那天走進日常失速＝照平常的店，不演期末聚餐、不卡住。"""
    term, _ = FINAL_YEARS[year]; tag = 'nichijo⑥ %s（不加）' % term
    print('== nichijo_final_y%d ⑥ %s 期末最後一科考完那晚：走進日常失速，應該照平常的店（AA_648 §5 不加）' % (year, term), flush=True)
    await setup(pg, cdp, 'wenzhou', -33.0, -9.6, -math.pi / 2, 15.0, why='先讀一次檔，讓遊戲算 %s 期末最後一科考完的時間' % term)
    info = await pg.evaluate("""(t=>{ let e=null; try{ e=CLS.lastExamEnd(GAME.G,t,'final'); }catch(err){ e={err:String(err)}; }
      const evs=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).filter(x=>/^ev_term_last_meal/.test(x.id)&&(x.term||[]).includes(t)&&!x.retired).map(x=>x.id);
      return {e, evs}; })(%s)""" % J(term))
    print('  %s：%s' % (term, J(info)), flush=True)
    check('%s：這學期沒有 ev_term_last_meal* 事件' % tag, not info['evs'], J(info['evs']))
    e = info['e']
    if not check('%s 前置：算得出 %s 期末最後一科考完的時間' % (tag, term), bool(e) and 'day' in e, J(e)): return
    h = max(17.1, (e.get('h') or 0) + 0.1)
    social = {'rel': {i: {'fam': 45 - 3 * k, 'trust': 30, 'aff': 28, 'resp': 20, 'comf': 28, 'rom': 0, 'npcRom': 0, 'seen': 10, 'talked': 10} for k, i in enumerate(FINAL_KNOWN)},
              'mem': {i: [{'tag': 'FIRST_MET', 'day': 1, 'note': ''}] for i in FINAL_KNOWN}, 'reveal': {i: 'ACQUAINTANCE' for i in FINAL_KNOWN},
              'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}, 'fm120': True}   # 認識＝FIRST_MET（STORY.knows）；語彤另外要 YT_MET_JOB、阿哲 MET_ZHE
    more = {'flags': dict(FLAGS, noodleTableDay=5, MET_ZHE=True, YT_MET_JOB=True, **{'met_' + i: True for i in FINAL_KNOWN}), 'social': social, 'contacts': {i: 1 for i in FINAL_KNOWN}}
    await setup(pg, cdp, 'wenzhou', -33.0, -9.6, -math.pi / 2, h, dayn=e['day'], quiet=False,
                why='%s 最後一科考完那天 %.2f（條件事件照開）' % (term, h), extra=dict(ob_extra(first=False), **more))
    await observers(pg); await drain(pg, cdp, 60)
    k = len(await pg.evaluate("window.__dl||[]")); fb0 = (await zst(pg))['fb']
    s = await go_exit(pg, cdp, errs, '%s 走進日常失速' % tag, '進去日常失速', 'wz_offbeat', OB_DOOR)
    if not s: return
    seen = set(); t0 = time.time()
    while time.time() - t0 < 45:
        await pg.wait_for_timeout(700)
        cur = await pg.evaluate("(typeof EVENTS!=='undefined'&&EVENTS.running&&EVENTS.running.id)||null")
        if cur: seen.add(cur)
        st = await L.state(pg)
        if st['choices']: await L.tap(pg, cdp, '#choices button:nth-child(1)'); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); continue
    lines = await dl_since(pg, k); transcript(tag, lines)
    await shot(pg, 'ob_final_y%d_none' % year)
    snap = await pg.evaluate(SEATSNAP)
    meal = [x for x in seen if 'last_meal' in x]
    check('%s：走進店裡沒有演期末聚餐（演過的事件 %s）' % (tag, J(sorted(seen))), not meal and not any('長桌又併起來' in l['t'] or '最後一科考完' in l['t'] for l in lines), J([l['t'] for l in lines][:6]))
    check('%s：玩家沒被安排到座位（照平常的店）' % tag, not snap['player'].get('seat'), J(snap['player']))
    await stuck_check(pg, cdp, '%s 進店以後' % tag, fb0)


async def case_nichijo_final_y3(pg, cdp, errs): await final_none(pg, cdp, errs, 3)
async def case_nichijo_final_y4(pg, cdp, errs): await final_none(pg, cdp, errs, 4)


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
        for c, fn in (('a', case_a), ('b', case_b), ('c', case_c), ('shots', case_shots), ('facade', case_facade), ('closed', case_closed), ('order', case_order), ('date_zr', case_date_zr), ('rain', case_rain), ('names', case_names),
                      ('nichijo_enter', case_nichijo_enter), ('nichijo_order', case_nichijo_order), ('nichijo_cat', case_nichijo_cat),
                      ('nichijo_game', case_nichijo_game), ('nichijo_close', case_nichijo_close), ('nichijo_final', case_nichijo_final),
                      ('nichijo_final_y2', case_nichijo_final_y2), ('nichijo_final_y1s2', case_nichijo_final_y1s2), ('nichijo_final_y2s2', case_nichijo_final_y2s2), ('nichijo_final_y3', case_nichijo_final_y3), ('nichijo_final_y4', case_nichijo_final_y4)):
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
