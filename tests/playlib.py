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


async def launch(p, landscape=True):
    """手機模擬（is_mobile、has_touch、iPhone UA）。landscape=True 是 844×390 橫向，False 是 390×844 直向"""
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
    vp = {'width': 844, 'height': 390} if landscape else {'width': 390, 'height': 844}
    ctx = await b.new_context(viewport=vp, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
    pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    return b, ctx, pg, cdp, errs


async def wait_loaded(pg, timeout_s=180):
    for i in range(int(timeout_s * 2)):
        if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): return True
        await pg.wait_for_timeout(500)
    return False


async def load_state(pg, st, quiet_events=False):
    """[前置] 用遊戲自己的讀檔（GAME.applySave）把玩家放到某個時間地點。quiet_events=True 會關掉條件事件（只給不測劇情的測試用）"""
    js = "(async(st)=>{ const s=GAME.defaults(st.name||'祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); " + \
         ("EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; " if quiet_events else "") + "await GAME.applySave(s); })(" + json.dumps(st) + ")"
    await pg.evaluate(js)


async def touch_tap(cdp, x, y):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def center_of(pg, sel):
    return await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); if(!r.width||!r.height) return null; return [r.left+r.width/2, r.top+r.height/2]; })(" + json.dumps(sel) + ")")


async def tap(pg, cdp, sel):
    c = await center_of(pg, sel)
    if not c: return False
    await touch_tap(cdp, c[0], c[1]); return True


async def joystick(pg, cdp, dx, dy, ms):
    """按住搖桿往 (dx,dy) 推 ms 毫秒（dy<0 是往前）"""
    jx, jy = await center_of(pg, '#joy')
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    for i in range(max(4, ms // 80)):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]}); await pg.wait_for_timeout(80)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def drag(pg, cdp, x0, y0, x1, y1, steps=10):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, steps + 1):
        t = i / steps
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * t, 'y': y0 + (y1 - y0) * t}]}); await pg.wait_for_timeout(50)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


STATE_JS = """(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, D=GAME.D; const ch=document.getElementById('choices'); const it=document.getElementById('interact');
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), ry:+P.obj.rotation.y.toFixed(2), busy:!!P.busy, pose:P.pose, path:P.path?P.path.length:0,
    dlg:!!(D&&D.active), dtext:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60), choices:(ch&&!ch.classList.contains('hide'))?ch.querySelectorAll('button').length:0,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,20):'', hour:+GAME.G.hour.toFixed(2),
    stand:E.canStand?E.canStand(o.x,o.z,0.3):true, camYaw:+E.cam.yaw.toFixed(3), fallbacks:GAME.walkFallbacks||0}; })()"""


async def state(pg):
    return await pg.evaluate(STATE_JS)


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
        if s['choices']:
            await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % pick)
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % pick)
            await touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            await tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(step_wait)
    return await state(pg)


def angle_deg(dx, dy):
    """畫面座標（y 往下）的方向角：0＝正上方、90＝右、180＝下、270＝左"""
    return (math.degrees(math.atan2(dx, -dy)) + 360) % 360


def ang_diff(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


# ---- 走路：點地面（引擎的自動找路）優先，走不動才用搖桿（2026-10-10 從 flow_main_day12 搬來共用）----
async def find_it(pg, label):
    return await pg.evaluate("(lb=>{ const it=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return it?{x:it.x,z:it.z,r:it.radius||1.5,label:it.label}:null; })(%s)" % json.dumps(label))


async def tap_ground(pg, cdp, x, z):
    """把世界座標投影到螢幕，確認那一點是遊戲畫面（不是按鈕），然後用手指點一下（遊戲會用自動找路走過去）"""
    pt = await pg.evaluate("""(([x,z])=>{ const E=GAME.E; const v=new THREE.Vector3(x,0,z).project(E.camera); if(v.z>1) return null; const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight;
        if(sx<10||sy<10||sx>innerWidth-10||sy>innerHeight-10) return null; const el=document.elementFromPoint(sx,sy); return {sx,sy,ok:!!el&&el.id==='c'}; })(%s)""" % json.dumps([x, z]))
    if not pt or not pt['ok']: return False
    await touch_tap(cdp, pt['sx'], pt['sy']); return True


async def go_to(pg, cdp, run, tx, tz, near, label, max_s=420):
    """像玩家一樣走到 (tx,tz) 附近：先點地面（遠的話點中途的點），走不動才改用搖桿朝目標推。回傳是否到達"""
    t0 = time.time(); last = None; last_prog = time.time(); taps = 0; joys = 0
    while time.time() - t0 < max_s:
        s = await state(pg)
        d = math.hypot(tx - s['x'], tz - s['z'])
        if d <= near:
            run.note(f'到達「{label}」附近（{d:.2f} m）：點地面 {taps} 次、搖桿 {joys} 次，{time.time()-t0:.0f} 秒'); return True
        if last is None or math.hypot(s['x'] - last[0], s['z'] - last[1]) > 0.3: last = (s['x'], s['z']); last_prog = time.time()
        if s['busy'] or s['dlg'] or s['choices']:
            await advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40); continue
        if s['path'] and time.time() - last_prog < 20:
            await pg.wait_for_timeout(1500); continue
        # 點地面：先點目標；目標太遠或不在畫面上（例如在鏡頭後面）時，點往目標方向 6 m、3 m、1.5 m 的點（像玩家一樣分段走）
        ok = False
        if time.time() - last_prog < 40:
            ok = await tap_ground(pg, cdp, tx, tz)
            for step in (6.0, 3.0, 1.5):
                if ok: break
                f = min(1.0, step / max(d, 0.01)); ok = await tap_ground(pg, cdp, s['x'] + (tx - s['x']) * f, s['z'] + (tz - s['z']) * f)
        if ok:
            taps += 1; await pg.wait_for_timeout(2500); continue
        # 點不到（不在畫面上、被按鈕擋住）或一直沒進展：搖桿朝目標推。
        # 鏡頭在玩家的 (sin yaw, cos yaw) 那一側，畫面的「前」＝(-sin yaw, -cos yaw)、「右」＝(cos yaw, -sin yaw)；搖桿往右推是 +x、往前推是 -y
        # （2026-10-10 修正：原本左右的正負號寫反，目標在右邊時往左推，flow_class_real 下課後走到教室左後角）
        yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        ux, uz = (tx - s['x']) / d, (tz - s['z']) / d
        await joystick(pg, cdp, int(40 * (ux * rx + uz * rz)), int(-40 * (ux * fx + uz * fz)), 1200); joys += 1
        await pg.wait_for_timeout(300)
    s = await state(pg)
    run.note(f'走不到「{label}」：最後位置 ({s["x"]},{s["z"]})，目標 ({tx},{tz})；點地面 {taps} 次、搖桿 {joys} 次'); return False
