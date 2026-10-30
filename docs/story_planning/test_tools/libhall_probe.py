"""BB-B 10-30：LIB-HALL-LM-1028（總圖大廳光照貼圖）＋RT-NIGHT-1028（晚上天窗、小零件跟著暗）畫面驗收（LAWWW2-B 03:23 請求，c48a5c310）。
兩棵樹各跑一次、同一組鏡頭：修改前＝開發 c76d0cb69（lwdev）；修改後＝c76d0cb69＋兩份 patch＋c48a5c310 的三個檔（lwlib，BB-B 自己照 README 的套法重建）。
鏡頭（玩家跟隨鏡頭、手機橫向 844×390，HUD 藏起來、NPC 藏起來；人放到那個位置＝【捷徑】）：
  v1 一樓入口往大樓梯　v2 服務台　v3 一樓西翼　v4 二樓自習區（小安「總圖的下午」那兩張長桌）　v5 二樓連廊往北看中庭、大樓梯
  時刻 14:30、20:30；另外晚上的 霖澤館大廳、萬才館大廳、男一舍門廳 各一張（⑤ 有沒有變怪）
進兩次（③）：修改後那棵，20:30 進總圖大廳拍 v1 → 照玩家走到大門出去（校園）→ 走回總圖門口按「進入」→ 同一個鏡頭再拍一張，比像素差、數接上光照貼圖的材質數。
記：每一張的平均亮度（線性 Y）、formal 模型有沒有載入、lightMap 材質數、JS 例外、shader 錯誤。最後拼成「左修改前｜右修改後」的對照圖。
不是 iPhone：Playwright＋SwiftShader。用法：LW_TESTS=<任一樹>/tests python3 libhall_probe.py <修改前 URL> <修改後 URL> <輸出資料夾>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
import numpy as np
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
BEFORE, AFTER, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
J = lambda o: json.dumps(o, ensure_ascii=False)
PI = math.pi
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
VIEWS = [('v1_entrance', 0, 4.6, 0, 0, 0.16), ('v2_desk', 5.6, 1.6, 0, -PI / 2 + 0.5, 0.2), ('v3_west', -5.6, 0.6, 0, PI / 2, 0.16),
         ('v4_study2f', -5.9, -2.2, 1, PI / 2 - 0.35, 0.22), ('v5_atrium2f', 0, 1.0, 1, 0, 0.32)]
OTHER = [('linze', 0, -1, PI, 0.12), ('wancai', 0, 1.5, PI, 0.12), ('dorm_hall', 0, 6.0, 0, 0.14)]
COUNT = """(()=>{ const z=GAME.E.zone, seen=new Set(); let lm=0, vis=0, formal=!!z.formal; z.group.traverse(o=>{ if(!o.isMesh) return; if(o.visible) vis++; [].concat(o.material).forEach(m=>{ if(!m||seen.has(m)) return; seen.add(m); if(m.lightMap) lm++; }); }); return {zone:GAME.G.zone, formal, lm, vis, mats:seen.size}; })()"""


def Y(path):
    a = np.asarray(Image.open(path).convert('RGB'), dtype=float) / 255.0
    a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return round(float((a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722).mean()), 4)


async def load(pg, zone, hour):
    st = {'zone': zone, 'hour': hour, 'weather': 'sunny', 'flags': FLAGS, 'day': 45, 'weekday': 3}
    await pg.evaluate("(async st=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })", st)
    for _ in range(80):   # 正式模型載入（formal）或 20 秒
        await pg.wait_for_timeout(500)
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
    await pg.wait_for_timeout(6000)


async def pose(pg, x, z, lv, yaw, pitch, hour):
    await pg.evaluate("""(([x,z,lv,yaw,pitch,h])=>{ const E=GAME.E, P=E.player; E.npcs.forEach(n=>{ n.hidden=true; if(n.obj) n.obj.visible=false; });
      if(E.placeAt) E.placeAt(P,x,z,lv); else P.obj.position.set(x,0,z); P.path=null; if(E.settleY) E.settleY(P); P.obj.rotation.y=yaw+Math.PI; P.busy=true;
      GAME.G.hour=h; E.hour=h; E.applyTime(h); const C=E.cam; C.mode='follow'; C.yaw=yaw; C.pitch=pitch; C.manualT=1e9; })""", [x, z, lv, yaw, pitch, hour])
    await pg.wait_for_timeout(4500)


async def shoot(url, tag, reentry):
    res = {'tag': tag, 'url': url, 'shots': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        shader = []; pg.on('console', lambda m: shader.append(m.text[:240]) if ('Shader Error' in m.text or ('shader' in m.text.lower() and m.type == 'error')) else None)
        await pg.goto(url); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % J(HIDE))
        for hour, ht in ((14.5, '1430'), (20.5, '2030')):
            await load(pg, 'library_hall', hour); c = await pg.evaluate(COUNT); res['count_%s' % ht] = c; print(tag, ht, J(c), flush=True)
            for name, x, z, lv, yaw, pitch in VIEWS:
                await pose(pg, x, z, lv, yaw, pitch, hour); f = os.path.join(OUT, '%s_%s_%s.png' % (tag, name, ht)); await pg.screenshot(path=f); res['shots']['%s_%s' % (name, ht)] = {'f': f, 'Y': Y(f)}
        for zone, x, z, yaw, pitch in OTHER:
            await load(pg, zone, 20.5); await pose(pg, x, z, 0, yaw, pitch, 20.5)
            f = os.path.join(OUT, '%s_other_%s_2030.png' % (tag, zone)); await pg.screenshot(path=f); res['shots']['other_%s_2030' % zone] = {'f': f, 'Y': Y(f), 'count': await pg.evaluate(COUNT)}
        if reentry:   # ③ 進兩次：照玩家走出大門、從校園走回總圖門口按「進入」
            await load(pg, 'library_hall', 20.5); await pose(pg, *VIEWS[0][1:], 20.5)
            f1 = os.path.join(OUT, '%s_reentry_1st.png' % tag); await pg.screenshot(path=f1); c1 = await pg.evaluate(COUNT)
            await pg.evaluate("(()=>{ const P=GAME.E.player; P.busy=false; })()")
            run = L.Run('libhall_reentry', OUT)
            ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='campus'); return it?[it.x,it.z,it.label]:null; })()")
            await L.go_to(pg, cdp, run, ex[0], ex[1], 0.9, ex[2], max_s=200); await L.tap(pg, cdp, '#interact')
            for _ in range(40):
                await pg.wait_for_timeout(1000)
                if await pg.evaluate("GAME.G.zone") == 'campus': break
            await pg.wait_for_timeout(8000)
            dr = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='library_hall'); return it?[it.x,it.z,it.label]:null; })()")
            await L.go_to(pg, cdp, run, dr[0], dr[1], 0.9, dr[2], max_s=200); await L.tap(pg, cdp, '#interact')
            for _ in range(40):
                await pg.wait_for_timeout(1000)
                if await pg.evaluate("GAME.G.zone") == 'library_hall': break
            for _ in range(60):
                await pg.wait_for_timeout(500)
                if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
            await pg.wait_for_timeout(6000)
            await pose(pg, *VIEWS[0][1:], 20.5)
            f2 = os.path.join(OUT, '%s_reentry_2nd.png' % tag); await pg.screenshot(path=f2); c2 = await pg.evaluate(COUNT)
            a = np.asarray(Image.open(f1).convert('RGB'), dtype=int); c = np.asarray(Image.open(f2).convert('RGB'), dtype=int); d = np.abs(a - c).max(axis=2)
            res['reentry'] = {'first': c1, 'second': c2, 'diff_px_gt24': int((d > 24).sum()), 'diff_mean': round(float(d.mean()), 3), 'Y1': Y(f1), 'Y2': Y(f2), 'zone_after': await pg.evaluate("GAME.G.zone")}
            print(tag, 'reentry', J(res['reentry']), flush=True)
        res['js_errors'] = errs[:5]; res['shader_errors'] = shader[:5]
        await b.close()
    return res


def pair(a, b_, out, label):
    A = Image.open(a).convert('RGB'); B = Image.open(b_).convert('RGB'); W, H = A.size
    im = Image.new('RGB', (W * 2 + 8, H + 26), (20, 20, 20)); im.paste(A, (0, 26)); im.paste(B, (W + 8, 26))
    d = ImageDraw.Draw(im); d.text((6, 6), 'before c76d0cb69  |  after +LIB-HALL-LM+RT-NIGHT (c48a5c310)   ' + label, fill=(230, 230, 230)); im.save(out, quality=85)


async def main():
    R = {'before': await shoot(BEFORE, 'before', False), 'after': await shoot(AFTER, 'after', True)}
    rows = []
    for k in R['after']['shots']:
        if k in R['before']['shots']:
            out = os.path.join(OUT, 'cmp_%s.jpg' % k); pair(R['before']['shots'][k]['f'], R['after']['shots'][k]['f'], out, k)
            rows.append({'view': k, 'Y_before': R['before']['shots'][k]['Y'], 'Y_after': R['after']['shots'][k]['Y'], 'cmp': out})
    R['rows'] = rows
    json.dump(R, open(os.path.join(OUT, 'readings.json'), 'w'), ensure_ascii=False, indent=1)
    for r in rows: print('ROW', J(r), flush=True)
    ok = R['after'].get('reentry') and R['after']['reentry']['second']['lm'] == R['after']['reentry']['first']['lm'] and not R['after']['js_errors'] and not R['after']['shader_errors']
    print('PASS 拍完' if ok else 'FAIL 看 readings.json（進兩次材質數不一樣、JS 例外或 shader 錯誤）', flush=True)
asyncio.run(main())
