"""BB（帳號 A）2026-10-21：BUG-CAMP-CUT-1018／X09（LAWWW 2cd8cf5a，使用者 10-18「去宿營前一秒還在椰林大道」）——宿營開頭不再露出 3D。
從標題開新遊戲（經濟系「從經濟系開始」、直接「從法律系開始」各一次），對話點過去、選項選第一個，一路到宿營第一天的活動；
每 0.7 秒看一次畫面上半部中間是什麼（3D 畫布／2D 背景／黑幕／字卡），存一張小圖；最後拼成縮圖總表給人看。
判斷：宿營開場（字卡、遊覽車）到第一個活動之間，畫面中間不應該是 3D 畫布（canvas）。
不是 iPhone 實機：Playwright 手機橫向模擬、?turbo。用法：LW_TESTS=<開發分支>/tests python3 campcut_probe.py '<URL>/index.html?turbo' <輸出資料夾>（ONLY=econ 或 law）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
URL, OUT = sys.argv[1], sys.argv[2]
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
TOP = """(()=>{ const x=innerWidth/2, y=innerHeight*0.32; const e=document.elementFromPoint(x,y); const f=document.getElementById('fade');
  let G=null; try{ G=GAME.G; }catch(err){}
  return {top:e?(e.id||String(e.className||'').slice(0,30)||e.tagName):'', tag:e?e.tagName:'', fade:f?+getComputedStyle(f).opacity:null, adv:!!(typeof ADV!=='undefined'&&ADV.active),
    d:G?CALENDAR.dateOf(G.day).key:'', h:G?+(+G.hour).toFixed(2):0, zone:G?G.zone:'', dlg:((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,24),
    card:((document.getElementById('titleCard')||document.getElementById('tcard')||{}).textContent||'').trim().slice(0,24)}; })()"""


async def one(p, run, mode):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    btn = '#btnNew' if mode == 'econ' else '#btnNewLaw'
    await L.tap(pg, cdp, btn); run.setup('%s：標題按 %s（新遊戲，不改狀態）' % (mode, btn))
    frames = []; t0 = time.time(); k = 0; seen_camp = False; acts = 0
    while time.time() - t0 < 420:
        r = await pg.evaluate(TOP); r['rt'] = round(time.time() - t0, 1)
        fn = os.path.join(OUT, '%s_%03d.png' % (mode, k)); await pg.screenshot(path=fn); r['f'] = fn; frames.append(r); k += 1
        txt = (r['dlg'] or '') + (r['card'] or '')
        if '宿營' in txt or '遊覽車' in txt: seen_camp = True
        if seen_camp and r['d'] and ((mode == 'econ' and r['d'] >= '2024-08-24') or (mode == 'law' and r['d'] >= '2025-08-23')): break
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const e=document.querySelectorAll('#choices button')[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); acts += 1
        elif s['dlg']: await L.tap(pg, cdp, '#dlg'); acts += 1
        await pg.wait_for_timeout(700)
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return frames, errs, seen_camp


def sheet(frames, out, per=24, w=240):
    files = []
    for s in range(0, len(frames), per):
        ch = frames[s:s + per]; cols = 6; rows = (len(ch) + cols - 1) // cols
        im0 = Image.open(ch[0]['f']); h = int(im0.height * w / im0.width)
        sh = Image.new('RGB', (cols * w, rows * (h + 18)), (20, 20, 20)); d = ImageDraw.Draw(sh)
        for i, fr in enumerate(ch):
            x, y = (i % cols) * w, (i // cols) * (h + 18)
            sh.paste(Image.open(fr['f']).convert('RGB').resize((w, h)), (x, y + 18))
            d.text((x + 2, y + 2), '%s %s %.1f %s' % (fr['rt'], fr['d'][5:], fr['h'], fr['tag']), fill=(255, 255, 0) if fr['tag'] == 'CANVAS' else (200, 200, 200))
        fn = out.replace('.png', '_%d.png' % (s // per + 1)); sh.save(fn); files.append(fn)
    return files


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('campcut', OUT); res = {}
    async with async_playwright() as p:
        for mode in ('econ', 'law'):
            if ONLY and mode not in ONLY: continue
            frames, errs, seen = await one(p, run, mode)
            # 宿營開場的範圍：第一張提到宿營／遊覽車的那一格 → 最後一格；那之間畫面中間是 3D 畫布的格子
            i0 = next((i for i, f in enumerate(frames) if '宿營' in (f['dlg'] + f['card']) or '遊覽車' in (f['dlg'] + f['card'])), None)
            cv = [f for f in (frames[i0:] if i0 is not None else []) if f['tag'] == 'CANVAS' and (f['fade'] is None or f['fade'] < 0.5)]
            files = sheet(frames, os.path.join(OUT, '%s_sheet.png' % mode))
            for f in frames[:]:
                if f['tag'] != 'CANVAS' and f not in frames[:3]:
                    try: os.remove(f['f'])
                    except Exception: pass
            res[mode] = {'frames': len(frames), 'camp_from': i0, 'canvas_in_camp': [(f['rt'], f['d'], f['h'], f['dlg']) for f in cv], 'sheets': files}
            print('%s：%d 格；宿營從第 %s 格起；之後畫面中間是 3D 畫布的 %d 格 %s' % (mode, len(frames), i0, len(cv), [(f['rt'], f['d'], f['h'], f['dlg'][:10]) for f in cv[:6]]), flush=True)
            run.check('%s：宿營開場到第一天的活動之間，畫面中間沒有露出 3D（%d 格）' % (mode, len(cv)), seen and not cv, json.dumps(res[mode]['canvas_in_camp'][:4], ensure_ascii=False))
            run.check('%s：沒有 JS 例外' % mode, not errs, json.dumps(errs[:3], ensure_ascii=False))
    json.dump(res, open(os.path.join(OUT, 'campcut.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
