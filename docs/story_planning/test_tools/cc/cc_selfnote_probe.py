"""CC-B（帳號 B）11-07：試玩第 7 件重跑（BB-B 16:14；LAWWW-B f17a364f9，含在 43f878419）——自己讀書讀到的筆記要出現在「☰ → 法律」。
CASES：分號／加號分隔，每一筆「區域,日期,時,名字」（預設：總圖閱覽室 library 2025-08-30 14:00 → 咖啡廳 cafe 同一天 17:00，同一個瀏覽器接著做）。
每一筆：
  【前置／捷徑】讀檔進那個區域（條件事件關閉；第一筆讀檔、後面的照上一筆的進度讀檔換區域，筆記帶著）→ 找一張可以讀書的位子（it.study／deskStudy），
  【捷徑】把玩家放在 seatApproach 那一點（走路不是這一件要測的）→ 像玩家一樣點互動「坐下」→ 選「讀書」→ 選「兩小時」（有的話）→ 點完對話（記下每一句）→
  讀 G.notes 的 law_*（讀書前後比）→ ☰ → 法律：截圖（直向最上面＋「自己讀的筆記」那一段、橫向），記整頁文字。
看三件：① 有「自己讀的筆記」一段、列出剛剛讀到的條目 ② 不再寫「還沒上過課」 ③ 咖啡廳讀一次也會列（第二筆）。判定＝BB。
用法：LW_TESTS=<wt>/tests python3 cc_selfnote_probe.py <url> <out>"""
import os, sys, json, asyncio, re, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('selfnote', OUT); D.setup(R, OUT)
CASES = [x.split(',') for x in re.split(r'[;+]', os.environ.get('CASES') or 'library,2025-08-30,14,library+cafe,2025-08-30,17,cafe') if x.strip()]
PORT = {'width': 390, 'height': 844}; LAND = {'width': 844, 'height': 390}

STUDY_SEATS = r"""(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden&&(i.study||i.deskStudy)).map(i=>{ const ap=GAME.seatApproach?GAME.seatApproach(i):null; return {label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:i.lv||0, ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null}; }))()"""
NOTES = r"""(()=>{ const n=GAME.G.notes||{}; const out=[]; const add=(k,v)=>{ if(/^law_/.test(k)) out.push({k, title:(v&&(v.title||v.t))||null}); }; if(Array.isArray(n)) n.forEach(v=>v&&add(v.id||v.key||'',v)); else for(const k in n) add(k,n[k]); return out; })()"""
LEGAL_TEXT = r"""(()=>{ const e=document.getElementById('legalList'); return e?e.innerText:null; })()"""


