"""在實際遊戲裡拍人物驗收照（不是模型檢視器）：正面、側面、背面全身、臉部近景、走路、六人同框。
用法：python3 tools/shots/char_turnaround.py <URL> <輸出資料夾> [人物 id ...]
  人物 id：player（祐廷）、heroine_01…heroine_05；不給就全部，最後再拍六人同框。
地點：溫州街小公園前（白天 11:00，光線中性），鏡頭是遊戲內的演出鏡頭（E.cinematic）定位；人物是遊戲本身生成的（spawnCharacter／玩家）。"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

URL = sys.argv[1]; OUT = sys.argv[2]; IDS = sys.argv[3:] or ['player', 'heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05']
NAMES = {'player': '祐廷', 'heroine_01': '沈以安', 'heroine_02': '林芷若', 'heroine_03': '陳語彤', 'heroine_04': '高子晴', 'heroine_05': '溫書瑀'}
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
SPOT = (26.0, 0.6)          # 人物站的位置（主巷中間、小公園正前方）
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'

async def load(pg):
    await pg.goto(URL)
    for i in range(240):
        if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
        await pg.wait_for_timeout(500)
    st = {'zone': 'wenzhou', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': SPOT[0] - 9, 'z': -2.5, 'yaw': 0}, 'flags': FLAGS}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st, ensure_ascii=False))
    await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}")
    await pg.evaluate("GAME.E.applyTime(11.0); GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; (GAME.E.extras||[]).slice().forEach(x=>{ const o=x.obj||x.g||x.group; if(o&&o.parent) o.parent.remove(o); }); if(GAME.E.extras) GAME.E.extras.length=0;")

async def cam(pg, pos, look):
    await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(pos), json.dumps(look)))

async def subject(pg, cid, x, z, yaw):
    """把人物放到 (x,z)、朝向 yaw；回傳人物的身高（頭頂高度）。"""
    js = """(c=>{ const E=GAME.E; let n;
      if(c.id==='player'){ n=E.player; } else { n=E.npcs.find(k=>k.charId===c.id); if(!n) n=GAME.spawnCharacter(c.id,c.x,c.z,{yaw:c.yaw}); }
      if(!n) return null; n.obj.visible=true; n.obj.position.set(c.x,0,c.z); n.obj.rotation.y=c.yaw; n.path=null; n.speed=0; if(c.id!=='player'){ n.frozen=true; n.beh='idle'; n.greet=false; n.waveT=0; n.pose='idle'; n.idlePose='idle'; }
      const u=n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; }
      return {h:(u&&u.spec&&u.spec.height)||1.7, key:u&&u.key, driver:u&&u.driver}; })(%s)""" % json.dumps({'id': cid, 'x': x, 'z': z, 'yaw': yaw})
    return await pg.evaluate(js)

async def hide(pg, cid):
    # 拍完一位就把她移出場景（只設 visible=false 會被 NPC 的畫面裁切邏輯重新打開，下一位的照片會混進別人）
    await pg.evaluate("(id=>{ const E=GAME.E; if(id==='player'){ E.player.obj.visible=false; E.player.path=null; E.player.obj.position.set(%f,0,-3.5); return; } const n=E.npcs.find(k=>k.charId===id); if(n){ E.removeNPC(n); for(const k in GAME.npc) if(GAME.npc[k]===n) delete GAME.npc[k]; } })('%s')" % (SPOT[0] - 9, cid))

def label_strip(paths, labels, out, H=520):
    ims = [Image.open(p).convert('RGB') for p in paths]
    ims = [im.resize((int(im.width * H / im.height), H), Image.LANCZOS) for im in ims]
    W = sum(i.width for i in ims) + 8 * (len(ims) + 1)
    c = Image.new('RGB', (W, H + 44), (245, 242, 236)); d = ImageDraw.Draw(c); f = ImageFont.truetype(FONT, 22)
    x = 8
    for im, lb in zip(ims, labels):
        c.paste(im, (x, 40)); d.text((x + 4, 8), lb, fill=(40, 34, 30), font=f); x += im.width + 8
    c.save(out, quality=88); print('  strip', out)

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 720, 'height': 960}, device_scale_factor=1)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await load(pg)
        x0, z0 = SPOT
        for cid in IDS:
            if cid == 'lineup': continue
            info = await subject(pg, cid, x0, z0, 3.14159)
            print(cid, info)
            if not info: continue
            H = info['h']
            shots = []
            for tag, yaw in [('front', 3.14159), ('side', 1.5708), ('back', 0.0)]:
                await subject(pg, cid, x0, z0, yaw)
                await cam(pg, [x0, H * 0.55, z0 - 3.3], [x0, H * 0.5, z0])
                await pg.wait_for_timeout(2500)
                f = f'{OUT}/{cid}_{tag}.png'; await pg.screenshot(path=f); shots.append(f)
            await subject(pg, cid, x0, z0, 3.14159)
            await cam(pg, [x0, H * 0.93, z0 - 0.85], [x0, H * 0.91, z0])
            await pg.wait_for_timeout(2500)
            f = f'{OUT}/{cid}_face.png'; await pg.screenshot(path=f); shots.append(f)
            # 走路：從 5 m 外朝鏡頭走過來（真的在移動，走路動畫）
            await subject(pg, cid, x0 + 3.2, z0, -1.5708)
            await cam(pg, [x0 - 1.6, 1.3, z0 - 1.9], [x0 + 0.9, 1.0, z0])
            await pg.evaluate("(c=>{ const E=GAME.E; const n=c.id==='player'?E.player:E.npcs.find(k=>k.charId===c.id); if(!n) return; if(c.id==='player'){ n.path=E.nav.path(n.obj.position.x,n.obj.position.z,c.x-2,c.z); } else { n.frozen=false; n.beh='route'; n.waypoints=[[c.x-2,c.z],[c.x+4.5,c.z]]; n.ri=-1; n.timer=0; n.walkSpeed=1.3; n.pauseAt=false; } })(%s)" % json.dumps({'id': cid, 'x': x0, 'z': z0}))
            await pg.wait_for_timeout(3500)
            f = f'{OUT}/{cid}_walk.png'; await pg.screenshot(path=f); shots.append(f)
            label_strip(shots, [NAMES[cid] + ' 正面', '側面', '背面', '臉部近景', '走路'], f'{OUT}/STRIP_{cid}.jpg')
            await hide(pg, cid)
        if len(IDS) >= 6 or 'lineup' in IDS:
            # 六人同框（身高對照）：左到右 祐廷、沈以安、林芷若、陳語彤、高子晴、溫書瑀；橫向畫面
            await pg.set_viewport_size({'width': 1600, 'height': 900})
            for i, cid in enumerate(['player', 'heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05']):
                await subject(pg, cid, x0 + 2.75 - i * 1.1, z0, 3.14159)   # 鏡頭朝北：x 大的在畫面左邊
            await cam(pg, [x0, 1.0, z0 - 5.4], [x0, 0.92, z0])
            await pg.wait_for_timeout(3000)
            await pg.screenshot(path=f'{OUT}/lineup_six.png'); print('  lineup')
        print('errors:', errs[:3])
        await b.close()

asyncio.run(main())
