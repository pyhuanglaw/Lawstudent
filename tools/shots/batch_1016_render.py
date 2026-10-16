"""第 2 級局部瀏覽器驗證（D83）：2026-10-16 這一批看得到的改動，用測試存檔直接跳過去、實際渲染截圖。
[前置／捷徑] 讀檔到指定時間地點；事件直接演（測的是畫面，不是觸發條件——觸發在單元測試）。Playwright 手機模擬＋SwiftShader，不是 iPhone。
A 河濱背景（riverside，BB-B 第 20 組）：直接演中秋烤肉 ev_mid_autumn_bbq，畫面上有 assets/bg/riverside.webp（直向、橫向）
B 大一女舍門燈（ART-08，LAWWW2-B fe8d016d）：校園 20:40，A 棟門口；門廊的光暈與光圈在 E.lampGlows、晚上看得到（截圖，加 ?noporch 對照）
C 班級群組（SYS-14）：手機群組裡有「法律系 大一（全班）」
D 大一下閒聊階梯（SYS-15）：大一下和以安說話，播的是大一下的檔（A2-L1），對話框直向、橫向截圖
用法：python3 tools/shots/batch_1016_render.py URL 輸出資料夾"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}
BGS = "(()=>{ const out=[]; for(const el of document.querySelectorAll('*')){ const b=getComputedStyle(el).backgroundImage; if(b&&/assets\\/bg\\//.test(b)) out.push(b); } for(const i of document.querySelectorAll('img')){ if(/assets\\/bg\\//.test(i.src)) out.push(i.src); } return out; })()"
res = {}
def ok(k, v, info=''):
    res[k] = bool(v); print(('PASS ' if v else 'FAIL ') + k + ('　' + str(info) if info else ''), flush=True)

async def advance(pg, cdp, n=30, want=None):
    seen = set()
    for _ in range(n):
        s = await L.state(pg)
        for x in await pg.evaluate(BGS): seen.add(x.split('assets/bg/')[1].split('.')[0])
        if want and want in seen: return seen
        if s['choices']:
            c = await pg.evaluate("(()=>{ const e=document.querySelector('#choices button'); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        else: break
        await pg.wait_for_timeout(600)
    return seen

async def main():
    async with async_playwright() as p:
        for mode in ('port', 'land'):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(mode == 'land'))
            await pg.goto(URL); await L.wait_loaded(pg)
            # A 河濱
            await L.load_state(pg, {'zone': 'dorm', 'hour': 15.0, 'day': 18, 'weekday': 6, 'weather': 'clear', 'flags': dict(FLAGS)}, quiet_events=True)
            await pg.wait_for_timeout(3000)
            await pg.evaluate("(()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_mid_autumn_bbq'); ADV.begin({background:'dark'}); void EVENTS.run(ev); return true; })()")
            await pg.wait_for_timeout(2500)
            seen = await advance(pg, cdp, 40, 'riverside')
            await pg.screenshot(path=os.path.join(OUT, f'A_riverside_{mode}.png'))
            ok(f'A {mode} 中秋烤肉的背景是 riverside.webp（不是黑底）', 'riverside' in seen, sorted(seen))
            await advance(pg, cdp, 60)
            # D 大一下階梯
            d = await pg.evaluate("STORY.termDay('Y1S2',3,3)")
            await L.load_state(pg, {'zone': 'campus', 'hour': 13.0, 'day': d, 'weekday': 3, 'weather': 'clear', 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': dict(FLAGS)}, quiet_events=True)
            await pg.wait_for_timeout(5000)
            st = await pg.evaluate("(()=>{ const G=GAME.G; if(typeof SOCIAL!=='undefined'){ const r=SOCIAL.rel('heroine_01'); r.fam=30; r.trust=12; r.comf=12; SOCIAL.meet&&SOCIAL.meet('heroine_01','campus'); } const s=STORY.ladNext(G,'heroine_01'); return s?s.id:null; })()")
            ok(f'D {mode} 大一下和以安：下一層是大一下的檔（A2-）', bool(st) and str(st).startswith('A2-'), st)
            if st:
                await pg.evaluate("(()=>{ const G=GAME.G; void STORY.ladPlay(GAME,{name:'沈以安',charId:'heroine_01'},'heroine_01',STORY.ladNext(G,'heroine_01')); return true; })()")
                await pg.wait_for_timeout(2000)
                await pg.screenshot(path=os.path.join(OUT, f'D_ladder_y1s2_{mode}.png'))
                await advance(pg, cdp, 20)
                k = await pg.evaluate("GAME.G.social.ladder['heroine_01@Y1S2']||0")
                ok(f'D {mode} 播完：大一下的進度記在 heroine_01@Y1S2', k == 1, k)
            if mode == 'port':
                # C 班級群組
                gn = await pg.evaluate("(()=>{ STORY.phoneRules(GAME); return PHONE.inGroup(GAME.G,'law_class')?PHONE.title(GAME.G,'g:law_class'):null; })()")
                ok('C 手機群組：法律系 大一（全班）', gn == '法律系 大一（全班）', gn)
                # B 女舍門燈（20:40）
                await L.load_state(pg, {'zone': 'campus', 'hour': 20.67, 'day': 22, 'weekday': 1, 'weather': 'clear', 'pos': {'x': -108, 'z': 52, 'yaw': 3.14159}, 'flags': dict(FLAGS)}, quiet_events=True)
                await pg.wait_for_timeout(9000)
                g = await pg.evaluate("(()=>{ const E=GAME.E; const near=E.lampGlows.filter(o=>{ const p=new THREE.Vector3(); o.getWorldPosition(p); return Math.hypot(p.x+108,p.z-61)<4||Math.hypot(p.x+78,p.z-59)<4; }); return {n:near.length,vis:near.filter(o=>o.visible).length,lamps:E.lampsOn}; })()")
                await pg.screenshot(path=os.path.join(OUT, 'B_freshman_porch_2040.png'))
                ok('B 女舍 A、B 門廊：光暈＋兩圈光（各 3 樣）掛在 E.lampGlows、晚上亮著', g['n'] >= 6 and g['vis'] >= 6, g)
            print(mode, 'JS 例外', errs[:3], flush=True)
            ok(f'{mode} 沒有 JS 例外', not errs, errs[:3])
            await b.close()
        # B 對照：?noporch
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'noporch'); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'campus', 'hour': 20.67, 'day': 22, 'weekday': 1, 'weather': 'clear', 'pos': {'x': -108, 'z': 52, 'yaw': 3.14159}, 'flags': dict(FLAGS)}, quiet_events=True)
        await pg.wait_for_timeout(9000)
        await pg.screenshot(path=os.path.join(OUT, 'B_freshman_porch_2040_noporch.png'))
        await b.close()
    print('ALL PASS' if all(res.values()) else 'FAILED ' + str(sum(1 for v in res.values() if not v)))
asyncio.run(main())
