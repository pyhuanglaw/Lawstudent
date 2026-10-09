"""公館商店街（v9.3 第十一批：連續騎樓的台北街屋）導航與互動檢查：實際載入遊戲的公館區域，查詢導航格、A* 路徑與互動點。
檢查：主要地點都站得住、從公館出生點走得到；騎樓整排連續可以走（店與店之間沒有牆）；騎樓柱子、店裡面不能走；
各店的互動點 x 和改版前一樣（z 跟著店面往北搬 30 m）、站在店門口會出現該店的互動按鈕；從麵店、書店、便利商店、溫州街、校園回到公館的出生點站得住而且走得到；
舊存檔站在新柱子的位置、或站在舊版店門口（改版後在店後面），讀檔後會被移到可走、走得到的地方；實際按互動按鈕進麵店、再按「離開麵店」回到公館。
用法：python3 tests/gongguan_layout_nav.py [URL]   （預設 http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
START = (0, -30)    # 公館預設出生點
# 名稱, x, z：每一個都要站得住，而且從出生點有路走得到
PLACES = [('校門口（回校園）', 0, -44.5), ('捷運站入口前', -35.2, 11), ('往溫州街（巷口）', -71, 20.2), ('南側人行道（東）', 60, 12), ('街尾（東）騎樓外', 70, 16.5),
          ('麵店門口（騎樓裡）', -63, 21), ('茶行門口', -52.8, 21), ('書店門口', -41.6, 21), ('便利商店門口', -29.4, 21), ('東段騎樓', 60, 20.5)]
# 從其他區域回到公館的出生點（zones3d.js 各室內區域的「離開」與溫州街、校園的出口）
SPAWNS = [('離開麵店', -63, 18), ('離開書店', -42, 18), ('離開便利商店', -29.4, 18), ('溫州街 → 公館（巷口）', -71, 16.5), ('校園 → 公館', -2.5, -29)]
# 各店的互動點（店名、x、z）：x 和改版前相同；z 跟著店面往北搬 30 m（51 → 21，一樣在騎樓裡、店門前 1 m）
DOORS = [('進入阿鳳麵店', -63.0, 21.0), ('買一杯飲料', -52.8, 21.0), ('進入舊路書房', -41.6, 21.0), ('進入便利商店', -29.4, 21.0)]
BLOCKED = [('轉角公寓（巷口西側）', -76, 20.5), ('麵店裡面', -63, 23.5), ('便利商店裡面', -29.4, 24), ('東段店裡面', 50, 25), ('捷運出口本體', -40, 11), ('圓環花台', 22, 11.5)]
OLD_SAVES = [('舊存檔：站在新騎樓柱子的位置', -56.8, 19.3), ('舊存檔：舊版麵店門口（改版後在店後面）', -63, 48), ('舊存檔：舊版捷運入口前（改版後在店後面）', -40, 28.5)]

async def main():
    fails = []
    def check(name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''))
        if not ok: fails.append(name)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 640, 'height': 480}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        async def load_at(x, z, yaw=0):
            st = {'zone': 'gongguan', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': FLAGS}
            await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
            await pg.wait_for_timeout(800)
        await load_at(*START)
        reach_js = """(a=>{ const E=GAME.E, n=E.nav; const stand=E.canStand?E.canStand(a.x,a.z,0.3):n.free(a.x,a.z); const path=n.path(a.sx,a.sz,a.x,a.z); let end=null; if(path&&path.length) end=path[path.length-1];
            return {stand, ok:!!(path&&path.length), len:path?path.length:0, end:end&&[+end[0].toFixed(1),+end[1].toFixed(1)]}; })(%s)"""
        for name, x, z in PLACES + SPAWNS:
            r = await pg.evaluate(reach_js % json.dumps({'x': x, 'z': z, 'sx': START[0], 'sz': START[1]}))
            reach = r['ok'] and r['end'] and abs(r['end'][0] - x) < 1.2 and abs(r['end'][1] - z) < 1.2
            check(f'{name}（{x}, {z}）站得住且走得到', r['stand'] and reach, json.dumps(r, ensure_ascii=False))
        # 騎樓連續：z=20.5 這條線從第一間店到最後一間，每 0.25 m 都站得住（店與店之間沒有牆）
        r = await pg.evaluate("(()=>{ const E=GAME.E; const bad=[]; for(let x=-67;x<=77;x+=0.25){ if(!E.canStand(x,20.5,0.3)) bad.push(+x.toFixed(2)); } return bad; })()")
        check('騎樓整排連續可以走（x −67 → 77、z 20.5）', len(r) == 0, ('站不住的位置：' + str(r[:12])) if r else '')
        # 騎樓柱子：落在店與店的分界（z=19.3），導航格要擋住
        pil = await pg.evaluate("(()=>{ const E=GAME.E; const xs=[-68,-56.8,-47.6,-34.4,-23.2,-14,-4.8,5.4,15.6,23.6,32.6,41.6,51.6,59.6,68.6,77.6]; return xs.map(x=>[x,E.nav.free(x,19.3)]); })()")
        check('騎樓柱子（店與店的分界）不能走', all(not f for _, f in pil), json.dumps(pil))
        for name, x, z in BLOCKED:
            r = await pg.evaluate("(a=>GAME.E.nav.free(a.x,a.z))(%s)" % json.dumps({'x': x, 'z': z}))
            check(f'{name}（{x}, {z}）不能走', not r)
        its = await pg.evaluate("(()=>GAME.E.interactables.map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)})))()")
        for label, x, z in DOORS:
            hit = [i for i in its if i['label'] == label]
            check(f'互動點「{label}」在（{x}, {z}）（x 和改版前相同）', len(hit) == 1 and abs(hit[0]['x'] - x) < 0.01 and abs(hit[0]['z'] - z) < 0.01, json.dumps(hit, ensure_ascii=False))
        # 站在店門口（騎樓裡、門前 1 m）會出現這家店的互動
        for label, x, z in DOORS:
            r = await pg.evaluate("(a=>{ const E=GAME.E, P=E.player; P.obj.position.set(a.x,0,a.z-0.6); P.path=null; P.target=null; const it=E.nearestInteractable(); return it?it.label:null; })(%s)" % json.dumps({'x': x, 'z': z}))
            check(f'站在店門口出現「{label}」', r == label, str(r))
        for name, x, z in OLD_SAVES:
            await load_at(x, z)
            r = await pg.evaluate("(s=>{ const E=GAME.E, o=E.player.obj.position; const p=E.nav.path(o.x,o.z,s[0],s[1]); return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),stand:E.canStand?E.canStand(o.x,o.z,0.3):E.nav.free(o.x,o.z),reach:!!(p&&p.length)}; })(%s)" % json.dumps(START))
            check(f'{name} → 讀檔後移到可走、走得到的地方', r['stand'] and r['reach'], json.dumps(r))
        # 實際按互動按鈕：麵店門口 → 進麵店 → 「離開麵店」→ 回到公館
        await load_at(-63, 20.4, 3.1416)
        await pg.wait_for_timeout(1500)
        vis = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return {hidden:b.classList.contains('hide'), label:(document.getElementById('interactLabel')||{}).textContent}; })()")
        check('麵店門口出現互動按鈕「進入阿鳳麵店」', (not vis['hidden']) and vis['label'] == '進入阿鳳麵店', json.dumps(vis, ensure_ascii=False))
        await pg.evaluate("document.getElementById('interact').click()")
        zone = None
        for i in range(60):
            zone = await pg.evaluate("GAME.G.zone")
            if zone == 'noodle' and not await pg.evaluate("!!GAME.E.player.busy"): break
            await pg.wait_for_timeout(500)
        check('按下後進到麵店', zone == 'noodle', str(zone))
        await pg.evaluate("(()=>{ const P=GAME.E.player; P.obj.position.set(0,0,3.9); P.path=null; P.target=null; })()")
        await pg.wait_for_timeout(1500)
        vis = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return {hidden:b.classList.contains('hide'), label:(document.getElementById('interactLabel')||{}).textContent}; })()")
        check('麵店門口出現「離開麵店」', (not vis['hidden']) and vis['label'] == '離開麵店', json.dumps(vis, ensure_ascii=False))
        await pg.evaluate("document.getElementById('interact').click()")
        for i in range(60):
            zone = await pg.evaluate("GAME.G.zone")
            if zone == 'gongguan' and not await pg.evaluate("!!GAME.E.player.busy"): break
            await pg.wait_for_timeout(500)
        r = await pg.evaluate("(s=>{ const E=GAME.E, o=E.player.obj.position; const p=E.nav.path(o.x,o.z,s[0],s[1]); return {zone:GAME.G.zone,x:+o.x.toFixed(2),z:+o.z.toFixed(2),stand:E.canStand(o.x,o.z,0.3),reach:!!(p&&p.length)}; })(%s)" % json.dumps(START))
        check('離開麵店回到公館：站在麵店前、站得住、走得到', r['zone'] == 'gongguan' and r['stand'] and r['reach'] and abs(r['x'] + 63) < 1.5 and abs(r['z'] - 18) < 1.5, json.dumps(r))
        # 巷口：往溫州街 → 溫州街「回公館」→ 回到巷口
        # 換區域的淡出淡入還沒結束時，遊戲會忽略新的 enter()（game3d.js 的 entering）：先等上一次換區域結束，讀檔後確認人真的在巷口
        await pg.wait_for_timeout(3000)
        await load_at(-71, 19.6, 3.1416)
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(2),+o.z.toFixed(2)]; })()")
        check('（測試前置）讀檔後人在巷口', abs(r[0] + 71) < 0.5 and abs(r[1] - 19.6) < 0.5, str(r))
        vis = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return {hidden:b.classList.contains('hide'), label:(document.getElementById('interactLabel')||{}).textContent}; })()")
        check('巷口出現「往溫州街」', (not vis['hidden']) and vis['label'] == '往溫州街', json.dumps(vis, ensure_ascii=False))
        await pg.evaluate("document.getElementById('interact').click()")
        for i in range(60):
            zone = await pg.evaluate("GAME.G.zone")
            if zone == 'wenzhou' and not await pg.evaluate("!!GAME.E.player.busy"): break
            await pg.wait_for_timeout(500)
        check('按下後到溫州街', zone == 'wenzhou', str(zone))
        await pg.wait_for_timeout(2500)   # 等淡入結束
        await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.label==='回公館'); const P=GAME.E.player; P.obj.position.set(it.x,0,it.z); P.path=null; P.target=null; })()")
        await pg.wait_for_timeout(1500)
        await pg.evaluate("document.getElementById('interact').click()")
        for i in range(60):
            zone = await pg.evaluate("GAME.G.zone")
            if zone == 'gongguan' and not await pg.evaluate("!!GAME.E.player.busy"): break
            await pg.wait_for_timeout(500)
        r = await pg.evaluate("(s=>{ const E=GAME.E, o=E.player.obj.position; const p=E.nav.path(o.x,o.z,s[0],s[1]); return {zone:GAME.G.zone,x:+o.x.toFixed(2),z:+o.z.toFixed(2),stand:E.canStand(o.x,o.z,0.3),reach:!!(p&&p.length)}; })(%s)" % json.dumps(START))
        check('從溫州街回公館：站在巷口、站得住、走得到', r['zone'] == 'gongguan' and r['stand'] and r['reach'] and abs(r['x'] + 71) < 1.5 and abs(r['z'] - 16.5) < 1.5, json.dumps(r))
        check('沒有 JS 例外', not errs, str(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
