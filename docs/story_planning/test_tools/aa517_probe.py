"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 3 項）：AA_517 宿舍大二～大四（312／507／409）房間日常——照玩家在宿舍走廊走到自己房門口、按「進入」、走出去再走進來、跟室友說話（不是 Node）。
MODE（環境變數）：
  y2  大二上第 1 週週一 22:40：【前置】ROOM_Y2；宿舍走廊二樓、312 門口 4 m 外 → 走進去：學弟那幾句旁白之一（第 1 節）；走出去再走進來：換一句（同一天不重複）；
      跟阿哲說話＝「學弟問我浴室哪一間水比較熱……」、跟柏翰說話＝「學弟的鬧鐘比我早十分鐘……」（第 2 節，大二上第 1～4 週那一列）
  y3  大三上第 1 週週一 22:40（507）：旁白兩句輪流；柏翰＝「五樓。我第一天數了樓梯，之後就不數了。」
  y4  大四上第 1 週週一 22:40（409）：旁白兩句輪流；柏翰＝「最後一次搬。……耳塞我多買了一副，放你抽屜。」
  sup 3-1：2026-11-19（四）22:50 在 312（阿哲、柏翰照作息在）站著等 → 四份滷味演；選「（把自己那份的豆干分給學弟）」；記 R312_SUPPER
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 aa517_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'y2')
J = lambda o: json.dumps(o, ensure_ascii=False)
WALK = {'y2': ('（學弟的床上還貼著宿舍發的新生手冊。）', '（學弟在講電話：「媽，我有吃。」）', '（學弟在問阿哲浴室哪一間水比較熱。）'),
        'y3': ('（大二的學弟在打電動，耳機很大，沒有聽到你進來。）', '（別系的那個同學在吃泡麵，手機架在泡麵蓋上放影片。）'),
        'y4': ('（大一的學弟床上貼著新生手冊。和三年前那一本一樣。）', '（大二的學弟抬頭：「學長，民總要買新版嗎？」你還沒回答，他又低頭了。）')}
ROW1 = {'y2': {'zhe': '學弟問我浴室哪一間水比較熱。我教他了。……我現在是學長了欸。', 'classmate_bohan': '學弟的鬧鐘比我早十分鐘。……我第一次不是最早起的。'},
        'y3': {'classmate_bohan': '五樓。我第一天數了樓梯，之後就不數了。'},
        'y4': {'classmate_bohan': '最後一次搬。……耳塞我多買了一副，放你抽屜。'}}
TERM = {'y2': 'Y2S1', 'y3': 'Y3S1', 'y4': 'Y4S1'}
PLATE = {'y2': '312', 'y3': '507', 'y4': '409'}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
DOOR = "(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?{x:it.x,z:it.z,lv:it.lv|0,label:it.label}:null; })"


async def rooms(pg, d):
    fl = {}
    for k, kk in ROOMS:
        dd = await pg.evaluate("STORY.dayOfKey(%s)" % J(kk))
        if dd <= d: fl[k] = dd
    if 'ROOM_Y4' in fl: fl.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
    if 'ROOM_Y3' in fl: fl.update({'ROOM_Y3_ITEMS': [], 'ROOM_Y3_DISCARD': None})
    return fl


async def through(pg, cdp, run, to, tag):
    """走到往 to 的門、按它，等換區域；回傳換過去以後的 caption 起點"""
    dr = await pg.evaluate(DOOR, to)
    if not dr: run.note('%s：找不到往 %s 的門' % (tag, to)); return None
    await L.go_to(pg, cdp, run, dr['x'], dr['z'], 0.9, '%s：%s' % (tag, dr['label']), max_s=240, lv=dr['lv'], stop=lambda s, w=dr['label']: s['interact'].startswith(w[:6]))
    n0 = await P.cap_n(pg)
    await L.tap(pg, cdp, '#interact')
    for _ in range(30):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == to: break
    return n0


async def walk_lines(pg, n0, wait_ms=10000):
    await pg.wait_for_timeout(wait_ms)
    return [c['t'] for c in await P.captions(pg, n0) if c.get('v') and c.get('t')]


