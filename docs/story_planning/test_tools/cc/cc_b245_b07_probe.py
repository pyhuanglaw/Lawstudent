"""CC（帳號 A）11-02 BB_245 第二批 #4：DONE-B07 右上角手機和選單整合（瀏覽器探針）。
LAWWW 驗法（docs/handoff/BB245_LAWWW_REPLY_1102.md 第一節）：選單沒有「人物」「地圖」；手機「朋友」每人有「資料」；「地點」最上面有「打開整張地圖」。
  （派工說明寫「三樣東西都要有——選單、…」；回覆文件是「選單『沒有』人物、地圖」。以回覆文件為準：選單要打得開、而且頁籤裡沒有人物、地圖。）
修正：59ad9faa5（選單拿掉「人物」「地圖」→ 手機「朋友」每人多「資料」、「地點」最上面「打開整張地圖」）；對照＝59ad9faa5^（預期 ①②③ FAIL）。
不是 iPhone：Playwright 手機橫向模擬（844×390，SwiftShader）。不用 ?turbo。全部用 CDP 觸控點。判斷讀 DOM 的 data 屬性（data-tab、data-ptab、data-person、data-bigmap）
和遊戲狀態（#menu／#phone／#bigmap 的 hide），按鈕文字一律 startswith。
情境：【前置／捷徑】load_state（quiet_events）宿舍第 DAY 天 20:00（法律系；阿哲、阿凱一開始就算認識，再加 met_heroine_01、met_classmate_peishan）。
  ① 點 #btnMenu：選單打開；頁籤（data-tab）有 notes、save，沒有 people、map；頁籤文字沒有 startswith「人物」「地圖」的 → 截圖 → 點「返回遊戲」
  ② 點 #btnPhone → 點「朋友」（data-ptab=friends）：每一列（.phrow）都有 data-person 按鈕、文字 startswith「資料」→ 截圖 → 點第一個「資料」→ 出現資料頁（data-personback）→ 截圖
  ③ 點「地點」（data-ptab=places）：#phoneBody 第一個 .item 裡的按鈕有 data-bigmap、文字 startswith「打開整張地圖」→ 截圖 → 點它 → 手機關起來、#bigmap 打開 → 截圖
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [DAY=7] [PORTRAIT=1] python3 cc_b245_b07_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_b245_common as C
from cc_b245_common import L, J, check, info
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?'); DAY = int(os.environ.get('DAY', '7'))
VIS = "(id=>{ const e=document.getElementById(id); return !!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'; })(%s)"


async def run(p, land):
    tag = 'land' if land else 'port'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.set_default_timeout(180000)
    await pg.goto(URL)
    check('[%s] 遊戲載入' % tag, await L.wait_loaded(pg))
    await C.load(pg, C.st('dorm', 20.0, 0, 1.0, 3.14, day=DAY, flags={'met_heroine_01': True, 'met_classmate_peishan': True}), '宿舍第 %d 天 20:00' % DAY)
    await L.close_panels(pg, cdp)
    # ① 選單
    ok = await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1500)
    mo = await pg.evaluate(VIS % J('menu'))
    tabs = await pg.evaluate("[...document.querySelectorAll('#menu .tabs button')].filter(b=>getComputedStyle(b).display!=='none').map(b=>[b.dataset.tab,(b.textContent||'').trim()])")
    await pg.screenshot(path=os.path.join(OUT, 'b07_%s_1_menu.png' % tag))
    info('[%s] 選單頁籤：%s' % (tag, J(tabs)))
    keys = [t[0] for t in tabs]
    check('[%s] ① 點選單（#btnMenu）打得開' % tag, ok and mo)
    check('[%s] ① 選單有筆記（notes）、存檔（save）' % tag, 'notes' in keys and 'save' in keys, J(keys))
    check('[%s] ① 選單沒有「人物」「地圖」（data-tab 沒有 people、map；文字沒有 startswith 人物／地圖）' % tag,
          'people' not in keys and 'map' not in keys and not any(t[1].startswith('人物') or t[1].startswith('地圖') for t in tabs), J(tabs))
    if mo: await L.tap(pg, cdp, '#btnClose'); await pg.wait_for_timeout(1000)
    # ② 手機「朋友」
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    po = await pg.evaluate(VIS % J('phone'))
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(1500)
    rows = await pg.evaluate("""(()=>{ const b=document.getElementById('phoneBody'); if(!b) return null; return [...b.querySelectorAll('.phrow')].map(r=>{ const n=(r.firstElementChild&&r.firstElementChild.firstChild&&r.firstElementChild.firstChild.textContent||'').trim();
      const p=r.querySelector('[data-person]'); return {name:n, person:p?p.dataset.person:null, txt:p?(p.textContent||'').trim():null}; }); })()""")
    await pg.screenshot(path=os.path.join(OUT, 'b07_%s_2_friends.png' % tag))
    info('[%s] 朋友列表：%s' % (tag, J(rows)))
    check('[%s] ② 手機打得開、「朋友」有人（前置：阿哲、阿凱、以安、沛珊算認識）' % tag, po and bool(rows), J(rows))
    check('[%s] ② 朋友每一列都有「資料」按鈕（data-person、文字 startswith 資料）' % tag, bool(rows) and all(r['person'] and (r['txt'] or '').startswith('資料') for r in rows),
          J([r['name'] for r in (rows or []) if not (r['person'] and (r['txt'] or '').startswith('資料'))]))
    if rows and rows[0]['person']:
        await L.tap(pg, cdp, '#phoneBody [data-person="%s"]' % rows[0]['person']); await pg.wait_for_timeout(1500)
        pp = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); const bk=b&&b.querySelector('[data-personback]'); return {back:!!bk, backTxt:bk?(bk.textContent||'').trim():null, name:(b&&b.querySelector('.phrow b')||{}).textContent||null}; })()")
        await pg.screenshot(path=os.path.join(OUT, 'b07_%s_3_person.png' % tag))
        check('[%s] ② 點第一個「資料」：出現資料頁（有返回「朋友」的按鈕 data-personback）' % tag, pp['back'], J(pp))
    else:
        check('[%s] ② 點第一個「資料」：出現資料頁' % tag, False, '沒有資料按鈕可以點')
    # ③ 手機「地點」
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(1500)
    first = await pg.evaluate("""(()=>{ const b=document.getElementById('phoneBody'); if(!b) return null; const it=b.querySelector('.item'); if(!it) return {item:null};
      const bt=it.querySelector('button'); const bm=b.querySelector('[data-bigmap]'); return {item:(it.textContent||'').trim().slice(0,40), btn:bt?(bt.textContent||'').trim():null, firstIsBig:!!(bt&&bt.dataset.bigmap), any:!!bm}; })()""")
    await pg.screenshot(path=os.path.join(OUT, 'b07_%s_4_places.png' % tag))
    check('[%s] ③ 「地點」最上面（第一個 .item）是 data-bigmap 按鈕、文字 startswith「打開整張地圖」' % tag,
          bool(first) and first.get('firstIsBig') and (first.get('btn') or '').startswith('打開整張地圖'), J(first))
    if first and first.get('any'):
        await L.tap(pg, cdp, '#phoneBody [data-bigmap]'); await pg.wait_for_timeout(2500)
        bm = await pg.evaluate(VIS % J('bigmap')); ph = await pg.evaluate(VIS % J('phone'))
        await pg.screenshot(path=os.path.join(OUT, 'b07_%s_5_bigmap.png' % tag))
        check('[%s] ③ 點「打開整張地圖」：手機收起來、大地圖（#bigmap）打開' % tag, bm and not ph, J({'bigmap': bm, 'phone': ph}))
    else:
        check('[%s] ③ 點「打開整張地圖」：大地圖打開' % tag, False, '沒有 data-bigmap 按鈕')
    check('[%s] 沒有 JS 例外' % tag, not errs, J(errs[:3]))
    await b.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_b245_b07_probe  SHA=%s  URL=%s' % (SHA, URL), flush=True)
    async with async_playwright() as p:
        await run(p, True)
        if os.environ.get('PORTRAIT') == '1': await run(p, False)
    return C.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
