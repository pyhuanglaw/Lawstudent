"""體育館 1F 預設鏡頭的白色光柱（BB_218 artrev2 01／09、artrev4、artrev5）：找出是哪一盞燈、地板粗糙度改了以後還在不在。
[前置] 讀使用者 9/25 存檔；[捷徑] 設時間、GAME.enter('gym')（直接進、或先進宿舍再進）、搬玩家到球場中間 (0,-2)、鏡頭在南（yaw 0）、預設距離與俯角。
量法：畫面左邊光柱那一塊（x 110～260、y 60～260，844×390）和右邊對稱那一塊的平均亮度差。
用法：python3 gym_check.py <工作樹> <URL> <輸出> [tag]"""
import os, sys, json, asyncio, io
from PIL import Image, ImageStat
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
LIGHTS = """(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(!o.isLight) return; const p=new THREE.Vector3(); o.getWorldPosition(p); let vis=true; for(let q=o;q;q=q.parent) if(!q.visible) vis=false;
  out.push({id:o.id, type:o.type, name:o.name||'', p:[p.x,p.y,p.z].map(v=>+v.toFixed(2)), i:+o.intensity.toFixed(2), d:o.distance!=null?+(+o.distance).toFixed(1):null, vis, par:o.parent?(o.parent.name||o.parent.type):null}); }); return out; })()"""
SETCAM = "(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); const C=GAME.E.cam; C.yaw=0; C.distTarget=%s; C.pitch=%s; C.manualT=600; })(%s)"
async def streak(pg):
    png = await pg.screenshot(); im = Image.open(io.BytesIO(png)).convert('L'); W, H = im.size; sx = W / 844; sy = H / 390
    a = ImageStat.Stat(im.crop((int(110 * sx), int(60 * sy), int(260 * sx), int(260 * sy)))).mean[0]
    b = ImageStat.Stat(im.crop((int(584 * sx), int(60 * sy), int(734 * sx), int(260 * sy)))).mean[0]
    return round(a, 1), round(b, 1), round(a - b, 1)
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('gym_check', OUT)
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        for hour, via in ((20.5, None), (13.0, None), (13.0, 'dorm')):
            tag = 'h%s%s' % (str(hour).replace('.', '_'), '_via_' + via if via else '')
            if via:
                await pg.evaluate("(async()=>{ GAME.G.hour=%s; GAME.E.hour=%s; await GAME.enter('%s'); })()" % (hour, hour, via)); await pg.wait_for_timeout(9000)
            await pg.evaluate("(async()=>{ GAME.G.hour=%s; GAME.E.hour=%s; await GAME.enter('gym'); })()" % (hour, hour)); await pg.wait_for_timeout(15000)
            run.setup('[捷徑] gym %s' % tag)
            for _ in range(3):   # 手機自己跳出來（20:00 家人群組的訊息）會蓋住整個畫面、遊戲暫停：像玩家一樣收起來（第一次跑就是被手機蓋住，量到的全是同一張圖）
                n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
                if n or shut: run.note('收起來：手機 %d 次、%s' % (n, shut)); await pg.wait_for_timeout(1500)
                else: break
            d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
            await pg.evaluate(SETCAM % (d0, p0, json.dumps([0, -2]))); await pg.wait_for_timeout(6000)
            ok = await pg.evaluate("(()=>{ const c=GAME.E.camera.position, p=GAME.E.player.obj.position; return Math.hypot(c.x-p.x,c.z-p.z)<8 && !(GAME.phoneIsOpen&&GAME.phoneIsOpen()); })()")
            run.check('%s 鏡頭跟到球場中間、沒有面板蓋住' % tag, ok)
            info = await pg.evaluate("({hour:GAME.E.hour, indoor:GAME.E.indoor, sun:+GAME.E.sun.intensity.toFixed(2), sunPos:GAME.E.sun.position.toArray().map(v=>+v.toFixed(1)), formal:!!(GAME.E.zone&&GAME.E.zone.formal), cam:GAME.E.camera.position.toArray().map(v=>+v.toFixed(2)), floor:(()=>{ let r=null; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='gym_court_floor') r={rough:o.material.roughness, metal:o.material.metalness, rmap:!!o.material.roughnessMap, nmap:!!o.material.normalMap}; }); return r; })()})")
            print(tag, 'info', json.dumps(info, ensure_ascii=False), flush=True)
            lights = await pg.evaluate(LIGHTS); print(tag, 'lights', json.dumps(lights, ensure_ascii=False), flush=True)
            s0 = await streak(pg); print(tag, 'streak base', s0, flush=True); await run.shot(pg, '%s_default' % tag)
            # 一盞一盞關掉（visible=false），看光柱跟著哪一盞消失
            for li in lights:
                if not li['vis'] or li['type'] == 'HemisphereLight' or li['type'] == 'AmbientLight': continue
                await pg.evaluate("(id=>{ GAME.E.scene.getObjectById(id).visible=false; })(%d)" % li['id']); await pg.wait_for_timeout(2500)
                s = await streak(pg); print(tag, 'off', li['type'], li['name'], li['p'], li['i'], '->', s, flush=True)
                if abs(s[2] - s0[2]) > 4: await run.shot(pg, '%s_off_%s_%d' % (tag, li['type'], li['id']))
                await pg.evaluate("(id=>{ GAME.E.scene.getObjectById(id).visible=true; })(%d)" % li['id']); await pg.wait_for_timeout(1200)
            # 地板粗糙度（遊戲裡直接改材質，不換模型）：只為了量，正式的修法在 GLB
            for r in (0.5, 0.6):
                await pg.evaluate("(r=>{ GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='gym_court_floor') o.material.roughness=r; }); })(%s)" % r); await pg.wait_for_timeout(2500)
                s = await streak(pg); print(tag, 'rough', r, '->', s, flush=True); await run.shot(pg, '%s_rough_%s' % (tag, str(r).replace('.', '')))
            await pg.evaluate("(r=>{ GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='gym_court_floor') o.material.roughness=r; }); })(%s)" % info['floor']['rough'] if info.get('floor') else "0")
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
