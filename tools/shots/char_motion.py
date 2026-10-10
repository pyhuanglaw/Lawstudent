"""人物動作驗收（實際遊戲）：坐下（溫州街小公園的長椅）、上樓梯（霖澤館大廳的直跑樓梯，人物自己走上去）。
每個動作拍正面＋側面；樓梯在爬到第一段中間、平台、第二段中間各拍一張（側面看腳有沒有踩在踏面上、有沒有穿進台階）。
試作版：CHAR_SWAP="assets/models/char/vroid_heroine_01.vrm=tools/vroid_wip/bl/h01.vrm"（瀏覽器攔截模型請求、改送試作檔，不覆蓋正式模型）
用法：python3 tools/shots/char_motion.py <URL> <輸出資料夾> <人物 id>（id＝player 時拍玩家本人：玩家自己坐下、自己走上樓梯）"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

URL, OUT, CID = sys.argv[1:4]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"
CAM = "((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)"
NPC = "(id=>GAME.E.npcs.find(k=>k.charId===id))"
ENT = "(id=>id==='player'?GAME.E.player:GAME.E.npcs.find(k=>k.charId===id))"   # 2026-10-10：玩家（祐廷）不是 NPC，不能用 spawnCharacter


async def cam(pg, p, l):
    await pg.evaluate(CAM % (json.dumps(p), json.dumps(l)))


async def main():
    os.makedirs(OUT, exist_ok=True); shots = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.set_viewport_size({'width': 720, 'height': 960})
        for pair in filter(None, os.environ.get('CHAR_SWAP', '').split(';')):
            u, f = pair.split('=', 1); body = open(os.path.join(ROOT, f), 'rb').read()
            await pg.route('**/' + u, (lambda b_: (lambda route: route.fulfill(status=200, body=b_, headers={'Content-Type': 'application/octet-stream'})))(body))
            print('swap', u, '->', f, flush=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        flags = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
        # ---- 坐下：溫州街小公園的長椅 ----
        await L.load_state(pg, {'zone': 'wenzhou', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 17, 'z': -2.5, 'yaw': 0}, 'flags': flags}, quiet_events=True)
        await pg.wait_for_timeout(2500); await pg.add_style_tag(content=HIDE)
        seat = {'x': 23.6, 'z': 7.94, 'yaw': 3.14159}   # 溫州街小公園長椅的座位點（zones3d：長椅 (23.6, 8.0)、座位在中心前 0.06 m）
        if CID == 'player':
            info = await pg.evaluate("""(c=>{ const E=GAME.E; E.npcs.slice().forEach(n=>E.removeNPC(n)); const P=E.player; GAME.sitAt(P,c.s); let k=null,d=null; P.obj.traverse(x=>{ if(x.userData&&x.userData.driver&&!d){ k=x.userData.key; d=x.userData.driver; } }); return {key:k,driver:d}; })(%s)""" % json.dumps({'id': CID, 's': seat}))
        else:
            info = await pg.evaluate("""(c=>{ const E=GAME.E; E.npcs.slice().forEach(n=>{ if(n.charId!==c.id) E.removeNPC(n); }); let n=E.npcs.find(k=>k.charId===c.id); if(!n) n=GAME.spawnCharacter(c.id,c.s.x,c.s.z-1,{yaw:c.s.yaw});
            GAME.sitAt(n,c.s); n.greet=false; const u=n.obj.userData; if(u.anim){ u.anim.blink=1e9; } E.player.obj.position.set(c.s.x-6,0,c.s.z-6); return {key:u.key,driver:u.driver}; })(%s)""" % json.dumps({'id': CID, 's': seat}))
        print('sit', info, flush=True)
        for tag, pp, ll in [('sit_front', [seat['x'], 1.0, seat['z'] - 2.4], [seat['x'], 0.65, seat['z']]), ('sit_side', [seat['x'] + 2.3, 0.9, seat['z'] - 0.4], [seat['x'], 0.6, seat['z']])]:
            await cam(pg, pp, ll); await pg.wait_for_timeout(2500); f = f'{OUT}/{CID}_{tag}.png'; await pg.screenshot(path=f); shots.append((tag, f))
        # ---- 上樓梯：霖澤館大廳（第一段 z 5.0→1.36、平台 1.36→-0.04 高 2.18、第二段 -0.04→-3.4 到 4.2）----
        await L.load_state(pg, {'zone': 'linze', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 4.0, 'z': 4.0, 'yaw': 0, 'lv': 0}, 'flags': flags}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        if CID == 'player':
            info = await pg.evaluate("""(c=>{ const E=GAME.E; E.npcs.slice().forEach(n=>E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; const P=E.player; E.placeAt(P,-6.6,6.0,0); P.obj.rotation.y=Math.PI;
                void GAME.walkTo(P,-6.6,-4.6,{lv:1}); return {walk:true}; })(%s)""" % json.dumps({'id': CID}))
        else:
            info = await pg.evaluate("""(c=>{ const E=GAME.E; E.npcs.slice().forEach(n=>E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; const n=GAME.spawnCharacter(c.id,-6.6,6.0,{yaw:Math.PI}); n.greet=false; n.frozen=false; n.beh='idle';
            const u=n.obj.userData; if(u.anim){ u.anim.blink=1e9; } void GAME.walkTo(n,-6.6,-4.6,{lv:1}); return {key:u.key,driver:u.driver}; })(%s)""" % json.dumps({'id': CID}))
        print('stairs', info, flush=True)
        want = [('stairs_flight1', 0.7, 1.7), ('stairs_landing', 2.1, 2.3), ('stairs_flight2', 2.9, 3.7), ('stairs_top', 4.15, 4.3)]; done = set()
        for i in range(240):
            st = await pg.evaluate("(id=>{ const n=%s(id); if(!n) return null; const o=n.obj.position; return {x:o.x,y:o.y,z:o.z,lv:n.lv|0}; })(%s)" % (ENT, json.dumps(CID)))
            if not st: break
            for tag, lo, hi in want:
                if tag not in done and lo <= st['y'] <= hi:
                    done.add(tag)
                    # 拍照時暫停遊戲（人物停在量到的位置），手動擺鏡頭、畫一格
                    st = await pg.evaluate("(id=>{ const E=GAME.E; E.paused=true; const n=%s(id); const o=n.obj.position; return {x:o.x,y:o.y,z:o.z,lv:n.lv|0}; })(%s)" % (ENT, json.dumps(CID)))
                    dbg = await pg.evaluate("((p,l,id)=>{ const E=GAME.E; E.camera.position.set(...p); E.camera.lookAt(new THREE.Vector3(...l)); E.camera.updateMatrixWorld(true); const m=(id==='player'?E.player:E.npcs.find(k=>k.charId===id)); m.obj.visible=true; /* 遊戲暫停時 NPC 的距離剔除不會重算（上一格是照跟隨鏡頭算的）*/ E.render(); const n=m; const wp=new THREE.Vector3(); n.obj.getWorldPosition(wp); const v=wp.clone().add(new THREE.Vector3(0,0.8,0)).project(E.camera); let vis=0; n.obj.traverse(x=>{ if(x.isMesh&&x.visible) vis++; }); return {ndc:[+v.x.toFixed(2),+v.y.toFixed(2)], visible:n.obj.visible, vis, nNpc:E.npcs.filter(k=>k.charId===id).length, parent:n.obj.parent&&n.obj.parent.type}; })(%s,%s,%s)" % (json.dumps([st['x'] + 3.0, st['y'] + 1.0, st['z'] + 0.2]), json.dumps([st['x'], st['y'] + 0.75, st['z']]), json.dumps(CID)))
                    print('  dbg', dbg, flush=True)
                    await pg.wait_for_timeout(600); f = f'{OUT}/{CID}_{tag}.png'; await pg.screenshot(path=f); shots.append((tag, f))
                    print(tag, st, flush=True)
                    await pg.evaluate("GAME.E.paused=false")
            if len(done) == len(want): break
            await pg.wait_for_timeout(500)
        print('errors', errs[:3], flush=True)
        await b.close()
    f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 22); H = 520
    ims = [(t, Image.open(p).convert('RGB').crop((110, 60, 610, 900))) for t, p in shots]
    ims = [(t, im.resize((int(im.width * H / im.height), H))) for t, im in ims]
    W = sum(im.width for _, im in ims) + 8 * (len(ims) + 1); c = Image.new('RGB', (max(W, 200), H + 40), (245, 242, 236)); d = ImageDraw.Draw(c); x = 8
    LB = {'sit_front': '坐下（正面）', 'sit_side': '坐下（側面）', 'stairs_flight1': '上樓梯 第一段', 'stairs_landing': '平台', 'stairs_flight2': '第二段', 'stairs_top': '二樓'}
    for t, im in ims: c.paste(im, (x, 36)); d.text((x + 4, 6), LB.get(t, t), fill=(30, 30, 30), font=f); x += im.width + 8
    c.save(f'{OUT}/MOTION_{CID}.jpg', quality=86); print('saved', f'{OUT}/MOTION_{CID}.jpg')

asyncio.run(main())
