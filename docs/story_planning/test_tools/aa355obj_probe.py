"""BB（帳號 A）2026-10-21：BB-TEST-AA355-358-1021 的 AA_355 5-1（十個「看」物件的旁白）＋1-3 滇香小館織布。
[捷徑] GAME.enter 到那一間（12:00）；之後真的操作：走到物件旁邊、按互動鈕「看……」，讀出現的旁白，和 AA_355 表格一字一字比。
不是 iPhone：Playwright 手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests python3 aa355obj_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
CASES = [   # 區域、互動點名字要有的字、旁白
    ('l118_self', '湯', '（自取的湯，今天是蘿蔔湯。鍋邊貼著「請自取，不要浪費」。）'),
    ('l118_home', '湯', '（湯桶上寫著「紫菜蛋花」。湯勺掛在桶邊。）'),
    ('l118_cafe2', '書', '（書架上大多是舊漫畫，有幾套缺了第一集。）'),
    ('l118_korea', '小菜', '（小菜櫃裡有海帶、豆干、滷蛋。豆干只剩兩塊。）'),
    ('l118_noodle2', '小菜', '（小菜櫃的玻璃起霧了，看得到裡面的燙青菜。）'),
    ('l118_dian', '織', '（牆上掛著一塊條紋織布，紅色和深藍色，顏色洗得有點淡了。）'),
    ('wancai_sema', '書櫃', '（書櫃裡是歷屆的研究所論文，有些書背的字已經褪色了。）'),
    ('wancai_sema', '登記', '（借用登記表夾在門邊。今天下午那一格，已經有人寫了名字。）'),
    ('linze_202', '黑板', '（黑板角落寫著「下週停課」，不知道是哪一堂的。）'),
    ('linze_202', '公告', '（公告欄上貼著獎學金、徵才、讀書會的傳單，最上面那張一直被風吹起來。）'),
    ('wancai_multi', '公告', '（公告欄上只剩一張場地借用規則，四個角都用膠帶補過。）'),
]


async def enter(pg, z, h):
    ok = await pg.evaluate("(async(z,h)=>{ if(!Z3.ZONES[z]) return false; GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); return true; })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(9000); return ok


async def main():
    run = L.Run('aa355obj', OUT); base = json.load(open(SAVE, encoding='utf-8')); res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base), quiet_events=True); await pg.wait_for_timeout(5000); run.setup('讀 9/25 存檔（關掉條件事件，只看物件）')
        cur = None
        for z, kw, want in CASES:
            if z != cur:
                ok = await enter(pg, z, 12.0); cur = z; run.setup('[捷徑] GAME.enter(%s) 12:00 → %s' % (z, ok))
                if not ok: res.append((z, kw, False, '沒有這個區域')); continue
            its = await pg.evaluate("(k=>(GAME.E.interactables||[]).filter(i=>!i.hidden&&(i.label||'').includes(k)).map(i=>[i.x,i.z,i.label]))(%s)" % json.dumps(kw))
            print('   %s「%s」的互動點：%s' % (z, kw, json.dumps(its, ensure_ascii=False)), flush=True)
            if not its: res.append((z, kw, False, '找不到互動點')); continue
            got = ''
            for x, zz, lab in its[:2]:
                await L.go_to(pg, cdp, run, x, zz, 0.9, lab, max_s=60)
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
                for k in range(6):
                    s = await L.state(pg)
                    if s['dlg']:
                        got = await pg.evaluate("(GAME.D&&GAME.D.full)||''"); await run.shot(pg, '%s_%s' % (z, kw)); break
                    if s['choices']:   # 看之前有選單（例：看／坐）就選「看」
                        c = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>/看/.test(b.textContent)); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                        if c: await L.touch_tap(cdp, c[0], c[1])
                    await pg.wait_for_timeout(900)
                for k in range(8):
                    if not (await L.state(pg))['dlg']: break
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
                if got: break
            ok = got.strip() == want
            print('   %s %s：%s「%s」' % ('PASS' if ok else 'FAIL', z, kw, got), flush=True)
            res.append((z, kw, ok, got))
        json.dump(res, open(os.path.join(OUT, 'aa355obj.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        bad = [r for r in res if not r[2]]
        run.check('AA_355 5-1／1-3：旁白和表格一字不差（%d 個）' % len(res), not bad, json.dumps(bad, ensure_ascii=False)[:600])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
