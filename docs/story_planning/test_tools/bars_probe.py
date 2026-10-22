"""BB（帳號 A）2026-10-22：人物頁的友情、戀愛進度條（D14-T8／SYS-01；開發分支 d1b3d5f9 進度條、bba2d150 三句提示換成 AA 定的字）。
看什麼：手機「朋友」點進人物頁，友情、戀愛兩條只有長短、不寫數字；下面一句提示寫還差哪一種：
  A 以安：熟、信任都夠，自在不夠 → 友情那條寫「相處再自在一點」；戀愛那條「她還沒有那樣看你」。
  B 芷若：好朋友、她的戀愛 60、祐廷的戀愛 10 → 戀愛那條「你還沒有那樣看她」。
  C 語彤：朋友（不是好朋友）、她的戀愛 60、祐廷 40 → 戀愛那條「先成為好朋友」（最多畫到一半）。
  D 子晴：交往中 → 只寫「交往中」，沒有條。
  E 阿哲（男生朋友）：只有友情一條。
【前置】讀使用者存檔（9/25 週四），讀檔後在頁面裡設這幾個人的關係（SOCIAL.rel）、認識（FIRST_MET）、子晴 dating 旗標；quiet_events。手機橫向、直向各拍一次。
Playwright 手機模擬，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 bars_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
CASES = [('A', 'heroine_01', {'fam': 65, 'trust': 50, 'comf': 30, 'npcRom': 10, 'rom': 5}, {'友情': '相處再自在一點', '戀愛': '她還沒有那樣看你'}),
         ('B', 'heroine_02', {'fam': 65, 'trust': 50, 'comf': 45, 'npcRom': 60, 'rom': 10}, {'友情': None, '戀愛': '你還沒有那樣看她'}),
         ('C', 'heroine_03', {'fam': 45, 'trust': 30, 'comf': 10, 'npcRom': 60, 'rom': 40}, {'戀愛': '先成為好朋友'}),
         ('D', 'heroine_04', {'fam': 70, 'trust': 60, 'comf': 60, 'npcRom': 70, 'rom': 60}, 'dating'),
         ('E', 'zhe', {'fam': 30, 'trust': 5, 'comf': 5}, 'male')]
SET = """(([id,v,dating])=>{ const R=SOCIAL.rel(id); Object.assign(R,v); SOCIAL.remember(id,'FIRST_MET',''); const G=GAME.G; G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-10;
  if(dating) G.flags['dating_'+id]=true; return {stage:SOCIAL.stage(id), p:DATE.progress(G,id)}; })"""
READ = """(()=>{ const B=document.getElementById('phoneBody'); if(!B) return null; const bars=[...B.querySelectorAll('.relbar')].map(e=>{ const fill=e.querySelector('div>div'); return {label:e.dataset.bar, text:e.innerText.replace(/\\n/g,'｜'), w:fill?fill.style.width:null}; });
  return {bars, dating:B.innerText.includes('交往中'), text:B.innerText.replace(/\\n/g,'｜').slice(0,500)}; })()"""


async def tapq(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()" % js)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return True


async def one(p, run, base, landscape, out):
    tag = 'land' if landscape else 'port'; res = out.setdefault(tag, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        st = json.loads(json.dumps(base)); G = st.get('G', st)
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000)
        run.setup('[前置] %s：使用者存檔（9/25）；讀檔後設以安、芷若、語彤、子晴（交往中）、阿哲的關係數值；quiet_events' % tag)
        for cid, pid, v, exp in CASES:
            r = await pg.evaluate(SET + "(%s)" % json.dumps([pid, v, exp == 'dating'])); res.setdefault('set', {})[cid] = r
        for cid, pid, v, exp in CASES:
            await L.phone_away(pg, cdp)
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
            ok = await tapq(pg, cdp, "document.querySelector('#phoneBody [data-person=\"%s\"]')" % pid)
            if not ok:
                run.check('%s %s：手機「朋友」點得到 %s 的人物頁' % (tag, cid, pid), False, (await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').slice(0,200)"))); continue
            r = await pg.evaluate(READ); res[cid] = r; await run.shot(pg, '%s_%s_%s' % (tag, cid, pid))
            say('   %s %s %s：%s' % (tag, cid, pid, json.dumps(r['bars'], ensure_ascii=False)))
            nodigit = all(not re.search(r'[0-9０-９%％]', x['text']) for x in r['bars'])
            if exp == 'dating':
                run.check('%s D 子晴（交往中）：只寫「交往中」、沒有進度條' % tag, r['dating'] and not r['bars'], json.dumps(r, ensure_ascii=False)[:300])
            elif exp == 'male':
                run.check('%s E 阿哲：只有友情一條、沒有戀愛那條、不寫數字' % tag, [x['label'] for x in r['bars']] == ['友情'] and nodigit, json.dumps(r['bars'], ensure_ascii=False))
            else:
                run.check('%s %s：兩條都只有長短、不寫數字' % (tag, cid), bool(r['bars']) and nodigit and all(x['w'] for x in r['bars']), json.dumps(r['bars'], ensure_ascii=False))
                for lab, hint in exp.items():
                    bar = next((x for x in r['bars'] if x['label'] == lab), None)
                    if hint is None: run.check('%s %s：%s那條滿了、沒有提示' % (tag, cid, lab), bool(bar) and bar['w'] == '100%' and bar['text'] == lab, json.dumps(bar, ensure_ascii=False)); continue
                    run.check('%s %s：%s那條的提示＝「%s」' % (tag, cid, lab, hint), bool(bar) and hint in bar['text'], json.dumps(bar, ensure_ascii=False))
                if cid == 'C':
                    bar = next((x for x in r['bars'] if x['label'] == '戀愛'), None)
                    run.check('%s C：「先成為好朋友」那條最多畫到一半' % tag, bool(bar) and bar['w'] and float(bar['w'].rstrip('%')) <= 50, json.dumps(bar, ensure_ascii=False))
            await L.phone_away(pg, cdp)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def main():
    run = L.Run('bars', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for land in (True, False):
            say('== %s' % ('橫向' if land else '直向')); await one(p, run, base, land, out)
            json.dump(out, open(os.path.join(OUT, 'bars.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
