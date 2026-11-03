"""一鍵（ONE-TAP-GO-1103）＋手機最愛（PHONE-FAV-1103）的畫面截圖與重疊檢查（手機模擬，直向 390×844、橫向 844×390）。
[前置／捷徑] 讀檔把人物放到 9/22（週一）22:00 校園、17:00 校園（有一個 19:00 兩點半 Café 的當面約）；手機訊息用 PHONE.postAt 放進去（只為了截圖）。
按鈕、選單、確認框、星號都是用手指按（CDP 觸控），不是直接呼叫函式。
檢查：一鍵按鈕 44px 以上、在畫面裡；不和 HUD 其他按鈕、小地圖、搖桿、目標、字幕框重疊；選單、確認框在畫面裡；確定、取消 44px 以上；確認框預設焦點在取消；
按取消什麼都沒變（日子、時間、區域）；最愛的對話在訊息列表最上面、名字前面有 ★。
用法：python3 tests/onetap_shots.py URL 輸出資料夾 [portrait|landscape|both]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]; MODE = sys.argv[3] if len(sys.argv) > 3 else 'both'
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True, 'LAW_RECAP_SEEN': True}

RECTS_JS = """(()=>{ const r=s=>{ const e=document.querySelector(s); if(!e) return null; const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||e.classList.contains('hide')) return null; const b=e.getBoundingClientRect(); if(!b.width||!b.height) return null; return [b.left,b.top,b.right,b.bottom]; };
  const o={}; for(const s of ['#btnGo','#btnPhone','#btnQuick','#btnMenu','#hudR .chip','#minimap','#joy','#caption','#goal','#guide','#nextClass','#hud','#clock','#ctlR','#btnBike','#btnRun','#btnCenter','#interact','#toast','#goPop','#goConfirm .goCfBox','#goCfYes','#goCfNo']) o[s]=r(s);
  o.vw=innerWidth; o.vh=innerHeight; return o; })()"""


def inter(a, b):
    if not a or not b: return False
    return min(a[2], b[2]) - max(a[0], b[0]) > 0.5 and min(a[3], b[3]) - max(a[1], b[1]) > 0.5


def inside(a, vw, vh):
    return a and a[0] >= -0.5 and a[1] >= -0.5 and a[2] <= vw + 0.5 and a[3] <= vh + 0.5


async def load(pg, day, hour, extra=''):
    await L.load_state(pg, {'zone': 'campus', 'hour': hour, 'day': day, 'weekday': 1, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': 30, 'z': -60, 'yaw': 0}}, quiet_events=True)
    for _ in range(60):
        if await pg.evaluate("!!(GAME.E&&GAME.E.zone&&GAME.E.player&&!(GAME.isEntering&&GAME.isEntering()))"): break
        await pg.wait_for_timeout(1000)
    if extra: await pg.evaluate(extra)
    await pg.wait_for_timeout(2500)


async def one(p, run, landscape):
    tag = 'land' if landscape else 'port'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL); run.check(f'{tag} 遊戲載入', await L.wait_loaded(pg))
    await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
    d = await pg.evaluate("STORY.dayOfKey('2025-09-22')")
    run.setup(f'{tag}：讀檔到 9/22 週一 22:00 校園（day {d}）')
    await load(pg, d, 22.0); await L.close_panels(pg, cdp)
    R = await pg.evaluate(RECTS_JS); vw, vh = R['vw'], R['vh']
    g = R['#btnGo']
    run.check(f'{tag} 一鍵按鈕看得到、在畫面裡、44px 以上', bool(g) and inside(g, vw, vh) and g[2] - g[0] >= 44 and g[3] - g[1] >= 44, json.dumps(g))
    others = ['#btnPhone', '#btnQuick', '#btnMenu', '#hudR .chip', '#minimap', '#joy', '#caption', '#goal', '#guide', '#nextClass', '#clock', '#ctlR', '#interact', '#toast']
    hit = [s for s in others if inter(g, R[s])]
    run.check(f'{tag} 一鍵按鈕不和其他 HUD 按鈕、小地圖、搖桿、目標、字幕框重疊', not hit, '重疊：' + ','.join(hit) + ' ' + json.dumps({s: R[s] for s in ['#btnGo'] + others if R[s]}))
    await run.shot(pg, f'{tag}_1_hud')
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(900)
    R = await pg.evaluate(RECTS_JS)
    pop = R['#goPop']
    items = await pg.evaluate("[...document.querySelectorAll('#goPop .goItem')].map(e=>({k:e.dataset.gok,dim:e.classList.contains('dim'),t:e.innerText.replace(/\\n/g,' / '),h:e.getBoundingClientRect().height}))")
    run.check(f'{tag} 一鍵選單打開：三項、在畫面裡、每項 44px 以上', bool(pop) and inside(pop, vw, vh) and len(items) == 3 and all(i['h'] >= 44 for i in items), json.dumps(items, ensure_ascii=False))
    run.check(f'{tag} 22:00：回去睡覺可以按、到下一堂課不能按（寫原因）', not items[0]['dim'] and items[1]['dim'], json.dumps(items, ensure_ascii=False))
    run.check(f'{tag} 選單不蓋到搖桿', not inter(pop, R['#joy']), json.dumps([pop, R['#joy']]))
    await run.shot(pg, f'{tag}_2_menu')
    st0 = await pg.evaluate("({day:GAME.G.day,hour:GAME.G.hour,zone:GAME.G.zone})")
    await L.tap(pg, cdp, '#goPop [data-gok="sleep"]'); await pg.wait_for_timeout(1200)
    R = await pg.evaluate(RECTS_JS)
    box = R['#goConfirm .goCfBox']
    focus = await pg.evaluate("document.activeElement&&document.activeElement.id")
    body = await pg.evaluate("document.getElementById('goCfBody').innerText")
    run.check(f'{tag} 確認框跳出來、在畫面裡；確定、取消 44px 以上；預設焦點在取消', bool(box) and inside(box, vw, vh) and R['#goCfYes'] and R['#goCfYes'][3] - R['#goCfYes'][1] >= 44 and R['#goCfNo'][3] - R['#goCfNo'][1] >= 44 and focus == 'goCfNo', f'focus={focus} ' + json.dumps(box))
    run.check(f'{tag} 確認框寫去哪、現在幾點、路程、睡到幾點', '宿舍 203' in body and '現在：週一 22:00' in body and '路程' in body and '睡：' in body, body.replace('\n', ' / '))
    run.check(f'{tag} 確認框開著：遊戲暫停（時間不走）', await pg.evaluate("!!GAME.E.paused"))
    await run.shot(pg, f'{tag}_3_confirm_sleep')
    await L.tap(pg, cdp, '#goCfNo'); await pg.wait_for_timeout(1000)
    st1 = await pg.evaluate("({day:GAME.G.day,hour:GAME.G.hour,zone:GAME.G.zone,shown:!document.getElementById('goConfirm').classList.contains('hide'),paused:!!GAME.E.paused})")
    run.check(f'{tag} 按取消：確認框關掉、日子區域不變、時間沒有跳、遊戲繼續', not st1['shown'] and not st1['paused'] and st1['day'] == st0['day'] and st1['zone'] == st0['zone'] and abs(st1['hour'] - st0['hour']) < 0.2, json.dumps([st0, st1]))
    await run.shot(pg, f'{tag}_4_after_cancel')

    run.setup(f'{tag}：讀檔到 9/22 週一 17:00 校園＋19:00 和以安約在兩點半 Café（當面約，accepted）')
    await load(pg, d, 17.0, "(()=>{ const G=GAME.G; G.invites=[{id:'shot_i1',state:'accepted',day:G.day,h:19,who:'heroine_01',place:'cafe'}]; })()")
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(900)
    items = await pg.evaluate("[...document.querySelectorAll('#goPop .goItem')].map(e=>({k:e.dataset.gok,dim:e.classList.contains('dim'),t:e.innerText.replace(/\\n/g,' / ')}))")
    run.check(f'{tag} 17:00：回去睡覺不能按（白天）、到下一個約會地點可以按', items[0]['dim'] and not items[2]['dim'], json.dumps(items, ensure_ascii=False))
    await run.shot(pg, f'{tag}_5_menu_17')
    await L.tap(pg, cdp, '#goPop [data-gok="date"]'); await pg.wait_for_timeout(1200)
    body = await pg.evaluate("document.getElementById('goCfBody').innerText")
    run.check(f'{tag} 約會確認框：寫和誰約在哪、現在、路程、先跳到幾點出發', '兩點半 Café' in body and '現在：週一 17:00' in body and '先跳過時間' in body, body.replace('\n', ' / '))
    await run.shot(pg, f'{tag}_6_confirm_date')
    await L.tap(pg, cdp, '#goCfNo'); await pg.wait_for_timeout(800)
    run.check(f'{tag} 約會按取消：沒有出發、時間沒跳', await pg.evaluate("GAME.G.zone==='campus'&&Math.abs(GAME.G.hour-17)<0.2"))

    run.setup(f'{tag}：[捷徑] 手機裡放幾則訊息（PHONE.postAt），以安最舊')
    await pg.evaluate("""(()=>{ const G=GAME.G, d=G.day; PHONE.postAt(G,{th:'p:heroine_01',from:'heroine_01',text:'筆記我放你桌上了。'},d-1,20);
      PHONE.postAt(G,{th:'p:heroine_02',from:'heroine_02',text:'下週的書展你去嗎？'},d-1,21); PHONE.postAt(G,{th:'p:kexin',from:'kexin',text:'週末來木柵大學？我當導遊。'},d,12);
      PHONE.postAt(G,{th:'p:heroine_03',from:'heroine_03',text:'社會學的報告要分組了'},d,15); })()""")
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(900)
    await run.shot(pg, f'{tag}_7_msgs_before')
    await pg.evaluate("document.querySelector('#phoneBody [data-th=\"p:heroine_01\"]').scrollIntoView({block:'center'})")
    await L.tap(pg, cdp, '#phoneBody [data-th="p:heroine_01"]'); await pg.wait_for_timeout(900)
    fb = await L.center_of(pg, '#phoneBody .thHead [data-fav]')
    fbr = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .thHead [data-fav]'); if(!e) return null; const b=e.getBoundingClientRect(); return [b.width,b.height,e.textContent]; })()")
    run.check(f'{tag} 對話表頭有星號（☆、44px 以上）', bool(fbr) and fbr[0] >= 44 and fbr[1] >= 44 and fbr[2] == '☆', json.dumps(fbr, ensure_ascii=False))
    await L.tap(pg, cdp, '#phoneBody .thHead [data-fav]'); await pg.wait_for_timeout(900)
    on = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .thHead [data-fav]'); return e&&e.textContent; })()")
    run.check(f'{tag} 按星號：變成 ★、存進 G.phone.fav', on == '★' and await pg.evaluate("GAME.G.phone.fav.includes('p:heroine_01')"), str(on))
    await run.shot(pg, f'{tag}_8_thread_fav')
    await L.tap(pg, cdp, '#phoneBody [data-thback]'); await pg.wait_for_timeout(900)
    rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody .chatRow')].map(e=>({th:e.dataset.th,star:!!e.querySelector('.favStar')}))")
    run.check(f'{tag} 訊息列表：以安（最愛、訊息最舊）在最上面、名字前有 ★；其他的照最新排、沒有 ★', bool(rows) and rows[0]['th'] == 'p:heroine_01' and rows[0]['star'] and not any(r['star'] for r in rows[1:]), json.dumps(rows))
    await pg.evaluate("document.getElementById('phoneBody').scrollTop=0")
    await run.shot(pg, f'{tag}_9_msgs_fav_top')
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(900)
    nfav = await pg.evaluate("document.querySelectorAll('#phoneBody [data-fav]').length")
    run.check(f'{tag} 朋友頁每位朋友有星號按鈕', nfav >= 1, str(nfav))
    await run.shot(pg, f'{tag}_10_friends')
    await L.close_panels(pg, cdp)
    run.check(f'{tag} 沒有 JS 例外', not errs, '；'.join(errs[:3]))
    await b.close()


async def main():
    run = L.Run('onetap_shots', OUT)
    async with async_playwright() as p:
        if MODE in ('portrait', 'both'): await one(p, run, False)
        if MODE in ('landscape', 'both'): await one(p, run, True)
    sys.exit(run.finish())
asyncio.run(main())
