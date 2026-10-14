"""2D 背景 noodle_table 的遊戲內 ADV 截圖（LAWWW2，2026-10-14）：手機橫向（iPhone 844×390 模擬、CDP 觸控），不用 ?turbo。
[前置／捷徑] 讀檔（met_yu：認識小語，事件的台詞才會出來）、直接執行事件 ev_midterm_supper_y1s2（正常是期中考那天晚上「出發」才演）。
本機 worktree 的 src/outings3d.js 把 OUT.BG.noodle_table.image 指到 assets/bg/noodle_table.webp（只在本機，不 commit；整合由 LAWWW 做）。
A. 實際事件：第一句「今天不講考試。誰講誰請。」（小語、阿哲都還沒有 2D 立繪：compact 對話模式）。
B. 立繪疊在背景上的樣子（測試，不是劇情）：ADV.show 左邊沈以安、右邊陳語彤（現有的 campus/neutral 立繪），對話框只放「……」。
用法：python3 bg_adv_shot.py <URL> <輸出資料夾>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L

FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'met_yu': True}


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('bg_adv_shot', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：校園 19:00（認識小語）；接著直接執行事件「考完的晚餐」ev_midterm_supper_y1s2')
        await L.load_state(pg, {'zone': 'campus', 'hour': 19.0, 'day': 160, 'weekday': 3, 'weather': 'sunny', 'pos': {'x': 0, 'z': 6, 'yaw': 3.14, 'lv': 0}, 'flags': FLAGS})
        await pg.wait_for_timeout(6000)
        img = await pg.evaluate("(typeof OUT!=='undefined'&&OUT.BG.noodle_table)?OUT.BG.noodle_table.image:null")
        run.check('本機試接：OUT.BG.noodle_table.image 有路徑', bool(img), str(img))
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_midterm_supper_y1s2'))")
        line = ''
        for _ in range(60):
            await pg.wait_for_timeout(1000)
            line = await pg.evaluate("(GAME.D&&GAME.D.active&&GAME.D.full)||''")
            if line: break
        await pg.wait_for_timeout(2500)
        bg = await pg.evaluate("(()=>{ const a=document.getElementById('advBg'); const r=document.getElementById('adv'); return {cls:r&&r.className, bg:a&&getComputedStyle(a).backgroundImage.slice(0,120)}; })()")
        run.check('A 事件的第一句出來、ADV 背景是 noodle_table 的圖', bool(line) and 'noodle_table' in (bg.get('bg') or ''), line + ' ' + json.dumps(bg, ensure_ascii=False))
        await run.shot(pg, 'A_event_first_line')
        for _ in range(12):   # 把事件點完（不影響 B）
            q = await L.state(pg)
            if not q['busy'] and not q['dlg'] and not q['choices']: break
            if q['choices']: await L.tap(pg, cdp, '#choices button:nth-child(1)')
            else: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(900)
        await pg.wait_for_timeout(1500)
        # B：立繪疊上去的樣子（測試，不是劇情）
        await pg.evaluate("""(async()=>{ GAME.sceneBegin(); ADV.begin({background:{image:%s}}); ADV.show('left','heroine_01','neutral'); ADV.show('right','heroine_03','neutral'); void GAME.say(null,'……'); })()""" % json.dumps(img))
        await pg.wait_for_timeout(3500)
        await run.shot(pg, 'B_portraits_on_bg')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
