"""BB：BUG-KX-NCCU-1018（經濟系那年可昕寫「在台大」，2025-02 起「家裡」）＋BUG-DORM-AFTER-MOVEOUT-1018（10/19 退宿以後手機「地點」沒有宿舍、最上面「回臺北的家」）。
A [前置] 讀新遊戲玩到 9/1 的存檔（9/2 07:01 宿舍）：手機「朋友」、大地圖，看可昕那一行。
B [前置／捷徑] 讀檔到 2024-10-20 10:00 在臺北的家（退宿後，flow_v0_home 同一組旗標）：手機「地點」清單、「朋友」可昕。
C [前置／捷徑] 同一組旗標讀檔到 2025-02-20：「朋友」可昕。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; SAVE = sys.argv[3]
async def tab(pg, cdp, name):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(n=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+n+'\"]'); if(b) b.click(); })(%s)" % json.dumps(name)); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.querySelector('#phoneBody')||{}).innerText||''")
async def close(pg, cdp):
    if not await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
def kx_line(t):
    ls=[l for l in t.split('\n') if l.strip()]
    for i,l in enumerate(ls):
        if '可昕' in l: return ls[i:i+4]
    return []
async def drain(pg, cdp):
    for _ in range(40):
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)
        else: return s
async def main():
    run = L.Run('kxmap_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + '?nofastecon'); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('A 讀 9/2 07:01 宿舍的存檔（網址加 ?nofastecon：只為了停在讀檔那一刻，不讓事件模式自動跳走）'); await pg.wait_for_timeout(3500); await drain(pg, cdp)
        t = await tab(pg, cdp, 'friends'); a = kx_line(t); print('A 朋友：', a); await run.shot(pg, 'A_friends')
        await close(pg, cdp); await L.tap(pg, cdp, '#btnBigMap'); await pg.wait_for_timeout(1500)
        mt = await pg.evaluate("document.body.innerText"); am = [l for l in mt.split('\n') if '可昕' in l][:3]; print('A 大地圖：', am); await run.shot(pg, 'A_bigmap')
        run.check('A 經濟系 9/2：可昕寫在台大、沒有「政大」', any('台大' in x or '臺大' in x for x in a + am) and not any('政大' in x for x in a + am), json.dumps(a + am, ensure_ascii=False))
        await L.close_panels(pg, cdp)
        BASEF = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17', 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 10, 'Y0_STICKY': True}
        for tag, key, h in (('B', '2024-10-20', 10), ('D', '2024-10-21', 15), ('C', '2025-02-20', 10)):
            d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % d)
            st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': wd, 'hour': h, 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57}, 'home': {'at': tag != 'D', 'base': True, 'day': d},
                  'contacts': {k: d - 40 for k in ['kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu']}, 'flags': dict(BASEF),
                  'events': {'done': {'ev_y0_e30': 1, 'ev_y0_a3': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1, 'ev_y0_e30_note': 1}, 'last': {}, 'count': 5}}
            run.setup('%s 讀檔到 %s %02d:00 在臺北的家（退宿後、和可昕交往中）' % (tag, key, h)); await L.load_state(pg, st); await pg.wait_for_timeout(3000); await drain(pg, cdp)
            pl = await tab(pg, cdp, 'places'); print(tag, '地點：', pl.replace('\n', '｜')[:400]); await run.shot(pg, tag + '_places')
            fr = await tab(pg, cdp, 'friends'); k = kx_line(fr); print(tag, '朋友：', k); await run.shot(pg, tag + '_friends'); await close(pg, cdp)
            if tag == 'D':
                lines = [x for x in pl.split('\n') if x.strip()]
                run.check('D 退宿後人在校園：地點沒有宿舍、最上面有「回臺北的家」', not any('宿舍' in x for x in lines) and any('回臺北的家' in x for x in lines[:5]), json.dumps(lines[:6], ensure_ascii=False))
            elif tag == 'B':
                lines = [x for x in pl.split('\n') if x.strip()]
                run.check('B 退宿後手機「地點」沒有宿舍', not any('宿舍' in x for x in lines), json.dumps(lines[:12], ensure_ascii=False))
                run.check('B 10/20 可昕寫在台大、沒有「政大」', any('台大' in x or '臺大' in x for x in k) and not any('政大' in x for x in k), json.dumps(k, ensure_ascii=False))
            else:
                run.check('C 2025-02-20 可昕寫在家裡、沒有「政大」', any('家' in x for x in k) and not any('政大' in x for x in k), json.dumps(k, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
