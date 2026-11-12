"""CC-C 11-12：手機橫向左上角 HUD 擋畫面（使用者 2026-11-12「手機上玩 左上角的那幾個都快擋住一半」；修正 f701afca02 index.html CSS；LAWWW-C 12:07 P1 插隊，結果給 BB、LAWWW）。Playwright 觸控模擬（PC）≠ iPhone。
做法：【前置／捷徑】讀檔到溫州街 9/26（五）16:16（條件事件關掉）→ 每一種畫面大小（SIZES：橫向 844×390、740×340、932×430，直向 390×844）：
  ① 原樣（等 2 秒）、② 導引那一條（#guide）反過來（原本有就【捷徑】藏起來、原本沒有就【捷徑】放「點右上角的小地圖：看認識的人現在在哪」）——兩種各拍整個畫面一張；
  記：畫面寬高、#hud 外框（bottom／畫面高的比例）、四條（#clock、#goal、#nextClass、#guide）各自的 rect 和字、有沒有和右上角（#hudR）或小地圖（#minimap）重疊、
  目標那一條字有沒有被切（scrollWidth > clientWidth）、切在哪（看得到的字數估計）。
  LIVE_URL＝線上版（修改前 v9.10.25）同樣拍。
CC_02 清單 2026-11-12：1✓（9/26 16:16 照 LAWWW 給的狀態） 2✓（元素照 id 從畫面讀） 3✓（每一種大小同一個存檔、重設大小後等 1.5 秒） 4n/a（不按按鈕） 5n/a（不走路） 6✓（等版面穩） 7✓ 8n/a（不判，給 BB） 9n/a（整個畫面原樣） 10✓（條件事件關掉） 11✓ 12✓（每種大小同樣欄位） 13✓（讀檔、導引那一條顯示／藏起來是捷徑，標）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|live [LIVE_URL=https://…/index.html] [SIZES=844x390,740x340,932x430,390x844] python3 cc_hud_land_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
if os.environ.get('LIVE_URL'): URL = os.environ['LIVE_URL']
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'new'
SIZES = [tuple(int(v) for v in s.split('x')) for s in (os.environ.get('SIZES') or '844x390,740x340,932x430,390x844').split(',') if 'x' in s]
R = L.Run('hud_land_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
MEASURE = r"""(()=>{ const q=id=>document.getElementById(id), rc=e=>{ if(!e||e.offsetParent===null&&getComputedStyle(e).position!=='fixed') return null; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null; };
  const ov=(a,b)=>!!a&&!!b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];
  const hud=q('hud'), H=innerHeight, W=innerWidth, right=[rc(q('hudR')),rc(q('minimap'))].concat([...document.querySelectorAll('#hudR .ibtn, #hudR button')].map(rc)).filter(Boolean);
  const lines={}; for(const id of ['clock','goal','nextClass','guide']){ const e=q(id); const r=rc(e); const cs=e?getComputedStyle(e):null;
    lines[id]={rect:r, hidden:!e||e.classList.contains('hide')||!r, text:e?(e.textContent||'').trim():'', cut:!!e&&r&&e.scrollWidth>e.clientWidth+1, sw:e?e.scrollWidth:null, cw:e?e.clientWidth:null, lines:r&&cs?Math.round((r[3]-r[1])/(parseFloat(cs.lineHeight)||16)):null,
      overlapRight:!!r&&right.some(x=>ov(r,x))}; }
  const hr=rc(hud); return {W, H, land:W>H, hud:hr, hudBottomPct:hr?Math.round(hr[3]/H*100):null, hudAreaPct:hr?Math.round((hr[2]-hr[0])*(hr[3]-hr[1])/(W*H)*100):null, right, lines,
    anyOverlap:Object.values(lines).some(x=>x.overlapRight), ver:(document.getElementById('ver')||document.querySelector('.ver')||{}).textContent||''}; })()"""
GUIDE_FLIP = r"""(()=>{ const g=document.getElementById('guide'); if(!g) return 'no #guide'; if(g.classList.contains('hide')||!(g.textContent||'').trim()){ g.textContent='點右上角的小地圖：看認識的人現在在哪'; g.classList.remove('hide'); return 'shown'; } g.classList.add('hide'); return 'hidden'; })()"""


async def main():
    print('CC 手機橫向 HUD：TAG %s；SHA %s；URL %s；SIZES %s' % (TAG, SHA or '?', URL, SIZES), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'url': URL, 'shots': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        s = await D.load_zone(pg, cdp, 'wenzhou', '2025-09-26', 16 + 16 / 60, wait=7000)
        R.setup('【前置／捷徑】讀檔到溫州街 2025-09-26 16:16（條件事件關掉）：%s' % J(s))
        for (w, h) in SIZES:
            await pg.set_viewport_size({'width': w, 'height': h}); await pg.wait_for_timeout(1500)
            for state in ('asis', 'flip'):
                how = 'as-is'
                if state == 'flip': how = await pg.evaluate(GUIDE_FLIP); await pg.wait_for_timeout(600)
                m = await pg.evaluate(MEASURE); name = 'hud_%s_%dx%d_%s.png' % (TAG, w, h, state)
                await pg.screenshot(path=os.path.join(OUT, name))
                res['shots'].append({'size': [w, h], 'state': state, 'how': how, 'm': m, 'png': name})
                R.note('[%dx%d %s%s] #hud %s（底在畫面 %s%%、佔畫面 %s%%）；四條 %s；和右上角／小地圖重疊 %s' % (w, h, state, '' if state == 'asis' else '（導引那一條【捷徑】%s）' % how, m['hud'], m['hudBottomPct'], m['hudAreaPct'],
                       J({k: {'rect': v['rect'], 'hidden': v['hidden'], 'cut': v['cut'], 'lines': v['lines'], 'overlap': v['overlapRight'], 'text': v['text'][:40]} for k, v in m['lines'].items()}), m['anyOverlap']))
                if state == 'flip': await pg.evaluate(GUIDE_FLIP); await pg.wait_for_timeout(300)   # 還原
                R.check('[%dx%d %s] 左上角不和右上角按鈕／小地圖重疊' % (w, h, state), not m['anyOverlap'], J(m['right']))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'hud_land_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
