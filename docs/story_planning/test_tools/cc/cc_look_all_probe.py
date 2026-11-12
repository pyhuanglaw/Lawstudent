"""CC-C 11-12：通用「一個區域裡某一類互動點全部走過去、各按一次、記下整段字」探針（第一個用途：花序 14 個「看」、禮貌生財前半三個「看」；LAWWW-C 11:22 交排 de8d72d279，範圍照 BB）。結果給 BB 判。Playwright（PC GPU）≠ iPhone。
做法：每一組 CASES（日期@時間，+ 分隔）：【前置／捷徑】讀檔到 ZONE 那天那個時間（條件事件關掉；FLAGS 設旗標）→ 照 SEL 從 E.interactables 挑（SEL=屬性名＝那個屬性有值；SEL=屬性:值1/值2＝屬性等於其中一個（用 / 分：佇列的欄位是用 | 分的））→
  每一個：真的走過去（go_to，含上下樓 lv）→ 記互動鍵的字 → 按 → 一句一句點（選單選第 1 個、全部記）→ 第一句截圖、按完截圖。
CC_02 清單 2026-11-12：1✓（日期時間照佇列：營業中） 2✓（互動點照屬性從遊戲找，不寫座標） 3✓（每一組重新讀檔） 4✓（選項選第 1 個、全部記下） 5✓（go_to 走過去） 6✓（讀檔等 7 秒、一句一句點） 7✓ 8n/a（不判，字給 BB） 9n/a（截圖不藏東西） 10✓（條件事件關掉） 11✓ 12✓（每個點同樣欄位） 13✓（讀檔、旗標捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> ZONE=flower_notes SEL=fnLook CASES=2025-10-14@14 [FLAGS=LM_KNOWN:1,X:abc] python3 cc_look_all_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'x'
ZONE = os.environ.get('ZONE') or 'flower_notes'; SEL = os.environ.get('SEL') or 'fnLook'
CASES = [c.split('@') for c in (os.environ.get('CASES') or '2025-10-14@14').replace(';', '+').split('+') if c]
FLAGS = {}
for kv in (os.environ.get('FLAGS') or '').split(','):
    if ':' in kv:
        k, v = kv.split(':', 1); FLAGS[k] = True if v == '1' else (False if v == '0' else v)
R = L.Run('lookall_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||'',
  toast:(document.getElementById('toast')||{}).textContent||''}; })()"""
PICK = r"""(s=>{ const [k,v]=s.split(':'); const vs=v?v.split('/'):null; return GAME.E.interactables.map((i,ix)=>({i,ix})).filter(({i})=>vs?vs.includes(String(i[k])):!!i[k])
  .map(({i,ix})=>({ix, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:i.lv|0, r:i.radius||null, label:i.label||'', key:String(i[k]), hidden:!!i.hidden})); })"""


async def press(pg, cdp, tag, n, k):
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    lines, toasts = [], []
    for j in range(60):
        st = await pg.evaluate(ST)
        if st['toast'] and st['toast'] not in toasts: toasts.append(st['toast'])
        if st['choices']:
            lines.append('▶ ' + st['choices'][0] + '（選單 ' + ' / '.join(st['choices']) + '）')
            await pg.screenshot(path=os.path.join(OUT, 'look_%s_%d_%02d_menu.png' % (TAG, n, k)))
            await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(800); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln:
                lines.append(ln)
                if len(lines) == 1: await pg.screenshot(path=os.path.join(OUT, 'look_%s_%d_%02d.png' % (TAG, n, k)))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 12: break   # CC-C 12:4x：花序的「看」是 toast（GM.toast(it.look,4600)）——舊版 1.5 秒就走，toast 還沒換成看的那一句；等滿 6 秒收所有 toast
        await pg.wait_for_timeout(500)
    return lines, toasts


async def main():
    print('CC 全部的看：TAG %s；SHA %s；ZONE %s；SEL %s；CASES %s；FLAGS %s' % (TAG, SHA or '?', ZONE, SEL, CASES, FLAGS), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for n, (day, hh) in enumerate(CASES):
            tag = '[%s %s]' % (day, hh)
            s = await D.load_zone(pg, cdp, ZONE, day, float(hh), wait=7000)
            if FLAGS: await pg.evaluate("(f=>{ Object.assign(GAME.G.flags,f); })", FLAGS)
            hz = await pg.evaluate("(()=>{ try{ if(typeof HINTS!=='undefined'){ HINTS.on=false; if(HINTS._pending) HINTS._pending.length=0; } const t=document.getElementById('toast'); if(t) t.classList.remove('show'); return true; }catch(e){ return String(e); } })()")
            R.setup('%s 【捷徑】關掉新手提示（HINTS.on=false）：%s——花序的「看」用同一個 toast，提示佔著會蓋掉' % (tag, hz))
            R.setup('%s 【前置／捷徑】讀檔到 %s %s %s（條件事件關掉）；旗標 %s' % (tag, ZONE, day, hh, J(FLAGS)))
            if not R.check('%s 讀到 %s' % (tag, ZONE), s['zone'] == ZONE, J(s)): continue
            pts = await pg.evaluate(PICK, SEL)
            R.note('%s 照 SEL=%s 挑到 %d 個：%s' % (tag, SEL, len(pts), J(pts)))
            if not R.check('%s 挑得到互動點' % tag, bool(pts), J(await pg.evaluate("GAME.E.interactables.map(i=>i.label)"))): continue
            out = []
            for k, it in enumerate(pts):
                t2 = '%s #%d「%s」' % (tag, k, it['label'])
                await L.go_to(pg, cdp, R, it['x'], it['z'], 0.6, it['label'], max_s=90, lv=it['lv'])
                await pg.wait_for_timeout(500)
                st = await pg.evaluate(ST)
                near = await pg.evaluate("(ix=>{ const i=GAME.E.interactables[ix], p=GAME.E.player.obj.position; return {d:+Math.hypot(p.x-i.x,p.z-i.z).toFixed(2), lv:GAME.E.player.lv|0}; })", it['ix'])
                if st['interact'] and it['label'] and it['label'] not in st['interact']:
                    R.note('%s 互動鍵是「%s」不是這個點，再靠近一點' % (t2, st['interact']))
                    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, it['label'], max_s=40, lv=it['lv']); st = await pg.evaluate(ST)
                lines, toasts = await press(pg, cdp, tag, n, k)
                await pg.screenshot(path=os.path.join(OUT, 'look_%s_%d_%02d_end.png' % (TAG, n, k)))
                rec = {'pt': it, 'interact': st['interact'], 'near': near, 'lines': lines, 'toasts': toasts}; out.append(rec)
                R.note('%s 互動鍵「%s」（離點 %s m、lv %s）→ %s；toast %s' % (t2, st['interact'], near['d'], near['lv'], J(lines), J(toasts)))
                R.check('%s 互動鍵對到這個點、按了有字' % t2, it['label'] in st['interact'] and bool(lines or toasts), J([st['interact'], lines]))
            res['cases'].append({'day': day, 'h': hh, 'points': out})
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'lookall_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
