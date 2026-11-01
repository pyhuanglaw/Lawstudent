"""真實玩家流程：博思教學館室內第一版（D55；src/data/boya_layout.js）。不用 ?turbo。
校園上還沒有博思的門（位置等使用者決定方案 A／B），所以一開始讀檔站在博思的大廳——這一步是 [前置／捷徑]，之後在館裡的操作都走真的介面
（觸控點地面、互動按鈕、選項）。
A. 從大廳走到博思 101 的門口（講台那一端）→「看看博思 101 階梯教室」；走進去、走側邊台階上到第 3 排的座位後面（那一排的高度 0.9 m）→ 坐下 → 起身。
   A2. [前置／捷徑] 放一場測試演講（遊戲裡的活動清單是空的）→ 同一個位子坐下 →「聽演講」→ 記下到場、快轉到結束 → 聽眾站起來往外走。
B. 自習區（101 旁桌椅區，使用者記得的「很多小桌子」；2026-10-13 第二版：雙人小桌兩列）：走到一張小桌旁 → 坐下 →「讀書（1 小時）」→ 時間過了、起身站得住。
C. 窗邊沙發：坐在沙發上 → 坐一下 → 起身；圓桌區：走到椅子後面出現「坐下（圓桌）」。
D. 資訊角：看講座資訊螢幕（沒有活動時寫「目前沒有」）、看公告欄。
E. 走樓梯到二樓走廊、走進 201 討論教室坐下、起身；走下樓、走到出口按「走出博思教學館」→ 回到校園、站得住。
用法：python3 tests/flow_boya_interior.py URL [輸出資料夾]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_boya_interior'
DAY_FRI = 3   # 9/19 週五（學期中、沒有博雅的課）
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}


# 椅子的「坐下」按鈕範圍 0.8 m（以座位為中心），坐下前站的位置在椅子後面 0.6 m：走到離那一點 0.3 m 就停的話，可能在按鈕範圍外（2026-10-13 批次 3：201 停在 0.81 m）。
# 桌椅的座位用 0.15 m；階梯教室（按鈕在椅子後面 0.35 m、範圍 0.62 m）、沙發（按鈕在前面 0.4 m）照舊 0.3 m
async def seat_of(pg, js_filter):
    """座位資料＋遊戲自己算的「坐下前站的位置」（GAME.seatApproach：站得住、高度對、路最短的那一個）"""
    return await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(%s); if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,yaw:s.yaw,y:(s.y==null?null:s.y),lv:s.lv|0,kind:s.kind,room:s.room,ax:ap[0],az:ap[1]}; })()" % js_filter)


async def sit_and_choose(pg, cdp, run, want):
    """按互動（坐下）→ 選項裡選含 want 的 → 演完回到可以操作。回傳 (坐下時的姿勢, 選項)"""
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    pose = await pg.evaluate("GAME.E.player.pose")
    idx = next((i for i, o in enumerate(opts) if want in o), len(opts) - 1)
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=idx)
    return pose, opts, s


async def main():
    run = L.Run('flow_boya_interior', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 3 天（9/19 週五）10:00，博思教學館大廳（校園上的門還沒做：位置等使用者決定）')
        await L.load_state(pg, {'zone': 'boya', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 0, 'z': 6.8, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        s = await L.state(pg)
        run.check('在博思大廳、站得住', s['zone'] == 'boya' and s['stand'] and s['lv'] == 0, json.dumps(s, ensure_ascii=False))
        await run.shot(pg, '0_lobby')
        # ---------- A：博雅 101 階梯教室 ----------
        d = await L.find_it(pg, '看看博思 101')
        run.check('101 的門口有「看看博思 101 階梯教室」', bool(d), json.dumps(d, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 0.8, '博思 101 門口')
        s = await L.state(pg)
        run.check('自己走到 101 門口（講台那一端）、出現按鈕', ok and s['interact'].startswith('看看博思 101'), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_door_101')
        seat = await seat_of(pg, "q=>q.room==='101'&&q.row===2&&q.col===5")
        run.check('101 第 3 排的座位（高 0.9 m）', bool(seat) and seat['kind'] == 'lecture' and abs(seat['y'] - 0.9) < 0.01, json.dumps(seat))
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.3, '101 第 3 排的座位後面', lv=0)
        s = await L.state(pg)
        run.check('走進 101、走側邊台階上到第 3 排（高 0.9 m）、出現「坐下」', ok and s['interact'].startswith('坐下') and abs(s['y'] - 0.9) < 0.08, json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_row3')
        pose, opts, s = await sit_and_choose(pg, cdp, run, '坐一下')
        run.check('坐在 101 第 3 排（姿勢 sit；沒有課：坐一下、讀書可以選）', pose == 'sit' and any('坐一下' in o for o in opts), f'pose={pose} ' + json.dumps(opts, ensure_ascii=False))
        pose = await pg.evaluate("GAME.E.player.pose")
        run.check('起身後站在那一排的平台上（站得住）', pose != 'sit' and s['stand'] and abs(s['y'] - 0.9) < 0.1, f'pose={pose} ' + json.dumps(s, ensure_ascii=False))
        # ---------- A2：演講到場（AA_107 第 10-1 節第 5 項；遊戲裡沒有活動資料，這一步用測試資料）----------
        run.setup('放一場測試演講到活動清單：今天、博思 101、現在＋5 分鐘開始、兩小時（遊戲裡的活動清單是空的，內容等 AA、BB）')
        await pg.evaluate("(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); const h=G.hour%24; ACTIVITIES.list.push({id:'t_flow_lec',title:'測試演講（流程測試）',kind:'lecture',zone:'boya',room:'101',roomName:'博思 101',dates:[d.key],t0:h+1/12,t1:h+1/12+2,crowd:{n:12}}); })()")
        await pg.wait_for_timeout(1500)
        s = await L.state(pg); h0 = s['hour']
        pose, opts, s = await sit_and_choose(pg, cdp, run, '聽演講')
        att = await pg.evaluate("(()=>{ const A=(GAME.G.acts&&GAME.G.acts.att)||{}; return Object.keys(A); })()")
        run.check('同一個位子再坐下：第一個選項是「聽演講：測試演講」；選了之後記下到場、時間到演講結束（約 2 小時後）', any(o.startswith('聽演講：') for o in opts) and any(k.startswith('t_flow_lec@') for k in att) and s['hour'] >= h0 + 1.9, json.dumps(opts, ensure_ascii=False) + ' ' + json.dumps(att) + f" {h0}→{s['hour']}")
        # 下課的人流在課表的 tick 裡排（每 30 格一次，SwiftShader 1–3 fps 要 10–20 秒；手機 30–60 fps 不到 1 秒）：最多等 30 秒（2026-10-13 批次 2：等 3 秒太短）
        lv = 0
        for _ in range(15):
            await pg.wait_for_timeout(2000)
            lv = await pg.evaluate("GAME.E.npcs.filter(n=>n.leaving).length")
            if lv >= 1: break
        run.check('演講結束：聽眾站起來往外走（不是一起消失）', lv >= 1, f'{lv} 人在往外走')
        await run.shot(pg, 'A2_lecture_end')
        # ---------- B：自習小桌 ----------
        seat = await seat_of(pg, "q=>q.room==='study'&&Math.abs(q.z-0.8)<0.01&&q.x>-1")   # 東列、中間走道那一側的位子
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.15, '自習小桌的椅子後面', lv=0)
        s = await L.state(pg)
        run.check('走出 101、走到自習小桌、出現「坐下讀書（自習小桌）」', ok and '自習小桌' in s['interact'], json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'B_study_desk')
        h0 = s['hour']
        pose, opts, s = await sit_and_choose(pg, cdp, run, '讀書')
        run.check('坐下（姿勢 sit）、選「讀書」→「讀 1 小時」', pose == 'sit' and any('讀書' in o for o in opts), f'pose={pose} ' + json.dumps(opts, ensure_ascii=False))
        run.check('讀完：時間過了約 1 小時、起身站得住', s['hour'] >= h0 + 0.9 and s['stand'], f"{h0} → {s['hour']}")
        # ---------- C：沙發區、討論桌 ----------
        seat = await seat_of(pg, "q=>q.kind==='sofa'&&q.x<0")   # 西邊那扇窗下的沙發
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.3, '沙發前面', lv=0)
        s = await L.state(pg)
        run.check('走到沙發前、出現「坐在沙發上」', ok and '沙發' in s['interact'], json.dumps(s, ensure_ascii=False))
        pose, opts, s = await sit_and_choose(pg, cdp, run, '坐一下')
        run.check('坐在沙發上（姿勢 sit）、坐一下、起身站得住', pose == 'sit' and s['stand'], f'pose={pose} ' + json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'C_sofa')
        seat = await seat_of(pg, "q=>q.room==='round'&&q.z<1")   # 北邊那張圓桌、北側的椅子
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.15, '圓桌的椅子後面', lv=0)
        s = await L.state(pg)
        run.check('走到圓桌、出現「坐下（圓桌）」', ok and '圓桌' in s['interact'], json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'C_round')
        # ---------- D：資訊角 ----------
        it = await L.find_it(pg, '看講座資訊')
        ok = await L.go_to(pg, cdp, run, it['x'], it['z'], 0.7, '講座資訊螢幕', lv=0)
        s = await L.state(pg)
        run.check('走到資訊角、出現「看講座資訊（螢幕）」', ok and s['interact'].startswith('看講座資訊'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
        cap = await pg.evaluate("((document.getElementById('caption')||{}).textContent||'')+((document.getElementById('dlgText')||{}).textContent||'')")
        run.check('螢幕：寫這一週的演講（目前沒有活動就寫「目前沒有」）', '講座資訊' in cap and '目前沒有' in cap, cap[:160])
        await run.shot(pg, 'D_info_screen')
        await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'])
        # ---------- E：二樓、出口 ----------
        ok = await L.go_to(pg, cdp, run, 4.9, 1.0, 0.8, '二樓走廊（樓梯上來）', lv=1)
        s = await L.state(pg)
        run.check('自己走樓梯到二樓（第 1 層、4.8 m）', ok and s['lv'] == 1 and abs(s['y'] - 4.8) < 0.1, json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'E_2f')
        seat = await seat_of(pg, "q=>q.room==='201'&&q.row===1&&q.col===1")
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.15, '201 的座位旁', lv=1)
        s = await L.state(pg)
        run.check('走進 201 討論教室、出現「坐下」', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
        pose, opts, s = await sit_and_choose(pg, cdp, run, '坐一下')
        run.check('坐在 201（姿勢 sit）、起身站得住', pose == 'sit' and s['stand'], f'pose={pose} ' + json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'E_201')
        ex = await L.find_it(pg, '走出博思教學館')
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'], 0.9, '一樓出口', lv=0)
        s = await L.state(pg)
        run.check('自己走下樓、走到出口（出現「走出博思教學館」）', ok and s['interact'].startswith('走出博思教學館'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('走出去：回到校園、站得住', s['zone'] == 'campus' and s['stand'], json.dumps(s, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
