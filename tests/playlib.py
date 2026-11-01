"""真實玩家測試共用工具（2026-10-10 建立，使用者訂的「全遊戲真實玩家測試制度」）。

規則（docs/TESTING.md）：
- 「真實玩家流程測試」不用 ?turbo：turbo 會讓劇情的自動走路直接瞬移、時間加速，教室卡住的 bug 就是這樣被藏起來的。
- 前置條件可以用捷徑（讀檔到某個時間地點、設定旗標），但一定要用 run.setup() 印出「[前置／捷徑]」，讓報告看得出來。
- 玩家的操作一律走真的介面：CDP 觸控按在搖桿 #joy、點對話框 #dlg、點選項按鈕、點互動按鈕 #interact。
- 失敗時留下截圖（run.shot）與步驟紀錄，方便重現。
"""
import json, math, os, time

ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'


class Run:
    def __init__(self, name, outdir):
        self.name = name; self.fails = []; self.outdir = outdir; self.t0 = time.time(); self.n = 0
        os.makedirs(outdir, exist_ok=True)

    def check(self, name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
        if not ok: self.fails.append(name)
        return ok

    def note(self, s): print(f'  [{time.time() - self.t0:6.1f}s] {s}', flush=True)

    def setup(self, s): print(f'  [前置／捷徑] {s}', flush=True)

    async def shot(self, pg, label):
        self.n += 1; p = os.path.join(self.outdir, f'{self.n:02d}_{label}.png')
        try: await pg.screenshot(path=p)
        except Exception as e: print('  screenshot failed', e)
        return p

    def finish(self):
        print('ALL PASS' if not self.fails else 'FAILED: ' + ', '.join(self.fails), flush=True)
        return 1 if self.fails else 0


def law_url(url):
    """法律系開局（8/22 法律系宿營 → 8/29 搬宿舍）：2026-10-17 第 7 組以後新遊戲預設是經濟系開局（2024-08-23 經濟系宿營），測法律系開局加 ?start1"""
    if 'start1' in url or 'start0' in url: return url
    return url + ('&' if '?' in url else '?') + 'start1'


def legacy_url(url):
    """舊的法律系開局（9/17 宿舍第一晚、第一二天主線）：新遊戲預設是 8/22 宿營（CAMP-L1），測舊開局的流程加 ?start0（舊存檔還在這條路上）"""
    if 'start0' in url: return url
    return url + ('&' if '?' in url else '?') + 'start0'


async def launch(p, landscape=True):
    """手機模擬（is_mobile、has_touch、iPhone UA）。landscape=True 是 844×390 橫向，False 是 390×844 直向"""
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
    vp = {'width': 844, 'height': 390} if landscape else {'width': 390, 'height': 844}
    ctx = await b.new_context(viewport=vp, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
    pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    return b, ctx, pg, cdp, errs


async def wait_loaded(pg, timeout_s=180):
    # 2026-10-16 開遊戲加速：主要角色、路人改在標題畫面出來以後背景下載（game3d.js boot）。測試多半用 load_state 直接讀檔（不經過「開始」的 waitChars），
    # 所以這裡也等人物全部到齊（GAME.charsAll），測試開始時的狀態和以前一樣；量載入時間、標題先出來的測試用 tests/boot_fast.py
    for i in range(int(timeout_s * 2)):
        if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')&&(!GAME.charsAllP||!!GAME.charsAll)"): return True
        await pg.wait_for_timeout(500)
    return False


async def no_phone_auto(pg):
    """[前置] 只關「要回覆的訊息自動打開手機」（D103）。重新整理以後、從選單讀檔以前叫：讀進來的存檔有要回的訊息時，手機會自己打開、遊戲暫停，搖桿推不動（BB-B v9.10.7 回歸 10-24：flow_wancai_stairs、flow_wancai_floors、flow_classes）"""
    await pg.evaluate("(()=>{ if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; })()")

async def load_state(pg, st, quiet_events=False, quiet_phone=False):
    """[前置] 用遊戲自己的讀檔（GAME.applySave）把玩家放到某個時間地點。quiet_events=True 會關掉條件事件，也關掉「要回覆的訊息自動打開手機」（只給不測劇情、手機的測試用）。
    手機自動打開（D103，v9.10.1 起）會暫停遊戲；讀檔的狀態有要回的訊息時（例：預設交往中的可昕傳「週末來木柵大學？我當導遊。」），測試跑到一半手機跳出來，
    之後的搖桿、拖曳、小地圖全部不動（2026-10-18 v9.10.1 發布後 minimap_direction、p0_movement 就是這樣失敗，REL-9101-POSTCHECK-1018）。
    quiet_phone=True 只關「要回覆的訊息自動打開手機」，條件事件照舊（測走路、樓梯、上課，但課前課後的劇情要照演的：flow_wancai_stairs、flow_wancai_floors、flow_classes，BB-B v9.10.7 回歸 10-24）"""
    # 直向畫面一開始有「請把手機轉成橫向（或直接點這裡繼續直向遊玩）」（#rotate.want，點一下才關）：玩家在標題畫面就會點掉它；
    # 讀檔跳過標題畫面時一起關掉，不然第一次點（手機按鈕、地面）會被它吃掉（2026-10-14 flow_typhoon、cg_rain_shots 直向）
    js = "(async(st)=>{ const s=GAME.defaults(st.name||'祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); " + \
         ("EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; " if quiet_events else "") + ("if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; " if (quiet_phone and not quiet_events) else "") + "await GAME.applySave(s); })(" + json.dumps(st) + ")"
    await pg.evaluate(js)


async def touch_tap(cdp, x, y):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def center_of(pg, sel):
    return await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); if(!r.width||!r.height) return null; return [r.left+r.width/2, r.top+r.height/2]; })(" + json.dumps(sel) + ")")


