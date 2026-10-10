"""人物外觀驗收：在實際遊戲裡拍六位主要人物，和參考圖（references/06 的那一欄）並排。
每人：參考圖｜正面全身｜45 度｜側面｜背面｜臉部特寫｜走路｜實際遊戲畫面（一般跟隨鏡頭＋介面）。
做法沿用 tools/shots/char_turnaround.py（溫州街小公園前、白天 11:00、遊戲本身生成的人物、E.cinematic 定位鏡頭）。
用法：python3 tools/shots/char_review.py <URL> <輸出資料夾> [人物 id ...]（player、heroine_01…heroine_05；不給就全部）
輸出：<輸出>/REVIEW_<id>.jpg（並排）、各角度原圖、drivers.json（每個人實際用的模型與 driver，確認不是備用人物）"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

URL = sys.argv[1]; OUT = sys.argv[2]; IDS = sys.argv[3:] or ['player', 'heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05']
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
NAMES = {'player': '祐廷', 'heroine_01': '沈以安', 'heroine_02': '林芷若', 'heroine_03': '陳語彤', 'heroine_04': '高子晴', 'heroine_05': '溫書瑀'}
REFCOL = {'player': (4, 256), 'heroine_01': (258, 512), 'heroine_02': (514, 766), 'heroine_03': (768, 1022), 'heroine_04': (1025, 1280), 'heroine_05': (1284, 1532)}
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
SPOT = (26.0, 0.6)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"


async def load(pg):
    await pg.goto(URL)
    for i in range(480):
        if await pg.evaluate("!!(typeof GAME!=='undefined'&&GAME.running)"): break
        await pg.wait_for_timeout(500)
    st = {'zone': 'wenzhou', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': SPOT[0] - 9, 'z': -2.5, 'yaw': 0}, 'flags': FLAGS}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st, ensure_ascii=False))
    await pg.wait_for_timeout(2500)
    await pg.evaluate("GAME.E.applyTime(11.0); GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; (GAME.extras||[]).slice().forEach(x=>{ const o=x.obj; if(o&&o.parent) o.parent.remove(o); }); if(GAME.extras) GAME.extras.length=0;")


async def hud(pg, on):
    await pg.evaluate("(on=>{ let s=document.getElementById('reviewHide'); if(!on&&!s){ s=document.createElement('style'); s.id='reviewHide'; s.textContent=%s; document.head.appendChild(s); } if(on&&s) s.remove(); })(%s)" % (json.dumps(HIDE_HUD), 'true' if on else 'false'))


async def cam(pg, pos, look):
    await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(pos), json.dumps(look)))


async def subject(pg, cid, x, z, yaw):
    js = """(c=>{ const E=GAME.E; let n;
      if(c.id==='player'){ n=E.player; } else { n=E.npcs.find(k=>k.charId===c.id); if(!n) n=GAME.spawnCharacter(c.id,c.x,c.z,{yaw:c.yaw}); }
      if(!n) return null; n.obj.visible=true; n.obj.position.set(c.x,0,c.z); n.obj.rotation.y=c.yaw; n.path=null; n.speed=0; if(c.id!=='player'){ n.frozen=true; n.beh='idle'; n.greet=false; n.waveT=0; n.pose='idle'; n.idlePose='idle'; }
      const u=n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; }
      return {h:(u&&u.spec&&u.spec.height)||1.7, key:(u&&u.key)||null, driver:(u&&u.driver)||null}; })(%s)""" % json.dumps({'id': cid, 'x': x, 'z': z, 'yaw': yaw})
    return await pg.evaluate(js)


async def remove(pg, cid):
    await pg.evaluate("(id=>{ const E=GAME.E; if(id==='player'){ E.player.obj.visible=false; E.player.path=null; E.player.obj.position.set(%f,0,-3.5); return; } const n=E.npcs.find(k=>k.charId===id); if(n){ E.removeNPC(n); for(const k in GAME.npc) if(GAME.npc[k]===n) delete GAME.npc[k]; } })(%s)" % (SPOT[0] - 9, json.dumps(cid)))


def compose(cid, paths, labels, out, H=560):
    a, b = REFCOL[cid]
    ref = Image.open(os.path.join(ROOT, 'docs/art-rebuild/references/06_six_characters_standard_sheet.webp')).convert('RGB').crop((a, 32, b, 500))
    ims = [ref] + [Image.open(p).convert('RGB') for p in paths]
    ims = [im.resize((int(im.width * H / im.height), H), Image.LANCZOS) for im in ims]
    labels = ['參考圖（06）'] + labels
    W = sum(i.width for i in ims) + 8 * (len(ims) + 1)
    c = Image.new('RGB', (W, H + 44), (245, 242, 236)); d = ImageDraw.Draw(c); f = ImageFont.truetype(FONT, 22)
    x = 8
    for im, lb in zip(ims, labels):
        c.paste(im, (x, 40)); d.text((x + 4, 8), lb, fill=(40, 34, 30), font=f); x += im.width + 8
    c.save(out, quality=86); print('  review', out, flush=True)


async def main():
    os.makedirs(OUT, exist_ok=True)
    drivers = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 720, 'height': 960}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await load(pg)
        x0, z0 = SPOT
        for cid in IDS:
            await pg.set_viewport_size({'width': 720, 'height': 960}); await hud(pg, False)
            info = await subject(pg, cid, x0, z0, 3.14159)
            print(cid, info, flush=True); drivers[cid] = info
            if not info: continue
            H = info['h']; shots = []
            for tag, yaw in [('front', 3.14159), ('q45', 3.14159 - 0.7854), ('side', 1.5708), ('back', 0.0)]:
                await subject(pg, cid, x0, z0, yaw)
                await cam(pg, [x0, H * 0.55, z0 - 3.3], [x0, H * 0.5, z0])
                await pg.wait_for_timeout(2500)
                f = f'{OUT}/{cid}_{tag}.png'; await pg.screenshot(path=f); shots.append(f)
            await subject(pg, cid, x0, z0, 3.14159 - 0.35)
            await cam(pg, [x0, H * 0.93, z0 - 0.8], [x0, H * 0.91, z0])
            await pg.wait_for_timeout(2500)
            f = f'{OUT}/{cid}_face.png'; await pg.screenshot(path=f); shots.append(f)
            # 走路：朝鏡頭斜前方走過來（真的在移動）
            await subject(pg, cid, x0 + 3.2, z0, -1.5708)
            await cam(pg, [x0 - 1.6, 1.3, z0 - 1.9], [x0 + 0.9, 1.0, z0])
            await pg.evaluate("(c=>{ const E=GAME.E; const n=c.id==='player'?E.player:E.npcs.find(k=>k.charId===c.id); if(!n) return; if(c.id==='player'){ n.path=E.nav.path(n.obj.position.x,n.obj.position.z,c.x-2,c.z); } else { n.frozen=false; n.beh='route'; n.waypoints=[[c.x-2,c.z],[c.x+3.2,c.z]]; n.ri=0; n.pauseAt=false; } })(%s)" % json.dumps({'id': cid, 'x': x0, 'z': z0}))
            await pg.wait_for_timeout(3500)
            f = f'{OUT}/{cid}_walk.png'; await pg.screenshot(path=f); shots.append(f)
            # 實際遊戲畫面：手機橫向、介面打開、一般跟隨鏡頭（玩家在鏡頭前、對方面向玩家站著）
            await pg.set_viewport_size({'width': 844, 'height': 390}); await hud(pg, True)
            if cid == 'player':
                await subject(pg, 'player', x0, z0, 0.6)
            else:
                await subject(pg, cid, x0, z0 + 0.4, 3.14159)
                await pg.evaluate("(c=>{ const E=GAME.E; const P=E.player; P.obj.visible=true; P.path=null; P.obj.position.set(c.x+0.5,0,c.z-2.4); P.obj.rotation.y=-0.2; })(%s)" % json.dumps({'x': x0, 'z': z0}))
            await pg.evaluate("(()=>{ const E=GAME.E; E.cam.mode='follow'; E.cam.cine=null; E.cam.yaw=Math.PI-0.35; E.cam.manualT=2; })()")
            await pg.wait_for_timeout(3500)
            f = f'{OUT}/{cid}_ingame.png'; await pg.screenshot(path=f); shots.append(f)
            compose(cid, shots, [NAMES[cid] + ' 正面', '45 度', '側面', '背面', '臉部特寫', '走路', '遊戲畫面'], f'{OUT}/REVIEW_{cid}.jpg')
            await remove(pg, cid)
        json.dump(drivers, open(f'{OUT}/drivers.json', 'w'), ensure_ascii=False, indent=1)
        print('errors:', errs[:3], flush=True)
        await b.close()

asyncio.run(main())
