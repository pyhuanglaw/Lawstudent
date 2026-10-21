"""BB（帳號 A）2026-10-21：KX-EXPR（可昕立繪表情跟著句子換，X62）——qa_play nophone 量到 125 句裡約 27 句顯示的表情和劇本不一樣，查是真的 bug 還是量法問題。
懷疑的原因（讀程式碼）：events3d.js 每句先叫 ADV.speaker(id, l.expression)，接著 GM.say 又叫一次 ADV.speaker(id, undefined)；
  第二次沒帶表情＝用 ADV.slots 記的表情，但 adv3d.js 的 render 是 async、await 載圖之後才更新 ADV.slots → 第二次拿到上一句（或更早）的舊表情，
  兩次 render 的 setTimeout 120 ms 換圖照順序套用，後面那次（舊表情）蓋掉前面那次（新表情）。
做法：讀 nophone 那一輪的經濟系狀態（10/31），照順序跑四場可昕的劇情（[捷徑] void EVENTS.run）；每句停 2 秒（像人在讀）再讀台上的圖，和劇本 expression 比；
  A＝遊戲原樣；B＝同一個頁面先套「同一個人、同一瞬間第二次沒帶表情的 ADV.speaker 不再 render」的暫時修正（只在測試頁裡，不改遊戲檔），看不一樣的句子會不會消失。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 kx_expr_probe.py '<URL>/index.html?turbo' <輸出資料夾> <狀態.json> <開發分支根目錄>"""
import os, sys, json, re, glob, asyncio, time, collections
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SNAPF, ROOT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
EVS = os.environ.get('EVS', 'ev_y0_e14,ev_y0_e26,ev_y0_kh3,ev_y0_kh_madeup').split(',')
WAIT = int(os.environ.get('WAIT', '2000'))
PATCH = """(()=>{ if(window.__KXP) return; window.__KXP=1; const sp=ADV.speaker; let last=null;
  ADV.speaker=function(c,e,o){ const now=performance.now(); if(e===undefined&&c&&last&&last.c===c&&now-last.t<80) return; last={c,t:now}; return sp.apply(this,arguments); }; })()"""
READ = """(()=>{ const out={}; for(const s of ['left','right']){ const box=s==='left'?ADV.L:ADV.R; const im=box&&box.querySelector('img'); const sl=(ADV.slots||{})[s];
  out[s]={char:sl?sl.charId:null, slotExpr:sl?sl.expression:null, img:im?(im.src.split('/portraits/')[1]||im.src).replace(/\\?.*$/,''):'', show:!!box&&box.classList.contains('show'), dim:!!box&&box.classList.contains('dim'), op:im?im.style.opacity:''}; }
  return {name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').trim(), slots:out, adv:!!ADV.active, ev:EVENTS.running||null}; })()"""


def script_map(root):
    src = ''.join(open(f, encoding='utf-8').read() for f in glob.glob(root + '/src/**/*.js', recursive=True))
    m = collections.defaultdict(set)
    for x in re.finditer(r"\{[^{}]*?speaker:'kexin'[^{}]*?\}", src):
        o = x.group(0); t = re.search(r"text:'((?:[^'\\]|\\.)*)'", o); e = re.search(r"expression:'(\w+)'", o)
        if t: m[t.group(1)].add(e.group(1) if e else None)
    return m