TAP_AT_JS = """(s=>{ const e=document.querySelector(s); if(!e) return null;
  const at=()=>{ const r=e.getBoundingClientRect(); if(!r.width||!r.height) return null; const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const inView=cx>=0&&cy>=0&&cx<innerWidth&&cy<innerHeight, h=inView?document.elementFromPoint(cx,cy):null; return {c:[cx,cy],hit:!!h&&(h===e||e.contains(h))}; };
  let a=at(); if(!a) return null; if(!a.hit){ e.scrollIntoView({block:'center',inline:'nearest'}); a=at(); if(!a) return null; }
  return a.c; })(%s)"""


async def tap(pg, cdp, sel):
    """用手指按一下。按鈕在可以捲動的清單裡、還在畫面外面（或被清單的邊切掉）時，先把清單捲到看得到——像玩家先滑一下清單再按
    （2026-10-14 v9.6 回歸：橫向時手機「地點」清單比面板長，「共同教學館」的「前往」在面板下面看不到，原本照座標按到面板外面，什麼都沒發生）。
    捲不過去（面板不能捲）就照舊按那個位置，按不到的話後面的檢查會失敗"""
    c = await pg.evaluate(TAP_AT_JS % json.dumps(sel))
    if not c: return False
    await touch_tap(cdp, c[0], c[1]); return True


async def joystick(pg, cdp, dx, dy, ms):
    """按住搖桿往 (dx,dy) 推 ms 毫秒（dy<0 是往前）"""
    jx, jy = await center_of(pg, '#joy')
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    for i in range(max(4, ms // 80)):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]}); await pg.wait_for_timeout(80)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def push_until(pg, cdp, dx, dy, min_dist, max_pushes=4, ms=1500):
    """推搖桿直到走了 min_dist 公尺（最多推 max_pushes 次，每次 ms 毫秒）；回傳 (走了幾公尺, 推了幾次, 最後的 state)。
    SwiftShader 每秒 1–4 格、遊戲每格最多 0.1 秒：同樣推 1.5 秒，走的距離隨幀率變（2026-10-10 發布前測試：人物在空曠廣場上走路，只走了 0.43 m）。
    卡住的時候推幾次都不會前進，照樣失敗"""
    s = await state(pg); p0 = (s['x'], s['z']); moved = 0.0
    for k in range(max_pushes):
        await joystick(pg, cdp, dx, dy, ms)
        s = await state(pg); moved = math.hypot(s['x'] - p0[0], s['z'] - p0[1])
        if moved >= min_dist: return moved, k + 1, s
    return moved, max_pushes, s


async def drag(pg, cdp, x0, y0, x1, y1, steps=10):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, steps + 1):
        t = i / steps
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * t, 'y': y0 + (y1 - y0) * t}]}); await pg.wait_for_timeout(50)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


