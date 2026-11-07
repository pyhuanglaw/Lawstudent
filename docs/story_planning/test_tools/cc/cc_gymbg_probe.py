"""CC-B（帳號 B）11-07：GYMBG_7921（BB-B 08:14；陪子晴去健身房那一場的對話畫面，79214e4e1）。
  背景 assets/bg/gym_b1_fitness.webp（LAWWW2-B 1c5696b4b，OUT.BG.gym_b1_fitness），AA_716 子晴故事線第 3 拍那一約（ARC_INV heroine_04:3，事件 ev_arcinv_heroine_04_3）。
  【前置／捷徑】讀檔到校園 19:00（條件事件關閉）→ 直接 EVENTS.run 那一場（不走手機約、排行程、出發）。
  直向（390×844）、橫向（844×390）各一輪：對話框第一次打開、選項出現（有的話）各截一張。每一張記：
    背景 #advBg 的圖是不是 gym_b1_fitness、畫面不是黑的（平均亮度）；立繪（#advL／#advR 裡的圖）的位置；
    臉（立繪上面 30%）有沒有被對話框（#dlg）或選項（#choices）蓋住——重疊面積寫下來，蓋到就 FAIL。
  立繪腳有沒有浮在器材上：看圖（BB 判）。Playwright ≠ iPhone 實機。
用法：LW_TESTS=<wt>/tests python3 cc_gymbg_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('gymbg', OUT); D.setup(R, OUT)
EV = 'ev_arcinv_heroine_04_3'
UI = r"""(()=>{ const rect=e=>{ if(!e) return null; const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05) return null; const r=e.getBoundingClientRect(); return r.width&&r.height?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null; };
  const dlg=document.getElementById('dlg'), ch=document.getElementById('choices'), bg=document.getElementById('advBg');
  const op=e=>{ let o=1; for(let p=e;p&&p!==document.body;p=p.parentElement){ const cs=getComputedStyle(p); o*=+cs.opacity; if(cs.visibility==='hidden'||cs.display==='none') return 0; } return +o.toFixed(2); };
  const ports=[...document.querySelectorAll('#advL img,#advR img,#advL,#advR')].map(e=>({id:e.id||e.parentElement&&e.parentElement.id, src:(e.currentSrc||e.src||getComputedStyle(e).backgroundImage||'').slice(-60), r:rect(e), op:op(e)})).filter(p=>p.r);
  const who=((document.getElementById('dlgName')||{}).textContent||'').trim();
  const bgImg=bg?(getComputedStyle(bg).backgroundImage||'')+((bg.querySelector&&bg.querySelector('img'))?bg.querySelector('img').src:''):'';
  return {dlg:dlg&&!dlg.classList.contains('hide')?rect(dlg):null, choices:ch&&!ch.classList.contains('hide')?rect(ch):null, text:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60),
    bg:bgImg.slice(-90), bgRect:rect(bg), ports, who, adv:typeof ADV!=='undefined'?!!ADV.active:null, vw:innerWidth, vh:innerHeight}; })()"""


def overlap(a, b):
    if not a or not b: return 0
    w = min(a[2], b[2]) - max(a[0], b[0]); h = min(a[3], b[3]) - max(a[1], b[1])
    return max(0, w) * max(0, h)


async def one(p, orient):
    landscape = orient == 'landscape'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await cc_det.install(pg, 20261107)
    await pg.goto(URL); ok = await L.wait_loaded(pg)
    tag = '[%s]' % orient
    if not R.check('%s 遊戲載入' % tag, ok, ''): await b.close(); return
    await pg.evaluate("localStorage.clear()")
    R.setup('%s 讀檔校園 2025-10-15 19:00；【捷徑】直接 EVENTS.run(%s)（不走手機約、行程、出發）' % (tag, EV))
    await D.load_zone(pg, cdp, 'campus', '2025-10-15', 19.0, wait=7000)
    has = await pg.evaluate("((id)=>!!(typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e&&e.id===id)))", EV)
    if not R.check('%s 這一版有 %s（ARCINV.install）' % (tag, EV), has, ''): await b.close(); return
    await pg.evaluate("((id)=>{ void EVENTS.run(STORY_EVENTS.find(e=>e&&e.id===id)); })", EV)
    shots = {}; t0 = time.time(); seen_dlg = 0
    while time.time() - t0 < 120:
        u = await pg.evaluate(UI)
        hasP = bool(u.get('who')) and any('portrait' in (pt.get('src') or '') and (pt.get('op') or 0) >= 0.95 for pt in u['ports'])   # 她說話（有名字）、立繪真的顯示（淡入完、不透明度 ≥ 0.95）
        if u['dlg'] and 'narr' not in shots and not hasP:
            m = await D.shot(pg, 'gymbg_%s_narr' % orient); shots['narr'] = dict(u, lum=m, ports=[])
        if u['dlg'] and 'dlg' not in shots and hasP:   # 她說話、立繪出來的第一句（BB 要看腳有沒有浮在器材上、臉有沒有被蓋）
            await pg.wait_for_timeout(1200); u = await pg.evaluate(UI)   # 打字效果跑一下
            u['ports'] = [pt for pt in u['ports'] if 'portrait' in (pt.get('src') or '') and (pt.get('op') or 0) >= 0.95]
            m = await D.shot(pg, 'gymbg_%s_dlg' % orient); shots['dlg'] = dict(u, lum=m)
        if u['choices'] and 'choices' not in shots:
            await pg.wait_for_timeout(500); u = await pg.evaluate(UI)
            m = await D.shot(pg, 'gymbg_%s_choices' % orient); shots['choices'] = dict(u, lum=m)
            await L.tap(pg, cdp, '#choices button:first-child'); await pg.wait_for_timeout(800); continue
        if u['choices']: await L.tap(pg, cdp, '#choices button:first-child'); await pg.wait_for_timeout(800); continue
        if u['dlg']:
            seen_dlg += 1
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if shots and not u['adv'] and not u['dlg']: break
        await pg.wait_for_timeout(400)
    R.note('%s 截圖時的畫面：%s' % (tag, J(shots)))
    for k, s_ in shots.items():
        R.check('%s %s：背景是 gym_b1_fitness' % (tag, k), 'gym_b1_fitness' in (s_.get('bg') or ''), J(s_.get('bg')))
        R.check('%s %s：不是黑畫面' % (tag, k), bool(s_.get('lum')) and not (s_['lum'][0] < 6 and s_['lum'][1] < 4), J(s_.get('lum')))
        for pt in s_.get('ports') or []:
            r = pt['r']; face = [r[0], r[1], r[2], r[1] + int((r[3] - r[1]) * 0.3)]
            ov = overlap(face, s_.get('dlg')) + overlap(face, s_.get('choices'))
            R.check('%s %s：立繪 %s 的臉（上面 30%%）沒有被對話框／選項蓋住（重疊 %d px²）' % (tag, k, pt['id'], ov), ov == 0, J({'face': face, 'dlg': s_.get('dlg'), 'choices': s_.get('choices')}))
    R.check('%s 她說話、立繪出來的那一張拍到了' % tag, 'dlg' in shots, J(list(shots)))
    if 'choices' not in shots: R.note('%s 這一場沒有選項（或沒等到）' % tag)
    R.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3]))
    await b.close()


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC GYMBG（陪子晴去健身房的對話畫面）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        for o in ('portrait', 'landscape'):
            print('== %s' % o, flush=True)
            try: await one(p, o)
            except Exception as ex: R.check('[%s] 探針沒有例外' % o, False, repr(ex)[:300])
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
