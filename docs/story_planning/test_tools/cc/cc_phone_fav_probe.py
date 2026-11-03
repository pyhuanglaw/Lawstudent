"""CC（帳號 A）11-03：PHONE-FAV-1103（X190，fbfbac265，候選 b1ae1c390）手機最愛：照玩家的方式（手指點）測。
① 訊息列表原本的順序（照最新一則）→ 對話表頭點 ☆ → 變 ★、這個對話跑到最上面、名字前有 ★
② 朋友頁再點兩個人的星號（最愛三個）→ 最愛的三個都在最上面、三個之間照最新一則排；其他的照舊
③ 選單 → 存檔欄位 1 → 重新整理 → 標題「讀取」欄位 1 → G.phone.fav 還在、列表還是置頂
④ 一個一個取消星號 → 列表回到 ① 原本的順序、沒有 ★
直向（390×844）、橫向（844×390）各一次。
【前置／捷徑】讀檔到 9/22（週一）22:00 校園；手機訊息用 PHONE.postAt 放四則（同 tests/onetap_shots.py）。
用法：LW_TESTS=<wt>/tests [ORIENTS=port,land] python3 cc_phone_fav_probe.py '<URL>/index.html' <out>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
ORIENTS = [o for o in os.environ.get('ORIENTS', 'port,land').split(',') if o]
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True, 'LAW_RECAP_SEEN': True}
# 訊息時間：以安 d-1 20:00（最舊）、芷若 d-1 21:00、可昕 d 12:00、語彤 d 15:00（最新）
POST = """(()=>{ const G=GAME.G, d=G.day; PHONE.postAt(G,{th:'p:heroine_01',from:'heroine_01',text:'筆記我放你桌上了。'},d-1,20);
  PHONE.postAt(G,{th:'p:heroine_02',from:'heroine_02',text:'下週的書展你去嗎？'},d-1,21); PHONE.postAt(G,{th:'p:kexin',from:'kexin',text:'週末來木柵大學？我當導遊。'},d,12);
  PHONE.postAt(G,{th:'p:heroine_03',from:'heroine_03',text:'社會學的報告要分組了'},d,15); })()"""
ROWS = "[...document.querySelectorAll('#phoneBody .chatRow')].map(e=>({th:e.dataset.th,star:!!e.querySelector('.favStar')}))"
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''), flush=True)
    if not ok: fails.append(name)

async def tapq(pg, cdp, js_find):
    """js_find 回傳一個元素：標上 id 再用手指點（CDP 觸控）"""
    ok = await pg.evaluate("(()=>{ document.querySelectorAll('#__cctap').forEach(e=>e.removeAttribute('id')); const e=(%s); if(!e) return false; e.scrollIntoView({block:'center'}); e.id='__cctap'; return true; })()" % js_find)
    if ok: await L.tap(pg, cdp, '#__cctap'); await pg.wait_for_timeout(900)
    return ok

async def msgs(pg, cdp):
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(900)
    return await pg.evaluate(ROWS)

async def one(p, tag, landscape):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL); check(f'{tag} 遊戲載入', await L.wait_loaded(pg))
    await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
    d = await pg.evaluate("STORY.dayOfKey('2025-09-22')")
    print(f'【前置／捷徑】{tag}：讀檔到 9/22 週一 22:00 校園（day {d}），PHONE.postAt 放四則訊息', flush=True)
    await L.load_state(pg, {'zone': 'campus', 'hour': 22.0, 'day': d, 'weekday': 1, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': 30, 'z': -60, 'yaw': 0}}, quiet_events=True)
    for _ in range(60):
        if await pg.evaluate("!!(GAME.E&&GAME.E.zone&&GAME.E.player&&!(GAME.isEntering&&GAME.isEntering()))"): break
        await pg.wait_for_timeout(1000)
    await pg.evaluate(POST); await pg.wait_for_timeout(1500); await L.close_panels(pg, cdp)
    r0 = await msgs(pg, cdp); order0 = [r['th'] for r in r0]
    print(f'  {tag} 原本的順序：{order0}', flush=True)
    check(f'{tag} ① 原本：照最新一則排（語彤、可昕、芷若、以安），沒有 ★', order0[:4] == ['p:heroine_03', 'p:kexin', 'p:heroine_02', 'p:heroine_01'] and not any(r['star'] for r in r0), json.dumps(r0[:6], ensure_ascii=False))
    await pg.screenshot(path=os.path.join(OUT, f'{tag}_1_before.png'))
    # ① 對話表頭的星號
    await tapq(pg, cdp, "document.querySelector('#phoneBody [data-th=\"p:heroine_01\"]')")
    hb = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .thHead [data-fav]'); if(!e) return null; const r=e.getBoundingClientRect(); return {t:e.textContent,w:r.width,h:r.height,in:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}; })()")
    check(f'{tag} ① 對話表頭有 ☆，44px 以上、在畫面裡', bool(hb) and hb['t'] == '☆' and hb['w'] >= 44 and hb['h'] >= 44 and hb['in'], json.dumps(hb, ensure_ascii=False))
    await tapq(pg, cdp, "document.querySelector('#phoneBody .thHead [data-fav]')")
    t1 = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .thHead [data-fav]'); return e&&e.textContent; })()")
    check(f'{tag} ① 點 ☆：變 ★、G.phone.fav 有以安', t1 == '★' and await pg.evaluate("GAME.G.phone.fav.includes('p:heroine_01')"), str(t1))
    await tapq(pg, cdp, "document.querySelector('#phoneBody [data-thback]')")
    r1 = await pg.evaluate(ROWS)
    check(f'{tag} ① 列表：以安（訊息最舊）到最上面、名字前有 ★，其他的照原本順序', [r['th'] for r in r1][:4] == ['p:heroine_01', 'p:heroine_03', 'p:kexin', 'p:heroine_02'] and r1[0]['star'] and not any(r['star'] for r in r1[1:]), json.dumps(r1[:5], ensure_ascii=False))
    await pg.evaluate("document.getElementById('phoneBody').scrollTop=0"); await pg.screenshot(path=os.path.join(OUT, f'{tag}_2_fav1.png'))
    # ② 朋友頁再加兩個（芷若、可昕）
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(900)
    for th in ('p:heroine_02', 'p:kexin'):
        ok = await tapq(pg, cdp, "document.querySelector('#phoneBody [data-fav=\"%s\"]')" % th)
        check(f'{tag} ② 朋友頁有 {th} 的星號、點得到', ok)
    fav = await pg.evaluate("GAME.G.phone.fav.slice()")
    check(f'{tag} ② G.phone.fav 有三個', sorted(fav) == sorted(['p:heroine_01', 'p:heroine_02', 'p:kexin']), json.dumps(fav))
    await pg.screenshot(path=os.path.join(OUT, f'{tag}_3_friends.png'))
    r2 = await msgs(pg, cdp); o2 = [r['th'] for r in r2]
    check(f'{tag} ② 最愛三個在最上面、之間照最新一則（可昕、芷若、以安），接著語彤', o2[:4] == ['p:kexin', 'p:heroine_02', 'p:heroine_01', 'p:heroine_03'] and all(r['star'] for r in r2[:3]) and not any(r['star'] for r in r2[3:]), json.dumps(r2[:5], ensure_ascii=False))
    await pg.evaluate("document.getElementById('phoneBody').scrollTop=0"); await pg.screenshot(path=os.path.join(OUT, f'{tag}_4_fav3.png'))
    await L.close_panels(pg, cdp)
    # ③ 存檔 → 重新整理 → 讀檔
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(700)
    await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(600)
    await tapq(pg, cdp, "[...document.querySelectorAll('#saveSlots .btn')].find(b=>b.textContent==='存檔'&&b.closest('.item').textContent.startsWith('欄位 1'))")
    sv = await pg.evaluate("(JSON.parse(localStorage.getItem('fatiao3d_slot_1')||'null')||{}).phone")
    check(f'{tag} ③ 存到欄位 1，存檔裡有 phone.fav', bool(sv) and len(sv.get('fav') or []) == 3, json.dumps(sv and sv.get('fav')))
    await pg.reload()
    for _ in range(240):
        if await pg.evaluate("document.getElementById('loading').classList.contains('hide')&&(typeof GAME==='undefined'||!GAME.charsAllP||!!GAME.charsAll)"): break
        await pg.wait_for_timeout(500)
    await pg.evaluate("STORY.phoneAuto=()=>{}")
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(800)
    await tapq(pg, cdp, "(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(i=>i.textContent.startsWith('欄位 1')); return it&&it.querySelector('.btn.pri'); })()")
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    fav3 = await pg.evaluate("(GAME.G.phone&&GAME.G.phone.fav||[]).slice()")
    check(f'{tag} ③ 讀檔以後 G.phone.fav 還是三個', sorted(fav3) == sorted(fav), json.dumps(fav3))
    r3 = await msgs(pg, cdp)
    check(f'{tag} ③ 讀檔以後列表還是置頂（和存檔前一樣）', [r['th'] for r in r3][:4] == o2[:4] and all(r['star'] for r in r3[:3]), json.dumps(r3[:5], ensure_ascii=False))
    await pg.evaluate("document.getElementById('phoneBody').scrollTop=0"); await pg.screenshot(path=os.path.join(OUT, f'{tag}_5_after_load.png'))
    # ④ 取消：以安從對話表頭、另外兩個從朋友頁
    await tapq(pg, cdp, "document.querySelector('#phoneBody [data-th=\"p:heroine_01\"]')")
    await tapq(pg, cdp, "document.querySelector('#phoneBody .thHead [data-fav]')")
    t4 = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .thHead [data-fav]'); return e&&e.textContent; })()")
    check(f'{tag} ④ 對話表頭再點一次：變回 ☆', t4 == '☆', str(t4))
    await tapq(pg, cdp, "document.querySelector('#phoneBody [data-thback]')")
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(900)
    for th in ('p:heroine_02', 'p:kexin'):
        await tapq(pg, cdp, "document.querySelector('#phoneBody [data-fav=\"%s\"]')" % th)
    fav4 = await pg.evaluate("GAME.G.phone.fav.slice()")
    check(f'{tag} ④ 全部取消：G.phone.fav 是空的', fav4 == [], json.dumps(fav4))
    r4 = await msgs(pg, cdp)
    check(f'{tag} ④ 列表回到原本的順序、沒有 ★', [r['th'] for r in r4][:len(order0)] == order0 and not any(r['star'] for r in r4), json.dumps(r4[:5], ensure_ascii=False))
    await pg.evaluate("document.getElementById('phoneBody').scrollTop=0"); await pg.screenshot(path=os.path.join(OUT, f'{tag}_6_unfav.png'))
    check(f'{tag} 沒有 JS 例外', not errs, '；'.join(errs[:3]))
    await b.close()

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for o in ORIENTS: await one(p, o, o == 'land')
    print('ALL PASS' if not fails else 'FAILED %d: %s' % (len(fails), ', '.join(fails[:6])), flush=True)
    sys.exit(1 if fails else 0)
asyncio.run(main())