# 點地面前的檢查：那一點和上下左右 14 px 都是遊戲畫面（id 'c'）——抬頭顯示（左上角的「下一堂課」，點了會打開手機）的寬度會隨文字變，
# 只檢查那一點的話，檢查完到手指點下去之間字變長，就點到它（2026-10-13：批次 1、2 的 flow_boya_interior 都因此打開手機、遊戲暫停，看起來像卡死）
CANVAS_OK_JS = "const canvasOK=(x,y)=>[[0,0],[14,0],[-14,0],[0,14],[0,-14]].every(([dx,dy])=>{ const e=document.elementFromPoint(x+dx,y+dy); return !!e&&e.id==='c'; });"
OVERLAYS_JS = "['phone','menu','bigmap'].filter(id=>{ const e=document.getElementById(id); return e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'; })"
CLOSE_OF = {'phone': '#btnPhoneClose', 'menu': '#btnClose', 'bigmap': '#bmClose'}


STATE_JS = """(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, D=GAME.D; const ch=document.getElementById('choices'); const it=document.getElementById('interact');
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), ry:+P.obj.rotation.y.toFixed(2), busy:!!P.busy, pose:P.pose, path:P.path?P.path.length:0,
    dlg:!!(D&&D.active), dtext:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60), choices:(ch&&!ch.classList.contains('hide'))?ch.querySelectorAll('button').length:0,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,20):'', hour:+GAME.G.hour.toFixed(2),
    stand:E.canStand?E.canStand(o.x,o.z,0.3):true, camYaw:+E.cam.yaw.toFixed(3), fallbacks:GAME.walkFallbacks||0, y:+o.y.toFixed(2), lv:P.lv|0,
    frame:E.frame|0, paused:!!E.paused}; })()"""   # y、lv：v9.4 多樓層（人物的高度、在第幾層）；frame、paused：遊戲主迴圈有沒有在跑（2026-10-13 博雅「卡住」：查走不動是不是整個遊戲停了）


async def state(pg):
    return await pg.evaluate(STATE_JS)


async def close_panels(pg, cdp):
    """手機、筆記本、大地圖開著（遊戲暫停）：像玩家一樣按「收起來／返回遊戲」關掉。回傳關了哪些（2026-10-17：手機蓋住下課選單，測試一直點被蓋住的選項）"""
    shut = []
    for pid, btn in (('phone', '#btnPhoneClose'), ('menu', '#btnClose'), ('bigmap', '#bmClose')):
        if await pg.evaluate("(id=>{ const e=document.getElementById(id); return !!e&&!e.classList.contains('hide'); })('%s')" % pid):
            if await pg.evaluate("(s=>!!document.querySelector(s))('%s')" % btn): await tap(pg, cdp, btn)
            else: await pg.keyboard.press('Escape')
            await pg.wait_for_timeout(600); shut.append(pid)
    return shut


async def phone_away(pg, cdp, tries=3):
    """手機自己跳出來（要回覆的訊息 D103、經濟系跳日期途中收到訊息）、遊戲暫停：像玩家一樣按「收起來／跳過」。一則只自動開一次，下一則還會再開，所以多按幾次。
    回傳按了幾次（2026-10-19：flow_typhoon、flow_v0_home 停在手機上就是沒按這個）"""
    n = 0
    for i in range(tries):
        if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): break
        await tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700); n += 1
    return n


async def advance_dialogs(pg, cdp, run, until, max_steps=200, pick=0, step_wait=700):
    """像玩家一樣點對話、選選項（選第 pick 個），直到 until(state) 為真；回傳最後的 state。對話一直停在同一句、或沒有對話也沒有進展超過 60 秒都會停下來"""
    last_change = time.time(); last = None
    for i in range(max_steps):
        s = await state(pg)
        if until(s): return s
        key = (s['dtext'], s['choices'], s['zone'], round(s['x'], 1), round(s['z'], 1))
        if key != last: last = key; last_change = time.time()
        if time.time() - last_change > 60:
            run.note('超過 60 秒沒有任何進展：' + json.dumps(s, ensure_ascii=False)); return s
        if s['choices'] and s.get('paused') and await close_panels(pg, cdp): continue
        if s['choices']:
            await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % pick)
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % pick)
            await touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            await tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(step_wait)
    return await state(pg)



