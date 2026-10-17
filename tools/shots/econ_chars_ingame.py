"""經濟系三位（V0-ECON-CHARS，LAWWW2-C 03179efb）的遊戲內截圖，給 BB-C 驗收：
① 韋綸、家豪：溫州街小公園前（char_review.py 的位置），白天 11:00、晚上 20:00；正面、45 度、背面（看安全帽掛在背包右側）、實際遊戲畫面（跟隨鏡頭＋介面）。
② 魏教授：經濟系大一、經原上課中（第 4 週週一 10:00），從博雅 101 後排看講台（實際遊戲畫面＋拉近一張）——作息自己把他放上講台，不是腳本放的。
③ 沛珊（第二十六版，戴眼鏡）：同一個位置，白天、晚上的正面、45 度、背面、臉（坐姿用 tools/shots/char_motion.py classmate_peishan）。
[前置]：讀檔、人物用 GAME.spawnCharacter 放（①）；②只讀檔。drivers.json 記每個人實際用的模型（確認不是備用人物）。
用法：python3 tools/shots/econ_chars_ingame.py <URL> <輸出資料夾>"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
import char_review as CR

URL = sys.argv[1]; OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
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
    for hour, tag in ((11.0, 'day'), (20.0, 'night')):
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); })(%f)" % hour)
        await CR.subject(pg, 'econ_weilun', SX - 0.6, 0.6, 0)
        await CR.subject(pg, 'econ_jiahao', SX + 0.6, 0.6, 0)
        ok = await wait_models(pg, ['econ_weilun', 'econ_jiahao'])
        for cid in ('econ_weilun', 'econ_jiahao'): drivers[cid] = await info(pg, cid)
        drivers['_loaded_' + tag] = ok
        await pg.wait_for_timeout(2500)
        await CR.hud(pg, False)
        await CR.cam(pg, [SX, 1.25, 4.6], [SX, 1.0, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_front.png')
        await CR.cam(pg, [SX + 3.4, 1.35, 3.6], [SX, 1.0, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_q45.png')
        await CR.cam(pg, [SX + 0.4, 1.4, -3.4], [SX, 1.1, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_back.png')
        await CR.cam(pg, [SX - 0.6, 1.62, 1.55], [SX - 0.6, 1.55, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_weilun_face.png')
        await CR.cam(pg, [SX + 0.6, 1.56, 1.55], [SX + 0.6, 1.5, 0.6]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{OUT}/{tag}_jiahao_face.png')
        # 實際遊戲畫面：玩家站在兩人前面 3 m、一般跟隨鏡頭、有介面
        await CR.hud(pg, True)
        await pg.evaluate("((x,z)=>{ const E=GAME.E; E.endCinematic(); E.player.obj.visible=true; E.player.obj.position.set(x,0,z); E.player.obj.rotation.y=Math.PI; E.cam.yaw=0; })(%f,%f)" % (SX, 3.4))
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=f'{OUT}/{tag}_game.png')
        for cid in ('econ_weilun', 'econ_jiahao'): await CR.remove(pg, cid)
    await b.close()


async def part3(p, drivers):
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 1280, 'height': 720})
    await CR.load(pg)
    for hour, tag in ((11.0, 'day'), (20.0, 'night')):
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); })(%f)" % hour)
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


async def part2(p, drivers):
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 1280, 'height': 720})
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
        only = set(os.environ.get('ONLY', 'econ,wei,peishan').split(','))
        if 'econ' in only: await part1(p, drivers)
        if 'wei' in only: await part2(p, drivers)
        if 'peishan' in only: await part3(p, drivers)
    json.dump(drivers, open(f'{OUT}/drivers.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(drivers, ensure_ascii=False))

asyncio.run(main())
