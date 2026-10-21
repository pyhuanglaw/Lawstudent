# X70（BUG-MEET-HEROINES-1020）：用使用者 10-20 的存檔（tests/repro_1020/user_save_day9.json，9/25 週四）在瀏覽器裡看幾個時間地點實際生出哪些有名字的人（不改劇情、只讀；星期照行事曆）。
# 用法：python3 tests/repro_1020/heroines_probe.py http://127.0.0.1:8765/index.html?turbo tests/repro_1020/user_save_day9.json
import asyncio, json, sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; SAVE = json.load(open(sys.argv[2]))
PROBES = [  # (day, hour, zone, 說明)
    (8, 12.0, 'cafe', '9/24 週三 12:00 兩點半（芷若 11–15 吧檯）'),
    (8, 10.0, 'library', '9/24 週三 10:00 總圖閱覽室（語彤 9–12）'),
    (9, 15.0, 'campus', '9/25 週四 15:00 校園（子晴 14–17）'),
    (9, 19.5, 'cafe', '9/25 週四 19:30 兩點半（芷若 19–22）'),
]
LIST_JS = """(()=>{ const E=GAME.E; return E.npcs.filter(n=>n&&!n.isExtra).map(n=>({id:n.id||n.charId||'',name:n.name||'',vis:!!(n.obj&&n.obj.visible),hid:!!n.hidden,clerk:!!n.clerk,x:+(n.obj?n.obj.position.x:0).toFixed(1),z:+(n.obj?n.obj.position.z:0).toFixed(1)})); })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        print('載入', await L.wait_loaded(pg))
        for day, hour, zone, label in PROBES:
            st = dict(SAVE); st.update({'day': day, 'hour': hour, 'zone': zone, 'pos': None, 'weekday': None})
            await pg.evaluate("(async(st)=>{ st.weekday=CALENDAR.dateOf(st.day).wd%7; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(st); })(" + json.dumps(st) + ")")
            await pg.wait_for_timeout(6000)
            info = await pg.evaluate("(()=>({zone:GAME.G.zone,day:GAME.G.day,wd:GAME.G.weekday,hour:+GAME.G.hour.toFixed(2),aD:!!GAME.G.flags.afternoonDone}))()")
            npcs = await pg.evaluate(LIST_JS)
            print('==', label, json.dumps(info, ensure_ascii=False))
            for n in npcs: print('   ', json.dumps(n, ensure_ascii=False))
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
