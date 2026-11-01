"""真實玩家流程：社科院圖書館（辜先生紀念圖書館一樓；D56 社科院第①步，2026-10-13）。不用 ?turbo。
玩家操作一律走真的介面（觸控點地面、互動按鈕、手機按鈕）；前置條件（讀檔到某天某時某地）用 [前置／捷徑] 標示。
A. 從霖澤館前點地面走到社科院正面：不瞬移；到門口出現「進入社科院圖書館」；按下去進館（站在入口、正式模型載入）。
B. 自己走過閘門、走到閱覽長桌的座位旁：出現「坐下讀書」→ 坐下（姿勢 sit）→「坐一下」→ 起身後站得住。
C. 走進一個林間書房（弧形書架圍著樹狀柱）：「看書架（林間書房）」有說明。
D. 走到北面玻璃帷幕前的窗邊座位坐下、起身。
E. 自己走到出口：「離開圖書館（回社科院前）」→ 回到校園社科院圖書館門前（中庭）、面向南、不會一出來又跳出「進入社科院圖書館」；再自己走回霖澤館前（不會卡在門口）。
F. 手機「地點」→ 社科院圖書館：到圖書館入口、站得住、時間有過。
G. [前置] 晚上 20:30 在館裡：天窗變暗（自發光比白天低）、窗外換夜景。
用法：python3 tests/flow_soclib.py URL [輸出資料夾]"""
import asyncio, json, sys, math, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_soclib'
DAY_FRI = 3   # 9/19 週五
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
SKY = "(()=>{ const ms=[]; GAME.E.zone.group.traverse(o=>{ if(o.isMesh&&o.material&&/^soclib_skylight/.test(o.material.name||'')&&!ms.includes(o.material)) ms.push(o.material); }); return ms.length?ms[0].emissiveIntensity:null; })()"


async def wait_formal(pg, sec=90):
    for _ in range(sec):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): return True
        await pg.wait_for_timeout(1000)
    return False


async def sit_and_stand(pg, cdp, run, label):
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    pose = await pg.evaluate("GAME.E.player.pose")
    run.check(label + '：坐下（姿勢 sit）、有「坐一下」可以選', pose == 'sit' and any('坐一下' in o for o in opts), f'pose={pose} ' + json.dumps(opts, ensure_ascii=False))
    await run.shot(pg, label + '_seated')
    idx = next((i for i, o in enumerate(opts) if '坐一下' in o), 0)
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=idx)
    pose = await pg.evaluate("GAME.E.player.pose")
    run.check(label + '：起身後站得住（不在桌子、書架裡）', pose != 'sit' and s['stand'], f'pose={pose} ' + json.dumps(s, ensure_ascii=False))


async def until_button(pg, cdp, run, x, z, prefix, label, max_s=300):
    """像玩家一樣往 (x,z) 點地面，看到按鈕（人物停下來、按鈕字是 prefix 開頭）就停；回傳按鈕有沒有出現"""
    t0 = time.time(); taps = 0
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['interact'].startswith(prefix) and not s['path']:
            run.note(f'{label}：「{s["interact"]}」出現（點地面 {taps} 次，{time.time() - t0:.0f} 秒；離那一點 {math.hypot(x - s["x"], z - s["z"]):.2f} m）')
            return True
        if not s['path']:
            await L.tap_ground(pg, cdp, x, z); taps += 1
        await pg.wait_for_timeout(3000)
    run.note(f'{label}：{max_s} 秒內按鈕沒有出現（點地面 {taps} 次）')
    return False


