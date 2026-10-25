"""室外無名路人：完整版和遠距離版本並排比較（PERF-PATROL-ECON-1025 ⑥，LAWWW2-B 2026-10-25；LAWWW-B 要 18／24／30 m 三組比較圖再決定切換距離）。
同一個鏡頭、同一批人：三個無名路人放在離鏡頭 18、24、30 m（左右錯開），先全部用完整版拍一張、再全部用遠距離版本拍一張；裁出每個人放大並排。
【捷徑】讀檔把玩家放到地點、藏起其他人；把 CHAR.FAR_OUT／FAR_IN 暫時設成很大或 0，讓引擎每一格都選同一個版本（遊戲照常是自動）。
用法（repo 根目錄開 http server）：
  python3 tools/blender/env_second/shots/npc_far_compare.py http://127.0.0.1:8765/index.html <輸出資料夾> [地點,地點]（avenue、gate）
同一台機器上同時只跑這一個瀏覽器工作。"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
URL, OUT = sys.argv[1], sys.argv[2]; WHERE = (sys.argv[3] if len(sys.argv) > 3 else 'avenue,gate').split(',')
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
SPOTS = {'avenue': {'pos': [-60, 0], 'yaw': -1.5708, 'hour': 12, 'label': '椰林大道往東（12:00）'},
         'gate': {'pos': [-115, 0.5], 'yaw': -1.5708, 'hour': 15, 'label': '校門往東（15:00）'}}
DIST = [18, 24, 30]; LAT = [-3.2, 0.4, 3.6]   # 左右錯開（公尺），不互相擋
F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 22)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
        for w in WHERE:
            S = SPOTS[w]
            st = {'zone': 'campus', 'day': -363, 'hour': S['hour'], 'stage': 'econ', 'weather': 'sunny', 'flags': FLAGS}
            await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.weekday=3; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
            await pg.wait_for_timeout(8000)
            # 挑三個有遠距離版本的無名路人（站著的），其他人、騎車的人藏起來
            n = await pg.evaluate("""((S,D,LAT)=>{ const E=GAME.E, P=E.player; P.obj.position.set(S.pos[0],0,S.pos[1]); P.path=null; P.busy=true; GAME.G.hour=S.hour; E.applyTime(S.hour);
                const C=E.cam; C.mode='follow'; C.yaw=S.yaw; C.manualT=1e9;
                (E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); });
                const pick=E.npcs.filter(n=>n.isExtra&&n.obj.userData.farLOD&&!n.seat&&n.pose!=='sit'&&n.pose!=='read').slice(0,3);
                E.npcs.forEach(n=>{ if(pick.indexOf(n)<0){ n.hidden=true; n.obj.visible=false; } });
                window.__pick=pick; return pick.length; })(%s,%s,%s)""" % (json.dumps(S), json.dumps(DIST), json.dumps(LAT)))
            await pg.wait_for_timeout(3000)
            # 鏡頭位置定了以後，把三個人放在鏡頭前方 18／24／30 m（水平距離）
            await pg.evaluate("""((D,LAT)=>{ const E=GAME.E, cam=E.camera; const f=new THREE.Vector3(); cam.getWorldDirection(f); f.y=0; f.normalize(); const r=new THREE.Vector3(-f.z,0,f.x);
                window.__pick.forEach((n,i)=>{ const x=cam.position.x+f.x*D[i]+r.x*LAT[i], z=cam.position.z+f.z*D[i]+r.z*LAT[i]; n.obj.position.set(x,0,z); n.obj.rotation.y=Math.atan2(cam.position.x-x,cam.position.z-z); n.path=null; n.frozen=true; n.beh='idle'; n.pose='idle'; n.speed=0; });
                window.__dist=window.__pick.map(n=>+Math.hypot(cam.position.x-n.obj.position.x,cam.position.z-n.obj.position.z).toFixed(1)); })(%s,%s)""" % (json.dumps(DIST), json.dumps(LAT)))
            shots = {}
            for mode in ['near', 'far']:
                await pg.evaluate("(m=>{ if(window.__F0==null){ window.__F0=[CHAR.FAR_OUT,CHAR.FAR_IN]; } if(m==='near'){ CHAR.FAR_OUT=1e9; CHAR.FAR_IN=1e9; } else { CHAR.FAR_OUT=0; CHAR.FAR_IN=0; } })(%s)" % json.dumps(mode))
                await pg.wait_for_timeout(5000)
                info = await pg.evaluate("(()=>{ const cam=GAME.E.camera; return window.__pick.map(n=>{ const v=n.obj.position.clone(); v.y+=0.9; v.project(cam); return {far:!!n.obj.userData.isFar, x:(v.x+1)/2, y:(1-v.y)/2, d:+Math.hypot(cam.position.x-n.obj.position.x,cam.position.z-n.obj.position.z).toFixed(1)}; }); })()")
                path = os.path.join(OUT, '%s_%s.png' % (w, mode)); await pg.screenshot(path=path); shots[mode] = (path, info)
                print(w, mode, n, json.dumps(info), errs[-1:], flush=True)
            await pg.evaluate("(()=>{ CHAR.FAR_OUT=window.__F0[0]; CHAR.FAR_IN=window.__F0[1]; window.__F0=null; })()")
            # 並排：每個距離一欄，上＝完整版、下＝遠距離版本（裁一樣的框、放大 2 倍）
            cols = []
            for i in range(len(shots['near'][1])):
                ims = []
                for mode in ['near', 'far']:
                    im = Image.open(shots[mode][0]); W, H = im.size; c = shots[mode][1][i]; cx, cy = c['x'] * W, c['y'] * H
                    hh = max(60, int(H * 0.42 * 18 / max(c['d'], 1))); bw = int(hh * 0.8)
                    box = (int(cx - bw / 2), int(cy - hh * 0.62), int(cx + bw / 2), int(cy + hh * 0.5))
                    ims.append(im.crop(box).resize((260, int(260 * (box[3] - box[1]) / (box[2] - box[0])))))
                cols.append((shots['near'][1][i]['d'], ims))
            ch = max(sum(x.size[1] for x in c[1]) for c in cols) + 34 * 3
            sheet = Image.new('RGB', (len(cols) * 270 + 10, ch + 40), (245, 245, 242)); d = ImageDraw.Draw(sheet)
            d.text((10, 6), S['label'] + '：上＝完整版、下＝遠距離版本（同一個人、同一個鏡頭，裁出來放大）', fill=(20, 20, 20), font=F)
            for k, (dist, ims) in enumerate(cols):
                x = 10 + k * 270; y = 40; d.text((x, y), '%.0f m' % dist, fill=(20, 20, 20), font=F); y += 30
                for im in ims: sheet.paste(im, (x, y)); y += im.size[1] + 4
            sp = os.path.join(OUT, '%s_crops.jpg' % w); sheet.save(sp, quality=88); print('sheet', sp, flush=True)
        await b.close()
asyncio.run(main())
