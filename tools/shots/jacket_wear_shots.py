"""SK02-LINE-JACKET-1030 系外套穿在身上：遊戲內截圖（LAWWW-B 子代理 2026-10-30）。
  python3 tools/shots/jacket_wear_shots.py URL 輸出資料夾
手機直向 390×844 模擬（playlib：is_mobile、CDP 觸控）；不是 iPhone 實機。
外套**不手動打開**：讀檔給的是存檔原本的欄位（ECON_JACKET、SK02_DAY、事件紀錄），穿不穿、椅背有沒有都由遊戲的 STORY.jacketSync 照規則決定。
  ① 使用者回報的情況：系辦選了「穿去霖澤館上課」（第 6 天 9/22），第 8 天（9/24 週三）是之後第一次霖澤館的課——在霖澤館一樓大廳
  ② 同一天晚上回到宿舍 203：脫下來掛在祐廷（L2）的椅背；從走道看
  [前置／捷徑] 讀檔放時間、地點、旗標（SK02 的事件本身在 tests/v1_sk01_unit.js、tests/sk02_jacket_wear_unit.js 用真的事件跑過）。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8893/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'docs/art-rebuild/test_shots/jacket_wear_1030'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True,
         'SK01_DAY': 2, 'MET_XUN': True, 'SK02_DM_DAY': 6, 'ECON_JACKET': 'wear', 'SK02_DAY': 6, 'SOC_WRONG_BUILDING': True}
EVS = {'done': {'ev_sk02_jacket': 1}, 'last': {'ev_sk02_jacket': 6}, 'count': 1}
VIS = "(()=>{ let n=0; GAME.E.player.obj.traverse(o=>{ if(o.name==='JACKET_ECON'&&o.visible) n++; }); return n; })()"
CHAIR = "(()=>{ const z=GAME.E.zone; const o=z&&z.dormRoot&&z.dormRoot.getObjectByName('JACKET_CHAIR'); return {api:!!(z&&z.setJacketChair), want:!!(z&&z.jacketChair), loaded:!!(z&&z.dormRoot), visible:!!(o&&o.visible)}; })()"
RULE = "(()=>{ const s=STORY.jacketState(GAME.G); return {wear:s.wear,chair:s.chair,day:GAME.G.day,zone:GAME.G.zone}; })()"


async def main():
    run = L.Run('jacket_wear', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ① 霖澤館大廳
        run.setup('讀檔：第 8 天（9/24 週三）12:40、霖澤館一樓大廳入口；系辦選了「穿去霖澤館上課」（ECON_JACKET wear、SK02_DAY 6），阿哲還沒說（ev_sk02_spy 沒演）')
        await L.load_state(pg, {'zone': 'linze', 'hour': 12.67, 'day': 8, 'weekday': 3, 'weather': 'clear', 'pos': {'x': 6.6, 'z': 4.0, 'yaw': -1.5708, 'lv': 0}, 'flags': FLAGS, 'events': EVS}, quiet_phone=True)
        await pg.wait_for_timeout(6000)
        r = await pg.evaluate(RULE)
        run.check('規則：今天要穿（之後第一次霖澤館的課）', r['wear'] is True, json.dumps(r))
        run.check('遊戲自己穿上（沒有手動 setJacket）：JACKET_ECON 顯示', await pg.evaluate(VIS) == 1)
        await run.shot(pg, 'linze_lobby')   # 原本還拍一張推搖桿走路的：SwiftShader 1.8 秒幾乎沒走動，和這張一樣，拿掉
        # ② 宿舍椅背
        run.setup('讀檔：同一天 20:35、宿舍 203 走道 (-0.75, 0.55) 面向祐廷的書桌椅（椅背朝走道）')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 20.6, 'day': 8, 'weekday': 3, 'weather': 'clear', 'pos': {'x': -0.75, 'z': 0.55, 'yaw': -2.1}, 'flags': FLAGS, 'events': EVS}, quiet_phone=True)
        await pg.wait_for_timeout(7000)
        c = await pg.evaluate(CHAIR)
        run.check('回到房間：身上脫掉', await pg.evaluate(VIS) == 0)
        run.check('椅背外套（JACKET_CHAIR）由遊戲照規則掛上', c['api'] and c['loaded'] and c['visible'], json.dumps(c))
        await run.shot(pg, 'dorm_chair')
        run.check('沒有 JS 例外', not errs, '; '.join(map(str, errs[:5])))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
