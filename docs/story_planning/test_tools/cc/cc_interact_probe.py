"""CC-C 11-12：通用「走到互動點、按一次、記下整段字」探針（第一個用途：CLUB-BOARD-INFO-1105 日常失速東牆「看社團佈告欄」，LAWWW-C 10:20 交排，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
做法：每一組 CASES（日期@時間，+ 分隔）：【前置／捷徑】讀檔 FIX 到 ZONE 那天那個時間（條件事件關掉）→ 找標籤含 LABEL 的互動點 → 真的走過去（go_to）→ 看互動鍵的字 → 按 →
  一路點對話、選項照 PICK（逗號分隔的字，找第一個含那個字的選項；沒有就選第 1 個）→ 每一句旁白、每一次選單都記下來、選單出現時截圖、最後截圖。
CC_02 清單 2026-11-12：1✓（日期、時間照佇列：大一、大三上各一次） 2✓（互動點照標籤從遊戲找，不寫座標） 3✓（每一組重新讀檔） 4✓（選項照字選、記下全部選項） 5✓（go_to 走過去） 6✓（讀檔等 6 秒、一句一句點） 7✓ 8n/a（不判，字給 BB） 9n/a（截圖不藏東西） 10✓（條件事件關掉） 11✓ 12✓（每句、每個選單、互動鍵字） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> ZONE=wz_offbeat LABEL=社團佈告欄 CASES=2025-10-14@15+2027-09-14@15 [PICK=法律服務社,…] [FIX=…] python3 cc_interact_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'x'
ZONE = os.environ.get('ZONE') or 'wz_offbeat'; LABEL = os.environ.get('LABEL') or '社團佈告欄'
CASES = [c.split('@') for c in (os.environ.get('CASES') or '2025-10-14@15').replace(';', '+').split('+') if c]
PICK = [x for x in (os.environ.get('PICK') or '').split(',') if x]
R = L.Run('interact_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||''}; })()"""


async def main():
    print('CC 互動點：TAG %s；SHA %s；ZONE %s；LABEL %s；CASES %s' % (TAG, SHA or '?', ZONE, LABEL, CASES), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for n, (day, hh) in enumerate(CASES):
            tag = '[%s %s]' % (day, hh)
            s = await D.load_zone(pg, cdp, ZONE, day, float(hh), wait=7000)
            R.setup('%s 【前置／捷徑】讀檔到 %s %s %s（條件事件關掉）' % (tag, ZONE, day, hh))
            if not R.check('%s 讀到 %s' % (tag, ZONE), s['zone'] == ZONE, J(s)): continue
            it = await pg.evaluate("(l=>{ const i=GAME.E.interactables.find(q=>!q.hidden&&(q.label||'').indexOf(l)>=0); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })", LABEL)
            if not R.check('%s 找得到「%s」' % (tag, LABEL), bool(it), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>i.label)"))): continue
            await L.go_to(pg, cdp, R, it['x'], it['z'], 0.7, it['label'], max_s=90, lv=it['lv'])
            st = await pg.evaluate(ST)
            R.note('%s 互動鍵「%s」（互動點 %s）' % (tag, st['interact'], J(it)))
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            lines = []; menus = []
            for k in range(80):
                st = await pg.evaluate(ST)
                if st['choices']:
                    menus.append(st['choices']); await pg.screenshot(path=os.path.join(OUT, 'menu_%s_%d_%02d.png' % (TAG, n, len(menus))))
                    i = next((j for w in PICK for j, t in enumerate(st['choices']) if w in t), 0)
                    lines.append('▶ ' + st['choices'][i])
                    await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(800); continue
                if st['dlg']:
                    if not lines or lines[-1] != (st['who'] + '｜' + st['t']): lines.append(st['who'] + '｜' + st['t'])
                    if len(lines) == 1: await pg.screenshot(path=os.path.join(OUT, 'first_%s_%d.png' % (TAG, n)))
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                if not st['busy']: break
                await pg.wait_for_timeout(600)
            await pg.screenshot(path=os.path.join(OUT, 'end_%s_%d.png' % (TAG, n)))
            R.note('%s 整段（%d 句、%d 個選單）：%s' % (tag, len(lines), len(menus), J(lines)))
            R.note('%s 選單：%s' % (tag, J(menus)))
            R.check('%s 按了有字出來' % tag, bool(lines), '')
            res['cases'].append({'day': day, 'h': hh, 'it': it, 'lines': lines, 'menus': menus})
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'interact_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