async def choose(pg, cdp, prefs):
    """畫面上有選項時，照 prefs 的順序找第一個文字含有那個字的按鈕點下去；回傳點了哪一個（沒有就 None）"""
    bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.innerText.trim())")
    for p_ in prefs:
        for i, t in enumerate(bs):
            if p_ in t:
                await pg.evaluate("(i=>{ document.querySelectorAll('#choices button')[i].scrollIntoView({block:'center'}); })(%d)" % i)
                c = await pg.evaluate("(i=>{ const r=document.querySelectorAll('#choices button')[i].getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
                await L.touch_tap(cdp, c[0], c[1]); return t
    return None


async def study_here(pg, cdp, tag):
    seats = await pg.evaluate(STUDY_SEATS)
    R.note('%s 可以讀書的位子 %d 張：%s' % (tag, len(seats), J(seats[:6])))
    if not seats:
        its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>!i.hidden).map(i=>[i.label, i.seat?'seat':'', i.study?'study':'', i.shop||'']))()")
        R.note('%s 沒有 study 位子；這一區的互動：%s' % (tag, J(its)))
    if not R.check('%s 有可以讀書的位子' % tag, bool(seats), ''): return None
    lab = None
    for s in seats[:4]:   # 互動按鈕要剛好是這張位子（afar 第一張窗邊位的 seatApproach 離書架比較近，會變成「看看書架」）
        ap = s['ap'] or [s['x'], s['z']]
        await L.go_to(pg, cdp, R, ap[0], ap[1], 0.35, '%s 走到讀書位子 (%.2f,%.2f) 旁邊' % (tag, s['x'], s['z']), max_s=150)   # 真的走過去（直接放過去互動按鈕不會出來）
        await pg.wait_for_timeout(1200)
        lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
        if lab and s['label'] in lab: break
    R.note('%s 走到讀書位子 (%.2f,%.2f) 的 seatApproach (%.2f,%.2f)' % (tag, s['x'], s['z'], ap[0], ap[1]))
    R.note('%s 互動按鈕：%s' % (tag, lab))
    if not R.check('%s 互動按鈕是位子（「%s」）' % (tag, s['label']), bool(lab and s['label'] in lab), str(lab)): return None
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    picked = []; lines = []; t0 = time.time()
    while time.time() - t0 < 240:
        st = await L.state(pg)
        if st['choices']:
            c = await choose(pg, cdp, ['讀書', '兩小時', '2 小時', '二小時'] if not picked or picked[-1].startswith('讀書') else ['兩小時', '2 小時', '不用', '算了'])
            if c is None:
                c = await choose(pg, cdp, [st['choices'][0]]) if st['choices'] else None
            picked.append(c or '?'); R.note('%s 選項 %s → 點「%s」' % (tag, J(st['choices']), c)); await pg.wait_for_timeout(1200); continue
        if st['dlg']:
            if st['dtext'] and (not lines or lines[-1] != st['dtext']): lines.append(st['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800); continue
        if picked and not st['dlg'] and not st['choices']:
            await pg.wait_for_timeout(1500)
            st2 = await L.state(pg)
            if not st2['dlg'] and not st2['choices']: break
        else:
            await pg.wait_for_timeout(800)
    R.note('%s 讀書時的對話（%d 句）：%s' % (tag, len(lines), J(lines)))
    R.check('%s 選到「讀書」' % tag, any(p_ and '讀書' in p_ for p_ in picked), J(picked))
    return {'seat': s, 'picked': picked, 'lines': lines}


async def legal_page(pg, cdp, tag):
    if await pg.evaluate("document.getElementById('menu').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#menu .tabs button[data-tab="legal"]'); await pg.wait_for_timeout(1500)
    txt = await pg.evaluate(LEGAL_TEXT)
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(1800)
    await R.shot(pg, tag + '_legal_port_top')
    await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#legalList .item')].find(x=>/自己讀的筆記/.test(x.innerText)); if(e) e.scrollIntoView({block:'center'}); })()")
    await pg.wait_for_timeout(700); await R.shot(pg, tag + '_legal_port_selfnotes')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1800)
    await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#legalList .item')].find(x=>/自己讀的筆記/.test(x.innerText)); if(e) e.scrollIntoView({block:'center'}); })()")
    await pg.wait_for_timeout(700); await R.shot(pg, tag + '_legal_land')
    await L.close_panels(pg, cdp)
    return txt


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 自己讀的筆記（試玩第 7 件）：SHA=%s（worktree 實際 %s）；Playwright 手機模擬 ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            first = True
            for zone, day, h, nm in CASES:
                tag = '[%s]' % nm
                try:
                    if first or os.environ.get('FRESH') == '1':
                        R.setup('%s 【前置／捷徑】讀檔進 %s %s %s:00（條件事件關閉；法律系大一、還沒開學）' % (tag, zone, day, h))
                        s = await D.load_zone(pg, cdp, zone, day, float(h), wait=6000)
                    else:
                        R.setup('%s 【前置／捷徑】照上一筆讀完書的進度（筆記帶著）換到 %s、時間設 %s:00（GAME.enter）' % (tag, zone, h))
                        await pg.evaluate("(a=>{ GAME.G.hour=a.h; return GAME.enter?GAME.enter(a.z):null; })", {'z': zone, 'h': float(h)})
                        await D.wait_zone(pg, cdp, zone); await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
                        s = await D.st(pg)
                    first = False
                    if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): continue
                    before = await pg.evaluate(NOTES)
                    leg0 = await pg.evaluate(LEGAL_TEXT)
                    R.note('%s 讀書前法律頁有沒有「還沒上過課」：%s' % (tag, bool(leg0 and '還沒上過課' in leg0)))
                    st_ = await study_here(pg, cdp, tag)
                    after = await pg.evaluate(NOTES)
                    new = [n for n in after if n['k'] not in {x['k'] for x in before}]
                    R.note('%s 讀書前 law_* 筆記 %d 條、讀書後 %d 條，新的：%s' % (tag, len(before), len(after), J(new)))
                    txt = await legal_page(pg, cdp, nm)
                    R.note('%s ☰ → 法律 整頁文字：%s' % (tag, J(txt)))
                    has_sec = bool(txt and '自己讀的筆記' in txt)
                    listed = [n for n in after if n['title'] and txt and n['title'] in txt]
                    R.check('%s 讀書後多了 law_* 筆記' % tag, bool(new), J(new))
                    R.check('%s ① 法律頁有「自己讀的筆記」一段' % tag, has_sec, '')
                    R.check('%s ① 剛剛讀到的條目都列在法律頁' % tag, bool(new) and all(n['title'] and n['title'] in (txt or '') for n in new), J([n for n in new if not (n['title'] and n['title'] in (txt or ''))]))
                    R.check('%s ② 不再寫「還沒上過課」' % tag, bool(txt) and '還沒上過課' not in txt, '')
                    rec['cases'].append({'name': nm, 'zone': zone, 'study': st_, 'before': before, 'after': after, 'new': new, 'legal': txt})
                except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'selfnote.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
