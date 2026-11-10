"""CC（帳號 A）11-10：XS-DOOR-LABELS-1110（LAWWW 13:02 ①、BB 13:03：新生南路每一家都列出來，格式不對的標出來）。
改後 8d8b475dc（5bc4d0379 接 LAWWW2 7bedf7d51），改前 74da28ca9（舊的「進山嵐書店（書店（兩層））」）。
程式依據：tests/xs_door_labels_unit.js——每一間的店門字＝「進」＋店名＋「（」＋種類拿掉括號裡那段＋「）」，不能括號套括號。
做法：
  【前置／捷徑】load_zone 讀檔到 xinsheng 出生點（側門）2025-10-18 14:00，條件事件關掉。
  先列出 XINSHENG_LAYOUT.shops 每一間：店名、種類、遊戲的店門互動點（label、位置）、照規則算出來應該是的字。
  再像玩家：L.go_to 點地面走到每一間店門互動點（0.6 m 內，walkFallbacks 不能加），讀畫面上的互動按鈕 #interact 的字，截圖。
判定（每一間）：①找得到店門 ②按鈕的字和規則一樣 ③沒有括號套括號 ④按鈕字和 interactables 的 label 一樣。
Playwright 手機模擬（844×390）≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_xs_door_labels_probe.py <url> <out>"""
import os, sys, json, asyncio, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
R = L.Run('xs_door_labels_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
LIST = r"""(()=>{ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null; if(!XL) return null; const its=GAME.E.interactables||[];
  return XL.shops.map(q=>{ const want='進'+q.name+'（'+String(q.type).replace(/（[^（）]*）/g,'')+'）';
    const it=its.find(i=>typeof i.label==='string'&&i.label.replace(/^進/,'').startsWith(q.name+'（'))||its.find(i=>typeof i.label==='string'&&i.label.indexOf(q.name)>=0&&i.exit);
    return {name:q.name, type:q.type, want, label:it?it.label:null, x:it?+it.x.toFixed(2):null, z:it?+it.z.toFixed(2):null, lv:it?(it.lv|0):0}; }); })()"""
UI = """(()=>{ const ib=document.getElementById('interact'); const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none');
  const P=GAME.E.player.obj.position; return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), fb:GAME.walkFallbacks|0, interact:vis(ib)?(ib.innerText||'').trim():''}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 新生南路店門標籤：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 xinsheng 出生點（側門）2025-10-18 14:00，條件事件關掉')
        s = await D.load_zone(pg, cdp, 'xinsheng', '2025-10-18', 14.0, wait=9000)
        if not R.check('在新生南路', s.get('zone') == 'xinsheng', J(s)): await b.close(); return
        shops = await pg.evaluate(LIST)
        if not R.check('有 XINSHENG_LAYOUT.shops', bool(shops), ''): await b.close(); return
        R.note('店：%s' % J(shops))
        for q in shops:
            tag = '[%s]' % q['name']; row = dict(q)
            if not R.check('%s 找得到店門互動點' % tag, q['label'] is not None, J(q)): row['bad'] = '找不到店門'; rows.append(row); continue
            u0 = await pg.evaluate(UI)
            ok = await L.go_to(pg, cdp, R, q['x'], q['z'], 0.6, '%s 走到店門 (%s, %s)' % (tag, q['x'], q['z']), max_s=180, lv=q['lv'])
            await pg.wait_for_timeout(1200); u = await pg.evaluate(UI)
            for _ in range(6):
                if u['interact']: break
                await pg.wait_for_timeout(500); u = await pg.evaluate(UI)
            await pg.screenshot(path=os.path.join(OUT, 'door_%s_%02d.png' % (TAG, len(rows) + 1)))
            row.update({'button': u['interact'], 'walked': bool(ok) and u['fb'] == u0['fb']})
            nested = bool(re.search(r'（[^）]*（', u['interact'] or q['label']))
            R.check('%s 真的走到店門（walkFallbacks 沒加）' % tag, row['walked'], J(u))
            R.check('%s 按鈕的字＝「%s」' % (tag, q['want']), u['interact'] == q['want'], J({'button': u['interact'], 'label': q['label']}))
            R.check('%s 沒有括號套括號' % tag, not nested, u['interact'] or q['label'])
            R.check('%s 按鈕字和互動點 label 一樣' % tag, u['interact'] == q['label'], J({'button': u['interact'], 'label': q['label']}))
            row['bad'] = '' if (u['interact'] == q['want'] and not nested) else ('括號套括號' if nested else '格式不對')
            rows.append(row)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rows, open(os.path.join(OUT, 'door_labels_%s.json' % TAG), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('  表（店名｜種類｜按鈕上的字｜應該是｜標記）：', flush=True)
    for r in rows: print('   %s｜%s｜%s｜%s｜%s' % (r['name'], r['type'], r.get('button') or r.get('label'), r['want'], ('★' + r['bad']) if r.get('bad') else 'OK'), flush=True)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