async def skip_wake_menu(pg, cdp, wait_s=15):
    """DL-01 起床選單（AA_160 1-2）：睡醒、小睡醒來後，玩家空下來約 4 秒才出（「早安。今天的課：…」＋直接去上課／翹這堂課／先起床再說）。
    出現就點完旁白、選「先起床再說」（期末考那天是「先起床」）；回傳有沒有出現。沒課的日子、第一二天、設定關掉時不會出現（等滿 wait_s 回 False）"""
    for _ in range(int(wait_s * 2)):
        s = await state(pg)
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            for i, o in enumerate(opts):
                if o.startswith('先起床'):
                    c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
                    await touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
                    return True
            return False
        if s['dlg'] and (s['dtext'].startswith('早安') or s['dtext'].startswith('今天還有')):
            await tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False

def angle_deg(dx, dy):
    """畫面座標（y 往下）的方向角：0＝正上方、90＝右、180＝下、270＝左"""
    return (math.degrees(math.atan2(dx, -dy)) + 360) % 360


def ang_diff(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


# ---- 走路：點地面（引擎的自動找路）優先，走不動才用搖桿（2026-10-10 從 flow_main_day12 搬來共用）----
async def find_it(pg, label):
    return await pg.evaluate("(lb=>{ const it=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return it?{x:it.x,z:it.z,r:it.radius||1.5,label:it.label,lv:it.lv===undefined?null:it.lv,y:it.y===undefined?null:it.y}:null; })(%s)" % json.dumps(label))


async def tap_ground(pg, cdp, x, z, lv=None, verify=False, near_y=None):
    """把世界座標投影到螢幕，確認那一點是遊戲畫面（不是按鈕），然後用手指點一下（遊戲會用自動找路走過去）。
    v9.4 多樓層：lv＝那一點在第幾層（投影用那一層地板的高度；點下去遊戲會打到那一層看得到的地板）。
    verify：先用遊戲自己的 E.screenToFloor 確認點下去會落在那一點附近（水平 1 m、高度 0.35 m 內）才點（像玩家看著畫面點，不會點到別層的地板）。
    回傳 dict（螢幕座標、點下去會落在哪裡）或 None"""
    pt = await pg.evaluate("""(([x,z,lv])=>{ """ + CANVAS_OK_JS + """ const E=GAME.E; const y=!E.heightAt?0:((lv===null||lv===undefined)?E.heightAt(x,z,E.player.lv|0):E.heightAt(x,z,lv)); const v=new THREE.Vector3(x,y,z).project(E.camera); if(v.z>1) return null; const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight;
        if(sx<10||sy<10||sx>innerWidth-10||sy>innerHeight-10) return null; const el=document.elementFromPoint(sx,sy); const h=E.screenToFloor?E.screenToFloor(sx,sy):null;
        return {sx,sy,y,ok:!!el&&el.id==='c'&&canvasOK(sx,sy),hit:h?[+h.x.toFixed(2),+h.z.toFixed(2),h.lv|0,+h.y.toFixed(2)]:null}; })(%s)""" % json.dumps([x, z, lv]))
    if not pt or not pt['ok']: return None
    if near_y is not None and pt['hit'] and abs(pt['hit'][3] - near_y) > 1.2: return None   # 沒驗證的點：落點和腳下高度差超過 1.2 m（點到樓梯上、別層的地板）就不點（2026-10-14）
    if verify:
        h = pt['hit']   # 落點和目標的 3D 距離（樓梯兩層共用，不比層）
        if not h or math.hypot(h[0] - x, h[1] - z) > 1.0 or abs(h[3] - pt['y']) > 0.35: return None
    await touch_tap(cdp, pt['sx'], pt['sy']); return pt


async def turn_camera_to(pg, cdp, tx, tz, tries=4):
    """像玩家一樣用一根手指在畫面空白處左右滑，把鏡頭轉到「看向目標」的方向（鏡頭在玩家背後）。
    遊戲：單指拖曳 dx 像素 → 鏡頭 yaw −= dx×0.0075（engine3d.js 的 pointermove；超過 12 px 才算拖曳）。回傳是否轉到 ±0.15 rad 內"""
    for _ in range(tries):
        s = await state(pg)
        want = math.atan2(-(tx - s['x']), -(tz - s['z']))          # 畫面的「前」＝(-sin yaw, -cos yaw) 朝向目標
        dy = (want - s['camYaw'] + math.pi) % (2 * math.pi) - math.pi
        if abs(dy) < 0.15: return True
        px = max(-240.0, min(240.0, -dy / 0.0075))
        # 起點：畫面上半部、不是按鈕的地方（避開搖桿、互動鈕、小地圖、時鐘）
        pt = await pg.evaluate("""(px=>{ for(const fy of [0.4,0.33,0.5,0.27]){ const y=innerHeight*fy, x0=innerWidth/2-px/2; const a=document.elementFromPoint(x0,y), b=document.elementFromPoint(x0+px,y); if(a&&a.id==='c'&&b&&b.id==='c') return {x0,y}; } return null; })(%s)""" % json.dumps(px))
        if not pt: return False
        await drag(pg, cdp, pt['x0'], pt['y'], pt['x0'] + px, pt['y'], steps=12)
        await pg.wait_for_timeout(700)
    return False


async def go_to(pg, cdp, run, tx, tz, near, label, max_s=420, lv=None, stop=None):
    """像玩家一樣走到 (tx,tz) 附近：先點地面（遠的話點中途的點），走不動才改用搖桿朝目標推。回傳是否到達。
    lv（v9.4 多樓層）：目標在第幾層；到達要在那一層（不能只是在正下方／正上方）
    stop（可省略）：stop(state) 為真就停下來、回傳 True——例如走近人物時事件的對話開始了，要由測試自己看台詞、選選項
    （沒給 stop 時，途中出現的對話照舊自動點過去；2026-10-14 flow_b4_lecture 的 B5 就是這樣被點掉、測試看不到開頭）"""
    t0 = time.time(); last = None; last_prog = time.time(); taps = 0; joys = 0; turns = 0; f0 = None
    while time.time() - t0 < max_s:
        s = await state(pg)
        if stop is not None and stop(s):
            run.note(f'「{label}」途中停下（離目標 {math.hypot(tx - s["x"], tz - s["z"]):.2f} m）：{s.get("dtext") or "條件成立"}'); return True
        if f0 is None: f0 = (s.get('frame', 0), s['hour'], time.time())
        d = math.hypot(tx - s['x'], tz - s['z'])
        if d <= near and (lv is None or s.get('lv', 0) == lv):
            # 還在走（路線還沒走完）：真人會等人物停下來再看按鈕、按按鈕。不等的話，人物經過座位旁那一瞬間按鈕是「坐下」
            # （2026-10-10：flow_linze_floors 在 201 往後門走、離目標 0.67 m 時就檢查，按鈕還是最上排座位的「坐下」，停下來後才是「離開教室」）
            t1 = time.time(); moved = time.time(); px, pz = s['x'], s['z']
            while s['path'] and time.time() - t1 < 120 and time.time() - moved < 20:   # 還在走就等：只要 20 秒內有往前走就繼續（最多 120 秒）
                # SwiftShader 0.3–1 fps：201 階梯教室裡 30 秒常常還走不完最後一公尺（2026-10-14 v9.6 候選 13：停在 0.67 m、路線還剩一點就被當成「到了」，
                # 按鈕還沒出現；之後人物照樣走到椅子旁、出現「坐下」。2026-10-13 以前是固定 30 秒）
                await pg.wait_for_timeout(500); s = await state(pg)
                if math.hypot(s['x'] - px, s['z'] - pz) > 0.05: px, pz = s['x'], s['z']; moved = time.time()
            d = math.hypot(tx - s['x'], tz - s['z'])
            if d > near and not s['path']:
                # 走過頭：點下去的地面和目標差了一點（tap_ground 的驗證容許 1 m），人經過目標旁邊、停在 near 以外——真人看按鈕沒出現會用搖桿往目標推一下。
                # （2026-10-13：flow_linze_floors 在 v9.5 和 v9.6 候選版都在這裡失敗過一次——停在第 2 排第 5 個座位旁 0.67 m，「坐下」還沒出現；遊戲本身沒錯，是點到的地面偏了）
                run.note(f'「{label}」：停在離目標 {d:.2f} m（點到的地面偏了），用搖桿往目標推一下')
                for _ in range(6):
                    yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
                    ux, uz = (tx - s['x']) / max(d, 0.01), (tz - s['z']) / max(d, 0.01)
                    await joystick(pg, cdp, int(25 * (ux * rx + uz * rz)), int(-25 * (ux * fx + uz * fz)), 500); joys += 1
                    await pg.wait_for_timeout(700); s = await state(pg); d = math.hypot(tx - s['x'], tz - s['z'])
                    if d <= near: break
            run.note(f'到達「{label}」附近（{d:.2f} m）：點地面 {taps} 次、轉鏡頭 {turns} 次、搖桿 {joys} 次，{time.time()-t0:.0f} 秒'); return True
        if s.get('paused'):   # 手機、選單、地圖開著（遊戲暫停，人走不動）：玩家會先把它關掉
            ov = await pg.evaluate(OVERLAYS_JS)
            if ov:
                run.note(f'「{label}」途中：{"、".join(ov)} 開著（遊戲暫停），先關掉'); await tap(pg, cdp, CLOSE_OF[ov[0]]); await pg.wait_for_timeout(800); continue
        if last is None or math.hypot(s['x'] - last[0], s['z'] - last[1]) > 0.3: last = (s['x'], s['z']); last_prog = time.time()
        if s['busy'] or s['dlg'] or s['choices']:
            await advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40); continue
        if s['path'] and time.time() - last_prog < 20:
            await pg.wait_for_timeout(1500); continue
        # 點地面：先點目標；目標太遠或不在畫面上（例如在鏡頭後面）時，點往目標方向 6 m、3 m、1.5 m 的點（像玩家一樣分段走）
        ok = False
        if time.time() - last_prog < 40:
            # 目標在鏡頭背後（和畫面的「前」夾角超過約 100°）而且還遠：真人會先滑動畫面把鏡頭轉過去，不會對著腳邊一步一步點
            # （2026-10-10 加：flow_linze_floors 從霖澤館後面的小廣場走回穿堂，鏡頭還朝著剛才走的方向，大廳門口在背後，
            #   tap_path 每次只點得到腳邊 1–2 m 的點，點了 13 次才到）
            yaw = s['camYaw']
            if d > 4 and turns < 3 and (tx - s['x']) * -math.sin(yaw) + (tz - s['z']) * -math.cos(yaw) < -0.17 * d:
                turns += 1
                if await turn_camera_to(pg, cdp, tx, tz): s = await state(pg)
            ok = await _tap_toward(pg, cdp, s, tx, tz, d, lv)
            # 目標在鏡頭後面、點不到（例如下課後坐在前排，後門在背後）：真人會先滑動畫面把鏡頭轉過去，看到目標再點
            # （2026-10-10 加：原本直接改推搖桿，朝目標直推會被下一排長桌擋住，flow_class_real 在 cd52bab 推了 69 次沒前進）
            if not ok and turns < 3:
                turns += 1
                if await turn_camera_to(pg, cdp, tx, tz): ok = await _tap_toward(pg, cdp, await state(pg), tx, tz, d, lv)
        if ok:
            taps += 1; await pg.wait_for_timeout(2500); continue
        # 點不到（不在畫面上、被按鈕擋住）或一直沒進展：搖桿朝目標推。
        # 鏡頭在玩家的 (sin yaw, cos yaw) 那一側，畫面的「前」＝(-sin yaw, -cos yaw)、「右」＝(cos yaw, -sin yaw)；搖桿往右推是 +x、往前推是 -y
        # （2026-10-10 修正：原本左右的正負號寫反，目標在右邊時往左推，flow_class_real 下課後走到教室左後角）
        yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        ax, az = tx, tz
        if lv is not None and lv != s.get('lv', 0):   # 目標在別層：朝路線接下來的方向推（例如樓梯口），不是朝目標的直線方向（2026-10-14）
            ah = await pg.evaluate(PATH_AHEAD_JS % json.dumps([tx, tz, lv, 2.0]))
            if ah: ax, az = ah['x'], ah['z']
        da = max(math.hypot(ax - s['x'], az - s['z']), 0.01); ux, uz = (ax - s['x']) / da, (az - s['z']) / da
        await joystick(pg, cdp, int(40 * (ux * rx + uz * rz)), int(-40 * (ux * fx + uz * fz)), 1200); joys += 1
        await pg.wait_for_timeout(300)
    s = await state(pg)
    run.note(f'走不到「{label}」：最後位置 ({s["x"]},{s["z"]})，目標 ({tx},{tz})；點地面 {taps} 次、轉鏡頭 {turns} 次、搖桿 {joys} 次')
    if f0:   # 遊戲主迴圈有沒有在跑：畫了幾格、遊戲時間走了多少、是不是暫停、哪些面板開著（2026-10-13 博雅：走不動時遊戲時間幾乎停住）
        ov = await pg.evaluate("['phone','menu','bigmap','dlg','choices','titleScreen','loading'].filter(id=>{ const e=document.getElementById(id); return e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'; })")
        run.note(f'  這段時間：畫面 {s.get("frame", 0) - f0[0]} 格／{time.time() - f0[2]:.0f} 秒、遊戲時間 {f0[1]:.2f}→{s["hour"]:.2f}、paused={s.get("paused")}、開著的面板 {ov}')
    return False


