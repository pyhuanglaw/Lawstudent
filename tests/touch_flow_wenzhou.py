"""手機觸控整合測試：溫州街 → 進兩點半 Café → 和沈以安說話 → 坐下 → 離開 → 存檔 → 重新整理 → 讀檔 → 繼續走。
玩家的每一個操作都用 CDP 觸控事件（touchStart/touchEnd 點擊、在 #joy 上拖曳），不用滑鼠、不用鍵盤、不直接呼叫遊戲函式。
（測試前置：用 localStorage 放一個「週六 14:50、在溫州街東口」的自動存檔，再從標題畫面點「繼續」。）
iPhone 直向 390×844、is_mobile、has_touch。截圖存到 docs/art-rebuild/screenshots/flow_*.png。
用法：python3 tests/touch_flow_wenzhou.py [URL]   （預設 http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys, math, time
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
URL = BASE + ('&' if '?' in BASE else '?') + 'turbo'
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
EXE = '/opt/pw-browsers/chromium'
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + str(info) if info else ''), flush=True)
    if not ok: fails.append(name)

class Touch:
    def __init__(s, pg, cdp): s.pg = pg; s.cdp = cdp
    async def tap(s, x, y):
        await s.cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
        await s.pg.wait_for_timeout(70)
        await s.cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    async def tap_el(s, sel, nth=0):
        r = await s.pg.evaluate("([sel,n])=>{ const els=[...document.querySelectorAll(sel)].filter(e=>{ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'; }); const e=els[n]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }", [sel, nth])
        if not r: return False
        await s.tap(r[0], r[1]); return True
    async def joy(s, dx, dy, ms):
        jx, jy = await s.pg.evaluate("(()=>{ const r=document.getElementById('joy').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
        await s.cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
        for i in range(max(3, ms // 80)):
            await s.cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]}); await s.pg.wait_for_timeout(80)
        await s.cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})

async def state(pg):
    return await pg.evaluate("""(()=>{ const E=GAME.E,P=E.player; const vis=id=>{ const e=document.getElementById(id); return !!(e&&!e.classList.contains('hide')); };
      return {zone:GAME.G&&GAME.G.zone, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), yaw:+P.obj.rotation.y.toFixed(2), camYaw:+E.cam.yaw.toFixed(2), busy:!!P.busy, pose:P.pose,
        dlg:vis('dlg'), choices:vis('choices')?document.querySelectorAll('#choices button').length:0, interact:vis('interact')?document.getElementById('interactLabel').textContent:'',
        text:(document.getElementById('dlgText')||{}).textContent||'', name:(document.getElementById('dlgName')||{}).textContent||'', fade:document.getElementById('fade').classList.contains('on'), menu:vis('menu') }; })()""")

async def screen_of(pg, x, z, y=0.0):
    return await pg.evaluate(f"(()=>{{ const v=new THREE.Vector3({x},{y},{z}); v.project(GAME.E.camera); return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z]; }})()")

async def walk_to(pg, t, x, z, label, tol=1.3, max_s=150):
    """用觸控走到 (x,z)：目標在畫面裡就點地面（點地移動），不在畫面裡就用搖桿朝目標推。"""
    t0 = time.time(); st = await state(pg)
    while time.time() - t0 < max_s:
        st = await state(pg)
        d = math.hypot(st['x'] - x, st['z'] - z)
        if d < tol: return st
        sx, sy, sz = await screen_of(pg, x, z)
        W, H = await pg.evaluate("[innerWidth,innerHeight]")
        if 0 < sx < W and 140 < sy < H - 200 and sz < 1:
            await t.tap(sx, sy); await pg.wait_for_timeout(2200)
        else:
            # 搖桿：像玩家一樣看畫面推——目標在鏡頭的右邊就往右推、在前面就往上推。鏡頭在玩家的 (sin yaw, cos yaw) 那一側，
            # 畫面的「前」＝(-sin yaw,-cos yaw)、「右」＝(cos yaw,-sin yaw)；搖桿 x＝目標方向·右、y＝−目標方向·前
            # （2026-10-10：原本這裡照引擎當時寫反的旋轉反算，所以測試一直沒發現鏡頭轉到側面時搖桿方向相反）
            wx, wz = x - st['x'], z - st['z']; L = math.hypot(wx, wz) or 1; wx /= L; wz /= L
            a = st['camYaw']; mx = wx * math.cos(a) - wz * math.sin(a); mz = wx * math.sin(a) + wz * math.cos(a)
            await t.joy(mx * 58, mz * 58, 900 if d > 6 else 400)
    print('  walk timeout', label, st)
    return st

async def advance_dialogue(pg, t, choose=0, max_steps=80, shots=None):
    seen = []
    for i in range(max_steps):
        st = await state(pg)
        if st['choices']:
            if shots: await pg.screenshot(path=shots + '_choice.png'); shots = None
            await t.tap_el('#choices button', choose if isinstance(choose, int) else 0); await pg.wait_for_timeout(600); continue
        if st['dlg']:
            if st['text'] and (not seen or seen[-1] != st['text']):
                seen.append(st['text']); print('   ', (st['name'] or '旁白') + '：' + st['text'][:46], flush=True)
                if shots and len(seen) == 2: await pg.screenshot(path=shots + '_dialogue.png')
            # 點畫面中間（不是只點對話框）也要能繼續
            if i % 2: await t.tap_el('#dlg')
            else: await t.tap(195, 330)
            await pg.wait_for_timeout(450); continue
        if not st['busy'] and not st['fade']:
            await pg.wait_for_timeout(500); st2 = await state(pg)
            if not st2['busy'] and not st2['dlg'] and not st2['choices']: return seen
        await pg.wait_for_timeout(500)
    return seen

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); t = Touch(pg, cdp)
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
        pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type == 'error' and '404' not in m.text and 'fonts.g' not in m.text else None)
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        # 前置：放一個自動存檔（週六 14:50，溫州街東口），然後重新整理，從標題畫面點「繼續」
        st0 = {'v': 2, 'name': '祐廷', 'day': 8, 'weekday': 6, 'hour': 14.8, 'energy': 80, 'money': 1500, 'zone': 'wenzhou', 'pos': {'x': 44, 'z': -1, 'yaw': -1.5708}, 'weather': 'clear',
               'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True},
               'visited': {'dorm': True, 'campus': True, 'gongguan': True, 'wenzhou': True, 'cafe': True}, 'savedAt': 1}
        await pg.evaluate("s=>localStorage.setItem('fatiao3d_auto',JSON.stringify(s))", st0)
        await pg.reload()
        for i in range(240):
            if await pg.evaluate("document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_00_title.png')
        await t.tap_el('#rotate')  # 直向提示：點一下繼續直向遊玩
        await pg.wait_for_timeout(400)
        ok = await t.tap_el('#btnContinue'); check('標題畫面：觸控點「繼續」', ok)
        await pg.wait_for_timeout(6000)
        st = await state(pg); check('讀到溫州街', st['zone'] == 'wenzhou', st)
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_01_wenzhou.png')
        # 1. 自由走在溫州街（搖桿）
        p0 = await state(pg); await t.joy(0, -55, 1600); p1 = await state(pg)
        check('溫州街：搖桿往前走', math.hypot(p1['x'] - p0['x'], p1['z'] - p0['z']) > 0.5, (p0['x'], p1['x']))
        # 2. 看見 NPC
        npcs = await pg.evaluate("GAME.E.npcs.map(n=>({name:n.name||'(路人)',driver:n.obj.userData.driver,x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1)}))")
        check('溫州街：NPC 都是正式模型（沒有程序化球體人）', all(n['driver'] == 'vrm' for n in npcs) and len(npcs) > 0, npcs)
        # 3. 走到兩點半 Café 門口
        # v9.2 起 Café 在東端路口（門口互動點 (54.2,0)、半徑 2.3 m）。目標點＋容許誤差要落在互動半徑內：(53.4,0)±0.9 → 離門最遠 1.7 m
        st = await walk_to(pg, t, 53.4, 0.0, 'cafe door', tol=0.9)
        await pg.wait_for_timeout(1500); st = await state(pg)
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_02_cafe_front.png')
        check('走到 Café 門口出現「進入兩點半 Café」', '兩點半' in st['interact'], st)
        ov = await pg.evaluate("(()=>{ const a=document.getElementById('interact').getBoundingClientRect(), j=document.getElementById('joy').getBoundingClientRect(); return !(a.right<j.left||a.left>j.right||a.bottom<j.top||a.top>j.bottom); })()")
        check('互動按鈕不會蓋住搖桿', not ov)
        await t.tap_el('#interact'); await pg.wait_for_timeout(5000)
        await advance_dialogue(pg, t)
        st = await state(pg); check('進入 Café', st['zone'] == 'cafe', st)
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_03_cafe_inside.png')
        # 4. 找沈以安（週六 14–17 在 Café 讀書）
        an = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(n=>n.charId==='heroine_01'); return n?{x:n.obj.position.x,z:n.obj.position.z,driver:n.obj.userData.driver,label:n.talkLabel}:null; })()")
        check('Café 裡有沈以安（正式模型）', bool(an) and an['driver'] == 'vrm', an)
        if an:
            st = await walk_to(pg, t, an['x'] + 0.9, an['z'] + 0.9, 'to An', tol=1.2)
            # 點地走路停下來的位置有誤差（v9.3 第八批一次停在離她 2.22 m，剛好超過 2.2 m 的對話距離）：還不夠近就再走近一點。判定標準不變（靠近時要出現對話按鈕）
            if math.hypot(st['x'] - an['x'], st['z'] - an['z']) > 1.8:
                st = await walk_to(pg, t, an['x'] + 0.6, an['z'] + 0.6, 'closer to An', tol=0.6)
            await pg.wait_for_timeout(600); st = await state(pg)
            check('靠近沈以安出現對話按鈕', '說話' in st['interact'] or '小安' in st['interact'] or '沈以安' in st['interact'], st['interact'])
            await t.tap_el('#interact'); await pg.wait_for_timeout(2500)
            seen = await advance_dialogue(pg, t, shots='docs/art-rebuild/screenshots/flow_04_an')
            check('和沈以安的對話有內容並結束', len(seen) > 0, len(seen))
            st = await state(pg); check('對話結束後可以操作', not st['busy'], st)
        # 5. 坐下（窗邊雙人桌）
        st = await walk_to(pg, t, 4.5, 2.5, 'seat', tol=0.9)
        await pg.wait_for_timeout(600); st = await state(pg)
        check('靠近座位出現「坐」的按鈕', '坐' in st['interact'], st['interact'])
        await t.tap_el('#interact'); await pg.wait_for_timeout(3000)
        st = await state(pg); await pg.screenshot(path='docs/art-rebuild/screenshots/flow_05_sit.png')
        check('坐下（姿勢 sit）', st['pose'] in ('sit', 'read'), st['pose'])
        await advance_dialogue(pg, t, choose=0)
        await pg.wait_for_timeout(1500); st = await state(pg)
        check('起身後可以操作', not st['busy'] and st['pose'] not in ('sit', 'read'), st)
        # 6. 離開 Café 回到溫州街
        st = await walk_to(pg, t, 0, 5.0, 'exit', tol=1.0)
        await pg.wait_for_timeout(600); st = await state(pg)
        check('門口出現「離開咖啡廳」', '離開' in st['interact'], st['interact'])
        await t.tap_el('#interact'); await pg.wait_for_timeout(5000)
        await advance_dialogue(pg, t)
        st = await state(pg); check('回到溫州街（Café 門口）', st['zone'] == 'wenzhou' and abs(st['x'] - 51.7) < 3 and abs(st['z']) < 3, st)   # v9.2：Café 在東端路口，出口在 (51.7,0)
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_06_back_street.png')
        p0 = await state(pg); await t.joy(0, -55, 1500); p1 = await state(pg)
        check('出來後可以繼續走', math.hypot(p1['x'] - p0['x'], p1['z'] - p0['z']) > 0.5)
        # 7. 存檔（選單 → 存檔 → 欄位 1）
        await t.tap_el('#btnMenu'); await pg.wait_for_timeout(700)
        await t.tap_el('.tabs button[data-tab="save"]'); await pg.wait_for_timeout(500)
        si = await pg.evaluate("(()=>{ const all=[...document.querySelectorAll('#saveSlots .btn')]; return all.findIndex(b=>b.textContent==='存檔'&&b.closest('.item').textContent.startsWith('欄位 1')); })()")
        ok = await t.tap_el('#saveSlots .btn', si); await pg.wait_for_timeout(800)
        saved = await pg.evaluate("JSON.parse(localStorage.getItem('fatiao3d_slot_1')||'null')")
        check('觸控存到欄位 1', bool(saved) and saved['zone'] == 'wenzhou', saved and (saved['zone'], saved['pos']))
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_07_save_menu.png')
        await t.tap_el('#btnClose'); await pg.wait_for_timeout(500)
        # 8. 重新整理 → 讀取欄位 1
        await pg.reload()
        for i in range(240):
            if await pg.evaluate("document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        await t.tap_el('#rotate'); await pg.wait_for_timeout(300)
        await t.tap_el('#btnLoadMenu'); await pg.wait_for_timeout(700)
        # 欄位 1 的「讀取」：自動存檔那列只有讀取，所以找欄位 1 那一列的讀取按鈕
        idx = await pg.evaluate("(()=>{ const items=[...document.querySelectorAll('#saveSlots .item')]; const k=items.findIndex(i=>i.textContent.startsWith('欄位 1')); const all=[...document.querySelectorAll('#saveSlots .btn.pri')]; const b=items[k]&&items[k].querySelector('.btn.pri'); return all.indexOf(b); })()")
        await t.tap_el('#saveSlots .btn.pri', idx); await pg.wait_for_timeout(6000)
        st = await state(pg)
        check('重新整理後讀回欄位 1（溫州街、位置相同）', st['zone'] == 'wenzhou' and saved and abs(st['x'] - saved['pos']['x']) < 0.6 and abs(st['z'] - saved['pos']['z']) < 0.6, (st['x'], st['z'], saved and saved['pos']))
        # 存檔位置可能正對牆（Café 正面），往前被擋是正確的碰撞；換方向推，任一方向能走就算可以移動
        moved = 0
        for jx, jy in [(0, -55), (0, 55), (55, 0), (-55, 0)]:
            p0 = await state(pg); await t.joy(jx, jy, 1300); p1 = await state(pg)
            moved = max(moved, math.hypot(p1['x'] - p0['x'], p1['z'] - p0['z']))
            if moved > 0.5: break
        check('讀檔後可以走', moved > 0.5, round(moved, 2))
        await pg.screenshot(path='docs/art-rebuild/screenshots/flow_08_after_load.png')
        bad = [e for e in errs if 'PAGEERROR' in e]
        check('沒有 JS 例外', not bad, bad[:3])
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
