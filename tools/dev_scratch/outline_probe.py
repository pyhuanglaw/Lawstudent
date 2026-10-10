"""開發用：陳語彤領口中間黑色小蝴蝶結（v9.3 #34）的原因實驗——在實際遊戲裡用同一個臉部近景鏡頭，
一次只改一個東西截圖：關掉 T 恤的描邊、關掉全部描邊、身體皮膚換成洋紅色、T 恤換成綠色、只看 T 恤的背面。
哪一張的黑色形狀消失或變色，就是哪個東西。
用法：python3 tools/dev_scratch/outline_probe.py <URL> <輸出資料夾> [人物 id=heroine_03]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; CID = sys.argv[3] if len(sys.argv) > 3 else 'heroine_03'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
SPOT = (26.0, 0.6)
# 每個實驗：對這位人物模型裡的材質做什麼（JS，m＝材質、base＝材質名稱）
EXPS = [
    ('normal', ''),
    ('no_tee_outline', "if(m.isOutline&&/Tops/.test(base)) m.visible=false;"),
    ('no_outline', "if(m.isOutline) m.visible=false;"),
    ('body_magenta', "if(!m.isOutline&&/SKIN|Body/i.test(base)&&!/FACE/i.test(base)){ m.color&&m.color.set(1,0,1); m.shadeColorFactor&&m.shadeColorFactor.set(1,0,1); }"),
    ('tee_green', "if(!m.isOutline&&/Tops/.test(base)){ m.color&&m.color.set(0,1,0); m.shadeColorFactor&&m.shadeColorFactor.set(0,1,0); }"),
    ('tee_outline_red', "if(m.isOutline&&/Tops/.test(base)){ m.outlineColorFactor&&m.outlineColorFactor.set(1,0,0); }"),
    ('body_doubleside', "if(/Body_00_SKIN/.test(base)&&!m.isOutline){ m.side=THREE.DoubleSide; m.needsUpdate=true; }"),
]
# 物件層級的實驗（隱藏某些物件）：o＝物件
OBJ_EXPS = [
    ('no_backpack', "if((o.name||'').startsWith('prop:')) o.visible=false;"),
    ('no_hair', "if(o.isMesh&&[].concat(o.material).some(m=>/HAIR/.test(m.name||''))) o.visible=false;"),
]
async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 720, 'height': 960}, device_scale_factor=1)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(typeof GAME!=='undefined'&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'wenzhou', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': SPOT[0] - 9, 'z': -2.5, 'yaw': 0}, 'flags': FLAGS}
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
        await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}")
        await pg.evaluate("GAME.E.applyTime(11.0); GAME.E.npcs.slice().forEach(n=>GAME.E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k];")
        info = await pg.evaluate("""(c=>{ const E=GAME.E; const n=GAME.spawnCharacter(c.id,c.x,c.z,{yaw:Math.PI}); n.obj.position.set(c.x,0,c.z); n.obj.rotation.y=Math.PI; n.frozen=true; n.beh='idle'; n.greet=false; n.pose='idle'; n.idlePose='idle';
            window.__probe=n; return {h:n.obj.userData.spec&&n.obj.userData.spec.height}; })(%s)""" % json.dumps({'id': CID, 'x': SPOT[0], 'z': SPOT[1]}))
        for i in range(120):
            ok = await pg.evaluate("(()=>{ const m=window.__probe.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })()")
            if ok: break
            await pg.wait_for_timeout(500)
        H = info['h'] or 1.6
        mats = await pg.evaluate("""(()=>{ const out=[]; const seen=new Set(); window.__probe.obj.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(seen.has(m)) continue; seen.add(m); out.push((m.isOutline?'[outline] ':'')+(m.name||'?')+' '+(m.type||'')); } }); return out; })()""")
        print('materials:', json.dumps(mats, ensure_ascii=False))
        await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps([SPOT[0], H * 0.93, SPOT[1] - 0.85]), json.dumps([SPOT[0], H * 0.91, SPOT[1]])))
        await pg.evaluate("(()=>{ const u=window.__probe.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } window.__orig=new Map(); window.__probe.obj.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!window.__orig.has(m)) window.__orig.set(m,{v:m.visible,c:m.color&&m.color.clone(),s:m.shadeColorFactor&&m.shadeColorFactor.clone(),oc:m.outlineColorFactor&&m.outlineColorFactor.clone()}); } }); })()")
        for name, js in EXPS:
            await pg.evaluate("(()=>{ for(const [m,o] of window.__orig){ m.visible=o.v; if(o.c) m.color.copy(o.c); if(o.s) m.shadeColorFactor.copy(o.s); if(o.oc) m.outlineColorFactor.copy(o.oc); } })()")
            await pg.evaluate("(()=>{ window.__probe.obj.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ const base=(m.name||'').replace(/ \\(Outline\\)$/,''); %s } }); })()" % js)
            await pg.wait_for_timeout(1800)
            await pg.screenshot(path=f'{OUT}/{name}.png'); print('shot', name)
        for name, js in OBJ_EXPS:
            await pg.evaluate("(()=>{ for(const [m,o] of window.__orig){ m.visible=o.v; if(o.c) m.color.copy(o.c); if(o.s) m.shadeColorFactor.copy(o.s); if(o.oc) m.outlineColorFactor.copy(o.oc); } window.__probe.obj.traverse(o=>{ if(o.userData.__v!==undefined){ o.visible=o.userData.__v; delete o.userData.__v; } }); })()")
            await pg.evaluate("(()=>{ window.__probe.obj.traverse(o=>{ const before=o.visible; %s if(o.visible!==before) o.userData.__v=before; }); })()" % js)
            await pg.wait_for_timeout(1800)
            await pg.screenshot(path=f'{OUT}/{name}.png'); print('shot', name)
        print('errors:', errs[:3])
        await b.close()
asyncio.run(main())