PICK_TAP_JS = """(([tx,tz,tlv])=>{ """ + CANVAS_OK_JS + """ const E=GAME.E, P=E.player, o=P.obj.position, plv=P.lv|0; if(!E.pathTo||!E.screenToFloor) return null;
  const glv=(tlv===null||tlv===undefined)?plv:tlv; const p=E.pathTo(o.x,o.z,plv,tx,tz,glv); if(!p||!p.length) return {why:'沒有路'};
  // 路線上每 0.75 m 一個點（含層）：從最遠的往回找第一個「畫面上看得到、點下去遊戲真的會打到那一點」的
  const pts=[]; let ax=o.x, az=o.z, al=plv;
  for(const q of p){ const bl=q.length>2?q[2]|0:al, L=Math.hypot(q[0]-ax,q[1]-az), n=Math.max(1,Math.ceil(L/0.75)); for(let i=1;i<=n;i++) pts.push([ax+(q[0]-ax)*i/n, az+(q[1]-az)*i/n, i<n?al:bl]); ax=q[0]; az=q[1]; al=bl; }
  for(let i=pts.length-1;i>=0;i--){ const [x,z,l]=pts[i]; const y=E.heightAt?E.heightAt(x,z,l):0; const v=new THREE.Vector3(x,y,z).project(E.camera); if(v.z>1) continue;
    const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight; if(sx<10||sy<10||sx>innerWidth-10||sy>innerHeight-10) continue; if(!canvasOK(sx,sy)) continue;
    const h=E.screenToFloor(sx,sy); if(!h||Math.hypot(h.x-x,h.z-z)>0.8||Math.abs(h.y-y)>0.35) continue;   /* 比 3D 位置不比層：樓梯兩層共用，第二跑的透明地板標第 1 層 */
    return {sx,sy,x,z,lv:l,k:i,n:pts.length}; }
  return {why:'路線上沒有看得到的點',n:pts.length}; })(%s)"""


