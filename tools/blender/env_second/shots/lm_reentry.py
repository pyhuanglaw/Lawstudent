"""有光照貼圖的房間「進兩次」檢查（LIB-HALL-LM-1028／RT-NIGHT-1028 收尾，LAWWW2-B 2026-10-30）。
同一次遊戲裡：讀檔進房間 → 拍一張、數接上光照貼圖的材質 → GAME.enter 出去（預設校園）→ 再 GAME.enter 回來 → 再拍一張、再數一次。
快取的 GLB 第二次進來是 clone、材質共用；onBeforeCompile 包兩層會 shader 編不過、整個網格不畫（BB-C 10-28 霖澤館大廳那一次）。
記：接上光照貼圖的材質數（lightMap 有值）、包了 rtK 的材質數、看得到的網格數、console 的 shader 錯誤、JS 例外；兩張同角度截圖的像素差。
用法（測試樹開 http server）：
  python3 tools/blender/env_second/shots/lm_reentry.py <URL> <區域> <輸出資料夾> [時刻=20.5] [出去到哪=campus]
同一台機器上同時只跑這一個瀏覽器工作。"""
import asyncio, json, sys, os
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
URL, ZONE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
HOUR = float(sys.argv[4]) if len(sys.argv) > 4 else 20.5
AWAY = sys.argv[5] if len(sys.argv) > 5 else 'campus'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
COUNT = """(()=>{ const z=GAME.E.zone, seen=new Set(); let lm=0, rt=0, vis=0;
  z.group.traverse(o=>{ if(!o.isMesh) return; if(o.visible) vis++; [].concat(o.material).forEach(m=>{ if(!m||seen.has(m)) return; seen.add(m); if(m.lightMap) lm++; if(m.onBeforeCompile&&/rtK/.test(String(m.onBeforeCompile))) rt++; }); });
  return {zone:GAME.G.zone, lm, rt, vis, mats:seen.size}; })()"""
POSE = """(h=>{ const E=GAME.E, P=E.player; P.busy=true; GAME.G.hour=h; E.applyTime(h); E.npcs.forEach(n=>{ n.hidden=true; n.obj.visible=false; });
  const C=E.cam; C.mode='follow'; C.yaw=0; C.pitch=0.3; C.manualT=1e9; })"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs, shader = [], []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.on('console', lambda m: shader.append(m.text[:300]) if ('Shader Error' in m.text or 'shader' in m.text.lower() and m.type == 'error') else None)
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
        st = {'zone': ZONE, 'day': -330, 'hour': HOUR, 'stage': 'econ', 'weather': 'sunny', 'flags': FLAGS}
        await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.weekday=3; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(20000)
        res = {}
        for k in ('first', 'second'):
            if k == 'second':
                await pg.evaluate("GAME.enter(%s)" % json.dumps(AWAY)); await pg.wait_for_timeout(15000)
                res['away'] = await pg.evaluate(COUNT)
                await pg.evaluate("GAME.enter(%s)" % json.dumps(ZONE)); await pg.wait_for_timeout(20000)
            await pg.evaluate(POSE + "(%s)" % HOUR); await pg.wait_for_timeout(8000)
            res[k] = await pg.evaluate(COUNT)
            await pg.screenshot(path=os.path.join(OUT, '%s.png' % k))
            print(k, json.dumps(res[k], ensure_ascii=False), flush=True)
        a = np.asarray(Image.open(os.path.join(OUT, 'first.png')).convert('RGB'), dtype=int); c = np.asarray(Image.open(os.path.join(OUT, 'second.png')).convert('RGB'), dtype=int)
        d = np.abs(a - c).max(axis=2); res['diff_px_gt24'] = int((d > 24).sum()); res['diff_mean'] = round(float(d.mean()), 3)
        res['shader_errors'] = shader; res['js_errors'] = errs
        print('RESULT', json.dumps(res, ensure_ascii=False), flush=True)
        json.dump(res, open(os.path.join(OUT, 'result.json'), 'w'), ensure_ascii=False, indent=1)
        await b.close()
asyncio.run(main())