async def settle(pg, cdp, secs=90):
    """遊戲同時只演一個劇情（EVENTS.running）：先把畫面上別的劇情點完、等空下來（2026-10-21 第一次跑：宿舍的日常劇情佔著，EVENTS.run 直接被忽略）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        st = await pg.evaluate("({ev:EVENTS.running||null, adv:!!(typeof ADV!=='undefined'&&ADV.active)})")
        s = await L.state(pg)
        if not st['ev'] and not st['adv'] and not s['dlg'] and not s['choices']: return True
        if s['choices']:
            c = await pg.evaluate("(()=>{ const e=document.querySelectorAll('#choices button')[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(800)
    return False


async def play(pg, cdp, run, evid, pick, tag):
    rows = []
    for k in range(3):
        ok = await settle(pg, cdp); await pg.evaluate("(()=>{ try{ STORY.phoneAuto=()=>{}; }catch(e){} })()")
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id===%s))" % json.dumps(evid)); await pg.wait_for_timeout(1500)
        if await pg.evaluate("EVENTS.running===%s" % json.dumps(evid)): break
        print('   %s 沒開始（EVENTS.running=%s，空下來=%s），再試一次' % (evid, await pg.evaluate("EVENTS.running||null"), ok), flush=True)
    else:
        print('   ⚠ %s 三次都沒開始' % evid, flush=True); return rows
    t0 = time.time(); idle = 0; last = None
    while time.time() - t0 < 600:
        s = await L.state(pg)
        if s['choices']:
            o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            k = min(pick, len(o) - 1); rows.append({'choice': o, 'pick': k})
            c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); idle = 0; continue
        if s['dlg']:
            cur = s['dtext']
            if cur != last:
                last = cur; await pg.wait_for_timeout(WAIT); r = await pg.evaluate(READ); r['want_ev'] = evid; rows.append(r)
                if len(rows) % 6 == 0: await run.shot(pg, '%s_%s_%02d' % (tag, evid, len(rows)))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); idle = 0; continue
        idle += 1
        if idle > 4 and not await pg.evaluate("EVENTS.running===%s" % json.dumps(evid)): break   # 這一場演完了（不等別的劇情）
        await pg.wait_for_timeout(700)
    return rows


def judge(rows, sm):
    ok = bad = unk = 0; out = []
    for r in rows:
        if 'slots' not in r or r['name'] not in ('可昕', '杜可昕') or r.get('ev') != r.get('want_ev'): continue   # 只算這一場（ev＝當時 EVENTS.running）
        box = next((v for v in r['slots'].values() if v['char'] == 'kexin'), None)
        if not box or not box['img']: unk += 1; continue
        sc = sm.get(r['text']); shown = box['img'].split('/')[-1][:-5]
        if not sc or None in sc: unk += 1; continue
        if shown in sc: ok += 1
        else: bad += 1; out.append({'text': r['text'][:30], 'script': sorted(sc), 'shown': shown, 'slotExpr': box['slotExpr']})
    return ok, bad, unk, out


async def main():
    run = L.Run('kx_expr', OUT); sm = script_map(ROOT); G = json.load(open(SNAPF, encoding='utf-8')); res = {}
    async with async_playwright() as p:
        for mode in ('A_原樣', 'B_暫時修正'):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
            await L.load_state(pg, G.get('G', G), quiet_events=True); await pg.wait_for_timeout(6000)
            run.setup('[前置] %s：讀 qa_play nophone 存的經濟系狀態（%s）；[捷徑] 用 EVENTS.run 依序演 %s' % (mode, os.path.basename(SNAPF), ','.join(EVS)))
            if mode.startswith('B'): await pg.evaluate(PATCH)
            allrows = []
            for ev in EVS:
                rows = await play(pg, cdp, run, ev, 0, mode[:1]); allrows += rows
                ok, bad, unk, out = judge(rows, sm)
                print('%s %s：可昕 %d 句對、%d 句不對、%d 句沒得比' % (mode, ev, ok, bad, unk), flush=True)
                for x in out: print('     ✗', json.dumps(x, ensure_ascii=False), flush=True)
            ok, bad, unk, out = judge(allrows, sm); res[mode] = {'ok': ok, 'bad': bad, 'unk': unk, 'bad_rows': out, 'rows': allrows}
            run.check('%s：每句停 %.1f 秒後，可昕的立繪和劇本的表情一樣（%d 對／%d 不對）' % (mode, WAIT / 1000, ok, bad), bad == 0, json.dumps(out[:6], ensure_ascii=False)[:600])
            run.check('%s：沒有 JS 例外' % mode, not errs, json.dumps(errs[:3], ensure_ascii=False))
            await b.close()
        json.dump(res, open(os.path.join(OUT, 'kx_expr.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
