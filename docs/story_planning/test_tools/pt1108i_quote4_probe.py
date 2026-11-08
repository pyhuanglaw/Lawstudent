"""BB-B 2026-11-08：TEXT-QUOTE-UNIFY-1108 第四批（LAWWW-B 976e1dffa）瀏覽器抽查——閒聊、法律系同學 pool、不熟同學招呼，畫面上有名字的那一句外面沒有「」；舊存檔不重講。
看「畫面上實際顯示的字」（對話框 #dlg 的 DOM），不是只看程式傳進去的字串。
  yian ：和以安閒聊兩次（走到她旁邊、按「和以安說話」）。
  pool ：舊存檔（使用者 day46，12 句「說過了」還是有「」的寫法）讀進來：G.social.small 的 used／last／once 換成沒有「」的；
         和 pool_1（兩句推理小說都說過了）聊兩次：不重講那兩句、外面沒有「」。
  greet：還沒認識的法律系同學（pool）打招呼。
[前置] 讀使用者存檔 day46；【捷徑】那個人今天不在＝把時間撥到他在的時候、讀檔到那一區（STORY.whereIs）。之後走路、按鍵、點對話都是觸控。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests MODE=all|yian|pool|greet python3 pt1108i_quote4_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, copy, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
import pt1108f_quote3_probe as Q   # DLG_WATCH、full_lines
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'all')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
unq = lambda t: t[1:-1] if isinstance(t, str) and len(t) >= 2 and t[0] == '「' and t[-1] == '」' else t


async def goto_person(pg, cdp, run, cid, hours=None):
    """那個人現在在哪；不在就撥時間（先往後、再從 8:00），讀檔到那一區，等他出現"""
    w = await pg.evaluate("id=>STORY.whereIs(GAME,id)||null", cid)
    if not (w and w.get('zone') and not w.get('away')):
        h = await pg.evaluate("([id,hs])=>{ const h0=GAME.G.hour; const ok=h=>{ GAME.G.hour=h; const r=STORY.whereIs(GAME,id); return r&&r.zone&&!r.away; }; for(const h of (hs||[])) if(ok(h)) return h; for(let h=Math.ceil(h0*2)/2; h<21; h+=0.5) if(ok(h)) return h; for(let h=8; h<h0; h+=0.5) if(ok(h)) return h; GAME.G.hour=h0; return null; }", [cid, hours or []])
        w = await pg.evaluate("id=>STORY.whereIs(GAME,id)||null", cid)
        run.setup('【捷徑】%s 現在不在：時間撥到 %s（同一天）→ %s' % (cid, h, J(w)))
    if not (w and w.get('zone')): return None
    if await pg.evaluate("(GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id)") != w['zone']:
        s = await pg.evaluate("z=>{ const s=JSON.parse(JSON.stringify(GAME.snapshot())); s.zone=z; s.pos=null; return s; }", w['zone'])
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        await pg.evaluate(Q.DLG_WATCH)
        run.setup('【捷徑】讀檔到 %s（同一份進度）' % w['zone'])
    pr = await P.wait_present(pg, cid, 90)
    run.note('%s 在 %s' % (cid, J(pr)))
    return pr


async def chat(pg, cdp, run, cid, tag):
    await pg.evaluate("window.__DW.length=0")
    r = await P.talk_to(pg, cdp, run, cid, tag, picks=('聊天', '聊聊', '閒聊'))
    lines = Q.full_lines(await pg.evaluate("window.__DW.slice()"))
    await run.shot(pg, tag)
    return r, lines


def judge_named(run, tag, lines):
    named = [x for x in lines if x['n']]
    bad = [x for x in named if x['t'].startswith('「') and x['t'].endswith('」')]
    run.check('%s：有名字的那幾句外面沒有「」（%d 句）' % (tag, len(named)), named and not bad, J({'bad': bad, 'named': named}))
    return named


async def main():
    run = L.Run('pt1108i_quote4_' + MODE, OUT)
    raw = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    G0 = raw.get('G', raw)
    modes = ['yian', 'pool', 'greet'] if MODE == 'all' else [MODE]
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        if 'pool' in modes:
            old = (((G0.get('social') or {}).get('small') or {}).get('pool_1') or {})
            oldq = [u for u in old.get('used') or [] if isinstance(u, str) and u.startswith('「')]
            run.setup('[前置] 使用者存檔 day46 原樣讀進來：pool_1 說過的 %d 句是有「」的舊寫法 %s' % (len(oldq), J(oldq)))
            s = copy.deepcopy(G0); s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']; s.setdefault('home', {})['at'] = False
            await P.load(pg, cdp, s, quiet=True); await P.init(pg); await pg.evaluate(Q.DLG_WATCH)
            mig = await pg.evaluate("(()=>{ const R=(GAME.G.social||{}).small||{}; const q=[]; for(const [id,v] of Object.entries(R)){ for(const u of (v.used||[])) if(typeof u==='string'&&u[0]==='「') q.push([id,'used',u]); if(typeof v.last==='string'&&v.last[0]==='「') q.push([id,'last',v.last]); for(const k of Object.keys(v.once||{})) if(k[0]==='「') q.push([id,'once',k]); } return {q, p1:R.pool_1||null}; })()")
            run.check('[pool] 讀檔以後「說過了」的紀錄沒有「」的舊寫法了（smallQuoteMigrate）', not mig['q'] and mig['p1'] and all(not u.startswith('「') for u in (mig['p1'].get('used') or [])), J(mig))
            said = []
            if await goto_person(pg, cdp, run, 'pool_1'):
                for i in range(2):
                    r, lines = await chat(pg, cdp, run, 'pool_1', 'pool_1_%d' % (i + 1))
                    named = judge_named(run, '[pool] pool_1 第 %d 次' % (i + 1), lines)
                    said += [x['t'] for x in named]
                rep = [t for t in said if t in [unq(u) for u in oldq]]
                run.check('[pool] pool_1 兩次都沒有重講存檔裡說過的那兩句', said and not rep, J({'said': said, 'old': [unq(u) for u in oldq]}))
            else:
                run.check('[pool] 找得到 pool_1', False)
        if 'yian' in modes:
            s, d = await P.base(pg, G0, '2026-10-14', 12.5, 'campus')
            s.setdefault('home', {})['at'] = False
            await P.load(pg, cdp, s, quiet=True); await P.init(pg); await pg.evaluate(Q.DLG_WATCH)
            run.setup('[前置] day46 存檔改到 %s 12:30 校園' % d['key'])
            if await goto_person(pg, cdp, run, 'heroine_01', hours=[12.5, 15.5, 17, 10]):
                for i in range(2):
                    r, lines = await chat(pg, cdp, run, 'heroine_01', 'yian_%d' % (i + 1))
                    judge_named(run, '[yian] 和以安說話第 %d 次' % (i + 1), lines)
            else:
                run.check('[yian] 找得到以安', False)
        if 'greet' in modes:
            s = copy.deepcopy(G0); s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']; s.setdefault('home', {})['at'] = False
            s.update(hour=10.5)
            await P.load(pg, cdp, s, quiet=True); await P.init(pg); await pg.evaluate(Q.DLG_WATCH)
            cand = await pg.evaluate("(()=>{ const out=[]; for(let i=1;i<=24;i++){ const id='pool_'+i; if(typeof CHARACTERS!=='undefined'&&!CHARACTERS[id]) continue; if(SOCIAL.has(id,'FIRST_MET')) continue; out.push(id); } return out; })()")
            run.setup('[前置] day46 存檔 10:30；還沒認識的 pool：%s' % J(cand))
            done = False
            for cid in cand[:4]:
                if await goto_person(pg, cdp, run, cid):
                    r, lines = await chat(pg, cdp, run, cid, 'greet_' + cid)
                    if lines:
                        judge_named(run, '[greet] 還沒認識的 %s 打招呼' % cid, lines); done = True; break
            if not done: run.check('[greet] 找得到一位還沒認識、在場的 pool 同學並打到招呼', False, J(cand))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
