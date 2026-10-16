"""遊戲內 look-dev A/B：同一個鏡頭、同一個時間，一次只改一樣東西，比較人物（和背景）看起來有沒有變好。LAWWW2-B 2026-10-16（精修第 1 批）。
每個變體是一段 JS（在遊戲頁面執行；要寫成「設成某個絕對值」，不要寫相對值，因為變體會依序套在同一個畫面上），
第一個變體通常是 'base'（還原成遊戲原本的設定，用 window.__base 存的原始值）。
用法：python3 tools/shots/lookdev_ab.py <網址根> <輸出資料夾> <變體 JSON 檔> [--ids player,heroine_01] [--hour 10.5] [--shots face,front] [--blchar]
變體 JSON：[{"name":"base","js":"..."}, {"name":"neutral","js":"..."}]
輸出：<輸出資料夾>/<變體>_<id>_<鏡頭>.png（800×800）；另外把每個 id 的各變體並排成 <id>_<鏡頭>_ab.png。不改任何遊戲檔案。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont
ROOT, OUT, VJ = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
OPT = {sys.argv[i]: sys.argv[i + 1] for i in range(4, len(sys.argv) - 1) if sys.argv[i].startswith('--') and not sys.argv[i + 1].startswith('--')}
IDS = OPT.get('--ids', 'player,heroine_01').split(','); HOUR = float(OPT.get('--hour', '10.5')); SHOTS = OPT.get('--shots', 'face,front').split(',')
BL = '--blchar' in sys.argv
VARS = json.load(open(VJ)); os.makedirs(OUT, exist_ok=True)
HIDE = '#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#talkBtn{display:none!important}'
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SX, SZ = -30.0, -1.5
# 記下原始值（變體 'base' 用來還原）：tone mapping、曝光、所有材質的關鍵參數
SNAP = """(()=>{ if(window.__base) return; const E=GAME.E, R=E.renderer; const mats=new Map();
  E.scene.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m||mats.has(m)) continue;
    const s={}; for(const k of ['shadingShiftFactor','shadingToonyFactor','giEqualizationFactor','parametricRimLiftFactor','parametricRimFresnelPowerFactor','rimLightingMixFactor','outlineWidthFactor','roughness','metalness','envMapIntensity'])
      if(typeof m[k]==='number') s[k]=m[k];
    for(const k of ['color','shadeColorFactor','parametricRimColorFactor','emissive','matcapFactor']) if(m[k]&&m[k].isColor) s[k]=m[k].clone();
    s.receive=o.receiveShadow; mats.set(m,s); } });
  window.__base={tm:R.toneMapping, exp:R.toneMappingExposure, mats}; })()"""
RESTORE = """(()=>{ const B=window.__base, E=GAME.E, R=E.renderer; R.toneMapping=B.tm; for(const [m,s] of B.mats){ for(const k in s){ if(k==='receive') continue; if(s[k]&&s[k].isColor) m[k].copy(s[k]); else m[k]=s[k]; } m.needsUpdate=true; }
  E.scene.traverse(o=>{ if(o.isMesh){ const m=Array.isArray(o.material)?o.material[0]:o.material; const s=B.mats.get(m); if(s) o.receiveShadow=s.receive; } }); window.__expOverride=null; })()"""


async def frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 800, 'height': 800}, device_scale_factor=1)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(ROOT + '/index.html?turbo' + ('&blchar' if BL else ''))
        for _ in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.add_style_tag(content=HIDE)
        await pg.evaluate("(async(h)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,{zone:'campus',hour:h,day:8,weekday:2,weather:'sunny'}); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % HOUR)
        await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
        await frames(pg, 10)
        await pg.evaluate("GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); (GAME.E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); GAME.E.player.obj.visible=false; for(const k in GAME.npc) delete GAME.npc[k];")
        # 人物排成一排（間隔 3 m），全部生好、等 VRM 載入
        ents = {}
        for i, cid in enumerate(IDS):
            x = SX + i * 3.0
            await pg.evaluate("((id,x,z)=>{ let n; if(id==='player'){ n=GAME.E.player; n.obj.visible=true; n.obj.position.set(x,0,z); n.obj.rotation.y=0; n.path=null; n.frozen=true; n.pose='idle'; n.idlePose='idle'; } else { n=GAME.spawnCharacter(id,x,z,{yaw:0}); n.frozen=true; n.beh='idle'; } (window.__ents=window.__ents||{})[id]=n; })(%s,%s,%s)" % (json.dumps(cid), x, SZ))
            ents[cid] = x
        for _ in range(120):
            if await pg.evaluate("Object.values(window.__ents).every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("Object.values(window.__ents).forEach(n=>{ const u=n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } })")
        await frames(pg, 8)
        await pg.evaluate(SNAP)
        H = await pg.evaluate("(()=>{ const r={}; for(const k in window.__ents){ const b=new THREE.Box3().setFromObject(window.__ents[k].obj); r[k]=+(b.max.y-b.min.y).toFixed(2); } return r; })()")
        print('heights', H, flush=True)
        for v in VARS:
            await pg.evaluate(RESTORE)
            if v.get('js'): await pg.evaluate(v['js'])
            await pg.evaluate("(()=>{ GAME.E.scene.traverse(o=>{ if(o.isMesh) for(const m of (Array.isArray(o.material)?o.material:[o.material])) if(m) m.needsUpdate=true; }); })()")
            for cid in IDS:
                x = ents[cid]; h = H[cid]
                for sh in SHOTS:
                    c, l = {'face': ((x, h * 0.9, SZ + 0.95), (x, h * 0.88, SZ)), 'front': ((x, h * 0.55, SZ + 3.8), (x, h * 0.5, SZ)),
                            'q45': ((x + 2.7, h * 0.55, SZ + 2.7), (x, h * 0.5, SZ)), 'game': ((x - 4.5, 2.6, SZ + 4.0), (x, 1.2, SZ))}[sh]
                    await pg.evaluate("((p,l,h)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); GAME.G.hour=h; E.applyTime(h); if(window.__expOverride!=null) E.renderer.toneMappingExposure=window.__expOverride; })(%s,%s,%s)" % (json.dumps(c), json.dumps(l), HOUR))
                    await frames(pg, 5)
                    out = os.path.join(OUT, f"{v['name']}_{cid}_{sh}.png"); await pg.screenshot(path=out); print('shot', out, flush=True)
        print('errors', errs[:5], flush=True)
        await b.close()
    f = ImageFont.truetype(FONT, 26)
    for cid in IDS:
        for sh in SHOTS:
            ims = [Image.open(os.path.join(OUT, f"{v['name']}_{cid}_{sh}.png")).convert('RGB') for v in VARS]
            W = Image.new('RGB', (800 * len(ims), 840), (20, 20, 20)); d = ImageDraw.Draw(W)
            for i, (im, v) in enumerate(zip(ims, VARS)): W.paste(im, (800 * i, 40)); d.text((800 * i + 12, 6), v['name'], fill=(255, 255, 255), font=f)
            W.save(os.path.join(OUT, f'{cid}_{sh}_ab.png'))


asyncio.run(main())
