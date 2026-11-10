"""CC（帳號 A）11-10：OUTING_GATE（BB 16:46；使用者 16:2x 選擇題「戀愛條過一半就能約出去玩」；LAWWW 200dad724：DATE.canAskCore 她的戀愛 ≥15 就能約、冷淡期照舊不行）。
新 06e779533、舊 aa691df33（D34：戀愛 15 舊版灰、新版亮）。
同一位女主（WHO，預設 heroine_01 以安）、同一份存檔（fixtures/user_saves_1107/fatiao3d_save_day46.json，已在 repo），【前置／捷徑】只改她的戀愛值（SOCIAL rel npcRom）＋冷淡期旗標：
  R14   戀愛 14 → 手機「朋友」→ 她 →「出去玩…」要灰掉，小字記原文（要是「還沒熟到可以兩個人出去」那類，不能再出現「她還沒有那樣看你」）
  R15   戀愛 15 →「出去玩…」要亮 → 選第一個地點、今天第一個能選的時間 → 約到底：記答覆、真的出發（手機「今天」的「現在過去」或走過去）、到達目的地（區域換了）、walkFallbacks
  COOL  戀愛 15＋冷淡期（G.flags.V6EX.cool[她]＝{from 昨天, until 30 天後}）→ 要灰掉
每一項截邀約畫面（usout_<TAG>_<case>.png）。其他全部觸控（手機按鈕、選項）。Playwright（PC GPU）≠ iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old [WHO=heroine_01] [CASES=R14,R15,COOL] python3 cc_outing_gate_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; WHO = os.environ.get('WHO') or 'heroine_01'; pe.WHO = WHO
CASES = (os.environ.get('CASES') or 'R14,NF,R15,COOL').split(',')   # NF（BB 16:55）：還不是朋友（熟悉 10）
R = L.Run('outing_gate_' + TAG, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')


def state(rom, cool, notfriend=False):
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    s['hour'] = 10.0; s['invites'] = []; s['money'] = 3000
    soc = copy.deepcopy(s.get('social') or {}); r = soc.setdefault('rel', {}).setdefault(WHO, {}); r['npcRom'] = rom
    if notfriend: r.update(fam=10, trust=0, comf=0)
    s['social'] = soc
    f = dict(s.get('flags') or {}); f.pop('dating_' + WHO, None)
    v6 = copy.deepcopy(f.get('V6EX') or {})
    if cool: v6.setdefault('cool', {})[WHO] = {'from': s['day'] - 1, 'until': s['day'] + 30, 'n': {}}
    elif v6.get('cool'): v6['cool'].pop(WHO, None)
    f['V6EX'] = v6; s['flags'] = f
    return s


async def open_top(pg, cdp):
    await pe.phone(pg, cdp, 'friends')
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % WHO): return None
    await pg.wait_for_timeout(1500)
    return await pe.opts(pg)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC OUTING_GATE：worktree %s；TAG %s；WHO %s；Playwright ≠ iPhone' % (real or '?', TAG, WHO), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for case in CASES:
            rom, cool = {'R14': (14, False), 'NF': (14, False), 'R15': (15, False), 'COOL': (15, True)}[case]
            await L.load_state(pg, state(rom, cool, case == 'NF'), quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30)
            R.setup('【前置／捷徑】day46 存檔、10:00、清邀約；%s 的戀愛 npcRom＝%d%s；拿掉 dating_%s' % (WHO, rom, '＋冷淡期（V6EX.cool：昨天起 30 天）' if cool else '', WHO))
            info = await pg.evaluate("(w=>({rom:(SOCIAL.rel(w)||{}).npcRom, lvl:SOCIAL.friendLevel?SOCIAL.friendLevel(w):null, stage:DATE.stageNum?DATE.stageNum(w):null, cap:(typeof INV!=='undefined'&&INV.capStage)?INV.capStage(GAME.G,w,DATE.stageNum(w)):null, ask:DATE.canAsk?DATE.canAsk(GAME.G,w):null, half:DATE.ASK_ROM_HALF}))(%s)" % J(WHO))
            R.note('[%s] 狀態：%s' % (case, J(info)))
            hint = await pg.evaluate("(w=>{ try{ const q=DATE.progress(GAME.G,w); return q&&q.rom?q.rom.hint:null; }catch(e){ return 'ERR '+e; } })(%s)" % J(WHO))
            R.note('[%s] 人物頁戀愛條提示：%s' % (case, hint))
            if case == 'R15': R.check('[R15] 人物頁過一半寫「她好像開始在意你了」', hint == '她好像開始在意你了', str(hint))
            if hint and '她還沒有那樣看你' in hint: R.check('[%s] 人物頁不能寫「她還沒有那樣看你」' % case, False, hint)
            top = await open_top(pg, cdp)
            await pg.screenshot(path=os.path.join(OUT, 'usout_%s_%s.png' % (TAG, case)))
            out = next((x for x in (top or []) if x['t'].startswith('出去玩')), None)
            R.note('[%s] 邀約第一層：%s' % (case, J(top)))
            if not R.check('[%s] 邀約選單有「出去玩…」' % case, bool(out), J(top)): await pe.close_phone(pg, cdp); continue
            bad = '她還沒有那樣看你' in out['t']
            WANT = {'R14': '你們現在是朋友。再多相處一陣子。', 'NF': '你們還沒那麼熟。'}   # AA 稿 08543d6fd（BB 16:55）
            if case in WANT: R.check('[%s] 說明字是 AA 的稿「%s」（原文：%s）' % (case, WANT[case], out['t']), WANT[case] in out['t'], J(out))
            if case in ('R14', 'NF', 'COOL'):
                R.check('[%s] 「出去玩…」灰掉' % case, out['dim'], J(out))
                R.check('[%s] 說明不是「她還沒有那樣看你」（原文：%s）' % (case, out['t']), not bad, J(out))
                await pe.close_phone(pg, cdp); continue
            # R15：要亮、約到底
            if not R.check('[R15] 「出去玩…」是亮的（可以選）', not out['dim'], J(out)): await pe.close_phone(pg, cdp); continue
            await pe.choose(pg, cdp, '出去玩', True); lv2 = await pe.opts(pg); R.note('[R15] 出去玩第二層：%s' % J(lv2))
            await pg.screenshot(path=os.path.join(OUT, 'usout_%s_R15_places.png' % TAG))
            picked = []; z0 = await pg.evaluate("GAME.G.zone"); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
            for _ in range(6):   # 一層一層選第一個亮的（地點分類 → 地點 → 日期／時間），優先「今天」
                o = await pe.opts(pg)
                if not o: break
                c = next((x for x in o if not x['dim'] and x['t'].startswith('今天')), None) or next((x for x in o if not x['dim'] and not any(w in x['t'] for w in ('返回', '算了', '不約', '取消', '先不要'))), None)
                if not c: R.note('[R15] 沒有能選的：%s' % J(o)); break
                picked.append(c['t']); await pe.choose(pg, cdp, c['t'], True); await pg.wait_for_timeout(1200)
            R.note('[R15] 一路選了：%s' % J(picked))
            log = []; await pe.settle(pg, cdp, log, 30)
            iv = await pg.evaluate("(w=>{ const G=GAME.G; const D=(G.dates||G.dateLog||[]); const v=(G.invites||[]).filter(x=>x.who===w).slice(-1)[0]||null; return {inv:v, dateFlags:Object.keys(G.flags||{}).filter(k=>/^DATE_|date/i.test(k)).slice(0,8)}; })(%s)" % J(WHO))
            R.note('[R15] 約好以後：%s；對話 %s' % (J(iv), J(log[-6:])))
            R.check('[R15] 約成了（有她的邀約或約會紀錄）', bool(iv['inv']) or any('好' in t for t in log), J({'iv': iv, 'log': log[-4:]}))
            # r2：出去玩（DATE）是出發前 60 分鐘問「現在出發／到時間再說」——【捷徑】時間撥到出發前 65 分鐘，等那一題、選「現在出發」
            import re as _re
            m_ = _re.search(r'(\d{1,2}):(\d{2}) 出發', ' '.join(picked))
            if m_:
                hh = int(m_.group(1)) + int(m_.group(2)) / 60
                R.setup('[R15]【捷徑】時間撥到出發（%.2f）前 65 分鐘' % hh); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%f)" % (hh - 65 / 60)); await pg.wait_for_timeout(1500)
            went = None
            if iv['inv']:
                v = iv['inv']
                if v.get('h') is not None and v.get('day') == await pg.evaluate("GAME.G.day"):
                    R.setup('[R15]【捷徑】時間撥到約好的 %.2f 前 10 分鐘' % v['h']); await pg.evaluate("(h=>{ GAME.G.hour=h; })(%f)" % (v['h'] - 1 / 6)); await pg.wait_for_timeout(1200)
                await pe.phone(pg, cdp, 'today')
                went = await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % v.get('id'))
                if not went: await pe.close_phone(pg, cdp)
            zs = [z0]; t0 = time.time()
            while time.time() - t0 < 360:
                q = await L.state(pg)
                if q['choices']:
                    o = await pe.opts(pg); c_ = next((x for x in o if '現在出發' in x['t']), o[0]); R.note('[R15] 選單 %s → %s' % (J([x['t'] for x in o]), c_['t'])); await pe.choose(pg, cdp, c_['t'], True); continue
                if q['dlg']: await L.tap(pg, cdp, '#dlg')
                z = await pg.evaluate("GAME.G.zone")
                if z != zs[-1]: zs.append(z); await pg.screenshot(path=os.path.join(OUT, 'usout_%s_R15_zone%d.png' % (TAG, len(zs))))
                if len(zs) >= 2 and not q['dlg'] and not q['busy'] and time.time() - t0 > 20: break
                await pg.wait_for_timeout(600)
            fb = await pg.evaluate("GAME.walkFallbacks|0")
            R.note('[R15] 區域變化：%s；「現在過去」%s' % (J(zs), went))
            R.check('[R15] 真的出發、到了目的地（區域換了）', len(zs) >= 2, J(zs))
            R.check('[R15] walkFallbacks 沒有增加（%d → %d）' % (fb0, fb), fb == fb0, '')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