async def main():
    run = L.Run('flow_soclib', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：從霖澤館前走到社科院正面、進館 ----------
        run.setup('讀檔：第 3 天（9/19 週五）10:00，法律系館A前 (34,-98)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 34, 'z': -98, 'yaw': 1.57}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '進入社科院圖書館')
        # X75（SOCSCI-PLACE-1020）社科院整組搬到霖澤館西南：門的位置改讀遊戲的 SOCSCI_LAYOUT.libDoor（已經是校園座標；soclib3d.js 的 DOOR 用同一份），不寫死 X75 以前的 (101,-69.3)
        door = await pg.evaluate("(()=>{ const d=SOCSCI_LAYOUT.libDoor, o=SOCSCI_LAYOUT.libOut; return {x:d.x, z:d.z, ox:o.x, oz:o.z}; })()")
        run.check('校園有「進入社科院圖書館」，位置＝SOCSCI_LAYOUT.libDoor（新社科院圖書館的門、一樓；ART-01、X75）', bool(d) and abs(d['x'] - door['x']) < 0.6 and abs(d['z'] - door['z']) < 0.6, json.dumps({'it': d, 'libDoor': door}, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.2, '社科院正門')
        s = await L.state(pg)
        run.check('自己走到社科院正門（點地面，沒有瞬移）、出現「進入社科院圖書館」', ok and s['interact'].startswith('進入社科院圖書館'), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_at_door')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('按下去：進到社科院圖書館、站在入口（閘門外）、站得住', s['zone'] == 'soclib' and s['stand'] and abs(s['x'] + 9) < 1.0 and s['z'] > 8.5, json.dumps(s, ensure_ascii=False))
        run.check('正式模型載入（LAWWW2 ⑬；沒有就是程序化備用模型）', await wait_formal(pg))
        await pg.wait_for_timeout(2500)
        await run.shot(pg, 'A_entrance')
        # ---------- B：走過閘門、坐在閱覽長桌 ----------
        # 坐下前站的位置用遊戲自己算的（GAME.seatApproach，和按「坐下」時走過去的是同一個點）；原本自己算「椅子後面 0.6 m」、允許 0.35 m，停的地方可能在互動半徑 0.8 m 外（2026-10-13 批次 2：差 2 cm）
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.filter(q=>q.kind==='table')[3]; if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,yaw:s.yaw,ax:ap[0],az:ap[1]}; })()")
        ax, az = seat['ax'], seat['az']
        ok = await L.go_to(pg, cdp, run, ax, az, 0.15, '閱覽長桌的座位旁')   # 按鈕範圍 0.8 m、站的位置在椅子後面 0.6 m：停在 0.3 m 外可能看不到按鈕（flow_boya_interior 同一個問題）
        s = await L.state(pg)
        if ok and not s['interact'].startswith('坐下讀書'):
            # 2026-10-14 v9.6 回歸：這張（北側、面向南）椅子後面 0.6 m 那一點碰到椅背（半徑 0.3 m 站不下），遊戲算的站位改成 0.9 m，比按鈕範圍 0.8 m 遠，
            # 停在那裡看不到按鈕。玩家這時會再往椅子走一步——走到椅子正後方 0.7 m（椅背擋住以前），按鈕就出現（診斷：椅子後面 0.65～0.8 m 都站得住）。
            # 遊戲的站位（GAME.seatApproach 少了 0.65～0.75 m 的候選）記在已知問題，開發分支修；這裡照玩家的做法驗「走到椅子旁邊、按鈕出現」
            d = math.hypot(ax - seat['x'], az - seat['z'])
            run.note(f'遊戲算的站位離椅子 {d:.2f} m（按鈕範圍 0.8 m），看不到「坐下讀書」：再往椅子走一步')
            bx, bz = seat['x'] + (ax - seat['x']) / d * 0.7, seat['z'] + (az - seat['z']) / d * 0.7
            # 2026-10-14 候選 10：要求停在那一點 0.08 m 內，人物停在 0.22 m 外（站得住的邊緣），按鈕早就出現了，測試還在點（71 次）、最後判失敗。
            # 玩家看到按鈕就會停下來按：往那一點點地面，按鈕出現（人物停下來）就停
            ok = await until_button(pg, cdp, run, bx, bz, '坐下讀書', '再往椅子走一步（椅子正後方 0.7 m）')
            s = await L.state(pg)
        run.check('自己走過閘門、走到閱覽長桌的座位旁、出現「坐下讀書」', ok and s['interact'].startswith('坐下讀書') and s['z'] < 7.5, json.dumps(s, ensure_ascii=False))
        await sit_and_stand(pg, cdp, run, 'B_table')
        # ---------- C：林間書房 ----------
        gv = await pg.evaluate("(()=>{ const g=SL3.groves(SOCLIB_LAYOUT)[0]; return {x:g.x,z:g.z}; })()")
        ok = await L.go_to(pg, cdp, run, gv['x'], gv['z'], 0.6, '林間書房（弧形書架裡面）')
        s = await L.state(pg)
        run.check('走進林間書房、出現「看書架（林間書房）」', ok and s['interact'].startswith('看書架（林間書房）'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
        run.check('按下去：有說明（弧形的竹書架、樹狀柱、天窗）', '樹狀柱' in cap, cap)
        await run.shot(pg, 'C_grove')
        await pg.wait_for_timeout(4000)
        # ---------- D：窗邊座位 ----------
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.filter(q=>q.kind==='window')[8]; if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,yaw:s.yaw,ax:ap[0],az:ap[1]}; })()")
        ax, az = seat['ax'], seat['az']
        # 像玩家一樣：往椅子旁邊走，按鈕出現就停（2026-10-14 v9.6 候選 8：原本一定要走到站位 0.15 m 以內，停在 0.18 m、按鈕早就出現了，
        # 測試還一直點地面——點了 91 次、推 7 次搖桿，最後算「走不到」）。先走到 0.6 m 內；按鈕還沒出現才再往站位走近（容許 0.15 m）
        ok = await L.go_to(pg, cdp, run, ax, az, 0.6, '北面窗邊的座位旁')
        s = await L.state(pg)
        if ok and not s['interact'].startswith('坐下讀書（窗邊）'):
            run.note('0.6 m 內還沒看到「坐下讀書（窗邊）」：再往站位走近')
            ok = await L.go_to(pg, cdp, run, ax, az, 0.15, '北面窗邊的座位旁（再走近）')
            s = await L.state(pg)
        run.check('走到北面玻璃帷幕前的窗邊座位、出現「坐下讀書（窗邊）」', ok and s['interact'].startswith('坐下讀書（窗邊）'), json.dumps(s, ensure_ascii=False))
        await sit_and_stand(pg, cdp, run, 'D_window')
        # ---------- E：走出去 ----------
        ex = await L.find_it(pg, '離開圖書館')
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.3, 0.8, '出口')
        s = await L.state(pg)
        run.check('自己走回閘門外、走到出口、出現「離開圖書館（回社科院前）」', ok and s['interact'].startswith('離開圖書館'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('回到校園社科院圖書館門前（SOCSCI_LAYOUT.libOut）、站得住、不會一出來又跳出「進入社科院圖書館」', s['zone'] == 'campus' and s['stand'] and math.hypot(s['x'] - door['ox'], s['z'] - door['oz']) < 1.0 and not s['interact'].startswith('進入社科院圖書館'), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'E_back_campus')
        # 回程照舊走到法學院廣場 (60,-92)：不要停在霖澤館前——大一上第 1～6 週第一次站在 (33,-97) 10 m 內會演阿勳的「對面的舊系館」（ev_sk01_soc），F 的手機前往會被擋下來（BB-B 10-25 實測）
        ok = await L.go_to(pg, cdp, run, 60, -92, 1.2, '法學院廣場（往霖澤館走）')
        s = await L.state(pg)
        run.check('從門口自己走回法學院廣場（不會卡在門口、沒有跳出劇情）', ok and s['stand'] and not s['dlg'], json.dumps(s, ensure_ascii=False))
        # ---------- F：手機「地點」→ 社科院圖書館 ----------
        h0 = s['hour']
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「地點」有社科院圖書館', '社科院圖書館' in txt, txt[:200])
        # 清單很長（橫向畫面只看得到前三列）：像玩家一樣先把清單滑到「社科院圖書館」那一列，再點「前往」（2026-10-13 第一次跑：沒有滑、點到畫面外，沒有出發）
        sel = '#phoneBody [data-place="soclib|社科院圖書館"]'
        await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })(%s)" % json.dumps(sel)); await pg.wait_for_timeout(600)
        vis = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; const r=e.getBoundingClientRect(); return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===e; })(%s)" % json.dumps(sel))
        ok = await L.tap(pg, cdp, sel)
        run.check('滑到那一列、點「前往」（按鈕在畫面上、沒有被蓋住）', ok and vis, f'vis={vis}')
        await pg.wait_for_timeout(7000)
        s = await L.state(pg)
        toast = await pg.evaluate("(document.getElementById('toast')||{}).textContent||''")
        run.check('到社科院圖書館入口、站得住、時間有過', s['zone'] == 'soclib' and s['stand'] and s['hour'] > h0, json.dumps(s, ensure_ascii=False) + ' toast=' + toast)
        # ---------- G：晚上 ----------
        day_sky = await pg.evaluate(SKY) if await wait_formal(pg, 60) else None
        if await pg.evaluate("!!(document.getElementById('phone')&&!document.getElementById('phone').classList.contains('hide'))"):   # 手機開著時遊戲暫停（openPhone：E.paused），天窗的亮度不會更新
            await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
        run.setup('讀檔：第 3 天 20:30，社科院圖書館入口')
        await L.load_state(pg, {'zone': 'soclib', 'hour': 20.5, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -9, 'z': 9.3, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        await wait_formal(pg, 60); await pg.wait_for_timeout(2500)
        night_sky = await pg.evaluate(SKY)
        run.check('晚上天窗變暗（自發光比白天低），而且是白天的 8%（不是調暗兩次：clone 的模型共用材質，2026-10-13 批次 2 量到 0.0064）', day_sky is not None and night_sky is not None and abs(night_sky - day_sky * 0.08) < day_sky * 0.02, f'白天 {day_sky}、晚上 {night_sky}')
        await run.shot(pg, 'G_night')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
