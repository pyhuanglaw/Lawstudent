"""人物驗收的遊戲內截圖（D59：BB-B 驗收角色美術用；BB_131 第 6 節的五個角度）。LAWWW2-B 2026-10-16（ART-05）。
在遊戲本身（index.html）裡把人物生在校園椰林大道上（站姿四張）、椰林大道的長椅（坐姿），白天，每人五張：
  ① front：正面全身待機　② q45：斜前 45° 全身　③ face：頭肩特寫正面（看臉、髮型、眼鏡）　④ walk：走路的側面（原地走）　⑤ sit：坐在長椅上（2026-10-16：教室的桌子會擋住腿和裙子，改長椅）
同一套跑兩次：網址加 ?blchar（LAWWW2 的 Blender 版）／不加（現在預設的 VRoid 加工版或路人底模），BB-B 要並排比。
用法：python3 tools/shots/char_review.py <網址根，例如 http://127.0.0.1:8851> <輸出資料夾> --ids player,heroine_01,…,zhe,classmate_xinci,classmate_bohan,kexin,classmate_peishan（player＝玩家祐廷） [--variants bl,def] [--sx -30 --sz -1.5]
輸出：<輸出資料夾>/<id>_<variant>_<角度>.png（800×800），印出每張的狀態。不改任何遊戲檔案。"""
import asyncio, json, math, os, sys
from playwright.async_api import async_playwright
ROOT, OUT = sys.argv[1].rstrip('/'), sys.argv[2]
OPT = {sys.argv[i]: sys.argv[i + 1] for i in range(3, len(sys.argv) - 1) if sys.argv[i].startswith('--')}
IDS = OPT.get('--ids', 'zhe,classmate_xinci,classmate_bohan,kexin,classmate_peishan').split(',')
VARS = OPT.get('--variants', 'bl,def').split(',')
os.makedirs(OUT, exist_ok=True)
HIDE = '#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#talkBtn{display:none!important}'   # 同 fast_shots.py 的 HIDE_HUD


async def wait_frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def load(pg, zone, hour):
    await pg.evaluate("(async(z,h)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,{zone:z,hour:h,day:8,weekday:2,weather:'sunny'}); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s,%s)" % (json.dumps(zone), hour))
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    await pg.evaluate(CLOSE_PHONE)   # 手機自動打開會暫停遊戲，下面等畫格會一直等不到
    await wait_frames(pg, 10)
    await pg.evaluate("GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); (GAME.E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); GAME.E.player.obj.visible=false; for(const k in GAME.npc) delete GAME.npc[k];")


async def spawn(pg, cid, x, z, opts):
    # player＝玩家本人（E.player，祐廷）；其他用 GAME.spawnCharacter 生成。
    # 還沒有 char3d 的人（杜可昕：平常不在台大）只在截圖時補上 manifest 的模型（不改遊戲檔案；2026-10-16 第一輪沒補，拍到的是路人底模）
    await pg.evaluate("((id,x,z,o)=>{ let n; if(id==='player'){ n=GAME.E.player; n.obj.visible=true; n.obj.position.set(x,0,z); n.obj.rotation.y=o.yaw||0; n.path=null; n.seat=null; n.frozen=true; n.pose='idle'; n.idlePose='idle'; } else { const C=CHARACTERS[id]; if(C&&!C.char3d&&ASSETS.manifest['char.'+id]) C.char3d={spec:id,model:'char.'+id}; n=GAME.spawnCharacter(id,x,z,o); n.frozen=true; n.beh='idle'; } window.__n=n; })(%s,%s,%s,%s)" % (json.dumps(cid), x, z, json.dumps(opts)))
    for _ in range(120):                                                       # 等 VRM 載入（換掉暫時的模型）
        ok = await pg.evaluate("(()=>{ const m=window.__n.obj.userData&&window.__n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })()")
        if ok: break
        await pg.wait_for_timeout(500)
    await pg.evaluate("(()=>{ const u=window.__n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } })()")   # 不要拍到眨眼的那一格（同 fast_shots.py）
    await wait_frames(pg, 8)


