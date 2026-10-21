"""直向畫面兩個重疊（BB 帳號 A 2026-10-21 17:25 DONE-B01 實玩，story-planning test_shots/done_b01_1021/09_crim_w7_4_after_port）：
  UI-PORTRAIT-SIT-CAPTION-1021：下課的字幕框（#caption）蓋住「坐下」按鈕（#interact）的左半；
  UI-PORTRAIT-HUD-MONEY-1021：HUD「現在可以上課：09:10 刑法總則（一）」（#nextClass）的尾巴被右邊的金額標籤（#hudR）蓋住。
[前置／捷徑] 讀檔到霖澤館 201（quiet_events）；停掉遊戲迴圈（GAME.running=false），手動擺出那一刻的畫面：金額 $41510、「現在可以上課…」那一列、「坐下」按鈕、字幕「下課了。吳老師收起講義。」。
檢查（直向 390×844、橫向 844×390）：
  1. 直向：「現在可以上課…」那一列的右邊在金額、手機、選單那一組的左邊（金額 $41510 和 $1234567 各一次，金額變寬也跟著縮）；
  2. 直向、橫向：字幕框不碰到「坐下」按鈕、不碰到搖桿（短字幕、長字幕各一次）；
  3. 沒有 JS 例外。截圖 portrait／landscape 給人看。
修改前：第 1、2 項（直向）FAIL。用法：python3 tests/ui_portrait_overlap.py URL [輸出資料夾]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/ui_portrait_overlap'

ST = {'day': 29, 'hour': 12.15, 'zone': 'classroom', 'money': 41510, 'stage': 'law', 'flags': {'LAW_START_DAY': 0}}

POSE = """((o)=>{ GAME.running=false; const G=GAME.G; G.money=o.money; GAME.updateHUD();
  const $=id=>document.getElementById(id);
  const nc=$('nextClass'); nc.textContent='現在可以上課：09:10 刑法總則（一）　13:20 民法總則'; nc.classList.remove('hide');
  const it=$('interact'); $('interactLabel').textContent='坐下'; it.classList.remove('hide');
  ['hud','hudR','ctlR','joy'].forEach(k=>{ $(k).style.opacity=1; });
  const cap=$('caption'); cap.innerHTML=o.cap; cap.classList.remove('hide'); cap.style.opacity=1; clearTimeout(GAME.caption.t);
  return true; })"""
RECTS = """(()=>{ const r=id=>{ const b=document.getElementById(id).getBoundingClientRect(); return {l:b.left,t:b.top,r:b.right,b:b.bottom}; };
  return {nc:r('nextClass'), hudR:r('hudR'), cap:r('caption'), it:r('interact'), joy:r('joy'), w:innerWidth, h:innerHeight, rw:getComputedStyle(document.getElementById('ui')).getPropertyValue('--hudRw')}; })()"""


def hit(a, b, pad=2):
    return not (a['r'] + pad <= b['l'] or b['r'] + pad <= a['l'] or a['b'] + pad <= b['t'] or b['b'] + pad <= a['t'])


async def main():
    run = L.Run('ui_portrait_overlap', OUT)
    async with async_playwright() as p:
        for land in (False, True):
            tag = '橫向' if land else '直向'
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
            await pg.goto(L.law_url(URL))
            run.check(tag + '：遊戲載入', await L.wait_loaded(pg))
            run.setup(tag + '：讀檔到 201、停掉遊戲迴圈，擺出 $41510、「現在可以上課…」、「坐下」、下課字幕')
            await L.load_state(pg, ST, quiet_events=True)
            await pg.wait_for_timeout(1500)
            for money, cap in ((41510, '下課了。吳老師收起講義。'), (1234567, '下課了。吳老師收起講義。走廊上有人在喊阿凱的名字，問他中午要不要一起去吃麵。')):
                await pg.evaluate(POSE + '(' + json.dumps({'money': money, 'cap': cap}, ensure_ascii=False) + ')')
                await pg.wait_for_timeout(400)
                r = await pg.evaluate(RECTS)
                info = json.dumps(r, ensure_ascii=False)
                if not land:
                    run.check(tag + '（$%d）：「現在可以上課…」那一列的右邊在金額那一組的左邊' % money, r['nc']['r'] <= r['hudR']['l'] - 2, info)
                run.check(tag + '（$%d，字幕 %d 字）：字幕框不碰「坐下」按鈕' % (money, len(cap)), not hit(r['cap'], r['it']), info)
                run.check(tag + '（$%d，字幕 %d 字）：字幕框不碰搖桿' % (money, len(cap)), not hit(r['cap'], r['joy']), info)
                await run.shot(pg, ('landscape' if land else 'portrait') + '_%d' % money)
            run.check(tag + '：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
            await b.close()
    sys.exit(run.finish())


asyncio.run(main())
