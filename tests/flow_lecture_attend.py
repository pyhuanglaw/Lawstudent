"""真實玩家流程：演講出席三態（AA_110 5-2；src/data/activities.js 的 track、src/game3d.js 的 actTrack）。不用 ?turbo。
[前置／捷徑] 讀檔站在博思大廳；每一段前面放一場測試演講到活動清單（遊戲裡的活動清單是空的，內容等 AA、BB）。其餘都走真的介面（點地面、互動按鈕、選項、手機）。
A. 中途離開：演講已經開始，自己走進 101、坐下 →「坐一下」（20 分鐘）→ 起身 → 自己走出 101 到大廳 → 紀錄是 left（中途離開）、離開的時間在散場前。
B. 快速前往：第二場開始後坐下 →「坐一下」→ 起身 → 手機「地點」→ 首都帝大校園 → 紀錄是 left、離開的時間是出發的時候（不是到達）。
C. 座位上跳時間：手機「地點」到博思門口、按門進去、走進 101；第三場開始前坐下 →「讀書」→「讀 1 小時」跨過整場 → 紀錄是 full（聽完）。
D. 自動存檔裡有這三筆紀錄（存檔讀檔帶得走）。
修改前（只有選「聽演講」才記）A、B、C 都沒有紀錄，這個測試會失敗。
用法：python3 tests/flow_lecture_attend.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_lecture_attend'
DAY_FRI = 3   # 9/19 週五（學期中、沒有博雅的課）
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
SEAT = "q=>q.room==='101'&&q.row===2&&q.col===5"


async def seat_of(pg, js_filter):
    return await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(%s); if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,yaw:s.yaw,y:(s.y==null?null:s.y),lv:s.lv|0,room:s.room,ax:ap[0],az:ap[1]}; })()" % js_filter)


async def add_lecture(pg, run, lid, d0, dur):
    """[前置] 今天、博思 101、現在＋d0 小時開始、dur 小時（d0 可以是負的：已經開始）"""
    run.setup(f'放測試演講 {lid}：今天、博思 101、現在{d0*60:+.0f} 分鐘開始、{dur*60:.0f} 分鐘')
    return await pg.evaluate("(([id,d0,dur])=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day), h=G.hour%%24; const a={id,title:'測試演講（'+id+'）',kind:'lecture',zone:'boya',room:'101',roomName:'博思 101',dates:[d.key],t0:h+d0,t1:h+d0+dur}; ACTIVITIES.list.push(a); return {t0:a.t0,t1:a.t1}; })(%s)" % json.dumps([lid, d0, dur]))


async def rec(pg, lid):
    return await pg.evaluate("(id=>{ const A=(GAME.G.acts&&GAME.G.acts.att)||{}; const k=Object.keys(A).find(k=>k.startsWith(id+'@')); return k?A[k]:null; })(%s)" % json.dumps(lid))


async def sit_and_choose(pg, cdp, run, want, pick_after=0):
    """坐下 → 照選項文字選（LAWWW 10:31Z）：等選單出來（最多 30 秒）、把選項印進 log、點開頭是 want 的那一個；找不到就不點（寫進 log，後面的檢查會失敗），
    不照位置選、不退回最後一個。v9.7 回歸（候選 9）：第二場坐下 2.5 秒時選單還沒出來（選項是空的），後面點對話時選了第一個「聽演講」，
    時間跳 3.8 小時、記成聽完（full）"""
    await L.tap(pg, cdp, '#interact')
    opts = []
    for _ in range(30):
        await pg.wait_for_timeout(1000)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        if opts: break
    pose = await pg.evaluate("GAME.E.player.pose")
    run.note(f'坐下（pose {pose}）的選項：' + json.dumps(opts, ensure_ascii=False))
    idx = next((i for i, o in enumerate(opts) if o.startswith(want)), None)
    if idx is None:
        run.note(f'選項裡沒有開頭是「{want}」的，不點'); return pose, opts, await L.state(pg)
    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (idx + 1)); await pg.wait_for_timeout(1500)
    run.note(f'選了第 {idx + 1} 個：{opts[idx]}')
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=pick_after)
    return pose, opts, s


# 演講時一半的位子有人（16 個完整人物＋其餘坐姿替身，照種子洗牌；classes3d.js syncRooms），另一半留給玩家——
# 真的玩家走進去看到有人坐的位子不會去坐：等聽眾坐好，挑離第 3 排第 6 個位子最近的空位（v9.7 回歸：寫死的那個位子被替身坐走，「坐下」不出現）
CROWD_JS = "GAME.E.zone.seats.filter(q=>q.room==='101'&&q.taken).length+GAME.E.npcs.filter(n=>n.clsStudent&&n.seat&&n.seat.room==='101').length"
FREE_SEAT_JS = """(()=>{ const E=GAME.E; const occ=q=>q.taken||E.npcs.some(n=>(n.seat||n.seatTarget)&&Math.hypot((n.seat||n.seatTarget).x-q.x,(n.seat||n.seatTarget).z-q.z)<0.35);
  const L=E.zone.seats.filter(q=>q.room==='101'&&!occ(q)).sort((a,b)=>(Math.abs(a.row-2)*3+Math.abs(a.col-5))-(Math.abs(b.row-2)*3+Math.abs(b.col-5)));
  const s=L[0]; if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,yaw:s.yaw,y:(s.y==null?null:s.y),lv:s.lv|0,room:s.room,row:s.row,col:s.col,ax:ap[0],az:ap[1]}; })()"""


async def to_seat(pg, cdp, run, label):
    for _ in range(90):
        if await pg.evaluate(CROWD_JS) > 0: break
        await pg.wait_for_timeout(1000)
    seat = await pg.evaluate(FREE_SEAT_JS)
    if not seat: run.note(f'{label}：101 沒有空位'); return False, await L.state(pg)
    run.note(f"{label}：空位 第 {seat['row'] + 1} 排第 {seat['col'] + 1} 個")
    ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.3, label, lv=0)
    s = await L.state(pg)
    for _ in range(60):   # 真的走到了再看按鈕：路線走完、停下來（最多 60 秒）
        if not s['path'] and s['pose'] == 'idle': break
        await pg.wait_for_timeout(1000); s = await L.state(pg)
    await pg.wait_for_timeout(1000); s = await L.state(pg)
    return ok and s['interact'].startswith('坐下'), s


async def phone_place(pg, cdp, run, key):
    """手機「地點」：像玩家一樣把清單滑到那一列，點「前往」"""
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
    sel = '#phoneBody [data-place="%s"]' % key
    await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })(%s)" % json.dumps(sel)); await pg.wait_for_timeout(600)
    ok = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(7000)
    return ok


async def main():
    run = L.Run('flow_lecture_attend', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 3 天（9/19 週五）10:00，博思教學館大廳')
        await L.load_state(pg, {'zone': 'boya', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 0, 'z': 6.8, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        # ---------- A：中途離開 ----------
        a = await add_lecture(pg, run, 't_partial', -0.05, 1.5)
        ok, s = await to_seat(pg, cdp, run, '101 第 3 排附近的空位後面')
        run.check('A 自己走進 101、走到第 3 排附近的空位旁（演講已經開始）', ok, json.dumps(s, ensure_ascii=False))
        pose, opts, s = await sit_and_choose(pg, cdp, run, '坐一下')
        r = await rec(pg, 't_partial')
        run.check('A 坐下（有「聽演講」可以選，這次選「坐一下」20 分鐘）→ 開始記（in）', pose == 'sit' and any(o.startswith('聽演講：') for o in opts) and r and r.get('end') == 'in', json.dumps(opts, ensure_ascii=False) + ' ' + json.dumps(r))
        await run.shot(pg, 'A_after_sit')
        ok = await L.go_to(pg, cdp, run, 0, 6.8, 1.0, '大廳（走出 101）', lv=0)
        await pg.wait_for_timeout(1500)
        r = await rec(pg, 't_partial'); s = await L.state(pg)
        run.check('A 起身、自己走出 101 到大廳 → 中途離開（left）、離開的時間在散場前', ok and r and r.get('end') == 'left' and r.get('lh', 99) < a['t1'], json.dumps(r) + f" t1={a['t1']:.2f} 現在 {s['hour']:.2f}")
        # ---------- B：快速前往 ----------
        # 第二場 4 小時：SwiftShader 走回 101 要約 4 分鐘，遊戲時間照走（約 90 遊戲分鐘），1.5 小時的演講坐下時已經快結束、記成聽完（v9.7 回歸，LAWWW2）。
        # 要測的是「坐下記 in → 快速前往記 left」，演講長一點不影響判斷
        a = await add_lecture(pg, run, 't_quick', -0.05, 4.0)
        ok, s = await to_seat(pg, cdp, run, '再走回 101 第 3 排附近的空位')
        pose, opts, s = await sit_and_choose(pg, cdp, run, '坐一下')
        r = await rec(pg, 't_quick')
        run.check('B 走回 101、坐下「坐一下」→ 第二場開始記（in）', ok and any(o.startswith('坐一下') for o in opts) and r and r.get('end') == 'in', json.dumps(opts, ensure_ascii=False) + ' ' + json.dumps(r))
        h_dep = (await L.state(pg))['hour']
        ok = await phone_place(pg, cdp, run, 'campus|首都帝大校園（法律系館A前）')
        s = await L.state(pg); r = await rec(pg, 't_quick')
        run.check('B 手機「地點」快速前往首都帝大校園 → 中途離開（left）、離開的時間是出發的時候', ok and s['zone'] == 'campus' and r and r.get('end') == 'left' and abs(r.get('lh', 0) - (h_dep % 24)) < 0.05, json.dumps(r) + f' 出發 {h_dep:.2f}、到達 {s["hour"]:.2f}')
        # ---------- C：座位上跳時間 ----------
        ok = await phone_place(pg, cdp, run, 'campus|博思教學館')
        s = await L.state(pg)
        run.check('C 手機「地點」到博思教學館門口、出現「博思教學館」', ok and s['zone'] == 'campus' and s['interact'].startswith('博思教學館'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('C 按下去走進博思教學館（沒有課：直接進去）', s['zone'] == 'boya' and s['stand'], json.dumps(s, ensure_ascii=False))
        ok, s = await to_seat(pg, cdp, run, '101 第 3 排附近的空位')
        a = await add_lecture(pg, run, 't_skip', 0.15, 0.6)
        pose, opts, s = await sit_and_choose(pg, cdp, run, '讀書', pick_after=0)
        r = await rec(pg, 't_skip')
        run.check('C 開始前 9 分鐘坐下 →「讀書」→「讀 1 小時」跨過整場（36 分鐘）→ 聽完（full）', ok and s['hour'] % 24 >= a['t1'] and r and r.get('end') == 'full', json.dumps(r) + f" t0={a['t0']:.2f} t1={a['t1']:.2f} 現在 {s['hour']:.2f}")
        await run.shot(pg, 'C_after_study')
        # ---------- D：存檔 ----------
        await pg.wait_for_timeout(1500)
        await pg.evaluate("GAME.autosave&&GAME.autosave()")
        saved = await pg.evaluate("(()=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')); const A=(s.acts&&s.acts.att)||{}; const o={}; for(const k in A) o[k.split('@')[0]]=A[k].end; return o; }catch(e){ return String(e); } })()")
        run.check('D 自動存檔裡有三筆：中途離開、中途離開、聽完', isinstance(saved, dict) and saved.get('t_partial') == 'left' and saved.get('t_quick') == 'left' and saved.get('t_skip') == 'full', json.dumps(saved, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