async def main():
    run = L.Run('aa517_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)

        if MODE in WALK:
            d = await P.day_of(pg, [TERM[MODE], 1, 1]); fl = await rooms(pg, d['d'])
            st, d = await P.base(pg, SAVE, [TERM[MODE], 1, 1], 22.67, 'dorm_hall', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（%s 第 1 週週一）22:40 宿舍走廊；旗標 %s' % (d['key'], d['term'], J(fl)))
            dr = await pg.evaluate(DOOR, 'dorm'); run.note('房門：%s' % J(dr))
            run.check('前置：房門是 %s' % PLATE[MODE], bool(dr) and PLATE[MODE] in (dr['label'] or ''), J(dr))
            if dr: await P.place_near(pg, run, dr['x'], dr['z'], R=4, lv=dr['lv'], what='房門口')
            seen = []
            for k in (1, 2):
                n0 = await through(pg, cdp, run, 'dorm', '第 %d 次走進房間' % k)
                z = await pg.evaluate("GAME.G.zone"); run.check('第 %d 次：走進房間（dorm）' % k, z == 'dorm', str(z))
                cs = await walk_lines(pg, n0); w = [t for t in cs if t in WALK[MODE]]
                run.note('第 %d 次走進來的字幕：%s' % (k, J(cs))); seen.append(w)
                await run.shot(pg, 'walk%d' % k)
                run.check('第 1 節 第 %d 次：背景室友那幾句旁白之一（剛好一句）' % k, len(w) == 1, J(cs))
                if k == 1: await through(pg, cdp, run, 'dorm_hall', '走出房間')
            if all(len(x) == 1 for x in seen):
                run.check('第 1 節：同一天第二次走進來換一句（不重複）', seen[0][0] != seen[1][0], J(seen))
            who = await pg.evaluate("(()=>({h:+GAME.G.hour.toFixed(2), mates:STORY.dormWho?STORY.dormWho(GAME.G):null}))()"); run.note('房間裡：%s' % J(who))
            for cid, want in ROW1[MODE].items():
                pw = await P.wait_present(pg, cid, 40); run.note('%s：%s' % (cid, J(pw)))
                r = await P.talk_full(pg, cdp, run, cid, '%s_%s' % (MODE, cid), max_s=240); await run.shot(pg, 'talk_' + cid)
                run.check('第 2 節 %s 跟%s說話＝「%s」' % (PLATE[MODE], '阿哲' if cid == 'zhe' else '柏翰', want), any(want in t for _, t in (r or {}).get('lines', [])), J(r and r['lines']))

        elif MODE == 'sup':
            key = '2026-11-19'; d = await P.day_of(pg, key); fl = await rooms(pg, d['d'])
            st, d = await P.base(pg, SAVE, key, 22.83, 'dorm', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（大二上第 %s 週週四）22:50 312；旗標 %s' % (key, d['week'], J(fl)))
            await P.events_on(pg); n0s = await P.say_hook(pg)
            t0 = time.time(); got = False
            while time.time() - t0 < 480:
                s = await P.ts(pg)
                if s['dlg'] or s['ch']: got = True; break
                if s['phone']: await L.phone_away(pg, cdp)
                await pg.wait_for_timeout(1500)
            run.check('3-1 23:00 在 312：四份滷味照玩家站著就演', got, J(await P.ts(pg)))
            r = await P.dialog(pg, cdp, run, ['「（把自己那份的豆干分給學弟）」'], max_s=240, tag='sup312', shots=True) if got else {'lines': [], 'opts': []}
            tx = [t for _, t in r['lines']] + [t for _, t in await P.said(pg, n0s)]
            for w in ('（阿哲提著一袋滷味進門。他把袋子打開，分成四份。）', '學弟，你的。', '……以前是阿凱下去拿。', '對啊。現在換我了。', '（學弟又說了一次謝謝。這次比較小聲。）'):
                run.check('3-1 有「%s」' % w, w in tx, J(tx))
            f = await pg.evaluate("GAME.G.flags.R312_SUPPER==null?null:GAME.G.flags.R312_SUPPER"); run.check('3-1 記 R312_SUPPER', bool(f), J(f))
            await run.shot(pg, 'sup312_end')

        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