PATH_AHEAD_JS = """(([tx,tz,tlv,ahead])=>{ const E=GAME.E, P=E.player, o=P.obj.position, plv=P.lv|0; if(!E.pathTo) return null;
  const glv=(tlv===null||tlv===undefined)?plv:tlv; const p=E.pathTo(o.x,o.z,plv,tx,tz,glv); if(!p||!p.length) return null;
  let ax=o.x, az=o.z, acc=0; for(const q of p){ const L=Math.hypot(q[0]-ax,q[1]-az); if(acc+L>=ahead){ const f=(ahead-acc)/Math.max(L,1e-6); return {x:ax+(q[0]-ax)*f, z:az+(q[1]-az)*f}; } acc+=L; ax=q[0]; az=q[1]; }
  return {x:ax,z:az}; })(%s)"""


async def tap_path(pg, cdp, tx, tz, lv=None):
    """像玩家一樣看著畫面點：沿著遊戲找路的路線（E.pathTo），點最遠的、畫面上看得到、而且點下去真的會落在那裡（E.screenToFloor 驗證）的點。
    真人會點看得到的地板（例如樓梯的踏面），一段一段走過去；這個函式只是用遊戲自己的路線替測試挑「看得到的那一段」，
    點擊本身是真的觸控事件，移動由遊戲的點地面移動完成（2026-10-10，flow_linze_floors：目標在二樓時，原本只點目標本身，
    從一樓投影到二樓的點不在畫面上，就改推搖桿直衝，卡在樓梯扶手外面）。回傳點到的點（dict）或 None"""
    pk = await pg.evaluate(PICK_TAP_JS % json.dumps([tx, tz, lv]))
    if not pk or 'sx' not in pk: return None
    await touch_tap(cdp, pk['sx'], pk['sy']); return pk


