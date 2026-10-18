"""經濟系三位（V0-ECON-CHARS，LAWWW2-C 03179efb）的遊戲內截圖，給 BB-C 驗收：
① 韋綸、唐睿、家豪：溫州街小公園前（char_review.py 的位置），白天 11:00、晚上 20:00；正面、45 度、背面（看安全帽掛在背包右側）、實際遊戲畫面（跟隨鏡頭＋介面）。
② 魏教授：經濟系大一、經原上課中（第 4 週週一 10:00），從博雅 101 後排看講台（實際遊戲畫面＋拉近一張）——作息自己把他放上講台，不是腳本放的。
③ 沛珊（第二十六版，戴眼鏡）：同一個位置，白天、晚上的正面、45 度、背面、臉（坐姿用 tools/shots/char_motion.py classmate_peishan）。
[前置]：讀檔、人物用 GAME.spawnCharacter 放（①）；②只讀檔。drivers.json 記每個人實際用的模型（確認不是備用人物）。
用法：python3 tools/shots/econ_chars_ingame.py <URL> <輸出資料夾>（ONLY=econ,wei,peishan,sit 選哪幾段；WHO=id:x偏移,... 換第①段拍的人）"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright

URL = sys.argv[1]; OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)


class CR:
    """char_review.py 的那幾個函式（它在 import 時就會跑自己的主程式，所以抄過來；位置、做法相同：溫州街小公園前）"""
    SPOT = (26.0, 0.6)
    FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
    HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"

    @staticmethod
    async def load(pg):
        pg.set_default_timeout(180000)   # SwiftShader 很慢：截圖、evaluate 給長一點
        await pg.goto(URL)
        for i in range(480):
            if await pg.evaluate("!!(typeof GAME!=='undefined'&&GAME.running)"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'wenzhou', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': CR.SPOT[0] - 9, 'z': -2.5, 'yaw': 0}, 'flags': CR.FLAGS}
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(2500)
        await pg.evaluate("GAME.E.applyTime(11.0); GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; (GAME.extras||[]).slice().forEach(x=>{ const o=x.obj; if(o&&o.parent) o.parent.remove(o); }); if(GAME.extras) GAME.extras.length=0;")

    @staticmethod
    async def hud(pg, on):
        await pg.evaluate("(on=>{ let s=document.getElementById('reviewHide'); if(!on&&!s){ s=document.createElement('style'); s.id='reviewHide'; s.textContent=%s; document.head.appendChild(s); } if(on&&s) s.remove(); })(%s)" % (json.dumps(CR.HIDE_HUD), 'true' if on else 'false'))

    @staticmethod
    async def cam(pg, pos, look):
        await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(pos), json.dumps(look)))

    @staticmethod
    async def subject(pg, cid, x, z, yaw):
        js = """(c=>{ const E=GAME.E; let n=E.npcs.find(k=>k.charId===c.id); if(!n) n=GAME.spawnCharacter(c.id,c.x,c.z,{yaw:c.yaw});
          if(!n) return null; n.obj.visible=true; n.obj.position.set(c.x,0,c.z); n.obj.rotation.y=c.yaw; n.path=null; n.speed=0; n.frozen=true; n.beh='idle'; n.greet=false; n.waveT=0; n.pose='idle'; n.idlePose='idle';
          const u=n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; }
          return {key:(u&&u.key)||null, driver:(u&&u.driver)||null}; })(%s)""" % json.dumps({'id': cid, 'x': x, 'z': z, 'yaw': yaw})
        return await pg.evaluate(js)

    @staticmethod
    async def remove(pg, cid):
        await pg.evaluate("(id=>{ const E=GAME.E; const n=E.npcs.find(k=>k.charId===id); if(n){ E.removeNPC(n); for(const k in GAME.npc) if(GAME.npc[k]===n) delete GAME.npc[k]; } })(%s)" % json.dumps(cid))


SX, SZ = CR.SPOT


async def info(pg, cid):
    return await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(k=>k.charId===id); if(!n) return null; const u=n.obj.userData; return {key:u&&u.key||null, driver:u&&u.driver||null, props:Object.keys((u&&u.props)||{})}; })(%s)" % json.dumps(cid))


async def wait_models(pg, ids, s=90):
    for _ in range(s * 2):
        ok = await pg.evaluate("(ids=>ids.every(id=>{ const n=GAME.E.npcs.find(k=>k.charId===id); return n&&n.obj.userData&&n.obj.userData.driver==='vrm'; }))(%s)" % json.dumps(ids))
        if ok: return True
        await pg.wait_for_timeout(500)
    return False


async def part1(p, drivers):
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 1280, 'height': 720})
    await CR.load(pg)
    who = [('econ_weilun', -1.2), ('econ_tangrui', 0.0), ('econ_jiahao', 1.2)]   # 左到右：韋綸、唐睿、家豪
    if os.environ.get('WHO'): who = [(w.split(':')[0], float(w.split(':')[1])) for w in os.environ['WHO'].split(',')]   # 例：WHO=econ_jiahao:-0.6,econ_pinyu:0.6（家豪筆記本、品妤保溫瓶，2026-10-17）
    for hour, tag in ((11.0, 'day'), (20.0, 'night')):
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); })(%f)" % hour)
        await pg.evaluate("(()=>{ const E=GAME.E; E.endCinematic(); E.player.obj.visible=false; E.player.path=null; E.player.obj.position.set(%f,0,-3.5); })()" % (SX - 9))   # 玩家移開、藏起來（上一輪拍「遊戲畫面」時站在他們前面）
        for cid, dx in who: await CR.subject(pg, cid, SX + dx, 0.6, 0)
        ok = await wait_models(pg, [c for c, _ in who])
        for cid, _ in who: drivers[cid] = await info(pg, cid)
        drivers['_loaded_' + tag] = ok
        await pg.wait_for_timeout(2500)
        await CR.hud(pg, False)
        await CR.cam(pg, [SX, 1.25, 5.4], [SX, 1.0, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_front.png')
        await CR.cam(pg, [SX + 3.8, 1.35, 4.0], [SX, 1.0, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_q45.png')
        await CR.cam(pg, [SX + 0.4, 1.4, -3.8], [SX, 1.1, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_back.png')
        for cid, dx in who:
            await CR.cam(pg, [SX + dx, 1.62, 1.55], [SX + dx, 1.55, 0.6]); await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'{OUT}/{tag}_{cid.split("_")[1]}_face.png')
        # 實際遊戲畫面：玩家站在他們前面 3 m、一般跟隨鏡頭、有介面
        await CR.hud(pg, True)
        await pg.evaluate("((x,z)=>{ const E=GAME.E; E.endCinematic(); E.player.obj.visible=true; E.player.obj.position.set(x,0,z); E.player.obj.rotation.y=Math.PI; E.cam.yaw=0; })(%f,%f)" % (SX, 3.6))
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=f'{OUT}/{tag}_game.png')
        for cid, _ in who: await CR.remove(pg, cid)
    await b.close()


async def part3(p, drivers):
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 1280, 'height': 720})
    await CR.load(pg)
    for hour, tag in ((11.0, 'day'), (20.0, 'night')):
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); })(%f)" % hour)
        await pg.evaluate("(()=>{ const E=GAME.E; E.endCinematic(); E.player.obj.visible=false; E.player.path=null; E.player.obj.position.set(%f,0,-3.5); })()" % (SX - 9))   # 玩家移開、藏起來（上一輪拍「遊戲畫面」時站在他們前面）
        await CR.subject(pg, 'classmate_peishan', SX, 0.6, 0)
        drivers['_peishan_loaded_' + tag] = await wait_models(pg, ['classmate_peishan'])
        drivers['classmate_peishan'] = await info(pg, 'classmate_peishan')
        await pg.wait_for_timeout(2500)
        await CR.hud(pg, False)
        for nm, pos, look in (('front', [SX, 1.2, 3.6], [SX, 0.95, 0.6]), ('q45', [SX + 2.6, 1.3, 2.8], [SX, 0.95, 0.6]), ('back', [SX + 0.3, 1.3, -2.6], [SX, 1.0, 0.6]), ('face', [SX, 1.52, 1.45], [SX, 1.47, 0.6]), ('face_q45', [SX + 0.65, 1.52, 1.3], [SX, 1.47, 0.6])):
            await CR.cam(pg, pos, look); await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'{OUT}/peishan_{tag}_{nm}.png')
        await CR.hud(pg, True)
        await pg.evaluate("((x,z)=>{ const E=GAME.E; E.endCinematic(); E.player.obj.visible=true; E.player.obj.position.set(x,0,z); E.player.obj.rotation.y=Math.PI; E.cam.yaw=0; })(%f,%f)" % (SX, 3.0))
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=f'{OUT}/peishan_{tag}_game.png')
        await CR.remove(pg, 'classmate_peishan')
    await b.close()


async def part4(p, drivers):
    """坐姿：用溫州街小公園裡真的長椅座位（interactables 的 seat；char_motion.py 的 (23.6, 7.94) 是擴大前的小公園，現在那裡沒有椅子）"""
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 1280, 'height': 720})
    await CR.load(pg)
    seat = await pg.evaluate("(sp=>{ const c=GAME.E.interactables.filter(i=>i.seat&&/長椅|椅/.test(i.label||'')).sort((a,b)=>Math.hypot(a.x-sp[0],a.z-sp[1])-Math.hypot(b.x-sp[0],b.z-sp[1])); return c[0]?Object.assign({label:c[0].label},c[0].seat):null; })(%s)" % json.dumps(list(CR.SPOT)))
    drivers['sit_seat'] = seat
    if not seat:
        await b.close(); return
    for cid in ('classmate_peishan', 'econ_weilun', 'econ_tangrui', 'econ_jiahao'):
        for hour, tag in ((11.0, 'day'), (20.0, 'night')):
            await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); })(%f)" % hour)
            info = await pg.evaluate("""(c=>{ const E=GAME.E; let n=E.npcs.find(k=>k.charId===c.id); if(!n) n=GAME.spawnCharacter(c.id,c.s.x,c.s.z-1,{yaw:c.s.yaw});
              GAME.sitAt(n,c.s); n.greet=false; const u=n.obj.userData; if(u.anim){ u.anim.blink=1e9; } E.player.obj.position.set(c.s.x-6,0,c.s.z-6); return {key:u.key,driver:u.driver}; })(%s)""" % json.dumps({'id': cid, 's': seat}))
            await wait_models(pg, [cid]); await pg.wait_for_timeout(3000)
            await CR.hud(pg, False)
            fx, fz = __import__('math').sin(seat['yaw']), __import__('math').cos(seat['yaw'])   # 座位朝向（yaw）：+z 轉 yaw
            await CR.cam(pg, [seat['x'] + fx * 2.4, 1.0, seat['z'] + fz * 2.4], [seat['x'], 0.65, seat['z']]); await pg.wait_for_timeout(1000)
            await pg.screenshot(path=f'{OUT}/{cid}_sit_{tag}_front.png')
            await CR.cam(pg, [seat['x'] + fz * 2.3 + fx * 0.4, 0.9, seat['z'] - fx * 2.3 + fz * 0.4], [seat['x'], 0.6, seat['z']]); await pg.wait_for_timeout(1000)
            await pg.screenshot(path=f'{OUT}/{cid}_sit_{tag}_side.png')
            await CR.hud(pg, True)
        drivers[cid + '_sit'] = info
        await CR.remove(pg, cid)
    await b.close()


async def part2(p, drivers):
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 1280, 'height': 720})
    pg.set_default_timeout(180000)
    await pg.goto(URL + ('&' if '?' in URL else '?') + 'turbo')
    for i in range(480):
        if await pg.evaluate("!!(typeof GAME!=='undefined'&&GAME.running)"): break
        await pg.wait_for_timeout(500)
    day = await pg.evaluate("""(()=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==4) continue; const G={day:d,hour:8,stage:'econ',flags:{},weekday:CALENDAR.dateOf(d).wd%7}; if(CLS.dayItems(G,d).some(x=>x.c.id==='econ_principles_y0'&&!x.exam)) return d; } return null; })()""")
    st = {'stage': 'econ', 'zone': 'boya', 'day': day, 'weekday': 1, 'hour': 10.0, 'weather': 'sunny', 'pos': {'x': -11.3, 'z': -4.6, 'yaw': 0, 'lv': 0},
          'flags': {'CAMP_Y1': True, 'E01_DONE': True, 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 9}}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
    await pg.wait_for_timeout(4000)
    ok = False
    for _ in range(180):
        ok = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(k=>k.charId==='prof_wei'); return !!(n&&n.obj.userData&&n.obj.userData.driver==='vrm'); })()")
        if ok: break
        await pg.wait_for_timeout(500)
    drivers['prof_wei'] = await info(pg, 'prof_wei')
    drivers['prof_wei_pos'] = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(k=>k.charId==='prof_wei'); return n&&{x:+n.obj.position.x.toFixed(2),y:+n.obj.position.y.toFixed(2),z:+n.obj.position.z.toFixed(2),yaw:+n.obj.rotation.y.toFixed(2)}; })()")
    drivers['boya_state'] = await pg.evaluate("({zone:GAME.G.zone, stage:GAME.G.stage, day:GAME.G.day, h:GAME.G.hour, dlg:!!(GAME.D&&GAME.D.active)})")
    await pg.wait_for_timeout(2500)
    await pg.screenshot(path=f'{OUT}/wei_lectern_game.png')
    await CR.hud(pg, False)
    await CR.cam(pg, [-11.0, 2.4, 1.0], [-10.25, 1.3, 7.2]); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=f'{OUT}/wei_lectern_mid.png')
    await CR.cam(pg, [-10.0, 1.75, 4.9], [-10.25, 1.5, 7.2]); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=f'{OUT}/wei_lectern_close.png')
    await b.close()


async def main():
    drivers = {}
    async with async_playwright() as p:
        only = set(os.environ.get('ONLY', 'econ,wei,peishan,sit').split(','))
        if 'econ' in only: await part1(p, drivers)
        if 'wei' in only: await part2(p, drivers)
        if 'peishan' in only: await part3(p, drivers)
        if 'sit' in only: await part4(p, drivers)
    json.dump(drivers, open(f'{OUT}/drivers.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(drivers, ensure_ascii=False))

asyncio.run(main())
