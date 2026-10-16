"""第一週肉眼巡檢的截圖（QA-W1-VISUAL）：修過的座位、地圖 canvas 有沒有一直增加——截圖給人看，數字給機器判。
[前置／捷徑] 用 ?turbo、GAME.enter 直接進區域、GAME.sitAt 直接坐下（只看「坐下以後的樣子」；走過去坐下的流程在別的測試）。
截圖：shots/qa_w1/<編號>_<說明>.png（手機直向 390×844，Playwright 模擬，不是實機）。
數字：打開、關掉大地圖 5 次，新開的 canvas 不超過 1 張（BUG-MAPBLACK：原本每次都新開一張、不釋放）。
用法：python3 tests/qa_w1_shots.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shots', 'qa_w1')
SEATS = [   # (編號, 區域, 座位的 label 正規式或 'lift', 說明)
    ('A2', 'dorm', '書桌|坐', '宿舍書桌'),
    ('C2a', 'cafe', 'lift', 'Café 吧檯高腳椅'),
    ('C2b', 'wz_teahouse', '和室', '一盞 和室跪坐'),
    ('C2c', 'wz_teahouse', '緣側', '一盞 緣側跪坐'),
    ('C3a', 'wenzhou', '盪鞦韆', '小公園 鞦韆'),
    ('C3b', 'wenzhou', '老樹下的圓椅', '小公園 樹下圓椅'),
    ('B6g1', 'gym', '看台', '體育館 看台'),
    ('B6g2', 'gym', '大廳的長椅', '體育館 大廳長椅'),
    ('B6g3', 'gym', '場邊的長椅', '體育館 場邊長椅'),
]
INIT = "(()=>{ const ce=document.createElement.bind(document); window.__cv=0; document.createElement=function(t,...a){ if(String(t).toLowerCase()==='canvas') window.__cv++; return ce(t,...a); }; })()"


async def main():
    os.makedirs(OUT, exist_ok=True); fails = 0; rep = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        await pg.add_init_script(INIT)
        await pg.goto(URL, wait_until='load')
        await pg.wait_for_function("typeof GAME!=='undefined'&&document.getElementById('btnNew')", timeout=120000)
        await pg.wait_for_function("(()=>{ const l=document.getElementById('loading'); return !l||getComputedStyle(l).display==='none'||getComputedStyle(l).opacity==='0'||l.classList.contains('hide'); })()", timeout=180000)
        await pg.wait_for_timeout(2000); await pg.evaluate("()=>document.getElementById('btnNew').click()")
        await pg.wait_for_function("GAME.G&&GAME.G.zone&&(GAME.E||{}).scene", timeout=180000); await pg.wait_for_timeout(15000)
        # 開局的對話先跳過（只看畫面）
        await pg.evaluate("()=>{ try{ if(GAME.D&&GAME.D.active&&GAME.D.skip) GAME.D.skip(); }catch(e){} }")
        await pg.screenshot(path=os.path.join(OUT, 'A1_開局宿舍.png'))
        # ---- 地圖 canvas（BUG-MAPBLACK）----
        r = await pg.evaluate("""async()=>{ const s=ms=>new Promise(r=>setTimeout(r,ms)); const E=GAME.E; const busy=E.player.busy; E.player.busy=false; const c0=window.__cv; const out=[];
          for(let i=0;i<5;i++){ GUIDE.openMap(); await s(400); out.push(window.__cv-c0); GUIDE.closeMap(); await s(200); }
          const bm=document.getElementById('bmCanvas'); E.player.busy=busy; return {per:out, total:window.__cv-c0, bmAfterClose:[bm.width,bm.height]}; }""")
        ok = r['total'] <= 1 and r['bmAfterClose'] == [0, 0]
        fails += 0 if ok else 1; rep.append(('A4 地圖開關 5 次：新開 canvas %d 張（每次累計 %s）、關掉後大地圖畫布 %s' % (r['total'], r['per'], r['bmAfterClose']), ok)); print(('PASS ' if ok else 'FAIL ') + rep[-1][0], flush=True)
        await pg.evaluate("()=>GUIDE.openMap()"); await pg.wait_for_timeout(800); await pg.screenshot(path=os.path.join(OUT, 'A4_大地圖.png')); await pg.evaluate("()=>GUIDE.closeMap()")
        # ---- 座位 ----
        for code, zone, pat, why in SEATS:
            try:
                if (await pg.evaluate("()=>GAME.G.zone")) != zone:
                    await pg.evaluate("(z)=>{ void GAME.enter(z) }", zone); await pg.wait_for_function("(z)=>GAME.G.zone===z", arg=zone, timeout=120000)
                await pg.wait_for_timeout(22000)   # 正式模型載入
                info = await pg.evaluate("""(pat)=>{ const E=GAME.E, P=E.player; const its=E.interactables.filter(i=>i.seat&&(pat==='lift'?i.seat.lift:new RegExp(pat).test(i.label||'')));
                  if(!its.length) return null; const it=its[0]; if(P.seat) GAME.standUp(P); GAME.sitAt(P,it.seat); const y=it.seat.yaw||0;
                  E.cam.yaw=y+0.75; if('distTarget' in E.cam) E.cam.distTarget=2.6; if('dist' in E.cam) E.cam.dist=2.6; return {label:it.label,x:it.seat.x,z:it.seat.z,yaw:y,floor:it.seat.floor||0,lift:it.seat.lift||0}; }""", pat)
                if not info:
                    fails += 1; rep.append(('%s %s：找不到座位' % (code, why), False)); print('FAIL ' + rep[-1][0], flush=True); continue
                await pg.wait_for_timeout(2500)
                fn = '%s_%s.png' % (code, why.replace(' ', '_'))
                await pg.screenshot(path=os.path.join(OUT, fn))
                rep.append(('%s %s：%s → %s' % (code, why, json.dumps(info, ensure_ascii=False), fn), True)); print('SHOT ' + rep[-1][0], flush=True)
            except Exception as e:
                fails += 1; rep.append(('%s %s：%s' % (code, why, str(e)[:160]), False)); print('FAIL ' + rep[-1][0], flush=True)
        await b.close()
    print('ALL DONE（截圖要人看）' if not fails else 'FAILED %d' % fails)
    sys.exit(1 if fails else 0)
asyncio.run(main())