CLOSE_PHONE = ("(()=>{ try{ if(typeof STORY!=='undefined'&&STORY.phoneAuto) STORY.phoneAuto=()=>{}; if(GAME.closePhone) GAME.closePhone(); if(GAME.closeMenu) GAME.closeMenu(); }catch(e){} "
               # 10-24：還是有別的路會把手機打開（側面以後四張整組拍到手機）：每 0.3 秒關一次、解除暫停，手機和提示框用 CSS 藏起來（只在截圖的頁面）
               "if(!window._crWD){ window._crWD=setInterval(()=>{ try{ if(GAME.closePhone) GAME.closePhone(); if(GAME.E&&GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); } "
               "let el=document.getElementById('crNoPhone'); if(!el){ el=document.createElement('style'); el.id='crNoPhone'; document.head.appendChild(el); } el.textContent='#phone,#toast,.toast,#adv,#dlg{display:none!important}'; })()")   # 讀檔後要回的訊息會讓手機自動打開、遊戲暫停（story3d.js S.phoneAuto，D103）：10-23 第一輪整組拍到手機畫面


async def cam(pg, p, l, hour):
    await pg.evaluate(CLOSE_PHONE)
    await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(p), json.dumps(l)))
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(%s)" % hour)


async def remove_npc(pg):
    await pg.evaluate("(()=>{ const n=window.__n; if(n===GAME.E.player){ n.seat=null; n.pose='idle'; n.idlePose='idle'; n.obj.userData.sitFeet=false; n.obj.visible=false; return; } GAME.E.removeNPC(n); for(const k in GAME.npc) delete GAME.npc[k]; })()")


async def run(variant):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 800, 'height': 800}, device_scale_factor=1)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(ROOT + '/index.html?turbo' + ('&blchar' if variant == 'bl' else ''))
        for _ in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.add_style_tag(content=HIDE)
        # ①～④ 站著：校園的椰林大道上（白天 10:30），人物面向南（+z），鏡頭在南邊
        SX, SZ = float(OPT.get('--sx', '-30')), float(OPT.get('--sz', '-1.5'))
        await load(pg, 'campus', 10.5)
        for cid in IDS:
            await spawn(pg, cid, SX, SZ, {'yaw': 0})
            H = await pg.evaluate("(()=>{ const b=new THREE.Box3().setFromObject(window.__n.obj); return +(b.max.y-b.min.y).toFixed(2); })()")
            for name, c, l, pose in (('front', (SX, H * 0.55, SZ + 3.8), (SX, H * 0.5, SZ), 'idle'),
                                     ('q45', (SX + 2.7, H * 0.55, SZ + 2.7), (SX, H * 0.5, SZ), 'idle'),
                                     ('face', (SX, H * 0.9, SZ + 0.95), (SX, H * 0.88, SZ), 'idle'),
                                     ('neck', (SX + 0.12, H * 0.82, SZ + 0.6), (SX, H * 0.8, SZ), 'idle'),
                                     ('faceq', (SX + 0.68, H * 0.9, SZ + 0.68), (SX, H * 0.88, SZ), 'idle'),   # 頭肩特寫、斜前 45°（三分之四側；LAWWW 驗收沛珊要正面＋三分之四側並排，LAWWW2-B 10-23）
                                     ('walk', (SX + 3.8, H * 0.55, SZ), (SX, H * 0.5, SZ), 'walk')):
                await pg.evaluate("((p)=>{ const n=window.__n; n.pose=p; n.idlePose=p; n.speed=(p==='walk'?1.3:0); })(%s)" % json.dumps(pose))
                await cam(pg, c, l, 10.5); await wait_frames(pg, 10 if pose == 'walk' else 6)
                out = os.path.join(OUT, f'{cid}_{variant}_{name}.png'); await pg.screenshot(path=out); print('shot', out, 'H', H, flush=True)
            # ⑤ 坐著：椰林大道北側的長椅（x −25，面向南）；從斜前方低一點拍，看得到腿和裙子
            await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>Math.abs(q.x+25)<0.01&&q.z<0); window.__n.speed=0; GAME.sitAt(window.__n,s); window.__seat=[s.x,s.z]; })()")
            bx, bz = await pg.evaluate("window.__seat"); await wait_frames(pg, 8)
            await cam(pg, (bx + 1.3, 1.05, bz + 2.6), (bx, 0.62, bz), 10.5); await wait_frames(pg, 6)
            out = os.path.join(OUT, f'{cid}_{variant}_sit.png'); await pg.screenshot(path=out); print('shot', out, flush=True)
            await remove_npc(pg)
        print(variant, 'errors', errs[:5], flush=True)
        await b.close()


async def main():
    for v in VARS: await run(v)

asyncio.run(main())