async def _tap_toward(pg, cdp, s, tx, tz, d, lv):
    """點目標（點下去會落在目標附近才點）；不行就沿著路線點看得到的點（tap_path）；再不行照舊：直接點目標、點往目標方向 6 m、3 m、1.5 m 的點。
    回傳點了什麼（字串）或 None。環境變數 PLAYLIB_TAPLOG=1 會印出每一次點地面（查「點了好幾次才走到」用）"""
    how = None
    pt = await tap_ground(pg, cdp, tx, tz, lv, verify=True)
    if pt: how = f'目標 落點{pt["hit"]}'
    if not how:
        pk = await tap_path(pg, cdp, tx, tz, lv)
        if pk: how = f'路線上第 {pk["k"]+1}/{pk["n"]} 點 ({pk["x"]:.1f},{pk["z"]:.1f},第{pk["lv"]}層)'
    other = lv is not None and lv != s.get('lv', 0)
    if not how and other:
        # 目標在別層、路線上又沒有看得到的點（例如往下的樓梯在鏡頭背後）：真人會先把鏡頭轉向路線接下來的方向（樓梯），看到了再點。
        # 不直接點目標在畫面上的位置——那一點會落在這一層的地板上，人往反方向走，走回樓梯口又點一次，一直來回
        # （2026-10-14 v9.6 回歸 flow_boya_interior、flow_teaching_buildings：二樓樓梯頂端、鏡頭在人前面往回看，來回點了 61 次）
        ah = await pg.evaluate(PATH_AHEAD_JS % json.dumps([tx, tz, lv, 3.0]))
        if ah and await turn_camera_to(pg, cdp, ah['x'], ah['z']):
            pk = await tap_path(pg, cdp, tx, tz, lv)
            if pk: how = f'轉向路線（{ah["x"]:.1f},{ah["z"]:.1f}）後點路線上第 {pk["k"]+1}/{pk["n"]} 點 ({pk["x"]:.1f},{pk["z"]:.1f},第{pk["lv"]}層)'
    if not how and not other:
        pt = await tap_ground(pg, cdp, tx, tz, lv, near_y=s.get('y'))
        if pt: how = f'目標（未驗證）落點{pt["hit"]}'
    for step in (6.0, 3.0, 1.5):
        if how or (lv is not None and lv != s.get('lv', 0)): break   # 目標在別層：中途的直線點不知道在哪一層，不點
        f = min(1.0, step / max(d, 0.01)); pt = await tap_ground(pg, cdp, s['x'] + (tx - s['x']) * f, s['z'] + (tz - s['z']) * f, near_y=s.get('y'))
        if pt: how = f'往目標 {step} m 落點{pt["hit"]}'
    if os.environ.get('PLAYLIB_TAPLOG'): print(f'  [點地面] 在 ({s["x"]},{s["z"]},第{s.get("lv",0)}層) 鏡頭 {s["camYaw"]} → {how or "沒有點得到的地方"}', flush=True)
    return how
